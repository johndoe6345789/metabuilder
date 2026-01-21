/*[clinic input]
preserve
[clinic start generated code]*/

TyDoc_STRVAR(_testlimitedcapi_test_long_api__doc__,
"test_long_api($module, /)\n"
"--\n"
"\n");

#define _TESTLIMITEDCAPI_TEST_LONG_API_METHODDEF    \
    {"test_long_api", (PyCFunction)_testlimitedcapi_test_long_api, METH_NOARGS, _testlimitedcapi_test_long_api__doc__},

static TyObject *
_testlimitedcapi_test_long_api_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_api(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_api_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_longlong_api__doc__,
"test_longlong_api($module, /)\n"
"--\n"
"\n");

#define _TESTLIMITEDCAPI_TEST_LONGLONG_API_METHODDEF    \
    {"test_longlong_api", (PyCFunction)_testlimitedcapi_test_longlong_api, METH_NOARGS, _testlimitedcapi_test_longlong_api__doc__},

static TyObject *
_testlimitedcapi_test_longlong_api_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_longlong_api(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_longlong_api_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_long_and_overflow__doc__,
"test_long_and_overflow($module, /)\n"
"--\n"
"\n"
"Test the TyLong_AsLongAndOverflow API.\n"
"\n"
"General conversion to PY_LONG is tested by test_long_api_inner.\n"
"This test will concentrate on proper handling of overflow.");

#define _TESTLIMITEDCAPI_TEST_LONG_AND_OVERFLOW_METHODDEF    \
    {"test_long_and_overflow", (PyCFunction)_testlimitedcapi_test_long_and_overflow, METH_NOARGS, _testlimitedcapi_test_long_and_overflow__doc__},

static TyObject *
_testlimitedcapi_test_long_and_overflow_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_and_overflow(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_and_overflow_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_long_long_and_overflow__doc__,
"test_long_long_and_overflow($module, /)\n"
"--\n"
"\n"
"Test the TyLong_AsLongLongAndOverflow API.\n"
"\n"
"General conversion to long long is tested by test_long_api_inner.\n"
"This test will concentrate on proper handling of overflow.");

#define _TESTLIMITEDCAPI_TEST_LONG_LONG_AND_OVERFLOW_METHODDEF    \
    {"test_long_long_and_overflow", (PyCFunction)_testlimitedcapi_test_long_long_and_overflow, METH_NOARGS, _testlimitedcapi_test_long_long_and_overflow__doc__},

static TyObject *
_testlimitedcapi_test_long_long_and_overflow_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_long_and_overflow(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_long_and_overflow_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_long_as_size_t__doc__,
"test_long_as_size_t($module, /)\n"
"--\n"
"\n"
"Test the TyLong_As{Size,Ssize}_t API.\n"
"\n"
"At present this just tests that non-integer arguments are handled correctly.\n"
"It should be extended to test overflow handling.");

#define _TESTLIMITEDCAPI_TEST_LONG_AS_SIZE_T_METHODDEF    \
    {"test_long_as_size_t", (PyCFunction)_testlimitedcapi_test_long_as_size_t, METH_NOARGS, _testlimitedcapi_test_long_as_size_t__doc__},

static TyObject *
_testlimitedcapi_test_long_as_size_t_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_as_size_t(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_as_size_t_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_long_as_unsigned_long_long_mask__doc__,
"test_long_as_unsigned_long_long_mask($module, /)\n"
"--\n"
"\n");

#define _TESTLIMITEDCAPI_TEST_LONG_AS_UNSIGNED_LONG_LONG_MASK_METHODDEF    \
    {"test_long_as_unsigned_long_long_mask", (PyCFunction)_testlimitedcapi_test_long_as_unsigned_long_long_mask, METH_NOARGS, _testlimitedcapi_test_long_as_unsigned_long_long_mask__doc__},

static TyObject *
_testlimitedcapi_test_long_as_unsigned_long_long_mask_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_as_unsigned_long_long_mask(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_as_unsigned_long_long_mask_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_test_long_as_double__doc__,
"test_long_as_double($module, /)\n"
"--\n"
"\n");

#define _TESTLIMITEDCAPI_TEST_LONG_AS_DOUBLE_METHODDEF    \
    {"test_long_as_double", (PyCFunction)_testlimitedcapi_test_long_as_double, METH_NOARGS, _testlimitedcapi_test_long_as_double__doc__},

static TyObject *
_testlimitedcapi_test_long_as_double_impl(TyObject *module);

static TyObject *
_testlimitedcapi_test_long_as_double(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _testlimitedcapi_test_long_as_double_impl(module);
}

TyDoc_STRVAR(_testlimitedcapi_PyLong_AsInt__doc__,
"TyLong_AsInt($module, arg, /)\n"
"--\n"
"\n");

#define _TESTLIMITEDCAPI_PYLONG_ASINT_METHODDEF    \
    {"TyLong_AsInt", (PyCFunction)_testlimitedcapi_PyLong_AsInt, METH_O, _testlimitedcapi_PyLong_AsInt__doc__},
/*[clinic end generated code: output=bc52b73c599f96c2 input=a9049054013a1b77]*/
