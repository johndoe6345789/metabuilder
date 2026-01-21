/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(datetime_date_fromtimestamp__doc__,
"fromtimestamp($type, timestamp, /)\n"
"--\n"
"\n"
"Create a date from a POSIX timestamp.\n"
"\n"
"The timestamp is a number, e.g. created via time.time(), that is interpreted\n"
"as local time.");

#define DATETIME_DATE_FROMTIMESTAMP_METHODDEF    \
    {"fromtimestamp", (PyCFunction)datetime_date_fromtimestamp, METH_O|METH_CLASS, datetime_date_fromtimestamp__doc__},

static TyObject *
datetime_date_fromtimestamp_impl(TyTypeObject *type, TyObject *timestamp);

static TyObject *
datetime_date_fromtimestamp(TyObject *type, TyObject *timestamp)
{
    TyObject *return_value = NULL;

    return_value = datetime_date_fromtimestamp_impl((TyTypeObject *)type, timestamp);

    return return_value;
}

static TyObject *
iso_calendar_date_new_impl(TyTypeObject *type, int year, int week,
                           int weekday);

static TyObject *
iso_calendar_date_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(year), &_Ty_ID(week), &_Ty_ID(weekday), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"year", "week", "weekday", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "IsoCalendarDate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    int year;
    int week;
    int weekday;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    year = TyLong_AsInt(fastargs[0]);
    if (year == -1 && TyErr_Occurred()) {
        goto exit;
    }
    week = TyLong_AsInt(fastargs[1]);
    if (week == -1 && TyErr_Occurred()) {
        goto exit;
    }
    weekday = TyLong_AsInt(fastargs[2]);
    if (weekday == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = iso_calendar_date_new_impl(type, year, week, weekday);

exit:
    return return_value;
}

TyDoc_STRVAR(datetime_date_replace__doc__,
"replace($self, /, year=unchanged, month=unchanged, day=unchanged)\n"
"--\n"
"\n"
"Return date with new specified fields.");

#define DATETIME_DATE_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(datetime_date_replace), METH_FASTCALL|METH_KEYWORDS, datetime_date_replace__doc__},

static TyObject *
datetime_date_replace_impl(PyDateTime_Date *self, int year, int month,
                           int day);

