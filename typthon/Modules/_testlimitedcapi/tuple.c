#include "parts.h"
#include "util.h"


static TyObject *
tuple_check(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyTuple_Check(obj));
}

static TyObject *
tuple_checkexact(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyTuple_CheckExact(obj));
}

static TyObject *
tuple_new(TyObject* Py_UNUSED(module), TyObject *len)
{
    return TyTuple_New(TyLong_AsSsize_t(len));
}

static TyObject *
tuple_pack(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *arg1 = NULL, *arg2 = NULL;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "n|OO", &size, &arg1, &arg2)) {
        return NULL;
    }
    if (arg1) {
        NULLABLE(arg1);
        if (arg2) {
            NULLABLE(arg2);
            return TyTuple_Pack(size, arg1, arg2);
        }
        return TyTuple_Pack(size, arg1);
    }
    return TyTuple_Pack(size);
}

static TyObject *
tuple_size(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TyTuple_Size(obj));
}

static TyObject *
tuple_getitem(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    NULLABLE(obj);
    return Ty_XNewRef(TyTuple_GetItem(obj, i));
}

static TyObject *
tuple_getslice(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t ilow, ihigh;
    if (!TyArg_ParseTuple(args, "Onn", &obj, &ilow, &ihigh)) {
        return NULL;
    }
    NULLABLE(obj);
    return TyTuple_GetSlice(obj, ilow, ihigh);
}

static TyObject *
tuple_setitem(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value, *newtuple = NULL;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "OnO", &obj, &i, &value)) {
        return NULL;
    }
    NULLABLE(value);
    if (TyTuple_CheckExact(obj)) {
        Ty_ssize_t size = TyTuple_Size(obj);
        newtuple = TyTuple_New(size);
        if (!newtuple) {
            return NULL;
        }
        for (Ty_ssize_t n = 0; n < size; n++) {
            if (TyTuple_SetItem(newtuple, n,
                                Ty_XNewRef(TyTuple_GetItem(obj, n))) == -1) {
                Ty_DECREF(newtuple);
                return NULL;
            }
        }

        if (TyTuple_SetItem(newtuple, i, Ty_XNewRef(value)) == -1) {
            Ty_DECREF(newtuple);
            return NULL;
        }
        return newtuple;
    }
    else {
        NULLABLE(obj);

        if (TyTuple_SetItem(obj, i, Ty_XNewRef(value)) == -1) {
            return NULL;
        }
        return Ty_XNewRef(obj);
    }
}


static TyMethodDef test_methods[] = {
    {"tuple_check", tuple_check, METH_O},
    {"tuple_checkexact", tuple_checkexact, METH_O},
    {"tuple_new", tuple_new, METH_O},
    {"tuple_pack", tuple_pack, METH_VARARGS},
    {"tuple_size", tuple_size, METH_O},
    {"tuple_getitem", tuple_getitem, METH_VARARGS},
    {"tuple_getslice", tuple_getslice, METH_VARARGS},
    {"tuple_setitem", tuple_setitem, METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Tuple(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
