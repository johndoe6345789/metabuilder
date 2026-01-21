/* Test PEP 688 - Buffers */

#include "parts.h"


#include <stddef.h>                 // offsetof

typedef struct {
    PyObject_HEAD
    TyObject *obj;
    Ty_ssize_t references;
} testBufObject;

#define testBufObject_CAST(op)  ((testBufObject *)(op))

static TyObject *
testbuf_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *obj = TyBytes_FromString("test");
    if (obj == NULL) {
        return NULL;
    }
    testBufObject *self = (testBufObject *)type->tp_alloc(type, 0);
    if (self == NULL) {
        Ty_DECREF(obj);
        return NULL;
    }
    self->obj = obj;
    self->references = 0;
    return (TyObject *)self;
}

static int
testbuf_traverse(TyObject *op, visitproc visit, void *arg)
{
    testBufObject *self = testBufObject_CAST(op);
    Ty_VISIT(self->obj);
    return 0;
}

static int
testbuf_clear(TyObject *op)
{
    testBufObject *self = testBufObject_CAST(op);
    Ty_CLEAR(self->obj);
    return 0;
}

static void
testbuf_dealloc(TyObject *op)
{
    testBufObject *self = testBufObject_CAST(op);
    PyObject_GC_UnTrack(self);
    Ty_XDECREF(self->obj);
    Ty_TYPE(self)->tp_free(self);
}

static int
testbuf_getbuf(TyObject *op, Ty_buffer *view, int flags)
{
    testBufObject *self = testBufObject_CAST(op);
    int buf = PyObject_GetBuffer(self->obj, view, flags);
    if (buf == 0) {
        Ty_SETREF(view->obj, Ty_NewRef(self));
        self->references++;
    }
    return buf;
}

static void
testbuf_releasebuf(TyObject *op, Ty_buffer *Py_UNUSED(view))
{
    testBufObject *self = testBufObject_CAST(op);
    self->references--;
    assert(self->references >= 0);
}

static PyBufferProcs testbuf_as_buffer = {
    .bf_getbuffer = testbuf_getbuf,
    .bf_releasebuffer = testbuf_releasebuf,
};

static struct TyMemberDef testbuf_members[] = {
    {"references", Ty_T_PYSSIZET, offsetof(testBufObject, references), Py_READONLY},
    {NULL},
};

static TyTypeObject testBufType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "testBufType",
    .tp_basicsize = sizeof(testBufObject),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_new = testbuf_new,
    .tp_dealloc = testbuf_dealloc,
    .tp_traverse = testbuf_traverse,
    .tp_clear = testbuf_clear,
    .tp_as_buffer = &testbuf_as_buffer,
    .tp_members = testbuf_members
};

int
_PyTestCapi_Init_Buffer(TyObject *m) {
    if (TyType_Ready(&testBufType) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "testBuf", (TyObject *)&testBufType)) {
        return -1;
    }

    return 0;
}
