#ifndef Ty_INTERNAL_OBJECT_H
#define Ty_INTERNAL_OBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_emscripten_trampoline.h" // _PyCFunction_TrampolineCall()
#include "pycore_gc.h"            // _TyObject_GC_TRACK()
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_LOAD_PTR_ACQUIRE()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_typeobject.h"    // _PyStaticType_GetState()
#include "pycore_uniqueid.h"      // _TyObject_ThreadIncrefSlow()

#include <stdbool.h>              // bool


// This value is added to `ob_ref_shared` for objects that use deferred
// reference counting so that they are not immediately deallocated when the
// non-deferred reference count drops to zero.
//
// The value is half the maximum shared refcount because the low two bits of
// `ob_ref_shared` are used for flags.
#define _Ty_REF_DEFERRED (PY_SSIZE_T_MAX / 8)

/* For backwards compatibility -- Do not use this */
#define _Ty_IsImmortalLoose(op) _Ty_IsImmortal


/* Check if an object is consistent. For example, ensure that the reference
   counter is greater than or equal to 1, and ensure that ob_type is not NULL.

   Call _TyObject_AssertFailed() if the object is inconsistent.

   If check_content is zero, only check header fields: reduce the overhead.

   The function always return 1. The return value is just here to be able to
   write:

   assert(_TyObject_CheckConsistency(obj, 1)); */
extern int _TyObject_CheckConsistency(TyObject *op, int check_content);

extern void _PyDebugAllocatorStats(FILE *out, const char *block_name,
                                   int num_blocks, size_t sizeof_block);

extern void _TyObject_DebugTypeStats(FILE *out);

#ifdef Ty_TRACE_REFS
// Forget a reference registered by _Ty_NewReference(). Function called by
// _Ty_Dealloc().
//
// On a free list, the function can be used before modifying an object to
// remove the object from traced objects. Then _Ty_NewReference() or
// _Ty_NewReferenceNoTotal() should be called again on the object to trace
// it again.
extern void _Ty_ForgetReference(TyObject *);
#endif

// Export for shared _testinternalcapi extension
PyAPI_FUNC(int) _TyObject_IsFreed(TyObject *);

/* We need to maintain an internal copy of Py{Var}Object_HEAD_INIT to avoid
   designated initializer conflicts in C++20. If we use the definition in
   object.h, we will be mixing designated and non-designated initializers in
   pycore objects which is forbiddent in C++20. However, if we then use
   designated initializers in object.h then Extensions without designated break.
   Furthermore, we can't use designated initializers in Extensions since these
   are not supported pre-C++20. Thus, keeping an internal copy here is the most
   backwards compatible solution */
#if defined(Ty_GIL_DISABLED)
#define _TyObject_HEAD_INIT(type)                   \
    {                                               \
        .ob_ref_local = _Ty_IMMORTAL_REFCNT_LOCAL,  \
        .ob_flags = _Ty_STATICALLY_ALLOCATED_FLAG,  \
        .ob_gc_bits = _TyGC_BITS_DEFERRED,          \
        .ob_type = (type)                           \
    }
#else
#if SIZEOF_VOID_P > 4
#define _TyObject_HEAD_INIT(type)         \
    {                                     \
        .ob_refcnt = _Ty_IMMORTAL_INITIAL_REFCNT,  \
        .ob_flags = _Ty_STATIC_FLAG_BITS, \
        .ob_type = (type)                 \
    }
#else
#define _TyObject_HEAD_INIT(type)         \
    {                                     \
        .ob_refcnt = _Ty_STATIC_IMMORTAL_INITIAL_REFCNT, \
        .ob_type = (type)                 \
    }
#endif
#endif
#define _PyVarObject_HEAD_INIT(type, size)    \
    {                                         \
        .ob_base = _TyObject_HEAD_INIT(type), \
        .ob_size = size                       \
    }

PyAPI_FUNC(void) _Ty_NO_RETURN _Ty_FatalRefcountErrorFunc(
    const char *func,
    const char *message);

#define _Ty_FatalRefcountError(message) \
    _Ty_FatalRefcountErrorFunc(__func__, (message))

#define _PyReftracerTrack(obj, operation) \
    do { \
        struct _reftracer_runtime_state *tracer = &_PyRuntime.ref_tracer; \
        if (tracer->tracer_func != NULL) { \
            void *data = tracer->tracer_data; \
            tracer->tracer_func((obj), (operation), data); \
        } \
    } while(0)

#ifdef Ty_REF_DEBUG
/* The symbol is only exposed in the API for the sake of extensions
   built against the pre-3.12 stable ABI. */
PyAPI_DATA(Ty_ssize_t) _Ty_RefTotal;

extern void _Ty_AddRefTotal(TyThreadState *, Ty_ssize_t);
extern PyAPI_FUNC(void) _Ty_IncRefTotal(TyThreadState *);
extern PyAPI_FUNC(void) _Ty_DecRefTotal(TyThreadState *);

