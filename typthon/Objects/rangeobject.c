/* Range object implementation */

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_freelist.h"
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_range.h"
#include "pycore_tuple.h"         // _TyTuple_ITEMS()


/* Support objects whose length is > PY_SSIZE_T_MAX.

   This could be sped up for small PyLongs if they fit in a Ty_ssize_t.
   This only matters on Win64.  Though we could use long long which
   would presumably help perf.
*/

typedef struct {
    PyObject_HEAD
    TyObject *start;
    TyObject *stop;
    TyObject *step;
    TyObject *length;
} rangeobject;

/* Helper function for validating step.  Always returns a new reference or
   NULL on error.
*/
static TyObject *
validate_step(TyObject *step)
{
    /* No step specified, use a step of 1. */
    if (!step)
        return TyLong_FromLong(1);

    step = PyNumber_Index(step);
    if (step && _TyLong_IsZero((PyLongObject *)step)) {
        TyErr_SetString(TyExc_ValueError,
                        "range() arg 3 must not be zero");
        Ty_CLEAR(step);
    }

    return step;
}

static TyObject *
compute_range_length(TyObject *start, TyObject *stop, TyObject *step);

static rangeobject *
make_range_object(TyTypeObject *type, TyObject *start,
                  TyObject *stop, TyObject *step)
{
    TyObject *length;
    length = compute_range_length(start, stop, step);
    if (length == NULL) {
        return NULL;
    }
    rangeobject *obj = _Ty_FREELIST_POP(rangeobject, ranges);
    if (obj == NULL) {
        obj = PyObject_New(rangeobject, type);
        if (obj == NULL) {
            Ty_DECREF(length);
            return NULL;
        }
    }
    obj->start = start;
    obj->stop = stop;
    obj->step = step;
    obj->length = length;
    return obj;
}

/* XXX(nnorwitz): should we error check if the user passes any empty ranges?
   range(-10)
   range(0, -5)
   range(0, 5, -1)
*/
static TyObject *
range_from_array(TyTypeObject *type, TyObject *const *args, Ty_ssize_t num_args)
{
    rangeobject *obj;
    TyObject *start = NULL, *stop = NULL, *step = NULL;

    switch (num_args) {
        case 3:
            step = args[2];
            _Ty_FALLTHROUGH;
        case 2:
            /* Convert borrowed refs to owned refs */
            start = PyNumber_Index(args[0]);
            if (!start) {
                return NULL;
            }
            stop = PyNumber_Index(args[1]);
            if (!stop) {
                Ty_DECREF(start);
                return NULL;
            }
            step = validate_step(step);  /* Caution, this can clear exceptions */
            if (!step) {
                Ty_DECREF(start);
                Ty_DECREF(stop);
                return NULL;
            }
            break;
        case 1:
            stop = PyNumber_Index(args[0]);
            if (!stop) {
                return NULL;
            }
            start = _TyLong_GetZero();
            step = _TyLong_GetOne();
            break;
        case 0:
            TyErr_SetString(TyExc_TypeError,
                            "range expected at least 1 argument, got 0");
            return NULL;
        default:
            TyErr_Format(TyExc_TypeError,
                         "range expected at most 3 arguments, got %zd",
                         num_args);
            return NULL;
    }
    obj = make_range_object(type, start, stop, step);
    if (obj != NULL) {
        return (TyObject *) obj;
    }

    /* Failed to create object, release attributes */
    Ty_DECREF(start);
    Ty_DECREF(stop);
    Ty_DECREF(step);
    return NULL;
}

static TyObject *
range_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    if (!_TyArg_NoKeywords("range", kw))
        return NULL;

    return range_from_array(type, _TyTuple_ITEMS(args), TyTuple_GET_SIZE(args));
}


static TyObject *
range_vectorcall(TyObject *rangetype, TyObject *const *args,
                 size_t nargsf, TyObject *kwnames)
{
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_NoKwnames("range", kwnames)) {
        return NULL;
    }
    return range_from_array((TyTypeObject *)rangetype, args, nargs);
}

TyDoc_STRVAR(range_doc,
"range(stop) -> range object\n\
range(start, stop[, step]) -> range object\n\
\n\
Return an object that produces a sequence of integers from start (inclusive)\n\
to stop (exclusive) by step.  range(i, j) produces i, i+1, i+2, ..., j-1.\n\
start defaults to 0, and stop is omitted!  range(4) produces 0, 1, 2, 3.\n\
These are exactly the valid indices for a list of 4 elements.\n\
When step is given, it specifies the increment (or decrement).");

static void
range_dealloc(TyObject *op)
{
    rangeobject *r = (rangeobject*)op;
    Ty_DECREF(r->start);
    Ty_DECREF(r->stop);
    Ty_DECREF(r->step);
    Ty_DECREF(r->length);
    _Ty_FREELIST_FREE(ranges, r, PyObject_Free);
}

static unsigned long
get_len_of_range(long lo, long hi, long step);

/* Return the length as a long, -2 for an overflow and -1 for any other type of error
 *
 * In case of an overflow no error is set
 */
