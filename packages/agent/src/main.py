import logging
import json
from uuid import uuid4
import base64
from fastapi import FastAPI, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Union
from pydantic_ai import BinaryContent
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic_ai.ag_ui import StateDeps

# Local Imports
from agent import create_agent
from models.banking import BankingState
from models.chat import ChatRequest, ChatResponse, ChatMessage, ToolCallResult
from config.settings import settings
from config.logging import setup_logging
from guardrails.middleware import GuardrailMiddleware
from core.context import current_image_ctx, ImageData

# 1. Setup Logging
setup_logging()
logger = logging.getLogger("jom_kira.main")

# In-memory session store for POC
# Key: session_id, Value: BankingState
session_store: dict[str, BankingState] = {}


# Custom Rate Limit Handler
async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    client_ip = get_remote_address(request)
    logger.warning(f"🚨 RATE LIMIT: IP {client_ip} hit limit '{exc.detail}' on {request.url.path}")
    return _rate_limit_exceeded_handler(request, exc)

# 2. Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])

# 3. Initialize Agent
agent = create_agent()

# 4. Create the base FastAPI app
app = FastAPI(title=settings.APP_NAME)

# 5. Create AgUI app for CopilotKit compatibility and mount it
agui_app = agent.to_ag_ui(deps=StateDeps(BankingState()))
app.mount("/agui", agui_app)

# 5. Add CORS Middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# 6. Add Rate Limiting & Exception Handlers
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"💥 Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

# 7. Add Guardrail Middleware
app.add_middleware(GuardrailMiddleware)


# ============================================================
# NEW: Vercel AI SDK Compatible Endpoint for React Native
# ============================================================

@app.post("/api/chat")
async def vercel_ai_chat(
    request: ChatRequest,
    x_platform: Optional[str] = Header(default="web"),
    x_session_id: Optional[str] = Header(default=None)
):
    """
    Vercel AI SDK compatible endpoint for React Native.
    Returns non-streaming JSON response with tool call metadata.

    This allows React Native apps using react-native-vercel-ai
    to communicate with the same PydanticAI agent.
    """
    logger.info(f"📱 /api/chat request from platform: {x_platform}, session: {x_session_id}")

    # Get or create session
    session_id = x_session_id or str(uuid4())
    
    if session_id in session_store:
        state = session_store[session_id]
        logger.info(f"📦 Loaded existing session: {session_id[:8]}...")
    else:
        # Create new state with initial balance if provided
        initial_balance = request.initial_balance if request.initial_balance is not None else 1000.0
        state = BankingState(balance=initial_balance)
        session_store[session_id] = state
        logger.info(f"🆕 Created new session: {session_id[:8]}... with balance RM {initial_balance}")

    # Handle silent initialization
    if request.is_init:
        logger.info(f"🤫 Silent initialization for session: {session_id[:8]}...")
        return ChatResponse(
            message=ChatMessage(
                role="assistant",
                content="INIT_OK"
            ),
            tool_calls=[],
            state=state.model_dump(),
            session_id=session_id
        )

    # Extract user message and image
    user_input: List[Union[str, BinaryContent]] = []
    
    # Process history for PydanticAI (simplification: only use last message for multimodal if image present)
    # Most agents expect the current user message to contain the image
    if request.messages:
        last_msg = request.messages[-1]
        
        # Add text content
        if last_msg.content:
            user_input.append(last_msg.content)
        elif last_msg.image:
            # If only image is provided, add a prompt to trigger vision analysis
            user_input.append("I've uploaded an image. Please analyze it.")
        
        # Add image content if present
        if last_msg.image:
            logger.info(f"   🖼️  Processing image from request: {last_msg.image.format}")
            try:
                # Note: context is already set by GuardrailMiddleware, but we ensure it here too
                # just in case middleware extraction logic differs.
                current_image_ctx.set(ImageData(
                    bytes=last_msg.image.bytes,
                    format=last_msg.image.format
                ))
                
                img_bytes = base64.b64decode(last_msg.image.bytes)
                # Ensure we use valid MIME types for vision models
                fmt = last_msg.image.format.lower()
                if fmt == 'jpg': fmt = 'jpeg'
                mime_type = f"image/{fmt}"
                
                user_input.append(BinaryContent(data=img_bytes, media_type=mime_type))
            except Exception as e:
                logger.error(f"   ❌ Failed to decode image: {e}")

    # Run the SAME agent used by CopilotKit
    # Note: PydanticAI supports multimodal inputs in agent.run()
    # Fallback to empty string if no input
    prompt = user_input if user_input else ""
    result = await agent.run(prompt, deps=StateDeps(state))

    # Extract tool calls for Generative UI
    tool_calls = extract_tool_calls(result)

    logger.info(f"   └─ Tool calls: {len(tool_calls)}, Status: {state.status}")

    return ChatResponse(
        message=ChatMessage(
            role="assistant",
            content=str(result.output)
        ),
        tool_calls=tool_calls,
        state=state.model_dump(),
        session_id=session_id
    )


def extract_tool_calls(result) -> list[ToolCallResult]:
    """
    Extract tool call information from PydanticAI result.
    This enables Generative UI on the React Native side.
    """
    tool_calls = []

    try:
        if hasattr(result, 'all_messages'):
            for msg in result.all_messages():
                logger.debug(f"   📨 Message type: {type(msg).__name__}")
                if hasattr(msg, 'parts'):
                    for part in msg.parts:
                        logger.debug(f"      └─ Part: {type(part).__name__}, part_kind={getattr(part, 'part_kind', 'N/A')}")
                        # Check for part_kind == 'tool-call' to avoid ToolReturnPart
                        if hasattr(part, 'part_kind') and part.part_kind == 'tool-call':
                            args = {}
                            if hasattr(part, 'args'):
                                raw_args = part.args
                                logger.debug(f"         └─ Args type: {type(raw_args).__name__}, value: {raw_args}")
                                # Handle different arg types: str (JSON), dict, ArgsDict, Pydantic model
                                if isinstance(raw_args, str):
                                    # JSON string - parse it
                                    try:
                                        args = json.loads(raw_args)
                                    except json.JSONDecodeError:
                                        args = {}
                                elif isinstance(raw_args, dict):
                                    args = raw_args
                                elif hasattr(raw_args, 'model_dump'):
                                    # Pydantic model
                                    args = raw_args.model_dump()
                                elif hasattr(raw_args, 'args_dict'):
                                    # ArgsDict type
                                    args = dict(raw_args.args_dict)
                                else:
                                    # Try to convert to dict
                                    try:
                                        args = dict(raw_args)
                                    except (TypeError, ValueError):
                                        args = {}
                            tool_calls.append(ToolCallResult(
                                tool_name=part.tool_name,
                                args=args,
                                status="complete"
                            ))
                            logger.debug(f"         ✅ Extracted: {part.tool_name} with args: {args}")
    except Exception as e:
        logger.error(f"Failed to extract tool calls: {e}", exc_info=True)

    return tool_calls


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"✨ Starting {settings.APP_NAME}...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
