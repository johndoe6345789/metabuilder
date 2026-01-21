#ifndef Ty_INTERNAL_WARNINGS_H
#define Ty_INTERNAL_WARNINGS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern int _TyWarnings_InitState(TyInterpreterState *interp);

extern TyObject* _TyWarnings_Init(void);

extern void _TyErr_WarnUnawaitedCoroutine(TyObject *coro);
extern void _TyErr_WarnUnawaitedAgenMethod(PyAsyncGenObject *agen, TyObject *method);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_WARNINGS_H */
