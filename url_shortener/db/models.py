from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(Text, nullable=False)
    short_code = Column(String(10), unique=True, nullable=False, index=True)
    custom_alias = Column(String(50), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    click_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="urls")
    analytics = relationship(
        "Analytics", back_populates="url", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_short_code_active", "short_code", "is_active"),
        Index("idx_user_created", "user_id", "created_at"),
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    api_key = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    rate_limit = Column(Integer, default=100)  # requests per hour
    custom_domain = Column(String(255), nullable=True)

    urls = relationship("URL", back_populates="user")

    __table_args__ = (Index("idx_email_active", "email", "is_active"),)


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    url_id = Column(Integer, ForeignKey("urls.id"), nullable=False, index=True)
    ip_address = Column(String(45), nullable=False)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    referer = Column(Text, nullable=True)
    country = Column(String(2), nullable=True)  # ISO 3166-1 alpha-2
    city = Column(String(100), nullable=True)
    device_type = Column(String(20), nullable=True)  # desktop, mobile, tablet
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    url = relationship("URL", back_populates="analytics")

    __table_args__ = (
        Index("idx_url_timestamp", "url_id", "timestamp"),
        Index("idx_country_timestamp", "country", "timestamp"),
        Index("idx_ip_timestamp", "ip_address", "timestamp"),
    )


class APICache(Base):
    __tablename__ = "api_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    cache_value = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("idx_cache_expires", "cache_key", "expires_at"),)
