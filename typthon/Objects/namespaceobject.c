// namespace object implementation

#include "Python.h"
#include "pycore_modsupport.h"    // _TyArg_NoPositional()
#include "pycore_namespace.h"     // _PyNamespace_Type

#include <stddef.h>               // offsetof()


typedef struct {
    PyObject_HEAD
    TyObject *ns_dict;
} _PyNamespaceObject;

#define _PyNamespace_CAST(op) _Py_CAST(_PyNamespaceObject*, (op))


static TyMemberDef namespace_members[] = {
    {"__dict__", _Ty_T_OBJECT, offsetof(_PyNamespaceObject, ns_dict), Py_READONLY},
    {NULL}
};


// Methods

static TyObject *
namespace_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *self;

    assert(type != NULL && type->tp_alloc != NULL);
    self = type->tp_alloc(type, 0);
    if (self != NULL) {
        _PyNamespaceObject *ns = (_PyNamespaceObject *)self;
        ns->ns_dict = TyDict_New();
        if (ns->ns_dict == NULL) {
            Ty_DECREF(ns);
            return NULL;
        }
    }
    return self;
}


static int
namespace_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    _PyNamespaceObject *ns = _PyNamespace_CAST(op);
    TyObject *arg = NULL;
    if (!TyArg_UnpackTuple(args, _TyType_Name(Ty_TYPE(ns)), 0, 1, &arg)) {
        return -1;
    }
    if (arg != NULL) {
        TyObject *dict;
        if (TyDict_CheckExact(arg)) {
            dict = Ty_NewRef(arg);
        }
        else {
            dict = PyObject_CallOneArg((TyObject *)&TyDict_Type, arg);
            if (dict == NULL) {
                return -1;
            }
        }
        int err = (!TyArg_ValidateKeywordArguments(dict) ||
                   TyDict_Update(ns->ns_dict, dict) < 0);
        Ty_DECREF(dict);
        if (err) {
            return -1;
        }
    }
    if (kwds == NULL) {
        return 0;
    }
    if (!TyArg_ValidateKeywordArguments(kwds)) {
        return -1;
    }
    return TyDict_Update(ns->ns_dict, kwds);
}


static void
namespace_dealloc(TyObject *op)
{
    _PyNamespaceObject *ns = _PyNamespace_CAST(op);
    PyObject_GC_UnTrack(ns);
    Ty_CLEAR(ns->ns_dict);
    Ty_TYPE(ns)->tp_free((TyObject *)ns);
}


static TyObject *
namespace_repr(TyObject *ns)
{
    int i, loop_error = 0;
    TyObject *pairs = NULL, *d = NULL, *keys = NULL, *keys_iter = NULL;
    TyObject *key;
    TyObject *separator, *pairsrepr, *repr = NULL;
    const char * name;

    name = Ty_IS_TYPE(ns, &_PyNamespace_Type) ? "namespace"
                                               : Ty_TYPE(ns)->tp_name;

    i = Ty_ReprEnter(ns);
    if (i != 0) {
        return i > 0 ? TyUnicode_FromFormat("%s(...)", name) : NULL;
    }

    pairs = TyList_New(0);
    if (pairs == NULL)
        goto error;

    assert(((_PyNamespaceObject *)ns)->ns_dict != NULL);
    d = Ty_NewRef(((_PyNamespaceObject *)ns)->ns_dict);

    keys = TyDict_Keys(d);
    if (keys == NULL)
        goto error;

    keys_iter = PyObject_GetIter(keys);
    if (keys_iter == NULL)
        goto error;

    while ((key = TyIter_Next(keys_iter)) != NULL) {
        if (TyUnicode_Check(key) && TyUnicode_GET_LENGTH(key) > 0) {
            TyObject *value, *item;

            int has_key = TyDict_GetItemRef(d, key, &value);
            if (has_key == 1) {
                item = TyUnicode_FromFormat("%U=%R", key, value);
                Ty_DECREF(value);
                if (item == NULL) {
                    loop_error = 1;
                }
                else {
                    loop_error = TyList_Append(pairs, item);
                    Ty_DECREF(item);
                }
            }
            else if (has_key < 0) {
                loop_error = 1;
            }
        }

        Ty_DECREF(key);
        if (loop_error)
            goto error;
    }

    if (TyErr_Occurred()) {
        goto error;
    }

    separator = TyUnicode_FromString(", ");
    if (separator == NULL)
        goto error;

    pairsrepr = TyUnicode_Join(separator, pairs);
    Ty_DECREF(separator);
    if (pairsrepr == NULL)
        goto error;

    repr = TyUnicode_FromFormat("%s(%S)", name, pairsrepr);
    Ty_DECREF(pairsrepr);

error:
    Ty_XDECREF(pairs);
    Ty_XDECREF(d);
    Ty_XDECREF(keys);
    Ty_XDECREF(keys_iter);
    Ty_ReprLeave(ns);

    return repr;
}


