import sys
import logging
import json
from config.settings import settings

class JomKiraFormatter(logging.Formatter):
    """Custom formatter with colored output and structured format."""
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'RESET': '\033[0m'      # Reset
    }
    
    def format(self, record):
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        record.levelname = f"{color}[{record.levelname}]{reset}"
        return super().format(record)

class JsonFormatter(logging.Formatter):
    """JSON log formatter for production."""
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    """Configure structured logging based on settings."""
    handler = logging.StreamHandler(sys.stdout)
    
    if settings.LOG_FORMAT == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(JomKiraFormatter(
            fmt='%(levelname)s %(name)s:%(funcName)s - %(message)s'
        ))
    
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)
    root_logger.handlers = [handler]
    
    # Suppress noisy loggers
    for logger_name in ["httpx", "openai", "httpcore", "pydantic"]:
        logging.getLogger(logger_name).setLevel(logging.WARNING)

    return logging.getLogger("jom_kira")
