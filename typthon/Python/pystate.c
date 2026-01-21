
/* Thread and interpreter state structures and their interfaces */

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_audit.h"         // _Ty_AuditHookEntry
#include "pycore_ceval.h"         // _TyEval_AcquireLock()
#include "pycore_codecs.h"        // _PyCodec_Fini()
#include "pycore_critical_section.h" // _PyCriticalSection_Resume()
#include "pycore_dtoa.h"          // _dtoa_state_INIT()
#include "pycore_emscripten_trampoline.h" // _Ty_EmscriptenTrampoline_Init()
#include "pycore_freelist.h"      // _TyObject_ClearFreeLists()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_interpframe.h"   // _TyThreadState_HasStackSpace()
#include "pycore_object.h"        // _TyType_InitCache()
#include "pycore_obmalloc.h"      // _TyMem_obmalloc_state_on_heap()
#include "pycore_optimizer.h"     // JIT_CLEANUP_THRESHOLD
#include "pycore_parking_lot.h"   // _PyParkingLot_AfterFork()
#include "pycore_pyerrors.h"      // _TyErr_Clear()
#include "pycore_pylifecycle.h"   // _TyAST_Fini()
#include "pycore_pymem.h"         // _TyMem_DebugEnabled()
#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_runtime_init.h"  // _PyRuntimeState_INIT
#include "pycore_stackref.h"      // Ty_STACKREF_DEBUG
#include "pycore_time.h"          // _TyTime_Init()
#include "pycore_uniqueid.h"      // _TyObject_FinalizePerThreadRefcounts()


/* --------------------------------------------------------------------------
CAUTION

Always use TyMem_RawMalloc() and TyMem_RawFree() directly in this file.  A
number of these functions are advertised as safe to call when the GIL isn't
held, and in a debug build Python redirects (e.g.) TyMem_NEW (etc) to Python's
debugging obmalloc functions.  Those aren't thread-safe (they rely on the GIL
to avoid the expense of doing their own locking).
-------------------------------------------------------------------------- */

#ifdef HAVE_DLOPEN
#  ifdef HAVE_DLFCN_H
#    include <dlfcn.h>
#  endif
#  if !HAVE_DECL_RTLD_LAZY
#    define RTLD_LAZY 1
#  endif
#endif


/****************************************/
/* helpers for the current thread state */
/****************************************/

// API for the current thread state is further down.

/* "current" means one of:
   - bound to the current OS thread
   - holds the GIL
 */

//-------------------------------------------------
// a highly efficient lookup for the current thread
//-------------------------------------------------

/*
   The stored thread state is set by TyThreadState_Swap().

   For each of these functions, the GIL must be held by the current thread.
 */


#ifdef HAVE_THREAD_LOCAL
_Ty_thread_local TyThreadState *_Ty_tss_tstate = NULL;
#endif

static inline TyThreadState *
current_fast_get(void)
{
#ifdef HAVE_THREAD_LOCAL
    return _Ty_tss_tstate;
#else
    // XXX Fall back to the TyThread_tss_*() API.
#  error "no supported thread-local variable storage classifier"
#endif
}

static inline void
current_fast_set(_PyRuntimeState *Py_UNUSED(runtime), TyThreadState *tstate)
{
    assert(tstate != NULL);
#ifdef HAVE_THREAD_LOCAL
    _Ty_tss_tstate = tstate;
#else
    // XXX Fall back to the TyThread_tss_*() API.
#  error "no supported thread-local variable storage classifier"
#endif
}

static inline void
current_fast_clear(_PyRuntimeState *Py_UNUSED(runtime))
{
#ifdef HAVE_THREAD_LOCAL
    _Ty_tss_tstate = NULL;
#else
    // XXX Fall back to the TyThread_tss_*() API.
#  error "no supported thread-local variable storage classifier"
#endif
}

#define tstate_verify_not_active(tstate) \
    if (tstate == current_fast_get()) { \
        _Ty_FatalErrorFormat(__func__, "tstate %p is still current", tstate); \
    }

TyThreadState *
_TyThreadState_GetCurrent(void)
{
    return current_fast_get();
}


//------------------------------------------------
// the thread state bound to the current OS thread
//------------------------------------------------

static inline int
tstate_tss_initialized(Ty_tss_t *key)
{
    return TyThread_tss_is_created(key);
}

static inline int
tstate_tss_init(Ty_tss_t *key)
{
    assert(!tstate_tss_initialized(key));
    return TyThread_tss_create(key);
}

static inline void
tstate_tss_fini(Ty_tss_t *key)
{
    assert(tstate_tss_initialized(key));
    TyThread_tss_delete(key);
}

static inline TyThreadState *
tstate_tss_get(Ty_tss_t *key)
{
    assert(tstate_tss_initialized(key));
    return (TyThreadState *)TyThread_tss_get(key);
}

static inline int
tstate_tss_set(Ty_tss_t *key, TyThreadState *tstate)
{
    assert(tstate != NULL);
    assert(tstate_tss_initialized(key));
    return TyThread_tss_set(key, (void *)tstate);
}

static inline int
tstate_tss_clear(Ty_tss_t *key)
{
    assert(tstate_tss_initialized(key));
    return TyThread_tss_set(key, (void *)NULL);
}

#ifdef HAVE_FORK
/* Reset the TSS key - called by TyOS_AfterFork_Child().
 * This should not be necessary, but some - buggy - pthread implementations
 * don't reset TSS upon fork(), see issue #10517.
 */
static TyStatus
tstate_tss_reinit(Ty_tss_t *key)
{
    if (!tstate_tss_initialized(key)) {
        return _TyStatus_OK();
    }
    TyThreadState *tstate = tstate_tss_get(key);

    tstate_tss_fini(key);
    if (tstate_tss_init(key) != 0) {
        return _TyStatus_NO_MEMORY();
    }

    /* If the thread had an associated auto thread state, reassociate it with
     * the new key. */
    if (tstate && tstate_tss_set(key, tstate) != 0) {
        return _TyStatus_ERR("failed to re-set autoTSSkey");
    }
    return _TyStatus_OK();
}
#endif


/*
   The stored thread state is set by bind_tstate() (AKA TyThreadState_Bind().

   The GIL does no need to be held for these.
  */

#define gilstate_tss_initialized(runtime) \
    tstate_tss_initialized(&(runtime)->autoTSSkey)
#define gilstate_tss_init(runtime) \
    tstate_tss_init(&(runtime)->autoTSSkey)
#define gilstate_tss_fini(runtime) \
    tstate_tss_fini(&(runtime)->autoTSSkey)
#define gilstate_tss_get(runtime) \
    tstate_tss_get(&(runtime)->autoTSSkey)
#define _gilstate_tss_set(runtime, tstate) \
    tstate_tss_set(&(runtime)->autoTSSkey, tstate)
#define _gilstate_tss_clear(runtime) \
    tstate_tss_clear(&(runtime)->autoTSSkey)
#define gilstate_tss_reinit(runtime) \
    tstate_tss_reinit(&(runtime)->autoTSSkey)

static inline void
gilstate_tss_set(_PyRuntimeState *runtime, TyThreadState *tstate)
{
    assert(tstate != NULL && tstate->interp->runtime == runtime);
    if (_gilstate_tss_set(runtime, tstate) != 0) {
        Ty_FatalError("failed to set current tstate (TSS)");
    }
}

static inline void
gilstate_tss_clear(_PyRuntimeState *runtime)
{
    if (_gilstate_tss_clear(runtime) != 0) {
        Ty_FatalError("failed to clear current tstate (TSS)");
    }
}


#ifndef NDEBUG
static inline int tstate_is_alive(TyThreadState *tstate);

static inline int
tstate_is_bound(TyThreadState *tstate)
{
    return tstate->_status.bound && !tstate->_status.unbound;
}
#endif  // !NDEBUG

static void bind_gilstate_tstate(TyThreadState *);
static void unbind_gilstate_tstate(TyThreadState *);

static void tstate_mimalloc_bind(TyThreadState *);

static void
bind_tstate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    assert(tstate_is_alive(tstate) && !tstate->_status.bound);
    assert(!tstate->_status.unbound);  // just in case
    assert(!tstate->_status.bound_gilstate);
    assert(tstate != gilstate_tss_get(tstate->interp->runtime));
    assert(!tstate->_status.active);
    assert(tstate->thread_id == 0);
    assert(tstate->native_thread_id == 0);

    // Currently we don't necessarily store the thread state
    // in thread-local storage (e.g. per-interpreter).

    tstate->thread_id = TyThread_get_thread_ident();
#ifdef PY_HAVE_THREAD_NATIVE_ID
    tstate->native_thread_id = TyThread_get_thread_native_id();
#endif

#ifdef Ty_GIL_DISABLED
    // Initialize biased reference counting inter-thread queue. Note that this
    // needs to be initialized from the active thread.
    _Ty_brc_init_thread(tstate);
#endif

    // mimalloc state needs to be initialized from the active thread.
    tstate_mimalloc_bind(tstate);

    tstate->_status.bound = 1;
}

static void
unbind_tstate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    assert(tstate_is_bound(tstate));
#ifndef HAVE_PTHREAD_STUBS
    assert(tstate->thread_id > 0);
#endif
#ifdef PY_HAVE_THREAD_NATIVE_ID
    assert(tstate->native_thread_id > 0);
#endif

    // We leave thread_id and native_thread_id alone
    // since they can be useful for debugging.
    // Check the `_status` field to know if these values
    // are still valid.

    // We leave tstate->_status.bound set to 1
    // to indicate it was previously bound.
    tstate->_status.unbound = 1;
}


/* Stick the thread state for this thread in thread specific storage.

   When a thread state is created for a thread by some mechanism
   other than TyGILState_Ensure(), it's important that the GILState
   machinery knows about it so it doesn't try to create another
   thread state for the thread.
   (This is a better fix for SF bug #1010677 than the first one attempted.)

   The only situation where you can legitimately have more than one
   thread state for an OS level thread is when there are multiple
   interpreters.

   Before 3.12, the TyGILState_*() APIs didn't work with multiple
   interpreters (see bpo-10915 and bpo-15751), so this function used
   to set TSS only once.  Thus, the first thread state created for that
   given OS level thread would "win", which seemed reasonable behaviour.
*/

static void
bind_gilstate_tstate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    assert(tstate_is_alive(tstate));
    assert(tstate_is_bound(tstate));
    // XXX assert(!tstate->_status.active);
    assert(!tstate->_status.bound_gilstate);

    _PyRuntimeState *runtime = tstate->interp->runtime;
    TyThreadState *tcur = gilstate_tss_get(runtime);
    assert(tstate != tcur);

    if (tcur != NULL) {
        tcur->_status.bound_gilstate = 0;
    }
    gilstate_tss_set(runtime, tstate);
    tstate->_status.bound_gilstate = 1;
}

static void
unbind_gilstate_tstate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    // XXX assert(tstate_is_alive(tstate));
    assert(tstate_is_bound(tstate));
    // XXX assert(!tstate->_status.active);
    assert(tstate->_status.bound_gilstate);
    assert(tstate == gilstate_tss_get(tstate->interp->runtime));

    gilstate_tss_clear(tstate->interp->runtime);
    tstate->_status.bound_gilstate = 0;
}


//----------------------------------------------
// the thread state that currently holds the GIL
//----------------------------------------------

/* This is not exported, as it is not reliable!  It can only
   ever be compared to the state for the *current* thread.
   * If not equal, then it doesn't matter that the actual
     value may change immediately after comparison, as it can't
     possibly change to the current thread's state.
   * If equal, then the current thread holds the lock, so the value can't
     change until we yield the lock.
*/
static int
holds_gil(TyThreadState *tstate)
{
    // XXX Fall back to tstate->interp->runtime->ceval.gil.last_holder
    // (and tstate->interp->runtime->ceval.gil.locked).
    assert(tstate != NULL);
    /* Must be the tstate for this thread */
    assert(tstate == gilstate_tss_get(tstate->interp->runtime));
    return tstate == current_fast_get();
}


/****************************/
/* the global runtime state */
/****************************/

//----------
// lifecycle
//----------

/* Suppress deprecation warning for PyBytesObject.ob_shash */
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
/* We use "initial" if the runtime gets re-used
   (e.g. Ty_Finalize() followed by Ty_Initialize().
   Note that we initialize "initial" relative to _PyRuntime,
   to ensure pre-initialized pointers point to the active
   runtime state (and not "initial"). */
static const _PyRuntimeState initial = _PyRuntimeState_INIT(_PyRuntime, "");
_Ty_COMP_DIAG_POP

