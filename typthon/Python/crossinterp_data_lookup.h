#include "pycore_weakref.h"       // _TyWeakref_GET_REF()


typedef struct _dlcontext {
    _PyXIData_lookup_t *global;
    _PyXIData_lookup_t *local;
} dlcontext_t;
typedef _PyXIData_registry_t dlregistry_t;
typedef _PyXIData_regitem_t dlregitem_t;


// forward
static void _xidregistry_init(dlregistry_t *);
static void _xidregistry_fini(dlregistry_t *);
static _PyXIData_getdata_t _lookup_getdata_from_registry(
                                            dlcontext_t *, TyObject *);


/* used in crossinterp.c */

static void
xid_lookup_init(_PyXIData_lookup_t *state)
{
    _xidregistry_init(&state->registry);
}

static void
xid_lookup_fini(_PyXIData_lookup_t *state)
{
    _xidregistry_fini(&state->registry);
}

static int
get_lookup_context(TyThreadState *tstate, dlcontext_t *res)
{
    _PyXI_global_state_t *global = _PyXI_GET_GLOBAL_STATE(tstate->interp);
    if (global == NULL) {
        assert(TyErr_Occurred());
        return -1;
    }
    _PyXI_state_t *local = _PyXI_GET_STATE(tstate->interp);
    if (local == NULL) {
        assert(TyErr_Occurred());
        return -1;
    }
    *res = (dlcontext_t){
        .global = &global->data_lookup,
        .local = &local->data_lookup,
    };
    return 0;
}

static _PyXIData_getdata_t
lookup_getdata(dlcontext_t *ctx, TyObject *obj)
{
   /* Cross-interpreter objects are looked up by exact match on the class.
      We can reassess this policy when we move from a global registry to a
      tp_* slot. */
    return _lookup_getdata_from_registry(ctx, obj);
}


/* exported API */

TyObject *
_PyXIData_GetNotShareableErrorType(TyThreadState *tstate)
{
    TyObject *exctype = get_notshareableerror_type(tstate);
    assert(exctype != NULL);
    return exctype;
}

void
_PyXIData_SetNotShareableError(TyThreadState *tstate, const char *msg)
{
    TyObject *cause = NULL;
    set_notshareableerror(tstate, cause, 1, msg);
}

void
_PyXIData_FormatNotShareableError(TyThreadState *tstate,
                                  const char *format, ...)
{
    TyObject *cause = NULL;
    va_list vargs;
    va_start(vargs, format);
    format_notshareableerror_v(tstate, cause, 1, format, vargs);
    va_end(vargs);
}

int
_PyXI_UnwrapNotShareableError(TyThreadState * tstate, _PyXI_failure *failure)
{
    TyObject *exctype = get_notshareableerror_type(tstate);
    assert(exctype != NULL);
    if (!_TyErr_ExceptionMatches(tstate, exctype)) {
        return -1;
    }
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    if (failure != NULL) {
        _PyXI_errcode code = _PyXI_ERR_NOT_SHAREABLE;
        if (_PyXI_InitFailure(failure, code, exc) < 0) {
            return -1;
        }
    }
    TyObject *cause = PyException_GetCause(exc);
    if (cause != NULL) {
        Ty_DECREF(exc);
        exc = cause;
    }
    else {
        assert(PyException_GetContext(exc) == NULL);
    }
    _TyErr_SetRaisedException(tstate, exc);
    return 0;
}


_PyXIData_getdata_t
_PyXIData_Lookup(TyThreadState *tstate, TyObject *obj)
{
    dlcontext_t ctx;
    if (get_lookup_context(tstate, &ctx) < 0) {
        return (_PyXIData_getdata_t){0};
    }
    return lookup_getdata(&ctx, obj);
}


/***********************************************/
/* a registry of {type -> _PyXIData_getdata_t} */
/***********************************************/

/* For now we use a global registry of shareable classes.
   An alternative would be to add a tp_* slot for a class's
   _PyXIData_getdata_t.  It would be simpler and more efficient. */


/* registry lifecycle */

static void _register_builtins_for_crossinterpreter_data(dlregistry_t *);

