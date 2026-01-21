#include "parts.h"
#include "util.h"


static TyObject *
list_get_size(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TyList_GET_SIZE(obj));
}


static TyObject *
list_get_item(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &obj, &i)) {
        return NULL;
    }
    NULLABLE(obj);
    return Ty_XNewRef(TyList_GET_ITEM(obj, i));
}


static TyObject *
list_set_item(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *value;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "OnO", &obj, &i, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    TyList_SET_ITEM(obj, i, Ty_XNewRef(value));
    Py_RETURN_NONE;

}


static TyObject *
list_clear(TyObject* Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    RETURN_INT(TyList_Clear(obj));
}


static TyObject *
list_extend(TyObject* Py_UNUSED(module), TyObject *args)
{
    TyObject *obj, *arg;
    if (!TyArg_ParseTuple(args, "OO", &obj, &arg)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(arg);
    RETURN_INT(TyList_Extend(obj, arg));
}


static TyObject*
test_list_api(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* list;
    int i;

    /* SF bug 132008:  TyList_Reverse segfaults */
#define NLIST 30
    list = TyList_New(NLIST);
    if (list == (TyObject*)NULL)
        return (TyObject*)NULL;
    /* list = range(NLIST) */
    for (i = 0; i < NLIST; ++i) {
        TyObject* anint = TyLong_FromLong(i);
        if (anint == (TyObject*)NULL) {
            Ty_DECREF(list);
            return (TyObject*)NULL;
        }
        TyList_SET_ITEM(list, i, anint);
    }
    /* list.reverse(), via TyList_Reverse() */
    i = TyList_Reverse(list);   /* should not blow up! */
    if (i != 0) {
        Ty_DECREF(list);
        return (TyObject*)NULL;
    }
    /* Check that list == range(29, -1, -1) now */
    for (i = 0; i < NLIST; ++i) {
        TyObject* anint = TyList_GET_ITEM(list, i);
        if (TyLong_AS_LONG(anint) != NLIST-1-i) {
            TyErr_SetString(TyExc_AssertionError,
                            "test_list_api: reverse screwed up");
            Ty_DECREF(list);
            return (TyObject*)NULL;
        }
    }
    Ty_DECREF(list);
#undef NLIST

    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"list_get_size", list_get_size, METH_O},
    {"list_get_item", list_get_item, METH_VARARGS},
    {"list_set_item", list_set_item, METH_VARARGS},
    {"list_clear", list_clear, METH_O},
    {"list_extend", list_extend, METH_VARARGS},
    {"test_list_api", test_list_api, METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_List(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
