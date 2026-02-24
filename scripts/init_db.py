#!/usr/bin/env python3
"""
Database initialization script for URL Shortener
Creates tables, indexes, and initial data
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from url_shortener.db.postgres import db_manager
from url_shortener.db.valkey import valkey_manager
from url_shortener.core.config import get_settings
from url_shortener.db.models import User, URL, Analytics
from url_shortener.utils.id_generator import get_id_generator
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def initialize_database():
    """Initialize PostgreSQL database"""
    print("Initializing PostgreSQL database...")

    settings = get_settings()
    db_manager.database_url = settings.get_database_url_async()

    try:
        await db_manager.initialize()
        await db_manager.create_tables()
        print("PostgreSQL database initialized successfully")
    except Exception as e:
        print(f"PostgreSQL initialization failed: {e}")
        raise


async def initialize_valkey():
    """Initialize Valkey connection"""
    print("Initializing Valkey...")

    settings = get_settings()
    valkey_manager.valkey_url = settings.valkey_url

    try:
        await valkey_manager.initialize()
        print("Valkey initialized successfully")
    except Exception as e:
        print(f"Valkey initialization failed: {e}")
        raise


async def create_admin_user():
    """Create admin user if not exists"""
    print("Creating admin user...")

    try:
        async with db_manager.get_session() as session:
            from sqlalchemy import select

            # Check if admin user exists
            result = await session.execute(
                select(User).where(User.email == "admin@example.com")
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print("Admin user already exists")
                return

            # Create admin user
            id_gen = get_id_generator()
            api_key = id_gen.generate_nanoid(length=32)
            hashed_password = pwd_context.hash("admin123")

            admin_user = User(
                email="admin@example.com",
                api_key=api_key,
                hashed_password=hashed_password,
                is_active=True,
                rate_limit=1000,  # Higher limit for admin
            )

            session.add(admin_user)
            await session.commit()

            print("Admin user created successfully")
            print(f"   Email: admin@example.com")
            print(f"   Password: admin123")
            print(f"   API Key: {api_key}")

    except Exception as e:
        print(f"Failed to create admin user: {e}")
        raise


async def create_sample_data():
    """Create sample data for testing"""
    print("Creating sample data...")

    try:
        async with db_manager.get_session() as session:
            from sqlalchemy import select

            # Get admin user
            result = await session.execute(
                select(User).where(User.email == "admin@example.com")
            )
            admin_user = result.scalar_one_or_none()

            if not admin_user:
                print("Admin user not found, skipping sample data")
                return

            id_gen = get_id_generator()

            # Create sample URLs
            sample_urls = [
                {
                    "original_url": "https://www.google.com",
                    "short_code": "google",
                    "custom_alias": "google",
                },
                {
                    "original_url": "https://www.github.com",
                    "short_code": "github",
                    "custom_alias": "github",
                },
                {
                    "original_url": "https://stackoverflow.com",
                    "short_code": "so",
                    "custom_alias": "stackoverflow",
                },
            ]

            for url_data in sample_urls:
                # Check if URL already exists
                result = await session.execute(
                    select(URL).where(URL.short_code == url_data["short_code"])
                )
                existing_url = result.scalar_one_or_none()

                if existing_url:
                    print(f"Sample URL '{url_data['short_code']}' already exists")
                    continue

                # Create new URL
                new_url = URL(
                    original_url=url_data["original_url"],
                    short_code=url_data["short_code"],
                    custom_alias=url_data["custom_alias"],
                    user_id=admin_user.id,
                    is_active=True,
                )

                session.add(new_url)

            await session.commit()
            print("Sample data created successfully")

    except Exception as e:
        print(f"Failed to create sample data: {e}")
        raise


async def setup_valkey_defaults():
    """Set up Valkey default values and test data"""
    print("Setting up Valkey defaults...")

    try:
        # Test rate limiting functionality
        test_key = "test:rate_limit"
        is_allowed, count = await valkey_manager.rate_limit_check(
            test_key, limit=5, window=60
        )

        if is_allowed and count == 1:
            print("Rate limiting functionality working")

        # Clean up test key
        await valkey_manager.delete(test_key)

        # Set up cache for common operations
        await valkey_manager.set("stats:total_urls", 0, ttl=3600)
        await valkey_manager.set("stats:total_clicks", 0, ttl=3600)

        print("Valkey defaults configured")

    except Exception as e:
        print(f"Failed to setup Valkey defaults: {e}")
        raise


async def verify_installation():
    """Verify that installation is working correctly"""
    print("Verifying installation...")

    try:
        # Test database connection
        db_health = await db_manager.health_check()
        print(f"Database health: {'OK' if db_health else 'FAILED'}")

        # Test Valkey connection
        valkey_health = await valkey_manager.health_check()
        print(f"Valkey health: {'OK' if valkey_health else 'FAILED'}")

        # Test ID generation
        id_gen = get_id_generator()
        test_id = id_gen.generate_nanoid()
        print(f"ID generation: OK (generated: {test_id})")

        print("Installation verification completed successfully!")

    except Exception as e:
        print(f"Installation verification failed: {e}")
        raise


async def cleanup():
    """Clean up resources"""
    print("Cleaning up resources...")

    try:
        await db_manager.close()
        await valkey_manager.close()
        print("Resources cleaned up successfully")
    except Exception as e:
        print(f"Cleanup warning: {e}")


async def main():
    """Main initialization function"""
    print("Starting URL Shortener database initialization...")
    print("=" * 50)

    try:
        # Initialize systems
        await initialize_database()
        await initialize_valkey()

        # Create initial data
        await create_admin_user()
        await create_sample_data()

        # Setup Valkey
        await setup_valkey_defaults()

        # Verify everything works
        await verify_installation()

        print("=" * 50)
        print("URL Shortener initialization completed successfully!")
        print("\nNext steps:")
        print("1. Update your .env file with proper database credentials")
        print("2. Run the application: uvicorn url_shortener.main:app --reload")
        print("3. Visit: http://localhost:8000/docs for API documentation")

    except Exception as e:
        print(f"Initialization failed: {e}")
        sys.exit(1)

    finally:
        await cleanup()


if __name__ == "__main__":
    # Check if running in correct directory
    if not Path("url_shortener").exists():
        print("Please run this script from the project root directory")
        sys.exit(1)

    asyncio.run(main())
