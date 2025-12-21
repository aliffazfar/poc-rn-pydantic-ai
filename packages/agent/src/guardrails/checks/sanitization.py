import re
import logging
from guardrails.base import BaseGuardrail, GuardrailContext, GuardrailResult
from config.constants import RESPONSES

logger = logging.getLogger("jom_kira.guardrails.checks.sanitization")

class SanitizationGuardrail(BaseGuardrail):
    """Guardrail to block potentially malicious characters and script injection."""
    
    @property
    def name(self) -> str:
        return "sanitization"
    
    @property
    def priority(self) -> int:
        return 10  # Run before language detection
    
    def check(self, context: GuardrailContext) -> GuardrailResult:
        for text in context.text_candidates:
            if not text:
                continue
                
            if self._is_malicious(text):
                logger.warning(f"🚨  [GUARDRAIL] Malicious input detected")
                logger.warning(f"   └─ Content: '{text[:50]}...'")
                return GuardrailResult(
                    passed=False,
                    error_message=RESPONSES["malicious_input"],
                    error_code="MALICIOUS_INPUT_DETECTED"
                )
        
        return GuardrailResult(passed=True)
    
    def _is_malicious(self, text: str) -> bool:
        """Checks if the text contains common script injection patterns."""
        # Check for <script> tags
        if re.search(r'<script.*?>.*?</script>', text, flags=re.IGNORECASE | re.DOTALL):
            return True
            
        # Check for javascript: protocol
        if re.search(r'javascript:', text, flags=re.IGNORECASE):
            return True
            
        # Check for common HTML event handlers (onmouseover, onclick, etc.)
        if re.search(r'on\w+=', text, flags=re.IGNORECASE):
            return True
            
        return False
