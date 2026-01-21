/*[clinic input]
output preset block
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=3c81ac2402d06a8b]*/

/*[clinic input]
module m
class m.T "TestObj *" "TestType"
class Test "TestObj *" "TestType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=f761b4d55cb179cf]*/

/*[clinic input]
test_object_converter

    a: object
    b: object(converter="TyUnicode_FSConverter")
    c: object(subclass_of="&TyUnicode_Type")
    d: object(type="TyUnicode_Object *")
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_object_converter__doc__,
"test_object_converter($module, a, b, c, d, /)\n"
"--\n"
"\n");

#define TEST_OBJECT_CONVERTER_METHODDEF    \
    {"test_object_converter", _PyCFunction_CAST(test_object_converter), METH_FASTCALL, test_object_converter__doc__},

static TyObject *
test_object_converter_impl(TyObject *module, TyObject *a, TyObject *b,
                           TyObject *c, TyUnicode_Object *d);

static TyObject *
test_object_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyUnicode_Object *d;

    if (!_TyArg_CheckPositional("test_object_converter", nargs, 4, 4)) {
        goto exit;
    }
    a = args[0];
    if (!TyUnicode_FSConverter(args[1], &b)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("test_object_converter", "argument 3", "str", args[2]);
        goto exit;
    }
    c = args[2];
    d = (TyUnicode_Object *)args[3];
    return_value = test_object_converter_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_object_converter_impl(TyObject *module, TyObject *a, TyObject *b,
                           TyObject *c, TyUnicode_Object *d)
/*[clinic end generated code: output=886f4f9b598726b6 input=005e6a8a711a869b]*/


/*[clinic input]
cloned = test_object_converter
Check the clone feature.
[clinic start generated code]*/

TyDoc_STRVAR(cloned__doc__,
"cloned($module, a, b, c, d, /)\n"
"--\n"
"\n"
"Check the clone feature.");

#define CLONED_METHODDEF    \
    {"cloned", _PyCFunction_CAST(cloned), METH_FASTCALL, cloned__doc__},

static TyObject *
cloned_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c,
            TyUnicode_Object *d);

static TyObject *
cloned(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyUnicode_Object *d;

    if (!_TyArg_CheckPositional("cloned", nargs, 4, 4)) {
        goto exit;
    }
    a = args[0];
    if (!TyUnicode_FSConverter(args[1], &b)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("cloned", "argument 3", "str", args[2]);
        goto exit;
    }
    c = args[2];
    d = (TyUnicode_Object *)args[3];
    return_value = cloned_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
cloned_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c,
            TyUnicode_Object *d)
/*[clinic end generated code: output=026b483e27c38065 input=0543614019d6fcc7]*/


/*[clinic input]
test_object_converter_one_arg

    a: object
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_object_converter_one_arg__doc__,
"test_object_converter_one_arg($module, a, /)\n"
"--\n"
"\n");

#define TEST_OBJECT_CONVERTER_ONE_ARG_METHODDEF    \
    {"test_object_converter_one_arg", (PyCFunction)test_object_converter_one_arg, METH_O, test_object_converter_one_arg__doc__},

static TyObject *
test_object_converter_one_arg(TyObject *module, TyObject *a)
/*[clinic end generated code: output=6da755f8502139df input=d635d92a421f1ca3]*/


/*[clinic input]
test_objects_converter

    a: object
    b: object = NULL
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_objects_converter__doc__,
"test_objects_converter($module, a, b=<unrepresentable>, /)\n"
"--\n"
"\n");

#define TEST_OBJECTS_CONVERTER_METHODDEF    \
    {"test_objects_converter", _PyCFunction_CAST(test_objects_converter), METH_FASTCALL, test_objects_converter__doc__},

static TyObject *
test_objects_converter_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
test_objects_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b = NULL;

    if (!_TyArg_CheckPositional("test_objects_converter", nargs, 1, 2)) {
        goto exit;
    }
    a = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    b = args[1];
skip_optional:
    return_value = test_objects_converter_impl(module, a, b);

exit:
    return return_value;
}

static TyObject *
test_objects_converter_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=fc26328b79d46bb7 input=4cbb3d9edd2a36f3]*/


/*[clinic input]
test_object_converter_subclass_of

    a: object(subclass_of="&TyLong_Type")
    b: object(subclass_of="&TyTuple_Type")
    c: object(subclass_of="&TyList_Type")
    d: object(subclass_of="&TySet_Type")
    e: object(subclass_of="&TyFrozenSet_Type")
    f: object(subclass_of="&TyDict_Type")
    g: object(subclass_of="&TyUnicode_Type")
    h: object(subclass_of="&TyBytes_Type")
    i: object(subclass_of="&TyByteArray_Type")
    j: object(subclass_of="&MyType")
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_object_converter_subclass_of__doc__,
"test_object_converter_subclass_of($module, a, b, c, d, e, f, g, h, i,\n"
"                                  j, /)\n"
"--\n"
"\n");

#define TEST_OBJECT_CONVERTER_SUBCLASS_OF_METHODDEF    \
    {"test_object_converter_subclass_of", _PyCFunction_CAST(test_object_converter_subclass_of), METH_FASTCALL, test_object_converter_subclass_of__doc__},

static TyObject *
test_object_converter_subclass_of_impl(TyObject *module, TyObject *a,
                                       TyObject *b, TyObject *c, TyObject *d,
                                       TyObject *e, TyObject *f, TyObject *g,
                                       TyObject *h, TyObject *i, TyObject *j);

static TyObject *
test_object_converter_subclass_of(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;
    TyObject *e;
    TyObject *f;
    TyObject *g;
    TyObject *h;
    TyObject *i;
    TyObject *j;

    if (!_TyArg_CheckPositional("test_object_converter_subclass_of", nargs, 10, 10)) {
        goto exit;
    }
    if (!TyLong_Check(args[0])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 1", "int", args[0]);
        goto exit;
    }
    a = args[0];
    if (!TyTuple_Check(args[1])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 2", "tuple", args[1]);
        goto exit;
    }
    b = args[1];
    if (!TyList_Check(args[2])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 3", "list", args[2]);
        goto exit;
    }
    c = args[2];
    if (!TySet_Check(args[3])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 4", "set", args[3]);
        goto exit;
    }
    d = args[3];
    if (!TyFrozenSet_Check(args[4])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 5", "frozenset", args[4]);
        goto exit;
    }
    e = args[4];
    if (!TyDict_Check(args[5])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 6", "dict", args[5]);
        goto exit;
    }
    f = args[5];
    if (!TyUnicode_Check(args[6])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 7", "str", args[6]);
        goto exit;
    }
    g = args[6];
    if (!TyBytes_Check(args[7])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 8", "bytes", args[7]);
        goto exit;
    }
    h = args[7];
    if (!TyByteArray_Check(args[8])) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 9", "bytearray", args[8]);
        goto exit;
    }
    i = args[8];
    if (!PyObject_TypeCheck(args[9], &MyType)) {
        _TyArg_BadArgument("test_object_converter_subclass_of", "argument 10", (&MyType)->tp_name, args[9]);
        goto exit;
    }
    j = args[9];
    return_value = test_object_converter_subclass_of_impl(module, a, b, c, d, e, f, g, h, i, j);

exit:
    return return_value;
}

static TyObject *
test_object_converter_subclass_of_impl(TyObject *module, TyObject *a,
                                       TyObject *b, TyObject *c, TyObject *d,
                                       TyObject *e, TyObject *f, TyObject *g,
                                       TyObject *h, TyObject *i, TyObject *j)
/*[clinic end generated code: output=e4b07c9a54479a40 input=31b06b772d5f983e]*/


/*[clinic input]
test_PyBytesObject_converter

    a: PyBytesObject
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_PyBytesObject_converter__doc__,
"test_PyBytesObject_converter($module, a, /)\n"
"--\n"
"\n");

#define TEST_PYBYTESOBJECT_CONVERTER_METHODDEF    \
    {"test_PyBytesObject_converter", (PyCFunction)test_PyBytesObject_converter, METH_O, test_PyBytesObject_converter__doc__},

static TyObject *
test_PyBytesObject_converter_impl(TyObject *module, PyBytesObject *a);

static TyObject *
test_PyBytesObject_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    PyBytesObject *a;

    if (!TyBytes_Check(arg)) {
        _TyArg_BadArgument("test_PyBytesObject_converter", "argument", "bytes", arg);
        goto exit;
    }
    a = (PyBytesObject *)arg;
    return_value = test_PyBytesObject_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_PyBytesObject_converter_impl(TyObject *module, PyBytesObject *a)
/*[clinic end generated code: output=7539d628e6fceace input=12b10c7cb5750400]*/


/*[clinic input]
test_PyByteArrayObject_converter

    a: PyByteArrayObject
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_PyByteArrayObject_converter__doc__,
"test_PyByteArrayObject_converter($module, a, /)\n"
"--\n"
"\n");

#define TEST_PYBYTEARRAYOBJECT_CONVERTER_METHODDEF    \
    {"test_PyByteArrayObject_converter", (PyCFunction)test_PyByteArrayObject_converter, METH_O, test_PyByteArrayObject_converter__doc__},

static TyObject *
test_PyByteArrayObject_converter_impl(TyObject *module, PyByteArrayObject *a);

static TyObject *
test_PyByteArrayObject_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    PyByteArrayObject *a;

    if (!TyByteArray_Check(arg)) {
        _TyArg_BadArgument("test_PyByteArrayObject_converter", "argument", "bytearray", arg);
        goto exit;
    }
    a = (PyByteArrayObject *)arg;
    return_value = test_PyByteArrayObject_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_PyByteArrayObject_converter_impl(TyObject *module, PyByteArrayObject *a)
/*[clinic end generated code: output=1245af9f5b3e355e input=5a657da535d194ae]*/


/*[clinic input]
test_unicode_converter

    a: unicode
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unicode_converter__doc__,
"test_unicode_converter($module, a, /)\n"
"--\n"
"\n");

#define TEST_UNICODE_CONVERTER_METHODDEF    \
    {"test_unicode_converter", (PyCFunction)test_unicode_converter, METH_O, test_unicode_converter__doc__},

static TyObject *
test_unicode_converter_impl(TyObject *module, TyObject *a);

static TyObject *
test_unicode_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *a;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("test_unicode_converter", "argument", "str", arg);
        goto exit;
    }
    a = arg;
    return_value = test_unicode_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_unicode_converter_impl(TyObject *module, TyObject *a)
/*[clinic end generated code: output=8c1625cc272c1f3d input=aa33612df92aa9c5]*/


/*[clinic input]
test_bool_converter

    a: bool = True
    b: bool(accept={object}) = True
    c: bool(accept={int}) = True
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_bool_converter__doc__,
"test_bool_converter($module, a=True, b=True, c=True, /)\n"
"--\n"
"\n");

#define TEST_BOOL_CONVERTER_METHODDEF    \
    {"test_bool_converter", _PyCFunction_CAST(test_bool_converter), METH_FASTCALL, test_bool_converter__doc__},

static TyObject *
test_bool_converter_impl(TyObject *module, int a, int b, int c);

static TyObject *
test_bool_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int a = 1;
    int b = 1;
    int c = 1;

    if (!_TyArg_CheckPositional("test_bool_converter", nargs, 0, 3)) {
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
    return_value = test_bool_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_bool_converter_impl(TyObject *module, int a, int b, int c)
/*[clinic end generated code: output=3190e46490de0644 input=939854fa9f248c60]*/


