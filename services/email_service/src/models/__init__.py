"""Database models package"""
from .account import EmailAccount
from .credential import CredentialManager, hash_password, verify_password

# Import Phase 7 models from parent module
try:
    import sys
    from pathlib import Path
    parent_dir = Path(__file__).parent.parent
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))

    from models import EmailFolder, EmailMessage, EmailAttachment
except (ImportError, ModuleNotFoundError):
    # models.py might not be imported yet, models will be available at runtime
    EmailFolder = None
    EmailMessage = None
    EmailAttachment = None

__all__ = [
    'EmailAccount',
    'CredentialManager',
    'hash_password',
    'verify_password',
    'EmailFolder',
    'EmailMessage',
    'EmailAttachment',
]
