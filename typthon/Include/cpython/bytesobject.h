#ifndef Ty_CPYTHON_BYTESOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct {
    PyObject_VAR_HEAD
    Ty_DEPRECATED(3.11) Ty_hash_t ob_shash;
    char ob_sval[1];

    /* Invariants:
     *     ob_sval contains space for 'ob_size+1' elements.
     *     ob_sval[ob_size] == 0.
     *     ob_shash is the hash of the byte string or -1 if not computed yet.
     */
} PyBytesObject;

PyAPI_FUNC(int) _TyBytes_Resize(TyObject **, Ty_ssize_t);

/* Macros and static inline functions, trading safety for speed */
#define _TyBytes_CAST(op) \
    (assert(TyBytes_Check(op)), _Py_CAST(PyBytesObject*, op))

static inline char* TyBytes_AS_STRING(TyObject *op)
{
    return _TyBytes_CAST(op)->ob_sval;
}
#define TyBytes_AS_STRING(op) TyBytes_AS_STRING(_TyObject_CAST(op))

static inline Ty_ssize_t TyBytes_GET_SIZE(TyObject *op) {
    PyBytesObject *self = _TyBytes_CAST(op);
    return Ty_SIZE(self);
}
#define TyBytes_GET_SIZE(self) TyBytes_GET_SIZE(_TyObject_CAST(self))

PyAPI_FUNC(TyObject*) TyBytes_Join(TyObject *sep, TyObject *iterable);

// Deprecated alias kept for backward compatibility
Ty_DEPRECATED(3.14) static inline TyObject*
_TyBytes_Join(TyObject *sep, TyObject *iterable)
{
    return TyBytes_Join(sep, iterable);
}
