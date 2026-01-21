/*  C implementation of the datetime module */

/* bpo-35081: Defining this prevents including the C API capsule;
 * internal versions of the  Py*_Check macros which do not require
 * the capsule are defined below */
#define _PY_DATETIME_IMPL

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_object.h"        // _TyObject_Init()
#include "pycore_time.h"          // _TyTime_ObjectToTime_t()
#include "pycore_unicodeobject.h" // _TyUnicode_Copy()
#include "pycore_initconfig.h"    // _TyStatus_OK()

#include "datetime.h"


#include <time.h>

#ifdef MS_WINDOWS
#  include <winsock2.h>         /* struct timeval */
#endif


/* forward declarations */
static TyTypeObject PyDateTime_DateType;
static TyTypeObject PyDateTime_DateTimeType;
static TyTypeObject PyDateTime_TimeType;
static TyTypeObject PyDateTime_DeltaType;
static TyTypeObject PyDateTime_TZInfoType;
static TyTypeObject PyDateTime_TimeZoneType;


typedef struct {
    /* Module heap types. */
    TyTypeObject *isocalendar_date_type;

    /* Conversion factors. */
    TyObject *us_per_ms;       // 1_000
    TyObject *us_per_second;   // 1_000_000
    TyObject *us_per_minute;   // 1e6 * 60 as Python int
    TyObject *us_per_hour;     // 1e6 * 3600 as Python int
    TyObject *us_per_day;      // 1e6 * 3600 * 24 as Python int
    TyObject *us_per_week;     // 1e6 * 3600 * 24 * 7 as Python int
    TyObject *seconds_per_day; // 3600 * 24 as Python int

    /* The interned Unix epoch datetime instance */
    TyObject *epoch;
} datetime_state;

/* The module has a fixed number of static objects, due to being exposed
 * through the datetime C-API.  There are five types exposed directly,
 * one type exposed indirectly, and one singleton constant (UTC).
 *
 * Each of these objects is hidden behind a macro in the same way as
 * the per-module objects stored in module state.  The macros for the
 * static objects don't need to be passed a state, but the consistency
 * of doing so is more clear.  We use a dedicated noop macro, NO_STATE,
 * to make the special case obvious.
 *
 * The casting macros perform a simple fast pointer cast without
 * checking the runtime type. In the future, we may decide whether
 * to include that check and whether to provide a fast pointer cast
 * macro for pointers known to be of correct time.
 */

#define NO_STATE NULL

#define DATE_TYPE(st) &PyDateTime_DateType
#define DATETIME_TYPE(st) &PyDateTime_DateTimeType
#define TIME_TYPE(st) &PyDateTime_TimeType
#define DELTA_TYPE(st) &PyDateTime_DeltaType
#define TZINFO_TYPE(st) &PyDateTime_TZInfoType
#define TIMEZONE_TYPE(st) &PyDateTime_TimeZoneType
#define ISOCALENDAR_DATE_TYPE(st) st->isocalendar_date_type

#define PyDate_CAST(op) ((PyDateTime_Date *)(op))
#define PyDate_Check(op) PyObject_TypeCheck(op, DATE_TYPE(NO_STATE))
#define PyDate_CheckExact(op) Ty_IS_TYPE(op, DATE_TYPE(NO_STATE))

#define PyDateTime_CAST(op) ((PyDateTime_DateTime *)(op))
#define PyDateTime_Check(op) PyObject_TypeCheck(op, DATETIME_TYPE(NO_STATE))
#define PyDateTime_CheckExact(op) Ty_IS_TYPE(op, DATETIME_TYPE(NO_STATE))

#define PyTime_CAST(op) ((PyDateTime_Time *)(op))
#define PyTime_Check(op) PyObject_TypeCheck(op, TIME_TYPE(NO_STATE))
#define PyTime_CheckExact(op) Ty_IS_TYPE(op, TIME_TYPE(NO_STATE))

#define PyDelta_CAST(op) ((PyDateTime_Delta *)(op))
#define PyDelta_Check(op) PyObject_TypeCheck(op, DELTA_TYPE(NO_STATE))
#define PyDelta_CheckExact(op) Ty_IS_TYPE(op, DELTA_TYPE(NO_STATE))

#define PyTZInfo_CAST(op) ((PyDateTime_TZInfo *)(op))
#define PyTZInfo_Check(op) PyObject_TypeCheck(op, TZINFO_TYPE(NO_STATE))
#define PyTZInfo_CheckExact(op) Ty_IS_TYPE(op, TZINFO_TYPE(NO_STATE))

#define PyTimeZone_CAST(op) ((PyDateTime_TimeZone *)(op))
#define PyTimezone_Check(op) PyObject_TypeCheck(op, TIMEZONE_TYPE(NO_STATE))

#define PyIsoCalendarDate_CAST(op) ((PyDateTime_IsoCalendarDate *)(op))

#define CONST_US_PER_MS(st) st->us_per_ms
#define CONST_US_PER_SECOND(st) st->us_per_second
#define CONST_US_PER_MINUTE(st) st->us_per_minute
#define CONST_US_PER_HOUR(st) st->us_per_hour
#define CONST_US_PER_DAY(st) st->us_per_day
#define CONST_US_PER_WEEK(st) st->us_per_week
#define CONST_SEC_PER_DAY(st) st->seconds_per_day
#define CONST_EPOCH(st) st->epoch
#define CONST_UTC(st) ((TyObject *)&utc_timezone)

static datetime_state *
get_module_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (datetime_state *)state;
}


#define INTERP_KEY ((TyObject *)&_Ty_ID(cached_datetime_module))

static TyObject *
get_current_module(TyInterpreterState *interp)
{
    TyObject *mod = NULL;

    TyObject *dict = TyInterpreterState_GetDict(interp);
    if (dict == NULL) {
        goto error;
    }
    TyObject *ref = NULL;
    if (TyDict_GetItemRef(dict, INTERP_KEY, &ref) < 0) {
        goto error;
    }
    if (ref != NULL) {
        if (ref != Ty_None) {
            (void)PyWeakref_GetRef(ref, &mod);
            if (mod == Ty_None) {
                Ty_CLEAR(mod);
            }
            Ty_DECREF(ref);
        }
    }
    return mod;

error:
    assert(TyErr_Occurred());
    return NULL;
}

static TyModuleDef datetimemodule;

static datetime_state *
_get_current_state(TyObject **p_mod)
{
    TyInterpreterState *interp = TyInterpreterState_Get();
    TyObject *mod = get_current_module(interp);
    if (mod == NULL) {
        assert(!TyErr_Occurred());
        if (TyErr_Occurred()) {
            return NULL;
        }
        /* The static types can outlive the module,
         * so we must re-import the module. */
        mod = TyImport_ImportModule("_datetime");
        if (mod == NULL) {
            return NULL;
        }
    }
    datetime_state *st = get_module_state(mod);
    *p_mod = mod;
    return st;
}

#define GET_CURRENT_STATE(MOD_VAR)  \
    _get_current_state(&MOD_VAR)
#define RELEASE_CURRENT_STATE(ST_VAR, MOD_VAR)  \
    Ty_DECREF(MOD_VAR)

static int
set_current_module(TyInterpreterState *interp, TyObject *mod)
{
    assert(mod != NULL);
    TyObject *dict = TyInterpreterState_GetDict(interp);
    if (dict == NULL) {
        return -1;
    }
    TyObject *ref = PyWeakref_NewRef(mod, NULL);
    if (ref == NULL) {
        return -1;
    }
    int rc = TyDict_SetItem(dict, INTERP_KEY, ref);
    Ty_DECREF(ref);
    return rc;
}

static void
clear_current_module(TyInterpreterState *interp, TyObject *expected)
{
    TyObject *exc = TyErr_GetRaisedException();

    TyObject *dict = TyInterpreterState_GetDict(interp);
    if (dict == NULL) {
        goto error;
    }

    if (expected != NULL) {
        TyObject *ref = NULL;
        if (TyDict_GetItemRef(dict, INTERP_KEY, &ref) < 0) {
            goto error;
        }
        if (ref != NULL) {
            TyObject *current = NULL;
            int rc = PyWeakref_GetRef(ref, &current);
            /* We only need "current" for pointer comparison. */
            Ty_XDECREF(current);
            Ty_DECREF(ref);
            if (rc < 0) {
                goto error;
            }
            if (current != expected) {
                goto finally;
            }
        }
    }

    /* We use None to identify that the module was previously loaded. */
    if (TyDict_SetItem(dict, INTERP_KEY, Ty_None) < 0) {
        goto error;
    }

    goto finally;

error:
    TyErr_FormatUnraisable("Exception ignored while clearing _datetime module");

finally:
    TyErr_SetRaisedException(exc);
}


/* We require that C int be at least 32 bits, and use int virtually
 * everywhere.  In just a few cases we use a temp long, where a Python
 * API returns a C long.  In such cases, we have to ensure that the
 * final result fits in a C int (this can be an issue on 64-bit boxes).
 */
#if SIZEOF_INT < 4
#       error "_datetime.c requires that C int have at least 32 bits"
#endif

#define MINYEAR 1
#define MAXYEAR 9999
#define MAXORDINAL 3652059 /* date(9999,12,31).toordinal() */

/* Nine decimal digits is easy to communicate, and leaves enough room
 * so that two delta days can be added w/o fear of overflowing a signed
 * 32-bit int, and with plenty of room left over to absorb any possible
 * carries from adding seconds.
 */
#define MAX_DELTA_DAYS 999999999

/* Rename the long macros in datetime.h to more reasonable short names. */
#define GET_YEAR                PyDateTime_GET_YEAR
#define GET_MONTH               PyDateTime_GET_MONTH
#define GET_DAY                 PyDateTime_GET_DAY
#define DATE_GET_HOUR           PyDateTime_DATE_GET_HOUR
#define DATE_GET_MINUTE         PyDateTime_DATE_GET_MINUTE
#define DATE_GET_SECOND         PyDateTime_DATE_GET_SECOND
#define DATE_GET_MICROSECOND    PyDateTime_DATE_GET_MICROSECOND
#define DATE_GET_FOLD           PyDateTime_DATE_GET_FOLD

/* Date accessors for date and datetime. */
#define SET_YEAR(o, v)          (((o)->data[0] = ((v) & 0xff00) >> 8), \
                 ((o)->data[1] = ((v) & 0x00ff)))
#define SET_MONTH(o, v)         (PyDateTime_GET_MONTH(o) = (v))
#define SET_DAY(o, v)           (PyDateTime_GET_DAY(o) = (v))

/* Date/Time accessors for datetime. */
#define DATE_SET_HOUR(o, v)     (PyDateTime_DATE_GET_HOUR(o) = (v))
#define DATE_SET_MINUTE(o, v)   (PyDateTime_DATE_GET_MINUTE(o) = (v))
#define DATE_SET_SECOND(o, v)   (PyDateTime_DATE_GET_SECOND(o) = (v))
#define DATE_SET_MICROSECOND(o, v)      \
    (((o)->data[7] = ((v) & 0xff0000) >> 16), \
     ((o)->data[8] = ((v) & 0x00ff00) >> 8), \
     ((o)->data[9] = ((v) & 0x0000ff)))
#define DATE_SET_FOLD(o, v)   (PyDateTime_DATE_GET_FOLD(o) = (v))

/* Time accessors for time. */
#define TIME_GET_HOUR           PyDateTime_TIME_GET_HOUR
#define TIME_GET_MINUTE         PyDateTime_TIME_GET_MINUTE
#define TIME_GET_SECOND         PyDateTime_TIME_GET_SECOND
#define TIME_GET_MICROSECOND    PyDateTime_TIME_GET_MICROSECOND
#define TIME_GET_FOLD           PyDateTime_TIME_GET_FOLD
#define TIME_SET_HOUR(o, v)     (PyDateTime_TIME_GET_HOUR(o) = (v))
#define TIME_SET_MINUTE(o, v)   (PyDateTime_TIME_GET_MINUTE(o) = (v))
#define TIME_SET_SECOND(o, v)   (PyDateTime_TIME_GET_SECOND(o) = (v))
#define TIME_SET_MICROSECOND(o, v)      \
    (((o)->data[3] = ((v) & 0xff0000) >> 16), \
     ((o)->data[4] = ((v) & 0x00ff00) >> 8), \
     ((o)->data[5] = ((v) & 0x0000ff)))
#define TIME_SET_FOLD(o, v)   (PyDateTime_TIME_GET_FOLD(o) = (v))

/* Delta accessors for timedelta. */
#define GET_TD_DAYS(o)          (PyDelta_CAST(o)->days)
#define GET_TD_SECONDS(o)       (PyDelta_CAST(o)->seconds)
#define GET_TD_MICROSECONDS(o)  (PyDelta_CAST(o)->microseconds)

#define SET_TD_DAYS(o, v)       ((o)->days = (v))
#define SET_TD_SECONDS(o, v)    ((o)->seconds = (v))
#define SET_TD_MICROSECONDS(o, v) ((o)->microseconds = (v))

#define HASTZINFO               _PyDateTime_HAS_TZINFO
#define GET_TIME_TZINFO         PyDateTime_TIME_GET_TZINFO
#define GET_DT_TZINFO           PyDateTime_DATE_GET_TZINFO
/* M is a char or int claiming to be a valid month.  The macro is equivalent
 * to the two-sided Python test
 *      1 <= M <= 12
 */
#define MONTH_IS_SANE(M) ((unsigned int)(M) - 1 < 12)

static int check_tzinfo_subclass(TyObject *p);

/*[clinic input]
module datetime
class datetime.datetime "PyDateTime_DateTime *" "get_datetime_state()->datetime_type"
class datetime.date "PyDateTime_Date *" "get_datetime_state()->date_type"
class datetime.time "PyDateTime_Time *" "get_datetime_state()->time_type"
class datetime.IsoCalendarDate "PyDateTime_IsoCalendarDate *" "get_datetime_state()->isocalendar_date_type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=c8f3d834a860d50a]*/

#include "clinic/_datetimemodule.c.h"


/* ---------------------------------------------------------------------------
 * Math utilities.
 */

/* k = i+j overflows iff k differs in sign from both inputs,
 * iff k^i has sign bit set and k^j has sign bit set,
 * iff (k^i)&(k^j) has sign bit set.
 */
#define SIGNED_ADD_OVERFLOWED(RESULT, I, J) \
    ((((RESULT) ^ (I)) & ((RESULT) ^ (J))) < 0)

/* Compute Python divmod(x, y), returning the quotient and storing the
 * remainder into *r.  The quotient is the floor of x/y, and that's
 * the real point of this.  C will probably truncate instead (C99
 * requires truncation; C89 left it implementation-defined).
 * Simplification:  we *require* that y > 0 here.  That's appropriate
 * for all the uses made of it.  This simplifies the code and makes
 * the overflow case impossible (divmod(LONG_MIN, -1) is the only
 * overflow case).
 */
static int
divmod(int x, int y, int *r)
{
    int quo;

    assert(y > 0);
    quo = x / y;
    *r = x - quo * y;
    if (*r < 0) {
        --quo;
        *r += y;
    }
    assert(0 <= *r && *r < y);
    return quo;
}

/* Nearest integer to m / n for integers m and n. Half-integer results
 * are rounded to even.
 */
static TyObject *
divide_nearest(TyObject *m, TyObject *n)
{
    TyObject *result;
    TyObject *temp;

    temp = _TyLong_DivmodNear(m, n);
    if (temp == NULL)
        return NULL;
    result = Ty_NewRef(TyTuple_GET_ITEM(temp, 0));
    Ty_DECREF(temp);

    return result;
}

/* ---------------------------------------------------------------------------
 * General calendrical helper functions
 */

/* For each month ordinal in 1..12, the number of days in that month,
 * and the number of days before that month in the same year.  These
 * are correct for non-leap years only.
 */
static const int _days_in_month[] = {
    0, /* unused; this vector uses 1-based indexing */
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
};

static const int _days_before_month[] = {
    0, /* unused; this vector uses 1-based indexing */
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334
};

/* year -> 1 if leap year, else 0. */
static int
is_leap(int year)
{
    /* Cast year to unsigned.  The result is the same either way, but
     * C can generate faster code for unsigned mod than for signed
     * mod (especially for % 4 -- a good compiler should just grab
     * the last 2 bits when the LHS is unsigned).
     */
    const unsigned int ayear = (unsigned int)year;
    return ayear % 4 == 0 && (ayear % 100 != 0 || ayear % 400 == 0);
}

/* year, month -> number of days in that month in that year */
static int
days_in_month(int year, int month)
{
    assert(month >= 1);
    assert(month <= 12);
    if (month == 2 && is_leap(year))
        return 29;
    else
        return _days_in_month[month];
}

/* year, month -> number of days in year preceding first day of month */
static int
days_before_month(int year, int month)
{
    int days;

    assert(month >= 1);
    assert(month <= 12);
    days = _days_before_month[month];
    if (month > 2 && is_leap(year))
        ++days;
    return days;
}

/* year -> number of days before January 1st of year.  Remember that we
 * start with year 1, so days_before_year(1) == 0.
 */
static int
days_before_year(int year)
{
    int y = year - 1;
    /* This is incorrect if year <= 0; we really want the floor
     * here.  But so long as MINYEAR is 1, the smallest year this
     * can see is 1.
     */
    assert (year >= 1);
    return y*365 + y/4 - y/100 + y/400;
}

/* Number of days in 4, 100, and 400 year cycles.  That these have
 * the correct values is asserted in the module init function.
 */
#define DI4Y    1461    /* days_before_year(5); days in 4 years */
#define DI100Y  36524   /* days_before_year(101); days in 100 years */
#define DI400Y  146097  /* days_before_year(401); days in 400 years  */

/* ordinal -> year, month, day, considering 01-Jan-0001 as day 1. */
static void
ord_to_ymd(int ordinal, int *year, int *month, int *day)
{
    int n, n1, n4, n100, n400, leapyear, preceding;

    /* ordinal is a 1-based index, starting at 1-Jan-1.  The pattern of
     * leap years repeats exactly every 400 years.  The basic strategy is
     * to find the closest 400-year boundary at or before ordinal, then
     * work with the offset from that boundary to ordinal.  Life is much
     * clearer if we subtract 1 from ordinal first -- then the values
     * of ordinal at 400-year boundaries are exactly those divisible
     * by DI400Y:
     *
     *    D  M   Y            n              n-1
     *    -- --- ----        ----------     ----------------
     *    31 Dec -400        -DI400Y       -DI400Y -1
     *     1 Jan -399         -DI400Y +1   -DI400Y      400-year boundary
     *    ...
     *    30 Dec  000        -1             -2
     *    31 Dec  000         0             -1
     *     1 Jan  001         1              0          400-year boundary
     *     2 Jan  001         2              1
     *     3 Jan  001         3              2
     *    ...
     *    31 Dec  400         DI400Y        DI400Y -1
     *     1 Jan  401         DI400Y +1     DI400Y      400-year boundary
     */
    assert(ordinal >= 1);
    --ordinal;
    n400 = ordinal / DI400Y;
    n = ordinal % DI400Y;
    *year = n400 * 400 + 1;

    /* Now n is the (non-negative) offset, in days, from January 1 of
     * year, to the desired date.  Now compute how many 100-year cycles
     * precede n.
     * Note that it's possible for n100 to equal 4!  In that case 4 full
     * 100-year cycles precede the desired day, which implies the
     * desired day is December 31 at the end of a 400-year cycle.
     */
    n100 = n / DI100Y;
    n = n % DI100Y;

    /* Now compute how many 4-year cycles precede it. */
    n4 = n / DI4Y;
    n = n % DI4Y;

    /* And now how many single years.  Again n1 can be 4, and again
     * meaning that the desired day is December 31 at the end of the
     * 4-year cycle.
     */
    n1 = n / 365;
    n = n % 365;

    *year += n100 * 100 + n4 * 4 + n1;
    if (n1 == 4 || n100 == 4) {
        assert(n == 0);
        *year -= 1;
        *month = 12;
        *day = 31;
        return;
    }

    /* Now the year is correct, and n is the offset from January 1.  We
     * find the month via an estimate that's either exact or one too
     * large.
     */
    leapyear = n1 == 3 && (n4 != 24 || n100 == 3);
    assert(leapyear == is_leap(*year));
    *month = (n + 50) >> 5;
    preceding = (_days_before_month[*month] + (*month > 2 && leapyear));
    if (preceding > n) {
        /* estimate is too large */
        *month -= 1;
        preceding -= days_in_month(*year, *month);
    }
    n -= preceding;
    assert(0 <= n);
    assert(n < days_in_month(*year, *month));

    *day = n + 1;
}

/* year, month, day -> ordinal, considering 01-Jan-0001 as day 1. */
static int
ymd_to_ord(int year, int month, int day)
{
    return days_before_year(year) + days_before_month(year, month) + day;
}

/* Day of week, where Monday==0, ..., Sunday==6.  1/1/1 was a Monday. */
static int
weekday(int year, int month, int day)
{
    return (ymd_to_ord(year, month, day) + 6) % 7;
}

/* Ordinal of the Monday starting week 1 of the ISO year.  Week 1 is the
 * first calendar week containing a Thursday.
 */
static int
iso_week1_monday(int year)
{
    int first_day = ymd_to_ord(year, 1, 1);     /* ord of 1/1 */
    /* 0 if 1/1 is a Monday, 1 if a Tue, etc. */
    int first_weekday = (first_day + 6) % 7;
    /* ordinal of closest Monday at or before 1/1 */
    int week1_monday  = first_day - first_weekday;

    if (first_weekday > 3)      /* if 1/1 was Fri, Sat, Sun */
        week1_monday += 7;
    return week1_monday;
}

static int
iso_to_ymd(const int iso_year, const int iso_week, const int iso_day,
           int *year, int *month, int *day) {
    // Year is bounded to 0 < year < 10000 because 9999-12-31 is (9999, 52, 5)
    if (iso_year < MINYEAR || iso_year > MAXYEAR) {
        return -4;
    }
    if (iso_week <= 0 || iso_week >= 53) {
        int out_of_range = 1;
        if (iso_week == 53) {
            // ISO years have 53 weeks in it on years starting with a Thursday
            // and on leap years starting on Wednesday
            int first_weekday = weekday(iso_year, 1, 1);
            if (first_weekday == 3 || (first_weekday == 2 && is_leap(iso_year))) {
                out_of_range = 0;
            }
        }

        if (out_of_range) {
            return -2;
        }
    }

    if (iso_day <= 0 || iso_day >= 8) {
        return -3;
    }

    // Convert (Y, W, D) to (Y, M, D) in-place
    int day_1 = iso_week1_monday(iso_year);

    int day_offset = (iso_week - 1)*7 + iso_day - 1;

    ord_to_ymd(day_1 + day_offset, year, month, day);
    return 0;
}


/* ---------------------------------------------------------------------------
 * Range checkers.
 */

/* Check that -MAX_DELTA_DAYS <= days <= MAX_DELTA_DAYS.  If so, return 0.
 * If not, raise OverflowError and return -1.
 */
static int
check_delta_day_range(int days)
{
    if (-MAX_DELTA_DAYS <= days && days <= MAX_DELTA_DAYS)
        return 0;
    TyErr_Format(TyExc_OverflowError,
                 "days=%d; must have magnitude <= %d",
                 days, MAX_DELTA_DAYS);
    return -1;
}

/* Check that date arguments are in range.  Return 0 if they are.  If they
 * aren't, raise ValueError and return -1.
 */
static int
check_date_args(int year, int month, int day)
{

    if (year < MINYEAR || year > MAXYEAR) {
        TyErr_Format(TyExc_ValueError,
                     "year must be in %d..%d, not %d", MINYEAR, MAXYEAR, year);
        return -1;
    }
    if (month < 1 || month > 12) {
        TyErr_Format(TyExc_ValueError,
                     "month must be in 1..12, not %d", month);
        return -1;
    }
    int dim = days_in_month(year, month);
    if (day < 1 || day > dim) {
        TyErr_Format(TyExc_ValueError,
                     "day %i must be in range 1..%d for month %i in year %i",
                     day, dim, month, year);
        return -1;
    }
    return 0;
}

/* Check that time arguments are in range.  Return 0 if they are.  If they
 * aren't, raise ValueError and return -1.
 */
static int
check_time_args(int h, int m, int s, int us, int fold)
{
    if (h < 0 || h > 23) {
        TyErr_Format(TyExc_ValueError, "hour must be in 0..23, not %i", h);
        return -1;
    }
    if (m < 0 || m > 59) {
        TyErr_Format(TyExc_ValueError, "minute must be in 0..59, not %i", m);
        return -1;
    }
    if (s < 0 || s > 59) {
        TyErr_Format(TyExc_ValueError, "second must be in 0..59, not %i", s);
        return -1;
    }
    if (us < 0 || us > 999999) {
        TyErr_Format(TyExc_ValueError,
                     "microsecond must be in 0..999999, not %i", us);
        return -1;
    }
    if (fold != 0 && fold != 1) {
        TyErr_Format(TyExc_ValueError,
                     "fold must be either 0 or 1, not %i", fold);
        return -1;
    }
    return 0;
}

/* ---------------------------------------------------------------------------
 * Normalization utilities.
 */

/* One step of a mixed-radix conversion.  A "hi" unit is equivalent to
 * factor "lo" units.  factor must be > 0.  If *lo is less than 0, or
 * at least factor, enough of *lo is converted into "hi" units so that
 * 0 <= *lo < factor.  The input values must be such that int overflow
 * is impossible.
 */
static void
normalize_pair(int *hi, int *lo, int factor)
{
    assert(factor > 0);
    assert(lo != hi);
    if (*lo < 0 || *lo >= factor) {
        const int num_hi = divmod(*lo, factor, lo);
        const int new_hi = *hi + num_hi;
        assert(! SIGNED_ADD_OVERFLOWED(new_hi, *hi, num_hi));
        *hi = new_hi;
    }
    assert(0 <= *lo && *lo < factor);
}

/* Fiddle days (d), seconds (s), and microseconds (us) so that
 *      0 <= *s < 24*3600
 *      0 <= *us < 1000000
 * The input values must be such that the internals don't overflow.
 * The way this routine is used, we don't get close.
 */
static void
normalize_d_s_us(int *d, int *s, int *us)
{
    if (*us < 0 || *us >= 1000000) {
        normalize_pair(s, us, 1000000);
        /* |s| can't be bigger than about
         * |original s| + |original us|/1000000 now.
         */

    }
    if (*s < 0 || *s >= 24*3600) {
        normalize_pair(d, s, 24*3600);
        /* |d| can't be bigger than about
         * |original d| +
         * (|original s| + |original us|/1000000) / (24*3600) now.
         */
    }
    assert(0 <= *s && *s < 24*3600);
    assert(0 <= *us && *us < 1000000);
}

/* Fiddle years (y), months (m), and days (d) so that
 *      1 <= *m <= 12
 *      1 <= *d <= days_in_month(*y, *m)
 * The input values must be such that the internals don't overflow.
 * The way this routine is used, we don't get close.
 */
static int
normalize_y_m_d(int *y, int *m, int *d)
{
    int dim;            /* # of days in month */

    /* In actual use, m is always the month component extracted from a
     * date/datetime object.  Therefore it is always in [1, 12] range.
     */

    assert(1 <= *m && *m <= 12);

    /* Now only day can be out of bounds (year may also be out of bounds
     * for a datetime object, but we don't care about that here).
     * If day is out of bounds, what to do is arguable, but at least the
     * method here is principled and explainable.
     */
    dim = days_in_month(*y, *m);
    if (*d < 1 || *d > dim) {
        /* Move day-1 days from the first of the month.  First try to
         * get off cheap if we're only one day out of range
         * (adjustments for timezone alone can't be worse than that).
         */
        if (*d == 0) {
            --*m;
            if (*m > 0)
                *d = days_in_month(*y, *m);
            else {
                --*y;
                *m = 12;
                *d = 31;
            }
        }
        else if (*d == dim + 1) {
            /* move forward a day */
            ++*m;
            *d = 1;
            if (*m > 12) {
                *m = 1;
                ++*y;
            }
        }
        else {
            int ordinal = ymd_to_ord(*y, *m, 1) +
                                      *d - 1;
            if (ordinal < 1 || ordinal > MAXORDINAL) {
                goto error;
            } else {
                ord_to_ymd(ordinal, y, m, d);
                return 0;
            }
        }
    }
    assert(*m > 0);
    assert(*d > 0);
    if (MINYEAR <= *y && *y <= MAXYEAR)
        return 0;
 error:
    TyErr_SetString(TyExc_OverflowError,
            "date value out of range");
    return -1;

}

/* Fiddle out-of-bounds months and days so that the result makes some kind
 * of sense.  The parameters are both inputs and outputs.  Returns < 0 on
 * failure, where failure means the adjusted year is out of bounds.
 */
static int
normalize_date(int *year, int *month, int *day)
{
    return normalize_y_m_d(year, month, day);
}

/* Force all the datetime fields into range.  The parameters are both
 * inputs and outputs.  Returns < 0 on error.
 */
static int
normalize_datetime(int *year, int *month, int *day,
                   int *hour, int *minute, int *second,
                   int *microsecond)
{
    normalize_pair(second, microsecond, 1000000);
    normalize_pair(minute, second, 60);
    normalize_pair(hour, minute, 60);
    normalize_pair(day, hour, 24);
    return normalize_date(year, month, day);
}

/* ---------------------------------------------------------------------------
 * Basic object allocation:  tp_alloc implementations.  These allocate
 * Python objects of the right size and type, and do the Python object-
 * initialization bit.  If there's not enough memory, they return NULL after
 * setting MemoryError.  All data members remain uninitialized trash.
 *
 * We abuse the tp_alloc "nitems" argument to communicate whether a tzinfo
 * member is needed.  This is ugly, imprecise, and possibly insecure.
 * tp_basicsize for the time and datetime types is set to the size of the
 * struct that has room for the tzinfo member, so subclasses in Python will
 * allocate enough space for a tzinfo member whether or not one is actually
 * needed.  That's the "ugly and imprecise" parts.  The "possibly insecure"
 * part is that TyType_GenericAlloc() (which subclasses in Python end up
 * using) just happens today to effectively ignore the nitems argument
 * when tp_itemsize is 0, which it is for these type objects.  If that
 * changes, perhaps the callers of tp_alloc slots in this file should
 * be changed to force a 0 nitems argument unless the type being allocated
 * is a base type implemented in this file (so that tp_alloc is time_alloc
 * or datetime_alloc below, which know about the nitems abuse).
 */

