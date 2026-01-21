#ifndef Ty_INTERNAL_STACKREF_H
#define Ty_INTERNAL_STACKREF_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_object.h"        // Ty_DECREF_MORTAL
#include "pycore_object_deferred.h" // _TyObject_HasDeferredRefcount()

#include <stdbool.h>              // bool


/*
  This file introduces a new API for handling references on the stack, called
  _PyStackRef. This API is inspired by HPy.

  There are 3 main operations, that convert _PyStackRef to TyObject* and
  vice versa:

    1. Borrow (discouraged)
    2. Steal
    3. New

  Borrow means that the reference is converted without any change in ownership.
  This is discouraged because it makes verification much harder. It also makes
  unboxed integers harder in the future.

  Steal means that ownership is transferred to something else. The total
  number of references to the object stays the same.  The old reference is no
  longer valid.

  New creates a new reference from the old reference. The old reference
  is still valid.

  All _PyStackRef must be operated on by the new reference operations:

    1. DUP
    2. CLOSE

   DUP is roughly equivalent to Ty_NewRef. It creates a new reference from an old
   reference. The old reference remains unchanged.

   CLOSE is roughly equivalent to Ty_DECREF. It destroys a reference.

   Note that it is unsafe to borrow a _PyStackRef and then do normal
   CPython refcounting operations on it!
*/


#if !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)

#define Ty_TAG_BITS 0

PyAPI_FUNC(TyObject *) _Ty_stackref_get_object(_PyStackRef ref);
PyAPI_FUNC(TyObject *) _Ty_stackref_close(_PyStackRef ref, const char *filename, int linenumber);
PyAPI_FUNC(_PyStackRef) _Ty_stackref_create(TyObject *obj, const char *filename, int linenumber);
PyAPI_FUNC(void) _Ty_stackref_record_borrow(_PyStackRef ref, const char *filename, int linenumber);
extern void _Ty_stackref_associate(TyInterpreterState *interp, TyObject *obj, _PyStackRef ref);

static const _PyStackRef PyStackRef_NULL = { .index = 0 };

// Use the first 3 even numbers for None, True and False.
// Odd numbers are reserved for (tagged) integers
#define PyStackRef_None ((_PyStackRef){ .index = 2 } )
#define PyStackRef_False ((_PyStackRef){ .index = 4 })
#define PyStackRef_True ((_PyStackRef){ .index = 6 })

#define INITIAL_STACKREF_INDEX 8

static inline int
PyStackRef_IsNull(_PyStackRef ref)
{
    return ref.index == 0;
}

static inline int
PyStackRef_IsTrue(_PyStackRef ref)
{
    return _Ty_stackref_get_object(ref) == Ty_True;
}

static inline int
PyStackRef_IsFalse(_PyStackRef ref)
{
    return _Ty_stackref_get_object(ref) == Ty_False;
}

static inline int
PyStackRef_IsNone(_PyStackRef ref)
{
    return _Ty_stackref_get_object(ref) == Ty_None;
}

static inline TyObject *
_PyStackRef_AsPyObjectBorrow(_PyStackRef ref, const char *filename, int linenumber)
{
    assert((ref.index & 1) == 0);
    _Ty_stackref_record_borrow(ref, filename, linenumber);
    return _Ty_stackref_get_object(ref);
}

#define PyStackRef_AsPyObjectBorrow(REF) _PyStackRef_AsPyObjectBorrow((REF), __FILE__, __LINE__)

static inline TyObject *
_PyStackRef_AsPyObjectSteal(_PyStackRef ref, const char *filename, int linenumber)
{
    return _Ty_stackref_close(ref, filename, linenumber);
}
#define PyStackRef_AsPyObjectSteal(REF) _PyStackRef_AsPyObjectSteal((REF), __FILE__, __LINE__)

static inline _PyStackRef
_PyStackRef_FromPyObjectNew(TyObject *obj, const char *filename, int linenumber)
{
    Ty_INCREF(obj);
    return _Ty_stackref_create(obj, filename, linenumber);
}
#define PyStackRef_FromPyObjectNew(obj) _PyStackRef_FromPyObjectNew(_TyObject_CAST(obj), __FILE__, __LINE__)

