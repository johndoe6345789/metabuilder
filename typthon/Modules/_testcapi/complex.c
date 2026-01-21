#include "parts.h"
#include "util.h"


static TyObject *
complex_fromccomplex(TyObject *Py_UNUSED(module), TyObject *obj)
{
    Ty_complex complex;

    if (!TyArg_Parse(obj, "D", &complex)) {
        return NULL;
    }

    return TyComplex_FromCComplex(complex);
}

static TyObject *
complex_asccomplex(TyObject *Py_UNUSED(module), TyObject *obj)
{
    Ty_complex complex;

    NULLABLE(obj);
    complex = TyComplex_AsCComplex(obj);

    if (complex.real == -1. && TyErr_Occurred()) {
        return NULL;
    }

    return TyComplex_FromCComplex(complex);
}

static TyObject*
_py_c_neg(TyObject *Py_UNUSED(module), TyObject *num)
{
    Ty_complex complex;

    complex = TyComplex_AsCComplex(num);
    if (complex.real == -1. && TyErr_Occurred()) {
        return NULL;
    }

    return TyComplex_FromCComplex(_Ty_c_neg(complex));
}

#define _PY_C_FUNC2(suffix)                                      \
    static TyObject *                                            \
    _py_c_##suffix(TyObject *Py_UNUSED(module), TyObject *args)  \
    {                                                            \
        Ty_complex a, b, res;                                    \
                                                                 \
        if (!TyArg_ParseTuple(args, "DD", &a, &b)) {             \
            return NULL;                                         \
        }                                                        \
                                                                 \
        errno = 0;                                               \
        res = _Ty_c_##suffix(a, b);                              \
        return Ty_BuildValue("Di", &res, errno);                 \
    };

_PY_C_FUNC2(sum)
_PY_C_FUNC2(diff)
_PY_C_FUNC2(prod)
_PY_C_FUNC2(quot)
_PY_C_FUNC2(pow)

static TyObject*
_py_c_abs(TyObject *Py_UNUSED(module), TyObject* obj)
{
    Ty_complex complex;
    double res;

    NULLABLE(obj);
    complex = TyComplex_AsCComplex(obj);

    if (complex.real == -1. && TyErr_Occurred()) {
        return NULL;
    }

    errno = 0;
    res = _Ty_c_abs(complex);
    return Ty_BuildValue("di", res, errno);
}


static TyMethodDef test_methods[] = {
    {"complex_fromccomplex", complex_fromccomplex, METH_O},
    {"complex_asccomplex", complex_asccomplex, METH_O},
    {"_py_c_sum", _py_c_sum, METH_VARARGS},
    {"_py_c_diff", _py_c_diff, METH_VARARGS},
    {"_py_c_neg", _py_c_neg, METH_O},
    {"_py_c_prod", _py_c_prod, METH_VARARGS},
    {"_py_c_quot", _py_c_quot, METH_VARARGS},
    {"_py_c_pow", _py_c_pow, METH_VARARGS},
    {"_py_c_abs", _py_c_abs, METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Complex(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
