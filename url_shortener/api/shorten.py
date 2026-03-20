from typing import List

from fastapi import APIRouter, Depends, Request, status

from url_shortener.core.rate_limit import InMemoryRateLimiter
from url_shortener.models.schemas import URLCreateRequest, URLResponse, URLSummary
from url_shortener.services.url_service import URLService

router = APIRouter(prefix="/shorten", tags=["shorten"])


def get_url_service(request: Request) -> URLService:
    return request.app.state.url_service


def get_rate_limiter(request: Request) -> InMemoryRateLimiter:
    return request.app.state.rate_limiter


@router.post("", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
async def create_short_url(
    payload: URLCreateRequest,
    request: Request,
    url_service: URLService = Depends(get_url_service),
    rate_limiter: InMemoryRateLimiter = Depends(get_rate_limiter),
) -> URLResponse:
    await rate_limiter.enforce(request)
    record = await url_service.create_short_url(payload)
    return record.to_response(request.app.state.settings.normalized_base_domain())


@router.get("", response_model=List[URLSummary])
async def list_short_urls(
    request: Request,
    url_service: URLService = Depends(get_url_service),
) -> List[URLSummary]:
    records = await url_service.list_urls()
    return [record.to_summary(request.app.state.settings.normalized_base_domain()) for record in records]


@router.delete("/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_short_url(
    short_code: str,
    request: Request,
    url_service: URLService = Depends(get_url_service),
) -> None:
    await url_service.delete_url(short_code)
    await request.app.state.analytics_service.delete_analytics(short_code)
