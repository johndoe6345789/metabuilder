/* Function object implementation */

#include "Python.h"
#include "pycore_code.h"          // _TyCode_VerifyStateless()
#include "pycore_dict.h"          // _Ty_INCREF_DICT()
#include "pycore_function.h"      // _TyFunction_Vectorcall
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_stats.h"
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


static const char *
func_event_name(TyFunction_WatchEvent event) {
    switch (event) {
        #define CASE(op)                \
        case TyFunction_EVENT_##op:         \
            return "TyFunction_EVENT_" #op;
        PY_FOREACH_FUNC_EVENT(CASE)
        #undef CASE
    }
    Ty_UNREACHABLE();
}

static void
notify_func_watchers(TyInterpreterState *interp, TyFunction_WatchEvent event,
                     PyFunctionObject *func, TyObject *new_value)
{
    uint8_t bits = interp->active_func_watchers;
    int i = 0;
    while (bits) {
        assert(i < FUNC_MAX_WATCHERS);
        if (bits & 1) {
            TyFunction_WatchCallback cb = interp->func_watchers[i];
            // callback must be non-null if the watcher bit is set
            assert(cb != NULL);
            if (cb(event, func, new_value) < 0) {
                TyErr_FormatUnraisable(
                    "Exception ignored in %s watcher callback for function %U at %p",
                    func_event_name(event), func->func_qualname, func);
            }
        }
        i++;
        bits >>= 1;
    }
}

static inline void
handle_func_event(TyFunction_WatchEvent event, PyFunctionObject *func,
                  TyObject *new_value)
{
    assert(Ty_REFCNT(func) > 0);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);
    if (interp->active_func_watchers) {
        notify_func_watchers(interp, event, func, new_value);
    }
    switch (event) {
        case TyFunction_EVENT_MODIFY_CODE:
        case TyFunction_EVENT_MODIFY_DEFAULTS:
        case TyFunction_EVENT_MODIFY_KWDEFAULTS:
            RARE_EVENT_INTERP_INC(interp, func_modification);
            break;
        default:
            break;
    }
}

int
TyFunction_AddWatcher(TyFunction_WatchCallback callback)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);
    for (int i = 0; i < FUNC_MAX_WATCHERS; i++) {
        if (interp->func_watchers[i] == NULL) {
            interp->func_watchers[i] = callback;
            interp->active_func_watchers |= (1 << i);
            return i;
        }
    }
    TyErr_SetString(TyExc_RuntimeError, "no more func watcher IDs available");
    return -1;
}

int
TyFunction_ClearWatcher(int watcher_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (watcher_id < 0 || watcher_id >= FUNC_MAX_WATCHERS) {
        TyErr_Format(TyExc_ValueError, "invalid func watcher ID %d",
                     watcher_id);
        return -1;
    }
    if (!interp->func_watchers[watcher_id]) {
        TyErr_Format(TyExc_ValueError, "no func watcher set for ID %d",
                     watcher_id);
        return -1;
    }
    interp->func_watchers[watcher_id] = NULL;
    interp->active_func_watchers &= ~(1 << watcher_id);
    return 0;
}
PyFunctionObject *
_TyFunction_FromConstructor(PyFrameConstructor *constr)
{
    TyObject *module;
    if (TyDict_GetItemRef(constr->fc_globals, &_Ty_ID(__name__), &module) < 0) {
        return NULL;
    }

    PyFunctionObject *op = PyObject_GC_New(PyFunctionObject, &TyFunction_Type);
    if (op == NULL) {
        Ty_XDECREF(module);
        return NULL;
    }
    _Ty_INCREF_DICT(constr->fc_globals);
    op->func_globals = constr->fc_globals;
    _Ty_INCREF_BUILTINS(constr->fc_builtins);
    op->func_builtins = constr->fc_builtins;
    op->func_name = Ty_NewRef(constr->fc_name);
    op->func_qualname = Ty_NewRef(constr->fc_qualname);
    _Ty_INCREF_CODE((PyCodeObject *)constr->fc_code);
    op->func_code = constr->fc_code;
    op->func_defaults = Ty_XNewRef(constr->fc_defaults);
    op->func_kwdefaults = Ty_XNewRef(constr->fc_kwdefaults);
    op->func_closure = Ty_XNewRef(constr->fc_closure);
    op->func_doc = Ty_NewRef(Ty_None);
    op->func_dict = NULL;
    op->func_weakreflist = NULL;
    op->func_module = module;
    op->func_annotations = NULL;
    op->func_annotate = NULL;
    op->func_typeparams = NULL;
    op->vectorcall = _TyFunction_Vectorcall;
    op->func_version = FUNC_VERSION_UNSET;
    // NOTE: functions created via FrameConstructor do not use deferred
    // reference counting because they are typically not part of cycles
    // nor accessed by multiple threads.
    _TyObject_GC_TRACK(op);
    handle_func_event(TyFunction_EVENT_CREATE, op, NULL);
    return op;
}

TyObject *
TyFunction_NewWithQualName(TyObject *code, TyObject *globals, TyObject *qualname)
{
    assert(globals != NULL);
    assert(TyDict_Check(globals));
    _Ty_INCREF_DICT(globals);

    PyCodeObject *code_obj = (PyCodeObject *)code;
    _Ty_INCREF_CODE(code_obj);

    assert(code_obj->co_name != NULL);
    TyObject *name = Ty_NewRef(code_obj->co_name);

    if (!qualname) {
        qualname = code_obj->co_qualname;
    }
    assert(qualname != NULL);
    Ty_INCREF(qualname);

    TyObject *consts = code_obj->co_consts;
    assert(TyTuple_Check(consts));
    TyObject *doc;
    if (code_obj->co_flags & CO_HAS_DOCSTRING) {
        assert(TyTuple_Size(consts) >= 1);
        doc = TyTuple_GetItem(consts, 0);
        if (!TyUnicode_Check(doc)) {
            doc = Ty_None;
        }
    }
    else {
        doc = Ty_None;
    }
    Ty_INCREF(doc);

    // __module__: Use globals['__name__'] if it exists, or NULL.
    TyObject *module;
    TyObject *builtins = NULL;
    if (TyDict_GetItemRef(globals, &_Ty_ID(__name__), &module) < 0) {
        goto error;
    }

    builtins = _TyDict_LoadBuiltinsFromGlobals(globals);
    if (builtins == NULL) {
        goto error;
    }

    PyFunctionObject *op = PyObject_GC_New(PyFunctionObject, &TyFunction_Type);
    if (op == NULL) {
        goto error;
    }
    /* Note: No failures from this point on, since func_dealloc() does not
       expect a partially-created object. */

    op->func_globals = globals;
    op->func_builtins = builtins;
    op->func_name = name;
    op->func_qualname = qualname;
    op->func_code = (TyObject*)code_obj;
    op->func_defaults = NULL;    // No default positional arguments
    op->func_kwdefaults = NULL;  // No default keyword arguments
    op->func_closure = NULL;
    op->func_doc = doc;
    op->func_dict = NULL;
    op->func_weakreflist = NULL;
    op->func_module = module;
    op->func_annotations = NULL;
    op->func_annotate = NULL;
    op->func_typeparams = NULL;
    op->vectorcall = _TyFunction_Vectorcall;
    op->func_version = FUNC_VERSION_UNSET;
    if (((code_obj->co_flags & CO_NESTED) == 0) ||
        (code_obj->co_flags & CO_METHOD)) {
        // Use deferred reference counting for top-level functions, but not
        // nested functions because they are more likely to capture variables,
        // which makes prompt deallocation more important.
        //
        // Nested methods (functions defined in class scope) are also deferred,
        // since they will likely be cleaned up by GC anyway.
        _TyObject_SetDeferredRefcount((TyObject *)op);
    }
    _TyObject_GC_TRACK(op);
    handle_func_event(TyFunction_EVENT_CREATE, op, NULL);
    return (TyObject *)op;

error:
    Ty_DECREF(globals);
    Ty_DECREF(code_obj);
    Ty_DECREF(name);
    Ty_DECREF(qualname);
    Ty_DECREF(doc);
    Ty_XDECREF(module);
    Ty_XDECREF(builtins);
    return NULL;
}

