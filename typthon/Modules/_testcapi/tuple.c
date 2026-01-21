#include "parts.h"
#include "util.h"


static TyObject *
tuple_get_size(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TyTuple_GET_SIZE(obj));
}

static TyObject *
tuple_get_item(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    NULLABLE(obj);
    return Ty_XNewRef(TyTuple_GET_ITEM(obj, i));
}

static TyObject *
tuple_copy(TyObject *tuple)
{
    Ty_ssize_t size = TyTuple_GET_SIZE(tuple);
    TyObject *newtuple = TyTuple_New(size);
    if (!newtuple) {
        return NULL;
    }
    for (Ty_ssize_t n = 0; n < size; n++) {
        TyTuple_SET_ITEM(newtuple, n, Ty_XNewRef(TyTuple_GET_ITEM(tuple, n)));
    }
    return newtuple;
}

static TyObject *
tuple_set_item(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value, *newtuple;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "OnO", &obj, &i, &value)) {
        return NULL;
    }
    NULLABLE(value);
    if (TyTuple_CheckExact(obj)) {
        newtuple = tuple_copy(obj);
        if (!newtuple) {
            return NULL;
        }

        TyObject *val = TyTuple_GET_ITEM(newtuple, i);
        TyTuple_SET_ITEM(newtuple, i, Ty_XNewRef(value));
        Ty_DECREF(val);
        return newtuple;
    }
    else {
        NULLABLE(obj);

        TyObject *val = TyTuple_GET_ITEM(obj, i);
        TyTuple_SET_ITEM(obj, i, Ty_XNewRef(value));
        Ty_DECREF(val);
        return Ty_XNewRef(obj);
    }
}

static TyObject *
_tuple_resize(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *tup;
    Ty_ssize_t newsize;
    int new = 1;
    if (!TyArg_ParseTuple(args, "On|p", &tup, &newsize, &new)) {
        return NULL;
    }
    if (new) {
        tup = tuple_copy(tup);
        if (!tup) {
            return NULL;
        }
    }
    else {
        NULLABLE(tup);
        Ty_XINCREF(tup);
    }
    int r = _TyTuple_Resize(&tup, newsize);
    if (r == -1) {
        assert(tup == NULL);
        return NULL;
    }
    return tup;
}

static TyObject *
_check_tuple_item_is_NULL(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    return TyLong_FromLong(TyTuple_GET_ITEM(obj, i) == NULL);
}


static TyMethodDef test_methods[] = {
    {"tuple_get_size", tuple_get_size, METH_O},
    {"tuple_get_item", tuple_get_item, METH_VARARGS},
    {"tuple_set_item", tuple_set_item, METH_VARARGS},
    {"_tuple_resize", _tuple_resize, METH_VARARGS},
    {"_check_tuple_item_is_NULL", _check_tuple_item_is_NULL, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Tuple(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
