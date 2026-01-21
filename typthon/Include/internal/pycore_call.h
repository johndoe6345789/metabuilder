#ifndef Ty_INTERNAL_CALL_H
#define Ty_INTERNAL_CALL_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_code.h"          // EVAL_CALL_STAT_INC_IF_FUNCTION()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_stats.h"

/* Suggested size (number of positional arguments) for arrays of TyObject*
   allocated on a C stack to avoid allocating memory on the heap memory. Such
   array is used to pass positional arguments to call functions of the
   PyObject_Vectorcall() family.

   The size is chosen to not abuse the C stack and so limit the risk of stack
   overflow. The size is also chosen to allow using the small stack for most
   function calls of the Python standard library. On 64-bit CPU, it allocates
   40 bytes on the stack. */
#define _PY_FASTCALL_SMALL_STACK 5


// Export for 'math' shared extension, used via _TyObject_VectorcallTstate()
// static inline function.
PyAPI_FUNC(TyObject*) _Ty_CheckFunctionResult(
    TyThreadState *tstate,
    TyObject *callable,
    TyObject *result,
    const char *where);

extern TyObject* _TyObject_Call_Prepend(
    TyThreadState *tstate,
    TyObject *callable,
    TyObject *obj,
    TyObject *args,
    TyObject *kwargs);

extern TyObject* _TyObject_VectorcallDictTstate(
    TyThreadState *tstate,
    TyObject *callable,
    TyObject *const *args,
    size_t nargsf,
    TyObject *kwargs);

extern TyObject* _TyObject_Call(
    TyThreadState *tstate,
    TyObject *callable,
    TyObject *args,
    TyObject *kwargs);

extern TyObject * _TyObject_CallMethodFormat(
    TyThreadState *tstate,
    TyObject *callable,
    const char *format,
    ...);

// Export for 'array' shared extension
PyAPI_FUNC(TyObject*) _TyObject_CallMethod(
    TyObject *obj,
    TyObject *name,
    const char *format, ...);

extern TyObject* _TyObject_CallMethodIdObjArgs(
    TyObject *obj,
    _Ty_Identifier *name,
    ...);

static inline TyObject *
_TyObject_VectorcallMethodId(
    _Ty_Identifier *name, TyObject *const *args,
    size_t nargsf, TyObject *kwnames)
{
    TyObject *oname = _TyUnicode_FromId(name); /* borrowed */
    if (!oname) {
        return _Py_NULL;
    }
    return PyObject_VectorcallMethod(oname, args, nargsf, kwnames);
}

static inline TyObject *
_TyObject_CallMethodIdNoArgs(TyObject *self, _Ty_Identifier *name)
{
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    return _TyObject_VectorcallMethodId(name, &self, nargsf, _Py_NULL);
}

static inline TyObject *
_TyObject_CallMethodIdOneArg(TyObject *self, _Ty_Identifier *name, TyObject *arg)
{
    TyObject *args[2] = {self, arg};
    size_t nargsf = 2 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    assert(arg != NULL);
    return _TyObject_VectorcallMethodId(name, args, nargsf, _Py_NULL);
}


/* === Vectorcall protocol (PEP 590) ============================= */

// Call callable using tp_call. Arguments are like PyObject_Vectorcall(),
// except that nargs is plainly the number of arguments without flags.
//
// Export for 'math' shared extension, used via _TyObject_VectorcallTstate()
// static inline function.
PyAPI_FUNC(TyObject*) _TyObject_MakeTpCall(
    TyThreadState *tstate,
    TyObject *callable,
    TyObject *const *args, Ty_ssize_t nargs,
    TyObject *keywords);

// Static inline variant of public PyVectorcall_Function().
static inline vectorcallfunc
_PyVectorcall_FunctionInline(TyObject *callable)
{
    assert(callable != NULL);

    TyTypeObject *tp = Ty_TYPE(callable);
    if (!TyType_HasFeature(tp, Ty_TPFLAGS_HAVE_VECTORCALL)) {
        return NULL;
    }
    assert(PyCallable_Check(callable));

    Ty_ssize_t offset = tp->tp_vectorcall_offset;
    assert(offset > 0);

    vectorcallfunc ptr;
    memcpy(&ptr, (char *) callable + offset, sizeof(ptr));
    return ptr;
}


/* Call the callable object 'callable' with the "vectorcall" calling
   convention.

   args is a C array for positional arguments.

   nargsf is the number of positional arguments plus optionally the flag
   PY_VECTORCALL_ARGUMENTS_OFFSET which means that the caller is allowed to
   modify args[-1].

   kwnames is a tuple of keyword names. The values of the keyword arguments
   are stored in "args" after the positional arguments (note that the number
   of keyword arguments does not change nargsf). kwnames can also be NULL if
   there are no keyword arguments.

   keywords must only contain strings and all keys must be unique.

   Return the result on success. Raise an exception and return NULL on
   error. */
static inline TyObject *
_TyObject_VectorcallTstate(TyThreadState *tstate, TyObject *callable,
                           TyObject *const *args, size_t nargsf,
                           TyObject *kwnames)
{
    vectorcallfunc func;
    TyObject *res;

    assert(kwnames == NULL || TyTuple_Check(kwnames));
    assert(args != NULL || PyVectorcall_NARGS(nargsf) == 0);

    func = _PyVectorcall_FunctionInline(callable);
    if (func == NULL) {
        Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
        return _TyObject_MakeTpCall(tstate, callable, args, nargs, kwnames);
    }
    res = func(callable, args, nargsf, kwnames);
    return _Ty_CheckFunctionResult(tstate, callable, res, NULL);
}


static inline TyObject *
_TyObject_CallNoArgsTstate(TyThreadState *tstate, TyObject *func) {
    return _TyObject_VectorcallTstate(tstate, func, NULL, 0, NULL);
}


// Private static inline function variant of public PyObject_CallNoArgs()
static inline TyObject *
_TyObject_CallNoArgs(TyObject *func) {
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, func);
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_VectorcallTstate(tstate, func, NULL, 0, NULL);
}


extern TyObject *const *
_PyStack_UnpackDict(TyThreadState *tstate,
    TyObject *const *args, Ty_ssize_t nargs,
    TyObject *kwargs, TyObject **p_kwnames);

extern void _PyStack_UnpackDict_Free(
    TyObject *const *stack,
    Ty_ssize_t nargs,
    TyObject *kwnames);

extern void _PyStack_UnpackDict_FreeNoDecRef(
    TyObject *const *stack,
    TyObject *kwnames);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_CALL_H */
