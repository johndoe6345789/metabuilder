/* Test pycore_time.h */

#include "parts.h"

#include "pycore_time.h"          // _TyTime_FromSeconds()

#ifdef MS_WINDOWS
#  include <winsock2.h>           // struct timeval
#endif


static TyObject *
test_pytime_fromseconds(TyObject *self, TyObject *args)
{
    int seconds;
    if (!TyArg_ParseTuple(args, "i", &seconds)) {
        return NULL;
    }
    TyTime_t ts = _TyTime_FromSeconds(seconds);
    return _TyTime_AsLong(ts);
}

static int
check_time_rounding(int round)
{
    if (round != _TyTime_ROUND_FLOOR
        && round != _TyTime_ROUND_CEILING
        && round != _TyTime_ROUND_HALF_EVEN
        && round != _TyTime_ROUND_UP)
    {
        TyErr_SetString(TyExc_ValueError, "invalid rounding");
        return -1;
    }
    return 0;
}

static TyObject *
test_pytime_fromsecondsobject(TyObject *self, TyObject *args)
{
    TyObject *obj;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    TyTime_t ts;
    if (_TyTime_FromSecondsObject(&ts, obj, round) == -1) {
        return NULL;
    }
    return _TyTime_AsLong(ts);
}

static TyObject *
test_PyTime_AsTimeval(TyObject *self, TyObject *args)
{
    TyObject *obj;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    struct timeval tv;
    if (_TyTime_AsTimeval(t, &tv, round) < 0) {
        return NULL;
    }

    TyObject *seconds = TyLong_FromLongLong(tv.tv_sec);
    if (seconds == NULL) {
        return NULL;
    }
    return Ty_BuildValue("Nl", seconds, (long)tv.tv_usec);
}

static TyObject *
test_PyTime_AsTimeval_clamp(TyObject *self, TyObject *args)
{
    TyObject *obj;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    struct timeval tv;
    _TyTime_AsTimeval_clamp(t, &tv, round);

    TyObject *seconds = TyLong_FromLongLong(tv.tv_sec);
    if (seconds == NULL) {
        return NULL;
    }
    return Ty_BuildValue("Nl", seconds, (long)tv.tv_usec);
}

#ifdef HAVE_CLOCK_GETTIME
static TyObject *
test_PyTime_AsTimespec(TyObject *self, TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "O", &obj)) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    struct timespec ts;
    if (_TyTime_AsTimespec(t, &ts) == -1) {
        return NULL;
    }
    return Ty_BuildValue("Nl", _TyLong_FromTime_t(ts.tv_sec), ts.tv_nsec);
}

static TyObject *
test_PyTime_AsTimespec_clamp(TyObject *self, TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "O", &obj)) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    struct timespec ts;
    _TyTime_AsTimespec_clamp(t, &ts);
    return Ty_BuildValue("Nl", _TyLong_FromTime_t(ts.tv_sec), ts.tv_nsec);
}
#endif

static TyObject *
test_PyTime_AsMilliseconds(TyObject *self, TyObject *args)
{
    TyObject *obj;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    TyTime_t ms = _TyTime_AsMilliseconds(t, round);
    return _TyTime_AsLong(ms);
}

static TyObject *
test_PyTime_AsMicroseconds(TyObject *self, TyObject *args)
{
    TyObject *obj;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    TyTime_t t;
    if (_TyTime_FromLong(&t, obj) < 0) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    TyTime_t us = _TyTime_AsMicroseconds(t, round);
    return _TyTime_AsLong(us);
}

static TyObject *
test_pytime_object_to_time_t(TyObject *self, TyObject *args)
{
    TyObject *obj;
    time_t sec;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    if (_TyTime_ObjectToTime_t(obj, &sec, round) == -1) {
        return NULL;
    }
    return _TyLong_FromTime_t(sec);
}

static TyObject *
test_pytime_object_to_timeval(TyObject *self, TyObject *args)
{
    TyObject *obj;
    time_t sec;
    long usec;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    if (_TyTime_ObjectToTimeval(obj, &sec, &usec, round) == -1) {
        return NULL;
    }
    return Ty_BuildValue("Nl", _TyLong_FromTime_t(sec), usec);
}

static TyObject *
test_pytime_object_to_timespec(TyObject *self, TyObject *args)
{
    TyObject *obj;
    time_t sec;
    long nsec;
    int round;
    if (!TyArg_ParseTuple(args, "Oi", &obj, &round)) {
        return NULL;
    }
    if (check_time_rounding(round) < 0) {
        return NULL;
    }
    if (_TyTime_ObjectToTimespec(obj, &sec, &nsec, round) == -1) {
        return NULL;
    }
    return Ty_BuildValue("Nl", _TyLong_FromTime_t(sec), nsec);
}

static TyMethodDef TestMethods[] = {
    {"_TyTime_AsMicroseconds",    test_PyTime_AsMicroseconds,     METH_VARARGS},
    {"_TyTime_AsMilliseconds",    test_PyTime_AsMilliseconds,     METH_VARARGS},
#ifdef HAVE_CLOCK_GETTIME
    {"_TyTime_AsTimespec",        test_PyTime_AsTimespec,         METH_VARARGS},
    {"_TyTime_AsTimespec_clamp",  test_PyTime_AsTimespec_clamp,   METH_VARARGS},
#endif
    {"_TyTime_AsTimeval",         test_PyTime_AsTimeval,          METH_VARARGS},
    {"_TyTime_AsTimeval_clamp",   test_PyTime_AsTimeval_clamp,    METH_VARARGS},
    {"_TyTime_FromSeconds",       test_pytime_fromseconds,        METH_VARARGS},
    {"_TyTime_FromSecondsObject", test_pytime_fromsecondsobject,  METH_VARARGS},
    {"_TyTime_ObjectToTime_t",    test_pytime_object_to_time_t,   METH_VARARGS},
    {"_TyTime_ObjectToTimespec",  test_pytime_object_to_timespec, METH_VARARGS},
    {"_TyTime_ObjectToTimeval",   test_pytime_object_to_timeval,  METH_VARARGS},
    {NULL, NULL} /* sentinel */
};

int
_PyTestInternalCapi_Init_PyTime(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }
    return 0;
}
