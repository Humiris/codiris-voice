# Codiris Voice

Voice to text for Mac. Hold Option key, speak, release. Your words appear instantly.

## Download

**[Download Codiris Voice for Mac](https://github.com/Humiris/codiris-voice/releases/latest)**

- macOS 10.15+
- Intel & Apple Silicon
- ~97 MB

## Features

- **Lightning Fast** - Hold Option key and speak. Text appears when you release.
- **Multi-language** - Supports 50+ languages with automatic detection.
- **Works Everywhere** - Type in any app - emails, Slack, browser, code editors.
- **AI Enhancement** - Optional AI modes to clean up or format your text.
- **Private & Secure** - Voice processed securely, no recordings stored.

## How it Works

1. **Hold Option Key** - Press and hold Option to start recording
2. **Speak** - Talk naturally, the floating bar shows audio capture
3. **Release** - Let go of Option, text is typed where your cursor is

## Setup

1. Download the DMG from Releases
2. Open DMG and drag Codiris Voice to Applications
3. Launch and grant permissions:
   - **Accessibility** - for hotkey detection
   - **Input Monitoring** - for keyboard events
   - **Microphone** - for voice recording
4. Sign in with Google
5. Start talking!

## Development

```bash
# Install dependencies
pip install -r voicetype/requirements.txt

# Run from source
python -m voicetype.main

# Build app
pyinstaller "Codiris Voice.spec"
```

## Links

- Website: [codiris.build](https://codiris.build)
- Download: [voice.codiris.build](https://voice.codiris.build)