#  define _Ty_DEC_REFTOTAL(interp) \
    interp->object_state.reftotal--
#endif

// Increment reference count by n
static inline void _Ty_RefcntAdd(TyObject* op, Ty_ssize_t n)
{
    if (_Ty_IsImmortal(op)) {
        _Ty_INCREF_IMMORTAL_STAT_INC();
        return;
    }
#ifndef Ty_GIL_DISABLED
    Ty_ssize_t refcnt = _Ty_REFCNT(op);
    Ty_ssize_t new_refcnt = refcnt + n;
    if (new_refcnt >= (Ty_ssize_t)_Ty_IMMORTAL_MINIMUM_REFCNT) {
        new_refcnt = _Ty_IMMORTAL_INITIAL_REFCNT;
    }
#  if SIZEOF_VOID_P > 4
    op->ob_refcnt = (PY_UINT32_T)new_refcnt;
#  else
    op->ob_refcnt = new_refcnt;
#  endif
#  ifdef Ty_REF_DEBUG
    _Ty_AddRefTotal(_TyThreadState_GET(), new_refcnt - refcnt);
#  endif
#else
    if (_Ty_IsOwnedByCurrentThread(op)) {
        uint32_t local = op->ob_ref_local;
        Ty_ssize_t refcnt = (Ty_ssize_t)local + n;
#  if PY_SSIZE_T_MAX > UINT32_MAX
        if (refcnt > (Ty_ssize_t)UINT32_MAX) {
            // Make the object immortal if the 32-bit local reference count
            // would overflow.
            refcnt = _Ty_IMMORTAL_REFCNT_LOCAL;
        }
#  endif
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, (uint32_t)refcnt);
    }
    else {
        _Ty_atomic_add_ssize(&op->ob_ref_shared, (n << _Ty_REF_SHARED_SHIFT));
    }
#  ifdef Ty_REF_DEBUG
    _Ty_AddRefTotal(_TyThreadState_GET(), n);
#  endif
#endif
    // Although the ref count was increased by `n` (which may be greater than 1)
    // it is only a single increment (i.e. addition) operation, so only 1 refcnt
    // increment operation is counted.
    _Ty_INCREF_STAT_INC();
}
#define _Ty_RefcntAdd(op, n) _Ty_RefcntAdd(_TyObject_CAST(op), n)

// Checks if an object has a single, unique reference. If the caller holds a
// unique reference, it may be able to safely modify the object in-place.
static inline int
_TyObject_IsUniquelyReferenced(TyObject *ob)
{
#if !defined(Ty_GIL_DISABLED)
    return Ty_REFCNT(ob) == 1;
#else
    // NOTE: the entire ob_ref_shared field must be zero, including flags, to
    // ensure that other threads cannot concurrently create new references to
    // this object.
    return (_Ty_IsOwnedByCurrentThread(ob) &&
            _Ty_atomic_load_uint32_relaxed(&ob->ob_ref_local) == 1 &&
            _Ty_atomic_load_ssize_relaxed(&ob->ob_ref_shared) == 0);
#endif
}

PyAPI_FUNC(void) _Ty_SetImmortal(TyObject *op);
PyAPI_FUNC(void) _Ty_SetImmortalUntracked(TyObject *op);

// Makes an immortal object mortal again with the specified refcnt. Should only
// be used during runtime finalization.
static inline void _Ty_SetMortal(TyObject *op, short refcnt)
{
    if (op) {
        assert(_Ty_IsImmortal(op));
#ifdef Ty_GIL_DISABLED
        op->ob_tid = _Ty_UNOWNED_TID;
        op->ob_ref_local = 0;
        op->ob_ref_shared = _Ty_REF_SHARED(refcnt, _Ty_REF_MERGED);
#else
        op->ob_refcnt = refcnt;
#endif
    }
}

/* _Ty_ClearImmortal() should only be used during runtime finalization. */
static inline void _Ty_ClearImmortal(TyObject *op)
{
    if (op) {
        _Ty_SetMortal(op, 1);
        Ty_DECREF(op);
    }
}
#define _Ty_ClearImmortal(op) \
    do { \
        _Ty_ClearImmortal(_TyObject_CAST(op)); \
        op = NULL; \
    } while (0)

#if !defined(Ty_GIL_DISABLED)
static inline void
_Ty_DECREF_SPECIALIZED(TyObject *op, const destructor destruct)
{
    if (_Ty_IsImmortal(op)) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
#ifdef Ty_REF_DEBUG
    _Ty_DEC_REFTOTAL(TyInterpreterState_Get());
#endif
    if (--op->ob_refcnt != 0) {
        assert(op->ob_refcnt > 0);
    }
    else {
#ifdef Ty_TRACE_REFS
        _Ty_ForgetReference(op);
#endif
        _PyReftracerTrack(op, PyRefTracer_DESTROY);
        destruct(op);
    }
}

