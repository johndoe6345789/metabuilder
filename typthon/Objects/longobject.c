/* Long (arbitrary precision) integer object implementation */

/* XXX The functional organization of this file is terrible */

#include "Python.h"
#include "pycore_bitutils.h"      // _Ty_popcount32()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_call.h"          // _TyObject_MakeTpCall
#include "pycore_freelist.h"      // _Ty_FREELIST_FREE, _Ty_FREELIST_POP
#include "pycore_long.h"          // _Ty_SmallInts
#include "pycore_object.h"        // _TyObject_Init()
#include "pycore_runtime.h"       // _PY_NSMALLPOSINTS
#include "pycore_structseq.h"     // _PyStructSequence_FiniBuiltin()
#include "pycore_unicodeobject.h" // _TyUnicode_Equal()

#include <float.h>                // DBL_MANT_DIG
#include <stddef.h>               // offsetof

#include "clinic/longobject.c.h"
/*[clinic input]
class int "TyObject *" "&TyLong_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=ec0275e3422a36e3]*/

#define medium_value(x) ((stwodigits)_TyLong_CompactValue(x))

#define IS_SMALL_INT(ival) (-_PY_NSMALLNEGINTS <= (ival) && (ival) < _PY_NSMALLPOSINTS)
#define IS_SMALL_UINT(ival) ((ival) < _PY_NSMALLPOSINTS)

#define _MAX_STR_DIGITS_ERROR_FMT_TO_INT "Exceeds the limit (%d digits) for integer string conversion: value has %zd digits; use sys.set_int_max_str_digits() to increase the limit"
#define _MAX_STR_DIGITS_ERROR_FMT_TO_STR "Exceeds the limit (%d digits) for integer string conversion; use sys.set_int_max_str_digits() to increase the limit"

/* If defined, use algorithms from the _pylong.py module */
#define WITH_PYLONG_MODULE 1

// Forward declarations
static PyLongObject* long_neg(PyLongObject *v);
static PyLongObject *x_divrem(PyLongObject *, PyLongObject *, PyLongObject **);
static TyObject* long_long(TyObject *v);
static TyObject* long_lshift_int64(PyLongObject *a, int64_t shiftby);


static inline void
_Ty_DECREF_INT(PyLongObject *op)
{
    assert(TyLong_CheckExact(op));
    _Ty_DECREF_SPECIALIZED((TyObject *)op, _TyLong_ExactDealloc);
}

static inline int
is_medium_int(stwodigits x)
{
    /* Take care that we are comparing unsigned values. */
    twodigits x_plus_mask = ((twodigits)x) + TyLong_MASK;
    return x_plus_mask < ((twodigits)TyLong_MASK) + TyLong_BASE;
}

static TyObject *
get_small_int(sdigit ival)
{
    assert(IS_SMALL_INT(ival));
    return (TyObject *)&_TyLong_SMALL_INTS[_PY_NSMALLNEGINTS + ival];
}

static PyLongObject *
maybe_small_long(PyLongObject *v)
{
    if (v && _TyLong_IsCompact(v)) {
        stwodigits ival = medium_value(v);
        if (IS_SMALL_INT(ival)) {
            _Ty_DECREF_INT(v);
            return (PyLongObject *)get_small_int((sdigit)ival);
        }
    }
    return v;
}

/* For int multiplication, use the O(N**2) school algorithm unless
 * both operands contain more than KARATSUBA_CUTOFF digits (this
 * being an internal Python int digit, in base BASE).
 */
#define KARATSUBA_CUTOFF 70
#define KARATSUBA_SQUARE_CUTOFF (2 * KARATSUBA_CUTOFF)

/* For exponentiation, use the binary left-to-right algorithm unless the
 ^ exponent contains more than HUGE_EXP_CUTOFF bits.  In that case, do
 * (no more than) EXP_WINDOW_SIZE bits at a time.  The potential drawback is
 * that a table of 2**(EXP_WINDOW_SIZE - 1) intermediate results is
 * precomputed.
 */
#define EXP_WINDOW_SIZE 5
#define EXP_TABLE_LEN (1 << (EXP_WINDOW_SIZE - 1))
/* Suppose the exponent has bit length e. All ways of doing this
 * need e squarings. The binary method also needs a multiply for
 * each bit set. In a k-ary method with window width w, a multiply
 * for each non-zero window, so at worst (and likely!)
 * ceiling(e/w). The k-ary sliding window method has the same
 * worst case, but the window slides so it can sometimes skip
 * over an all-zero window that the fixed-window method can't
 * exploit. In addition, the windowing methods need multiplies
 * to precompute a table of small powers.
 *
 * For the sliding window method with width 5, 16 precomputation
 * multiplies are needed. Assuming about half the exponent bits
 * are set, then, the binary method needs about e/2 extra mults
 * and the window method about 16 + e/5.
 *
 * The latter is smaller for e > 53 1/3. We don't have direct
 * access to the bit length, though, so call it 60, which is a
 * multiple of a long digit's max bit length (15 or 30 so far).
 */
#define HUGE_EXP_CUTOFF 60

#define SIGCHECK(PyTryBlock)                    \
    do {                                        \
        if (TyErr_CheckSignals()) PyTryBlock    \
    } while(0)

/* Normalize (remove leading zeros from) an int object.
   Doesn't attempt to free the storage--in most cases, due to the nature
   of the algorithms used, this could save at most be one word anyway. */

static PyLongObject *
long_normalize(PyLongObject *v)
{
    Ty_ssize_t j = _TyLong_DigitCount(v);
    Ty_ssize_t i = j;

    while (i > 0 && v->long_value.ob_digit[i-1] == 0)
        --i;
    if (i != j) {
        if (i == 0) {
            _TyLong_SetSignAndDigitCount(v, 0, 0);
        }
        else {
            _TyLong_SetDigitCount(v, i);
        }
    }
    return v;
}

/* Allocate a new int object with size digits.
   Return NULL and set exception if we run out of memory. */

#if SIZEOF_SIZE_T < 8
# define MAX_LONG_DIGITS \
    ((PY_SSIZE_T_MAX - offsetof(PyLongObject, long_value.ob_digit))/sizeof(digit))
#else
/* Guarantee that the number of bits fits in int64_t.
   This is more than an exbibyte, that is more than many of modern
   architectures support in principle.
   -1 is added to avoid overflow in _TyLong_Frexp(). */
# define MAX_LONG_DIGITS ((INT64_MAX-1) / TyLong_SHIFT)
#endif

static PyLongObject *
long_alloc(Ty_ssize_t size)
{
    assert(size >= 0);
    PyLongObject *result = NULL;
    if (size > (Ty_ssize_t)MAX_LONG_DIGITS) {
        TyErr_SetString(TyExc_OverflowError,
                        "too many digits in integer");
        return NULL;
    }
    /* Fast operations for single digit integers (including zero)
     * assume that there is always at least one digit present. */
    Ty_ssize_t ndigits = size ? size : 1;

    if (ndigits == 1) {
        result = (PyLongObject *)_Ty_FREELIST_POP(PyLongObject, ints);
    }
    if (result == NULL) {
        /* Number of bytes needed is: offsetof(PyLongObject, ob_digit) +
        sizeof(digit)*size.  Previous incarnations of this code used
        sizeof() instead of the offsetof, but this risks being
        incorrect in the presence of padding between the header
        and the digits. */
        result = PyObject_Malloc(offsetof(PyLongObject, long_value.ob_digit) +
                                ndigits*sizeof(digit));
        if (!result) {
            TyErr_NoMemory();
            return NULL;
        }
        _TyObject_Init((TyObject*)result, &TyLong_Type);
    }
    _TyLong_SetSignAndDigitCount(result, size != 0, size);
    /* The digit has to be initialized explicitly to avoid
     * use-of-uninitialized-value. */
    result->long_value.ob_digit[0] = 0;
    return result;
}

PyLongObject *
_TyLong_New(Ty_ssize_t size)
{
    return long_alloc(size);
}

PyLongObject *
_TyLong_FromDigits(int negative, Ty_ssize_t digit_count, digit *digits)
{
    assert(digit_count >= 0);
    if (digit_count == 0) {
        return (PyLongObject *)_TyLong_GetZero();
    }
    PyLongObject *result = long_alloc(digit_count);
    if (result == NULL) {
        return NULL;
    }
    _TyLong_SetSignAndDigitCount(result, negative?-1:1, digit_count);
    memcpy(result->long_value.ob_digit, digits, digit_count * sizeof(digit));
    return result;
}

TyObject *
_TyLong_Copy(PyLongObject *src)
{
    assert(src != NULL);
    int sign;

    if (_TyLong_IsCompact(src)) {
        stwodigits ival = medium_value(src);
        if (IS_SMALL_INT(ival)) {
            return get_small_int((sdigit)ival);
        }
        sign = _TyLong_CompactSign(src);
    }
    else {
        sign = _TyLong_NonCompactSign(src);
    }

    Ty_ssize_t size = _TyLong_DigitCount(src);
    PyLongObject *result = long_alloc(size);

    if (result == NULL) {
        return NULL;
    }
    _TyLong_SetSignAndDigitCount(result, sign, size);
    memcpy(result->long_value.ob_digit, src->long_value.ob_digit,
           size * sizeof(digit));
    return (TyObject *)result;
}

