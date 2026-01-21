/* PickleBuffer object implementation */

#include "Python.h"
#include "pycore_weakref.h"     // FT_CLEAR_WEAKREFS()
#include <stddef.h>

typedef struct {
    PyObject_HEAD
    /* The view exported by the original object */
    Ty_buffer view;
    TyObject *weakreflist;
} PyPickleBufferObject;

/* C API */

TyObject *
PyPickleBuffer_FromObject(TyObject *base)
{
    TyTypeObject *type = &PyPickleBuffer_Type;
    PyPickleBufferObject *self;

    self = (PyPickleBufferObject *) type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    self->view.obj = NULL;
    self->weakreflist = NULL;
    if (PyObject_GetBuffer(base, &self->view, PyBUF_FULL_RO) < 0) {
        Ty_DECREF(self);
        return NULL;
    }
    return (TyObject *) self;
}

const Ty_buffer *
PyPickleBuffer_GetBuffer(TyObject *obj)
{
    PyPickleBufferObject *self = (PyPickleBufferObject *) obj;

    if (!PyPickleBuffer_Check(obj)) {
        TyErr_Format(TyExc_TypeError,
                     "expected PickleBuffer, %.200s found",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }
    if (self->view.obj == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "operation forbidden on released PickleBuffer object");
        return NULL;
    }
    return &self->view;
}

int
PyPickleBuffer_Release(TyObject *obj)
{
    PyPickleBufferObject *self = (PyPickleBufferObject *) obj;

    if (!PyPickleBuffer_Check(obj)) {
        TyErr_Format(TyExc_TypeError,
                     "expected PickleBuffer, %.200s found",
                     Ty_TYPE(obj)->tp_name);
        return -1;
    }
    PyBuffer_Release(&self->view);
    return 0;
}

static TyObject *
picklebuf_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    PyPickleBufferObject *self;
    TyObject *base;
    char *keywords[] = {"", NULL};

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O:PickleBuffer",
                                     keywords, &base)) {
        return NULL;
    }

    self = (PyPickleBufferObject *) type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    self->view.obj = NULL;
    self->weakreflist = NULL;
    if (PyObject_GetBuffer(base, &self->view, PyBUF_FULL_RO) < 0) {
        Ty_DECREF(self);
        return NULL;
    }
    return (TyObject *) self;
}

static int
picklebuf_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    Ty_VISIT(self->view.obj);
    return 0;
}

static int
picklebuf_clear(TyObject *op)
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    PyBuffer_Release(&self->view);
    return 0;
}

static void
picklebuf_dealloc(TyObject *op)
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    PyObject_GC_UnTrack(self);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    PyBuffer_Release(&self->view);
    Ty_TYPE(self)->tp_free((TyObject *) self);
}

/* Buffer API */

static int
picklebuf_getbuf(TyObject *op, Ty_buffer *view, int flags)
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    if (self->view.obj == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "operation forbidden on released PickleBuffer object");
        return -1;
    }
    return PyObject_GetBuffer(self->view.obj, view, flags);
}

static void
picklebuf_releasebuf(TyObject *self, Ty_buffer *view)
{
    /* Since our bf_getbuffer redirects to the original object, this
     * implementation is never called.  It only exists to signal that
     * buffers exported by PickleBuffer have non-trivial releasing
     * behaviour (see check in Python/getargs.c).
     */
}

static PyBufferProcs picklebuf_as_buffer = {
    .bf_getbuffer = picklebuf_getbuf,
    .bf_releasebuffer = picklebuf_releasebuf,
};

/* Methods */

static TyObject *
picklebuf_raw(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    if (self->view.obj == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "operation forbidden on released PickleBuffer object");
        return NULL;
    }
    if (self->view.suboffsets != NULL
        || !PyBuffer_IsContiguous(&self->view, 'A')) {
        TyErr_SetString(TyExc_BufferError,
                        "cannot extract raw buffer from non-contiguous buffer");
        return NULL;
    }
    TyObject *m = TyMemoryView_FromObject((TyObject *) self);
    if (m == NULL) {
        return NULL;
    }
    PyMemoryViewObject *mv = (PyMemoryViewObject *) m;
    assert(mv->view.suboffsets == NULL);
    /* Mutate memoryview instance to make it a "raw" memoryview */
    mv->view.format = "B";
    mv->view.ndim = 1;
    mv->view.itemsize = 1;
    /* shape = (length,) */
    mv->view.shape = &mv->view.len;
    /* strides = (1,) */
    mv->view.strides = &mv->view.itemsize;
    /* Fix memoryview state flags */
    /* XXX Expose memoryobject.c's init_flags() instead? */
    mv->flags = _Ty_MEMORYVIEW_C | _Ty_MEMORYVIEW_FORTRAN;
    return m;
}

TyDoc_STRVAR(picklebuf_raw_doc,
"raw($self, /)\n--\n\
\n\
Return a memoryview of the raw memory underlying this buffer.\n\
Will raise BufferError is the buffer isn't contiguous.");

static TyObject *
picklebuf_release(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyPickleBufferObject *self = (PyPickleBufferObject*)op;
    PyBuffer_Release(&self->view);
    Py_RETURN_NONE;
}

TyDoc_STRVAR(picklebuf_release_doc,
"release($self, /)\n--\n\
\n\
Release the underlying buffer exposed by the PickleBuffer object.");

static TyMethodDef picklebuf_methods[] = {
    {"raw",     picklebuf_raw,     METH_NOARGS, picklebuf_raw_doc},
    {"release", picklebuf_release, METH_NOARGS, picklebuf_release_doc},
    {NULL,      NULL}
};

TyTypeObject PyPickleBuffer_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "pickle.PickleBuffer",
    .tp_doc = TyDoc_STR("Wrapper for potentially out-of-band buffers"),
    .tp_basicsize = sizeof(PyPickleBufferObject),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_new = picklebuf_new,
    .tp_dealloc = picklebuf_dealloc,
    .tp_traverse = picklebuf_traverse,
    .tp_clear = picklebuf_clear,
    .tp_weaklistoffset = offsetof(PyPickleBufferObject, weakreflist),
    .tp_as_buffer = &picklebuf_as_buffer,
    .tp_methods = picklebuf_methods,
};