static inline void
_Ty_DECREF_NO_DEALLOC(TyObject *op)
{
    if (_Ty_IsImmortal(op)) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
#ifdef Ty_REF_DEBUG
    _Ty_DEC_REFTOTAL(TyInterpreterState_Get());
#endif
    op->ob_refcnt--;
#ifdef Ty_DEBUG
    if (op->ob_refcnt <= 0) {
        _Ty_FatalRefcountError("Expected a positive remaining refcount");
    }
#endif
}

#else
// TODO: implement Ty_DECREF specializations for Ty_GIL_DISABLED build
static inline void
_Ty_DECREF_SPECIALIZED(TyObject *op, const destructor destruct)
{
    Ty_DECREF(op);
}

static inline void
_Ty_DECREF_NO_DEALLOC(TyObject *op)
{
    Ty_DECREF(op);
}

static inline int
_Ty_REF_IS_MERGED(Ty_ssize_t ob_ref_shared)
{
    return (ob_ref_shared & _Ty_REF_SHARED_FLAG_MASK) == _Ty_REF_MERGED;
}

static inline int
_Ty_REF_IS_QUEUED(Ty_ssize_t ob_ref_shared)
{
    return (ob_ref_shared & _Ty_REF_SHARED_FLAG_MASK) == _Ty_REF_QUEUED;
}

// Merge the local and shared reference count fields and add `extra` to the
// refcount when merging.
Ty_ssize_t _Ty_ExplicitMergeRefcount(TyObject *op, Ty_ssize_t extra);
#endif // !defined(Ty_GIL_DISABLED)

#ifdef Ty_REF_DEBUG
#  undef _Ty_DEC_REFTOTAL
#endif


extern int _TyType_CheckConsistency(TyTypeObject *type);
extern int _TyDict_CheckConsistency(TyObject *mp, int check_content);

// Fast inlined version of TyType_HasFeature()
static inline int
_TyType_HasFeature(TyTypeObject *type, unsigned long feature) {
    return ((FT_ATOMIC_LOAD_ULONG_RELAXED(type->tp_flags) & feature) != 0);
}

extern void _TyType_InitCache(TyInterpreterState *interp);

extern TyStatus _TyObject_InitState(TyInterpreterState *interp);
extern void _TyObject_FiniState(TyInterpreterState *interp);
extern bool _PyRefchain_IsTraced(TyInterpreterState *interp, TyObject *obj);

// Macros used for per-thread reference counting in the free threading build.
// They resolve to normal Ty_INCREF/DECREF calls in the default build.
//
// The macros are used for only a few references that would otherwise cause
// scaling bottlenecks in the free threading build:
// - The reference from an object to `ob_type`.
// - The reference from a function to `func_code`.
// - The reference from a function to `func_globals` and `func_builtins`.
//
// It's safe, but not performant or necessary, to use these macros for other
// references to code, type, or dict objects. It's also safe to mix their
// usage with normal Ty_INCREF/DECREF calls.
//
// See also Include/internal/pycore_dict.h for _Ty_INCREF_DICT/_Ty_DECREF_DICT.
#ifndef Ty_GIL_DISABLED
#  define _Ty_INCREF_TYPE Ty_INCREF
#  define _Ty_DECREF_TYPE Ty_DECREF
#  define _Ty_INCREF_CODE Ty_INCREF
#  define _Ty_DECREF_CODE Ty_DECREF
#else
static inline void
_Ty_THREAD_INCREF_OBJECT(TyObject *obj, Ty_ssize_t unique_id)
{
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();

    // The table index is `unique_id - 1` because 0 is not a valid unique id.
    // Unsigned comparison so that `idx=-1` is handled by the "else".
    size_t idx = (size_t)(unique_id - 1);
    if (idx < (size_t)tstate->refcounts.size) {
#  ifdef Ty_REF_DEBUG
        _Ty_INCREF_IncRefTotal();
#  endif
        _Ty_INCREF_STAT_INC();
        tstate->refcounts.values[idx]++;
    }
    else {
        // The slow path resizes the per-thread refcount array if necessary.
        // It handles the unique_id=0 case to keep the inlinable function smaller.
        _TyObject_ThreadIncrefSlow(obj, idx);
    }
}

static inline void
_Ty_INCREF_TYPE(TyTypeObject *type)
{
    if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        assert(_Ty_IsImmortal(type));
        _Ty_INCREF_IMMORTAL_STAT_INC();
        return;
    }

    // gh-122974: GCC 11 warns about the access to PyHeapTypeObject fields when
    // _Ty_INCREF_TYPE() is called on a statically allocated type.  The
    // _TyType_HasFeature check above ensures that the type is a heap type.
