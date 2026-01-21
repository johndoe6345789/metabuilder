#ifndef Ty_CPYTHON_DICTOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct _dictkeysobject PyDictKeysObject;
typedef struct _dictvalues PyDictValues;

/* The ma_values pointer is NULL for a combined table
 * or points to an array of TyObject* for a split table
 */
typedef struct {
    PyObject_HEAD

    /* Number of items in the dictionary */
    Ty_ssize_t ma_used;

    /* This is a private field for CPython's internal use.
     * Bits 0-7 are for dict watchers.
     * Bits 8-11 are for the watched mutation counter (used by tier2 optimization)
     * Bits 12-31 are currently unused
     * Bits 32-63 are a unique id in the free threading build (used for per-thread refcounting)
     */
    uint64_t _ma_watcher_tag;

    PyDictKeysObject *ma_keys;

    /* If ma_values is NULL, the table is "combined": keys and values
       are stored in ma_keys.

       If ma_values is not NULL, the table is split:
       keys are stored in ma_keys and values are stored in ma_values */
    PyDictValues *ma_values;
} PyDictObject;

PyAPI_FUNC(TyObject *) _TyDict_GetItem_KnownHash(TyObject *mp, TyObject *key,
                                                 Ty_hash_t hash);
// TyDict_GetItemStringRef() can be used instead
Ty_DEPRECATED(3.14) PyAPI_FUNC(TyObject *) _TyDict_GetItemStringWithError(TyObject *, const char *);
PyAPI_FUNC(TyObject *) TyDict_SetDefault(
    TyObject *mp, TyObject *key, TyObject *defaultobj);

// Inserts `key` with a value `default_value`, if `key` is not already present
// in the dictionary.  If `result` is not NULL, then the value associated
// with `key` is returned in `*result` (either the existing value, or the now
// inserted `default_value`).
// Returns:
//   -1 on error
//    0 if `key` was not present and `default_value` was inserted
//    1 if `key` was present and `default_value` was not inserted
PyAPI_FUNC(int) TyDict_SetDefaultRef(TyObject *mp, TyObject *key, TyObject *default_value, TyObject **result);

/* Get the number of items of a dictionary. */
static inline Ty_ssize_t TyDict_GET_SIZE(TyObject *op) {
    PyDictObject *mp;
    assert(TyDict_Check(op));
    mp = _Py_CAST(PyDictObject*, op);
#ifdef Ty_GIL_DISABLED
    return _Ty_atomic_load_ssize_relaxed(&mp->ma_used);
#else
    return mp->ma_used;
#endif
}
#define TyDict_GET_SIZE(op) TyDict_GET_SIZE(_TyObject_CAST(op))

PyAPI_FUNC(int) TyDict_ContainsString(TyObject *mp, const char *key);

PyAPI_FUNC(TyObject *) _TyDict_NewPresized(Ty_ssize_t minused);

PyAPI_FUNC(int) TyDict_Pop(TyObject *dict, TyObject *key, TyObject **result);
PyAPI_FUNC(int) TyDict_PopString(TyObject *dict, const char *key, TyObject **result);

// Use TyDict_Pop() instead
Ty_DEPRECATED(3.14) PyAPI_FUNC(TyObject *) _TyDict_Pop(
    TyObject *dict,
    TyObject *key,
    TyObject *default_value);

/* Dictionary watchers */

#define PY_FOREACH_DICT_EVENT(V) \
    V(ADDED)                     \
    V(MODIFIED)                  \
    V(DELETED)                   \
    V(CLONED)                    \
    V(CLEARED)                   \
    V(DEALLOCATED)

typedef enum {
    #define PY_DEF_EVENT(EVENT) TyDict_EVENT_##EVENT,
    PY_FOREACH_DICT_EVENT(PY_DEF_EVENT)
    #undef PY_DEF_EVENT
} TyDict_WatchEvent;

// Callback to be invoked when a watched dict is cleared, dealloced, or modified.
// In clear/dealloc case, key and new_value will be NULL. Otherwise, new_value will be the
// new value for key, NULL if key is being deleted.
typedef int(*TyDict_WatchCallback)(TyDict_WatchEvent event, TyObject* dict, TyObject* key, TyObject* new_value);

// Register/unregister a dict-watcher callback
PyAPI_FUNC(int) TyDict_AddWatcher(TyDict_WatchCallback callback);
PyAPI_FUNC(int) TyDict_ClearWatcher(int watcher_id);

// Mark given dictionary as "watched" (callback will be called if it is modified)
PyAPI_FUNC(int) TyDict_Watch(int watcher_id, TyObject* dict);
PyAPI_FUNC(int) TyDict_Unwatch(int watcher_id, TyObject* dict);
