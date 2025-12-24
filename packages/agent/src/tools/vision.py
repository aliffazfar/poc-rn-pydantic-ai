import logging
import base64
import json
from pydantic_ai import Agent, RunContext, BinaryContent
from pydantic_ai.ag_ui import StateDeps
from pydantic import BaseModel
from models.banking import BankingState
from core.context import current_image_ctx
from core.model_factory import get_model

logger = logging.getLogger("jom_kira.tools.vision")


class BillDetails(BaseModel):
    """Extracted bill details from an image."""
    biller_name: str | None = None
    account_number: str | None = None
    amount: float | None = None
    due_date: str | None = None
    reference_number: str | None = None
    is_valid_bill: bool = False
    error_message: str | None = None


# System prompt for bill analysis
BILL_ANALYSIS_PROMPT = """You are a bill image analyzer for a Malaysian banking app.
Your task is to extract payment details from bill images.

When analyzing a bill image:
1. Identify the biller (e.g., TNB, Syabas, TM, Astro, etc.)
2. Extract the account number
3. Extract the amount due
4. Extract the due date if visible
5. Extract any reference number

If the image is not a bill or is unreadable, respond with a JSON object containing:
- is_valid_bill: false
- error_message: explanation of why the image couldn't be analyzed

If you successfully extract bill details, respond with a JSON object containing:
- biller_name: string
- account_number: string
- amount: number
- due_date: string or null
- reference_number: string or null
- is_valid_bill: true

IMPORTANT: Respond ONLY with a valid JSON object, no other text.
"""


async def analyze_bill_image(
    ctx: RunContext[StateDeps[BankingState]],
    image_base64: str | None = None,
    image_format: str | None = None,
    image_description: str | None = None
) -> str:
    """
    Analyze a bill image to extract payment details using the configured vision-capable LLM.
    
    Args:
        image_base64: Base64-encoded image data (if available)
        image_format: Image format (jpeg, png, webp, gif)
        image_description: Text description of the image (fallback)
    
    Returns:
        Extracted bill information or error message
    """
    logger.info(f"📄  Executing Tool: analyze_bill_image")
    
    # Check ContextVar if explicit arg is missing
    if not image_base64:
        ctx_img = current_image_ctx.get()
        if ctx_img:
            image_base64 = ctx_img.get("bytes")
            image_format = ctx_img.get("format")
            logger.info(f"   └─ Recovered image from context: format={image_format}")

    if image_base64:
        logger.info(f"   └─ Received image: format={image_format}, bytes_length={len(image_base64)}")
        
        try:
            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_base64)
            
            # Map format to MIME type
            mime_type_map = {
                "jpeg": "image/jpeg",
                "jpg": "image/jpeg",
                "png": "image/png",
                "webp": "image/webp",
                "gif": "image/gif",
            }
            media_type = mime_type_map.get(image_format or "jpeg", "image/jpeg")
            
            # Create a simple vision agent for this request
            # Using Agent.run() with multimodal content (text + BinaryContent)
            vision_agent = Agent(
                model=get_model(),
                instructions=BILL_ANALYSIS_PROMPT,
            )
            
            # Run the agent with multimodal input
            result = await vision_agent.run([
                "Please analyze this bill image and extract the payment details.",
                BinaryContent(data=image_bytes, media_type=media_type),
            ])
            
            # Get the response text
            response_text = result.output
            
            logger.info(f"   └─ Vision response: {response_text[:200]}...")
            
            # Try to parse JSON response
            try:
                # Clean up response (remove markdown code blocks if present)
                clean_response = response_text.strip()
                if clean_response.startswith("```"):
                    clean_response = clean_response.split("```")[1]
                    if clean_response.startswith("json"):
                        clean_response = clean_response[4:]
                    clean_response = clean_response.strip()
                
                bill_data = json.loads(clean_response)
                bill = BillDetails(**bill_data)
            except (json.JSONDecodeError, Exception) as parse_error:
                logger.warning(f"   └─ Failed to parse JSON response: {parse_error}")
                # Return raw response if JSON parsing fails
                return f"I analyzed the image. Here's what I found:\n\n{response_text}"
            
            logger.info(f"   └─ Vision analysis complete: is_valid_bill={bill.is_valid_bill}")
            
            if bill.is_valid_bill:
                # Log the extracted details
                logger.info(f"   └─ Extracted bill details:")
                logger.info(f"      ├─ Biller: {bill.biller_name}")
                logger.info(f"      ├─ Amount: RM {bill.amount:.2f}" if bill.amount else "      ├─ Amount: None")
                logger.info(f"      ├─ Account: {bill.account_number}")
                logger.info(f"      ├─ Due Date: {bill.due_date}")
                logger.info(f"      └─ Reference: {bill.reference_number}")
                
                # Return raw JSON to the agent so it can chain the next tool call
                # as instructed in the system prompt (auto-call prepare_bill_payment).
                logger.info(f"   └─ Returning JSON for agent to chain prepare_bill_payment")
                return json.dumps(bill.model_dump())
            else:
                return f"I couldn't extract bill details from this image. {bill.error_message or 'Please upload a clearer image of your bill.'}"
                
        except Exception as e:
            logger.error(f"   └─ Vision analysis failed: {e}", exc_info=True)
            return f"I encountered an error while analyzing the image: {str(e)}. Please try uploading a different image."
    
    if image_description:
        logger.info(f"   └─ Description: {image_description[:50]}...")
        desc_lower = image_description.lower()
        
        # Fallback to description-based detection
        if "tnb" in desc_lower or "tenaga" in desc_lower:
            return "I've detected a TNB bill from your description. Please upload the actual bill image for accurate extraction."
        elif "syabas" in desc_lower or "water" in desc_lower:
            return "I've detected a water bill from your description. Please upload the actual bill image for accurate extraction."
    
    return "I couldn't find any image to analyze. Please upload a clear image of your bill."