#if defined(__GNUC__) && __GNUC__ >= 11
#  pragma GCC diagnostic push
#  pragma GCC diagnostic ignored "-Warray-bounds"
#endif
    _Ty_THREAD_INCREF_OBJECT((TyObject *)type, ((PyHeapTypeObject *)type)->unique_id);
#if defined(__GNUC__) && __GNUC__ >= 11
#  pragma GCC diagnostic pop
#endif
}

static inline void
_Ty_INCREF_CODE(PyCodeObject *co)
{
    _Ty_THREAD_INCREF_OBJECT((TyObject *)co, co->_co_unique_id);
}

static inline void
_Ty_THREAD_DECREF_OBJECT(TyObject *obj, Ty_ssize_t unique_id)
{
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();

    // The table index is `unique_id - 1` because 0 is not a valid unique id.
    // Unsigned comparison so that `idx=-1` is handled by the "else".
    size_t idx = (size_t)(unique_id - 1);
    if (idx < (size_t)tstate->refcounts.size) {
#  ifdef Ty_REF_DEBUG
        _Ty_DECREF_DecRefTotal();
#  endif
        _Ty_DECREF_STAT_INC();
        tstate->refcounts.values[idx]--;
    }
    else {
        // Directly decref the object if the id is not assigned or if
        // per-thread refcounting has been disabled on this object.
        Ty_DECREF(obj);
    }
}

static inline void
_Ty_DECREF_TYPE(TyTypeObject *type)
{
    if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        assert(_Ty_IsImmortal(type));
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    PyHeapTypeObject *ht = (PyHeapTypeObject *)type;
    _Ty_THREAD_DECREF_OBJECT((TyObject *)type, ht->unique_id);
}

static inline void
_Ty_DECREF_CODE(PyCodeObject *co)
{
    _Ty_THREAD_DECREF_OBJECT((TyObject *)co, co->_co_unique_id);
}
#endif

#ifndef Ty_GIL_DISABLED
#ifdef Ty_REF_DEBUG

static inline void Ty_DECREF_MORTAL(const char *filename, int lineno, TyObject *op)
{
    if (op->ob_refcnt <= 0) {
        _Ty_NegativeRefcount(filename, lineno, op);
    }
    _Ty_DECREF_STAT_INC();
    assert(!_Ty_IsStaticImmortal(op));
    if (!_Ty_IsImmortal(op)) {
        _Ty_DECREF_DecRefTotal();
    }
    if (--op->ob_refcnt == 0) {
        _Ty_Dealloc(op);
    }
}
#define Ty_DECREF_MORTAL(op) Ty_DECREF_MORTAL(__FILE__, __LINE__, _TyObject_CAST(op))

static inline void _Ty_DECREF_MORTAL_SPECIALIZED(const char *filename, int lineno, TyObject *op, destructor destruct)
{
    if (op->ob_refcnt <= 0) {
        _Ty_NegativeRefcount(filename, lineno, op);
    }
    _Ty_DECREF_STAT_INC();
    assert(!_Ty_IsStaticImmortal(op));
    if (!_Ty_IsImmortal(op)) {
        _Ty_DECREF_DecRefTotal();
    }
    if (--op->ob_refcnt == 0) {
#ifdef Ty_TRACE_REFS
        _Ty_ForgetReference(op);
#endif
        _PyReftracerTrack(op, PyRefTracer_DESTROY);
        destruct(op);
    }
}
#define Ty_DECREF_MORTAL_SPECIALIZED(op, destruct) _Ty_DECREF_MORTAL_SPECIALIZED(__FILE__, __LINE__, op, destruct)

#else

static inline void Ty_DECREF_MORTAL(TyObject *op)
{
    assert(!_Ty_IsStaticImmortal(op));
    _Ty_DECREF_STAT_INC();
    if (--op->ob_refcnt == 0) {
        _Ty_Dealloc(op);
    }
}
#define Ty_DECREF_MORTAL(op) Ty_DECREF_MORTAL(_TyObject_CAST(op))

static inline void Ty_DECREF_MORTAL_SPECIALIZED(TyObject *op, destructor destruct)
{
    assert(!_Ty_IsStaticImmortal(op));
    _Ty_DECREF_STAT_INC();
    if (--op->ob_refcnt == 0) {
        _PyReftracerTrack(op, PyRefTracer_DESTROY);
        destruct(op);
    }
}
#define Ty_DECREF_MORTAL_SPECIALIZED(op, destruct) Ty_DECREF_MORTAL_SPECIALIZED(_TyObject_CAST(op), destruct)

#endif
#endif

/* Inline functions trading binary compatibility for speed:
   _TyObject_Init() is the fast version of PyObject_Init(), and
   _TyObject_InitVar() is the fast version of PyObject_InitVar().

   These inline functions must not be called with op=NULL. */