static TyObject *
time_alloc(TyTypeObject *type, Ty_ssize_t aware)
{
    size_t size = aware ? sizeof(PyDateTime_Time) : sizeof(_PyDateTime_BaseTime);
    TyObject *self = (TyObject *)PyObject_Malloc(size);
    if (self == NULL) {
        return TyErr_NoMemory();
    }
    _TyObject_Init(self, type);
    return self;
}

static TyObject *
datetime_alloc(TyTypeObject *type, Ty_ssize_t aware)
{
    size_t size = aware ? sizeof(PyDateTime_DateTime) : sizeof(_PyDateTime_BaseDateTime);
    TyObject *self = (TyObject *)PyObject_Malloc(size);
    if (self == NULL) {
        return TyErr_NoMemory();
    }
    _TyObject_Init(self, type);
    return self;
}

/* ---------------------------------------------------------------------------
 * Helpers for setting object fields.  These work on pointers to the
 * appropriate base class.
 */

/* For date and datetime. */
static void
set_date_fields(PyDateTime_Date *self, int y, int m, int d)
{
    self->hashcode = -1;
    SET_YEAR(self, y);
    SET_MONTH(self, m);
    SET_DAY(self, d);
}

/* ---------------------------------------------------------------------------
 * String parsing utilities and helper functions
 */

static unsigned char
is_digit(const char c) {
    return ((unsigned int)(c - '0')) < 10;
}

static const char *
parse_digits(const char *ptr, int *var, size_t num_digits)
{
    for (size_t i = 0; i < num_digits; ++i) {
        unsigned int tmp = (unsigned int)(*(ptr++) - '0');
        if (tmp > 9) {
            return NULL;
        }
        *var *= 10;
        *var += (signed int)tmp;
    }

    return ptr;
}

static int
parse_isoformat_date(const char *dtstr, const size_t len, int *year, int *month, int *day)
{
    /* Parse the date components of the result of date.isoformat()
     *
     *  Return codes:
     *       0:  Success
     *      -1:  Failed to parse date component
     *      -2:  Inconsistent date separator usage
     *      -3:  Failed to parse ISO week.
     *      -4:  Failed to parse ISO day.
     *      -5, -6, -7: Failure in iso_to_ymd
     */
    const char *p = dtstr;
    p = parse_digits(p, year, 4);
    if (NULL == p) {
        return -1;
    }

    const unsigned char uses_separator = (*p == '-');
    if (uses_separator) {
        ++p;
    }

    if(*p == 'W') {
        // This is an isocalendar-style date string
        p++;
        int iso_week = 0;
        int iso_day = 0;

        p = parse_digits(p, &iso_week, 2);
        if (NULL == p) {
            return -3;
        }

        assert(p > dtstr);
        if ((size_t)(p - dtstr) < len) {
            if (uses_separator && *(p++) != '-') {
                return -2;
            }

            p = parse_digits(p, &iso_day, 1);
            if (NULL == p) {
                return -4;
            }
        } else {
            iso_day = 1;
        }

        int rv = iso_to_ymd(*year, iso_week, iso_day, year, month, day);
        if (rv) {
            return -3 + rv;
        } else {
            return 0;
        }
    }

    p = parse_digits(p, month, 2);
    if (NULL == p) {
        return -1;
    }

    if (uses_separator && *(p++) != '-') {
        return -2;
    }
    p = parse_digits(p, day, 2);
    if (p == NULL) {
        return -1;
    }
    return 0;
}

static int
parse_hh_mm_ss_ff(const char *tstr, const char *tstr_end, int *hour,
                  int *minute, int *second, int *microsecond)
{
    *hour = *minute = *second = *microsecond = 0;
    const char *p = tstr;
    const char *p_end = tstr_end;
    int *vals[3] = {hour, minute, second};
    // This is initialized to satisfy an erroneous compiler warning.
    unsigned char has_separator = 1;

    // Parse [HH[:?MM[:?SS]]]
    for (size_t i = 0; i < 3; ++i) {
        p = parse_digits(p, vals[i], 2);
        if (NULL == p) {
            return -3;
        }

        char c = *(p++);
        if (i == 0) {
            has_separator = (c == ':');
        }

        if (p >= p_end) {
            return c != '\0';
        }
        else if (has_separator && (c == ':')) {
            if (i == 2) {
                return -4;  // Malformed microsecond separator
            }
            continue;
        }
        else if (c == '.' || c == ',') {
            if (i < 2) {
                return -3; // Decimal mark on hour or minute
            }
            break;
        } else if (!has_separator) {
            --p;
        } else {
            return -4;  // Malformed time separator
        }
    }

    // Parse fractional components
    size_t len_remains = p_end - p;
    size_t to_parse = len_remains;
    if (len_remains >= 6) {
        to_parse = 6;
    }

    p = parse_digits(p, microsecond, to_parse);
    if (NULL == p) {
        return -3;
    }

    static int correction[] = {
        100000, 10000, 1000, 100, 10
    };

    if (to_parse < 6) {
        *microsecond *= correction[to_parse-1];
    }

    while (is_digit(*p)){
        ++p; // skip truncated digits
    }

    // Return 1 if it's not the end of the string
    return *p != '\0';
}

static int
parse_isoformat_time(const char *dtstr, size_t dtlen, int *hour, int *minute,
                     int *second, int *microsecond, int *tzoffset,
                     int *tzmicrosecond)
{
    // Parse the time portion of a datetime.isoformat() string
    //
    // Return codes:
    //      0:  Success (no tzoffset)
    //      1:  Success (with tzoffset)
    //     -3:  Failed to parse time component
    //     -4:  Failed to parse time separator
    //     -5:  Malformed timezone string

    const char *p = dtstr;
    const char *p_end = dtstr + dtlen;

    const char *tzinfo_pos = p;
    do {
        if (*tzinfo_pos == 'Z' || *tzinfo_pos == '+' || *tzinfo_pos == '-') {
            break;
        }
    } while (++tzinfo_pos < p_end);

    int rv = parse_hh_mm_ss_ff(dtstr, tzinfo_pos, hour, minute, second,
                               microsecond);

    if (rv < 0) {
        return rv;
    }
    else if (tzinfo_pos == p_end) {
        // We know that there's no time zone, so if there's stuff at the
        // end of the string it's an error.
        if (rv == 1) {
            return -5;
        }
        else {
            return 0;
        }
    }

    // Special case UTC / Zulu time.
    if (*tzinfo_pos == 'Z') {
        *tzoffset = 0;
        *tzmicrosecond = 0;

        if (*(tzinfo_pos + 1) != '\0') {
            return -5;
        } else {
            return 1;
        }
    }

    int tzsign = (*tzinfo_pos == '-') ? -1 : 1;
    tzinfo_pos++;
    int tzhour = 0, tzminute = 0, tzsecond = 0;
    rv = parse_hh_mm_ss_ff(tzinfo_pos, p_end, &tzhour, &tzminute, &tzsecond,
                           tzmicrosecond);

    *tzoffset = tzsign * ((tzhour * 3600) + (tzminute * 60) + tzsecond);
    *tzmicrosecond *= tzsign;

    return rv ? -5 : 1;
}

/* ---------------------------------------------------------------------------
 * Create various objects, mostly without range checking.
 */

/* Create a date instance with no range checking. */
static TyObject *
new_date_ex(int year, int month, int day, TyTypeObject *type)
{
    PyDateTime_Date *self;

    if (check_date_args(year, month, day) < 0) {
        return NULL;
    }

    self = (PyDateTime_Date *)(type->tp_alloc(type, 0));
    if (self != NULL)
        set_date_fields(self, year, month, day);
    return (TyObject *)self;
}

#define new_date(year, month, day) \
    new_date_ex(year, month, day, DATE_TYPE(NO_STATE))

// Forward declaration
static TyObject *
new_datetime_ex(int, int, int, int, int, int, int, TyObject *, TyTypeObject *);

/* Create date instance with no range checking, or call subclass constructor */
static TyObject *
new_date_subclass_ex(int year, int month, int day, TyObject *cls)
{
    TyObject *result;
    // We have "fast path" constructors for two subclasses: date and datetime
    if ((TyTypeObject *)cls == DATE_TYPE(NO_STATE)) {
        result = new_date_ex(year, month, day, (TyTypeObject *)cls);
    }
    else if ((TyTypeObject *)cls == DATETIME_TYPE(NO_STATE)) {
        result = new_datetime_ex(year, month, day, 0, 0, 0, 0, Ty_None,
                                 (TyTypeObject *)cls);
    }
    else {
        result = PyObject_CallFunction(cls, "iii", year, month, day);
    }

    return result;
}

/* Create a datetime instance with no range checking. */
static TyObject *
new_datetime_ex2(int year, int month, int day, int hour, int minute,
                 int second, int usecond, TyObject *tzinfo, int fold, TyTypeObject *type)
{
    PyDateTime_DateTime *self;
    char aware = tzinfo != Ty_None;

    if (check_date_args(year, month, day) < 0) {
        return NULL;
    }
    if (check_time_args(hour, minute, second, usecond, fold) < 0) {
        return NULL;
    }
    if (check_tzinfo_subclass(tzinfo) < 0) {
        return NULL;
    }

    self = (PyDateTime_DateTime *) (type->tp_alloc(type, aware));
    if (self != NULL) {
        self->hastzinfo = aware;
        set_date_fields((PyDateTime_Date *)self, year, month, day);
        DATE_SET_HOUR(self, hour);
        DATE_SET_MINUTE(self, minute);
        DATE_SET_SECOND(self, second);
        DATE_SET_MICROSECOND(self, usecond);
        if (aware) {
            self->tzinfo = Ty_NewRef(tzinfo);
        }
        DATE_SET_FOLD(self, fold);
    }
    return (TyObject *)self;
}

static TyObject *
new_datetime_ex(int year, int month, int day, int hour, int minute,
                int second, int usecond, TyObject *tzinfo, TyTypeObject *type)
{
    return new_datetime_ex2(year, month, day, hour, minute, second, usecond,
                            tzinfo, 0, type);
}

#define new_datetime(y, m, d, hh, mm, ss, us, tzinfo, fold) \
    new_datetime_ex2(y, m, d, hh, mm, ss, us, tzinfo, fold, DATETIME_TYPE(NO_STATE))

static TyObject *
call_subclass_fold(TyObject *cls, int fold, const char *format, ...)
{
    TyObject *kwargs = NULL, *res = NULL;
    va_list va;

    va_start(va, format);
    TyObject *args = Ty_VaBuildValue(format, va);
    va_end(va);
    if (args == NULL) {
        return NULL;
    }
    if (fold) {
        kwargs = TyDict_New();
        if (kwargs == NULL) {
            goto Done;
        }
        TyObject *obj = TyLong_FromLong(fold);
        if (obj == NULL) {
            goto Done;
        }
        int err = TyDict_SetItemString(kwargs, "fold", obj);
        Ty_DECREF(obj);
        if (err < 0) {
            goto Done;
        }
    }
    res = PyObject_Call(cls, args, kwargs);
Done:
    Ty_DECREF(args);
    Ty_XDECREF(kwargs);
    return res;
}

static TyObject *
new_datetime_subclass_fold_ex(int year, int month, int day, int hour, int minute,
                              int second, int usecond, TyObject *tzinfo,
                              int fold, TyObject *cls)
{
    TyObject* dt;
    if ((TyTypeObject*)cls == DATETIME_TYPE(NO_STATE)) {
        // Use the fast path constructor
        dt = new_datetime(year, month, day, hour, minute, second, usecond,
                          tzinfo, fold);
    }
    else {
        // Subclass
        dt = call_subclass_fold(cls, fold, "iiiiiiiO", year, month, day,
                                hour, minute, second, usecond, tzinfo);
    }

    return dt;
}

static TyObject *
new_datetime_subclass_ex(int year, int month, int day, int hour, int minute,
                              int second, int usecond, TyObject *tzinfo,
                              TyObject *cls) {
    return new_datetime_subclass_fold_ex(year, month, day, hour, minute,
                                         second, usecond, tzinfo, 0,
                                         cls);
}

/* Create a time instance with no range checking. */
static TyObject *
new_time_ex2(int hour, int minute, int second, int usecond,
             TyObject *tzinfo, int fold, TyTypeObject *type)
{
    PyDateTime_Time *self;
    char aware = tzinfo != Ty_None;

    if (check_time_args(hour, minute, second, usecond, fold) < 0) {
        return NULL;
    }
    if (check_tzinfo_subclass(tzinfo) < 0) {
        return NULL;
    }

    self = (PyDateTime_Time *) (type->tp_alloc(type, aware));
    if (self != NULL) {
        self->hastzinfo = aware;
        self->hashcode = -1;
        TIME_SET_HOUR(self, hour);
        TIME_SET_MINUTE(self, minute);
        TIME_SET_SECOND(self, second);
        TIME_SET_MICROSECOND(self, usecond);
        if (aware) {
            self->tzinfo = Ty_NewRef(tzinfo);
        }
        TIME_SET_FOLD(self, fold);
    }
    return (TyObject *)self;
}

static TyObject *
new_time_ex(int hour, int minute, int second, int usecond,
            TyObject *tzinfo, TyTypeObject *type)
{
    return new_time_ex2(hour, minute, second, usecond, tzinfo, 0, type);
}

#define new_time(hh, mm, ss, us, tzinfo, fold)  \
    new_time_ex2(hh, mm, ss, us, tzinfo, fold, TIME_TYPE(NO_STATE))

static TyObject *
new_time_subclass_fold_ex(int hour, int minute, int second, int usecond,
                          TyObject *tzinfo, int fold, TyObject *cls)
{
    TyObject *t;
    if ((TyTypeObject*)cls == TIME_TYPE(NO_STATE)) {
        // Use the fast path constructor
        t = new_time(hour, minute, second, usecond, tzinfo, fold);
    }
    else {
        // Subclass
        t = call_subclass_fold(cls, fold, "iiiiO", hour, minute, second,
                               usecond, tzinfo);
    }

    return t;
}

static PyDateTime_Delta * look_up_delta(int, int, int, TyTypeObject *);

/* Create a timedelta instance.  Normalize the members iff normalize is
 * true.  Passing false is a speed optimization, if you know for sure
 * that seconds and microseconds are already in their proper ranges.  In any
 * case, raises OverflowError and returns NULL if the normalized days is out
 * of range.
 */
static TyObject *
new_delta_ex(int days, int seconds, int microseconds, int normalize,
             TyTypeObject *type)
{
    PyDateTime_Delta *self;

    if (normalize)
        normalize_d_s_us(&days, &seconds, &microseconds);
    assert(0 <= seconds && seconds < 24*3600);
    assert(0 <= microseconds && microseconds < 1000000);

    if (check_delta_day_range(days) < 0)
        return NULL;

    self = look_up_delta(days, seconds, microseconds, type);
    if (self != NULL) {
        return (TyObject *)self;
    }
    assert(!TyErr_Occurred());

    self = (PyDateTime_Delta *) (type->tp_alloc(type, 0));
    if (self != NULL) {
        self->hashcode = -1;
        SET_TD_DAYS(self, days);
        SET_TD_SECONDS(self, seconds);
        SET_TD_MICROSECONDS(self, microseconds);
    }
    return (TyObject *) self;
}

#define new_delta(d, s, us, normalize)  \
    new_delta_ex(d, s, us, normalize, DELTA_TYPE(NO_STATE))


typedef struct
{
    PyObject_HEAD
    TyObject *offset;
    TyObject *name;
} PyDateTime_TimeZone;

static PyDateTime_TimeZone * look_up_timezone(TyObject *offset, TyObject *name);

/* Create new timezone instance checking offset range.  This
   function does not check the name argument.  Caller must assure
   that offset is a timedelta instance and name is either NULL
   or a unicode object. */
static TyObject *
create_timezone(TyObject *offset, TyObject *name)
{
    PyDateTime_TimeZone *self;
    TyTypeObject *type = TIMEZONE_TYPE(NO_STATE);

    assert(offset != NULL);
    assert(PyDelta_Check(offset));
    assert(name == NULL || TyUnicode_Check(name));

    self = look_up_timezone(offset, name);
    if (self != NULL) {
        return (TyObject *)self;
    }
    assert(!TyErr_Occurred());

    self = (PyDateTime_TimeZone *)(type->tp_alloc(type, 0));
    if (self == NULL) {
        return NULL;
    }
    self->offset = Ty_NewRef(offset);
    self->name = Ty_XNewRef(name);
    return (TyObject *)self;
}

static int delta_bool(TyObject *op);
static PyDateTime_TimeZone utc_timezone;

static TyObject *
new_timezone(TyObject *offset, TyObject *name)
{
    assert(offset != NULL);
    assert(PyDelta_Check(offset));
    assert(name == NULL || TyUnicode_Check(name));

    if (name == NULL && delta_bool(offset) == 0) {
        return Ty_NewRef(CONST_UTC(NO_STATE));
    }
    if ((GET_TD_DAYS(offset) == -1 &&
            GET_TD_SECONDS(offset) == 0 &&
            GET_TD_MICROSECONDS(offset) < 1) ||
        GET_TD_DAYS(offset) < -1 || GET_TD_DAYS(offset) >= 1) {
        TyErr_Format(TyExc_ValueError, "offset must be a timedelta"
                     " strictly between -timedelta(hours=24) and"
                     " timedelta(hours=24), not %R", offset);
        return NULL;
    }

    return create_timezone(offset, name);
}

/* ---------------------------------------------------------------------------
 * tzinfo helpers.
 */

/* Ensure that p is None or of a tzinfo subclass.  Return 0 if OK; if not
 * raise TypeError and return -1.
 */
static int
check_tzinfo_subclass(TyObject *p)
{
    if (p == Ty_None || PyTZInfo_Check(p))
        return 0;
    TyErr_Format(TyExc_TypeError,
                 "tzinfo argument must be None or of a tzinfo subclass, "
                 "not type '%s'",
                 Ty_TYPE(p)->tp_name);
    return -1;
}

/* If self has a tzinfo member, return a BORROWED reference to it.  Else
 * return NULL, which is NOT AN ERROR.  There are no error returns here,
 * and the caller must not decref the result.
 */
static TyObject *
get_tzinfo_member(TyObject *self)
{
    TyObject *tzinfo = NULL;

    if (PyDateTime_Check(self) && HASTZINFO(self))
        tzinfo = ((PyDateTime_DateTime *)self)->tzinfo;
    else if (PyTime_Check(self) && HASTZINFO(self))
        tzinfo = ((PyDateTime_Time *)self)->tzinfo;

    return tzinfo;
}

/* Call getattr(tzinfo, name)(tzinfoarg), and check the result.  tzinfo must
 * be an instance of the tzinfo class.  If the method returns None, this
 * returns None.  If the method doesn't return None or timedelta, TypeError is
 * raised and this returns NULL.  If it returns a timedelta and the value is
 * out of range or isn't a whole number of minutes, ValueError is raised and
 * this returns NULL.  Else result is returned.
 */
static TyObject *
call_tzinfo_method(TyObject *tzinfo, const char *name, TyObject *tzinfoarg)
{
    TyObject *offset;

    assert(tzinfo != NULL);
    assert(PyTZInfo_Check(tzinfo) || tzinfo == Ty_None);
    assert(tzinfoarg != NULL);

    if (tzinfo == Ty_None)
        Py_RETURN_NONE;
    offset = PyObject_CallMethod(tzinfo, name, "O", tzinfoarg);
    if (offset == Ty_None || offset == NULL)
        return offset;
    if (PyDelta_Check(offset)) {
        if ((GET_TD_DAYS(offset) == -1 &&
                GET_TD_SECONDS(offset) == 0 &&
                GET_TD_MICROSECONDS(offset) < 1) ||
            GET_TD_DAYS(offset) < -1 || GET_TD_DAYS(offset) >= 1) {
            TyErr_Format(TyExc_ValueError, "offset must be a timedelta"
                         " strictly between -timedelta(hours=24) and"
                         " timedelta(hours=24), not %R", offset);
            Ty_DECREF(offset);
            return NULL;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "tzinfo.%s() must return None or "
                     "timedelta, not '%.200s'",
                     name, Ty_TYPE(offset)->tp_name);
        Ty_DECREF(offset);
        return NULL;
    }

    return offset;
}

/* Call tzinfo.utcoffset(tzinfoarg), and extract an integer from the
 * result.  tzinfo must be an instance of the tzinfo class.  If utcoffset()
 * returns None, call_utcoffset returns 0 and sets *none to 1.  If uctoffset()
 * doesn't return None or timedelta, TypeError is raised and this returns -1.
 * If utcoffset() returns an out of range timedelta,
 * ValueError is raised and this returns -1.  Else *none is
 * set to 0 and the offset is returned (as timedelta, positive east of UTC).
 */
static TyObject *
call_utcoffset(TyObject *tzinfo, TyObject *tzinfoarg)
{
    return call_tzinfo_method(tzinfo, "utcoffset", tzinfoarg);
}

/* Call tzinfo.dst(tzinfoarg), and extract an integer from the
 * result.  tzinfo must be an instance of the tzinfo class.  If dst()
 * returns None, call_dst returns 0 and sets *none to 1.  If dst()
 * doesn't return None or timedelta, TypeError is raised and this
 * returns -1.  If dst() returns an invalid timedelta for a UTC offset,
 * ValueError is raised and this returns -1.  Else *none is set to 0 and
 * the offset is returned (as timedelta, positive east of UTC).
 */
static TyObject *
call_dst(TyObject *tzinfo, TyObject *tzinfoarg)
{
    return call_tzinfo_method(tzinfo, "dst", tzinfoarg);
}

/* Call tzinfo.tzname(tzinfoarg), and return the result.  tzinfo must be
 * an instance of the tzinfo class or None.  If tzinfo isn't None, and
 * tzname() doesn't return None or a string, TypeError is raised and this
 * returns NULL.  If the result is a string, we ensure it is a Unicode
 * string.
 */
static TyObject *
call_tzname(TyObject *tzinfo, TyObject *tzinfoarg)
{
    TyObject *result;
    assert(tzinfo != NULL);
    assert(check_tzinfo_subclass(tzinfo) >= 0);
    assert(tzinfoarg != NULL);

    if (tzinfo == Ty_None)
        Py_RETURN_NONE;

    result = PyObject_CallMethodOneArg(tzinfo, &_Ty_ID(tzname), tzinfoarg);

    if (result == NULL || result == Ty_None)
        return result;

    if (!TyUnicode_Check(result)) {
        TyErr_Format(TyExc_TypeError, "tzinfo.tzname() must "
                     "return None or a string, not '%s'",
                     Ty_TYPE(result)->tp_name);
        Ty_SETREF(result, NULL);
    }

    return result;
}

/* repr is like "someclass(arg1, arg2)".  If tzinfo isn't None,
 * stuff
 *     ", tzinfo=" + repr(tzinfo)
 * before the closing ")".
 */
static TyObject *
append_keyword_tzinfo(TyObject *repr, TyObject *tzinfo)
{
    TyObject *temp;

    assert(TyUnicode_Check(repr));
    assert(tzinfo);
    if (tzinfo == Ty_None)
        return repr;
    /* Get rid of the trailing ')'. */
    assert(TyUnicode_READ_CHAR(repr, TyUnicode_GET_LENGTH(repr)-1) == ')');
    temp = TyUnicode_Substring(repr, 0, TyUnicode_GET_LENGTH(repr) - 1);
    Ty_DECREF(repr);
    if (temp == NULL)
        return NULL;
    repr = TyUnicode_FromFormat("%U, tzinfo=%R)", temp, tzinfo);
    Ty_DECREF(temp);
    return repr;
}

/* repr is like "someclass(arg1, arg2)".  If fold isn't 0,
 * stuff
 *     ", fold=" + repr(tzinfo)
 * before the closing ")".
 */
static TyObject *
append_keyword_fold(TyObject *repr, int fold)
{
    TyObject *temp;

    assert(TyUnicode_Check(repr));
    if (fold == 0)
        return repr;
    /* Get rid of the trailing ')'. */
    assert(TyUnicode_READ_CHAR(repr, TyUnicode_GET_LENGTH(repr)-1) == ')');
    temp = TyUnicode_Substring(repr, 0, TyUnicode_GET_LENGTH(repr) - 1);
    Ty_DECREF(repr);
    if (temp == NULL)
        return NULL;
    repr = TyUnicode_FromFormat("%U, fold=%d)", temp, fold);
    Ty_DECREF(temp);
    return repr;
}

static inline TyObject *
tzinfo_from_isoformat_results(int rv, int tzoffset, int tz_useconds)
{
    TyObject *tzinfo;
    if (rv == 1) {
        // Create a timezone from offset in seconds (0 returns UTC)
        if (tzoffset == 0) {
            return Ty_NewRef(CONST_UTC(NO_STATE));
        }

        TyObject *delta = new_delta(0, tzoffset, tz_useconds, 1);
        if (delta == NULL) {
            return NULL;
        }
        tzinfo = new_timezone(delta, NULL);
        Ty_DECREF(delta);
    }
    else {
        tzinfo = Ty_NewRef(Ty_None);
    }

    return tzinfo;
}

/* ---------------------------------------------------------------------------
 * String format helpers.
 */

static TyObject *
format_ctime(TyObject *date, int hours, int minutes, int seconds)
{
    static const char * const DayNames[] = {
        "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    };
    static const char * const MonthNames[] = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    int wday = weekday(GET_YEAR(date), GET_MONTH(date), GET_DAY(date));

    return TyUnicode_FromFormat("%s %s %2d %02d:%02d:%02d %04d",
                                DayNames[wday], MonthNames[GET_MONTH(date)-1],
                                GET_DAY(date), hours, minutes, seconds,
                                GET_YEAR(date));
}

static TyObject *delta_negative(TyObject *op);

/* Add formatted UTC offset string to buf.  buf has no more than
 * buflen bytes remaining.  The UTC offset is gotten by calling
 * tzinfo.uctoffset(tzinfoarg).  If that returns None, \0 is stored into
 * *buf, and that's all.  Else the returned value is checked for sanity (an
 * integer in range), and if that's OK it's converted to an hours & minutes
 * string of the form
 *   sign HH sep MM [sep SS [. UUUUUU]]
 * Returns 0 if everything is OK.  If the return value from utcoffset() is
 * bogus, an appropriate exception is set and -1 is returned.
 */
static int
format_utcoffset(char *buf, size_t buflen, const char *sep,
                TyObject *tzinfo, TyObject *tzinfoarg)
{
    TyObject *offset;
    int hours, minutes, seconds, microseconds;
    char sign;

    assert(buflen >= 1);

    offset = call_utcoffset(tzinfo, tzinfoarg);
    if (offset == NULL)
        return -1;
    if (offset == Ty_None) {
        Ty_DECREF(offset);
        *buf = '\0';
        return 0;
    }
    /* Offset is normalized, so it is negative if days < 0 */
    if (GET_TD_DAYS(offset) < 0) {
        sign = '-';
        Ty_SETREF(offset, delta_negative(offset));
        if (offset == NULL)
            return -1;
    }
    else {
        sign = '+';
    }
    /* Offset is not negative here. */
    microseconds = GET_TD_MICROSECONDS(offset);
    seconds = GET_TD_SECONDS(offset);
    Ty_DECREF(offset);
    minutes = divmod(seconds, 60, &seconds);
    hours = divmod(minutes, 60, &minutes);
    if (microseconds) {
        TyOS_snprintf(buf, buflen, "%c%02d%s%02d%s%02d.%06d", sign,
                      hours, sep, minutes, sep, seconds, microseconds);
        return 0;
    }
    if (seconds) {
        TyOS_snprintf(buf, buflen, "%c%02d%s%02d%s%02d", sign, hours,
                      sep, minutes, sep, seconds);
        return 0;
    }
    TyOS_snprintf(buf, buflen, "%c%02d%s%02d", sign, hours, sep, minutes);
    return 0;
}

static TyObject *
make_somezreplacement(TyObject *object, char *sep, TyObject *tzinfoarg)
{
    char buf[100];
    TyObject *tzinfo = get_tzinfo_member(object);

    if (tzinfo == Ty_None || tzinfo == NULL) {
        return TyUnicode_FromStringAndSize(NULL, 0);
    }

    assert(tzinfoarg != NULL);
    if (format_utcoffset(buf,
                         sizeof(buf),
                         sep,
                         tzinfo,
                         tzinfoarg) < 0)
        return NULL;

    return TyUnicode_FromString(buf);
}

static TyObject *
make_Zreplacement(TyObject *object, TyObject *tzinfoarg)
{
    TyObject *temp;
    TyObject *tzinfo = get_tzinfo_member(object);
    TyObject *Zreplacement = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);

    if (Zreplacement == NULL)
        return NULL;
    if (tzinfo == Ty_None || tzinfo == NULL)
        return Zreplacement;

    assert(tzinfoarg != NULL);
    temp = call_tzname(tzinfo, tzinfoarg);
    if (temp == NULL)
        goto Error;
    if (temp == Ty_None) {
        Ty_DECREF(temp);
        return Zreplacement;
    }

    assert(TyUnicode_Check(temp));
    /* Since the tzname is getting stuffed into the
     * format, we have to double any % signs so that
     * strftime doesn't treat them as format codes.
     */
    Ty_DECREF(Zreplacement);
    Zreplacement = PyObject_CallMethod(temp, "replace", "ss", "%", "%%");
    Ty_DECREF(temp);
    if (Zreplacement == NULL)
        return NULL;
    if (!TyUnicode_Check(Zreplacement)) {
        TyErr_SetString(TyExc_TypeError,
                        "tzname.replace() did not return a string");
        goto Error;
    }
    return Zreplacement;

  Error:
    Ty_DECREF(Zreplacement);
    return NULL;
}

static TyObject *
make_freplacement(TyObject *object)
{
    char freplacement[64];
    if (PyTime_Check(object))
        sprintf(freplacement, "%06d", TIME_GET_MICROSECOND(object));
    else if (PyDateTime_Check(object))
        sprintf(freplacement, "%06d", DATE_GET_MICROSECOND(object));
    else
        sprintf(freplacement, "%06d", 0);

    return TyUnicode_FromString(freplacement);
}

/* I sure don't want to reproduce the strftime code from the time module,
 * so this imports the module and calls it.  All the hair is due to
 * giving special meanings to the %z, %:z, %Z and %f format codes via a
 * preprocessing step on the format string.
 * tzinfoarg is the argument to pass to the object's tzinfo method, if
 * needed.
 */
