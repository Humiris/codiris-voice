"""
Floating pill-shaped waveform bar that appears at the bottom of the screen.
Shows real-time audio visualization based on microphone input.
"""
import objc
from AppKit import (
    NSPanel, NSView, NSColor, NSBezierPath,
    NSWindowStyleMaskBorderless, NSWindowStyleMaskNonactivatingPanel,
    NSBackingStoreBuffered, NSTimer, NSScreen, NSMakeRect,
    NSFloatingWindowLevel, NSMenu, NSMenuItem, NSApp
)
import numpy as np
import sounddevice as sd
import time

# Global state - use a class to ensure singleton across imports
class _GlobalState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.recording = False
            cls._instance.processing = False
            cls._instance.disabled_until = 0
            cls._instance.audio_levels = [0.0] * 12
            cls._instance.floating_bar = None
            cls._instance.audio_monitor = None
            cls._instance.on_click_callback = None
            cls._instance.on_stop_callback = None
            cls._instance.on_settings_callback = None
        return cls._instance

_globals = _GlobalState()

# For backwards compatibility
_state = {"recording": False, "processing": False, "disabled_until": 0}
audio_levels = _globals.audio_levels
_floating_bar = None
_audio_monitor = None
_on_click_callback = None
_on_stop_callback = None
_on_settings_callback = None


def set_settings_callback(callback):
    """Set callback for when settings is clicked"""
    global _on_settings_callback
    _on_settings_callback = callback


def is_disabled():
    """Check if floating bar is temporarily disabled"""
    return time.time() < _state["disabled_until"]


def disable_for(minutes):
    """Disable floating bar for N minutes"""
    global _state
    _state["disabled_until"] = time.time() + (minutes * 60)
    bar = get_floating_bar()
    bar.hide()
    print(f"Floating bar disabled for {minutes} minutes")


def enable_bar():
    """Re-enable the floating bar"""
    global _state
    _state["disabled_until"] = 0
    bar = get_floating_bar()
    bar.show()
    print("Floating bar enabled")


def set_click_callback(callback):
    """Set callback for when waveform area is clicked (start recording)"""
    global _on_click_callback
    _on_click_callback = callback


def set_stop_callback(callback):
    """Set callback for when stop button is clicked"""
    global _on_stop_callback
    _on_stop_callback = callback


def set_recording_state(recording):
    """Called by main.py to sync recording state"""
    global _state
    _state["recording"] = recording
    print(f"FLOATING BAR: Recording = {recording}")


def set_processing_state(processing):
    """Called by main.py to sync processing state"""
    global _state
    _state["processing"] = processing


class AudioMonitor:
    """Monitors microphone input for visualization"""

    def __init__(self):
        self.running = False
        self.stream = None

    def start(self):
        if self.running:
            return
        self.running = True

        def audio_callback(indata, frames, time, status):
            global audio_levels
            volume = np.sqrt(np.mean(indata**2))

            # Access module-level _state directly
            from voicetype.ui import floating_bar
            is_rec = floating_bar._state["recording"]

            if is_rec:
                # When recording, show real audio levels (amplified for visibility)
                for i in range(12):
                    offset = i - 6
                    variation = max(0.3, 1 - abs(offset) * 0.1)
                    noise = np.random.random() * 0.25
                    # Amplify volume more for better visibility
                    audio_levels[i] = min(1.0, volume * 30 * variation + noise * 0.3 + 0.2)
            else:
                # Idle state - small static bars
                for i in range(12):
                    audio_levels[i] = 0.15

        try:
            self.stream = sd.InputStream(
                channels=1,
                samplerate=16000,
                blocksize=512,
                callback=audio_callback
            )
            self.stream.start()
        except Exception as e:
            print(f"Audio monitor error: {e}")

    def stop(self):
        self.running = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None


