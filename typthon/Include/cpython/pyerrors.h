#ifndef Ty_CPYTHON_ERRORS_H
#  error "this header file must not be included directly"
#endif

/* Error objects */

/* PyException_HEAD defines the initial segment of every exception class. */
#define PyException_HEAD PyObject_HEAD TyObject *dict;\
             TyObject *args; TyObject *notes; TyObject *traceback;\
             TyObject *context; TyObject *cause;\
             char suppress_context;

typedef struct {
    PyException_HEAD
} TyBaseExceptionObject;

typedef struct {
    PyException_HEAD
    TyObject *msg;
    TyObject *excs;
} TyBaseExceptionGroupObject;

typedef struct {
    PyException_HEAD
    TyObject *msg;
    TyObject *filename;
    TyObject *lineno;
    TyObject *offset;
    TyObject *end_lineno;
    TyObject *end_offset;
    TyObject *text;
    TyObject *print_file_and_line;
    TyObject *metadata;
} TySyntaxErrorObject;

typedef struct {
    PyException_HEAD
    TyObject *msg;
    TyObject *name;
    TyObject *path;
    TyObject *name_from;
} TyImportErrorObject;

typedef struct {
    PyException_HEAD
    TyObject *encoding;
    TyObject *object;
    Ty_ssize_t start;
    Ty_ssize_t end;
    TyObject *reason;
} TyUnicodeErrorObject;

typedef struct {
    PyException_HEAD
    TyObject *code;
} TySystemExitObject;

typedef struct {
    PyException_HEAD
    TyObject *myerrno;
    TyObject *strerror;
    TyObject *filename;
    TyObject *filename2;
#ifdef MS_WINDOWS
    TyObject *winerror;
#endif
    Ty_ssize_t written;   /* only for BlockingIOError, -1 otherwise */
} TyOSErrorObject;

typedef struct {
    PyException_HEAD
    TyObject *value;
} TyStopIterationObject;

typedef struct {
    PyException_HEAD
    TyObject *name;
} TyNameErrorObject;

typedef struct {
    PyException_HEAD
    TyObject *obj;
    TyObject *name;
} TyAttributeErrorObject;

/* Compatibility typedefs */
typedef TyOSErrorObject PyEnvironmentErrorObject;
#ifdef MS_WINDOWS
typedef TyOSErrorObject PyWindowsErrorObject;
#endif

/* Context manipulation (PEP 3134) */

PyAPI_FUNC(void) _TyErr_ChainExceptions1(TyObject *);

/* In exceptions.c */

PyAPI_FUNC(TyObject*) PyUnstable_Exc_PrepReraiseStar(
     TyObject *orig,
     TyObject *excs);

/* In signalmodule.c */

PyAPI_FUNC(int) PySignal_SetWakeupFd(int fd);

/* Support for adding program text to SyntaxErrors */

PyAPI_FUNC(void) TyErr_SyntaxLocationObject(
    TyObject *filename,
    int lineno,
    int col_offset);

PyAPI_FUNC(void) TyErr_RangedSyntaxLocationObject(
    TyObject *filename,
    int lineno,
    int col_offset,
    int end_lineno,
    int end_col_offset);

PyAPI_FUNC(TyObject *) TyErr_ProgramTextObject(
    TyObject *filename,
    int lineno);

PyAPI_FUNC(void) _Ty_NO_RETURN _Ty_FatalErrorFunc(
    const char *func,
    const char *message);

PyAPI_FUNC(void) TyErr_FormatUnraisable(const char *, ...);

PyAPI_DATA(TyObject *) TyExc_PythonFinalizationError;

#define Ty_FatalError(message) _Ty_FatalErrorFunc(__func__, (message))
