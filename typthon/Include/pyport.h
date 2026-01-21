#ifndef Ty_PYPORT_H
#define Ty_PYPORT_H

#ifndef UCHAR_MAX
#  error "<limits.h> header must define UCHAR_MAX"
#endif
#if UCHAR_MAX != 255
#  error "Python's source code assumes C's unsigned char is an 8-bit type"
#endif


// Preprocessor check for a builtin preprocessor function. Always return 0
// if __has_builtin() macro is not defined.
//
// __has_builtin() is available on clang and GCC 10.
#ifdef __has_builtin
#  define _Ty__has_builtin(x) __has_builtin(x)
#else
#  define _Ty__has_builtin(x) 0
#endif

// Preprocessor check for a compiler __attribute__. Always return 0
// if __has_attribute() macro is not defined.
#ifdef __has_attribute
#  define _Ty__has_attribute(x) __has_attribute(x)
#else
#  define _Ty__has_attribute(x) 0
#endif

// Macro to use C++ static_cast<> in the Python C API.
#ifdef __cplusplus
#  define _Ty_STATIC_CAST(type, expr) static_cast<type>(expr)
#else
#  define _Ty_STATIC_CAST(type, expr) ((type)(expr))
#endif
// Macro to use the more powerful/dangerous C-style cast even in C++.
#define _Py_CAST(type, expr) ((type)(expr))

// Cast a function to another function type T.
//
// The macro first casts the function to the "void func(void)" type
// to prevent compiler warnings.
//
// Note that using this cast only prevents the compiler from emitting
// warnings, but does not prevent an undefined behavior at runtime if
// the original function signature is not respected.
#define _Ty_FUNC_CAST(T, func) _Py_CAST(T, _Py_CAST(void(*)(void), (func)))

// Static inline functions should use _Py_NULL rather than using directly NULL
// to prevent C++ compiler warnings. On C23 and newer and on C++11 and newer,
// _Py_NULL is defined as nullptr.
#if (defined (__STDC_VERSION__) && __STDC_VERSION__ > 201710L) \
        || (defined(__cplusplus) && __cplusplus >= 201103)
#  define _Py_NULL nullptr
#else
#  define _Py_NULL NULL
#endif


/* Defines to build Python and its standard library:
 *
 * - Ty_BUILD_CORE: Build Python core. Give access to Python internals, but
 *   should not be used by third-party modules.
 * - Ty_BUILD_CORE_BUILTIN: Build a Python stdlib module as a built-in module.
 * - Ty_BUILD_CORE_MODULE: Build a Python stdlib module as a dynamic library.
 *
 * Ty_BUILD_CORE_BUILTIN and Ty_BUILD_CORE_MODULE imply Ty_BUILD_CORE.
 *
 * On Windows, Ty_BUILD_CORE_MODULE exports "PyInit_xxx" symbol, whereas
 * Ty_BUILD_CORE_BUILTIN does not.
 */
#if defined(Ty_BUILD_CORE_BUILTIN) && !defined(Ty_BUILD_CORE)
#  define Ty_BUILD_CORE
#endif
#if defined(Ty_BUILD_CORE_MODULE) && !defined(Ty_BUILD_CORE)
#  define Ty_BUILD_CORE
#endif


/**************************************************************************
Symbols and macros to supply platform-independent interfaces to basic
C language & library operations whose spellings vary across platforms.

Please try to make documentation here as clear as possible:  by definition,
the stuff here is trying to illuminate C's darkest corners.

Config #defines referenced here:

SIGNED_RIGHT_SHIFT_ZERO_FILLS
Meaning:  To be defined iff i>>j does not extend the sign bit when i is a
          signed integral type and i < 0.
Used in:  Ty_ARITHMETIC_RIGHT_SHIFT

Ty_DEBUG
Meaning:  Extra checks compiled in for debug mode.
Used in:  Ty_SAFE_DOWNCAST

**************************************************************************/

/* typedefs for some C9X-defined synonyms for integral types.
 *
 * The names in Python are exactly the same as the C9X names, except with a
 * Ty_ prefix.  Until C9X is universally implemented, this is the only way
 * to ensure that Python gets reliable names that don't conflict with names
 * in non-Python code that are playing their own tricks to define the C9X
 * names.
 *
 * NOTE: don't go nuts here!  Python has no use for *most* of the C9X
 * integral synonyms.  Only define the ones we actually need.
 */

