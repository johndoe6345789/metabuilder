
/* API for managing interactions between isolated interpreters */

#include "Python.h"
#include "marshal.h"              // PyMarshal_WriteObjectToString()
#include "osdefs.h"               // MAXPATHLEN
#include "pycore_ceval.h"         // _Ty_simple_func
#include "pycore_crossinterp.h"   // _PyXIData_t
#include "pycore_function.h"      // _TyFunction_VerifyStateless()
#include "pycore_global_strings.h"  // _Ty_ID()
#include "pycore_import.h"        // _TyImport_SetModule()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_namespace.h"     // _PyNamespace_New()
#include "pycore_pythonrun.h"     // _Ty_SourceAsString()
#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_typeobject.h"    // _PyStaticType_InitBuiltin()


static Ty_ssize_t
_Ty_GetMainfile(char *buffer, size_t maxlen)
{
    // We don't expect subinterpreters to have the __main__ module's
    // __name__ set, but proceed just in case.
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *module = _Ty_GetMainModule(tstate);
    if (_Ty_CheckMainModule(module) < 0) {
        Ty_XDECREF(module);
        return -1;
    }
    Ty_ssize_t size = _TyModule_GetFilenameUTF8(module, buffer, maxlen);
    Ty_DECREF(module);
    return size;
}


static TyObject *
runpy_run_path(const char *filename, const char *modname)
{
    TyObject *run_path = TyImport_ImportModuleAttrString("runpy", "run_path");
    if (run_path == NULL) {
        return NULL;
    }
    TyObject *args = Ty_BuildValue("(sOs)", filename, Ty_None, modname);
    if (args == NULL) {
        Ty_DECREF(run_path);
        return NULL;
    }
    TyObject *ns = PyObject_Call(run_path, args, NULL);
    Ty_DECREF(run_path);
    Ty_DECREF(args);
    return ns;
}


static void
set_exc_with_cause(TyObject *exctype, const char *msg)
{
    TyObject *cause = TyErr_GetRaisedException();
    TyErr_SetString(exctype, msg);
    TyObject *exc = TyErr_GetRaisedException();
    PyException_SetCause(exc, cause);
    TyErr_SetRaisedException(exc);
}


/****************************/
/* module duplication utils */
/****************************/

struct sync_module_result {
    TyObject *module;
    TyObject *loaded;
    TyObject *failed;
};

struct sync_module {
    const char *filename;
    char _filename[MAXPATHLEN+1];
    struct sync_module_result cached;
};

static void
sync_module_clear(struct sync_module *data)
{
    data->filename = NULL;
    Ty_CLEAR(data->cached.module);
    Ty_CLEAR(data->cached.loaded);
    Ty_CLEAR(data->cached.failed);
}

static void
sync_module_capture_exc(TyThreadState *tstate, struct sync_module *data)
{
    assert(_TyErr_Occurred(tstate));
    TyObject *context = data->cached.failed;
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    _TyErr_SetRaisedException(tstate, Ty_NewRef(exc));
    if (context != NULL) {
        PyException_SetContext(exc, context);
    }
    data->cached.failed = exc;
}


static int
ensure_isolated_main(TyThreadState *tstate, struct sync_module *main)
{
    // Load the module from the original file (or from a cache).

    // First try the local cache.
    if (main->cached.failed != NULL) {
        // We'll deal with this in apply_isolated_main().
        assert(main->cached.module == NULL);
        assert(main->cached.loaded == NULL);
        return 0;
    }
    else if (main->cached.loaded != NULL) {
        assert(main->cached.module != NULL);
        return 0;
    }
    assert(main->cached.module == NULL);

    if (main->filename == NULL) {
        _TyErr_SetString(tstate, TyExc_NotImplementedError, "");
        return -1;
    }

    // It wasn't in the local cache so we'll need to populate it.
    TyObject *mod = _Ty_GetMainModule(tstate);
    if (_Ty_CheckMainModule(mod) < 0) {
        // This is probably unrecoverable, so don't bother caching the error.
        assert(_TyErr_Occurred(tstate));
        Ty_XDECREF(mod);
        return -1;
    }
    TyObject *loaded = NULL;

    // Try the per-interpreter cache for the loaded module.
    // XXX Store it in sys.modules?
    TyObject *interpns = TyInterpreterState_GetDict(tstate->interp);
    assert(interpns != NULL);
    TyObject *key = TyUnicode_FromString("CACHED_MODULE_NS___main__");
    if (key == NULL) {
        // It's probably unrecoverable, so don't bother caching the error.
        Ty_DECREF(mod);
        return -1;
    }
    else if (TyDict_GetItemRef(interpns, key, &loaded) < 0) {
        // It's probably unrecoverable, so don't bother caching the error.
        Ty_DECREF(mod);
        Ty_DECREF(key);
        return -1;
    }
    else if (loaded == NULL) {
        // It wasn't already loaded from file.
        loaded = TyModule_NewObject(&_Ty_ID(__main__));
        if (loaded == NULL) {
            goto error;
        }
        TyObject *ns = _TyModule_GetDict(loaded);

        // We don't want to trigger "if __name__ == '__main__':",
        // so we use a bogus module name.
        TyObject *loaded_ns =
                    runpy_run_path(main->filename, "<fake __main__>");
        if (loaded_ns == NULL) {
            goto error;
        }
        int res = TyDict_Update(ns, loaded_ns);
        Ty_DECREF(loaded_ns);
        if (res < 0) {
            goto error;
        }

        // Set the per-interpreter cache entry.
        if (TyDict_SetItem(interpns, key, loaded) < 0) {
            goto error;
        }
    }

    Ty_DECREF(key);
    main->cached = (struct sync_module_result){
       .module = mod,
       .loaded = loaded,
    };
    return 0;

error:
    sync_module_capture_exc(tstate, main);
    Ty_XDECREF(loaded);
    Ty_DECREF(mod);
    Ty_XDECREF(key);
    return -1;
}

#ifndef NDEBUG
static int
main_mod_matches(TyObject *expected)
{
    TyObject *mod = TyImport_GetModule(&_Ty_ID(__main__));
    Ty_XDECREF(mod);
    return mod == expected;
}
#endif

static int
apply_isolated_main(TyThreadState *tstate, struct sync_module *main)
{
    assert((main->cached.loaded == NULL) == (main->cached.loaded == NULL));
    if (main->cached.failed != NULL) {
        // It must have failed previously.
        assert(main->cached.loaded == NULL);
        _TyErr_SetRaisedException(tstate, main->cached.failed);
        return -1;
    }
    assert(main->cached.loaded != NULL);

    assert(main_mod_matches(main->cached.module));
    if (_TyImport_SetModule(&_Ty_ID(__main__), main->cached.loaded) < 0) {
        sync_module_capture_exc(tstate, main);
        return -1;
    }
    return 0;
}

static void
restore_main(TyThreadState *tstate, struct sync_module *main)
{
    assert(main->cached.failed == NULL);
    assert(main->cached.module != NULL);
    assert(main->cached.loaded != NULL);
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    assert(main_mod_matches(main->cached.loaded));
    int res = _TyImport_SetModule(&_Ty_ID(__main__), main->cached.module);
    assert(res == 0);
    if (res < 0) {
        TyErr_FormatUnraisable("Exception ignored while restoring __main__");
    }
    _TyErr_SetRaisedException(tstate, exc);
}


/**************/
/* exceptions */
/**************/

typedef struct xi_exceptions exceptions_t;
static int init_static_exctypes(exceptions_t *, TyInterpreterState *);
static void fini_static_exctypes(exceptions_t *, TyInterpreterState *);
static int init_heap_exctypes(exceptions_t *);
static void fini_heap_exctypes(exceptions_t *);
#include "crossinterp_exceptions.h"


/***************************/
/* cross-interpreter calls */
/***************************/

int
_Ty_CallInInterpreter(TyInterpreterState *interp,
                      _Ty_simple_func func, void *arg)
{
    if (interp == TyInterpreterState_Get()) {
        return func(arg);
    }
    // XXX Emit a warning if this fails?
    _TyEval_AddPendingCall(interp, (_Ty_pending_call_func)func, arg, 0);
    return 0;
}

int
_Ty_CallInInterpreterAndRawFree(TyInterpreterState *interp,
                                _Ty_simple_func func, void *arg)
{
    if (interp == TyInterpreterState_Get()) {
        int res = func(arg);
        TyMem_RawFree(arg);
        return res;
    }
    // XXX Emit a warning if this fails?
    _TyEval_AddPendingCall(interp, func, arg, _Ty_PENDING_RAWFREE);
    return 0;
}


/**************************/
/* cross-interpreter data */
/**************************/

/* registry of {type -> _PyXIData_getdata_t} */

/* For now we use a global registry of shareable classes.
   An alternative would be to add a tp_* slot for a class's
   _PyXIData_getdata_t.  It would be simpler and more efficient. */

static void xid_lookup_init(_PyXIData_lookup_t *);
static void xid_lookup_fini(_PyXIData_lookup_t *);
struct _dlcontext;
static _PyXIData_getdata_t lookup_getdata(struct _dlcontext *, TyObject *);
#include "crossinterp_data_lookup.h"


/* lifecycle */

_PyXIData_t *
_PyXIData_New(void)
{
    _PyXIData_t *xid = TyMem_RawCalloc(1, sizeof(_PyXIData_t));
    if (xid == NULL) {
        TyErr_NoMemory();
    }
    return xid;
}

void
_PyXIData_Free(_PyXIData_t *xid)
{
    TyInterpreterState *interp = TyInterpreterState_Get();
    _PyXIData_Clear(interp, xid);
    TyMem_RawFree(xid);
}


/* defining cross-interpreter data */

static inline void
_xidata_init(_PyXIData_t *xidata)
{
    // If the value is being reused
    // then _xidata_clear() should have been called already.
    assert(xidata->data == NULL);
    assert(xidata->obj == NULL);
    *xidata = (_PyXIData_t){0};
    _PyXIData_INTERPID(xidata) = -1;
}

static inline void
_xidata_clear(_PyXIData_t *xidata)
{
    // _PyXIData_t only has two members that need to be
    // cleaned up, if set: "xidata" must be freed and "obj" must be decref'ed.
    // In both cases the original (owning) interpreter must be used,
    // which is the caller's responsibility to ensure.
    if (xidata->data != NULL) {
        if (xidata->free != NULL) {
            xidata->free(xidata->data);
        }
        xidata->data = NULL;
    }
    Ty_CLEAR(xidata->obj);
}

void
_PyXIData_Init(_PyXIData_t *xidata,
               TyInterpreterState *interp,
               void *shared, TyObject *obj,
               xid_newobjfunc new_object)
{
    assert(xidata != NULL);
    assert(new_object != NULL);
    _xidata_init(xidata);
    xidata->data = shared;
    if (obj != NULL) {
        assert(interp != NULL);
        // released in _PyXIData_Clear()
        xidata->obj = Ty_NewRef(obj);
    }
    // Ideally every object would know its owning interpreter.
    // Until then, we have to rely on the caller to identify it
    // (but we don't need it in all cases).
    _PyXIData_INTERPID(xidata) = (interp != NULL)
        ? TyInterpreterState_GetID(interp)
        : -1;
    xidata->new_object = new_object;
}

int
_PyXIData_InitWithSize(_PyXIData_t *xidata,
                       TyInterpreterState *interp,
                       const size_t size, TyObject *obj,
                       xid_newobjfunc new_object)
{
    assert(size > 0);
    // For now we always free the shared data in the same interpreter
    // where it was allocated, so the interpreter is required.
    assert(interp != NULL);
    _PyXIData_Init(xidata, interp, NULL, obj, new_object);
    xidata->data = TyMem_RawCalloc(1, size);
    if (xidata->data == NULL) {
        return -1;
    }
    xidata->free = TyMem_RawFree;
    return 0;
}

void
_PyXIData_Clear(TyInterpreterState *interp, _PyXIData_t *xidata)
{
    assert(xidata != NULL);
    // This must be called in the owning interpreter.
    assert(interp == NULL
           || _PyXIData_INTERPID(xidata) == -1
           || _PyXIData_INTERPID(xidata) == TyInterpreterState_GetID(interp));
    _xidata_clear(xidata);
}


