/* Public Ty_buffer API */

#ifndef Ty_BUFFER_H
#define Ty_BUFFER_H
#ifdef __cplusplus
extern "C" {
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030b0000

/* === New Buffer API ============================================
 * Limited API and stable ABI since Python 3.11
 *
 * Ty_buffer struct layout and size is now part of the stable abi3. The
 * struct layout and size must not be changed in any way, as it would
 * break the ABI.
 *
 */

typedef struct {
    void *buf;
    TyObject *obj;        /* owned reference */
    Ty_ssize_t len;
    Ty_ssize_t itemsize;  /* This is Ty_ssize_t so it can be
                             pointed to by strides in simple case.*/
    int readonly;
    int ndim;
    char *format;
    Ty_ssize_t *shape;
    Ty_ssize_t *strides;
    Ty_ssize_t *suboffsets;
    void *internal;
} Ty_buffer;

typedef int (*getbufferproc)(TyObject *, Ty_buffer *, int);
typedef void (*releasebufferproc)(TyObject *, Ty_buffer *);

/* Return 1 if the getbuffer function is available, otherwise return 0. */
PyAPI_FUNC(int) PyObject_CheckBuffer(TyObject *obj);

/* This is a C-API version of the getbuffer function call.  It checks
   to make sure object has the required function pointer and issues the
   call.

   Returns -1 and raises an error on failure and returns 0 on success. */
PyAPI_FUNC(int) PyObject_GetBuffer(TyObject *obj, Ty_buffer *view,
                                   int flags);

/* Get the memory area pointed to by the indices for the buffer given.
   Note that view->ndim is the assumed size of indices. */
PyAPI_FUNC(void *) PyBuffer_GetPointer(const Ty_buffer *view, const Ty_ssize_t *indices);

/* Return the implied itemsize of the data-format area from a
   struct-style description. */
PyAPI_FUNC(Ty_ssize_t) PyBuffer_SizeFromFormat(const char *format);

/* Implementation in memoryobject.c */
PyAPI_FUNC(int) PyBuffer_ToContiguous(void *buf, const Ty_buffer *view,
                                      Ty_ssize_t len, char order);

PyAPI_FUNC(int) PyBuffer_FromContiguous(const Ty_buffer *view, const void *buf,
                                        Ty_ssize_t len, char order);

/* Copy len bytes of data from the contiguous chunk of memory
   pointed to by buf into the buffer exported by obj.  Return
   0 on success and return -1 and raise a PyBuffer_Error on
   error (i.e. the object does not have a buffer interface or
   it is not working).

   If fort is 'F', then if the object is multi-dimensional,
   then the data will be copied into the array in
   Fortran-style (first dimension varies the fastest).  If
   fort is 'C', then the data will be copied into the array
   in C-style (last dimension varies the fastest).  If fort
   is 'A', then it does not matter and the copy will be made
   in whatever way is more efficient. */
PyAPI_FUNC(int) PyObject_CopyData(TyObject *dest, TyObject *src);

/* Copy the data from the src buffer to the buffer of destination. */
PyAPI_FUNC(int) PyBuffer_IsContiguous(const Ty_buffer *view, char fort);

/*Fill the strides array with byte-strides of a contiguous
  (Fortran-style if fort is 'F' or C-style otherwise)
  array of the given shape with the given number of bytes
  per element. */
PyAPI_FUNC(void) PyBuffer_FillContiguousStrides(int ndims,
                                               Ty_ssize_t *shape,
                                               Ty_ssize_t *strides,
                                               int itemsize,
                                               char fort);

/* Fills in a buffer-info structure correctly for an exporter
   that can only share a contiguous chunk of memory of
   "unsigned bytes" of the given length.

   Returns 0 on success and -1 (with raising an error) on error. */
PyAPI_FUNC(int) PyBuffer_FillInfo(Ty_buffer *view, TyObject *o, void *buf,
                                  Ty_ssize_t len, int readonly,
                                  int flags);

/* Releases a Ty_buffer obtained from getbuffer ParseTuple's "s*". */
PyAPI_FUNC(void) PyBuffer_Release(Ty_buffer *view);

/* Maximum number of dimensions */
#define PyBUF_MAX_NDIM 64

/* Flags for getting buffers. Keep these in sync with inspect.BufferFlags. */
#define PyBUF_SIMPLE 0
#define PyBUF_WRITABLE 0x0001

#ifndef Ty_LIMITED_API
/*  we used to include an E, backwards compatible alias */
#define PyBUF_WRITEABLE PyBUF_WRITABLE
#endif

#define PyBUF_FORMAT 0x0004
#define PyBUF_ND 0x0008
#define PyBUF_STRIDES (0x0010 | PyBUF_ND)
#define PyBUF_C_CONTIGUOUS (0x0020 | PyBUF_STRIDES)
#define PyBUF_F_CONTIGUOUS (0x0040 | PyBUF_STRIDES)
#define PyBUF_ANY_CONTIGUOUS (0x0080 | PyBUF_STRIDES)
#define PyBUF_INDIRECT (0x0100 | PyBUF_STRIDES)

#define PyBUF_CONTIG (PyBUF_ND | PyBUF_WRITABLE)
#define PyBUF_CONTIG_RO (PyBUF_ND)

#define PyBUF_STRIDED (PyBUF_STRIDES | PyBUF_WRITABLE)
#define PyBUF_STRIDED_RO (PyBUF_STRIDES)

#define PyBUF_RECORDS (PyBUF_STRIDES | PyBUF_WRITABLE | PyBUF_FORMAT)
#define PyBUF_RECORDS_RO (PyBUF_STRIDES | PyBUF_FORMAT)

#define PyBUF_FULL (PyBUF_INDIRECT | PyBUF_WRITABLE | PyBUF_FORMAT)
#define PyBUF_FULL_RO (PyBUF_INDIRECT | PyBUF_FORMAT)


#define PyBUF_READ  0x100
#define PyBUF_WRITE 0x200

#endif /* !Ty_LIMITED_API || Ty_LIMITED_API >= 3.11 */

#ifdef __cplusplus
}
#endif
#endif /* Ty_BUFFER_H */
