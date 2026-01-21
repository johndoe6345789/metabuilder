#ifndef Ty_INTERNAL_EXCEPTIONS_H
#define Ty_INTERNAL_EXCEPTIONS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/* runtime lifecycle */

extern TyStatus _TyExc_InitState(TyInterpreterState *);
extern TyStatus _TyExc_InitGlobalObjects(TyInterpreterState *);
extern int _TyExc_InitTypes(TyInterpreterState *);
extern void _TyExc_Fini(TyInterpreterState *);


/* other API */

struct _Py_exc_state {
    // The dict mapping from errno codes to OSError subclasses
    TyObject *errnomap;
    TyBaseExceptionObject *memerrors_freelist;
    int memerrors_numfree;
#ifdef Ty_GIL_DISABLED
    PyMutex memerrors_lock;
#endif
    // The ExceptionGroup type
    TyObject *TyExc_ExceptionGroup;
};

extern void _TyExc_ClearExceptionGroupType(TyInterpreterState *);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_EXCEPTIONS_H */