/*[clinic input]
test_char_converter

    a: char = b'A'
    b: char = b'\a'
    c: char = b'\b'
    d: char = b'\t'
    e: char = b'\n'
    f: char = b'\v'
    g: char = b'\f'
    h: char = b'\r'
    i: char = b'"'
    j: char = b"'"
    k: char = b'?'
    l: char = b'\\'
    m: char = b'\000'
    n: char = b'\377'
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_char_converter__doc__,
"test_char_converter($module, a=b\'A\', b=b\'\\x07\', c=b\'\\x08\', d=b\'\\t\',\n"
"                    e=b\'\\n\', f=b\'\\x0b\', g=b\'\\x0c\', h=b\'\\r\', i=b\'\"\',\n"
"                    j=b\"\'\", k=b\'?\', l=b\'\\\\\', m=b\'\\x00\', n=b\'\\xff\', /)\n"
"--\n"
"\n");

#define TEST_CHAR_CONVERTER_METHODDEF    \
    {"test_char_converter", _PyCFunction_CAST(test_char_converter), METH_FASTCALL, test_char_converter__doc__},

static TyObject *
test_char_converter_impl(TyObject *module, char a, char b, char c, char d,
                         char e, char f, char g, char h, char i, char j,
                         char k, char l, char m, char n);

static TyObject *
test_char_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
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

    if (!_TyArg_CheckPositional("test_char_converter", nargs, 0, 14)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[0])) {
        if (TyBytes_GET_SIZE(args[0]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 1 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[0]));
            goto exit;
        }
        a = TyBytes_AS_STRING(args[0])[0];
    }
    else if (TyByteArray_Check(args[0])) {
        if (TyByteArray_GET_SIZE(args[0]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 1 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[0]));
            goto exit;
        }
        a = TyByteArray_AS_STRING(args[0])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 1", "a byte string of length 1", args[0]);
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[1])) {
        if (TyBytes_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 2 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[1]));
            goto exit;
        }
        b = TyBytes_AS_STRING(args[1])[0];
    }
    else if (TyByteArray_Check(args[1])) {
        if (TyByteArray_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 2 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[1]));
            goto exit;
        }
        b = TyByteArray_AS_STRING(args[1])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 2", "a byte string of length 1", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[2])) {
        if (TyBytes_GET_SIZE(args[2]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 3 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[2]));
            goto exit;
        }
        c = TyBytes_AS_STRING(args[2])[0];
    }
    else if (TyByteArray_Check(args[2])) {
        if (TyByteArray_GET_SIZE(args[2]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 3 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[2]));
            goto exit;
        }
        c = TyByteArray_AS_STRING(args[2])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 3", "a byte string of length 1", args[2]);
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[3])) {
        if (TyBytes_GET_SIZE(args[3]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 4 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[3]));
            goto exit;
        }
        d = TyBytes_AS_STRING(args[3])[0];
    }
    else if (TyByteArray_Check(args[3])) {
        if (TyByteArray_GET_SIZE(args[3]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 4 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[3]));
            goto exit;
        }
        d = TyByteArray_AS_STRING(args[3])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 4", "a byte string of length 1", args[3]);
        goto exit;
    }
    if (nargs < 5) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[4])) {
        if (TyBytes_GET_SIZE(args[4]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 5 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[4]));
            goto exit;
        }
        e = TyBytes_AS_STRING(args[4])[0];
    }
    else if (TyByteArray_Check(args[4])) {
        if (TyByteArray_GET_SIZE(args[4]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 5 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[4]));
            goto exit;
        }
        e = TyByteArray_AS_STRING(args[4])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 5", "a byte string of length 1", args[4]);
        goto exit;
    }
    if (nargs < 6) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[5])) {
        if (TyBytes_GET_SIZE(args[5]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 6 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[5]));
            goto exit;
        }
        f = TyBytes_AS_STRING(args[5])[0];
    }
    else if (TyByteArray_Check(args[5])) {
        if (TyByteArray_GET_SIZE(args[5]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 6 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[5]));
            goto exit;
        }
        f = TyByteArray_AS_STRING(args[5])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 6", "a byte string of length 1", args[5]);
        goto exit;
    }
    if (nargs < 7) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[6])) {
        if (TyBytes_GET_SIZE(args[6]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 7 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[6]));
            goto exit;
        }
        g = TyBytes_AS_STRING(args[6])[0];
    }
    else if (TyByteArray_Check(args[6])) {
        if (TyByteArray_GET_SIZE(args[6]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 7 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[6]));
            goto exit;
        }
        g = TyByteArray_AS_STRING(args[6])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 7", "a byte string of length 1", args[6]);
        goto exit;
    }
    if (nargs < 8) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[7])) {
        if (TyBytes_GET_SIZE(args[7]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 8 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[7]));
            goto exit;
        }
        h = TyBytes_AS_STRING(args[7])[0];
    }
    else if (TyByteArray_Check(args[7])) {
        if (TyByteArray_GET_SIZE(args[7]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 8 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[7]));
            goto exit;
        }
        h = TyByteArray_AS_STRING(args[7])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 8", "a byte string of length 1", args[7]);
        goto exit;
    }
    if (nargs < 9) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[8])) {
        if (TyBytes_GET_SIZE(args[8]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 9 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[8]));
            goto exit;
        }
        i = TyBytes_AS_STRING(args[8])[0];
    }
    else if (TyByteArray_Check(args[8])) {
        if (TyByteArray_GET_SIZE(args[8]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 9 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[8]));
            goto exit;
        }
        i = TyByteArray_AS_STRING(args[8])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 9", "a byte string of length 1", args[8]);
        goto exit;
    }
    if (nargs < 10) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[9])) {
        if (TyBytes_GET_SIZE(args[9]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 10 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[9]));
            goto exit;
        }
        j = TyBytes_AS_STRING(args[9])[0];
    }
    else if (TyByteArray_Check(args[9])) {
        if (TyByteArray_GET_SIZE(args[9]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 10 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[9]));
            goto exit;
        }
        j = TyByteArray_AS_STRING(args[9])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 10", "a byte string of length 1", args[9]);
        goto exit;
    }
    if (nargs < 11) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[10])) {
        if (TyBytes_GET_SIZE(args[10]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 11 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[10]));
            goto exit;
        }
        k = TyBytes_AS_STRING(args[10])[0];
    }
    else if (TyByteArray_Check(args[10])) {
        if (TyByteArray_GET_SIZE(args[10]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 11 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[10]));
            goto exit;
        }
        k = TyByteArray_AS_STRING(args[10])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 11", "a byte string of length 1", args[10]);
        goto exit;
    }
    if (nargs < 12) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[11])) {
        if (TyBytes_GET_SIZE(args[11]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 12 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[11]));
            goto exit;
        }
        l = TyBytes_AS_STRING(args[11])[0];
    }
    else if (TyByteArray_Check(args[11])) {
        if (TyByteArray_GET_SIZE(args[11]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 12 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[11]));
            goto exit;
        }
        l = TyByteArray_AS_STRING(args[11])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 12", "a byte string of length 1", args[11]);
        goto exit;
    }
    if (nargs < 13) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[12])) {
        if (TyBytes_GET_SIZE(args[12]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 13 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[12]));
            goto exit;
        }
        m = TyBytes_AS_STRING(args[12])[0];
    }
    else if (TyByteArray_Check(args[12])) {
        if (TyByteArray_GET_SIZE(args[12]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 13 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[12]));
            goto exit;
        }
        m = TyByteArray_AS_STRING(args[12])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 13", "a byte string of length 1", args[12]);
        goto exit;
    }
    if (nargs < 14) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[13])) {
        if (TyBytes_GET_SIZE(args[13]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 14 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[13]));
            goto exit;
        }
        n = TyBytes_AS_STRING(args[13])[0];
    }
    else if (TyByteArray_Check(args[13])) {
        if (TyByteArray_GET_SIZE(args[13]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "test_char_converter(): argument 14 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[13]));
            goto exit;
        }
        n = TyByteArray_AS_STRING(args[13])[0];
    }
    else {
        _TyArg_BadArgument("test_char_converter", "argument 14", "a byte string of length 1", args[13]);
        goto exit;
    }
skip_optional:
    return_value = test_char_converter_impl(module, a, b, c, d, e, f, g, h, i, j, k, l, m, n);

exit:
    return return_value;
}

static TyObject *
test_char_converter_impl(TyObject *module, char a, char b, char c, char d,
                         char e, char f, char g, char h, char i, char j,
                         char k, char l, char m, char n)
/*[clinic end generated code: output=ff11e203248582df input=e42330417a44feac]*/


/*[clinic input]
test_unsigned_char_converter

    a: unsigned_char = 12
    b: unsigned_char(bitwise=False) = 34
    c: unsigned_char(bitwise=True) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unsigned_char_converter__doc__,
"test_unsigned_char_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_UNSIGNED_CHAR_CONVERTER_METHODDEF    \
    {"test_unsigned_char_converter", _PyCFunction_CAST(test_unsigned_char_converter), METH_FASTCALL, test_unsigned_char_converter__doc__},

static TyObject *
test_unsigned_char_converter_impl(TyObject *module, unsigned char a,
                                  unsigned char b, unsigned char c);

static TyObject *
test_unsigned_char_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned char a = 12;
    unsigned char b = 34;
    unsigned char c = 56;

    if (!_TyArg_CheckPositional("test_unsigned_char_converter", nargs, 0, 3)) {
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
    return_value = test_unsigned_char_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_unsigned_char_converter_impl(TyObject *module, unsigned char a,
                                  unsigned char b, unsigned char c)
/*[clinic end generated code: output=45920dbedc22eb55 input=021414060993e289]*/


/*[clinic input]
test_short_converter

    a: short = 12
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_short_converter__doc__,
"test_short_converter($module, a=12, /)\n"
"--\n"
"\n");

#define TEST_SHORT_CONVERTER_METHODDEF    \
    {"test_short_converter", _PyCFunction_CAST(test_short_converter), METH_FASTCALL, test_short_converter__doc__},

static TyObject *
test_short_converter_impl(TyObject *module, short a);

static TyObject *
test_short_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    short a = 12;

    if (!_TyArg_CheckPositional("test_short_converter", nargs, 0, 1)) {
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
    return_value = test_short_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_short_converter_impl(TyObject *module, short a)
/*[clinic end generated code: output=a580945bd6963d45 input=6a8a7a509a498ff4]*/


/*[clinic input]
test_unsigned_short_converter

    a: unsigned_short = 12
    b: unsigned_short(bitwise=False) = 34
    c: unsigned_short(bitwise=True) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unsigned_short_converter__doc__,
"test_unsigned_short_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_UNSIGNED_SHORT_CONVERTER_METHODDEF    \
    {"test_unsigned_short_converter", _PyCFunction_CAST(test_unsigned_short_converter), METH_FASTCALL, test_unsigned_short_converter__doc__},

static TyObject *
test_unsigned_short_converter_impl(TyObject *module, unsigned short a,
                                   unsigned short b, unsigned short c);

static TyObject *
test_unsigned_short_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned short a = 12;
    unsigned short b = 34;
    unsigned short c = 56;

    if (!_TyArg_CheckPositional("test_unsigned_short_converter", nargs, 0, 3)) {
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
    return_value = test_unsigned_short_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_unsigned_short_converter_impl(TyObject *module, unsigned short a,
                                   unsigned short b, unsigned short c)
/*[clinic end generated code: output=e6e990df729114fc input=cdfd8eff3d9176b4]*/


/*[clinic input]
test_int_converter

    a: int = 12
    b: int(accept={int}) = 34
    c: int(accept={str}) = 45
    d: int(type='myenum') = 67
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_int_converter__doc__,
"test_int_converter($module, a=12, b=34, c=45, d=67, /)\n"
"--\n"
"\n");

#define TEST_INT_CONVERTER_METHODDEF    \
    {"test_int_converter", _PyCFunction_CAST(test_int_converter), METH_FASTCALL, test_int_converter__doc__},

static TyObject *
test_int_converter_impl(TyObject *module, int a, int b, int c, myenum d);

static TyObject *
test_int_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int a = 12;
    int b = 34;
    int c = 45;
    myenum d = 67;

    if (!_TyArg_CheckPositional("test_int_converter", nargs, 0, 4)) {
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
        _TyArg_BadArgument("test_int_converter", "argument 3", "a unicode character", args[2]);
        goto exit;
    }
    if (TyUnicode_GET_LENGTH(args[2]) != 1) {
        TyErr_Format(TyExc_TypeError,
            "test_int_converter(): argument 3 must be a unicode character, "
            "not a string of length %zd",
            TyUnicode_GET_LENGTH(args[2]));
        goto exit;
    }
    c = TyUnicode_READ_CHAR(args[2], 0);
    if (nargs < 4) {
        goto skip_optional;
    }
    d = TyLong_AsInt(args[3]);
    if (d == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = test_int_converter_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_int_converter_impl(TyObject *module, int a, int b, int c, myenum d)
/*[clinic end generated code: output=fbcfb7554688663d input=d20541fc1ca0553e]*/


/*[clinic input]
test_unsigned_int_converter

    a: unsigned_int = 12
    b: unsigned_int(bitwise=False) = 34
    c: unsigned_int(bitwise=True) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unsigned_int_converter__doc__,
"test_unsigned_int_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_UNSIGNED_INT_CONVERTER_METHODDEF    \
    {"test_unsigned_int_converter", _PyCFunction_CAST(test_unsigned_int_converter), METH_FASTCALL, test_unsigned_int_converter__doc__},

static TyObject *
test_unsigned_int_converter_impl(TyObject *module, unsigned int a,
                                 unsigned int b, unsigned int c);

static TyObject *
test_unsigned_int_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned int a = 12;
    unsigned int b = 34;
    unsigned int c = 56;

    if (!_TyArg_CheckPositional("test_unsigned_int_converter", nargs, 0, 3)) {
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
    return_value = test_unsigned_int_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_unsigned_int_converter_impl(TyObject *module, unsigned int a,
                                 unsigned int b, unsigned int c)
/*[clinic end generated code: output=f9cdbe410ccc98a3 input=5533534828b62fc0]*/


/*[clinic input]
test_long_converter

    a: long = 12
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_long_converter__doc__,
"test_long_converter($module, a=12, /)\n"
"--\n"
"\n");

#define TEST_LONG_CONVERTER_METHODDEF    \
    {"test_long_converter", _PyCFunction_CAST(test_long_converter), METH_FASTCALL, test_long_converter__doc__},

static TyObject *
test_long_converter_impl(TyObject *module, long a);

static TyObject *
test_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    long a = 12;

    if (!_TyArg_CheckPositional("test_long_converter", nargs, 0, 1)) {
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
    return_value = test_long_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_long_converter_impl(TyObject *module, long a)
/*[clinic end generated code: output=02b3a83495c1d236 input=d2179e3c9cdcde89]*/


/*[clinic input]
test_unsigned_long_converter

    a: unsigned_long = 12
    b: unsigned_long(bitwise=False) = 34
    c: unsigned_long(bitwise=True) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unsigned_long_converter__doc__,
"test_unsigned_long_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_UNSIGNED_LONG_CONVERTER_METHODDEF    \
    {"test_unsigned_long_converter", _PyCFunction_CAST(test_unsigned_long_converter), METH_FASTCALL, test_unsigned_long_converter__doc__},

static TyObject *
test_unsigned_long_converter_impl(TyObject *module, unsigned long a,
                                  unsigned long b, unsigned long c);

static TyObject *
test_unsigned_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned long a = 12;
    unsigned long b = 34;
    unsigned long c = 56;

    if (!_TyArg_CheckPositional("test_unsigned_long_converter", nargs, 0, 3)) {
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
        _TyArg_BadArgument("test_unsigned_long_converter", "argument 3", "int", args[2]);
        goto exit;
    }
    c = TyLong_AsUnsignedLongMask(args[2]);
skip_optional:
    return_value = test_unsigned_long_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_unsigned_long_converter_impl(TyObject *module, unsigned long a,
                                  unsigned long b, unsigned long c)
/*[clinic end generated code: output=d74eed227d77a31b input=f450d94cae1ef73b]*/


