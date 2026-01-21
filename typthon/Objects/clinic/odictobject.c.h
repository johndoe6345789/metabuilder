/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(OrderedDict_fromkeys__doc__,
"fromkeys($type, /, iterable, value=None)\n"
"--\n"
"\n"
"Create a new ordered dictionary with keys from iterable and values set to value.");

#define ORDEREDDICT_FROMKEYS_METHODDEF    \
    {"fromkeys", _PyCFunction_CAST(OrderedDict_fromkeys), METH_FASTCALL|METH_KEYWORDS|METH_CLASS, OrderedDict_fromkeys__doc__},

static TyObject *
OrderedDict_fromkeys_impl(TyTypeObject *type, TyObject *seq, TyObject *value);

static TyObject *
OrderedDict_fromkeys(TyObject *type, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(iterable), &_Ty_ID(value), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"iterable", "value", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fromkeys",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *seq;
    TyObject *value = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    seq = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    value = args[1];
skip_optional_pos:
    return_value = OrderedDict_fromkeys_impl((TyTypeObject *)type, seq, value);

exit:
    return return_value;
}

TyDoc_STRVAR(OrderedDict_setdefault__doc__,
"setdefault($self, /, key, default=None)\n"
"--\n"
"\n"
"Insert key with a value of default if key is not in the dictionary.\n"
"\n"
"Return the value for key if key is in the dictionary, else default.");

#define ORDEREDDICT_SETDEFAULT_METHODDEF    \
    {"setdefault", _PyCFunction_CAST(OrderedDict_setdefault), METH_FASTCALL|METH_KEYWORDS, OrderedDict_setdefault__doc__},

static TyObject *
OrderedDict_setdefault_impl(PyODictObject *self, TyObject *key,
                            TyObject *default_value);

static TyObject *
OrderedDict_setdefault(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "setdefault",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *key;
    TyObject *default_value = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    key = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    default_value = args[1];
skip_optional_pos:
    return_value = OrderedDict_setdefault_impl((PyODictObject *)self, key, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(OrderedDict_pop__doc__,
"pop($self, /, key, default=<unrepresentable>)\n"
"--\n"
"\n"
"od.pop(key[,default]) -> v, remove specified key and return the corresponding value.\n"
"\n"
"If the key is not found, return the default if given; otherwise,\n"
"raise a KeyError.");

#define ORDEREDDICT_POP_METHODDEF    \
    {"pop", _PyCFunction_CAST(OrderedDict_pop), METH_FASTCALL|METH_KEYWORDS, OrderedDict_pop__doc__},

static TyObject *
OrderedDict_pop_impl(PyODictObject *self, TyObject *key,
                     TyObject *default_value);

static TyObject *
OrderedDict_pop(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "pop",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *key;
    TyObject *default_value = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    key = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    default_value = args[1];
skip_optional_pos:
    return_value = OrderedDict_pop_impl((PyODictObject *)self, key, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(OrderedDict_popitem__doc__,
"popitem($self, /, last=True)\n"
"--\n"
"\n"
"Remove and return a (key, value) pair from the dictionary.\n"
"\n"
"Pairs are returned in LIFO order if last is true or FIFO order if false.");

#define ORDEREDDICT_POPITEM_METHODDEF    \
    {"popitem", _PyCFunction_CAST(OrderedDict_popitem), METH_FASTCALL|METH_KEYWORDS, OrderedDict_popitem__doc__},

static TyObject *
OrderedDict_popitem_impl(PyODictObject *self, int last);

static TyObject *
OrderedDict_popitem(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(last), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"last", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "popitem",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int last = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    last = PyObject_IsTrue(args[0]);
    if (last < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = OrderedDict_popitem_impl((PyODictObject *)self, last);

exit:
    return return_value;
}

TyDoc_STRVAR(OrderedDict_move_to_end__doc__,
"move_to_end($self, /, key, last=True)\n"
"--\n"
"\n"
"Move an existing element to the end (or beginning if last is false).\n"
"\n"
"Raise KeyError if the element does not exist.");

#define ORDEREDDICT_MOVE_TO_END_METHODDEF    \
    {"move_to_end", _PyCFunction_CAST(OrderedDict_move_to_end), METH_FASTCALL|METH_KEYWORDS, OrderedDict_move_to_end__doc__},

static TyObject *
OrderedDict_move_to_end_impl(PyODictObject *self, TyObject *key, int last);

static TyObject *
OrderedDict_move_to_end(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(last), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "last", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "move_to_end",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *key;
    int last = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    key = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    last = PyObject_IsTrue(args[1]);
    if (last < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = OrderedDict_move_to_end_impl((PyODictObject *)self, key, last);

exit:
    return return_value;
}
/*[clinic end generated code: output=7d8206823bb1f419 input=a9049054013a1b77]*/
