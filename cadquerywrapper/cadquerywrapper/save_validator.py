from __future__ import annotations

from pathlib import Path
from typing import Any

from .logger import get_logger

logger = get_logger(__name__)

import trimesh

import cadquery as cq

from .validator import (
    ValidationError,
    Validator,
    assembly_has_intersections,
    is_manifold,
    shape_has_open_edges,
    validate,
)


class SaveValidator:
    """Wrapper around CadQuery save functions that performs validation."""

    def __init__(
        self, rules: dict | str | Path | Validator, obj: Any | None = None
    ) -> None:
        if isinstance(rules, Validator):
            logger.debug("Initializing SaveValidator with Validator instance")
            self.validator = rules
        else:
            logger.debug("Initializing SaveValidator with rules: %s", rules)
            self.validator = Validator(rules)

        if obj is not None:
            logger.debug("Attaching empty model to object %s", obj)
            self.attach_model(obj, {})

    @staticmethod
    def attach_model(workplane: Any, model: dict) -> None:
        """Attach printability model data to a CadQuery object."""
        logger.debug("Attaching model %s to object %s", model, workplane)
        setattr(workplane, "_printability_model", model)

    def _validate_obj(self, obj: Any) -> None:
        logger.debug("Validating object %s", obj)
        model = getattr(obj, "_printability_model", None)
        if model is None:
            logger.debug("No model attached; skipping validation")
            return

        combined_model = dict(model)
        max_size = self.validator.rules.get("rules", {}).get("max_model_size_mm")
        if max_size is not None:
            try:
                bbox_obj = obj.val().BoundingBox()
            except Exception:  # pragma: no cover - val() may not exist
                bbox_obj = None
                if hasattr(obj, "BoundingBox"):
                    try:
                        bbox_obj = obj.BoundingBox()
                    except Exception:  # pragma: no cover - bounding box failure
                        bbox_obj = None
            if bbox_obj is not None:
                combined_model["max_model_size_mm"] = {
                    "X": bbox_obj.xlen,
                    "Y": bbox_obj.ylen,
                    "Z": bbox_obj.zlen,
                }

        errors = validate(combined_model, self.validator.rules)
        if errors:
            logger.debug("Validation errors: %s", errors)
            raise ValidationError("; ".join(errors))

        rules = self.validator.rules.get("rules", {})
        if rules.get("manifold_geometry_required"):
            if not is_manifold(obj):
                logger.debug("Non-manifold geometry detected")
                raise ValidationError("Non-manifold geometry detected")

        if rules.get("no_open_edges"):
            if shape_has_open_edges(obj):
                logger.debug("Object contains open edges")
                raise ValidationError("Object contains open edges")

        if rules.get("no_intersecting_geometry"):
            if assembly_has_intersections(obj):
                logger.debug("Intersecting geometry detected")
                raise ValidationError("Intersecting geometry detected")

        min_clear = rules.get("minimum_clearance_between_parts_mm")
        if min_clear is not None and hasattr(obj, "solids"):
            from .validator import assembly_minimum_clearance

            clearance = assembly_minimum_clearance(obj)
            if clearance is not None and clearance < min_clear:
                logger.debug("Clearance %s below minimum %s", clearance, min_clear)
                raise ValidationError(
                    f"Clearance {clearance} below minimum {min_clear}"
                )

        max_overhang = rules.get("overhang_max_angle_deg")
        if max_overhang is not None:
            from .validator import shape_max_overhang_angle

            angle = shape_max_overhang_angle(obj)
            if angle is not None and angle > max_overhang:
                logger.debug(
                    "Overhang angle %s exceeds maximum %s", angle, max_overhang
                )
                raise ValidationError(
                    f"Overhang angle {angle} exceeds maximum {max_overhang}"
                )

    def _check_triangle_count(self, file_name: str | Path) -> None:
        """Validate mesh triangle count against configured limit."""

        limit = self.validator.rules.get("rules", {}).get("maximum_file_triangle_count")
        if limit is None:
            return

        mesh = trimesh.load_mesh(file_name)
        tri_count = int(len(mesh.faces))
        logger.debug("Triangle count for %s: %s", file_name, tri_count)
        if tri_count > limit:
            logger.debug("Triangle count %s exceeds maximum %s", tri_count, limit)
            raise ValidationError(f"Triangle count {tri_count} exceeds maximum {limit}")

    def _validate_file_format(self, file_name: str | Path | None) -> None:
        """Ensure ``file_name`` uses an allowed extension."""

        if file_name is None:
            return
        rules = self.validator.rules.get("rules", {})
        preferred = rules.get("preferred_file_format")
        alternates = rules.get("alternate_file_formats", []) or []
        allowed = []
        if preferred:
            allowed.append(str(preferred).lower().lstrip("."))
        for alt in alternates:
            if alt:
                allowed.append(str(alt).lower().lstrip("."))
        if not allowed:
            return
        ext = Path(file_name).suffix.lower().lstrip(".")
        if ext and ext not in allowed:
            logger.debug("File format %s not allowed; allowed: %s", ext, allowed)
            raise ValidationError(f"File format {ext.upper()} is not supported")

    def export(self, obj: Any, *args: Any, **kwargs: Any) -> Any:
        """Validate ``obj`` and delegate to :func:`cadquery.exporters.export`."""
        logger.debug("export called with %s", obj)
        self._validate_obj(obj)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", kwargs.get("fname", file_name))
        self._validate_file_format(file_name)
        logger.debug("Saving with exporters.export to %s", file_name)
        return cq.exporters.export(obj, *args, **kwargs)

    def cq_export(self, obj: Any, *args: Any, **kwargs: Any) -> Any:
        """Validate ``obj`` and delegate to :func:`cadquery.export`."""
        logger.debug("cq_export called with %s", obj)
        self._validate_obj(obj)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", kwargs.get("fname", file_name))
        self._validate_file_format(file_name)
        logger.debug("Saving with cq.export to %s", file_name)
        return cq.export(obj, *args, **kwargs)  # type: ignore[attr-defined]

    def export_stl(self, shape: cq.Shape, *args: Any, **kwargs: Any) -> None:
        """Validate ``shape`` and call ``exportStl``."""
        logger.debug("export_stl called with %s", shape)
        self._validate_obj(shape)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        shape.exportStl(*args, **kwargs)
        if file_name is not None:
            try:
                self._check_triangle_count(file_name)
            except ValidationError:
                Path(file_name).unlink(missing_ok=True)
                raise

    def export_step(self, shape: cq.Shape, *args: Any, **kwargs: Any) -> None:
        """Validate ``shape`` and call ``exportStep``."""
        logger.debug("export_step called with %s", shape)
        self._validate_obj(shape)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        shape.exportStep(*args, **kwargs)

    def export_bin(self, shape: cq.Shape, *args: Any, **kwargs: Any) -> None:
        """Validate ``shape`` and call ``exportBin``."""
        logger.debug("export_bin called with %s", shape)
        self._validate_obj(shape)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        shape.exportBin(*args, **kwargs)

    def export_brep(self, shape: cq.Shape, *args: Any, **kwargs: Any) -> None:
        """Validate ``shape`` and call ``exportBrep``."""
        logger.debug("export_brep called with %s", shape)
        self._validate_obj(shape)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        shape.exportBrep(*args, **kwargs)

    def assembly_export(self, assembly: cq.Assembly, *args: Any, **kwargs: Any) -> None:
        """Validate ``assembly`` and call ``Assembly.export``."""
        logger.debug("assembly_export called with %s", assembly)
        self._validate_obj(assembly)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        assembly.export(*args, **kwargs)

    def assembly_save(self, assembly: cq.Assembly, *args: Any, **kwargs: Any) -> None:
        """Validate ``assembly`` and call ``Assembly.save``."""
        logger.debug("assembly_save called with %s", assembly)
        self._validate_obj(assembly)
        file_name = args[0] if args else None
        file_name = kwargs.get("fileName", file_name)
        self._validate_file_format(file_name)
        assembly.save(*args, **kwargs)


__all__ = ["SaveValidator"]
