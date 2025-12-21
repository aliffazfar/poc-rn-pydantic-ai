from typing import Any
from utils.agui import generate_event_id, generate_run_id
import json

class AGUIEventType:
    """AG-UI event type constants in UPPERCASE format."""
    RUN_STARTED = "RUN_STARTED"
    RUN_FINISHED = "RUN_FINISHED"
    RUN_ERROR = "RUN_ERROR"
    TEXT_MESSAGE_START = "TEXT_MESSAGE_START"
    TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT"
    TEXT_MESSAGE_END = "TEXT_MESSAGE_END"
    TOOL_CALL_START = "TOOL_CALL_START"
    TOOL_CALL_ARGS = "TOOL_CALL_ARGS"
    TOOL_CALL_END = "TOOL_CALL_END"
    STATE_SNAPSHOT = "STATE_SNAPSHOT"
    STATE_DELTA = "STATE_DELTA"

class AGUISSEBuilder:
    """Builds AG-UI SSE event streams for guardrail responses."""
    
    def __init__(self, run_id: str = None, message_id: str = None):
        self.run_id = run_id or generate_run_id()
        self.message_id = message_id or generate_event_id()
    
    def build_text_response(self, message: str) -> list[dict]:
        """Build a complete SSE event sequence for a text response."""
        return [
            {"type": AGUIEventType.RUN_STARTED, "threadId": self.run_id, "runId": self.run_id},
            {"type": AGUIEventType.TEXT_MESSAGE_START, "messageId": self.message_id, "role": "assistant"},
            {"type": AGUIEventType.TEXT_MESSAGE_CONTENT, "messageId": self.message_id, "delta": message},
            {"type": AGUIEventType.TEXT_MESSAGE_END, "messageId": self.message_id},
            {"type": AGUIEventType.RUN_FINISHED, "threadId": self.run_id, "runId": self.run_id}
        ]
    
    def build_error_response(self, error_message: str) -> list[dict]:
        """Build SSE event sequence for error responses."""
        return [
            {"type": AGUIEventType.RUN_STARTED, "threadId": self.run_id, "runId": self.run_id},
            {"type": AGUIEventType.RUN_ERROR, "message": error_message},
            {"type": AGUIEventType.RUN_FINISHED, "threadId": self.run_id, "runId": self.run_id}
        ]
    
    @staticmethod
    def format_sse(event: dict) -> bytes:
        """Format a single event as SSE data line."""
        return f"data: {json.dumps(event)}\n\n".encode()
