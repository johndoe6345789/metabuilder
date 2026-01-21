#ifndef Ty_INTERNAL_GENOBJECT_H
#define Ty_INTERNAL_GENOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_interpframe_structs.h" // _PyGenObject

#include <stddef.h>               // offsetof()


static inline
PyGenObject *_TyGen_GetGeneratorFromFrame(_PyInterpreterFrame *frame)
{
    assert(frame->owner == FRAME_OWNED_BY_GENERATOR);
    size_t offset_in_gen = offsetof(PyGenObject, gi_iframe);
    return (PyGenObject *)(((char *)frame) - offset_in_gen);
}

PyAPI_FUNC(TyObject *)_TyGen_yf(PyGenObject *);
extern void _TyGen_Finalize(TyObject *self);

// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyGen_SetStopIterationValue(TyObject *);

// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyGen_FetchStopIterationValue(TyObject **);

PyAPI_FUNC(TyObject *)_PyCoro_GetAwaitableIter(TyObject *o);
extern TyObject *_PyAsyncGenValueWrapperNew(TyThreadState *state, TyObject *);

extern TyTypeObject _PyCoroWrapper_Type;
extern TyTypeObject _PyAsyncGenWrappedValue_Type;
extern TyTypeObject _PyAsyncGenAThrow_Type;

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_GENOBJECT_H */
