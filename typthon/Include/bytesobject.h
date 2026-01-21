// Bytes object interface

#ifndef Ty_BYTESOBJECT_H
#define Ty_BYTESOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/*
Type PyBytesObject represents a byte string.  An extra zero byte is
reserved at the end to ensure it is zero-terminated, but a size is
present so strings with null bytes in them can be represented.  This
is an immutable object type.

There are functions to create new bytes objects, to test
an object for bytes-ness, and to get the
byte string value.  The latter function returns a null pointer
if the object is not of the proper type.
There is a variant that takes an explicit size as well as a
variant that assumes a zero-terminated string.  Note that none of the
functions should be applied to NULL pointer.
*/

PyAPI_DATA(TyTypeObject) TyBytes_Type;
PyAPI_DATA(TyTypeObject) PyBytesIter_Type;

#define TyBytes_Check(op) \
                 TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_BYTES_SUBCLASS)
#define TyBytes_CheckExact(op) Ty_IS_TYPE((op), &TyBytes_Type)

PyAPI_FUNC(TyObject *) TyBytes_FromStringAndSize(const char *, Ty_ssize_t);
PyAPI_FUNC(TyObject *) TyBytes_FromString(const char *);
PyAPI_FUNC(TyObject *) TyBytes_FromObject(TyObject *);
PyAPI_FUNC(TyObject *) TyBytes_FromFormatV(const char*, va_list)
                                Ty_GCC_ATTRIBUTE((format(printf, 1, 0)));
PyAPI_FUNC(TyObject *) TyBytes_FromFormat(const char*, ...)
                                Ty_GCC_ATTRIBUTE((format(printf, 1, 2)));
PyAPI_FUNC(Ty_ssize_t) TyBytes_Size(TyObject *);
PyAPI_FUNC(char *) TyBytes_AsString(TyObject *);
PyAPI_FUNC(TyObject *) TyBytes_Repr(TyObject *, int);
PyAPI_FUNC(void) TyBytes_Concat(TyObject **, TyObject *);
PyAPI_FUNC(void) TyBytes_ConcatAndDel(TyObject **, TyObject *);
PyAPI_FUNC(TyObject *) TyBytes_DecodeEscape(const char *, Ty_ssize_t,
                                            const char *, Ty_ssize_t,
                                            const char *);

/* Provides access to the internal data buffer and size of a bytes object.
   Passing NULL as len parameter will force the string buffer to be
   0-terminated (passing a string with embedded NUL characters will
   cause an exception).  */
PyAPI_FUNC(int) TyBytes_AsStringAndSize(
    TyObject *obj,      /* bytes object */
    char **s,           /* pointer to buffer variable */
    Ty_ssize_t *len     /* pointer to length variable or NULL */
    );

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_BYTESOBJECT_H
#  include "cpython/bytesobject.h"
#  undef Ty_CPYTHON_BYTESOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_BYTESOBJECT_H */
