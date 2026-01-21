#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgsTstate()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCallTstate()
#include "pycore_dict.h"          // _TyDict_FromItems()
#include "pycore_function.h"      // _TyFunction_Vectorcall() definition
#include "pycore_modsupport.h"    // _Ty_VaBuildStack()
#include "pycore_object.h"        // _PyCFunctionWithKeywords_TrampolineCall()
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_tuple.h"         // _TyTuple_ITEMS()


static TyObject *
null_error(TyThreadState *tstate)
{
    if (!_TyErr_Occurred(tstate)) {
        _TyErr_SetString(tstate, TyExc_SystemError,
                         "null argument to internal routine");
    }
    return NULL;
}


TyObject*
_Ty_CheckFunctionResult(TyThreadState *tstate, TyObject *callable,
                        TyObject *result, const char *where)
{
    assert((callable != NULL) ^ (where != NULL));

    if (result == NULL) {
        if (!_TyErr_Occurred(tstate)) {
            if (callable)
                _TyErr_Format(tstate, TyExc_SystemError,
                              "%R returned NULL without setting an exception",
                              callable);
            else
                _TyErr_Format(tstate, TyExc_SystemError,
                              "%s returned NULL without setting an exception",
                              where);
#ifdef Ty_DEBUG
            /* Ensure that the bug is caught in debug mode.
               Ty_FatalError() logs the SystemError exception raised above. */
            Ty_FatalError("a function returned NULL without setting an exception");
#endif
            return NULL;
        }
    }
    else {
        if (_TyErr_Occurred(tstate)) {
            Ty_DECREF(result);

            if (callable) {
                _TyErr_FormatFromCauseTstate(
                    tstate, TyExc_SystemError,
                    "%R returned a result with an exception set", callable);
            }
            else {
                _TyErr_FormatFromCauseTstate(
                    tstate, TyExc_SystemError,
                    "%s returned a result with an exception set", where);
            }
#ifdef Ty_DEBUG
            /* Ensure that the bug is caught in debug mode.
               Ty_FatalError() logs the SystemError exception raised above. */
            Ty_FatalError("a function returned a result with an exception set");
#endif
            return NULL;
        }
    }
    return result;
}


int
_Ty_CheckSlotResult(TyObject *obj, const char *slot_name, int success)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (!success) {
        if (!_TyErr_Occurred(tstate)) {
            _Ty_FatalErrorFormat(__func__,
                                 "Slot %s of type %s failed "
                                 "without setting an exception",
                                 slot_name, Ty_TYPE(obj)->tp_name);
        }
    }
    else {
        if (_TyErr_Occurred(tstate)) {
            _Ty_FatalErrorFormat(__func__,
                                 "Slot %s of type %s succeeded "
                                 "with an exception set",
                                 slot_name, Ty_TYPE(obj)->tp_name);
        }
    }
    return 1;
}


/* --- Core TyObject call functions ------------------------------- */

/* Call a callable Python object without any arguments */
TyObject *
PyObject_CallNoArgs(TyObject *func)
{
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, func);
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_VectorcallTstate(tstate, func, NULL, 0, NULL);
}


TyObject *
_TyObject_VectorcallDictTstate(TyThreadState *tstate, TyObject *callable,
                               TyObject *const *args, size_t nargsf,
                               TyObject *kwargs)
{
    assert(callable != NULL);

    /* PyObject_VectorcallDict() must not be called with an exception set,
       because it can clear it (directly or indirectly) and so the
       caller loses its exception */
    assert(!_TyErr_Occurred(tstate));

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    assert(nargs >= 0);
    assert(nargs == 0 || args != NULL);
    assert(kwargs == NULL || TyDict_Check(kwargs));

    vectorcallfunc func = PyVectorcall_Function(callable);
    if (func == NULL) {
        /* Use tp_call instead */
        return _TyObject_MakeTpCall(tstate, callable, args, nargs, kwargs);
    }

    TyObject *res;
    if (kwargs == NULL || TyDict_GET_SIZE(kwargs) == 0) {
        res = func(callable, args, nargsf, NULL);
    }
    else {
        TyObject *kwnames;
        TyObject *const *newargs;
        newargs = _PyStack_UnpackDict(tstate,
                                      args, nargs,
                                      kwargs, &kwnames);
        if (newargs == NULL) {
            return NULL;
        }
        res = func(callable, newargs,
                   nargs | PY_VECTORCALL_ARGUMENTS_OFFSET, kwnames);
        _PyStack_UnpackDict_Free(newargs, nargs, kwnames);
    }
    return _Ty_CheckFunctionResult(tstate, callable, res, NULL);
}


