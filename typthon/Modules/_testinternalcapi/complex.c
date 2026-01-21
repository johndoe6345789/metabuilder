#include "parts.h"
#include "../_testcapi/util.h"

#define Ty_BUILD_CORE
#include "pycore_complexobject.h"


#define _PY_CR_FUNC2(suffix)                                     \
    static TyObject *                                            \
    _py_cr_##suffix(TyObject *Py_UNUSED(module), TyObject *args) \
    {                                                            \
        Ty_complex a, res;                                       \
        double b;                                                \
                                                                 \
        if (!TyArg_ParseTuple(args, "Dd", &a, &b)) {             \
            return NULL;                                         \
        }                                                        \
                                                                 \
        errno = 0;                                               \
        res = _Ty_cr_##suffix(a, b);                             \
        return Ty_BuildValue("Di", &res, errno);                 \
    };

#define _PY_RC_FUNC2(suffix)                                     \
    static TyObject *                                            \
    _py_rc_##suffix(TyObject *Py_UNUSED(module), TyObject *args) \
    {                                                            \
        Ty_complex b, res;                                       \
        double a;                                                \
                                                                 \
        if (!TyArg_ParseTuple(args, "dD", &a, &b)) {             \
            return NULL;                                         \
        }                                                        \
                                                                 \
        errno = 0;                                               \
        res = _Ty_rc_##suffix(a, b);                             \
        return Ty_BuildValue("Di", &res, errno);                 \
    };

_PY_CR_FUNC2(sum)
_PY_CR_FUNC2(diff)
_PY_RC_FUNC2(diff)
_PY_CR_FUNC2(prod)
_PY_CR_FUNC2(quot)
_PY_RC_FUNC2(quot)


static TyMethodDef test_methods[] = {
    {"_py_cr_sum", _py_cr_sum, METH_VARARGS},
    {"_py_cr_diff", _py_cr_diff, METH_VARARGS},
    {"_py_rc_diff", _py_rc_diff, METH_VARARGS},
    {"_py_cr_prod", _py_cr_prod, METH_VARARGS},
    {"_py_cr_quot", _py_cr_quot, METH_VARARGS},
    {"_py_rc_quot", _py_rc_quot, METH_VARARGS},
    {NULL},
};

int
_PyTestInternalCapi_Init_Complex(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
