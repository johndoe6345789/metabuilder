#ifndef Ty_INTERNAL_FREELIST_STATE_H
#define Ty_INTERNAL_FREELIST_STATE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#  define TyTuple_MAXSAVESIZE 20     // Largest tuple to save on freelist
#  define Ty_tuple_MAXFREELIST 2000  // Maximum number of tuples of each size to save
#  define Ty_lists_MAXFREELIST 80
#  define Ty_list_iters_MAXFREELIST 10
#  define Ty_tuple_iters_MAXFREELIST 10
#  define Ty_dicts_MAXFREELIST 80
#  define Ty_dictkeys_MAXFREELIST 80
#  define Ty_floats_MAXFREELIST 100
#  define Ty_ints_MAXFREELIST 100
#  define Ty_slices_MAXFREELIST 1
#  define Ty_ranges_MAXFREELIST 6
#  define Ty_range_iters_MAXFREELIST 6
#  define Ty_contexts_MAXFREELIST 255
#  define Ty_async_gens_MAXFREELIST 80
#  define Ty_async_gen_asends_MAXFREELIST 80
#  define Ty_futureiters_MAXFREELIST 255
#  define Ty_object_stack_chunks_MAXFREELIST 4
#  define Ty_unicode_writers_MAXFREELIST 1
#  define Ty_pycfunctionobject_MAXFREELIST 16
#  define Ty_pycmethodobject_MAXFREELIST 16
#  define Ty_pymethodobjects_MAXFREELIST 20

// A generic freelist of either PyObjects or other data structures.
struct _Ty_freelist {
    // Entries are linked together using the first word of the object.
    // For PyObjects, this overlaps with the `ob_refcnt` field or the `ob_tid`
    // field.
    void *freelist;

    // The number of items in the free list or -1 if the free list is disabled
    Ty_ssize_t size;
};

struct _Ty_freelists {
    struct _Ty_freelist floats;
    struct _Ty_freelist ints;
    struct _Ty_freelist tuples[TyTuple_MAXSAVESIZE];
    struct _Ty_freelist lists;
    struct _Ty_freelist list_iters;
    struct _Ty_freelist tuple_iters;
    struct _Ty_freelist dicts;
    struct _Ty_freelist dictkeys;
    struct _Ty_freelist slices;
    struct _Ty_freelist ranges;
    struct _Ty_freelist range_iters;
    struct _Ty_freelist contexts;
    struct _Ty_freelist async_gens;
    struct _Ty_freelist async_gen_asends;
    struct _Ty_freelist futureiters;
    struct _Ty_freelist object_stack_chunks;
    struct _Ty_freelist unicode_writers;
    struct _Ty_freelist pycfunctionobject;
    struct _Ty_freelist pycmethodobject;
    struct _Ty_freelist pymethodobjects;
};

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_FREELIST_STATE_H */
