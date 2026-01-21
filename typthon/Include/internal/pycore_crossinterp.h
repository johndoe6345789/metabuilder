#ifndef Ty_INTERNAL_CROSSINTERP_H
#define Ty_INTERNAL_CROSSINTERP_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_pyerrors.h"


/**************/
/* exceptions */
/**************/

PyAPI_DATA(TyObject *) TyExc_InterpreterError;
PyAPI_DATA(TyObject *) TyExc_InterpreterNotFoundError;


/***************************/
/* cross-interpreter calls */
/***************************/

typedef int (*_Ty_simple_func)(void *);
extern int _Ty_CallInInterpreter(
    TyInterpreterState *interp,
    _Ty_simple_func func,
    void *arg);
extern int _Ty_CallInInterpreterAndRawFree(
    TyInterpreterState *interp,
    _Ty_simple_func func,
    void *arg);


/**************************/
/* cross-interpreter data */
/**************************/

typedef struct _xidata _PyXIData_t;
typedef TyObject *(*xid_newobjfunc)(_PyXIData_t *);
typedef void (*xid_freefunc)(void *);

// _PyXIData_t is similar to Ty_buffer as an effectively
// opaque struct that holds data outside the object machinery.  This
// is necessary to pass safely between interpreters in the same process.
struct _xidata {
    // data is the cross-interpreter-safe derivation of a Python object
    // (see _TyObject_GetXIData).  It will be NULL if the
    // new_object func (below) encodes the data.
    void *data;
    // obj is the Python object from which the data was derived.  This
    // is non-NULL only if the data remains bound to the object in some
    // way, such that the object must be "released" (via a decref) when
    // the data is released.  In that case the code that sets the field,
    // likely a registered "xidatafunc", is responsible for
    // ensuring it owns the reference (i.e. incref).
    TyObject *obj;
    // interpid is the ID of the owning interpreter of the original
    // object.  It corresponds to the active interpreter when
    // _TyObject_GetXIData() was called.  This should only
    // be set by the cross-interpreter machinery.
    //
    // We use the ID rather than the TyInterpreterState to avoid issues
    // with deleted interpreters.  Note that IDs are never re-used, so
    // each one will always correspond to a specific interpreter
    // (whether still alive or not).
    int64_t interpid;
    // new_object is a function that returns a new object in the current
    // interpreter given the data.  The resulting object (a new
    // reference) will be equivalent to the original object.  This field
    // is required.
    xid_newobjfunc new_object;
    // free is called when the data is released.  If it is NULL then
    // nothing will be done to free the data.  For some types this is
    // okay (e.g. bytes) and for those types this field should be set
    // to NULL.  However, for most the data was allocated just for
    // cross-interpreter use, so it must be freed when
    // _PyXIData_Release is called or the memory will
    // leak.  In that case, at the very least this field should be set
    // to TyMem_RawFree (the default if not explicitly set to NULL).
    // The call will happen with the original interpreter activated.
    xid_freefunc free;
};

PyAPI_FUNC(_PyXIData_t *) _PyXIData_New(void);
PyAPI_FUNC(void) _PyXIData_Free(_PyXIData_t *data);

#define _PyXIData_DATA(DATA) ((DATA)->data)
#define _PyXIData_OBJ(DATA) ((DATA)->obj)
#define _PyXIData_INTERPID(DATA) ((DATA)->interpid)
// Users should not need getters for "new_object" or "free".


/* defining cross-interpreter data */

PyAPI_FUNC(void) _PyXIData_Init(
        _PyXIData_t *data,
        TyInterpreterState *interp, void *shared, TyObject *obj,
        xid_newobjfunc new_object);
PyAPI_FUNC(int) _PyXIData_InitWithSize(
        _PyXIData_t *,
        TyInterpreterState *interp, const size_t, TyObject *,
        xid_newobjfunc);
PyAPI_FUNC(void) _PyXIData_Clear(TyInterpreterState *, _PyXIData_t *);

// Normally the Init* functions are sufficient.  The only time
// additional initialization might be needed is to set the "free" func,
// though that should be infrequent.
#define _PyXIData_SET_FREE(DATA, FUNC) \
    do { \
        (DATA)->free = (FUNC); \
    } while (0)
#define _PyXIData_CHECK_FREE(DATA, FUNC) \
    ((DATA)->free == (FUNC))
// Additionally, some shareable types are essentially light wrappers
// around other shareable types.  The xidatafunc of the wrapper
// can often be implemented by calling the wrapped object's
// xidatafunc and then changing the "new_object" function.
// We have _PyXIData_SET_NEW_OBJECT() here for that,
// but might be better to have a function like
// _PyXIData_AdaptToWrapper() instead.
#define _PyXIData_SET_NEW_OBJECT(DATA, FUNC) \
    do { \
        (DATA)->new_object = (FUNC); \
    } while (0)
#define _PyXIData_CHECK_NEW_OBJECT(DATA, FUNC) \
    ((DATA)->new_object == (FUNC))


/* getting cross-interpreter data */

