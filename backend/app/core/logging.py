import logging
import re
from typing import Any

_SECRET_PATTERNS = (
    re.compile(r"(postgres(?:ql)?(?:\+\w+)?://[^:]+:)([^@]+)(@)", re.IGNORECASE),
    re.compile(r"(GROQ_API_KEY\s*[=:]\s*)(\S+)", re.IGNORECASE),
    re.compile(r"(api[_-]?key\s*[=:]\s*)(\S+)", re.IGNORECASE),
)


def _redact(value: str) -> str:
    redacted = value
    for pattern in _SECRET_PATTERNS:
        redacted = pattern.sub(r"\1***\3" if pattern.groups == 3 else r"\1***", redacted)
    return redacted


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = _redact(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    key: _redact(val) if isinstance(val, str) else val
                    for key, val in record.args.items()
                }
            else:
                record.args = tuple(
                    _redact(arg) if isinstance(arg, str) else arg for arg in record.args
                )
        return True


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"),
    )
    handler.addFilter(RedactingFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def safe_log_extra(**kwargs: Any) -> dict[str, Any]:
    """Drop known secret keys before attaching extras to a log record."""
    blocked = {"groq_api_key", "database_url", "password", "secret"}
    return {key: value for key, value in kwargs.items() if key.lower() not in blocked}