/* getting cross-interpreter data */

static inline void
_set_xid_lookup_failure(TyThreadState *tstate, TyObject *obj, const char *msg,
                        TyObject *cause)
{
    if (msg != NULL) {
        assert(obj == NULL);
        set_notshareableerror(tstate, cause, 0, msg);
    }
    else if (obj == NULL) {
        msg = "object does not support cross-interpreter data";
        set_notshareableerror(tstate, cause, 0, msg);
    }
    else {
        msg = "%R does not support cross-interpreter data";
        format_notshareableerror(tstate, cause, 0, msg, obj);
    }
}


int
_TyObject_CheckXIData(TyThreadState *tstate, TyObject *obj)
{
    dlcontext_t ctx;
    if (get_lookup_context(tstate, &ctx) < 0) {
        return -1;
    }
    _PyXIData_getdata_t getdata = lookup_getdata(&ctx, obj);
    if (getdata.basic == NULL && getdata.fallback == NULL) {
        if (!_TyErr_Occurred(tstate)) {
            _set_xid_lookup_failure(tstate, obj, NULL, NULL);
        }
        return -1;
    }
    return 0;
}

static int
_check_xidata(TyThreadState *tstate, _PyXIData_t *xidata)
{
    // xidata->data can be anything, including NULL, so we don't check it.

    // xidata->obj may be NULL, so we don't check it.

    if (_PyXIData_INTERPID(xidata) < 0) {
        TyErr_SetString(TyExc_SystemError, "missing interp");
        return -1;
    }

    if (xidata->new_object == NULL) {
        TyErr_SetString(TyExc_SystemError, "missing new_object func");
        return -1;
    }

    // xidata->free may be NULL, so we don't check it.

    return 0;
}

static int
_get_xidata(TyThreadState *tstate,
            TyObject *obj, xidata_fallback_t fallback, _PyXIData_t *xidata)
{
    TyInterpreterState *interp = tstate->interp;

    assert(xidata->data == NULL);
    assert(xidata->obj == NULL);
    if (xidata->data != NULL || xidata->obj != NULL) {
        _TyErr_SetString(tstate, TyExc_ValueError, "xidata not cleared");
        return -1;
    }

    // Call the "getdata" func for the object.
    dlcontext_t ctx;
    if (get_lookup_context(tstate, &ctx) < 0) {
        return -1;
    }
    Ty_INCREF(obj);
    _PyXIData_getdata_t getdata = lookup_getdata(&ctx, obj);
    if (getdata.basic == NULL && getdata.fallback == NULL) {
        if (TyErr_Occurred()) {
            Ty_DECREF(obj);
            return -1;
        }
        // Fall back to obj
        Ty_DECREF(obj);
        if (!_TyErr_Occurred(tstate)) {
            _set_xid_lookup_failure(tstate, obj, NULL, NULL);
        }
        return -1;
    }
    int res = getdata.basic != NULL
        ? getdata.basic(tstate, obj, xidata)
        : getdata.fallback(tstate, obj, fallback, xidata);
    Ty_DECREF(obj);
    if (res != 0) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        _set_xid_lookup_failure(tstate, obj, NULL, cause);
        Ty_XDECREF(cause);
        return -1;
    }

    // Fill in the blanks and validate the result.
    _PyXIData_INTERPID(xidata) = TyInterpreterState_GetID(interp);
    if (_check_xidata(tstate, xidata) != 0) {
        (void)_PyXIData_Release(xidata);
        return -1;
    }

    return 0;
}

int
_TyObject_GetXIDataNoFallback(TyThreadState *tstate,
                              TyObject *obj, _PyXIData_t *xidata)
{
    return _get_xidata(tstate, obj, _PyXIDATA_XIDATA_ONLY, xidata);
}

int
_TyObject_GetXIData(TyThreadState *tstate,
                    TyObject *obj, xidata_fallback_t fallback,
                    _PyXIData_t *xidata)
{
    switch (fallback) {
        case _PyXIDATA_XIDATA_ONLY:
            return _get_xidata(tstate, obj, fallback, xidata);
        case _PyXIDATA_FULL_FALLBACK:
            if (_get_xidata(tstate, obj, fallback, xidata) == 0) {
                return 0;
            }
            TyObject *exc = _TyErr_GetRaisedException(tstate);
            if (TyFunction_Check(obj)) {
                if (_TyFunction_GetXIData(tstate, obj, xidata) == 0) {
                    Ty_DECREF(exc);
                    return 0;
                }
                _TyErr_Clear(tstate);
            }
            // We could try _TyMarshal_GetXIData() but we won't for now.
            if (_PyPickle_GetXIData(tstate, obj, xidata) == 0) {
                Ty_DECREF(exc);
                return 0;
            }
            // Raise the original exception.
            _TyErr_SetRaisedException(tstate, exc);
            return -1;
        default:
#ifdef Ty_DEBUG
            Ty_FatalError("unsupported xidata fallback option");
#endif
            _TyErr_SetString(tstate, TyExc_SystemError,
                             "unsupported xidata fallback option");
            return -1;
    }
}


/* pickle C-API */

struct _pickle_context {
    TyThreadState *tstate;
};

static TyObject *
_PyPickle_Dumps(struct _pickle_context *ctx, TyObject *obj)
{
    TyObject *dumps = TyImport_ImportModuleAttrString("pickle", "dumps");
    if (dumps == NULL) {
        return NULL;
    }
    TyObject *bytes = PyObject_CallOneArg(dumps, obj);
    Ty_DECREF(dumps);
    return bytes;
}


struct _unpickle_context {
    TyThreadState *tstate;
    // We only special-case the __main__ module,
    // since other modules behave consistently.
    struct sync_module main;
};

static void
_unpickle_context_clear(struct _unpickle_context *ctx)
{
    sync_module_clear(&ctx->main);
}

static int
check_missing___main___attr(TyObject *exc)
{
    assert(!TyErr_Occurred());
    if (!TyErr_GivenExceptionMatches(exc, TyExc_AttributeError)) {
        return 0;
    }

    // Get the error message.
    TyObject *args = PyException_GetArgs(exc);
    if (args == NULL || args == Ty_None || PyObject_Size(args) < 1) {
        assert(!TyErr_Occurred());
        return 0;
    }
    TyObject *msgobj = args;
    if (!TyUnicode_Check(msgobj)) {
        msgobj = PySequence_GetItem(args, 0);
        Ty_DECREF(args);
        if (msgobj == NULL) {
            TyErr_Clear();
            return 0;
        }
    }
    const char *err = TyUnicode_AsUTF8(msgobj);

    // Check if it's a missing __main__ attr.
    int cmp = strncmp(err, "module '__main__' has no attribute '", 36);
    Ty_DECREF(msgobj);
    return cmp == 0;
}

static TyObject *
_PyPickle_Loads(struct _unpickle_context *ctx, TyObject *pickled)
{
    TyThreadState *tstate = ctx->tstate;

    TyObject *exc = NULL;
    TyObject *loads = TyImport_ImportModuleAttrString("pickle", "loads");
    if (loads == NULL) {
        return NULL;
    }

    // Make an initial attempt to unpickle.
    TyObject *obj = PyObject_CallOneArg(loads, pickled);
    if (obj != NULL) {
        goto finally;
    }
    assert(_TyErr_Occurred(tstate));
    if (ctx == NULL) {
        goto finally;
    }
    exc = _TyErr_GetRaisedException(tstate);
    if (!check_missing___main___attr(exc)) {
        goto finally;
    }

    // Temporarily swap in a fake __main__ loaded from the original
    // file and cached.  Note that functions will use the cached ns
    // for __globals__, // not the actual module.
    if (ensure_isolated_main(tstate, &ctx->main) < 0) {
        goto finally;
    }
    if (apply_isolated_main(tstate, &ctx->main) < 0) {
        goto finally;
    }

    // Try to unpickle once more.
    obj = PyObject_CallOneArg(loads, pickled);
    restore_main(tstate, &ctx->main);
    if (obj == NULL) {
        goto finally;
    }
    Ty_CLEAR(exc);

finally:
    if (exc != NULL) {
        if (_TyErr_Occurred(tstate)) {
            sync_module_capture_exc(tstate, &ctx->main);
        }
        // We restore the original exception.
        // It might make sense to chain it (__context__).
        _TyErr_SetRaisedException(tstate, exc);
    }
    Ty_DECREF(loads);
    return obj;
}


/* pickle wrapper */

struct _pickle_xid_context {
    // __main__.__file__
    struct {
        const char *utf8;
        size_t len;
        char _utf8[MAXPATHLEN+1];
    } mainfile;
};

static int
_set_pickle_xid_context(TyThreadState *tstate, struct _pickle_xid_context *ctx)
{
    // Set mainfile if possible.
    Ty_ssize_t len = _Ty_GetMainfile(ctx->mainfile._utf8, MAXPATHLEN);
    if (len < 0) {
        // For now we ignore any exceptions.
        TyErr_Clear();
    }
    else if (len > 0) {
        ctx->mainfile.utf8 = ctx->mainfile._utf8;
        ctx->mainfile.len = (size_t)len;
    }

    return 0;
}


struct _shared_pickle_data {
    _TyBytes_data_t pickled;  // Must be first if we use _TyBytes_FromXIData().
    struct _pickle_xid_context ctx;
};

TyObject *
_PyPickle_LoadFromXIData(_PyXIData_t *xidata)
{
    TyThreadState *tstate = _TyThreadState_GET();
    struct _shared_pickle_data *shared =
                            (struct _shared_pickle_data *)xidata->data;
    // We avoid copying the pickled data by wrapping it in a memoryview.
    // The alternative is to get a bytes object using _TyBytes_FromXIData().
    TyObject *pickled = TyMemoryView_FromMemory(
            (char *)shared->pickled.bytes, shared->pickled.len, PyBUF_READ);
    if (pickled == NULL) {
        return NULL;
    }

    // Unpickle the object.
    struct _unpickle_context ctx = {
        .tstate = tstate,
        .main = {
            .filename = shared->ctx.mainfile.utf8,
        },
    };
    TyObject *obj = _PyPickle_Loads(&ctx, pickled);
    Ty_DECREF(pickled);
    _unpickle_context_clear(&ctx);
    if (obj == NULL) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        _set_xid_lookup_failure(
                    tstate, NULL, "object could not be unpickled", cause);
        Ty_DECREF(cause);
    }
    return obj;
}


int
_PyPickle_GetXIData(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    // Pickle the object.
    struct _pickle_context ctx = {
        .tstate = tstate,
    };
    TyObject *bytes = _PyPickle_Dumps(&ctx, obj);
    if (bytes == NULL) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        _set_xid_lookup_failure(
                    tstate, NULL, "object could not be pickled", cause);
        Ty_DECREF(cause);
        return -1;
    }

    // If we had an "unwrapper" mechnanism, we could call
    // _TyObject_GetXIData() on the bytes object directly and add
    // a simple unwrapper to call pickle.loads() on the bytes.
    size_t size = sizeof(struct _shared_pickle_data);
    struct _shared_pickle_data *shared =
            (struct _shared_pickle_data *)_TyBytes_GetXIDataWrapped(
                    tstate, bytes, size, _PyPickle_LoadFromXIData, xidata);
    Ty_DECREF(bytes);
    if (shared == NULL) {
        return -1;
    }

    // If it mattered, we could skip getting __main__.__file__
    // when "__main__" doesn't show up in the pickle bytes.
    if (_set_pickle_xid_context(tstate, &shared->ctx) < 0) {
        _xidata_clear(xidata);
        return -1;
    }

    return 0;
}


/* marshal wrapper */

TyObject *
_TyMarshal_ReadObjectFromXIData(_PyXIData_t *xidata)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyBytes_data_t *shared = (_TyBytes_data_t *)xidata->data;
    TyObject *obj = TyMarshal_ReadObjectFromString(shared->bytes, shared->len);
    if (obj == NULL) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        _set_xid_lookup_failure(
                    tstate, NULL, "object could not be unmarshalled", cause);
        Ty_DECREF(cause);
        return NULL;
    }
    return obj;
}

