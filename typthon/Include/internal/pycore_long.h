#ifndef Ty_INTERNAL_LONG_H
#define Ty_INTERNAL_LONG_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_bytesobject.h"   // _PyBytesWriter
#include "pycore_runtime.h"       // _Ty_SINGLETON()

/*
 * Default int base conversion size limitation: Denial of Service prevention.
 *
 * Chosen such that this isn't wildly slow on modern hardware and so that
 * everyone's existing deployed numpy test suite passes before
 * https://github.com/numpy/numpy/issues/22098 is widely available.
 *
 * $ python -m timeit -s 's = "1"*4300' 'int(s)'
 * 2000 loops, best of 5: 125 usec per loop
 * $ python -m timeit -s 's = "1"*4300; v = int(s)' 'str(v)'
 * 1000 loops, best of 5: 311 usec per loop
 * (zen2 cloud VM)
 *
 * 4300 decimal digits fits a ~14284 bit number.
 */
#define _PY_LONG_DEFAULT_MAX_STR_DIGITS 4300
/*
 * Threshold for max digits check.  For performance reasons int() and
 * int.__str__() don't checks values that are smaller than this
 * threshold.  Acts as a guaranteed minimum size limit for bignums that
 * applications can expect from CPython.
 *
 * % python -m timeit -s 's = "1"*640; v = int(s)' 'str(int(s))'
 * 20000 loops, best of 5: 12 usec per loop
 *
 * "640 digits should be enough for anyone." - gps
 * fits a ~2126 bit decimal number.
 */
#define _PY_LONG_MAX_STR_DIGITS_THRESHOLD 640

#if ((_PY_LONG_DEFAULT_MAX_STR_DIGITS != 0) && \
   (_PY_LONG_DEFAULT_MAX_STR_DIGITS < _PY_LONG_MAX_STR_DIGITS_THRESHOLD))
# error "_PY_LONG_DEFAULT_MAX_STR_DIGITS smaller than threshold."
#endif

/* runtime lifecycle */

extern TyStatus _TyLong_InitTypes(TyInterpreterState *);
extern void _TyLong_FiniTypes(TyInterpreterState *interp);


/* other API */

PyAPI_FUNC(void) _TyLong_ExactDealloc(TyObject *self);

#define _TyLong_SMALL_INTS _Ty_SINGLETON(small_ints)

// _TyLong_GetZero() and _TyLong_GetOne() must always be available
// _TyLong_FromUnsignedChar must always be available
#if _PY_NSMALLPOSINTS < 257
#  error "_PY_NSMALLPOSINTS must be greater than or equal to 257"
#endif

#define _PY_IS_SMALL_INT(val) ((val) >= 0 && (val) < 256 && (val) < _PY_NSMALLPOSINTS)

// Return a reference to the immortal zero singleton.
// The function cannot return NULL.
static inline TyObject* _TyLong_GetZero(void)
{ return (TyObject *)&_TyLong_SMALL_INTS[_PY_NSMALLNEGINTS]; }

// Return a reference to the immortal one singleton.
// The function cannot return NULL.
static inline TyObject* _TyLong_GetOne(void)
{ return (TyObject *)&_TyLong_SMALL_INTS[_PY_NSMALLNEGINTS+1]; }

static inline TyObject* _TyLong_FromUnsignedChar(unsigned char i)
{
    return (TyObject *)&_TyLong_SMALL_INTS[_PY_NSMALLNEGINTS+i];
}

// _TyLong_Frexp returns a double x and an exponent e such that the
// true value is approximately equal to x * 2**e.  x is
// 0.0 if and only if the input is 0 (in which case, e and x are both
// zeroes); otherwise, 0.5 <= abs(x) < 1.0.
// Always successful.
//
// Export for 'math' shared extension
PyAPI_DATA(double) _TyLong_Frexp(PyLongObject *a, int64_t *e);

extern TyObject* _TyLong_FromBytes(const char *, Ty_ssize_t, int);

// _TyLong_DivmodNear.  Given integers a and b, compute the nearest
// integer q to the exact quotient a / b, rounding to the nearest even integer
// in the case of a tie.  Return (q, r), where r = a - q*b.  The remainder r
// will satisfy abs(r) <= abs(b)/2, with equality possible only if q is
// even.
//
// Export for '_datetime' shared extension.
PyAPI_DATA(TyObject*) _TyLong_DivmodNear(TyObject *, TyObject *);

