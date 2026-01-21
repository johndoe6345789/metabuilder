// An arena-like memory interface for the compiler.

#ifndef Ty_INTERNAL_PYARENA_H
#define Ty_INTERNAL_PYARENA_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

typedef struct _arena PyArena;

// _TyArena_New() and _TyArena_Free() create a new arena and free it,
// respectively.  Once an arena has been created, it can be used
// to allocate memory via _TyArena_Malloc().  Pointers to TyObject can
// also be registered with the arena via _TyArena_AddPyObject(), and the
// arena will ensure that the PyObjects stay alive at least until
// _TyArena_Free() is called.  When an arena is freed, all the memory it
// allocated is freed, the arena releases internal references to registered
// TyObject*, and none of its pointers are valid.
// XXX (tim) What does "none of its pointers are valid" mean?  Does it
// XXX mean that pointers previously obtained via _TyArena_Malloc() are
// XXX no longer valid?  (That's clearly true, but not sure that's what
// XXX the text is trying to say.)
//
// _TyArena_New() returns an arena pointer.  On error, it
// returns a negative number and sets an exception.
// XXX (tim):  Not true.  On error, _TyArena_New() actually returns NULL,
// XXX and looks like it may or may not set an exception (e.g., if the
// XXX internal TyList_New(0) returns NULL, _TyArena_New() passes that on
// XXX and an exception is set; OTOH, if the internal
// XXX block_new(DEFAULT_BLOCK_SIZE) returns NULL, that's passed on but
// XXX an exception is not set in that case).
//
// Export for test_peg_generator
PyAPI_FUNC(PyArena*) _TyArena_New(void);

// Export for test_peg_generator
PyAPI_FUNC(void) _TyArena_Free(PyArena *);

// Mostly like malloc(), return the address of a block of memory spanning
// `size` bytes, or return NULL (without setting an exception) if enough
// new memory can't be obtained.  Unlike malloc(0), _TyArena_Malloc() with
// size=0 does not guarantee to return a unique pointer (the pointer
// returned may equal one or more other pointers obtained from
// _TyArena_Malloc()).
// Note that pointers obtained via _TyArena_Malloc() must never be passed to
// the system free() or realloc(), or to any of Python's similar memory-
// management functions.  _TyArena_Malloc()-obtained pointers remain valid
// until _TyArena_Free(ar) is called, at which point all pointers obtained
// from the arena `ar` become invalid simultaneously.
//
// Export for test_peg_generator
PyAPI_FUNC(void*) _TyArena_Malloc(PyArena *, size_t size);

// This routine isn't a proper arena allocation routine.  It takes
// a TyObject* and records it so that it can be DECREFed when the
// arena is freed.
//
// Export for test_peg_generator
PyAPI_FUNC(int) _TyArena_AddPyObject(PyArena *, TyObject *);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PYARENA_H */