static void
_xidregistry_init(dlregistry_t *registry)
{
    if (registry->initialized) {
        return;
    }
    registry->initialized = 1;

    if (registry->global) {
        // Registering the builtins is cheap so we don't bother doing it lazily.
        assert(registry->head == NULL);
        _register_builtins_for_crossinterpreter_data(registry);
    }
}

static void _xidregistry_clear(dlregistry_t *);

static void
_xidregistry_fini(dlregistry_t *registry)
{
    if (!registry->initialized) {
        return;
    }
    registry->initialized = 0;

    _xidregistry_clear(registry);
}


/* registry thread safety */

static void
_xidregistry_lock(dlregistry_t *registry)
{
    if (registry->global) {
        PyMutex_Lock(&registry->mutex);
    }
    // else: Within an interpreter we rely on the GIL instead of a separate lock.
}

static void
_xidregistry_unlock(dlregistry_t *registry)
{
    if (registry->global) {
        PyMutex_Unlock(&registry->mutex);
    }
}


/* accessing the registry */

static inline dlregistry_t *
_get_xidregistry_for_type(dlcontext_t *ctx, TyTypeObject *cls)
{
    if (cls->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        return &ctx->local->registry;
    }
    return &ctx->global->registry;
}

static dlregitem_t* _xidregistry_remove_entry(dlregistry_t *, dlregitem_t *);

static dlregitem_t *
_xidregistry_find_type(dlregistry_t *xidregistry, TyTypeObject *cls)
{
    dlregitem_t *cur = xidregistry->head;
    while (cur != NULL) {
        if (cur->weakref != NULL) {
            // cur is/was a heap type.
            TyObject *registered = _TyWeakref_GET_REF(cur->weakref);
            if (registered == NULL) {
                // The weakly ref'ed object was freed.
                cur = _xidregistry_remove_entry(xidregistry, cur);
                continue;
            }
            assert(TyType_Check(registered));
            assert(cur->cls == (TyTypeObject *)registered);
            assert(cur->cls->tp_flags & Ty_TPFLAGS_HEAPTYPE);
            Ty_DECREF(registered);
        }
        if (cur->cls == cls) {
            return cur;
        }
        cur = cur->next;
    }
    return NULL;
}

static _PyXIData_getdata_t
_lookup_getdata_from_registry(dlcontext_t *ctx, TyObject *obj)
{
    TyTypeObject *cls = Ty_TYPE(obj);

    dlregistry_t *xidregistry = _get_xidregistry_for_type(ctx, cls);
    _xidregistry_lock(xidregistry);

    dlregitem_t *matched = _xidregistry_find_type(xidregistry, cls);
    _PyXIData_getdata_t getdata = matched != NULL
        ? matched->getdata
        : (_PyXIData_getdata_t){0};

    _xidregistry_unlock(xidregistry);
    return getdata;
}


/* updating the registry */

static int
_xidregistry_add_type(dlregistry_t *xidregistry,
                      TyTypeObject *cls, _PyXIData_getdata_t getdata)
{
    dlregitem_t *newhead = TyMem_RawMalloc(sizeof(dlregitem_t));
    if (newhead == NULL) {
        return -1;
    }
    assert((getdata.basic == NULL) != (getdata.fallback == NULL));
    *newhead = (dlregitem_t){
        // We do not keep a reference, to avoid keeping the class alive.
        .cls = cls,
        .refcount = 1,
        .getdata = getdata,
    };
    if (cls->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        // XXX Assign a callback to clear the entry from the registry?
        newhead->weakref = PyWeakref_NewRef((TyObject *)cls, NULL);
        if (newhead->weakref == NULL) {
            TyMem_RawFree(newhead);
            return -1;
        }
    }
    newhead->next = xidregistry->head;
    if (newhead->next != NULL) {
        newhead->next->prev = newhead;
    }
    xidregistry->head = newhead;
    return 0;
}