static TyObject *
wrap_strftime(TyObject *object, TyObject *format, TyObject *timetuple,
              TyObject *tzinfoarg)
{
    TyObject *result = NULL;            /* guilty until proved innocent */

    TyObject *zreplacement = NULL;      /* py string, replacement for %z */
    TyObject *colonzreplacement = NULL; /* py string, replacement for %:z */
    TyObject *Zreplacement = NULL;      /* py string, replacement for %Z */
    TyObject *freplacement = NULL;      /* py string, replacement for %f */

    assert(object && format && timetuple);
    assert(TyUnicode_Check(format));

    TyObject *strftime = TyImport_ImportModuleAttrString("time", "strftime");
    if (strftime == NULL) {
        return NULL;
    }

    /* Scan the input format, looking for %z/%Z/%f escapes, building
     * a new format.  Since computing the replacements for those codes
     * is expensive, don't unless they're actually used.
     */

    PyUnicodeWriter *writer = PyUnicodeWriter_Create(0);
    if (writer == NULL) {
        goto Error;
    }

    Ty_ssize_t flen = TyUnicode_GET_LENGTH(format);
    Ty_ssize_t i = 0;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = 0;
    while (i != flen) {
        i = TyUnicode_FindChar(format, '%', i, flen, 1);
        if (i < 0) {
            assert(!TyErr_Occurred());
            break;
        }
        end = i;
        i++;
        if (i == flen) {
            break;
        }
        Ty_UCS4 ch = TyUnicode_READ_CHAR(format, i);
        i++;
        /* A % has been seen and ch is the character after it. */
        TyObject *replacement = NULL;
        if (ch == 'z') {
            /* %z -> +HHMM */
            if (zreplacement == NULL) {
                zreplacement = make_somezreplacement(object, "", tzinfoarg);
                if (zreplacement == NULL)
                    goto Error;
            }
            replacement = zreplacement;
        }
        else if (ch == ':' && i < flen && TyUnicode_READ_CHAR(format, i) == 'z') {
            /* %:z -> +HH:MM */
            i++;
            if (colonzreplacement == NULL) {
                colonzreplacement = make_somezreplacement(object, ":", tzinfoarg);
                if (colonzreplacement == NULL)
                    goto Error;
            }
            replacement = colonzreplacement;
        }
        else if (ch == 'Z') {
            /* format tzname */
            if (Zreplacement == NULL) {
                Zreplacement = make_Zreplacement(object,
                                                 tzinfoarg);
                if (Zreplacement == NULL)
                    goto Error;
            }
            replacement = Zreplacement;
        }
        else if (ch == 'f') {
            /* format microseconds */
            if (freplacement == NULL) {
                freplacement = make_freplacement(object);
                if (freplacement == NULL)
                    goto Error;
            }
            replacement = freplacement;
        }
#ifdef _Ty_NORMALIZE_CENTURY
        else if (ch == 'Y' || ch == 'G'
                 || ch == 'F' || ch == 'C'
        ) {
            /* 0-pad year with century as necessary */
            TyObject *item = PySequence_GetItem(timetuple, 0);
            if (item == NULL) {
                goto Error;
            }
            long year_long = TyLong_AsLong(item);
            Ty_DECREF(item);
            if (year_long == -1 && TyErr_Occurred()) {
                goto Error;
            }
            /* Note that datetime(1000, 1, 1).strftime('%G') == '1000' so year
               1000 for %G can go on the fast path. */
            if (year_long >= 1000) {
                continue;
            }
            if (ch == 'G') {
                TyObject *year_str = PyObject_CallFunction(strftime, "sO",
                                                           "%G", timetuple);
                if (year_str == NULL) {
                    goto Error;
                }
                TyObject *year = PyNumber_Long(year_str);
                Ty_DECREF(year_str);
                if (year == NULL) {
                    goto Error;
                }
                year_long = TyLong_AsLong(year);
                Ty_DECREF(year);
                if (year_long == -1 && TyErr_Occurred()) {
                    goto Error;
                }
            }
            /* Buffer of maximum size of formatted year permitted by long.
             * +6 to accommodate dashes, 2-digit month and day for %F. */
            char buf[SIZEOF_LONG * 5 / 2 + 2 + 6];
            Ty_ssize_t n = TyOS_snprintf(buf, sizeof(buf),
                                      ch == 'F' ? "%04ld-%%m-%%d" :
                                      "%04ld", year_long);
            if (ch == 'C') {
                n -= 2;
            }
            if (PyUnicodeWriter_WriteSubstring(writer, format, start, end) < 0) {
                goto Error;
            }
            start = i;
            if (PyUnicodeWriter_WriteUTF8(writer, buf, n) < 0) {
                goto Error;
            }
            continue;
        }
#endif
        else {
            /* percent followed by something else */
            continue;
        }
        assert(replacement != NULL);
        assert(TyUnicode_Check(replacement));
        if (PyUnicodeWriter_WriteSubstring(writer, format, start, end) < 0) {
            goto Error;
        }
        start = i;
        if (PyUnicodeWriter_WriteStr(writer, replacement) < 0) {
            goto Error;
        }
    }  /* end while() */

    TyObject *newformat;
    if (start == 0) {
        PyUnicodeWriter_Discard(writer);
        newformat = Ty_NewRef(format);
    }
    else {
        if (PyUnicodeWriter_WriteSubstring(writer, format, start, flen) < 0) {
            goto Error;
        }
        newformat = PyUnicodeWriter_Finish(writer);
        if (newformat == NULL) {
            goto Done;
        }
    }
    result = PyObject_CallFunctionObjArgs(strftime,
                                          newformat, timetuple, NULL);
    Ty_DECREF(newformat);

 Done:
    Ty_XDECREF(freplacement);
    Ty_XDECREF(zreplacement);
    Ty_XDECREF(colonzreplacement);
    Ty_XDECREF(Zreplacement);
    Ty_XDECREF(strftime);
    return result;

 Error:
    PyUnicodeWriter_Discard(writer);
    goto Done;
}

/* ---------------------------------------------------------------------------
 * Wrap functions from the time module.  These aren't directly available
 * from C.  Perhaps they should be.
 */

/* Call time.time() and return its result (a Python float). */
static TyObject *
time_time(void)
{
    TyObject *result = NULL;
    TyObject *time = TyImport_ImportModuleAttrString("time", "time");

    if (time != NULL) {
        result = PyObject_CallNoArgs(time);
        Ty_DECREF(time);
    }
    return result;
}

/* Build a time.struct_time.  The weekday and day number are automatically
 * computed from the y,m,d args.
 */
static TyObject *
build_struct_time(int y, int m, int d, int hh, int mm, int ss, int dstflag)
{
    TyObject *struct_time;
    TyObject *result;

    struct_time = TyImport_ImportModuleAttrString("time", "struct_time");
    if (struct_time == NULL) {
        return NULL;
    }

    result = PyObject_CallFunction(struct_time, "((iiiiiiiii))",
                         y, m, d,
                         hh, mm, ss,
                         weekday(y, m, d),
                         days_before_month(y, m) + d,
                         dstflag);
    Ty_DECREF(struct_time);
    return result;
}

/* ---------------------------------------------------------------------------
 * Miscellaneous helpers.
 */

/* The comparisons here all most naturally compute a cmp()-like result.
 * This little helper turns that into a bool result for rich comparisons.
 */
static TyObject *
diff_to_bool(int diff, int op)
{
    Py_RETURN_RICHCOMPARE(diff, 0, op);
}

/* ---------------------------------------------------------------------------
 * Class implementations.
 */

/*
 * PyDateTime_Delta implementation.
 */

/* Convert a timedelta to a number of us,
 *      (24*3600*self.days + self.seconds)*1000000 + self.microseconds
 * as a Python int.
 * Doing mixed-radix arithmetic by hand instead is excruciating in C,
 * due to ubiquitous overflow possibilities.
 */
static TyObject *
delta_to_microseconds(PyDateTime_Delta *self)
{
    TyObject *x1 = NULL;
    TyObject *x2 = NULL;
    TyObject *x3 = NULL;
    TyObject *result = NULL;

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    x1 = TyLong_FromLong(GET_TD_DAYS(self));
    if (x1 == NULL)
        goto Done;
    x2 = PyNumber_Multiply(x1, CONST_SEC_PER_DAY(st));        /* days in seconds */
    if (x2 == NULL)
        goto Done;
    Ty_SETREF(x1, NULL);

    /* x2 has days in seconds */
    x1 = TyLong_FromLong(GET_TD_SECONDS(self));         /* seconds */
    if (x1 == NULL)
        goto Done;
    x3 = PyNumber_Add(x1, x2);          /* days and seconds in seconds */
    if (x3 == NULL)
        goto Done;
    Ty_DECREF(x1);
    Ty_DECREF(x2);
    /* x1 = */ x2 = NULL;

    /* x3 has days+seconds in seconds */
    x1 = PyNumber_Multiply(x3, CONST_US_PER_SECOND(st));          /* us */
    if (x1 == NULL)
        goto Done;
    Ty_SETREF(x3, NULL);

    /* x1 has days+seconds in us */
    x2 = TyLong_FromLong(GET_TD_MICROSECONDS(self));
    if (x2 == NULL)
        goto Done;
    result = PyNumber_Add(x1, x2);
    assert(result == NULL || TyLong_CheckExact(result));

Done:
    Ty_XDECREF(x1);
    Ty_XDECREF(x2);
    Ty_XDECREF(x3);
    RELEASE_CURRENT_STATE(st, current_mod);
    return result;
}

static TyObject *
checked_divmod(TyObject *a, TyObject *b)
{
    TyObject *result = PyNumber_Divmod(a, b);
    if (result != NULL) {
        if (!TyTuple_Check(result)) {
            TyErr_Format(TyExc_TypeError,
                         "divmod() returned non-tuple (type %.200s)",
                         Ty_TYPE(result)->tp_name);
            Ty_DECREF(result);
            return NULL;
        }
        if (TyTuple_GET_SIZE(result) != 2) {
            TyErr_Format(TyExc_TypeError,
                         "divmod() returned a tuple of size %zd",
                         TyTuple_GET_SIZE(result));
            Ty_DECREF(result);
            return NULL;
        }
    }
    return result;
}

/* Convert a number of us (as a Python int) to a timedelta.
 */
static TyObject *
microseconds_to_delta_ex(TyObject *pyus, TyTypeObject *type)
{
    int us;
    int s;
    int d;

    TyObject *tuple = NULL;
    TyObject *num = NULL;
    TyObject *result = NULL;

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    tuple = checked_divmod(pyus, CONST_US_PER_SECOND(st));
    if (tuple == NULL) {
        goto Done;
    }

    num = TyTuple_GET_ITEM(tuple, 1);           /* us */
    us = TyLong_AsInt(num);
    num = NULL;
    if (us == -1 && TyErr_Occurred()) {
        goto Done;
    }
    if (!(0 <= us && us < 1000000)) {
        goto BadDivmod;
    }

    num = Ty_NewRef(TyTuple_GET_ITEM(tuple, 0));        /* leftover seconds */
    Ty_DECREF(tuple);

    tuple = checked_divmod(num, CONST_SEC_PER_DAY(st));
    if (tuple == NULL)
        goto Done;
    Ty_DECREF(num);

    num = TyTuple_GET_ITEM(tuple, 1);           /* seconds */
    s = TyLong_AsInt(num);
    num = NULL;
    if (s == -1 && TyErr_Occurred()) {
        goto Done;
    }
    if (!(0 <= s && s < 24*3600)) {
        goto BadDivmod;
    }

    num = Ty_NewRef(TyTuple_GET_ITEM(tuple, 0));           /* leftover days */
    d = TyLong_AsInt(num);
    if (d == -1 && TyErr_Occurred()) {
        goto Done;
    }
    result = new_delta_ex(d, s, us, 0, type);

Done:
    Ty_XDECREF(tuple);
    Ty_XDECREF(num);
    RELEASE_CURRENT_STATE(st, current_mod);
    return result;

BadDivmod:
    TyErr_SetString(TyExc_TypeError,
                    "divmod() returned a value out of range");
    goto Done;
}

#define microseconds_to_delta(pymicros) \
    microseconds_to_delta_ex(pymicros, DELTA_TYPE(NO_STATE))

static TyObject *
multiply_int_timedelta(TyObject *intobj, PyDateTime_Delta *delta)
{
    TyObject *pyus_in;
    TyObject *pyus_out;
    TyObject *result;

    pyus_in = delta_to_microseconds(delta);
    if (pyus_in == NULL)
        return NULL;

    pyus_out = PyNumber_Multiply(intobj, pyus_in);
    Ty_DECREF(pyus_in);
    if (pyus_out == NULL)
        return NULL;

    result = microseconds_to_delta(pyus_out);
    Ty_DECREF(pyus_out);
    return result;
}

static TyObject *
get_float_as_integer_ratio(TyObject *floatobj)
{
    TyObject *ratio;

    assert(floatobj && TyFloat_Check(floatobj));
    ratio = PyObject_CallMethodNoArgs(floatobj, &_Ty_ID(as_integer_ratio));
    if (ratio == NULL) {
        return NULL;
    }
    if (!TyTuple_Check(ratio)) {
        TyErr_Format(TyExc_TypeError,
                     "unexpected return type from as_integer_ratio(): "
                     "expected tuple, not '%.200s'",
                     Ty_TYPE(ratio)->tp_name);
        Ty_DECREF(ratio);
        return NULL;
    }
    if (TyTuple_Size(ratio) != 2) {
        TyErr_SetString(TyExc_ValueError,
                        "as_integer_ratio() must return a 2-tuple");
        Ty_DECREF(ratio);
        return NULL;
    }
    return ratio;
}

/* op is 0 for multiplication, 1 for division */
static TyObject *
multiply_truedivide_timedelta_float(PyDateTime_Delta *delta, TyObject *floatobj, int op)
{
    TyObject *result = NULL;
    TyObject *pyus_in = NULL, *temp, *pyus_out;
    TyObject *ratio = NULL;

    pyus_in = delta_to_microseconds(delta);
    if (pyus_in == NULL)
        return NULL;
    ratio = get_float_as_integer_ratio(floatobj);
    if (ratio == NULL) {
        goto error;
    }
    temp = PyNumber_Multiply(pyus_in, TyTuple_GET_ITEM(ratio, op));
    Ty_SETREF(pyus_in, NULL);
    if (temp == NULL)
        goto error;
    pyus_out = divide_nearest(temp, TyTuple_GET_ITEM(ratio, !op));
    Ty_DECREF(temp);
    if (pyus_out == NULL)
        goto error;
    result = microseconds_to_delta(pyus_out);
    Ty_DECREF(pyus_out);
 error:
    Ty_XDECREF(pyus_in);
    Ty_XDECREF(ratio);

    return result;
}

static TyObject *
divide_timedelta_int(PyDateTime_Delta *delta, TyObject *intobj)
{
    TyObject *pyus_in;
    TyObject *pyus_out;
    TyObject *result;

    pyus_in = delta_to_microseconds(delta);
    if (pyus_in == NULL)
        return NULL;

    pyus_out = PyNumber_FloorDivide(pyus_in, intobj);
    Ty_DECREF(pyus_in);
    if (pyus_out == NULL)
        return NULL;

    result = microseconds_to_delta(pyus_out);
    Ty_DECREF(pyus_out);
    return result;
}

static TyObject *
divide_timedelta_timedelta(PyDateTime_Delta *left, PyDateTime_Delta *right)
{
    TyObject *pyus_left;
    TyObject *pyus_right;
    TyObject *result;

    pyus_left = delta_to_microseconds(left);
    if (pyus_left == NULL)
        return NULL;

    pyus_right = delta_to_microseconds(right);
    if (pyus_right == NULL)     {
        Ty_DECREF(pyus_left);
        return NULL;
    }

    result = PyNumber_FloorDivide(pyus_left, pyus_right);
    Ty_DECREF(pyus_left);
    Ty_DECREF(pyus_right);
    return result;
}

static TyObject *
truedivide_timedelta_timedelta(PyDateTime_Delta *left, PyDateTime_Delta *right)
{
    TyObject *pyus_left;
    TyObject *pyus_right;
    TyObject *result;

    pyus_left = delta_to_microseconds(left);
    if (pyus_left == NULL)
        return NULL;

    pyus_right = delta_to_microseconds(right);
    if (pyus_right == NULL)     {
        Ty_DECREF(pyus_left);
        return NULL;
    }

    result = PyNumber_TrueDivide(pyus_left, pyus_right);
    Ty_DECREF(pyus_left);
    Ty_DECREF(pyus_right);
    return result;
}

static TyObject *
truedivide_timedelta_int(PyDateTime_Delta *delta, TyObject *i)
{
    TyObject *result;
    TyObject *pyus_in, *pyus_out;
    pyus_in = delta_to_microseconds(delta);
    if (pyus_in == NULL)
        return NULL;
    pyus_out = divide_nearest(pyus_in, i);
    Ty_DECREF(pyus_in);
    if (pyus_out == NULL)
        return NULL;
    result = microseconds_to_delta(pyus_out);
    Ty_DECREF(pyus_out);

    return result;
}

static TyObject *
delta_add(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDelta_Check(left) && PyDelta_Check(right)) {
        /* delta + delta */
        /* The C-level additions can't overflow because of the
         * invariant bounds.
         */
        int days = GET_TD_DAYS(left) + GET_TD_DAYS(right);
        int seconds = GET_TD_SECONDS(left) + GET_TD_SECONDS(right);
        int microseconds = GET_TD_MICROSECONDS(left) +
                           GET_TD_MICROSECONDS(right);
        result = new_delta(days, seconds, microseconds, 1);
    }

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

static TyObject *
delta_negative(TyObject *self)
{
    return new_delta(-GET_TD_DAYS(self),
                     -GET_TD_SECONDS(self),
                     -GET_TD_MICROSECONDS(self),
                     1);
}

static TyObject *
delta_positive(TyObject *self)
{
    /* Could optimize this (by returning self) if this isn't a
     * subclass -- but who uses unary + ?  Approximately nobody.
     */
    return new_delta(GET_TD_DAYS(self),
                     GET_TD_SECONDS(self),
                     GET_TD_MICROSECONDS(self),
                     0);
}

static TyObject *
delta_abs(TyObject *self)
{
    TyObject *result;

    assert(GET_TD_MICROSECONDS(self) >= 0);
    assert(GET_TD_SECONDS(self) >= 0);

    if (GET_TD_DAYS(self) < 0)
        result = delta_negative(self);
    else
        result = delta_positive(self);

    return result;
}

static TyObject *
delta_subtract(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDelta_Check(left) && PyDelta_Check(right)) {
        /* delta - delta */
        /* The C-level additions can't overflow because of the
         * invariant bounds.
         */
        int days = GET_TD_DAYS(left) - GET_TD_DAYS(right);
        int seconds = GET_TD_SECONDS(left) - GET_TD_SECONDS(right);
        int microseconds = GET_TD_MICROSECONDS(left) -
                           GET_TD_MICROSECONDS(right);
        result = new_delta(days, seconds, microseconds, 1);
    }

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

static int
delta_cmp(TyObject *self, TyObject *other)
{
    int diff = GET_TD_DAYS(self) - GET_TD_DAYS(other);
    if (diff == 0) {
        diff = GET_TD_SECONDS(self) - GET_TD_SECONDS(other);
        if (diff == 0)
            diff = GET_TD_MICROSECONDS(self) -
                GET_TD_MICROSECONDS(other);
    }
    return diff;
}

static TyObject *
delta_richcompare(TyObject *self, TyObject *other, int op)
{
    if (PyDelta_Check(other)) {
        int diff = delta_cmp(self, other);
        return diff_to_bool(diff, op);
    }
    else {
        Py_RETURN_NOTIMPLEMENTED;
    }
}

static TyObject *delta_getstate(PyDateTime_Delta *self);

static Ty_hash_t
delta_hash(TyObject *op)
{
    PyDateTime_Delta *self = PyDelta_CAST(op);
    if (self->hashcode == -1) {
        TyObject *temp = delta_getstate(self);
        if (temp != NULL) {
            self->hashcode = PyObject_Hash(temp);
            Ty_DECREF(temp);
        }
    }
    return self->hashcode;
}

static TyObject *
delta_multiply(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDelta_Check(left)) {
        /* delta * ??? */
        if (TyLong_Check(right))
            result = multiply_int_timedelta(right,
                            (PyDateTime_Delta *) left);
        else if (TyFloat_Check(right))
            result = multiply_truedivide_timedelta_float(
                            (PyDateTime_Delta *) left, right, 0);
    }
    else if (TyLong_Check(left))
        result = multiply_int_timedelta(left,
                        (PyDateTime_Delta *) right);
    else if (TyFloat_Check(left))
        result = multiply_truedivide_timedelta_float(
                        (PyDateTime_Delta *) right, left, 0);

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

static TyObject *
delta_divide(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDelta_Check(left)) {
        /* delta * ??? */
        if (TyLong_Check(right))
            result = divide_timedelta_int(
                            (PyDateTime_Delta *)left,
                            right);
        else if (PyDelta_Check(right))
            result = divide_timedelta_timedelta(
                            (PyDateTime_Delta *)left,
                            (PyDateTime_Delta *)right);
    }

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

static TyObject *
delta_truedivide(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDelta_Check(left)) {
        if (PyDelta_Check(right))
            result = truedivide_timedelta_timedelta(
                            (PyDateTime_Delta *)left,
                            (PyDateTime_Delta *)right);
        else if (TyFloat_Check(right))
            result = multiply_truedivide_timedelta_float(
                            (PyDateTime_Delta *)left, right, 1);
        else if (TyLong_Check(right))
            result = truedivide_timedelta_int(
                            (PyDateTime_Delta *)left, right);
    }

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

static TyObject *
delta_remainder(TyObject *left, TyObject *right)
{
    TyObject *pyus_left;
    TyObject *pyus_right;
    TyObject *pyus_remainder;
    TyObject *remainder;

    if (!PyDelta_Check(left) || !PyDelta_Check(right))
        Py_RETURN_NOTIMPLEMENTED;

    pyus_left = delta_to_microseconds((PyDateTime_Delta *)left);
    if (pyus_left == NULL)
        return NULL;

    pyus_right = delta_to_microseconds((PyDateTime_Delta *)right);
    if (pyus_right == NULL) {
        Ty_DECREF(pyus_left);
        return NULL;
    }

    pyus_remainder = PyNumber_Remainder(pyus_left, pyus_right);
    Ty_DECREF(pyus_left);
    Ty_DECREF(pyus_right);
    if (pyus_remainder == NULL)
        return NULL;

    remainder = microseconds_to_delta(pyus_remainder);
    Ty_DECREF(pyus_remainder);
    if (remainder == NULL)
        return NULL;

    return remainder;
}

static TyObject *
delta_divmod(TyObject *left, TyObject *right)
{
    TyObject *pyus_left;
    TyObject *pyus_right;
    TyObject *divmod;
    TyObject *delta;
    TyObject *result;

    if (!PyDelta_Check(left) || !PyDelta_Check(right))
        Py_RETURN_NOTIMPLEMENTED;

    pyus_left = delta_to_microseconds((PyDateTime_Delta *)left);
    if (pyus_left == NULL)
        return NULL;

    pyus_right = delta_to_microseconds((PyDateTime_Delta *)right);
    if (pyus_right == NULL) {
        Ty_DECREF(pyus_left);
        return NULL;
    }

    divmod = checked_divmod(pyus_left, pyus_right);
    Ty_DECREF(pyus_left);
    Ty_DECREF(pyus_right);
    if (divmod == NULL)
        return NULL;

    delta = microseconds_to_delta(TyTuple_GET_ITEM(divmod, 1));
    if (delta == NULL) {
        Ty_DECREF(divmod);
        return NULL;
    }
    result = TyTuple_Pack(2, TyTuple_GET_ITEM(divmod, 0), delta);
    Ty_DECREF(delta);
    Ty_DECREF(divmod);
    return result;
}

/* Fold in the value of the tag ("seconds", "weeks", etc) component of a
 * timedelta constructor.  sofar is the # of microseconds accounted for
 * so far, and there are factor microseconds per current unit, the number
 * of which is given by num.  num * factor is added to sofar in a
 * numerically careful way, and that's the result.  Any fractional
 * microseconds left over (this can happen if num is a float type) are
 * added into *leftover.
 * Note that there are many ways this can give an error (NULL) return.
 */
static TyObject *
accum(const char* tag, TyObject *sofar, TyObject *num, TyObject *factor,
      double *leftover)
{
    TyObject *prod;
    TyObject *sum;

    assert(num != NULL);

    if (TyLong_Check(num)) {
        prod = PyNumber_Multiply(num, factor);
        if (prod == NULL)
            return NULL;
        sum = PyNumber_Add(sofar, prod);
        Ty_DECREF(prod);
        return sum;
    }

    if (TyFloat_Check(num)) {
        double dnum;
        double fracpart;
        double intpart;
        TyObject *x;
        TyObject *y;

        /* The Plan:  decompose num into an integer part and a
         * fractional part, num = intpart + fracpart.
         * Then num * factor ==
         *      intpart * factor + fracpart * factor
         * and the LHS can be computed exactly in long arithmetic.
         * The RHS is again broken into an int part and frac part.
         * and the frac part is added into *leftover.
         */
        dnum = TyFloat_AsDouble(num);
        if (dnum == -1.0 && TyErr_Occurred())
            return NULL;
        fracpart = modf(dnum, &intpart);
        x = TyLong_FromDouble(intpart);
        if (x == NULL)
            return NULL;

        prod = PyNumber_Multiply(x, factor);
        Ty_DECREF(x);
        if (prod == NULL)
            return NULL;

        sum = PyNumber_Add(sofar, prod);
        Ty_DECREF(prod);
        if (sum == NULL)
            return NULL;

        if (fracpart == 0.0)
            return sum;
        /* So far we've lost no information.  Dealing with the
         * fractional part requires float arithmetic, and may
         * lose a little info.
         */
        assert(TyLong_CheckExact(factor));
        dnum = TyLong_AsDouble(factor);

        dnum *= fracpart;
        fracpart = modf(dnum, &intpart);
        x = TyLong_FromDouble(intpart);
        if (x == NULL) {
            Ty_DECREF(sum);
            return NULL;
        }

        y = PyNumber_Add(sum, x);
        Ty_DECREF(sum);
        Ty_DECREF(x);
        *leftover += fracpart;
        return y;
    }

    TyErr_Format(TyExc_TypeError,
                 "unsupported type for timedelta %s component: %s",
                 tag, Ty_TYPE(num)->tp_name);
    return NULL;
}

static TyObject *
delta_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *self = NULL;

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    /* Argument objects. */
    TyObject *day = NULL;
    TyObject *second = NULL;
    TyObject *us = NULL;
    TyObject *ms = NULL;
    TyObject *minute = NULL;
    TyObject *hour = NULL;
    TyObject *week = NULL;

    TyObject *x = NULL;         /* running sum of microseconds */
    TyObject *y = NULL;         /* temp sum of microseconds */
    double leftover_us = 0.0;

    static char *keywords[] = {
        "days", "seconds", "microseconds", "milliseconds",
        "minutes", "hours", "weeks", NULL
    };

    if (TyArg_ParseTupleAndKeywords(args, kw, "|OOOOOOO:__new__",
                                    keywords,
                                    &day, &second, &us,
                                    &ms, &minute, &hour, &week) == 0)
        goto Done;

    x = TyLong_FromLong(0);
    if (x == NULL)
        goto Done;

#define CLEANUP         \
    Ty_DECREF(x);       \
    x = y;              \
    if (x == NULL)      \
        goto Done

    if (us) {
        y = accum("microseconds", x, us, _TyLong_GetOne(), &leftover_us);
        CLEANUP;
    }
    if (ms) {
        y = accum("milliseconds", x, ms, CONST_US_PER_MS(st), &leftover_us);
        CLEANUP;
    }
    if (second) {
        y = accum("seconds", x, second, CONST_US_PER_SECOND(st), &leftover_us);
        CLEANUP;
    }
    if (minute) {
        y = accum("minutes", x, minute, CONST_US_PER_MINUTE(st), &leftover_us);
        CLEANUP;
    }
    if (hour) {
        y = accum("hours", x, hour, CONST_US_PER_HOUR(st), &leftover_us);
        CLEANUP;
    }
    if (day) {
        y = accum("days", x, day, CONST_US_PER_DAY(st), &leftover_us);
        CLEANUP;
    }
    if (week) {
        y = accum("weeks", x, week, CONST_US_PER_WEEK(st), &leftover_us);
        CLEANUP;
    }
    if (leftover_us) {
        /* Round to nearest whole # of us, and add into x. */
        double whole_us = round(leftover_us);
        int x_is_odd;
        TyObject *temp;

        if (fabs(whole_us - leftover_us) == 0.5) {
            /* We're exactly halfway between two integers.  In order
             * to do round-half-to-even, we must determine whether x
             * is odd. Note that x is odd when it's last bit is 1. The
             * code below uses bitwise and operation to check the last
             * bit. */
            temp = PyNumber_And(x, _TyLong_GetOne());  /* temp <- x & 1 */
            if (temp == NULL) {
                Ty_DECREF(x);
                goto Done;
            }
            x_is_odd = PyObject_IsTrue(temp);
            Ty_DECREF(temp);
            if (x_is_odd == -1) {
                Ty_DECREF(x);
                goto Done;
            }
            whole_us = 2.0 * round((leftover_us + x_is_odd) * 0.5) - x_is_odd;
        }

        temp = TyLong_FromLong((long)whole_us);

        if (temp == NULL) {
            Ty_DECREF(x);
            goto Done;
        }
        y = PyNumber_Add(x, temp);
        Ty_DECREF(temp);
        CLEANUP;
    }

    self = microseconds_to_delta_ex(x, type);
    Ty_DECREF(x);

Done:
    RELEASE_CURRENT_STATE(st, current_mod);
    return self;

#undef CLEANUP
}

static int
delta_bool(TyObject *self)
{
    return (GET_TD_DAYS(self) != 0
        || GET_TD_SECONDS(self) != 0
        || GET_TD_MICROSECONDS(self) != 0);
}

