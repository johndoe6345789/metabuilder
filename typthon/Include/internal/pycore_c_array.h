#ifndef Ty_INTERNAL_C_ARRAY_H
#define Ty_INTERNAL_C_ARRAY_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/* Utility for a number of growing arrays */

typedef struct {
    void *array;              /* pointer to the array */
    int allocated_entries;    /* pointer to the capacity of the array */
    size_t item_size;         /* size of each element */
    int initial_num_entries;  /* initial allocation size */
} _Ty_c_array_t;


int _Ty_CArray_Init(_Ty_c_array_t* array, int item_size, int initial_num_entries);
void _Ty_CArray_Fini(_Ty_c_array_t* array);

/* If idx is out of bounds:
 * If arr->array is NULL, allocate arr->initial_num_entries slots.
 * Otherwise, double its size.
 *
 * Return 0 if successful and -1 (with exception set) otherwise.
 */
int _Ty_CArray_EnsureCapacity(_Ty_c_array_t *c_array, int idx);


#ifdef __cplusplus
}
#endif

#endif /* !Ty_INTERNAL_C_ARRAY_H */
