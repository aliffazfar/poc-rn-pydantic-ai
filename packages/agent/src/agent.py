import logfire
import logging
from pydantic_ai import Agent, RunContext
from pydantic_ai.ag_ui import StateDeps

# Local Imports
from config.settings import settings
from models.banking import BankingState
from core.model_factory import get_model
from core.prompts import get_system_prompt
from tools.banking import (
    prepare_transfer,
    prepare_bill_payment,
    cancel_transfer,
    cancel_payment,
    confirm_transfer,
    confirm_bill_payment,
    get_balance,
)
from tools.vision import analyze_bill_image

# Setup Logger for this module
logger = logging.getLogger("jom_kira.agent")

# Configure logfire
logfire.configure(send_to_logfire='if-token-present')

def create_agent() -> Agent:
    """
    Creates and configures the Agent instance.
    Called after logging is setup to ensure all logs are captured.
    """
    system_prompt = get_system_prompt()
    logger.info(f"🚀  Starting {settings.APP_NAME} Agent...")
    logger.info(f"   └─ System Prompt: {len(system_prompt)} chars loaded")

    # Initialize Agent using the modular factory
    agent_instance = Agent(
        model=get_model(),
        deps_type=StateDeps[BankingState],
        instructions=system_prompt
    )

    @agent_instance.system_prompt
    def add_context(ctx: RunContext[StateDeps[BankingState]]) -> str:
        """Add runtime context to system prompt."""
        from core.prompts import get_dynamic_context
        return get_dynamic_context(ctx)

    # Register Tools - Transfers
    agent_instance.tool(prepare_transfer)
    agent_instance.tool(cancel_transfer)
    agent_instance.tool(confirm_transfer)
    
    # Register Tools - Bill Payments
    agent_instance.tool(prepare_bill_payment)
    agent_instance.tool(confirm_bill_payment)
    agent_instance.tool(cancel_payment)
    
    # Register Tools - Utility
    agent_instance.tool(get_balance)
    agent_instance.tool(analyze_bill_image)
    
    return agent_instance
