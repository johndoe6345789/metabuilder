"""Helpers for normalizing workflow values."""


class ValueHelpers:
    """Normalize values for workflow helpers."""
    @staticmethod
    def ensure_list(value):
        """Return a list for any incoming value."""
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, (tuple, set)):
            return list(value)
        if isinstance(value, str):
            return [line for line in value.splitlines() if line.strip()]
        return [value]

    @staticmethod
    def coerce_bool(value) -> bool:
        """Coerce values into booleans."""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in ("true", "yes", "1"):
                return True
            if lowered in ("false", "no", "0", ""):
                return False
        return bool(value)

    @staticmethod
    def normalize_separator(text):
        """Normalize escaped separators."""
        if text is None:
            return ""
        if isinstance(text, str):
            return text.replace("\\n", "\n").replace("\\t", "\t")
        return str(text)
