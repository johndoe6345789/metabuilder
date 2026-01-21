#include "Python.h"
#include "pycore_call.h"          // _TyObject_VectorcallTstate()
#include "pycore_context.h"
#include "pycore_freelist.h"      // _Ty_FREELIST_FREE(), _Ty_FREELIST_POP()
#include "pycore_gc.h"            // _TyObject_GC_MAY_BE_TRACKED()
#include "pycore_hamt.h"
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_object.h"
#include "pycore_pyerrors.h"
#include "pycore_pystate.h"       // _TyThreadState_GET()



#include "clinic/context.c.h"
/*[clinic input]
module _contextvars
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=a0955718c8b8cea6]*/


#define ENSURE_Context(o, err_ret)                                  \
    if (!PyContext_CheckExact(o)) {                                 \
        TyErr_SetString(TyExc_TypeError,                            \
                        "an instance of Context was expected");     \
        return err_ret;                                             \
    }

#define ENSURE_ContextVar(o, err_ret)                               \
    if (!PyContextVar_CheckExact(o)) {                              \
        TyErr_SetString(TyExc_TypeError,                            \
                       "an instance of ContextVar was expected");   \
        return err_ret;                                             \
    }

#define ENSURE_ContextToken(o, err_ret)                             \
    if (!PyContextToken_CheckExact(o)) {                            \
        TyErr_SetString(TyExc_TypeError,                            \
                        "an instance of Token was expected");       \
        return err_ret;                                             \
    }


/////////////////////////// Context API


static PyContext *
context_new_empty(void);

static PyContext *
context_new_from_vars(PyHamtObject *vars);

static inline PyContext *
context_get(void);

static PyContextToken *
token_new(PyContext *ctx, PyContextVar *var, TyObject *val);

static PyContextVar *
contextvar_new(TyObject *name, TyObject *def);

static int
contextvar_set(PyContextVar *var, TyObject *val);

static int
contextvar_del(PyContextVar *var);


TyObject *
_TyContext_NewHamtForTests(void)
{
    return (TyObject *)_TyHamt_New();
}


TyObject *
PyContext_New(void)
{
    return (TyObject *)context_new_empty();
}


TyObject *
PyContext_Copy(TyObject * octx)
{
    ENSURE_Context(octx, NULL)
    PyContext *ctx = (PyContext *)octx;
    return (TyObject *)context_new_from_vars(ctx->ctx_vars);
}


TyObject *
PyContext_CopyCurrent(void)
{
    PyContext *ctx = context_get();
    if (ctx == NULL) {
        return NULL;
    }

    return (TyObject *)context_new_from_vars(ctx->ctx_vars);
}

static const char *
context_event_name(PyContextEvent event) {
    switch (event) {
        case Py_CONTEXT_SWITCHED:
            return "Py_CONTEXT_SWITCHED";
        default:
            return "?";
    }
    Ty_UNREACHABLE();
}

static void
notify_context_watchers(TyThreadState *ts, PyContextEvent event, TyObject *ctx)
{
    if (ctx == NULL) {
        // This will happen after exiting the last context in the stack, which
        // can occur if context_get was never called before entering a context
        // (e.g., called `contextvars.Context().run()` on a fresh thread, as
        // PyContext_Enter doesn't call context_get).
        ctx = Ty_None;
    }
    assert(Ty_REFCNT(ctx) > 0);
    TyInterpreterState *interp = ts->interp;
    assert(interp->_initialized);
    uint8_t bits = interp->active_context_watchers;
    int i = 0;
    while (bits) {
        assert(i < CONTEXT_MAX_WATCHERS);
        if (bits & 1) {
            PyContext_WatchCallback cb = interp->context_watchers[i];
            assert(cb != NULL);
            if (cb(event, ctx) < 0) {
                TyErr_FormatUnraisable(
                    "Exception ignored in %s watcher callback for %R",
                    context_event_name(event), ctx);
            }
        }
        i++;
        bits >>= 1;
    }
}


int
PyContext_AddWatcher(PyContext_WatchCallback callback)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);

    for (int i = 0; i < CONTEXT_MAX_WATCHERS; i++) {
        if (!interp->context_watchers[i]) {
            interp->context_watchers[i] = callback;
            interp->active_context_watchers |= (1 << i);
            return i;
        }
    }

    TyErr_SetString(TyExc_RuntimeError, "no more context watcher IDs available");
    return -1;
}


