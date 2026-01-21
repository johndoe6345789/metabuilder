#ifndef Ty_INTERNAL_TUPLE_H
#define Ty_INTERNAL_TUPLE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_object.h"        // _TyObject_GC_IS_TRACKED
#include "pycore_structs.h"       // _PyStackRef

extern void _TyTuple_MaybeUntrack(TyObject *);
extern void _TyTuple_DebugMallocStats(FILE *out);

/* runtime lifecycle */

extern TyStatus _TyTuple_InitGlobalObjects(TyInterpreterState *);


/* other API */

#define _TyTuple_ITEMS(op) _Py_RVALUE(_TyTuple_CAST(op)->ob_item)

PyAPI_FUNC(TyObject *)_TyTuple_FromArray(TyObject *const *, Ty_ssize_t);
PyAPI_FUNC(TyObject *)_TyTuple_FromStackRefStealOnSuccess(const union _PyStackRef *, Ty_ssize_t);
PyAPI_FUNC(TyObject *)_TyTuple_FromArraySteal(TyObject *const *, Ty_ssize_t);

typedef struct {
    PyObject_HEAD
    Ty_ssize_t it_index;
    PyTupleObject *it_seq; /* Set to NULL when iterator is exhausted */
} _PyTupleIterObject;

#define _TyTuple_RESET_HASH_CACHE(op)       \
    do {                                    \
        assert(op != NULL);                 \
        _TyTuple_CAST(op)->ob_hash = -1;    \
    } while (0)

/* bpo-42536: If reusing a tuple object, this should be called to re-track it
   with the garbage collector and reset its hash cache. */
static inline void
_TyTuple_Recycle(TyObject *op)
{
    _TyTuple_RESET_HASH_CACHE(op);
    if (!_TyObject_GC_IS_TRACKED(op)) {
        _TyObject_GC_TRACK(op);
    }
}

/* Below are the official constants from the xxHash specification. Optimizing
   compilers should emit a single "rotate" instruction for the
   _TyTuple_HASH_XXROTATE() expansion. If that doesn't happen for some important
   platform, the macro could be changed to expand to a platform-specific rotate
   spelling instead.
*/
#if SIZEOF_PY_UHASH_T > 4
#define _TyTuple_HASH_XXPRIME_1 ((Ty_uhash_t)11400714785074694791ULL)
#define _TyTuple_HASH_XXPRIME_2 ((Ty_uhash_t)14029467366897019727ULL)
#define _TyTuple_HASH_XXPRIME_5 ((Ty_uhash_t)2870177450012600261ULL)
#define _TyTuple_HASH_XXROTATE(x) ((x << 31) | (x >> 33))  /* Rotate left 31 bits */
#else
#define _TyTuple_HASH_XXPRIME_1 ((Ty_uhash_t)2654435761UL)
#define _TyTuple_HASH_XXPRIME_2 ((Ty_uhash_t)2246822519UL)
#define _TyTuple_HASH_XXPRIME_5 ((Ty_uhash_t)374761393UL)
#define _TyTuple_HASH_XXROTATE(x) ((x << 13) | (x >> 19))  /* Rotate left 13 bits */
#endif
#define _TyTuple_HASH_EMPTY (_TyTuple_HASH_XXPRIME_5 + (_TyTuple_HASH_XXPRIME_5 ^ 3527539UL))

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_TUPLE_H */
