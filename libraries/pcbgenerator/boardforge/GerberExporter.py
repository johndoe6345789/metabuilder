import os
import zipfile
import shutil
import math
from pathlib import Path

def export_gerbers(board, output_zip_path):
    """
    Export board layers as Gerber files and compress them into a ZIP archive.
    
    Args:
        board: Object containing layer data with 'layers' attribute (dict) and save_svg_previews method
        output_zip_path: Path where the ZIP file will be saved
    """
    try:
        # Convert to Path object for better path handling
        output_zip_path = Path(output_zip_path)
        # Ensure parent directory exists
        output_zip_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create temporary directory for Gerber files
        temp_dir = output_zip_path.parent / "temp_gerbers"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate Gerber files for each layer
        for layer_name, content in board.layers.items():
            filename = temp_dir / f"{layer_name}.gbr"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"G04 {layer_name} *\n")
                # Ensure content is iterable and handle potential None values
                if content:
                    for line in content:
                        if isinstance(line, tuple) and line[0] == "TRACE":
                            pin1, pin2 = line[1], line[2]
                            # Optional width stored at line[3]
                            x1 = int(pin1.x * 1000)
                            y1 = int(pin1.y * 1000)
                            x2 = int(pin2.x * 1000)
                            y2 = int(pin2.y * 1000)
                            f.write(f"X{x1:07d}Y{y1:07d}D02*\n")
                            f.write(f"X{x2:07d}Y{y2:07d}D01*\n")
                        elif isinstance(line, tuple) and line[0] == "TRACE_PATH":
                            segments = line[1]
                            for seg in segments:
                                if seg[0] == "LINE":
                                    s, e = seg[1], seg[2]
                                    x1 = int(s[0] * 1000)
                                    y1 = int(s[1] * 1000)
                                    x2 = int(e[0] * 1000)
                                    y2 = int(e[1] * 1000)
                                    f.write(f"X{x1:07d}Y{y1:07d}D02*\n")
                                    f.write(f"X{x2:07d}Y{y2:07d}D01*\n")
                                elif seg[0] == "ARC":
                                    s, e, r, ang = seg[1], seg[2], seg[3], seg[4]
                                    params = board._arc_params(s, e, r, ang)
                                    if params is not None:
                                        cx, cy, a1, a2 = params
                                        steps = max(8, int(abs(ang) / 10))
                                        for i in range(steps + 1):
                                            t = a1 + (a2 - a1) * i / steps
                                            rad = math.radians(t)
                                            x = cx + r * math.cos(rad)
                                            y = cy + r * math.sin(rad)
                                            code = "D02*" if i == 0 else "D01*"
                                            f.write(f"X{int(x*1000):07d}Y{int(y*1000):07d}{code}\n")
                                elif seg[0] == "BEZIER":
                                    from svg.path import CubicBezier
                                    s, c1, c2, e = seg[1], seg[2], seg[3], seg[4]
                                    cb = CubicBezier(complex(*s), complex(*c1), complex(*c2), complex(*e))
                                    steps = 20
                                    prev = cb.point(0)
                                    for i in range(1, steps + 1):
                                        pt = cb.point(i / steps)
                                        x1 = int(prev.real * 1000)
                                        y1 = int(prev.imag * 1000)
                                        x2 = int(pt.real * 1000)
                                        y2 = int(pt.imag * 1000)
                                        f.write(f"X{x1:07d}Y{y1:07d}D02*\n")
                                        f.write(f"X{x2:07d}Y{y2:07d}D01*\n")
                                        prev = pt
                        else:
                            f.write(f"{line}\n")

        # Board outline layer
        if getattr(board, "outline_geom", None) is not None:
            outline_path = temp_dir / "GKO.gbr"
            with open(outline_path, "w", encoding="utf-8") as f:
                f.write("G04 GKO *\n")
                coords = list(board.outline_geom.exterior.coords)
                for i, (x, y) in enumerate(coords):
                    code = "D02*" if i == 0 else "D01*"
                    f.write(f"X{int(x*1000):07d}Y{int(y*1000):07d}{code}\n")

        # Drill/hole file
        if getattr(board, "holes", None):
            holes_path = temp_dir / "holes.gbr"
            with open(holes_path, "w", encoding="utf-8") as f:
                f.write("G04 holes *\n")
                for hx, hy, dia, ann in board.holes:
                    r = dia / 2.0
                    for i in range(13):
                        a = 2 * math.pi * i / 12
                        x = hx + r * math.cos(a)
                        y = hy + r * math.sin(a)
                        code = "D02*" if i == 0 else "D01*"
                        f.write(f"X{int(x*1000):07d}Y{int(y*1000):07d}{code}\n")
                    if ann is not None:
                        rr = r + ann
                        for i in range(13):
                            a = 2 * math.pi * i / 12
                            x = hx + rr * math.cos(a)
                            y = hy + rr * math.sin(a)
                            code = "D02*" if i == 0 else "D01*"
                            f.write(f"X{int(x*1000):07d}Y{int(y*1000):07d}{code}\n")
        
        # Save SVG previews if the method exists
        if hasattr(board, 'save_svg_previews'):
            board.save_svg_previews(str(temp_dir))
        
        # Prepare exploded output directory and ZIP archive
        exploded_dir = output_zip_path.parent / output_zip_path.stem
        exploded_dir.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file_path in temp_dir.glob("*"):
                if file_path.is_file():
                    zipf.write(file_path, file_path.name)
                    shutil.copy(file_path, exploded_dir / file_path.name)
    
    except Exception as e:
        print(f"Error during Gerber export: {str(e)}")
        raise
    
    finally:
        # Clean up temporary directory
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