#define LOCKS_INIT(runtime) \
    { \
        &(runtime)->interpreters.mutex, \
        &(runtime)->xi.data_lookup.registry.mutex, \
        &(runtime)->unicode_state.ids.mutex, \
        &(runtime)->imports.extensions.mutex, \
        &(runtime)->ceval.pending_mainthread.mutex, \
        &(runtime)->ceval.sys_trace_profile_mutex, \
        &(runtime)->atexit.mutex, \
        &(runtime)->audit_hooks.mutex, \
        &(runtime)->allocators.mutex, \
        &(runtime)->_main_interpreter.types.mutex, \
        &(runtime)->_main_interpreter.code_state.mutex, \
    }

static void
init_runtime(_PyRuntimeState *runtime,
             void *open_code_hook, void *open_code_userdata,
             _Ty_AuditHookEntry *audit_hook_head,
             Ty_ssize_t unicode_next_index)
{
    assert(!runtime->preinitializing);
    assert(!runtime->preinitialized);
    assert(!runtime->core_initialized);
    assert(!runtime->initialized);
    assert(!runtime->_initialized);

    runtime->open_code_hook = open_code_hook;
    runtime->open_code_userdata = open_code_userdata;
    runtime->audit_hooks.head = audit_hook_head;

    TyPreConfig_InitPythonConfig(&runtime->preconfig);

    // Set it to the ID of the main thread of the main interpreter.
    runtime->main_thread = TyThread_get_thread_ident();

    runtime->unicode_state.ids.next_index = unicode_next_index;

#if defined(__EMSCRIPTEN__) && defined(PY_CALL_TRAMPOLINE)
    _Ty_EmscriptenTrampoline_Init(runtime);
#endif

    runtime->_initialized = 1;
}

TyStatus
_PyRuntimeState_Init(_PyRuntimeState *runtime)
{
    /* We preserve the hook across init, because there is
       currently no public API to set it between runtime
       initialization and interpreter initialization. */
    void *open_code_hook = runtime->open_code_hook;
    void *open_code_userdata = runtime->open_code_userdata;
    _Ty_AuditHookEntry *audit_hook_head = runtime->audit_hooks.head;
    // bpo-42882: Preserve next_index value if Ty_Initialize()/Ty_Finalize()
    // is called multiple times.
    Ty_ssize_t unicode_next_index = runtime->unicode_state.ids.next_index;

    if (runtime->_initialized) {
        // Ty_Initialize() must be running again.
        // Reset to _PyRuntimeState_INIT.
        memcpy(runtime, &initial, sizeof(*runtime));
        // Preserve the cookie from the original runtime.
        memcpy(runtime->debug_offsets.cookie, _Ty_Debug_Cookie, 8);
        assert(!runtime->_initialized);
    }

    TyStatus status = _TyTime_Init(&runtime->time);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (gilstate_tss_init(runtime) != 0) {
        _PyRuntimeState_Fini(runtime);
        return _TyStatus_NO_MEMORY();
    }

    if (TyThread_tss_create(&runtime->trashTSSkey) != 0) {
        _PyRuntimeState_Fini(runtime);
        return _TyStatus_NO_MEMORY();
    }

    init_runtime(runtime, open_code_hook, open_code_userdata, audit_hook_head,
                 unicode_next_index);

    return _TyStatus_OK();
}

void
_PyRuntimeState_Fini(_PyRuntimeState *runtime)
{
#ifdef Ty_REF_DEBUG
    /* The count is cleared by _Ty_FinalizeRefTotal(). */
    assert(runtime->object_state.interpreter_leaks == 0);
#endif

    if (gilstate_tss_initialized(runtime)) {
        gilstate_tss_fini(runtime);
    }

    if (TyThread_tss_is_created(&runtime->trashTSSkey)) {
        TyThread_tss_delete(&runtime->trashTSSkey);
    }
}

#ifdef HAVE_FORK
/* This function is called from TyOS_AfterFork_Child to ensure that
   newly created child processes do not share locks with the parent. */
TyStatus
_PyRuntimeState_ReInitThreads(_PyRuntimeState *runtime)
{
    // This was initially set in _PyRuntimeState_Init().
    runtime->main_thread = TyThread_get_thread_ident();

    // Clears the parking lot. Any waiting threads are dead. This must be
    // called before releasing any locks that use the parking lot.
    _PyParkingLot_AfterFork();

    // Re-initialize global locks
    PyMutex *locks[] = LOCKS_INIT(runtime);
    for (size_t i = 0; i < Ty_ARRAY_LENGTH(locks); i++) {
        _PyMutex_at_fork_reinit(locks[i]);
    }
#ifdef Ty_GIL_DISABLED
    for (TyInterpreterState *interp = runtime->interpreters.head;
         interp != NULL; interp = interp->next)
    {
        for (int i = 0; i < NUM_WEAKREF_LIST_LOCKS; i++) {
            _PyMutex_at_fork_reinit(&interp->weakref_locks[i]);
        }
    }
#endif

    _PyTypes_AfterFork();

    TyStatus status = gilstate_tss_reinit(runtime);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (TyThread_tss_is_created(&runtime->trashTSSkey)) {
        TyThread_tss_delete(&runtime->trashTSSkey);
    }
    if (TyThread_tss_create(&runtime->trashTSSkey) != 0) {
        return _TyStatus_NO_MEMORY();
    }

    _PyThread_AfterFork(&runtime->threads);

    return _TyStatus_OK();
}
#endif


/*************************************/
/* the per-interpreter runtime state */
/*************************************/

//----------
// lifecycle
//----------

/* Calling this indicates that the runtime is ready to create interpreters. */

TyStatus
_TyInterpreterState_Enable(_PyRuntimeState *runtime)
{
    struct pyinterpreters *interpreters = &runtime->interpreters;
    interpreters->next_id = 0;
    return _TyStatus_OK();
}

static TyInterpreterState *
alloc_interpreter(void)
{
    size_t alignment = _Alignof(TyInterpreterState);
    size_t allocsize = sizeof(TyInterpreterState) + alignment - 1;
    void *mem = TyMem_RawCalloc(1, allocsize);
    if (mem == NULL) {
        return NULL;
    }
    TyInterpreterState *interp = _Ty_ALIGN_UP(mem, alignment);
    assert(_Ty_IS_ALIGNED(interp, alignment));
    interp->_malloced = mem;
    return interp;
}

static void
free_interpreter(TyInterpreterState *interp)
{
    // The main interpreter is statically allocated so
    // should not be freed.
    if (interp != &_PyRuntime._main_interpreter) {
        if (_TyMem_obmalloc_state_on_heap(interp)) {
            // interpreter has its own obmalloc state, free it
            TyMem_RawFree(interp->obmalloc);
            interp->obmalloc = NULL;
        }
        assert(_Ty_IS_ALIGNED(interp, _Alignof(TyInterpreterState)));
        TyMem_RawFree(interp->_malloced);
    }
}

#ifndef NDEBUG
static inline int check_interpreter_whence(long);
#endif

/* Get the interpreter state to a minimal consistent state.
   Further init happens in pylifecycle.c before it can be used.
   All fields not initialized here are expected to be zeroed out,
   e.g. by TyMem_RawCalloc() or memset(), or otherwise pre-initialized.
   The runtime state is not manipulated.  Instead it is assumed that
   the interpreter is getting added to the runtime.

   Note that the main interpreter was statically initialized as part
   of the runtime and most state is already set properly.  That leaves
   a small number of fields to initialize dynamically, as well as some
   that are initialized lazily.

   For subinterpreters we memcpy() the main interpreter in
   TyInterpreterState_New(), leaving it in the same mostly-initialized
   state.  The only difference is that the interpreter has some
   self-referential state that is statically initializexd to the
   main interpreter.  We fix those fields here, in addition
   to the other dynamically initialized fields.
  */
static TyStatus
init_interpreter(TyInterpreterState *interp,
                 _PyRuntimeState *runtime, int64_t id,
                 TyInterpreterState *next,
                 long whence)
{
    if (interp->_initialized) {
        return _TyStatus_ERR("interpreter already initialized");
    }

    assert(interp->_whence == _TyInterpreterState_WHENCE_NOTSET);
    assert(check_interpreter_whence(whence) == 0);
    interp->_whence = whence;

    assert(runtime != NULL);
    interp->runtime = runtime;

    assert(id > 0 || (id == 0 && interp == runtime->interpreters.main));
    interp->id = id;

    interp->id_refcount = 0;

    assert(runtime->interpreters.head == interp);
    assert(next != NULL || (interp == runtime->interpreters.main));
    interp->next = next;

    interp->threads.preallocated = &interp->_initial_thread;

    // We would call _TyObject_InitState() at this point
    // if interp->feature_flags were alredy set.

    _TyEval_InitState(interp);
    _TyGC_InitState(&interp->gc);
    TyConfig_InitTyphonConfig(&interp->config);
    _TyType_InitCache(interp);
#ifdef Ty_GIL_DISABLED
    _Ty_brc_init_state(interp);
#endif
    llist_init(&interp->mem_free_queue.head);
    llist_init(&interp->asyncio_tasks_head);
    interp->asyncio_tasks_lock = (PyMutex){0};
    for (int i = 0; i < _PY_MONITORING_UNGROUPED_EVENTS; i++) {
        interp->monitors.tools[i] = 0;
    }
    for (int t = 0; t < PY_MONITORING_TOOL_IDS; t++) {
        for (int e = 0; e < _PY_MONITORING_EVENTS; e++) {
            interp->monitoring_callables[t][e] = NULL;

        }
        interp->monitoring_tool_versions[t] = 0;
    }
    interp->sys_profile_initialized = false;
    interp->sys_trace_initialized = false;
    interp->_code_object_generation = 0;
    interp->jit = false;
    interp->executor_list_head = NULL;
    interp->executor_deletion_list_head = NULL;
    interp->executor_deletion_list_remaining_capacity = 0;
    interp->trace_run_counter = JIT_CLEANUP_THRESHOLD;
    if (interp != &runtime->_main_interpreter) {
        /* Fix the self-referential, statically initialized fields. */
        interp->dtoa = (struct _dtoa_state)_dtoa_state_INIT(interp);
    }
#if !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)
    interp->next_stackref = INITIAL_STACKREF_INDEX;
    _Ty_hashtable_allocator_t alloc = {
        .malloc = malloc,
        .free = free,
    };
    interp->open_stackrefs_table = _Ty_hashtable_new_full(
        _Ty_hashtable_hash_ptr,
        _Ty_hashtable_compare_direct,
        NULL,
        NULL,
        &alloc
    );
#  ifdef Ty_STACKREF_CLOSE_DEBUG
    interp->closed_stackrefs_table = _Ty_hashtable_new_full(
        _Ty_hashtable_hash_ptr,
        _Ty_hashtable_compare_direct,
        NULL,
        NULL,
        &alloc
    );
#  endif
    _Ty_stackref_associate(interp, Ty_None, PyStackRef_None);
    _Ty_stackref_associate(interp, Ty_False, PyStackRef_False);
    _Ty_stackref_associate(interp, Ty_True, PyStackRef_True);
#endif

    interp->_initialized = 1;
    return _TyStatus_OK();
}


TyStatus
_TyInterpreterState_New(TyThreadState *tstate, TyInterpreterState **pinterp)
{
    *pinterp = NULL;

    // Don't get runtime from tstate since tstate can be NULL
    _PyRuntimeState *runtime = &_PyRuntime;

    // tstate is NULL when pycore_create_interpreter() calls
    // _TyInterpreterState_New() to create the main interpreter.
    if (tstate != NULL) {
        if (_TySys_Audit(tstate, "cpython.TyInterpreterState_New", NULL) < 0) {
            return _TyStatus_ERR("sys.audit failed");
        }
    }

    /* We completely serialize creation of multiple interpreters, since
       it simplifies things here and blocking concurrent calls isn't a problem.
       Regardless, we must fully block subinterpreter creation until
       after the main interpreter is created. */
    HEAD_LOCK(runtime);

    struct pyinterpreters *interpreters = &runtime->interpreters;
    int64_t id = interpreters->next_id;
    interpreters->next_id += 1;

    // Allocate the interpreter and add it to the runtime state.
    TyInterpreterState *interp;
    TyStatus status;
    TyInterpreterState *old_head = interpreters->head;
    if (old_head == NULL) {
        // We are creating the main interpreter.
        assert(interpreters->main == NULL);
        assert(id == 0);

        interp = &runtime->_main_interpreter;
        assert(interp->id == 0);
        assert(interp->next == NULL);

        interpreters->main = interp;
    }
    else {
        assert(interpreters->main != NULL);
        assert(id != 0);

        interp = alloc_interpreter();
        if (interp == NULL) {
            status = _TyStatus_NO_MEMORY();
            goto error;
        }
        // Set to _TyInterpreterState_INIT.
        memcpy(interp, &initial._main_interpreter, sizeof(*interp));

        if (id < 0) {
            /* overflow or Ty_Initialize() not called yet! */
            status = _TyStatus_ERR("failed to get an interpreter ID");
            goto error;
        }
    }
    interpreters->head = interp;

    long whence = _TyInterpreterState_WHENCE_UNKNOWN;
    status = init_interpreter(interp, runtime,
                              id, old_head, whence);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    HEAD_UNLOCK(runtime);

    assert(interp != NULL);
    *pinterp = interp;
    return _TyStatus_OK();

error:
    HEAD_UNLOCK(runtime);

    if (interp != NULL) {
        free_interpreter(interp);
    }
    return status;
}


