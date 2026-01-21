/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

static TyObject *
long_new_impl(TyTypeObject *type, TyObject *x, TyObject *obase);

static TyObject *
long_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(base), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "base", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "int",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *x = NULL;
    TyObject *obase = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional_posonly;
    }
    noptargs--;
    x = fastargs[0];
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_pos;
    }
    obase = fastargs[1];
skip_optional_pos:
    return_value = long_new_impl(type, x, obase);

exit:
    return return_value;
}

TyDoc_STRVAR(int___getnewargs____doc__,
"__getnewargs__($self, /)\n"
"--\n"
"\n");

#define INT___GETNEWARGS___METHODDEF    \
    {"__getnewargs__", (PyCFunction)int___getnewargs__, METH_NOARGS, int___getnewargs____doc__},

static TyObject *
int___getnewargs___impl(TyObject *self);

static TyObject *
int___getnewargs__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return int___getnewargs___impl(self);
}

TyDoc_STRVAR(int___format____doc__,
"__format__($self, format_spec, /)\n"
"--\n"
"\n"
"Convert to a string according to format_spec.");

#define INT___FORMAT___METHODDEF    \
    {"__format__", (PyCFunction)int___format__, METH_O, int___format____doc__},

static TyObject *
int___format___impl(TyObject *self, TyObject *format_spec);

static TyObject *
int___format__(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *format_spec;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("__format__", "argument", "str", arg);
        goto exit;
    }
    format_spec = arg;
    return_value = int___format___impl(self, format_spec);

exit:
    return return_value;
}

TyDoc_STRVAR(int___round____doc__,
"__round__($self, ndigits=None, /)\n"
"--\n"
"\n"
"Rounding an Integral returns itself.\n"
"\n"
"Rounding with an ndigits argument also returns an integer.");

#define INT___ROUND___METHODDEF    \
    {"__round__", _PyCFunction_CAST(int___round__), METH_FASTCALL, int___round____doc__},

static TyObject *
int___round___impl(TyObject *self, TyObject *o_ndigits);