static TyObject *
delta_repr(TyObject *self)
{
    TyObject *args = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);

    if (args == NULL) {
        return NULL;
    }

    const char *sep = "";

    if (GET_TD_DAYS(self) != 0) {
        Ty_SETREF(args, TyUnicode_FromFormat("days=%d", GET_TD_DAYS(self)));
        if (args == NULL) {
            return NULL;
        }
        sep = ", ";
    }

    if (GET_TD_SECONDS(self) != 0) {
        Ty_SETREF(args, TyUnicode_FromFormat("%U%sseconds=%d", args, sep,
                                             GET_TD_SECONDS(self)));
        if (args == NULL) {
            return NULL;
        }
        sep = ", ";
    }

    if (GET_TD_MICROSECONDS(self) != 0) {
        Ty_SETREF(args, TyUnicode_FromFormat("%U%smicroseconds=%d", args, sep,
                                             GET_TD_MICROSECONDS(self)));
        if (args == NULL) {
            return NULL;
        }
    }

    if (TyUnicode_GET_LENGTH(args) == 0) {
        Ty_SETREF(args, TyUnicode_FromString("0"));
        if (args == NULL) {
            return NULL;
        }
    }

    TyObject *repr = TyUnicode_FromFormat("%s(%S)", Ty_TYPE(self)->tp_name,
                                          args);
    Ty_DECREF(args);
    return repr;
}

static TyObject *
delta_str(TyObject *self)
{
    int us = GET_TD_MICROSECONDS(self);
    int seconds = GET_TD_SECONDS(self);
    int minutes = divmod(seconds, 60, &seconds);
    int hours = divmod(minutes, 60, &minutes);
    int days = GET_TD_DAYS(self);

    if (days) {
        if (us)
            return TyUnicode_FromFormat("%d day%s, %d:%02d:%02d.%06d",
                                        days, (days == 1 || days == -1) ? "" : "s",
                                        hours, minutes, seconds, us);
        else
            return TyUnicode_FromFormat("%d day%s, %d:%02d:%02d",
                                        days, (days == 1 || days == -1) ? "" : "s",
                                        hours, minutes, seconds);
    } else {
        if (us)
            return TyUnicode_FromFormat("%d:%02d:%02d.%06d",
                                        hours, minutes, seconds, us);
        else
            return TyUnicode_FromFormat("%d:%02d:%02d",
                                        hours, minutes, seconds);
    }

}

/* Pickle support, a simple use of __reduce__. */

/* __getstate__ isn't exposed */
static TyObject *
delta_getstate(PyDateTime_Delta *self)
{
    return Ty_BuildValue("iii", GET_TD_DAYS(self),
                                GET_TD_SECONDS(self),
                                GET_TD_MICROSECONDS(self));
}

static TyObject *
delta_total_seconds(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    TyObject *total_seconds;
    TyObject *total_microseconds;

    total_microseconds = delta_to_microseconds(PyDelta_CAST(op));
    if (total_microseconds == NULL)
        return NULL;

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    total_seconds = PyNumber_TrueDivide(total_microseconds, CONST_US_PER_SECOND(st));

    RELEASE_CURRENT_STATE(st, current_mod);
    Ty_DECREF(total_microseconds);
    return total_seconds;
}

static TyObject *
delta_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_Delta *self = PyDelta_CAST(op);
    return Ty_BuildValue("ON", Ty_TYPE(self), delta_getstate(self));
}

#define OFFSET(field)  offsetof(PyDateTime_Delta, field)

static TyMemberDef delta_members[] = {

    {"days",         Ty_T_INT, OFFSET(days),         Py_READONLY,
     TyDoc_STR("Number of days.")},

    {"seconds",      Ty_T_INT, OFFSET(seconds),      Py_READONLY,
     TyDoc_STR("Number of seconds (>= 0 and less than 1 day).")},

    {"microseconds", Ty_T_INT, OFFSET(microseconds), Py_READONLY,
     TyDoc_STR("Number of microseconds (>= 0 and less than 1 second).")},
    {NULL}
};

static TyMethodDef delta_methods[] = {
    {"total_seconds", delta_total_seconds, METH_NOARGS,
     TyDoc_STR("Total seconds in the duration.")},

    {"__reduce__", delta_reduce, METH_NOARGS,
     TyDoc_STR("__reduce__() -> (cls, state)")},

    {NULL,      NULL},
};

static const char delta_doc[] =
TyDoc_STR("Difference between two datetime values.\n\n"
          "timedelta(days=0, seconds=0, microseconds=0, milliseconds=0, "
          "minutes=0, hours=0, weeks=0)\n\n"
          "All arguments are optional and default to 0.\n"
          "Arguments may be integers or floats, and may be positive or negative.");

static TyNumberMethods delta_as_number = {
    delta_add,                                  /* nb_add */
    delta_subtract,                             /* nb_subtract */
    delta_multiply,                             /* nb_multiply */
    delta_remainder,                            /* nb_remainder */
    delta_divmod,                               /* nb_divmod */
    0,                                          /* nb_power */
    delta_negative,                             /* nb_negative */
    delta_positive,                             /* nb_positive */
    delta_abs,                                  /* nb_absolute */
    delta_bool,                                 /* nb_bool */
    0,                                          /*nb_invert*/
    0,                                          /*nb_lshift*/
    0,                                          /*nb_rshift*/
    0,                                          /*nb_and*/
    0,                                          /*nb_xor*/
    0,                                          /*nb_or*/
    0,                                          /*nb_int*/
    0,                                          /*nb_reserved*/
    0,                                          /*nb_float*/
    0,                                          /*nb_inplace_add*/
    0,                                          /*nb_inplace_subtract*/
    0,                                          /*nb_inplace_multiply*/
    0,                                          /*nb_inplace_remainder*/
    0,                                          /*nb_inplace_power*/
    0,                                          /*nb_inplace_lshift*/
    0,                                          /*nb_inplace_rshift*/
    0,                                          /*nb_inplace_and*/
    0,                                          /*nb_inplace_xor*/
    0,                                          /*nb_inplace_or*/
    delta_divide,                               /* nb_floor_divide */
    delta_truedivide,                           /* nb_true_divide */
    0,                                          /* nb_inplace_floor_divide */
    0,                                          /* nb_inplace_true_divide */
};

static TyTypeObject PyDateTime_DeltaType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.timedelta",                               /* tp_name */
    sizeof(PyDateTime_Delta),                           /* tp_basicsize */
    0,                                                  /* tp_itemsize */
    0,                                                  /* tp_dealloc */
    0,                                                  /* tp_vectorcall_offset */
    0,                                                  /* tp_getattr */
    0,                                                  /* tp_setattr */
    0,                                                  /* tp_as_async */
    delta_repr,                                         /* tp_repr */
    &delta_as_number,                                   /* tp_as_number */
    0,                                                  /* tp_as_sequence */
    0,                                                  /* tp_as_mapping */
    delta_hash,                                         /* tp_hash */
    0,                                                  /* tp_call */
    delta_str,                                          /* tp_str */
    PyObject_GenericGetAttr,                            /* tp_getattro */
    0,                                                  /* tp_setattro */
    0,                                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,           /* tp_flags */
    delta_doc,                                          /* tp_doc */
    0,                                                  /* tp_traverse */
    0,                                                  /* tp_clear */
    delta_richcompare,                                  /* tp_richcompare */
    0,                                                  /* tp_weaklistoffset */
    0,                                                  /* tp_iter */
    0,                                                  /* tp_iternext */
    delta_methods,                                      /* tp_methods */
    delta_members,                                      /* tp_members */
    0,                                                  /* tp_getset */
    0,                                                  /* tp_base */
    0,                                                  /* tp_dict */
    0,                                                  /* tp_descr_get */
    0,                                                  /* tp_descr_set */
    0,                                                  /* tp_dictoffset */
    0,                                                  /* tp_init */
    0,                                                  /* tp_alloc */
    delta_new,                                          /* tp_new */
    0,                                                  /* tp_free */
};

// XXX Can we make this const?
static PyDateTime_Delta zero_delta = {
    PyObject_HEAD_INIT(&PyDateTime_DeltaType)
    /* Letting this be set lazily is a benign race. */
    .hashcode = -1,
};

static PyDateTime_Delta *
look_up_delta(int days, int seconds, int microseconds, TyTypeObject *type)
{
    if (days == 0 && seconds == 0 && microseconds == 0
            && type == Ty_TYPE(&zero_delta))
    {
        return &zero_delta;
    }
    return NULL;
}


/*
 * PyDateTime_Date implementation.
 */

/* Accessor properties. */

static TyObject *
date_year(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return TyLong_FromLong(GET_YEAR(self));
}

static TyObject *
date_month(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return TyLong_FromLong(GET_MONTH(self));
}

static TyObject *
date_day(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return TyLong_FromLong(GET_DAY(self));
}

static TyGetSetDef date_getset[] = {
    {"year", date_year},
    {"month", date_month},
    {"day", date_day},
    {NULL}
};

/* Constructors. */

static char *date_kws[] = {"year", "month", "day", NULL};

static TyObject *
date_from_pickle(TyTypeObject *type, TyObject *state)
{
    PyDateTime_Date *me;

    me = (PyDateTime_Date *) (type->tp_alloc(type, 0));
    if (me != NULL) {
        const char *pdata = TyBytes_AS_STRING(state);
        memcpy(me->data, pdata, _PyDateTime_DATE_DATASIZE);
        me->hashcode = -1;
    }
    return (TyObject *)me;
}

static TyObject *
date_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *self = NULL;
    int year;
    int month;
    int day;

    /* Check for invocation from pickle with __getstate__ state */
    if (TyTuple_GET_SIZE(args) == 1) {
        TyObject *state = TyTuple_GET_ITEM(args, 0);
        if (TyBytes_Check(state)) {
            if (TyBytes_GET_SIZE(state) == _PyDateTime_DATE_DATASIZE &&
                MONTH_IS_SANE(TyBytes_AS_STRING(state)[2]))
            {
                return date_from_pickle(type, state);
            }
        }
        else if (TyUnicode_Check(state)) {
            if (TyUnicode_GET_LENGTH(state) == _PyDateTime_DATE_DATASIZE &&
                MONTH_IS_SANE(TyUnicode_READ_CHAR(state, 2)))
            {
                state = TyUnicode_AsLatin1String(state);
                if (state == NULL) {
                    if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
                        /* More informative error message. */
                        TyErr_SetString(TyExc_ValueError,
                            "Failed to encode latin1 string when unpickling "
                            "a date object. "
                            "pickle.load(data, encoding='latin1') is assumed.");
                    }
                    return NULL;
                }
                self = date_from_pickle(type, state);
                Ty_DECREF(state);
                return self;
            }
        }
    }

    if (TyArg_ParseTupleAndKeywords(args, kw, "iii", date_kws,
                                    &year, &month, &day)) {
        self = new_date_ex(year, month, day, type);
    }
    return self;
}

static TyObject *
date_fromtimestamp(TyObject *cls, TyObject *obj)
{
    struct tm tm;
    time_t t;

    if (_TyTime_ObjectToTime_t(obj, &t, _TyTime_ROUND_FLOOR) == -1)
        return NULL;

    if (_TyTime_localtime(t, &tm) != 0)
        return NULL;

    return new_date_subclass_ex(tm.tm_year + 1900,
                                tm.tm_mon + 1,
                                tm.tm_mday,
                                cls);
}

/* Return new date from current time.
 * We say this is equivalent to fromtimestamp(time.time()), and the
 * only way to be sure of that is to *call* time.time().  That's not
 * generally the same as calling C's time.
 */
static TyObject *
date_today(TyObject *cls, TyObject *Py_UNUSED(dummy))
{
    TyObject *time;
    TyObject *result;
    time = time_time();
    if (time == NULL)
        return NULL;

    /* Note well:  today() is a class method, so this may not call
     * date.fromtimestamp.  For example, it may call
     * datetime.fromtimestamp.  That's why we need all the accuracy
     * time.time() delivers; if someone were gonzo about optimization,
     * date.today() could get away with plain C time().
     */
    result = PyObject_CallMethodOneArg(cls, &_Ty_ID(fromtimestamp), time);
    Ty_DECREF(time);
    return result;
}

/*[clinic input]
@classmethod
datetime.date.fromtimestamp

    timestamp: object
    /

Create a date from a POSIX timestamp.

The timestamp is a number, e.g. created via time.time(), that is interpreted
as local time.
[clinic start generated code]*/

static TyObject *
datetime_date_fromtimestamp_impl(TyTypeObject *type, TyObject *timestamp)
/*[clinic end generated code: output=59def4e32c028fb6 input=eabb3fe7f40491fe]*/
{
    return date_fromtimestamp((TyObject *) type, timestamp);
}

/* bpo-36025: This is a wrapper for API compatibility with the public C API,
 * which expects a function that takes an *args tuple, whereas the argument
 * clinic generates code that takes METH_O.
 */
static TyObject *
datetime_date_fromtimestamp_capi(TyObject *cls, TyObject *args)
{
    TyObject *timestamp;
    TyObject *result = NULL;

    if (TyArg_UnpackTuple(args, "fromtimestamp", 1, 1, &timestamp)) {
        result = date_fromtimestamp(cls, timestamp);
    }

    return result;
}

/* Return new date from proleptic Gregorian ordinal.  Raises ValueError if
 * the ordinal is out of range.
 */
static TyObject *
date_fromordinal(TyObject *cls, TyObject *args)
{
    TyObject *result = NULL;
    int ordinal;

    if (TyArg_ParseTuple(args, "i:fromordinal", &ordinal)) {
        int year;
        int month;
        int day;

        if (ordinal < 1)
            TyErr_SetString(TyExc_ValueError, "ordinal must be "
                                              ">= 1");
        else {
            ord_to_ymd(ordinal, &year, &month, &day);
            result = new_date_subclass_ex(year, month, day, cls);
        }
    }
    return result;
}

/* Return the new date from a string as generated by date.isoformat() */
static TyObject *
date_fromisoformat(TyObject *cls, TyObject *dtstr)
{
    assert(dtstr != NULL);

    if (!TyUnicode_Check(dtstr)) {
        TyErr_SetString(TyExc_TypeError,
                        "fromisoformat: argument must be str");
        return NULL;
    }

    Ty_ssize_t len;

    const char *dt_ptr = TyUnicode_AsUTF8AndSize(dtstr, &len);
    if (dt_ptr == NULL) {
        goto invalid_string_error;
    }

    int year = 0, month = 0, day = 0;

    int rv;
    if (len == 7 || len == 8 || len == 10) {
        rv = parse_isoformat_date(dt_ptr, len, &year, &month, &day);
    }
    else {
        rv = -1;
    }

    if (rv < 0) {
        goto invalid_string_error;
    }

    return new_date_subclass_ex(year, month, day, cls);

invalid_string_error:
    TyErr_Format(TyExc_ValueError, "Invalid isoformat string: %R", dtstr);
    return NULL;
}


static TyObject *
date_fromisocalendar(TyObject *cls, TyObject *args, TyObject *kw)
{
    static char *keywords[] = {
        "year", "week", "day", NULL
    };

    int year, week, day;
    if (TyArg_ParseTupleAndKeywords(args, kw, "iii:fromisocalendar",
                keywords,
                &year, &week, &day) == 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            TyErr_Format(TyExc_ValueError,
                    "ISO calendar component out of range");

        }
        return NULL;
    }

    int month;
    int rv = iso_to_ymd(year, week, day, &year, &month, &day);

    if (rv == -4) {
        TyErr_Format(TyExc_ValueError,
                     "year must be in %d..%d, not %d", MINYEAR, MAXYEAR, year);
        return NULL;
    }

    if (rv == -2) {
        TyErr_Format(TyExc_ValueError, "Invalid week: %d", week);
        return NULL;
    }

    if (rv == -3) {
        TyErr_Format(TyExc_ValueError, "Invalid weekday: %d (range is [1, 7])",
                     day);
        return NULL;
    }

    return new_date_subclass_ex(year, month, day, cls);
}

/* Return new date from _strptime.strptime_datetime_date(). */
static TyObject *
date_strptime(TyObject *cls, TyObject *args)
{
    TyObject *string, *format, *result;

    if (!TyArg_ParseTuple(args, "UU:strptime", &string, &format)) {
        return NULL;
    }

    TyObject *module = TyImport_Import(&_Ty_ID(_strptime));
    if (module == NULL) {
        return NULL;
    }
    result = PyObject_CallMethodObjArgs(module,
                                        &_Ty_ID(_strptime_datetime_date), cls,
                                        string, format, NULL);
    Ty_DECREF(module);
    return result;
}


/*
 * Date arithmetic.
 */

/* date + timedelta -> date.  If arg negate is true, subtract the timedelta
 * instead.
 */
static TyObject *
add_date_timedelta(PyDateTime_Date *date, PyDateTime_Delta *delta, int negate)
{
    TyObject *result = NULL;
    int year = GET_YEAR(date);
    int month = GET_MONTH(date);
    int deltadays = GET_TD_DAYS(delta);
    /* C-level overflow is impossible because |deltadays| < 1e9. */
    int day = GET_DAY(date) + (negate ? -deltadays : deltadays);

    if (normalize_date(&year, &month, &day) >= 0)
        result = new_date_subclass_ex(year, month, day,
                                      (TyObject* )Ty_TYPE(date));
    return result;
}

static TyObject *
date_add(TyObject *left, TyObject *right)
{
    if (PyDateTime_Check(left) || PyDateTime_Check(right))
        Py_RETURN_NOTIMPLEMENTED;

    if (PyDate_Check(left)) {
        /* date + ??? */
        if (PyDelta_Check(right))
            /* date + delta */
            return add_date_timedelta((PyDateTime_Date *) left,
                                      (PyDateTime_Delta *) right,
                                      0);
    }
    else {
        /* ??? + date
         * 'right' must be one of us, or we wouldn't have been called
         */
        if (PyDelta_Check(left))
            /* delta + date */
            return add_date_timedelta((PyDateTime_Date *) right,
                                      (PyDateTime_Delta *) left,
                                      0);
    }
    Py_RETURN_NOTIMPLEMENTED;
}

static TyObject *
date_subtract(TyObject *left, TyObject *right)
{
    if (PyDateTime_Check(left) || PyDateTime_Check(right))
        Py_RETURN_NOTIMPLEMENTED;

    if (PyDate_Check(left)) {
        if (PyDate_Check(right)) {
            /* date - date */
            int left_ord = ymd_to_ord(GET_YEAR(left),
                                      GET_MONTH(left),
                                      GET_DAY(left));
            int right_ord = ymd_to_ord(GET_YEAR(right),
                                       GET_MONTH(right),
                                       GET_DAY(right));
            return new_delta(left_ord - right_ord, 0, 0, 0);
        }
        if (PyDelta_Check(right)) {
            /* date - delta */
            return add_date_timedelta((PyDateTime_Date *) left,
                                      (PyDateTime_Delta *) right,
                                      1);
        }
    }
    Py_RETURN_NOTIMPLEMENTED;
}


/* Various ways to turn a date into a string. */

static TyObject *
date_repr(TyObject *op)
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return TyUnicode_FromFormat("%s(%d, %d, %d)",
                                Ty_TYPE(self)->tp_name,
                                GET_YEAR(self), GET_MONTH(self), GET_DAY(self));
}

static TyObject *
date_isoformat(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return TyUnicode_FromFormat("%04d-%02d-%02d",
                                GET_YEAR(self), GET_MONTH(self), GET_DAY(self));
}

/* str() calls the appropriate isoformat() method. */
static TyObject *
date_str(TyObject *self)
{
    return PyObject_CallMethodNoArgs(self, &_Ty_ID(isoformat));
}


static TyObject *
date_ctime(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return format_ctime(self, 0, 0, 0);
}

static TyObject *
date_strftime(TyObject *self, TyObject *args, TyObject *kw)
{
    /* This method can be inherited, and needs to call the
     * timetuple() method appropriate to self's class.
     */
    TyObject *result;
    TyObject *tuple;
    TyObject *format;
    static char *keywords[] = {"format", NULL};

    if (!TyArg_ParseTupleAndKeywords(args, kw, "U:strftime", keywords,
                                     &format))
        return NULL;

    tuple = PyObject_CallMethodNoArgs(self, &_Ty_ID(timetuple));
    if (tuple == NULL)
        return NULL;
    result = wrap_strftime(self, format, tuple, self);
    Ty_DECREF(tuple);
    return result;
}

static TyObject *
date_format(TyObject *self, TyObject *args)
{
    TyObject *format;

    if (!TyArg_ParseTuple(args, "U:__format__", &format))
        return NULL;

    /* if the format is zero length, return str(self) */
    if (TyUnicode_GetLength(format) == 0)
        return PyObject_Str(self);

    return PyObject_CallMethodOneArg(self, &_Ty_ID(strftime), format);
}

/* ISO methods. */

static TyObject *
date_isoweekday(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    int dow = weekday(GET_YEAR(self), GET_MONTH(self), GET_DAY(self));

    return TyLong_FromLong(dow + 1);
}

TyDoc_STRVAR(iso_calendar_date__doc__,
"The result of date.isocalendar() or datetime.isocalendar()\n\n\
This object may be accessed either as a tuple of\n\
  ((year, week, weekday)\n\
or via the object attributes as named in the above tuple.");

typedef struct {
    PyTupleObject tuple;
} PyDateTime_IsoCalendarDate;

static TyObject *
iso_calendar_date_repr(TyObject *self)
{
    TyObject *year = TyTuple_GetItem(self, 0);
    if (year == NULL) {
        return NULL;
    }
    TyObject *week = TyTuple_GetItem(self, 1);
    if (week == NULL) {
        return NULL;
    }
    TyObject *weekday = TyTuple_GetItem(self, 2);
    if (weekday == NULL) {
        return NULL;
    }

    return TyUnicode_FromFormat("%.200s(year=%S, week=%S, weekday=%S)",
                               Ty_TYPE(self)->tp_name, year, week, weekday);
}

static TyObject *
iso_calendar_date_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    // Construct the tuple that this reduces to
    TyObject *reduce_tuple = Ty_BuildValue(
        "O((OOO))", &TyTuple_Type,
        TyTuple_GET_ITEM(self, 0),
        TyTuple_GET_ITEM(self, 1),
        TyTuple_GET_ITEM(self, 2)
    );

    return reduce_tuple;
}

static TyObject *
iso_calendar_date_year(TyObject *self, void *Py_UNUSED(closure))
{
    TyObject *year = TyTuple_GetItem(self, 0);
    if (year == NULL) {
        return NULL;
    }
    return Ty_NewRef(year);
}

static TyObject *
iso_calendar_date_week(TyObject *self, void *Py_UNUSED(closure))
{
    TyObject *week = TyTuple_GetItem(self, 1);
    if (week == NULL) {
        return NULL;
    }
    return Ty_NewRef(week);
}

static TyObject *
iso_calendar_date_weekday(TyObject *self, void *Py_UNUSED(closure))
{
    TyObject *weekday = TyTuple_GetItem(self, 2);
    if (weekday == NULL) {
        return NULL;
    }
    return Ty_NewRef(weekday);
}

static TyGetSetDef iso_calendar_date_getset[] = {
    {"year", iso_calendar_date_year},
    {"week", iso_calendar_date_week},
    {"weekday", iso_calendar_date_weekday},
    {NULL}
};

static TyMethodDef iso_calendar_date_methods[] = {
    {"__reduce__", iso_calendar_date_reduce, METH_NOARGS,
     TyDoc_STR("__reduce__() -> (cls, state)")},
    {NULL, NULL},
};

static int
iso_calendar_date_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return TyTuple_Type.tp_traverse(self, visit, arg);
}

static void
iso_calendar_date_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    TyTuple_Type.tp_dealloc(self);  // delegate GC-untrack as well
    Ty_DECREF(tp);
}

static TyType_Slot isocal_slots[] = {
    {Ty_tp_repr, iso_calendar_date_repr},
    {Ty_tp_doc, (void *)iso_calendar_date__doc__},
    {Ty_tp_methods, iso_calendar_date_methods},
    {Ty_tp_getset, iso_calendar_date_getset},
    {Ty_tp_new, iso_calendar_date_new},
    {Ty_tp_dealloc, iso_calendar_date_dealloc},
    {Ty_tp_traverse, iso_calendar_date_traverse},
    {0, NULL},
};

static TyType_Spec isocal_spec = {
    .name = "datetime.IsoCalendarDate",
    .basicsize = sizeof(PyDateTime_IsoCalendarDate),
    .flags = (Ty_TPFLAGS_DEFAULT |
              Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = isocal_slots,
};

/*[clinic input]
@classmethod
datetime.IsoCalendarDate.__new__ as iso_calendar_date_new
    year: int
    week: int
    weekday: int
[clinic start generated code]*/

static TyObject *
iso_calendar_date_new_impl(TyTypeObject *type, int year, int week,
                           int weekday)
/*[clinic end generated code: output=383d33d8dc7183a2 input=4f2c663c9d19c4ee]*/

{
    PyDateTime_IsoCalendarDate *self;
    self = (PyDateTime_IsoCalendarDate *) type->tp_alloc(type, 3);
    if (self == NULL) {
        return NULL;
    }

    TyTuple_SET_ITEM(self, 0, TyLong_FromLong(year));
    TyTuple_SET_ITEM(self, 1, TyLong_FromLong(week));
    TyTuple_SET_ITEM(self, 2, TyLong_FromLong(weekday));

    return (TyObject *)self;
}

static TyObject *
date_isocalendar(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    int  year         = GET_YEAR(self);
    int  week1_monday = iso_week1_monday(year);
    int today         = ymd_to_ord(year, GET_MONTH(self), GET_DAY(self));
    int  week;
    int  day;

    week = divmod(today - week1_monday, 7, &day);
    if (week < 0) {
        --year;
        week1_monday = iso_week1_monday(year);
        week = divmod(today - week1_monday, 7, &day);
    }
    else if (week >= 52 && today >= iso_week1_monday(year + 1)) {
        ++year;
        week = 0;
    }

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    TyObject *v = iso_calendar_date_new_impl(ISOCALENDAR_DATE_TYPE(st),
                                             year, week + 1, day + 1);
    RELEASE_CURRENT_STATE(st, current_mod);
    if (v == NULL) {
        return NULL;
    }
    return v;
}

/* Miscellaneous methods. */

static TyObject *
date_richcompare(TyObject *self, TyObject *other, int op)
{
    /* Since DateTime is a subclass of Date, if the other object is
     * a DateTime, it would compute an equality testing or an ordering
     * based on the date part alone, and we don't want that.
     * So return NotImplemented here in that case.
     * If a subclass wants to change this, it's up to the subclass to do so.
     * The behavior is the same as if Date and DateTime were independent
     * classes.
     */
    if (PyDate_Check(other) && !PyDateTime_Check(other)) {
        int diff = memcmp(((PyDateTime_Date *)self)->data,
                          ((PyDateTime_Date *)other)->data,
                          _PyDateTime_DATE_DATASIZE);
        return diff_to_bool(diff, op);
    }
    else
        Py_RETURN_NOTIMPLEMENTED;
}

static TyObject *
date_timetuple(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return build_struct_time(GET_YEAR(self),
                             GET_MONTH(self),
                             GET_DAY(self),
                             0, 0, 0, -1);
}

/*[clinic input]
datetime.date.replace

    year: int(c_default="GET_YEAR(self)") = unchanged
    month: int(c_default="GET_MONTH(self)") = unchanged
    day: int(c_default="GET_DAY(self)") = unchanged

Return date with new specified fields.
[clinic start generated code]*/

static TyObject *
datetime_date_replace_impl(PyDateTime_Date *self, int year, int month,
                           int day)
/*[clinic end generated code: output=2a9430d1e6318aeb input=0d1f02685b3e90f6]*/
{
    return new_date_subclass_ex(year, month, day, (TyObject *)Ty_TYPE(self));
}

static Ty_hash_t
generic_hash(unsigned char *data, int len)
{
    return Ty_HashBuffer(data, len);
}


static TyObject *date_getstate(PyDateTime_Date *self);

static Ty_hash_t
date_hash(TyObject *op)
{
    PyDateTime_Date *self = PyDate_CAST(op);
    if (self->hashcode == -1) {
        self->hashcode = generic_hash(
            (unsigned char *)self->data, _PyDateTime_DATE_DATASIZE);
    }

    return self->hashcode;
}

static TyObject *
date_toordinal(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return TyLong_FromLong(ymd_to_ord(GET_YEAR(self), GET_MONTH(self),
                                      GET_DAY(self)));
}

static TyObject *
date_weekday(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    int dow = weekday(GET_YEAR(self), GET_MONTH(self), GET_DAY(self));
    return TyLong_FromLong(dow);
}

/* Pickle support, a simple use of __reduce__. */

/* __getstate__ isn't exposed */
static TyObject *
date_getstate(PyDateTime_Date *self)
{
    TyObject* field;
    field = TyBytes_FromStringAndSize((char*)self->data,
                                       _PyDateTime_DATE_DATASIZE);
    return Ty_BuildValue("(N)", field);
}

static TyObject *
date_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_Date *self = PyDate_CAST(op);
    return Ty_BuildValue("(ON)", Ty_TYPE(self), date_getstate(self));
}

static TyMethodDef date_methods[] = {

    /* Class methods: */
    DATETIME_DATE_FROMTIMESTAMP_METHODDEF

    {"fromordinal", date_fromordinal, METH_VARARGS | METH_CLASS,
     TyDoc_STR("int -> date corresponding to a proleptic Gregorian "
               "ordinal.")},

     {"fromisoformat", date_fromisoformat,  METH_O | METH_CLASS,
      TyDoc_STR("str -> Construct a date from a string in ISO 8601 format.")},

     {"fromisocalendar", _PyCFunction_CAST(date_fromisocalendar),
      METH_VARARGS | METH_KEYWORDS | METH_CLASS,
      TyDoc_STR("int, int, int -> Construct a date from the ISO year, week "
                "number and weekday.\n\n"
                "This is the inverse of the date.isocalendar() function")},

    {"strptime", date_strptime, METH_VARARGS | METH_CLASS,
     TyDoc_STR("string, format -> new date parsed from a string "
               "(like time.strptime()).")},

    {"today", date_today, METH_NOARGS | METH_CLASS,
     TyDoc_STR("Current date or datetime:  same as "
               "self.__class__.fromtimestamp(time.time()).")},

    /* Instance methods: */

    {"ctime", date_ctime, METH_NOARGS,
     TyDoc_STR("Return ctime() style string.")},

    {"strftime", _PyCFunction_CAST(date_strftime), METH_VARARGS | METH_KEYWORDS,
     TyDoc_STR("format -> strftime() style string.")},

    {"__format__", date_format, METH_VARARGS,
     TyDoc_STR("Formats self with strftime.")},

    {"timetuple", date_timetuple, METH_NOARGS,
     TyDoc_STR("Return time tuple, compatible with time.localtime().")},

    {"isocalendar", date_isocalendar,  METH_NOARGS,
     TyDoc_STR("Return a named tuple containing ISO year, week number, and "
               "weekday.")},

    {"isoformat", date_isoformat, METH_NOARGS,
     TyDoc_STR("Return string in ISO 8601 format, YYYY-MM-DD.")},

    {"isoweekday", date_isoweekday, METH_NOARGS,
     TyDoc_STR("Return the day of the week represented by the date.\n"
               "Monday == 1 ... Sunday == 7")},

    {"toordinal", date_toordinal, METH_NOARGS,
     TyDoc_STR("Return proleptic Gregorian ordinal.  January 1 of year "
               "1 is day 1.")},

    {"weekday", date_weekday, METH_NOARGS,
     TyDoc_STR("Return the day of the week represented by the date.\n"
               "Monday == 0 ... Sunday == 6")},

    DATETIME_DATE_REPLACE_METHODDEF

    {"__replace__", _PyCFunction_CAST(datetime_date_replace), METH_FASTCALL | METH_KEYWORDS,
     TyDoc_STR("__replace__($self, /, **changes)\n--\n\nThe same as replace().")},

    {"__reduce__", date_reduce, METH_NOARGS,
     TyDoc_STR("__reduce__() -> (cls, state)")},

    {NULL,      NULL}
};

