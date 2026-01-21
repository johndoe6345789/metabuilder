#ifndef Ty_INTERNAL_OBJECT_DEFERRED_H
#define Ty_INTERNAL_OBJECT_DEFERRED_H

#ifdef __cplusplus
extern "C" {
#endif

#include "pycore_gc.h"

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Mark an object as supporting deferred reference counting. This is a no-op
// in the default (with GIL) build. Objects that use deferred reference
// counting should be tracked by the GC so that they are eventually collected.
extern void _TyObject_SetDeferredRefcount(TyObject *op);

static inline int
_TyObject_HasDeferredRefcount(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    return _TyObject_HAS_GC_BITS(op, _TyGC_BITS_DEFERRED);
#else
    return 0;
#endif
}

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_OBJECT_DEFERRED_H
