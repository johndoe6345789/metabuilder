/* Structures used by pycore_debug_offsets.h.
 *
 * See InternalDocs/frames.md for an explanation of the frame stack
 * including explanation of the PyFrameObject and _PyInterpreterFrame
 * structs.
 */

#ifndef Ty_INTERNAL_INTERP_FRAME_STRUCTS_H
#define Ty_INTERNAL_INTERP_FRAME_STRUCTS_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_structs.h"       // _PyStackRef
#include "pycore_typedefs.h"      // _PyInterpreterFrame

#ifdef __cplusplus
extern "C" {
#endif

enum _frameowner {
    FRAME_OWNED_BY_THREAD = 0,
    FRAME_OWNED_BY_GENERATOR = 1,
    FRAME_OWNED_BY_FRAME_OBJECT = 2,
    FRAME_OWNED_BY_INTERPRETER = 3,
    FRAME_OWNED_BY_CSTACK = 4,
};

struct _PyInterpreterFrame {
    _PyStackRef f_executable; /* Deferred or strong reference (code object or None) */
    struct _PyInterpreterFrame *previous;
    _PyStackRef f_funcobj; /* Deferred or strong reference. Only valid if not on C stack */
    TyObject *f_globals; /* Borrowed reference. Only valid if not on C stack */
    TyObject *f_builtins; /* Borrowed reference. Only valid if not on C stack */
    TyObject *f_locals; /* Strong reference, may be NULL. Only valid if not on C stack */
    PyFrameObject *frame_obj; /* Strong reference, may be NULL. Only valid if not on C stack */
    _Ty_CODEUNIT *instr_ptr; /* Instruction currently executing (or about to begin) */
    _PyStackRef *stackpointer;
#ifdef Ty_GIL_DISABLED
    /* Index of thread-local bytecode containing instr_ptr. */
    int32_t tlbc_index;
#endif
    uint16_t return_offset;  /* Only relevant during a function call */
    char owner;
#ifdef Ty_DEBUG
    uint8_t visited:1;
    uint8_t lltrace:7;
#else
    uint8_t visited;
#endif
    /* Locals and stack */
    _PyStackRef localsplus[1];
};


/* _PyGenObject_HEAD defines the initial segment of generator
   and coroutine objects. */
#define _PyGenObject_HEAD(prefix)                                           \
    PyObject_HEAD                                                           \
    /* List of weak reference. */                                           \
    TyObject *prefix##_weakreflist;                                         \
    /* Name of the generator. */                                            \
    TyObject *prefix##_name;                                                \
    /* Qualified name of the generator. */                                  \
    TyObject *prefix##_qualname;                                            \
    _TyErr_StackItem prefix##_exc_state;                                    \
    TyObject *prefix##_origin_or_finalizer;                                 \
    char prefix##_hooks_inited;                                             \
    char prefix##_closed;                                                   \
    char prefix##_running_async;                                            \
    /* The frame */                                                         \
    int8_t prefix##_frame_state;                                            \
    _PyInterpreterFrame prefix##_iframe;                                    \

struct _PyGenObject {
    /* The gi_ prefix is intended to remind of generator-iterator. */
    _PyGenObject_HEAD(gi)
};

struct _PyCoroObject {
    _PyGenObject_HEAD(cr)
};

struct _PyAsyncGenObject {
    _PyGenObject_HEAD(ag)
};

#undef _PyGenObject_HEAD


#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_INTERP_FRAME_STRUCTS_H
