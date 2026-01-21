
/* Generic object operations; and implementation of None */

#include "Python.h"
#include "pycore_brc.h"           // _Ty_brc_queue_object()
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCallTstate()
#include "pycore_context.h"       // _PyContextTokenMissing_Type
#include "pycore_critical_section.h" // Ty_BEGIN_CRITICAL_SECTION
#include "pycore_descrobject.h"   // _PyMethodWrapper_Type
#include "pycore_dict.h"          // _TyObject_MaterializeManagedDict()
#include "pycore_floatobject.h"   // _TyFloat_DebugMallocStats()
#include "pycore_freelist.h"      // _TyObject_ClearFreeLists()
#include "pycore_genobject.h"     // _PyAsyncGenAThrow_Type
#include "pycore_hamt.h"          // _PyHamtItems_Type
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_instruction_sequence.h" // _PyInstructionSequence_Type
#include "pycore_interpframe.h"   // _TyFrame_Stackbase()
#include "pycore_interpolation.h" // _PyInterpolation_Type
#include "pycore_list.h"          // _TyList_DebugMallocStats()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_memoryobject.h"  // _PyManagedBuffer_Type
#include "pycore_namespace.h"     // _PyNamespace_Type
#include "pycore_object.h"        // export _Ty_SwappedOp
#include "pycore_optimizer.h"     // _PyUOpExecutor_Type
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_pymem.h"         // _TyMem_IsPtrFreed()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_symtable.h"      // PySTEntry_Type
#include "pycore_template.h"      // _PyTemplate_Type _PyTemplateIter_Type
#include "pycore_tuple.h"         // _TyTuple_DebugMallocStats()
#include "pycore_typeobject.h"    // _PyBufferWrapper_Type
#include "pycore_typevarobject.h" // _PyTypeAlias_Type
#include "pycore_unionobject.h"   // _PyUnion_Type


#ifdef Ty_LIMITED_API
   // Prevent recursive call _Ty_IncRef() <=> Ty_INCREF()
#  error "Ty_LIMITED_API macro must not be defined"
#endif

/* Defined in tracemalloc.c */
extern void _TyMem_DumpTraceback(int fd, const void *ptr);


int
_TyObject_CheckConsistency(TyObject *op, int check_content)
{
#define CHECK(expr) \
    do { if (!(expr)) { _TyObject_ASSERT_FAILED_MSG(op, Ty_STRINGIFY(expr)); } } while (0)

    CHECK(!_TyObject_IsFreed(op));
    CHECK(Ty_REFCNT(op) >= 1);

    _TyType_CheckConsistency(Ty_TYPE(op));

    if (TyUnicode_Check(op)) {
        _TyUnicode_CheckConsistency(op, check_content);
    }
    else if (TyDict_Check(op)) {
        _TyDict_CheckConsistency(op, check_content);
    }
    return 1;

#undef CHECK
}


#ifdef Ty_REF_DEBUG
/* We keep the legacy symbol around for backward compatibility. */
Ty_ssize_t _Ty_RefTotal;

static inline Ty_ssize_t
get_legacy_reftotal(void)
{
    return _Ty_RefTotal;
}
#endif

#ifdef Ty_REF_DEBUG

#  define REFTOTAL(interp) \
    interp->object_state.reftotal

static inline void
reftotal_add(TyThreadState *tstate, Ty_ssize_t n)
{
#ifdef Ty_GIL_DISABLED
    _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)tstate;
    // relaxed store to avoid data race with read in get_reftotal()
    Ty_ssize_t reftotal = tstate_impl->reftotal + n;
    _Ty_atomic_store_ssize_relaxed(&tstate_impl->reftotal, reftotal);
#else
    REFTOTAL(tstate->interp) += n;
#endif
}

static inline Ty_ssize_t get_global_reftotal(_PyRuntimeState *);

/* We preserve the number of refs leaked during runtime finalization,
   so they can be reported if the runtime is initialized again. */
// XXX We don't lose any information by dropping this,
// so we should consider doing so.
static Ty_ssize_t last_final_reftotal = 0;

void
_Ty_FinalizeRefTotal(_PyRuntimeState *runtime)
{
    last_final_reftotal = get_global_reftotal(runtime);
    runtime->object_state.interpreter_leaks = 0;
}

void
_TyInterpreterState_FinalizeRefTotal(TyInterpreterState *interp)
{
    interp->runtime->object_state.interpreter_leaks += REFTOTAL(interp);
    REFTOTAL(interp) = 0;
}

static inline Ty_ssize_t
get_reftotal(TyInterpreterState *interp)
{
    /* For a single interpreter, we ignore the legacy _Ty_RefTotal,
       since we can't determine which interpreter updated it. */
    Ty_ssize_t total = REFTOTAL(interp);
#ifdef Ty_GIL_DISABLED
    _Ty_FOR_EACH_TSTATE_UNLOCKED(interp, p) {
        /* This may race with other threads modifications to their reftotal */
        _PyThreadStateImpl *tstate_impl = (_PyThreadStateImpl *)p;
        total += _Ty_atomic_load_ssize_relaxed(&tstate_impl->reftotal);
    }
#endif
    return total;
}

static inline Ty_ssize_t
get_global_reftotal(_PyRuntimeState *runtime)
{
    Ty_ssize_t total = 0;

    /* Add up the total from each interpreter. */
    HEAD_LOCK(&_PyRuntime);
    TyInterpreterState *interp = TyInterpreterState_Head();
    for (; interp != NULL; interp = TyInterpreterState_Next(interp)) {
        total += get_reftotal(interp);
    }
    HEAD_UNLOCK(&_PyRuntime);

    /* Add in the updated value from the legacy _Ty_RefTotal. */
    total += get_legacy_reftotal();
    total += last_final_reftotal;
    total += runtime->object_state.interpreter_leaks;

    return total;
}

#undef REFTOTAL

void
_PyDebug_PrintTotalRefs(void) {
    _PyRuntimeState *runtime = &_PyRuntime;
    fprintf(stderr,
            "[%zd refs, %zd blocks]\n",
            get_global_reftotal(runtime), _Ty_GetGlobalAllocatedBlocks());
    /* It may be helpful to also print the "legacy" reftotal separately.
       Likewise for the total for each interpreter. */
}
#endif /* Ty_REF_DEBUG */

/* Object allocation routines used by NEWOBJ and NEWVAROBJ macros.
   These are used by the individual routines for object creation.
   Do not call them otherwise, they do not initialize the object! */

#ifdef Ty_TRACE_REFS

#define REFCHAIN(interp) interp->object_state.refchain
#define REFCHAIN_VALUE ((void*)(uintptr_t)1)

static inline int
has_own_refchain(TyInterpreterState *interp)
{
    if (interp->feature_flags & Ty_RTFLAGS_USE_MAIN_OBMALLOC) {
        return (_Ty_IsMainInterpreter(interp)
            || _TyInterpreterState_Main() == NULL);
    }
    return 1;
}

static int
refchain_init(TyInterpreterState *interp)
{
    if (!has_own_refchain(interp)) {
        // Legacy subinterpreters share a refchain with the main interpreter.
        REFCHAIN(interp) = REFCHAIN(_TyInterpreterState_Main());
        return 0;
    }
    _Ty_hashtable_allocator_t alloc = {
        // Don't use default TyMem_Malloc() and TyMem_Free() which
        // require the caller to hold the GIL.
        .malloc = TyMem_RawMalloc,
        .free = TyMem_RawFree,
    };
    REFCHAIN(interp) = _Ty_hashtable_new_full(
        _Ty_hashtable_hash_ptr, _Ty_hashtable_compare_direct,
        NULL, NULL, &alloc);
    if (REFCHAIN(interp) == NULL) {
        return -1;
    }
    return 0;
}

static void
refchain_fini(TyInterpreterState *interp)
{
    if (has_own_refchain(interp) && REFCHAIN(interp) != NULL) {
        _Ty_hashtable_destroy(REFCHAIN(interp));
    }
    REFCHAIN(interp) = NULL;
}

bool
_PyRefchain_IsTraced(TyInterpreterState *interp, TyObject *obj)
{
    return (_Ty_hashtable_get(REFCHAIN(interp), obj) == REFCHAIN_VALUE);
}


static void
_PyRefchain_Trace(TyInterpreterState *interp, TyObject *obj)
{
    if (_Ty_hashtable_set(REFCHAIN(interp), obj, REFCHAIN_VALUE) < 0) {
        // Use a fatal error because _Ty_NewReference() cannot report
        // the error to the caller.
        Ty_FatalError("_Ty_hashtable_set() memory allocation failed");
    }
}


static void
_PyRefchain_Remove(TyInterpreterState *interp, TyObject *obj)
{
    void *value = _Ty_hashtable_steal(REFCHAIN(interp), obj);
#ifndef NDEBUG
    assert(value == REFCHAIN_VALUE);
#else
    (void)value;
#endif
}


/* Add an object to the refchain hash table.
 *
 * Note that objects are normally added to the list by PyObject_Init()
 * indirectly.  Not all objects are initialized that way, though; exceptions
 * include statically allocated type objects, and statically allocated
 * singletons (like Ty_True and Ty_None). */
void
_Ty_AddToAllObjects(TyObject *op)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (!_PyRefchain_IsTraced(interp, op)) {
        _PyRefchain_Trace(interp, op);
    }
}
#endif  /* Ty_TRACE_REFS */

#ifdef Ty_REF_DEBUG
/* Log a fatal error; doesn't return. */
void
_Ty_NegativeRefcount(const char *filename, int lineno, TyObject *op)
{
    _TyObject_AssertFailed(op, NULL, "object has negative ref count",
                           filename, lineno, __func__);
}

/* This is used strictly by Ty_INCREF(). */
void
_Ty_INCREF_IncRefTotal(void)
{
    reftotal_add(_TyThreadState_GET(), 1);
}

/* This is used strictly by Ty_DECREF(). */
void
_Ty_DECREF_DecRefTotal(void)
{
    reftotal_add(_TyThreadState_GET(), -1);
}

void
_Ty_IncRefTotal(TyThreadState *tstate)
{
    reftotal_add(tstate, 1);
}

void
_Ty_DecRefTotal(TyThreadState *tstate)
{
    reftotal_add(tstate, -1);
}

void
_Ty_AddRefTotal(TyThreadState *tstate, Ty_ssize_t n)
{
    reftotal_add(tstate, n);
}

/* This includes the legacy total
   and any carried over from the last runtime init/fini cycle. */
Ty_ssize_t
_Ty_GetGlobalRefTotal(void)
{
    return get_global_reftotal(&_PyRuntime);
}

Ty_ssize_t
_Ty_GetLegacyRefTotal(void)
{
    return get_legacy_reftotal();
}

Ty_ssize_t
_TyInterpreterState_GetRefTotal(TyInterpreterState *interp)
{
    HEAD_LOCK(&_PyRuntime);
    Ty_ssize_t total = get_reftotal(interp);
    HEAD_UNLOCK(&_PyRuntime);
    return total;
}

#endif /* Ty_REF_DEBUG */

void
Ty_IncRef(TyObject *o)
{
    Ty_XINCREF(o);
}

void
Ty_DecRef(TyObject *o)
{
    Ty_XDECREF(o);
}

void
_Ty_IncRef(TyObject *o)
{
    Ty_INCREF(o);
}

void
_Ty_DecRef(TyObject *o)
{
    Ty_DECREF(o);
}

#ifdef Ty_GIL_DISABLED
# ifdef Ty_REF_DEBUG
static int
is_dead(TyObject *o)
{
#  if SIZEOF_SIZE_T == 8
    return (uintptr_t)o->ob_type == 0xDDDDDDDDDDDDDDDD;
#  else
    return (uintptr_t)o->ob_type == 0xDDDDDDDD;
#  endif
}
# endif

