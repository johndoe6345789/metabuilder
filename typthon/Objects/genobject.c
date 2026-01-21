/* Generator object implementation */

#define _PY_INTERPRETER

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _TyEval_EvalFrame()
#include "pycore_frame.h"         // _PyInterpreterFrame
#include "pycore_freelist.h"      // _Ty_FREELIST_FREE()
#include "pycore_gc.h"            // _TyGC_CLEAR_FINALIZED()
#include "pycore_genobject.h"     // _TyGen_SetStopIterationValue()
#include "pycore_interpframe.h"   // _TyFrame_GetCode()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_opcode_utils.h"  // RESUME_AFTER_YIELD_FROM
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_LOAD_UINT8_RELAXED()
#include "pycore_pyerrors.h"      // _TyErr_ClearExcState()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_warnings.h"      // _TyErr_WarnUnawaitedCoroutine()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


#include "opcode_ids.h"           // RESUME, etc

// Forward declarations
static TyObject* gen_close(TyObject *, TyObject *);
static TyObject* async_gen_asend_new(PyAsyncGenObject *, TyObject *);
static TyObject* async_gen_athrow_new(PyAsyncGenObject *, TyObject *);


#define _TyGen_CAST(op) \
    _Py_CAST(PyGenObject*, (op))
#define _PyCoroObject_CAST(op) \
    (assert(TyCoro_CheckExact(op)), \
     _Py_CAST(PyCoroObject*, (op)))
#define _PyAsyncGenObject_CAST(op) \
    _Py_CAST(PyAsyncGenObject*, (op))


static const char *NON_INIT_CORO_MSG = "can't send non-None value to a "
                                 "just-started coroutine";

static const char *ASYNC_GEN_IGNORED_EXIT_MSG =
                                 "async generator ignored GeneratorExit";

/* Returns a borrowed reference */
static inline PyCodeObject *
_TyGen_GetCode(PyGenObject *gen) {
    return _TyFrame_GetCode(&gen->gi_iframe);
}

PyCodeObject *
TyGen_GetCode(PyGenObject *gen) {
    assert(TyGen_Check(gen));
    PyCodeObject *res = _TyGen_GetCode(gen);
    Ty_INCREF(res);
    return res;
}

static int
gen_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyGenObject *gen = _TyGen_CAST(self);
    Ty_VISIT(gen->gi_name);
    Ty_VISIT(gen->gi_qualname);
    if (gen->gi_frame_state != FRAME_CLEARED) {
        _PyInterpreterFrame *frame = &gen->gi_iframe;
        assert(frame->frame_obj == NULL ||
               frame->frame_obj->f_frame->owner == FRAME_OWNED_BY_GENERATOR);
        int err = _TyFrame_Traverse(frame, visit, arg);
        if (err) {
            return err;
        }
    }
    else {
        // We still need to visit the code object when the frame is cleared to
        // ensure that it's kept alive if the reference is deferred.
        _Ty_VISIT_STACKREF(gen->gi_iframe.f_executable);
    }
    /* No need to visit cr_origin, because it's just tuples/str/int, so can't
       participate in a reference cycle. */
    Ty_VISIT(gen->gi_exc_state.exc_value);
    return 0;
}

void
_TyGen_Finalize(TyObject *self)
{
    PyGenObject *gen = (PyGenObject *)self;

    if (FRAME_STATE_FINISHED(gen->gi_frame_state)) {
        /* Generator isn't paused, so no need to close */
        return;
    }

    if (PyAsyncGen_CheckExact(self)) {
        PyAsyncGenObject *agen = (PyAsyncGenObject*)self;
        TyObject *finalizer = agen->ag_origin_or_finalizer;
        if (finalizer && !agen->ag_closed) {
            /* Save the current exception, if any. */
            TyObject *exc = TyErr_GetRaisedException();

            TyObject *res = PyObject_CallOneArg(finalizer, self);
            if (res == NULL) {
                TyErr_FormatUnraisable("Exception ignored while "
                                       "finalizing generator %R", self);
            }
            else {
                Ty_DECREF(res);
            }
            /* Restore the saved exception. */
            TyErr_SetRaisedException(exc);
            return;
        }
    }

    /* Save the current exception, if any. */
    TyObject *exc = TyErr_GetRaisedException();

    /* If `gen` is a coroutine, and if it was never awaited on,
       issue a RuntimeWarning. */
    assert(_TyGen_GetCode(gen) != NULL);
    if (_TyGen_GetCode(gen)->co_flags & CO_COROUTINE &&
        gen->gi_frame_state == FRAME_CREATED)
    {
        _TyErr_WarnUnawaitedCoroutine((TyObject *)gen);
    }
    else {
        TyObject *res = gen_close((TyObject*)gen, NULL);
        if (res == NULL) {
            if (TyErr_Occurred()) {
                TyErr_FormatUnraisable("Exception ignored while "
                                       "closing generator %R", self);
            }
        }
        else {
            Ty_DECREF(res);
        }
    }

    /* Restore the saved exception. */
    TyErr_SetRaisedException(exc);
}

static void
gen_clear_frame(PyGenObject *gen)
{
    if (gen->gi_frame_state == FRAME_CLEARED)
        return;

    gen->gi_frame_state = FRAME_CLEARED;
    _PyInterpreterFrame *frame = &gen->gi_iframe;
    frame->previous = NULL;
    _TyFrame_ClearExceptCode(frame);
    _TyErr_ClearExcState(&gen->gi_exc_state);
}

static void
gen_dealloc(TyObject *self)
{
    PyGenObject *gen = _TyGen_CAST(self);

    _TyObject_GC_UNTRACK(gen);

    FT_CLEAR_WEAKREFS(self, gen->gi_weakreflist);

    _TyObject_GC_TRACK(self);

    if (PyObject_CallFinalizerFromDealloc(self))
        return;                     /* resurrected.  :( */

    _TyObject_GC_UNTRACK(self);
    if (PyAsyncGen_CheckExact(gen)) {
        /* We have to handle this case for asynchronous generators
           right here, because this code has to be between UNTRACK
           and GC_Del. */
        Ty_CLEAR(((PyAsyncGenObject*)gen)->ag_origin_or_finalizer);
    }
    if (TyCoro_CheckExact(gen)) {
        Ty_CLEAR(((PyCoroObject *)gen)->cr_origin_or_finalizer);
    }
    gen_clear_frame(gen);
    assert(gen->gi_exc_state.exc_value == NULL);
    PyStackRef_CLEAR(gen->gi_iframe.f_executable);
    Ty_CLEAR(gen->gi_name);
    Ty_CLEAR(gen->gi_qualname);

    PyObject_GC_Del(gen);
}

static PySendResult
gen_send_ex2(PyGenObject *gen, TyObject *arg, TyObject **presult,
             int exc, int closing)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyInterpreterFrame *frame = &gen->gi_iframe;

    *presult = NULL;
    if (gen->gi_frame_state == FRAME_CREATED && arg && arg != Ty_None) {
        const char *msg = "can't send non-None value to a "
                            "just-started generator";
        if (TyCoro_CheckExact(gen)) {
            msg = NON_INIT_CORO_MSG;
        }
        else if (PyAsyncGen_CheckExact(gen)) {
            msg = "can't send non-None value to a "
                    "just-started async generator";
        }
        TyErr_SetString(TyExc_TypeError, msg);
        return PYGEN_ERROR;
    }
    if (gen->gi_frame_state == FRAME_EXECUTING) {
        const char *msg = "generator already executing";
        if (TyCoro_CheckExact(gen)) {
            msg = "coroutine already executing";
        }
        else if (PyAsyncGen_CheckExact(gen)) {
            msg = "async generator already executing";
        }
        TyErr_SetString(TyExc_ValueError, msg);
        return PYGEN_ERROR;
    }
    if (FRAME_STATE_FINISHED(gen->gi_frame_state)) {
        if (TyCoro_CheckExact(gen) && !closing) {
            /* `gen` is an exhausted coroutine: raise an error,
               except when called from gen_close(), which should
               always be a silent method. */
            TyErr_SetString(
                TyExc_RuntimeError,
                "cannot reuse already awaited coroutine");
        }
        else if (arg && !exc) {
            /* `gen` is an exhausted generator:
               only return value if called from send(). */
            *presult = Ty_NewRef(Ty_None);
            return PYGEN_RETURN;
        }
        return PYGEN_ERROR;
    }

    assert((gen->gi_frame_state == FRAME_CREATED) ||
           FRAME_STATE_SUSPENDED(gen->gi_frame_state));

    /* Push arg onto the frame's value stack */
    TyObject *arg_obj = arg ? arg : Ty_None;
    _TyFrame_StackPush(frame, PyStackRef_FromPyObjectNew(arg_obj));

    _TyErr_StackItem *prev_exc_info = tstate->exc_info;
    gen->gi_exc_state.previous_item = prev_exc_info;
    tstate->exc_info = &gen->gi_exc_state;

    if (exc) {
        assert(_TyErr_Occurred(tstate));
        _TyErr_ChainStackItem();
    }

    gen->gi_frame_state = FRAME_EXECUTING;
    EVAL_CALL_STAT_INC(EVAL_CALL_GENERATOR);
    TyObject *result = _TyEval_EvalFrame(tstate, frame, exc);
    assert(tstate->exc_info == prev_exc_info);
    assert(gen->gi_exc_state.previous_item == NULL);
    assert(gen->gi_frame_state != FRAME_EXECUTING);
    assert(frame->previous == NULL);

    /* If the generator just returned (as opposed to yielding), signal
     * that the generator is exhausted. */
    if (result) {
        if (FRAME_STATE_SUSPENDED(gen->gi_frame_state)) {
            *presult = result;
            return PYGEN_NEXT;
        }
        assert(result == Ty_None || !PyAsyncGen_CheckExact(gen));
        if (result == Ty_None && !PyAsyncGen_CheckExact(gen) && !arg) {
            /* Return NULL if called by gen_iternext() */
            Ty_CLEAR(result);
        }
    }
    else {
        assert(!TyErr_ExceptionMatches(TyExc_StopIteration));
        assert(!PyAsyncGen_CheckExact(gen) ||
            !TyErr_ExceptionMatches(TyExc_StopAsyncIteration));
    }

    assert(gen->gi_exc_state.exc_value == NULL);
    assert(gen->gi_frame_state == FRAME_CLEARED);
    *presult = result;
    return result ? PYGEN_RETURN : PYGEN_ERROR;
}

