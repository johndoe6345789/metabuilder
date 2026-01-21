#ifndef Ty_CPYTHON_PYFRAME_H
#  error "this header file must not be included directly"
#endif

PyAPI_DATA(TyTypeObject) TyFrame_Type;
PyAPI_DATA(TyTypeObject) PyFrameLocalsProxy_Type;

#define TyFrame_Check(op) Ty_IS_TYPE((op), &TyFrame_Type)
#define PyFrameLocalsProxy_Check(op) Ty_IS_TYPE((op), &PyFrameLocalsProxy_Type)

PyAPI_FUNC(PyFrameObject *) TyFrame_GetBack(PyFrameObject *frame);
PyAPI_FUNC(TyObject *) TyFrame_GetLocals(PyFrameObject *frame);

PyAPI_FUNC(TyObject *) TyFrame_GetGlobals(PyFrameObject *frame);
PyAPI_FUNC(TyObject *) TyFrame_GetBuiltins(PyFrameObject *frame);

PyAPI_FUNC(TyObject *) TyFrame_GetGenerator(PyFrameObject *frame);
PyAPI_FUNC(int) TyFrame_GetLasti(PyFrameObject *frame);
PyAPI_FUNC(TyObject*) TyFrame_GetVar(PyFrameObject *frame, TyObject *name);
PyAPI_FUNC(TyObject*) TyFrame_GetVarString(PyFrameObject *frame, const char *name);

/* The following functions are for use by debuggers and other tools
 * implementing custom frame evaluators with PEP 523. */

struct _PyInterpreterFrame;

/* Returns the code object of the frame (strong reference).
 * Does not raise an exception. */
PyAPI_FUNC(TyObject *) PyUnstable_InterpreterFrame_GetCode(struct _PyInterpreterFrame *frame);

/* Returns a byte offset into the last executed instruction.
 * Does not raise an exception. */
PyAPI_FUNC(int) PyUnstable_InterpreterFrame_GetLasti(struct _PyInterpreterFrame *frame);

/* Returns the currently executing line number, or -1 if there is no line number.
 * Does not raise an exception. */
PyAPI_FUNC(int) PyUnstable_InterpreterFrame_GetLine(struct _PyInterpreterFrame *frame);

#define PyUnstable_EXECUTABLE_KIND_SKIP 0
#define PyUnstable_EXECUTABLE_KIND_PY_FUNCTION 1
#define PyUnstable_EXECUTABLE_KIND_BUILTIN_FUNCTION 3
#define PyUnstable_EXECUTABLE_KIND_METHOD_DESCRIPTOR 4
#define PyUnstable_EXECUTABLE_KINDS 5

PyAPI_DATA(const TyTypeObject *) const PyUnstable_ExecutableKinds[PyUnstable_EXECUTABLE_KINDS+1];