TyInterpreterState *
TyInterpreterState_New(void)
{
    // tstate can be NULL
    TyThreadState *tstate = current_fast_get();

    TyInterpreterState *interp;
    TyStatus status = _TyInterpreterState_New(tstate, &interp);
    if (_TyStatus_EXCEPTION(status)) {
        Ty_ExitStatusException(status);
    }
    assert(interp != NULL);
    return interp;
}

#if !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)
extern void
_Ty_stackref_report_leaks(TyInterpreterState *interp);
#endif

static void
interpreter_clear(TyInterpreterState *interp, TyThreadState *tstate)
{
    assert(interp != NULL);
    assert(tstate != NULL);
    _PyRuntimeState *runtime = interp->runtime;

    /* XXX Conditions we need to enforce:

       * the GIL must be held by the current thread
       * tstate must be the "current" thread state (current_fast_get())
       * tstate->interp must be interp
       * for the main interpreter, tstate must be the main thread
     */
    // XXX Ideally, we would not rely on any thread state in this function
    // (and we would drop the "tstate" argument).

    if (_TySys_Audit(tstate, "cpython.TyInterpreterState_Clear", NULL) < 0) {
        _TyErr_Clear(tstate);
    }

    // Clear the current/main thread state last.
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, p) {
        // See https://github.com/python/cpython/issues/102126
        // Must be called without HEAD_LOCK held as it can deadlock
        // if any finalizer tries to acquire that lock.
        HEAD_UNLOCK(runtime);
        TyThreadState_Clear(p);
        HEAD_LOCK(runtime);
    }
    _Ty_FOR_EACH_TSTATE_END(interp);
    if (tstate->interp == interp) {
        /* We fix tstate->_status below when we for sure aren't using it
           (e.g. no longer need the GIL). */
        // XXX Eliminate the need to do this.
        tstate->_status.cleared = 0;
    }

    /* It is possible that any of the objects below have a finalizer
       that runs Python code or otherwise relies on a thread state
       or even the interpreter state.  For now we trust that isn't
       a problem.
     */
    // XXX Make sure we properly deal with problematic finalizers.

    Ty_CLEAR(interp->audit_hooks);

    // At this time, all the threads should be cleared so we don't need atomic
    // operations for instrumentation_version or eval_breaker.
    interp->ceval.instrumentation_version = 0;
    tstate->eval_breaker = 0;

    for (int i = 0; i < _PY_MONITORING_UNGROUPED_EVENTS; i++) {
        interp->monitors.tools[i] = 0;
    }
    for (int t = 0; t < PY_MONITORING_TOOL_IDS; t++) {
        for (int e = 0; e < _PY_MONITORING_EVENTS; e++) {
            Ty_CLEAR(interp->monitoring_callables[t][e]);
        }
    }
    interp->sys_profile_initialized = false;
    interp->sys_trace_initialized = false;
    for (int t = 0; t < PY_MONITORING_TOOL_IDS; t++) {
        Ty_CLEAR(interp->monitoring_tool_names[t]);
    }
    interp->_code_object_generation = 0;
#ifdef Ty_GIL_DISABLED
    interp->tlbc_indices.tlbc_generation = 0;
#endif

    TyConfig_Clear(&interp->config);
    _PyCodec_Fini(interp);

    assert(interp->imports.modules == NULL);
    assert(interp->imports.modules_by_index == NULL);
    assert(interp->imports.importlib == NULL);
    assert(interp->imports.import_func == NULL);

    Ty_CLEAR(interp->sysdict_copy);
    Ty_CLEAR(interp->builtins_copy);
    Ty_CLEAR(interp->dict);
#ifdef HAVE_FORK
    Ty_CLEAR(interp->before_forkers);
    Ty_CLEAR(interp->after_forkers_parent);
    Ty_CLEAR(interp->after_forkers_child);
#endif


#ifdef _Ty_TIER2
    _Ty_ClearExecutorDeletionList(interp);
#endif
    _TyAST_Fini(interp);
    _TyWarnings_Fini(interp);
    _PyAtExit_Fini(interp);

    // All Python types must be destroyed before the last GC collection. Python
    // types create a reference cycle to themselves in their in their
    // TyTypeObject.tp_mro member (the tuple contains the type).

    /* Last garbage collection on this interpreter */
    _TyGC_CollectNoFail(tstate);
    _TyGC_Fini(interp);

    /* We don't clear sysdict and builtins until the end of this function.
       Because clearing other attributes can execute arbitrary Python code
       which requires sysdict and builtins. */
    TyDict_Clear(interp->sysdict);
    TyDict_Clear(interp->builtins);
    Ty_CLEAR(interp->sysdict);
    Ty_CLEAR(interp->builtins);

#if !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)
#  ifdef Ty_STACKREF_CLOSE_DEBUG
    _Ty_hashtable_destroy(interp->closed_stackrefs_table);
    interp->closed_stackrefs_table = NULL;
#  endif
    _Ty_stackref_report_leaks(interp);
    _Ty_hashtable_destroy(interp->open_stackrefs_table);
    interp->open_stackrefs_table = NULL;
#endif

    if (tstate->interp == interp) {
        /* We are now safe to fix tstate->_status.cleared. */
        // XXX Do this (much) earlier?
        tstate->_status.cleared = 1;
    }

    for (int i=0; i < DICT_MAX_WATCHERS; i++) {
        interp->dict_state.watchers[i] = NULL;
    }

    for (int i=0; i < TYPE_MAX_WATCHERS; i++) {
        interp->type_watchers[i] = NULL;
    }

    for (int i=0; i < FUNC_MAX_WATCHERS; i++) {
        interp->func_watchers[i] = NULL;
    }
    interp->active_func_watchers = 0;

    for (int i=0; i < CODE_MAX_WATCHERS; i++) {
        interp->code_watchers[i] = NULL;
    }
    interp->active_code_watchers = 0;

    for (int i=0; i < CONTEXT_MAX_WATCHERS; i++) {
        interp->context_watchers[i] = NULL;
    }
    interp->active_context_watchers = 0;
    // XXX Once we have one allocator per interpreter (i.e.
    // per-interpreter GC) we must ensure that all of the interpreter's
    // objects have been cleaned up at the point.

    // We could clear interp->threads.freelist here
    // if it held more than just the initial thread state.
}


void
TyInterpreterState_Clear(TyInterpreterState *interp)
{
    // Use the current Python thread state to call audit hooks and to collect
    // garbage. It can be different than the current Python thread state
    // of 'interp'.
    TyThreadState *current_tstate = current_fast_get();
    _TyImport_ClearCore(interp);
    interpreter_clear(interp, current_tstate);
}


void
_TyInterpreterState_Clear(TyThreadState *tstate)
{
    _TyImport_ClearCore(tstate->interp);
    interpreter_clear(tstate->interp, tstate);
}


static inline void tstate_deactivate(TyThreadState *tstate);
static void tstate_set_detached(TyThreadState *tstate, int detached_state);
static void zapthreads(TyInterpreterState *interp);

void
TyInterpreterState_Delete(TyInterpreterState *interp)
{
    _PyRuntimeState *runtime = interp->runtime;
    struct pyinterpreters *interpreters = &runtime->interpreters;

    // XXX Clearing the "current" thread state should happen before
    // we start finalizing the interpreter (or the current thread state).
    TyThreadState *tcur = current_fast_get();
    if (tcur != NULL && interp == tcur->interp) {
        /* Unset current thread.  After this, many C API calls become crashy. */
        _TyThreadState_Detach(tcur);
    }

    zapthreads(interp);

    // XXX These two calls should be done at the end of clear_interpreter(),
    // but currently some objects get decref'ed after that.
#ifdef Ty_REF_DEBUG
    _TyInterpreterState_FinalizeRefTotal(interp);
#endif
    _TyInterpreterState_FinalizeAllocatedBlocks(interp);

    HEAD_LOCK(runtime);
    TyInterpreterState **p;
    for (p = &interpreters->head; ; p = &(*p)->next) {
        if (*p == NULL) {
            Ty_FatalError("NULL interpreter");
        }
        if (*p == interp) {
            break;
        }
    }
    if (interp->threads.head != NULL) {
        Ty_FatalError("remaining threads");
    }
    *p = interp->next;

    if (interpreters->main == interp) {
        interpreters->main = NULL;
        if (interpreters->head != NULL) {
            Ty_FatalError("remaining subinterpreters");
        }
    }
    HEAD_UNLOCK(runtime);

    _Ty_qsbr_fini(interp);

    _TyObject_FiniState(interp);

    free_interpreter(interp);
}


#ifdef HAVE_FORK
/*
 * Delete all interpreter states except the main interpreter.  If there
 * is a current interpreter state, it *must* be the main interpreter.
 */
TyStatus
_TyInterpreterState_DeleteExceptMain(_PyRuntimeState *runtime)
{
    struct pyinterpreters *interpreters = &runtime->interpreters;

    TyThreadState *tstate = _TyThreadState_Swap(runtime, NULL);
    if (tstate != NULL && tstate->interp != interpreters->main) {
        return _TyStatus_ERR("not main interpreter");
    }

    HEAD_LOCK(runtime);
    TyInterpreterState *interp = interpreters->head;
    interpreters->head = NULL;
    while (interp != NULL) {
        if (interp == interpreters->main) {
            interpreters->main->next = NULL;
            interpreters->head = interp;
            interp = interp->next;
            continue;
        }

        // XXX Won't this fail since TyInterpreterState_Clear() requires
        // the "current" tstate to be set?
        TyInterpreterState_Clear(interp);  // XXX must activate?
        zapthreads(interp);
        TyInterpreterState *prev_interp = interp;
        interp = interp->next;
        free_interpreter(prev_interp);
    }
    HEAD_UNLOCK(runtime);

    if (interpreters->head == NULL) {
        return _TyStatus_ERR("missing main interpreter");
    }
    _TyThreadState_Swap(runtime, tstate);
    return _TyStatus_OK();
}
#endif

static inline void
set_main_thread(TyInterpreterState *interp, TyThreadState *tstate)
{
    _Ty_atomic_store_ptr_relaxed(&interp->threads.main, tstate);
}

static inline TyThreadState *
get_main_thread(TyInterpreterState *interp)
{
    return _Ty_atomic_load_ptr_relaxed(&interp->threads.main);
}

void
_TyErr_SetInterpreterAlreadyRunning(void)
{
    TyErr_SetString(TyExc_InterpreterError, "interpreter already running");
}

int
_TyInterpreterState_SetRunningMain(TyInterpreterState *interp)
{
    if (get_main_thread(interp) != NULL) {
        _TyErr_SetInterpreterAlreadyRunning();
        return -1;
    }
    TyThreadState *tstate = current_fast_get();
    _Ty_EnsureTstateNotNULL(tstate);
    if (tstate->interp != interp) {
        TyErr_SetString(TyExc_RuntimeError,
                        "current tstate has wrong interpreter");
        return -1;
    }
    set_main_thread(interp, tstate);

    return 0;
}

void
_TyInterpreterState_SetNotRunningMain(TyInterpreterState *interp)
{
    assert(get_main_thread(interp) == current_fast_get());
    set_main_thread(interp, NULL);
}

int
_TyInterpreterState_IsRunningMain(TyInterpreterState *interp)
{
    if (get_main_thread(interp) != NULL) {
        return 1;
    }
    // Embedders might not know to call _TyInterpreterState_SetRunningMain(),
    // so their main thread wouldn't show it is running the main interpreter's
    // program.  (Ty_Main() doesn't have this problem.)  For now this isn't
    // critical.  If it were, we would need to infer "running main" from other
    // information, like if it's the main interpreter.  We used to do that
    // but the naive approach led to some inconsistencies that caused problems.
    return 0;
}

int
_TyThreadState_IsRunningMain(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;
    // See the note in _TyInterpreterState_IsRunningMain() about
    // possible false negatives here for embedders.
    return get_main_thread(interp) == tstate;
}

void
_TyInterpreterState_ReinitRunningMain(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;
    if (get_main_thread(interp) != tstate) {
        set_main_thread(interp, NULL);
    }
}


