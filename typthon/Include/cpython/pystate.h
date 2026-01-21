#ifndef Ty_CPYTHON_PYSTATE_H
#  error "this header file must not be included directly"
#endif


/* private interpreter helpers */

PyAPI_FUNC(int) _TyInterpreterState_RequiresIDRef(TyInterpreterState *);
PyAPI_FUNC(void) _TyInterpreterState_RequireIDRef(TyInterpreterState *, int);

/* State unique per thread */

/* Ty_tracefunc return -1 when raising an exception, or 0 for success. */
typedef int (*Ty_tracefunc)(TyObject *, PyFrameObject *, int, TyObject *);

/* The following values are used for 'what' for tracefunc functions
 *
 * To add a new kind of trace event, also update "trace_init" in
 * Python/sysmodule.c to define the Python level event name
 */
#define PyTrace_CALL 0
#define PyTrace_EXCEPTION 1
#define PyTrace_LINE 2
#define PyTrace_RETURN 3
#define PyTrace_C_CALL 4
#define PyTrace_C_EXCEPTION 5
#define PyTrace_C_RETURN 6
#define PyTrace_OPCODE 7

/* Remote debugger support */
#define Ty_MAX_SCRIPT_PATH_SIZE 512
typedef struct {
    int32_t debugger_pending_call;
    char debugger_script_path[Ty_MAX_SCRIPT_PATH_SIZE];
} _PyRemoteDebuggerSupport;

typedef struct _err_stackitem {
    /* This struct represents a single execution context where we might
     * be currently handling an exception.  It is a per-coroutine state
     * (coroutine in the computer science sense, including the thread
     * and generators).
     *
     * This is used as an entry on the exception stack, where each
     * entry indicates if it is currently handling an exception.
     * This ensures that the exception state is not impacted
     * by "yields" from an except handler.  The thread
     * always has an entry (the bottom-most one).
     */

    /* The exception currently being handled in this context, if any. */
    TyObject *exc_value;

    struct _err_stackitem *previous_item;

} _TyErr_StackItem;

typedef struct _stack_chunk {
    struct _stack_chunk *previous;
    size_t size;
    size_t top;
    TyObject * data[1]; /* Variable sized */
} _PyStackChunk;

/* Minimum size of data stack chunk */
#define _PY_DATA_STACK_CHUNK_SIZE (16*1024)
struct _ts {
    /* See Python/ceval.c for comments explaining most fields */

    TyThreadState *prev;
    TyThreadState *next;
    TyInterpreterState *interp;

    /* The global instrumentation version in high bits, plus flags indicating
       when to break out of the interpreter loop in lower bits. See details in
       pycore_ceval.h. */
    uintptr_t eval_breaker;

    struct {
        /* Has been initialized to a safe state.

           In order to be effective, this must be set to 0 during or right
           after allocation. */
        unsigned int initialized:1;

        /* Has been bound to an OS thread. */
        unsigned int bound:1;
        /* Has been unbound from its OS thread. */
        unsigned int unbound:1;
        /* Has been bound aa current for the GILState API. */
        unsigned int bound_gilstate:1;
        /* Currently in use (maybe holds the GIL). */
        unsigned int active:1;

        /* various stages of finalization */
        unsigned int finalizing:1;
        unsigned int cleared:1;
        unsigned int finalized:1;

        /* padding to align to 4 bytes */
        unsigned int :24;
    } _status;
#ifdef Ty_BUILD_CORE
#  define _TyThreadState_WHENCE_NOTSET -1
#  define _TyThreadState_WHENCE_UNKNOWN 0
#  define _TyThreadState_WHENCE_INIT 1
#  define _TyThreadState_WHENCE_FINI 2
#  define _TyThreadState_WHENCE_THREADING 3
#  define _TyThreadState_WHENCE_GILSTATE 4
#  define _TyThreadState_WHENCE_EXEC 5
#endif

    /* Currently holds the GIL. Must be its own field to avoid data races */
    int holds_gil;

    int _whence;

    /* Thread state (_Ty_THREAD_ATTACHED, _Ty_THREAD_DETACHED, _Ty_THREAD_SUSPENDED).
       See Include/internal/pycore_pystate.h for more details. */
    int state;

    int py_recursion_remaining;
    int py_recursion_limit;
    int recursion_headroom; /* Allow 50 more calls to handle any errors. */

    /* 'tracing' keeps track of the execution depth when tracing/profiling.
       This is to prevent the actual trace/profile code from being recorded in
       the trace/profile. */
    int tracing;
    int what_event; /* The event currently being monitored, if any. */

    /* Pointer to currently executing frame. */
    struct _PyInterpreterFrame *current_frame;

    Ty_tracefunc c_profilefunc;
    Ty_tracefunc c_tracefunc;
    TyObject *c_profileobj;
    TyObject *c_traceobj;