static dlregitem_t *
_xidregistry_remove_entry(dlregistry_t *xidregistry, dlregitem_t *entry)
{
    dlregitem_t *next = entry->next;
    if (entry->prev != NULL) {
        assert(entry->prev->next == entry);
        entry->prev->next = next;
    }
    else {
        assert(xidregistry->head == entry);
        xidregistry->head = next;
    }
    if (next != NULL) {
        next->prev = entry->prev;
    }
    Ty_XDECREF(entry->weakref);
    TyMem_RawFree(entry);
    return next;
}

static void
_xidregistry_clear(dlregistry_t *xidregistry)
{
    dlregitem_t *cur = xidregistry->head;
    xidregistry->head = NULL;
    while (cur != NULL) {
        dlregitem_t *next = cur->next;
        Ty_XDECREF(cur->weakref);
        TyMem_RawFree(cur);
        cur = next;
    }
}

int
_PyXIData_RegisterClass(TyThreadState *tstate,
                        TyTypeObject *cls, _PyXIData_getdata_t getdata)
{
    if (!TyType_Check(cls)) {
        TyErr_Format(TyExc_ValueError, "only classes may be registered");
        return -1;
    }
    if (getdata.basic == NULL && getdata.fallback == NULL) {
        TyErr_Format(TyExc_ValueError, "missing 'getdata' func");
        return -1;
    }

    int res = 0;
    dlcontext_t ctx;
    if (get_lookup_context(tstate, &ctx) < 0) {
        return -1;
    }
    dlregistry_t *xidregistry = _get_xidregistry_for_type(&ctx, cls);
    _xidregistry_lock(xidregistry);

    dlregitem_t *matched = _xidregistry_find_type(xidregistry, cls);
    if (matched != NULL) {
        assert(matched->getdata.basic == getdata.basic);
        assert(matched->getdata.fallback == getdata.fallback);
        matched->refcount += 1;
        goto finally;
    }

    res = _xidregistry_add_type(xidregistry, cls, getdata);

finally:
    _xidregistry_unlock(xidregistry);
    return res;
}

int
_PyXIData_UnregisterClass(TyThreadState *tstate, TyTypeObject *cls)
{
    int res = 0;
    dlcontext_t ctx;
    if (get_lookup_context(tstate, &ctx) < 0) {
        return -1;
    }
    dlregistry_t *xidregistry = _get_xidregistry_for_type(&ctx, cls);
    _xidregistry_lock(xidregistry);

    dlregitem_t *matched = _xidregistry_find_type(xidregistry, cls);
    if (matched != NULL) {
        assert(matched->refcount > 0);
        matched->refcount -= 1;
        if (matched->refcount == 0) {
            (void)_xidregistry_remove_entry(xidregistry, matched);
        }
        res = 1;
    }

    _xidregistry_unlock(xidregistry);
    return res;
}


/********************************************/
/* cross-interpreter data for builtin types */
/********************************************/

// bytes

int
_TyBytes_GetData(TyObject *obj, _TyBytes_data_t *data)
{
    if (!TyBytes_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected bytes, got %R", obj);
        return -1;
    }
    char *bytes;
    Ty_ssize_t len;
    if (TyBytes_AsStringAndSize(obj, &bytes, &len) < 0) {
        return -1;
    }
    *data = (_TyBytes_data_t){
        .bytes = bytes,
        .len = len,
    };
    return 0;
}

TyObject *
_TyBytes_FromData(_TyBytes_data_t *data)
{
    return TyBytes_FromStringAndSize(data->bytes, data->len);
}

TyObject *
_TyBytes_FromXIData(_PyXIData_t *xidata)
{
    _TyBytes_data_t *data = (_TyBytes_data_t *)xidata->data;
    assert(_PyXIData_OBJ(xidata) != NULL
            && TyBytes_Check(_PyXIData_OBJ(xidata)));
    return _TyBytes_FromData(data);
}

static int
_bytes_shared(TyThreadState *tstate,
              TyObject *obj, size_t size, xid_newobjfunc newfunc,
              _PyXIData_t *xidata)
{
    assert(size >= sizeof(_TyBytes_data_t));
    assert(newfunc != NULL);
    if (_PyXIData_InitWithSize(
                        xidata, tstate->interp, size, obj, newfunc) < 0)
    {
        return -1;
    }
    _TyBytes_data_t *data = (_TyBytes_data_t *)xidata->data;
    if (_TyBytes_GetData(obj, data) < 0) {
        _PyXIData_Clear(tstate->interp, xidata);
        return -1;
    }
    return 0;
}