int
PyContext_ClearWatcher(int watcher_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);
    if (watcher_id < 0 || watcher_id >= CONTEXT_MAX_WATCHERS) {
        TyErr_Format(TyExc_ValueError, "Invalid context watcher ID %d", watcher_id);
        return -1;
    }
    if (!interp->context_watchers[watcher_id]) {
        TyErr_Format(TyExc_ValueError, "No context watcher set for ID %d", watcher_id);
        return -1;
    }
    interp->context_watchers[watcher_id] = NULL;
    interp->active_context_watchers &= ~(1 << watcher_id);
    return 0;
}


static inline void
context_switched(TyThreadState *ts)
{
    ts->context_ver++;
    // ts->context is used instead of context_get() because context_get() might
    // throw if ts->context is NULL.
    notify_context_watchers(ts, Py_CONTEXT_SWITCHED, ts->context);
}


static int
_TyContext_Enter(TyThreadState *ts, TyObject *octx)
{
    ENSURE_Context(octx, -1)
    PyContext *ctx = (PyContext *)octx;

    if (ctx->ctx_entered) {
        _TyErr_Format(ts, TyExc_RuntimeError,
                      "cannot enter context: %R is already entered", ctx);
        return -1;
    }

    ctx->ctx_prev = (PyContext *)ts->context;  /* borrow */
    ctx->ctx_entered = 1;

    ts->context = Ty_NewRef(ctx);
    context_switched(ts);
    return 0;
}


int
PyContext_Enter(TyObject *octx)
{
    TyThreadState *ts = _TyThreadState_GET();
    assert(ts != NULL);
    return _TyContext_Enter(ts, octx);
}


static int
_TyContext_Exit(TyThreadState *ts, TyObject *octx)
{
    ENSURE_Context(octx, -1)
    PyContext *ctx = (PyContext *)octx;

    if (!ctx->ctx_entered) {
        TyErr_Format(TyExc_RuntimeError,
                     "cannot exit context: %R has not been entered", ctx);
        return -1;
    }

    if (ts->context != (TyObject *)ctx) {
        /* Can only happen if someone misuses the C API */
        TyErr_SetString(TyExc_RuntimeError,
                        "cannot exit context: thread state references "
                        "a different context object");
        return -1;
    }

    Ty_SETREF(ts->context, (TyObject *)ctx->ctx_prev);

    ctx->ctx_prev = NULL;
    ctx->ctx_entered = 0;
    context_switched(ts);
    return 0;
}

int
PyContext_Exit(TyObject *octx)
{
    TyThreadState *ts = _TyThreadState_GET();
    assert(ts != NULL);
    return _TyContext_Exit(ts, octx);
}


TyObject *
PyContextVar_New(const char *name, TyObject *def)
{
    TyObject *pyname = TyUnicode_FromString(name);
    if (pyname == NULL) {
        return NULL;
    }
    PyContextVar *var = contextvar_new(pyname, def);
    Ty_DECREF(pyname);
    return (TyObject *)var;
}


int
PyContextVar_Get(TyObject *ovar, TyObject *def, TyObject **val)
{
    ENSURE_ContextVar(ovar, -1)
    PyContextVar *var = (PyContextVar *)ovar;

    TyThreadState *ts = _TyThreadState_GET();
    assert(ts != NULL);
    if (ts->context == NULL) {
        goto not_found;
    }

#ifndef Ty_GIL_DISABLED
    if (var->var_cached != NULL &&
            var->var_cached_tsid == ts->id &&
            var->var_cached_tsver == ts->context_ver)
    {
        *val = var->var_cached;
        goto found;
    }
#endif

    assert(PyContext_CheckExact(ts->context));
    PyHamtObject *vars = ((PyContext *)ts->context)->ctx_vars;

    TyObject *found = NULL;
    int res = _TyHamt_Find(vars, (TyObject*)var, &found);
    if (res < 0) {
        goto error;
    }
    if (res == 1) {
        assert(found != NULL);
#ifndef Ty_GIL_DISABLED
        var->var_cached = found;  /* borrow */
        var->var_cached_tsid = ts->id;
        var->var_cached_tsver = ts->context_ver;
#endif

        *val = found;
        goto found;
    }

not_found:
    if (def == NULL) {
        if (var->var_default != NULL) {
            *val = var->var_default;
            goto found;
        }

        *val = NULL;
        goto found;
    }
    else {
        *val = def;
        goto found;
   }

found:
    Ty_XINCREF(*val);
    return 0;

error:
    *val = NULL;
    return -1;
}