/*[clinic input]
test_long_long_converter

    a: long_long = 12
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_long_long_converter__doc__,
"test_long_long_converter($module, a=12, /)\n"
"--\n"
"\n");

#define TEST_LONG_LONG_CONVERTER_METHODDEF    \
    {"test_long_long_converter", _PyCFunction_CAST(test_long_long_converter), METH_FASTCALL, test_long_long_converter__doc__},

static TyObject *
test_long_long_converter_impl(TyObject *module, long long a);

static TyObject *
test_long_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    long long a = 12;

    if (!_TyArg_CheckPositional("test_long_long_converter", nargs, 0, 1)) {
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
    return_value = test_long_long_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_long_long_converter_impl(TyObject *module, long long a)
/*[clinic end generated code: output=f9d4ed79ad2db857 input=d5fc81577ff4dd02]*/


/*[clinic input]
test_unsigned_long_long_converter

    a: unsigned_long_long = 12
    b: unsigned_long_long(bitwise=False) = 34
    c: unsigned_long_long(bitwise=True) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_unsigned_long_long_converter__doc__,
"test_unsigned_long_long_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_UNSIGNED_LONG_LONG_CONVERTER_METHODDEF    \
    {"test_unsigned_long_long_converter", _PyCFunction_CAST(test_unsigned_long_long_converter), METH_FASTCALL, test_unsigned_long_long_converter__doc__},

static TyObject *
test_unsigned_long_long_converter_impl(TyObject *module,
                                       unsigned long long a,
                                       unsigned long long b,
                                       unsigned long long c);

static TyObject *
test_unsigned_long_long_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    unsigned long long a = 12;
    unsigned long long b = 34;
    unsigned long long c = 56;

    if (!_TyArg_CheckPositional("test_unsigned_long_long_converter", nargs, 0, 3)) {
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
        _TyArg_BadArgument("test_unsigned_long_long_converter", "argument 3", "int", args[2]);
        goto exit;
    }
    c = TyLong_AsUnsignedLongLongMask(args[2]);
skip_optional:
    return_value = test_unsigned_long_long_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_unsigned_long_long_converter_impl(TyObject *module,
                                       unsigned long long a,
                                       unsigned long long b,
                                       unsigned long long c)
/*[clinic end generated code: output=5ca4e4dfb3db644b input=a15115dc41866ff4]*/


/*[clinic input]
test_Py_ssize_t_converter

    a: Ty_ssize_t = 12
    b: Ty_ssize_t(accept={int}) = 34
    c: Ty_ssize_t(accept={int, NoneType}) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_Py_ssize_t_converter__doc__,
"test_Py_ssize_t_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_PY_SSIZE_T_CONVERTER_METHODDEF    \
    {"test_Py_ssize_t_converter", _PyCFunction_CAST(test_Py_ssize_t_converter), METH_FASTCALL, test_Py_ssize_t_converter__doc__},

static TyObject *
test_Py_ssize_t_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                               Ty_ssize_t c);

static TyObject *
test_Py_ssize_t_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t a = 12;
    Ty_ssize_t b = 34;
    Ty_ssize_t c = 56;

    if (!_TyArg_CheckPositional("test_Py_ssize_t_converter", nargs, 0, 3)) {
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
    return_value = test_Py_ssize_t_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_Py_ssize_t_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                               Ty_ssize_t c)
/*[clinic end generated code: output=48214bc3d01f4dd7 input=3855f184bb3f299d]*/


/*[clinic input]
test_slice_index_converter

    a: slice_index = 12
    b: slice_index(accept={int}) = 34
    c: slice_index(accept={int, NoneType}) = 56
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_slice_index_converter__doc__,
"test_slice_index_converter($module, a=12, b=34, c=56, /)\n"
"--\n"
"\n");

#define TEST_SLICE_INDEX_CONVERTER_METHODDEF    \
    {"test_slice_index_converter", _PyCFunction_CAST(test_slice_index_converter), METH_FASTCALL, test_slice_index_converter__doc__},

static TyObject *
test_slice_index_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                                Ty_ssize_t c);

static TyObject *
test_slice_index_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t a = 12;
    Ty_ssize_t b = 34;
    Ty_ssize_t c = 56;

    if (!_TyArg_CheckPositional("test_slice_index_converter", nargs, 0, 3)) {
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
    return_value = test_slice_index_converter_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_slice_index_converter_impl(TyObject *module, Ty_ssize_t a, Ty_ssize_t b,
                                Ty_ssize_t c)
/*[clinic end generated code: output=67506ed999361212 input=edeadb0ee126f531]*/


/*[clinic input]
test_size_t_converter

    a: size_t = 12
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_size_t_converter__doc__,
"test_size_t_converter($module, a=12, /)\n"
"--\n"
"\n");

#define TEST_SIZE_T_CONVERTER_METHODDEF    \
    {"test_size_t_converter", _PyCFunction_CAST(test_size_t_converter), METH_FASTCALL, test_size_t_converter__doc__},

static TyObject *
test_size_t_converter_impl(TyObject *module, size_t a);

static TyObject *
test_size_t_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    size_t a = 12;

    if (!_TyArg_CheckPositional("test_size_t_converter", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_TyLong_Size_t_Converter(args[0], &a)) {
        goto exit;
    }
skip_optional:
    return_value = test_size_t_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_size_t_converter_impl(TyObject *module, size_t a)
/*[clinic end generated code: output=1653ecb5cbf775aa input=52e93a0fed0f1fb3]*/


/*[clinic input]
test_float_converter

    a: float = 12.5
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_float_converter__doc__,
"test_float_converter($module, a=12.5, /)\n"
"--\n"
"\n");

#define TEST_FLOAT_CONVERTER_METHODDEF    \
    {"test_float_converter", _PyCFunction_CAST(test_float_converter), METH_FASTCALL, test_float_converter__doc__},

static TyObject *
test_float_converter_impl(TyObject *module, float a);

static TyObject *
test_float_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    float a = 12.5;

    if (!_TyArg_CheckPositional("test_float_converter", nargs, 0, 1)) {
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
    return_value = test_float_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_float_converter_impl(TyObject *module, float a)
/*[clinic end generated code: output=36ad006990a8a91e input=259c0d98eca35034]*/


/*[clinic input]
test_double_converter

    a: double = 12.5
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_double_converter__doc__,
"test_double_converter($module, a=12.5, /)\n"
"--\n"
"\n");

#define TEST_DOUBLE_CONVERTER_METHODDEF    \
    {"test_double_converter", _PyCFunction_CAST(test_double_converter), METH_FASTCALL, test_double_converter__doc__},

static TyObject *
test_double_converter_impl(TyObject *module, double a);

static TyObject *
test_double_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    double a = 12.5;

    if (!_TyArg_CheckPositional("test_double_converter", nargs, 0, 1)) {
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
    return_value = test_double_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_double_converter_impl(TyObject *module, double a)
/*[clinic end generated code: output=7435925592bac795 input=c6a9945706a41c27]*/


/*[clinic input]
test_Py_complex_converter

    a: Ty_complex
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_Py_complex_converter__doc__,
"test_Py_complex_converter($module, a, /)\n"
"--\n"
"\n");

#define TEST_PY_COMPLEX_CONVERTER_METHODDEF    \
    {"test_Py_complex_converter", (PyCFunction)test_Py_complex_converter, METH_O, test_Py_complex_converter__doc__},

static TyObject *
test_Py_complex_converter_impl(TyObject *module, Ty_complex a);

static TyObject *
test_Py_complex_converter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex a;

    a = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = test_Py_complex_converter_impl(module, a);

exit:
    return return_value;
}

static TyObject *
test_Py_complex_converter_impl(TyObject *module, Ty_complex a)
/*[clinic end generated code: output=c2ecbec2144ca540 input=070f216a515beb79]*/


/*[clinic input]
test_str_converter

    a: str = NULL
    b: str = "ab"
    c: str(accept={str}) = "cd"
    d: str(accept={robuffer}) = "cef"
    e: str(accept={str, NoneType}) = "gh"
    f: str(accept={robuffer}, zeroes=True) = "ij"
    g: str(accept={robuffer, str}, zeroes=True) = "kl"
    h: str(accept={robuffer, str, NoneType}, zeroes=True) = "mn"
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_str_converter__doc__,
"test_str_converter($module, a=<unrepresentable>, b=\'ab\', c=\'cd\',\n"
"                   d=\'cef\', e=\'gh\', f=\'ij\', g=\'kl\', h=\'mn\', /)\n"
"--\n"
"\n");

#define TEST_STR_CONVERTER_METHODDEF    \
    {"test_str_converter", _PyCFunction_CAST(test_str_converter), METH_FASTCALL, test_str_converter__doc__},

static TyObject *
test_str_converter_impl(TyObject *module, const char *a, const char *b,
                        const char *c, const char *d, const char *e,
                        const char *f, Ty_ssize_t f_length, const char *g,
                        Ty_ssize_t g_length, const char *h,
                        Ty_ssize_t h_length);

static TyObject *
test_str_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *a = NULL;
    const char *b = "ab";
    const char *c = "cd";
    const char *d = "cef";
    const char *e = "gh";
    const char *f = "ij";
    Ty_ssize_t f_length;
    const char *g = "kl";
    Ty_ssize_t g_length;
    const char *h = "mn";
    Ty_ssize_t h_length;

    if (!_TyArg_ParseStack(args, nargs, "|sssyzy#s#z#:test_str_converter",
        &a, &b, &c, &d, &e, &f, &f_length, &g, &g_length, &h, &h_length)) {
        goto exit;
    }
    return_value = test_str_converter_impl(module, a, b, c, d, e, f, f_length, g, g_length, h, h_length);

exit:
    return return_value;
}

static TyObject *
test_str_converter_impl(TyObject *module, const char *a, const char *b,
                        const char *c, const char *d, const char *e,
                        const char *f, Ty_ssize_t f_length, const char *g,
                        Ty_ssize_t g_length, const char *h,
                        Ty_ssize_t h_length)
/*[clinic end generated code: output=82cb06d5237ef062 input=8afe9da8185cd38c]*/


/*[clinic input]
test_str_converter_encoding

    a: str(encoding="idna")
    b: str(encoding="idna", accept={str})
    c: str(encoding="idna", accept={bytes, bytearray, str})
    d: str(encoding="idna", zeroes=True)
    e: str(encoding="idna", accept={bytes, bytearray, str}, zeroes=True)
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_str_converter_encoding__doc__,
"test_str_converter_encoding($module, a, b, c, d, e, /)\n"
"--\n"
"\n");

#define TEST_STR_CONVERTER_ENCODING_METHODDEF    \
    {"test_str_converter_encoding", _PyCFunction_CAST(test_str_converter_encoding), METH_FASTCALL, test_str_converter_encoding__doc__},

static TyObject *
test_str_converter_encoding_impl(TyObject *module, char *a, char *b, char *c,
                                 char *d, Ty_ssize_t d_length, char *e,
                                 Ty_ssize_t e_length);

static TyObject *
test_str_converter_encoding(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    char *a = NULL;
    char *b = NULL;
    char *c = NULL;
    char *d = NULL;
    Ty_ssize_t d_length;
    char *e = NULL;
    Ty_ssize_t e_length;

    if (!_TyArg_ParseStack(args, nargs, "esesetes#et#:test_str_converter_encoding",
        "idna", &a, "idna", &b, "idna", &c, "idna", &d, &d_length, "idna", &e, &e_length)) {
        goto exit;
    }
    return_value = test_str_converter_encoding_impl(module, a, b, c, d, d_length, e, e_length);
    /* Post parse cleanup for a */
    TyMem_FREE(a);
    /* Post parse cleanup for b */
    TyMem_FREE(b);
    /* Post parse cleanup for c */
    TyMem_FREE(c);
    /* Post parse cleanup for d */
    TyMem_FREE(d);
    /* Post parse cleanup for e */
    TyMem_FREE(e);

exit:
    return return_value;
}

static TyObject *
test_str_converter_encoding_impl(TyObject *module, char *a, char *b, char *c,
                                 char *d, Ty_ssize_t d_length, char *e,
                                 Ty_ssize_t e_length)
/*[clinic end generated code: output=999c1deecfa15b0a input=eb4c38e1f898f402]*/


/*[clinic input]
test_Py_UNICODE_converter

    a: Ty_UNICODE
    b: Ty_UNICODE(accept={str})
    c: Ty_UNICODE(accept={str, NoneType})
    d: Ty_UNICODE(zeroes=True)
    e: Ty_UNICODE(accept={str, NoneType}, zeroes=True)
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_Py_UNICODE_converter__doc__,
"test_Py_UNICODE_converter($module, a, b, c, d, e, /)\n"
"--\n"
"\n");

#define TEST_PY_UNICODE_CONVERTER_METHODDEF    \
    {"test_Py_UNICODE_converter", _PyCFunction_CAST(test_Py_UNICODE_converter), METH_FASTCALL, test_Py_UNICODE_converter__doc__},

static TyObject *
test_Py_UNICODE_converter_impl(TyObject *module, const wchar_t *a,
                               const wchar_t *b, const wchar_t *c,
                               const wchar_t *d, Ty_ssize_t d_length,
                               const wchar_t *e, Ty_ssize_t e_length);

static TyObject *
test_Py_UNICODE_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const wchar_t *a = NULL;
    const wchar_t *b = NULL;
    const wchar_t *c = NULL;
    const wchar_t *d = NULL;
    Ty_ssize_t d_length;
    const wchar_t *e = NULL;
    Ty_ssize_t e_length;

    if (!_TyArg_ParseStack(args, nargs, "O&O&O&u#Z#:test_Py_UNICODE_converter",
        _TyUnicode_WideCharString_Converter, &a, _TyUnicode_WideCharString_Converter, &b, _TyUnicode_WideCharString_Opt_Converter, &c, &d, &d_length, &e, &e_length)) {
        goto exit;
    }
    return_value = test_Py_UNICODE_converter_impl(module, a, b, c, d, d_length, e, e_length);

exit:
    /* Cleanup for a */
    TyMem_Free((void *)a);
    /* Cleanup for b */
    TyMem_Free((void *)b);
    /* Cleanup for c */
    TyMem_Free((void *)c);

    return return_value;
}