int
_TyMarshal_GetXIData(TyThreadState *tstate, TyObject *obj, _PyXIData_t *xidata)
{
    TyObject *bytes = TyMarshal_WriteObjectToString(obj, Ty_MARSHAL_VERSION);
    if (bytes == NULL) {
        TyObject *cause = _TyErr_GetRaisedException(tstate);
        assert(cause != NULL);
        _set_xid_lookup_failure(
                    tstate, NULL, "object could not be marshalled", cause);
        Ty_DECREF(cause);
        return -1;
    }
    size_t size = sizeof(_TyBytes_data_t);
    _TyBytes_data_t *shared = _TyBytes_GetXIDataWrapped(
            tstate, bytes, size, _TyMarshal_ReadObjectFromXIData, xidata);
    Ty_DECREF(bytes);
    if (shared == NULL) {
        return -1;
    }
    return 0;
}


/* script wrapper */

static int
verify_script(TyThreadState *tstate, PyCodeObject *co, int checked, int pure)
{
    // Make sure it isn't a closure and (optionally) doesn't use globals.
    TyObject *builtins = NULL;
    if (pure) {
        builtins = _TyEval_GetBuiltins(tstate);
        assert(builtins != NULL);
    }
    if (checked) {
        assert(_TyCode_VerifyStateless(tstate, co, NULL, NULL, builtins) == 0);
    }
    else if (_TyCode_VerifyStateless(tstate, co, NULL, NULL, builtins) < 0) {
        return -1;
    }
    // Make sure it doesn't have args.
    if (co->co_argcount > 0
        || co->co_posonlyargcount > 0
        || co->co_kwonlyargcount > 0
        || co->co_flags & (CO_VARARGS | CO_VARKEYWORDS))
    {
        _TyErr_SetString(tstate, TyExc_ValueError,
                         "code with args not supported");
        return -1;
    }
    // Make sure it doesn't return anything.
    if (!_TyCode_ReturnsOnlyNone(co)) {
        _TyErr_SetString(tstate, TyExc_ValueError,
                         "code that returns a value is not a script");
        return -1;
    }
    return 0;
}

static int
get_script_xidata(TyThreadState *tstate, TyObject *obj, int pure,
                  _PyXIData_t *xidata)
{
    // Get the corresponding code object.
    TyObject *code = NULL;
    int checked = 0;
    if (TyCode_Check(obj)) {
        code = obj;
        Ty_INCREF(code);
    }
    else if (TyFunction_Check(obj)) {
        code = TyFunction_GET_CODE(obj);
        assert(code != NULL);
        Ty_INCREF(code);
        if (pure) {
            if (_TyFunction_VerifyStateless(tstate, obj) < 0) {
                goto error;
            }
            checked = 1;
        }
    }
    else {
        const char *filename = "<script>";
        int optimize = 0;
        PyCompilerFlags cf = _PyCompilerFlags_INIT;
        cf.cf_flags = PyCF_SOURCE_IS_UTF8;
        TyObject *ref = NULL;
        const char *script = _Ty_SourceAsString(obj, "???", "???", &cf, &ref);
        if (script == NULL) {
            if (!_TyObject_SupportedAsScript(obj)) {
                // We discard the raised exception.
                _TyErr_Format(tstate, TyExc_TypeError,
                              "unsupported script %R", obj);
            }
            goto error;
        }
#ifdef Ty_GIL_DISABLED
        // Don't immortalize code constants to avoid memory leaks.
        ((_PyThreadStateImpl *)tstate)->suppress_co_const_immortalization++;
#endif
        code = Ty_CompileStringExFlags(
                    script, filename, Ty_file_input, &cf, optimize);
#ifdef Ty_GIL_DISABLED
        ((_PyThreadStateImpl *)tstate)->suppress_co_const_immortalization--;
#endif
        Ty_XDECREF(ref);
        if (code == NULL) {
            goto error;
        }
        // Compiled text can't have args or any return statements,
        // nor be a closure.  It can use globals though.
        if (!pure) {
            // We don't need to check for globals either.
            checked = 1;
        }
    }

    // Make sure it's actually a script.
    if (verify_script(tstate, (PyCodeObject *)code, checked, pure) < 0) {
        goto error;
    }

    // Convert the code object.
    int res = _TyCode_GetXIData(tstate, code, xidata);
    Ty_DECREF(code);
    if (res < 0) {
        return -1;
    }
    return 0;

error:
    Ty_XDECREF(code);
    TyObject *cause = _TyErr_GetRaisedException(tstate);
    assert(cause != NULL);
    _set_xid_lookup_failure(
                tstate, NULL, "object not a valid script", cause);
    Ty_DECREF(cause);
    return -1;
}

int
_TyCode_GetScriptXIData(TyThreadState *tstate,
                        TyObject *obj, _PyXIData_t *xidata)
{
    return get_script_xidata(tstate, obj, 0, xidata);
}

int
_TyCode_GetPureScriptXIData(TyThreadState *tstate,
                            TyObject *obj, _PyXIData_t *xidata)
{
    return get_script_xidata(tstate, obj, 1, xidata);
}


/* using cross-interpreter data */

TyObject *
_PyXIData_NewObject(_PyXIData_t *xidata)
{
    return xidata->new_object(xidata);
}

static int
_call_clear_xidata(void *data)
{
    _xidata_clear((_PyXIData_t *)data);
    return 0;
}

static int
_xidata_release(_PyXIData_t *xidata, int rawfree)
{
    if ((xidata->data == NULL || xidata->free == NULL) && xidata->obj == NULL) {
        // Nothing to release!
        if (rawfree) {
            TyMem_RawFree(xidata);
        }
        else {
            xidata->data = NULL;
        }
        return 0;
    }

    // Switch to the original interpreter.
    TyInterpreterState *interp = _TyInterpreterState_LookUpID(
                                        _PyXIData_INTERPID(xidata));
    if (interp == NULL) {
        // The interpreter was already destroyed.
        // This function shouldn't have been called.
        // XXX Someone leaked some memory...
        assert(TyErr_Occurred());
        if (rawfree) {
            TyMem_RawFree(xidata);
        }
        return -1;
    }

    // "Release" the data and/or the object.
    if (rawfree) {
        return _Ty_CallInInterpreterAndRawFree(interp, _call_clear_xidata, xidata);
    }
    else {
        return _Ty_CallInInterpreter(interp, _call_clear_xidata, xidata);
    }
}

int
_PyXIData_Release(_PyXIData_t *xidata)
{
    return _xidata_release(xidata, 0);
}

int
_PyXIData_ReleaseAndRawFree(_PyXIData_t *xidata)
{
    return _xidata_release(xidata, 1);
}


/*************************/
/* convenience utilities */
/*************************/

static const char *
_copy_string_obj_raw(TyObject *strobj, Ty_ssize_t *p_size)
{
    Ty_ssize_t size = -1;
    const char *str = TyUnicode_AsUTF8AndSize(strobj, &size);
    if (str == NULL) {
        return NULL;
    }

    if (size != (Ty_ssize_t)strlen(str)) {
        TyErr_SetString(TyExc_ValueError, "found embedded NULL character");
        return NULL;
    }

    char *copied = TyMem_RawMalloc(size+1);
    if (copied == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    strcpy(copied, str);
    if (p_size != NULL) {
        *p_size = size;
    }
    return copied;
}


static int
_convert_exc_to_TracebackException(TyObject *exc, TyObject **p_tbexc)
{
    TyObject *args = NULL;
    TyObject *kwargs = NULL;
    TyObject *create = NULL;

    // This is inspired by _TyErr_Display().
    TyObject *tbexc_type = TyImport_ImportModuleAttrString(
        "traceback",
        "TracebackException");
    if (tbexc_type == NULL) {
        return -1;
    }
    create = PyObject_GetAttrString(tbexc_type, "from_exception");
    Ty_DECREF(tbexc_type);
    if (create == NULL) {
        return -1;
    }

    args = TyTuple_Pack(1, exc);
    if (args == NULL) {
        goto error;
    }

    kwargs = TyDict_New();
    if (kwargs == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(kwargs, "save_exc_type", Ty_False) < 0) {
        goto error;
    }
    if (TyDict_SetItemString(kwargs, "lookup_lines", Ty_False) < 0) {
        goto error;
    }

    TyObject *tbexc = PyObject_Call(create, args, kwargs);
    Ty_DECREF(args);
    Ty_DECREF(kwargs);
    Ty_DECREF(create);
    if (tbexc == NULL) {
        goto error;
    }

    *p_tbexc = tbexc;
    return 0;

error:
    Ty_XDECREF(args);
    Ty_XDECREF(kwargs);
    Ty_XDECREF(create);
    return -1;
}

// We accommodate backports here.
#ifndef _Ty_EMPTY_STR
# define _Ty_EMPTY_STR &_Ty_STR(empty)
#endif

static const char *
_format_TracebackException(TyObject *tbexc)
{
    TyObject *lines = PyObject_CallMethod(tbexc, "format", NULL);
    if (lines == NULL) {
        return NULL;
    }
    assert(_Ty_EMPTY_STR != NULL);
    TyObject *formatted_obj = TyUnicode_Join(_Ty_EMPTY_STR, lines);
    Ty_DECREF(lines);
    if (formatted_obj == NULL) {
        return NULL;
    }

    Ty_ssize_t size = -1;
    const char *formatted = _copy_string_obj_raw(formatted_obj, &size);
    Ty_DECREF(formatted_obj);
    // We remove trailing the newline added by TracebackException.format().
    assert(formatted[size-1] == '\n');
    ((char *)formatted)[size-1] = '\0';
    return formatted;
}


static int
_release_xid_data(_PyXIData_t *xidata, int rawfree)
{
    TyObject *exc = TyErr_GetRaisedException();
    int res = rawfree
        ? _PyXIData_Release(xidata)
        : _PyXIData_ReleaseAndRawFree(xidata);
    if (res < 0) {
        /* The owning interpreter is already destroyed. */
        _PyXIData_Clear(NULL, xidata);
        // XXX Emit a warning?
        TyErr_Clear();
    }
    TyErr_SetRaisedException(exc);
    return res;
}


/***********************/
/* exception snapshots */
/***********************/

static int
_excinfo_init_type_from_exception(struct _excinfo_type *info, TyObject *exc)
{
    /* Note that this copies directly rather than into an intermediate
       struct and does not clear on error.  If we need that then we
       should have a separate function to wrap this one
       and do all that there. */
    TyObject *strobj = NULL;

    TyTypeObject *type = Ty_TYPE(exc);
    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        assert(_Ty_IsImmortal((TyObject *)type));
        info->builtin = type;
    }
    else {
        // Only builtin types are preserved.
        info->builtin = NULL;
    }

    // __name__
    strobj = TyType_GetName(type);
    if (strobj == NULL) {
        return -1;
    }
    info->name = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->name == NULL) {
        return -1;
    }

    // __qualname__
    strobj = TyType_GetQualName(type);
    if (strobj == NULL) {
        return -1;
    }
    info->qualname = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->qualname == NULL) {
        return -1;
    }

    // __module__
    strobj = TyType_GetModuleName(type);
    if (strobj == NULL) {
        return -1;
    }
    info->module = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->module == NULL) {
        return -1;
    }

    return 0;
}

static int
_excinfo_init_type_from_object(struct _excinfo_type *info, TyObject *exctype)
{
    TyObject *strobj = NULL;

    // __name__
    strobj = PyObject_GetAttrString(exctype, "__name__");
    if (strobj == NULL) {
        return -1;
    }
    info->name = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->name == NULL) {
        return -1;
    }

    // __qualname__
    strobj = PyObject_GetAttrString(exctype, "__qualname__");
    if (strobj == NULL) {
        return -1;
    }
    info->qualname = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->qualname == NULL) {
        return -1;
    }

    // __module__
    strobj = PyObject_GetAttrString(exctype, "__module__");
    if (strobj == NULL) {
        return -1;
    }
    info->module = _copy_string_obj_raw(strobj, NULL);
    Ty_DECREF(strobj);
    if (info->module == NULL) {
        return -1;
    }

    return 0;
}