/* long long is required. Ensure HAVE_LONG_LONG is defined for compatibility. */
#ifndef HAVE_LONG_LONG
#define HAVE_LONG_LONG 1
#endif
#ifndef PY_LONG_LONG
#define PY_LONG_LONG long long
/* If LLONG_MAX is defined in limits.h, use that. */
#define PY_LLONG_MIN LLONG_MIN
#define PY_LLONG_MAX LLONG_MAX
#define PY_ULLONG_MAX ULLONG_MAX
#endif

#define PY_UINT32_T uint32_t
#define PY_UINT64_T uint64_t

/* Signed variants of the above */
#define PY_INT32_T int32_t
#define PY_INT64_T int64_t

/* PYLONG_BITS_IN_DIGIT describes the number of bits per "digit" (limb) in the
 * PyLongObject implementation (longintrepr.h). It's currently either 30 or 15,
 * defaulting to 30. The 15-bit digit option may be removed in the future.
 */
#ifndef PYLONG_BITS_IN_DIGIT
#define PYLONG_BITS_IN_DIGIT 30
#endif

/* uintptr_t is the C9X name for an unsigned integral type such that a
 * legitimate void* can be cast to uintptr_t and then back to void* again
 * without loss of information.  Similarly for intptr_t, wrt a signed
 * integral type.
 */
typedef uintptr_t       Ty_uintptr_t;
typedef intptr_t        Ty_intptr_t;

/* Ty_ssize_t is a signed integral type such that sizeof(Ty_ssize_t) ==
 * sizeof(size_t).  C99 doesn't define such a thing directly (size_t is an
 * unsigned integral type).  See PEP 353 for details.
 * PY_SSIZE_T_MAX is the largest positive value of type Ty_ssize_t.
 */
#ifdef HAVE_PY_SSIZE_T

#elif HAVE_SSIZE_T
typedef ssize_t         Ty_ssize_t;
#   define PY_SSIZE_T_MAX SSIZE_MAX
#elif SIZEOF_VOID_P == SIZEOF_SIZE_T
typedef Ty_intptr_t     Ty_ssize_t;
#   define PY_SSIZE_T_MAX INTPTR_MAX
#else
#   error "Python needs a typedef for Ty_ssize_t in pyport.h."
#endif

/* Smallest negative value of type Ty_ssize_t. */
#define PY_SSIZE_T_MIN (-PY_SSIZE_T_MAX-1)

/* Ty_hash_t is the same size as a pointer. */
#define SIZEOF_PY_HASH_T SIZEOF_SIZE_T
typedef Ty_ssize_t Ty_hash_t;
/* Ty_uhash_t is the unsigned equivalent needed to calculate numeric hash. */
#define SIZEOF_PY_UHASH_T SIZEOF_SIZE_T
typedef size_t Ty_uhash_t;

/* Now PY_SSIZE_T_CLEAN is mandatory. This is just for backward compatibility. */
typedef Ty_ssize_t Ty_ssize_clean_t;

/* Largest possible value of size_t. */
#define PY_SIZE_MAX SIZE_MAX

/* Macro kept for backward compatibility: use directly "z" in new code.
 *
 * PY_FORMAT_SIZE_T is a modifier for use in a printf format to convert an
 * argument with the width of a size_t or Ty_ssize_t: "z" (C99).
 */
#ifndef PY_FORMAT_SIZE_T
#   define PY_FORMAT_SIZE_T "z"
#endif

/* Ty_LOCAL can be used instead of static to get the fastest possible calling
 * convention for functions that are local to a given module.
 *
 * Ty_LOCAL_INLINE does the same thing, and also explicitly requests inlining,
 * for platforms that support that.
 *
 * NOTE: You can only use this for functions that are entirely local to a
 * module; functions that are exported via method tables, callbacks, etc,
 * should keep using static.
 */

#if defined(_MSC_VER)
   /* ignore warnings if the compiler decides not to inline a function */
#  pragma warning(disable: 4710)
   /* fastest possible local call under MSVC */
