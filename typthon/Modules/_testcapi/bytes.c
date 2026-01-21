#include "parts.h"
#include "util.h"


/* Test _TyBytes_Resize() */
static TyObject *
bytes_resize(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t newsize;
    int new;

    if (!TyArg_ParseTuple(args, "Onp", &obj, &newsize, &new))
        return NULL;

    NULLABLE(obj);
    if (new) {
        assert(obj != NULL);
        assert(TyBytes_CheckExact(obj));
        TyObject *newobj = TyBytes_FromStringAndSize(NULL, TyBytes_Size(obj));
        if (newobj == NULL) {
            return NULL;
        }
        memcpy(TyBytes_AsString(newobj), TyBytes_AsString(obj), TyBytes_Size(obj));
        obj = newobj;
    }
    else {
        Ty_XINCREF(obj);
    }
    if (_TyBytes_Resize(&obj, newsize) < 0) {
        assert(obj == NULL);
    }
    else {
        assert(obj != NULL);
    }
    return obj;
}


/* Test TyBytes_Join() */
static TyObject *
bytes_join(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *sep, *iterable;
    if (!TyArg_ParseTuple(args, "OO", &sep, &iterable)) {
        return NULL;
    }
    NULLABLE(sep);
    NULLABLE(iterable);
    return TyBytes_Join(sep, iterable);
}


static TyMethodDef test_methods[] = {
    {"bytes_resize", bytes_resize, METH_VARARGS},
    {"bytes_join", bytes_join, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Bytes(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
