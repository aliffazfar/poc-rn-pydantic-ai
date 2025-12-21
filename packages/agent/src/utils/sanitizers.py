import re
from typing import Any

# Patterns to scrub
PII_PATTERNS = [
    # Malaysian IC number (YYMMDD-SS-NNNN)
    (r'\b\d{6}-\d{2}-\d{4}\b', '[IC_REDACTED]'),
    # Account numbers (8-16 digits)
    (r'\b\d{8,16}\b', '[ACCT_REDACTED]'),
    # Phone numbers (+60...)
    (r'\+60\d{9,10}', '[PHONE_REDACTED]'),
    # Email addresses
    (r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[EMAIL_REDACTED]'),
]

def sanitize_pii(text: str) -> str:
    """Remove PII from text before logging."""
    if not isinstance(text, str):
        text = str(text)
    result = text
    for pattern, replacement in PII_PATTERNS:
        result = re.sub(pattern, replacement, result)
    return result


def sanitize_state(state: dict[str, Any]) -> dict[str, Any]:
    """Create a PII-safe copy of state for logging."""
    safe_state = state.copy()

    if 'pending_transfer' in safe_state and safe_state['pending_transfer']:
        # Check if it's an object/dict or a Pydantic model
        transfer = safe_state['pending_transfer']
        if hasattr(transfer, 'model_copy'): # Pydantic v2
            transfer_copy = transfer.model_copy()
            transfer_copy.account_number = '[REDACTED]'
            transfer_copy.recipient_name = (transfer_copy.recipient_name[:2] + '***') if transfer_copy.recipient_name else "***"
            safe_state['pending_transfer'] = transfer_copy
        elif isinstance(transfer, dict):
            transfer_copy = transfer.copy()
            transfer_copy['account_number'] = '[REDACTED]'
            if transfer_copy.get('recipient_name'):
                transfer_copy['recipient_name'] = transfer_copy['recipient_name'][:2] + '***'
            else:
                transfer_copy['recipient_name'] = '***'
            safe_state['pending_transfer'] = transfer_copy

    return safe_state
