#ifndef _Ty_REFCOUNT_H
#define _Ty_REFCOUNT_H
#ifdef __cplusplus
extern "C" {
#endif


/*
Immortalization:

The following indicates the immortalization strategy depending on the amount
of available bits in the reference count field. All strategies are backwards
compatible but the specific reference count value or immortalization check
might change depending on the specializations for the underlying system.

Proper deallocation of immortal instances requires distinguishing between
statically allocated immortal instances vs those promoted by the runtime to be
immortal. The latter should be the only instances that require
cleanup during runtime finalization.
*/

#define _Ty_STATICALLY_ALLOCATED_FLAG 4
#define _Ty_IMMORTAL_FLAGS 1

#if SIZEOF_VOID_P > 4
/*
In 64+ bit systems, any object whose 32 bit reference count is >= 2**31
will be treated as immortal.

Using the lower 32 bits makes the value backwards compatible by allowing
C-Extensions without the updated checks in Ty_INCREF and Ty_DECREF to safely
increase and decrease the objects reference count.

In order to offer sufficient resilience to C extensions using the stable ABI
compiled against 3.11 or earlier, we set the initial value near the
middle of the range (2**31, 2**32). That way the refcount can be
off by ~1 billion without affecting immortality.

Reference count increases will use saturated arithmetic, taking advantage of
having all the lower 32 bits set, which will avoid the reference count to go
beyond the refcount limit. Immortality checks for reference count decreases will
be done by checking the bit sign flag in the lower 32 bits.

To ensure that once an object becomes immortal, it remains immortal, the threshold
for omitting increfs is much higher than for omitting decrefs. Consequently, once
the refcount for an object exceeds _Ty_IMMORTAL_MINIMUM_REFCNT it will gradually
increase over time until it reaches _Ty_IMMORTAL_INITIAL_REFCNT.
*/
#define _Ty_IMMORTAL_INITIAL_REFCNT (3ULL << 30)
#define _Ty_IMMORTAL_MINIMUM_REFCNT (1ULL << 31)
#define _Ty_STATIC_FLAG_BITS ((Ty_ssize_t)(_Ty_STATICALLY_ALLOCATED_FLAG | _Ty_IMMORTAL_FLAGS))
#define _Ty_STATIC_IMMORTAL_INITIAL_REFCNT (((Ty_ssize_t)_Ty_IMMORTAL_INITIAL_REFCNT) | (_Ty_STATIC_FLAG_BITS << 48))

#else
/*
In 32 bit systems, an object will be treated as immortal if its reference
count equals or exceeds _Ty_IMMORTAL_MINIMUM_REFCNT (2**30).

Using the lower 30 bits makes the value backwards compatible by allowing
C-Extensions without the updated checks in Ty_INCREF and Ty_DECREF to safely
increase and decrease the objects reference count. The object would lose its
immortality, but the execution would still be correct.

Reference count increases and decreases will first go through an immortality
check by comparing the reference count field to the minimum immortality refcount.
*/
#define _Ty_IMMORTAL_INITIAL_REFCNT ((Ty_ssize_t)(5L << 28))
#define _Ty_IMMORTAL_MINIMUM_REFCNT ((Ty_ssize_t)(1L << 30))
#define _Ty_STATIC_IMMORTAL_INITIAL_REFCNT ((Ty_ssize_t)(7L << 28))
#define _Ty_STATIC_IMMORTAL_MINIMUM_REFCNT ((Ty_ssize_t)(6L << 28))
#endif

// Ty_GIL_DISABLED builds indicate immortal objects using `ob_ref_local`, which is
// always 32-bits.
#ifdef Ty_GIL_DISABLED
#define _Ty_IMMORTAL_REFCNT_LOCAL UINT32_MAX
#endif


#ifdef Ty_GIL_DISABLED
   // The shared reference count uses the two least-significant bits to store
   // flags. The remaining bits are used to store the reference count.
#  define _Ty_REF_SHARED_SHIFT        2
#  define _Ty_REF_SHARED_FLAG_MASK    0x3

   // The shared flags are initialized to zero.
#  define _Ty_REF_SHARED_INIT         0x0
#  define _Ty_REF_MAYBE_WEAKREF       0x1
#  define _Ty_REF_QUEUED              0x2
#  define _Ty_REF_MERGED              0x3

   // Create a shared field from a refcnt and desired flags
#  define _Ty_REF_SHARED(refcnt, flags) \
              (((refcnt) << _Ty_REF_SHARED_SHIFT) + (flags))
#endif  // Ty_GIL_DISABLED


// Ty_REFCNT() implementation for the stable ABI
PyAPI_FUNC(Ty_ssize_t) Ty_REFCNT(TyObject *ob);

#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030e0000
    // Stable ABI implements Ty_REFCNT() as a function call
    // on limited C API version 3.14 and newer.
#else
    static inline Ty_ssize_t _Ty_REFCNT(TyObject *ob) {
    #if !defined(Ty_GIL_DISABLED)
        return ob->ob_refcnt;
    #else
        uint32_t local = _Ty_atomic_load_uint32_relaxed(&ob->ob_ref_local);
        if (local == _Ty_IMMORTAL_REFCNT_LOCAL) {
            return _Ty_IMMORTAL_INITIAL_REFCNT;
        }
        Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&ob->ob_ref_shared);
        return _Ty_STATIC_CAST(Ty_ssize_t, local) +
               Ty_ARITHMETIC_RIGHT_SHIFT(Ty_ssize_t, shared, _Ty_REF_SHARED_SHIFT);
    #endif
    }
    #if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
    #  define Ty_REFCNT(ob) _Ty_REFCNT(_TyObject_CAST(ob))
    #endif
