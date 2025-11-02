"""
Enhanced Retry Logic with Exponential Backoff and Jitter

This module provides robust retry mechanisms for external API calls with:
- Exponential backoff
- Random jitter to prevent thundering herd
- Configurable max attempts and delays
- Proper exception handling

Usage:
    from app.core.retry import retry_with_backoff
    
    @retry_with_backoff(max_attempts=3, base_delay=1.0)
    async def call_external_api():
        # API call here
        pass
"""

import asyncio
import random
from functools import wraps
from typing import Any, Callable, Type, Tuple
import logging

logger = logging.getLogger(__name__)


def calculate_backoff(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0, jitter: bool = True) -> float:
    """
    Calculate exponential backoff delay with optional jitter.
    
    Args:
        attempt: Current attempt number (0-indexed)
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        jitter: Whether to add random jitter
        
    Returns:
        Delay in seconds
    """
    # Exponential backoff: base_delay * (2 ^ attempt)
    delay = min(base_delay * (2 ** attempt), max_delay)
    
    # Add jitter: randomize delay between 50% and 100% of calculated delay
    # This prevents thundering herd problem
    if jitter:
        delay = delay * (0.5 + random.random() * 0.5)
    
    return delay


def retry_with_backoff(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    Decorator for retrying async functions with exponential backoff and jitter.
    
    Args:
        max_attempts: Maximum number of retry attempts
        base_delay: Base delay in seconds
        max_delay: Maximum delay cap in seconds
        jitter: Whether to add random jitter
        exceptions: Tuple of exception types to catch and retry
        
    Example:
        @retry_with_backoff(max_attempts=3, base_delay=1.0)
        async def fetch_data():
            response = await http_client.get(url)
            return response.json()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    result = await func(*args, **kwargs)
                    
                    # Log successful retry
                    if attempt > 0:
                        logger.info(
                            f"✅ {func.__name__} succeeded on attempt {attempt + 1}/{max_attempts}"
                        )
                    
                    return result
                    
                except exceptions as e:
                    last_exception = e
                    
                    # Check if this was the last attempt
                    if attempt == max_attempts - 1:
                        logger.error(
                            f"❌ {func.__name__} failed after {max_attempts} attempts: {str(e)}"
                        )
                        raise
                    
                    # Calculate backoff delay
                    delay = calculate_backoff(attempt, base_delay, max_delay, jitter)
                    
                    logger.warning(
                        f"⚠️ {func.__name__} failed on attempt {attempt + 1}/{max_attempts}. "
                        f"Retrying in {delay:.2f}s... Error: {str(e)}"
                    )
                    
                    # Wait before retrying
                    await asyncio.sleep(delay)
            
            # This should never be reached due to raise in loop, but just in case
            if last_exception:
                raise last_exception
                
        return wrapper
    return decorator


def retry_sync_with_backoff(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    Decorator for retrying synchronous functions with exponential backoff and jitter.
    
    Same as retry_with_backoff but for synchronous functions.
    
    Example:
        @retry_sync_with_backoff(max_attempts=3, base_delay=1.0)
        def fetch_data():
            response = requests.get(url)
            return response.json()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            import time
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    result = func(*args, **kwargs)
                    
                    # Log successful retry
                    if attempt > 0:
                        logger.info(
                            f"✅ {func.__name__} succeeded on attempt {attempt + 1}/{max_attempts}"
                        )
                    
                    return result
                    
                except exceptions as e:
                    last_exception = e
                    
                    # Check if this was the last attempt
                    if attempt == max_attempts - 1:
                        logger.error(
                            f"❌ {func.__name__} failed after {max_attempts} attempts: {str(e)}"
                        )
                        raise
                    
                    # Calculate backoff delay
                    delay = calculate_backoff(attempt, base_delay, max_delay, jitter)
                    
                    logger.warning(
                        f"⚠️ {func.__name__} failed on attempt {attempt + 1}/{max_attempts}. "
                        f"Retrying in {delay:.2f}s... Error: {str(e)}"
                    )
                    
                    # Wait before retrying
                    time.sleep(delay)
            
            # This should never be reached due to raise in loop, but just in case
            if last_exception:
                raise last_exception
                
        return wrapper
    return decorator


# Convenience decorators with preset configurations

def retry_api_call(func: Callable) -> Callable:
    """
    Quick decorator for external API calls with sensible defaults.
    - 3 attempts
    - 1s base delay
    - 30s max delay
    - Jitter enabled
    """
    return retry_with_backoff(
        max_attempts=3,
        base_delay=1.0,
        max_delay=30.0,
        jitter=True
    )(func)


def retry_database_call(func: Callable) -> Callable:
    """
    Quick decorator for database calls with sensible defaults.
    - 5 attempts (databases can be temporarily unavailable)
    - 0.5s base delay (faster recovery)
    - 10s max delay (don't wait too long)
    - Jitter enabled
    """
    return retry_with_backoff(
        max_attempts=5,
        base_delay=0.5,
        max_delay=10.0,
        jitter=True
    )(func)


def retry_critical_call(func: Callable) -> Callable:
    """
    Quick decorator for critical calls that must succeed.
    - 10 attempts
    - 2s base delay
    - 120s max delay
    - Jitter enabled
    """
    return retry_with_backoff(
        max_attempts=10,
        base_delay=2.0,
        max_delay=120.0,
        jitter=True
    )(func)

