#include "parts.h"
#include "util.h"


static TyObject *
object_getoptionalattr(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name, *value = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);

    switch (PyObject_GetOptionalAttr(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_AttributeError);
        case 1:
            return value;
        default:
            Ty_FatalError("PyObject_GetOptionalAttr() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
object_getoptionalattrstring(TyObject *self, TyObject *args)
{
    TyObject *obj, *value = UNINITIALIZED_PTR;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);

    switch (PyObject_GetOptionalAttrString(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_AttributeError);
        case 1:
            return value;
        default:
            Ty_FatalError("PyObject_GetOptionalAttrString() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
object_hasattrwitherror(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);
    RETURN_INT(PyObject_HasAttrWithError(obj, attr_name));
}

static TyObject *
object_hasattrstringwitherror(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);
    RETURN_INT(PyObject_HasAttrStringWithError(obj, attr_name));
}

static TyObject *
mapping_getoptionalitemstring(TyObject *self, TyObject *args)
{
    TyObject *obj, *value = UNINITIALIZED_PTR;
    const char *attr_name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Oz#", &obj, &attr_name, &size)) {
        return NULL;
    }
    NULLABLE(obj);

    switch (PyMapping_GetOptionalItemString(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_KeyError);
        case 1:
            return value;
        default:
            Ty_FatalError("PyMapping_GetOptionalItemString() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
mapping_getoptionalitem(TyObject *self, TyObject *args)
{
    TyObject *obj, *attr_name, *value = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "OO", &obj, &attr_name)) {
        return NULL;
    }
    NULLABLE(obj);
    NULLABLE(attr_name);

    switch (PyMapping_GetOptionalItem(obj, attr_name, &value)) {
        case -1:
            assert(value == NULL);
            return NULL;
        case 0:
            assert(value == NULL);
            return Ty_NewRef(TyExc_KeyError);
        case 1:
            return value;
        default:
            Ty_FatalError("PyMapping_GetOptionalItem() returned invalid code");
            Ty_UNREACHABLE();
    }
}

static TyObject *
pyiter_next(TyObject *self, TyObject *iter)
{
    TyObject *item = TyIter_Next(iter);
    if (item == NULL && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }
    return item;
}

static TyObject *
pyiter_nextitem(TyObject *self, TyObject *iter)
{
    TyObject *item;
    int rc = TyIter_NextItem(iter, &item);
    if (rc < 0) {
        assert(TyErr_Occurred());
        assert(item == NULL);
        return NULL;
    }
    assert(!TyErr_Occurred());
    if (item == NULL) {
        Py_RETURN_NONE;
    }
    return item;
}


static TyObject *
sequence_fast_get_size(TyObject *self, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromSsize_t(PySequence_Fast_GET_SIZE(obj));
}


static TyObject *
sequence_fast_get_item(TyObject *self, TyObject *args)
{
    TyObject *obj;
    Ty_ssize_t index;
    if (!TyArg_ParseTuple(args, "On", &obj, &index)) {
        return NULL;
    }
    NULLABLE(obj);
    return PySequence_Fast_GET_ITEM(obj, index);
}


static TyMethodDef test_methods[] = {
    {"object_getoptionalattr", object_getoptionalattr, METH_VARARGS},
    {"object_getoptionalattrstring", object_getoptionalattrstring, METH_VARARGS},
    {"object_hasattrwitherror", object_hasattrwitherror, METH_VARARGS},
    {"object_hasattrstringwitherror", object_hasattrstringwitherror, METH_VARARGS},
    {"mapping_getoptionalitem", mapping_getoptionalitem, METH_VARARGS},
    {"mapping_getoptionalitemstring", mapping_getoptionalitemstring, METH_VARARGS},

    {"TyIter_Next", pyiter_next, METH_O},
    {"TyIter_NextItem", pyiter_nextitem, METH_O},

    {"sequence_fast_get_size", sequence_fast_get_size, METH_O},
    {"sequence_fast_get_item", sequence_fast_get_item, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Abstract(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
