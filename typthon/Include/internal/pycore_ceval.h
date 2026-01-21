#ifndef Ty_INTERNAL_CEVAL_H
#define Ty_INTERNAL_CEVAL_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "dynamic_annotations.h"  // _Ty_ANNOTATE_RWLOCK_CREATE

#include "pycore_code.h"          // _TyCode_GetTLBCFast()
#include "pycore_interp.h"        // TyInterpreterState.eval_frame
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_stats.h"         // EVAL_CALL_STAT_INC()
#include "pycore_typedefs.h"      // _PyInterpreterFrame


/* Forward declarations */
struct _ceval_runtime_state;

// Export for '_lsprof' shared extension
PyAPI_FUNC(int) _TyEval_SetProfile(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg);

extern int _TyEval_SetTrace(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg);

extern int _TyEval_SetOpcodeTrace(PyFrameObject *f, bool enable);

// Helper to look up a builtin object
// Export for 'array' shared extension
PyAPI_FUNC(TyObject*) _TyEval_GetBuiltin(TyObject *);

extern TyObject* _TyEval_GetBuiltinId(_Ty_Identifier *);

extern void _TyEval_SetSwitchInterval(unsigned long microseconds);
extern unsigned long _TyEval_GetSwitchInterval(void);

// Export for '_queue' shared extension
PyAPI_FUNC(int) _TyEval_MakePendingCalls(TyThreadState *);

#ifndef Ty_DEFAULT_RECURSION_LIMIT
#  define Ty_DEFAULT_RECURSION_LIMIT 1000
#endif

extern void _Ty_FinishPendingCalls(TyThreadState *tstate);
extern void _TyEval_InitState(TyInterpreterState *);
extern void _TyEval_SignalReceived(void);

// bitwise flags:
#define _Ty_PENDING_MAINTHREADONLY 1
#define _Ty_PENDING_RAWFREE 2

typedef int _Ty_add_pending_call_result;
#define _Ty_ADD_PENDING_SUCCESS 0
#define _Ty_ADD_PENDING_FULL -1

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(_Ty_add_pending_call_result) _TyEval_AddPendingCall(
    TyInterpreterState *interp,
    _Ty_pending_call_func func,
    void *arg,
    int flags);

#ifdef HAVE_FORK
extern TyStatus _TyEval_ReInitThreads(TyThreadState *tstate);
#endif

// Used by sys.call_tracing()
extern TyObject* _TyEval_CallTracing(TyObject *func, TyObject *args);

// Used by sys.get_asyncgen_hooks()
extern TyObject* _TyEval_GetAsyncGenFirstiter(void);
extern TyObject* _TyEval_GetAsyncGenFinalizer(void);

// Used by sys.set_asyncgen_hooks()
extern int _TyEval_SetAsyncGenFirstiter(TyObject *);
extern int _TyEval_SetAsyncGenFinalizer(TyObject *);

// Used by sys.get_coroutine_origin_tracking_depth()
// and sys.set_coroutine_origin_tracking_depth()
extern int _TyEval_GetCoroutineOriginTrackingDepth(void);
extern int _TyEval_SetCoroutineOriginTrackingDepth(int depth);

extern void _TyEval_Fini(void);


extern TyObject* _TyEval_GetBuiltins(TyThreadState *tstate);

// Trampoline API

typedef struct {
    // Callback to initialize the trampoline state
    void* (*init_state)(void);
    // Callback to register every trampoline being created
    void (*write_state)(void* state, const void *code_addr,
                        unsigned int code_size, PyCodeObject* code);
    // Callback to free the trampoline state
    int (*free_state)(void* state);
} _PyPerf_Callbacks;

extern int _PyPerfTrampoline_SetCallbacks(_PyPerf_Callbacks *);
extern void _PyPerfTrampoline_GetCallbacks(_PyPerf_Callbacks *);
extern int _PyPerfTrampoline_Init(int activate);
extern int _PyPerfTrampoline_Fini(void);
extern void _PyPerfTrampoline_FreeArenas(void);
extern int _PyIsPerfTrampolineActive(void);
extern TyStatus _PyPerfTrampoline_AfterFork_Child(void);
#ifdef PY_HAVE_PERF_TRAMPOLINE
extern _PyPerf_Callbacks _Ty_perfmap_callbacks;
extern _PyPerf_Callbacks _Ty_perfmap_jit_callbacks;
#endif

