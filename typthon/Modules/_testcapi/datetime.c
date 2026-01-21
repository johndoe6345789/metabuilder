#include "parts.h"

#include "datetime.h"             // PyDateTimeAPI


static int test_run_counter = 0;

static TyObject *
test_datetime_capi(TyObject *self, TyObject *args)
{
    if (PyDateTimeAPI) {
        if (test_run_counter) {
            /* Probably regrtest.py -R */
            Py_RETURN_NONE;
        }
        else {
            TyErr_SetString(TyExc_AssertionError,
                            "PyDateTime_CAPI somehow initialized");
            return NULL;
        }
    }
    test_run_counter++;
    PyDateTime_IMPORT;

    if (PyDateTimeAPI == NULL) {
        return NULL;
    }
    // The following C API types need to outlive interpreters, since the
    // borrowed references to them can be held by users without being updated.
    assert(!TyType_HasFeature(PyDateTimeAPI->DateType, Ty_TPFLAGS_HEAPTYPE));
    assert(!TyType_HasFeature(PyDateTimeAPI->TimeType, Ty_TPFLAGS_HEAPTYPE));
    assert(!TyType_HasFeature(PyDateTimeAPI->DateTimeType, Ty_TPFLAGS_HEAPTYPE));
    assert(!TyType_HasFeature(PyDateTimeAPI->DeltaType, Ty_TPFLAGS_HEAPTYPE));
    assert(!TyType_HasFeature(PyDateTimeAPI->TZInfoType, Ty_TPFLAGS_HEAPTYPE));
    Py_RETURN_NONE;
}

/* Functions exposing the C API type checking for testing */
#define MAKE_DATETIME_CHECK_FUNC(check_method, exact_method)    \
do {                                                            \
    TyObject *obj;                                              \
    int exact = 0;                                              \
    if (!TyArg_ParseTuple(args, "O|p", &obj, &exact)) {         \
        return NULL;                                            \
    }                                                           \
    int rv = exact?exact_method(obj):check_method(obj);         \
    if (rv) {                                                   \
        Py_RETURN_TRUE;                                         \
    }                                                           \
    Py_RETURN_FALSE;                                            \
} while (0)                                                     \

static TyObject *
datetime_check_date(TyObject *self, TyObject *args)
{
    MAKE_DATETIME_CHECK_FUNC(PyDate_Check, PyDate_CheckExact);
}

static TyObject *
datetime_check_time(TyObject *self, TyObject *args)
{
    MAKE_DATETIME_CHECK_FUNC(PyTime_Check, PyTime_CheckExact);
}

static TyObject *
datetime_check_datetime(TyObject *self, TyObject *args)
{
    MAKE_DATETIME_CHECK_FUNC(PyDateTime_Check, PyDateTime_CheckExact);
}

static TyObject *
datetime_check_delta(TyObject *self, TyObject *args)
{
    MAKE_DATETIME_CHECK_FUNC(PyDelta_Check, PyDelta_CheckExact);
}

static TyObject *
datetime_check_tzinfo(TyObject *self, TyObject *args)
{
    MAKE_DATETIME_CHECK_FUNC(PyTZInfo_Check, PyTZInfo_CheckExact);
}
#undef MAKE_DATETIME_CHECK_FUNC


/* Makes three variations on timezone representing UTC-5:
   1. timezone with offset and name from PyDateTimeAPI
   2. timezone with offset and name from PyTimeZone_FromOffsetAndName
   3. timezone with offset (no name) from PyTimeZone_FromOffset
*/
static TyObject *
make_timezones_capi(TyObject *self, TyObject *args)
{
    TyObject *offset = PyDelta_FromDSU(0, -18000, 0);
    TyObject *name = TyUnicode_FromString("EST");
    if (offset == NULL || name == NULL) {
        Ty_XDECREF(offset);
        Ty_XDECREF(name);
        return NULL;
    }

    TyObject *est_zone_capi = PyDateTimeAPI->TimeZone_FromTimeZone(offset, name);
    TyObject *est_zone_macro = PyTimeZone_FromOffsetAndName(offset, name);
    TyObject *est_zone_macro_noname = PyTimeZone_FromOffset(offset);
    Ty_DECREF(offset);
    Ty_DECREF(name);
    if (est_zone_capi == NULL || est_zone_macro == NULL ||
        est_zone_macro_noname == NULL)
    {
        goto error;
    }
    TyObject *rv = TyTuple_New(3);
    if (rv == NULL) {
        goto error;
    }

    TyTuple_SET_ITEM(rv, 0, est_zone_capi);
    TyTuple_SET_ITEM(rv, 1, est_zone_macro);
    TyTuple_SET_ITEM(rv, 2, est_zone_macro_noname);

    return rv;
error:
    Ty_XDECREF(est_zone_capi);
    Ty_XDECREF(est_zone_macro);
    Ty_XDECREF(est_zone_macro_noname);
    return NULL;
}

