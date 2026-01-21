#ifndef Ty_CPYTHON_FILEUTILS_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(FILE*) Ty_fopen(
    TyObject *path,
    const char *mode);

// Deprecated alias kept for backward compatibility
Ty_DEPRECATED(3.14) static inline FILE*
_Ty_fopen_obj(TyObject *path, const char *mode)
{
    return Ty_fopen(path, mode);
}

PyAPI_FUNC(int) Ty_fclose(FILE *file);
