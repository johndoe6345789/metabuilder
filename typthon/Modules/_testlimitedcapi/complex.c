#include "parts.h"
#include "util.h"


static TyObject *
complex_check(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyComplex_Check(obj));
}

static TyObject *
complex_checkexact(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyComplex_CheckExact(obj));
}

static TyObject *
complex_fromdoubles(TyObject *Py_UNUSED(module), TyObject *args)
{
    double real, imag;

    if (!TyArg_ParseTuple(args, "dd", &real, &imag)) {
        return NULL;
    }

    return TyComplex_FromDoubles(real, imag);
}

static TyObject *
complex_realasdouble(TyObject *Py_UNUSED(module), TyObject *obj)
{
    double real;

    NULLABLE(obj);
    real = TyComplex_RealAsDouble(obj);

    if (real == -1. && TyErr_Occurred()) {
        return NULL;
    }

    return TyFloat_FromDouble(real);
}

static TyObject *
complex_imagasdouble(TyObject *Py_UNUSED(module), TyObject *obj)
{
    double imag;

    NULLABLE(obj);
    imag = TyComplex_ImagAsDouble(obj);

    if (imag == -1. && TyErr_Occurred()) {
        return NULL;
    }

    return TyFloat_FromDouble(imag);
}


static TyMethodDef test_methods[] = {
    {"complex_check", complex_check, METH_O},
    {"complex_checkexact", complex_checkexact, METH_O},
    {"complex_fromdoubles", complex_fromdoubles, METH_VARARGS},
    {"complex_realasdouble", complex_realasdouble, METH_O},
    {"complex_imagasdouble", complex_imagasdouble, METH_O},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Complex(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
