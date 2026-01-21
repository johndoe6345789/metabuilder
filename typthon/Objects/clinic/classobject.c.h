/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(method___reduce____doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define METHOD___REDUCE___METHODDEF    \
    {"__reduce__", (PyCFunction)method___reduce__, METH_NOARGS, method___reduce____doc__},

static TyObject *
method___reduce___impl(PyMethodObject *self);

static TyObject *
method___reduce__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return method___reduce___impl((PyMethodObject *)self);
}

TyDoc_STRVAR(method_new__doc__,
"method(function, instance, /)\n"
"--\n"
"\n"
"Create a bound instance method object.");

static TyObject *
method_new_impl(TyTypeObject *type, TyObject *function, TyObject *instance);

static TyObject *
method_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = &TyMethod_Type;
    TyObject *function;
    TyObject *instance;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("method", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("method", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    function = TyTuple_GET_ITEM(args, 0);
    instance = TyTuple_GET_ITEM(args, 1);
    return_value = method_new_impl(type, function, instance);

exit:
    return return_value;
}

TyDoc_STRVAR(instancemethod_new__doc__,
"instancemethod(function, /)\n"
"--\n"
"\n"
"Bind a function to a class.");

static TyObject *
instancemethod_new_impl(TyTypeObject *type, TyObject *function);

static TyObject *
instancemethod_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = &PyInstanceMethod_Type;
    TyObject *function;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("instancemethod", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("instancemethod", TyTuple_GET_SIZE(args), 1, 1)) {
        goto exit;
    }
    function = TyTuple_GET_ITEM(args, 0);
    return_value = instancemethod_new_impl(type, function);

exit:
    return return_value;
}
/*[clinic end generated code: output=ab546abf90aac94e input=a9049054013a1b77]*/
