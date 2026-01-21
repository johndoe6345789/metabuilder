#ifndef Ty_CPYTHON_LISTOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct {
    PyObject_VAR_HEAD
    /* Vector of pointers to list elements.  list[0] is ob_item[0], etc. */
    TyObject **ob_item;

    /* ob_item contains space for 'allocated' elements.  The number
     * currently in use is ob_size.
     * Invariants:
     *     0 <= ob_size <= allocated
     *     len(list) == ob_size
     *     ob_item == NULL implies ob_size == allocated == 0
     * list.sort() temporarily sets allocated to -1 to detect mutations.
     *
     * Items must normally not be NULL, except during construction when
     * the list is not yet visible outside the function that builds it.
     */
    Ty_ssize_t allocated;
} PyListObject;

/* Cast argument to PyListObject* type. */
#define _TyList_CAST(op) \
    (assert(TyList_Check(op)), _Py_CAST(PyListObject*, (op)))

// Macros and static inline functions, trading safety for speed

static inline Ty_ssize_t TyList_GET_SIZE(TyObject *op) {
    PyListObject *list = _TyList_CAST(op);
#ifdef Ty_GIL_DISABLED
    return _Ty_atomic_load_ssize_relaxed(&(_PyVarObject_CAST(list)->ob_size));
#else
    return Ty_SIZE(list);
#endif
}
#define TyList_GET_SIZE(op) TyList_GET_SIZE(_TyObject_CAST(op))

#define TyList_GET_ITEM(op, index) (_TyList_CAST(op)->ob_item[(index)])

static inline void
TyList_SET_ITEM(TyObject *op, Ty_ssize_t index, TyObject *value) {
    PyListObject *list = _TyList_CAST(op);
    assert(0 <= index);
    assert(index < list->allocated);
    list->ob_item[index] = value;
}
#define TyList_SET_ITEM(op, index, value) \
    TyList_SET_ITEM(_TyObject_CAST(op), (index), _TyObject_CAST(value))

PyAPI_FUNC(int) TyList_Extend(TyObject *self, TyObject *iterable);
PyAPI_FUNC(int) TyList_Clear(TyObject *self);
