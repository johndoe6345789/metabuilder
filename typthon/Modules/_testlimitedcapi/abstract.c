#include "parts.h"
#include "util.h"


static TyObject *
object_repr(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return PyObject_Repr(arg);
}

static TyObject *
object_ascii(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return PyObject_ASCII(arg);
}

static TyObject *
object_str(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return PyObject_Str(arg);
}

static TyObject *
object_bytes(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return PyObject_Bytes(arg);
}

static TyObject *
object_getattr(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);
    return PyObject_GetAttr(obj, attr_name);
}

static TyObject *
object_getattrstring(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);
    return PyObject_GetAttrString(obj, attr_name);
}

static TyObject *
object_hasattr(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);
    return TyLong_FromLong(PyObject_HasAttr(obj, attr_name));
}

static TyObject *
object_hasattrstring(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);
    return TyLong_FromLong(PyObject_HasAttrString(obj, attr_name));
}

static TyObject *
object_setattr(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name, *value;
    if (!TyArg_ParseTuple(args, "OOO", &obj, &attr_name, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);
    NULLABLE(value);
    RETURN_INT(PyObject_SetAttr(obj, attr_name, value));
}

static TyObject *
object_setattrstring(TyObject *self, TyObject *args)
{
    TyObject *obj, *value;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#O", &obj, &attr_name, &size, &value)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(value);
    RETURN_INT(PyObject_SetAttrString(obj, attr_name, value));
}

static TyObject *
object_delattr(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name;
if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);
    RETURN_INT(PyObject_DelAttr(obj, attr_name));
}

static TyObject *
object_delattrstring(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);
    RETURN_INT(PyObject_DelAttrString(obj, attr_name));
}

static TyObject *
number_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyBool_FromLong(PyNumber_Check(obj));
}

static TyObject *
mapping_check(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(PyMapping_Check(obj));
}

static TyObject *
mapping_size(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(PyMapping_Size(obj));
}

static TyObject *
mapping_length(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(PyMapping_Length(obj));
}

static TyObject *
object_getitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    return PyObject_GetItem(mapping, key);
}

static TyObject *
mapping_getitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    return PyMapping_GetItemString(mapping, key);
}

static TyObject *
mapping_haskey(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    return TyLong_FromLong(PyMapping_HasKey(mapping, key));
}

static TyObject *
mapping_haskeystring(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    return TyLong_FromLong(PyMapping_HasKeyString(mapping, key));
}

static TyObject *
mapping_haskeywitherror(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    RETURN_INT(PyMapping_HasKeyWithError(mapping, key));
}

static TyObject *
mapping_haskeystringwitherror(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    RETURN_INT(PyMapping_HasKeyStringWithError(mapping, key));
}

static TyObject *
object_setitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key, *value;
    if (!TyArg_ParseTuple(args, "OOO", &mapping, &key, &value)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    NULLABLE(value);
    RETURN_INT(PyObject_SetItem(mapping, key, value));
}

static TyObject *
mapping_setitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping, *value;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#O", &mapping, &key, &size, &value)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(value);
    RETURN_INT(PyMapping_SetItemString(mapping, key, value));
}

static TyObject *
object_delitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    RETURN_INT(PyObject_DelItem(mapping, key));
}

static TyObject *
mapping_delitem(TyObject *self, TyObject *args)
{
    TyObject *mapping, *key;
    if (!TyArg_ParseTuple(args, "OO", &mapping, &key)) {
        return NULL;
    }
    NULLABLE(mapping);
    NULLABLE(key);
    RETURN_INT(PyMapping_DelItem(mapping, key));
}

static TyObject *
mapping_delitemstring(TyObject *self, TyObject *args)
{
    TyObject *mapping;
    const char *key;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &mapping, &key, &size)) {
        return NULL;
    }
    NULLABLE(mapping);
    RETURN_INT(PyMapping_DelItemString(mapping, key));
}

static TyObject *
mapping_keys(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PyMapping_Keys(obj);
}

static TyObject *
mapping_values(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PyMapping_Values(obj);
}

static TyObject *
mapping_items(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PyMapping_Items(obj);
}


static TyObject *
sequence_check(TyObject* self, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(PySequence_Check(obj));
}