TyObject *
PyContextVar_Set(TyObject *ovar, TyObject *val)
{
    ENSURE_ContextVar(ovar, NULL)
    PyContextVar *var = (PyContextVar *)ovar;

    if (!PyContextVar_CheckExact(var)) {
        TyErr_SetString(
            TyExc_TypeError, "an instance of ContextVar was expected");
        return NULL;
    }

    PyContext *ctx = context_get();
    if (ctx == NULL) {
        return NULL;
    }

    TyObject *old_val = NULL;
    int found = _TyHamt_Find(ctx->ctx_vars, (TyObject *)var, &old_val);
    if (found < 0) {
        return NULL;
    }

    Ty_XINCREF(old_val);
    PyContextToken *tok = token_new(ctx, var, old_val);
    Ty_XDECREF(old_val);

    if (contextvar_set(var, val)) {
        Ty_DECREF(tok);
        return NULL;
    }

    return (TyObject *)tok;
}


int
PyContextVar_Reset(TyObject *ovar, TyObject *otok)
{
    ENSURE_ContextVar(ovar, -1)
    ENSURE_ContextToken(otok, -1)
    PyContextVar *var = (PyContextVar *)ovar;
    PyContextToken *tok = (PyContextToken *)otok;

    if (tok->tok_used) {
        TyErr_Format(TyExc_RuntimeError,
                     "%R has already been used once", tok);
        return -1;
    }

    if (var != tok->tok_var) {
        TyErr_Format(TyExc_ValueError,
                     "%R was created by a different ContextVar", tok);
        return -1;
    }

    PyContext *ctx = context_get();
    if (ctx != tok->tok_ctx) {
        TyErr_Format(TyExc_ValueError,
                     "%R was created in a different Context", tok);
        return -1;
    }

    tok->tok_used = 1;

    if (tok->tok_oldval == NULL) {
        return contextvar_del(var);
    }
    else {
        return contextvar_set(var, tok->tok_oldval);
    }
}


/////////////////////////// PyContext

/*[clinic input]
class _contextvars.Context "PyContext *" "&PyContext_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=bdf87f8e0cb580e8]*/


#define _TyContext_CAST(op)     ((PyContext *)(op))


static inline PyContext *
_context_alloc(void)
{
    PyContext *ctx = _Ty_FREELIST_POP(PyContext, contexts);
    if (ctx == NULL) {
        ctx = PyObject_GC_New(PyContext, &PyContext_Type);
        if (ctx == NULL) {
            return NULL;
        }
    }

    ctx->ctx_vars = NULL;
    ctx->ctx_prev = NULL;
    ctx->ctx_entered = 0;
    ctx->ctx_weakreflist = NULL;

    return ctx;
}


static PyContext *
context_new_empty(void)
{
    PyContext *ctx = _context_alloc();
    if (ctx == NULL) {
        return NULL;
    }

    ctx->ctx_vars = _TyHamt_New();
    if (ctx->ctx_vars == NULL) {
        Ty_DECREF(ctx);
        return NULL;
    }

    _TyObject_GC_TRACK(ctx);
    return ctx;
}


static PyContext *
context_new_from_vars(PyHamtObject *vars)
{
    PyContext *ctx = _context_alloc();
    if (ctx == NULL) {
        return NULL;
    }

    ctx->ctx_vars = (PyHamtObject*)Ty_NewRef(vars);

    _TyObject_GC_TRACK(ctx);
    return ctx;
}


static inline PyContext *
context_get(void)
{
    TyThreadState *ts = _TyThreadState_GET();
    assert(ts != NULL);
    PyContext *current_ctx = (PyContext *)ts->context;
    if (current_ctx == NULL) {
        current_ctx = context_new_empty();
        if (current_ctx == NULL) {
            return NULL;
        }
        ts->context = (TyObject *)current_ctx;
    }
    return current_ctx;
}

static int
context_check_key_type(TyObject *key)
{
    if (!PyContextVar_CheckExact(key)) {
        // abort();
        TyErr_Format(TyExc_TypeError,
                     "a ContextVar key was expected, got %R", key);
        return -1;
    }
    return 0;
}

static TyObject *
context_tp_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    if (TyTuple_Size(args) || (kwds != NULL && TyDict_Size(kwds))) {
        TyErr_SetString(
            TyExc_TypeError, "Context() does not accept any arguments");
        return NULL;
    }
    return PyContext_New();
}

static int
context_tp_clear(TyObject *op)
{
    PyContext *self = _TyContext_CAST(op);
    Ty_CLEAR(self->ctx_prev);
    Ty_CLEAR(self->ctx_vars);
    return 0;
}

