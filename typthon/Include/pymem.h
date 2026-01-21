// The TyMem_ family:  low-level memory allocation interfaces.
// See objimpl.h for the PyObject_ memory family.

#ifndef Ty_PYMEM_H
#define Ty_PYMEM_H
#ifdef __cplusplus
extern "C" {
#endif

/* BEWARE:

   Each interface exports both functions and macros.  Extension modules should
   use the functions, to ensure binary compatibility across Python versions.
   Because the Python implementation is free to change internal details, and
   the macros may (or may not) expose details for speed, if you do use the
   macros you must recompile your extensions with each Python release.

   Never mix calls to TyMem_ with calls to the platform malloc/realloc/
   calloc/free.  For example, on Windows different DLLs may end up using
   different heaps, and if you use TyMem_Malloc you'll get the memory from the
   heap used by the Python DLL; it could be a disaster if you free()'ed that
   directly in your own extension.  Using TyMem_Free instead ensures Python
   can return the memory to the proper heap.  As another example, in
   a debug build (Ty_DEBUG macro), Python wraps all calls to all TyMem_ and
   PyObject_ memory functions in special debugging wrappers that add additional
   debugging info to dynamic memory blocks.  The system routines have no idea
   what to do with that stuff, and the Python wrappers have no idea what to do
   with raw blocks obtained directly by the system routines then.

   The GIL must be held when using these APIs.
*/

/*
 * Raw memory interface
 * ====================
 */

/* Functions

   Functions supplying platform-independent semantics for malloc/realloc/
   free.  These functions make sure that allocating 0 bytes returns a distinct
   non-NULL pointer (whenever possible -- if we're flat out of memory, NULL
   may be returned), even if the platform malloc and realloc don't.
   Returned pointers must be checked for NULL explicitly.  No action is
   performed on failure (no exception is set, no warning is printed, etc).
*/

PyAPI_FUNC(void *) TyMem_Malloc(size_t size);
PyAPI_FUNC(void *) TyMem_Calloc(size_t nelem, size_t elsize);
PyAPI_FUNC(void *) TyMem_Realloc(void *ptr, size_t new_size);
PyAPI_FUNC(void) TyMem_Free(void *ptr);

/*
 * Type-oriented memory interface
 * ==============================
 *
 * Allocate memory for n objects of the given type.  Returns a new pointer
 * or NULL if the request was too large or memory allocation failed.  Use
 * these macros rather than doing the multiplication yourself so that proper
 * overflow checking is always done.
 */

#define TyMem_New(type, n) \
  ( ((size_t)(n) > PY_SSIZE_T_MAX / sizeof(type)) ? NULL :      \
        ( (type *) TyMem_Malloc((n) * sizeof(type)) ) )

/*
 * The value of (p) is always clobbered by this macro regardless of success.
 * The caller MUST check if (p) is NULL afterwards and deal with the memory
 * error if so.  This means the original value of (p) MUST be saved for the
 * caller's memory error handler to not lose track of it.
 */
#define TyMem_Resize(p, type, n) \
  ( (p) = ((size_t)(n) > PY_SSIZE_T_MAX / sizeof(type)) ? NULL :        \
        (type *) TyMem_Realloc((p), (n) * sizeof(type)) )


// Deprecated aliases only kept for backward compatibility.
// TyMem_Del and TyMem_DEL are defined with no parameter to be able to use
// them as function pointers (ex: dealloc = TyMem_Del).
#define TyMem_MALLOC(n)           TyMem_Malloc((n))
#define TyMem_NEW(type, n)        TyMem_New(type, (n))
#define TyMem_REALLOC(p, n)       TyMem_Realloc((p), (n))
#define TyMem_RESIZE(p, type, n)  TyMem_Resize((p), type, (n))
#define TyMem_FREE(p)             TyMem_Free((p))
#define TyMem_Del(p)              TyMem_Free((p))
#define TyMem_DEL(p)              TyMem_Free((p))


#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
// Memory allocator which doesn't require the GIL to be held.
// Usually, it's just a thin wrapper to functions of the standard C library:
// malloc(), calloc(), realloc() and free(). The difference is that
// tracemalloc can track these memory allocations.
PyAPI_FUNC(void *) TyMem_RawMalloc(size_t size);
PyAPI_FUNC(void *) TyMem_RawCalloc(size_t nelem, size_t elsize);
PyAPI_FUNC(void *) TyMem_RawRealloc(void *ptr, size_t new_size);
PyAPI_FUNC(void) TyMem_RawFree(void *ptr);
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_PYMEM_H
#  include "cpython/pymem.h"
#  undef Ty_CPYTHON_PYMEM_H
#endif

#ifdef __cplusplus
}
#endif
#endif   // !Ty_PYMEM_H
