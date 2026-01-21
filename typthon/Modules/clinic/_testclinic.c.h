/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_long.h"          // _TyLong_UnsignedShort_Converter()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_tuple.h"         // _TyTuple_FromArray()

TyDoc_STRVAR(test_empty_function__doc__,
"test_empty_function($module, /)\n"
"--\n"
"\n");

#define TEST_EMPTY_FUNCTION_METHODDEF    \
    {"test_empty_function", (PyCFunction)test_empty_function, METH_NOARGS, test_empty_function__doc__},

static TyObject *
test_empty_function_impl(TyObject *module);

static TyObject *
test_empty_function(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_empty_function_impl(module);
}

TyDoc_STRVAR(objects_converter__doc__,
"objects_converter($module, a, b=<unrepresentable>, /)\n"
"--\n"
"\n");

#define OBJECTS_CONVERTER_METHODDEF    \
    {"objects_converter", _PyCFunction_CAST(objects_converter), METH_FASTCALL, objects_converter__doc__},

static TyObject *
objects_converter_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
objects_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = NULL;

    if (!_TyArg_CheckPositional("objects_converter", nargs, 1, 2)) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    b = args[1];
skip_optional:
    return_value = objects_converter_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(bytes_object_converter__doc__,
"bytes_object_converter($module, a, /)\n"
"--\n"
"\n");

#define BYTES_OBJECT_CONVERTER_METHODDEF    \
    {"bytes_object_converter", (PyCFunction)bytes_object_converter, METH_O, bytes_object_converter__doc__},

static TyObject *
bytes_object_converter_impl(TyObject *module, PyBytesObject *a);

static TyObject *
bytes_object_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    PyBytesObject *a;

    if (!TyBytes_Check(arg)) {
        _TyArg_BadArgument("bytes_object_converter", "argument", "bytes", arg);
        goto exit;
    }
    a = (PyBytesObject *)arg;
    return_value = bytes_object_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(byte_array_object_converter__doc__,
"byte_array_object_converter($module, a, /)\n"
"--\n"
"\n");

#define BYTE_ARRAY_OBJECT_CONVERTER_METHODDEF    \
    {"byte_array_object_converter", (PyCFunction)byte_array_object_converter, METH_O, byte_array_object_converter__doc__},

static TyObject *
byte_array_object_converter_impl(TyObject *module, PyByteArrayObject *a);

static TyObject *
byte_array_object_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    PyByteArrayObject *a;

    if (!TyByteArray_Check(arg)) {
        _TyArg_BadArgument("byte_array_object_converter", "argument", "bytearray", arg);
        goto exit;
    }
    a = (PyByteArrayObject *)arg;
    return_value = byte_array_object_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_converter__doc__,
"unicode_converter($module, a, /)\n"
"--\n"
"\n");

#define UNICODE_CONVERTER_METHODDEF    \
    {"unicode_converter", (PyCFunction)unicode_converter, METH_O, unicode_converter__doc__},

static TyObject *
unicode_converter_impl(TyObject *module, TyObject *a);

static TyObject *
unicode_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *a;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("unicode_converter", "argument", "str", arg);
        goto exit;
    }
    a = arg;
    return_value = unicode_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(bool_converter__doc__,
"bool_converter($module, a=True, b=True, c=True, /)\n"
"--\n"
"\n");

#define BOOL_CONVERTER_METHODDEF    \
    {"bool_converter", _PyCFunction_CAST(bool_converter), METH_FASTCALL, bool_converter__doc__},

static TyObject *
bool_converter_impl(TyObject *module, int a, int b, int c);

static TyObject *
bool_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int a = 1;
    int b = 1;
    int c = 1;

    if (!_TyArg_CheckPositional("bool_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    a = PyObject_IsTrue(args[0]);
    if (a < 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    b = PyObject_IsTrue(args[1]);
    if (b < 0) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    c = TyLong_AsInt(args[2]);
    if (c == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = bool_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(bool_converter_c_default__doc__,
"bool_converter_c_default($module, a=True, b=False, c=True, d=x, /)\n"
"--\n"
"\n");

#define BOOL_CONVERTER_C_DEFAULT_METHODDEF    \
    {"bool_converter_c_default", _PyCFunction_CAST(bool_converter_c_default), METH_FASTCALL, bool_converter_c_default__doc__},

static TyObject *
bool_converter_c_default_impl(TyObject *module, int a, int b, int c, int d);

static TyObject *
bool_converter_c_default(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int a = 1;
    int b = 0;
    int c = -2;
    int d = -3;

    if (!_TyArg_CheckPositional("bool_converter_c_default", nargs, 0, 4)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    a = PyObject_IsTrue(args[0]);
    if (a < 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    b = PyObject_IsTrue(args[1]);
    if (b < 0) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    c = PyObject_IsTrue(args[2]);
    if (c < 0) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    d = PyObject_IsTrue(args[3]);
    if (d < 0) {
        goto exit;
    }
skip_optional:
    return_value = bool_converter_c_default_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(char_converter__doc__,
"char_converter($module, a=b\'A\', b=b\'\\x07\', c=b\'\\x08\', d=b\'\\t\', e=b\'\\n\',\n"
"               f=b\'\\x0b\', g=b\'\\x0c\', h=b\'\\r\', i=b\'\"\', j=b\"\'\", k=b\'?\',\n"
"               l=b\'\\\\\', m=b\'\\x00\', n=b\'\\xff\', /)\n"
"--\n"
"\n");

#define CHAR_CONVERTER_METHODDEF    \
    {"char_converter", _PyCFunction_CAST(char_converter), METH_FASTCALL, char_converter__doc__},

static TyObject *
char_converter_impl(TyObject *module, char a, char b, char c, char d, char e,
                    char f, char g, char h, char i, char j, char k, char l,
                    char m, char n);

static TyObject *
char_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    char a = 'A';
    char b = '\x07';
    char c = '\x08';
    char d = '\t';
    char e = '\n';
    char f = '\x0b';
    char g = '\x0c';
    char h = '\r';
    char i = '"';
    char j = '\'';
    char k = '?';
    char l = '\\';
    char m = '\x00';
    char n = '\xff';

    if (!_TyArg_CheckPositional("char_converter", nargs, 0, 14)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[0])) {
        if (TyBytes_GET_SIZE(args[0]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 1 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[0]));
            goto exit;
        }
        a = TyBytes_AS_STRING(args[0])[0];
    }
    else if (TyByteArray_Check(args[0])) {
        if (TyByteArray_GET_SIZE(args[0]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 1 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[0]));
            goto exit;
        }
        a = TyByteArray_AS_STRING(args[0])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 1", "a byte string of length 1", args[0]);
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[1])) {
        if (TyBytes_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 2 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[1]));
            goto exit;
        }
        b = TyBytes_AS_STRING(args[1])[0];
    }
    else if (TyByteArray_Check(args[1])) {
        if (TyByteArray_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 2 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[1]));
            goto exit;
        }
        b = TyByteArray_AS_STRING(args[1])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 2", "a byte string of length 1", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[2])) {
        if (TyBytes_GET_SIZE(args[2]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 3 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[2]));
            goto exit;
        }
        c = TyBytes_AS_STRING(args[2])[0];
    }
    else if (TyByteArray_Check(args[2])) {
        if (TyByteArray_GET_SIZE(args[2]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 3 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[2]));
            goto exit;
        }
        c = TyByteArray_AS_STRING(args[2])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 3", "a byte string of length 1", args[2]);
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[3])) {
        if (TyBytes_GET_SIZE(args[3]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 4 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[3]));
            goto exit;
        }
        d = TyBytes_AS_STRING(args[3])[0];
    }
    else if (TyByteArray_Check(args[3])) {
        if (TyByteArray_GET_SIZE(args[3]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 4 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[3]));
            goto exit;
        }
        d = TyByteArray_AS_STRING(args[3])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 4", "a byte string of length 1", args[3]);
        goto exit;
    }
    if (nargs < 5) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[4])) {
        if (TyBytes_GET_SIZE(args[4]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 5 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[4]));
            goto exit;
        }
        e = TyBytes_AS_STRING(args[4])[0];
    }
    else if (TyByteArray_Check(args[4])) {
        if (TyByteArray_GET_SIZE(args[4]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 5 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[4]));
            goto exit;
        }
        e = TyByteArray_AS_STRING(args[4])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 5", "a byte string of length 1", args[4]);
        goto exit;
    }
    if (nargs < 6) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[5])) {
        if (TyBytes_GET_SIZE(args[5]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 6 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[5]));
            goto exit;
        }
        f = TyBytes_AS_STRING(args[5])[0];
    }
    else if (TyByteArray_Check(args[5])) {
        if (TyByteArray_GET_SIZE(args[5]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 6 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[5]));
            goto exit;
        }
        f = TyByteArray_AS_STRING(args[5])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 6", "a byte string of length 1", args[5]);
        goto exit;
    }
    if (nargs < 7) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[6])) {
        if (TyBytes_GET_SIZE(args[6]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 7 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[6]));
            goto exit;
        }
        g = TyBytes_AS_STRING(args[6])[0];
    }
    else if (TyByteArray_Check(args[6])) {
        if (TyByteArray_GET_SIZE(args[6]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 7 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[6]));
            goto exit;
        }
        g = TyByteArray_AS_STRING(args[6])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 7", "a byte string of length 1", args[6]);
        goto exit;
    }
    if (nargs < 8) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[7])) {
        if (TyBytes_GET_SIZE(args[7]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 8 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[7]));
            goto exit;
        }
        h = TyBytes_AS_STRING(args[7])[0];
    }
    else if (TyByteArray_Check(args[7])) {
        if (TyByteArray_GET_SIZE(args[7]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 8 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[7]));
            goto exit;
        }
        h = TyByteArray_AS_STRING(args[7])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 8", "a byte string of length 1", args[7]);
        goto exit;
    }
    if (nargs < 9) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[8])) {
        if (TyBytes_GET_SIZE(args[8]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 9 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[8]));
            goto exit;
        }
        i = TyBytes_AS_STRING(args[8])[0];
    }
    else if (TyByteArray_Check(args[8])) {
        if (TyByteArray_GET_SIZE(args[8]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 9 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[8]));
            goto exit;
        }
        i = TyByteArray_AS_STRING(args[8])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 9", "a byte string of length 1", args[8]);
        goto exit;
    }
    if (nargs < 10) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[9])) {
        if (TyBytes_GET_SIZE(args[9]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 10 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[9]));
            goto exit;
        }
        j = TyBytes_AS_STRING(args[9])[0];
    }
    else if (TyByteArray_Check(args[9])) {
        if (TyByteArray_GET_SIZE(args[9]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 10 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[9]));
            goto exit;
        }
        j = TyByteArray_AS_STRING(args[9])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 10", "a byte string of length 1", args[9]);
        goto exit;
    }
    if (nargs < 11) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[10])) {
        if (TyBytes_GET_SIZE(args[10]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 11 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[10]));
            goto exit;
        }
        k = TyBytes_AS_STRING(args[10])[0];
    }
    else if (TyByteArray_Check(args[10])) {
        if (TyByteArray_GET_SIZE(args[10]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 11 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[10]));
            goto exit;
        }
        k = TyByteArray_AS_STRING(args[10])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 11", "a byte string of length 1", args[10]);
        goto exit;
    }
    if (nargs < 12) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[11])) {
        if (TyBytes_GET_SIZE(args[11]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 12 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[11]));
            goto exit;
        }
        l = TyBytes_AS_STRING(args[11])[0];
    }
    else if (TyByteArray_Check(args[11])) {
        if (TyByteArray_GET_SIZE(args[11]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 12 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[11]));
            goto exit;
        }
        l = TyByteArray_AS_STRING(args[11])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 12", "a byte string of length 1", args[11]);
        goto exit;
    }
    if (nargs < 13) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[12])) {
        if (TyBytes_GET_SIZE(args[12]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 13 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[12]));
            goto exit;
        }
        m = TyBytes_AS_STRING(args[12])[0];
    }
    else if (TyByteArray_Check(args[12])) {
        if (TyByteArray_GET_SIZE(args[12]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 13 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[12]));
            goto exit;
        }
        m = TyByteArray_AS_STRING(args[12])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 13", "a byte string of length 1", args[12]);
        goto exit;
    }
    if (nargs < 14) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[13])) {
        if (TyBytes_GET_SIZE(args[13]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 14 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[13]));
            goto exit;
        }
        n = TyBytes_AS_STRING(args[13])[0];
    }
    else if (TyByteArray_Check(args[13])) {
        if (TyByteArray_GET_SIZE(args[13]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "char_converter(): argument 14 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[13]));
            goto exit;
        }
        n = TyByteArray_AS_STRING(args[13])[0];
    }
    else {
        _TyArg_BadArgument("char_converter", "argument 14", "a byte string of length 1", args[13]);
        goto exit;
    }
skip_optional:
    return_value = char_converter_impl(module, a, b, c, d, e, f, g, h, i, j, k, l, m, n);

exit:
    return return_value;
}

