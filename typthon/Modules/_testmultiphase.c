
/* Testing module for multi-phase initialization of extension modules (PEP 489)
 */
#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()
#include "pycore_namespace.h"     // _PyNamespace_New()

/* State for testing module state access from methods */

typedef struct {
    int counter;
} meth_state;

/*[clinic input]
module _testmultiphase

class _testmultiphase.StateAccessType "StateAccessTypeObject *" "!StateAccessType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=bab9f2fe3bd312ff]*/

/* Example objects */
typedef struct {
    PyObject_HEAD
    TyObject            *x_attr;        /* Attributes dictionary */
} ExampleObject;

#define ExampleObject_CAST(op)  ((ExampleObject *)(op))

typedef struct {
    TyObject *integer;
} testmultiphase_state;

typedef struct {
    PyObject_HEAD
} StateAccessTypeObject;

/* Example methods */

static int
Example_traverse(TyObject *op, visitproc visit, void *arg)
{
    ExampleObject *self = ExampleObject_CAST(op);
    Ty_VISIT(self->x_attr);
    return 0;
}

static void
Example_finalize(TyObject *op)
{
    ExampleObject *self = ExampleObject_CAST(op);
    Ty_CLEAR(self->x_attr);
}

static TyObject *
Example_demo(TyObject *op, TyObject *args)
{
    TyObject *o = NULL;
    if (!TyArg_ParseTuple(args, "|O:demo", &o))
        return NULL;
    if (o != NULL && TyUnicode_Check(o)) {
        return Ty_NewRef(o);
    }
    Py_RETURN_NONE;
}

#include "clinic/_testmultiphase.c.h"

static TyMethodDef Example_methods[] = {
    {"demo",            Example_demo,  METH_VARARGS,
        TyDoc_STR("demo() -> None")},
    {NULL,              NULL}           /* sentinel */
};

static TyObject *
Example_getattro(TyObject *op, TyObject *name)
{
    ExampleObject *self = ExampleObject_CAST(op);
    if (self->x_attr != NULL) {
        TyObject *v = TyDict_GetItemWithError(self->x_attr, name);
        if (v != NULL) {
            return Ty_NewRef(v);
        }
        else if (TyErr_Occurred()) {
            return NULL;
        }
    }
    return PyObject_GenericGetAttr((TyObject *)self, name);
}

static int
Example_setattr(TyObject *op, char *name, TyObject *v)
{
    ExampleObject *self = ExampleObject_CAST(op);
    if (self->x_attr == NULL) {
        self->x_attr = TyDict_New();
        if (self->x_attr == NULL)
            return -1;
    }
    if (v == NULL) {
        int rv = TyDict_DelItemString(self->x_attr, name);
        if (rv < 0 && TyErr_ExceptionMatches(TyExc_KeyError))
            TyErr_SetString(TyExc_AttributeError,
                "delete non-existing Example attribute");
        return rv;
    }
    else
        return TyDict_SetItemString(self->x_attr, name, v);
}

static TyType_Slot Example_Type_slots[] = {
    {Ty_tp_doc, "The Example type"},
    {Ty_tp_finalize, Example_finalize},
    {Ty_tp_traverse, Example_traverse},
    {Ty_tp_getattro, Example_getattro},
    {Ty_tp_setattr, Example_setattr},
    {Ty_tp_methods, Example_methods},
    {0, 0},
};

