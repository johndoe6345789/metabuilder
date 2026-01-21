#ifndef Ty_SYSMODULE_H
#define Ty_SYSMODULE_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(TyObject *) TySys_GetObject(const char *);
PyAPI_FUNC(int) TySys_SetObject(const char *, TyObject *);

Ty_DEPRECATED(3.11) PyAPI_FUNC(void) TySys_SetArgv(int, wchar_t **);
Ty_DEPRECATED(3.11) PyAPI_FUNC(void) TySys_SetArgvEx(int, wchar_t **, int);

PyAPI_FUNC(void) TySys_WriteStdout(const char *format, ...)
                 Ty_GCC_ATTRIBUTE((format(printf, 1, 2)));
PyAPI_FUNC(void) TySys_WriteStderr(const char *format, ...)
                 Ty_GCC_ATTRIBUTE((format(printf, 1, 2)));
PyAPI_FUNC(void) TySys_FormatStdout(const char *format, ...);
PyAPI_FUNC(void) TySys_FormatStderr(const char *format, ...);

Ty_DEPRECATED(3.13) PyAPI_FUNC(void) TySys_ResetWarnOptions(void);

PyAPI_FUNC(TyObject *) TySys_GetXOptions(void);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_SYSMODULE_H */