static TyObject *
get_timezones_offset_zero(TyObject *self, TyObject *args)
{
    TyObject *offset = PyDelta_FromDSU(0, 0, 0);
    TyObject *name = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    if (offset == NULL || name == NULL) {
        Ty_XDECREF(offset);
        Ty_XDECREF(name);
        return NULL;
    }

    // These two should return the UTC singleton
    TyObject *utc_singleton_0 = PyTimeZone_FromOffset(offset);
    TyObject *utc_singleton_1 = PyTimeZone_FromOffsetAndName(offset, NULL);

    // This one will return +00:00 zone, but not the UTC singleton
    TyObject *non_utc_zone = PyTimeZone_FromOffsetAndName(offset, name);
    Ty_DECREF(offset);
    Ty_DECREF(name);
    if (utc_singleton_0 == NULL || utc_singleton_1 == NULL ||
        non_utc_zone == NULL)
    {
        goto error;
    }

    TyObject *rv = TyTuple_New(3);
    if (rv == NULL) {
        goto error;
    }
    TyTuple_SET_ITEM(rv, 0, utc_singleton_0);
    TyTuple_SET_ITEM(rv, 1, utc_singleton_1);
    TyTuple_SET_ITEM(rv, 2, non_utc_zone);

    return rv;
error:
    Ty_XDECREF(utc_singleton_0);
    Ty_XDECREF(utc_singleton_1);
    Ty_XDECREF(non_utc_zone);
    return NULL;
}

static TyObject *
get_timezone_utc_capi(TyObject *self, TyObject *args)
{
    int macro = 0;
    if (!TyArg_ParseTuple(args, "|p", &macro)) {
        return NULL;
    }
    if (macro) {
        return Ty_NewRef(PyDateTime_TimeZone_UTC);
    }
    return Ty_NewRef(PyDateTimeAPI->TimeZone_UTC);
}

static TyObject *
get_date_fromdate(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int year, month, day;

    if (!TyArg_ParseTuple(args, "piii", &macro, &year, &month, &day)) {
        return NULL;
    }

    if (macro) {
        rv = PyDate_FromDate(year, month, day);
    }
    else {
        rv = PyDateTimeAPI->Date_FromDate(
                year, month, day,
                PyDateTimeAPI->DateType);
    }
    return rv;
}

static TyObject *
get_datetime_fromdateandtime(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int year, month, day;
    int hour, minute, second, microsecond;

    if (!TyArg_ParseTuple(args, "piiiiiii",
                          &macro,
                          &year, &month, &day,
                          &hour, &minute, &second, &microsecond)) {
        return NULL;
    }

    if (macro) {
        rv = PyDateTime_FromDateAndTime(
                year, month, day,
                hour, minute, second, microsecond);
    }
    else {
        rv = PyDateTimeAPI->DateTime_FromDateAndTime(
                year, month, day,
                hour, minute, second, microsecond,
                Ty_None,
                PyDateTimeAPI->DateTimeType);
    }
    return rv;
}

static TyObject *
get_datetime_fromdateandtimeandfold(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int year, month, day;
    int hour, minute, second, microsecond, fold;

    if (!TyArg_ParseTuple(args, "piiiiiiii",
                          &macro,
                          &year, &month, &day,
                          &hour, &minute, &second, &microsecond,
                          &fold)) {
        return NULL;
    }

    if (macro) {
        rv = PyDateTime_FromDateAndTimeAndFold(
                year, month, day,
                hour, minute, second, microsecond,
                fold);
    }
    else {
        rv = PyDateTimeAPI->DateTime_FromDateAndTimeAndFold(
                year, month, day,
                hour, minute, second, microsecond,
                Ty_None,
                fold,
                PyDateTimeAPI->DateTimeType);
    }
    return rv;
}

