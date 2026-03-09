from __future__ import annotations

from pathlib import Path
from typing import Any

from .logger import get_logger

logger = get_logger(__name__)

import cadquery as cq

from .save_validator import SaveValidator
from .validator import ValidationError, Validator


class CadQueryWrapper:
    """Main interface combining :class:`Validator` and :class:`SaveValidator`."""

    def __init__(self, rules: dict | str | Path, workplane: Any):
        logger.debug("Initializing CadQueryWrapper with rules %s", rules)
        self.validator = Validator(rules)
        self.saver = SaveValidator(self.validator)
        self.workplane = workplane
        self.attach_model(self.workplane, {})

    @staticmethod
    def attach_model(workplane: Any, model: dict) -> None:
        """Attach printability model data to ``workplane``."""
        logger.debug("Attaching model %s to object %s", model, workplane)
        SaveValidator.attach_model(workplane, model)

    def validate(self) -> None:
        """Validate the attached model using :class:`SaveValidator`."""
        logger.debug("Validating object %s", self.workplane)
        self.saver._validate_obj(self.workplane)

    def export(self, obj: Any | None = None, *args: Any, **kwargs: Any) -> Any:
        """Delegate to :meth:`SaveValidator.export`."""
        obj = obj or self.workplane
        logger.debug("Exporting %s", obj)
        return self.saver.export(obj, *args, **kwargs)

    def cq_export(self, obj: Any | None = None, *args: Any, **kwargs: Any) -> Any:
        """Delegate to :meth:`SaveValidator.cq_export`."""
        obj = obj or self.workplane
        logger.debug("cq_export %s", obj)
        return self.saver.cq_export(obj, *args, **kwargs)

    def export_stl(
        self, shape: cq.Shape | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.export_stl`."""
        shape = shape or self.workplane
        logger.debug("export_stl %s", shape)
        self.saver.export_stl(shape, *args, **kwargs)

    def export_step(
        self, shape: cq.Shape | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.export_step`."""
        shape = shape or self.workplane
        logger.debug("export_step %s", shape)
        self.saver.export_step(shape, *args, **kwargs)

    def export_bin(
        self, shape: cq.Shape | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.export_bin`."""
        shape = shape or self.workplane
        logger.debug("export_bin %s", shape)
        self.saver.export_bin(shape, *args, **kwargs)

    def export_brep(
        self, shape: cq.Shape | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.export_brep`."""
        shape = shape or self.workplane
        logger.debug("export_brep %s", shape)
        self.saver.export_brep(shape, *args, **kwargs)

    def assembly_export(
        self, assembly: cq.Assembly | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.assembly_export`."""

        assembly = assembly or self.workplane
        logger.debug("assembly_export %s", assembly)
        self.saver.assembly_export(assembly, *args, **kwargs)

    def assembly_save(
        self, assembly: cq.Assembly | None = None, *args: Any, **kwargs: Any
    ) -> None:
        """Delegate to :meth:`SaveValidator.assembly_save`."""

        assembly = assembly or self.workplane
        logger.debug("assembly_save %s", assembly)
        self.saver.assembly_save(assembly, *args, **kwargs)


__all__ = ["CadQueryWrapper"]
