#ifndef Ty_WARNINGS_H
#define Ty_WARNINGS_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(int) TyErr_WarnEx(
    TyObject *category,
    const char *message,        /* UTF-8 encoded string */
    Ty_ssize_t stack_level);

PyAPI_FUNC(int) TyErr_WarnFormat(
    TyObject *category,
    Ty_ssize_t stack_level,
    const char *format,         /* ASCII-encoded string  */
    ...);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
/* Emit a ResourceWarning warning */
PyAPI_FUNC(int) TyErr_ResourceWarning(
    TyObject *source,
    Ty_ssize_t stack_level,
    const char *format,         /* ASCII-encoded string  */
    ...);
#endif

PyAPI_FUNC(int) TyErr_WarnExplicit(
    TyObject *category,
    const char *message,        /* UTF-8 encoded string */
    const char *filename,       /* decoded from the filesystem encoding */
    int lineno,
    const char *module,         /* UTF-8 encoded string */
    TyObject *registry);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_WARNINGS_H
#  include "cpython/warnings.h"
#  undef Ty_CPYTHON_WARNINGS_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_WARNINGS_H */