int
_TyBytes_GetXIData(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    if (!TyBytes_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected bytes, got %R", obj);
        return -1;
    }
    size_t size = sizeof(_TyBytes_data_t);
    return _bytes_shared(tstate, obj, size, _TyBytes_FromXIData, xidata);
}

_TyBytes_data_t *
_TyBytes_GetXIDataWrapped(TyThreadState *tstate,
                          TyObject *obj, size_t size, xid_newobjfunc newfunc,
                          _PyXIData_t *xidata)
{
    if (!TyBytes_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected bytes, got %R", obj);
        return NULL;
    }
    if (size < sizeof(_TyBytes_data_t)) {
        TyErr_Format(TyExc_ValueError, "expected size >= %d, got %d",
                     sizeof(_TyBytes_data_t), size);
        return NULL;
    }
    if (newfunc == NULL) {
        if (size == sizeof(_TyBytes_data_t)) {
            TyErr_SetString(TyExc_ValueError, "missing new_object func");
            return NULL;
        }
        newfunc = _TyBytes_FromXIData;
    }
    if (_bytes_shared(tstate, obj, size, newfunc, xidata) < 0) {
        return NULL;
    }
    return (_TyBytes_data_t *)xidata->data;
}

// str

struct _shared_str_data {
    int kind;
    const void *buffer;
    Ty_ssize_t len;
};

static TyObject *
_new_str_object(_PyXIData_t *xidata)
{
    struct _shared_str_data *shared = (struct _shared_str_data *)(xidata->data);
    return TyUnicode_FromKindAndData(shared->kind, shared->buffer, shared->len);
}

static int
_str_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    if (_PyXIData_InitWithSize(
            xidata, tstate->interp, sizeof(struct _shared_str_data), obj,
            _new_str_object
            ) < 0)
    {
        return -1;
    }
    struct _shared_str_data *shared = (struct _shared_str_data *)xidata->data;
    shared->kind = TyUnicode_KIND(obj);
    shared->buffer = TyUnicode_DATA(obj);
    shared->len = TyUnicode_GET_LENGTH(obj);
    return 0;
}

// int

static TyObject *
_new_long_object(_PyXIData_t *xidata)
{
    return TyLong_FromSsize_t((Ty_ssize_t)(xidata->data));
}

static int
_long_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    /* Note that this means the size of shareable ints is bounded by
     * sys.maxsize.  Hence on 32-bit architectures that is half the
     * size of maximum shareable ints on 64-bit.
     */
    Ty_ssize_t value = TyLong_AsSsize_t(obj);
    if (value == -1 && TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            TyErr_SetString(TyExc_OverflowError, "try sending as bytes");
        }
        return -1;
    }
    _PyXIData_Init(xidata, tstate->interp, (void *)value, NULL, _new_long_object);
    // xidata->obj and xidata->free remain NULL
    return 0;
}

// float

static TyObject *
_new_float_object(_PyXIData_t *xidata)
{
    double * value_ptr = xidata->data;
    return TyFloat_FromDouble(*value_ptr);
}

static int
_float_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    if (_PyXIData_InitWithSize(
            xidata, tstate->interp, sizeof(double), NULL,
            _new_float_object
            ) < 0)
    {
        return -1;
    }
    double *shared = (double *)xidata->data;
    *shared = TyFloat_AsDouble(obj);
    return 0;
}

// None

static TyObject *
_new_none_object(_PyXIData_t *xidata)
{
    // XXX Singleton refcounts are problematic across interpreters...
    return Ty_NewRef(Ty_None);
}

static int
_none_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    _PyXIData_Init(xidata, tstate->interp, NULL, NULL, _new_none_object);
    // xidata->data, xidata->obj and xidata->free remain NULL
    return 0;
}

// bool

