from fastapi.testclient import TestClient

from url_shortener.main import app


def test_create_and_list_short_url():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/shorten",
            json={"url": "https://example.com/articles/1", "custom_alias": "example1"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["short_code"] == "example1"
        assert data["short_url"].endswith("/example1")
        assert data["click_count"] == 0

        list_response = client.get("/api/v1/shorten")
        assert list_response.status_code == 200
        items = list_response.json()
        assert len(items) == 1
        assert items[0]["short_code"] == "example1"
        assert items[0]["is_active"] is True


def test_duplicate_short_code_returns_conflict():
    with TestClient(app) as client:
        payload = {"url": "https://example.com/page", "custom_alias": "taken-code"}
        assert client.post("/api/v1/shorten", json=payload).status_code == 201

        duplicate = client.post(
            "/api/v1/shorten",
            json={"url": "https://example.com/other", "custom_alias": "taken-code"},
        )
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"] == "Short code already exists"