static TyObject *
_TyLong_FromMedium(sdigit x)
{
    assert(!IS_SMALL_INT(x));
    assert(is_medium_int(x));

    PyLongObject *v = (PyLongObject *)_Ty_FREELIST_POP(PyLongObject, ints);
    if (v == NULL) {
        v = PyObject_Malloc(sizeof(PyLongObject));
        if (v == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
        _TyObject_Init((TyObject*)v, &TyLong_Type);
    }
    digit abs_x = x < 0 ? -x : x;
    _TyLong_SetSignAndDigitCount(v, x<0?-1:1, 1);
    v->long_value.ob_digit[0] = abs_x;
    return (TyObject*)v;
}

static TyObject *
_TyLong_FromLarge(stwodigits ival)
{
    twodigits abs_ival;
    int sign;
    assert(!is_medium_int(ival));

    if (ival < 0) {
        /* negate: can't write this as abs_ival = -ival since that
           invokes undefined behaviour when ival is LONG_MIN */
        abs_ival = 0U-(twodigits)ival;
        sign = -1;
    }
    else {
        abs_ival = (twodigits)ival;
        sign = 1;
    }
    /* Must be at least two digits */
    assert(abs_ival >> TyLong_SHIFT != 0);
    twodigits t = abs_ival >> (TyLong_SHIFT * 2);
    Ty_ssize_t ndigits = 2;
    while (t) {
        ++ndigits;
        t >>= TyLong_SHIFT;
    }
    PyLongObject *v = long_alloc(ndigits);
    if (v != NULL) {
        digit *p = v->long_value.ob_digit;
        _TyLong_SetSignAndDigitCount(v, sign, ndigits);
        t = abs_ival;
        while (t) {
            *p++ = Ty_SAFE_DOWNCAST(
                t & TyLong_MASK, twodigits, digit);
            t >>= TyLong_SHIFT;
        }
    }
    return (TyObject *)v;
}

/* Create a new int object from a C word-sized int */
static inline PyLongObject *
_TyLong_FromSTwoDigits(stwodigits x)
{
    if (IS_SMALL_INT(x)) {
        return (PyLongObject*)get_small_int((sdigit)x);
    }
    assert(x != 0);
    if (is_medium_int(x)) {
        return (PyLongObject*)_TyLong_FromMedium((sdigit)x);
    }
    return (PyLongObject*)_TyLong_FromLarge(x);
}

/* If a freshly-allocated int is already shared, it must
   be a small integer, so negating it must go to TyLong_FromLong */
Ty_LOCAL_INLINE(void)
_TyLong_Negate(PyLongObject **x_p)
{
    PyLongObject *x;

    x = (PyLongObject *)*x_p;
    if (Ty_REFCNT(x) == 1) {
         _TyLong_FlipSign(x);
        return;
    }

    *x_p = _TyLong_FromSTwoDigits(-medium_value(x));
    Ty_DECREF(x);
}

#define PYLONG_FROM_INT(UINT_TYPE, INT_TYPE, ival)                                  \
    do {                                                                            \
        /* Handle small and medium cases. */                                        \
        if (IS_SMALL_INT(ival)) {                                                   \
            return get_small_int((sdigit)(ival));                                   \
        }                                                                           \
        if (-(INT_TYPE)TyLong_MASK <= (ival) && (ival) <= (INT_TYPE)TyLong_MASK) {  \
            return _TyLong_FromMedium((sdigit)(ival));                              \
        }                                                                           \
        UINT_TYPE abs_ival = (ival) < 0 ? 0U-(UINT_TYPE)(ival) : (UINT_TYPE)(ival); \
        /* Do shift in two steps to avoid possible undefined behavior. */           \
        UINT_TYPE t = abs_ival >> TyLong_SHIFT >> TyLong_SHIFT;                     \
        /* Count digits (at least two - smaller cases were handled above). */       \
        Ty_ssize_t ndigits = 2;                                                     \
        while (t) {                                                                 \
            ++ndigits;                                                              \
            t >>= TyLong_SHIFT;                                                     \
        }                                                                           \
        /* Construct output value. */                                               \
        PyLongObject *v = long_alloc(ndigits);                                      \
        if (v == NULL) {                                                            \
            return NULL;                                                            \
        }                                                                           \
        digit *p = v->long_value.ob_digit;                                          \
        _TyLong_SetSignAndDigitCount(v, (ival) < 0 ? -1 : 1, ndigits);              \
        t = abs_ival;                                                               \
        while (t) {                                                                 \
            *p++ = (digit)(t & TyLong_MASK);                                        \
            t >>= TyLong_SHIFT;                                                     \
        }                                                                           \
        return (TyObject *)v;                                                       \
    } while(0)


/* Create a new int object from a C long int */

TyObject *
TyLong_FromLong(long ival)
{
    PYLONG_FROM_INT(unsigned long, long, ival);
}

#define PYLONG_FROM_UINT(INT_TYPE, ival) \
    do { \
        /* Handle small and medium cases. */ \
        if (IS_SMALL_UINT(ival)) { \
            return get_small_int((sdigit)(ival)); \
        } \
        if ((ival) <= TyLong_MASK) { \
            return _TyLong_FromMedium((sdigit)(ival)); \
        } \
        /* Do shift in two steps to avoid possible undefined behavior. */ \
        INT_TYPE t = (ival) >> TyLong_SHIFT >> TyLong_SHIFT; \
        /* Count digits (at least two - smaller cases were handled above). */ \
        Ty_ssize_t ndigits = 2; \
        while (t) { \
            ++ndigits; \
            t >>= TyLong_SHIFT; \
        } \
        /* Construct output value. */ \
        PyLongObject *v = long_alloc(ndigits); \
        if (v == NULL) { \
            return NULL; \
        } \
        digit *p = v->long_value.ob_digit; \
        while ((ival)) { \
            *p++ = (digit)((ival) & TyLong_MASK); \
            (ival) >>= TyLong_SHIFT; \
        } \
        return (TyObject *)v; \
    } while(0)

/* Create a new int object from a C unsigned long int */

TyObject *
TyLong_FromUnsignedLong(unsigned long ival)
{
    PYLONG_FROM_UINT(unsigned long, ival);
}

/* Create a new int object from a C unsigned long long int. */

TyObject *
TyLong_FromUnsignedLongLong(unsigned long long ival)
{
    PYLONG_FROM_UINT(unsigned long long, ival);
}

/* Create a new int object from a C size_t. */

TyObject *
TyLong_FromSize_t(size_t ival)
{
    PYLONG_FROM_UINT(size_t, ival);
}

/* Create a new int object from a C double */

TyObject *
TyLong_FromDouble(double dval)
{
    /* Try to get out cheap if this fits in a long. When a finite value of real
     * floating type is converted to an integer type, the value is truncated
     * toward zero. If the value of the integral part cannot be represented by
     * the integer type, the behavior is undefined. Thus, we must check that
     * value is in range (LONG_MIN - 1, LONG_MAX + 1). If a long has more bits
     * of precision than a double, casting LONG_MIN - 1 to double may yield an
     * approximation, but LONG_MAX + 1 is a power of two and can be represented
     * as double exactly (assuming FLT_RADIX is 2 or 16), so for simplicity
     * check against [-(LONG_MAX + 1), LONG_MAX + 1).
     */
    const double int_max = (unsigned long)LONG_MAX + 1;
    if (-int_max < dval && dval < int_max) {
        return TyLong_FromLong((long)dval);
    }

    PyLongObject *v;
    double frac;
    int i, ndig, expo, neg;
    neg = 0;
    if (isinf(dval)) {
        TyErr_SetString(TyExc_OverflowError,
                        "cannot convert float infinity to integer");
        return NULL;
    }
    if (isnan(dval)) {
        TyErr_SetString(TyExc_ValueError,
                        "cannot convert float NaN to integer");
        return NULL;
    }
    if (dval < 0.0) {
        neg = 1;
        dval = -dval;
    }
    frac = frexp(dval, &expo); /* dval = frac*2**expo; 0.0 <= frac < 1.0 */
    assert(expo > 0);
    ndig = (expo-1) / TyLong_SHIFT + 1; /* Number of 'digits' in result */
    v = long_alloc(ndig);
    if (v == NULL)
        return NULL;
    frac = ldexp(frac, (expo-1) % TyLong_SHIFT + 1);
    for (i = ndig; --i >= 0; ) {
        digit bits = (digit)frac;
        v->long_value.ob_digit[i] = bits;
        frac = frac - (double)bits;
        frac = ldexp(frac, TyLong_SHIFT);
    }
    if (neg) {
        _TyLong_FlipSign(v);
    }
    return (TyObject *)v;
}

/* Checking for overflow in TyLong_AsLong is a PITA since C doesn't define
 * anything about what happens when a signed integer operation overflows,
 * and some compilers think they're doing you a favor by being "clever"
 * then.  The bit pattern for the largest positive signed long is
 * (unsigned long)LONG_MAX, and for the smallest negative signed long
 * it is abs(LONG_MIN), which we could write -(unsigned long)LONG_MIN.
 * However, some other compilers warn about applying unary minus to an
 * unsigned operand.  Hence the weird "0-".
 */
#define PY_ABS_LONG_MIN         (0-(unsigned long)LONG_MIN)
#define PY_ABS_SSIZE_T_MIN      (0-(size_t)PY_SSIZE_T_MIN)

/* Get a C long int from an int object or any object that has an __index__
   method.

   On overflow, return -1 and set *overflow to 1 or -1 depending on the sign of
   the result.  Otherwise *overflow is 0.

   For other errors (e.g., TypeError), return -1 and set an error condition.
   In this case *overflow will be 0.
*/

long
TyLong_AsLongAndOverflow(TyObject *vv, int *overflow)
{
    /* This version by Tim Peters */
    PyLongObject *v;
    unsigned long x, prev;
    long res;
    Ty_ssize_t i;
    int sign;
    int do_decref = 0; /* if PyNumber_Index was called */

    *overflow = 0;
    if (vv == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }

    if (TyLong_Check(vv)) {
        v = (PyLongObject *)vv;
    }
    else {
        v = (PyLongObject *)_PyNumber_Index(vv);
        if (v == NULL)
            return -1;
        do_decref = 1;
    }
    if (_TyLong_IsCompact(v)) {
#if SIZEOF_LONG < SIZEOF_SIZE_T
        Ty_ssize_t tmp = _TyLong_CompactValue(v);
        if (tmp < LONG_MIN) {
            *overflow = -1;
            res = -1;
        }
        else if (tmp > LONG_MAX) {
            *overflow = 1;
            res = -1;
        }
        else {
            res = (long)tmp;
        }
#else
        res = _TyLong_CompactValue(v);
#endif
    }
    else {
        res = -1;
        i = _TyLong_DigitCount(v);
        sign = _TyLong_NonCompactSign(v);
        x = 0;
        while (--i >= 0) {
            prev = x;
            x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
            if ((x >> TyLong_SHIFT) != prev) {
                *overflow = sign;
                goto exit;
            }
        }
        /* Haven't lost any bits, but casting to long requires extra
        * care (see comment above).
        */
        if (x <= (unsigned long)LONG_MAX) {
            res = (long)x * sign;
        }
        else if (sign < 0 && x == PY_ABS_LONG_MIN) {
            res = LONG_MIN;
        }
        else {
            *overflow = sign;
            /* res is already set to -1 */
        }
    }
  exit:
    if (do_decref) {
        Ty_DECREF(v);
    }
    return res;
}

/* Get a C long int from an int object or any object that has an __index__
   method.  Return -1 and set an error if overflow occurs. */

long
TyLong_AsLong(TyObject *obj)
{
    int overflow;
    long result = TyLong_AsLongAndOverflow(obj, &overflow);
    if (overflow) {
        /* XXX: could be cute and give a different
           message for overflow == -1 */
        TyErr_SetString(TyExc_OverflowError,
                        "Python int too large to convert to C long");
    }
    return result;
}

/* Get a C int from an int object or any object that has an __index__
   method.  Return -1 and set an error if overflow occurs. */

int
TyLong_AsInt(TyObject *obj)
{
    int overflow;
    long result = TyLong_AsLongAndOverflow(obj, &overflow);
    if (overflow || result > INT_MAX || result < INT_MIN) {
        /* XXX: could be cute and give a different
           message for overflow == -1 */
        TyErr_SetString(TyExc_OverflowError,
                        "Python int too large to convert to C int");
        return -1;
    }
    return (int)result;
}

/* Get a Ty_ssize_t from an int object.
   Returns -1 and sets an error condition if overflow occurs. */

Ty_ssize_t
TyLong_AsSsize_t(TyObject *vv) {
    PyLongObject *v;
    size_t x, prev;
    Ty_ssize_t i;
    int sign;

    if (vv == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (!TyLong_Check(vv)) {
        TyErr_SetString(TyExc_TypeError, "an integer is required");
        return -1;
    }

    v = (PyLongObject *)vv;
    if (_TyLong_IsCompact(v)) {
        return _TyLong_CompactValue(v);
    }
    i = _TyLong_DigitCount(v);
    sign = _TyLong_NonCompactSign(v);
    x = 0;
    while (--i >= 0) {
        prev = x;
        x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
        if ((x >> TyLong_SHIFT) != prev)
            goto overflow;
    }
    /* Haven't lost any bits, but casting to a signed type requires
     * extra care (see comment above).
     */
    if (x <= (size_t)PY_SSIZE_T_MAX) {
        return (Ty_ssize_t)x * sign;
    }
    else if (sign < 0 && x == PY_ABS_SSIZE_T_MIN) {
        return PY_SSIZE_T_MIN;
    }
    /* else overflow */

  overflow:
    TyErr_SetString(TyExc_OverflowError,
                    "Python int too large to convert to C ssize_t");
    return -1;
}

/* Get a C unsigned long int from an int object.
   Returns -1 and sets an error condition if overflow occurs. */

unsigned long
TyLong_AsUnsignedLong(TyObject *vv)
{
    PyLongObject *v;
    unsigned long x, prev;
    Ty_ssize_t i;

    if (vv == NULL) {
        TyErr_BadInternalCall();
        return (unsigned long)-1;
    }
    if (!TyLong_Check(vv)) {
        TyErr_SetString(TyExc_TypeError, "an integer is required");
        return (unsigned long)-1;
    }

    v = (PyLongObject *)vv;
    if (_TyLong_IsNonNegativeCompact(v)) {
#if SIZEOF_LONG < SIZEOF_SIZE_T
        size_t tmp = (size_t)_TyLong_CompactValue(v);
        unsigned long res = (unsigned long)tmp;
        if (res != tmp) {
            goto overflow;
        }
        return res;
#else
        return (unsigned long)(size_t)_TyLong_CompactValue(v);
#endif
    }
    if (_TyLong_IsNegative(v)) {
        TyErr_SetString(TyExc_OverflowError,
                        "can't convert negative value to unsigned int");
        return (unsigned long) -1;
    }
    i = _TyLong_DigitCount(v);
    x = 0;
    while (--i >= 0) {
        prev = x;
        x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
        if ((x >> TyLong_SHIFT) != prev) {
            goto overflow;
        }
    }
    return x;
overflow:
    TyErr_SetString(TyExc_OverflowError,
                    "Python int too large to convert "
                    "to C unsigned long");
    return (unsigned long) -1;
}

/* Get a C size_t from an int object. Returns (size_t)-1 and sets
   an error condition if overflow occurs. */

size_t
TyLong_AsSize_t(TyObject *vv)
{
    PyLongObject *v;
    size_t x, prev;
    Ty_ssize_t i;

    if (vv == NULL) {
        TyErr_BadInternalCall();
        return (size_t) -1;
    }
    if (!TyLong_Check(vv)) {
        TyErr_SetString(TyExc_TypeError, "an integer is required");
        return (size_t)-1;
    }

    v = (PyLongObject *)vv;
    if (_TyLong_IsNonNegativeCompact(v)) {
        return (size_t)_TyLong_CompactValue(v);
    }
    if (_TyLong_IsNegative(v)) {
        TyErr_SetString(TyExc_OverflowError,
                   "can't convert negative value to size_t");
        return (size_t) -1;
    }
    i = _TyLong_DigitCount(v);
    x = 0;
    while (--i >= 0) {
        prev = x;
        x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
        if ((x >> TyLong_SHIFT) != prev) {
            TyErr_SetString(TyExc_OverflowError,
                "Python int too large to convert to C size_t");
            return (size_t) -1;
        }
    }
    return x;
}

/* Get a C unsigned long int from an int object, ignoring the high bits.
   Returns -1 and sets an error condition if an error occurs. */

static unsigned long
_TyLong_AsUnsignedLongMask(TyObject *vv)
{
    PyLongObject *v;
    unsigned long x;
    Ty_ssize_t i;

    if (vv == NULL || !TyLong_Check(vv)) {
        TyErr_BadInternalCall();
        return (unsigned long) -1;
    }
    v = (PyLongObject *)vv;
    if (_TyLong_IsCompact(v)) {
#if SIZEOF_LONG < SIZEOF_SIZE_T
        return (unsigned long)(size_t)_TyLong_CompactValue(v);
#else
        return (unsigned long)(long)_TyLong_CompactValue(v);
#endif
    }
    i = _TyLong_DigitCount(v);
    int sign = _TyLong_NonCompactSign(v);
    x = 0;
    while (--i >= 0) {
        x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
    }
    return x * sign;
}

unsigned long
TyLong_AsUnsignedLongMask(TyObject *op)
{
    PyLongObject *lo;
    unsigned long val;

    if (op == NULL) {
        TyErr_BadInternalCall();
        return (unsigned long)-1;
    }

    if (TyLong_Check(op)) {
        return _TyLong_AsUnsignedLongMask(op);
    }

    lo = (PyLongObject *)_PyNumber_Index(op);
    if (lo == NULL)
        return (unsigned long)-1;

    val = _TyLong_AsUnsignedLongMask((TyObject *)lo);
    Ty_DECREF(lo);
    return val;
}

int
TyLong_IsPositive(TyObject *obj)
{
    assert(obj != NULL);
    if (!TyLong_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected int, got %T", obj);
        return -1;
    }
    return _TyLong_IsPositive((PyLongObject *)obj);
}

int
TyLong_IsNegative(TyObject *obj)
{
    assert(obj != NULL);
    if (!TyLong_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected int, got %T", obj);
        return -1;
    }
    return _TyLong_IsNegative((PyLongObject *)obj);
}

int
TyLong_IsZero(TyObject *obj)
{
    assert(obj != NULL);
    if (!TyLong_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expected int, got %T", obj);
        return -1;
    }
    return _TyLong_IsZero((PyLongObject *)obj);
}

static int
long_sign(TyObject *vv)
{
    assert(vv != NULL);
    assert(TyLong_Check(vv));
    PyLongObject *v = (PyLongObject *)vv;

    if (_TyLong_IsCompact(v)) {
        return _TyLong_CompactSign(v);
    }
    return _TyLong_NonCompactSign(v);
}

int
_TyLong_Sign(TyObject *vv)
{
    return long_sign(vv);
}

int
TyLong_GetSign(TyObject *vv, int *sign)
{
    if (!TyLong_Check(vv)) {
        TyErr_Format(TyExc_TypeError, "expect int, got %T", vv);
        return -1;
    }

    *sign = long_sign(vv);
    return 0;
}

static int
bit_length_digit(digit x)
{
    // digit can be larger than unsigned long, but only TyLong_SHIFT bits
    // of it will be ever used.
    static_assert(TyLong_SHIFT <= sizeof(unsigned long) * 8,
                  "digit is larger than unsigned long");
    return _Ty_bit_length((unsigned long)x);
}

int64_t
_TyLong_NumBits(TyObject *vv)
{
    PyLongObject *v = (PyLongObject *)vv;
    int64_t result = 0;
    Ty_ssize_t ndigits;
    int msd_bits;

    assert(v != NULL);
    assert(TyLong_Check(v));
    ndigits = _TyLong_DigitCount(v);
    assert(ndigits == 0 || v->long_value.ob_digit[ndigits - 1] != 0);
    if (ndigits > 0) {
        digit msd = v->long_value.ob_digit[ndigits - 1];
#if SIZEOF_SIZE_T == 8
        assert(ndigits <= INT64_MAX / TyLong_SHIFT);
#endif
        result = (int64_t)(ndigits - 1) * TyLong_SHIFT;
        msd_bits = bit_length_digit(msd);
        result += msd_bits;
    }
    return result;
}

TyObject *
_TyLong_FromByteArray(const unsigned char* bytes, size_t n,
                      int little_endian, int is_signed)
{
    const unsigned char* pstartbyte;    /* LSB of bytes */
    int incr;                           /* direction to move pstartbyte */
    const unsigned char* pendbyte;      /* MSB of bytes */
    size_t numsignificantbytes;         /* number of bytes that matter */
    Ty_ssize_t ndigits;                 /* number of Python int digits */
    PyLongObject* v;                    /* result */
    Ty_ssize_t idigit = 0;              /* next free index in v->long_value.ob_digit */

    if (n == 0)
        return TyLong_FromLong(0L);

    if (little_endian) {
        pstartbyte = bytes;
        pendbyte = bytes + n - 1;
        incr = 1;
    }
    else {
        pstartbyte = bytes + n - 1;
        pendbyte = bytes;
        incr = -1;
    }

    if (is_signed)
        is_signed = *pendbyte >= 0x80;

    /* Compute numsignificantbytes.  This consists of finding the most
       significant byte.  Leading 0 bytes are insignificant if the number
       is positive, and leading 0xff bytes if negative. */
    {
        size_t i;
        const unsigned char* p = pendbyte;
        const int pincr = -incr;  /* search MSB to LSB */
        const unsigned char insignificant = is_signed ? 0xff : 0x00;

        for (i = 0; i < n; ++i, p += pincr) {
            if (*p != insignificant)
                break;
        }
        numsignificantbytes = n - i;
        /* 2's-comp is a bit tricky here, e.g. 0xff00 == -0x0100, so
           actually has 2 significant bytes.  OTOH, 0xff0001 ==
           -0x00ffff, so we wouldn't *need* to bump it there; but we
           do for 0xffff = -0x0001.  To be safe without bothering to
           check every case, bump it regardless. */
        if (is_signed && numsignificantbytes < n)
            ++numsignificantbytes;
    }

    /* avoid integer overflow */
    ndigits = numsignificantbytes / TyLong_SHIFT * 8
        + (numsignificantbytes % TyLong_SHIFT * 8 + TyLong_SHIFT - 1) / TyLong_SHIFT;
    v = long_alloc(ndigits);
    if (v == NULL)
        return NULL;

    /* Copy the bits over.  The tricky parts are computing 2's-comp on
       the fly for signed numbers, and dealing with the mismatch between
       8-bit bytes and (probably) 15-bit Python digits.*/
    {
        size_t i;
        twodigits carry = 1;                    /* for 2's-comp calculation */
        twodigits accum = 0;                    /* sliding register */
        unsigned int accumbits = 0;             /* number of bits in accum */
        const unsigned char* p = pstartbyte;

        for (i = 0; i < numsignificantbytes; ++i, p += incr) {
            twodigits thisbyte = *p;
            /* Compute correction for 2's comp, if needed. */
            if (is_signed) {
                thisbyte = (0xff ^ thisbyte) + carry;
                carry = thisbyte >> 8;
                thisbyte &= 0xff;
            }
            /* Because we're going LSB to MSB, thisbyte is
               more significant than what's already in accum,
               so needs to be prepended to accum. */
            accum |= thisbyte << accumbits;
            accumbits += 8;
            if (accumbits >= TyLong_SHIFT) {
                /* There's enough to fill a Python digit. */
                assert(idigit < ndigits);
                v->long_value.ob_digit[idigit] = (digit)(accum & TyLong_MASK);
                ++idigit;
                accum >>= TyLong_SHIFT;
                accumbits -= TyLong_SHIFT;
                assert(accumbits < TyLong_SHIFT);
            }
        }
        assert(accumbits < TyLong_SHIFT);
        if (accumbits) {
            assert(idigit < ndigits);
            v->long_value.ob_digit[idigit] = (digit)accum;
            ++idigit;
        }
    }

    int sign = is_signed ? -1: 1;
    if (idigit == 0) {
        sign = 0;
    }
    _TyLong_SetSignAndDigitCount(v, sign, idigit);
    return (TyObject *)maybe_small_long(long_normalize(v));
}

int
_TyLong_AsByteArray(PyLongObject* v,
                    unsigned char* bytes, size_t n,
                    int little_endian, int is_signed,
                    int with_exceptions)
{
    Ty_ssize_t i;               /* index into v->long_value.ob_digit */
    Ty_ssize_t ndigits;         /* number of digits */
    twodigits accum;            /* sliding register */
    unsigned int accumbits;     /* # bits in accum */
    int do_twos_comp;           /* store 2's-comp?  is_signed and v < 0 */
    digit carry;                /* for computing 2's-comp */
    size_t j;                   /* # bytes filled */
    unsigned char* p;           /* pointer to next byte in bytes */
    int pincr;                  /* direction to move p */

    assert(v != NULL && TyLong_Check(v));

    ndigits = _TyLong_DigitCount(v);
    if (_TyLong_IsNegative(v)) {
        if (!is_signed) {
            if (with_exceptions) {
                TyErr_SetString(TyExc_OverflowError,
                                "can't convert negative int to unsigned");
            }
            return -1;
        }
        do_twos_comp = 1;
    }
    else {
        do_twos_comp = 0;
    }

    if (little_endian) {
        p = bytes;
        pincr = 1;
    }
    else {
        p = bytes + n - 1;
        pincr = -1;
    }

    /* Copy over all the Python digits.
       It's crucial that every Python digit except for the MSD contribute
       exactly TyLong_SHIFT bits to the total, so first assert that the int is
       normalized.
       NOTE: TyLong_AsNativeBytes() assumes that this function will fill in 'n'
       bytes even if it eventually fails to convert the whole number. Make sure
       you account for that if you are changing this algorithm to return without
       doing that.
       */
    assert(ndigits == 0 || v->long_value.ob_digit[ndigits - 1] != 0);
    j = 0;
    accum = 0;
    accumbits = 0;
    carry = do_twos_comp ? 1 : 0;
    for (i = 0; i < ndigits; ++i) {
        digit thisdigit = v->long_value.ob_digit[i];
        if (do_twos_comp) {
            thisdigit = (thisdigit ^ TyLong_MASK) + carry;
            carry = thisdigit >> TyLong_SHIFT;
            thisdigit &= TyLong_MASK;
        }
        /* Because we're going LSB to MSB, thisdigit is more
           significant than what's already in accum, so needs to be
           prepended to accum. */
        accum |= (twodigits)thisdigit << accumbits;

        /* The most-significant digit may be (probably is) at least
           partly empty. */
        if (i == ndigits - 1) {
            /* Count # of sign bits -- they needn't be stored,
             * although for signed conversion we need later to
             * make sure at least one sign bit gets stored. */
            digit s = do_twos_comp ? thisdigit ^ TyLong_MASK : thisdigit;
            while (s != 0) {
                s >>= 1;
                accumbits++;
            }
        }
        else
            accumbits += TyLong_SHIFT;

        /* Store as many bytes as possible. */
        while (accumbits >= 8) {
            if (j >= n)
                goto Overflow;
            ++j;
            *p = (unsigned char)(accum & 0xff);
            p += pincr;
            accumbits -= 8;
            accum >>= 8;
        }
    }

    /* Store the straggler (if any). */
    assert(accumbits < 8);
    assert(carry == 0);  /* else do_twos_comp and *every* digit was 0 */
    if (accumbits > 0) {
        if (j >= n)
            goto Overflow;
        ++j;
        if (do_twos_comp) {
            /* Fill leading bits of the byte with sign bits
               (appropriately pretending that the int had an
               infinite supply of sign bits). */
            accum |= (~(twodigits)0) << accumbits;
        }
        *p = (unsigned char)(accum & 0xff);
        p += pincr;
    }
    else if (j == n && n > 0 && is_signed) {
        /* The main loop filled the byte array exactly, so the code
           just above didn't get to ensure there's a sign bit, and the
           loop below wouldn't add one either.  Make sure a sign bit
           exists. */
        unsigned char msb = *(p - pincr);
        int sign_bit_set = msb >= 0x80;
        assert(accumbits == 0);
        if (sign_bit_set == do_twos_comp)
            return 0;
        else
            goto Overflow;
    }

    /* Fill remaining bytes with copies of the sign bit. */
    {
        unsigned char signbyte = do_twos_comp ? 0xffU : 0U;
        for ( ; j < n; ++j, p += pincr)
            *p = signbyte;
    }

    return 0;

  Overflow:
    if (with_exceptions) {
        TyErr_SetString(TyExc_OverflowError, "int too big to convert");
    }
    return -1;

}

// Refactored out for readability, not reuse
static inline int
_fits_in_n_bits(Ty_ssize_t v, Ty_ssize_t n)
{
    if (n >= (Ty_ssize_t)sizeof(Ty_ssize_t) * 8) {
        return 1;
    }
    // If all bits above n are the same, we fit.
    // (Use n-1 if we require the sign bit to be consistent.)
    Ty_ssize_t v_extended = v >> ((int)n - 1);
    return v_extended == 0 || v_extended == -1;
}

static inline int
_resolve_endianness(int *endianness)
{
    if (*endianness == -1 || (*endianness & 2)) {
        *endianness = PY_LITTLE_ENDIAN;
    } else {
        *endianness &= 1;
    }
    assert(*endianness == 0 || *endianness == 1);
    return 0;
}

Ty_ssize_t
TyLong_AsNativeBytes(TyObject* vv, void* buffer, Ty_ssize_t n, int flags)
{
    PyLongObject *v;
    union {
        Ty_ssize_t v;
        unsigned char b[sizeof(Ty_ssize_t)];
    } cv;
    int do_decref = 0;
    Ty_ssize_t res = 0;

    if (vv == NULL || n < 0) {
        TyErr_BadInternalCall();
        return -1;
    }

    int little_endian = flags;
    if (_resolve_endianness(&little_endian) < 0) {
        return -1;
    }

    if (TyLong_Check(vv)) {
        v = (PyLongObject *)vv;
    }
    else if (flags != -1 && (flags & Ty_ASNATIVEBYTES_ALLOW_INDEX)) {
        v = (PyLongObject *)_PyNumber_Index(vv);
        if (v == NULL) {
            return -1;
        }
        do_decref = 1;
    }
    else {
        TyErr_Format(TyExc_TypeError, "expect int, got %T", vv);
        return -1;
    }

    if ((flags != -1 && (flags & Ty_ASNATIVEBYTES_REJECT_NEGATIVE))
        && _TyLong_IsNegative(v)) {
        TyErr_SetString(TyExc_ValueError, "Cannot convert negative int");
        if (do_decref) {
            Ty_DECREF(v);
        }
        return -1;
    }

    if (_TyLong_IsCompact(v)) {
        res = 0;
        cv.v = _TyLong_CompactValue(v);
        /* Most paths result in res = sizeof(compact value). Only the case
         * where 0 < n < sizeof(compact value) do we need to check and adjust
         * our return value. */
        res = sizeof(cv.b);
        if (n <= 0) {
            // nothing to do!
        }
        else if (n <= (Ty_ssize_t)sizeof(cv.b)) {
#if PY_LITTLE_ENDIAN
            if (little_endian) {
                memcpy(buffer, cv.b, n);
            }
            else {
                for (Ty_ssize_t i = 0; i < n; ++i) {
                    ((unsigned char*)buffer)[n - i - 1] = cv.b[i];
                }
            }
#else
            if (little_endian) {
                for (Ty_ssize_t i = 0; i < n; ++i) {
                    ((unsigned char*)buffer)[i] = cv.b[sizeof(cv.b) - i - 1];
                }
            }
            else {
                memcpy(buffer, &cv.b[sizeof(cv.b) - n], n);
            }
#endif

            /* If we fit, return the requested number of bytes */
            if (_fits_in_n_bits(cv.v, n * 8)) {
                res = n;
            } else if (cv.v > 0 && _fits_in_n_bits(cv.v, n * 8 + 1)) {
                /* Positive values with the MSB set do not require an
                 * additional bit when the caller's intent is to treat them
                 * as unsigned. */
                if (flags == -1 || (flags & Ty_ASNATIVEBYTES_UNSIGNED_BUFFER)) {
                    res = n;
                } else {
                    res = n + 1;
                }
            }
        }
        else {
            unsigned char fill = cv.v < 0 ? 0xFF : 0x00;
#if PY_LITTLE_ENDIAN
            if (little_endian) {
                memcpy(buffer, cv.b, sizeof(cv.b));
                memset((char *)buffer + sizeof(cv.b), fill, n - sizeof(cv.b));
            }
            else {
                unsigned char *b = (unsigned char *)buffer;
                for (Ty_ssize_t i = 0; i < n - (int)sizeof(cv.b); ++i) {
                    *b++ = fill;
                }
                for (Ty_ssize_t i = sizeof(cv.b); i > 0; --i) {
                    *b++ = cv.b[i - 1];
                }
            }
#else
            if (little_endian) {
                unsigned char *b = (unsigned char *)buffer;
                for (Ty_ssize_t i = sizeof(cv.b); i > 0; --i) {
                    *b++ = cv.b[i - 1];
                }
                for (Ty_ssize_t i = 0; i < n - (int)sizeof(cv.b); ++i) {
                    *b++ = fill;
                }
            }
            else {
                memset(buffer, fill, n - sizeof(cv.b));
                memcpy((char *)buffer + n - sizeof(cv.b), cv.b, sizeof(cv.b));
            }
#endif
        }
    }
    else {
        if (n > 0) {
            _TyLong_AsByteArray(v, buffer, (size_t)n, little_endian, 1, 0);
        }

        /* Calculates the number of bits required for the *absolute* value
         * of v. This does not take sign into account, only magnitude. */
        int64_t nb = _TyLong_NumBits((TyObject *)v);
        assert(nb >= 0);
        /* Normally this would be ((nb - 1) / 8) + 1 to avoid rounding up
         * multiples of 8 to the next byte, but we add an implied bit for
         * the sign and it cancels out. */
        res = (Ty_ssize_t)(nb / 8) + 1;

        /* Two edge cases exist that are best handled after extracting the
         * bits. These may result in us reporting overflow when the value
         * actually fits.
         */
        if (n > 0 && res == n + 1 && nb % 8 == 0) {
            if (_TyLong_IsNegative(v)) {
                /* Values of 0x80...00 from negative values that use every
                 * available bit in the buffer do not require an additional
                 * bit to store the sign. */
                int is_edge_case = 1;
                unsigned char *b = (unsigned char *)buffer;
                for (Ty_ssize_t i = 0; i < n && is_edge_case; ++i, ++b) {
                    if (i == 0) {
                        is_edge_case = (*b == (little_endian ? 0 : 0x80));
                    } else if (i < n - 1) {
                        is_edge_case = (*b == 0);
                    } else {
                        is_edge_case = (*b == (little_endian ? 0x80 : 0));
                    }
                }
                if (is_edge_case) {
                    res = n;
                }
            }
            else {
                /* Positive values with the MSB set do not require an
                 * additional bit when the caller's intent is to treat them
                 * as unsigned. */
                unsigned char *b = (unsigned char *)buffer;
                if (b[little_endian ? n - 1 : 0] & 0x80) {
                    if (flags == -1 || (flags & Ty_ASNATIVEBYTES_UNSIGNED_BUFFER)) {
                        res = n;
                    } else {
                        res = n + 1;
                    }
                }
            }
        }
    }

    if (do_decref) {
        Ty_DECREF(v);
    }

    return res;
}


TyObject *
TyLong_FromNativeBytes(const void* buffer, size_t n, int flags)
{
    if (!buffer) {
        TyErr_BadInternalCall();
        return NULL;
    }

    int little_endian = flags;
    if (_resolve_endianness(&little_endian) < 0) {
        return NULL;
    }

    return _TyLong_FromByteArray(
        (const unsigned char *)buffer,
        n,
        little_endian,
        (flags == -1 || !(flags & Ty_ASNATIVEBYTES_UNSIGNED_BUFFER)) ? 1 : 0
    );
}


TyObject *
TyLong_FromUnsignedNativeBytes(const void* buffer, size_t n, int flags)
{
    if (!buffer) {
        TyErr_BadInternalCall();
        return NULL;
    }

    int little_endian = flags;
    if (_resolve_endianness(&little_endian) < 0) {
        return NULL;
    }

    return _TyLong_FromByteArray((const unsigned char *)buffer, n, little_endian, 0);
}


/* Create a new int object from a C pointer */

TyObject *
TyLong_FromVoidPtr(void *p)
{
#if SIZEOF_VOID_P <= SIZEOF_LONG
    return TyLong_FromUnsignedLong((unsigned long)(uintptr_t)p);
#else

#if SIZEOF_LONG_LONG < SIZEOF_VOID_P
#   error "TyLong_FromVoidPtr: sizeof(long long) < sizeof(void*)"
#endif
    return TyLong_FromUnsignedLongLong((unsigned long long)(uintptr_t)p);
#endif /* SIZEOF_VOID_P <= SIZEOF_LONG */

}

/* Get a C pointer from an int object. */

void *
TyLong_AsVoidPtr(TyObject *vv)
{
#if SIZEOF_VOID_P <= SIZEOF_LONG
    long x;

    if (TyLong_Check(vv) && _TyLong_IsNegative((PyLongObject *)vv)) {
        x = TyLong_AsLong(vv);
    }
    else {
        x = TyLong_AsUnsignedLong(vv);
    }
#else

#if SIZEOF_LONG_LONG < SIZEOF_VOID_P
#   error "TyLong_AsVoidPtr: sizeof(long long) < sizeof(void*)"
#endif
    long long x;

    if (TyLong_Check(vv) && _TyLong_IsNegative((PyLongObject *)vv)) {
        x = TyLong_AsLongLong(vv);
    }
    else {
        x = TyLong_AsUnsignedLongLong(vv);
    }

#endif /* SIZEOF_VOID_P <= SIZEOF_LONG */

    if (x == -1 && TyErr_Occurred())
        return NULL;
    return (void *)x;
}

/* Initial long long support by Chris Herborth (chrish@qnx.com), later
 * rewritten to use the newer TyLong_{As,From}ByteArray API.
 */

#define PY_ABS_LLONG_MIN (0-(unsigned long long)LLONG_MIN)

/* Create a new int object from a C long long int. */

TyObject *
TyLong_FromLongLong(long long ival)
{
    PYLONG_FROM_INT(unsigned long long, long long, ival);
}

/* Create a new int object from a C Ty_ssize_t. */

TyObject *
TyLong_FromSsize_t(Ty_ssize_t ival)
{
    PYLONG_FROM_INT(size_t, Ty_ssize_t, ival);
}

/* Get a C long long int from an int object or any object that has an
   __index__ method.  Return -1 and set an error if overflow occurs. */

long long
TyLong_AsLongLong(TyObject *vv)
{
    PyLongObject *v;
    long long bytes;
    int res;
    int do_decref = 0; /* if PyNumber_Index was called */

    if (vv == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }

    if (TyLong_Check(vv)) {
        v = (PyLongObject *)vv;
    }
    else {
        v = (PyLongObject *)_PyNumber_Index(vv);
        if (v == NULL)
            return -1;
        do_decref = 1;
    }

    if (_TyLong_IsCompact(v)) {
        res = 0;
        bytes = _TyLong_CompactValue(v);
    }
    else {
        res = _TyLong_AsByteArray((PyLongObject *)v, (unsigned char *)&bytes,
                                  SIZEOF_LONG_LONG, PY_LITTLE_ENDIAN, 1, 1);
    }
    if (do_decref) {
        Ty_DECREF(v);
    }

    /* Plan 9 can't handle long long in ? : expressions */
    if (res < 0)
        return (long long)-1;
    else
        return bytes;
}

/* Get a C unsigned long long int from an int object.
   Return -1 and set an error if overflow occurs. */

unsigned long long
TyLong_AsUnsignedLongLong(TyObject *vv)
{
    PyLongObject *v;
    unsigned long long bytes;
    int res;

    if (vv == NULL) {
        TyErr_BadInternalCall();
        return (unsigned long long)-1;
    }
    if (!TyLong_Check(vv)) {
        TyErr_SetString(TyExc_TypeError, "an integer is required");
        return (unsigned long long)-1;
    }

    v = (PyLongObject*)vv;
    if (_TyLong_IsNonNegativeCompact(v)) {
        res = 0;
#if SIZEOF_LONG_LONG < SIZEOF_SIZE_T
        size_t tmp = (size_t)_TyLong_CompactValue(v);
        bytes = (unsigned long long)tmp;
        if (bytes != tmp) {
            TyErr_SetString(TyExc_OverflowError,
                            "Python int too large to convert "
                            "to C unsigned long long");
            res = -1;
        }
#else
        bytes = (unsigned long long)(size_t)_TyLong_CompactValue(v);
#endif
    }
    else {
        res = _TyLong_AsByteArray((PyLongObject *)vv, (unsigned char *)&bytes,
                              SIZEOF_LONG_LONG, PY_LITTLE_ENDIAN, 0, 1);
    }

    /* Plan 9 can't handle long long in ? : expressions */
    if (res < 0)
        return (unsigned long long)res;
    else
        return bytes;
}

/* Get a C unsigned long int from an int object, ignoring the high bits.
   Returns -1 and sets an error condition if an error occurs. */

static unsigned long long
_TyLong_AsUnsignedLongLongMask(TyObject *vv)
{
    PyLongObject *v;
    unsigned long long x;
    Ty_ssize_t i;
    int sign;

    if (vv == NULL || !TyLong_Check(vv)) {
        TyErr_BadInternalCall();
        return (unsigned long long) -1;
    }
    v = (PyLongObject *)vv;
    if (_TyLong_IsCompact(v)) {
#if SIZEOF_LONG_LONG < SIZEOF_SIZE_T
        return (unsigned long long)(size_t)_TyLong_CompactValue(v);
#else
        return (unsigned long long)(long long)_TyLong_CompactValue(v);
#endif
    }
    i = _TyLong_DigitCount(v);
    sign = _TyLong_NonCompactSign(v);
    x = 0;
    while (--i >= 0) {
        x = (x << TyLong_SHIFT) | v->long_value.ob_digit[i];
    }
    return x * sign;
}

unsigned long long
TyLong_AsUnsignedLongLongMask(TyObject *op)
{
    PyLongObject *lo;
    unsigned long long val;

    if (op == NULL) {
        TyErr_BadInternalCall();
        return (unsigned long long)-1;
    }

    if (TyLong_Check(op)) {
        return _TyLong_AsUnsignedLongLongMask(op);
    }

    lo = (PyLongObject *)_PyNumber_Index(op);
    if (lo == NULL)
        return (unsigned long long)-1;

    val = _TyLong_AsUnsignedLongLongMask((TyObject *)lo);
    Ty_DECREF(lo);
    return val;
}

/* Get a C long long int from an int object or any object that has an
   __index__ method.

   On overflow, return -1 and set *overflow to 1 or -1 depending on the sign of
   the result.  Otherwise *overflow is 0.

   For other errors (e.g., TypeError), return -1 and set an error condition.
   In this case *overflow will be 0.
*/

long long
TyLong_AsLongLongAndOverflow(TyObject *vv, int *overflow)
{
    /* This version by Tim Peters */
    PyLongObject *v;
    unsigned long long x, prev;
    long long res;
    Ty_ssize_t i;
    int sign;
    int do_decref = 0; /* if PyNumber_Index was called */

    *overflow = 0;
    if (vv == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }

    if (TyLong_Check(vv)) {
        v = (PyLongObject *)vv;
    }
    else {
        v = (PyLongObject *)_PyNumber_Index(vv);
        if (v == NULL)
            return -1;
        do_decref = 1;
    }
    if (_TyLong_IsCompact(v)) {
#if SIZEOF_LONG_LONG < SIZEOF_SIZE_T
        Ty_ssize_t tmp = _TyLong_CompactValue(v);
        if (tmp < LLONG_MIN) {
            *overflow = -1;
            res = -1;
        }
        else if (tmp > LLONG_MAX) {
            *overflow = 1;
            res = -1;
        }
        else {
            res = (long long)tmp;
        }
#else
        res = _TyLong_CompactValue(v);
#endif
    }
    else {
        i = _TyLong_DigitCount(v);
        sign = _TyLong_NonCompactSign(v);
        x = 0;
        while (--i >= 0) {
            prev = x;
            x = (x << TyLong_SHIFT) + v->long_value.ob_digit[i];
            if ((x >> TyLong_SHIFT) != prev) {
                *overflow = sign;
                res = -1;
                goto exit;
            }
        }
        /* Haven't lost any bits, but casting to long requires extra
         * care (see comment above).
         */
        if (x <= (unsigned long long)LLONG_MAX) {
            res = (long long)x * sign;
        }
        else if (sign < 0 && x == PY_ABS_LLONG_MIN) {
            res = LLONG_MIN;
        }
        else {
            *overflow = sign;
            res = -1;
        }
    }
  exit:
    if (do_decref) {
        Ty_DECREF(v);
    }
    return res;
}

#define UNSIGNED_INT_CONVERTER(NAME, TYPE)                          \
int                                                                 \
_TyLong_##NAME##_Converter(TyObject *obj, void *ptr)                \
{                                                                   \
    Ty_ssize_t bytes = TyLong_AsNativeBytes(obj, ptr, sizeof(TYPE), \
            Ty_ASNATIVEBYTES_NATIVE_ENDIAN |                        \
            Ty_ASNATIVEBYTES_ALLOW_INDEX |                          \
            Ty_ASNATIVEBYTES_REJECT_NEGATIVE |                      \
            Ty_ASNATIVEBYTES_UNSIGNED_BUFFER);                      \
    if (bytes < 0) {                                                \
        return 0;                                                   \
    }                                                               \
    if ((size_t)bytes > sizeof(TYPE)) {                             \
        TyErr_SetString(TyExc_OverflowError,                        \
                        "Python int too large for C "#TYPE);        \
        return 0;                                                   \
    }                                                               \
    return 1;                                                       \
}

UNSIGNED_INT_CONVERTER(UnsignedShort, unsigned short)
UNSIGNED_INT_CONVERTER(UnsignedInt, unsigned int)
UNSIGNED_INT_CONVERTER(UnsignedLong, unsigned long)
UNSIGNED_INT_CONVERTER(UnsignedLongLong, unsigned long long)
UNSIGNED_INT_CONVERTER(Size_t, size_t)
UNSIGNED_INT_CONVERTER(UInt8, uint8_t)
UNSIGNED_INT_CONVERTER(UInt16, uint16_t)
UNSIGNED_INT_CONVERTER(UInt32, uint32_t)
UNSIGNED_INT_CONVERTER(UInt64, uint64_t)


#define CHECK_BINOP(v,w)                                \
    do {                                                \
        if (!TyLong_Check(v) || !TyLong_Check(w))       \
            Py_RETURN_NOTIMPLEMENTED;                   \
    } while(0)

/* x[0:m] and y[0:n] are digit vectors, LSD first, m >= n required.  x[0:n]
 * is modified in place, by adding y to it.  Carries are propagated as far as
 * x[m-1], and the remaining carry (0 or 1) is returned.
 */
static digit
v_iadd(digit *x, Ty_ssize_t m, digit *y, Ty_ssize_t n)
{
    Ty_ssize_t i;
    digit carry = 0;

    assert(m >= n);
    for (i = 0; i < n; ++i) {
        carry += x[i] + y[i];
        x[i] = carry & TyLong_MASK;
        carry >>= TyLong_SHIFT;
        assert((carry & 1) == carry);
    }
    for (; carry && i < m; ++i) {
        carry += x[i];
        x[i] = carry & TyLong_MASK;
        carry >>= TyLong_SHIFT;
        assert((carry & 1) == carry);
    }
    return carry;
}

/* x[0:m] and y[0:n] are digit vectors, LSD first, m >= n required.  x[0:n]
 * is modified in place, by subtracting y from it.  Borrows are propagated as
 * far as x[m-1], and the remaining borrow (0 or 1) is returned.
 */
static digit
v_isub(digit *x, Ty_ssize_t m, digit *y, Ty_ssize_t n)
{
    Ty_ssize_t i;
    digit borrow = 0;

    assert(m >= n);
    for (i = 0; i < n; ++i) {
        borrow = x[i] - y[i] - borrow;
        x[i] = borrow & TyLong_MASK;
        borrow >>= TyLong_SHIFT;
        borrow &= 1;            /* keep only 1 sign bit */
    }
    for (; borrow && i < m; ++i) {
        borrow = x[i] - borrow;
        x[i] = borrow & TyLong_MASK;
        borrow >>= TyLong_SHIFT;
        borrow &= 1;
    }
    return borrow;
}

/* Shift digit vector a[0:m] d bits left, with 0 <= d < TyLong_SHIFT.  Put
 * result in z[0:m], and return the d bits shifted out of the top.
 */
static digit
v_lshift(digit *z, digit *a, Ty_ssize_t m, int d)
{
    Ty_ssize_t i;
    digit carry = 0;

    assert(0 <= d && d < TyLong_SHIFT);
    for (i=0; i < m; i++) {
        twodigits acc = (twodigits)a[i] << d | carry;
        z[i] = (digit)acc & TyLong_MASK;
        carry = (digit)(acc >> TyLong_SHIFT);
    }
    return carry;
}

/* Shift digit vector a[0:m] d bits right, with 0 <= d < TyLong_SHIFT.  Put
 * result in z[0:m], and return the d bits shifted out of the bottom.
 */
static digit
v_rshift(digit *z, digit *a, Ty_ssize_t m, int d)
{
    Ty_ssize_t i;
    digit carry = 0;
    digit mask = ((digit)1 << d) - 1U;

    assert(0 <= d && d < TyLong_SHIFT);
    for (i=m; i-- > 0;) {
        twodigits acc = (twodigits)carry << TyLong_SHIFT | a[i];
        carry = (digit)acc & mask;
        z[i] = (digit)(acc >> d);
    }
    return carry;
}

/* Divide long pin, w/ size digits, by non-zero digit n, storing quotient
   in pout, and returning the remainder.  pin and pout point at the LSD.
   It's OK for pin == pout on entry, which saves oodles of mallocs/frees in
   _TyLong_Format, but that should be done with great care since ints are
   immutable.

   This version of the code can be 20% faster than the pre-2022 version
   on todays compilers on architectures like amd64.  It evolved from Mark
   Dickinson observing that a 128:64 divide instruction was always being
   generated by the compiler despite us working with 30-bit digit values.
   See the thread for full context:

     https://mail.python.org/archives/list/python-dev@python.org/thread/ZICIMX5VFCX4IOFH5NUPVHCUJCQ4Q7QM/#NEUNFZU3TQU4CPTYZNF3WCN7DOJBBTK5

   If you ever want to change this code, pay attention to performance using
   different compilers, optimization levels, and cpu architectures. Beware of
   PGO/FDO builds doing value specialization such as a fast path for //10. :)

   Verify that 17 isn't specialized and this works as a quick test:
     python -m timeit -s 'x = 10**1000; r=x//10; assert r == 10**999, r' 'x//17'
*/
static digit
inplace_divrem1(digit *pout, digit *pin, Ty_ssize_t size, digit n)
{
    digit remainder = 0;

    assert(n > 0 && n <= TyLong_MASK);
    while (--size >= 0) {
        twodigits dividend;
        dividend = ((twodigits)remainder << TyLong_SHIFT) | pin[size];
        digit quotient;
        quotient = (digit)(dividend / n);
        remainder = dividend % n;
        pout[size] = quotient;
    }
    return remainder;
}


/* Divide an integer by a digit, returning both the quotient
   (as function result) and the remainder (through *prem).
   The sign of a is ignored; n should not be zero. */

static PyLongObject *
divrem1(PyLongObject *a, digit n, digit *prem)
{
    const Ty_ssize_t size = _TyLong_DigitCount(a);
    PyLongObject *z;

    assert(n > 0 && n <= TyLong_MASK);
    z = long_alloc(size);
    if (z == NULL)
        return NULL;
    *prem = inplace_divrem1(z->long_value.ob_digit, a->long_value.ob_digit, size, n);
    return long_normalize(z);
}

/* Remainder of long pin, w/ size digits, by non-zero digit n,
   returning the remainder. pin points at the LSD. */

static digit
inplace_rem1(digit *pin, Ty_ssize_t size, digit n)
{
    twodigits rem = 0;

    assert(n > 0 && n <= TyLong_MASK);
    while (--size >= 0)
        rem = ((rem << TyLong_SHIFT) | pin[size]) % n;
    return (digit)rem;
}

/* Get the remainder of an integer divided by a digit, returning
   the remainder as the result of the function. The sign of a is
   ignored; n should not be zero. */

static PyLongObject *
rem1(PyLongObject *a, digit n)
{
    const Ty_ssize_t size = _TyLong_DigitCount(a);

    assert(n > 0 && n <= TyLong_MASK);
    return (PyLongObject *)TyLong_FromLong(
        (long)inplace_rem1(a->long_value.ob_digit, size, n)
    );
}

#ifdef WITH_PYLONG_MODULE
/* asymptotically faster long_to_decimal_string, using _pylong.py */
static int
pylong_int_to_decimal_string(TyObject *aa,
                             TyObject **p_output,
                             _PyUnicodeWriter *writer,
                             _PyBytesWriter *bytes_writer,
                             char **bytes_str)
{
    TyObject *s = NULL;
    TyObject *mod = TyImport_ImportModule("_pylong");
    if (mod == NULL) {
        return -1;
    }
    s = PyObject_CallMethod(mod, "int_to_decimal_string", "O", aa);
    if (s == NULL) {
        goto error;
    }
    if (!TyUnicode_Check(s)) {
        TyErr_SetString(TyExc_TypeError,
                        "_pylong.int_to_decimal_string did not return a str");
        goto error;
    }
    if (writer) {
        Ty_ssize_t size = TyUnicode_GET_LENGTH(s);
        if (_PyUnicodeWriter_Prepare(writer, size, '9') == -1) {
            goto error;
        }
        if (_PyUnicodeWriter_WriteStr(writer, s) < 0) {
            goto error;
        }
        goto success;
    }
    else if (bytes_writer) {
        Ty_ssize_t size = TyUnicode_GET_LENGTH(s);
        const void *data = TyUnicode_DATA(s);
        int kind = TyUnicode_KIND(s);
        *bytes_str = _PyBytesWriter_Prepare(bytes_writer, *bytes_str, size);
        if (*bytes_str == NULL) {
            goto error;
        }
        char *p = *bytes_str;
        for (Ty_ssize_t i=0; i < size; i++) {
            Ty_UCS4 ch = TyUnicode_READ(kind, data, i);
            *p++ = (char) ch;
        }
        (*bytes_str) = p;
        goto success;
    }
    else {
        *p_output = Ty_NewRef(s);
        goto success;
    }

error:
        Ty_DECREF(mod);
        Ty_XDECREF(s);
        return -1;

success:
        Ty_DECREF(mod);
        Ty_DECREF(s);
        return 0;
}
#endif /* WITH_PYLONG_MODULE */

/* Convert an integer to a base 10 string.  Returns a new non-shared
   string.  (Return value is non-shared so that callers can modify the
   returned value if necessary.) */

static int
long_to_decimal_string_internal(TyObject *aa,
                                TyObject **p_output,
                                _PyUnicodeWriter *writer,
                                _PyBytesWriter *bytes_writer,
                                char **bytes_str)
{
    PyLongObject *scratch, *a;
    TyObject *str = NULL;
    Ty_ssize_t size, strlen, size_a, i, j;
    digit *pout, *pin, rem, tenpow;
    int negative;
    int d;

    // writer or bytes_writer can be used, but not both at the same time.
    assert(writer == NULL || bytes_writer == NULL);

    a = (PyLongObject *)aa;
    if (a == NULL || !TyLong_Check(a)) {
        TyErr_BadInternalCall();
        return -1;
    }
    size_a = _TyLong_DigitCount(a);
    negative = _TyLong_IsNegative(a);

    /* quick and dirty pre-check for overflowing the decimal digit limit,
       based on the inequality 10/3 >= log2(10)

       explanation in https://github.com/python/cpython/pull/96537
    */
    if (size_a >= 10 * _PY_LONG_MAX_STR_DIGITS_THRESHOLD
                  / (3 * TyLong_SHIFT) + 2) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        int max_str_digits = interp->long_state.max_str_digits;
        if ((max_str_digits > 0) &&
            (max_str_digits / (3 * TyLong_SHIFT) <= (size_a - 11) / 10)) {
            TyErr_Format(TyExc_ValueError, _MAX_STR_DIGITS_ERROR_FMT_TO_STR,
                         max_str_digits);
            return -1;
        }
    }

#if WITH_PYLONG_MODULE
    if (size_a > 1000) {
        /* Switch to _pylong.int_to_decimal_string(). */
        return pylong_int_to_decimal_string(aa,
                                         p_output,
                                         writer,
                                         bytes_writer,
                                         bytes_str);
    }
#endif

    /* quick and dirty upper bound for the number of digits
       required to express a in base _TyLong_DECIMAL_BASE:

         #digits = 1 + floor(log2(a) / log2(_TyLong_DECIMAL_BASE))

       But log2(a) < size_a * TyLong_SHIFT, and
       log2(_TyLong_DECIMAL_BASE) = log2(10) * _TyLong_DECIMAL_SHIFT
                                  > 3.3 * _TyLong_DECIMAL_SHIFT

         size_a * TyLong_SHIFT / (3.3 * _TyLong_DECIMAL_SHIFT) =
             size_a + size_a / d < size_a + size_a / floor(d),
       where d = (3.3 * _TyLong_DECIMAL_SHIFT) /
                 (TyLong_SHIFT - 3.3 * _TyLong_DECIMAL_SHIFT)
    */
    d = (33 * _TyLong_DECIMAL_SHIFT) /
        (10 * TyLong_SHIFT - 33 * _TyLong_DECIMAL_SHIFT);
    assert(size_a < PY_SSIZE_T_MAX/2);
    size = 1 + size_a + size_a / d;
    scratch = long_alloc(size);
    if (scratch == NULL)
        return -1;

    /* convert array of base _TyLong_BASE digits in pin to an array of
       base _TyLong_DECIMAL_BASE digits in pout, following Knuth (TAOCP,
       Volume 2 (3rd edn), section 4.4, Method 1b). */
    pin = a->long_value.ob_digit;
    pout = scratch->long_value.ob_digit;
    size = 0;
    for (i = size_a; --i >= 0; ) {
        digit hi = pin[i];
        for (j = 0; j < size; j++) {
            twodigits z = (twodigits)pout[j] << TyLong_SHIFT | hi;
            hi = (digit)(z / _TyLong_DECIMAL_BASE);
            pout[j] = (digit)(z - (twodigits)hi *
                              _TyLong_DECIMAL_BASE);
        }
        while (hi) {
            pout[size++] = hi % _TyLong_DECIMAL_BASE;
            hi /= _TyLong_DECIMAL_BASE;
        }
        /* check for keyboard interrupt */
        SIGCHECK({
                Ty_DECREF(scratch);
                return -1;
            });
    }
    /* pout should have at least one digit, so that the case when a = 0
       works correctly */
    if (size == 0)
        pout[size++] = 0;

    /* calculate exact length of output string, and allocate */
    strlen = negative + 1 + (size - 1) * _TyLong_DECIMAL_SHIFT;
    tenpow = 10;
    rem = pout[size-1];
    while (rem >= tenpow) {
        tenpow *= 10;
        strlen++;
    }
    if (strlen > _PY_LONG_MAX_STR_DIGITS_THRESHOLD) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        int max_str_digits = interp->long_state.max_str_digits;
        Ty_ssize_t strlen_nosign = strlen - negative;
        if ((max_str_digits > 0) && (strlen_nosign > max_str_digits)) {
            Ty_DECREF(scratch);
            TyErr_Format(TyExc_ValueError, _MAX_STR_DIGITS_ERROR_FMT_TO_STR,
                         max_str_digits);
            return -1;
        }
    }
    if (writer) {
        if (_PyUnicodeWriter_Prepare(writer, strlen, '9') == -1) {
            Ty_DECREF(scratch);
            return -1;
        }
    }
    else if (bytes_writer) {
        *bytes_str = _PyBytesWriter_Prepare(bytes_writer, *bytes_str, strlen);
        if (*bytes_str == NULL) {
            Ty_DECREF(scratch);
            return -1;
        }
    }
    else {
        str = TyUnicode_New(strlen, '9');
        if (str == NULL) {
            Ty_DECREF(scratch);
            return -1;
        }
    }

#define WRITE_DIGITS(p)                                               \
    do {                                                              \
        /* pout[0] through pout[size-2] contribute exactly            \
           _TyLong_DECIMAL_SHIFT digits each */                       \
        for (i=0; i < size - 1; i++) {                                \
            rem = pout[i];                                            \
            for (j = 0; j < _TyLong_DECIMAL_SHIFT; j++) {             \
                *--p = '0' + rem % 10;                                \
                rem /= 10;                                            \
            }                                                         \
        }                                                             \
        /* pout[size-1]: always produce at least one decimal digit */ \
        rem = pout[i];                                                \
        do {                                                          \
            *--p = '0' + rem % 10;                                    \
            rem /= 10;                                                \
        } while (rem != 0);                                           \
                                                                      \
        /* and sign */                                                \
        if (negative)                                                 \
            *--p = '-';                                               \
    } while (0)

#define WRITE_UNICODE_DIGITS(TYPE)                                    \
    do {                                                              \
        if (writer)                                                   \
            p = (TYPE*)TyUnicode_DATA(writer->buffer) + writer->pos + strlen; \
        else                                                          \
            p = (TYPE*)TyUnicode_DATA(str) + strlen;                  \
                                                                      \
        WRITE_DIGITS(p);                                              \
                                                                      \
        /* check we've counted correctly */                           \
        if (writer)                                                   \
            assert(p == ((TYPE*)TyUnicode_DATA(writer->buffer) + writer->pos)); \
        else                                                          \
            assert(p == (TYPE*)TyUnicode_DATA(str));                  \
    } while (0)

    /* fill the string right-to-left */
    if (bytes_writer) {
        char *p = *bytes_str + strlen;
        WRITE_DIGITS(p);
        assert(p == *bytes_str);
    }
    else {
        int kind = writer ? writer->kind : TyUnicode_KIND(str);
        if (kind == TyUnicode_1BYTE_KIND) {
            Ty_UCS1 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS1);
        }
        else if (kind == TyUnicode_2BYTE_KIND) {
            Ty_UCS2 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS2);
        }
        else {
            assert (kind == TyUnicode_4BYTE_KIND);
            Ty_UCS4 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS4);
        }
    }

