/* Use this file as a template to start implementing a module that
   also declares object types. All occurrences of 'Xxo' should be changed
   to something reasonable for your objects. After that, all other
   occurrences of 'xx' should be changed to something reasonable for your
   module. If your module is named foo your source file should be named
   foo.c or foomodule.c.

   You will probably want to delete all references to 'x_attr' and add
   your own types of attributes instead.  Maybe you want to name your
   local variables other than 'self'.  If your object type is needed in
   other files, you'll have to create a file "foobarobject.h"; see
   floatobject.h for an example.

   This module roughly corresponds to::

      class Xxo:
         """A class that explicitly stores attributes in an internal dict"""

          def __init__(self):
              # In the C class, "_x_attr" is not accessible from Python code
              self._x_attr = {}
              self._x_exports = 0

          def __getattr__(self, name):
              return self._x_attr[name]

          def __setattr__(self, name, value):
              self._x_attr[name] = value

          def __delattr__(self, name):
              del self._x_attr[name]

          @property
          def x_exports(self):
              """Return the number of times an internal buffer is exported."""
              # Each Xxo instance has a 10-byte buffer that can be
              # accessed via the buffer interface (e.g. `memoryview`).
              return self._x_exports

          def demo(o, /):
              if isinstance(o, str):
                  return o
              elif isinstance(o, Xxo):
                  return o
              else:
                  raise Error('argument must be str or Xxo')

      class Error(Exception):
          """Exception raised by the xxlimited module"""

      def foo(i: int, j: int, /):
          """Return the sum of i and j."""
          # Unlike this pseudocode, the C function will *only* work with
          # integers and perform C long int arithmetic
          return i + j

      def new():
          return Xxo()

      def Str(str):
          # A trivial subclass of a built-in type
          pass
   */

// Need limited C API version 3.13 for Ty_mod_gil
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "Python.h"
#include <string.h>

#define BUFSIZE 10

// Module state
typedef struct {
    TyObject *Xxo_Type;    // Xxo class
    TyObject *Error_Type;       // Error class
} xx_state;


/* Xxo objects */

// Instance state
typedef struct {
    PyObject_HEAD
    TyObject            *x_attr;           /* Attributes dictionary */
    char                x_buffer[BUFSIZE]; /* buffer for Ty_buffer */
    Ty_ssize_t          x_exports;         /* how many buffer are exported */
} XxoObject;

#define XxoObject_CAST(op)  ((XxoObject *)(op))
// XXX: no good way to do this yet
// #define XxoObject_Check(v)      Ty_IS_TYPE(v, Xxo_Type)

static XxoObject *
newXxoObject(TyObject *module)
{
    xx_state *state = TyModule_GetState(module);
    if (state == NULL) {
        return NULL;
    }
    XxoObject *self;
    self = PyObject_GC_New(XxoObject, (TyTypeObject*)state->Xxo_Type);
    if (self == NULL) {
        return NULL;
    }
    self->x_attr = NULL;
    memset(self->x_buffer, 0, BUFSIZE);
    self->x_exports = 0;
    return self;
}

/* Xxo finalization */

static int
Xxo_traverse(TyObject *op, visitproc visit, void *arg)
{
    // Visit the type
    Ty_VISIT(Ty_TYPE(op));

    // Visit the attribute dict
    XxoObject *self = XxoObject_CAST(op);
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

static void
Xxo_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    Xxo_finalize(self);
    TyTypeObject *tp = Ty_TYPE(self);
    freefunc free = TyType_GetSlot(tp, Ty_tp_free);
    free(self);
    Ty_DECREF(tp);
}


/* Xxo attribute handling */

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
Xxo_setattro(TyObject *op, TyObject *name, TyObject *v)
{
    XxoObject *self = XxoObject_CAST(op);
    if (self->x_attr == NULL) {
        // prepare the attribute dict
        self->x_attr = TyDict_New();
        if (self->x_attr == NULL) {
            return -1;
        }
    }
    if (v == NULL) {
        // delete an attribute
        int rv = TyDict_DelItem(self->x_attr, name);
        if (rv < 0 && TyErr_ExceptionMatches(TyExc_KeyError)) {
            TyErr_SetString(TyExc_AttributeError,
                "delete non-existing Xxo attribute");
            return -1;
        }
        return rv;
    }
    else {
        // set an attribute
        return TyDict_SetItem(self->x_attr, name, v);
    }
}

/* Xxo methods */

static TyObject *
Xxo_demo(TyObject *op, TyTypeObject *defining_class,
         TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (kwnames != NULL && PyObject_Length(kwnames)) {
        TyErr_SetString(TyExc_TypeError, "demo() takes no keyword arguments");
        return NULL;
    }
    if (nargs != 1) {
        TyErr_SetString(TyExc_TypeError, "demo() takes exactly 1 argument");
        return NULL;
    }

    TyObject *o = args[0];

    /* Test if the argument is "str" */
    if (TyUnicode_Check(o)) {
        return Ty_NewRef(o);
    }

    /* test if the argument is of the Xxo class */
    if (PyObject_TypeCheck(o, defining_class)) {
        return Ty_NewRef(o);
    }

    return Ty_NewRef(Ty_None);
}

static TyMethodDef Xxo_methods[] = {
    {"demo",            _PyCFunction_CAST(Xxo_demo),
     METH_METHOD | METH_FASTCALL | METH_KEYWORDS, TyDoc_STR("demo(o) -> o")},
    {NULL,              NULL}           /* sentinel */
};

