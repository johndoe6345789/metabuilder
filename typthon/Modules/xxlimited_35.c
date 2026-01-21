
/* This module is compiled using limited API from Python 3.5,
 * making sure that it works as expected.
 *
 * See the xxlimited module for an extension module template.
 */

// Test the limited C API version 3.5
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x03050000
#endif

#include "Python.h"

/* Xxo objects */

static TyObject *ErrorObject;

typedef struct {
    PyObject_HEAD
    TyObject            *x_attr;        /* Attributes dictionary */
} XxoObject;

static TyObject *Xxo_Type;

#define XxoObject_CAST(op)  ((XxoObject *)(op))
#define XxoObject_Check(v)  Ty_IS_TYPE(v, Xxo_Type)

static XxoObject *
newXxoObject(TyObject *arg)
{
    XxoObject *self;
    self = PyObject_GC_New(XxoObject, (TyTypeObject*)Xxo_Type);
    if (self == NULL)
        return NULL;
    self->x_attr = NULL;
    return self;
}

/* Xxo methods */

static int
Xxo_traverse(TyObject *op, visitproc visit, void *arg)
{
    XxoObject *self = XxoObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->x_attr);
    return 0;
}

static int
Xxo_clear(TyObject *op)
{
    XxoObject *self = XxoObject_CAST(op);
    Ty_CLEAR(self->x_attr);
    return 0;
}

static void
Xxo_finalize(TyObject *op)
{
    XxoObject *self = XxoObject_CAST(op);
    Ty_CLEAR(self->x_attr);
}

static TyObject *
Xxo_demo(TyObject *self, TyObject *args)
{
    TyObject *o = NULL;
    if (!TyArg_ParseTuple(args, "|O:demo", &o)) {
        return NULL;
    }
    /* Test availability of fast type checks */
    if (o != NULL && TyUnicode_Check(o)) {
        return Ty_NewRef(o);
    }
    return Ty_NewRef(Ty_None);
}

static TyMethodDef Xxo_methods[] = {
    {"demo", Xxo_demo,  METH_VARARGS, TyDoc_STR("demo() -> None")},
    {NULL, NULL}  /* sentinel */
};

static TyObject *
Xxo_getattro(TyObject *op, TyObject *name)
{
    XxoObject *self = XxoObject_CAST(op);
    if (self->x_attr != NULL) {
        TyObject *v = TyDict_GetItemWithError(self->x_attr, name);
        if (v != NULL) {
            return Ty_NewRef(v);
        }
        else if (TyErr_Occurred()) {
            return NULL;
        }
    }
    return PyObject_GenericGetAttr(op, name);
}

static int
Xxo_setattr(TyObject *op, char *name, TyObject *v)
{
    XxoObject *self = XxoObject_CAST(op);
    if (self->x_attr == NULL) {
        self->x_attr = TyDict_New();
        if (self->x_attr == NULL) {
            return -1;
        }
    }
    if (v == NULL) {
        int rv = TyDict_DelItemString(self->x_attr, name);
        if (rv < 0 && TyErr_ExceptionMatches(TyExc_KeyError)) {
            TyErr_SetString(TyExc_AttributeError,
                            "delete non-existing Xxo attribute");
        }
        return rv;
    }
    return TyDict_SetItemString(self->x_attr, name, v);
}

static TyType_Slot Xxo_Type_slots[] = {
    {Ty_tp_doc, "The Xxo type"},
    {Ty_tp_traverse, Xxo_traverse},
    {Ty_tp_clear, Xxo_clear},
    {Ty_tp_finalize, Xxo_finalize},
    {Ty_tp_getattro, Xxo_getattro},
    {Ty_tp_setattr, Xxo_setattr},
    {Ty_tp_methods, Xxo_methods},
    {0, 0},
};