static TyObject *
datetime_date_replace(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(year), &_Ty_ID(month), &_Ty_ID(day), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"year", "month", "day", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int year = GET_YEAR(self);
    int month = GET_MONTH(self);
    int day = GET_DAY(self);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        year = TyLong_AsInt(args[0]);
        if (year == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        month = TyLong_AsInt(args[1]);
        if (month == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    day = TyLong_AsInt(args[2]);
    if (day == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = datetime_date_replace_impl((PyDateTime_Date *)self, year, month, day);

exit:
    return return_value;
}

TyDoc_STRVAR(datetime_time_replace__doc__,
"replace($self, /, hour=unchanged, minute=unchanged, second=unchanged,\n"
"        microsecond=unchanged, tzinfo=unchanged, *, fold=unchanged)\n"
"--\n"
"\n"
"Return time with new specified fields.");

#define DATETIME_TIME_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(datetime_time_replace), METH_FASTCALL|METH_KEYWORDS, datetime_time_replace__doc__},

static TyObject *
datetime_time_replace_impl(PyDateTime_Time *self, int hour, int minute,
                           int second, int microsecond, TyObject *tzinfo,
                           int fold);

static TyObject *
datetime_time_replace(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 6
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(hour), &_Ty_ID(minute), &_Ty_ID(second), &_Ty_ID(microsecond), &_Ty_ID(tzinfo), &_Ty_ID(fold), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"hour", "minute", "second", "microsecond", "tzinfo", "fold", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int hour = TIME_GET_HOUR(self);
    int minute = TIME_GET_MINUTE(self);
    int second = TIME_GET_SECOND(self);
    int microsecond = TIME_GET_MICROSECOND(self);
    TyObject *tzinfo = HASTZINFO(self) ? ((PyDateTime_Time *)self)->tzinfo : Ty_None;
    int fold = TIME_GET_FOLD(self);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 5, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        hour = TyLong_AsInt(args[0]);
        if (hour == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        minute = TyLong_AsInt(args[1]);
        if (minute == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        second = TyLong_AsInt(args[2]);
        if (second == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[3]) {
        microsecond = TyLong_AsInt(args[3]);
        if (microsecond == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[4]) {
        tzinfo = args[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    fold = TyLong_AsInt(args[5]);
    if (fold == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = datetime_time_replace_impl((PyDateTime_Time *)self, hour, minute, second, microsecond, tzinfo, fold);

exit:
    return return_value;
}

TyDoc_STRVAR(datetime_datetime_now__doc__,
"now($type, /, tz=None)\n"
"--\n"
"\n"
"Returns new datetime object representing current time local to tz.\n"
"\n"
"  tz\n"
"    Timezone object.\n"
"\n"
"If no tz is specified, uses local timezone.");

#define DATETIME_DATETIME_NOW_METHODDEF    \
    {"now", _PyCFunction_CAST(datetime_datetime_now), METH_FASTCALL|METH_KEYWORDS|METH_CLASS, datetime_datetime_now__doc__},

static TyObject *
datetime_datetime_now_impl(TyTypeObject *type, TyObject *tz);

static TyObject *
datetime_datetime_now(TyObject *type, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(tz), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"tz", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "now",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *tz = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    tz = args[0];
skip_optional_pos:
    return_value = datetime_datetime_now_impl((TyTypeObject *)type, tz);

exit:
    return return_value;
}

TyDoc_STRVAR(datetime_datetime_replace__doc__,
"replace($self, /, year=unchanged, month=unchanged, day=unchanged,\n"
"        hour=unchanged, minute=unchanged, second=unchanged,\n"
"        microsecond=unchanged, tzinfo=unchanged, *, fold=unchanged)\n"
"--\n"
"\n"
"Return datetime with new specified fields.");

#define DATETIME_DATETIME_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(datetime_datetime_replace), METH_FASTCALL|METH_KEYWORDS, datetime_datetime_replace__doc__},

static TyObject *
datetime_datetime_replace_impl(PyDateTime_DateTime *self, int year,
                               int month, int day, int hour, int minute,
                               int second, int microsecond, TyObject *tzinfo,
                               int fold);

static TyObject *
datetime_datetime_replace(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(year), &_Ty_ID(month), &_Ty_ID(day), &_Ty_ID(hour), &_Ty_ID(minute), &_Ty_ID(second), &_Ty_ID(microsecond), &_Ty_ID(tzinfo), &_Ty_ID(fold), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"year", "month", "day", "hour", "minute", "second", "microsecond", "tzinfo", "fold", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[9];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int year = GET_YEAR(self);
    int month = GET_MONTH(self);
    int day = GET_DAY(self);
    int hour = DATE_GET_HOUR(self);
    int minute = DATE_GET_MINUTE(self);
    int second = DATE_GET_SECOND(self);
    int microsecond = DATE_GET_MICROSECOND(self);
    TyObject *tzinfo = HASTZINFO(self) ? ((PyDateTime_DateTime *)self)->tzinfo : Ty_None;
    int fold = DATE_GET_FOLD(self);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 8, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        year = TyLong_AsInt(args[0]);
        if (year == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        month = TyLong_AsInt(args[1]);
        if (month == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        day = TyLong_AsInt(args[2]);
        if (day == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[3]) {
        hour = TyLong_AsInt(args[3]);
        if (hour == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[4]) {
        minute = TyLong_AsInt(args[4]);
        if (minute == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[5]) {
        second = TyLong_AsInt(args[5]);
        if (second == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[6]) {
        microsecond = TyLong_AsInt(args[6]);
        if (microsecond == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[7]) {
        tzinfo = args[7];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    fold = TyLong_AsInt(args[8]);
    if (fold == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = datetime_datetime_replace_impl((PyDateTime_DateTime *)self, year, month, day, hour, minute, second, microsecond, tzinfo, fold);

exit:
    return return_value;
}
/*[clinic end generated code: output=809640e747529c72 input=a9049054013a1b77]*/