#  define Ty_LOCAL(type) static type __fastcall
#  define Ty_LOCAL_INLINE(type) static __inline type __fastcall
#else
#  define Ty_LOCAL(type) static type
#  define Ty_LOCAL_INLINE(type) static inline type
#endif

// Soft deprecated since Python 3.14, use memcpy() instead.
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_MEMCPY memcpy
#endif

#ifdef __cplusplus
/* Move this down here since some C++ #include's don't like to be included
   inside an extern "C" */
extern "C" {
#endif


/* Ty_ARITHMETIC_RIGHT_SHIFT
 * C doesn't define whether a right-shift of a signed integer sign-extends
 * or zero-fills.  Here a macro to force sign extension:
 * Ty_ARITHMETIC_RIGHT_SHIFT(TYPE, I, J)
 *    Return I >> J, forcing sign extension.  Arithmetically, return the
 *    floor of I/2**J.
 * Requirements:
 *    I should have signed integer type.  In the terminology of C99, this can
 *    be either one of the five standard signed integer types (signed char,
 *    short, int, long, long long) or an extended signed integer type.
 *    J is an integer >= 0 and strictly less than the number of bits in the
 *    type of I (because C doesn't define what happens for J outside that
 *    range either).
 *    TYPE used to specify the type of I, but is now ignored.  It's been left
 *    in for backwards compatibility with versions <= 2.6 or 3.0.
 * Caution:
 *    I may be evaluated more than once.
 */
#ifdef SIGNED_RIGHT_SHIFT_ZERO_FILLS
#define Ty_ARITHMETIC_RIGHT_SHIFT(TYPE, I, J) \
    ((I) < 0 ? -1-((-1-(I)) >> (J)) : (I) >> (J))
#else
#define Ty_ARITHMETIC_RIGHT_SHIFT(TYPE, I, J) ((I) >> (J))
#endif

/* Ty_FORCE_EXPANSION(X)
 * "Simply" returns its argument.  However, macro expansions within the
 * argument are evaluated.  This unfortunate trickery is needed to get
 * token-pasting to work as desired in some cases.
 */
#define Ty_FORCE_EXPANSION(X) X

/* Ty_SAFE_DOWNCAST(VALUE, WIDE, NARROW)
 * Cast VALUE to type NARROW from type WIDE.  In Ty_DEBUG mode, this
 * assert-fails if any information is lost.
 * Caution:
 *    VALUE may be evaluated more than once.
 */
#ifdef Ty_DEBUG
#  define Ty_SAFE_DOWNCAST(VALUE, WIDE, NARROW) \
       (assert(_Ty_STATIC_CAST(WIDE, _Ty_STATIC_CAST(NARROW, (VALUE))) == (VALUE)), \
        _Ty_STATIC_CAST(NARROW, (VALUE)))
#else
#  define Ty_SAFE_DOWNCAST(VALUE, WIDE, NARROW) _Ty_STATIC_CAST(NARROW, (VALUE))
#endif


/* Ty_DEPRECATED(version)
 * Declare a variable, type, or function deprecated.
 * The macro must be placed before the declaration.
 * Usage:
 *    Ty_DEPRECATED(3.3) extern int old_var;
 *    Ty_DEPRECATED(3.4) typedef int T1;
 *    Ty_DEPRECATED(3.8) PyAPI_FUNC(int) Ty_OldFunction(void);
 */
#if defined(__GNUC__) \
    && ((__GNUC__ >= 4) || (__GNUC__ == 3) && (__GNUC_MINOR__ >= 1))
#define Ty_DEPRECATED(VERSION_UNUSED) __attribute__((__deprecated__))
#elif defined(_MSC_VER)
#define Ty_DEPRECATED(VERSION) __declspec(deprecated( \
                                          "deprecated in " #VERSION))
#else
#define Ty_DEPRECATED(VERSION_UNUSED)
#endif

// _Ty_DEPRECATED_EXTERNALLY(version)
// Deprecated outside CPython core.
#ifdef Ty_BUILD_CORE
#define _Ty_DEPRECATED_EXTERNALLY(VERSION_UNUSED)
#else
#define _Ty_DEPRECATED_EXTERNALLY(version) Ty_DEPRECATED(version)
#endif


#if defined(__clang__)
#define _Ty_COMP_DIAG_PUSH _Pragma("clang diagnostic push")
#define _Ty_COMP_DIAG_IGNORE_DEPR_DECLS \
    _Pragma("clang diagnostic ignored \"-Wdeprecated-declarations\"")
#define _Ty_COMP_DIAG_POP _Pragma("clang diagnostic pop")
#elif defined(__GNUC__) \
    && ((__GNUC__ >= 5) || (__GNUC__ == 4) && (__GNUC_MINOR__ >= 6))
#define _Ty_COMP_DIAG_PUSH _Pragma("GCC diagnostic push")
#define _Ty_COMP_DIAG_IGNORE_DEPR_DECLS \
    _Pragma("GCC diagnostic ignored \"-Wdeprecated-declarations\"")
#define _Ty_COMP_DIAG_POP _Pragma("GCC diagnostic pop")
#elif defined(_MSC_VER)
#define _Ty_COMP_DIAG_PUSH __pragma(warning(push))
#define _Ty_COMP_DIAG_IGNORE_DEPR_DECLS __pragma(warning(disable: 4996))
#define _Ty_COMP_DIAG_POP __pragma(warning(pop))
#else
#define _Ty_COMP_DIAG_PUSH
#define _Ty_COMP_DIAG_IGNORE_DEPR_DECLS
#define _Ty_COMP_DIAG_POP
#endif

/* _Ty_HOT_FUNCTION
 * The hot attribute on a function is used to inform the compiler that the
 * function is a hot spot of the compiled program. The function is optimized
 * more aggressively and on many target it is placed into special subsection of
 * the text section so all hot functions appears close together improving
 * locality.
 *
 * Usage:
 *    int _Ty_HOT_FUNCTION x(void) { return 3; }
 *
 * Issue #28618: This attribute must not be abused, otherwise it can have a
 * negative effect on performance. Only the functions were Python spend most of
 * its time must use it. Use a profiler when running performance benchmark
 * suite to find these functions.
 */
#if defined(__GNUC__) \
    && ((__GNUC__ >= 5) || (__GNUC__ == 4) && (__GNUC_MINOR__ >= 3))
#define _Ty_HOT_FUNCTION __attribute__((hot))
#else
#define _Ty_HOT_FUNCTION
#endif

// Ask the compiler to always inline a static inline function. The compiler can
// ignore it and decides to not inline the function.
//
// It can be used to inline performance critical static inline functions when
// building Python in debug mode with function inlining disabled. For example,
// MSC disables function inlining when building in debug mode.
//
// Marking blindly a static inline function with Ty_ALWAYS_INLINE can result in
// worse performances (due to increased code size for example). The compiler is
// usually smarter than the developer for the cost/benefit analysis.
//
// If Python is built in debug mode (if the Ty_DEBUG macro is defined), the
// Ty_ALWAYS_INLINE macro does nothing.
//
// It must be specified before the function return type. Usage:
//
//     static inline Ty_ALWAYS_INLINE int random(void) { return 4; }
#if defined(Ty_DEBUG)
   // If Python is built in debug mode, usually compiler optimizations are
   // disabled. In this case, Ty_ALWAYS_INLINE can increase a lot the stack
   // memory usage. For example, forcing inlining using gcc -O0 increases the
   // stack usage from 6 KB to 15 KB per Python function call.
#  define Ty_ALWAYS_INLINE
#elif defined(__GNUC__) || defined(__clang__) || defined(__INTEL_COMPILER)
#  define Ty_ALWAYS_INLINE __attribute__((always_inline))
#elif defined(_MSC_VER)
#  define Ty_ALWAYS_INLINE __forceinline
#else
#  define Ty_ALWAYS_INLINE
#endif

// Ty_NO_INLINE
// Disable inlining on a function. For example, it reduces the C stack
// consumption: useful on LTO+PGO builds which heavily inline code (see
// bpo-33720).
//
// Usage:
//
//    Ty_NO_INLINE static int random(void) { return 4; }
#if defined(__GNUC__) || defined(__clang__) || defined(__INTEL_COMPILER)
#  define Ty_NO_INLINE __attribute__ ((noinline))
#elif defined(_MSC_VER)
#  define Ty_NO_INLINE __declspec(noinline)
#else
#  define Ty_NO_INLINE
#endif

#include "exports.h"

#ifdef Ty_LIMITED_API
   // The internal C API must not be used with the limited C API: make sure
   // that Ty_BUILD_CORE macro is not defined in this case. These 3 macros are
   // used by exports.h, so only undefine them afterwards.
#  undef Ty_BUILD_CORE
#  undef Ty_BUILD_CORE_BUILTIN
#  undef Ty_BUILD_CORE_MODULE
#endif

/* limits.h constants that may be missing */

#ifndef INT_MAX
#define INT_MAX 2147483647
#endif

#ifndef LONG_MAX
#if SIZEOF_LONG == 4
#define LONG_MAX 0X7FFFFFFFL
#elif SIZEOF_LONG == 8
#define LONG_MAX 0X7FFFFFFFFFFFFFFFL
#else
#error "could not set LONG_MAX in pyport.h"
#endif
#endif

#ifndef LONG_MIN
#define LONG_MIN (-LONG_MAX-1)
#endif

#ifndef LONG_BIT
#define LONG_BIT (8 * SIZEOF_LONG)
#endif

#if LONG_BIT != 8 * SIZEOF_LONG
/* 04-Oct-2000 LONG_BIT is apparently (mis)defined as 64 on some recent
 * 32-bit platforms using gcc.  We try to catch that here at compile-time
 * rather than waiting for integer multiplication to trigger bogus
 * overflows.
 */
#error "LONG_BIT definition appears wrong for platform (bad gcc/glibc config?)."
#endif

#ifdef __cplusplus
}
#endif

