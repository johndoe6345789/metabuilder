/* interpreters module */
/* low-level access to interpreter primitives */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_code.h"          // _TyCode_HAS_EXECUTORS()
#include "pycore_crossinterp.h"   // _PyXIData_t
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_interp.h"        // _TyInterpreterState_IDIncref()
#include "pycore_modsupport.h"    // _TyArg_BadArgument()
#include "pycore_namespace.h"     // _PyNamespace_New()
#include "pycore_pybuffer.h"      // _PyBuffer_ReleaseInInterpreterAndRawFree()
#include "pycore_pylifecycle.h"   // _PyInterpreterConfig_AsDict()
#include "pycore_pystate.h"       // _TyInterpreterState_IsRunningMain()

#include "marshal.h"              // TyMarshal_ReadObjectFromString()

#include "_interpreters_common.h"


#define MODULE_NAME _interpreters
#define MODULE_NAME_STR Ty_STRINGIFY(MODULE_NAME)
#define MODINIT_FUNC_NAME RESOLVE_MODINIT_FUNC_NAME(MODULE_NAME)


static TyInterpreterState *
_get_current_interp(void)
{
    // TyInterpreterState_Get() aborts if lookup fails, so don't need
    // to check the result for NULL.
    return TyInterpreterState_Get();
}

#define look_up_interp _TyInterpreterState_LookUpIDObject


static TyObject *
_get_current_module(void)
{
    TyObject *name = TyUnicode_FromString(MODULE_NAME_STR);
    if (name == NULL) {
        return NULL;
    }
    TyObject *mod = TyImport_GetModule(name);
    Ty_DECREF(name);
    if (mod == NULL) {
        return NULL;
    }
    assert(mod != Ty_None);
    return mod;
}


static int
is_running_main(TyInterpreterState *interp)
{
    if (_TyInterpreterState_IsRunningMain(interp)) {
        return 1;
    }
    // Unlike with the general C-API, we can be confident that someone
    // using this module for the main interpreter is doing so through
    // the main program.  Thus we can make this extra check.  This benefits
    // applications that embed Python but haven't been updated yet
    // to call _TyInterpreterState_SetRunningMain().
    if (_Ty_IsMainInterpreter(interp)) {
        return 1;
    }
    return 0;
}


static inline int
is_notshareable_raised(TyThreadState *tstate)
{
    TyObject *exctype = _PyXIData_GetNotShareableErrorType(tstate);
    return _TyErr_ExceptionMatches(tstate, exctype);
}

static void
unwrap_not_shareable(TyThreadState *tstate, _PyXI_failure *failure)
{
    if (_PyXI_UnwrapNotShareableError(tstate, failure) < 0) {
        _TyErr_Clear(tstate);
    }
}


/* Cross-interpreter Buffer Views *******************************************/

/* When a memoryview object is "shared" between interpreters,
 * its underlying "buffer" memory is actually shared, rather than just
 * copied.  This facilitates efficient use of that data where otherwise
 * interpreters are strictly isolated.  However, this also means that
 * the underlying data is subject to the complexities of thread-safety,
 * which the user must manage carefully.
 *
 * When the memoryview is "shared", it is essentially copied in the same
 * way as PyMemory_FromObject() does, but in another interpreter.
 * The Ty_buffer value is copied like normal, including the "buf" pointer,
 * with one key exception.
 *
 * When a Ty_buffer is released and it holds a reference to an object,
 * that object gets a chance to call its bf_releasebuffer() (if any)
 * before the object is decref'ed.  The same is true with the memoryview
 * tp_dealloc, which essentially calls PyBuffer_Release().
 *
 * The problem for a Ty_buffer shared between two interpreters is that
 * the naive approach breaks interpreter isolation.  Operations on an
 * object must only happen while that object's interpreter is active.
 * If the copied mv->view.obj pointed to the original memoryview then
 * the PyBuffer_Release() would happen under the wrong interpreter.
 *
 * To work around this, we set mv->view.obj on the copied memoryview
 * to a wrapper object with the only job of releasing the original
 * buffer in a cross-interpreter-safe way.
 */

// XXX Note that there is still an issue to sort out, where the original
// interpreter is destroyed but code in another interpreter is still
// using dependent buffers.  Using such buffers segfaults.  This will
// require a careful fix.  In the meantime, users will have to be
// diligent about avoiding the problematic situation.

typedef struct {
    TyObject base;
    Ty_buffer *view;
    int64_t interpid;
} xibufferview;

static TyObject *
xibufferview_from_buffer(TyTypeObject *cls, Ty_buffer *view, int64_t interpid)
{
    assert(interpid >= 0);

    Ty_buffer *copied = TyMem_RawMalloc(sizeof(Ty_buffer));
    if (copied == NULL) {
        return NULL;
    }
    /* This steals the view->obj reference  */
    *copied = *view;

    xibufferview *self = PyObject_Malloc(sizeof(xibufferview));
    if (self == NULL) {
        TyMem_RawFree(copied);
        return NULL;
    }
    PyObject_Init(&self->base, cls);
    *self = (xibufferview){
        .base = self->base,
        .view = copied,
        .interpid = interpid,
    };
    return (TyObject *)self;
}

static void
xibufferview_dealloc(TyObject *op)
{
    xibufferview *self = (xibufferview *)op;
    if (self->view != NULL) {
        TyInterpreterState *interp =
                        _TyInterpreterState_LookUpID(self->interpid);
        if (interp == NULL) {
            /* The interpreter is no longer alive. */
            TyErr_Clear();
            TyMem_RawFree(self->view);
        }
        else {
            if (_PyBuffer_ReleaseInInterpreterAndRawFree(interp,
                                                         self->view) < 0)
            {
                // XXX Emit a warning?
                TyErr_Clear();
            }
        }
    }

    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free(self);
    /* "Instances of heap-allocated types hold a reference to their type."
     * See: https://docs.python.org/3.11/howto/isolating-extensions.html#garbage-collection-protocol
     * See: https://docs.python.org/3.11/c-api/typeobj.html#c.TyTypeObject.tp_traverse
    */
    // XXX Why don't we implement Ty_TPFLAGS_HAVE_GC, e.g. Ty_tp_traverse,
    // like we do for _abc._abc_data?
    Ty_DECREF(tp);
}

