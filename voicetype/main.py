import rumps
import os
import sys
import threading
import subprocess
from voicetype.audio_recorder import AudioRecorder
from voicetype.transcriber import Transcriber
from voicetype.text_injector import TextInjector
from voicetype.ai_enhancer import AIEnhancer
from voicetype.hotkey_listener import HotkeyListener
from voicetype.settings import load_config, save_config
from voicetype.ui.web_ui import start_web_ui, add_to_history, set_recording, set_processing
from voicetype.ui.floating_bar import show_recording_bar, show_processing_bar, show_idle_bar, set_click_callback, set_stop_callback, set_settings_callback
from voicetype.ui.dashboard_window import show_dashboard
from voicetype.ui.review_window import show_review
from voicetype.ui.settings_usage_window import update_usage_stats


def check_accessibility_permission():
    """Check if we have Accessibility permissions and prompt if not"""
    try:
        from ApplicationServices import AXIsProcessTrusted
        if not AXIsProcessTrusted():
            # Prompt for permission
            from ApplicationServices import AXIsProcessTrustedWithOptions
            from Foundation import NSDictionary
            options = NSDictionary.dictionaryWithObject_forKey_(True, "AXTrustedCheckOptionPrompt")
            AXIsProcessTrustedWithOptions(options)
            return False
        return True
    except Exception as e:
        print(f"Could not check Accessibility: {e}")
        # Try alternative method - open System Settings directly
        subprocess.run([
            'open', 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
        ])
        return False


def get_resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    if hasattr(sys, '_MEIPASS'):
        # Running in PyInstaller bundle
        return os.path.join(sys._MEIPASS, "voicetype", relative_path)
    # Running in development
    return os.path.join(os.path.dirname(__file__), relative_path)


# Queue for main thread tasks
_pending_actions = []
_pending_review_data = None


