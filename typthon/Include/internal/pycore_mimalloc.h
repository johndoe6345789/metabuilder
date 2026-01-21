#ifndef Ty_INTERNAL_MIMALLOC_H
#define Ty_INTERNAL_MIMALLOC_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#if defined(MIMALLOC_H) || defined(MIMALLOC_TYPES_H)
#  error "pycore_mimalloc.h must be included before mimalloc.h"
#endif

typedef enum {
    _Ty_MIMALLOC_HEAP_MEM = 0,      // TyMem_Malloc() and friends
    _Ty_MIMALLOC_HEAP_OBJECT = 1,   // non-GC objects
    _Ty_MIMALLOC_HEAP_GC = 2,       // GC objects without pre-header
    _Ty_MIMALLOC_HEAP_GC_PRE = 3,   // GC objects with pre-header
    _Ty_MIMALLOC_HEAP_COUNT
} _Ty_mimalloc_heap_id;

#include "pycore_pymem.h"

#ifdef WITH_MIMALLOC
#  ifdef Ty_GIL_DISABLED
#    define MI_PRIM_THREAD_ID   _Ty_ThreadId
#  endif
#  define MI_DEBUG_UNINIT     PYMEM_CLEANBYTE
#  define MI_DEBUG_FREED      PYMEM_DEADBYTE
#  define MI_DEBUG_PADDING    PYMEM_FORBIDDENBYTE
#ifdef Ty_DEBUG
#  define MI_DEBUG 2
#else
#  define MI_DEBUG 0
#endif

#ifdef _Ty_THREAD_SANITIZER
#  define MI_TSAN 1
#endif

#ifdef __cplusplus
extern "C++" {
#endif

#include "mimalloc/mimalloc.h"
#include "mimalloc/mimalloc/types.h"
#include "mimalloc/mimalloc/internal.h"

#ifdef __cplusplus
}
#endif

#endif

#ifdef Ty_GIL_DISABLED
struct _mimalloc_interp_state {
    // When exiting, threads place any segments with live blocks in this
    // shared pool for other threads to claim and reuse.
    mi_abandoned_pool_t abandoned_pool;
};

struct _mimalloc_thread_state {
    mi_heap_t *current_object_heap;
    mi_heap_t heaps[_Ty_MIMALLOC_HEAP_COUNT];
    mi_tld_t tld;
    int initialized;
    struct llist_node page_list;
};
#endif

#endif // Ty_INTERNAL_MIMALLOC_H