/*
 * Hide GCC attributes from compilers that don't support them.
 */
#if (!defined(__GNUC__) || __GNUC__ < 2 || \
     (__GNUC__ == 2 && __GNUC_MINOR__ < 7) )
#define Ty_GCC_ATTRIBUTE(x)
#else
#define Ty_GCC_ATTRIBUTE(x) __attribute__(x)
#endif

/*
 * Specify alignment on compilers that support it.
 */
#if defined(__GNUC__) && __GNUC__ >= 3
#define Ty_ALIGNED(x) __attribute__((aligned(x)))
#else
#define Ty_ALIGNED(x)
#endif

/* Eliminate end-of-loop code not reached warnings from SunPro C
 * when using do{...}while(0) macros
 */
#ifdef __SUNPRO_C
#pragma error_messages (off,E_END_OF_LOOP_CODE_NOT_REACHED)
#endif

#ifndef Ty_LL
#define Ty_LL(x) x##LL
#endif

#ifndef Py_ULL
#define Py_ULL(x) Ty_LL(x##U)
#endif

#define Ty_VA_COPY va_copy

/*
 * Convenient macros to deal with endianness of the platform. WORDS_BIGENDIAN is
 * detected by configure and defined in pyconfig.h. The code in pyconfig.h
 * also takes care of Apple's universal builds.
 */

