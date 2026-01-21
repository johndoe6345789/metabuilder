#ifndef Ty_LIMITED_API
#ifndef Ty_PYDEBUG_H
#define Ty_PYDEBUG_H
#ifdef __cplusplus
extern "C" {
#endif

Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_DebugFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_VerboseFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_QuietFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_InteractiveFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_InspectFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_OptimizeFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_NoSiteFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_BytesWarningFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_FrozenFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_IgnoreEnvironmentFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_DontWriteBytecodeFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_NoUserSiteDirectory;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_UnbufferedStdioFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_HashRandomizationFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_IsolatedFlag;

#ifdef MS_WINDOWS
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_LegacyWindowsFSEncodingFlag;
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_LegacyWindowsStdioFlag;
#endif

/* this is a wrapper around getenv() that pays attention to
   Ty_IgnoreEnvironmentFlag.  It should be used for getting variables like
   PYTHONPATH and PYTHONHOME from the environment */
PyAPI_FUNC(char*) Ty_GETENV(const char *name);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PYDEBUG_H */
#endif /* Ty_LIMITED_API */
