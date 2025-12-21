import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic_ai.ag_ui import StateDeps

# Local Imports
from agent import create_agent
from models.banking import BankingState
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

# 4. Create the base AgUI app
app: FastAPI = agent.to_ag_ui(deps=StateDeps(BankingState()))

# 5. Add Rate Limiting & Exception Handlers
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"💥 Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

# 6. Add Guardrail Middleware (clean and reusable)
app.add_middleware(GuardrailMiddleware)

if __name__ == "__main__":
    import uvicorn
    logger.info(f"✨ Starting {settings.APP_NAME}...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
