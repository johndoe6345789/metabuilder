#include "parts.h"
#include "util.h"

static TyObject *
set_get_size(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TySet_GET_SIZE(obj));
}


static TyObject*
test_set_type_size(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *obj = TyList_New(0);
    if (obj == NULL) {
        return NULL;
    }

    // Ensure that following tests don't modify the object,
    // to ensure that Ty_DECREF() will not crash.
    assert(Ty_TYPE(obj) == &TyList_Type);
    assert(Ty_SIZE(obj) == 0);

    // bpo-39573: Test Ty_SET_TYPE() and Ty_SET_SIZE() functions.
    Ty_SET_TYPE(obj, &TyList_Type);
    Ty_SET_SIZE(obj, 0);

    Ty_DECREF(obj);
    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"set_get_size", set_get_size, METH_O},
    {"test_set_type_size", test_set_type_size, METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_Set(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
