"""
Dashboard window - native macOS window with embedded WebView
Shows the same UI as browser but inside the app
"""
import objc
from AppKit import (
    NSWindow, NSView, NSColor, NSMakeRect, NSScreen,
    NSWindowStyleMaskTitled, NSWindowStyleMaskClosable,
    NSWindowStyleMaskMiniaturizable, NSWindowStyleMaskResizable,
    NSBackingStoreBuffered, NSApp
)
from WebKit import WKWebView, WKWebViewConfiguration
from Foundation import NSObject, NSURL, NSURLRequest

_dashboard_window = None


class DashboardWindowController(NSObject):
    """Controller for the dashboard window with embedded WebView"""

    def init(self):
        self = objc.super(DashboardWindowController, self).init()
        if self:
            self.window = None
            self.webview = None
            self._create_window()
        return self

    def _create_window(self):
        screen = NSScreen.mainScreen()
        screen_frame = screen.frame()

        # Window size (same as browser)
        width = 1200
        height = 750
        x = (screen_frame.size.width - width) / 2
        y = (screen_frame.size.height - height) / 2

        style = (NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                 NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable)

        self.window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            NSMakeRect(x, y, width, height),
            style,
            NSBackingStoreBuffered,
            False
        )

        self.window.setTitle_("Codiris Voice")
        self.window.setMinSize_((800, 500))

        # Create WebView configuration
        config = WKWebViewConfiguration.alloc().init()

        # Create WebView
        content = self.window.contentView()
        self.webview = WKWebView.alloc().initWithFrame_configuration_(
            NSMakeRect(0, 0, width, height),
            config
        )
        self.webview.setAutoresizingMask_(18)  # Flexible width and height

        content.addSubview_(self.webview)

        # Load the local web UI
        url = NSURL.URLWithString_("http://localhost:8765")
        request = NSURLRequest.requestWithURL_(url)
        self.webview.loadRequest_(request)

    def show(self):
        if self.window:
            # Reload to get fresh content
            url = NSURL.URLWithString_("http://localhost:8765")
            request = NSURLRequest.requestWithURL_(url)
            self.webview.loadRequest_(request)

            self.window.makeKeyAndOrderFront_(None)
            NSApp.activateIgnoringOtherApps_(True)

    def hide(self):
        if self.window:
            self.window.orderOut_(None)


def get_dashboard():
    global _dashboard_window
    if _dashboard_window is None:
        _dashboard_window = DashboardWindowController.alloc().init()
    return _dashboard_window


def show_dashboard():
    """Show the dashboard window with embedded WebView"""
    dashboard = get_dashboard()
    dashboard.show()


def hide_dashboard():
    """Hide the dashboard window"""
    dashboard = get_dashboard()
    dashboard.hide()
