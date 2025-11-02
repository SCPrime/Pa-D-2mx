"""
Request/Response Logging Middleware
Logs all API requests and responses for observability and debugging
"""

import logging
import time
from collections.abc import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs request/response details for all API calls
    
    Features:
    - Request method, path, query params
    - Response status code
    - Request duration
    - Request ID correlation
    - Filters out health checks and static assets
    """

    def __init__(self, app, log_level: str = "INFO"):
        super().__init__(app)
        self.log_level = getattr(logging, log_level.upper(), logging.INFO)
        # Paths to exclude from detailed logging
        self.excluded_paths = {
            "/api/health",
            "/api/monitor/health",
            "/api/monitor/ping",
            "/api/telemetry",  # Avoid logging telemetry about logging
            "/favicon.ico",
            "/docs",
            "/redoc",
            "/openapi.json",
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)

        # Get request ID if available
        request_id = getattr(request.state, "request_id", None)

        # Start timer
        start_time = time.time()

        # Log request
        self._log_request(request, request_id)

        # Process request
        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            # Log response
            self._log_response(request, response, duration_ms, request_id)

            return response

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[Request Log] {request.method} {request.url.path} - "
                f"ERROR after {duration_ms:.2f}ms - {type(e).__name__}: {e!s}",
                extra={"request_id": request_id} if request_id else {},
                exc_info=True,
            )
            raise

    def _log_request(self, request: Request, request_id: str | None):
        """Log incoming request details"""
        query_params = dict(request.query_params)
        # Sanitize sensitive query params
        if "token" in query_params:
            query_params["token"] = "***"
        if "api_key" in query_params:
            query_params["api_key"] = "***"

        log_data = {
            "method": request.method,
            "path": request.url.path,
            "query_params": query_params if query_params else None,
            "client_host": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent", "unknown")[:100],
        }

        if request_id:
            log_data["request_id"] = request_id

        logger.log(
            self.log_level,
            f"[Request] {request.method} {request.url.path}",
            extra=log_data,
        )

    def _log_response(
        self,
        request: Request,
        response: Response,
        duration_ms: float,
        request_id: str | None,
    ):
        """Log response details"""
        status_code = response.status_code
        log_level = logging.WARNING if status_code >= 400 else self.log_level

        log_data = {
            "method": request.method,
            "path": request.url.path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
        }

        if request_id:
            log_data["request_id"] = request_id

        # Add response size if available
        if hasattr(response, "headers") and "content-length" in response.headers:
            log_data["response_size_bytes"] = int(response.headers["content-length"])

        logger.log(
            log_level,
            f"[Response] {request.method} {request.url.path} - "
            f"{status_code} ({duration_ms:.2f}ms)",
            extra=log_data,
        )


__all__ = ["RequestLoggingMiddleware"]

