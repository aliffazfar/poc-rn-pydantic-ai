import re
import logging
from config.constants import MASK_VISIBLE_DIGITS, MASKING_CHAR

logger = logging.getLogger("jom_kira.utils.security")

def mask_account_number(account_number: str) -> str:
    """
    Masks an account number, showing only a specific number of last digits.
    Example: 1234567890 -> ******7890 (if MASK_VISIBLE_DIGITS is 4)
    """
    if not account_number:
        return ""
    
    # Remove any non-digit characters for masking
    clean_number = re.sub(r'\D', '', account_number)
    
    if len(clean_number) <= MASK_VISIBLE_DIGITS:
        return clean_number
        
    return MASKING_CHAR * (len(clean_number) - MASK_VISIBLE_DIGITS) + clean_number[-MASK_VISIBLE_DIGITS:]
