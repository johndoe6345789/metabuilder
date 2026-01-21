#ifndef Ty_INTERNAL_INTERP_FRAME_H
#define Ty_INTERNAL_INTERP_FRAME_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_code.h"          // _TyCode_CODE()
#include "pycore_interpframe_structs.h" // _PyInterpreterFrame
#include "pycore_stackref.h"      // PyStackRef_AsPyObjectBorrow()
#include "pycore_stats.h"         // CALL_STAT_INC()

#ifdef __cplusplus
extern "C" {
#endif

#define _PyInterpreterFrame_LASTI(IF) \
    ((int)((IF)->instr_ptr - _TyFrame_GetBytecode((IF))))

static inline PyCodeObject *_TyFrame_GetCode(_PyInterpreterFrame *f) {
    assert(!PyStackRef_IsNull(f->f_executable));
    TyObject *executable = PyStackRef_AsPyObjectBorrow(f->f_executable);
    assert(TyCode_Check(executable));
    return (PyCodeObject *)executable;
}

static inline _Ty_CODEUNIT *
_TyFrame_GetBytecode(_PyInterpreterFrame *f)
{
#ifdef Ty_GIL_DISABLED
    PyCodeObject *co = _TyFrame_GetCode(f);
    _PyCodeArray *tlbc = _TyCode_GetTLBCArray(co);
    assert(f->tlbc_index >= 0 && f->tlbc_index < tlbc->size);
    return (_Ty_CODEUNIT *)tlbc->entries[f->tlbc_index];
#else
    return _TyCode_CODE(_TyFrame_GetCode(f));
#endif
}

static inline PyFunctionObject *_TyFrame_GetFunction(_PyInterpreterFrame *f) {
    TyObject *func = PyStackRef_AsPyObjectBorrow(f->f_funcobj);
    assert(TyFunction_Check(func));
    return (PyFunctionObject *)func;
}

static inline _PyStackRef *_TyFrame_Stackbase(_PyInterpreterFrame *f) {
    return (f->localsplus + _TyFrame_GetCode(f)->co_nlocalsplus);
}

static inline _PyStackRef _TyFrame_StackPeek(_PyInterpreterFrame *f) {
    assert(f->stackpointer >  f->localsplus + _TyFrame_GetCode(f)->co_nlocalsplus);
    assert(!PyStackRef_IsNull(f->stackpointer[-1]));
    return f->stackpointer[-1];
}

static inline _PyStackRef _TyFrame_StackPop(_PyInterpreterFrame *f) {
    assert(f->stackpointer >  f->localsplus + _TyFrame_GetCode(f)->co_nlocalsplus);
    f->stackpointer--;
    return *f->stackpointer;
}

static inline void _TyFrame_StackPush(_PyInterpreterFrame *f, _PyStackRef value) {
    *f->stackpointer = value;
    f->stackpointer++;
}

#define FRAME_SPECIALS_SIZE ((int)((sizeof(_PyInterpreterFrame)-1)/sizeof(TyObject *)))

static inline int
_TyFrame_NumSlotsForCodeObject(PyCodeObject *code)
{
    /* This function needs to remain in sync with the calculation of
     * co_framesize in Tools/build/deepfreeze.py */
    assert(code->co_framesize >= FRAME_SPECIALS_SIZE);
    return code->co_framesize - FRAME_SPECIALS_SIZE;
}

static inline void _TyFrame_Copy(_PyInterpreterFrame *src, _PyInterpreterFrame *dest)
{
    dest->f_executable = PyStackRef_MakeHeapSafe(src->f_executable);
    // Don't leave a dangling pointer to the old frame when creating generators
    // and coroutines:
    dest->previous = NULL;
    dest->f_funcobj = PyStackRef_MakeHeapSafe(src->f_funcobj);
    dest->f_globals = src->f_globals;
    dest->f_builtins = src->f_builtins;
    dest->f_locals = src->f_locals;
    dest->frame_obj = src->frame_obj;
    dest->instr_ptr = src->instr_ptr;
#ifdef Ty_GIL_DISABLED
    dest->tlbc_index = src->tlbc_index;
#endif
    assert(src->stackpointer != NULL);
    int stacktop = (int)(src->stackpointer - src->localsplus);
    assert(stacktop >= 0);
    dest->stackpointer = dest->localsplus + stacktop;
    for (int i = 0; i < stacktop; i++) {
        dest->localsplus[i] = PyStackRef_MakeHeapSafe(src->localsplus[i]);
    }
}

#ifdef Ty_GIL_DISABLED
static inline void
_TyFrame_InitializeTLBC(TyThreadState *tstate, _PyInterpreterFrame *frame,
                        PyCodeObject *code)
{
    _Ty_CODEUNIT *tlbc = _TyCode_GetTLBCFast(tstate, code);
    if (tlbc == NULL) {
        // No thread-local bytecode exists for this thread yet; use the main
        // thread's copy, deferring thread-local bytecode creation to the
        // execution of RESUME.
        frame->instr_ptr = _TyCode_CODE(code);
        frame->tlbc_index = 0;
    }
    else {
        frame->instr_ptr = tlbc;
        frame->tlbc_index = ((_PyThreadStateImpl *)tstate)->tlbc_index;
    }
}
#endif

/* Consumes reference to func and locals.
   Does not initialize frame->previous, which happens
   when frame is linked into the frame stack.
 */
static inline void
_TyFrame_Initialize(
    TyThreadState *tstate, _PyInterpreterFrame *frame, _PyStackRef func,
    TyObject *locals, PyCodeObject *code, int null_locals_from, _PyInterpreterFrame *previous)
{
    frame->previous = previous;
    frame->f_funcobj = func;
    frame->f_executable = PyStackRef_FromPyObjectNew(code);
    PyFunctionObject *func_obj = (PyFunctionObject *)PyStackRef_AsPyObjectBorrow(func);
    frame->f_builtins = func_obj->func_builtins;
    frame->f_globals = func_obj->func_globals;
    frame->f_locals = locals;
    frame->stackpointer = frame->localsplus + code->co_nlocalsplus;
    frame->frame_obj = NULL;
#ifdef Ty_GIL_DISABLED
    _TyFrame_InitializeTLBC(tstate, frame, code);
#else
    (void)tstate;
    frame->instr_ptr = _TyCode_CODE(code);
#endif
    frame->return_offset = 0;
    frame->owner = FRAME_OWNED_BY_THREAD;
    frame->visited = 0;
#ifdef Ty_DEBUG
    frame->lltrace = 0;
#endif

    for (int i = null_locals_from; i < code->co_nlocalsplus; i++) {
        frame->localsplus[i] = PyStackRef_NULL;
    }
}

/* Gets the pointer to the locals array
 * that precedes this frame.
 */
static inline _PyStackRef*
_TyFrame_GetLocalsArray(_PyInterpreterFrame *frame)
{
    return frame->localsplus;
}

// Fetches the stack pointer, and (on debug builds) sets stackpointer to NULL.
// Having stackpointer == NULL makes it easier to catch missing stack pointer
// spills/restores (which could expose invalid values to the GC) using asserts.
static inline _PyStackRef*
_TyFrame_GetStackPointer(_PyInterpreterFrame *frame)
{
    assert(frame->stackpointer != NULL);
    _PyStackRef *sp = frame->stackpointer;
#ifndef NDEBUG
    frame->stackpointer = NULL;
#endif
    return sp;
}

static inline void
_TyFrame_SetStackPointer(_PyInterpreterFrame *frame, _PyStackRef *stack_pointer)
{
    assert(frame->stackpointer == NULL);
    frame->stackpointer = stack_pointer;
}

/* Determine whether a frame is incomplete.
 * A frame is incomplete if it is part way through
 * creating cell objects or a generator or coroutine.
 *
 * Frames on the frame stack are incomplete until the
 * first RESUME instruction.
 * Frames owned by a generator are always complete.
 *
 * NOTE: We allow racy accesses to the instruction pointer
 * from other threads for sys._current_frames() and similar APIs.
 */
static inline bool _Ty_NO_SANITIZE_THREAD
_TyFrame_IsIncomplete(_PyInterpreterFrame *frame)
{
    if (frame->owner >= FRAME_OWNED_BY_INTERPRETER) {
        return true;
    }
    return frame->owner != FRAME_OWNED_BY_GENERATOR &&
           frame->instr_ptr < _TyFrame_GetBytecode(frame) +
                                  _TyFrame_GetCode(frame)->_co_firsttraceable;
}

static inline _PyInterpreterFrame *
_TyFrame_GetFirstComplete(_PyInterpreterFrame *frame)
{
    while (frame && _TyFrame_IsIncomplete(frame)) {
        frame = frame->previous;
    }
    return frame;
}

static inline _PyInterpreterFrame *
_TyThreadState_GetFrame(TyThreadState *tstate)
{
    return _TyFrame_GetFirstComplete(tstate->current_frame);
}

/* For use by _TyFrame_GetFrameObject
  Do not call directly. */
PyFrameObject *
_TyFrame_MakeAndSetFrameObject(_PyInterpreterFrame *frame);

/* Gets the PyFrameObject for this frame, lazily
 * creating it if necessary.
 * Returns a borrowed reference */
static inline PyFrameObject *
_TyFrame_GetFrameObject(_PyInterpreterFrame *frame)
{

    assert(!_TyFrame_IsIncomplete(frame));
    PyFrameObject *res =  frame->frame_obj;
    if (res != NULL) {
        return res;
    }
    return _TyFrame_MakeAndSetFrameObject(frame);
}

void
_TyFrame_ClearLocals(_PyInterpreterFrame *frame);

/* Clears all references in the frame.
 * If take is non-zero, then the _PyInterpreterFrame frame
 * may be transferred to the frame object it references
 * instead of being cleared. Either way
 * the caller no longer owns the references
 * in the frame.
 * take should  be set to 1 for heap allocated
 * frames like the ones in generators and coroutines.
 */
void
_TyFrame_ClearExceptCode(_PyInterpreterFrame * frame);

int
_TyFrame_Traverse(_PyInterpreterFrame *frame, visitproc visit, void *arg);

bool
_TyFrame_HasHiddenLocals(_PyInterpreterFrame *frame);

TyObject *
_TyFrame_GetLocals(_PyInterpreterFrame *frame);

static inline bool
_TyThreadState_HasStackSpace(TyThreadState *tstate, int size)
{
    assert(
        (tstate->datastack_top == NULL && tstate->datastack_limit == NULL)
        ||
        (tstate->datastack_top != NULL && tstate->datastack_limit != NULL)
    );
    return tstate->datastack_top != NULL &&
        size < tstate->datastack_limit - tstate->datastack_top;
}

extern _PyInterpreterFrame *
_TyThreadState_PushFrame(TyThreadState *tstate, size_t size);

PyAPI_FUNC(void) _TyThreadState_PopFrame(TyThreadState *tstate, _PyInterpreterFrame *frame);

/* Pushes a frame without checking for space.
 * Must be guarded by _TyThreadState_HasStackSpace()
 * Consumes reference to func. */
static inline _PyInterpreterFrame *
_TyFrame_PushUnchecked(TyThreadState *tstate, _PyStackRef func, int null_locals_from, _PyInterpreterFrame * previous)
{
    CALL_STAT_INC(frames_pushed);
    PyFunctionObject *func_obj = (PyFunctionObject *)PyStackRef_AsPyObjectBorrow(func);
    PyCodeObject *code = (PyCodeObject *)func_obj->func_code;
    _PyInterpreterFrame *new_frame = (_PyInterpreterFrame *)tstate->datastack_top;
    tstate->datastack_top += code->co_framesize;
    assert(tstate->datastack_top < tstate->datastack_limit);
    _TyFrame_Initialize(tstate, new_frame, func, NULL, code, null_locals_from,
                        previous);
    return new_frame;
}

/* Pushes a trampoline frame without checking for space.
 * Must be guarded by _TyThreadState_HasStackSpace() */
static inline _PyInterpreterFrame *
_TyFrame_PushTrampolineUnchecked(TyThreadState *tstate, PyCodeObject *code, int stackdepth, _PyInterpreterFrame * previous)
{
    CALL_STAT_INC(frames_pushed);
    _PyInterpreterFrame *frame = (_PyInterpreterFrame *)tstate->datastack_top;
    tstate->datastack_top += code->co_framesize;
    assert(tstate->datastack_top < tstate->datastack_limit);
    frame->previous = previous;
    frame->f_funcobj = PyStackRef_None;
    frame->f_executable = PyStackRef_FromPyObjectNew(code);
#ifdef Ty_DEBUG
    frame->f_builtins = NULL;
    frame->f_globals = NULL;
#endif
    frame->f_locals = NULL;
    assert(stackdepth <= code->co_stacksize);
    frame->stackpointer = frame->localsplus + code->co_nlocalsplus + stackdepth;
    frame->frame_obj = NULL;
#ifdef Ty_GIL_DISABLED
    _TyFrame_InitializeTLBC(tstate, frame, code);
#else
    frame->instr_ptr = _TyCode_CODE(code);
#endif
    frame->owner = FRAME_OWNED_BY_THREAD;
    frame->visited = 0;
#ifdef Ty_DEBUG
    frame->lltrace = 0;
#endif
    frame->return_offset = 0;
    return frame;
}

PyAPI_FUNC(_PyInterpreterFrame *)
_PyEvalFramePushAndInit(TyThreadState *tstate, _PyStackRef func,
                        TyObject *locals, _PyStackRef const *args,
                        size_t argcount, TyObject *kwnames,
                        _PyInterpreterFrame *previous);

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_INTERP_FRAME_H
