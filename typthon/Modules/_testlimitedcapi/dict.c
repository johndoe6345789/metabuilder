#include "parts.h"
#include "util.h"


static TyObject *
dict_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyDict_Check(obj));
}

static TyObject *
dict_checkexact(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyDict_CheckExact(obj));
}

static TyObject *
dict_new(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return TyDict_New();
}

static TyObject *
dictproxy_new(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PyDictProxy_New(obj);
}

static TyObject *
dict_clear(TyObject *self, TyObject *obj)
{
    TyDict_Clear(obj);
    Py_RETURN_NONE;
}

static TyObject *
dict_copy(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyDict_Copy(obj);
}

static TyObject *
dict_contains(TyObject *self, TyObject *args)
{
    TyObject *obj, *key;
    if (!TyArg_ParseTuple(args, "OO", &obj, &key)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(key);
    RETURN_INT(TyDict_Contains(obj, key));
}

static TyObject *
dict_size(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(TyDict_Size(obj));
}

static TyObject *
dict_getitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    TyObject *value = TyDict_GetItem(mapping, key);
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        return Ty_NewRef(TyExc_KeyError);
    }
    return Ty_NewRef(value);
}

static TyObject *
dict_getitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    TyObject *value = TyDict_GetItemString(mapping, key);
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        return Ty_NewRef(TyExc_KeyError);
    }
    return Ty_NewRef(value);
}

static TyObject *
dict_getitemwitherror(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    TyObject *value = TyDict_GetItemWithError(mapping, key);
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        return Ty_NewRef(TyExc_KeyError);
    }
    return Ty_NewRef(value);
}


static TyObject *
dict_setitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key, *value;
    if (!TyArg_ParseTuple(args, "OOO", &mapping, &key, &value)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    NULLABLE(value);
    RETURN_INT(TyDict_SetItem(mapping, key, value));
}

static TyObject *
dict_setitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping, *value;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#O", &mapping, &key, &size, &value)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(value);
    RETURN_INT(TyDict_SetItemString(mapping, key, value));
}

static TyObject *
dict_delitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    RETURN_INT(TyDict_DelItem(mapping, key));
}

static TyObject *
dict_delitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    RETURN_INT(TyDict_DelItemString(mapping, key));
}

static TyObject *
dict_keys(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyDict_Keys(obj);
}

static TyObject *
dict_values(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyDict_Values(obj);
}

static TyObject *
dict_items(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyDict_Items(obj);
}

static TyObject *
dict_next(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key = UNINITIALIZED_PTR, *value = UNINITIALIZED_PTR;
    Ty_ssize_t pos;
    if (!TyArg_ParseTuple(args, "On", &mapping, &pos)) {
        return NULL;
    }
    NULLABLE(mapping);
    int rc = TyDict_Next(mapping, &pos, &key, &value);
    if (rc != 0) {
        return Ty_BuildValue("inOO", rc, pos, key, value);
    }
    assert(key == UNINITIALIZED_PTR);
    assert(value == UNINITIALIZED_PTR);
    if (TyErr_Occurred()) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
dict_merge(TyObject *self, TyObject *args)
{
    TyObject *mapping, *mapping2;
    int override;
    if (!TyArg_ParseTuple(args, "OOi", &mapping, &mapping2, &override)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(mapping2);
    RETURN_INT(TyDict_Merge(mapping, mapping2, override));
}

static TyObject *
dict_update(TyObject *self, TyObject *args)
{
    TyObject *mapping, *mapping2;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &mapping2)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(mapping2);
    RETURN_INT(TyDict_Update(mapping, mapping2));
}

static TyObject *
dict_mergefromseq2(TyObject *self, TyObject *args)
{
    TyObject *mapping, *seq;
    int override;
    if (!TyArg_ParseTuple(args, "OOi", &mapping, &seq, &override)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(seq);
    RETURN_INT(TyDict_MergeFromSeq2(mapping, seq, override));
}


static TyMethodDef test_methods[] = {
    {"dict_check", dict_check, METH_O},
    {"dict_checkexact", dict_checkexact, METH_O},
    {"dict_new", dict_new, METH_NOARGS},
    {"dictproxy_new", dictproxy_new, METH_O},
    {"dict_clear", dict_clear, METH_O},
    {"dict_copy", dict_copy, METH_O},
    {"dict_size", dict_size, METH_O},
    {"dict_getitem", dict_getitem, METH_VARARGS},
    {"dict_getitemwitherror", dict_getitemwitherror, METH_VARARGS},
    {"dict_getitemstring", dict_getitemstring, METH_VARARGS},
    {"dict_contains", dict_contains, METH_VARARGS},
    {"dict_setitem", dict_setitem, METH_VARARGS},
    {"dict_setitemstring", dict_setitemstring, METH_VARARGS},
    {"dict_delitem", dict_delitem, METH_VARARGS},
    {"dict_delitemstring", dict_delitemstring, METH_VARARGS},
    {"dict_keys", dict_keys, METH_O},
    {"dict_values", dict_values, METH_O},
    {"dict_items", dict_items, METH_O},
    {"dict_next", dict_next, METH_VARARGS},
    {"dict_merge", dict_merge, METH_VARARGS},
    {"dict_update", dict_update, METH_VARARGS},
    {"dict_mergefromseq2", dict_mergefromseq2, METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Dict(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
