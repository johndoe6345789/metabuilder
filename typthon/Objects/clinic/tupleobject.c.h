/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(tuple_index__doc__,
"index($self, value, start=0, stop=sys.maxsize, /)\n"
"--\n"
"\n"
"Return first index of value.\n"
"\n"
"Raises ValueError if the value is not present.");

#define TUPLE_INDEX_METHODDEF    \
    {"index", _PyCFunction_CAST(tuple_index), METH_FASTCALL, tuple_index__doc__},

static TyObject *
tuple_index_impl(PyTupleObject *self, TyObject *value, Ty_ssize_t start,
                 Ty_ssize_t stop);

static TyObject *
tuple_index(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *value;
    Ty_ssize_t start = 0;
    Ty_ssize_t stop = PY_SSIZE_T_MAX;

    if (!_TyArg_CheckPositional("index", nargs, 1, 3)) {
        goto exit;
    }
    value = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndexNotNone(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndexNotNone(args[2], &stop)) {
        goto exit;
    }
skip_optional:
    return_value = tuple_index_impl((PyTupleObject *)self, value, start, stop);

exit:
    return return_value;
}

TyDoc_STRVAR(tuple_count__doc__,
"count($self, value, /)\n"
"--\n"
"\n"
"Return number of occurrences of value.");

#define TUPLE_COUNT_METHODDEF    \
    {"count", (PyCFunction)tuple_count, METH_O, tuple_count__doc__},

static TyObject *
tuple_count_impl(PyTupleObject *self, TyObject *value);

static TyObject *
tuple_count(TyObject *self, TyObject *value)
{
    TyObject *return_value = NULL;

    return_value = tuple_count_impl((PyTupleObject *)self, value);

    return return_value;
}

TyDoc_STRVAR(tuple_new__doc__,
"tuple(iterable=(), /)\n"
"--\n"
"\n"
"Built-in immutable sequence.\n"
"\n"
"If no argument is given, the constructor returns an empty tuple.\n"
"If iterable is specified the tuple is initialized from iterable\'s items.\n"
"\n"
"If the argument is a tuple, the return value is the same object.");

static TyObject *
tuple_new_impl(TyTypeObject *type, TyObject *iterable);

static TyObject *
tuple_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = &TyTuple_Type;
    TyObject *iterable = NULL;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("tuple", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("tuple", TyTuple_GET_SIZE(args), 0, 1)) {
        goto exit;
    }
    if (TyTuple_GET_SIZE(args) < 1) {
        goto skip_optional;
    }
    iterable = TyTuple_GET_ITEM(args, 0);
skip_optional:
    return_value = tuple_new_impl(type, iterable);

exit:
    return return_value;
}

TyDoc_STRVAR(tuple___getnewargs____doc__,
"__getnewargs__($self, /)\n"
"--\n"
"\n");

#define TUPLE___GETNEWARGS___METHODDEF    \
    {"__getnewargs__", (PyCFunction)tuple___getnewargs__, METH_NOARGS, tuple___getnewargs____doc__},

static TyObject *
tuple___getnewargs___impl(PyTupleObject *self);

static TyObject *
tuple___getnewargs__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return tuple___getnewargs___impl((PyTupleObject *)self);
}
/*[clinic end generated code: output=bd11662d62d973c2 input=a9049054013a1b77]*/