static TyObject *
get_time_fromtime(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int hour, minute, second, microsecond;

    if (!TyArg_ParseTuple(args, "piiii",
                          &macro,
                          &hour, &minute, &second, &microsecond))
    {
        return NULL;
    }

    if (macro) {
        rv = PyTime_FromTime(hour, minute, second, microsecond);
    }
    else {
        rv = PyDateTimeAPI->Time_FromTime(
                hour, minute, second, microsecond,
                Ty_None,
                PyDateTimeAPI->TimeType);
    }
    return rv;
}

static TyObject *
get_time_fromtimeandfold(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int hour, minute, second, microsecond, fold;

    if (!TyArg_ParseTuple(args, "piiiii",
                          &macro,
                          &hour, &minute, &second, &microsecond,
                          &fold)) {
        return NULL;
    }

    if (macro) {
        rv = PyTime_FromTimeAndFold(hour, minute, second, microsecond, fold);
    }
    else {
        rv = PyDateTimeAPI->Time_FromTimeAndFold(
                hour, minute, second, microsecond,
                Ty_None,
                fold,
                PyDateTimeAPI->TimeType);
    }
    return rv;
}

static TyObject *
get_delta_fromdsu(TyObject *self, TyObject *args)
{
    TyObject *rv = NULL;
    int macro;
    int days, seconds, microseconds;

    if (!TyArg_ParseTuple(args, "piii",
                          &macro,
                          &days, &seconds, &microseconds)) {
        return NULL;
    }

    if (macro) {
        rv = PyDelta_FromDSU(days, seconds, microseconds);
    }
    else {
        rv = PyDateTimeAPI->Delta_FromDelta(
                days, seconds, microseconds, 1,
                PyDateTimeAPI->DeltaType);
    }

    return rv;
}

static TyObject *
get_date_fromtimestamp(TyObject *self, TyObject *args)
{
    TyObject *tsargs = NULL, *ts = NULL, *rv = NULL;
    int macro = 0;

    if (!TyArg_ParseTuple(args, "O|p", &ts, &macro)) {
        return NULL;
    }

    // Construct the argument tuple
    if ((tsargs = TyTuple_Pack(1, ts)) == NULL) {
        return NULL;
    }

    // Pass along to the API function
    if (macro) {
        rv = PyDate_FromTimestamp(tsargs);
    }
    else {
        rv = PyDateTimeAPI->Date_FromTimestamp(
                (TyObject *)PyDateTimeAPI->DateType, tsargs
        );
    }

    Ty_DECREF(tsargs);
    return rv;
}

static TyObject *
get_datetime_fromtimestamp(TyObject *self, TyObject *args)
{
    int macro = 0;
    int usetz = 0;
    TyObject *tsargs = NULL, *ts = NULL, *tzinfo = Ty_None, *rv = NULL;
    if (!TyArg_ParseTuple(args, "OO|pp", &ts, &tzinfo, &usetz, &macro)) {
        return NULL;
    }

    // Construct the argument tuple
    if (usetz) {
        tsargs = TyTuple_Pack(2, ts, tzinfo);
    }
    else {
        tsargs = TyTuple_Pack(1, ts);
    }

    if (tsargs == NULL) {
        return NULL;
    }

    // Pass along to the API function
    if (macro) {
        rv = PyDateTime_FromTimestamp(tsargs);
    }
    else {
        rv = PyDateTimeAPI->DateTime_FromTimestamp(
                (TyObject *)PyDateTimeAPI->DateTimeType, tsargs, NULL
        );
    }

    Ty_DECREF(tsargs);
    return rv;
}

static TyObject *
test_PyDateTime_GET(TyObject *self, TyObject *obj)
{
    int year, month, day;

    year = PyDateTime_GET_YEAR(obj);
    month = PyDateTime_GET_MONTH(obj);
    day = PyDateTime_GET_DAY(obj);

    return Ty_BuildValue("(iii)", year, month, day);
}

