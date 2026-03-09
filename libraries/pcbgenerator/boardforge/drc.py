"""Design Rule Checking utilities."""

class DRCError(Exception):
    """Raised when a design rule violation is detected."""

    def __init__(self, warnings):
        message = "; ".join(warnings)
        super().__init__(message)
        self.warnings = warnings

import math
from typing import List


def check_board(
    board,
    min_trace_width: float = 0.15,
    min_clearance: float = 0.15,
    min_annular_ring: float | None = None,
    min_via_diameter: float | None = None,
    min_through_hole: float | None = None,
    hole_to_hole_clearance: float | None = None,
    min_text_height: float | None = None,
    min_text_thickness: float | None = None,
) -> List[str]:
    """Return a list of DRC warnings for a board.

    Parameters
    ----------
    board : Board
        Board object to check.
    min_trace_width : float, optional
        Minimum allowed trace width in the board's units (defaults to 0.15).
    min_clearance : float, optional
        Minimum allowed clearance between pad edges (defaults to 0.15).
    min_annular_ring : float, optional
        Minimum allowed annular ring width for vias.
    min_via_diameter : float, optional
        Minimum allowed overall via diameter.
    min_through_hole : float, optional
        Minimum allowed drill size for vias.
    hole_to_hole_clearance : float, optional
        Minimum allowed clearance between via holes.
    min_text_height : float, optional
        Minimum allowed height for silkscreen text.
    min_text_thickness : float, optional
        Minimum allowed thickness for silkscreen text.
    """

    warnings = []

    # Trace width checks
    for layer_name, items in board.layers.items():
        for item in items:
            if not isinstance(item, tuple):
                continue
            if item[0] == "TRACE":
                width = item[3] if len(item) >= 4 else 1.0
                if width < min_trace_width:
                    warnings.append(
                        f"Trace on {layer_name} width {width}mm below minimum {min_trace_width}mm"
                    )
            elif item[0] == "TRACE_PATH":
                width = item[2] if len(item) >= 3 else 1.0
                if width < min_trace_width:
                    warnings.append(
                        f"Trace path on {layer_name} width {width}mm below minimum {min_trace_width}mm"
                    )

    # Pad clearance checks
    pads = []
    for comp in board.components:
        for pad in comp.pads:
            pad.component = comp
            pads.append(pad)

    for i in range(len(pads)):
        for j in range(i + 1, len(pads)):
            p1 = pads[i]
            p2 = pads[j]
            if getattr(p1, "component", None) is getattr(p2, "component", None):
                continue
            dx = p1.x - p2.x
            dy = p1.y - p2.y
            center_dist = math.hypot(dx, dy)
            clearance = center_dist - (max(p1.w, p1.h) / 2) - (max(p2.w, p2.h) / 2)
            if clearance < min_clearance:
                warnings.append(
                    f"Pad clearance between {p1.name} and {p2.name} is {clearance:.3f}mm; minimum {min_clearance}mm"
                )

    # Via checks
    for via in board.vias:
        if min_via_diameter and via.diameter < min_via_diameter:
            warnings.append(
                f"Via at ({via.x},{via.y}) diameter {via.diameter}mm below minimum {min_via_diameter}mm"
            )
        if min_through_hole and via.hole < min_through_hole:
            warnings.append(
                f"Via at ({via.x},{via.y}) hole {via.hole}mm below minimum {min_through_hole}mm"
            )
        if min_annular_ring is not None:
            annular = (via.diameter - via.hole) / 2.0
            if annular < min_annular_ring:
                warnings.append(
                    f"Via at ({via.x},{via.y}) annular ring {annular:.3f}mm below minimum {min_annular_ring}mm"
                )

    if hole_to_hole_clearance:
        for i in range(len(board.vias)):
            for j in range(i + 1, len(board.vias)):
                v1 = board.vias[i]
                v2 = board.vias[j]
                dx = v1.x - v2.x
                dy = v1.y - v2.y
                center_dist = math.hypot(dx, dy)
                clearance = center_dist - (v1.hole / 2) - (v2.hole / 2)
                if clearance < hole_to_hole_clearance:
                    warnings.append(
                        f"Via clearance between ({v1.x},{v1.y}) and ({v2.x},{v2.y}) is {clearance:.3f}mm; minimum {hole_to_hole_clearance}mm"
                    )

    if (min_text_height or min_text_thickness) and getattr(board, "_svg_text_calls", None):
        for text, at, size, layer in board._svg_text_calls:
            if min_text_height and size < min_text_height:
                warnings.append(
                    f"Silkscreen text '{text}' height {size}mm below minimum {min_text_height}mm"
                )
            if min_text_thickness:
                thickness = size * 0.2
                if thickness < min_text_thickness:
                    warnings.append(
                        f"Silkscreen text '{text}' thickness {thickness:.3f}mm below minimum {min_text_thickness}mm"
                    )

    return warnings

