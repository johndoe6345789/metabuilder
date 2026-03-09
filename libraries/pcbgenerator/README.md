# PCB Generator Repository

This repository contains the **BoardForge** project, a Python based PCB generator.

## Directory overview

```
.
├── boardforge/                        # Python package with PCB classes
├── fonts/                             # Font files used for text rendering
├── graphics/                          # Example SVG assets
├── examples/                          # Additional usage demos
├── output/                            # Generated Gerber previews
├── demo.py                            # Demo script
├── boardforge.log                     # Example log output
├── tests/                             # Pytest suite for BoardForge
├── requirements.txt                   # Python dependencies
└── pytest.ini                         # Pytest configuration
```

Log files such as `boardforge.log` may appear when running the demos.

Example scripts in the `examples/` folder demonstrate advanced usage such as
the `arduino_like.py` microcontroller board and the
`buck_boost_converter.py` power module with display and buttons.
The repository also adapts several of
[James Bowman's CuFlow project](https://github.com/jamesbowman/cuflow)
examples. Currently `cuflow_demo.py` and `cuflow_clockpwr.py` are available.
The `examples/dazzler.py` script merges the various CuFlow Dazzler demos into
a single comprehensive example. These scripts translate the original CuFlow
commands into BoardForge's higher level PCB API, showing how similar layouts
can be produced while crediting the original CuFlow work.

## Setup scripts

Scripts in the `scripts/` folder help install Python 3 and the required packages.
Run the script that matches your platform from the repository root:

- `scripts/setup_linux.sh` – for Linux distributions using apt, yum, dnf, pacman or zypper
- `scripts/setup_mac.sh` – for macOS using Homebrew
- `scripts/setup_windows.bat` – for Windows using winget or Chocolatey

Each script checks for Python 3 and then installs `requirements.txt`.

## Running the tests

Install the packages listed in `requirements.txt` before executing the test
suite:

```bash
pip install -r requirements.txt
pytest
```

The example scripts require additional libraries such as **Pillow**,
**CairoSVG** and **Shapely**, which are included in the dependency file. An
optional `requirements-dev.txt` pins the package versions used in CI.

## License

This project is licensed under the [MIT License](LICENSE).
