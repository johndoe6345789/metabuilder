# Typthon Implementation Ideas

Technical approaches for implementing strict typing in Typthon.

---

## 1. Grammar Modifications (`Grammar/python.gram`)

### Enforce Annotations at Parse Time

```peg
# Current (optional annotations)
function_def: 'def' NAME '(' params? ')' ['->' expression] ':' block

# Strict (required annotations for non-lambdas)
function_def: 'def' NAME '(' typed_params ')' '->' expression ':' block
typed_params: typed_param (',' typed_param)* [',']
typed_param: NAME ':' expression ['=' expression]
```

**Pros**: Errors at parse time, no runtime overhead
**Cons**: Breaks all existing Python code immediately

### Alternative: Compilation Flag

```bash
typthon --strict-annotations script.ty   # Enforce at parse time
typthon --gradual script.ty              # Allow missing annotations
```

---

## 2. AST-Level Type Checking

### New Compiler Pass

Insert a type-checking pass between AST creation and bytecode generation:

```
Source → Lexer → Parser → AST → [TYPE CHECKER] → Optimizer → Bytecode
                                      ↑
                              New pass here
```

**Location**: `Python/compile.c` or new `Python/typecheck.c`

### Type Representation

```c
// Include/cpython/typeobject.h
typedef struct {
    PyObject_HEAD
    PyObject *type_name;      // "int", "list[str]", etc.
    PyObject *type_args;      // Generic args (for list[T], dict[K,V])
    int is_optional;          // None allowed?
    int is_union;             // Union type?
    PyObject *union_members;  // Members if union
} TyTypeInfo;
```

### Type Context

```c
// Track types during compilation
typedef struct {
    PyObject *locals;     // name -> TyTypeInfo
    PyObject *globals;    // name -> TyTypeInfo
    PyObject *returns;    // expected return type
    int in_function;      // inside function body?
} TyTypeContext;
```

---

## 3. Type Inference Engine

### Hindley-Milner Style Inference

For local variables, infer types from usage:

```python
def process(items: list[int]) -> int:
    total = 0           # Inferred: int (from literal)
    for x in items:     # Inferred: int (from list[int])
        total += x      # Confirmed: int += int
    return total        # Checked: int matches return type
```

### Inference Rules

```
Literal Rules:
  42        → int
  3.14      → float
  "hello"   → str
  True      → bool
  [1, 2]    → list[int]
  {"a": 1}  → dict[str, int]

Assignment Rules:
  x = expr  → x : typeof(expr)
  x: T = e  → check typeof(e) <: T

Call Rules:
  f(args)   → return_type(f) where args match param_types(f)

Iteration Rules:
  for x in iterable[T] → x : T
```

---

## 4. Type Compatibility Checking

### Subtype Relations

```c
// Is `sub` a subtype of `super`?
int TyType_IsSubtype(TyTypeInfo *sub, TyTypeInfo *super) {
    // Same type
    if (TyType_Equal(sub, super)) return 1;

    // None is subtype of Optional[T]
    if (TyType_IsNone(sub) && super->is_optional) return 1;

    // T is subtype of Optional[T]
    if (super->is_optional && TyType_IsSubtype(sub, super->base_type)) return 1;

    // Covariant generics (list[Cat] <: list[Animal] if Cat <: Animal)
    // ... careful here, depends on mutability

    // Structural subtyping for Protocols
    if (TyType_IsProtocol(super)) {
        return TyType_ImplementsProtocol(sub, super);
    }

    // Class inheritance
    return TyType_InheritsFrom(sub, super);
}
```

### Union Types

```python
def handle(x: int | str) -> None:
    if isinstance(x, int):
        # x narrowed to int here
        print(x + 1)
    else:
        # x narrowed to str here
        print(x.upper())
```

---

## 5. Null Safety Implementation

### No Implicit None

```python
# Python allows this implicitly
def bad() -> str:
    pass  # Returns None, but declared str!

# Typthon rejects this
# Error: Function may return None but return type is 'str'
```

### Optional Type Handling

```c
// In type checker
if (function_can_return_none(func) && !return_type->is_optional) {
    TyErr_TypeMismatch(
        "Function may return None but return type '%s' is not Optional",
        return_type->type_name
    );
}
```

### None Narrowing