static inline void
_TyObject_Init(TyObject *op, TyTypeObject *typeobj)
{
    assert(op != NULL);
    Ty_SET_TYPE(op, typeobj);
    assert(_TyType_HasFeature(typeobj, Ty_TPFLAGS_HEAPTYPE) || _Ty_IsImmortal(typeobj));
    _Ty_INCREF_TYPE(typeobj);
    _Ty_NewReference(op);
}

static inline void
_TyObject_InitVar(TyVarObject *op, TyTypeObject *typeobj, Ty_ssize_t size)
{
    assert(op != NULL);
    assert(typeobj != &TyLong_Type);
    _TyObject_Init((TyObject *)op, typeobj);
    Ty_SET_SIZE(op, size);
}

// Macros to accept any type for the parameter, and to automatically pass
// the filename and the filename (if NDEBUG is not defined) where the macro
// is called.
#ifdef NDEBUG
#  define _TyObject_GC_TRACK(op) \
        _TyObject_GC_TRACK(_TyObject_CAST(op))
#  define _TyObject_GC_UNTRACK(op) \
        _TyObject_GC_UNTRACK(_TyObject_CAST(op))
#else
#  define _TyObject_GC_TRACK(op) \
        _TyObject_GC_TRACK(__FILE__, __LINE__, _TyObject_CAST(op))
#  define _TyObject_GC_UNTRACK(op) \
        _TyObject_GC_UNTRACK(__FILE__, __LINE__, _TyObject_CAST(op))
#endif

#ifdef Ty_GIL_DISABLED

/* Tries to increment an object's reference count
 *
 * This is a specialized version of _Ty_TryIncref that only succeeds if the
 * object is immortal or local to this thread. It does not handle the case
 * where the  reference count modification requires an atomic operation. This
 * allows call sites to specialize for the immortal/local case.
 */
static inline int
_Ty_TryIncrefFast(TyObject *op) {
    uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local);
    local += 1;
    if (local == 0) {
        // immortal
        _Ty_INCREF_IMMORTAL_STAT_INC();
        return 1;
    }
    if (_Ty_IsOwnedByCurrentThread(op)) {
        _Ty_INCREF_STAT_INC();
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, local);
#ifdef Ty_REF_DEBUG
        _Ty_IncRefTotal(_TyThreadState_GET());
#endif
        return 1;
    }
    return 0;
}

static inline int
_Ty_TryIncRefShared(TyObject *op)
{
    Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&op->ob_ref_shared);
    for (;;) {
        // If the shared refcount is zero and the object is either merged
        // or may not have weak references, then we cannot incref it.
        if (shared == 0 || shared == _Ty_REF_MERGED) {
            return 0;
        }

        if (_Ty_atomic_compare_exchange_ssize(
                &op->ob_ref_shared,
                &shared,
                shared + (1 << _Ty_REF_SHARED_SHIFT))) {
#ifdef Ty_REF_DEBUG
            _Ty_IncRefTotal(_TyThreadState_GET());
#endif
            _Ty_INCREF_STAT_INC();
            return 1;
        }
    }
}

/* Tries to incref the object op and ensures that *src still points to it. */
static inline int
_Ty_TryIncrefCompare(TyObject **src, TyObject *op)
{
    if (_Ty_TryIncrefFast(op)) {
        return 1;
    }
    if (!_Ty_TryIncRefShared(op)) {
        return 0;
    }
    if (op != _Ty_atomic_load_ptr(src)) {
        Ty_DECREF(op);
        return 0;
    }
    return 1;
}

/* Loads and increfs an object from ptr, which may contain a NULL value.
   Safe with concurrent (atomic) updates to ptr.
   NOTE: The writer must set maybe-weakref on the stored object! */
static inline TyObject *
_Ty_XGetRef(TyObject **ptr)
{
    for (;;) {
        TyObject *value = _TyObject_CAST(_Ty_atomic_load_ptr(ptr));
        if (value == NULL) {
            return value;
        }
        if (_Ty_TryIncrefCompare(ptr, value)) {
            return value;
        }
    }
}

/* Attempts to loads and increfs an object from ptr. Returns NULL
   on failure, which may be due to a NULL value or a concurrent update. */
static inline TyObject *
_Ty_TryXGetRef(TyObject **ptr)
{
    TyObject *value = _TyObject_CAST(_Ty_atomic_load_ptr(ptr));
    if (value == NULL) {
        return value;
    }
    if (_Ty_TryIncrefCompare(ptr, value)) {
        return value;
    }
    return NULL;
}

/* Like Ty_NewRef but also optimistically sets _Ty_REF_MAYBE_WEAKREF
   on objects owned by a different thread. */
static inline TyObject *
_Ty_NewRefWithLock(TyObject *op)
{
    if (_Ty_TryIncrefFast(op)) {
        return op;
    }
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
    _Ty_INCREF_STAT_INC();
    for (;;) {
        Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&op->ob_ref_shared);
        Ty_ssize_t new_shared = shared + (1 << _Ty_REF_SHARED_SHIFT);
        if ((shared & _Ty_REF_SHARED_FLAG_MASK) == 0) {
            new_shared |= _Ty_REF_MAYBE_WEAKREF;
        }
        if (_Ty_atomic_compare_exchange_ssize(
                &op->ob_ref_shared,
                &shared,
                new_shared)) {
            return op;
        }
    }
}

