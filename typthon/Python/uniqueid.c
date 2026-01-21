#include "Python.h"

#include "pycore_dict.h"        // _TyDict_UniqueId()
#include "pycore_lock.h"        // PyMutex_LockFlags()
#include "pycore_pystate.h"     // _TyThreadState_GET()
#include "pycore_object.h"      // _Ty_IncRefTotal
#include "pycore_uniqueid.h"

// This contains code for allocating unique ids for per-thread reference
// counting and re-using those ids when an object is deallocated.
//
// Currently, per-thread reference counting is only used for heap types.
//
// See Include/internal/pycore_uniqueid.h for more details.

#ifdef Ty_GIL_DISABLED

#define POOL_MIN_SIZE 8

#define LOCK_POOL(pool) PyMutex_LockFlags(&pool->mutex, _Ty_LOCK_DONT_DETACH)
#define UNLOCK_POOL(pool) PyMutex_Unlock(&pool->mutex)

static int
resize_interp_type_id_pool(struct _Ty_unique_id_pool *pool)
{
    if ((size_t)pool->size > PY_SSIZE_T_MAX / (2 * sizeof(*pool->table))) {
        return -1;
    }

    Ty_ssize_t new_size = pool->size * 2;
    if (new_size < POOL_MIN_SIZE) {
        new_size = POOL_MIN_SIZE;
    }

    _Ty_unique_id_entry *table = TyMem_Realloc(pool->table,
                                               new_size * sizeof(*pool->table));
    if (table == NULL) {
        return -1;
    }

    Ty_ssize_t start = pool->size;
    for (Ty_ssize_t i = start; i < new_size - 1; i++) {
        table[i].next = &table[i + 1];
    }
    table[new_size - 1].next = NULL;

    pool->table = table;
    pool->freelist = &table[start];
    _Ty_atomic_store_ssize(&pool->size, new_size);
    return 0;
}

static int
resize_local_refcounts(_PyThreadStateImpl *tstate)
{
    if (tstate->refcounts.is_finalized) {
        return -1;
    }

    struct _Ty_unique_id_pool *pool = &tstate->base.interp->unique_ids;
    Ty_ssize_t size = _Ty_atomic_load_ssize(&pool->size);

    Ty_ssize_t *refcnts = TyMem_Realloc(tstate->refcounts.values,
                                        size * sizeof(Ty_ssize_t));
    if (refcnts == NULL) {
        return -1;
    }

    Ty_ssize_t old_size = tstate->refcounts.size;
    if (old_size < size) {
       memset(refcnts + old_size, 0, (size - old_size) * sizeof(Ty_ssize_t));
    }

    tstate->refcounts.values = refcnts;
    tstate->refcounts.size = size;
    return 0;
}

Ty_ssize_t
_TyObject_AssignUniqueId(TyObject *obj)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _Ty_unique_id_pool *pool = &interp->unique_ids;

    LOCK_POOL(pool);
    if (pool->freelist == NULL) {
        if (resize_interp_type_id_pool(pool) < 0) {
            UNLOCK_POOL(pool);
            return _Ty_INVALID_UNIQUE_ID;
        }
    }

    _Ty_unique_id_entry *entry = pool->freelist;
    pool->freelist = entry->next;
    entry->obj = obj;
    _TyObject_SetDeferredRefcount(obj);
    // The unique id is one plus the index of the entry in the table.
    Ty_ssize_t unique_id = (entry - pool->table) + 1;
    assert(unique_id > 0);
    UNLOCK_POOL(pool);
    return unique_id;
}

void
_TyObject_ReleaseUniqueId(Ty_ssize_t unique_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _Ty_unique_id_pool *pool = &interp->unique_ids;

    LOCK_POOL(pool);
    assert(unique_id > 0 && unique_id <= pool->size);
    Ty_ssize_t idx = unique_id - 1;
    _Ty_unique_id_entry *entry = &pool->table[idx];
    entry->next = pool->freelist;
    pool->freelist = entry;
    UNLOCK_POOL(pool);
}

