"""
Floating waveform window that appears on the left side of the desktop
when recording is active.
"""
import objc
from AppKit import (
    NSApplication, NSWindow, NSView, NSColor, NSBezierPath,
    NSWindowStyleMaskBorderless, NSBackingStoreBuffered,
    NSFloatingWindowLevel, NSTimer,
    NSMakeRect, NSScreen
)
import math
import random

# State
is_recording = False
is_processing = False


class WaveformView(NSView):
    """Custom view that draws the waveform"""

    def init(self):
        self = objc.super(WaveformView, self).init()
        if self:
            self.wave_heights = [0.3] * 15
            self.target_heights = [0.3] * 15
            self.time_val = 0
        return self

    def drawRect_(self, rect):
        global is_recording, is_processing

        # Draw background with rounded corners
        NSColor.colorWithCalibratedRed_green_blue_alpha_(0.1, 0.05, 0.15, 0.95).set()
        path = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(rect, 25, 25)
        path.fill()

        # Draw waveform bars
        bar_width = 4
        gap = 4
        total_bars = 15
        total_width = total_bars * bar_width + (total_bars - 1) * gap
        start_x = (rect.size.width - total_width) / 2
        center_y = rect.size.height / 2
        max_height = rect.size.height * 0.6

        for i, height_pct in enumerate(self.wave_heights):
            x = start_x + i * (bar_width + gap)
            bar_height = max(8, height_pct * max_height)
            y = center_y - bar_height / 2

            # Set color based on state
            if is_processing:
                NSColor.colorWithCalibratedRed_green_blue_alpha_(0.98, 0.75, 0.15, 1.0).set()
            elif is_recording:
                NSColor.colorWithCalibratedRed_green_blue_alpha_(0.3, 0.87, 0.5, 1.0).set()
            else:
                NSColor.colorWithCalibratedRed_green_blue_alpha_(1.0, 1.0, 1.0, 0.6).set()

            bar_rect = NSMakeRect(x, y, bar_width, bar_height)
            bar_path = NSBezierPath.bezierPathWithRoundedRect_xRadius_yRadius_(bar_rect, 2, 2)
            bar_path.fill()

    def updateWave_(self, timer):
        global is_recording, is_processing

        self.time_val += 0.05

        if is_recording:
            # Animate with random heights when recording
            self.target_heights = [0.3 + random.random() * 0.7 for _ in range(15)]
        elif is_processing:
            # Pulsing animation when processing
            for i in range(15):
                self.target_heights[i] = 0.3 + 0.2 * math.sin(self.time_val * 3 + i * 0.3)
        else:
            # Idle - small bars
            self.target_heights = [0.15] * 15

        # Smooth interpolation
        for i in range(15):
            self.wave_heights[i] += (self.target_heights[i] - self.wave_heights[i]) * 0.3

        self.setNeedsDisplay_(True)


class FloatingWaveformWindow:
    """Floating window that shows waveform on left side of screen"""

    def __init__(self):
        self.window = None
        self.waveform_view = None
        self.timer = None
        self._create_window()

    def _create_window(self):
        # Get screen dimensions
        screen = NSScreen.mainScreen()
        screen_frame = screen.frame()

        # Window size
        width = 200
        height = 100

        # Position on left side, vertically centered
        x = 30
        y = (screen_frame.size.height - height) / 2

        # Create window
        self.window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(x, y, width, height),
            NSWindowStyleMaskBorderless,
            NSBackingStoreBuffered,
            False
        )

        self.window.setLevel_(NSFloatingWindowLevel)
        self.window.setOpaque_(False)
        self.window.setBackgroundColor_(NSColor.clearColor())
        self.window.setHasShadow_(True)
        self.window.setIgnoresMouseEvents_(True)  # Click-through

        # Create waveform view
        self.waveform_view = WaveformView.alloc().init()
        self.waveform_view.setFrame_(NSMakeRect(0, 0, width, height))
        self.window.contentView().addSubview_(self.waveform_view)

    def show(self):
        """Show the window and start animation"""
        if self.window:
            self.window.orderFront_(None)
            self._start_animation()

    def hide(self):
        """Hide the window and stop animation"""
        if self.window:
            self.window.orderOut_(None)
            self._stop_animation()

    def _start_animation(self):
        """Start the waveform animation timer"""
        if self.timer is None:
            self.timer = NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
                0.05,  # 20 FPS
                self.waveform_view,
                objc.selector(self.waveform_view.updateWave_, signature=b'v@:@'),
                None,
                True
            )

    def _stop_animation(self):
        """Stop the animation timer"""
        if self.timer:
            self.timer.invalidate()
            self.timer = None


# Global window instance
_floating_window = None


def get_floating_window():
    """Get or create the floating window"""
    global _floating_window
    if _floating_window is None:
        _floating_window = FloatingWaveformWindow()
    return _floating_window


def show_recording():
    """Show the floating window in recording state"""
    global is_recording, is_processing
    is_recording = True
    is_processing = False
    window = get_floating_window()
    window.show()


def show_processing():
    """Show the floating window in processing state"""
    global is_recording, is_processing
    is_recording = False
    is_processing = True
    window = get_floating_window()
    window.show()


def hide_window():
    """Hide the floating window"""
    global is_recording, is_processing
    is_recording = False
    is_processing = False
    window = get_floating_window()
    window.hide()


def init_floating_window():
    """Initialize the floating window (call from main thread)"""
    get_floating_window()
