#ifndef Ty_INTERNAL_UNIQUEID_H
#define Ty_INTERNAL_UNIQUEID_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef Ty_GIL_DISABLED

// This contains code for allocating unique ids to objects for per-thread
// reference counting.
//
// Per-thread reference counting is used along with deferred reference
// counting to avoid scaling bottlenecks due to reference count contention.
//
// An id of 0 is used to indicate that an object doesn't use per-thread
// refcounting. This value is used when the object is finalized by the GC
// and during interpreter shutdown to allow the object to be
// deallocated promptly when the object's refcount reaches zero.
//
// Each entry implicitly represents a unique id based on its offset in the
// table. Non-allocated entries form a free-list via the 'next' pointer.
// Allocated entries store the corresponding TyObject.

#define _Ty_INVALID_UNIQUE_ID 0

// Assigns the next id from the pool of ids.
extern Ty_ssize_t _TyObject_AssignUniqueId(TyObject *obj);

// Releases the allocated id back to the pool.
extern void _TyObject_ReleaseUniqueId(Ty_ssize_t unique_id);

// Releases the allocated id back to the pool.
extern void _TyObject_DisablePerThreadRefcounting(TyObject *obj);

// Merges the per-thread reference counts into the corresponding objects.
extern void _TyObject_MergePerThreadRefcounts(_PyThreadStateImpl *tstate);

// Like _TyObject_MergePerThreadRefcounts, but also frees the per-thread
// array of refcounts.
extern void _TyObject_FinalizePerThreadRefcounts(_PyThreadStateImpl *tstate);

// Frees the interpreter's pool of type ids.
extern void _TyObject_FinalizeUniqueIdPool(TyInterpreterState *interp);

// Increfs the object, resizing the thread-local refcount array if necessary.
PyAPI_FUNC(void) _TyObject_ThreadIncrefSlow(TyObject *obj, size_t idx);

#endif   /* Ty_GIL_DISABLED */

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_UNIQUEID_H */
