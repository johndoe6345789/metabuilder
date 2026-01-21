#ifndef Ty_INTERNAL_INTERP_H
#define Ty_INTERNAL_INTERP_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_interp_structs.h" // TyInterpreterState


/* interpreter state */

#define _TyInterpreterState_WHENCE_NOTSET -1
#define _TyInterpreterState_WHENCE_UNKNOWN 0
#define _TyInterpreterState_WHENCE_RUNTIME 1
#define _TyInterpreterState_WHENCE_LEGACY_CAPI 2
#define _TyInterpreterState_WHENCE_CAPI 3
#define _TyInterpreterState_WHENCE_XI 4
#define _TyInterpreterState_WHENCE_STDLIB 5
#define _TyInterpreterState_WHENCE_MAX 5


/* other API */

extern void _TyInterpreterState_Clear(TyThreadState *tstate);

static inline TyThreadState*
_TyInterpreterState_GetFinalizing(TyInterpreterState *interp) {
    return (TyThreadState*)_Ty_atomic_load_ptr_relaxed(&interp->_finalizing);
}

static inline unsigned long
_TyInterpreterState_GetFinalizingID(TyInterpreterState *interp) {
    return _Ty_atomic_load_ulong_relaxed(&interp->_finalizing_id);
}

static inline void
_TyInterpreterState_SetFinalizing(TyInterpreterState *interp, TyThreadState *tstate) {
    _Ty_atomic_store_ptr_relaxed(&interp->_finalizing, tstate);
    if (tstate == NULL) {
        _Ty_atomic_store_ulong_relaxed(&interp->_finalizing_id, 0);
    }
    else {
        // XXX Re-enable this assert once gh-109860 is fixed.
        //assert(tstate->thread_id == TyThread_get_thread_ident());
        _Ty_atomic_store_ulong_relaxed(&interp->_finalizing_id,
                                       tstate->thread_id);
    }
}


// Exports for the _testinternalcapi module.
PyAPI_FUNC(int64_t) _TyInterpreterState_ObjectToID(TyObject *);
PyAPI_FUNC(TyInterpreterState *) _TyInterpreterState_LookUpID(int64_t);
PyAPI_FUNC(TyInterpreterState *) _TyInterpreterState_LookUpIDObject(TyObject *);
PyAPI_FUNC(void) _TyInterpreterState_IDIncref(TyInterpreterState *);
PyAPI_FUNC(void) _TyInterpreterState_IDDecref(TyInterpreterState *);

PyAPI_FUNC(int) _TyInterpreterState_IsReady(TyInterpreterState *interp);

PyAPI_FUNC(long) _TyInterpreterState_GetWhence(TyInterpreterState *interp);
extern void _TyInterpreterState_SetWhence(
    TyInterpreterState *interp,
    long whence);

/*
Runtime Feature Flags

Each flag indicate whether or not a specific runtime feature
is available in a given context.  For example, forking the process
might not be allowed in the current interpreter (i.e. os.fork() would fail).
*/

/* Set if the interpreter share obmalloc runtime state
   with the main interpreter. */
#define Ty_RTFLAGS_USE_MAIN_OBMALLOC (1UL << 5)

/* Set if import should check a module for subinterpreter support. */
#define Ty_RTFLAGS_MULTI_INTERP_EXTENSIONS (1UL << 8)

/* Set if threads are allowed. */
#define Ty_RTFLAGS_THREADS (1UL << 10)

/* Set if daemon threads are allowed. */
#define Ty_RTFLAGS_DAEMON_THREADS (1UL << 11)

/* Set if os.fork() is allowed. */
#define Ty_RTFLAGS_FORK (1UL << 15)

/* Set if os.exec*() is allowed. */
#define Ty_RTFLAGS_EXEC (1UL << 16)

extern int _TyInterpreterState_HasFeature(TyInterpreterState *interp,
                                          unsigned long feature);

PyAPI_FUNC(TyStatus) _TyInterpreterState_New(
    TyThreadState *tstate,
    TyInterpreterState **pinterp);

extern const TyConfig* _TyInterpreterState_GetConfig(
    TyInterpreterState *interp);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_INTERP_H */