static int
xibufferview_getbuf(TyObject *op, Ty_buffer *view, int flags)
{
    /* Only TyMemoryView_FromObject() should ever call this,
       via _memoryview_from_xid() below. */
    xibufferview *self = (xibufferview *)op;
    *view = *self->view;
    /* This is the workaround mentioned earlier. */
    view->obj = op;
    // XXX Should we leave it alone?
    view->internal = NULL;
    return 0;
}

static TyType_Slot XIBufferViewType_slots[] = {
    {Ty_tp_dealloc, xibufferview_dealloc},
    {Ty_bf_getbuffer, xibufferview_getbuf},
    // We don't bother with Ty_bf_releasebuffer since we don't need it.
    {0, NULL},
};

static TyType_Spec XIBufferViewType_spec = {
    .name = MODULE_NAME_STR ".CrossInterpreterBufferView",
    .basicsize = sizeof(xibufferview),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = XIBufferViewType_slots,
};


static TyTypeObject * _get_current_xibufferview_type(void);


struct xibuffer {
    Ty_buffer view;
    int used;
};

static TyObject *
_memoryview_from_xid(_PyXIData_t *data)
{
    assert(_PyXIData_DATA(data) != NULL);
    assert(_PyXIData_OBJ(data) == NULL);
    assert(_PyXIData_INTERPID(data) >= 0);
    struct xibuffer *view = (struct xibuffer *)_PyXIData_DATA(data);
    assert(!view->used);

    TyTypeObject *cls = _get_current_xibufferview_type();
    if (cls == NULL) {
        return NULL;
    }

    TyObject *obj = xibufferview_from_buffer(
                        cls, &view->view, _PyXIData_INTERPID(data));
    if (obj == NULL) {
        return NULL;
    }
    TyObject *res = TyMemoryView_FromObject(obj);
    if (res == NULL) {
        Ty_DECREF(obj);
        return NULL;
    }
    view->used = 1;
    return res;
}

static void
_pybuffer_shared_free(void* data)
{
    struct xibuffer *view = (struct xibuffer *)data;
    if (!view->used) {
        PyBuffer_Release(&view->view);
    }
    TyMem_RawFree(data);
}

static int
_pybuffer_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *data)
{
    struct xibuffer *view = TyMem_RawMalloc(sizeof(struct xibuffer));
    if (view == NULL) {
        return -1;
    }
    view->used = 0;
    /* This will increment the memoryview's export count, which won't get
     * decremented until the view sent to other interpreters is released. */
    if (PyObject_GetBuffer(obj, &view->view, PyBUF_FULL_RO) < 0) {
        TyMem_RawFree(view);
        return -1;
    }
    /* The view holds a reference to the object, so we don't worry
     * about also tracking it on the cross-interpreter data. */
    _PyXIData_Init(data, tstate->interp, view, NULL, _memoryview_from_xid);
    data->free = _pybuffer_shared_free;
    return 0;
}

static int
register_memoryview_xid(TyObject *mod, TyTypeObject **p_state)
{
    // XIBufferView
    assert(*p_state == NULL);
    TyTypeObject *cls = (TyTypeObject *)TyType_FromModuleAndSpec(
                mod, &XIBufferViewType_spec, NULL);
    if (cls == NULL) {
        return -1;
    }
    if (TyModule_AddType(mod, cls) < 0) {
        Ty_DECREF(cls);
        return -1;
    }
    *p_state = cls;

    // Register XID for the builtin memoryview type.
    if (ensure_xid_class(&TyMemoryView_Type, GETDATA(_pybuffer_shared)) < 0) {
        return -1;
    }
    // We don't ever bother un-registering memoryview.

    return 0;
}



/* module state *************************************************************/

typedef struct {
    int _notused;

    /* heap types */
    TyTypeObject *XIBufferViewType;
} module_state;

static inline module_state *
get_module_state(TyObject *mod)
{
    assert(mod != NULL);
    module_state *state = TyModule_GetState(mod);
    assert(state != NULL);
    return state;
}

static module_state *
_get_current_module_state(void)
{
    TyObject *mod = _get_current_module();
    if (mod == NULL) {
        mod = TyImport_ImportModule(MODULE_NAME_STR);
        if (mod == NULL) {
            return NULL;
        }
    }
    module_state *state = get_module_state(mod);
    Ty_DECREF(mod);
    return state;
}

static int
traverse_module_state(module_state *state, visitproc visit, void *arg)
{
    /* heap types */
    Ty_VISIT(state->XIBufferViewType);

    return 0;
}

static int
clear_module_state(module_state *state)
{
    /* heap types */
    Ty_CLEAR(state->XIBufferViewType);

    return 0;
}


static TyTypeObject *
_get_current_xibufferview_type(void)
{
    module_state *state = _get_current_module_state();
    if (state == NULL) {
        return NULL;
    }
    return state->XIBufferViewType;
}


/* interpreter-specific code ************************************************/

static int
init_named_config(PyInterpreterConfig *config, const char *name)
{
    if (name == NULL
            || strcmp(name, "") == 0
            || strcmp(name, "default") == 0)
    {
        name = "isolated";
    }

    if (strcmp(name, "isolated") == 0) {
        *config = (PyInterpreterConfig)_PyInterpreterConfig_INIT;
    }
    else if (strcmp(name, "legacy") == 0) {
        *config = (PyInterpreterConfig)_PyInterpreterConfig_LEGACY_INIT;
    }
    else if (strcmp(name, "empty") == 0) {
        *config = (PyInterpreterConfig){0};
    }
    else {
        TyErr_Format(TyExc_ValueError,
                     "unsupported config name '%s'", name);
        return -1;
    }
    return 0;
}

