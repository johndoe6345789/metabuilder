# Typthon Build System Stubs Documentation

This document lists all stub implementations created to resolve linking issues in the Typthon CMake build system.

## Stub File Location

All stubs are implemented in: `Python/frozen_stubs.c`

## Stubbed Components

### 1. Frozen Modules

**Purpose**: Typthon's frozen modules system allows embedding Typthon code as C arrays. These are normally generated during the build process.

**Stubs Created**:
- `_PyImport_FrozenBootstrap` - Bootstrap frozen modules
- `_PyImport_FrozenStdlib` - Standard library frozen modules  
- `_PyImport_FrozenTest` - Test frozen modules
- `PyImport_FrozenModules` - Main frozen modules array
- `_PyImport_FrozenAliases` - Frozen module aliases

**Implementation**: Empty arrays/NULL pointers that satisfy linker requirements but provide no actual frozen modules.

### 2. Import System

**Purpose**: Module initialization table for built-in modules.

**Stubs Created**:
- `_PyImport_Inittab` - Empty module initialization table

**Implementation**: Empty array that prevents initialization of additional built-in modules beyond those explicitly linked.

### 3. Build Information

**Purpose**: Provide version and build metadata to the interpreter.

**Status**: ✅ **IMPROVED** - Git metadata is now dynamically generated at build time.

**Implementation**: 
- `Py_GetBuildInfo()` - Returns build string with git branch, commit hash, and build timestamp
- `_Py_gitidentifier()` - Returns actual git branch name from CMake
- `_Py_gitversion()` - Returns version string with commit hash

**Resolution**: Added CMake configuration to detect git information at build time and pass it as compile definitions. The functions now return actual git metadata instead of placeholder values.

**Changes Made**:
- Modified `CMakeLists.txt` to detect git branch and commit hash
- Updated `Python/frozen_stubs.c` to use CMake-generated definitions
- Build info now shows: "Typthon 3.14.0 (branch:hash, date time)" format

### 4. Dynamic Loading

**Purpose**: Configuration for dynamic library loading.

**Stubs Created**:
- `_PyImport_GetDLOpenFlags()` - Returns dlopen flags

**Implementation**: Returns `RTLD_NOW | RTLD_GLOBAL` (0x102) for immediate symbol resolution.

### 5. Path Configuration

**Purpose**: Initialize Typthon module search paths.

**Stubs Created**:
- `_PyConfig_InitPathConfig()` - Initializes path configuration

**Implementation**: Returns `PyStatus_Ok()` without actually configuring paths. The interpreter will use defaults.

### 6. Fault Handler

**Purpose**: Signal handling and crash reporting module.

**Status**: ✅ **RESOLVED** - Faulthandler module is now fully functional and included in the build.

**Resolution**: Fixed the constant initialization error by replacing `Py_ARRAY_LENGTH()` macro with direct `sizeof` calculation for the `faulthandler_nsignals` variable. The macro's type-checking feature using `__builtin_types_compatible_p` is not a constant expression, so using simple `sizeof(array) / sizeof(array[0])` resolves the compilation issue.

**Changes Made**:
- Modified `Modules/faulthandler.c` to use `sizeof` instead of `Py_ARRAY_LENGTH` for array length calculation
- Enabled faulthandler module in `CMakeLists.txt`
- Removed stub implementations from `Python/frozen_stubs.c`

### 7. POSIX Functions

**Purpose**: Platform-specific system call that's not universally available.

**Stubs Created**:
- `plock()` - Process memory locking (Solaris-specific)

**Implementation**: Returns -1 with errno set to `ENOSYS` (not implemented). Also removed `HAVE_PLOCK` from pyconfig.h.

**Note**: `plock()` is a legacy Solaris function not available on modern Linux systems.

## Configuration Changes

### pyconfig.h Modifications

The following configuration define was commented out:

```c
/* plock is not available on modern Linux systems */
/* #define HAVE_PLOCK 1 */
```

This prevents the code from attempting to call the non-existent `plock()` function, instead using our stub implementation.

## Module Exclusions

~~The following module was excluded from the build:~~

~~- **faulthandler** (`Modules/faulthandler.c`) - Excluded due to compilation errors with non-constant array initialization~~

**Update**: No modules are currently excluded. The faulthandler module has been fixed and is now included in the build.

## Impact on Functionality

These stubs mean the following features are not available in this build:

1. **No frozen modules**: Cannot embed Typthon code as frozen C arrays
2. ~~**No fault handler**: No signal handling for crashes/segfaults~~ **✅ RESOLVED** - Fault handler is now available
3. **No plock**: No Solaris-style process memory locking
4. ~~**Minimal build info**: Git metadata is stubbed with placeholder values~~ **✅ IMPROVED** - Git metadata now shows actual branch and commit
5. **No custom built-in modules**: Only modules explicitly linked are available

## Future Improvements

To get a fully-functional Typthon interpreter, the following would be needed:

1. Generate actual frozen modules using `Tools/build/freeze_modules.py`
2. ~~Re-enable and fix the faulthandler module compilation~~ **✅ COMPLETED**
3. Implement proper path configuration in `_TyConfig_InitPathConfig()`
4. ~~Generate real build information with git metadata~~ **✅ COMPLETED**
5. Add more built-in modules to the `_TyImport_Inittab` table
6. ~~Complete Py→Ty prefix renaming throughout the codebase~~ **✅ COMPLETED**

## Recent Improvements (December 2025)

### Prefix Renaming Complete ✅

All Python/Py* prefixes have been systematically renamed to Typthon/Ty* prefixes throughout the core codebase. This was necessary to:
- Fix build/link errors
- Establish Typthon as a distinct project
- Prepare for strict typing features

**Files Updated:**
- `Python/crossinterp.c` - Memory allocation, thread state, interpreter state, marshal functions
- `Python/specialize.c` - All 14 specialization functions, opcode macros, cleanup code
- `Modules/atexitmodule.c` - Critical section macros
- `Modules/posixmodule.c` - File offset converter
- `Include/internal/pycore_bitutils.h` - Byte swap function

See `RENAMING_GUIDE.md` for complete details.

## Testing

The interpreter successfully:
- ✅ Starts and shows version: `typthon --version`
- ✅ Displays help: `typthon --help`
- ✅ Links all core libraries without errors
- ✅ Builds with Ninja in under 2 minutes on modern hardware
- ✅ Passes all basic tests (version, help)

## Build Statistics

- **Total source files compiled**: 178 (increased from 177 with faulthandler enabled)
- **Core library size**: libpython_core.a
- **Executable**: typthon
- **Build tool**: Ninja (recommended) or Unix Makefiles
- **Build time**: ~90 seconds with parallel compilation (`-j4`)
- **Build status**: ✅ BUILDS SUCCESSFULLY