// Decrement the shared reference count of an object. Return 1 if the object
// is dead and should be deallocated, 0 otherwise.
static int
_Ty_DecRefSharedIsDead(TyObject *o, const char *filename, int lineno)
{
    // Should we queue the object for the owning thread to merge?
    int should_queue;

    Ty_ssize_t new_shared;
    Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&o->ob_ref_shared);
    do {
        should_queue = (shared == 0 || shared == _Ty_REF_MAYBE_WEAKREF);

        if (should_queue) {
            // If the object had refcount zero, not queued, and not merged,
            // then we enqueue the object to be merged by the owning thread.
            // In this case, we don't subtract one from the reference count
            // because the queue holds a reference.
            new_shared = _Ty_REF_QUEUED;
        }
        else {
            // Otherwise, subtract one from the reference count. This might
            // be negative!
            new_shared = shared - (1 << _Ty_REF_SHARED_SHIFT);
        }

#ifdef Ty_REF_DEBUG
        if ((new_shared < 0 && _Ty_REF_IS_MERGED(new_shared)) ||
            (should_queue && is_dead(o)))
        {
            _Ty_NegativeRefcount(filename, lineno, o);
        }
#endif
    } while (!_Ty_atomic_compare_exchange_ssize(&o->ob_ref_shared,
                                                &shared, new_shared));

    if (should_queue) {
#ifdef Ty_REF_DEBUG
        _Ty_IncRefTotal(_TyThreadState_GET());
#endif
        _Ty_brc_queue_object(o);
    }
    else if (new_shared == _Ty_REF_MERGED) {
        // refcount is zero AND merged
        return 1;
    }
    return 0;
}

void
_Ty_DecRefSharedDebug(TyObject *o, const char *filename, int lineno)
{
    if (_Ty_DecRefSharedIsDead(o, filename, lineno)) {
        _Ty_Dealloc(o);
    }
}

void
_Ty_DecRefShared(TyObject *o)
{
    _Ty_DecRefSharedDebug(o, NULL, 0);
}

void
_Ty_MergeZeroLocalRefcount(TyObject *op)
{
    assert(op->ob_ref_local == 0);

    Ty_ssize_t shared = _Ty_atomic_load_ssize_acquire(&op->ob_ref_shared);
    if (shared == 0) {
        // Fast-path: shared refcount is zero (including flags)
        _Ty_Dealloc(op);
        return;
    }

    // gh-121794: This must be before the store to `ob_ref_shared` (gh-119999),
    // but should outside the fast-path to maintain the invariant that
    // a zero `ob_tid` implies a merged refcount.
    _Ty_atomic_store_uintptr_relaxed(&op->ob_tid, 0);

    // Slow-path: atomically set the flags (low two bits) to _Ty_REF_MERGED.
    Ty_ssize_t new_shared;
    do {
        new_shared = (shared & ~_Ty_REF_SHARED_FLAG_MASK) | _Ty_REF_MERGED;
    } while (!_Ty_atomic_compare_exchange_ssize(&op->ob_ref_shared,
                                                &shared, new_shared));

    if (new_shared == _Ty_REF_MERGED) {
        // i.e., the shared refcount is zero (only the flags are set) so we
        // deallocate the object.
        _Ty_Dealloc(op);
    }
}

Ty_ssize_t
_Ty_ExplicitMergeRefcount(TyObject *op, Ty_ssize_t extra)
{
    assert(!_Ty_IsImmortal(op));

#ifdef Ty_REF_DEBUG
    _Ty_AddRefTotal(_TyThreadState_GET(), extra);
#endif

    // gh-119999: Write to ob_ref_local and ob_tid before merging the refcount.
    Ty_ssize_t local = (Ty_ssize_t)op->ob_ref_local;
    _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, 0);
    _Ty_atomic_store_uintptr_relaxed(&op->ob_tid, 0);

    Ty_ssize_t refcnt;
    Ty_ssize_t new_shared;
    Ty_ssize_t shared = _Ty_atomic_load_ssize_relaxed(&op->ob_ref_shared);
    do {
        refcnt = Ty_ARITHMETIC_RIGHT_SHIFT(Ty_ssize_t, shared, _Ty_REF_SHARED_SHIFT);
        refcnt += local;
        refcnt += extra;

        new_shared = _Ty_REF_SHARED(refcnt, _Ty_REF_MERGED);
    } while (!_Ty_atomic_compare_exchange_ssize(&op->ob_ref_shared,
                                                &shared, new_shared));
    return refcnt;
}

// The more complicated "slow" path for undoing the resurrection of an object.
int
_TyObject_ResurrectEndSlow(TyObject *op)
{
    if (_Ty_IsImmortal(op)) {
        return 1;
    }
    if (_Ty_IsOwnedByCurrentThread(op)) {
        // If the object is owned by the current thread, give up ownership and
        // merge the refcount. This isn't necessary in all cases, but it
        // simplifies the implementation.
        Ty_ssize_t refcount = _Ty_ExplicitMergeRefcount(op, -1);
        if (refcount == 0) {
#ifdef Ty_TRACE_REFS
            _Ty_ForgetReference(op);
#endif
            return 0;
        }
        return 1;
    }
    int is_dead = _Ty_DecRefSharedIsDead(op, NULL, 0);
    if (is_dead) {
#ifdef Ty_TRACE_REFS
        _Ty_ForgetReference(op);
#endif
        return 0;
    }
    return 1;
}


#endif  /* Ty_GIL_DISABLED */


/**************************************/

TyObject *
PyObject_Init(TyObject *op, TyTypeObject *tp)
{
    if (op == NULL) {
        return TyErr_NoMemory();
    }

    _TyObject_Init(op, tp);
    return op;
}

TyVarObject *
PyObject_InitVar(TyVarObject *op, TyTypeObject *tp, Ty_ssize_t size)
{
    if (op == NULL) {
        return (TyVarObject *) TyErr_NoMemory();
    }

    _TyObject_InitVar(op, tp, size);
    return op;
}

TyObject *
_TyObject_New(TyTypeObject *tp)
{
    TyObject *op = (TyObject *) PyObject_Malloc(_TyObject_SIZE(tp));
    if (op == NULL) {
        return TyErr_NoMemory();
    }
    _TyObject_Init(op, tp);
    return op;
}

TyVarObject *
_TyObject_NewVar(TyTypeObject *tp, Ty_ssize_t nitems)
{
    TyVarObject *op;
    const size_t size = _TyObject_VAR_SIZE(tp, nitems);
    op = (TyVarObject *) PyObject_Malloc(size);
    if (op == NULL) {
        return (TyVarObject *)TyErr_NoMemory();
    }
    _TyObject_InitVar(op, tp, nitems);
    return op;
}

void
PyObject_CallFinalizer(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);

    if (tp->tp_finalize == NULL)
        return;
    /* tp_finalize should only be called once. */
    if (_TyType_IS_GC(tp) && _TyGC_FINALIZED(self))
        return;

    tp->tp_finalize(self);
    if (_TyType_IS_GC(tp)) {
        _TyGC_SET_FINALIZED(self);
    }
}

int
PyObject_CallFinalizerFromDealloc(TyObject *self)
{
    if (Ty_REFCNT(self) != 0) {
        _TyObject_ASSERT_FAILED_MSG(self,
                                    "PyObject_CallFinalizerFromDealloc called "
                                    "on object with a non-zero refcount");
    }

    /* Temporarily resurrect the object. */
    _TyObject_ResurrectStart(self);

    PyObject_CallFinalizer(self);

    _TyObject_ASSERT_WITH_MSG(self,
                              Ty_REFCNT(self) > 0,
                              "refcount is too small");

    _TyObject_ASSERT(self,
                    (!_TyType_IS_GC(Ty_TYPE(self))
                    || _TyObject_GC_IS_TRACKED(self)));

    /* Undo the temporary resurrection; can't use DECREF here, it would
     * cause a recursive call. */
    if (_TyObject_ResurrectEnd(self)) {
        /* tp_finalize resurrected it!
           gh-130202: Note that the object may still be dead in the free
           threaded build in some circumstances, so it's not safe to access
           `self` after this point. For example, the last reference to the
           resurrected `self` may be held by another thread, which can
           concurrently deallocate it. */
        return -1;
    }

    /* this is the normal path out, the caller continues with deallocation. */
    return 0;
}

int
PyObject_Print(TyObject *op, FILE *fp, int flags)
{
    int ret = 0;
    int write_error = 0;
    if (TyErr_CheckSignals())
        return -1;
    if (_Ty_EnterRecursiveCall(" printing an object")) {
        return -1;
    }
    clearerr(fp); /* Clear any previous error condition */
    if (op == NULL) {
        Ty_BEGIN_ALLOW_THREADS
        fprintf(fp, "<nil>");
        Ty_END_ALLOW_THREADS
    }
    else {
        if (Ty_REFCNT(op) <= 0) {
            Ty_BEGIN_ALLOW_THREADS
            fprintf(fp, "<refcnt %zd at %p>", Ty_REFCNT(op), (void *)op);
            Ty_END_ALLOW_THREADS
        }
        else {
            TyObject *s;
            if (flags & Ty_PRINT_RAW)
                s = PyObject_Str(op);
            else
                s = PyObject_Repr(op);
            if (s == NULL) {
                ret = -1;
            }
            else {
                assert(TyUnicode_Check(s));
                const char *t;
                Ty_ssize_t len;
                t = TyUnicode_AsUTF8AndSize(s, &len);
                if (t == NULL) {
                    ret = -1;
                }
                else {
                    /* Versions of Android and OpenBSD from before 2023 fail to
                       set the `ferror` indicator when writing to a read-only
                       stream, so we need to check the return value.
                       (https://github.com/openbsd/src/commit/fc99cf9338942ecd9adc94ea08bf6188f0428c15) */
                    if (fwrite(t, 1, len, fp) != (size_t)len) {
                        write_error = 1;
                    }
                }
                Ty_DECREF(s);
            }
        }
    }
    if (ret == 0) {
        if (write_error || ferror(fp)) {
            TyErr_SetFromErrno(TyExc_OSError);
            clearerr(fp);
            ret = -1;
        }
    }
    return ret;
}

/* For debugging convenience.  Set a breakpoint here and call it from your DLL */
void
_Ty_BreakPoint(void)
{
}


/* Heuristic checking if the object memory is uninitialized or deallocated.
   Rely on the debug hooks on Python memory allocators:
   see _TyMem_IsPtrFreed().

   The function can be used to prevent segmentation fault on dereferencing
   pointers like 0xDDDDDDDDDDDDDDDD. */
int
_TyObject_IsFreed(TyObject *op)
{
    if (_TyMem_IsPtrFreed(op) || _TyMem_IsPtrFreed(Ty_TYPE(op))) {
        return 1;
    }
    return 0;
}


/* For debugging convenience.  See Misc/gdbinit for some useful gdb hooks */
void
_TyObject_Dump(TyObject* op)
{
    if (_TyObject_IsFreed(op)) {
        /* It seems like the object memory has been freed:
           don't access it to prevent a segmentation fault. */
        fprintf(stderr, "<object at %p is freed>\n", op);
        fflush(stderr);
        return;
    }

    /* first, write fields which are the least likely to crash */
    fprintf(stderr, "object address  : %p\n", (void *)op);
    fprintf(stderr, "object refcount : %zd\n", Ty_REFCNT(op));
    fflush(stderr);

    TyTypeObject *type = Ty_TYPE(op);
    fprintf(stderr, "object type     : %p\n", type);
    fprintf(stderr, "object type name: %s\n",
            type==NULL ? "NULL" : type->tp_name);

    /* the most dangerous part */
    fprintf(stderr, "object repr     : ");
    fflush(stderr);

    TyGILState_STATE gil = TyGILState_Ensure();
    TyObject *exc = TyErr_GetRaisedException();

    (void)PyObject_Print(op, stderr, 0);
    fflush(stderr);

    TyErr_SetRaisedException(exc);
    TyGILState_Release(gil);

    fprintf(stderr, "\n");
    fflush(stderr);
}

TyObject *
PyObject_Repr(TyObject *v)
{
    TyObject *res;
    if (TyErr_CheckSignals())
        return NULL;
    if (v == NULL)
        return TyUnicode_FromString("<NULL>");
    if (Ty_TYPE(v)->tp_repr == NULL)
        return TyUnicode_FromFormat("<%s object at %p>",
                                    Ty_TYPE(v)->tp_name, v);

    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    /* PyObject_Repr() must not be called with an exception set,
       because it can clear it (directly or indirectly) and so the
       caller loses its exception */
    assert(!_TyErr_Occurred(tstate));
#endif

    /* It is possible for a type to have a tp_repr representation that loops
       infinitely. */
    if (_Ty_EnterRecursiveCallTstate(tstate,
                                     " while getting the repr of an object")) {
        return NULL;
    }
    res = (*Ty_TYPE(v)->tp_repr)(v);
    _Ty_LeaveRecursiveCallTstate(tstate);

    if (res == NULL) {
        return NULL;
    }
    if (!TyUnicode_Check(res)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "__repr__ returned non-string (type %.200s)",
                      Ty_TYPE(res)->tp_name);
        Ty_DECREF(res);
        return NULL;
    }
    return res;
}

