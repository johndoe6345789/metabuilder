"""Printability rules validation helpers."""

import json
import logging
from pathlib import Path

from .logger import get_logger

logger = get_logger(__name__)


class ValidationError(Exception):
    """Raised when an object fails printability validation."""

    pass


def load_rules(rules_path: str | Path) -> dict:
    path = Path(rules_path)
    logger.debug("Loading rules from %s", path)
    with path.open() as f:
        data = json.load(f)
    logger.debug("Loaded rules: %s", data.keys())
    return data


def validate(model: dict, rules: dict) -> list[str]:
    """Validate model parameters against printability rules.

    Parameters
    ----------
    model: dict
        A dictionary containing model parameters to validate. Keys should
        correspond to the rules names in the JSON file.
    rules: dict
        Dictionary loaded from a rules JSON file.

    Returns
    -------
    list[str]
        List of human readable error messages. Empty if model is valid.
    """
    logger.debug("Validating model: %s", model)
    errors = []
    rule_values = rules.get("rules", {})

    for key, value in rule_values.items():
        model_value = model.get(key)
        if model_value is None:
            continue
        if isinstance(value, dict):
            if isinstance(model_value, dict) and key == "max_model_size_mm":
                for axis, limit in value.items():
                    axis_value = model_value.get(axis)
                    if axis_value is None:
                        continue
                    if axis_value > limit:
                        msg = f"Model size {axis} {axis_value} exceeds maximum {limit}"
                        errors.append(msg)
                        logger.debug(msg)
            continue
        if model_value < value:
            msg = (
                f"{key.replace('_', ' ').capitalize()} {model_value} "
                f"is below minimum {value}"
            )
            errors.append(msg)
            logger.debug(msg)
    logger.debug("Validation errors: %s", errors)
    return errors


class Validator:
    """Object oriented wrapper around :func:`validate`.

    The ``validate`` method will raise :class:`ValidationError` if the provided
    model data does not satisfy the stored rules.
    """

    def __init__(self, rules: dict | str | Path):
        if isinstance(rules, (str, Path)):
            logger.debug("Initializing Validator with rules file %s", rules)
            self.rules = load_rules(rules)
        else:
            logger.debug("Initializing Validator with rules dict")
            self.rules = rules

    @classmethod
    def from_file(cls, path: str | Path) -> "Validator":
        """Create a :class:`Validator` from a rules JSON file."""
        logger.debug("Creating Validator from file %s", path)
        return cls(load_rules(path))

    def validate(self, model: dict) -> None:
        """Validate ``model`` against the stored ``rules``.

        Raises
        ------
        ValidationError
            If any of the model values are below the configured limits.
        """

        errors = validate(model, self.rules)
        if errors:
            logger.debug("Validation failed with errors: %s", errors)
            raise ValidationError("; ".join(errors))
        logger.debug("Model valid")


__all__ = ["ValidationError", "load_rules", "validate", "Validator"]


def is_manifold(shape: object) -> bool:
    """Return ``True`` if ``shape`` appears to be manifold."""
    logger.debug("Checking if shape is manifold")
    try:
        if hasattr(shape, "isValid") and not shape.isValid():
            logger.debug("Shape invalid")
            return False
    except Exception:
        logger.debug("isValid check failed")
        return False
    try:
        if hasattr(shape, "isClosed") and not shape.isClosed():
            logger.debug("Shape not closed")
            return False
    except Exception:
        logger.debug("isClosed check failed")
        return False
    logger.debug("Shape is manifold")
    return True


def shape_has_open_edges(shape: object) -> bool:
    """Return ``True`` if ``shape`` seems to have open edges."""
    logger.debug("Checking for open edges")
    if hasattr(shape, "hasOpenEdges"):
        try:
            result = bool(shape.hasOpenEdges())
            logger.debug("hasOpenEdges: %s", result)
            return result
        except Exception:
            logger.debug("hasOpenEdges check failed")
            return True
    if hasattr(shape, "open_edges"):
        result = bool(getattr(shape, "open_edges"))
        logger.debug("open_edges attribute: %s", result)
        return result
    logger.debug("No open edges detected")
    return False