static void
_excinfo_clear_type(struct _excinfo_type *info)
{
    if (info->builtin != NULL) {
        assert(info->builtin->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN);
        assert(_Ty_IsImmortal((TyObject *)info->builtin));
    }
    if (info->name != NULL) {
        TyMem_RawFree((void *)info->name);
    }
    if (info->qualname != NULL) {
        TyMem_RawFree((void *)info->qualname);
    }
    if (info->module != NULL) {
        TyMem_RawFree((void *)info->module);
    }
    *info = (struct _excinfo_type){NULL};
}

static void
_excinfo_normalize_type(struct _excinfo_type *info,
                        const char **p_module, const char **p_qualname)
{
    if (info->name == NULL) {
        assert(info->builtin == NULL);
        assert(info->qualname == NULL);
        assert(info->module == NULL);
        // This is inspired by TracebackException.format_exception_only().
        *p_module = NULL;
        *p_qualname = NULL;
        return;
    }

    const char *module = info->module;
    const char *qualname = info->qualname;
    if (qualname == NULL) {
        qualname = info->name;
    }
    assert(module != NULL);
    if (strcmp(module, "builtins") == 0) {
        module = NULL;
    }
    else if (strcmp(module, "__main__") == 0) {
        module = NULL;
    }
    *p_qualname = qualname;
    *p_module = module;
}

static int
excinfo_is_set(_PyXI_excinfo *info)
{
    return info->type.name != NULL || info->msg != NULL;
}

static void
_PyXI_excinfo_clear(_PyXI_excinfo *info)
{
    _excinfo_clear_type(&info->type);
    if (info->msg != NULL) {
        TyMem_RawFree((void *)info->msg);
    }
    if (info->errdisplay != NULL) {
        TyMem_RawFree((void *)info->errdisplay);
    }
    *info = (_PyXI_excinfo){{NULL}};
}

TyObject *
_PyXI_excinfo_format(_PyXI_excinfo *info)
{
    const char *module, *qualname;
    _excinfo_normalize_type(&info->type, &module, &qualname);
    if (qualname != NULL) {
        if (module != NULL) {
            if (info->msg != NULL) {
                return TyUnicode_FromFormat("%s.%s: %s",
                                            module, qualname, info->msg);
            }
            else {
                return TyUnicode_FromFormat("%s.%s", module, qualname);
            }
        }
        else {
            if (info->msg != NULL) {
                return TyUnicode_FromFormat("%s: %s", qualname, info->msg);
            }
            else {
                return TyUnicode_FromString(qualname);
            }
        }
    }
    else if (info->msg != NULL) {
        return TyUnicode_FromString(info->msg);
    }
    else {
        Py_RETURN_NONE;
    }
}

static const char *
_PyXI_excinfo_InitFromException(_PyXI_excinfo *info, TyObject *exc)
{
    assert(exc != NULL);

    if (TyErr_GivenExceptionMatches(exc, TyExc_MemoryError)) {
        _PyXI_excinfo_clear(info);
        return NULL;
    }
    const char *failure = NULL;

    if (_excinfo_init_type_from_exception(&info->type, exc) < 0) {
        failure = "error while initializing exception type snapshot";
        goto error;
    }

    // Extract the exception message.
    TyObject *msgobj = PyObject_Str(exc);
    if (msgobj == NULL) {
        failure = "error while formatting exception";
        goto error;
    }
    info->msg = _copy_string_obj_raw(msgobj, NULL);
    Ty_DECREF(msgobj);
    if (info->msg == NULL) {
        failure = "error while copying exception message";
        goto error;
    }

    // Pickle a traceback.TracebackException.
    TyObject *tbexc = NULL;
    if (_convert_exc_to_TracebackException(exc, &tbexc) < 0) {
#ifdef Ty_DEBUG
        TyErr_FormatUnraisable("Exception ignored while creating TracebackException");
#endif
        TyErr_Clear();
    }
    else {
        info->errdisplay = _format_TracebackException(tbexc);
        Ty_DECREF(tbexc);
        if (info->errdisplay == NULL) {
#ifdef Ty_DEBUG
            TyErr_FormatUnraisable("Exception ignored while formatting TracebackException");
#endif
            TyErr_Clear();
        }
    }

    return NULL;

error:
    assert(failure != NULL);
    _PyXI_excinfo_clear(info);
    return failure;
}

static const char *
_PyXI_excinfo_InitFromObject(_PyXI_excinfo *info, TyObject *obj)
{
    const char *failure = NULL;

    TyObject *exctype = PyObject_GetAttrString(obj, "type");
    if (exctype == NULL) {
        failure = "exception snapshot missing 'type' attribute";
        goto error;
    }
    int res = _excinfo_init_type_from_object(&info->type, exctype);
    Ty_DECREF(exctype);
    if (res < 0) {
        failure = "error while initializing exception type snapshot";
        goto error;
    }

    // Extract the exception message.
    TyObject *msgobj = PyObject_GetAttrString(obj, "msg");
    if (msgobj == NULL) {
        failure = "exception snapshot missing 'msg' attribute";
        goto error;
    }
    info->msg = _copy_string_obj_raw(msgobj, NULL);
    Ty_DECREF(msgobj);
    if (info->msg == NULL) {
        failure = "error while copying exception message";
        goto error;
    }

    // Pickle a traceback.TracebackException.
    TyObject *errdisplay = PyObject_GetAttrString(obj, "errdisplay");
    if (errdisplay == NULL) {
        failure = "exception snapshot missing 'errdisplay' attribute";
        goto error;
    }
    info->errdisplay = _copy_string_obj_raw(errdisplay, NULL);
    Ty_DECREF(errdisplay);
    if (info->errdisplay == NULL) {
        failure = "error while copying exception error display";
        goto error;
    }

    return NULL;

error:
    assert(failure != NULL);
    _PyXI_excinfo_clear(info);
    return failure;
}

static void
_PyXI_excinfo_Apply(_PyXI_excinfo *info, TyObject *exctype)
{
    TyObject *tbexc = NULL;
    if (info->errdisplay != NULL) {
        tbexc = TyUnicode_FromString(info->errdisplay);
        if (tbexc == NULL) {
            TyErr_Clear();
        }
        else {
            TyErr_SetObject(exctype, tbexc);
            Ty_DECREF(tbexc);
            return;
        }
    }

    TyObject *formatted = _PyXI_excinfo_format(info);
    TyErr_SetObject(exctype, formatted);
    Ty_DECREF(formatted);

    if (tbexc != NULL) {
        TyObject *exc = TyErr_GetRaisedException();
        if (PyObject_SetAttrString(exc, "_errdisplay", tbexc) < 0) {
#ifdef Ty_DEBUG
            TyErr_FormatUnraisable("Exception ignored while "
                                   "setting _errdisplay");
#endif
            TyErr_Clear();
        }
        Ty_DECREF(tbexc);
        TyErr_SetRaisedException(exc);
    }
}

static TyObject *
_PyXI_excinfo_TypeAsObject(_PyXI_excinfo *info)
{
    TyObject *ns = _PyNamespace_New(NULL);
    if (ns == NULL) {
        return NULL;
    }
    int empty = 1;

    if (info->type.name != NULL) {
        TyObject *name = TyUnicode_FromString(info->type.name);
        if (name == NULL) {
            goto error;
        }
        int res = PyObject_SetAttrString(ns, "__name__", name);
        Ty_DECREF(name);
        if (res < 0) {
            goto error;
        }
        empty = 0;
    }

    if (info->type.qualname != NULL) {
        TyObject *qualname = TyUnicode_FromString(info->type.qualname);
        if (qualname == NULL) {
            goto error;
        }
        int res = PyObject_SetAttrString(ns, "__qualname__", qualname);
        Ty_DECREF(qualname);
        if (res < 0) {
            goto error;
        }
        empty = 0;
    }

    if (info->type.module != NULL) {
        TyObject *module = TyUnicode_FromString(info->type.module);
        if (module == NULL) {
            goto error;
        }
        int res = PyObject_SetAttrString(ns, "__module__", module);
        Ty_DECREF(module);
        if (res < 0) {
            goto error;
        }
        empty = 0;
    }

    if (empty) {
        Ty_CLEAR(ns);
    }

    return ns;

error:
    Ty_DECREF(ns);
    return NULL;
}

static TyObject *
_PyXI_excinfo_AsObject(_PyXI_excinfo *info)
{
    TyObject *ns = _PyNamespace_New(NULL);
    if (ns == NULL) {
        return NULL;
    }
    int res;

    TyObject *type = _PyXI_excinfo_TypeAsObject(info);
    if (type == NULL) {
        if (TyErr_Occurred()) {
            goto error;
        }
        type = Ty_NewRef(Ty_None);
    }
    res = PyObject_SetAttrString(ns, "type", type);
    Ty_DECREF(type);
    if (res < 0) {
        goto error;
    }

    TyObject *msg = info->msg != NULL
        ? TyUnicode_FromString(info->msg)
        : Ty_NewRef(Ty_None);
    if (msg == NULL) {
        goto error;
    }
    res = PyObject_SetAttrString(ns, "msg", msg);
    Ty_DECREF(msg);
    if (res < 0) {
        goto error;
    }

    TyObject *formatted = _PyXI_excinfo_format(info);
    if (formatted == NULL) {
        goto error;
    }
    res = PyObject_SetAttrString(ns, "formatted", formatted);
    Ty_DECREF(formatted);
    if (res < 0) {
        goto error;
    }

    if (info->errdisplay != NULL) {
        TyObject *tbexc = TyUnicode_FromString(info->errdisplay);
        if (tbexc == NULL) {
            TyErr_Clear();
        }
        else {
            res = PyObject_SetAttrString(ns, "errdisplay", tbexc);
            Ty_DECREF(tbexc);
            if (res < 0) {
                goto error;
            }
        }
    }

    return ns;

error:
    Ty_DECREF(ns);
    return NULL;
}


_PyXI_excinfo *
_PyXI_NewExcInfo(TyObject *exc)
{
    assert(!TyErr_Occurred());
    if (exc == NULL || exc == Ty_None) {
        TyErr_SetString(TyExc_ValueError, "missing exc");
        return NULL;
    }
    _PyXI_excinfo *info = TyMem_RawCalloc(1, sizeof(_PyXI_excinfo));
    if (info == NULL) {
        return NULL;
    }
    const char *failure;
    if (PyExceptionInstance_Check(exc) || PyExceptionClass_Check(exc)) {
        failure = _PyXI_excinfo_InitFromException(info, exc);
    }
    else {
        failure = _PyXI_excinfo_InitFromObject(info, exc);
    }
    if (failure != NULL) {
        TyMem_RawFree(info);
        set_exc_with_cause(TyExc_Exception, failure);
        return NULL;
    }
    return info;
}

void
_PyXI_FreeExcInfo(_PyXI_excinfo *info)
{
    _PyXI_excinfo_clear(info);
    TyMem_RawFree(info);
}

TyObject *
_PyXI_FormatExcInfo(_PyXI_excinfo *info)
{
    return _PyXI_excinfo_format(info);
}

TyObject *
_PyXI_ExcInfoAsObject(_PyXI_excinfo *info)
{
    return _PyXI_excinfo_AsObject(info);
}


/***************************/
/* short-term data sharing */
/***************************/

/* error codes */

