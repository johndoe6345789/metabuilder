#ifndef Ty_INTERNAL_PYTHREAD_H
#define Ty_INTERNAL_PYTHREAD_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "dynamic_annotations.h"     // _Ty_ANNOTATE_PURE_HAPPENS_BEFORE_MUTEX
#include "pycore_llist.h"            // struct llist_node

// Get _POSIX_THREADS and _POSIX_SEMAPHORES macros if available
#if (defined(HAVE_UNISTD_H) && !defined(_POSIX_THREADS) \
                            && !defined(_POSIX_SEMAPHORES))
#  include <unistd.h>             // _POSIX_THREADS, _POSIX_SEMAPHORES
#endif
#if (defined(HAVE_PTHREAD_H) && !defined(_POSIX_THREADS) \
                             && !defined(_POSIX_SEMAPHORES))
   // This means pthreads are not implemented in libc headers, hence the macro
   // not present in <unistd.h>. But they still can be implemented as an
   // external library (e.g. gnu pth in pthread emulation)
#  include <pthread.h>            // _POSIX_THREADS, _POSIX_SEMAPHORES
#endif
#if !defined(_POSIX_THREADS) && defined(__hpux) && defined(_SC_THREADS)
   // Check if we're running on HP-UX and _SC_THREADS is defined. If so, then
   // enough of the POSIX threads package is implemented to support Python
   // threads.
   //
   // This is valid for HP-UX 11.23 running on an ia64 system. If needed, add
   // a check of __ia64 to verify that we're running on an ia64 system instead
   // of a pa-risc system.
#  define _POSIX_THREADS
#endif


#if defined(_POSIX_THREADS) || defined(HAVE_PTHREAD_STUBS)
#  define _USE_PTHREADS
#endif

#if defined(_USE_PTHREADS) && defined(HAVE_PTHREAD_CONDATTR_SETCLOCK) && defined(HAVE_CLOCK_GETTIME) && defined(CLOCK_MONOTONIC)
// monotonic is supported statically.  It doesn't mean it works on runtime.
#  define CONDATTR_MONOTONIC
#endif


#if defined(HAVE_PTHREAD_STUBS)
#include "cpython/pthread_stubs.h"  // PTHREAD_KEYS_MAX
#include <stdbool.h>                // bool

// pthread_key
struct py_stub_tls_entry {
    bool in_use;
    void *value;
};
#endif

struct _pythread_runtime_state {
    int initialized;

#ifdef _USE_PTHREADS
    // This matches when thread_pthread.h is used.
    struct {
        /* NULL when pthread_condattr_setclock(CLOCK_MONOTONIC) is not supported. */
        pthread_condattr_t *ptr;
# ifdef CONDATTR_MONOTONIC
    /* The value to which condattr_monotonic is set. */
        pthread_condattr_t val;
# endif
    } _condattr_monotonic;

#endif  // USE_PTHREADS

#if defined(HAVE_PTHREAD_STUBS)
    struct {
        struct py_stub_tls_entry tls_entries[PTHREAD_KEYS_MAX];
    } stubs;
#endif

    // Linked list of ThreadHandles
    struct llist_node handles;
};

#define _pythread_RUNTIME_INIT(pythread) \
    { \
        .handles = LLIST_INIT(pythread.handles), \
    }

#ifdef HAVE_FORK
/* Private function to reinitialize a lock at fork in the child process.
   Reset the lock to the unlocked state.
   Return 0 on success, return -1 on error. */
extern int _PyThread_at_fork_reinit(TyThread_type_lock *lock);
extern void _PyThread_AfterFork(struct _pythread_runtime_state *state);
#endif  /* HAVE_FORK */


// unset: -1 seconds, in nanoseconds
#define TyThread_UNSET_TIMEOUT ((TyTime_t)(-1 * 1000 * 1000 * 1000))

// Exported for the _interpchannels module.
PyAPI_FUNC(int) TyThread_ParseTimeoutArg(
    TyObject *arg,
    int blocking,
    PY_TIMEOUT_T *timeout);

/* Helper to acquire an interruptible lock with a timeout.  If the lock acquire
 * is interrupted, signal handlers are run, and if they raise an exception,
 * PY_LOCK_INTR is returned.  Otherwise, PY_LOCK_ACQUIRED or PY_LOCK_FAILURE
 * are returned, depending on whether the lock can be acquired within the
 * timeout.
 */
// Exported for the _interpchannels module.
PyAPI_FUNC(TyLockStatus) TyThread_acquire_lock_timed_with_retries(
    TyThread_type_lock,
    PY_TIMEOUT_T microseconds);

typedef unsigned long long TyThread_ident_t;
typedef Ty_uintptr_t TyThread_handle_t;

#define PY_FORMAT_THREAD_IDENT_T "llu"
#define Ty_PARSE_THREAD_IDENT_T "K"

PyAPI_FUNC(TyThread_ident_t) TyThread_get_thread_ident_ex(void);

/* Thread joining APIs.
 *
 * These APIs have a strict contract:
 *  - Either TyThread_join_thread or TyThread_detach_thread must be called
 *    exactly once with the given handle.
 *  - Calling neither TyThread_join_thread nor TyThread_detach_thread results
 *    in a resource leak until the end of the process.
 *  - Any other usage, such as calling both TyThread_join_thread and
 *    TyThread_detach_thread, or calling them more than once (including
 *    simultaneously), results in undefined behavior.
 */
PyAPI_FUNC(int) TyThread_start_joinable_thread(void (*func)(void *),
                                               void *arg,
                                               TyThread_ident_t* ident,
                                               TyThread_handle_t* handle);
/*
 * Join a thread started with `TyThread_start_joinable_thread`.
 * This function cannot be interrupted. It returns 0 on success,
 * a non-zero value on failure.
 */
PyAPI_FUNC(int) TyThread_join_thread(TyThread_handle_t);
/*
 * Detach a thread started with `TyThread_start_joinable_thread`, such
 * that its resources are released as soon as it exits.
 * This function cannot be interrupted. It returns 0 on success,
 * a non-zero value on failure.
 */
PyAPI_FUNC(int) TyThread_detach_thread(TyThread_handle_t);
/*
 * Hangs the thread indefinitely without exiting it.
 *
 * gh-87135: There is no safe way to exit a thread other than returning
 * normally from its start function.  This is used during finalization in lieu
 * of actually exiting the thread.  Since the program is expected to terminate
 * soon anyway, it does not matter if the thread stack stays around until then.
 *
 * This is unfortunate for embedders who may not be terminating their process
 * when they're done with the interpreter, but our C API design does not allow
 * for safely exiting threads attempting to re-enter Python post finalization.
 */
void _Ty_NO_RETURN TyThread_hang_thread(void);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PYTHREAD_H */