#undef WRITE_DIGITS
#undef WRITE_UNICODE_DIGITS

    _Ty_DECREF_INT(scratch);
    if (writer) {
        writer->pos += strlen;
    }
    else if (bytes_writer) {
        (*bytes_str) += strlen;
    }
    else {
        assert(_TyUnicode_CheckConsistency(str, 1));
        *p_output = (TyObject *)str;
    }
    return 0;
}

static TyObject *
long_to_decimal_string(TyObject *aa)
{
    TyObject *v;
    if (long_to_decimal_string_internal(aa, &v, NULL, NULL, NULL) == -1)
        return NULL;
    return v;
}

/* Convert an int object to a string, using a given conversion base,
   which should be one of 2, 8 or 16.  Return a string object.
   If base is 2, 8 or 16, add the proper prefix '0b', '0o' or '0x'
   if alternate is nonzero. */

static int
long_format_binary(TyObject *aa, int base, int alternate,
                   TyObject **p_output, _PyUnicodeWriter *writer,
                   _PyBytesWriter *bytes_writer, char **bytes_str)
{
    PyLongObject *a = (PyLongObject *)aa;
    TyObject *v = NULL;
    Ty_ssize_t sz;
    Ty_ssize_t size_a;
    int negative;
    int bits;

    assert(base == 2 || base == 8 || base == 16);
    // writer or bytes_writer can be used, but not both at the same time.
    assert(writer == NULL || bytes_writer == NULL);
    if (a == NULL || !TyLong_Check(a)) {
        TyErr_BadInternalCall();
        return -1;
    }
    size_a = _TyLong_DigitCount(a);
    negative = _TyLong_IsNegative(a);

    /* Compute a rough upper bound for the length of the string */
    switch (base) {
    case 16:
        bits = 4;
        break;
    case 8:
        bits = 3;
        break;
    case 2:
        bits = 1;
        break;
    default:
        Ty_UNREACHABLE();
    }

    /* Compute exact length 'sz' of output string. */
    if (size_a == 0) {
        sz = 1;
    }
    else {
        Ty_ssize_t size_a_in_bits;
        /* Ensure overflow doesn't occur during computation of sz. */
        if (size_a > (PY_SSIZE_T_MAX - 3) / TyLong_SHIFT) {
            TyErr_SetString(TyExc_OverflowError,
                            "int too large to format");
            return -1;
        }
        size_a_in_bits = (size_a - 1) * TyLong_SHIFT +
                         bit_length_digit(a->long_value.ob_digit[size_a - 1]);
        /* Allow 1 character for a '-' sign. */
        sz = negative + (size_a_in_bits + (bits - 1)) / bits;
    }
    if (alternate) {
        /* 2 characters for prefix  */
        sz += 2;
    }

    if (writer) {
        if (_PyUnicodeWriter_Prepare(writer, sz, 'x') == -1)
            return -1;
    }
    else if (bytes_writer) {
        *bytes_str = _PyBytesWriter_Prepare(bytes_writer, *bytes_str, sz);
        if (*bytes_str == NULL)
            return -1;
    }
    else {
        v = TyUnicode_New(sz, 'x');
        if (v == NULL)
            return -1;
    }

#define WRITE_DIGITS(p)                                                 \
    do {                                                                \
        if (size_a == 0) {                                              \
            *--p = '0';                                                 \
        }                                                               \
        else {                                                          \
            /* JRH: special case for power-of-2 bases */                \
            twodigits accum = 0;                                        \
            int accumbits = 0;   /* # of bits in accum */               \
            Ty_ssize_t i;                                               \
            for (i = 0; i < size_a; ++i) {                              \
                accum |= (twodigits)a->long_value.ob_digit[i] << accumbits;        \
                accumbits += TyLong_SHIFT;                              \
                assert(accumbits >= bits);                              \
                do {                                                    \
                    char cdigit;                                        \
                    cdigit = (char)(accum & (base - 1));                \
                    cdigit += (cdigit < 10) ? '0' : 'a'-10;             \
                    *--p = cdigit;                                      \
                    accumbits -= bits;                                  \
                    accum >>= bits;                                     \
                } while (i < size_a-1 ? accumbits >= bits : accum > 0); \
            }                                                           \
        }                                                               \
                                                                        \
        if (alternate) {                                                \
            if (base == 16)                                             \
                *--p = 'x';                                             \
            else if (base == 8)                                         \
                *--p = 'o';                                             \
            else /* (base == 2) */                                      \
                *--p = 'b';                                             \
            *--p = '0';                                                 \
        }                                                               \
        if (negative)                                                   \
            *--p = '-';                                                 \
    } while (0)

#define WRITE_UNICODE_DIGITS(TYPE)                                      \
    do {                                                                \
        if (writer)                                                     \
            p = (TYPE*)TyUnicode_DATA(writer->buffer) + writer->pos + sz; \
        else                                                            \
            p = (TYPE*)TyUnicode_DATA(v) + sz;                          \
                                                                        \
        WRITE_DIGITS(p);                                                \
                                                                        \
        if (writer)                                                     \
            assert(p == ((TYPE*)TyUnicode_DATA(writer->buffer) + writer->pos)); \
        else                                                            \
            assert(p == (TYPE*)TyUnicode_DATA(v));                      \
    } while (0)

    if (bytes_writer) {
        char *p = *bytes_str + sz;
        WRITE_DIGITS(p);
        assert(p == *bytes_str);
    }
    else {
        int kind = writer ? writer->kind : TyUnicode_KIND(v);
        if (kind == TyUnicode_1BYTE_KIND) {
            Ty_UCS1 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS1);
        }
        else if (kind == TyUnicode_2BYTE_KIND) {
            Ty_UCS2 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS2);
        }
        else {
            assert (kind == TyUnicode_4BYTE_KIND);
            Ty_UCS4 *p;
            WRITE_UNICODE_DIGITS(Ty_UCS4);
        }
    }

#undef WRITE_DIGITS
#undef WRITE_UNICODE_DIGITS

    if (writer) {
        writer->pos += sz;
    }
    else if (bytes_writer) {
        (*bytes_str) += sz;
    }
    else {
        assert(_TyUnicode_CheckConsistency(v, 1));
        *p_output = v;
    }
    return 0;
}

TyObject *
_TyLong_Format(TyObject *obj, int base)
{
    TyObject *str;
    int err;
    if (base == 10)
        err = long_to_decimal_string_internal(obj, &str, NULL, NULL, NULL);
    else
        err = long_format_binary(obj, base, 1, &str, NULL, NULL, NULL);
    if (err == -1)
        return NULL;
    return str;
}

int
_TyLong_FormatWriter(_PyUnicodeWriter *writer,
                     TyObject *obj,
                     int base, int alternate)
{
    if (base == 10)
        return long_to_decimal_string_internal(obj, NULL, writer,
                                               NULL, NULL);
    else
        return long_format_binary(obj, base, alternate, NULL, writer,
                                  NULL, NULL);
}

char*
_TyLong_FormatBytesWriter(_PyBytesWriter *writer, char *str,
                          TyObject *obj,
                          int base, int alternate)
{
    char *str2;
    int res;
    str2 = str;
    if (base == 10)
        res = long_to_decimal_string_internal(obj, NULL, NULL,
                                              writer, &str2);
    else
        res = long_format_binary(obj, base, alternate, NULL, NULL,
                                 writer, &str2);
    if (res < 0)
        return NULL;
    assert(str2 != NULL);
    return str2;
}

/* Table of digit values for 8-bit string -> integer conversion.
 * '0' maps to 0, ..., '9' maps to 9.
 * 'a' and 'A' map to 10, ..., 'z' and 'Z' map to 35.
 * All other indices map to 37.
 * Note that when converting a base B string, a char c is a legitimate
 * base B digit iff _TyLong_DigitValue[Py_CHARPyLong_MASK(c)] < B.
 */
unsigned char _TyLong_DigitValue[256] = {
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  37, 37, 37, 37, 37, 37,
    37, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 37, 37, 37, 37,
    37, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
    37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
};

/* `start` and `end` point to the start and end of a string of base `base`
 * digits.  base is a power of 2 (2, 4, 8, 16, or 32). An unnormalized int is
 * returned in *res. The string should be already validated by the caller and
 * consists only of valid digit characters and underscores. `digits` gives the
 * number of digit characters.
 *
 * The point to this routine is that it takes time linear in the
 * number of string characters.
 *
 * Return values:
 *   -1 on syntax error (exception needs to be set, *res is untouched)
 *   0 else (exception may be set, in that case *res is set to NULL)
 */
static int
long_from_binary_base(const char *start, const char *end, Ty_ssize_t digits, int base, PyLongObject **res)
{
    const char *p;
    int bits_per_char;
    Ty_ssize_t n;
    PyLongObject *z;
    twodigits accum;
    int bits_in_accum;
    digit *pdigit;

    assert(base >= 2 && base <= 32 && (base & (base - 1)) == 0);
    n = base;
    for (bits_per_char = -1; n; ++bits_per_char) {
        n >>= 1;
    }

    /* n <- the number of Python digits needed,
            = ceiling((digits * bits_per_char) / TyLong_SHIFT). */
    if (digits > (PY_SSIZE_T_MAX - (TyLong_SHIFT - 1)) / bits_per_char) {
        TyErr_SetString(TyExc_ValueError,
                        "int string too large to convert");
        *res = NULL;
        return 0;
    }
    n = (digits * bits_per_char + TyLong_SHIFT - 1) / TyLong_SHIFT;
    z = long_alloc(n);
    if (z == NULL) {
        *res = NULL;
        return 0;
    }
    /* Read string from right, and fill in int from left; i.e.,
     * from least to most significant in both.
     */
    accum = 0;
    bits_in_accum = 0;
    pdigit = z->long_value.ob_digit;
    p = end;
    while (--p >= start) {
        int k;
        if (*p == '_') {
            continue;
        }
        k = (int)_TyLong_DigitValue[Ty_CHARMASK(*p)];
        assert(k >= 0 && k < base);
        accum |= (twodigits)k << bits_in_accum;
        bits_in_accum += bits_per_char;
        if (bits_in_accum >= TyLong_SHIFT) {
            *pdigit++ = (digit)(accum & TyLong_MASK);
            assert(pdigit - z->long_value.ob_digit <= n);
            accum >>= TyLong_SHIFT;
            bits_in_accum -= TyLong_SHIFT;
            assert(bits_in_accum < TyLong_SHIFT);
        }
    }
    if (bits_in_accum) {
        assert(bits_in_accum <= TyLong_SHIFT);
        *pdigit++ = (digit)accum;
        assert(pdigit - z->long_value.ob_digit <= n);
    }
    while (pdigit - z->long_value.ob_digit < n)
        *pdigit++ = 0;
    *res = z;
    return 0;
}

#ifdef WITH_PYLONG_MODULE
/* asymptotically faster str-to-long conversion for base 10, using _pylong.py */
static int
pylong_int_from_string(const char *start, const char *end, PyLongObject **res)
{
    TyObject *mod = TyImport_ImportModule("_pylong");
    if (mod == NULL) {
        goto error;
    }
    TyObject *s = TyUnicode_FromStringAndSize(start, end-start);
    if (s == NULL) {
        Ty_DECREF(mod);
        goto error;
    }
    TyObject *result = PyObject_CallMethod(mod, "int_from_string", "O", s);
    Ty_DECREF(s);
    Ty_DECREF(mod);
    if (result == NULL) {
        goto error;
    }
    if (!TyLong_Check(result)) {
        Ty_DECREF(result);
        TyErr_SetString(TyExc_TypeError,
                        "_pylong.int_from_string did not return an int");
        goto error;
    }
    *res = (PyLongObject *)result;
    return 0;
error:
    *res = NULL;
    return 0;  // See the long_from_string_base() API comment.
}
#endif /* WITH_PYLONG_MODULE */

/***
long_from_non_binary_base: parameters and return values are the same as
long_from_binary_base.

Binary bases can be converted in time linear in the number of digits, because
Python's representation base is binary.  Other bases (including decimal!) use
the simple quadratic-time algorithm below, complicated by some speed tricks.

First some math:  the largest integer that can be expressed in N base-B digits
is B**N-1.  Consequently, if we have an N-digit input in base B, the worst-
case number of Python digits needed to hold it is the smallest integer n s.t.

    BASE**n-1 >= B**N-1  [or, adding 1 to both sides]
    BASE**n >= B**N      [taking logs to base BASE]
    n >= log(B**N)/log(BASE) = N * log(B)/log(BASE)

The static array log_base_BASE[base] == log(base)/log(BASE) so we can compute
this quickly.  A Python int with that much space is reserved near the start,
and the result is computed into it.

The input string is actually treated as being in base base**i (i.e., i digits
are processed at a time), where two more static arrays hold:

    convwidth_base[base] = the largest integer i such that base**i <= BASE
    convmultmax_base[base] = base ** convwidth_base[base]

The first of these is the largest i such that i consecutive input digits
must fit in a single Python digit.  The second is effectively the input
base we're really using.

Viewing the input as a sequence <c0, c1, ..., c_n-1> of digits in base
convmultmax_base[base], the result is "simply"

   (((c0*B + c1)*B + c2)*B + c3)*B + ... ))) + c_n-1

where B = convmultmax_base[base].

Error analysis:  as above, the number of Python digits `n` needed is worst-
case

    n >= N * log(B)/log(BASE)

where `N` is the number of input digits in base `B`.  This is computed via

    size_z = (Ty_ssize_t)((scan - str) * log_base_BASE[base]) + 1;

below.  Two numeric concerns are how much space this can waste, and whether
the computed result can be too small.  To be concrete, assume BASE = 2**15,
which is the default (and it's unlikely anyone changes that).

Waste isn't a problem:  provided the first input digit isn't 0, the difference
between the worst-case input with N digits and the smallest input with N
digits is about a factor of B, but B is small compared to BASE so at most
one allocated Python digit can remain unused on that count.  If
N*log(B)/log(BASE) is mathematically an exact integer, then truncating that
and adding 1 returns a result 1 larger than necessary.  However, that can't
happen:  whenever B is a power of 2, long_from_binary_base() is called
instead, and it's impossible for B**i to be an integer power of 2**15 when
B is not a power of 2 (i.e., it's impossible for N*log(B)/log(BASE) to be
an exact integer when B is not a power of 2, since B**i has a prime factor
other than 2 in that case, but (2**15)**j's only prime factor is 2).

The computed result can be too small if the true value of N*log(B)/log(BASE)
is a little bit larger than an exact integer, but due to roundoff errors (in
computing log(B), log(BASE), their quotient, and/or multiplying that by N)
yields a numeric result a little less than that integer.  Unfortunately, "how
close can a transcendental function get to an integer over some range?"
questions are generally theoretically intractable.  Computer analysis via
continued fractions is practical:  expand log(B)/log(BASE) via continued
fractions, giving a sequence i/j of "the best" rational approximations.  Then
j*log(B)/log(BASE) is approximately equal to (the integer) i.  This shows that
we can get very close to being in trouble, but very rarely.  For example,
76573 is a denominator in one of the continued-fraction approximations to
log(10)/log(2**15), and indeed:

    >>> log(10)/log(2**15)*76573
    16958.000000654003

is very close to an integer.  If we were working with IEEE single-precision,
rounding errors could kill us.  Finding worst cases in IEEE double-precision
requires better-than-double-precision log() functions, and Tim didn't bother.
Instead the code checks to see whether the allocated space is enough as each
new Python digit is added, and copies the whole thing to a larger int if not.
This should happen extremely rarely, and in fact I don't have a test case
that triggers it(!).  Instead the code was tested by artificially allocating
just 1 digit at the start, so that the copying code was exercised for every
digit beyond the first.
***/

