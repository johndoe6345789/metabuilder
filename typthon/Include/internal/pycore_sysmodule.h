#ifndef Ty_INTERNAL_SYSMODULE_H
#define Ty_INTERNAL_SYSMODULE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

PyAPI_FUNC(int) _TySys_GetOptionalAttr(TyObject *, TyObject **);
PyAPI_FUNC(int) _TySys_GetOptionalAttrString(const char *, TyObject **);
PyAPI_FUNC(TyObject *) _TySys_GetRequiredAttr(TyObject *);
PyAPI_FUNC(TyObject *) _TySys_GetRequiredAttrString(const char *);

// Export for '_pickle' shared extension
PyAPI_FUNC(size_t) _TySys_GetSizeOf(TyObject *);

extern int _TySys_SetAttr(TyObject *, TyObject *);

extern int _TySys_ClearAttrString(TyInterpreterState *interp,
                                  const char *name, int verbose);

extern int _TySys_SetFlagObj(Ty_ssize_t pos, TyObject *new_value);
extern int _TySys_SetIntMaxStrDigits(int maxdigits);

extern int _PySysRemoteDebug_SendExec(int pid, int tid, const char *debugger_script_path);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_SYSMODULE_H */
