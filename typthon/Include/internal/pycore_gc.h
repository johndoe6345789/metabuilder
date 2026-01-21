#ifndef Ty_INTERNAL_GC_H
#define Ty_INTERNAL_GC_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_interp_structs.h" // TyGC_Head
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_typedefs.h"      // _PyInterpreterFrame


/* Get an object's GC head */
static inline TyGC_Head* _Ty_AS_GC(TyObject *op) {
    char *gc = ((char*)op) - sizeof(TyGC_Head);
    return (TyGC_Head*)gc;
}

/* Get the object given the GC head */
static inline TyObject* _Ty_FROM_GC(TyGC_Head *gc) {
    char *op = ((char *)gc) + sizeof(TyGC_Head);
    return (TyObject *)op;
}


/* Bit flags for ob_gc_bits (in Ty_GIL_DISABLED builds)
 *
 * Setting the bits requires a relaxed store. The per-object lock must also be
 * held, except when the object is only visible to a single thread (e.g. during
 * object initialization or destruction).
 *
 * Reading the bits requires using a relaxed load, but does not require holding
 * the per-object lock.
 */
#ifdef Ty_GIL_DISABLED
#  define _TyGC_BITS_TRACKED        (1<<0)     // Tracked by the GC
#  define _TyGC_BITS_FINALIZED      (1<<1)     // tp_finalize was called
#  define _TyGC_BITS_UNREACHABLE    (1<<2)
#  define _TyGC_BITS_FROZEN         (1<<3)
#  define _TyGC_BITS_SHARED         (1<<4)
#  define _TyGC_BITS_ALIVE          (1<<5)    // Reachable from a known root.
#  define _TyGC_BITS_DEFERRED       (1<<6)    // Use deferred reference counting
#endif

#ifdef Ty_GIL_DISABLED

static inline void
_TyObject_SET_GC_BITS(TyObject *op, uint8_t new_bits)
{
    uint8_t bits = _Ty_atomic_load_uint8_relaxed(&op->ob_gc_bits);
    _Ty_atomic_store_uint8_relaxed(&op->ob_gc_bits, bits | new_bits);
}

static inline int
_TyObject_HAS_GC_BITS(TyObject *op, uint8_t bits)
{
    return (_Ty_atomic_load_uint8_relaxed(&op->ob_gc_bits) & bits) != 0;
}

static inline void
_TyObject_CLEAR_GC_BITS(TyObject *op, uint8_t bits_to_clear)
{
    uint8_t bits = _Ty_atomic_load_uint8_relaxed(&op->ob_gc_bits);
    _Ty_atomic_store_uint8_relaxed(&op->ob_gc_bits, bits & ~bits_to_clear);
}

#endif