static const char date_doc[] =
TyDoc_STR("date(year, month, day) --> date object");

static TyNumberMethods date_as_number = {
    date_add,                                           /* nb_add */
    date_subtract,                                      /* nb_subtract */
    0,                                                  /* nb_multiply */
    0,                                                  /* nb_remainder */
    0,                                                  /* nb_divmod */
    0,                                                  /* nb_power */
    0,                                                  /* nb_negative */
    0,                                                  /* nb_positive */
    0,                                                  /* nb_absolute */
    0,                                                  /* nb_bool */
};

static TyTypeObject PyDateTime_DateType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.date",                                    /* tp_name */
    sizeof(PyDateTime_Date),                            /* tp_basicsize */
    0,                                                  /* tp_itemsize */
    0,                                                  /* tp_dealloc */
    0,                                                  /* tp_vectorcall_offset */
    0,                                                  /* tp_getattr */
    0,                                                  /* tp_setattr */
    0,                                                  /* tp_as_async */
    date_repr,                                          /* tp_repr */
    &date_as_number,                                    /* tp_as_number */
    0,                                                  /* tp_as_sequence */
    0,                                                  /* tp_as_mapping */
    date_hash,                                          /* tp_hash */
    0,                                                  /* tp_call */
    date_str,                                           /* tp_str */
    PyObject_GenericGetAttr,                            /* tp_getattro */
    0,                                                  /* tp_setattro */
    0,                                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,           /* tp_flags */
    date_doc,                                           /* tp_doc */
    0,                                                  /* tp_traverse */
    0,                                                  /* tp_clear */
    date_richcompare,                                   /* tp_richcompare */
    0,                                                  /* tp_weaklistoffset */
    0,                                                  /* tp_iter */
    0,                                                  /* tp_iternext */
    date_methods,                                       /* tp_methods */
    0,                                                  /* tp_members */
    date_getset,                                        /* tp_getset */
    0,                                                  /* tp_base */
    0,                                                  /* tp_dict */
    0,                                                  /* tp_descr_get */
    0,                                                  /* tp_descr_set */
    0,                                                  /* tp_dictoffset */
    0,                                                  /* tp_init */
    0,                                                  /* tp_alloc */
    date_new,                                           /* tp_new */
    0,                                                  /* tp_free */
};

/*
 * PyDateTime_TZInfo implementation.
 */

/* This is a pure abstract base class, so doesn't do anything beyond
 * raising NotImplemented exceptions.  Real tzinfo classes need
 * to derive from this.  This is mostly for clarity, and for efficiency in
 * datetime and time constructors (their tzinfo arguments need to
 * be subclasses of this tzinfo class, which is easy and quick to check).
 *
 * Note:  For reasons having to do with pickling of subclasses, we have
 * to allow tzinfo objects to be instantiated.  This wasn't an issue
 * in the Python implementation (__init__() could raise NotImplementedError
 * there without ill effect), but doing so in the C implementation hit a
 * brick wall.
 */

static TyObject *
tzinfo_nogo(const char* methodname)
{
    TyErr_Format(TyExc_NotImplementedError,
                 "a tzinfo subclass must implement %s()",
                 methodname);
    return NULL;
}

/* Methods.  A subclass must implement these. */

static TyObject *
tzinfo_tzname(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(dt))
{
    return tzinfo_nogo("tzname");
}

static TyObject *
tzinfo_utcoffset(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(dt))
{
    return tzinfo_nogo("utcoffset");
}

static TyObject *
tzinfo_dst(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(dt))
{
    return tzinfo_nogo("dst");
}


static TyObject *add_datetime_timedelta(PyDateTime_DateTime *date,
                                        PyDateTime_Delta *delta,
                                        int factor);
static TyObject *datetime_utcoffset(TyObject *self, TyObject *);
static TyObject *datetime_dst(TyObject *self, TyObject *);

static TyObject *
tzinfo_fromutc(TyObject *self, TyObject *dt)
{
    TyObject *result = NULL;
    TyObject *off = NULL, *dst = NULL;
    PyDateTime_Delta *delta = NULL;

    if (!PyDateTime_Check(dt)) {
        TyErr_SetString(TyExc_TypeError,
                        "fromutc: argument must be a datetime");
        return NULL;
    }
    if (GET_DT_TZINFO(dt) != self) {
        TyErr_SetString(TyExc_ValueError, "fromutc: dt.tzinfo "
                        "is not self");
        return NULL;
    }

    off = datetime_utcoffset(dt, NULL);
    if (off == NULL)
        return NULL;
    if (off == Ty_None) {
        TyErr_SetString(TyExc_ValueError, "fromutc: non-None "
                        "utcoffset() result required");
        goto Fail;
    }

    dst = datetime_dst(dt, NULL);
    if (dst == NULL)
        goto Fail;
    if (dst == Ty_None) {
        TyErr_SetString(TyExc_ValueError, "fromutc: non-None "
                        "dst() result required");
        goto Fail;
    }

    delta = (PyDateTime_Delta *)delta_subtract(off, dst);
    if (delta == NULL)
        goto Fail;
    result = add_datetime_timedelta((PyDateTime_DateTime *)dt, delta, 1);
    if (result == NULL)
        goto Fail;

    Ty_DECREF(dst);
    dst = call_dst(GET_DT_TZINFO(dt), result);
    if (dst == NULL)
        goto Fail;
    if (dst == Ty_None)
        goto Inconsistent;
    if (delta_bool(dst) != 0) {
        Ty_SETREF(result, add_datetime_timedelta((PyDateTime_DateTime *)result,
                                                 (PyDateTime_Delta *)dst, 1));
        if (result == NULL)
            goto Fail;
    }
    Ty_DECREF(delta);
    Ty_DECREF(dst);
    Ty_DECREF(off);
    return result;

Inconsistent:
    TyErr_SetString(TyExc_ValueError, "fromutc: tz.dst() gave "
                    "inconsistent results; cannot convert");

    /* fall through to failure */
Fail:
    Ty_XDECREF(off);
    Ty_XDECREF(dst);
    Ty_XDECREF(delta);
    Ty_XDECREF(result);
    return NULL;
}

/*
 * Pickle support.  This is solely so that tzinfo subclasses can use
 * pickling -- tzinfo itself is supposed to be uninstantiable.
 */

static TyObject *
tzinfo_reduce(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *args, *state;
    TyObject *getinitargs;

    if (PyObject_GetOptionalAttr(self, &_Ty_ID(__getinitargs__), &getinitargs) < 0) {
        return NULL;
    }
    if (getinitargs != NULL) {
        args = PyObject_CallNoArgs(getinitargs);
        Ty_DECREF(getinitargs);
    }
    else {
        args = TyTuple_New(0);
    }
    if (args == NULL) {
        return NULL;
    }

    state = _TyObject_GetState(self);
    if (state == NULL) {
        Ty_DECREF(args);
        return NULL;
    }

    return Ty_BuildValue("(ONN)", Ty_TYPE(self), args, state);
}

static TyMethodDef tzinfo_methods[] = {

    {"tzname", tzinfo_tzname, METH_O,
     TyDoc_STR("datetime -> string name of time zone.")},

    {"utcoffset", tzinfo_utcoffset, METH_O,
     TyDoc_STR("datetime -> timedelta showing offset from UTC, negative "
           "values indicating West of UTC")},

    {"dst", tzinfo_dst, METH_O,
     TyDoc_STR("datetime -> DST offset as timedelta positive east of UTC.")},

    {"fromutc", tzinfo_fromutc, METH_O,
     TyDoc_STR("datetime in UTC -> datetime in local time.")},

    {"__reduce__",  tzinfo_reduce, METH_NOARGS,
     TyDoc_STR("-> (cls, state)")},

    {NULL, NULL}
};

static const char tzinfo_doc[] =
TyDoc_STR("Abstract base class for time zone info objects.");

static TyTypeObject PyDateTime_TZInfoType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.tzinfo",                          /* tp_name */
    sizeof(PyDateTime_TZInfo),                  /* tp_basicsize */
    0,                                          /* tp_itemsize */
    0,                                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,   /* tp_flags */
    tzinfo_doc,                                 /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    tzinfo_methods,                             /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    TyType_GenericNew,                          /* tp_new */
    0,                                          /* tp_free */
};

static char *timezone_kws[] = {"offset", "name", NULL};

static TyObject *
timezone_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *offset;
    TyObject *name = NULL;
    if (TyArg_ParseTupleAndKeywords(args, kw, "O!|U:timezone", timezone_kws,
                                    DELTA_TYPE(NO_STATE), &offset, &name))
        return new_timezone(offset, name);

    return NULL;
}

static void
timezone_dealloc(TyObject *op)
{
    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    Ty_CLEAR(self->offset);
    Ty_CLEAR(self->name);
    Ty_TYPE(self)->tp_free(self);
}

static TyObject *
timezone_richcompare(TyObject *self, TyObject *other, int op)
{
    if (op != Py_EQ && op != Py_NE)
        Py_RETURN_NOTIMPLEMENTED;
    if (!PyTimezone_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    PyDateTime_TimeZone *lhs = PyTimeZone_CAST(self);
    PyDateTime_TimeZone *rhs = PyTimeZone_CAST(other);
    return delta_richcompare(lhs->offset, rhs->offset, op);
}

static Ty_hash_t
timezone_hash(TyObject *op)
{
    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    return delta_hash(self->offset);
}

/* Check argument type passed to tzname, utcoffset, or dst methods.
   Returns 0 for good argument.  Returns -1 and sets exception info
   otherwise.
 */
static int
_timezone_check_argument(TyObject *dt, const char *meth)
{
    if (dt == Ty_None || PyDateTime_Check(dt))
        return 0;
    TyErr_Format(TyExc_TypeError, "%s(dt) argument must be a datetime instance"
                 " or None, not %.200s", meth, Ty_TYPE(dt)->tp_name);
    return -1;
}

static TyObject *
timezone_repr(TyObject *op)
{
    /* Note that although timezone is not subclassable, it is convenient
       to use Ty_TYPE(self)->tp_name here. */
    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    const char *type_name = Ty_TYPE(self)->tp_name;

    if (op == CONST_UTC(NO_STATE)) {
        return TyUnicode_FromFormat("%s.utc", type_name);
    }

    if (self->name == NULL)
        return TyUnicode_FromFormat("%s(%R)", type_name, self->offset);

    return TyUnicode_FromFormat("%s(%R, %R)", type_name, self->offset,
                                self->name);
}

static TyObject *
timezone_str(TyObject *op)
{
    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    int hours, minutes, seconds, microseconds;
    TyObject *offset;
    char sign;

    if (self->name != NULL) {
        return Ty_NewRef(self->name);
    }
    if ((TyObject *)self == CONST_UTC(NO_STATE) ||
           (GET_TD_DAYS(self->offset) == 0 &&
            GET_TD_SECONDS(self->offset) == 0 &&
            GET_TD_MICROSECONDS(self->offset) == 0))
    {
        return TyUnicode_FromString("UTC");
    }
    /* Offset is normalized, so it is negative if days < 0 */
    if (GET_TD_DAYS(self->offset) < 0) {
        sign = '-';
        offset = delta_negative(self->offset);
        if (offset == NULL)
            return NULL;
    }
    else {
        sign = '+';
        offset = Ty_NewRef(self->offset);
    }
    /* Offset is not negative here. */
    microseconds = GET_TD_MICROSECONDS(offset);
    seconds = GET_TD_SECONDS(offset);
    Ty_DECREF(offset);
    minutes = divmod(seconds, 60, &seconds);
    hours = divmod(minutes, 60, &minutes);
    if (microseconds != 0) {
        return TyUnicode_FromFormat("UTC%c%02d:%02d:%02d.%06d",
                                    sign, hours, minutes,
                                    seconds, microseconds);
    }
    if (seconds != 0) {
        return TyUnicode_FromFormat("UTC%c%02d:%02d:%02d",
                                    sign, hours, minutes, seconds);
    }
    return TyUnicode_FromFormat("UTC%c%02d:%02d", sign, hours, minutes);
}

static TyObject *
timezone_tzname(TyObject *op, TyObject *dt)
{
    if (_timezone_check_argument(dt, "tzname") == -1)
        return NULL;

    return timezone_str(op);
}

static TyObject *
timezone_utcoffset(TyObject *op, TyObject *dt)
{
    if (_timezone_check_argument(dt, "utcoffset") == -1)
        return NULL;

    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    return Ty_NewRef(self->offset);
}

static TyObject *
timezone_dst(TyObject *op, TyObject *dt)
{
    if (_timezone_check_argument(dt, "dst") == -1)
        return NULL;

    Py_RETURN_NONE;
}

static TyObject *
timezone_fromutc(TyObject *op, TyObject *arg)
{
    if (!PyDateTime_Check(arg)) {
        TyErr_SetString(TyExc_TypeError,
                        "fromutc: argument must be a datetime");
        return NULL;
    }

    PyDateTime_DateTime *dt = (PyDateTime_DateTime *)arg;  // fast safe cast
    if (!HASTZINFO(dt) || dt->tzinfo != op) {
        TyErr_SetString(TyExc_ValueError, "fromutc: dt.tzinfo is not self");
        return NULL;
    }

    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    return add_datetime_timedelta(dt, (PyDateTime_Delta *)self->offset, 1);
}

static TyObject *
timezone_getinitargs(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_TimeZone *self = PyTimeZone_CAST(op);
    if (self->name == NULL)
        return TyTuple_Pack(1, self->offset);
    return TyTuple_Pack(2, self->offset, self->name);
}

static TyMethodDef timezone_methods[] = {
    {"tzname", timezone_tzname, METH_O,
     TyDoc_STR("If name is specified when timezone is created, returns the name."
               "  Otherwise returns offset as 'UTC(+|-)HH:MM'.")},

    {"utcoffset", timezone_utcoffset, METH_O,
     TyDoc_STR("Return fixed offset.")},

    {"dst", timezone_dst, METH_O,
     TyDoc_STR("Return None.")},

    {"fromutc", timezone_fromutc, METH_O,
     TyDoc_STR("datetime in UTC -> datetime in local time.")},

    {"__getinitargs__", timezone_getinitargs, METH_NOARGS,
     TyDoc_STR("pickle support")},

    {NULL, NULL}
};

static const char timezone_doc[] =
TyDoc_STR("Fixed offset from UTC implementation of tzinfo.");

static TyTypeObject PyDateTime_TimeZoneType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.timezone",              /* tp_name */
    sizeof(PyDateTime_TimeZone),      /* tp_basicsize */
    0,                                /* tp_itemsize */
    timezone_dealloc,                 /* tp_dealloc */
    0,                                /* tp_vectorcall_offset */
    0,                                /* tp_getattr */
    0,                                /* tp_setattr */
    0,                                /* tp_as_async */
    timezone_repr,                    /* tp_repr */
    0,                                /* tp_as_number */
    0,                                /* tp_as_sequence */
    0,                                /* tp_as_mapping */
    timezone_hash,                    /* tp_hash */
    0,                                /* tp_call */
    timezone_str,                     /* tp_str */
    0,                                /* tp_getattro */
    0,                                /* tp_setattro */
    0,                                /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT,               /* tp_flags */
    timezone_doc,                     /* tp_doc */
    0,                                /* tp_traverse */
    0,                                /* tp_clear */
    timezone_richcompare,             /* tp_richcompare */
    0,                                /* tp_weaklistoffset */
    0,                                /* tp_iter */
    0,                                /* tp_iternext */
    timezone_methods,                 /* tp_methods */
    0,                                /* tp_members */
    0,                                /* tp_getset */
    &PyDateTime_TZInfoType,           /* tp_base */
    0,                                /* tp_dict */
    0,                                /* tp_descr_get */
    0,                                /* tp_descr_set */
    0,                                /* tp_dictoffset */
    0,                                /* tp_init */
    0,                                /* tp_alloc */
    timezone_new,                     /* tp_new */
};

// XXX Can we make this const?
static PyDateTime_TimeZone utc_timezone = {
    PyObject_HEAD_INIT(&PyDateTime_TimeZoneType)
    .offset = (TyObject *)&zero_delta,
    .name = NULL,
};

static PyDateTime_TimeZone *
look_up_timezone(TyObject *offset, TyObject *name)
{
    if (offset == utc_timezone.offset && name == NULL) {
        return (PyDateTime_TimeZone *)CONST_UTC(NO_STATE);
    }
    return NULL;
}


/*
 * PyDateTime_Time implementation.
 */

/* Accessor properties.
 */

static TyObject *
time_hour(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return TyLong_FromLong(TIME_GET_HOUR(self));
}

static TyObject *
time_minute(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return TyLong_FromLong(TIME_GET_MINUTE(self));
}

/* The name time_second conflicted with some platform header file. */
static TyObject *
py_time_second(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return TyLong_FromLong(TIME_GET_SECOND(self));
}

static TyObject *
time_microsecond(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return TyLong_FromLong(TIME_GET_MICROSECOND(self));
}

static TyObject *
time_tzinfo(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    TyObject *result = HASTZINFO(self) ? self->tzinfo : Ty_None;
    return Ty_NewRef(result);
}

static TyObject *
time_fold(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return TyLong_FromLong(TIME_GET_FOLD(self));
}

static TyGetSetDef time_getset[] = {
    {"hour", time_hour},
    {"minute", time_minute},
    {"second", py_time_second},
    {"microsecond", time_microsecond},
    {"tzinfo", time_tzinfo},
    {"fold", time_fold},
    {NULL}
};

/*
 * Constructors.
 */

static char *time_kws[] = {"hour", "minute", "second", "microsecond",
                           "tzinfo", "fold", NULL};

static TyObject *
time_from_pickle(TyTypeObject *type, TyObject *state, TyObject *tzinfo)
{
    PyDateTime_Time *me;
    char aware = (char)(tzinfo != Ty_None);

    if (aware && check_tzinfo_subclass(tzinfo) < 0) {
        TyErr_SetString(TyExc_TypeError, "bad tzinfo state arg");
        return NULL;
    }

    me = (PyDateTime_Time *) (type->tp_alloc(type, aware));
    if (me != NULL) {
        const char *pdata = TyBytes_AS_STRING(state);

        memcpy(me->data, pdata, _PyDateTime_TIME_DATASIZE);
        me->hashcode = -1;
        me->hastzinfo = aware;
        if (aware) {
            me->tzinfo = Ty_NewRef(tzinfo);
        }
        if (pdata[0] & (1 << 7)) {
            me->data[0] -= 128;
            me->fold = 1;
        }
        else {
            me->fold = 0;
        }
    }
    return (TyObject *)me;
}

static TyObject *
time_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *self = NULL;
    int hour = 0;
    int minute = 0;
    int second = 0;
    int usecond = 0;
    TyObject *tzinfo = Ty_None;
    int fold = 0;

    /* Check for invocation from pickle with __getstate__ state */
    if (TyTuple_GET_SIZE(args) >= 1 && TyTuple_GET_SIZE(args) <= 2) {
        TyObject *state = TyTuple_GET_ITEM(args, 0);
        if (TyTuple_GET_SIZE(args) == 2) {
            tzinfo = TyTuple_GET_ITEM(args, 1);
        }
        if (TyBytes_Check(state)) {
            if (TyBytes_GET_SIZE(state) == _PyDateTime_TIME_DATASIZE &&
                (0x7F & ((unsigned char) (TyBytes_AS_STRING(state)[0]))) < 24)
            {
                return time_from_pickle(type, state, tzinfo);
            }
        }
        else if (TyUnicode_Check(state)) {
            if (TyUnicode_GET_LENGTH(state) == _PyDateTime_TIME_DATASIZE &&
                (0x7F & TyUnicode_READ_CHAR(state, 0)) < 24)
            {
                state = TyUnicode_AsLatin1String(state);
                if (state == NULL) {
                    if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
                        /* More informative error message. */
                        TyErr_SetString(TyExc_ValueError,
                            "Failed to encode latin1 string when unpickling "
                            "a time object. "
                            "pickle.load(data, encoding='latin1') is assumed.");
                    }
                    return NULL;
                }
                self = time_from_pickle(type, state, tzinfo);
                Ty_DECREF(state);
                return self;
            }
        }
        tzinfo = Ty_None;
    }

    if (TyArg_ParseTupleAndKeywords(args, kw, "|iiiiO$i", time_kws,
                                    &hour, &minute, &second, &usecond,
                                    &tzinfo, &fold)) {
        self = new_time_ex2(hour, minute, second, usecond, tzinfo, fold,
                            type);
    }
    return self;
}

/* Return new time from _strptime.strptime_datetime_time(). */
static TyObject *
time_strptime(TyObject *cls, TyObject *args)
{
    TyObject *string, *format, *result;

    if (!TyArg_ParseTuple(args, "UU:strptime", &string, &format)) {
        return NULL;
    }

    TyObject *module = TyImport_Import(&_Ty_ID(_strptime));
    if (module == NULL) {
        return NULL;
    }
    result = PyObject_CallMethodObjArgs(module,
                                        &_Ty_ID(_strptime_datetime_time), cls,
                                        string, format, NULL);
    Ty_DECREF(module);
    return result;
}

/*
 * Destructor.
 */

static void
time_dealloc(TyObject *op)
{
    PyDateTime_Time *self = PyTime_CAST(op);
    if (HASTZINFO(self)) {
        Ty_XDECREF(self->tzinfo);
    }
    Ty_TYPE(self)->tp_free(self);
}

/*
 * Indirect access to tzinfo methods.
 */

/* These are all METH_NOARGS, so don't need to check the arglist. */
static TyObject *
time_utcoffset(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_Time *self = PyTime_CAST(op);
    return call_utcoffset(GET_TIME_TZINFO(self), Ty_None);
}

static TyObject *
time_dst(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_Time *self = PyTime_CAST(op);
    return call_dst(GET_TIME_TZINFO(self), Ty_None);
}

static TyObject *
time_tzname(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_Time *self = PyTime_CAST(op);
    return call_tzname(GET_TIME_TZINFO(self), Ty_None);
}

/*
 * Various ways to turn a time into a string.
 */

static TyObject *
time_repr(TyObject *op)
{
    PyDateTime_Time *self = PyTime_CAST(op);
    const char *type_name = Ty_TYPE(self)->tp_name;
    int h = TIME_GET_HOUR(self);
    int m = TIME_GET_MINUTE(self);
    int s = TIME_GET_SECOND(self);
    int us = TIME_GET_MICROSECOND(self);
    int fold = TIME_GET_FOLD(self);
    TyObject *result = NULL;

    if (us)
        result = TyUnicode_FromFormat("%s(%d, %d, %d, %d)",
                                      type_name, h, m, s, us);
    else if (s)
        result = TyUnicode_FromFormat("%s(%d, %d, %d)",
                                      type_name, h, m, s);
    else
        result = TyUnicode_FromFormat("%s(%d, %d)", type_name, h, m);
    if (result != NULL && HASTZINFO(self))
        result = append_keyword_tzinfo(result, self->tzinfo);
    if (result != NULL && fold)
        result = append_keyword_fold(result, fold);
    return result;
}

static TyObject *
time_str(TyObject *op)
{
    return PyObject_CallMethodNoArgs(op, &_Ty_ID(isoformat));
}

static TyObject *
time_isoformat(TyObject *op, TyObject *args, TyObject *kw)
{
    char buf[100];
    const char *timespec = NULL;
    static char *keywords[] = {"timespec", NULL};
    PyDateTime_Time *self = PyTime_CAST(op);

    TyObject *result;
    int us = TIME_GET_MICROSECOND(self);
    static const char *specs[][2] = {
        {"hours", "%02d"},
        {"minutes", "%02d:%02d"},
        {"seconds", "%02d:%02d:%02d"},
        {"milliseconds", "%02d:%02d:%02d.%03d"},
        {"microseconds", "%02d:%02d:%02d.%06d"},
    };
    size_t given_spec;

    if (!TyArg_ParseTupleAndKeywords(args, kw, "|s:isoformat", keywords, &timespec))
        return NULL;

    if (timespec == NULL || strcmp(timespec, "auto") == 0) {
        if (us == 0) {
            /* seconds */
            given_spec = 2;
        }
        else {
            /* microseconds */
            given_spec = 4;
        }
    }
    else {
        for (given_spec = 0; given_spec < Ty_ARRAY_LENGTH(specs); given_spec++) {
            if (strcmp(timespec, specs[given_spec][0]) == 0) {
                if (given_spec == 3) {
                    /* milliseconds */
                    us = us / 1000;
                }
                break;
            }
        }
    }

    if (given_spec == Ty_ARRAY_LENGTH(specs)) {
        TyErr_Format(TyExc_ValueError, "Unknown timespec value");
        return NULL;
    }
    else {
        result = TyUnicode_FromFormat(specs[given_spec][1],
                                      TIME_GET_HOUR(self), TIME_GET_MINUTE(self),
                                      TIME_GET_SECOND(self), us);
    }

    if (result == NULL || !HASTZINFO(self) || self->tzinfo == Ty_None)
        return result;

    /* We need to append the UTC offset. */
    if (format_utcoffset(buf, sizeof(buf), ":", self->tzinfo,
                         Ty_None) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    TyUnicode_AppendAndDel(&result, TyUnicode_FromString(buf));
    return result;
}

static TyObject *
time_strftime(TyObject *op, TyObject *args, TyObject *kw)
{
    TyObject *result;
    TyObject *tuple;
    TyObject *format;
    static char *keywords[] = {"format", NULL};
    PyDateTime_Time *self = PyTime_CAST(op);

    if (! TyArg_ParseTupleAndKeywords(args, kw, "U:strftime", keywords,
                                      &format))
        return NULL;

    /* Python's strftime does insane things with the year part of the
     * timetuple.  The year is forced to (the otherwise nonsensical)
     * 1900 to work around that.
     */
    tuple = Ty_BuildValue("iiiiiiiii",
                          1900, 1, 1, /* year, month, day */
                  TIME_GET_HOUR(self),
                  TIME_GET_MINUTE(self),
                  TIME_GET_SECOND(self),
                  0, 1, -1); /* weekday, daynum, dst */
    if (tuple == NULL)
        return NULL;
    assert(TyTuple_Size(tuple) == 9);
    result = wrap_strftime((TyObject *)self, format, tuple,
                           Ty_None);
    Ty_DECREF(tuple);
    return result;
}

/*
 * Miscellaneous methods.
 */

static TyObject *
time_richcompare(TyObject *self, TyObject *other, int op)
{
    TyObject *result = NULL;
    TyObject *offset1, *offset2;
    int diff;

    if (! PyTime_Check(other))
        Py_RETURN_NOTIMPLEMENTED;

    if (GET_TIME_TZINFO(self) == GET_TIME_TZINFO(other)) {
        diff = memcmp(((PyDateTime_Time *)self)->data,
                      ((PyDateTime_Time *)other)->data,
                      _PyDateTime_TIME_DATASIZE);
        return diff_to_bool(diff, op);
    }
    offset1 = time_utcoffset(self, NULL);
    if (offset1 == NULL)
        return NULL;
    offset2 = time_utcoffset(other, NULL);
    if (offset2 == NULL)
        goto done;
    /* If they're both naive, or both aware and have the same offsets,
     * we get off cheap.  Note that if they're both naive, offset1 ==
     * offset2 == Ty_None at this point.
     */
    if ((offset1 == offset2) ||
        (PyDelta_Check(offset1) && PyDelta_Check(offset2) &&
         delta_cmp(offset1, offset2) == 0)) {
        diff = memcmp(((PyDateTime_Time *)self)->data,
                      ((PyDateTime_Time *)other)->data,
                      _PyDateTime_TIME_DATASIZE);
        result = diff_to_bool(diff, op);
    }
    /* The hard case: both aware with different UTC offsets */
    else if (offset1 != Ty_None && offset2 != Ty_None) {
        int offsecs1, offsecs2;
        assert(offset1 != offset2); /* else last "if" handled it */
        offsecs1 = TIME_GET_HOUR(self) * 3600 +
                   TIME_GET_MINUTE(self) * 60 +
                   TIME_GET_SECOND(self) -
                   GET_TD_DAYS(offset1) * 86400 -
                   GET_TD_SECONDS(offset1);
        offsecs2 = TIME_GET_HOUR(other) * 3600 +
                   TIME_GET_MINUTE(other) * 60 +
                   TIME_GET_SECOND(other) -
                   GET_TD_DAYS(offset2) * 86400 -
                   GET_TD_SECONDS(offset2);
        diff = offsecs1 - offsecs2;
        if (diff == 0)
            diff = TIME_GET_MICROSECOND(self) -
                   TIME_GET_MICROSECOND(other);
        result = diff_to_bool(diff, op);
    }
    else if (op == Py_EQ) {
        result = Ty_NewRef(Ty_False);
    }
    else if (op == Py_NE) {
        result = Ty_NewRef(Ty_True);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "can't compare offset-naive and "
                        "offset-aware times");
    }
 done:
    Ty_DECREF(offset1);
    Ty_XDECREF(offset2);
    return result;
}

