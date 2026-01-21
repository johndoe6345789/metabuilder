#ifndef Ty_INTERNAL_HASHTABLE_H
#define Ty_INTERNAL_HASHTABLE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

/* Single linked list */

typedef struct _Ty_slist_item_s {
    struct _Ty_slist_item_s *next;
} _Ty_slist_item_t;

typedef struct {
    _Ty_slist_item_t *head;
} _Ty_slist_t;

#define _Ty_SLIST_ITEM_NEXT(ITEM) _Py_RVALUE(((_Ty_slist_item_t *)(ITEM))->next)

#define _Ty_SLIST_HEAD(SLIST) _Py_RVALUE(((_Ty_slist_t *)(SLIST))->head)


/* _Ty_hashtable: table entry */

typedef struct {
    /* used by _Ty_hashtable_t.buckets to link entries */
    _Ty_slist_item_t _Ty_slist_item;

    Ty_uhash_t key_hash;
    void *key;
    void *value;
} _Ty_hashtable_entry_t;


/* _Ty_hashtable: prototypes */

/* Forward declaration */
struct _Ty_hashtable_t;
typedef struct _Ty_hashtable_t _Ty_hashtable_t;

typedef Ty_uhash_t (*_Ty_hashtable_hash_func) (const void *key);
typedef int (*_Ty_hashtable_compare_func) (const void *key1, const void *key2);
typedef void (*_Ty_hashtable_destroy_func) (void *key);
typedef _Ty_hashtable_entry_t* (*_Ty_hashtable_get_entry_func)(_Ty_hashtable_t *ht,
                                                               const void *key);

typedef struct {
    // Allocate a memory block
    void* (*malloc) (size_t size);

    // Release a memory block
    void (*free) (void *ptr);
} _Ty_hashtable_allocator_t;


/* _Ty_hashtable: table */
struct _Ty_hashtable_t {
    size_t nentries; // Total number of entries in the table
    size_t nbuckets;
    _Ty_slist_t *buckets;

    _Ty_hashtable_get_entry_func get_entry_func;
    _Ty_hashtable_hash_func hash_func;
    _Ty_hashtable_compare_func compare_func;
    _Ty_hashtable_destroy_func key_destroy_func;
    _Ty_hashtable_destroy_func value_destroy_func;
    _Ty_hashtable_allocator_t alloc;
};

// Export _Ty_hashtable functions for '_testinternalcapi' shared extension
PyAPI_FUNC(_Ty_hashtable_t *) _Ty_hashtable_new(
    _Ty_hashtable_hash_func hash_func,
    _Ty_hashtable_compare_func compare_func);

/* Hash a pointer (void*) */
PyAPI_FUNC(Ty_uhash_t) _Ty_hashtable_hash_ptr(const void *key);

/* Comparison using memcmp() */
PyAPI_FUNC(int) _Ty_hashtable_compare_direct(
    const void *key1,
    const void *key2);

PyAPI_FUNC(_Ty_hashtable_t *) _Ty_hashtable_new_full(
    _Ty_hashtable_hash_func hash_func,
    _Ty_hashtable_compare_func compare_func,
    _Ty_hashtable_destroy_func key_destroy_func,
    _Ty_hashtable_destroy_func value_destroy_func,
    _Ty_hashtable_allocator_t *allocator);

PyAPI_FUNC(void) _Ty_hashtable_destroy(_Ty_hashtable_t *ht);

PyAPI_FUNC(void) _Ty_hashtable_clear(_Ty_hashtable_t *ht);

typedef int (*_Ty_hashtable_foreach_func) (_Ty_hashtable_t *ht,
                                           const void *key, const void *value,
                                           void *user_data);

/* Call func() on each entry of the hashtable.
   Iteration stops if func() result is non-zero, in this case it's the result
   of the call. Otherwise, the function returns 0. */
PyAPI_FUNC(int) _Ty_hashtable_foreach(
    _Ty_hashtable_t *ht,
    _Ty_hashtable_foreach_func func,
    void *user_data);

PyAPI_FUNC(size_t) _Ty_hashtable_size(const _Ty_hashtable_t *ht);
PyAPI_FUNC(size_t) _Ty_hashtable_len(const _Ty_hashtable_t *ht);

/* Add a new entry to the hash. The key must not be present in the hash table.
   Return 0 on success, -1 on memory error. */
PyAPI_FUNC(int) _Ty_hashtable_set(
    _Ty_hashtable_t *ht,
    const void *key,
    void *value);


/* Get an entry.
   Return NULL if the key does not exist. */
static inline _Ty_hashtable_entry_t *
_Ty_hashtable_get_entry(_Ty_hashtable_t *ht, const void *key)
{
    return ht->get_entry_func(ht, key);
}


/* Get value from an entry.
   Return NULL if the entry is not found.

   Use _Ty_hashtable_get_entry() to distinguish entry value equal to NULL
   and entry not found. */
PyAPI_FUNC(void*) _Ty_hashtable_get(_Ty_hashtable_t *ht, const void *key);


/* Remove a key and its associated value without calling key and value destroy
   functions.

   Return the removed value if the key was found.
   Return NULL if the key was not found. */
PyAPI_FUNC(void*) _Ty_hashtable_steal(
    _Ty_hashtable_t *ht,
    const void *key);


#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_HASHTABLE_H */
