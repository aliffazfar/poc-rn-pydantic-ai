import logging
import json
from guardrails.registry import GuardrailRegistry
from guardrails.base import GuardrailContext
from core.agui_events import AGUISSEBuilder
from utils.agui import extract_last_user_message, extract_last_user_image
from core.context import current_image_ctx

# Import guardrails to register them
from guardrails.checks.sanitization import SanitizationGuardrail

logger = logging.getLogger("jom_kira.guardrails.middleware")
logger.setLevel(logging.INFO) # Ensure we see info logs

# Initialize registry and register guardrails
GuardrailRegistry.register(SanitizationGuardrail())

class GuardrailMiddleware:
    """
    ASGI Middleware for guardrail enforcement with AG-UI SSE responses.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST":
            return await self.app(scope, receive, send)
        
        path = scope.get("path", "")
        is_agui_path = path.startswith("/agui")
        
        body, messages = await self._buffer_request(receive)
        
        # Parse body once
        body_json = None
        try:
            if body:
                body_json = json.loads(body)
                
                # --- DEBUGGING START ---
                # Log the structure of the last user message to debug image extraction
                if "messages" in body_json:
                    msgs = body_json["messages"]
                    logger.info(f"🔍 Middleware received {len(msgs)} messages")
                    if msgs:
                        last_msg = msgs[-1]
                        logger.info(f"🔍 Last message keys: {list(last_msg.keys())}")
                        logger.info(f"🔍 Last message role: {last_msg.get('role')}")
                        
                        content = last_msg.get("content")
                        if isinstance(content, list):
                            # Summarize content list
                            summary = []
                            for item in content:
                                if isinstance(item, dict):
                                    # Create a safe summary dict
                                    safe_item = {k: (v[:20] + "..." if isinstance(v, str) and len(v) > 50 else v) for k, v in item.items()}
                                    summary.append(safe_item)
                                else:
                                    summary.append(str(item)[:50])
                            logger.info(f"🔍 Last message content (LIST): {summary}")
                        else:
                            logger.info(f"🔍 Last message content (type={type(content)}): {str(content)[:100]}")
                            
                        # Check specific keys from agui.py logic
                        if "imageMessage" in last_msg:
                            logger.info("🔍 Found 'imageMessage' key")
                        if "image" in last_msg:
                            logger.info("🔍 Found 'image' key at top level")
                # --- DEBUGGING END ---
                
        except Exception as e:
            logger.debug(f"JSON parse error in middleware: {e}")
        
        # Extract image and set context
        token = None
        modified_body = None
        if body_json:
            image_data = extract_last_user_image(body_json)
            if image_data:
                token = current_image_ctx.set(image_data)
                logger.info(f"📸 Image context set: format={image_data.get('format')} bytes_len={len(image_data.get('bytes', ''))}")
                
                # Remove custom _image field from messages to avoid Pydantic validation error
                # (PydanticAI's AG-UI schema uses extra='forbid')
                if is_agui_path:
                    modified_body = self._strip_image_fields(body_json)
            else:
                logger.info("⚠️ extract_last_user_image returned None")
        
        try:
            # Run guardrails
            guardrail_error_message = self._run_guardrails(body_json)
            
            if guardrail_error_message:
                return await self._send_guardrail_response(send, guardrail_error_message)
            
            # Create replay receive for downstream handlers
            # If we modified the body, use the cleaned version
            if modified_body:
                cleaned_body = json.dumps(modified_body).encode('utf-8')
                cleaned_messages = [
                    {
                        "type": "http.request",
                        "body": cleaned_body,
                        "more_body": False,
                    }
                ]
                async def replay_receive():
                    if cleaned_messages:
                        return cleaned_messages.pop(0)
                    return await receive()
            else:
                async def replay_receive():
                    if messages:
                        return messages.pop(0)
                    return await receive()
            
            return await self.app(scope, replay_receive, send)
        finally:
            # Clean up context var
            if token:
                current_image_ctx.reset(token)
    
    def _strip_image_fields(self, body_json: dict) -> dict:
        """
        Remove custom image fields (_image) from messages to avoid Pydantic validation errors.
        PydanticAI's AG-UI schema uses extra='forbid', so unknown fields cause 422 errors.
        """
        import copy
        cleaned = copy.deepcopy(body_json)
        
        if "messages" in cleaned:
            for msg in cleaned["messages"]:
                # Remove our custom _image field
                if "_image" in msg:
                    del msg["_image"]
                # Also remove original image field if it somehow got through
                if "image" in msg:
                    del msg["image"]
        
        return cleaned
    
    async def _buffer_request(self, receive) -> tuple[bytes, list]:
        """Buffer the entire request body for inspection."""
        body = b""
        messages = []
        more_body = True
        
        try:
            while more_body:
                message = await receive()
                messages.append(message)
                if message["type"] == "http.request":
                    body += message.get("body", b"")
                    more_body = message.get("more_body", False)
                elif message["type"] == "http.disconnect":
                    more_body = False
        except Exception as e:
            logger.debug(f"Error buffering request body: {e}")
            
        return body, messages
    
    def _run_guardrails(self, body_json: dict | None) -> str | None:
        """
        Run all registered guardrail checks.
        Returns an error message string if blocked, None if allowed.
        """
        if not body_json:
            return None
        
        try:
            text_candidates = extract_last_user_message(body_json)
            
            context = GuardrailContext(
                body=body_json,
                text_candidates=text_candidates,
                metadata={"ip": "N/A"}
            )
            
            result = GuardrailRegistry.run_all(context)
            if not result.passed:
                return result.error_message
                
        except Exception as e:
            logger.debug(f"Guardrail execution error: {e}")
        
        return None
    
    async def _send_guardrail_response(self, send, message: str):
        """Send a proper AG-UI SSE stream for guardrail responses."""
        builder = AGUISSEBuilder()
        events = builder.build_text_response(message)
        
        # Start SSE response
        await send({
            "type": "http.response.start",
            "status": 200,
            "headers": [
                [b"content-type", b"text/event-stream"],
                [b"cache-control", b"no-cache"],
                [b"connection", b"keep-alive"],
                [b"x-accel-buffering", b"no"],
            ],
        })
        
        # Send events
        for event in events:
            await send({
                "type": "http.response.body",
                "body": AGUISSEBuilder.format_sse(event),
                "more_body": True,
            })
        
        # Close stream
        await send({
            "type": "http.response.body",
            "body": b"",
            "more_body": False,
        })
