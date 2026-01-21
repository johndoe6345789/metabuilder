/* Cell object implementation */

#include "Python.h"
#include "pycore_cell.h"          // TyCell_GetRef()
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_object.h"

#define _PyCell_CAST(op) _Py_CAST(PyCellObject*, (op))

TyObject *
TyCell_New(TyObject *obj)
{
    PyCellObject *op;

    op = (PyCellObject *)PyObject_GC_New(PyCellObject, &TyCell_Type);
    if (op == NULL)
        return NULL;
    op->ob_ref = Ty_XNewRef(obj);

    _TyObject_GC_TRACK(op);
    return (TyObject *)op;
}

TyDoc_STRVAR(cell_new_doc,
"cell([contents])\n"
"--\n"
"\n"
"Create a new cell object.\n"
"\n"
"  contents\n"
"    the contents of the cell. If not specified, the cell will be empty,\n"
"    and \n further attempts to access its cell_contents attribute will\n"
"    raise a ValueError.");


static TyObject *
cell_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyObject *obj = NULL;

    if (!_TyArg_NoKeywords("cell", kwargs)) {
        goto exit;
    }
    /* min = 0: we allow the cell to be empty */
    if (!TyArg_UnpackTuple(args, "cell", 0, 1, &obj)) {
        goto exit;
    }
    return_value = TyCell_New(obj);

exit:
    return return_value;
}

TyObject *
TyCell_Get(TyObject *op)
{
    if (!TyCell_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return TyCell_GetRef((PyCellObject *)op);
}

int
TyCell_Set(TyObject *op, TyObject *value)
{
    if (!TyCell_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    TyCell_SetTakeRef((PyCellObject *)op, Ty_XNewRef(value));
    return 0;
}

static void
cell_dealloc(TyObject *self)
{
    PyCellObject *op = _PyCell_CAST(self);
    _TyObject_GC_UNTRACK(op);
    Ty_XDECREF(op->ob_ref);
    PyObject_GC_Del(op);
}

static TyObject *
cell_compare_impl(TyObject *a, TyObject *b, int op)
{
    if (a != NULL && b != NULL) {
        return PyObject_RichCompare(a, b, op);
    }
    else {
        Py_RETURN_RICHCOMPARE(b == NULL, a == NULL, op);
    }
}

static TyObject *
cell_richcompare(TyObject *a, TyObject *b, int op)
{
    /* neither argument should be NULL, unless something's gone wrong */
    assert(a != NULL && b != NULL);

    /* both arguments should be instances of PyCellObject */
    if (!TyCell_Check(a) || !TyCell_Check(b)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    TyObject *a_ref = TyCell_GetRef((PyCellObject *)a);
    TyObject *b_ref = TyCell_GetRef((PyCellObject *)b);

    /* compare cells by contents; empty cells come before anything else */
    TyObject *res = cell_compare_impl(a_ref, b_ref, op);

    Ty_XDECREF(a_ref);
    Ty_XDECREF(b_ref);
    return res;
}

static TyObject *
cell_repr(TyObject *self)
{
    TyObject *ref = TyCell_GetRef((PyCellObject *)self);
    if (ref == NULL) {
        return TyUnicode_FromFormat("<cell at %p: empty>", self);
    }
    TyObject *res = TyUnicode_FromFormat("<cell at %p: %.80s object at %p>",
                                         self, Ty_TYPE(ref)->tp_name, ref);
    Ty_DECREF(ref);
    return res;
}

static int
cell_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyCellObject *op = _PyCell_CAST(self);
    Ty_VISIT(op->ob_ref);
    return 0;
}

static int
cell_clear(TyObject *self)
{
    PyCellObject *op = _PyCell_CAST(self);
    Ty_CLEAR(op->ob_ref);
    return 0;
}

static TyObject *
cell_get_contents(TyObject *self, void *closure)
{
    PyCellObject *op = _PyCell_CAST(self);
    TyObject *res = TyCell_GetRef(op);
    if (res == NULL) {
        TyErr_SetString(TyExc_ValueError, "Cell is empty");
        return NULL;
    }
    return res;
}

static int
cell_set_contents(TyObject *self, TyObject *obj, void *Py_UNUSED(ignored))
{
    PyCellObject *cell = _PyCell_CAST(self);
    Ty_XINCREF(obj);
    TyCell_SetTakeRef((PyCellObject *)cell, obj);
    return 0;
}

static TyGetSetDef cell_getsetlist[] = {
    {"cell_contents", cell_get_contents, cell_set_contents, NULL},
    {NULL} /* sentinel */
};

TyTypeObject TyCell_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "cell",
    sizeof(PyCellObject),
    0,
    cell_dealloc,                               /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    cell_repr,                                  /* tp_repr */
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
    cell_new_doc,                               /* tp_doc */
    cell_traverse,                              /* tp_traverse */
    cell_clear,                                 /* tp_clear */
    cell_richcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    0,                                          /* tp_members */
    cell_getsetlist,                            /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    cell_new,                                   /* tp_new */
    0,                                          /* tp_free */
};