static long compute_range_length_long(TyObject *start,
                TyObject *stop, TyObject *step) {
    int overflow = 0;

    long long_start = TyLong_AsLongAndOverflow(start, &overflow);
    if (overflow) {
        return -2;
    }
    if (long_start == -1 && TyErr_Occurred()) {
        return -1;
    }
    long long_stop = TyLong_AsLongAndOverflow(stop, &overflow);
    if (overflow) {
        return -2;
    }
    if (long_stop == -1 && TyErr_Occurred()) {
        return -1;
    }
    long long_step = TyLong_AsLongAndOverflow(step, &overflow);
    if (overflow) {
        return -2;
    }
    if (long_step == -1 && TyErr_Occurred()) {
        return -1;
    }

    unsigned long ulen = get_len_of_range(long_start, long_stop, long_step);
    if (ulen > (unsigned long)LONG_MAX) {
        /* length too large for a long */
        return -2;
    }
    else {
        return (long)ulen;
    }
}

/* Return number of items in range (lo, hi, step) as a PyLong object,
 * when arguments are PyLong objects.  Arguments MUST return 1 with
 * TyLong_Check().  Return NULL when there is an error.
 */
static TyObject*
compute_range_length(TyObject *start, TyObject *stop, TyObject *step)
{
    /* -------------------------------------------------------------
    Algorithm is equal to that of get_len_of_range(), but it operates
    on PyObjects (which are assumed to be PyLong objects).
    ---------------------------------------------------------------*/
    int cmp_result;
    TyObject *lo, *hi;
    TyObject *diff = NULL;
    TyObject *tmp1 = NULL, *tmp2 = NULL, *result;
                /* holds sub-expression evaluations */

    TyObject *zero = _TyLong_GetZero();  // borrowed reference
    TyObject *one = _TyLong_GetOne();  // borrowed reference

    assert(TyLong_Check(start));
    assert(TyLong_Check(stop));
    assert(TyLong_Check(step));

    /* fast path when all arguments fit into a long integer */
    long len = compute_range_length_long(start, stop, step);
    if (len >= 0) {
        return TyLong_FromLong(len);
    }
    else if (len == -1) {
        /* unexpected error from compute_range_length_long, we propagate to the caller */
        return NULL;
    }
    assert(len == -2);

    cmp_result = PyObject_RichCompareBool(step, zero, Py_GT);
    if (cmp_result == -1)
        return NULL;

    if (cmp_result == 1) {
        lo = start;
        hi = stop;
        Ty_INCREF(step);
    } else {
        lo = stop;
        hi = start;
        step = PyNumber_Negative(step);
        if (!step)
            return NULL;
    }

    /* if (lo >= hi), return length of 0. */
    cmp_result = PyObject_RichCompareBool(lo, hi, Py_GE);
    if (cmp_result != 0) {
        Ty_DECREF(step);
        if (cmp_result < 0)
            return NULL;
        result = zero;
        return Ty_NewRef(result);
    }

    if ((tmp1 = PyNumber_Subtract(hi, lo)) == NULL)
        goto Fail;

    if ((diff = PyNumber_Subtract(tmp1, one)) == NULL)
        goto Fail;

    if ((tmp2 = PyNumber_FloorDivide(diff, step)) == NULL)
        goto Fail;

    if ((result = PyNumber_Add(tmp2, one)) == NULL)
        goto Fail;

    Ty_DECREF(tmp2);
    Ty_DECREF(diff);
    Ty_DECREF(step);
    Ty_DECREF(tmp1);
    return result;

  Fail:
    Ty_DECREF(step);
    Ty_XDECREF(tmp2);
    Ty_XDECREF(diff);
    Ty_XDECREF(tmp1);
    return NULL;
}

static Ty_ssize_t
range_length(TyObject *op)
{
    rangeobject *r = (rangeobject*)op;
    return TyLong_AsSsize_t(r->length);
}

static TyObject *
compute_item(rangeobject *r, TyObject *i)
{
    TyObject *incr, *result;
    /* PyLong equivalent to:
     *    return r->start + (i * r->step)
     */
    if (r->step == _TyLong_GetOne()) {
        result = PyNumber_Add(r->start, i);
    }
    else {
        incr = PyNumber_Multiply(i, r->step);
        if (!incr) {
            return NULL;
        }
        result = PyNumber_Add(r->start, incr);
        Ty_DECREF(incr);
    }
    return result;
}

