from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse

from url_shortener.services.redirect_service import RedirectService

router = APIRouter(tags=["redirect"])


def get_redirect_service(request: Request) -> RedirectService:
    return request.app.state.redirect_service


@router.get("/{short_code}", include_in_schema=False)
async def redirect_short_url(
    short_code: str,
    request: Request,
    redirect_service: RedirectService = Depends(get_redirect_service),
) -> RedirectResponse:
    return await redirect_service.redirect(short_code, request)