static int
config_from_object(TyObject *configobj, PyInterpreterConfig *config)
{
    if (configobj == NULL || configobj == Ty_None) {
        if (init_named_config(config, NULL) < 0) {
            return -1;
        }
    }
    else if (TyUnicode_Check(configobj)) {
        const char *utf8name = TyUnicode_AsUTF8(configobj);
        if (utf8name == NULL) {
            return -1;
        }
        if (init_named_config(config, utf8name) < 0) {
            return -1;
        }
    }
    else {
        TyObject *dict = PyObject_GetAttrString(configobj, "__dict__");
        if (dict == NULL) {
            TyErr_Format(TyExc_TypeError, "bad config %R", configobj);
            return -1;
        }
        int res = _PyInterpreterConfig_InitFromDict(config, dict);
        Ty_DECREF(dict);
        if (res < 0) {
            return -1;
        }
    }
    return 0;
}


struct interp_call {
    _PyXIData_t *func;
    _PyXIData_t *args;
    _PyXIData_t *kwargs;
    struct {
        _PyXIData_t func;
        _PyXIData_t args;
        _PyXIData_t kwargs;
    } _preallocated;
};

static void
_interp_call_clear(struct interp_call *call)
{
    if (call->func != NULL) {
        _PyXIData_Clear(NULL, call->func);
    }
    if (call->args != NULL) {
        _PyXIData_Clear(NULL, call->args);
    }
    if (call->kwargs != NULL) {
        _PyXIData_Clear(NULL, call->kwargs);
    }
    *call = (struct interp_call){0};
}

static int
_interp_call_pack(TyThreadState *tstate, struct interp_call *call,
                  TyObject *func, TyObject *args, TyObject *kwargs)
{
    xidata_fallback_t fallback = _PyXIDATA_FULL_FALLBACK;
    assert(call->func == NULL);
    assert(call->args == NULL);
    assert(call->kwargs == NULL);
    // Handle the func.
    if (!PyCallable_Check(func)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "expected a callable, got %R", func);
        return -1;
    }
    if (_TyFunction_GetXIData(tstate, func, &call->_preallocated.func) < 0) {
        TyObject *exc = _TyErr_GetRaisedException(tstate);
        if (_PyPickle_GetXIData(tstate, func, &call->_preallocated.func) < 0) {
            _TyErr_SetRaisedException(tstate, exc);
            return -1;
        }
        Ty_DECREF(exc);
    }
    call->func = &call->_preallocated.func;
    // Handle the args.
    if (args == NULL || args == Ty_None) {
        // Leave it empty.
    }
    else {
        assert(TyTuple_Check(args));
        if (TyTuple_GET_SIZE(args) > 0) {
            if (_TyObject_GetXIData(
                    tstate, args, fallback, &call->_preallocated.args) < 0)
            {
                _interp_call_clear(call);
                return -1;
            }
            call->args = &call->_preallocated.args;
        }
    }
    // Handle the kwargs.
    if (kwargs == NULL || kwargs == Ty_None) {
        // Leave it empty.
    }
    else {
        assert(TyDict_Check(kwargs));
        if (TyDict_GET_SIZE(kwargs) > 0) {
            if (_TyObject_GetXIData(
                    tstate, kwargs, fallback, &call->_preallocated.kwargs) < 0)
            {
                _interp_call_clear(call);
                return -1;
            }
            call->kwargs = &call->_preallocated.kwargs;
        }
    }
    return 0;
}

static void
wrap_notshareable(TyThreadState *tstate, const char *label)
{
    if (!is_notshareable_raised(tstate)) {
        return;
    }
    assert(label != NULL && strlen(label) > 0);
    TyObject *cause = _TyErr_GetRaisedException(tstate);
    _PyXIData_FormatNotShareableError(tstate, "%s not shareable", label);
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    PyException_SetCause(exc, cause);
    _TyErr_SetRaisedException(tstate, exc);
}

static int
_interp_call_unpack(struct interp_call *call,
                    TyObject **p_func, TyObject **p_args, TyObject **p_kwargs)
{
    TyThreadState *tstate = TyThreadState_Get();

    // Unpack the func.
    TyObject *func = _PyXIData_NewObject(call->func);
    if (func == NULL) {
        wrap_notshareable(tstate, "func");
        return -1;
    }
    // Unpack the args.
    TyObject *args;
    if (call->args == NULL) {
        args = TyTuple_New(0);
        if (args == NULL) {
            Ty_DECREF(func);
            return -1;
        }
    }
    else {
        args = _PyXIData_NewObject(call->args);
        if (args == NULL) {
            wrap_notshareable(tstate, "args");
            Ty_DECREF(func);
            return -1;
        }
        assert(TyTuple_Check(args));
    }
    // Unpack the kwargs.
    TyObject *kwargs = NULL;
    if (call->kwargs != NULL) {
        kwargs = _PyXIData_NewObject(call->kwargs);
        if (kwargs == NULL) {
            wrap_notshareable(tstate, "kwargs");
            Ty_DECREF(func);
            Ty_DECREF(args);
            return -1;
        }
        assert(TyDict_Check(kwargs));
    }
    *p_func = func;
    *p_args = args;
    *p_kwargs = kwargs;
    return 0;
}

static int
_make_call(struct interp_call *call,
           TyObject **p_result, _PyXI_failure *failure)
{
    assert(call != NULL && call->func != NULL);
    TyThreadState *tstate = _TyThreadState_GET();

    // Get the func and args.
    TyObject *func = NULL, *args = NULL, *kwargs = NULL;
    if (_interp_call_unpack(call, &func, &args, &kwargs) < 0) {
        assert(func == NULL);
        assert(args == NULL);
        assert(kwargs == NULL);
        _PyXI_InitFailure(failure, _PyXI_ERR_OTHER, NULL);
        unwrap_not_shareable(tstate, failure);
        return -1;
    }
    assert(!_TyErr_Occurred(tstate));

    // Make the call.
    TyObject *resobj = PyObject_Call(func, args, kwargs);
    Ty_DECREF(func);
    Ty_XDECREF(args);
    Ty_XDECREF(kwargs);
    if (resobj == NULL) {
        return -1;
    }
    *p_result = resobj;
    return 0;
}

