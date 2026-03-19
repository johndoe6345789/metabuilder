#!/usr/bin/env python3
"""Auto-generate CMakeLists.txt from project structure and cmake_config.json.

Scans QML files, C++ sources, SVG/audio assets, and package metadata to produce
a complete CMakeLists.txt for the Qt6 DBAL Observatory frontend.

Usage:
    python3 generate_cmake.py                     # Write CMakeLists.txt
    python3 generate_cmake.py --dry-run            # Print without writing
    python3 generate_cmake.py --output build.cmake # Custom output path
    python3 generate_cmake.py --config my.json     # Custom config file
"""

import argparse
import glob
import json
import os
import sys
from pathlib import Path


def load_config(config_path: str) -> dict:
    """Load and validate cmake_config.json."""
    path = Path(config_path)
    if not path.exists():
        print(f"Error: config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def find_root_qml_files(root_dir: Path) -> list[str]:
    """Find all *.qml and *.js files in the project root directory (not subdirectories)."""
    files = sorted(
        list(root_dir.glob("*.qml")) + list(root_dir.glob("*.js"))
    )
    return [f.name for f in files]


def find_qmllib_files(root_dir: Path) -> dict[str, list[str]]:
    """Find all *.qml and *.js files and qmldir files in qmllib/ subdirectories.

    Returns a dict mapping relative paths (e.g. 'qmllib/dbal/DBALProvider.qml')
    grouped by subdirectory.
    """
    qmllib_dir = root_dir / "qmllib"
    result = {"qml": [], "resources": []}
    if not qmllib_dir.exists():
        return result
    qml_files = sorted(
        list(qmllib_dir.rglob("*.qml")) + list(qmllib_dir.rglob("*.js"))
    )
    for qml_file in qml_files:
        result["qml"].append(str(qml_file.relative_to(root_dir)))
    for qmldir_file in sorted(qmllib_dir.rglob("qmldir")):
        result["resources"].append(str(qmldir_file.relative_to(root_dir)))
    return result


def find_package_qml_files(root_dir: Path) -> list[str]:
    """Find all *.qml and *.js files in packages/ subdirectories."""
    packages_dir = root_dir / "packages"
    if not packages_dir.exists():
        return []
    files = sorted(
        list(packages_dir.rglob("*.qml")) + list(packages_dir.rglob("*.js"))
    )
    return [str(f.relative_to(root_dir)) for f in files]


def load_package_metadata(root_dir: Path) -> list[dict]:
    """Read metadata.json from each packages/ subdirectory."""
    packages_dir = root_dir / "packages"
    if not packages_dir.exists():
        return []
    metadata = []
    for meta_file in sorted(packages_dir.rglob("metadata.json")):
        with open(meta_file) as f:
            data = json.load(f)
            data["_dir"] = str(meta_file.parent.relative_to(root_dir))
            metadata.append(data)
    return metadata


def find_svg_assets(root_dir: Path) -> list[str]:
    """Glob SVG assets from assets/svg/."""
    svg_dir = root_dir / "assets" / "svg"
    if not svg_dir.exists():
        return []
    files = sorted(svg_dir.glob("*.svg"))
    return [str(f.relative_to(root_dir)) for f in files]


def find_audio_assets(root_dir: Path) -> list[str]:
    """Glob audio assets from assets/audio/."""
    audio_dir = root_dir / "assets" / "audio"
    if not audio_dir.exists():
        return []
    files = sorted(audio_dir.rglob("*"))
    return [str(f.relative_to(root_dir)) for f in files if f.is_file()]


def find_config_files(root_dir: Path) -> dict[str, list[str]]:
    """Find config/ files: JS goes into QML_FILES, JSON into RESOURCES."""
    config_dir = root_dir / "config"
    result = {"qml": [], "resources": []}
    if not config_dir.exists():
        return result
    for f in sorted(config_dir.rglob("*.js")):
        result["qml"].append(str(f.relative_to(root_dir)))
    for f in sorted(config_dir.rglob("*.json")):
        result["resources"].append(str(f.relative_to(root_dir)))
    return result


def find_cpp_sources(root_dir: Path) -> dict[str, list[str]]:
    """Find all *.cpp and *.h files in src/."""
    src_dir = root_dir / "src"
    result = {"cpp": [], "h": []}
    if not src_dir.exists():
        return result
    result["cpp"] = sorted(
        str(f.relative_to(root_dir)) for f in src_dir.rglob("*.cpp")
    )
    result["h"] = sorted(
        str(f.relative_to(root_dir)) for f in src_dir.rglob("*.h")
    )
    return result


def indent_list(items: list[str], spaces: int = 8) -> str:
    """Format a list of file paths as indented CMake entries."""
    prefix = " " * spaces
    return "\n".join(f"{prefix}{item}" for item in items)


def generate_cmake(config: dict, root_dir: Path) -> str:
    """Generate the full CMakeLists.txt content from config and discovered files."""
    proj = config["project"]
    qt = config["qt"]
    cpp = config["cpp"]
    qml = config["qml"]
    features = config.get("features", {})
    compile_defs = config.get("compile_definitions", {})

    # Discover files
    root_qml = find_root_qml_files(root_dir)
    qmllib = find_qmllib_files(root_dir)
    package_qml = find_package_qml_files(root_dir)
    cpp_sources = find_cpp_sources(root_dir)
    svg_assets = find_svg_assets(root_dir)
    audio_assets = find_audio_assets(root_dir)
    packages_meta = load_package_metadata(root_dir)

    # Build Qt components string
    qt_components = " ".join(qt["components"])

    # Conditional components from features
    extra_components = []
    if features.get("qt_multimedia"):
        extra_components.append("Multimedia")

    all_components = qt["components"] + extra_components
    qt_components_str = " ".join(all_components)

    # Build source files list (main.cpp + src/*.cpp)
    source_files = ["main.cpp"]
    source_files.extend(cpp_sources["cpp"])

    # Build QML files list: root QML + qmllib QML + package QML
    all_qml_files = root_qml + qmllib["qml"] + package_qml

    # Build RESOURCES list: audio + qmllib resources (qmldir files)
    resource_files = audio_assets + qmllib["resources"]

    # Build compile definitions
    defs_lines = []
    for key, value in compile_defs.items():
        defs_lines.append(f'target_compile_definitions({proj["executable"]} PRIVATE {key}="{value}")')

    # Build link libraries
    link_libs = " ".join(f"Qt6::{c}" for c in all_components)

    # Optional feature blocks
    feature_blocks = []
    if features.get("libopenmpt"):
        feature_blocks.append(f"""
# libopenmpt support
find_package(PkgConfig REQUIRED)
pkg_check_modules(OPENMPT REQUIRED libopenmpt)
target_include_directories({proj["executable"]} PRIVATE ${{OPENMPT_INCLUDE_DIRS}})
target_link_libraries({proj["executable"]} PRIVATE ${{OPENMPT_LIBRARIES}})""")

    # Package metadata comment block
    pkg_comment_lines = []
    if packages_meta:
        pkg_comment_lines.append("# Discovered packages:")
        for meta in packages_meta:
            pkg_comment_lines.append(
                f'#   {meta.get("packageId", "unknown"):20s} '
                f'v{meta.get("version", "?")} - {meta.get("name", "")}'
            )

    # Assemble the CMakeLists.txt
    lines = []
    lines.append("# AUTO-GENERATED by generate_cmake.py — do not edit manually")
    lines.append(f"# Generated from cmake_config.json | {len(all_qml_files)} QML files, "
                 f"{len(source_files)} C++ sources, {len(svg_assets)} SVGs, "
                 f"{len(audio_assets)} audio assets")
    if pkg_comment_lines:
        lines.append("#")
        lines.extend(pkg_comment_lines)
    lines.append("")
    lines.append("cmake_minimum_required(VERSION 3.27)")
    lines.append(f'project({proj["name"]} VERSION {proj["version"]} LANGUAGES CXX)')
    lines.append("")
    lines.append(f"set(CMAKE_CXX_STANDARD {cpp['standard']})")
    lines.append("set(CMAKE_CXX_STANDARD_REQUIRED ON)")
    lines.append("set(CMAKE_EXPORT_COMPILE_COMMANDS ON)")
    lines.append("set(CMAKE_AUTOMOC ON)")
    lines.append("")
    lines.append("# MSVC: Qt requires correct __cplusplus macro value")
    lines.append("if(MSVC)")
    lines.append("    add_compile_options(/Zc:__cplusplus)")
    lines.append("endif()")
    lines.append("")
    lines.append("include(${CMAKE_BINARY_DIR}/conan_toolchain.cmake OPTIONAL)")
    lines.append("")
    lines.append(f"find_package(Qt6 COMPONENTS {qt_components_str} REQUIRED)")
    lines.append("qt_policy(SET QTP0001 NEW)")
    lines.append("")

    # qt_add_executable
    lines.append(f"qt_add_executable({proj['executable']}")
    for src in source_files:
        lines.append(f"    {src}")
    lines.append(")")
    lines.append("")

    # Compile definitions
    for d in defs_lines:
        lines.append(d)
    if defs_lines:
        lines.append("")

    # qt_add_qml_module
    lines.append(f"qt_add_qml_module({proj['executable']}")
    lines.append(f"    URI {qml['uri']}")
    lines.append(f"    VERSION {qml['version']}")
    lines.append("    QML_FILES")
    for qf in all_qml_files:
        lines.append(f"        {qf}")
    if resource_files:
        lines.append("    RESOURCES")
        for rf in resource_files:
            lines.append(f"        {rf}")
    lines.append(")")
    lines.append("")

    # SVG assets via file(GLOB) + qt_add_resources
    if svg_assets:
        lines.append("# SVG assets")
        lines.append(f"file(GLOB SVG_ASSETS RELATIVE ${{CMAKE_CURRENT_SOURCE_DIR}} assets/svg/*.svg)")
        lines.append(f'qt_add_resources({proj["executable"]} "svg_assets"')
        lines.append('    PREFIX "/"')
        lines.append("    FILES ${SVG_ASSETS}")
        lines.append(")")
        lines.append("")

    # Link libraries
    lines.append(f"target_link_libraries({proj['executable']} PRIVATE")
    lines.append(f"    {link_libs}")
    lines.append(")")
    lines.append("")

    # Feature blocks
    for block in feature_blocks:
        lines.append(block)
        lines.append("")

    # MSVC include path fix
    lines.append("# Conan Qt recipe: propagate CMAKE_INCLUDE_PATH entries for MSVC")
    lines.append("foreach(_inc ${CMAKE_INCLUDE_PATH})")
    lines.append(f'    target_include_directories({proj["executable"]} PRIVATE "${{_inc}}")')
    lines.append("endforeach()")
    lines.append("")

    # Finalize
    lines.append(f"qt_finalize_executable({proj['executable']})")
    lines.append("")

    # Ninja warning
    lines.append('if(NOT "${CMAKE_GENERATOR}" STREQUAL "Ninja")')
    lines.append("  message(")
    lines.append("    STATUS")
    lines.append(f'    "{proj["executable"]} is designed for Ninja; configure with `cmake -G Ninja` so the Conan Ninja toolchain is used."')
    lines.append("  )")
    lines.append("endif()")
    lines.append("")

    # Install
    lines.append(f"install(TARGETS {proj['executable']}")
    lines.append("    RUNTIME DESTINATION bin")
    lines.append(")")
    lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Auto-generate CMakeLists.txt from project structure and cmake_config.json.",
        epilog="Examples:\n"
               "  python3 generate_cmake.py                     # Write CMakeLists.txt\n"
               "  python3 generate_cmake.py --dry-run            # Print without writing\n"
               "  python3 generate_cmake.py --output build.cmake # Custom output\n"
               "  python3 generate_cmake.py --config my.json     # Custom config\n",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--config",
        default="cmake_config.json",
        help="Path to cmake_config.json (default: cmake_config.json)",
    )
    parser.add_argument(
        "--output",
        default="CMakeLists.txt",
        help="Output path for generated CMakeLists.txt (default: CMakeLists.txt)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print generated CMakeLists.txt to stdout without writing to disk",
    )
    parser.add_argument(
        "--root",
        default=None,
        help="Project root directory (default: directory containing this script)",
    )
    args = parser.parse_args()

    # Determine root directory
    if args.root:
        root_dir = Path(args.root).resolve()
    else:
        root_dir = Path(__file__).parent.resolve()

    # Resolve config path relative to root if not absolute
    config_path = Path(args.config)
    if not config_path.is_absolute():
        config_path = root_dir / config_path

    config = load_config(str(config_path))
    content = generate_cmake(config, root_dir)

    if args.dry_run:
        print(content)
        return

    # Resolve output path relative to root if not absolute
    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = root_dir / output_path

    with open(output_path, "w") as f:
        f.write(content)

    # Summary
    root_qml = find_root_qml_files(root_dir)
    qmllib = find_qmllib_files(root_dir)
    package_qml = find_package_qml_files(root_dir)
    cpp_sources = find_cpp_sources(root_dir)
    svg_assets = find_svg_assets(root_dir)
    audio_assets = find_audio_assets(root_dir)
    packages_meta = load_package_metadata(root_dir)

    total_qml = len(root_qml) + len(qmllib["qml"]) + len(package_qml)
    total_cpp = len(cpp_sources["cpp"]) + 1  # +1 for main.cpp

    print(f"Generated {output_path}")
    print(f"  QML files:    {total_qml} ({len(root_qml)} root, {len(qmllib['qml'])} qmllib, {len(package_qml)} packages)")
    print(f"  C++ sources:  {total_cpp} ({len(cpp_sources['cpp'])} in src/ + main.cpp)")
    print(f"  C++ headers:  {len(cpp_sources['h'])}")
    print(f"  SVG assets:   {len(svg_assets)}")
    print(f"  Audio assets: {len(audio_assets)}")
    print(f"  Packages:     {len(packages_meta)} with metadata.json")


if __name__ == "__main__":
    main()