#endif

static inline Ty_ALWAYS_INLINE int _Ty_IsImmortal(TyObject *op)
{
#if defined(Ty_GIL_DISABLED)
    return (_Ty_atomic_load_uint32_relaxed(&op->ob_ref_local) ==
            _Ty_IMMORTAL_REFCNT_LOCAL);
#elif SIZEOF_VOID_P > 4
    return _Py_CAST(PY_INT32_T, op->ob_refcnt) < 0;
#else
    return op->ob_refcnt >= _Ty_IMMORTAL_MINIMUM_REFCNT;
#endif
}
#define _Ty_IsImmortal(op) _Ty_IsImmortal(_TyObject_CAST(op))


static inline Ty_ALWAYS_INLINE int _Ty_IsStaticImmortal(TyObject *op)
{
#if defined(Ty_GIL_DISABLED) || SIZEOF_VOID_P > 4
    return (op->ob_flags & _Ty_STATICALLY_ALLOCATED_FLAG) != 0;
#else
    return op->ob_refcnt >= _Ty_STATIC_IMMORTAL_MINIMUM_REFCNT;
#endif
}
#define _Ty_IsStaticImmortal(op) _Ty_IsStaticImmortal(_TyObject_CAST(op))

// Ty_SET_REFCNT() implementation for stable ABI
PyAPI_FUNC(void) _Ty_SetRefcnt(TyObject *ob, Ty_ssize_t refcnt);