typedef int xidata_fallback_t;
#define _PyXIDATA_XIDATA_ONLY (0)
#define _PyXIDATA_FULL_FALLBACK (1)

// Technically, we don't need two different function types;
// we could go with just the fallback one.  However, only container
// types like tuple need it, so always having the extra arg would be
// a bit unfortunate.  It's also nice to be able to clearly distinguish
// between types that might call _TyObject_GetXIData() and those that won't.
//
typedef int (*xidatafunc)(TyThreadState *, TyObject *, _PyXIData_t *);
typedef int (*xidatafbfunc)(
        TyThreadState *, TyObject *, xidata_fallback_t, _PyXIData_t *);
typedef struct {
    xidatafunc basic;
    xidatafbfunc fallback;
} _PyXIData_getdata_t;

PyAPI_FUNC(TyObject *) _PyXIData_GetNotShareableErrorType(TyThreadState *);
PyAPI_FUNC(void) _PyXIData_SetNotShareableError(TyThreadState *, const char *);
PyAPI_FUNC(void) _PyXIData_FormatNotShareableError(
        TyThreadState *,
        const char *,
        ...);

PyAPI_FUNC(_PyXIData_getdata_t) _PyXIData_Lookup(
        TyThreadState *,
        TyObject *);
PyAPI_FUNC(int) _TyObject_CheckXIData(
        TyThreadState *,
        TyObject *);

PyAPI_FUNC(int) _TyObject_GetXIDataNoFallback(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);
PyAPI_FUNC(int) _TyObject_GetXIData(
        TyThreadState *,
        TyObject *,
        xidata_fallback_t,
        _PyXIData_t *);

// _TyObject_GetXIData() for bytes
typedef struct {
    const char *bytes;
    Ty_ssize_t len;
} _TyBytes_data_t;
PyAPI_FUNC(int) _TyBytes_GetData(TyObject *, _TyBytes_data_t *);
PyAPI_FUNC(TyObject *) _TyBytes_FromData(_TyBytes_data_t *);
PyAPI_FUNC(TyObject *) _TyBytes_FromXIData(_PyXIData_t *);
PyAPI_FUNC(int) _TyBytes_GetXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);
PyAPI_FUNC(_TyBytes_data_t *) _TyBytes_GetXIDataWrapped(
        TyThreadState *,
        TyObject *,
        size_t,
        xid_newobjfunc,
        _PyXIData_t *);

// _TyObject_GetXIData() for pickle
PyAPI_DATA(TyObject *) _PyPickle_LoadFromXIData(_PyXIData_t *);
PyAPI_FUNC(int) _PyPickle_GetXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);

// _TyObject_GetXIData() for marshal
PyAPI_FUNC(TyObject *) _TyMarshal_ReadObjectFromXIData(_PyXIData_t *);
PyAPI_FUNC(int) _TyMarshal_GetXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);

// _TyObject_GetXIData() for code objects
PyAPI_FUNC(TyObject *) _TyCode_FromXIData(_PyXIData_t *);
PyAPI_FUNC(int) _TyCode_GetXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);
PyAPI_FUNC(int) _TyCode_GetScriptXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);
PyAPI_FUNC(int) _TyCode_GetPureScriptXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);

// _TyObject_GetXIData() for functions
PyAPI_FUNC(TyObject *) _TyFunction_FromXIData(_PyXIData_t *);
PyAPI_FUNC(int) _TyFunction_GetXIData(
        TyThreadState *,
        TyObject *,
        _PyXIData_t *);


/* using cross-interpreter data */

PyAPI_FUNC(TyObject *) _PyXIData_NewObject(_PyXIData_t *);
PyAPI_FUNC(int) _PyXIData_Release(_PyXIData_t *);
PyAPI_FUNC(int) _PyXIData_ReleaseAndRawFree(_PyXIData_t *);


/* cross-interpreter data registry */

#define Ty_CORE_CROSSINTERP_DATA_REGISTRY_H
#include "pycore_crossinterp_data_registry.h"
#undef Ty_CORE_CROSSINTERP_DATA_REGISTRY_H


/*****************************/
/* runtime state & lifecycle */
/*****************************/

typedef struct _xid_lookup_state _PyXIData_lookup_t;

typedef struct {
    // builtin types
    _PyXIData_lookup_t data_lookup;
} _PyXI_global_state_t;

typedef struct {
    // heap types
    _PyXIData_lookup_t data_lookup;

    struct xi_exceptions {
        // static types
        TyObject *TyExc_InterpreterError;
        TyObject *TyExc_InterpreterNotFoundError;
        // heap types
        TyObject *TyExc_NotShareableError;
    } exceptions;
} _PyXI_state_t;

#define _PyXI_GET_GLOBAL_STATE(interp) (&(interp)->runtime->xi)
#define _PyXI_GET_STATE(interp) (&(interp)->xi)

#ifndef Ty_BUILD_CORE_MODULE
extern TyStatus _PyXI_Init(TyInterpreterState *interp);
extern void _PyXI_Fini(TyInterpreterState *interp);
extern TyStatus _PyXI_InitTypes(TyInterpreterState *interp);
extern void _PyXI_FiniTypes(TyInterpreterState *interp);
#endif  // Ty_BUILD_CORE_MODULE

