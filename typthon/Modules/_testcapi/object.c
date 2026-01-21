#include "parts.h"
#include "util.h"

static TyObject *
call_pyobject_print(TyObject *self, TyObject * args)
{
    TyObject *object;
    TyObject *filename;
    TyObject *print_raw;
    FILE *fp;
    int flags = 0;

    if (!TyArg_UnpackTuple(args, "call_pyobject_print", 3, 3,
                           &object, &filename, &print_raw)) {
        return NULL;
    }

    fp = Ty_fopen(filename, "w+");

    if (Ty_IsTrue(print_raw)) {
        flags = Ty_PRINT_RAW;
    }

    if (PyObject_Print(object, fp, flags) < 0) {
        fclose(fp);
        return NULL;
    }

    fclose(fp);

    Py_RETURN_NONE;
}

static TyObject *
pyobject_print_null(TyObject *self, TyObject *args)
{
    TyObject *filename;
    FILE *fp;

    if (!TyArg_UnpackTuple(args, "call_pyobject_print", 1, 1, &filename)) {
        return NULL;
    }

    fp = Ty_fopen(filename, "w+");

    if (PyObject_Print(NULL, fp, 0) < 0) {
        fclose(fp);
        return NULL;
    }

    fclose(fp);

    Py_RETURN_NONE;
}

static TyObject *
pyobject_print_noref_object(TyObject *self, TyObject *args)
{
    TyObject *test_string;
    TyObject *filename;
    FILE *fp;
    char correct_string[100];

    test_string = TyUnicode_FromString("Spam spam spam");

    Ty_SET_REFCNT(test_string, 0);

    TyOS_snprintf(correct_string, 100, "<refcnt %zd at %p>",
                  Ty_REFCNT(test_string), (void *)test_string);

    if (!TyArg_UnpackTuple(args, "call_pyobject_print", 1, 1, &filename)) {
        return NULL;
    }

    fp = Ty_fopen(filename, "w+");

    if (PyObject_Print(test_string, fp, 0) < 0){
        fclose(fp);
        Ty_SET_REFCNT(test_string, 1);
        Ty_DECREF(test_string);
        return NULL;
    }

    fclose(fp);

    Ty_SET_REFCNT(test_string, 1);
    Ty_DECREF(test_string);

    return TyUnicode_FromString(correct_string);
}

static TyObject *
pyobject_print_os_error(TyObject *self, TyObject *args)
{
    TyObject *test_string;
    TyObject *filename;
    FILE *fp;

    test_string = TyUnicode_FromString("Spam spam spam");

    if (!TyArg_UnpackTuple(args, "call_pyobject_print", 1, 1, &filename)) {
        return NULL;
    }

    // open file in read mode to induce OSError
    fp = Ty_fopen(filename, "r");

    if (PyObject_Print(test_string, fp, 0) < 0) {
        fclose(fp);
        Ty_DECREF(test_string);
        return NULL;
    }

    fclose(fp);
    Ty_DECREF(test_string);

    Py_RETURN_NONE;
}

static TyObject *
pyobject_clear_weakrefs_no_callbacks(TyObject *self, TyObject *obj)
{
    PyUnstable_Object_ClearWeakRefsNoCallbacks(obj);
    Py_RETURN_NONE;
}

static TyObject *
pyobject_enable_deferred_refcount(TyObject *self, TyObject *obj)
{
    int result = PyUnstable_Object_EnableDeferredRefcount(obj);
    return TyLong_FromLong(result);
}

static TyObject *
pyobject_is_unique_temporary(TyObject *self, TyObject *obj)
{
    int result = PyUnstable_Object_IsUniqueReferencedTemporary(obj);
    return TyLong_FromLong(result);
}

static int MyObject_dealloc_called = 0;

static void
MyObject_dealloc(TyObject *op)
{
    // PyUnstable_TryIncRef should return 0 if object is being deallocated
    assert(Ty_REFCNT(op) == 0);
    assert(!PyUnstable_TryIncRef(op));
    assert(Ty_REFCNT(op) == 0);

    MyObject_dealloc_called++;
    Ty_TYPE(op)->tp_free(op);
}

