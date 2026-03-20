from fastapi import APIRouter, Depends, Request

from url_shortener.models.schemas import AnalyticsResponse
from url_shortener.services.analytics_service import AnalyticsService
from url_shortener.services.url_service import URLService

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_url_service(request: Request) -> URLService:
    return request.app.state.url_service


def get_analytics_service(request: Request) -> AnalyticsService:
    return request.app.state.analytics_service


@router.get("/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(
    short_code: str,
    request: Request,
    url_service: URLService = Depends(get_url_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> AnalyticsResponse:
    record = await url_service.require_active_url(short_code)
    aggregate = await analytics_service.get_analytics(record)
    return aggregate.to_response(request.app.state.settings.normalized_base_domain())
