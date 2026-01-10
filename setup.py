"""
Setup script for Codiris Voice macOS app
"""
from setuptools import setup

APP = ['voicetype/main.py']
DATA_FILES = [
    ('assets', [
        'voicetype/assets/icon_idle.png',
        'voicetype/assets/icon_recording.png',
        'voicetype/assets/icon_processing.png',
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
        'LSUIElement': True,  # Menu bar app (no dock icon)
        'NSMicrophoneUsageDescription': 'Codiris Voice needs microphone access to transcribe your speech.',
        'NSAppleEventsUsageDescription': 'Codiris Voice needs to type text into other applications.',
    },
    'packages': [
        'rumps',
        'openai',
        'sounddevice',
        'numpy',
        'pyperclip',
        'pynput',
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
        'voicetype.ui.web_ui',
        'voicetype.ui.floating_bar',
    ],
}

setup(
    app=APP,
    name='Codiris Voice',
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