static inline TyObject *
_Ty_XNewRefWithLock(TyObject *obj)
{
    if (obj == NULL) {
        return NULL;
    }
    return _Ty_NewRefWithLock(obj);
}

static inline void
_TyObject_SetMaybeWeakref(TyObject *op)
{
    if (_Ty_IsImmortal(op)) {
        return;
    }
    for (;;) {
        Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&op->ob_ref_shared);
        if ((shared & _Ty_REF_SHARED_FLAG_MASK) != 0) {
            // Nothing to do if it's in WEAKREFS, QUEUED, or MERGED states.
            return;
        }
        if (_Ty_atomic_compare_exchange_ssize(
                &op->ob_ref_shared, &shared, shared | _Ty_REF_MAYBE_WEAKREF)) {
            return;
        }
    }
}

extern PyAPI_FUNC(int) _TyObject_ResurrectEndSlow(TyObject *op);
#endif

// Temporarily resurrects an object during deallocation. The refcount is set
// to one.
static inline void
_TyObject_ResurrectStart(TyObject *op)
{
    assert(Ty_REFCNT(op) == 0);
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
#ifdef Ty_GIL_DISABLED
    _Ty_atomic_store_uintptr_relaxed(&op->ob_tid, _Ty_ThreadId());
    _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, 1);
    _Ty_atomic_store_ssize_relaxed(&op->ob_ref_shared, 0);
#else
    Ty_SET_REFCNT(op, 1);
#endif
#ifdef Ty_TRACE_REFS
    _Ty_ResurrectReference(op);
#endif
}

// Undoes an object resurrection by decrementing the refcount without calling
// _Ty_Dealloc(). Returns 0 if the object is dead (the normal case), and
// deallocation should continue. Returns 1 if the object is still alive.
static inline int
_TyObject_ResurrectEnd(TyObject *op)
{
#ifdef Ty_REF_DEBUG
    _Ty_DecRefTotal(_TyThreadState_GET());
#endif
#ifndef Ty_GIL_DISABLED
    Ty_SET_REFCNT(op, Ty_REFCNT(op) - 1);
    if (Ty_REFCNT(op) == 0) {
# ifdef Ty_TRACE_REFS
        _Ty_ForgetReference(op);
# endif
        return 0;
    }
    return 1;
#else
    uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local);
    Ty_ssize_t shared = _Ty_atomic_load_ssize_acquire(&op->ob_ref_shared);
    if (_Ty_IsOwnedByCurrentThread(op) && local == 1 && shared == 0) {
        // Fast-path: object has a single refcount and is owned by this thread
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, 0);
# ifdef Ty_TRACE_REFS
        _Ty_ForgetReference(op);
# endif
        return 0;
    }
    // Slow-path: object has a shared refcount or is not owned by this thread
    return _TyObject_ResurrectEndSlow(op);
#endif
}

/* Tries to incref op and returns 1 if successful or 0 otherwise. */
static inline int
_Ty_TryIncref(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    return _Ty_TryIncrefFast(op) || _Ty_TryIncRefShared(op);
#else
    if (Ty_REFCNT(op) > 0) {
        Ty_INCREF(op);
        return 1;
    }
    return 0;
#endif
}

#ifdef Ty_REF_DEBUG
extern void _TyInterpreterState_FinalizeRefTotal(TyInterpreterState *);
extern void _Ty_FinalizeRefTotal(_PyRuntimeState *);
extern void _PyDebug_PrintTotalRefs(void);
#endif

#ifdef Ty_TRACE_REFS
extern void _Ty_AddToAllObjects(TyObject *op);
extern void _Ty_PrintReferences(TyInterpreterState *, FILE *);
extern void _Ty_PrintReferenceAddresses(TyInterpreterState *, FILE *);
#endif


/* Return the *address* of the object's weaklist.  The address may be
 * dereferenced to get the current head of the weaklist.  This is useful
 * for iterating over the linked list of weakrefs, especially when the
 * list is being modified externally (e.g. refs getting removed).
 *
 * The returned pointer should not be used to change the head of the list
 * nor should it be used to add, remove, or swap any refs in the list.
 * That is the sole responsibility of the code in weakrefobject.c.
 */
static inline TyObject **
_TyObject_GET_WEAKREFS_LISTPTR(TyObject *op)
{
    if (TyType_Check(op) &&
            ((TyTypeObject *)op)->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(
                                                interp, (TyTypeObject *)op);
        return _PyStaticType_GET_WEAKREFS_LISTPTR(state);
    }
    // Essentially _TyObject_GET_WEAKREFS_LISTPTR_FROM_OFFSET():
    Ty_ssize_t offset = Ty_TYPE(op)->tp_weaklistoffset;
    return (TyObject **)((char *)op + offset);
}

