/*
Written by Jim Hugunin and Chris Chase.

This includes both the singular ellipsis object and slice objects.

Guido, feel free to do whatever you want in the way of copyrights
for this file.
*/

/*
Ty_Ellipsis encodes the '...' rubber index token. It is similar to
the Ty_NoneStruct in that there is no way to create other objects of
this type and there is exactly one in existence.
*/

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_freelist.h"      // _Ty_FREELIST_FREE(), _Ty_FREELIST_POP()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_object.h"        // _TyObject_GC_TRACK()


#define _PySlice_CAST(op) _Py_CAST(PySliceObject*, (op))


static TyObject *
ellipsis_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || (kwargs && TyDict_GET_SIZE(kwargs))) {
        TyErr_SetString(TyExc_TypeError, "EllipsisType takes no arguments");
        return NULL;
    }
    return Ty_Ellipsis;
}

static void
ellipsis_dealloc(TyObject *ellipsis)
{
    /* This should never get called, but we also don't want to SEGV if
     * we accidentally decref Ellipsis out of existence. Instead,
     * since Ellipsis is an immortal object, re-set the reference count.
     */
    _Ty_SetImmortal(ellipsis);
}

static TyObject *
ellipsis_repr(TyObject *op)
{
    return TyUnicode_FromString("Ellipsis");
}

static TyObject *
ellipsis_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("Ellipsis");
}

