#ifndef Ty_INTERNAL_PYCAPSULE_H
#define Ty_INTERNAL_PYCAPSULE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Export for '_socket' shared extension
PyAPI_FUNC(int) _PyCapsule_SetTraverse(TyObject *op, traverseproc traverse_func, inquiry clear_func);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PYCAPSULE_H */