static TyObject *
test_Py_UNICODE_converter_impl(TyObject *module, const wchar_t *a,
                               const wchar_t *b, const wchar_t *c,
                               const wchar_t *d, Ty_ssize_t d_length,
                               const wchar_t *e, Ty_ssize_t e_length)
/*[clinic end generated code: output=529af9cda2a20349 input=064a3b68ad7f04b0]*/


/*[clinic input]
test_Py_buffer_converter

    a: Ty_buffer
    b: Ty_buffer(accept={buffer})
    c: Ty_buffer(accept={str, buffer})
    d: Ty_buffer(accept={str, buffer, NoneType})
    e: Ty_buffer(accept={rwbuffer})
    /

[clinic start generated code]*/

TyDoc_STRVAR(test_Py_buffer_converter__doc__,
"test_Py_buffer_converter($module, a, b, c, d, e, /)\n"
"--\n"
"\n");

#define TEST_PY_BUFFER_CONVERTER_METHODDEF    \
    {"test_Py_buffer_converter", _PyCFunction_CAST(test_Py_buffer_converter), METH_FASTCALL, test_Py_buffer_converter__doc__},

static TyObject *
test_Py_buffer_converter_impl(TyObject *module, Ty_buffer *a, Ty_buffer *b,
                              Ty_buffer *c, Ty_buffer *d, Ty_buffer *e);

static TyObject *
test_Py_buffer_converter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer a = {NULL, NULL};
    Ty_buffer b = {NULL, NULL};
    Ty_buffer c = {NULL, NULL};
    Ty_buffer d = {NULL, NULL};
    Ty_buffer e = {NULL, NULL};

    if (!_TyArg_ParseStack(args, nargs, "y*y*s*z*w*:test_Py_buffer_converter",
        &a, &b, &c, &d, &e)) {
        goto exit;
    }
    return_value = test_Py_buffer_converter_impl(module, &a, &b, &c, &d, &e);

exit:
    /* Cleanup for a */
    if (a.obj) {
       PyBuffer_Release(&a);
    }
    /* Cleanup for b */
    if (b.obj) {
       PyBuffer_Release(&b);
    }
    /* Cleanup for c */
    if (c.obj) {
       PyBuffer_Release(&c);
    }
    /* Cleanup for d */
    if (d.obj) {
       PyBuffer_Release(&d);
    }
    /* Cleanup for e */
    if (e.obj) {
       PyBuffer_Release(&e);
    }

    return return_value;
}

static TyObject *
test_Py_buffer_converter_impl(TyObject *module, Ty_buffer *a, Ty_buffer *b,
                              Ty_buffer *c, Ty_buffer *d, Ty_buffer *e)
/*[clinic end generated code: output=a153b71b4f45f952 input=6a9da0f56f9525fd]*/


/*[clinic input]
test_keywords

    a: object
    b: object

[clinic start generated code]*/

TyDoc_STRVAR(test_keywords__doc__,
"test_keywords($module, /, a, b)\n"
"--\n"
"\n");

#define TEST_KEYWORDS_METHODDEF    \
    {"test_keywords", _PyCFunction_CAST(test_keywords), METH_FASTCALL|METH_KEYWORDS, test_keywords__doc__},

static TyObject *
test_keywords_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
test_keywords(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_keywords",
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
    return_value = test_keywords_impl(module, a, b);

exit:
    return return_value;
}

static TyObject *
test_keywords_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=591462ba3858e446 input=0d3484844749c05b]*/


/*[clinic input]
test_keywords_kwonly

    a: object
    *
    b: object

[clinic start generated code]*/

TyDoc_STRVAR(test_keywords_kwonly__doc__,
"test_keywords_kwonly($module, /, a, *, b)\n"
"--\n"
"\n");

#define TEST_KEYWORDS_KWONLY_METHODDEF    \
    {"test_keywords_kwonly", _PyCFunction_CAST(test_keywords_kwonly), METH_FASTCALL|METH_KEYWORDS, test_keywords_kwonly__doc__},

static TyObject *
test_keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
test_keywords_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_keywords_kwonly",
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
    return_value = test_keywords_kwonly_impl(module, a, b);

exit:
    return return_value;
}

static TyObject *
test_keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=620bb64efa62d69b input=384adc78bfa0bff7]*/


/*[clinic input]
test_keywords_opt

    a: object
    b: object = None
    c: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_keywords_opt__doc__,
"test_keywords_opt($module, /, a, b=None, c=None)\n"
"--\n"
"\n");

#define TEST_KEYWORDS_OPT_METHODDEF    \
    {"test_keywords_opt", _PyCFunction_CAST(test_keywords_opt), METH_FASTCALL|METH_KEYWORDS, test_keywords_opt__doc__},

static TyObject *
test_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                       TyObject *c);

static TyObject *
test_keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_keywords_opt",
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
    return_value = test_keywords_opt_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                       TyObject *c)
/*[clinic end generated code: output=3ea21673d129218c input=eda7964f784f4607]*/


/*[clinic input]
test_keywords_opt_kwonly

    a: object
    b: object = None
    *
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_keywords_opt_kwonly__doc__,
"test_keywords_opt_kwonly($module, /, a, b=None, *, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_KEYWORDS_OPT_KWONLY_METHODDEF    \
    {"test_keywords_opt_kwonly", _PyCFunction_CAST(test_keywords_opt_kwonly), METH_FASTCALL|METH_KEYWORDS, test_keywords_opt_kwonly__doc__},

static TyObject *
test_keywords_opt_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c, TyObject *d);

static TyObject *
test_keywords_opt_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_keywords_opt_kwonly",
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
    return_value = test_keywords_opt_kwonly_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_keywords_opt_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c, TyObject *d)
/*[clinic end generated code: output=1e5fbe4eebfd40a5 input=209387a4815e5082]*/


/*[clinic input]
test_keywords_kwonly_opt

    a: object
    *
    b: object = None
    c: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_keywords_kwonly_opt__doc__,
"test_keywords_kwonly_opt($module, /, a, *, b=None, c=None)\n"
"--\n"
"\n");

#define TEST_KEYWORDS_KWONLY_OPT_METHODDEF    \
    {"test_keywords_kwonly_opt", _PyCFunction_CAST(test_keywords_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_keywords_kwonly_opt__doc__},

static TyObject *
test_keywords_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c);

static TyObject *
test_keywords_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_keywords_kwonly_opt",
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
    return_value = test_keywords_kwonly_opt_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_keywords_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c)
/*[clinic end generated code: output=bac8882cbcd50151 input=18393cc64fa000f4]*/


/*[clinic input]
test_posonly_keywords

    a: object
    /
    b: object

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords__doc__,
"test_posonly_keywords($module, a, /, b)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_METHODDEF    \
    {"test_posonly_keywords", _PyCFunction_CAST(test_posonly_keywords), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords__doc__},

static TyObject *
test_posonly_keywords_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
test_posonly_keywords(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords",
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
    return_value = test_posonly_keywords_impl(module, a, b);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=7ddf55a744ba53dc input=1767b0ebdf06060e]*/


/*[clinic input]
test_posonly_kwonly

    a: object
    /
    *
    c: object

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_kwonly__doc__,
"test_posonly_kwonly($module, a, /, *, c)\n"
"--\n"
"\n");

#define TEST_POSONLY_KWONLY_METHODDEF    \
    {"test_posonly_kwonly", _PyCFunction_CAST(test_posonly_kwonly), METH_FASTCALL|METH_KEYWORDS, test_posonly_kwonly__doc__},

static TyObject *
test_posonly_kwonly_impl(TyObject *module, TyObject *a, TyObject *c);

static TyObject *
test_posonly_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "test_posonly_kwonly",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *c;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    c = args[1];
    return_value = test_posonly_kwonly_impl(module, a, c);

exit:
    return return_value;
}

static TyObject *
test_posonly_kwonly_impl(TyObject *module, TyObject *a, TyObject *c)
/*[clinic end generated code: output=095a4e17e22609bc input=9042f2818f664839]*/


/*[clinic input]
test_posonly_keywords_kwonly

    a: object
    /
    b: object
    *
    c: object

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_kwonly__doc__,
"test_posonly_keywords_kwonly($module, a, /, b, *, c)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_KWONLY_METHODDEF    \
    {"test_posonly_keywords_kwonly", _PyCFunction_CAST(test_posonly_keywords_kwonly), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_kwonly__doc__},

static TyObject *
test_posonly_keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject *c);

static TyObject *
test_posonly_keywords_kwonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_kwonly",
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
    return_value = test_posonly_keywords_kwonly_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_kwonly_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject *c)
/*[clinic end generated code: output=2f03aff955026341 input=29546ebdca492fea]*/


/*[clinic input]
test_posonly_keywords_opt

    a: object
    /
    b: object
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_opt__doc__,
"test_posonly_keywords_opt($module, a, /, b, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_OPT_METHODDEF    \
    {"test_posonly_keywords_opt", _PyCFunction_CAST(test_posonly_keywords_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_opt__doc__},

static TyObject *
test_posonly_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                               TyObject *c, TyObject *d);

static TyObject *
test_posonly_keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_opt",
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
    return_value = test_posonly_keywords_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                               TyObject *c, TyObject *d)
/*[clinic end generated code: output=2c8b2ca42f821c66 input=cdf5a9625e554e9b]*/


/*[clinic input]
test_posonly_keywords_opt2

    a: object
    /
    b: object = None
    c: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_opt2__doc__,
"test_posonly_keywords_opt2($module, a, /, b=None, c=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_OPT2_METHODDEF    \
    {"test_posonly_keywords_opt2", _PyCFunction_CAST(test_posonly_keywords_opt2), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_opt2__doc__},

static TyObject *
test_posonly_keywords_opt2_impl(TyObject *module, TyObject *a, TyObject *b,
                                TyObject *c);

static TyObject *
test_posonly_keywords_opt2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_opt2",
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
    return_value = test_posonly_keywords_opt2_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_opt2_impl(TyObject *module, TyObject *a, TyObject *b,
                                TyObject *c)
/*[clinic end generated code: output=969a3b2b020310f1 input=1581299d21d16f14]*/


/*[clinic input]
test_posonly_opt_keywords_opt

    a: object
    b: object = None
    /
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_opt_keywords_opt__doc__,
"test_posonly_opt_keywords_opt($module, a, b=None, /, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_OPT_KEYWORDS_OPT_METHODDEF    \
    {"test_posonly_opt_keywords_opt", _PyCFunction_CAST(test_posonly_opt_keywords_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_opt_keywords_opt__doc__},

static TyObject *
test_posonly_opt_keywords_opt_impl(TyObject *module, TyObject *a,
                                   TyObject *b, TyObject *c, TyObject *d);

static TyObject *
test_posonly_opt_keywords_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_opt_keywords_opt",
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
    return_value = test_posonly_opt_keywords_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_posonly_opt_keywords_opt_impl(TyObject *module, TyObject *a,
                                   TyObject *b, TyObject *c, TyObject *d)
/*[clinic end generated code: output=02bf5e64403946fc input=408798ec3d42949f]*/


/*[clinic input]
test_posonly_kwonly_opt

    a: object
    /
    *
    b: object
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_kwonly_opt__doc__,
"test_posonly_kwonly_opt($module, a, /, *, b, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KWONLY_OPT_METHODDEF    \
    {"test_posonly_kwonly_opt", _PyCFunction_CAST(test_posonly_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_kwonly_opt__doc__},

static TyObject *
test_posonly_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                             TyObject *c, TyObject *d);

static TyObject *
test_posonly_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_kwonly_opt",
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
    return_value = test_posonly_kwonly_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_posonly_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                             TyObject *c, TyObject *d)
/*[clinic end generated code: output=26510e61948015e8 input=8d8e5643bbbc2309]*/


/*[clinic input]
test_posonly_kwonly_opt2

    a: object
    /
    *
    b: object = None
    c: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_kwonly_opt2__doc__,
"test_posonly_kwonly_opt2($module, a, /, *, b=None, c=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KWONLY_OPT2_METHODDEF    \
    {"test_posonly_kwonly_opt2", _PyCFunction_CAST(test_posonly_kwonly_opt2), METH_FASTCALL|METH_KEYWORDS, test_posonly_kwonly_opt2__doc__},

static TyObject *
test_posonly_kwonly_opt2_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c);

static TyObject *
test_posonly_kwonly_opt2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_kwonly_opt2",
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
    return_value = test_posonly_kwonly_opt2_impl(module, a, b, c);

exit:
    return return_value;
}

static TyObject *
test_posonly_kwonly_opt2_impl(TyObject *module, TyObject *a, TyObject *b,
                              TyObject *c)
/*[clinic end generated code: output=b31416e16c908756 input=f7e5eed94f75fff0]*/


/*[clinic input]
test_posonly_opt_kwonly_opt

    a: object
    b: object = None
    /
    *
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_opt_kwonly_opt__doc__,
"test_posonly_opt_kwonly_opt($module, a, b=None, /, *, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_OPT_KWONLY_OPT_METHODDEF    \
    {"test_posonly_opt_kwonly_opt", _PyCFunction_CAST(test_posonly_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_opt_kwonly_opt__doc__},

static TyObject *
test_posonly_opt_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                                 TyObject *c, TyObject *d);

static TyObject *
test_posonly_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_opt_kwonly_opt",
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
    return_value = test_posonly_opt_kwonly_opt_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_posonly_opt_kwonly_opt_impl(TyObject *module, TyObject *a, TyObject *b,
                                 TyObject *c, TyObject *d)
/*[clinic end generated code: output=dc2337647059cb51 input=1e557dc979d120fd]*/


