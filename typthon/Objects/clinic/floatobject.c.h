/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(float_is_integer__doc__,
"is_integer($self, /)\n"
"--\n"
"\n"
"Return True if the float is an integer.");

#define FLOAT_IS_INTEGER_METHODDEF    \
    {"is_integer", (PyCFunction)float_is_integer, METH_NOARGS, float_is_integer__doc__},

static TyObject *
float_is_integer_impl(TyObject *self);

static TyObject *
float_is_integer(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float_is_integer_impl(self);
}

TyDoc_STRVAR(float___trunc____doc__,
"__trunc__($self, /)\n"
"--\n"
"\n"
"Return the Integral closest to x between 0 and x.");

#define FLOAT___TRUNC___METHODDEF    \
    {"__trunc__", (PyCFunction)float___trunc__, METH_NOARGS, float___trunc____doc__},

static TyObject *
float___trunc___impl(TyObject *self);

static TyObject *
float___trunc__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float___trunc___impl(self);
}

TyDoc_STRVAR(float___floor____doc__,
"__floor__($self, /)\n"
"--\n"
"\n"
"Return the floor as an Integral.");

#define FLOAT___FLOOR___METHODDEF    \
    {"__floor__", (PyCFunction)float___floor__, METH_NOARGS, float___floor____doc__},

static TyObject *
float___floor___impl(TyObject *self);

static TyObject *
float___floor__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float___floor___impl(self);
}

TyDoc_STRVAR(float___ceil____doc__,
"__ceil__($self, /)\n"
"--\n"
"\n"
"Return the ceiling as an Integral.");

#define FLOAT___CEIL___METHODDEF    \
    {"__ceil__", (PyCFunction)float___ceil__, METH_NOARGS, float___ceil____doc__},

static TyObject *
float___ceil___impl(TyObject *self);

static TyObject *
float___ceil__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float___ceil___impl(self);
}

TyDoc_STRVAR(float___round____doc__,
"__round__($self, ndigits=None, /)\n"
"--\n"
"\n"
"Return the Integral closest to x, rounding half toward even.\n"
"\n"
"When an argument is passed, work like built-in round(x, ndigits).");

#define FLOAT___ROUND___METHODDEF    \
    {"__round__", _PyCFunction_CAST(float___round__), METH_FASTCALL, float___round____doc__},

static TyObject *
float___round___impl(TyObject *self, TyObject *o_ndigits);

static TyObject *
float___round__(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    return_value = float___round___impl(self, o_ndigits);

exit:
    return return_value;
}

TyDoc_STRVAR(float_conjugate__doc__,
"conjugate($self, /)\n"
"--\n"
"\n"
"Return self, the complex conjugate of any float.");

#define FLOAT_CONJUGATE_METHODDEF    \
    {"conjugate", (PyCFunction)float_conjugate, METH_NOARGS, float_conjugate__doc__},

static TyObject *
float_conjugate_impl(TyObject *self);

static TyObject *
float_conjugate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float_conjugate_impl(self);
}

TyDoc_STRVAR(float_hex__doc__,
"hex($self, /)\n"
"--\n"
"\n"
"Return a hexadecimal representation of a floating-point number.\n"
"\n"
">>> (-0.1).hex()\n"
"\'-0x1.999999999999ap-4\'\n"
">>> 3.14159.hex()\n"
"\'0x1.921f9f01b866ep+1\'");

#define FLOAT_HEX_METHODDEF    \
    {"hex", (PyCFunction)float_hex, METH_NOARGS, float_hex__doc__},

static TyObject *
float_hex_impl(TyObject *self);

static TyObject *
float_hex(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float_hex_impl(self);
}

TyDoc_STRVAR(float_fromhex__doc__,
"fromhex($type, string, /)\n"
"--\n"
"\n"
"Create a floating-point number from a hexadecimal string.\n"
"\n"
">>> float.fromhex(\'0x1.ffffp10\')\n"
"2047.984375\n"
">>> float.fromhex(\'-0x1p-1074\')\n"
"-5e-324");

#define FLOAT_FROMHEX_METHODDEF    \
    {"fromhex", (PyCFunction)float_fromhex, METH_O|METH_CLASS, float_fromhex__doc__},

static TyObject *
float_fromhex_impl(TyTypeObject *type, TyObject *string);

static TyObject *
float_fromhex(TyObject *type, TyObject *string)
{
    TyObject *return_value = NULL;

    return_value = float_fromhex_impl((TyTypeObject *)type, string);

    return return_value;
}

