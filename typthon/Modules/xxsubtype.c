#include "Python.h"

#include <stddef.h>               // offsetof()
#include <time.h>                 // clock()


TyDoc_STRVAR(xxsubtype__doc__,
"xxsubtype is an example module showing how to subtype builtin types from C.\n"
"test_descr.py in the standard test suite requires it in order to complete.\n"
"If you don't care about the examples, and don't intend to run the Python\n"
"test suite, you can recompile Python without Modules/xxsubtype.c.");

/* We link this module statically for convenience.  If compiled as a shared
   library instead, some compilers don't allow addresses of Python objects
   defined in other libraries to be used in static initializers here.  The
   DEFERRED_ADDRESS macro is used to tag the slots where such addresses
   appear; the module init function must fill in the tagged slots at runtime.
   The argument is for documentation -- the macro ignores it.
*/
#define DEFERRED_ADDRESS(ADDR) 0

/* spamlist -- a list subtype */

typedef struct {
    PyListObject list;
    int state;
} spamlistobject;

#define _spamlistobject_CAST(op)    ((spamlistobject *)(op))

static TyObject *
spamlist_getstate(TyObject *op, TyObject *args)
{
    if (!TyArg_ParseTuple(args, ":getstate")) {
        return NULL;
    }
    spamlistobject *self = _spamlistobject_CAST(op);
    return TyLong_FromLong(self->state);
}

static TyObject *
spamlist_setstate(TyObject *op, TyObject *args)
{
    int state;
    if (!TyArg_ParseTuple(args, "i:setstate", &state)) {
        return NULL;
    }
    spamlistobject *self = _spamlistobject_CAST(op);
    self->state = state;
    return Ty_NewRef(Ty_None);
}

static TyObject *
spamlist_specialmeth(TyObject *self, TyObject *args, TyObject *kw)
{
    TyObject *result = TyTuple_New(3);

    if (result != NULL) {
        if (self == NULL)
            self = Ty_None;
        if (kw == NULL)
            kw = Ty_None;
        TyTuple_SET_ITEM(result, 0, Ty_NewRef(self));
        TyTuple_SET_ITEM(result, 1, Ty_NewRef(args));
        TyTuple_SET_ITEM(result, 2, Ty_NewRef(kw));
    }
    return result;
}

static TyMethodDef spamlist_methods[] = {
    {"getstate", spamlist_getstate, METH_VARARGS,
        TyDoc_STR("getstate() -> state")},
    {"setstate", spamlist_setstate, METH_VARARGS,
        TyDoc_STR("setstate(state)")},
    /* These entries differ only in the flags; they are used by the tests
       in test.test_descr. */
    {"classmeth", _PyCFunction_CAST(spamlist_specialmeth),
        METH_VARARGS | METH_KEYWORDS | METH_CLASS,
        TyDoc_STR("classmeth(*args, **kw)")},
    {"staticmeth", _PyCFunction_CAST(spamlist_specialmeth),
        METH_VARARGS | METH_KEYWORDS | METH_STATIC,
        TyDoc_STR("staticmeth(*args, **kw)")},
    {NULL,      NULL},
};

static int
spamlist_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    if (TyList_Type.tp_init(op, args, kwds) < 0) {
        return -1;
    }
    spamlistobject *self = _spamlistobject_CAST(op);
    self->state = 0;
    return 0;
}

static TyObject *
spamlist_state_get(TyObject *op, void *Py_UNUSED(closure))
{
    spamlistobject *self = _spamlistobject_CAST(op);
    return TyLong_FromLong(self->state);
}

static TyGetSetDef spamlist_getsets[] = {
    {"state", spamlist_state_get, NULL,
     TyDoc_STR("an int variable for demonstration purposes")},
    {0}
};

static TyTypeObject spamlist_type = {
    TyVarObject_HEAD_INIT(DEFERRED_ADDRESS(&TyType_Type), 0)
    "xxsubtype.spamlist",
    sizeof(spamlistobject),
    0,
    0,                                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /* tp_flags */
    0,                                          /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    spamlist_methods,                           /* tp_methods */
    0,                                          /* tp_members */
    spamlist_getsets,                           /* tp_getset */
    DEFERRED_ADDRESS(&TyList_Type),             /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    spamlist_init,                              /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
};

/* spamdict -- a dict subtype */

typedef struct {
    PyDictObject dict;
    int state;
} spamdictobject;