TyObject *
PyObject_VectorcallDict(TyObject *callable, TyObject *const *args,
                       size_t nargsf, TyObject *kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_VectorcallDictTstate(tstate, callable, args, nargsf, kwargs);
}

static void
object_is_not_callable(TyThreadState *tstate, TyObject *callable)
{
    if (Ty_IS_TYPE(callable, &TyModule_Type)) {
        // >>> import pprint
        // >>> pprint(thing)
        // Traceback (most recent call last):
        //   File "<stdin>", line 1, in <module>
        // TypeError: 'module' object is not callable. Did you mean: 'pprint.pprint(...)'?
        TyObject *name = TyModule_GetNameObject(callable);
        if (name == NULL) {
            _TyErr_Clear(tstate);
            goto basic_type_error;
        }
        TyObject *attr;
        int res = PyObject_GetOptionalAttr(callable, name, &attr);
        if (res < 0) {
            _TyErr_Clear(tstate);
        }
        else if (res > 0 && PyCallable_Check(attr)) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "'%.200s' object is not callable. "
                          "Did you mean: '%U.%U(...)'?",
                          Ty_TYPE(callable)->tp_name, name, name);
            Ty_DECREF(attr);
            Ty_DECREF(name);
            return;
        }
        Ty_XDECREF(attr);
        Ty_DECREF(name);
    }
basic_type_error:
    _TyErr_Format(tstate, TyExc_TypeError, "'%.200s' object is not callable",
                  Ty_TYPE(callable)->tp_name);
}


TyObject *
_TyObject_MakeTpCall(TyThreadState *tstate, TyObject *callable,
                     TyObject *const *args, Ty_ssize_t nargs,
                     TyObject *keywords)
{
    assert(nargs >= 0);
    assert(nargs == 0 || args != NULL);
    assert(keywords == NULL || TyTuple_Check(keywords) || TyDict_Check(keywords));

    /* Slow path: build a temporary tuple for positional arguments and a
     * temporary dictionary for keyword arguments (if any) */
    ternaryfunc call = Ty_TYPE(callable)->tp_call;
    if (call == NULL) {
        object_is_not_callable(tstate, callable);
        return NULL;
    }

    TyObject *argstuple = _TyTuple_FromArray(args, nargs);
    if (argstuple == NULL) {
        return NULL;
    }

    TyObject *kwdict;
    if (keywords == NULL || TyDict_Check(keywords)) {
        kwdict = keywords;
    }
    else {
        if (TyTuple_GET_SIZE(keywords)) {
            assert(args != NULL);
            kwdict = _PyStack_AsDict(args + nargs, keywords);
            if (kwdict == NULL) {
                Ty_DECREF(argstuple);
                return NULL;
            }
        }
        else {
            keywords = kwdict = NULL;
        }
    }

    TyObject *result = NULL;
    if (_Ty_EnterRecursiveCallTstate(tstate, " while calling a Python object") == 0)
    {
        result = _PyCFunctionWithKeywords_TrampolineCall(
            (PyCFunctionWithKeywords)call, callable, argstuple, kwdict);
        _Ty_LeaveRecursiveCallTstate(tstate);
    }

    Ty_DECREF(argstuple);
    if (kwdict != keywords) {
        Ty_DECREF(kwdict);
    }

    return _Ty_CheckFunctionResult(tstate, callable, result, NULL);
}


vectorcallfunc
PyVectorcall_Function(TyObject *callable)
{
    return _PyVectorcall_FunctionInline(callable);
}