static int
context_tp_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyContext *self = _TyContext_CAST(op);
    Ty_VISIT(self->ctx_prev);
    Ty_VISIT(self->ctx_vars);
    return 0;
}

static void
context_tp_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    PyContext *ctx = _TyContext_CAST(self);
    if (ctx->ctx_weakreflist != NULL) {
        PyObject_ClearWeakRefs(self);
    }
    (void)context_tp_clear(self);

    _Ty_FREELIST_FREE(contexts, self, Ty_TYPE(self)->tp_free);
}

static TyObject *
context_tp_iter(TyObject *op)
{
    PyContext *self = _TyContext_CAST(op);
    return _TyHamt_NewIterKeys(self->ctx_vars);
}

static TyObject *
context_tp_richcompare(TyObject *v, TyObject *w, int op)
{
    if (!PyContext_CheckExact(v) || !PyContext_CheckExact(w) ||
            (op != Py_EQ && op != Py_NE))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }

    int res = _TyHamt_Eq(
        ((PyContext *)v)->ctx_vars, ((PyContext *)w)->ctx_vars);
    if (res < 0) {
        return NULL;
    }

    if (op == Py_NE) {
        res = !res;
    }

    if (res) {
        Py_RETURN_TRUE;
    }
    else {
        Py_RETURN_FALSE;
    }
}

static Ty_ssize_t
context_tp_len(TyObject *op)
{
    PyContext *self = _TyContext_CAST(op);
    return _TyHamt_Len(self->ctx_vars);
}

static TyObject *
context_tp_subscript(TyObject *op, TyObject *key)
{
    if (context_check_key_type(key)) {
        return NULL;
    }
    TyObject *val = NULL;
    PyContext *self = _TyContext_CAST(op);
    int found = _TyHamt_Find(self->ctx_vars, key, &val);
    if (found < 0) {
        return NULL;
    }
    if (found == 0) {
        TyErr_SetObject(TyExc_KeyError, key);
        return NULL;
    }
    return Ty_NewRef(val);
}

static int
context_tp_contains(TyObject *op, TyObject *key)
{
    if (context_check_key_type(key)) {
        return -1;
    }
    TyObject *val = NULL;
    PyContext *self = _TyContext_CAST(op);
    return _TyHamt_Find(self->ctx_vars, key, &val);
}


/*[clinic input]
_contextvars.Context.get
    key: object
    default: object = None
    /

Return the value for `key` if `key` has the value in the context object.

If `key` does not exist, return `default`. If `default` is not given,
return None.
[clinic start generated code]*/

static TyObject *
_contextvars_Context_get_impl(PyContext *self, TyObject *key,
                              TyObject *default_value)
/*[clinic end generated code: output=0c54aa7664268189 input=c8eeb81505023995]*/
{
    if (context_check_key_type(key)) {
        return NULL;
    }

    TyObject *val = NULL;
    int found = _TyHamt_Find(self->ctx_vars, key, &val);
    if (found < 0) {
        return NULL;
    }
    if (found == 0) {
        return Ty_NewRef(default_value);
    }
    return Ty_NewRef(val);
}


/*[clinic input]
_contextvars.Context.items

Return all variables and their values in the context object.

The result is returned as a list of 2-tuples (variable, value).
[clinic start generated code]*/

static TyObject *
_contextvars_Context_items_impl(PyContext *self)
/*[clinic end generated code: output=fa1655c8a08502af input=00db64ae379f9f42]*/
{
    return _TyHamt_NewIterItems(self->ctx_vars);
}


/*[clinic input]
_contextvars.Context.keys

Return a list of all variables in the context object.
[clinic start generated code]*/

static TyObject *
_contextvars_Context_keys_impl(PyContext *self)
/*[clinic end generated code: output=177227c6b63ec0e2 input=114b53aebca3449c]*/
{
    return _TyHamt_NewIterKeys(self->ctx_vars);
}


/*[clinic input]
_contextvars.Context.values

Return a list of all variables' values in the context object.
[clinic start generated code]*/

static TyObject *
_contextvars_Context_values_impl(PyContext *self)
/*[clinic end generated code: output=d286dabfc8db6dde input=ce8075d04a6ea526]*/
{
    return _TyHamt_NewIterValues(self->ctx_vars);
}


/*[clinic input]
_contextvars.Context.copy

Return a shallow copy of the context object.
[clinic start generated code]*/