static TyMethodDef ellipsis_methods[] = {
    {"__reduce__", ellipsis_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

TyDoc_STRVAR(ellipsis_doc,
"ellipsis()\n"
"--\n\n"
"The type of the Ellipsis singleton.");

TyTypeObject PyEllipsis_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "ellipsis",                         /* tp_name */
    0,                                  /* tp_basicsize */
    0,                                  /* tp_itemsize */
    ellipsis_dealloc,                   /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    ellipsis_repr,                      /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT,                 /* tp_flags */
    ellipsis_doc,                       /* tp_doc */
    0,                                  /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    0,                                  /* tp_iter */
    0,                                  /* tp_iternext */
    ellipsis_methods,                   /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    0,                                  /* tp_alloc */
    ellipsis_new,                       /* tp_new */
};

TyObject _Ty_EllipsisObject = _TyObject_HEAD_INIT(&PyEllipsis_Type);


/* Slice object implementation */

/* start, stop, and step are python objects with None indicating no
   index is present.
*/

static PySliceObject *
_PyBuildSlice_Consume2(TyObject *start, TyObject *stop, TyObject *step)
{
    assert(start != NULL && stop != NULL && step != NULL);
    PySliceObject *obj = _Ty_FREELIST_POP(PySliceObject, slices);
    if (obj == NULL) {
        obj = PyObject_GC_New(PySliceObject, &TySlice_Type);
        if (obj == NULL) {
            goto error;
        }
    }

    obj->start = start;
    obj->stop = stop;
    obj->step = Ty_NewRef(step);

    _TyObject_GC_TRACK(obj);
    return obj;
error:
    Ty_DECREF(start);
    Ty_DECREF(stop);
    return NULL;
}

TyObject *
TySlice_New(TyObject *start, TyObject *stop, TyObject *step)
{
    if (step == NULL) {
        step = Ty_None;
    }
    if (start == NULL) {
        start = Ty_None;
    }
    if (stop == NULL) {
        stop = Ty_None;
    }
    return (TyObject *)_PyBuildSlice_Consume2(Ty_NewRef(start),
                                              Ty_NewRef(stop), step);
}

TyObject *
_PyBuildSlice_ConsumeRefs(TyObject *start, TyObject *stop)
{
    assert(start != NULL && stop != NULL);
    return (TyObject *)_PyBuildSlice_Consume2(start, stop, Ty_None);
}

TyObject *
_PySlice_FromIndices(Ty_ssize_t istart, Ty_ssize_t istop)
{
    TyObject *start, *end, *slice;
    start = TyLong_FromSsize_t(istart);
    if (!start)
        return NULL;
    end = TyLong_FromSsize_t(istop);
    if (!end) {
        Ty_DECREF(start);
        return NULL;
    }

    slice = TySlice_New(start, end, NULL);
    Ty_DECREF(start);
    Ty_DECREF(end);
    return slice;
}

int
TySlice_GetIndices(TyObject *_r, Ty_ssize_t length,
                   Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t *step)
{
    PySliceObject *r = (PySliceObject*)_r;
    /* XXX support long ints */
    if (r->step == Ty_None) {
        *step = 1;
    } else {
        if (!TyLong_Check(r->step)) return -1;
        *step = TyLong_AsSsize_t(r->step);
    }
    if (r->start == Ty_None) {
        *start = *step < 0 ? length-1 : 0;
    } else {
        if (!TyLong_Check(r->start)) return -1;
        *start = TyLong_AsSsize_t(r->start);
        if (*start < 0) *start += length;
    }
    if (r->stop == Ty_None) {
        *stop = *step < 0 ? -1 : length;
    } else {
        if (!TyLong_Check(r->stop)) return -1;
        *stop = TyLong_AsSsize_t(r->stop);
        if (*stop < 0) *stop += length;
    }
    if (*stop > length) return -1;
    if (*start >= length) return -1;
    if (*step == 0) return -1;
    return 0;
}

int
TySlice_Unpack(TyObject *_r,
               Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t *step)
{
    PySliceObject *r = (PySliceObject*)_r;
    /* this is harder to get right than you might think */

    static_assert(PY_SSIZE_T_MIN + 1 <= -PY_SSIZE_T_MAX,
                  "-PY_SSIZE_T_MAX < PY_SSIZE_T_MIN + 1");

    if (r->step == Ty_None) {
        *step = 1;
    }
    else {
        if (!_TyEval_SliceIndex(r->step, step)) return -1;
        if (*step == 0) {
            TyErr_SetString(TyExc_ValueError,
                            "slice step cannot be zero");
            return -1;
        }
        /* Here *step might be -PY_SSIZE_T_MAX-1; in this case we replace it
         * with -PY_SSIZE_T_MAX.  This doesn't affect the semantics, and it
         * guards against later undefined behaviour resulting from code that
         * does "step = -step" as part of a slice reversal.
         */
        if (*step < -PY_SSIZE_T_MAX)
            *step = -PY_SSIZE_T_MAX;
    }

    if (r->start == Ty_None) {
        *start = *step < 0 ? PY_SSIZE_T_MAX : 0;
    }
    else {
        if (!_TyEval_SliceIndex(r->start, start)) return -1;
    }

    if (r->stop == Ty_None) {
        *stop = *step < 0 ? PY_SSIZE_T_MIN : PY_SSIZE_T_MAX;
    }
    else {
        if (!_TyEval_SliceIndex(r->stop, stop)) return -1;
    }

    return 0;
}

Ty_ssize_t
TySlice_AdjustIndices(Ty_ssize_t length,
                      Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t step)
{
    /* this is harder to get right than you might think */

    assert(step != 0);
    assert(step >= -PY_SSIZE_T_MAX);

    if (*start < 0) {
        *start += length;
        if (*start < 0) {
            *start = (step < 0) ? -1 : 0;
        }
    }
    else if (*start >= length) {
        *start = (step < 0) ? length - 1 : length;
    }

    if (*stop < 0) {
        *stop += length;
        if (*stop < 0) {
            *stop = (step < 0) ? -1 : 0;
        }
    }
    else if (*stop >= length) {
        *stop = (step < 0) ? length - 1 : length;
    }

    if (step < 0) {
        if (*stop < *start) {
            return (*start - *stop - 1) / (-step) + 1;
        }
    }
    else {
        if (*start < *stop) {
            return (*stop - *start - 1) / step + 1;
        }
    }
    return 0;
}

#undef TySlice_GetIndicesEx

int
TySlice_GetIndicesEx(TyObject *_r, Ty_ssize_t length,
                     Ty_ssize_t *start, Ty_ssize_t *stop, Ty_ssize_t *step,
                     Ty_ssize_t *slicelength)
{
    if (TySlice_Unpack(_r, start, stop, step) < 0)
        return -1;
    *slicelength = TySlice_AdjustIndices(length, start, stop, *step);
    return 0;
}

static TyObject *
slice_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *start, *stop, *step;

    start = stop = step = NULL;

    if (!_TyArg_NoKeywords("slice", kw))
        return NULL;

    if (!TyArg_UnpackTuple(args, "slice", 1, 3, &start, &stop, &step))
        return NULL;

    /* This swapping of stop and start is to maintain similarity with
       range(). */
    if (stop == NULL) {
        stop = start;
        start = NULL;
    }
    return TySlice_New(start, stop, step);
}