static Ty_hash_t
time_hash(TyObject *op)
{
    PyDateTime_Time *self = PyTime_CAST(op);
    if (self->hashcode == -1) {
        TyObject *offset, *self0;
        if (TIME_GET_FOLD(self)) {
            self0 = new_time_ex2(TIME_GET_HOUR(self),
                                 TIME_GET_MINUTE(self),
                                 TIME_GET_SECOND(self),
                                 TIME_GET_MICROSECOND(self),
                                 HASTZINFO(self) ? self->tzinfo : Ty_None,
                                 0, Ty_TYPE(self));
            if (self0 == NULL)
                return -1;
        }
        else {
            self0 = Ty_NewRef(self);
        }
        offset = time_utcoffset(self0, NULL);
        Ty_DECREF(self0);

        if (offset == NULL)
            return -1;

        /* Reduce this to a hash of another object. */
        if (offset == Ty_None)
            self->hashcode = generic_hash(
                (unsigned char *)self->data, _PyDateTime_TIME_DATASIZE);
        else {
            TyObject *temp1, *temp2;
            int seconds, microseconds;
            assert(HASTZINFO(self));
            seconds = TIME_GET_HOUR(self) * 3600 +
                      TIME_GET_MINUTE(self) * 60 +
                      TIME_GET_SECOND(self);
            microseconds = TIME_GET_MICROSECOND(self);
            temp1 = new_delta(0, seconds, microseconds, 1);
            if (temp1 == NULL) {
                Ty_DECREF(offset);
                return -1;
            }
            temp2 = delta_subtract(temp1, offset);
            Ty_DECREF(temp1);
            if (temp2 == NULL) {
                Ty_DECREF(offset);
                return -1;
            }
            self->hashcode = PyObject_Hash(temp2);
            Ty_DECREF(temp2);
        }
        Ty_DECREF(offset);
    }
    return self->hashcode;
}

/*[clinic input]
datetime.time.replace

    hour: int(c_default="TIME_GET_HOUR(self)") = unchanged
    minute: int(c_default="TIME_GET_MINUTE(self)") = unchanged
    second: int(c_default="TIME_GET_SECOND(self)") = unchanged
    microsecond: int(c_default="TIME_GET_MICROSECOND(self)") = unchanged
    tzinfo: object(c_default="HASTZINFO(self) ? ((PyDateTime_Time *)self)->tzinfo : Ty_None") = unchanged
    *
    fold: int(c_default="TIME_GET_FOLD(self)") = unchanged

Return time with new specified fields.
[clinic start generated code]*/

static TyObject *
datetime_time_replace_impl(PyDateTime_Time *self, int hour, int minute,
                           int second, int microsecond, TyObject *tzinfo,
                           int fold)
/*[clinic end generated code: output=0b89a44c299e4f80 input=abf23656e8df4e97]*/
{
    return new_time_subclass_fold_ex(hour, minute, second, microsecond, tzinfo,
                                     fold, (TyObject *)Ty_TYPE(self));
}

static TyObject *
time_fromisoformat(TyObject *cls, TyObject *tstr) {
    assert(tstr != NULL);

    if (!TyUnicode_Check(tstr)) {
        TyErr_SetString(TyExc_TypeError, "fromisoformat: argument must be str");
        return NULL;
    }

    Ty_ssize_t len;
    const char *p = TyUnicode_AsUTF8AndSize(tstr, &len);

    if (p == NULL) {
        goto invalid_string_error;
    }

    // The spec actually requires that time-only ISO 8601 strings start with
    // T, but the extended format allows this to be omitted as long as there
    // is no ambiguity with date strings.
    if (*p == 'T') {
        ++p;
        len -= 1;
    }

    int hour = 0, minute = 0, second = 0, microsecond = 0;
    int tzoffset = 0, tzimicrosecond = 0;
    int rv = parse_isoformat_time(p, len,
                                  &hour, &minute, &second, &microsecond,
                                  &tzoffset, &tzimicrosecond);

    if (rv < 0) {
        goto invalid_string_error;
    }

    if (hour == 24) {
        if (minute == 0 && second == 0 && microsecond == 0) {
            hour = 0;
        } else {
            goto invalid_iso_midnight;
        }
    }

    TyObject *tzinfo = tzinfo_from_isoformat_results(rv, tzoffset,
                                                     tzimicrosecond);

    if (tzinfo == NULL) {
        return NULL;
    }

    TyObject *t;
    if ( (TyTypeObject *)cls == TIME_TYPE(NO_STATE)) {
        t = new_time(hour, minute, second, microsecond, tzinfo, 0);
    } else {
        t = PyObject_CallFunction(cls, "iiiiO",
                                  hour, minute, second, microsecond, tzinfo);
    }

    Ty_DECREF(tzinfo);
    return t;

invalid_iso_midnight:
    TyErr_SetString(TyExc_ValueError, "minute, second, and microsecond must be 0 when hour is 24");
    return NULL;

invalid_string_error:
    TyErr_Format(TyExc_ValueError, "Invalid isoformat string: %R", tstr);
    return NULL;
}


/* Pickle support, a simple use of __reduce__. */

/* Let basestate be the non-tzinfo data string.
 * If tzinfo is None, this returns (basestate,), else (basestate, tzinfo).
 * So it's a tuple in any (non-error) case.
 * __getstate__ isn't exposed.
 */
static TyObject *
time_getstate(PyDateTime_Time *self, int proto)
{
    TyObject *basestate;
    TyObject *result = NULL;

    basestate =  TyBytes_FromStringAndSize((char *)self->data,
                                            _PyDateTime_TIME_DATASIZE);
    if (basestate != NULL) {
        if (proto > 3 && TIME_GET_FOLD(self))
            /* Set the first bit of the first byte */
            TyBytes_AS_STRING(basestate)[0] |= (1 << 7);
        if (! HASTZINFO(self) || self->tzinfo == Ty_None)
            result = TyTuple_Pack(1, basestate);
        else
            result = TyTuple_Pack(2, basestate, self->tzinfo);
        Ty_DECREF(basestate);
    }
    return result;
}

static TyObject *
time_reduce_ex(TyObject *op, TyObject *args)
{
    int proto;
    if (!TyArg_ParseTuple(args, "i:__reduce_ex__", &proto))
        return NULL;

    PyDateTime_Time *self = PyTime_CAST(op);
    return Ty_BuildValue("(ON)", Ty_TYPE(self), time_getstate(self, proto));
}

static TyObject *
time_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_Time *self = PyTime_CAST(op);
    return Ty_BuildValue("(ON)", Ty_TYPE(self), time_getstate(self, 2));
}

static TyMethodDef time_methods[] = {

    /* Class method: */

    {"strptime", time_strptime,
     METH_VARARGS | METH_CLASS,
     TyDoc_STR("string, format -> new time parsed from a string "
               "(like time.strptime()).")},

    /* Instance methods: */

    {"isoformat", _PyCFunction_CAST(time_isoformat), METH_VARARGS | METH_KEYWORDS,
     TyDoc_STR("Return string in ISO 8601 format, [HH[:MM[:SS[.mmm[uuu]]]]]"
               "[+HH:MM].\n\n"
               "The optional argument timespec specifies the number "
               "of additional terms\nof the time to include. Valid "
               "options are 'auto', 'hours', 'minutes',\n'seconds', "
               "'milliseconds' and 'microseconds'.\n")},

    {"strftime", _PyCFunction_CAST(time_strftime), METH_VARARGS | METH_KEYWORDS,
     TyDoc_STR("format -> strftime() style string.")},

    {"__format__", date_format, METH_VARARGS,
     TyDoc_STR("Formats self with strftime.")},

    {"utcoffset", time_utcoffset, METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.utcoffset(self).")},

    {"tzname", time_tzname, METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.tzname(self).")},

    {"dst", time_dst, METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.dst(self).")},

    DATETIME_TIME_REPLACE_METHODDEF

    {"__replace__", _PyCFunction_CAST(datetime_time_replace), METH_FASTCALL | METH_KEYWORDS,
     TyDoc_STR("__replace__($self, /, **changes)\n--\n\nThe same as replace().")},

     {"fromisoformat", time_fromisoformat, METH_O | METH_CLASS,
     TyDoc_STR("string -> time from a string in ISO 8601 format")},

    {"__reduce_ex__", time_reduce_ex, METH_VARARGS,
     TyDoc_STR("__reduce_ex__(proto) -> (cls, state)")},

    {"__reduce__", time_reduce, METH_NOARGS,
     TyDoc_STR("__reduce__() -> (cls, state)")},

    {NULL,      NULL}
};

static const char time_doc[] =
TyDoc_STR("time([hour[, minute[, second[, microsecond[, tzinfo]]]]]) --> a time object\n\
\n\
All arguments are optional. tzinfo may be None, or an instance of\n\
a tzinfo subclass. The remaining arguments may be ints.\n");

static TyTypeObject PyDateTime_TimeType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.time",                            /* tp_name */
    sizeof(PyDateTime_Time),                    /* tp_basicsize */
    0,                                          /* tp_itemsize */
    time_dealloc,                               /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    time_repr,                                  /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    time_hash,                                  /* tp_hash */
    0,                                          /* tp_call */
    time_str,                                   /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /* tp_flags */
    time_doc,                                   /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    time_richcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    time_methods,                               /* tp_methods */
    0,                                          /* tp_members */
    time_getset,                                /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    time_alloc,                                 /* tp_alloc */
    time_new,                                   /* tp_new */
    0,                                          /* tp_free */
};

/*
 * PyDateTime_DateTime implementation.
 */

/* Accessor properties.  Properties for day, month, and year are inherited
 * from date.
 */

static TyObject *
datetime_hour(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return TyLong_FromLong(DATE_GET_HOUR(self));
}

static TyObject *
datetime_minute(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return TyLong_FromLong(DATE_GET_MINUTE(self));
}

static TyObject *
datetime_second(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return TyLong_FromLong(DATE_GET_SECOND(self));
}

static TyObject *
datetime_microsecond(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return TyLong_FromLong(DATE_GET_MICROSECOND(self));
}

static TyObject *
datetime_tzinfo(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    TyObject *result = HASTZINFO(self) ? self->tzinfo : Ty_None;
    return Ty_NewRef(result);
}

static TyObject *
datetime_fold(TyObject *op, void *Py_UNUSED(closure))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return TyLong_FromLong(DATE_GET_FOLD(self));
}

static TyGetSetDef datetime_getset[] = {
    {"hour", datetime_hour},
    {"minute", datetime_minute},
    {"second", datetime_second},
    {"microsecond", datetime_microsecond},
    {"tzinfo", datetime_tzinfo},
    {"fold", datetime_fold},
    {NULL}
};

/*
 * Constructors.
 */

static char *datetime_kws[] = {
    "year", "month", "day", "hour", "minute", "second",
    "microsecond", "tzinfo", "fold", NULL
};

static TyObject *
datetime_from_pickle(TyTypeObject *type, TyObject *state, TyObject *tzinfo)
{
    PyDateTime_DateTime *me;
    char aware = (char)(tzinfo != Ty_None);

    if (aware && check_tzinfo_subclass(tzinfo) < 0) {
        TyErr_SetString(TyExc_TypeError, "bad tzinfo state arg");
        return NULL;
    }

    me = (PyDateTime_DateTime *) (type->tp_alloc(type , aware));
    if (me != NULL) {
        const char *pdata = TyBytes_AS_STRING(state);

        memcpy(me->data, pdata, _PyDateTime_DATETIME_DATASIZE);
        me->hashcode = -1;
        me->hastzinfo = aware;
        if (aware) {
            me->tzinfo = Ty_NewRef(tzinfo);
        }
        if (pdata[2] & (1 << 7)) {
            me->data[2] -= 128;
            me->fold = 1;
        }
        else {
            me->fold = 0;
        }
    }
    return (TyObject *)me;
}

static TyObject *
datetime_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *self = NULL;
    int year;
    int month;
    int day;
    int hour = 0;
    int minute = 0;
    int second = 0;
    int usecond = 0;
    int fold = 0;
    TyObject *tzinfo = Ty_None;

    /* Check for invocation from pickle with __getstate__ state */
    if (TyTuple_GET_SIZE(args) >= 1 && TyTuple_GET_SIZE(args) <= 2) {
        TyObject *state = TyTuple_GET_ITEM(args, 0);
        if (TyTuple_GET_SIZE(args) == 2) {
            tzinfo = TyTuple_GET_ITEM(args, 1);
        }
        if (TyBytes_Check(state)) {
            if (TyBytes_GET_SIZE(state) == _PyDateTime_DATETIME_DATASIZE &&
                MONTH_IS_SANE(TyBytes_AS_STRING(state)[2] & 0x7F))
            {
                return datetime_from_pickle(type, state, tzinfo);
            }
        }
        else if (TyUnicode_Check(state)) {
            if (TyUnicode_GET_LENGTH(state) == _PyDateTime_DATETIME_DATASIZE &&
                MONTH_IS_SANE(TyUnicode_READ_CHAR(state, 2) & 0x7F))
            {
                state = TyUnicode_AsLatin1String(state);
                if (state == NULL) {
                    if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
                        /* More informative error message. */
                        TyErr_SetString(TyExc_ValueError,
                            "Failed to encode latin1 string when unpickling "
                            "a datetime object. "
                            "pickle.load(data, encoding='latin1') is assumed.");
                    }
                    return NULL;
                }
                self = datetime_from_pickle(type, state, tzinfo);
                Ty_DECREF(state);
                return self;
            }
        }
        tzinfo = Ty_None;
    }

    if (TyArg_ParseTupleAndKeywords(args, kw, "iii|iiiiO$i", datetime_kws,
                                    &year, &month, &day, &hour, &minute,
                                    &second, &usecond, &tzinfo, &fold)) {
        self = new_datetime_ex2(year, month, day,
                                hour, minute, second, usecond,
                                tzinfo, fold, type);
    }
    return self;
}

/* TM_FUNC is the shared type of _TyTime_localtime() and
 * _TyTime_gmtime(). */
typedef int (*TM_FUNC)(time_t timer, struct tm*);

/* As of version 2015f max fold in IANA database is
 * 23 hours at 1969-09-30 13:00:00 in Kwajalein. */
static long long max_fold_seconds = 24 * 3600;
/* NB: date(1970,1,1).toordinal() == 719163 */
static long long epoch = 719163LL * 24 * 60 * 60;

static long long
utc_to_seconds(int year, int month, int day,
               int hour, int minute, int second)
{
    long long ordinal;

    /* ymd_to_ord() doesn't support year <= 0 */
    if (year < MINYEAR || year > MAXYEAR) {
        TyErr_Format(TyExc_ValueError,
                     "year must be in %d..%d, not %d", MINYEAR, MAXYEAR, year);
        return -1;
    }

    ordinal = ymd_to_ord(year, month, day);
    return ((ordinal * 24 + hour) * 60 + minute) * 60 + second;
}

static long long
local(long long u)
{
    struct tm local_time;
    time_t t;
    u -= epoch;
    t = u;
    if (t != u) {
        TyErr_SetString(TyExc_OverflowError,
        "timestamp out of range for platform time_t");
        return -1;
    }
    if (_TyTime_localtime(t, &local_time) != 0)
        return -1;
    return utc_to_seconds(local_time.tm_year + 1900,
                          local_time.tm_mon + 1,
                          local_time.tm_mday,
                          local_time.tm_hour,
                          local_time.tm_min,
                          local_time.tm_sec);
}

/* Internal helper.
 * Build datetime from a time_t and a distinct count of microseconds.
 * Pass localtime or gmtime for f, to control the interpretation of timet.
 */
static TyObject *
datetime_from_timet_and_us(TyObject *cls, TM_FUNC f, time_t timet, int us,
                           TyObject *tzinfo)
{
    struct tm tm;
    int year, month, day, hour, minute, second, fold = 0;

    if (f(timet, &tm) != 0)
        return NULL;

    year = tm.tm_year + 1900;
    month = tm.tm_mon + 1;
    day = tm.tm_mday;
    hour = tm.tm_hour;
    minute = tm.tm_min;
    /* The platform localtime/gmtime may insert leap seconds,
     * indicated by tm.tm_sec > 59.  We don't care about them,
     * except to the extent that passing them on to the datetime
     * constructor would raise ValueError for a reason that
     * made no sense to the user.
     */
    second = Ty_MIN(59, tm.tm_sec);

    /* local timezone requires to compute fold */
    if (tzinfo == Ty_None && f == _TyTime_localtime
    /* On Windows, passing a negative value to local results
     * in an OSError because localtime_s on Windows does
     * not support negative timestamps. Unfortunately this
     * means that fold detection for time values between
     * 0 and max_fold_seconds will result in an identical
     * error since we subtract max_fold_seconds to detect a
     * fold. However, since we know there haven't been any
     * folds in the interval [0, max_fold_seconds) in any
     * timezone, we can hackily just forego fold detection
     * for this time range.
     */
#ifdef MS_WINDOWS
        && (timet - max_fold_seconds > 0)
#endif
        ) {
        long long probe_seconds, result_seconds, transition;

        result_seconds = utc_to_seconds(year, month, day,
                                        hour, minute, second);
        if (result_seconds == -1 && TyErr_Occurred()) {
            return NULL;
        }

        /* Probe max_fold_seconds to detect a fold. */
        probe_seconds = local(epoch + timet - max_fold_seconds);
        if (probe_seconds == -1)
            return NULL;
        transition = result_seconds - probe_seconds - max_fold_seconds;
        if (transition < 0) {
            probe_seconds = local(epoch + timet + transition);
            if (probe_seconds == -1)
                return NULL;
            if (probe_seconds == result_seconds)
                fold = 1;
        }
    }
    return new_datetime_subclass_fold_ex(year, month, day, hour, minute,
                                         second, us, tzinfo, fold, cls);
}

/* Internal helper.
 * Build datetime from a Python timestamp.  Pass localtime or gmtime for f,
 * to control the interpretation of the timestamp.  Since a double doesn't
 * have enough bits to cover a datetime's full range of precision, it's
 * better to call datetime_from_timet_and_us provided you have a way
 * to get that much precision (e.g., C time() isn't good enough).
 */
static TyObject *
datetime_from_timestamp(TyObject *cls, TM_FUNC f, TyObject *timestamp,
                        TyObject *tzinfo)
{
    time_t timet;
    long us;

    if (_TyTime_ObjectToTimeval(timestamp,
                                &timet, &us, _TyTime_ROUND_HALF_EVEN) == -1)
        return NULL;

    return datetime_from_timet_and_us(cls, f, timet, (int)us, tzinfo);
}

/* Internal helper.
 * Build most accurate possible datetime for current time.  Pass localtime or
 * gmtime for f as appropriate.
 */
static TyObject *
datetime_best_possible(TyObject *cls, TM_FUNC f, TyObject *tzinfo)
{
    TyTime_t ts;
    if (PyTime_Time(&ts) < 0) {
        return NULL;
    }

    time_t secs;
    int us;

    if (_TyTime_AsTimevalTime_t(ts, &secs, &us, _TyTime_ROUND_FLOOR) < 0)
        return NULL;
    assert(0 <= us && us <= 999999);

    return datetime_from_timet_and_us(cls, f, secs, us, tzinfo);
}

/*[clinic input]

@classmethod
datetime.datetime.now

    tz: object = None
        Timezone object.

Returns new datetime object representing current time local to tz.

If no tz is specified, uses local timezone.
[clinic start generated code]*/

static TyObject *
datetime_datetime_now_impl(TyTypeObject *type, TyObject *tz)
/*[clinic end generated code: output=b3386e5345e2b47a input=80d09869c5267d00]*/
{
    TyObject *self;

    /* Return best possible local time -- this isn't constrained by the
     * precision of a timestamp.
     */
    if (check_tzinfo_subclass(tz) < 0)
        return NULL;

    self = datetime_best_possible((TyObject *)type,
                                  tz == Ty_None ? _TyTime_localtime :
                                  _TyTime_gmtime,
                                  tz);
    if (self != NULL && tz != Ty_None) {
        /* Convert UTC to tzinfo's zone. */
        TyObject *res = PyObject_CallMethodOneArg(tz, &_Ty_ID(fromutc), self);
        Ty_DECREF(self);
        return res;
    }
    return self;
}

/* Return best possible UTC time -- this isn't constrained by the
 * precision of a timestamp.
 */
static TyObject *
datetime_utcnow(TyObject *cls, TyObject *dummy)
{
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
        "datetime.datetime.utcnow() is deprecated and scheduled for removal in a "
        "future version. Use timezone-aware objects to represent datetimes "
        "in UTC: datetime.datetime.now(datetime.UTC).", 1))
    {
        return NULL;
    }
    return datetime_best_possible(cls, _TyTime_gmtime, Ty_None);
}

/* Return new local datetime from timestamp (Python timestamp -- a double). */
static TyObject *
datetime_fromtimestamp(TyObject *cls, TyObject *args, TyObject *kw)
{
    TyObject *self;
    TyObject *timestamp;
    TyObject *tzinfo = Ty_None;
    static char *keywords[] = {"timestamp", "tz", NULL};

    if (! TyArg_ParseTupleAndKeywords(args, kw, "O|O:fromtimestamp",
                                      keywords, &timestamp, &tzinfo))
        return NULL;
    if (check_tzinfo_subclass(tzinfo) < 0)
        return NULL;

    self = datetime_from_timestamp(cls,
                                   tzinfo == Ty_None ? _TyTime_localtime :
                                   _TyTime_gmtime,
                                   timestamp,
                                   tzinfo);
    if (self != NULL && tzinfo != Ty_None) {
        /* Convert UTC to tzinfo's zone. */
        TyObject *res = PyObject_CallMethodOneArg(tzinfo, &_Ty_ID(fromutc), self);
        Ty_DECREF(self);
        return res;
    }
    return self;
}

/* Return new UTC datetime from timestamp (Python timestamp -- a double). */
static TyObject *
datetime_utcfromtimestamp(TyObject *cls, TyObject *args)
{
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
        "datetime.datetime.utcfromtimestamp() is deprecated and scheduled for removal "
        "in a future version. Use timezone-aware objects to represent "
        "datetimes in UTC: datetime.datetime.fromtimestamp(timestamp, datetime.UTC).", 1))
    {
        return NULL;
    }
    TyObject *timestamp;
    TyObject *result = NULL;

    if (TyArg_ParseTuple(args, "O:utcfromtimestamp", &timestamp))
        result = datetime_from_timestamp(cls, _TyTime_gmtime, timestamp,
                                         Ty_None);
    return result;
}

/* Return new datetime from _strptime.strptime_datetime_datetime(). */
static TyObject *
datetime_strptime(TyObject *cls, TyObject *args)
{
    TyObject *string, *format, *result;

    if (!TyArg_ParseTuple(args, "UU:strptime", &string, &format))
        return NULL;

    TyObject *module = TyImport_Import(&_Ty_ID(_strptime));
    if (module == NULL) {
        return NULL;
    }
    result = PyObject_CallMethodObjArgs(module,
                                        &_Ty_ID(_strptime_datetime_datetime),
                                        cls, string, format, NULL);
    Ty_DECREF(module);
    return result;
}

/* Return new datetime from date/datetime and time arguments. */
static TyObject *
datetime_combine(TyObject *cls, TyObject *args, TyObject *kw)
{
    static char *keywords[] = {"date", "time", "tzinfo", NULL};
    TyObject *date;
    TyObject *time;
    TyObject *tzinfo = NULL;
    TyObject *result = NULL;

    if (TyArg_ParseTupleAndKeywords(args, kw, "O!O!|O:combine", keywords,
                                    DATE_TYPE(NO_STATE), &date,
                                    TIME_TYPE(NO_STATE), &time, &tzinfo)) {
        if (tzinfo == NULL) {
            if (HASTZINFO(time))
                tzinfo = ((PyDateTime_Time *)time)->tzinfo;
            else
                tzinfo = Ty_None;
        }
        result = new_datetime_subclass_fold_ex(GET_YEAR(date),
                                               GET_MONTH(date),
                                               GET_DAY(date),
                                               TIME_GET_HOUR(time),
                                               TIME_GET_MINUTE(time),
                                               TIME_GET_SECOND(time),
                                               TIME_GET_MICROSECOND(time),
                                               tzinfo,
                                               TIME_GET_FOLD(time),
                                               cls);
    }
    return result;
}

static TyObject *
_sanitize_isoformat_str(TyObject *dtstr)
{
    Ty_ssize_t len = TyUnicode_GetLength(dtstr);
    if (len < 7) {  // All valid ISO 8601 strings are at least 7 characters long
        return NULL;
    }

    // `fromisoformat` allows surrogate characters in exactly one position,
    // the separator; to allow datetime_fromisoformat to make the simplifying
    // assumption that all valid strings can be encoded in UTF-8, this function
    // replaces any surrogate character separators with `T`.
    //
    // The result of this, if not NULL, returns a new reference
    const void* const unicode_data = TyUnicode_DATA(dtstr);
    const int kind = TyUnicode_KIND(dtstr);

    // Depending on the format of the string, the separator can only ever be
    // in positions 7, 8 or 10. We'll check each of these for a surrogate and
    // if we find one, replace it with `T`. If there is more than one surrogate,
    // we don't have to bother sanitizing it, because the function will later
    // fail when we try to encode the string as ASCII.
    static const size_t potential_separators[3] = {7, 8, 10};
    size_t surrogate_separator = 0;
    for(size_t idx = 0;
         idx < sizeof(potential_separators) / sizeof(*potential_separators);
         ++idx) {
        size_t pos = potential_separators[idx];
        if (pos > (size_t)len) {
            break;
        }

        if(Ty_UNICODE_IS_SURROGATE(TyUnicode_READ(kind, unicode_data, pos))) {
            surrogate_separator = pos;
            break;
        }
    }

    if (surrogate_separator == 0) {
        return Ty_NewRef(dtstr);
    }

    TyObject *str_out = _TyUnicode_Copy(dtstr);
    if (str_out == NULL) {
        return NULL;
    }

    if (TyUnicode_WriteChar(str_out, surrogate_separator, (Ty_UCS4)'T')) {
        Ty_DECREF(str_out);
        return NULL;
    }

    return str_out;
}


static Ty_ssize_t
_find_isoformat_datetime_separator(const char *dtstr, Ty_ssize_t len) {
    // The valid date formats can all be distinguished by characters 4 and 5
    // and further narrowed down by character
    // which tells us where to look for the separator character.
    // Format    |  As-rendered |   Position
    // ---------------------------------------
    // %Y-%m-%d  |  YYYY-MM-DD  |    10
    // %Y%m%d    |  YYYYMMDD    |     8
    // %Y-W%V    |  YYYY-Www    |     8
    // %YW%V     |  YYYYWww     |     7
    // %Y-W%V-%u |  YYYY-Www-d  |    10
    // %YW%V%u   |  YYYYWwwd    |     8
    // %Y-%j     |  YYYY-DDD    |     8
    // %Y%j      |  YYYYDDD     |     7
    //
    // Note that because we allow *any* character for the separator, in the
    // case where character 4 is W, it's not straightforward to determine where
    // the separator is — in the case of YYYY-Www-d, you have actual ambiguity,
    // e.g. 2020-W01-0000 could be YYYY-Www-D0HH or YYYY-Www-HHMM, when the
    // separator character is a number in the former case or a hyphen in the
    // latter case.
    //
    // The case of YYYYWww can be distinguished from YYYYWwwd by tracking ahead
    // to either the end of the string or the first non-numeric character —
    // since the time components all come in pairs YYYYWww#HH can be
    // distinguished from YYYYWwwd#HH by the fact that there will always be an
    // odd number of digits before the first non-digit character in the former
    // case.
    static const char date_separator = '-';
    static const char week_indicator = 'W';

    if (len == 7) {
        return 7;
    }

    if (dtstr[4] == date_separator) {
        // YYYY-???

        if (dtstr[5] == week_indicator) {
            // YYYY-W??

            if (len < 8) {
                return -1;
            }

            if (len > 8 && dtstr[8] == date_separator) {
                // YYYY-Www-D (10) or YYYY-Www-HH (8)
                if (len == 9) { return -1; }
                if (len > 10 && is_digit(dtstr[10])) {
                    // This is as far as we'll try to go to resolve the
                    // ambiguity for the moment — if we have YYYY-Www-##, the
                    // separator is either a hyphen at 8 or a number at 10.
                    //
                    // We'll assume it's a hyphen at 8 because it's way more
                    // likely that someone will use a hyphen as a separator
                    // than a number, but at this point it's really best effort
                    // because this is an extension of the spec anyway.
                    return 8;
                }

                return 10;
            } else {
                // YYYY-Www (8)
                return 8;
            }
        } else {
            // YYYY-MM-DD (10)
            return 10;
        }
    } else {
        // YYYY???
        if (dtstr[4] == week_indicator) {
            // YYYYWww (7) or YYYYWwwd (8)
            size_t idx = 7;
            for (; idx < (size_t)len; ++idx) {
                // Keep going until we run out of digits.
                if (!is_digit(dtstr[idx])) {
                    break;
                }
            }

            if (idx < 9) {
                return idx;
            }

            if (idx % 2 == 0) {
                // If the index of the last number is even, it's YYYYWww
                return 7;
            } else {
                return 8;
            }
        } else {
            // YYYYMMDD (8)
            return 8;
        }
    }
}