//----------
// accessors
//----------

int
_TyInterpreterState_IsReady(TyInterpreterState *interp)
{
    return interp->_ready;
}

#ifndef NDEBUG
static inline int
check_interpreter_whence(long whence)
{
    if(whence < 0) {
        return -1;
    }
    if (whence > _TyInterpreterState_WHENCE_MAX) {
        return -1;
    }
    return 0;
}
#endif

long
_TyInterpreterState_GetWhence(TyInterpreterState *interp)
{
    assert(check_interpreter_whence(interp->_whence) == 0);
    return interp->_whence;
}

void
_TyInterpreterState_SetWhence(TyInterpreterState *interp, long whence)
{
    assert(interp->_whence != _TyInterpreterState_WHENCE_NOTSET);
    assert(check_interpreter_whence(whence) == 0);
    interp->_whence = whence;
}


TyObject *
_Ty_GetMainModule(TyThreadState *tstate)
{
    // We return None to indicate "not found" or "bogus".
    TyObject *modules = _TyImport_GetModulesRef(tstate->interp);
    if (modules == Ty_None) {
        return modules;
    }
    TyObject *module = NULL;
    (void)PyMapping_GetOptionalItem(modules, &_Ty_ID(__main__), &module);
    Ty_DECREF(modules);
    if (module == NULL && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }
    return module;
}

int
_Ty_CheckMainModule(TyObject *module)
{
    if (module == NULL || module == Ty_None) {
        if (!TyErr_Occurred()) {
            (void)_TyErr_SetModuleNotFoundError(&_Ty_ID(__main__));
        }
        return -1;
    }
    if (!Ty_IS_TYPE(module, &TyModule_Type)) {
        /* The __main__ module has been tampered with. */
        TyObject *msg = TyUnicode_FromString("invalid __main__ module");
        if (msg != NULL) {
            (void)TyErr_SetImportError(msg, &_Ty_ID(__main__), NULL);
            Ty_DECREF(msg);
        }
        return -1;
    }
    return 0;
}


TyObject *
TyInterpreterState_GetDict(TyInterpreterState *interp)
{
    if (interp->dict == NULL) {
        interp->dict = TyDict_New();
        if (interp->dict == NULL) {
            TyErr_Clear();
        }
    }
    /* Returning NULL means no per-interpreter dict is available. */
    return interp->dict;
}


//----------
// interp ID
//----------

int64_t
_TyInterpreterState_ObjectToID(TyObject *idobj)
{
    if (!_PyIndex_Check(idobj)) {
        TyErr_Format(TyExc_TypeError,
                     "interpreter ID must be an int, got %.100s",
                     Ty_TYPE(idobj)->tp_name);
        return -1;
    }

    // This may raise OverflowError.
    // For now, we don't worry about if LLONG_MAX < INT64_MAX.
    long long id = TyLong_AsLongLong(idobj);
    if (id == -1 && TyErr_Occurred()) {
        return -1;
    }

    if (id < 0) {
        TyErr_Format(TyExc_ValueError,
                     "interpreter ID must be a non-negative int, got %R",
                     idobj);
        return -1;
    }
#if LLONG_MAX > INT64_MAX
    else if (id > INT64_MAX) {
        TyErr_SetString(TyExc_OverflowError, "int too big to convert");
        return -1;
    }
#endif
    else {
        return (int64_t)id;
    }
}

int64_t
TyInterpreterState_GetID(TyInterpreterState *interp)
{
    if (interp == NULL) {
        TyErr_SetString(TyExc_RuntimeError, "no interpreter provided");
        return -1;
    }
    return interp->id;
}

TyObject *
_TyInterpreterState_GetIDObject(TyInterpreterState *interp)
{
    int64_t interpid = interp->id;
    if (interpid < 0) {
        return NULL;
    }
    assert(interpid < LLONG_MAX);
    return TyLong_FromLongLong(interpid);
}



void
_TyInterpreterState_IDIncref(TyInterpreterState *interp)
{
    _Ty_atomic_add_ssize(&interp->id_refcount, 1);
}


void
_TyInterpreterState_IDDecref(TyInterpreterState *interp)
{
    _PyRuntimeState *runtime = interp->runtime;

    Ty_ssize_t refcount = _Ty_atomic_add_ssize(&interp->id_refcount, -1);

    if (refcount == 1 && interp->requires_idref) {
        TyThreadState *tstate =
            _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_FINI);

        // XXX Possible GILState issues?
        TyThreadState *save_tstate = _TyThreadState_Swap(runtime, tstate);
        Ty_EndInterpreter(tstate);
        _TyThreadState_Swap(runtime, save_tstate);
    }
}

int
_TyInterpreterState_RequiresIDRef(TyInterpreterState *interp)
{
    return interp->requires_idref;
}

void
_TyInterpreterState_RequireIDRef(TyInterpreterState *interp, int required)
{
    interp->requires_idref = required ? 1 : 0;
}


//-----------------------------
// look up an interpreter state
//-----------------------------

/* Return the interpreter associated with the current OS thread.

   The GIL must be held.
  */

TyInterpreterState*
TyInterpreterState_Get(void)
{
    TyThreadState *tstate = current_fast_get();
    _Ty_EnsureTstateNotNULL(tstate);
    TyInterpreterState *interp = tstate->interp;
    if (interp == NULL) {
        Ty_FatalError("no current interpreter");
    }
    return interp;
}


static TyInterpreterState *
interp_look_up_id(_PyRuntimeState *runtime, int64_t requested_id)
{
    TyInterpreterState *interp = runtime->interpreters.head;
    while (interp != NULL) {
        int64_t id = TyInterpreterState_GetID(interp);
        if (id < 0) {
            return NULL;
        }
        if (requested_id == id) {
            return interp;
        }
        interp = TyInterpreterState_Next(interp);
    }
    return NULL;
}

/* Return the interpreter state with the given ID.

   Fail with RuntimeError if the interpreter is not found. */

TyInterpreterState *
_TyInterpreterState_LookUpID(int64_t requested_id)
{
    TyInterpreterState *interp = NULL;
    if (requested_id >= 0) {
        _PyRuntimeState *runtime = &_PyRuntime;
        HEAD_LOCK(runtime);
        interp = interp_look_up_id(runtime, requested_id);
        HEAD_UNLOCK(runtime);
    }
    if (interp == NULL && !TyErr_Occurred()) {
        TyErr_Format(TyExc_InterpreterNotFoundError,
                     "unrecognized interpreter ID %lld", requested_id);
    }
    return interp;
}

TyInterpreterState *
_TyInterpreterState_LookUpIDObject(TyObject *requested_id)
{
    int64_t id = _TyInterpreterState_ObjectToID(requested_id);
    if (id < 0) {
        return NULL;
    }
    return _TyInterpreterState_LookUpID(id);
}


/********************************/
/* the per-thread runtime state */
/********************************/

#ifndef NDEBUG
static inline int
tstate_is_alive(TyThreadState *tstate)
{
    return (tstate->_status.initialized &&
            !tstate->_status.finalized &&
            !tstate->_status.cleared &&
            !tstate->_status.finalizing);
}
#endif


//----------
// lifecycle
//----------

static _PyStackChunk*
allocate_chunk(int size_in_bytes, _PyStackChunk* previous)
{
    assert(size_in_bytes % sizeof(TyObject **) == 0);
    _PyStackChunk *res = _TyObject_VirtualAlloc(size_in_bytes);
    if (res == NULL) {
        return NULL;
    }
    res->previous = previous;
    res->size = size_in_bytes;
    res->top = 0;
    return res;
}

static void
reset_threadstate(_PyThreadStateImpl *tstate)
{
    // Set to _TyThreadState_INIT directly?
    memcpy(tstate,
           &initial._main_interpreter._initial_thread,
           sizeof(*tstate));
}

static _PyThreadStateImpl *
alloc_threadstate(TyInterpreterState *interp)
{
    _PyThreadStateImpl *tstate;

    // Try the preallocated tstate first.
    tstate = _Ty_atomic_exchange_ptr(&interp->threads.preallocated, NULL);

    // Fall back to the allocator.
    if (tstate == NULL) {
        tstate = TyMem_RawCalloc(1, sizeof(_PyThreadStateImpl));
        if (tstate == NULL) {
            return NULL;
        }
        reset_threadstate(tstate);
    }
    return tstate;
}

static void
free_threadstate(_PyThreadStateImpl *tstate)
{
    TyInterpreterState *interp = tstate->base.interp;
    // The initial thread state of the interpreter is allocated
    // as part of the interpreter state so should not be freed.
    if (tstate == &interp->_initial_thread) {
        // Make it available again.
        reset_threadstate(tstate);
        assert(interp->threads.preallocated == NULL);
        _Ty_atomic_store_ptr(&interp->threads.preallocated, tstate);
    }
    else {
        TyMem_RawFree(tstate);
    }
}

static void
decref_threadstate(_PyThreadStateImpl *tstate)
{
    if (_Ty_atomic_add_ssize(&tstate->refcount, -1) == 1) {
        // The last reference to the thread state is gone.
        free_threadstate(tstate);
    }
}

/* Get the thread state to a minimal consistent state.
   Further init happens in pylifecycle.c before it can be used.
   All fields not initialized here are expected to be zeroed out,
   e.g. by TyMem_RawCalloc() or memset(), or otherwise pre-initialized.
   The interpreter state is not manipulated.  Instead it is assumed that
   the thread is getting added to the interpreter.
  */

static void
init_threadstate(_PyThreadStateImpl *_tstate,
                 TyInterpreterState *interp, uint64_t id, int whence)
{
    TyThreadState *tstate = (TyThreadState *)_tstate;
    if (tstate->_status.initialized) {
        Ty_FatalError("thread state already initialized");
    }

    assert(interp != NULL);
    tstate->interp = interp;
    tstate->eval_breaker =
        _Ty_atomic_load_uintptr_relaxed(&interp->ceval.instrumentation_version);

    // next/prev are set in add_threadstate().
    assert(tstate->next == NULL);
    assert(tstate->prev == NULL);

    assert(tstate->_whence == _TyThreadState_WHENCE_NOTSET);
    assert(whence >= 0 && whence <= _TyThreadState_WHENCE_EXEC);
    tstate->_whence = whence;

    assert(id > 0);
    tstate->id = id;

    // thread_id and native_thread_id are set in bind_tstate().

    tstate->py_recursion_limit = interp->ceval.recursion_limit;
    tstate->py_recursion_remaining = interp->ceval.recursion_limit;
    tstate->exc_info = &tstate->exc_state;

    // TyGILState_Release must not try to delete this thread state.
    // This is cleared when TyGILState_Ensure() creates the thread state.
    tstate->gilstate_counter = 1;

    tstate->current_frame = NULL;
    tstate->datastack_chunk = NULL;
    tstate->datastack_top = NULL;
    tstate->datastack_limit = NULL;
    tstate->what_event = -1;
    tstate->current_executor = NULL;
    tstate->dict_global_version = 0;

    _tstate->c_stack_soft_limit = UINTPTR_MAX;
    _tstate->c_stack_top = 0;
    _tstate->c_stack_hard_limit = 0;

    _tstate->asyncio_running_loop = NULL;
    _tstate->asyncio_running_task = NULL;

    tstate->delete_later = NULL;

    llist_init(&_tstate->mem_free_queue);
    llist_init(&_tstate->asyncio_tasks_head);
    if (interp->stoptheworld.requested || _PyRuntime.stoptheworld.requested) {
        // Start in the suspended state if there is an ongoing stop-the-world.
        tstate->state = _Ty_THREAD_SUSPENDED;
    }

    tstate->_status.initialized = 1;
}

static void
add_threadstate(TyInterpreterState *interp, TyThreadState *tstate,
                TyThreadState *next)
{
    assert(interp->threads.head != tstate);
    if (next != NULL) {
        assert(next->prev == NULL || next->prev == tstate);
        next->prev = tstate;
    }
    tstate->next = next;
    assert(tstate->prev == NULL);
    interp->threads.head = tstate;
}

