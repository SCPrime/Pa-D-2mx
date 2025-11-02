"""
Standardized Error Response Format
Ensures consistent error responses across all API endpoints
"""

from datetime import UTC, datetime
from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class StandardErrorResponse:
    """Standard error response format for all API errors"""

    @staticmethod
    def format_error(
        status_code: int,
        error_code: str,
        message: str,
        details: dict[str, Any] | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Format a standardized error response

        Args:
            status_code: HTTP status code
            error_code: Machine-readable error code (e.g., "VALIDATION_ERROR")
            message: Human-readable error message
            details: Additional error details (optional)
            request_id: Request correlation ID (optional)

        Returns:
            Formatted error response dict
        """
        response = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
                "status_code": status_code,
            },
            "timestamp": datetime.now(UTC).isoformat(),
        }

        if details:
            response["error"]["details"] = details

        if request_id:
            response["request_id"] = request_id

        return response

    @staticmethod
    def validation_error(
        message: str,
        field_errors: dict[str, list[str]] | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format validation error response"""
        details = {"field_errors": field_errors} if field_errors else None
        return StandardErrorResponse.format_error(
            status_code=400,
            error_code="VALIDATION_ERROR",
            message=message,
            details=details,
            request_id=request_id,
        )

    @staticmethod
    def not_found(
        resource: str,
        identifier: str | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format not found error response"""
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"
        return StandardErrorResponse.format_error(
            status_code=404,
            error_code="NOT_FOUND",
            message=message,
            details={"resource": resource, "identifier": identifier},
            request_id=request_id,
        )

    @staticmethod
    def unauthorized(
        message: str = "Authentication required",
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format unauthorized error response"""
        return StandardErrorResponse.format_error(
            status_code=401,
            error_code="UNAUTHORIZED",
            message=message,
            request_id=request_id,
        )

    @staticmethod
    def forbidden(
        message: str = "Insufficient permissions",
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format forbidden error response"""
        return StandardErrorResponse.format_error(
            status_code=403,
            error_code="FORBIDDEN",
            message=message,
            request_id=request_id,
        )

    @staticmethod
    def internal_error(
        message: str = "Internal server error",
        error_id: str | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format internal server error response"""
        details = {"error_id": error_id} if error_id else None
        return StandardErrorResponse.format_error(
            status_code=500,
            error_code="INTERNAL_ERROR",
            message=message,
            details=details,
            request_id=request_id,
        )

    @staticmethod
    def service_unavailable(
        service: str,
        message: str | None = None,
        retry_after: int | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """Format service unavailable error response"""
        msg = message or f"{service} temporarily unavailable"
        details = {"service": service}
        if retry_after:
            details["retry_after_seconds"] = retry_after
        return StandardErrorResponse.format_error(
            status_code=503,
            error_code="SERVICE_UNAVAILABLE",
            message=msg,
            details=details,
            request_id=request_id,
        )


def create_http_exception(
    status_code: int,
    error_code: str,
    message: str,
    details: dict[str, Any] | None = None,
    request_id: str | None = None,
) -> HTTPException:
    """
    Create an HTTPException with standardized error format

    Usage:
        raise create_http_exception(
            status_code=404,
            error_code="NOT_FOUND",
            message="Position not found",
            details={"position_id": "abc123"},
            request_id=request.state.request_id
        )
    """
    content = StandardErrorResponse.format_error(
        status_code=status_code,
        error_code=error_code,
        message=message,
        details=details,
        request_id=request_id,
    )
    return HTTPException(status_code=status_code, detail=content)


async def error_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Global error handler for HTTPException
    Ensures all HTTPExceptions return standardized format

    Register in main.py:
        app.add_exception_handler(HTTPException, error_handler)
    """
    request_id = getattr(request.state, "request_id", None)

    # If detail is already a dict with standardized format, use it
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        error_response = exc.detail
        if request_id and "request_id" not in error_response:
            error_response["request_id"] = request_id
    else:
        # Convert string detail to standardized format
        error_code = _status_code_to_error_code(exc.status_code)
        error_response = StandardErrorResponse.format_error(
            status_code=exc.status_code,
            error_code=error_code,
            message=str(exc.detail) if exc.detail else "An error occurred",
            request_id=request_id,
        )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
    )


def _status_code_to_error_code(status_code: int) -> str:
    """Map HTTP status code to error code"""
    mapping = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE",
        504: "GATEWAY_TIMEOUT",
    }
    return mapping.get(status_code, "UNKNOWN_ERROR")


__all__ = [
    "StandardErrorResponse",
    "create_http_exception",
    "error_handler",
]
