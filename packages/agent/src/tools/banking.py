from pydantic_ai import RunContext
from pydantic_ai.ag_ui import StateDeps
from ag_ui.core import EventType, StateSnapshotEvent
import logging

from models.banking import BankingState, TransferDetails, BillDetails
from services.transfer_service import TransferService

logger = logging.getLogger("jom_kira.tools.banking")

async def prepare_transfer(
    ctx: RunContext[StateDeps[BankingState]],
    recipient_name: str,
    bank_name: str,
    account_number: str,
    amount: float,
    reference: str | None = None
) -> StateSnapshotEvent:
    """
    Prepare a bank transfer to a person.
    This sets the pending transaction in the state for user confirmation.
    Use this for person-to-person fund transfers.
    """
    logger.info(f"💸  Executing Tool: prepare_transfer")
    logger.info(f"   ├─ Recipient: {recipient_name}")
    logger.info(f"   └─ Amount: RM {amount:,.2f}")

    details = TransferDetails(
        recipient_name=recipient_name,
        bank_name=bank_name,
        account_number=account_number,
        amount=amount,
        reference=reference
    )
    
    success, message = TransferService.prepare_transfer(ctx.deps.state, details)
    
    if not success:
        logger.error(f"❌  Transfer Preparation Failed")
        logger.error(f"   └─ Reason: {message}")
    
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


async def prepare_bill_payment(
    ctx: RunContext[StateDeps[BankingState]],
    biller_name: str,
    account_number: str,
    amount: float,
    due_date: str | None = None,
    reference_number: str | None = None
) -> StateSnapshotEvent:
    """
    Prepare a bill payment to a biller (e.g., TNB, Syabas, TM, Astro).
    This sets the pending bill in the state for user confirmation.
    Use this after analyzing a bill image with analyze_bill_image tool.
    """
    logger.info(f"🧾  Executing Tool: prepare_bill_payment")
    logger.info(f"   ├─ Biller: {biller_name}")
    logger.info(f"   ├─ Account: {account_number}")
    logger.info(f"   ├─ Amount: RM {amount:,.2f}")
    logger.info(f"   └─ Due Date: {due_date or 'Not specified'}")

    bill_details = BillDetails(
        biller_name=biller_name,
        account_number=account_number,
        amount=amount,
        due_date=due_date,
        reference_number=reference_number
    )
    
    # Set pending bill in state
    ctx.deps.state.pending_bill = bill_details
    ctx.deps.state.status = "confirming_bill"
    
    logger.info(f"✅  Bill payment prepared for confirmation")
    
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


async def confirm_bill_payment(ctx: RunContext[StateDeps[BankingState]]) -> StateSnapshotEvent:
    """
    Execute the pending bill payment after user confirmation.
    """
    logger.info(f"✅  Executing Tool: confirm_bill_payment")
    
    if not ctx.deps.state.pending_bill:
        logger.error(f"❌  No pending bill to confirm")
        return StateSnapshotEvent(
            type=EventType.STATE_SNAPSHOT,
            snapshot=ctx.deps.state,
        )
    
    bill = ctx.deps.state.pending_bill
    
    # Check balance
    if ctx.deps.state.balance < bill.amount:
        logger.error(f"❌  Insufficient balance")
        ctx.deps.state.status = "error"
        return StateSnapshotEvent(
            type=EventType.STATE_SNAPSHOT,
            snapshot=ctx.deps.state,
        )
    
    # Execute payment (mock)
    ctx.deps.state.balance -= bill.amount
    ctx.deps.state.transaction_history.append(
        f"Bill Payment: RM {bill.amount:.2f} to {bill.biller_name} (Account: {bill.account_number})"
    )
    ctx.deps.state.pending_bill = None
    ctx.deps.state.status = "completed"
    
    logger.info(f"✅  Bill payment completed successfully")
    logger.info(f"   └─ New Balance: RM {ctx.deps.state.balance:,.2f}")
    
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


async def cancel_payment(ctx: RunContext[StateDeps[BankingState]]) -> StateSnapshotEvent:
    """
    Cancel the pending transfer or bill payment.
    """
    logger.info(f"🛑  Executing Tool: cancel_payment")
    
    if ctx.deps.state.pending_transfer:
        TransferService.cancel_transfer(ctx.deps.state)
        logger.info(f"   └─ Transfer cancelled")
    
    if ctx.deps.state.pending_bill:
        ctx.deps.state.pending_bill = None
        ctx.deps.state.status = "idle"
        logger.info(f"   └─ Bill payment cancelled")
    
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


async def cancel_transfer(ctx: RunContext[StateDeps[BankingState]]) -> StateSnapshotEvent:
    """
    Cancel the pending transfer.
    """
    logger.info(f"🛑  Executing Tool: cancel_transfer")
    TransferService.cancel_transfer(ctx.deps.state)
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


async def confirm_transfer(ctx: RunContext[StateDeps[BankingState]]) -> StateSnapshotEvent:
    """
    Execute the pending transfer after user confirmation.
    """
    logger.info(f"✅  Executing Tool: confirm_transfer")
    success, message = TransferService.execute_transfer(ctx.deps.state)
    
    if not success:
        logger.error(f"❌  Transfer Confirmation Failed")
        logger.error(f"   └─ Reason: {message}")

    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=ctx.deps.state,
    )


def get_balance(ctx: RunContext[StateDeps[BankingState]]) -> float:
    """Get the current account balance."""
    return ctx.deps.state.balance
