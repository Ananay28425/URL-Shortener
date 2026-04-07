from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])


class AliasRequest(BaseModel):
    url: str


class InsightRequest(BaseModel):
    data: dict


@router.post("/alias")
async def ai_alias(_: AliasRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="AI route not implemented yet",
    )


@router.post("/insight")
async def ai_insight(_: InsightRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="AI route not implemented yet",
    )
