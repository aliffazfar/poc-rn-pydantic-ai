import uuid

def generate_event_id() -> str:
    """Generate a unique event ID for AG-UI messages."""
    return str(uuid.uuid4())

def generate_run_id() -> str:
    """Generate a unique run ID for AG-UI runs."""
    return str(uuid.uuid4())

def extract_text_from_json(obj) -> list[str]:
    """
    Deep search for any text-like fields in a JSON-compatible object.
    """
    texts = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            # Check common message keys
            if k in ["message", "content", "query", "text"] and isinstance(v, str):
                texts.append(v)
            else:
                texts.extend(extract_text_from_json(v))
    elif isinstance(obj, list):
        for item in obj:
            texts.extend(extract_text_from_json(item))
    return texts

def extract_last_user_message(body: dict) -> list[str]:
    """
    Specifically extracts only the content of the last user message
    from a CopilotKit AG-UI request body.
    This prevents guardrails from re-triggering on history.
    """
    messages = body.get("messages", [])
    if not messages:
        # Fallback to general extraction if no messages array
        return extract_text_from_json(body)
        
    # Find the last message with role 'user'
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content")
            if isinstance(content, str):
                return [content]
            elif isinstance(content, list):
                # Handle multi-modal content if necessary
                return [item.get("text", "") for item in content if isinstance(item, dict) and "text" in item]
            break
            
    return []

def extract_last_user_image(body: dict) -> dict | None:
    """
    Extract image data from the last user message if present.
    Returns dict with 'format' and 'bytes' keys, or None if no image.
    """
    messages = body.get("messages", [])
    if not messages:
        return None
    
    # Find the last user message with image
    for msg in reversed(messages):
        role = msg.get("role")
        if role not in ["user", "User"]:
            continue

        # 1. Check custom _image field (from our Next.js route workaround)
        if msg.get("_image"):
            img = msg["_image"]
            return {
                "format": img.get("format"),
                "bytes": img.get("bytes")
            }

        # 2. Check GraphQL input format
        if "imageMessage" in msg:
            img = msg["imageMessage"]
            return {
                "format": img.get("format"),
                "bytes": img.get("bytes")
            }
        
        # 3. Check AGUI format (legacy/custom)
        if msg.get("image"):
            return msg["image"]
            
        # 4. Check content array format (CopilotKit V2 / OpenAI-style)
        content = msg.get("content")
        if isinstance(content, list):
            for item in content:
                if not isinstance(item, dict):
                    continue
                
                # Check for standard image block or image_url (OpenAI style)
                if item.get("type") in ["image", "image_url"] or "image" in item:
                    # Use inner 'image', 'image_url', or item itself
                    img_data = item.get("image") or item.get("image_url") or item
                    
                    # Direct bytes
                    if isinstance(img_data, dict) and "bytes" in img_data:
                         return {
                            "format": img_data.get("format", "jpeg"),
                            "bytes": img_data.get("bytes")
                        }
                    
                    # Source/URL with base64
                    source = None
                    if isinstance(img_data, dict):
                        source = img_data.get("source") or img_data.get("url")
                    elif isinstance(img_data, str):
                        source = img_data # if image_url was just a string
                        
                    if source and isinstance(source, str) and "base64," in source:
                        try:
                            # text/plain;base64,..... or data:image/png;base64,....
                            header, b64 = source.split(";base64,")
                            fmt = "jpeg" # default
                            if "image/" in header:
                                fmt = header.split("image/")[1].split(";")[0]
                            return {"format": fmt, "bytes": b64}
                        except:
                            pass
    
    return None