static TyObject *
_PyVectorcall_Call(TyThreadState *tstate, vectorcallfunc func,
                   TyObject *callable, TyObject *tuple, TyObject *kwargs)
{
    assert(func != NULL);

    Ty_ssize_t nargs = TyTuple_GET_SIZE(tuple);

    /* Fast path for no keywords */
    if (kwargs == NULL || TyDict_GET_SIZE(kwargs) == 0) {
        return func(callable, _TyTuple_ITEMS(tuple), nargs, NULL);
    }

    /* Convert arguments & call */
    TyObject *const *args;
    TyObject *kwnames;
    args = _PyStack_UnpackDict(tstate,
                               _TyTuple_ITEMS(tuple), nargs,
                               kwargs, &kwnames);
    if (args == NULL) {
        return NULL;
    }
    TyObject *result = func(callable, args,
                            nargs | PY_VECTORCALL_ARGUMENTS_OFFSET, kwnames);
    _PyStack_UnpackDict_Free(args, nargs, kwnames);

    return _Ty_CheckFunctionResult(tstate, callable, result, NULL);
}


TyObject *
PyVectorcall_Call(TyObject *callable, TyObject *tuple, TyObject *kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();

    /* get vectorcallfunc as in _PyVectorcall_Function, but without
     * the Ty_TPFLAGS_HAVE_VECTORCALL check */
    Ty_ssize_t offset = Ty_TYPE(callable)->tp_vectorcall_offset;
    if (offset <= 0) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "'%.200s' object does not support vectorcall",
                      Ty_TYPE(callable)->tp_name);
        return NULL;
    }
    assert(PyCallable_Check(callable));

    vectorcallfunc func;
    memcpy(&func, (char *) callable + offset, sizeof(func));
    if (func == NULL) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "'%.200s' object does not support vectorcall",
                      Ty_TYPE(callable)->tp_name);
        return NULL;
    }

    return _PyVectorcall_Call(tstate, func, callable, tuple, kwargs);
}


TyObject *
PyObject_Vectorcall(TyObject *callable, TyObject *const *args,
                     size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_VectorcallTstate(tstate, callable,
                                      args, nargsf, kwnames);
}


TyObject *
_TyObject_Call(TyThreadState *tstate, TyObject *callable,
               TyObject *args, TyObject *kwargs)
{
    ternaryfunc call;
    TyObject *result;

    /* PyObject_Call() must not be called with an exception set,
       because it can clear it (directly or indirectly) and so the
       caller loses its exception */
    assert(!_TyErr_Occurred(tstate));
    assert(TyTuple_Check(args));
    assert(kwargs == NULL || TyDict_Check(kwargs));
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, callable);
    vectorcallfunc vector_func = PyVectorcall_Function(callable);
    if (vector_func != NULL) {
        return _PyVectorcall_Call(tstate, vector_func, callable, args, kwargs);
    }
    else {
        call = Ty_TYPE(callable)->tp_call;
        if (call == NULL) {
            object_is_not_callable(tstate, callable);
            return NULL;
        }

        if (_Ty_EnterRecursiveCallTstate(tstate, " while calling a Python object")) {
            return NULL;
        }

        result = (*call)(callable, args, kwargs);

        _Ty_LeaveRecursiveCallTstate(tstate);

        return _Ty_CheckFunctionResult(tstate, callable, result, NULL);
    }
}

TyObject *
PyObject_Call(TyObject *callable, TyObject *args, TyObject *kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_Call(tstate, callable, args, kwargs);
}


/* Function removed in the Python 3.13 API but kept in the stable ABI. */
PyAPI_FUNC(TyObject *)
PyCFunction_Call(TyObject *callable, TyObject *args, TyObject *kwargs)
{
    return PyObject_Call(callable, args, kwargs);
}


TyObject *
PyObject_CallOneArg(TyObject *func, TyObject *arg)
{
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, func);
    assert(arg != NULL);
    TyObject *_args[2];
    TyObject **args = _args + 1;  // For PY_VECTORCALL_ARGUMENTS_OFFSET
    args[0] = arg;
    TyThreadState *tstate = _TyThreadState_GET();
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    return _TyObject_VectorcallTstate(tstate, func, args, nargsf, NULL);
}


/* --- PyFunction call functions ---------------------------------- */

TyObject *
_TyFunction_Vectorcall(TyObject *func, TyObject* const* stack,
                       size_t nargsf, TyObject *kwnames)
{
    assert(TyFunction_Check(func));
    PyFunctionObject *f = (PyFunctionObject *)func;
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    assert(nargs >= 0);
    TyThreadState *tstate = _TyThreadState_GET();
    assert(nargs == 0 || stack != NULL);
    EVAL_CALL_STAT_INC(EVAL_CALL_FUNCTION_VECTORCALL);
    if (((PyCodeObject *)f->func_code)->co_flags & CO_OPTIMIZED) {
        return _TyEval_Vector(tstate, f, NULL, stack, nargs, kwnames);
    }
    else {
        return _TyEval_Vector(tstate, f, f->func_globals, stack, nargs, kwnames);
    }
}

