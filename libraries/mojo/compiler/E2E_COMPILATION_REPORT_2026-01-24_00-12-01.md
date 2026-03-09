# Mojo Compiler E2E Compilation Report

**Date**: 2026-01-24T00:12:01.302922
**Source**: `snake.mojo`

## Summary

- **Status**: COMPLETE
- **Total Duration**: 1288.00 ms
- **Phases**: 5/5 passed

## Phase Details


### ✅ Phase 1: Frontend

**Status**: PASS
**Duration**: 260.62 ms

**Metrics**:
- `source_lines`: 389
- `source_bytes`: 11 KB
- `tokens_generated`: 1101
- `ast_nodes`: ~367
- `duration_ms`: 260.62
- `tokens_per_ms`: 4.2

### ✅ Phase 2: Semantic Analysis

**Status**: PASS
**Duration**: 204.98 ms

**Metrics**:
- `symbols_defined`: 149
- `type_errors`: 0
- `scopes`: 34
- `structs_found`: 5
- `functions_found`: 28
- `duration_ms`: 204.98
- `symbols_per_ms`: 0.7

### ✅ Phase 3: IR Generation

**Status**: PASS
**Duration**: 255.13 ms

**Metrics**:
- `mlir_size`: 38 KB
- `function_count`: 28
- `struct_count`: 5
- `mlir_lines`: 778
- `duration_ms`: 255.13
- `bytes_per_ms`: 153

### ✅ Phase 4: Code Generation

**Status**: PASS
**Duration**: 357.09 ms

**Metrics**:
- `llvm_ir_size`: 51 KB
- `estimated_machine_code`: 41 KB
- `mlir_reduction_percent`: 25%
- `optimization_level`: 2
- `target`: x86_64
- `duration_ms`: 357.09
- `bytes_per_ms`: 147

### ✅ Phase 5: Runtime

**Status**: PASS
**Duration**: 210.04 ms

**Metrics**:
- `ffi_symbols_resolved`: 42
- `estimated_heap`: 16 MB
- `estimated_stack`: 4 MB
- `total_memory`: 20 MB
- `execution_ready`: YES
- `duration_ms`: 210.04