    /* The exception currently being raised */
    TyObject *current_exception;

    /* Pointer to the top of the exception stack for the exceptions
     * we may be currently handling.  (See _TyErr_StackItem above.)
     * This is never NULL. */
    _TyErr_StackItem *exc_info;

    TyObject *dict;  /* Stores per-thread state */

    int gilstate_counter;

    TyObject *async_exc; /* Asynchronous exception to raise */
    unsigned long thread_id; /* Thread id where this tstate was created */

    /* Native thread id where this tstate was created. This will be 0 except on
     * those platforms that have the notion of native thread id, for which the
     * macro PY_HAVE_THREAD_NATIVE_ID is then defined.
     */
    unsigned long native_thread_id;

    TyObject *delete_later;

    /* Tagged pointer to top-most critical section, or zero if there is no
     * active critical section. Critical sections are only used in
     * `--disable-gil` builds (i.e., when Ty_GIL_DISABLED is defined to 1). In the
     * default build, this field is always zero.
     */
    uintptr_t critical_section;

    int coroutine_origin_tracking_depth;

    TyObject *async_gen_firstiter;
    TyObject *async_gen_finalizer;

    TyObject *context;
    uint64_t context_ver;

    /* Unique thread state id. */
    uint64_t id;

    _PyStackChunk *datastack_chunk;
    TyObject **datastack_top;
    TyObject **datastack_limit;
    /* XXX signal handlers should also be here */

    /* The following fields are here to avoid allocation during init.
       The data is exposed through TyThreadState pointer fields.
       These fields should not be accessed directly outside of init.
       This is indicated by an underscore prefix on the field names.

       All other TyInterpreterState pointer fields are populated when
       needed and default to NULL.
       */
       // Note some fields do not have a leading underscore for backward
       // compatibility.  See https://bugs.python.org/issue45953#msg412046.

    /* The thread's exception stack entry.  (Always the last entry.) */
    _TyErr_StackItem exc_state;

    TyObject *current_executor;

    uint64_t dict_global_version;

    /* Used to store/retrieve `threading.local` keys/values for this thread */
    TyObject *threading_local_key;

    /* Used by `threading.local`s to be remove keys/values for dying threads.
       The PyThreadObject must hold the only reference to this value.
    */
    TyObject *threading_local_sentinel;
    _PyRemoteDebuggerSupport remote_debugger_support;
};

/* other API */

/* Similar to TyThreadState_Get(), but don't issue a fatal error
 * if it is NULL. */
PyAPI_FUNC(TyThreadState *) TyThreadState_GetUnchecked(void);

// Deprecated alias kept for backward compatibility
Ty_DEPRECATED(3.14) static inline TyThreadState*
_TyThreadState_UncheckedGet(void)
{
    return TyThreadState_GetUnchecked();
}

// Disable tracing and profiling.
PyAPI_FUNC(void) TyThreadState_EnterTracing(TyThreadState *tstate);

// Reset tracing and profiling: enable them if a trace function or a profile
// function is set, otherwise disable them.
PyAPI_FUNC(void) TyThreadState_LeaveTracing(TyThreadState *tstate);

/* PyGILState */

/* Helper/diagnostic function - return 1 if the current thread
   currently holds the GIL, 0 otherwise.

   The function returns 1 if _TyGILState_check_enabled is non-zero. */
PyAPI_FUNC(int) TyGILState_Check(void);

/* The implementation of sys._current_frames()  Returns a dict mapping
   thread id to that thread's current frame.
*/
PyAPI_FUNC(TyObject*) _PyThread_CurrentFrames(void);

/* Routines for advanced debuggers, requested by David Beazley.
   Don't use unless you know what you are doing! */
PyAPI_FUNC(TyInterpreterState *) TyInterpreterState_Main(void);
PyAPI_FUNC(TyInterpreterState *) TyInterpreterState_Head(void);
PyAPI_FUNC(TyInterpreterState *) TyInterpreterState_Next(TyInterpreterState *);
PyAPI_FUNC(TyThreadState *) TyInterpreterState_ThreadHead(TyInterpreterState *);
PyAPI_FUNC(TyThreadState *) TyThreadState_Next(TyThreadState *);
PyAPI_FUNC(void) TyThreadState_DeleteCurrent(void);

/* Frame evaluation API */

typedef TyObject* (*_PyFrameEvalFunction)(TyThreadState *tstate, struct _PyInterpreterFrame *, int);

PyAPI_FUNC(_PyFrameEvalFunction) _TyInterpreterState_GetEvalFrameFunc(
    TyInterpreterState *interp);
PyAPI_FUNC(void) _TyInterpreterState_SetEvalFrameFunc(
    TyInterpreterState *interp,
    _PyFrameEvalFunction eval_frame);