/* --- More complex call functions -------------------------------- */

/* External interface to call any callable object.
   The args must be a tuple or NULL.  The kwargs must be a dict or NULL.
   Function removed in Python 3.13 API but kept in the stable ABI. */
PyAPI_FUNC(TyObject*)
TyEval_CallObjectWithKeywords(TyObject *callable,
                              TyObject *args, TyObject *kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    /* TyEval_CallObjectWithKeywords() must not be called with an exception
       set. It raises a new exception if parameters are invalid or if
       TyTuple_New() fails, and so the original exception is lost. */
    assert(!_TyErr_Occurred(tstate));
#endif

    if (args != NULL && !TyTuple_Check(args)) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "argument list must be a tuple");
        return NULL;
    }

    if (kwargs != NULL && !TyDict_Check(kwargs)) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "keyword list must be a dictionary");
        return NULL;
    }

    if (args == NULL) {
        return _TyObject_VectorcallDictTstate(tstate, callable,
                                              NULL, 0, kwargs);
    }
    else {
        return _TyObject_Call(tstate, callable, args, kwargs);
    }
}


TyObject *
PyObject_CallObject(TyObject *callable, TyObject *args)
{
    TyThreadState *tstate = _TyThreadState_GET();
    assert(!_TyErr_Occurred(tstate));
    if (args == NULL) {
        return _TyObject_CallNoArgsTstate(tstate, callable);
    }
    if (!TyTuple_Check(args)) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "argument list must be a tuple");
        return NULL;
    }
    return _TyObject_Call(tstate, callable, args, NULL);
}


/* Call callable(obj, *args, **kwargs). */
TyObject *
_TyObject_Call_Prepend(TyThreadState *tstate, TyObject *callable,
                       TyObject *obj, TyObject *args, TyObject *kwargs)
{
    assert(TyTuple_Check(args));

    TyObject *small_stack[_PY_FASTCALL_SMALL_STACK];
    TyObject **stack;

    Ty_ssize_t argcount = TyTuple_GET_SIZE(args);
    if (argcount + 1 <= (Ty_ssize_t)Ty_ARRAY_LENGTH(small_stack)) {
        stack = small_stack;
    }
    else {
        stack = TyMem_Malloc((argcount + 1) * sizeof(TyObject *));
        if (stack == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
    }

    /* use borrowed references */
    stack[0] = obj;
    memcpy(&stack[1],
           _TyTuple_ITEMS(args),
           argcount * sizeof(TyObject *));

    TyObject *result = _TyObject_VectorcallDictTstate(tstate, callable,
                                                      stack, argcount + 1,
                                                      kwargs);
    if (stack != small_stack) {
        TyMem_Free(stack);
    }
    return result;
}


/* --- Call with a format string ---------------------------------- */

static TyObject *
_TyObject_CallFunctionVa(TyThreadState *tstate, TyObject *callable,
                         const char *format, va_list va)
{
    TyObject* small_stack[_PY_FASTCALL_SMALL_STACK];
    const Ty_ssize_t small_stack_len = Ty_ARRAY_LENGTH(small_stack);
    TyObject **stack;
    Ty_ssize_t nargs, i;
    TyObject *result;

    if (callable == NULL) {
        return null_error(tstate);
    }

    if (!format || !*format) {
        return _TyObject_CallNoArgsTstate(tstate, callable);
    }

    stack = _Ty_VaBuildStack(small_stack, small_stack_len,
                             format, va, &nargs);
    if (stack == NULL) {
        return NULL;
    }
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, callable);
    if (nargs == 1 && TyTuple_Check(stack[0])) {
        /* Special cases for backward compatibility:
           - PyObject_CallFunction(func, "O", tuple) calls func(*tuple)
           - PyObject_CallFunction(func, "(OOO)", arg1, arg2, arg3) calls
             func(*(arg1, arg2, arg3)): func(arg1, arg2, arg3) */
        TyObject *args = stack[0];
        result = _TyObject_VectorcallTstate(tstate, callable,
                                            _TyTuple_ITEMS(args),
                                            TyTuple_GET_SIZE(args),
                                            NULL);
    }
    else {
        result = _TyObject_VectorcallTstate(tstate, callable,
                                            stack, nargs, NULL);
    }

    for (i = 0; i < nargs; ++i) {
        Ty_DECREF(stack[i]);
    }
    if (stack != small_stack) {
        TyMem_Free(stack);
    }
    return result;
}


