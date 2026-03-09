import logging
from pathlib import Path

_LOG_PATH = Path("cadquerywrapper.log")

# Create logger for the package
logger = logging.getLogger("cadquerywrapper")
if not logger.handlers:
    handler = logging.FileHandler(_LOG_PATH)
    formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)


def get_logger(name: str | None = None) -> logging.Logger:
    """Return a logger writing to ``cadquerywrapper.log``."""
    return logger if name is None else logger.getChild(name)
