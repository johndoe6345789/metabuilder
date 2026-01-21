/* Support for legacy tracing on top of PEP 669 instrumentation
 * Provides callables to forward PEP 669 events to legacy events.
 */

#include "Python.h"
#include "pycore_audit.h"         // _TySys_Audit()
#include "pycore_ceval.h"         // export _TyEval_SetProfile()
#include "pycore_frame.h"         // PyFrameObject members
#include "pycore_interpframe.h"   // _TyFrame_GetCode()

#include "opcode.h"
#include <stddef.h>


typedef struct _PyLegacyEventHandler {
    PyObject_HEAD
    vectorcallfunc vectorcall;
    int event;
} _PyLegacyEventHandler;

#define _PyLegacyEventHandler_CAST(op)  ((_PyLegacyEventHandler *)(op))

#ifdef Ty_GIL_DISABLED
#define LOCK_SETUP()    PyMutex_Lock(&_PyRuntime.ceval.sys_trace_profile_mutex);
#define UNLOCK_SETUP()  PyMutex_Unlock(&_PyRuntime.ceval.sys_trace_profile_mutex);
#else
#define LOCK_SETUP()
#define UNLOCK_SETUP()
#endif
/* The Ty_tracefunc function expects the following arguments:
 *   obj: the trace object (TyObject *)
 *   frame: the current frame (PyFrameObject *)
 *   kind: the kind of event, see PyTrace_XXX #defines (int)
 *   arg: The arg (a TyObject *)
 */

static TyObject *
call_profile_func(_PyLegacyEventHandler *self, TyObject *arg)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate->c_profilefunc == NULL) {
        Py_RETURN_NONE;
    }
    PyFrameObject *frame = TyEval_GetFrame();
    if (frame == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Missing frame when calling profile function.");
        return NULL;
    }
    Ty_INCREF(frame);
    int err = tstate->c_profilefunc(tstate->c_profileobj, frame, self->event, arg);
    Ty_DECREF(frame);
    if (err) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
sys_profile_start(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 2);
    return call_profile_func(self, Ty_None);
}

static TyObject *
sys_profile_throw(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    return call_profile_func(self, Ty_None);
}

static TyObject *
sys_profile_return(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    return call_profile_func(self, args[2]);
}

static TyObject *
sys_profile_unwind(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
     _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
   return call_profile_func(self, NULL);
}

static TyObject *
sys_profile_call_or_return(
    TyObject *op, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(op);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 4);
    TyObject *callable = args[2];
    if (PyCFunction_Check(callable)) {
        return call_profile_func(self, callable);
    }
    if (Ty_TYPE(callable) == &PyMethodDescr_Type) {
        TyObject *self_arg = args[3];
        /* For backwards compatibility need to
         * convert to builtin method */

        /* If no arg, skip */
        if (self_arg == &_PyInstrumentation_MISSING) {
            Py_RETURN_NONE;
        }
        TyObject *meth = Ty_TYPE(callable)->tp_descr_get(
            callable, self_arg, (TyObject*)Ty_TYPE(self_arg));
        if (meth == NULL) {
            return NULL;
        }
        TyObject *res =  call_profile_func(self, meth);
        Ty_DECREF(meth);
        return res;
    }
    Py_RETURN_NONE;
}

int
_TyEval_SetOpcodeTrace(
    PyFrameObject *frame,
    bool enable
) {
    assert(frame != NULL);

    PyCodeObject *code = _TyFrame_GetCode(frame->f_frame);
    _PyMonitoringEventSet events = 0;

    if (_PyMonitoring_GetLocalEvents(code, PY_MONITORING_SYS_TRACE_ID, &events) < 0) {
        return -1;
    }

    if (enable) {
        if (events & (1 << PY_MONITORING_EVENT_INSTRUCTION)) {
            return 0;
        }
        events |= (1 << PY_MONITORING_EVENT_INSTRUCTION);
    } else {
        if (!(events & (1 << PY_MONITORING_EVENT_INSTRUCTION))) {
            return 0;
        }
        events &= (~(1 << PY_MONITORING_EVENT_INSTRUCTION));
    }
    return _PyMonitoring_SetLocalEvents(code, PY_MONITORING_SYS_TRACE_ID, events);
}