/*
(This is purely internal documentation. There are no public APIs here.)

Function (and code) versions
----------------------------

The Tier 1 specializer generates CALL variants that can be invalidated
by changes to critical function attributes:

- __code__
- __defaults__
- __kwdefaults__
- __closure__

For this purpose function objects have a 32-bit func_version member
that the specializer writes to the specialized instruction's inline
cache and which is checked by a guard on the specialized instructions.

The MAKE_FUNCTION bytecode sets func_version from the code object's
co_version field.  The latter is initialized from a counter in the
interpreter state (interp->func_state.next_version) and never changes.
When this counter overflows, it remains zero and the specializer loses
the ability to specialize calls to new functions.

The func_version is reset to zero when any of the critical attributes
is modified; after this point the specializer will no longer specialize
calls to this function, and the guard will always fail.

The function and code version cache
-----------------------------------

The Tier 2 optimizer now has a problem, since it needs to find the
function and code objects given only the version number from the inline
cache.  Our solution is to maintain a cache mapping version numbers to
function and code objects.  To limit the cache size we could hash
the version number, but for now we simply use it modulo the table size.

There are some corner cases (e.g. generator expressions) where we will
be unable to find the function object in the cache but we can still
find the code object.  For this reason the cache stores both the
function object and the code object.

The cache doesn't contain strong references; cache entries are
invalidated whenever the function or code object is deallocated.

Invariants
----------

These should hold at any time except when one of the cache-mutating
functions is running.

- For any slot s at index i:
    - s->func == NULL or s->func->func_version % FUNC_VERSION_CACHE_SIZE == i
    - s->code == NULL or s->code->co_version % FUNC_VERSION_CACHE_SIZE == i
    if s->func != NULL, then s->func->func_code == s->code

*/

#ifndef Ty_GIL_DISABLED
static inline struct _func_version_cache_item *
get_cache_item(TyInterpreterState *interp, uint32_t version)
{
    return interp->func_state.func_version_cache +
           (version % FUNC_VERSION_CACHE_SIZE);
}
#endif

void
_TyFunction_SetVersion(PyFunctionObject *func, uint32_t version)
{
    assert(func->func_version == FUNC_VERSION_UNSET);
    assert(version >= FUNC_VERSION_FIRST_VALID);
    // This should only be called from MAKE_FUNCTION. No code is specialized
    // based on the version, so we do not need to stop the world to set it.
    func->func_version = version;
#ifndef Ty_GIL_DISABLED
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _func_version_cache_item *slot = get_cache_item(interp, version);
    slot->func = func;
    slot->code = func->func_code;
#endif
}

static void
func_clear_version(TyInterpreterState *interp, PyFunctionObject *func)
{
    if (func->func_version < FUNC_VERSION_FIRST_VALID) {
        // Version was never set or has already been cleared.
        return;
    }
#ifndef Ty_GIL_DISABLED
    struct _func_version_cache_item *slot =
        get_cache_item(interp, func->func_version);
    if (slot->func == func) {
        slot->func = NULL;
        // Leave slot->code alone, there may be use for it.
    }
#endif
    func->func_version = FUNC_VERSION_CLEARED;
}

// Called when any of the critical function attributes are changed
static void
_TyFunction_ClearVersion(PyFunctionObject *func)
{
    if (func->func_version < FUNC_VERSION_FIRST_VALID) {
        // Version was never set or has already been cleared.
        return;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyEval_StopTheWorld(interp);
    func_clear_version(interp, func);
    _TyEval_StartTheWorld(interp);
}

void
_TyFunction_ClearCodeByVersion(uint32_t version)
{
#ifndef Ty_GIL_DISABLED
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _func_version_cache_item *slot = get_cache_item(interp, version);
    if (slot->code) {
        assert(TyCode_Check(slot->code));
        PyCodeObject *code = (PyCodeObject *)slot->code;
        if (code->co_version == version) {
            slot->code = NULL;
            slot->func = NULL;
        }
    }
#endif
}

PyFunctionObject *
_TyFunction_LookupByVersion(uint32_t version, TyObject **p_code)
{
#ifdef Ty_GIL_DISABLED
    return NULL;
#else
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _func_version_cache_item *slot = get_cache_item(interp, version);
    if (slot->code) {
        assert(TyCode_Check(slot->code));
        PyCodeObject *code = (PyCodeObject *)slot->code;
        if (code->co_version == version) {
            *p_code = slot->code;
        }
    }
    else {
        *p_code = NULL;
    }
    if (slot->func && slot->func->func_version == version) {
        assert(slot->func->func_code == slot->code);
        return slot->func;
    }
    return NULL;
#endif
}

uint32_t
_TyFunction_GetVersionForCurrentState(PyFunctionObject *func)
{
    return func->func_version;
}

TyObject *
TyFunction_New(TyObject *code, TyObject *globals)
{
    return TyFunction_NewWithQualName(code, globals, NULL);
}

TyObject *
TyFunction_GetCode(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_code;
}

TyObject *
TyFunction_GetGlobals(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_globals;
}

TyObject *
TyFunction_GetModule(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_module;
}

TyObject *
TyFunction_GetDefaults(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_defaults;
}

int
TyFunction_SetDefaults(TyObject *op, TyObject *defaults)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (defaults == Ty_None)
        defaults = NULL;
    else if (defaults && TyTuple_Check(defaults)) {
        Ty_INCREF(defaults);
    }
    else {
        TyErr_SetString(TyExc_SystemError, "non-tuple default args");
        return -1;
    }
    handle_func_event(TyFunction_EVENT_MODIFY_DEFAULTS,
                      (PyFunctionObject *) op, defaults);
    _TyFunction_ClearVersion((PyFunctionObject *)op);
    Ty_XSETREF(((PyFunctionObject *)op)->func_defaults, defaults);
    return 0;
}

