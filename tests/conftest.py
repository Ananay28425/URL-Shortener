import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

TEST_DB_PATH = ROOT / "url_shortener.db"
os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{TEST_DB_PATH}")


@pytest.fixture(autouse=True)
def reset_sqlite_db() -> None:
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    yield
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
