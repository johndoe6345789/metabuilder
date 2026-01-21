#ifndef Ty_CPYTHON_TUPLEOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct {
    PyObject_VAR_HEAD
    /* Cached hash.  Initially set to -1. */
    Ty_hash_t ob_hash;
    /* ob_item contains space for 'ob_size' elements.
       Items must normally not be NULL, except during construction when
       the tuple is not yet visible outside the function that builds it. */
    TyObject *ob_item[1];
} PyTupleObject;

PyAPI_FUNC(int) _TyTuple_Resize(TyObject **, Ty_ssize_t);

/* Cast argument to PyTupleObject* type. */
#define _TyTuple_CAST(op) \
    (assert(TyTuple_Check(op)), _Py_CAST(PyTupleObject*, (op)))

// Macros and static inline functions, trading safety for speed

static inline Ty_ssize_t TyTuple_GET_SIZE(TyObject *op) {
    PyTupleObject *tuple = _TyTuple_CAST(op);
    return Ty_SIZE(tuple);
}
#define TyTuple_GET_SIZE(op) TyTuple_GET_SIZE(_TyObject_CAST(op))

#define TyTuple_GET_ITEM(op, index) (_TyTuple_CAST(op)->ob_item[(index)])

/* Function *only* to be used to fill in brand new tuples */
static inline void
TyTuple_SET_ITEM(TyObject *op, Ty_ssize_t index, TyObject *value) {
    PyTupleObject *tuple = _TyTuple_CAST(op);
    assert(0 <= index);
    assert(index < Ty_SIZE(tuple));
    tuple->ob_item[index] = value;
}
#define TyTuple_SET_ITEM(op, index, value) \
    TyTuple_SET_ITEM(_TyObject_CAST(op), (index), _TyObject_CAST(value))
