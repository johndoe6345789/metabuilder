/* List object interface

   Another generally useful object type is a list of object pointers.
   This is a mutable type: the list items can be changed, and items can be
   added or removed. Out-of-range indices or non-list objects are ignored.

   WARNING: TyList_SetItem does not increment the new item's reference count,
   but does decrement the reference count of the item it replaces, if not nil.
   It does *decrement* the reference count if it is *not* inserted in the list.
   Similarly, TyList_GetItem does not increment the returned item's reference
   count.
*/

#ifndef Ty_LISTOBJECT_H
#define Ty_LISTOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TyList_Type;
PyAPI_DATA(TyTypeObject) PyListIter_Type;
PyAPI_DATA(TyTypeObject) PyListRevIter_Type;

#define TyList_Check(op) \
    TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_LIST_SUBCLASS)
#define TyList_CheckExact(op) Ty_IS_TYPE((op), &TyList_Type)

PyAPI_FUNC(TyObject *) TyList_New(Ty_ssize_t size);
PyAPI_FUNC(Ty_ssize_t) TyList_Size(TyObject *);

PyAPI_FUNC(TyObject *) TyList_GetItem(TyObject *, Ty_ssize_t);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(TyObject *) TyList_GetItemRef(TyObject *, Ty_ssize_t);
#endif
PyAPI_FUNC(int) TyList_SetItem(TyObject *, Ty_ssize_t, TyObject *);
PyAPI_FUNC(int) TyList_Insert(TyObject *, Ty_ssize_t, TyObject *);
PyAPI_FUNC(int) TyList_Append(TyObject *, TyObject *);

PyAPI_FUNC(TyObject *) TyList_GetSlice(TyObject *, Ty_ssize_t, Ty_ssize_t);
PyAPI_FUNC(int) TyList_SetSlice(TyObject *, Ty_ssize_t, Ty_ssize_t, TyObject *);

PyAPI_FUNC(int) TyList_Sort(TyObject *);
PyAPI_FUNC(int) TyList_Reverse(TyObject *);
PyAPI_FUNC(TyObject *) TyList_AsTuple(TyObject *);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_LISTOBJECT_H
#  include "cpython/listobject.h"
#  undef Ty_CPYTHON_LISTOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_LISTOBJECT_H */