TyObject *
PyObject_Str(TyObject *v)
{
    TyObject *res;
    if (TyErr_CheckSignals())
        return NULL;
    if (v == NULL)
        return TyUnicode_FromString("<NULL>");
    if (TyUnicode_CheckExact(v)) {
        return Ty_NewRef(v);
    }
    if (Ty_TYPE(v)->tp_str == NULL)
        return PyObject_Repr(v);

    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    /* PyObject_Str() must not be called with an exception set,
       because it can clear it (directly or indirectly) and so the
       caller loses its exception */
    assert(!_TyErr_Occurred(tstate));
#endif

    /* It is possible for a type to have a tp_str representation that loops
       infinitely. */
    if (_Ty_EnterRecursiveCallTstate(tstate, " while getting the str of an object")) {
        return NULL;
    }
    res = (*Ty_TYPE(v)->tp_str)(v);
    _Ty_LeaveRecursiveCallTstate(tstate);

    if (res == NULL) {
        return NULL;
    }
    if (!TyUnicode_Check(res)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "__str__ returned non-string (type %.200s)",
                      Ty_TYPE(res)->tp_name);
        Ty_DECREF(res);
        return NULL;
    }
    assert(_TyUnicode_CheckConsistency(res, 1));
    return res;
}

TyObject *
PyObject_ASCII(TyObject *v)
{
    TyObject *repr, *ascii, *res;

    repr = PyObject_Repr(v);
    if (repr == NULL)
        return NULL;

    if (TyUnicode_IS_ASCII(repr))
        return repr;

    /* repr is guaranteed to be a PyUnicode object by PyObject_Repr */
    ascii = _TyUnicode_AsASCIIString(repr, "backslashreplace");
    Ty_DECREF(repr);
    if (ascii == NULL)
        return NULL;

    res = TyUnicode_DecodeASCII(
        TyBytes_AS_STRING(ascii),
        TyBytes_GET_SIZE(ascii),
        NULL);

    Ty_DECREF(ascii);
    return res;
}

TyObject *
PyObject_Bytes(TyObject *v)
{
    TyObject *result, *func;

    if (v == NULL)
        return TyBytes_FromString("<NULL>");

    if (TyBytes_CheckExact(v)) {
        return Ty_NewRef(v);
    }

    func = _TyObject_LookupSpecial(v, &_Ty_ID(__bytes__));
    if (func != NULL) {
        result = _TyObject_CallNoArgs(func);
        Ty_DECREF(func);
        if (result == NULL)
            return NULL;
        if (!TyBytes_Check(result)) {
            TyErr_Format(TyExc_TypeError,
                         "__bytes__ returned non-bytes (type %.200s)",
                         Ty_TYPE(result)->tp_name);
            Ty_DECREF(result);
            return NULL;
        }
        return result;
    }
    else if (TyErr_Occurred())
        return NULL;
    return TyBytes_FromObject(v);
}

static void
clear_freelist(struct _Ty_freelist *freelist, int is_finalization,
               freefunc dofree)
{
    void *ptr;
    while ((ptr = _PyFreeList_PopNoStats(freelist)) != NULL) {
        dofree(ptr);
    }
    assert(freelist->size == 0 || freelist->size == -1);
    assert(freelist->freelist == NULL);
    if (is_finalization) {
        freelist->size = -1;
    }
}

static void
free_object(void *obj)
{
    TyObject *op = (TyObject *)obj;
    TyTypeObject *tp = Ty_TYPE(op);
    tp->tp_free(op);
    Ty_DECREF(tp);
}

void
_TyObject_ClearFreeLists(struct _Ty_freelists *freelists, int is_finalization)
{
    // In the free-threaded build, freelists are per-TyThreadState and cleared in TyThreadState_Clear()
    // In the default build, freelists are per-interpreter and cleared in finalize_interp_types()
    clear_freelist(&freelists->floats, is_finalization, free_object);
    for (Ty_ssize_t i = 0; i < TyTuple_MAXSAVESIZE; i++) {
        clear_freelist(&freelists->tuples[i], is_finalization, free_object);
    }
    clear_freelist(&freelists->lists, is_finalization, free_object);
    clear_freelist(&freelists->list_iters, is_finalization, free_object);
    clear_freelist(&freelists->tuple_iters, is_finalization, free_object);
    clear_freelist(&freelists->dicts, is_finalization, free_object);
    clear_freelist(&freelists->dictkeys, is_finalization, TyMem_Free);
    clear_freelist(&freelists->slices, is_finalization, free_object);
    clear_freelist(&freelists->ranges, is_finalization, free_object);
    clear_freelist(&freelists->range_iters, is_finalization, free_object);
    clear_freelist(&freelists->contexts, is_finalization, free_object);
    clear_freelist(&freelists->async_gens, is_finalization, free_object);
    clear_freelist(&freelists->async_gen_asends, is_finalization, free_object);
    clear_freelist(&freelists->futureiters, is_finalization, free_object);
    if (is_finalization) {
        // Only clear object stack chunks during finalization. We use object
        // stacks during GC, so emptying the free-list is counterproductive.
        clear_freelist(&freelists->object_stack_chunks, 1, TyMem_RawFree);
    }
    clear_freelist(&freelists->unicode_writers, is_finalization, TyMem_Free);
    clear_freelist(&freelists->ints, is_finalization, free_object);
    clear_freelist(&freelists->pycfunctionobject, is_finalization, PyObject_GC_Del);
    clear_freelist(&freelists->pycmethodobject, is_finalization, PyObject_GC_Del);
    clear_freelist(&freelists->pymethodobjects, is_finalization, free_object);
}

/*
def _TyObject_FunctionStr(x):
    try:
        qualname = x.__qualname__
    except AttributeError:
        return str(x)
    try:
        mod = x.__module__
        if mod is not None and mod != 'builtins':
            return f"{x.__module__}.{qualname}()"
    except AttributeError:
        pass
    return qualname
*/
TyObject *
_TyObject_FunctionStr(TyObject *x)
{
    assert(!TyErr_Occurred());
    TyObject *qualname;
    int ret = PyObject_GetOptionalAttr(x, &_Ty_ID(__qualname__), &qualname);
    if (qualname == NULL) {
        if (ret < 0) {
            return NULL;
        }
        return PyObject_Str(x);
    }
    TyObject *module;
    TyObject *result = NULL;
    ret = PyObject_GetOptionalAttr(x, &_Ty_ID(__module__), &module);
    if (module != NULL && module != Ty_None) {
        ret = PyObject_RichCompareBool(module, &_Ty_ID(builtins), Py_NE);
        if (ret < 0) {
            // error
            goto done;
        }
        if (ret > 0) {
            result = TyUnicode_FromFormat("%S.%S()", module, qualname);
            goto done;
        }
    }
    else if (ret < 0) {
        goto done;
    }
    result = TyUnicode_FromFormat("%S()", qualname);
done:
    Ty_DECREF(qualname);
    Ty_XDECREF(module);
    return result;
}

/* For Python 3.0.1 and later, the old three-way comparison has been
   completely removed in favour of rich comparisons.  PyObject_Compare() and
   PyObject_Cmp() are gone, and the builtin cmp function no longer exists.
   The old tp_compare slot has been renamed to tp_as_async, and should no
   longer be used.  Use tp_richcompare instead.

   See (*) below for practical amendments.

   tp_richcompare gets called with a first argument of the appropriate type
   and a second object of an arbitrary type.  We never do any kind of
   coercion.

   The tp_richcompare slot should return an object, as follows:

    NULL if an exception occurred
    NotImplemented if the requested comparison is not implemented
    any other false value if the requested comparison is false
    any other true value if the requested comparison is true

  The PyObject_RichCompare[Bool]() wrappers raise TypeError when they get
  NotImplemented.

  (*) Practical amendments:

  - If rich comparison returns NotImplemented, == and != are decided by
    comparing the object pointer (i.e. falling back to the base object
    implementation).

*/

/* Map rich comparison operators to their swapped version, e.g. LT <--> GT */
int _Ty_SwappedOp[] = {Py_GT, Py_GE, Py_EQ, Py_NE, Py_LT, Py_LE};

static const char * const opstrings[] = {"<", "<=", "==", "!=", ">", ">="};

/* Perform a rich comparison, raising TypeError when the requested comparison
   operator is not supported. */
static TyObject *
do_richcompare(TyThreadState *tstate, TyObject *v, TyObject *w, int op)
{
    richcmpfunc f;
    TyObject *res;
    int checked_reverse_op = 0;

    if (!Ty_IS_TYPE(v, Ty_TYPE(w)) &&
        TyType_IsSubtype(Ty_TYPE(w), Ty_TYPE(v)) &&
        (f = Ty_TYPE(w)->tp_richcompare) != NULL) {
        checked_reverse_op = 1;
        res = (*f)(w, v, _Ty_SwappedOp[op]);
        if (res != Ty_NotImplemented)
            return res;
        Ty_DECREF(res);
    }
    if ((f = Ty_TYPE(v)->tp_richcompare) != NULL) {
        res = (*f)(v, w, op);
        if (res != Ty_NotImplemented)
            return res;
        Ty_DECREF(res);
    }
    if (!checked_reverse_op && (f = Ty_TYPE(w)->tp_richcompare) != NULL) {
        res = (*f)(w, v, _Ty_SwappedOp[op]);
        if (res != Ty_NotImplemented)
            return res;
        Ty_DECREF(res);
    }
    /* If neither object implements it, provide a sensible default
       for == and !=, but raise an exception for ordering. */
    switch (op) {
    case Py_EQ:
        res = (v == w) ? Ty_True : Ty_False;
        break;
    case Py_NE:
        res = (v != w) ? Ty_True : Ty_False;
        break;
    default:
        _TyErr_Format(tstate, TyExc_TypeError,
                      "'%s' not supported between instances of '%.100s' and '%.100s'",
                      opstrings[op],
                      Ty_TYPE(v)->tp_name,
                      Ty_TYPE(w)->tp_name);
        return NULL;
    }
    return Ty_NewRef(res);
}

/* Perform a rich comparison with object result.  This wraps do_richcompare()
   with a check for NULL arguments and a recursion check. */

TyObject *
PyObject_RichCompare(TyObject *v, TyObject *w, int op)
{
    TyThreadState *tstate = _TyThreadState_GET();

    assert(Py_LT <= op && op <= Py_GE);
    if (v == NULL || w == NULL) {
        if (!_TyErr_Occurred(tstate)) {
            TyErr_BadInternalCall();
        }
        return NULL;
    }
    if (_Ty_EnterRecursiveCallTstate(tstate, " in comparison")) {
        return NULL;
    }
    TyObject *res = do_richcompare(tstate, v, w, op);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return res;
}

/* Perform a rich comparison with integer result.  This wraps
   PyObject_RichCompare(), returning -1 for error, 0 for false, 1 for true. */
int
PyObject_RichCompareBool(TyObject *v, TyObject *w, int op)
{
    TyObject *res;
    int ok;

    /* Quick result when objects are the same.
       Guarantees that identity implies equality. */
    if (v == w) {
        if (op == Py_EQ)
            return 1;
        else if (op == Py_NE)
            return 0;
    }

    res = PyObject_RichCompare(v, w, op);
    if (res == NULL)
        return -1;
    if (TyBool_Check(res))
        ok = (res == Ty_True);
    else
        ok = PyObject_IsTrue(res);
    Ty_DECREF(res);
    return ok;
}

Ty_hash_t
PyObject_HashNotImplemented(TyObject *v)
{
    TyErr_Format(TyExc_TypeError, "unhashable type: '%.200s'",
                 Ty_TYPE(v)->tp_name);
    return -1;
}

Ty_hash_t
PyObject_Hash(TyObject *v)
{
    TyTypeObject *tp = Ty_TYPE(v);
    if (tp->tp_hash != NULL)
        return (*tp->tp_hash)(v);
    /* To keep to the general practice that inheriting
     * solely from object in C code should work without
     * an explicit call to TyType_Ready, we implicitly call
     * TyType_Ready here and then check the tp_hash slot again
     */
    if (!_TyType_IsReady(tp)) {
        if (TyType_Ready(tp) < 0)
            return -1;
        if (tp->tp_hash != NULL)
            return (*tp->tp_hash)(v);
    }
    /* Otherwise, the object can't be hashed */
    return PyObject_HashNotImplemented(v);
}

TyObject *
PyObject_GetAttrString(TyObject *v, const char *name)
{
    TyObject *w, *res;

    if (Ty_TYPE(v)->tp_getattr != NULL)
        return (*Ty_TYPE(v)->tp_getattr)(v, (char*)name);
    w = TyUnicode_FromString(name);
    if (w == NULL)
        return NULL;
    res = PyObject_GetAttr(v, w);
    Ty_DECREF(w);
    return res;
}