TyObject *
PyObject_CallFunction(TyObject *callable, const char *format, ...)
{
    va_list va;
    TyObject *result;
    TyThreadState *tstate = _TyThreadState_GET();

    va_start(va, format);
    result = _TyObject_CallFunctionVa(tstate, callable, format, va);
    va_end(va);

    return result;
}


/* TyEval_CallFunction is exact copy of PyObject_CallFunction.
   Function removed in Python 3.13 API but kept in the stable ABI. */
PyAPI_FUNC(TyObject*)
TyEval_CallFunction(TyObject *callable, const char *format, ...)
{
    va_list va;
    TyObject *result;
    TyThreadState *tstate = _TyThreadState_GET();

    va_start(va, format);
    result = _TyObject_CallFunctionVa(tstate, callable, format, va);
    va_end(va);

    return result;
}


/* _TyObject_CallFunction_SizeT is exact copy of PyObject_CallFunction.
 * This function must be kept because it is part of the stable ABI.
 */
PyAPI_FUNC(TyObject *)  /* abi_only */
_TyObject_CallFunction_SizeT(TyObject *callable, const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();

    va_list va;
    va_start(va, format);
    TyObject *result = _TyObject_CallFunctionVa(tstate, callable, format, va);
    va_end(va);

    return result;
}


static TyObject*
callmethod(TyThreadState *tstate, TyObject* callable, const char *format, va_list va)
{
    assert(callable != NULL);
    if (!PyCallable_Check(callable)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "attribute of type '%.200s' is not callable",
                      Ty_TYPE(callable)->tp_name);
        return NULL;
    }

    return _TyObject_CallFunctionVa(tstate, callable, format, va);
}

TyObject *
PyObject_CallMethod(TyObject *obj, const char *name, const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();

    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = PyObject_GetAttrString(obj, name);
    if (callable == NULL) {
        return NULL;
    }

    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);

    Ty_DECREF(callable);
    return retval;
}


/* TyEval_CallMethod is exact copy of PyObject_CallMethod.
   Function removed in Python 3.13 API but kept in the stable ABI. */
PyAPI_FUNC(TyObject*)
TyEval_CallMethod(TyObject *obj, const char *name, const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = PyObject_GetAttrString(obj, name);
    if (callable == NULL) {
        return NULL;
    }

    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);

    Ty_DECREF(callable);
    return retval;
}


TyObject *
_TyObject_CallMethod(TyObject *obj, TyObject *name,
                     const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = PyObject_GetAttr(obj, name);
    if (callable == NULL) {
        return NULL;
    }

    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);

    Ty_DECREF(callable);
    return retval;
}


TyObject *
_TyObject_CallMethodId(TyObject *obj, _Ty_Identifier *name,
                       const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = _TyObject_GetAttrId(obj, name);
    if (callable == NULL) {
        return NULL;
    }

    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);

    Ty_DECREF(callable);
    return retval;
}


TyObject * _TyObject_CallMethodFormat(TyThreadState *tstate, TyObject *callable,
                                      const char *format, ...)
{
    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);
    return retval;
}


// _TyObject_CallMethod_SizeT is exact copy of PyObject_CallMethod.
// This function must be kept because it is part of the stable ABI.
PyAPI_FUNC(TyObject *)  /* abi_only */
_TyObject_CallMethod_SizeT(TyObject *obj, const char *name,
                           const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = PyObject_GetAttrString(obj, name);
    if (callable == NULL) {
        return NULL;
    }

    va_list va;
    va_start(va, format);
    TyObject *retval = callmethod(tstate, callable, format, va);
    va_end(va);

    Ty_DECREF(callable);
    return retval;
}


/* --- Call with "..." arguments ---------------------------------- */

