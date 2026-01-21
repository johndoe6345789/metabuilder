/* Iterator objects */

#include "Python.h"
#include "pycore_abstract.h"      // _TyObject_HasLen()
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_genobject.h"     // _PyCoro_GetAwaitableIter()
#include "pycore_object.h"        // _TyObject_GC_TRACK()


typedef struct {
    PyObject_HEAD
    Ty_ssize_t it_index;
    TyObject *it_seq; /* Set to NULL when iterator is exhausted */
} seqiterobject;

TyObject *
TySeqIter_New(TyObject *seq)
{
    seqiterobject *it;

    if (!PySequence_Check(seq)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    it = PyObject_GC_New(seqiterobject, &TySeqIter_Type);
    if (it == NULL)
        return NULL;
    it->it_index = 0;
    it->it_seq = Ty_NewRef(seq);
    _TyObject_GC_TRACK(it);
    return (TyObject *)it;
}

static void
iter_dealloc(TyObject *op)
{
    seqiterobject *it = (seqiterobject*)op;
    _TyObject_GC_UNTRACK(it);
    Ty_XDECREF(it->it_seq);
    PyObject_GC_Del(it);
}

static int
iter_traverse(TyObject *op, visitproc visit, void *arg)
{
    seqiterobject *it = (seqiterobject*)op;
    Ty_VISIT(it->it_seq);
    return 0;
}

static TyObject *
iter_iternext(TyObject *iterator)
{
    seqiterobject *it;
    TyObject *seq;
    TyObject *result;

    assert(TySeqIter_Check(iterator));
    it = (seqiterobject *)iterator;
    seq = it->it_seq;
    if (seq == NULL)
        return NULL;
    if (it->it_index == PY_SSIZE_T_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "iter index too large");
        return NULL;
    }

    result = PySequence_GetItem(seq, it->it_index);
    if (result != NULL) {
        it->it_index++;
        return result;
    }
    if (TyErr_ExceptionMatches(TyExc_IndexError) ||
        TyErr_ExceptionMatches(TyExc_StopIteration))
    {
        TyErr_Clear();
        it->it_seq = NULL;
        Ty_DECREF(seq);
    }
    return NULL;
}

static TyObject *
iter_len(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    seqiterobject *it = (seqiterobject*)op;
    Ty_ssize_t seqsize, len;

    if (it->it_seq) {
        if (_TyObject_HasLen(it->it_seq)) {
            seqsize = PySequence_Size(it->it_seq);
            if (seqsize == -1)
                return NULL;
        }
        else {
            Py_RETURN_NOTIMPLEMENTED;
        }
        len = seqsize - it->it_index;
        if (len >= 0)
            return TyLong_FromSsize_t(len);
    }
    return TyLong_FromLong(0);
}

TyDoc_STRVAR(length_hint_doc, "Private method returning an estimate of len(list(it)).");

static TyObject *
iter_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    seqiterobject *it = (seqiterobject*)op;
    TyObject *iter = _TyEval_GetBuiltin(&_Ty_ID(iter));

    /* _TyEval_GetBuiltin can invoke arbitrary code,
     * call must be before access of iterator pointers.
     * see issue #101765 */

    if (it->it_seq != NULL)
        return Ty_BuildValue("N(O)n", iter, it->it_seq, it->it_index);
    else
        return Ty_BuildValue("N(())", iter);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyObject *
iter_setstate(TyObject *op, TyObject *state)
{
    seqiterobject *it = (seqiterobject*)op;
    Ty_ssize_t index = TyLong_AsSsize_t(state);
    if (index == -1 && TyErr_Occurred())
        return NULL;
    if (it->it_seq != NULL) {
        if (index < 0)
            index = 0;
        it->it_index = index;
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyMethodDef seqiter_methods[] = {
    {"__length_hint__", iter_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", iter_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", iter_setstate, METH_O, setstate_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject TySeqIter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "iterator",                                 /* tp_name */
    sizeof(seqiterobject),                      /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    iter_dealloc,                               /* tp_dealloc */
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
    iter_traverse,                              /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    iter_iternext,                              /* tp_iternext */
    seqiter_methods,                            /* tp_methods */
    0,                                          /* tp_members */
};

/* -------------------------------------- */

typedef struct {
    PyObject_HEAD
    TyObject *it_callable; /* Set to NULL when iterator is exhausted */
    TyObject *it_sentinel; /* Set to NULL when iterator is exhausted */
} calliterobject;

TyObject *
TyCallIter_New(TyObject *callable, TyObject *sentinel)
{
    calliterobject *it;
    it = PyObject_GC_New(calliterobject, &TyCallIter_Type);
    if (it == NULL)
        return NULL;
    it->it_callable = Ty_NewRef(callable);
    it->it_sentinel = Ty_NewRef(sentinel);
    _TyObject_GC_TRACK(it);
    return (TyObject *)it;
}
static void
calliter_dealloc(TyObject *op)
{
    calliterobject *it = (calliterobject*)op;
    _TyObject_GC_UNTRACK(it);
    Ty_XDECREF(it->it_callable);
    Ty_XDECREF(it->it_sentinel);
    PyObject_GC_Del(it);
}

static int
calliter_traverse(TyObject *op, visitproc visit, void *arg)
{
    calliterobject *it = (calliterobject*)op;
    Ty_VISIT(it->it_callable);
    Ty_VISIT(it->it_sentinel);
    return 0;
}

static TyObject *
calliter_iternext(TyObject *op)
{
    calliterobject *it = (calliterobject*)op;
    TyObject *result;

    if (it->it_callable == NULL) {
        return NULL;
    }

    result = _TyObject_CallNoArgs(it->it_callable);
    if (result != NULL && it->it_sentinel != NULL){
        int ok;

        ok = PyObject_RichCompareBool(it->it_sentinel, result, Py_EQ);
        if (ok == 0) {
            return result; /* Common case, fast path */
        }

        if (ok > 0) {
            Ty_CLEAR(it->it_callable);
            Ty_CLEAR(it->it_sentinel);
        }
    }
    else if (TyErr_ExceptionMatches(TyExc_StopIteration)) {
        TyErr_Clear();
        Ty_CLEAR(it->it_callable);
        Ty_CLEAR(it->it_sentinel);
    }
    Ty_XDECREF(result);
    return NULL;
}

static TyObject *
calliter_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    calliterobject *it = (calliterobject*)op;
    TyObject *iter = _TyEval_GetBuiltin(&_Ty_ID(iter));

    /* _TyEval_GetBuiltin can invoke arbitrary code,
     * call must be before access of iterator pointers.
     * see issue #101765 */

    if (it->it_callable != NULL && it->it_sentinel != NULL)
        return Ty_BuildValue("N(OO)", iter, it->it_callable, it->it_sentinel);
    else
        return Ty_BuildValue("N(())", iter);
}

static TyMethodDef calliter_methods[] = {
    {"__reduce__", calliter_reduce, METH_NOARGS, reduce_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject TyCallIter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "callable_iterator",                        /* tp_name */
    sizeof(calliterobject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    calliter_dealloc,                           /* tp_dealloc */
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
    calliter_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    calliter_iternext,                          /* tp_iternext */
    calliter_methods,                           /* tp_methods */
};


/* -------------------------------------- */

typedef struct {
    PyObject_HEAD
    TyObject *wrapped;
    TyObject *default_value;
} anextawaitableobject;

#define anextawaitableobject_CAST(op)   ((anextawaitableobject *)(op))

static void
anextawaitable_dealloc(TyObject *op)
{
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    _TyObject_GC_UNTRACK(obj);
    Ty_XDECREF(obj->wrapped);
    Ty_XDECREF(obj->default_value);
    PyObject_GC_Del(obj);
}

static int
anextawaitable_traverse(TyObject *op, visitproc visit, void *arg)
{
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    Ty_VISIT(obj->wrapped);
    Ty_VISIT(obj->default_value);
    return 0;
}

static TyObject *
anextawaitable_getiter(anextawaitableobject *obj)
{
    assert(obj->wrapped != NULL);
    TyObject *awaitable = _PyCoro_GetAwaitableIter(obj->wrapped);
    if (awaitable == NULL) {
        return NULL;
    }
    if (Ty_TYPE(awaitable)->tp_iternext == NULL) {
        /* _PyCoro_GetAwaitableIter returns a Coroutine, a Generator,
         * or an iterator. Of these, only coroutines lack tp_iternext.
         */
        assert(TyCoro_CheckExact(awaitable));
        unaryfunc getter = Ty_TYPE(awaitable)->tp_as_async->am_await;
        TyObject *new_awaitable = getter(awaitable);
        if (new_awaitable == NULL) {
            Ty_DECREF(awaitable);
            return NULL;
        }
        Ty_SETREF(awaitable, new_awaitable);
        if (!TyIter_Check(awaitable)) {
            TyErr_SetString(TyExc_TypeError,
                            "__await__ returned a non-iterable");
            Ty_DECREF(awaitable);
            return NULL;
        }
    }
    return awaitable;
}

static TyObject *
anextawaitable_iternext(TyObject *op)
{
    /* Consider the following class:
     *
     *     class A:
     *         async def __anext__(self):
     *             ...
     *     a = A()
     *
     * Then `await anext(a)` should call
     * a.__anext__().__await__().__next__()
     *
     * On the other hand, given
     *
     *     async def agen():
     *         yield 1
     *         yield 2
     *     gen = agen()
     *
     * Then `await anext(gen)` can just call
     * gen.__anext__().__next__()
     */
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    TyObject *awaitable = anextawaitable_getiter(obj);
    if (awaitable == NULL) {
        return NULL;
    }
    TyObject *result = (*Ty_TYPE(awaitable)->tp_iternext)(awaitable);
    Ty_DECREF(awaitable);
    if (result != NULL) {
        return result;
    }
    if (TyErr_ExceptionMatches(TyExc_StopAsyncIteration)) {
        TyErr_Clear();
        _TyGen_SetStopIterationValue(obj->default_value);
    }
    return NULL;
}


static TyObject *
anextawaitable_proxy(anextawaitableobject *obj, char *meth, TyObject *arg)
{
    TyObject *awaitable = anextawaitable_getiter(obj);
    if (awaitable == NULL) {
        return NULL;
    }
    // When specified, 'arg' may be a tuple (if coming from a METH_VARARGS
    // method) or a single object (if coming from a METH_O method).
    TyObject *ret = arg == NULL
        ? PyObject_CallMethod(awaitable, meth, NULL)
        : PyObject_CallMethod(awaitable, meth, "O", arg);
    Ty_DECREF(awaitable);
    if (ret != NULL) {
        return ret;
    }
    if (TyErr_ExceptionMatches(TyExc_StopAsyncIteration)) {
        /* `anextawaitableobject` is only used by `anext()` when
         * a default value is provided. So when we have a StopAsyncIteration
         * exception we replace it with a `StopIteration(default)`, as if
         * it was the return value of `__anext__()` coroutine.
         */
        TyErr_Clear();
        _TyGen_SetStopIterationValue(obj->default_value);
    }
    return NULL;
}


static TyObject *
anextawaitable_send(TyObject *op, TyObject *arg)
{
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    return anextawaitable_proxy(obj, "send", arg);
}


static TyObject *
anextawaitable_throw(TyObject *op, TyObject *args)
{
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    return anextawaitable_proxy(obj, "throw", args);
}


static TyObject *
anextawaitable_close(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    anextawaitableobject *obj = anextawaitableobject_CAST(op);
    return anextawaitable_proxy(obj, "close", NULL);
}


TyDoc_STRVAR(send_doc,
"send(arg) -> send 'arg' into the wrapped iterator,\n\
return next yielded value or raise StopIteration.");


TyDoc_STRVAR(throw_doc,
"throw(value)\n\
throw(typ[,val[,tb]])\n\
\n\
raise exception in the wrapped iterator, return next yielded value\n\
or raise StopIteration.\n\
the (type, val, tb) signature is deprecated, \n\
and may be removed in a future version of Python.");


TyDoc_STRVAR(close_doc,
"close() -> raise GeneratorExit inside generator.");


static TyMethodDef anextawaitable_methods[] = {
    {"send", anextawaitable_send, METH_O, send_doc},
    {"throw", anextawaitable_throw, METH_VARARGS, throw_doc},
    {"close", anextawaitable_close, METH_NOARGS, close_doc},
    {NULL, NULL}        /* Sentinel */
};


static TyAsyncMethods anextawaitable_as_async = {
    PyObject_SelfIter,                          /* am_await */
    0,                                          /* am_aiter */
    0,                                          /* am_anext */
    0,                                          /* am_send  */
};

TyTypeObject _PyAnextAwaitable_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "anext_awaitable",                          /* tp_name */
    sizeof(anextawaitableobject),               /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    anextawaitable_dealloc,                     /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    &anextawaitable_as_async,                   /* tp_as_async */
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
    anextawaitable_traverse,                    /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    anextawaitable_iternext,                    /* tp_iternext */
    anextawaitable_methods,                     /* tp_methods */
};

TyObject *
PyAnextAwaitable_New(TyObject *awaitable, TyObject *default_value)
{
    anextawaitableobject *anext = PyObject_GC_New(
            anextawaitableobject, &_PyAnextAwaitable_Type);
    if (anext == NULL) {
        return NULL;
    }
    anext->wrapped = Ty_NewRef(awaitable);
    anext->default_value = Ty_NewRef(default_value);
    _TyObject_GC_TRACK(anext);
    return (TyObject *)anext;
}
