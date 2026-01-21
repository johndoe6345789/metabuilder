/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(memoryview__doc__,
"memoryview(object)\n"
"--\n"
"\n"
"Create a new memoryview object which references the given object.");

static TyObject *
memoryview_impl(TyTypeObject *type, TyObject *object);

static TyObject *
memoryview(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(object), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"object", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "memoryview",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *object;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    object = fastargs[0];
    return_value = memoryview_impl(type, object);

exit:
    return return_value;
}

TyDoc_STRVAR(memoryview__from_flags__doc__,
"_from_flags($type, /, object, flags)\n"
"--\n"
"\n"
"Create a new memoryview object which references the given object.");

#define MEMORYVIEW__FROM_FLAGS_METHODDEF    \
    {"_from_flags", _PyCFunction_CAST(memoryview__from_flags), METH_FASTCALL|METH_KEYWORDS|METH_CLASS, memoryview__from_flags__doc__},

static TyObject *
memoryview__from_flags_impl(TyTypeObject *type, TyObject *object, int flags);

static TyObject *
memoryview__from_flags(TyObject *type, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(object), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"object", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_from_flags",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *object;
    int flags;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    object = args[0];
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = memoryview__from_flags_impl((TyTypeObject *)type, object, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(memoryview_release__doc__,
"release($self, /)\n"
"--\n"
"\n"
"Release the underlying buffer exposed by the memoryview object.");

#define MEMORYVIEW_RELEASE_METHODDEF    \
    {"release", (PyCFunction)memoryview_release, METH_NOARGS, memoryview_release__doc__},

static TyObject *
memoryview_release_impl(PyMemoryViewObject *self);

static TyObject *
memoryview_release(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return memoryview_release_impl((PyMemoryViewObject *)self);
}

TyDoc_STRVAR(memoryview_cast__doc__,
"cast($self, /, format, shape=<unrepresentable>)\n"
"--\n"
"\n"
"Cast a memoryview to a new format or shape.");

#define MEMORYVIEW_CAST_METHODDEF    \
    {"cast", _PyCFunction_CAST(memoryview_cast), METH_FASTCALL|METH_KEYWORDS, memoryview_cast__doc__},

static TyObject *
memoryview_cast_impl(PyMemoryViewObject *self, TyObject *format,
                     TyObject *shape);

static TyObject *
memoryview_cast(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(format), &_Ty_ID(shape), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"format", "shape", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "cast",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *format;
    TyObject *shape = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("cast", "argument 'format'", "str", args[0]);
        goto exit;
    }
    format = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    shape = args[1];
skip_optional_pos:
    return_value = memoryview_cast_impl((PyMemoryViewObject *)self, format, shape);

exit:
    return return_value;
}

TyDoc_STRVAR(memoryview_toreadonly__doc__,
"toreadonly($self, /)\n"
"--\n"
"\n"
"Return a readonly version of the memoryview.");

#define MEMORYVIEW_TOREADONLY_METHODDEF    \
    {"toreadonly", (PyCFunction)memoryview_toreadonly, METH_NOARGS, memoryview_toreadonly__doc__},

static TyObject *
memoryview_toreadonly_impl(PyMemoryViewObject *self);

static TyObject *
memoryview_toreadonly(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return memoryview_toreadonly_impl((PyMemoryViewObject *)self);
}

TyDoc_STRVAR(memoryview_tolist__doc__,
"tolist($self, /)\n"
"--\n"
"\n"
"Return the data in the buffer as a list of elements.");

#define MEMORYVIEW_TOLIST_METHODDEF    \
    {"tolist", (PyCFunction)memoryview_tolist, METH_NOARGS, memoryview_tolist__doc__},

static TyObject *
memoryview_tolist_impl(PyMemoryViewObject *self);

static TyObject *
memoryview_tolist(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return memoryview_tolist_impl((PyMemoryViewObject *)self);
}

TyDoc_STRVAR(memoryview_tobytes__doc__,
"tobytes($self, /, order=\'C\')\n"
"--\n"
"\n"
"Return the data in the buffer as a byte string.\n"
"\n"
"Order can be {\'C\', \'F\', \'A\'}. When order is \'C\' or \'F\', the data of the\n"
"original array is converted to C or Fortran order. For contiguous views,\n"
"\'A\' returns an exact copy of the physical memory. In particular, in-memory\n"
"Fortran order is preserved. For non-contiguous views, the data is converted\n"
"to C first. order=None is the same as order=\'C\'.");

#define MEMORYVIEW_TOBYTES_METHODDEF    \
    {"tobytes", _PyCFunction_CAST(memoryview_tobytes), METH_FASTCALL|METH_KEYWORDS, memoryview_tobytes__doc__},

static TyObject *
memoryview_tobytes_impl(PyMemoryViewObject *self, const char *order);

static TyObject *
memoryview_tobytes(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(order), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"order", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "tobytes",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    const char *order = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0] == Ty_None) {
        order = NULL;
    }
    else if (TyUnicode_Check(args[0])) {
        Ty_ssize_t order_length;
        order = TyUnicode_AsUTF8AndSize(args[0], &order_length);
        if (order == NULL) {
            goto exit;
        }
        if (strlen(order) != (size_t)order_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("tobytes", "argument 'order'", "str or None", args[0]);
        goto exit;
    }
skip_optional_pos:
    return_value = memoryview_tobytes_impl((PyMemoryViewObject *)self, order);

exit:
    return return_value;
}

