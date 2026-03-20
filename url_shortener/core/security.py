from fastapi import Header, HTTPException, status


async def optional_api_key(x_api_key: str | None = Header(default=None)) -> str | None:
    return x_api_key


async def require_api_key(x_api_key: str | None = Header(default=None)) -> str:
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
        )
    return x_api_key
