#include "pyconfig.h"   // Ty_GIL_DISABLED

// Need limited C API version 3.5 for PyCodec_NameReplaceErrors()
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x03050000
#endif

#include "parts.h"

static TyObject *
codec_namereplace_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_NameReplaceErrors(exc);
}

static TyMethodDef test_methods[] = {
    {"codec_namereplace_errors", codec_namereplace_errors, METH_O},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Codec(TyObject *module)
{
    if (TyModule_AddFunctions(module, test_methods) < 0) {
        return -1;
    }
    return 0;
}
