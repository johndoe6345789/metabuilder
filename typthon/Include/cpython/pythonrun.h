#ifndef Ty_CPYTHON_PYTHONRUN_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(int) TyRun_SimpleStringFlags(const char *, PyCompilerFlags *);
PyAPI_FUNC(int) TyRun_AnyFileExFlags(
    FILE *fp,
    const char *filename,       /* decoded from the filesystem encoding */
    int closeit,
    PyCompilerFlags *flags);
PyAPI_FUNC(int) TyRun_SimpleFileExFlags(
    FILE *fp,
    const char *filename,       /* decoded from the filesystem encoding */
    int closeit,
    PyCompilerFlags *flags);
PyAPI_FUNC(int) TyRun_InteractiveOneFlags(
    FILE *fp,
    const char *filename,       /* decoded from the filesystem encoding */
    PyCompilerFlags *flags);
PyAPI_FUNC(int) TyRun_InteractiveOneObject(
    FILE *fp,
    TyObject *filename,
    PyCompilerFlags *flags);
PyAPI_FUNC(int) TyRun_InteractiveLoopFlags(
    FILE *fp,
    const char *filename,       /* decoded from the filesystem encoding */
    PyCompilerFlags *flags);


PyAPI_FUNC(TyObject *) TyRun_StringFlags(const char *, int, TyObject *,
                                         TyObject *, PyCompilerFlags *);

PyAPI_FUNC(TyObject *) TyRun_FileExFlags(
    FILE *fp,
    const char *filename,       /* decoded from the filesystem encoding */
    int start,
    TyObject *globals,
    TyObject *locals,
    int closeit,
    PyCompilerFlags *flags);


PyAPI_FUNC(TyObject *) Ty_CompileStringExFlags(
    const char *str,
    const char *filename,       /* decoded from the filesystem encoding */
    int start,
    PyCompilerFlags *flags,
    int optimize);
PyAPI_FUNC(TyObject *) Ty_CompileStringObject(
    const char *str,
    TyObject *filename, int start,
    PyCompilerFlags *flags,
    int optimize);

#define Ty_CompileString(str, p, s) Ty_CompileStringExFlags((str), (p), (s), NULL, -1)
#define Ty_CompileStringFlags(str, p, s, f) Ty_CompileStringExFlags((str), (p), (s), (f), -1)

/* A function flavor is also exported by libpython. It is required when
    libpython is accessed directly rather than using header files which defines
    macros below. On Windows, for example, PyAPI_FUNC() uses dllexport to
    export functions in pythonXX.dll. */
PyAPI_FUNC(TyObject *) TyRun_String(const char *str, int s, TyObject *g, TyObject *l);
PyAPI_FUNC(int) TyRun_AnyFile(FILE *fp, const char *name);
PyAPI_FUNC(int) TyRun_AnyFileEx(FILE *fp, const char *name, int closeit);
PyAPI_FUNC(int) TyRun_AnyFileFlags(FILE *, const char *, PyCompilerFlags *);
PyAPI_FUNC(int) TyRun_SimpleString(const char *s);
PyAPI_FUNC(int) TyRun_SimpleFile(FILE *f, const char *p);
PyAPI_FUNC(int) TyRun_SimpleFileEx(FILE *f, const char *p, int c);
PyAPI_FUNC(int) TyRun_InteractiveOne(FILE *f, const char *p);
PyAPI_FUNC(int) TyRun_InteractiveLoop(FILE *f, const char *p);
PyAPI_FUNC(TyObject *) TyRun_File(FILE *fp, const char *p, int s, TyObject *g, TyObject *l);
PyAPI_FUNC(TyObject *) TyRun_FileEx(FILE *fp, const char *p, int s, TyObject *g, TyObject *l, int c);
PyAPI_FUNC(TyObject *) TyRun_FileFlags(FILE *fp, const char *p, int s, TyObject *g, TyObject *l, PyCompilerFlags *flags);

/* Use macros for a bunch of old variants */
#define TyRun_String(str, s, g, l) TyRun_StringFlags((str), (s), (g), (l), NULL)
#define TyRun_AnyFile(fp, name) TyRun_AnyFileExFlags((fp), (name), 0, NULL)
#define TyRun_AnyFileEx(fp, name, closeit) \
    TyRun_AnyFileExFlags((fp), (name), (closeit), NULL)
#define TyRun_AnyFileFlags(fp, name, flags) \
    TyRun_AnyFileExFlags((fp), (name), 0, (flags))
#define TyRun_SimpleString(s) TyRun_SimpleStringFlags((s), NULL)
#define TyRun_SimpleFile(f, p) TyRun_SimpleFileExFlags((f), (p), 0, NULL)
#define TyRun_SimpleFileEx(f, p, c) TyRun_SimpleFileExFlags((f), (p), (c), NULL)
#define TyRun_InteractiveOne(f, p) TyRun_InteractiveOneFlags((f), (p), NULL)
#define TyRun_InteractiveLoop(f, p) TyRun_InteractiveLoopFlags((f), (p), NULL)
#define TyRun_File(fp, p, s, g, l) \
    TyRun_FileExFlags((fp), (p), (s), (g), (l), 0, NULL)
#define TyRun_FileEx(fp, p, s, g, l, c) \
    TyRun_FileExFlags((fp), (p), (s), (g), (l), (c), NULL)
#define TyRun_FileFlags(fp, p, s, g, l, flags) \
    TyRun_FileExFlags((fp), (p), (s), (g), (l), 0, (flags))

/* Stuff with no proper home (yet) */
PyAPI_FUNC(char *) TyOS_Readline(FILE *, FILE *, const char *);
PyAPI_DATA(char) *(*TyOS_ReadlineFunctionPointer)(FILE *, FILE *, const char *);