TyDoc_STRVAR(memoryview_hex__doc__,
"hex($self, /, sep=<unrepresentable>, bytes_per_sep=1)\n"
"--\n"
"\n"
"Return the data in the buffer as a str of hexadecimal numbers.\n"
"\n"
"  sep\n"
"    An optional single character or byte to separate hex bytes.\n"
"  bytes_per_sep\n"
"    How many bytes between separators.  Positive values count from the\n"
"    right, negative values count from the left.\n"
"\n"
"Example:\n"
">>> value = memoryview(b\'\\xb9\\x01\\xef\')\n"
">>> value.hex()\n"
"\'b901ef\'\n"
">>> value.hex(\':\')\n"
"\'b9:01:ef\'\n"
">>> value.hex(\':\', 2)\n"
"\'b9:01ef\'\n"
">>> value.hex(\':\', -2)\n"
"\'b901:ef\'");

#define MEMORYVIEW_HEX_METHODDEF    \
    {"hex", _PyCFunction_CAST(memoryview_hex), METH_FASTCALL|METH_KEYWORDS, memoryview_hex__doc__},

static TyObject *
memoryview_hex_impl(PyMemoryViewObject *self, TyObject *sep,
                    int bytes_per_sep);

static TyObject *
memoryview_hex(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(sep), &_Ty_ID(bytes_per_sep), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"sep", "bytes_per_sep", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "hex",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *sep = NULL;
    int bytes_per_sep = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        sep = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    bytes_per_sep = TyLong_AsInt(args[1]);
    if (bytes_per_sep == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = memoryview_hex_impl((PyMemoryViewObject *)self, sep, bytes_per_sep);

exit:
    return return_value;
}

TyDoc_STRVAR(memoryview_count__doc__,
"count($self, value, /)\n"
"--\n"
"\n"
"Count the number of occurrences of a value.");

#define MEMORYVIEW_COUNT_METHODDEF    \
    {"count", (PyCFunction)memoryview_count, METH_O, memoryview_count__doc__},

static TyObject *
memoryview_count_impl(PyMemoryViewObject *self, TyObject *value);

static TyObject *
memoryview_count(TyObject *self, TyObject *value)
{
    TyObject *return_value = NULL;

    return_value = memoryview_count_impl((PyMemoryViewObject *)self, value);

    return return_value;
}

TyDoc_STRVAR(memoryview_index__doc__,
"index($self, value, start=0, stop=sys.maxsize, /)\n"
"--\n"
"\n"
"Return the index of the first occurrence of a value.\n"
"\n"
"Raises ValueError if the value is not present.");

#define MEMORYVIEW_INDEX_METHODDEF    \
    {"index", _PyCFunction_CAST(memoryview_index), METH_FASTCALL, memoryview_index__doc__},

static TyObject *
memoryview_index_impl(PyMemoryViewObject *self, TyObject *value,
                      Ty_ssize_t start, Ty_ssize_t stop);

static TyObject *
memoryview_index(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    return_value = memoryview_index_impl((PyMemoryViewObject *)self, value, start, stop);

exit:
    return return_value;
}
/*[clinic end generated code: output=154f4c04263ccb24 input=a9049054013a1b77]*/