static inline _PyStackRef
_PyStackRef_FromPyObjectSteal(TyObject *obj, const char *filename, int linenumber)
{
    return _Ty_stackref_create(obj, filename, linenumber);
}
#define PyStackRef_FromPyObjectSteal(obj) _PyStackRef_FromPyObjectSteal(_TyObject_CAST(obj), __FILE__, __LINE__)

static inline _PyStackRef
_PyStackRef_FromPyObjectImmortal(TyObject *obj, const char *filename, int linenumber)
{
    assert(_Ty_IsImmortal(obj));
    return _Ty_stackref_create(obj, filename, linenumber);
}
#define PyStackRef_FromPyObjectImmortal(obj) _PyStackRef_FromPyObjectImmortal(_TyObject_CAST(obj), __FILE__, __LINE__)

static inline bool
PyStackRef_IsTaggedInt(_PyStackRef ref)
{
    return (ref.index & 1) == 1;
}

static inline void
_PyStackRef_CLOSE(_PyStackRef ref, const char *filename, int linenumber)
{
    if (PyStackRef_IsTaggedInt(ref)) {
        return;
    }
    TyObject *obj = _Ty_stackref_close(ref, filename, linenumber);
    Ty_DECREF(obj);
}
#define PyStackRef_CLOSE(REF) _PyStackRef_CLOSE((REF), __FILE__, __LINE__)


static inline void
_PyStackRef_XCLOSE(_PyStackRef ref, const char *filename, int linenumber)
{
    if (PyStackRef_IsNull(ref)) {
        return;
    }
    _PyStackRef_CLOSE(ref, filename, linenumber);
}
#define PyStackRef_XCLOSE(REF) _PyStackRef_XCLOSE((REF), __FILE__, __LINE__)

static inline _PyStackRef
_PyStackRef_DUP(_PyStackRef ref, const char *filename, int linenumber)
{
    if (PyStackRef_IsTaggedInt(ref)) {
        return ref;
    }
    else {
        TyObject *obj = _Ty_stackref_get_object(ref);
        Ty_INCREF(obj);
        return _Ty_stackref_create(obj, filename, linenumber);
    }
}
#define PyStackRef_DUP(REF) _PyStackRef_DUP(REF, __FILE__, __LINE__)

extern void _PyStackRef_CLOSE_SPECIALIZED(_PyStackRef ref, destructor destruct, const char *filename, int linenumber);
#define PyStackRef_CLOSE_SPECIALIZED(REF, DESTRUCT) _PyStackRef_CLOSE_SPECIALIZED(REF, DESTRUCT, __FILE__, __LINE__)

static inline _PyStackRef
PyStackRef_MakeHeapSafe(_PyStackRef ref)
{
    return ref;
}

static inline _PyStackRef
PyStackRef_Borrow(_PyStackRef ref)
{
    return PyStackRef_DUP(ref);
}

#define PyStackRef_CLEAR(REF) \
    do { \
        _PyStackRef *_tmp_op_ptr = &(REF); \
        _PyStackRef _tmp_old_op = (*_tmp_op_ptr); \
        *_tmp_op_ptr = PyStackRef_NULL; \
        PyStackRef_XCLOSE(_tmp_old_op); \
    } while (0)

static inline _PyStackRef
_PyStackRef_FromPyObjectStealMortal(TyObject *obj, const char *filename, int linenumber)
{
    assert(!_Ty_IsImmortal(obj));
    return _Ty_stackref_create(obj, filename, linenumber);
}
#define PyStackRef_FromPyObjectStealMortal(obj) _PyStackRef_FromPyObjectStealMortal(_TyObject_CAST(obj), __FILE__, __LINE__)

static inline bool
PyStackRef_IsHeapSafe(_PyStackRef ref)
{
    return true;
}

static inline _PyStackRef
_PyStackRef_FromPyObjectNewMortal(TyObject *obj, const char *filename, int linenumber)
{
    assert(!_Ty_IsStaticImmortal(obj));
    Ty_INCREF(obj);
    return _Ty_stackref_create(obj, filename, linenumber);
}
#define PyStackRef_FromPyObjectNewMortal(obj) _PyStackRef_FromPyObjectNewMortal(_TyObject_CAST(obj), __FILE__, __LINE__)

#define PyStackRef_RefcountOnObject(REF) 1

extern int PyStackRef_Is(_PyStackRef a, _PyStackRef b);

extern bool PyStackRef_IsTaggedInt(_PyStackRef ref);

