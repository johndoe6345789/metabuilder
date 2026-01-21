#ifndef Ty_INTERNAL_OBJECT_STATE_H
#define Ty_INTERNAL_OBJECT_STATE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_freelist_state.h"  // _Ty_freelists
#include "pycore_hashtable.h"       // _Ty_hashtable_t


/* Reference tracer state */
struct _reftracer_runtime_state {
    PyRefTracer tracer_func;
    void* tracer_data;
};


struct _py_object_runtime_state {
#ifdef Ty_REF_DEBUG
    Ty_ssize_t interpreter_leaks;
#endif
    int _not_used;
};

struct _py_object_state {
#if !defined(Ty_GIL_DISABLED)
    struct _Ty_freelists freelists;
#endif
#ifdef Ty_REF_DEBUG
    Ty_ssize_t reftotal;
#endif
#ifdef Ty_TRACE_REFS
    // Hash table storing all objects. The key is the object pointer
    // (TyObject*) and the value is always the number 1 (as uintptr_t).
    // See _PyRefchain_IsTraced() and _PyRefchain_Trace() functions.
    _Ty_hashtable_t *refchain;
#endif
    int _not_used;
};


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_OBJECT_STATE_H */
