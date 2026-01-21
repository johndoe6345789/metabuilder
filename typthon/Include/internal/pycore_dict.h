#ifndef Ty_INTERNAL_DICT_H
#define Ty_INTERNAL_DICT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_object.h"               // PyManagedDictPointer
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_LOAD_SSIZE_ACQUIRE
#include "pycore_stackref.h"             // _PyStackRef
#include "pycore_stats.h"

// Unsafe flavor of TyDict_GetItemWithError(): no error checking
extern TyObject* _TyDict_GetItemWithError(TyObject *dp, TyObject *key);

// Delete an item from a dict if a predicate is true
// Returns -1 on error, 1 if the item was deleted, 0 otherwise
// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyDict_DelItemIf(TyObject *mp, TyObject *key,
                                  int (*predicate)(TyObject *value, void *arg),
                                  void *arg);

// "KnownHash" variants
// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyDict_SetItem_KnownHash(TyObject *mp, TyObject *key,
                                          TyObject *item, Ty_hash_t hash);
// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyDict_DelItem_KnownHash(TyObject *mp, TyObject *key,
                                          Ty_hash_t hash);
extern int _TyDict_Contains_KnownHash(TyObject *, TyObject *, Ty_hash_t);

// "Id" variants
extern TyObject* _TyDict_GetItemIdWithError(TyObject *dp,
                                            _Ty_Identifier *key);
extern int _TyDict_ContainsId(TyObject *, _Ty_Identifier *);
extern int _TyDict_SetItemId(TyObject *dp, _Ty_Identifier *key, TyObject *item);
extern int _TyDict_DelItemId(TyObject *mp, _Ty_Identifier *key);

extern int _TyDict_Next(
    TyObject *mp, Ty_ssize_t *pos, TyObject **key, TyObject **value, Ty_hash_t *hash);

extern int _TyDict_HasOnlyStringKeys(TyObject *mp);

// Export for '_ctypes' shared extension
PyAPI_FUNC(Ty_ssize_t) _TyDict_SizeOf(PyDictObject *);

#define _TyDict_HasSplitTable(d) ((d)->ma_values != NULL)

/* Like TyDict_Merge, but override can be 0, 1 or 2.  If override is 0,
   the first occurrence of a key wins, if override is 1, the last occurrence
   of a key wins, if override is 2, a KeyError with conflicting key as
   argument is raised.
*/
PyAPI_FUNC(int) _TyDict_MergeEx(TyObject *mp, TyObject *other, int override);

extern void _TyDict_DebugMallocStats(FILE *out);


/* _PyDictView */

typedef struct {
    PyObject_HEAD
    PyDictObject *dv_dict;
} _PyDictViewObject;

extern TyObject* _PyDictView_New(TyObject *, TyTypeObject *);
extern TyObject* _PyDictView_Intersect(TyObject* self, TyObject *other);

/* other API */

typedef struct {
    /* Cached hash code of me_key. */
    Ty_hash_t me_hash;
    TyObject *me_key;
    TyObject *me_value; /* This field is only meaningful for combined tables */
} PyDictKeyEntry;

typedef struct {
    TyObject *me_key;   /* The key must be Unicode and have hash. */
    TyObject *me_value; /* This field is only meaningful for combined tables */
} PyDictUnicodeEntry;

extern PyDictKeysObject *_TyDict_NewKeysForClass(PyHeapTypeObject *);
extern TyObject *_TyDict_FromKeys(TyObject *, TyObject *, TyObject *);

/* Gets a version number unique to the current state of the keys of dict, if possible.
 * Returns the version number, or zero if it was not possible to get a version number. */
extern uint32_t _PyDictKeys_GetVersionForCurrentState(
        TyInterpreterState *interp, PyDictKeysObject *dictkeys);

/* Gets a version number unique to the current state of the keys of dict, if possible.
 *
 * In free-threaded builds ensures that the dict can be used for lock-free
 * reads if a version was assigned.
 *
 * The caller must hold the per-object lock on dict.
 *
 * Returns the version number, or zero if it was not possible to get a version number. */
extern uint32_t _TyDict_GetKeysVersionForCurrentState(
        TyInterpreterState *interp, PyDictObject *dict);

extern size_t _TyDict_KeysSize(PyDictKeysObject *keys);

extern void _PyDictKeys_DecRef(PyDictKeysObject *keys);