// Tables are computed by Tools/scripts/long_conv_tables.py
#if PYLONG_BITS_IN_DIGIT == 15
    static const double log_base_BASE[37] = {0.0, 0.0, 0.0,
        0.10566416671474375, 0.0, 0.15479520632582416,
        0.17233083338141042, 0.18715699480384027, 0.0,
        0.2113283334294875, 0.22146187299249084, 0.23062877457581984,
        0.2389975000480771, 0.24669598120940617, 0.25382366147050694,
        0.26045937304056793, 0.0, 0.27249752275002265,
        0.27799500009615413, 0.2831951675629057, 0.28812853965915747,
        0.29282116151858406, 0.2972954412424865, 0.3015707970704675,
        0.3056641667147438, 0.30959041265164833, 0.3133626478760728,
        0.31699250014423125, 0.3204903281371736, 0.3238653996751715,
        0.3271260397072346, 0.3302797540257917, 0.0,
        0.3362929412905636, 0.3391641894166893, 0.34195220112966446,
        0.34466166676282084};
    static const int convwidth_base[37] = {0, 0, 0, 9, 0, 6, 5, 5, 0,
        4, 4, 4, 4, 4, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        3, 3, 0, 2, 2, 2, 2};
    static const twodigits convmultmax_base[37] = {0, 0, 0, 19683, 0,
        15625, 7776, 16807, 0, 6561, 10000, 14641, 20736, 28561, 2744,
        3375, 0, 4913, 5832, 6859, 8000, 9261, 10648, 12167, 13824,
        15625, 17576, 19683, 21952, 24389, 27000, 29791, 0, 1089,
        1156, 1225, 1296};
#elif PYLONG_BITS_IN_DIGIT == 30
    static const double log_base_BASE[37] = {0.0, 0.0, 0.0,
        0.05283208335737188, 0.0, 0.07739760316291208,
        0.08616541669070521, 0.09357849740192013, 0.0,
        0.10566416671474375, 0.11073093649624542, 0.11531438728790992,
        0.11949875002403855, 0.12334799060470308, 0.12691183073525347,
        0.13022968652028397, 0.0, 0.13624876137501132,
        0.13899750004807707, 0.14159758378145285, 0.14406426982957873,
        0.14641058075929203, 0.14864772062124326, 0.15078539853523376,
        0.1528320833573719, 0.15479520632582416, 0.1566813239380364,
        0.15849625007211562, 0.1602451640685868, 0.16193269983758574,
        0.1635630198536173, 0.16513987701289584, 0.0,
        0.1681464706452818, 0.16958209470834465, 0.17097610056483223,
        0.17233083338141042};
    static const int convwidth_base[37] = {0, 0, 0, 18, 0, 12, 11, 10,
        0, 9, 9, 8, 8, 8, 7, 7, 0, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 0, 5, 5, 5, 5};
    static const twodigits convmultmax_base[37] = {0, 0, 0, 387420489,
        0, 244140625, 362797056, 282475249, 0, 387420489, 1000000000,
        214358881, 429981696, 815730721, 105413504, 170859375, 0,
        410338673, 612220032, 893871739, 64000000, 85766121,
        113379904, 148035889, 191102976, 244140625, 308915776,
        387420489, 481890304, 594823321, 729000000, 887503681, 0,
        39135393, 45435424, 52521875, 60466176};
#else
    #error "invalid PYLONG_BITS_IN_DIGIT value"
#endif

static int
long_from_non_binary_base(const char *start, const char *end, Ty_ssize_t digits, int base, PyLongObject **res)
{
    twodigits c;           /* current input character */
    Ty_ssize_t size_z;
    int i;
    int convwidth;
    twodigits convmultmax, convmult;
    digit *pz, *pzstop;
    PyLongObject *z;
    const char *p;

    assert(log_base_BASE[base] != 0.0);

    /* Create an int object that can contain the largest possible
     * integer with this base and length.  Note that there's no
     * need to initialize z->long_value.ob_digit -- no slot is read up before
     * being stored into.
     */
    double fsize_z = (double)digits * log_base_BASE[base] + 1.0;
    if (fsize_z > (double)MAX_LONG_DIGITS) {
        /* The same exception as in long_alloc(). */
        TyErr_SetString(TyExc_OverflowError,
                        "too many digits in integer");
        *res = NULL;
        return 0;
    }
    size_z = (Ty_ssize_t)fsize_z;
    /* Uncomment next line to test exceedingly rare copy code */
    /* size_z = 1; */
    assert(size_z > 0);
    z = long_alloc(size_z);
    if (z == NULL) {
        *res = NULL;
        return 0;
    }
    _TyLong_SetSignAndDigitCount(z, 0, 0);

    /* `convwidth` consecutive input digits are treated as a single
     * digit in base `convmultmax`.
     */
    convwidth = convwidth_base[base];
    convmultmax = convmultmax_base[base];

    /* Work ;-) */
    p = start;
    while (p < end) {
        if (*p == '_') {
            p++;
            continue;
        }
        /* grab up to convwidth digits from the input string */
        c = (digit)_TyLong_DigitValue[Ty_CHARMASK(*p++)];
        for (i = 1; i < convwidth && p != end; ++p) {
            if (*p == '_') {
                continue;
            }
            i++;
            c = (twodigits)(c *  base +
                            (int)_TyLong_DigitValue[Ty_CHARMASK(*p)]);
            assert(c < TyLong_BASE);
        }

        convmult = convmultmax;
        /* Calculate the shift only if we couldn't get
         * convwidth digits.
         */
        if (i != convwidth) {
            convmult = base;
            for ( ; i > 1; --i) {
                convmult *= base;
            }
        }

        /* Multiply z by convmult, and add c. */
        pz = z->long_value.ob_digit;
        pzstop = pz + _TyLong_DigitCount(z);
        for (; pz < pzstop; ++pz) {
            c += (twodigits)*pz * convmult;
            *pz = (digit)(c & TyLong_MASK);
            c >>= TyLong_SHIFT;
        }
        /* carry off the current end? */
        if (c) {
            assert(c < TyLong_BASE);
            if (_TyLong_DigitCount(z) < size_z) {
                *pz = (digit)c;
                assert(!_TyLong_IsNegative(z));
                _TyLong_SetSignAndDigitCount(z, 1, _TyLong_DigitCount(z) + 1);
            }
            else {
                PyLongObject *tmp;
                /* Extremely rare.  Get more space. */
                assert(_TyLong_DigitCount(z) == size_z);
                tmp = long_alloc(size_z + 1);
                if (tmp == NULL) {
                    Ty_DECREF(z);
                    *res = NULL;
                    return 0;
                }
                memcpy(tmp->long_value.ob_digit,
                       z->long_value.ob_digit,
                       sizeof(digit) * size_z);
                Ty_SETREF(z, tmp);
                z->long_value.ob_digit[size_z] = (digit)c;
                ++size_z;
            }
        }
    }
    *res = z;
    return 0;
}

/* *str points to the first digit in a string of base `base` digits. base is an
 * integer from 2 to 36 inclusive. Here we don't need to worry about prefixes
 * like 0x or leading +- signs. The string should be null terminated consisting
 * of ASCII digits and separating underscores possibly with trailing whitespace
 * but we have to validate all of those points here.
 *
 * If base is a power of 2 then the complexity is linear in the number of
 * characters in the string. Otherwise a quadratic algorithm is used for
 * non-binary bases.
 *
 * Return values:
 *
 *   - Returns -1 on syntax error (exception needs to be set, *res is untouched)
 *   - Returns 0 and sets *res to NULL for MemoryError, OverflowError, or
 *     _pylong.int_from_string() errors.
 *   - Returns 0 and sets *res to an unsigned, unnormalized PyLong (success!).
 *
 * Afterwards *str is set to point to the first non-digit (which may be *str!).
 */
static int
long_from_string_base(const char **str, int base, PyLongObject **res)
{
    const char *start, *end, *p;
    char prev = 0;
    Ty_ssize_t digits = 0;
    int is_binary_base = (base & (base - 1)) == 0;

    /* Here we do four things:
     *
     * - Find the `end` of the string.
     * - Validate the string.
     * - Count the number of `digits` (rather than underscores)
     * - Point *str to the end-of-string or first invalid character.
     */
    start = p = *str;
    /* Leading underscore not allowed. */
    if (*start == '_') {
        return -1;
    }
    /* Verify all characters are digits and underscores. */
    while (_TyLong_DigitValue[Ty_CHARMASK(*p)] < base || *p == '_') {
        if (*p == '_') {
            /* Double underscore not allowed. */
            if (prev == '_') {
                *str = p - 1;
                return -1;
            }
        } else {
            ++digits;
        }
        prev = *p;
        ++p;
    }
    /* Trailing underscore not allowed. */
    if (prev == '_') {
        *str = p - 1;
        return -1;
    }
    *str = end = p;
    /* Reject empty strings */
    if (start == end) {
        return -1;
    }
    /* Allow only trailing whitespace after `end` */
    while (*p && Ty_ISSPACE(*p)) {
        p++;
    }
    *str = p;
    if (*p != '\0') {
        return -1;
    }

    /*
     * Pass a validated string consisting of only valid digits and underscores
     * to long_from_xxx_base.
     */
    if (is_binary_base) {
        /* Use the linear algorithm for binary bases. */
        return long_from_binary_base(start, end, digits, base, res);
    }
    else {
        /* Limit the size to avoid excessive computation attacks exploiting the
         * quadratic algorithm. */
        if (digits > _PY_LONG_MAX_STR_DIGITS_THRESHOLD) {
            TyInterpreterState *interp = _TyInterpreterState_GET();
            int max_str_digits = interp->long_state.max_str_digits;
            if ((max_str_digits > 0) && (digits > max_str_digits)) {
                TyErr_Format(TyExc_ValueError, _MAX_STR_DIGITS_ERROR_FMT_TO_INT,
                             max_str_digits, digits);
                *res = NULL;
                return 0;
            }
        }
#if WITH_PYLONG_MODULE
        if (digits > 6000 && base == 10) {
            /* Switch to _pylong.int_from_string() */
            return pylong_int_from_string(start, end, res);
        }
#endif
        /* Use the quadratic algorithm for non binary bases. */
        return long_from_non_binary_base(start, end, digits, base, res);
    }
}

/* Parses an int from a bytestring. Leading and trailing whitespace will be
 * ignored.
 *
 * If successful, a PyLong object will be returned and 'pend' will be pointing
 * to the first unused byte unless it's NULL.
 *
 * If unsuccessful, NULL will be returned.
 */
TyObject *
TyLong_FromString(const char *str, char **pend, int base)
{
    int sign = 1, error_if_nonzero = 0;
    const char *orig_str = str;
    PyLongObject *z = NULL;
    TyObject *strobj;
    Ty_ssize_t slen;

    if ((base != 0 && base < 2) || base > 36) {
        TyErr_SetString(TyExc_ValueError,
                        "int() arg 2 must be >= 2 and <= 36");
        return NULL;
    }
    while (*str != '\0' && Ty_ISSPACE(*str)) {
        ++str;
    }
    if (*str == '+') {
        ++str;
    }
    else if (*str == '-') {
        ++str;
        sign = -1;
    }
    if (base == 0) {
        if (str[0] != '0') {
            base = 10;
        }
        else if (str[1] == 'x' || str[1] == 'X') {
            base = 16;
        }
        else if (str[1] == 'o' || str[1] == 'O') {
            base = 8;
        }
        else if (str[1] == 'b' || str[1] == 'B') {
            base = 2;
        }
        else {
            /* "old" (C-style) octal literal, now invalid.
               it might still be zero though */
            error_if_nonzero = 1;
            base = 10;
        }
    }
    if (str[0] == '0' &&
        ((base == 16 && (str[1] == 'x' || str[1] == 'X')) ||
         (base == 8  && (str[1] == 'o' || str[1] == 'O')) ||
         (base == 2  && (str[1] == 'b' || str[1] == 'B')))) {
        str += 2;
        /* One underscore allowed here. */
        if (*str == '_') {
            ++str;
        }
    }

    /* long_from_string_base is the main workhorse here. */
    int ret = long_from_string_base(&str, base, &z);
    if (ret == -1) {
        /* Syntax error. */
        goto onError;
    }
    if (z == NULL) {
        /* Error. exception already set. */
        return NULL;
    }

    if (error_if_nonzero) {
        /* reset the base to 0, else the exception message
           doesn't make too much sense */
        base = 0;
        if (!_TyLong_IsZero(z)) {
            goto onError;
        }
        /* there might still be other problems, therefore base
           remains zero here for the same reason */
    }

    /* Set sign and normalize */
    if (sign < 0) {
        _TyLong_FlipSign(z);
    }
    long_normalize(z);
    z = maybe_small_long(z);

    if (pend != NULL) {
        *pend = (char *)str;
    }
    return (TyObject *) z;

  onError:
    if (pend != NULL) {
        *pend = (char *)str;
    }
    Ty_XDECREF(z);
    slen = strlen(orig_str) < 200 ? strlen(orig_str) : 200;
    strobj = TyUnicode_FromStringAndSize(orig_str, slen);
    if (strobj == NULL) {
        return NULL;
    }
    TyErr_Format(TyExc_ValueError,
                 "invalid literal for int() with base %d: %.200R",
                 base, strobj);
    Ty_DECREF(strobj);
    return NULL;
}

/* Since TyLong_FromString doesn't have a length parameter,
 * check here for possible NULs in the string.
 *
 * Reports an invalid literal as a bytes object.
 */
TyObject *
_TyLong_FromBytes(const char *s, Ty_ssize_t len, int base)
{
    TyObject *result, *strobj;
    char *end = NULL;

    result = TyLong_FromString(s, &end, base);
    if (end == NULL || (result != NULL && end == s + len))
        return result;
    Ty_XDECREF(result);
    strobj = TyBytes_FromStringAndSize(s, Ty_MIN(len, 200));
    if (strobj != NULL) {
        TyErr_Format(TyExc_ValueError,
                     "invalid literal for int() with base %d: %.200R",
                     base, strobj);
        Ty_DECREF(strobj);
    }
    return NULL;
}

TyObject *
TyLong_FromUnicodeObject(TyObject *u, int base)
{
    TyObject *result, *asciidig;
    const char *buffer;
    char *end = NULL;
    Ty_ssize_t buflen;

    asciidig = _TyUnicode_TransformDecimalAndSpaceToASCII(u);
    if (asciidig == NULL)
        return NULL;
    assert(TyUnicode_IS_ASCII(asciidig));
    /* Simply get a pointer to existing ASCII characters. */
    buffer = TyUnicode_AsUTF8AndSize(asciidig, &buflen);
    assert(buffer != NULL);

    result = TyLong_FromString(buffer, &end, base);
    if (end == NULL || (result != NULL && end == buffer + buflen)) {
        Ty_DECREF(asciidig);
        return result;
    }
    Ty_DECREF(asciidig);
    Ty_XDECREF(result);
    TyErr_Format(TyExc_ValueError,
                 "invalid literal for int() with base %d: %.200R",
                 base, u);
    return NULL;
}

/* Int division with remainder, top-level routine */

static int
long_divrem(PyLongObject *a, PyLongObject *b,
            PyLongObject **pdiv, PyLongObject **prem)
{
    Ty_ssize_t size_a = _TyLong_DigitCount(a), size_b = _TyLong_DigitCount(b);
    PyLongObject *z;

    if (size_b == 0) {
        TyErr_SetString(TyExc_ZeroDivisionError, "division by zero");
        return -1;
    }
    if (size_a < size_b ||
        (size_a == size_b &&
         a->long_value.ob_digit[size_a-1] < b->long_value.ob_digit[size_b-1])) {
        /* |a| < |b|. */
        *prem = (PyLongObject *)long_long((TyObject *)a);
        if (*prem == NULL) {
            return -1;
        }
        *pdiv = (PyLongObject*)_TyLong_GetZero();
        return 0;
    }
    if (size_b == 1) {
        digit rem = 0;
        z = divrem1(a, b->long_value.ob_digit[0], &rem);
        if (z == NULL)
            return -1;
        *prem = (PyLongObject *) TyLong_FromLong((long)rem);
        if (*prem == NULL) {
            Ty_DECREF(z);
            return -1;
        }
    }
    else {
        z = x_divrem(a, b, prem);
        *prem = maybe_small_long(*prem);
        if (z == NULL)
            return -1;
    }
    /* Set the signs.
       The quotient z has the sign of a*b;
       the remainder r has the sign of a,
       so a = b*z + r. */
    if ((_TyLong_IsNegative(a)) != (_TyLong_IsNegative(b))) {
        _TyLong_Negate(&z);
        if (z == NULL) {
            Ty_CLEAR(*prem);
            return -1;
        }
    }
    if (_TyLong_IsNegative(a) && !_TyLong_IsZero(*prem)) {
        _TyLong_Negate(prem);
        if (*prem == NULL) {
            Ty_DECREF(z);
            Ty_CLEAR(*prem);
            return -1;
        }
    }
    *pdiv = maybe_small_long(z);
    return 0;
}

/* Int remainder, top-level routine */

static int
long_rem(PyLongObject *a, PyLongObject *b, PyLongObject **prem)
{
    Ty_ssize_t size_a = _TyLong_DigitCount(a), size_b = _TyLong_DigitCount(b);

    if (size_b == 0) {
        TyErr_SetString(TyExc_ZeroDivisionError,
                        "division by zero");
        return -1;
    }
    if (size_a < size_b ||
        (size_a == size_b &&
         a->long_value.ob_digit[size_a-1] < b->long_value.ob_digit[size_b-1])) {
        /* |a| < |b|. */
        *prem = (PyLongObject *)long_long((TyObject *)a);
        return -(*prem == NULL);
    }
    if (size_b == 1) {
        *prem = rem1(a, b->long_value.ob_digit[0]);
        if (*prem == NULL)
            return -1;
    }
    else {
        /* Slow path using divrem. */
        Ty_XDECREF(x_divrem(a, b, prem));
        *prem = maybe_small_long(*prem);
        if (*prem == NULL)
            return -1;
    }
    /* Set the sign. */
    if (_TyLong_IsNegative(a) && !_TyLong_IsZero(*prem)) {
        _TyLong_Negate(prem);
        if (*prem == NULL) {
            Ty_CLEAR(*prem);
            return -1;
        }
    }
    return 0;
}

/* Unsigned int division with remainder -- the algorithm.  The arguments v1
   and w1 should satisfy 2 <= _TyLong_DigitCount(w1) <= _TyLong_DigitCount(v1). */

static PyLongObject *
x_divrem(PyLongObject *v1, PyLongObject *w1, PyLongObject **prem)
{
    PyLongObject *v, *w, *a;
    Ty_ssize_t i, k, size_v, size_w;
    int d;
    digit wm1, wm2, carry, q, r, vtop, *v0, *vk, *w0, *ak;
    twodigits vv;
    sdigit zhi;
    stwodigits z;

    /* We follow Knuth [The Art of Computer Programming, Vol. 2 (3rd
       edn.), section 4.3.1, Algorithm D], except that we don't explicitly
       handle the special case when the initial estimate q for a quotient
       digit is >= TyLong_BASE: the max value for q is TyLong_BASE+1, and
       that won't overflow a digit. */

    /* allocate space; w will also be used to hold the final remainder */
    size_v = _TyLong_DigitCount(v1);
    size_w = _TyLong_DigitCount(w1);
    assert(size_v >= size_w && size_w >= 2); /* Assert checks by div() */
    v = long_alloc(size_v+1);
    if (v == NULL) {
        *prem = NULL;
        return NULL;
    }
    w = long_alloc(size_w);
    if (w == NULL) {
        Ty_DECREF(v);
        *prem = NULL;
        return NULL;
    }

    /* normalize: shift w1 left so that its top digit is >= TyLong_BASE/2.
       shift v1 left by the same amount.  Results go into w and v. */
    d = TyLong_SHIFT - bit_length_digit(w1->long_value.ob_digit[size_w-1]);
    carry = v_lshift(w->long_value.ob_digit, w1->long_value.ob_digit, size_w, d);
    assert(carry == 0);
    carry = v_lshift(v->long_value.ob_digit, v1->long_value.ob_digit, size_v, d);
    if (carry != 0 || v->long_value.ob_digit[size_v-1] >= w->long_value.ob_digit[size_w-1]) {
        v->long_value.ob_digit[size_v] = carry;
        size_v++;
    }

    /* Now v->long_value.ob_digit[size_v-1] < w->long_value.ob_digit[size_w-1], so quotient has
       at most (and usually exactly) k = size_v - size_w digits. */
    k = size_v - size_w;
    assert(k >= 0);
    a = long_alloc(k);
    if (a == NULL) {
        Ty_DECREF(w);
        Ty_DECREF(v);
        *prem = NULL;
        return NULL;
    }
    v0 = v->long_value.ob_digit;
    w0 = w->long_value.ob_digit;
    wm1 = w0[size_w-1];
    wm2 = w0[size_w-2];
    for (vk = v0+k, ak = a->long_value.ob_digit + k; vk-- > v0;) {
        /* inner loop: divide vk[0:size_w+1] by w0[0:size_w], giving
           single-digit quotient q, remainder in vk[0:size_w]. */

        SIGCHECK({
                Ty_DECREF(a);
                Ty_DECREF(w);
                Ty_DECREF(v);
                *prem = NULL;
                return NULL;
            });

        /* estimate quotient digit q; may overestimate by 1 (rare) */
        vtop = vk[size_w];
        assert(vtop <= wm1);
        vv = ((twodigits)vtop << TyLong_SHIFT) | vk[size_w-1];
        /* The code used to compute the remainder via
         *     r = (digit)(vv - (twodigits)wm1 * q);
         * and compilers generally generated code to do the * and -.
         * But modern processors generally compute q and r with a single
         * instruction, and modern optimizing compilers exploit that if we
         * _don't_ try to optimize it.
         */
        q = (digit)(vv / wm1);
        r = (digit)(vv % wm1);
        while ((twodigits)wm2 * q > (((twodigits)r << TyLong_SHIFT)
                                     | vk[size_w-2])) {
            --q;
            r += wm1;
            if (r >= TyLong_BASE)
                break;
        }
        assert(q <= TyLong_BASE);

        /* subtract q*w0[0:size_w] from vk[0:size_w+1] */
        zhi = 0;
        for (i = 0; i < size_w; ++i) {
            /* invariants: -TyLong_BASE <= -q <= zhi <= 0;
               -TyLong_BASE * q <= z < TyLong_BASE */
            z = (sdigit)vk[i] + zhi -
                (stwodigits)q * (stwodigits)w0[i];
            vk[i] = (digit)z & TyLong_MASK;
            zhi = (sdigit)Ty_ARITHMETIC_RIGHT_SHIFT(stwodigits,
                                                    z, TyLong_SHIFT);
        }

        /* add w back if q was too large (this branch taken rarely) */
        assert((sdigit)vtop + zhi == -1 || (sdigit)vtop + zhi == 0);
        if ((sdigit)vtop + zhi < 0) {
            carry = 0;
            for (i = 0; i < size_w; ++i) {
                carry += vk[i] + w0[i];
                vk[i] = carry & TyLong_MASK;
                carry >>= TyLong_SHIFT;
            }
            --q;
        }

        /* store quotient digit */
        assert(q < TyLong_BASE);
        *--ak = q;
    }

    /* unshift remainder; we reuse w to store the result */
    carry = v_rshift(w0, v0, size_w, d);
    assert(carry==0);
    Ty_DECREF(v);

    *prem = long_normalize(w);
    return long_normalize(a);
}

/* For a nonzero PyLong a, express a in the form x * 2**e, with 0.5 <=
   abs(x) < 1.0 and e >= 0; return x and put e in *e.  Here x is
   rounded to DBL_MANT_DIG significant bits using round-half-to-even.
   If a == 0, return 0.0 and set *e = 0.  */

/* attempt to define 2.0**DBL_MANT_DIG as a compile-time constant */
#if DBL_MANT_DIG == 53
#define EXP2_DBL_MANT_DIG 9007199254740992.0
#else
#define EXP2_DBL_MANT_DIG (ldexp(1.0, DBL_MANT_DIG))
#endif

double
_TyLong_Frexp(PyLongObject *a, int64_t *e)
{
    Ty_ssize_t a_size, shift_digits, x_size;
    int shift_bits;
    int64_t a_bits;
    /* See below for why x_digits is always large enough. */
    digit rem;
    digit x_digits[2 + (DBL_MANT_DIG + 1) / TyLong_SHIFT] = {0,};
    double dx;
    /* Correction term for round-half-to-even rounding.  For a digit x,
       "x + half_even_correction[x & 7]" gives x rounded to the nearest
       multiple of 4, rounding ties to a multiple of 8. */
    static const int half_even_correction[8] = {0, -1, -2, 1, 0, -1, 2, 1};

    a_size = _TyLong_DigitCount(a);
    if (a_size == 0) {
        /* Special case for 0: significand 0.0, exponent 0. */
        *e = 0;
        return 0.0;
    }
    a_bits = _TyLong_NumBits((TyObject *)a);

    /* Shift the first DBL_MANT_DIG + 2 bits of a into x_digits[0:x_size]
       (shifting left if a_bits <= DBL_MANT_DIG + 2).

       Number of digits needed for result: write // for floor division.
       Then if shifting left, we end up using

         1 + a_size + (DBL_MANT_DIG + 2 - a_bits) // TyLong_SHIFT

       digits.  If shifting right, we use

         a_size - (a_bits - DBL_MANT_DIG - 2) // TyLong_SHIFT

       digits.  Using a_size = 1 + (a_bits - 1) // TyLong_SHIFT along with
       the inequalities

         m // TyLong_SHIFT + n // TyLong_SHIFT <= (m + n) // TyLong_SHIFT
         m // TyLong_SHIFT - n // TyLong_SHIFT <=
                                          1 + (m - n - 1) // TyLong_SHIFT,

       valid for any integers m and n, we find that x_size satisfies

         x_size <= 2 + (DBL_MANT_DIG + 1) // TyLong_SHIFT

       in both cases.
    */
    if (a_bits <= DBL_MANT_DIG + 2) {
        shift_digits = (DBL_MANT_DIG + 2 - (Ty_ssize_t)a_bits) / TyLong_SHIFT;
        shift_bits = (DBL_MANT_DIG + 2 - (int)a_bits) % TyLong_SHIFT;
        x_size = shift_digits;
        rem = v_lshift(x_digits + x_size, a->long_value.ob_digit, a_size,
                       shift_bits);
        x_size += a_size;
        x_digits[x_size++] = rem;
    }
    else {
        shift_digits = (Ty_ssize_t)((a_bits - DBL_MANT_DIG - 2) / TyLong_SHIFT);
        shift_bits = (int)((a_bits - DBL_MANT_DIG - 2) % TyLong_SHIFT);
        rem = v_rshift(x_digits, a->long_value.ob_digit + shift_digits,
                       a_size - shift_digits, shift_bits);
        x_size = a_size - shift_digits;
        /* For correct rounding below, we need the least significant
           bit of x to be 'sticky' for this shift: if any of the bits
           shifted out was nonzero, we set the least significant bit
           of x. */
        if (rem)
            x_digits[0] |= 1;
        else
            while (shift_digits > 0)
                if (a->long_value.ob_digit[--shift_digits]) {
                    x_digits[0] |= 1;
                    break;
                }
    }
    assert(1 <= x_size && x_size <= (Ty_ssize_t)Ty_ARRAY_LENGTH(x_digits));

    /* Round, and convert to double. */
    x_digits[0] += half_even_correction[x_digits[0] & 7];
    dx = x_digits[--x_size];
    while (x_size > 0)
        dx = dx * TyLong_BASE + x_digits[--x_size];

    /* Rescale;  make correction if result is 1.0. */
    dx /= 4.0 * EXP2_DBL_MANT_DIG;
    if (dx == 1.0) {
        assert(a_bits < INT64_MAX);
        dx = 0.5;
        a_bits += 1;
    }

    *e = a_bits;
    return _TyLong_IsNegative(a) ? -dx : dx;
}

