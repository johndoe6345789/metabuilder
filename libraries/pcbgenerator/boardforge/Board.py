from .Component import Component
from .GerberExporter import export_gerbers
from .drc import check_board
from .rules import LAYER_SERVICE_RULES
from .Pin import Pin
from .Via import Via
from .Zone import Zone
from .svgtools import render_text_ttf, render_svg_element
from shapely.geometry import Polygon, box
import xml.etree.ElementTree as ET
import math
import os
import re

TOP_SILK = "GTO"
BOTTOM_SILK = "GBO"

import datetime
import pprint
def log(msg, obj=None):
    with open('boardforge.log', 'a', encoding='utf-8') as f:
        f.write(f"{datetime.datetime.now().isoformat()} {msg}\n")
        if obj is not None:
            f.write(pprint.pformat(obj) + "\n")

class Board:

    def __init__(self, name="Board", width=100, height=80, layer_service="2 Layer"):
        log('ENTER __init__', locals())
        log("Board __init__ called")
        self.name = name
        self.width = width
        self.height = height
        self.components = []
        # Manufacturing ruleset to enforce during design rule checks
        self.layer_service = layer_service
        # Map reference designators to components for quick lookup
        self._ref_map = {}
        # Containers for vias, filled zones, and non-plated holes
        self.vias = []
        self.zones = []
        self.holes = []
        self.outline_geom = box(0, 0, width, height)
        self.layers = {"GTO": [], "GBO": []}
        self._svg_text_calls = []
        self._svg_graphics_calls = []
        log('EXIT __init__', {'self': self.__dict__})

    @staticmethod
    def _arc_params(start, end, radius, sweep):
        """Return centre coordinates and angles for an arc."""
        x1, y1 = start
        x2, y2 = end
        dx = x2 - x1
        dy = y2 - y1
        chord = math.hypot(dx, dy)
        if chord == 0 or 2 * radius < chord:
            return None
        midx = (x1 + x2) / 2
        midy = (y1 + y2) / 2
        h = math.sqrt(max(radius * radius - (chord / 2) ** 2, 0))
        ux = -dy / chord
        uy = dx / chord
        if sweep > 0:
            cx = midx + ux * h
            cy = midy + uy * h
        else:
            cx = midx - ux * h
            cy = midy - uy * h
        start_ang = math.degrees(math.atan2(y1 - cy, x1 - cx))
        end_ang = start_ang + sweep
        return (cx, cy, start_ang, end_ang)

    def set_layer_stack(self, layers):
        log('ENTER set_layer_stack', locals())
        log("set_layer_stack called")
        for layer in layers:
            if layer not in self.layers:
                self.layers[layer] = []
        log('EXIT set_layer_stack', {'self': self.__dict__})

    def add_component(self, type, ref, at, rotation=0):
        log('ENTER add_component', locals())
        log("add_component called")
        comp = Component(ref, type, at, rotation)
        self.components.append(comp)
        self._ref_map[ref] = comp
        log('EXIT add_component', {'self': self.__dict__})
        return comp

    def trace(self, pin1, pin2, layer="GTL", width=1.0):
        """Add a simple straight trace between two pins."""
        self.layers[layer].append(("TRACE", pin1, pin2, width))

    def _find_pin(self, ref_pin):
        """Lookup a Pin object given a string like "U1:VCC"."""
        if isinstance(ref_pin, Pin):
            return ref_pin
        if not isinstance(ref_pin, str) or ":" not in ref_pin:
            raise ValueError("pin reference must be Pin or 'REF:PIN'")
        ref, pin_name = ref_pin.split(":", 1)
        comp = self._ref_map.get(ref)
        if comp is None:
            raise ValueError(f"Component {ref} not found")
        pin = comp.pin(pin_name)
        if pin is None:
            raise ValueError(f"Pin {pin_name} not found on {ref}")
        return pin

    def route_trace(self, start, end, layer="GTL", width=1.0, bends=None):
        """Route a trace between two pins, optionally with bends."""
        pts = [self._find_pin(start)]
        if bends:
            pts.extend(bends)
        pts.append(self._find_pin(end))
        self.trace_path(pts, layer=layer, width=width)

    def trace_path(self, points, layer="GTL", width=1.0):
        """Add a trace with optional arcs or Bezier curves.

        Parameters
        ----------
        points : list
            Sequence defining the path. Items may be coordinate tuples/objects
            or dictionaries specifying an ``{"arc": (radius, sweep)}`` or
            ``{"bezier": ((cx1, cy1), (cx2, cy2))}`` between the previous and
            next coordinate.
        layer : str
            Board layer to place the trace on. Defaults to ``"GTL"``.
        width : float
            Trace width in mm.
        """

        def _get_xy(item):
            if hasattr(item, "x") and hasattr(item, "y"):
                return (item.x, item.y)
            return (item[0], item[1])

        segments = []
        if not points:
            return

        prev = _get_xy(points[0])
        i = 1
        while i < len(points):
            item = points[i]
            if isinstance(item, dict) and "arc" in item:
                radius, sweep = item["arc"]
                i += 1
                end = _get_xy(points[i])
                segments.append(("ARC", prev, end, radius, sweep))
                prev = end
                i += 1
                continue
            if isinstance(item, dict) and "bezier" in item:
                ctrl1, ctrl2 = item["bezier"]
                i += 1
                end = _get_xy(points[i])
                segments.append(("BEZIER", prev, ctrl1, ctrl2, end))
                prev = end
                i += 1
                continue
            end = _get_xy(item)
            segments.append(("LINE", prev, end))
            prev = end
            i += 1

        if segments:
            self.layers[layer].append(("TRACE_PATH", segments, width))

    def add_via(self, x, y, from_layer="GTL", to_layer="GBL", diameter=0.6, hole=0.3):
        """Create a via connecting two layers."""
        via = Via(x, y, from_layer, to_layer, diameter=diameter, hole=hole)
        self.vias.append(via)
        return via

    def add_filled_zone(self, net=None, layer="GBL"):
        """Store information about a filled copper zone."""
        zone = Zone(net, layer)
        self.zones.append(zone)
        return zone

    def outline(self, points):
        """Define the board outline using a sequence of ``(x, y)`` points."""
        self.outline_geom = Polygon(points)
        return self.outline_geom

    def chamfer_outline(self, width, height, chamfer):
        """Create a chamfered rectangular outline.

        Parameters
        ----------
        width : float
            Overall board width.
        height : float
            Overall board height.
        chamfer : float
            Offset distance from each corner for the chamfer.
        """
        self.width = width
        self.height = height
        pts = [
            (chamfer, 0),
            (width - chamfer, 0),
            (width, chamfer),
            (width, height - chamfer),
            (width - chamfer, height),
            (chamfer, height),
            (0, height - chamfer),
            (0, chamfer),
        ]
        self.outline_geom = Polygon(pts)
        return self.outline_geom

    def oversize(self, margin):
        """Expand the stored outline by ``margin`` mm."""
        if self.outline_geom is None:
            self.outline_geom = box(0, 0, self.width, self.height)
        self.outline_geom = self.outline_geom.buffer(margin)
        return self.outline_geom

    def fill(self, points, layer="GBL", net=None):
        """Create a filled copper polygon on the specified layer."""
        poly = Polygon(points)
        zone = Zone(net, layer, geometry=poly)
        self.zones.append(zone)
        cmds = []
        for i, (x, y) in enumerate(poly.exterior.coords):
            code = "D02*" if i == 0 else "D01*"
            cmds.append(f"X{int(x*1000):07d}Y{int(y*1000):07d}{code}")
        self.layers.setdefault(layer, []).extend(cmds)
        return zone

    def hole(self, xy, diameter, annulus=None):
        """Record a non-plated hole location.

        Parameters
        ----------
        xy : tuple
            ``(x, y)`` coordinates of the hole centre.
        diameter : float
            Diameter of the hole in mm.
        annulus : float, optional
            Optional copper ring around the hole.
        """
        self.holes.append((xy[0], xy[1], diameter, annulus))
        return (xy[0], xy[1], diameter, annulus)

    def add_svg_graphic(self, svg_path, layer, scale=1.0, at=(0, 0)):
        log('ENTER add_svg_graphic', locals())
        log("add_svg_graphic called")
        self._svg_graphics_calls.append((svg_path, layer, scale, at))
        try:
            tree = ET.parse(svg_path)
            root = tree.getroot()
            for el in root.iter():
                cmds = render_svg_element(el, scale, *at)
                self.layers[layer].extend(cmds)
        except Exception as e:
            print(f"Error adding SVG graphic {svg_path}: {e}")
        log('EXIT add_svg_graphic', {'self': self.__dict__})

    def add_text_ttf(self, text, font_path, at=(0, 0), size=1.0, layer="GTO"):
        log('ENTER add_text_ttf', locals())
        log("add_text_ttf called")
        self._svg_text_calls.append((text, at, size, layer))
        try:
            gerber = render_text_ttf(text, font_path, at, size)
            self.layers[layer].extend(gerber)
        except Exception as e:
            print(f"TTF render error: {e}")
        log('EXIT add_text_ttf', {'self': self.__dict__})

    def annotate(self, x, y, text, size=1.0, layer=TOP_SILK):
        """Add an annotation using the bundled RobotoMono font."""
        font_path = os.path.join(os.path.dirname(__file__), "..", "fonts", "RobotoMono.ttf")
        if hasattr(layer, "value"):
            layer = layer.value
        self.add_text_ttf(text, font_path=font_path, at=(x, y), size=size, layer=layer)

    def logo(self, x, y, image, scale=1.0, layer=TOP_SILK):
        """Render a Pillow image onto ``layer`` as a simple bitmap graphic."""
        if hasattr(layer, "value"):
            layer = layer.value
        img = image.convert("RGBA")
        width, height = img.size
        for j in range(height):
            for i in range(width):
                r, g, b, a = img.getpixel((i, j))
                if a > 0 and (r, g, b) != (255, 255, 255):
                    sx = x + i * scale
                    sy = y + j * scale
                    cmds = [
                        f"X{int(sx*1000):07d}Y{int(sy*1000):07d}D02*",
                        f"X{int((sx+scale)*1000):07d}Y{int(sy*1000):07d}D01*",
                        f"X{int((sx+scale)*1000):07d}Y{int((sy+scale)*1000):07d}D01*",
                        f"X{int(sx*1000):07d}Y{int((sy+scale)*1000):07d}D01*",
                        f"X{int(sx*1000):07d}Y{int(sy*1000):07d}D01*",
                    ]
                    self.layers[layer].extend(cmds)


    def design_rule_check(self, min_trace_width=None, min_clearance=None):
        """Check design rules and raise :class:`~boardforge.drc.DRCError` on failures.

        If ``min_trace_width`` or ``min_clearance`` are not provided, values
        from :data:`LAYER_SERVICE_RULES` corresponding to ``self.layer_service``
        will be used when available.
        """

        def _parse(value):
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                lowered = value.lower()
                if lowered in {"any", "user preference"}:
                    return 0.0
                m = re.search(r"([0-9.]+)mm", value)
                if m:
                    return float(m.group(1))
            return 0.0

        extra = {}
        if self.layer_service in LAYER_SERVICE_RULES:
            rules = LAYER_SERVICE_RULES[self.layer_service]
            if min_trace_width is None:
                min_trace_width = _parse(rules.get("Minimum track Width", 0))
            if min_clearance is None:
                min_clearance = _parse(rules.get("Minimum Clearance", 0))
            extra["min_annular_ring"] = _parse(rules.get("Minimum Annular Ring", 0))
            extra["min_via_diameter"] = _parse(rules.get("Minimum Via Diameter", 0))
            extra["min_through_hole"] = _parse(rules.get("Minimum Through Hole", 0))
            extra["hole_to_hole_clearance"] = _parse(rules.get("Hole to hole clearance", 0))
            extra["min_text_height"] = _parse(rules.get("Silkscreen Min Text Height", 0))
            extra["min_text_thickness"] = _parse(rules.get("Silkscreen Min Text Thickness", 0))

        if min_trace_width is None:
            min_trace_width = 0.15
        if min_clearance is None:
            min_clearance = 0.15

        warnings = check_board(
            self,
            min_trace_width=min_trace_width,
            min_clearance=min_clearance,
            **{k: v for k, v in extra.items() if v}
        )
        if warnings:
            from .drc import DRCError
            raise DRCError(warnings)
        return []

    def save_svg_previews(self, outdir="."):
        log('ENTER save_svg_previews', locals())
        log("save_svg_previews called")
        width_px = int(self.width * 10)
        height_px = int(self.height * 10)
        log('EXIT save_svg_previews', {'self': self.__dict__})

        colors = {
            "board": "#5d2292",  # OSH Park purple
            "pad": "#ffc100",    # Gold
            "ring": "#ffec80",   # Lighter gold for through-hole rings
            "trace": "#ffc100",  # Gold
            "silk": "#ffffff",   # White
            "hole": "#000000",   # Black for board holes
        }

        for side, suffix in [("GTO", "top"), ("GBO", "bottom")]:
            poly = self.outline_geom if self.outline_geom is not None else box(0, 0, self.width, self.height)

            # Carve castellated pads out of the outline for a simple preview
            from shapely.geometry import Point, box as sbox
            for comp in self.components:
                for pad in getattr(comp, "pads", []):
                    if getattr(pad, "castellated", False) and pad.edge:
                        r = (getattr(pad, "w", 1.2) or 1.2) / 2
                        if pad.edge == "bottom":
                            semi = Point(pad.x, pad.y).buffer(r, resolution=8).intersection(
                                sbox(pad.x - r, pad.y, pad.x + r, pad.y + r)
                            )
                        elif pad.edge == "top":
                            semi = Point(pad.x, pad.y).buffer(r, resolution=8).intersection(
                                sbox(pad.x - r, pad.y - r, pad.x + r, pad.y)
                            )
                        elif pad.edge == "left":
                            semi = Point(pad.x, pad.y).buffer(r, resolution=8).intersection(
                                sbox(pad.x, pad.y - r, pad.x + r, pad.y + r)
                            )
                        elif pad.edge == "right":
                            semi = Point(pad.x, pad.y).buffer(r, resolution=8).intersection(
                                sbox(pad.x - r, pad.y - r, pad.x, pad.y + r)
                            )
                        else:
                            semi = None
                        if semi is not None:
                            poly = poly.difference(semi)

            polygons = [poly] if poly.geom_type == "Polygon" else list(poly.geoms)
            svg_elements = []
            for p in polygons:
                pts = " ".join(f"{int(x*10)},{int(y*10)}" for x, y in p.exterior.coords)
                svg_elements.append(
                    f'<polygon points="{pts}" fill="{colors["board"]}"/>'
                )

            # Traces (placeholder: draws a line for each trace)
            for trace in self.layers.get("GTL" if side == "GTO" else "GBL", []):
                if isinstance(trace, tuple) and trace[0] == "TRACE":
                    pin1, pin2 = trace[1], trace[2]
                    x1, y1 = int(pin1.x * 10), int(pin1.y * 10)
                    x2, y2 = int(pin2.x * 10), int(pin2.y * 10)
                    svg_elements.append(
                        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{colors["trace"]}" stroke-width="4"/>'
                    )
                elif isinstance(trace, tuple) and trace[0] == "TRACE_PATH":
                    segments = trace[1]
                    width = trace[2]
                    path_cmds = []
                    move_done = False
                    for seg in segments:
                        if seg[0] == "LINE":
                            start, end = seg[1], seg[2]
                            if not move_done:
                                path_cmds.append(f'M{int(start[0]*10)},{int(start[1]*10)}')
                                move_done = True
                            path_cmds.append(f'L{int(end[0]*10)},{int(end[1]*10)}')
                        elif seg[0] == "ARC":
                            start, end, r, ang = seg[1], seg[2], seg[3], seg[4]
                            large = 1 if abs(ang) > 180 else 0
                            sweep = 1 if ang > 0 else 0
                            if not move_done:
                                path_cmds.append(f'M{int(start[0]*10)},{int(start[1]*10)}')
                                move_done = True
                            path_cmds.append(
                                f"A{int(r*10)},{int(r*10)} 0 {large},{sweep} {int(end[0]*10)},{int(end[1]*10)}"
                            )
                        elif seg[0] == "BEZIER":
                            start, c1, c2, end = seg[1], seg[2], seg[3], seg[4]
                            if not move_done:
                                path_cmds.append(f'M{int(start[0]*10)},{int(start[1]*10)}')
                                move_done = True
                            path_cmds.append(
                                f"C{int(c1[0]*10)},{int(c1[1]*10)} {int(c2[0]*10)},{int(c2[1]*10)} {int(end[0]*10)},{int(end[1]*10)}"
                            )
                    if path_cmds:
                        d = ' '.join(path_cmds)
                        svg_elements.append(
                            f'<path d="{d}" stroke="{colors["trace"]}" stroke-width="{max(1,int(width*4))}" fill="none"/>'
                        )

            # Filled zones
            for zone in self.zones:
                if zone.layer == ("GTL" if side == "GTO" else "GBL") and zone.geometry is not None:
                    pts = " ".join(
                        f"{int(x*10)},{int(y*10)}" for x, y in zone.geometry.exterior.coords
                    )
                    svg_elements.append(
                        f'<polygon points="{pts}" fill="{colors["trace"]}" opacity="0.6"/>'
                    )

            # Pads with rotation drawn above traces
            for comp in self.components:
                for pad in getattr(comp, "pads", []):
                    x = int(pad.x * 10)
                    y = int(pad.y * 10)
                    w = int((getattr(pad, "w", 1.2) or 1.2) * 10)
                    h = int((getattr(pad, "h", 1.2) or 1.2) * 10)

                    if getattr(pad, "castellated", False) and pad.edge:
                        r = (getattr(pad, "w", 1.2) or 1.2) / 2
                        from shapely.geometry import Point, box as sbox

                        def semi_shape(rad):
                            if pad.edge == "bottom":
                                return Point(pad.x, pad.y).buffer(rad, resolution=8).intersection(
                                    sbox(pad.x - rad, pad.y, pad.x + rad, pad.y + rad)
                                )
                            if pad.edge == "top":
                                return Point(pad.x, pad.y).buffer(rad, resolution=8).intersection(
                                    sbox(pad.x - rad, pad.y - rad, pad.x + rad, pad.y)
                                )
                            if pad.edge == "left":
                                return Point(pad.x, pad.y).buffer(rad, resolution=8).intersection(
                                    sbox(pad.x, pad.y - rad, pad.x + rad, pad.y + rad)
                                )
                            if pad.edge == "right":
                                return Point(pad.x, pad.y).buffer(rad, resolution=8).intersection(
                                    sbox(pad.x - rad, pad.y - rad, pad.x, pad.y + rad)
                                )
                            return Point(pad.x, pad.y).buffer(rad, resolution=8)

                        inner = semi_shape(r)
                        ring = None
                        if getattr(pad, "plated", True):
                            outer = semi_shape(r + 0.3)
                            ring = outer.difference(inner)

                        def emit_poly(shape, color, width):
                            if shape.is_empty:
                                return
                            polys = [shape] if shape.geom_type == "Polygon" else list(shape.geoms)
                            for poly in polys:
                                pts = " ".join(f"{int(x*10)},{int(y*10)}" for x, y in poly.exterior.coords)
                                svg_elements.append(
                                    f'<polygon points="{pts}" fill="{color}" stroke="#333" stroke-width="{width}"/>'
                                )

                        if ring is not None:
                            emit_poly(ring, colors["ring"], 1)
                        emit_poly(inner, colors["pad"], 2)

                    else:
                        if abs(w - h) <= 1:
                            ring_r = int((w + 6) // 2)
                            pad_r = int(w // 2)
                            svg_elements.append(
                                f'<circle cx="{x}" cy="{y}" r="{ring_r}" fill="{colors["ring"]}" stroke="#333" stroke-width="1"/>'
                            )
                            svg_elements.append(
                                f'<circle cx="{x}" cy="{y}" r="{pad_r}" fill="{colors["pad"]}" stroke="#333" stroke-width="2"/>'
                            )
                        else:
                            svg_elements.append(
                                f'<rect x="{x-w//2}" y="{y-h//2}" width="{w}" height="{h}" fill="{colors["pad"]}" stroke="#333" stroke-width="2" transform="rotate({comp.rotation},{x},{y})"/>'
                            )

            # Board holes drawn above pads
            for hx, hy, dia, ann in self.holes:
                x = int(hx * 10)
                y = int(hy * 10)
                r = int((dia / 2) * 10)
                if ann is not None:
                    ring_r = int(((dia / 2) + ann) * 10)
                    svg_elements.append(
                        f'<circle cx="{x}" cy="{y}" r="{ring_r}" fill="{colors["ring"]}" stroke="#333" stroke-width="1"/>'
                    )
                svg_elements.append(
                    f'<circle cx="{x}" cy="{y}" r="{r}" fill="{colors["hole"]}" stroke="#333" stroke-width="1"/>'
                )

            # Silkscreen text from _svg_text_calls
            for (text, at, size, lyr) in self._svg_text_calls:
                if lyr == side:
                    x = int(at[0] * 10)
                    y = int(at[1] * 10)
                    font_size = int(15 * size)
                    svg_elements.append(
                        f'<text x="{x}" y="{y}" fill="{colors["silk"]}" font-family="monospace" font-size="{font_size}">{text}</text>'
                    )

            # SVG graphics from _svg_graphics_calls
            for (svg_path, lyr, scale, at) in self._svg_graphics_calls:
                if lyr == side and os.path.exists(svg_path):
                    try:
                        tree = ET.parse(svg_path)
                        g = ET.tostring(tree.getroot(), encoding="unicode")
                        svg_elements.append(
                            f'<g transform="translate({int(at[0]*10)},{int(at[1]*10)}) scale({scale})">{g}</g>'
                        )
                    except Exception as e:
                        print(f"Error embedding SVG {svg_path}: {e}")

            # Generate SVG content with proper indentation
            svg_content = [
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_px}" height="{height_px}" viewBox="0 0 {width_px} {height_px}">'
            ]
            svg_content.extend(f'  {el}' for el in svg_elements)
            svg_content.append('</svg>')

            # Write to file
            os.makedirs(outdir, exist_ok=True)
            output_path = os.path.join(outdir, f"preview_{suffix}.svg")
            try:
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write('\n'.join(svg_content))
                # Convert the SVG preview to PNG for easier visual inspection
                try:
                    from cairosvg import svg2png
                    from PIL import Image
                    png_path = os.path.join(outdir, f"preview_{suffix}.png")
                    svg2png(bytes('\n'.join(svg_content), 'utf-8'), write_to=png_path)
                    with Image.open(png_path) as im2:
                        if im2.mode != "RGBA":
                            im2.convert("RGBA").save(png_path)
                    # Simple verification: ensure the file was written and is not empty
                    if os.path.getsize(png_path) == 0:
                        os.remove(png_path)
                        raise ValueError("Generated PNG is empty")
                except Exception as e:
                    print(f"Error converting SVG to PNG: {e}")
            except Exception as e:
                print(f"Error writing SVG preview to {output_path}: {e}")

    def save_png_previews(self, outdir=".", scale=10):
        """Render high-quality PNG previews using Pillow.

        This method draws board geometry directly to PNG images using
        :mod:`Pillow` and simple geometry helpers inspired by the CuFlow
        project.  It does not attempt to be a full PCB renderer but provides
        smoother traces and rotated pads compared to the basic SVG output.

        Parameters
        ----------
        outdir : str
            Directory where the PNGs will be written.
        scale : int
            Pixels per mm for the generated images.
        """
        os.makedirs(outdir, exist_ok=True)
        from PIL import Image, ImageDraw, ImageFont
        from shapely.geometry import box
        from shapely.affinity import rotate, translate

        width_px = int(self.width * scale)
        height_px = int(self.height * scale)

        colors = {
            "board": (93, 34, 146, 255),  # purple board colour
            "pad": (255, 193, 0, 255),
            "ring": (255, 236, 128, 255),
            "trace": (255, 193, 0, 255),
            "silk": (255, 255, 255, 255),
            "hole": (0, 0, 0, 255),
        }

        for side, suffix in [("GTO", "top"), ("GBO", "bottom")]:
            im = Image.new("RGBA", (width_px, height_px), (0, 0, 0, 0))
            draw = ImageDraw.Draw(im)
            poly = self.outline_geom if self.outline_geom is not None else box(0, 0, self.width, self.height)
            draw.polygon([(x * scale, y * scale) for x, y in poly.exterior.coords], fill=colors["board"])

            layer = "GTL" if side == "GTO" else "GBL"
            for trace in self.layers.get(layer, []):
                if isinstance(trace, tuple) and trace[0] == "TRACE":
                    p1, p2, w = trace[1], trace[2], trace[3]
                    draw.line(
                        [(p1.x * scale, p1.y * scale), (p2.x * scale, p2.y * scale)],
                        fill=colors["trace"],
                        width=max(1, int(w * scale)),
                    )
                elif isinstance(trace, tuple) and trace[0] == "TRACE_PATH":
                    segments = trace[1]
                    w = trace[2]
                    for seg in segments:
                        if seg[0] == "LINE":
                            s, e = seg[1], seg[2]
                            draw.line(
                                [(s[0] * scale, s[1] * scale), (e[0] * scale, e[1] * scale)],
                                fill=colors["trace"],
                                width=max(1, int(w * scale)),
                            )
                        elif seg[0] == "ARC":
                            s, e, r, ang = seg[1], seg[2], seg[3], seg[4]
                            params = self._arc_params(s, e, r, ang)
                            if params is not None:
                                cx, cy, a1, a2 = params
                                bbox = [
                                    (cx - r) * scale,
                                    (cy - r) * scale,
                                    (cx + r) * scale,
                                    (cy + r) * scale,
                                ]
                                draw.arc(bbox, start=a1, end=a2, fill=colors["trace"], width=max(1, int(w * scale)))
                        elif seg[0] == "BEZIER":
                            from svg.path import CubicBezier
                            s, c1, c2, e = seg[1], seg[2], seg[3], seg[4]
                            cb = CubicBezier(complex(*s), complex(*c1), complex(*c2), complex(*e))
                            steps = 20
                            pts = [cb.point(t / steps) for t in range(steps + 1)]
                            draw.line(
                                [(pt.real * scale, pt.imag * scale) for pt in pts],
                                fill=colors["trace"],
                                width=max(1, int(w * scale)),
                            )

            for zone in self.zones:
                if zone.layer == layer and zone.geometry is not None:
                    pts = [(x * scale, y * scale) for (x, y) in zone.geometry.exterior.coords]
                    draw.polygon(pts, fill=colors["trace"], outline=None)

            for comp in self.components:
                for pad in getattr(comp, "pads", []):
                    x = pad.x * scale
                    y = pad.y * scale
                    w = (getattr(pad, "w", 1.2) or 1.2) * scale
                    h = (getattr(pad, "h", 1.2) or 1.2) * scale
                    if abs(w - h) <= scale * 0.1:
                        ring_r = (w + 6) / 2
                        pad_r = w / 2
                        draw.ellipse(
                            [x - ring_r, y - ring_r, x + ring_r, y + ring_r],
                            fill=colors["ring"], outline="#333"
                        )
                        draw.ellipse(
                            [x - pad_r, y - pad_r, x + pad_r, y + pad_r],
                            fill=colors["pad"], outline="#333"
                        )
                    else:
                        poly = box(-w / 2, -h / 2, w / 2, h / 2)
                        poly = rotate(poly, comp.rotation, origin=(0, 0))
                        poly = translate(poly, x, y)
                        draw.polygon(list(poly.exterior.coords), fill=colors["pad"], outline="#333")

            for hx, hy, dia, ann in self.holes:
                x = hx * scale
                y = hy * scale
                r = (dia / 2) * scale
                if ann is not None:
                    ring_r = ((dia / 2) + ann) * scale
                    draw.ellipse(
                        [x - ring_r, y - ring_r, x + ring_r, y + ring_r],
                        fill=colors["ring"], outline="#333"
                    )
                draw.ellipse(
                    [x - r, y - r, x + r, y + r],
                    fill=colors["hole"], outline="#333"
                )

            for (text, at, size, lyr) in self._svg_text_calls:
                if lyr == side:
                    font_size = max(8, int(15 * size))
                    try:
                        font = ImageFont.truetype("DejaVuSans.ttf", font_size)
                    except Exception:
                        font = ImageFont.load_default()
                    draw.text(
                        (at[0] * scale, at[1] * scale),
                        text,
                        fill=colors["silk"],
                        font=font,
                    )

            png_path = os.path.join(outdir, f"preview_{suffix}_hi.png")
            im.save(png_path)


    def export_gerbers(self, out_path):
        log('ENTER export_gerbers', locals())
        log("export_gerbers called")
        self.design_rule_check()
        export_gerbers(self, out_path)

    def export_all(self, out_path):
        """Convenience method mirroring the pseudocode API."""
        self.export_gerbers(out_path)