static TyTypeObject MyType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "MyType",
    .tp_basicsize = sizeof(TyObject),
    .tp_dealloc = MyObject_dealloc,
};

static TyObject *
test_py_try_inc_ref(TyObject *self, TyObject *unused)
{
    if (TyType_Ready(&MyType) < 0) {
        return NULL;
    }

    MyObject_dealloc_called = 0;

    TyObject *op = PyObject_New(TyObject, &MyType);
    if (op == NULL) {
        return NULL;
    }

    PyUnstable_EnableTryIncRef(op);
#ifdef Ty_GIL_DISABLED
    // PyUnstable_EnableTryIncRef sets the shared flags to
    // `_Ty_REF_MAYBE_WEAKREF` if the flags are currently zero to ensure that
    // the shared reference count is merged on deallocation.
    assert((op->ob_ref_shared & _Ty_REF_SHARED_FLAG_MASK) >= _Ty_REF_MAYBE_WEAKREF);
#endif

    if (!PyUnstable_TryIncRef(op)) {
        TyErr_SetString(TyExc_AssertionError, "PyUnstable_TryIncRef failed");
        Ty_DECREF(op);
        return NULL;
    }
    Ty_DECREF(op);  // undo try-incref
    Ty_DECREF(op);  // dealloc
    assert(MyObject_dealloc_called == 1);
    Py_RETURN_NONE;
}


static TyObject *
_test_incref(TyObject *ob)
{
    return Ty_NewRef(ob);
}

static TyObject *
test_xincref_doesnt_leak(TyObject *ob, TyObject *Py_UNUSED(ignored))
{
    TyObject *obj = TyLong_FromLong(0);
    Ty_XINCREF(_test_incref(obj));
    Ty_DECREF(obj);
    Ty_DECREF(obj);
    Ty_DECREF(obj);
    Py_RETURN_NONE;
}


static TyObject *
test_incref_doesnt_leak(TyObject *ob, TyObject *Py_UNUSED(ignored))
{
    TyObject *obj = TyLong_FromLong(0);
    Ty_INCREF(_test_incref(obj));
    Ty_DECREF(obj);
    Ty_DECREF(obj);
    Ty_DECREF(obj);
    Py_RETURN_NONE;
}


static TyObject *
test_xdecref_doesnt_leak(TyObject *ob, TyObject *Py_UNUSED(ignored))
{
    Ty_XDECREF(TyLong_FromLong(0));
    Py_RETURN_NONE;
}


static TyObject *
test_decref_doesnt_leak(TyObject *ob, TyObject *Py_UNUSED(ignored))
{
    Ty_DECREF(TyLong_FromLong(0));
    Py_RETURN_NONE;
}


static TyObject *
test_incref_decref_API(TyObject *ob, TyObject *Py_UNUSED(ignored))
{
    TyObject *obj = TyLong_FromLong(0);
    Ty_IncRef(obj);
    Ty_DecRef(obj);
    Ty_DecRef(obj);
    Py_RETURN_NONE;
}


#ifdef Ty_REF_DEBUG
static TyObject *
negative_refcount(TyObject *self, TyObject *Py_UNUSED(args))
{
    TyObject *obj = TyUnicode_FromString("negative_refcount");
    if (obj == NULL) {
        return NULL;
    }
    assert(Ty_REFCNT(obj) == 1);

    Ty_SET_REFCNT(obj,  0);
    /* Ty_DECREF() must call _Ty_NegativeRefcount() and abort Python */
    Ty_DECREF(obj);

    Py_RETURN_NONE;
}