static inline TyObject*
_TyEval_EvalFrame(TyThreadState *tstate, _PyInterpreterFrame *frame, int throwflag)
{
    EVAL_CALL_STAT_INC(EVAL_CALL_TOTAL);
    if (tstate->interp->eval_frame == NULL) {
        return _TyEval_EvalFrameDefault(tstate, frame, throwflag);
    }
    return tstate->interp->eval_frame(tstate, frame, throwflag);
}

extern TyObject*
_TyEval_Vector(TyThreadState *tstate,
            PyFunctionObject *func, TyObject *locals,
            TyObject* const* args, size_t argcount,
            TyObject *kwnames);

extern int _TyEval_ThreadsInitialized(void);
extern void _TyEval_InitGIL(TyThreadState *tstate, int own_gil);
extern void _TyEval_FiniGIL(TyInterpreterState *interp);

extern void _TyEval_AcquireLock(TyThreadState *tstate);

extern void _TyEval_ReleaseLock(TyInterpreterState *, TyThreadState *,
                                int final_release);

#ifdef Ty_GIL_DISABLED
// Returns 0 or 1 if the GIL for the given thread's interpreter is disabled or
// enabled, respectively.
//
// The enabled state of the GIL will not change while one or more threads are
// attached.
static inline int
_TyEval_IsGILEnabled(TyThreadState *tstate)
{
    struct _gil_runtime_state *gil = tstate->interp->ceval.gil;
    return _Ty_atomic_load_int_relaxed(&gil->enabled) != 0;
}

// Enable or disable the GIL used by the interpreter that owns tstate, which
// must be the current thread. This may affect other interpreters, if the GIL
// is shared. All three functions will be no-ops (and return 0) if the
// interpreter's `enable_gil' config is not _TyConfig_GIL_DEFAULT.
//
// Every call to _TyEval_EnableGILTransient() must be paired with exactly one
// call to either _TyEval_EnableGILPermanent() or
// _TyEval_DisableGIL(). _TyEval_EnableGILPermanent() and _TyEval_DisableGIL()
// must only be called while the GIL is enabled from a call to
// _TyEval_EnableGILTransient().
//
// _TyEval_EnableGILTransient() returns 1 if it enabled the GIL, or 0 if the
// GIL was already enabled, whether transiently or permanently. The caller will
// hold the GIL upon return.
//
// _TyEval_EnableGILPermanent() returns 1 if it permanently enabled the GIL
// (which must already be enabled), or 0 if it was already permanently
// enabled. Once _TyEval_EnableGILPermanent() has been called once, all
// subsequent calls to any of the three functions will be no-ops.
//
// _TyEval_DisableGIL() returns 1 if it disabled the GIL, or 0 if the GIL was
// kept enabled because of another request, whether transient or permanent.
//
// All three functions must be called by an attached thread (this implies that
// if the GIL is enabled, the current thread must hold it).
extern int _TyEval_EnableGILTransient(TyThreadState *tstate);
extern int _TyEval_EnableGILPermanent(TyThreadState *tstate);
extern int _TyEval_DisableGIL(TyThreadState *state);


static inline _Ty_CODEUNIT *
_TyEval_GetExecutableCode(TyThreadState *tstate, PyCodeObject *co)
{
    _Ty_CODEUNIT *bc = _TyCode_GetTLBCFast(tstate, co);
    if (bc != NULL) {
        return bc;
    }
    return _TyCode_GetTLBC(co);
}

#endif

extern void _TyEval_DeactivateOpCache(void);


/* --- _Ty_EnterRecursiveCall() ----------------------------------------- */

static inline int _Ty_MakeRecCheck(TyThreadState *tstate)  {
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    return here_addr < _tstate->c_stack_soft_limit;
}

// Export for '_json' shared extension, used via _Ty_EnterRecursiveCall()
// static inline function.
PyAPI_FUNC(int) _Ty_CheckRecursiveCall(
    TyThreadState *tstate,
    const char *where);

int _Ty_CheckRecursiveCallPy(
    TyThreadState *tstate);

static inline int _Ty_EnterRecursiveCallTstate(TyThreadState *tstate,
                                               const char *where) {
    return (_Ty_MakeRecCheck(tstate) && _Ty_CheckRecursiveCall(tstate, where));
}

