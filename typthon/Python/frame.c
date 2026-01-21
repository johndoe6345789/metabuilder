#define _PY_INTERPRETER

#include "Python.h"
#include "pycore_frame.h"         // _TyFrame_New_NoTrack()
#include "pycore_interpframe.h"   // _TyFrame_GetCode()
#include "pycore_genobject.h"     // _TyGen_GetGeneratorFromFrame()
#include "pycore_stackref.h"      // _Ty_VISIT_STACKREF()


int
_TyFrame_Traverse(_PyInterpreterFrame *frame, visitproc visit, void *arg)
{
    Ty_VISIT(frame->frame_obj);
    Ty_VISIT(frame->f_locals);
    _Ty_VISIT_STACKREF(frame->f_funcobj);
    _Ty_VISIT_STACKREF(frame->f_executable);
    return _TyGC_VisitFrameStack(frame, visit, arg);
}

PyFrameObject *
_TyFrame_MakeAndSetFrameObject(_PyInterpreterFrame *frame)
{
    assert(frame->frame_obj == NULL);
    TyObject *exc = TyErr_GetRaisedException();

    PyFrameObject *f = _TyFrame_New_NoTrack(_TyFrame_GetCode(frame));
    if (f == NULL) {
        Ty_XDECREF(exc);
        return NULL;
    }
    TyErr_SetRaisedException(exc);

    // GH-97002: There was a time when a frame object could be created when we
    // are allocating the new frame object f above, so frame->frame_obj would
    // be assigned already. That path does not exist anymore. We won't call any
    // Python code in this function and garbage collection will not run.
    // Notice that _TyFrame_New_NoTrack() can potentially raise a MemoryError,
    // but it won't allocate a traceback until the frame unwinds, so we are safe
    // here.
    assert(frame->frame_obj == NULL);
    assert(frame->owner != FRAME_OWNED_BY_FRAME_OBJECT);
    f->f_frame = frame;
    frame->frame_obj = f;
    return f;
}

static void
take_ownership(PyFrameObject *f, _PyInterpreterFrame *frame)
{
    Ty_BEGIN_CRITICAL_SECTION(f);
    assert(frame->owner < FRAME_OWNED_BY_INTERPRETER);
    assert(frame->owner != FRAME_OWNED_BY_FRAME_OBJECT);
    _PyInterpreterFrame *new_frame = (_PyInterpreterFrame *)f->_f_frame_data;
    _TyFrame_Copy(frame, new_frame);
    // _TyFrame_Copy takes the reference to the executable,
    // so we need to restore it.
    frame->f_executable = PyStackRef_DUP(new_frame->f_executable);
    f->f_frame = new_frame;
    new_frame->owner = FRAME_OWNED_BY_FRAME_OBJECT;
    if (_TyFrame_IsIncomplete(new_frame)) {
        // This may be a newly-created generator or coroutine frame. Since it's
        // dead anyways, just pretend that the first RESUME ran:
        PyCodeObject *code = _TyFrame_GetCode(new_frame);
        new_frame->instr_ptr =
            _TyFrame_GetBytecode(new_frame) + code->_co_firsttraceable + 1;
    }
    assert(!_TyFrame_IsIncomplete(new_frame));
    assert(f->f_back == NULL);
    _PyInterpreterFrame *prev = _TyFrame_GetFirstComplete(frame->previous);
    if (prev) {
        assert(prev->owner < FRAME_OWNED_BY_INTERPRETER);
        TyObject *exc = TyErr_GetRaisedException();
        /* Link PyFrameObjects.f_back and remove link through _PyInterpreterFrame.previous */
        PyFrameObject *back = _TyFrame_GetFrameObject(prev);
        if (back == NULL) {
            /* Memory error here. */
            assert(TyErr_ExceptionMatches(TyExc_MemoryError));
            /* Nothing we can do about it */
            TyErr_Clear();
        }
        else {
            f->f_back = (PyFrameObject *)Ty_NewRef(back);
        }
        TyErr_SetRaisedException(exc);
    }
    if (!_TyObject_GC_IS_TRACKED((TyObject *)f)) {
        _TyObject_GC_TRACK((TyObject *)f);
    }
    Ty_END_CRITICAL_SECTION();
}

void
_TyFrame_ClearLocals(_PyInterpreterFrame *frame)
{
    assert(frame->stackpointer != NULL);
    _PyStackRef *sp = frame->stackpointer;
    _PyStackRef *locals = frame->localsplus;
    frame->stackpointer = locals;
    while (sp > locals) {
        sp--;
        PyStackRef_XCLOSE(*sp);
    }
    Ty_CLEAR(frame->f_locals);
}

void
_TyFrame_ClearExceptCode(_PyInterpreterFrame *frame)
{
    /* It is the responsibility of the owning generator/coroutine
     * to have cleared the enclosing generator, if any. */
    assert(frame->owner != FRAME_OWNED_BY_GENERATOR ||
        _TyGen_GetGeneratorFromFrame(frame)->gi_frame_state == FRAME_CLEARED);
    // GH-99729: Clearing this frame can expose the stack (via finalizers). It's
    // crucial that this frame has been unlinked, and is no longer visible:
    assert(_TyThreadState_GET()->current_frame != frame);
    if (frame->frame_obj) {
        PyFrameObject *f = frame->frame_obj;
        frame->frame_obj = NULL;
        if (!_TyObject_IsUniquelyReferenced((TyObject *)f)) {
            take_ownership(f, frame);
            Ty_DECREF(f);
            return;
        }
        Ty_DECREF(f);
    }
    _TyFrame_ClearLocals(frame);
    PyStackRef_CLEAR(frame->f_funcobj);
}

/* Unstable API functions */

TyObject *
PyUnstable_InterpreterFrame_GetCode(struct _PyInterpreterFrame *frame)
{
    return PyStackRef_AsPyObjectNew(frame->f_executable);
}

int
PyUnstable_InterpreterFrame_GetLasti(struct _PyInterpreterFrame *frame)
{
    return _PyInterpreterFrame_LASTI(frame) * sizeof(_Ty_CODEUNIT);
}

// NOTE: We allow racy accesses to the instruction pointer from other threads
// for sys._current_frames() and similar APIs.
int _Ty_NO_SANITIZE_THREAD
PyUnstable_InterpreterFrame_GetLine(_PyInterpreterFrame *frame)
{
    int addr = _PyInterpreterFrame_LASTI(frame) * sizeof(_Ty_CODEUNIT);
    return TyCode_Addr2Line(_TyFrame_GetCode(frame), addr);
}

const TyTypeObject *const PyUnstable_ExecutableKinds[PyUnstable_EXECUTABLE_KINDS+1] = {
    [PyUnstable_EXECUTABLE_KIND_SKIP] = &_PyNone_Type,
    [PyUnstable_EXECUTABLE_KIND_PY_FUNCTION] = &TyCode_Type,
    [PyUnstable_EXECUTABLE_KIND_BUILTIN_FUNCTION] = &TyMethod_Type,
    [PyUnstable_EXECUTABLE_KIND_METHOD_DESCRIPTOR] = &PyMethodDescr_Type,
    [PyUnstable_EXECUTABLE_KINDS] = NULL,
};
