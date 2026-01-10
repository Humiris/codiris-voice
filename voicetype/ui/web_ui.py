import http.server
import socketserver
import threading
import webbrowser
import json

PORT = 8765
history = []
is_recording = False
is_processing = False

# User session data
current_user = None
pending_oauth_user = None

HTML_CONTENT = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codiris Voice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f7;
            min-height: 100vh;
        }

        /* Welcome Screen */
        .welcome-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            overflow-y: auto;
        }
        .welcome-screen.hidden {
            display: none;
        }
        .welcome-container {
            text-align: center;
            color: white;
            max-width: 700px;
            padding: 20px;
        }
        .welcome-logo {
            width: 70px;
            height: 70px;
            background: rgba(255,255,255,0.15);
            border-radius: 18px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }
        .welcome-logo img {
            width: 45px;
            height: 45px;
            border-radius: 10px;
        }
        .welcome-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .welcome-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
            line-height: 1.4;
        }

        /* Tutorial / How to use section */
        .tutorial-section {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }
        .tutorial-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .tutorial-steps {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        .tutorial-step {
            flex: 1;
            max-width: 160px;
            text-align: center;
        }
        .step-number {
            width: 26px;
            height: 26px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 8px;
            font-weight: 700;
            font-size: 14px;
        }
        .step-text {
            font-size: 12px;
            opacity: 0.95;
            line-height: 1.3;
        }

        /* Keyboard visual */
        .keyboard-container {
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 12px;
            margin-top: 12px;
        }
        .keyboard-label {
            font-size: 11px;
            opacity: 0.8;
            margin-bottom: 10px;
        }
        .keyboard {
            display: flex;
            flex-direction: column;
            gap: 3px;
            max-width: 420px;
            margin: 0 auto;
        }
        .keyboard-row {
            display: flex;
            justify-content: center;
            gap: 3px;
        }
        .key {
            background: linear-gradient(180deg, #4a4a4a 0%, #2d2d2d 100%);
            border: 1px solid #555;
            border-radius: 4px;
            padding: 4px 6px;
            min-width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #ddd;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
            transition: all 0.2s;
        }
        .key.wide { min-width: 36px; }
        .key.wider { min-width: 50px; }
        .key.widest { min-width: 65px; }
        .key.space { min-width: 140px; }
        .key.fn {
            background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
            border-color: #818cf8;
            color: white;
            font-weight: 700;
            animation: fnPulse 2s ease-in-out infinite;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.5), 0 1px 2px rgba(0,0,0,0.3);
        }
        @keyframes fnPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(99, 102, 241, 0.8); }
        }
        .fn-instruction {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
            font-size: 13px;
            font-weight: 500;
        }
        .fn-icon {
            background: rgba(255,255,255,0.2);
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
        }

        .welcome-features {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        .welcome-feature {
            text-align: center;
        }
        .welcome-feature-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 8px;
        }
        .welcome-feature-icon svg {
            width: 20px;
            height: 20px;
            stroke: white;
            fill: none;
        }
        .welcome-feature-text {
            font-size: 12px;
            opacity: 0.9;
            font-weight: 500;
        }

        /* Tutorial modal */
        .tutorial-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            backdrop-filter: blur(8px);
        }
        .tutorial-modal.visible {
            display: flex;
        }
        .tutorial-modal-content {
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            border-radius: 24px;
            padding: 40px;
            max-width: 650px;
            width: 90%;
            color: white;
            position: relative;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .tutorial-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255,255,255,0.1);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .tutorial-close:hover {
            background: rgba(255,255,255,0.2);
        }
        .tutorial-close svg {
            width: 20px;
            height: 20px;
            stroke: white;
        }

        /* Help button in sidebar */
        .help-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            color: white;
            cursor: pointer;
            margin-top: 16px;
            transition: all 0.2s;
            font-size: 14px;
        }
        .help-btn:hover {
            background: rgba(255,255,255,0.15);
        }
        .help-btn svg {
            width: 18px;
            height: 18px;
            stroke: currentColor;
        }
        .welcome-google-btn {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: white;
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .welcome-google-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(0,0,0,0.3);
        }
        .welcome-google-btn svg {
            width: 20px;
            height: 20px;
        }
        .welcome-terms {
            margin-top: 16px;
            font-size: 11px;
            opacity: 0.6;
        }
        .welcome-terms a {
            color: white;
            text-decoration: underline;
        }

        /* App Container (hidden until login) */
        .app-container {
            display: none;
        }
        .app-container.visible {
            display: block;
        }

        /* Sidebar */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 260px;
            background: linear-gradient(180deg, #2f0df4 0%, #1a0a8c 100%);
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
        }
        .logo-section img {
            width: 45px;
            height: 45px;
            border-radius: 12px;
        }
        .logo-section h1 {
            color: white;
            font-size: 20px;
            font-weight: 600;
        }
        .nav-menu {
            flex: 1;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            border-radius: 10px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .nav-item:hover, .nav-item.active {
            background: rgba(255,255,255,0.15);
            color: white;
        }
        .nav-item svg {
            width: 20px;
            height: 20px;
        }
        .user-section {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 20px;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }
        .user-name {
            font-size: 14px;
        }
        .user-plan {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
        }

        /* Main Content */
        .main-content {
            margin-left: 260px;
            padding: 40px;
            min-height: 100vh;
        }
        .page-header {
            margin-bottom: 30px;
        }
        .page-header h2 {
            font-size: 28px;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        .page-header p {
            color: #666;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .stat-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
        }
        .stat-card .value span {
            font-size: 16px;
            color: #999;
            font-weight: 400;
        }

        /* AI Modes Section */
        .section-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .section-card h3 {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .ai-modes-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .ai-mode {
            border: 2px solid #eee;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ai-mode:hover {
            border-color: #2f0df4;
        }
        .ai-mode.active {
            border-color: #2f0df4;
            background: #f8f6ff;
        }
        .ai-mode h4 {
            font-size: 16px;
            margin-bottom: 6px;
            color: #1a1a1a;
        }
        .ai-mode p {
            font-size: 13px;
            color: #666;
        }

        /* History Section */
        .history-list {
            max-height: 300px;
            overflow-y: auto;
        }
        .history-item {
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .history-item:last-child {
            border-bottom: none;
        }
        .history-text {
            flex: 1;
            font-size: 14px;
            color: #333;
        }
        .history-time {
            font-size: 12px;
            color: #999;
            margin-left: 15px;
        }
        .empty-history {
            color: #999;
            text-align: center;
            padding: 40px;
        }

        /* Waveform Visualizer */
        .waveform-section {
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            text-align: center;
        }
        .waveform-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 60px;
            margin-bottom: 15px;
        }
        .wave-bar {
            width: 4px;
            background: rgba(255,255,255,0.9);
            border-radius: 4px;
            transition: height 0.1s ease;
        }
        .waveform-container.idle .wave-bar {
            height: 8px;
            animation: idlePulse 2s ease-in-out infinite;
        }
        .waveform-container.recording .wave-bar {
            animation: waveAnimation 0.5s ease-in-out infinite;
        }
        .waveform-container.processing .wave-bar {
            animation: processingPulse 0.8s ease-in-out infinite;
            background: #fbbf24;
        }
        @keyframes idlePulse {
            0%, 100% { height: 8px; opacity: 0.5; }
            50% { height: 12px; opacity: 0.8; }
        }
        @keyframes waveAnimation {
            0%, 100% { height: 10px; }
            50% { height: var(--wave-height, 40px); }
        }
        @keyframes processingPulse {
            0%, 100% { height: 15px; opacity: 0.6; }
            50% { height: 25px; opacity: 1; }
        }
        .wave-bar:nth-child(1) { --wave-height: 25px; animation-delay: 0s; }
        .wave-bar:nth-child(2) { --wave-height: 35px; animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { --wave-height: 45px; animation-delay: 0.15s; }
        .wave-bar:nth-child(4) { --wave-height: 55px; animation-delay: 0.2s; }
        .wave-bar:nth-child(5) { --wave-height: 50px; animation-delay: 0.25s; }
        .wave-bar:nth-child(6) { --wave-height: 55px; animation-delay: 0.2s; }
        .wave-bar:nth-child(7) { --wave-height: 45px; animation-delay: 0.15s; }
        .wave-bar:nth-child(8) { --wave-height: 35px; animation-delay: 0.1s; }
        .wave-bar:nth-child(9) { --wave-height: 25px; animation-delay: 0.05s; }
        .status-text {
            color: white;
            font-size: 16px;
        }

        /* Page specific styles */
        .page { display: none; }
        .page.active { display: block; }

        /* Settings page */
        .settings-group {
            margin-bottom: 30px;
        }
        .settings-group h4 {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .setting-label {
            font-size: 15px;
            color: #1a1a1a;
        }
        .setting-desc {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
        }
        .toggle {
            width: 50px;
            height: 28px;
            background: #ddd;
            border-radius: 14px;
            position: relative;
            cursor: pointer;
            transition: background 0.2s;
        }
        .toggle.active {
            background: #2f0df4;
        }
        .toggle::after {
            content: '';
            position: absolute;
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle.active::after {
            transform: translateX(22px);
        }
        select {
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            cursor: pointer;
        }

        /* Account page */
        .plan-card {
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            border-radius: 16px;
            padding: 30px;
            color: white;
            margin-bottom: 20px;
        }
        .plan-card h3 {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 8px;
        }
        .plan-card .plan-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .plan-features {
            display: flex;
            gap: 30px;
        }
        .plan-feature {
            font-size: 14px;
        }
        .upgrade-btn {
            background: white;
            color: #2f0df4;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
        }

        /* Login styles */
        .login-section {
            text-align: center;
            padding: 60px 40px;
        }
        .login-section h3 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #1a1a1a;
        }
        .login-section p {
            color: #666;
            margin-bottom: 30px;
        }
        .google-btn {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: white;
            border: 2px solid #e0e0e0;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            color: #333;
            cursor: pointer;
            transition: all 0.2s;
        }
        .google-btn:hover {
            border-color: #2f0df4;
            box-shadow: 0 4px 12px rgba(47, 13, 244, 0.15);
        }
        .google-btn svg {
            width: 24px;
            height: 24px;
        }
        .user-profile {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        .user-profile img {
            width: 64px;
            height: 64px;
            border-radius: 50%;
        }
        .user-profile-info h4 {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        .user-profile-info p {
            color: #666;
            font-size: 14px;
        }
        .logout-btn {
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            margin-left: auto;
        }
        .logout-btn:hover {
            background: #dd3333;
        }
    </style>
</head>
<body>
    <!-- Welcome Screen (shown before login) -->
    <div class="welcome-screen" id="welcome-screen">
        <div class="welcome-container">
            <div class="welcome-logo">
                <img src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg" alt="Codiris">
            </div>
            <h1 class="welcome-title">Welcome to Codiris Voice</h1>
            <p class="welcome-subtitle">Transform your voice into text instantly with AI-powered transcription</p>

            <!-- Tutorial Section -->
            <div class="tutorial-section">
                <div class="tutorial-title">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    How to Use
                </div>

                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-text">Hold the <strong>fn</strong> key on your keyboard</div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-text">Speak clearly into your microphone</div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-text">Release the key to transcribe</div>
                    </div>
                </div>

                <!-- Visual Keyboard -->
                <div class="keyboard-container">
                    <div class="keyboard-label">Press and hold the highlighted key to record</div>
                    <div class="keyboard">
                        <!-- Row 1 - Function keys -->
                        <div class="keyboard-row">
                            <div class="key">esc</div>
                            <div class="key">F1</div>
                            <div class="key">F2</div>
                            <div class="key">F3</div>
                            <div class="key">F4</div>
                            <div class="key">F5</div>
                            <div class="key">F6</div>
                            <div class="key">F7</div>
                            <div class="key">F8</div>
                            <div class="key">F9</div>
                            <div class="key">F10</div>
                            <div class="key">F11</div>
                            <div class="key">F12</div>
                        </div>
                        <!-- Row 2 - Numbers -->
                        <div class="keyboard-row">
                            <div class="key">`</div>
                            <div class="key">1</div>
                            <div class="key">2</div>
                            <div class="key">3</div>
                            <div class="key">4</div>
                            <div class="key">5</div>
                            <div class="key">6</div>
                            <div class="key">7</div>
                            <div class="key">8</div>
                            <div class="key">9</div>
                            <div class="key">0</div>
                            <div class="key">-</div>
                            <div class="key">=</div>
                            <div class="key wide">del</div>
                        </div>
                        <!-- Row 3 - QWERTY -->
                        <div class="keyboard-row">
                            <div class="key wide">tab</div>
                            <div class="key">Q</div>
                            <div class="key">W</div>
                            <div class="key">E</div>
                            <div class="key">R</div>
                            <div class="key">T</div>
                            <div class="key">Y</div>
                            <div class="key">U</div>
                            <div class="key">I</div>
                            <div class="key">O</div>
                            <div class="key">P</div>
                            <div class="key">[</div>
                            <div class="key">]</div>
                            <div class="key">\\</div>
                        </div>
                        <!-- Row 4 - ASDF -->
                        <div class="keyboard-row">
                            <div class="key wider">caps</div>
                            <div class="key">A</div>
                            <div class="key">S</div>
                            <div class="key">D</div>
                            <div class="key">F</div>
                            <div class="key">G</div>
                            <div class="key">H</div>
                            <div class="key">J</div>
                            <div class="key">K</div>
                            <div class="key">L</div>
                            <div class="key">;</div>
                            <div class="key">'</div>
                            <div class="key wider">return</div>
                        </div>
                        <!-- Row 5 - ZXCV -->
                        <div class="keyboard-row">
                            <div class="key widest">shift</div>
                            <div class="key">Z</div>
                            <div class="key">X</div>
                            <div class="key">C</div>
                            <div class="key">V</div>
                            <div class="key">B</div>
                            <div class="key">N</div>
                            <div class="key">M</div>
                            <div class="key">,</div>
                            <div class="key">.</div>
                            <div class="key">/</div>
                            <div class="key widest">shift</div>
                        </div>
                        <!-- Row 6 - Bottom row with Option key highlighted -->
                        <div class="keyboard-row">
                            <div class="key">fn</div>
                            <div class="key wide">ctrl</div>
                            <div class="key wide fn">opt</div>
                            <div class="key wider">cmd</div>
                            <div class="key space">space</div>
                            <div class="key wider">cmd</div>
                            <div class="key wide fn">opt</div>
                            <div class="key">&#9664;</div>
                            <div class="key">&#9650;<br>&#9660;</div>
                            <div class="key">&#9654;</div>
                        </div>
                    </div>

                    <div class="fn-instruction">
                        <span class="fn-icon">&#8997; Option</span>
                        <span>Hold to record, release to transcribe</span>
                    </div>
                </div>
            </div>

            <div class="welcome-features">
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">
                        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                    </div>
                    <div class="welcome-feature-text">Voice to Text</div>
                </div>
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">
                        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <div class="welcome-feature-text">AI Enhanced</div>
                </div>
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">
                        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div class="welcome-feature-text">Multi-language</div>
                </div>
            </div>

            <button class="welcome-google-btn" onclick="signInWithGoogle()">
                <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            </button>

            <p class="welcome-terms">By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
        </div>
    </div>

    <!-- App Container (shown after login) -->
    <div class="app-container" id="app-container">
        <!-- Sidebar -->
        <div class="sidebar">
        <div class="logo-section">
            <img src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg" alt="Codiris">
            <h1>Codiris Voice</h1>
        </div>

        <nav class="nav-menu">
            <div class="nav-item active" onclick="showPage('dashboard')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Dashboard
            </div>
            <div class="nav-item" onclick="showPage('ai-modes')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                AI Modes
            </div>
            <div class="nav-item" onclick="showPage('history')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                History
            </div>
            <div class="nav-item" onclick="showPage('settings')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Settings
            </div>
            <div class="nav-item" onclick="showPage('account')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Account
            </div>
        </nav>

        <div class="user-section">
            <div class="user-info" id="sidebar-user">
                <div class="user-avatar" id="sidebar-avatar">?</div>
                <div>
                    <div class="user-name" id="sidebar-name">Not signed in</div>
                    <div class="user-plan" id="sidebar-plan">Sign in to continue</div>
                </div>
            </div>
            <button class="help-btn" onclick="showTutorial()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                How to Use
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Dashboard Page -->
        <div class="page active" id="page-dashboard">
            <div class="page-header">
                <h2>Dashboard</h2>
                <p>Monitor your voice dictation activity</p>
            </div>

            <div class="waveform-section">
                <div class="waveform-container idle" id="waveform">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
                <p class="status-text" id="statusText">Ready - Hold Option key to start</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Transcriptions Today</h3>
                    <div class="value" id="todayCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>Words Transcribed</h3>
                    <div class="value" id="wordCount">0</div>
                </div>
                <div class="stat-card">
                    <h3>Time Saved</h3>
                    <div class="value" id="timeSaved">0 <span>min</span></div>
                </div>
            </div>

            <div class="section-card">
                <h3>Recent Activity</h3>
                <div class="history-list" id="recentHistory">
                    <p class="empty-history">Your recent transcriptions will appear here...</p>
                </div>
            </div>
        </div>

        <!-- AI Modes Page -->
        <div class="page" id="page-ai-modes">
            <div class="page-header">
                <h2>AI Enhancement Modes</h2>
                <p>Choose how AI processes your voice transcriptions</p>
            </div>

            <div class="section-card">
                <h3>Select Mode</h3>
                <div class="ai-modes-grid">
                    <div class="ai-mode active" onclick="selectMode('Raw', this)">
                        <h4>Raw</h4>
                        <p>No processing - exact transcription of your speech</p>
                    </div>
                    <div class="ai-mode" onclick="selectMode('Clean', this)">
                        <h4>Clean</h4>
                        <p>Fix grammar, punctuation, and capitalization</p>
                    </div>
                    <div class="ai-mode" onclick="selectMode('Format', this)">
                        <h4>Format</h4>
                        <p>Professional formatting with proper structure</p>
                    </div>
                    <div class="ai-mode" onclick="selectMode('Email', this)">
                        <h4>Email</h4>
                        <p>Convert speech into professional email format</p>
                    </div>
                    <div class="ai-mode" onclick="selectMode('Code', this)">
                        <h4>Code</h4>
                        <p>Format as code comments or documentation</p>
                    </div>
                    <div class="ai-mode" onclick="selectMode('Notes', this)">
                        <h4>Notes</h4>
                        <p>Structure as meeting notes with bullet points</p>
                    </div>
                </div>
            </div>

            <div class="section-card">
                <h3>Voice Commands</h3>
                <div class="history-list">
                    <div class="history-item">
                        <div class="history-text"><strong>"new line"</strong> - Insert a new line</div>
                    </div>
                    <div class="history-item">
                        <div class="history-text"><strong>"new paragraph"</strong> - Insert two new lines</div>
                    </div>
                    <div class="history-item">
                        <div class="history-text"><strong>"delete that"</strong> - Delete last transcription</div>
                    </div>
                    <div class="history-item">
                        <div class="history-text"><strong>"period" / "comma" / "question mark"</strong> - Insert punctuation</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- History Page -->
        <div class="page" id="page-history">
            <div class="page-header">
                <h2>Transcription History</h2>
                <p>View all your past transcriptions</p>
            </div>

            <div class="section-card">
                <div class="history-list" id="fullHistory">
                    <p class="empty-history">Your transcriptions will appear here...</p>
                </div>
            </div>
        </div>

        <!-- Settings Page -->
        <div class="page" id="page-settings">
            <div class="page-header">
                <h2>Settings</h2>
                <p>Configure your Codiris Voice preferences</p>
            </div>

            <div class="section-card">
                <div class="settings-group">
                    <h4>Transcription</h4>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Local Processing</div>
                            <div class="setting-desc">Use offline Whisper model (slower but private)</div>
                        </div>
                        <div class="toggle" onclick="this.classList.toggle('active')"></div>
                    </div>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Copy to Clipboard</div>
                            <div class="setting-desc">Copy text to clipboard instead of typing</div>
                        </div>
                        <div class="toggle" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>

                <div class="settings-group">
                    <h4>Language</h4>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Language Mode</div>
                            <div class="setting-desc">Auto-detect or choose specific language(s)</div>
                        </div>
                        <select id="languageMode" onchange="updateLanguageMode(this.value)">
                            <option value="auto">Auto-detect (Multilingual)</option>
                            <option value="en">English only</option>
                            <option value="fr">French only</option>
                            <option value="es">Spanish only</option>
                            <option value="de">German only</option>
                            <option value="it">Italian only</option>
                            <option value="pt">Portuguese only</option>
                            <option value="zh">Chinese only</option>
                            <option value="ja">Japanese only</option>
                            <option value="ar">Arabic only</option>
                            <option value="ru">Russian only</option>
                            <option value="ko">Korean only</option>
                            <option value="nl">Dutch only</option>
                            <option value="pl">Polish only</option>
                            <option value="tr">Turkish only</option>
                            <option value="vi">Vietnamese only</option>
                            <option value="th">Thai only</option>
                            <option value="hi">Hindi only</option>
                        </select>
                    </div>
                </div>

                <div class="settings-group">
                    <h4>Floating Bar</h4>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Bar Position</div>
                            <div class="setting-desc">Where to show the floating bar</div>
                        </div>
                        <select id="barPosition" onchange="updateBarPosition(this.value)">
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Wave Color</div>
                            <div class="setting-desc">Color of the waveform bars</div>
                        </div>
                        <input type="color" id="barColor" value="#FFFFFF" onchange="updateBarColor(this.value)" style="width: 50px; height: 35px; border: none; cursor: pointer;">
                    </div>
                </div>

                <div class="settings-group">
                    <h4>Hotkey</h4>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Activation Key</div>
                            <div class="setting-desc">Currently using fn/globe key</div>
                        </div>
                        <span style="color: #2f0df4; font-weight: 600;">fn (🌐)</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Account Page -->
        <div class="page" id="page-account">
            <div class="page-header">
                <h2>Account</h2>
                <p>Manage your Codiris Voice account</p>
            </div>

            <!-- Login Section (shown when not logged in) -->
            <div class="section-card" id="login-section">
                <div class="login-section">
                    <h3>Sign in to Codiris Voice</h3>
                    <p>Connect your account to sync settings across devices and access premium features</p>
                    <button class="google-btn" onclick="signInWithGoogle()">
                        <svg viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>

            <!-- User Profile Section (shown when logged in) -->
            <div id="user-section" style="display: none;">
                <div class="section-card">
                    <div class="user-profile" id="user-profile">
                        <img id="user-avatar" src="" alt="Profile">
                        <div class="user-profile-info">
                            <h4 id="user-name">User Name</h4>
                            <p id="user-email">user@example.com</p>
                        </div>
                        <button class="logout-btn" onclick="signOut()">Sign Out</button>
                    </div>
                </div>

                <div class="plan-card">
                    <h3>CURRENT PLAN</h3>
                    <div class="plan-name">Pro Plan</div>
                    <div class="plan-features">
                        <div class="plan-feature">✓ Unlimited transcriptions</div>
                        <div class="plan-feature">✓ AI enhancement modes</div>
                        <div class="plan-feature">✓ Priority processing</div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="settings-group">
                        <h4>Usage This Month</h4>
                        <div class="setting-item">
                            <div>
                                <div class="setting-label">API Calls</div>
                                <div class="setting-desc">Whisper + GPT-4o-mini requests</div>
                            </div>
                            <div style="font-weight: 600; color: #2f0df4;" id="apiCalls">0 / Unlimited</div>
                        </div>
                        <div class="setting-item">
                            <div>
                                <div class="setting-label">Words Processed</div>
                                <div class="setting-desc">Total words transcribed this month</div>
                            </div>
                            <div style="font-weight: 600;" id="totalWords">0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div> <!-- End app-container -->

    <!-- Tutorial Modal (accessible anytime) -->
    <div class="tutorial-modal" id="tutorial-modal">
        <div class="tutorial-modal-content">
            <button class="tutorial-close" onclick="closeTutorial()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div class="tutorial-title" style="margin-bottom: 20px; font-size: 22px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                How to Use Codiris Voice
            </div>

            <div class="tutorial-steps" style="margin-bottom: 25px;">
                <div class="tutorial-step">
                    <div class="step-number">1</div>
                    <div class="step-text">Hold the <strong>fn</strong> key on your keyboard</div>
                </div>
                <div class="tutorial-step">
                    <div class="step-number">2</div>
                    <div class="step-text">Speak clearly into your microphone</div>
                </div>
                <div class="tutorial-step">
                    <div class="step-number">3</div>
                    <div class="step-text">Release the key to transcribe</div>
                </div>
            </div>

            <!-- Visual Keyboard -->
            <div class="keyboard-container" style="background: rgba(0,0,0,0.2);">
                <div class="keyboard-label">Press and hold the highlighted key to record</div>
                <div class="keyboard">
                    <div class="keyboard-row">
                        <div class="key">esc</div>
                        <div class="key">F1</div>
                        <div class="key">F2</div>
                        <div class="key">F3</div>
                        <div class="key">F4</div>
                        <div class="key">F5</div>
                        <div class="key">F6</div>
                        <div class="key">F7</div>
                        <div class="key">F8</div>
                        <div class="key">F9</div>
                        <div class="key">F10</div>
                        <div class="key">F11</div>
                        <div class="key">F12</div>
                    </div>
                    <div class="keyboard-row">
                        <div class="key">`</div>
                        <div class="key">1</div>
                        <div class="key">2</div>
                        <div class="key">3</div>
                        <div class="key">4</div>
                        <div class="key">5</div>
                        <div class="key">6</div>
                        <div class="key">7</div>
                        <div class="key">8</div>
                        <div class="key">9</div>
                        <div class="key">0</div>
                        <div class="key">-</div>
                        <div class="key">=</div>
                        <div class="key wide">del</div>
                    </div>
                    <div class="keyboard-row">
                        <div class="key wide">tab</div>
                        <div class="key">Q</div>
                        <div class="key">W</div>
                        <div class="key">E</div>
                        <div class="key">R</div>
                        <div class="key">T</div>
                        <div class="key">Y</div>
                        <div class="key">U</div>
                        <div class="key">I</div>
                        <div class="key">O</div>
                        <div class="key">P</div>
                        <div class="key">[</div>
                        <div class="key">]</div>
                        <div class="key">\\</div>
                    </div>
                    <div class="keyboard-row">
                        <div class="key wider">caps</div>
                        <div class="key">A</div>
                        <div class="key">S</div>
                        <div class="key">D</div>
                        <div class="key">F</div>
                        <div class="key">G</div>
                        <div class="key">H</div>
                        <div class="key">J</div>
                        <div class="key">K</div>
                        <div class="key">L</div>
                        <div class="key">;</div>
                        <div class="key">'</div>
                        <div class="key wider">return</div>
                    </div>
                    <div class="keyboard-row">
                        <div class="key widest">shift</div>
                        <div class="key">Z</div>
                        <div class="key">X</div>
                        <div class="key">C</div>
                        <div class="key">V</div>
                        <div class="key">B</div>
                        <div class="key">N</div>
                        <div class="key">M</div>
                        <div class="key">,</div>
                        <div class="key">.</div>
                        <div class="key">/</div>
                        <div class="key widest">shift</div>
                    </div>
                    <div class="keyboard-row">
                        <div class="key">fn</div>
                        <div class="key wide">ctrl</div>
                        <div class="key wide fn">opt</div>
                        <div class="key wider">cmd</div>
                        <div class="key space">space</div>
                        <div class="key wider">cmd</div>
                        <div class="key wide fn">opt</div>
                        <div class="key">&#9664;</div>
                        <div class="key">&#9650;<br>&#9660;</div>
                        <div class="key">&#9654;</div>
                    </div>
                </div>
                <div class="fn-instruction">
                    <span class="fn-icon">&#8997; Option</span>
                    <span>Hold to record, release to transcribe</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Google Sign-In -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <script>
        let currentMode = 'Raw';
        let stats = { transcriptions: 0, words: 0 };
        let currentUser = null;

        // Google Sign-In Configuration
        // Replace with your Google Client ID from Google Cloud Console
        const GOOGLE_CLIENT_ID = '441615142773-2v6d3enho3q23oknrf3jr043coqit8o7.apps.googleusercontent.com';

        function initGoogleSignIn() {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                    auto_select: true
                });
            }
        }

        function signInWithGoogle() {
            // Request server to open browser
            fetch('/open-google-auth', { method: 'POST' });

            // Start polling for login result
            pollForLogin();
        }

        function pollForLogin() {
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch('/check-oauth');
                    const data = await response.json();
                    if (data.user) {
                        clearInterval(pollInterval);
                        handleUserLogin(data.user);
                    }
                } catch (e) {}
            }, 1000);

            // Stop polling after 5 minutes
            setTimeout(() => clearInterval(pollInterval), 300000);
        }

        function fetchGoogleUserInfo(accessToken) {
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': 'Bearer ' + accessToken }
            })
            .then(response => response.json())
            .then(userInfo => {
                handleUserLogin(userInfo);
            });
        }

        function handleGoogleSignIn(response) {
            // Decode JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            handleUserLogin({
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            });
        }

        function handleUserLogin(user) {
            currentUser = user;

            // Save to server
            fetch('/set-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            // Save to localStorage for persistence
            localStorage.setItem('codiris_user', JSON.stringify(user));

            updateUIForUser(user);
        }

        function simulateLogin() {
            // For demo/testing without Google API
            const demoUser = {
                name: 'Demo User',
                email: 'demo@codiris.com',
                picture: 'https://ui-avatars.com/api/?name=Demo+User&background=2f0df4&color=fff&size=128'
            };
            handleUserLogin(demoUser);
        }

        function updateUIForUser(user) {
            // Hide welcome screen, show app
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('app-container').classList.add('visible');

            // Update sidebar
            document.getElementById('sidebar-avatar').textContent = user.name.charAt(0).toUpperCase();
            document.getElementById('sidebar-avatar').style.backgroundImage = user.picture ? 'url(' + user.picture + ')' : '';
            document.getElementById('sidebar-avatar').style.backgroundSize = 'cover';
            if (user.picture) {
                document.getElementById('sidebar-avatar').textContent = '';
            }
            document.getElementById('sidebar-name').textContent = user.name;
            document.getElementById('sidebar-plan').textContent = 'Pro Plan';

            // Update account page
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('user-section').style.display = 'block';
            document.getElementById('user-avatar').src = user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=2f0df4&color=fff';
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-email').textContent = user.email;
        }

        function signOut() {
            currentUser = null;
            localStorage.removeItem('codiris_user');

            // Notify server
            fetch('/logout', { method: 'POST' });

            // Show welcome screen, hide app
            document.getElementById('welcome-screen').classList.remove('hidden');
            document.getElementById('app-container').classList.remove('visible');

            // Reset UI
            document.getElementById('sidebar-avatar').textContent = '?';
            document.getElementById('sidebar-avatar').style.backgroundImage = '';
            document.getElementById('sidebar-name').textContent = 'Not signed in';
            document.getElementById('sidebar-plan').textContent = 'Sign in to continue';

            document.getElementById('login-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';

            // Revoke Google access if available
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }
        }

        function checkExistingLogin() {
            const savedUser = localStorage.getItem('codiris_user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    currentUser = user;
                    updateUIForUser(user);
                } catch (e) {
                    localStorage.removeItem('codiris_user');
                }
            }
        }

        // Tutorial modal functions
        function showTutorial() {
            document.getElementById('tutorial-modal').classList.add('visible');
        }

        function closeTutorial() {
            document.getElementById('tutorial-modal').classList.remove('visible');
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            const modal = document.getElementById('tutorial-modal');
            if (e.target === modal) {
                closeTutorial();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeTutorial();
            }
        });

        // Initialize on page load
        window.onload = function() {
            checkExistingLogin();
            setTimeout(initGoogleSignIn, 500);
        };

        function showPage(pageName) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

            // Show selected page
            document.getElementById('page-' + pageName).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        function selectMode(mode, element) {
            document.querySelectorAll('.ai-mode').forEach(m => m.classList.remove('active'));
            element.classList.add('active');
            currentMode = mode;

            // Save to server
            fetch('/set-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: mode })
            });
        }

        function updateLanguageMode(value) {
            fetch('/set-setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'language', value: value })
            });
        }

        function updateBarPosition(value) {
            fetch('/set-setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'bar_position', value: value })
            });
        }

        function updateBarColor(value) {
            fetch('/set-setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'bar_color', value: value })
            });
        }

        // Poll status every 500ms
        setInterval(async () => {
            try {
                const response = await fetch('/status');
                const data = await response.json();

                const waveform = document.getElementById('waveform');
                const statusText = document.getElementById('statusText');

                waveform.className = 'waveform-container ' + data.state;

                if (data.state === 'recording') {
                    statusText.textContent = 'Recording... Release key when done';
                } else if (data.state === 'processing') {
                    statusText.textContent = 'Processing your speech...';
                } else {
                    statusText.textContent = 'Ready - Hold fn key to start';
                }

                // Update history
                if (data.history && data.history.length > 0) {
                    const recentHtml = data.history.slice(-5).reverse().map(item =>
                        `<div class="history-item">
                            <div class="history-text">${item.text}</div>
                            <div class="history-time">${item.time}</div>
                        </div>`
                    ).join('');
                    document.getElementById('recentHistory').innerHTML = recentHtml;

                    const fullHtml = data.history.slice().reverse().map(item =>
                        `<div class="history-item">
                            <div class="history-text">${item.text}</div>
                            <div class="history-time">${item.time}</div>
                        </div>`
                    ).join('');
                    document.getElementById('fullHistory').innerHTML = fullHtml;

                    // Update stats
                    document.getElementById('todayCount').textContent = data.history.length;
                    const words = data.history.reduce((sum, item) => sum + item.text.split(' ').length, 0);
                    document.getElementById('wordCount').textContent = words;
                    document.getElementById('timeSaved').innerHTML = Math.round(words / 40) + ' <span>min</span>';
                    document.getElementById('totalWords').textContent = words;
                    document.getElementById('apiCalls').textContent = data.history.length + ' / Unlimited';
                }
            } catch (e) {}
        }, 500);
    </script>
