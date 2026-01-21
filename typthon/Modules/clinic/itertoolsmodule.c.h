/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(batched_new__doc__,
"batched(iterable, n, *, strict=False)\n"
"--\n"
"\n"
"Batch data into tuples of length n. The last batch may be shorter than n.\n"
"\n"
"Loops over the input iterable and accumulates data into tuples\n"
"up to size n.  The input is consumed lazily, just enough to\n"
"fill a batch.  The result is yielded as soon as a batch is full\n"
"or when the input iterable is exhausted.\n"
"\n"
"    >>> for batch in batched(\'ABCDEFG\', 3):\n"
"    ...     print(batch)\n"
"    ...\n"
"    (\'A\', \'B\', \'C\')\n"
"    (\'D\', \'E\', \'F\')\n"
"    (\'G\',)\n"
"\n"
"If \"strict\" is True, raises a ValueError if the final batch is shorter\n"
"than n.");

static TyObject *
batched_new_impl(TyTypeObject *type, TyObject *iterable, Ty_ssize_t n,
                 int strict);

static TyObject *
batched_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(iterable), _Ty_LATIN1_CHR('n'), &_Ty_ID(strict), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "n", "strict", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "batched",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 2;
    TyObject *iterable;
    Ty_ssize_t n;
    int strict = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    iterable = fastargs[0];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        n = ival;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    strict = PyObject_IsTrue(fastargs[2]);
    if (strict < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = batched_new_impl(type, iterable, n, strict);

exit:
    return return_value;
}

TyDoc_STRVAR(pairwise_new__doc__,
"pairwise(iterable, /)\n"
"--\n"
"\n"
"Return an iterator of overlapping pairs taken from the input iterator.\n"
"\n"
"    s -> (s0,s1), (s1,s2), (s2, s3), ...");

static TyObject *
pairwise_new_impl(TyTypeObject *type, TyObject *iterable);

static TyObject *
pairwise_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->pairwise_type;
    TyObject *iterable;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("pairwise", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("pairwise", TyTuple_GET_SIZE(args), 1, 1)) {
        goto exit;
    }
    iterable = TyTuple_GET_ITEM(args, 0);
    return_value = pairwise_new_impl(type, iterable);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_groupby__doc__,
"groupby(iterable, key=None)\n"
"--\n"
"\n"
"make an iterator that returns consecutive keys and groups from the iterable\n"
"\n"
"  iterable\n"
"    Elements to divide into groups according to the key function.\n"
"  key\n"
"    A function for computing the group category for each element.\n"
"    If the key function is not specified or is None, the element itself\n"
"    is used for grouping.");

static TyObject *
itertools_groupby_impl(TyTypeObject *type, TyObject *it, TyObject *keyfunc);

static TyObject *
itertools_groupby(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(iterable), &_Ty_ID(key), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "key", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "groupby",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *it;
    TyObject *keyfunc = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    it = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    keyfunc = fastargs[1];
skip_optional_pos:
    return_value = itertools_groupby_impl(type, it, keyfunc);

exit:
    return return_value;
}

static TyObject *
itertools__grouper_impl(TyTypeObject *type, TyObject *parent,
                        TyObject *tgtkey);