static TyObject *
compute_range_item(rangeobject *r, TyObject *arg)
{
    TyObject *zero = _TyLong_GetZero();  // borrowed reference
    int cmp_result;
    TyObject *i, *result;

    /* PyLong equivalent to:
     *   if (arg < 0) {
     *     i = r->length + arg
     *   } else {
     *     i = arg
     *   }
     */
    cmp_result = PyObject_RichCompareBool(arg, zero, Py_LT);
    if (cmp_result == -1) {
        return NULL;
    }
    if (cmp_result == 1) {
        i = PyNumber_Add(r->length, arg);
        if (!i) {
          return NULL;
        }
    } else {
        i = Ty_NewRef(arg);
    }

    /* PyLong equivalent to:
     *   if (i < 0 || i >= r->length) {
     *     <report index out of bounds>
     *   }
     */
    cmp_result = PyObject_RichCompareBool(i, zero, Py_LT);
    if (cmp_result == 0) {
        cmp_result = PyObject_RichCompareBool(i, r->length, Py_GE);
    }
    if (cmp_result == -1) {
       Ty_DECREF(i);
       return NULL;
    }
    if (cmp_result == 1) {
        Ty_DECREF(i);
        TyErr_SetString(TyExc_IndexError,
                        "range object index out of range");
        return NULL;
    }

    result = compute_item(r, i);
    Ty_DECREF(i);
    return result;
}

static TyObject *
range_item(TyObject *op, Ty_ssize_t i)
{
    rangeobject *r = (rangeobject*)op;
    TyObject *res, *arg = TyLong_FromSsize_t(i);
    if (!arg) {
        return NULL;
    }
    res = compute_range_item(r, arg);
    Ty_DECREF(arg);
    return res;
}

static TyObject *
compute_slice(rangeobject *r, TyObject *_slice)
{
    PySliceObject *slice = (PySliceObject *) _slice;
    rangeobject *result;
    TyObject *start = NULL, *stop = NULL, *step = NULL;
    TyObject *substart = NULL, *substop = NULL, *substep = NULL;
    int error;

    error = _PySlice_GetLongIndices(slice, r->length, &start, &stop, &step);
    if (error == -1)
        return NULL;

    substep = PyNumber_Multiply(r->step, step);
    if (substep == NULL) goto fail;
    Ty_CLEAR(step);

    substart = compute_item(r, start);
    if (substart == NULL) goto fail;
    Ty_CLEAR(start);

    substop = compute_item(r, stop);
    if (substop == NULL) goto fail;
    Ty_CLEAR(stop);

    result = make_range_object(Ty_TYPE(r), substart, substop, substep);
    if (result != NULL) {
        return (TyObject *) result;
    }
fail:
    Ty_XDECREF(start);
    Ty_XDECREF(stop);
    Ty_XDECREF(step);
    Ty_XDECREF(substart);
    Ty_XDECREF(substop);
    Ty_XDECREF(substep);
    return NULL;
}

/* Assumes (TyLong_CheckExact(ob) || TyBool_Check(ob)) */
static int
range_contains_long(rangeobject *r, TyObject *ob)
{
    TyObject *zero = _TyLong_GetZero();  // borrowed reference
    int cmp1, cmp2, cmp3;
    TyObject *tmp1 = NULL;
    TyObject *tmp2 = NULL;
    int result = -1;

    /* Check if the value can possibly be in the range. */

    cmp1 = PyObject_RichCompareBool(r->step, zero, Py_GT);
    if (cmp1 == -1)
        goto end;
    if (cmp1 == 1) { /* positive steps: start <= ob < stop */
        cmp2 = PyObject_RichCompareBool(r->start, ob, Py_LE);
        cmp3 = PyObject_RichCompareBool(ob, r->stop, Py_LT);
    }
    else { /* negative steps: stop < ob <= start */
        cmp2 = PyObject_RichCompareBool(ob, r->start, Py_LE);
        cmp3 = PyObject_RichCompareBool(r->stop, ob, Py_LT);
    }

    if (cmp2 == -1 || cmp3 == -1) /* TypeError */
        goto end;
    if (cmp2 == 0 || cmp3 == 0) { /* ob outside of range */
        result = 0;
        goto end;
    }

    /* Check that the stride does not invalidate ob's membership. */
    tmp1 = PyNumber_Subtract(ob, r->start);
    if (tmp1 == NULL)
        goto end;
    tmp2 = PyNumber_Remainder(tmp1, r->step);
    if (tmp2 == NULL)
        goto end;
    /* result = ((int(ob) - start) % step) == 0 */
    result = PyObject_RichCompareBool(tmp2, zero, Py_EQ);
  end:
    Ty_XDECREF(tmp1);
    Ty_XDECREF(tmp2);
    return result;
}

static int
range_contains(TyObject *self, TyObject *ob)
{
    rangeobject *r = (rangeobject*)self;
    if (TyLong_CheckExact(ob) || TyBool_Check(ob))
        return range_contains_long(r, ob);

    return (int)_PySequence_IterSearch((TyObject*)r, ob,
                                       PY_ITERSEARCH_CONTAINS);
}