static TyObject *
object_vacall(TyThreadState *tstate, TyObject *base,
              TyObject *callable, va_list vargs)
{
    TyObject *small_stack[_PY_FASTCALL_SMALL_STACK];
    TyObject **stack;
    Ty_ssize_t nargs;
    TyObject *result;
    Ty_ssize_t i;
    va_list countva;

    if (callable == NULL) {
        return null_error(tstate);
    }

    /* Count the number of arguments */
    va_copy(countva, vargs);
    nargs = base ? 1 : 0;
    while (1) {
        TyObject *arg = va_arg(countva, TyObject *);
        if (arg == NULL) {
            break;
        }
        nargs++;
    }
    va_end(countva);

    /* Copy arguments */
    if (nargs <= (Ty_ssize_t)Ty_ARRAY_LENGTH(small_stack)) {
        stack = small_stack;
    }
    else {
        stack = TyMem_Malloc(nargs * sizeof(stack[0]));
        if (stack == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
    }

    i = 0;
    if (base) {
        stack[i++] = base;
    }

    for (; i < nargs; ++i) {
        stack[i] = va_arg(vargs, TyObject *);
    }

#ifdef Ty_STATS
    if (TyFunction_Check(callable)) {
        EVAL_CALL_STAT_INC(EVAL_CALL_API);
    }
#endif
    /* Call the function */
    result = _TyObject_VectorcallTstate(tstate, callable, stack, nargs, NULL);

    if (stack != small_stack) {
        TyMem_Free(stack);
    }
    return result;
}


TyObject *
PyObject_VectorcallMethod(TyObject *name, TyObject *const *args,
                           size_t nargsf, TyObject *kwnames)
{
    assert(name != NULL);
    assert(args != NULL);
    assert(PyVectorcall_NARGS(nargsf) >= 1);

    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *callable = NULL;
    /* Use args[0] as "self" argument */
    int unbound = _TyObject_GetMethod(args[0], name, &callable);
    if (callable == NULL) {
        return NULL;
    }

    if (unbound) {
        /* We must remove PY_VECTORCALL_ARGUMENTS_OFFSET since
         * that would be interpreted as allowing to change args[-1] */
        nargsf &= ~PY_VECTORCALL_ARGUMENTS_OFFSET;
    }
    else {
        /* Skip "self". We can keep PY_VECTORCALL_ARGUMENTS_OFFSET since
         * args[-1] in the onward call is args[0] here. */
        args++;
        nargsf--;
    }
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_METHOD, callable);
    TyObject *result = _TyObject_VectorcallTstate(tstate, callable,
                                                  args, nargsf, kwnames);
    Ty_DECREF(callable);
    return result;
}


TyObject *
PyObject_CallMethodObjArgs(TyObject *obj, TyObject *name, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *callable = NULL;
    int is_method = _TyObject_GetMethod(obj, name, &callable);
    if (callable == NULL) {
        return NULL;
    }
    obj = is_method ? obj : NULL;

    va_list vargs;
    va_start(vargs, name);
    TyObject *result = object_vacall(tstate, obj, callable, vargs);
    va_end(vargs);

    Ty_DECREF(callable);
    return result;
}


TyObject *
_TyObject_CallMethodIdObjArgs(TyObject *obj, _Ty_Identifier *name, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (obj == NULL || name == NULL) {
        return null_error(tstate);
    }

    TyObject *oname = _TyUnicode_FromId(name); /* borrowed */
    if (!oname) {
        return NULL;
    }

    TyObject *callable = NULL;
    int is_method = _TyObject_GetMethod(obj, oname, &callable);
    if (callable == NULL) {
        return NULL;
    }
    obj = is_method ? obj : NULL;

    va_list vargs;
    va_start(vargs, name);
    TyObject *result = object_vacall(tstate, obj, callable, vargs);
    va_end(vargs);

    Ty_DECREF(callable);
    return result;
}


TyObject *
PyObject_CallFunctionObjArgs(TyObject *callable, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    va_list vargs;
    TyObject *result;

    va_start(vargs, callable);
    result = object_vacall(tstate, NULL, callable, vargs);
    va_end(vargs);

    return result;
}


/* --- PyStack functions ------------------------------------------ */

TyObject *
_PyStack_AsDict(TyObject *const *values, TyObject *kwnames)
{
    Ty_ssize_t nkwargs;

    assert(kwnames != NULL);
    nkwargs = TyTuple_GET_SIZE(kwnames);
    return _TyDict_FromItems(&TyTuple_GET_ITEM(kwnames, 0), 1,
                             values, 1, nkwargs);
}