int _Ty_xi_global_state_init(_PyXI_global_state_t *);
void _Ty_xi_global_state_fini(_PyXI_global_state_t *);
int _Ty_xi_state_init(_PyXI_state_t *, TyInterpreterState *);
void _Ty_xi_state_fini(_PyXI_state_t *, TyInterpreterState *);


/***************************/
/* short-term data sharing */
/***************************/

// Ultimately we'd like to preserve enough information about the
// exception and traceback that we could re-constitute (or at least
// simulate, a la traceback.TracebackException), and even chain, a copy
// of the exception in the calling interpreter.

typedef struct _excinfo {
    struct _excinfo_type {
        TyTypeObject *builtin;
        const char *name;
        const char *qualname;
        const char *module;
    } type;
    const char *msg;
    const char *errdisplay;
} _PyXI_excinfo;

PyAPI_FUNC(_PyXI_excinfo *) _PyXI_NewExcInfo(TyObject *exc);
PyAPI_FUNC(void) _PyXI_FreeExcInfo(_PyXI_excinfo *info);
PyAPI_FUNC(TyObject *) _PyXI_FormatExcInfo(_PyXI_excinfo *info);
PyAPI_FUNC(TyObject *) _PyXI_ExcInfoAsObject(_PyXI_excinfo *info);


typedef enum error_code {
    _PyXI_ERR_NO_ERROR = 0,
    _PyXI_ERR_UNCAUGHT_EXCEPTION = -1,
    _PyXI_ERR_OTHER = -2,
    _PyXI_ERR_NO_MEMORY = -3,
    _PyXI_ERR_ALREADY_RUNNING = -4,
    _PyXI_ERR_MAIN_NS_FAILURE = -5,
    _PyXI_ERR_APPLY_NS_FAILURE = -6,
    _PyXI_ERR_PRESERVE_FAILURE = -7,
    _PyXI_ERR_EXC_PROPAGATION_FAILURE = -8,
    _PyXI_ERR_NOT_SHAREABLE = -9,
} _PyXI_errcode;

typedef struct xi_failure _PyXI_failure;

PyAPI_FUNC(_PyXI_failure *) _PyXI_NewFailure(void);
PyAPI_FUNC(void) _PyXI_FreeFailure(_PyXI_failure *);
PyAPI_FUNC(_PyXI_errcode) _PyXI_GetFailureCode(_PyXI_failure *);
PyAPI_FUNC(int) _PyXI_InitFailure(_PyXI_failure *, _PyXI_errcode, TyObject *);
PyAPI_FUNC(void) _PyXI_InitFailureUTF8(
    _PyXI_failure *,
    _PyXI_errcode,
    const char *);

PyAPI_FUNC(int) _PyXI_UnwrapNotShareableError(
    TyThreadState *,
    _PyXI_failure *);


// A cross-interpreter session involves entering an interpreter
// with _PyXI_Enter(), doing some work with it, and finally exiting
// that interpreter with _PyXI_Exit().
//
// At the boundaries of the session, both entering and exiting,
// data may be exchanged between the previous interpreter and the
// target one in a thread-safe way that does not violate the
// isolation between interpreters.  This includes setting objects
// in the target's __main__ module on the way in, and capturing
// uncaught exceptions on the way out.
typedef struct xi_session _PyXI_session;

PyAPI_FUNC(_PyXI_session *) _PyXI_NewSession(void);
PyAPI_FUNC(void) _PyXI_FreeSession(_PyXI_session *);

typedef struct {
    TyObject *preserved;
    TyObject *excinfo;
    _PyXI_errcode errcode;
} _PyXI_session_result;
PyAPI_FUNC(void) _PyXI_ClearResult(_PyXI_session_result *);

PyAPI_FUNC(int) _PyXI_Enter(
    _PyXI_session *session,
    TyInterpreterState *interp,
    TyObject *nsupdates,
    _PyXI_session_result *);
PyAPI_FUNC(int) _PyXI_Exit(
    _PyXI_session *,
    _PyXI_failure *,
    _PyXI_session_result *);

PyAPI_FUNC(TyObject *) _PyXI_GetMainNamespace(
    _PyXI_session *,
    _PyXI_failure *);

PyAPI_FUNC(int) _PyXI_Preserve(
    _PyXI_session *,
    const char *,
    TyObject *,
    _PyXI_failure *);
PyAPI_FUNC(TyObject *) _PyXI_GetPreserved(
    _PyXI_session_result *,
    const char *);


/*************/
/* other API */
/*************/

// Export for _testinternalcapi shared extension
PyAPI_FUNC(TyInterpreterState *) _PyXI_NewInterpreter(
    PyInterpreterConfig *config,
    long *maybe_whence,
    TyThreadState **p_tstate,
    TyThreadState **p_save_tstate);
PyAPI_FUNC(void) _PyXI_EndInterpreter(
    TyInterpreterState *interp,
    TyThreadState *tstate,
    TyThreadState **p_save_tstate);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_CROSSINTERP_H */
