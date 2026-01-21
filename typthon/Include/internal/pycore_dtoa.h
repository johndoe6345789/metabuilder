#ifndef Ty_INTERNAL_DTOA_H
#define Ty_INTERNAL_DTOA_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_pymath.h"        // _PY_SHORT_FLOAT_REPR


#if defined(Ty_USING_MEMORY_DEBUGGER) || _PY_SHORT_FLOAT_REPR == 0

#define _dtoa_state_INIT(INTERP) \
    {0}

#else

#define _dtoa_state_INIT(INTERP) \
    { \
        .preallocated_next = (INTERP)->dtoa.preallocated, \
    }
#endif

extern double _Ty_dg_strtod(const char *str, char **ptr);
extern char* _Ty_dg_dtoa(double d, int mode, int ndigits,
                         int *decpt, int *sign, char **rve);
extern void _Ty_dg_freedtoa(char *s);


extern TyStatus _PyDtoa_Init(TyInterpreterState *interp);
extern void _PyDtoa_Fini(TyInterpreterState *interp);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_DTOA_H */
