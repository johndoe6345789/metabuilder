#include "parts.h"

static TyObject*
test_gc_control(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    int orig_enabled = TyGC_IsEnabled();
    const char* msg = "ok";
    int old_state;

    old_state = TyGC_Enable();
    msg = "Enable(1)";
    if (old_state != orig_enabled) {
        goto failed;
    }
    msg = "IsEnabled(1)";
    if (!TyGC_IsEnabled()) {
        goto failed;
    }

    old_state = TyGC_Disable();
    msg = "disable(2)";
    if (!old_state) {
        goto failed;
    }
    msg = "IsEnabled(2)";
    if (TyGC_IsEnabled()) {
        goto failed;
    }

    old_state = TyGC_Enable();
    msg = "enable(3)";
    if (old_state) {
        goto failed;
    }
    msg = "IsEnabled(3)";
    if (!TyGC_IsEnabled()) {
        goto failed;
    }

    if (!orig_enabled) {
        old_state = TyGC_Disable();
        msg = "disable(4)";
        if (old_state) {
            goto failed;
        }
        msg = "IsEnabled(4)";
        if (TyGC_IsEnabled()) {
            goto failed;
        }
    }

    Py_RETURN_NONE;

failed:
    /* Try to clean up if we can. */
    if (orig_enabled) {
        TyGC_Enable();
    } else {
        TyGC_Disable();
    }
    TyErr_Format(TyExc_ValueError, "GC control failed in %s", msg);
    return NULL;
}

static TyObject *
without_gc(TyObject *Py_UNUSED(self), TyObject *obj)
{
    TyTypeObject *tp = (TyTypeObject*)obj;
    if (!TyType_Check(obj) || !TyType_HasFeature(tp, Ty_TPFLAGS_HEAPTYPE)) {
        return TyErr_Format(TyExc_TypeError, "heap type expected, got %R", obj);
    }
    if (TyType_IS_GC(tp)) {
        // Don't try this at home, kids:
        tp->tp_flags -= Ty_TPFLAGS_HAVE_GC;
        tp->tp_free = PyObject_Free;
        tp->tp_traverse = NULL;
        tp->tp_clear = NULL;
    }
    assert(!TyType_IS_GC(tp));
    return Ty_NewRef(obj);
}

static void
slot_tp_del(TyObject *self)
{
    TyObject *del, *res;

    /* Temporarily resurrect the object. */
    assert(Ty_REFCNT(self) == 0);
    Ty_SET_REFCNT(self, 1);

    /* Save the current exception, if any. */
    TyObject *exc = TyErr_GetRaisedException();

    TyObject *tp_del = TyUnicode_InternFromString("__tp_del__");
    if (tp_del == NULL) {
        TyErr_FormatUnraisable("Exception ignored while deallocating");
        TyErr_SetRaisedException(exc);
        return;
    }
    /* Execute __del__ method, if any. */
    del = _TyType_LookupRef(Ty_TYPE(self), tp_del);
    Ty_DECREF(tp_del);
    if (del != NULL) {
        res = PyObject_CallOneArg(del, self);
        Ty_DECREF(del);
        if (res == NULL) {
            TyErr_FormatUnraisable("Exception ignored while calling "
                                   "deallocator %R", del);
        }
        else {
            Ty_DECREF(res);
        }
    }

    /* Restore the saved exception. */
    TyErr_SetRaisedException(exc);

    /* Undo the temporary resurrection; can't use DECREF here, it would
     * cause a recursive call.
     */
    assert(Ty_REFCNT(self) > 0);
    Ty_SET_REFCNT(self, Ty_REFCNT(self) - 1);
    if (Ty_REFCNT(self) == 0) {
        /* this is the normal path out */
        return;
    }

    /* __del__ resurrected it!  Make it look like the original Ty_DECREF
     * never happened.
     */
    {
        _Ty_ResurrectReference(self);
    }
    assert(!TyType_IS_GC(Ty_TYPE(self)) || PyObject_GC_IsTracked(self));
}

static TyObject *
with_tp_del(TyObject *self, TyObject *args)
{
    TyObject *obj;
    TyTypeObject *tp;

    if (!TyArg_ParseTuple(args, "O:with_tp_del", &obj))
        return NULL;
    tp = (TyTypeObject *) obj;
    if (!TyType_Check(obj) || !TyType_HasFeature(tp, Ty_TPFLAGS_HEAPTYPE)) {
        TyErr_Format(TyExc_TypeError,
                     "heap type expected, got %R", obj);
        return NULL;
    }
    tp->tp_del = slot_tp_del;
    return Ty_NewRef(obj);
}


struct gc_visit_state_basic {
    TyObject *target;
    int found;
};

static int
gc_visit_callback_basic(TyObject *obj, void *arg)
{
    struct gc_visit_state_basic *state = (struct gc_visit_state_basic *)arg;
    if (obj == state->target) {
        state->found = 1;
        return 0;
    }
    return 1;
}

