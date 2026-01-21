#ifndef Ty_INTERNAL_FREELIST_H
#define Ty_INTERNAL_FREELIST_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_freelist_state.h"      // struct _Ty_freelists
#include "pycore_interp_structs.h"      // TyInterpreterState
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_STORE_PTR_RELAXED()
#include "pycore_pystate.h"             // _TyThreadState_GET
#include "pycore_stats.h"               // OBJECT_STAT_INC

static inline struct _Ty_freelists *
_Ty_freelists_GET(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    _Ty_EnsureTstateNotNULL(tstate);
#endif

#ifdef Ty_GIL_DISABLED
    return &((_PyThreadStateImpl*)tstate)->freelists;
#else
    return &tstate->interp->object_state.freelists;
#endif
}

// Pushes `op` to the freelist, calls `freefunc` if the freelist is full
#define _Ty_FREELIST_FREE(NAME, op, freefunc) \
    _PyFreeList_Free(&_Ty_freelists_GET()->NAME, _TyObject_CAST(op), \
                     Ty_ ## NAME ## _MAXFREELIST, freefunc)
// Pushes `op` to the freelist, returns 1 if successful, 0 if the freelist is full
#define _Ty_FREELIST_PUSH(NAME, op, limit) \
    _PyFreeList_Push(&_Ty_freelists_GET()->NAME, _TyObject_CAST(op), limit)

// Pops a TyObject from the freelist, returns NULL if the freelist is empty.
#define _Ty_FREELIST_POP(TYPE, NAME) \
    _Py_CAST(TYPE*, _PyFreeList_Pop(&_Ty_freelists_GET()->NAME))

// Pops a non-TyObject data structure from the freelist, returns NULL if the
// freelist is empty.
#define _Ty_FREELIST_POP_MEM(NAME) \
    _PyFreeList_PopMem(&_Ty_freelists_GET()->NAME)

#define _Ty_FREELIST_SIZE(NAME) (int)((_Ty_freelists_GET()->NAME).size)

static inline int
_PyFreeList_Push(struct _Ty_freelist *fl, void *obj, Ty_ssize_t maxsize)
{
    if (fl->size < maxsize && fl->size >= 0) {
        FT_ATOMIC_STORE_PTR_RELAXED(*(void **)obj, fl->freelist);
        fl->freelist = obj;
        fl->size++;
        OBJECT_STAT_INC(to_freelist);
        return 1;
    }
    return 0;
}

static inline void
_PyFreeList_Free(struct _Ty_freelist *fl, void *obj, Ty_ssize_t maxsize,
                 freefunc dofree)
{
    if (!_PyFreeList_Push(fl, obj, maxsize)) {
        dofree(obj);
    }
}

static inline void *
_PyFreeList_PopNoStats(struct _Ty_freelist *fl)
{
    void *obj = fl->freelist;
    if (obj != NULL) {
        assert(fl->size > 0);
        fl->freelist = *(void **)obj;
        fl->size--;
    }
    return obj;
}

static inline TyObject *
_PyFreeList_Pop(struct _Ty_freelist *fl)
{
    TyObject *op = _PyFreeList_PopNoStats(fl);
    if (op != NULL) {
        OBJECT_STAT_INC(from_freelist);
        _Ty_NewReference(op);
    }
    return op;
}

static inline void *
_PyFreeList_PopMem(struct _Ty_freelist *fl)
{
    void *op = _PyFreeList_PopNoStats(fl);
    if (op != NULL) {
        OBJECT_STAT_INC(from_freelist);
    }
    return op;
}

extern void _TyObject_ClearFreeLists(struct _Ty_freelists *freelists, int is_finalization);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_FREELIST_H */