void
TyFunction_SetVectorcall(PyFunctionObject *func, vectorcallfunc vectorcall)
{
    assert(func != NULL);
    _TyFunction_ClearVersion(func);
    func->vectorcall = vectorcall;
}

TyObject *
TyFunction_GetKwDefaults(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_kwdefaults;
}

int
TyFunction_SetKwDefaults(TyObject *op, TyObject *defaults)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (defaults == Ty_None)
        defaults = NULL;
    else if (defaults && TyDict_Check(defaults)) {
        Ty_INCREF(defaults);
    }
    else {
        TyErr_SetString(TyExc_SystemError,
                        "non-dict keyword only default args");
        return -1;
    }
    handle_func_event(TyFunction_EVENT_MODIFY_KWDEFAULTS,
                      (PyFunctionObject *) op, defaults);
    _TyFunction_ClearVersion((PyFunctionObject *)op);
    Ty_XSETREF(((PyFunctionObject *)op)->func_kwdefaults, defaults);
    return 0;
}

TyObject *
TyFunction_GetClosure(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyFunctionObject *) op) -> func_closure;
}

int
TyFunction_SetClosure(TyObject *op, TyObject *closure)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (closure == Ty_None)
        closure = NULL;
    else if (TyTuple_Check(closure)) {
        Ty_INCREF(closure);
    }
    else {
        TyErr_Format(TyExc_SystemError,
                     "expected tuple for closure, got '%.100s'",
                     Ty_TYPE(closure)->tp_name);
        return -1;
    }
    _TyFunction_ClearVersion((PyFunctionObject *)op);
    Ty_XSETREF(((PyFunctionObject *)op)->func_closure, closure);
    return 0;
}

static TyObject *
func_get_annotation_dict(PyFunctionObject *op)
{
    if (op->func_annotations == NULL) {
        if (op->func_annotate == NULL || !PyCallable_Check(op->func_annotate)) {
            Py_RETURN_NONE;
        }
        TyObject *one = _TyLong_GetOne();
        TyObject *ann_dict = _TyObject_CallOneArg(op->func_annotate, one);
        if (ann_dict == NULL) {
            return NULL;
        }
        if (!TyDict_Check(ann_dict)) {
            TyErr_Format(TyExc_TypeError, "__annotate__ returned non-dict of type '%.100s'",
                         Ty_TYPE(ann_dict)->tp_name);
            Ty_DECREF(ann_dict);
            return NULL;
        }
        Ty_XSETREF(op->func_annotations, ann_dict);
        return ann_dict;
    }
    if (TyTuple_CheckExact(op->func_annotations)) {
        TyObject *ann_tuple = op->func_annotations;
        TyObject *ann_dict = TyDict_New();
        if (ann_dict == NULL) {
            return NULL;
        }

        assert(TyTuple_GET_SIZE(ann_tuple) % 2 == 0);

        for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(ann_tuple); i += 2) {
            int err = TyDict_SetItem(ann_dict,
                                     TyTuple_GET_ITEM(ann_tuple, i),
                                     TyTuple_GET_ITEM(ann_tuple, i + 1));

            if (err < 0) {
                Ty_DECREF(ann_dict);
                return NULL;
            }
        }
        Ty_SETREF(op->func_annotations, ann_dict);
    }
    assert(TyDict_Check(op->func_annotations));
    return op->func_annotations;
}

TyObject *
TyFunction_GetAnnotations(TyObject *op)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return func_get_annotation_dict((PyFunctionObject *)op);
}

int
TyFunction_SetAnnotations(TyObject *op, TyObject *annotations)
{
    if (!TyFunction_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (annotations == Ty_None)
        annotations = NULL;
    else if (annotations && TyDict_Check(annotations)) {
        Ty_INCREF(annotations);
    }
    else {
        TyErr_SetString(TyExc_SystemError,
                        "non-dict annotations");
        return -1;
    }
    PyFunctionObject *func = (PyFunctionObject *)op;
    Ty_XSETREF(func->func_annotations, annotations);
    Ty_CLEAR(func->func_annotate);
    return 0;
}

/* Methods */

#define OFF(x) offsetof(PyFunctionObject, x)

static TyMemberDef func_memberlist[] = {
    {"__closure__",   _Ty_T_OBJECT,     OFF(func_closure), Py_READONLY},
    {"__doc__",       _Ty_T_OBJECT,     OFF(func_doc), 0},
    {"__globals__",   _Ty_T_OBJECT,     OFF(func_globals), Py_READONLY},
    {"__module__",    _Ty_T_OBJECT,     OFF(func_module), 0},
    {"__builtins__",  _Ty_T_OBJECT,     OFF(func_builtins), Py_READONLY},
    {NULL}  /* Sentinel */
};

/*[clinic input]
class function "PyFunctionObject *" "&TyFunction_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=70af9c90aa2e71b0]*/

#include "clinic/funcobject.c.h"

static TyObject *
func_get_code(TyObject *self, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    if (TySys_Audit("object.__getattr__", "Os", op, "__code__") < 0) {
        return NULL;
    }

    return Ty_NewRef(op->func_code);
}

static int
func_set_code(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);

    /* Not legal to del f.func_code or to set it to anything
     * other than a code object. */
    if (value == NULL || !TyCode_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__code__ must be set to a code object");
        return -1;
    }

    if (TySys_Audit("object.__setattr__", "OsO",
                    op, "__code__", value) < 0) {
        return -1;
    }

    int nfree = ((PyCodeObject *)value)->co_nfreevars;
    Ty_ssize_t nclosure = (op->func_closure == NULL ? 0 :
                                        TyTuple_GET_SIZE(op->func_closure));
    if (nclosure != nfree) {
        TyErr_Format(TyExc_ValueError,
                     "%U() requires a code object with %zd free vars,"
                     " not %zd",
                     op->func_name,
                     nclosure, nfree);
        return -1;
    }

    TyObject *func_code = TyFunction_GET_CODE(op);
    int old_flags = ((PyCodeObject *)func_code)->co_flags;
    int new_flags = ((PyCodeObject *)value)->co_flags;
    int mask = CO_GENERATOR | CO_COROUTINE | CO_ASYNC_GENERATOR;
    if ((old_flags & mask) != (new_flags & mask)) {
        if (TyErr_Warn(TyExc_DeprecationWarning,
            "Assigning a code object of non-matching type is deprecated "
            "(e.g., from a generator to a plain function)") < 0)
        {
            return -1;
        }
    }

    handle_func_event(TyFunction_EVENT_MODIFY_CODE, op, value);
    _TyFunction_ClearVersion(op);
    Ty_XSETREF(op->func_code, Ty_NewRef(value));
    return 0;
}

