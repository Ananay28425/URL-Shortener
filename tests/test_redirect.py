from fastapi.testclient import TestClient

from url_shortener.main import app


def test_redirect_tracks_clicks_and_analytics():
    with TestClient(app) as client:
        create = client.post(
            "/api/v1/shorten",
            json={"url": "https://example.com/landing", "custom_alias": "landing"},
        )
        assert create.status_code == 201

        redirect = client.get(
            "/landing",
            follow_redirects=False,
            headers={
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/122.0",
                "referer": "https://news.ycombinator.com/",
            },
        )
        assert redirect.status_code == 307
        assert redirect.headers["location"] == "https://example.com/landing"

        analytics = client.get("/api/v1/analytics/landing")
        assert analytics.status_code == 200
        data = analytics.json()
        assert data["total_clicks"] == 1
        assert data["browser_breakdown"]["chrome"] == 1
        assert data["top_referrers"]["https://news.ycombinator.com/"] == 1
        assert data["device_breakdown"]["desktop"] == 1


def test_delete_deactivates_short_url():
    with TestClient(app) as client:
        client.post(
            "/api/v1/shorten",
            json={"url": "https://example.com/delete-me", "custom_alias": "delete-me"},
        )

        delete_response = client.delete("/api/v1/shorten/delete-me")
        assert delete_response.status_code == 204

        redirect = client.get("/delete-me", follow_redirects=False)
        assert redirect.status_code == 410
