# 🚀 Codiris Voice - Quick Start

## Current Status ✅

### Landing Page
- **URL**: http://localhost:3002
- **Status**: ✅ ACTIVE
- **Note**: Port may vary (check terminal output)

### Desktop App
- **Location**: Menu bar (top right of screen)
- **Process**: Running (PID: 55442)
- **Status**: ✅ ACTIVE

---

## 🎤 Using the Desktop App

### Basic Voice Transcription
1. **Hold** Option key
2. **Speak** your text
3. **Release** Option key
4. **Review window appears**:
   - Left side: What you said (original)
   - Right side: AI-improved version
5. **Choose action**:
   - Click style buttons (Professional/Casual/Concise) to regenerate
   - Click "Edit" to modify the improved text
   - Click "Accept & Paste" to insert into your active app
   - Click "Cancel" to dismiss

### Settings & Usage
1. Click **Codiris Voice** in menu bar
2. Select **Settings & Usage**
3. Explore three tabs:
   - **Usage**: See your stats (characters, requests, transcriptions)
   - **Settings**: Edit name, copy affiliate link
   - **Customization**: Change floating bar color, position, opacity

---

## 🌐 Landing Page Features

Visit: **http://localhost:3002**

**Pages:**
- `/` - Main landing page
- `/voice` - Interactive voice AI demo
- `/install` - Installation guide

**New Sections:**
- ✅ FAQ with 6 questions (including pricing: FREE!)
- ✅ Footer with Resources/Support/Legal links
- ✅ Social media icons
- ✅ System status indicator

---

## 🔧 Common Commands

### Stop Services
```bash
# Stop desktop app
pkill -f voicetype.main

# Stop landing page
# Press Ctrl+C in the terminal running npm dev
```

### Restart Services
```bash
# Restart desktop app
cd "/Users/joel/codiris voice"
python3 -m voicetype.main &

# Restart landing page
cd "/Users/joel/codiris voice/voice-landing"
npm run dev
```

### View Logs
```bash
# Desktop app logs
tail -f /tmp/codiris_voice.log

# Check if app is running
ps aux | grep voicetype | grep -v grep
```

---

## 📋 Quick Tests

### Test Review Window
1. Hold Option key
2. Say: "this is a test of the voice transcription feature"
3. Release Option
4. Verify review window shows both versions
5. Click "Professional" style
6. Click "Accept & Paste"

### Test Settings Window
1. Click menu bar icon
2. Select "Settings & Usage"
3. Go to Usage tab → verify stats
4. Go to Settings tab → copy affiliate link
5. Go to Customization tab → change bar color

### Test Landing Page
1. Open http://localhost:3002
2. Scroll to FAQ section
3. Click on any question
4. Verify it expands
5. Check footer links

---

## 🎯 What's Working

✅ Voice transcription with Option key
✅ Review window with original + improved text
✅ Three refinement styles (Professional/Casual/Concise)
✅ Edit capability for improved text
✅ Settings & Usage tracking
✅ Affiliate program with referral links
✅ Floating bar customization
✅ Landing page with FAQ and new footer
✅ Voice AI demo page
✅ Auto-paste to any application

---

## 🆘 Quick Troubleshooting

**App won't start?**
```bash
pkill -f voicetype.main
rm -f /tmp/voicetype.lock
python3 -m voicetype.main
```

**Review window not showing?**
```bash
tail -30 /tmp/codiris_voice.log
```

**Landing page not loading?**
- Check http://localhost:3002 in browser
- If port changed, check terminal for actual port number
- Make sure `.env.local` has the OPENAI_API_KEY set for voice features to work

---

**Everything is ready to test!** 🎉

Start with the desktop app: Hold Option key and speak!
