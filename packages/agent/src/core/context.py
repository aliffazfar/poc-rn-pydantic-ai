"""
Context variables for passing data between middleware and tools.

This module provides a ContextVar-based mechanism for passing image data
from the middleware (where it's extracted from requests) to vision tools
(where it's used for analysis), without modifying the AG-UI protocol schema.
"""
from contextvars import ContextVar
from typing import TypedDict


class ImageData(TypedDict, total=False):
    """Type definition for image data passed through context."""
    bytes: str  # Base64-encoded image data
    format: str  # Image format (jpeg, png, webp, gif)


# ContextVar for passing image data from middleware to tools
# This avoids modifying the AG-UI message schema while still allowing
# image data to flow from the request to the vision tool
current_image_ctx: ContextVar[ImageData | None] = ContextVar(
    "current_image_ctx",
    default=None
)