/*[clinic input]
test_posonly_keywords_kwonly_opt

    a: object
    /
    b: object
    *
    c: object
    d: object = None
    e: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_kwonly_opt__doc__,
"test_posonly_keywords_kwonly_opt($module, a, /, b, *, c, d=None, e=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_KWONLY_OPT_METHODDEF    \
    {"test_posonly_keywords_kwonly_opt", _PyCFunction_CAST(test_posonly_keywords_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_kwonly_opt__doc__},

static TyObject *
test_posonly_keywords_kwonly_opt_impl(TyObject *module, TyObject *a,
                                      TyObject *b, TyObject *c, TyObject *d,
                                      TyObject *e);

static TyObject *
test_posonly_keywords_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_kwonly_opt",
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
    return_value = test_posonly_keywords_kwonly_opt_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_kwonly_opt_impl(TyObject *module, TyObject *a,
                                      TyObject *b, TyObject *c, TyObject *d,
                                      TyObject *e)
/*[clinic end generated code: output=b7adeae40c9833a4 input=c3884a4f956fdc89]*/


/*[clinic input]
test_posonly_keywords_kwonly_opt2

    a: object
    /
    b: object
    *
    c: object = None
    d: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_kwonly_opt2__doc__,
"test_posonly_keywords_kwonly_opt2($module, a, /, b, *, c=None, d=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_KWONLY_OPT2_METHODDEF    \
    {"test_posonly_keywords_kwonly_opt2", _PyCFunction_CAST(test_posonly_keywords_kwonly_opt2), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_kwonly_opt2__doc__},

static TyObject *
test_posonly_keywords_kwonly_opt2_impl(TyObject *module, TyObject *a,
                                       TyObject *b, TyObject *c, TyObject *d);

static TyObject *
test_posonly_keywords_kwonly_opt2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_kwonly_opt2",
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
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
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
    return_value = test_posonly_keywords_kwonly_opt2_impl(module, a, b, c, d);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_kwonly_opt2_impl(TyObject *module, TyObject *a,
                                       TyObject *b, TyObject *c, TyObject *d)
/*[clinic end generated code: output=827a349e36e89c82 input=68d01d7c0f6dafb0]*/


/*[clinic input]
test_posonly_keywords_opt_kwonly_opt

    a: object
    /
    b: object
    c: object = None
    *
    d: object = None
    e: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_opt_kwonly_opt__doc__,
"test_posonly_keywords_opt_kwonly_opt($module, a, /, b, c=None, *,\n"
"                                     d=None, e=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_OPT_KWONLY_OPT_METHODDEF    \
    {"test_posonly_keywords_opt_kwonly_opt", _PyCFunction_CAST(test_posonly_keywords_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_opt_kwonly_opt__doc__},

static TyObject *
test_posonly_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                          TyObject *b, TyObject *c,
                                          TyObject *d, TyObject *e);

static TyObject *
test_posonly_keywords_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_opt_kwonly_opt",
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
    return_value = test_posonly_keywords_opt_kwonly_opt_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                          TyObject *b, TyObject *c,
                                          TyObject *d, TyObject *e)
/*[clinic end generated code: output=bcb0088555123966 input=d0883d45876f186c]*/


/*[clinic input]
test_posonly_keywords_opt2_kwonly_opt

    a: object
    /
    b: object = None
    c: object = None
    *
    d: object = None
    e: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_keywords_opt2_kwonly_opt__doc__,
"test_posonly_keywords_opt2_kwonly_opt($module, a, /, b=None, c=None, *,\n"
"                                      d=None, e=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_KEYWORDS_OPT2_KWONLY_OPT_METHODDEF    \
    {"test_posonly_keywords_opt2_kwonly_opt", _PyCFunction_CAST(test_posonly_keywords_opt2_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_keywords_opt2_kwonly_opt__doc__},

static TyObject *
test_posonly_keywords_opt2_kwonly_opt_impl(TyObject *module, TyObject *a,
                                           TyObject *b, TyObject *c,
                                           TyObject *d, TyObject *e);

static TyObject *
test_posonly_keywords_opt2_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_posonly_keywords_opt2_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;
    TyObject *e = Ty_None;

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
    return_value = test_posonly_keywords_opt2_kwonly_opt_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

static TyObject *
test_posonly_keywords_opt2_kwonly_opt_impl(TyObject *module, TyObject *a,
                                           TyObject *b, TyObject *c,
                                           TyObject *d, TyObject *e)
/*[clinic end generated code: output=a22d1276d4c2c9c7 input=c95e2e1ec93035ad]*/


/*[clinic input]
test_posonly_opt_keywords_opt_kwonly_opt

    a: object
    b: object = None
    /
    c: object = None
    d: object = None
    *
    e: object = None
    f: object = None

[clinic start generated code]*/

TyDoc_STRVAR(test_posonly_opt_keywords_opt_kwonly_opt__doc__,
"test_posonly_opt_keywords_opt_kwonly_opt($module, a, b=None, /, c=None,\n"
"                                         d=None, *, e=None, f=None)\n"
"--\n"
"\n");

#define TEST_POSONLY_OPT_KEYWORDS_OPT_KWONLY_OPT_METHODDEF    \
    {"test_posonly_opt_keywords_opt_kwonly_opt", _PyCFunction_CAST(test_posonly_opt_keywords_opt_kwonly_opt), METH_FASTCALL|METH_KEYWORDS, test_posonly_opt_keywords_opt_kwonly_opt__doc__},

static TyObject *
test_posonly_opt_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                              TyObject *b, TyObject *c,
                                              TyObject *d, TyObject *e,
                                              TyObject *f);

static TyObject *
test_posonly_opt_keywords_opt_kwonly_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), _Ty_LATIN1_CHR('f'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "c", "d", "e", "f", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "test_posonly_opt_keywords_opt_kwonly_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;
    TyObject *d = Ty_None;
    TyObject *e = Ty_None;
    TyObject *f = Ty_None;

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
    if (args[3]) {
        d = args[3];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[4]) {
        e = args[4];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    f = args[5];
skip_optional_kwonly:
    return_value = test_posonly_opt_keywords_opt_kwonly_opt_impl(module, a, b, c, d, e, f);

exit:
    return return_value;
}

static TyObject *
test_posonly_opt_keywords_opt_kwonly_opt_impl(TyObject *module, TyObject *a,
                                              TyObject *b, TyObject *c,
                                              TyObject *d, TyObject *e,
                                              TyObject *f)
/*[clinic end generated code: output=ebdbe695ee85a2ea input=9914857713c5bbf8]*/

/*[clinic input]
test_keyword_only_parameter


    *
    co_lnotab: PyBytesObject(c_default="(PyBytesObject *)self->co_lnotab") = None

[clinic start generated code]*/

TyDoc_STRVAR(test_keyword_only_parameter__doc__,
"test_keyword_only_parameter($module, /, *, co_lnotab=None)\n"
"--\n"
"\n");

#define TEST_KEYWORD_ONLY_PARAMETER_METHODDEF    \
    {"test_keyword_only_parameter", _PyCFunction_CAST(test_keyword_only_parameter), METH_FASTCALL|METH_KEYWORDS, test_keyword_only_parameter__doc__},

static TyObject *
test_keyword_only_parameter_impl(TyObject *module, PyBytesObject *co_lnotab);

static TyObject *
test_keyword_only_parameter(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(co_lnotab), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"co_lnotab", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "test_keyword_only_parameter",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    PyBytesObject *co_lnotab = (PyBytesObject *)self->co_lnotab;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!TyBytes_Check(args[0])) {
        _TyArg_BadArgument("test_keyword_only_parameter", "argument 'co_lnotab'", "bytes", args[0]);
        goto exit;
    }
    co_lnotab = (PyBytesObject *)args[0];
skip_optional_kwonly:
    return_value = test_keyword_only_parameter_impl(module, co_lnotab);

exit:
    return return_value;
}

static TyObject *
test_keyword_only_parameter_impl(TyObject *module, PyBytesObject *co_lnotab)
/*[clinic end generated code: output=bcad654ee66b0972 input=303df5046c7e37a3]*/


/*[clinic input]
output push
output preset buffer
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=5bff3376ee0df0b5]*/

#ifdef CONDITION_A
/*[clinic input]
test_preprocessor_guarded_condition_a
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_condition_a_impl(TyObject *module)
/*[clinic end generated code: output=ad012af18085add6 input=8edb8706a98cda7e]*/
#elif CONDITION_B
/*[clinic input]
test_preprocessor_guarded_elif_condition_b
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_elif_condition_b_impl(TyObject *module)
/*[clinic end generated code: output=615f2dee82b138d1 input=53777cebbf7fee32]*/
#else
/*[clinic input]
test_preprocessor_guarded_else
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_else_impl(TyObject *module)
/*[clinic end generated code: output=13af7670aac51b12 input=6657ab31d74c29fc]*/
#endif

#ifndef CONDITION_C
/*[clinic input]
test_preprocessor_guarded_ifndef_condition_c
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_ifndef_condition_c_impl(TyObject *module)
/*[clinic end generated code: output=ed422e8c895bb0a5 input=e9b50491cea2b668]*/
#else
/*[clinic input]
test_preprocessor_guarded_ifndef_not_condition_c
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_ifndef_not_condition_c_impl(TyObject *module)
/*[clinic end generated code: output=de6f4c6a67f8c536 input=da74e30e01c6f2c5]*/
#endif

#if \
CONDITION_D
/*[clinic input]
test_preprocessor_guarded_if_with_continuation
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_if_with_continuation_impl(TyObject *module)
/*[clinic end generated code: output=3d0712ca9e2d15b9 input=4a956fd91be30284]*/
#endif

#if CONDITION_E || CONDITION_F
#warning "different type of CPP directive"
/*[clinic input]
test_preprocessor_guarded_if_e_or_f
Makes sure cpp.Monitor handles other directives than preprocessor conditionals.
[clinic start generated code]*/

static TyObject *
test_preprocessor_guarded_if_e_or_f_impl(TyObject *module)
/*[clinic end generated code: output=e49d24ff64ad88bc input=57b9c37f938bc4f1]*/
#endif

/*[clinic input]
dump buffer
output pop
[clinic start generated code]*/

#if defined(CONDITION_A)