static TyObject *
call_trace_func(_PyLegacyEventHandler *self, TyObject *arg)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate->c_tracefunc == NULL) {
        Py_RETURN_NONE;
    }
    PyFrameObject *frame = TyEval_GetFrame();
    if (frame == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Missing frame when calling trace function.");
        return NULL;
    }
    if (frame->f_trace_opcodes) {
        if (_TyEval_SetOpcodeTrace(frame, true) != 0) {
            return NULL;
        }
    }

    Ty_INCREF(frame);
    int err = tstate->c_tracefunc(tstate->c_traceobj, frame, self->event, arg);
    frame->f_lineno = 0;
    Ty_DECREF(frame);
    if (err) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
sys_trace_exception_func(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    TyObject *exc = args[2];
    assert(PyExceptionInstance_Check(exc));
    TyObject *type = (TyObject *)Ty_TYPE(exc);
    TyObject *tb = PyException_GetTraceback(exc);
    if (tb == NULL) {
        tb = Ty_NewRef(Ty_None);
    }
    TyObject *tuple = TyTuple_Pack(3, type, exc, tb);
    Ty_DECREF(tb);
    if (tuple == NULL) {
        return NULL;
    }
    TyObject *res = call_trace_func(self, tuple);
    Ty_DECREF(tuple);
    return res;
}

static TyObject *
sys_trace_start(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 2);
    return call_trace_func(self, Ty_None);
}

static TyObject *
sys_trace_throw(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    return call_trace_func(self, Ty_None);
}

static TyObject *
sys_trace_unwind(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    return call_trace_func(self, NULL);
}

static TyObject *
sys_trace_return(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(!TyErr_Occurred());
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    assert(TyCode_Check(args[0]));
    TyObject *val = args[2];
    TyObject *res = call_trace_func(self, val);
    return res;
}

static TyObject *
sys_trace_yield(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 3);
    return call_trace_func(self, args[2]);
}

static TyObject *
sys_trace_instruction_func(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    assert(PyVectorcall_NARGS(nargsf) == 2);
    PyFrameObject *frame = TyEval_GetFrame();
    if (frame == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Missing frame when calling trace function.");
        return NULL;
    }
    TyThreadState *tstate = _TyThreadState_GET();
    if (!tstate->c_tracefunc || !frame->f_trace_opcodes) {
        if (_TyEval_SetOpcodeTrace(frame, false) != 0) {
            return NULL;
        }
        Py_RETURN_NONE;
    }
    Ty_INCREF(frame);
    int err = tstate->c_tracefunc(tstate->c_traceobj, frame, self->event, Ty_None);
    frame->f_lineno = 0;
    Ty_DECREF(frame);
    if (err) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
trace_line(
    TyThreadState *tstate, _PyLegacyEventHandler *self,
    PyFrameObject *frame, int line
) {
    if (!frame->f_trace_lines) {
        Py_RETURN_NONE;
    }
    if (line < 0) {
        Py_RETURN_NONE;
    }
    Ty_INCREF(frame);
    frame->f_lineno = line;
    int err = tstate->c_tracefunc(tstate->c_traceobj, frame, self->event, Ty_None);
    frame->f_lineno = 0;
    Ty_DECREF(frame);
    if (err) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
sys_trace_line_func(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate->c_tracefunc == NULL) {
        Py_RETURN_NONE;
    }
    assert(PyVectorcall_NARGS(nargsf) == 2);
    int line = TyLong_AsInt(args[1]);
    assert(line >= 0);
    PyFrameObject *frame = TyEval_GetFrame();
    if (frame == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Missing frame when calling trace function.");
        return NULL;
    }
    assert(args[0] == (TyObject *)_TyFrame_GetCode(frame->f_frame));
    return trace_line(tstate, self, frame, line);
}

/* sys.settrace generates line events for all backward
 * edges, even if on the same line.
 * Handle that case here */
static TyObject *
sys_trace_jump_func(
    TyObject *callable, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyEventHandler *self = _PyLegacyEventHandler_CAST(callable);
    assert(kwnames == NULL);
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate->c_tracefunc == NULL) {
        Py_RETURN_NONE;
    }
    assert(PyVectorcall_NARGS(nargsf) == 3);
    int from = TyLong_AsInt(args[1])/sizeof(_Ty_CODEUNIT);
    assert(from >= 0);
    int to = TyLong_AsInt(args[2])/sizeof(_Ty_CODEUNIT);
    assert(to >= 0);
    if (to > from) {
        /* Forward jump */
        return &_PyInstrumentation_DISABLE;
    }
    PyCodeObject *code = (PyCodeObject *)args[0];
    assert(TyCode_Check(code));
    /* We can call _Ty_Instrumentation_GetLine because we always set
    * line events for tracing */
    int to_line = _Ty_Instrumentation_GetLine(code, to);
    int from_line = _Ty_Instrumentation_GetLine(code, from);
    if (to_line != from_line) {
        /* Will be handled by target INSTRUMENTED_LINE */
        return &_PyInstrumentation_DISABLE;
    }
    PyFrameObject *frame = TyEval_GetFrame();
    if (frame == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Missing frame when calling trace function.");
        return NULL;
    }
    if (!frame->f_trace_lines) {
        Py_RETURN_NONE;
    }
    return trace_line(tstate, self, frame, to_line);
}

