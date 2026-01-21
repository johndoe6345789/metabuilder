
/* Range object interface */

#ifndef Ty_RANGEOBJECT_H
#define Ty_RANGEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/*
A range object represents an integer range.  This is an immutable object;
a range cannot change its value after creation.

Range objects behave like the corresponding tuple objects except that
they are represented by a start, stop, and step datamembers.
*/

PyAPI_DATA(TyTypeObject) TyRange_Type;
PyAPI_DATA(TyTypeObject) PyRangeIter_Type;
PyAPI_DATA(TyTypeObject) PyLongRangeIter_Type;

#define TyRange_Check(op) Ty_IS_TYPE((op), &TyRange_Type)

#ifdef __cplusplus
}
#endif
#endif /* !Ty_RANGEOBJECT_H */