/* Get a C double from an int object.  Rounds to the nearest double,
   using the round-half-to-even rule in the case of a tie. */

double
TyLong_AsDouble(TyObject *v)
{
    int64_t exponent;
    double x;

    if (v == NULL) {
        TyErr_BadInternalCall();
        return -1.0;
    }
    if (!TyLong_Check(v)) {
        TyErr_SetString(TyExc_TypeError, "an integer is required");
        return -1.0;
    }
    if (_TyLong_IsCompact((PyLongObject *)v)) {
        /* Fast path; single digit long (31 bits) will cast safely
           to double.  This improves performance of FP/long operations
           by 20%.
        */
        return (double)medium_value((PyLongObject *)v);
    }
    x = _TyLong_Frexp((PyLongObject *)v, &exponent);
    assert(exponent >= 0);
    assert(!TyErr_Occurred());
    if (exponent > DBL_MAX_EXP) {
        TyErr_SetString(TyExc_OverflowError,
                        "int too large to convert to float");
        return -1.0;
    }
    return ldexp(x, (int)exponent);
}

/* Methods */

/* if a < b, return a negative number
   if a == b, return 0
   if a > b, return a positive number */

static Ty_ssize_t
long_compare(PyLongObject *a, PyLongObject *b)
{
    if (_TyLong_BothAreCompact(a, b)) {
        return _TyLong_CompactValue(a) - _TyLong_CompactValue(b);
    }
    Ty_ssize_t sign = _TyLong_SignedDigitCount(a) - _TyLong_SignedDigitCount(b);
    if (sign == 0) {
        Ty_ssize_t i = _TyLong_DigitCount(a);
        sdigit diff = 0;
        while (--i >= 0) {
            diff = (sdigit) a->long_value.ob_digit[i] - (sdigit) b->long_value.ob_digit[i];
            if (diff) {
                break;
            }
        }
        sign = _TyLong_IsNegative(a) ? -diff : diff;
    }
    return sign;
}

static TyObject *
long_richcompare(TyObject *self, TyObject *other, int op)
{
    Ty_ssize_t result;
    CHECK_BINOP(self, other);
    if (self == other)
        result = 0;
    else
        result = long_compare((PyLongObject*)self, (PyLongObject*)other);
    Py_RETURN_RICHCOMPARE(result, 0, op);
}

static inline int
/// Return 1 if the object is one of the immortal small ints
_long_is_small_int(TyObject *op)
{
    PyLongObject *long_object = (PyLongObject *)op;
    int is_small_int = (long_object->long_value.lv_tag & IMMORTALITY_BIT_MASK) != 0;
    assert((!is_small_int) || TyLong_CheckExact(op));
    return is_small_int;
}

void
_TyLong_ExactDealloc(TyObject *self)
{
    assert(TyLong_CheckExact(self));
    if (_long_is_small_int(self)) {
        // See PEP 683, section Accidental De-Immortalizing for details
        _Ty_SetImmortal(self);
        return;
    }
    if (_TyLong_IsCompact((PyLongObject *)self)) {
        _Ty_FREELIST_FREE(ints, self, PyObject_Free);
        return;
    }
    PyObject_Free(self);
}

static void
long_dealloc(TyObject *self)
{
    if (_long_is_small_int(self)) {
        /* This should never get called, but we also don't want to SEGV if
         * we accidentally decref small Ints out of existence. Instead,
         * since small Ints are immortal, re-set the reference count.
         *
         * See PEP 683, section Accidental De-Immortalizing for details
         */
        _Ty_SetImmortal(self);
        return;
    }
    if (TyLong_CheckExact(self) && _TyLong_IsCompact((PyLongObject *)self)) {
        _Ty_FREELIST_FREE(ints, self, PyObject_Free);
        return;
    }
    Ty_TYPE(self)->tp_free(self);
}

static Ty_hash_t
long_hash(TyObject *obj)
{
    PyLongObject *v = (PyLongObject *)obj;
    Ty_uhash_t x;
    Ty_ssize_t i;
    int sign;

    if (_TyLong_IsCompact(v)) {
        x = (Ty_uhash_t)_TyLong_CompactValue(v);
        if (x == (Ty_uhash_t)-1) {
            x = (Ty_uhash_t)-2;
        }
        return x;
    }
    i = _TyLong_DigitCount(v);
    sign = _TyLong_NonCompactSign(v);
    x = 0;
    while (--i >= 0) {
        /* Here x is a quantity in the range [0, _PyHASH_MODULUS); we
           want to compute x * 2**TyLong_SHIFT + v->long_value.ob_digit[i] modulo
           _PyHASH_MODULUS.

           The computation of x * 2**TyLong_SHIFT % _PyHASH_MODULUS
           amounts to a rotation of the bits of x.  To see this, write

             x * 2**TyLong_SHIFT = y * 2**_PyHASH_BITS + z

           where y = x >> (_PyHASH_BITS - TyLong_SHIFT) gives the top
           TyLong_SHIFT bits of x (those that are shifted out of the
           original _PyHASH_BITS bits, and z = (x << TyLong_SHIFT) &
           _PyHASH_MODULUS gives the bottom _PyHASH_BITS - TyLong_SHIFT
           bits of x, shifted up.  Then since 2**_PyHASH_BITS is
           congruent to 1 modulo _PyHASH_MODULUS, y*2**_PyHASH_BITS is
           congruent to y modulo _PyHASH_MODULUS.  So

             x * 2**TyLong_SHIFT = y + z (mod _PyHASH_MODULUS).

           The right-hand side is just the result of rotating the
           _PyHASH_BITS bits of x left by TyLong_SHIFT places; since
           not all _PyHASH_BITS bits of x are 1s, the same is true
           after rotation, so 0 <= y+z < _PyHASH_MODULUS and y + z is
           the reduction of x*2**TyLong_SHIFT modulo
           _PyHASH_MODULUS. */
        x = ((x << TyLong_SHIFT) & _PyHASH_MODULUS) |
            (x >> (_PyHASH_BITS - TyLong_SHIFT));
        x += v->long_value.ob_digit[i];
        if (x >= _PyHASH_MODULUS)
            x -= _PyHASH_MODULUS;
    }
    x = x * sign;
    if (x == (Ty_uhash_t)-1)
        x = (Ty_uhash_t)-2;
    return (Ty_hash_t)x;
}


/* Add the absolute values of two integers. */

static PyLongObject *
x_add(PyLongObject *a, PyLongObject *b)
{
    Ty_ssize_t size_a = _TyLong_DigitCount(a), size_b = _TyLong_DigitCount(b);
    PyLongObject *z;
    Ty_ssize_t i;
    digit carry = 0;

    /* Ensure a is the larger of the two: */
    if (size_a < size_b) {
        { PyLongObject *temp = a; a = b; b = temp; }
        { Ty_ssize_t size_temp = size_a;
            size_a = size_b;
            size_b = size_temp; }
    }
    z = long_alloc(size_a+1);
    if (z == NULL)
        return NULL;
    for (i = 0; i < size_b; ++i) {
        carry += a->long_value.ob_digit[i] + b->long_value.ob_digit[i];
        z->long_value.ob_digit[i] = carry & TyLong_MASK;
        carry >>= TyLong_SHIFT;
    }
    for (; i < size_a; ++i) {
        carry += a->long_value.ob_digit[i];
        z->long_value.ob_digit[i] = carry & TyLong_MASK;
        carry >>= TyLong_SHIFT;
    }
    z->long_value.ob_digit[i] = carry;
    return long_normalize(z);
}

/* Subtract the absolute values of two integers. */

static PyLongObject *
x_sub(PyLongObject *a, PyLongObject *b)
{
    Ty_ssize_t size_a = _TyLong_DigitCount(a), size_b = _TyLong_DigitCount(b);
    PyLongObject *z;
    Ty_ssize_t i;
    int sign = 1;
    digit borrow = 0;

    /* Ensure a is the larger of the two: */
    if (size_a < size_b) {
        sign = -1;
        { PyLongObject *temp = a; a = b; b = temp; }
        { Ty_ssize_t size_temp = size_a;
            size_a = size_b;
            size_b = size_temp; }
    }
    else if (size_a == size_b) {
        /* Find highest digit where a and b differ: */
        i = size_a;
        while (--i >= 0 && a->long_value.ob_digit[i] == b->long_value.ob_digit[i])
            ;
        if (i < 0)
            return (PyLongObject *)TyLong_FromLong(0);
        if (a->long_value.ob_digit[i] < b->long_value.ob_digit[i]) {
            sign = -1;
            { PyLongObject *temp = a; a = b; b = temp; }
        }
        size_a = size_b = i+1;
    }
    z = long_alloc(size_a);
    if (z == NULL)
        return NULL;
    for (i = 0; i < size_b; ++i) {
        /* The following assumes unsigned arithmetic
           works module 2**N for some N>TyLong_SHIFT. */
        borrow = a->long_value.ob_digit[i] - b->long_value.ob_digit[i] - borrow;
        z->long_value.ob_digit[i] = borrow & TyLong_MASK;
        borrow >>= TyLong_SHIFT;
        borrow &= 1; /* Keep only one sign bit */
    }
    for (; i < size_a; ++i) {
        borrow = a->long_value.ob_digit[i] - borrow;
        z->long_value.ob_digit[i] = borrow & TyLong_MASK;
        borrow >>= TyLong_SHIFT;
        borrow &= 1; /* Keep only one sign bit */
    }
    assert(borrow == 0);
    if (sign < 0) {
        _TyLong_FlipSign(z);
    }
    return maybe_small_long(long_normalize(z));
}

static PyLongObject *
long_add(PyLongObject *a, PyLongObject *b)
{
    if (_TyLong_BothAreCompact(a, b)) {
        stwodigits z = medium_value(a) + medium_value(b);
        return _TyLong_FromSTwoDigits(z);
    }

    PyLongObject *z;
    if (_TyLong_IsNegative(a)) {
        if (_TyLong_IsNegative(b)) {
            z = x_add(a, b);
            if (z != NULL) {
                /* x_add received at least one multiple-digit int,
                   and thus z must be a multiple-digit int.
                   That also means z is not an element of
                   small_ints, so negating it in-place is safe. */
                assert(Ty_REFCNT(z) == 1);
                _TyLong_FlipSign(z);
            }
        }
        else
            z = x_sub(b, a);
    }
    else {
        if (_TyLong_IsNegative(b))
            z = x_sub(a, b);
        else
            z = x_add(a, b);
    }
    return z;
}

TyObject *
_TyLong_Add(PyLongObject *a, PyLongObject *b)
{
    return (TyObject*)long_add(a, b);
}

static TyObject *
long_add_method(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    return (TyObject*)long_add((PyLongObject*)a, (PyLongObject*)b);
}


static PyLongObject *
long_sub(PyLongObject *a, PyLongObject *b)
{
    if (_TyLong_BothAreCompact(a, b)) {
        return _TyLong_FromSTwoDigits(medium_value(a) - medium_value(b));
    }

    PyLongObject *z;
    if (_TyLong_IsNegative(a)) {
        if (_TyLong_IsNegative(b)) {
            z = x_sub(b, a);
        }
        else {
            z = x_add(a, b);
            if (z != NULL) {
                assert(_TyLong_IsZero(z) || Ty_REFCNT(z) == 1);
                _TyLong_FlipSign(z);
            }
        }
    }
    else {
        if (_TyLong_IsNegative(b))
            z = x_add(a, b);
        else
            z = x_sub(a, b);
    }
    return z;
}

TyObject *
_TyLong_Subtract(PyLongObject *a, PyLongObject *b)
{
    return (TyObject*)long_sub(a, b);
}

static TyObject *
long_sub_method(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    return (TyObject*)long_sub((PyLongObject*)a, (PyLongObject*)b);
}


/* Grade school multiplication, ignoring the signs.
 * Returns the absolute value of the product, or NULL if error.
 */
static PyLongObject *
x_mul(PyLongObject *a, PyLongObject *b)
{
    PyLongObject *z;
    Ty_ssize_t size_a = _TyLong_DigitCount(a);
    Ty_ssize_t size_b = _TyLong_DigitCount(b);
    Ty_ssize_t i;

    z = long_alloc(size_a + size_b);
    if (z == NULL)
        return NULL;

    memset(z->long_value.ob_digit, 0, _TyLong_DigitCount(z) * sizeof(digit));
    if (a == b) {
        /* Efficient squaring per HAC, Algorithm 14.16:
         * https://cacr.uwaterloo.ca/hac/about/chap14.pdf
         * Gives slightly less than a 2x speedup when a == b,
         * via exploiting that each entry in the multiplication
         * pyramid appears twice (except for the size_a squares).
         */
        digit *paend = a->long_value.ob_digit + size_a;
        for (i = 0; i < size_a; ++i) {
            twodigits carry;
            twodigits f = a->long_value.ob_digit[i];
            digit *pz = z->long_value.ob_digit + (i << 1);
            digit *pa = a->long_value.ob_digit + i + 1;

            SIGCHECK({
                    Ty_DECREF(z);
                    return NULL;
                });

            carry = *pz + f * f;
            *pz++ = (digit)(carry & TyLong_MASK);
            carry >>= TyLong_SHIFT;
            assert(carry <= TyLong_MASK);

            /* Now f is added in twice in each column of the
             * pyramid it appears.  Same as adding f<<1 once.
             */
            f <<= 1;
            while (pa < paend) {
                carry += *pz + *pa++ * f;
                *pz++ = (digit)(carry & TyLong_MASK);
                carry >>= TyLong_SHIFT;
                assert(carry <= (TyLong_MASK << 1));
            }
            if (carry) {
                /* See comment below. pz points at the highest possible
                 * carry position from the last outer loop iteration, so
                 * *pz is at most 1.
                 */
                assert(*pz <= 1);
                carry += *pz;
                *pz = (digit)(carry & TyLong_MASK);
                carry >>= TyLong_SHIFT;
                if (carry) {
                    /* If there's still a carry, it must be into a position
                     * that still holds a 0. Where the base
                     ^ B is 1 << TyLong_SHIFT, the last add was of a carry no
                     * more than 2*B - 2 to a stored digit no more than 1.
                     * So the sum was no more than 2*B - 1, so the current
                     * carry no more than floor((2*B - 1)/B) = 1.
                     */
                    assert(carry == 1);
                    assert(pz[1] == 0);
                    pz[1] = (digit)carry;
                }
            }
        }
    }
    else {      /* a is not the same as b -- gradeschool int mult */
        for (i = 0; i < size_a; ++i) {
            twodigits carry = 0;
            twodigits f = a->long_value.ob_digit[i];
            digit *pz = z->long_value.ob_digit + i;
            digit *pb = b->long_value.ob_digit;
            digit *pbend = b->long_value.ob_digit + size_b;

            SIGCHECK({
                    Ty_DECREF(z);
                    return NULL;
                });

            while (pb < pbend) {
                carry += *pz + *pb++ * f;
                *pz++ = (digit)(carry & TyLong_MASK);
                carry >>= TyLong_SHIFT;
                assert(carry <= TyLong_MASK);
            }
            if (carry)
                *pz += (digit)(carry & TyLong_MASK);
            assert((carry >> TyLong_SHIFT) == 0);
        }
    }
    return long_normalize(z);
}

/* A helper for Karatsuba multiplication (k_mul).
   Takes an int "n" and an integer "size" representing the place to
   split, and sets low and high such that abs(n) == (high << size) + low,
   viewing the shift as being by digits.  The sign bit is ignored, and
   the return values are >= 0.
   Returns 0 on success, -1 on failure.
*/
static int
kmul_split(PyLongObject *n,
           Ty_ssize_t size,
           PyLongObject **high,
           PyLongObject **low)
{
    PyLongObject *hi, *lo;
    Ty_ssize_t size_lo, size_hi;
    const Ty_ssize_t size_n = _TyLong_DigitCount(n);

    size_lo = Ty_MIN(size_n, size);
    size_hi = size_n - size_lo;

    if ((hi = long_alloc(size_hi)) == NULL)
        return -1;
    if ((lo = long_alloc(size_lo)) == NULL) {
        Ty_DECREF(hi);
        return -1;
    }

    memcpy(lo->long_value.ob_digit, n->long_value.ob_digit, size_lo * sizeof(digit));
    memcpy(hi->long_value.ob_digit, n->long_value.ob_digit + size_lo, size_hi * sizeof(digit));

    *high = long_normalize(hi);
    *low = long_normalize(lo);
    return 0;
}

static PyLongObject *k_lopsided_mul(PyLongObject *a, PyLongObject *b);

/* Karatsuba multiplication.  Ignores the input signs, and returns the
 * absolute value of the product (or NULL if error).
 * See Knuth Vol. 2 Chapter 4.3.3 (Pp. 294-295).
 */
static PyLongObject *
k_mul(PyLongObject *a, PyLongObject *b)
{
    Ty_ssize_t asize = _TyLong_DigitCount(a);
    Ty_ssize_t bsize = _TyLong_DigitCount(b);
    PyLongObject *ah = NULL;
    PyLongObject *al = NULL;
    PyLongObject *bh = NULL;
    PyLongObject *bl = NULL;
    PyLongObject *ret = NULL;
    PyLongObject *t1, *t2, *t3;
    Ty_ssize_t shift;           /* the number of digits we split off */
    Ty_ssize_t i;

    /* (ah*X+al)(bh*X+bl) = ah*bh*X*X + (ah*bl + al*bh)*X + al*bl
     * Let k = (ah+al)*(bh+bl) = ah*bl + al*bh  + ah*bh + al*bl
     * Then the original product is
     *     ah*bh*X*X + (k - ah*bh - al*bl)*X + al*bl
     * By picking X to be a power of 2, "*X" is just shifting, and it's
     * been reduced to 3 multiplies on numbers half the size.
     */

    /* We want to split based on the larger number; fiddle so that b
     * is largest.
     */
    if (asize > bsize) {
        t1 = a;
        a = b;
        b = t1;

        i = asize;
        asize = bsize;
        bsize = i;
    }

    /* Use gradeschool math when either number is too small. */
    i = a == b ? KARATSUBA_SQUARE_CUTOFF : KARATSUBA_CUTOFF;
    if (asize <= i) {
        if (asize == 0)
            return (PyLongObject *)TyLong_FromLong(0);
        else
            return x_mul(a, b);
    }

    /* If a is small compared to b, splitting on b gives a degenerate
     * case with ah==0, and Karatsuba may be (even much) less efficient
     * than "grade school" then.  However, we can still win, by viewing
     * b as a string of "big digits", each of the same width as a. That
     * leads to a sequence of balanced calls to k_mul.
     */
    if (2 * asize <= bsize)
        return k_lopsided_mul(a, b);

    /* Split a & b into hi & lo pieces. */
    shift = bsize >> 1;
    if (kmul_split(a, shift, &ah, &al) < 0) goto fail;
    assert(_TyLong_IsPositive(ah));        /* the split isn't degenerate */

    if (a == b) {
        bh = (PyLongObject*)Ty_NewRef(ah);
        bl = (PyLongObject*)Ty_NewRef(al);
    }
    else if (kmul_split(b, shift, &bh, &bl) < 0) goto fail;

    /* The plan:
     * 1. Allocate result space (asize + bsize digits:  that's always
     *    enough).
     * 2. Compute ah*bh, and copy into result at 2*shift.
     * 3. Compute al*bl, and copy into result at 0.  Note that this
     *    can't overlap with #2.
     * 4. Subtract al*bl from the result, starting at shift.  This may
     *    underflow (borrow out of the high digit), but we don't care:
     *    we're effectively doing unsigned arithmetic mod
     *    BASE**(sizea + sizeb), and so long as the *final* result fits,
     *    borrows and carries out of the high digit can be ignored.
     * 5. Subtract ah*bh from the result, starting at shift.
     * 6. Compute (ah+al)*(bh+bl), and add it into the result starting
     *    at shift.
     */

    /* 1. Allocate result space. */
    ret = long_alloc(asize + bsize);
    if (ret == NULL) goto fail;
#ifdef Ty_DEBUG
    /* Fill with trash, to catch reference to uninitialized digits. */
    memset(ret->long_value.ob_digit, 0xDF, _TyLong_DigitCount(ret) * sizeof(digit));
#endif

    /* 2. t1 <- ah*bh, and copy into high digits of result. */
    if ((t1 = k_mul(ah, bh)) == NULL) goto fail;
    assert(!_TyLong_IsNegative(t1));
    assert(2*shift + _TyLong_DigitCount(t1) <= _TyLong_DigitCount(ret));
    memcpy(ret->long_value.ob_digit + 2*shift, t1->long_value.ob_digit,
           _TyLong_DigitCount(t1) * sizeof(digit));

    /* Zero-out the digits higher than the ah*bh copy. */
    i = _TyLong_DigitCount(ret) - 2*shift - _TyLong_DigitCount(t1);
    if (i)
        memset(ret->long_value.ob_digit + 2*shift + _TyLong_DigitCount(t1), 0,
               i * sizeof(digit));

    /* 3. t2 <- al*bl, and copy into the low digits. */
    if ((t2 = k_mul(al, bl)) == NULL) {
        Ty_DECREF(t1);
        goto fail;
    }
    assert(!_TyLong_IsNegative(t2));
    assert(_TyLong_DigitCount(t2) <= 2*shift); /* no overlap with high digits */
    memcpy(ret->long_value.ob_digit, t2->long_value.ob_digit, _TyLong_DigitCount(t2) * sizeof(digit));

    /* Zero out remaining digits. */
    i = 2*shift - _TyLong_DigitCount(t2);          /* number of uninitialized digits */
    if (i)
        memset(ret->long_value.ob_digit + _TyLong_DigitCount(t2), 0, i * sizeof(digit));

    /* 4 & 5. Subtract ah*bh (t1) and al*bl (t2).  We do al*bl first
     * because it's fresher in cache.
     */
    i = _TyLong_DigitCount(ret) - shift;  /* # digits after shift */
    (void)v_isub(ret->long_value.ob_digit + shift, i, t2->long_value.ob_digit, _TyLong_DigitCount(t2));
    _Ty_DECREF_INT(t2);

    (void)v_isub(ret->long_value.ob_digit + shift, i, t1->long_value.ob_digit, _TyLong_DigitCount(t1));
    _Ty_DECREF_INT(t1);

    /* 6. t3 <- (ah+al)(bh+bl), and add into result. */
    if ((t1 = x_add(ah, al)) == NULL) goto fail;
    _Ty_DECREF_INT(ah);
    _Ty_DECREF_INT(al);
    ah = al = NULL;

    if (a == b) {
        t2 = (PyLongObject*)Ty_NewRef(t1);
    }
    else if ((t2 = x_add(bh, bl)) == NULL) {
        Ty_DECREF(t1);
        goto fail;
    }
    _Ty_DECREF_INT(bh);
    _Ty_DECREF_INT(bl);
    bh = bl = NULL;

    t3 = k_mul(t1, t2);
    _Ty_DECREF_INT(t1);
    _Ty_DECREF_INT(t2);
    if (t3 == NULL) goto fail;
    assert(!_TyLong_IsNegative(t3));

    /* Add t3.  It's not obvious why we can't run out of room here.
     * See the (*) comment after this function.
     */
    (void)v_iadd(ret->long_value.ob_digit + shift, i, t3->long_value.ob_digit, _TyLong_DigitCount(t3));
    _Ty_DECREF_INT(t3);

    return long_normalize(ret);

  fail:
    Ty_XDECREF(ret);
    Ty_XDECREF(ah);
    Ty_XDECREF(al);
    Ty_XDECREF(bh);
    Ty_XDECREF(bl);
    return NULL;
}

/* (*) Why adding t3 can't "run out of room" above.

Let f(x) mean the floor of x and c(x) mean the ceiling of x.  Some facts
to start with:

1. For any integer i, i = c(i/2) + f(i/2).  In particular,
   bsize = c(bsize/2) + f(bsize/2).
2. shift = f(bsize/2)
3. asize <= bsize
4. Since we call k_lopsided_mul if asize*2 <= bsize, asize*2 > bsize in this
   routine, so asize > bsize/2 >= f(bsize/2) in this routine.

We allocated asize + bsize result digits, and add t3 into them at an offset
of shift.  This leaves asize+bsize-shift allocated digit positions for t3
to fit into, = (by #1 and #2) asize + f(bsize/2) + c(bsize/2) - f(bsize/2) =
asize + c(bsize/2) available digit positions.

bh has c(bsize/2) digits, and bl at most f(size/2) digits.  So bh+hl has
at most c(bsize/2) digits + 1 bit.

If asize == bsize, ah has c(bsize/2) digits, else ah has at most f(bsize/2)
digits, and al has at most f(bsize/2) digits in any case.  So ah+al has at
most (asize == bsize ? c(bsize/2) : f(bsize/2)) digits + 1 bit.

The product (ah+al)*(bh+bl) therefore has at most

    c(bsize/2) + (asize == bsize ? c(bsize/2) : f(bsize/2)) digits + 2 bits

and we have asize + c(bsize/2) available digit positions.  We need to show
this is always enough.  An instance of c(bsize/2) cancels out in both, so
the question reduces to whether asize digits is enough to hold
(asize == bsize ? c(bsize/2) : f(bsize/2)) digits + 2 bits.  If asize < bsize,
then we're asking whether asize digits >= f(bsize/2) digits + 2 bits.  By #4,
asize is at least f(bsize/2)+1 digits, so this in turn reduces to whether 1
digit is enough to hold 2 bits.  This is so since TyLong_SHIFT=15 >= 2.  If
asize == bsize, then we're asking whether bsize digits is enough to hold
c(bsize/2) digits + 2 bits, or equivalently (by #1) whether f(bsize/2) digits
is enough to hold 2 bits.  This is so if bsize >= 2, which holds because
bsize >= KARATSUBA_CUTOFF >= 2.

Note that since there's always enough room for (ah+al)*(bh+bl), and that's
clearly >= each of ah*bh and al*bl, there's always enough room to subtract
ah*bh and al*bl too.
*/

/* b has at least twice the digits of a, and a is big enough that Karatsuba
 * would pay off *if* the inputs had balanced sizes.  View b as a sequence
 * of slices, each with the same number of digits as a, and multiply the
 * slices by a, one at a time.  This gives k_mul balanced inputs to work with,
 * and is also cache-friendly (we compute one double-width slice of the result
 * at a time, then move on, never backtracking except for the helpful
 * single-width slice overlap between successive partial sums).
 */
static PyLongObject *
k_lopsided_mul(PyLongObject *a, PyLongObject *b)
{
    const Ty_ssize_t asize = _TyLong_DigitCount(a);
    Ty_ssize_t bsize = _TyLong_DigitCount(b);
    Ty_ssize_t nbdone;          /* # of b digits already multiplied */
    PyLongObject *ret;
    PyLongObject *bslice = NULL;

    assert(asize > KARATSUBA_CUTOFF);
    assert(2 * asize <= bsize);

    /* Allocate result space, and zero it out. */
    ret = long_alloc(asize + bsize);
    if (ret == NULL)
        return NULL;
    memset(ret->long_value.ob_digit, 0, _TyLong_DigitCount(ret) * sizeof(digit));

    /* Successive slices of b are copied into bslice. */
    bslice = long_alloc(asize);
    if (bslice == NULL)
        goto fail;

    nbdone = 0;
    while (bsize > 0) {
        PyLongObject *product;
        const Ty_ssize_t nbtouse = Ty_MIN(bsize, asize);

        /* Multiply the next slice of b by a. */
        memcpy(bslice->long_value.ob_digit, b->long_value.ob_digit + nbdone,
               nbtouse * sizeof(digit));
        assert(nbtouse >= 0);
        _TyLong_SetSignAndDigitCount(bslice, 1, nbtouse);
        product = k_mul(a, bslice);
        if (product == NULL)
            goto fail;

        /* Add into result. */
        (void)v_iadd(ret->long_value.ob_digit + nbdone, _TyLong_DigitCount(ret) - nbdone,
                     product->long_value.ob_digit, _TyLong_DigitCount(product));
        _Ty_DECREF_INT(product);

        bsize -= nbtouse;
        nbdone += nbtouse;
    }

    _Ty_DECREF_INT(bslice);
    return long_normalize(ret);

  fail:
    Ty_DECREF(ret);
    Ty_XDECREF(bslice);
    return NULL;
}


