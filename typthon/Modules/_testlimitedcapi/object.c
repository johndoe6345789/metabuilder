// Need limited C API version 3.13 for Ty_GetConstant()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "parts.h"
#include "util.h"


/* Test Ty_GetConstant() */
static TyObject *
get_constant(TyObject *Py_UNUSED(module), TyObject *args)
{
    int constant_id;
    if (!TyArg_ParseTuple(args, "i", &constant_id)) {
        return NULL;
    }

    TyObject *obj = Ty_GetConstant(constant_id);
    if (obj == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    return obj;
}


/* Test Ty_GetConstantBorrowed() */
static TyObject *
get_constant_borrowed(TyObject *Py_UNUSED(module), TyObject *args)
{
    int constant_id;
    if (!TyArg_ParseTuple(args, "i", &constant_id)) {
        return NULL;
    }

    TyObject *obj = Ty_GetConstantBorrowed(constant_id);
    if (obj == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    return Ty_NewRef(obj);
}


/* Test constants */
static TyObject *
test_constants(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(args))
{
    // Test that implementation of constants in the limited C API:
    // check that the C code compiles.
    //
    // Test also that constants and Ty_GetConstant() return the same
    // objects.
    assert(Ty_None == Ty_GetConstant(Ty_CONSTANT_NONE));
    assert(Ty_False == Ty_GetConstant(Ty_CONSTANT_FALSE));
    assert(Ty_True == Ty_GetConstant(Ty_CONSTANT_TRUE));
    assert(Ty_Ellipsis == Ty_GetConstant(Ty_CONSTANT_ELLIPSIS));
    assert(Ty_NotImplemented == Ty_GetConstant(Ty_CONSTANT_NOT_IMPLEMENTED));
    // Other constants are tested in test_capi.test_object
    Py_RETURN_NONE;
}

static TyMethodDef test_methods[] = {
    {"get_constant", get_constant, METH_VARARGS},
    {"get_constant_borrowed", get_constant_borrowed, METH_VARARGS},
    {"test_constants", test_constants, METH_NOARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Object(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
