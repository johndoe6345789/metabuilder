#include "parts.h"
#include "util.h"


/* Test TyByteArray_Check() */
static TyObject *
bytearray_check(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyByteArray_Check(obj));
}

/* Test TyByteArray_CheckExact() */
static TyObject *
bytearray_checkexact(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyByteArray_CheckExact(obj));
}

/* Test TyByteArray_FromStringAndSize() */
static TyObject *
bytearray_fromstringandsize(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *s;
    Ty_ssize_t bsize;
    Ty_ssize_t size = -100;

    if (!TyArg_ParseTuple(args, "z#|n", &s, &bsize, &size)) {
        return NULL;
    }

    if (size == -100) {
        size = bsize;
    }
    return TyByteArray_FromStringAndSize(s, size);
}

/* Test TyByteArray_FromObject() */
static TyObject *
bytearray_fromobject(TyObject *Py_UNUSED(module), TyObject *arg)
{
    NULLABLE(arg);
    return TyByteArray_FromObject(arg);
}

/* Test TyByteArray_Size() */
static TyObject *
bytearray_size(TyObject *Py_UNUSED(module), TyObject *arg)
{
    NULLABLE(arg);
    RETURN_SIZE(TyByteArray_Size(arg));
}

/* Test TyUnicode_AsString() */
static TyObject *
bytearray_asstring(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t buflen;
    const char *s;

    if (!TyArg_ParseTuple(args, "On", &obj, &buflen))
        return NULL;

    NULLABLE(obj);
    s = TyByteArray_AsString(obj);
    if (s == NULL)
        return NULL;

    return TyByteArray_FromStringAndSize(s, buflen);
}

/* Test TyByteArray_Concat() */
static TyObject *
bytearray_concat(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *left, *right;

    if (!TyArg_ParseTuple(args, "OO", &left, &right))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    return TyByteArray_Concat(left, right);
}

/* Test TyByteArray_Resize() */
static TyObject *
bytearray_resize(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "On", &obj, &size))
        return NULL;

    NULLABLE(obj);
    RETURN_INT(TyByteArray_Resize(obj, size));
}


static TyMethodDef test_methods[] = {
    {"bytearray_check", bytearray_check, METH_O},
    {"bytearray_checkexact", bytearray_checkexact, METH_O},
    {"bytearray_fromstringandsize", bytearray_fromstringandsize, METH_VARARGS},
    {"bytearray_fromobject", bytearray_fromobject, METH_O},
    {"bytearray_size", bytearray_size, METH_O},
    {"bytearray_asstring", bytearray_asstring, METH_VARARGS},
    {"bytearray_concat", bytearray_concat, METH_VARARGS},
    {"bytearray_resize", bytearray_resize, METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_ByteArray(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
