#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
   // Need limited C API 3.14 to test TyLong_AsInt64()
#  define Ty_LIMITED_API 0x030e0000
#endif

#include "parts.h"
#include "util.h"
#include "clinic/long.c.h"

/*[clinic input]
module _testlimitedcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2700057f9c1135ba]*/


static TyObject *
raiseTestError(const char* test_name, const char* msg)
{
    TyErr_Format(TyExc_AssertionError, "%s: %s", test_name, msg);
    return NULL;
}

/* Tests of TyLong_{As, From}{Unsigned,}Long(), and
   TyLong_{As, From}{Unsigned,}LongLong().

   Note that the meat of the test is contained in testcapi_long.h.
   This is revolting, but delicate code duplication is worse:  "almost
   exactly the same" code is needed to test long long, but the ubiquitous
   dependence on type names makes it impossible to use a parameterized
   function.  A giant macro would be even worse than this.  A C++ template
   would be perfect.

   The "report an error" functions are deliberately not part of the #include
   file:  if the test fails, you can set a breakpoint in the appropriate
   error function directly, and crawl back from there in the debugger.
*/

#define UNBIND(X)  Ty_DECREF(X); (X) = NULL

static TyObject *
raise_test_long_error(const char* msg)
{
    return raiseTestError("test_long_api", msg);
}

// Test TyLong_FromLong()/TyLong_AsLong()
// and TyLong_FromUnsignedLong()/TyLong_AsUnsignedLong().

#define TESTNAME        test_long_api_inner
#define TYPENAME        long
#define F_S_TO_PY       TyLong_FromLong
#define F_PY_TO_S       TyLong_AsLong
#define F_U_TO_PY       TyLong_FromUnsignedLong
#define F_PY_TO_U       TyLong_AsUnsignedLong

#include "testcapi_long.h"

/*[clinic input]
_testlimitedcapi.test_long_api
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_api_impl(TyObject *module)
/*[clinic end generated code: output=06a2c02366d1853a input=9012b3d6a483df63]*/
{
    return TESTNAME(raise_test_long_error);
}

#undef TESTNAME
#undef TYPENAME
#undef F_S_TO_PY
#undef F_PY_TO_S
#undef F_U_TO_PY
#undef F_PY_TO_U

// Test TyLong_FromLongLong()/TyLong_AsLongLong()
// and TyLong_FromUnsignedLongLong()/TyLong_AsUnsignedLongLong().

static TyObject *
raise_test_longlong_error(const char* msg)
{
    return raiseTestError("test_longlong_api", msg);
}

#define TESTNAME        test_longlong_api_inner
#define TYPENAME        long long
#define F_S_TO_PY       TyLong_FromLongLong
#define F_PY_TO_S       TyLong_AsLongLong
#define F_U_TO_PY       TyLong_FromUnsignedLongLong
#define F_PY_TO_U       TyLong_AsUnsignedLongLong

#include "testcapi_long.h"

/*[clinic input]
_testlimitedcapi.test_longlong_api
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_longlong_api_impl(TyObject *module)
/*[clinic end generated code: output=8faa10e1c35214bf input=2b582a9d25bd68e7]*/
{
    return TESTNAME(raise_test_longlong_error);
}

#undef TESTNAME
#undef TYPENAME
#undef F_S_TO_PY
#undef F_PY_TO_S
#undef F_U_TO_PY
#undef F_PY_TO_U


