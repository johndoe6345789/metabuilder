#ifndef Ty_CPYTHON_WARNINGS_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(int) TyErr_WarnExplicitObject(
    TyObject *category,
    TyObject *message,
    TyObject *filename,
    int lineno,
    TyObject *module,
    TyObject *registry);

PyAPI_FUNC(int) TyErr_WarnExplicitFormat(
    TyObject *category,
    const char *filename, int lineno,
    const char *module, TyObject *registry,
    const char *format, ...);

// DEPRECATED: Use TyErr_WarnEx() instead.
#define TyErr_Warn(category, msg) TyErr_WarnEx((category), (msg), 1)

int _TyErr_WarnExplicitObjectWithContext(
    TyObject *category,
    TyObject *message,
    TyObject *filename,
    int lineno);
