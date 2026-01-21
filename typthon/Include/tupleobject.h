/* Tuple object interface */

#ifndef Ty_TUPLEOBJECT_H
#define Ty_TUPLEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/*
Another generally useful object type is a tuple of object pointers.
For Python, this is an immutable type.  C code can change the tuple items
(but not their number), and even use tuples as general-purpose arrays of
object references, but in general only brand new tuples should be mutated,
not ones that might already have been exposed to Python code.

*** WARNING *** TyTuple_SetItem does not increment the new item's reference
count, but does decrement the reference count of the item it replaces,
if not nil.  It does *decrement* the reference count if it is *not*
inserted in the tuple.  Similarly, TyTuple_GetItem does not increment the
returned item's reference count.
*/

PyAPI_DATA(TyTypeObject) TyTuple_Type;
PyAPI_DATA(TyTypeObject) PyTupleIter_Type;

#define TyTuple_Check(op) \
                 TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_TUPLE_SUBCLASS)
#define TyTuple_CheckExact(op) Ty_IS_TYPE((op), &TyTuple_Type)

PyAPI_FUNC(TyObject *) TyTuple_New(Ty_ssize_t size);
PyAPI_FUNC(Ty_ssize_t) TyTuple_Size(TyObject *);
PyAPI_FUNC(TyObject *) TyTuple_GetItem(TyObject *, Ty_ssize_t);
PyAPI_FUNC(int) TyTuple_SetItem(TyObject *, Ty_ssize_t, TyObject *);
PyAPI_FUNC(TyObject *) TyTuple_GetSlice(TyObject *, Ty_ssize_t, Ty_ssize_t);
PyAPI_FUNC(TyObject *) TyTuple_Pack(Ty_ssize_t, ...);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_TUPLEOBJECT_H
#  include "cpython/tupleobject.h"
#  undef Ty_CPYTHON_TUPLEOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_TUPLEOBJECT_H */