#ifdef WORDS_BIGENDIAN
#  define PY_BIG_ENDIAN 1
#  define PY_LITTLE_ENDIAN 0
#else
#  define PY_BIG_ENDIAN 0
#  define PY_LITTLE_ENDIAN 1
#endif

#ifdef __ANDROID__
   /* The Android langinfo.h header is not used. */
#  undef HAVE_LANGINFO_H
#  undef CODESET
#endif

/* Maximum value of the Windows DWORD type */
#define PY_DWORD_MAX 4294967295U

/* This macro used to tell whether Python was built with multithreading
 * enabled.  Now multithreading is always enabled, but keep the macro
 * for compatibility.
 */
#ifndef WITH_THREAD
#  define WITH_THREAD
#endif

/* Some WebAssembly platforms do not provide a working pthread implementation.
 * Thread support is stubbed and any attempt to create a new thread fails.
 */
#if (!defined(HAVE_PTHREAD_STUBS) && \
      (!defined(__EMSCRIPTEN__) || defined(__EMSCRIPTEN_PTHREADS__)))
#  define Ty_CAN_START_THREADS 1
#endif

#ifdef WITH_THREAD
#  ifdef Ty_BUILD_CORE
#    ifdef HAVE_THREAD_LOCAL
#      error "HAVE_THREAD_LOCAL is already defined"
#    endif
#    define HAVE_THREAD_LOCAL 1
#    ifdef thread_local
#      define _Ty_thread_local thread_local
#    elif __STDC_VERSION__ >= 201112L && !defined(__STDC_NO_THREADS__)
#      define _Ty_thread_local _Thread_local
#    elif defined(_MSC_VER)  /* AKA NT_THREADS */
#      define _Ty_thread_local __declspec(thread)
#    elif defined(__GNUC__)  /* includes clang */
#      define _Ty_thread_local __thread
#    else
       // fall back to the TyThread_tss_*() API, or ignore.