static PySendResult
TyGen_am_send(TyObject *self, TyObject *arg, TyObject **result)
{
    PyGenObject *gen = _TyGen_CAST(self);
    return gen_send_ex2(gen, arg, result, 0, 0);
}

static TyObject *
gen_send_ex(PyGenObject *gen, TyObject *arg, int exc, int closing)
{
    TyObject *result;
    if (gen_send_ex2(gen, arg, &result, exc, closing) == PYGEN_RETURN) {
        if (PyAsyncGen_CheckExact(gen)) {
            assert(result == Ty_None);
            TyErr_SetNone(TyExc_StopAsyncIteration);
        }
        else if (result == Ty_None) {
            TyErr_SetNone(TyExc_StopIteration);
        }
        else {
            _TyGen_SetStopIterationValue(result);
        }
        Ty_CLEAR(result);
    }
    return result;
}

TyDoc_STRVAR(send_doc,
"send(arg) -> send 'arg' into generator,\n\
return next yielded value or raise StopIteration.");

static TyObject *
gen_send(TyObject *gen, TyObject *arg)
{
    return gen_send_ex((PyGenObject*)gen, arg, 0, 0);
}

TyDoc_STRVAR(close_doc,
"close() -> raise GeneratorExit inside generator.");

/*
 *   This helper function is used by gen_close and gen_throw to
 *   close a subiterator being delegated to by yield-from.
 */

static int
gen_close_iter(TyObject *yf)
{
    TyObject *retval = NULL;

    if (TyGen_CheckExact(yf) || TyCoro_CheckExact(yf)) {
        retval = gen_close((TyObject *)yf, NULL);
        if (retval == NULL)
            return -1;
    }
    else {
        TyObject *meth;
        if (PyObject_GetOptionalAttr(yf, &_Ty_ID(close), &meth) < 0) {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "closing generator %R", yf);
        }
        if (meth) {
            retval = _TyObject_CallNoArgs(meth);
            Ty_DECREF(meth);
            if (retval == NULL)
                return -1;
        }
    }
    Ty_XDECREF(retval);
    return 0;
}

static inline bool
is_resume(_Ty_CODEUNIT *instr)
{
    uint8_t code = FT_ATOMIC_LOAD_UINT8_RELAXED(instr->op.code);
    return (
        code == RESUME ||
        code == RESUME_CHECK ||
        code == INSTRUMENTED_RESUME
    );
}

TyObject *
_TyGen_yf(PyGenObject *gen)
{
    if (gen->gi_frame_state == FRAME_SUSPENDED_YIELD_FROM) {
        _PyInterpreterFrame *frame = &gen->gi_iframe;
        // GH-122390: These asserts are wrong in the presence of ENTER_EXECUTOR!
        // assert(is_resume(frame->instr_ptr));
        // assert((frame->instr_ptr->op.arg & RESUME_OPARG_LOCATION_MASK) >= RESUME_AFTER_YIELD_FROM);
        return PyStackRef_AsPyObjectNew(_TyFrame_StackPeek(frame));
    }
    return NULL;
}

static TyObject *
gen_close(TyObject *self, TyObject *args)
{
    PyGenObject *gen = _TyGen_CAST(self);

    if (gen->gi_frame_state == FRAME_CREATED) {
        gen->gi_frame_state = FRAME_COMPLETED;
        Py_RETURN_NONE;
    }
    if (FRAME_STATE_FINISHED(gen->gi_frame_state)) {
        Py_RETURN_NONE;
    }

    TyObject *yf = _TyGen_yf(gen);
    int err = 0;
    if (yf) {
        PyFrameState state = gen->gi_frame_state;
        gen->gi_frame_state = FRAME_EXECUTING;
        err = gen_close_iter(yf);
        gen->gi_frame_state = state;
        Ty_DECREF(yf);
    }
    _PyInterpreterFrame *frame = &gen->gi_iframe;
    if (is_resume(frame->instr_ptr)) {
        /* We can safely ignore the outermost try block
         * as it is automatically generated to handle
         * StopIteration. */
        int oparg = frame->instr_ptr->op.arg;
        if (oparg & RESUME_OPARG_DEPTH1_MASK) {
            // RESUME after YIELD_VALUE and exception depth is 1
            assert((oparg & RESUME_OPARG_LOCATION_MASK) != RESUME_AT_FUNC_START);
            gen->gi_frame_state = FRAME_COMPLETED;
            gen_clear_frame(gen);
            Py_RETURN_NONE;
        }
    }
    if (err == 0) {
        TyErr_SetNone(TyExc_GeneratorExit);
    }

    TyObject *retval = gen_send_ex(gen, Ty_None, 1, 1);
    if (retval) {
        const char *msg = "generator ignored GeneratorExit";
        if (TyCoro_CheckExact(gen)) {
            msg = "coroutine ignored GeneratorExit";
        } else if (PyAsyncGen_CheckExact(gen)) {
            msg = ASYNC_GEN_IGNORED_EXIT_MSG;
        }
        Ty_DECREF(retval);
        TyErr_SetString(TyExc_RuntimeError, msg);
        return NULL;
    }
    assert(TyErr_Occurred());

    if (TyErr_ExceptionMatches(TyExc_GeneratorExit)) {
        TyErr_Clear();          /* ignore this error */
        Py_RETURN_NONE;
    }

    /* if the generator returned a value while closing, StopIteration was
     * raised in gen_send_ex() above; retrieve and return the value here */
    if (_TyGen_FetchStopIterationValue(&retval) == 0) {
        return retval;
    }
    return NULL;
}


TyDoc_STRVAR(throw_doc,
"throw(value)\n\
throw(type[,value[,tb]])\n\
\n\
Raise exception in generator, return next yielded value or raise\n\
StopIteration.\n\
the (type, val, tb) signature is deprecated, \n\
and may be removed in a future version of Python.");