static int
namespace_traverse(TyObject *op, visitproc visit, void *arg)
{
    _PyNamespaceObject *ns = _PyNamespace_CAST(op);
    Ty_VISIT(ns->ns_dict);
    return 0;
}


static int
namespace_clear(TyObject *op)
{
    _PyNamespaceObject *ns = _PyNamespace_CAST(op);
    Ty_CLEAR(ns->ns_dict);
    return 0;
}


static TyObject *
namespace_richcompare(TyObject *self, TyObject *other, int op)
{
    if (PyObject_TypeCheck(self, &_PyNamespace_Type) &&
        PyObject_TypeCheck(other, &_PyNamespace_Type))
        return PyObject_RichCompare(((_PyNamespaceObject *)self)->ns_dict,
                                   ((_PyNamespaceObject *)other)->ns_dict, op);
    Py_RETURN_NOTIMPLEMENTED;
}


TyDoc_STRVAR(namespace_reduce__doc__, "Return state information for pickling");

static TyObject *
namespace_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    _PyNamespaceObject *ns = (_PyNamespaceObject*)op;
    TyObject *result, *args = TyTuple_New(0);

    if (!args)
        return NULL;

    result = TyTuple_Pack(3, (TyObject *)Ty_TYPE(ns), args, ns->ns_dict);
    Ty_DECREF(args);
    return result;
}


static TyObject *
namespace_replace(TyObject *self, TyObject *args, TyObject *kwargs)
{
    if (!_TyArg_NoPositional("__replace__", args)) {
        return NULL;
    }

    TyObject *result = PyObject_CallNoArgs((TyObject *)Ty_TYPE(self));
    if (!result) {
        return NULL;
    }
    if (TyDict_Update(((_PyNamespaceObject*)result)->ns_dict,
                      ((_PyNamespaceObject*)self)->ns_dict) < 0)
    {
        Ty_DECREF(result);
        return NULL;
    }
    if (kwargs) {
        if (TyDict_Update(((_PyNamespaceObject*)result)->ns_dict, kwargs) < 0) {
            Ty_DECREF(result);
            return NULL;
        }
    }
    return result;
}


static TyMethodDef namespace_methods[] = {
    {"__reduce__", namespace_reduce, METH_NOARGS,
     namespace_reduce__doc__},
    {"__replace__", _PyCFunction_CAST(namespace_replace), METH_VARARGS|METH_KEYWORDS,
     TyDoc_STR("__replace__($self, /, **changes)\n--\n\n"
        "Return a copy of the namespace object with new values for the specified attributes.")},
    {NULL,         NULL}  // sentinel
};


TyDoc_STRVAR(namespace_doc,
"SimpleNamespace(mapping_or_iterable=(), /, **kwargs)\n\
--\n\n\
A simple attribute-based namespace.");

TyTypeObject _PyNamespace_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "types.SimpleNamespace",                    /* tp_name */
    sizeof(_PyNamespaceObject),                 /* tp_basicsize */
    0,                                          /* tp_itemsize */
    namespace_dealloc,                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    namespace_repr,                             /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    PyObject_GenericSetAttr,                    /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,                    /* tp_flags */
    namespace_doc,                              /* tp_doc */
    namespace_traverse,                         /* tp_traverse */
    namespace_clear,                            /* tp_clear */
    namespace_richcompare,                      /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    namespace_methods,                          /* tp_methods */
    namespace_members,                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(_PyNamespaceObject, ns_dict),      /* tp_dictoffset */
    namespace_init,                             /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    namespace_new,                              /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
};


TyObject *
_PyNamespace_New(TyObject *kwds)
{
    TyObject *ns = namespace_new(&_PyNamespace_Type, NULL, NULL);
    if (ns == NULL)
        return NULL;

    if (kwds == NULL)
        return ns;
    if (TyDict_Update(((_PyNamespaceObject *)ns)->ns_dict, kwds) != 0) {
        Ty_DECREF(ns);
        return NULL;
    }

    return (TyObject *)ns;
}