static int
_PyXI_ApplyErrorCode(_PyXI_errcode code, TyInterpreterState *interp)
{
    TyThreadState *tstate = _TyThreadState_GET();

    assert(!TyErr_Occurred());
    assert(code != _PyXI_ERR_NO_ERROR);
    assert(code != _PyXI_ERR_UNCAUGHT_EXCEPTION);
    switch (code) {
    case _PyXI_ERR_OTHER:
        // XXX msg?
        TyErr_SetNone(TyExc_InterpreterError);
        break;
    case _PyXI_ERR_NO_MEMORY:
        TyErr_NoMemory();
        break;
    case _PyXI_ERR_ALREADY_RUNNING:
        assert(interp != NULL);
        _TyErr_SetInterpreterAlreadyRunning();
        break;
    case _PyXI_ERR_MAIN_NS_FAILURE:
        TyErr_SetString(TyExc_InterpreterError,
                        "failed to get __main__ namespace");
        break;
    case _PyXI_ERR_APPLY_NS_FAILURE:
        TyErr_SetString(TyExc_InterpreterError,
                        "failed to apply namespace to __main__");
        break;
    case _PyXI_ERR_PRESERVE_FAILURE:
        TyErr_SetString(TyExc_InterpreterError,
                        "failed to preserve objects across session");
        break;
    case _PyXI_ERR_EXC_PROPAGATION_FAILURE:
        TyErr_SetString(TyExc_InterpreterError,
                        "failed to transfer exception between interpreters");
        break;
    case _PyXI_ERR_NOT_SHAREABLE:
        _set_xid_lookup_failure(tstate, NULL, NULL, NULL);
        break;
    default:
#ifdef Ty_DEBUG
        Ty_FatalError("unsupported error code");
#else
        TyErr_Format(TyExc_RuntimeError, "unsupported error code %d", code);
#endif
    }
    assert(TyErr_Occurred());
    return -1;
}

/* basic failure info */

struct xi_failure {
    // The kind of error to propagate.
    _PyXI_errcode code;
    // The propagated message.
    const char *msg;
    int msg_owned;
};  // _PyXI_failure

#define XI_FAILURE_INIT (_PyXI_failure){ .code = _PyXI_ERR_NO_ERROR }

static void
clear_xi_failure(_PyXI_failure *failure)
{
    if (failure->msg != NULL && failure->msg_owned) {
        TyMem_RawFree((void*)failure->msg);
    }
    *failure = XI_FAILURE_INIT;
}

static void
copy_xi_failure(_PyXI_failure *dest, _PyXI_failure *src)
{
    *dest = *src;
    dest->msg_owned = 0;
}

_PyXI_failure *
_PyXI_NewFailure(void)
{
    _PyXI_failure *failure = TyMem_RawMalloc(sizeof(_PyXI_failure));
    if (failure == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    *failure = XI_FAILURE_INIT;
    return failure;
}

void
_PyXI_FreeFailure(_PyXI_failure *failure)
{
    clear_xi_failure(failure);
    TyMem_RawFree(failure);
}

_PyXI_errcode
_PyXI_GetFailureCode(_PyXI_failure *failure)
{
    if (failure == NULL) {
        return _PyXI_ERR_NO_ERROR;
    }
    return failure->code;
}

void
_PyXI_InitFailureUTF8(_PyXI_failure *failure,
                      _PyXI_errcode code, const char *msg)
{
    *failure = (_PyXI_failure){
        .code = code,
        .msg = msg,
        .msg_owned = 0,
    };
}

int
_PyXI_InitFailure(_PyXI_failure *failure, _PyXI_errcode code, TyObject *obj)
{
    TyObject *msgobj = PyObject_Str(obj);
    if (msgobj == NULL) {
        return -1;
    }
    // This will leak if not paired with clear_xi_failure().
    // That happens automatically in _capture_current_exception().
    const char *msg = _copy_string_obj_raw(msgobj, NULL);
    Ty_DECREF(msgobj);
    if (TyErr_Occurred()) {
        return -1;
    }
    *failure = (_PyXI_failure){
        .code = code,
        .msg = msg,
        .msg_owned = 1,
    };
    return 0;
}

/* shared exceptions */

typedef struct {
    // The originating interpreter.
    TyInterpreterState *interp;
    // The error to propagate, if different from the uncaught exception.
    _PyXI_failure *override;
    _PyXI_failure _override;
    // The exception information to propagate, if applicable.
    // This is populated only for some error codes,
    // but always for _PyXI_ERR_UNCAUGHT_EXCEPTION.
    _PyXI_excinfo uncaught;
} _PyXI_error;

static void
xi_error_clear(_PyXI_error *err)
{
    err->interp = NULL;
    if (err->override != NULL) {
        clear_xi_failure(err->override);
    }
    _PyXI_excinfo_clear(&err->uncaught);
}

static int
xi_error_is_set(_PyXI_error *error)
{
    if (error->override != NULL) {
        assert(error->override->code != _PyXI_ERR_NO_ERROR);
        assert(error->override->code != _PyXI_ERR_UNCAUGHT_EXCEPTION
               || excinfo_is_set(&error->uncaught));
        return 1;
    }
    return excinfo_is_set(&error->uncaught);
}

static int
xi_error_has_override(_PyXI_error *err)
{
    if (err->override == NULL) {
        return 0;
    }
    return (err->override->code != _PyXI_ERR_NO_ERROR
            && err->override->code != _PyXI_ERR_UNCAUGHT_EXCEPTION);
}

static TyObject *
xi_error_resolve_current_exc(TyThreadState *tstate,
                             _PyXI_failure *override)
{
    assert(override == NULL || override->code != _PyXI_ERR_NO_ERROR);

    TyObject *exc = _TyErr_GetRaisedException(tstate);
    if (exc == NULL) {
        assert(override == NULL
               || override->code != _PyXI_ERR_UNCAUGHT_EXCEPTION);
    }
    else if (override == NULL) {
        // This is equivalent to _PyXI_ERR_UNCAUGHT_EXCEPTION.
    }
    else if (override->code == _PyXI_ERR_UNCAUGHT_EXCEPTION) {
        // We want to actually capture the current exception.
    }
    else if (exc != NULL) {
        // It might make sense to do similarly for other codes.
        if (override->code == _PyXI_ERR_ALREADY_RUNNING) {
            // We don't need the exception info.
            Ty_CLEAR(exc);
        }
        // ...else we want to actually capture the current exception.
    }
    return exc;
}

static void
xi_error_set_override(TyThreadState *tstate, _PyXI_error *err,
                      _PyXI_failure *override)
{
    assert(err->override == NULL);
    assert(override != NULL);
    assert(override->code != _PyXI_ERR_NO_ERROR);
    // Use xi_error_set_exc() instead of setting _PyXI_ERR_UNCAUGHT_EXCEPTION..
    assert(override->code != _PyXI_ERR_UNCAUGHT_EXCEPTION);
    err->override = &err->_override;
    // The caller still owns override->msg.
    copy_xi_failure(&err->_override, override);
    err->interp = tstate->interp;
}

static void
xi_error_set_override_code(TyThreadState *tstate, _PyXI_error *err,
                           _PyXI_errcode code)
{
    _PyXI_failure override = XI_FAILURE_INIT;
    override.code = code;
    xi_error_set_override(tstate, err, &override);
}

static const char *
xi_error_set_exc(TyThreadState *tstate, _PyXI_error *err, TyObject *exc)
{
    assert(!_TyErr_Occurred(tstate));
    assert(!xi_error_is_set(err));
    assert(err->override == NULL);
    assert(err->interp == NULL);
    assert(exc != NULL);
    const char *failure =
                _PyXI_excinfo_InitFromException(&err->uncaught, exc);
    if (failure != NULL) {
        // We failed to initialize err->uncaught.
        // XXX Print the excobj/traceback?  Emit a warning?
        // XXX Print the current exception/traceback?
        if (_TyErr_ExceptionMatches(tstate, TyExc_MemoryError)) {
            xi_error_set_override_code(tstate, err, _PyXI_ERR_NO_MEMORY);
        }
        else {
            xi_error_set_override_code(tstate, err, _PyXI_ERR_OTHER);
        }
        TyErr_Clear();
    }
    return failure;
}

static TyObject *
_PyXI_ApplyError(_PyXI_error *error, const char *failure)
{
    TyThreadState *tstate = TyThreadState_Get();

    if (failure != NULL) {
        xi_error_clear(error);
        return NULL;
    }

    _PyXI_errcode code = _PyXI_ERR_UNCAUGHT_EXCEPTION;
    if (error->override != NULL) {
        code = error->override->code;
        assert(code != _PyXI_ERR_NO_ERROR);
    }

    if (code == _PyXI_ERR_UNCAUGHT_EXCEPTION) {
        // We will raise an exception that proxies the propagated exception.
       return _PyXI_excinfo_AsObject(&error->uncaught);
    }
    else if (code == _PyXI_ERR_NOT_SHAREABLE) {
        // Propagate the exception directly.
        assert(!_TyErr_Occurred(tstate));
        TyObject *cause = NULL;
        if (excinfo_is_set(&error->uncaught)) {
            // Maybe instead set a TyExc_ExceptionSnapshot as __cause__?
            // That type doesn't exist currently
            // but would look like interpreters.ExecutionFailed.
            _PyXI_excinfo_Apply(&error->uncaught, TyExc_Exception);
            cause = _TyErr_GetRaisedException(tstate);
        }
        const char *msg = error->override != NULL
            ? error->override->msg
            : error->uncaught.msg;
        _set_xid_lookup_failure(tstate, NULL, msg, cause);
        Ty_XDECREF(cause);
    }
    else {
        // Raise an exception corresponding to the code.
        (void)_PyXI_ApplyErrorCode(code, error->interp);
        assert(error->override == NULL || error->override->msg == NULL);
        if (excinfo_is_set(&error->uncaught)) {
            // __context__ will be set to a proxy of the propagated exception.
            // (or use TyExc_ExceptionSnapshot like _PyXI_ERR_NOT_SHAREABLE?)
            TyObject *exc = _TyErr_GetRaisedException(tstate);
            _PyXI_excinfo_Apply(&error->uncaught, TyExc_InterpreterError);
            TyObject *exc2 = _TyErr_GetRaisedException(tstate);
            PyException_SetContext(exc, exc2);
            _TyErr_SetRaisedException(tstate, exc);
        }
    }
    assert(TyErr_Occurred());
    return NULL;
}

/* shared namespaces */

/* Shared namespaces are expected to have relatively short lifetimes.
   This means dealloc of a shared namespace will normally happen "soon".
   Namespace items hold cross-interpreter data, which must get released.
   If the namespace/items are cleared in a different interpreter than
   where the items' cross-interpreter data was set then that will cause
   pending calls to be used to release the cross-interpreter data.
   The tricky bit is that the pending calls can happen sufficiently
   later that the namespace/items might already be deallocated.  This is
   a problem if the cross-interpreter data is allocated as part of a
   namespace item.  If that's the case then we must ensure the shared
   namespace is only cleared/freed *after* that data has been released. */

typedef struct _sharednsitem {
    const char *name;
    _PyXIData_t *xidata;
    // We could have a "PyXIData _data" field, so it would
    // be allocated as part of the item and avoid an extra allocation.
    // However, doing so adds a bunch of complexity because we must
    // ensure the item isn't freed before a pending call might happen
    // in a different interpreter to release the XI data.
} _PyXI_namespace_item;

#ifndef NDEBUG
static int
_sharednsitem_is_initialized(_PyXI_namespace_item *item)
{
    if (item->name != NULL) {
        return 1;
    }
    return 0;
}
#endif

static int
_sharednsitem_init(_PyXI_namespace_item *item, TyObject *key)
{
    item->name = _copy_string_obj_raw(key, NULL);
    if (item->name == NULL) {
        assert(!_sharednsitem_is_initialized(item));
        return -1;
    }
    item->xidata = NULL;
    assert(_sharednsitem_is_initialized(item));
    return 0;
}

static int
_sharednsitem_has_value(_PyXI_namespace_item *item, int64_t *p_interpid)
{
    if (item->xidata == NULL) {
        return 0;
    }
    if (p_interpid != NULL) {
        *p_interpid = _PyXIData_INTERPID(item->xidata);
    }
    return 1;
}

static int
_sharednsitem_set_value(_PyXI_namespace_item *item, TyObject *value,
                        xidata_fallback_t fallback)
{
    assert(_sharednsitem_is_initialized(item));
    assert(item->xidata == NULL);
    item->xidata = _PyXIData_New();
    if (item->xidata == NULL) {
        return -1;
    }
    TyThreadState *tstate = TyThreadState_Get();
    if (_TyObject_GetXIData(tstate, value, fallback, item->xidata) < 0) {
        TyMem_RawFree(item->xidata);
        item->xidata = NULL;
        // The caller may want to propagate TyExc_NotShareableError
        // if currently switched between interpreters.
        return -1;
    }
    return 0;
}

static void
_sharednsitem_clear_value(_PyXI_namespace_item *item)
{
    _PyXIData_t *xidata = item->xidata;
    if (xidata != NULL) {
        item->xidata = NULL;
        int rawfree = 1;
        (void)_release_xid_data(xidata, rawfree);
    }
}

static void
_sharednsitem_clear(_PyXI_namespace_item *item)
{
    if (item->name != NULL) {
        TyMem_RawFree((void *)item->name);
        item->name = NULL;
    }
    _sharednsitem_clear_value(item);
}

static int
_sharednsitem_copy_from_ns(struct _sharednsitem *item, TyObject *ns,
                           xidata_fallback_t fallback)
{
    assert(item->name != NULL);
    assert(item->xidata == NULL);
    TyObject *value = TyDict_GetItemString(ns, item->name);  // borrowed
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        // When applied, this item will be set to the default (or fail).
        return 0;
    }
    if (_sharednsitem_set_value(item, value, fallback) < 0) {
        return -1;
    }
    return 0;
}

