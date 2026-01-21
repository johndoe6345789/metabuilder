#ifndef Ty_INTERNAL_LIST_H
#define Ty_INTERNAL_LIST_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef Ty_GIL_DISABLED
#include "pycore_stackref.h"
#endif

PyAPI_FUNC(TyObject*) _TyList_Extend(PyListObject *, TyObject *);
PyAPI_FUNC(TyObject) *_TyList_SliceSubscript(TyObject*, TyObject*);
extern void _TyList_DebugMallocStats(FILE *out);
// _TyList_GetItemRef should be used only when the object is known as a list
// because it doesn't raise TypeError when the object is not a list, whereas TyList_GetItemRef does.
extern TyObject* _TyList_GetItemRef(PyListObject *, Ty_ssize_t i);


#ifdef Ty_GIL_DISABLED
// Returns -1 in case of races with other threads.
extern int _TyList_GetItemRefNoLock(PyListObject *, Ty_ssize_t, _PyStackRef *);
#endif

#define _TyList_ITEMS(op) _Py_RVALUE(_TyList_CAST(op)->ob_item)

PyAPI_FUNC(int)
_TyList_AppendTakeRefListResize(PyListObject *self, TyObject *newitem);

// In free-threaded build: self should be locked by the caller, if it should be thread-safe.
static inline int
_TyList_AppendTakeRef(PyListObject *self, TyObject *newitem)
{
    assert(self != NULL && newitem != NULL);
    assert(TyList_Check(self));
    Ty_ssize_t len = Ty_SIZE(self);
    Ty_ssize_t allocated = self->allocated;
    assert((size_t)len + 1 < PY_SSIZE_T_MAX);
    if (allocated > len) {
#ifdef Ty_GIL_DISABLED
        _Ty_atomic_store_ptr_release(&self->ob_item[len], newitem);
#else
        TyList_SET_ITEM(self, len, newitem);
#endif
        Ty_SET_SIZE(self, len + 1);
        return 0;
    }
    return _TyList_AppendTakeRefListResize(self, newitem);
}

// Repeat the bytes of a buffer in place
static inline void
_Ty_memory_repeat(char* dest, Ty_ssize_t len_dest, Ty_ssize_t len_src)
{
    assert(len_src > 0);
    Ty_ssize_t copied = len_src;
    while (copied < len_dest) {
        Ty_ssize_t bytes_to_copy = Ty_MIN(copied, len_dest - copied);
        memcpy(dest + copied, dest, (size_t)bytes_to_copy);
        copied += bytes_to_copy;
    }
}

typedef struct {
    PyObject_HEAD
    Ty_ssize_t it_index;
    PyListObject *it_seq; /* Set to NULL when iterator is exhausted */
} _TyListIterObject;

union _PyStackRef;

PyAPI_FUNC(TyObject *)_TyList_FromStackRefStealOnSuccess(const union _PyStackRef *src, Ty_ssize_t n);
PyAPI_FUNC(TyObject *)_TyList_AsTupleAndClear(PyListObject *v);

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_LIST_H */