static TyThreadState *
new_threadstate(TyInterpreterState *interp, int whence)
{
    // Allocate the thread state.
    _PyThreadStateImpl *tstate = alloc_threadstate(interp);
    if (tstate == NULL) {
        return NULL;
    }

#ifdef Ty_GIL_DISABLED
    Ty_ssize_t qsbr_idx = _Ty_qsbr_reserve(interp);
    if (qsbr_idx < 0) {
        free_threadstate(tstate);
        return NULL;
    }
    int32_t tlbc_idx = _Ty_ReserveTLBCIndex(interp);
    if (tlbc_idx < 0) {
        free_threadstate(tstate);
        return NULL;
    }
#endif

    /* We serialize concurrent creation to protect global state. */
    HEAD_LOCK(interp->runtime);

    // Initialize the new thread state.
    interp->threads.next_unique_id += 1;
    uint64_t id = interp->threads.next_unique_id;
    init_threadstate(tstate, interp, id, whence);

    // Add the new thread state to the interpreter.
    TyThreadState *old_head = interp->threads.head;
    add_threadstate(interp, (TyThreadState *)tstate, old_head);

    HEAD_UNLOCK(interp->runtime);

#ifdef Ty_GIL_DISABLED
    // Must be called with lock unlocked to avoid lock ordering deadlocks.
    _Ty_qsbr_register(tstate, interp, qsbr_idx);
    tstate->tlbc_index = tlbc_idx;
#endif

    return (TyThreadState *)tstate;
}

TyThreadState *
TyThreadState_New(TyInterpreterState *interp)
{
    return _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_UNKNOWN);
}

TyThreadState *
_TyThreadState_NewBound(TyInterpreterState *interp, int whence)
{
    TyThreadState *tstate = new_threadstate(interp, whence);
    if (tstate) {
        bind_tstate(tstate);
        // This makes sure there's a gilstate tstate bound
        // as soon as possible.
        if (gilstate_tss_get(tstate->interp->runtime) == NULL) {
            bind_gilstate_tstate(tstate);
        }
    }
    return tstate;
}

// This must be followed by a call to _TyThreadState_Bind();
TyThreadState *
_TyThreadState_New(TyInterpreterState *interp, int whence)
{
    return new_threadstate(interp, whence);
}

// We keep this for stable ABI compabibility.
PyAPI_FUNC(TyThreadState*)
_TyThreadState_Prealloc(TyInterpreterState *interp)
{
    return _TyThreadState_New(interp, _TyThreadState_WHENCE_UNKNOWN);
}

// We keep this around for (accidental) stable ABI compatibility.
// Realistically, no extensions are using it.
PyAPI_FUNC(void)
_TyThreadState_Init(TyThreadState *tstate)
{
    Ty_FatalError("_TyThreadState_Init() is for internal use only");
}


static void
clear_datastack(TyThreadState *tstate)
{
    _PyStackChunk *chunk = tstate->datastack_chunk;
    tstate->datastack_chunk = NULL;
    while (chunk != NULL) {
        _PyStackChunk *prev = chunk->previous;
        _TyObject_VirtualFree(chunk, chunk->size);
        chunk = prev;
    }
}

void
TyThreadState_Clear(TyThreadState *tstate)
{
    assert(tstate->_status.initialized && !tstate->_status.cleared);
    assert(current_fast_get()->interp == tstate->interp);
    assert(!_TyThreadState_IsRunningMain(tstate));
    // XXX assert(!tstate->_status.bound || tstate->_status.unbound);
    tstate->_status.finalizing = 1;  // just in case

    /* XXX Conditions we need to enforce:

       * the GIL must be held by the current thread
       * current_fast_get()->interp must match tstate->interp
       * for the main interpreter, current_fast_get() must be the main thread
     */

    int verbose = _TyInterpreterState_GetConfig(tstate->interp)->verbose;

    if (verbose && tstate->current_frame != NULL) {
        /* bpo-20526: After the main thread calls
           _TyInterpreterState_SetFinalizing() in Ty_FinalizeEx()
           (or in Ty_EndInterpreter() for subinterpreters),
           threads must exit when trying to take the GIL.
           If a thread exit in the middle of _TyEval_EvalFrameDefault(),
           tstate->frame is not reset to its previous value.
           It is more likely with daemon threads, but it can happen
           with regular threads if threading._shutdown() fails
           (ex: interrupted by CTRL+C). */
        fprintf(stderr,
          "TyThreadState_Clear: warning: thread still has a frame\n");
    }

    if (verbose && tstate->current_exception != NULL) {
        fprintf(stderr, "TyThreadState_Clear: warning: thread has an exception set\n");
        _TyErr_Print(tstate);
    }

    /* At this point tstate shouldn't be used any more,
       neither to run Python code nor for other uses.

       This is tricky when current_fast_get() == tstate, in the same way
       as noted in interpreter_clear() above.  The below finalizers
       can possibly run Python code or otherwise use the partially
       cleared thread state.  For now we trust that isn't a problem
       in practice.
     */
    // XXX Deal with the possibility of problematic finalizers.

    /* Don't clear tstate->pyframe: it is a borrowed reference */

    Ty_CLEAR(tstate->threading_local_key);
    Ty_CLEAR(tstate->threading_local_sentinel);

    Ty_CLEAR(((_PyThreadStateImpl *)tstate)->asyncio_running_loop);
    Ty_CLEAR(((_PyThreadStateImpl *)tstate)->asyncio_running_task);


    PyMutex_Lock(&tstate->interp->asyncio_tasks_lock);
    // merge any lingering tasks from thread state to interpreter's
    // tasks list
    llist_concat(&tstate->interp->asyncio_tasks_head,
                 &((_PyThreadStateImpl *)tstate)->asyncio_tasks_head);
    PyMutex_Unlock(&tstate->interp->asyncio_tasks_lock);

    Ty_CLEAR(tstate->dict);
    Ty_CLEAR(tstate->async_exc);

    Ty_CLEAR(tstate->current_exception);

    Ty_CLEAR(tstate->exc_state.exc_value);

    /* The stack of exception states should contain just this thread. */
    if (verbose && tstate->exc_info != &tstate->exc_state) {
        fprintf(stderr,
          "TyThreadState_Clear: warning: thread still has a generator\n");
    }

#ifdef Ty_GIL_DISABLED
    PyMutex_Lock(&_PyRuntime.ceval.sys_trace_profile_mutex);
#endif

    if (tstate->c_profilefunc != NULL) {
        tstate->interp->sys_profiling_threads--;
        tstate->c_profilefunc = NULL;
    }
    if (tstate->c_tracefunc != NULL) {
        tstate->interp->sys_tracing_threads--;
        tstate->c_tracefunc = NULL;
    }

#ifdef Ty_GIL_DISABLED
    PyMutex_Unlock(&_PyRuntime.ceval.sys_trace_profile_mutex);
#endif

    Ty_CLEAR(tstate->c_profileobj);
    Ty_CLEAR(tstate->c_traceobj);

    Ty_CLEAR(tstate->async_gen_firstiter);
    Ty_CLEAR(tstate->async_gen_finalizer);

    Ty_CLEAR(tstate->context);

#ifdef Ty_GIL_DISABLED
    // Each thread should clear own freelists in free-threading builds.
    struct _Ty_freelists *freelists = _Ty_freelists_GET();
    _TyObject_ClearFreeLists(freelists, 1);

    // Merge our thread-local refcounts into the type's own refcount and
    // free our local refcount array.
    _TyObject_FinalizePerThreadRefcounts((_PyThreadStateImpl *)tstate);

    // Remove ourself from the biased reference counting table of threads.
    _Ty_brc_remove_thread(tstate);

    // Release our thread-local copies of the bytecode for reuse by another
    // thread
    _Ty_ClearTLBCIndex((_PyThreadStateImpl *)tstate);
#endif

    // Merge our queue of pointers to be freed into the interpreter queue.
    _TyMem_AbandonDelayed(tstate);

    _TyThreadState_ClearMimallocHeaps(tstate);

    tstate->_status.cleared = 1;

    // XXX Call _PyThreadStateSwap(runtime, NULL) here if "current".
    // XXX Do it as early in the function as possible.
}

static void
decrement_stoptheworld_countdown(struct _stoptheworld_state *stw);

/* Common code for TyThreadState_Delete() and TyThreadState_DeleteCurrent() */
static void
tstate_delete_common(TyThreadState *tstate, int release_gil)
{
    assert(tstate->_status.cleared && !tstate->_status.finalized);
    tstate_verify_not_active(tstate);
    assert(!_TyThreadState_IsRunningMain(tstate));

    TyInterpreterState *interp = tstate->interp;
    if (interp == NULL) {
        Ty_FatalError("NULL interpreter");
    }
    _PyRuntimeState *runtime = interp->runtime;

    HEAD_LOCK(runtime);
    if (tstate->prev) {
        tstate->prev->next = tstate->next;
    }
    else {
        interp->threads.head = tstate->next;
    }
    if (tstate->next) {
        tstate->next->prev = tstate->prev;
    }
    if (tstate->state != _Ty_THREAD_SUSPENDED) {
        // Any ongoing stop-the-world request should not wait for us because
        // our thread is getting deleted.
        if (interp->stoptheworld.requested) {
            decrement_stoptheworld_countdown(&interp->stoptheworld);
        }
        if (runtime->stoptheworld.requested) {
            decrement_stoptheworld_countdown(&runtime->stoptheworld);
        }
    }

#if defined(Ty_REF_DEBUG) && defined(Ty_GIL_DISABLED)
    // Add our portion of the total refcount to the interpreter's total.
    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    tstate->interp->object_state.reftotal += tstate_impl->reftotal;
    tstate_impl->reftotal = 0;
    assert(tstate_impl->refcounts.values == NULL);
#endif

    HEAD_UNLOCK(runtime);

    // XXX Unbind in TyThreadState_Clear(), or earlier
    // (and assert not-equal here)?
    if (tstate->_status.bound_gilstate) {
        unbind_gilstate_tstate(tstate);
    }
    if (tstate->_status.bound) {
        unbind_tstate(tstate);
    }

    // XXX Move to TyThreadState_Clear()?
    clear_datastack(tstate);

    if (release_gil) {
        _TyEval_ReleaseLock(tstate->interp, tstate, 1);
    }

#ifdef Ty_GIL_DISABLED
    _Ty_qsbr_unregister(tstate);
#endif

    tstate->_status.finalized = 1;
}

static void
zapthreads(TyInterpreterState *interp)
{
    TyThreadState *tstate;
    /* No need to lock the mutex here because this should only happen
       when the threads are all really dead (XXX famous last words).

       Cannot use _Ty_FOR_EACH_TSTATE_UNLOCKED because we are freeing
       the thread states here.
    */
    while ((tstate = interp->threads.head) != NULL) {
        tstate_verify_not_active(tstate);
        tstate_delete_common(tstate, 0);
        free_threadstate((_PyThreadStateImpl *)tstate);
    }
}


void
TyThreadState_Delete(TyThreadState *tstate)
{
    _Ty_EnsureTstateNotNULL(tstate);
    tstate_verify_not_active(tstate);
    tstate_delete_common(tstate, 0);
    free_threadstate((_PyThreadStateImpl *)tstate);
}


void
_TyThreadState_DeleteCurrent(TyThreadState *tstate)
{
    _Ty_EnsureTstateNotNULL(tstate);
#ifdef Ty_GIL_DISABLED
    _Ty_qsbr_detach(((_PyThreadStateImpl *)tstate)->qsbr);
#endif
    current_fast_clear(tstate->interp->runtime);
    tstate_delete_common(tstate, 1);  // release GIL as part of call
    free_threadstate((_PyThreadStateImpl *)tstate);
}

void
TyThreadState_DeleteCurrent(void)
{
    TyThreadState *tstate = current_fast_get();
    _TyThreadState_DeleteCurrent(tstate);
}


// Unlinks and removes all thread states from `tstate->interp`, with the
// exception of the one passed as an argument. However, it does not delete
// these thread states. Instead, it returns the removed thread states as a
// linked list.
//
// Note that if there is a current thread state, it *must* be the one
// passed as argument.  Also, this won't touch any interpreters other
// than the current one, since we don't know which thread state should
// be kept in those other interpreters.
TyThreadState *
_TyThreadState_RemoveExcept(TyThreadState *tstate)
{
    assert(tstate != NULL);
    TyInterpreterState *interp = tstate->interp;
    _PyRuntimeState *runtime = interp->runtime;

#ifdef Ty_GIL_DISABLED
    assert(runtime->stoptheworld.world_stopped);
#endif

    HEAD_LOCK(runtime);
    /* Remove all thread states, except tstate, from the linked list of
       thread states. */
    TyThreadState *list = interp->threads.head;
    if (list == tstate) {
        list = tstate->next;
    }
    if (tstate->prev) {
        tstate->prev->next = tstate->next;
    }
    if (tstate->next) {
        tstate->next->prev = tstate->prev;
    }
    tstate->prev = tstate->next = NULL;
    interp->threads.head = tstate;
    HEAD_UNLOCK(runtime);

    return list;
}