static TyObject *
decref_freed_object(TyObject *self, TyObject *Py_UNUSED(args))
{
    TyObject *obj = TyUnicode_FromString("decref_freed_object");
    if (obj == NULL) {
        return NULL;
    }
    assert(Ty_REFCNT(obj) == 1);

    // Deallocate the memory
    Ty_DECREF(obj);
    // obj is a now a dangling pointer

    // gh-109496: If Python is built in debug mode, Ty_DECREF() must call
    // _Ty_NegativeRefcount() and abort Python.
    Ty_DECREF(obj);

    Py_RETURN_NONE;
}
#endif


// Test Ty_CLEAR() macro
static TyObject*
test_py_clear(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    // simple case with a variable
    TyObject *obj = TyList_New(0);
    if (obj == NULL) {
        return NULL;
    }
    Ty_CLEAR(obj);
    assert(obj == NULL);

    // gh-98724: complex case, Ty_CLEAR() argument has a side effect
    TyObject* array[1];
    array[0] = TyList_New(0);
    if (array[0] == NULL) {
        return NULL;
    }

    TyObject **p = array;
    Ty_CLEAR(*p++);
    assert(array[0] == NULL);
    assert(p == array + 1);

    Py_RETURN_NONE;
}


// Test Ty_SETREF() and Ty_XSETREF() macros, similar to test_py_clear()
static TyObject*
test_py_setref(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    // Ty_SETREF() simple case with a variable
    TyObject *obj = TyList_New(0);
    if (obj == NULL) {
        return NULL;
    }
    Ty_SETREF(obj, NULL);
    assert(obj == NULL);

    // Ty_XSETREF() simple case with a variable
    TyObject *obj2 = TyList_New(0);
    if (obj2 == NULL) {
        return NULL;
    }
    Ty_XSETREF(obj2, NULL);
    assert(obj2 == NULL);
    // test Ty_XSETREF() when the argument is NULL
    Ty_XSETREF(obj2, NULL);
    assert(obj2 == NULL);

    // gh-98724: complex case, Ty_SETREF() argument has a side effect
    TyObject* array[1];
    array[0] = TyList_New(0);
    if (array[0] == NULL) {
        return NULL;
    }

    TyObject **p = array;
    Ty_SETREF(*p++, NULL);
    assert(array[0] == NULL);
    assert(p == array + 1);

    // gh-98724: complex case, Ty_XSETREF() argument has a side effect
    TyObject* array2[1];
    array2[0] = TyList_New(0);
    if (array2[0] == NULL) {
        return NULL;
    }

    TyObject **p2 = array2;
    Ty_XSETREF(*p2++, NULL);
    assert(array2[0] == NULL);
    assert(p2 == array2 + 1);

    // test Ty_XSETREF() when the argument is NULL
    p2 = array2;
    Ty_XSETREF(*p2++, NULL);
    assert(array2[0] == NULL);
    assert(p2 == array2 + 1);

    Py_RETURN_NONE;
}


#define TEST_REFCOUNT() \
    do { \
        TyObject *obj = TyList_New(0); \
        if (obj == NULL) { \
            return NULL; \
        } \
        assert(Ty_REFCNT(obj) == 1); \
        \
        /* test Ty_NewRef() */ \
        TyObject *ref = Ty_NewRef(obj); \
        assert(ref == obj); \
        assert(Ty_REFCNT(obj) == 2); \
        Ty_DECREF(ref); \
        \
        /* test Ty_XNewRef() */ \
        TyObject *xref = Ty_XNewRef(obj); \
        assert(xref == obj); \
        assert(Ty_REFCNT(obj) == 2); \
        Ty_DECREF(xref); \
        \
        assert(Ty_XNewRef(NULL) == NULL); \
        \
        Ty_DECREF(obj); \
        Py_RETURN_NONE; \
    } while (0)


// Test Ty_NewRef() and Ty_XNewRef() macros
static TyObject*
test_refcount_macros(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TEST_REFCOUNT();
}

#undef Ty_NewRef
#undef Ty_XNewRef

// Test Ty_NewRef() and Ty_XNewRef() functions, after undefining macros.
static TyObject*
test_refcount_funcs(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TEST_REFCOUNT();
}