TyDoc_STRVAR(slice_doc,
"slice(stop)\n\
slice(start, stop[, step])\n\
\n\
Create a slice object.  This is used for extended slicing (e.g. a[0:10:2]).");

static void
slice_dealloc(TyObject *op)
{
    PySliceObject *r = _PySlice_CAST(op);
    PyObject_GC_UnTrack(r);
    Ty_DECREF(r->step);
    Ty_DECREF(r->start);
    Ty_DECREF(r->stop);
    _Ty_FREELIST_FREE(slices, r, PyObject_GC_Del);
}

static TyObject *
slice_repr(TyObject *op)
{
    PySliceObject *r = _PySlice_CAST(op);
    return TyUnicode_FromFormat("slice(%R, %R, %R)",
                                r->start, r->stop, r->step);
}

static TyMemberDef slice_members[] = {
    {"start", _Ty_T_OBJECT, offsetof(PySliceObject, start), Py_READONLY},
    {"stop", _Ty_T_OBJECT, offsetof(PySliceObject, stop), Py_READONLY},
    {"step", _Ty_T_OBJECT, offsetof(PySliceObject, step), Py_READONLY},
    {0}
};

/* Helper function to convert a slice argument to a PyLong, and raise TypeError
   with a suitable message on failure. */

static TyObject*
evaluate_slice_index(TyObject *v)
{
    if (_PyIndex_Check(v)) {
        return PyNumber_Index(v);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "slice indices must be integers or "
                        "None or have an __index__ method");
        return NULL;
    }
}

/* Compute slice indices given a slice and length.  Return -1 on failure.  Used
   by slice.indices and rangeobject slicing.  Assumes that `len` is a
   nonnegative instance of PyLong. */