static TyObject *
func_get_name(TyObject *self, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    return Ty_NewRef(op->func_name);
}

static int
func_set_name(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    /* Not legal to del f.func_name or to set it to anything
     * other than a string object. */
    if (value == NULL || !TyUnicode_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__name__ must be set to a string object");
        return -1;
    }
    Ty_XSETREF(op->func_name, Ty_NewRef(value));
    return 0;
}

static TyObject *
func_get_qualname(TyObject *self, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    return Ty_NewRef(op->func_qualname);
}

static int
func_set_qualname(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    /* Not legal to del f.__qualname__ or to set it to anything
     * other than a string object. */
    if (value == NULL || !TyUnicode_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__qualname__ must be set to a string object");
        return -1;
    }
    Ty_XSETREF(op->func_qualname, Ty_NewRef(value));
    return 0;
}

static TyObject *
func_get_defaults(TyObject *self, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    if (TySys_Audit("object.__getattr__", "Os", op, "__defaults__") < 0) {
        return NULL;
    }
    if (op->func_defaults == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(op->func_defaults);
}

static int
func_set_defaults(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    /* Legal to del f.func_defaults.
     * Can only set func_defaults to NULL or a tuple. */
    PyFunctionObject *op = _TyFunction_CAST(self);
    if (value == Ty_None)
        value = NULL;
    if (value != NULL && !TyTuple_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__defaults__ must be set to a tuple object");
        return -1;
    }
    if (value) {
        if (TySys_Audit("object.__setattr__", "OsO",
                        op, "__defaults__", value) < 0) {
            return -1;
        }
    } else if (TySys_Audit("object.__delattr__", "Os",
                           op, "__defaults__") < 0) {
        return -1;
    }

    handle_func_event(TyFunction_EVENT_MODIFY_DEFAULTS, op, value);
    _TyFunction_ClearVersion(op);
    Ty_XSETREF(op->func_defaults, Ty_XNewRef(value));
    return 0;
}

static TyObject *
func_get_kwdefaults(TyObject *self, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    if (TySys_Audit("object.__getattr__", "Os",
                    op, "__kwdefaults__") < 0) {
        return NULL;
    }
    if (op->func_kwdefaults == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(op->func_kwdefaults);
}

static int
func_set_kwdefaults(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    if (value == Ty_None)
        value = NULL;
    /* Legal to del f.func_kwdefaults.
     * Can only set func_kwdefaults to NULL or a dict. */
    if (value != NULL && !TyDict_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
            "__kwdefaults__ must be set to a dict object");
        return -1;
    }
    if (value) {
        if (TySys_Audit("object.__setattr__", "OsO",
                        op, "__kwdefaults__", value) < 0) {
            return -1;
        }
    } else if (TySys_Audit("object.__delattr__", "Os",
                           op, "__kwdefaults__") < 0) {
        return -1;
    }

    handle_func_event(TyFunction_EVENT_MODIFY_KWDEFAULTS, op, value);
    _TyFunction_ClearVersion(op);
    Ty_XSETREF(op->func_kwdefaults, Ty_XNewRef(value));
    return 0;
}

/*[clinic input]
@critical_section
@getter
function.__annotate__

Get the code object for a function.
[clinic start generated code]*/

static TyObject *
function___annotate___get_impl(PyFunctionObject *self)
/*[clinic end generated code: output=5ec7219ff2bda9e6 input=7f3db11e3c3329f3]*/
{
    if (self->func_annotate == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(self->func_annotate);
}

/*[clinic input]
@critical_section
@setter
function.__annotate__
[clinic start generated code]*/

static int
function___annotate___set_impl(PyFunctionObject *self, TyObject *value)
/*[clinic end generated code: output=05b7dfc07ada66cd input=eb6225e358d97448]*/
{
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError,
            "__annotate__ cannot be deleted");
        return -1;
    }
    if (Ty_IsNone(value)) {
        Ty_XSETREF(self->func_annotate, value);
        return 0;
    }
    else if (PyCallable_Check(value)) {
        Ty_XSETREF(self->func_annotate, Ty_XNewRef(value));
        Ty_CLEAR(self->func_annotations);
        return 0;
    }
    else {
        TyErr_SetString(TyExc_TypeError,
            "__annotate__ must be callable or None");
        return -1;
    }
}

/*[clinic input]
@critical_section
@getter
function.__annotations__

Dict of annotations in a function object.
[clinic start generated code]*/

static TyObject *
function___annotations___get_impl(PyFunctionObject *self)
/*[clinic end generated code: output=a4cf4c884c934cbb input=92643d7186c1ad0c]*/
{
    TyObject *d = NULL;
    if (self->func_annotations == NULL &&
        (self->func_annotate == NULL || !PyCallable_Check(self->func_annotate))) {
        self->func_annotations = TyDict_New();
        if (self->func_annotations == NULL)
            return NULL;
    }
    d = func_get_annotation_dict(self);
    return Ty_XNewRef(d);
}

/*[clinic input]
@critical_section
@setter
function.__annotations__
[clinic start generated code]*/

static int
function___annotations___set_impl(PyFunctionObject *self, TyObject *value)
/*[clinic end generated code: output=a61795d4a95eede4 input=5302641f686f0463]*/
{
    if (value == Ty_None)
        value = NULL;
    /* Legal to del f.func_annotations.
     * Can only set func_annotations to NULL (through C api)
     * or a dict. */
    if (value != NULL && !TyDict_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
            "__annotations__ must be set to a dict object");
        return -1;
    }
    Ty_XSETREF(self->func_annotations, Ty_XNewRef(value));
    Ty_CLEAR(self->func_annotate);
    return 0;
}

/*[clinic input]
@critical_section
@getter
function.__type_params__

Get the declared type parameters for a function.
[clinic start generated code]*/

