#ifndef Ty_CPYTHON_BYTEARRAYOBJECT_H
#  error "this header file must not be included directly"
#endif

/* Object layout */
typedef struct {
    PyObject_VAR_HEAD
    Ty_ssize_t ob_alloc;   /* How many bytes allocated in ob_bytes */
    char *ob_bytes;        /* Physical backing buffer */
    char *ob_start;        /* Logical start inside ob_bytes */
    Ty_ssize_t ob_exports; /* How many buffer exports */
} PyByteArrayObject;

PyAPI_DATA(char) _PyByteArray_empty_string[];

/* Macros and static inline functions, trading safety for speed */
#define _PyByteArray_CAST(op) \
    (assert(TyByteArray_Check(op)), _Py_CAST(PyByteArrayObject*, op))

static inline char* TyByteArray_AS_STRING(TyObject *op)
{
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (Ty_SIZE(self)) {
        return self->ob_start;
    }
    return _PyByteArray_empty_string;
}
#define TyByteArray_AS_STRING(self) TyByteArray_AS_STRING(_TyObject_CAST(self))

static inline Ty_ssize_t TyByteArray_GET_SIZE(TyObject *op) {
    PyByteArrayObject *self = _PyByteArray_CAST(op);
#ifdef Ty_GIL_DISABLED
    return _Ty_atomic_load_ssize_relaxed(&(_PyVarObject_CAST(self)->ob_size));
#else
    return Ty_SIZE(self);
#endif
}
#define TyByteArray_GET_SIZE(self) TyByteArray_GET_SIZE(_TyObject_CAST(self))
