"""
Setup script for Codiris Voice macOS app
"""
import sys
sys.setrecursionlimit(5000)

from setuptools import setup

APP = ['voicetype/main.py']
DATA_FILES = [
    ('assets', [
        'voicetype/assets/icon_idle.png',
        'voicetype/assets/icon_recording.png',
        'voicetype/assets/icon_processing.png',
    ]),
    ('_sounddevice_data/portaudio-binaries', [
        '/Users/joel/Library/Python/3.9/lib/python/site-packages/_sounddevice_data/portaudio-binaries/libportaudio.dylib',
    ]),
]
OPTIONS = {
    'argv_emulation': False,
    'iconfile': 'voicetype/assets/AppIcon.icns',
    'plist': {
        'CFBundleName': 'Codiris Voice',
        'CFBundleDisplayName': 'Codiris Voice',
        'CFBundleIdentifier': 'com.codiris.voice',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'LSMinimumSystemVersion': '10.15',
        'LSUIElement': False,  # Show in dock
        'NSMicrophoneUsageDescription': 'Codiris Voice needs microphone access to transcribe your speech.',
        'NSAppleEventsUsageDescription': 'Codiris Voice needs to type text into other applications.',
    },
    'packages': [
        'rumps',
        'openai',
        'sounddevice',
        '_sounddevice_data',
        'numpy',
        'pyperclip',
        'pynput',
        'requests',
        'keyring',
        'keyring.backends',
    ],
    'frameworks': [
        '/Users/joel/Library/Python/3.9/lib/python/site-packages/_sounddevice_data/portaudio-binaries/libportaudio.dylib',
    ],
    'excludes': [
        'PySide2',
        'PyQt5',
        'PyInstaller',
        'tkinter',
        'matplotlib',
    ],
    'includes': [
        'voicetype',
        'voicetype.ui',
        'voicetype.audio_recorder',
        'voicetype.transcriber',
        'voicetype.text_injector',
        'voicetype.ai_enhancer',
        'voicetype.hotkey_listener',
        'voicetype.settings',
        'voicetype.security',
        'voicetype.ui.web_ui',
        'voicetype.ui.floating_bar',
        'voicetype.ui.review_window',
        'voicetype.ui.settings_usage_window',
        'voicetype.ui.dashboard_window',
    ],
}

setup(
    app=APP,
    name='Codiris Voice',
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