// Deletes the thread states in the linked list `list`.
//
// This is intended to be used in conjunction with _TyThreadState_RemoveExcept.
//
// If `is_after_fork` is true, the thread states are immediately freed.
// Otherwise, they are decref'd because they may still be referenced by an
// OS thread.
void
_TyThreadState_DeleteList(TyThreadState *list, int is_after_fork)
{
    // The world can't be stopped because we TyThreadState_Clear() can
    // call destructors.
    assert(!_PyRuntime.stoptheworld.world_stopped);

    TyThreadState *p, *next;
    for (p = list; p; p = next) {
        next = p->next;
        TyThreadState_Clear(p);
        if (is_after_fork) {
            free_threadstate((_PyThreadStateImpl *)p);
        }
        else {
            decref_threadstate((_PyThreadStateImpl *)p);
        }
    }
}


//----------
// accessors
//----------

/* An extension mechanism to store arbitrary additional per-thread state.
   TyThreadState_GetDict() returns a dictionary that can be used to hold such
   state; the caller should pick a unique key and store its state there.  If
   TyThreadState_GetDict() returns NULL, an exception has *not* been raised
   and the caller should assume no per-thread state is available. */

TyObject *
_TyThreadState_GetDict(TyThreadState *tstate)
{
    assert(tstate != NULL);
    if (tstate->dict == NULL) {
        tstate->dict = TyDict_New();
        if (tstate->dict == NULL) {
            _TyErr_Clear(tstate);
        }
    }
    return tstate->dict;
}


TyObject *
TyThreadState_GetDict(void)
{
    TyThreadState *tstate = current_fast_get();
    if (tstate == NULL) {
        return NULL;
    }
    return _TyThreadState_GetDict(tstate);
}


TyInterpreterState *
TyThreadState_GetInterpreter(TyThreadState *tstate)
{
    assert(tstate != NULL);
    return tstate->interp;
}


PyFrameObject*
TyThreadState_GetFrame(TyThreadState *tstate)
{
    assert(tstate != NULL);
    _PyInterpreterFrame *f = _TyThreadState_GetFrame(tstate);
    if (f == NULL) {
        return NULL;
    }
    PyFrameObject *frame = _TyFrame_GetFrameObject(f);
    if (frame == NULL) {
        TyErr_Clear();
    }
    return (PyFrameObject*)Ty_XNewRef(frame);
}


uint64_t
TyThreadState_GetID(TyThreadState *tstate)
{
    assert(tstate != NULL);
    return tstate->id;
}


static inline void
tstate_activate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    // XXX assert(tstate_is_alive(tstate));
    assert(tstate_is_bound(tstate));
    assert(!tstate->_status.active);

    assert(!tstate->_status.bound_gilstate ||
           tstate == gilstate_tss_get((tstate->interp->runtime)));
    if (!tstate->_status.bound_gilstate) {
        bind_gilstate_tstate(tstate);
    }

    tstate->_status.active = 1;
}

static inline void
tstate_deactivate(TyThreadState *tstate)
{
    assert(tstate != NULL);
    // XXX assert(tstate_is_alive(tstate));
    assert(tstate_is_bound(tstate));
    assert(tstate->_status.active);

    tstate->_status.active = 0;

    // We do not unbind the gilstate tstate here.
    // It will still be used in TyGILState_Ensure().
}

static int
tstate_try_attach(TyThreadState *tstate)
{
#ifdef Ty_GIL_DISABLED
    int expected = _Ty_THREAD_DETACHED;
    return _Ty_atomic_compare_exchange_int(&tstate->state,
                                           &expected,
                                           _Ty_THREAD_ATTACHED);
#else
    assert(tstate->state == _Ty_THREAD_DETACHED);
    tstate->state = _Ty_THREAD_ATTACHED;
    return 1;
#endif
}

static void
tstate_set_detached(TyThreadState *tstate, int detached_state)
{
    assert(_Ty_atomic_load_int_relaxed(&tstate->state) == _Ty_THREAD_ATTACHED);
#ifdef Ty_GIL_DISABLED
    _Ty_atomic_store_int(&tstate->state, detached_state);
#else
    tstate->state = detached_state;
#endif
}

static void
tstate_wait_attach(TyThreadState *tstate)
{
    do {
        int state = _Ty_atomic_load_int_relaxed(&tstate->state);
        if (state == _Ty_THREAD_SUSPENDED) {
            // Wait until we're switched out of SUSPENDED to DETACHED.
            _PyParkingLot_Park(&tstate->state, &state, sizeof(tstate->state),
                               /*timeout=*/-1, NULL, /*detach=*/0);
        }
        else if (state == _Ty_THREAD_SHUTTING_DOWN) {
            // We're shutting down, so we can't attach.
            _TyThreadState_HangThread(tstate);
        }
        else {
            assert(state == _Ty_THREAD_DETACHED);
        }
        // Once we're back in DETACHED we can re-attach
    } while (!tstate_try_attach(tstate));
}

void
_TyThreadState_Attach(TyThreadState *tstate)
{
#if defined(Ty_DEBUG)
    // This is called from TyEval_RestoreThread(). Similar
    // to it, we need to ensure errno doesn't change.
    int err = errno;
#endif

    _Ty_EnsureTstateNotNULL(tstate);
    if (current_fast_get() != NULL) {
        Ty_FatalError("non-NULL old thread state");
    }
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    if (_tstate->c_stack_hard_limit == 0) {
        _Ty_InitializeRecursionLimits(tstate);
    }

    while (1) {
        _TyEval_AcquireLock(tstate);

        // XXX assert(tstate_is_alive(tstate));
        current_fast_set(&_PyRuntime, tstate);
        if (!tstate_try_attach(tstate)) {
            tstate_wait_attach(tstate);
        }
        tstate_activate(tstate);

#ifdef Ty_GIL_DISABLED
        if (_TyEval_IsGILEnabled(tstate) && !tstate->holds_gil) {
            // The GIL was enabled between our call to _TyEval_AcquireLock()
            // and when we attached (the GIL can't go from enabled to disabled
            // here because only a thread holding the GIL can disable
            // it). Detach and try again.
            tstate_set_detached(tstate, _Ty_THREAD_DETACHED);
            tstate_deactivate(tstate);
            current_fast_clear(&_PyRuntime);
            continue;
        }
        _Ty_qsbr_attach(((_PyThreadStateImpl *)tstate)->qsbr);
#endif
        break;
    }

    // Resume previous critical section. This acquires the lock(s) from the
    // top-most critical section.
    if (tstate->critical_section != 0) {
        _PyCriticalSection_Resume(tstate);
    }

#if defined(Ty_DEBUG)
    errno = err;
#endif
}

static void
detach_thread(TyThreadState *tstate, int detached_state)
{
    // XXX assert(tstate_is_alive(tstate) && tstate_is_bound(tstate));
    assert(_Ty_atomic_load_int_relaxed(&tstate->state) == _Ty_THREAD_ATTACHED);
    assert(tstate == current_fast_get());
    if (tstate->critical_section != 0) {
        _PyCriticalSection_SuspendAll(tstate);
    }
#ifdef Ty_GIL_DISABLED
    _Ty_qsbr_detach(((_PyThreadStateImpl *)tstate)->qsbr);
#endif
    tstate_deactivate(tstate);
    tstate_set_detached(tstate, detached_state);
    current_fast_clear(&_PyRuntime);
    _TyEval_ReleaseLock(tstate->interp, tstate, 0);
}

void
_TyThreadState_Detach(TyThreadState *tstate)
{
    detach_thread(tstate, _Ty_THREAD_DETACHED);
}

void
_TyThreadState_Suspend(TyThreadState *tstate)
{
    _PyRuntimeState *runtime = &_PyRuntime;

    assert(_Ty_atomic_load_int_relaxed(&tstate->state) == _Ty_THREAD_ATTACHED);

    struct _stoptheworld_state *stw = NULL;
    HEAD_LOCK(runtime);
    if (runtime->stoptheworld.requested) {
        stw = &runtime->stoptheworld;
    }
    else if (tstate->interp->stoptheworld.requested) {
        stw = &tstate->interp->stoptheworld;
    }
    HEAD_UNLOCK(runtime);

    if (stw == NULL) {
        // Switch directly to "detached" if there is no active stop-the-world
        // request.
        detach_thread(tstate, _Ty_THREAD_DETACHED);
        return;
    }

    // Switch to "suspended" state.
    detach_thread(tstate, _Ty_THREAD_SUSPENDED);

    // Decrease the count of remaining threads needing to park.
    HEAD_LOCK(runtime);
    decrement_stoptheworld_countdown(stw);
    HEAD_UNLOCK(runtime);
}

void
_TyThreadState_SetShuttingDown(TyThreadState *tstate)
{
    _Ty_atomic_store_int(&tstate->state, _Ty_THREAD_SHUTTING_DOWN);
#ifdef Ty_GIL_DISABLED
    _PyParkingLot_UnparkAll(&tstate->state);
#endif
}

// Decrease stop-the-world counter of remaining number of threads that need to
// pause. If we are the final thread to pause, notify the requesting thread.
static void
decrement_stoptheworld_countdown(struct _stoptheworld_state *stw)
{
    assert(stw->thread_countdown > 0);
    if (--stw->thread_countdown == 0) {
        _PyEvent_Notify(&stw->stop_event);
    }
}

#ifdef Ty_GIL_DISABLED
// Interpreter for _Ty_FOR_EACH_STW_INTERP(). For global stop-the-world events,
// we start with the first interpreter and then iterate over all interpreters.
// For per-interpreter stop-the-world events, we only operate on the one
// interpreter.
static TyInterpreterState *
interp_for_stop_the_world(struct _stoptheworld_state *stw)
{
    return (stw->is_global
        ? TyInterpreterState_Head()
        : _Ty_CONTAINER_OF(stw, TyInterpreterState, stoptheworld));
}

// Loops over threads for a stop-the-world event.
// For global: all threads in all interpreters
// For per-interpreter: all threads in the interpreter
#define _Ty_FOR_EACH_STW_INTERP(stw, i)                                     \
    for (TyInterpreterState *i = interp_for_stop_the_world((stw));          \
            i != NULL; i = ((stw->is_global) ? i->next : NULL))


// Try to transition threads atomically from the "detached" state to the
// "gc stopped" state. Returns true if all threads are in the "gc stopped"
static bool
park_detached_threads(struct _stoptheworld_state *stw)
{
    int num_parked = 0;
    _Ty_FOR_EACH_STW_INTERP(stw, i) {
        _Ty_FOR_EACH_TSTATE_UNLOCKED(i, t) {
            int state = _Ty_atomic_load_int_relaxed(&t->state);
            if (state == _Ty_THREAD_DETACHED) {
                // Atomically transition to "suspended" if in "detached" state.
                if (_Ty_atomic_compare_exchange_int(
                                &t->state, &state, _Ty_THREAD_SUSPENDED)) {
                    num_parked++;
                }
            }
            else if (state == _Ty_THREAD_ATTACHED && t != stw->requester) {
                _Ty_set_eval_breaker_bit(t, _PY_EVAL_PLEASE_STOP_BIT);
            }
        }
    }
    stw->thread_countdown -= num_parked;
    assert(stw->thread_countdown >= 0);
    return num_parked > 0 && stw->thread_countdown == 0;
}

static void
stop_the_world(struct _stoptheworld_state *stw)
{
    _PyRuntimeState *runtime = &_PyRuntime;

    PyMutex_Lock(&stw->mutex);
    if (stw->is_global) {
        _PyRWMutex_Lock(&runtime->stoptheworld_mutex);
    }
    else {
        _PyRWMutex_RLock(&runtime->stoptheworld_mutex);
    }

    HEAD_LOCK(runtime);
    stw->requested = 1;
    stw->thread_countdown = 0;
    stw->stop_event = (PyEvent){0};  // zero-initialize (unset)
    stw->requester = _TyThreadState_GET();  // may be NULL

    _Ty_FOR_EACH_STW_INTERP(stw, i) {
        _Ty_FOR_EACH_TSTATE_UNLOCKED(i, t) {
            if (t != stw->requester) {
                // Count all the other threads (we don't wait on ourself).
                stw->thread_countdown++;
            }
        }
    }

    if (stw->thread_countdown == 0) {
        HEAD_UNLOCK(runtime);
        stw->world_stopped = 1;
        return;
    }

    for (;;) {
        // Switch threads that are detached to the GC stopped state
        bool stopped_all_threads = park_detached_threads(stw);
        HEAD_UNLOCK(runtime);

        if (stopped_all_threads) {
            break;
        }

        TyTime_t wait_ns = 1000*1000;  // 1ms (arbitrary, may need tuning)
        int detach = 0;
        if (PyEvent_WaitTimed(&stw->stop_event, wait_ns, detach)) {
            assert(stw->thread_countdown == 0);
            break;
        }

        HEAD_LOCK(runtime);
    }
    stw->world_stopped = 1;
}