static TyObject *
function___type_params___get_impl(PyFunctionObject *self)
/*[clinic end generated code: output=eb844d7ffca517a8 input=0864721484293724]*/
{
    if (self->func_typeparams == NULL) {
        return TyTuple_New(0);
    }

    assert(TyTuple_Check(self->func_typeparams));
    return Ty_NewRef(self->func_typeparams);
}

/*[clinic input]
@critical_section
@setter
function.__type_params__
[clinic start generated code]*/

static int
function___type_params___set_impl(PyFunctionObject *self, TyObject *value)
/*[clinic end generated code: output=038b4cda220e56fb input=3862fbd4db2b70e8]*/
{
    /* Not legal to del f.__type_params__ or to set it to anything
     * other than a tuple object. */
    if (value == NULL || !TyTuple_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__type_params__ must be set to a tuple");
        return -1;
    }
    Ty_XSETREF(self->func_typeparams, Ty_NewRef(value));
    return 0;
}

TyObject *
_Ty_set_function_type_params(TyThreadState *Py_UNUSED(ignored), TyObject *func,
                             TyObject *type_params)
{
    assert(TyFunction_Check(func));
    assert(TyTuple_Check(type_params));
    PyFunctionObject *f = (PyFunctionObject *)func;
    Ty_XSETREF(f->func_typeparams, Ty_NewRef(type_params));
    return Ty_NewRef(func);
}

static TyGetSetDef func_getsetlist[] = {
    {"__code__", func_get_code, func_set_code},
    {"__defaults__", func_get_defaults, func_set_defaults},
    {"__kwdefaults__", func_get_kwdefaults, func_set_kwdefaults},
    FUNCTION___ANNOTATIONS___GETSETDEF
    FUNCTION___ANNOTATE___GETSETDEF
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
    {"__name__", func_get_name, func_set_name},
    {"__qualname__", func_get_qualname, func_set_qualname},
    FUNCTION___TYPE_PARAMS___GETSETDEF
    {NULL} /* Sentinel */
};

/* function.__new__() maintains the following invariants for closures.
   The closure must correspond to the free variables of the code object.

   if len(code.co_freevars) == 0:
       closure = NULL
   else:
       len(closure) == len(code.co_freevars)
   for every elt in closure, type(elt) == cell
*/

/*[clinic input]
@classmethod
function.__new__ as func_new
    code: object(type="PyCodeObject *", subclass_of="&TyCode_Type")
        a code object
    globals: object(subclass_of="&TyDict_Type")
        the globals dictionary
    name: object = None
        a string that overrides the name from the code object
    argdefs as defaults: object = None
        a tuple that specifies the default argument values
    closure: object = None
        a tuple that supplies the bindings for free variables
    kwdefaults: object = None
        a dictionary that specifies the default keyword argument values

Create a function object.
[clinic start generated code]*/

static TyObject *
func_new_impl(TyTypeObject *type, PyCodeObject *code, TyObject *globals,
              TyObject *name, TyObject *defaults, TyObject *closure,
              TyObject *kwdefaults)
/*[clinic end generated code: output=de72f4c22ac57144 input=20c9c9f04ad2d3f2]*/
{
    PyFunctionObject *newfunc;
    Ty_ssize_t nclosure;

    if (name != Ty_None && !TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_TypeError,
                        "arg 3 (name) must be None or string");
        return NULL;
    }
    if (defaults != Ty_None && !TyTuple_Check(defaults)) {
        TyErr_SetString(TyExc_TypeError,
                        "arg 4 (defaults) must be None or tuple");
        return NULL;
    }
    if (!TyTuple_Check(closure)) {
        if (code->co_nfreevars && closure == Ty_None) {
            TyErr_SetString(TyExc_TypeError,
                            "arg 5 (closure) must be tuple");
            return NULL;
        }
        else if (closure != Ty_None) {
            TyErr_SetString(TyExc_TypeError,
                "arg 5 (closure) must be None or tuple");
            return NULL;
        }
    }
    if (kwdefaults != Ty_None && !TyDict_Check(kwdefaults)) {
        TyErr_SetString(TyExc_TypeError,
                        "arg 6 (kwdefaults) must be None or dict");
        return NULL;
    }

    /* check that the closure is well-formed */
    nclosure = closure == Ty_None ? 0 : TyTuple_GET_SIZE(closure);
    if (code->co_nfreevars != nclosure)
        return TyErr_Format(TyExc_ValueError,
                            "%U requires closure of length %zd, not %zd",
                            code->co_name, code->co_nfreevars, nclosure);
    if (nclosure) {
        Ty_ssize_t i;
        for (i = 0; i < nclosure; i++) {
            TyObject *o = TyTuple_GET_ITEM(closure, i);
            if (!TyCell_Check(o)) {
                return TyErr_Format(TyExc_TypeError,
                    "arg 5 (closure) expected cell, found %s",
                                    Ty_TYPE(o)->tp_name);
            }
        }
    }
    if (TySys_Audit("function.__new__", "O", code) < 0) {
        return NULL;
    }

    newfunc = (PyFunctionObject *)TyFunction_New((TyObject *)code,
                                                 globals);
    if (newfunc == NULL) {
        return NULL;
    }
    if (name != Ty_None) {
        Ty_SETREF(newfunc->func_name, Ty_NewRef(name));
    }
    if (defaults != Ty_None) {
        newfunc->func_defaults = Ty_NewRef(defaults);
    }
    if (closure != Ty_None) {
        newfunc->func_closure = Ty_NewRef(closure);
    }
    if (kwdefaults != Ty_None) {
        newfunc->func_kwdefaults = Ty_NewRef(kwdefaults);
    }

    return (TyObject *)newfunc;
}

static int
func_clear(TyObject *self)
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    func_clear_version(_TyInterpreterState_GET(), op);
    TyObject *globals = op->func_globals;
    op->func_globals = NULL;
    if (globals != NULL) {
        _Ty_DECREF_DICT(globals);
    }
    TyObject *builtins = op->func_builtins;
    op->func_builtins = NULL;
    if (builtins != NULL) {
        _Ty_DECREF_BUILTINS(builtins);
    }
    Ty_CLEAR(op->func_module);
    Ty_CLEAR(op->func_defaults);
    Ty_CLEAR(op->func_kwdefaults);
    Ty_CLEAR(op->func_doc);
    Ty_CLEAR(op->func_dict);
    Ty_CLEAR(op->func_closure);
    Ty_CLEAR(op->func_annotations);
    Ty_CLEAR(op->func_annotate);
    Ty_CLEAR(op->func_typeparams);
    // Don't Ty_CLEAR(op->func_code), since code is always required
    // to be non-NULL. Similarly, name and qualname shouldn't be NULL.
    // However, name and qualname could be str subclasses, so they
    // could have reference cycles. The solution is to replace them
    // with a genuinely immutable string.
    Ty_SETREF(op->func_name, &_Ty_STR(empty));
    Ty_SETREF(op->func_qualname, &_Ty_STR(empty));
    return 0;
}

