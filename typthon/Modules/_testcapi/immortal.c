#include "parts.h"

#define Ty_BUILD_CORE
#include "internal/pycore_long.h"   // IMMORTALITY_BIT_MASK

int verify_immortality(TyObject *object)
{
    assert(_Ty_IsImmortal(object));
    Ty_ssize_t old_count = Ty_REFCNT(object);
    for (int j = 0; j < 10000; j++) {
        Ty_DECREF(object);
    }
    Ty_ssize_t current_count = Ty_REFCNT(object);
    return old_count == current_count;
}

static TyObject *
test_immortal_builtins(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *objects[] = {Ty_True, Ty_False, Ty_None, Ty_Ellipsis};
    Ty_ssize_t n = Ty_ARRAY_LENGTH(objects);
    for (Ty_ssize_t i = 0; i < n; i++) {
        assert(verify_immortality(objects[i]));
    }
    Py_RETURN_NONE;
}

static TyObject *
test_immortal_small_ints(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    for (int i = -5; i <= 256; i++) {
        TyObject *obj = TyLong_FromLong(i);
        assert(verify_immortality(obj));
        int has_int_immortal_bit = ((PyLongObject *)obj)->long_value.lv_tag & IMMORTALITY_BIT_MASK;
        assert(has_int_immortal_bit);
    }
    for (int i = 257; i <= 260; i++) {
        TyObject *obj = TyLong_FromLong(i);
        assert(obj);
        int has_int_immortal_bit = ((PyLongObject *)obj)->long_value.lv_tag & IMMORTALITY_BIT_MASK;
        assert(!has_int_immortal_bit);
        Ty_DECREF(obj);
    }
    Py_RETURN_NONE;
}

static TyObject *
is_immortal(TyObject *self, TyObject *op)
{
    return TyBool_FromLong(PyUnstable_IsImmortal(op));
}

static TyMethodDef test_methods[] = {
    {"test_immortal_builtins",   test_immortal_builtins,     METH_NOARGS},
    {"test_immortal_small_ints", test_immortal_small_ints,   METH_NOARGS},
    {"is_immortal",              is_immortal,                METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Immortal(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    return 0;
}
