from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from config import Config
from middleware.capitalize import CapitalizeJSONMiddleware
from middleware.strip import StripJSONMiddleware


def register_middleware(app: FastAPI):

    app.add_middleware(CapitalizeJSONMiddleware)

    app.add_middleware(StripJSONMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[Config.FRONTEND_URL],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"],
    )
