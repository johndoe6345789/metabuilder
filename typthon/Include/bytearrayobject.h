/* ByteArray object interface */

#ifndef Ty_BYTEARRAYOBJECT_H
#define Ty_BYTEARRAYOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* Type PyByteArrayObject represents a mutable array of bytes.
 * The Python API is that of a sequence;
 * the bytes are mapped to ints in [0, 256).
 * Bytes are not characters; they may be used to encode characters.
 * The only way to go between bytes and str/unicode is via encoding
 * and decoding.
 * For the convenience of C programmers, the bytes type is considered
 * to contain a char pointer, not an unsigned char pointer.
 */

/* Type object */
PyAPI_DATA(TyTypeObject) TyByteArray_Type;
PyAPI_DATA(TyTypeObject) PyByteArrayIter_Type;

/* Type check macros */
#define TyByteArray_Check(self) PyObject_TypeCheck((self), &TyByteArray_Type)
#define TyByteArray_CheckExact(self) Ty_IS_TYPE((self), &TyByteArray_Type)

/* Direct API functions */
PyAPI_FUNC(TyObject *) TyByteArray_FromObject(TyObject *);
PyAPI_FUNC(TyObject *) TyByteArray_Concat(TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyByteArray_FromStringAndSize(const char *, Ty_ssize_t);
PyAPI_FUNC(Ty_ssize_t) TyByteArray_Size(TyObject *);
PyAPI_FUNC(char *) TyByteArray_AsString(TyObject *);
PyAPI_FUNC(int) TyByteArray_Resize(TyObject *, Ty_ssize_t);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_BYTEARRAYOBJECT_H
#  include "cpython/bytearrayobject.h"
#  undef Ty_CPYTHON_BYTEARRAYOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_BYTEARRAYOBJECT_H */
