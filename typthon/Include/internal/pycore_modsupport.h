#ifndef Ty_INTERNAL_MODSUPPORT_H
#define Ty_INTERNAL_MODSUPPORT_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


extern int _TyArg_NoKwnames(const char *funcname, TyObject *kwnames);
#define _TyArg_NoKwnames(funcname, kwnames) \
    ((kwnames) == NULL || _TyArg_NoKwnames((funcname), (kwnames)))

// Export for '_bz2' shared extension
PyAPI_FUNC(int) _TyArg_NoPositional(const char *funcname, TyObject *args);
#define _TyArg_NoPositional(funcname, args) \
    ((args) == NULL || _TyArg_NoPositional((funcname), (args)))

// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyArg_NoKeywords(const char *funcname, TyObject *kwargs);
#define _TyArg_NoKeywords(funcname, kwargs) \
    ((kwargs) == NULL || _TyArg_NoKeywords((funcname), (kwargs)))

// Export for 'zlib' shared extension
PyAPI_FUNC(int) _TyArg_CheckPositional(const char *, Ty_ssize_t,
                                       Ty_ssize_t, Ty_ssize_t);
#define _Ty_ANY_VARARGS(n) ((n) == PY_SSIZE_T_MAX)
#define _TyArg_CheckPositional(funcname, nargs, min, max) \
    ((!_Ty_ANY_VARARGS(max) && (min) <= (nargs) && (nargs) <= (max)) \
     || _TyArg_CheckPositional((funcname), (nargs), (min), (max)))

extern TyObject ** _Ty_VaBuildStack(
    TyObject **small_stack,
    Ty_ssize_t small_stack_len,
    const char *format,
    va_list va,
    Ty_ssize_t *p_nargs);

extern TyObject* _TyModule_CreateInitialized(TyModuleDef*, int apiver);

// Export for '_curses' shared extension
PyAPI_FUNC(int) _TyArg_ParseStack(
    TyObject *const *args,
    Ty_ssize_t nargs,
    const char *format,
    ...);

extern int _TyArg_UnpackStack(
    TyObject *const *args,
    Ty_ssize_t nargs,
    const char *name,
    Ty_ssize_t min,
    Ty_ssize_t max,
    ...);

// Export for '_heapq' shared extension
PyAPI_FUNC(void) _TyArg_BadArgument(
    const char *fname,
    const char *displayname,
    const char *expected,
    TyObject *arg);

// --- _TyArg_Parser API ---------------------------------------------------

// Export for '_dbm' shared extension
PyAPI_FUNC(int) _TyArg_ParseStackAndKeywords(
    TyObject *const *args,
    Ty_ssize_t nargs,
    TyObject *kwnames,
    struct _TyArg_Parser *,
    ...);

// Export for 'math' shared extension
PyAPI_FUNC(TyObject * const *) _TyArg_UnpackKeywords(
    TyObject *const *args,
    Ty_ssize_t nargs,
    TyObject *kwargs,
    TyObject *kwnames,
    struct _TyArg_Parser *parser,
    int minpos,
    int maxpos,
    int minkw,
    int varpos,
    TyObject **buf);
#define _TyArg_UnpackKeywords(args, nargs, kwargs, kwnames, parser, minpos, maxpos, minkw, varpos, buf) \
    (((minkw) == 0 && (kwargs) == NULL && (kwnames) == NULL && \
      (minpos) <= (nargs) && ((varpos) || (nargs) <= (maxpos)) && (args) != NULL) ? \
      (args) : \
     _TyArg_UnpackKeywords((args), (nargs), (kwargs), (kwnames), (parser), \
                           (minpos), (maxpos), (minkw), (varpos), (buf)))

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_MODSUPPORT_H