class VoiceTypeApp(rumps.App):
    def __init__(self):
        self.icon_idle = get_resource_path(os.path.join("assets", "icon_idle.png"))
        self.icon_recording = get_resource_path(os.path.join("assets", "icon_recording.png"))
        self.icon_processing = get_resource_path(os.path.join("assets", "icon_processing.png"))

        super(VoiceTypeApp, self).__init__("Codiris Voice", icon=self.icon_idle, template=False)
        self.config = load_config()

        self.recorder = AudioRecorder()
        # Get transcription model from config (default to gpt4o)
        transcription_model = self.config.get("transcription_model", "gpt4o")
        self.transcriber = Transcriber(self.config["api_key"], model=transcription_model)
        self.injector = TextInjector()
        self.enhancer = AIEnhancer(self.config["api_key"])

        self.is_recording = False
        self.is_processing = False

        # Initialize floating bar (only once)
        show_idle_bar()  # This also initializes the bar

        # Set up click callbacks for floating bar
        set_click_callback(self._on_bar_click)
        set_stop_callback(self._on_stop_click)
        set_settings_callback(self._on_settings_click)

        # Setup mode menu
        self.mode_menu = rumps.MenuItem("Transcription Mode")
        self.modes = ["Raw", "Clean", "Format", "Email", "Code", "Notes"]
        self.mode_items = {}
        for mode in self.modes:
            item = rumps.MenuItem(mode, callback=self.change_mode)
            item.state = (mode == self.config["mode"])
            self.mode_items[mode] = item
            self.mode_menu.add(item)

        self.local_toggle = rumps.MenuItem("Local Processing (Beta)", callback=self.toggle_local)
        self.local_toggle.state = self.config.get("local_processing", False)

        self.clipboard_toggle = rumps.MenuItem("Copy to Clipboard", callback=self.toggle_clipboard)
        self.clipboard_toggle.state = self.config.get("clipboard_mode", False)

        self.menu = [
            rumps.MenuItem("Status: Idle", callback=None),
            None,
            rumps.MenuItem("Open Codiris Voice", callback=self.open_main_window),
            rumps.MenuItem("Settings & Usage", callback=self.open_settings),
            None,
            self.mode_menu,
            self.local_toggle,
            self.clipboard_toggle,
            None
        ]

        # Start hotkey listener - callbacks will set flags that timer checks
        self.hotkey_listener = HotkeyListener(
            self.config["hotkey"],
            self._queue_press,
            self._queue_release
        )
        self.hotkey_listener.start()

        # Timer to check for pending hotkey events (runs on main thread)
        self.timer = rumps.Timer(self._check_pending, 0.05)
        self.timer.start()

    def _queue_press(self):
        print("[Main] Hotkey PRESS detected, queueing action")
        _pending_actions.append("press")

    def _queue_release(self):
        print("[Main] Hotkey RELEASE detected, queueing action")
        _pending_actions.append("release")

    def _on_bar_click(self):
        """Called when floating bar is clicked - toggle recording"""
        _pending_actions.append("toggle")

    def _on_stop_click(self):
        """Called when stop button is clicked"""
        _pending_actions.append("stop")

    def _on_settings_click(self):
        """Called when settings is clicked from floating bar menu"""
        _pending_actions.append("settings")

    def _check_pending(self, _):
        global _pending_actions, _pending_review_data
        while _pending_actions:
            action = _pending_actions.pop(0)
            try:
                if action == "press":
                    self.on_hotkey_press()
                elif action == "release":
                    self.on_hotkey_release()
                elif action == "toggle":
                    self._toggle_recording()
                elif action == "stop":
                    self._stop_recording()
                elif action == "settings":
                    show_dashboard()
                elif action == "show_review":
                    if _pending_review_data:
                        show_review(**_pending_review_data)
                        _pending_review_data = None
                elif action == "finalize":
                    self._finalize_ui()
            except Exception as e:
                print(f"Error in pending action: {e}")

    def _toggle_recording(self):
        """Toggle recording on/off when bar is clicked"""
        if self.is_processing:
            return  # Don't interrupt processing

        if self.is_recording:
            # Stop recording
            self.on_hotkey_release()
        else:
            # Start recording
            self.on_hotkey_press()

    def _stop_recording(self):
        """Stop recording when stop button is clicked"""
        if self.is_recording:
            self.on_hotkey_release()

    def open_main_window(self, _):
        """Open the dashboard window"""
        show_dashboard()

    def open_settings(self, _):
        """Open the dashboard settings page"""
        show_dashboard()

    def change_mode(self, sender):
        for mode, item in self.mode_items.items():
            item.state = (mode == sender.title)
        self.config["mode"] = sender.title
        save_config(self.config)

    def toggle_local(self, sender):
        sender.state = not sender.state
        self.config["local_processing"] = sender.state
        self.transcriber.set_mode(sender.state)
        save_config(self.config)
        if sender.state:
            rumps.notification("Codiris Voice", "Local Mode Enabled", "Loading Whisper model...")

    def toggle_clipboard(self, sender):
        sender.state = not sender.state
        self.config["clipboard_mode"] = sender.state
        save_config(self.config)
        status = "Enabled" if sender.state else "Disabled"
        rumps.notification("Codiris Voice", f"Clipboard Mode {status}", "")

    def on_hotkey_press(self):
        if not self.is_recording and not self.is_processing:
            print("Starting recording...")
            self.is_recording = True
            set_recording(True)
            show_recording_bar()  # Show floating bar
            self.icon = self.icon_recording
            self.menu["Status: Idle"].title = "Status: Recording..."
            self.recorder.start_recording()

    def on_hotkey_release(self):
        if self.is_recording:
            print("Stopping recording...")
            self.is_recording = False
            self.is_processing = True
            set_recording(False)
            set_processing(True)
            show_processing_bar()  # Show processing state
            self.icon = self.icon_processing
            self.menu["Status: Idle"].title = "Status: Processing..."

            temp_path = self.recorder.stop_recording()
            threading.Thread(target=self.process_audio, args=(temp_path,)).start()

    def _apply_custom_words(self, text):
        """Apply custom word replacements to transcribed text"""
        custom_words = self.config.get("custom_words", {})
        if not custom_words:
            return text

        import re
        # Apply replacements (case-insensitive matching, preserve original case pattern)
        for wrong_word, correct_word in custom_words.items():
            # Create case-insensitive pattern with word boundaries
            pattern = r'\b' + re.escape(wrong_word) + r'\b'
            text = re.sub(pattern, correct_word, text, flags=re.IGNORECASE)

        print(f"After custom word replacement: {text}")
        return text

    def process_audio(self, file_path):
        try:
            if not file_path:
                return

            # Reload config to get latest model setting
            self.config = load_config()
            current_model = self.config.get("transcription_model", "gpt4o")
            self.transcriber.set_model(current_model)

            # Set API keys for different providers
            if self.config.get("groq_api_key"):
                self.transcriber.set_groq_key(self.config["groq_api_key"])
            if self.config.get("deepgram_api_key"):
                self.transcriber.set_deepgram_key(self.config["deepgram_api_key"])
            if self.config.get("assemblyai_api_key"):
                self.transcriber.set_assemblyai_key(self.config["assemblyai_api_key"])

            print(f"Transcribing {file_path} with model: {current_model}...")
            text = self.transcriber.transcribe(file_path, language=self.config.get("language"))

            if text:
                print(f"Transcription: {text}")

                # Apply custom word replacements
                text = self._apply_custom_words(text)
                is_command = text.lower().strip() in ["new line", "new paragraph", "delete that"]

                # Track usage statistics
                char_count = len(text)
                api_calls = 1  # Whisper call
                if self.config["mode"] != "Raw":
                    api_calls += 1  # GPT call for enhancement

                update_usage_stats(char_count, is_api_call=True)

                # For commands, execute immediately without review
                if is_command:
                    self.injector.inject_text(text, to_clipboard=False)
                    add_to_history(text)
                else:
                    # PASTE ORIGINAL TEXT IMMEDIATELY - no waiting!
                    original_text = text
                    print(f"Pasting original text immediately: {original_text}")
                    self.injector.inject_text(original_text, to_clipboard=self.config.get("clipboard_mode", False))
                    add_to_history(original_text)

                    # Generate improved version in background and show as suggestion
                    if self.config["mode"] != "Raw":
                        refined_text = self.enhancer.enhance(text, mode=self.config["mode"])

                        # Map mode to style
                        style_map = {
                            "Format": "professional",
                            "Clean": "casual",
                            "Notes": "concise"
                        }
                        current_style = style_map.get(self.config["mode"], "professional")

                        print(f"DEBUG: Queueing suggestion bubble for main thread")
                        print(f"DEBUG: Original: {original_text[:50] if len(original_text) > 50 else original_text}")
                        print(f"DEBUG: Improved: {refined_text[:50] if len(refined_text) > 50 else refined_text}")
                        print(f"DEBUG: Style: {current_style}")

                        # Queue bubble to be shown on main thread (just to show suggestion)
                        global _pending_review_data
                        _pending_review_data = {
                            'original_text': original_text,
                            'refined_text': refined_text,
                            'style': current_style,
                            'on_accept': None  # No callback needed - already pasted
                        }
                        _pending_actions.append("show_review")

            if os.path.exists(file_path):
                os.remove(file_path)

        except Exception as e:
            rumps.notification("Codiris Voice Error", "Failed", str(e))
            print(f"Error: {e}")
        finally:
            _pending_actions.append("finalize")

    def _finalize_ui(self):
        self.is_processing = False
        set_processing(False)
        self.icon = self.icon_idle
        self.menu["Status: Idle"].title = "Status: Idle"


