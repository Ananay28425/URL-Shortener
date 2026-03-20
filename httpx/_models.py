from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Iterator, List, Mapping, MutableMapping, Optional
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit


class BaseTransport:
    def handle_request(self, request: "Request") -> "Response":
        raise NotImplementedError


class ByteStream:
    def __init__(self, content: bytes):
        self._content = content

    def __iter__(self) -> Iterator[bytes]:
        yield self._content

    def read(self) -> bytes:
        return self._content


class Headers(dict):
    def __init__(self, items: Optional[Iterable[tuple[str, str]]] = None):
        super().__init__()
        if items:
            for key, value in items:
                self[key] = value

    def __setitem__(self, key: str, value: str) -> None:
        super().__setitem__(key.lower(), value)

    def get(self, key: str, default: Any = None) -> Any:
        return super().get(key.lower(), default)

    def __contains__(self, key: object) -> bool:
        if isinstance(key, str):
            return super().__contains__(key.lower())
        return super().__contains__(key)


class URL:
    def __init__(self, url: str):
        self._url = url
        self._parts = urlsplit(url)

    @property
    def scheme(self) -> str:
        return self._parts.scheme or "http"

    @property
    def netloc(self) -> bytes:
        return self._parts.netloc.encode("ascii")

    @property
    def path(self) -> str:
        return self._parts.path or "/"

    @property
    def raw_path(self) -> bytes:
        raw = self.path
        if self._parts.query:
            raw += f"?{self._parts.query}"
        return raw.encode("ascii")

    @property
    def query(self) -> bytes:
        return self._parts.query.encode("ascii")

    def join(self, other: Any) -> "URL":
        return URL(urljoin(str(self), str(other)))

    def copy_merge_params(self, params: Any) -> "URL":
        current = dict(parse_qsl(self._parts.query, keep_blank_values=True))
        if isinstance(params, Mapping):
            current.update({k: str(v) for k, v in params.items()})
        else:
            current.update({k: str(v) for k, v in params})
        return URL(urlunsplit((self._parts.scheme, self._parts.netloc, self._parts.path, urlencode(current, doseq=True), self._parts.fragment)))

    def __str__(self) -> str:
        return self._url


class Request:
    def __init__(self, method: str, url: URL, headers: Optional[Mapping[str, str]] = None, content: Any = None):
        self.method = method
        self.url = url
        self.headers = Headers((headers or {}).items())
        self._content = content

    def read(self) -> bytes:
        if self._content is None:
            return b""
        if isinstance(self._content, bytes):
            return self._content
        if isinstance(self._content, str):
            return self._content.encode("utf-8")
        return bytes(self._content)


class Response:
    def __init__(self, status_code: int, headers: Optional[Iterable[tuple[str, str]]] = None, stream: Optional[ByteStream] = None, request: Optional[Request] = None):
        self.status_code = status_code
        self.headers = Headers(headers)
        self.stream = stream or ByteStream(b"")
        self.request = request

    @property
    def content(self) -> bytes:
        return self.stream.read()

    @property
    def text(self) -> str:
        return self.content.decode("utf-8")

    def json(self) -> Any:
        return json.loads(self.text)