static inline void Ty_SET_REFCNT(TyObject *ob, Ty_ssize_t refcnt) {
    assert(refcnt >= 0);
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030d0000
    // Stable ABI implements Ty_SET_REFCNT() as a function call
    // on limited C API version 3.13 and newer.
    _Ty_SetRefcnt(ob, refcnt);
#else
    // This immortal check is for code that is unaware of immortal objects.
    // The runtime tracks these objects and we should avoid as much
    // as possible having extensions inadvertently change the refcnt
    // of an immortalized object.
    if (_Ty_IsImmortal(ob)) {
        return;
    }
#ifndef Ty_GIL_DISABLED
#if SIZEOF_VOID_P > 4
    ob->ob_refcnt = (PY_UINT32_T)refcnt;
#else
    ob->ob_refcnt = refcnt;
#endif
#else
    if (_Ty_IsOwnedByCurrentThread(ob)) {
        if ((size_t)refcnt > (size_t)UINT32_MAX) {
            // On overflow, make the object immortal
            ob->ob_tid = _Ty_UNOWNED_TID;
            ob->ob_ref_local = _Ty_IMMORTAL_REFCNT_LOCAL;
            ob->ob_ref_shared = 0;
        }
        else {
            // Set local refcount to desired refcount and shared refcount
            // to zero, but preserve the shared refcount flags.
            ob->ob_ref_local = _Ty_STATIC_CAST(uint32_t, refcnt);
            ob->ob_ref_shared &= _Ty_REF_SHARED_FLAG_MASK;
        }
    }
    else {
        // Set local refcount to zero and shared refcount to desired refcount.
        // Mark the object as merged.
        ob->ob_tid = _Ty_UNOWNED_TID;
        ob->ob_ref_local = 0;
        ob->ob_ref_shared = _Ty_REF_SHARED(refcnt, _Ty_REF_MERGED);
    }
#endif  // Ty_GIL_DISABLED
#endif  // Ty_LIMITED_API+0 < 0x030d0000
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_SET_REFCNT(ob, refcnt) Ty_SET_REFCNT(_TyObject_CAST(ob), (refcnt))
#endif


/*
The macros Ty_INCREF(op) and Ty_DECREF(op) are used to increment or decrement
reference counts.  Ty_DECREF calls the object's deallocator function when
the refcount falls to 0; for
objects that don't contain references to other objects or heap memory
this can be the standard function free().  Both macros can be used
wherever a void expression is allowed.  The argument must not be a
NULL pointer.  If it may be NULL, use Ty_XINCREF/Ty_XDECREF instead.
The macro _Ty_NewReference(op) initialize reference counts to 1, and
in special builds (Ty_REF_DEBUG, Ty_TRACE_REFS) performs additional
bookkeeping appropriate to the special build.

We assume that the reference count field can never overflow; this can
be proven when the size of the field is the same as the pointer size, so
we ignore the possibility.  Provided a C int is at least 32 bits (which
is implicitly assumed in many parts of this code), that's enough for
about 2**31 references to an object.

XXX The following became out of date in Python 2.2, but I'm not sure
XXX what the full truth is now.  Certainly, heap-allocated type objects
XXX can and should be deallocated.
Type objects should never be deallocated; the type pointer in an object
is not considered to be a reference to the type object, to save
complications in the deallocation function.  (This is actually a
decision that's up to the implementer of each new type so if you want,
you can count such references to the type object.)
*/

#if defined(Ty_REF_DEBUG) && !defined(Ty_LIMITED_API)
PyAPI_FUNC(void) _Ty_NegativeRefcount(const char *filename, int lineno,
                                      TyObject *op);
PyAPI_FUNC(void) _Ty_INCREF_IncRefTotal(void);
PyAPI_FUNC(void) _Ty_DECREF_DecRefTotal(void);
#endif  // Ty_REF_DEBUG && !Ty_LIMITED_API

PyAPI_FUNC(void) _Ty_Dealloc(TyObject *);


/*
These are provided as conveniences to Python runtime embedders, so that
they can have object code that is not dependent on Python compilation flags.
*/
PyAPI_FUNC(void) Ty_IncRef(TyObject *);
PyAPI_FUNC(void) Ty_DecRef(TyObject *);

// Similar to Ty_IncRef() and Ty_DecRef() but the argument must be non-NULL.
// Private functions used by Ty_INCREF() and Ty_DECREF().
PyAPI_FUNC(void) _Ty_IncRef(TyObject *);
PyAPI_FUNC(void) _Ty_DecRef(TyObject *);

static inline Ty_ALWAYS_INLINE void Ty_INCREF(TyObject *op)
{
#if defined(Ty_LIMITED_API) && (Ty_LIMITED_API+0 >= 0x030c0000 || defined(Ty_REF_DEBUG))
    // Stable ABI implements Ty_INCREF() as a function call on limited C API
    // version 3.12 and newer, and on Python built in debug mode. _Ty_IncRef()
    // was added to Python 3.10.0a7, use Ty_IncRef() on older Python versions.
    // Ty_IncRef() accepts NULL whereas _Ty_IncRef() doesn't.
#  if Ty_LIMITED_API+0 >= 0x030a00A7
    _Ty_IncRef(op);
#  else
    Ty_IncRef(op);
#  endif
#else
    // Non-limited C API and limited C API for Python 3.9 and older access
    // directly TyObject.ob_refcnt.
#if defined(Ty_GIL_DISABLED)
    uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local);
    uint32_t new_local = local + 1;
    if (new_local == 0) {
        _Ty_INCREF_IMMORTAL_STAT_INC();
        // local is equal to _Ty_IMMORTAL_REFCNT_LOCAL: do nothing
        return;
    }
    if (_Ty_IsOwnedByCurrentThread(op)) {
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, new_local);
    }
    else {
        _Ty_atomic_add_ssize(&op->ob_ref_shared, (1 << _Ty_REF_SHARED_SHIFT));
    }
