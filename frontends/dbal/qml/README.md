# DBAL QML Player

This small Qt Quick app renders the `FrontPage.qml` guided hero and telemetry tiles.

## Dependencies

- We resolve Qt6 and Ninja via `conanfile.txt`.
- `CMakeDeps` + `CMakeToolchain` expose the Ninja toolchain so `cmake -G Ninja` runs the same generator as Conan.

## Local build

```bash
cd frontends/dbal/qml
conan install . --output-folder=build --build=missing
cmake -S . -B build -G Ninja
cmake --build build
./build/dbal-qml
```

The `cmake` invocation purposely targets the Ninja generator and matches the toolchain that Conan emits.

## Notes

- The QML files are exposed via `qt_add_qml_module` and bundled together with the executable.
- If you forget `-G Ninja`, the CMake script prints a reminder so you can reconfigure accordingly.
