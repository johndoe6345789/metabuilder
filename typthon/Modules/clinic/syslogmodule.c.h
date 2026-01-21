/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(syslog_openlog__doc__,
"openlog($module, /, ident=<unrepresentable>, logoption=0,\n"
"        facility=LOG_USER)\n"
"--\n"
"\n"
"Set logging options of subsequent syslog() calls.");

#define SYSLOG_OPENLOG_METHODDEF    \
    {"openlog", _PyCFunction_CAST(syslog_openlog), METH_FASTCALL|METH_KEYWORDS, syslog_openlog__doc__},

static TyObject *
syslog_openlog_impl(TyObject *module, TyObject *ident, long logopt,
                    long facility);

static TyObject *
syslog_openlog(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(ident), &_Ty_ID(logoption), &_Ty_ID(facility), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"ident", "logoption", "facility", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "openlog",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *ident = NULL;
    long logopt = 0;
    long facility = LOG_USER;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        if (!TyUnicode_Check(args[0])) {
            _TyArg_BadArgument("openlog", "argument 'ident'", "str", args[0]);
            goto exit;
        }
        ident = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        logopt = TyLong_AsLong(args[1]);
        if (logopt == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    facility = TyLong_AsLong(args[2]);
    if (facility == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    Ty_BEGIN_CRITICAL_SECTION(module);
    return_value = syslog_openlog_impl(module, ident, logopt, facility);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(syslog_syslog__doc__,
"syslog([priority=LOG_INFO,] message)\n"
"Send the string message to the system logger.");

#define SYSLOG_SYSLOG_METHODDEF    \
    {"syslog", (PyCFunction)syslog_syslog, METH_VARARGS, syslog_syslog__doc__},

static TyObject *
syslog_syslog_impl(TyObject *module, int group_left_1, int priority,
                   const char *message);

static TyObject *
syslog_syslog(TyObject *module, TyObject *args)
{
    TyObject *return_value = NULL;
    int group_left_1 = 0;
    int priority = LOG_INFO;
    const char *message;

    switch (TyTuple_GET_SIZE(args)) {
        case 1:
            if (!TyArg_ParseTuple(args, "s:syslog", &message)) {
                goto exit;
            }
            break;
        case 2:
            if (!TyArg_ParseTuple(args, "is:syslog", &priority, &message)) {
                goto exit;
            }
            group_left_1 = 1;
            break;
        default:
            TyErr_SetString(TyExc_TypeError, "syslog.syslog requires 1 to 2 arguments");
            goto exit;
    }
    Ty_BEGIN_CRITICAL_SECTION(module);
    return_value = syslog_syslog_impl(module, group_left_1, priority, message);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(syslog_closelog__doc__,
"closelog($module, /)\n"
"--\n"
"\n"
"Reset the syslog module values and call the system library closelog().");

#define SYSLOG_CLOSELOG_METHODDEF    \
    {"closelog", (PyCFunction)syslog_closelog, METH_NOARGS, syslog_closelog__doc__},

static TyObject *
syslog_closelog_impl(TyObject *module);

static TyObject *
syslog_closelog(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(module);
    return_value = syslog_closelog_impl(module);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(syslog_setlogmask__doc__,
"setlogmask($module, maskpri, /)\n"
"--\n"
"\n"
"Set the priority mask to maskpri and return the previous mask value.");

#define SYSLOG_SETLOGMASK_METHODDEF    \
    {"setlogmask", (PyCFunction)syslog_setlogmask, METH_O, syslog_setlogmask__doc__},

static long
syslog_setlogmask_impl(TyObject *module, long maskpri);

static TyObject *
syslog_setlogmask(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    long maskpri;
    long _return_value;

    maskpri = TyLong_AsLong(arg);
    if (maskpri == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = syslog_setlogmask_impl(module, maskpri);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(syslog_LOG_MASK__doc__,
"LOG_MASK($module, pri, /)\n"
"--\n"
"\n"
"Calculates the mask for the individual priority pri.");

#define SYSLOG_LOG_MASK_METHODDEF    \
    {"LOG_MASK", (PyCFunction)syslog_LOG_MASK, METH_O, syslog_LOG_MASK__doc__},

static long
syslog_LOG_MASK_impl(TyObject *module, long pri);

static TyObject *
syslog_LOG_MASK(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    long pri;
    long _return_value;

    pri = TyLong_AsLong(arg);
    if (pri == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = syslog_LOG_MASK_impl(module, pri);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(syslog_LOG_UPTO__doc__,
"LOG_UPTO($module, pri, /)\n"
"--\n"
"\n"
"Calculates the mask for all priorities up to and including pri.");

#define SYSLOG_LOG_UPTO_METHODDEF    \
    {"LOG_UPTO", (PyCFunction)syslog_LOG_UPTO, METH_O, syslog_LOG_UPTO__doc__},

static long
syslog_LOG_UPTO_impl(TyObject *module, long pri);

static TyObject *
syslog_LOG_UPTO(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    long pri;
    long _return_value;

    pri = TyLong_AsLong(arg);
    if (pri == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = syslog_LOG_UPTO_impl(module, pri);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}
/*[clinic end generated code: output=f92ac9948fa6131e input=a9049054013a1b77]*/
