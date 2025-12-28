import uuid
from datetime import datetime, timedelta

import jwt
from passlib.context import CryptContext

from config import Config
from exceptions import InvalidToken

password_context = CryptContext(schemes=["bcrypt"])

ACCESS_TOKEN_EXPIRY = 60


def generate_hash_password(password: str) -> str:
    hash = password_context.hash(password)
    return hash


def verify_password(password: str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)


def create_user_token(user_data: dict, expiry: timedelta = None, refresh: bool = False):
    payload = {}

    payload["user"] = user_data
    payload["exp"] = datetime.now() + (
        expiry if expiry is not None else timedelta(seconds=ACCESS_TOKEN_EXPIRY)
    )
    payload["refresh"] = refresh

    token = jwt.encode(
        payload=payload, key=Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM
    )

    return token


def decode_user_token(token: str) -> dict:
    try:
        token_data = jwt.decode(
            jwt=token, key=Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM]
        )
        return token_data
    except jwt.ExpiredSignatureError:
        # Explicitly raise InvalidToken for expired tokens
        raise InvalidToken()
    except jwt.PyJWTError:
        return None