extern intptr_t PyStackRef_UntagInt(_PyStackRef ref);

extern _PyStackRef PyStackRef_TagInt(intptr_t i);

extern bool
PyStackRef_IsNullOrInt(_PyStackRef ref);

#else

#define Ty_INT_TAG 3
#define Ty_TAG_REFCNT 1

static inline bool
PyStackRef_IsTaggedInt(_PyStackRef i)
{
    return (i.bits & Ty_INT_TAG) == Ty_INT_TAG;
}

static inline _PyStackRef
PyStackRef_TagInt(intptr_t i)
{
    assert(Ty_ARITHMETIC_RIGHT_SHIFT(intptr_t, (i << 2), 2) == i);
    return (_PyStackRef){ .bits = ((((uintptr_t)i) << 2) | Ty_INT_TAG) };
}

static inline intptr_t
PyStackRef_UntagInt(_PyStackRef i)
{
    assert((i.bits & Ty_INT_TAG) == Ty_INT_TAG);
    intptr_t val = (intptr_t)i.bits;
    return Ty_ARITHMETIC_RIGHT_SHIFT(intptr_t, val, 2);
}


#ifdef Ty_GIL_DISABLED

#define Ty_TAG_DEFERRED Ty_TAG_REFCNT

#define Ty_TAG_PTR      ((uintptr_t)0)
#define Ty_TAG_BITS     ((uintptr_t)1)


static const _PyStackRef PyStackRef_NULL = { .bits = Ty_TAG_DEFERRED};
#define PyStackRef_IsNull(stackref) ((stackref).bits == PyStackRef_NULL.bits)
#define PyStackRef_True ((_PyStackRef){.bits = ((uintptr_t)&_Ty_TrueStruct) | Ty_TAG_DEFERRED })
#define PyStackRef_False ((_PyStackRef){.bits = ((uintptr_t)&_Ty_FalseStruct) | Ty_TAG_DEFERRED })
#define PyStackRef_None ((_PyStackRef){.bits = ((uintptr_t)&_Ty_NoneStruct) | Ty_TAG_DEFERRED })

// Checks that mask out the deferred bit in the free threading build.
#define PyStackRef_IsNone(ref) (PyStackRef_AsPyObjectBorrow(ref) == Ty_None)
#define PyStackRef_IsTrue(ref) (PyStackRef_AsPyObjectBorrow(ref) == Ty_True)
#define PyStackRef_IsFalse(ref) (PyStackRef_AsPyObjectBorrow(ref) == Ty_False)

#define PyStackRef_IsNullOrInt(stackref) (PyStackRef_IsNull(stackref) || PyStackRef_IsTaggedInt(stackref))

static inline TyObject *
PyStackRef_AsPyObjectBorrow(_PyStackRef stackref)
{
    TyObject *cleared = ((TyObject *)((stackref).bits & (~Ty_TAG_BITS)));
    return cleared;
}

#define PyStackRef_IsDeferred(ref) (((ref).bits & Ty_TAG_BITS) == Ty_TAG_DEFERRED)

static inline TyObject *
PyStackRef_NotDeferred_AsPyObject(_PyStackRef stackref)
{
    assert(!PyStackRef_IsDeferred(stackref));
    return (TyObject *)stackref.bits;
}

static inline TyObject *
PyStackRef_AsPyObjectSteal(_PyStackRef stackref)
{
    assert(!PyStackRef_IsNull(stackref));
    if (PyStackRef_IsDeferred(stackref)) {
        return Ty_NewRef(PyStackRef_AsPyObjectBorrow(stackref));
    }
    return PyStackRef_AsPyObjectBorrow(stackref);
}

static inline _PyStackRef
_PyStackRef_FromPyObjectSteal(TyObject *obj)
{
    assert(obj != NULL);
    // Make sure we don't take an already tagged value.
    assert(((uintptr_t)obj & Ty_TAG_BITS) == 0);
    return (_PyStackRef){ .bits = (uintptr_t)obj };
}
#   define PyStackRef_FromPyObjectSteal(obj) _PyStackRef_FromPyObjectSteal(_TyObject_CAST(obj))

static inline bool
PyStackRef_IsHeapSafe(_PyStackRef stackref)
{
    if (PyStackRef_IsDeferred(stackref)) {
        TyObject *obj = PyStackRef_AsPyObjectBorrow(stackref);
        return obj == NULL || _Ty_IsImmortal(obj) || _TyObject_HasDeferredRefcount(obj);
    }
    return true;
}