TyDoc_STRVAR(float_as_integer_ratio__doc__,
"as_integer_ratio($self, /)\n"
"--\n"
"\n"
"Return a pair of integers, whose ratio is exactly equal to the original float.\n"
"\n"
"The ratio is in lowest terms and has a positive denominator.  Raise\n"
"OverflowError on infinities and a ValueError on NaNs.\n"
"\n"
">>> (10.0).as_integer_ratio()\n"
"(10, 1)\n"
">>> (0.0).as_integer_ratio()\n"
"(0, 1)\n"
">>> (-.25).as_integer_ratio()\n"
"(-1, 4)");

#define FLOAT_AS_INTEGER_RATIO_METHODDEF    \
    {"as_integer_ratio", (PyCFunction)float_as_integer_ratio, METH_NOARGS, float_as_integer_ratio__doc__},

static TyObject *
float_as_integer_ratio_impl(TyObject *self);

static TyObject *
float_as_integer_ratio(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float_as_integer_ratio_impl(self);
}

TyDoc_STRVAR(float_new__doc__,
"float(x=0, /)\n"
"--\n"
"\n"
"Convert a string or number to a floating-point number, if possible.");

static TyObject *
float_new_impl(TyTypeObject *type, TyObject *x);

static TyObject *
float_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = &TyFloat_Type;
    TyObject *x = NULL;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("float", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("float", TyTuple_GET_SIZE(args), 0, 1)) {
        goto exit;
    }
    if (TyTuple_GET_SIZE(args) < 1) {
        goto skip_optional;
    }
    x = TyTuple_GET_ITEM(args, 0);
skip_optional:
    return_value = float_new_impl(type, x);

exit:
    return return_value;
}

TyDoc_STRVAR(float_from_number__doc__,
"from_number($type, number, /)\n"
"--\n"
"\n"
"Convert real number to a floating-point number.");

#define FLOAT_FROM_NUMBER_METHODDEF    \
    {"from_number", (PyCFunction)float_from_number, METH_O|METH_CLASS, float_from_number__doc__},

static TyObject *
float_from_number_impl(TyTypeObject *type, TyObject *number);

static TyObject *
float_from_number(TyObject *type, TyObject *number)
{
    TyObject *return_value = NULL;

    return_value = float_from_number_impl((TyTypeObject *)type, number);

    return return_value;
}

TyDoc_STRVAR(float___getnewargs____doc__,
"__getnewargs__($self, /)\n"
"--\n"
"\n");

#define FLOAT___GETNEWARGS___METHODDEF    \
    {"__getnewargs__", (PyCFunction)float___getnewargs__, METH_NOARGS, float___getnewargs____doc__},

static TyObject *
float___getnewargs___impl(TyObject *self);

static TyObject *
float___getnewargs__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return float___getnewargs___impl(self);
}

TyDoc_STRVAR(float___getformat____doc__,
"__getformat__($type, typestr, /)\n"
"--\n"
"\n"
"You probably don\'t want to use this function.\n"
"\n"
"  typestr\n"
"    Must be \'double\' or \'float\'.\n"
"\n"
"It exists mainly to be used in Python\'s test suite.\n"
"\n"
"This function returns whichever of \'unknown\', \'IEEE, big-endian\' or \'IEEE,\n"
"little-endian\' best describes the format of floating-point numbers used by the\n"
"C type named by typestr.");

#define FLOAT___GETFORMAT___METHODDEF    \
    {"__getformat__", (PyCFunction)float___getformat__, METH_O|METH_CLASS, float___getformat____doc__},

static TyObject *
float___getformat___impl(TyTypeObject *type, const char *typestr);

static TyObject *
float___getformat__(TyObject *type, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *typestr;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("__getformat__", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t typestr_length;
    typestr = TyUnicode_AsUTF8AndSize(arg, &typestr_length);
    if (typestr == NULL) {
        goto exit;
    }
    if (strlen(typestr) != (size_t)typestr_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = float___getformat___impl((TyTypeObject *)type, typestr);

exit:
    return return_value;
}

TyDoc_STRVAR(float___format____doc__,
"__format__($self, format_spec, /)\n"
"--\n"
"\n"
"Formats the float according to format_spec.");

#define FLOAT___FORMAT___METHODDEF    \
    {"__format__", (PyCFunction)float___format__, METH_O, float___format____doc__},

static TyObject *
float___format___impl(TyObject *self, TyObject *format_spec);

static TyObject *
float___format__(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *format_spec;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("__format__", "argument", "str", arg);
        goto exit;
    }
    format_spec = arg;
    return_value = float___format___impl(self, format_spec);

exit:
    return return_value;
}
/*[clinic end generated code: output=927035897ea3573f input=a9049054013a1b77]*/