```python
x: str | None = get_optional()

# Before check: x is str | None
if x is not None:
    # After check: x is narrowed to str
    print(x.upper())  # OK

# Outside check: x is still str | None
print(x.upper())  # Error: x might be None
```

---

## 6. Error Messages

### Helpful Diagnostics

```
Error in foo.ty:15:10

   14 |  def process(items: list[str]) -> int:
   15 |      return items[0]
                    ^^^^^^^^

TypeError: Cannot return 'str' from function declared to return 'int'

Hint: Did you mean to use 'len(items)' or convert with 'int(items[0])'?
```

### Type Diff for Complex Types

```
Error in bar.ty:42:5

TypeError: Argument type mismatch for 'process_data'

  Expected: dict[str, list[tuple[int, float]]]
  Got:      dict[str, list[tuple[int, int]]]
                                      ^^^^^
                                      float ≠ int

Hint: The second element of tuples should be 'float', not 'int'
```

---

## 7. Bytecode Optimizations

### Type-Specialized Instructions

```c
// Current: Generic add
BINARY_ADD          // Works for int, float, str, list...

// With types: Specialized versions
BINARY_ADD_INT      // int + int, no type dispatch
BINARY_ADD_FLOAT    // float + float
BINARY_ADD_STR      // str + str (concat)
```

### Skip Runtime Checks

```python
def add(x: int, y: int) -> int:
    return x + y  # Compiler knows both are int

# Generated bytecode can skip:
# - Type checking x and y
# - Dynamic dispatch for __add__
# - Result type determination
```

---

## 8. Gradual Typing Mode

### Per-Module Strictness

```python
# strict.ty
from __future__ import strict_typing  # Enable strict mode

def add(x: int, y: int) -> int:  # Required
    return x + y

# gradual.ty
# No strict_typing import - allows missing annotations

def add(x, y):  # OK in gradual mode
    return x + y
```

### Boundary Checking

```python
# When calling untyped code from typed code
from untyped_lib import mystery_func  # No stubs

result: int = mystery_func(42)
# Runtime check inserted: assert isinstance(result, int)
```

---

## 9. Integration Points

### IDE Support (LSP)

Expose type information via Language Server Protocol:
- Hover shows inferred/declared types
- Go to type definition
- Find all usages of type
- Refactoring with type awareness

### Type Stub Generation

```bash
typthon --generate-stubs mymodule.ty > mymodule.tyi
```

### C Extension Typing

```c
// In extension module
static PyObject *
fast_add(PyObject *self, PyObject *args) {
    // Declare types for Typthon
    TY_SIGNATURE("(int, int) -> int");

    int a, b;
    if (!PyArg_ParseTuple(args, "ii", &a, &b))
        return NULL;
    return PyLong_FromLong(a + b);
}
```

---

## 10. Testing Strategy

### Type System Tests

```python
# tests/typing/test_inference.ty

def test_literal_inference():
    x = 42
    assert_type(x, int)

    y = [1, 2, 3]
    assert_type(y, list[int])

def test_narrowing():
    x: int | str = get_value()

    if isinstance(x, int):
        assert_type(x, int)  # Narrowed
    else:
        assert_type(x, str)  # Narrowed
```

### Error Message Tests

```python
# tests/typing/test_errors.ty

def test_return_mismatch():
    with expect_error("TypeError: Cannot return 'str'"):
        def bad() -> int:
            return "oops"
```

---

## Priority Order

1. **AST Type Analyzer** - Foundation for everything else
2. **Basic Function Checking** - Enforce param/return types
3. **Type Inference for Locals** - Reduce annotation burden
4. **Null Safety** - Major safety win
5. **Union Types + Narrowing** - Practical necessity
6. **Generics** - list[T], dict[K,V]
7. **Protocols** - Structural subtyping
8. **Optimizations** - Performance payoff

---

## Related Files to Modify

- `Grammar/python.gram` - Syntax rules
- `Parser/parser.c` - Generated parser
- `Python/ast.c` - AST construction
- `Python/compile.c` - Compilation (add type pass)
- `Python/symtable.c` - Symbol table (add type info)
- `Include/cpython/typeobject.h` - Type representation
- `Lib/typing.py` - Standard library types

---

## References

- [CPython Internals](https://devguide.python.org/internals/)
- [MyPy Implementation](https://github.com/python/mypy)
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
- [Rust Type System](https://doc.rust-lang.org/book/ch10-00-generics.html)
- [Hindley-Milner Type Inference](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system)