static TyObject *
_gen_throw(PyGenObject *gen, int close_on_genexit,
           TyObject *typ, TyObject *val, TyObject *tb)
{
    TyObject *yf = _TyGen_yf(gen);

    if (yf) {
        _PyInterpreterFrame *frame = &gen->gi_iframe;
        TyObject *ret;
        int err;
        if (TyErr_GivenExceptionMatches(typ, TyExc_GeneratorExit) &&
            close_on_genexit
        ) {
            /* Asynchronous generators *should not* be closed right away.
               We have to allow some awaits to work it through, hence the
               `close_on_genexit` parameter here.
            */
            PyFrameState state = gen->gi_frame_state;
            gen->gi_frame_state = FRAME_EXECUTING;
            err = gen_close_iter(yf);
            gen->gi_frame_state = state;
            Ty_DECREF(yf);
            if (err < 0)
                return gen_send_ex(gen, Ty_None, 1, 0);
            goto throw_here;
        }
        TyThreadState *tstate = _TyThreadState_GET();
        assert(tstate != NULL);
        if (TyGen_CheckExact(yf) || TyCoro_CheckExact(yf)) {
            /* `yf` is a generator or a coroutine. */

            /* Link frame into the stack to enable complete backtraces. */
            /* XXX We should probably be updating the current frame somewhere in
               ceval.c. */
            _PyInterpreterFrame *prev = tstate->current_frame;
            frame->previous = prev;
            tstate->current_frame = frame;
            /* Close the generator that we are currently iterating with
               'yield from' or awaiting on with 'await'. */
            PyFrameState state = gen->gi_frame_state;
            gen->gi_frame_state = FRAME_EXECUTING;
            ret = _gen_throw((PyGenObject *)yf, close_on_genexit,
                             typ, val, tb);
            gen->gi_frame_state = state;
            tstate->current_frame = prev;
            frame->previous = NULL;
        } else {
            /* `yf` is an iterator or a coroutine-like object. */
            TyObject *meth;
            if (PyObject_GetOptionalAttr(yf, &_Ty_ID(throw), &meth) < 0) {
                Ty_DECREF(yf);
                return NULL;
            }
            if (meth == NULL) {
                Ty_DECREF(yf);
                goto throw_here;
            }

            _PyInterpreterFrame *prev = tstate->current_frame;
            frame->previous = prev;
            tstate->current_frame = frame;
            PyFrameState state = gen->gi_frame_state;
            gen->gi_frame_state = FRAME_EXECUTING;
            ret = PyObject_CallFunctionObjArgs(meth, typ, val, tb, NULL);
            gen->gi_frame_state = state;
            tstate->current_frame = prev;
            frame->previous = NULL;
            Ty_DECREF(meth);
        }
        Ty_DECREF(yf);
        if (!ret) {
            ret = gen_send_ex(gen, Ty_None, 1, 0);
        }
        return ret;
    }

throw_here:
    /* First, check the traceback argument, replacing None with
       NULL. */
    if (tb == Ty_None) {
        tb = NULL;
    }
    else if (tb != NULL && !PyTraceBack_Check(tb)) {
        TyErr_SetString(TyExc_TypeError,
            "throw() third argument must be a traceback object");
        return NULL;
    }

    Ty_INCREF(typ);
    Ty_XINCREF(val);
    Ty_XINCREF(tb);

    if (PyExceptionClass_Check(typ))
        TyErr_NormalizeException(&typ, &val, &tb);

    else if (PyExceptionInstance_Check(typ)) {
        /* Raising an instance.  The value should be a dummy. */
        if (val && val != Ty_None) {
            TyErr_SetString(TyExc_TypeError,
              "instance exception may not have a separate value");
            goto failed_throw;
        }
        else {
            /* Normalize to raise <class>, <instance> */
            Ty_XSETREF(val, typ);
            typ = Ty_NewRef(PyExceptionInstance_Class(typ));

            if (tb == NULL)
                /* Returns NULL if there's no traceback */
                tb = PyException_GetTraceback(val);
        }
    }
    else {
        /* Not something you can raise.  throw() fails. */
        TyErr_Format(TyExc_TypeError,
                     "exceptions must be classes or instances "
                     "deriving from BaseException, not %s",
                     Ty_TYPE(typ)->tp_name);
            goto failed_throw;
    }

    TyErr_Restore(typ, val, tb);
    return gen_send_ex(gen, Ty_None, 1, 0);

failed_throw:
    /* Didn't use our arguments, so restore their original refcounts */
    Ty_DECREF(typ);
    Ty_XDECREF(val);
    Ty_XDECREF(tb);
    return NULL;
}


static TyObject *
gen_throw(TyObject *op, TyObject *const *args, Ty_ssize_t nargs)
{
    PyGenObject *gen = _TyGen_CAST(op);
    TyObject *typ;
    TyObject *tb = NULL;
    TyObject *val = NULL;

    if (!_TyArg_CheckPositional("throw", nargs, 1, 3)) {
        return NULL;
    }
    if (nargs > 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                            "the (type, exc, tb) signature of throw() is deprecated, "
                            "use the single-arg signature instead.",
                            1) < 0) {
            return NULL;
        }
    }
    typ = args[0];
    if (nargs == 3) {
        val = args[1];
        tb = args[2];
    }
    else if (nargs == 2) {
        val = args[1];
    }
    return _gen_throw(gen, 1, typ, val, tb);
}


static TyObject *
gen_iternext(TyObject *self)
{
    assert(TyGen_CheckExact(self) || TyCoro_CheckExact(self));
    PyGenObject *gen = _TyGen_CAST(self);

    TyObject *result;
    if (gen_send_ex2(gen, NULL, &result, 0, 0) == PYGEN_RETURN) {
        if (result != Ty_None) {
            _TyGen_SetStopIterationValue(result);
        }
        Ty_CLEAR(result);
    }
    return result;
}

/*
 * Set StopIteration with specified value.  Value can be arbitrary object
 * or NULL.
 *
 * Returns 0 if StopIteration is set and -1 if any other exception is set.
 */
int
_TyGen_SetStopIterationValue(TyObject *value)
{
    assert(!TyErr_Occurred());
    // Construct an exception instance manually with PyObject_CallOneArg()
    // but use TyErr_SetRaisedException() instead of TyErr_SetObject() as
    // TyErr_SetObject(exc_type, value) has a fast path when 'value'
    // is a tuple, where the value of the StopIteration exception would be
    // set to 'value[0]' instead of 'value'.
    TyObject *exc = value == NULL
        ? PyObject_CallNoArgs(TyExc_StopIteration)
        : PyObject_CallOneArg(TyExc_StopIteration, value);
    if (exc == NULL) {
        return -1;
    }
    TyErr_SetRaisedException(exc /* stolen */);
    return 0;
}

/*
 *   If StopIteration exception is set, fetches its 'value'
 *   attribute if any, otherwise sets pvalue to None.
 *
 *   Returns 0 if no exception or StopIteration is set.
 *   If any other exception is set, returns -1 and leaves
 *   pvalue unchanged.
 */

int
_TyGen_FetchStopIterationValue(TyObject **pvalue)
{
    TyObject *value = NULL;
    if (TyErr_ExceptionMatches(TyExc_StopIteration)) {
        TyObject *exc = TyErr_GetRaisedException();
        value = Ty_NewRef(((TyStopIterationObject *)exc)->value);
        Ty_DECREF(exc);
    } else if (TyErr_Occurred()) {
        return -1;
    }
    if (value == NULL) {
        value = Ty_NewRef(Ty_None);
    }
    *pvalue = value;
    return 0;
}

static TyObject *
gen_repr(TyObject *self)
{
    PyGenObject *gen = _TyGen_CAST(self);
    return TyUnicode_FromFormat("<generator object %S at %p>",
                                gen->gi_qualname, gen);
}

static TyObject *
gen_get_name(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *op = _TyGen_CAST(self);
    return Ty_NewRef(op->gi_name);
}

static int
gen_set_name(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyGenObject *op = _TyGen_CAST(self);
    /* Not legal to del gen.gi_name or to set it to anything
     * other than a string object. */
    if (value == NULL || !TyUnicode_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__name__ must be set to a string object");
        return -1;
    }
    Ty_XSETREF(op->gi_name, Ty_NewRef(value));
    return 0;
}

static TyObject *
gen_get_qualname(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *op = _TyGen_CAST(self);
    return Ty_NewRef(op->gi_qualname);
}

static int
gen_set_qualname(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyGenObject *op = _TyGen_CAST(self);
    /* Not legal to del gen.__qualname__ or to set it to anything
     * other than a string object. */
    if (value == NULL || !TyUnicode_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__qualname__ must be set to a string object");
        return -1;
    }
    Ty_XSETREF(op->gi_qualname, Ty_NewRef(value));
    return 0;
}

static TyObject *
gen_getyieldfrom(TyObject *gen, void *Py_UNUSED(ignored))
{
    TyObject *yf = _TyGen_yf(_TyGen_CAST(gen));
    if (yf == NULL) {
        Py_RETURN_NONE;
    }
    return yf;
}


static TyObject *
gen_getrunning(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *gen = _TyGen_CAST(self);
    if (gen->gi_frame_state == FRAME_EXECUTING) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
gen_getsuspended(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *gen = _TyGen_CAST(self);
    return TyBool_FromLong(FRAME_STATE_SUSPENDED(gen->gi_frame_state));
}

static TyObject *
_gen_getframe(PyGenObject *gen, const char *const name)
{
    if (TySys_Audit("object.__getattr__", "Os", gen, name) < 0) {
        return NULL;
    }
    if (FRAME_STATE_FINISHED(gen->gi_frame_state)) {
        Py_RETURN_NONE;
    }
    return _Ty_XNewRef((TyObject *)_TyFrame_GetFrameObject(&gen->gi_iframe));
}

static TyObject *
gen_getframe(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *gen = _TyGen_CAST(self);
    return _gen_getframe(gen, "gi_frame");
}

static TyObject *
_gen_getcode(PyGenObject *gen, const char *const name)
{
    if (TySys_Audit("object.__getattr__", "Os", gen, name) < 0) {
        return NULL;
    }
    return Ty_NewRef(_TyGen_GetCode(gen));
}

static TyObject *
gen_getcode(TyObject *self, void *Py_UNUSED(ignored))
{
    PyGenObject *gen = _TyGen_CAST(self);
    return _gen_getcode(gen, "gi_code");
}

static TyGetSetDef gen_getsetlist[] = {
    {"__name__", gen_get_name, gen_set_name,
     TyDoc_STR("name of the generator")},
    {"__qualname__", gen_get_qualname, gen_set_qualname,
     TyDoc_STR("qualified name of the generator")},
    {"gi_yieldfrom", gen_getyieldfrom, NULL,
     TyDoc_STR("object being iterated by yield from, or None")},
    {"gi_running", gen_getrunning, NULL, NULL},
    {"gi_frame", gen_getframe,  NULL, NULL},
    {"gi_suspended", gen_getsuspended,  NULL, NULL},
    {"gi_code", gen_getcode,  NULL, NULL},
    {NULL} /* Sentinel */
};

static TyMemberDef gen_memberlist[] = {
    {NULL}      /* Sentinel */
};

static TyObject *
gen_sizeof(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyGenObject *gen = _TyGen_CAST(op);
    Ty_ssize_t res;
    res = offsetof(PyGenObject, gi_iframe) + offsetof(_PyInterpreterFrame, localsplus);
    PyCodeObject *code = _TyGen_GetCode(gen);
    res += _TyFrame_NumSlotsForCodeObject(code) * sizeof(TyObject *);
    return TyLong_FromSsize_t(res);
}

TyDoc_STRVAR(sizeof__doc__,
"gen.__sizeof__() -> size of gen in memory, in bytes");

static TyMethodDef gen_methods[] = {
    {"send", gen_send, METH_O, send_doc},
    {"throw", _PyCFunction_CAST(gen_throw), METH_FASTCALL, throw_doc},
    {"close", gen_close, METH_NOARGS, close_doc},
    {"__sizeof__", gen_sizeof, METH_NOARGS, sizeof__doc__},
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL, NULL}        /* Sentinel */
};