/* _Ty_dict_lookup() returns index of entry which can be used like DK_ENTRIES(dk)[index].
 * -1 when no entry found, -3 when compare raises error.
 */
extern Ty_ssize_t _Ty_dict_lookup(PyDictObject *mp, TyObject *key, Ty_hash_t hash, TyObject **value_addr);
extern Ty_ssize_t _Ty_dict_lookup_threadsafe(PyDictObject *mp, TyObject *key, Ty_hash_t hash, TyObject **value_addr);
extern Ty_ssize_t _Ty_dict_lookup_threadsafe_stackref(PyDictObject *mp, TyObject *key, Ty_hash_t hash, _PyStackRef *value_addr);

extern Ty_ssize_t _TyDict_LookupIndex(PyDictObject *, TyObject *);
extern Ty_ssize_t _PyDictKeys_StringLookup(PyDictKeysObject* dictkeys, TyObject *key);

/* Look up a string key in an all unicode dict keys, assign the keys object a version, and
 * store it in version.
 *
 * Returns DKIX_ERROR if key is not a string or if the keys object is not all
 * strings.
 *
 * Returns DKIX_EMPTY if the key is not present.
 */
extern Ty_ssize_t _PyDictKeys_StringLookupAndVersion(PyDictKeysObject* dictkeys, TyObject *key, uint32_t *version);
extern Ty_ssize_t _PyDictKeys_StringLookupSplit(PyDictKeysObject* dictkeys, TyObject *key);
PyAPI_FUNC(TyObject *)_TyDict_LoadGlobal(PyDictObject *, PyDictObject *, TyObject *);
PyAPI_FUNC(void) _TyDict_LoadGlobalStackRef(PyDictObject *, PyDictObject *, TyObject *, _PyStackRef *);

// Loads the __builtins__ object from the globals dict. Returns a new reference.
extern TyObject *_TyDict_LoadBuiltinsFromGlobals(TyObject *globals);

/* Consumes references to key and value */
PyAPI_FUNC(int) _TyDict_SetItem_Take2(PyDictObject *op, TyObject *key, TyObject *value);
extern int _TyDict_SetItem_LockHeld(PyDictObject *dict, TyObject *name, TyObject *value);
// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyDict_SetItem_KnownHash_LockHeld(PyDictObject *mp, TyObject *key,
                                                   TyObject *value, Ty_hash_t hash);
// Export for '_asyncio' shared extension
PyAPI_FUNC(int) _TyDict_GetItemRef_KnownHash_LockHeld(PyDictObject *op, TyObject *key, Ty_hash_t hash, TyObject **result);
extern int _TyDict_GetItemRef_KnownHash(PyDictObject *op, TyObject *key, Ty_hash_t hash, TyObject **result);
extern int _TyDict_GetItemRef_Unicode_LockHeld(PyDictObject *op, TyObject *key, TyObject **result);
extern int _PyObjectDict_SetItem(TyTypeObject *tp, TyObject *obj, TyObject **dictptr, TyObject *name, TyObject *value);

extern int _TyDict_Pop_KnownHash(
    PyDictObject *dict,
    TyObject *key,
    Ty_hash_t hash,
    TyObject **result);

extern void _TyDict_Clear_LockHeld(TyObject *op);

#ifdef Ty_GIL_DISABLED
PyAPI_FUNC(void) _TyDict_EnsureSharedOnRead(PyDictObject *mp);
#endif

#define DKIX_EMPTY (-1)
#define DKIX_DUMMY (-2)  /* Used internally */
#define DKIX_ERROR (-3)
#define DKIX_KEY_CHANGED (-4) /* Used internally */

typedef enum {
    DICT_KEYS_GENERAL = 0,
    DICT_KEYS_UNICODE = 1,
    DICT_KEYS_SPLIT = 2
} DictKeysKind;

/* See dictobject.c for actual layout of DictKeysObject */
struct _dictkeysobject {
    Ty_ssize_t dk_refcnt;

    /* Size of the hash table (dk_indices). It must be a power of 2. */
    uint8_t dk_log2_size;

    /* Size of the hash table (dk_indices) by bytes. */
    uint8_t dk_log2_index_bytes;

    /* Kind of keys */
    uint8_t dk_kind;

#ifdef Ty_GIL_DISABLED
    /* Lock used to protect shared keys */
    PyMutex dk_mutex;
#endif