/* This is a special case of _TyObject_GET_WEAKREFS_LISTPTR().
 * Only the most fundamental lookup path is used.
 * Consequently, static types should not be used.
 *
 * For static builtin types the returned pointer will always point
 * to a NULL tp_weaklist.  This is fine for any deallocation cases,
 * since static types are never deallocated and static builtin types
 * are only finalized at the end of runtime finalization.
 *
 * If the weaklist for static types is actually needed then use
 * _TyObject_GET_WEAKREFS_LISTPTR().
 */
static inline PyWeakReference **
_TyObject_GET_WEAKREFS_LISTPTR_FROM_OFFSET(TyObject *op)
{
    assert(!TyType_Check(op) ||
            ((TyTypeObject *)op)->tp_flags & Ty_TPFLAGS_HEAPTYPE);
    Ty_ssize_t offset = Ty_TYPE(op)->tp_weaklistoffset;
    return (PyWeakReference **)((char *)op + offset);
}

// Fast inlined version of TyType_IS_GC()
#define _TyType_IS_GC(t) _TyType_HasFeature((t), Ty_TPFLAGS_HAVE_GC)

// Fast inlined version of PyObject_IS_GC()
static inline int
_TyObject_IS_GC(TyObject *obj)
{
    TyTypeObject *type = Ty_TYPE(obj);
    return (_TyType_IS_GC(type)
            && (type->tp_is_gc == NULL || type->tp_is_gc(obj)));
}

// Fast inlined version of PyObject_Hash()
static inline Ty_hash_t
_TyObject_HashFast(TyObject *op)
{
    if (TyUnicode_CheckExact(op)) {
        Ty_hash_t hash = FT_ATOMIC_LOAD_SSIZE_RELAXED(
                             _PyASCIIObject_CAST(op)->hash);
        if (hash != -1) {
            return hash;
        }
    }
    return PyObject_Hash(op);
}

static inline size_t
_TyType_PreHeaderSize(TyTypeObject *tp)
{
    return (
#ifndef Ty_GIL_DISABLED
        (size_t)_TyType_IS_GC(tp) * sizeof(TyGC_Head) +
#endif
        (size_t)_TyType_HasFeature(tp, Ty_TPFLAGS_PREHEADER) * 2 * sizeof(TyObject *)
    );
}

void _TyObject_GC_Link(TyObject *op);

// Usage: assert(_Ty_CheckSlotResult(obj, "__getitem__", result != NULL));
extern int _Ty_CheckSlotResult(
    TyObject *obj,
    const char *slot_name,
    int success);

// Test if a type supports weak references
static inline int _TyType_SUPPORTS_WEAKREFS(TyTypeObject *type) {
    return (type->tp_weaklistoffset != 0);
}

extern TyObject* _TyType_AllocNoTrack(TyTypeObject *type, Ty_ssize_t nitems);
PyAPI_FUNC(TyObject *) _TyType_NewManagedObject(TyTypeObject *type);

extern TyTypeObject* _TyType_CalculateMetaclass(TyTypeObject *, TyObject *);
extern TyObject* _TyType_GetDocFromInternalDoc(const char *, const char *);
extern TyObject* _TyType_GetTextSignatureFromInternalDoc(const char *, const char *, int);
extern int _TyObject_SetAttributeErrorContext(TyObject *v, TyObject* name);

void _TyObject_InitInlineValues(TyObject *obj, TyTypeObject *tp);
extern int _TyObject_StoreInstanceAttribute(TyObject *obj,
                                            TyObject *name, TyObject *value);
extern bool _TyObject_TryGetInstanceAttribute(TyObject *obj, TyObject *name,
                                              TyObject **attr);
extern TyObject *_TyType_LookupRefAndVersion(TyTypeObject *, TyObject *,
                                             unsigned int *);

// Internal API to look for a name through the MRO.
// This stores a stack reference in out and returns the value of
// type->tp_version or zero if name is missing. It doesn't set an exception!
extern unsigned int
_TyType_LookupStackRefAndVersion(TyTypeObject *type, TyObject *name, _PyStackRef *out);

// Cache the provided init method in the specialization cache of type if the
// provided type version matches the current version of the type.
//
// The cached value is borrowed and is only valid if guarded by a type
// version check. In free-threaded builds the init method must also use
// deferred reference counting.
//
// Returns 1 if the value was cached or 0 otherwise.
extern int _TyType_CacheInitForSpecialization(PyHeapTypeObject *type,
                                              TyObject *init,
                                              unsigned int tp_version);