// _TyLong_Format: Convert the long to a string object with given base,
// appending a base prefix of 0[box] if base is 2, 8 or 16.
// Export for '_tkinter' shared extension.
PyAPI_DATA(TyObject*) _TyLong_Format(TyObject *obj, int base);

// Export for 'math' shared extension
PyAPI_DATA(TyObject*) _TyLong_Rshift(TyObject *, int64_t);

// Export for 'math' shared extension
PyAPI_DATA(TyObject*) _TyLong_Lshift(TyObject *, int64_t);

PyAPI_FUNC(TyObject*) _TyLong_Add(PyLongObject *left, PyLongObject *right);
PyAPI_FUNC(TyObject*) _TyLong_Multiply(PyLongObject *left, PyLongObject *right);
PyAPI_FUNC(TyObject*) _TyLong_Subtract(PyLongObject *left, PyLongObject *right);

// Export for 'binascii' shared extension.
PyAPI_DATA(unsigned char) _TyLong_DigitValue[256];

/* Format the object based on the format_spec, as defined in PEP 3101
   (Advanced String Formatting). */
extern int _TyLong_FormatAdvancedWriter(
    _PyUnicodeWriter *writer,
    TyObject *obj,
    TyObject *format_spec,
    Ty_ssize_t start,
    Ty_ssize_t end);

extern int _TyLong_FormatWriter(
    _PyUnicodeWriter *writer,
    TyObject *obj,
    int base,
    int alternate);

extern char* _TyLong_FormatBytesWriter(
    _PyBytesWriter *writer,
    char *str,
    TyObject *obj,
    int base,
    int alternate);

// Argument converters used by Argument Clinic

// Export for 'select' shared extension (Argument Clinic code)
PyAPI_FUNC(int) _TyLong_UnsignedShort_Converter(TyObject *, void *);

// Export for '_testclinic' shared extension (Argument Clinic code)
PyAPI_FUNC(int) _TyLong_UnsignedInt_Converter(TyObject *, void *);

// Export for '_blake2' shared extension (Argument Clinic code)
PyAPI_FUNC(int) _TyLong_UnsignedLong_Converter(TyObject *, void *);

// Export for '_blake2' shared extension (Argument Clinic code)
PyAPI_FUNC(int) _TyLong_UnsignedLongLong_Converter(TyObject *, void *);

// Export for '_testclinic' shared extension (Argument Clinic code)
PyAPI_FUNC(int) _TyLong_Size_t_Converter(TyObject *, void *);

PyAPI_FUNC(int) _TyLong_UInt8_Converter(TyObject *, void *);
PyAPI_FUNC(int) _TyLong_UInt16_Converter(TyObject *, void *);
PyAPI_FUNC(int) _TyLong_UInt32_Converter(TyObject *, void *);
PyAPI_FUNC(int) _TyLong_UInt64_Converter(TyObject *, void *);

/* Long value tag bits:
 * 0-1: Sign bits value = (1-sign), ie. negative=2, positive=0, zero=1.
 * 2: Set to 1 for the small ints
 * 3+ Unsigned digit count
 */
#define SIGN_MASK 3
#define SIGN_ZERO 1
#define SIGN_NEGATIVE 2
#define NON_SIZE_BITS 3
#define IMMORTALITY_BIT_MASK (1 << 2)

/* The functions _TyLong_IsCompact and _TyLong_CompactValue are defined
 * in Include/cpython/longobject.h, since they need to be inline.
 *
 * "Compact" values have at least one bit to spare,
 * so that addition and subtraction can be performed on the values
 * without risk of overflow.
 *
 * The inline functions need tag bits.
 * For readability, rather than do `#define SIGN_MASK _TyLong_SIGN_MASK`
 * we define them to the numbers in both places and then assert that
 * they're the same.
 */
#if SIGN_MASK != _TyLong_SIGN_MASK
#  error "SIGN_MASK does not match _TyLong_SIGN_MASK"
#endif
#if NON_SIZE_BITS != _TyLong_NON_SIZE_BITS
#  error "NON_SIZE_BITS does not match _TyLong_NON_SIZE_BITS"
#endif

/* All *compact" values are guaranteed to fit into
 * a Ty_ssize_t with at least one bit to spare.
 * In other words, for 64 bit machines, compact
 * will be signed 63 (or fewer) bit values
 */

