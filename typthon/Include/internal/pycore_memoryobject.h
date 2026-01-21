#ifndef Ty_INTERNAL_MEMORYOBJECT_H
#define Ty_INTERNAL_MEMORYOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern TyTypeObject _PyManagedBuffer_Type;

TyObject *
_PyMemoryView_FromBufferProc(TyObject *v, int flags,
                             getbufferproc bufferproc);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_MEMORYOBJECT_H */