static TyObject *
itertools__grouper(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->_grouper_type;
    TyObject *parent;
    TyObject *tgtkey;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("_grouper", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("_grouper", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    if (!PyObject_TypeCheck(TyTuple_GET_ITEM(args, 0), clinic_state_by_cls()->groupby_type)) {
        _TyArg_BadArgument("_grouper", "argument 1", (clinic_state_by_cls()->groupby_type)->tp_name, TyTuple_GET_ITEM(args, 0));
        goto exit;
    }
    parent = TyTuple_GET_ITEM(args, 0);
    tgtkey = TyTuple_GET_ITEM(args, 1);
    return_value = itertools__grouper_impl(type, parent, tgtkey);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_teedataobject__doc__,
"teedataobject(iterable, values, next, /)\n"
"--\n"
"\n"
"Data container common to multiple tee objects.");

static TyObject *
itertools_teedataobject_impl(TyTypeObject *type, TyObject *it,
                             TyObject *values, TyObject *next);

static TyObject *
itertools_teedataobject(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->teedataobject_type;
    TyObject *it;
    TyObject *values;
    TyObject *next;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("teedataobject", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("teedataobject", TyTuple_GET_SIZE(args), 3, 3)) {
        goto exit;
    }
    it = TyTuple_GET_ITEM(args, 0);
    if (!TyList_Check(TyTuple_GET_ITEM(args, 1))) {
        _TyArg_BadArgument("teedataobject", "argument 2", "list", TyTuple_GET_ITEM(args, 1));
        goto exit;
    }
    values = TyTuple_GET_ITEM(args, 1);
    next = TyTuple_GET_ITEM(args, 2);
    return_value = itertools_teedataobject_impl(type, it, values, next);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools__tee__doc__,
"_tee(iterable, /)\n"
"--\n"
"\n"
"Iterator wrapped to make it copyable.");

static TyObject *
itertools__tee_impl(TyTypeObject *type, TyObject *iterable);

static TyObject *
itertools__tee(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->tee_type;
    TyObject *iterable;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("_tee", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("_tee", TyTuple_GET_SIZE(args), 1, 1)) {
        goto exit;
    }
    iterable = TyTuple_GET_ITEM(args, 0);
    return_value = itertools__tee_impl(type, iterable);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_tee__doc__,
"tee($module, iterable, n=2, /)\n"
"--\n"
"\n"
"Returns a tuple of n independent iterators.");

#define ITERTOOLS_TEE_METHODDEF    \
    {"tee", _PyCFunction_CAST(itertools_tee), METH_FASTCALL, itertools_tee__doc__},

static TyObject *
itertools_tee_impl(TyObject *module, TyObject *iterable, Ty_ssize_t n);

static TyObject *
itertools_tee(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *iterable;
    Ty_ssize_t n = 2;

    if (!_TyArg_CheckPositional("tee", nargs, 1, 2)) {
        goto exit;
    }
    iterable = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
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
    return_value = itertools_tee_impl(module, iterable, n);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_cycle__doc__,
"cycle(iterable, /)\n"
"--\n"
"\n"
"Return elements from the iterable until it is exhausted. Then repeat the sequence indefinitely.");

static TyObject *
itertools_cycle_impl(TyTypeObject *type, TyObject *iterable);

static TyObject *
itertools_cycle(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->cycle_type;
    TyObject *iterable;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("cycle", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("cycle", TyTuple_GET_SIZE(args), 1, 1)) {
        goto exit;
    }
    iterable = TyTuple_GET_ITEM(args, 0);
    return_value = itertools_cycle_impl(type, iterable);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_dropwhile__doc__,
"dropwhile(predicate, iterable, /)\n"
"--\n"
"\n"
"Drop items from the iterable while predicate(item) is true.\n"
"\n"
"Afterwards, return every element until the iterable is exhausted.");

static TyObject *
itertools_dropwhile_impl(TyTypeObject *type, TyObject *func, TyObject *seq);

static TyObject *
itertools_dropwhile(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->dropwhile_type;
    TyObject *func;
    TyObject *seq;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("dropwhile", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("dropwhile", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    func = TyTuple_GET_ITEM(args, 0);
    seq = TyTuple_GET_ITEM(args, 1);
    return_value = itertools_dropwhile_impl(type, func, seq);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_takewhile__doc__,
"takewhile(predicate, iterable, /)\n"
"--\n"
"\n"
"Return successive entries from an iterable as long as the predicate evaluates to true for each entry.");

static TyObject *
itertools_takewhile_impl(TyTypeObject *type, TyObject *func, TyObject *seq);

static TyObject *
itertools_takewhile(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->takewhile_type;
    TyObject *func;
    TyObject *seq;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("takewhile", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("takewhile", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    func = TyTuple_GET_ITEM(args, 0);
    seq = TyTuple_GET_ITEM(args, 1);
    return_value = itertools_takewhile_impl(type, func, seq);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_starmap__doc__,
"starmap(function, iterable, /)\n"
"--\n"
"\n"
"Return an iterator whose values are returned from the function evaluated with an argument tuple taken from the given sequence.");

static TyObject *
itertools_starmap_impl(TyTypeObject *type, TyObject *func, TyObject *seq);

static TyObject *
itertools_starmap(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->starmap_type;
    TyObject *func;
    TyObject *seq;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("starmap", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("starmap", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    func = TyTuple_GET_ITEM(args, 0);
    seq = TyTuple_GET_ITEM(args, 1);
    return_value = itertools_starmap_impl(type, func, seq);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_chain_from_iterable__doc__,
"from_iterable($type, iterable, /)\n"
"--\n"
"\n"
"Alternative chain() constructor taking a single iterable argument that evaluates lazily.");

#define ITERTOOLS_CHAIN_FROM_ITERABLE_METHODDEF    \
    {"from_iterable", (PyCFunction)itertools_chain_from_iterable, METH_O|METH_CLASS, itertools_chain_from_iterable__doc__},

static TyObject *
itertools_chain_from_iterable_impl(TyTypeObject *type, TyObject *arg);

static TyObject *
itertools_chain_from_iterable(TyObject *type, TyObject *arg)
{
    TyObject *return_value = NULL;

    return_value = itertools_chain_from_iterable_impl((TyTypeObject *)type, arg);

    return return_value;
}

TyDoc_STRVAR(itertools_combinations__doc__,
"combinations(iterable, r)\n"
"--\n"
"\n"
"Return successive r-length combinations of elements in the iterable.\n"
"\n"
"combinations(range(4), 3) --> (0,1,2), (0,1,3), (0,2,3), (1,2,3)");

static TyObject *
itertools_combinations_impl(TyTypeObject *type, TyObject *iterable,
                            Ty_ssize_t r);

static TyObject *
itertools_combinations(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(iterable), _Ty_LATIN1_CHR('r'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "r", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "combinations",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *iterable;
    Ty_ssize_t r;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    iterable = fastargs[0];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        r = ival;
    }
    return_value = itertools_combinations_impl(type, iterable, r);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_combinations_with_replacement__doc__,
"combinations_with_replacement(iterable, r)\n"
"--\n"
"\n"
"Return successive r-length combinations of elements in the iterable allowing individual elements to have successive repeats.\n"
"\n"
"combinations_with_replacement(\'ABC\', 2) --> (\'A\',\'A\'), (\'A\',\'B\'), (\'A\',\'C\'), (\'B\',\'B\'), (\'B\',\'C\'), (\'C\',\'C\')");

static TyObject *
itertools_combinations_with_replacement_impl(TyTypeObject *type,
                                             TyObject *iterable,
                                             Ty_ssize_t r);

static TyObject *
itertools_combinations_with_replacement(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(iterable), _Ty_LATIN1_CHR('r'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "r", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "combinations_with_replacement",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *iterable;
    Ty_ssize_t r;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    iterable = fastargs[0];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        r = ival;
    }
    return_value = itertools_combinations_with_replacement_impl(type, iterable, r);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_permutations__doc__,
"permutations(iterable, r=None)\n"
"--\n"
"\n"
"Return successive r-length permutations of elements in the iterable.\n"
"\n"
"permutations(range(3), 2) --> (0,1), (0,2), (1,0), (1,2), (2,0), (2,1)");

static TyObject *
itertools_permutations_impl(TyTypeObject *type, TyObject *iterable,
                            TyObject *robj);

static TyObject *
itertools_permutations(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(iterable), _Ty_LATIN1_CHR('r'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "r", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "permutations",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *iterable;
    TyObject *robj = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    iterable = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    robj = fastargs[1];
skip_optional_pos:
    return_value = itertools_permutations_impl(type, iterable, robj);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_accumulate__doc__,
"accumulate(iterable, func=None, *, initial=None)\n"
"--\n"
"\n"
"Return series of accumulated sums (or other binary function results).");

static TyObject *
itertools_accumulate_impl(TyTypeObject *type, TyObject *iterable,
                          TyObject *binop, TyObject *initial);

static TyObject *
itertools_accumulate(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(iterable), &_Ty_ID(func), &_Ty_ID(initial), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "func", "initial", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "accumulate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *iterable;
    TyObject *binop = Ty_None;
    TyObject *initial = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    iterable = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        binop = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    initial = fastargs[2];
skip_optional_kwonly:
    return_value = itertools_accumulate_impl(type, iterable, binop, initial);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_compress__doc__,
"compress(data, selectors)\n"
"--\n"
"\n"
"Return data elements corresponding to true selector elements.\n"
"\n"
"Forms a shorter iterator from selected data elements using the selectors to\n"
"choose the data elements.");

static TyObject *
itertools_compress_impl(TyTypeObject *type, TyObject *seq1, TyObject *seq2);

static TyObject *
itertools_compress(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(selectors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "selectors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "compress",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *seq1;
    TyObject *seq2;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    seq1 = fastargs[0];
    seq2 = fastargs[1];
    return_value = itertools_compress_impl(type, seq1, seq2);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_filterfalse__doc__,
"filterfalse(function, iterable, /)\n"
"--\n"
"\n"
"Return those items of iterable for which function(item) is false.\n"
"\n"
"If function is None, return the items that are false.");

static TyObject *
itertools_filterfalse_impl(TyTypeObject *type, TyObject *func, TyObject *seq);

static TyObject *
itertools_filterfalse(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = clinic_state()->filterfalse_type;
    TyObject *func;
    TyObject *seq;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("filterfalse", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("filterfalse", TyTuple_GET_SIZE(args), 2, 2)) {
        goto exit;
    }
    func = TyTuple_GET_ITEM(args, 0);
    seq = TyTuple_GET_ITEM(args, 1);
    return_value = itertools_filterfalse_impl(type, func, seq);

exit:
    return return_value;
}

TyDoc_STRVAR(itertools_count__doc__,
"count(start=0, step=1)\n"
"--\n"
"\n"
"Return a count object whose .__next__() method returns consecutive values.\n"
"\n"
"Equivalent to:\n"
"    def count(firstval=0, step=1):\n"
"        x = firstval\n"
"        while 1:\n"
"            yield x\n"
"            x += step");

static TyObject *
itertools_count_impl(TyTypeObject *type, TyObject *long_cnt,
                     TyObject *long_step);

static TyObject *
itertools_count(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
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
        .ob_item = { &_Ty_ID(start), &_Ty_ID(step), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"start", "step", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "count",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *long_cnt = NULL;
    TyObject *long_step = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        long_cnt = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    long_step = fastargs[1];
skip_optional_pos:
    return_value = itertools_count_impl(type, long_cnt, long_step);

exit:
    return return_value;
}
/*[clinic end generated code: output=999758202a532e0a input=a9049054013a1b77]*/
