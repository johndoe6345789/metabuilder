#ifndef Ty_SLICEOBJECT_H
#define Ty_SLICEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* The unique ellipsis object "..." */

PyAPI_DATA(TyObject) _Ty_EllipsisObject; /* Don't use this directly */

#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030D0000
#  define Ty_Ellipsis Ty_GetConstantBorrowed(Ty_CONSTANT_ELLIPSIS)
#else
#  define Ty_Ellipsis (&_Ty_EllipsisObject)
#endif

/* Slice object interface */

/*

A slice object containing start, stop, and step data members (the
names are from range).  After much talk with Guido, it was decided to
let these be any arbitrary python type.  Ty_None stands for omitted values.
*/
#ifndef Ty_LIMITED_API
typedef struct {
    PyObject_HEAD
    TyObject *start, *stop, *step;      /* not NULL */
} PySliceObject;
#endif

PyAPI_DATA(TyTypeObject) TySlice_Type;
PyAPI_DATA(TyTypeObject) PyEllipsis_Type;

#define TySlice_Check(op) Ty_IS_TYPE((op), &TySlice_Type)

PyAPI_FUNC(TyObject *) TySlice_New(TyObject* start, TyObject* stop,
                                  TyObject* step);
#ifndef Ty_LIMITED_API
PyAPI_FUNC(TyObject *) _PySlice_FromIndices(Ty_ssize_t start, Ty_ssize_t stop);
PyAPI_FUNC(int) _PySlice_GetLongIndices(PySliceObject *self, TyObject *length,
                                 TyObject **start_ptr, TyObject **stop_ptr,
                                 TyObject **step_ptr);
#endif
PyAPI_FUNC(int) TySlice_GetIndices(TyObject *r, Ty_ssize_t length,
                                  Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t *step);
Ty_DEPRECATED(3.7)
PyAPI_FUNC(int) TySlice_GetIndicesEx(TyObject *r, Ty_ssize_t length,
                                     Ty_ssize_t *start, Ty_ssize_t *stop,
                                     Ty_ssize_t *step,
                                     Ty_ssize_t *slicelength);

#if !defined(Ty_LIMITED_API) || (Ty_LIMITED_API+0 >= 0x03050400 && Ty_LIMITED_API+0 < 0x03060000) || Ty_LIMITED_API+0 >= 0x03060100
#define TySlice_GetIndicesEx(slice, length, start, stop, step, slicelen) (  \
    TySlice_Unpack((slice), (start), (stop), (step)) < 0 ?                  \
    ((*(slicelen) = 0), -1) :                                               \
    ((*(slicelen) = TySlice_AdjustIndices((length), (start), (stop), *(step))), \
     0))
PyAPI_FUNC(int) TySlice_Unpack(TyObject *slice,
                               Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t *step);
PyAPI_FUNC(Ty_ssize_t) TySlice_AdjustIndices(Ty_ssize_t length,
                                             Ty_ssize_t *start, Ty_ssize_t *stop,
                                             Ty_ssize_t step);
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_SLICEOBJECT_H */
