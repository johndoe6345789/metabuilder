/* Cell object interface */

#ifndef Ty_LIMITED_API
#ifndef Ty_CELLOBJECT_H
#define Ty_CELLOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    PyObject_HEAD
    /* Content of the cell or NULL when empty */
    TyObject *ob_ref;
} PyCellObject;

PyAPI_DATA(TyTypeObject) TyCell_Type;

#define TyCell_Check(op) Ty_IS_TYPE((op), &TyCell_Type)

PyAPI_FUNC(TyObject *) TyCell_New(TyObject *);
PyAPI_FUNC(TyObject *) TyCell_Get(TyObject *);
PyAPI_FUNC(int) TyCell_Set(TyObject *, TyObject *);

static inline TyObject* TyCell_GET(TyObject *op) {
    TyObject *res;
    PyCellObject *cell;
    assert(TyCell_Check(op));
    cell = _Py_CAST(PyCellObject*, op);
    Ty_BEGIN_CRITICAL_SECTION(cell);
    res = cell->ob_ref;
    Ty_END_CRITICAL_SECTION();
    return res;
}
#define TyCell_GET(op) TyCell_GET(_TyObject_CAST(op))

static inline void TyCell_SET(TyObject *op, TyObject *value) {
    PyCellObject *cell;
    assert(TyCell_Check(op));
    cell = _Py_CAST(PyCellObject*, op);
    Ty_BEGIN_CRITICAL_SECTION(cell);
    cell->ob_ref = value;
    Ty_END_CRITICAL_SECTION();
}
#define TyCell_SET(op, value) TyCell_SET(_TyObject_CAST(op), (value))

#ifdef __cplusplus
}
#endif
#endif /* !Ty_TUPLEOBJECT_H */
#endif /* Ty_LIMITED_API */