static TyObject *
test_gc_visit_objects_basic(TyObject *Py_UNUSED(self),
                            TyObject *Py_UNUSED(ignored))
{
    TyObject *obj;
    struct gc_visit_state_basic state;

    obj = TyList_New(0);
    if (obj == NULL) {
        return NULL;
    }
    state.target = obj;
    state.found = 0;

    PyUnstable_GC_VisitObjects(gc_visit_callback_basic, &state);
    Ty_DECREF(obj);
    if (!state.found) {
        TyErr_SetString(
             TyExc_AssertionError,
             "test_gc_visit_objects_basic: Didn't find live list");
         return NULL;
    }
    Py_RETURN_NONE;
}

static int
gc_visit_callback_exit_early(TyObject *obj, void *arg)
 {
    int *visited_i = (int *)arg;
    (*visited_i)++;
    if (*visited_i == 2) {
        return 0;
    }
    return 1;
}

static TyObject *
test_gc_visit_objects_exit_early(TyObject *Py_UNUSED(self),
                                 TyObject *Py_UNUSED(ignored))
{
    int visited_i = 0;
    PyUnstable_GC_VisitObjects(gc_visit_callback_exit_early, &visited_i);
    if (visited_i != 2) {
        TyErr_SetString(
            TyExc_AssertionError,
            "test_gc_visit_objects_exit_early: did not exit when expected");
    }
    Py_RETURN_NONE;
}

typedef struct {
    PyObject_HEAD
} ObjExtraData;

static TyObject *
obj_extra_data_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    size_t extra_size = sizeof(TyObject *);
    TyObject *obj = PyUnstable_Object_GC_NewWithExtraData(type, extra_size);
    if (obj == NULL) {
        return TyErr_NoMemory();
    }
    PyObject_GC_Track(obj);
    return obj;
}

static TyObject **
obj_extra_data_get_extra_storage(TyObject *self)
{
    return (TyObject **)((char *)self + Ty_TYPE(self)->tp_basicsize);
}

static TyObject *
obj_extra_data_get(TyObject *self, void *Py_UNUSED(ignored))
{
    TyObject **extra_storage = obj_extra_data_get_extra_storage(self);
    TyObject *value = *extra_storage;
    if (!value) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(value);
}

static int
obj_extra_data_set(TyObject *self, TyObject *newval, void *Py_UNUSED(ignored))
{
    TyObject **extra_storage = obj_extra_data_get_extra_storage(self);
    Ty_CLEAR(*extra_storage);
    if (newval) {
        *extra_storage = Ty_NewRef(newval);
    }
    return 0;
}

static TyGetSetDef obj_extra_data_getset[] = {
    {"extra", obj_extra_data_get, obj_extra_data_set, NULL},
    {NULL}
};

static int
obj_extra_data_traverse(TyObject *self, visitproc visit, void *arg)
{
    TyObject **extra_storage = obj_extra_data_get_extra_storage(self);
    TyObject *value = *extra_storage;
    Ty_VISIT(value);
    return 0;
}

static int
obj_extra_data_clear(TyObject *self)
{
    TyObject **extra_storage = obj_extra_data_get_extra_storage(self);
    Ty_CLEAR(*extra_storage);
    return 0;
}

static void
obj_extra_data_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    obj_extra_data_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot ObjExtraData_Slots[] = {
    {Ty_tp_getset, obj_extra_data_getset},
    {Ty_tp_dealloc, obj_extra_data_dealloc},
    {Ty_tp_traverse, obj_extra_data_traverse},
    {Ty_tp_clear, obj_extra_data_clear},
    {Ty_tp_new, obj_extra_data_new},
    {Ty_tp_free, PyObject_GC_Del},
    {0, NULL},
};

static TyType_Spec ObjExtraData_TypeSpec = {
    .name = "_testcapi.ObjExtraData",
    .basicsize = sizeof(ObjExtraData),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    .slots = ObjExtraData_Slots,
};

static TyMethodDef test_methods[] = {
    {"test_gc_control", test_gc_control, METH_NOARGS},
    {"test_gc_visit_objects_basic", test_gc_visit_objects_basic, METH_NOARGS, NULL},
    {"test_gc_visit_objects_exit_early", test_gc_visit_objects_exit_early, METH_NOARGS, NULL},
    {"without_gc", without_gc, METH_O, NULL},
    {"with_tp_del", with_tp_del, METH_VARARGS, NULL},
    {NULL}
};

int _PyTestCapi_Init_GC(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    TyObject *ObjExtraData_Type = TyType_FromModuleAndSpec(
        mod, &ObjExtraData_TypeSpec, NULL);
    if (ObjExtraData_Type == 0) {
        return -1;
    }
    int ret = TyModule_AddType(mod, (TyTypeObject*)ObjExtraData_Type);
    Ty_DECREF(ObjExtraData_Type);
    if (ret < 0) {
        return ret;
    }

    return 0;
}