/* Compare two range objects.  Return 1 for equal, 0 for not equal
   and -1 on error.  The algorithm is roughly the C equivalent of

   if r0 is r1:
       return True
   if len(r0) != len(r1):
       return False
   if not len(r0):
       return True
   if r0.start != r1.start:
       return False
   if len(r0) == 1:
       return True
   return r0.step == r1.step
*/
static int
range_equals(rangeobject *r0, rangeobject *r1)
{
    int cmp_result;

    if (r0 == r1)
        return 1;
    cmp_result = PyObject_RichCompareBool(r0->length, r1->length, Py_EQ);
    /* Return False or error to the caller. */
    if (cmp_result != 1)
        return cmp_result;
    cmp_result = PyObject_Not(r0->length);
    /* Return True or error to the caller. */
    if (cmp_result != 0)
        return cmp_result;
    cmp_result = PyObject_RichCompareBool(r0->start, r1->start, Py_EQ);
    /* Return False or error to the caller. */
    if (cmp_result != 1)
        return cmp_result;
    cmp_result = PyObject_RichCompareBool(r0->length, _TyLong_GetOne(), Py_EQ);
    /* Return True or error to the caller. */
    if (cmp_result != 0)
        return cmp_result;
    return PyObject_RichCompareBool(r0->step, r1->step, Py_EQ);
}