int
PyObject_HasAttrStringWithError(TyObject *obj, const char *name)
{
    TyObject *res;
    int rc = PyObject_GetOptionalAttrString(obj, name, &res);
    Ty_XDECREF(res);
    return rc;
}


int
PyObject_HasAttrString(TyObject *obj, const char *name)
{
    int rc = PyObject_HasAttrStringWithError(obj, name);
    if (rc < 0) {
        TyErr_FormatUnraisable(
            "Exception ignored in PyObject_HasAttrString(); consider using "
            "PyObject_HasAttrStringWithError(), "
            "PyObject_GetOptionalAttrString() or PyObject_GetAttrString()");
        return 0;
    }
    return rc;
}

int
PyObject_SetAttrString(TyObject *v, const char *name, TyObject *w)
{
    TyObject *s;
    int res;

    if (Ty_TYPE(v)->tp_setattr != NULL)
        return (*Ty_TYPE(v)->tp_setattr)(v, (char*)name, w);
    s = TyUnicode_InternFromString(name);
    if (s == NULL)
        return -1;
    res = PyObject_SetAttr(v, s, w);
    Ty_XDECREF(s);
    return res;
}

int
PyObject_DelAttrString(TyObject *v, const char *name)
{
    return PyObject_SetAttrString(v, name, NULL);
}

int
_TyObject_IsAbstract(TyObject *obj)
{
    int res;
    TyObject* isabstract;

    if (obj == NULL)
        return 0;

    res = PyObject_GetOptionalAttr(obj, &_Ty_ID(__isabstractmethod__), &isabstract);
    if (res > 0) {
        res = PyObject_IsTrue(isabstract);
        Ty_DECREF(isabstract);
    }
    return res;
}

TyObject *
_TyObject_GetAttrId(TyObject *v, _Ty_Identifier *name)
{
    TyObject *result;
    TyObject *oname = _TyUnicode_FromId(name); /* borrowed */
    if (!oname)
        return NULL;
    result = PyObject_GetAttr(v, oname);
    return result;
}

int
_TyObject_SetAttributeErrorContext(TyObject* v, TyObject* name)
{
    assert(TyErr_Occurred());
    if (!TyErr_ExceptionMatches(TyExc_AttributeError)){
        return 0;
    }
    // Intercept AttributeError exceptions and augment them to offer suggestions later.
    TyObject *exc = TyErr_GetRaisedException();
    if (!TyErr_GivenExceptionMatches(exc, TyExc_AttributeError)) {
        goto restore;
    }
    TyAttributeErrorObject* the_exc = (TyAttributeErrorObject*) exc;
    // Check if this exception was already augmented
    if (the_exc->name || the_exc->obj) {
        goto restore;
    }
    // Augment the exception with the name and object
    if (PyObject_SetAttr(exc, &_Ty_ID(name), name) ||
        PyObject_SetAttr(exc, &_Ty_ID(obj), v)) {
        return 1;
    }
restore:
    TyErr_SetRaisedException(exc);
    return 0;
}

TyObject *
PyObject_GetAttr(TyObject *v, TyObject *name)
{
    TyTypeObject *tp = Ty_TYPE(v);
    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return NULL;
    }

    TyObject* result = NULL;
    if (tp->tp_getattro != NULL) {
        result = (*tp->tp_getattro)(v, name);
    }
    else if (tp->tp_getattr != NULL) {
        const char *name_str = TyUnicode_AsUTF8(name);
        if (name_str == NULL) {
            return NULL;
        }
        result = (*tp->tp_getattr)(v, (char *)name_str);
    }
    else {
        TyErr_Format(TyExc_AttributeError,
                    "'%.100s' object has no attribute '%U'",
                    tp->tp_name, name);
    }

    if (result == NULL) {
        _TyObject_SetAttributeErrorContext(v, name);
    }
    return result;
}

int
PyObject_GetOptionalAttr(TyObject *v, TyObject *name, TyObject **result)
{
    TyTypeObject *tp = Ty_TYPE(v);

    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        *result = NULL;
        return -1;
    }

    if (tp->tp_getattro == PyObject_GenericGetAttr) {
        *result = _TyObject_GenericGetAttrWithDict(v, name, NULL, 1);
        if (*result != NULL) {
            return 1;
        }
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    if (tp->tp_getattro == _Ty_type_getattro) {
        int suppress_missing_attribute_exception = 0;
        *result = _Ty_type_getattro_impl((TyTypeObject*)v, name, &suppress_missing_attribute_exception);
        if (suppress_missing_attribute_exception) {
            // return 0 without having to clear the exception
            return 0;
        }
    }
    else if (tp->tp_getattro == (getattrofunc)_Ty_module_getattro) {
        // optimization: suppress attribute error from module getattro method
        *result = _Ty_module_getattro_impl((PyModuleObject*)v, name, 1);
        if (*result != NULL) {
            return 1;
        }
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    else if (tp->tp_getattro != NULL) {
        *result = (*tp->tp_getattro)(v, name);
    }
    else if (tp->tp_getattr != NULL) {
        const char *name_str = TyUnicode_AsUTF8(name);
        if (name_str == NULL) {
            *result = NULL;
            return -1;
        }
        *result = (*tp->tp_getattr)(v, (char *)name_str);
    }
    else {
        *result = NULL;
        return 0;
    }

    if (*result != NULL) {
        return 1;
    }
    if (!TyErr_ExceptionMatches(TyExc_AttributeError)) {
        return -1;
    }
    TyErr_Clear();
    return 0;
}

int
PyObject_GetOptionalAttrString(TyObject *obj, const char *name, TyObject **result)
{
    if (Ty_TYPE(obj)->tp_getattr == NULL) {
        TyObject *oname = TyUnicode_FromString(name);
        if (oname == NULL) {
            *result = NULL;
            return -1;
        }
        int rc = PyObject_GetOptionalAttr(obj, oname, result);
        Ty_DECREF(oname);
        return rc;
    }

    *result = (*Ty_TYPE(obj)->tp_getattr)(obj, (char*)name);
    if (*result != NULL) {
        return 1;
    }
    if (!TyErr_ExceptionMatches(TyExc_AttributeError)) {
        return -1;
    }
    TyErr_Clear();
    return 0;
}

int
PyObject_HasAttrWithError(TyObject *obj, TyObject *name)
{
    TyObject *res;
    int rc = PyObject_GetOptionalAttr(obj, name, &res);
    Ty_XDECREF(res);
    return rc;
}

int
PyObject_HasAttr(TyObject *obj, TyObject *name)
{
    int rc = PyObject_HasAttrWithError(obj, name);
    if (rc < 0) {
        TyErr_FormatUnraisable(
            "Exception ignored in PyObject_HasAttr(); consider using "
            "PyObject_HasAttrWithError(), "
            "PyObject_GetOptionalAttr() or PyObject_GetAttr()");
        return 0;
    }
    return rc;
}

int
PyObject_SetAttr(TyObject *v, TyObject *name, TyObject *value)
{
    TyTypeObject *tp = Ty_TYPE(v);
    int err;

    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return -1;
    }
    Ty_INCREF(name);

    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyUnicode_InternMortal(interp, &name);
    if (tp->tp_setattro != NULL) {
        err = (*tp->tp_setattro)(v, name, value);
        Ty_DECREF(name);
        return err;
    }
    if (tp->tp_setattr != NULL) {
        const char *name_str = TyUnicode_AsUTF8(name);
        if (name_str == NULL) {
            Ty_DECREF(name);
            return -1;
        }
        err = (*tp->tp_setattr)(v, (char *)name_str, value);
        Ty_DECREF(name);
        return err;
    }
    Ty_DECREF(name);
    _TyObject_ASSERT(name, Ty_REFCNT(name) >= 1);
    if (tp->tp_getattr == NULL && tp->tp_getattro == NULL)
        TyErr_Format(TyExc_TypeError,
                     "'%.100s' object has no attributes "
                     "(%s .%U)",
                     tp->tp_name,
                     value==NULL ? "del" : "assign to",
                     name);
    else
        TyErr_Format(TyExc_TypeError,
                     "'%.100s' object has only read-only attributes "
                     "(%s .%U)",
                     tp->tp_name,
                     value==NULL ? "del" : "assign to",
                     name);
    return -1;
}

int
PyObject_DelAttr(TyObject *v, TyObject *name)
{
    return PyObject_SetAttr(v, name, NULL);
}

TyObject **
_TyObject_ComputedDictPointer(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    assert((tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0);

    Ty_ssize_t dictoffset = tp->tp_dictoffset;
    if (dictoffset == 0) {
        return NULL;
    }

    if (dictoffset < 0) {
        assert(dictoffset != -1);

        Ty_ssize_t tsize = Ty_SIZE(obj);
        if (tsize < 0) {
            tsize = -tsize;
        }
        size_t size = _TyObject_VAR_SIZE(tp, tsize);
        assert(size <= (size_t)PY_SSIZE_T_MAX);
        dictoffset += (Ty_ssize_t)size;

        _TyObject_ASSERT(obj, dictoffset > 0);
        _TyObject_ASSERT(obj, dictoffset % SIZEOF_VOID_P == 0);
    }
    return (TyObject **) ((char *)obj + dictoffset);
}

/* Helper to get a pointer to an object's __dict__ slot, if any.
 * Creates the dict from inline attributes if necessary.
 * Does not set an exception.
 *
 * Note that the tp_dictoffset docs used to recommend this function,
 * so it should be treated as part of the public API.
 */
TyObject **
_TyObject_GetDictPtr(TyObject *obj)
{
    if ((Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0) {
        return _TyObject_ComputedDictPointer(obj);
    }
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL && Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        dict = _TyObject_MaterializeManagedDict(obj);
        if (dict == NULL) {
            TyErr_Clear();
            return NULL;
        }
    }
    return (TyObject **)&_TyObject_ManagedDictPointer(obj)->dict;
}

TyObject *
PyObject_SelfIter(TyObject *obj)
{
    return Ty_NewRef(obj);
}

/* Helper used when the __next__ method is removed from a type:
   tp_iternext is never NULL and can be safely called without checking
   on every iteration.
 */

TyObject *
_TyObject_NextNotImplemented(TyObject *self)
{
    TyErr_Format(TyExc_TypeError,
                 "'%.200s' object is not iterable",
                 Ty_TYPE(self)->tp_name);
    return NULL;
}


/* Specialized version of _TyObject_GenericGetAttrWithDict
   specifically for the LOAD_METHOD opcode.

   Return 1 if a method is found, 0 if it's a regular attribute
   from __dict__ or something returned by using a descriptor
   protocol.

   `method` will point to the resolved attribute or NULL.  In the
   latter case, an error will be set.
*/
int
_TyObject_GetMethod(TyObject *obj, TyObject *name, TyObject **method)
{
    int meth_found = 0;

    assert(*method == NULL);

    TyTypeObject *tp = Ty_TYPE(obj);
    if (!_TyType_IsReady(tp)) {
        if (TyType_Ready(tp) < 0) {
            return 0;
        }
    }

    if (tp->tp_getattro != PyObject_GenericGetAttr || !TyUnicode_CheckExact(name)) {
        *method = PyObject_GetAttr(obj, name);
        return 0;
    }

    TyObject *descr = _TyType_LookupRef(tp, name);
    descrgetfunc f = NULL;
    if (descr != NULL) {
        if (_TyType_HasFeature(Ty_TYPE(descr), Ty_TPFLAGS_METHOD_DESCRIPTOR)) {
            meth_found = 1;
        }
        else {
            f = Ty_TYPE(descr)->tp_descr_get;
            if (f != NULL && PyDescr_IsData(descr)) {
                *method = f(descr, obj, (TyObject *)Ty_TYPE(obj));
                Ty_DECREF(descr);
                return 0;
            }
        }
    }
    TyObject *dict, *attr;
    if ((tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES) &&
         _TyObject_TryGetInstanceAttribute(obj, name, &attr)) {
        if (attr != NULL) {
            *method = attr;
            Ty_XDECREF(descr);
            return 0;
        }
        dict = NULL;
    }
    else if ((tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT)) {
        dict = (TyObject *)_TyObject_GetManagedDict(obj);
    }
    else {
        TyObject **dictptr = _TyObject_ComputedDictPointer(obj);
        if (dictptr != NULL) {
            dict = FT_ATOMIC_LOAD_PTR_ACQUIRE(*dictptr);
        }
        else {
            dict = NULL;
        }
    }
    if (dict != NULL) {
        Ty_INCREF(dict);
        if (TyDict_GetItemRef(dict, name, method) != 0) {
            // found or error
            Ty_DECREF(dict);
            Ty_XDECREF(descr);
            return 0;
        }
        // not found
        Ty_DECREF(dict);
    }

    if (meth_found) {
        *method = descr;
        return 1;
    }

    if (f != NULL) {
        *method = f(descr, obj, (TyObject *)Ty_TYPE(obj));
        Ty_DECREF(descr);
        return 0;
    }

    if (descr != NULL) {
        *method = descr;
        return 0;
    }

    TyErr_Format(TyExc_AttributeError,
                 "'%.100s' object has no attribute '%U'",
                 tp->tp_name, name);

    _TyObject_SetAttributeErrorContext(obj, name);
    return 0;
}

/* Generic GetAttr functions - put these in your tp_[gs]etattro slot. */

TyObject *
_TyObject_GenericGetAttrWithDict(TyObject *obj, TyObject *name,
                                 TyObject *dict, int suppress)
{
    /* Make sure the logic of _TyObject_GetMethod is in sync with
       this method.

       When suppress=1, this function suppresses AttributeError.
    */

    TyTypeObject *tp = Ty_TYPE(obj);
    TyObject *descr = NULL;
    TyObject *res = NULL;
    descrgetfunc f;

    if (!TyUnicode_Check(name)){
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return NULL;
    }

    if (!_TyType_IsReady(tp)) {
        if (TyType_Ready(tp) < 0)
            return NULL;
    }

    Ty_INCREF(name);

    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);

    _TyType_LookupStackRefAndVersion(tp, name, &cref.ref);
    descr = PyStackRef_AsPyObjectBorrow(cref.ref);

    f = NULL;
    if (descr != NULL) {
        f = Ty_TYPE(descr)->tp_descr_get;
        if (f != NULL && PyDescr_IsData(descr)) {
            res = f(descr, obj, (TyObject *)Ty_TYPE(obj));
            if (res == NULL && suppress &&
                    TyErr_ExceptionMatches(TyExc_AttributeError)) {
                TyErr_Clear();
            }
            goto done;
        }
    }
    if (dict == NULL) {
        if ((tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES)) {
            if (TyUnicode_CheckExact(name) &&
                _TyObject_TryGetInstanceAttribute(obj, name, &res)) {
                if (res != NULL) {
                    goto done;
                }
            }
            else {
                dict = (TyObject *)_TyObject_MaterializeManagedDict(obj);
                if (dict == NULL) {
                    res = NULL;
                    goto done;
                }
            }
        }
        else if ((tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT)) {
            dict = (TyObject *)_TyObject_GetManagedDict(obj);
        }
        else {
            TyObject **dictptr = _TyObject_ComputedDictPointer(obj);
            if (dictptr) {
#ifdef Ty_GIL_DISABLED
                dict = _Ty_atomic_load_ptr_acquire(dictptr);
#else
                dict = *dictptr;
#endif
            }
        }
    }
    if (dict != NULL) {
        Ty_INCREF(dict);
        int rc = TyDict_GetItemRef(dict, name, &res);
        Ty_DECREF(dict);
        if (res != NULL) {
            goto done;
        }
        else if (rc < 0) {
            if (suppress && TyErr_ExceptionMatches(TyExc_AttributeError)) {
                TyErr_Clear();
            }
            else {
                goto done;
            }
        }
    }

    if (f != NULL) {
        res = f(descr, obj, (TyObject *)Ty_TYPE(obj));
        if (res == NULL && suppress &&
                TyErr_ExceptionMatches(TyExc_AttributeError)) {
            TyErr_Clear();
        }
        goto done;
    }

    if (descr != NULL) {
        res = PyStackRef_AsPyObjectSteal(cref.ref);
        cref.ref = PyStackRef_NULL;
        goto done;
    }

    if (!suppress) {
        TyErr_Format(TyExc_AttributeError,
                     "'%.100s' object has no attribute '%U'",
                     tp->tp_name, name);

        _TyObject_SetAttributeErrorContext(obj, name);
    }
  done:
    _TyThreadState_PopCStackRef(tstate, &cref);
    Ty_DECREF(name);
    return res;
}