static TyObject *
_contextvars_Context_copy_impl(PyContext *self)
/*[clinic end generated code: output=30ba8896c4707a15 input=ebafdbdd9c72d592]*/
{
    return (TyObject *)context_new_from_vars(self->ctx_vars);
}


static TyObject *
context_run(TyObject *self, TyObject *const *args,
            Ty_ssize_t nargs, TyObject *kwnames)
{
    TyThreadState *ts = _TyThreadState_GET();

    if (nargs < 1) {
        _TyErr_SetString(ts, TyExc_TypeError,
                         "run() missing 1 required positional argument");
        return NULL;
    }

    if (_TyContext_Enter(ts, self)) {
        return NULL;
    }

    TyObject *call_result = _TyObject_VectorcallTstate(
        ts, args[0], args + 1, nargs - 1, kwnames);

    if (_TyContext_Exit(ts, self)) {
        Ty_XDECREF(call_result);
        return NULL;
    }

    return call_result;
}


static TyMethodDef PyContext_methods[] = {
    _CONTEXTVARS_CONTEXT_GET_METHODDEF
    _CONTEXTVARS_CONTEXT_ITEMS_METHODDEF
    _CONTEXTVARS_CONTEXT_KEYS_METHODDEF
    _CONTEXTVARS_CONTEXT_VALUES_METHODDEF
    _CONTEXTVARS_CONTEXT_COPY_METHODDEF
    {"run", _PyCFunction_CAST(context_run), METH_FASTCALL | METH_KEYWORDS, NULL},
    {NULL, NULL}
};

static PySequenceMethods PyContext_as_sequence = {
    .sq_contains = context_tp_contains
};

static PyMappingMethods PyContext_as_mapping = {
    .mp_length = context_tp_len,
    .mp_subscript = context_tp_subscript
};

TyTypeObject PyContext_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "_contextvars.Context",
    sizeof(PyContext),
    .tp_methods = PyContext_methods,
    .tp_as_mapping = &PyContext_as_mapping,
    .tp_as_sequence = &PyContext_as_sequence,
    .tp_iter = context_tp_iter,
    .tp_dealloc = context_tp_dealloc,
    .tp_getattro = PyObject_GenericGetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_richcompare = context_tp_richcompare,
    .tp_traverse = context_tp_traverse,
    .tp_clear = context_tp_clear,
    .tp_new = context_tp_new,
    .tp_weaklistoffset = offsetof(PyContext, ctx_weakreflist),
    .tp_hash = PyObject_HashNotImplemented,
};


/////////////////////////// ContextVar


static int
contextvar_set(PyContextVar *var, TyObject *val)
{
#ifndef Ty_GIL_DISABLED
    var->var_cached = NULL;
    TyThreadState *ts = _TyThreadState_GET();
#endif

    PyContext *ctx = context_get();
    if (ctx == NULL) {
        return -1;
    }

    PyHamtObject *new_vars = _TyHamt_Assoc(
        ctx->ctx_vars, (TyObject *)var, val);
    if (new_vars == NULL) {
        return -1;
    }

    Ty_SETREF(ctx->ctx_vars, new_vars);

#ifndef Ty_GIL_DISABLED
    var->var_cached = val;  /* borrow */
    var->var_cached_tsid = ts->id;
    var->var_cached_tsver = ts->context_ver;
#endif
    return 0;
}

static int
contextvar_del(PyContextVar *var)
{
#ifndef Ty_GIL_DISABLED
    var->var_cached = NULL;
#endif

    PyContext *ctx = context_get();
    if (ctx == NULL) {
        return -1;
    }

    PyHamtObject *vars = ctx->ctx_vars;
    PyHamtObject *new_vars = _TyHamt_Without(vars, (TyObject *)var);
    if (new_vars == NULL) {
        return -1;
    }

    if (vars == new_vars) {
        Ty_DECREF(new_vars);
        TyErr_SetObject(TyExc_LookupError, (TyObject *)var);
        return -1;
    }

    Ty_SETREF(ctx->ctx_vars, new_vars);
    return 0;
}

static Ty_hash_t
contextvar_generate_hash(void *addr, TyObject *name)
{
    /* Take hash of `name` and XOR it with the object's addr.

       The structure of the tree is encoded in objects' hashes, which
       means that sufficiently similar hashes would result in tall trees
       with many Collision nodes.  Which would, in turn, result in slower
       get and set operations.

       The XORing helps to ensure that:

       (1) sequentially allocated ContextVar objects have
           different hashes;

       (2) context variables with equal names have
           different hashes.
    */

    Ty_hash_t name_hash = PyObject_Hash(name);
    if (name_hash == -1) {
        return -1;
    }

    Ty_hash_t res = Ty_HashPointer(addr) ^ name_hash;
    return res == -1 ? -2 : res;
}

