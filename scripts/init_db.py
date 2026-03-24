#!/usr/bin/env python3
"""Initialize the database schema and verify the Valkey connection."""

import asyncio
import sys
from pathlib import Path

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from url_shortener.core.config import get_settings
from url_shortener.db.postgres import db_manager
from url_shortener.db.valkey import valkey_manager


async def initialize_database() -> None:
    """Initialize PostgreSQL and create tables."""
    print("Initializing PostgreSQL database...")

    settings = get_settings()
    db_manager.database_url = settings.database_url

    await db_manager.initialize()
    await db_manager.create_tables()
    print("PostgreSQL database initialized successfully")


async def initialize_valkey() -> None:
    """Initialize Valkey and verify connectivity."""
    print("Initializing Valkey...")

    settings = get_settings()
    valkey_manager.valkey_url = settings.valkey_url

    await valkey_manager.initialize()
    print("Valkey initialized successfully")


async def cleanup() -> None:
    """Clean up resources."""
    print("Cleaning up resources...")

    try:
        await db_manager.close()
        await valkey_manager.close()
        print("Resources cleaned up successfully")
    except Exception as exc:
        print(f"Cleanup warning: {exc}")


async def main() -> None:
    """Run initialization tasks."""
    print("Starting URL Shortener initialization...")
    print("=" * 50)

    try:
        await initialize_database()
        await initialize_valkey()

        print("=" * 50)
        print("URL Shortener initialization completed successfully!")
        print("\nNext steps:")
        print("1. Set DATABASE_URL and VALKEY_URL in your environment or .env file")
        print("2. Run the application: uvicorn url_shortener.main:app --reload")
        print("3. Visit: http://localhost:8000/docs for API documentation")
    finally:
        await cleanup()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInitialization interrupted by user")
        sys.exit(1)
    except Exception as exc:
        print(f"\nInitialization failed: {exc}")
        sys.exit(1)
