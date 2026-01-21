
/* Interfaces to parse and execute pieces of python code */

#ifndef Ty_PYTHONRUN_H
#define Ty_PYTHONRUN_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(TyObject *) Ty_CompileString(const char *, const char *, int);

PyAPI_FUNC(void) TyErr_Print(void);
PyAPI_FUNC(void) TyErr_PrintEx(int);
PyAPI_FUNC(void) TyErr_Display(TyObject *, TyObject *, TyObject *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030C0000
PyAPI_FUNC(void) TyErr_DisplayException(TyObject *);
#endif


/* Stuff with no proper home (yet) */
PyAPI_DATA(int) (*TyOS_InputHook)(void);

#if defined(WIN32)
#  define USE_STACKCHECK
#endif
#ifdef USE_STACKCHECK
/* Check that we aren't overflowing our stack */
PyAPI_FUNC(int) TyOS_CheckStack(void);
#endif


#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_PYTHONRUN_H
#  include "cpython/pythonrun.h"
#  undef Ty_CPYTHON_PYTHONRUN_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PYTHONRUN_H */
