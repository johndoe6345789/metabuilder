#include "parts.h"
#include "util.h"

static TyObject *
dict_containsstring(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &key, &size)) {
        return NULL;
    }
    NULLABLE(obj);
    RETURN_INT(TyDict_ContainsString(obj, key));
}

static TyObject *
dict_getitemref(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name, *value = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);

    switch (TyDict_GetItemRef(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_KeyError);
        case 1:
            return value;
        default:
            Ty_FatalError("PyMapping_GetItemRef() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
dict_getitemstringref(TyObject *self, TyObject *args)
{
    TyObject *obj, *value = UNINITIALIZED_PTR;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);

    switch (TyDict_GetItemStringRef(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_KeyError);
        case 1:
            return value;
        default:
            Ty_FatalError("TyDict_GetItemStringRef() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
dict_setdefault(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key, *defaultobj;
    if (!TyArg_ParseTuple(args, "OOO", &mapping, &key, &defaultobj)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    NULLABLE(defaultobj);
    return TyDict_SetDefault(mapping, key, defaultobj);
}

static TyObject *
dict_setdefaultref(TyObject *self, TyObject *args)
{
    TyObject *obj, *key, *default_value, *result = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "OOO", &obj, &key, &default_value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(key);
    NULLABLE(default_value);
    switch (TyDict_SetDefaultRef(obj, key, default_value, &result)) {
        case -1:
            assert(result == NULL);
            return NULL;
        case 0:
            assert(result == default_value);
            return result;
        case 1:
            return result;
        default:
            Ty_FatalError("TyDict_SetDefaultRef() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
dict_pop(TyObject *self, TyObject *args)
{
    // Test TyDict_Pop(dict, key, &value)
    TyObject *dict, *key;
    if (!TyArg_ParseTuple(args, "OO", &dict, &key)) {
        return NULL;
    }
    NULLABLE(dict);
    NULLABLE(key);
    TyObject *result = UNINITIALIZED_PTR;
    int res = TyDict_Pop(dict, key,  &result);
    if (res < 0) {
        assert(result == NULL);
        return NULL;
    }
    if (res == 0) {
        assert(result == NULL);
        result = Ty_NewRef(Ty_None);
    }
    else {
        assert(result != NULL);
    }
    return Ty_BuildValue("iN", res, result);
}

static TyObject *
dict_pop_null(TyObject *self, TyObject *args)
{
    // Test TyDict_Pop(dict, key, NULL)
    TyObject *dict, *key;
    if (!TyArg_ParseTuple(args, "OO", &dict, &key)) {
        return NULL;
    }
    NULLABLE(dict);
    NULLABLE(key);
    RETURN_INT(TyDict_Pop(dict, key,  NULL));
}

static TyObject *
dict_popstring(TyObject *self, TyObject *args)
{
    TyObject *dict;
    const char *key;
    Ty_ssize_t key_size;
    if (!TyArg_ParseTuple(args, "Oz#", &dict, &key, &key_size)) {
        return NULL;
    }
    NULLABLE(dict);
    TyObject *result = UNINITIALIZED_PTR;
    int res = TyDict_PopString(dict, key,  &result);
    if (res < 0) {
        assert(result == NULL);
        return NULL;
    }
    if (res == 0) {
        assert(result == NULL);
        result = Ty_NewRef(Ty_None);
    }
    else {
        assert(result != NULL);
    }
    return Ty_BuildValue("iN", res, result);
}

static TyObject *
dict_popstring_null(TyObject *self, TyObject *args)
{
    TyObject *dict;
    const char *key;
    Ty_ssize_t key_size;
    if (!TyArg_ParseTuple(args, "Oz#", &dict, &key, &key_size)) {
        return NULL;
    }
    NULLABLE(dict);
    RETURN_INT(TyDict_PopString(dict, key,  NULL));
}


static int
test_dict_inner(TyObject *self, int count)
{
    Ty_ssize_t pos = 0, iterations = 0;
    int i;
    TyObject *dict = TyDict_New();
    TyObject *v, *k;

    if (dict == NULL)
        return -1;

    for (i = 0; i < count; i++) {
        v = TyLong_FromLong(i);
        if (v == NULL) {
            goto error;
        }
        if (TyDict_SetItem(dict, v, v) < 0) {
            Ty_DECREF(v);
            goto error;
        }
        Ty_DECREF(v);
    }

    k = v = UNINITIALIZED_PTR;
    while (TyDict_Next(dict, &pos, &k, &v)) {
        TyObject *o;
        iterations++;

        assert(k != UNINITIALIZED_PTR);
        assert(v != UNINITIALIZED_PTR);
        i = TyLong_AS_LONG(v) + 1;
        o = TyLong_FromLong(i);
        if (o == NULL) {
            goto error;
        }
        if (TyDict_SetItem(dict, k, o) < 0) {
            Ty_DECREF(o);
            goto error;
        }
        Ty_DECREF(o);
        k = v = UNINITIALIZED_PTR;
    }
    assert(k == UNINITIALIZED_PTR);
    assert(v == UNINITIALIZED_PTR);

    Ty_DECREF(dict);

    if (iterations != count) {
        TyErr_SetString(
            TyExc_AssertionError,
            "test_dict_iteration: dict iteration went wrong ");
        return -1;
    } else {
        return 0;
    }
error:
    Ty_DECREF(dict);
    return -1;
}


static TyObject*
test_dict_iteration(TyObject* self, TyObject *Py_UNUSED(ignored))
{
    int i;

    for (i = 0; i < 200; i++) {
        if (test_dict_inner(self, i) < 0) {
            return NULL;
        }
    }

    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"dict_containsstring", dict_containsstring, METH_VARARGS},
    {"dict_getitemref", dict_getitemref, METH_VARARGS},
    {"dict_getitemstringref", dict_getitemstringref, METH_VARARGS},
    {"dict_setdefault", dict_setdefault, METH_VARARGS},
    {"dict_setdefaultref", dict_setdefaultref, METH_VARARGS},
    {"dict_pop", dict_pop, METH_VARARGS},
    {"dict_pop_null", dict_pop_null, METH_VARARGS},
    {"dict_popstring", dict_popstring, METH_VARARGS},
    {"dict_popstring_null", dict_popstring_null, METH_VARARGS},
    {"test_dict_iteration",     test_dict_iteration,             METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_Dict(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
