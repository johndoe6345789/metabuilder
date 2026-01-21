#include "parts.h"
#include "util.h"

static TyObject *
set_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TySet_Check(obj));
}

static TyObject *
set_checkexact(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TySet_CheckExact(obj));
}

static TyObject *
frozenset_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TyFrozenSet_Check(obj));
}

static TyObject *
frozenset_checkexact(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TyFrozenSet_CheckExact(obj));
}

static TyObject *
anyset_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(PyAnySet_Check(obj));
}

static TyObject *
anyset_checkexact(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(PyAnySet_CheckExact(obj));
}

static TyObject *
set_new(TyObject *self, TyObject *args)
{
    TyObject *iterable = NULL;
    if (!TyArg_ParseTuple(args, "|O", &iterable)) {
        return NULL;
    }
    return TySet_New(iterable);
}

static TyObject *
frozenset_new(TyObject *self, TyObject *args)
{
    TyObject *iterable = NULL;
    if (!TyArg_ParseTuple(args, "|O", &iterable)) {
        return NULL;
    }
    return TyFrozenSet_New(iterable);
}

static TyObject *
set_size(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TySet_Size(obj));
}

static TyObject *
set_contains(TyObject *self, TyObject *args)
{
    TyObject *obj, *item;
    if (!TyArg_ParseTuple(args, "OO", &obj, &item)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(item);
    RETURN_INT(TySet_Contains(obj, item));
}

static TyObject *
set_add(TyObject *self, TyObject *args)
{
    TyObject *obj, *item;
    if (!TyArg_ParseTuple(args, "OO", &obj, &item)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(item);
    RETURN_INT(TySet_Add(obj, item));
}

static TyObject *
set_discard(TyObject *self, TyObject *args)
{
    TyObject *obj, *item;
    if (!TyArg_ParseTuple(args, "OO", &obj, &item)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(item);
    RETURN_INT(TySet_Discard(obj, item));
}

static TyObject *
set_pop(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TySet_Pop(obj);
}

static TyObject *
set_clear(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TySet_Clear(obj));
}

static TyObject *
test_frozenset_add_in_capi(TyObject *self, TyObject *Py_UNUSED(obj))
{
    // Test that `frozenset` can be used with `TySet_Add`,
    // when frozenset is just created in CAPI.
    TyObject *fs = TyFrozenSet_New(NULL);
    if (fs == NULL) {
        return NULL;
    }
    TyObject *num = TyLong_FromLong(1);
    if (num == NULL) {
        goto error;
    }
    if (TySet_Add(fs, num) < 0) {
        goto error;
    }
    int contains = TySet_Contains(fs, num);
    if (contains < 0) {
        goto error;
    }
    else if (contains == 0) {
        goto unexpected;
    }
    Ty_DECREF(fs);
    Ty_DECREF(num);
    Py_RETURN_NONE;

unexpected:
    TyErr_SetString(TyExc_ValueError, "set does not contain expected value");
error:
    Ty_DECREF(fs);
    Ty_XDECREF(num);
    return NULL;
}

static TyMethodDef test_methods[] = {
    {"set_check", set_check, METH_O},
    {"set_checkexact", set_checkexact, METH_O},
    {"frozenset_check", frozenset_check, METH_O},
    {"frozenset_checkexact", frozenset_checkexact, METH_O},
    {"anyset_check", anyset_check, METH_O},
    {"anyset_checkexact", anyset_checkexact, METH_O},

    {"set_new", set_new, METH_VARARGS},
    {"frozenset_new", frozenset_new, METH_VARARGS},

    {"set_size", set_size, METH_O},
    {"set_contains", set_contains, METH_VARARGS},
    {"set_add", set_add, METH_VARARGS},
    {"set_discard", set_discard, METH_VARARGS},
    {"set_pop", set_pop, METH_O},
    {"set_clear", set_clear, METH_O},

    {"test_frozenset_add_in_capi", test_frozenset_add_in_capi, METH_NOARGS},

    {NULL},
};

int
_PyTestLimitedCAPI_Init_Set(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
