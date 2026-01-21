#ifndef Ty_CPYTHON_MEMORYOBJECT_H
#  error "this header file must not be included directly"
#endif

/* The structs are declared here so that macros can work, but they shouldn't
   be considered public. Don't access their fields directly, use the macros
   and functions instead! */
#define _Ty_MANAGED_BUFFER_RELEASED    0x001  /* access to exporter blocked */
#define _Ty_MANAGED_BUFFER_FREE_FORMAT 0x002  /* free format */

typedef struct {
    PyObject_HEAD
    int flags;          /* state flags */
    Ty_ssize_t exports; /* number of direct memoryview exports */
    Ty_buffer master; /* snapshot buffer obtained from the original exporter */
} _PyManagedBufferObject;


/* memoryview state flags */
#define _Ty_MEMORYVIEW_RELEASED    0x001  /* access to master buffer blocked */
#define _Ty_MEMORYVIEW_C           0x002  /* C-contiguous layout */
#define _Ty_MEMORYVIEW_FORTRAN     0x004  /* Fortran contiguous layout */
#define _Ty_MEMORYVIEW_SCALAR      0x008  /* scalar: ndim = 0 */
#define _Ty_MEMORYVIEW_PIL         0x010  /* PIL-style layout */
#define _Ty_MEMORYVIEW_RESTRICTED  0x020  /* Disallow new references to the memoryview's buffer */

typedef struct {
    PyObject_VAR_HEAD
    _PyManagedBufferObject *mbuf; /* managed buffer */
    Ty_hash_t hash;               /* hash value for read-only views */
    int flags;                    /* state flags */
    Ty_ssize_t exports;           /* number of buffer re-exports */
    Ty_buffer view;               /* private copy of the exporter's view */
    TyObject *weakreflist;
    Ty_ssize_t ob_array[1];       /* shape, strides, suboffsets */
} PyMemoryViewObject;

#define _PyMemoryView_CAST(op) _Py_CAST(PyMemoryViewObject*, op)

/* Get a pointer to the memoryview's private copy of the exporter's buffer. */
static inline Ty_buffer* TyMemoryView_GET_BUFFER(TyObject *op) {
    return (&_PyMemoryView_CAST(op)->view);
}
#define TyMemoryView_GET_BUFFER(op) TyMemoryView_GET_BUFFER(_TyObject_CAST(op))

/* Get a pointer to the exporting object (this may be NULL!). */
static inline TyObject* TyMemoryView_GET_BASE(TyObject *op) {
    return _PyMemoryView_CAST(op)->view.obj;
}
#define TyMemoryView_GET_BASE(op) TyMemoryView_GET_BASE(_TyObject_CAST(op))