/* Xxo buffer interface */

static int
Xxo_getbuffer(TyObject *op, Ty_buffer *view, int flags)
{
    XxoObject *self = XxoObject_CAST(op);
    int res = PyBuffer_FillInfo(view, op,
                               (void *)self->x_buffer, BUFSIZE,
                               0, flags);
    if (res == 0) {
        self->x_exports++;
    }
    return res;
}

static void
Xxo_releasebuffer(TyObject *op, Ty_buffer *Py_UNUSED(view))
{
    XxoObject *self = XxoObject_CAST(op);
    self->x_exports--;
}

static TyObject *
Xxo_get_x_exports(TyObject *op, void *Py_UNUSED(closure))
{
    XxoObject *self = XxoObject_CAST(op);
    return TyLong_FromSsize_t(self->x_exports);
}

/* Xxo type definition */

TyDoc_STRVAR(Xxo_doc,
             "A class that explicitly stores attributes in an internal dict");

static TyGetSetDef Xxo_getsetlist[] = {
    {"x_exports", Xxo_get_x_exports, NULL, NULL},
    {NULL},
};


static TyType_Slot Xxo_Type_slots[] = {
    {Ty_tp_doc, (char *)Xxo_doc},
    {Ty_tp_traverse, Xxo_traverse},
    {Ty_tp_clear, Xxo_clear},
    {Ty_tp_finalize, Xxo_finalize},
    {Ty_tp_dealloc, Xxo_dealloc},
    {Ty_tp_getattro, Xxo_getattro},
    {Ty_tp_setattro, Xxo_setattro},
    {Ty_tp_methods, Xxo_methods},
    {Ty_bf_getbuffer, Xxo_getbuffer},
    {Ty_bf_releasebuffer, Xxo_releasebuffer},
    {Ty_tp_getset, Xxo_getsetlist},
    {0, 0},  /* sentinel */
};

static TyType_Spec Xxo_Type_spec = {
    .name = "xxlimited.Xxo",
    .basicsize = sizeof(XxoObject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .slots = Xxo_Type_slots,
};


/* Str type definition*/

static TyType_Slot Str_Type_slots[] = {
    {0, 0},  /* sentinel */
};

static TyType_Spec Str_Type_spec = {
    .name = "xxlimited.Str",
    .basicsize = 0,
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .slots = Str_Type_slots,
};


/* Function of two integers returning integer (with C "long int" arithmetic) */

TyDoc_STRVAR(xx_foo_doc,
"foo(i,j)\n\
\n\
Return the sum of i and j.");

static TyObject *
xx_foo(TyObject *module, TyObject *args)
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
xx_new(TyObject *module, TyObject *Py_UNUSED(unused))
{
    XxoObject *rv;

    rv = newXxoObject(module);
    if (rv == NULL)
        return NULL;
    return (TyObject *)rv;
}



/* List of functions defined in the module */

static TyMethodDef xx_methods[] = {
    {"foo",             xx_foo,         METH_VARARGS,
        xx_foo_doc},
    {"new",             xx_new,         METH_NOARGS,
        TyDoc_STR("new() -> new Xx object")},
    {NULL,              NULL}           /* sentinel */
};


/* The module itself */

TyDoc_STRVAR(module_doc,
"This is a template module just for instruction.");

static int
xx_modexec(TyObject *m)
{
    xx_state *state = TyModule_GetState(m);

    state->Error_Type = TyErr_NewException("xxlimited.Error", NULL, NULL);
    if (state->Error_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject*)state->Error_Type) < 0) {
        return -1;
    }

    state->Xxo_Type = TyType_FromModuleAndSpec(m, &Xxo_Type_spec, NULL);
    if (state->Xxo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject*)state->Xxo_Type) < 0) {
        return -1;
    }

    // Add the Str type. It is not needed from C code, so it is only
    // added to the module dict.
    // It does not inherit from "object" (PyObject_Type), but from "str"
    // (PyUnincode_Type).
    TyObject *Str_Type = TyType_FromModuleAndSpec(
        m, &Str_Type_spec, (TyObject *)&TyUnicode_Type);
    if (Str_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject*)Str_Type) < 0) {
        return -1;
    }
    Ty_DECREF(Str_Type);

    return 0;
}

static PyModuleDef_Slot xx_slots[] = {
    {Ty_mod_exec, xx_modexec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
xx_traverse(TyObject *module, visitproc visit, void *arg)
{
    xx_state *state = TyModule_GetState(module);
    Ty_VISIT(state->Xxo_Type);
    Ty_VISIT(state->Error_Type);
    return 0;
}

static int
xx_clear(TyObject *module)
{
    xx_state *state = TyModule_GetState(module);
    Ty_CLEAR(state->Xxo_Type);
    Ty_CLEAR(state->Error_Type);
    return 0;
}

static void
xx_free(void *module)
{
    // allow xx_modexec to omit calling xx_clear on error
    (void)xx_clear((TyObject *)module);
}

static struct TyModuleDef xxmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "xxlimited",
    .m_doc = module_doc,
    .m_size = sizeof(xx_state),
    .m_methods = xx_methods,
    .m_slots = xx_slots,
    .m_traverse = xx_traverse,
    .m_clear = xx_clear,
    .m_free = xx_free,
};


/* Export function for the module (*must* be called PyInit_xx) */

PyMODINIT_FUNC
PyInit_xxlimited(void)
{
    return PyModuleDef_Init(&xxmodule);
}