    /* Version number -- Reset to 0 by any modification to keys */
    uint32_t dk_version;

    /* Number of usable entries in dk_entries. */
    Ty_ssize_t dk_usable;

    /* Number of used entries in dk_entries. */
    Ty_ssize_t dk_nentries;


    /* Actual hash table of dk_size entries. It holds indices in dk_entries,
       or DKIX_EMPTY(-1) or DKIX_DUMMY(-2).

       Indices must be: 0 <= indice < USABLE_FRACTION(dk_size).

       The size in bytes of an indice depends on dk_size:

       - 1 byte if dk_size <= 0xff (char*)
       - 2 bytes if dk_size <= 0xffff (int16_t*)
       - 4 bytes if dk_size <= 0xffffffff (int32_t*)
       - 8 bytes otherwise (int64_t*)

       Dynamically sized, SIZEOF_VOID_P is minimum. */
    char dk_indices[];  /* char is required to avoid strict aliasing. */

    /* "PyDictKeyEntry or PyDictUnicodeEntry dk_entries[USABLE_FRACTION(DK_SIZE(dk))];" array follows:
       see the DK_ENTRIES() / DK_UNICODE_ENTRIES() functions below */
};

/* This must be no more than 250, for the prefix size to fit in one byte. */
#define SHARED_KEYS_MAX_SIZE 30
#define NEXT_LOG2_SHARED_KEYS_MAX_SIZE 6

/* Layout of dict values:
 *
 * The TyObject *values are preceded by an array of bytes holding
 * the insertion order and size.
 * [-1] = prefix size. [-2] = used size. size[-2-n...] = insertion order.
 */
struct _dictvalues {
    uint8_t capacity;
    uint8_t size;
    uint8_t embedded;
    uint8_t valid;
    TyObject *values[1];
};

#define DK_LOG_SIZE(dk)  _Py_RVALUE((dk)->dk_log2_size)
#if SIZEOF_VOID_P > 4
#define DK_SIZE(dk)      (((int64_t)1)<<DK_LOG_SIZE(dk))
#else
#define DK_SIZE(dk)      (1<<DK_LOG_SIZE(dk))
#endif

static inline void* _DK_ENTRIES(PyDictKeysObject *dk) {
    int8_t *indices = (int8_t*)(dk->dk_indices);
    size_t index = (size_t)1 << dk->dk_log2_index_bytes;
    return (&indices[index]);
}

static inline PyDictKeyEntry* DK_ENTRIES(PyDictKeysObject *dk) {
    assert(dk->dk_kind == DICT_KEYS_GENERAL);
    return (PyDictKeyEntry*)_DK_ENTRIES(dk);
}
static inline PyDictUnicodeEntry* DK_UNICODE_ENTRIES(PyDictKeysObject *dk) {
    assert(dk->dk_kind != DICT_KEYS_GENERAL);
    return (PyDictUnicodeEntry*)_DK_ENTRIES(dk);
}

#define DK_IS_UNICODE(dk) ((dk)->dk_kind != DICT_KEYS_GENERAL)

#define DICT_VERSION_INCREMENT (1 << (DICT_MAX_WATCHERS + DICT_WATCHED_MUTATION_BITS))
#define DICT_WATCHER_MASK ((1 << DICT_MAX_WATCHERS) - 1)
#define DICT_WATCHER_AND_MODIFICATION_MASK ((1 << (DICT_MAX_WATCHERS + DICT_WATCHED_MUTATION_BITS)) - 1)
#define DICT_UNIQUE_ID_SHIFT (32)
#define DICT_UNIQUE_ID_MAX ((UINT64_C(1) << (64 - DICT_UNIQUE_ID_SHIFT)) - 1)


PyAPI_FUNC(void)
_TyDict_SendEvent(int watcher_bits,
                  TyDict_WatchEvent event,
                  PyDictObject *mp,
                  TyObject *key,
                  TyObject *value);

static inline void
_TyDict_NotifyEvent(TyInterpreterState *interp,
                    TyDict_WatchEvent event,
                    PyDictObject *mp,
                    TyObject *key,
                    TyObject *value)
{
    assert(Ty_REFCNT((TyObject*)mp) > 0);
    int watcher_bits = mp->_ma_watcher_tag & DICT_WATCHER_MASK;
    if (watcher_bits) {
        RARE_EVENT_STAT_INC(watched_dict_modification);
        _TyDict_SendEvent(watcher_bits, event, mp, key, value);
    }
}