def assembly_has_intersections(assembly: object) -> bool:
    """Return ``True`` if any solids in ``assembly`` intersect."""
    logger.debug("Checking assembly for intersections")
    solids = []
    if hasattr(assembly, "solids"):
        try:
            solids = list(assembly.solids())
        except Exception:
            solids = []
    if not solids and hasattr(assembly, "children"):
        solids = [c for c in assembly.children if hasattr(c, "intersect")]
    for i, shape1 in enumerate(solids):
        for shape2 in solids[i + 1 :]:
            try:
                result = shape1.intersect(shape2)
            except Exception:
                continue
            if result is None:
                continue
            is_null = False
            if hasattr(result, "isNull"):
                try:
                    is_null = result.isNull()
                except Exception:
                    is_null = False
            elif hasattr(result, "Volume"):
                try:
                    is_null = result.Volume() == 0
                except Exception:
                    is_null = False
            if not is_null:
                logger.debug("Intersection found between solids")
                return True
    logger.debug("No intersections found")
    return False


def assembly_minimum_clearance(assembly: object) -> float | None:
    """Return the minimum distance between solids in ``assembly``."""
    logger.debug("Computing minimum clearance in assembly")
    solids = []
    if hasattr(assembly, "solids"):
        try:
            solids = list(assembly.solids())
        except Exception:  # pragma: no cover - solids retrieval failure
            solids = []
    if not solids and hasattr(assembly, "children"):
        solids = [c for c in assembly.children if hasattr(c, "distTo")]

    min_dist: float | None = None
    for i, shape1 in enumerate(solids):
        for shape2 in solids[i + 1 :]:
            dists = []
            for shape_a, shape_b in ((shape1, shape2), (shape2, shape1)):
                method = (
                    getattr(shape_a, "distTo", None)
                    or getattr(shape_a, "distance", None)
                    or getattr(shape_a, "Distance", None)
                )
                if callable(method):
                    try:
                        d = float(method(shape_b))
                    except Exception:  # pragma: no cover - distance failure
                        continue
                    dists.append(d)
            if not dists:
                continue
            pair_dist = min(dists)
            if min_dist is None or pair_dist < min_dist:
                min_dist = pair_dist
    logger.debug("Minimum clearance: %s", min_dist)
    return min_dist


def shape_max_overhang_angle(
    shape: object, z_dir: tuple[float, float, float] = (0.0, 0.0, 1.0)
) -> float | None:
    """Return the maximum overhang angle of ``shape`` in degrees."""
    logger.debug("Calculating max overhang angle")
    faces = []
    for attr in ("faces", "Faces", "all_faces"):
        getter = getattr(shape, attr, None)
        if callable(getter):
            try:
                faces = list(getter())
            except Exception:  # pragma: no cover - faces failure
                faces = []
            if faces:
                break
        elif isinstance(getter, (list, tuple)):
            faces = list(getter)
            break
    if not faces:
        logger.debug("No faces found")
        return None

    import math

    z_len = math.sqrt(sum(c * c for c in z_dir)) or 1.0
    z_axis = tuple(c / z_len for c in z_dir)
    max_angle = 0.0

    for face in faces:
        normal = None
        if hasattr(face, "normalAt"):
            try:
                normal = face.normalAt()
            except Exception:  # pragma: no cover - normal failure
                normal = None
        if normal is None and hasattr(face, "normal"):
            normal = face.normal
        if normal is None:
            continue
        if hasattr(normal, "toTuple"):
            normal = normal.toTuple()
        if not isinstance(normal, (list, tuple)) or len(normal) != 3:
            continue
        n_len = math.sqrt(sum(c * c for c in normal)) or 1.0
        norm = tuple(c / n_len for c in normal)
        dot = abs(sum(a * b for a, b in zip(norm, z_axis)))
        dot = max(-1.0, min(1.0, dot))
        angle = math.degrees(math.acos(dot))
        if angle > max_angle:
            max_angle = angle

    logger.debug("Max overhang angle: %s", max_angle)
    return max_angle


__all__ += [
    "is_manifold",
    "shape_has_open_edges",
    "assembly_has_intersections",
    "assembly_minimum_clearance",
    "shape_max_overhang_angle",
]