static Ty_ssize_t
clear_unique_id(TyObject *obj)
{
    Ty_ssize_t id = _Ty_INVALID_UNIQUE_ID;
    if (TyType_Check(obj)) {
        if (TyType_HasFeature((TyTypeObject *)obj, Ty_TPFLAGS_HEAPTYPE)) {
            PyHeapTypeObject *ht = (PyHeapTypeObject *)obj;
            id = ht->unique_id;
            ht->unique_id = _Ty_INVALID_UNIQUE_ID;
        }
    }
    else if (TyCode_Check(obj)) {
        PyCodeObject *co = (PyCodeObject *)obj;
        id = co->_co_unique_id;
        co->_co_unique_id = _Ty_INVALID_UNIQUE_ID;
    }
    else if (TyDict_Check(obj)) {
        PyDictObject *mp = (PyDictObject *)obj;
        id = _TyDict_UniqueId(mp);
        mp->_ma_watcher_tag &= ~(UINT64_MAX << DICT_UNIQUE_ID_SHIFT);
    }
    return id;
}

void
_TyObject_DisablePerThreadRefcounting(TyObject *obj)
{
    Ty_ssize_t id = clear_unique_id(obj);
    if (id != _Ty_INVALID_UNIQUE_ID) {
        _TyObject_ReleaseUniqueId(id);
    }
}

void
_TyObject_ThreadIncrefSlow(TyObject *obj, size_t idx)
{
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
    if (((Ty_ssize_t)idx) < 0 || resize_local_refcounts(tstate) < 0) {
        // just incref the object directly.
        Ty_INCREF(obj);
        return;
    }

    assert(idx < (size_t)tstate->refcounts.size);
    tstate->refcounts.values[idx]++;
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal((TyThreadState *)tstate);
#endif
    _Ty_INCREF_STAT_INC();
}

void
_TyObject_MergePerThreadRefcounts(_PyThreadStateImpl *tstate)
{
    if (tstate->refcounts.values == NULL) {
        return;
    }

    struct _Ty_unique_id_pool *pool = &tstate->base.interp->unique_ids;

    LOCK_POOL(pool);
    for (Ty_ssize_t i = 0, n = tstate->refcounts.size; i < n; i++) {
        Ty_ssize_t refcnt = tstate->refcounts.values[i];
        if (refcnt != 0) {
            TyObject *obj = pool->table[i].obj;
            _Ty_atomic_add_ssize(&obj->ob_ref_shared,
                                 refcnt << _Ty_REF_SHARED_SHIFT);
            tstate->refcounts.values[i] = 0;
        }
    }
    UNLOCK_POOL(pool);
}

void
_TyObject_FinalizePerThreadRefcounts(_PyThreadStateImpl *tstate)
{
    _TyObject_MergePerThreadRefcounts(tstate);

    TyMem_Free(tstate->refcounts.values);
    tstate->refcounts.values = NULL;
    tstate->refcounts.size = 0;
    tstate->refcounts.is_finalized = 1;
}

void
_TyObject_FinalizeUniqueIdPool(TyInterpreterState *interp)
{
    struct _Ty_unique_id_pool *pool = &interp->unique_ids;

    // First, set the free-list to NULL values
    while (pool->freelist) {
        _Ty_unique_id_entry *next = pool->freelist->next;
        pool->freelist->obj = NULL;
        pool->freelist = next;
    }

    // Now everything non-NULL is a object. Clear their unique ids as the
    // object outlives the interpreter.
    for (Ty_ssize_t i = 0; i < pool->size; i++) {
        TyObject *obj = pool->table[i].obj;
        pool->table[i].obj = NULL;
        if (obj != NULL) {
            Ty_ssize_t id = clear_unique_id(obj);
            (void)id;
            assert(id == i + 1);
        }
    }
    TyMem_Free(pool->table);
    pool->table = NULL;
    pool->freelist = NULL;
    pool->size = 0;
}

#endif   /* Ty_GIL_DISABLED */