extern PyDictObject *_TyObject_MaterializeManagedDict(TyObject *obj);

PyAPI_FUNC(TyObject *)_TyDict_FromItems(
        TyObject *const *keys, Ty_ssize_t keys_offset,
        TyObject *const *values, Ty_ssize_t values_offset,
        Ty_ssize_t length);

static inline uint8_t *
get_insertion_order_array(PyDictValues *values)
{
    return (uint8_t *)&values->values[values->capacity];
}

static inline void
_PyDictValues_AddToInsertionOrder(PyDictValues *values, Ty_ssize_t ix)
{
    assert(ix < SHARED_KEYS_MAX_SIZE);
    int size = values->size;
    uint8_t *array = get_insertion_order_array(values);
    assert(size < values->capacity);
    assert(((uint8_t)ix) == ix);
    array[size] = (uint8_t)ix;
    values->size = size+1;
}

static inline size_t
shared_keys_usable_size(PyDictKeysObject *keys)
{
    // dk_usable will decrease for each instance that is created and each
    // value that is added.  dk_nentries will increase for each value that
    // is added.  We want to always return the right value or larger.
    // We therefore increase dk_nentries first and we decrease dk_usable
    // second, and conversely here we read dk_usable first and dk_entries
    // second (to avoid the case where we read entries before the increment
    // and read usable after the decrement)
    Ty_ssize_t dk_usable = FT_ATOMIC_LOAD_SSIZE_ACQUIRE(keys->dk_usable);
    Ty_ssize_t dk_nentries = FT_ATOMIC_LOAD_SSIZE_ACQUIRE(keys->dk_nentries);
    return dk_nentries + dk_usable;
}

static inline size_t
_PyInlineValuesSize(TyTypeObject *tp)
{
    PyDictKeysObject *keys = ((PyHeapTypeObject*)tp)->ht_cached_keys;
    assert(keys != NULL);
    size_t size = shared_keys_usable_size(keys);
    size_t prefix_size = _Ty_SIZE_ROUND_UP(size, sizeof(TyObject *));
    assert(prefix_size < 256);
    return prefix_size + (size + 1) * sizeof(TyObject *);
}

int
_TyDict_DetachFromObject(PyDictObject *dict, TyObject *obj);

// Enables per-thread ref counting on this dict in the free threading build
extern void _TyDict_EnablePerThreadRefcounting(TyObject *op);

PyDictObject *_TyObject_MaterializeManagedDict_LockHeld(TyObject *);

// See `_Ty_INCREF_TYPE()` in pycore_object.h
#ifndef Ty_GIL_DISABLED
#  define _Ty_INCREF_DICT Ty_INCREF
#  define _Ty_DECREF_DICT Ty_DECREF
#  define _Ty_INCREF_BUILTINS Ty_INCREF
#  define _Ty_DECREF_BUILTINS Ty_DECREF
#else
static inline Ty_ssize_t
_TyDict_UniqueId(PyDictObject *mp)
{
    return (Ty_ssize_t)(mp->_ma_watcher_tag >> DICT_UNIQUE_ID_SHIFT);
}

static inline void
_Ty_INCREF_DICT(TyObject *op)
{
    assert(TyDict_Check(op));
    Ty_ssize_t id = _TyDict_UniqueId((PyDictObject *)op);
    _Ty_THREAD_INCREF_OBJECT(op, id);
}

static inline void
_Ty_DECREF_DICT(TyObject *op)
{
    assert(TyDict_Check(op));
    Ty_ssize_t id = _TyDict_UniqueId((PyDictObject *)op);
    _Ty_THREAD_DECREF_OBJECT(op, id);
}

// Like `_Ty_INCREF_DICT`, but also handles non-dict objects because builtins
// may not be a dict.
static inline void
_Ty_INCREF_BUILTINS(TyObject *op)
{
    if (TyDict_CheckExact(op)) {
        _Ty_INCREF_DICT(op);
    }
    else {
        Ty_INCREF(op);
    }
}

static inline void
_Ty_DECREF_BUILTINS(TyObject *op)
{
    if (TyDict_CheckExact(op)) {
        _Ty_DECREF_DICT(op);
    }
    else {
        Ty_DECREF(op);
    }
}
#endif

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_DICT_H */
