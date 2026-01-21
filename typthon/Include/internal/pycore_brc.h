#ifndef Ty_INTERNAL_BRC_H
#define Ty_INTERNAL_BRC_H

#include <stdint.h>
#include "pycore_llist.h"           // struct llist_node
#include "pycore_object_stack.h"    // _PyObjectStack

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef Ty_GIL_DISABLED

// Prime number to avoid correlations with memory addresses.
#define _Ty_BRC_NUM_BUCKETS 257

// Hash table bucket
struct _brc_bucket {
    // Mutex protects both the bucket and thread state queues in this bucket.
    PyMutex mutex;

    // Linked list of _PyThreadStateImpl objects hashed to this bucket.
    struct llist_node root;
};

// Per-interpreter biased reference counting state
struct _brc_state {
    // Hash table of thread states by thread-id. Thread states within a bucket
    // are chained using a doubly-linked list.
    struct _brc_bucket table[_Ty_BRC_NUM_BUCKETS];
};

// Per-thread biased reference counting state
struct _brc_thread_state {
    // Linked-list of thread states per hash bucket
    struct llist_node bucket_node;

    // Thread-id as determined by _PyThread_Id()
    uintptr_t tid;

    // Objects with refcounts to be merged (protected by bucket mutex)
    _PyObjectStack objects_to_merge;

    // Local stack of objects to be merged (not accessed by other threads)
    _PyObjectStack local_objects_to_merge;
};

// Initialize/finalize the per-thread biased reference counting state
void _Ty_brc_init_thread(TyThreadState *tstate);
void _Ty_brc_remove_thread(TyThreadState *tstate);

// Initialize per-interpreter state
void _Ty_brc_init_state(TyInterpreterState *interp);

void _Ty_brc_after_fork(TyInterpreterState *interp);

// Enqueues an object to be merged by it's owning thread (tid). This
// steals a reference to the object.
void _Ty_brc_queue_object(TyObject *ob);

// Merge the refcounts of queued objects for the current thread.
void _Ty_brc_merge_refcounts(TyThreadState *tstate);

#endif /* Ty_GIL_DISABLED */

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_BRC_H */
