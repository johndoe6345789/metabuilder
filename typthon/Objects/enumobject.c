/* enumerate object */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_object.h"        // _TyObject_GC_TRACK()
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString
#include "pycore_tuple.h"         // _TyTuple_Recycle()

#include "clinic/enumobject.c.h"

/*[clinic input]
class enumerate "enumobject *" "&PyEnum_Type"
class reversed "reversedobject *" "&PyReversed_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=d2dfdf1a88c88975]*/

typedef struct {
    PyObject_HEAD
    Ty_ssize_t en_index;           /* current index of enumeration */
    TyObject* en_sit;              /* secondary iterator of enumeration */
    TyObject* en_result;           /* result tuple  */
    TyObject* en_longindex;        /* index for sequences >= PY_SSIZE_T_MAX */
    TyObject* one;                 /* borrowed reference */
} enumobject;

#define _enumobject_CAST(op)    ((enumobject *)(op))

/*[clinic input]
@classmethod
enumerate.__new__ as enum_new

    iterable: object
        an object supporting iteration
    start: object = 0

Return an enumerate object.

The enumerate object yields pairs containing a count (from start, which
defaults to zero) and a value yielded by the iterable argument.

enumerate is useful for obtaining an indexed list:
    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...
[clinic start generated code]*/

static TyObject *
enum_new_impl(TyTypeObject *type, TyObject *iterable, TyObject *start)
/*[clinic end generated code: output=e95e6e439f812c10 input=782e4911efcb8acf]*/
{
    enumobject *en;

    en = (enumobject *)type->tp_alloc(type, 0);
    if (en == NULL)
        return NULL;
    if (start != NULL) {
        start = PyNumber_Index(start);
        if (start == NULL) {
            Ty_DECREF(en);
            return NULL;
        }
        assert(TyLong_Check(start));
        en->en_index = TyLong_AsSsize_t(start);
        if (en->en_index == -1 && TyErr_Occurred()) {
            TyErr_Clear();
            en->en_index = PY_SSIZE_T_MAX;
            en->en_longindex = start;
        } else {
            en->en_longindex = NULL;
            Ty_DECREF(start);
        }
    } else {
        en->en_index = 0;
        en->en_longindex = NULL;
    }
    en->en_sit = PyObject_GetIter(iterable);
    if (en->en_sit == NULL) {
        Ty_DECREF(en);
        return NULL;
    }
    en->en_result = TyTuple_Pack(2, Ty_None, Ty_None);
    if (en->en_result == NULL) {
        Ty_DECREF(en);
        return NULL;
    }
    en->one = _TyLong_GetOne();    /* borrowed reference */
    return (TyObject *)en;
}

static int check_keyword(TyObject *kwnames, int index,
                         const char *name)
{
    TyObject *kw = TyTuple_GET_ITEM(kwnames, index);
    if (!_TyUnicode_EqualToASCIIString(kw, name)) {
        TyErr_Format(TyExc_TypeError,
            "'%S' is an invalid keyword argument for enumerate()", kw);
        return 0;
    }
    return 1;
}

// TODO: Use AC when bpo-43447 is supported
static TyObject *
enumerate_vectorcall(TyObject *type, TyObject *const *args,
                     size_t nargsf, TyObject *kwnames)
{
    TyTypeObject *tp = _TyType_CAST(type);
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    Ty_ssize_t nkwargs = 0;
    if (kwnames != NULL) {
        nkwargs = TyTuple_GET_SIZE(kwnames);
    }

    // Manually implement enumerate(iterable, start=...)
    if (nargs + nkwargs == 2) {
        if (nkwargs == 1) {
            if (!check_keyword(kwnames, 0, "start")) {
                return NULL;
            }
        } else if (nkwargs == 2) {
            TyObject *kw0 = TyTuple_GET_ITEM(kwnames, 0);
            if (_TyUnicode_EqualToASCIIString(kw0, "start")) {
                if (!check_keyword(kwnames, 1, "iterable")) {
                    return NULL;
                }
                return enum_new_impl(tp, args[1], args[0]);
            }
            if (!check_keyword(kwnames, 0, "iterable") ||
                !check_keyword(kwnames, 1, "start")) {
                return NULL;
            }

        }
        return enum_new_impl(tp, args[0], args[1]);
    }

    if (nargs + nkwargs == 1) {
        if (nkwargs == 1 && !check_keyword(kwnames, 0, "iterable")) {
            return NULL;
        }
        return enum_new_impl(tp, args[0], NULL);
    }

    if (nargs == 0) {
        TyErr_SetString(TyExc_TypeError,
            "enumerate() missing required argument 'iterable'");
        return NULL;
    }

    TyErr_Format(TyExc_TypeError,
        "enumerate() takes at most 2 arguments (%d given)", nargs + nkwargs);
    return NULL;
}

