"""
Credential encryption/decryption using SHA-512
Implements secure password storage for email accounts
"""
import hashlib
import os
from typing import Tuple
import secrets


def generate_salt(length: int = 32) -> bytes:
    """
    Generate cryptographically secure salt

    Args:
        length: Salt length in bytes (default 32)

    Returns:
        Random salt bytes
    """
    return secrets.token_bytes(length)


def hash_password(password: str, salt: bytes = None) -> Tuple[str, str]:
    """
    Hash password using SHA-512 with salt

    Args:
        password: Plain text password
        salt: Optional salt bytes (generates new if not provided)

    Returns:
        Tuple of (hashed_password, salt_hex) for storage
    """
    if not password:
        raise ValueError('Password cannot be empty')

    if salt is None:
        salt = generate_salt()

    # SHA-512 hash of password + salt
    hash_obj = hashlib.sha512(password.encode('utf-8') + salt)
    hashed = hash_obj.hexdigest()

    # Return hashed password and salt as hex strings
    return hashed, salt.hex()


def verify_password(password: str, hashed_password: str, salt_hex: str) -> bool:
    """
    Verify password against stored hash

    Args:
        password: Plain text password to verify
        hashed_password: Stored hashed password (hex string)
        salt_hex: Stored salt (hex string)

    Returns:
        True if password matches, False otherwise
    """
    try:
        # Reconstruct salt from hex
        salt = bytes.fromhex(salt_hex)

        # Hash the provided password with the same salt
        computed_hash, _ = hash_password(password, salt)

        # Use constant-time comparison to prevent timing attacks
        return secrets.compare_digest(computed_hash, hashed_password)
    except Exception as e:
        return False


def encrypt_credential(email_address: str, password: str) -> dict:
    """
    Encrypt email credential

    Args:
        email_address: Email address
        password: Email account password

    Returns:
        Dict with encrypted credential data:
        {
            'emailAddress': 'user@example.com',
            'passwordHash': 'sha512_hash_hex',
            'passwordSalt': 'salt_hex',
            'algorithm': 'sha512'
        }
    """
    password_hash, salt = hash_password(password)

    return {
        'emailAddress': email_address,
        'passwordHash': password_hash,
        'passwordSalt': salt,
        'algorithm': 'sha512'
    }


def decrypt_credential(credential_data: dict, password: str) -> bool:
    """
    Verify credential by checking password

    Args:
        credential_data: Dict with passwordHash, passwordSalt, algorithm
        password: Password to verify

    Returns:
        True if password is correct, False otherwise
    """
    if credential_data.get('algorithm') != 'sha512':
        raise ValueError('Unsupported credential algorithm')

    return verify_password(
        password,
        credential_data.get('passwordHash', ''),
        credential_data.get('passwordSalt', '')
    )


class CredentialManager:
    """
    Manages credential encryption/decryption operations
    """

    @staticmethod
    def create(email_address: str, password: str) -> dict:
        """Create encrypted credential"""
        return encrypt_credential(email_address, password)

    @staticmethod
    def verify(credential_data: dict, password: str) -> bool:
        """Verify password against credential"""
        return decrypt_credential(credential_data, password)

    @staticmethod
    def hash_only(password: str) -> Tuple[str, str]:
        """Hash password and return hash + salt"""
        return hash_password(password)

    @staticmethod
    def verify_only(password: str, hashed: str, salt: str) -> bool:
        """Verify password only (no credential object needed)"""
        return verify_password(password, hashed, salt)