class WaveformBarView(NSView):
    """Custom view that draws the pill-shaped waveform bar with stop button"""

    def init(self):
        self = objc.super(WaveformBarView, self).init()
        if self:
            self.wave_heights = [0.15] * 12
            self.time_val = 0.0
            self._drag_start = None
            self.wave_color = (0.2, 0.5, 1.0)  # Default blue
            self.idle_color = (0.7, 0.7, 0.7)  # Default gray
            self._load_color()
        return self

    def _load_color(self):
        """Load wave color from settings"""
        try:
            from voicetype.settings import load_config
            config = load_config()
            hex_color = config.get('bar_color', '#3B82F6')
            # Convert hex to RGB
            hex_color = hex_color.lstrip('#')
            r = int(hex_color[0:2], 16) / 255.0
            g = int(hex_color[2:4], 16) / 255.0
            b = int(hex_color[4:6], 16) / 255.0
            self.wave_color = (r, g, b)
            self.idle_color = (r * 0.7, g * 0.7, b * 0.7)  # Dimmer for idle
        except Exception as e:
            print(f"Error loading bar color: {e}")

    def mouseDown_(self, event):
        """Handle click on the floating bar"""
        global _on_click_callback, _on_stop_callback, _state

        # Check for double-click to show menu
        if event.clickCount() == 2:
            self._show_context_menu(event)
            return

        # Store initial position for drag
        self._drag_start = event.locationInWindow()
        self._window_origin = self.window().frame().origin

    def mouseDragged_(self, event):
        """Handle dragging to move the bar"""
        if self._drag_start is None:
            return

        # Calculate new position
        current = event.locationInWindow()
        dx = current.x - self._drag_start.x
        dy = current.y - self._drag_start.y

        new_x = self._window_origin.x + dx
        new_y = self._window_origin.y + dy

        # Move window
        self.window().setFrameOrigin_((new_x, new_y))

    def mouseUp_(self, event):
        """Handle mouse up - either finish drag or trigger click"""
        global _on_click_callback, _on_stop_callback, _state

        if self._drag_start is None:
            return

        # Check if it was a drag or a click (small movement = click)
        current = event.locationInWindow()
        dx = abs(current.x - self._drag_start.x)
        dy = abs(current.y - self._drag_start.y)

        self._drag_start = None

        # If moved more than 5px, it was a drag - don't trigger click
        if dx > 5 or dy > 5:
            return

        # Get click location
        loc = event.locationInWindow()
        frame = self.frame()

        # Check if click is on stop button (right side, last 30px)
        if loc.x > frame.size.width - 35 and _state["recording"]:
            print("Stop button clicked!")
            if _on_stop_callback:
                _on_stop_callback()
        else:
            print("Waveform clicked - toggle recording")
            if _on_click_callback:
                _on_click_callback()

    def rightMouseDown_(self, event):
        """Handle right-click to show menu"""
        self._show_context_menu(event)

    def _show_context_menu(self, event):
        """Show context menu with options"""
        global _on_settings_callback

        menu = NSMenu.alloc().init()

        # Settings option
        settings_item = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(
            "Open Settings", "openSettings:", ""
        )
        settings_item.setTarget_(self)
        menu.addItem_(settings_item)

        menu.addItem_(NSMenuItem.separatorItem())

        # Disable options
        disable_1 = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(
            "Disable for 1 min", "disable1:", ""
        )
        disable_1.setTarget_(self)
        menu.addItem_(disable_1)

        disable_15 = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(
            "Disable for 15 min", "disable15:", ""
        )
        disable_15.setTarget_(self)
        menu.addItem_(disable_15)

        disable_30 = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(
            "Disable for 30 min", "disable30:", ""
        )
        disable_30.setTarget_(self)
        menu.addItem_(disable_30)

        disable_60 = NSMenuItem.alloc().initWithTitle_action_keyEquivalent_(
            "Disable for 1 hour", "disable60:", ""
        )
        disable_60.setTarget_(self)
        menu.addItem_(disable_60)

        # Show menu
        NSMenu.popUpContextMenu_withEvent_forView_(menu, event, self)

    def openSettings_(self, sender):
        """Open settings callback"""
        global _on_settings_callback
        if _on_settings_callback:
            _on_settings_callback()

    def disable1_(self, sender):
        disable_for(1)

    def disable15_(self, sender):
        disable_for(15)

    def disable30_(self, sender):
        disable_for(30)

    def disable60_(self, sender):
        disable_for(60)

    def drawRect_(self, rect):
        global _state, audio_levels

        is_recording = _state["recording"]

        # Draw pill-shaped background (dark)
        NSColor.colorWithCalibratedRed_green_blue_alpha_(0.1, 0.1, 0.12, 0.95).set()
        pill_path = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
            rect, rect.size.height / 2, rect.size.height / 2
        )
        pill_path.fill()

        # Draw subtle border
        NSColor.colorWithCalibratedRed_green_blue_alpha_(0.25, 0.25, 0.28, 1.0).set()
        pill_path.setLineWidth_(1.0)
        pill_path.stroke()

        # Calculate waveform area (leave space for stop button when recording)
        bar_width = 2
        gap = 2
        num_bars = 12
        total_width = num_bars * bar_width + (num_bars - 1) * gap

        # Offset waveform to the left when recording to make room for stop button
        if is_recording:
            start_x = 12
        else:
            start_x = (rect.size.width - total_width) / 2

        center_y = rect.size.height / 2
        max_height = rect.size.height * 0.6

        # Draw waveform bars
        for i in range(num_bars):
            x = start_x + i * (bar_width + gap)

            height_pct = self.wave_heights[i]
            bar_height = max(4, height_pct * max_height)
            y = center_y - bar_height / 2

            # Color based on state - use custom color
            if is_recording:
                # Full color when recording
                r, g, b = self.wave_color
                NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 0.95).set()
            else:
                # Dimmer when idle
                r, g, b = self.idle_color
                NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 0.6).set()

            bar_rect = NSMakeRect(x, y, bar_width, bar_height)
            bar_path = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
                bar_rect, bar_width / 2, bar_width / 2
            )
            bar_path.fill()

        # Draw stop button when recording (red square on right side)
        if is_recording:
            stop_size = 14
            stop_x = rect.size.width - stop_size - 10
            stop_y = center_y - stop_size / 2

            # Red stop square
            NSColor.colorWithCalibratedRed_green_blue_alpha_(0.9, 0.2, 0.2, 1.0).set()
            stop_rect = NSMakeRect(stop_x, stop_y, stop_size, stop_size)
            stop_path = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(
                stop_rect, 3, 3
            )
            stop_path.fill()

    def updateWave_(self, timer):
        global _state, audio_levels

        self.time_val += 0.05
        is_recording = _state["recording"]

        # Reload color every ~3 seconds (every 100 frames at 0.03s interval)
        if int(self.time_val * 33) % 100 == 0:
            self._load_color()

        if is_recording:
            # Use real audio levels with smoothing
            for i in range(12):
                target = audio_levels[i]
                self.wave_heights[i] += (target - self.wave_heights[i]) * 0.5
        else:
            # Static flat line when idle or processing
            for i in range(12):
                self.wave_heights[i] += (0.15 - self.wave_heights[i]) * 0.2

        self.setNeedsDisplay_(True)