static TyObject *
_new_bool_object(_PyXIData_t *xidata)
{
    if (xidata->data){
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static int
_bool_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    _PyXIData_Init(xidata, tstate->interp,
            (void *) (Ty_IsTrue(obj) ? (uintptr_t) 1 : (uintptr_t) 0), NULL,
            _new_bool_object);
    // xidata->obj and xidata->free remain NULL
    return 0;
}

// tuple

struct _shared_tuple_data {
    Ty_ssize_t len;
    _PyXIData_t **items;
};

static TyObject *
_new_tuple_object(_PyXIData_t *xidata)
{
    struct _shared_tuple_data *shared = (struct _shared_tuple_data *)(xidata->data);
    TyObject *tuple = TyTuple_New(shared->len);
    if (tuple == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < shared->len; i++) {
        TyObject *item = _PyXIData_NewObject(shared->items[i]);
        if (item == NULL){
            Ty_DECREF(tuple);
            return NULL;
        }
        TyTuple_SET_ITEM(tuple, i, item);
    }
    return tuple;
}

static void
_tuple_shared_free(void* data)
{
    struct _shared_tuple_data *shared = (struct _shared_tuple_data *)(data);
#ifndef NDEBUG
    int64_t interpid = TyInterpreterState_GetID(_TyInterpreterState_GET());
#endif
    for (Ty_ssize_t i = 0; i < shared->len; i++) {
        if (shared->items[i] != NULL) {
            assert(_PyXIData_INTERPID(shared->items[i]) == interpid);
            _PyXIData_Release(shared->items[i]);
            TyMem_RawFree(shared->items[i]);
            shared->items[i] = NULL;
        }
    }
    TyMem_Free(shared->items);
    TyMem_RawFree(shared);
}

static int
_tuple_shared(TyThreadState *tstate, TyObject *obj, xidata_fallback_t fallback,
              _PyXIData_t *xidata)
{
    Ty_ssize_t len = TyTuple_GET_SIZE(obj);
    if (len < 0) {
        return -1;
    }
    struct _shared_tuple_data *shared = TyMem_RawMalloc(sizeof(struct _shared_tuple_data));
    if (shared == NULL){
        TyErr_NoMemory();
        return -1;
    }

    shared->len = len;
    shared->items = (_PyXIData_t **) TyMem_Calloc(shared->len, sizeof(_PyXIData_t *));
    if (shared->items == NULL) {
        TyErr_NoMemory();
        return -1;
    }

    for (Ty_ssize_t i = 0; i < shared->len; i++) {
        _PyXIData_t *xidata_i = _PyXIData_New();
        if (xidata_i == NULL) {
            goto error;  // TyErr_NoMemory already set
        }
        TyObject *item = TyTuple_GET_ITEM(obj, i);

        int res = -1;
        if (!_Ty_EnterRecursiveCallTstate(tstate, " while sharing a tuple")) {
            res = _TyObject_GetXIData(tstate, item, fallback, xidata_i);
            _Ty_LeaveRecursiveCallTstate(tstate);
        }
        if (res < 0) {
            TyMem_RawFree(xidata_i);
            goto error;
        }
        shared->items[i] = xidata_i;
    }
    _PyXIData_Init(xidata, tstate->interp, shared, obj, _new_tuple_object);
    _PyXIData_SET_FREE(xidata, _tuple_shared_free);
    return 0;

error:
    _tuple_shared_free(shared);
    return -1;
}

// code

TyObject *
_TyCode_FromXIData(_PyXIData_t *xidata)
{
    return _TyMarshal_ReadObjectFromXIData(xidata);
}

int
_TyCode_GetXIData(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    if (!TyCode_Check(obj)) {
        _PyXIData_FormatNotShareableError(tstate, "expected code, got %R", obj);
        return -1;
    }
    if (_TyMarshal_GetXIData(tstate, obj, xidata) < 0) {
        return -1;
    }
    assert(_PyXIData_CHECK_NEW_OBJECT(xidata, _TyMarshal_ReadObjectFromXIData));
    _PyXIData_SET_NEW_OBJECT(xidata, _TyCode_FromXIData);
    return 0;
}

// function

TyObject *
_TyFunction_FromXIData(_PyXIData_t *xidata)
{
    // For now "stateless" functions are the only ones we must accommodate.

    TyObject *code = _TyMarshal_ReadObjectFromXIData(xidata);
    if (code == NULL) {
        return NULL;
    }
    // Create a new function.
    // For stateless functions (no globals) we use __main__ as __globals__,
    // just like we do for builtins like exec().
    assert(TyCode_Check(code));
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *globals = _TyEval_GetGlobalsFromRunningMain(tstate);  // borrowed
    if (globals == NULL) {
        if (_TyErr_Occurred(tstate)) {
            Ty_DECREF(code);
            return NULL;
        }
        globals = TyDict_New();
        if (globals == NULL) {
            Ty_DECREF(code);
            return NULL;
        }
    }
    else {
        Ty_INCREF(globals);
    }
    if (_TyEval_EnsureBuiltins(tstate, globals, NULL) < 0) {
        Ty_DECREF(code);
        Ty_DECREF(globals);
        return NULL;
    }
    TyObject *func = TyFunction_New(code, globals);
    Ty_DECREF(code);
    Ty_DECREF(globals);
    return func;
}

int
_TyFunction_GetXIData(TyThreadState *tstate, TyObject *func,
                      _PyXIData_t *xidata)
{
    if (!TyFunction_Check(func)) {
        const char *msg = "expected a function, got %R";
        format_notshareableerror(tstate, NULL, 0, msg, func);
        return -1;
    }
    if (_TyFunction_VerifyStateless(tstate, func) < 0) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        const char *msg = "only stateless functions are shareable";
        set_notshareableerror(tstate, cause, 0, msg);
        Ty_DECREF(cause);
        return -1;
    }
    TyObject *code = TyFunction_GET_CODE(func);

    // Ideally code objects would be immortal and directly shareable.
    // In the meantime, we use marshal.
    if (_TyMarshal_GetXIData(tstate, code, xidata) < 0) {
        return -1;
    }
    // Replace _TyMarshal_ReadObjectFromXIData.
    // (_TyFunction_FromXIData() will call it.)
    _PyXIData_SET_NEW_OBJECT(xidata, _TyFunction_FromXIData);
    return 0;
}