static void
start_the_world(struct _stoptheworld_state *stw)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    assert(PyMutex_IsLocked(&stw->mutex));

    HEAD_LOCK(runtime);
    stw->requested = 0;
    stw->world_stopped = 0;
    // Switch threads back to the detached state.
    _Ty_FOR_EACH_STW_INTERP(stw, i) {
        _Ty_FOR_EACH_TSTATE_UNLOCKED(i, t) {
            if (t != stw->requester) {
                assert(_Ty_atomic_load_int_relaxed(&t->state) ==
                       _Ty_THREAD_SUSPENDED);
                _Ty_atomic_store_int(&t->state, _Ty_THREAD_DETACHED);
                _PyParkingLot_UnparkAll(&t->state);
            }
        }
    }
    stw->requester = NULL;
    HEAD_UNLOCK(runtime);
    if (stw->is_global) {
        _PyRWMutex_Unlock(&runtime->stoptheworld_mutex);
    }
    else {
        _PyRWMutex_RUnlock(&runtime->stoptheworld_mutex);
    }
    PyMutex_Unlock(&stw->mutex);
}
#endif  // Ty_GIL_DISABLED

void
_TyEval_StopTheWorldAll(_PyRuntimeState *runtime)
{
#ifdef Ty_GIL_DISABLED
    stop_the_world(&runtime->stoptheworld);
#endif
}

void
_TyEval_StartTheWorldAll(_PyRuntimeState *runtime)
{
#ifdef Ty_GIL_DISABLED
    start_the_world(&runtime->stoptheworld);
#endif
}

void
_TyEval_StopTheWorld(TyInterpreterState *interp)
{
#ifdef Ty_GIL_DISABLED
    stop_the_world(&interp->stoptheworld);
#endif
}

void
_TyEval_StartTheWorld(TyInterpreterState *interp)
{
#ifdef Ty_GIL_DISABLED
    start_the_world(&interp->stoptheworld);
#endif
}

//----------
// other API
//----------

/* Asynchronously raise an exception in a thread.
   Requested by Just van Rossum and Alex Martelli.
   To prevent naive misuse, you must write your own extension
   to call this, or use ctypes.  Must be called with the GIL held.
   Returns the number of tstates modified (normally 1, but 0 if `id` didn't
   match any known thread id).  Can be called with exc=NULL to clear an
   existing async exception.  This raises no exceptions. */

// XXX Move this to Python/ceval_gil.c?
// XXX Deprecate this.
int
TyThreadState_SetAsyncExc(unsigned long id, TyObject *exc)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    /* Although the GIL is held, a few C API functions can be called
     * without the GIL held, and in particular some that create and
     * destroy thread and interpreter states.  Those can mutate the
     * list of thread states we're traversing, so to prevent that we lock
     * head_mutex for the duration.
     */
    TyThreadState *tstate = NULL;
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, t) {
        if (t->thread_id == id) {
            tstate = t;
            break;
        }
    }
    _Ty_FOR_EACH_TSTATE_END(interp);

    if (tstate != NULL) {
        /* Tricky:  we need to decref the current value
         * (if any) in tstate->async_exc, but that can in turn
         * allow arbitrary Python code to run, including
         * perhaps calls to this function.  To prevent
         * deadlock, we need to release head_mutex before
         * the decref.
         */
        Ty_XINCREF(exc);
        TyObject *old_exc = _Ty_atomic_exchange_ptr(&tstate->async_exc, exc);

        Ty_XDECREF(old_exc);
        _Ty_set_eval_breaker_bit(tstate, _PY_ASYNC_EXCEPTION_BIT);
    }

    return tstate != NULL;
}

//---------------------------------
// API for the current thread state
//---------------------------------

TyThreadState *
TyThreadState_GetUnchecked(void)
{
    return current_fast_get();
}


TyThreadState *
TyThreadState_Get(void)
{
    TyThreadState *tstate = current_fast_get();
    _Ty_EnsureTstateNotNULL(tstate);
    return tstate;
}

TyThreadState *
_TyThreadState_Swap(_PyRuntimeState *runtime, TyThreadState *newts)
{
    TyThreadState *oldts = current_fast_get();
    if (oldts != NULL) {
        _TyThreadState_Detach(oldts);
    }
    if (newts != NULL) {
        _TyThreadState_Attach(newts);
    }
    return oldts;
}

TyThreadState *
TyThreadState_Swap(TyThreadState *newts)
{
    return _TyThreadState_Swap(&_PyRuntime, newts);
}


void
_TyThreadState_Bind(TyThreadState *tstate)
{
    // gh-104690: If Python is being finalized and TyInterpreterState_Delete()
    // was called, tstate becomes a dangling pointer.
    assert(_TyThreadState_CheckConsistency(tstate));

    bind_tstate(tstate);
    // This makes sure there's a gilstate tstate bound
    // as soon as possible.
    if (gilstate_tss_get(tstate->interp->runtime) == NULL) {
        bind_gilstate_tstate(tstate);
    }
}

#if defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
uintptr_t
_Ty_GetThreadLocal_Addr(void)
{
#ifdef HAVE_THREAD_LOCAL
    // gh-112535: Use the address of the thread-local TyThreadState variable as
    // a unique identifier for the current thread. Each thread has a unique
    // _Ty_tss_tstate variable with a unique address.
    return (uintptr_t)&_Ty_tss_tstate;
#else
#  error "no supported thread-local variable storage classifier"
#endif
}
#endif

/***********************************/
/* routines for advanced debuggers */
/***********************************/

// (requested by David Beazley)
// Don't use unless you know what you are doing!

TyInterpreterState *
TyInterpreterState_Head(void)
{
    return _PyRuntime.interpreters.head;
}

TyInterpreterState *
TyInterpreterState_Main(void)
{
    return _TyInterpreterState_Main();
}

TyInterpreterState *
TyInterpreterState_Next(TyInterpreterState *interp) {
    return interp->next;
}

TyThreadState *
TyInterpreterState_ThreadHead(TyInterpreterState *interp) {
    return interp->threads.head;
}

TyThreadState *
TyThreadState_Next(TyThreadState *tstate) {
    return tstate->next;
}


/********************************************/
/* reporting execution state of all threads */
/********************************************/

/* The implementation of sys._current_frames().  This is intended to be
   called with the GIL held, as it will be when called via
   sys._current_frames().  It's possible it would work fine even without
   the GIL held, but haven't thought enough about that.
*/
TyObject *
_PyThread_CurrentFrames(void)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    TyThreadState *tstate = current_fast_get();
    if (_TySys_Audit(tstate, "sys._current_frames", NULL) < 0) {
        return NULL;
    }

    TyObject *result = TyDict_New();
    if (result == NULL) {
        return NULL;
    }

    /* for i in all interpreters:
     *     for t in all of i's thread states:
     *          if t's frame isn't NULL, map t's id to its frame
     * Because these lists can mutate even when the GIL is held, we
     * need to grab head_mutex for the duration.
     */
    _TyEval_StopTheWorldAll(runtime);
    HEAD_LOCK(runtime);
    TyInterpreterState *i;
    for (i = runtime->interpreters.head; i != NULL; i = i->next) {
        _Ty_FOR_EACH_TSTATE_UNLOCKED(i, t) {
            _PyInterpreterFrame *frame = t->current_frame;
            frame = _TyFrame_GetFirstComplete(frame);
            if (frame == NULL) {
                continue;
            }
            TyObject *id = TyLong_FromUnsignedLong(t->thread_id);
            if (id == NULL) {
                goto fail;
            }
            TyObject *frameobj = (TyObject *)_TyFrame_GetFrameObject(frame);
            if (frameobj == NULL) {
                Ty_DECREF(id);
                goto fail;
            }
            int stat = TyDict_SetItem(result, id, frameobj);
            Ty_DECREF(id);
            if (stat < 0) {
                goto fail;
            }
        }
    }
    goto done;

fail:
    Ty_CLEAR(result);

done:
    HEAD_UNLOCK(runtime);
    _TyEval_StartTheWorldAll(runtime);
    return result;
}

/* The implementation of sys._current_exceptions().  This is intended to be
   called with the GIL held, as it will be when called via
   sys._current_exceptions().  It's possible it would work fine even without
   the GIL held, but haven't thought enough about that.
*/
TyObject *
_PyThread_CurrentExceptions(void)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    TyThreadState *tstate = current_fast_get();

    _Ty_EnsureTstateNotNULL(tstate);

    if (_TySys_Audit(tstate, "sys._current_exceptions", NULL) < 0) {
        return NULL;
    }

    TyObject *result = TyDict_New();
    if (result == NULL) {
        return NULL;
    }

    /* for i in all interpreters:
     *     for t in all of i's thread states:
     *          if t's frame isn't NULL, map t's id to its frame
     * Because these lists can mutate even when the GIL is held, we
     * need to grab head_mutex for the duration.
     */
    _TyEval_StopTheWorldAll(runtime);
    HEAD_LOCK(runtime);
    TyInterpreterState *i;
    for (i = runtime->interpreters.head; i != NULL; i = i->next) {
        _Ty_FOR_EACH_TSTATE_UNLOCKED(i, t) {
            _TyErr_StackItem *err_info = _TyErr_GetTopmostException(t);
            if (err_info == NULL) {
                continue;
            }
            TyObject *id = TyLong_FromUnsignedLong(t->thread_id);
            if (id == NULL) {
                goto fail;
            }
            TyObject *exc = err_info->exc_value;
            assert(exc == NULL ||
                   exc == Ty_None ||
                   PyExceptionInstance_Check(exc));

            int stat = TyDict_SetItem(result, id, exc == NULL ? Ty_None : exc);
            Ty_DECREF(id);
            if (stat < 0) {
                goto fail;
            }
        }
    }
    goto done;

fail:
    Ty_CLEAR(result);

done:
    HEAD_UNLOCK(runtime);
    _TyEval_StartTheWorldAll(runtime);
    return result;
}


/***********************************/
/* Python "auto thread state" API. */
/***********************************/

/* Internal initialization/finalization functions called by
   Ty_Initialize/Ty_FinalizeEx
*/
TyStatus
_TyGILState_Init(TyInterpreterState *interp)
{
    if (!_Ty_IsMainInterpreter(interp)) {
        /* Currently, PyGILState is shared by all interpreters. The main
         * interpreter is responsible to initialize it. */
        return _TyStatus_OK();
    }
    _PyRuntimeState *runtime = interp->runtime;
    assert(gilstate_tss_get(runtime) == NULL);
    assert(runtime->gilstate.autoInterpreterState == NULL);
    runtime->gilstate.autoInterpreterState = interp;
    return _TyStatus_OK();
}

void
_TyGILState_Fini(TyInterpreterState *interp)
{
    if (!_Ty_IsMainInterpreter(interp)) {
        /* Currently, PyGILState is shared by all interpreters. The main
         * interpreter is responsible to initialize it. */
        return;
    }
    interp->runtime->gilstate.autoInterpreterState = NULL;
}


// XXX Drop this.
void
_TyGILState_SetTstate(TyThreadState *tstate)
{
    /* must init with valid states */
    assert(tstate != NULL);
    assert(tstate->interp != NULL);

    if (!_Ty_IsMainInterpreter(tstate->interp)) {
        /* Currently, PyGILState is shared by all interpreters. The main
         * interpreter is responsible to initialize it. */
        return;
    }

#ifndef NDEBUG
    _PyRuntimeState *runtime = tstate->interp->runtime;

    assert(runtime->gilstate.autoInterpreterState == tstate->interp);
    assert(gilstate_tss_get(runtime) == tstate);
    assert(tstate->gilstate_counter == 1);
#endif
}

TyInterpreterState *
_TyGILState_GetInterpreterStateUnsafe(void)
{
    return _PyRuntime.gilstate.autoInterpreterState;
}

/* The public functions */

TyThreadState *
TyGILState_GetThisThreadState(void)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    if (!gilstate_tss_initialized(runtime)) {
        return NULL;
    }
    return gilstate_tss_get(runtime);
}

int
TyGILState_Check(void)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    if (!runtime->gilstate.check_enabled) {
        return 1;
    }

    if (!gilstate_tss_initialized(runtime)) {
        return 1;
    }

    TyThreadState *tstate = current_fast_get();
    if (tstate == NULL) {
        return 0;
    }

    TyThreadState *tcur = gilstate_tss_get(runtime);
    return (tstate == tcur);
}