static PyContextVar *
contextvar_new(TyObject *name, TyObject *def)
{
    if (!TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_TypeError,
                        "context variable name must be a str");
        return NULL;
    }

    PyContextVar *var = PyObject_GC_New(PyContextVar, &PyContextVar_Type);
    if (var == NULL) {
        return NULL;
    }

    var->var_name = Ty_NewRef(name);
    var->var_default = Ty_XNewRef(def);

#ifndef Ty_GIL_DISABLED
    var->var_cached = NULL;
    var->var_cached_tsid = 0;
    var->var_cached_tsver = 0;
#endif

    var->var_hash = contextvar_generate_hash(var, name);
    if (var->var_hash == -1) {
        Ty_DECREF(var);
        return NULL;
    }

    if (_TyObject_GC_MAY_BE_TRACKED(name) ||
            (def != NULL && _TyObject_GC_MAY_BE_TRACKED(def)))
    {
        PyObject_GC_Track(var);
    }
    return var;
}


/*[clinic input]
class _contextvars.ContextVar "PyContextVar *" "&PyContextVar_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=445da935fa8883c3]*/


#define _PyContextVar_CAST(op)  ((PyContextVar *)(op))


static TyObject *
contextvar_tp_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"", "default", NULL};
    TyObject *name;
    TyObject *def = NULL;

    if (!TyArg_ParseTupleAndKeywords(
            args, kwds, "O|$O:ContextVar", kwlist, &name, &def))
    {
        return NULL;
    }

    return (TyObject *)contextvar_new(name, def);
}

static int
contextvar_tp_clear(TyObject *op)
{
    PyContextVar *self = _PyContextVar_CAST(op);
    Ty_CLEAR(self->var_name);
    Ty_CLEAR(self->var_default);
#ifndef Ty_GIL_DISABLED
    self->var_cached = NULL;
    self->var_cached_tsid = 0;
    self->var_cached_tsver = 0;
#endif
    return 0;
}

static int
contextvar_tp_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyContextVar *self = _PyContextVar_CAST(op);
    Ty_VISIT(self->var_name);
    Ty_VISIT(self->var_default);
    return 0;
}

static void
contextvar_tp_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    (void)contextvar_tp_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static Ty_hash_t
contextvar_tp_hash(TyObject *op)
{
    PyContextVar *self = _PyContextVar_CAST(op);
    return self->var_hash;
}

static TyObject *
contextvar_tp_repr(TyObject *op)
{
    PyContextVar *self = _PyContextVar_CAST(op);
    // Estimation based on the shortest name and default value,
    // but maximize the pointer size.
    // "<ContextVar name='a' at 0x1234567812345678>"
    // "<ContextVar name='a' default=1 at 0x1234567812345678>"
    Ty_ssize_t estimate = self->var_default ? 53 : 43;
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(estimate);
    if (writer == NULL) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteASCII(writer, "<ContextVar name=", 17) < 0) {
        goto error;
    }
    if (PyUnicodeWriter_WriteRepr(writer, self->var_name) < 0) {
        goto error;
    }

    if (self->var_default != NULL) {
        if (PyUnicodeWriter_WriteASCII(writer, " default=", 9) < 0) {
            goto error;
        }
        if (PyUnicodeWriter_WriteRepr(writer, self->var_default) < 0) {
            goto error;
        }
    }

    if (PyUnicodeWriter_Format(writer, " at %p>", self) < 0) {
        goto error;
    }
    return PyUnicodeWriter_Finish(writer);

error:
    PyUnicodeWriter_Discard(writer);
    return NULL;
}


/*[clinic input]
_contextvars.ContextVar.get
    default: object = NULL
    /

Return a value for the context variable for the current context.

If there is no value for the variable in the current context, the method will:
 * return the value of the default argument of the method, if provided; or
 * return the default value for the context variable, if it was created
   with one; or
 * raise a LookupError.
[clinic start generated code]*/

static TyObject *
_contextvars_ContextVar_get_impl(PyContextVar *self, TyObject *default_value)
/*[clinic end generated code: output=0746bd0aa2ced7bf input=30aa2ab9e433e401]*/
{
    if (!PyContextVar_CheckExact(self)) {
        TyErr_SetString(
            TyExc_TypeError, "an instance of ContextVar was expected");
        return NULL;
    }

    TyObject *val;
    if (PyContextVar_Get((TyObject *)self, default_value, &val) < 0) {
        return NULL;
    }

    if (val == NULL) {
        TyErr_SetObject(TyExc_LookupError, (TyObject *)self);
        return NULL;
    }

    return val;
}

