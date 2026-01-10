# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['voicetype/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('voicetype/assets/icon_idle.png', 'voicetype/assets'),
        ('voicetype/assets/icon_recording.png', 'voicetype/assets'),
        ('voicetype/assets/icon_processing.png', 'voicetype/assets'),
    ],
    hiddenimports=[
        'rumps',
        'openai',
        'sounddevice',
        'numpy',
        'pyperclip',
        'pynput',
        'pynput.keyboard',
        'pynput.keyboard._darwin',
        'voicetype',
        'voicetype.ui',
        'voicetype.ui.web_ui',
        'voicetype.ui.floating_bar',
        'voicetype.audio_recorder',
        'voicetype.transcriber',
        'voicetype.text_injector',
        'voicetype.ai_enhancer',
        'voicetype.hotkey_listener',
        'voicetype.settings',
        'AppKit',
        'Foundation',
        'Quartz',
        'objc',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='Codiris Voice',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Codiris Voice',
)

app = BUNDLE(
    coll,
    name='Codiris Voice.app',
    icon='voicetype/assets/AppIcon.icns',
    bundle_identifier='com.codiris.voice',
    info_plist={
        'CFBundleName': 'Codiris Voice',
        'CFBundleDisplayName': 'Codiris Voice',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'LSMinimumSystemVersion': '10.15',
        'LSUIElement': True,
        'NSMicrophoneUsageDescription': 'Codiris Voice needs microphone access to transcribe your speech.',
        'NSAppleEventsUsageDescription': 'Codiris Voice needs to type text into other applications.',
        'NSHighResolutionCapable': True,
    },
)