static void
func_dealloc(TyObject *self)
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    _TyObject_ResurrectStart(self);
    handle_func_event(TyFunction_EVENT_DESTROY, op, NULL);
    if (_TyObject_ResurrectEnd(self)) {
        return;
    }
    _TyObject_GC_UNTRACK(op);
    FT_CLEAR_WEAKREFS(self, op->func_weakreflist);
    (void)func_clear((TyObject*)op);
    // These aren't cleared by func_clear().
    _Ty_DECREF_CODE((PyCodeObject *)op->func_code);
    Ty_DECREF(op->func_name);
    Ty_DECREF(op->func_qualname);
    PyObject_GC_Del(op);
}

static TyObject*
func_repr(TyObject *self)
{
    PyFunctionObject *op = _TyFunction_CAST(self);
    return TyUnicode_FromFormat("<function %U at %p>",
                                op->func_qualname, op);
}

static int
func_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyFunctionObject *f = _TyFunction_CAST(self);
    Ty_VISIT(f->func_code);
    Ty_VISIT(f->func_globals);
    Ty_VISIT(f->func_builtins);
    Ty_VISIT(f->func_module);
    Ty_VISIT(f->func_defaults);
    Ty_VISIT(f->func_kwdefaults);
    Ty_VISIT(f->func_doc);
    Ty_VISIT(f->func_name);
    Ty_VISIT(f->func_dict);
    Ty_VISIT(f->func_closure);
    Ty_VISIT(f->func_annotations);
    Ty_VISIT(f->func_annotate);
    Ty_VISIT(f->func_typeparams);
    Ty_VISIT(f->func_qualname);
    return 0;
}

/* Bind a function to an object */
static TyObject *
func_descr_get(TyObject *func, TyObject *obj, TyObject *type)
{
    if (obj == Ty_None || obj == NULL) {
        return Ty_NewRef(func);
    }
    return TyMethod_New(func, obj);
}

TyTypeObject TyFunction_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "function",
    sizeof(PyFunctionObject),
    0,
    func_dealloc,                               /* tp_dealloc */
    offsetof(PyFunctionObject, vectorcall),     /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    func_repr,                                  /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    PyVectorcall_Call,                          /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
    Ty_TPFLAGS_HAVE_VECTORCALL |
    Ty_TPFLAGS_METHOD_DESCRIPTOR,               /* tp_flags */
    func_new__doc__,                            /* tp_doc */
    func_traverse,                              /* tp_traverse */
    func_clear,                                 /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(PyFunctionObject, func_weakreflist), /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    func_memberlist,                            /* tp_members */
    func_getsetlist,                            /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    func_descr_get,                             /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(PyFunctionObject, func_dict),      /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    func_new,                                   /* tp_new */
};


int
_TyFunction_VerifyStateless(TyThreadState *tstate, TyObject *func)
{
    assert(!TyErr_Occurred());
    assert(TyFunction_Check(func));

    // Check the globals.
    TyObject *globalsns = TyFunction_GET_GLOBALS(func);
    if (globalsns != NULL && !TyDict_Check(globalsns)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "unsupported globals %R", globalsns);
        return -1;
    }
    // Check the builtins.
    TyObject *builtinsns = _TyFunction_GET_BUILTINS(func);
    if (builtinsns != NULL && !TyDict_Check(builtinsns)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "unsupported builtins %R", builtinsns);
        return -1;
    }
    // Disallow __defaults__.
    TyObject *defaults = TyFunction_GET_DEFAULTS(func);
    if (defaults != NULL) {
        assert(TyTuple_Check(defaults));  // per TyFunction_New()
        if (TyTuple_GET_SIZE(defaults) > 0) {
            _TyErr_SetString(tstate, TyExc_ValueError,
                             "defaults not supported");
            return -1;
        }
    }
    // Disallow __kwdefaults__.
    TyObject *kwdefaults = TyFunction_GET_KW_DEFAULTS(func);
    if (kwdefaults != NULL) {
        assert(TyDict_Check(kwdefaults));  // per TyFunction_New()
        if (TyDict_Size(kwdefaults) > 0) {
            _TyErr_SetString(tstate, TyExc_ValueError,
                             "keyword defaults not supported");
            return -1;
        }
    }
    // Disallow __closure__.
    TyObject *closure = TyFunction_GET_CLOSURE(func);
    if (closure != NULL) {
        assert(TyTuple_Check(closure));  // per TyFunction_New()
        if (TyTuple_GET_SIZE(closure) > 0) {
            _TyErr_SetString(tstate, TyExc_ValueError, "closures not supported");
            return -1;
        }
    }
    // Check the code.
    PyCodeObject *co = (PyCodeObject *)TyFunction_GET_CODE(func);
    if (_TyCode_VerifyStateless(tstate, co, NULL, globalsns, builtinsns) < 0) {
        return -1;
    }
    return 0;
}


static int
functools_copy_attr(TyObject *wrapper, TyObject *wrapped, TyObject *name)
{
    TyObject *value;
    int res = PyObject_GetOptionalAttr(wrapped, name, &value);
    if (value != NULL) {
        res = PyObject_SetAttr(wrapper, name, value);
        Ty_DECREF(value);
    }
    return res;
}

// Similar to functools.wraps(wrapper, wrapped)
static int
functools_wraps(TyObject *wrapper, TyObject *wrapped)
{
#define COPY_ATTR(ATTR) \
    do { \
        if (functools_copy_attr(wrapper, wrapped, &_Ty_ID(ATTR)) < 0) { \
            return -1; \
        } \
    } while (0) \

    COPY_ATTR(__module__);
    COPY_ATTR(__name__);
    COPY_ATTR(__qualname__);
    COPY_ATTR(__doc__);
    return 0;

#undef COPY_ATTR
}

// Used for wrapping __annotations__ and __annotate__ on classmethod
// and staticmethod objects.
static TyObject *
descriptor_get_wrapped_attribute(TyObject *wrapped, TyObject *obj, TyObject *name)
{
    TyObject *dict = PyObject_GenericGetDict(obj, NULL);
    if (dict == NULL) {
        return NULL;
    }
    TyObject *res;
    if (TyDict_GetItemRef(dict, name, &res) < 0) {
        Ty_DECREF(dict);
        return NULL;
    }
    if (res != NULL) {
        Ty_DECREF(dict);
        return res;
    }
    res = PyObject_GetAttr(wrapped, name);
    if (res == NULL) {
        Ty_DECREF(dict);
        return NULL;
    }
    if (TyDict_SetItem(dict, name, res) < 0) {
        Ty_DECREF(dict);
        Ty_DECREF(res);
        return NULL;
    }
    Ty_DECREF(dict);
    return res;
}