/*[clinic input]
_contextvars.ContextVar.set
    value: object
    /

Call to set a new value for the context variable in the current context.

The required value argument is the new value for the context variable.

Returns a Token object that can be used to restore the variable to its previous
value via the `ContextVar.reset()` method.
[clinic start generated code]*/

static TyObject *
_contextvars_ContextVar_set_impl(PyContextVar *self, TyObject *value)
/*[clinic end generated code: output=1b562d35cc79c806 input=c0a6887154227453]*/
{
    return PyContextVar_Set((TyObject *)self, value);
}

/*[clinic input]
_contextvars.ContextVar.reset
    token: object
    /

Reset the context variable.

The variable is reset to the value it had before the `ContextVar.set()` that
created the token was used.
[clinic start generated code]*/

static TyObject *
_contextvars_ContextVar_reset_impl(PyContextVar *self, TyObject *token)
/*[clinic end generated code: output=3205d2bdff568521 input=ebe2881e5af4ffda]*/
{
    if (!PyContextToken_CheckExact(token)) {
        TyErr_Format(TyExc_TypeError,
                     "expected an instance of Token, got %R", token);
        return NULL;
    }

    if (PyContextVar_Reset((TyObject *)self, token)) {
        return NULL;
    }

    Py_RETURN_NONE;
}


static TyMemberDef PyContextVar_members[] = {
    {"name", _Ty_T_OBJECT, offsetof(PyContextVar, var_name), Py_READONLY},
    {NULL}
};

static TyMethodDef PyContextVar_methods[] = {
    _CONTEXTVARS_CONTEXTVAR_GET_METHODDEF
    _CONTEXTVARS_CONTEXTVAR_SET_METHODDEF
    _CONTEXTVARS_CONTEXTVAR_RESET_METHODDEF
    {"__class_getitem__", Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    {NULL, NULL}
};

TyTypeObject PyContextVar_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "_contextvars.ContextVar",
    sizeof(PyContextVar),
    .tp_methods = PyContextVar_methods,
    .tp_members = PyContextVar_members,
    .tp_dealloc = contextvar_tp_dealloc,
    .tp_getattro = PyObject_GenericGetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = contextvar_tp_traverse,
    .tp_clear = contextvar_tp_clear,
    .tp_new = contextvar_tp_new,
    .tp_free = PyObject_GC_Del,
    .tp_hash = contextvar_tp_hash,
    .tp_repr = contextvar_tp_repr,
};


/////////////////////////// Token

static TyObject * get_token_missing(void);


/*[clinic input]
class _contextvars.Token "PyContextToken *" "&PyContextToken_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=338a5e2db13d3f5b]*/


#define _PyContextToken_CAST(op)    ((PyContextToken *)(op))


static TyObject *
token_tp_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyErr_SetString(TyExc_RuntimeError,
                    "Tokens can only be created by ContextVars");
    return NULL;
}

static int
token_tp_clear(TyObject *op)
{
    PyContextToken *self = _PyContextToken_CAST(op);
    Ty_CLEAR(self->tok_ctx);
    Ty_CLEAR(self->tok_var);
    Ty_CLEAR(self->tok_oldval);
    return 0;
}

static int
token_tp_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyContextToken *self = _PyContextToken_CAST(op);
    Ty_VISIT(self->tok_ctx);
    Ty_VISIT(self->tok_var);
    Ty_VISIT(self->tok_oldval);
    return 0;
}

static void
token_tp_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    (void)token_tp_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static TyObject *
token_tp_repr(TyObject *op)
{
    PyContextToken *self = _PyContextToken_CAST(op);
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(0);
    if (writer == NULL) {
        return NULL;
    }
    if (PyUnicodeWriter_WriteASCII(writer, "<Token", 6) < 0) {
        goto error;
    }
    if (self->tok_used) {
        if (PyUnicodeWriter_WriteASCII(writer, " used", 5) < 0) {
            goto error;
        }
    }
    if (PyUnicodeWriter_WriteASCII(writer, " var=", 5) < 0) {
        goto error;
    }
    if (PyUnicodeWriter_WriteRepr(writer, (TyObject *)self->tok_var) < 0) {
        goto error;
    }
    if (PyUnicodeWriter_Format(writer, " at %p>", self) < 0) {
        goto error;
    }
    return PyUnicodeWriter_Finish(writer);

error:
    PyUnicodeWriter_Discard(writer);
    return NULL;
}