/* Convert (args, nargs, kwargs: dict) into a (stack, nargs, kwnames: tuple).

   Allocate a new argument vector and keyword names tuple. Return the argument
   vector; return NULL with exception set on error. Return the keyword names
   tuple in *p_kwnames.

   This also checks that all keyword names are strings. If not, a TypeError is
   raised.

   The newly allocated argument vector supports PY_VECTORCALL_ARGUMENTS_OFFSET.

   When done, you must call _PyStack_UnpackDict_Free(stack, nargs, kwnames) */
TyObject *const *
_PyStack_UnpackDict(TyThreadState *tstate,
                    TyObject *const *args, Ty_ssize_t nargs,
                    TyObject *kwargs, TyObject **p_kwnames)
{
    assert(nargs >= 0);
    assert(kwargs != NULL);
    assert(TyDict_Check(kwargs));

    Ty_ssize_t nkwargs = TyDict_GET_SIZE(kwargs);
    /* Check for overflow in the TyMem_Malloc() call below. The subtraction
     * in this check cannot overflow: both maxnargs and nkwargs are
     * non-negative signed integers, so their difference fits in the type. */
    Ty_ssize_t maxnargs = PY_SSIZE_T_MAX / sizeof(args[0]) - 1;
    if (nargs > maxnargs - nkwargs) {
        _TyErr_NoMemory(tstate);
        return NULL;
    }

    /* Add 1 to support PY_VECTORCALL_ARGUMENTS_OFFSET */
    TyObject **stack = TyMem_Malloc((1 + nargs + nkwargs) * sizeof(args[0]));
    if (stack == NULL) {
        _TyErr_NoMemory(tstate);
        return NULL;
    }

    TyObject *kwnames = TyTuple_New(nkwargs);
    if (kwnames == NULL) {
        TyMem_Free(stack);
        return NULL;
    }

    stack++;  /* For PY_VECTORCALL_ARGUMENTS_OFFSET */

    /* Copy positional arguments */
    for (Ty_ssize_t i = 0; i < nargs; i++) {
        stack[i] = Ty_NewRef(args[i]);
    }

    TyObject **kwstack = stack + nargs;
    /* This loop doesn't support lookup function mutating the dictionary
       to change its size. It's a deliberate choice for speed, this function is
       called in the performance critical hot code. */
    Ty_ssize_t pos = 0, i = 0;
    TyObject *key, *value;
    unsigned long keys_are_strings = Ty_TPFLAGS_UNICODE_SUBCLASS;
    while (TyDict_Next(kwargs, &pos, &key, &value)) {
        keys_are_strings &= Ty_TYPE(key)->tp_flags;
        TyTuple_SET_ITEM(kwnames, i, Ty_NewRef(key));
        kwstack[i] = Ty_NewRef(value);
        i++;
    }

    /* keys_are_strings has the value Ty_TPFLAGS_UNICODE_SUBCLASS if that
     * flag is set for all keys. Otherwise, keys_are_strings equals 0.
     * We do this check once at the end instead of inside the loop above
     * because it simplifies the deallocation in the failing case.
     * It happens to also make the loop above slightly more efficient. */
    if (!keys_are_strings) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "keywords must be strings");
        _PyStack_UnpackDict_Free(stack, nargs, kwnames);
        return NULL;
    }

    *p_kwnames = kwnames;
    return stack;
}

void
_PyStack_UnpackDict_Free(TyObject *const *stack, Ty_ssize_t nargs,
                         TyObject *kwnames)
{
    Ty_ssize_t n = TyTuple_GET_SIZE(kwnames) + nargs;
    for (Ty_ssize_t i = 0; i < n; i++) {
        Ty_DECREF(stack[i]);
    }
    _PyStack_UnpackDict_FreeNoDecRef(stack, kwnames);
}

void
_PyStack_UnpackDict_FreeNoDecRef(TyObject *const *stack, TyObject *kwnames)
{
    TyMem_Free((TyObject **)stack - 1);
    Ty_DECREF(kwnames);
}

// Export for the stable ABI
#undef PyVectorcall_NARGS
Ty_ssize_t
PyVectorcall_NARGS(size_t n)
{
    return _PyVectorcall_NARGS(n);
}
