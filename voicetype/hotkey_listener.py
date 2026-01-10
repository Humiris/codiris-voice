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
    def __init__(self, hotkey_str, on_press_callback, on_release_callback):
        self.hotkey_str = hotkey_str.lower().replace('key.', '')
        self.on_press_callback = on_press_callback
        self.on_release_callback = on_release_callback
        self.recording = False
        self.thread = None
        self.last_action_time = 0  # Debounce timestamp

    def _callback(self, _proxy, event_type, event, _refcon):
        try:
            if event_type == kCGEventFlagsChanged:
                flags = CGEventGetFlags(event)
                opt_pressed = bool(flags & kCGEventFlagMaskAlternate)

                current_time = time.time()

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

        print("Hotkey listener started - hold Option key to record")
        run_loop_source = CFMachPortCreateRunLoopSource(None, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), run_loop_source, kCFRunLoopCommonModes)
        CGEventTapEnable(tap, True)

        CFRunLoopRun()

    def start(self):
        self.thread = threading.Thread(target=self._run_listener, daemon=True)
        self.thread.start()

    def stop(self):
        pass
