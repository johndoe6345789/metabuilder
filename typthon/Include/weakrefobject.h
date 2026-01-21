/* Weak references objects for Python. */

#ifndef Ty_WEAKREFOBJECT_H
#define Ty_WEAKREFOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

typedef struct _PyWeakReference PyWeakReference;

PyAPI_DATA(TyTypeObject) _TyWeakref_RefType;
PyAPI_DATA(TyTypeObject) _TyWeakref_ProxyType;
PyAPI_DATA(TyTypeObject) _TyWeakref_CallableProxyType;

#define PyWeakref_CheckRef(op) PyObject_TypeCheck((op), &_TyWeakref_RefType)
#define PyWeakref_CheckRefExact(op) \
        Ty_IS_TYPE((op), &_TyWeakref_RefType)
#define PyWeakref_CheckProxy(op) \
        (Ty_IS_TYPE((op), &_TyWeakref_ProxyType) \
         || Ty_IS_TYPE((op), &_TyWeakref_CallableProxyType))

#define PyWeakref_Check(op) \
        (PyWeakref_CheckRef(op) || PyWeakref_CheckProxy(op))


PyAPI_FUNC(TyObject *) PyWeakref_NewRef(TyObject *ob,
                                        TyObject *callback);
PyAPI_FUNC(TyObject *) PyWeakref_NewProxy(TyObject *ob,
                                          TyObject *callback);
Ty_DEPRECATED(3.13) PyAPI_FUNC(TyObject *) PyWeakref_GetObject(TyObject *ref);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030D0000
PyAPI_FUNC(int) PyWeakref_GetRef(TyObject *ref, TyObject **pobj);
#endif


#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_WEAKREFOBJECT_H
#  include "cpython/weakrefobject.h"
#  undef Ty_CPYTHON_WEAKREFOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_WEAKREFOBJECT_H */