static TyObject *
datetime_fromisoformat(TyObject *cls, TyObject *dtstr)
{
    assert(dtstr != NULL);

    if (!TyUnicode_Check(dtstr)) {
        TyErr_SetString(TyExc_TypeError,
                        "fromisoformat: argument must be str");
        return NULL;
    }

    // We only need to sanitize this string if the separator is a surrogate
    // character. In the situation where the separator location is ambiguous,
    // we don't have to sanitize it anything because that can only happen when
    // the separator is either '-' or a number. This should mostly be a noop
    // but it makes the reference counting easier if we still sanitize.
    TyObject *dtstr_clean = _sanitize_isoformat_str(dtstr);
    if (dtstr_clean == NULL) {
        goto invalid_string_error;
    }

    Ty_ssize_t len;
    const char *dt_ptr = TyUnicode_AsUTF8AndSize(dtstr_clean, &len);

    if (dt_ptr == NULL) {
        if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
            // Encoding errors are invalid string errors at this point
            goto invalid_string_error;
        }
        else {
            goto error;
        }
    }

    const Ty_ssize_t separator_location = _find_isoformat_datetime_separator(
            dt_ptr, len);


    const char *p = dt_ptr;

    int year = 0, month = 0, day = 0;
    int hour = 0, minute = 0, second = 0, microsecond = 0;
    int tzoffset = 0, tzusec = 0;

    // date runs up to separator_location
    int rv = parse_isoformat_date(p, separator_location, &year, &month, &day);

    if (!rv && len > separator_location) {
        // In UTF-8, the length of multi-byte characters is encoded in the MSB
        p += separator_location;
        if ((p[0] & 0x80) == 0) {
            p += 1;
        }
        else {
            switch (p[0] & 0xf0) {
                case 0xe0:
                    p += 3;
                    break;
                case 0xf0:
                    p += 4;
                    break;
                default:
                    p += 2;
                    break;
            }
        }

        len -= (p - dt_ptr);
        rv = parse_isoformat_time(p, len, &hour, &minute, &second,
                                  &microsecond, &tzoffset, &tzusec);
    }
    if (rv < 0) {
        goto invalid_string_error;
    }

    TyObject *tzinfo = tzinfo_from_isoformat_results(rv, tzoffset, tzusec);
    if (tzinfo == NULL) {
        goto error;
    }

    if ((hour == 24) && (month <= 12))  {
        int d_in_month = days_in_month(year, month);
        if (day <= d_in_month) {
            if (minute == 0 && second == 0 && microsecond == 0) {
                // Calculate midnight of the next day
                hour = 0;
                day += 1;
                if (day > d_in_month) {
                    day = 1;
                    month += 1;
                    if (month > 12) {
                        month = 1;
                        year += 1;
                    }
                }
            } else {
                goto invalid_iso_midnight;
            }
        }
    }
    TyObject *dt = new_datetime_subclass_ex(year, month, day, hour, minute,
                                            second, microsecond, tzinfo, cls);

    Ty_DECREF(tzinfo);
    Ty_DECREF(dtstr_clean);
    return dt;

invalid_iso_midnight:
    TyErr_SetString(TyExc_ValueError, "minute, second, and microsecond must be 0 when hour is 24");
    Ty_DECREF(tzinfo);
    Ty_DECREF(dtstr_clean);
    return NULL;

invalid_string_error:
    TyErr_Format(TyExc_ValueError, "Invalid isoformat string: %R", dtstr);

error:
    Ty_XDECREF(dtstr_clean);

    return NULL;
}

/*
 * Destructor.
 */

static void
datetime_dealloc(TyObject *op)
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    if (HASTZINFO(self)) {
        Ty_XDECREF(self->tzinfo);
    }
    Ty_TYPE(self)->tp_free(self);
}

/*
 * Indirect access to tzinfo methods.
 */

/* These are all METH_NOARGS, so don't need to check the arglist. */
static TyObject *
datetime_utcoffset(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return call_utcoffset(GET_DT_TZINFO(self), op);
}

static TyObject *
datetime_dst(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return call_dst(GET_DT_TZINFO(self), op);
}

static TyObject *
datetime_tzname(TyObject *op, TyObject *Py_UNUSED(dummy)) {
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return call_tzname(GET_DT_TZINFO(self), op);
}

/*
 * datetime arithmetic.
 */

/* factor must be 1 (to add) or -1 (to subtract).  The result inherits
 * the tzinfo state of date.
 */
static TyObject *
add_datetime_timedelta(PyDateTime_DateTime *date, PyDateTime_Delta *delta,
                       int factor)
{
    /* Note that the C-level additions can't overflow, because of
     * invariant bounds on the member values.
     */
    int year = GET_YEAR(date);
    int month = GET_MONTH(date);
    int day = GET_DAY(date) + GET_TD_DAYS(delta) * factor;
    int hour = DATE_GET_HOUR(date);
    int minute = DATE_GET_MINUTE(date);
    int second = DATE_GET_SECOND(date) + GET_TD_SECONDS(delta) * factor;
    int microsecond = DATE_GET_MICROSECOND(date) +
                      GET_TD_MICROSECONDS(delta) * factor;

    assert(factor == 1 || factor == -1);
    if (normalize_datetime(&year, &month, &day,
                           &hour, &minute, &second, &microsecond) < 0) {
        return NULL;
    }

    return new_datetime_subclass_ex(year, month, day,
                                    hour, minute, second, microsecond,
                                    HASTZINFO(date) ? date->tzinfo : Ty_None,
                                    (TyObject *)Ty_TYPE(date));
}

static TyObject *
datetime_add(TyObject *left, TyObject *right)
{
    if (PyDateTime_Check(left)) {
        /* datetime + ??? */
        if (PyDelta_Check(right))
            /* datetime + delta */
            return add_datetime_timedelta(
                            (PyDateTime_DateTime *)left,
                            (PyDateTime_Delta *)right,
                            1);
    }
    else if (PyDelta_Check(left)) {
        /* delta + datetime */
        return add_datetime_timedelta((PyDateTime_DateTime *) right,
                                      (PyDateTime_Delta *) left,
                                      1);
    }
    Py_RETURN_NOTIMPLEMENTED;
}

static TyObject *
datetime_subtract(TyObject *left, TyObject *right)
{
    TyObject *result = Ty_NotImplemented;

    if (PyDateTime_Check(left)) {
        /* datetime - ??? */
        if (PyDateTime_Check(right)) {
            /* datetime - datetime */
            TyObject *offset1, *offset2, *offdiff = NULL;
            int delta_d, delta_s, delta_us;

            if (GET_DT_TZINFO(left) == GET_DT_TZINFO(right)) {
                offset1 = Ty_NewRef(Ty_None);
                offset2 = Ty_NewRef(Ty_None);
            }
            else {
                offset1 = datetime_utcoffset(left, NULL);
                if (offset1 == NULL)
                    return NULL;
                offset2 = datetime_utcoffset(right, NULL);
                if (offset2 == NULL) {
                    Ty_DECREF(offset1);
                    return NULL;
                }
                if ((offset1 != Ty_None) != (offset2 != Ty_None)) {
                    TyErr_SetString(TyExc_TypeError,
                                    "can't subtract offset-naive and "
                                    "offset-aware datetimes");
                    Ty_DECREF(offset1);
                    Ty_DECREF(offset2);
                    return NULL;
                }
            }
            if ((offset1 != offset2) &&
                delta_cmp(offset1, offset2) != 0) {
                offdiff = delta_subtract(offset1, offset2);
                if (offdiff == NULL) {
                    Ty_DECREF(offset1);
                    Ty_DECREF(offset2);
                    return NULL;
                }
            }
            Ty_DECREF(offset1);
            Ty_DECREF(offset2);
            delta_d = ymd_to_ord(GET_YEAR(left),
                                 GET_MONTH(left),
                                 GET_DAY(left)) -
                      ymd_to_ord(GET_YEAR(right),
                                 GET_MONTH(right),
                                 GET_DAY(right));
            /* These can't overflow, since the values are
             * normalized.  At most this gives the number of
             * seconds in one day.
             */
            delta_s = (DATE_GET_HOUR(left) -
                       DATE_GET_HOUR(right)) * 3600 +
                      (DATE_GET_MINUTE(left) -
                       DATE_GET_MINUTE(right)) * 60 +
                      (DATE_GET_SECOND(left) -
                       DATE_GET_SECOND(right));
            delta_us = DATE_GET_MICROSECOND(left) -
                       DATE_GET_MICROSECOND(right);
            result = new_delta(delta_d, delta_s, delta_us, 1);
            if (result == NULL)
                return NULL;

            if (offdiff != NULL) {
                Ty_SETREF(result, delta_subtract(result, offdiff));
                Ty_DECREF(offdiff);
            }
        }
        else if (PyDelta_Check(right)) {
            /* datetime - delta */
            result = add_datetime_timedelta(
                            (PyDateTime_DateTime *)left,
                            (PyDateTime_Delta *)right,
                            -1);
        }
    }

    if (result == Ty_NotImplemented)
        Ty_INCREF(result);
    return result;
}

/* Various ways to turn a datetime into a string. */

static TyObject *
datetime_repr(TyObject *op)
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    const char *type_name = Ty_TYPE(self)->tp_name;
    TyObject *baserepr;

    if (DATE_GET_MICROSECOND(self)) {
        baserepr = TyUnicode_FromFormat(
                      "%s(%d, %d, %d, %d, %d, %d, %d)",
                      type_name,
                      GET_YEAR(self), GET_MONTH(self), GET_DAY(self),
                      DATE_GET_HOUR(self), DATE_GET_MINUTE(self),
                      DATE_GET_SECOND(self),
                      DATE_GET_MICROSECOND(self));
    }
    else if (DATE_GET_SECOND(self)) {
        baserepr = TyUnicode_FromFormat(
                      "%s(%d, %d, %d, %d, %d, %d)",
                      type_name,
                      GET_YEAR(self), GET_MONTH(self), GET_DAY(self),
                      DATE_GET_HOUR(self), DATE_GET_MINUTE(self),
                      DATE_GET_SECOND(self));
    }
    else {
        baserepr = TyUnicode_FromFormat(
                      "%s(%d, %d, %d, %d, %d)",
                      type_name,
                      GET_YEAR(self), GET_MONTH(self), GET_DAY(self),
                      DATE_GET_HOUR(self), DATE_GET_MINUTE(self));
    }
    if (baserepr != NULL && DATE_GET_FOLD(self) != 0)
        baserepr = append_keyword_fold(baserepr, DATE_GET_FOLD(self));
    if (baserepr == NULL || ! HASTZINFO(self))
        return baserepr;
    return append_keyword_tzinfo(baserepr, self->tzinfo);
}

static TyObject *
datetime_str(TyObject *op)
{
    TyObject *space = TyUnicode_FromString(" ");
    if (space == NULL) {
        return NULL;
    }
    TyObject *res = PyObject_CallMethodOneArg(op, &_Ty_ID(isoformat), space);
    Ty_DECREF(space);
    return res;
}

static TyObject *
datetime_isoformat(TyObject *op, TyObject *args, TyObject *kw)
{
    int sep = 'T';
    char *timespec = NULL;
    static char *keywords[] = {"sep", "timespec", NULL};
    char buffer[100];
    PyDateTime_DateTime *self = PyDateTime_CAST(op);

    TyObject *result = NULL;
    int us = DATE_GET_MICROSECOND(self);
    static const char *specs[][2] = {
        {"hours", "%04d-%02d-%02d%c%02d"},
        {"minutes", "%04d-%02d-%02d%c%02d:%02d"},
        {"seconds", "%04d-%02d-%02d%c%02d:%02d:%02d"},
        {"milliseconds", "%04d-%02d-%02d%c%02d:%02d:%02d.%03d"},
        {"microseconds", "%04d-%02d-%02d%c%02d:%02d:%02d.%06d"},
    };
    size_t given_spec;

    if (!TyArg_ParseTupleAndKeywords(args, kw, "|Cs:isoformat", keywords, &sep, &timespec))
        return NULL;

    if (timespec == NULL || strcmp(timespec, "auto") == 0) {
        if (us == 0) {
            /* seconds */
            given_spec = 2;
        }
        else {
            /* microseconds */
            given_spec = 4;
        }
    }
    else {
        for (given_spec = 0; given_spec < Ty_ARRAY_LENGTH(specs); given_spec++) {
            if (strcmp(timespec, specs[given_spec][0]) == 0) {
                if (given_spec == 3) {
                    us = us / 1000;
                }
                break;
            }
        }
    }

    if (given_spec == Ty_ARRAY_LENGTH(specs)) {
        TyErr_Format(TyExc_ValueError, "Unknown timespec value");
        return NULL;
    }
    else {
        result = TyUnicode_FromFormat(specs[given_spec][1],
                                      GET_YEAR(self), GET_MONTH(self),
                                      GET_DAY(self), (int)sep,
                                      DATE_GET_HOUR(self), DATE_GET_MINUTE(self),
                                      DATE_GET_SECOND(self), us);
    }

    if (!result || !HASTZINFO(self))
        return result;

    /* We need to append the UTC offset. */
    if (format_utcoffset(buffer, sizeof(buffer), ":", self->tzinfo, op) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    TyUnicode_AppendAndDel(&result, TyUnicode_FromString(buffer));
    return result;
}

static TyObject *
datetime_ctime(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return format_ctime(op,
                        DATE_GET_HOUR(self),
                        DATE_GET_MINUTE(self),
                        DATE_GET_SECOND(self));
}

/* Miscellaneous methods. */

static TyObject *
flip_fold(TyObject *dt)
{
    return new_datetime_ex2(GET_YEAR(dt),
                            GET_MONTH(dt),
                            GET_DAY(dt),
                            DATE_GET_HOUR(dt),
                            DATE_GET_MINUTE(dt),
                            DATE_GET_SECOND(dt),
                            DATE_GET_MICROSECOND(dt),
                            HASTZINFO(dt) ?
                             ((PyDateTime_DateTime *)dt)->tzinfo : Ty_None,
                            !DATE_GET_FOLD(dt),
                            Ty_TYPE(dt));
}

static TyObject *
get_flip_fold_offset(TyObject *dt)
{
    TyObject *result, *flip_dt;

    flip_dt = flip_fold(dt);
    if (flip_dt == NULL)
        return NULL;
    result = datetime_utcoffset(flip_dt, NULL);
    Ty_DECREF(flip_dt);
    return result;
}

/* PEP 495 exception: Whenever one or both of the operands in
 * inter-zone comparison is such that its utcoffset() depends
 * on the value of its fold attribute, the result is False.
 *
 * Return 1 if exception applies, 0 if not,  and -1 on error.
 */
static int
pep495_eq_exception(TyObject *self, TyObject *other,
                    TyObject *offset_self, TyObject *offset_other)
{
    int result = 0;
    TyObject *flip_offset;

    flip_offset = get_flip_fold_offset(self);
    if (flip_offset == NULL)
        return -1;
    if (flip_offset != offset_self &&
        delta_cmp(flip_offset, offset_self))
    {
        result = 1;
        goto done;
    }
    Ty_DECREF(flip_offset);

    flip_offset = get_flip_fold_offset(other);
    if (flip_offset == NULL)
        return -1;
    if (flip_offset != offset_other &&
        delta_cmp(flip_offset, offset_other))
        result = 1;
 done:
    Ty_DECREF(flip_offset);
    return result;
}

static TyObject *
datetime_richcompare(TyObject *self, TyObject *other, int op)
{
    TyObject *result = NULL;
    TyObject *offset1, *offset2;
    int diff;

    if (!PyDateTime_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    if (GET_DT_TZINFO(self) == GET_DT_TZINFO(other)) {
        diff = memcmp(((PyDateTime_DateTime *)self)->data,
                      ((PyDateTime_DateTime *)other)->data,
                      _PyDateTime_DATETIME_DATASIZE);
        return diff_to_bool(diff, op);
    }
    offset1 = datetime_utcoffset(self, NULL);
    if (offset1 == NULL)
        return NULL;
    offset2 = datetime_utcoffset(other, NULL);
    if (offset2 == NULL)
        goto done;
    /* If they're both naive, or both aware and have the same offsets,
     * we get off cheap.  Note that if they're both naive, offset1 ==
     * offset2 == Ty_None at this point.
     */
    if ((offset1 == offset2) ||
        (PyDelta_Check(offset1) && PyDelta_Check(offset2) &&
         delta_cmp(offset1, offset2) == 0)) {
        diff = memcmp(((PyDateTime_DateTime *)self)->data,
                      ((PyDateTime_DateTime *)other)->data,
                      _PyDateTime_DATETIME_DATASIZE);
        if ((op == Py_EQ || op == Py_NE) && diff == 0) {
            int ex = pep495_eq_exception(self, other, offset1, offset2);
            if (ex == -1)
                goto done;
            if (ex)
                diff = 1;
        }
        result = diff_to_bool(diff, op);
    }
    else if (offset1 != Ty_None && offset2 != Ty_None) {
        PyDateTime_Delta *delta;

        assert(offset1 != offset2); /* else last "if" handled it */
        delta = (PyDateTime_Delta *)datetime_subtract((TyObject *)self,
                                                       other);
        if (delta == NULL)
            goto done;
        diff = GET_TD_DAYS(delta);
        if (diff == 0)
            diff = GET_TD_SECONDS(delta) |
                   GET_TD_MICROSECONDS(delta);
        Ty_DECREF(delta);
        if ((op == Py_EQ || op == Py_NE) && diff == 0) {
            int ex = pep495_eq_exception(self, other, offset1, offset2);
            if (ex == -1)
                goto done;
            if (ex)
                diff = 1;
        }
        result = diff_to_bool(diff, op);
    }
    else if (op == Py_EQ) {
        result = Ty_NewRef(Ty_False);
    }
    else if (op == Py_NE) {
        result = Ty_NewRef(Ty_True);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "can't compare offset-naive and "
                        "offset-aware datetimes");
    }
 done:
    Ty_DECREF(offset1);
    Ty_XDECREF(offset2);
    return result;
}

static Ty_hash_t
datetime_hash(TyObject *op)
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    if (self->hashcode == -1) {
        TyObject *offset, *self0;
        if (DATE_GET_FOLD(self)) {
            self0 = new_datetime_ex2(GET_YEAR(self),
                                     GET_MONTH(self),
                                     GET_DAY(self),
                                     DATE_GET_HOUR(self),
                                     DATE_GET_MINUTE(self),
                                     DATE_GET_SECOND(self),
                                     DATE_GET_MICROSECOND(self),
                                     HASTZINFO(self) ? self->tzinfo : Ty_None,
                                     0, Ty_TYPE(self));
            if (self0 == NULL)
                return -1;
        }
        else {
            self0 = Ty_NewRef(self);
        }
        offset = datetime_utcoffset(self0, NULL);
        Ty_DECREF(self0);

        if (offset == NULL)
            return -1;

        /* Reduce this to a hash of another object. */
        if (offset == Ty_None)
            self->hashcode = generic_hash(
                (unsigned char *)self->data, _PyDateTime_DATETIME_DATASIZE);
        else {
            TyObject *temp1, *temp2;
            int days, seconds;

            assert(HASTZINFO(self));
            days = ymd_to_ord(GET_YEAR(self),
                              GET_MONTH(self),
                              GET_DAY(self));
            seconds = DATE_GET_HOUR(self) * 3600 +
                      DATE_GET_MINUTE(self) * 60 +
                      DATE_GET_SECOND(self);
            temp1 = new_delta(days, seconds,
                              DATE_GET_MICROSECOND(self),
                              1);
            if (temp1 == NULL) {
                Ty_DECREF(offset);
                return -1;
            }
            temp2 = delta_subtract(temp1, offset);
            Ty_DECREF(temp1);
            if (temp2 == NULL) {
                Ty_DECREF(offset);
                return -1;
            }
            self->hashcode = PyObject_Hash(temp2);
            Ty_DECREF(temp2);
        }
        Ty_DECREF(offset);
    }
    return self->hashcode;
}

/*[clinic input]
datetime.datetime.replace

    year: int(c_default="GET_YEAR(self)") = unchanged
    month: int(c_default="GET_MONTH(self)") = unchanged
    day: int(c_default="GET_DAY(self)") = unchanged
    hour: int(c_default="DATE_GET_HOUR(self)") = unchanged
    minute: int(c_default="DATE_GET_MINUTE(self)") = unchanged
    second: int(c_default="DATE_GET_SECOND(self)") = unchanged
    microsecond: int(c_default="DATE_GET_MICROSECOND(self)") = unchanged
    tzinfo: object(c_default="HASTZINFO(self) ? ((PyDateTime_DateTime *)self)->tzinfo : Ty_None") = unchanged
    *
    fold: int(c_default="DATE_GET_FOLD(self)") = unchanged

Return datetime with new specified fields.
[clinic start generated code]*/

static TyObject *
datetime_datetime_replace_impl(PyDateTime_DateTime *self, int year,
                               int month, int day, int hour, int minute,
                               int second, int microsecond, TyObject *tzinfo,
                               int fold)
/*[clinic end generated code: output=00bc96536833fddb input=fd972762d604d3e7]*/
{
    return new_datetime_subclass_fold_ex(year, month, day, hour, minute,
                                         second, microsecond, tzinfo, fold,
                                         (TyObject *)Ty_TYPE(self));
}

static TyObject *
local_timezone_from_timestamp(time_t timestamp)
{
    TyObject *result = NULL;
    TyObject *delta;
    struct tm local_time_tm;
    TyObject *nameo = NULL;
    const char *zone = NULL;

    if (_TyTime_localtime(timestamp, &local_time_tm) != 0)
        return NULL;
#ifdef HAVE_STRUCT_TM_TM_ZONE
    zone = local_time_tm.tm_zone;
    delta = new_delta(0, local_time_tm.tm_gmtoff, 0, 1);
#else /* HAVE_STRUCT_TM_TM_ZONE */
    {
        TyObject *local_time, *utc_time;
        struct tm utc_time_tm;
        char buf[100];
        strftime(buf, sizeof(buf), "%Z", &local_time_tm);
        zone = buf;
        local_time = new_datetime(local_time_tm.tm_year + 1900,
                                  local_time_tm.tm_mon + 1,
                                  local_time_tm.tm_mday,
                                  local_time_tm.tm_hour,
                                  local_time_tm.tm_min,
                                  local_time_tm.tm_sec, 0, Ty_None, 0);
        if (local_time == NULL) {
            return NULL;
        }
        if (_TyTime_gmtime(timestamp, &utc_time_tm) != 0)
            return NULL;
        utc_time = new_datetime(utc_time_tm.tm_year + 1900,
                                utc_time_tm.tm_mon + 1,
                                utc_time_tm.tm_mday,
                                utc_time_tm.tm_hour,
                                utc_time_tm.tm_min,
                                utc_time_tm.tm_sec, 0, Ty_None, 0);
        if (utc_time == NULL) {
            Ty_DECREF(local_time);
            return NULL;
        }
        delta = datetime_subtract(local_time, utc_time);
        Ty_DECREF(local_time);
        Ty_DECREF(utc_time);
    }
#endif /* HAVE_STRUCT_TM_TM_ZONE */
    if (delta == NULL) {
            return NULL;
    }
    if (zone != NULL) {
        nameo = TyUnicode_DecodeLocale(zone, "surrogateescape");
        if (nameo == NULL)
            goto error;
    }
    result = new_timezone(delta, nameo);
    Ty_XDECREF(nameo);
  error:
    Ty_DECREF(delta);
    return result;
}

static TyObject *
local_timezone(PyDateTime_DateTime *utc_time)
{
    time_t timestamp;
    TyObject *delta;
    TyObject *one_second;
    TyObject *seconds;

    TyObject *current_mod = NULL;
    datetime_state *st = GET_CURRENT_STATE(current_mod);

    delta = datetime_subtract((TyObject *)utc_time, CONST_EPOCH(st));
    RELEASE_CURRENT_STATE(st, current_mod);
    if (delta == NULL)
        return NULL;

    one_second = new_delta(0, 1, 0, 0);
    if (one_second == NULL) {
        Ty_DECREF(delta);
        return NULL;
    }
    seconds = divide_timedelta_timedelta((PyDateTime_Delta *)delta,
                                         (PyDateTime_Delta *)one_second);
    Ty_DECREF(one_second);
    Ty_DECREF(delta);
    if (seconds == NULL)
        return NULL;
    timestamp = _TyLong_AsTime_t(seconds);
    Ty_DECREF(seconds);
    if (timestamp == -1 && TyErr_Occurred())
        return NULL;
    return local_timezone_from_timestamp(timestamp);
}

static long long
local_to_seconds(int year, int month, int day,
                 int hour, int minute, int second, int fold);

static TyObject *
local_timezone_from_local(PyDateTime_DateTime *local_dt)
{
    long long seconds, seconds2;
    time_t timestamp;
    int fold = DATE_GET_FOLD(local_dt);
    seconds = local_to_seconds(GET_YEAR(local_dt),
                               GET_MONTH(local_dt),
                               GET_DAY(local_dt),
                               DATE_GET_HOUR(local_dt),
                               DATE_GET_MINUTE(local_dt),
                               DATE_GET_SECOND(local_dt),
                               fold);
    if (seconds == -1)
        return NULL;
    seconds2 = local_to_seconds(GET_YEAR(local_dt),
                                GET_MONTH(local_dt),
                                GET_DAY(local_dt),
                                DATE_GET_HOUR(local_dt),
                                DATE_GET_MINUTE(local_dt),
                                DATE_GET_SECOND(local_dt),
                                !fold);
    if (seconds2 == -1)
        return NULL;
    /* Detect gap */
    if (seconds2 != seconds && (seconds2 > seconds) == fold)
        seconds = seconds2;

    /* XXX: add bounds check */
    timestamp = seconds - epoch;
    return local_timezone_from_timestamp(timestamp);
}

static TyObject *
datetime_astimezone(TyObject *op, TyObject *args, TyObject *kw)
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    PyDateTime_DateTime *result;
    TyObject *offset;
    TyObject *temp;
    TyObject *self_tzinfo;
    TyObject *tzinfo = Ty_None;
    static char *keywords[] = {"tz", NULL};

    if (! TyArg_ParseTupleAndKeywords(args, kw, "|O:astimezone", keywords,
                                      &tzinfo))
        return NULL;

    if (check_tzinfo_subclass(tzinfo) == -1)
        return NULL;

    if (!HASTZINFO(self) || self->tzinfo == Ty_None) {
  naive:
        self_tzinfo = local_timezone_from_local(self);
        if (self_tzinfo == NULL)
            return NULL;
    } else {
        self_tzinfo = Ty_NewRef(self->tzinfo);
    }

    /* Conversion to self's own time zone is a NOP. */
    if (self_tzinfo == tzinfo) {
        Ty_DECREF(self_tzinfo);
        return Ty_NewRef(self);
    }

    /* Convert self to UTC. */
    offset = call_utcoffset(self_tzinfo, (TyObject *)self);
    Ty_DECREF(self_tzinfo);
    if (offset == NULL)
        return NULL;
    else if(offset == Ty_None) {
        Ty_DECREF(offset);
        goto naive;
    }
    else if (!PyDelta_Check(offset)) {
        Ty_DECREF(offset);
        TyErr_Format(TyExc_TypeError, "utcoffset() returned %.200s,"
                     " expected timedelta or None", Ty_TYPE(offset)->tp_name);
        return NULL;
    }
    /* result = self - offset */
    result = (PyDateTime_DateTime *)add_datetime_timedelta(self,
                                       (PyDateTime_Delta *)offset, -1);
    Ty_DECREF(offset);
    if (result == NULL)
        return NULL;

    /* Make sure result is aware and UTC. */
    if (!HASTZINFO(result)) {
        temp = (TyObject *)result;
        result = (PyDateTime_DateTime *)
                   new_datetime_ex2(GET_YEAR(result),
                                    GET_MONTH(result),
                                    GET_DAY(result),
                                    DATE_GET_HOUR(result),
                                    DATE_GET_MINUTE(result),
                                    DATE_GET_SECOND(result),
                                    DATE_GET_MICROSECOND(result),
                                    CONST_UTC(NO_STATE),
                                    DATE_GET_FOLD(result),
                                    Ty_TYPE(result));
        Ty_DECREF(temp);
        if (result == NULL)
            return NULL;
    }
    else {
        /* Result is already aware - just replace tzinfo. */
        Ty_SETREF(result->tzinfo, Ty_NewRef(CONST_UTC(NO_STATE)));
    }

    /* Attach new tzinfo and let fromutc() do the rest. */
    if (tzinfo == Ty_None) {
        tzinfo = local_timezone(result);
        if (tzinfo == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
    }
    else
      Ty_INCREF(tzinfo);
    Ty_SETREF(result->tzinfo, tzinfo);

    temp = (TyObject *)result;
    result = (PyDateTime_DateTime *)
        PyObject_CallMethodOneArg(tzinfo, &_Ty_ID(fromutc), temp);
    Ty_DECREF(temp);

    return (TyObject *)result;
}

static TyObject *
datetime_timetuple(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    int dstflag = -1;

    if (HASTZINFO(self) && self->tzinfo != Ty_None) {
        TyObject * dst;

        dst = call_dst(self->tzinfo, op);
        if (dst == NULL)
            return NULL;

        if (dst != Ty_None)
            dstflag = delta_bool(dst);
        Ty_DECREF(dst);
    }
    return build_struct_time(GET_YEAR(self),
                             GET_MONTH(self),
                             GET_DAY(self),
                             DATE_GET_HOUR(self),
                             DATE_GET_MINUTE(self),
                             DATE_GET_SECOND(self),
                             dstflag);
}

static long long
local_to_seconds(int year, int month, int day,
                 int hour, int minute, int second, int fold)
{
    long long t, a, b, u1, u2, t1, t2, lt;
    t = utc_to_seconds(year, month, day, hour, minute, second);
    /* Our goal is to solve t = local(u) for u. */
    lt = local(t);
    if (lt == -1)
        return -1;
    a = lt - t;
    u1 = t - a;
    t1 = local(u1);
    if (t1 == -1)
        return -1;
    if (t1 == t) {
        /* We found one solution, but it may not be the one we need.
         * Look for an earlier solution (if `fold` is 0), or a
         * later one (if `fold` is 1). */
        if (fold)
            u2 = u1 + max_fold_seconds;
        else
            u2 = u1 - max_fold_seconds;
        lt = local(u2);
        if (lt == -1)
            return -1;
        b = lt - u2;
        if (a == b)
            return u1;
    }
    else {
        b = t1 - u1;
        assert(a != b);
    }
    u2 = t - b;
    t2 = local(u2);
    if (t2 == -1)
        return -1;
    if (t2 == t)
        return u2;
    if (t1 == t)
        return u1;
    /* We have found both offsets a and b, but neither t - a nor t - b is
     * a solution.  This means t is in the gap. */
    return fold?Ty_MIN(u1, u2):Ty_MAX(u1, u2);
}

/* date(1970,1,1).toordinal() == 719163 */
#define EPOCH_SECONDS (719163LL * 24 * 60 * 60)

static TyObject *
datetime_timestamp(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    TyObject *result;

    if (HASTZINFO(self) && self->tzinfo != Ty_None) {
        TyObject *current_mod = NULL;
        datetime_state *st = GET_CURRENT_STATE(current_mod);

        TyObject *delta;
        delta = datetime_subtract(op, CONST_EPOCH(st));
        RELEASE_CURRENT_STATE(st, current_mod);
        if (delta == NULL)
            return NULL;
        result = delta_total_seconds(delta, NULL);
        Ty_DECREF(delta);
    }
    else {
        long long seconds;
        seconds = local_to_seconds(GET_YEAR(self),
                                   GET_MONTH(self),
                                   GET_DAY(self),
                                   DATE_GET_HOUR(self),
                                   DATE_GET_MINUTE(self),
                                   DATE_GET_SECOND(self),
                                   DATE_GET_FOLD(self));
        if (seconds == -1)
            return NULL;
        result = TyFloat_FromDouble(seconds - EPOCH_SECONDS +
                                    DATE_GET_MICROSECOND(self) / 1e6);
    }
    return result;
}

