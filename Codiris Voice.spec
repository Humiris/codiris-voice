# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['voicetype/main.py'],
    pathex=[],
    binaries=[],
    datas=[('voicetype', 'voicetype')],
    hiddenimports=[
        'rumps', 'sounddevice', 'numpy', 'openai', 'pynput', 'pyperclip',
        'AppKit', 'objc', 'WebKit', 'keyring', 'cryptography',
        'requests', 'urllib3', 'certifi', 'charset_normalizer', 'idna',
        'Quartz', 'ApplicationServices', 'Foundation', 'CoreFoundation',
        'scipy', 'soundfile', 'cffi'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

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
    icon=['voicetype/assets/AppIcon.icns'],
)
coll = COLLECT(
    exe,
    a.binaries,
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
        'LSUIElement': True,  # Menu bar app - no dock icon
        'NSMicrophoneUsageDescription': 'Codiris Voice needs microphone access to transcribe your speech.',
        'NSAppleEventsUsageDescription': 'Codiris Voice needs to send keyboard events to type transcribed text.',
        'CFBundleShortVersionString': '1.0.0',
        'CFBundleVersion': '1.0.0',
        'NSHighResolutionCapable': True,
    },
)