static void
enum_dealloc(TyObject *op)
{
    enumobject *en = _enumobject_CAST(op);
    PyObject_GC_UnTrack(en);
    Ty_XDECREF(en->en_sit);
    Ty_XDECREF(en->en_result);
    Ty_XDECREF(en->en_longindex);
    Ty_TYPE(en)->tp_free(en);
}

static int
enum_traverse(TyObject *op, visitproc visit, void *arg)
{
    enumobject *en = _enumobject_CAST(op);
    Ty_VISIT(en->en_sit);
    Ty_VISIT(en->en_result);
    Ty_VISIT(en->en_longindex);
    return 0;
}

// increment en_longindex with lock held, return the next index to be used
// or NULL on error
static inline TyObject *
increment_longindex_lock_held(enumobject *en)
{
    TyObject *next_index = en->en_longindex;
    if (next_index == NULL) {
        next_index = TyLong_FromSsize_t(PY_SSIZE_T_MAX);
        if (next_index == NULL) {
            return NULL;
        }
    }
    assert(next_index != NULL);
    TyObject *stepped_up = PyNumber_Add(next_index, en->one);
    if (stepped_up == NULL) {
        return NULL;
    }
    en->en_longindex = stepped_up;
    return next_index;
}

static TyObject *
enum_next_long(enumobject *en, TyObject* next_item)
{
    TyObject *result = en->en_result;
    TyObject *next_index;
    TyObject *old_index;
    TyObject *old_item;


    Ty_BEGIN_CRITICAL_SECTION(en);
    next_index = increment_longindex_lock_held(en);
    Ty_END_CRITICAL_SECTION();
    if (next_index == NULL) {
        Ty_DECREF(next_item);
        return NULL;
    }

    if (_TyObject_IsUniquelyReferenced(result)) {
        Ty_INCREF(result);
        old_index = TyTuple_GET_ITEM(result, 0);
        old_item = TyTuple_GET_ITEM(result, 1);
        TyTuple_SET_ITEM(result, 0, next_index);
        TyTuple_SET_ITEM(result, 1, next_item);
        Ty_DECREF(old_index);
        Ty_DECREF(old_item);
        // bpo-42536: The GC may have untracked this result tuple. Since we're
        // recycling it, make sure it's tracked again:
        _TyTuple_Recycle(result);
        return result;
    }
    result = TyTuple_New(2);
    if (result == NULL) {
        Ty_DECREF(next_index);
        Ty_DECREF(next_item);
        return NULL;
    }
    TyTuple_SET_ITEM(result, 0, next_index);
    TyTuple_SET_ITEM(result, 1, next_item);
    return result;
}

static TyObject *
enum_next(TyObject *op)
{
    enumobject *en = _enumobject_CAST(op);
    TyObject *next_index;
    TyObject *next_item;
    TyObject *result = en->en_result;
    TyObject *it = en->en_sit;
    TyObject *old_index;
    TyObject *old_item;

    next_item = (*Ty_TYPE(it)->tp_iternext)(it);
    if (next_item == NULL)
        return NULL;

    Ty_ssize_t en_index = FT_ATOMIC_LOAD_SSIZE_RELAXED(en->en_index);
    if (en_index == PY_SSIZE_T_MAX)
        return enum_next_long(en, next_item);

    next_index = TyLong_FromSsize_t(en_index);
    if (next_index == NULL) {
        Ty_DECREF(next_item);
        return NULL;
    }
    FT_ATOMIC_STORE_SSIZE_RELAXED(en->en_index, en_index + 1);

    if (_TyObject_IsUniquelyReferenced(result)) {
        Ty_INCREF(result);
        old_index = TyTuple_GET_ITEM(result, 0);
        old_item = TyTuple_GET_ITEM(result, 1);
        TyTuple_SET_ITEM(result, 0, next_index);
        TyTuple_SET_ITEM(result, 1, next_item);
        Ty_DECREF(old_index);
        Ty_DECREF(old_item);
        // bpo-42536: The GC may have untracked this result tuple. Since we're
        // recycling it, make sure it's tracked again:
        _TyTuple_Recycle(result);
        return result;
    }
    result = TyTuple_New(2);
    if (result == NULL) {
        Ty_DECREF(next_index);
        Ty_DECREF(next_item);
        return NULL;
    }
    TyTuple_SET_ITEM(result, 0, next_index);
    TyTuple_SET_ITEM(result, 1, next_item);
    return result;
}

