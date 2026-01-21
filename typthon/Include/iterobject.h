#ifndef Ty_ITEROBJECT_H
#define Ty_ITEROBJECT_H
/* Iterators (the basic kind, over a sequence) */
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TySeqIter_Type;
PyAPI_DATA(TyTypeObject) TyCallIter_Type;

#define TySeqIter_Check(op) Ty_IS_TYPE((op), &TySeqIter_Type)

PyAPI_FUNC(TyObject *) TySeqIter_New(TyObject *);


#define TyCallIter_Check(op) Ty_IS_TYPE((op), &TyCallIter_Type)

PyAPI_FUNC(TyObject *) TyCallIter_New(TyObject *, TyObject *);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_ITEROBJECT_H */