static inline _PyStackRef
PyStackRef_MakeHeapSafe(_PyStackRef stackref)
{
    if (PyStackRef_IsHeapSafe(stackref)) {
        return stackref;
    }
    TyObject *obj = PyStackRef_AsPyObjectBorrow(stackref);
    return (_PyStackRef){ .bits = (uintptr_t)(Ty_NewRef(obj)) | Ty_TAG_PTR };
}

static inline _PyStackRef
PyStackRef_FromPyObjectStealMortal(TyObject *obj)
{
    assert(obj != NULL);
    assert(!_Ty_IsImmortal(obj));
    // Make sure we don't take an already tagged value.
    assert(((uintptr_t)obj & Ty_TAG_BITS) == 0);
    return (_PyStackRef){ .bits = (uintptr_t)obj };
}

static inline _PyStackRef
PyStackRef_FromPyObjectNew(TyObject *obj)
{
    // Make sure we don't take an already tagged value.
    assert(((uintptr_t)obj & Ty_TAG_BITS) == 0);
    assert(obj != NULL);
    if (_TyObject_HasDeferredRefcount(obj)) {
        return (_PyStackRef){ .bits = (uintptr_t)obj | Ty_TAG_DEFERRED };
    }
    else {
        return (_PyStackRef){ .bits = (uintptr_t)(Ty_NewRef(obj)) | Ty_TAG_PTR };
    }
}
#define PyStackRef_FromPyObjectNew(obj) PyStackRef_FromPyObjectNew(_TyObject_CAST(obj))

static inline _PyStackRef
PyStackRef_FromPyObjectImmortal(TyObject *obj)
{
    // Make sure we don't take an already tagged value.
    assert(((uintptr_t)obj & Ty_TAG_BITS) == 0);
    assert(obj != NULL);
    assert(_Ty_IsImmortal(obj));
    return (_PyStackRef){ .bits = (uintptr_t)obj | Ty_TAG_DEFERRED };
}
#define PyStackRef_FromPyObjectImmortal(obj) PyStackRef_FromPyObjectImmortal(_TyObject_CAST(obj))

#define PyStackRef_CLOSE(REF)                                        \
        do {                                                            \
            _PyStackRef _close_tmp = (REF);                             \
            assert(!PyStackRef_IsNull(_close_tmp));                     \
            if (!PyStackRef_IsDeferred(_close_tmp)) {                   \
                Ty_DECREF(PyStackRef_AsPyObjectBorrow(_close_tmp));     \
            }                                                           \
        } while (0)

static inline void
PyStackRef_CLOSE_SPECIALIZED(_PyStackRef ref, destructor destruct)
{
    (void)destruct;
    PyStackRef_CLOSE(ref);
}

static inline _PyStackRef
PyStackRef_DUP(_PyStackRef stackref)
{
    assert(!PyStackRef_IsNull(stackref));
    if (PyStackRef_IsDeferred(stackref)) {
        return stackref;
    }
    Ty_INCREF(PyStackRef_AsPyObjectBorrow(stackref));
    return stackref;
}

static inline _PyStackRef
PyStackRef_Borrow(_PyStackRef stackref)
{
    return (_PyStackRef){ .bits = stackref.bits | Ty_TAG_DEFERRED };
}

// Convert a possibly deferred reference to a strong reference.
static inline _PyStackRef
PyStackRef_AsStrongReference(_PyStackRef stackref)
{
    return PyStackRef_FromPyObjectSteal(PyStackRef_AsPyObjectSteal(stackref));
}

#define PyStackRef_XCLOSE(stackref) \
    do {                            \
        _PyStackRef _tmp = (stackref); \
        if (!PyStackRef_IsNull(_tmp)) { \
            PyStackRef_CLOSE(_tmp); \
        } \
    } while (0);

#define PyStackRef_CLEAR(op) \
    do { \
        _PyStackRef *_tmp_op_ptr = &(op); \
        _PyStackRef _tmp_old_op = (*_tmp_op_ptr); \
        if (!PyStackRef_IsNull(_tmp_old_op)) { \
            *_tmp_op_ptr = PyStackRef_NULL; \
            PyStackRef_CLOSE(_tmp_old_op); \
        } \
    } while (0)

