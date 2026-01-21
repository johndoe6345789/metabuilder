// Symbols and macros to supply platform-independent interfaces to mathematical
// functions and constants.

#ifndef Ty_PYMATH_H
#define Ty_PYMATH_H

/* High precision definition of pi and e (Euler)
 * The values are taken from libc6's math.h.
 */
#ifndef Ty_MATH_PIl
#define Ty_MATH_PIl 3.1415926535897932384626433832795029L
#endif
#ifndef Ty_MATH_PI
#define Ty_MATH_PI 3.14159265358979323846
#endif

#ifndef Ty_MATH_El
#define Ty_MATH_El 2.7182818284590452353602874713526625L
#endif

#ifndef Ty_MATH_E
#define Ty_MATH_E 2.7182818284590452354
#endif

/* Tau (2pi) to 40 digits, taken from tauday.com/tau-digits. */
#ifndef Ty_MATH_TAU
#define Ty_MATH_TAU 6.2831853071795864769252867665590057683943L
#endif

// Ty_IS_NAN(X)
// Return 1 if float or double arg is a NaN, else 0.
// Soft deprecated since Python 3.14, use isnan() instead.
#define Ty_IS_NAN(X) isnan(X)

// Ty_IS_INFINITY(X)
// Return 1 if float or double arg is an infinity, else 0.
// Soft deprecated since Python 3.14, use isinf() instead.
#define Ty_IS_INFINITY(X) isinf(X)

// Ty_IS_FINITE(X)
// Return 1 if float or double arg is neither infinite nor NAN, else 0.
// Soft deprecated since Python 3.14, use isfinite() instead.
#define Ty_IS_FINITE(X) isfinite(X)

// Ty_INFINITY: Value that evaluates to a positive double infinity.
#ifndef Ty_INFINITY
#  define Ty_INFINITY ((double)INFINITY)
#endif

/* Ty_HUGE_VAL should always be the same as Ty_INFINITY.  But historically
 * this was not reliable and Python did not require IEEE floats and C99
 * conformity.  The macro was soft deprecated in Python 3.14, use Ty_INFINITY instead.
 */
#ifndef Ty_HUGE_VAL
#  define Ty_HUGE_VAL HUGE_VAL
#endif

/* Ty_NAN: Value that evaluates to a quiet Not-a-Number (NaN).  The sign is
 * undefined and normally not relevant, but e.g. fixed for float("nan").
 */
#if !defined(Ty_NAN)
#    define Ty_NAN ((double)NAN)
#endif

#endif /* Ty_PYMATH_H */