static TyObject *
sequence_size(TyObject* self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(PySequence_Size(obj));
}

static TyObject *
sequence_length(TyObject* self, TyObject *obj)
{
    NULLABLE(obj);
    RETURN_SIZE(PySequence_Length(obj));
}

static TyObject *
sequence_concat(TyObject *self, TyObject *args)
{
    TyObject *seq1, *seq2;
    if (!TyArg_ParseTuple(args, "OO", &seq1, &seq2)) {
        return NULL;
    }
    NULLABLE(seq1);
    NULLABLE(seq2);

    return PySequence_Concat(seq1, seq2);
}

static TyObject *
sequence_repeat(TyObject *self, TyObject *args)
{
    TyObject *seq;
    Ty_ssize_t count;
    if (!TyArg_ParseTuple(args, "On", &seq, &count)) {
        return NULL;
    }
    NULLABLE(seq);

    return PySequence_Repeat(seq, count);
}

static TyObject *
sequence_inplaceconcat(TyObject *self, TyObject *args)
{
    TyObject *seq1, *seq2;
    if (!TyArg_ParseTuple(args, "OO", &seq1, &seq2)) {
        return NULL;
    }
    NULLABLE(seq1);
    NULLABLE(seq2);

    return PySequence_InPlaceConcat(seq1, seq2);
}

static TyObject *
sequence_inplacerepeat(TyObject *self, TyObject *args)
{
    TyObject *seq;
    Ty_ssize_t count;
    if (!TyArg_ParseTuple(args, "On", &seq, &count)) {
        return NULL;
    }
    NULLABLE(seq);

    return PySequence_InPlaceRepeat(seq, count);
}

static TyObject *
sequence_getitem(TyObject *self, TyObject *args)
{
    TyObject *seq;
    Ty_ssize_t i;
    if (!TyArg_ParseTuple(args, "On", &seq, &i)) {
        return NULL;
    }
    NULLABLE(seq);

    return PySequence_GetItem(seq, i);
}

static TyObject *
sequence_setitem(TyObject *self, TyObject *args)
{
    Ty_ssize_t i;
    TyObject *seq, *val;
    if (!TyArg_ParseTuple(args, "OnO", &seq, &i, &val)) {
        return NULL;
    }
    NULLABLE(seq);
    NULLABLE(val);

    RETURN_INT(PySequence_SetItem(seq, i, val));
}


static TyObject *
sequence_delitem(TyObject *self, TyObject *args)
{
    Ty_ssize_t i;
    TyObject *seq;
    if (!TyArg_ParseTuple(args, "On", &seq, &i)) {
        return NULL;
    }
    NULLABLE(seq);

    RETURN_INT(PySequence_DelItem(seq, i));
}

static TyObject *
sequence_setslice(TyObject* self, TyObject *args)
{
    TyObject *sequence, *obj;
    Ty_ssize_t i1, i2;
    if (!TyArg_ParseTuple(args, "OnnO", &sequence, &i1, &i2, &obj)) {
        return NULL;
    }
    NULLABLE(sequence);
    NULLABLE(obj);

    RETURN_INT(PySequence_SetSlice(sequence, i1, i2, obj));
}

static TyObject *
sequence_delslice(TyObject *self, TyObject *args)
{
    TyObject *sequence;
    Ty_ssize_t i1, i2;
    if (!TyArg_ParseTuple(args, "Onn", &sequence, &i1, &i2)) {
        return NULL;
    }
    NULLABLE(sequence);

    RETURN_INT(PySequence_DelSlice(sequence, i1, i2));
}

static TyObject *
sequence_count(TyObject *self, TyObject *args)
{
    TyObject *seq, *value;
    if (!TyArg_ParseTuple(args, "OO", &seq, &value)) {
        return NULL;
    }
    NULLABLE(seq);
    NULLABLE(value);

    RETURN_SIZE(PySequence_Count(seq, value));
}

static TyObject *
sequence_contains(TyObject *self, TyObject *args)
{
    TyObject *seq, *value;
    if (!TyArg_ParseTuple(args, "OO", &seq, &value)) {
        return NULL;
    }
    NULLABLE(seq);
    NULLABLE(value);

    RETURN_INT(PySequence_Contains(seq, value));
}

