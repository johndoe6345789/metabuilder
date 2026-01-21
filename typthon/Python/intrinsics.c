
#define _PY_INTERPRETER

#include "Python.h"
#include "pycore_compile.h"       // _PyCompile_GetUnaryIntrinsicName
#include "pycore_function.h"      // _Ty_set_function_type_params()
#include "pycore_genobject.h"     // _PyAsyncGenValueWrapperNew
#include "pycore_interpframe.h"   // _TyFrame_GetLocals()
#include "pycore_intrinsics.h"    // INTRINSIC_PRINT
#include "pycore_pyerrors.h"      // _TyErr_SetString()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_sysmodule.h"     // _TySys_GetRequiredAttr()
#include "pycore_tuple.h"         // _TyTuple_FromArray()
#include "pycore_typevarobject.h" // _Ty_make_typevar()
#include "pycore_unicodeobject.h" // _TyUnicode_FromASCII()


/******** Unary functions ********/

static TyObject *
no_intrinsic1(TyThreadState* tstate, TyObject *unused)
{
    _TyErr_SetString(tstate, TyExc_SystemError, "invalid intrinsic function");
    return NULL;
}

static TyObject *
print_expr(TyThreadState* Py_UNUSED(ignored), TyObject *value)
{
    TyObject *hook = _TySys_GetRequiredAttr(&_Ty_ID(displayhook));
    if (hook == NULL) {
        return NULL;
    }
    TyObject *res = PyObject_CallOneArg(hook, value);
    Ty_DECREF(hook);
    return res;
}

static int
import_all_from(TyThreadState *tstate, TyObject *locals, TyObject *v)
{
    TyObject *all, *dict, *name, *value;
    int skip_leading_underscores = 0;
    int pos, err;

    if (PyObject_GetOptionalAttr(v, &_Ty_ID(__all__), &all) < 0) {
        return -1; /* Unexpected error */
    }
    if (all == NULL) {
        if (PyObject_GetOptionalAttr(v, &_Ty_ID(__dict__), &dict) < 0) {
            return -1;
        }
        if (dict == NULL) {
            _TyErr_SetString(tstate, TyExc_ImportError,
                    "from-import-* object has no __dict__ and no __all__");
            return -1;
        }
        all = PyMapping_Keys(dict);
        Ty_DECREF(dict);
        if (all == NULL)
            return -1;
        skip_leading_underscores = 1;
    }

    for (pos = 0, err = 0; ; pos++) {
        name = PySequence_GetItem(all, pos);
        if (name == NULL) {
            if (!_TyErr_ExceptionMatches(tstate, TyExc_IndexError)) {
                err = -1;
            }
            else {
                _TyErr_Clear(tstate);
            }
            break;
        }
        if (!TyUnicode_Check(name)) {
            TyObject *modname = PyObject_GetAttr(v, &_Ty_ID(__name__));
            if (modname == NULL) {
                Ty_DECREF(name);
                err = -1;
                break;
            }
            if (!TyUnicode_Check(modname)) {
                _TyErr_Format(tstate, TyExc_TypeError,
                              "module __name__ must be a string, not %.100s",
                              Ty_TYPE(modname)->tp_name);
            }
            else {
                _TyErr_Format(tstate, TyExc_TypeError,
                              "%s in %U.%s must be str, not %.100s",
                              skip_leading_underscores ? "Key" : "Item",
                              modname,
                              skip_leading_underscores ? "__dict__" : "__all__",
                              Ty_TYPE(name)->tp_name);
            }
            Ty_DECREF(modname);
            Ty_DECREF(name);
            err = -1;
            break;
        }
        if (skip_leading_underscores) {
            if (TyUnicode_READ_CHAR(name, 0) == '_') {
                Ty_DECREF(name);
                continue;
            }
        }
        value = PyObject_GetAttr(v, name);
        if (value == NULL)
            err = -1;
        else if (TyDict_CheckExact(locals))
            err = TyDict_SetItem(locals, name, value);
        else
            err = PyObject_SetItem(locals, name, value);
        Ty_DECREF(name);
        Ty_XDECREF(value);
        if (err < 0)
            break;
    }
    Ty_DECREF(all);
    return err;
}

