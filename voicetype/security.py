"""
Security module for Codiris Voice
- Encrypts sensitive data (API keys, tokens)
- Rate limiting to prevent abuse
- Secure storage using macOS Keychain
"""
import os
import base64
import hashlib
import time
import threading
from collections import defaultdict
from functools import wraps

# Try to use macOS Keychain for secure storage
try:
    import keyring
    KEYCHAIN_AVAILABLE = True
except ImportError:
    KEYCHAIN_AVAILABLE = False

# Try to use cryptography for encryption
try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


# =============================================================================
# ENCRYPTION
# =============================================================================

class SecureStorage:
    """Secure storage for sensitive data using encryption and keychain"""

    SERVICE_NAME = "CodirisVoice"

    def __init__(self):
        self._encryption_key = None
        self._init_encryption()

    def _init_encryption(self):
        """Initialize encryption key from keychain or create new one"""
        if KEYCHAIN_AVAILABLE:
            try:
                # Try to get existing key from keychain
                key = keyring.get_password(self.SERVICE_NAME, "encryption_key")
                if key:
                    self._encryption_key = key.encode()
                else:
                    # Generate new key and store in keychain
                    self._encryption_key = Fernet.generate_key()
                    keyring.set_password(self.SERVICE_NAME, "encryption_key",
                                        self._encryption_key.decode())
            except Exception as e:
                print(f"Keychain error: {e}")
                self._use_fallback_key()
        else:
            self._use_fallback_key()

    def _use_fallback_key(self):
        """Fallback: derive key from machine-specific data"""
        if CRYPTO_AVAILABLE:
            # Use machine UUID as salt for key derivation
            machine_id = self._get_machine_id()
            salt = hashlib.sha256(machine_id.encode()).digest()[:16]

            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(b"codiris_voice_secret"))
            self._encryption_key = key
        else:
            # Basic obfuscation if no crypto available
            self._encryption_key = None

    def _get_machine_id(self):
        """Get a unique machine identifier"""
        try:
            # macOS: use hardware UUID
            import subprocess
            result = subprocess.run(
                ['ioreg', '-rd1', '-c', 'IOPlatformExpertDevice'],
                capture_output=True, text=True
            )
            for line in result.stdout.split('\n'):
                if 'IOPlatformUUID' in line:
                    return line.split('"')[-2]
        except:
            pass
        # Fallback
        return os.getenv('USER', 'default') + '_codiris'

    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        if not data:
            return data

        if CRYPTO_AVAILABLE and self._encryption_key:
            try:
                f = Fernet(self._encryption_key)
                encrypted = f.encrypt(data.encode())
                return "ENC:" + encrypted.decode()
            except Exception as e:
                print(f"Encryption error: {e}")

        # Fallback: basic obfuscation (NOT secure, but better than plaintext)
        return "OBF:" + base64.b64encode(data.encode()).decode()

    def decrypt(self, data: str) -> str:
        """Decrypt sensitive data"""
        if not data:
            return data

        if data.startswith("ENC:") and CRYPTO_AVAILABLE and self._encryption_key:
            try:
                f = Fernet(self._encryption_key)
                decrypted = f.decrypt(data[4:].encode())
                return decrypted.decode()
            except Exception as e:
                print(f"Decryption error: {e}")
                return ""

        if data.startswith("OBF:"):
            try:
                return base64.b64decode(data[4:]).decode()
            except:
                return ""

        # Return as-is if not encrypted (legacy data)
        return data

    def store_secret(self, key: str, value: str):
        """Store a secret in the keychain"""
        if KEYCHAIN_AVAILABLE:
            try:
                keyring.set_password(self.SERVICE_NAME, key, value)
                return True
            except Exception as e:
                print(f"Failed to store secret: {e}")
        return False

    def get_secret(self, key: str) -> str:
        """Retrieve a secret from the keychain"""
        if KEYCHAIN_AVAILABLE:
            try:
                return keyring.get_password(self.SERVICE_NAME, key) or ""
            except Exception as e:
                print(f"Failed to get secret: {e}")
        return ""

    def delete_secret(self, key: str):
        """Delete a secret from the keychain"""
        if KEYCHAIN_AVAILABLE:
            try:
                keyring.delete_password(self.SERVICE_NAME, key)
            except:
                pass


# Global secure storage instance
_secure_storage = None

def get_secure_storage() -> SecureStorage:
    global _secure_storage
    if _secure_storage is None:
        _secure_storage = SecureStorage()
    return _secure_storage


# =============================================================================
# RATE LIMITING
# =============================================================================

