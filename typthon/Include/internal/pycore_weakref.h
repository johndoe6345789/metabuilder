#ifndef Ty_INTERNAL_WEAKREF_H
#define Ty_INTERNAL_WEAKREF_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_critical_section.h" // Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_lock.h"             // PyMutex_LockFlags()
#include "pycore_object.h"           // _Ty_REF_IS_MERGED()
#include "pycore_pyatomic_ft_wrappers.h"

#ifdef Ty_GIL_DISABLED

#define WEAKREF_LIST_LOCK(obj) \
    _TyInterpreterState_GET()  \
        ->weakref_locks[((uintptr_t)obj) % NUM_WEAKREF_LIST_LOCKS]

// Lock using the referenced object
#define LOCK_WEAKREFS(obj) \
    PyMutex_LockFlags(&WEAKREF_LIST_LOCK(obj), _Ty_LOCK_DONT_DETACH)
#define UNLOCK_WEAKREFS(obj) PyMutex_Unlock(&WEAKREF_LIST_LOCK(obj))

// Lock using a weakref
#define LOCK_WEAKREFS_FOR_WR(wr) \
    PyMutex_LockFlags(wr->weakrefs_lock, _Ty_LOCK_DONT_DETACH)
#define UNLOCK_WEAKREFS_FOR_WR(wr) PyMutex_Unlock(wr->weakrefs_lock)

#define FT_CLEAR_WEAKREFS(obj, weakref_list)    \
    do {                                        \
        assert(Ty_REFCNT(obj) == 0);            \
        PyObject_ClearWeakRefs(obj);            \
    } while (0)

#else

#define LOCK_WEAKREFS(obj)
#define UNLOCK_WEAKREFS(obj)

#define LOCK_WEAKREFS_FOR_WR(wr)
#define UNLOCK_WEAKREFS_FOR_WR(wr)

#define FT_CLEAR_WEAKREFS(obj, weakref_list)        \
    do {                                            \
        assert(Ty_REFCNT(obj) == 0);                \
        if (weakref_list != NULL) {                 \
            PyObject_ClearWeakRefs(obj);            \
        }                                           \
    } while (0)

#endif

static inline int _is_dead(TyObject *obj)
{
    // Explanation for the Ty_REFCNT() check: when a weakref's target is part
    // of a long chain of deallocations which triggers the trashcan mechanism,
    // clearing the weakrefs can be delayed long after the target's refcount
    // has dropped to zero.  In the meantime, code accessing the weakref will
    // be able to "see" the target object even though it is supposed to be
    // unreachable.  See issue gh-60806.
#if defined(Ty_GIL_DISABLED)
    Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&obj->ob_ref_shared);
    return shared == _Ty_REF_SHARED(0, _Ty_REF_MERGED);
#else
    return (Ty_REFCNT(obj) == 0);
#endif
}

static inline TyObject* _TyWeakref_GET_REF(TyObject *ref_obj)
{
    assert(PyWeakref_Check(ref_obj));
    PyWeakReference *ref = _Py_CAST(PyWeakReference*, ref_obj);

    TyObject *obj = FT_ATOMIC_LOAD_PTR(ref->wr_object);
    if (obj == Ty_None) {
        // clear_weakref() was called
        return NULL;
    }

    LOCK_WEAKREFS(obj);
#ifdef Ty_GIL_DISABLED
    if (ref->wr_object == Ty_None) {
        // clear_weakref() was called
        UNLOCK_WEAKREFS(obj);
        return NULL;
    }
#endif
    if (_Ty_TryIncref(obj)) {
        UNLOCK_WEAKREFS(obj);
        return obj;
    }
    UNLOCK_WEAKREFS(obj);
    return NULL;
}

static inline int _TyWeakref_IS_DEAD(TyObject *ref_obj)
{
    assert(PyWeakref_Check(ref_obj));
    int ret = 0;
    PyWeakReference *ref = _Py_CAST(PyWeakReference*, ref_obj);
    TyObject *obj = FT_ATOMIC_LOAD_PTR(ref->wr_object);
    if (obj == Ty_None) {
        // clear_weakref() was called
        ret = 1;
    }
    else {
        LOCK_WEAKREFS(obj);
        // See _TyWeakref_GET_REF() for the rationale of this test
#ifdef Ty_GIL_DISABLED
        ret = (ref->wr_object == Ty_None) || _is_dead(obj);
#else
        ret = _is_dead(obj);
#endif
        UNLOCK_WEAKREFS(obj);
    }
    return ret;
}

extern Ty_ssize_t _TyWeakref_GetWeakrefCount(TyObject *obj);

// Clear all the weak references to obj but leave their callbacks uncalled and
// intact.
extern void _TyWeakref_ClearWeakRefsNoCallbacks(TyObject *obj);

PyAPI_FUNC(int) _TyWeakref_IsDead(TyObject *weakref);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_WEAKREF_H */