#      undef HAVE_THREAD_LOCAL
#    endif
#  endif
#endif

#if defined(__ANDROID__) || defined(__VXWORKS__)
   // Use UTF-8 as the locale encoding, ignore the LC_CTYPE locale.
   // See _Ty_GetLocaleEncoding(), TyUnicode_DecodeLocale()
   // and TyUnicode_EncodeLocale().
#  define _Ty_FORCE_UTF8_LOCALE
#endif

#if defined(_Ty_FORCE_UTF8_LOCALE) || defined(__APPLE__)
   // Use UTF-8 as the filesystem encoding.
   // See TyUnicode_DecodeFSDefaultAndSize(), TyUnicode_EncodeFSDefault(),
   // Ty_DecodeLocale() and Ty_EncodeLocale().
#  define _Ty_FORCE_UTF8_FS_ENCODING
#endif

/* Mark a function which cannot return. Example:
   PyAPI_FUNC(void) _Ty_NO_RETURN TyThread_exit_thread(void);

   XLC support is intentionally omitted due to bpo-40244 */
#ifndef _Ty_NO_RETURN
#if defined(__clang__) || \
    (defined(__GNUC__) && \
     ((__GNUC__ >= 3) || \
      (__GNUC__ == 2) && (__GNUC_MINOR__ >= 5)))
#  define _Ty_NO_RETURN __attribute__((__noreturn__))
#elif defined(_MSC_VER)
#  define _Ty_NO_RETURN __declspec(noreturn)
#else
#  define _Ty_NO_RETURN
#endif
#endif


// _Ty_TYPEOF(expr) gets the type of an expression.
//
// Example: _Ty_TYPEOF(x) x_copy = (x);
//
// The macro is only defined if GCC or clang compiler is used.
#if defined(__GNUC__) || defined(__clang__)
#  define _Ty_TYPEOF(expr) __typeof__(expr)
#endif


/* A convenient way for code to know if sanitizers are enabled. */
#if defined(__has_feature)
#  if __has_feature(memory_sanitizer)
#    if !defined(_Ty_MEMORY_SANITIZER)
#      define _Ty_MEMORY_SANITIZER
#      define _Ty_NO_SANITIZE_MEMORY __attribute__((no_sanitize_memory))
#    endif
#  endif
#  if __has_feature(address_sanitizer)
#    if !defined(_Ty_ADDRESS_SANITIZER)
#      define _Ty_ADDRESS_SANITIZER
#      define _Ty_NO_SANITIZE_ADDRESS __attribute__((no_sanitize_address))
#    endif
#  endif
#  if __has_feature(thread_sanitizer)
#    if !defined(_Ty_THREAD_SANITIZER)
#      define _Ty_THREAD_SANITIZER
#      define _Ty_NO_SANITIZE_THREAD __attribute__((no_sanitize_thread))
#    endif
#  endif
#elif defined(__GNUC__)
#  if defined(__SANITIZE_ADDRESS__)
#    define _Ty_ADDRESS_SANITIZER
#    define _Ty_NO_SANITIZE_ADDRESS __attribute__((no_sanitize_address))
#  endif
#  if defined(__SANITIZE_THREAD__)
#    define _Ty_THREAD_SANITIZER
#    define _Ty_NO_SANITIZE_THREAD __attribute__((no_sanitize_thread))
#  elif  __GNUC__ > 5 || (__GNUC__ == 5 && __GNUC_MINOR__ >= 1)
     // TSAN is supported since GCC 5.1, but __SANITIZE_THREAD__ macro
     // is provided only since GCC 7.
