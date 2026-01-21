/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(deque_pop__doc__,
"pop($self, /)\n"
"--\n"
"\n"
"Remove and return the rightmost element.");

#define DEQUE_POP_METHODDEF    \
    {"pop", (PyCFunction)deque_pop, METH_NOARGS, deque_pop__doc__},

static TyObject *
deque_pop_impl(dequeobject *deque);

static TyObject *
deque_pop(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_pop_impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_popleft__doc__,
"popleft($self, /)\n"
"--\n"
"\n"
"Remove and return the leftmost element.");

#define DEQUE_POPLEFT_METHODDEF    \
    {"popleft", (PyCFunction)deque_popleft, METH_NOARGS, deque_popleft__doc__},

static TyObject *
deque_popleft_impl(dequeobject *deque);

static TyObject *
deque_popleft(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_popleft_impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_append__doc__,
"append($self, item, /)\n"
"--\n"
"\n"
"Add an element to the right side of the deque.");

#define DEQUE_APPEND_METHODDEF    \
    {"append", (PyCFunction)deque_append, METH_O, deque_append__doc__},

static TyObject *
deque_append_impl(dequeobject *deque, TyObject *item);

static TyObject *
deque_append(TyObject *deque, TyObject *item)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_append_impl((dequeobject *)deque, item);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_appendleft__doc__,
"appendleft($self, item, /)\n"
"--\n"
"\n"
"Add an element to the left side of the deque.");

#define DEQUE_APPENDLEFT_METHODDEF    \
    {"appendleft", (PyCFunction)deque_appendleft, METH_O, deque_appendleft__doc__},

static TyObject *
deque_appendleft_impl(dequeobject *deque, TyObject *item);

static TyObject *
deque_appendleft(TyObject *deque, TyObject *item)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_appendleft_impl((dequeobject *)deque, item);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_extend__doc__,
"extend($self, iterable, /)\n"
"--\n"
"\n"
"Extend the right side of the deque with elements from the iterable.");

#define DEQUE_EXTEND_METHODDEF    \
    {"extend", (PyCFunction)deque_extend, METH_O, deque_extend__doc__},

static TyObject *
deque_extend_impl(dequeobject *deque, TyObject *iterable);

static TyObject *
deque_extend(TyObject *deque, TyObject *iterable)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_extend_impl((dequeobject *)deque, iterable);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_extendleft__doc__,
"extendleft($self, iterable, /)\n"
"--\n"
"\n"
"Extend the left side of the deque with elements from the iterable.");

#define DEQUE_EXTENDLEFT_METHODDEF    \
    {"extendleft", (PyCFunction)deque_extendleft, METH_O, deque_extendleft__doc__},

static TyObject *
deque_extendleft_impl(dequeobject *deque, TyObject *iterable);

static TyObject *
deque_extendleft(TyObject *deque, TyObject *iterable)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_extendleft_impl((dequeobject *)deque, iterable);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a shallow copy of a deque.");

#define DEQUE_COPY_METHODDEF    \
    {"copy", (PyCFunction)deque_copy, METH_NOARGS, deque_copy__doc__},

static TyObject *
deque_copy_impl(dequeobject *deque);

static TyObject *
deque_copy(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_copy_impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque___copy____doc__,
"__copy__($self, /)\n"
"--\n"
"\n"
"Return a shallow copy of a deque.");

#define DEQUE___COPY___METHODDEF    \
    {"__copy__", (PyCFunction)deque___copy__, METH_NOARGS, deque___copy____doc__},

static TyObject *
deque___copy___impl(dequeobject *deque);

static TyObject *
deque___copy__(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque___copy___impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_clearmethod__doc__,
"clear($self, /)\n"
"--\n"
"\n"
"Remove all elements from the deque.");

#define DEQUE_CLEARMETHOD_METHODDEF    \
    {"clear", (PyCFunction)deque_clearmethod, METH_NOARGS, deque_clearmethod__doc__},

static TyObject *
deque_clearmethod_impl(dequeobject *deque);

static TyObject *
deque_clearmethod(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_clearmethod_impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_rotate__doc__,
"rotate($self, n=1, /)\n"
"--\n"
"\n"
"Rotate the deque n steps to the right.  If n is negative, rotates left.");

#define DEQUE_ROTATE_METHODDEF    \
    {"rotate", _PyCFunction_CAST(deque_rotate), METH_FASTCALL, deque_rotate__doc__},

static TyObject *
deque_rotate_impl(dequeobject *deque, Ty_ssize_t n);

