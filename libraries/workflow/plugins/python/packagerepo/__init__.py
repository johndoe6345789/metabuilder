"""Package repository workflow plugins.

Lazy-loading module to avoid import errors when optional dependencies are missing.
"""

__all__ = [
    "create_auth_verify_jwt",
    "create_auth_check_scopes",
    "create_parse_path",
    "create_normalize_entity",
    "create_validate_entity",
    "create_kv_get",
    "create_kv_put",
    "create_blob_put",
    "create_index_upsert",
    "create_respond_json",
    "create_respond_error",
]


def __getattr__(name):
    """Lazy-load plugin factories on demand."""
    if name == "create_auth_verify_jwt":
        from .auth_verify_jwt.factory import create
        return create
    elif name == "create_auth_check_scopes":
        from .auth_check_scopes.factory import create
        return create
    elif name == "create_parse_path":
        from .parse_path.factory import create
        return create
    elif name == "create_normalize_entity":
        from .normalize_entity.factory import create
        return create
    elif name == "create_validate_entity":
        from .validate_entity.factory import create
        return create
    elif name == "create_kv_get":
        from .kv_get.factory import create
        return create
    elif name == "create_kv_put":
        from .kv_put.factory import create
        return create
    elif name == "create_blob_put":
        from .blob_put.factory import create
        return create
    elif name == "create_index_upsert":
        from .index_upsert.factory import create
        return create
    elif name == "create_respond_json":
        from .respond_json.factory import create
        return create
    elif name == "create_respond_error":
        from .respond_error.factory import create
        return create
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
