from __future__ import annotations

import json as jsonlib
from dataclasses import dataclass
from typing import Any, Dict, Mapping, MutableMapping, Optional
from urllib.parse import urlencode

from ._models import Headers, Request, Response, URL


class UseClientDefault:
    pass


USE_CLIENT_DEFAULT = UseClientDefault()
CookieTypes = Optional[Mapping[str, str]]
TimeoutTypes = Any


class Client:
    def __init__(
        self,
        *,
        app: Any = None,
        base_url: str = "",
        headers: Optional[Dict[str, str]] = None,
        transport: Any = None,
        follow_redirects: bool = True,
        cookies: CookieTypes = None,
    ) -> None:
        self.app = app
        self.base_url = URL(base_url or "http://testserver")
        self.headers = headers or {}
        self.transport = transport
        self.follow_redirects = follow_redirects
        self.cookies = cookies or {}

    def __enter__(self) -> "Client":
        return self

    def __exit__(self, *args: Any) -> None:
        return None

    def request(
        self,
        method: str,
        url: Any,
        *,
        content: Any = None,
        data: Any = None,
        files: Any = None,
        json: Any = None,
        params: Any = None,
        headers: Optional[Mapping[str, str]] = None,
        cookies: CookieTypes = None,
        auth: Any = USE_CLIENT_DEFAULT,
        follow_redirects: Any = USE_CLIENT_DEFAULT,
        timeout: Any = USE_CLIENT_DEFAULT,
        extensions: Optional[Dict[str, Any]] = None,
    ) -> Response:
        del files, cookies, auth, timeout, extensions
        request_headers = dict(self.headers)
        if headers:
            request_headers.update(headers)

        request_url = url if isinstance(url, URL) else self.base_url.join(str(url))
        if params:
            request_url = request_url.copy_merge_params(params)

        body = content
        if json is not None:
            body = jsonlib.dumps(json).encode("utf-8")
            request_headers.setdefault("content-type", "application/json")
        elif data is not None:
            body = urlencode(data, doseq=True).encode("utf-8")
            request_headers.setdefault("content-type", "application/x-www-form-urlencoded")

        request = Request(method=method.upper(), url=request_url, headers=request_headers, content=body)
        response = self.transport.handle_request(request)
        response.request = request

        should_redirect = self.follow_redirects if follow_redirects is USE_CLIENT_DEFAULT else follow_redirects
        while should_redirect and response.status_code in {301, 302, 303, 307, 308} and "location" in response.headers:
            request_url = request_url.join(response.headers["location"])
            request = Request(method="GET" if response.status_code in {301, 302, 303} else method.upper(), url=request_url, headers=request_headers, content=None)
            response = self.transport.handle_request(request)
            response.request = request
        return response

    def get(self, url: Any, **kwargs: Any) -> Response:
        return self.request("GET", url, **kwargs)

    def post(self, url: Any, **kwargs: Any) -> Response:
        return self.request("POST", url, **kwargs)

    def put(self, url: Any, **kwargs: Any) -> Response:
        return self.request("PUT", url, **kwargs)

    def patch(self, url: Any, **kwargs: Any) -> Response:
        return self.request("PATCH", url, **kwargs)

    def delete(self, url: Any, **kwargs: Any) -> Response:
        return self.request("DELETE", url, **kwargs)

    def options(self, url: Any, **kwargs: Any) -> Response:
        return self.request("OPTIONS", url, **kwargs)

    def head(self, url: Any, **kwargs: Any) -> Response:
        return self.request("HEAD", url, **kwargs)
