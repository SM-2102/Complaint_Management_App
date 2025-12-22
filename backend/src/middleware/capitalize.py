import json

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


def capitalize_values(obj):
    if isinstance(obj, dict):
        return {k: capitalize_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [capitalize_values(item) for item in obj]
    elif isinstance(obj, str):
        return obj.upper()
    else:
        return obj


class CapitalizeJSONMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        excluded_paths = [
            "/auth/login",
            "/user/create_user",
            "/user/reset_password",
            "/user/delete_user",
        ]

        if request.url.path in excluded_paths:
            return await call_next(request)

        if request.headers.get("content-type") == "application/json":
            body_bytes = await request.body()
            if body_bytes:
                try:
                    original_data = json.loads(body_bytes)
                    capitalized_data = capitalize_values(original_data)
                    request._body = json.dumps(capitalized_data).encode("utf-8")
                except json.JSONDecodeError:
                    pass

        response = await call_next(request)
        return response
