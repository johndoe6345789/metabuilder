import cadquery as cq
from cadquerywrapper import CadQueryWrapper, ValidationError

# These can be modified rather than hardcoding values for each dimension.
length = 80.0  # Length of the block
height = 60.0  # Height of the block
thickness = 10.0  # Thickness of the block

# Create a 3D block based on the dimension variables above.
# 1.  Establishes a workplane that an object can be built on.
# 1a. Uses the X and Y origins to define the workplane, meaning that the
# positive Z direction is "up", and the negative Z direction is "down".
result = cq.Workplane("XY").box(length, height, thickness)

# Attach a simple model so validation has data to work with
CadQueryWrapper.attach_model(result, {"minimum_wall_thickness_mm": thickness})

# Wrap the workplane with validation and saving helpers
wrapper = CadQueryWrapper("cadquerywrapper/rules/bambu_printability_rules.json", result)

try:
    wrapper.validate()
except ValidationError as exc:
    print("Model invalid:", exc)

wrapper.export_stl("simple_block.stl")

# The following method is now outdated, but can still be used to display the
# results of the script if you want
# from Helpers import show
# show(result)  # Render the result of this script

show_object(result)