static int
descriptor_set_wrapped_attribute(TyObject *oobj, TyObject *name, TyObject *value,
                                 char *type_name)
{
    TyObject *dict = PyObject_GenericGetDict(oobj, NULL);
    if (dict == NULL) {
        return -1;
    }
    if (value == NULL) {
        if (TyDict_DelItem(dict, name) < 0) {
            if (TyErr_ExceptionMatches(TyExc_KeyError)) {
                TyErr_Clear();
                TyErr_Format(TyExc_AttributeError,
                             "'%.200s' object has no attribute '%U'",
                             type_name, name);
                Ty_DECREF(dict);
                return -1;
            }
            else {
                Ty_DECREF(dict);
                return -1;
            }
        }
        Ty_DECREF(dict);
        return 0;
    }
    else {
        Ty_DECREF(dict);
        return TyDict_SetItem(dict, name, value);
    }
}


/* Class method object */

/* A class method receives the class as implicit first argument,
   just like an instance method receives the instance.
   To declare a class method, use this idiom:

     class C:
         @classmethod
         def f(cls, arg1, arg2, argN):
             ...

   It can be called either on the class (e.g. C.f()) or on an instance
   (e.g. C().f()); the instance is ignored except for its class.
   If a class method is called for a derived class, the derived class
   object is passed as the implied first argument.

   Class methods are different than C++ or Java static methods.
   If you want those, see static methods below.
*/

typedef struct {
    PyObject_HEAD
    TyObject *cm_callable;
    TyObject *cm_dict;
} classmethod;

#define _PyClassMethod_CAST(cm) \
    (assert(PyObject_TypeCheck((cm), &TyClassMethod_Type)), \
     _Py_CAST(classmethod*, cm))

static void
cm_dealloc(TyObject *self)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    _TyObject_GC_UNTRACK((TyObject *)cm);
    Ty_XDECREF(cm->cm_callable);
    Ty_XDECREF(cm->cm_dict);
    Ty_TYPE(cm)->tp_free((TyObject *)cm);
}

static int
cm_traverse(TyObject *self, visitproc visit, void *arg)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    Ty_VISIT(cm->cm_callable);
    Ty_VISIT(cm->cm_dict);
    return 0;
}

static int
cm_clear(TyObject *self)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    Ty_CLEAR(cm->cm_callable);
    Ty_CLEAR(cm->cm_dict);
    return 0;
}


static TyObject *
cm_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    classmethod *cm = (classmethod *)self;

    if (cm->cm_callable == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "uninitialized classmethod object");
        return NULL;
    }
    if (type == NULL)
        type = (TyObject *)(Ty_TYPE(obj));
    return TyMethod_New(cm->cm_callable, type);
}

static int
cm_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    classmethod *cm = (classmethod *)self;
    TyObject *callable;

    if (!_TyArg_NoKeywords("classmethod", kwds))
        return -1;
    if (!TyArg_UnpackTuple(args, "classmethod", 1, 1, &callable))
        return -1;
    Ty_XSETREF(cm->cm_callable, Ty_NewRef(callable));

    if (functools_wraps((TyObject *)cm, cm->cm_callable) < 0) {
        return -1;
    }
    return 0;
}

static TyMemberDef cm_memberlist[] = {
    {"__func__", _Ty_T_OBJECT, offsetof(classmethod, cm_callable), Py_READONLY},
    {"__wrapped__", _Ty_T_OBJECT, offsetof(classmethod, cm_callable), Py_READONLY},
    {NULL}  /* Sentinel */
};

static TyObject *
cm_get___isabstractmethod__(TyObject *self, void *closure)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    int res = _TyObject_IsAbstract(cm->cm_callable);
    if (res == -1) {
        return NULL;
    }
    else if (res) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
cm_get___annotations__(TyObject *self, void *closure)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    return descriptor_get_wrapped_attribute(cm->cm_callable, self, &_Ty_ID(__annotations__));
}

static int
cm_set___annotations__(TyObject *self, TyObject *value, void *closure)
{
    return descriptor_set_wrapped_attribute(self, &_Ty_ID(__annotations__), value, "classmethod");
}

static TyObject *
cm_get___annotate__(TyObject *self, void *closure)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    return descriptor_get_wrapped_attribute(cm->cm_callable, self, &_Ty_ID(__annotate__));
}

static int
cm_set___annotate__(TyObject *self, TyObject *value, void *closure)
{
    return descriptor_set_wrapped_attribute(self, &_Ty_ID(__annotate__), value, "classmethod");
}


static TyGetSetDef cm_getsetlist[] = {
    {"__isabstractmethod__", cm_get___isabstractmethod__, NULL, NULL, NULL},
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict, NULL, NULL},
    {"__annotations__", cm_get___annotations__, cm_set___annotations__, NULL, NULL},
    {"__annotate__", cm_get___annotate__, cm_set___annotate__, NULL, NULL},
    {NULL} /* Sentinel */
};

static TyMethodDef cm_methodlist[] = {
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, NULL},
    {NULL} /* Sentinel */
};

static TyObject*
cm_repr(TyObject *self)
{
    classmethod *cm = _PyClassMethod_CAST(self);
    return TyUnicode_FromFormat("<classmethod(%R)>", cm->cm_callable);
}

TyDoc_STRVAR(classmethod_doc,
"classmethod(function, /)\n\
--\n\
\n\
Convert a function to be a class method.\n\
\n\
A class method receives the class as implicit first argument,\n\
just like an instance method receives the instance.\n\
To declare a class method, use this idiom:\n\
\n\
  class C:\n\
      @classmethod\n\
      def f(cls, arg1, arg2, argN):\n\
          ...\n\
\n\
It can be called either on the class (e.g. C.f()) or on an instance\n\
(e.g. C().f()).  The instance is ignored except for its class.\n\
If a class method is called for a derived class, the derived class\n\
object is passed as the implied first argument.\n\
\n\
Class methods are different than C++ or Java static methods.\n\
If you want those, see the staticmethod builtin.");

TyTypeObject TyClassMethod_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "classmethod",
    sizeof(classmethod),
    0,
    cm_dealloc,                                 /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    cm_repr,                                    /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    classmethod_doc,                            /* tp_doc */
    cm_traverse,                                /* tp_traverse */
    cm_clear,                                   /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    cm_methodlist,                              /* tp_methods */
    cm_memberlist,                              /* tp_members */
    cm_getsetlist,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    cm_descr_get,                               /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(classmethod, cm_dict),             /* tp_dictoffset */
    cm_init,                                    /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    TyType_GenericNew,                          /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
};