static TyObject *
enum_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    enumobject *en = _enumobject_CAST(op);
    TyObject *result;
    Ty_BEGIN_CRITICAL_SECTION(en);
    if (en->en_longindex != NULL)
        result = Ty_BuildValue("O(OO)", Ty_TYPE(en), en->en_sit, en->en_longindex);
    else
        result = Ty_BuildValue("O(On)", Ty_TYPE(en), en->en_sit, en->en_index);
    Ty_END_CRITICAL_SECTION();
    return result;
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyMethodDef enum_methods[] = {
    {"__reduce__", enum_reduce, METH_NOARGS, reduce_doc},
    {"__class_getitem__",    Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyEnum_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "enumerate",                    /* tp_name */
    sizeof(enumobject),             /* tp_basicsize */
    0,                              /* tp_itemsize */
    /* methods */
    enum_dealloc,                   /* tp_dealloc */
    0,                              /* tp_vectorcall_offset */
    0,                              /* tp_getattr */
    0,                              /* tp_setattr */
    0,                              /* tp_as_async */
    0,                              /* tp_repr */
    0,                              /* tp_as_number */
    0,                              /* tp_as_sequence */
    0,                              /* tp_as_mapping */
    0,                              /* tp_hash */
    0,                              /* tp_call */
    0,                              /* tp_str */
    PyObject_GenericGetAttr,        /* tp_getattro */
    0,                              /* tp_setattro */
    0,                              /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,        /* tp_flags */
    enum_new__doc__,                /* tp_doc */
    enum_traverse,                  /* tp_traverse */
    0,                              /* tp_clear */
    0,                              /* tp_richcompare */
    0,                              /* tp_weaklistoffset */
    PyObject_SelfIter,              /* tp_iter */
    enum_next,                      /* tp_iternext */
    enum_methods,                   /* tp_methods */
    0,                              /* tp_members */
    0,                              /* tp_getset */
    0,                              /* tp_base */
    0,                              /* tp_dict */
    0,                              /* tp_descr_get */
    0,                              /* tp_descr_set */
    0,                              /* tp_dictoffset */
    0,                              /* tp_init */
    TyType_GenericAlloc,            /* tp_alloc */
    enum_new,                       /* tp_new */
    PyObject_GC_Del,                /* tp_free */
    .tp_vectorcall = enumerate_vectorcall
};

/* Reversed Object ***************************************************************/

typedef struct {
    PyObject_HEAD
    Ty_ssize_t      index;
    TyObject* seq;
} reversedobject;

#define _reversedobject_CAST(op)    ((reversedobject *)(op))

/*[clinic input]
@classmethod
reversed.__new__ as reversed_new

    sequence as seq: object
    /

Return a reverse iterator over the values of the given sequence.
[clinic start generated code]*/

static TyObject *
reversed_new_impl(TyTypeObject *type, TyObject *seq)
/*[clinic end generated code: output=f7854cc1df26f570 input=aeb720361e5e3f1d]*/
{
    Ty_ssize_t n;
    TyObject *reversed_meth;
    reversedobject *ro;

    reversed_meth = _TyObject_LookupSpecial(seq, &_Ty_ID(__reversed__));
    if (reversed_meth == Ty_None) {
        Ty_DECREF(reversed_meth);
        TyErr_Format(TyExc_TypeError,
                     "'%.200s' object is not reversible",
                     Ty_TYPE(seq)->tp_name);
        return NULL;
    }
    if (reversed_meth != NULL) {
        TyObject *res = _TyObject_CallNoArgs(reversed_meth);
        Ty_DECREF(reversed_meth);
        return res;
    }
    else if (TyErr_Occurred())
        return NULL;

    if (!PySequence_Check(seq)) {
        TyErr_Format(TyExc_TypeError,
                     "'%.200s' object is not reversible",
                     Ty_TYPE(seq)->tp_name);
        return NULL;
    }

    n = PySequence_Size(seq);
    if (n == -1)
        return NULL;

    ro = (reversedobject *)type->tp_alloc(type, 0);
    if (ro == NULL)
        return NULL;

    ro->index = n-1;
    ro->seq = Ty_NewRef(seq);
    return (TyObject *)ro;
}

static TyObject *
reversed_vectorcall(TyObject *type, TyObject * const*args,
                size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("reversed", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("reversed", nargs, 1, 1)) {
        return NULL;
    }

    return reversed_new_impl(_TyType_CAST(type), args[0]);
}

static void
reversed_dealloc(TyObject *op)
{
    reversedobject *ro = _reversedobject_CAST(op);
    PyObject_GC_UnTrack(ro);
    Ty_XDECREF(ro->seq);
    Ty_TYPE(ro)->tp_free(ro);
}

static int
reversed_traverse(TyObject *op, visitproc visit, void *arg)
{
    reversedobject *ro = _reversedobject_CAST(op);
    Ty_VISIT(ro->seq);
    return 0;
}

static TyObject *
reversed_next(TyObject *op)
{
    reversedobject *ro = _reversedobject_CAST(op);
    TyObject *item;
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(ro->index);

    if (index >= 0) {
        item = PySequence_GetItem(ro->seq, index);
        if (item != NULL) {
            FT_ATOMIC_STORE_SSIZE_RELAXED(ro->index, index - 1);
            return item;
        }
        if (TyErr_ExceptionMatches(TyExc_IndexError) ||
            TyErr_ExceptionMatches(TyExc_StopIteration))
            TyErr_Clear();
    }
    FT_ATOMIC_STORE_SSIZE_RELAXED(ro->index, -1);
#ifndef Ty_GIL_DISABLED
    Ty_CLEAR(ro->seq);
#endif
    return NULL;
}

static TyObject *
reversed_len(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    reversedobject *ro = _reversedobject_CAST(op);
    Ty_ssize_t position, seqsize;
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(ro->index);

    if (index == -1)
        return TyLong_FromLong(0);
    assert(ro->seq != NULL);
    seqsize = PySequence_Size(ro->seq);
    if (seqsize == -1)
        return NULL;
    position = index + 1;
    return TyLong_FromSsize_t((seqsize < position)  ?  0  :  position);
}

TyDoc_STRVAR(length_hint_doc, "Private method returning an estimate of len(list(it)).");

static TyObject *
reversed_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    reversedobject *ro = _reversedobject_CAST(op);
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(ro->index);
    if (index != -1) {
        return Ty_BuildValue("O(O)n", Ty_TYPE(ro), ro->seq, ro->index);
    }
    else {
        return Ty_BuildValue("O(())", Ty_TYPE(ro));
    }
}