#ifdef Ty_GIL_DISABLED
#  define MANAGED_DICT_OFFSET    (((Ty_ssize_t)sizeof(TyObject *))*-1)
#  define MANAGED_WEAKREF_OFFSET (((Ty_ssize_t)sizeof(TyObject *))*-2)
#else
#  define MANAGED_DICT_OFFSET    (((Ty_ssize_t)sizeof(TyObject *))*-3)
#  define MANAGED_WEAKREF_OFFSET (((Ty_ssize_t)sizeof(TyObject *))*-4)
#endif

typedef union {
    PyDictObject *dict;
} PyManagedDictPointer;

static inline PyManagedDictPointer *
_TyObject_ManagedDictPointer(TyObject *obj)
{
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
    return (PyManagedDictPointer *)((char *)obj + MANAGED_DICT_OFFSET);
}

static inline PyDictObject *
_TyObject_GetManagedDict(TyObject *obj)
{
    PyManagedDictPointer *dorv = _TyObject_ManagedDictPointer(obj);
    return (PyDictObject *)FT_ATOMIC_LOAD_PTR_ACQUIRE(dorv->dict);
}

static inline PyDictValues *
_TyObject_InlineValues(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    assert(tp->tp_basicsize > 0 && (size_t)tp->tp_basicsize % sizeof(TyObject *) == 0);
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES);
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
    return (PyDictValues *)((char *)obj + tp->tp_basicsize);
}

extern TyObject ** _TyObject_ComputedDictPointer(TyObject *);
extern int _TyObject_IsInstanceDictEmpty(TyObject *);

// Export for 'math' shared extension
PyAPI_FUNC(TyObject*) _TyObject_LookupSpecial(TyObject *, TyObject *);
PyAPI_FUNC(int) _TyObject_LookupSpecialMethod(TyObject *attr, _PyStackRef *method_and_self);

// Calls the method named `attr` on `self`, but does not set an exception if
// the attribute does not exist.
PyAPI_FUNC(TyObject *)
_TyObject_MaybeCallSpecialNoArgs(TyObject *self, TyObject *attr);

PyAPI_FUNC(TyObject *)
_TyObject_MaybeCallSpecialOneArg(TyObject *self, TyObject *attr, TyObject *arg);

extern int _TyObject_IsAbstract(TyObject *);

PyAPI_FUNC(int) _TyObject_GetMethod(TyObject *obj, TyObject *name, TyObject **method);
extern TyObject* _TyObject_NextNotImplemented(TyObject *);

// Pickle support.
// Export for '_datetime' shared extension
PyAPI_FUNC(TyObject*) _TyObject_GetState(TyObject *);

/* C function call trampolines to mitigate bad function pointer casts.
 *
 * Typical native ABIs ignore additional arguments or fill in missing
 * values with 0/NULL in function pointer cast. Compilers do not show
 * warnings when a function pointer is explicitly casted to an
 * incompatible type.
 *
 * Bad fpcasts are an issue in WebAssembly. WASM's indirect_call has strict
 * function signature checks. Argument count, types, and return type must
 * match.
 *
 * Third party code unintentionally rely on problematic fpcasts. The call
 * trampoline mitigates common occurrences of bad fpcasts on Emscripten.
 */
#if !(defined(__EMSCRIPTEN__) && defined(PY_CALL_TRAMPOLINE))
#define _PyCFunction_TrampolineCall(meth, self, args) \
    (meth)((self), (args))
#define _PyCFunctionWithKeywords_TrampolineCall(meth, self, args, kw) \
    (meth)((self), (args), (kw))
#endif // __EMSCRIPTEN__ && PY_CALL_TRAMPOLINE

// Export these 2 symbols for '_pickle' shared extension
PyAPI_DATA(TyTypeObject) _PyNone_Type;
PyAPI_DATA(TyTypeObject) _PyNotImplemented_Type;

// Maps Py_LT to Py_GT, ..., Py_GE to Py_LE.
// Export for the stable ABI.
PyAPI_DATA(int) _Ty_SwappedOp[];

extern void _Ty_GetConstant_Init(void);

enum _PyAnnotateFormat {
    _Ty_ANNOTATE_FORMAT_VALUE = 1,
    _Ty_ANNOTATE_FORMAT_VALUE_WITH_FAKE_GLOBALS = 2,
    _Ty_ANNOTATE_FORMAT_FORWARDREF = 3,
    _Ty_ANNOTATE_FORMAT_STRING = 4,
};

int _TyObject_SetDict(TyObject *obj, TyObject *value);

#ifndef Ty_GIL_DISABLED
static inline Ty_ALWAYS_INLINE void _Ty_INCREF_MORTAL(TyObject *op)
{
    assert(!_Ty_IsStaticImmortal(op));
    op->ob_refcnt++;
    _Ty_INCREF_STAT_INC();
#if defined(Ty_REF_DEBUG) && !defined(Ty_LIMITED_API)
    if (!_Ty_IsImmortal(op)) {
        _Ty_INCREF_IncRefTotal();
    }
#endif
}
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_OBJECT_H */