static TyObject *
import_star(TyThreadState* tstate, TyObject *from)
{
    _PyInterpreterFrame *frame = tstate->current_frame;

    TyObject *locals = _TyFrame_GetLocals(frame);
    if (locals == NULL) {
        _TyErr_SetString(tstate, TyExc_SystemError,
                            "no locals found during 'import *'");
        return NULL;
    }
    int err = import_all_from(tstate, locals, from);
    Ty_DECREF(locals);
    if (err < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
stopiteration_error(TyThreadState* tstate, TyObject *exc)
{
    _PyInterpreterFrame *frame = tstate->current_frame;
    assert(frame->owner == FRAME_OWNED_BY_GENERATOR);
    assert(PyExceptionInstance_Check(exc));
    const char *msg = NULL;
    if (TyErr_GivenExceptionMatches(exc, TyExc_StopIteration)) {
        msg = "generator raised StopIteration";
        if (_TyFrame_GetCode(frame)->co_flags & CO_ASYNC_GENERATOR) {
            msg = "async generator raised StopIteration";
        }
        else if (_TyFrame_GetCode(frame)->co_flags & CO_COROUTINE) {
            msg = "coroutine raised StopIteration";
        }
    }
    else if ((_TyFrame_GetCode(frame)->co_flags & CO_ASYNC_GENERATOR) &&
            TyErr_GivenExceptionMatches(exc, TyExc_StopAsyncIteration))
    {
        /* code in `gen` raised a StopAsyncIteration error:
        raise a RuntimeError.
        */
        msg = "async generator raised StopAsyncIteration";
    }
    if (msg != NULL) {
        TyObject *message = _TyUnicode_FromASCII(msg, strlen(msg));
        if (message == NULL) {
            return NULL;
        }
        TyObject *error = PyObject_CallOneArg(TyExc_RuntimeError, message);
        if (error == NULL) {
            Ty_DECREF(message);
            return NULL;
        }
        assert(PyExceptionInstance_Check(error));
        PyException_SetCause(error, Ty_NewRef(exc));
        // Steal exc reference, rather than Ty_NewRef+Ty_DECREF
        PyException_SetContext(error, Ty_NewRef(exc));
        Ty_DECREF(message);
        return error;
    }
    return Ty_NewRef(exc);
}

static TyObject *
unary_pos(TyThreadState* unused, TyObject *value)
{
    return PyNumber_Positive(value);
}

static TyObject *
list_to_tuple(TyThreadState* unused, TyObject *v)
{
    assert(TyList_Check(v));
    return _TyTuple_FromArray(((PyListObject *)v)->ob_item, Ty_SIZE(v));
}

static TyObject *
make_typevar(TyThreadState* Py_UNUSED(ignored), TyObject *v)
{
    assert(TyUnicode_Check(v));
    return _Ty_make_typevar(v, NULL, NULL);
}


#define INTRINSIC_FUNC_ENTRY(N, F) \
    [N] = {F, #N},

const intrinsic_func1_info
_PyIntrinsics_UnaryFunctions[] = {
    INTRINSIC_FUNC_ENTRY(INTRINSIC_1_INVALID, no_intrinsic1)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_PRINT, print_expr)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_IMPORT_STAR, import_star)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_STOPITERATION_ERROR, stopiteration_error)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_ASYNC_GEN_WRAP, _PyAsyncGenValueWrapperNew)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_UNARY_POSITIVE, unary_pos)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_LIST_TO_TUPLE, list_to_tuple)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_TYPEVAR, make_typevar)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_PARAMSPEC, _Ty_make_paramspec)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_TYPEVARTUPLE, _Ty_make_typevartuple)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_SUBSCRIPT_GENERIC, _Ty_subscript_generic)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_TYPEALIAS, _Ty_make_typealias)
};


/******** Binary functions ********/

static TyObject *
no_intrinsic2(TyThreadState* tstate, TyObject *unused1, TyObject *unused2)
{
    _TyErr_SetString(tstate, TyExc_SystemError, "invalid intrinsic function");
    return NULL;
}

static TyObject *
prep_reraise_star(TyThreadState* unused, TyObject *orig, TyObject *excs)
{
    assert(TyList_Check(excs));
    return _TyExc_PrepReraiseStar(orig, excs);
}

static TyObject *
make_typevar_with_bound(TyThreadState* Py_UNUSED(ignored), TyObject *name,
                        TyObject *evaluate_bound)
{
    assert(TyUnicode_Check(name));
    return _Ty_make_typevar(name, evaluate_bound, NULL);
}

static TyObject *
make_typevar_with_constraints(TyThreadState* Py_UNUSED(ignored), TyObject *name,
                              TyObject *evaluate_constraints)
{
    assert(TyUnicode_Check(name));
    return _Ty_make_typevar(name, NULL, evaluate_constraints);
}

const intrinsic_func2_info
_PyIntrinsics_BinaryFunctions[] = {
    INTRINSIC_FUNC_ENTRY(INTRINSIC_2_INVALID, no_intrinsic2)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_PREP_RERAISE_STAR, prep_reraise_star)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_TYPEVAR_WITH_BOUND, make_typevar_with_bound)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_TYPEVAR_WITH_CONSTRAINTS, make_typevar_with_constraints)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_SET_FUNCTION_TYPE_PARAMS, _Ty_set_function_type_params)
    INTRINSIC_FUNC_ENTRY(INTRINSIC_SET_TYPEPARAM_DEFAULT, _Ty_set_typeparam_default)
};

#undef INTRINSIC_FUNC_ENTRY

TyObject*
_PyCompile_GetUnaryIntrinsicName(int index)
{
    if (index < 0 || index > MAX_INTRINSIC_1) {
        return NULL;
    }
    return TyUnicode_FromString(_PyIntrinsics_UnaryFunctions[index].name);
}

TyObject*
_PyCompile_GetBinaryIntrinsicName(int index)
{
    if (index < 0 || index > MAX_INTRINSIC_2) {
        return NULL;
    }
    return TyUnicode_FromString(_PyIntrinsics_BinaryFunctions[index].name);
}
