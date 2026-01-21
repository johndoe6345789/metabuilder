import math
import re
from svg.path import parse_path
from svg.path.path import Line, Move, CubicBezier, QuadraticBezier, Arc
import freetype

def render_ellipse(el, scale, sx, sy):
    cx = float(el.attrib.get("cx", 0)) * scale + sx
    cy = float(el.attrib.get("cy", 0)) * scale + sy
    rx = float(el.attrib.get("rx", 0)) * scale
    ry = float(el.attrib.get("ry", 0)) * scale
    cmds = []
    for i in range(13):
        a1 = 2 * math.pi * i / 12
        x = cx + rx * math.cos(a1)
        y = cy + ry * math.sin(a1)
        cmd = f"X{int(x*1000):07d}Y{int(y*1000):07d}"
        cmd += "D02*" if i == 0 else "D01*"
        cmds.append(cmd)
    return cmds

def render_rect(el, scale, sx, sy):
    x = float(el.attrib.get("x", 0)) * scale + sx
    y = float(el.attrib.get("y", 0)) * scale + sy
    width = float(el.attrib.get("width", 0)) * scale
    height = float(el.attrib.get("height", 0)) * scale
    cmds = [
        f"X{int(x*1000):07d}Y{int(y*1000):07d}D02*",
        f"X{int((x+width)*1000):07d}Y{int(y*1000):07d}D01*",
        f"X{int((x+width)*1000):07d}Y{int((y+height)*1000):07d}D01*",
        f"X{int(x*1000):07d}Y{int((y+height)*1000):07d}D01*",
        f"X{int(x*1000):07d}Y{int(y*1000):07d}D01*",
    ]
    return cmds

def render_circle(el, scale, sx, sy):
    el.attrib["rx"] = el.attrib.get("r", "0")
    el.attrib["ry"] = el.attrib.get("r", "0")
    return render_ellipse(el, scale, sx, sy)

def render_path(el, scale, sx, sy):
    d = el.attrib.get("d", "")
    path = parse_path(d)
    cmds = []

    for segment in path:
        if isinstance(segment, Move):
            end = segment.end
            cmds.append(f"X{int((end.real * scale + sx) * 1000):07d}Y{int((end.imag * scale + sy) * 1000):07d}D02*")
        else:
            # Approximate all segments using straight lines
            steps = 20
            for i in range(1, steps + 1):
                point = segment.point(i / steps)
                x = point.real * scale + sx
                y = point.imag * scale + sy
                cmds.append(f"X{int(x * 1000):07d}Y{int(y * 1000):07d}D01*")
    return cmds

def render_polyline(el, scale, sx, sy):
    points_str = el.attrib.get("points", "")
    points = []
    for pt in points_str.strip().split():
        try:
            x_str, y_str = pt.strip().split(",")
            x = float(x_str) * scale + sx
            y = float(y_str) * scale + sy
            points.append((x, y))
        except ValueError:
            continue
    cmds = []
    for i, (x, y) in enumerate(points):
        dcode = "D02*" if i == 0 else "D01*"
        cmds.append(f"X{int(x * 1000):07d}Y{int(y * 1000):07d}{dcode}")
    return cmds

def render_polygon(el, scale, sx, sy):
    cmds = render_polyline(el, scale, sx, sy)
    if cmds:
        cmds.append(cmds[0].replace("D02*", "D01*"))  # Close path
    return cmds

def render_line(el, scale, sx, sy):
    x1 = float(el.attrib.get("x1", 0)) * scale + sx
    y1 = float(el.attrib.get("y1", 0)) * scale + sy
    x2 = float(el.attrib.get("x2", 0)) * scale + sx
    y2 = float(el.attrib.get("y2", 0)) * scale + sy
    cmds = [
        f"X{int(x1 * 1000):07d}Y{int(y1 * 1000):07d}D02*",
        f"X{int(x2 * 1000):07d}Y{int(y2 * 1000):07d}D01*",
    ]
    return cmds

def render_text_ttf(text, font_path, at=(0, 0), size=1.0):
    try:
        face = freetype.Face(font_path)
        face.set_char_size(48 * 64)
        scale_x, scale_y = size, size
        x_cursor = 0
        y_cursor = 0
        paths = []

        for char in text:
            face.load_char(char, freetype.FT_LOAD_NO_BITMAP)
            outline = face.glyph.outline
            pts = outline.points
            tags = outline.tags
            contours = outline.contours

            start = 0
            for end in contours:
                contour = pts[start:end+1]
                if len(contour) < 2:
                    continue
                # Convert each contour to a series of line segments
                gerber = []
                for i, pt in enumerate(contour):
                    x = at[0] + (x_cursor + pt[0] / 64.0) * scale_x
                    y = at[1] - (pt[1] / 64.0) * scale_y
                    cmd = "D01*" if i > 0 else "D02*"
                    gerber.append(f"X{int(x * 1000):07d}Y{int(y * 1000):07d}{cmd}")
                paths.append(gerber)
                start = end + 1

            x_cursor += face.glyph.advance.x / 64.0

        return [item for sublist in paths for item in sublist]
    except Exception as e:
        print(f"TTF render error: {e}")
        return []

def render_svg_element(el, scale, sx, sy):
    tag = el.tag.lower()
    if tag.endswith("ellipse"):
        return render_ellipse(el, scale, sx, sy)
    elif tag.endswith("rect"):
        return render_rect(el, scale, sx, sy)
    elif tag.endswith("circle"):
        return render_circle(el, scale, sx, sy)
    elif tag.endswith("path"):
        return render_path(el, scale, sx, sy)
    elif tag.endswith("polyline"):
        return render_polyline(el, scale, sx, sy)
    elif tag.endswith("polygon"):
        return render_polygon(el, scale, sx, sy)
    elif tag.endswith("line"):
        return render_line(el, scale, sx, sy)
    else:
        return []
