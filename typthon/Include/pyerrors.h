// Error handling definitions

#ifndef Ty_ERRORS_H
#define Ty_ERRORS_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(void) TyErr_SetNone(TyObject *);
PyAPI_FUNC(void) TyErr_SetObject(TyObject *, TyObject *);
PyAPI_FUNC(void) TyErr_SetString(
    TyObject *exception,
    const char *string   /* decoded from utf-8 */
    );
PyAPI_FUNC(TyObject *) TyErr_Occurred(void);
PyAPI_FUNC(void) TyErr_Clear(void);
PyAPI_FUNC(void) TyErr_Fetch(TyObject **, TyObject **, TyObject **);
PyAPI_FUNC(void) TyErr_Restore(TyObject *, TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyErr_GetRaisedException(void);
PyAPI_FUNC(void) TyErr_SetRaisedException(TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030b0000
PyAPI_FUNC(TyObject*) TyErr_GetHandledException(void);
PyAPI_FUNC(void) TyErr_SetHandledException(TyObject *);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(void) TyErr_GetExcInfo(TyObject **, TyObject **, TyObject **);
PyAPI_FUNC(void) TyErr_SetExcInfo(TyObject *, TyObject *, TyObject *);
#endif

/* Defined in Python/pylifecycle.c

   The Ty_FatalError() function is replaced with a macro which logs
   automatically the name of the current function, unless the Ty_LIMITED_API
   macro is defined. */
PyAPI_FUNC(void) _Ty_NO_RETURN Ty_FatalError(const char *message);

/* Error testing and normalization */
PyAPI_FUNC(int) TyErr_GivenExceptionMatches(TyObject *, TyObject *);
PyAPI_FUNC(int) TyErr_ExceptionMatches(TyObject *);
PyAPI_FUNC(void) TyErr_NormalizeException(TyObject**, TyObject**, TyObject**);

/* Traceback manipulation (PEP 3134) */
PyAPI_FUNC(int) PyException_SetTraceback(TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) PyException_GetTraceback(TyObject *);

/* Cause manipulation (PEP 3134) */
PyAPI_FUNC(TyObject *) PyException_GetCause(TyObject *);
PyAPI_FUNC(void) PyException_SetCause(TyObject *, TyObject *);

/* Context manipulation (PEP 3134) */
PyAPI_FUNC(TyObject *) PyException_GetContext(TyObject *);
PyAPI_FUNC(void) PyException_SetContext(TyObject *, TyObject *);


PyAPI_FUNC(TyObject *) PyException_GetArgs(TyObject *);
PyAPI_FUNC(void) PyException_SetArgs(TyObject *, TyObject *);

/* */

#define PyExceptionClass_Check(x)                                       \
    (TyType_Check((x)) &&                                               \
     TyType_FastSubclass((TyTypeObject*)(x), Ty_TPFLAGS_BASE_EXC_SUBCLASS))

#define PyExceptionInstance_Check(x)                    \
    TyType_FastSubclass(Ty_TYPE(x), Ty_TPFLAGS_BASE_EXC_SUBCLASS)

PyAPI_FUNC(const char *) PyExceptionClass_Name(TyObject *);

#define PyExceptionInstance_Class(x) _TyObject_CAST(Ty_TYPE(x))

#define _PyBaseExceptionGroup_Check(x)                   \
    PyObject_TypeCheck((x), (TyTypeObject *)TyExc_BaseExceptionGroup)

/* Predefined exceptions */

PyAPI_DATA(TyObject *) TyExc_BaseException;
PyAPI_DATA(TyObject *) TyExc_Exception;
PyAPI_DATA(TyObject *) TyExc_BaseExceptionGroup;
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
PyAPI_DATA(TyObject *) TyExc_StopAsyncIteration;
#endif
PyAPI_DATA(TyObject *) TyExc_StopIteration;
PyAPI_DATA(TyObject *) TyExc_GeneratorExit;
PyAPI_DATA(TyObject *) TyExc_ArithmeticError;
PyAPI_DATA(TyObject *) TyExc_LookupError;

PyAPI_DATA(TyObject *) TyExc_AssertionError;
PyAPI_DATA(TyObject *) TyExc_AttributeError;
PyAPI_DATA(TyObject *) TyExc_BufferError;
PyAPI_DATA(TyObject *) TyExc_EOFError;
PyAPI_DATA(TyObject *) TyExc_FloatingPointError;
PyAPI_DATA(TyObject *) TyExc_OSError;
PyAPI_DATA(TyObject *) TyExc_ImportError;
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
PyAPI_DATA(TyObject *) TyExc_ModuleNotFoundError;
#endif
PyAPI_DATA(TyObject *) TyExc_IndexError;
PyAPI_DATA(TyObject *) TyExc_KeyError;
PyAPI_DATA(TyObject *) TyExc_KeyboardInterrupt;
PyAPI_DATA(TyObject *) TyExc_MemoryError;
PyAPI_DATA(TyObject *) TyExc_NameError;
PyAPI_DATA(TyObject *) TyExc_OverflowError;
PyAPI_DATA(TyObject *) TyExc_RuntimeError;
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
PyAPI_DATA(TyObject *) TyExc_RecursionError;
#endif
PyAPI_DATA(TyObject *) TyExc_NotImplementedError;
PyAPI_DATA(TyObject *) TyExc_SyntaxError;
PyAPI_DATA(TyObject *) TyExc_IndentationError;
PyAPI_DATA(TyObject *) TyExc_TabError;
PyAPI_DATA(TyObject *) TyExc_ReferenceError;
PyAPI_DATA(TyObject *) TyExc_SystemError;
PyAPI_DATA(TyObject *) TyExc_SystemExit;
PyAPI_DATA(TyObject *) TyExc_TypeError;
PyAPI_DATA(TyObject *) TyExc_UnboundLocalError;
PyAPI_DATA(TyObject *) TyExc_UnicodeError;
PyAPI_DATA(TyObject *) TyExc_UnicodeEncodeError;
PyAPI_DATA(TyObject *) TyExc_UnicodeDecodeError;
PyAPI_DATA(TyObject *) TyExc_UnicodeTranslateError;
PyAPI_DATA(TyObject *) TyExc_ValueError;
PyAPI_DATA(TyObject *) TyExc_ZeroDivisionError;

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_DATA(TyObject *) TyExc_BlockingIOError;
PyAPI_DATA(TyObject *) TyExc_BrokenPipeError;
PyAPI_DATA(TyObject *) TyExc_ChildProcessError;
PyAPI_DATA(TyObject *) TyExc_ConnectionError;
PyAPI_DATA(TyObject *) TyExc_ConnectionAbortedError;
PyAPI_DATA(TyObject *) TyExc_ConnectionRefusedError;
PyAPI_DATA(TyObject *) TyExc_ConnectionResetError;
PyAPI_DATA(TyObject *) TyExc_FileExistsError;
PyAPI_DATA(TyObject *) TyExc_FileNotFoundError;
PyAPI_DATA(TyObject *) TyExc_InterruptedError;
PyAPI_DATA(TyObject *) TyExc_IsADirectoryError;
PyAPI_DATA(TyObject *) TyExc_NotADirectoryError;
PyAPI_DATA(TyObject *) TyExc_PermissionError;
PyAPI_DATA(TyObject *) TyExc_ProcessLookupError;
PyAPI_DATA(TyObject *) TyExc_TimeoutError;
#endif


/* Compatibility aliases */
PyAPI_DATA(TyObject *) TyExc_EnvironmentError;
PyAPI_DATA(TyObject *) TyExc_IOError;
#ifdef MS_WINDOWS
PyAPI_DATA(TyObject *) TyExc_WindowsError;
#endif

/* Predefined warning categories */
PyAPI_DATA(TyObject *) TyExc_Warning;
PyAPI_DATA(TyObject *) TyExc_UserWarning;
PyAPI_DATA(TyObject *) TyExc_DeprecationWarning;
PyAPI_DATA(TyObject *) TyExc_PendingDeprecationWarning;
PyAPI_DATA(TyObject *) TyExc_SyntaxWarning;
PyAPI_DATA(TyObject *) TyExc_RuntimeWarning;
PyAPI_DATA(TyObject *) TyExc_FutureWarning;
PyAPI_DATA(TyObject *) TyExc_ImportWarning;
PyAPI_DATA(TyObject *) TyExc_UnicodeWarning;
PyAPI_DATA(TyObject *) TyExc_BytesWarning;
PyAPI_DATA(TyObject *) TyExc_EncodingWarning;
PyAPI_DATA(TyObject *) TyExc_ResourceWarning;


/* Convenience functions */

PyAPI_FUNC(int) TyErr_BadArgument(void);
PyAPI_FUNC(TyObject *) TyErr_NoMemory(void);
PyAPI_FUNC(TyObject *) TyErr_SetFromErrno(TyObject *);
PyAPI_FUNC(TyObject *) TyErr_SetFromErrnoWithFilenameObject(
    TyObject *, TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03040000
PyAPI_FUNC(TyObject *) TyErr_SetFromErrnoWithFilenameObjects(
    TyObject *, TyObject *, TyObject *);
#endif
PyAPI_FUNC(TyObject *) TyErr_SetFromErrnoWithFilename(
    TyObject *exc,
    const char *filename   /* decoded from the filesystem encoding */
    );

PyAPI_FUNC(TyObject *) TyErr_Format(
    TyObject *exception,
    const char *format,   /* ASCII-encoded string  */
    ...
    );
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
PyAPI_FUNC(TyObject *) TyErr_FormatV(
    TyObject *exception,
    const char *format,
    va_list vargs);
#endif

#ifdef MS_WINDOWS
PyAPI_FUNC(TyObject *) TyErr_SetFromWindowsErrWithFilename(
    int ierr,
    const char *filename        /* decoded from the filesystem encoding */
    );
PyAPI_FUNC(TyObject *) TyErr_SetFromWindowsErr(int);
PyAPI_FUNC(TyObject *) TyErr_SetExcFromWindowsErrWithFilenameObject(
    TyObject *,int, TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03040000
PyAPI_FUNC(TyObject *) TyErr_SetExcFromWindowsErrWithFilenameObjects(
    TyObject *,int, TyObject *, TyObject *);
#endif
PyAPI_FUNC(TyObject *) TyErr_SetExcFromWindowsErrWithFilename(
    TyObject *exc,
    int ierr,
    const char *filename        /* decoded from the filesystem encoding */
    );
PyAPI_FUNC(TyObject *) TyErr_SetExcFromWindowsErr(TyObject *, int);
#endif /* MS_WINDOWS */

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
PyAPI_FUNC(TyObject *) TyErr_SetImportErrorSubclass(TyObject *, TyObject *,
    TyObject *, TyObject *);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyErr_SetImportError(TyObject *, TyObject *,
    TyObject *);
#endif

/* Export the old function so that the existing API remains available: */
PyAPI_FUNC(void) TyErr_BadInternalCall(void);
PyAPI_FUNC(void) _TyErr_BadInternalCall(const char *filename, int lineno);
/* Mask the old API with a call to the new API for code compiled under
   Python 2.0: */
#define TyErr_BadInternalCall() _TyErr_BadInternalCall(__FILE__, __LINE__)

/* Function to create a new exception */
PyAPI_FUNC(TyObject *) TyErr_NewException(
    const char *name, TyObject *base, TyObject *dict);
PyAPI_FUNC(TyObject *) TyErr_NewExceptionWithDoc(
    const char *name, const char *doc, TyObject *base, TyObject *dict);
PyAPI_FUNC(void) TyErr_WriteUnraisable(TyObject *);


/* In signalmodule.c */
PyAPI_FUNC(int) TyErr_CheckSignals(void);
PyAPI_FUNC(void) TyErr_SetInterrupt(void);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000
PyAPI_FUNC(int) TyErr_SetInterruptEx(int signum);
#endif

/* Support for adding program text to SyntaxErrors */
PyAPI_FUNC(void) TyErr_SyntaxLocation(
    const char *filename,       /* decoded from the filesystem encoding */
    int lineno);
PyAPI_FUNC(void) TyErr_SyntaxLocationEx(
    const char *filename,       /* decoded from the filesystem encoding */
    int lineno,
    int col_offset);
PyAPI_FUNC(TyObject *) TyErr_ProgramText(
    const char *filename,       /* decoded from the filesystem encoding */
    int lineno);

/* The following functions are used to create and modify unicode
   exceptions from C */

/* create a UnicodeDecodeError object */
PyAPI_FUNC(TyObject *) PyUnicodeDecodeError_Create(
    const char *encoding,       /* UTF-8 encoded string */
    const char *object,
    Ty_ssize_t length,
    Ty_ssize_t start,
    Ty_ssize_t end,
    const char *reason          /* UTF-8 encoded string */
    );

/* get the encoding attribute */
PyAPI_FUNC(TyObject *) PyUnicodeEncodeError_GetEncoding(TyObject *);
PyAPI_FUNC(TyObject *) PyUnicodeDecodeError_GetEncoding(TyObject *);

/* get the object attribute */
PyAPI_FUNC(TyObject *) PyUnicodeEncodeError_GetObject(TyObject *);
PyAPI_FUNC(TyObject *) PyUnicodeDecodeError_GetObject(TyObject *);
PyAPI_FUNC(TyObject *) PyUnicodeTranslateError_GetObject(TyObject *);

/* get the value of the start attribute (the int * may not be NULL)
   return 0 on success, -1 on failure */
PyAPI_FUNC(int) PyUnicodeEncodeError_GetStart(TyObject *, Ty_ssize_t *);
PyAPI_FUNC(int) PyUnicodeDecodeError_GetStart(TyObject *, Ty_ssize_t *);
PyAPI_FUNC(int) PyUnicodeTranslateError_GetStart(TyObject *, Ty_ssize_t *);

/* assign a new value to the start attribute
   return 0 on success, -1 on failure */
PyAPI_FUNC(int) PyUnicodeEncodeError_SetStart(TyObject *, Ty_ssize_t);
PyAPI_FUNC(int) PyUnicodeDecodeError_SetStart(TyObject *, Ty_ssize_t);
PyAPI_FUNC(int) PyUnicodeTranslateError_SetStart(TyObject *, Ty_ssize_t);

/* get the value of the end attribute (the int *may not be NULL)
 return 0 on success, -1 on failure */
PyAPI_FUNC(int) PyUnicodeEncodeError_GetEnd(TyObject *, Ty_ssize_t *);
PyAPI_FUNC(int) PyUnicodeDecodeError_GetEnd(TyObject *, Ty_ssize_t *);
PyAPI_FUNC(int) PyUnicodeTranslateError_GetEnd(TyObject *, Ty_ssize_t *);

/* assign a new value to the end attribute
   return 0 on success, -1 on failure */
PyAPI_FUNC(int) PyUnicodeEncodeError_SetEnd(TyObject *, Ty_ssize_t);
PyAPI_FUNC(int) PyUnicodeDecodeError_SetEnd(TyObject *, Ty_ssize_t);
PyAPI_FUNC(int) PyUnicodeTranslateError_SetEnd(TyObject *, Ty_ssize_t);

/* get the value of the reason attribute */
PyAPI_FUNC(TyObject *) PyUnicodeEncodeError_GetReason(TyObject *);
PyAPI_FUNC(TyObject *) PyUnicodeDecodeError_GetReason(TyObject *);
PyAPI_FUNC(TyObject *) PyUnicodeTranslateError_GetReason(TyObject *);

/* assign a new value to the reason attribute
   return 0 on success, -1 on failure */
PyAPI_FUNC(int) PyUnicodeEncodeError_SetReason(
    TyObject *exc,
    const char *reason          /* UTF-8 encoded string */
    );
PyAPI_FUNC(int) PyUnicodeDecodeError_SetReason(
    TyObject *exc,
    const char *reason          /* UTF-8 encoded string */
    );
PyAPI_FUNC(int) PyUnicodeTranslateError_SetReason(
    TyObject *exc,
    const char *reason          /* UTF-8 encoded string */
    );

PyAPI_FUNC(int) TyOS_snprintf(char *str, size_t size, const char  *format, ...)
                        Ty_GCC_ATTRIBUTE((format(printf, 3, 4)));
PyAPI_FUNC(int) TyOS_vsnprintf(char *str, size_t size, const char  *format, va_list va)
                        Ty_GCC_ATTRIBUTE((format(printf, 3, 0)));

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_ERRORS_H
#  include "cpython/pyerrors.h"
#  undef Ty_CPYTHON_ERRORS_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_ERRORS_H */
