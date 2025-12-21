import logging
from guardrails.base import BaseGuardrail, GuardrailContext, GuardrailResult

logger = logging.getLogger("jom_kira.guardrails.registry")

class GuardrailRegistry:
    """Registry for managing and executing guardrails in priority order."""
    
    _guardrails: list[BaseGuardrail] = []
    
    @classmethod
    def register(cls, guardrail: BaseGuardrail):
        """Register a new guardrail."""
        cls._guardrails.append(guardrail)
        # Sort by priority (lower first)
        cls._guardrails.sort(key=lambda g: g.priority)
        logger.debug(f"Registered guardrail: {guardrail.name} (priority: {guardrail.priority})")
    
    @classmethod
    def run_all(cls, context: GuardrailContext) -> GuardrailResult:
        """Run all registered guardrails in order."""
        for guardrail in cls._guardrails:
            logger.debug(f"Running guardrail: {guardrail.name}")
            result = guardrail.check(context)
            if not result.passed:
                logger.warning(f"Guardrail blocked: {guardrail.name} - {result.error_message}")
                return result
        
        return GuardrailResult(passed=True)

    @classmethod
    def clear(cls):
        """Clear all registered guardrails (mainly for testing)."""
        cls._guardrails = []