static TyType_Spec Xxo_Type_spec = {
    "xxlimited_35.Xxo",
    sizeof(XxoObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    Xxo_Type_slots
};

/* --------------------------------------------------------------------- */

/* Function of two integers returning integer */

TyDoc_STRVAR(xx_foo_doc,
"foo(i,j)\n\
\n\
Return the sum of i and j.");

static TyObject *
xx_foo(TyObject *self, TyObject *args)
{
    long i, j;
    long res;
    if (!TyArg_ParseTuple(args, "ll:foo", &i, &j))
        return NULL;
    res = i+j; /* XXX Do something here */
    return TyLong_FromLong(res);
}


/* Function of no arguments returning new Xxo object */

static TyObject *
xx_new(TyObject *self, TyObject *args)
{
    XxoObject *rv;

    if (!TyArg_ParseTuple(args, ":new"))
        return NULL;
    rv = newXxoObject(args);
    if (rv == NULL)
        return NULL;
    return (TyObject *)rv;
}

/* Test bad format character */

static TyObject *
xx_roj(TyObject *self, TyObject *args)
{
    TyObject *a;
    long b;
    if (!TyArg_ParseTuple(args, "O#:roj", &a, &b))
        return NULL;
    return Ty_NewRef(Ty_None);
}


/* ---------- */

static TyType_Slot Str_Type_slots[] = {
    {Ty_tp_base, NULL}, /* filled out in module init function */
    {0, 0},
};

static TyType_Spec Str_Type_spec = {
    "xxlimited_35.Str",
    0,
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    Str_Type_slots
};

/* ---------- */

static TyObject *
null_richcompare(TyObject *self, TyObject *other, int op)
{
    Py_RETURN_NOTIMPLEMENTED;
}

static TyType_Slot Null_Type_slots[] = {
    {Ty_tp_base, NULL}, /* filled out in module init */
    {Ty_tp_new, NULL},
    {Ty_tp_richcompare, null_richcompare},
    {0, 0}
};

static TyType_Spec Null_Type_spec = {
    "xxlimited_35.Null",
    0,               /* basicsize */
    0,               /* itemsize */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    Null_Type_slots
};

/* ---------- */

/* List of functions defined in the module */

static TyMethodDef xx_methods[] = {
    {"roj",             xx_roj,         METH_VARARGS,
        TyDoc_STR("roj(a,b) -> None")},
    {"foo",             xx_foo,         METH_VARARGS,
        xx_foo_doc},
    {"new",             xx_new,         METH_VARARGS,
        TyDoc_STR("new() -> new Xx object")},
    {NULL,              NULL}           /* sentinel */
};

TyDoc_STRVAR(module_doc,
"This is a module for testing limited API from Python 3.5.");

static int
xx_modexec(TyObject *m)
{
    TyObject *o;

    /* Due to cross platform compiler issues the slots must be filled
     * here. It's required for portability to Windows without requiring
     * C++. */
    Null_Type_slots[0].pfunc = &PyBaseObject_Type;
    Null_Type_slots[1].pfunc = TyType_GenericNew;
    Str_Type_slots[0].pfunc = &TyUnicode_Type;

    /* Add some symbolic constants to the module */
    if (ErrorObject == NULL) {
        ErrorObject = TyErr_NewException("xxlimited_35.error", NULL, NULL);
        if (ErrorObject == NULL) {
            return -1;
        }
    }
    Ty_INCREF(ErrorObject);
    if (TyModule_AddObject(m, "error", ErrorObject) < 0) {
        Ty_DECREF(ErrorObject);
        return -1;
    }

    /* Add Xxo */
    Xxo_Type = TyType_FromSpec(&Xxo_Type_spec);
    if (Xxo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddObject(m, "Xxo", Xxo_Type) < 0) {
        Ty_DECREF(Xxo_Type);
        return -1;
    }

    /* Add Str */
    o = TyType_FromSpec(&Str_Type_spec);
    if (o == NULL) {
        return -1;
    }
    if (TyModule_AddObject(m, "Str", o) < 0) {
        Ty_DECREF(o);
        return -1;
    }

    /* Add Null */
    o = TyType_FromSpec(&Null_Type_spec);
    if (o == NULL) {
        return -1;
    }
    if (TyModule_AddObject(m, "Null", o) < 0) {
        Ty_DECREF(o);
        return -1;
    }

    return 0;
}


static PyModuleDef_Slot xx_slots[] = {
    {Ty_mod_exec, xx_modexec},
#ifdef Ty_GIL_DISABLED
    // These definitions are in the limited API, but not until 3.13.
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
#endif
    {0, NULL}
};

static struct TyModuleDef xxmodule = {
    PyModuleDef_HEAD_INIT,
    "xxlimited_35",
    module_doc,
    0,
    xx_methods,
    xx_slots,
    NULL,
    NULL,
    NULL
};

/* Export function for the module (*must* be called PyInit_xx) */

PyMODINIT_FUNC
PyInit_xxlimited_35(void)
{
    return PyModuleDef_Init(&xxmodule);
}
