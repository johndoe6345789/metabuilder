#ifndef Ty_INTERNAL_TYPEVAROBJECT_H
#define Ty_INTERNAL_TYPEVAROBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern TyObject *_Ty_make_typevar(TyObject *, TyObject *, TyObject *);
extern TyObject *_Ty_make_paramspec(TyThreadState *, TyObject *);
extern TyObject *_Ty_make_typevartuple(TyThreadState *, TyObject *);
extern TyObject *_Ty_make_typealias(TyThreadState *, TyObject *);
extern TyObject *_Ty_subscript_generic(TyThreadState *, TyObject *);
extern TyObject *_Ty_set_typeparam_default(TyThreadState *, TyObject *, TyObject *);
extern int _Ty_initialize_generic(TyInterpreterState *);
extern void _Ty_clear_generic_types(TyInterpreterState *);
extern int _Ty_typing_type_repr(PyUnicodeWriter *, TyObject *);

extern TyTypeObject _PyTypeAlias_Type;
extern TyTypeObject _PyNoDefault_Type;
extern TyObject _Ty_NoDefaultStruct;

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_TYPEVAROBJECT_H */
