import json
import os

CONFIG_PATH = os.path.expanduser("~/.codiris_voice_config.json")

# Try to use secure storage
try:
    from voicetype.security import get_secure_storage, secure_api_key, get_api_key
    SECURITY_AVAILABLE = True
except ImportError:
    SECURITY_AVAILABLE = False

# Sensitive keys that should be encrypted
SENSITIVE_KEYS = ['api_key', 'google_client_secret']

DEFAULT_CONFIG = {
    "api_key": "",  # Will be stored securely in keychain
    "hotkey": "fn",  # Using fn/globe key
    "mode": "Raw",  # Raw, Clean, Format
    "language": "auto",  # auto, or specific language code
    "languages": ["en", "fr"],  # For multilingual mode
    "local_processing": False,
    "clipboard_mode": False,
    "launch_at_login": False,
    "bar_position": "bottom",  # bottom, top
    "bar_color": "#FFFFFF",  # wave color
    "bar_y_offset": 60  # pixels from edge
}

# Store API key securely on first run
def _migrate_to_secure_storage():
    """Migrate existing API keys to secure storage"""
    if not SECURITY_AVAILABLE:
        return

    storage = get_secure_storage()

    # Check if we have an old plaintext API key to migrate
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r') as f:
                config = json.load(f)

            # Migrate API key if it's plaintext (starts with sk-)
            api_key = config.get('api_key', '')
            if api_key and api_key.startswith('sk-'):
                # Store securely
                storage.store_secret('openai_api_key', api_key)
                # Replace with reference
                config['api_key'] = 'KEYCHAIN:openai_api_key'
                with open(CONFIG_PATH, 'w') as f:
                    json.dump(config, f, indent=4)
                print("Migrated API key to secure storage")
        except Exception as e:
            print(f"Migration error: {e}")

# Run migration on module load
_migrate_to_secure_storage()

def load_config():
    if not os.path.exists(CONFIG_PATH):
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()

    try:
        with open(CONFIG_PATH, 'r') as f:
            config = {**DEFAULT_CONFIG, **json.load(f)}

        # Decrypt sensitive values
        if SECURITY_AVAILABLE:
            for key in SENSITIVE_KEYS:
                if key in config and config[key]:
                    config[key] = get_api_key(config[key])

        return config
    except Exception as e:
        print(f"Config load error: {e}")
        return DEFAULT_CONFIG.copy()

def save_config(config):
    config_to_save = config.copy()

    # Encrypt sensitive values before saving
    if SECURITY_AVAILABLE:
        for key in SENSITIVE_KEYS:
            if key in config_to_save and config_to_save[key]:
                value = config_to_save[key]
                # Only encrypt if not already encrypted/stored
                if not value.startswith('KEYCHAIN:') and not value.startswith('ENC:'):
                    config_to_save[key] = secure_api_key(value)

    # Set secure file permissions (owner read/write only)
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config_to_save, f, indent=4)
        os.chmod(CONFIG_PATH, 0o600)  # -rw-------
    except Exception as e:
        print(f"Config save error: {e}")

def set_api_key(api_key: str):
    """Securely store the API key"""
    config = load_config()

    if SECURITY_AVAILABLE:
        storage = get_secure_storage()
        storage.store_secret('openai_api_key', api_key)
        config['api_key'] = 'KEYCHAIN:openai_api_key'
    else:
        config['api_key'] = api_key

    save_config(config)

def get_masked_api_key() -> str:
    """Get masked version of API key for display"""
    config = load_config()
    api_key = config.get('api_key', '')

    if not api_key:
        return "Not set"

    if len(api_key) < 8:
        return "****"

    return "*" * (len(api_key) - 4) + api_key[-4:]
