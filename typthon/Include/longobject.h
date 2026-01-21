#ifndef Ty_LONGOBJECT_H
#define Ty_LONGOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif


/* Long (arbitrary precision) integer object interface */

// TyLong_Type is declared by object.h

#define TyLong_Check(op) \
        TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_LONG_SUBCLASS)
#define TyLong_CheckExact(op) Ty_IS_TYPE((op), &TyLong_Type)

PyAPI_FUNC(TyObject *) TyLong_FromLong(long);
PyAPI_FUNC(TyObject *) TyLong_FromUnsignedLong(unsigned long);
PyAPI_FUNC(TyObject *) TyLong_FromSize_t(size_t);
PyAPI_FUNC(TyObject *) TyLong_FromSsize_t(Ty_ssize_t);
PyAPI_FUNC(TyObject *) TyLong_FromDouble(double);

PyAPI_FUNC(long) TyLong_AsLong(TyObject *);
PyAPI_FUNC(long) TyLong_AsLongAndOverflow(TyObject *, int *);
PyAPI_FUNC(Ty_ssize_t) TyLong_AsSsize_t(TyObject *);
PyAPI_FUNC(size_t) TyLong_AsSize_t(TyObject *);
PyAPI_FUNC(unsigned long) TyLong_AsUnsignedLong(TyObject *);
PyAPI_FUNC(unsigned long) TyLong_AsUnsignedLongMask(TyObject *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(int) TyLong_AsInt(TyObject *);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030e0000
PyAPI_FUNC(TyObject*) TyLong_FromInt32(int32_t value);
PyAPI_FUNC(TyObject*) TyLong_FromUInt32(uint32_t value);
PyAPI_FUNC(TyObject*) TyLong_FromInt64(int64_t value);
PyAPI_FUNC(TyObject*) TyLong_FromUInt64(uint64_t value);

PyAPI_FUNC(int) TyLong_AsInt32(TyObject *obj, int32_t *value);
PyAPI_FUNC(int) TyLong_AsUInt32(TyObject *obj, uint32_t *value);
PyAPI_FUNC(int) TyLong_AsInt64(TyObject *obj, int64_t *value);
PyAPI_FUNC(int) TyLong_AsUInt64(TyObject *obj, uint64_t *value);

#define Ty_ASNATIVEBYTES_DEFAULTS -1
#define Ty_ASNATIVEBYTES_BIG_ENDIAN 0
#define Ty_ASNATIVEBYTES_LITTLE_ENDIAN 1
#define Ty_ASNATIVEBYTES_NATIVE_ENDIAN 3
#define Ty_ASNATIVEBYTES_UNSIGNED_BUFFER 4
#define Ty_ASNATIVEBYTES_REJECT_NEGATIVE 8
#define Ty_ASNATIVEBYTES_ALLOW_INDEX 16

/* TyLong_AsNativeBytes: Copy the integer value to a native variable.
   buffer points to the first byte of the variable.
   n_bytes is the number of bytes available in the buffer. Pass 0 to request
   the required size for the value.
   flags is a bitfield of the following flags:
   * 1 - little endian
   * 2 - native endian
   * 4 - unsigned destination (e.g. don't reject copying 255 into one byte)
   * 8 - raise an exception for negative inputs
   * 16 - call __index__ on non-int types
   If flags is -1 (all bits set), native endian is used, value truncation
   behaves most like C (allows negative inputs and allow MSB set), and non-int
   objects will raise a TypeError.
   Big endian mode will write the most significant byte into the address
   directly referenced by buffer; little endian will write the least significant
   byte into that address.

   If an exception is raised, returns a negative value.
   Otherwise, returns the number of bytes that are required to store the value.
   To check that the full value is represented, ensure that the return value is
   equal or less than n_bytes.
   All n_bytes are guaranteed to be written (unless an exception occurs), and
   so ignoring a positive return value is the equivalent of a downcast in C.
   In cases where the full value could not be represented, the returned value
   may be larger than necessary - this function is not an accurate way to
   calculate the bit length of an integer object.
   */
PyAPI_FUNC(Ty_ssize_t) TyLong_AsNativeBytes(TyObject* v, void* buffer,
    Ty_ssize_t n_bytes, int flags);

/* TyLong_FromNativeBytes: Create an int value from a native integer
   n_bytes is the number of bytes to read from the buffer. Passing 0 will
   always produce the zero int.
   TyLong_FromUnsignedNativeBytes always produces a non-negative int.
   flags is the same as for TyLong_AsNativeBytes, but only supports selecting
   the endianness or forcing an unsigned buffer.

   Returns the int object, or NULL with an exception set. */
PyAPI_FUNC(TyObject*) TyLong_FromNativeBytes(const void* buffer, size_t n_bytes,
    int flags);
PyAPI_FUNC(TyObject*) TyLong_FromUnsignedNativeBytes(const void* buffer,
    size_t n_bytes, int flags);

#endif

PyAPI_FUNC(TyObject *) TyLong_GetInfo(void);

/* It may be useful in the future. I've added it in the PyInt -> PyLong
   cleanup to keep the extra information. [CH] */
#define TyLong_AS_LONG(op) TyLong_AsLong(op)

/* Issue #1983: pid_t can be longer than a C long on some systems */
#if !defined(SIZEOF_PID_T) || SIZEOF_PID_T == SIZEOF_INT
#define _Ty_PARSE_PID "i"
#define TyLong_FromPid TyLong_FromLong
# if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
#   define TyLong_AsPid TyLong_AsInt
# elif SIZEOF_INT == SIZEOF_LONG
#   define TyLong_AsPid TyLong_AsLong
# else
static inline int
TyLong_AsPid(TyObject *obj)
{
    int overflow;
    long result = TyLong_AsLongAndOverflow(obj, &overflow);
    if (overflow || result > INT_MAX || result < INT_MIN) {
        TyErr_SetString(TyExc_OverflowError,
                        "Python int too large to convert to C int");
        return -1;
    }
    return (int)result;
}
# endif
#elif SIZEOF_PID_T == SIZEOF_LONG
#define _Ty_PARSE_PID "l"
#define TyLong_FromPid TyLong_FromLong
#define TyLong_AsPid TyLong_AsLong
#elif defined(SIZEOF_LONG_LONG) && SIZEOF_PID_T == SIZEOF_LONG_LONG
#define _Ty_PARSE_PID "L"
#define TyLong_FromPid TyLong_FromLongLong
#define TyLong_AsPid TyLong_AsLongLong
#else
#error "sizeof(pid_t) is neither sizeof(int), sizeof(long) or sizeof(long long)"
#endif /* SIZEOF_PID_T */

#if SIZEOF_VOID_P == SIZEOF_INT
#  define _Ty_PARSE_INTPTR "i"
#  define _Ty_PARSE_UINTPTR "I"
#elif SIZEOF_VOID_P == SIZEOF_LONG
#  define _Ty_PARSE_INTPTR "l"
#  define _Ty_PARSE_UINTPTR "k"
#elif defined(SIZEOF_LONG_LONG) && SIZEOF_VOID_P == SIZEOF_LONG_LONG
#  define _Ty_PARSE_INTPTR "L"
#  define _Ty_PARSE_UINTPTR "K"
#else
#  error "void* different in size from int, long and long long"
#endif /* SIZEOF_VOID_P */

PyAPI_FUNC(double) TyLong_AsDouble(TyObject *);
PyAPI_FUNC(TyObject *) TyLong_FromVoidPtr(void *);
PyAPI_FUNC(void *) TyLong_AsVoidPtr(TyObject *);

PyAPI_FUNC(TyObject *) TyLong_FromLongLong(long long);
PyAPI_FUNC(TyObject *) TyLong_FromUnsignedLongLong(unsigned long long);
PyAPI_FUNC(long long) TyLong_AsLongLong(TyObject *);
PyAPI_FUNC(unsigned long long) TyLong_AsUnsignedLongLong(TyObject *);
PyAPI_FUNC(unsigned long long) TyLong_AsUnsignedLongLongMask(TyObject *);
PyAPI_FUNC(long long) TyLong_AsLongLongAndOverflow(TyObject *, int *);

PyAPI_FUNC(TyObject *) TyLong_FromString(const char *, char **, int);

/* These aren't really part of the int object, but they're handy. The
   functions are in Python/mystrtoul.c.
 */
PyAPI_FUNC(unsigned long) TyOS_strtoul(const char *, char **, int);
PyAPI_FUNC(long) TyOS_strtol(const char *, char **, int);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_LONGOBJECT_H
#  include "cpython/longobject.h"
#  undef Ty_CPYTHON_LONGOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_LONGOBJECT_H */
