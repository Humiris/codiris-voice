# Codiris Voice - Development Setup Guide

## 🚀 Quick Start

Both the landing page and desktop app are now running in development mode!

### Current Status
- ✅ **Landing Page**: Running at http://localhost:3001
- ✅ **Desktop App**: Running in your menu bar (PID: 55442)

---

## 📦 Project Structure

```
codiris voice/
├── voice-landing/          # Next.js landing page
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json
│
└── voicetype/             # Python desktop app
    ├── main.py            # App entry point
    ├── ui/                # UI components
    │   ├── floating_bar.py
    │   ├── dashboard_window.py
    │   ├── review_window.py        # NEW: Review & edit window
    │   └── settings_usage_window.py # NEW: Settings & usage stats
    ├── audio_recorder.py
    ├── transcriber.py
    ├── ai_enhancer.py
    └── text_injector.py
```

---

## 🌐 Landing Page (Next.js)

### Running the Development Server

```bash
cd "/Users/joel/codiris voice/voice-landing"
npm run dev
```

**Access**: http://localhost:3001

### Key Features
- ✅ Hero section with animated demo
- ✅ Platform compatibility showcase
- ✅ Speed comparison visualizations
- ✅ User personas section
- ✅ **FAQ section** (new)
- ✅ **Updated footer** matching Cluely design (new)
- ✅ Voice AI demo page at `/voice`

### Available Routes
- `/` - Main landing page
- `/voice` - Interactive voice AI demo
- `/install` - Installation guide

### Making Changes
- **Components**: Edit files in `src/components/`
- **Pages**: Edit files in `src/app/`
- **Styles**: Uses Tailwind CSS
- Changes auto-reload thanks to Hot Module Replacement (HMR)

---

## 🖥️ Desktop App (Python)

### Running in Development Mode

```bash
cd "/Users/joel/codiris voice"
python3 -m voicetype.main
```

The app will appear in your **menu bar** at the top of your screen.

### System Requirements
- macOS 10.14+
- Python 3.9+
- Required permissions:
  - ✅ **Accessibility** (for typing text)
  - ✅ **Input Monitoring** (for hotkey detection)
  - ✅ **Microphone** (for voice recording)

### Dependencies

```bash
# Install required packages
pip3 install rumps openai pyobjc-core pyobjc-framework-Cocoa
```

### Key Features

#### 1. **Voice Transcription**
- Hold **Option key** and speak
- Release to transcribe
- Auto-enhancement with AI

#### 2. **Review Window** (NEW)
- Shows original transcript + improved version side-by-side
- **Three refinement styles**:
  - Professional - Formal business communication
  - Casual - Friendly conversational tone
  - Concise - Brief and direct
- **Edit capability** - Click "Edit" to modify improved text
- **Regenerate** - Try different styles instantly
- **Accept & Paste** - Insert final text into active app

#### 3. **Settings & Usage** (NEW)
Access via menu bar → "Settings & Usage"

**Three tabs:**
- **Usage Tab**:
  - Total characters transcribed
  - API requests count
  - Total transcriptions
  - Monthly stats
  - Last used timestamp

- **Settings Tab**:
  - Edit your name
  - View email
  - **Affiliate program**:
    - Unique referral link: `https://codiris.com/voice?ref=yourname`
    - Copy & share with friends
    - Track referrals count

- **Customization Tab**:
  - Floating bar color picker
  - Position (Top/Bottom)
  - Opacity slider (0.3 - 1.0)
  - Live preview

#### 4. **Transcription Modes**
- **Raw** - No AI enhancement
- **Clean** - Fix grammar and typos
- **Format** - Professional formatting
- **Email** - Email-ready text
- **Code** - Code-friendly formatting
- **Notes** - Quick note-taking

### Menu Bar Options
- **Status**: Shows current state (Idle/Recording/Processing)
- **Open Codiris Voice**: Opens dashboard with history
- **Settings & Usage**: Opens settings window (NEW)
- **Transcription Mode**: Change AI enhancement mode
- **Local Processing**: Toggle local Whisper (beta)
- **Copy to Clipboard**: Toggle clipboard mode

---

## 🛠️ Development Workflow

### 1. Starting Both Services

```bash
# Terminal 1 - Landing Page
cd "/Users/joel/codiris voice/voice-landing"
npm run dev

# Terminal 2 - Desktop App
cd "/Users/joel/codiris voice"
python3 -m voicetype.main
```

### 2. Testing the Review Window

1. Start the desktop app
2. Hold Option key and say something
3. Release Option key
4. Review window appears showing:
   - Left: Original transcript
   - Right: AI-improved version
5. Try different refinement styles
6. Edit the improved text if needed
7. Click "Accept & Paste"

### 3. Testing Settings & Usage

1. Click Codiris Voice in menu bar
2. Select "Settings & Usage"
3. Browse the three tabs:
   - View your usage statistics
   - Update your name
   - Copy your affiliate link
   - Customize floating bar appearance