static int
_run_script(_PyXIData_t *script, TyObject *ns, _PyXI_failure *failure)
{
    TyObject *code = _PyXIData_NewObject(script);
    if (code == NULL) {
        _PyXI_InitFailure(failure, _PyXI_ERR_NOT_SHAREABLE, NULL);
        return -1;
    }
    TyObject *result = TyEval_EvalCode(code, ns, ns);
    Ty_DECREF(code);
    if (result == NULL) {
        _PyXI_InitFailure(failure, _PyXI_ERR_UNCAUGHT_EXCEPTION, NULL);
        return -1;
    }
    assert(result == Ty_None);
    Ty_DECREF(result);  // We throw away the result.
    return 0;
}

struct run_result {
    TyObject *result;
    TyObject *excinfo;
};

static void
_run_result_clear(struct run_result *runres)
{
    Ty_CLEAR(runres->result);
    Ty_CLEAR(runres->excinfo);
}

static int
_run_in_interpreter(TyThreadState *tstate, TyInterpreterState *interp,
                     _PyXIData_t *script, struct interp_call *call,
                     TyObject *shareables, struct run_result *runres)
{
    assert(!_TyErr_Occurred(tstate));
    int res = -1;
    _PyXI_failure *failure = _PyXI_NewFailure();
    if (failure == NULL) {
        return -1;
    }
    _PyXI_session *session = _PyXI_NewSession();
    if (session == NULL) {
        _PyXI_FreeFailure(failure);
        return -1;
    }
    _PyXI_session_result result = {0};

    // Prep and switch interpreters.
    if (_PyXI_Enter(session, interp, shareables, &result) < 0) {
        // If an error occurred at this step, it means that interp
        // was not prepared and switched.
        _PyXI_FreeSession(session);
        _PyXI_FreeFailure(failure);
        assert(result.excinfo == NULL);
        return -1;
    }

    // Run in the interpreter.
    if (script != NULL) {
        assert(call == NULL);
        TyObject *mainns = _PyXI_GetMainNamespace(session, failure);
        if (mainns == NULL) {
            goto finally;
        }
        res = _run_script(script, mainns, failure);
    }
    else {
        assert(call != NULL);
        TyObject *resobj;
        res = _make_call(call, &resobj, failure);
        if (res == 0) {
            res = _PyXI_Preserve(session, "resobj", resobj, failure);
            Ty_DECREF(resobj);
            if (res < 0) {
                goto finally;
            }
        }
    }

finally:
    // Clean up and switch back.
    (void)res;
    int exitres = _PyXI_Exit(session, failure, &result);
    assert(res == 0 || exitres != 0);
    _PyXI_FreeSession(session);
    _PyXI_FreeFailure(failure);

    res = exitres;
    if (_TyErr_Occurred(tstate)) {
        // It's a directly propagated exception.
        assert(res < 0);
    }
    else if (res < 0) {
        assert(result.excinfo != NULL);
        runres->excinfo = Ty_NewRef(result.excinfo);
        res = -1;
    }
    else {
        assert(result.excinfo == NULL);
        runres->result = _PyXI_GetPreserved(&result, "resobj");
        if (_TyErr_Occurred(tstate)) {
            res = -1;
        }
    }
    _PyXI_ClearResult(&result);
    return res;
}


/* module level code ********************************************************/

static long
get_whence(TyInterpreterState *interp)
{
    return _TyInterpreterState_GetWhence(interp);
}


static TyInterpreterState *
resolve_interp(TyObject *idobj, int restricted, int reqready, const char *op)
{
    TyInterpreterState *interp;
    if (idobj == NULL) {
        interp = TyInterpreterState_Get();
    }
    else {
        interp = look_up_interp(idobj);
        if (interp == NULL) {
            return NULL;
        }
    }

    if (reqready && !_TyInterpreterState_IsReady(interp)) {
        if (idobj == NULL) {
            TyErr_Format(TyExc_InterpreterError,
                         "cannot %s current interpreter (not ready)", op);
        }
        else {
            TyErr_Format(TyExc_InterpreterError,
                         "cannot %s interpreter %R (not ready)", op, idobj);
        }
        return NULL;
    }

    if (restricted && get_whence(interp) != _TyInterpreterState_WHENCE_STDLIB) {
        if (idobj == NULL) {
            TyErr_Format(TyExc_InterpreterError,
                         "cannot %s unrecognized current interpreter", op);
        }
        else {
            TyErr_Format(TyExc_InterpreterError,
                         "cannot %s unrecognized interpreter %R", op, idobj);
        }
        return NULL;
    }

    return interp;
}


static TyObject *
get_summary(TyInterpreterState *interp)
{
    TyObject *idobj = _TyInterpreterState_GetIDObject(interp);
    if (idobj == NULL) {
        return NULL;
    }
    TyObject *whenceobj = TyLong_FromLong(
                            get_whence(interp));
    if (whenceobj == NULL) {
        Ty_DECREF(idobj);
        return NULL;
    }
    TyObject *res = TyTuple_Pack(2, idobj, whenceobj);
    Ty_DECREF(idobj);
    Ty_DECREF(whenceobj);
    return res;
}


static TyObject *
interp_new_config(TyObject *self, TyObject *args, TyObject *kwds)
{
    const char *name = NULL;
    if (!TyArg_ParseTuple(args, "|s:" MODULE_NAME_STR ".new_config",
                          &name))
    {
        return NULL;
    }
    TyObject *overrides = kwds;

    PyInterpreterConfig config;
    if (init_named_config(&config, name) < 0) {
        return NULL;
    }

    if (overrides != NULL && TyDict_GET_SIZE(overrides) > 0) {
        if (_PyInterpreterConfig_UpdateFromDict(&config, overrides) < 0) {
            return NULL;
        }
    }

    TyObject *dict = _PyInterpreterConfig_AsDict(&config);
    if (dict == NULL) {
        return NULL;
    }

    TyObject *configobj = _PyNamespace_New(dict);
    Ty_DECREF(dict);
    return configobj;
}

TyDoc_STRVAR(new_config_doc,
"new_config(name='isolated', /, **overrides) -> type.SimpleNamespace\n\
\n\
Return a representation of a new PyInterpreterConfig.\n\
\n\
The name determines the initial values of the config.  Supported named\n\
configs are: default, isolated, legacy, and empty.\n\
\n\
Any keyword arguments are set on the corresponding config fields,\n\
overriding the initial values.");


