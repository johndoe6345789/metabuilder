# Project Roadmap

This file outlines the planned features and the list of completed items for **BoardForge**.

## Completed Features
- Programmatic PCB generation with `Board`, `Component`, and `Pin` classes.
- Routing helpers including bent traces and layer stack configuration.
- Importing SVG artwork and TrueType fonts for silkscreen graphics.
- Export of layered Gerber files into a ZIP archive along with optional preview PNGs.
- Helper functions to generate common circuits and example boards.
- Example boards: Arduino‑like MCU board, ESP32 dev board, buck/boost converter.
- GitHub Actions integration with a full pytest suite (18 tests).

## Planned Roadmap
1. **Design Rule Checking (DRC)**
   - Implement clearance and trace width checks.
   - Provide warnings before Gerber export.
2. **Component Library Expansion**
   - Add footprints for popular sensors and connectors.
   - Include parameterized components (resistor networks, switch arrays).
3. **Autorouting Utilities**
   - Basic auto‑router for simple two‑layer designs.
   - Interactive CLI commands for incremental routing.
4. **3D Board Previews**
   - Generate simple STEP models for integration with mechanical CAD.
   - Preview board assembly in a built‑in viewer.
5. **KiCad Integration**
   - Import existing KiCad projects as BoardForge scripts.
   - Export to KiCad for manual adjustments.
6. **Panelization Tools**
   - Arrange multiple boards into manufacturing panels.
   - Support V‑groove and mouse‑bite breakouts.

The roadmap above is speculative and may evolve as the project grows. Contributions and suggestions are welcome!