static TyObject *
deque_rotate(TyObject *deque, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t n = 1;

    if (!_TyArg_CheckPositional("rotate", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        n = ival;
    }
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_rotate_impl((dequeobject *)deque, n);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(deque_reverse__doc__,
"reverse($self, /)\n"
"--\n"
"\n"
"Reverse *IN PLACE*.");

#define DEQUE_REVERSE_METHODDEF    \
    {"reverse", (PyCFunction)deque_reverse, METH_NOARGS, deque_reverse__doc__},

static TyObject *
deque_reverse_impl(dequeobject *deque);

static TyObject *
deque_reverse(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_reverse_impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_count__doc__,
"count($self, value, /)\n"
"--\n"
"\n"
"Return number of occurrences of value.");

#define DEQUE_COUNT_METHODDEF    \
    {"count", (PyCFunction)deque_count, METH_O, deque_count__doc__},

static TyObject *
deque_count_impl(dequeobject *deque, TyObject *v);

static TyObject *
deque_count(TyObject *deque, TyObject *v)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_count_impl((dequeobject *)deque, v);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque_index__doc__,
"index($self, value, [start, [stop]])\n"
"--\n"
"\n"
"Return first index of value.\n"
"\n"
"Raises ValueError if the value is not present.");

#define DEQUE_INDEX_METHODDEF    \
    {"index", _PyCFunction_CAST(deque_index), METH_FASTCALL, deque_index__doc__},

static TyObject *
deque_index_impl(dequeobject *deque, TyObject *v, Ty_ssize_t start,
                 Ty_ssize_t stop);

static TyObject *
deque_index(TyObject *deque, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *v;
    Ty_ssize_t start = 0;
    Ty_ssize_t stop = Ty_SIZE(deque);

    if (!_TyArg_CheckPositional("index", nargs, 1, 3)) {
        goto exit;
    }
    v = args[0];
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
    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_index_impl((dequeobject *)deque, v, start, stop);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(deque_insert__doc__,
"insert($self, index, value, /)\n"
"--\n"
"\n"
"Insert value before index.");

#define DEQUE_INSERT_METHODDEF    \
    {"insert", _PyCFunction_CAST(deque_insert), METH_FASTCALL, deque_insert__doc__},

static TyObject *
deque_insert_impl(dequeobject *deque, Ty_ssize_t index, TyObject *value);

static TyObject *
deque_insert(TyObject *deque, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t index;
    TyObject *value;

    if (!_TyArg_CheckPositional("insert", nargs, 2, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        index = ival;
    }
    value = args[1];
    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_insert_impl((dequeobject *)deque, index, value);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(deque_remove__doc__,
"remove($self, value, /)\n"
"--\n"
"\n"
"Remove first occurrence of value.");

#define DEQUE_REMOVE_METHODDEF    \
    {"remove", (PyCFunction)deque_remove, METH_O, deque_remove__doc__},

static TyObject *
deque_remove_impl(dequeobject *deque, TyObject *value);

static TyObject *
deque_remove(TyObject *deque, TyObject *value)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_remove_impl((dequeobject *)deque, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque___reduce____doc__,
"__reduce__($self, /)\n"
"--\n"
"\n"
"Return state information for pickling.");

#define DEQUE___REDUCE___METHODDEF    \
    {"__reduce__", (PyCFunction)deque___reduce__, METH_NOARGS, deque___reduce____doc__},

static TyObject *
deque___reduce___impl(dequeobject *deque);

static TyObject *
deque___reduce__(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    return deque___reduce___impl((dequeobject *)deque);
}

TyDoc_STRVAR(deque_init__doc__,
"deque([iterable[, maxlen]])\n"
"--\n"
"\n"
"A list-like sequence optimized for data accesses near its endpoints.");

static int
deque_init_impl(dequeobject *deque, TyObject *iterable, TyObject *maxlenobj);

static int
deque_init(TyObject *deque, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(iterable), &_Ty_ID(maxlen), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "maxlen", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "deque",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *iterable = NULL;
    TyObject *maxlenobj = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        iterable = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    maxlenobj = fastargs[1];
skip_optional_pos:
    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque_init_impl((dequeobject *)deque, iterable, maxlenobj);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(deque___sizeof____doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n"
"Return the size of the deque in memory, in bytes.");

#define DEQUE___SIZEOF___METHODDEF    \
    {"__sizeof__", (PyCFunction)deque___sizeof__, METH_NOARGS, deque___sizeof____doc__},

static TyObject *
deque___sizeof___impl(dequeobject *deque);

static TyObject *
deque___sizeof__(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(deque);
    return_value = deque___sizeof___impl((dequeobject *)deque);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(deque___reversed____doc__,
"__reversed__($self, /)\n"
"--\n"
"\n"
"Return a reverse iterator over the deque.");

#define DEQUE___REVERSED___METHODDEF    \
    {"__reversed__", (PyCFunction)deque___reversed__, METH_NOARGS, deque___reversed____doc__},

static TyObject *
deque___reversed___impl(dequeobject *deque);

static TyObject *
deque___reversed__(TyObject *deque, TyObject *Py_UNUSED(ignored))
{
    return deque___reversed___impl((dequeobject *)deque);
}

TyDoc_STRVAR(_collections__count_elements__doc__,
"_count_elements($module, mapping, iterable, /)\n"
"--\n"
"\n"
"Count elements in the iterable, updating the mapping");

#define _COLLECTIONS__COUNT_ELEMENTS_METHODDEF    \
    {"_count_elements", _PyCFunction_CAST(_collections__count_elements), METH_FASTCALL, _collections__count_elements__doc__},

static TyObject *
_collections__count_elements_impl(TyObject *module, TyObject *mapping,
                                  TyObject *iterable);

static TyObject *
_collections__count_elements(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *mapping;
    TyObject *iterable;

    if (!_TyArg_CheckPositional("_count_elements", nargs, 2, 2)) {
        goto exit;
    }
    mapping = args[0];
    iterable = args[1];
    return_value = _collections__count_elements_impl(module, mapping, iterable);

exit:
    return return_value;
}

static TyObject *
tuplegetter_new_impl(TyTypeObject *type, Ty_ssize_t index, TyObject *doc);

static TyObject *
tuplegetter_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->tuplegetter_type;
    Ty_ssize_t index;
    TyObject *doc;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("_tuplegetter", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("_tuplegetter", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(TyTuple_GET_ITEM(args, 0));
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        index = ival;
    }
    doc = TyTuple_GET_ITEM(args, 1);
    return_value = tuplegetter_new_impl(type, index, doc);

exit:
    return return_value;
}
/*[clinic end generated code: output=b9d4d647c221cb9f input=a9049054013a1b77]*/
