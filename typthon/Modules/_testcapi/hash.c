#include "parts.h"
#include "util.h"

static TyObject *
hash_getfuncdef(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(args))
{
    // bind PyHash_GetFuncDef()
    PyHash_FuncDef *def = PyHash_GetFuncDef();

    TyObject *types = TyImport_ImportModule("types");
    if (types == NULL) {
        return NULL;
    }

    TyObject *result = PyObject_CallMethod(types, "SimpleNamespace", NULL);
    Ty_DECREF(types);
    if (result == NULL) {
        return NULL;
    }

    // ignore PyHash_FuncDef.hash

    TyObject *value = TyUnicode_FromString(def->name);
    int res = PyObject_SetAttrString(result, "name", value);
    Ty_DECREF(value);
    if (res < 0) {
        return NULL;
    }

    value = TyLong_FromLong(def->hash_bits);
    res = PyObject_SetAttrString(result, "hash_bits", value);
    Ty_DECREF(value);
    if (res < 0) {
        return NULL;
    }

    value = TyLong_FromLong(def->seed_bits);
    res = PyObject_SetAttrString(result, "seed_bits", value);
    Ty_DECREF(value);
    if (res < 0) {
        return NULL;
    }

    return result;
}


static TyObject *
long_from_hash(Ty_hash_t hash)
{
    Ty_BUILD_ASSERT(sizeof(long long) >= sizeof(hash));
    return TyLong_FromLongLong(hash);
}


static TyObject *
hash_pointer(TyObject *Py_UNUSED(module), TyObject *arg)
{
    void *ptr = TyLong_AsVoidPtr(arg);
    if (ptr == NULL && TyErr_Occurred()) {
        return NULL;
    }

    Ty_hash_t hash = Ty_HashPointer(ptr);
    return long_from_hash(hash);
}


static TyObject *
hash_buffer(TyObject *Py_UNUSED(module), TyObject *args)
{
    char *ptr;
    Ty_ssize_t len;
    if (!TyArg_ParseTuple(args, "y#", &ptr, &len)) {
        return NULL;
    }

    Ty_hash_t hash = Ty_HashBuffer(ptr, len);
    return long_from_hash(hash);
}


static TyObject *
object_generichash(TyObject *Py_UNUSED(module), TyObject *arg)
{
    NULLABLE(arg);
    Ty_hash_t hash = PyObject_GenericHash(arg);
    return long_from_hash(hash);
}


static TyMethodDef test_methods[] = {
    {"hash_getfuncdef", hash_getfuncdef, METH_NOARGS},
    {"hash_pointer", hash_pointer, METH_O},
    {"hash_buffer", hash_buffer, METH_VARARGS},
    {"object_generichash", object_generichash, METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Hash(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