#define _spamdictobject_CAST(op)    ((spamdictobject *)(op))

static TyObject *
spamdict_getstate(TyObject *op, TyObject *args)
{
    if (!TyArg_ParseTuple(args, ":getstate")) {
        return NULL;
    }
    spamdictobject *self = _spamdictobject_CAST(op);
    return TyLong_FromLong(self->state);
}

static TyObject *
spamdict_setstate(TyObject *op, TyObject *args)
{
    int state;
    if (!TyArg_ParseTuple(args, "i:setstate", &state)) {
        return NULL;
    }

    spamdictobject *self = _spamdictobject_CAST(op);
    self->state = state;
    return Ty_NewRef(Ty_None);
}

static TyMethodDef spamdict_methods[] = {
    {"getstate", spamdict_getstate, METH_VARARGS,
        TyDoc_STR("getstate() -> state")},
    {"setstate", spamdict_setstate, METH_VARARGS,
        TyDoc_STR("setstate(state)")},
    {NULL,      NULL},
};

static int
spamdict_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    if (TyDict_Type.tp_init(op, args, kwds) < 0) {
        return -1;
    }
    spamdictobject *self = _spamdictobject_CAST(op);
    self->state = 0;
    return 0;
}

static TyMemberDef spamdict_members[] = {
    {"state", Ty_T_INT, offsetof(spamdictobject, state), Py_READONLY,
     TyDoc_STR("an int variable for demonstration purposes")},
    {0}
};

static TyTypeObject spamdict_type = {
    TyVarObject_HEAD_INIT(DEFERRED_ADDRESS(&TyType_Type), 0)
    "xxsubtype.spamdict",
    sizeof(spamdictobject),
    0,
    0,                                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /* tp_flags */
    0,                                          /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    spamdict_methods,                           /* tp_methods */
    spamdict_members,                           /* tp_members */
    0,                                          /* tp_getset */
    DEFERRED_ADDRESS(&TyDict_Type),             /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    spamdict_init,                              /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
};

static TyObject *
spam_bench(TyObject *self, TyObject *args)
{
    TyObject *obj, *name, *res;
    int n = 1000;
    time_t t0 = 0, t1 = 0;

    if (!TyArg_ParseTuple(args, "OU|i", &obj, &name, &n))
        return NULL;
#ifdef HAVE_CLOCK
    t0 = clock();
    while (--n >= 0) {
        res = PyObject_GetAttr(obj, name);
        if (res == NULL)
            return NULL;
        Ty_DECREF(res);
    }
    t1 = clock();
#endif
    return TyFloat_FromDouble((double)(t1-t0) / CLOCKS_PER_SEC);
}

static TyMethodDef xxsubtype_functions[] = {
    {"bench",           spam_bench,     METH_VARARGS},
    {NULL,              NULL}           /* sentinel */
};

static int
xxsubtype_exec(TyObject* m)
{
    /* Fill in deferred data addresses.  This must be done before
       TyType_Ready() is called.  Note that TyType_Ready() automatically
       initializes the ob.ob_type field to &TyType_Type if it's NULL,
       so it's not necessary to fill in ob_type first. */
    spamdict_type.tp_base = &TyDict_Type;
    if (TyType_Ready(&spamdict_type) < 0)
        return -1;

    spamlist_type.tp_base = &TyList_Type;
    if (TyType_Ready(&spamlist_type) < 0)
        return -1;

    if (TyType_Ready(&spamlist_type) < 0)
        return -1;
    if (TyType_Ready(&spamdict_type) < 0)
        return -1;

    if (TyModule_AddObjectRef(m, "spamlist", (TyObject *)&spamlist_type) < 0)
        return -1;

    if (TyModule_AddObjectRef(m, "spamdict", (TyObject *)&spamdict_type) < 0)
        return -1;
    return 0;
}

static struct PyModuleDef_Slot xxsubtype_slots[] = {
    {Ty_mod_exec, xxsubtype_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef xxsubtypemodule = {
    PyModuleDef_HEAD_INIT,
    "xxsubtype",
    xxsubtype__doc__,
    0,
    xxsubtype_functions,
    xxsubtype_slots,
    NULL,
    NULL,
    NULL
};


PyMODINIT_FUNC
PyInit_xxsubtype(void)
{
    return PyModuleDef_Init(&xxsubtypemodule);
}