def is_already_running():
    """Check if another instance of the app is already running using a lock file"""
    import fcntl
    global _lock_file
    lock_path = '/tmp/codiris_voice.lock'
    try:
        _lock_file = open(lock_path, 'w')
        fcntl.flock(_lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        _lock_file.write(str(os.getpid()))
        _lock_file.flush()
        return False
    except (IOError, OSError):
        return True

_lock_file = None

if __name__ == "__main__":
    # Prevent multiple instances
    if is_already_running():
        print("Codiris Voice is already running!")
        rumps.notification(
            "Codiris Voice",
            "Already Running",
            "The app is already running in the menu bar."
        )
        import sys
        sys.exit(0)

    # Check accessibility permissions first
    has_accessibility = check_accessibility_permission()
    if not has_accessibility:
        print("=" * 50)
        print("ACCESSIBILITY PERMISSION REQUIRED")
        print("Please enable this app in System Settings > Privacy & Security > Accessibility")
        print("Then restart the app.")
        print("=" * 50)
        rumps.notification(
            "Codiris Voice",
            "Accessibility Permission Required",
            "Please enable in System Settings > Privacy & Security > Accessibility"
        )

    # Start web UI server in background
    start_web_ui()

    # Run the menu bar app
    app = VoiceTypeApp()

    # Dashboard can be opened from menu bar icon click
    # (removed auto-open on startup - user wants minimal bubble-only UI)

    app.run()