TyGILState_STATE
TyGILState_Ensure(void)
{
    _PyRuntimeState *runtime = &_PyRuntime;

    /* Note that we do not auto-init Python here - apart from
       potential races with 2 threads auto-initializing, pep-311
       spells out other issues.  Embedders are expected to have
       called Ty_Initialize(). */

    /* Ensure that _TyEval_InitThreads() and _TyGILState_Init() have been
       called by Ty_Initialize() */
    assert(_TyEval_ThreadsInitialized());
    assert(gilstate_tss_initialized(runtime));
    assert(runtime->gilstate.autoInterpreterState != NULL);

    TyThreadState *tcur = gilstate_tss_get(runtime);
    int has_gil;
    if (tcur == NULL) {
        /* Create a new Python thread state for this thread */
        // XXX Use TyInterpreterState_EnsureThreadState()?
        tcur = new_threadstate(runtime->gilstate.autoInterpreterState,
                               _TyThreadState_WHENCE_GILSTATE);
        if (tcur == NULL) {
            Ty_FatalError("Couldn't create thread-state for new thread");
        }
        bind_tstate(tcur);
        bind_gilstate_tstate(tcur);

        /* This is our thread state!  We'll need to delete it in the
           matching call to TyGILState_Release(). */
        assert(tcur->gilstate_counter == 1);
        tcur->gilstate_counter = 0;
        has_gil = 0; /* new thread state is never current */
    }
    else {
        has_gil = holds_gil(tcur);
    }

    if (!has_gil) {
        TyEval_RestoreThread(tcur);
    }

    /* Update our counter in the thread-state - no need for locks:
       - tcur will remain valid as we hold the GIL.
       - the counter is safe as we are the only thread "allowed"
         to modify this value
    */
    ++tcur->gilstate_counter;

    return has_gil ? TyGILState_LOCKED : TyGILState_UNLOCKED;
}

void
TyGILState_Release(TyGILState_STATE oldstate)
{
    _PyRuntimeState *runtime = &_PyRuntime;
    TyThreadState *tstate = gilstate_tss_get(runtime);
    if (tstate == NULL) {
        Ty_FatalError("auto-releasing thread-state, "
                      "but no thread-state for this thread");
    }

    /* We must hold the GIL and have our thread state current */
    if (!holds_gil(tstate)) {
        _Ty_FatalErrorFormat(__func__,
                             "thread state %p must be current when releasing",
                             tstate);
    }
    --tstate->gilstate_counter;
    assert(tstate->gilstate_counter >= 0); /* illegal counter value */

    /* If we're going to destroy this thread-state, we must
     * clear it while the GIL is held, as destructors may run.
     */
    if (tstate->gilstate_counter == 0) {
        /* can't have been locked when we created it */
        assert(oldstate == TyGILState_UNLOCKED);
        // XXX Unbind tstate here.
        // gh-119585: `TyThreadState_Clear()` may call destructors that
        // themselves use TyGILState_Ensure and TyGILState_Release, so make
        // sure that gilstate_counter is not zero when calling it.
        ++tstate->gilstate_counter;
        TyThreadState_Clear(tstate);
        --tstate->gilstate_counter;
        /* Delete the thread-state.  Note this releases the GIL too!
         * It's vital that the GIL be held here, to avoid shutdown
         * races; see bugs 225673 and 1061968 (that nasty bug has a
         * habit of coming back).
         */
        assert(tstate->gilstate_counter == 0);
        assert(current_fast_get() == tstate);
        _TyThreadState_DeleteCurrent(tstate);
    }
    /* Release the lock if necessary */
    else if (oldstate == TyGILState_UNLOCKED) {
        TyEval_SaveThread();
    }
}


/*************/
/* Other API */
/*************/

_PyFrameEvalFunction
_TyInterpreterState_GetEvalFrameFunc(TyInterpreterState *interp)
{
    if (interp->eval_frame == NULL) {
        return _TyEval_EvalFrameDefault;
    }
    return interp->eval_frame;
}


void
_TyInterpreterState_SetEvalFrameFunc(TyInterpreterState *interp,
                                     _PyFrameEvalFunction eval_frame)
{
    if (eval_frame == _TyEval_EvalFrameDefault) {
        eval_frame = NULL;
    }
    if (eval_frame == interp->eval_frame) {
        return;
    }
#ifdef _Ty_TIER2
    if (eval_frame != NULL) {
        _Ty_Executors_InvalidateAll(interp, 1);
    }
#endif
    RARE_EVENT_INC(set_eval_frame_func);
    _TyEval_StopTheWorld(interp);
    interp->eval_frame = eval_frame;
    _TyEval_StartTheWorld(interp);
}


const TyConfig*
_TyInterpreterState_GetConfig(TyInterpreterState *interp)
{
    return &interp->config;
}


const TyConfig*
_Ty_GetConfig(void)
{
    TyThreadState *tstate = current_fast_get();
    _Ty_EnsureTstateNotNULL(tstate);
    return _TyInterpreterState_GetConfig(tstate->interp);
}


int
_TyInterpreterState_HasFeature(TyInterpreterState *interp, unsigned long feature)
{
    return ((interp->feature_flags & feature) != 0);
}


#define MINIMUM_OVERHEAD 1000

static TyObject **
push_chunk(TyThreadState *tstate, int size)
{
    int allocate_size = _PY_DATA_STACK_CHUNK_SIZE;
    while (allocate_size < (int)sizeof(TyObject*)*(size + MINIMUM_OVERHEAD)) {
        allocate_size *= 2;
    }
    _PyStackChunk *new = allocate_chunk(allocate_size, tstate->datastack_chunk);
    if (new == NULL) {
        return NULL;
    }
    if (tstate->datastack_chunk) {
        tstate->datastack_chunk->top = tstate->datastack_top -
                                       &tstate->datastack_chunk->data[0];
    }
    tstate->datastack_chunk = new;
    tstate->datastack_limit = (TyObject **)(((char *)new) + allocate_size);
    // When new is the "root" chunk (i.e. new->previous == NULL), we can keep
    // _TyThreadState_PopFrame from freeing it later by "skipping" over the
    // first element:
    TyObject **res = &new->data[new->previous == NULL];
    tstate->datastack_top = res + size;
    return res;
}

_PyInterpreterFrame *
_TyThreadState_PushFrame(TyThreadState *tstate, size_t size)
{
    assert(size < INT_MAX/sizeof(TyObject *));
    if (_TyThreadState_HasStackSpace(tstate, (int)size)) {
        _PyInterpreterFrame *res = (_PyInterpreterFrame *)tstate->datastack_top;
        tstate->datastack_top += size;
        return res;
    }
    return (_PyInterpreterFrame *)push_chunk(tstate, (int)size);
}

void
_TyThreadState_PopFrame(TyThreadState *tstate, _PyInterpreterFrame * frame)
{
    assert(tstate->datastack_chunk);
    TyObject **base = (TyObject **)frame;
    if (base == &tstate->datastack_chunk->data[0]) {
        _PyStackChunk *chunk = tstate->datastack_chunk;
        _PyStackChunk *previous = chunk->previous;
        // push_chunk ensures that the root chunk is never popped:
        assert(previous);
        tstate->datastack_top = &previous->data[previous->top];
        tstate->datastack_chunk = previous;
        _TyObject_VirtualFree(chunk, chunk->size);
        tstate->datastack_limit = (TyObject **)(((char *)previous) + previous->size);
    }
    else {
        assert(tstate->datastack_top);
        assert(tstate->datastack_top >= base);
        tstate->datastack_top = base;
    }
}


#ifndef NDEBUG
// Check that a Python thread state valid. In practice, this function is used
// on a Python debug build to check if 'tstate' is a dangling pointer, if the
// TyThreadState memory has been freed.
//
// Usage:
//
//     assert(_TyThreadState_CheckConsistency(tstate));
int
_TyThreadState_CheckConsistency(TyThreadState *tstate)
{
    assert(!_TyMem_IsPtrFreed(tstate));
    assert(!_TyMem_IsPtrFreed(tstate->interp));
    return 1;
}
#endif


// Check if a Python thread must call _TyThreadState_HangThread(), rather than
// taking the GIL or attaching to the interpreter if Ty_Finalize() has been
// called.
//
// When this function is called by a daemon thread after Ty_Finalize() has been
// called, the GIL may no longer exist.
//
// tstate must be non-NULL.
int
_TyThreadState_MustExit(TyThreadState *tstate)
{
    int state = _Ty_atomic_load_int_relaxed(&tstate->state);
    return state == _Ty_THREAD_SHUTTING_DOWN;
}

void
_TyThreadState_HangThread(TyThreadState *tstate)
{
    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    decref_threadstate(tstate_impl);
    TyThread_hang_thread();
}

/********************/
/* mimalloc support */
/********************/

static void
tstate_mimalloc_bind(TyThreadState *tstate)
{
#ifdef Ty_GIL_DISABLED
    struct _mimalloc_thread_state *mts = &((_PyThreadStateImpl*)tstate)->mimalloc;

    // Initialize the mimalloc thread state. This must be called from the
    // same thread that will use the thread state. The "mem" heap doubles as
    // the "backing" heap.
    mi_tld_t *tld = &mts->tld;
    _mi_tld_init(tld, &mts->heaps[_Ty_MIMALLOC_HEAP_MEM]);
    llist_init(&mts->page_list);

    // Exiting threads push any remaining in-use segments to the abandoned
    // pool to be re-claimed later by other threads. We use per-interpreter
    // pools to keep Python objects from different interpreters separate.
    tld->segments.abandoned = &tstate->interp->mimalloc.abandoned_pool;

    // Don't fill in the first N bytes up to ob_type in debug builds. We may
    // access ob_tid and the refcount fields in the dict and list lock-less
    // accesses, so they must remain valid for a while after deallocation.
    size_t base_offset = offsetof(TyObject, ob_type);
    if (_TyMem_DebugEnabled()) {
        // The debug allocator adds two words at the beginning of each block.
        base_offset += 2 * sizeof(size_t);
    }
    size_t debug_offsets[_Ty_MIMALLOC_HEAP_COUNT] = {
        [_Ty_MIMALLOC_HEAP_OBJECT] = base_offset,
        [_Ty_MIMALLOC_HEAP_GC] = base_offset,
        [_Ty_MIMALLOC_HEAP_GC_PRE] = base_offset + 2 * sizeof(TyObject *),
    };

    // Initialize each heap
    for (uint8_t i = 0; i < _Ty_MIMALLOC_HEAP_COUNT; i++) {
        _mi_heap_init_ex(&mts->heaps[i], tld, _mi_arena_id_none(), false, i);
        mts->heaps[i].debug_offset = (uint8_t)debug_offsets[i];
    }

    // Heaps that store Python objects should use QSBR to delay freeing
    // mimalloc pages while there may be concurrent lock-free readers.
    mts->heaps[_Ty_MIMALLOC_HEAP_OBJECT].page_use_qsbr = true;
    mts->heaps[_Ty_MIMALLOC_HEAP_GC].page_use_qsbr = true;
    mts->heaps[_Ty_MIMALLOC_HEAP_GC_PRE].page_use_qsbr = true;

    // By default, object allocations use _Ty_MIMALLOC_HEAP_OBJECT.
    // _TyObject_GC_New() and similar functions temporarily override this to
    // use one of the GC heaps.
    mts->current_object_heap = &mts->heaps[_Ty_MIMALLOC_HEAP_OBJECT];

    _Ty_atomic_store_int(&mts->initialized, 1);
#endif
}

void
_TyThreadState_ClearMimallocHeaps(TyThreadState *tstate)
{
#ifdef Ty_GIL_DISABLED
    if (!tstate->_status.bound) {
        // The mimalloc heaps are only initialized when the thread is bound.
        return;
    }

    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    for (Ty_ssize_t i = 0; i < _Ty_MIMALLOC_HEAP_COUNT; i++) {
        // Abandon all segments in use by this thread. This pushes them to
        // a shared pool to later be reclaimed by other threads. It's important
        // to do this before the thread state is destroyed so that objects
        // remain visible to the GC.
        _mi_heap_collect_abandon(&tstate_impl->mimalloc.heaps[i]);
    }
#endif
}


int
_Ty_IsMainThread(void)
{
    unsigned long thread = TyThread_get_thread_ident();
    return (thread == _PyRuntime.main_thread);
}


TyInterpreterState *
_TyInterpreterState_Main(void)
{
    return _PyRuntime.interpreters.main;
}


int
_Ty_IsMainInterpreterFinalizing(TyInterpreterState *interp)
{
    /* bpo-39877: Access _PyRuntime directly rather than using
       tstate->interp->runtime to support calls from Python daemon threads.
       After Ty_Finalize() has been called, tstate can be a dangling pointer:
       point to TyThreadState freed memory. */
    return (_PyRuntimeState_GetFinalizing(&_PyRuntime) != NULL &&
            interp == &_PyRuntime._main_interpreter);
}


const TyConfig *
_Ty_GetMainConfig(void)
{
    TyInterpreterState *interp = _TyInterpreterState_Main();
    if (interp == NULL) {
        return NULL;
    }
    return _TyInterpreterState_GetConfig(interp);
}
