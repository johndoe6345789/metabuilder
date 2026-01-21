/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_BadArgument()

TyDoc_STRVAR(complex_conjugate__doc__,
"conjugate($self, /)\n"
"--\n"
"\n"
"Return the complex conjugate of its argument. (3-4j).conjugate() == 3+4j.");

#define COMPLEX_CONJUGATE_METHODDEF    \
    {"conjugate", (PyCFunction)complex_conjugate, METH_NOARGS, complex_conjugate__doc__},

static TyObject *
complex_conjugate_impl(PyComplexObject *self);

static TyObject *
complex_conjugate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return complex_conjugate_impl((PyComplexObject *)self);
}

TyDoc_STRVAR(complex___getnewargs____doc__,
"__getnewargs__($self, /)\n"
"--\n"
"\n");

#define COMPLEX___GETNEWARGS___METHODDEF    \
    {"__getnewargs__", (PyCFunction)complex___getnewargs__, METH_NOARGS, complex___getnewargs____doc__},

static TyObject *
complex___getnewargs___impl(PyComplexObject *self);

static TyObject *
complex___getnewargs__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return complex___getnewargs___impl((PyComplexObject *)self);
}

TyDoc_STRVAR(complex___format____doc__,
"__format__($self, format_spec, /)\n"
"--\n"
"\n"
"Convert to a string according to format_spec.");

#define COMPLEX___FORMAT___METHODDEF    \
    {"__format__", (PyCFunction)complex___format__, METH_O, complex___format____doc__},

static TyObject *
complex___format___impl(PyComplexObject *self, TyObject *format_spec);

static TyObject *
complex___format__(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *format_spec;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("__format__", "argument", "str", arg);
        goto exit;
    }
    format_spec = arg;
    return_value = complex___format___impl((PyComplexObject *)self, format_spec);

exit:
    return return_value;
}

TyDoc_STRVAR(complex___complex____doc__,
"__complex__($self, /)\n"
"--\n"
"\n"
"Convert this value to exact type complex.");

#define COMPLEX___COMPLEX___METHODDEF    \
    {"__complex__", (PyCFunction)complex___complex__, METH_NOARGS, complex___complex____doc__},

static TyObject *
complex___complex___impl(PyComplexObject *self);

static TyObject *
complex___complex__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return complex___complex___impl((PyComplexObject *)self);
}

TyDoc_STRVAR(complex_new__doc__,
"complex(real=0, imag=0)\n"
"--\n"
"\n"
"Create a complex number from a string or numbers.\n"
"\n"
"If a string is given, parse it as a complex number.\n"
"If a single number is given, convert it to a complex number.\n"
"If the \'real\' or \'imag\' arguments are given, create a complex number\n"
"with the specified real and imaginary components.");

static TyObject *
complex_new_impl(TyTypeObject *type, TyObject *r, TyObject *i);

static TyObject *
complex_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(real), &_Ty_ID(imag), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"real", "imag", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "complex",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *r = NULL;
    TyObject *i = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        r = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    i = fastargs[1];
skip_optional_pos:
    return_value = complex_new_impl(type, r, i);

exit:
    return return_value;
}

TyDoc_STRVAR(complex_from_number__doc__,
"from_number($type, number, /)\n"
"--\n"
"\n"
"Convert number to a complex floating-point number.");

#define COMPLEX_FROM_NUMBER_METHODDEF    \
    {"from_number", (PyCFunction)complex_from_number, METH_O|METH_CLASS, complex_from_number__doc__},

static TyObject *
complex_from_number_impl(TyTypeObject *type, TyObject *number);

static TyObject *
complex_from_number(TyObject *type, TyObject *number)
{
    TyObject *return_value = NULL;

    return_value = complex_from_number_impl((TyTypeObject *)type, number);

    return return_value;
}
/*[clinic end generated code: output=05d2ff43fc409733 input=a9049054013a1b77]*/
