import importlib
import sys
import types
from pathlib import Path

import trimesh

import pytest
import math

# Provide stub cadquery module before importing package modules
_dummy_cq = types.ModuleType("cadquery")

_dummy_cq.export_calls = []


def _export(obj, *args, **kwargs):
    _dummy_cq.export_calls.append((obj, args, kwargs))


_dummy_cq.export = _export
_dummy_cq.exporters = types.SimpleNamespace()
_dummy_cq.exporters.calls = []


def _exporter(obj, *args, **kwargs):
    _dummy_cq.exporters.calls.append((obj, args, kwargs))


_dummy_cq.exporters.export = _exporter


class DummyShape:
    def __init__(self):
        self.called = []
        self.valid = True
        self.closed = True
        self._open_edges = False
        self.will_intersect = False

    def exportStl(self, *args, **kwargs):
        self.called.append(("exportStl", args, kwargs))

    def exportStep(self, *args, **kwargs):
        self.called.append(("exportStep", args, kwargs))

    def exportBin(self, *args, **kwargs):
        self.called.append(("exportBin", args, kwargs))

    def exportBrep(self, *args, **kwargs):
        self.called.append(("exportBrep", args, kwargs))

    def isValid(self):
        return self.valid

    def isClosed(self):
        return self.closed

    def hasOpenEdges(self):
        return self._open_edges

    class _IntersectResult:
        def __init__(self, has_volume: bool):
            self._has_volume = has_volume

        def isNull(self):
            return not self._has_volume

        def Volume(self):
            return 1 if self._has_volume else 0

    def intersect(self, other):
        has_vol = self.will_intersect and getattr(other, "will_intersect", False)
        return self._IntersectResult(has_vol)


class DummyAssembly:
    def __init__(self, solids=None):
        self.called = []
        self._solids = solids or []

    def export(self, *args, **kwargs):
        self.called.append(("export", args, kwargs))

    def save(self, *args, **kwargs):
        self.called.append(("save", args, kwargs))

    def solids(self):
        return self._solids


_dummy_cq.Shape = DummyShape
_dummy_cq.Assembly = DummyAssembly


class DummyBBoxShape(DummyShape):
    def __init__(self, x: float, y: float, z: float):
        super().__init__()
        self._bbox = types.SimpleNamespace(xlen=x, ylen=y, zlen=z)

    def val(self):
        return self

    def BoundingBox(self):
        return self._bbox


class SphereShape(DummyShape):
    def __init__(self, subdivisions: int):
        super().__init__()
        self.subdivisions = subdivisions

    def exportStl(self, file_name: str, *args, **kwargs):
        super().exportStl(file_name, *args, **kwargs)
        mesh = trimesh.creation.icosphere(subdivisions=self.subdivisions)
        mesh.export(file_name)


class NonManifoldShape(DummyShape):
    def __init__(self, valid: bool = True, closed: bool = True):
        super().__init__()
        self.valid = valid
        self.closed = closed


class OpenEdgeShape(DummyShape):
    def __init__(self):
        super().__init__()
        self._open_edges = True


class IntersectSolid(DummyShape):
    def __init__(self, will_intersect: bool = True):
        super().__init__()
        self.will_intersect = will_intersect


class ClearanceSolid(DummyShape):
    def __init__(self, distance: float):
        super().__init__()
        self.distance = distance

    def distTo(self, other):  # noqa: D401 - simple distance stub
        return self.distance


class _OverhangFace:
    def __init__(self, angle: float):
        self._angle = angle

    def normalAt(self):
        rad = math.radians(self._angle)
        return (math.sin(rad), 0.0, math.cos(rad))


class OverhangShape(DummyShape):
    def __init__(self, angles: list[float]):
        super().__init__()
        self._angles = angles

    def faces(self):  # noqa: D401 - returns dummy faces
        return [_OverhangFace(a) for a in self._angles]


sys.modules.setdefault("cadquery", _dummy_cq)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from cadquerywrapper.validator import Validator, load_rules, validate
from cadquerywrapper.save_validator import SaveValidator, ValidationError
from cadquerywrapper.project import CadQueryWrapper


RULES_PATH = Path("cadquerywrapper/rules/bambu_printability_rules.json")


def test_load_rules():
    rules = load_rules(RULES_PATH)
    assert rules["printer"] == "Bambu Labs"


def test_validate_errors():
    rules = {"rules": {"minimum_wall_thickness_mm": 0.8}}
    model = {"minimum_wall_thickness_mm": 0.5}
    errors = validate(model, rules)
    assert errors == ["Minimum wall thickness mm 0.5 is below minimum 0.8"]


def test_validator_from_file():
    validator = Validator(RULES_PATH)
    assert "minimum_wall_thickness_mm" in validator.rules["rules"]


def test_validator_validate_raises():
    validator = Validator({"rules": {"minimum_wall_thickness_mm": 0.8}})
    with pytest.raises(ValidationError):
        validator.validate({"minimum_wall_thickness_mm": 0.5})