static TyObject *
reversed_setstate(TyObject *op, TyObject *state)
{
    reversedobject *ro = _reversedobject_CAST(op);
    Ty_ssize_t index = TyLong_AsSsize_t(state);
    if (index == -1 && TyErr_Occurred())
        return NULL;
    Ty_ssize_t ro_index = FT_ATOMIC_LOAD_SSIZE_RELAXED(ro->index);
    // if the iterator is exhausted we do not set the state
    // this is for backwards compatibility reasons. in practice this situation
    // will not occur, see gh-120971
    if (ro_index != -1) {
        Ty_ssize_t n = PySequence_Size(ro->seq);
        if (n < 0)
            return NULL;
        if (index < -1)
            index = -1;
        else if (index > n-1)
            index = n-1;
        FT_ATOMIC_STORE_SSIZE_RELAXED(ro->index, index);
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyMethodDef reversediter_methods[] = {
    {"__length_hint__", reversed_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", reversed_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", reversed_setstate, METH_O, setstate_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyReversed_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "reversed",                     /* tp_name */
    sizeof(reversedobject),         /* tp_basicsize */
    0,                              /* tp_itemsize */
    /* methods */
    reversed_dealloc,               /* tp_dealloc */
    0,                              /* tp_vectorcall_offset */
    0,                              /* tp_getattr */
    0,                              /* tp_setattr */
    0,                              /* tp_as_async */
    0,                              /* tp_repr */
    0,                              /* tp_as_number */
    0,                              /* tp_as_sequence */
    0,                              /* tp_as_mapping */
    0,                              /* tp_hash */
    0,                              /* tp_call */
    0,                              /* tp_str */
    PyObject_GenericGetAttr,        /* tp_getattro */
    0,                              /* tp_setattro */
    0,                              /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,        /* tp_flags */
    reversed_new__doc__,            /* tp_doc */
    reversed_traverse,              /* tp_traverse */
    0,                              /* tp_clear */
    0,                              /* tp_richcompare */
    0,                              /* tp_weaklistoffset */
    PyObject_SelfIter,              /* tp_iter */
    reversed_next,                  /* tp_iternext */
    reversediter_methods,           /* tp_methods */
    0,                              /* tp_members */
    0,                              /* tp_getset */
    0,                              /* tp_base */
    0,                              /* tp_dict */
    0,                              /* tp_descr_get */
    0,                              /* tp_descr_set */
    0,                              /* tp_dictoffset */
    0,                              /* tp_init */
    TyType_GenericAlloc,            /* tp_alloc */
    reversed_new,                   /* tp_new */
    PyObject_GC_Del,                /* tp_free */
    .tp_vectorcall = reversed_vectorcall,
};