static TyType_Spec Example_Type_spec = {
    "_testimportexec.Example",
    sizeof(ExampleObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    Example_Type_slots
};


static TyModuleDef def_meth_state_access;
static TyModuleDef def_nonmodule;
static TyModuleDef def_nonmodule_with_methods;

/*[clinic input]
_testmultiphase.StateAccessType.get_defining_module

    cls: defining_class

Return the module of the defining class.

Also tests that result of TyType_GetModuleByDef matches defining_class's
module.
[clinic start generated code]*/

static TyObject *
_testmultiphase_StateAccessType_get_defining_module_impl(StateAccessTypeObject *self,
                                                         TyTypeObject *cls)
/*[clinic end generated code: output=ba2a14284a5d0921 input=d2c7245c8a9d06f8]*/
{
    TyObject *retval;
    retval = TyType_GetModule(cls);
    if (retval == NULL) {
        return NULL;
    }
    assert(TyType_GetModuleByDef(Ty_TYPE(self), &def_meth_state_access) == retval);
    return Ty_NewRef(retval);
}

/*[clinic input]
_testmultiphase.StateAccessType.getmodulebydef_bad_def

    cls: defining_class

Test that result of TyType_GetModuleByDef with a bad def is NULL.
[clinic start generated code]*/

static TyObject *
_testmultiphase_StateAccessType_getmodulebydef_bad_def_impl(StateAccessTypeObject *self,
                                                            TyTypeObject *cls)
/*[clinic end generated code: output=64509074dfcdbd31 input=edaff09aa4788204]*/
{
    TyType_GetModuleByDef(Ty_TYPE(self), &def_nonmodule);  // should raise
    assert(TyErr_Occurred());
    return NULL;
}

/*[clinic input]
_testmultiphase.StateAccessType.increment_count_clinic

    cls: defining_class
    /
    n: int = 1
    *
    twice: bool = False

Add 'n' from the module-state counter.

Pass 'twice' to double that amount.

This tests Argument Clinic support for defining_class.
[clinic start generated code]*/

static TyObject *
_testmultiphase_StateAccessType_increment_count_clinic_impl(StateAccessTypeObject *self,
                                                            TyTypeObject *cls,
                                                            int n, int twice)
/*[clinic end generated code: output=3b34f86bc5473204 input=551d482e1fe0b8f5]*/
{
    meth_state *m_state = TyType_GetModuleState(cls);
    if (twice) {
        n *= 2;
    }
    m_state->counter += n;

    Py_RETURN_NONE;
}

TyDoc_STRVAR(_StateAccessType_decrement_count__doc__,
"decrement_count($self, /, n=1, *, twice=None)\n"
"--\n"
"\n"
"Add 'n' from the module-state counter.\n"
"Pass 'twice' to double that amount.\n"
"(This is to test both positional and keyword arguments.");

// Intentionally does not use Argument Clinic
static TyObject *
_StateAccessType_increment_count_noclinic(TyObject *self,
                                          TyTypeObject *defining_class,
                                          TyObject *const *args,
                                          Ty_ssize_t nargs,
                                          TyObject *kwnames)
{
    if (!_TyArg_CheckPositional("StateAccessTypeObject.decrement_count", nargs, 0, 1)) {
        return NULL;
    }
    long n = 1;
    if (nargs) {
        n = TyLong_AsLong(args[0]);
        if (TyErr_Occurred()) {
            return NULL;
        }
    }
    if (kwnames && TyTuple_Check(kwnames)) {
        if (TyTuple_GET_SIZE(kwnames) > 1 ||
            TyUnicode_CompareWithASCIIString(
                TyTuple_GET_ITEM(kwnames, 0),
                "twice"
            )) {
            TyErr_SetString(
                TyExc_TypeError,
                "decrement_count only takes 'twice' keyword argument"
            );
            return NULL;
        }
        n *= 2;
    }
    meth_state *m_state = TyType_GetModuleState(defining_class);
    m_state->counter += n;

    Py_RETURN_NONE;
}

/*[clinic input]
_testmultiphase.StateAccessType.get_count

    cls: defining_class

Return the value of the module-state counter.
[clinic start generated code]*/

static TyObject *
_testmultiphase_StateAccessType_get_count_impl(StateAccessTypeObject *self,
                                               TyTypeObject *cls)
/*[clinic end generated code: output=64600f95b499a319 input=d5d181f12384849f]*/
{
    meth_state *m_state = TyType_GetModuleState(cls);
    return TyLong_FromLong(m_state->counter);
}

static TyMethodDef StateAccessType_methods[] = {
    _TESTMULTIPHASE_STATEACCESSTYPE_GET_DEFINING_MODULE_METHODDEF
    _TESTMULTIPHASE_STATEACCESSTYPE_GETMODULEBYDEF_BAD_DEF_METHODDEF
    _TESTMULTIPHASE_STATEACCESSTYPE_GET_COUNT_METHODDEF
    _TESTMULTIPHASE_STATEACCESSTYPE_INCREMENT_COUNT_CLINIC_METHODDEF
    {
        "increment_count_noclinic",
        _PyCFunction_CAST(_StateAccessType_increment_count_noclinic),
        METH_METHOD|METH_FASTCALL|METH_KEYWORDS,
        _StateAccessType_decrement_count__doc__
    },
    {NULL,              NULL}           /* sentinel */
};

static TyType_Slot StateAccessType_Type_slots[] = {
    {Ty_tp_doc, "Type for testing per-module state access from methods."},
    {Ty_tp_methods, StateAccessType_methods},
    {0, NULL}
};

static TyType_Spec StateAccessType_spec = {
    "_testimportexec.StateAccessType",
    sizeof(StateAccessTypeObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_FINALIZE | Ty_TPFLAGS_BASETYPE,
    StateAccessType_Type_slots
};

/* Function of two integers returning integer */

TyDoc_STRVAR(testexport_foo_doc,
"foo(i,j)\n\
\n\
Return the sum of i and j.");

static TyObject *
testexport_foo(TyObject *self, TyObject *args)
{
    long i, j;
    long res;
    if (!TyArg_ParseTuple(args, "ll:foo", &i, &j))
        return NULL;
    res = i + j;
    return TyLong_FromLong(res);
}

/* Test that PyState registration fails  */

TyDoc_STRVAR(call_state_registration_func_doc,
"register_state(0): call PyState_FindModule()\n\
register_state(1): call PyState_AddModule()\n\
register_state(2): call PyState_RemoveModule()");

static TyObject *
call_state_registration_func(TyObject *mod, TyObject *args)
{
    int i, ret;
    TyModuleDef *def = TyModule_GetDef(mod);
    if (def == NULL) {
        return NULL;
    }
    if (!TyArg_ParseTuple(args, "i:call_state_registration_func", &i))
        return NULL;
    switch (i) {
        case 0:
            mod = PyState_FindModule(def);
            if (mod == NULL) {
                Py_RETURN_NONE;
            }
            return mod;
        case 1:
            ret = PyState_AddModule(mod, def);
            if (ret != 0) {
                return NULL;
            }
            break;
        case 2:
            ret = PyState_RemoveModule(def);
            if (ret != 0) {
                return NULL;
            }
            break;
    }
    Py_RETURN_NONE;
}


static TyType_Slot Str_Type_slots[] = {
    {Ty_tp_base, NULL}, /* filled out in module exec function */
    {0, 0},
};

static TyType_Spec Str_Type_spec = {
    "_testimportexec.Str",
    0,
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    Str_Type_slots
};

static TyMethodDef testexport_methods[] = {
    {"foo",             testexport_foo,         METH_VARARGS,
        testexport_foo_doc},
    {"call_state_registration_func",  call_state_registration_func,
        METH_VARARGS, call_state_registration_func_doc},
    {NULL,              NULL}           /* sentinel */
};

static int execfunc(TyObject *m)
{
    TyObject *temp = NULL;

    /* Due to cross platform compiler issues the slots must be filled
     * here. It's required for portability to Windows without requiring
     * C++. */
    Str_Type_slots[0].pfunc = &TyUnicode_Type;

    /* Add a custom type */
    temp = TyType_FromSpec(&Example_Type_spec);
    if (TyModule_Add(m, "Example", temp) != 0) {
        goto fail;
    }


    /* Add an exception type */
    temp = TyErr_NewException("_testimportexec.error", NULL, NULL);
    if (TyModule_Add(m, "error", temp) != 0) {
        goto fail;
    }

    /* Add Str */
    temp = TyType_FromSpec(&Str_Type_spec);
    if (TyModule_Add(m, "Str", temp) != 0) {
        goto fail;
    }

    if (TyModule_AddIntConstant(m, "int_const", 1969) != 0) {
        goto fail;
    }

    if (TyModule_AddStringConstant(m, "str_const", "something different") != 0) {
        goto fail;
    }

    return 0;
 fail:
    return -1;
}

/* Helper for module definitions; there'll be a lot of them */

#define TEST_MODULE_DEF(name, slots, methods) { \
    PyModuleDef_HEAD_INIT,                      /* m_base */ \
    name,                                       /* m_name */ \
    TyDoc_STR("Test module " name),             /* m_doc */ \
    0,                                          /* m_size */ \
    methods,                                    /* m_methods */ \
    slots,                                      /* m_slots */ \
    NULL,                                       /* m_traverse */ \
    NULL,                                       /* m_clear */ \
    NULL,                                       /* m_free */ \
}

static PyModuleDef_Slot main_slots[] = {
    {Ty_mod_exec, execfunc},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef main_def = TEST_MODULE_DEF("main", main_slots, testexport_methods);

PyMODINIT_FUNC
PyInit__testmultiphase(void)
{
    return PyModuleDef_Init(&main_def);
}


/**** Importing a non-module object ****/

/* Create a SimpleNamespace(three=3) */
static TyObject*
createfunc_nonmodule(TyObject *spec, TyModuleDef *def)
{
    TyObject *dct, *ns, *three;

    if (def != &def_nonmodule && def != &def_nonmodule_with_methods) {
        TyErr_SetString(TyExc_SystemError, "def does not match");
        return NULL;
    }

    dct = TyDict_New();
    if (dct == NULL)
        return NULL;

    three = TyLong_FromLong(3);
    if (three == NULL) {
        Ty_DECREF(dct);
        return NULL;
    }
    TyDict_SetItemString(dct, "three", three);
    Ty_DECREF(three);

    ns = _PyNamespace_New(dct);
    Ty_DECREF(dct);
    return ns;
}

static PyModuleDef_Slot slots_create_nonmodule[] = {
    {Ty_mod_create, createfunc_nonmodule},
    {0, NULL},
};

static TyModuleDef def_nonmodule = TEST_MODULE_DEF(
    "_testmultiphase_nonmodule", slots_create_nonmodule, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_nonmodule(void)
{
    return PyModuleDef_Init(&def_nonmodule);
}

TyDoc_STRVAR(nonmodule_bar_doc,
"bar(i,j)\n\
\n\
Return the difference of i - j.");

static TyObject *
nonmodule_bar(TyObject *self, TyObject *args)
{
    long i, j;
    long res;
    if (!TyArg_ParseTuple(args, "ll:bar", &i, &j))
        return NULL;
    res = i - j;
    return TyLong_FromLong(res);
}

static TyMethodDef nonmodule_methods[] = {
    {"bar", nonmodule_bar, METH_VARARGS, nonmodule_bar_doc},
    {NULL, NULL}           /* sentinel */
};

static TyModuleDef def_nonmodule_with_methods = TEST_MODULE_DEF(
    "_testmultiphase_nonmodule_with_methods", slots_create_nonmodule, nonmodule_methods);

PyMODINIT_FUNC
PyInit__testmultiphase_nonmodule_with_methods(void)
{
    return PyModuleDef_Init(&def_nonmodule_with_methods);
}

/**** Non-ASCII-named modules ****/

static PyModuleDef_Slot nonascii_slots[] = {
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_nonascii_latin = { \
    PyModuleDef_HEAD_INIT,                      /* m_base */
    "_testmultiphase_nonascii_latin",           /* m_name */
    TyDoc_STR("Module named in Czech"),         /* m_doc */
    0,                                          /* m_size */
    NULL,                                       /* m_methods */
    nonascii_slots,                             /* m_slots */
    NULL,                                       /* m_traverse */
    NULL,                                       /* m_clear */
    NULL,                                       /* m_free */
};

PyMODINIT_FUNC
PyInitU__testmultiphase_zkouka_naten_evc07gi8e(void)
{
    return PyModuleDef_Init(&def_nonascii_latin);
}

static TyModuleDef def_nonascii_kana = { \
    PyModuleDef_HEAD_INIT,                      /* m_base */
    "_testmultiphase_nonascii_kana",            /* m_name */
    TyDoc_STR("Module named in Japanese"),      /* m_doc */
    0,                                          /* m_size */
    NULL,                                       /* m_methods */
    nonascii_slots,                             /* m_slots */
    NULL,                                       /* m_traverse */
    NULL,                                       /* m_clear */
    NULL,                                       /* m_free */
};

PyMODINIT_FUNC
PyInitU_eckzbwbhc6jpgzcx415x(void)
{
    return PyModuleDef_Init(&def_nonascii_kana);
}

/*** Module with a single-character name ***/

PyMODINIT_FUNC
PyInit_x(void)
{
    return PyModuleDef_Init(&main_def);
}

/**** Testing NULL slots ****/

static TyModuleDef null_slots_def = TEST_MODULE_DEF(
    "_testmultiphase_null_slots", NULL, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_null_slots(void)
{
    return PyModuleDef_Init(&null_slots_def);
}

/**** Problematic modules ****/

static PyModuleDef_Slot slots_bad_large[] = {
    {_Ty_mod_LAST_SLOT + 1, NULL},
    {0, NULL},
};

static TyModuleDef def_bad_large = TEST_MODULE_DEF(
    "_testmultiphase_bad_slot_large", slots_bad_large, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_bad_slot_large(void)
{
    return PyModuleDef_Init(&def_bad_large);
}

static PyModuleDef_Slot slots_bad_negative[] = {
    {-1, NULL},
    {0, NULL},
};

static TyModuleDef def_bad_negative = TEST_MODULE_DEF(
    "_testmultiphase_bad_slot_negative", slots_bad_negative, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_bad_slot_negative(void)
{
    return PyModuleDef_Init(&def_bad_negative);
}

static TyModuleDef def_create_int_with_state = { \
    PyModuleDef_HEAD_INIT,                      /* m_base */
    "create_with_state",                        /* m_name */
    TyDoc_STR("Not a PyModuleObject object, but requests per-module state"),
    10,                                         /* m_size */
    NULL,                                       /* m_methods */
    slots_create_nonmodule,                     /* m_slots */
    NULL,                                       /* m_traverse */
    NULL,                                       /* m_clear */
    NULL,                                       /* m_free */
};

PyMODINIT_FUNC
PyInit__testmultiphase_create_int_with_state(void)
{
    return PyModuleDef_Init(&def_create_int_with_state);
}


static TyModuleDef def_negative_size = { \
    PyModuleDef_HEAD_INIT,                      /* m_base */
    "negative_size",                            /* m_name */
    TyDoc_STR("TyModuleDef with negative m_size"),
    -1,                                         /* m_size */
    NULL,                                       /* m_methods */
    slots_create_nonmodule,                     /* m_slots */
    NULL,                                       /* m_traverse */
    NULL,                                       /* m_clear */
    NULL,                                       /* m_free */
};

PyMODINIT_FUNC
PyInit__testmultiphase_negative_size(void)
{
    return PyModuleDef_Init(&def_negative_size);
}


static TyModuleDef uninitialized_def = TEST_MODULE_DEF("main", main_slots, testexport_methods);

PyMODINIT_FUNC
PyInit__testmultiphase_export_uninitialized(void)
{
    return (TyObject*) &uninitialized_def;
}

PyMODINIT_FUNC
PyInit__testmultiphase_export_null(void)
{
    return NULL;
}

PyMODINIT_FUNC
PyInit__testmultiphase_export_raise(void)
{
    TyErr_SetString(TyExc_SystemError, "bad export function");
    return NULL;
}

PyMODINIT_FUNC
PyInit__testmultiphase_export_unreported_exception(void)
{
    TyErr_SetString(TyExc_SystemError, "bad export function");
    return PyModuleDef_Init(&main_def);
}

static TyObject*
createfunc_noop(TyObject *spec, TyModuleDef *def)
{
    return TyModule_New("spam");
}

static PyModuleDef_Slot slots_multiple_create_slots[] = {
    {Ty_mod_create, createfunc_noop},
    {Ty_mod_create, createfunc_noop},
    {0, NULL},
};

static TyModuleDef def_multiple_create_slots = TEST_MODULE_DEF(
    "_testmultiphase_multiple_create_slots", slots_multiple_create_slots, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_multiple_create_slots(void)
{
    return PyModuleDef_Init(&def_multiple_create_slots);
}

static TyObject*
createfunc_null(TyObject *spec, TyModuleDef *def)
{
    return NULL;
}

static PyModuleDef_Slot slots_create_null[] = {
    {Ty_mod_create, createfunc_null},
    {0, NULL},
};

static TyModuleDef def_create_null = TEST_MODULE_DEF(
    "_testmultiphase_create_null", slots_create_null, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_create_null(void)
{
    return PyModuleDef_Init(&def_create_null);
}

static TyObject*
createfunc_raise(TyObject *spec, TyModuleDef *def)
{
    TyErr_SetString(TyExc_SystemError, "bad create function");
    return NULL;
}

static PyModuleDef_Slot slots_create_raise[] = {
    {Ty_mod_create, createfunc_raise},
    {0, NULL},
};

static TyModuleDef def_create_raise = TEST_MODULE_DEF(
    "_testmultiphase_create_null", slots_create_raise, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_create_raise(void)
{
    return PyModuleDef_Init(&def_create_raise);
}

static TyObject*
createfunc_unreported_exception(TyObject *spec, TyModuleDef *def)
{
    TyErr_SetString(TyExc_SystemError, "bad create function");
    return TyModule_New("foo");
}

static PyModuleDef_Slot slots_create_unreported_exception[] = {
    {Ty_mod_create, createfunc_unreported_exception},
    {0, NULL},
};

static TyModuleDef def_create_unreported_exception = TEST_MODULE_DEF(
    "_testmultiphase_create_unreported_exception", slots_create_unreported_exception, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_create_unreported_exception(void)
{
    return PyModuleDef_Init(&def_create_unreported_exception);
}

static PyModuleDef_Slot slots_nonmodule_with_exec_slots[] = {
    {Ty_mod_create, createfunc_nonmodule},
    {Ty_mod_exec, execfunc},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_nonmodule_with_exec_slots = TEST_MODULE_DEF(
    "_testmultiphase_nonmodule_with_exec_slots", slots_nonmodule_with_exec_slots, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_nonmodule_with_exec_slots(void)
{
    return PyModuleDef_Init(&def_nonmodule_with_exec_slots);
}

static int
execfunc_err(TyObject *mod)
{
    return -1;
}

static PyModuleDef_Slot slots_exec_err[] = {
    {Ty_mod_exec, execfunc_err},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_exec_err = TEST_MODULE_DEF(
    "_testmultiphase_exec_err", slots_exec_err, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_exec_err(void)
{
    return PyModuleDef_Init(&def_exec_err);
}

static int
execfunc_raise(TyObject *spec)
{
    TyErr_SetString(TyExc_SystemError, "bad exec function");
    return -1;
}

static PyModuleDef_Slot slots_exec_raise[] = {
    {Ty_mod_exec, execfunc_raise},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_exec_raise = TEST_MODULE_DEF(
    "_testmultiphase_exec_raise", slots_exec_raise, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_exec_raise(void)
{
    return PyModuleDef_Init(&def_exec_raise);
}

static int
execfunc_unreported_exception(TyObject *mod)
{
    TyErr_SetString(TyExc_SystemError, "bad exec function");
    return 0;
}

static PyModuleDef_Slot slots_exec_unreported_exception[] = {
    {Ty_mod_exec, execfunc_unreported_exception},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_exec_unreported_exception = TEST_MODULE_DEF(
    "_testmultiphase_exec_unreported_exception", slots_exec_unreported_exception, NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_exec_unreported_exception(void)
{
    return PyModuleDef_Init(&def_exec_unreported_exception);
}

static int
meth_state_access_exec(TyObject *m)
{
    TyObject *temp;
    meth_state *m_state;

    m_state = TyModule_GetState(m);
    if (m_state == NULL) {
        return -1;
    }

    temp = TyType_FromModuleAndSpec(m, &StateAccessType_spec, NULL);
    if (TyModule_Add(m, "StateAccessType", temp) != 0) {
        return -1;
    }


    return 0;
}

static PyModuleDef_Slot meth_state_access_slots[] = {
    {Ty_mod_exec, meth_state_access_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static TyModuleDef def_meth_state_access = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_testmultiphase_meth_state_access",
    .m_doc = TyDoc_STR("Module testing access"
                       " to state from methods."),
    .m_size = sizeof(meth_state),
    .m_slots = meth_state_access_slots,
};

PyMODINIT_FUNC
PyInit__testmultiphase_meth_state_access(void)
{
    return PyModuleDef_Init(&def_meth_state_access);
}

static TyModuleDef def_module_state_shared = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_test_module_state_shared",
    .m_doc = TyDoc_STR("Regression Test module for single-phase init."),
    .m_size = -1,
};

PyMODINIT_FUNC
PyInit__test_module_state_shared(void)
{
    TyObject *module = TyModule_Create(&def_module_state_shared);
    if (module == NULL) {
        return NULL;
    }
#ifdef Ty_GIL_DISABLED
    PyUnstable_Module_SetGIL(module, Ty_MOD_GIL_NOT_USED);
#endif

    if (TyModule_AddObjectRef(module, "Error", TyExc_Exception) < 0) {
        Ty_DECREF(module);
        return NULL;
    }
    return module;
}


/* multiple interpreters support */

static PyModuleDef_Slot slots_multiple_multiple_interpreters_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef def_multiple_multiple_interpreters_slots = TEST_MODULE_DEF(
    "_testmultiphase_multiple_multiple_interpreters_slots",
    slots_multiple_multiple_interpreters_slots,
    NULL);

PyMODINIT_FUNC
PyInit__testmultiphase_multiple_multiple_interpreters_slots(void)
{
    return PyModuleDef_Init(&def_multiple_multiple_interpreters_slots);
}

static PyModuleDef_Slot non_isolated_slots[] = {
    {Ty_mod_exec, execfunc},
    {Ty_mod_multiple_interpreters, Ty_MOD_MULTIPLE_INTERPRETERS_NOT_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef non_isolated_def = TEST_MODULE_DEF("_test_non_isolated",
                                                      non_isolated_slots,
                                                      testexport_methods);

PyMODINIT_FUNC
PyInit__test_non_isolated(void)
{
    return PyModuleDef_Init(&non_isolated_def);
}


static PyModuleDef_Slot shared_gil_only_slots[] = {
    {Ty_mod_exec, execfunc},
    /* Note that Ty_MOD_MULTIPLE_INTERPRETERS_SUPPORTED is the default.
       We put it here explicitly to draw attention to the contrast
       with Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED. */
    {Ty_mod_multiple_interpreters, Ty_MOD_MULTIPLE_INTERPRETERS_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef shared_gil_only_def = TEST_MODULE_DEF("_test_shared_gil_only",
                                                         shared_gil_only_slots,
                                                         testexport_methods);

PyMODINIT_FUNC
PyInit__test_shared_gil_only(void)
{
    return PyModuleDef_Init(&shared_gil_only_def);
}


static PyModuleDef_Slot no_multiple_interpreter_slot_slots[] = {
    {Ty_mod_exec, execfunc},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyModuleDef no_multiple_interpreter_slot_def = TEST_MODULE_DEF(
    "_test_no_multiple_interpreter_slot",
    no_multiple_interpreter_slot_slots,
    testexport_methods);

PyMODINIT_FUNC
PyInit__test_no_multiple_interpreter_slot(void)
{
    return PyModuleDef_Init(&no_multiple_interpreter_slot_def);
}