static TyAsyncMethods gen_as_async = {
    0,                                          /* am_await */
    0,                                          /* am_aiter */
    0,                                          /* am_anext */
    TyGen_am_send,                              /* am_send  */
};


TyTypeObject TyGen_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "generator",                                /* tp_name */
    offsetof(PyGenObject, gi_iframe.localsplus), /* tp_basicsize */
    sizeof(TyObject *),                         /* tp_itemsize */
    /* methods */
    gen_dealloc,                                /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &gen_as_async,                              /* tp_as_async */
    gen_repr,                                   /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    gen_traverse,                               /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(PyGenObject, gi_weakreflist),      /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    gen_iternext,                               /* tp_iternext */
    gen_methods,                                /* tp_methods */
    gen_memberlist,                             /* tp_members */
    gen_getsetlist,                             /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */

    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    0,                                          /* tp_free */
    0,                                          /* tp_is_gc */
    0,                                          /* tp_bases */
    0,                                          /* tp_mro */
    0,                                          /* tp_cache */
    0,                                          /* tp_subclasses */
    0,                                          /* tp_weaklist */
    0,                                          /* tp_del */
    0,                                          /* tp_version_tag */
    _TyGen_Finalize,                            /* tp_finalize */
};

static TyObject *
make_gen(TyTypeObject *type, PyFunctionObject *func)
{
    PyCodeObject *code = (PyCodeObject *)func->func_code;
    int slots = _TyFrame_NumSlotsForCodeObject(code);
    PyGenObject *gen = PyObject_GC_NewVar(PyGenObject, type, slots);
    if (gen == NULL) {
        return NULL;
    }
    gen->gi_frame_state = FRAME_CLEARED;
    gen->gi_weakreflist = NULL;
    gen->gi_exc_state.exc_value = NULL;
    gen->gi_exc_state.previous_item = NULL;
    assert(func->func_name != NULL);
    gen->gi_name = Ty_NewRef(func->func_name);
    assert(func->func_qualname != NULL);
    gen->gi_qualname = Ty_NewRef(func->func_qualname);
    _TyObject_GC_TRACK(gen);
    return (TyObject *)gen;
}

static TyObject *
compute_cr_origin(int origin_depth, _PyInterpreterFrame *current_frame);

TyObject *
_Ty_MakeCoro(PyFunctionObject *func)
{
    int coro_flags = ((PyCodeObject *)func->func_code)->co_flags &
        (CO_GENERATOR | CO_COROUTINE | CO_ASYNC_GENERATOR);
    assert(coro_flags);
    if (coro_flags == CO_GENERATOR) {
        return make_gen(&TyGen_Type, func);
    }
    if (coro_flags == CO_ASYNC_GENERATOR) {
        PyAsyncGenObject *ag;
        ag = (PyAsyncGenObject *)make_gen(&PyAsyncGen_Type, func);
        if (ag == NULL) {
            return NULL;
        }
        ag->ag_origin_or_finalizer = NULL;
        ag->ag_closed = 0;
        ag->ag_hooks_inited = 0;
        ag->ag_running_async = 0;
        return (TyObject*)ag;
    }

    assert (coro_flags == CO_COROUTINE);
    TyObject *coro = make_gen(&TyCoro_Type, func);
    if (!coro) {
        return NULL;
    }
    TyThreadState *tstate = _TyThreadState_GET();
    int origin_depth = tstate->coroutine_origin_tracking_depth;

    if (origin_depth == 0) {
        ((PyCoroObject *)coro)->cr_origin_or_finalizer = NULL;
    } else {
        _PyInterpreterFrame *frame = tstate->current_frame;
        assert(frame);
        assert(_TyFrame_IsIncomplete(frame));
        frame = _TyFrame_GetFirstComplete(frame->previous);
        TyObject *cr_origin = compute_cr_origin(origin_depth, frame);
        ((PyCoroObject *)coro)->cr_origin_or_finalizer = cr_origin;
        if (!cr_origin) {
            Ty_DECREF(coro);
            return NULL;
        }
    }
    return coro;
}

static TyObject *
gen_new_with_qualname(TyTypeObject *type, PyFrameObject *f,
                      TyObject *name, TyObject *qualname)
{
    PyCodeObject *code = _TyFrame_GetCode(f->f_frame);
    int size = code->co_nlocalsplus + code->co_stacksize;
    PyGenObject *gen = PyObject_GC_NewVar(PyGenObject, type, size);
    if (gen == NULL) {
        Ty_DECREF(f);
        return NULL;
    }
    /* Copy the frame */
    assert(f->f_frame->frame_obj == NULL);
    assert(f->f_frame->owner == FRAME_OWNED_BY_FRAME_OBJECT);
    _PyInterpreterFrame *frame = &gen->gi_iframe;
    _TyFrame_Copy((_PyInterpreterFrame *)f->_f_frame_data, frame);
    gen->gi_frame_state = FRAME_CREATED;
    assert(frame->frame_obj == f);
    f->f_frame = frame;
    frame->owner = FRAME_OWNED_BY_GENERATOR;
    assert(PyObject_GC_IsTracked((TyObject *)f));
    Ty_DECREF(f);
    gen->gi_weakreflist = NULL;
    gen->gi_exc_state.exc_value = NULL;
    gen->gi_exc_state.previous_item = NULL;
    if (name != NULL)
        gen->gi_name = Ty_NewRef(name);
    else
        gen->gi_name = Ty_NewRef(_TyGen_GetCode(gen)->co_name);
    if (qualname != NULL)
        gen->gi_qualname = Ty_NewRef(qualname);
    else
        gen->gi_qualname = Ty_NewRef(_TyGen_GetCode(gen)->co_qualname);
    _TyObject_GC_TRACK(gen);
    return (TyObject *)gen;
}

TyObject *
TyGen_NewWithQualName(PyFrameObject *f, TyObject *name, TyObject *qualname)
{
    return gen_new_with_qualname(&TyGen_Type, f, name, qualname);
}

TyObject *
TyGen_New(PyFrameObject *f)
{
    return gen_new_with_qualname(&TyGen_Type, f, NULL, NULL);
}

/* Coroutine Object */

typedef struct {
    PyObject_HEAD
    PyCoroObject *cw_coroutine;
} PyCoroWrapper;

#define _PyCoroWrapper_CAST(op) \
    (assert(Ty_IS_TYPE((op), &_PyCoroWrapper_Type)), \
     _Py_CAST(PyCoroWrapper*, (op)))


static int
gen_is_coroutine(TyObject *o)
{
    if (TyGen_CheckExact(o)) {
        PyCodeObject *code = _TyGen_GetCode((PyGenObject*)o);
        if (code->co_flags & CO_ITERABLE_COROUTINE) {
            return 1;
        }
    }
    return 0;
}

/*
 *   This helper function returns an awaitable for `o`:
 *     - `o` if `o` is a coroutine-object;
 *     - `type(o)->tp_as_async->am_await(o)`
 *
 *   Raises a TypeError if it's not possible to return
 *   an awaitable and returns NULL.
 */
TyObject *
_PyCoro_GetAwaitableIter(TyObject *o)
{
    unaryfunc getter = NULL;
    TyTypeObject *ot;

    if (TyCoro_CheckExact(o) || gen_is_coroutine(o)) {
        /* 'o' is a coroutine. */
        return Ty_NewRef(o);
    }

    ot = Ty_TYPE(o);
    if (ot->tp_as_async != NULL) {
        getter = ot->tp_as_async->am_await;
    }
    if (getter != NULL) {
        TyObject *res = (*getter)(o);
        if (res != NULL) {
            if (TyCoro_CheckExact(res) || gen_is_coroutine(res)) {
                /* __await__ must return an *iterator*, not
                   a coroutine or another awaitable (see PEP 492) */
                TyErr_SetString(TyExc_TypeError,
                                "__await__() returned a coroutine");
                Ty_CLEAR(res);
            } else if (!TyIter_Check(res)) {
                TyErr_Format(TyExc_TypeError,
                             "__await__() returned non-iterator "
                             "of type '%.100s'",
                             Ty_TYPE(res)->tp_name);
                Ty_CLEAR(res);
            }
        }
        return res;
    }

    TyErr_Format(TyExc_TypeError,
                 "'%.100s' object can't be awaited",
                 ot->tp_name);
    return NULL;
}

