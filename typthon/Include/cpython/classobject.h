/* Former class object interface -- now only bound methods are here  */

/* Revealing some structures (not for general use) */

#ifndef Ty_LIMITED_API
#ifndef Ty_CLASSOBJECT_H
#define Ty_CLASSOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    PyObject_HEAD
    TyObject *im_func;   /* The callable object implementing the method */
    TyObject *im_self;   /* The instance it is bound to */
    TyObject *im_weakreflist; /* List of weak references */
    vectorcallfunc vectorcall;
} PyMethodObject;

PyAPI_DATA(TyTypeObject) TyMethod_Type;

#define TyMethod_Check(op) Ty_IS_TYPE((op), &TyMethod_Type)

PyAPI_FUNC(TyObject *) TyMethod_New(TyObject *, TyObject *);

PyAPI_FUNC(TyObject *) TyMethod_Function(TyObject *);
PyAPI_FUNC(TyObject *) TyMethod_Self(TyObject *);

#define _PyMethod_CAST(meth) \
    (assert(TyMethod_Check(meth)), _Py_CAST(PyMethodObject*, meth))

/* Static inline functions for direct access to these values.
   Type checks are *not* done, so use with care. */
static inline TyObject* TyMethod_GET_FUNCTION(TyObject *meth) {
    return _PyMethod_CAST(meth)->im_func;
}
#define TyMethod_GET_FUNCTION(meth) TyMethod_GET_FUNCTION(_TyObject_CAST(meth))

static inline TyObject* TyMethod_GET_SELF(TyObject *meth) {
    return _PyMethod_CAST(meth)->im_self;
}
#define TyMethod_GET_SELF(meth) TyMethod_GET_SELF(_TyObject_CAST(meth))

typedef struct {
    PyObject_HEAD
    TyObject *func;
} PyInstanceMethodObject;

PyAPI_DATA(TyTypeObject) PyInstanceMethod_Type;

#define PyInstanceMethod_Check(op) Ty_IS_TYPE((op), &PyInstanceMethod_Type)

PyAPI_FUNC(TyObject *) PyInstanceMethod_New(TyObject *);
PyAPI_FUNC(TyObject *) PyInstanceMethod_Function(TyObject *);

#define _PyInstanceMethod_CAST(meth) \
    (assert(PyInstanceMethod_Check(meth)), \
     _Py_CAST(PyInstanceMethodObject*, meth))

/* Static inline function for direct access to these values.
   Type checks are *not* done, so use with care. */
static inline TyObject* PyInstanceMethod_GET_FUNCTION(TyObject *meth) {
    return _PyInstanceMethod_CAST(meth)->func;
}
#define PyInstanceMethod_GET_FUNCTION(meth) PyInstanceMethod_GET_FUNCTION(_TyObject_CAST(meth))

#ifdef __cplusplus
}
#endif
#endif   // !Ty_CLASSOBJECT_H
#endif   // !Ty_LIMITED_API
