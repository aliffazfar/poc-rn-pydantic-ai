import logging
from openai import AsyncAzureOpenAI, AsyncOpenAI
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from config.settings import settings

logger = logging.getLogger("jom_kira.core.model_factory")

def get_model():
    """
    Creates and returns the configured LLM model with detailed startup logging.
    """
    provider = settings.LLM_PROVIDER.lower()
    model_name = settings.LLM_MODEL
    
    logger.info(f"🤖  Initializing LLM Model...")
    logger.info(f"   ├─ Provider: {provider}")
    logger.info(f"   └─ Model: {model_name}")

    if provider == "openai":
        if settings.OPENAI_BASE_URL:
            logger.info(f"   └─ Base URL: {settings.OPENAI_BASE_URL}")
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
            return OpenAIModel(model_name, provider=OpenAIProvider(openai_client=client))
        return OpenAIModel(model_name, provider=OpenAIProvider(api_key=settings.OPENAI_API_KEY))

    elif provider == "azure":
        logger.info(f"   └─ Endpoint: {settings.AZURE_OPENAI_ENDPOINT}")
        azure_client = AsyncAzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            api_key=settings.AZURE_OPENAI_API_KEY,
        )
        return OpenAIModel(
            settings.AZURE_DEPLOYMENT_NAME or model_name, 
            provider=OpenAIProvider(openai_client=azure_client)
        )
    
    # Default fallback (OpenAI compatible)
    logger.warning(f"⚠️ Provider '{provider}' not explicitly handled, falling back to OpenAI-compatible client")
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
    return OpenAIModel(model_name, provider=OpenAIProvider(openai_client=client))
