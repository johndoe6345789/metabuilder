// Simple namespace object interface

#ifndef Ty_INTERNAL_NAMESPACE_H
#define Ty_INTERNAL_NAMESPACE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern TyTypeObject _PyNamespace_Type;

// Export for '_testmultiphase' shared extension
PyAPI_FUNC(TyObject*) _PyNamespace_New(TyObject *kwds);

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_NAMESPACE_H