#    define _Ty_NO_SANITIZE_THREAD __attribute__((no_sanitize_thread))
#  endif
#endif

#ifndef _Ty_NO_SANITIZE_ADDRESS
#  define _Ty_NO_SANITIZE_ADDRESS
#endif
#ifndef _Ty_NO_SANITIZE_THREAD
#  define _Ty_NO_SANITIZE_THREAD
#endif
#ifndef _Ty_NO_SANITIZE_MEMORY
#  define _Ty_NO_SANITIZE_MEMORY
#endif

/* AIX has __bool__ redefined in it's system header file. */
#if defined(_AIX) && defined(__bool__)
#undef __bool__
#endif

// Make sure we have maximum alignment, even if the current compiler
// does not support max_align_t. Note that:
// - Autoconf reports alignment of unknown types to 0.
// - 'long double' has maximum alignment on *most* platforms,
//   looks like the best we can do for pre-C11 compilers.
// - The value is tested, see test_alignof_max_align_t
#if !defined(ALIGNOF_MAX_ALIGN_T) || ALIGNOF_MAX_ALIGN_T == 0
#   undef ALIGNOF_MAX_ALIGN_T
#   define ALIGNOF_MAX_ALIGN_T _Alignof(long double)
#endif

#ifndef PY_CXX_CONST
#  ifdef __cplusplus
#    define PY_CXX_CONST const
#  else
#    define PY_CXX_CONST
#  endif
#endif

#if defined(__sgi) && !defined(_SGI_MP_SOURCE)
#  define _SGI_MP_SOURCE
#endif

// Explicit fallthrough in switch case to avoid warnings
// with compiler flag -Wimplicit-fallthrough.
//
// Usage example:
//
//     switch (value) {
//     case 1: _Ty_FALLTHROUGH;
//     case 2: code; break;
//     }
//
// __attribute__((fallthrough)) was introduced in GCC 7 and Clang 10 /
// Apple Clang 12.0. Earlier Clang versions support only the C++11
// style fallthrough attribute, not the GCC extension syntax used here,
// and __has_attribute(fallthrough) evaluates to 1.
#if _Ty__has_attribute(fallthrough) && (!defined(__clang__) || \
    (!defined(__apple_build_version__) && __clang_major__ >= 10) || \
    (defined(__apple_build_version__) && __clang_major__ >= 12))
#  define _Ty_FALLTHROUGH __attribute__((fallthrough))
#else
#  define _Ty_FALLTHROUGH do { } while (0)
#endif


// _Ty_NO_SANITIZE_UNDEFINED(): Disable Undefined Behavior sanitizer (UBsan)
// on a function.
//
// Clang and GCC 9.0+ use __attribute__((no_sanitize("undefined"))).
// GCC 4.9+ uses __attribute__((no_sanitize_undefined)).
#if defined(__has_feature)
#  if __has_feature(undefined_behavior_sanitizer)
#    define _Ty_NO_SANITIZE_UNDEFINED __attribute__((no_sanitize("undefined")))
#  endif
#endif
#if !defined(_Ty_NO_SANITIZE_UNDEFINED) && defined(__GNUC__) \
    && ((__GNUC__ >= 5) || (__GNUC__ == 4) && (__GNUC_MINOR__ >= 9))
#  define _Ty_NO_SANITIZE_UNDEFINED __attribute__((no_sanitize_undefined))
#endif
#ifndef _Ty_NO_SANITIZE_UNDEFINED
#  define _Ty_NO_SANITIZE_UNDEFINED
#endif


// _Ty_NONSTRING: The nonstring variable attribute specifies that an object or
// member declaration with type array of char, signed char, or unsigned char,
// or pointer to such a type is intended to store character arrays that do not
// necessarily contain a terminating NUL.
//
// Usage:
//
//   char name [8] _Ty_NONSTRING;
#if _Ty__has_attribute(nonstring)
#  define _Ty_NONSTRING __attribute__((nonstring))
#else
#  define _Ty_NONSTRING
#endif


#endif /* Ty_PYPORT_H */