static TyObject *
interp_create(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"config", "reqrefs", NULL};
    TyObject *configobj = NULL;
    int reqrefs = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|O$p:create", kwlist,
                                     &configobj, &reqrefs)) {
        return NULL;
    }

    PyInterpreterConfig config;
    if (config_from_object(configobj, &config) < 0) {
        return NULL;
    }

    long whence = _TyInterpreterState_WHENCE_STDLIB;
    TyInterpreterState *interp = \
            _PyXI_NewInterpreter(&config, &whence, NULL, NULL);
    if (interp == NULL) {
        // XXX Move the chained exception to interpreters.create()?
        TyObject *exc = TyErr_GetRaisedException();
        assert(exc != NULL);
        TyErr_SetString(TyExc_InterpreterError, "interpreter creation failed");
        _TyErr_ChainExceptions1(exc);
        return NULL;
    }
    assert(_TyInterpreterState_IsReady(interp));

    TyObject *idobj = _TyInterpreterState_GetIDObject(interp);
    if (idobj == NULL) {
        _PyXI_EndInterpreter(interp, NULL, NULL);
        return NULL;
    }

    if (reqrefs) {
        // Decref to 0 will destroy the interpreter.
        _TyInterpreterState_RequireIDRef(interp, 1);
    }

    return idobj;
}


TyDoc_STRVAR(create_doc,
"create([config], *, reqrefs=False) -> ID\n\
\n\
Create a new interpreter and return a unique generated ID.\n\
\n\
The caller is responsible for destroying the interpreter before exiting,\n\
typically by using _interpreters.destroy().  This can be managed \n\
automatically by passing \"reqrefs=True\" and then using _incref() and\n\
_decref() appropriately.\n\
\n\
\"config\" must be a valid interpreter config or the name of a\n\
predefined config (\"isolated\" or \"legacy\").  The default\n\
is \"isolated\".");


static TyObject *
interp_destroy(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "restrict", NULL};
    TyObject *id;
    int restricted = 0;
    // XXX Use "L" for id?
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O|$p:destroy", kwlist, &id, &restricted))
    {
        return NULL;
    }

    // Look up the interpreter.
    int reqready = 0;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "destroy");
    if (interp == NULL) {
        return NULL;
    }

    // Ensure we don't try to destroy the current interpreter.
    TyInterpreterState *current = _get_current_interp();
    if (current == NULL) {
        return NULL;
    }
    if (interp == current) {
        TyErr_SetString(TyExc_InterpreterError,
                        "cannot destroy the current interpreter");
        return NULL;
    }

    // Ensure the interpreter isn't running.
    /* XXX We *could* support destroying a running interpreter but
       aren't going to worry about it for now. */
    if (is_running_main(interp)) {
        TyErr_Format(TyExc_InterpreterError, "interpreter running");
        return NULL;
    }

    // Destroy the interpreter.
    _PyXI_EndInterpreter(interp, NULL, NULL);

    Py_RETURN_NONE;
}

TyDoc_STRVAR(destroy_doc,
"destroy(id, *, restrict=False)\n\
\n\
Destroy the identified interpreter.\n\
\n\
Attempting to destroy the current interpreter raises InterpreterError.\n\
So does an unrecognized ID.");


static TyObject *
interp_list_all(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *kwlist[] = {"require_ready", NULL};
    int reqready = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "|$p:" MODULE_NAME_STR ".list_all",
                                     kwlist, &reqready))
    {
        return NULL;
    }

    TyObject *ids = TyList_New(0);
    if (ids == NULL) {
        return NULL;
    }

    TyInterpreterState *interp = TyInterpreterState_Head();
    while (interp != NULL) {
        if (!reqready || _TyInterpreterState_IsReady(interp)) {
            TyObject *item = get_summary(interp);
            if (item == NULL) {
                Ty_DECREF(ids);
                return NULL;
            }

            // insert at front of list
            int res = TyList_Insert(ids, 0, item);
            Ty_DECREF(item);
            if (res < 0) {
                Ty_DECREF(ids);
                return NULL;
            }
        }
        interp = TyInterpreterState_Next(interp);
    }

    return ids;
}

TyDoc_STRVAR(list_all_doc,
"list_all() -> [(ID, whence)]\n\
\n\
Return a list containing the ID of every existing interpreter.");


static TyObject *
interp_get_current(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyInterpreterState *interp =_get_current_interp();
    if (interp == NULL) {
        return NULL;
    }
    assert(_TyInterpreterState_IsReady(interp));
    return get_summary(interp);
}

TyDoc_STRVAR(get_current_doc,
"get_current() -> (ID, whence)\n\
\n\
Return the ID of current interpreter.");


static TyObject *
interp_get_main(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyInterpreterState *interp = _TyInterpreterState_Main();
    assert(_TyInterpreterState_IsReady(interp));
    return get_summary(interp);
}

TyDoc_STRVAR(get_main_doc,
"get_main() -> (ID, whence)\n\
\n\
Return the ID of main interpreter.");


static TyObject *
interp_set___main___attrs(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *kwlist[] = {"id", "updates", "restrict", NULL};
    TyObject *id, *updates;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "OO!|$p:" MODULE_NAME_STR ".set___main___attrs",
                                     kwlist, &id, &TyDict_Type, &updates, &restricted))
    {
        return NULL;
    }

    // Look up the interpreter.
    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "update __main__ for");
    if (interp == NULL) {
        return NULL;
    }

    // Check the updates.
    Ty_ssize_t size = TyDict_Size(updates);
    if (size < 0) {
        return NULL;
    }
    if (size == 0) {
        TyErr_SetString(TyExc_ValueError,
                        "arg 2 must be a non-empty dict");
        return NULL;
    }

    _PyXI_session *session = _PyXI_NewSession();
    if (session == NULL) {
        return NULL;
    }

    // Prep and switch interpreters, including apply the updates.
    if (_PyXI_Enter(session, interp, updates, NULL) < 0) {
        _PyXI_FreeSession(session);
        return NULL;
    }

    // Clean up and switch back.
    assert(!TyErr_Occurred());
    int res = _PyXI_Exit(session, NULL, NULL);
    _PyXI_FreeSession(session);
    assert(res == 0);
    if (res < 0) {
        // unreachable
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_RuntimeError, "unresolved error");
        }
        return NULL;
    }

    Py_RETURN_NONE;
}

