from Quartz import (
    CGEventTapCreate, CGEventTapEnable, CGEventMaskBit,
    kCGEventFlagsChanged,
    kCGHeadInsertEventTap, kCGSessionEventTap,
    CGEventGetFlags,
    CFMachPortCreateRunLoopSource, CFRunLoopAddSource,
    CFRunLoopGetCurrent, CFRunLoopRun, kCFRunLoopCommonModes
)
import threading
import time

# Modifier key flag masks
kCGEventFlagMaskAlternate = 0x00080000  # Any Option key


class HotkeyListener:
    def __init__(self, hotkey_str, on_press_callback, on_release_callback, toggle_mode=True):
        self.hotkey_str = hotkey_str.lower().replace('key.', '')
        self.on_press_callback = on_press_callback
        self.on_release_callback = on_release_callback
        self.recording = False
        self.thread = None
        self.last_action_time = 0  # Debounce timestamp
        self.toggle_mode = toggle_mode  # True = press to start/stop, False = hold to record
        self.opt_was_pressed = False  # Track state for toggle mode

    def set_toggle_mode(self, enabled):
        """Enable or disable toggle mode"""
        self.toggle_mode = enabled
        print(f"Recording mode: {'Toggle (press to start/stop)' if enabled else 'Hold to record'}")

    def _callback(self, _proxy, event_type, event, _refcon):
        try:
            if event_type == kCGEventFlagsChanged:
                flags = CGEventGetFlags(event)
                opt_pressed = bool(flags & kCGEventFlagMaskAlternate)

                current_time = time.time()

                if self.toggle_mode:
                    # Toggle mode: press Option to start, press again to stop
                    # Only trigger on key DOWN (transition from not pressed to pressed)
                    if opt_pressed and not self.opt_was_pressed:
                        if current_time - self.last_action_time > 0.3:  # 300ms debounce for toggle
                            self.last_action_time = current_time
                            if not self.recording:
                                self.recording = True
                                print("Option key PRESSED - starting recording (toggle mode)")
                                self.on_press_callback()
                            else:
                                self.recording = False
                                print("Option key PRESSED - stopping recording (toggle mode)")
                                self.on_release_callback()
                    self.opt_was_pressed = opt_pressed
                else:
                    # Hold-to-record mode with debouncing (100ms)
                    if opt_pressed and not self.recording:
                        if current_time - self.last_action_time > 0.1:
                            self.recording = True
                            self.last_action_time = current_time
                            print("Option key HELD - starting recording")
                            self.on_press_callback()
                    elif not opt_pressed and self.recording:
                        if current_time - self.last_action_time > 0.1:
                            self.recording = False
                            self.last_action_time = current_time
                            print("Option key RELEASED - stopping recording")
                            self.on_release_callback()

        except Exception as e:
            print(f"Callback error: {e}")

        return event

    def _run_listener(self):
        # Listen for modifier key flag changes (Option key)
        mask = CGEventMaskBit(kCGEventFlagsChanged)

        tap = CGEventTapCreate(
            kCGSessionEventTap,
            kCGHeadInsertEventTap,
            0,
            mask,
            self._callback,
            None
        )

        if tap is None:
            print("=" * 50)
            print("ERROR: Failed to create event tap!")
            print("Please enable Accessibility permissions:")
            print("1. Open System Settings > Privacy & Security > Accessibility")
            print("2. Add and enable this app (or Terminal if running from terminal)")
            print("=" * 50)
            # Show notification
            import rumps
            rumps.notification(
                "Codiris Voice",
                "Accessibility Permission Required",
                "Please enable in System Settings > Privacy & Security > Accessibility, then restart the app."
            )
            return

        mode_desc = "press Option to start/stop" if self.toggle_mode else "hold Option to record"
        print(f"Hotkey listener started - {mode_desc}")
        run_loop_source = CFMachPortCreateRunLoopSource(None, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), run_loop_source, kCFRunLoopCommonModes)
        CGEventTapEnable(tap, True)

        CFRunLoopRun()

    def start(self):
        self.thread = threading.Thread(target=self._run_listener, daemon=True)
        self.thread.start()

    def stop(self):
        pass