### 4. Viewing Logs

```bash
# Desktop app logs
tail -f /tmp/codiris_voice.log

# Landing page logs
# Check the terminal where npm run dev is running
```

---

## 🐛 Troubleshooting

### Desktop App Won't Start

**Check for existing instances:**
```bash
ps aux | grep voicetype | grep -v grep
```

**Kill existing instances:**
```bash
pkill -f voicetype.main
```

**Remove lock file:**
```bash
rm -f /tmp/voicetype.lock
```

### Permission Issues

If the app can't type or detect hotkeys:

1. **System Settings** → **Privacy & Security**
2. Enable for "Python" or "Terminal":
   - ✅ Accessibility
   - ✅ Input Monitoring
   - ✅ Microphone

### Landing Page Port Already in Use

If port 3001 is taken:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or let Next.js auto-assign a different port
npm run dev
# It will use port 3002, 3003, etc.
```

### Review Window Not Showing

Check logs for errors:
```bash
tail -30 /tmp/codiris_voice.log
```

Common issues:
- PyObjC method signature errors (should be fixed with `@objc.python_method` decorator)
- Missing OpenAI API key in config

---

## 📝 Configuration

### Desktop App Config

Located at: `~/.codiris_voice_config.json`

```json
{
  "api_key": "your-openai-api-key",
  "hotkey": "option",
  "mode": "Format",
  "language": "en",
  "clipboard_mode": false,
  "local_processing": false,
  "usage_stats": {
    "total_characters": 0,
    "total_requests": 0,
    "total_transcriptions": 0,
    "month_transcriptions": 0,
    "last_used": "",
    "avg_daily": 0
  },
  "user": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "bar_color": "#FFFFFF",
  "bar_position": "top",
  "bar_opacity": 0.95,
  "referrals": 0
}
```

### Landing Page Config

Environment variables in `.env.local`:
```env
OPENAI_API_KEY=your-openai-api-key
```

**IMPORTANT**: The landing page requires the OpenAI API key to be set in `.env.local` for the voice transcription feature to work. The key is automatically synced from the desktop app's keychain.

---

## 🎯 Testing Checklist

### Landing Page
- [ ] Homepage loads at http://localhost:3001
- [ ] All sections visible (Hero, Platform, Speed, Personas, FAQ, Footer)
- [ ] FAQ accordion expands/collapses
- [ ] Footer links work
- [ ] Social media icons present
- [ ] Voice AI demo page works at /voice

### Desktop App
- [ ] App appears in menu bar
- [ ] Floating bar shows when Option key is pressed
- [ ] Voice recording works
- [ ] Review window appears after transcription
- [ ] Can switch between Professional/Casual/Concise styles
- [ ] Edit mode works on improved text
- [ ] Accept & Paste inserts text correctly
- [ ] Settings & Usage window opens
- [ ] Usage stats display correctly
- [ ] Name can be saved
- [ ] Affiliate link can be copied
- [ ] Floating bar customization works

---

## 🚢 Building for Production

### Landing Page

```bash
cd "/Users/joel/codiris voice/voice-landing"
npm run build
npm run start
```

### Desktop App

```bash
cd "/Users/joel/codiris voice"
python3 setup.py py2app
```

The app will be in `dist/Codiris Voice.app`

---

## 📊 Current Running Services

**Landing Page:**
- URL: http://localhost:3002
- Status: ✅ Running
- Note: Port may vary (3001, 3002, etc.) if other processes are using port 3000

**Desktop App:**
- Process ID: 55442
- Status: ✅ Running
- Logs: `/tmp/codiris_voice.log`

---

## 💡 Tips

1. **Keep Both Terminals Open**: One for Next.js, one for Python app
2. **Check Logs Frequently**: Use `tail -f` to monitor real-time logs
3. **Test Permissions Early**: Make sure all macOS permissions are granted
4. **Use Settings Window**: Track your usage and customize appearance
5. **Try Different Modes**: Experiment with Professional/Casual/Concise styles

---

## 🆘 Getting Help

- **Logs Location**: `/tmp/codiris_voice.log`
- **Config Location**: `~/.codiris_voice_config.json`
- **Check Process**: `ps aux | grep voicetype`
- **Check Port**: `lsof -i :3001`

---

## ✨ What's New in This Build

### Review Window
- Side-by-side comparison of original vs improved text
- Three refinement styles with instant regeneration
- Inline editing capability
- Clean dark/white design system

### Settings & Usage
- Comprehensive usage statistics tracking
- User profile management
- Affiliate program with unique referral links
- Floating bar customization (color, position, opacity)

### Landing Page
- FAQ section with 6 common questions
- Updated footer matching professional design standards
- Pricing information (completely free!)
- Improved mobile responsiveness

---

**Ready to test!** 🎉

Both services are running and ready for development. Start speaking with the Option key or browse the landing page at http://localhost:3001