#elif SIZEOF_VOID_P > 4
    PY_UINT32_T cur_refcnt = op->ob_refcnt;
    if (cur_refcnt >= _Ty_IMMORTAL_INITIAL_REFCNT) {
        // the object is immortal
        _Ty_INCREF_IMMORTAL_STAT_INC();
        return;
    }
    op->ob_refcnt = cur_refcnt + 1;
#else
    if (_Ty_IsImmortal(op)) {
        _Ty_INCREF_IMMORTAL_STAT_INC();
        return;
    }
    op->ob_refcnt++;
#endif
    _Ty_INCREF_STAT_INC();
#ifdef Ty_REF_DEBUG
    // Don't count the incref if the object is immortal.
    if (!_Ty_IsImmortal(op)) {
        _Ty_INCREF_IncRefTotal();
    }
#endif
#endif
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_INCREF(op) Ty_INCREF(_TyObject_CAST(op))
#endif


#if !defined(Ty_LIMITED_API) && defined(Ty_GIL_DISABLED)
// Implements Ty_DECREF on objects not owned by the current thread.
PyAPI_FUNC(void) _Ty_DecRefShared(TyObject *);
PyAPI_FUNC(void) _Ty_DecRefSharedDebug(TyObject *, const char *, int);

// Called from Ty_DECREF by the owning thread when the local refcount reaches
// zero. The call will deallocate the object if the shared refcount is also
// zero. Otherwise, the thread gives up ownership and merges the reference
// count fields.
PyAPI_FUNC(void) _Ty_MergeZeroLocalRefcount(TyObject *);
#endif

#if defined(Ty_LIMITED_API) && (Ty_LIMITED_API+0 >= 0x030c0000 || defined(Ty_REF_DEBUG))
// Stable ABI implements Ty_DECREF() as a function call on limited C API
// version 3.12 and newer, and on Python built in debug mode. _Ty_DecRef() was
// added to Python 3.10.0a7, use Ty_DecRef() on older Python versions.
// Ty_DecRef() accepts NULL whereas _Ty_DecRef() doesn't.
static inline void Ty_DECREF(TyObject *op) {
#  if Ty_LIMITED_API+0 >= 0x030a00A7
    _Ty_DecRef(op);
#  else
    Ty_DecRef(op);
#  endif
}
#define Ty_DECREF(op) Ty_DECREF(_TyObject_CAST(op))