int
_PySlice_GetLongIndices(PySliceObject *self, TyObject *length,
                        TyObject **start_ptr, TyObject **stop_ptr,
                        TyObject **step_ptr)
{
    TyObject *start=NULL, *stop=NULL, *step=NULL;
    TyObject *upper=NULL, *lower=NULL;
    int step_is_negative, cmp_result;

    /* Convert step to an integer; raise for zero step. */
    if (self->step == Ty_None) {
        step = _TyLong_GetOne();
        step_is_negative = 0;
    }
    else {
        step = evaluate_slice_index(self->step);
        if (step == NULL) {
            goto error;
        }
        assert(TyLong_Check(step));

        int step_sign;
        (void)TyLong_GetSign(step, &step_sign);
        if (step_sign == 0) {
            TyErr_SetString(TyExc_ValueError,
                            "slice step cannot be zero");
            goto error;
        }
        step_is_negative = step_sign < 0;
    }

    /* Find lower and upper bounds for start and stop. */
    if (step_is_negative) {
        lower = TyLong_FromLong(-1L);
        if (lower == NULL)
            goto error;

        upper = PyNumber_Add(length, lower);
        if (upper == NULL)
            goto error;
    }
    else {
        lower = _TyLong_GetZero();
        upper = Ty_NewRef(length);
    }

    /* Compute start. */
    if (self->start == Ty_None) {
        start = Ty_NewRef(step_is_negative ? upper : lower);
    }
    else {
        start = evaluate_slice_index(self->start);
        if (start == NULL)
            goto error;

        if (_TyLong_IsNegative((PyLongObject *)start)) {
            /* start += length */
            TyObject *tmp = PyNumber_Add(start, length);
            Ty_SETREF(start, tmp);
            if (start == NULL)
                goto error;

            cmp_result = PyObject_RichCompareBool(start, lower, Py_LT);
            if (cmp_result < 0)
                goto error;
            if (cmp_result) {
                Ty_SETREF(start, Ty_NewRef(lower));
            }
        }
        else {
            cmp_result = PyObject_RichCompareBool(start, upper, Py_GT);
            if (cmp_result < 0)
                goto error;
            if (cmp_result) {
                Ty_SETREF(start, Ty_NewRef(upper));
            }
        }
    }

    /* Compute stop. */
    if (self->stop == Ty_None) {
        stop = Ty_NewRef(step_is_negative ? lower : upper);
    }
    else {
        stop = evaluate_slice_index(self->stop);
        if (stop == NULL)
            goto error;

        if (_TyLong_IsNegative((PyLongObject *)stop)) {
            /* stop += length */
            TyObject *tmp = PyNumber_Add(stop, length);
            Ty_SETREF(stop, tmp);
            if (stop == NULL)
                goto error;

            cmp_result = PyObject_RichCompareBool(stop, lower, Py_LT);
            if (cmp_result < 0)
                goto error;
            if (cmp_result) {
                Ty_SETREF(stop, Ty_NewRef(lower));
            }
        }
        else {
            cmp_result = PyObject_RichCompareBool(stop, upper, Py_GT);
            if (cmp_result < 0)
                goto error;
            if (cmp_result) {
                Ty_SETREF(stop, Ty_NewRef(upper));
            }
        }
    }

    *start_ptr = start;
    *stop_ptr = stop;
    *step_ptr = step;
    Ty_DECREF(upper);
    Ty_DECREF(lower);
    return 0;

  error:
    *start_ptr = *stop_ptr = *step_ptr = NULL;
    Ty_XDECREF(start);
    Ty_XDECREF(stop);
    Ty_XDECREF(step);
    Ty_XDECREF(upper);
    Ty_XDECREF(lower);
    return -1;
}

/* Implementation of slice.indices. */

static TyObject*
slice_indices(TyObject *op, TyObject* len)
{
    PySliceObject *self = _PySlice_CAST(op);
    TyObject *start, *stop, *step;
    TyObject *length;
    int error;

    /* Convert length to an integer if necessary; raise for negative length. */
    length = PyNumber_Index(len);
    if (length == NULL)
        return NULL;

    if (_TyLong_IsNegative((PyLongObject *)length)) {
        TyErr_SetString(TyExc_ValueError,
                        "length should not be negative");
        Ty_DECREF(length);
        return NULL;
    }

    error = _PySlice_GetLongIndices(self, length, &start, &stop, &step);
    Ty_DECREF(length);
    if (error == -1)
        return NULL;
    else
        return Ty_BuildValue("(NNN)", start, stop, step);
}

TyDoc_STRVAR(slice_indices_doc,
"S.indices(len) -> (start, stop, stride)\n\
\n\
Assuming a sequence of length len, calculate the start and stop\n\
indices, and the stride length of the extended slice described by\n\
S. Out of bounds indices are clipped in a manner consistent with the\n\
handling of normal slices.");

static TyObject *
slice_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PySliceObject *self = _PySlice_CAST(op);
    return Ty_BuildValue("O(OOO)", Ty_TYPE(self), self->start, self->stop, self->step);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyMethodDef slice_methods[] = {
    {"indices", slice_indices, METH_O, slice_indices_doc},
    {"__reduce__", slice_reduce, METH_NOARGS, reduce_doc},
    {NULL, NULL}
};

