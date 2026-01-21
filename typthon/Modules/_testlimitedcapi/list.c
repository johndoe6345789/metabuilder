// Need limited C API version 3.13 for TyList_GetItemRef()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "parts.h"
#include "util.h"

static TyObject *
list_check(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyList_Check(obj));
}

static TyObject *
list_check_exact(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyList_CheckExact(obj));
}

static TyObject *
list_new(TyObject* Py_UNUSED(module), TyObject *obj)
{
    return TyList_New(TyLong_AsSsize_t(obj));
}

static TyObject *
list_size(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TyList_Size(obj));
}

static TyObject *
list_getitem(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    NULLABLE(obj);
    return Ty_XNewRef(TyList_GetItem(obj, i));
}

static TyObject *
list_get_item_ref(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    NULLABLE(obj);
    return TyList_GetItemRef(obj, i);
}

static TyObject *
list_setitem(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "OnO", &obj, &i, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    RETURN_INT(TyList_SetItem(obj, i, Ty_XNewRef(value)));

}

static TyObject *
list_insert(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value;
    Ty_ssize_t where;
    if (!TyArg_ParseTuple(args, "OnO", &obj, &where, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    RETURN_INT(TyList_Insert(obj, where, Ty_XNewRef(value)));

}

static TyObject *
list_append(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value;
    if (!TyArg_ParseTuple(args, "OO", &obj, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    RETURN_INT(TyList_Append(obj, value));
}

static TyObject *
list_getslice(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t ilow, ihigh;
    if (!TyArg_ParseTuple(args, "Onn", &obj, &ilow, &ihigh)) {
        return NULL;
    }
    NULLABLE(obj);
    return TyList_GetSlice(obj, ilow, ihigh);

}

static TyObject *
list_setslice(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value;
    Ty_ssize_t ilow, ihigh;
    if (!TyArg_ParseTuple(args, "OnnO", &obj, &ilow, &ihigh, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    RETURN_INT(TyList_SetSlice(obj, ilow, ihigh, value));
}

static TyObject *
list_sort(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TyList_Sort(obj));
}

static TyObject *
list_reverse(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TyList_Reverse(obj));
}

static TyObject *
list_astuple(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyList_AsTuple(obj);
}


static TyMethodDef test_methods[] = {
    {"list_check", list_check, METH_O},
    {"list_check_exact", list_check_exact, METH_O},
    {"list_new", list_new, METH_O},
    {"list_size", list_size, METH_O},
    {"list_getitem", list_getitem, METH_VARARGS},
    {"list_get_item_ref", list_get_item_ref, METH_VARARGS},
    {"list_setitem", list_setitem, METH_VARARGS},
    {"list_insert", list_insert, METH_VARARGS},
    {"list_append", list_append, METH_VARARGS},
    {"list_getslice", list_getslice, METH_VARARGS},
    {"list_setslice", list_setslice, METH_VARARGS},
    {"list_sort", list_sort, METH_O},
    {"list_reverse", list_reverse, METH_O},
    {"list_astuple", list_astuple, METH_O},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_List(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