static TyObject *
sequence_index(TyObject *self, TyObject *args)
{
    TyObject *seq, *value;
    if (!TyArg_ParseTuple(args, "OO", &seq, &value)) {
        return NULL;
    }
    NULLABLE(seq);
    NULLABLE(value);

    RETURN_SIZE(PySequence_Index(seq, value));
}

static TyObject *
sequence_list(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PySequence_List(obj);
}

static TyObject *
sequence_tuple(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return PySequence_Tuple(obj);
}


static TyObject *
sequence_fast(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *err_msg;
    if (!TyArg_ParseTuple(args, "Os", &obj, &err_msg)) {
        return NULL;
    }
    NULLABLE(obj);
    return PySequence_Fast(obj, err_msg);
}


static TyMethodDef test_methods[] = {
    {"object_repr", object_repr, METH_O},
    {"object_ascii", object_ascii, METH_O},
    {"object_str", object_str, METH_O},
    {"object_bytes", object_bytes, METH_O},

    {"object_getattr", object_getattr, METH_VARARGS},
    {"object_getattrstring", object_getattrstring, METH_VARARGS},
    {"object_hasattr", object_hasattr, METH_VARARGS},
    {"object_hasattrstring", object_hasattrstring, METH_VARARGS},
    {"object_setattr", object_setattr, METH_VARARGS},
    {"object_setattrstring", object_setattrstring, METH_VARARGS},
    {"object_delattr", object_delattr, METH_VARARGS},
    {"object_delattrstring", object_delattrstring, METH_VARARGS},

    {"number_check", number_check, METH_O},
    {"mapping_check", mapping_check, METH_O},
    {"mapping_size", mapping_size, METH_O},
    {"mapping_length", mapping_length, METH_O},
    {"object_getitem", object_getitem, METH_VARARGS},
    {"mapping_getitemstring", mapping_getitemstring, METH_VARARGS},
    {"mapping_haskey", mapping_haskey, METH_VARARGS},
    {"mapping_haskeystring", mapping_haskeystring, METH_VARARGS},
    {"mapping_haskeywitherror", mapping_haskeywitherror, METH_VARARGS},
    {"mapping_haskeystringwitherror", mapping_haskeystringwitherror, METH_VARARGS},
    {"object_setitem", object_setitem, METH_VARARGS},
    {"mapping_setitemstring", mapping_setitemstring, METH_VARARGS},
    {"object_delitem", object_delitem, METH_VARARGS},
    {"mapping_delitem", mapping_delitem, METH_VARARGS},
    {"mapping_delitemstring", mapping_delitemstring, METH_VARARGS},
    {"mapping_keys", mapping_keys, METH_O},
    {"mapping_values", mapping_values, METH_O},
    {"mapping_items", mapping_items, METH_O},

    {"sequence_check", sequence_check, METH_O},
    {"sequence_size", sequence_size, METH_O},
    {"sequence_length", sequence_length, METH_O},
    {"sequence_concat", sequence_concat, METH_VARARGS},
    {"sequence_repeat", sequence_repeat, METH_VARARGS},
    {"sequence_inplaceconcat", sequence_inplaceconcat, METH_VARARGS},
    {"sequence_inplacerepeat", sequence_inplacerepeat, METH_VARARGS},
    {"sequence_getitem", sequence_getitem, METH_VARARGS},
    {"sequence_setitem", sequence_setitem, METH_VARARGS},
    {"sequence_delitem", sequence_delitem, METH_VARARGS},
    {"sequence_setslice", sequence_setslice, METH_VARARGS},
    {"sequence_delslice", sequence_delslice, METH_VARARGS},
    {"sequence_count", sequence_count, METH_VARARGS},
    {"sequence_contains", sequence_contains, METH_VARARGS},
    {"sequence_index", sequence_index, METH_VARARGS},
    {"sequence_list", sequence_list, METH_O},
    {"sequence_tuple", sequence_tuple, METH_O},
    {"sequence_fast", sequence_fast, METH_VARARGS},

    {NULL},
};

int
_PyTestLimitedCAPI_Init_Abstract(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