static PyLongObject*
long_mul(PyLongObject *a, PyLongObject *b)
{
    /* fast path for single-digit multiplication */
    if (_TyLong_BothAreCompact(a, b)) {
        stwodigits v = medium_value(a) * medium_value(b);
        return _TyLong_FromSTwoDigits(v);
    }

    PyLongObject *z = k_mul(a, b);
    /* Negate if exactly one of the inputs is negative. */
    if (!_TyLong_SameSign(a, b) && z) {
        _TyLong_Negate(&z);
    }
    return z;
}

TyObject *
_TyLong_Multiply(PyLongObject *a, PyLongObject *b)
{
    return (TyObject*)long_mul(a, b);
}

static TyObject *
long_mul_method(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    return (TyObject*)long_mul((PyLongObject*)a, (PyLongObject*)b);
}

/* Fast modulo division for single-digit longs. */
static TyObject *
fast_mod(PyLongObject *a, PyLongObject *b)
{
    sdigit left = a->long_value.ob_digit[0];
    sdigit right = b->long_value.ob_digit[0];
    sdigit mod;

    assert(_TyLong_DigitCount(a) == 1);
    assert(_TyLong_DigitCount(b) == 1);
    sdigit sign = _TyLong_CompactSign(b);
    if (_TyLong_SameSign(a, b)) {
        mod = left % right;
    }
    else {
        /* Either 'a' or 'b' is negative. */
        mod = right - 1 - (left - 1) % right;
    }

    return TyLong_FromLong(mod * sign);
}

/* Fast floor division for single-digit longs. */
static TyObject *
fast_floor_div(PyLongObject *a, PyLongObject *b)
{
    sdigit left = a->long_value.ob_digit[0];
    sdigit right = b->long_value.ob_digit[0];
    sdigit div;

    assert(_TyLong_DigitCount(a) == 1);
    assert(_TyLong_DigitCount(b) == 1);

    if (_TyLong_SameSign(a, b)) {
        div = left / right;
    }
    else {
        /* Either 'a' or 'b' is negative. */
        div = -1 - (left - 1) / right;
    }

    return TyLong_FromLong(div);
}

#ifdef WITH_PYLONG_MODULE
/* asymptotically faster divmod, using _pylong.py */
static int
pylong_int_divmod(PyLongObject *v, PyLongObject *w,
                  PyLongObject **pdiv, PyLongObject **pmod)
{
    TyObject *mod = TyImport_ImportModule("_pylong");
    if (mod == NULL) {
        return -1;
    }
    TyObject *result = PyObject_CallMethod(mod, "int_divmod", "OO", v, w);
    Ty_DECREF(mod);
    if (result == NULL) {
        return -1;
    }
    if (!TyTuple_Check(result)) {
        Ty_DECREF(result);
        TyErr_SetString(TyExc_ValueError,
                        "tuple is required from int_divmod()");
        return -1;
    }
    TyObject *q = TyTuple_GET_ITEM(result, 0);
    TyObject *r = TyTuple_GET_ITEM(result, 1);
    if (!TyLong_Check(q) || !TyLong_Check(r)) {
        Ty_DECREF(result);
        TyErr_SetString(TyExc_ValueError,
                        "tuple of int is required from int_divmod()");
        return -1;
    }
    if (pdiv != NULL) {
        *pdiv = (PyLongObject *)Ty_NewRef(q);
    }
    if (pmod != NULL) {
        *pmod = (PyLongObject *)Ty_NewRef(r);
    }
    Ty_DECREF(result);
    return 0;
}
#endif /* WITH_PYLONG_MODULE */

/* The / and % operators are now defined in terms of divmod().
   The expression a mod b has the value a - b*floor(a/b).
   The long_divrem function gives the remainder after division of
   |a| by |b|, with the sign of a.  This is also expressed
   as a - b*trunc(a/b), if trunc truncates towards zero.
   Some examples:
     a           b      a rem b         a mod b
     13          10      3               3
    -13          10     -3               7
     13         -10      3              -7
    -13         -10     -3              -3
   So, to get from rem to mod, we have to add b if a and b
   have different signs.  We then subtract one from the 'div'
   part of the outcome to keep the invariant intact. */

/* Compute
 *     *pdiv, *pmod = divmod(v, w)
 * NULL can be passed for pdiv or pmod, in which case that part of
 * the result is simply thrown away.  The caller owns a reference to
 * each of these it requests (does not pass NULL for).
 */
static int
l_divmod(PyLongObject *v, PyLongObject *w,
         PyLongObject **pdiv, PyLongObject **pmod)
{
    PyLongObject *div, *mod;

    if (_TyLong_DigitCount(v) == 1 && _TyLong_DigitCount(w) == 1) {
        /* Fast path for single-digit longs */
        div = NULL;
        if (pdiv != NULL) {
            div = (PyLongObject *)fast_floor_div(v, w);
            if (div == NULL) {
                return -1;
            }
        }
        if (pmod != NULL) {
            mod = (PyLongObject *)fast_mod(v, w);
            if (mod == NULL) {
                Ty_XDECREF(div);
                return -1;
            }
            *pmod = mod;
        }
        if (pdiv != NULL) {
            /* We only want to set `*pdiv` when `*pmod` is
               set successfully. */
            *pdiv = div;
        }
        return 0;
    }
#if WITH_PYLONG_MODULE
    Ty_ssize_t size_v = _TyLong_DigitCount(v); /* digits in numerator */
    Ty_ssize_t size_w = _TyLong_DigitCount(w); /* digits in denominator */
    if (size_w > 300 && (size_v - size_w) > 150) {
        /* Switch to _pylong.int_divmod().  If the quotient is small then
          "schoolbook" division is linear-time so don't use in that case.
          These limits are empirically determined and should be slightly
          conservative so that _pylong is used in cases it is likely
          to be faster. See Tools/scripts/divmod_threshold.py. */
        return pylong_int_divmod(v, w, pdiv, pmod);
    }
#endif
    if (long_divrem(v, w, &div, &mod) < 0)
        return -1;
    if ((_TyLong_IsNegative(mod) && _TyLong_IsPositive(w)) ||
        (_TyLong_IsPositive(mod) && _TyLong_IsNegative(w))) {
        PyLongObject *temp;
        temp = long_add(mod, w);
        Ty_SETREF(mod, temp);
        if (mod == NULL) {
            Ty_DECREF(div);
            return -1;
        }
        temp = long_sub(div, (PyLongObject *)_TyLong_GetOne());
        if (temp == NULL) {
            Ty_DECREF(mod);
            Ty_DECREF(div);
            return -1;
        }
        Ty_SETREF(div, temp);
    }
    if (pdiv != NULL)
        *pdiv = div;
    else
        Ty_DECREF(div);

    if (pmod != NULL)
        *pmod = mod;
    else
        Ty_DECREF(mod);

    return 0;
}

/* Compute
 *     *pmod = v % w
 * pmod cannot be NULL. The caller owns a reference to pmod.
 */
static int
l_mod(PyLongObject *v, PyLongObject *w, PyLongObject **pmod)
{
    PyLongObject *mod;

    assert(pmod);
    if (_TyLong_DigitCount(v) == 1 && _TyLong_DigitCount(w) == 1) {
        /* Fast path for single-digit longs */
        *pmod = (PyLongObject *)fast_mod(v, w);
        return -(*pmod == NULL);
    }
    if (long_rem(v, w, &mod) < 0)
        return -1;
    if ((_TyLong_IsNegative(mod) && _TyLong_IsPositive(w)) ||
        (_TyLong_IsPositive(mod) && _TyLong_IsNegative(w))) {
        PyLongObject *temp;
        temp = long_add(mod, w);
        Ty_SETREF(mod, temp);
        if (mod == NULL)
            return -1;
    }
    *pmod = mod;

    return 0;
}

static TyObject *
long_div(TyObject *a, TyObject *b)
{
    PyLongObject *div;

    CHECK_BINOP(a, b);

    if (_TyLong_DigitCount((PyLongObject*)a) == 1 && _TyLong_DigitCount((PyLongObject*)b) == 1) {
        return fast_floor_div((PyLongObject*)a, (PyLongObject*)b);
    }

    if (l_divmod((PyLongObject*)a, (PyLongObject*)b, &div, NULL) < 0)
        div = NULL;
    return (TyObject *)div;
}

/* PyLong/PyLong -> float, with correctly rounded result. */

#define MANT_DIG_DIGITS (DBL_MANT_DIG / TyLong_SHIFT)
#define MANT_DIG_BITS (DBL_MANT_DIG % TyLong_SHIFT)

static TyObject *
long_true_divide(TyObject *v, TyObject *w)
{
    PyLongObject *a, *b, *x;
    Ty_ssize_t a_size, b_size, shift, extra_bits, diff, x_size, x_bits;
    digit mask, low;
    int inexact, negate, a_is_small, b_is_small;
    double dx, result;

    CHECK_BINOP(v, w);
    a = (PyLongObject *)v;
    b = (PyLongObject *)w;

    /*
       Method in a nutshell:

         0. reduce to case a, b > 0; filter out obvious underflow/overflow
         1. choose a suitable integer 'shift'
         2. use integer arithmetic to compute x = floor(2**-shift*a/b)
         3. adjust x for correct rounding
         4. convert x to a double dx with the same value
         5. return ldexp(dx, shift).

       In more detail:

       0. For any a, a/0 raises ZeroDivisionError; for nonzero b, 0/b
       returns either 0.0 or -0.0, depending on the sign of b.  For a and
       b both nonzero, ignore signs of a and b, and add the sign back in
       at the end.  Now write a_bits and b_bits for the bit lengths of a
       and b respectively (that is, a_bits = 1 + floor(log_2(a)); likewise
       for b).  Then

          2**(a_bits - b_bits - 1) < a/b < 2**(a_bits - b_bits + 1).

       So if a_bits - b_bits > DBL_MAX_EXP then a/b > 2**DBL_MAX_EXP and
       so overflows.  Similarly, if a_bits - b_bits < DBL_MIN_EXP -
       DBL_MANT_DIG - 1 then a/b underflows to 0.  With these cases out of
       the way, we can assume that

          DBL_MIN_EXP - DBL_MANT_DIG - 1 <= a_bits - b_bits <= DBL_MAX_EXP.

       1. The integer 'shift' is chosen so that x has the right number of
       bits for a double, plus two or three extra bits that will be used
       in the rounding decisions.  Writing a_bits and b_bits for the
       number of significant bits in a and b respectively, a
       straightforward formula for shift is:

          shift = a_bits - b_bits - DBL_MANT_DIG - 2

       This is fine in the usual case, but if a/b is smaller than the
       smallest normal float then it can lead to double rounding on an
       IEEE 754 platform, giving incorrectly rounded results.  So we
       adjust the formula slightly.  The actual formula used is:

           shift = MAX(a_bits - b_bits, DBL_MIN_EXP) - DBL_MANT_DIG - 2

       2. The quantity x is computed by first shifting a (left -shift bits
       if shift <= 0, right shift bits if shift > 0) and then dividing by
       b.  For both the shift and the division, we keep track of whether
       the result is inexact, in a flag 'inexact'; this information is
       needed at the rounding stage.

       With the choice of shift above, together with our assumption that
       a_bits - b_bits >= DBL_MIN_EXP - DBL_MANT_DIG - 1, it follows
       that x >= 1.

       3. Now x * 2**shift <= a/b < (x+1) * 2**shift.  We want to replace
       this with an exactly representable float of the form

          round(x/2**extra_bits) * 2**(extra_bits+shift).

       For float representability, we need x/2**extra_bits <
       2**DBL_MANT_DIG and extra_bits + shift >= DBL_MIN_EXP -
       DBL_MANT_DIG.  This translates to the condition:

          extra_bits >= MAX(x_bits, DBL_MIN_EXP - shift) - DBL_MANT_DIG

       To round, we just modify the bottom digit of x in-place; this can
       end up giving a digit with value > PyLONG_MASK, but that's not a
       problem since digits can hold values up to 2*PyLONG_MASK+1.

       With the original choices for shift above, extra_bits will always
       be 2 or 3.  Then rounding under the round-half-to-even rule, we
       round up iff the most significant of the extra bits is 1, and
       either: (a) the computation of x in step 2 had an inexact result,
       or (b) at least one other of the extra bits is 1, or (c) the least
       significant bit of x (above those to be rounded) is 1.

       4. Conversion to a double is straightforward; all floating-point
       operations involved in the conversion are exact, so there's no
       danger of rounding errors.

       5. Use ldexp(x, shift) to compute x*2**shift, the final result.
       The result will always be exactly representable as a double, except
       in the case that it overflows.  To avoid dependence on the exact
       behaviour of ldexp on overflow, we check for overflow before
       applying ldexp.  The result of ldexp is adjusted for sign before
       returning.
    */

    /* Reduce to case where a and b are both positive. */
    a_size = _TyLong_DigitCount(a);
    b_size = _TyLong_DigitCount(b);
    negate = (_TyLong_IsNegative(a)) != (_TyLong_IsNegative(b));
    if (b_size == 0) {
        TyErr_SetString(TyExc_ZeroDivisionError,
                        "division by zero");
        goto error;
    }
    if (a_size == 0)
        goto underflow_or_zero;

    /* Fast path for a and b small (exactly representable in a double).
       Relies on floating-point division being correctly rounded; results
       may be subject to double rounding on x86 machines that operate with
       the x87 FPU set to 64-bit precision. */
    a_is_small = a_size <= MANT_DIG_DIGITS ||
        (a_size == MANT_DIG_DIGITS+1 &&
         a->long_value.ob_digit[MANT_DIG_DIGITS] >> MANT_DIG_BITS == 0);
    b_is_small = b_size <= MANT_DIG_DIGITS ||
        (b_size == MANT_DIG_DIGITS+1 &&
         b->long_value.ob_digit[MANT_DIG_DIGITS] >> MANT_DIG_BITS == 0);
    if (a_is_small && b_is_small) {
        double da, db;
        da = a->long_value.ob_digit[--a_size];
        while (a_size > 0)
            da = da * TyLong_BASE + a->long_value.ob_digit[--a_size];
        db = b->long_value.ob_digit[--b_size];
        while (b_size > 0)
            db = db * TyLong_BASE + b->long_value.ob_digit[--b_size];
        result = da / db;
        goto success;
    }

    /* Catch obvious cases of underflow and overflow */
    diff = a_size - b_size;
    if (diff > PY_SSIZE_T_MAX/TyLong_SHIFT - 1)
        /* Extreme overflow */
        goto overflow;
    else if (diff < 1 - PY_SSIZE_T_MAX/TyLong_SHIFT)
        /* Extreme underflow */
        goto underflow_or_zero;
    /* Next line is now safe from overflowing a Ty_ssize_t */
    diff = diff * TyLong_SHIFT + bit_length_digit(a->long_value.ob_digit[a_size - 1]) -
        bit_length_digit(b->long_value.ob_digit[b_size - 1]);
    /* Now diff = a_bits - b_bits. */
    if (diff > DBL_MAX_EXP)
        goto overflow;
    else if (diff < DBL_MIN_EXP - DBL_MANT_DIG - 1)
        goto underflow_or_zero;

    /* Choose value for shift; see comments for step 1 above. */
    shift = Ty_MAX(diff, DBL_MIN_EXP) - DBL_MANT_DIG - 2;

    inexact = 0;

    /* x = abs(a * 2**-shift) */
    if (shift <= 0) {
        Ty_ssize_t i, shift_digits = -shift / TyLong_SHIFT;
        digit rem;
        /* x = a << -shift */
        if (a_size >= PY_SSIZE_T_MAX - 1 - shift_digits) {
            /* In practice, it's probably impossible to end up
               here.  Both a and b would have to be enormous,
               using close to SIZE_T_MAX bytes of memory each. */
            TyErr_SetString(TyExc_OverflowError,
                            "intermediate overflow during division");
            goto error;
        }
        x = long_alloc(a_size + shift_digits + 1);
        if (x == NULL)
            goto error;
        for (i = 0; i < shift_digits; i++)
            x->long_value.ob_digit[i] = 0;
        rem = v_lshift(x->long_value.ob_digit + shift_digits, a->long_value.ob_digit,
                       a_size, -shift % TyLong_SHIFT);
        x->long_value.ob_digit[a_size + shift_digits] = rem;
    }
    else {
        Ty_ssize_t shift_digits = shift / TyLong_SHIFT;
        digit rem;
        /* x = a >> shift */
        assert(a_size >= shift_digits);
        x = long_alloc(a_size - shift_digits);
        if (x == NULL)
            goto error;
        rem = v_rshift(x->long_value.ob_digit, a->long_value.ob_digit + shift_digits,
                       a_size - shift_digits, shift % TyLong_SHIFT);
        /* set inexact if any of the bits shifted out is nonzero */
        if (rem)
            inexact = 1;
        while (!inexact && shift_digits > 0)
            if (a->long_value.ob_digit[--shift_digits])
                inexact = 1;
    }
    long_normalize(x);
    x_size = _TyLong_SignedDigitCount(x);

    /* x //= b. If the remainder is nonzero, set inexact.  We own the only
       reference to x, so it's safe to modify it in-place. */
    if (b_size == 1) {
        digit rem = inplace_divrem1(x->long_value.ob_digit, x->long_value.ob_digit, x_size,
                              b->long_value.ob_digit[0]);
        long_normalize(x);
        if (rem)
            inexact = 1;
    }
    else {
        PyLongObject *div, *rem;
        div = x_divrem(x, b, &rem);
        Ty_SETREF(x, div);
        if (x == NULL)
            goto error;
        if (!_TyLong_IsZero(rem))
            inexact = 1;
        Ty_DECREF(rem);
    }
    x_size = _TyLong_DigitCount(x);
    assert(x_size > 0); /* result of division is never zero */
    x_bits = (x_size-1)*TyLong_SHIFT+bit_length_digit(x->long_value.ob_digit[x_size-1]);

    /* The number of extra bits that have to be rounded away. */
    extra_bits = Ty_MAX(x_bits, DBL_MIN_EXP - shift) - DBL_MANT_DIG;
    assert(extra_bits == 2 || extra_bits == 3);

    /* Round by directly modifying the low digit of x. */
    mask = (digit)1 << (extra_bits - 1);
    low = x->long_value.ob_digit[0] | inexact;
    if ((low & mask) && (low & (3U*mask-1U)))
        low += mask;
    x->long_value.ob_digit[0] = low & ~(2U*mask-1U);

    /* Convert x to a double dx; the conversion is exact. */
    dx = x->long_value.ob_digit[--x_size];
    while (x_size > 0)
        dx = dx * TyLong_BASE + x->long_value.ob_digit[--x_size];
    Ty_DECREF(x);

    /* Check whether ldexp result will overflow a double. */
    if (shift + x_bits >= DBL_MAX_EXP &&
        (shift + x_bits > DBL_MAX_EXP || dx == ldexp(1.0, (int)x_bits)))
        goto overflow;
    result = ldexp(dx, (int)shift);

  success:
    return TyFloat_FromDouble(negate ? -result : result);

  underflow_or_zero:
    return TyFloat_FromDouble(negate ? -0.0 : 0.0);

  overflow:
    TyErr_SetString(TyExc_OverflowError,
                    "integer division result too large for a float");
  error:
    return NULL;
}

static TyObject *
long_mod(TyObject *a, TyObject *b)
{
    PyLongObject *mod;

    CHECK_BINOP(a, b);

    if (l_mod((PyLongObject*)a, (PyLongObject*)b, &mod) < 0)
        mod = NULL;
    return (TyObject *)mod;
}

static TyObject *
long_divmod(TyObject *a, TyObject *b)
{
    PyLongObject *div, *mod;
    TyObject *z;

    CHECK_BINOP(a, b);

    if (l_divmod((PyLongObject*)a, (PyLongObject*)b, &div, &mod) < 0) {
        return NULL;
    }
    z = TyTuple_New(2);
    if (z != NULL) {
        TyTuple_SET_ITEM(z, 0, (TyObject *) div);
        TyTuple_SET_ITEM(z, 1, (TyObject *) mod);
    }
    else {
        Ty_DECREF(div);
        Ty_DECREF(mod);
    }
    return z;
}


/* Compute an inverse to a modulo n, or raise ValueError if a is not
   invertible modulo n. Assumes n is positive. The inverse returned
   is whatever falls out of the extended Euclidean algorithm: it may
   be either positive or negative, but will be smaller than n in
   absolute value.

   Pure Python equivalent for long_invmod:

        def invmod(a, n):
            b, c = 1, 0
            while n:
                q, r = divmod(a, n)
                a, b, c, n = n, c, b - q*c, r

            # at this point a is the gcd of the original inputs
            if a == 1:
                return b
            raise ValueError("Not invertible")
*/

static PyLongObject *
long_invmod(PyLongObject *a, PyLongObject *n)
{
    /* Should only ever be called for positive n */
    assert(_TyLong_IsPositive(n));

    Ty_INCREF(a);
    PyLongObject *b = (PyLongObject *)Ty_NewRef(_TyLong_GetOne());
    PyLongObject *c = (PyLongObject *)Ty_NewRef(_TyLong_GetZero());
    Ty_INCREF(n);

    /* references now owned: a, b, c, n */
    while (!_TyLong_IsZero(n)) {
        PyLongObject *q, *r, *s, *t;

        if (l_divmod(a, n, &q, &r) == -1) {
            goto Error;
        }
        Ty_SETREF(a, n);
        n = r;
        t = (PyLongObject *)long_mul(q, c);
        Ty_DECREF(q);
        if (t == NULL) {
            goto Error;
        }
        s = long_sub(b, t);
        Ty_DECREF(t);
        if (s == NULL) {
            goto Error;
        }
        Ty_SETREF(b, c);
        c = s;
    }
    /* references now owned: a, b, c, n */

    Ty_DECREF(c);
    Ty_DECREF(n);
    if (long_compare(a, (PyLongObject *)_TyLong_GetOne())) {
        /* a != 1; we don't have an inverse. */
        Ty_DECREF(a);
        Ty_DECREF(b);
        TyErr_SetString(TyExc_ValueError,
                        "base is not invertible for the given modulus");
        return NULL;
    }
    else {
        /* a == 1; b gives an inverse modulo n */
        Ty_DECREF(a);
        return b;
    }

  Error:
    Ty_DECREF(a);
    Ty_DECREF(b);
    Ty_DECREF(c);
    Ty_DECREF(n);
    return NULL;
}


/* pow(v, w, x) */
static TyObject *
long_pow(TyObject *v, TyObject *w, TyObject *x)
{
    PyLongObject *a, *b, *c; /* a,b,c = v,w,x */
    int negativeOutput = 0;  /* if x<0 return negative output */

    PyLongObject *z = NULL;  /* accumulated result */
    Ty_ssize_t i, j;             /* counters */
    PyLongObject *temp = NULL;
    PyLongObject *a2 = NULL; /* may temporarily hold a**2 % c */

    /* k-ary values.  If the exponent is large enough, table is
     * precomputed so that table[i] == a**(2*i+1) % c for i in
     * range(EXP_TABLE_LEN).
     * Note: this is uninitialized stack trash: don't pay to set it to known
     * values unless it's needed. Instead ensure that num_table_entries is
     * set to the number of entries actually filled whenever a branch to the
     * Error or Done labels is possible.
     */
    PyLongObject *table[EXP_TABLE_LEN];
    Ty_ssize_t num_table_entries = 0;

    /* a, b, c = v, w, x */
    CHECK_BINOP(v, w);
    a = (PyLongObject*)Ty_NewRef(v);
    b = (PyLongObject*)Ty_NewRef(w);
    if (TyLong_Check(x)) {
        c = (PyLongObject *)Ty_NewRef(x);
    }
    else if (x == Ty_None)
        c = NULL;
    else {
        Ty_DECREF(a);
        Ty_DECREF(b);
        Py_RETURN_NOTIMPLEMENTED;
    }

    if (_TyLong_IsNegative(b) && c == NULL) {
        /* if exponent is negative and there's no modulus:
               return a float.  This works because we know
               that this calls float_pow() which converts its
               arguments to double. */
        Ty_DECREF(a);
        Ty_DECREF(b);
        return TyFloat_Type.tp_as_number->nb_power(v, w, x);
    }

    if (c) {
        /* if modulus == 0:
               raise ValueError() */
        if (_TyLong_IsZero(c)) {
            TyErr_SetString(TyExc_ValueError,
                            "pow() 3rd argument cannot be 0");
            goto Error;
        }

        /* if modulus < 0:
               negativeOutput = True
               modulus = -modulus */
        if (_TyLong_IsNegative(c)) {
            negativeOutput = 1;
            temp = (PyLongObject *)_TyLong_Copy(c);
            if (temp == NULL)
                goto Error;
            Ty_SETREF(c, temp);
            temp = NULL;
            _TyLong_Negate(&c);
            if (c == NULL)
                goto Error;
        }

        /* if modulus == 1:
               return 0 */
        if (_TyLong_IsNonNegativeCompact(c) && (c->long_value.ob_digit[0] == 1)) {
            z = (PyLongObject *)TyLong_FromLong(0L);
            goto Done;
        }

        /* if exponent is negative, negate the exponent and
           replace the base with a modular inverse */
        if (_TyLong_IsNegative(b)) {
            temp = (PyLongObject *)_TyLong_Copy(b);
            if (temp == NULL)
                goto Error;
            Ty_SETREF(b, temp);
            temp = NULL;
            _TyLong_Negate(&b);
            if (b == NULL)
                goto Error;

            temp = long_invmod(a, c);
            if (temp == NULL)
                goto Error;
            Ty_SETREF(a, temp);
            temp = NULL;
        }

        /* Reduce base by modulus in some cases:
           1. If base < 0.  Forcing the base non-negative makes things easier.
           2. If base is obviously larger than the modulus.  The "small
              exponent" case later can multiply directly by base repeatedly,
              while the "large exponent" case multiplies directly by base 31
              times.  It can be unboundedly faster to multiply by
              base % modulus instead.
           We could _always_ do this reduction, but l_mod() isn't cheap,
           so we only do it when it buys something. */
        if (_TyLong_IsNegative(a) || _TyLong_DigitCount(a) > _TyLong_DigitCount(c)) {
            if (l_mod(a, c, &temp) < 0)
                goto Error;
            Ty_SETREF(a, temp);
            temp = NULL;
        }
    }

    /* At this point a, b, and c are guaranteed non-negative UNLESS
       c is NULL, in which case a may be negative. */

    z = (PyLongObject *)TyLong_FromLong(1L);
    if (z == NULL)
        goto Error;

    /* Perform a modular reduction, X = X % c, but leave X alone if c
     * is NULL.
     */
#define REDUCE(X)                                       \
    do {                                                \
        if (c != NULL) {                                \
            if (l_mod(X, c, &temp) < 0)                 \
                goto Error;                             \
            Ty_XDECREF(X);                              \
            X = temp;                                   \
            temp = NULL;                                \
        }                                               \
    } while(0)

    /* Multiply two values, then reduce the result:
       result = X*Y % c.  If c is NULL, skip the mod. */
#define MULT(X, Y, result)                      \
    do {                                        \
        temp = (PyLongObject *)long_mul(X, Y);  \
        if (temp == NULL)                       \
            goto Error;                         \
        Ty_XDECREF(result);                     \
        result = temp;                          \
        temp = NULL;                            \
        REDUCE(result);                         \
    } while(0)

    i = _TyLong_SignedDigitCount(b);
    digit bi = i ? b->long_value.ob_digit[i-1] : 0;
    digit bit;
    if (i <= 1 && bi <= 3) {
        /* aim for minimal overhead */
        if (bi >= 2) {
            MULT(a, a, z);
            if (bi == 3) {
                MULT(z, a, z);
            }
        }
        else if (bi == 1) {
            /* Multiplying by 1 serves two purposes: if `a` is of an int
             * subclass, makes the result an int (e.g., pow(False, 1) returns
             * 0 instead of False), and potentially reduces `a` by the modulus.
             */
            MULT(a, z, z);
        }
        /* else bi is 0, and z==1 is correct */
    }
    else if (i <= HUGE_EXP_CUTOFF / TyLong_SHIFT ) {
        /* Left-to-right binary exponentiation (HAC Algorithm 14.79) */
        /* https://cacr.uwaterloo.ca/hac/about/chap14.pdf            */

        /* Find the first significant exponent bit. Search right to left
         * because we're primarily trying to cut overhead for small powers.
         */
        assert(bi);  /* else there is no significant bit */
        Ty_SETREF(z, (PyLongObject*)Ty_NewRef(a));
        for (bit = 2; ; bit <<= 1) {
            if (bit > bi) { /* found the first bit */
                assert((bi & bit) == 0);
                bit >>= 1;
                assert(bi & bit);
                break;
            }
        }
        for (--i, bit >>= 1;;) {
            for (; bit != 0; bit >>= 1) {
                MULT(z, z, z);
                if (bi & bit) {
                    MULT(z, a, z);
                }
            }
            if (--i < 0) {
                break;
            }
            bi = b->long_value.ob_digit[i];
            bit = (digit)1 << (TyLong_SHIFT-1);
        }
    }
    else {
        /* Left-to-right k-ary sliding window exponentiation
         * (Handbook of Applied Cryptography (HAC) Algorithm 14.85)
         */
        table[0] = (PyLongObject*)Ty_NewRef(a);
        num_table_entries = 1;
        MULT(a, a, a2);
        /* table[i] == a**(2*i + 1) % c */
        for (i = 1; i < EXP_TABLE_LEN; ++i) {
            table[i] = NULL; /* must set to known value for MULT */
            MULT(table[i-1], a2, table[i]);
            ++num_table_entries; /* incremented iff MULT succeeded */
        }
        Ty_CLEAR(a2);

        /* Repeatedly extract the next (no more than) EXP_WINDOW_SIZE bits
         * into `pending`, starting with the next 1 bit.  The current bit
         * length of `pending` is `blen`.
         */
        int pending = 0, blen = 0;
#define ABSORB_PENDING  do { \
            int ntz = 0; /* number of trailing zeroes in `pending` */ \
            assert(pending && blen); \
            assert(pending >> (blen - 1)); \
            assert(pending >> blen == 0); \
            while ((pending & 1) == 0) { \
                ++ntz; \
                pending >>= 1; \
            } \
            assert(ntz < blen); \
            blen -= ntz; \
            do { \
                MULT(z, z, z); \
            } while (--blen); \
            MULT(z, table[pending >> 1], z); \
            while (ntz-- > 0) \
                MULT(z, z, z); \
            assert(blen == 0); \
            pending = 0; \
        } while(0)

        for (i = _TyLong_SignedDigitCount(b) - 1; i >= 0; --i) {
            const digit bi = b->long_value.ob_digit[i];
            for (j = TyLong_SHIFT - 1; j >= 0; --j) {
                const int bit = (bi >> j) & 1;
                pending = (pending << 1) | bit;
                if (pending) {
                    ++blen;
                    if (blen == EXP_WINDOW_SIZE)
                        ABSORB_PENDING;
                }
                else /* absorb strings of 0 bits */
                    MULT(z, z, z);
            }
        }
        if (pending)
            ABSORB_PENDING;
    }

    if (negativeOutput && !_TyLong_IsZero(z)) {
        temp = long_sub(z, c);
        if (temp == NULL)
            goto Error;
        Ty_SETREF(z, temp);
        temp = NULL;
    }
    goto Done;

  Error:
    Ty_CLEAR(z);
    /* fall through */
  Done:
    for (i = 0; i < num_table_entries; ++i)
        Ty_DECREF(table[i]);
    Ty_DECREF(a);
    Ty_DECREF(b);
    Ty_XDECREF(c);
    Ty_XDECREF(a2);
    Ty_XDECREF(temp);
    return (TyObject *)z;
}

