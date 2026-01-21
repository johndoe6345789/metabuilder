/*[clinic input]
preserve
[clinic start generated code]*/

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

TyDoc_STRVAR(my_int_func__doc__,
"my_int_func($module, arg, /)\n"
"--\n"
"\n");

#define MY_INT_FUNC_METHODDEF    \
    {"my_int_func", (PyCFunction)my_int_func, METH_O, my_int_func__doc__},

static int
my_int_func_impl(TyObject *module, int arg);

static TyObject *
my_int_func(TyObject *module, TyObject *arg_)
{
    TyObject *return_value = NULL;
    int arg;
    int _return_value;

    arg = TyLong_AsInt(arg_);
    if (arg == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = my_int_func_impl(module, arg);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(my_int_sum__doc__,
"my_int_sum($module, x, y, /)\n"
"--\n"
"\n");

#define MY_INT_SUM_METHODDEF    \
    {"my_int_sum", (PyCFunction)(void(*)(void))my_int_sum, METH_FASTCALL, my_int_sum__doc__},

static int
my_int_sum_impl(TyObject *module, int x, int y);

static TyObject *
my_int_sum(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int x;
    int y;
    int _return_value;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "my_int_sum expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    x = TyLong_AsInt(args[0]);
    if (x == -1 && TyErr_Occurred()) {
        goto exit;
    }
    y = TyLong_AsInt(args[1]);
    if (y == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = my_int_sum_impl(module, x, y);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(my_float_sum__doc__,
"my_float_sum($module, x, y, /)\n"
"--\n"
"\n");

#define MY_FLOAT_SUM_METHODDEF    \
    {"my_float_sum", (PyCFunction)(void(*)(void))my_float_sum, METH_FASTCALL, my_float_sum__doc__},

static float
my_float_sum_impl(TyObject *module, float x, float y);

static TyObject *
my_float_sum(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    float x;
    float y;
    float _return_value;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "my_float_sum expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    x = (float) TyFloat_AsDouble(args[0]);
    if (x == -1.0 && TyErr_Occurred()) {
        goto exit;
    }
    y = (float) TyFloat_AsDouble(args[1]);
    if (y == -1.0 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = my_float_sum_impl(module, x, y);
    if ((_return_value == -1.0) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyFloat_FromDouble((double)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(my_double_sum__doc__,
"my_double_sum($module, x, y, /)\n"
"--\n"
"\n");

#define MY_DOUBLE_SUM_METHODDEF    \
    {"my_double_sum", (PyCFunction)(void(*)(void))my_double_sum, METH_FASTCALL, my_double_sum__doc__},

static double
my_double_sum_impl(TyObject *module, double x, double y);

static TyObject *
my_double_sum(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    double x;
    double y;
    double _return_value;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "my_double_sum expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    x = TyFloat_AsDouble(args[0]);
    if (x == -1.0 && TyErr_Occurred()) {
        goto exit;
    }
    y = TyFloat_AsDouble(args[1]);
    if (y == -1.0 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = my_double_sum_impl(module, x, y);
    if ((_return_value == -1.0) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyFloat_FromDouble(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(get_file_descriptor__doc__,
"get_file_descriptor($module, file, /)\n"
"--\n"
"\n"
"Get a file descriptor.");

#define GET_FILE_DESCRIPTOR_METHODDEF    \
    {"get_file_descriptor", (PyCFunction)get_file_descriptor, METH_O, get_file_descriptor__doc__},

static int
get_file_descriptor_impl(TyObject *module, int fd);

static TyObject *
get_file_descriptor(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;
    int _return_value;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    _return_value = get_file_descriptor_impl(module, fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}
/*[clinic end generated code: output=03fd7811c056dc74 input=a9049054013a1b77]*/