TyObject *
PyObject_GenericGetAttr(TyObject *obj, TyObject *name)
{
    return _TyObject_GenericGetAttrWithDict(obj, name, NULL, 0);
}

int
_TyObject_GenericSetAttrWithDict(TyObject *obj, TyObject *name,
                                 TyObject *value, TyObject *dict)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    TyObject *descr;
    descrsetfunc f;
    int res = -1;

    assert(!TyType_IsSubtype(tp, &TyType_Type));
    if (!TyUnicode_Check(name)){
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return -1;
    }

    if (!_TyType_IsReady(tp) && TyType_Ready(tp) < 0) {
        return -1;
    }

    Ty_INCREF(name);
    Ty_INCREF(tp);

    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);

    _TyType_LookupStackRefAndVersion(tp, name, &cref.ref);
    descr = PyStackRef_AsPyObjectBorrow(cref.ref);

    if (descr != NULL) {
        f = Ty_TYPE(descr)->tp_descr_set;
        if (f != NULL) {
            res = f(descr, obj, value);
            goto done;
        }
    }

    if (dict == NULL) {
        TyObject **dictptr;

        if ((tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES)) {
            res = _TyObject_StoreInstanceAttribute(obj, name, value);
            goto error_check;
        }

        if ((tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT)) {
            PyManagedDictPointer *managed_dict = _TyObject_ManagedDictPointer(obj);
            dictptr = (TyObject **)&managed_dict->dict;
        }
        else {
            dictptr = _TyObject_ComputedDictPointer(obj);
        }
        if (dictptr == NULL) {
            if (descr == NULL) {
                if (tp->tp_setattro == PyObject_GenericSetAttr) {
                    TyErr_Format(TyExc_AttributeError,
                                "'%.100s' object has no attribute '%U' and no "
                                "__dict__ for setting new attributes",
                                tp->tp_name, name);
                }
                else {
                    TyErr_Format(TyExc_AttributeError,
                                "'%.100s' object has no attribute '%U'",
                                tp->tp_name, name);
                }
                _TyObject_SetAttributeErrorContext(obj, name);
            }
            else {
                TyErr_Format(TyExc_AttributeError,
                            "'%.100s' object attribute '%U' is read-only",
                            tp->tp_name, name);
            }
            goto done;
        }
        else {
            res = _PyObjectDict_SetItem(tp, obj, dictptr, name, value);
        }
    }
    else {
        Ty_INCREF(dict);
        if (value == NULL)
            res = TyDict_DelItem(dict, name);
        else
            res = TyDict_SetItem(dict, name, value);
        Ty_DECREF(dict);
    }
  error_check:
    if (res < 0 && TyErr_ExceptionMatches(TyExc_KeyError)) {
        TyErr_Format(TyExc_AttributeError,
                        "'%.100s' object has no attribute '%U'",
                        tp->tp_name, name);
        _TyObject_SetAttributeErrorContext(obj, name);
    }
  done:
    _TyThreadState_PopCStackRef(tstate, &cref);
    Ty_DECREF(tp);
    Ty_DECREF(name);
    return res;
}

int
PyObject_GenericSetAttr(TyObject *obj, TyObject *name, TyObject *value)
{
    return _TyObject_GenericSetAttrWithDict(obj, name, value, NULL);
}

int
PyObject_GenericSetDict(TyObject *obj, TyObject *value, void *context)
{
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "cannot delete __dict__");
        return -1;
    }
    return _TyObject_SetDict(obj, value);
}


/* Test a value used as condition, e.g., in a while or if statement.
   Return -1 if an error occurred */

int
PyObject_IsTrue(TyObject *v)
{
    Ty_ssize_t res;
    if (v == Ty_True)
        return 1;
    if (v == Ty_False)
        return 0;
    if (v == Ty_None)
        return 0;
    else if (Ty_TYPE(v)->tp_as_number != NULL &&
             Ty_TYPE(v)->tp_as_number->nb_bool != NULL)
        res = (*Ty_TYPE(v)->tp_as_number->nb_bool)(v);
    else if (Ty_TYPE(v)->tp_as_mapping != NULL &&
             Ty_TYPE(v)->tp_as_mapping->mp_length != NULL)
        res = (*Ty_TYPE(v)->tp_as_mapping->mp_length)(v);
    else if (Ty_TYPE(v)->tp_as_sequence != NULL &&
             Ty_TYPE(v)->tp_as_sequence->sq_length != NULL)
        res = (*Ty_TYPE(v)->tp_as_sequence->sq_length)(v);
    else
        return 1;
    /* if it is negative, it should be either -1 or -2 */
    return (res > 0) ? 1 : Ty_SAFE_DOWNCAST(res, Ty_ssize_t, int);
}

/* equivalent of 'not v'
   Return -1 if an error occurred */

int
PyObject_Not(TyObject *v)
{
    int res;
    res = PyObject_IsTrue(v);
    if (res < 0)
        return res;
    return res == 0;
}

/* Test whether an object can be called */

int
PyCallable_Check(TyObject *x)
{
    if (x == NULL)
        return 0;
    return Ty_TYPE(x)->tp_call != NULL;
}


/* Helper for PyObject_Dir without arguments: returns the local scope. */
static TyObject *
_dir_locals(void)
{
    TyObject *names;
    TyObject *locals;

    if (_TyEval_GetFrame() != NULL) {
        locals = _TyEval_GetFrameLocals();
    }
    else {
        TyThreadState *tstate = _TyThreadState_GET();
        locals = _TyEval_GetGlobalsFromRunningMain(tstate);
        if (locals == NULL) {
            if (!_TyErr_Occurred(tstate)) {
                locals = _TyEval_GetFrameLocals();
                assert(_TyErr_Occurred(tstate));
            }
        }
        else {
            Ty_INCREF(locals);
        }
    }
    if (locals == NULL) {
        return NULL;
    }

    names = PyMapping_Keys(locals);
    Ty_DECREF(locals);
    if (!names) {
        return NULL;
    }
    if (!TyList_Check(names)) {
        TyErr_Format(TyExc_TypeError,
            "dir(): expected keys() of locals to be a list, "
            "not '%.200s'", Ty_TYPE(names)->tp_name);
        Ty_DECREF(names);
        return NULL;
    }
    if (TyList_Sort(names)) {
        Ty_DECREF(names);
        return NULL;
    }
    return names;
}

/* Helper for PyObject_Dir: object introspection. */
static TyObject *
_dir_object(TyObject *obj)
{
    TyObject *result, *sorted;
    TyObject *dirfunc = _TyObject_LookupSpecial(obj, &_Ty_ID(__dir__));

    assert(obj != NULL);
    if (dirfunc == NULL) {
        if (!TyErr_Occurred())
            TyErr_SetString(TyExc_TypeError, "object does not provide __dir__");
        return NULL;
    }
    /* use __dir__ */
    result = _TyObject_CallNoArgs(dirfunc);
    Ty_DECREF(dirfunc);
    if (result == NULL)
        return NULL;
    /* return sorted(result) */
    sorted = PySequence_List(result);
    Ty_DECREF(result);
    if (sorted == NULL)
        return NULL;
    if (TyList_Sort(sorted)) {
        Ty_DECREF(sorted);
        return NULL;
    }
    return sorted;
}

/* Implementation of dir() -- if obj is NULL, returns the names in the current
   (local) scope.  Otherwise, performs introspection of the object: returns a
   sorted list of attribute names (supposedly) accessible from the object
*/
TyObject *
PyObject_Dir(TyObject *obj)
{
    return (obj == NULL) ? _dir_locals() : _dir_object(obj);
}

/*
None is a non-NULL undefined value.
There is (and should be!) no way to create other objects of this type,
so there is exactly one (which is indestructible, by the way).
*/

/* ARGSUSED */
static TyObject *
none_repr(TyObject *op)
{
    return TyUnicode_FromString("None");
}

static void
none_dealloc(TyObject* none)
{
    /* This should never get called, but we also don't want to SEGV if
     * we accidentally decref None out of existence. Instead,
     * since None is an immortal object, re-set the reference count.
     */
    _Ty_SetImmortal(none);
}

static TyObject *
none_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || (kwargs && TyDict_GET_SIZE(kwargs))) {
        TyErr_SetString(TyExc_TypeError, "NoneType takes no arguments");
        return NULL;
    }
    Py_RETURN_NONE;
}

static int
none_bool(TyObject *v)
{
    return 0;
}

static Ty_hash_t none_hash(TyObject *v)
{
    return 0xFCA86420;
}

