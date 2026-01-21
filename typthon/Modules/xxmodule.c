
/* Use this file as a template to start implementing a module that
   also declares object types. All occurrences of 'Xxo' should be changed
   to something reasonable for your objects. After that, all other
   occurrences of 'xx' should be changed to something reasonable for your
   module. If your module is named foo your sourcefile should be named
   foomodule.c.

   You will probably want to delete all references to 'x_attr' and add
   your own types of attributes instead.  Maybe you want to name your
   local variables other than 'self'.  If your object type is needed in
   other files, you'll have to create a separate header file for it. */

/* Xxo objects */

#include "Python.h"

static TyObject *ErrorObject;

typedef struct {
    PyObject_HEAD
    TyObject            *x_attr;        /* Attributes dictionary */
} XxoObject;

static TyTypeObject Xxo_Type;

#define XxoObject_CAST(op)  ((XxoObject *)(op))
#define XxoObject_Check(v)  Ty_IS_TYPE(v, &Xxo_Type)

static XxoObject *
newXxoObject(TyObject *arg)
{
    XxoObject *self = PyObject_New(XxoObject, &Xxo_Type);
    if (self == NULL) {
        return NULL;
    }
    self->x_attr = NULL;
    return self;
}

/* Xxo methods */

static void
Xxo_dealloc(TyObject *op)
{
    XxoObject *self = XxoObject_CAST(op);
    Ty_XDECREF(self->x_attr);
    PyObject_Free(self);
}