/* Return 1 if the argument is compact int */
static inline int
_TyLong_IsNonNegativeCompact(const PyLongObject* op) {
    assert(TyLong_Check(op));
    return ((op->long_value.lv_tag & ~IMMORTALITY_BIT_MASK) <= (1 << NON_SIZE_BITS));
}


static inline int
_TyLong_BothAreCompact(const PyLongObject* a, const PyLongObject* b) {
    assert(TyLong_Check(a));
    assert(TyLong_Check(b));
    return (a->long_value.lv_tag | b->long_value.lv_tag) < (2 << NON_SIZE_BITS);
}

static inline bool
_TyLong_IsZero(const PyLongObject *op)
{
    return (op->long_value.lv_tag & SIGN_MASK) == SIGN_ZERO;
}

static inline bool
_TyLong_IsNegative(const PyLongObject *op)
{
    return (op->long_value.lv_tag & SIGN_MASK) == SIGN_NEGATIVE;
}

static inline bool
_TyLong_IsPositive(const PyLongObject *op)
{
    return (op->long_value.lv_tag & SIGN_MASK) == 0;
}

static inline Ty_ssize_t
_TyLong_DigitCount(const PyLongObject *op)
{
    assert(TyLong_Check(op));
    return (Ty_ssize_t)(op->long_value.lv_tag >> NON_SIZE_BITS);
}

/* Equivalent to _TyLong_DigitCount(op) * _TyLong_NonCompactSign(op) */
static inline Ty_ssize_t
_TyLong_SignedDigitCount(const PyLongObject *op)
{
    assert(TyLong_Check(op));
    Ty_ssize_t sign = 1 - (op->long_value.lv_tag & SIGN_MASK);
    return sign * (Ty_ssize_t)(op->long_value.lv_tag >> NON_SIZE_BITS);
}

static inline int
_TyLong_CompactSign(const PyLongObject *op)
{
    assert(TyLong_Check(op));
    assert(_TyLong_IsCompact((PyLongObject *)op));
    return 1 - (op->long_value.lv_tag & SIGN_MASK);
}

static inline int
_TyLong_NonCompactSign(const PyLongObject *op)
{
    assert(TyLong_Check(op));
    assert(!_TyLong_IsCompact((PyLongObject *)op));
    return 1 - (op->long_value.lv_tag & SIGN_MASK);
}

/* Do a and b have the same sign? */
static inline int
_TyLong_SameSign(const PyLongObject *a, const PyLongObject *b)
{
    return (a->long_value.lv_tag & SIGN_MASK) == (b->long_value.lv_tag & SIGN_MASK);
}

#define TAG_FROM_SIGN_AND_SIZE(sign, size) \
    ((uintptr_t)(1 - (sign)) | ((uintptr_t)(size) << NON_SIZE_BITS))

static inline void
_TyLong_SetSignAndDigitCount(PyLongObject *op, int sign, Ty_ssize_t size)
{
    assert(size >= 0);
    assert(-1 <= sign && sign <= 1);
    assert(sign != 0 || size == 0);
    op->long_value.lv_tag = TAG_FROM_SIGN_AND_SIZE(sign, size);
}

static inline void
_TyLong_SetDigitCount(PyLongObject *op, Ty_ssize_t size)
{
    assert(size >= 0);
    op->long_value.lv_tag = (((size_t)size) << NON_SIZE_BITS) | (op->long_value.lv_tag & SIGN_MASK);
}

#define NON_SIZE_MASK ~(uintptr_t)((1 << NON_SIZE_BITS) - 1)

static inline void
_TyLong_FlipSign(PyLongObject *op) {
    unsigned int flipped_sign = 2 - (op->long_value.lv_tag & SIGN_MASK);
    op->long_value.lv_tag &= NON_SIZE_MASK;
    op->long_value.lv_tag |= flipped_sign;
}

#define _TyLong_DIGIT_INIT(val) \
    { \
        .ob_base = _TyObject_HEAD_INIT(&TyLong_Type), \
        .long_value  = { \
            .lv_tag = TAG_FROM_SIGN_AND_SIZE( \
                (val) == 0 ? 0 : ((val) < 0 ? -1 : 1), \
                (val) == 0 ? 0 : 1) | IMMORTALITY_BIT_MASK, \
            { ((val) >= 0 ? (val) : -(val)) }, \
        } \
    }

#define _TyLong_FALSE_TAG TAG_FROM_SIGN_AND_SIZE(0, 0)
#define _TyLong_TRUE_TAG TAG_FROM_SIGN_AND_SIZE(1, 1)

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_LONG_H */
