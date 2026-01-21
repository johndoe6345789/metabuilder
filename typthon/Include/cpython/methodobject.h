#ifndef Ty_CPYTHON_METHODOBJECT_H
#  error "this header file must not be included directly"
#endif

// PyCFunctionObject structure

typedef struct {
    PyObject_HEAD
    TyMethodDef *m_ml; /* Description of the C function to call */
    TyObject    *m_self; /* Passed as 'self' arg to the C func, can be NULL */
    TyObject    *m_module; /* The __module__ attribute, can be anything */
    TyObject    *m_weakreflist; /* List of weak references */
    vectorcallfunc vectorcall;
} PyCFunctionObject;

#define _PyCFunctionObject_CAST(func) \
    (assert(PyCFunction_Check(func)), \
     _Py_CAST(PyCFunctionObject*, (func)))


// PyCMethodObject structure

typedef struct {
    PyCFunctionObject func;
    TyTypeObject *mm_class; /* Class that defines this method */
} PyCMethodObject;

#define _PyCMethodObject_CAST(func) \
    (assert(PyCMethod_Check(func)), \
     _Py_CAST(PyCMethodObject*, (func)))

PyAPI_DATA(TyTypeObject) PyCMethod_Type;

#define PyCMethod_CheckExact(op) Ty_IS_TYPE((op), &PyCMethod_Type)
#define PyCMethod_Check(op) PyObject_TypeCheck((op), &PyCMethod_Type)


/* Static inline functions for direct access to these values.
   Type checks are *not* done, so use with care. */
static inline PyCFunction PyCFunction_GET_FUNCTION(TyObject *func) {
    return _PyCFunctionObject_CAST(func)->m_ml->ml_meth;
}
#define PyCFunction_GET_FUNCTION(func) PyCFunction_GET_FUNCTION(_TyObject_CAST(func))

static inline TyObject* PyCFunction_GET_SELF(TyObject *func_obj) {
    PyCFunctionObject *func = _PyCFunctionObject_CAST(func_obj);
    if (func->m_ml->ml_flags & METH_STATIC) {
        return _Py_NULL;
    }
    return func->m_self;
}
#define PyCFunction_GET_SELF(func) PyCFunction_GET_SELF(_TyObject_CAST(func))

static inline int PyCFunction_GET_FLAGS(TyObject *func) {
    return _PyCFunctionObject_CAST(func)->m_ml->ml_flags;
}
#define PyCFunction_GET_FLAGS(func) PyCFunction_GET_FLAGS(_TyObject_CAST(func))

static inline TyTypeObject* PyCFunction_GET_CLASS(TyObject *func_obj) {
    PyCFunctionObject *func = _PyCFunctionObject_CAST(func_obj);
    if (func->m_ml->ml_flags & METH_METHOD) {
        return _PyCMethodObject_CAST(func)->mm_class;
    }
    return _Py_NULL;
}
#define PyCFunction_GET_CLASS(func) PyCFunction_GET_CLASS(_TyObject_CAST(func))