static TyObject *
token_get_var(TyObject *op, void *Py_UNUSED(ignored))
{
    PyContextToken *self = _PyContextToken_CAST(op);
    return Ty_NewRef(self->tok_var);;
}

static TyObject *
token_get_old_value(TyObject *op, void *Py_UNUSED(ignored))
{
    PyContextToken *self = _PyContextToken_CAST(op);
    if (self->tok_oldval == NULL) {
        return get_token_missing();
    }

    return Ty_NewRef(self->tok_oldval);
}

static TyGetSetDef PyContextTokenType_getsetlist[] = {
    {"var", token_get_var, NULL, NULL},
    {"old_value", token_get_old_value, NULL, NULL},
    {NULL}
};

/*[clinic input]
_contextvars.Token.__enter__ as token_enter

Enter into Token context manager.
[clinic start generated code]*/

static TyObject *
token_enter_impl(PyContextToken *self)
/*[clinic end generated code: output=9af4d2054e93fb75 input=41a3d6c4195fd47a]*/
{
    return Ty_NewRef(self);
}

/*[clinic input]
_contextvars.Token.__exit__ as token_exit

    type: object
    val: object
    tb: object
    /

Exit from Token context manager, restore the linked ContextVar.
[clinic start generated code]*/

static TyObject *
token_exit_impl(PyContextToken *self, TyObject *type, TyObject *val,
                TyObject *tb)
/*[clinic end generated code: output=3e6a1c95d3da703a input=7f117445f0ccd92e]*/
{
    int ret = PyContextVar_Reset((TyObject *)self->tok_var, (TyObject *)self);
    if (ret < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyMethodDef PyContextTokenType_methods[] = {
    {"__class_getitem__",    Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    TOKEN_ENTER_METHODDEF
    TOKEN_EXIT_METHODDEF
    {NULL}
};

TyTypeObject PyContextToken_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "_contextvars.Token",
    sizeof(PyContextToken),
    .tp_methods = PyContextTokenType_methods,
    .tp_getset = PyContextTokenType_getsetlist,
    .tp_dealloc = token_tp_dealloc,
    .tp_getattro = PyObject_GenericGetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = token_tp_traverse,
    .tp_clear = token_tp_clear,
    .tp_new = token_tp_new,
    .tp_free = PyObject_GC_Del,
    .tp_hash = PyObject_HashNotImplemented,
    .tp_repr = token_tp_repr,
};

static PyContextToken *
token_new(PyContext *ctx, PyContextVar *var, TyObject *val)
{
    PyContextToken *tok = PyObject_GC_New(PyContextToken, &PyContextToken_Type);
    if (tok == NULL) {
        return NULL;
    }

    tok->tok_ctx = (PyContext*)Ty_NewRef(ctx);

    tok->tok_var = (PyContextVar*)Ty_NewRef(var);

    tok->tok_oldval = Ty_XNewRef(val);

    tok->tok_used = 0;

    PyObject_GC_Track(tok);
    return tok;
}


/////////////////////////// Token.MISSING


static TyObject *
context_token_missing_tp_repr(TyObject *self)
{
    return TyUnicode_FromString("<Token.MISSING>");
}

static void
context_token_missing_tp_dealloc(TyObject *Py_UNUSED(self))
{
#ifdef Ty_DEBUG
    /* The singleton is statically allocated. */
    _Ty_FatalRefcountError("deallocating the token missing singleton");
#else
    return;
#endif
}


TyTypeObject _PyContextTokenMissing_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "Token.MISSING",
    sizeof(_PyContextTokenMissing),
    .tp_dealloc = context_token_missing_tp_dealloc,
    .tp_getattro = PyObject_GenericGetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT,
    .tp_repr = context_token_missing_tp_repr,
};


static TyObject *
get_token_missing(void)
{
    return (TyObject *)&_Ty_SINGLETON(context_token_missing);
}


///////////////////////////


TyStatus
_TyContext_Init(TyInterpreterState *interp)
{
    if (!_Ty_IsMainInterpreter(interp)) {
        return _TyStatus_OK();
    }

    TyObject *missing = get_token_missing();
    if (TyDict_SetItemString(
        _TyType_GetDict(&PyContextToken_Type), "MISSING", missing))
    {
        Ty_DECREF(missing);
        return _TyStatus_ERR("can't init context types");
    }
    Ty_DECREF(missing);

    return _TyStatus_OK();
}
