import hashlib
import random
import string
import time
from typing import Optional
import nanoid
from nanoid import generate
import asyncio
from functools import lru_cache

# Base62 character set
BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"


class IDGenerator:
    """Utility class for generating various types of IDs"""

    def __init__(self, default_length: int = 6):
        self.default_length = default_length
        self.nanoid_alphabet = BASE62_CHARS

    def generate_nanoid(self, length: Optional[int] = None) -> str:
        """Generate nanoid with URL-friendly characters"""
        length = length or self.default_length
        return generate(self.nanoid_alphabet, length)

    def encode_base62(self, number: int) -> str:
        """Convert a number to base62 string"""
        if number == 0:
            return BASE62_CHARS[0]

        result = []
        base = len(BASE62_CHARS)

        while number > 0:
            number, remainder = divmod(number, base)
            result.append(BASE62_CHARS[remainder])

        return "".join(reversed(result))

    def decode_base62(self, encoded: str) -> int:
        """Convert base62 string back to number"""
        base = len(BASE62_CHARS)
        result = 0

        for char in encoded:
            result = result * base + BASE62_CHARS.index(char)

        return result

    def generate_from_url(self, url: str, length: Optional[int] = None) -> str:
        """Generate consistent short code from URL using hash"""
        length = length or self.default_length

        # Create SHA256 hash of URL + timestamp for uniqueness
        timestamp = str(time.time())
        hash_input = f"{url}{timestamp}"
        hash_object = hashlib.sha256(hash_input.encode())

        # Convert hash to number and encode to base62
        hash_int = int(hash_object.hexdigest(), 16)

        # Take first 'length' characters of base62 encoded hash
        base62_encoded = self.encode_base62(hash_int)

        # Ensure it's the correct length
        if len(base62_encoded) < length:
            # Pad with random characters if needed
            base62_encoded += self.generate_nanoid(length - len(base62_encoded))

        return base62_encoded[:length]

    def generate_hash_based(self, data: str, length: Optional[int] = None) -> str:
        """Generate short code using SHA256 hash"""
        length = length or self.default_length

        # Create hash
        hash_object = hashlib.sha256(data.encode())
        hash_hex = hash_object.hexdigest()

        # Convert to base62
        hash_int = int(hash_hex[:16], 16)  # Use first 16 chars of hex
        base62_encoded = self.encode_base62(hash_int)

        return base62_encoded[:length].ljust(length, BASE62_CHARS[0])

    def generate_custom(self, pattern: str, replacements: Optional[dict] = None) -> str:
        """Generate ID based on custom pattern"""
        if not replacements:
            replacements = {}

        result = pattern
        for placeholder, value in replacements.items():
            if placeholder == "{nanoid}":
                result = result.replace(placeholder, self.generate_nanoid())
            elif placeholder == "{timestamp}":
                result = result.replace(placeholder, str(int(time.time())))
            elif placeholder == "{random}":
                result = result.replace(
                    placeholder, "".join(random.choices(BASE62_CHARS, k=8))
                )
            else:
                result = result.replace(placeholder, str(value))

        return result

    def generate_batch(self, count: int, length: Optional[int] = None) -> list[str]:
        """Generate multiple unique IDs"""
        length = length or self.default_length
        ids = set()

        while len(ids) < count:
            new_id = self.generate_nanoid(length)
            ids.add(new_id)

        return list(ids)

    def is_valid_short_code(self, short_code: str, max_length: int = 10) -> bool:
        """Validate short code format"""
        if not short_code or len(short_code) > max_length:
            return False

        # Check if all characters are valid base62
        return all(char in BASE62_CHARS for char in short_code)

    async def generate_collision_free(
        self, check_func, max_attempts: int = 100, length: Optional[int] = None
    ) -> Optional[str]:
        """
        Generate ID that doesn't exist in database

        Args:
            check_func: Async function that returns True if ID exists
            max_attempts: Maximum attempts to generate unique ID
            length: Length of the ID to generate

        Returns:
            Unique ID or None if couldn't generate after max_attempts
        """
        length = length or self.default_length

        for attempt in range(max_attempts):
            candidate = self.generate_nanoid(length)
            exists = await check_func(candidate)

            if not exists:
                return candidate

            # Add some randomness to avoid collision patterns
            if attempt % 10 == 0:
                await asyncio.sleep(0.001)  # Small delay

        return None


class SmartIDGenerator(IDGenerator):
    """Enhanced ID generator with ML-ready features"""

    def __init__(self, default_length: int = 6, enable_ml_features: bool = False):
        super().__init__(default_length)
        self.enable_ml_features = enable_ml_features
        self.usage_stats = {}  # Track patterns for ML analysis

    def generate_contextual(
        self,
        url: str,
        user_context: Optional[dict] = None,
        length: Optional[int] = None,
    ) -> str:
        """Generate ID based on URL and user context"""
        length = length or self.default_length

        if not self.enable_ml_features or not user_context:
            return self.generate_from_url(url, length)

        # ML-enhanced generation (placeholder for future ML integration)
        context_score = user_context.get("trust_score", 0.5)
        user_type = user_context.get("user_type", "anonymous")

        # Adjust generation based on context
        if user_type == "premium" and context_score > 0.8:
            # Use shorter, premium-style codes
            return self.generate_nanoid(max(4, length - 2))
        elif user_type == "suspicious":
            # Use longer, more traceable codes
            return self.generate_hash_based(f"{url}{time.time()}", length + 2)

        return self.generate_from_url(url, length)

    def track_usage(self, short_code: str, metadata: dict):
        """Track ID usage for ML model training"""
        if not self.enable_ml_features:
            return

        # Track patterns for future ML model
        pattern_type = self._analyze_pattern(short_code)
        self.usage_stats[pattern_type] = self.usage_stats.get(pattern_type, 0) + 1

    def _analyze_pattern(self, short_code: str) -> str:
        """Analyze pattern in short code"""
        has_numbers = any(c.isdigit() for c in short_code)
        has_upper = any(c.isupper() for c in short_code)
        has_lower = any(c.islower() for c in short_code)

        if has_numbers and has_upper and has_lower:
            return "mixed"
        elif has_numbers and has_upper:
            return "num_upper"
        elif has_numbers and has_lower:
            return "num_lower"
        elif has_upper and has_lower:
            return "alpha_mixed"
        elif has_numbers:
            return "numeric"
        else:
            return "alpha"

    def get_usage_stats(self) -> dict:
        """Get usage statistics for ML analysis"""
        return self.usage_stats.copy()


# Global instances
id_generator = IDGenerator()
smart_id_generator = SmartIDGenerator()


def get_id_generator() -> IDGenerator:
    """Get standard ID generator"""
    return id_generator


def get_smart_id_generator() -> SmartIDGenerator:
    """Get smart ID generator with ML features"""
    return smart_id_generator


@lru_cache(maxsize=1000)
def cached_encode_base62(number: int) -> str:
    """Cached version of base62 encoding for performance"""
    return id_generator.encode_base62(number)


def validate_and_normalize(short_code: str, max_length: int = 10) -> Optional[str]:
    """Validate and normalize short code"""
    if not id_generator.is_valid_short_code(short_code, max_length):
        return None

    return short_code.upper() if short_code.islower() else short_code