TyDoc_STRVAR(set___main___attrs_doc,
"set___main___attrs(id, ns, *, restrict=False)\n\
\n\
Bind the given attributes in the interpreter's __main__ module.");


static TyObject *
_handle_script_error(struct run_result *runres)
{
    assert(runres->result == NULL);
    if (runres->excinfo == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    assert(!TyErr_Occurred());
    return runres->excinfo;
}

static TyObject *
interp_exec(TyObject *self, TyObject *args, TyObject *kwds)
{
#define FUNCNAME MODULE_NAME_STR ".exec"
    TyThreadState *tstate = _TyThreadState_GET();
    static char *kwlist[] = {"id", "code", "shared", "restrict", NULL};
    TyObject *id, *code;
    TyObject *shared = NULL;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "OO|O!$p:" FUNCNAME, kwlist,
                                     &id, &code, &TyDict_Type, &shared,
                                     &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "exec code for");
    if (interp == NULL) {
        return NULL;
    }

    // We don't need the script to be "pure", which means it can use
    // global variables.  They will be resolved against __main__.
    _PyXIData_t xidata = {0};
    if (_TyCode_GetScriptXIData(tstate, code, &xidata) < 0) {
        unwrap_not_shareable(tstate, NULL);
        return NULL;
    }

    struct run_result runres = {0};
    int res = _run_in_interpreter(
                    tstate, interp, &xidata, NULL, shared, &runres);
    _PyXIData_Release(&xidata);
    if (res < 0) {
        return _handle_script_error(&runres);
    }
    assert(runres.result == NULL);
    Py_RETURN_NONE;
#undef FUNCNAME
}

TyDoc_STRVAR(exec_doc,
"exec(id, code, shared=None, *, restrict=False)\n\
\n\
Execute the provided code in the identified interpreter.\n\
This is equivalent to running the builtin exec() under the target\n\
interpreter, using the __dict__ of its __main__ module as both\n\
globals and locals.\n\
\n\
\"code\" may be a string containing the text of a Python script.\n\
\n\
Functions (and code objects) are also supported, with some restrictions.\n\
The code/function must not take any arguments or be a closure\n\
(i.e. have cell vars).  Methods and other callables are not supported.\n\
\n\
If a function is provided, its code object is used and all its state\n\
is ignored, including its __globals__ dict.");

static TyObject *
interp_run_string(TyObject *self, TyObject *args, TyObject *kwds)
{
#define FUNCNAME MODULE_NAME_STR ".run_string"
    TyThreadState *tstate = _TyThreadState_GET();
    static char *kwlist[] = {"id", "script", "shared", "restrict", NULL};
    TyObject *id, *script;
    TyObject *shared = NULL;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "OU|O!$p:" FUNCNAME, kwlist,
                                     &id, &script, &TyDict_Type, &shared,
                                     &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "run a string in");
    if (interp == NULL) {
        return NULL;
    }

    if (TyFunction_Check(script) || TyCode_Check(script)) {
        _TyArg_BadArgument(FUNCNAME, "argument 2", "a string", script);
        return NULL;
    }

    _PyXIData_t xidata = {0};
    if (_TyCode_GetScriptXIData(tstate, script, &xidata) < 0) {
        unwrap_not_shareable(tstate, NULL);
        return NULL;
    }

    struct run_result runres = {0};
    int res = _run_in_interpreter(
                    tstate, interp, &xidata, NULL, shared, &runres);
    _PyXIData_Release(&xidata);
    if (res < 0) {
        return _handle_script_error(&runres);
    }
    assert(runres.result == NULL);
    Py_RETURN_NONE;
#undef FUNCNAME
}

TyDoc_STRVAR(run_string_doc,
"run_string(id, script, shared=None, *, restrict=False)\n\
\n\
Execute the provided string in the identified interpreter.\n\
\n\
(See " MODULE_NAME_STR ".exec().");

static TyObject *
interp_run_func(TyObject *self, TyObject *args, TyObject *kwds)
{
#define FUNCNAME MODULE_NAME_STR ".run_func"
    TyThreadState *tstate = _TyThreadState_GET();
    static char *kwlist[] = {"id", "func", "shared", "restrict", NULL};
    TyObject *id, *func;
    TyObject *shared = NULL;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "OO|O!$p:" FUNCNAME, kwlist,
                                     &id, &func, &TyDict_Type, &shared,
                                     &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "run a function in");
    if (interp == NULL) {
        return NULL;
    }

    // We don't worry about checking globals.  They will be resolved
    // against __main__.
    TyObject *code;
    if (TyFunction_Check(func)) {
        code = TyFunction_GET_CODE(func);
    }
    else if (TyCode_Check(func)) {
        code = func;
    }
    else {
        _TyArg_BadArgument(FUNCNAME, "argument 2", "a function", func);
        return NULL;
    }

    _PyXIData_t xidata = {0};
    if (_TyCode_GetScriptXIData(tstate, code, &xidata) < 0) {
        unwrap_not_shareable(tstate, NULL);
        return NULL;
    }

    struct run_result runres = {0};
    int res = _run_in_interpreter(
                    tstate, interp, &xidata, NULL, shared, &runres);
    _PyXIData_Release(&xidata);
    if (res < 0) {
        return _handle_script_error(&runres);
    }
    assert(runres.result == NULL);
    Py_RETURN_NONE;
#undef FUNCNAME
}

TyDoc_STRVAR(run_func_doc,
"run_func(id, func, shared=None, *, restrict=False)\n\
\n\
Execute the body of the provided function in the identified interpreter.\n\
Code objects are also supported.  In both cases, closures and args\n\
are not supported.  Methods and other callables are not supported either.\n\
\n\
(See " MODULE_NAME_STR ".exec().");