static TyObject *
long_invert(TyObject *self)
{
    PyLongObject *v = _TyLong_CAST(self);

    /* Implement ~x as -(x+1) */
    if (_TyLong_IsCompact(v))
        return (TyObject*)_TyLong_FromSTwoDigits(~medium_value(v));

    PyLongObject *x = long_add(v, (PyLongObject *)_TyLong_GetOne());
    if (x == NULL)
        return NULL;
    _TyLong_Negate(&x);
    /* No need for maybe_small_long here, since any small longs
       will have been caught in the _TyLong_IsCompact() fast path. */
    return (TyObject *)x;
}

static PyLongObject *
long_neg(PyLongObject *v)
{
    if (_TyLong_IsCompact(v)) {
        return _TyLong_FromSTwoDigits(-medium_value(v));
    }

    PyLongObject *z = (PyLongObject *)_TyLong_Copy(v);
    if (z != NULL) {
        _TyLong_FlipSign(z);
    }
    return z;
}

static TyObject *
long_neg_method(TyObject *v)
{
    return (TyObject*)long_neg(_TyLong_CAST(v));
}

static PyLongObject*
long_abs(PyLongObject *v)
{
    if (_TyLong_IsNegative(v))
        return long_neg(v);
    else
        return (PyLongObject*)long_long((TyObject *)v);
}

static TyObject *
long_abs_method(TyObject *v)
{
    return (TyObject*)long_abs(_TyLong_CAST(v));
}

static int
long_bool(TyObject *v)
{
    return !_TyLong_IsZero(_TyLong_CAST(v));
}

/* Inner function for both long_rshift and _TyLong_Rshift, shifting an
   integer right by TyLong_SHIFT*wordshift + remshift bits.
   wordshift should be nonnegative. */

static TyObject *
long_rshift1(PyLongObject *a, Ty_ssize_t wordshift, digit remshift)
{
    PyLongObject *z = NULL;
    Ty_ssize_t newsize, hishift, size_a;
    twodigits accum;
    int a_negative;

    /* Total number of bits shifted must be nonnegative. */
    assert(wordshift >= 0);
    assert(remshift < TyLong_SHIFT);

    /* Fast path for small a. */
    if (_TyLong_IsCompact(a)) {
        stwodigits m, x;
        digit shift;
        m = medium_value(a);
        shift = wordshift == 0 ? remshift : TyLong_SHIFT;
        x = m < 0 ? ~(~m >> shift) : m >> shift;
        return (TyObject*)_TyLong_FromSTwoDigits(x);
    }

    a_negative = _TyLong_IsNegative(a);
    size_a = _TyLong_DigitCount(a);

    if (a_negative) {
        /* For negative 'a', adjust so that 0 < remshift <= TyLong_SHIFT,
           while keeping TyLong_SHIFT*wordshift + remshift the same. This
           ensures that 'newsize' is computed correctly below. */
        if (remshift == 0) {
            if (wordshift == 0) {
                /* Can only happen if the original shift was 0. */
                return long_long((TyObject *)a);
            }
            remshift = TyLong_SHIFT;
            --wordshift;
        }
    }

    assert(wordshift >= 0);
    newsize = size_a - wordshift;
    if (newsize <= 0) {
        /* Shifting all the bits of 'a' out gives either -1 or 0. */
        return TyLong_FromLong(-a_negative);
    }
    z = long_alloc(newsize);
    if (z == NULL) {
        return NULL;
    }
    hishift = TyLong_SHIFT - remshift;

    accum = a->long_value.ob_digit[wordshift];
    if (a_negative) {
        /*
            For a positive integer a and nonnegative shift, we have:

                (-a) >> shift == -((a + 2**shift - 1) >> shift).

            In the addition `a + (2**shift - 1)`, the low `wordshift` digits of
            `2**shift - 1` all have value `TyLong_MASK`, so we get a carry out
            from the bottom `wordshift` digits when at least one of the least
            significant `wordshift` digits of `a` is nonzero. Digit `wordshift`
            of `2**shift - 1` has value `TyLong_MASK >> hishift`.
        */
        _TyLong_SetSignAndDigitCount(z, -1, newsize);

        digit sticky = 0;
        for (Ty_ssize_t j = 0; j < wordshift; j++) {
            sticky |= a->long_value.ob_digit[j];
        }
        accum += (TyLong_MASK >> hishift) + (digit)(sticky != 0);
    }

    accum >>= remshift;
    for (Ty_ssize_t i = 0, j = wordshift + 1; j < size_a; i++, j++) {
        accum += (twodigits)a->long_value.ob_digit[j] << hishift;
        z->long_value.ob_digit[i] = (digit)(accum & TyLong_MASK);
        accum >>= TyLong_SHIFT;
    }
    assert(accum <= TyLong_MASK);
    z->long_value.ob_digit[newsize - 1] = (digit)accum;

    z = maybe_small_long(long_normalize(z));
    return (TyObject *)z;
}

static TyObject *
long_rshift(TyObject *a, TyObject *b)
{
    int64_t shiftby;

    CHECK_BINOP(a, b);

    if (_TyLong_IsNegative((PyLongObject *)b)) {
        TyErr_SetString(TyExc_ValueError, "negative shift count");
        return NULL;
    }
    if (_TyLong_IsZero((PyLongObject *)a)) {
        return TyLong_FromLong(0);
    }
    if (TyLong_AsInt64(b, &shiftby) < 0) {
        if (!TyErr_ExceptionMatches(TyExc_OverflowError)) {
            return NULL;
        }
        TyErr_Clear();
        if (_TyLong_IsNegative((PyLongObject *)a)) {
            return TyLong_FromLong(-1);
        }
        else {
            return TyLong_FromLong(0);
        }
    }
    return _TyLong_Rshift(a, shiftby);
}

/* Return a >> shiftby. */
TyObject *
_TyLong_Rshift(TyObject *a, int64_t shiftby)
{
    Ty_ssize_t wordshift;
    digit remshift;

    assert(TyLong_Check(a));
    assert(shiftby >= 0);
    if (_TyLong_IsZero((PyLongObject *)a)) {
        return TyLong_FromLong(0);
    }
#if PY_SSIZE_T_MAX <= INT64_MAX / TyLong_SHIFT
    if (shiftby > (int64_t)PY_SSIZE_T_MAX * TyLong_SHIFT) {
        if (_TyLong_IsNegative((PyLongObject *)a)) {
            return TyLong_FromLong(-1);
        }
        else {
            return TyLong_FromLong(0);
        }
    }
#endif
    wordshift = (Ty_ssize_t)(shiftby / TyLong_SHIFT);
    remshift = (digit)(shiftby % TyLong_SHIFT);
    return long_rshift1((PyLongObject *)a, wordshift, remshift);
}

static TyObject *
long_lshift1(PyLongObject *a, Ty_ssize_t wordshift, digit remshift)
{
    PyLongObject *z = NULL;
    Ty_ssize_t oldsize, newsize, i, j;
    twodigits accum;

    if (wordshift == 0 && _TyLong_IsCompact(a)) {
        stwodigits m = medium_value(a);
        // bypass undefined shift operator behavior
        stwodigits x = m < 0 ? -(-m << remshift) : m << remshift;
        return (TyObject*)_TyLong_FromSTwoDigits(x);
    }

    oldsize = _TyLong_DigitCount(a);
    newsize = oldsize + wordshift;
    if (remshift)
        ++newsize;
    z = long_alloc(newsize);
    if (z == NULL)
        return NULL;
    if (_TyLong_IsNegative(a)) {
        assert(Ty_REFCNT(z) == 1);
        _TyLong_FlipSign(z);
    }
    for (i = 0; i < wordshift; i++)
        z->long_value.ob_digit[i] = 0;
    accum = 0;
    for (j = 0; j < oldsize; i++, j++) {
        accum |= (twodigits)a->long_value.ob_digit[j] << remshift;
        z->long_value.ob_digit[i] = (digit)(accum & TyLong_MASK);
        accum >>= TyLong_SHIFT;
    }
    if (remshift)
        z->long_value.ob_digit[newsize-1] = (digit)accum;
    else
        assert(!accum);
    z = long_normalize(z);
    return (TyObject *) maybe_small_long(z);
}


static TyObject *
long_lshift_method(TyObject *aa, TyObject *bb)
{
    CHECK_BINOP(aa, bb);
    PyLongObject *a = (PyLongObject*)aa;
    PyLongObject *b = (PyLongObject*)bb;

    if (_TyLong_IsNegative(b)) {
        TyErr_SetString(TyExc_ValueError, "negative shift count");
        return NULL;
    }
    if (_TyLong_IsZero(a)) {
        return TyLong_FromLong(0);
    }

    int64_t shiftby;
    if (TyLong_AsInt64(bb, &shiftby) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            TyErr_SetString(TyExc_OverflowError,
                            "too many digits in integer");
        }
        return NULL;
    }
    return long_lshift_int64(a, shiftby);
}

/* Return a << shiftby. */
static TyObject *
long_lshift_int64(PyLongObject *a, int64_t shiftby)
{
    assert(shiftby >= 0);

    if (_TyLong_IsZero(a)) {
        return TyLong_FromLong(0);
    }
#if PY_SSIZE_T_MAX <= INT64_MAX / TyLong_SHIFT
    if (shiftby > (int64_t)PY_SSIZE_T_MAX * TyLong_SHIFT) {
        TyErr_SetString(TyExc_OverflowError,
                        "too many digits in integer");
        return NULL;
    }
#endif
    Ty_ssize_t wordshift = (Ty_ssize_t)(shiftby / TyLong_SHIFT);
    digit remshift = (digit)(shiftby % TyLong_SHIFT);
    return long_lshift1(a, wordshift, remshift);
}

TyObject *
_TyLong_Lshift(TyObject *a, int64_t shiftby)
{
    return long_lshift_int64(_TyLong_CAST(a), shiftby);
}


/* Compute two's complement of digit vector a[0:m], writing result to
   z[0:m].  The digit vector a need not be normalized, but should not
   be entirely zero.  a and z may point to the same digit vector. */

static void
v_complement(digit *z, digit *a, Ty_ssize_t m)
{
    Ty_ssize_t i;
    digit carry = 1;
    for (i = 0; i < m; ++i) {
        carry += a[i] ^ TyLong_MASK;
        z[i] = carry & TyLong_MASK;
        carry >>= TyLong_SHIFT;
    }
    assert(carry == 0);
}

/* Bitwise and/xor/or operations */

static TyObject *
long_bitwise(PyLongObject *a,
             char op,  /* '&', '|', '^' */
             PyLongObject *b)
{
    int nega, negb, negz;
    Ty_ssize_t size_a, size_b, size_z, i;
    PyLongObject *z;

    /* Bitwise operations for negative numbers operate as though
       on a two's complement representation.  So convert arguments
       from sign-magnitude to two's complement, and convert the
       result back to sign-magnitude at the end. */

    /* If a is negative, replace it by its two's complement. */
    size_a = _TyLong_DigitCount(a);
    nega = _TyLong_IsNegative(a);
    if (nega) {
        z = long_alloc(size_a);
        if (z == NULL)
            return NULL;
        v_complement(z->long_value.ob_digit, a->long_value.ob_digit, size_a);
        a = z;
    }
    else
        /* Keep reference count consistent. */
        Ty_INCREF(a);

    /* Same for b. */
    size_b = _TyLong_DigitCount(b);
    negb = _TyLong_IsNegative(b);
    if (negb) {
        z = long_alloc(size_b);
        if (z == NULL) {
            Ty_DECREF(a);
            return NULL;
        }
        v_complement(z->long_value.ob_digit, b->long_value.ob_digit, size_b);
        b = z;
    }
    else
        Ty_INCREF(b);

    /* Swap a and b if necessary to ensure size_a >= size_b. */
    if (size_a < size_b) {
        z = a; a = b; b = z;
        size_z = size_a; size_a = size_b; size_b = size_z;
        negz = nega; nega = negb; negb = negz;
    }

    /* JRH: The original logic here was to allocate the result value (z)
       as the longer of the two operands.  However, there are some cases
       where the result is guaranteed to be shorter than that: AND of two
       positives, OR of two negatives: use the shorter number.  AND with
       mixed signs: use the positive number.  OR with mixed signs: use the
       negative number.
    */
    switch (op) {
    case '^':
        negz = nega ^ negb;
        size_z = size_a;
        break;
    case '&':
        negz = nega & negb;
        size_z = negb ? size_a : size_b;
        break;
    case '|':
        negz = nega | negb;
        size_z = negb ? size_b : size_a;
        break;
    default:
        Ty_UNREACHABLE();
    }

    /* We allow an extra digit if z is negative, to make sure that
       the final two's complement of z doesn't overflow. */
    z = long_alloc(size_z + negz);
    if (z == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }

    /* Compute digits for overlap of a and b. */
    switch(op) {
    case '&':
        for (i = 0; i < size_b; ++i)
            z->long_value.ob_digit[i] = a->long_value.ob_digit[i] & b->long_value.ob_digit[i];
        break;
    case '|':
        for (i = 0; i < size_b; ++i)
            z->long_value.ob_digit[i] = a->long_value.ob_digit[i] | b->long_value.ob_digit[i];
        break;
    case '^':
        for (i = 0; i < size_b; ++i)
            z->long_value.ob_digit[i] = a->long_value.ob_digit[i] ^ b->long_value.ob_digit[i];
        break;
    default:
        Ty_UNREACHABLE();
    }

    /* Copy any remaining digits of a, inverting if necessary. */
    if (op == '^' && negb)
        for (; i < size_z; ++i)
            z->long_value.ob_digit[i] = a->long_value.ob_digit[i] ^ TyLong_MASK;
    else if (i < size_z)
        memcpy(&z->long_value.ob_digit[i], &a->long_value.ob_digit[i],
               (size_z-i)*sizeof(digit));

    /* Complement result if negative. */
    if (negz) {
        _TyLong_FlipSign(z);
        z->long_value.ob_digit[size_z] = TyLong_MASK;
        v_complement(z->long_value.ob_digit, z->long_value.ob_digit, size_z+1);
    }

    Ty_DECREF(a);
    Ty_DECREF(b);
    return (TyObject *)maybe_small_long(long_normalize(z));
}

static TyObject *
long_and(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    PyLongObject *x = (PyLongObject*)a;
    PyLongObject *y = (PyLongObject*)b;
    if (_TyLong_IsCompact(x) && _TyLong_IsCompact(y)) {
        return (TyObject*)_TyLong_FromSTwoDigits(medium_value(x) & medium_value(y));
    }
    return long_bitwise(x, '&', y);
}

static TyObject *
long_xor(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    PyLongObject *x = (PyLongObject*)a;
    PyLongObject *y = (PyLongObject*)b;
    if (_TyLong_IsCompact(x) && _TyLong_IsCompact(y)) {
        return (TyObject*)_TyLong_FromSTwoDigits(medium_value(x) ^ medium_value(y));
    }
    return long_bitwise(x, '^', y);
}

static TyObject *
long_or(TyObject *a, TyObject *b)
{
    CHECK_BINOP(a, b);
    PyLongObject *x = (PyLongObject*)a;
    PyLongObject *y = (PyLongObject*)b;
    if (_TyLong_IsCompact(x) && _TyLong_IsCompact(y)) {
        return (TyObject*)_TyLong_FromSTwoDigits(medium_value(x) | medium_value(y));
    }
    return long_bitwise(x, '|', y);
}

static TyObject *
long_long(TyObject *v)
{
    if (TyLong_CheckExact(v)) {
        return Ty_NewRef(v);
    }
    else {
        return _TyLong_Copy((PyLongObject *)v);
    }
}

TyObject *
_TyLong_GCD(TyObject *aarg, TyObject *barg)
{
    PyLongObject *a, *b, *c = NULL, *d = NULL, *r;
    stwodigits x, y, q, s, t, c_carry, d_carry;
    stwodigits A, B, C, D, T;
    int nbits, k;
    digit *a_digit, *b_digit, *c_digit, *d_digit, *a_end, *b_end;

    a = (PyLongObject *)aarg;
    b = (PyLongObject *)barg;
    if (_TyLong_DigitCount(a) <= 2 && _TyLong_DigitCount(b) <= 2) {
        Ty_INCREF(a);
        Ty_INCREF(b);
        goto simple;
    }

    /* Initial reduction: make sure that 0 <= b <= a. */
    a = long_abs(a);
    if (a == NULL)
        return NULL;
    b = long_abs(b);
    if (b == NULL) {
        Ty_DECREF(a);
        return NULL;
    }
    if (long_compare(a, b) < 0) {
        r = a;
        a = b;
        b = r;
    }
    /* We now own references to a and b */

    Ty_ssize_t size_a, size_b, alloc_a, alloc_b;
    alloc_a = _TyLong_DigitCount(a);
    alloc_b = _TyLong_DigitCount(b);
    /* reduce until a fits into 2 digits */
    while ((size_a = _TyLong_DigitCount(a)) > 2) {
        nbits = bit_length_digit(a->long_value.ob_digit[size_a-1]);
        /* extract top 2*TyLong_SHIFT bits of a into x, along with
           corresponding bits of b into y */
        size_b = _TyLong_DigitCount(b);
        assert(size_b <= size_a);
        if (size_b == 0) {
            if (size_a < alloc_a) {
                r = (PyLongObject *)_TyLong_Copy(a);
                Ty_DECREF(a);
            }
            else
                r = a;
            Ty_DECREF(b);
            Ty_XDECREF(c);
            Ty_XDECREF(d);
            return (TyObject *)r;
        }
        x = (((twodigits)a->long_value.ob_digit[size_a-1] << (2*TyLong_SHIFT-nbits)) |
             ((twodigits)a->long_value.ob_digit[size_a-2] << (TyLong_SHIFT-nbits)) |
             (a->long_value.ob_digit[size_a-3] >> nbits));

        y = ((size_b >= size_a - 2 ? b->long_value.ob_digit[size_a-3] >> nbits : 0) |
             (size_b >= size_a - 1 ? (twodigits)b->long_value.ob_digit[size_a-2] << (TyLong_SHIFT-nbits) : 0) |
             (size_b >= size_a ? (twodigits)b->long_value.ob_digit[size_a-1] << (2*TyLong_SHIFT-nbits) : 0));

        /* inner loop of Lehmer's algorithm; A, B, C, D never grow
           larger than TyLong_MASK during the algorithm. */
        A = 1; B = 0; C = 0; D = 1;
        for (k=0;; k++) {
            if (y-C == 0)
                break;
            q = (x+(A-1))/(y-C);
            s = B+q*D;
            t = x-q*y;
            if (s > t)
                break;
            x = y; y = t;
            t = A+q*C; A = D; B = C; C = s; D = t;
        }

        if (k == 0) {
            /* no progress; do a Euclidean step */
            if (l_mod(a, b, &r) < 0)
                goto error;
            Ty_SETREF(a, b);
            b = r;
            alloc_a = alloc_b;
            alloc_b = _TyLong_DigitCount(b);
            continue;
        }

        /*
          a, b = A*b-B*a, D*a-C*b if k is odd
          a, b = A*a-B*b, D*b-C*a if k is even
        */
        if (k&1) {
            T = -A; A = -B; B = T;
            T = -C; C = -D; D = T;
        }
        if (c != NULL) {
            assert(size_a >= 0);
            _TyLong_SetSignAndDigitCount(c, 1, size_a);
        }
        else if (Ty_REFCNT(a) == 1) {
            c = (PyLongObject*)Ty_NewRef(a);
        }
        else {
            alloc_a = size_a;
            c = long_alloc(size_a);
            if (c == NULL)
                goto error;
        }

        if (d != NULL) {
            assert(size_a >= 0);
            _TyLong_SetSignAndDigitCount(d, 1, size_a);
        }
        else if (Ty_REFCNT(b) == 1 && size_a <= alloc_b) {
            d = (PyLongObject*)Ty_NewRef(b);
            assert(size_a >= 0);
            _TyLong_SetSignAndDigitCount(d, 1, size_a);
        }
        else {
            alloc_b = size_a;
            d = long_alloc(size_a);
            if (d == NULL)
                goto error;
        }
        a_end = a->long_value.ob_digit + size_a;
        b_end = b->long_value.ob_digit + size_b;

        /* compute new a and new b in parallel */
        a_digit = a->long_value.ob_digit;
        b_digit = b->long_value.ob_digit;
        c_digit = c->long_value.ob_digit;
        d_digit = d->long_value.ob_digit;
        c_carry = 0;
        d_carry = 0;
        while (b_digit < b_end) {
            c_carry += (A * *a_digit) - (B * *b_digit);
            d_carry += (D * *b_digit++) - (C * *a_digit++);
            *c_digit++ = (digit)(c_carry & TyLong_MASK);
            *d_digit++ = (digit)(d_carry & TyLong_MASK);
            c_carry >>= TyLong_SHIFT;
            d_carry >>= TyLong_SHIFT;
        }
        while (a_digit < a_end) {
            c_carry += A * *a_digit;
            d_carry -= C * *a_digit++;
            *c_digit++ = (digit)(c_carry & TyLong_MASK);
            *d_digit++ = (digit)(d_carry & TyLong_MASK);
            c_carry >>= TyLong_SHIFT;
            d_carry >>= TyLong_SHIFT;
        }
        assert(c_carry == 0);
        assert(d_carry == 0);

        Ty_INCREF(c);
        Ty_INCREF(d);
        Ty_DECREF(a);
        Ty_DECREF(b);
        a = long_normalize(c);
        b = long_normalize(d);
    }
    Ty_XDECREF(c);
    Ty_XDECREF(d);

simple:
    assert(Ty_REFCNT(a) > 0);
    assert(Ty_REFCNT(b) > 0);
/* Issue #24999: use two shifts instead of ">> 2*TyLong_SHIFT" to avoid
   undefined behaviour when LONG_MAX type is smaller than 60 bits */
#if LONG_MAX >> TyLong_SHIFT >> TyLong_SHIFT
    /* a fits into a long, so b must too */
    x = TyLong_AsLong((TyObject *)a);
    y = TyLong_AsLong((TyObject *)b);
#elif LLONG_MAX >> TyLong_SHIFT >> TyLong_SHIFT
    x = TyLong_AsLongLong((TyObject *)a);
    y = TyLong_AsLongLong((TyObject *)b);
#else
# error "_TyLong_GCD"
#endif
    x = Ty_ABS(x);
    y = Ty_ABS(y);
    Ty_DECREF(a);
    Ty_DECREF(b);

    /* usual Euclidean algorithm for longs */
    while (y != 0) {
        t = y;
        y = x % y;
        x = t;
    }
#if LONG_MAX >> TyLong_SHIFT >> TyLong_SHIFT
    return TyLong_FromLong(x);
#elif LLONG_MAX >> TyLong_SHIFT >> TyLong_SHIFT
    return TyLong_FromLongLong(x);
#else
# error "_TyLong_GCD"
#endif

error:
    Ty_DECREF(a);
    Ty_DECREF(b);
    Ty_XDECREF(c);
    Ty_XDECREF(d);
    return NULL;
}

static TyObject *
long_float(TyObject *v)
{
    double result;
    result = TyLong_AsDouble(v);
    if (result == -1.0 && TyErr_Occurred())
        return NULL;
    return TyFloat_FromDouble(result);
}

static TyObject *
long_subtype_new(TyTypeObject *type, TyObject *x, TyObject *obase);

/*[clinic input]
@classmethod
int.__new__ as long_new
    x: object(c_default="NULL") = 0
    /
    base as obase: object(c_default="NULL") = 10
[clinic start generated code]*/

static TyObject *
long_new_impl(TyTypeObject *type, TyObject *x, TyObject *obase)
/*[clinic end generated code: output=e47cfe777ab0f24c input=81c98f418af9eb6f]*/
{
    Ty_ssize_t base;

    if (type != &TyLong_Type)
        return long_subtype_new(type, x, obase); /* Wimp out */
    if (x == NULL) {
        if (obase != NULL) {
            TyErr_SetString(TyExc_TypeError,
                            "int() missing string argument");
            return NULL;
        }
        return TyLong_FromLong(0L);
    }
    /* default base and limit, forward to standard implementation */
    if (obase == NULL)
        return PyNumber_Long(x);

    base = PyNumber_AsSsize_t(obase, NULL);
    if (base == -1 && TyErr_Occurred())
        return NULL;
    if ((base != 0 && base < 2) || base > 36) {
        TyErr_SetString(TyExc_ValueError,
                        "int() base must be >= 2 and <= 36, or 0");
        return NULL;
    }

    if (TyUnicode_Check(x))
        return TyLong_FromUnicodeObject(x, (int)base);
    else if (TyByteArray_Check(x) || TyBytes_Check(x)) {
        const char *string;
        if (TyByteArray_Check(x))
            string = TyByteArray_AS_STRING(x);
        else
            string = TyBytes_AS_STRING(x);
        return _TyLong_FromBytes(string, Ty_SIZE(x), (int)base);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "int() can't convert non-string with explicit base");
        return NULL;
    }
}

/* Wimpy, slow approach to tp_new calls for subtypes of int:
   first create a regular int from whatever arguments we got,
   then allocate a subtype instance and initialize it from
   the regular int.  The regular int is then thrown away.
*/
static TyObject *
long_subtype_new(TyTypeObject *type, TyObject *x, TyObject *obase)
{
    PyLongObject *tmp, *newobj;
    Ty_ssize_t i, n;

    assert(TyType_IsSubtype(type, &TyLong_Type));
    tmp = (PyLongObject *)long_new_impl(&TyLong_Type, x, obase);
    if (tmp == NULL)
        return NULL;
    assert(TyLong_Check(tmp));
    n = _TyLong_DigitCount(tmp);
    /* Fast operations for single digit integers (including zero)
     * assume that there is always at least one digit present. */
    if (n == 0) {
        n = 1;
    }
    newobj = (PyLongObject *)type->tp_alloc(type, n);
    if (newobj == NULL) {
        Ty_DECREF(tmp);
        return NULL;
    }
    assert(TyLong_Check(newobj));
    newobj->long_value.lv_tag = tmp->long_value.lv_tag & ~IMMORTALITY_BIT_MASK;
    for (i = 0; i < n; i++) {
        newobj->long_value.ob_digit[i] = tmp->long_value.ob_digit[i];
    }
    Ty_DECREF(tmp);
    return (TyObject *)newobj;
}