static inline int _Ty_EnterRecursiveCall(const char *where) {
    TyThreadState *tstate = _TyThreadState_GET();
    return _Ty_EnterRecursiveCallTstate(tstate, where);
}

static inline void _Ty_LeaveRecursiveCallTstate(TyThreadState *tstate) {
    (void)tstate;
}

PyAPI_FUNC(void) _Ty_InitializeRecursionLimits(TyThreadState *tstate);

static inline int _Ty_ReachedRecursionLimit(TyThreadState *tstate)  {
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    assert(_tstate->c_stack_hard_limit != 0);
    return here_addr <= _tstate->c_stack_soft_limit;
}

static inline void _Ty_LeaveRecursiveCall(void)  {
}

extern _PyInterpreterFrame* _TyEval_GetFrame(void);

extern TyObject * _TyEval_GetGlobalsFromRunningMain(TyThreadState *);
extern int _TyEval_EnsureBuiltins(
    TyThreadState *,
    TyObject *,
    TyObject **p_builtins);
extern int _TyEval_EnsureBuiltinsWithModule(
    TyThreadState *,
    TyObject *,
    TyObject **p_builtins);

PyAPI_FUNC(TyObject *)_Ty_MakeCoro(PyFunctionObject *func);

/* Handle signals, pending calls, GIL drop request
   and asynchronous exception */
PyAPI_FUNC(int) _Ty_HandlePending(TyThreadState *tstate);

extern TyObject * _TyEval_GetFrameLocals(void);

typedef TyObject *(*conversion_func)(TyObject *);

PyAPI_DATA(const binaryfunc) _TyEval_BinaryOps[];
PyAPI_DATA(const conversion_func) _TyEval_ConversionFuncs[];

typedef struct _special_method {
    TyObject *name;
    const char *error;
    const char *error_suggestion;  // improved optional suggestion
} _Ty_SpecialMethod;

PyAPI_DATA(const _Ty_SpecialMethod) _Ty_SpecialMethods[];
PyAPI_DATA(const size_t) _Ty_FunctionAttributeOffsets[];

PyAPI_FUNC(int) _TyEval_CheckExceptStarTypeValid(TyThreadState *tstate, TyObject* right);
PyAPI_FUNC(int) _TyEval_CheckExceptTypeValid(TyThreadState *tstate, TyObject* right);
PyAPI_FUNC(int) _TyEval_ExceptionGroupMatch(_PyInterpreterFrame *, TyObject* exc_value, TyObject *match_type, TyObject **match, TyObject **rest);
PyAPI_FUNC(void) _TyEval_FormatAwaitableError(TyThreadState *tstate, TyTypeObject *type, int oparg);
PyAPI_FUNC(void) _TyEval_FormatExcCheckArg(TyThreadState *tstate, TyObject *exc, const char *format_str, TyObject *obj);
PyAPI_FUNC(void) _TyEval_FormatExcUnbound(TyThreadState *tstate, PyCodeObject *co, int oparg);
PyAPI_FUNC(void) _TyEval_FormatKwargsError(TyThreadState *tstate, TyObject *func, TyObject *kwargs);
PyAPI_FUNC(TyObject *) _TyEval_ImportFrom(TyThreadState *, TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) _TyEval_ImportName(TyThreadState *, _PyInterpreterFrame *, TyObject *, TyObject *, TyObject *);
PyAPI_FUNC(TyObject *)_TyEval_MatchClass(TyThreadState *tstate, TyObject *subject, TyObject *type, Ty_ssize_t nargs, TyObject *kwargs);
PyAPI_FUNC(TyObject *)_TyEval_MatchKeys(TyThreadState *tstate, TyObject *map, TyObject *keys);
PyAPI_FUNC(void) _TyEval_MonitorRaise(TyThreadState *tstate, _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr);
PyAPI_FUNC(int) _TyEval_UnpackIterableStackRef(TyThreadState *tstate, TyObject *v, int argcnt, int argcntafter, _PyStackRef *sp);
PyAPI_FUNC(void) _TyEval_FrameClearAndPop(TyThreadState *tstate, _PyInterpreterFrame *frame);
PyAPI_FUNC(TyObject **) _PyObjectArray_FromStackRefArray(_PyStackRef *input, Ty_ssize_t nargs, TyObject **scratch);