TyTypeObject _PyLegacyEventHandler_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "sys.legacy_event_handler",
    sizeof(_PyLegacyEventHandler),
    .tp_vectorcall_offset = offsetof(_PyLegacyEventHandler, vectorcall),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
        Ty_TPFLAGS_HAVE_VECTORCALL | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    .tp_call = PyVectorcall_Call,
};

static int
set_callbacks(int tool, vectorcallfunc vectorcall, int legacy_event, int event1, int event2)
{
    _PyLegacyEventHandler *callback =
        PyObject_NEW(_PyLegacyEventHandler, &_PyLegacyEventHandler_Type);
    if (callback == NULL) {
        return -1;
    }
    callback->vectorcall = vectorcall;
    callback->event = legacy_event;
    Ty_XDECREF(_PyMonitoring_RegisterCallback(tool, event1, (TyObject *)callback));
    if (event2 >= 0) {
        Ty_XDECREF(_PyMonitoring_RegisterCallback(tool, event2, (TyObject *)callback));
    }
    Ty_DECREF(callback);
    return 0;
}

#ifndef NDEBUG
/* Ensure that tstate is valid: sanity check for TyEval_AcquireThread() and
   TyEval_RestoreThread(). Detect if tstate memory was freed. It can happen
   when a thread continues to run after Python finalization, especially
   daemon threads. */
static int
is_tstate_valid(TyThreadState *tstate)
{
    assert(!_TyMem_IsPtrFreed(tstate));
    assert(!_TyMem_IsPtrFreed(tstate->interp));
    return 1;
}
#endif

static Ty_ssize_t
setup_profile(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg, TyObject **old_profileobj)
{
    *old_profileobj = NULL;
    /* Setup PEP 669 monitoring callbacks and events. */
    if (!tstate->interp->sys_profile_initialized) {
        tstate->interp->sys_profile_initialized = true;
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_start, PyTrace_CALL,
                          PY_MONITORING_EVENT_PY_START,
                          PY_MONITORING_EVENT_PY_RESUME)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_throw, PyTrace_CALL,
                          PY_MONITORING_EVENT_PY_THROW, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_return, PyTrace_RETURN,
                          PY_MONITORING_EVENT_PY_RETURN,
                          PY_MONITORING_EVENT_PY_YIELD)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_unwind, PyTrace_RETURN,
                          PY_MONITORING_EVENT_PY_UNWIND, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_call_or_return, PyTrace_C_CALL,
                          PY_MONITORING_EVENT_CALL, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_call_or_return, PyTrace_C_RETURN,
                          PY_MONITORING_EVENT_C_RETURN, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_PROFILE_ID,
                          sys_profile_call_or_return, PyTrace_C_EXCEPTION,
                          PY_MONITORING_EVENT_C_RAISE, -1)) {
            return -1;
        }
    }

    int delta = (func != NULL) - (tstate->c_profilefunc != NULL);
    tstate->c_profilefunc = func;
    *old_profileobj = tstate->c_profileobj;
    tstate->c_profileobj = Ty_XNewRef(arg);
    tstate->interp->sys_profiling_threads += delta;
    assert(tstate->interp->sys_profiling_threads >= 0);
    return tstate->interp->sys_profiling_threads;
}

int
_TyEval_SetProfile(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg)
{
    assert(is_tstate_valid(tstate));
    /* The caller must hold a thread state */
    _Ty_AssertHoldsTstate();

    /* Call _TySys_Audit() in the context of the current thread state,
       even if tstate is not the current thread state. */
    TyThreadState *current_tstate = _TyThreadState_GET();
    if (_TySys_Audit(current_tstate, "sys.setprofile", NULL) < 0) {
        return -1;
    }

    // needs to be decref'd outside of the lock
    TyObject *old_profileobj;
    LOCK_SETUP();
    Ty_ssize_t profiling_threads = setup_profile(tstate, func, arg, &old_profileobj);
    UNLOCK_SETUP();
    Ty_XDECREF(old_profileobj);

    uint32_t events = 0;
    if (profiling_threads) {
        events =
            (1 << PY_MONITORING_EVENT_PY_START) | (1 << PY_MONITORING_EVENT_PY_RESUME) |
            (1 << PY_MONITORING_EVENT_PY_RETURN) | (1 << PY_MONITORING_EVENT_PY_YIELD) |
            (1 << PY_MONITORING_EVENT_CALL) | (1 << PY_MONITORING_EVENT_PY_UNWIND) |
            (1 << PY_MONITORING_EVENT_PY_THROW);
    }
    return _PyMonitoring_SetEvents(PY_MONITORING_SYS_PROFILE_ID, events);
}