static TyObject *
Xxo_demo(TyObject *Py_UNUSED(op), TyObject *args)
{
    if (!TyArg_ParseTuple(args, ":demo")) {
        return NULL;
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
Xxo_setattr(TyObject *op, const char *name, TyObject *v)
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

static TyTypeObject Xxo_Type = {
    /* The ob_type field must be initialized in the module init function
     * to be portable to Windows without using C++. */
    TyVarObject_HEAD_INIT(NULL, 0)
    "xxmodule.Xxo",             /*tp_name*/
    sizeof(XxoObject),          /*tp_basicsize*/
    0,                          /*tp_itemsize*/
    /* methods */
    Xxo_dealloc,                /*tp_dealloc*/
    0,                          /*tp_vectorcall_offset*/
    0,                          /*tp_getattr*/
    Xxo_setattr,                /*tp_setattr*/
    0,                          /*tp_as_async*/
    0,                          /*tp_repr*/
    0,                          /*tp_as_number*/
    0,                          /*tp_as_sequence*/
    0,                          /*tp_as_mapping*/
    0,                          /*tp_hash*/
    0,                          /*tp_call*/
    0,                          /*tp_str*/
    Xxo_getattro,               /*tp_getattro*/
    0,                          /*tp_setattro*/
    0,                          /*tp_as_buffer*/
    Ty_TPFLAGS_DEFAULT,         /*tp_flags*/
    0,                          /*tp_doc*/
    0,                          /*tp_traverse*/
    0,                          /*tp_clear*/
    0,                          /*tp_richcompare*/
    0,                          /*tp_weaklistoffset*/
    0,                          /*tp_iter*/
    0,                          /*tp_iternext*/
    Xxo_methods,                /*tp_methods*/
    0,                          /*tp_members*/
    0,                          /*tp_getset*/
    0,                          /*tp_base*/
    0,                          /*tp_dict*/
    0,                          /*tp_descr_get*/
    0,                          /*tp_descr_set*/
    0,                          /*tp_dictoffset*/
    0,                          /*tp_init*/
    0,                          /*tp_alloc*/
    0,                          /*tp_new*/
    0,                          /*tp_free*/
    0,                          /*tp_is_gc*/
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

/* Example with subtle bug from extensions manual ("Thin Ice"). */

static TyObject *
xx_bug(TyObject *self, TyObject *args)
{
    TyObject *list, *item;

    if (!TyArg_ParseTuple(args, "O:bug", &list))
        return NULL;

    item = TyList_GetItem(list, 0);
    /* Ty_INCREF(item); */
    TyList_SetItem(list, 1, TyLong_FromLong(0L));
    PyObject_Print(item, stdout, 0);
    printf("\n");
    /* Ty_DECREF(item); */

    return Ty_NewRef(Ty_None);
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

static TyTypeObject Str_Type = {
    /* The ob_type field must be initialized in the module init function
     * to be portable to Windows without using C++. */
    TyVarObject_HEAD_INIT(NULL, 0)
    "xxmodule.Str",             /*tp_name*/
    0,                          /*tp_basicsize*/
    0,                          /*tp_itemsize*/
    /* methods */
    0,                          /*tp_dealloc*/
    0,                          /*tp_vectorcall_offset*/
    0,                          /*tp_getattr*/
    0,                          /*tp_setattr*/
    0,                          /*tp_as_async*/
    0,                          /*tp_repr*/
    0,                          /*tp_as_number*/
    0,                          /*tp_as_sequence*/
    0,                          /*tp_as_mapping*/
    0,                          /*tp_hash*/
    0,                          /*tp_call*/
    0,                          /*tp_str*/
    0,                          /*tp_getattro*/
    0,                          /*tp_setattro*/
    0,                          /*tp_as_buffer*/
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /*tp_flags*/
    0,                          /*tp_doc*/
    0,                          /*tp_traverse*/
    0,                          /*tp_clear*/
    0,                          /*tp_richcompare*/
    0,                          /*tp_weaklistoffset*/
    0,                          /*tp_iter*/
    0,                          /*tp_iternext*/
    0,                          /*tp_methods*/
    0,                          /*tp_members*/
    0,                          /*tp_getset*/
    0, /* see PyInit_xx */      /*tp_base*/
    0,                          /*tp_dict*/
    0,                          /*tp_descr_get*/
    0,                          /*tp_descr_set*/
    0,                          /*tp_dictoffset*/
    0,                          /*tp_init*/
    0,                          /*tp_alloc*/
    0,                          /*tp_new*/
    0,                          /*tp_free*/
    0,                          /*tp_is_gc*/
};

/* ---------- */

static TyObject *
null_richcompare(TyObject *self, TyObject *other, int op)
{
    return Ty_NewRef(Ty_NotImplemented);
}

static TyTypeObject Null_Type = {
    /* The ob_type field must be initialized in the module init function
     * to be portable to Windows without using C++. */
    TyVarObject_HEAD_INIT(NULL, 0)
    "xxmodule.Null",            /*tp_name*/
    0,                          /*tp_basicsize*/
    0,                          /*tp_itemsize*/
    /* methods */
    0,                          /*tp_dealloc*/
    0,                          /*tp_vectorcall_offset*/
    0,                          /*tp_getattr*/
    0,                          /*tp_setattr*/
    0,                          /*tp_as_async*/
    0,                          /*tp_repr*/
    0,                          /*tp_as_number*/
    0,                          /*tp_as_sequence*/
    0,                          /*tp_as_mapping*/
    0,                          /*tp_hash*/
    0,                          /*tp_call*/
    0,                          /*tp_str*/
    0,                          /*tp_getattro*/
    0,                          /*tp_setattro*/
    0,                          /*tp_as_buffer*/
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /*tp_flags*/
    0,                          /*tp_doc*/
    0,                          /*tp_traverse*/
    0,                          /*tp_clear*/
    null_richcompare,           /*tp_richcompare*/
    0,                          /*tp_weaklistoffset*/
    0,                          /*tp_iter*/
    0,                          /*tp_iternext*/
    0,                          /*tp_methods*/
    0,                          /*tp_members*/
    0,                          /*tp_getset*/
    0, /* see PyInit_xx */      /*tp_base*/
    0,                          /*tp_dict*/
    0,                          /*tp_descr_get*/
    0,                          /*tp_descr_set*/
    0,                          /*tp_dictoffset*/
    0,                          /*tp_init*/
    0,                          /*tp_alloc*/
    TyType_GenericNew,          /*tp_new*/
    0,                          /*tp_free*/
    0,                          /*tp_is_gc*/
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
    {"bug",             xx_bug,         METH_VARARGS,
        TyDoc_STR("bug(o) -> None")},
    {NULL,              NULL}           /* sentinel */
};

TyDoc_STRVAR(module_doc,
"This is a template module just for instruction.");


static int
xx_exec(TyObject *m)
{
    /* Slot initialization is subject to the rules of initializing globals.
       C99 requires the initializers to be "address constants".  Function
       designators like 'TyType_GenericNew', with implicit conversion to
       a pointer, are valid C99 address constants.

       However, the unary '&' operator applied to a non-static variable
       like 'PyBaseObject_Type' is not required to produce an address
       constant.  Compilers may support this (gcc does), MSVC does not.

       Both compilers are strictly standard conforming in this particular
       behavior.
    */
    Null_Type.tp_base = &PyBaseObject_Type;
    Str_Type.tp_base = &TyUnicode_Type;

    /* Finalize the type object including setting type of the new type
     * object; doing it here is required for portability, too. */
    if (TyType_Ready(&Xxo_Type) < 0) {
        return -1;
    }

    /* Add some symbolic constants to the module */
    if (ErrorObject == NULL) {
        ErrorObject = TyErr_NewException("xx.error", NULL, NULL);
        if (ErrorObject == NULL) {
            return -1;
        }
    }
    int rc = TyModule_AddType(m, (TyTypeObject *)ErrorObject);
    Ty_DECREF(ErrorObject);
    if (rc < 0) {
        return -1;
    }

    /* Add Str and Null types */
    if (TyModule_AddType(m, &Str_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, &Null_Type) < 0) {
        return -1;
    }

    return 0;
}

static struct PyModuleDef_Slot xx_slots[] = {
    {Ty_mod_exec, xx_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef xxmodule = {
    PyModuleDef_HEAD_INIT,
    "xx",
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
PyInit_xx(void)
{
    return PyModuleDef_Init(&xxmodule);
}