static TyObject *
interp_call(TyObject *self, TyObject *args, TyObject *kwds)
{
#define FUNCNAME MODULE_NAME_STR ".call"
    TyThreadState *tstate = _TyThreadState_GET();
    static char *kwlist[] = {"id", "callable", "args", "kwargs",
                             "preserve_exc", "restrict", NULL};
    TyObject *id, *callable;
    TyObject *args_obj = NULL;
    TyObject *kwargs_obj = NULL;
    int preserve_exc = 0;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "OO|O!O!$pp:" FUNCNAME, kwlist,
                                     &id, &callable,
                                     &TyTuple_Type, &args_obj,
                                     &TyDict_Type, &kwargs_obj,
                                     &preserve_exc, &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "make a call in");
    if (interp == NULL) {
        return NULL;
    }

    struct interp_call call = {0};
    if (_interp_call_pack(tstate, &call, callable, args_obj, kwargs_obj) < 0) {
        return NULL;
    }

    TyObject *res_and_exc = NULL;
    struct run_result runres = {0};
    if (_run_in_interpreter(tstate, interp, NULL, &call, NULL, &runres) < 0) {
        if (runres.excinfo == NULL) {
            assert(_TyErr_Occurred(tstate));
            goto finally;
        }
        assert(!_TyErr_Occurred(tstate));
    }
    assert(runres.result == NULL || runres.excinfo == NULL);
    res_and_exc = Ty_BuildValue("OO",
                                (runres.result ? runres.result : Ty_None),
                                (runres.excinfo ? runres.excinfo : Ty_None));

finally:
    _interp_call_clear(&call);
    _run_result_clear(&runres);
    return res_and_exc;
#undef FUNCNAME
}

TyDoc_STRVAR(call_doc,
"call(id, callable, args=None, kwargs=None, *, restrict=False)\n\
\n\
Call the provided object in the identified interpreter.\n\
Pass the given args and kwargs, if possible.");


static TyObject *
object_is_shareable(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"obj", NULL};
    TyObject *obj;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O:is_shareable", kwlist, &obj)) {
        return NULL;
    }

    TyThreadState *tstate = _TyThreadState_GET();
    if (_TyObject_CheckXIData(tstate, obj) == 0) {
        Py_RETURN_TRUE;
    }
    TyErr_Clear();
    Py_RETURN_FALSE;
}

TyDoc_STRVAR(is_shareable_doc,
"is_shareable(obj) -> bool\n\
\n\
Return True if the object's data may be shared between interpreters and\n\
False otherwise.");


static TyObject *
interp_is_running(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "restrict", NULL};
    TyObject *id;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O|$p:is_running", kwlist,
                                     &id, &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "check if running for");
    if (interp == NULL) {
        return NULL;
    }

    if (is_running_main(interp)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

TyDoc_STRVAR(is_running_doc,
"is_running(id, *, restrict=False) -> bool\n\
\n\
Return whether or not the identified interpreter is running.");


static TyObject *
interp_get_config(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "restrict", NULL};
    TyObject *idobj = NULL;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O?|$p:get_config", kwlist,
                                     &idobj, &restricted))
    {
        return NULL;
    }

    int reqready = 0;
    TyInterpreterState *interp = \
            resolve_interp(idobj, restricted, reqready, "get the config of");
    if (interp == NULL) {
        return NULL;
    }

    PyInterpreterConfig config;
    if (_PyInterpreterConfig_InitFromState(&config, interp) < 0) {
        return NULL;
    }
    TyObject *dict = _PyInterpreterConfig_AsDict(&config);
    if (dict == NULL) {
        return NULL;
    }

    TyObject *configobj = _PyNamespace_New(dict);
    Ty_DECREF(dict);
    return configobj;
}

TyDoc_STRVAR(get_config_doc,
"get_config(id, *, restrict=False) -> types.SimpleNamespace\n\
\n\
Return a representation of the config used to initialize the interpreter.");


static TyObject *
interp_whence(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", NULL};
    TyObject *id;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O:whence", kwlist, &id))
    {
        return NULL;
    }

    TyInterpreterState *interp = look_up_interp(id);
    if (interp == NULL) {
        return NULL;
    }

    long whence = get_whence(interp);
    return TyLong_FromLong(whence);
}

TyDoc_STRVAR(whence_doc,
"whence(id) -> int\n\
\n\
Return an identifier for where the interpreter was created.");


static TyObject *
interp_incref(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "implieslink", "restrict", NULL};
    TyObject *id;
    int implieslink = 0;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O|$pp:incref", kwlist,
                                     &id, &implieslink, &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "incref");
    if (interp == NULL) {
        return NULL;
    }

    if (implieslink) {
        // Decref to 0 will destroy the interpreter.
        _TyInterpreterState_RequireIDRef(interp, 1);
    }
    _TyInterpreterState_IDIncref(interp);

    Py_RETURN_NONE;
}


static TyObject *
interp_decref(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "restrict", NULL};
    TyObject *id;
    int restricted = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O|$p:decref", kwlist, &id, &restricted))
    {
        return NULL;
    }

    int reqready = 1;
    TyInterpreterState *interp = \
            resolve_interp(id, restricted, reqready, "decref");
    if (interp == NULL) {
        return NULL;
    }

    _TyInterpreterState_IDDecref(interp);

    Py_RETURN_NONE;
}


static TyObject *
capture_exception(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"exc", NULL};
    TyObject *exc_arg = NULL;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "|O?:capture_exception", kwlist,
                                     &exc_arg))
    {
        return NULL;
    }

    TyObject *exc = exc_arg;
    if (exc == NULL) {
        exc = TyErr_GetRaisedException();
        if (exc == NULL) {
            Py_RETURN_NONE;
        }
    }
    else if (!PyExceptionInstance_Check(exc)) {
        TyErr_Format(TyExc_TypeError, "expected exception, got %R", exc);
        return NULL;
    }
    TyObject *captured = NULL;

    _PyXI_excinfo *info = _PyXI_NewExcInfo(exc);
    if (info == NULL) {
        goto finally;
    }
    captured = _PyXI_ExcInfoAsObject(info);
    if (captured == NULL) {
        goto finally;
    }

    TyObject *formatted = _PyXI_FormatExcInfo(info);
    if (formatted == NULL) {
        Ty_CLEAR(captured);
        goto finally;
    }
    int res = PyObject_SetAttrString(captured, "formatted", formatted);
    Ty_DECREF(formatted);
    if (res < 0) {
        Ty_CLEAR(captured);
        goto finally;
    }