PyAPI_FUNC(void) _PyObjectArray_Free(TyObject **array, TyObject **scratch);

PyAPI_FUNC(TyObject *) _TyEval_GetANext(TyObject *aiter);
PyAPI_FUNC(void) _TyEval_LoadGlobalStackRef(TyObject *globals, TyObject *builtins, TyObject *name, _PyStackRef *writeto);
PyAPI_FUNC(TyObject *) _TyEval_GetAwaitable(TyObject *iterable, int oparg);
PyAPI_FUNC(TyObject *) _TyEval_LoadName(TyThreadState *tstate, _PyInterpreterFrame *frame, TyObject *name);
PyAPI_FUNC(int)
_Ty_Check_ArgsIterable(TyThreadState *tstate, TyObject *func, TyObject *args);

/*
 * Indicate whether a special method of given 'oparg' can use the (improved)
 * alternative error message instead. Only methods loaded by LOAD_SPECIAL
 * support alternative error messages.
 *
 * Symbol is exported for the JIT (see discussion on GH-132218).
 */
PyAPI_FUNC(int)
_TyEval_SpecialMethodCanSuggest(TyObject *self, int oparg);

/* Bits that can be set in TyThreadState.eval_breaker */
#define _PY_GIL_DROP_REQUEST_BIT (1U << 0)
#define _PY_SIGNALS_PENDING_BIT (1U << 1)
#define _PY_CALLS_TO_DO_BIT (1U << 2)
#define _PY_ASYNC_EXCEPTION_BIT (1U << 3)
#define _PY_GC_SCHEDULED_BIT (1U << 4)
#define _PY_EVAL_PLEASE_STOP_BIT (1U << 5)
#define _PY_EVAL_EXPLICIT_MERGE_BIT (1U << 6)
#define _PY_EVAL_JIT_INVALIDATE_COLD_BIT (1U << 7)

/* Reserve a few bits for future use */
#define _PY_EVAL_EVENTS_BITS 8
#define _PY_EVAL_EVENTS_MASK ((1 << _PY_EVAL_EVENTS_BITS)-1)

static inline void
_Ty_set_eval_breaker_bit(TyThreadState *tstate, uintptr_t bit)
{
    _Ty_atomic_or_uintptr(&tstate->eval_breaker, bit);
}

static inline void
_Ty_unset_eval_breaker_bit(TyThreadState *tstate, uintptr_t bit)
{
    _Ty_atomic_and_uintptr(&tstate->eval_breaker, ~bit);
}

static inline int
_Ty_eval_breaker_bit_is_set(TyThreadState *tstate, uintptr_t bit)
{
    uintptr_t b = _Ty_atomic_load_uintptr_relaxed(&tstate->eval_breaker);
    return (b & bit) != 0;
}

// Free-threaded builds use these functions to set or unset a bit on all
// threads in the given interpreter.
void _Ty_set_eval_breaker_bit_all(TyInterpreterState *interp, uintptr_t bit);
void _Ty_unset_eval_breaker_bit_all(TyInterpreterState *interp, uintptr_t bit);

PyAPI_FUNC(_PyStackRef) _TyFloat_FromDouble_ConsumeInputs(_PyStackRef left, _PyStackRef right, double value);

#ifndef Ty_SUPPORTS_REMOTE_DEBUG
    #if defined(__APPLE__)
    #include <TargetConditionals.h>
    #  if !defined(TARGET_OS_OSX)
// Older macOS SDKs do not define TARGET_OS_OSX
    #     define TARGET_OS_OSX 1
    #  endif
    #endif
    #if ((defined(__APPLE__) && TARGET_OS_OSX) || defined(MS_WINDOWS) || (defined(__linux__) && HAVE_PROCESS_VM_READV))
    #    define Ty_SUPPORTS_REMOTE_DEBUG 1
    #endif
#endif

#if defined(Ty_REMOTE_DEBUG) && defined(Ty_SUPPORTS_REMOTE_DEBUG)
extern int _PyRunRemoteDebugger(TyThreadState *tstate);
#endif

/* Special methods used by LOAD_SPECIAL */
#define SPECIAL___ENTER__   0
#define SPECIAL___EXIT__    1
#define SPECIAL___AENTER__  2
#define SPECIAL___AEXIT__   3
#define SPECIAL_MAX   3

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_CEVAL_H */
