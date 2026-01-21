
/* Interfaces to configure, query, create & destroy the Python runtime */

#ifndef Ty_PYLIFECYCLE_H
#define Ty_PYLIFECYCLE_H
#ifdef __cplusplus
extern "C" {
#endif


/* Initialization and finalization */
PyAPI_FUNC(void) Ty_Initialize(void);
PyAPI_FUNC(void) Ty_InitializeEx(int);
PyAPI_FUNC(void) Ty_Finalize(void);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
PyAPI_FUNC(int) Ty_FinalizeEx(void);
#endif
PyAPI_FUNC(int) Ty_IsInitialized(void);

/* Subinterpreter support */
PyAPI_FUNC(TyThreadState *) Ty_NewInterpreter(void);
PyAPI_FUNC(void) Ty_EndInterpreter(TyThreadState *);


/* Ty_PyAtExit is for the atexit module, Ty_AtExit is for low-level
 * exit functions.
 */
PyAPI_FUNC(int) Ty_AtExit(void (*func)(void));

PyAPI_FUNC(void) _Ty_NO_RETURN Ty_Exit(int);

/* Bootstrap __main__ (defined in Modules/main.c) */
PyAPI_FUNC(int) Ty_Main(int argc, wchar_t **argv);
PyAPI_FUNC(int) Ty_BytesMain(int argc, char **argv);

/* In pathconfig.c */
Ty_DEPRECATED(3.11) PyAPI_FUNC(void) Ty_SetProgramName(const wchar_t *);
Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetProgramName(void);

Ty_DEPRECATED(3.11) PyAPI_FUNC(void) Ty_SetPythonHome(const wchar_t *);
Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetPythonHome(void);

Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetProgramFullPath(void);
Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetPrefix(void);
Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetExecPrefix(void);
Ty_DEPRECATED(3.13) PyAPI_FUNC(wchar_t *) Ty_GetPath(void);
#ifdef MS_WINDOWS
int _Ty_CheckPython3(void);
#endif

/* In their own files */
PyAPI_FUNC(const char *) Ty_GetVersion(void);
PyAPI_FUNC(const char *) Ty_GetPlatform(void);
PyAPI_FUNC(const char *) Ty_GetCopyright(void);
PyAPI_FUNC(const char *) Ty_GetCompiler(void);
PyAPI_FUNC(const char *) Ty_GetBuildInfo(void);

/* Signals */
typedef void (*TyOS_sighandler_t)(int);
PyAPI_FUNC(TyOS_sighandler_t) TyOS_getsig(int);
PyAPI_FUNC(TyOS_sighandler_t) TyOS_setsig(int, TyOS_sighandler_t);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030B0000
PyAPI_DATA(const unsigned long) Ty_Version;
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030D0000
PyAPI_FUNC(int) Ty_IsFinalizing(void);
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_PYLIFECYCLE_H
#  include "cpython/pylifecycle.h"
#  undef Ty_CPYTHON_PYLIFECYCLE_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PYLIFECYCLE_H */