class FloatingBar:
    """Floating pill bar at bottom of screen"""

    def __init__(self):
        self.window = None
        self.view = None
        self.timer = None
        self._create_window()

    def _create_window(self):
        screen = NSScreen.mainScreen()
        screen_frame = screen.frame()

        # Bar dimensions (compact)
        bar_width = 100
        bar_height = 20

        # Position higher to avoid dock (120px from bottom)
        x = (screen_frame.size.width - bar_width) / 2
        y = 120

        style = NSWindowStyleMaskBorderless | NSWindowStyleMaskNonactivatingPanel
        self.window = NSPanel.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(x, y, bar_width, bar_height),
            style,
            NSBackingStoreBuffered,
            False
        )

        self.window.setLevel_(NSFloatingWindowLevel)
        self.window.setOpaque_(False)
        self.window.setBackgroundColor_(NSColor.clearColor())
        self.window.setHasShadow_(True)
        self.window.setIgnoresMouseEvents_(False)
        self.window.setCollectionBehavior_(1 << 0)
        self.window.setHidesOnDeactivate_(False)
        self.window.setFloatingPanel_(True)
        self.window.setBecomesKeyOnlyIfNeeded_(True)

        self.view = WaveformBarView.alloc().init()
        self.view.setFrame_(NSMakeRect(0, 0, bar_width, bar_height))
        self.window.contentView().addSubview_(self.view)

    def show(self):
        global _audio_monitor
        if self.window:
            self.window.orderFront_(None)
            self._start_animation()

            if _audio_monitor is None:
                _audio_monitor = AudioMonitor()
            _audio_monitor.start()

    def hide(self):
        global _audio_monitor
        if self.window:
            self.window.orderOut_(None)
            self._stop_animation()

            if _audio_monitor:
                _audio_monitor.stop()

    def _start_animation(self):
        if self.timer is None:
            self.timer = NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
                0.03,
                self.view,
                objc.selector(self.view.updateWave_, signature=b'v@:@'),
                None,
                True
            )

    def _stop_animation(self):
        if self.timer:
            self.timer.invalidate()
            self.timer = None


def get_floating_bar():
    global _floating_bar
    # Use the singleton from _globals to ensure only one bar across all imports
    if _globals.floating_bar is None:
        _globals.floating_bar = FloatingBar()
    _floating_bar = _globals.floating_bar
    return _floating_bar


def show_recording_bar():
    global _state
    _state["recording"] = True
    _state["processing"] = False
    print(f"FLOATING BAR: Recording ON")
    bar = get_floating_bar()
    bar.show()


def show_processing_bar():
    global _state
    _state["recording"] = False
    _state["processing"] = True
    print("FLOATING BAR: Processing ON")


def show_idle_bar():
    global _state
    _state["recording"] = False
    _state["processing"] = False
    print("FLOATING BAR: Idle")
    bar = get_floating_bar()
    bar.show()


def hide_bar():
    global _state
    _state["recording"] = False
    _state["processing"] = False
    bar = get_floating_bar()
    bar.hide()


def init_floating_bar():
    get_floating_bar()
