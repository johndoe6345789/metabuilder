#include "parts.h"
#include "util.h"


static TyType_Slot HeapTypeNameType_slots[] = {
    {0},
};

static TyType_Spec HeapTypeNameType_Spec = {
    .name = "_testcapi.HeapTypeNameType",
    .basicsize = sizeof(TyObject),
    .flags = Ty_TPFLAGS_DEFAULT,
    .slots = HeapTypeNameType_slots,
};

static TyObject *
get_heaptype_for_name(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return TyType_FromSpec(&HeapTypeNameType_Spec);
}


static TyObject *
get_type_name(TyObject *self, TyObject *type)
{
    assert(TyType_Check(type));
    return TyType_GetName((TyTypeObject *)type);
}


static TyObject *
get_type_qualname(TyObject *self, TyObject *type)
{
    assert(TyType_Check(type));
    return TyType_GetQualName((TyTypeObject *)type);
}


static TyObject *
get_type_fullyqualname(TyObject *self, TyObject *type)
{
    assert(TyType_Check(type));
    return TyType_GetFullyQualifiedName((TyTypeObject *)type);
}


static TyObject *
get_type_module_name(TyObject *self, TyObject *type)
{
    assert(TyType_Check(type));
    return TyType_GetModuleName((TyTypeObject *)type);
}


static TyObject *
test_get_type_dict(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    /* Test for TyType_GetDict */

    // Assert ints have a `to_bytes` method
    TyObject *long_dict = TyType_GetDict(&TyLong_Type);
    assert(long_dict);
    assert(TyDict_GetItemString(long_dict, "to_bytes")); // borrowed ref
    Ty_DECREF(long_dict);

    // Make a new type, add an attribute to it and assert it's there
    TyObject *HeapTypeNameType = TyType_FromSpec(&HeapTypeNameType_Spec);
    assert(HeapTypeNameType);
    assert(PyObject_SetAttrString(
        HeapTypeNameType, "new_attr", Ty_NewRef(Ty_None)) >= 0);
    TyObject *type_dict = TyType_GetDict((TyTypeObject*)HeapTypeNameType);
    assert(type_dict);
    assert(TyDict_GetItemString(type_dict, "new_attr")); // borrowed ref
    Ty_DECREF(HeapTypeNameType);
    Ty_DECREF(type_dict);
    Py_RETURN_NONE;
}


static TyObject *
test_get_statictype_slots(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    newfunc tp_new = TyType_GetSlot(&TyLong_Type, Ty_tp_new);
    if (TyLong_Type.tp_new != tp_new) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: tp_new of long");
        return NULL;
    }

    reprfunc tp_repr = TyType_GetSlot(&TyLong_Type, Ty_tp_repr);
    if (TyLong_Type.tp_repr != tp_repr) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: tp_repr of long");
        return NULL;
    }

    ternaryfunc tp_call = TyType_GetSlot(&TyLong_Type, Ty_tp_call);
    if (tp_call != NULL) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: tp_call of long");
        return NULL;
    }

    binaryfunc nb_add = TyType_GetSlot(&TyLong_Type, Ty_nb_add);
    if (TyLong_Type.tp_as_number->nb_add != nb_add) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: nb_add of long");
        return NULL;
    }

    lenfunc mp_length = TyType_GetSlot(&TyLong_Type, Ty_mp_length);
    if (mp_length != NULL) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: mp_length of long");
        return NULL;
    }

    void *over_value = TyType_GetSlot(&TyLong_Type, Ty_bf_releasebuffer + 1);
    if (over_value != NULL) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: max+1 of long");
        return NULL;
    }

    tp_new = TyType_GetSlot(&TyLong_Type, 0);
    if (tp_new != NULL) {
        TyErr_SetString(TyExc_AssertionError, "mismatch: slot 0 of long");
        return NULL;
    }
    if (TyErr_ExceptionMatches(TyExc_SystemError)) {
        // This is the right exception
        TyErr_Clear();
    }
    else {
        return NULL;
    }

    Py_RETURN_NONE;
}


// Get type->tp_version_tag
static TyObject *
type_get_version(TyObject *self, TyObject *type)
{
    if (!TyType_Check(type)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyObject *res = TyLong_FromUnsignedLong(
        ((TyTypeObject *)type)->tp_version_tag);
    if (res == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    return res;
}

static TyObject *
type_modified(TyObject *self, TyObject *arg)
{
    if (!TyType_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject*)arg;

    TyType_Modified(type);
    Py_RETURN_NONE;
}


static TyObject *
type_assign_version(TyObject *self, TyObject *arg)
{
    if (!TyType_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject*)arg;

    int res = PyUnstable_Type_AssignVersionTag(type);
    return TyLong_FromLong(res);
}


static TyObject *
type_get_tp_bases(TyObject *self, TyObject *arg)
{
    if (!TyType_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject*)arg;

    TyObject *bases = type->tp_bases;
    if (bases == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(bases);
}

static TyObject *
type_get_tp_mro(TyObject *self, TyObject *arg)
{
    if (!TyType_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject*)arg;

    TyObject *mro = ((TyTypeObject *)type)->tp_mro;
    if (mro == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(mro);
}


static TyObject *
type_freeze(TyObject *module, TyObject *arg)
{
    if (!TyType_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a type");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject*)arg;

    if (TyType_Freeze(type) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"get_heaptype_for_name", get_heaptype_for_name, METH_NOARGS},
    {"get_type_name", get_type_name, METH_O},
    {"get_type_qualname",  get_type_qualname, METH_O},
    {"get_type_fullyqualname", get_type_fullyqualname, METH_O},
    {"get_type_module_name", get_type_module_name, METH_O},
    {"test_get_type_dict", test_get_type_dict, METH_NOARGS},
    {"test_get_statictype_slots", test_get_statictype_slots,     METH_NOARGS},
    {"type_get_version", type_get_version, METH_O, TyDoc_STR("type->tp_version_tag")},
    {"type_modified", type_modified, METH_O, TyDoc_STR("TyType_Modified")},
    {"type_assign_version", type_assign_version, METH_O, TyDoc_STR("PyUnstable_Type_AssignVersionTag")},
    {"type_get_tp_bases", type_get_tp_bases, METH_O},
    {"type_get_tp_mro", type_get_tp_mro, METH_O},
    {"type_freeze", type_freeze, METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Type(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