TyDoc_STRVAR(test_preprocessor_guarded_condition_a__doc__,
"test_preprocessor_guarded_condition_a($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_CONDITION_A_METHODDEF    \
    {"test_preprocessor_guarded_condition_a", (PyCFunction)test_preprocessor_guarded_condition_a, METH_NOARGS, test_preprocessor_guarded_condition_a__doc__},

static TyObject *
test_preprocessor_guarded_condition_a(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_condition_a_impl(module);
}

#endif /* defined(CONDITION_A) */

#if !defined(CONDITION_A) && (CONDITION_B)

TyDoc_STRVAR(test_preprocessor_guarded_elif_condition_b__doc__,
"test_preprocessor_guarded_elif_condition_b($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_ELIF_CONDITION_B_METHODDEF    \
    {"test_preprocessor_guarded_elif_condition_b", (PyCFunction)test_preprocessor_guarded_elif_condition_b, METH_NOARGS, test_preprocessor_guarded_elif_condition_b__doc__},

static TyObject *
test_preprocessor_guarded_elif_condition_b(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_elif_condition_b_impl(module);
}

#endif /* !defined(CONDITION_A) && (CONDITION_B) */

#if !defined(CONDITION_A) && !(CONDITION_B)

TyDoc_STRVAR(test_preprocessor_guarded_else__doc__,
"test_preprocessor_guarded_else($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_ELSE_METHODDEF    \
    {"test_preprocessor_guarded_else", (PyCFunction)test_preprocessor_guarded_else, METH_NOARGS, test_preprocessor_guarded_else__doc__},

static TyObject *
test_preprocessor_guarded_else(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_else_impl(module);
}

#endif /* !defined(CONDITION_A) && !(CONDITION_B) */

#if !defined(CONDITION_C)

TyDoc_STRVAR(test_preprocessor_guarded_ifndef_condition_c__doc__,
"test_preprocessor_guarded_ifndef_condition_c($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_IFNDEF_CONDITION_C_METHODDEF    \
    {"test_preprocessor_guarded_ifndef_condition_c", (PyCFunction)test_preprocessor_guarded_ifndef_condition_c, METH_NOARGS, test_preprocessor_guarded_ifndef_condition_c__doc__},

static TyObject *
test_preprocessor_guarded_ifndef_condition_c(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_ifndef_condition_c_impl(module);
}

#endif /* !defined(CONDITION_C) */

#if defined(CONDITION_C)

TyDoc_STRVAR(test_preprocessor_guarded_ifndef_not_condition_c__doc__,
"test_preprocessor_guarded_ifndef_not_condition_c($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_IFNDEF_NOT_CONDITION_C_METHODDEF    \
    {"test_preprocessor_guarded_ifndef_not_condition_c", (PyCFunction)test_preprocessor_guarded_ifndef_not_condition_c, METH_NOARGS, test_preprocessor_guarded_ifndef_not_condition_c__doc__},

static TyObject *
test_preprocessor_guarded_ifndef_not_condition_c(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_ifndef_not_condition_c_impl(module);
}

#endif /* defined(CONDITION_C) */

#if (CONDITION_D)

TyDoc_STRVAR(test_preprocessor_guarded_if_with_continuation__doc__,
"test_preprocessor_guarded_if_with_continuation($module, /)\n"
"--\n"
"\n");

#define TEST_PREPROCESSOR_GUARDED_IF_WITH_CONTINUATION_METHODDEF    \
    {"test_preprocessor_guarded_if_with_continuation", (PyCFunction)test_preprocessor_guarded_if_with_continuation, METH_NOARGS, test_preprocessor_guarded_if_with_continuation__doc__},

static TyObject *
test_preprocessor_guarded_if_with_continuation(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_if_with_continuation_impl(module);
}

#endif /* (CONDITION_D) */

#if (CONDITION_E || CONDITION_F)

TyDoc_STRVAR(test_preprocessor_guarded_if_e_or_f__doc__,
"test_preprocessor_guarded_if_e_or_f($module, /)\n"
"--\n"
"\n"
"Makes sure cpp.Monitor handles other directives than preprocessor conditionals.");

#define TEST_PREPROCESSOR_GUARDED_IF_E_OR_F_METHODDEF    \
    {"test_preprocessor_guarded_if_e_or_f", (PyCFunction)test_preprocessor_guarded_if_e_or_f, METH_NOARGS, test_preprocessor_guarded_if_e_or_f__doc__},

static TyObject *
test_preprocessor_guarded_if_e_or_f(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return test_preprocessor_guarded_if_e_or_f_impl(module);
}

#endif /* (CONDITION_E || CONDITION_F) */

#ifndef TEST_PREPROCESSOR_GUARDED_CONDITION_A_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_CONDITION_A_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_CONDITION_A_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_ELIF_CONDITION_B_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_ELIF_CONDITION_B_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_ELIF_CONDITION_B_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_ELSE_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_ELSE_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_ELSE_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_IFNDEF_CONDITION_C_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_IFNDEF_CONDITION_C_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_IFNDEF_CONDITION_C_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_IFNDEF_NOT_CONDITION_C_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_IFNDEF_NOT_CONDITION_C_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_IFNDEF_NOT_CONDITION_C_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_IF_WITH_CONTINUATION_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_IF_WITH_CONTINUATION_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_IF_WITH_CONTINUATION_METHODDEF) */

#ifndef TEST_PREPROCESSOR_GUARDED_IF_E_OR_F_METHODDEF
    #define TEST_PREPROCESSOR_GUARDED_IF_E_OR_F_METHODDEF
#endif /* !defined(TEST_PREPROCESSOR_GUARDED_IF_E_OR_F_METHODDEF) */
/*[clinic end generated code: output=fcfae7cac7a99e62 input=3fc80c9989d2f2e1]*/

/*[clinic input]
test_vararg_and_posonly


    a: object
    /
    *args: tuple

[clinic start generated code]*/

TyDoc_STRVAR(test_vararg_and_posonly__doc__,
"test_vararg_and_posonly($module, a, /, *args)\n"
"--\n"
"\n");

#define TEST_VARARG_AND_POSONLY_METHODDEF    \
    {"test_vararg_and_posonly", _PyCFunction_CAST(test_vararg_and_posonly), METH_FASTCALL, test_vararg_and_posonly__doc__},

static TyObject *
test_vararg_and_posonly_impl(TyObject *module, TyObject *a, TyObject *args);

static TyObject *
test_vararg_and_posonly(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *__clinic_args = NULL;

    if (!_TyArg_CheckPositional("test_vararg_and_posonly", nargs, 1, PY_SSIZE_T_MAX)) {
        goto exit;
    }
    a = args[0];
    __clinic_args = _TyTuple_FromArray(args + 1, nargs - 1);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = test_vararg_and_posonly_impl(module, a, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static TyObject *
test_vararg_and_posonly_impl(TyObject *module, TyObject *a, TyObject *args)
/*[clinic end generated code: output=0c11c475e240869e input=2c49a482f68545c0]*/

/*[clinic input]
test_vararg


    a: object
    *args: tuple

[clinic start generated code]*/

TyDoc_STRVAR(test_vararg__doc__,
"test_vararg($module, /, a, *args)\n"
"--\n"
"\n");

#define TEST_VARARG_METHODDEF    \
    {"test_vararg", _PyCFunction_CAST(test_vararg), METH_FASTCALL|METH_KEYWORDS, test_vararg__doc__},

static TyObject *
test_vararg_impl(TyObject *module, TyObject *a, TyObject *args);

static TyObject *
test_vararg(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_vararg",
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
    return_value = test_vararg_impl(module, a, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static TyObject *
test_vararg_impl(TyObject *module, TyObject *a, TyObject *args)
/*[clinic end generated code: output=17ba625cdd0369c1 input=7448995636d9186a]*/

/*[clinic input]
test_vararg_with_default


    a: object
    *args: tuple
    b: bool = False

[clinic start generated code]*/

TyDoc_STRVAR(test_vararg_with_default__doc__,
"test_vararg_with_default($module, /, a, *args, b=False)\n"
"--\n"
"\n");

#define TEST_VARARG_WITH_DEFAULT_METHODDEF    \
    {"test_vararg_with_default", _PyCFunction_CAST(test_vararg_with_default), METH_FASTCALL|METH_KEYWORDS, test_vararg_with_default__doc__},

static TyObject *
test_vararg_with_default_impl(TyObject *module, TyObject *a, TyObject *args,
                              int b);

static TyObject *
test_vararg_with_default(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "test_vararg_with_default",
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
    return_value = test_vararg_with_default_impl(module, a, __clinic_args, b);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static TyObject *
test_vararg_with_default_impl(TyObject *module, TyObject *a, TyObject *args,
                              int b)
/*[clinic end generated code: output=3f2b06ab08d5d0be input=3a0f9f557ce1f712]*/

/*[clinic input]
test_vararg_with_only_defaults


    *args: tuple
    b: bool = False
    c: object = ' '

[clinic start generated code]*/

TyDoc_STRVAR(test_vararg_with_only_defaults__doc__,
"test_vararg_with_only_defaults($module, /, *args, b=False, c=\' \')\n"
"--\n"
"\n");

#define TEST_VARARG_WITH_ONLY_DEFAULTS_METHODDEF    \
    {"test_vararg_with_only_defaults", _PyCFunction_CAST(test_vararg_with_only_defaults), METH_FASTCALL|METH_KEYWORDS, test_vararg_with_only_defaults__doc__},

static TyObject *
test_vararg_with_only_defaults_impl(TyObject *module, TyObject *args, int b,
                                    TyObject *c);

static TyObject *
test_vararg_with_only_defaults(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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

    static const char * const _keywords[] = {"b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "test_vararg_with_only_defaults",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t noptargs = 0 + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *__clinic_args = NULL;
    int b = 0;
    TyObject *c = " ";

    fastargs = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[0]) {
        b = PyObject_IsTrue(fastargs[0]);
        if (b < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    c = fastargs[1];
skip_optional_kwonly:
    __clinic_args = _TyTuple_FromArray(args, nargs);
    if (__clinic_args == NULL) {
        goto exit;
    }
    return_value = test_vararg_with_only_defaults_impl(module, __clinic_args, b, c);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static TyObject *
test_vararg_with_only_defaults_impl(TyObject *module, TyObject *args, int b,
                                    TyObject *c)
/*[clinic end generated code: output=f46666f0b1bf86b9 input=6983e66817f82924]*/

/*[clinic input]
test_paramname_module

    module as mod: object
[clinic start generated code]*/

TyDoc_STRVAR(test_paramname_module__doc__,
"test_paramname_module($module, /, module)\n"
"--\n"
"\n");

#define TEST_PARAMNAME_MODULE_METHODDEF    \
    {"test_paramname_module", _PyCFunction_CAST(test_paramname_module), METH_FASTCALL|METH_KEYWORDS, test_paramname_module__doc__},

static TyObject *
test_paramname_module_impl(TyObject *module, TyObject *mod);

static TyObject *
test_paramname_module(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(module), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"module", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "test_paramname_module",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *mod;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    mod = args[0];
    return_value = test_paramname_module_impl(module, mod);

exit:
    return return_value;
}

static TyObject *
test_paramname_module_impl(TyObject *module, TyObject *mod)
/*[clinic end generated code: output=b979bb1c03b16911 input=afefe259667f13ba]*/

/*[clinic input]
mangle1

    args: object
    kwnames: object
    return_value: object
    _keywords: object
    _parser: object
    argsbuf: object
    fastargs: object
    nargs: object
    noptargs: object

[clinic start generated code]*/

TyDoc_STRVAR(mangle1__doc__,
"mangle1($module, /, args, kwnames, return_value, _keywords, _parser,\n"
"        argsbuf, fastargs, nargs, noptargs)\n"
"--\n"
"\n");

#define MANGLE1_METHODDEF    \
    {"mangle1", _PyCFunction_CAST(mangle1), METH_FASTCALL|METH_KEYWORDS, mangle1__doc__},

static TyObject *
mangle1_impl(TyObject *module, TyObject *args, TyObject *kwnames,
             TyObject *return_value, TyObject *_keywords, TyObject *_parser,
             TyObject *argsbuf, TyObject *fastargs, TyObject *nargs,
             TyObject *noptargs);

static TyObject *
mangle1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 9
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(args), &_Ty_ID(kwnames), &_Ty_ID(return_value), &_Ty_ID(_keywords), &_Ty_ID(_parser), &_Ty_ID(argsbuf), &_Ty_ID(fastargs), &_Ty_ID(nargs), &_Ty_ID(noptargs), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"args", "kwnames", "return_value", "_keywords", "_parser", "argsbuf", "fastargs", "nargs", "noptargs", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mangle1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[9];
    TyObject *__clinic_args;
    TyObject *__clinic_kwnames;
    TyObject *__clinic_return_value;
    TyObject *__clinic__keywords;
    TyObject *__clinic__parser;
    TyObject *__clinic_argsbuf;
    TyObject *__clinic_fastargs;
    TyObject *__clinic_nargs;
    TyObject *__clinic_noptargs;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 9, /*maxpos*/ 9, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    __clinic_args = args[0];
    __clinic_kwnames = args[1];
    __clinic_return_value = args[2];
    __clinic__keywords = args[3];
    __clinic__parser = args[4];
    __clinic_argsbuf = args[5];
    __clinic_fastargs = args[6];
    __clinic_nargs = args[7];
    __clinic_noptargs = args[8];
    return_value = mangle1_impl(module, __clinic_args, __clinic_kwnames, __clinic_return_value, __clinic__keywords, __clinic__parser, __clinic_argsbuf, __clinic_fastargs, __clinic_nargs, __clinic_noptargs);

exit:
    return return_value;
}

static TyObject *
mangle1_impl(TyObject *module, TyObject *args, TyObject *kwnames,
             TyObject *return_value, TyObject *_keywords, TyObject *_parser,
             TyObject *argsbuf, TyObject *fastargs, TyObject *nargs,
             TyObject *noptargs)
/*[clinic end generated code: output=8993a3111845dfc3 input=a3ed51bdedf8a3c7]*/

/*[clinic input]
mangle2

    args: object
    kwargs: object
    return_value: object

[clinic start generated code]*/

TyDoc_STRVAR(mangle2__doc__,
"mangle2($module, /, args, kwargs, return_value)\n"
"--\n"
"\n");

#define MANGLE2_METHODDEF    \
    {"mangle2", _PyCFunction_CAST(mangle2), METH_FASTCALL|METH_KEYWORDS, mangle2__doc__},

static TyObject *
mangle2_impl(TyObject *module, TyObject *args, TyObject *kwargs,
             TyObject *return_value);

static TyObject *
mangle2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(args), &_Ty_ID(kwargs), &_Ty_ID(return_value), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"args", "kwargs", "return_value", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mangle2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject *__clinic_args;
    TyObject *__clinic_kwargs;
    TyObject *__clinic_return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    __clinic_args = args[0];
    __clinic_kwargs = args[1];
    __clinic_return_value = args[2];
    return_value = mangle2_impl(module, __clinic_args, __clinic_kwargs, __clinic_return_value);

exit:
    return return_value;
}

static TyObject *
mangle2_impl(TyObject *module, TyObject *args, TyObject *kwargs,
             TyObject *return_value)
/*[clinic end generated code: output=bbbe696e52e0267f input=391766fee51bad7a]*/


/*[clinic input]
Test.cls_with_param
    cls: defining_class
    /
    a: int
[clinic start generated code]*/

TyDoc_STRVAR(Test_cls_with_param__doc__,
"cls_with_param($self, /, a)\n"
"--\n"
"\n");

#define TEST_CLS_WITH_PARAM_METHODDEF    \
    {"cls_with_param", _PyCFunction_CAST(Test_cls_with_param), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, Test_cls_with_param__doc__},

static TyObject *
Test_cls_with_param_impl(TestObj *self, TyTypeObject *cls, int a);

static TyObject *
Test_cls_with_param(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "cls_with_param",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int a;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = TyLong_AsInt(args[0]);
    if (a == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = Test_cls_with_param_impl((TestObj *)self, cls, a);

exit:
    return return_value;
}

static TyObject *
Test_cls_with_param_impl(TestObj *self, TyTypeObject *cls, int a)
/*[clinic end generated code: output=bd3883003f57d02b input=af158077bd237ef9]*/


/*[clinic input]
Test.__init__
Empty init method.
[clinic start generated code]*/

TyDoc_STRVAR(Test___init____doc__,
"Test()\n"
"--\n"
"\n"
"Empty init method.");

static int
Test___init___impl(TestObj *self);

static int
Test___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    TyTypeObject *base_tp = TestType;

    if ((Ty_IS_TYPE(self, base_tp) ||
         Ty_TYPE(self)->tp_new == base_tp->tp_new) &&
        !_TyArg_NoPositional("Test", args)) {
        goto exit;
    }
    if ((Ty_IS_TYPE(self, base_tp) ||
         Ty_TYPE(self)->tp_new == base_tp->tp_new) &&
        !_TyArg_NoKeywords("Test", kwargs)) {
        goto exit;
    }
    return_value = Test___init___impl((TestObj *)self);

exit:
    return return_value;
}

static int
Test___init___impl(TestObj *self)
/*[clinic end generated code: output=f6a35c85bc5b408f input=4ea79fee54d0c3ff]*/


/*[clinic input]
@classmethod
Test.__new__
Empty new method.
[clinic start generated code]*/

TyDoc_STRVAR(Test__doc__,
"Test()\n"
"--\n"
"\n"
"Empty new method.");

static TyObject *
Test_impl(TyTypeObject *type);

static TyObject *
Test(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = TestType;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoPositional("Test", args)) {
        goto exit;
    }
    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("Test", kwargs)) {
        goto exit;
    }
    return_value = Test_impl(type);

exit:
    return return_value;
}

static TyObject *
Test_impl(TyTypeObject *type)
/*[clinic end generated code: output=68a117adc057940f input=6fe98a19f097907f]*/


/*[clinic input]
Test.cls_no_params
    cls: defining_class
    /
[clinic start generated code]*/

TyDoc_STRVAR(Test_cls_no_params__doc__,
"cls_no_params($self, /)\n"
"--\n"
"\n");

#define TEST_CLS_NO_PARAMS_METHODDEF    \
    {"cls_no_params", _PyCFunction_CAST(Test_cls_no_params), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, Test_cls_no_params__doc__},

static TyObject *
Test_cls_no_params_impl(TestObj *self, TyTypeObject *cls);

static TyObject *
Test_cls_no_params(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "cls_no_params() takes no arguments");
        return NULL;
    }
    return Test_cls_no_params_impl((TestObj *)self, cls);
}

static TyObject *
Test_cls_no_params_impl(TestObj *self, TyTypeObject *cls)
/*[clinic end generated code: output=8845de054449f40a input=e7e2e4e344e96a11]*/


/*[clinic input]
Test.metho_not_default_return_converter -> int
    a: object
    /
[clinic start generated code]*/

TyDoc_STRVAR(Test_metho_not_default_return_converter__doc__,
"metho_not_default_return_converter($self, a, /)\n"
"--\n"
"\n");

#define TEST_METHO_NOT_DEFAULT_RETURN_CONVERTER_METHODDEF    \
    {"metho_not_default_return_converter", (PyCFunction)Test_metho_not_default_return_converter, METH_O, Test_metho_not_default_return_converter__doc__},

static int
Test_metho_not_default_return_converter_impl(TestObj *self, TyObject *a);

static TyObject *
Test_metho_not_default_return_converter(TyObject *self, TyObject *a)
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = Test_metho_not_default_return_converter_impl((TestObj *)self, a);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

static int
Test_metho_not_default_return_converter_impl(TestObj *self, TyObject *a)
/*[clinic end generated code: output=8b03f5213c312138 input=428657129b521177]*/


/*[clinic input]
Test.an_metho_arg_named_arg
    arg: int
        Name should be mangled to 'arg_' in generated output.
    /
[clinic start generated code]*/

TyDoc_STRVAR(Test_an_metho_arg_named_arg__doc__,
"an_metho_arg_named_arg($self, arg, /)\n"
"--\n"
"\n"
"\n"
"\n"
"  arg\n"
"    Name should be mangled to \'arg_\' in generated output.");

#define TEST_AN_METHO_ARG_NAMED_ARG_METHODDEF    \
    {"an_metho_arg_named_arg", (PyCFunction)Test_an_metho_arg_named_arg, METH_O, Test_an_metho_arg_named_arg__doc__},

static TyObject *
Test_an_metho_arg_named_arg_impl(TestObj *self, int arg);

static TyObject *
Test_an_metho_arg_named_arg(TyObject *self, TyObject *arg_)
{
    TyObject *return_value = NULL;
    int arg;

    arg = TyLong_AsInt(arg_);
    if (arg == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = Test_an_metho_arg_named_arg_impl((TestObj *)self, arg);

exit:
    return return_value;
}

static TyObject *
Test_an_metho_arg_named_arg_impl(TestObj *self, int arg)
/*[clinic end generated code: output=38554f09950d07e7 input=2a53a57cf5624f95]*/


/*[clinic input]
Test.__init__
    *args: tuple

Varargs init method. For example, nargs is translated to TyTuple_GET_SIZE.
[clinic start generated code]*/

TyDoc_STRVAR(Test___init____doc__,
"Test(*args)\n"
"--\n"
"\n"
"Varargs init method. For example, nargs is translated to TyTuple_GET_SIZE.");

static int
Test___init___impl(TestObj *self, TyObject *args);

static int
Test___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    TyTypeObject *base_tp = TestType;
    TyObject *__clinic_args = NULL;

    if ((Ty_IS_TYPE(self, base_tp) ||
         Ty_TYPE(self)->tp_new == base_tp->tp_new) &&
        !_TyArg_NoKeywords("Test", kwargs)) {
        goto exit;
    }
    __clinic_args = Ty_NewRef(args);
    return_value = Test___init___impl((TestObj *)self, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static int
Test___init___impl(TestObj *self, TyObject *args)
/*[clinic end generated code: output=f172425cec373cd6 input=4b8388c4e6baab6f]*/

/*[clinic input]
@classmethod
Test.__new__
    *args: tuple

Varargs new method. For example, nargs is translated to TyTuple_GET_SIZE.
[clinic start generated code]*/

TyDoc_STRVAR(Test__doc__,
"Test(*args)\n"
"--\n"
"\n"
"Varargs new method. For example, nargs is translated to TyTuple_GET_SIZE.");

static TyObject *
Test_impl(TyTypeObject *type, TyObject *args);

static TyObject *
Test(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = TestType;
    TyObject *__clinic_args = NULL;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("Test", kwargs)) {
        goto exit;
    }
    __clinic_args = Ty_NewRef(args);
    return_value = Test_impl(type, __clinic_args);

exit:
    /* Cleanup for args */
    Ty_XDECREF(__clinic_args);

    return return_value;
}

static TyObject *
Test_impl(TyTypeObject *type, TyObject *args)
/*[clinic end generated code: output=ee1e8892a67abd4a input=a8259521129cad20]*/


/*[clinic input]
Test.__init__
    a: object
Init method with positional or keyword arguments.
[clinic start generated code]*/

TyDoc_STRVAR(Test___init____doc__,
"Test(a)\n"
"--\n"
"\n"
"Init method with positional or keyword arguments.");

static int
Test___init___impl(TestObj *self, TyObject *a);

static int
Test___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .fname = "Test",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *a;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    a = fastargs[0];
    return_value = Test___init___impl((TestObj *)self, a);

exit:
    return return_value;
}

static int
Test___init___impl(TestObj *self, TyObject *a)
/*[clinic end generated code: output=5c1e743f6a2a0b8b input=a8f9222a6ab35c59]*/


/*[clinic input]
@classmethod
Test.class_method
[clinic start generated code]*/

TyDoc_STRVAR(Test_class_method__doc__,
"class_method($type, /)\n"
"--\n"
"\n");

#define TEST_CLASS_METHOD_METHODDEF    \
    {"class_method", (PyCFunction)Test_class_method, METH_NOARGS|METH_CLASS, Test_class_method__doc__},

static TyObject *
Test_class_method_impl(TyTypeObject *type);

static TyObject *
Test_class_method(TyObject *type, TyObject *Py_UNUSED(ignored))
{
    return Test_class_method_impl((TyTypeObject *)type);
}

static TyObject *
Test_class_method_impl(TyTypeObject *type)
/*[clinic end generated code: output=64f93e6252bde409 input=43bc4a0494547b80]*/


/*[clinic input]
@staticmethod
Test.static_method
[clinic start generated code]*/

TyDoc_STRVAR(Test_static_method__doc__,
"static_method()\n"
"--\n"
"\n");

#define TEST_STATIC_METHOD_METHODDEF    \
    {"static_method", (PyCFunction)Test_static_method, METH_NOARGS|METH_STATIC, Test_static_method__doc__},

static TyObject *
Test_static_method_impl();

static TyObject *
Test_static_method(TyObject *null, TyObject *Py_UNUSED(ignored))
{
    return Test_static_method_impl();
}

static TyObject *
Test_static_method_impl()
/*[clinic end generated code: output=9e401fb6ed56a4f3 input=dae892fac55ae72b]*/


/*[clinic input]
@coexist
Test.meth_coexist
[clinic start generated code]*/

TyDoc_STRVAR(Test_meth_coexist__doc__,
"meth_coexist($self, /)\n"
"--\n"
"\n");

#define TEST_METH_COEXIST_METHODDEF    \
    {"meth_coexist", (PyCFunction)Test_meth_coexist, METH_NOARGS|METH_COEXIST, Test_meth_coexist__doc__},

static TyObject *
Test_meth_coexist_impl(TestObj *self);

static TyObject *
Test_meth_coexist(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return Test_meth_coexist_impl((TestObj *)self);
}

static TyObject *
Test_meth_coexist_impl(TestObj *self)
/*[clinic end generated code: output=7edf4e95b29f06fa input=2a1d75b5e6fec6dd]*/

/*[clinic input]
@getter
Test.property
[clinic start generated code]*/

#if !defined(Test_property_DOCSTR)
#  define Test_property_DOCSTR NULL
#endif
#if defined(TEST_PROPERTY_GETSETDEF)
#  undef TEST_PROPERTY_GETSETDEF
#  define TEST_PROPERTY_GETSETDEF {"property", (getter)Test_property_get, (setter)Test_property_set, Test_property_DOCSTR},
#else
#  define TEST_PROPERTY_GETSETDEF {"property", (getter)Test_property_get, NULL, Test_property_DOCSTR},
#endif

static TyObject *
Test_property_get_impl(TestObj *self);

static TyObject *
Test_property_get(TyObject *self, void *Py_UNUSED(context))
{
    return Test_property_get_impl((TestObj *)self);
}

static TyObject *
Test_property_get_impl(TestObj *self)
/*[clinic end generated code: output=b38d68abd3466a6e input=2d92b3449fbc7d2b]*/

/*[clinic input]
@setter
Test.property
[clinic start generated code]*/

#if !defined(Test_property_DOCSTR)
#  define Test_property_DOCSTR NULL
#endif
#if defined(TEST_PROPERTY_GETSETDEF)
#  undef TEST_PROPERTY_GETSETDEF
#  define TEST_PROPERTY_GETSETDEF {"property", (getter)Test_property_get, (setter)Test_property_set, Test_property_DOCSTR},
#else
#  define TEST_PROPERTY_GETSETDEF {"property", NULL, (setter)Test_property_set, NULL},
#endif

static int
Test_property_set_impl(TestObj *self, TyObject *value);

static int
Test_property_set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    return_value = Test_property_set_impl((TestObj *)self, value);

    return return_value;
}

static int
Test_property_set_impl(TestObj *self, TyObject *value)
/*[clinic end generated code: output=49f925ab2a33b637 input=3bc3f46a23c83a88]*/

/*[clinic input]
@setter
Test.setter_first_with_docstr
[clinic start generated code]*/

#if !defined(Test_setter_first_with_docstr_DOCSTR)
#  define Test_setter_first_with_docstr_DOCSTR NULL
#endif
#if defined(TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF)
#  undef TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF
#  define TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF {"setter_first_with_docstr", (getter)Test_setter_first_with_docstr_get, (setter)Test_setter_first_with_docstr_set, Test_setter_first_with_docstr_DOCSTR},
#else
#  define TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF {"setter_first_with_docstr", NULL, (setter)Test_setter_first_with_docstr_set, NULL},
#endif

static int
Test_setter_first_with_docstr_set_impl(TestObj *self, TyObject *value);

static int
Test_setter_first_with_docstr_set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    return_value = Test_setter_first_with_docstr_set_impl((TestObj *)self, value);

    return return_value;
}

static int
Test_setter_first_with_docstr_set_impl(TestObj *self, TyObject *value)
/*[clinic end generated code: output=5aaf44373c0af545 input=31a045ce11bbe961]*/

/*[clinic input]
@getter
Test.setter_first_with_docstr

my silly docstring
[clinic start generated code]*/

TyDoc_STRVAR(Test_setter_first_with_docstr__doc__,
"my silly docstring");
#if defined(Test_setter_first_with_docstr_DOCSTR)
#   undef Test_setter_first_with_docstr_DOCSTR
#endif
#define Test_setter_first_with_docstr_DOCSTR Test_setter_first_with_docstr__doc__

#if !defined(Test_setter_first_with_docstr_DOCSTR)
#  define Test_setter_first_with_docstr_DOCSTR NULL
#endif
#if defined(TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF)
#  undef TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF
#  define TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF {"setter_first_with_docstr", (getter)Test_setter_first_with_docstr_get, (setter)Test_setter_first_with_docstr_set, Test_setter_first_with_docstr_DOCSTR},
#else
#  define TEST_SETTER_FIRST_WITH_DOCSTR_GETSETDEF {"setter_first_with_docstr", (getter)Test_setter_first_with_docstr_get, NULL, Test_setter_first_with_docstr_DOCSTR},
#endif

static TyObject *
Test_setter_first_with_docstr_get_impl(TestObj *self);

static TyObject *
Test_setter_first_with_docstr_get(TyObject *self, void *Py_UNUSED(context))
{
    return Test_setter_first_with_docstr_get_impl((TestObj *)self);
}

static TyObject *
Test_setter_first_with_docstr_get_impl(TestObj *self)
/*[clinic end generated code: output=fe6e3aa844a24920 input=10af4e43b3cb34dc]*/

/*[clinic input]
output push
output preset buffer
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=5bff3376ee0df0b5]*/

/*[clinic input]
buffer_clear
  a: int
We'll call 'destination buffer clear' after this.

Argument Clinic's buffer preset puts most generated code into the
'buffer' destination, except from 'impl_definition', which is put into
the 'block' destination, so we should expect everything but
'impl_definition' to be cleared.
[clinic start generated code]*/

static TyObject *
buffer_clear_impl(TyObject *module, int a)
/*[clinic end generated code: output=f14bba74677e1846 input=a4c308a6fdab043c]*/

/*[clinic input]
destination buffer clear
output pop
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=f20d06adb8252084]*/


/*[clinic input]
output push
destination test1 new buffer
output everything suppress
output docstring_definition test1
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=5a77c454970992fc]*/

/*[clinic input]
new_dest
  a: int
Only this docstring should be outputted to test1.
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=da5af421ed8996ed]*/

/*[clinic input]
dump test1
output pop
[clinic start generated code]*/

TyDoc_STRVAR(new_dest__doc__,
"new_dest($module, /, a)\n"
"--\n"
"\n"
"Only this docstring should be outputted to test1.");
/*[clinic end generated code: output=9cac703f51d90e84 input=090db8df4945576d]*/


/*[clinic input]
mangled_c_keyword_identifier
    i as int: int
The 'int' param should be mangled as 'int_value'
[clinic start generated code]*/

TyDoc_STRVAR(mangled_c_keyword_identifier__doc__,
"mangled_c_keyword_identifier($module, /, i)\n"
"--\n"
"\n"
"The \'int\' param should be mangled as \'int_value\'");

#define MANGLED_C_KEYWORD_IDENTIFIER_METHODDEF    \
    {"mangled_c_keyword_identifier", _PyCFunction_CAST(mangled_c_keyword_identifier), METH_FASTCALL|METH_KEYWORDS, mangled_c_keyword_identifier__doc__},

static TyObject *
mangled_c_keyword_identifier_impl(TyObject *module, int int_value);

static TyObject *
mangled_c_keyword_identifier(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('i'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"i", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mangled_c_keyword_identifier",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int int_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    int_value = TyLong_AsInt(args[0]);
    if (int_value == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = mangled_c_keyword_identifier_impl(module, int_value);

exit:
    return return_value;
}

static TyObject *
mangled_c_keyword_identifier_impl(TyObject *module, int int_value)
/*[clinic end generated code: output=49365b3b96b23980 input=060876448ab567a2]*/


/*[clinic input]
bool_return -> bool
[clinic start generated code]*/

TyDoc_STRVAR(bool_return__doc__,
"bool_return($module, /)\n"
"--\n"
"\n");

#define BOOL_RETURN_METHODDEF    \
    {"bool_return", (PyCFunction)bool_return, METH_NOARGS, bool_return__doc__},

static int
bool_return_impl(TyObject *module);

static TyObject *
bool_return(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = bool_return_impl(module);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

static int
bool_return_impl(TyObject *module)
/*[clinic end generated code: output=3a65f07830e48e98 input=93ba95d39ee98f39]*/


/*[clinic input]
double_return -> double
[clinic start generated code]*/

TyDoc_STRVAR(double_return__doc__,
"double_return($module, /)\n"
"--\n"
"\n");

#define DOUBLE_RETURN_METHODDEF    \
    {"double_return", (PyCFunction)double_return, METH_NOARGS, double_return__doc__},

static double
double_return_impl(TyObject *module);

static TyObject *
double_return(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    double _return_value;

    _return_value = double_return_impl(module);
    if ((_return_value == -1.0) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyFloat_FromDouble(_return_value);

exit:
    return return_value;
}

static double
double_return_impl(TyObject *module)
/*[clinic end generated code: output=076dc72595d3f66d input=da11b6255e4cbfd7]*/


/*[clinic input]
Test.__init__
    a: object
    [
    b: object
    ]
    /
Should generate two PyArg_ParseTuple calls.
[clinic start generated code]*/

TyDoc_STRVAR(Test___init____doc__,
"Test(a, [b])\n"
"Should generate two PyArg_ParseTuple calls.");

static int
Test___init___impl(TestObj *self, TyObject *a, int group_right_1,
                   TyObject *b);

static int
Test___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    TyTypeObject *base_tp = TestType;
    TyObject *a;
    int group_right_1 = 0;
    TyObject *b = NULL;

    if ((Ty_IS_TYPE(self, base_tp) ||
         Ty_TYPE(self)->tp_new == base_tp->tp_new) &&
        !_TyArg_NoKeywords("Test", kwargs)) {
        goto exit;
    }
    switch (TyTuple_GET_SIZE(args)) {
        case 1:
            if (!PyArg_ParseTuple(args, "O:__init__", &a)) {
                goto exit;
            }
            break;
        case 2:
            if (!PyArg_ParseTuple(args, "OO:__init__", &a, &b)) {
                goto exit;
            }
            group_right_1 = 1;
            break;
        default:
            TyErr_SetString(TyExc_TypeError, "Test.__init__ requires 1 to 2 arguments");
            goto exit;
    }
    return_value = Test___init___impl((TestObj *)self, a, group_right_1, b);

exit:
    return return_value;
}

static int
Test___init___impl(TestObj *self, TyObject *a, int group_right_1,
                   TyObject *b)
/*[clinic end generated code: output=2bbb8ea60e8f57a6 input=10f5d0f1e8e466ef]*/


/*[clinic input]
Test._pyarg_parsestackandkeywords
    cls: defining_class
    key: str(accept={str, robuffer}, zeroes=True)
    /
Check that _TyArg_ParseStackAndKeywords() is generated.
[clinic start generated code]*/

TyDoc_STRVAR(Test__pyarg_parsestackandkeywords__doc__,
"_pyarg_parsestackandkeywords($self, key, /)\n"
"--\n"
"\n"
"Check that _TyArg_ParseStackAndKeywords() is generated.");

#define TEST__PYARG_PARSESTACKANDKEYWORDS_METHODDEF    \
    {"_pyarg_parsestackandkeywords", _PyCFunction_CAST(Test__pyarg_parsestackandkeywords), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, Test__pyarg_parsestackandkeywords__doc__},

static TyObject *
Test__pyarg_parsestackandkeywords_impl(TestObj *self, TyTypeObject *cls,
                                       const char *key,
                                       Ty_ssize_t key_length);

static TyObject *
Test__pyarg_parsestackandkeywords(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "s#:_pyarg_parsestackandkeywords",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    const char *key;
    Ty_ssize_t key_length;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &key, &key_length)) {
        goto exit;
    }
    return_value = Test__pyarg_parsestackandkeywords_impl((TestObj *)self, cls, key, key_length);

exit:
    return return_value;
}

static TyObject *
Test__pyarg_parsestackandkeywords_impl(TestObj *self, TyTypeObject *cls,
                                       const char *key,
                                       Ty_ssize_t key_length)
/*[clinic end generated code: output=7060c213d7b8200e input=fc72ef4b4cfafabc]*/


/*[clinic input]
fn_with_default_binop_expr
    arg: object(c_default='CONST_A + CONST_B') = a+b
[clinic start generated code]*/

TyDoc_STRVAR(fn_with_default_binop_expr__doc__,
"fn_with_default_binop_expr($module, /, arg=a+b)\n"
"--\n"
"\n");

#define FN_WITH_DEFAULT_BINOP_EXPR_METHODDEF    \
    {"fn_with_default_binop_expr", _PyCFunction_CAST(fn_with_default_binop_expr), METH_FASTCALL|METH_KEYWORDS, fn_with_default_binop_expr__doc__},

static TyObject *
fn_with_default_binop_expr_impl(TyObject *module, TyObject *arg);

static TyObject *
fn_with_default_binop_expr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "fn_with_default_binop_expr",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *arg = CONST_A + CONST_B;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    arg = args[0];
skip_optional_pos:
    return_value = fn_with_default_binop_expr_impl(module, arg);

exit:
    return return_value;
}

static TyObject *
fn_with_default_binop_expr_impl(TyObject *module, TyObject *arg)
/*[clinic end generated code: output=6613a7a96537bcf2 input=1b55c8ae68d89453]*/


/*[python input]
class Custom_converter(CConverter):
    type = "str"
    default = "Hello!"
    converter = "c_converter_func"
[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=d612708f0efb8e3c]*/

/*[clinic input]
docstr_fallback_to_converter_default
    a: Custom
Check docstring default value fallback.

Verify that the docstring formatter fetches the default
value from the converter if no 'py_default' is found.
The signature should have the default a='Hello!',
as given by the Custom converter.
[clinic start generated code]*/

TyDoc_STRVAR(docstr_fallback_to_converter_default__doc__,
"docstr_fallback_to_converter_default($module, /, a=\'Hello!\')\n"
"--\n"
"\n"
"Check docstring default value fallback.\n"
"\n"
"Verify that the docstring formatter fetches the default\n"
"value from the converter if no \'py_default\' is found.\n"
"The signature should have the default a=\'Hello!\',\n"
"as given by the Custom converter.");

#define DOCSTR_FALLBACK_TO_CONVERTER_DEFAULT_METHODDEF    \
    {"docstr_fallback_to_converter_default", _PyCFunction_CAST(docstr_fallback_to_converter_default), METH_FASTCALL|METH_KEYWORDS, docstr_fallback_to_converter_default__doc__},

static TyObject *
docstr_fallback_to_converter_default_impl(TyObject *module, str a);

static TyObject *
docstr_fallback_to_converter_default(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "docstr_fallback_to_converter_default",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    str a;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!c_converter_func(args[0], &a)) {
        goto exit;
    }
    return_value = docstr_fallback_to_converter_default_impl(module, a);

exit:
    return return_value;
}

static TyObject *
docstr_fallback_to_converter_default_impl(TyObject *module, str a)
/*[clinic end generated code: output=4405b7050a5f6fb9 input=0cbe6a4d24bc2274]*/


/*[clinic input]
@critical_section
test_critical_section
[clinic start generated code]*/

TyDoc_STRVAR(test_critical_section__doc__,
"test_critical_section($module, /)\n"
"--\n"
"\n");

#define TEST_CRITICAL_SECTION_METHODDEF    \
    {"test_critical_section", (PyCFunction)test_critical_section, METH_NOARGS, test_critical_section__doc__},

static TyObject *
test_critical_section_impl(TyObject *module);

static TyObject *
test_critical_section(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(module);
    return_value = test_critical_section_impl(module);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

static TyObject *
test_critical_section_impl(TyObject *module)
/*[clinic end generated code: output=9d5a87bb28aa3f0c input=8c58956d6ff00f80]*/


/*[clinic input]
@critical_section
test_critical_section_meth_o
    a: object(subclass_of="&TyUnicode_Type")
    /
[clinic start generated code]*/

TyDoc_STRVAR(test_critical_section_meth_o__doc__,
"test_critical_section_meth_o($module, a, /)\n"
"--\n"
"\n");

#define TEST_CRITICAL_SECTION_METH_O_METHODDEF    \
    {"test_critical_section_meth_o", (PyCFunction)test_critical_section_meth_o, METH_O, test_critical_section_meth_o__doc__},

static TyObject *
test_critical_section_meth_o_impl(TyObject *module, TyObject *a);

static TyObject *
test_critical_section_meth_o(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *a;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("test_critical_section_meth_o", "argument", "str", arg);
        goto exit;
    }
    a = arg;
    Ty_BEGIN_CRITICAL_SECTION(module);
    return_value = test_critical_section_meth_o_impl(module, a);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

static TyObject *
test_critical_section_meth_o_impl(TyObject *module, TyObject *a)
/*[clinic end generated code: output=7a9d7420802d1202 input=376533f51eceb6c3]*/

/*[clinic input]
@critical_section a
test_critical_section_object
    a: object(subclass_of="&TyUnicode_Type")
    /
test_critical_section_object
[clinic start generated code]*/

TyDoc_STRVAR(test_critical_section_object__doc__,
"test_critical_section_object($module, a, /)\n"
"--\n"
"\n"
"test_critical_section_object");

#define TEST_CRITICAL_SECTION_OBJECT_METHODDEF    \
    {"test_critical_section_object", (PyCFunction)test_critical_section_object, METH_O, test_critical_section_object__doc__},

static TyObject *
test_critical_section_object_impl(TyObject *module, TyObject *a);

static TyObject *
test_critical_section_object(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *a;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("test_critical_section_object", "argument", "str", arg);
        goto exit;
    }
    a = arg;
    Ty_BEGIN_CRITICAL_SECTION(a);
    return_value = test_critical_section_object_impl(module, a);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

static TyObject *
test_critical_section_object_impl(TyObject *module, TyObject *a)
/*[clinic end generated code: output=ec06df92232b0fb5 input=6f67f91b523c875f]*/

/*[clinic input]
@critical_section a b
test_critical_section_object2
    a: object(subclass_of="&TyUnicode_Type")
    b: object(subclass_of="&TyUnicode_Type")
    /
test_critical_section_object2
[clinic start generated code]*/

TyDoc_STRVAR(test_critical_section_object2__doc__,
"test_critical_section_object2($module, a, b, /)\n"
"--\n"
"\n"
"test_critical_section_object2");

#define TEST_CRITICAL_SECTION_OBJECT2_METHODDEF    \
    {"test_critical_section_object2", _PyCFunction_CAST(test_critical_section_object2), METH_FASTCALL, test_critical_section_object2__doc__},

static TyObject *
test_critical_section_object2_impl(TyObject *module, TyObject *a,
                                   TyObject *b);

static TyObject *
test_critical_section_object2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;

    if (!_TyArg_CheckPositional("test_critical_section_object2", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("test_critical_section_object2", "argument 1", "str", args[0]);
        goto exit;
    }
    a = args[0];
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("test_critical_section_object2", "argument 2", "str", args[1]);
        goto exit;
    }
    b = args[1];
    Ty_BEGIN_CRITICAL_SECTION2(a, b);
    return_value = test_critical_section_object2_impl(module, a, b);
    Ty_END_CRITICAL_SECTION2();

exit:
    return return_value;
}

static TyObject *
test_critical_section_object2_impl(TyObject *module, TyObject *a,
                                   TyObject *b)
/*[clinic end generated code: output=d73a1657c18df17a input=638824e41419a466]*/
