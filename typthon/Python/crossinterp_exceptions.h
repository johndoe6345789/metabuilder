
static void
_ensure_current_cause(TyThreadState *tstate, TyObject *cause)
{
    if (cause == NULL) {
        return;
    }
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    assert(exc != NULL);
    assert(PyException_GetCause(exc) == NULL);
    PyException_SetCause(exc, Ty_NewRef(cause));
    _TyErr_SetRaisedException(tstate, exc);
}


/* InterpreterError extends Exception */

static TyTypeObject _TyExc_InterpreterError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "concurrent.interpreters.InterpreterError",
    .tp_doc = TyDoc_STR("A cross-interpreter operation failed"),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    //.tp_traverse = ((TyTypeObject *)TyExc_Exception)->tp_traverse,
    //.tp_clear = ((TyTypeObject *)TyExc_Exception)->tp_clear,
    //.tp_base = (TyTypeObject *)TyExc_Exception,
};
TyObject *TyExc_InterpreterError = (TyObject *)&_TyExc_InterpreterError;

/* InterpreterNotFoundError extends InterpreterError */

static TyTypeObject _TyExc_InterpreterNotFoundError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "concurrent.interpreters.InterpreterNotFoundError",
    .tp_doc = TyDoc_STR("An interpreter was not found"),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    //.tp_traverse = ((TyTypeObject *)TyExc_Exception)->tp_traverse,
    //.tp_clear = ((TyTypeObject *)TyExc_Exception)->tp_clear,
    .tp_base = &_TyExc_InterpreterError,
};
TyObject *TyExc_InterpreterNotFoundError = (TyObject *)&_TyExc_InterpreterNotFoundError;

/* NotShareableError extends TypeError */

static int
_init_notshareableerror(exceptions_t *state)
{
    const char *name = "concurrent.interpreters.NotShareableError";
    TyObject *base = TyExc_TypeError;
    TyObject *ns = NULL;
    TyObject *exctype = TyErr_NewException(name, base, ns);
    if (exctype == NULL) {
        return -1;
    }
    state->TyExc_NotShareableError = exctype;
    return 0;
}

static void
_fini_notshareableerror(exceptions_t *state)
{
    Ty_CLEAR(state->TyExc_NotShareableError);
}

static TyObject *
get_notshareableerror_type(TyThreadState *tstate)
{
    _PyXI_state_t *local = _PyXI_GET_STATE(tstate->interp);
    if (local == NULL) {
        TyErr_Clear();
        return NULL;
    }
    return local->exceptions.TyExc_NotShareableError;
}

static void
_ensure_notshareableerror(TyThreadState *tstate,
                          TyObject *cause, int force, TyObject *msgobj)
{
    TyObject *ctx = _TyErr_GetRaisedException(tstate);
    TyObject *exctype = get_notshareableerror_type(tstate);
    if (exctype != NULL) {
        if (!force && ctx != NULL && Ty_TYPE(ctx) == (TyTypeObject *)exctype) {
            // A NotShareableError instance is already set.
            assert(cause == NULL);
            _TyErr_SetRaisedException(tstate, ctx);
        }
    }
    else {
        exctype = TyExc_TypeError;
    }
    _TyErr_SetObject(tstate, exctype, msgobj);
    // We have to set the context manually since _TyErr_SetObject() doesn't.
    _TyErr_ChainExceptions1Tstate(tstate, ctx);
    _ensure_current_cause(tstate, cause);
}

static void
set_notshareableerror(TyThreadState *tstate, TyObject *cause, int force, const char *msg)
{
    TyObject *msgobj = TyUnicode_FromString(msg);
    if (msgobj == NULL) {
        assert(_TyErr_Occurred(tstate));
    }
    else {
        _ensure_notshareableerror(tstate, cause, force, msgobj);
        Ty_DECREF(msgobj);
    }
}

static void
format_notshareableerror_v(TyThreadState *tstate, TyObject *cause, int force,
                           const char *format, va_list vargs)
{
    TyObject *msgobj = TyUnicode_FromFormatV(format, vargs);
    if (msgobj == NULL) {
        assert(_TyErr_Occurred(tstate));
    }
    else {
        _ensure_notshareableerror(tstate, cause, force, msgobj);
        Ty_DECREF(msgobj);
    }
}

static void
format_notshareableerror(TyThreadState *tstate, TyObject *cause, int force,
                         const char *format, ...)
{
    va_list vargs;
    va_start(vargs, format);
    format_notshareableerror_v(tstate, cause, force, format, vargs);
    va_end(vargs);
}


/* lifecycle */

static int
init_static_exctypes(exceptions_t *state, TyInterpreterState *interp)
{
    assert(state == &_PyXI_GET_STATE(interp)->exceptions);
    TyTypeObject *base = (TyTypeObject *)TyExc_Exception;

    // TyExc_InterpreterError
    _TyExc_InterpreterError.tp_base = base;
    _TyExc_InterpreterError.tp_traverse = base->tp_traverse;
    _TyExc_InterpreterError.tp_clear = base->tp_clear;
    if (_PyStaticType_InitBuiltin(interp, &_TyExc_InterpreterError) < 0) {
        goto error;
    }
    state->TyExc_InterpreterError = (TyObject *)&_TyExc_InterpreterError;

    // TyExc_InterpreterNotFoundError
    _TyExc_InterpreterNotFoundError.tp_traverse = base->tp_traverse;
    _TyExc_InterpreterNotFoundError.tp_clear = base->tp_clear;
    if (_PyStaticType_InitBuiltin(interp, &_TyExc_InterpreterNotFoundError) < 0) {
        goto error;
    }
    state->TyExc_InterpreterNotFoundError =
            (TyObject *)&_TyExc_InterpreterNotFoundError;

    return 0;

error:
    fini_static_exctypes(state, interp);
    return -1;
}

static void
fini_static_exctypes(exceptions_t *state, TyInterpreterState *interp)
{
    assert(state == &_PyXI_GET_STATE(interp)->exceptions);
    if (state->TyExc_InterpreterNotFoundError != NULL) {
        state->TyExc_InterpreterNotFoundError = NULL;
        _PyStaticType_FiniBuiltin(interp, &_TyExc_InterpreterNotFoundError);
    }
    if (state->TyExc_InterpreterError != NULL) {
        state->TyExc_InterpreterError = NULL;
        _PyStaticType_FiniBuiltin(interp, &_TyExc_InterpreterError);
    }
}

static int
init_heap_exctypes(exceptions_t *state)
{
    if (_init_notshareableerror(state) < 0) {
        goto error;
    }
    return 0;

error:
    fini_heap_exctypes(state);
    return -1;
}

static void
fini_heap_exctypes(exceptions_t *state)
{
    _fini_notshareableerror(state);
}