static TyNumberMethods none_as_number = {
    0,                          /* nb_add */
    0,                          /* nb_subtract */
    0,                          /* nb_multiply */
    0,                          /* nb_remainder */
    0,                          /* nb_divmod */
    0,                          /* nb_power */
    0,                          /* nb_negative */
    0,                          /* nb_positive */
    0,                          /* nb_absolute */
    none_bool,                  /* nb_bool */
    0,                          /* nb_invert */
    0,                          /* nb_lshift */
    0,                          /* nb_rshift */
    0,                          /* nb_and */
    0,                          /* nb_xor */
    0,                          /* nb_or */
    0,                          /* nb_int */
    0,                          /* nb_reserved */
    0,                          /* nb_float */
    0,                          /* nb_inplace_add */
    0,                          /* nb_inplace_subtract */
    0,                          /* nb_inplace_multiply */
    0,                          /* nb_inplace_remainder */
    0,                          /* nb_inplace_power */
    0,                          /* nb_inplace_lshift */
    0,                          /* nb_inplace_rshift */
    0,                          /* nb_inplace_and */
    0,                          /* nb_inplace_xor */
    0,                          /* nb_inplace_or */
    0,                          /* nb_floor_divide */
    0,                          /* nb_true_divide */
    0,                          /* nb_inplace_floor_divide */
    0,                          /* nb_inplace_true_divide */
    0,                          /* nb_index */
};

TyDoc_STRVAR(none_doc,
"NoneType()\n"
"--\n\n"
"The type of the None singleton.");

TyTypeObject _PyNone_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "NoneType",
    0,
    0,
    none_dealloc,       /*tp_dealloc*/
    0,                  /*tp_vectorcall_offset*/
    0,                  /*tp_getattr*/
    0,                  /*tp_setattr*/
    0,                  /*tp_as_async*/
    none_repr,          /*tp_repr*/
    &none_as_number,    /*tp_as_number*/
    0,                  /*tp_as_sequence*/
    0,                  /*tp_as_mapping*/
    none_hash,          /*tp_hash */
    0,                  /*tp_call */
    0,                  /*tp_str */
    0,                  /*tp_getattro */
    0,                  /*tp_setattro */
    0,                  /*tp_as_buffer */
    Ty_TPFLAGS_DEFAULT, /*tp_flags */
    none_doc,           /*tp_doc */
    0,                  /*tp_traverse */
    0,                  /*tp_clear */
    _Ty_BaseObject_RichCompare, /*tp_richcompare */
    0,                  /*tp_weaklistoffset */
    0,                  /*tp_iter */
    0,                  /*tp_iternext */
    0,                  /*tp_methods */
    0,                  /*tp_members */
    0,                  /*tp_getset */
    0,                  /*tp_base */
    0,                  /*tp_dict */
    0,                  /*tp_descr_get */
    0,                  /*tp_descr_set */
    0,                  /*tp_dictoffset */
    0,                  /*tp_init */
    0,                  /*tp_alloc */
    none_new,           /*tp_new */
};

TyObject _Ty_NoneStruct = _TyObject_HEAD_INIT(&_PyNone_Type);

/* NotImplemented is an object that can be used to signal that an
   operation is not implemented for the given type combination. */

static TyObject *
NotImplemented_repr(TyObject *op)
{
    return TyUnicode_FromString("NotImplemented");
}

static TyObject *
NotImplemented_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("NotImplemented");
}

static TyMethodDef notimplemented_methods[] = {
    {"__reduce__", NotImplemented_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static TyObject *
notimplemented_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || (kwargs && TyDict_GET_SIZE(kwargs))) {
        TyErr_SetString(TyExc_TypeError, "NotImplementedType takes no arguments");
        return NULL;
    }
    Py_RETURN_NOTIMPLEMENTED;
}

static void
notimplemented_dealloc(TyObject *notimplemented)
{
    /* This should never get called, but we also don't want to SEGV if
     * we accidentally decref NotImplemented out of existence. Instead,
     * since Notimplemented is an immortal object, re-set the reference count.
     */
    _Ty_SetImmortal(notimplemented);
}

static int
notimplemented_bool(TyObject *v)
{
    TyErr_SetString(TyExc_TypeError,
                    "NotImplemented should not be used in a boolean context");
    return -1;
}

static TyNumberMethods notimplemented_as_number = {
    .nb_bool = notimplemented_bool,
};

TyDoc_STRVAR(notimplemented_doc,
"NotImplementedType()\n"
"--\n\n"
"The type of the NotImplemented singleton.");

TyTypeObject _PyNotImplemented_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "NotImplementedType",
    0,
    0,
    notimplemented_dealloc,       /*tp_dealloc*/ /*never called*/
    0,                  /*tp_vectorcall_offset*/
    0,                  /*tp_getattr*/
    0,                  /*tp_setattr*/
    0,                  /*tp_as_async*/
    NotImplemented_repr,        /*tp_repr*/
    &notimplemented_as_number,  /*tp_as_number*/
    0,                  /*tp_as_sequence*/
    0,                  /*tp_as_mapping*/
    0,                  /*tp_hash */
    0,                  /*tp_call */
    0,                  /*tp_str */
    0,                  /*tp_getattro */
    0,                  /*tp_setattro */
    0,                  /*tp_as_buffer */
    Ty_TPFLAGS_DEFAULT, /*tp_flags */
    notimplemented_doc, /*tp_doc */
    0,                  /*tp_traverse */
    0,                  /*tp_clear */
    0,                  /*tp_richcompare */
    0,                  /*tp_weaklistoffset */
    0,                  /*tp_iter */
    0,                  /*tp_iternext */
    notimplemented_methods, /*tp_methods */
    0,                  /*tp_members */
    0,                  /*tp_getset */
    0,                  /*tp_base */
    0,                  /*tp_dict */
    0,                  /*tp_descr_get */
    0,                  /*tp_descr_set */
    0,                  /*tp_dictoffset */
    0,                  /*tp_init */
    0,                  /*tp_alloc */
    notimplemented_new, /*tp_new */
};

TyObject _Ty_NotImplementedStruct = _TyObject_HEAD_INIT(&_PyNotImplemented_Type);


TyStatus
_TyObject_InitState(TyInterpreterState *interp)
{
#ifdef Ty_TRACE_REFS
    if (refchain_init(interp) < 0) {
        return _TyStatus_NO_MEMORY();
    }
#endif
    return _TyStatus_OK();
}

void
_TyObject_FiniState(TyInterpreterState *interp)
{
#ifdef Ty_TRACE_REFS
    refchain_fini(interp);
#endif
}


extern TyTypeObject _PyAnextAwaitable_Type;
extern TyTypeObject _PyLegacyEventHandler_Type;
extern TyTypeObject _PyLineIterator;
extern TyTypeObject _PyMemoryIter_Type;
extern TyTypeObject _PyPositionsIterator;
extern TyTypeObject _Ty_GenericAliasIterType;

static TyTypeObject* static_types[] = {
    // The two most important base types: must be initialized first and
    // deallocated last.
    &PyBaseObject_Type,
    &TyType_Type,

    // Static types with base=&PyBaseObject_Type
    &PyAsyncGen_Type,
    &PyByteArrayIter_Type,
    &TyByteArray_Type,
    &PyBytesIter_Type,
    &TyBytes_Type,
    &PyCFunction_Type,
    &TyCallIter_Type,
    &PyCapsule_Type,
    &TyCell_Type,
    &PyClassMethodDescr_Type,
    &TyClassMethod_Type,
    &TyCode_Type,
    &TyComplex_Type,
    &PyContextToken_Type,
    &PyContextVar_Type,
    &PyContext_Type,
    &TyCoro_Type,
    &PyDictItems_Type,
    &PyDictIterItem_Type,
    &PyDictIterKey_Type,
    &PyDictIterValue_Type,
    &PyDictKeys_Type,
    &PyDictProxy_Type,
    &PyDictRevIterItem_Type,
    &PyDictRevIterKey_Type,
    &PyDictRevIterValue_Type,
    &PyDictValues_Type,
    &TyDict_Type,
    &PyEllipsis_Type,
    &PyEnum_Type,
    &PyFilter_Type,
    &TyFloat_Type,
    &TyFrame_Type,
    &PyFrameLocalsProxy_Type,
    &TyFrozenSet_Type,
    &TyFunction_Type,
    &TyGen_Type,
    &PyGetSetDescr_Type,
    &PyInstanceMethod_Type,
    &PyListIter_Type,
    &PyListRevIter_Type,
    &TyList_Type,
    &PyLongRangeIter_Type,
    &TyLong_Type,
    &PyMap_Type,
    &PyMemberDescr_Type,
    &TyMemoryView_Type,
    &PyMethodDescr_Type,
    &TyMethod_Type,
    &PyModuleDef_Type,
    &TyModule_Type,
    &PyODictIter_Type,
    &PyPickleBuffer_Type,
    &TyProperty_Type,
    &PyRangeIter_Type,
    &TyRange_Type,
    &PyReversed_Type,
    &PySTEntry_Type,
    &TySeqIter_Type,
    &PySetIter_Type,
    &TySet_Type,
    &TySlice_Type,
    &TyStaticMethod_Type,
    &PyStdPrinter_Type,
    &TySuper_Type,
    &PyTraceBack_Type,
    &PyTupleIter_Type,
    &TyTuple_Type,
    &PyUnicodeIter_Type,
    &TyUnicode_Type,
    &PyWrapperDescr_Type,
    &PyZip_Type,
    &Ty_GenericAliasType,
    &_PyAnextAwaitable_Type,
    &_PyAsyncGenASend_Type,
    &_PyAsyncGenAThrow_Type,
    &_PyAsyncGenWrappedValue_Type,
    &_PyBufferWrapper_Type,
    &_PyContextTokenMissing_Type,
    &_PyCoroWrapper_Type,
    &_Ty_GenericAliasIterType,
    &_PyHamtItems_Type,
    &_PyHamtKeys_Type,
    &_PyHamtValues_Type,
    &_TyHamt_ArrayNode_Type,
    &_TyHamt_BitmapNode_Type,
    &_TyHamt_CollisionNode_Type,
    &_TyHamt_Type,
    &_PyInstructionSequence_Type,
    &_PyInterpolation_Type,
    &_PyLegacyEventHandler_Type,
    &_PyLineIterator,
    &_PyManagedBuffer_Type,
    &_PyMemoryIter_Type,
    &_PyMethodWrapper_Type,
    &_PyNamespace_Type,
    &_PyNone_Type,
    &_PyNotImplemented_Type,
    &_PyPositionsIterator,
    &_PyTemplate_Type,
    &_PyTemplateIter_Type,
    &_PyUnicodeASCIIIter_Type,
    &_PyUnion_Type,
#ifdef _Ty_TIER2
    &_PyUOpExecutor_Type,
#endif
    &_TyWeakref_CallableProxyType,
    &_TyWeakref_ProxyType,
    &_TyWeakref_RefType,
    &_PyTypeAlias_Type,
    &_PyNoDefault_Type,

    // subclasses: _PyTypes_FiniTypes() deallocates them before their base
    // class
    &TyBool_Type,         // base=&TyLong_Type
    &PyCMethod_Type,      // base=&PyCFunction_Type
    &PyODictItems_Type,   // base=&PyDictItems_Type
    &PyODictKeys_Type,    // base=&PyDictKeys_Type
    &PyODictValues_Type,  // base=&PyDictValues_Type
    &PyODict_Type,        // base=&TyDict_Type
};


TyStatus
_PyTypes_InitTypes(TyInterpreterState *interp)
{
    // All other static types (unless initialized elsewhere)
    for (size_t i=0; i < Ty_ARRAY_LENGTH(static_types); i++) {
        TyTypeObject *type = static_types[i];
        if (_PyStaticType_InitBuiltin(interp, type) < 0) {
            return _TyStatus_ERR("Can't initialize builtin type");
        }
        if (type == &TyType_Type) {
            // Sanitify checks of the two most important types
            assert(PyBaseObject_Type.tp_base == NULL);
            assert(TyType_Type.tp_base == &PyBaseObject_Type);
        }
    }

    // Cache __reduce__ from PyBaseObject_Type object
    TyObject *baseobj_dict = _TyType_GetDict(&PyBaseObject_Type);
    TyObject *baseobj_reduce = TyDict_GetItemWithError(baseobj_dict, &_Ty_ID(__reduce__));
    if (baseobj_reduce == NULL && TyErr_Occurred()) {
        return _TyStatus_ERR("Can't get __reduce__ from base object");
    }
    _Ty_INTERP_CACHED_OBJECT(interp, objreduce) = baseobj_reduce;

    // Must be after static types are initialized
    if (_Ty_initialize_generic(interp) < 0) {
        return _TyStatus_ERR("Can't initialize generic types");
    }

    return _TyStatus_OK();
}


