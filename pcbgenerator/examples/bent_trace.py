from pathlib import Path
from boardforge import create_bent_trace

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR.parent / "output"


def main():
    # Use the default 90-degree path.  Pass a list of points to ``path`` to
    # customise the route.
    board = create_bent_trace()
    # Example customisation:
    # board = create_bent_trace(path=[(0.5, 2.5), (2.5, 4.5), (4.5, 2.5)])

    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(str(OUTPUT_DIR / "bent_trace.zip"))


if __name__ == "__main__":
    main()
