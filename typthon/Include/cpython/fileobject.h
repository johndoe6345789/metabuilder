#ifndef Ty_CPYTHON_FILEOBJECT_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(char *) Ty_UniversalNewlineFgets(char *, int, FILE*, TyObject *);

/* The std printer acts as a preliminary sys.stderr until the new io
   infrastructure is in place. */
PyAPI_FUNC(TyObject *) TyFile_NewStdPrinter(int);
PyAPI_DATA(TyTypeObject) PyStdPrinter_Type;

typedef TyObject * (*Ty_OpenCodeHookFunction)(TyObject *, void *);

PyAPI_FUNC(TyObject *) TyFile_OpenCode(const char *utf8path);
PyAPI_FUNC(TyObject *) TyFile_OpenCodeObject(TyObject *path);
PyAPI_FUNC(int) TyFile_SetOpenCodeHook(Ty_OpenCodeHookFunction hook, void *userData);