class RateLimiter:
    """
    Rate limiter to prevent abuse and DDoS attacks
    Uses token bucket algorithm
    """

    def __init__(self, requests_per_minute=60, burst_size=10):
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.tokens = defaultdict(lambda: burst_size)
        self.last_update = defaultdict(time.time)
        self.blocked_ips = {}  # IP -> unblock_time
        self.request_counts = defaultdict(int)  # IP -> count in current window
        self.window_start = time.time()
        self._lock = threading.Lock()

    def _refill_tokens(self, client_id: str):
        """Refill tokens based on time elapsed"""
        now = time.time()
        elapsed = now - self.last_update[client_id]
        refill = elapsed * (self.requests_per_minute / 60.0)
        self.tokens[client_id] = min(self.burst_size, self.tokens[client_id] + refill)
        self.last_update[client_id] = now

    def is_allowed(self, client_id: str = "default") -> bool:
        """Check if request is allowed for this client"""
        with self._lock:
            now = time.time()

            # Check if IP is blocked
            if client_id in self.blocked_ips:
                if now < self.blocked_ips[client_id]:
                    return False
                else:
                    del self.blocked_ips[client_id]

            # Refill tokens
            self._refill_tokens(client_id)

            # Check if tokens available
            if self.tokens[client_id] >= 1:
                self.tokens[client_id] -= 1
                return True

            # Rate limit exceeded - track for potential blocking
            self.request_counts[client_id] += 1

            # Block IP if too many violations (potential attack)
            if self.request_counts[client_id] > 100:
                self.blocked_ips[client_id] = now + 300  # Block for 5 minutes
                print(f"Blocked client {client_id} for excessive requests")

            return False

    def reset_window(self):
        """Reset the counting window (call periodically)"""
        with self._lock:
            self.request_counts.clear()
            self.window_start = time.time()


# Global rate limiter
_rate_limiter = None

def get_rate_limiter() -> RateLimiter:
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter(requests_per_minute=120, burst_size=20)
    return _rate_limiter


def rate_limit(func):
    """Decorator to apply rate limiting to a function"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        limiter = get_rate_limiter()
        client_id = kwargs.get('client_ip', 'default')

        if not limiter.is_allowed(client_id):
            raise RateLimitExceeded("Too many requests. Please slow down.")

        return func(*args, **kwargs)
    return wrapper


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""
    pass


# =============================================================================
# REQUEST VALIDATION
# =============================================================================

class RequestValidator:
    """Validates incoming requests for security"""

    # Allowed origins for CORS
    ALLOWED_ORIGINS = [
        'http://localhost:8765',
        'http://127.0.0.1:8765',
    ]

    # Maximum request body size (1MB)
    MAX_BODY_SIZE = 1024 * 1024

    # Suspicious patterns to block
    BLOCKED_PATTERNS = [
        '../',  # Path traversal
        '<script',  # XSS
        'javascript:',  # XSS
        'onclick=',  # XSS
        'onerror=',  # XSS
        '; DROP',  # SQL injection
        "' OR '",  # SQL injection
        'UNION SELECT',  # SQL injection
    ]

    @classmethod
    def validate_origin(cls, origin: str) -> bool:
        """Check if origin is allowed"""
        if not origin:
            return True  # Allow requests without origin (same-origin)
        return origin in cls.ALLOWED_ORIGINS

    @classmethod
    def validate_content_length(cls, length: int) -> bool:
        """Check if content length is within limits"""
        return length <= cls.MAX_BODY_SIZE

    @classmethod
    def sanitize_input(cls, data: str) -> str:
        """Sanitize input to prevent injection attacks"""
        if not data:
            return data

        # Check for blocked patterns
        data_lower = data.lower()
        for pattern in cls.BLOCKED_PATTERNS:
            if pattern.lower() in data_lower:
                raise SecurityException(f"Blocked pattern detected: {pattern}")

        return data

    @classmethod
    def validate_path(cls, path: str) -> bool:
        """Validate request path"""
        # Prevent path traversal
        if '..' in path or path.startswith('/etc') or path.startswith('/var'):
            return False

        # Only allow specific paths
        allowed_paths = [
            '/', '/index.html', '/status', '/set-mode', '/set-setting',
            '/set-user', '/logout', '/check-oauth', '/open-google-auth',
            '/complete-oauth', '/api/auth/google/callback'
        ]

        # Check if path starts with any allowed path
        return any(path.startswith(p) for p in allowed_paths)


class SecurityException(Exception):
    """Exception raised for security violations"""
    pass


# =============================================================================
# SECURE CONFIGURATION
# =============================================================================

def secure_api_key(api_key: str) -> str:
    """Encrypt and store API key securely"""
    storage = get_secure_storage()

    # Store in keychain if available
    if KEYCHAIN_AVAILABLE:
        storage.store_secret("openai_api_key", api_key)
        return "KEYCHAIN:openai_api_key"

    # Otherwise encrypt
    return storage.encrypt(api_key)


def get_api_key(stored_value: str) -> str:
    """Retrieve and decrypt API key"""
    storage = get_secure_storage()

    if stored_value.startswith("KEYCHAIN:"):
        key_name = stored_value[9:]
        return storage.get_secret(key_name)

    return storage.decrypt(stored_value)


def mask_api_key(api_key: str) -> str:
    """Mask API key for display (show only last 4 chars)"""
    if not api_key or len(api_key) < 8:
        return "****"
    return "*" * (len(api_key) - 4) + api_key[-4:]


# =============================================================================
# SECURITY HEADERS
# =============================================================================

SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self' https://accounts.google.com https://www.googleapis.com; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
}


def add_security_headers(handler):
    """Add security headers to HTTP response"""
    for header, value in SECURITY_HEADERS.items():
        handler.send_header(header, value)
