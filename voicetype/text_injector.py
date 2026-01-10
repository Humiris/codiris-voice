import time
import pyperclip
import subprocess
import rumps

class TextInjector:
    def __init__(self):
        self.last_text_length = 0
        self.last_text = ""

    def inject_text(self, text, to_clipboard=False):
        if not text:
            return

        # Check for commands (lowercase for comparison only)
        command_result = self._handle_commands(text.lower().strip())
        if command_result is None:  # Command was executed, no text to type
            return

        # Use original text if command didn't transform it
        if command_result == text.lower().strip():
            final_text = text.strip()
        else:
            final_text = command_result

        # Always copy to clipboard
        pyperclip.copy(final_text)
        self.last_text = final_text
        self.last_text_length = len(final_text)

        if to_clipboard:
            rumps.notification("Codiris Voice", "Copied to clipboard", final_text[:50] + "..." if len(final_text) > 50 else final_text)
            return

        # Try to paste using AppleScript
        time.sleep(0.1)
        try:
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to keystroke "v" using command down'
            ], check=True, capture_output=True)
            print(f"[TextInjector] Pasted: {final_text[:50]}...")
        except subprocess.CalledProcessError as e:
            # If AppleScript fails (no Accessibility), show notification
            print(f"[TextInjector] Paste failed (need Accessibility): {e}")
            rumps.notification(
                "Codiris Voice",
                "Text copied - Press Cmd+V to paste",
                final_text[:50] + "..." if len(final_text) > 50 else final_text
            )

    def _press_key(self, key_name):
        """Press a key using AppleScript"""
        subprocess.run([
            'osascript', '-e',
            f'tell application "System Events" to key code {key_name}'
        ], check=False)

    def _handle_commands(self, text):
        # Basic command detection
        if text == "new line":
            # Return key code is 36
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to key code 36'
            ], check=False)
            self.last_text_length = 0
            return None

        if text == "new paragraph":
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to key code 36'
            ], check=False)
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to key code 36'
            ], check=False)
            self.last_text_length = 0
            return None

        if text == "delete that":
            # Select and delete - use Cmd+Shift+Left to select, then delete
            # This is approximate - select last_text_length chars and delete
            for _ in range(self.last_text_length):
                subprocess.run([
                    'osascript', '-e',
                    'tell application "System Events" to key code 51'  # backspace
                ], check=False)
                time.sleep(0.002)
            self.last_text_length = 0
            return None

        if text.startswith("all caps "):
            return text[9:].upper()

        if text == "period": return "."
        if text == "comma": return ","
        if text == "question mark": return "?"

        return text