static TyObject *
range_richcompare(TyObject *self, TyObject *other, int op)
{
    int result;

    if (!TyRange_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    switch (op) {
    case Py_NE:
    case Py_EQ:
        result = range_equals((rangeobject*)self, (rangeobject*)other);
        if (result == -1)
            return NULL;
        if (op == Py_NE)
            result = !result;
        if (result)
            Py_RETURN_TRUE;
        else
            Py_RETURN_FALSE;
    case Py_LE:
    case Py_GE:
    case Py_LT:
    case Py_GT:
        Py_RETURN_NOTIMPLEMENTED;
    default:
        TyErr_BadArgument();
        return NULL;
    }
}

/* Hash function for range objects.  Rough C equivalent of

   if not len(r):
       return hash((len(r), None, None))
   if len(r) == 1:
       return hash((len(r), r.start, None))
   return hash((len(r), r.start, r.step))
*/
static Ty_hash_t
range_hash(TyObject *op)
{
    rangeobject *r = (rangeobject*)op;
    TyObject *t;
    Ty_hash_t result = -1;
    int cmp_result;

    t = TyTuple_New(3);
    if (!t)
        return -1;
    TyTuple_SET_ITEM(t, 0, Ty_NewRef(r->length));
    cmp_result = PyObject_Not(r->length);
    if (cmp_result == -1)
        goto end;
    if (cmp_result == 1) {
        TyTuple_SET_ITEM(t, 1, Ty_NewRef(Ty_None));
        TyTuple_SET_ITEM(t, 2, Ty_NewRef(Ty_None));
    }
    else {
        TyTuple_SET_ITEM(t, 1, Ty_NewRef(r->start));
        cmp_result = PyObject_RichCompareBool(r->length, _TyLong_GetOne(), Py_EQ);
        if (cmp_result == -1)
            goto end;
        if (cmp_result == 1) {
            TyTuple_SET_ITEM(t, 2, Ty_NewRef(Ty_None));
        }
        else {
            TyTuple_SET_ITEM(t, 2, Ty_NewRef(r->step));
        }
    }
    result = PyObject_Hash(t);
  end:
    Ty_DECREF(t);
    return result;
}

static TyObject *
range_count(TyObject *self, TyObject *ob)
{
    rangeobject *r = (rangeobject*)self;
    if (TyLong_CheckExact(ob) || TyBool_Check(ob)) {
        int result = range_contains_long(r, ob);
        if (result == -1)
            return NULL;
        return TyLong_FromLong(result);
    } else {
        Ty_ssize_t count;
        count = _PySequence_IterSearch((TyObject*)r, ob, PY_ITERSEARCH_COUNT);
        if (count == -1)
            return NULL;
        return TyLong_FromSsize_t(count);
    }
}

static TyObject *
range_index(TyObject *self, TyObject *ob)
{
    rangeobject *r = (rangeobject*)self;
    int contains;

    if (!TyLong_CheckExact(ob) && !TyBool_Check(ob)) {
        Ty_ssize_t index;
        index = _PySequence_IterSearch((TyObject*)r, ob, PY_ITERSEARCH_INDEX);
        if (index == -1)
            return NULL;
        return TyLong_FromSsize_t(index);
    }

    contains = range_contains_long(r, ob);
    if (contains == -1)
        return NULL;

    if (contains) {
        TyObject *idx = PyNumber_Subtract(ob, r->start);
        if (idx == NULL) {
            return NULL;
        }

        if (r->step == _TyLong_GetOne()) {
            return idx;
        }

        /* idx = (ob - r.start) // r.step */
        TyObject *sidx = PyNumber_FloorDivide(idx, r->step);
        Ty_DECREF(idx);
        return sidx;
    }

    /* object is not in the range */
    TyErr_SetString(TyExc_ValueError, "range.index(x): x not in range");
    return NULL;
}

static PySequenceMethods range_as_sequence = {
    range_length,               /* sq_length */
    0,                          /* sq_concat */
    0,                          /* sq_repeat */
    range_item,                 /* sq_item */
    0,                          /* sq_slice */
    0,                          /* sq_ass_item */
    0,                          /* sq_ass_slice */
    range_contains,             /* sq_contains */
};

static TyObject *
range_repr(TyObject *op)
{
    rangeobject *r = (rangeobject*)op;
    Ty_ssize_t istep;

    /* Check for special case values for printing.  We don't always
       need the step value.  We don't care about overflow. */
    istep = PyNumber_AsSsize_t(r->step, NULL);
    if (istep == -1 && TyErr_Occurred()) {
        assert(!TyErr_ExceptionMatches(TyExc_OverflowError));
        return NULL;
    }

    if (istep == 1)
        return TyUnicode_FromFormat("range(%R, %R)", r->start, r->stop);
    else
        return TyUnicode_FromFormat("range(%R, %R, %R)",
                                    r->start, r->stop, r->step);
}

/* Pickling support */
static TyObject *
range_reduce(TyObject *op, TyObject *args)
{
    rangeobject *r = (rangeobject*)op;
    return Ty_BuildValue("(O(OOO))", Ty_TYPE(r),
                         r->start, r->stop, r->step);
}

static TyObject *
range_subscript(TyObject *op, TyObject *item)
{
    rangeobject *self = (rangeobject*)op;
    if (_PyIndex_Check(item)) {
        TyObject *i, *result;
        i = PyNumber_Index(item);
        if (!i)
            return NULL;
        result = compute_range_item(self, i);
        Ty_DECREF(i);
        return result;
    }
    if (TySlice_Check(item)) {
        return compute_slice(self, item);
    }
    TyErr_Format(TyExc_TypeError,
                 "range indices must be integers or slices, not %.200s",
                 Ty_TYPE(item)->tp_name);
    return NULL;
}


static PyMappingMethods range_as_mapping = {
        range_length,                /* mp_length */
        range_subscript,             /* mp_subscript */
        0,                           /* mp_ass_subscript */
};

static int
range_bool(TyObject *op)
{
    rangeobject *self = (rangeobject*)op;
    return PyObject_IsTrue(self->length);
}

static TyNumberMethods range_as_number = {
    .nb_bool = range_bool,
};

static TyObject * range_iter(TyObject *seq);
static TyObject * range_reverse(TyObject *seq, TyObject *Py_UNUSED(ignored));

TyDoc_STRVAR(reverse_doc,
"Return a reverse iterator.");

TyDoc_STRVAR(count_doc,
"rangeobject.count(value) -> integer -- return number of occurrences of value");

TyDoc_STRVAR(index_doc,
"rangeobject.index(value) -> integer -- return index of value.\n"
"Raise ValueError if the value is not present.");

static TyMethodDef range_methods[] = {
    {"__reversed__",    range_reverse,              METH_NOARGS, reverse_doc},
    {"__reduce__",      range_reduce,               METH_NOARGS},
    {"count",           range_count,                METH_O,      count_doc},
    {"index",           range_index,                METH_O,      index_doc},
    {NULL,              NULL}           /* sentinel */
};

static TyMemberDef range_members[] = {
    {"start",   Ty_T_OBJECT_EX,    offsetof(rangeobject, start),   Py_READONLY},
    {"stop",    Ty_T_OBJECT_EX,    offsetof(rangeobject, stop),    Py_READONLY},
    {"step",    Ty_T_OBJECT_EX,    offsetof(rangeobject, step),    Py_READONLY},
    {0}
};

TyTypeObject TyRange_Type = {
        TyVarObject_HEAD_INIT(&TyType_Type, 0)
        "range",                /* Name of this type */
        sizeof(rangeobject),    /* Basic object size */
        0,                      /* Item size for varobject */
        range_dealloc,          /* tp_dealloc */
        0,                      /* tp_vectorcall_offset */
        0,                      /* tp_getattr */
        0,                      /* tp_setattr */
        0,                      /* tp_as_async */
        range_repr,             /* tp_repr */
        &range_as_number,       /* tp_as_number */
        &range_as_sequence,     /* tp_as_sequence */
        &range_as_mapping,      /* tp_as_mapping */
        range_hash,             /* tp_hash */
        0,                      /* tp_call */
        0,                      /* tp_str */
        PyObject_GenericGetAttr,  /* tp_getattro */
        0,                      /* tp_setattro */
        0,                      /* tp_as_buffer */
        Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_SEQUENCE,  /* tp_flags */
        range_doc,              /* tp_doc */
        0,                      /* tp_traverse */
        0,                      /* tp_clear */
        range_richcompare,      /* tp_richcompare */
        0,                      /* tp_weaklistoffset */
        range_iter,             /* tp_iter */
        0,                      /* tp_iternext */
        range_methods,          /* tp_methods */
        range_members,          /* tp_members */
        0,                      /* tp_getset */
        0,                      /* tp_base */
        0,                      /* tp_dict */
        0,                      /* tp_descr_get */
        0,                      /* tp_descr_set */
        0,                      /* tp_dictoffset */
        0,                      /* tp_init */
        0,                      /* tp_alloc */
        range_new,              /* tp_new */
        .tp_vectorcall = range_vectorcall
};

/*********************** range Iterator **************************/

/* There are 2 types of iterators, one for C longs, the other for
   Python ints (ie, PyObjects).  This should make iteration fast
   in the normal case, but possible for any numeric value.
*/

static TyObject *
rangeiter_next(TyObject *op)
{
    _PyRangeIterObject *r = (_PyRangeIterObject*)op;
    if (r->len > 0) {
        long result = r->start;
        r->start = result + r->step;
        r->len--;
        return TyLong_FromLong(result);
    }
    return NULL;
}

static TyObject *
rangeiter_len(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    _PyRangeIterObject *r = (_PyRangeIterObject*)op;
    return TyLong_FromLong(r->len);
}

TyDoc_STRVAR(length_hint_doc,
             "Private method returning an estimate of len(list(it)).");

static TyObject *
rangeiter_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    _PyRangeIterObject *r = (_PyRangeIterObject*)op;
    TyObject *start=NULL, *stop=NULL, *step=NULL;
    TyObject *range;

    /* create a range object for pickling */
    start = TyLong_FromLong(r->start);
    if (start == NULL)
        goto err;
    stop = TyLong_FromLong(r->start + r->len * r->step);
    if (stop == NULL)
        goto err;
    step = TyLong_FromLong(r->step);
    if (step == NULL)
        goto err;
    range = (TyObject*)make_range_object(&TyRange_Type,
                               start, stop, step);
    if (range == NULL)
        goto err;
    /* return the result */
    return Ty_BuildValue("N(N)O", _TyEval_GetBuiltin(&_Ty_ID(iter)),
                         range, Ty_None);
err:
    Ty_XDECREF(start);
    Ty_XDECREF(stop);
    Ty_XDECREF(step);
    return NULL;
}