/*[clinic input]
_testlimitedcapi.test_long_and_overflow

Test the TyLong_AsLongAndOverflow API.

General conversion to PY_LONG is tested by test_long_api_inner.
This test will concentrate on proper handling of overflow.
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_and_overflow_impl(TyObject *module)
/*[clinic end generated code: output=fdfd3c1eeabb6d14 input=e3a18791de6519fe]*/
{
    TyObject *num, *one, *temp;
    long value;
    int overflow;

    /* Test that overflow is set properly for a large value. */
    /* num is a number larger than LONG_MAX even on 64-bit platforms */
    num = TyLong_FromString("FFFFFFFFFFFFFFFFFFFFFFFF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_and_overflow",
            "return value was not set to -1");
    if (overflow != 1)
        return raiseTestError("test_long_and_overflow",
            "overflow was not set to 1");

    /* Same again, with num = LONG_MAX + 1 */
    num = TyLong_FromLong(LONG_MAX);
    if (num == NULL)
        return NULL;
    one = TyLong_FromLong(1L);
    if (one == NULL) {
        Ty_DECREF(num);
        return NULL;
    }
    temp = PyNumber_Add(num, one);
    Ty_DECREF(one);
    Ty_DECREF(num);
    num = temp;
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_and_overflow",
            "return value was not set to -1");
    if (overflow != 1)
        return raiseTestError("test_long_and_overflow",
            "overflow was not set to 1");

    /* Test that overflow is set properly for a large negative value. */
    /* num is a number smaller than LONG_MIN even on 64-bit platforms */
    num = TyLong_FromString("-FFFFFFFFFFFFFFFFFFFFFFFF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_and_overflow",
            "return value was not set to -1");
    if (overflow != -1)
        return raiseTestError("test_long_and_overflow",
            "overflow was not set to -1");

    /* Same again, with num = LONG_MIN - 1 */
    num = TyLong_FromLong(LONG_MIN);
    if (num == NULL)
        return NULL;
    one = TyLong_FromLong(1L);
    if (one == NULL) {
        Ty_DECREF(num);
        return NULL;
    }
    temp = PyNumber_Subtract(num, one);
    Ty_DECREF(one);
    Ty_DECREF(num); num = temp;
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_and_overflow",
            "return value was not set to -1");
    if (overflow != -1)
        return raiseTestError("test_long_and_overflow",
            "overflow was not set to -1");

    /* Test that overflow is cleared properly for small values. */
    num = TyLong_FromString("FF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != 0xFF)
        return raiseTestError("test_long_and_overflow",
            "expected return value 0xFF");
    if (overflow != 0)
        return raiseTestError("test_long_and_overflow",
            "overflow was not cleared");

    num = TyLong_FromString("-FF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -0xFF)
        return raiseTestError("test_long_and_overflow",
            "expected return value 0xFF");
    if (overflow != 0)
        return raiseTestError("test_long_and_overflow",
            "overflow was set incorrectly");

    num = TyLong_FromLong(LONG_MAX);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != LONG_MAX)
        return raiseTestError("test_long_and_overflow",
            "expected return value LONG_MAX");
    if (overflow != 0)
        return raiseTestError("test_long_and_overflow",
            "overflow was not cleared");

    num = TyLong_FromLong(LONG_MIN);
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != LONG_MIN)
        return raiseTestError("test_long_and_overflow",
            "expected return value LONG_MIN");
    if (overflow != 0)
        return raiseTestError("test_long_and_overflow",
            "overflow was not cleared");

    Py_RETURN_NONE;
}

