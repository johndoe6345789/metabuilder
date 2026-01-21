/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_testcapi_pyobject_fastcalldict__doc__,
"pyobject_fastcalldict($module, func, func_args, kwargs, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYOBJECT_FASTCALLDICT_METHODDEF    \
    {"pyobject_fastcalldict", _PyCFunction_CAST(_testcapi_pyobject_fastcalldict), METH_FASTCALL, _testcapi_pyobject_fastcalldict__doc__},

static TyObject *
_testcapi_pyobject_fastcalldict_impl(TyObject *module, TyObject *func,
                                     TyObject *func_args, TyObject *kwargs);

static TyObject *
_testcapi_pyobject_fastcalldict(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *func;
    TyObject *func_args;
    TyObject *__clinic_kwargs;

    if (!_TyArg_CheckPositional("pyobject_fastcalldict", nargs, 3, 3)) {
        goto exit;
    }
    func = args[0];
    func_args = args[1];
    __clinic_kwargs = args[2];
    return_value = _testcapi_pyobject_fastcalldict_impl(module, func, func_args, __clinic_kwargs);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_pyobject_vectorcall__doc__,
"pyobject_vectorcall($module, func, func_args, kwnames, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYOBJECT_VECTORCALL_METHODDEF    \
    {"pyobject_vectorcall", _PyCFunction_CAST(_testcapi_pyobject_vectorcall), METH_FASTCALL, _testcapi_pyobject_vectorcall__doc__},

static TyObject *
_testcapi_pyobject_vectorcall_impl(TyObject *module, TyObject *func,
                                   TyObject *func_args, TyObject *kwnames);

static TyObject *
_testcapi_pyobject_vectorcall(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *func;
    TyObject *func_args;
    TyObject *__clinic_kwnames;

    if (!_TyArg_CheckPositional("pyobject_vectorcall", nargs, 3, 3)) {
        goto exit;
    }
    func = args[0];
    func_args = args[1];
    __clinic_kwnames = args[2];
    return_value = _testcapi_pyobject_vectorcall_impl(module, func, func_args, __clinic_kwnames);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_pyvectorcall_call__doc__,
"pyvectorcall_call($module, func, argstuple, kwargs=<unrepresentable>, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYVECTORCALL_CALL_METHODDEF    \
    {"pyvectorcall_call", _PyCFunction_CAST(_testcapi_pyvectorcall_call), METH_FASTCALL, _testcapi_pyvectorcall_call__doc__},

static TyObject *
_testcapi_pyvectorcall_call_impl(TyObject *module, TyObject *func,
                                 TyObject *argstuple, TyObject *kwargs);

static TyObject *
_testcapi_pyvectorcall_call(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *func;
    TyObject *argstuple;
    TyObject *__clinic_kwargs = NULL;

    if (!_TyArg_CheckPositional("pyvectorcall_call", nargs, 2, 3)) {
        goto exit;
    }
    func = args[0];
    argstuple = args[1];
    if (nargs < 3) {
        goto skip_optional;
    }
    __clinic_kwargs = args[2];
skip_optional:
    return_value = _testcapi_pyvectorcall_call_impl(module, func, argstuple, __clinic_kwargs);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_VectorCallClass_set_vectorcall__doc__,
"set_vectorcall($self, type, /)\n"
"--\n"
"\n"
"Set self\'s vectorcall function for `type` to one that returns \"vectorcall\"");

#define _TESTCAPI_VECTORCALLCLASS_SET_VECTORCALL_METHODDEF    \
    {"set_vectorcall", (PyCFunction)_testcapi_VectorCallClass_set_vectorcall, METH_O, _testcapi_VectorCallClass_set_vectorcall__doc__},

static TyObject *
_testcapi_VectorCallClass_set_vectorcall_impl(TyObject *self,
                                              TyTypeObject *type);

static TyObject *
_testcapi_VectorCallClass_set_vectorcall(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyTypeObject *type;

    if (!PyObject_TypeCheck(arg, &TyType_Type)) {
        _TyArg_BadArgument("set_vectorcall", "argument", (&TyType_Type)->tp_name, arg);
        goto exit;
    }
    type = (TyTypeObject *)arg;
    return_value = _testcapi_VectorCallClass_set_vectorcall_impl(self, type);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_make_vectorcall_class__doc__,
"make_vectorcall_class($module, base=<unrepresentable>, /)\n"
"--\n"
"\n"
"Create a class whose instances return \"tpcall\" when called.\n"
"\n"
"When the \"set_vectorcall\" method is called on an instance, a vectorcall\n"
"function that returns \"vectorcall\" will be installed.");

#define _TESTCAPI_MAKE_VECTORCALL_CLASS_METHODDEF    \
    {"make_vectorcall_class", _PyCFunction_CAST(_testcapi_make_vectorcall_class), METH_FASTCALL, _testcapi_make_vectorcall_class__doc__},

static TyObject *
_testcapi_make_vectorcall_class_impl(TyObject *module, TyTypeObject *base);

static TyObject *
_testcapi_make_vectorcall_class(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base = NULL;

    if (!_TyArg_CheckPositional("make_vectorcall_class", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!PyObject_TypeCheck(args[0], &TyType_Type)) {
        _TyArg_BadArgument("make_vectorcall_class", "argument 1", (&TyType_Type)->tp_name, args[0]);
        goto exit;
    }
    base = (TyTypeObject *)args[0];
skip_optional:
    return_value = _testcapi_make_vectorcall_class_impl(module, base);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_has_vectorcall_flag__doc__,
"has_vectorcall_flag($module, type, /)\n"
"--\n"
"\n"
"Return true iff Ty_TPFLAGS_HAVE_VECTORCALL is set on the class.");

#define _TESTCAPI_HAS_VECTORCALL_FLAG_METHODDEF    \
    {"has_vectorcall_flag", (PyCFunction)_testcapi_has_vectorcall_flag, METH_O, _testcapi_has_vectorcall_flag__doc__},

static int
_testcapi_has_vectorcall_flag_impl(TyObject *module, TyTypeObject *type);

static TyObject *
_testcapi_has_vectorcall_flag(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyTypeObject *type;
    int _return_value;

    if (!PyObject_TypeCheck(arg, &TyType_Type)) {
        _TyArg_BadArgument("has_vectorcall_flag", "argument", (&TyType_Type)->tp_name, arg);
        goto exit;
    }
    type = (TyTypeObject *)arg;
    _return_value = _testcapi_has_vectorcall_flag_impl(module, type);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}
/*[clinic end generated code: output=210ae67caab177ba input=a9049054013a1b77]*/