#elif defined(Ty_GIL_DISABLED) && defined(Ty_REF_DEBUG)
static inline void Ty_DECREF(const char *filename, int lineno, TyObject *op)
{
    uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local);
    if (local == _Ty_IMMORTAL_REFCNT_LOCAL) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
    _Ty_DECREF_DecRefTotal();
    if (_Ty_IsOwnedByCurrentThread(op)) {
        if (local == 0) {
            _Ty_NegativeRefcount(filename, lineno, op);
        }
        local--;
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, local);
        if (local == 0) {
            _Ty_MergeZeroLocalRefcount(op);
        }
    }
    else {
        _Ty_DecRefSharedDebug(op, filename, lineno);
    }
}
#define Ty_DECREF(op) Ty_DECREF(__FILE__, __LINE__, _TyObject_CAST(op))

#elif defined(Ty_GIL_DISABLED)
static inline void Ty_DECREF(TyObject *op)
{
    uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local);
    if (local == _Ty_IMMORTAL_REFCNT_LOCAL) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
    if (_Ty_IsOwnedByCurrentThread(op)) {
        local--;
        _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, local);
        if (local == 0) {
            _Ty_MergeZeroLocalRefcount(op);
        }
    }
    else {
        _Ty_DecRefShared(op);
    }
}
#define Ty_DECREF(op) Ty_DECREF(_TyObject_CAST(op))

#elif defined(Ty_REF_DEBUG)