/*[clinic input]
_testlimitedcapi.test_long_long_and_overflow

Test the TyLong_AsLongLongAndOverflow API.

General conversion to long long is tested by test_long_api_inner.
This test will concentrate on proper handling of overflow.
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_long_and_overflow_impl(TyObject *module)
/*[clinic end generated code: output=3d2721a49c09a307 input=741c593b606cc6b3]*/
{
    TyObject *num, *one, *temp;
    long long value;
    int overflow;

    /* Test that overflow is set properly for a large value. */
    /* num is a number larger than LLONG_MAX on a typical machine. */
    num = TyLong_FromString("FFFFFFFFFFFFFFFFFFFFFFFF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_long_and_overflow",
            "return value was not set to -1");
    if (overflow != 1)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not set to 1");

    /* Same again, with num = LLONG_MAX + 1 */
    num = TyLong_FromLongLong(LLONG_MAX);
    if (num == NULL)
        return NULL;
    one = TyLong_FromLong(1L);
    if (one == NULL) {
        Ty_DECREF(num);
        return NULL;
    }
    temp = PyNumber_Add(num, one);
    Ty_DECREF(one);
    Ty_DECREF(num); num = temp;
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_long_and_overflow",
            "return value was not set to -1");
    if (overflow != 1)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not set to 1");

    /* Test that overflow is set properly for a large negative value. */
    /* num is a number smaller than LLONG_MIN on a typical platform */
    num = TyLong_FromString("-FFFFFFFFFFFFFFFFFFFFFFFF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_long_and_overflow",
            "return value was not set to -1");
    if (overflow != -1)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not set to -1");

    /* Same again, with num = LLONG_MIN - 1 */
    num = TyLong_FromLongLong(LLONG_MIN);
    if (num == NULL)
        return NULL;
    one = TyLong_FromLong(1L);
    if (one == NULL) {
        Ty_DECREF(num);
        return NULL;
    }
    temp = PyNumber_Subtract(num, one);
    Ty_DECREF(one);
    Ty_DECREF(num); num = temp;
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -1)
        return raiseTestError("test_long_long_and_overflow",
            "return value was not set to -1");
    if (overflow != -1)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not set to -1");

    /* Test that overflow is cleared properly for small values. */
    num = TyLong_FromString("FF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != 0xFF)
        return raiseTestError("test_long_long_and_overflow",
            "expected return value 0xFF");
    if (overflow != 0)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not cleared");

    num = TyLong_FromString("-FF", NULL, 16);
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != -0xFF)
        return raiseTestError("test_long_long_and_overflow",
            "expected return value 0xFF");
    if (overflow != 0)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was set incorrectly");

    num = TyLong_FromLongLong(LLONG_MAX);
    if (num == NULL)
        return NULL;
    overflow = 1234;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != LLONG_MAX)
        return raiseTestError("test_long_long_and_overflow",
            "expected return value LLONG_MAX");
    if (overflow != 0)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not cleared");

    num = TyLong_FromLongLong(LLONG_MIN);
    if (num == NULL)
        return NULL;
    overflow = 0;
    value = TyLong_AsLongLongAndOverflow(num, &overflow);
    Ty_DECREF(num);
    if (value == -1 && TyErr_Occurred())
        return NULL;
    if (value != LLONG_MIN)
        return raiseTestError("test_long_long_and_overflow",
            "expected return value LLONG_MIN");
    if (overflow != 0)
        return raiseTestError("test_long_long_and_overflow",
            "overflow was not cleared");

    Py_RETURN_NONE;
}

/*[clinic input]
_testlimitedcapi.test_long_as_size_t

Test the TyLong_As{Size,Ssize}_t API.

At present this just tests that non-integer arguments are handled correctly.
It should be extended to test overflow handling.
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_as_size_t_impl(TyObject *module)
/*[clinic end generated code: output=297a9f14a42f55af input=8923d8f2038c46f4]*/
{
    size_t out_u;
    Ty_ssize_t out_s;

    Ty_INCREF(Ty_None);

    out_u = TyLong_AsSize_t(Ty_None);
    if (out_u != (size_t)-1 || !TyErr_Occurred())
        return raiseTestError("test_long_as_size_t",
                              "TyLong_AsSize_t(None) didn't complain");
    if (!TyErr_ExceptionMatches(TyExc_TypeError))
        return raiseTestError("test_long_as_size_t",
                              "TyLong_AsSize_t(None) raised "
                              "something other than TypeError");
    TyErr_Clear();

    out_s = TyLong_AsSsize_t(Ty_None);
    if (out_s != (Ty_ssize_t)-1 || !TyErr_Occurred())
        return raiseTestError("test_long_as_size_t",
                              "TyLong_AsSsize_t(None) didn't complain");
    if (!TyErr_ExceptionMatches(TyExc_TypeError))
        return raiseTestError("test_long_as_size_t",
                              "TyLong_AsSsize_t(None) raised "
                              "something other than TypeError");
    TyErr_Clear();

    /* Ty_INCREF(Ty_None) omitted - we already have a reference to it. */
    return Ty_None;
}

/*[clinic input]
_testlimitedcapi.test_long_as_unsigned_long_long_mask
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_as_unsigned_long_long_mask_impl(TyObject *module)
/*[clinic end generated code: output=90be09ffeec8ecab input=17c660bd58becad5]*/
{
    unsigned long long res = TyLong_AsUnsignedLongLongMask(NULL);

    if (res != (unsigned long long)-1 || !TyErr_Occurred()) {
        return raiseTestError("test_long_as_unsigned_long_long_mask",
                              "TyLong_AsUnsignedLongLongMask(NULL) didn't "
                              "complain");
    }
    if (!TyErr_ExceptionMatches(TyExc_SystemError)) {
        return raiseTestError("test_long_as_unsigned_long_long_mask",
                              "TyLong_AsUnsignedLongLongMask(NULL) raised "
                              "something other than SystemError");
    }
    TyErr_Clear();
    Py_RETURN_NONE;
}

