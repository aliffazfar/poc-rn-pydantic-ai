from pydantic import BaseModel
from typing import Optional, List

class ChatMessage(BaseModel):
    """Message format compatible with Vercel AI SDK."""
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    """Request format from react-native-vercel-ai."""
    messages: List[ChatMessage]
    initial_balance: Optional[float] = None
    is_init: bool = False

class ToolCallResult(BaseModel):
    """Tool call metadata for Generative UI."""
    tool_name: str
    args: dict
    status: str  # executing, complete

class ChatResponse(BaseModel):
    """Response format for react-native-vercel-ai."""
    message: ChatMessage
    tool_calls: List[ToolCallResult] = []
    state: dict = {}
    session_id: str = ""