static TyObject *
coro_repr(TyObject *self)
{
    PyCoroObject *coro = _PyCoroObject_CAST(self);
    return TyUnicode_FromFormat("<coroutine object %S at %p>",
                                coro->cr_qualname, coro);
}

static TyObject *
coro_await(TyObject *coro)
{
    PyCoroWrapper *cw = PyObject_GC_New(PyCoroWrapper, &_PyCoroWrapper_Type);
    if (cw == NULL) {
        return NULL;
    }
    cw->cw_coroutine = (PyCoroObject*)Ty_NewRef(coro);
    _TyObject_GC_TRACK(cw);
    return (TyObject *)cw;
}

static TyObject *
coro_get_cr_await(TyObject *coro, void *Py_UNUSED(ignored))
{
    TyObject *yf = _TyGen_yf((PyGenObject *) coro);
    if (yf == NULL)
        Py_RETURN_NONE;
    return yf;
}

static TyObject *
cr_getsuspended(TyObject *self, void *Py_UNUSED(ignored))
{
    PyCoroObject *coro = _PyCoroObject_CAST(self);
    if (FRAME_STATE_SUSPENDED(coro->cr_frame_state)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
cr_getrunning(TyObject *self, void *Py_UNUSED(ignored))
{
    PyCoroObject *coro = _PyCoroObject_CAST(self);
    if (coro->cr_frame_state == FRAME_EXECUTING) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
cr_getframe(TyObject *coro, void *Py_UNUSED(ignored))
{
    return _gen_getframe(_TyGen_CAST(coro), "cr_frame");
}

static TyObject *
cr_getcode(TyObject *coro, void *Py_UNUSED(ignored))
{
    return _gen_getcode(_TyGen_CAST(coro), "cr_code");
}

static TyGetSetDef coro_getsetlist[] = {
    {"__name__", gen_get_name, gen_set_name,
     TyDoc_STR("name of the coroutine")},
    {"__qualname__", gen_get_qualname, gen_set_qualname,
     TyDoc_STR("qualified name of the coroutine")},
    {"cr_await", coro_get_cr_await, NULL,
     TyDoc_STR("object being awaited on, or None")},
    {"cr_running", cr_getrunning, NULL, NULL},
    {"cr_frame", cr_getframe, NULL, NULL},
    {"cr_code", cr_getcode, NULL, NULL},
    {"cr_suspended", cr_getsuspended, NULL, NULL},
    {NULL} /* Sentinel */
};

static TyMemberDef coro_memberlist[] = {
    {"cr_origin",    _Ty_T_OBJECT, offsetof(PyCoroObject, cr_origin_or_finalizer),   Py_READONLY},
    {NULL}      /* Sentinel */
};

TyDoc_STRVAR(coro_send_doc,
"send(arg) -> send 'arg' into coroutine,\n\
return next iterated value or raise StopIteration.");

TyDoc_STRVAR(coro_throw_doc,
"throw(value)\n\
throw(type[,value[,traceback]])\n\
\n\
Raise exception in coroutine, return next iterated value or raise\n\
StopIteration.\n\
the (type, val, tb) signature is deprecated, \n\
and may be removed in a future version of Python.");


TyDoc_STRVAR(coro_close_doc,
"close() -> raise GeneratorExit inside coroutine.");

static TyMethodDef coro_methods[] = {
    {"send", gen_send, METH_O, coro_send_doc},
    {"throw",_PyCFunction_CAST(gen_throw), METH_FASTCALL, coro_throw_doc},
    {"close", gen_close, METH_NOARGS, coro_close_doc},
    {"__sizeof__", gen_sizeof, METH_NOARGS, sizeof__doc__},
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL, NULL}        /* Sentinel */
};

static TyAsyncMethods coro_as_async = {
    coro_await,                                 /* am_await */
    0,                                          /* am_aiter */
    0,                                          /* am_anext */
    TyGen_am_send,                              /* am_send  */
};

TyTypeObject TyCoro_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "coroutine",                                /* tp_name */
    offsetof(PyCoroObject, cr_iframe.localsplus),/* tp_basicsize */
    sizeof(TyObject *),                         /* tp_itemsize */
    /* methods */
    gen_dealloc,                                /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &coro_as_async,                             /* tp_as_async */
    coro_repr,                                  /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    gen_traverse,                               /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(PyCoroObject, cr_weakreflist),     /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    coro_methods,                               /* tp_methods */
    coro_memberlist,                            /* tp_members */
    coro_getsetlist,                            /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    0,                                          /* tp_free */
    0,                                          /* tp_is_gc */
    0,                                          /* tp_bases */
    0,                                          /* tp_mro */
    0,                                          /* tp_cache */
    0,                                          /* tp_subclasses */
    0,                                          /* tp_weaklist */
    0,                                          /* tp_del */
    0,                                          /* tp_version_tag */
    _TyGen_Finalize,                            /* tp_finalize */
};

static void
coro_wrapper_dealloc(TyObject *self)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    _TyObject_GC_UNTRACK((TyObject *)cw);
    Ty_CLEAR(cw->cw_coroutine);
    PyObject_GC_Del(cw);
}

static TyObject *
coro_wrapper_iternext(TyObject *self)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    return gen_iternext((TyObject *)cw->cw_coroutine);
}

static TyObject *
coro_wrapper_send(TyObject *self, TyObject *arg)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    return gen_send((TyObject *)cw->cw_coroutine, arg);
}

static TyObject *
coro_wrapper_throw(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    return gen_throw((TyObject*)cw->cw_coroutine, args, nargs);
}

static TyObject *
coro_wrapper_close(TyObject *self, TyObject *args)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    return gen_close((TyObject *)cw->cw_coroutine, args);
}

static int
coro_wrapper_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyCoroWrapper *cw = _PyCoroWrapper_CAST(self);
    Ty_VISIT((TyObject *)cw->cw_coroutine);
    return 0;
}

static TyMethodDef coro_wrapper_methods[] = {
    {"send", coro_wrapper_send, METH_O, coro_send_doc},
    {"throw", _PyCFunction_CAST(coro_wrapper_throw), METH_FASTCALL,
     coro_throw_doc},
    {"close", coro_wrapper_close, METH_NOARGS, coro_close_doc},
    {NULL, NULL}        /* Sentinel */
};

TyTypeObject _PyCoroWrapper_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "coroutine_wrapper",
    sizeof(PyCoroWrapper),                      /* tp_basicsize */
    0,                                          /* tp_itemsize */
    coro_wrapper_dealloc,                       /* destructor tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    "A wrapper object implementing __await__ for coroutines.",
    coro_wrapper_traverse,                      /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    coro_wrapper_iternext,                      /* tp_iternext */
    coro_wrapper_methods,                       /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    0,                                          /* tp_free */
};

static TyObject *
compute_cr_origin(int origin_depth, _PyInterpreterFrame *current_frame)
{
    _PyInterpreterFrame *frame = current_frame;
    /* First count how many frames we have */
    int frame_count = 0;
    for (; frame && frame_count < origin_depth; ++frame_count) {
        frame = _TyFrame_GetFirstComplete(frame->previous);
    }

    /* Now collect them */
    TyObject *cr_origin = TyTuple_New(frame_count);
    if (cr_origin == NULL) {
        return NULL;
    }
    frame = current_frame;
    for (int i = 0; i < frame_count; ++i) {
        PyCodeObject *code = _TyFrame_GetCode(frame);
        int line = PyUnstable_InterpreterFrame_GetLine(frame);
        TyObject *frameinfo = Ty_BuildValue("OiO", code->co_filename, line,
                                            code->co_name);
        if (!frameinfo) {
            Ty_DECREF(cr_origin);
            return NULL;
        }
        TyTuple_SET_ITEM(cr_origin, i, frameinfo);
        frame = _TyFrame_GetFirstComplete(frame->previous);
    }

    return cr_origin;
}

TyObject *
TyCoro_New(PyFrameObject *f, TyObject *name, TyObject *qualname)
{
    TyObject *coro = gen_new_with_qualname(&TyCoro_Type, f, name, qualname);
    if (!coro) {
        return NULL;
    }

    TyThreadState *tstate = _TyThreadState_GET();
    int origin_depth = tstate->coroutine_origin_tracking_depth;

    if (origin_depth == 0) {
        ((PyCoroObject *)coro)->cr_origin_or_finalizer = NULL;
    } else {
        TyObject *cr_origin = compute_cr_origin(origin_depth, _TyEval_GetFrame());
        ((PyCoroObject *)coro)->cr_origin_or_finalizer = cr_origin;
        if (!cr_origin) {
            Ty_DECREF(coro);
            return NULL;
        }
    }

    return coro;
}


/* ========= Asynchronous Generators ========= */


typedef enum {
    AWAITABLE_STATE_INIT,   /* new awaitable, has not yet been iterated */
    AWAITABLE_STATE_ITER,   /* being iterated */
    AWAITABLE_STATE_CLOSED, /* closed */
} AwaitableState;


