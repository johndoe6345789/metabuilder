#include "parts.h"


static int
pytime_from_nanoseconds(TyTime_t *tp, TyObject *obj)
{
    if (!TyLong_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "expect int, got %s",
                     Ty_TYPE(obj)->tp_name);
        return -1;
    }

    long long nsec = TyLong_AsLongLong(obj);
    if (nsec == -1 && TyErr_Occurred()) {
        return -1;
    }

    Ty_BUILD_ASSERT(sizeof(long long) == sizeof(TyTime_t));
    *tp = (TyTime_t)nsec;
    return 0;
}


static TyObject *
test_pytime_assecondsdouble(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "O", &obj)) {
        return NULL;
    }
    TyTime_t ts;
    if (pytime_from_nanoseconds(&ts, obj) < 0) {
        return NULL;
    }
    double d = PyTime_AsSecondsDouble(ts);
    return TyFloat_FromDouble(d);
}


static TyObject*
pytime_as_float(TyTime_t t)
{
    return TyFloat_FromDouble(PyTime_AsSecondsDouble(t));
}



static TyObject*
test_pytime_monotonic(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res = PyTime_Monotonic(&t);
    if (res < 0) {
        assert(t == 0);
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyObject*
test_pytime_monotonic_raw(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res;
    Ty_BEGIN_ALLOW_THREADS
    res = PyTime_MonotonicRaw(&t);
    Ty_END_ALLOW_THREADS
    if (res < 0) {
        assert(t == 0);
        TyErr_SetString(TyExc_RuntimeError, "PyTime_MonotonicRaw() failed");
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyObject*
test_pytime_perf_counter(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res = PyTime_PerfCounter(&t);
    if (res < 0) {
        assert(t == 0);
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyObject*
test_pytime_perf_counter_raw(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res;
    Ty_BEGIN_ALLOW_THREADS
    res = PyTime_PerfCounterRaw(&t);
    Ty_END_ALLOW_THREADS
    if (res < 0) {
        assert(t == 0);
        TyErr_SetString(TyExc_RuntimeError, "PyTime_PerfCounterRaw() failed");
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyObject*
test_pytime_time(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res = PyTime_Time(&t);
    if (res < 0) {
        assert(t == 0);
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyObject*
test_pytime_time_raw(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(args))
{
    TyTime_t t;
    int res;
    Ty_BEGIN_ALLOW_THREADS
    res = PyTime_TimeRaw(&t);
    Ty_END_ALLOW_THREADS
    if (res < 0) {
        assert(t == 0);
        TyErr_SetString(TyExc_RuntimeError, "PyTime_TimeRaw() failed");
        return NULL;
    }
    assert(res == 0);
    return pytime_as_float(t);
}


static TyMethodDef test_methods[] = {
    {"PyTime_AsSecondsDouble", test_pytime_assecondsdouble, METH_VARARGS},
    {"PyTime_Monotonic", test_pytime_monotonic, METH_NOARGS},
    {"PyTime_MonotonicRaw", test_pytime_monotonic_raw, METH_NOARGS},
    {"PyTime_PerfCounter", test_pytime_perf_counter, METH_NOARGS},
    {"PyTime_PerfCounterRaw", test_pytime_perf_counter_raw, METH_NOARGS},
    {"PyTime_Time", test_pytime_time, METH_NOARGS},
    {"PyTime_TimeRaw", test_pytime_time_raw, METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_Time(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }
    Ty_BUILD_ASSERT(sizeof(long long) == sizeof(TyTime_t));
    if (TyModule_AddObject(m, "PyTime_MIN", TyLong_FromLongLong(PyTime_MIN)) < 0) {
        return 1;
    }
    if (TyModule_AddObject(m, "PyTime_MAX", TyLong_FromLongLong(PyTime_MAX)) < 0) {
        return 1;
    }
    return 0;
}
