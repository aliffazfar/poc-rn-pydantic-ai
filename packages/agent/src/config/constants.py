# Banking Constants
APP_NAME = "JomKira"

SUPPORTED_BANKS = [
    "Maybank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam",
    "OCBC Bank",
    "Standard Chartered",
    "HSBC",
    "UOB",
    "Bank Rakyat",
    "Affin Bank",
    "Alliance Bank",
]

SUPPORTED_BILLERS = [
    "TNB",
    "Syabas",
    "Telekom Malaysia",
    "Unifi",
    "Astro",
    "Indah Water",
]

# Structured Limits
TRANSACTION_LIMITS = {
    "single_max": 10000.00,      # RM 10,000 per transfer
    "daily_max": 50000.00,       # RM 50,000 per day
    "min_amount": 1.00,          # Minimum RM 1
}

# Security/Masking
MASK_VISIBLE_DIGITS = 4
MASKING_CHAR = "*"

# Regex patterns for validation
ACCOUNT_NUMBER_PATTERN = r'^\d{10,16}$'
AMOUNT_PATTERN = r'^\d+(\.\d{1,2})?$'

# Consolidated Response Templates
RESPONSES = {
    # Validation Errors
    "insufficient_balance": "Insufficient balance. Your current balance is RM {balance:.2f}.",
    "invalid_amount": "Please provide a valid amount between RM {min_val:.2f} and RM {max_val:.2f}.",
    "unsupported_bank": "The bank '{bank}' is not in our supported list. Supported banks: Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank.",
    "invalid_account_number": "Invalid account number. Please provide a valid 10-16 digit account number.",
    
    # Language & Security
    "language_request": "I can best assist you in English. Please rephrase your request in English.",
    "malicious_input": "Your message contains invalid characters. Please rephrase your request.",
    
    # Scope & Flow
    "out_of_scope": "I can only help with bank transfers and bill payments. For {topic}, please contact our customer service.",
    "bank_not_found": "I couldn't identify that bank. Supported banks include: Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank.",
    "transfer_pending": "You have a pending transfer. Please approve or decline it before starting a new one.",
    
    # Success Messages
    "transfer_prepared": "Transfer prepared successfully. Please review and confirm.",
    "transfer_completed": "Transfer completed successfully.",
    "transfer_cancelled": "Transfer has been cancelled.",
}