typedef struct PyAsyncGenASend {
    PyObject_HEAD
    PyAsyncGenObject *ags_gen;

    /* Can be NULL, when in the __anext__() mode
       (equivalent of "asend(None)") */
    TyObject *ags_sendval;

    AwaitableState ags_state;
} PyAsyncGenASend;

#define _PyAsyncGenASend_CAST(op) \
    _Py_CAST(PyAsyncGenASend*, (op))


typedef struct PyAsyncGenAThrow {
    PyObject_HEAD
    PyAsyncGenObject *agt_gen;

    /* Can be NULL, when in the "aclose()" mode
       (equivalent of "athrow(GeneratorExit)") */
    TyObject *agt_args;

    AwaitableState agt_state;
} PyAsyncGenAThrow;


typedef struct _PyAsyncGenWrappedValue {
    PyObject_HEAD
    TyObject *agw_val;
} _PyAsyncGenWrappedValue;


#define _PyAsyncGenWrappedValue_CheckExact(o) \
                    Ty_IS_TYPE(o, &_PyAsyncGenWrappedValue_Type)
#define _PyAsyncGenWrappedValue_CAST(op) \
    (assert(_PyAsyncGenWrappedValue_CheckExact(op)), \
     _Py_CAST(_PyAsyncGenWrappedValue*, (op)))


static int
async_gen_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyAsyncGenObject *ag = _PyAsyncGenObject_CAST(self);
    Ty_VISIT(ag->ag_origin_or_finalizer);
    return gen_traverse((TyObject*)ag, visit, arg);
}


static TyObject *
async_gen_repr(TyObject *self)
{
    PyAsyncGenObject *o = _PyAsyncGenObject_CAST(self);
    return TyUnicode_FromFormat("<async_generator object %S at %p>",
                                o->ag_qualname, o);
}


static int
async_gen_init_hooks(PyAsyncGenObject *o)
{
    TyThreadState *tstate;
    TyObject *finalizer;
    TyObject *firstiter;

    if (o->ag_hooks_inited) {
        return 0;
    }

    o->ag_hooks_inited = 1;

    tstate = _TyThreadState_GET();

    finalizer = tstate->async_gen_finalizer;
    if (finalizer) {
        o->ag_origin_or_finalizer = Ty_NewRef(finalizer);
    }

    firstiter = tstate->async_gen_firstiter;
    if (firstiter) {
        TyObject *res;

        Ty_INCREF(firstiter);
        res = PyObject_CallOneArg(firstiter, (TyObject *)o);
        Ty_DECREF(firstiter);
        if (res == NULL) {
            return 1;
        }
        Ty_DECREF(res);
    }

    return 0;
}


static TyObject *
async_gen_anext(TyObject *self)
{
    PyAsyncGenObject *ag = _PyAsyncGenObject_CAST(self);
    if (async_gen_init_hooks(ag)) {
        return NULL;
    }
    return async_gen_asend_new(ag, NULL);
}


static TyObject *
async_gen_asend(TyObject *op, TyObject *arg)
{
    PyAsyncGenObject *o = (PyAsyncGenObject*)op;
    if (async_gen_init_hooks(o)) {
        return NULL;
    }
    return async_gen_asend_new(o, arg);
}


static TyObject *
async_gen_aclose(TyObject *op, TyObject *arg)
{
    PyAsyncGenObject *o = (PyAsyncGenObject*)op;
    if (async_gen_init_hooks(o)) {
        return NULL;
    }
    return async_gen_athrow_new(o, NULL);
}

static TyObject *
async_gen_athrow(TyObject *op, TyObject *args)
{
    PyAsyncGenObject *o = (PyAsyncGenObject*)op;
    if (TyTuple_GET_SIZE(args) > 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                            "the (type, exc, tb) signature of athrow() is deprecated, "
                            "use the single-arg signature instead.",
                            1) < 0) {
            return NULL;
        }
    }
    if (async_gen_init_hooks(o)) {
        return NULL;
    }
    return async_gen_athrow_new(o, args);
}

static TyObject *
ag_getframe(TyObject *ag, void *Py_UNUSED(ignored))
{
    return _gen_getframe((PyGenObject *)ag, "ag_frame");
}

static TyObject *
ag_getcode(TyObject *gen, void *Py_UNUSED(ignored))
{
    return _gen_getcode((PyGenObject*)gen, "ag_code");
}

static TyObject *
ag_getsuspended(TyObject *self, void *Py_UNUSED(ignored))
{
    PyAsyncGenObject *ag = _PyAsyncGenObject_CAST(self);
    if (FRAME_STATE_SUSPENDED(ag->ag_frame_state)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyGetSetDef async_gen_getsetlist[] = {
    {"__name__", gen_get_name, gen_set_name,
     TyDoc_STR("name of the async generator")},
    {"__qualname__", gen_get_qualname, gen_set_qualname,
     TyDoc_STR("qualified name of the async generator")},
    {"ag_await", coro_get_cr_await, NULL,
     TyDoc_STR("object being awaited on, or None")},
     {"ag_frame", ag_getframe, NULL, NULL},
     {"ag_code", ag_getcode, NULL, NULL},
     {"ag_suspended", ag_getsuspended, NULL, NULL},
    {NULL} /* Sentinel */
};

static TyMemberDef async_gen_memberlist[] = {
    {"ag_running", Ty_T_BOOL,   offsetof(PyAsyncGenObject, ag_running_async),
        Py_READONLY},
    {NULL}      /* Sentinel */
};

TyDoc_STRVAR(async_aclose_doc,
"aclose() -> raise GeneratorExit inside generator.");

TyDoc_STRVAR(async_asend_doc,
"asend(v) -> send 'v' in generator.");

TyDoc_STRVAR(async_athrow_doc,
"athrow(value)\n\
athrow(type[,value[,tb]])\n\
\n\
raise exception in generator.\n\
the (type, val, tb) signature is deprecated, \n\
and may be removed in a future version of Python.");

static TyMethodDef async_gen_methods[] = {
    {"asend", async_gen_asend, METH_O, async_asend_doc},
    {"athrow", async_gen_athrow, METH_VARARGS, async_athrow_doc},
    {"aclose", async_gen_aclose, METH_NOARGS, async_aclose_doc},
    {"__sizeof__", gen_sizeof, METH_NOARGS, sizeof__doc__},
    {"__class_getitem__",    Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    {NULL, NULL}        /* Sentinel */
};


static TyAsyncMethods async_gen_as_async = {
    0,                                          /* am_await */
    PyObject_SelfIter,                          /* am_aiter */
    async_gen_anext,                            /* am_anext */
    TyGen_am_send,                              /* am_send  */
};


TyTypeObject PyAsyncGen_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "async_generator",                          /* tp_name */
    offsetof(PyAsyncGenObject, ag_iframe.localsplus), /* tp_basicsize */
    sizeof(TyObject *),                         /* tp_itemsize */
    /* methods */
    gen_dealloc,                                /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &async_gen_as_async,                        /* tp_as_async */
    async_gen_repr,                             /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    async_gen_traverse,                         /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(PyAsyncGenObject, ag_weakreflist), /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    async_gen_methods,                          /* tp_methods */
    async_gen_memberlist,                       /* tp_members */
    async_gen_getsetlist,                       /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    0,                                          /* tp_free */
    0,                                          /* tp_is_gc */
    0,                                          /* tp_bases */
    0,                                          /* tp_mro */
    0,                                          /* tp_cache */
    0,                                          /* tp_subclasses */
    0,                                          /* tp_weaklist */
    0,                                          /* tp_del */
    0,                                          /* tp_version_tag */
    _TyGen_Finalize,                            /* tp_finalize */
};


TyObject *
PyAsyncGen_New(PyFrameObject *f, TyObject *name, TyObject *qualname)
{
    PyAsyncGenObject *ag;
    ag = (PyAsyncGenObject *)gen_new_with_qualname(&PyAsyncGen_Type, f,
                                                   name, qualname);
    if (ag == NULL) {
        return NULL;
    }

    ag->ag_origin_or_finalizer = NULL;
    ag->ag_closed = 0;
    ag->ag_hooks_inited = 0;
    ag->ag_running_async = 0;
    return (TyObject*)ag;
}

static TyObject *
async_gen_unwrap_value(PyAsyncGenObject *gen, TyObject *result)
{
    if (result == NULL) {
        if (!TyErr_Occurred()) {
            TyErr_SetNone(TyExc_StopAsyncIteration);
        }

        if (TyErr_ExceptionMatches(TyExc_StopAsyncIteration)
            || TyErr_ExceptionMatches(TyExc_GeneratorExit)
        ) {
            gen->ag_closed = 1;
        }

        gen->ag_running_async = 0;
        return NULL;
    }

    if (_PyAsyncGenWrappedValue_CheckExact(result)) {
        /* async yield */
        _TyGen_SetStopIterationValue(((_PyAsyncGenWrappedValue*)result)->agw_val);
        Ty_DECREF(result);
        gen->ag_running_async = 0;
        return NULL;
    }

    return result;
}


/* ---------- Async Generator ASend Awaitable ------------ */


static void
async_gen_asend_dealloc(TyObject *self)
{
    assert(PyAsyncGenASend_CheckExact(self));
    PyAsyncGenASend *ags = _PyAsyncGenASend_CAST(self);

    if (PyObject_CallFinalizerFromDealloc(self)) {
        return;
    }

    _TyObject_GC_UNTRACK(self);
    Ty_CLEAR(ags->ags_gen);
    Ty_CLEAR(ags->ags_sendval);

    _TyGC_CLEAR_FINALIZED(self);

    _Ty_FREELIST_FREE(async_gen_asends, self, PyObject_GC_Del);
}

static int
async_gen_asend_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyAsyncGenASend *ags = _PyAsyncGenASend_CAST(self);
    Ty_VISIT(ags->ags_gen);
    Ty_VISIT(ags->ags_sendval);
    return 0;
}


static TyObject *
async_gen_asend_send(TyObject *self, TyObject *arg)
{
    PyAsyncGenASend *o = _PyAsyncGenASend_CAST(self);
    if (o->ags_state == AWAITABLE_STATE_CLOSED) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "cannot reuse already awaited __anext__()/asend()");
        return NULL;
    }

    if (o->ags_state == AWAITABLE_STATE_INIT) {
        if (o->ags_gen->ag_running_async) {
            o->ags_state = AWAITABLE_STATE_CLOSED;
            TyErr_SetString(
                TyExc_RuntimeError,
                "anext(): asynchronous generator is already running");
            return NULL;
        }

        if (arg == NULL || arg == Ty_None) {
            arg = o->ags_sendval;
        }
        o->ags_state = AWAITABLE_STATE_ITER;
    }

    o->ags_gen->ag_running_async = 1;
    TyObject *result = gen_send((TyObject*)o->ags_gen, arg);
    result = async_gen_unwrap_value(o->ags_gen, result);

    if (result == NULL) {
        o->ags_state = AWAITABLE_STATE_CLOSED;
    }

    return result;
}


