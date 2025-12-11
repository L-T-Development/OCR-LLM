# services/cache.py
import logging
from functools import lru_cache

logger = logging.getLogger("cache")

class CacheManager:
    def __init__(self, use_redis=True):
        self.use_redis = use_redis
        self.redis = None
        if use_redis:
            try:
                import redis
                self.redis = redis.Redis(host="127.0.0.1", port=6379, db=0)
                # quick ping
                self.redis.ping()
                logger.info("Connected to local Redis")
            except Exception as e:
                logger.warning(f"Redis not available: {e}; falling back to in-memory cache")
                self.redis = None
                self._mem_cache = {}
        else:
            self._mem_cache = {}

    def get(self, key):
        if self.redis:
            try:
                v = self.redis.get(key)
                return None if v is None else v.decode("utf-8")
            except Exception:
                return None
        return self._mem_cache.get(key)

    def set(self, key, value, ex=None):
        if self.redis:
            try:
                self.redis.set(key, value, ex=ex)
            except Exception:
                pass
        else:
            self._mem_cache[key] = value

    def close(self):
        if self.redis:
            try:
                self.redis.close()
            except Exception:
                pass
