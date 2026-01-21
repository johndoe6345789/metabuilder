/* File object interface (what's left of it -- see io.py) */

#ifndef Ty_FILEOBJECT_H
#define Ty_FILEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#define PY_STDIOTEXTMODE "b"

PyAPI_FUNC(TyObject *) TyFile_FromFd(int, const char *, const char *, int,
                                     const char *, const char *,
                                     const char *, int);
PyAPI_FUNC(TyObject *) TyFile_GetLine(TyObject *, int);
PyAPI_FUNC(int) TyFile_WriteObject(TyObject *, TyObject *, int);
PyAPI_FUNC(int) TyFile_WriteString(const char *, TyObject *);
PyAPI_FUNC(int) PyObject_AsFileDescriptor(TyObject *);

/* The default encoding used by the platform file system APIs
   If non-NULL, this is different than the default encoding for strings
*/
Ty_DEPRECATED(3.12) PyAPI_DATA(const char *) Ty_FileSystemDefaultEncoding;
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
Ty_DEPRECATED(3.12) PyAPI_DATA(const char *) Ty_FileSystemDefaultEncodeErrors;
#endif
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_HasFileSystemDefaultEncoding;

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03070000
Ty_DEPRECATED(3.12) PyAPI_DATA(int) Ty_UTF8Mode;
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_FILEOBJECT_H
#  include "cpython/fileobject.h"
#  undef Ty_CPYTHON_FILEOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_FILEOBJECT_H */