static TyObject *
async_gen_asend_iternext(TyObject *ags)
{
    return async_gen_asend_send(ags, NULL);
}


static TyObject *
async_gen_asend_throw(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    PyAsyncGenASend *o = _PyAsyncGenASend_CAST(self);

    if (o->ags_state == AWAITABLE_STATE_CLOSED) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "cannot reuse already awaited __anext__()/asend()");
        return NULL;
    }

    if (o->ags_state == AWAITABLE_STATE_INIT) {
        if (o->ags_gen->ag_running_async) {
            o->ags_state = AWAITABLE_STATE_CLOSED;
            TyErr_SetString(
                TyExc_RuntimeError,
                "anext(): asynchronous generator is already running");
            return NULL;
        }

        o->ags_state = AWAITABLE_STATE_ITER;
        o->ags_gen->ag_running_async = 1;
    }

    TyObject *result = gen_throw((TyObject*)o->ags_gen, args, nargs);
    result = async_gen_unwrap_value(o->ags_gen, result);

    if (result == NULL) {
        o->ags_gen->ag_running_async = 0;
        o->ags_state = AWAITABLE_STATE_CLOSED;
    }

    return result;
}


static TyObject *
async_gen_asend_close(TyObject *self, TyObject *args)
{
    PyAsyncGenASend *o = _PyAsyncGenASend_CAST(self);
    if (o->ags_state == AWAITABLE_STATE_CLOSED) {
        Py_RETURN_NONE;
    }

    TyObject *result = async_gen_asend_throw(self, &TyExc_GeneratorExit, 1);
    if (result == NULL) {
        if (TyErr_ExceptionMatches(TyExc_StopIteration) ||
            TyErr_ExceptionMatches(TyExc_StopAsyncIteration) ||
            TyErr_ExceptionMatches(TyExc_GeneratorExit))
        {
            TyErr_Clear();
            Py_RETURN_NONE;
        }
        return result;
    }

    Ty_DECREF(result);
    TyErr_SetString(TyExc_RuntimeError, "coroutine ignored GeneratorExit");
    return NULL;
}

static void
async_gen_asend_finalize(TyObject *self)
{
    PyAsyncGenASend *ags = _PyAsyncGenASend_CAST(self);
    if (ags->ags_state == AWAITABLE_STATE_INIT) {
        _TyErr_WarnUnawaitedAgenMethod(ags->ags_gen, &_Ty_ID(asend));
    }
}

static TyMethodDef async_gen_asend_methods[] = {
    {"send", async_gen_asend_send, METH_O, send_doc},
    {"throw", _PyCFunction_CAST(async_gen_asend_throw), METH_FASTCALL, throw_doc},
    {"close", async_gen_asend_close, METH_NOARGS, close_doc},
    {NULL, NULL}        /* Sentinel */
};


static TyAsyncMethods async_gen_asend_as_async = {
    PyObject_SelfIter,                          /* am_await */
    0,                                          /* am_aiter */
    0,                                          /* am_anext */
    0,                                          /* am_send  */
};


TyTypeObject _PyAsyncGenASend_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "async_generator_asend",                    /* tp_name */
    sizeof(PyAsyncGenASend),                    /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    async_gen_asend_dealloc,                    /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &async_gen_asend_as_async,                  /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    async_gen_asend_traverse,                   /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    async_gen_asend_iternext,                   /* tp_iternext */
    async_gen_asend_methods,                    /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    .tp_finalize = async_gen_asend_finalize,
};


static TyObject *
async_gen_asend_new(PyAsyncGenObject *gen, TyObject *sendval)
{
    PyAsyncGenASend *ags = _Ty_FREELIST_POP(PyAsyncGenASend, async_gen_asends);
    if (ags == NULL) {
        ags = PyObject_GC_New(PyAsyncGenASend, &_PyAsyncGenASend_Type);
        if (ags == NULL) {
            return NULL;
        }
    }

    ags->ags_gen = (PyAsyncGenObject*)Ty_NewRef(gen);
    ags->ags_sendval = Ty_XNewRef(sendval);
    ags->ags_state = AWAITABLE_STATE_INIT;

    _TyObject_GC_TRACK((TyObject*)ags);
    return (TyObject*)ags;
}


/* ---------- Async Generator Value Wrapper ------------ */


static void
async_gen_wrapped_val_dealloc(TyObject *self)
{
    _PyAsyncGenWrappedValue *agw = _PyAsyncGenWrappedValue_CAST(self);
    _TyObject_GC_UNTRACK(self);
    Ty_CLEAR(agw->agw_val);
    _Ty_FREELIST_FREE(async_gens, self, PyObject_GC_Del);
}


static int
async_gen_wrapped_val_traverse(TyObject *self, visitproc visit, void *arg)
{
    _PyAsyncGenWrappedValue *agw = _PyAsyncGenWrappedValue_CAST(self);
    Ty_VISIT(agw->agw_val);
    return 0;
}


TyTypeObject _PyAsyncGenWrappedValue_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "async_generator_wrapped_value",            /* tp_name */
    sizeof(_PyAsyncGenWrappedValue),            /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    async_gen_wrapped_val_dealloc,              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    async_gen_wrapped_val_traverse,             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
};


TyObject *
_PyAsyncGenValueWrapperNew(TyThreadState *tstate, TyObject *val)
{
    assert(val);

    _PyAsyncGenWrappedValue *o = _Ty_FREELIST_POP(_PyAsyncGenWrappedValue, async_gens);
    if (o == NULL) {
        o = PyObject_GC_New(_PyAsyncGenWrappedValue,
                            &_PyAsyncGenWrappedValue_Type);
        if (o == NULL) {
            return NULL;
        }
    }
    assert(_PyAsyncGenWrappedValue_CheckExact(o));
    o->agw_val = Ty_NewRef(val);
    _TyObject_GC_TRACK((TyObject*)o);
    return (TyObject*)o;
}


/* ---------- Async Generator AThrow awaitable ------------ */

#define _PyAsyncGenAThrow_CAST(op) \
    (assert(Ty_IS_TYPE((op), &_PyAsyncGenAThrow_Type)), \
     _Py_CAST(PyAsyncGenAThrow*, (op)))

static void
async_gen_athrow_dealloc(TyObject *self)
{
    PyAsyncGenAThrow *agt = _PyAsyncGenAThrow_CAST(self);
    if (PyObject_CallFinalizerFromDealloc(self)) {
        return;
    }

    _TyObject_GC_UNTRACK(self);
    Ty_CLEAR(agt->agt_gen);
    Ty_CLEAR(agt->agt_args);
    PyObject_GC_Del(self);
}


static int
async_gen_athrow_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyAsyncGenAThrow *agt = _PyAsyncGenAThrow_CAST(self);
    Ty_VISIT(agt->agt_gen);
    Ty_VISIT(agt->agt_args);
    return 0;
}


