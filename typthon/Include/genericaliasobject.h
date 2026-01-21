// Implementation of PEP 585: support list[int] etc.
#ifndef Ty_GENERICALIASOBJECT_H
#define Ty_GENERICALIASOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(TyObject *) Ty_GenericAlias(TyObject *, TyObject *);
PyAPI_DATA(TyTypeObject) Ty_GenericAliasType;

#ifdef __cplusplus
}
#endif
#endif /* !Ty_GENERICALIASOBJECT_H */
