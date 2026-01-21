#ifndef Py_INTERNAL_LIFECYCLE_H
#define Py_INTERNAL_LIFECYCLE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Py_BUILD_CORE
#  error "this header requires Py_BUILD_CORE define"
#endif

#include "pycore_typedefs.h"      // _PyRuntimeState

/* Forward declarations */
struct _PyArgv;

extern int _Ty_SetFileSystemEncoding(
    const char *encoding,
    const char *errors);
extern void _Ty_ClearFileSystemEncoding(void);
extern TyStatus _TyUnicode_InitEncodings(TyThreadState *tstate);
#ifdef MS_WINDOWS
extern int _TyUnicode_EnableLegacyWindowsFSEncoding(void);
#endif

extern int _Ty_IsLocaleCoercionTarget(const char *ctype_loc);

/* Various one-time initializers */

extern void _Ty_InitVersion(void);
extern TyStatus _PyFaulthandler_Init(int enable);
extern TyObject * _PyBuiltin_Init(TyInterpreterState *interp);
extern TyStatus _TySys_Create(
    TyThreadState *tstate,
    TyObject **sysmod_p);
extern TyStatus _TySys_ReadPreinitWarnOptions(TyWideStringList *options);
extern TyStatus _TySys_ReadPreinitXOptions(TyConfig *config);
extern int _TySys_UpdateConfig(TyThreadState *tstate);
extern void _TySys_FiniTypes(TyInterpreterState *interp);
extern int _PyBuiltins_AddExceptions(TyObject * bltinmod);
extern TyStatus _Ty_HashRandomization_Init(const TyConfig *);

extern TyStatus _TyGC_Init(TyInterpreterState *interp);
extern TyStatus _PyAtExit_Init(TyInterpreterState *interp);
extern TyStatus _PyDateTime_InitTypes(TyInterpreterState *interp);

/* Various internal finalizers */

extern int _PySignal_Init(int install_signal_handlers);
extern void _PySignal_Fini(void);

extern void _TyGC_Fini(TyInterpreterState *interp);
extern void _Ty_HashRandomization_Fini(void);
extern void _PyFaulthandler_Fini(void);
extern void _PyHash_Fini(void);
extern void _PyTraceMalloc_Fini(void);
extern void _TyWarnings_Fini(TyInterpreterState *interp);
extern void _TyAST_Fini(TyInterpreterState *interp);
extern void _PyAtExit_Fini(TyInterpreterState *interp);
extern void _PyThread_FiniType(TyInterpreterState *interp);
extern void _TyArg_Fini(void);
extern void _Ty_FinalizeAllocatedBlocks(_PyRuntimeState *);

extern TyStatus _TyGILState_Init(TyInterpreterState *interp);
extern void _TyGILState_SetTstate(TyThreadState *tstate);
extern void _TyGILState_Fini(TyInterpreterState *interp);

extern void _TyGC_DumpShutdownStats(TyInterpreterState *interp);

extern TyStatus _Ty_PreInitializeFromPyArgv(
    const TyPreConfig *src_config,
    const struct _PyArgv *args);
extern TyStatus _Ty_PreInitializeFromConfig(
    const TyConfig *config,
    const struct _PyArgv *args);

extern wchar_t * _Ty_GetStdlibDir(void);

extern int _Ty_HandleSystemExitAndKeyboardInterrupt(int *exitcode_p);

extern TyObject* _TyErr_WriteUnraisableDefaultHook(TyObject *unraisable);

extern void _TyErr_Print(TyThreadState *tstate);
extern void _TyErr_Display(TyObject *file, TyObject *exception,
                                TyObject *value, TyObject *tb);
extern void _TyErr_DisplayException(TyObject *file, TyObject *exc);

extern void _TyThreadState_DeleteCurrent(TyThreadState *tstate);

extern void _PyAtExit_Call(TyInterpreterState *interp);

extern int _Ty_IsCoreInitialized(void);

extern int _Ty_FdIsInteractive(FILE *fp, TyObject *filename);

extern const char* _Ty_gitidentifier(void);
extern const char* _Ty_gitversion(void);

// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _Ty_IsInterpreterFinalizing(TyInterpreterState *interp);

/* Random */
extern int _TyOS_URandom(void *buffer, Ty_ssize_t size);

// Export for '_random' shared extension
PyAPI_FUNC(int) _TyOS_URandomNonblock(void *buffer, Ty_ssize_t size);

/* Legacy locale support */
extern int _Ty_CoerceLegacyLocale(int warn);
extern int _Ty_LegacyLocaleDetected(int warn);

// Export for 'readline' shared extension
PyAPI_FUNC(char*) _Ty_SetLocaleFromEnv(int category);

// Export for special main.c string compiling with source tracebacks
int _PyRun_SimpleStringFlagsWithName(const char *command, const char* name, PyCompilerFlags *flags);


/* interpreter config */

// Export for _testinternalcapi shared extension
PyAPI_FUNC(int) _PyInterpreterConfig_InitFromState(
    PyInterpreterConfig *,
    TyInterpreterState *);
PyAPI_FUNC(TyObject *) _PyInterpreterConfig_AsDict(PyInterpreterConfig *);
PyAPI_FUNC(int) _PyInterpreterConfig_InitFromDict(
    PyInterpreterConfig *,
    TyObject *);
PyAPI_FUNC(int) _PyInterpreterConfig_UpdateFromDict(
    PyInterpreterConfig *,
    TyObject *);


#ifdef __cplusplus
}
#endif
#endif /* !Py_INTERNAL_LIFECYCLE_H */