#define PyStackRef_FromPyObjectNewMortal PyStackRef_FromPyObjectNew

#else // Ty_GIL_DISABLED

// With GIL

/* References to immortal objects always have their tag bit set to Ty_TAG_REFCNT
 * as they can (must) have their reclamation deferred */

#define Ty_TAG_BITS 3
#if _Ty_IMMORTAL_FLAGS != Ty_TAG_REFCNT
#  error "_Ty_IMMORTAL_FLAGS != Ty_TAG_REFCNT"
#endif

#define BITS_TO_PTR(REF) ((TyObject *)((REF).bits))
#define BITS_TO_PTR_MASKED(REF) ((TyObject *)(((REF).bits) & (~Ty_TAG_REFCNT)))

#define PyStackRef_NULL_BITS Ty_TAG_REFCNT
static const _PyStackRef PyStackRef_NULL = { .bits = PyStackRef_NULL_BITS };

#define PyStackRef_IsNull(ref) ((ref).bits == PyStackRef_NULL_BITS)
#define PyStackRef_True ((_PyStackRef){.bits = ((uintptr_t)&_Ty_TrueStruct) | Ty_TAG_REFCNT })
#define PyStackRef_False ((_PyStackRef){.bits = ((uintptr_t)&_Ty_FalseStruct) | Ty_TAG_REFCNT })
#define PyStackRef_None ((_PyStackRef){.bits = ((uintptr_t)&_Ty_NoneStruct) | Ty_TAG_REFCNT })

#define PyStackRef_IsTrue(REF) ((REF).bits == (((uintptr_t)&_Ty_TrueStruct) | Ty_TAG_REFCNT))
#define PyStackRef_IsFalse(REF) ((REF).bits == (((uintptr_t)&_Ty_FalseStruct) | Ty_TAG_REFCNT))
#define PyStackRef_IsNone(REF) ((REF).bits == (((uintptr_t)&_Ty_NoneStruct) | Ty_TAG_REFCNT))

#ifdef Ty_DEBUG

static inline void PyStackRef_CheckValid(_PyStackRef ref) {
    assert(ref.bits != 0);
    int tag = ref.bits & Ty_TAG_BITS;
    TyObject *obj = BITS_TO_PTR_MASKED(ref);
    switch (tag) {
        case 0:
            /* Can be immortal if object was made immortal after reference came into existence */
            assert(!_Ty_IsStaticImmortal(obj));
            break;
        case Ty_TAG_REFCNT:
            break;
        default:
            assert(0);
    }
}

#else

#define PyStackRef_CheckValid(REF) ((void)0)

#endif

#ifdef _WIN32
#define PyStackRef_RefcountOnObject(REF) (((REF).bits & Ty_TAG_REFCNT) == 0)
#define PyStackRef_AsPyObjectBorrow BITS_TO_PTR_MASKED
#define PyStackRef_Borrow(REF) (_PyStackRef){ .bits = ((REF).bits) | Ty_TAG_REFCNT};
#else
/* Does this ref not have an embedded refcount and thus not refer to a declared immmortal object? */
static inline int
PyStackRef_RefcountOnObject(_PyStackRef ref)
{
    return (ref.bits & Ty_TAG_REFCNT) == 0;
}

static inline TyObject *
PyStackRef_AsPyObjectBorrow(_PyStackRef ref)
{
    assert(!PyStackRef_IsTaggedInt(ref));
    return BITS_TO_PTR_MASKED(ref);
}

static inline _PyStackRef
PyStackRef_Borrow(_PyStackRef ref)
{
    return (_PyStackRef){ .bits = ref.bits | Ty_TAG_REFCNT };
}
#endif

static inline TyObject *
PyStackRef_AsPyObjectSteal(_PyStackRef ref)
{
    if (PyStackRef_RefcountOnObject(ref)) {
        return BITS_TO_PTR(ref);
    }
    else {
        return Ty_NewRef(BITS_TO_PTR_MASKED(ref));
    }
}

static inline _PyStackRef
PyStackRef_FromPyObjectSteal(TyObject *obj)
{
    assert(obj != NULL);
#if SIZEOF_VOID_P > 4
    unsigned int tag = obj->ob_flags & Ty_TAG_REFCNT;
#else
    unsigned int tag = _Ty_IsImmortal(obj) ? Ty_TAG_REFCNT : 0;
#endif
    _PyStackRef ref = ((_PyStackRef){.bits = ((uintptr_t)(obj)) | tag});
    PyStackRef_CheckValid(ref);
    return ref;
}