// registration

static void
_register_builtins_for_crossinterpreter_data(dlregistry_t *xidregistry)
{
#define REGISTER(TYPE, GETDATA) \
    _xidregistry_add_type(xidregistry, (TyTypeObject *)TYPE, \
                          ((_PyXIData_getdata_t){.basic=(GETDATA)}))
#define REGISTER_FALLBACK(TYPE, GETDATA) \
    _xidregistry_add_type(xidregistry, (TyTypeObject *)TYPE, \
                          ((_PyXIData_getdata_t){.fallback=(GETDATA)}))
    // None
    if (REGISTER(Ty_TYPE(Ty_None), _none_shared) != 0) {
        Ty_FatalError("could not register None for cross-interpreter sharing");
    }

    // int
    if (REGISTER(&TyLong_Type, _long_shared) != 0) {
        Ty_FatalError("could not register int for cross-interpreter sharing");
    }

    // bytes
    if (REGISTER(&TyBytes_Type, _TyBytes_GetXIData) != 0) {
        Ty_FatalError("could not register bytes for cross-interpreter sharing");
    }

    // str
    if (REGISTER(&TyUnicode_Type, _str_shared) != 0) {
        Ty_FatalError("could not register str for cross-interpreter sharing");
    }

    // bool
    if (REGISTER(&TyBool_Type, _bool_shared) != 0) {
        Ty_FatalError("could not register bool for cross-interpreter sharing");
    }

    // float
    if (REGISTER(&TyFloat_Type, _float_shared) != 0) {
        Ty_FatalError("could not register float for cross-interpreter sharing");
    }

    // tuple
    if (REGISTER_FALLBACK(&TyTuple_Type, _tuple_shared) != 0) {
        Ty_FatalError("could not register tuple for cross-interpreter sharing");
    }

    // For now, we do not register TyCode_Type or TyFunction_Type.
#undef REGISTER
#undef REGISTER_FALLBACK
}
