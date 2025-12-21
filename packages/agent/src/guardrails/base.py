from abc import ABC, abstractmethod
from typing import Any, Optional
from pydantic import BaseModel

class GuardrailContext(BaseModel):
    """Context passed to each guardrail for evaluation."""
    body: dict[str, Any]
    text_candidates: list[str]
    metadata: dict[str, Any] = {}

class GuardrailResult(BaseModel):
    """Result of a guardrail check."""
    passed: bool
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    metadata: dict[str, Any] = {}

class BaseGuardrail(ABC):
    """Abstract base class for all guardrails."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique name of the guardrail."""
        pass
    
    @property
    def priority(self) -> int:
        """Priority order (lower runs first)."""
        return 100
    
    @abstractmethod
    def check(self, context: GuardrailContext) -> GuardrailResult:
        """Perform the guardrail check."""
        pass