</body>
</html>
'''

OAUTH_SUCCESS_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>Success!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
        }
        h1 { font-size: 24px; margin-bottom: 20px; color: #4ade80; }
        p { opacity: 0.8; }
        .checkmark {
            font-size: 48px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkmark">&#10003;</div>
        <h1>Success!</h1>
        <p>You can close this window and return to Codiris Voice</p>
    </div>
    <script>
        setTimeout(() => window.close(), 2000);
    </script>
</body>
</html>
'''

OAUTH_ERROR_HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #2f0df4 0%, #1a0a8c 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
        }
        h1 { font-size: 24px; margin-bottom: 20px; color: #f87171; }
        p { opacity: 0.8; }
        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">&#10007;</div>
        <h1>Sign-in Failed</h1>
        <p>Please close this window and try again</p>
    </div>
</body>
</html>
'''


class WebUIHandler(http.server.SimpleHTTPRequestHandler):
    # Import security module
    try:
        from voicetype.security import (
            get_rate_limiter, RequestValidator, SecurityException,
            add_security_headers, SECURITY_HEADERS
        )
        SECURITY_ENABLED = True
    except ImportError:
        SECURITY_ENABLED = False

    def _get_client_ip(self):
        """Get client IP address"""
        return self.client_address[0] if self.client_address else 'unknown'

    def _check_rate_limit(self):
        """Check if request should be rate limited"""
        if not self.SECURITY_ENABLED:
            return True
        from voicetype.security import get_rate_limiter
        limiter = get_rate_limiter()
        return limiter.is_allowed(self._get_client_ip())

    def _add_security_headers(self):
        """Add security headers to response"""
        if self.SECURITY_ENABLED:
            from voicetype.security import SECURITY_HEADERS
            for header, value in SECURITY_HEADERS.items():
                self.send_header(header, value)

    def _validate_request(self):
        """Validate the incoming request"""
        if not self.SECURITY_ENABLED:
            return True

        from voicetype.security import RequestValidator

        # Validate path
        if not RequestValidator.validate_path(self.path):
            return False

        # Validate origin
        origin = self.headers.get('Origin', '')
        if origin and not RequestValidator.validate_origin(origin):
            return False

        return True

    def _send_error_response(self, code, message):
        """Send an error response"""
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self._add_security_headers()
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode())

    def do_GET(self):
        global pending_oauth_user

        # Rate limiting check
        if not self._check_rate_limit():
            self._send_error_response(429, 'Too many requests. Please slow down.')
            return

        # Validate request
        if not self._validate_request():
            self._send_error_response(403, 'Forbidden')
            return

        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self._add_security_headers()
            self.end_headers()
            self.wfile.write(HTML_CONTENT.encode())
        elif self.path.startswith('/api/auth/google/callback'):
            # Handle OAuth callback with authorization code
            from urllib.parse import urlparse, parse_qs
            import requests

            query = urlparse(self.path).query
            params = parse_qs(query)
            code = params.get('code', [None])[0]

            if code:
                # Exchange code for tokens
                client_id = '441615142773-2v6d3enho3q23oknrf3jr043coqit8o7.apps.googleusercontent.com'
                client_secret = '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'
                redirect_uri = 'http://localhost:8765/api/auth/google/callback'

                token_response = requests.post('https://oauth2.googleapis.com/token', data={
                    'code': code,
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'redirect_uri': redirect_uri,
                    'grant_type': 'authorization_code'
                })

                if token_response.status_code == 200:
                    tokens = token_response.json()
                    access_token = tokens.get('access_token')

                    # Get user info
                    user_response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo',
                        headers={'Authorization': f'Bearer {access_token}'})

                    if user_response.status_code == 200:
                        user_info = user_response.json()
                        pending_oauth_user = {
                            'name': user_info.get('name', ''),
                            'email': user_info.get('email', ''),
                            'picture': user_info.get('picture', '')
                        }
                        current_user = pending_oauth_user
                        from voicetype.settings import load_config, save_config
                        config = load_config()
                        config['user'] = pending_oauth_user
                        save_config(config)

                        # Show success page
                        self.send_response(200)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        self.wfile.write(OAUTH_SUCCESS_HTML.encode())
                        return

            # Show error page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(OAUTH_ERROR_HTML.encode())
        elif self.path == '/check-oauth':
            # Check if OAuth completed
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            if pending_oauth_user:
                user = pending_oauth_user
                pending_oauth_user = None
                self.wfile.write(json.dumps({'user': user}).encode())
            else:
                self.wfile.write(json.dumps({'user': None}).encode())
        elif self.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            state = 'idle'
            if is_recording:
                state = 'recording'
            elif is_processing:
                state = 'processing'
            self.wfile.write(json.dumps({
                'state': state,
                'history': history
            }).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        global current_user, pending_oauth_user

        # Rate limiting check
        if not self._check_rate_limit():
            self._send_error_response(429, 'Too many requests. Please slow down.')
            return

        # Validate request
        if not self._validate_request():
            self._send_error_response(403, 'Forbidden')
            return

        # Validate content length to prevent large payload attacks
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 1024 * 1024:  # 1MB max
            self._send_error_response(413, 'Request too large')
            return

        if self.path == '/open-google-auth':
            # Open Google OAuth in system browser using subprocess
            import subprocess
            from urllib.parse import urlencode
            client_id = '441615142773-2v6d3enho3q23oknrf3jr043coqit8o7.apps.googleusercontent.com'
            redirect_uri = 'http://localhost:8765/api/auth/google/callback'
            params = {
                'client_id': client_id,
                'redirect_uri': redirect_uri,
                'response_type': 'code',
                'scope': 'email profile',
                'prompt': 'select_account',
                'access_type': 'offline'
            }
            auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode(params)
            subprocess.run(['open', auth_url])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        elif self.path == '/complete-oauth':
            # OAuth callback from browser
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            pending_oauth_user = {
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'picture': data.get('picture', '')
            }
            # Also save as current user
            current_user = pending_oauth_user
            from voicetype.settings import load_config, save_config
            config = load_config()
            config['user'] = pending_oauth_user
            save_config(config)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        elif self.path == '/set-mode':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            # Mode setting would be handled here
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        elif self.path == '/set-setting':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            # Save setting to config
            from voicetype.settings import load_config, save_config
            config = load_config()
            config[data['key']] = data['value']
            save_config(config)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        elif self.path == '/set-user':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            current_user = data
            # Save user to config
            from voicetype.settings import load_config, save_config
            config = load_config()
            config['user'] = data
            save_config(config)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        elif self.path == '/logout':
            current_user = None
            # Remove user from config
            from voicetype.settings import load_config, save_config
            config = load_config()
            if 'user' in config:
                del config['user']
            save_config(config)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass


def set_recording(value):
    global is_recording
    is_recording = value


def set_processing(value):
    global is_processing
    is_processing = value


def add_to_history(text):
    from datetime import datetime
    history.append({
        'time': datetime.now().strftime('%H:%M:%S'),
        'text': text
    })
    if len(history) > 50:
        history.pop(0)


def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), WebUIHandler) as httpd:
            httpd.serve_forever()
    except OSError:
        pass  # Port already in use, likely another instance running


def open_ui():
    webbrowser.open(f'http://localhost:{PORT}')


def start_web_ui():
    """Start the web server (doesn't open browser anymore - use dashboard window)"""
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
