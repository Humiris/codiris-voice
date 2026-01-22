import requests
import threading
from packaging import version

CURRENT_VERSION = "1.0.2"
GITHUB_API_URL = "https://api.github.com/repos/Humiris/codiris-voice/releases/latest"
DOWNLOAD_URL = "https://github.com/Humiris/codiris-voice/releases/latest"

# Callback to notify UI of update
_update_callback = None
_latest_version = None
_release_notes = None


def set_update_callback(callback):
    """Set callback function to be called when update is available"""
    global _update_callback
    _update_callback = callback


def get_current_version():
    return CURRENT_VERSION


def get_latest_version():
    return _latest_version


def get_release_notes():
    return _release_notes


def check_for_updates(silent=False):
    """Check GitHub for the latest release version"""
    global _latest_version, _release_notes

    try:
        response = requests.get(GITHUB_API_URL, timeout=10)
        if response.status_code != 200:
            print(f"[Updater] Failed to check for updates: {response.status_code}")
            return None

        data = response.json()
        latest = data.get("tag_name", "").lstrip("v")
        _release_notes = data.get("body", "")

        if not latest:
            return None

        _latest_version = latest

        # Compare versions
        if version.parse(latest) > version.parse(CURRENT_VERSION):
            print(f"[Updater] Update available: {CURRENT_VERSION} -> {latest}")
            if _update_callback and not silent:
                _update_callback(latest, _release_notes)
            return latest
        else:
            print(f"[Updater] App is up to date ({CURRENT_VERSION})")
            return None

    except Exception as e:
        print(f"[Updater] Error checking for updates: {e}")
        return None


def check_for_updates_async(silent=False):
    """Check for updates in background thread"""
    thread = threading.Thread(target=check_for_updates, args=(silent,), daemon=True)
    thread.start()


def get_download_url():
    """Get the download URL for the latest release"""
    return DOWNLOAD_URL