// Best-effort function clearing static types.
//
// Don't deallocate a type if it still has subclasses. If a Ty_Finalize()
// sub-function is interrupted by CTRL+C or fails with MemoryError, some
// subclasses are not cleared properly. Leave the static type unchanged in this
// case.
void
_PyTypes_FiniTypes(TyInterpreterState *interp)
{
    // Deallocate types in the reverse order to deallocate subclasses before
    // their base classes.
    for (Ty_ssize_t i=Ty_ARRAY_LENGTH(static_types)-1; i>=0; i--) {
        TyTypeObject *type = static_types[i];
        _PyStaticType_FiniBuiltin(interp, type);
    }
}


static inline void
new_reference(TyObject *op)
{
    // Skip the immortal object check in Ty_SET_REFCNT; always set refcnt to 1
#if !defined(Ty_GIL_DISABLED)
#if SIZEOF_VOID_P > 4
    op->ob_refcnt_full = 1;
    assert(op->ob_refcnt == 1);
    assert(op->ob_flags == 0);
#else
    op->ob_refcnt = 1;
#endif
#else
    op->ob_flags = 0;
    op->ob_mutex = (PyMutex){ 0 };
#ifdef _Ty_THREAD_SANITIZER
    _Ty_atomic_store_uintptr_relaxed(&op->ob_tid, _Ty_ThreadId());
    _Ty_atomic_store_uint8_relaxed(&op->ob_gc_bits, 0);
    _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, 1);
    _Ty_atomic_store_ssize_relaxed(&op->ob_ref_shared, 0);
#else
    op->ob_tid = _Ty_ThreadId();
    op->ob_gc_bits = 0;
    op->ob_ref_local = 1;
    op->ob_ref_shared = 0;
#endif
#endif
#ifdef Ty_TRACE_REFS
    _Ty_AddToAllObjects(op);
#endif
    _PyReftracerTrack(op, PyRefTracer_CREATE);
}

void
_Ty_NewReference(TyObject *op)
{
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
    new_reference(op);
}

void
_Ty_NewReferenceNoTotal(TyObject *op)
{
    new_reference(op);
}

void
_Ty_SetImmortalUntracked(TyObject *op)
{
#ifdef Ty_DEBUG
    // For strings, use _TyUnicode_InternImmortal instead.
    if (TyUnicode_CheckExact(op)) {
        assert(TyUnicode_CHECK_INTERNED(op) == SSTATE_INTERNED_IMMORTAL
            || TyUnicode_CHECK_INTERNED(op) == SSTATE_INTERNED_IMMORTAL_STATIC);
    }
#endif
    // Check if already immortal to avoid degrading from static immortal to plain immortal
    if (_Ty_IsImmortal(op)) {
        return;
    }
#ifdef Ty_GIL_DISABLED
    op->ob_tid = _Ty_UNOWNED_TID;
    op->ob_ref_local = _Ty_IMMORTAL_REFCNT_LOCAL;
    op->ob_ref_shared = 0;
    _Ty_atomic_or_uint8(&op->ob_gc_bits, _TyGC_BITS_DEFERRED);
#elif SIZEOF_VOID_P > 4
    op->ob_flags = _Ty_IMMORTAL_FLAGS;
    op->ob_refcnt = _Ty_IMMORTAL_INITIAL_REFCNT;
#else
    op->ob_refcnt = _Ty_IMMORTAL_INITIAL_REFCNT;
#endif
}

void
_Ty_SetImmortal(TyObject *op)
{
    if (PyObject_IS_GC(op) && _TyObject_GC_IS_TRACKED(op)) {
        _TyObject_GC_UNTRACK(op);
    }
    _Ty_SetImmortalUntracked(op);
}

void
_TyObject_SetDeferredRefcount(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    assert(TyType_IS_GC(Ty_TYPE(op)));
    assert(_Ty_IsOwnedByCurrentThread(op));
    assert(op->ob_ref_shared == 0);
    _TyObject_SET_GC_BITS(op, _TyGC_BITS_DEFERRED);
    op->ob_ref_shared = _Ty_REF_SHARED(_Ty_REF_DEFERRED, 0);
#endif
}

int
PyUnstable_Object_EnableDeferredRefcount(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    if (!TyType_IS_GC(Ty_TYPE(op))) {
        // Deferred reference counting doesn't work
        // on untracked types.
        return 0;
    }

    uint8_t bits = _Ty_atomic_load_uint8(&op->ob_gc_bits);
    if ((bits & _TyGC_BITS_DEFERRED) != 0)
    {
        // Nothing to do.
        return 0;
    }

    if (_Ty_atomic_compare_exchange_uint8(&op->ob_gc_bits, &bits, bits | _TyGC_BITS_DEFERRED) == 0)
    {
        // Someone beat us to it!
        return 0;
    }
    _Ty_atomic_add_ssize(&op->ob_ref_shared, _Ty_REF_SHARED(_Ty_REF_DEFERRED, 0));
    return 1;
#else
    return 0;
#endif
}

int
PyUnstable_Object_IsUniqueReferencedTemporary(TyObject *op)
{
    if (!_TyObject_IsUniquelyReferenced(op)) {
        return 0;
    }

    _PyInterpreterFrame *frame = _TyEval_GetFrame();
    if (frame == NULL) {
        return 0;
    }

    _PyStackRef *base = _TyFrame_Stackbase(frame);
    _PyStackRef *stackpointer = frame->stackpointer;
    while (stackpointer > base) {
        stackpointer--;
        if (op == PyStackRef_AsPyObjectBorrow(*stackpointer)) {
            return PyStackRef_IsHeapSafe(*stackpointer);
        }
    }
    return 0;
}

int
PyUnstable_TryIncRef(TyObject *op)
{
    return _Ty_TryIncref(op);
}

void
PyUnstable_EnableTryIncRef(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    _TyObject_SetMaybeWeakref(op);
#endif
}

void
_Ty_ResurrectReference(TyObject *op)
{
#ifdef Ty_TRACE_REFS
    _Ty_AddToAllObjects(op);
#endif
}