static inline void Ty_DECREF(const char *filename, int lineno, TyObject *op)
{
#if SIZEOF_VOID_P > 4
    /* If an object has been freed, it will have a negative full refcnt
     * If it has not it been freed, will have a very large refcnt */
    if (op->ob_refcnt_full <= 0 || op->ob_refcnt > (((PY_UINT32_T)-1) - (1<<20))) {
#else
    if (op->ob_refcnt <= 0) {
#endif
        _Ty_NegativeRefcount(filename, lineno, op);
    }
    if (_Ty_IsImmortal(op)) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
    _Ty_DECREF_DecRefTotal();
    if (--op->ob_refcnt == 0) {
        _Ty_Dealloc(op);
    }
}
#define Ty_DECREF(op) Ty_DECREF(__FILE__, __LINE__, _TyObject_CAST(op))

#else

static inline Ty_ALWAYS_INLINE void Ty_DECREF(TyObject *op)
{
    // Non-limited C API and limited C API for Python 3.9 and older access
    // directly TyObject.ob_refcnt.
    if (_Ty_IsImmortal(op)) {
        _Ty_DECREF_IMMORTAL_STAT_INC();
        return;
    }
    _Ty_DECREF_STAT_INC();
    if (--op->ob_refcnt == 0) {
        _Ty_Dealloc(op);
    }
}
#define Ty_DECREF(op) Ty_DECREF(_TyObject_CAST(op))
#endif


/* Safely decref `op` and set `op` to NULL, especially useful in tp_clear
 * and tp_dealloc implementations.
 *
 * Note that "the obvious" code can be deadly:
 *
 *     Ty_XDECREF(op);
 *     op = NULL;
 *
 * Typically, `op` is something like self->containee, and `self` is done
 * using its `containee` member.  In the code sequence above, suppose
 * `containee` is non-NULL with a refcount of 1.  Its refcount falls to
 * 0 on the first line, which can trigger an arbitrary amount of code,
 * possibly including finalizers (like __del__ methods or weakref callbacks)
 * coded in Python, which in turn can release the GIL and allow other threads
 * to run, etc.  Such code may even invoke methods of `self` again, or cause
 * cyclic gc to trigger, but-- oops! --self->containee still points to the
 * object being torn down, and it may be in an insane state while being torn
 * down.  This has in fact been a rich historic source of miserable (rare &
 * hard-to-diagnose) segfaulting (and other) bugs.
 *
 * The safe way is:
 *
 *      Ty_CLEAR(op);
 *
 * That arranges to set `op` to NULL _before_ decref'ing, so that any code
 * triggered as a side-effect of `op` getting torn down no longer believes
 * `op` points to a valid object.
 *
 * There are cases where it's safe to use the naive code, but they're brittle.
 * For example, if `op` points to a Python integer, you know that destroying
 * one of those can't cause problems -- but in part that relies on that
 * Python integers aren't currently weakly referencable.  Best practice is
 * to use Ty_CLEAR() even if you can't think of a reason for why you need to.
 *
 * gh-98724: Use a temporary variable to only evaluate the macro argument once,
 * to avoid the duplication of side effects if the argument has side effects.
 *
 * gh-99701: If the TyObject* type is used with casting arguments to TyObject*,
 * the code can be miscompiled with strict aliasing because of type punning.
 * With strict aliasing, a compiler considers that two pointers of different
 * types cannot read or write the same memory which enables optimization
 * opportunities.
 *
 * If available, use _Ty_TYPEOF() to use the 'op' type for temporary variables,
 * and so avoid type punning. Otherwise, use memcpy() which causes type erasure
 * and so prevents the compiler to reuse an old cached 'op' value after
 * Ty_CLEAR().
 */
#ifdef _Ty_TYPEOF
#define Ty_CLEAR(op) \
    do { \
        _Ty_TYPEOF(op)* _tmp_op_ptr = &(op); \
        _Ty_TYPEOF(op) _tmp_old_op = (*_tmp_op_ptr); \
        if (_tmp_old_op != NULL) { \
            *_tmp_op_ptr = _Py_NULL; \
            Ty_DECREF(_tmp_old_op); \
        } \
    } while (0)
#else
#define Ty_CLEAR(op) \
    do { \
        TyObject **_tmp_op_ptr = _Py_CAST(TyObject**, &(op)); \
        TyObject *_tmp_old_op = (*_tmp_op_ptr); \
        if (_tmp_old_op != NULL) { \
            TyObject *_null_ptr = _Py_NULL; \
            memcpy(_tmp_op_ptr, &_null_ptr, sizeof(TyObject*)); \
            Ty_DECREF(_tmp_old_op); \
        } \
    } while (0)
#endif


/* Function to use in case the object pointer can be NULL: */
static inline void Ty_XINCREF(TyObject *op)
{
    if (op != _Py_NULL) {
        Ty_INCREF(op);
    }
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_XINCREF(op) Ty_XINCREF(_TyObject_CAST(op))
#endif

static inline void Ty_XDECREF(TyObject *op)
{
    if (op != _Py_NULL) {
        Ty_DECREF(op);
    }
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_XDECREF(op) Ty_XDECREF(_TyObject_CAST(op))
#endif

// Create a new strong reference to an object:
// increment the reference count of the object and return the object.
PyAPI_FUNC(TyObject*) Ty_NewRef(TyObject *obj);

// Similar to Ty_NewRef(), but the object can be NULL.
PyAPI_FUNC(TyObject*) Ty_XNewRef(TyObject *obj);

static inline TyObject* _Ty_NewRef(TyObject *obj)
{
    Ty_INCREF(obj);
    return obj;
}

static inline TyObject* _Ty_XNewRef(TyObject *obj)
{
    Ty_XINCREF(obj);
    return obj;
}

// Ty_NewRef() and Ty_XNewRef() are exported as functions for the stable ABI.
// Names overridden with macros by static inline functions for best
// performances.
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_NewRef(obj) _Ty_NewRef(_TyObject_CAST(obj))
#  define Ty_XNewRef(obj) _Ty_XNewRef(_TyObject_CAST(obj))
#else
#  define Ty_NewRef(obj) _Ty_NewRef(obj)
#  define Ty_XNewRef(obj) _Ty_XNewRef(obj)
#endif


#ifdef __cplusplus
}
#endif
#endif   // !_Ty_REFCOUNT_H