static TyObject *
rangeiter_setstate(TyObject *op, TyObject *state)
{
    _PyRangeIterObject *r = (_PyRangeIterObject*)op;
    long index = TyLong_AsLong(state);
    if (index == -1 && TyErr_Occurred())
        return NULL;
    /* silently clip the index value */
    if (index < 0)
        index = 0;
    else if (index > r->len)
        index = r->len; /* exhausted iterator */
    r->start += index * r->step;
    r->len -= index;
    Py_RETURN_NONE;
}

static void
rangeiter_dealloc(TyObject *self)
{
    _Ty_FREELIST_FREE(range_iters, (_PyRangeIterObject *)self, PyObject_Free);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");
TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyMethodDef rangeiter_methods[] = {
    {"__length_hint__", rangeiter_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", rangeiter_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", rangeiter_setstate, METH_O, setstate_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyRangeIter_Type = {
        TyVarObject_HEAD_INIT(&TyType_Type, 0)
        "range_iterator",                       /* tp_name */
        sizeof(_PyRangeIterObject),             /* tp_basicsize */
        0,                                      /* tp_itemsize */
        /* methods */
        rangeiter_dealloc,                      /* tp_dealloc */
        0,                                      /* tp_vectorcall_offset */
        0,                                      /* tp_getattr */
        0,                                      /* tp_setattr */
        0,                                      /* tp_as_async */
        0,                                      /* tp_repr */
        0,                                      /* tp_as_number */
        0,                                      /* tp_as_sequence */
        0,                                      /* tp_as_mapping */
        0,                                      /* tp_hash */
        0,                                      /* tp_call */
        0,                                      /* tp_str */
        PyObject_GenericGetAttr,                /* tp_getattro */
        0,                                      /* tp_setattro */
        0,                                      /* tp_as_buffer */
        Ty_TPFLAGS_DEFAULT,                     /* tp_flags */
        0,                                      /* tp_doc */
        0,                                      /* tp_traverse */
        0,                                      /* tp_clear */
        0,                                      /* tp_richcompare */
        0,                                      /* tp_weaklistoffset */
        PyObject_SelfIter,                      /* tp_iter */
        rangeiter_next,                         /* tp_iternext */
        rangeiter_methods,                      /* tp_methods */
        0,                                      /* tp_members */
};

/* Return number of items in range (lo, hi, step).  step != 0
 * required.  The result always fits in an unsigned long.
 */
static unsigned long
get_len_of_range(long lo, long hi, long step)
{
    /* -------------------------------------------------------------
    If step > 0 and lo >= hi, or step < 0 and lo <= hi, the range is empty.
    Else for step > 0, if n values are in the range, the last one is
    lo + (n-1)*step, which must be <= hi-1.  Rearranging,
    n <= (hi - lo - 1)/step + 1, so taking the floor of the RHS gives
    the proper value.  Since lo < hi in this case, hi-lo-1 >= 0, so
    the RHS is non-negative and so truncation is the same as the
    floor.  Letting M be the largest positive long, the worst case
    for the RHS numerator is hi=M, lo=-M-1, and then
    hi-lo-1 = M-(-M-1)-1 = 2*M.  Therefore unsigned long has enough
    precision to compute the RHS exactly.  The analysis for step < 0
    is similar.
    ---------------------------------------------------------------*/
    assert(step != 0);
    if (step > 0 && lo < hi)
        return 1UL + (hi - 1UL - lo) / step;
    else if (step < 0 && lo > hi)
        return 1UL + (lo - 1UL - hi) / (0UL - step);
    else
        return 0UL;
}

/* Initialize a rangeiter object.  If the length of the rangeiter object
   is not representable as a C long, OverflowError is raised. */

static TyObject *
fast_range_iter(long start, long stop, long step, long len)
{
    _PyRangeIterObject *it = _Ty_FREELIST_POP(_PyRangeIterObject, range_iters);
    if (it == NULL) {
        it = PyObject_New(_PyRangeIterObject, &PyRangeIter_Type);
        if (it == NULL) {
            return NULL;
        }
    }
    assert(Ty_IS_TYPE(it, &PyRangeIter_Type));
    it->start = start;
    it->step = step;
    it->len = len;
    return (TyObject *)it;
}

typedef struct {
    PyObject_HEAD
    TyObject *start;
    TyObject *step;
    TyObject *len;
} longrangeiterobject;

static TyObject *
longrangeiter_len(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    longrangeiterobject *r = (longrangeiterobject*)op;
    Ty_INCREF(r->len);
    return r->len;
}

static TyObject *
longrangeiter_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    longrangeiterobject *r = (longrangeiterobject*)op;
    TyObject *product, *stop=NULL;
    TyObject *range;

    /* create a range object for pickling.  Must calculate the "stop" value */
    product = PyNumber_Multiply(r->len, r->step);
    if (product == NULL)
        return NULL;
    stop = PyNumber_Add(r->start, product);
    Ty_DECREF(product);
    if (stop ==  NULL)
        return NULL;
    range =  (TyObject*)make_range_object(&TyRange_Type,
                               Ty_NewRef(r->start), stop, Ty_NewRef(r->step));
    if (range == NULL) {
        Ty_DECREF(r->start);
        Ty_DECREF(stop);
        Ty_DECREF(r->step);
        return NULL;
    }

    /* return the result */
    return Ty_BuildValue("N(N)O", _TyEval_GetBuiltin(&_Ty_ID(iter)),
                         range, Ty_None);
}

static TyObject *
longrangeiter_setstate(TyObject *op, TyObject *state)
{
    longrangeiterobject *r = (longrangeiterobject*)op;
    TyObject *zero = _TyLong_GetZero();  // borrowed reference
    int cmp;

    /* clip the value */
    cmp = PyObject_RichCompareBool(state, zero, Py_LT);
    if (cmp < 0)
        return NULL;
    if (cmp > 0) {
        state = zero;
    }
    else {
        cmp = PyObject_RichCompareBool(r->len, state, Py_LT);
        if (cmp < 0)
            return NULL;
        if (cmp > 0)
            state = r->len;
    }
    TyObject *product = PyNumber_Multiply(state, r->step);
    if (product == NULL)
        return NULL;
    TyObject *new_start = PyNumber_Add(r->start, product);
    Ty_DECREF(product);
    if (new_start == NULL)
        return NULL;
    TyObject *new_len = PyNumber_Subtract(r->len, state);
    if (new_len == NULL) {
        Ty_DECREF(new_start);
        return NULL;
    }
    TyObject *tmp = r->start;
    r->start = new_start;
    Ty_SETREF(r->len, new_len);
    Ty_DECREF(tmp);
    Py_RETURN_NONE;
}

static TyMethodDef longrangeiter_methods[] = {
    {"__length_hint__", longrangeiter_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", longrangeiter_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", longrangeiter_setstate, METH_O, setstate_doc},
    {NULL,              NULL}           /* sentinel */
};

static void
longrangeiter_dealloc(TyObject *op)
{
    longrangeiterobject *r = (longrangeiterobject*)op;
    Ty_XDECREF(r->start);
    Ty_XDECREF(r->step);
    Ty_XDECREF(r->len);
    PyObject_Free(r);
}

static TyObject *
longrangeiter_next(TyObject *op)
{
    longrangeiterobject *r = (longrangeiterobject*)op;
    if (PyObject_RichCompareBool(r->len, _TyLong_GetZero(), Py_GT) != 1)
        return NULL;

    TyObject *new_start = PyNumber_Add(r->start, r->step);
    if (new_start == NULL) {
        return NULL;
    }
    TyObject *new_len = PyNumber_Subtract(r->len, _TyLong_GetOne());
    if (new_len == NULL) {
        Ty_DECREF(new_start);
        return NULL;
    }
    TyObject *result = r->start;
    r->start = new_start;
    Ty_SETREF(r->len, new_len);
    return result;
}

TyTypeObject PyLongRangeIter_Type = {
        TyVarObject_HEAD_INIT(&TyType_Type, 0)
        "longrange_iterator",                   /* tp_name */
        sizeof(longrangeiterobject),            /* tp_basicsize */
        0,                                      /* tp_itemsize */
        /* methods */
        longrangeiter_dealloc,                  /* tp_dealloc */
        0,                                      /* tp_vectorcall_offset */
        0,                                      /* tp_getattr */
        0,                                      /* tp_setattr */
        0,                                      /* tp_as_async */
        0,                                      /* tp_repr */
        0,                                      /* tp_as_number */
        0,                                      /* tp_as_sequence */
        0,                                      /* tp_as_mapping */
        0,                                      /* tp_hash */
        0,                                      /* tp_call */
        0,                                      /* tp_str */
        PyObject_GenericGetAttr,                /* tp_getattro */
        0,                                      /* tp_setattro */
        0,                                      /* tp_as_buffer */
        Ty_TPFLAGS_DEFAULT,                     /* tp_flags */
        0,                                      /* tp_doc */
        0,                                      /* tp_traverse */
        0,                                      /* tp_clear */
        0,                                      /* tp_richcompare */
        0,                                      /* tp_weaklistoffset */
        PyObject_SelfIter,                      /* tp_iter */
        longrangeiter_next,                     /* tp_iternext */
        longrangeiter_methods,                  /* tp_methods */
        0,
};

static TyObject *
range_iter(TyObject *seq)
{
    rangeobject *r = (rangeobject *)seq;
    longrangeiterobject *it;
    long lstart, lstop, lstep;
    unsigned long ulen;

    assert(TyRange_Check(seq));

    /* If all three fields and the length convert to long, use the int
     * version */
    lstart = TyLong_AsLong(r->start);
    if (lstart == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    lstop = TyLong_AsLong(r->stop);
    if (lstop == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    lstep = TyLong_AsLong(r->step);
    if (lstep == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    ulen = get_len_of_range(lstart, lstop, lstep);
    if (ulen > (unsigned long)LONG_MAX) {
        goto long_range;
    }
    /* check for potential overflow of lstart + ulen * lstep */
    if (ulen) {
        if (lstep > 0) {
            if (lstop > LONG_MAX - (lstep - 1))
                goto long_range;
        }
        else {
            if (lstop < LONG_MIN + (-1 - lstep))
                goto long_range;
        }
    }
    return fast_range_iter(lstart, lstop, lstep, (long)ulen);

  long_range:
    it = PyObject_New(longrangeiterobject, &PyLongRangeIter_Type);
    if (it == NULL)
        return NULL;

    it->start = Ty_NewRef(r->start);
    it->step = Ty_NewRef(r->step);
    it->len = Ty_NewRef(r->length);
    return (TyObject *)it;
}

static TyObject *
range_reverse(TyObject *seq, TyObject *Py_UNUSED(ignored))
{
    rangeobject *range = (rangeobject*) seq;
    longrangeiterobject *it;
    TyObject *sum, *diff, *product;
    long lstart, lstop, lstep, new_start, new_stop;
    unsigned long ulen;

    assert(TyRange_Check(seq));

    /* reversed(range(start, stop, step)) can be expressed as
       range(start+(n-1)*step, start-step, -step), where n is the number of
       integers in the range.

       If each of start, stop, step, -step, start-step, and the length
       of the iterator is representable as a C long, use the int
       version.  This excludes some cases where the reversed range is
       representable as a range_iterator, but it's good enough for
       common cases and it makes the checks simple. */

    lstart = TyLong_AsLong(range->start);
    if (lstart == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    lstop = TyLong_AsLong(range->stop);
    if (lstop == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    lstep = TyLong_AsLong(range->step);
    if (lstep == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        goto long_range;
    }
    /* check for possible overflow of -lstep */
    if (lstep == LONG_MIN)
        goto long_range;

    /* check for overflow of lstart - lstep:

       for lstep > 0, need only check whether lstart - lstep < LONG_MIN.
       for lstep < 0, need only check whether lstart - lstep > LONG_MAX

       Rearrange these inequalities as:

           lstart - LONG_MIN < lstep  (lstep > 0)
           LONG_MAX - lstart < -lstep  (lstep < 0)

       and compute both sides as unsigned longs, to avoid the
       possibility of undefined behaviour due to signed overflow. */

    if (lstep > 0) {
         if ((unsigned long)lstart - LONG_MIN < (unsigned long)lstep)
            goto long_range;
    }
    else {
        if (LONG_MAX - (unsigned long)lstart < 0UL - lstep)
            goto long_range;
    }

    ulen = get_len_of_range(lstart, lstop, lstep);
    if (ulen > (unsigned long)LONG_MAX)
        goto long_range;

    new_stop = lstart - lstep;
    new_start = (long)(new_stop + ulen * lstep);
    return fast_range_iter(new_start, new_stop, -lstep, (long)ulen);

long_range:
    it = PyObject_New(longrangeiterobject, &PyLongRangeIter_Type);
    if (it == NULL)
        return NULL;
    it->start = it->step = NULL;

    /* start + (len - 1) * step */
    it->len = Ty_NewRef(range->length);

    diff = PyNumber_Subtract(it->len, _TyLong_GetOne());
    if (!diff)
        goto create_failure;

    product = PyNumber_Multiply(diff, range->step);
    Ty_DECREF(diff);
    if (!product)
        goto create_failure;

    sum = PyNumber_Add(range->start, product);
    Ty_DECREF(product);
    it->start = sum;
    if (!it->start)
        goto create_failure;

    it->step = PyNumber_Negative(range->step);
    if (!it->step)
        goto create_failure;

    return (TyObject *)it;

create_failure:
    Ty_DECREF(it);
    return NULL;
}
