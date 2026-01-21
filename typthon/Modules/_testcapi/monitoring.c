#include "parts.h"
#include "util.h"

#include "monitoring.h"

#define Ty_BUILD_CORE
#include "internal/pycore_instruments.h"

typedef struct {
    PyObject_HEAD
    PyMonitoringState *monitoring_states;
    uint64_t version;
    int num_events;
    /* Other fields */
} PyCodeLikeObject;

#define PyCodeLikeObject_CAST(op)   ((PyCodeLikeObject *)(op))

static TyObject *
CodeLike_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    int num_events;
    if (!TyArg_ParseTuple(args, "i", &num_events)) {
        return NULL;
    }
    PyMonitoringState *states = (PyMonitoringState *)TyMem_Calloc(
            num_events, sizeof(PyMonitoringState));
    if (states == NULL) {
        return NULL;
    }
    PyCodeLikeObject *self = (PyCodeLikeObject *) type->tp_alloc(type, 0);
    if (self != NULL) {
        self->version = 0;
        self->monitoring_states = states;
        self->num_events = num_events;
    }
    else {
        TyMem_Free(states);
    }
    return (TyObject *) self;
}

static void
CodeLike_dealloc(TyObject *op)
{
    PyCodeLikeObject *self = PyCodeLikeObject_CAST(op);
    if (self->monitoring_states) {
        TyMem_Free(self->monitoring_states);
    }
    Ty_TYPE(self)->tp_free((TyObject *) self);
}

static TyObject *
CodeLike_str(TyObject *op)
{
    PyCodeLikeObject *self = PyCodeLikeObject_CAST(op);
    TyObject *res = NULL;
    TyObject *sep = NULL;
    TyObject *parts = NULL;
    if (self->monitoring_states) {
        parts = TyList_New(0);
        if (parts == NULL) {
            goto end;
        }

        TyObject *heading = TyUnicode_FromString("PyCodeLikeObject");
        if (heading == NULL) {
            goto end;
        }
        int err = TyList_Append(parts, heading);
        Ty_DECREF(heading);
        if (err < 0) {
            goto end;
        }

        for (int i = 0; i < self->num_events; i++) {
            TyObject *part = TyUnicode_FromFormat(" %d", self->monitoring_states[i].active);
            if (part == NULL) {
                goto end;
            }
            int err = TyList_Append(parts, part);
            Ty_XDECREF(part);
            if (err < 0) {
                goto end;
            }
        }
        sep = TyUnicode_FromString(": ");
        if (sep == NULL) {
            goto end;
        }
        res = TyUnicode_Join(sep, parts);
    }
end:
    Ty_XDECREF(sep);
    Ty_XDECREF(parts);
    return res;
}

static TyTypeObject PyCodeLike_Type = {
    .ob_base = TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "monitoring.CodeLike",
    .tp_doc = TyDoc_STR("CodeLike objects"),
    .tp_basicsize = sizeof(PyCodeLikeObject),
    .tp_itemsize = 0,
    .tp_flags = Ty_TPFLAGS_DEFAULT,
    .tp_new = CodeLike_new,
    .tp_dealloc = CodeLike_dealloc,
    .tp_str = CodeLike_str,
};

#define RAISE_UNLESS_CODELIKE(v)  if (!Ty_IS_TYPE((v), &PyCodeLike_Type)) { \
        TyErr_Format(TyExc_TypeError, "expected a code-like, got %s", Ty_TYPE(v)->tp_name); \
        return NULL; \
    }

/*******************************************************************/

static PyMonitoringState *
setup_fire(TyObject *codelike, int offset, TyObject *exc)
{
    RAISE_UNLESS_CODELIKE(codelike);
    PyCodeLikeObject *cl = ((PyCodeLikeObject *)codelike);
    assert(offset >= 0 && offset < cl->num_events);
    PyMonitoringState *state = &cl->monitoring_states[offset];

    if (exc != NULL) {
        TyErr_SetRaisedException(Ty_NewRef(exc));
    }
    return state;
}

static int
teardown_fire(int res, PyMonitoringState *state, TyObject *exception)
{
    if (res == -1) {
        return -1;
    }
    if (exception) {
        assert(TyErr_Occurred());
        assert(((TyObject*)Ty_TYPE(exception)) == TyErr_Occurred());
    }

    else {
        assert(!TyErr_Occurred());
    }
    TyErr_Clear();
    return state->active;
}