def test_save_validator_delegates_and_validates():
    obj = DummyShape()
    sv = SaveValidator(RULES_PATH, obj)
    sv.export(obj)
    assert _dummy_cq.exporters.calls[-1][0] is obj


def test_save_validator_invalid_raises():
    sv = SaveValidator(RULES_PATH)
    obj = DummyShape()
    SaveValidator.attach_model(obj, {"minimum_wall_thickness_mm": 0.1})
    with pytest.raises(ValidationError):
        sv.export_stl(obj, "out.stl")


def test_wrapper_delegates_and_validates():
    workplane = DummyShape()
    wrapper = CadQueryWrapper(RULES_PATH, workplane)
    # workplane already has an attached empty model
    wrapper.export_stl()
    assert workplane.called[-1][0] == "exportStl"


def test_wrapper_invalid_raises():
    workplane = DummyShape()
    wrapper = CadQueryWrapper(RULES_PATH, workplane)
    CadQueryWrapper.attach_model(workplane, {"minimum_wall_thickness_mm": 0.1})
    with pytest.raises(ValidationError):
        wrapper.export_stl()


def test_wrapper_validate_no_args():
    workplane = DummyShape()
    wrapper = CadQueryWrapper(RULES_PATH, workplane)
    CadQueryWrapper.attach_model(workplane, {"minimum_wall_thickness_mm": 0.5})
    with pytest.raises(ValidationError):
        wrapper.validate()
    CadQueryWrapper.attach_model(workplane, {"minimum_wall_thickness_mm": 0.9})
    wrapper.validate()


def test_validate_max_model_size_dict():
    rules = {"rules": {"max_model_size_mm": {"X": 1, "Y": 1, "Z": 1}}}
    model = {"max_model_size_mm": {"X": 2, "Y": 0.5, "Z": 0.5}}
    errors = validate(model, rules)
    assert errors == ["Model size X 2 exceeds maximum 1"]


def test_save_validator_model_too_large():
    rules = {"rules": {"max_model_size_mm": {"X": 1, "Y": 1, "Z": 1}}}
    obj = DummyBBoxShape(2, 0.5, 0.5)
    sv = SaveValidator(rules, obj)
    with pytest.raises(ValidationError):
        sv.export_stl(obj, "out.stl")


def test_save_validator_triangle_count(tmp_path):
    rules = {"rules": {"maximum_file_triangle_count": 100}}
    shape = SphereShape(subdivisions=3)
    sv = SaveValidator(rules, shape)
    file_name = tmp_path / "sphere.stl"
    with pytest.raises(ValidationError):
        sv.export_stl(shape, file_name)


def test_save_validator_manifold_required():
    rules = {"rules": {"manifold_geometry_required": True}}
    shape = NonManifoldShape(valid=False)
    sv = SaveValidator(rules, shape)
    with pytest.raises(ValidationError):
        sv.export_stl(shape, "out.stl")


def test_save_validator_open_edges():
    rules = {"rules": {"no_open_edges": True}}
    shape = OpenEdgeShape()
    sv = SaveValidator(rules, shape)
    with pytest.raises(ValidationError):
        sv.export_stl(shape, "out.stl")


def test_save_validator_intersections():
    rules = {"rules": {"no_intersecting_geometry": True}}
    solid1 = IntersectSolid()
    solid2 = IntersectSolid()
    assembly = DummyAssembly([solid1, solid2])
    sv = SaveValidator(rules, assembly)
    with pytest.raises(ValidationError):
        sv.assembly_save(assembly)


def test_save_validator_disallowed_format():
    rules = {
        "rules": {
            "preferred_file_format": "STL",
            "alternate_file_formats": ["3MF", "OBJ"],
        }
    }
    sv = SaveValidator(rules)
    shape = DummyShape()
    with pytest.raises(ValidationError):
        sv.export_stl(shape, "out.step")


def test_save_validator_disallowed_format_export():
    rules = {
        "rules": {
            "preferred_file_format": "STL",
            "alternate_file_formats": ["OBJ"],
        }
    }
    sv = SaveValidator(rules)
    obj = DummyShape()
    with pytest.raises(ValidationError):
        sv.export(obj, "model.step")


def test_save_validator_minimum_clearance():
    rules = {"rules": {"minimum_clearance_between_parts_mm": 0.3}}
    s1 = ClearanceSolid(0.2)
    s2 = ClearanceSolid(0.5)
    assembly = DummyAssembly([s1, s2])
    sv = SaveValidator(rules, assembly)
    with pytest.raises(ValidationError):
        sv.assembly_save(assembly)


def test_save_validator_overhang_angle():
    rules = {"rules": {"overhang_max_angle_deg": 45}}
    shape = OverhangShape([30, 50])
    sv = SaveValidator(rules, shape)
    with pytest.raises(ValidationError):
        sv.export_stl(shape, "out.stl")
