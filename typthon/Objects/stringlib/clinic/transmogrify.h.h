/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(stringlib_expandtabs__doc__,
"expandtabs($self, /, tabsize=8)\n"
"--\n"
"\n"
"Return a copy where all tab characters are expanded using spaces.\n"
"\n"
"If tabsize is not given, a tab size of 8 characters is assumed.");

#define STRINGLIB_EXPANDTABS_METHODDEF    \
    {"expandtabs", _PyCFunction_CAST(stringlib_expandtabs), METH_FASTCALL|METH_KEYWORDS, stringlib_expandtabs__doc__},

static TyObject *
stringlib_expandtabs_impl(TyObject *self, int tabsize);

static TyObject *
stringlib_expandtabs(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(tabsize), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"tabsize", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "expandtabs",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int tabsize = 8;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    tabsize = TyLong_AsInt(args[0]);
    if (tabsize == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = stringlib_expandtabs_impl(self, tabsize);

exit:
    return return_value;
}

TyDoc_STRVAR(stringlib_ljust__doc__,
"ljust($self, width, fillchar=b\' \', /)\n"
"--\n"
"\n"
"Return a left-justified string of length width.\n"
"\n"
"Padding is done using the specified fill character.");

#define STRINGLIB_LJUST_METHODDEF    \
    {"ljust", _PyCFunction_CAST(stringlib_ljust), METH_FASTCALL, stringlib_ljust__doc__},

static TyObject *
stringlib_ljust_impl(TyObject *self, Ty_ssize_t width, char fillchar);

static TyObject *
stringlib_ljust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    char fillchar = ' ';

    if (!_TyArg_CheckPositional("ljust", nargs, 1, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        width = ival;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[1])) {
        if (TyBytes_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "ljust(): argument 2 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyBytes_AS_STRING(args[1])[0];
    }
    else if (TyByteArray_Check(args[1])) {
        if (TyByteArray_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "ljust(): argument 2 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyByteArray_AS_STRING(args[1])[0];
    }
    else {
        _TyArg_BadArgument("ljust", "argument 2", "a byte string of length 1", args[1]);
        goto exit;
    }
skip_optional:
    return_value = stringlib_ljust_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(stringlib_rjust__doc__,
"rjust($self, width, fillchar=b\' \', /)\n"
"--\n"
"\n"
"Return a right-justified string of length width.\n"
"\n"
"Padding is done using the specified fill character.");

#define STRINGLIB_RJUST_METHODDEF    \
    {"rjust", _PyCFunction_CAST(stringlib_rjust), METH_FASTCALL, stringlib_rjust__doc__},

static TyObject *
stringlib_rjust_impl(TyObject *self, Ty_ssize_t width, char fillchar);

static TyObject *
stringlib_rjust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    char fillchar = ' ';

    if (!_TyArg_CheckPositional("rjust", nargs, 1, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        width = ival;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[1])) {
        if (TyBytes_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "rjust(): argument 2 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyBytes_AS_STRING(args[1])[0];
    }
    else if (TyByteArray_Check(args[1])) {
        if (TyByteArray_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "rjust(): argument 2 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyByteArray_AS_STRING(args[1])[0];
    }
    else {
        _TyArg_BadArgument("rjust", "argument 2", "a byte string of length 1", args[1]);
        goto exit;
    }
skip_optional:
    return_value = stringlib_rjust_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(stringlib_center__doc__,
"center($self, width, fillchar=b\' \', /)\n"
"--\n"
"\n"
"Return a centered string of length width.\n"
"\n"
"Padding is done using the specified fill character.");

#define STRINGLIB_CENTER_METHODDEF    \
    {"center", _PyCFunction_CAST(stringlib_center), METH_FASTCALL, stringlib_center__doc__},

static TyObject *
stringlib_center_impl(TyObject *self, Ty_ssize_t width, char fillchar);

static TyObject *
stringlib_center(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    char fillchar = ' ';

    if (!_TyArg_CheckPositional("center", nargs, 1, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        width = ival;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    if (TyBytes_Check(args[1])) {
        if (TyBytes_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "center(): argument 2 must be a byte string of length 1, "
                "not a bytes object of length %zd",
                TyBytes_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyBytes_AS_STRING(args[1])[0];
    }
    else if (TyByteArray_Check(args[1])) {
        if (TyByteArray_GET_SIZE(args[1]) != 1) {
            TyErr_Format(TyExc_TypeError,
                "center(): argument 2 must be a byte string of length 1, "
                "not a bytearray object of length %zd",
                TyByteArray_GET_SIZE(args[1]));
            goto exit;
        }
        fillchar = TyByteArray_AS_STRING(args[1])[0];
    }
    else {
        _TyArg_BadArgument("center", "argument 2", "a byte string of length 1", args[1]);
        goto exit;
    }
skip_optional:
    return_value = stringlib_center_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(stringlib_zfill__doc__,
"zfill($self, width, /)\n"
"--\n"
"\n"
"Pad a numeric string with zeros on the left, to fill a field of the given width.\n"
"\n"
"The original string is never truncated.");

#define STRINGLIB_ZFILL_METHODDEF    \
    {"zfill", (PyCFunction)stringlib_zfill, METH_O, stringlib_zfill__doc__},

static TyObject *
stringlib_zfill_impl(TyObject *self, Ty_ssize_t width);

static TyObject *
stringlib_zfill(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;

    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(arg);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        width = ival;
    }
    return_value = stringlib_zfill_impl(self, width);

exit:
    return return_value;
}
/*[clinic end generated code: output=8363b4b6cdaad556 input=a9049054013a1b77]*/
