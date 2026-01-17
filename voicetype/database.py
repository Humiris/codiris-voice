"""
Database module for persisting transcription history and subscription info.
Uses SQLite for local storage.
"""
import sqlite3
import os
import requests
from datetime import datetime, timedelta

# Database path in user's home directory
DB_PATH = os.path.expanduser("~/.codiris_voice_history.db")

# Trial period duration
TRIAL_DAYS = 14

# API endpoint for subscription verification
API_BASE_URL = "https://voice.codiris.build"


def get_connection():
    """Get a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize the database schema"""
    conn = get_connection()
    cursor = conn.cursor()

    # Create history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            mode TEXT DEFAULT 'Raw',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            word_count INTEGER DEFAULT 0
        )
    ''')

    # Create stats table for daily tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_stats (
            date TEXT PRIMARY KEY,
            transcription_count INTEGER DEFAULT 0,
            word_count INTEGER DEFAULT 0,
            time_saved_minutes REAL DEFAULT 0
        )
    ''')

    # Create subscription table for freemium tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscription (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            trial_start_date TEXT,
            is_premium INTEGER DEFAULT 0,
            premium_until TEXT,
            stripe_customer_id TEXT,
            email TEXT
        )
    ''')

    # Initialize subscription record if not exists
    cursor.execute('''
        INSERT OR IGNORE INTO subscription (id, trial_start_date)
        VALUES (1, ?)
    ''', (datetime.now().isoformat(),))

    conn.commit()
    conn.close()


def add_transcription(text, mode='Raw'):
    """Add a new transcription to history"""
    conn = get_connection()
    cursor = conn.cursor()

    word_count = len(text.split())
    timestamp = datetime.now()

    # Insert into history
    cursor.execute('''
        INSERT INTO history (text, mode, timestamp, word_count)
        VALUES (?, ?, ?, ?)
    ''', (text, mode, timestamp, word_count))

    # Update daily stats
    today = timestamp.strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO daily_stats (date, transcription_count, word_count, time_saved_minutes)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            transcription_count = transcription_count + 1,
            word_count = word_count + ?,
            time_saved_minutes = time_saved_minutes + ?
    ''', (today, word_count, word_count / 40.0, word_count, word_count / 40.0))

    conn.commit()
    conn.close()


def get_history(limit=50):
    """Get recent transcription history"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT text, timestamp, mode, word_count
        FROM history
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))

    rows = cursor.fetchall()
    conn.close()

    # Convert to list of dicts with formatted time
    history = []
    for row in rows:
        timestamp = datetime.fromisoformat(row['timestamp'])
        history.append({
            'text': row['text'],
            'time': timestamp.strftime('%H:%M:%S'),
            'date': timestamp.strftime('%Y-%m-%d'),
            'mode': row['mode'],
            'word_count': row['word_count']
        })

    # Return in chronological order (oldest first for display)
    return list(reversed(history))


def get_today_stats():
    """Get statistics for today"""
    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('''
        SELECT transcription_count, word_count, time_saved_minutes
        FROM daily_stats
        WHERE date = ?
    ''', (today,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            'transcriptions': row['transcription_count'],
            'words': row['word_count'],
            'time_saved': round(row['time_saved_minutes'], 1)
        }
    return {'transcriptions': 0, 'words': 0, 'time_saved': 0}


def get_total_stats():
    """Get all-time statistics"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT
            SUM(transcription_count) as total_transcriptions,
            SUM(word_count) as total_words,
            SUM(time_saved_minutes) as total_time_saved
        FROM daily_stats
    ''')

    row = cursor.fetchone()
    conn.close()

    if row and row['total_transcriptions']:
        return {
            'transcriptions': row['total_transcriptions'],
            'words': row['total_words'],
            'time_saved': round(row['total_time_saved'], 1)
        }
    return {'transcriptions': 0, 'words': 0, 'time_saved': 0}


def clear_history():
    """Clear all history (for testing/reset)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM history')
    cursor.execute('DELETE FROM daily_stats')
    conn.commit()
    conn.close()


# ============ Subscription / Freemium Functions ============

def get_subscription_status():
    """Get current subscription status"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM subscription WHERE id = 1')
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            'is_premium': False,
            'trial_active': True,
            'trial_days_left': TRIAL_DAYS,
            'trial_expired': False
        }

    trial_start = datetime.fromisoformat(row['trial_start_date'])
    trial_end = trial_start + timedelta(days=TRIAL_DAYS)
    now = datetime.now()

    is_premium = bool(row['is_premium'])
    premium_until = row['premium_until']

    # Check if premium is still valid
    if is_premium and premium_until:
        premium_end = datetime.fromisoformat(premium_until)
        if now > premium_end:
            is_premium = False

    # Calculate trial status
    trial_days_left = max(0, (trial_end - now).days)
    trial_expired = now > trial_end and not is_premium

    return {
        'is_premium': is_premium,
        'trial_active': trial_days_left > 0 and not is_premium,
        'trial_days_left': trial_days_left,
        'trial_expired': trial_expired,
        'trial_start_date': row['trial_start_date'],
        'premium_until': premium_until,
        'email': row['email']
    }


def verify_subscription_online(email):
    """Verify subscription status via API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/stripe/verify",
            json={'email': email},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('isPremium'):
                # Update local database
                subscription = data.get('subscription', {})
                premium_until = None
                if subscription.get('currentPeriodEnd'):
                    premium_until = datetime.fromtimestamp(
                        subscription['currentPeriodEnd']
                    ).isoformat()
                set_premium(True, premium_until, email=email)
                return True
        return False
    except Exception as e:
        print(f"Error verifying subscription: {e}")
        return False


def can_use_app():
    """Check if user can use the app (trial active or premium)"""
    status = get_subscription_status()
    return status['is_premium'] or status['trial_active']


def set_premium(is_premium, premium_until=None, stripe_customer_id=None, email=None):
    """Update premium status"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE subscription
        SET is_premium = ?,
            premium_until = ?,
            stripe_customer_id = ?,
            email = COALESCE(?, email)
        WHERE id = 1
    ''', (1 if is_premium else 0, premium_until, stripe_customer_id, email))

    conn.commit()
    conn.close()


def set_email(email):
    """Set the user's email for subscription verification"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE subscription SET email = ? WHERE id = 1', (email,))
    conn.commit()
    conn.close()


def get_email():
    """Get the stored email"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT email FROM subscription WHERE id = 1')
    row = cursor.fetchone()
    conn.close()
    return row['email'] if row else None


def reset_trial():
    """Reset trial period (for testing)"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE subscription
        SET trial_start_date = ?,
            is_premium = 0,
            premium_until = NULL
        WHERE id = 1
    ''', (datetime.now().isoformat(),))

    conn.commit()
    conn.close()


# Initialize database on module import
init_database()