static int
_sharednsitem_apply(_PyXI_namespace_item *item, TyObject *ns, TyObject *dflt)
{
    TyObject *name = TyUnicode_FromString(item->name);
    if (name == NULL) {
        return -1;
    }
    TyObject *value;
    if (item->xidata != NULL) {
        value = _PyXIData_NewObject(item->xidata);
        if (value == NULL) {
            Ty_DECREF(name);
            return -1;
        }
    }
    else {
        value = Ty_NewRef(dflt);
    }
    int res = TyDict_SetItem(ns, name, value);
    Ty_DECREF(name);
    Ty_DECREF(value);
    return res;
}


typedef struct {
    Ty_ssize_t maxitems;
    Ty_ssize_t numnames;
    Ty_ssize_t numvalues;
    _PyXI_namespace_item items[1];
} _PyXI_namespace;

#ifndef NDEBUG
static int
_sharedns_check_counts(_PyXI_namespace *ns)
{
    if (ns->maxitems <= 0) {
        return 0;
    }
    if (ns->numnames < 0) {
        return 0;
    }
    if (ns->numnames > ns->maxitems) {
        return 0;
    }
    if (ns->numvalues < 0) {
        return 0;
    }
    if (ns->numvalues > ns->numnames) {
        return 0;
    }
    return 1;
}

static int
_sharedns_check_consistency(_PyXI_namespace *ns)
{
    if (!_sharedns_check_counts(ns)) {
        return 0;
    }

    Ty_ssize_t i = 0;
    _PyXI_namespace_item *item;
    if (ns->numvalues > 0) {
        item = &ns->items[0];
        if (!_sharednsitem_is_initialized(item)) {
            return 0;
        }
        int64_t interpid0 = -1;
        if (!_sharednsitem_has_value(item, &interpid0)) {
            return 0;
        }
        i += 1;
        for (; i < ns->numvalues; i++) {
            item = &ns->items[i];
            if (!_sharednsitem_is_initialized(item)) {
                return 0;
            }
            int64_t interpid = -1;
            if (!_sharednsitem_has_value(item, &interpid)) {
                return 0;
            }
            if (interpid != interpid0) {
                return 0;
            }
        }
    }
    for (; i < ns->numnames; i++) {
        item = &ns->items[i];
        if (!_sharednsitem_is_initialized(item)) {
            return 0;
        }
        if (_sharednsitem_has_value(item, NULL)) {
            return 0;
        }
    }
    for (; i < ns->maxitems; i++) {
        item = &ns->items[i];
        if (_sharednsitem_is_initialized(item)) {
            return 0;
        }
        if (_sharednsitem_has_value(item, NULL)) {
            return 0;
        }
    }
    return 1;
}
#endif