static TyObject *
int___round__(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *o_ndigits = Ty_None;

    if (!_TyArg_CheckPositional("__round__", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    o_ndigits = args[0];
skip_optional:
    return_value = int___round___impl(self, o_ndigits);

exit:
    return return_value;
}

TyDoc_STRVAR(int___sizeof____doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n"
"Returns size in memory, in bytes.");

#define INT___SIZEOF___METHODDEF    \
    {"__sizeof__", (PyCFunction)int___sizeof__, METH_NOARGS, int___sizeof____doc__},

static Ty_ssize_t
int___sizeof___impl(TyObject *self);

static TyObject *
int___sizeof__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    Ty_ssize_t _return_value;

    _return_value = int___sizeof___impl(self);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(int_bit_length__doc__,
"bit_length($self, /)\n"
"--\n"
"\n"
"Number of bits necessary to represent self in binary.\n"
"\n"
">>> bin(37)\n"
"\'0b100101\'\n"
">>> (37).bit_length()\n"
"6");

#define INT_BIT_LENGTH_METHODDEF    \
    {"bit_length", (PyCFunction)int_bit_length, METH_NOARGS, int_bit_length__doc__},

static TyObject *
int_bit_length_impl(TyObject *self);

static TyObject *
int_bit_length(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return int_bit_length_impl(self);
}

TyDoc_STRVAR(int_bit_count__doc__,
"bit_count($self, /)\n"
"--\n"
"\n"
"Number of ones in the binary representation of the absolute value of self.\n"
"\n"
"Also known as the population count.\n"
"\n"
">>> bin(13)\n"
"\'0b1101\'\n"
">>> (13).bit_count()\n"
"3");

#define INT_BIT_COUNT_METHODDEF    \
    {"bit_count", (PyCFunction)int_bit_count, METH_NOARGS, int_bit_count__doc__},

static TyObject *
int_bit_count_impl(TyObject *self);

static TyObject *
int_bit_count(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return int_bit_count_impl(self);
}

TyDoc_STRVAR(int_as_integer_ratio__doc__,
"as_integer_ratio($self, /)\n"
"--\n"
"\n"
"Return a pair of integers, whose ratio is equal to the original int.\n"
"\n"
"The ratio is in lowest terms and has a positive denominator.\n"
"\n"
">>> (10).as_integer_ratio()\n"
"(10, 1)\n"
">>> (-10).as_integer_ratio()\n"
"(-10, 1)\n"
">>> (0).as_integer_ratio()\n"
"(0, 1)");

#define INT_AS_INTEGER_RATIO_METHODDEF    \
    {"as_integer_ratio", (PyCFunction)int_as_integer_ratio, METH_NOARGS, int_as_integer_ratio__doc__},

static TyObject *
int_as_integer_ratio_impl(TyObject *self);

static TyObject *
int_as_integer_ratio(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return int_as_integer_ratio_impl(self);
}

TyDoc_STRVAR(int_to_bytes__doc__,
"to_bytes($self, /, length=1, byteorder=\'big\', *, signed=False)\n"
"--\n"
"\n"
"Return an array of bytes representing an integer.\n"
"\n"
"  length\n"
"    Length of bytes object to use.  An OverflowError is raised if the\n"
"    integer is not representable with the given number of bytes.  Default\n"
"    is length 1.\n"
"  byteorder\n"
"    The byte order used to represent the integer.  If byteorder is \'big\',\n"
"    the most significant byte is at the beginning of the byte array.  If\n"
"    byteorder is \'little\', the most significant byte is at the end of the\n"
"    byte array.  To request the native byte order of the host system, use\n"
"    sys.byteorder as the byte order value.  Default is to use \'big\'.\n"
"  signed\n"
"    Determines whether two\'s complement is used to represent the integer.\n"
"    If signed is False and a negative integer is given, an OverflowError\n"
"    is raised.");

#define INT_TO_BYTES_METHODDEF    \
    {"to_bytes", _PyCFunction_CAST(int_to_bytes), METH_FASTCALL|METH_KEYWORDS, int_to_bytes__doc__},

static TyObject *
int_to_bytes_impl(TyObject *self, Ty_ssize_t length, TyObject *byteorder,
                  int is_signed);

static TyObject *
int_to_bytes(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(length), &_Ty_ID(byteorder), &_Ty_ID(signed), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"length", "byteorder", "signed", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "to_bytes",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    Ty_ssize_t length = 1;
    TyObject *byteorder = NULL;
    int is_signed = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
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
            length = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        if (!TyUnicode_Check(args[1])) {
            _TyArg_BadArgument("to_bytes", "argument 'byteorder'", "str", args[1]);
            goto exit;
        }
        byteorder = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    is_signed = PyObject_IsTrue(args[2]);
    if (is_signed < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = int_to_bytes_impl(self, length, byteorder, is_signed);

exit:
    return return_value;
}

TyDoc_STRVAR(int_from_bytes__doc__,
"from_bytes($type, /, bytes, byteorder=\'big\', *, signed=False)\n"
"--\n"
"\n"
"Return the integer represented by the given array of bytes.\n"
"\n"
"  bytes\n"
"    Holds the array of bytes to convert.  The argument must either\n"
"    support the buffer protocol or be an iterable object producing bytes.\n"
"    Bytes and bytearray are examples of built-in objects that support the\n"
"    buffer protocol.\n"
"  byteorder\n"
"    The byte order used to represent the integer.  If byteorder is \'big\',\n"
"    the most significant byte is at the beginning of the byte array.  If\n"
"    byteorder is \'little\', the most significant byte is at the end of the\n"
"    byte array.  To request the native byte order of the host system, use\n"
"    sys.byteorder as the byte order value.  Default is to use \'big\'.\n"
"  signed\n"
"    Indicates whether two\'s complement is used to represent the integer.");

#define INT_FROM_BYTES_METHODDEF    \
    {"from_bytes", _PyCFunction_CAST(int_from_bytes), METH_FASTCALL|METH_KEYWORDS|METH_CLASS, int_from_bytes__doc__},

static TyObject *
int_from_bytes_impl(TyTypeObject *type, TyObject *bytes_obj,
                    TyObject *byteorder, int is_signed);

static TyObject *
int_from_bytes(TyObject *type, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(bytes), &_Ty_ID(byteorder), &_Ty_ID(signed), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"bytes", "byteorder", "signed", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "from_bytes",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *bytes_obj;
    TyObject *byteorder = NULL;
    int is_signed = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    bytes_obj = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        if (!TyUnicode_Check(args[1])) {
            _TyArg_BadArgument("from_bytes", "argument 'byteorder'", "str", args[1]);
            goto exit;
        }
        byteorder = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    is_signed = PyObject_IsTrue(args[2]);
    if (is_signed < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = int_from_bytes_impl((TyTypeObject *)type, bytes_obj, byteorder, is_signed);

exit:
    return return_value;
}

TyDoc_STRVAR(int_is_integer__doc__,
"is_integer($self, /)\n"
"--\n"
"\n"
"Returns True. Exists for duck type compatibility with float.is_integer.");

#define INT_IS_INTEGER_METHODDEF    \
    {"is_integer", (PyCFunction)int_is_integer, METH_NOARGS, int_is_integer__doc__},

static TyObject *
int_is_integer_impl(TyObject *self);

static TyObject *
int_is_integer(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return int_is_integer_impl(self);
}
/*[clinic end generated code: output=d23f8ce5bdf08a30 input=a9049054013a1b77]*/
