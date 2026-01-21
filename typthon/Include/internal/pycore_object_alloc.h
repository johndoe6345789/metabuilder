#ifndef Ty_INTERNAL_OBJECT_ALLOC_H
#define Ty_INTERNAL_OBJECT_ALLOC_H

#include "pycore_object.h"      // _TyType_HasFeature()
#include "pycore_pystate.h"     // _TyThreadState_GET()
#include "pycore_tstate.h"      // _PyThreadStateImpl

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef Ty_GIL_DISABLED
static inline mi_heap_t *
_TyObject_GetAllocationHeap(_PyThreadStateImpl *tstate, TyTypeObject *tp)
{
    struct _mimalloc_thread_state *m = &tstate->mimalloc;
    if (_TyType_HasFeature(tp, Ty_TPFLAGS_PREHEADER)) {
        return &m->heaps[_Ty_MIMALLOC_HEAP_GC_PRE];
    }
    else if (_TyType_IS_GC(tp)) {
        return &m->heaps[_Ty_MIMALLOC_HEAP_GC];
    }
    else {
        return &m->heaps[_Ty_MIMALLOC_HEAP_OBJECT];
    }
}
#endif

// Sets the heap used for PyObject_Malloc(), PyObject_Realloc(), etc. calls in
// Ty_GIL_DISABLED builds. We use different heaps depending on if the object
// supports GC and if it has a pre-header. We smuggle the choice of heap
// through the _mimalloc_thread_state. In the default build, this simply
// calls PyObject_Malloc().
static inline void *
_TyObject_MallocWithType(TyTypeObject *tp, size_t size)
{
#ifdef Ty_GIL_DISABLED
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
    struct _mimalloc_thread_state *m = &tstate->mimalloc;
    m->current_object_heap = _TyObject_GetAllocationHeap(tstate, tp);
#endif
    void *mem = PyObject_Malloc(size);
#ifdef Ty_GIL_DISABLED
    m->current_object_heap = &m->heaps[_Ty_MIMALLOC_HEAP_OBJECT];
#endif
    return mem;
}

static inline void *
_TyObject_ReallocWithType(TyTypeObject *tp, void *ptr, size_t size)
{
#ifdef Ty_GIL_DISABLED
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
    struct _mimalloc_thread_state *m = &tstate->mimalloc;
    m->current_object_heap = _TyObject_GetAllocationHeap(tstate, tp);
#endif
    void *mem = PyObject_Realloc(ptr, size);
#ifdef Ty_GIL_DISABLED
    m->current_object_heap = &m->heaps[_Ty_MIMALLOC_HEAP_OBJECT];
#endif
    return mem;
}

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_OBJECT_ALLOC_H
