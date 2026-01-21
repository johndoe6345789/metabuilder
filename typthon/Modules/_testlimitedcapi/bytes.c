#include "parts.h"
#include "util.h"


/* Test TyBytes_Check() */
static TyObject *
bytes_check(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyBytes_Check(obj));
}

/* Test TyBytes_CheckExact() */
static TyObject *
bytes_checkexact(TyObject *Py_UNUSED(module), TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyBytes_CheckExact(obj));
}

/* Test TyBytes_FromStringAndSize() */
static TyObject *
bytes_fromstringandsize(TyObject *Py_UNUSED(module), TyObject *args)
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
    return TyBytes_FromStringAndSize(s, size);
}

/* Test TyBytes_FromString() */
static TyObject *
bytes_fromstring(TyObject *Py_UNUSED(module), TyObject *arg)
{
    const char *s;
    Ty_ssize_t size;

    if (!TyArg_Parse(arg, "z#", &s, &size)) {
        return NULL;
    }
    return TyBytes_FromString(s);
}

/* Test TyBytes_FromObject() */
static TyObject *
bytes_fromobject(TyObject *Py_UNUSED(module), TyObject *arg)
{
    NULLABLE(arg);
    return TyBytes_FromObject(arg);
}

/* Test TyBytes_Size() */
static TyObject *
bytes_size(TyObject *Py_UNUSED(module), TyObject *arg)
{
    NULLABLE(arg);
    RETURN_SIZE(TyBytes_Size(arg));
}

/* Test TyUnicode_AsString() */
static TyObject *
bytes_asstring(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t buflen;
    const char *s;

    if (!TyArg_ParseTuple(args, "On", &obj, &buflen))
        return NULL;

    NULLABLE(obj);
    s = TyBytes_AsString(obj);
    if (s == NULL)
        return NULL;

    return TyBytes_FromStringAndSize(s, buflen);
}

/* Test TyBytes_AsStringAndSize() */
static TyObject *
bytes_asstringandsize(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t buflen;
    char *s = UNINITIALIZED_PTR;
    Ty_ssize_t size = UNINITIALIZED_SIZE;

    if (!TyArg_ParseTuple(args, "On", &obj, &buflen))
        return NULL;

    NULLABLE(obj);
    if (TyBytes_AsStringAndSize(obj, &s, &size) < 0) {
        return NULL;
    }

    if (s == NULL) {
        return Ty_BuildValue("(On)", Ty_None, size);
    }
    else {
        return Ty_BuildValue("(y#n)", s, buflen, size);
    }
}

static TyObject *
bytes_asstringandsize_null(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t buflen;
    char *s = UNINITIALIZED_PTR;

    if (!TyArg_ParseTuple(args, "On", &obj, &buflen))
        return NULL;

    NULLABLE(obj);
    if (TyBytes_AsStringAndSize(obj, &s, NULL) < 0) {
        return NULL;
    }

    if (s == NULL) {
        Py_RETURN_NONE;
    }
    else {
        return TyBytes_FromStringAndSize(s, buflen);
    }
}

/* Test TyBytes_Repr() */
static TyObject *
bytes_repr(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *obj;
    int smartquotes;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &smartquotes))
        return NULL;

    NULLABLE(obj);
    return TyBytes_Repr(obj, smartquotes);
}

/* Test TyBytes_Concat() */
static TyObject *
bytes_concat(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *left, *right;
    int new = 0;

    if (!TyArg_ParseTuple(args, "OO|p", &left, &right, &new))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    if (new) {
        assert(left != NULL);
        assert(TyBytes_CheckExact(left));
        left = TyBytes_FromStringAndSize(TyBytes_AsString(left),
                                         TyBytes_Size(left));
        if (left == NULL) {
            return NULL;
        }
    }
    else {
        Ty_XINCREF(left);
    }
    TyBytes_Concat(&left, right);
    if (left == NULL && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }
    return left;
}

/* Test TyBytes_ConcatAndDel() */
static TyObject *
bytes_concatanddel(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *left, *right;
    int new = 0;

    if (!TyArg_ParseTuple(args, "OO|p", &left, &right, &new))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    if (new) {
        assert(left != NULL);
        assert(TyBytes_CheckExact(left));
        left = TyBytes_FromStringAndSize(TyBytes_AsString(left),
                                         TyBytes_Size(left));
        if (left == NULL) {
            return NULL;
        }
    }
    else {
        Ty_XINCREF(left);
    }
    Ty_XINCREF(right);
    TyBytes_ConcatAndDel(&left, right);
    if (left == NULL && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }
    return left;
}

/* Test TyBytes_DecodeEscape() */
static TyObject *
bytes_decodeescape(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *s;
    Ty_ssize_t bsize;
    Ty_ssize_t size = -100;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "z#|zn", &s, &bsize, &errors, &size))
        return NULL;

    if (size == -100) {
        size = bsize;
    }
    return TyBytes_DecodeEscape(s, size, errors, 0, NULL);
}


static TyMethodDef test_methods[] = {
    {"bytes_check", bytes_check, METH_O},
    {"bytes_checkexact", bytes_checkexact, METH_O},
    {"bytes_fromstringandsize", bytes_fromstringandsize, METH_VARARGS},
    {"bytes_fromstring", bytes_fromstring, METH_O},
    {"bytes_fromobject", bytes_fromobject, METH_O},
    {"bytes_size", bytes_size, METH_O},
    {"bytes_asstring", bytes_asstring, METH_VARARGS},
    {"bytes_asstringandsize", bytes_asstringandsize, METH_VARARGS},
    {"bytes_asstringandsize_null", bytes_asstringandsize_null, METH_VARARGS},
    {"bytes_repr", bytes_repr, METH_VARARGS},
    {"bytes_concat", bytes_concat, METH_VARARGS},
    {"bytes_concatanddel", bytes_concatanddel, METH_VARARGS},
    {"bytes_decodeescape", bytes_decodeescape, METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Bytes(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
