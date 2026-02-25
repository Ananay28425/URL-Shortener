import valkey.asyncio as valkey
import json
import logging
from typing import Any, Optional, Dict, List
from datetime import timedelta
import pickle
import asyncio
from functools import lru_cache

logger = logging.getLogger(__name__)


class ValkeyManager:
    """Valkey connection and operations manager"""

    def __init__(self, valkey_url: str):
        self.valkey_url = valkey_url
        self.valkey_client = None
        self.is_connected = False

    async def initialize(self) -> None:
        """Initialize Valkey connection"""
        try:
            self.valkey_client = valkey.from_url(
                self.valkey_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
                retry_on_timeout=True,
                socket_timeout=5,
                socket_connect_timeout=5,
            )

            await self._test_connection()
            self.is_connected = True
            logger.info("Valkey initialized successfully")
        except Exception as e:
            logger.error(f"Valkey initialization failed: {e}")
            self.is_connected = False
            raise

    async def _test_connection(self) -> None:
        """Test Valkey connection"""
        if not self.valkey_client:
            raise RuntimeError("Valkey client not initialized")

        await self.valkey_client.ping()
        logger.info("Valkey connection test successful")

    async def close(self) -> None:
        """Close Valkey connection"""
        if self.valkey_client:
            await self.valkey_client.close()
            self.is_connected = False
            logger.info("Valkey connection closed")

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set key-value pair with optional TTL"""
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            elif not isinstance(value, str):
                value = str(value)

            if ttl:
                return await self.valkey_client.setex(key, ttl, value)
            else:
                return await self.valkey_client.set(key, value)
        except Exception as e:
            logger.error(f"Valkey SET error for key {key}: {e}")
            return False

    async def get(self, key: str) -> Optional[Any]:
        """Get value by key"""
        try:
            value = await self.valkey_client.get(key)
            if value is None:
                return None

            # Try to parse as JSON first
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"Valkey GET error for key {key}: {e}")
            return None

    async def delete(self, key: str) -> bool:
        """Delete key"""
        try:
            return await self.valkey_client.delete(key) > 0
        except Exception as e:
            logger.error(f"Valkey DELETE error for key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            return await self.valkey_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Valkey EXISTS error for key {key}: {e}")
            return False

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment numeric value"""
        try:
            result = await self.valkey_client.incrby(key, amount)
            return result if result is not None else 0
        except Exception as e:
            logger.error(f"Valkey INCREMENT error for key {key}: {e}")
            return None

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key"""
        try:
            return await self.valkey_client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Valkey EXPIRE error for key {key}: {e}")
            return False

    async def ttl(self, key: str) -> int:
        """Get time-to-live for key"""
        try:
            result = await self.valkey_client.ttl(key)
            return result if result is not None else -1
        except Exception as e:
            logger.error(f"Valkey TTL error for key {key}: {e}")
            return -1

    async def rate_limit_check(
        self, identifier: str, limit: int, window: int
    ) -> tuple[bool, int]:
        """
        Check rate limit using sliding window algorithm

        Args:
            identifier: Unique identifier (IP, API key, user ID)
            limit: Maximum requests allowed
            window: Time window in seconds

        Returns:
            tuple: (is_allowed, current_count)
        """
        key = f"rate_limit:{identifier}"
        current = await self.increment(key)

        if current == 1:  # First request in window
            await self.expire(key, window)

        return (current <= limit) if current is not None else (False, 0), current or 0

    async def cache_analytics_batch(self, analytics_data: List[Dict]) -> bool:
        """Cache analytics data for batch processing"""
        try:
            key = "analytics_batch"
            batch_data = await self.get(key) or []
            batch_data.extend(analytics_data)

            # Limit batch size
            if len(batch_data) > 1000:
                batch_data = batch_data[-1000:]

            await self.set(key, batch_data, ttl=3600)  # 1 hour TTL
            return True
        except Exception as e:
            logger.error(f"Analytics batch caching error: {e}")
            return False

    async def get_analytics_batch(self) -> List[Dict]:
        """Get and clear analytics batch"""
        try:
            key = "analytics_batch"
            batch_data = await self.get(key) or []
            await self.delete(key)
            return batch_data
        except Exception as e:
            logger.error(f"Analytics batch retrieval error: {e}")
            return []

    async def health_check(self) -> bool:
        """Check Valkey health"""
        try:
            if not self.is_connected or not self.valkey_client:
                return False
            await self.valkey_client.ping()
            return True
        except Exception as e:
            logger.error(f"Valkey health check failed: {e}")
            return False

    async def flush_all(self) -> bool:
        """Flush all Valkey data (use with caution!)"""
        try:
            await self.valkey_client.flushall()
            logger.warning("Valkey flushed all data")
            return True
        except Exception as e:
            logger.error(f"Valkey flush error: {e}")
            return False


# Global Valkey instance
valkey_manager = ValkeyManager("")


async def get_valkey() -> ValkeyManager:
    """Get Valkey manager instance"""
    return valkey_manager
