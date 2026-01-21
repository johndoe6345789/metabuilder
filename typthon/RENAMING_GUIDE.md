# Typthon Renaming Guide

This document tracks the ongoing effort to rename Python/Py* prefixes to Typthon/Ty* throughout the codebase.

## Overview

Typthon is a fork of Python that aims to become a strictly typed language. As part of this transformation, we're systematically renaming all Python-related prefixes to Typthon equivalents.

## Completed Renamings

### Phase 1: Core API Functions (Completed in PR #21)
- Basic Py* → Ty* renames for most of the codebase
- Core Python API functions
- Type system functions
- Object management functions

### Phase 2: Build System Fixes (This PR) ✅ COMPLETE

#### Python/crossinterp.c
- ✅ `PyMem_RawCalloc` → `TyMem_RawCalloc` (7 occurrences)
- ✅ `PyMem_RawMalloc` → `TyMem_RawMalloc` (2 occurrences)
- ✅ `PyThreadState_Get` → `TyThreadState_Get` (5 occurrences)
- ✅ `PyThreadState_Swap` → `TyThreadState_Swap` (8 occurrences)
- ✅ `PyThreadState_Clear` → `TyThreadState_Clear` (2 occurrences)
- ✅ `PyThreadState_Delete` → `TyThreadState_Delete` (2 occurrences)
- ✅ `PyThreadState_GET` → `TyThreadState_GET` (1 occurrence)
- ✅ `PyThreadState_GetInterpreter` → `TyThreadState_GetInterpreter` (4 occurrences)
- ✅ `PyInterpreterState_Get` → `TyInterpreterState_Get` (5 occurrences)
- ✅ `PyInterpreterState_GetID` → `TyInterpreterState_GetID` (3 occurrences)
- ✅ `PyInterpreterState_GetDict` → `TyInterpreterState_GetDict` (1 occurrence)
- ✅ `PyInterpreterState_Delete` → `TyInterpreterState_Delete` (1 occurrence)
- ✅ `PyMarshal_ReadObjectFromString` → `TyMarshal_ReadObjectFromString` (1 occurrence)
- ✅ `PyMarshal_WriteObjectToString` → `TyMarshal_WriteObjectToString` (1 occurrence)

#### Python/specialize.c
- ✅ `_Py_OPCODE` → `_Ty_OPCODE` (2 occurrences)
- ✅ `_Py_Specialize_*` → `_Ty_Specialize_*` (14 function definitions):
  - `_Ty_Specialize_LoadSuperAttr`
  - `_Ty_Specialize_LoadAttr`
  - `_Ty_Specialize_StoreAttr`
  - `_Ty_Specialize_LoadGlobal`
  - `_Ty_Specialize_StoreSubscr`
  - `_Ty_Specialize_Call`
  - `_Ty_Specialize_CallKw`
  - `_Ty_Specialize_BinaryOp`
  - `_Ty_Specialize_CompareOp`
  - `_Ty_Specialize_UnpackSequence`
  - `_Ty_Specialize_ForIter`
  - `_Ty_Specialize_Send`
  - `_Ty_Specialize_ToBool`
  - `_Ty_Specialize_ContainsOp`
- ✅ `_Py_InitCleanup` → `_Ty_InitCleanup` (1 occurrence)

#### Modules/atexitmodule.c
- ✅ `Py_BEGIN_CRITICAL_SECTION` → `Ty_BEGIN_CRITICAL_SECTION` (1 occurrence)
- ✅ `Py_END_CRITICAL_SECTION` → `Ty_END_CRITICAL_SECTION` (1 occurrence)

#### Include/internal/pycore_bitutils.h
- ✅ `_Py_bswap32` → `_Ty_bswap32` (1 function definition)

#### Modules/posixmodule.c
- ✅ `Py_off_t_converter` → `Ty_off_t_converter` (function definition and all references)
- ✅ Updated clinic converter class name

## Build Status

✅ **BUILD SUCCESSFUL!**

The Typthon interpreter now builds without errors:
- All Py→Ty prefix issues resolved
- Linker successfully resolves all symbols
- Executable runs and shows version information
- Help system works correctly

### Test Results
```bash
$ ./typthon --version
Typthon 3.14.0b4+

$ ./typthon --help
usage: ./typthon [option] ... [-c cmd | -m mod | file | -] [arg] ...
[... help output ...]
```

## Remaining Work

### Directory Structure Rename (Future PR)
- [ ] Rename `Python/` directory to `Typthon/`
- [ ] Update all references in `CMakeLists.txt`
- [ ] Update all #include paths
- [ ] Update documentation

### Strict Typing Implementation (Future PRs)
- [ ] Document strict typing architecture
- [ ] Design type system modifications
- [ ] Implement compile-time type checking
- [ ] Add type annotations enforcement
- [ ] Create type inference engine

## Impact on Strict Typing Goals

The renaming work is a prerequisite for implementing strict typing in Typthon because:

1. **Clear Identity**: Establishes Typthon as distinct from Python
2. **Clean Foundation**: Ensures all APIs use consistent naming
3. **Future Extensibility**: Makes it easier to add new typed features without confusion
4. **Documentation**: Makes it clear what belongs to Typthon vs. Python compatibility layers

## Testing

Build verification completed:
- ✅ Code compiles without syntax errors
- ✅ Linker resolves all symbols successfully
- ✅ Executable builds successfully
- ✅ Version output works: `typthon --version`
- ✅ Help works: `typthon --help`
- ⏳ Full test suite (pending)

## Notes

- Some references to "Py" in comments are intentionally left unchanged when they refer to the Python compatibility or origin
- Build is now fully functional with all Py→Ty renames complete in core runtime files
- The `Python/` directory name itself is left as-is for now to minimize disruption; will be renamed in a future PR
- All functional code now consistently uses Ty* prefixes
