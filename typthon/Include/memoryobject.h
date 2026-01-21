/* Memory view object. In Python this is available as "memoryview". */

#ifndef Ty_MEMORYOBJECT_H
#define Ty_MEMORYOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TyMemoryView_Type;

#define TyMemoryView_Check(op) Ty_IS_TYPE((op), &TyMemoryView_Type)

PyAPI_FUNC(TyObject *) TyMemoryView_FromObject(TyObject *base);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyMemoryView_FromMemory(char *mem, Ty_ssize_t size,
                                               int flags);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030b0000
PyAPI_FUNC(TyObject *) TyMemoryView_FromBuffer(const Ty_buffer *info);
#endif
PyAPI_FUNC(TyObject *) TyMemoryView_GetContiguous(TyObject *base,
                                                  int buffertype,
                                                  char order);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_MEMORYOBJECT_H
#  include "cpython/memoryobject.h"
#  undef Ty_CPYTHON_MEMORYOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_MEMORYOBJECT_H */