static inline _PyStackRef
PyStackRef_FromPyObjectStealMortal(TyObject *obj)
{
    assert(obj != NULL);
    assert(!_Ty_IsImmortal(obj));
    _PyStackRef ref = ((_PyStackRef){.bits = ((uintptr_t)(obj)) });
    PyStackRef_CheckValid(ref);
    return ref;
}

static inline _PyStackRef
_PyStackRef_FromPyObjectNew(TyObject *obj)
{
    assert(obj != NULL);
    if (_Ty_IsImmortal(obj)) {
        return (_PyStackRef){ .bits = ((uintptr_t)obj) | Ty_TAG_REFCNT};
    }
    _Ty_INCREF_MORTAL(obj);
    _PyStackRef ref = (_PyStackRef){ .bits = (uintptr_t)obj };
    PyStackRef_CheckValid(ref);
    return ref;
}
#define PyStackRef_FromPyObjectNew(obj) _PyStackRef_FromPyObjectNew(_TyObject_CAST(obj))

static inline _PyStackRef
_PyStackRef_FromPyObjectNewMortal(TyObject *obj)
{
    assert(obj != NULL);
    _Ty_INCREF_MORTAL(obj);
    _PyStackRef ref = (_PyStackRef){ .bits = (uintptr_t)obj };
    PyStackRef_CheckValid(ref);
    return ref;
}
#define PyStackRef_FromPyObjectNewMortal(obj) _PyStackRef_FromPyObjectNewMortal(_TyObject_CAST(obj))

/* Create a new reference from an object with an embedded reference count */
static inline _PyStackRef
PyStackRef_FromPyObjectImmortal(TyObject *obj)
{
    assert(_Ty_IsImmortal(obj));
    return (_PyStackRef){ .bits = (uintptr_t)obj | Ty_TAG_REFCNT};
}

/* WARNING: This macro evaluates its argument more than once */
#ifdef _WIN32
#define PyStackRef_DUP(REF) \
    (PyStackRef_RefcountOnObject(REF) ? (_Ty_INCREF_MORTAL(BITS_TO_PTR(REF)), (REF)) : (REF))
#else
static inline _PyStackRef
PyStackRef_DUP(_PyStackRef ref)
{
    assert(!PyStackRef_IsNull(ref));
    if (PyStackRef_RefcountOnObject(ref)) {
        _Ty_INCREF_MORTAL(BITS_TO_PTR(ref));
    }
    return ref;
}
#endif

static inline bool
PyStackRef_IsHeapSafe(_PyStackRef ref)
{
    return (ref.bits & Ty_TAG_BITS) != Ty_TAG_REFCNT || ref.bits == PyStackRef_NULL_BITS ||  _Ty_IsImmortal(BITS_TO_PTR_MASKED(ref));
}

static inline _PyStackRef
PyStackRef_MakeHeapSafe(_PyStackRef ref)
{
    if (PyStackRef_IsHeapSafe(ref)) {
        return ref;
    }
    TyObject *obj = BITS_TO_PTR_MASKED(ref);
    Ty_INCREF(obj);
    ref.bits = (uintptr_t)obj;
    PyStackRef_CheckValid(ref);
    return ref;
}

#ifdef _WIN32
#define PyStackRef_CLOSE(REF) \
do { \
    _PyStackRef _temp = (REF); \
    if (PyStackRef_RefcountOnObject(_temp)) Ty_DECREF_MORTAL(BITS_TO_PTR(_temp)); \
} while (0)
#else
static inline void
PyStackRef_CLOSE(_PyStackRef ref)
{
    assert(!PyStackRef_IsNull(ref));
    if (PyStackRef_RefcountOnObject(ref)) {
        Ty_DECREF_MORTAL(BITS_TO_PTR(ref));
    }
}
#endif

static inline bool
PyStackRef_IsNullOrInt(_PyStackRef ref)
{
    return PyStackRef_IsNull(ref) || PyStackRef_IsTaggedInt(ref);
}

static inline void
PyStackRef_CLOSE_SPECIALIZED(_PyStackRef ref, destructor destruct)
{
    assert(!PyStackRef_IsNull(ref));
    if (PyStackRef_RefcountOnObject(ref)) {
        Ty_DECREF_MORTAL_SPECIALIZED(BITS_TO_PTR(ref), destruct);
    }
}

