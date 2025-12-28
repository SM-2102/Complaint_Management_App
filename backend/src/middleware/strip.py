import json

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


# Utility to recursively strip leading/trailing spaces from all string values in a dict/list
def strip_outer_whitespace(data):
    if isinstance(data, dict):
        return {k: strip_outer_whitespace(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [strip_outer_whitespace(item) for item in data]
    elif isinstance(data, str):
        return data.strip()
    else:
        return data


class StripJSONMiddleware(BaseHTTPMiddleware):
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
                    capitalized_data = strip_outer_whitespace(original_data)
                    request._body = json.dumps(capitalized_data).encode("utf-8")
                except json.JSONDecodeError:
                    pass

        response = await call_next(request)
        return response