TyDoc_STRVAR(unsigned_char_converter__doc__,
"unsigned_char_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define UNSIGNED_CHAR_CONVERTER_METHODDEF    \
    {"unsigned_char_converter", _PyCFunction_CAST(unsigned_char_converter), METH_FASTCALL, unsigned_char_converter__doc__},

static TyObject *
unsigned_char_converter_impl(TyObject *module, unsigned char a,
                             unsigned char b, unsigned char c);

static TyObject *
unsigned_char_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned char a = 12;
    unsigned char b = 34;
    unsigned char c = 56;

    if (!_TyArg_CheckPositional("unsigned_char_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    {
        long ival = TyLong_AsLong(args[0]);
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        else if (ival < 0) {
            TyErr_SetString(TyExc_OverflowError,
                            "unsigned byte integer is less than minimum");
            goto exit;
        }
        else if (ival > UCHAR_MAX) {
            TyErr_SetString(TyExc_OverflowError,
                            "unsigned byte integer is greater than maximum");
            goto exit;
        }
        else {
            a = (unsigned char) ival;
        }
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    {
        long ival = TyLong_AsLong(args[1]);
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        else if (ival < 0) {
            TyErr_SetString(TyExc_OverflowError,
                            "unsigned byte integer is less than minimum");
            goto exit;
        }
        else if (ival > UCHAR_MAX) {
            TyErr_SetString(TyExc_OverflowError,
                            "unsigned byte integer is greater than maximum");
            goto exit;
        }
        else {
            b = (unsigned char) ival;
        }
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    {
        unsigned long ival = TyLong_AsUnsignedLongMask(args[2]);
        if (ival == (unsigned long)-1 && TyErr_Occurred()) {
            goto exit;
        }
        else {
            c = (unsigned char) ival;
        }
    }
skip_optional:
    return_value = unsigned_char_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(short_converter__doc__,
"short_converter($module, a=12, /)\n"
"--\n"
"\n");

#define SHORT_CONVERTER_METHODDEF    \
    {"short_converter", _PyCFunction_CAST(short_converter), METH_FASTCALL, short_converter__doc__},

static TyObject *
short_converter_impl(TyObject *module, short a);

static TyObject *
short_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    short a = 12;

    if (!_TyArg_CheckPositional("short_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    {
        long ival = TyLong_AsLong(args[0]);
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        else if (ival < SHRT_MIN) {
            TyErr_SetString(TyExc_OverflowError,
                            "signed short integer is less than minimum");
            goto exit;
        }
        else if (ival > SHRT_MAX) {
            TyErr_SetString(TyExc_OverflowError,
                            "signed short integer is greater than maximum");
            goto exit;
        }
        else {
            a = (short) ival;
        }
    }
skip_optional:
    return_value = short_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(unsigned_short_converter__doc__,
"unsigned_short_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define UNSIGNED_SHORT_CONVERTER_METHODDEF    \
    {"unsigned_short_converter", _PyCFunction_CAST(unsigned_short_converter), METH_FASTCALL, unsigned_short_converter__doc__},

static TyObject *
unsigned_short_converter_impl(TyObject *module, unsigned short a,
                              unsigned short b, unsigned short c);

static TyObject *
unsigned_short_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned short a = 12;
    unsigned short b = 34;
    unsigned short c = 56;

    if (!_TyArg_CheckPositional("unsigned_short_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedShort_Converter(args[0], &a)) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedShort_Converter(args[1], &b)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    c = (unsigned short)TyLong_AsUnsignedLongMask(args[2]);
    if (c == (unsigned short)-1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = unsigned_short_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(int_converter__doc__,
"int_converter($module, a=12, b=34, c=45, /)\n"
"--\n"
"\n");

#define INT_CONVERTER_METHODDEF    \
    {"int_converter", _PyCFunction_CAST(int_converter), METH_FASTCALL, int_converter__doc__},

static TyObject *
int_converter_impl(TyObject *module, int a, int b, int c);

static TyObject *
int_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int a = 12;
    int b = 34;
    int c = 45;

    if (!_TyArg_CheckPositional("int_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    a = TyLong_AsInt(args[0]);
    if (a == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    b = TyLong_AsInt(args[1]);
    if (b == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("int_converter", "argument 3", "a unicode character", args[2]);
        goto exit;
    }
    if (TyUnicode_GET_LENGTH(args[2]) != 1) {
        TyErr_Format(TyExc_TypeError,
            "int_converter(): argument 3 must be a unicode character, "
            "not a string of length %zd",
            TyUnicode_GET_LENGTH(args[2]));
        goto exit;
    }
    c = TyUnicode_READ_CHAR(args[2], 0);
skip_optional:
    return_value = int_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(unsigned_int_converter__doc__,
"unsigned_int_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define UNSIGNED_INT_CONVERTER_METHODDEF    \
    {"unsigned_int_converter", _PyCFunction_CAST(unsigned_int_converter), METH_FASTCALL, unsigned_int_converter__doc__},

static TyObject *
unsigned_int_converter_impl(TyObject *module, unsigned int a, unsigned int b,
                            unsigned int c);

static TyObject *
unsigned_int_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned int a = 12;
    unsigned int b = 34;
    unsigned int c = 56;

    if (!_TyArg_CheckPositional("unsigned_int_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedInt_Converter(args[0], &a)) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedInt_Converter(args[1], &b)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    c = (unsigned int)TyLong_AsUnsignedLongMask(args[2]);
    if (c == (unsigned int)-1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = unsigned_int_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(long_converter__doc__,
"long_converter($module, a=12, /)\n"
"--\n"
"\n");

#define LONG_CONVERTER_METHODDEF    \
    {"long_converter", _PyCFunction_CAST(long_converter), METH_FASTCALL, long_converter__doc__},

static TyObject *
long_converter_impl(TyObject *module, long a);

static TyObject *
long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    long a = 12;

    if (!_TyArg_CheckPositional("long_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    a = TyLong_AsLong(args[0]);
    if (a == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = long_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(unsigned_long_converter__doc__,
"unsigned_long_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define UNSIGNED_LONG_CONVERTER_METHODDEF    \
    {"unsigned_long_converter", _PyCFunction_CAST(unsigned_long_converter), METH_FASTCALL, unsigned_long_converter__doc__},

static TyObject *
unsigned_long_converter_impl(TyObject *module, unsigned long a,
                             unsigned long b, unsigned long c);

static TyObject *
unsigned_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned long a = 12;
    unsigned long b = 34;
    unsigned long c = 56;

    if (!_TyArg_CheckPositional("unsigned_long_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLong_Converter(args[0], &a)) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &b)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!PyIndex_Check(args[2])) {
        _TyArg_BadArgument("unsigned_long_converter", "argument 3", "int", args[2]);
        goto exit;
    }
    c = TyLong_AsUnsignedLongMask(args[2]);
skip_optional:
    return_value = unsigned_long_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(long_long_converter__doc__,
"long_long_converter($module, a=12, /)\n"
"--\n"
"\n");

#define LONG_LONG_CONVERTER_METHODDEF    \
    {"long_long_converter", _PyCFunction_CAST(long_long_converter), METH_FASTCALL, long_long_converter__doc__},

static TyObject *
long_long_converter_impl(TyObject *module, long long a);

static TyObject *
long_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    long long a = 12;

    if (!_TyArg_CheckPositional("long_long_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    a = TyLong_AsLongLong(args[0]);
    if (a == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = long_long_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(unsigned_long_long_converter__doc__,
"unsigned_long_long_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define UNSIGNED_LONG_LONG_CONVERTER_METHODDEF    \
    {"unsigned_long_long_converter", _PyCFunction_CAST(unsigned_long_long_converter), METH_FASTCALL, unsigned_long_long_converter__doc__},

static TyObject *
unsigned_long_long_converter_impl(TyObject *module, unsigned long long a,
                                  unsigned long long b, unsigned long long c);

static TyObject *
unsigned_long_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned long long a = 12;
    unsigned long long b = 34;
    unsigned long long c = 56;

    if (!_TyArg_CheckPositional("unsigned_long_long_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLongLong_Converter(args[0], &a)) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLongLong_Converter(args[1], &b)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!PyIndex_Check(args[2])) {
        _TyArg_BadArgument("unsigned_long_long_converter", "argument 3", "int", args[2]);
        goto exit;
    }
    c = TyLong_AsUnsignedLongLongMask(args[2]);
skip_optional:
    return_value = unsigned_long_long_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(py_ssize_t_converter__doc__,
"py_ssize_t_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define PY_SSIZE_T_CONVERTER_METHODDEF    \
    {"py_ssize_t_converter", _PyCFunction_CAST(py_ssize_t_converter), METH_FASTCALL, py_ssize_t_converter__doc__},

static TyObject *
py_ssize_t_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                          Ty_ssize_t c);

static TyObject *
py_ssize_t_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t a = 12;
    Ty_ssize_t b = 34;
    Ty_ssize_t c = 56;

    if (!_TyArg_CheckPositional("py_ssize_t_converter", nargs, 0, 3)) {
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
        a = ival;
    }
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
        b = ival;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[2], &c)) {
        goto exit;
    }
skip_optional:
    return_value = py_ssize_t_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(slice_index_converter__doc__,
"slice_index_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define SLICE_INDEX_CONVERTER_METHODDEF    \
    {"slice_index_converter", _PyCFunction_CAST(slice_index_converter), METH_FASTCALL, slice_index_converter__doc__},

static TyObject *
slice_index_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                           Ty_ssize_t c);

static TyObject *
slice_index_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t a = 12;
    Ty_ssize_t b = 34;
    Ty_ssize_t c = 56;

    if (!_TyArg_CheckPositional("slice_index_converter", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[0], &a)) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndexNotNone(args[1], &b)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &c)) {
        goto exit;
    }
skip_optional:
    return_value = slice_index_converter_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(size_t_converter__doc__,
"size_t_converter($module, a=12, /)\n"
"--\n"
"\n");

#define SIZE_T_CONVERTER_METHODDEF    \
    {"size_t_converter", _PyCFunction_CAST(size_t_converter), METH_FASTCALL, size_t_converter__doc__},

static TyObject *
size_t_converter_impl(TyObject *module, size_t a);

static TyObject *
size_t_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    size_t a = 12;

    if (!_TyArg_CheckPositional("size_t_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_Size_t_Converter(args[0], &a)) {
        goto exit;
    }
skip_optional:
    return_value = size_t_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(float_converter__doc__,
"float_converter($module, a=12.5, /)\n"
"--\n"
"\n");

#define FLOAT_CONVERTER_METHODDEF    \
    {"float_converter", _PyCFunction_CAST(float_converter), METH_FASTCALL, float_converter__doc__},

static TyObject *
float_converter_impl(TyObject *module, float a);

static TyObject *
float_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    float a = 12.5;

    if (!_TyArg_CheckPositional("float_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (TyFloat_CheckExact(args[0])) {
        a = (float) (TyFloat_AS_DOUBLE(args[0]));
    }
    else
    {
        a = (float) TyFloat_AsDouble(args[0]);
        if (a == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
skip_optional:
    return_value = float_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(double_converter__doc__,
"double_converter($module, a=12.5, /)\n"
"--\n"
"\n");

#define DOUBLE_CONVERTER_METHODDEF    \
    {"double_converter", _PyCFunction_CAST(double_converter), METH_FASTCALL, double_converter__doc__},

static TyObject *
double_converter_impl(TyObject *module, double a);

static TyObject *
double_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    double a = 12.5;

    if (!_TyArg_CheckPositional("double_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (TyFloat_CheckExact(args[0])) {
        a = TyFloat_AS_DOUBLE(args[0]);
    }
    else
    {
        a = TyFloat_AsDouble(args[0]);
        if (a == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
skip_optional:
    return_value = double_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(py_complex_converter__doc__,
"py_complex_converter($module, a, /)\n"
"--\n"
"\n");

#define PY_COMPLEX_CONVERTER_METHODDEF    \
    {"py_complex_converter", (PyCFunction)py_complex_converter, METH_O, py_complex_converter__doc__},

static TyObject *
py_complex_converter_impl(TyObject *module, Ty_complex a);

static TyObject *
py_complex_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex a;

    a = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = py_complex_converter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(str_converter__doc__,
"str_converter($module, a=\'a\', b=\'b\', c=\'c\', /)\n"
"--\n"
"\n");

#define STR_CONVERTER_METHODDEF    \
    {"str_converter", _PyCFunction_CAST(str_converter), METH_FASTCALL, str_converter__doc__},

static TyObject *
str_converter_impl(TyObject *module, const char *a, const char *b,
                   const char *c, Ty_ssize_t c_length);

static TyObject *
str_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *a = "a";
    const char *b = "b";
    const char *c = "c";
    Ty_ssize_t c_length;

    if (!_TyArg_ParseStack(args, nargs, "|sys#:str_converter",
        &a, &b, &c, &c_length)) {
        goto exit;
    }
    return_value = str_converter_impl(module, a, b, c, c_length);

exit:
    return return_value;
}

TyDoc_STRVAR(str_converter_encoding__doc__,
"str_converter_encoding($module, a, b, c, /)\n"
"--\n"
"\n");

#define STR_CONVERTER_ENCODING_METHODDEF    \
    {"str_converter_encoding", _PyCFunction_CAST(str_converter_encoding), METH_FASTCALL, str_converter_encoding__doc__},

static TyObject *
str_converter_encoding_impl(TyObject *module, char *a, char *b, char *c,
                            Ty_ssize_t c_length);

static TyObject *
str_converter_encoding(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    char *a = NULL;
    char *b = NULL;
    char *c = NULL;
    Ty_ssize_t c_length;

    if (!_TyArg_ParseStack(args, nargs, "esetet#:str_converter_encoding",
        "idna", &a, "idna", &b, "idna", &c, &c_length)) {
        goto exit;
    }
    return_value = str_converter_encoding_impl(module, a, b, c, c_length);
    /* Post parse cleanup for a */
    TyMem_FREE(a);
    /* Post parse cleanup for b */
    TyMem_FREE(b);
    /* Post parse cleanup for c */
    TyMem_FREE(c);

exit:
    return return_value;
}

TyDoc_STRVAR(py_buffer_converter__doc__,
"py_buffer_converter($module, a, b, /)\n"
"--\n"
"\n");

#define PY_BUFFER_CONVERTER_METHODDEF    \
    {"py_buffer_converter", _PyCFunction_CAST(py_buffer_converter), METH_FASTCALL, py_buffer_converter__doc__},

static TyObject *
py_buffer_converter_impl(TyObject *module, Ty_buffer *a, Ty_buffer *b);

static TyObject *
py_buffer_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer a = {NULL, NULL};
    Ty_buffer b = {NULL, NULL};

    if (!_TyArg_ParseStack(args, nargs, "z*w*:py_buffer_converter",
        &a, &b)) {
        goto exit;
    }
    return_value = py_buffer_converter_impl(module, &a, &b);

exit:
    /* Cleanup for a */
    if (a.obj) {
       PyBuffer_Release(&a);
    }
    /* Cleanup for b */
    if (b.obj) {
       PyBuffer_Release(&b);
    }

    return return_value;
}

TyDoc_STRVAR(keywords__doc__,
"keywords($module, /, a, b)\n"
"--\n"
"\n");

#define KEYWORDS_METHODDEF    \
    {"keywords", _PyCFunction_CAST(keywords), METH_FASTCALL|METH_KEYWORDS, keywords__doc__},

static TyObject *
keywords_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
keywords(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keywords",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = keywords_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(keywords_kwonly__doc__,
"keywords_kwonly($module, /, a, *, b)\n"
"--\n"
"\n");

#define KEYWORDS_KWONLY_METHODDEF    \
    {"keywords_kwonly", _PyCFunction_CAST(keywords_kwonly), METH_FASTCALL|METH_KEYWORDS, keywords_kwonly__doc__},

static TyObject *
keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
keywords_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keywords_kwonly",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = keywords_kwonly_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(keywords_opt__doc__,
"keywords_opt($module, /, a, b=None, c=None)\n"
"--\n"
"\n");

#define KEYWORDS_OPT_METHODDEF    \
    {"keywords_opt", _PyCFunction_CAST(keywords_opt), METH_FASTCALL|METH_KEYWORDS, keywords_opt__doc__},

static TyObject *
keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c);

static TyObject *
keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keywords_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        b = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    c = args[2];
skip_optional_pos:
    return_value = keywords_opt_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(keywords_opt_kwonly__doc__,
"keywords_opt_kwonly($module, /, a, b=None, *, c=None, d=None)\n"
"--\n"
"\n");

#define KEYWORDS_OPT_KWONLY_METHODDEF    \
    {"keywords_opt_kwonly", _PyCFunction_CAST(keywords_opt_kwonly), METH_FASTCALL|METH_KEYWORDS, keywords_opt_kwonly__doc__},

static TyObject *
keywords_opt_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c, TyObject *d);

static TyObject *
keywords_opt_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keywords_opt_kwonly",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        b = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    d = args[3];
skip_optional_kwonly:
    return_value = keywords_opt_kwonly_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(keywords_kwonly_opt__doc__,
"keywords_kwonly_opt($module, /, a, *, b=None, c=None)\n"
"--\n"
"\n");

#define KEYWORDS_KWONLY_OPT_METHODDEF    \
    {"keywords_kwonly_opt", _PyCFunction_CAST(keywords_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, keywords_kwonly_opt__doc__},

static TyObject *
keywords_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c);

static TyObject *
keywords_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keywords_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        b = args[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    c = args[2];
skip_optional_kwonly:
    return_value = keywords_kwonly_opt_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_keywords__doc__,
"posonly_keywords($module, a, /, b)\n"
"--\n"
"\n");

#define POSONLY_KEYWORDS_METHODDEF    \
    {"posonly_keywords", _PyCFunction_CAST(posonly_keywords), METH_FASTCALL|METH_KEYWORDS, posonly_keywords__doc__},

static TyObject *
posonly_keywords_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
posonly_keywords(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_keywords",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = posonly_keywords_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_kwonly__doc__,
"posonly_kwonly($module, a, /, *, b)\n"
"--\n"
"\n");

#define POSONLY_KWONLY_METHODDEF    \
    {"posonly_kwonly", _PyCFunction_CAST(posonly_kwonly), METH_FASTCALL|METH_KEYWORDS, posonly_kwonly__doc__},

static TyObject *
posonly_kwonly_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
posonly_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_kwonly",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = posonly_kwonly_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_keywords_kwonly__doc__,
"posonly_keywords_kwonly($module, a, /, b, *, c)\n"
"--\n"
"\n");

#define POSONLY_KEYWORDS_KWONLY_METHODDEF    \
    {"posonly_keywords_kwonly", _PyCFunction_CAST(posonly_keywords_kwonly), METH_FASTCALL|METH_KEYWORDS, posonly_keywords_kwonly__doc__},

static TyObject *
posonly_keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                             TyObject *c);

static TyObject *
posonly_keywords_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_keywords_kwonly",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject *a;
    TyObject *b;
    TyObject *c;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    return_value = posonly_keywords_kwonly_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_keywords_opt__doc__,
"posonly_keywords_opt($module, a, /, b, c=None, d=None)\n"
"--\n"
"\n");

#define POSONLY_KEYWORDS_OPT_METHODDEF    \
    {"posonly_keywords_opt", _PyCFunction_CAST(posonly_keywords_opt), METH_FASTCALL|METH_KEYWORDS, posonly_keywords_opt__doc__},

static TyObject *
posonly_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                          TyObject *c, TyObject *d);

static TyObject *
posonly_keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_keywords_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    d = args[3];
skip_optional_pos:
    return_value = posonly_keywords_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_opt_keywords_opt__doc__,
"posonly_opt_keywords_opt($module, a, b=None, /, c=None, d=None)\n"
"--\n"
"\n");

#define POSONLY_OPT_KEYWORDS_OPT_METHODDEF    \
    {"posonly_opt_keywords_opt", _PyCFunction_CAST(posonly_opt_keywords_opt), METH_FASTCALL|METH_KEYWORDS, posonly_opt_keywords_opt__doc__},

static TyObject *
posonly_opt_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c, TyObject *d);

static TyObject *
posonly_opt_keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_opt_keywords_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    noptargs--;
    b = args[1];
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    d = args[3];
skip_optional_pos:
    return_value = posonly_opt_keywords_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_kwonly_opt__doc__,
"posonly_kwonly_opt($module, a, /, *, b, c=None, d=None)\n"
"--\n"
"\n");

#define POSONLY_KWONLY_OPT_METHODDEF    \
    {"posonly_kwonly_opt", _PyCFunction_CAST(posonly_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, posonly_kwonly_opt__doc__},

static TyObject *
posonly_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                        TyObject *c, TyObject *d);

static TyObject *
posonly_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    d = args[3];
skip_optional_kwonly:
    return_value = posonly_kwonly_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_opt_kwonly_opt__doc__,
"posonly_opt_kwonly_opt($module, a, b=None, /, *, c=None, d=None)\n"
"--\n"
"\n");

#define POSONLY_OPT_KWONLY_OPT_METHODDEF    \
    {"posonly_opt_kwonly_opt", _PyCFunction_CAST(posonly_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, posonly_opt_kwonly_opt__doc__},

static TyObject *
posonly_opt_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                            TyObject *c, TyObject *d);

static TyObject *
posonly_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_opt_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    noptargs--;
    b = args[1];
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    d = args[3];
skip_optional_kwonly:
    return_value = posonly_opt_kwonly_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_keywords_kwonly_opt__doc__,
"posonly_keywords_kwonly_opt($module, a, /, b, *, c, d=None, e=None)\n"
"--\n"
"\n");

#define POSONLY_KEYWORDS_KWONLY_OPT_METHODDEF    \
    {"posonly_keywords_kwonly_opt", _PyCFunction_CAST(posonly_keywords_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, posonly_keywords_kwonly_opt__doc__},

static TyObject *
posonly_keywords_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                                 TyObject *c, TyObject *d, TyObject *e);

static TyObject *
posonly_keywords_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", "e", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_keywords_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d = Ty_None;
    TyObject *e = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        d = args[3];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    e = args[4];
skip_optional_kwonly:
    return_value = posonly_keywords_kwonly_opt_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_keywords_opt_kwonly_opt__doc__,
"posonly_keywords_opt_kwonly_opt($module, a, /, b, c=None, *, d=None,\n"
"                                e=None)\n"
"--\n"
"\n");

#define POSONLY_KEYWORDS_OPT_KWONLY_OPT_METHODDEF    \
    {"posonly_keywords_opt_kwonly_opt", _PyCFunction_CAST(posonly_keywords_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, posonly_keywords_opt_kwonly_opt__doc__},

static TyObject *
posonly_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                     TyObject *b, TyObject *c, TyObject *d,
                                     TyObject *e);

static TyObject *
posonly_keywords_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", "e", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_keywords_opt_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;
    TyObject *e = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        d = args[3];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    e = args[4];
skip_optional_kwonly:
    return_value = posonly_keywords_opt_kwonly_opt_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_opt_keywords_opt_kwonly_opt__doc__,
"posonly_opt_keywords_opt_kwonly_opt($module, a, b=None, /, c=None, *,\n"
"                                    d=None)\n"
"--\n"
"\n");

#define POSONLY_OPT_KEYWORDS_OPT_KWONLY_OPT_METHODDEF    \
    {"posonly_opt_keywords_opt_kwonly_opt", _PyCFunction_CAST(posonly_opt_keywords_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, posonly_opt_keywords_opt_kwonly_opt__doc__},

static TyObject *
posonly_opt_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                         TyObject *b, TyObject *c,
                                         TyObject *d);

static TyObject *
posonly_opt_keywords_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_opt_keywords_opt_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    noptargs--;
    b = args[1];
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        c = args[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    d = args[3];
skip_optional_kwonly:
    return_value = posonly_opt_keywords_opt_kwonly_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(keyword_only_parameter__doc__,
"keyword_only_parameter($module, /, *, a)\n"
"--\n"
"\n");

#define KEYWORD_ONLY_PARAMETER_METHODDEF    \
    {"keyword_only_parameter", _PyCFunction_CAST(keyword_only_parameter), METH_FASTCALL|METH_KEYWORDS, keyword_only_parameter__doc__},

static TyObject *
keyword_only_parameter_impl(TyObject *module, TyObject *a);

static TyObject *
keyword_only_parameter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "keyword_only_parameter",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *a;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    return_value = keyword_only_parameter_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(varpos__doc__,
"varpos($module, /, *args)\n"
"--\n"
"\n");

#define VARPOS_METHODDEF    \
    {"varpos", _PyCFunction_CAST(varpos), METH_FASTCALL, varpos__doc__},

static TyObject *
varpos_impl(TyObject *module, TyObject *args);

static TyObject *
varpos(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *__clinic_args = NULL;

    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = varpos_impl(module, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(posonly_varpos__doc__,
"posonly_varpos($module, a, b, /, *args)\n"
"--\n"
"\n");

#define POSONLY_VARPOS_METHODDEF    \
    {"posonly_varpos", _PyCFunction_CAST(posonly_varpos), METH_FASTCALL, posonly_varpos__doc__},

static TyObject *
posonly_varpos_impl(TyObject *module, TyObject *a, TyObject *b,
                    TyObject *args);

static TyObject *
posonly_varpos(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject *__clinic_args = NULL;

    if (!_TyArg_CheckPositional("posonly_varpos", nargs, 2, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    __clinic_args = _TyTuple_FromArray(args + 2, nargs - 2);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = posonly_varpos_impl(module, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(posonly_req_opt_varpos__doc__,
"posonly_req_opt_varpos($module, a, b=False, /, *args)\n"
"--\n"
"\n");

#define POSONLY_REQ_OPT_VARPOS_METHODDEF    \
    {"posonly_req_opt_varpos", _PyCFunction_CAST(posonly_req_opt_varpos), METH_FASTCALL, posonly_req_opt_varpos__doc__},

static TyObject *
posonly_req_opt_varpos_impl(TyObject *module, TyObject *a, TyObject *b,
                            TyObject *args);

static TyObject *
posonly_req_opt_varpos(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = Ty_False;
    TyObject *__clinic_args = NULL;

    if (!_TyArg_CheckPositional("posonly_req_opt_varpos", nargs, 1, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    b = args[1];
skip_optional:
    __clinic_args = nargs > 2
        ? _TyTuple_FromArray(args + 2, nargs - 2)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = posonly_req_opt_varpos_impl(module, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(posonly_poskw_varpos__doc__,
"posonly_poskw_varpos($module, a, /, b, *args)\n"
"--\n"
"\n");

#define POSONLY_POSKW_VARPOS_METHODDEF    \
    {"posonly_poskw_varpos", _PyCFunction_CAST(posonly_poskw_varpos), METH_FASTCALL|METH_KEYWORDS, posonly_poskw_varpos__doc__},

static TyObject *
posonly_poskw_varpos_impl(TyObject *module, TyObject *a, TyObject *b,
                          TyObject *args);

static TyObject *
posonly_poskw_varpos(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_poskw_varpos",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    TyObject *a;
    TyObject *b;
    TyObject *__clinic_args = NULL;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    b = fastargs[1];
    __clinic_args = nargs > 2
        ? _TyTuple_FromArray(args + 2, nargs - 2)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = posonly_poskw_varpos_impl(module, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(poskw_varpos__doc__,
"poskw_varpos($module, /, a, *args)\n"
"--\n"
"\n");

#define POSKW_VARPOS_METHODDEF    \
    {"poskw_varpos", _PyCFunction_CAST(poskw_varpos), METH_FASTCALL|METH_KEYWORDS, poskw_varpos__doc__},

static TyObject *
poskw_varpos_impl(TyObject *module, TyObject *a, TyObject *args);

static TyObject *
poskw_varpos(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "poskw_varpos",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    TyObject *a;
    TyObject *__clinic_args = NULL;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    __clinic_args = nargs > 1
        ? _TyTuple_FromArray(args + 1, nargs - 1)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = poskw_varpos_impl(module, a, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(poskw_varpos_kwonly_opt__doc__,
"poskw_varpos_kwonly_opt($module, /, a, *args, b=False)\n"
"--\n"
"\n");

#define POSKW_VARPOS_KWONLY_OPT_METHODDEF    \
    {"poskw_varpos_kwonly_opt", _PyCFunction_CAST(poskw_varpos_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, poskw_varpos_kwonly_opt__doc__},

static TyObject *
poskw_varpos_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *args,
                             int b);

static TyObject *
poskw_varpos_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "poskw_varpos_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = Ty_MIN(nargs, 1) + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *__clinic_args = NULL;
    int b = 0;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    b = PyObject_IsTrue(fastargs[1]);
    if (b < 0) {
        goto exit;
    }
skip_optional_kwonly:
    __clinic_args = nargs > 1
        ? _TyTuple_FromArray(args + 1, nargs - 1)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = poskw_varpos_kwonly_opt_impl(module, a, __clinic_args, b);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(poskw_varpos_kwonly_opt2__doc__,
"poskw_varpos_kwonly_opt2($module, /, a, *args, b=False, c=False)\n"
"--\n"
"\n");

#define POSKW_VARPOS_KWONLY_OPT2_METHODDEF    \
    {"poskw_varpos_kwonly_opt2", _PyCFunction_CAST(poskw_varpos_kwonly_opt2), METH_FASTCALL|METH_KEYWORDS, poskw_varpos_kwonly_opt2__doc__},

static TyObject *
poskw_varpos_kwonly_opt2_impl(TyObject *module, TyObject *a, TyObject *args,
                              TyObject *b, TyObject *c);

static TyObject *
poskw_varpos_kwonly_opt2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "poskw_varpos_kwonly_opt2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = Ty_MIN(nargs, 1) + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *__clinic_args = NULL;
    TyObject *b = Ty_False;
    TyObject *c = Ty_False;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        b = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    c = fastargs[2];
skip_optional_kwonly:
    __clinic_args = nargs > 1
        ? _TyTuple_FromArray(args + 1, nargs - 1)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = poskw_varpos_kwonly_opt2_impl(module, a, __clinic_args, b, c);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(varpos_kwonly_opt__doc__,
"varpos_kwonly_opt($module, /, *args, b=False)\n"
"--\n"
"\n");

#define VARPOS_KWONLY_OPT_METHODDEF    \
    {"varpos_kwonly_opt", _PyCFunction_CAST(varpos_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, varpos_kwonly_opt__doc__},

static TyObject *
varpos_kwonly_opt_impl(TyObject *module, TyObject *args, TyObject *b);

static TyObject *
varpos_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "varpos_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = 0 + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *__clinic_args = NULL;
    TyObject *b = Ty_False;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    b = fastargs[0];
skip_optional_kwonly:
    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = varpos_kwonly_opt_impl(module, __clinic_args, b);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(varpos_kwonly_req_opt__doc__,
"varpos_kwonly_req_opt($module, /, *args, a, b=False, c=False)\n"
"--\n"
"\n");

#define VARPOS_KWONLY_REQ_OPT_METHODDEF    \
    {"varpos_kwonly_req_opt", _PyCFunction_CAST(varpos_kwonly_req_opt), METH_FASTCALL|METH_KEYWORDS, varpos_kwonly_req_opt__doc__},

static TyObject *
varpos_kwonly_req_opt_impl(TyObject *module, TyObject *args, TyObject *a,
                           TyObject *b, TyObject *c);

static TyObject *
varpos_kwonly_req_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "varpos_kwonly_req_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = 0 + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *__clinic_args = NULL;
    TyObject *a;
    TyObject *b = Ty_False;
    TyObject *c = Ty_False;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 1, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        b = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    c = fastargs[2];
skip_optional_kwonly:
    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = varpos_kwonly_req_opt_impl(module, __clinic_args, a, b, c);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(varpos_array__doc__,
"varpos_array($module, /, *args)\n"
"--\n"
"\n");

#define VARPOS_ARRAY_METHODDEF    \
    {"varpos_array", _PyCFunction_CAST(varpos_array), METH_FASTCALL, varpos_array__doc__},

static TyObject *
varpos_array_impl(TyObject *module, TyObject * const *args,
                  Ty_ssize_t args_length);

static TyObject *
varpos_array(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    __clinic_args = args;
    args_length = nargs;
    return_value = varpos_array_impl(module, __clinic_args, args_length);

    return return_value;
}

TyDoc_STRVAR(posonly_varpos_array__doc__,
"posonly_varpos_array($module, a, b, /, *args)\n"
"--\n"
"\n");

#define POSONLY_VARPOS_ARRAY_METHODDEF    \
    {"posonly_varpos_array", _PyCFunction_CAST(posonly_varpos_array), METH_FASTCALL, posonly_varpos_array__doc__},

static TyObject *
posonly_varpos_array_impl(TyObject *module, TyObject *a, TyObject *b,
                          TyObject * const *args, Ty_ssize_t args_length);

static TyObject *
posonly_varpos_array(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    if (!_TyArg_CheckPositional("posonly_varpos_array", nargs, 2, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    __clinic_args = args + 2;
    args_length = nargs - 2;
    return_value = posonly_varpos_array_impl(module, a, b, __clinic_args, args_length);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_req_opt_varpos_array__doc__,
"posonly_req_opt_varpos_array($module, a, b=False, /, *args)\n"
"--\n"
"\n");

#define POSONLY_REQ_OPT_VARPOS_ARRAY_METHODDEF    \
    {"posonly_req_opt_varpos_array", _PyCFunction_CAST(posonly_req_opt_varpos_array), METH_FASTCALL, posonly_req_opt_varpos_array__doc__},

static TyObject *
posonly_req_opt_varpos_array_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject * const *args,
                                  Ty_ssize_t args_length);

static TyObject *
posonly_req_opt_varpos_array(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = Ty_False;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    if (!_TyArg_CheckPositional("posonly_req_opt_varpos_array", nargs, 1, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    b = args[1];
skip_optional:
    __clinic_args = nargs > 2 ? args + 2 : args;
    args_length = Ty_MAX(0, nargs - 2);
    return_value = posonly_req_opt_varpos_array_impl(module, a, b, __clinic_args, args_length);

exit:
    return return_value;
}

TyDoc_STRVAR(posonly_poskw_varpos_array__doc__,
"posonly_poskw_varpos_array($module, a, /, b, *args)\n"
"--\n"
"\n");

#define POSONLY_POSKW_VARPOS_ARRAY_METHODDEF    \
    {"posonly_poskw_varpos_array", _PyCFunction_CAST(posonly_poskw_varpos_array), METH_FASTCALL|METH_KEYWORDS, posonly_poskw_varpos_array__doc__},

static TyObject *
posonly_poskw_varpos_array_impl(TyObject *module, TyObject *a, TyObject *b,
                                TyObject * const *args,
                                Ty_ssize_t args_length);

static TyObject *
posonly_poskw_varpos_array(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_poskw_varpos_array",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    TyObject *a;
    TyObject *b;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    b = fastargs[1];
    __clinic_args = nargs > 2 ? args + 2 : args;
    args_length = Ty_MAX(0, nargs - 2);
    return_value = posonly_poskw_varpos_array_impl(module, a, b, __clinic_args, args_length);

exit:
    return return_value;
}

TyDoc_STRVAR(gh_32092_oob__doc__,
"gh_32092_oob($module, /, pos1, pos2, *varargs, kw1=None, kw2=None)\n"
"--\n"
"\n"
"Proof-of-concept of GH-32092 OOB bug.");

#define GH_32092_OOB_METHODDEF    \
    {"gh_32092_oob", _PyCFunction_CAST(gh_32092_oob), METH_FASTCALL|METH_KEYWORDS, gh_32092_oob__doc__},

static TyObject *
gh_32092_oob_impl(TyObject *module, TyObject *pos1, TyObject *pos2,
                  TyObject *varargs, TyObject *kw1, TyObject *kw2);

static TyObject *
gh_32092_oob(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(pos1), &_Ty_ID(pos2), &_Ty_ID(kw1), &_Ty_ID(kw2), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pos1", "pos2", "kw1", "kw2", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "gh_32092_oob",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = Ty_MIN(nargs, 2) + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *pos1;
    TyObject *pos2;
    TyObject *varargs = NULL;
    TyObject *kw1 = Ty_None;
    TyObject *kw2 = Ty_None;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    pos1 = fastargs[0];
    pos2 = fastargs[1];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[2]) {
        kw1 = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    kw2 = fastargs[3];
skip_optional_kwonly:
    varargs = nargs > 2
        ? _TyTuple_FromArray(args + 2, nargs - 2)
        : TyTuple_New(0);
    if (varargs == NULL) {
        goto exit;
    }
    return_value = gh_32092_oob_impl(module, pos1, pos2, varargs, kw1, kw2);

exit:
    /* Cleanup for varargs */
    Ty_XDECREF(varargs);

    return return_value;
}

TyDoc_STRVAR(gh_32092_kw_pass__doc__,
"gh_32092_kw_pass($module, /, pos, *args, kw=None)\n"
"--\n"
"\n"
"Proof-of-concept of GH-32092 keyword args passing bug.");

#define GH_32092_KW_PASS_METHODDEF    \
    {"gh_32092_kw_pass", _PyCFunction_CAST(gh_32092_kw_pass), METH_FASTCALL|METH_KEYWORDS, gh_32092_kw_pass__doc__},

static TyObject *
gh_32092_kw_pass_impl(TyObject *module, TyObject *pos, TyObject *args,
                      TyObject *kw);

static TyObject *
gh_32092_kw_pass(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(pos), &_Ty_ID(kw), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pos", "kw", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "gh_32092_kw_pass",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = Ty_MIN(nargs, 1) + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *pos;
    TyObject *__clinic_args = NULL;
    TyObject *kw = Ty_None;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    pos = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    kw = fastargs[1];
skip_optional_kwonly:
    __clinic_args = nargs > 1
        ? _TyTuple_FromArray(args + 1, nargs - 1)
        : TyTuple_New(0);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = gh_32092_kw_pass_impl(module, pos, __clinic_args, kw);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(gh_99233_refcount__doc__,
"gh_99233_refcount($module, /, *args)\n"
"--\n"
"\n"
"Proof-of-concept of GH-99233 refcount error bug.");

#define GH_99233_REFCOUNT_METHODDEF    \
    {"gh_99233_refcount", _PyCFunction_CAST(gh_99233_refcount), METH_FASTCALL, gh_99233_refcount__doc__},

static TyObject *
gh_99233_refcount_impl(TyObject *module, TyObject *args);

static TyObject *
gh_99233_refcount(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *__clinic_args = NULL;

    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = gh_99233_refcount_impl(module, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(gh_99240_double_free__doc__,
"gh_99240_double_free($module, a, b, /)\n"
"--\n"
"\n"
"Proof-of-concept of GH-99240 double-free bug.");

#define GH_99240_DOUBLE_FREE_METHODDEF    \
    {"gh_99240_double_free", _PyCFunction_CAST(gh_99240_double_free), METH_FASTCALL, gh_99240_double_free__doc__},

static TyObject *
gh_99240_double_free_impl(TyObject *module, char *a, char *b);

static TyObject *
gh_99240_double_free(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    char *a = NULL;
    char *b = NULL;

    if (!_TyArg_ParseStack(args, nargs, "eses:gh_99240_double_free",
        "idna", &a, "idna", &b)) {
        goto exit;
    }
    return_value = gh_99240_double_free_impl(module, a, b);
    /* Post parse cleanup for a */
    TyMem_FREE(a);
    /* Post parse cleanup for b */
    TyMem_FREE(b);

exit:
    return return_value;
}

TyDoc_STRVAR(null_or_tuple_for_varargs__doc__,
"null_or_tuple_for_varargs($module, /, name, *constraints,\n"
"                          covariant=False)\n"
"--\n"
"\n"
"See https://github.com/python/cpython/issues/110864");

#define NULL_OR_TUPLE_FOR_VARARGS_METHODDEF    \
    {"null_or_tuple_for_varargs", _PyCFunction_CAST(null_or_tuple_for_varargs), METH_FASTCALL|METH_KEYWORDS, null_or_tuple_for_varargs__doc__},

static TyObject *
null_or_tuple_for_varargs_impl(TyObject *module, TyObject *name,
                               TyObject *constraints, int covariant);

static TyObject *
null_or_tuple_for_varargs(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), &_Ty_ID(covariant), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "covariant", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "null_or_tuple_for_varargs",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = Ty_MIN(nargs, 1) + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *name;
    TyObject *constraints = NULL;
    int covariant = 0;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    name = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    covariant = PyObject_IsTrue(fastargs[1]);
    if (covariant < 0) {
        goto exit;
    }
skip_optional_kwonly:
    constraints = nargs > 1
        ? _TyTuple_FromArray(args + 1, nargs - 1)
        : TyTuple_New(0);
    if (constraints == NULL) {
        goto exit;
    }
    return_value = null_or_tuple_for_varargs_impl(module, name, constraints, covariant);

exit:
    /* Cleanup for constraints */
    Ty_XDECREF(constraints);

    return return_value;
}

TyDoc_STRVAR(clone_f1__doc__,
"clone_f1($module, /, path)\n"
"--\n"
"\n");

#define CLONE_F1_METHODDEF    \
    {"clone_f1", _PyCFunction_CAST(clone_f1), METH_FASTCALL|METH_KEYWORDS, clone_f1__doc__},

static TyObject *
clone_f1_impl(TyObject *module, const char *path);

static TyObject *
clone_f1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "clone_f1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    const char *path;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("clone_f1", "argument 'path'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t path_length;
    path = TyUnicode_AsUTF8AndSize(args[0], &path_length);
    if (path == NULL) {
        goto exit;
    }
    if (strlen(path) != (size_t)path_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = clone_f1_impl(module, path);

exit:
    return return_value;
}

TyDoc_STRVAR(clone_f2__doc__,
"clone_f2($module, /, path)\n"
"--\n"
"\n");

#define CLONE_F2_METHODDEF    \
    {"clone_f2", _PyCFunction_CAST(clone_f2), METH_FASTCALL|METH_KEYWORDS, clone_f2__doc__},

static TyObject *
clone_f2_impl(TyObject *module, const char *path);

static TyObject *
clone_f2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "clone_f2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    const char *path;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("clone_f2", "argument 'path'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t path_length;
    path = TyUnicode_AsUTF8AndSize(args[0], &path_length);
    if (path == NULL) {
        goto exit;
    }
    if (strlen(path) != (size_t)path_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = clone_f2_impl(module, path);

exit:
    return return_value;
}

TyDoc_STRVAR(clone_with_conv_f1__doc__,
"clone_with_conv_f1($module, /, path=None)\n"
"--\n"
"\n");

#define CLONE_WITH_CONV_F1_METHODDEF    \
    {"clone_with_conv_f1", _PyCFunction_CAST(clone_with_conv_f1), METH_FASTCALL|METH_KEYWORDS, clone_with_conv_f1__doc__},

static TyObject *
clone_with_conv_f1_impl(TyObject *module, custom_t path);

static TyObject *
clone_with_conv_f1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "clone_with_conv_f1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    custom_t path = {
                .name = "clone_with_conv_f1",
            };

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (!custom_converter(args[0], &path)) {
        goto exit;
    }
skip_optional_pos:
    return_value = clone_with_conv_f1_impl(module, path);

exit:
    return return_value;
}

TyDoc_STRVAR(clone_with_conv_f2__doc__,
"clone_with_conv_f2($module, /, path=None)\n"
"--\n"
"\n");

#define CLONE_WITH_CONV_F2_METHODDEF    \
    {"clone_with_conv_f2", _PyCFunction_CAST(clone_with_conv_f2), METH_FASTCALL|METH_KEYWORDS, clone_with_conv_f2__doc__},

static TyObject *
clone_with_conv_f2_impl(TyObject *module, custom_t path);

static TyObject *
clone_with_conv_f2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "clone_with_conv_f2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    custom_t path = {
                .name = "clone_with_conv_f2",
            };

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (!custom_converter(args[0], &path)) {
        goto exit;
    }
skip_optional_pos:
    return_value = clone_with_conv_f2_impl(module, path);

exit:
    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_get_defining_class__doc__,
"get_defining_class($self, /)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_GET_DEFINING_CLASS_METHODDEF    \
    {"get_defining_class", _PyCFunction_CAST(_testclinic_TestClass_get_defining_class), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testclinic_TestClass_get_defining_class__doc__},

static TyObject *
_testclinic_TestClass_get_defining_class_impl(TyObject *self,
                                              TyTypeObject *cls);

static TyObject *
_testclinic_TestClass_get_defining_class(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "get_defining_class() takes no arguments");
        return NULL;
    }
    return _testclinic_TestClass_get_defining_class_impl(self, cls);
}

TyDoc_STRVAR(_testclinic_TestClass_get_defining_class_arg__doc__,
"get_defining_class_arg($self, /, arg)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_GET_DEFINING_CLASS_ARG_METHODDEF    \
    {"get_defining_class_arg", _PyCFunction_CAST(_testclinic_TestClass_get_defining_class_arg), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testclinic_TestClass_get_defining_class_arg__doc__},

static TyObject *
_testclinic_TestClass_get_defining_class_arg_impl(TyObject *self,
                                                  TyTypeObject *cls,
                                                  TyObject *arg);

static TyObject *
_testclinic_TestClass_get_defining_class_arg(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(arg), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"arg", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "get_defining_class_arg",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *arg;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    arg = args[0];
    return_value = _testclinic_TestClass_get_defining_class_arg_impl(self, cls, arg);

exit:
    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_defclass_varpos__doc__,
"defclass_varpos($self, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_DEFCLASS_VARPOS_METHODDEF    \
    {"defclass_varpos", _PyCFunction_CAST(_testclinic_TestClass_defclass_varpos), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testclinic_TestClass_defclass_varpos__doc__},

static TyObject *
_testclinic_TestClass_defclass_varpos_impl(TyObject *self, TyTypeObject *cls,
                                           TyObject *args);

static TyObject *
_testclinic_TestClass_defclass_varpos(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = { NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "defclass_varpos",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    TyObject *__clinic_args = NULL;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = _testclinic_TestClass_defclass_varpos_impl(self, cls, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_defclass_posonly_varpos__doc__,
"defclass_posonly_varpos($self, a, b, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_DEFCLASS_POSONLY_VARPOS_METHODDEF    \
    {"defclass_posonly_varpos", _PyCFunction_CAST(_testclinic_TestClass_defclass_posonly_varpos), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testclinic_TestClass_defclass_posonly_varpos__doc__},

static TyObject *
_testclinic_TestClass_defclass_posonly_varpos_impl(TyObject *self,
                                                   TyTypeObject *cls,
                                                   TyObject *a, TyObject *b,
                                                   TyObject *args);

static TyObject *
_testclinic_TestClass_defclass_posonly_varpos(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", "", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "defclass_posonly_varpos",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    TyObject *a;
    TyObject *b;
    TyObject *__clinic_args = NULL;

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    b = fastargs[1];
    __clinic_args = _TyTuple_FromArray(args + 2, nargs - 2);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = _testclinic_TestClass_defclass_posonly_varpos_impl(self, cls, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_varpos_no_fastcall__doc__,
"varpos_no_fastcall($type, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_VARPOS_NO_FASTCALL_METHODDEF    \
    {"varpos_no_fastcall", (PyCFunction)_testclinic_TestClass_varpos_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_varpos_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_varpos_no_fastcall_impl(TyTypeObject *type,
                                              TyObject *args);

static TyObject *
_testclinic_TestClass_varpos_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject *__clinic_args = NULL;

    __clinic_args = Ty_NewRef(args);
    return_value = _testclinic_TestClass_varpos_no_fastcall_impl((TyTypeObject *)type, __clinic_args);

    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_varpos_no_fastcall__doc__,
"posonly_varpos_no_fastcall($type, a, b, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_VARPOS_NO_FASTCALL_METHODDEF    \
    {"posonly_varpos_no_fastcall", (PyCFunction)_testclinic_TestClass_posonly_varpos_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_posonly_varpos_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_varpos_no_fastcall_impl(TyTypeObject *type,
                                                      TyObject *a,
                                                      TyObject *b,
                                                      TyObject *args);

static TyObject *
_testclinic_TestClass_posonly_varpos_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject *__clinic_args = NULL;

    if (!_TyArg_CheckPositional("posonly_varpos_no_fastcall", TyTuple_GET_SIZE(args), 2, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = TyTuple_GET_ITEM(args, 0);
    b = TyTuple_GET_ITEM(args, 1);
    __clinic_args = TyTuple_GetSlice(args, 2, PY_SSIZE_T_MAX);
    if (!__clinic_args) {
        goto exit;
    }
    return_value = _testclinic_TestClass_posonly_varpos_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_req_opt_varpos_no_fastcall__doc__,
"posonly_req_opt_varpos_no_fastcall($type, a, b=False, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_REQ_OPT_VARPOS_NO_FASTCALL_METHODDEF    \
    {"posonly_req_opt_varpos_no_fastcall", (PyCFunction)_testclinic_TestClass_posonly_req_opt_varpos_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_posonly_req_opt_varpos_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_req_opt_varpos_no_fastcall_impl(TyTypeObject *type,
                                                              TyObject *a,
                                                              TyObject *b,
                                                              TyObject *args);

static TyObject *
_testclinic_TestClass_posonly_req_opt_varpos_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = Ty_False;
    TyObject *__clinic_args = NULL;

    if (!_TyArg_CheckPositional("posonly_req_opt_varpos_no_fastcall", TyTuple_GET_SIZE(args), 1, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = TyTuple_GET_ITEM(args, 0);
    if (TyTuple_GET_SIZE(args) < 2) {
        goto skip_optional;
    }
    b = TyTuple_GET_ITEM(args, 1);
skip_optional:
    __clinic_args = TyTuple_GetSlice(args, 2, PY_SSIZE_T_MAX);
    if (!__clinic_args) {
        goto exit;
    }
    return_value = _testclinic_TestClass_posonly_req_opt_varpos_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_poskw_varpos_no_fastcall__doc__,
"posonly_poskw_varpos_no_fastcall($type, a, /, b, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_POSKW_VARPOS_NO_FASTCALL_METHODDEF    \
    {"posonly_poskw_varpos_no_fastcall", _PyCFunction_CAST(_testclinic_TestClass_posonly_poskw_varpos_no_fastcall), METH_VARARGS|METH_KEYWORDS|METH_CLASS, _testclinic_TestClass_posonly_poskw_varpos_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_poskw_varpos_no_fastcall_impl(TyTypeObject *type,
                                                            TyObject *a,
                                                            TyObject *b,
                                                            TyObject *args);

static TyObject *
_testclinic_TestClass_posonly_poskw_varpos_no_fastcall(TyObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_poskw_varpos_no_fastcall",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *a;
    TyObject *b;
    TyObject *__clinic_args = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    b = fastargs[1];
    __clinic_args = TyTuple_GetSlice(args, 2, PY_SSIZE_T_MAX);
    if (!__clinic_args) {
        goto exit;
    }
    return_value = _testclinic_TestClass_posonly_poskw_varpos_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_varpos_array_no_fastcall__doc__,
"varpos_array_no_fastcall($type, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_VARPOS_ARRAY_NO_FASTCALL_METHODDEF    \
    {"varpos_array_no_fastcall", (PyCFunction)_testclinic_TestClass_varpos_array_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_varpos_array_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_varpos_array_no_fastcall_impl(TyTypeObject *type,
                                                    TyObject * const *args,
                                                    Ty_ssize_t args_length);

static TyObject *
_testclinic_TestClass_varpos_array_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    __clinic_args = _TyTuple_ITEMS(args);
    args_length = TyTuple_GET_SIZE(args);
    return_value = _testclinic_TestClass_varpos_array_no_fastcall_impl((TyTypeObject *)type, __clinic_args, args_length);

    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_varpos_array_no_fastcall__doc__,
"posonly_varpos_array_no_fastcall($type, a, b, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_VARPOS_ARRAY_NO_FASTCALL_METHODDEF    \
    {"posonly_varpos_array_no_fastcall", (PyCFunction)_testclinic_TestClass_posonly_varpos_array_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_posonly_varpos_array_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_varpos_array_no_fastcall_impl(TyTypeObject *type,
                                                            TyObject *a,
                                                            TyObject *b,
                                                            TyObject * const *args,
                                                            Ty_ssize_t args_length);

static TyObject *
_testclinic_TestClass_posonly_varpos_array_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    if (!_TyArg_CheckPositional("posonly_varpos_array_no_fastcall", TyTuple_GET_SIZE(args), 2, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = TyTuple_GET_ITEM(args, 0);
    b = TyTuple_GET_ITEM(args, 1);
    __clinic_args = _TyTuple_ITEMS(args) + 2;
    args_length = TyTuple_GET_SIZE(args) - 2;
    return_value = _testclinic_TestClass_posonly_varpos_array_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args, args_length);

exit:
    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall__doc__,
"posonly_req_opt_varpos_array_no_fastcall($type, a, b=False, /, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_REQ_OPT_VARPOS_ARRAY_NO_FASTCALL_METHODDEF    \
    {"posonly_req_opt_varpos_array_no_fastcall", (PyCFunction)_testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall, METH_VARARGS|METH_CLASS, _testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall_impl(TyTypeObject *type,
                                                                    TyObject *a,
                                                                    TyObject *b,
                                                                    TyObject * const *args,
                                                                    Ty_ssize_t args_length);

static TyObject *
_testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall(TyObject *type, TyObject *args)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = Ty_False;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    if (!_TyArg_CheckPositional("posonly_req_opt_varpos_array_no_fastcall", TyTuple_GET_SIZE(args), 1, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = TyTuple_GET_ITEM(args, 0);
    if (TyTuple_GET_SIZE(args) < 2) {
        goto skip_optional;
    }
    b = TyTuple_GET_ITEM(args, 1);
skip_optional:
    __clinic_args = TyTuple_GET_SIZE(args) > 2 ? _TyTuple_ITEMS(args) + 2 : _TyTuple_ITEMS(args);
    args_length = Ty_MAX(0, TyTuple_GET_SIZE(args) - 2);
    return_value = _testclinic_TestClass_posonly_req_opt_varpos_array_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args, args_length);

exit:
    return return_value;
}

TyDoc_STRVAR(_testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall__doc__,
"posonly_poskw_varpos_array_no_fastcall($type, a, /, b, *args)\n"
"--\n"
"\n");

#define _TESTCLINIC_TESTCLASS_POSONLY_POSKW_VARPOS_ARRAY_NO_FASTCALL_METHODDEF    \
    {"posonly_poskw_varpos_array_no_fastcall", _PyCFunction_CAST(_testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall), METH_VARARGS|METH_KEYWORDS|METH_CLASS, _testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall__doc__},

static TyObject *
_testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall_impl(TyTypeObject *type,
                                                                  TyObject *a,
                                                                  TyObject *b,
                                                                  TyObject * const *args,
                                                                  Ty_ssize_t args_length);

static TyObject *
_testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall(TyObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posonly_poskw_varpos_array_no_fastcall",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *a;
    TyObject *b;
    TyObject * const *__clinic_args;
    Ty_ssize_t args_length;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    b = fastargs[1];
    __clinic_args = TyTuple_GET_SIZE(args) > 2 ? _TyTuple_ITEMS(args) + 2 : _TyTuple_ITEMS(args);
    args_length = Ty_MAX(0, TyTuple_GET_SIZE(args) - 2);
    return_value = _testclinic_TestClass_posonly_poskw_varpos_array_no_fastcall_impl((TyTypeObject *)type, a, b, __clinic_args, args_length);

exit:
    return return_value;
}
/*[clinic end generated code: output=84ffc31f27215baa input=a9049054013a1b77]*/