static TyObject *
slice_richcompare(TyObject *v, TyObject *w, int op)
{
    if (!TySlice_Check(v) || !TySlice_Check(w))
        Py_RETURN_NOTIMPLEMENTED;

    if (v == w) {
        TyObject *res;
        /* XXX Do we really need this shortcut?
           There's a unit test for it, but is that fair? */
        switch (op) {
        case Py_EQ:
        case Py_LE:
        case Py_GE:
            res = Ty_True;
            break;
        default:
            res = Ty_False;
            break;
        }
        return Ty_NewRef(res);
    }


    TyObject *t1 = TyTuple_Pack(3,
                                ((PySliceObject *)v)->start,
                                ((PySliceObject *)v)->stop,
                                ((PySliceObject *)v)->step);
    if (t1 == NULL) {
        return NULL;
    }

    TyObject *t2 = TyTuple_Pack(3,
                                ((PySliceObject *)w)->start,
                                ((PySliceObject *)w)->stop,
                                ((PySliceObject *)w)->step);
    if (t2 == NULL) {
        Ty_DECREF(t1);
        return NULL;
    }

    TyObject *res = PyObject_RichCompare(t1, t2, op);
    Ty_DECREF(t1);
    Ty_DECREF(t2);
    return res;
}

static int
slice_traverse(TyObject *op, visitproc visit, void *arg)
{
    PySliceObject *v = _PySlice_CAST(op);
    Ty_VISIT(v->start);
    Ty_VISIT(v->stop);
    Ty_VISIT(v->step);
    return 0;
}

/* code based on tuplehash() of Objects/tupleobject.c */
#if SIZEOF_PY_UHASH_T > 4
#define _PyHASH_XXPRIME_1 ((Ty_uhash_t)11400714785074694791ULL)
#define _PyHASH_XXPRIME_2 ((Ty_uhash_t)14029467366897019727ULL)
#define _PyHASH_XXPRIME_5 ((Ty_uhash_t)2870177450012600261ULL)
#define _PyHASH_XXROTATE(x) ((x << 31) | (x >> 33))  /* Rotate left 31 bits */
#else
#define _PyHASH_XXPRIME_1 ((Ty_uhash_t)2654435761UL)
#define _PyHASH_XXPRIME_2 ((Ty_uhash_t)2246822519UL)
#define _PyHASH_XXPRIME_5 ((Ty_uhash_t)374761393UL)
#define _PyHASH_XXROTATE(x) ((x << 13) | (x >> 19))  /* Rotate left 13 bits */
#endif

static Ty_hash_t
slice_hash(TyObject *op)
{
    PySliceObject *v = _PySlice_CAST(op);
    Ty_uhash_t acc = _PyHASH_XXPRIME_5;
#define _PyHASH_SLICE_PART(com) { \
    Ty_uhash_t lane = PyObject_Hash(v->com); \
    if(lane == (Ty_uhash_t)-1) { \
        return -1; \
    } \
    acc += lane * _PyHASH_XXPRIME_2; \
    acc = _PyHASH_XXROTATE(acc); \
    acc *= _PyHASH_XXPRIME_1; \
}
    _PyHASH_SLICE_PART(start);
    _PyHASH_SLICE_PART(stop);
    _PyHASH_SLICE_PART(step);
#undef _PyHASH_SLICE_PART
    if(acc == (Ty_uhash_t)-1) {
        return 1546275796;
    }
    return acc;
}

TyTypeObject TySlice_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "slice",                    /* Name of this type */
    sizeof(PySliceObject),      /* Basic object size */
    0,                          /* Item size for varobject */
    slice_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    slice_repr,                                 /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    slice_hash,                                 /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    slice_doc,                                  /* tp_doc */
    slice_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    slice_richcompare,                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    slice_methods,                              /* tp_methods */
    slice_members,                              /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    slice_new,                                  /* tp_new */
};