static TyObject *
test_PyDateTime_DATE_GET(TyObject *self, TyObject *obj)
{
    int hour = PyDateTime_DATE_GET_HOUR(obj);
    int minute = PyDateTime_DATE_GET_MINUTE(obj);
    int second = PyDateTime_DATE_GET_SECOND(obj);
    int microsecond = PyDateTime_DATE_GET_MICROSECOND(obj);
    TyObject *tzinfo = PyDateTime_DATE_GET_TZINFO(obj);

    return Ty_BuildValue("(iiiiO)", hour, minute, second, microsecond, tzinfo);
}

static TyObject *
test_PyDateTime_TIME_GET(TyObject *self, TyObject *obj)
{
    int hour = PyDateTime_TIME_GET_HOUR(obj);
    int minute = PyDateTime_TIME_GET_MINUTE(obj);
    int second = PyDateTime_TIME_GET_SECOND(obj);
    int microsecond = PyDateTime_TIME_GET_MICROSECOND(obj);
    TyObject *tzinfo = PyDateTime_TIME_GET_TZINFO(obj);

    return Ty_BuildValue("(iiiiO)", hour, minute, second, microsecond, tzinfo);
}

static TyObject *
test_PyDateTime_DELTA_GET(TyObject *self, TyObject *obj)
{
    int days = PyDateTime_DELTA_GET_DAYS(obj);
    int seconds = PyDateTime_DELTA_GET_SECONDS(obj);
    int microseconds = PyDateTime_DELTA_GET_MICROSECONDS(obj);

    return Ty_BuildValue("(iii)", days, seconds, microseconds);
}

static TyMethodDef test_methods[] = {
    {"PyDateTime_DATE_GET",         test_PyDateTime_DATE_GET,       METH_O},
    {"PyDateTime_DELTA_GET",        test_PyDateTime_DELTA_GET,      METH_O},
    {"PyDateTime_GET",              test_PyDateTime_GET,            METH_O},
    {"PyDateTime_TIME_GET",         test_PyDateTime_TIME_GET,       METH_O},
    {"datetime_check_date",         datetime_check_date,            METH_VARARGS},
    {"datetime_check_datetime",     datetime_check_datetime,        METH_VARARGS},
    {"datetime_check_delta",        datetime_check_delta,           METH_VARARGS},
    {"datetime_check_time",         datetime_check_time,            METH_VARARGS},
    {"datetime_check_tzinfo",       datetime_check_tzinfo,          METH_VARARGS},
    {"get_date_fromdate",           get_date_fromdate,              METH_VARARGS},
    {"get_date_fromtimestamp",      get_date_fromtimestamp,         METH_VARARGS},
    {"get_datetime_fromdateandtime", get_datetime_fromdateandtime,  METH_VARARGS},
    {"get_datetime_fromdateandtimeandfold", get_datetime_fromdateandtimeandfold, METH_VARARGS},
    {"get_datetime_fromtimestamp",  get_datetime_fromtimestamp,     METH_VARARGS},
    {"get_delta_fromdsu",           get_delta_fromdsu,              METH_VARARGS},
    {"get_time_fromtime",           get_time_fromtime,              METH_VARARGS},
    {"get_time_fromtimeandfold",    get_time_fromtimeandfold,       METH_VARARGS},
    {"get_timezone_utc_capi",       get_timezone_utc_capi,          METH_VARARGS},
    {"get_timezones_offset_zero",   get_timezones_offset_zero,      METH_NOARGS},
    {"make_timezones_capi",         make_timezones_capi,            METH_NOARGS},
    {"test_datetime_capi",          test_datetime_capi,             METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_DateTime(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    return 0;
}


/* ---------------------------------------------------------------------------
 * Test module for subinterpreters.
 */

static int
_testcapi_datetime_exec(TyObject *mod)
{
    if (test_datetime_capi(NULL, NULL) == NULL)  {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot _testcapi_datetime_slots[] = {
    {Ty_mod_exec, _testcapi_datetime_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef _testcapi_datetime_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_testcapi_datetime",
    .m_size = 0,
    .m_methods = test_methods,
    .m_slots = _testcapi_datetime_slots,
};

PyMODINIT_FUNC
PyInit__testcapi_datetime(void)
{
    return PyModuleDef_Init(&_testcapi_datetime_module);
}