static _PyXI_namespace *
_sharedns_alloc(Ty_ssize_t maxitems)
{
    if (maxitems < 0) {
        if (!TyErr_Occurred()) {
            TyErr_BadInternalCall();
        }
        return NULL;
    }
    else if (maxitems == 0) {
        TyErr_SetString(TyExc_ValueError, "empty namespaces not allowed");
        return NULL;
    }

    // Check for overflow.
    size_t fixedsize = sizeof(_PyXI_namespace) - sizeof(_PyXI_namespace_item);
    if ((size_t)maxitems >
        ((size_t)PY_SSIZE_T_MAX - fixedsize) / sizeof(_PyXI_namespace_item))
    {
        TyErr_NoMemory();
        return NULL;
    }

    // Allocate the value, including items.
    size_t size = fixedsize + sizeof(_PyXI_namespace_item) * maxitems;

    _PyXI_namespace *ns = TyMem_RawCalloc(size, 1);
    if (ns == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    ns->maxitems = maxitems;
    assert(_sharedns_check_consistency(ns));
    return ns;
}

static void
_sharedns_free(_PyXI_namespace *ns)
{
    // If we weren't always dynamically allocating the cross-interpreter
    // data in each item then we would need to use a pending call
    // to call _sharedns_free(), to avoid the race between freeing
    // the shared namespace and releasing the XI data.
    assert(_sharedns_check_counts(ns));
    Ty_ssize_t i = 0;
    _PyXI_namespace_item *item;
    if (ns->numvalues > 0) {
        // One or more items may have interpreter-specific data.
#ifndef NDEBUG
        int64_t interpid = TyInterpreterState_GetID(TyInterpreterState_Get());
        int64_t interpid_i;
#endif
        for (; i < ns->numvalues; i++) {
            item = &ns->items[i];
            assert(_sharednsitem_is_initialized(item));
            // While we do want to ensure consistency across items,
            // technically they don't need to match the current
            // interpreter.  However, we keep the constraint for
            // simplicity, by giving _PyXI_FreeNamespace() the exclusive
            // responsibility of dealing with the owning interpreter.
            assert(_sharednsitem_has_value(item, &interpid_i));
            assert(interpid_i == interpid);
            _sharednsitem_clear(item);
        }
    }
    for (; i < ns->numnames; i++) {
        item = &ns->items[i];
        assert(_sharednsitem_is_initialized(item));
        assert(!_sharednsitem_has_value(item, NULL));
        _sharednsitem_clear(item);
    }
#ifndef NDEBUG
    for (; i < ns->maxitems; i++) {
        item = &ns->items[i];
        assert(!_sharednsitem_is_initialized(item));
        assert(!_sharednsitem_has_value(item, NULL));
    }
#endif

    TyMem_RawFree(ns);
}

static _PyXI_namespace *
_create_sharedns(TyObject *names)
{
    assert(names != NULL);
    Ty_ssize_t numnames = TyDict_CheckExact(names)
        ? TyDict_Size(names)
        : PySequence_Size(names);

    _PyXI_namespace *ns = _sharedns_alloc(numnames);
    if (ns == NULL) {
        return NULL;
    }
    _PyXI_namespace_item *items = ns->items;

    // Fill in the names.
    if (TyDict_CheckExact(names)) {
        Ty_ssize_t i = 0;
        Ty_ssize_t pos = 0;
        TyObject *name;
        while(TyDict_Next(names, &pos, &name, NULL)) {
            if (_sharednsitem_init(&items[i], name) < 0) {
                goto error;
            }
            ns->numnames += 1;
            i += 1;
        }
    }
    else if (PySequence_Check(names)) {
        for (Ty_ssize_t i = 0; i < numnames; i++) {
            TyObject *name = PySequence_GetItem(names, i);
            if (name == NULL) {
                goto error;
            }
            int res = _sharednsitem_init(&items[i], name);
            Ty_DECREF(name);
            if (res < 0) {
                goto error;
            }
            ns->numnames += 1;
        }
    }
    else {
        TyErr_SetString(TyExc_NotImplementedError,
                        "non-sequence namespace not supported");
        goto error;
    }
    assert(ns->numnames == ns->maxitems);
    return ns;

error:
    _sharedns_free(ns);
    return NULL;
}

static void _propagate_not_shareable_error(TyThreadState *,
                                           _PyXI_failure *);

static int
_fill_sharedns(_PyXI_namespace *ns, TyObject *nsobj,
               xidata_fallback_t fallback, _PyXI_failure *p_err)
{
    // All items are expected to be shareable.
    assert(_sharedns_check_counts(ns));
    assert(ns->numnames == ns->maxitems);
    assert(ns->numvalues == 0);
    TyThreadState *tstate = TyThreadState_Get();
    for (Ty_ssize_t i=0; i < ns->maxitems; i++) {
        if (_sharednsitem_copy_from_ns(&ns->items[i], nsobj, fallback) < 0) {
            if (p_err != NULL) {
                _propagate_not_shareable_error(tstate, p_err);
            }
            // Clear out the ones we set so far.
            for (Ty_ssize_t j=0; j < i; j++) {
                _sharednsitem_clear_value(&ns->items[j]);
                ns->numvalues -= 1;
            }
            return -1;
        }
        ns->numvalues += 1;
    }
    return 0;
}

static int
_sharedns_free_pending(void *data)
{
    _sharedns_free((_PyXI_namespace *)data);
    return 0;
}

static void
_destroy_sharedns(_PyXI_namespace *ns)
{
    assert(_sharedns_check_counts(ns));
    assert(ns->numnames == ns->maxitems);
    if (ns->numvalues == 0) {
        _sharedns_free(ns);
        return;
    }

    int64_t interpid0;
    if (!_sharednsitem_has_value(&ns->items[0], &interpid0)) {
        // This shouldn't have been possible.
        // We can deal with it in _sharedns_free().
        _sharedns_free(ns);
        return;
    }
    TyInterpreterState *interp = _TyInterpreterState_LookUpID(interpid0);
    if (interp == TyInterpreterState_Get()) {
        _sharedns_free(ns);
        return;
    }

    // One or more items may have interpreter-specific data.
    // Currently the xidata for each value is dynamically allocated,
    // so technically we don't need to worry about that.
    // However, explicitly adding a pending call here is simpler.
    (void)_Ty_CallInInterpreter(interp, _sharedns_free_pending, ns);
}

static int
_apply_sharedns(_PyXI_namespace *ns, TyObject *nsobj, TyObject *dflt)
{
    for (Ty_ssize_t i=0; i < ns->maxitems; i++) {
        if (_sharednsitem_apply(&ns->items[i], nsobj, dflt) != 0) {
            return -1;
        }
    }
    return 0;
}


/*********************************/
/* switched-interpreter sessions */
/*********************************/

struct xi_session {
#define SESSION_UNUSED 0
#define SESSION_ACTIVE 1
    int status;
    int switched;

    // Once a session has been entered, this is the tstate that was
    // current before the session.  If it is different from cur_tstate
    // then we must have switched interpreters.  Either way, this will
    // be the current tstate once we exit the session.
    TyThreadState *prev_tstate;
    // Once a session has been entered, this is the current tstate.
    // It must be current when the session exits.
    TyThreadState *init_tstate;
    // This is true if init_tstate needs cleanup during exit.
    int own_init_tstate;

    // This is true if, while entering the session, init_thread took
    // "ownership" of the interpreter's __main__ module.  This means
    // it is the only thread that is allowed to run code there.
    // (Caveat: for now, users may still run exec() against the
    // __main__ module's dict, though that isn't advisable.)
    int running;
    // This is a cached reference to the __dict__ of the entered
    // interpreter's __main__ module.  It is looked up when at the
    // beginning of the session as a convenience.
    TyObject *main_ns;

    // This is a dict of objects that will be available (via sharing)
    // once the session exits.  Do not access this directly; use
    // _PyXI_Preserve() and _PyXI_GetPreserved() instead;
    TyObject *_preserved;
};

_PyXI_session *
_PyXI_NewSession(void)
{
    _PyXI_session *session = TyMem_RawCalloc(1, sizeof(_PyXI_session));
    if (session == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    return session;
}

void
_PyXI_FreeSession(_PyXI_session *session)
{
    assert(session->status == SESSION_UNUSED);
    TyMem_RawFree(session);
}


static inline int
_session_is_active(_PyXI_session *session)
{
    return session->status == SESSION_ACTIVE;
}


/* enter/exit a cross-interpreter session */

static void
_enter_session(_PyXI_session *session, TyInterpreterState *interp)
{
    // Set here and cleared in _exit_session().
    assert(session->status == SESSION_UNUSED);
    assert(!session->own_init_tstate);
    assert(session->init_tstate == NULL);
    assert(session->prev_tstate == NULL);
    // Set elsewhere and cleared in _exit_session().
    assert(!session->running);
    assert(session->main_ns == NULL);

    // Switch to interpreter.
    TyThreadState *tstate = TyThreadState_Get();
    TyThreadState *prev = tstate;
    int same_interp = (interp == tstate->interp);
    if (!same_interp) {
        tstate = _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_EXEC);
        // XXX Possible GILState issues?
        TyThreadState *swapped = TyThreadState_Swap(tstate);
        assert(swapped == prev);
        (void)swapped;
    }

    *session = (_PyXI_session){
        .status = SESSION_ACTIVE,
        .switched = !same_interp,
        .init_tstate = tstate,
        .prev_tstate = prev,
        .own_init_tstate = !same_interp,
    };
}

static void
_exit_session(_PyXI_session *session)
{
    TyThreadState *tstate = session->init_tstate;
    assert(tstate != NULL);
    assert(TyThreadState_Get() == tstate);
    assert(!_TyErr_Occurred(tstate));

    // Release any of the entered interpreters resources.
    Ty_CLEAR(session->main_ns);
    Ty_CLEAR(session->_preserved);

    // Ensure this thread no longer owns __main__.
    if (session->running) {
        _TyInterpreterState_SetNotRunningMain(tstate->interp);
        assert(!_TyErr_Occurred(tstate));
        session->running = 0;
    }

    // Switch back.
    assert(session->prev_tstate != NULL);
    if (session->prev_tstate != session->init_tstate) {
        assert(session->own_init_tstate);
        session->own_init_tstate = 0;
        TyThreadState_Clear(tstate);
        TyThreadState_Swap(session->prev_tstate);
        TyThreadState_Delete(tstate);
    }
    else {
        assert(!session->own_init_tstate);
    }

    *session = (_PyXI_session){0};
}

static void
_propagate_not_shareable_error(TyThreadState *tstate,
                               _PyXI_failure *override)
{
    assert(override != NULL);
    TyObject *exctype = get_notshareableerror_type(tstate);
    if (exctype == NULL) {
        TyErr_FormatUnraisable(
                "Exception ignored while propagating not shareable error");
        return;
    }
    if (TyErr_ExceptionMatches(exctype)) {
        // We want to propagate the exception directly.
        *override = (_PyXI_failure){
            .code = _PyXI_ERR_NOT_SHAREABLE,
        };
    }
}


static int _ensure_main_ns(_PyXI_session *, _PyXI_failure *);
static const char * capture_session_error(_PyXI_session *, _PyXI_error *,
                                          _PyXI_failure *);

int
_PyXI_Enter(_PyXI_session *session,
            TyInterpreterState *interp, TyObject *nsupdates,
            _PyXI_session_result *result)
{
#ifndef NDEBUG
    TyThreadState *tstate = _TyThreadState_GET();  // Only used for asserts
#endif

    // Convert the attrs for cross-interpreter use.
    _PyXI_namespace *sharedns = NULL;
    if (nsupdates != NULL) {
        assert(TyDict_Check(nsupdates));
        Ty_ssize_t len = TyDict_Size(nsupdates);
        if (len < 0) {
            if (result != NULL) {
                result->errcode = _PyXI_ERR_APPLY_NS_FAILURE;
            }
            return -1;
        }
        if (len > 0) {
            sharedns = _create_sharedns(nsupdates);
            if (sharedns == NULL) {
                if (result != NULL) {
                    result->errcode = _PyXI_ERR_APPLY_NS_FAILURE;
                }
                return -1;
            }
            // For now we limit it to shareable objects.
            xidata_fallback_t fallback = _PyXIDATA_XIDATA_ONLY;
            _PyXI_failure _err = XI_FAILURE_INIT;
            if (_fill_sharedns(sharedns, nsupdates, fallback, &_err) < 0) {
                assert(_TyErr_Occurred(tstate));
                if (_err.code == _PyXI_ERR_NO_ERROR) {
                    _err.code = _PyXI_ERR_UNCAUGHT_EXCEPTION;
                }
                _destroy_sharedns(sharedns);
                if (result != NULL) {
                    assert(_err.msg == NULL);
                    result->errcode = _err.code;
                }
                return -1;
            }
        }
    }

    // Switch to the requested interpreter (if necessary).
    _enter_session(session, interp);
    _PyXI_failure override = XI_FAILURE_INIT;
    override.code = _PyXI_ERR_UNCAUGHT_EXCEPTION;
#ifndef NDEBUG
    tstate = _TyThreadState_GET();
#endif

    // Ensure this thread owns __main__.
    if (_TyInterpreterState_SetRunningMain(interp) < 0) {
        // In the case where we didn't switch interpreters, it would
        // be more efficient to leave the exception in place and return
        // immediately.  However, life is simpler if we don't.
        override.code = _PyXI_ERR_ALREADY_RUNNING;
        goto error;
    }
    session->running = 1;

    // Apply the cross-interpreter data.
    if (sharedns != NULL) {
        if (_ensure_main_ns(session, &override) < 0) {
            goto error;
        }
        if (_apply_sharedns(sharedns, session->main_ns, NULL) < 0) {
            override.code = _PyXI_ERR_APPLY_NS_FAILURE;
            goto error;
        }
        _destroy_sharedns(sharedns);
    }

    override.code = _PyXI_ERR_NO_ERROR;
    assert(!_TyErr_Occurred(tstate));
    return 0;

error:
    // We want to propagate all exceptions here directly (best effort).
    assert(override.code != _PyXI_ERR_NO_ERROR);
    _PyXI_error err = {0};
    const char *failure = capture_session_error(session, &err, &override);

    // Exit the session.
    _exit_session(session);
#ifndef NDEBUG
    tstate = _TyThreadState_GET();
#endif

    if (sharedns != NULL) {
        _destroy_sharedns(sharedns);
    }

    // Apply the error from the other interpreter.
    TyObject *excinfo = _PyXI_ApplyError(&err, failure);
    xi_error_clear(&err);
    if (excinfo != NULL) {
        if (result != NULL) {
            result->excinfo = excinfo;
        }
        else {
#ifdef Ty_DEBUG
            fprintf(stderr, "_PyXI_Enter(): uncaught exception discarded");
#endif
            Ty_DECREF(excinfo);
        }
    }
    assert(_TyErr_Occurred(tstate));

    return -1;
}

static int _pop_preserved(_PyXI_session *, _PyXI_namespace **, TyObject **,
                          _PyXI_failure *);
static int _finish_preserved(_PyXI_namespace *, TyObject **);

int
_PyXI_Exit(_PyXI_session *session, _PyXI_failure *override,
           _PyXI_session_result *result)
{
    TyThreadState *tstate = _TyThreadState_GET();
    int res = 0;

    // Capture the raised exception, if any.
    _PyXI_error err = {0};
    const char *failure = NULL;
    if (override != NULL && override->code == _PyXI_ERR_NO_ERROR) {
        assert(override->msg == NULL);
        override = NULL;
    }
    if (_TyErr_Occurred(tstate)) {
        failure = capture_session_error(session, &err, override);
    }
    else {
        assert(override == NULL);
    }

    // Capture the preserved namespace.
    _PyXI_namespace *preserved = NULL;
    TyObject *preservedobj = NULL;
    if (result != NULL) {
        assert(!_TyErr_Occurred(tstate));
        _PyXI_failure _override = XI_FAILURE_INIT;
        if (_pop_preserved(
                    session, &preserved, &preservedobj, &_override) < 0)
        {
            assert(preserved == NULL);
            assert(preservedobj == NULL);
            if (xi_error_is_set(&err)) {
                // XXX Chain the exception (i.e. set __context__)?
                TyErr_FormatUnraisable(
                    "Exception ignored while capturing preserved objects");
                clear_xi_failure(&_override);
            }
            else {
                if (_override.code == _PyXI_ERR_NO_ERROR) {
                    _override.code = _PyXI_ERR_UNCAUGHT_EXCEPTION;
                }
                failure = capture_session_error(session, &err, &_override);
            }
        }
    }

    // Exit the session.
    assert(!_TyErr_Occurred(tstate));
    _exit_session(session);
    tstate = _TyThreadState_GET();

    // Restore the preserved namespace.
    assert(preserved == NULL || preservedobj == NULL);
    if (_finish_preserved(preserved, &preservedobj) < 0) {
        assert(preservedobj == NULL);
        if (xi_error_is_set(&err)) {
            // XXX Chain the exception (i.e. set __context__)?
            TyErr_FormatUnraisable(
                "Exception ignored while capturing preserved objects");
        }
        else {
            xi_error_set_override_code(
                            tstate, &err, _PyXI_ERR_PRESERVE_FAILURE);
            _propagate_not_shareable_error(tstate, err.override);
        }
    }
    if (result != NULL) {
        result->preserved = preservedobj;
        result->errcode = err.override != NULL
            ? err.override->code
            : _PyXI_ERR_NO_ERROR;
    }

    // Apply the error from the other interpreter, if any.
    if (xi_error_is_set(&err)) {
        res = -1;
        assert(!_TyErr_Occurred(tstate));
        TyObject *excinfo = _PyXI_ApplyError(&err, failure);
        if (excinfo == NULL) {
            assert(_TyErr_Occurred(tstate));
            if (result != NULL && !xi_error_has_override(&err)) {
                _PyXI_ClearResult(result);
                *result = (_PyXI_session_result){
                    .errcode = _PyXI_ERR_EXC_PROPAGATION_FAILURE,
                };
            }
        }
        else if (result != NULL) {
            result->excinfo = excinfo;
        }
        else {
#ifdef Ty_DEBUG
            fprintf(stderr, "_PyXI_Exit(): uncaught exception discarded");
#endif
            Ty_DECREF(excinfo);
        }
        xi_error_clear(&err);
    }
    return res;
}


/* in an active cross-interpreter session */

static const char *
capture_session_error(_PyXI_session *session, _PyXI_error *err,
                      _PyXI_failure *override)
{
    assert(_session_is_active(session));
    assert(!xi_error_is_set(err));
    TyThreadState *tstate = session->init_tstate;

    // Normalize the exception override.
    if (override != NULL) {
        if (override->code == _PyXI_ERR_UNCAUGHT_EXCEPTION) {
            assert(override->msg == NULL);
            override = NULL;
        }
        else {
            assert(override->code != _PyXI_ERR_NO_ERROR);
        }
    }

    // Handle the exception, if any.
    const char *failure = NULL;
    TyObject *exc = xi_error_resolve_current_exc(tstate, override);
    if (exc != NULL) {
        // There is an unhandled exception we need to preserve.
        failure = xi_error_set_exc(tstate, err, exc);
        Ty_DECREF(exc);
        if (_TyErr_Occurred(tstate)) {
            TyErr_FormatUnraisable(failure);
        }
    }

    // Handle the override.
    if (override != NULL && failure == NULL) {
        xi_error_set_override(tstate, err, override);
    }

    // Finished!
    assert(!_TyErr_Occurred(tstate));
    return failure;
}

static int
_ensure_main_ns(_PyXI_session *session, _PyXI_failure *failure)
{
    assert(_session_is_active(session));
    TyThreadState *tstate = session->init_tstate;
    if (session->main_ns != NULL) {
        return 0;
    }
    // Cache __main__.__dict__.
    TyObject *main_mod = _Ty_GetMainModule(tstate);
    if (_Ty_CheckMainModule(main_mod) < 0) {
        Ty_XDECREF(main_mod);
        if (failure != NULL) {
            *failure = (_PyXI_failure){
                .code = _PyXI_ERR_MAIN_NS_FAILURE,
            };
        }
        return -1;
    }
    TyObject *ns = TyModule_GetDict(main_mod);  // borrowed
    Ty_DECREF(main_mod);
    if (ns == NULL) {
        if (failure != NULL) {
            *failure = (_PyXI_failure){
                .code = _PyXI_ERR_MAIN_NS_FAILURE,
            };
        }
        return -1;
    }
    session->main_ns = Ty_NewRef(ns);
    return 0;
}

TyObject *
_PyXI_GetMainNamespace(_PyXI_session *session, _PyXI_failure *failure)
{
    if (!_session_is_active(session)) {
        TyErr_SetString(TyExc_RuntimeError, "session not active");
        return NULL;
    }
    if (_ensure_main_ns(session, failure) < 0) {
        return NULL;
    }
    return session->main_ns;
}


static int
_pop_preserved(_PyXI_session *session,
               _PyXI_namespace **p_xidata, TyObject **p_obj,
               _PyXI_failure *p_failure)
{
    _PyXI_failure failure = XI_FAILURE_INIT;
    _PyXI_namespace *xidata = NULL;
    assert(_TyThreadState_GET() == session->init_tstate);  // active session

    if (session->_preserved == NULL) {
        *p_xidata = NULL;
        *p_obj = NULL;
        return 0;
    }
    if (session->init_tstate == session->prev_tstate) {
        // We did not switch interpreters.
        *p_xidata = NULL;
        *p_obj = session->_preserved;
        session->_preserved = NULL;
        return 0;
    }
    *p_obj = NULL;

    // We did switch interpreters.
    Ty_ssize_t len = TyDict_Size(session->_preserved);
    if (len < 0) {
        failure.code = _PyXI_ERR_PRESERVE_FAILURE;
        goto error;
    }
    else if (len == 0) {
        *p_xidata = NULL;
    }
    else {
        _PyXI_namespace *xidata = _create_sharedns(session->_preserved);
        if (xidata == NULL) {
            failure.code = _PyXI_ERR_PRESERVE_FAILURE;
            goto error;
        }
        if (_fill_sharedns(xidata, session->_preserved,
                           _PyXIDATA_FULL_FALLBACK, &failure) < 0)
        {
            if (failure.code != _PyXI_ERR_NOT_SHAREABLE) {
                assert(failure.msg != NULL);
                failure.code = _PyXI_ERR_PRESERVE_FAILURE;
            }
            goto error;
        }
        *p_xidata = xidata;
    }
    Ty_CLEAR(session->_preserved);
    return 0;

error:
    if (p_failure != NULL) {
        *p_failure = failure;
    }
    if (xidata != NULL) {
        _destroy_sharedns(xidata);
    }
    return -1;
}

static int
_finish_preserved(_PyXI_namespace *xidata, TyObject **p_preserved)
{
    if (xidata == NULL) {
        return 0;
    }
    int res = -1;
    if (p_preserved != NULL) {
        TyObject *ns = TyDict_New();
        if (ns == NULL) {
            goto finally;
        }
        if (_apply_sharedns(xidata, ns, NULL) < 0) {
            Ty_CLEAR(ns);
            goto finally;
        }
        *p_preserved = ns;
    }
    res = 0;

finally:
    _destroy_sharedns(xidata);
    return res;
}

int
_PyXI_Preserve(_PyXI_session *session, const char *name, TyObject *value,
               _PyXI_failure *p_failure)
{
    _PyXI_failure failure = XI_FAILURE_INIT;
    if (!_session_is_active(session)) {
        TyErr_SetString(TyExc_RuntimeError, "session not active");
        return -1;
    }
    if (session->_preserved == NULL) {
        session->_preserved = TyDict_New();
        if (session->_preserved == NULL) {
            set_exc_with_cause(TyExc_RuntimeError,
                               "failed to initialize preserved objects");
            failure.code = _PyXI_ERR_PRESERVE_FAILURE;
            goto error;
        }
    }
    if (TyDict_SetItemString(session->_preserved, name, value) < 0) {
        set_exc_with_cause(TyExc_RuntimeError, "failed to preserve object");
        failure.code = _PyXI_ERR_PRESERVE_FAILURE;
        goto error;
    }
    return 0;

error:
    if (p_failure != NULL) {
        *p_failure = failure;
    }
    return -1;
}

TyObject *
_PyXI_GetPreserved(_PyXI_session_result *result, const char *name)
{
    TyObject *value = NULL;
    if (result->preserved != NULL) {
        (void)TyDict_GetItemStringRef(result->preserved, name, &value);
    }
    return value;
}

void
_PyXI_ClearResult(_PyXI_session_result *result)
{
    Ty_CLEAR(result->preserved);
    Ty_CLEAR(result->excinfo);
}


/*********************/
/* runtime lifecycle */
/*********************/

int
_Ty_xi_global_state_init(_PyXI_global_state_t *state)
{
    assert(state != NULL);
    xid_lookup_init(&state->data_lookup);
    return 0;
}

void
_Ty_xi_global_state_fini(_PyXI_global_state_t *state)
{
    assert(state != NULL);
    xid_lookup_fini(&state->data_lookup);
}

int
_Ty_xi_state_init(_PyXI_state_t *state, TyInterpreterState *interp)
{
    assert(state != NULL);
    assert(interp == NULL || state == _PyXI_GET_STATE(interp));

    xid_lookup_init(&state->data_lookup);

    // Initialize exceptions.
    if (interp != NULL) {
        if (init_static_exctypes(&state->exceptions, interp) < 0) {
            fini_heap_exctypes(&state->exceptions);
            return -1;
        }
    }
    if (init_heap_exctypes(&state->exceptions) < 0) {
        return -1;
    }

    return 0;
}

void
_Ty_xi_state_fini(_PyXI_state_t *state, TyInterpreterState *interp)
{
    assert(state != NULL);
    assert(interp == NULL || state == _PyXI_GET_STATE(interp));

    fini_heap_exctypes(&state->exceptions);
    if (interp != NULL) {
        fini_static_exctypes(&state->exceptions, interp);
    }

    xid_lookup_fini(&state->data_lookup);
}


TyStatus
_PyXI_Init(TyInterpreterState *interp)
{
    if (_Ty_IsMainInterpreter(interp)) {
        _PyXI_global_state_t *global_state = _PyXI_GET_GLOBAL_STATE(interp);
        if (global_state == NULL) {
            TyErr_PrintEx(0);
            return _TyStatus_ERR(
                    "failed to get global cross-interpreter state");
        }
        if (_Ty_xi_global_state_init(global_state) < 0) {
            TyErr_PrintEx(0);
            return _TyStatus_ERR(
                    "failed to initialize  global cross-interpreter state");
        }
    }

    _PyXI_state_t *state = _PyXI_GET_STATE(interp);
    if (state == NULL) {
        TyErr_PrintEx(0);
        return _TyStatus_ERR(
                "failed to get interpreter's cross-interpreter state");
    }
    // The static types were already initialized in _PyXI_InitTypes(),
    // so we pass in NULL here to avoid initializing them again.
    if (_Ty_xi_state_init(state, NULL) < 0) {
        TyErr_PrintEx(0);
        return _TyStatus_ERR(
                "failed to initialize interpreter's cross-interpreter state");
    }

    return _TyStatus_OK();
}

// _PyXI_Fini() must be called before the interpreter is cleared,
// since we must clear some heap objects.

void
_PyXI_Fini(TyInterpreterState *interp)
{
    _PyXI_state_t *state = _PyXI_GET_STATE(interp);
#ifndef NDEBUG
    if (state == NULL) {
        TyErr_PrintEx(0);
        return;
    }
#endif
    // The static types will be finalized soon in _PyXI_FiniTypes(),
    // so we pass in NULL here to avoid finalizing them right now.
    _Ty_xi_state_fini(state, NULL);

    if (_Ty_IsMainInterpreter(interp)) {
        _PyXI_global_state_t *global_state = _PyXI_GET_GLOBAL_STATE(interp);
        _Ty_xi_global_state_fini(global_state);
    }
}

TyStatus
_PyXI_InitTypes(TyInterpreterState *interp)
{
    if (init_static_exctypes(&_PyXI_GET_STATE(interp)->exceptions, interp) < 0) {
        TyErr_PrintEx(0);
        return _TyStatus_ERR(
                "failed to initialize the cross-interpreter exception types");
    }
    // We would initialize heap types here too but that leads to ref leaks.
    // Instead, we intialize them in _PyXI_Init().
    return _TyStatus_OK();
}

void
_PyXI_FiniTypes(TyInterpreterState *interp)
{
    // We would finalize heap types here too but that leads to ref leaks.
    // Instead, we finalize them in _PyXI_Fini().
    fini_static_exctypes(&_PyXI_GET_STATE(interp)->exceptions, interp);
}


/*************/
/* other API */
/*************/

TyInterpreterState *
_PyXI_NewInterpreter(PyInterpreterConfig *config, long *maybe_whence,
                     TyThreadState **p_tstate, TyThreadState **p_save_tstate)
{
    TyThreadState *save_tstate = TyThreadState_Swap(NULL);
    assert(save_tstate != NULL);

    TyThreadState *tstate;
    TyStatus status = Ty_NewInterpreterFromConfig(&tstate, config);
    if (TyStatus_Exception(status)) {
        // Since no new thread state was created, there is no exception
        // to propagate; raise a fresh one after swapping back in the
        // old thread state.
        TyThreadState_Swap(save_tstate);
        _TyErr_SetFromPyStatus(status);
        TyObject *exc = TyErr_GetRaisedException();
        TyErr_SetString(TyExc_InterpreterError,
                        "sub-interpreter creation failed");
        _TyErr_ChainExceptions1(exc);
        return NULL;
    }
    assert(tstate != NULL);
    TyInterpreterState *interp = TyThreadState_GetInterpreter(tstate);

    long whence = _TyInterpreterState_WHENCE_XI;
    if (maybe_whence != NULL) {
        whence = *maybe_whence;
    }
    _TyInterpreterState_SetWhence(interp, whence);

    if (p_tstate != NULL) {
        // We leave the new thread state as the current one.
        *p_tstate = tstate;
    }
    else {
        // Throw away the initial tstate.
        TyThreadState_Clear(tstate);
        TyThreadState_Swap(save_tstate);
        TyThreadState_Delete(tstate);
        save_tstate = NULL;
    }
    if (p_save_tstate != NULL) {
        *p_save_tstate = save_tstate;
    }
    return interp;
}

void
_PyXI_EndInterpreter(TyInterpreterState *interp,
                     TyThreadState *tstate, TyThreadState **p_save_tstate)
{
#ifndef NDEBUG
    long whence = _TyInterpreterState_GetWhence(interp);
#endif
    assert(whence != _TyInterpreterState_WHENCE_RUNTIME);

    if (!_TyInterpreterState_IsReady(interp)) {
        assert(whence == _TyInterpreterState_WHENCE_UNKNOWN);
        // PyInterpreterState_Clear() requires the GIL,
        // which a not-ready does not have, so we don't clear it.
        // That means there may be leaks here until clearing the
        // interpreter is fixed.
        TyInterpreterState_Delete(interp);
        return;
    }
    assert(whence != _TyInterpreterState_WHENCE_UNKNOWN);

    TyThreadState *save_tstate = NULL;
    TyThreadState *cur_tstate = TyThreadState_GET();
    if (tstate == NULL) {
        if (TyThreadState_GetInterpreter(cur_tstate) == interp) {
            tstate = cur_tstate;
        }
        else {
            tstate = _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_FINI);
            assert(tstate != NULL);
            save_tstate = TyThreadState_Swap(tstate);
        }
    }
    else {
        assert(TyThreadState_GetInterpreter(tstate) == interp);
        if (tstate != cur_tstate) {
            assert(TyThreadState_GetInterpreter(cur_tstate) != interp);
            save_tstate = TyThreadState_Swap(tstate);
        }
    }

    Ty_EndInterpreter(tstate);

    if (p_save_tstate != NULL) {
        save_tstate = *p_save_tstate;
    }
    TyThreadState_Swap(save_tstate);
}