#ifdef _WIN32
#define PyStackRef_XCLOSE PyStackRef_CLOSE
#else
static inline void
PyStackRef_XCLOSE(_PyStackRef ref)
{
    assert(ref.bits != 0);
    if (PyStackRef_RefcountOnObject(ref)) {
        assert(!PyStackRef_IsNull(ref));
        Ty_DECREF_MORTAL(BITS_TO_PTR(ref));
    }
}
#endif

#define PyStackRef_CLEAR(REF) \
    do { \
        _PyStackRef *_tmp_op_ptr = &(REF); \
        _PyStackRef _tmp_old_op = (*_tmp_op_ptr); \
        *_tmp_op_ptr = PyStackRef_NULL; \
        PyStackRef_XCLOSE(_tmp_old_op); \
    } while (0)


#endif // Ty_GIL_DISABLED

// Note: this is a macro because MSVC (Windows) has trouble inlining it.

#define PyStackRef_Is(a, b) (((a).bits & (~Ty_TAG_REFCNT)) == ((b).bits & (~Ty_TAG_REFCNT)))


#endif // !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)

#define PyStackRef_TYPE(stackref) Ty_TYPE(PyStackRef_AsPyObjectBorrow(stackref))

// Converts a PyStackRef back to a TyObject *, converting the
// stackref to a new reference.
#define PyStackRef_AsPyObjectNew(stackref) Ty_NewRef(PyStackRef_AsPyObjectBorrow(stackref))

// StackRef type checks

static inline bool
PyStackRef_GenCheck(_PyStackRef stackref)
{
    return TyGen_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline bool
PyStackRef_BoolCheck(_PyStackRef stackref)
{
    return TyBool_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline bool
PyStackRef_LongCheck(_PyStackRef stackref)
{
    return TyLong_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline bool
PyStackRef_ExceptionInstanceCheck(_PyStackRef stackref)
{
    return PyExceptionInstance_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline bool
PyStackRef_CodeCheck(_PyStackRef stackref)
{
    return TyCode_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline bool
PyStackRef_FunctionCheck(_PyStackRef stackref)
{
    return TyFunction_Check(PyStackRef_AsPyObjectBorrow(stackref));
}

static inline void
_TyThreadState_PushCStackRef(TyThreadState *tstate, _PyCStackRef *ref)
{
#ifdef Ty_GIL_DISABLED
    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    ref->next = tstate_impl->c_stack_refs;
    tstate_impl->c_stack_refs = ref;
#endif
    ref->ref = PyStackRef_NULL;
}

static inline void
_TyThreadState_PopCStackRef(TyThreadState *tstate, _PyCStackRef *ref)
{
#ifdef Ty_GIL_DISABLED
    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    assert(tstate_impl->c_stack_refs == ref);
    tstate_impl->c_stack_refs = ref->next;
#endif
    PyStackRef_XCLOSE(ref->ref);
}

#ifdef Ty_GIL_DISABLED

static inline int
_Ty_TryIncrefCompareStackRef(TyObject **src, TyObject *op, _PyStackRef *out)
{
    if (_TyObject_HasDeferredRefcount(op)) {
        *out = (_PyStackRef){ .bits = (uintptr_t)op | Ty_TAG_DEFERRED };
        return 1;
    }
    if (_Ty_TryIncrefCompare(src, op)) {
        *out = PyStackRef_FromPyObjectSteal(op);
        return 1;
    }
    return 0;
}

static inline int
_Ty_TryXGetStackRef(TyObject **src, _PyStackRef *out)
{
    TyObject *op = _TyObject_CAST(_Ty_atomic_load_ptr_relaxed(src));
    if (op == NULL) {
        *out = PyStackRef_NULL;
        return 1;
    }
    return _Ty_TryIncrefCompareStackRef(src, op, out);
}

#endif

// Like Ty_VISIT but for _PyStackRef fields
#define _Ty_VISIT_STACKREF(ref)                                         \
    do {                                                                \
        if (!PyStackRef_IsNullOrInt(ref)) {                             \
            int vret = _TyGC_VisitStackRef(&(ref), visit, arg);         \
            if (vret)                                                   \
                return vret;                                            \
        }                                                               \
    } while (0)

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_STACKREF_H */