// Test Ty_Is() function
#define TEST_PY_IS() \
    do { \
        TyObject *o_none = Ty_None; \
        TyObject *o_true = Ty_True; \
        TyObject *o_false = Ty_False; \
        TyObject *obj = TyList_New(0); \
        if (obj == NULL) { \
            return NULL; \
        } \
        \
        /* test Ty_Is() */ \
        assert(Ty_Is(obj, obj)); \
        assert(!Ty_Is(obj, o_none)); \
        \
        /* test Ty_None */ \
        assert(Ty_Is(o_none, o_none)); \
        assert(!Ty_Is(obj, o_none)); \
        \
        /* test Ty_True */ \
        assert(Ty_Is(o_true, o_true)); \
        assert(!Ty_Is(o_false, o_true)); \
        assert(!Ty_Is(obj, o_true)); \
        \
        /* test Ty_False */ \
        assert(Ty_Is(o_false, o_false)); \
        assert(!Ty_Is(o_true, o_false)); \
        assert(!Ty_Is(obj, o_false)); \
        \
        Ty_DECREF(obj); \
        Py_RETURN_NONE; \
    } while (0)

// Test Ty_Is() macro
static TyObject*
test_py_is_macros(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TEST_PY_IS();
}

#undef Ty_Is

// Test Ty_Is() function, after undefining its macro.
static TyObject*
test_py_is_funcs(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TEST_PY_IS();
}


static TyObject *
clear_managed_dict(TyObject *self, TyObject *obj)
{
    PyObject_ClearManagedDict(obj);
    Py_RETURN_NONE;
}


static TyObject *
is_uniquely_referenced(TyObject *self, TyObject *op)
{
    return TyBool_FromLong(PyUnstable_Object_IsUniquelyReferenced(op));
}


static TyMethodDef test_methods[] = {
    {"call_pyobject_print", call_pyobject_print, METH_VARARGS},
    {"pyobject_print_null", pyobject_print_null, METH_VARARGS},
    {"pyobject_print_noref_object", pyobject_print_noref_object, METH_VARARGS},
    {"pyobject_print_os_error", pyobject_print_os_error, METH_VARARGS},
    {"pyobject_clear_weakrefs_no_callbacks", pyobject_clear_weakrefs_no_callbacks, METH_O},
    {"pyobject_enable_deferred_refcount", pyobject_enable_deferred_refcount, METH_O},
    {"pyobject_is_unique_temporary", pyobject_is_unique_temporary, METH_O},
    {"test_py_try_inc_ref", test_py_try_inc_ref, METH_NOARGS},
    {"test_xincref_doesnt_leak",test_xincref_doesnt_leak,        METH_NOARGS},
    {"test_incref_doesnt_leak", test_incref_doesnt_leak,         METH_NOARGS},
    {"test_xdecref_doesnt_leak",test_xdecref_doesnt_leak,        METH_NOARGS},
    {"test_decref_doesnt_leak", test_decref_doesnt_leak,         METH_NOARGS},
    {"test_incref_decref_API",  test_incref_decref_API,          METH_NOARGS},
#ifdef Ty_REF_DEBUG
    {"negative_refcount", negative_refcount, METH_NOARGS},
    {"decref_freed_object", decref_freed_object, METH_NOARGS},
#endif
    {"test_py_clear", test_py_clear, METH_NOARGS},
    {"test_py_setref", test_py_setref, METH_NOARGS},
    {"test_refcount_macros", test_refcount_macros, METH_NOARGS},
    {"test_refcount_funcs", test_refcount_funcs, METH_NOARGS},
    {"test_py_is_macros", test_py_is_macros, METH_NOARGS},
    {"test_py_is_funcs", test_py_is_funcs, METH_NOARGS},
    {"clear_managed_dict", clear_managed_dict, METH_O, NULL},
    {"is_uniquely_referenced", is_uniquely_referenced, METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Object(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