static Ty_ssize_t
setup_tracing(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg, TyObject **old_traceobj)
{
    *old_traceobj = NULL;
    /* Setup PEP 669 monitoring callbacks and events. */
    if (!tstate->interp->sys_trace_initialized) {
        tstate->interp->sys_trace_initialized = true;
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_start, PyTrace_CALL,
                          PY_MONITORING_EVENT_PY_START,
                          PY_MONITORING_EVENT_PY_RESUME)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_throw, PyTrace_CALL,
                          PY_MONITORING_EVENT_PY_THROW, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_return, PyTrace_RETURN,
                          PY_MONITORING_EVENT_PY_RETURN, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_yield, PyTrace_RETURN,
                          PY_MONITORING_EVENT_PY_YIELD, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_exception_func, PyTrace_EXCEPTION,
                          PY_MONITORING_EVENT_RAISE,
                          PY_MONITORING_EVENT_STOP_ITERATION)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_line_func, PyTrace_LINE,
                          PY_MONITORING_EVENT_LINE, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_unwind, PyTrace_RETURN,
                          PY_MONITORING_EVENT_PY_UNWIND, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_jump_func, PyTrace_LINE,
                          PY_MONITORING_EVENT_JUMP, -1)) {
            return -1;
        }
        if (set_callbacks(PY_MONITORING_SYS_TRACE_ID,
                          sys_trace_instruction_func, PyTrace_OPCODE,
                          PY_MONITORING_EVENT_INSTRUCTION, -1)) {
            return -1;
        }
    }

    int delta = (func != NULL) - (tstate->c_tracefunc != NULL);
    tstate->c_tracefunc = func;
    *old_traceobj = tstate->c_traceobj;
    tstate->c_traceobj = Ty_XNewRef(arg);
    tstate->interp->sys_tracing_threads += delta;
    assert(tstate->interp->sys_tracing_threads >= 0);
    return tstate->interp->sys_tracing_threads;
}

int
_TyEval_SetTrace(TyThreadState *tstate, Ty_tracefunc func, TyObject *arg)
{
    assert(is_tstate_valid(tstate));
    /* The caller must hold a thread state */
    _Ty_AssertHoldsTstate();

    /* Call _TySys_Audit() in the context of the current thread state,
       even if tstate is not the current thread state. */
    TyThreadState *current_tstate = _TyThreadState_GET();
    if (_TySys_Audit(current_tstate, "sys.settrace", NULL) < 0) {
        return -1;
    }
    // needs to be decref'd outside of the lock
    TyObject *old_traceobj;
    LOCK_SETUP();
    assert(tstate->interp->sys_tracing_threads >= 0);
    Ty_ssize_t tracing_threads = setup_tracing(tstate, func, arg, &old_traceobj);
    UNLOCK_SETUP();
    Ty_XDECREF(old_traceobj);
    if (tracing_threads < 0) {
        return -1;
    }

    uint32_t events = 0;
    if (tracing_threads) {
        events =
            (1 << PY_MONITORING_EVENT_PY_START) | (1 << PY_MONITORING_EVENT_PY_RESUME) |
            (1 << PY_MONITORING_EVENT_PY_RETURN) | (1 << PY_MONITORING_EVENT_PY_YIELD) |
            (1 << PY_MONITORING_EVENT_RAISE) | (1 << PY_MONITORING_EVENT_LINE) |
            (1 << PY_MONITORING_EVENT_JUMP) |
            (1 << PY_MONITORING_EVENT_PY_UNWIND) | (1 << PY_MONITORING_EVENT_PY_THROW) |
            (1 << PY_MONITORING_EVENT_STOP_ITERATION);

        PyFrameObject* frame = TyEval_GetFrame();
        if (frame && frame->f_trace_opcodes) {
            int ret = _TyEval_SetOpcodeTrace(frame, true);
            if (ret != 0) {
                return ret;
            }
        }
    }

    return _PyMonitoring_SetEvents(PY_MONITORING_SYS_TRACE_ID, events);
}