static TyObject *
async_gen_athrow_send(TyObject *self, TyObject *arg)
{
    PyAsyncGenAThrow *o = _PyAsyncGenAThrow_CAST(self);
    PyGenObject *gen = _TyGen_CAST(o->agt_gen);
    TyObject *retval;

    if (o->agt_state == AWAITABLE_STATE_CLOSED) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "cannot reuse already awaited aclose()/athrow()");
        return NULL;
    }

    if (FRAME_STATE_FINISHED(gen->gi_frame_state)) {
        o->agt_state = AWAITABLE_STATE_CLOSED;
        TyErr_SetNone(TyExc_StopIteration);
        return NULL;
    }

    if (o->agt_state == AWAITABLE_STATE_INIT) {
        if (o->agt_gen->ag_running_async) {
            o->agt_state = AWAITABLE_STATE_CLOSED;
            if (o->agt_args == NULL) {
                TyErr_SetString(
                    TyExc_RuntimeError,
                    "aclose(): asynchronous generator is already running");
            }
            else {
                TyErr_SetString(
                    TyExc_RuntimeError,
                    "athrow(): asynchronous generator is already running");
            }
            return NULL;
        }

        if (o->agt_gen->ag_closed) {
            o->agt_state = AWAITABLE_STATE_CLOSED;
            TyErr_SetNone(TyExc_StopAsyncIteration);
            return NULL;
        }

        if (arg != Ty_None) {
            TyErr_SetString(TyExc_RuntimeError, NON_INIT_CORO_MSG);
            return NULL;
        }

        o->agt_state = AWAITABLE_STATE_ITER;
        o->agt_gen->ag_running_async = 1;

        if (o->agt_args == NULL) {
            /* aclose() mode */
            o->agt_gen->ag_closed = 1;

            retval = _gen_throw((PyGenObject *)gen,
                                0,  /* Do not close generator when
                                       TyExc_GeneratorExit is passed */
                                TyExc_GeneratorExit, NULL, NULL);

            if (retval && _PyAsyncGenWrappedValue_CheckExact(retval)) {
                Ty_DECREF(retval);
                goto yield_close;
            }
        } else {
            TyObject *typ;
            TyObject *tb = NULL;
            TyObject *val = NULL;

            if (!TyArg_UnpackTuple(o->agt_args, "athrow", 1, 3,
                                   &typ, &val, &tb)) {
                return NULL;
            }

            retval = _gen_throw((PyGenObject *)gen,
                                0,  /* Do not close generator when
                                       TyExc_GeneratorExit is passed */
                                typ, val, tb);
            retval = async_gen_unwrap_value(o->agt_gen, retval);
        }
        if (retval == NULL) {
            goto check_error;
        }
        return retval;
    }

    assert(o->agt_state == AWAITABLE_STATE_ITER);

    retval = gen_send((TyObject *)gen, arg);
    if (o->agt_args) {
        return async_gen_unwrap_value(o->agt_gen, retval);
    } else {
        /* aclose() mode */
        if (retval) {
            if (_PyAsyncGenWrappedValue_CheckExact(retval)) {
                Ty_DECREF(retval);
                goto yield_close;
            }
            else {
                return retval;
            }
        }
        else {
            goto check_error;
        }
    }

yield_close:
    o->agt_gen->ag_running_async = 0;
    o->agt_state = AWAITABLE_STATE_CLOSED;
    TyErr_SetString(
        TyExc_RuntimeError, ASYNC_GEN_IGNORED_EXIT_MSG);
    return NULL;

check_error:
    o->agt_gen->ag_running_async = 0;
    o->agt_state = AWAITABLE_STATE_CLOSED;
    if (TyErr_ExceptionMatches(TyExc_StopAsyncIteration) ||
            TyErr_ExceptionMatches(TyExc_GeneratorExit))
    {
        if (o->agt_args == NULL) {
            /* when aclose() is called we don't want to propagate
               StopAsyncIteration or GeneratorExit; just raise
               StopIteration, signalling that this 'aclose()' await
               is done.
            */
            TyErr_Clear();
            TyErr_SetNone(TyExc_StopIteration);
        }
    }
    return NULL;
}


static TyObject *
async_gen_athrow_throw(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    PyAsyncGenAThrow *o = _PyAsyncGenAThrow_CAST(self);

    if (o->agt_state == AWAITABLE_STATE_CLOSED) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "cannot reuse already awaited aclose()/athrow()");
        return NULL;
    }

    if (o->agt_state == AWAITABLE_STATE_INIT) {
        if (o->agt_gen->ag_running_async) {
            o->agt_state = AWAITABLE_STATE_CLOSED;
            if (o->agt_args == NULL) {
                TyErr_SetString(
                    TyExc_RuntimeError,
                    "aclose(): asynchronous generator is already running");
            }
            else {
                TyErr_SetString(
                    TyExc_RuntimeError,
                    "athrow(): asynchronous generator is already running");
            }
            return NULL;
        }

        o->agt_state = AWAITABLE_STATE_ITER;
        o->agt_gen->ag_running_async = 1;
    }

    TyObject *retval = gen_throw((TyObject*)o->agt_gen, args, nargs);
    if (o->agt_args) {
        retval = async_gen_unwrap_value(o->agt_gen, retval);
        if (retval == NULL) {
            o->agt_gen->ag_running_async = 0;
            o->agt_state = AWAITABLE_STATE_CLOSED;
        }
        return retval;
    }
    else {
        /* aclose() mode */
        if (retval && _PyAsyncGenWrappedValue_CheckExact(retval)) {
            o->agt_gen->ag_running_async = 0;
            o->agt_state = AWAITABLE_STATE_CLOSED;
            Ty_DECREF(retval);
            TyErr_SetString(TyExc_RuntimeError, ASYNC_GEN_IGNORED_EXIT_MSG);
            return NULL;
        }
        if (retval == NULL) {
            o->agt_gen->ag_running_async = 0;
            o->agt_state = AWAITABLE_STATE_CLOSED;
        }
        if (TyErr_ExceptionMatches(TyExc_StopAsyncIteration) ||
            TyErr_ExceptionMatches(TyExc_GeneratorExit))
        {
            /* when aclose() is called we don't want to propagate
               StopAsyncIteration or GeneratorExit; just raise
               StopIteration, signalling that this 'aclose()' await
               is done.
            */
            TyErr_Clear();
            TyErr_SetNone(TyExc_StopIteration);
        }
        return retval;
    }
}


static TyObject *
async_gen_athrow_iternext(TyObject *agt)
{
    return async_gen_athrow_send(agt, Ty_None);
}


static TyObject *
async_gen_athrow_close(TyObject *self, TyObject *args)
{
    PyAsyncGenAThrow *agt = _PyAsyncGenAThrow_CAST(self);
    if (agt->agt_state == AWAITABLE_STATE_CLOSED) {
        Py_RETURN_NONE;
    }
    TyObject *result = async_gen_athrow_throw((TyObject*)agt,
                                              &TyExc_GeneratorExit, 1);
    if (result == NULL) {
        if (TyErr_ExceptionMatches(TyExc_StopIteration) ||
            TyErr_ExceptionMatches(TyExc_StopAsyncIteration) ||
            TyErr_ExceptionMatches(TyExc_GeneratorExit))
        {
            TyErr_Clear();
            Py_RETURN_NONE;
        }
        return result;
    } else {
        Ty_DECREF(result);
        TyErr_SetString(TyExc_RuntimeError, "coroutine ignored GeneratorExit");
        return NULL;
    }
}


static void
async_gen_athrow_finalize(TyObject *op)
{
    PyAsyncGenAThrow *o = (PyAsyncGenAThrow*)op;
    if (o->agt_state == AWAITABLE_STATE_INIT) {
        TyObject *method = o->agt_args ? &_Ty_ID(athrow) : &_Ty_ID(aclose);
        _TyErr_WarnUnawaitedAgenMethod(o->agt_gen, method);
    }
}

static TyMethodDef async_gen_athrow_methods[] = {
    {"send", async_gen_athrow_send, METH_O, send_doc},
    {"throw", _PyCFunction_CAST(async_gen_athrow_throw),
    METH_FASTCALL, throw_doc},
    {"close", async_gen_athrow_close, METH_NOARGS, close_doc},
    {NULL, NULL}        /* Sentinel */
};


static TyAsyncMethods async_gen_athrow_as_async = {
    PyObject_SelfIter,                          /* am_await */
    0,                                          /* am_aiter */
    0,                                          /* am_anext */
    0,                                          /* am_send  */
};


TyTypeObject _PyAsyncGenAThrow_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "async_generator_athrow",                   /* tp_name */
    sizeof(PyAsyncGenAThrow),                   /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    async_gen_athrow_dealloc,                   /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &async_gen_athrow_as_async,                 /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    async_gen_athrow_traverse,                  /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    async_gen_athrow_iternext,                  /* tp_iternext */
    async_gen_athrow_methods,                   /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    0,                                          /* tp_new */
    .tp_finalize = async_gen_athrow_finalize,
};


static TyObject *
async_gen_athrow_new(PyAsyncGenObject *gen, TyObject *args)
{
    PyAsyncGenAThrow *o;
    o = PyObject_GC_New(PyAsyncGenAThrow, &_PyAsyncGenAThrow_Type);
    if (o == NULL) {
        return NULL;
    }
    o->agt_gen = (PyAsyncGenObject*)Ty_NewRef(gen);
    o->agt_args = Ty_XNewRef(args);
    o->agt_state = AWAITABLE_STATE_INIT;
    _TyObject_GC_TRACK((TyObject*)o);
    return (TyObject*)o;
}