static TyObject *
datetime_getdate(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return new_date(GET_YEAR(self),
                    GET_MONTH(self),
                    GET_DAY(self));
}

static TyObject *
datetime_gettime(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return new_time(DATE_GET_HOUR(self),
                    DATE_GET_MINUTE(self),
                    DATE_GET_SECOND(self),
                    DATE_GET_MICROSECOND(self),
                    Ty_None,
                    DATE_GET_FOLD(self));
}

static TyObject *
datetime_gettimetz(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return new_time(DATE_GET_HOUR(self),
                    DATE_GET_MINUTE(self),
                    DATE_GET_SECOND(self),
                    DATE_GET_MICROSECOND(self),
                    GET_DT_TZINFO(self),
                    DATE_GET_FOLD(self));
}

static TyObject *
datetime_utctimetuple(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    int y, m, d, hh, mm, ss;
    TyObject *tzinfo;
    PyDateTime_DateTime *utcself;
    PyDateTime_DateTime *self = PyDateTime_CAST(op);

    tzinfo = GET_DT_TZINFO(self);
    if (tzinfo == Ty_None) {
        utcself = (PyDateTime_DateTime*)Ty_NewRef(self);
    }
    else {
        TyObject *offset;
        offset = call_utcoffset(tzinfo, (TyObject *)self);
        if (offset == NULL)
            return NULL;
        if (offset == Ty_None) {
            Ty_DECREF(offset);
            utcself = (PyDateTime_DateTime*)Ty_NewRef(self);
        }
        else {
            utcself = (PyDateTime_DateTime *)add_datetime_timedelta(self,
                                                (PyDateTime_Delta *)offset, -1);
            Ty_DECREF(offset);
            if (utcself == NULL)
                return NULL;
        }
    }
    y = GET_YEAR(utcself);
    m = GET_MONTH(utcself);
    d = GET_DAY(utcself);
    hh = DATE_GET_HOUR(utcself);
    mm = DATE_GET_MINUTE(utcself);
    ss = DATE_GET_SECOND(utcself);

    Ty_DECREF(utcself);
    return build_struct_time(y, m, d, hh, mm, ss, 0);
}

/* Pickle support, a simple use of __reduce__. */

/* Let basestate be the non-tzinfo data string.
 * If tzinfo is None, this returns (basestate,), else (basestate, tzinfo).
 * So it's a tuple in any (non-error) case.
 * __getstate__ isn't exposed.
 */
static TyObject *
datetime_getstate(PyDateTime_DateTime *self, int proto)
{
    TyObject *basestate;
    TyObject *result = NULL;

    basestate = TyBytes_FromStringAndSize((char *)self->data,
                                           _PyDateTime_DATETIME_DATASIZE);
    if (basestate != NULL) {
        if (proto > 3 && DATE_GET_FOLD(self))
            /* Set the first bit of the third byte */
            TyBytes_AS_STRING(basestate)[2] |= (1 << 7);
        if (! HASTZINFO(self) || self->tzinfo == Ty_None)
            result = TyTuple_Pack(1, basestate);
        else
            result = TyTuple_Pack(2, basestate, self->tzinfo);
        Ty_DECREF(basestate);
    }
    return result;
}

static TyObject *
datetime_reduce_ex(TyObject *op, TyObject *args)
{
    int proto;
    if (!TyArg_ParseTuple(args, "i:__reduce_ex__", &proto))
        return NULL;

    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return Ty_BuildValue("(ON)", Ty_TYPE(self),
                         datetime_getstate(self, proto));
}

static TyObject *
datetime_reduce(TyObject *op, TyObject *Py_UNUSED(arg))
{
    PyDateTime_DateTime *self = PyDateTime_CAST(op);
    return Ty_BuildValue("(ON)", Ty_TYPE(self),
                         datetime_getstate(self, 2));
}

static TyMethodDef datetime_methods[] = {

    /* Class methods: */

    DATETIME_DATETIME_NOW_METHODDEF

    {"utcnow", datetime_utcnow,
     METH_NOARGS | METH_CLASS,
     TyDoc_STR("Return a new datetime representing UTC day and time.")},

    {"fromtimestamp", _PyCFunction_CAST(datetime_fromtimestamp),
     METH_VARARGS | METH_KEYWORDS | METH_CLASS,
     TyDoc_STR("timestamp[, tz] -> tz's local time from POSIX timestamp.")},

    {"utcfromtimestamp", datetime_utcfromtimestamp,
     METH_VARARGS | METH_CLASS,
     TyDoc_STR("Construct a naive UTC datetime from a POSIX timestamp.")},

    {"strptime", datetime_strptime,
     METH_VARARGS | METH_CLASS,
     TyDoc_STR("string, format -> new datetime parsed from a string "
               "(like time.strptime()).")},

    {"combine", _PyCFunction_CAST(datetime_combine),
     METH_VARARGS | METH_KEYWORDS | METH_CLASS,
     TyDoc_STR("date, time -> datetime with same date and time fields")},

    {"fromisoformat", datetime_fromisoformat,
     METH_O | METH_CLASS,
     TyDoc_STR("string -> datetime from a string in most ISO 8601 formats")},

    /* Instance methods: */

    {"date", datetime_getdate, METH_NOARGS,
     TyDoc_STR("Return date object with same year, month and day.")},

    {"time", datetime_gettime, METH_NOARGS,
     TyDoc_STR("Return time object with same time but with tzinfo=None.")},

    {"timetz", datetime_gettimetz, METH_NOARGS,
     TyDoc_STR("Return time object with same time and tzinfo.")},

    {"ctime", datetime_ctime, METH_NOARGS,
     TyDoc_STR("Return ctime() style string.")},

    {"timetuple", datetime_timetuple, METH_NOARGS,
     TyDoc_STR("Return time tuple, compatible with time.localtime().")},

    {"timestamp", datetime_timestamp, METH_NOARGS,
     TyDoc_STR("Return POSIX timestamp as float.")},

    {"utctimetuple", datetime_utctimetuple, METH_NOARGS,
     TyDoc_STR("Return UTC time tuple, compatible with time.localtime().")},

    {"isoformat", _PyCFunction_CAST(datetime_isoformat), METH_VARARGS | METH_KEYWORDS,
     TyDoc_STR("[sep] -> string in ISO 8601 format, "
               "YYYY-MM-DDT[HH[:MM[:SS[.mmm[uuu]]]]][+HH:MM].\n"
               "sep is used to separate the year from the time, and "
               "defaults to 'T'.\n"
               "The optional argument timespec specifies the number "
               "of additional terms\nof the time to include. Valid "
               "options are 'auto', 'hours', 'minutes',\n'seconds', "
               "'milliseconds' and 'microseconds'.\n")},

    {"utcoffset", datetime_utcoffset, METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.utcoffset(self).")},

    {"tzname", datetime_tzname,   METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.tzname(self).")},

    {"dst", datetime_dst, METH_NOARGS,
     TyDoc_STR("Return self.tzinfo.dst(self).")},

    DATETIME_DATETIME_REPLACE_METHODDEF

    {"__replace__", _PyCFunction_CAST(datetime_datetime_replace), METH_FASTCALL | METH_KEYWORDS,
     TyDoc_STR("__replace__($self, /, **changes)\n--\n\nThe same as replace().")},

    {"astimezone",  _PyCFunction_CAST(datetime_astimezone), METH_VARARGS | METH_KEYWORDS,
     TyDoc_STR("tz -> convert to local time in new timezone tz\n")},

    {"__reduce_ex__", datetime_reduce_ex, METH_VARARGS,
     TyDoc_STR("__reduce_ex__(proto) -> (cls, state)")},

    {"__reduce__", datetime_reduce, METH_NOARGS,
     TyDoc_STR("__reduce__() -> (cls, state)")},

    {NULL,      NULL}
};

static const char datetime_doc[] =
TyDoc_STR("datetime(year, month, day[, hour[, minute[, second[, microsecond[,tzinfo]]]]])\n\
\n\
The year, month and day arguments are required. tzinfo may be None, or an\n\
instance of a tzinfo subclass. The remaining arguments may be ints.\n");

static TyNumberMethods datetime_as_number = {
    datetime_add,                               /* nb_add */
    datetime_subtract,                          /* nb_subtract */
    0,                                          /* nb_multiply */
    0,                                          /* nb_remainder */
    0,                                          /* nb_divmod */
    0,                                          /* nb_power */
    0,                                          /* nb_negative */
    0,                                          /* nb_positive */
    0,                                          /* nb_absolute */
    0,                                          /* nb_bool */
};

static TyTypeObject PyDateTime_DateTimeType = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "datetime.datetime",                        /* tp_name */
    sizeof(PyDateTime_DateTime),                /* tp_basicsize */
    0,                                          /* tp_itemsize */
    datetime_dealloc,                           /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    datetime_repr,                              /* tp_repr */
    &datetime_as_number,                        /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    datetime_hash,                              /* tp_hash */
    0,                                          /* tp_call */
    datetime_str,                               /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE, /* tp_flags */
    datetime_doc,                               /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    datetime_richcompare,                       /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    datetime_methods,                           /* tp_methods */
    0,                                          /* tp_members */
    datetime_getset,                            /* tp_getset */
    &PyDateTime_DateType,                       /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    datetime_alloc,                             /* tp_alloc */
    datetime_new,                               /* tp_new */
    0,                                          /* tp_free */
};

/* ---------------------------------------------------------------------------
 * datetime C-API.
 */

static TyTypeObject * const capi_types[] = {
    &PyDateTime_DateType,
    &PyDateTime_DateTimeType,
    &PyDateTime_TimeType,
    &PyDateTime_DeltaType,
    &PyDateTime_TZInfoType,
    /* Indirectly, via the utc object. */
    &PyDateTime_TimeZoneType,
};

/* The C-API is process-global.  This violates interpreter isolation
 * due to the objects stored here.  Thus each of those objects must
 * be managed carefully. */
// XXX Can we make this const?
static PyDateTime_CAPI capi = {
    /* The classes must be readied before used here.
     * That will happen the first time the module is loaded.
     * They aren't safe to be shared between interpreters,
     * but that's okay as long as the module is single-phase init. */
    .DateType = &PyDateTime_DateType,
    .DateTimeType = &PyDateTime_DateTimeType,
    .TimeType = &PyDateTime_TimeType,
    .DeltaType = &PyDateTime_DeltaType,
    .TZInfoType = &PyDateTime_TZInfoType,

    .TimeZone_UTC = (TyObject *)&utc_timezone,

    .Date_FromDate = new_date_ex,
    .DateTime_FromDateAndTime = new_datetime_ex,
    .Time_FromTime = new_time_ex,
    .Delta_FromDelta = new_delta_ex,
    .TimeZone_FromTimeZone = new_timezone,
    .DateTime_FromTimestamp = datetime_fromtimestamp,
    .Date_FromTimestamp = datetime_date_fromtimestamp_capi,
    .DateTime_FromDateAndTimeAndFold = new_datetime_ex2,
    .Time_FromTimeAndFold = new_time_ex2,
};

/* Get a new C API by calling this function.
 * Clients get at C API via PyDateTime_IMPORT, defined in datetime.h.
 */
static inline PyDateTime_CAPI *
get_datetime_capi(void)
{
    return &capi;
}

static TyObject *
create_timezone_from_delta(int days, int sec, int ms, int normalize)
{
    TyObject *delta = new_delta(days, sec, ms, normalize);
    if (delta == NULL) {
        return NULL;
    }
    TyObject *tz = create_timezone(delta, NULL);
    Ty_DECREF(delta);
    return tz;
}


/* ---------------------------------------------------------------------------
 * Module state lifecycle.
 */

static int
init_state(datetime_state *st, TyObject *module, TyObject *old_module)
{
    /* Each module gets its own heap types. */
#define ADD_TYPE(FIELD, SPEC, BASE)                 \
    do {                                            \
        TyObject *cls = TyType_FromModuleAndSpec(   \
                module, SPEC, (TyObject *)BASE);    \
        if (cls == NULL) {                          \
            return -1;                              \
        }                                           \
        st->FIELD = (TyTypeObject *)cls;            \
    } while (0)

    ADD_TYPE(isocalendar_date_type, &isocal_spec, &TyTuple_Type);
#undef ADD_TYPE

    if (old_module != NULL) {
        assert(old_module != module);
        datetime_state *st_old = get_module_state(old_module);
        *st = (datetime_state){
            .isocalendar_date_type = st->isocalendar_date_type,
            .us_per_ms = Ty_NewRef(st_old->us_per_ms),
            .us_per_second = Ty_NewRef(st_old->us_per_second),
            .us_per_minute = Ty_NewRef(st_old->us_per_minute),
            .us_per_hour = Ty_NewRef(st_old->us_per_hour),
            .us_per_day = Ty_NewRef(st_old->us_per_day),
            .us_per_week = Ty_NewRef(st_old->us_per_week),
            .seconds_per_day = Ty_NewRef(st_old->seconds_per_day),
            .epoch = Ty_NewRef(st_old->epoch),
        };
        return 0;
    }

    st->us_per_ms = TyLong_FromLong(1000);
    if (st->us_per_ms == NULL) {
        return -1;
    }
    st->us_per_second = TyLong_FromLong(1000000);
    if (st->us_per_second == NULL) {
        return -1;
    }
    st->us_per_minute = TyLong_FromLong(60000000);
    if (st->us_per_minute == NULL) {
        return -1;
    }
    st->seconds_per_day = TyLong_FromLong(24 * 3600);
    if (st->seconds_per_day == NULL) {
        return -1;
    }

    /* The rest are too big for 32-bit ints, but even
     * us_per_week fits in 40 bits, so doubles should be exact.
     */
    st->us_per_hour = TyLong_FromDouble(3600000000.0);
    if (st->us_per_hour == NULL) {
        return -1;
    }
    st->us_per_day = TyLong_FromDouble(86400000000.0);
    if (st->us_per_day == NULL) {
        return -1;
    }
    st->us_per_week = TyLong_FromDouble(604800000000.0);
    if (st->us_per_week == NULL) {
        return -1;
    }

    /* Init Unix epoch */
    st->epoch = new_datetime(
            1970, 1, 1, 0, 0, 0, 0, (TyObject *)&utc_timezone, 0);
    if (st->epoch == NULL) {
        return -1;
    }

    return 0;
}

static int
traverse_state(datetime_state *st, visitproc visit, void *arg)
{
    /* heap types */
    Ty_VISIT(st->isocalendar_date_type);

    return 0;
}

static int
clear_state(datetime_state *st)
{
    Ty_CLEAR(st->isocalendar_date_type);
    Ty_CLEAR(st->us_per_ms);
    Ty_CLEAR(st->us_per_second);
    Ty_CLEAR(st->us_per_minute);
    Ty_CLEAR(st->us_per_hour);
    Ty_CLEAR(st->us_per_day);
    Ty_CLEAR(st->us_per_week);
    Ty_CLEAR(st->seconds_per_day);
    Ty_CLEAR(st->epoch);
    return 0;
}


TyStatus
_PyDateTime_InitTypes(TyInterpreterState *interp)
{
    /* Bases classes must be initialized before subclasses,
     * so capi_types must have the types in the appropriate order. */
    for (size_t i = 0; i < Ty_ARRAY_LENGTH(capi_types); i++) {
        TyTypeObject *type = capi_types[i];
        if (_PyStaticType_InitForExtension(interp, type) < 0) {
            return _TyStatus_ERR("could not initialize static types");
        }
    }

#define DATETIME_ADD_MACRO(dict, c, value_expr)         \
    do {                                                \
        assert(!TyErr_Occurred());                      \
        TyObject *value = (value_expr);                 \
        if (value == NULL) {                            \
            goto error;                                 \
        }                                               \
        if (TyDict_SetItemString(dict, c, value) < 0) { \
            Ty_DECREF(value);                           \
            goto error;                                 \
        }                                               \
        Ty_DECREF(value);                               \
    } while(0)

    /* timedelta values */
    TyObject *d = _TyType_GetDict(&PyDateTime_DeltaType);
    DATETIME_ADD_MACRO(d, "resolution", new_delta(0, 0, 1, 0));
    DATETIME_ADD_MACRO(d, "min", new_delta(-MAX_DELTA_DAYS, 0, 0, 0));
    DATETIME_ADD_MACRO(d, "max",
                        new_delta(MAX_DELTA_DAYS, 24*3600-1, 1000000-1, 0));

    /* date values */
    d = _TyType_GetDict(&PyDateTime_DateType);
    DATETIME_ADD_MACRO(d, "min", new_date(1, 1, 1));
    DATETIME_ADD_MACRO(d, "max", new_date(MAXYEAR, 12, 31));
    DATETIME_ADD_MACRO(d, "resolution", new_delta(1, 0, 0, 0));

    /* time values */
    d = _TyType_GetDict(&PyDateTime_TimeType);
    DATETIME_ADD_MACRO(d, "min", new_time(0, 0, 0, 0, Ty_None, 0));
    DATETIME_ADD_MACRO(d, "max", new_time(23, 59, 59, 999999, Ty_None, 0));
    DATETIME_ADD_MACRO(d, "resolution", new_delta(0, 0, 1, 0));

    /* datetime values */
    d = _TyType_GetDict(&PyDateTime_DateTimeType);
    DATETIME_ADD_MACRO(d, "min",
                        new_datetime(1, 1, 1, 0, 0, 0, 0, Ty_None, 0));
    DATETIME_ADD_MACRO(d, "max", new_datetime(MAXYEAR, 12, 31, 23, 59, 59,
                                                999999, Ty_None, 0));
    DATETIME_ADD_MACRO(d, "resolution", new_delta(0, 0, 1, 0));

    /* timezone values */
    d = _TyType_GetDict(&PyDateTime_TimeZoneType);
    if (TyDict_SetItemString(d, "utc", (TyObject *)&utc_timezone) < 0) {
        goto error;
    }

    /* bpo-37642: These attributes are rounded to the nearest minute for backwards
    * compatibility, even though the constructor will accept a wider range of
    * values. This may change in the future.*/

    /* -23:59 */
    DATETIME_ADD_MACRO(d, "min", create_timezone_from_delta(-1, 60, 0, 1));

    /* +23:59 */
    DATETIME_ADD_MACRO(
            d, "max", create_timezone_from_delta(0, (23 * 60 + 59) * 60, 0, 0));

#undef DATETIME_ADD_MACRO

    return _TyStatus_OK();

error:
    return _TyStatus_NO_MEMORY();
}


/* ---------------------------------------------------------------------------
 * Module methods and initialization.
 */

static TyMethodDef module_methods[] = {
    {NULL, NULL}
};


static int
_datetime_exec(TyObject *module)
{
    int rc = -1;
    datetime_state *st = get_module_state(module);

    TyInterpreterState *interp = TyInterpreterState_Get();
    TyObject *old_module = get_current_module(interp);
    if (TyErr_Occurred()) {
        assert(old_module == NULL);
        goto error;
    }
    /* We actually set the "current" module right before a successful return. */

    for (size_t i = 0; i < Ty_ARRAY_LENGTH(capi_types); i++) {
        TyTypeObject *type = capi_types[i];
        const char *name = _TyType_Name(type);
        assert(name != NULL);
        if (TyModule_AddObjectRef(module, name, (TyObject *)type) < 0) {
            goto error;
        }
    }

    if (init_state(st, module, old_module) < 0) {
        goto error;
    }

    /* Add module level attributes */
    if (TyModule_AddIntMacro(module, MINYEAR) < 0) {
        goto error;
    }
    if (TyModule_AddIntMacro(module, MAXYEAR) < 0) {
        goto error;
    }
    if (TyModule_AddObjectRef(module, "UTC", (TyObject *)&utc_timezone) < 0) {
        goto error;
    }

    /* At last, set up and add the encapsulated C API */
    PyDateTime_CAPI *capi = get_datetime_capi();
    if (capi == NULL) {
        goto error;
    }
    TyObject *capsule = PyCapsule_New(capi, PyDateTime_CAPSULE_NAME, NULL);
    // (capsule == NULL) is handled by TyModule_Add
    if (TyModule_Add(module, "datetime_CAPI", capsule) < 0) {
        goto error;
    }

    /* A 4-year cycle has an extra leap day over what we'd get from
     * pasting together 4 single years.
     */
    static_assert(DI4Y == 4 * 365 + 1, "DI4Y");
    assert(DI4Y == days_before_year(4+1));

    /* Similarly, a 400-year cycle has an extra leap day over what we'd
     * get from pasting together 4 100-year cycles.
     */
    static_assert(DI400Y == 4 * DI100Y + 1, "DI400Y");
    assert(DI400Y == days_before_year(400+1));

    /* OTOH, a 100-year cycle has one fewer leap day than we'd get from
     * pasting together 25 4-year cycles.
     */
    static_assert(DI100Y == 25 * DI4Y - 1, "DI100Y");
    assert(DI100Y == days_before_year(100+1));

    if (set_current_module(interp, module) < 0) {
        goto error;
    }

    rc = 0;
    goto finally;

error:
    clear_state(st);

finally:
    Ty_XDECREF(old_module);
    return rc;
}

static PyModuleDef_Slot module_slots[] = {
    {Ty_mod_exec, _datetime_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static int
module_traverse(TyObject *mod, visitproc visit, void *arg)
{
    datetime_state *st = get_module_state(mod);
    traverse_state(st, visit, arg);
    return 0;
}

static int
module_clear(TyObject *mod)
{
    datetime_state *st = get_module_state(mod);
    clear_state(st);

    TyInterpreterState *interp = TyInterpreterState_Get();
    clear_current_module(interp, mod);

    // The runtime takes care of the static types for us.
    // See _PyTypes_FiniExtTypes()..

    return 0;
}

static void
module_free(void *mod)
{
    (void)module_clear((TyObject *)mod);
}

static TyModuleDef datetimemodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_datetime",
    .m_doc = "Fast implementation of the datetime module.",
    .m_size = sizeof(datetime_state),
    .m_methods = module_methods,
    .m_slots = module_slots,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free,
};

PyMODINIT_FUNC
PyInit__datetime(void)
{
    return PyModuleDef_Init(&datetimemodule);
}

/* ---------------------------------------------------------------------------
Some time zone algebra.  For a datetime x, let
    x.n = x stripped of its timezone -- its naive time.
    x.o = x.utcoffset(), and assuming that doesn't raise an exception or
      return None
    x.d = x.dst(), and assuming that doesn't raise an exception or
      return None
    x.s = x's standard offset, x.o - x.d

Now some derived rules, where k is a duration (timedelta).

1. x.o = x.s + x.d
   This follows from the definition of x.s.

2. If x and y have the same tzinfo member, x.s = y.s.
   This is actually a requirement, an assumption we need to make about
   sane tzinfo classes.

3. The naive UTC time corresponding to x is x.n - x.o.
   This is again a requirement for a sane tzinfo class.

4. (x+k).s = x.s
   This follows from #2, and that datimetimetz+timedelta preserves tzinfo.

5. (x+k).n = x.n + k
   Again follows from how arithmetic is defined.

Now we can explain tz.fromutc(x).  Let's assume it's an interesting case
(meaning that the various tzinfo methods exist, and don't blow up or return
None when called).

The function wants to return a datetime y with timezone tz, equivalent to x.
x is already in UTC.

By #3, we want

    y.n - y.o = x.n                             [1]

The algorithm starts by attaching tz to x.n, and calling that y.  So
x.n = y.n at the start.  Then it wants to add a duration k to y, so that [1]
becomes true; in effect, we want to solve [2] for k:

   (y+k).n - (y+k).o = x.n                      [2]

By #1, this is the same as

   (y+k).n - ((y+k).s + (y+k).d) = x.n          [3]

By #5, (y+k).n = y.n + k, which equals x.n + k because x.n=y.n at the start.
Substituting that into [3],

   x.n + k - (y+k).s - (y+k).d = x.n; the x.n terms cancel, leaving
   k - (y+k).s - (y+k).d = 0; rearranging,
   k = (y+k).s - (y+k).d; by #4, (y+k).s == y.s, so
   k = y.s - (y+k).d

On the RHS, (y+k).d can't be computed directly, but y.s can be, and we
approximate k by ignoring the (y+k).d term at first.  Note that k can't be
very large, since all offset-returning methods return a duration of magnitude
less than 24 hours.  For that reason, if y is firmly in std time, (y+k).d must
be 0, so ignoring it has no consequence then.

In any case, the new value is

    z = y + y.s                                 [4]

It's helpful to step back at look at [4] from a higher level:  it's simply
mapping from UTC to tz's standard time.

At this point, if

    z.n - z.o = x.n                             [5]

we have an equivalent time, and are almost done.  The insecurity here is
at the start of daylight time.  Picture US Eastern for concreteness.  The wall
time jumps from 1:59 to 3:00, and wall hours of the form 2:MM don't make good
sense then.  The docs ask that an Eastern tzinfo class consider such a time to
be EDT (because it's "after 2"), which is a redundant spelling of 1:MM EST
on the day DST starts.  We want to return the 1:MM EST spelling because that's
the only spelling that makes sense on the local wall clock.

In fact, if [5] holds at this point, we do have the standard-time spelling,
but that takes a bit of proof.  We first prove a stronger result.  What's the
difference between the LHS and RHS of [5]?  Let

    diff = x.n - (z.n - z.o)                    [6]

Now
    z.n =                       by [4]
    (y + y.s).n =               by #5
    y.n + y.s =                 since y.n = x.n
    x.n + y.s =                 since z and y are have the same tzinfo member,
                                    y.s = z.s by #2
    x.n + z.s

Plugging that back into [6] gives

    diff =
    x.n - ((x.n + z.s) - z.o) =     expanding
    x.n - x.n - z.s + z.o =         cancelling
    - z.s + z.o =                   by #2
    z.d

So diff = z.d.

If [5] is true now, diff = 0, so z.d = 0 too, and we have the standard-time
spelling we wanted in the endcase described above.  We're done.  Contrarily,
if z.d = 0, then we have a UTC equivalent, and are also done.

If [5] is not true now, diff = z.d != 0, and z.d is the offset we need to
add to z (in effect, z is in tz's standard time, and we need to shift the
local clock into tz's daylight time).

Let

    z' = z + z.d = z + diff                     [7]

and we can again ask whether

    z'.n - z'.o = x.n                           [8]

If so, we're done.  If not, the tzinfo class is insane, according to the
assumptions we've made.  This also requires a bit of proof.  As before, let's
compute the difference between the LHS and RHS of [8] (and skipping some of
the justifications for the kinds of substitutions we've done several times
already):

    diff' = x.n - (z'.n - z'.o) =           replacing z'.n via [7]
        x.n  - (z.n + diff - z'.o) =    replacing diff via [6]
        x.n - (z.n + x.n - (z.n - z.o) - z'.o) =
        x.n - z.n - x.n + z.n - z.o + z'.o =    cancel x.n
        - z.n + z.n - z.o + z'.o =              cancel z.n
        - z.o + z'.o =                      #1 twice
        -z.s - z.d + z'.s + z'.d =          z and z' have same tzinfo
        z'.d - z.d

So z' is UTC-equivalent to x iff z'.d = z.d at this point.  If they are equal,
we've found the UTC-equivalent so are done.  In fact, we stop with [7] and
return z', not bothering to compute z'.d.

How could z.d and z'd differ?  z' = z + z.d [7], so merely moving z' by
a dst() offset, and starting *from* a time already in DST (we know z.d != 0),
would have to change the result dst() returns:  we start in DST, and moving
a little further into it takes us out of DST.

There isn't a sane case where this can happen.  The closest it gets is at
the end of DST, where there's an hour in UTC with no spelling in a hybrid
tzinfo class.  In US Eastern, that's 5:MM UTC = 0:MM EST = 1:MM EDT.  During
that hour, on an Eastern clock 1:MM is taken as being in standard time (6:MM
UTC) because the docs insist on that, but 0:MM is taken as being in daylight
time (4:MM UTC).  There is no local time mapping to 5:MM UTC.  The local
clock jumps from 1:59 back to 1:00 again, and repeats the 1:MM hour in
standard time.  Since that's what the local clock *does*, we want to map both
UTC hours 5:MM and 6:MM to 1:MM Eastern.  The result is ambiguous
in local time, but so it goes -- it's the way the local clock works.

When x = 5:MM UTC is the input to this algorithm, x.o=0, y.o=-5 and y.d=0,
so z=0:MM.  z.d=60 (minutes) then, so [5] doesn't hold and we keep going.
z' = z + z.d = 1:MM then, and z'.d=0, and z'.d - z.d = -60 != 0 so [8]
(correctly) concludes that z' is not UTC-equivalent to x.

Because we know z.d said z was in daylight time (else [5] would have held and
we would have stopped then), and we know z.d != z'.d (else [8] would have held
and we would have stopped then), and there are only 2 possible values dst() can
return in Eastern, it follows that z'.d must be 0 (which it is in the example,
but the reasoning doesn't depend on the example -- it depends on there being
two possible dst() outcomes, one zero and the other non-zero).  Therefore
z' must be in standard time, and is the spelling we want in this case.

Note again that z' is not UTC-equivalent as far as the hybrid tzinfo class is
concerned (because it takes z' as being in standard time rather than the
daylight time we intend here), but returning it gives the real-life "local
clock repeats an hour" behavior when mapping the "unspellable" UTC hour into
tz.

When the input is 6:MM, z=1:MM and z.d=0, and we stop at once, again with
the 1:MM standard time spelling we want.

So how can this break?  One of the assumptions must be violated.  Two
possibilities:

1) [2] effectively says that y.s is invariant across all y belong to a given
   time zone.  This isn't true if, for political reasons or continental drift,
   a region decides to change its base offset from UTC.

2) There may be versions of "double daylight" time where the tail end of
   the analysis gives up a step too early.  I haven't thought about that
   enough to say.

In any case, it's clear that the default fromutc() is strong enough to handle
"almost all" time zones:  so long as the standard offset is invariant, it
doesn't matter if daylight time transition points change from year to year, or
if daylight time is skipped in some years; it doesn't matter how large or
small dst() may get within its bounds; and it doesn't even matter if some
perverse time zone returns a negative dst()).  So a breaking case must be
pretty bizarre, and a tzinfo subclass can override fromutc() if it is.
--------------------------------------------------------------------------- */