finally:
    _PyXI_FreeExcInfo(info);
    if (exc != exc_arg) {
        if (TyErr_Occurred()) {
            TyErr_SetRaisedException(exc);
        }
        else {
            _TyErr_ChainExceptions1(exc);
        }
    }
    return captured;
}

TyDoc_STRVAR(capture_exception_doc,
"capture_exception(exc=None) -> types.SimpleNamespace\n\
\n\
Return a snapshot of an exception.  If \"exc\" is None\n\
then the current exception, if any, is used (but not cleared).\n\
\n\
The returned snapshot is the same as what _interpreters.exec() returns.");


static TyMethodDef module_functions[] = {
    {"new_config",                _PyCFunction_CAST(interp_new_config),
     METH_VARARGS | METH_KEYWORDS, new_config_doc},

    {"create",                    _PyCFunction_CAST(interp_create),
     METH_VARARGS | METH_KEYWORDS, create_doc},
    {"destroy",                   _PyCFunction_CAST(interp_destroy),
     METH_VARARGS | METH_KEYWORDS, destroy_doc},
    {"list_all",                  _PyCFunction_CAST(interp_list_all),
     METH_VARARGS | METH_KEYWORDS, list_all_doc},
    {"get_current",               interp_get_current,
     METH_NOARGS, get_current_doc},
    {"get_main",                  interp_get_main,
     METH_NOARGS, get_main_doc},

    {"is_running",                _PyCFunction_CAST(interp_is_running),
     METH_VARARGS | METH_KEYWORDS, is_running_doc},
    {"get_config",                _PyCFunction_CAST(interp_get_config),
     METH_VARARGS | METH_KEYWORDS, get_config_doc},
    {"whence",                    _PyCFunction_CAST(interp_whence),
     METH_VARARGS | METH_KEYWORDS, whence_doc},
    {"exec",                      _PyCFunction_CAST(interp_exec),
     METH_VARARGS | METH_KEYWORDS, exec_doc},
    {"call",                      _PyCFunction_CAST(interp_call),
     METH_VARARGS | METH_KEYWORDS, call_doc},
    {"run_string",                _PyCFunction_CAST(interp_run_string),
     METH_VARARGS | METH_KEYWORDS, run_string_doc},
    {"run_func",                  _PyCFunction_CAST(interp_run_func),
     METH_VARARGS | METH_KEYWORDS, run_func_doc},

    {"set___main___attrs",        _PyCFunction_CAST(interp_set___main___attrs),
     METH_VARARGS | METH_KEYWORDS, set___main___attrs_doc},

    {"incref",                    _PyCFunction_CAST(interp_incref),
     METH_VARARGS | METH_KEYWORDS, NULL},
    {"decref",                    _PyCFunction_CAST(interp_decref),
     METH_VARARGS | METH_KEYWORDS, NULL},

    {"is_shareable",              _PyCFunction_CAST(object_is_shareable),
     METH_VARARGS | METH_KEYWORDS, is_shareable_doc},

    {"capture_exception",         _PyCFunction_CAST(capture_exception),
     METH_VARARGS | METH_KEYWORDS, capture_exception_doc},

    {NULL,                        NULL}           /* sentinel */
};


/* initialization function */

TyDoc_STRVAR(module_doc,
"This module provides primitive operations to manage Python interpreters.\n\
The 'interpreters' module provides a more convenient interface.");

static int
module_exec(TyObject *mod)
{
    TyThreadState *tstate = _TyThreadState_GET();
    module_state *state = get_module_state(mod);

#define ADD_WHENCE(NAME) \
    if (TyModule_AddIntConstant(mod, "WHENCE_" #NAME,                   \
                                _TyInterpreterState_WHENCE_##NAME) < 0) \
    {                                                                   \
        goto error;                                                     \
    }
    ADD_WHENCE(UNKNOWN)
    ADD_WHENCE(RUNTIME)
    ADD_WHENCE(LEGACY_CAPI)
    ADD_WHENCE(CAPI)
    ADD_WHENCE(XI)
    ADD_WHENCE(STDLIB)
#undef ADD_WHENCE

    // exceptions
    if (TyModule_AddType(mod, (TyTypeObject *)TyExc_InterpreterError) < 0) {
        goto error;
    }
    if (TyModule_AddType(mod, (TyTypeObject *)TyExc_InterpreterNotFoundError) < 0) {
        goto error;
    }
    TyObject *exctype = _PyXIData_GetNotShareableErrorType(tstate);
    if (TyModule_AddType(mod, (TyTypeObject *)exctype) < 0) {
        goto error;
    }

    if (register_memoryview_xid(mod, &state->XIBufferViewType) < 0) {
        goto error;
    }

    return 0;

error:
    return -1;
}

static struct PyModuleDef_Slot module_slots[] = {
    {Ty_mod_exec, module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static int
module_traverse(TyObject *mod, visitproc visit, void *arg)
{
    module_state *state = get_module_state(mod);
    assert(state != NULL);
    return traverse_module_state(state, visit, arg);
}

static int
module_clear(TyObject *mod)
{
    module_state *state = get_module_state(mod);
    assert(state != NULL);
    return clear_module_state(state);
}

static void
module_free(void *mod)
{
    module_state *state = get_module_state((TyObject *)mod);
    assert(state != NULL);
    (void)clear_module_state(state);
}

static struct TyModuleDef moduledef = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = MODULE_NAME_STR,
    .m_doc = module_doc,
    .m_size = sizeof(module_state),
    .m_methods = module_functions,
    .m_slots = module_slots,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free,
};

PyMODINIT_FUNC
MODINIT_FUNC_NAME(void)
{
    return PyModuleDef_Init(&moduledef);
}
