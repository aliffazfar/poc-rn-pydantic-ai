import logging
import re
import time
from typing import Tuple
from models.banking import BankingState, TransferDetails
from utils.security import mask_account_number
from utils.sanitizers import sanitize_pii
from config.constants import SUPPORTED_BANKS, RESPONSES, ACCOUNT_NUMBER_PATTERN, TRANSACTION_LIMITS

logger = logging.getLogger("jom_kira.services.transfer")

class TransferService:
    @staticmethod
    def prepare_transfer(state: BankingState, details: TransferDetails) -> Tuple[bool, str]:
        """
        Validates and prepares a transfer.
        """
        start_time = time.time()
        
        # Amount Validation
        if details.amount <= 0 or details.amount < TRANSACTION_LIMITS["min_amount"]:
            logger.warning(f"⚠️  [VALIDATION_FAILURE] Invalid amount")
            logger.warning(f"   └─ Amount: RM {details.amount:.2f}")
            return False, RESPONSES["invalid_amount"].format(
                min_val=TRANSACTION_LIMITS["min_amount"],
                max_val=TRANSACTION_LIMITS["single_max"]
            )
        
        if details.amount > TRANSACTION_LIMITS["single_max"]:
            logger.warning(f"⚠️  [VALIDATION_FAILURE] Amount exceeds single transfer limit")
            logger.warning(f"   ├─ Amount: RM {details.amount:,.2f}")
            logger.warning(f"   └─ Limit: RM {TRANSACTION_LIMITS['single_max']:,.2f}")
            return False, RESPONSES["invalid_amount"].format(
                min_val=TRANSACTION_LIMITS["min_amount"],
                max_val=TRANSACTION_LIMITS["single_max"]
            )

        # Account Number Validation
        if not re.match(ACCOUNT_NUMBER_PATTERN, details.account_number):
            logger.warning(f"⚠️  [VALIDATION_FAILURE] Invalid account number format")
            logger.warning(f"   └─ Account: {details.account_number} (expected 10-16 digits)")
            return False, RESPONSES["invalid_account_number"]

        # Bank Validation
        if details.bank_name not in SUPPORTED_BANKS:
            logger.warning(f"🛡️  [GUARDRAIL] Unsupported bank: '{details.bank_name}'")
            return False, RESPONSES["unsupported_bank"].format(bank=details.bank_name)

        # Balance Validation
        if state.balance < details.amount:
            logger.warning(f"🛡️  [GUARDRAIL] Insufficient funds detected")
            logger.warning(f"   ├─ Available: RM {state.balance:,.2f}")
            logger.warning(f"   ├─ Requested: RM {details.amount:,.2f}")
            logger.warning(f"   └─ Recipient: {sanitize_pii(details.recipient_name)}")
            return False, RESPONSES["insufficient_balance"].format(balance=state.balance)

        masked_account = mask_account_number(details.account_number)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(f"💸  Preparing Transfer...")
        logger.info(f"   ├─ Recipient: {sanitize_pii(details.recipient_name)}")
        logger.info(f"   ├─ Bank: {details.bank_name}")
        logger.info(f"   ├─ Amount: RM {details.amount:,.2f}")
        logger.info(f"   ├─ Account: {masked_account}")
        logger.info(f"   └─ Duration: {duration_ms:.1f}ms")

        state.pending_transfer = details
        state.status = "confirming_payment"
        return True, RESPONSES["transfer_prepared"]

    @staticmethod
    def execute_transfer(state: BankingState) -> Tuple[bool, str]:
        """
        Executes the pending transfer.
        """
        start_time = time.time()
        
        if not state.pending_transfer:
            logger.warning("⚠️  [EXECUTION_SKIPPED] No pending transfer found.")
            return False, "No pending transfer found."

        transfer = state.pending_transfer
        
        if state.balance < transfer.amount:
            logger.error(f"❌  [EXECUTION_FAILED] Insufficient balance")
            logger.error(f"   ├─ Current: RM {state.balance:,.2f}")
            logger.error(f"   └─ Required: RM {transfer.amount:,.2f}")
            state.status = "error"
            return False, RESPONSES["insufficient_balance"].format(balance=state.balance)

        prev_balance = state.balance
        state.balance -= transfer.amount
        
        masked_account = mask_account_number(transfer.account_number)
        history_entry = (
            f"Transferred RM {transfer.amount:,.2f} to {transfer.recipient_name} "
            f"({transfer.bank_name} - {masked_account})"
        )
        state.transaction_history.append(history_entry)
        
        state.pending_transfer = None
        state.status = "completed"
        
        duration_ms = (time.time() - start_time) * 1000
        logger.info(f"✅  Transfer Completed Successfully")
        logger.info(f"   ├─ Recipient: {sanitize_pii(transfer.recipient_name)}")
        logger.info(f"   ├─ Amount: RM {transfer.amount:,.2f}")
        logger.info(f"   ├─ New Balance: RM {state.balance:,.2f}")
        logger.info(f"   └─ Duration: {duration_ms:.1f}ms")
        
        return True, RESPONSES["transfer_completed"]

    @staticmethod
    def cancel_transfer(state: BankingState) -> bool:
        """
        Cancels the pending transfer.
        """
        state.pending_transfer = None
        state.status = "idle"
        logger.info("🛑  [TRANSFER_CANCELLED] Pending transfer cleared by user.")
        return True