/*[clinic input]
int.__getnewargs__
[clinic start generated code]*/

static TyObject *
int___getnewargs___impl(TyObject *self)
/*[clinic end generated code: output=839a49de3f00b61b input=5904770ab1fb8c75]*/
{
    return Ty_BuildValue("(N)", _TyLong_Copy((PyLongObject *)self));
}

static TyObject *
long_get0(TyObject *Py_UNUSED(self), void *Py_UNUSED(context))
{
    return TyLong_FromLong(0L);
}

static TyObject *
long_get1(TyObject *Py_UNUSED(self), void *Py_UNUSED(ignored))
{
    return TyLong_FromLong(1L);
}

/*[clinic input]
int.__format__

    format_spec: unicode
    /

Convert to a string according to format_spec.
[clinic start generated code]*/

static TyObject *
int___format___impl(TyObject *self, TyObject *format_spec)
/*[clinic end generated code: output=b4929dee9ae18689 input=d5e1254a47e8d1dc]*/
{
    _PyUnicodeWriter writer;
    int ret;

    _PyUnicodeWriter_Init(&writer);
    ret = _TyLong_FormatAdvancedWriter(
        &writer,
        self,
        format_spec, 0, TyUnicode_GET_LENGTH(format_spec));
    if (ret == -1) {
        _PyUnicodeWriter_Dealloc(&writer);
        return NULL;
    }
    return _PyUnicodeWriter_Finish(&writer);
}

/* Return a pair (q, r) such that a = b * q + r, and
   abs(r) <= abs(b)/2, with equality possible only if q is even.
   In other words, q == a / b, rounded to the nearest integer using
   round-half-to-even. */

TyObject *
_TyLong_DivmodNear(TyObject *a, TyObject *b)
{
    PyLongObject *quo = NULL, *rem = NULL;
    TyObject *twice_rem, *result, *temp;
    int quo_is_odd, quo_is_neg;
    Ty_ssize_t cmp;

    /* Equivalent Python code:

       def divmod_near(a, b):
           q, r = divmod(a, b)
           # round up if either r / b > 0.5, or r / b == 0.5 and q is odd.
           # The expression r / b > 0.5 is equivalent to 2 * r > b if b is
           # positive, 2 * r < b if b negative.
           greater_than_half = 2*r > b if b > 0 else 2*r < b
           exactly_half = 2*r == b
           if greater_than_half or exactly_half and q % 2 == 1:
               q += 1
               r -= b
           return q, r

    */
    if (!TyLong_Check(a) || !TyLong_Check(b)) {
        TyErr_SetString(TyExc_TypeError,
                        "non-integer arguments in division");
        return NULL;
    }

    /* Do a and b have different signs?  If so, quotient is negative. */
    quo_is_neg = (_TyLong_IsNegative((PyLongObject *)a)) != (_TyLong_IsNegative((PyLongObject *)b));

    if (long_divrem((PyLongObject*)a, (PyLongObject*)b, &quo, &rem) < 0)
        goto error;

    /* compare twice the remainder with the divisor, to see
       if we need to adjust the quotient and remainder */
    twice_rem = long_lshift_int64(rem, 1);
    if (twice_rem == NULL)
        goto error;
    if (quo_is_neg) {
        temp = (TyObject*)long_neg((PyLongObject*)twice_rem);
        Ty_SETREF(twice_rem, temp);
        if (twice_rem == NULL)
            goto error;
    }
    cmp = long_compare((PyLongObject *)twice_rem, (PyLongObject *)b);
    Ty_DECREF(twice_rem);

    quo_is_odd = (quo->long_value.ob_digit[0] & 1) != 0;
    if ((_TyLong_IsNegative((PyLongObject *)b) ? cmp < 0 : cmp > 0) || (cmp == 0 && quo_is_odd)) {
        /* fix up quotient */
        TyObject *one = _TyLong_GetOne();  // borrowed reference
        if (quo_is_neg)
            temp = (TyObject*)long_sub(quo, (PyLongObject *)one);
        else
            temp = (TyObject*)long_add(quo, (PyLongObject *)one);
        Ty_SETREF(quo, (PyLongObject *)temp);
        if (quo == NULL)
            goto error;
        /* and remainder */
        if (quo_is_neg)
            temp = (TyObject*)long_add(rem, (PyLongObject *)b);
        else
            temp = (TyObject*)long_sub(rem, (PyLongObject *)b);
        Ty_SETREF(rem, (PyLongObject *)temp);
        if (rem == NULL)
            goto error;
    }

    result = TyTuple_New(2);
    if (result == NULL)
        goto error;

    /* TyTuple_SET_ITEM steals references */
    TyTuple_SET_ITEM(result, 0, (TyObject *)quo);
    TyTuple_SET_ITEM(result, 1, (TyObject *)rem);
    return result;

  error:
    Ty_XDECREF(quo);
    Ty_XDECREF(rem);
    return NULL;
}

/*[clinic input]
int.__round__

    ndigits as o_ndigits: object = None
    /

Rounding an Integral returns itself.

Rounding with an ndigits argument also returns an integer.
[clinic start generated code]*/

static TyObject *
int___round___impl(TyObject *self, TyObject *o_ndigits)
/*[clinic end generated code: output=954fda6b18875998 input=30c2aec788263144]*/
{
    /* To round an integer m to the nearest 10**n (n positive), we make use of
     * the divmod_near operation, defined by:
     *
     *   divmod_near(a, b) = (q, r)
     *
     * where q is the nearest integer to the quotient a / b (the
     * nearest even integer in the case of a tie) and r == a - q * b.
     * Hence q * b = a - r is the nearest multiple of b to a,
     * preferring even multiples in the case of a tie.
     *
     * So the nearest multiple of 10**n to m is:
     *
     *   m - divmod_near(m, 10**n)[1].
     */
    if (o_ndigits == Ty_None)
        return long_long(self);

    TyObject *ndigits = _PyNumber_Index(o_ndigits);
    if (ndigits == NULL)
        return NULL;

    /* if ndigits >= 0 then no rounding is necessary; return self unchanged */
    if (!_TyLong_IsNegative((PyLongObject *)ndigits)) {
        Ty_DECREF(ndigits);
        return long_long(self);
    }

    /* result = self - divmod_near(self, 10 ** -ndigits)[1] */
    TyObject *temp = (TyObject*)long_neg((PyLongObject*)ndigits);
    Ty_SETREF(ndigits, temp);
    if (ndigits == NULL)
        return NULL;

    TyObject *result = TyLong_FromLong(10);
    if (result == NULL) {
        Ty_DECREF(ndigits);
        return NULL;
    }

    temp = long_pow(result, ndigits, Ty_None);
    Ty_DECREF(ndigits);
    Ty_SETREF(result, temp);
    if (result == NULL)
        return NULL;

    temp = _TyLong_DivmodNear(self, result);
    Ty_SETREF(result, temp);
    if (result == NULL)
        return NULL;

    temp = (TyObject*)long_sub((PyLongObject*)self,
                               (PyLongObject*)TyTuple_GET_ITEM(result, 1));
    Ty_SETREF(result, temp);

    return result;
}

/*[clinic input]
int.__sizeof__ -> Ty_ssize_t

Returns size in memory, in bytes.
[clinic start generated code]*/

static Ty_ssize_t
int___sizeof___impl(TyObject *self)
/*[clinic end generated code: output=3303f008eaa6a0a5 input=9b51620c76fc4507]*/
{
    /* using Ty_MAX(..., 1) because we always allocate space for at least
       one digit, even though the integer zero has a digit count of 0 */
    Ty_ssize_t ndigits = Ty_MAX(_TyLong_DigitCount((PyLongObject *)self), 1);
    return Ty_TYPE(self)->tp_basicsize + Ty_TYPE(self)->tp_itemsize * ndigits;
}

/*[clinic input]
int.bit_length

Number of bits necessary to represent self in binary.

>>> bin(37)
'0b100101'
>>> (37).bit_length()
6
[clinic start generated code]*/

static TyObject *
int_bit_length_impl(TyObject *self)
/*[clinic end generated code: output=fc1977c9353d6a59 input=e4eb7a587e849a32]*/
{
    int64_t nbits = _TyLong_NumBits(self);
    assert(nbits >= 0);
    assert(!TyErr_Occurred());
    return TyLong_FromInt64(nbits);
}

static int
popcount_digit(digit d)
{
    // digit can be larger than uint32_t, but only TyLong_SHIFT bits
    // of it will be ever used.
    static_assert(TyLong_SHIFT <= 32, "digit is larger than uint32_t");
    return _Ty_popcount32((uint32_t)d);
}

/*[clinic input]
int.bit_count

Number of ones in the binary representation of the absolute value of self.

Also known as the population count.

>>> bin(13)
'0b1101'
>>> (13).bit_count()
3
[clinic start generated code]*/

static TyObject *
int_bit_count_impl(TyObject *self)
/*[clinic end generated code: output=2e571970daf1e5c3 input=7e0adef8e8ccdf2e]*/
{
    assert(self != NULL);
    assert(TyLong_Check(self));

    PyLongObject *z = (PyLongObject *)self;
    Ty_ssize_t ndigits = _TyLong_DigitCount(z);
    int64_t bit_count = 0;

    for (Ty_ssize_t i = 0; i < ndigits; i++) {
        bit_count += popcount_digit(z->long_value.ob_digit[i]);
    }

    return TyLong_FromInt64(bit_count);
}

/*[clinic input]
int.as_integer_ratio

Return a pair of integers, whose ratio is equal to the original int.

The ratio is in lowest terms and has a positive denominator.

>>> (10).as_integer_ratio()
(10, 1)
>>> (-10).as_integer_ratio()
(-10, 1)
>>> (0).as_integer_ratio()
(0, 1)
[clinic start generated code]*/

static TyObject *
int_as_integer_ratio_impl(TyObject *self)
/*[clinic end generated code: output=e60803ae1cc8621a input=384ff1766634bec2]*/
{
    TyObject *ratio_tuple;
    TyObject *numerator = long_long(self);
    if (numerator == NULL) {
        return NULL;
    }
    ratio_tuple = TyTuple_Pack(2, numerator, _TyLong_GetOne());
    Ty_DECREF(numerator);
    return ratio_tuple;
}

/*[clinic input]
int.to_bytes

    length: Ty_ssize_t = 1
        Length of bytes object to use.  An OverflowError is raised if the
        integer is not representable with the given number of bytes.  Default
        is length 1.
    byteorder: unicode(c_default="NULL") = "big"
        The byte order used to represent the integer.  If byteorder is 'big',
        the most significant byte is at the beginning of the byte array.  If
        byteorder is 'little', the most significant byte is at the end of the
        byte array.  To request the native byte order of the host system, use
        sys.byteorder as the byte order value.  Default is to use 'big'.
    *
    signed as is_signed: bool = False
        Determines whether two's complement is used to represent the integer.
        If signed is False and a negative integer is given, an OverflowError
        is raised.

Return an array of bytes representing an integer.
[clinic start generated code]*/

static TyObject *
int_to_bytes_impl(TyObject *self, Ty_ssize_t length, TyObject *byteorder,
                  int is_signed)
/*[clinic end generated code: output=89c801df114050a3 input=a0103d0e9ad85c2b]*/
{
    int little_endian;
    TyObject *bytes;

    if (byteorder == NULL)
        little_endian = 0;
    else if (_TyUnicode_Equal(byteorder, &_Ty_ID(little)))
        little_endian = 1;
    else if (_TyUnicode_Equal(byteorder, &_Ty_ID(big)))
        little_endian = 0;
    else {
        TyErr_SetString(TyExc_ValueError,
            "byteorder must be either 'little' or 'big'");
        return NULL;
    }

    if (length < 0) {
        TyErr_SetString(TyExc_ValueError,
                        "length argument must be non-negative");
        return NULL;
    }

    bytes = TyBytes_FromStringAndSize(NULL, length);
    if (bytes == NULL)
        return NULL;

    if (_TyLong_AsByteArray((PyLongObject *)self,
                            (unsigned char *)TyBytes_AS_STRING(bytes),
                            length, little_endian, is_signed, 1) < 0) {
        Ty_DECREF(bytes);
        return NULL;
    }

    return bytes;
}

/*[clinic input]
@classmethod
int.from_bytes

    bytes as bytes_obj: object
        Holds the array of bytes to convert.  The argument must either
        support the buffer protocol or be an iterable object producing bytes.
        Bytes and bytearray are examples of built-in objects that support the
        buffer protocol.
    byteorder: unicode(c_default="NULL") = "big"
        The byte order used to represent the integer.  If byteorder is 'big',
        the most significant byte is at the beginning of the byte array.  If
        byteorder is 'little', the most significant byte is at the end of the
        byte array.  To request the native byte order of the host system, use
        sys.byteorder as the byte order value.  Default is to use 'big'.
    *
    signed as is_signed: bool = False
        Indicates whether two's complement is used to represent the integer.

Return the integer represented by the given array of bytes.
[clinic start generated code]*/

static TyObject *
int_from_bytes_impl(TyTypeObject *type, TyObject *bytes_obj,
                    TyObject *byteorder, int is_signed)
/*[clinic end generated code: output=efc5d68e31f9314f input=2ff527997fe7b0c5]*/
{
    int little_endian;
    TyObject *long_obj, *bytes;

    if (byteorder == NULL)
        little_endian = 0;
    else if (_TyUnicode_Equal(byteorder, &_Ty_ID(little)))
        little_endian = 1;
    else if (_TyUnicode_Equal(byteorder, &_Ty_ID(big)))
        little_endian = 0;
    else {
        TyErr_SetString(TyExc_ValueError,
            "byteorder must be either 'little' or 'big'");
        return NULL;
    }

    bytes = PyObject_Bytes(bytes_obj);
    if (bytes == NULL)
        return NULL;

    long_obj = _TyLong_FromByteArray(
        (unsigned char *)TyBytes_AS_STRING(bytes), Ty_SIZE(bytes),
        little_endian, is_signed);
    Ty_DECREF(bytes);

    if (long_obj != NULL && type != &TyLong_Type) {
        Ty_SETREF(long_obj, PyObject_CallOneArg((TyObject *)type, long_obj));
    }

    return long_obj;
}

static TyObject *
long_long_meth(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return long_long(self);
}

static TyObject *
long_long_getter(TyObject *self, void *Py_UNUSED(ignored))
{
    return long_long(self);
}

/*[clinic input]
int.is_integer

Returns True. Exists for duck type compatibility with float.is_integer.
[clinic start generated code]*/

static TyObject *
int_is_integer_impl(TyObject *self)
/*[clinic end generated code: output=90f8e794ce5430ef input=7e41c4d4416e05f2]*/
{
    Py_RETURN_TRUE;
}

static TyObject *
long_vectorcall(TyObject *type, TyObject * const*args,
                 size_t nargsf, TyObject *kwnames)
{
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (kwnames != NULL) {
        TyThreadState *tstate = TyThreadState_GET();
        return _TyObject_MakeTpCall(tstate, type, args, nargs, kwnames);
    }
    switch (nargs) {
        case 0:
            return _TyLong_GetZero();
        case 1:
            return PyNumber_Long(args[0]);
        case 2:
            return long_new_impl(_TyType_CAST(type), args[0], args[1]);
        default:
            return TyErr_Format(TyExc_TypeError,
                                "int expected at most 2 arguments, got %zd",
                                nargs);
    }
}

static TyMethodDef long_methods[] = {
    {"conjugate",       long_long_meth, METH_NOARGS,
     "Returns self, the complex conjugate of any int."},
    INT_BIT_LENGTH_METHODDEF
    INT_BIT_COUNT_METHODDEF
    INT_TO_BYTES_METHODDEF
    INT_FROM_BYTES_METHODDEF
    INT_AS_INTEGER_RATIO_METHODDEF
    {"__trunc__",       long_long_meth, METH_NOARGS,
     "Truncating an Integral returns itself."},
    {"__floor__",       long_long_meth, METH_NOARGS,
     "Flooring an Integral returns itself."},
    {"__ceil__",        long_long_meth, METH_NOARGS,
     "Ceiling of an Integral returns itself."},
    INT___ROUND___METHODDEF
    INT___GETNEWARGS___METHODDEF
    INT___FORMAT___METHODDEF
    INT___SIZEOF___METHODDEF
    INT_IS_INTEGER_METHODDEF
    {NULL,              NULL}           /* sentinel */
};

static TyGetSetDef long_getset[] = {
    {"real",
     long_long_getter, NULL,
     "the real part of a complex number",
     NULL},
    {"imag",
     long_get0, NULL,
     "the imaginary part of a complex number",
     NULL},
    {"numerator",
     long_long_getter, NULL,
     "the numerator of a rational number in lowest terms",
     NULL},
    {"denominator",
     long_get1, NULL,
     "the denominator of a rational number in lowest terms",
     NULL},
    {NULL}  /* Sentinel */
};

TyDoc_STRVAR(long_doc,
"int([x]) -> integer\n\
int(x, base=10) -> integer\n\
\n\
Convert a number or string to an integer, or return 0 if no arguments\n\
are given.  If x is a number, return x.__int__().  For floating-point\n\
numbers, this truncates towards zero.\n\
\n\
If x is not a number or if base is given, then x must be a string,\n\
bytes, or bytearray instance representing an integer literal in the\n\
given base.  The literal can be preceded by '+' or '-' and be surrounded\n\
by whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.\n\
Base 0 means to interpret the base from the string as an integer literal.\n\
>>> int('0b100', base=0)\n\
4");

static TyNumberMethods long_as_number = {
    long_add_method,            /*nb_add*/
    long_sub_method,            /*nb_subtract*/
    long_mul_method,            /*nb_multiply*/
    long_mod,                   /*nb_remainder*/
    long_divmod,                /*nb_divmod*/
    long_pow,                   /*nb_power*/
    long_neg_method,            /*nb_negative*/
    long_long,                  /*tp_positive*/
    long_abs_method,            /*tp_absolute*/
    long_bool,                  /*tp_bool*/
    long_invert,                /*nb_invert*/
    long_lshift_method,         /*nb_lshift*/
    long_rshift,                /*nb_rshift*/
    long_and,                   /*nb_and*/
    long_xor,                   /*nb_xor*/
    long_or,                    /*nb_or*/
    long_long,                  /*nb_int*/
    0,                          /*nb_reserved*/
    long_float,                 /*nb_float*/
    0,                          /* nb_inplace_add */
    0,                          /* nb_inplace_subtract */
    0,                          /* nb_inplace_multiply */
    0,                          /* nb_inplace_remainder */
    0,                          /* nb_inplace_power */
    0,                          /* nb_inplace_lshift */
    0,                          /* nb_inplace_rshift */
    0,                          /* nb_inplace_and */
    0,                          /* nb_inplace_xor */
    0,                          /* nb_inplace_or */
    long_div,                   /* nb_floor_divide */
    long_true_divide,           /* nb_true_divide */
    0,                          /* nb_inplace_floor_divide */
    0,                          /* nb_inplace_true_divide */
    long_long,                  /* nb_index */
};

TyTypeObject TyLong_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "int",                                      /* tp_name */
    offsetof(PyLongObject, long_value.ob_digit),  /* tp_basicsize */
    sizeof(digit),                              /* tp_itemsize */
    long_dealloc,                               /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    long_to_decimal_string,                     /* tp_repr */
    &long_as_number,                            /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    long_hash,                                  /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
        Ty_TPFLAGS_LONG_SUBCLASS |
        _Ty_TPFLAGS_MATCH_SELF,               /* tp_flags */
    long_doc,                                   /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    long_richcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    long_methods,                               /* tp_methods */
    0,                                          /* tp_members */
    long_getset,                                /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    long_new,                                   /* tp_new */
    PyObject_Free,                              /* tp_free */
    .tp_vectorcall = long_vectorcall,
    .tp_version_tag = _Ty_TYPE_VERSION_INT,
};

static TyTypeObject Int_InfoType;

TyDoc_STRVAR(int_info__doc__,
"sys.int_info\n\
\n\
A named tuple that holds information about Python's\n\
internal representation of integers.  The attributes are read only.");

static TyStructSequence_Field int_info_fields[] = {
    {"bits_per_digit", "size of a digit in bits"},
    {"sizeof_digit", "size in bytes of the C type used to represent a digit"},
    {"default_max_str_digits", "maximum string conversion digits limitation"},
    {"str_digits_check_threshold", "minimum positive value for int_max_str_digits"},
    {NULL, NULL}
};

static TyStructSequence_Desc int_info_desc = {
    "sys.int_info",   /* name */
    int_info__doc__,  /* doc */
    int_info_fields,  /* fields */
    4                 /* number of fields */
};

TyObject *
TyLong_GetInfo(void)
{
    TyObject* int_info;
    int field = 0;
    int_info = TyStructSequence_New(&Int_InfoType);
    if (int_info == NULL)
        return NULL;
    TyStructSequence_SET_ITEM(int_info, field++,
                              TyLong_FromLong(TyLong_SHIFT));
    TyStructSequence_SET_ITEM(int_info, field++,
                              TyLong_FromLong(sizeof(digit)));
    /*
     * The following two fields were added after investigating uses of
     * sys.int_info in the wild: Exceedingly rarely used. The ONLY use found was
     * numba using sys.int_info.bits_per_digit as attribute access rather than
     * sequence unpacking. Cython and sympy also refer to sys.int_info but only
     * as info for debugging. No concern about adding these in a backport.
     */
    TyStructSequence_SET_ITEM(int_info, field++,
                              TyLong_FromLong(_PY_LONG_DEFAULT_MAX_STR_DIGITS));
    TyStructSequence_SET_ITEM(int_info, field++,
                              TyLong_FromLong(_PY_LONG_MAX_STR_DIGITS_THRESHOLD));
    if (TyErr_Occurred()) {
        Ty_CLEAR(int_info);
        return NULL;
    }
    return int_info;
}


/* runtime lifecycle */

TyStatus
_TyLong_InitTypes(TyInterpreterState *interp)
{
    /* initialize int_info */
    if (_PyStructSequence_InitBuiltin(interp, &Int_InfoType,
                                      &int_info_desc) < 0)
    {
        return _TyStatus_ERR("can't init int info type");
    }

    return _TyStatus_OK();
}


void
_TyLong_FiniTypes(TyInterpreterState *interp)
{
    _PyStructSequence_FiniBuiltin(interp, &Int_InfoType);
}

#undef PyUnstable_Long_IsCompact

int
PyUnstable_Long_IsCompact(const PyLongObject* op) {
    return _TyLong_IsCompact((PyLongObject*)op);
}

#undef PyUnstable_Long_CompactValue

Ty_ssize_t
PyUnstable_Long_CompactValue(const PyLongObject* op) {
    return _TyLong_CompactValue((PyLongObject*)op);
}


TyObject* TyLong_FromInt32(int32_t value)
{
    PYLONG_FROM_INT(uint32_t, int32_t, value);
}

TyObject* TyLong_FromUInt32(uint32_t value)
{
    PYLONG_FROM_UINT(uint32_t, value);
}

TyObject* TyLong_FromInt64(int64_t value)
{
    PYLONG_FROM_INT(uint64_t, int64_t, value);
}

TyObject* TyLong_FromUInt64(uint64_t value)
{
    PYLONG_FROM_UINT(uint64_t, value);
}

#define LONG_TO_INT(obj, value, type_name) \
    do { \
        int flags = (Ty_ASNATIVEBYTES_NATIVE_ENDIAN \
                     | Ty_ASNATIVEBYTES_ALLOW_INDEX); \
        Ty_ssize_t bytes = TyLong_AsNativeBytes(obj, value, sizeof(*value), flags); \
        if (bytes < 0) { \
            return -1; \
        } \
        if ((size_t)bytes > sizeof(*value)) { \
            TyErr_SetString(TyExc_OverflowError, \
                            "Python int too large to convert to " type_name); \
            return -1; \
        } \
        return 0; \
    } while (0)

int TyLong_AsInt32(TyObject *obj, int32_t *value)
{
    LONG_TO_INT(obj, value, "C int32_t");
}

int TyLong_AsInt64(TyObject *obj, int64_t *value)
{
    LONG_TO_INT(obj, value, "C int64_t");
}

#define LONG_TO_UINT(obj, value, type_name) \
    do { \
        int flags = (Ty_ASNATIVEBYTES_NATIVE_ENDIAN \
                     | Ty_ASNATIVEBYTES_UNSIGNED_BUFFER \
                     | Ty_ASNATIVEBYTES_REJECT_NEGATIVE \
                     | Ty_ASNATIVEBYTES_ALLOW_INDEX); \
        Ty_ssize_t bytes = TyLong_AsNativeBytes(obj, value, sizeof(*value), flags); \
        if (bytes < 0) { \
            return -1; \
        } \
        if ((size_t)bytes > sizeof(*value)) { \
            TyErr_SetString(TyExc_OverflowError, \
                            "Python int too large to convert to " type_name); \
            return -1; \
        } \
        return 0; \
    } while (0)

int TyLong_AsUInt32(TyObject *obj, uint32_t *value)
{
    LONG_TO_UINT(obj, value, "C uint32_t");
}

int TyLong_AsUInt64(TyObject *obj, uint64_t *value)
{
    LONG_TO_UINT(obj, value, "C uint64_t");
}


static const PyLongLayout TyLong_LAYOUT = {
    .bits_per_digit = TyLong_SHIFT,
    .digits_order = -1,  // least significant first
    .digit_endianness = PY_LITTLE_ENDIAN ? -1 : 1,
    .digit_size = sizeof(digit),
};


const PyLongLayout*
TyLong_GetNativeLayout(void)
{
    return &TyLong_LAYOUT;
}


int
TyLong_Export(TyObject *obj, PyLongExport *export_long)
{
    if (!TyLong_Check(obj)) {
        memset(export_long, 0, sizeof(*export_long));
        TyErr_Format(TyExc_TypeError, "expect int, got %T", obj);
        return -1;
    }

    // Fast-path: try to convert to a int64_t
    int overflow;
#if SIZEOF_LONG == 8
    long value = TyLong_AsLongAndOverflow(obj, &overflow);
#else
    // Windows has 32-bit long, so use 64-bit long long instead
    long long value = TyLong_AsLongLongAndOverflow(obj, &overflow);
#endif
    Ty_BUILD_ASSERT(sizeof(value) == sizeof(int64_t));
    // the function cannot fail since obj is a PyLongObject
    assert(!(value == -1 && TyErr_Occurred()));

    if (!overflow) {
        export_long->value = value;
        export_long->negative = 0;
        export_long->ndigits = 0;
        export_long->digits = NULL;
        export_long->_reserved = 0;
    }
    else {
        PyLongObject *self = (PyLongObject*)obj;
        export_long->value = 0;
        export_long->negative = _TyLong_IsNegative(self);
        export_long->ndigits = _TyLong_DigitCount(self);
        if (export_long->ndigits == 0) {
            export_long->ndigits = 1;
        }
        export_long->digits = self->long_value.ob_digit;
        export_long->_reserved = (Ty_uintptr_t)Ty_NewRef(obj);
    }
    return 0;
}


void
TyLong_FreeExport(PyLongExport *export_long)
{
    TyObject *obj = (TyObject*)export_long->_reserved;
    if (obj) {
        export_long->_reserved = 0;
        Ty_DECREF(obj);
    }
}


/* --- PyLongWriter API --------------------------------------------------- */

PyLongWriter*
PyLongWriter_Create(int negative, Ty_ssize_t ndigits, void **digits)
{
    if (ndigits <= 0) {
        TyErr_SetString(TyExc_ValueError, "ndigits must be positive");
        goto error;
    }
    assert(digits != NULL);

    PyLongObject *obj = long_alloc(ndigits);
    if (obj == NULL) {
        goto error;
    }
    if (negative) {
        _TyLong_FlipSign(obj);
    }

    *digits = obj->long_value.ob_digit;
    return (PyLongWriter*)obj;

error:
    *digits = NULL;
    return NULL;
}


void
PyLongWriter_Discard(PyLongWriter *writer)
{
    if (writer == NULL) {
        return;
    }

    PyLongObject *obj = (PyLongObject *)writer;
    assert(Ty_REFCNT(obj) == 1);
    Ty_DECREF(obj);
}


TyObject*
PyLongWriter_Finish(PyLongWriter *writer)
{
    PyLongObject *obj = (PyLongObject *)writer;
    assert(Ty_REFCNT(obj) == 1);

    // Normalize and get singleton if possible
    obj = maybe_small_long(long_normalize(obj));

    return (TyObject*)obj;
}