TyObject *
TyClassMethod_New(TyObject *callable)
{
    classmethod *cm = (classmethod *)
        TyType_GenericAlloc(&TyClassMethod_Type, 0);
    if (cm != NULL) {
        cm->cm_callable = Ty_NewRef(callable);
    }
    return (TyObject *)cm;
}


/* Static method object */

/* A static method does not receive an implicit first argument.
   To declare a static method, use this idiom:

     class C:
         @staticmethod
         def f(arg1, arg2, argN):
             ...

   It can be called either on the class (e.g. C.f()) or on an instance
   (e.g. C().f()). Both the class and the instance are ignored, and
   neither is passed implicitly as the first argument to the method.

   Static methods in Python are similar to those found in Java or C++.
   For a more advanced concept, see class methods above.
*/

typedef struct {
    PyObject_HEAD
    TyObject *sm_callable;
    TyObject *sm_dict;
} staticmethod;

#define _PyStaticMethod_CAST(cm) \
    (assert(PyObject_TypeCheck((cm), &TyStaticMethod_Type)), \
     _Py_CAST(staticmethod*, cm))

static void
sm_dealloc(TyObject *self)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    _TyObject_GC_UNTRACK((TyObject *)sm);
    Ty_XDECREF(sm->sm_callable);
    Ty_XDECREF(sm->sm_dict);
    Ty_TYPE(sm)->tp_free((TyObject *)sm);
}

static int
sm_traverse(TyObject *self, visitproc visit, void *arg)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    Ty_VISIT(sm->sm_callable);
    Ty_VISIT(sm->sm_dict);
    return 0;
}

static int
sm_clear(TyObject *self)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    Ty_CLEAR(sm->sm_callable);
    Ty_CLEAR(sm->sm_dict);
    return 0;
}

static TyObject *
sm_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    staticmethod *sm = (staticmethod *)self;

    if (sm->sm_callable == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "uninitialized staticmethod object");
        return NULL;
    }
    return Ty_NewRef(sm->sm_callable);
}

static int
sm_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    staticmethod *sm = (staticmethod *)self;
    TyObject *callable;

    if (!_TyArg_NoKeywords("staticmethod", kwds))
        return -1;
    if (!TyArg_UnpackTuple(args, "staticmethod", 1, 1, &callable))
        return -1;
    Ty_XSETREF(sm->sm_callable, Ty_NewRef(callable));

    if (functools_wraps((TyObject *)sm, sm->sm_callable) < 0) {
        return -1;
    }
    return 0;
}

static TyObject*
sm_call(TyObject *callable, TyObject *args, TyObject *kwargs)
{
    staticmethod *sm = (staticmethod *)callable;
    return PyObject_Call(sm->sm_callable, args, kwargs);
}

static TyMemberDef sm_memberlist[] = {
    {"__func__", _Ty_T_OBJECT, offsetof(staticmethod, sm_callable), Py_READONLY},
    {"__wrapped__", _Ty_T_OBJECT, offsetof(staticmethod, sm_callable), Py_READONLY},
    {NULL}  /* Sentinel */
};

static TyObject *
sm_get___isabstractmethod__(TyObject *self, void *closure)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    int res = _TyObject_IsAbstract(sm->sm_callable);
    if (res == -1) {
        return NULL;
    }
    else if (res) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
sm_get___annotations__(TyObject *self, void *closure)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    return descriptor_get_wrapped_attribute(sm->sm_callable, self, &_Ty_ID(__annotations__));
}

static int
sm_set___annotations__(TyObject *self, TyObject *value, void *closure)
{
    return descriptor_set_wrapped_attribute(self, &_Ty_ID(__annotations__), value, "staticmethod");
}

static TyObject *
sm_get___annotate__(TyObject *self, void *closure)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    return descriptor_get_wrapped_attribute(sm->sm_callable, self, &_Ty_ID(__annotate__));
}

static int
sm_set___annotate__(TyObject *self, TyObject *value, void *closure)
{
    return descriptor_set_wrapped_attribute(self, &_Ty_ID(__annotate__), value, "staticmethod");
}

static TyGetSetDef sm_getsetlist[] = {
    {"__isabstractmethod__", sm_get___isabstractmethod__, NULL, NULL, NULL},
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict, NULL, NULL},
    {"__annotations__", sm_get___annotations__, sm_set___annotations__, NULL, NULL},
    {"__annotate__", sm_get___annotate__, sm_set___annotate__, NULL, NULL},
    {NULL} /* Sentinel */
};

static TyMethodDef sm_methodlist[] = {
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, NULL},
    {NULL} /* Sentinel */
};

static TyObject*
sm_repr(TyObject *self)
{
    staticmethod *sm = _PyStaticMethod_CAST(self);
    return TyUnicode_FromFormat("<staticmethod(%R)>", sm->sm_callable);
}

TyDoc_STRVAR(staticmethod_doc,
"staticmethod(function, /)\n\
--\n\
\n\
Convert a function to be a static method.\n\
\n\
A static method does not receive an implicit first argument.\n\
To declare a static method, use this idiom:\n\
\n\
     class C:\n\
         @staticmethod\n\
         def f(arg1, arg2, argN):\n\
             ...\n\
\n\
It can be called either on the class (e.g. C.f()) or on an instance\n\
(e.g. C().f()). Both the class and the instance are ignored, and\n\
neither is passed implicitly as the first argument to the method.\n\
\n\
Static methods in Python are similar to those found in Java or C++.\n\
For a more advanced concept, see the classmethod builtin.");

TyTypeObject TyStaticMethod_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "staticmethod",
    sizeof(staticmethod),
    0,
    sm_dealloc,                                 /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    sm_repr,                                    /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    sm_call,                                    /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    staticmethod_doc,                           /* tp_doc */
    sm_traverse,                                /* tp_traverse */
    sm_clear,                                   /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    sm_methodlist,                              /* tp_methods */
    sm_memberlist,                              /* tp_members */
    sm_getsetlist,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    sm_descr_get,                               /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(staticmethod, sm_dict),            /* tp_dictoffset */
    sm_init,                                    /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    TyType_GenericNew,                          /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
};

TyObject *
TyStaticMethod_New(TyObject *callable)
{
    staticmethod *sm = (staticmethod *)
        TyType_GenericAlloc(&TyStaticMethod_Type, 0);
    if (sm != NULL) {
        sm->sm_callable = Ty_NewRef(callable);
    }
    return (TyObject *)sm;
}
