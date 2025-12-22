import logging
from fastapi import FastAPI, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
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

# 1. Setup Logging
setup_logging()
logger = logging.getLogger("jom_kira.main")


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
    x_platform: Optional[str] = Header(default="web")
):
    """
    Vercel AI SDK compatible endpoint for React Native.
    Returns non-streaming JSON response with tool call metadata.

    This allows React Native apps using react-native-vercel-ai
    to communicate with the same PydanticAI agent.
    """
    logger.info(f"📱 /api/chat request from platform: {x_platform}")

    # Extract user message
    user_input = ""
    if request.messages:
        user_input = request.messages[-1].content
        logger.debug(f"   └─ User: {user_input[:50]}...")

    # Initialize state - in production, load from session/database
    state = BankingState()

    # Run the SAME agent used by CopilotKit
    result = await agent.run(user_input, deps=StateDeps(state))

    # Extract tool calls for Generative UI
    tool_calls = extract_tool_calls(result)

    logger.info(f"   └─ Tool calls: {len(tool_calls)}, Status: {state.status}")

    return ChatResponse(
        message=ChatMessage(
            role="assistant",
            content=str(result.output)
        ),
        tool_calls=tool_calls,
        state=state.model_dump()
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
                if hasattr(msg, 'parts'):
                    for part in msg.parts:
                        if hasattr(part, 'tool_name'):
                            args = {}
                            if hasattr(part, 'args'):
                                args = part.args if isinstance(part.args, dict) else {}
                            tool_calls.append(ToolCallResult(
                                tool_name=part.tool_name,
                                args=args,
                                status="complete"
                            ))
    except Exception as e:
        logger.error(f"Failed to extract tool calls: {e}")

    return tool_calls


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    logger.info(f"✨ Starting {settings.APP_NAME}...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