/* True if the object is currently tracked by the GC. */
static inline int _TyObject_GC_IS_TRACKED(TyObject *op) {
#ifdef Ty_GIL_DISABLED
    return _TyObject_HAS_GC_BITS(op, _TyGC_BITS_TRACKED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    return (gc->_gc_next != 0);
#endif
}
#define _TyObject_GC_IS_TRACKED(op) _TyObject_GC_IS_TRACKED(_Py_CAST(TyObject*, op))

/* True if the object may be tracked by the GC in the future, or already is.
   This can be useful to implement some optimizations. */
static inline int _TyObject_GC_MAY_BE_TRACKED(TyObject *obj) {
    if (!PyObject_IS_GC(obj)) {
        return 0;
    }
    if (TyTuple_CheckExact(obj)) {
        return _TyObject_GC_IS_TRACKED(obj);
    }
    return 1;
}

#ifdef Ty_GIL_DISABLED

/* True if memory the object references is shared between
 * multiple threads and needs special purpose when freeing
 * those references due to the possibility of in-flight
 * lock-free reads occurring.  The object is responsible
 * for calling _TyMem_FreeDelayed on the referenced
 * memory. */
static inline int _TyObject_GC_IS_SHARED(TyObject *op) {
    return _TyObject_HAS_GC_BITS(op, _TyGC_BITS_SHARED);
}
#define _TyObject_GC_IS_SHARED(op) _TyObject_GC_IS_SHARED(_Py_CAST(TyObject*, op))

static inline void _TyObject_GC_SET_SHARED(TyObject *op) {
    _TyObject_SET_GC_BITS(op, _TyGC_BITS_SHARED);
}
#define _TyObject_GC_SET_SHARED(op) _TyObject_GC_SET_SHARED(_Py_CAST(TyObject*, op))

#endif

/* Bit flags for _gc_prev */
/* Bit 0 is set when tp_finalize is called */
#define _TyGC_PREV_MASK_FINALIZED  ((uintptr_t)1)
/* Bit 1 is set when the object is in generation which is GCed currently. */
#define _TyGC_PREV_MASK_COLLECTING ((uintptr_t)2)

/* Bit 0 in _gc_next is the old space bit.
 * It is set as follows:
 * Young: gcstate->visited_space
 * old[0]: 0
 * old[1]: 1
 * permanent: 0
 *
 * During a collection all objects handled should have the bit set to
 * gcstate->visited_space, as objects are moved from the young gen
 * and the increment into old[gcstate->visited_space].
 * When object are moved from the pending space, old[gcstate->visited_space^1]
 * into the increment, the old space bit is flipped.
*/
#define _TyGC_NEXT_MASK_OLD_SPACE_1    1

#define _TyGC_PREV_SHIFT           2
#define _TyGC_PREV_MASK            (((uintptr_t) -1) << _TyGC_PREV_SHIFT)

/* set for debugging information */
#define _TyGC_DEBUG_STATS             (1<<0) /* print collection statistics */
#define _TyGC_DEBUG_COLLECTABLE       (1<<1) /* print collectable objects */
#define _TyGC_DEBUG_UNCOLLECTABLE     (1<<2) /* print uncollectable objects */
#define _TyGC_DEBUG_SAVEALL           (1<<5) /* save all garbage in gc.garbage */
#define _TyGC_DEBUG_LEAK              _TyGC_DEBUG_COLLECTABLE | \
                                      _TyGC_DEBUG_UNCOLLECTABLE | \
                                      _TyGC_DEBUG_SAVEALL

typedef enum {
    // GC was triggered by heap allocation
    _Ty_GC_REASON_HEAP,

    // GC was called during shutdown
    _Ty_GC_REASON_SHUTDOWN,

    // GC was called by gc.collect() or TyGC_Collect()
    _Ty_GC_REASON_MANUAL
} _TyGC_Reason;

// Lowest bit of _gc_next is used for flags only in GC.
// But it is always 0 for normal code.
static inline TyGC_Head* _PyGCHead_NEXT(TyGC_Head *gc) {
    uintptr_t next = gc->_gc_next & _TyGC_PREV_MASK;
    return (TyGC_Head*)next;
}
static inline void _PyGCHead_SET_NEXT(TyGC_Head *gc, TyGC_Head *next) {
    uintptr_t unext = (uintptr_t)next;
    assert((unext & ~_TyGC_PREV_MASK) == 0);
    gc->_gc_next = (gc->_gc_next & ~_TyGC_PREV_MASK) | unext;
}

// Lowest two bits of _gc_prev is used for _TyGC_PREV_MASK_* flags.
static inline TyGC_Head* _PyGCHead_PREV(TyGC_Head *gc) {
    uintptr_t prev = (gc->_gc_prev & _TyGC_PREV_MASK);
    return (TyGC_Head*)prev;
}

static inline void _PyGCHead_SET_PREV(TyGC_Head *gc, TyGC_Head *prev) {
    uintptr_t uprev = (uintptr_t)prev;
    assert((uprev & ~_TyGC_PREV_MASK) == 0);
    gc->_gc_prev = ((gc->_gc_prev & ~_TyGC_PREV_MASK) | uprev);
}

static inline int _TyGC_FINALIZED(TyObject *op) {
#ifdef Ty_GIL_DISABLED
    return _TyObject_HAS_GC_BITS(op, _TyGC_BITS_FINALIZED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    return ((gc->_gc_prev & _TyGC_PREV_MASK_FINALIZED) != 0);
#endif
}
static inline void _TyGC_SET_FINALIZED(TyObject *op) {
#ifdef Ty_GIL_DISABLED
    _TyObject_SET_GC_BITS(op, _TyGC_BITS_FINALIZED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    gc->_gc_prev |= _TyGC_PREV_MASK_FINALIZED;
#endif
}
static inline void _TyGC_CLEAR_FINALIZED(TyObject *op) {
#ifdef Ty_GIL_DISABLED
    _TyObject_CLEAR_GC_BITS(op, _TyGC_BITS_FINALIZED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    gc->_gc_prev &= ~_TyGC_PREV_MASK_FINALIZED;
#endif
}


/* Tell the GC to track this object.
 *
 * The object must not be tracked by the GC.
 *
 * NB: While the object is tracked by the collector, it must be safe to call the
 * ob_traverse method.
 *
 * Internal note: interp->gc.generation0->_gc_prev doesn't have any bit flags
 * because it's not object header.  So we don't use _PyGCHead_PREV() and
 * _PyGCHead_SET_PREV() for it to avoid unnecessary bitwise operations.
 *
 * See also the public PyObject_GC_Track() function.
 */
static inline void _TyObject_GC_TRACK(
// The preprocessor removes _TyObject_ASSERT_FROM() calls if NDEBUG is defined
#ifndef NDEBUG
    const char *filename, int lineno,
#endif
    TyObject *op)
{
    _TyObject_ASSERT_FROM(op, !_TyObject_GC_IS_TRACKED(op),
                          "object already tracked by the garbage collector",
                          filename, lineno, __func__);
#ifdef Ty_GIL_DISABLED
    _TyObject_SET_GC_BITS(op, _TyGC_BITS_TRACKED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    _TyObject_ASSERT_FROM(op,
                          (gc->_gc_prev & _TyGC_PREV_MASK_COLLECTING) == 0,
                          "object is in generation which is garbage collected",
                          filename, lineno, __func__);

    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyGC_Head *generation0 = &interp->gc.young.head;
    TyGC_Head *last = (TyGC_Head*)(generation0->_gc_prev);
    _PyGCHead_SET_NEXT(last, gc);
    _PyGCHead_SET_PREV(gc, last);
    uintptr_t not_visited = 1 ^ interp->gc.visited_space;
    gc->_gc_next = ((uintptr_t)generation0) | not_visited;
    generation0->_gc_prev = (uintptr_t)gc;
#endif
}

/* Tell the GC to stop tracking this object.
 *
 * Internal note: This may be called while GC. So _TyGC_PREV_MASK_COLLECTING
 * must be cleared. But _TyGC_PREV_MASK_FINALIZED bit is kept.
 *
 * The object must be tracked by the GC.
 *
 * See also the public PyObject_GC_UnTrack() which accept an object which is
 * not tracked.
 */
static inline void _TyObject_GC_UNTRACK(
// The preprocessor removes _TyObject_ASSERT_FROM() calls if NDEBUG is defined
#ifndef NDEBUG
    const char *filename, int lineno,
#endif
    TyObject *op)
{
    _TyObject_ASSERT_FROM(op, _TyObject_GC_IS_TRACKED(op),
                          "object not tracked by the garbage collector",
                          filename, lineno, __func__);

#ifdef Ty_GIL_DISABLED
    _TyObject_CLEAR_GC_BITS(op, _TyGC_BITS_TRACKED);
#else
    TyGC_Head *gc = _Ty_AS_GC(op);
    TyGC_Head *prev = _PyGCHead_PREV(gc);
    TyGC_Head *next = _PyGCHead_NEXT(gc);
    _PyGCHead_SET_NEXT(prev, next);
    _PyGCHead_SET_PREV(next, prev);
    gc->_gc_next = 0;
    gc->_gc_prev &= _TyGC_PREV_MASK_FINALIZED;
#endif
}



/*
   NOTE: about untracking of mutable objects.

   Certain types of container cannot participate in a reference cycle, and
   so do not need to be tracked by the garbage collector. Untracking these
   objects reduces the cost of garbage collections. However, determining
   which objects may be untracked is not free, and the costs must be
   weighed against the benefits for garbage collection.

   There are two possible strategies for when to untrack a container:

   i) When the container is created.
   ii) When the container is examined by the garbage collector.

   Tuples containing only immutable objects (integers, strings etc, and
   recursively, tuples of immutable objects) do not need to be tracked.
   The interpreter creates a large number of tuples, many of which will
   not survive until garbage collection. It is therefore not worthwhile
   to untrack eligible tuples at creation time.

   Instead, all tuples except the empty tuple are tracked when created.
   During garbage collection it is determined whether any surviving tuples
   can be untracked. A tuple can be untracked if all of its contents are
   already not tracked. Tuples are examined for untracking in all garbage
   collection cycles. It may take more than one cycle to untrack a tuple.

   Dictionaries containing only immutable objects also do not need to be
   tracked. Dictionaries are untracked when created. If a tracked item is
   inserted into a dictionary (either as a key or value), the dictionary
   becomes tracked. During a full garbage collection (all generations),
   the collector will untrack any dictionaries whose contents are not
   tracked.

   The module provides the python function is_tracked(obj), which returns
   the CURRENT tracking status of the object. Subsequent garbage
   collections may change the tracking status of the object.

   Untracking of certain containers was introduced in issue #4688, and
   the algorithm was refined in response to issue #14775.
*/

extern void _TyGC_InitState(struct _gc_runtime_state *);

extern Ty_ssize_t _TyGC_Collect(TyThreadState *tstate, int generation, _TyGC_Reason reason);
extern void _TyGC_CollectNoFail(TyThreadState *tstate);

/* Freeze objects tracked by the GC and ignore them in future collections. */
extern void _TyGC_Freeze(TyInterpreterState *interp);
/* Unfreezes objects placing them in the oldest generation */
extern void _TyGC_Unfreeze(TyInterpreterState *interp);
/* Number of frozen objects */
extern Ty_ssize_t _TyGC_GetFreezeCount(TyInterpreterState *interp);

extern TyObject *_TyGC_GetObjects(TyInterpreterState *interp, int generation);
extern TyObject *_TyGC_GetReferrers(TyInterpreterState *interp, TyObject *objs);

// Functions to clear types free lists
extern void _TyGC_ClearAllFreeLists(TyInterpreterState *interp);
extern void _Ty_ScheduleGC(TyThreadState *tstate);
extern void _Ty_RunGC(TyThreadState *tstate);

union _PyStackRef;

// GC visit callback for tracked interpreter frames
extern int _TyGC_VisitFrameStack(_PyInterpreterFrame *frame, visitproc visit, void *arg);
extern int _TyGC_VisitStackRef(union _PyStackRef *ref, visitproc visit, void *arg);

#ifdef Ty_GIL_DISABLED
extern void _TyGC_VisitObjectsWorldStopped(TyInterpreterState *interp,
                                           gcvisitobjects_t callback, void *arg);
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_GC_H */
