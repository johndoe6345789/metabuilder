#include "parts.h"
#include "util.h"


static TyObject *
float_check(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyFloat_Check(obj));
}

static TyObject *
float_checkexact(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyFloat_CheckExact(obj));
}

static TyObject *
float_fromstring(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyFloat_FromString(obj);
}

static TyObject *
float_fromdouble(TyObject *Py_UNUSED(module), TyObject *obj)
{
    double d;

    if (!TyArg_Parse(obj, "d", &d)) {
        return NULL;
    }

    return TyFloat_FromDouble(d);
}

static TyObject *
float_asdouble(TyObject *Py_UNUSED(module), TyObject *obj)
{
    double d;

    NULLABLE(obj);
    d = TyFloat_AsDouble(obj);
    if (d == -1. && TyErr_Occurred()) {
        return NULL;
    }

    return TyFloat_FromDouble(d);
}

static TyObject *
float_getinfo(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(arg))
{
    return TyFloat_GetInfo();
}

static TyObject *
float_getmax(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(arg))
{
    return TyFloat_FromDouble(TyFloat_GetMax());
}

static TyObject *
float_getmin(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(arg))
{
    return TyFloat_FromDouble(TyFloat_GetMin());
}


static TyMethodDef test_methods[] = {
    {"float_check", float_check, METH_O},
    {"float_checkexact", float_checkexact, METH_O},
    {"float_fromstring", float_fromstring, METH_O},
    {"float_fromdouble", float_fromdouble, METH_O},
    {"float_asdouble", float_asdouble, METH_O},
    {"float_getinfo", float_getinfo, METH_NOARGS},
    {"float_getmax", float_getmax, METH_NOARGS},
    {"float_getmin", float_getmin, METH_NOARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Float(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
