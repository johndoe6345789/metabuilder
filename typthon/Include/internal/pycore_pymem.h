#ifndef Ty_INTERNAL_PYMEM_H
#define Ty_INTERNAL_PYMEM_H

#include "pycore_llist.h"           // struct llist_node

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Try to get the allocators name set by _TyMem_SetupAllocators().
// Return NULL if unknown.
// Export for '_testinternalcapi' shared extension.
PyAPI_FUNC(const char*) _TyMem_GetCurrentAllocatorName(void);

// strdup() using TyMem_RawMalloc()
extern char* _TyMem_RawStrdup(const char *str);

// strdup() using TyMem_Malloc().
// Export for '_pickle ' shared extension.
PyAPI_FUNC(char*) _TyMem_Strdup(const char *str);

// wcsdup() using TyMem_RawMalloc()
extern wchar_t* _TyMem_RawWcsdup(const wchar_t *str);

/* Special bytes broadcast into debug memory blocks at appropriate times.
   Strings of these are unlikely to be valid addresses, floats, ints or
   7-bit ASCII.

   - PYMEM_CLEANBYTE: clean (newly allocated) memory
   - PYMEM_DEADBYTE dead (newly freed) memory
   - PYMEM_FORBIDDENBYTE: untouchable bytes at each end of a block

   Byte patterns 0xCB, 0xDB and 0xFB have been replaced with 0xCD, 0xDD and
   0xFD to use the same values as Windows CRT debug malloc() and free().
   If modified, _TyMem_IsPtrFreed() should be updated as well. */
#define PYMEM_CLEANBYTE      0xCD
#define PYMEM_DEADBYTE       0xDD
#define PYMEM_FORBIDDENBYTE  0xFD

/* Heuristic checking if a pointer value is newly allocated
   (uninitialized), newly freed or NULL (is equal to zero).

   The pointer is not dereferenced, only the pointer value is checked.

   The heuristic relies on the debug hooks on Python memory allocators which
   fills newly allocated memory with CLEANBYTE (0xCD) and newly freed memory
   with DEADBYTE (0xDD). Detect also "untouchable bytes" marked
   with FORBIDDENBYTE (0xFD). */
static inline int _TyMem_IsPtrFreed(const void *ptr)
{
    uintptr_t value = (uintptr_t)ptr;
#if SIZEOF_VOID_P == 8
    return (value == 0
            || value == (uintptr_t)0xCDCDCDCDCDCDCDCD
            || value == (uintptr_t)0xDDDDDDDDDDDDDDDD
            || value == (uintptr_t)0xFDFDFDFDFDFDFDFD);
#elif SIZEOF_VOID_P == 4
    return (value == 0
            || value == (uintptr_t)0xCDCDCDCD
            || value == (uintptr_t)0xDDDDDDDD
            || value == (uintptr_t)0xFDFDFDFD);
#else
#  error "unknown pointer size"
#endif
}

extern int _TyMem_GetAllocatorName(
    const char *name,
    PyMemAllocatorName *allocator);

/* Configure the Python memory allocators.
   Pass PYMEM_ALLOCATOR_DEFAULT to use default allocators.
   PYMEM_ALLOCATOR_NOT_SET does nothing. */
extern int _TyMem_SetupAllocators(PyMemAllocatorName allocator);

// Default raw memory allocator that is not affected by TyMem_SetAllocator()
extern void *_TyMem_DefaultRawMalloc(size_t);
extern void *_TyMem_DefaultRawCalloc(size_t, size_t);
extern void *_TyMem_DefaultRawRealloc(void *, size_t);
extern void _TyMem_DefaultRawFree(void *);
extern wchar_t *_TyMem_DefaultRawWcsdup(const wchar_t *str);

/* Is the debug allocator enabled? */
extern int _TyMem_DebugEnabled(void);

// Enqueue a pointer to be freed possibly after some delay.
extern void _TyMem_FreeDelayed(void *ptr, size_t size);

// Enqueue an object to be freed possibly after some delay
#ifdef Ty_GIL_DISABLED
PyAPI_FUNC(void) _TyObject_XDecRefDelayed(TyObject *obj);
#else
static inline void _TyObject_XDecRefDelayed(TyObject *obj)
{
    Ty_XDECREF(obj);
}
#endif

// Periodically process delayed free requests.
extern void _TyMem_ProcessDelayed(TyThreadState *tstate);

// Periodically process delayed free requests when the world is stopped.
// Notify of any objects whic should be freeed.
typedef void (*delayed_dealloc_cb)(TyObject *, void *);
extern void _TyMem_ProcessDelayedNoDealloc(TyThreadState *tstate,
                                           delayed_dealloc_cb cb, void *state);

// Abandon all thread-local delayed free requests and push them to the
// interpreter's queue.
extern void _TyMem_AbandonDelayed(TyThreadState *tstate);

// On interpreter shutdown, frees all delayed free requests.
extern void _TyMem_FiniDelayed(TyInterpreterState *interp);

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_PYMEM_H
