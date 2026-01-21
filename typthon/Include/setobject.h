/* Set object interface */

#ifndef Ty_SETOBJECT_H
#define Ty_SETOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TySet_Type;
PyAPI_DATA(TyTypeObject) TyFrozenSet_Type;
PyAPI_DATA(TyTypeObject) PySetIter_Type;

PyAPI_FUNC(TyObject *) TySet_New(TyObject *);
PyAPI_FUNC(TyObject *) TyFrozenSet_New(TyObject *);

PyAPI_FUNC(int) TySet_Add(TyObject *set, TyObject *key);
PyAPI_FUNC(int) TySet_Clear(TyObject *set);
PyAPI_FUNC(int) TySet_Contains(TyObject *anyset, TyObject *key);
PyAPI_FUNC(int) TySet_Discard(TyObject *set, TyObject *key);
PyAPI_FUNC(TyObject *) TySet_Pop(TyObject *set);
PyAPI_FUNC(Ty_ssize_t) TySet_Size(TyObject *anyset);

#define TyFrozenSet_CheckExact(ob) Ty_IS_TYPE((ob), &TyFrozenSet_Type)
#define TyFrozenSet_Check(ob) \
    (Ty_IS_TYPE((ob), &TyFrozenSet_Type) || \
      TyType_IsSubtype(Ty_TYPE(ob), &TyFrozenSet_Type))

#define PyAnySet_CheckExact(ob) \
    (Ty_IS_TYPE((ob), &TySet_Type) || Ty_IS_TYPE((ob), &TyFrozenSet_Type))
#define PyAnySet_Check(ob) \
    (Ty_IS_TYPE((ob), &TySet_Type) || Ty_IS_TYPE((ob), &TyFrozenSet_Type) || \
      TyType_IsSubtype(Ty_TYPE(ob), &TySet_Type) || \
      TyType_IsSubtype(Ty_TYPE(ob), &TyFrozenSet_Type))

#define TySet_CheckExact(op) Ty_IS_TYPE(op, &TySet_Type)
#define TySet_Check(ob) \
    (Ty_IS_TYPE((ob), &TySet_Type) || \
    TyType_IsSubtype(Ty_TYPE(ob), &TySet_Type))

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_SETOBJECT_H
#  include "cpython/setobject.h"
#  undef Ty_CPYTHON_SETOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_SETOBJECT_H */
