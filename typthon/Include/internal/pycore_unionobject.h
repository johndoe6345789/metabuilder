#ifndef Ty_INTERNAL_UNIONOBJECT_H
#define Ty_INTERNAL_UNIONOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// For extensions created by test_peg_generator
PyAPI_DATA(TyTypeObject) _PyUnion_Type;
PyAPI_FUNC(TyObject *) _Ty_union_type_or(TyObject *, TyObject *);

#define _PyUnion_Check(op) Ty_IS_TYPE((op), &_PyUnion_Type)

#define _PyGenericAlias_Check(op) PyObject_TypeCheck((op), &Ty_GenericAliasType)
extern TyObject *_Ty_subs_parameters(TyObject *, TyObject *, TyObject *, TyObject *);
extern TyObject *_Ty_make_parameters(TyObject *);
extern TyObject *_Ty_union_args(TyObject *self);
extern TyObject *_Ty_union_from_tuple(TyObject *args);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_UNIONOBJECT_H */