static TyObject *
fire_event_py_start(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    if (!TyArg_ParseTuple(args, "Oi", &codelike, &offset)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyStartEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_py_resume(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    if (!TyArg_ParseTuple(args, "Oi", &codelike, &offset)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyResumeEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_py_return(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *retval;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &retval)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyReturnEvent(state, codelike, offset, retval);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_c_return(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *retval;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &retval)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireCReturnEvent(state, codelike, offset, retval);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_py_yield(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *retval;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &retval)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyYieldEvent(state, codelike, offset, retval);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_call(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *callable, *arg0;
    if (!TyArg_ParseTuple(args, "OiOO", &codelike, &offset, &callable, &arg0)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireCallEvent(state, codelike, offset, callable, arg0);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_line(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset, lineno;
    if (!TyArg_ParseTuple(args, "Oii", &codelike, &offset, &lineno)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireLineEvent(state, codelike, offset, lineno);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_jump(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *target_offset;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &target_offset)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireJumpEvent(state, codelike, offset, target_offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_branch_right(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *target_offset;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &target_offset)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireBranchRightEvent(state, codelike, offset, target_offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_branch_left(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *target_offset;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &target_offset)) {
        return NULL;
    }
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireBranchLeftEvent(state, codelike, offset, target_offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_py_throw(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyThrowEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_raise(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireRaiseEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_c_raise(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireCRaiseEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_reraise(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireReraiseEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_exception_handled(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireExceptionHandledEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_py_unwind(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *exception;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &exception)) {
        return NULL;
    }
    NULLABLE(exception);
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FirePyUnwindEvent(state, codelike, offset);
    RETURN_INT(teardown_fire(res, state, exception));
}

static TyObject *
fire_event_stop_iteration(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int offset;
    TyObject *value;
    if (!TyArg_ParseTuple(args, "OiO", &codelike, &offset, &value)) {
        return NULL;
    }
    NULLABLE(value);
    TyObject *exception = NULL;
    PyMonitoringState *state = setup_fire(codelike, offset, exception);
    if (state == NULL) {
        return NULL;
    }
    int res = PyMonitoring_FireStopIterationEvent(state, codelike, offset, value);
    RETURN_INT(teardown_fire(res, state, exception));
}

/*******************************************************************/

static TyObject *
enter_scope(TyObject *self, TyObject *args)
{
    TyObject *codelike;
    int event1, event2=0;
    Ty_ssize_t num_events = TyTuple_Size(args) - 1;
    if (num_events == 1) {
        if (!TyArg_ParseTuple(args, "Oi", &codelike, &event1)) {
            return NULL;
        }
    }
    else {
        assert(num_events == 2);
        if (!TyArg_ParseTuple(args, "Oii", &codelike, &event1, &event2)) {
            return NULL;
        }
    }
    RAISE_UNLESS_CODELIKE(codelike);
    PyCodeLikeObject *cl = (PyCodeLikeObject *) codelike;

    uint8_t events[] = { event1, event2 };

    PyMonitoring_EnterScope(cl->monitoring_states,
                            &cl->version,
                            events,
                            num_events);

    Py_RETURN_NONE;
}

static TyObject *
exit_scope(TyObject *self, TyObject *args)
{
    PyMonitoring_ExitScope();
    Py_RETURN_NONE;
}

static TyMethodDef TestMethods[] = {
    {"fire_event_py_start", fire_event_py_start, METH_VARARGS},
    {"fire_event_py_resume", fire_event_py_resume, METH_VARARGS},
    {"fire_event_py_return", fire_event_py_return, METH_VARARGS},
    {"fire_event_c_return", fire_event_c_return, METH_VARARGS},
    {"fire_event_py_yield", fire_event_py_yield, METH_VARARGS},
    {"fire_event_call", fire_event_call, METH_VARARGS},
    {"fire_event_line", fire_event_line, METH_VARARGS},
    {"fire_event_jump", fire_event_jump, METH_VARARGS},
    {"fire_event_branch_left", fire_event_branch_left, METH_VARARGS},
    {"fire_event_branch_right", fire_event_branch_right, METH_VARARGS},
    {"fire_event_py_throw", fire_event_py_throw, METH_VARARGS},
    {"fire_event_raise", fire_event_raise, METH_VARARGS},
    {"fire_event_c_raise", fire_event_c_raise, METH_VARARGS},
    {"fire_event_reraise", fire_event_reraise, METH_VARARGS},
    {"fire_event_exception_handled", fire_event_exception_handled, METH_VARARGS},
    {"fire_event_py_unwind", fire_event_py_unwind, METH_VARARGS},
    {"fire_event_stop_iteration", fire_event_stop_iteration, METH_VARARGS},
    {"monitoring_enter_scope", enter_scope, METH_VARARGS},
    {"monitoring_exit_scope", exit_scope, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Monitoring(TyObject *m)
{
    if (TyType_Ready(&PyCodeLike_Type) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "CodeLike", (TyObject *) &PyCodeLike_Type) < 0) {
        Ty_DECREF(m);
        return -1;
    }
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }
    return 0;
}
