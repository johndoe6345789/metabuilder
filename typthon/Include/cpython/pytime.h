// TyTime_t C API: see Doc/c-api/time.rst for the documentation.

#ifndef Ty_LIMITED_API
#ifndef Ty_PYTIME_H
#define Ty_PYTIME_H
#ifdef __cplusplus
extern "C" {
#endif

typedef int64_t TyTime_t;
#define PyTime_MIN INT64_MIN
#define PyTime_MAX INT64_MAX

PyAPI_FUNC(double) PyTime_AsSecondsDouble(TyTime_t t);
PyAPI_FUNC(int) PyTime_Monotonic(TyTime_t *result);
PyAPI_FUNC(int) PyTime_PerfCounter(TyTime_t *result);
PyAPI_FUNC(int) PyTime_Time(TyTime_t *result);

PyAPI_FUNC(int) PyTime_MonotonicRaw(TyTime_t *result);
PyAPI_FUNC(int) PyTime_PerfCounterRaw(TyTime_t *result);
PyAPI_FUNC(int) PyTime_TimeRaw(TyTime_t *result);

#ifdef __cplusplus
}
#endif
#endif /* Ty_PYTIME_H */
#endif /* Ty_LIMITED_API */