/*[clinic input]
_testlimitedcapi.test_long_as_double
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_test_long_as_double_impl(TyObject *module)
/*[clinic end generated code: output=0e688c2acf224f88 input=e7b5712385064a48]*/
{
    double out;

    Ty_INCREF(Ty_None);

    out = TyLong_AsDouble(Ty_None);
    if (out != -1.0 || !TyErr_Occurred())
        return raiseTestError("test_long_as_double",
                              "TyLong_AsDouble(None) didn't complain");
    if (!TyErr_ExceptionMatches(TyExc_TypeError))
        return raiseTestError("test_long_as_double",
                              "TyLong_AsDouble(None) raised "
                              "something other than TypeError");
    TyErr_Clear();

    /* Ty_INCREF(Ty_None) omitted - we already have a reference to it. */
    return Ty_None;
}

static TyObject *
pylong_check(TyObject *module, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyLong_Check(obj));
}

static TyObject *
pylong_checkexact(TyObject *module, TyObject *obj)
{
    NULLABLE(obj);
    return TyLong_FromLong(TyLong_CheckExact(obj));
}

static TyObject *
pylong_fromdouble(TyObject *module, TyObject *arg)
{
    double value;
    if (!TyArg_Parse(arg, "d", &value)) {
        return NULL;
    }
    return TyLong_FromDouble(value);
}

static TyObject *
pylong_fromstring(TyObject *module, TyObject *args)
{
    const char *str;
    Ty_ssize_t len;
    int base;
    char *end = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "z#i", &str, &len, &base)) {
        return NULL;
    }

    TyObject *result = TyLong_FromString(str, &end, base);
    if (result == NULL) {
        // XXX 'end' is not always set.
        return NULL;
    }
    return Ty_BuildValue("Nn", result, (Ty_ssize_t)(end - str));
}

static TyObject *
pylong_fromvoidptr(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    return TyLong_FromVoidPtr((void *)arg);
}