void
_Ty_ForgetReference(TyObject *op)
{
#ifdef Ty_TRACE_REFS
    if (Ty_REFCNT(op) < 0) {
        _TyObject_ASSERT_FAILED_MSG(op, "negative refcnt");
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();

#ifdef SLOW_UNREF_CHECK
    if (!_PyRefchain_Get(interp, op)) {
        /* Not found */
        _TyObject_ASSERT_FAILED_MSG(op,
                                    "object not found in the objects list");
    }
#endif

    _PyRefchain_Remove(interp, op);
#endif
}


#ifdef Ty_TRACE_REFS
static int
_Ty_PrintReference(_Ty_hashtable_t *ht,
                   const void *key, const void *value,
                   void *user_data)
{
    TyObject *op = (TyObject*)key;
    FILE *fp = (FILE *)user_data;
    fprintf(fp, "%p [%zd] ", (void *)op, Ty_REFCNT(op));
    if (PyObject_Print(op, fp, 0) != 0) {
        TyErr_Clear();
    }
    putc('\n', fp);
    return 0;
}


/* Print all live objects.  Because PyObject_Print is called, the
 * interpreter must be in a healthy state.
 */
void
_Ty_PrintReferences(TyInterpreterState *interp, FILE *fp)
{
    if (interp == NULL) {
        interp = _TyInterpreterState_Main();
    }
    fprintf(fp, "Remaining objects:\n");
    _Ty_hashtable_foreach(REFCHAIN(interp), _Ty_PrintReference, fp);
}


static int
_Ty_PrintReferenceAddress(_Ty_hashtable_t *ht,
                          const void *key, const void *value,
                          void *user_data)
{
    TyObject *op = (TyObject*)key;
    FILE *fp = (FILE *)user_data;
    fprintf(fp, "%p [%zd] %s\n",
            (void *)op, Ty_REFCNT(op), Ty_TYPE(op)->tp_name);
    return 0;
}


/* Print the addresses of all live objects.  Unlike _Ty_PrintReferences, this
 * doesn't make any calls to the Python C API, so is always safe to call.
 */
// XXX This function is not safe to use if the interpreter has been
// freed or is in an unhealthy state (e.g. late in finalization).
// The call in Ty_FinalizeEx() is okay since the main interpreter
// is statically allocated.
void
_Ty_PrintReferenceAddresses(TyInterpreterState *interp, FILE *fp)
{
    fprintf(fp, "Remaining object addresses:\n");
    _Ty_hashtable_foreach(REFCHAIN(interp), _Ty_PrintReferenceAddress, fp);
}


typedef struct {
    TyObject *self;
    TyObject *args;
    TyObject *list;
    TyObject *type;
    Ty_ssize_t limit;
} _Ty_GetObjectsData;

enum {
    _PY_GETOBJECTS_IGNORE = 0,
    _PY_GETOBJECTS_ERROR = 1,
    _PY_GETOBJECTS_STOP = 2,
};

static int
_Ty_GetObject(_Ty_hashtable_t *ht,
              const void *key, const void *value,
              void *user_data)
{
    TyObject *op = (TyObject *)key;
    _Ty_GetObjectsData *data = user_data;
    if (data->limit > 0) {
        if (TyList_GET_SIZE(data->list) >= data->limit) {
            return _PY_GETOBJECTS_STOP;
        }
    }

    if (op == data->self) {
        return _PY_GETOBJECTS_IGNORE;
    }
    if (op == data->args) {
        return _PY_GETOBJECTS_IGNORE;
    }
    if (op == data->list) {
        return _PY_GETOBJECTS_IGNORE;
    }
    if (data->type != NULL) {
        if (op == data->type) {
            return _PY_GETOBJECTS_IGNORE;
        }
        if (!Ty_IS_TYPE(op, (TyTypeObject *)data->type)) {
            return _PY_GETOBJECTS_IGNORE;
        }
    }

    if (TyList_Append(data->list, op) < 0) {
        return _PY_GETOBJECTS_ERROR;
    }
    return 0;
}


/* The implementation of sys.getobjects(). */
TyObject *
_Ty_GetObjects(TyObject *self, TyObject *args)
{
    Ty_ssize_t limit;
    TyObject *type = NULL;
    if (!TyArg_ParseTuple(args, "n|O", &limit, &type)) {
        return NULL;
    }

    TyObject *list = TyList_New(0);
    if (list == NULL) {
        return NULL;
    }

    _Ty_GetObjectsData data = {
        .self = self,
        .args = args,
        .list = list,
        .type = type,
        .limit = limit,
    };
    TyInterpreterState *interp = _TyInterpreterState_GET();
    int res = _Ty_hashtable_foreach(REFCHAIN(interp), _Ty_GetObject, &data);
    if (res == _PY_GETOBJECTS_ERROR) {
        Ty_DECREF(list);
        return NULL;
    }
    return list;
}

#undef REFCHAIN
#undef REFCHAIN_VALUE

#endif  /* Ty_TRACE_REFS */


/* Hack to force loading of abstract.o */
Ty_ssize_t (*_Ty_abstract_hack)(TyObject *) = PyObject_Size;


void
_TyObject_DebugTypeStats(FILE *out)
{
    _TyDict_DebugMallocStats(out);
    _TyFloat_DebugMallocStats(out);
    _TyList_DebugMallocStats(out);
    _TyTuple_DebugMallocStats(out);
}

/* These methods are used to control infinite recursion in repr, str, print,
   etc.  Container objects that may recursively contain themselves,
   e.g. builtin dictionaries and lists, should use Ty_ReprEnter() and
   Ty_ReprLeave() to avoid infinite recursion.

   Ty_ReprEnter() returns 0 the first time it is called for a particular
   object and 1 every time thereafter.  It returns -1 if an exception
   occurred.  Ty_ReprLeave() has no return value.

   See dictobject.c and listobject.c for examples of use.
*/

int
Ty_ReprEnter(TyObject *obj)
{
    TyObject *dict;
    TyObject *list;
    Ty_ssize_t i;

    dict = TyThreadState_GetDict();
    /* Ignore a missing thread-state, so that this function can be called
       early on startup. */
    if (dict == NULL)
        return 0;
    list = TyDict_GetItemWithError(dict, &_Ty_ID(Ty_Repr));
    if (list == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        list = TyList_New(0);
        if (list == NULL)
            return -1;
        if (TyDict_SetItem(dict, &_Ty_ID(Ty_Repr), list) < 0)
            return -1;
        Ty_DECREF(list);
    }
    i = TyList_GET_SIZE(list);
    while (--i >= 0) {
        if (TyList_GET_ITEM(list, i) == obj)
            return 1;
    }
    if (TyList_Append(list, obj) < 0)
        return -1;
    return 0;
}

void
Ty_ReprLeave(TyObject *obj)
{
    TyObject *dict;
    TyObject *list;
    Ty_ssize_t i;

    TyObject *exc = TyErr_GetRaisedException();

    dict = TyThreadState_GetDict();
    if (dict == NULL)
        goto finally;

    list = TyDict_GetItemWithError(dict, &_Ty_ID(Ty_Repr));
    if (list == NULL || !TyList_Check(list))
        goto finally;

    i = TyList_GET_SIZE(list);
    /* Count backwards because we always expect obj to be list[-1] */
    while (--i >= 0) {
        if (TyList_GET_ITEM(list, i) == obj) {
            TyList_SetSlice(list, i, i + 1, NULL);
            break;
        }
    }

finally:
    /* ignore exceptions because there is no way to report them. */
    TyErr_SetRaisedException(exc);
}

/* Trashcan support. */

/* Add op to the gcstate->trash_delete_later list.  Called when the current
 * call-stack depth gets large.  op must be a gc'ed object, with refcount 0.
 *  Ty_DECREF must already have been called on it.
 */
void
_PyTrash_thread_deposit_object(TyThreadState *tstate, TyObject *op)
{
    _TyObject_ASSERT(op, Ty_REFCNT(op) == 0);
    TyTypeObject *tp = Ty_TYPE(op);
    assert(tp->tp_flags & Ty_TPFLAGS_HAVE_GC);
    int tracked = 0;
    if (tp->tp_is_gc == NULL || tp->tp_is_gc(op)) {
        tracked = _TyObject_GC_IS_TRACKED(op);
        if (tracked) {
            _TyObject_GC_UNTRACK(op);
        }
    }
    uintptr_t tagged_ptr = ((uintptr_t)tstate->delete_later) | tracked;
#ifdef Ty_GIL_DISABLED
    op->ob_tid = tagged_ptr;
#else
    _Ty_AS_GC(op)->_gc_next = tagged_ptr;
#endif
    tstate->delete_later = op;
}

/* Deallocate all the objects in the gcstate->trash_delete_later list.
 * Called when the call-stack unwinds again. */
void
_PyTrash_thread_destroy_chain(TyThreadState *tstate)
{
    while (tstate->delete_later) {
        TyObject *op = tstate->delete_later;
        destructor dealloc = Ty_TYPE(op)->tp_dealloc;

#ifdef Ty_GIL_DISABLED
        uintptr_t tagged_ptr = op->ob_tid;
        op->ob_tid = 0;
        _Ty_atomic_store_ssize_relaxed(&op->ob_ref_shared, _Ty_REF_MERGED);
#else
        uintptr_t tagged_ptr = _Ty_AS_GC(op)->_gc_next;
        _Ty_AS_GC(op)->_gc_next = 0;
#endif
        tstate->delete_later = (TyObject *)(tagged_ptr & ~1);
        if (tagged_ptr & 1) {
            _TyObject_GC_TRACK(op);
        }
        /* Call the deallocator directly.  This used to try to
         * fool Ty_DECREF into calling it indirectly, but
         * Ty_DECREF was already called on this object, and in
         * assorted non-release builds calling Ty_DECREF again ends
         * up distorting allocation statistics.
         */
        _TyObject_ASSERT(op, Ty_REFCNT(op) == 0);
        (*dealloc)(op);
    }
}

void _Ty_NO_RETURN
_TyObject_AssertFailed(TyObject *obj, const char *expr, const char *msg,
                       const char *file, int line, const char *function)
{
    fprintf(stderr, "%s:%d: ", file, line);
    if (function) {
        fprintf(stderr, "%s: ", function);
    }
    fflush(stderr);

    if (expr) {
        fprintf(stderr, "Assertion \"%s\" failed", expr);
    }
    else {
        fprintf(stderr, "Assertion failed");
    }
    fflush(stderr);

    if (msg) {
        fprintf(stderr, ": %s", msg);
    }
    fprintf(stderr, "\n");
    fflush(stderr);

    if (_TyObject_IsFreed(obj)) {
        /* It seems like the object memory has been freed:
           don't access it to prevent a segmentation fault. */
        fprintf(stderr, "<object at %p is freed>\n", obj);
        fflush(stderr);
    }
    else {
        /* Display the traceback where the object has been allocated.
           Do it before dumping repr(obj), since repr() is more likely
           to crash than dumping the traceback. */
        TyTypeObject *type = Ty_TYPE(obj);
        const size_t presize = _TyType_PreHeaderSize(type);
        void *ptr = (void *)((char *)obj - presize);
        _TyMem_DumpTraceback(fileno(stderr), ptr);

        /* This might succeed or fail, but we're about to abort, so at least
           try to provide any extra info we can: */
        _TyObject_Dump(obj);

        fprintf(stderr, "\n");
        fflush(stderr);
    }

    Ty_FatalError("_TyObject_AssertFailed");
}


/*
When deallocating a container object, it's possible to trigger an unbounded
chain of deallocations, as each Ty_DECREF in turn drops the refcount on "the
next" object in the chain to 0.  This can easily lead to stack overflows.
To avoid that, if the C stack is nearing its limit, instead of calling
dealloc on the object, it is added to a queue to be freed later when the
stack is shallower */
void
_Ty_Dealloc(TyObject *op)
{
    TyTypeObject *type = Ty_TYPE(op);
    unsigned long gc_flag = type->tp_flags & Ty_TPFLAGS_HAVE_GC;
    destructor dealloc = type->tp_dealloc;
    TyThreadState *tstate = _TyThreadState_GET();
    intptr_t margin = _Ty_RecursionLimit_GetMargin(tstate);
    if (margin < 2 && gc_flag) {
        _PyTrash_thread_deposit_object(tstate, (TyObject *)op);
        return;
    }
#ifdef Ty_DEBUG
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_STACKREF_DEBUG)
    /* This assertion doesn't hold for the free-threading build, as
     * PyStackRef_CLOSE_SPECIALIZED is not implemented */
    assert(tstate->current_frame == NULL || tstate->current_frame->stackpointer != NULL);
#endif
    TyObject *old_exc = tstate != NULL ? tstate->current_exception : NULL;
    // Keep the old exception type alive to prevent undefined behavior
    // on (tstate->curexc_type != old_exc_type) below
    Ty_XINCREF(old_exc);
    // Make sure that type->tp_name remains valid
    Ty_INCREF(type);
#endif

#ifdef Ty_TRACE_REFS
    _Ty_ForgetReference(op);
#endif
    _PyReftracerTrack(op, PyRefTracer_DESTROY);
    (*dealloc)(op);

#ifdef Ty_DEBUG
    // gh-89373: The tp_dealloc function must leave the current exception
    // unchanged.
    if (tstate != NULL && tstate->current_exception != old_exc) {
        const char *err;
        if (old_exc == NULL) {
            err = "Deallocator of type '%s' raised an exception";
        }
        else if (tstate->current_exception == NULL) {
            err = "Deallocator of type '%s' cleared the current exception";
        }
        else {
            // It can happen if dealloc() normalized the current exception.
            // A deallocator function must not change the current exception,
            // not even normalize it.
            err = "Deallocator of type '%s' overrode the current exception";
        }
        _Ty_FatalErrorFormat(__func__, err, type->tp_name);
    }
    Ty_XDECREF(old_exc);
    Ty_DECREF(type);
#endif
    if (tstate->delete_later && margin >= 4 && gc_flag) {
        _PyTrash_thread_destroy_chain(tstate);
    }
}


TyObject **
PyObject_GET_WEAKREFS_LISTPTR(TyObject *op)
{
    return _TyObject_GET_WEAKREFS_LISTPTR(op);
}


#undef Ty_NewRef
#undef Ty_XNewRef

// Export Ty_NewRef() and Ty_XNewRef() as regular functions for the stable ABI.
TyObject*
Ty_NewRef(TyObject *obj)
{
    return _Ty_NewRef(obj);
}

TyObject*
Ty_XNewRef(TyObject *obj)
{
    return _Ty_XNewRef(obj);
}

#undef Ty_Is
#undef Ty_IsNone
#undef Ty_IsTrue
#undef Ty_IsFalse

// Export Ty_Is(), Ty_IsNone(), Ty_IsTrue(), Ty_IsFalse() as regular functions
// for the stable ABI.
int Ty_Is(TyObject *x, TyObject *y)
{
    return (x == y);
}

int Ty_IsNone(TyObject *x)
{
    return Ty_Is(x, Ty_None);
}

int Ty_IsTrue(TyObject *x)
{
    return Ty_Is(x, Ty_True);
}

int Ty_IsFalse(TyObject *x)
{
    return Ty_Is(x, Ty_False);
}


// Ty_SET_REFCNT() implementation for stable ABI
void
_Ty_SetRefcnt(TyObject *ob, Ty_ssize_t refcnt)
{
    Ty_SET_REFCNT(ob, refcnt);
}

int PyRefTracer_SetTracer(PyRefTracer tracer, void *data) {
    _Ty_AssertHoldsTstate();
    _PyRuntime.ref_tracer.tracer_func = tracer;
    _PyRuntime.ref_tracer.tracer_data = data;
    return 0;
}

PyRefTracer PyRefTracer_GetTracer(void** data) {
    _Ty_AssertHoldsTstate();
    if (data != NULL) {
        *data = _PyRuntime.ref_tracer.tracer_data;
    }
    return _PyRuntime.ref_tracer.tracer_func;
}



static TyObject* constants[] = {
    &_Ty_NoneStruct,                   // Ty_CONSTANT_NONE
    (TyObject*)(&_Ty_FalseStruct),     // Ty_CONSTANT_FALSE
    (TyObject*)(&_Ty_TrueStruct),      // Ty_CONSTANT_TRUE
    &_Ty_EllipsisObject,               // Ty_CONSTANT_ELLIPSIS
    &_Ty_NotImplementedStruct,         // Ty_CONSTANT_NOT_IMPLEMENTED
    NULL,  // Ty_CONSTANT_ZERO
    NULL,  // Ty_CONSTANT_ONE
    NULL,  // Ty_CONSTANT_EMPTY_STR
    NULL,  // Ty_CONSTANT_EMPTY_BYTES
    NULL,  // Ty_CONSTANT_EMPTY_TUPLE
};

void
_Ty_GetConstant_Init(void)
{
    constants[Ty_CONSTANT_ZERO] = _TyLong_GetZero();
    constants[Ty_CONSTANT_ONE] = _TyLong_GetOne();
    constants[Ty_CONSTANT_EMPTY_STR] = TyUnicode_New(0, 0);
    constants[Ty_CONSTANT_EMPTY_BYTES] = TyBytes_FromStringAndSize(NULL, 0);
    constants[Ty_CONSTANT_EMPTY_TUPLE] = TyTuple_New(0);
#ifndef NDEBUG
    for (size_t i=0; i < Ty_ARRAY_LENGTH(constants); i++) {
        assert(constants[i] != NULL);
        assert(_Ty_IsImmortal(constants[i]));
    }
#endif
}

TyObject*
Ty_GetConstant(unsigned int constant_id)
{
    if (constant_id < Ty_ARRAY_LENGTH(constants)) {
        return constants[constant_id];
    }
    else {
        TyErr_BadInternalCall();
        return NULL;
    }
}


TyObject*
Ty_GetConstantBorrowed(unsigned int constant_id)
{
    // All constants are immortal
    return Ty_GetConstant(constant_id);
}


// Ty_TYPE() implementation for the stable ABI
#undef Ty_TYPE
TyTypeObject*
Ty_TYPE(TyObject *ob)
{
    return _Ty_TYPE(ob);
}


// Ty_REFCNT() implementation for the stable ABI
#undef Ty_REFCNT
Ty_ssize_t
Ty_REFCNT(TyObject *ob)
{
    return _Ty_REFCNT(ob);
}

int
PyUnstable_IsImmortal(TyObject *op)
{
    /* Checking a reference count requires a thread state */
    _Ty_AssertHoldsTstate();
    assert(op != NULL);
    return _Ty_IsImmortal(op);
}

int
PyUnstable_Object_IsUniquelyReferenced(TyObject *op)
{
    _Ty_AssertHoldsTstate();
    assert(op != NULL);
    return _TyObject_IsUniquelyReferenced(op);
}
