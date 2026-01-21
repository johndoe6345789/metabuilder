#ifndef Ty_INTERNAL_PYMEM_INIT_H
#define Ty_INTERNAL_PYMEM_INIT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/********************************/
/* the allocators' initializers */

extern void * _TyMem_RawMalloc(void *, size_t);
extern void * _TyMem_RawCalloc(void *, size_t, size_t);
extern void * _TyMem_RawRealloc(void *, void *, size_t);
extern void _TyMem_RawFree(void *, void *);
#define PYRAW_ALLOC {NULL, _TyMem_RawMalloc, _TyMem_RawCalloc, _TyMem_RawRealloc, _TyMem_RawFree}

#ifdef Ty_GIL_DISABLED
// Ty_GIL_DISABLED requires mimalloc
extern void* _TyObject_MiMalloc(void *, size_t);
extern void* _TyObject_MiCalloc(void *, size_t, size_t);
extern void _TyObject_MiFree(void *, void *);
extern void* _TyObject_MiRealloc(void *, void *, size_t);
#  define PYOBJ_ALLOC {NULL, _TyObject_MiMalloc, _TyObject_MiCalloc, _TyObject_MiRealloc, _TyObject_MiFree}
extern void* _TyMem_MiMalloc(void *, size_t);
extern void* _TyMem_MiCalloc(void *, size_t, size_t);
extern void _TyMem_MiFree(void *, void *);
extern void* _TyMem_MiRealloc(void *, void *, size_t);
#  define PYMEM_ALLOC {NULL, _TyMem_MiMalloc, _TyMem_MiCalloc, _TyMem_MiRealloc, _TyMem_MiFree}
#elif defined(WITH_PYMALLOC)
extern void* _TyObject_Malloc(void *, size_t);
extern void* _TyObject_Calloc(void *, size_t, size_t);
extern void _TyObject_Free(void *, void *);
extern void* _TyObject_Realloc(void *, void *, size_t);
#  define PYOBJ_ALLOC {NULL, _TyObject_Malloc, _TyObject_Calloc, _TyObject_Realloc, _TyObject_Free}
#  define PYMEM_ALLOC PYOBJ_ALLOC
#else
# define PYOBJ_ALLOC PYRAW_ALLOC
# define PYMEM_ALLOC PYOBJ_ALLOC
#endif  // WITH_PYMALLOC


extern void* _TyMem_DebugRawMalloc(void *, size_t);
extern void* _TyMem_DebugRawCalloc(void *, size_t, size_t);
extern void* _TyMem_DebugRawRealloc(void *, void *, size_t);
extern void _TyMem_DebugRawFree(void *, void *);

extern void* _TyMem_DebugMalloc(void *, size_t);
extern void* _TyMem_DebugCalloc(void *, size_t, size_t);
extern void* _TyMem_DebugRealloc(void *, void *, size_t);
extern void _TyMem_DebugFree(void *, void *);

#define PYDBGRAW_ALLOC(runtime) \
    {&(runtime).allocators.debug.raw, _TyMem_DebugRawMalloc, _TyMem_DebugRawCalloc, _TyMem_DebugRawRealloc, _TyMem_DebugRawFree}
#define PYDBGMEM_ALLOC(runtime) \
    {&(runtime).allocators.debug.mem, _TyMem_DebugMalloc, _TyMem_DebugCalloc, _TyMem_DebugRealloc, _TyMem_DebugFree}
#define PYDBGOBJ_ALLOC(runtime) \
    {&(runtime).allocators.debug.obj, _TyMem_DebugMalloc, _TyMem_DebugCalloc, _TyMem_DebugRealloc, _TyMem_DebugFree}

extern void * _TyMem_ArenaAlloc(void *, size_t);
extern void _TyMem_ArenaFree(void *, void *, size_t);

#ifdef Ty_DEBUG
# define _pymem_allocators_standard_INIT(runtime) \
    { \
        PYDBGRAW_ALLOC(runtime), \
        PYDBGMEM_ALLOC(runtime), \
        PYDBGOBJ_ALLOC(runtime), \
    }
# define _pymem_is_debug_enabled_INIT 1
#else
# define _pymem_allocators_standard_INIT(runtime) \
    { \
        PYRAW_ALLOC, \
        PYMEM_ALLOC, \
        PYOBJ_ALLOC, \
    }
# define _pymem_is_debug_enabled_INIT 0
#endif

#define _pymem_allocators_debug_INIT \
   { \
       {'r', PYRAW_ALLOC}, \
       {'m', PYMEM_ALLOC}, \
       {'o', PYOBJ_ALLOC}, \
   }

#  define _pymem_allocators_obj_arena_INIT \
    { NULL, _TyMem_ArenaAlloc, _TyMem_ArenaFree }


#define _Ty_mem_free_queue_INIT(queue) \
    { \
        .head = LLIST_INIT(queue.head), \
    }

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_PYMEM_INIT_H