/*[clinic input]
_testlimitedcapi.TyLong_AsInt
    arg: object
    /
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_PyLong_AsInt(TyObject *module, TyObject *arg)
/*[clinic end generated code: output=d91db4c1287f85fa input=32c66be86f3265a1]*/
{
    NULLABLE(arg);
    assert(!TyErr_Occurred());
    int value = TyLong_AsInt(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromLong(value);
}

static TyObject *
pylong_aslong(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    long value = TyLong_AsLong(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromLong(value);
}

static TyObject *
pylong_aslongandoverflow(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    int overflow = UNINITIALIZED_INT;
    long value = TyLong_AsLongAndOverflow(arg, &overflow);
    if (value == -1 && TyErr_Occurred()) {
        assert(overflow == 0);
        return NULL;
    }
    return Ty_BuildValue("li", value, overflow);
}

static TyObject *
pylong_asunsignedlong(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    unsigned long value = TyLong_AsUnsignedLong(arg);
    if (value == (unsigned long)-1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromUnsignedLong(value);
}

static TyObject *
pylong_asunsignedlongmask(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    unsigned long value = TyLong_AsUnsignedLongMask(arg);
    if (value == (unsigned long)-1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromUnsignedLong(value);
}

static TyObject *
pylong_aslonglong(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    long long value = TyLong_AsLongLong(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromLongLong(value);
}

static TyObject *
pylong_aslonglongandoverflow(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    int overflow = UNINITIALIZED_INT;
    long long value = TyLong_AsLongLongAndOverflow(arg, &overflow);
    if (value == -1 && TyErr_Occurred()) {
        assert(overflow == 0);
        return NULL;
    }
    return Ty_BuildValue("Li", value, overflow);
}

static TyObject *
pylong_asunsignedlonglong(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    unsigned long long value = TyLong_AsUnsignedLongLong(arg);
    if (value == (unsigned long long)-1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromUnsignedLongLong(value);
}

static TyObject *
pylong_asunsignedlonglongmask(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    unsigned long long value = TyLong_AsUnsignedLongLongMask(arg);
    if (value == (unsigned long long)-1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromUnsignedLongLong(value);
}

static TyObject *
pylong_as_ssize_t(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    Ty_ssize_t value = TyLong_AsSsize_t(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromSsize_t(value);
}

static TyObject *
pylong_as_size_t(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    size_t value = TyLong_AsSize_t(arg);
    if (value == (size_t)-1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromSize_t(value);
}

static TyObject *
pylong_asdouble(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    double value = TyLong_AsDouble(arg);
    if (value == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyFloat_FromDouble(value);
}

static TyObject *
pylong_asvoidptr(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    void *value = TyLong_AsVoidPtr(arg);
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        Py_RETURN_NONE;
    }
    return Ty_NewRef((TyObject *)value);
}

static TyObject *
pylong_aspid(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    pid_t value = TyLong_AsPid(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromPid(value);
}


static TyObject *
pylong_asint32(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    int32_t value;
    if (TyLong_AsInt32(arg, &value) < 0) {
        return NULL;
    }
    return TyLong_FromInt32(value);
}

static TyObject *
pylong_asuint32(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    uint32_t value;
    if (TyLong_AsUInt32(arg, &value) < 0) {
        return NULL;
    }
    return TyLong_FromUInt32(value);
}


static TyObject *
pylong_asint64(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    int64_t value;
    if (TyLong_AsInt64(arg, &value) < 0) {
        return NULL;
    }
    return TyLong_FromInt64(value);
}

static TyObject *
pylong_asuint64(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    uint64_t value;
    if (TyLong_AsUInt64(arg, &value) < 0) {
        return NULL;
    }
    return TyLong_FromUInt64(value);
}


static TyMethodDef test_methods[] = {
    _TESTLIMITEDCAPI_TEST_LONG_AND_OVERFLOW_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONG_API_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONG_AS_DOUBLE_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONG_AS_SIZE_T_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONG_AS_UNSIGNED_LONG_LONG_MASK_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONG_LONG_AND_OVERFLOW_METHODDEF
    _TESTLIMITEDCAPI_TEST_LONGLONG_API_METHODDEF
    {"pylong_check",                pylong_check,               METH_O},
    {"pylong_checkexact",           pylong_checkexact,          METH_O},
    {"pylong_fromdouble",           pylong_fromdouble,          METH_O},
    {"pylong_fromstring",           pylong_fromstring,          METH_VARARGS},
    {"pylong_fromvoidptr",          pylong_fromvoidptr,         METH_O},
    _TESTLIMITEDCAPI_PYLONG_ASINT_METHODDEF
    {"pylong_aslong",               pylong_aslong,              METH_O},
    {"pylong_aslongandoverflow",    pylong_aslongandoverflow,   METH_O},
    {"pylong_asunsignedlong",       pylong_asunsignedlong,      METH_O},
    {"pylong_asunsignedlongmask",   pylong_asunsignedlongmask,  METH_O},
    {"pylong_aslonglong",           pylong_aslonglong,          METH_O},
    {"pylong_aslonglongandoverflow", pylong_aslonglongandoverflow, METH_O},
    {"pylong_asunsignedlonglong",   pylong_asunsignedlonglong,  METH_O},
    {"pylong_asunsignedlonglongmask", pylong_asunsignedlonglongmask, METH_O},
    {"pylong_as_ssize_t",           pylong_as_ssize_t,          METH_O},
    {"pylong_as_size_t",            pylong_as_size_t,           METH_O},
    {"pylong_asdouble",             pylong_asdouble,            METH_O},
    {"pylong_asvoidptr",            pylong_asvoidptr,           METH_O},
    {"pylong_aspid",                pylong_aspid,               METH_O},
    {"pylong_asint32",              pylong_asint32,             METH_O},
    {"pylong_asuint32",             pylong_asuint32,            METH_O},
    {"pylong_asint64",              pylong_asint64,             METH_O},
    {"pylong_asuint64",             pylong_asuint64,            METH_O},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Long(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    return 0;
}
