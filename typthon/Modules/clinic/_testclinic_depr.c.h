/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_long.h"          // _TyLong_UnsignedShort_Converter()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_tuple.h"         // _TyTuple_FromArray()

TyDoc_STRVAR(depr_star_new__doc__,
"DeprStarNew(a=None)\n"
"--\n"
"\n"
"The deprecation message should use the class name instead of __new__.\n"
"\n"
"Note: Passing positional arguments to _testclinic.DeprStarNew() is\n"
"deprecated. Parameter \'a\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

static TyObject *
depr_star_new_impl(TyTypeObject *type, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprStarNew.__new__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprStarNew.__new__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprStarNew.__new__'."
#  endif
#endif

static TyObject *
depr_star_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "DeprStarNew",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *a = Ty_None;

    if (nargs == 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to _testclinic.DeprStarNew() is "
                "deprecated. Parameter 'a' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = fastargs[0];
skip_optional_pos:
    return_value = depr_star_new_impl(type, a);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_new_clone__doc__,
"cloned($self, /, a=None)\n"
"--\n"
"\n"
"Note: Passing positional arguments to _testclinic.DeprStarNew.cloned()\n"
"is deprecated. Parameter \'a\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_STAR_NEW_CLONE_METHODDEF    \
    {"cloned", _PyCFunction_CAST(depr_star_new_clone), METH_FASTCALL|METH_KEYWORDS, depr_star_new_clone__doc__},

static TyObject *
depr_star_new_clone_impl(TyObject *type, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprStarNew.cloned'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprStarNew.cloned'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprStarNew.cloned'."
#  endif
#endif

static TyObject *
depr_star_new_clone(TyObject *type, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "cloned",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *a = Ty_None;

    if (nargs == 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to _testclinic.DeprStarNew.cloned()"
                " is deprecated. Parameter 'a' will become a keyword-only "
                "parameter in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = args[0];
skip_optional_pos:
    return_value = depr_star_new_clone_impl(type, a);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_init__doc__,
"DeprStarInit(a=None)\n"
"--\n"
"\n"
"The deprecation message should use the class name instead of __init__.\n"
"\n"
"Note: Passing positional arguments to _testclinic.DeprStarInit() is\n"
"deprecated. Parameter \'a\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

static int
depr_star_init_impl(TyObject *self, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprStarInit.__init__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprStarInit.__init__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprStarInit.__init__'."
#  endif
#endif

static int
depr_star_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "DeprStarInit",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *a = Ty_None;

    if (nargs == 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to _testclinic.DeprStarInit() is "
                "deprecated. Parameter 'a' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = fastargs[0];
skip_optional_pos:
    return_value = depr_star_init_impl(self, a);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_init_clone__doc__,
"cloned($self, /, a=None)\n"
"--\n"
"\n"
"Note: Passing positional arguments to\n"
"_testclinic.DeprStarInit.cloned() is deprecated. Parameter \'a\' will\n"
"become a keyword-only parameter in Python 3.14.\n"
"");

#define DEPR_STAR_INIT_CLONE_METHODDEF    \
    {"cloned", _PyCFunction_CAST(depr_star_init_clone), METH_FASTCALL|METH_KEYWORDS, depr_star_init_clone__doc__},

static TyObject *
depr_star_init_clone_impl(TyObject *self, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprStarInit.cloned'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprStarInit.cloned'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprStarInit.cloned'."
#  endif
#endif

static TyObject *
depr_star_init_clone(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "cloned",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *a = Ty_None;

    if (nargs == 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to "
                "_testclinic.DeprStarInit.cloned() is deprecated. Parameter 'a' "
                "will become a keyword-only parameter in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = args[0];
skip_optional_pos:
    return_value = depr_star_init_clone_impl(self, a);

exit:
    return return_value;
}

static int
depr_star_init_noinline_impl(TyObject *self, TyObject *a, TyObject *b,
                             TyObject *c, const char *d, Ty_ssize_t d_length);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprStarInitNoInline.__init__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprStarInitNoInline.__init__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprStarInitNoInline.__init__'."
#  endif
#endif

static int
depr_star_init_noinline(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "OO|O$s#:DeprStarInitNoInline",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    const char *d = "";
    Ty_ssize_t d_length;

    if (nargs > 1 && nargs <= 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to "
                "_testclinic.DeprStarInitNoInline() is deprecated. Parameters 'b'"
                " and 'c' will become keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    if (!_TyArg_ParseTupleAndKeywordsFast(args, kwargs, &_parser,
        &a, &b, &c, &d, &d_length)) {
        goto exit;
    }
    return_value = depr_star_init_noinline_impl(self, a, b, c, d, d_length);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_new__doc__,
"DeprKwdNew(a=None)\n"
"--\n"
"\n"
"The deprecation message should use the class name instead of __new__.\n"
"\n"
"Note: Passing keyword argument \'a\' to _testclinic.DeprKwdNew() is\n"
"deprecated. Parameter \'a\' will become positional-only in Python 3.14.\n"
"");

static TyObject *
depr_kwd_new_impl(TyTypeObject *type, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprKwdNew.__new__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprKwdNew.__new__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprKwdNew.__new__'."
#  endif
#endif

static TyObject *
depr_kwd_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "DeprKwdNew",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *a = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (kwargs && TyDict_GET_SIZE(kwargs) && nargs < 1 && fastargs[0]) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'a' to _testclinic.DeprKwdNew() is "
                "deprecated. Parameter 'a' will become positional-only in Python "
                "3.14.", 1))
        {
            goto exit;
        }
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = fastargs[0];
skip_optional_pos:
    return_value = depr_kwd_new_impl(type, a);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_init__doc__,
"DeprKwdInit(a=None)\n"
"--\n"
"\n"
"The deprecation message should use the class name instead of __init__.\n"
"\n"
"Note: Passing keyword argument \'a\' to _testclinic.DeprKwdInit() is\n"
"deprecated. Parameter \'a\' will become positional-only in Python 3.14.\n"
"");

static int
depr_kwd_init_impl(TyObject *self, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprKwdInit.__init__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprKwdInit.__init__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprKwdInit.__init__'."
#  endif
#endif

static int
depr_kwd_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "DeprKwdInit",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *a = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (kwargs && TyDict_GET_SIZE(kwargs) && nargs < 1 && fastargs[0]) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'a' to _testclinic.DeprKwdInit() is "
                "deprecated. Parameter 'a' will become positional-only in Python "
                "3.14.", 1))
        {
            goto exit;
        }
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    a = fastargs[0];
skip_optional_pos:
    return_value = depr_kwd_init_impl(self, a);

exit:
    return return_value;
}

static int
depr_kwd_init_noinline_impl(TyObject *self, TyObject *a, TyObject *b,
                            TyObject *c, const char *d, Ty_ssize_t d_length);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of '_testclinic.DeprKwdInitNoInline.__init__'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_testclinic.DeprKwdInitNoInline.__init__'.")
#  else
#    warning "Update the clinic input of '_testclinic.DeprKwdInitNoInline.__init__'."
#  endif
#endif

static int
depr_kwd_init_noinline(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "OO|Os#:DeprKwdInitNoInline",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    const char *d = "";
    Ty_ssize_t d_length;

    if (!_TyArg_ParseTupleAndKeywordsFast(args, kwargs, &_parser,
        &a, &b, &c, &d, &d_length)) {
        goto exit;
    }
    if (kwargs && TyDict_GET_SIZE(kwargs) && ((nargs < 2) || (nargs < 3 && TyDict_Contains(kwargs, _Ty_LATIN1_CHR('c'))))) {
        if (TyErr_Occurred()) { // TyDict_Contains() above can fail
            goto exit;
        }
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to "
                "_testclinic.DeprKwdInitNoInline() is deprecated. Parameters 'b' "
                "and 'c' will become positional-only in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    return_value = depr_kwd_init_noinline_impl(self, a, b, c, d, d_length);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos0_len1__doc__,
"depr_star_pos0_len1($module, /, a)\n"
"--\n"
"\n"
"Note: Passing positional arguments to depr_star_pos0_len1() is\n"
"deprecated. Parameter \'a\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_STAR_POS0_LEN1_METHODDEF    \
    {"depr_star_pos0_len1", _PyCFunction_CAST(depr_star_pos0_len1), METH_FASTCALL|METH_KEYWORDS, depr_star_pos0_len1__doc__},

static TyObject *
depr_star_pos0_len1_impl(TyObject *module, TyObject *a);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos0_len1'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos0_len1'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos0_len1'."
#  endif
#endif

static TyObject *
depr_star_pos0_len1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos0_len1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *a;

    if (nargs == 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to depr_star_pos0_len1() is "
                "deprecated. Parameter 'a' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    return_value = depr_star_pos0_len1_impl(module, a);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos0_len2__doc__,
"depr_star_pos0_len2($module, /, a, b)\n"
"--\n"
"\n"
"Note: Passing positional arguments to depr_star_pos0_len2() is\n"
"deprecated. Parameters \'a\' and \'b\' will become keyword-only parameters\n"
"in Python 3.14.\n"
"");

#define DEPR_STAR_POS0_LEN2_METHODDEF    \
    {"depr_star_pos0_len2", _PyCFunction_CAST(depr_star_pos0_len2), METH_FASTCALL|METH_KEYWORDS, depr_star_pos0_len2__doc__},

static TyObject *
depr_star_pos0_len2_impl(TyObject *module, TyObject *a, TyObject *b);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos0_len2'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos0_len2'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos0_len2'."
#  endif
#endif

static TyObject *
depr_star_pos0_len2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos0_len2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    if (nargs > 0 && nargs <= 2) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to depr_star_pos0_len2() is "
                "deprecated. Parameters 'a' and 'b' will become keyword-only "
                "parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = depr_star_pos0_len2_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos0_len3_with_kwd__doc__,
"depr_star_pos0_len3_with_kwd($module, /, a, b, c, *, d)\n"
"--\n"
"\n"
"Note: Passing positional arguments to depr_star_pos0_len3_with_kwd()\n"
"is deprecated. Parameters \'a\', \'b\' and \'c\' will become keyword-only\n"
"parameters in Python 3.14.\n"
"");

#define DEPR_STAR_POS0_LEN3_WITH_KWD_METHODDEF    \
    {"depr_star_pos0_len3_with_kwd", _PyCFunction_CAST(depr_star_pos0_len3_with_kwd), METH_FASTCALL|METH_KEYWORDS, depr_star_pos0_len3_with_kwd__doc__},

static TyObject *
depr_star_pos0_len3_with_kwd_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject *c, TyObject *d);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos0_len3_with_kwd'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos0_len3_with_kwd'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos0_len3_with_kwd'."
#  endif
#endif

static TyObject *
depr_star_pos0_len3_with_kwd(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos0_len3_with_kwd",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;

    if (nargs > 0 && nargs <= 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing positional arguments to depr_star_pos0_len3_with_kwd() "
                "is deprecated. Parameters 'a', 'b' and 'c' will become "
                "keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    return_value = depr_star_pos0_len3_with_kwd_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos1_len1_opt__doc__,
"depr_star_pos1_len1_opt($module, /, a, b=None)\n"
"--\n"
"\n"
"Note: Passing 2 positional arguments to depr_star_pos1_len1_opt() is\n"
"deprecated. Parameter \'b\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_STAR_POS1_LEN1_OPT_METHODDEF    \
    {"depr_star_pos1_len1_opt", _PyCFunction_CAST(depr_star_pos1_len1_opt), METH_FASTCALL|METH_KEYWORDS, depr_star_pos1_len1_opt__doc__},

static TyObject *
depr_star_pos1_len1_opt_impl(TyObject *module, TyObject *a, TyObject *b);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos1_len1_opt'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos1_len1_opt'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos1_len1_opt'."
#  endif
#endif

static TyObject *
depr_star_pos1_len1_opt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos1_len1_opt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;

    if (nargs == 2) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing 2 positional arguments to depr_star_pos1_len1_opt() is "
                "deprecated. Parameter 'b' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    b = args[1];
skip_optional_pos:
    return_value = depr_star_pos1_len1_opt_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos1_len1__doc__,
"depr_star_pos1_len1($module, /, a, b)\n"
"--\n"
"\n"
"Note: Passing 2 positional arguments to depr_star_pos1_len1() is\n"
"deprecated. Parameter \'b\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_STAR_POS1_LEN1_METHODDEF    \
    {"depr_star_pos1_len1", _PyCFunction_CAST(depr_star_pos1_len1), METH_FASTCALL|METH_KEYWORDS, depr_star_pos1_len1__doc__},

static TyObject *
depr_star_pos1_len1_impl(TyObject *module, TyObject *a, TyObject *b);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos1_len1'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos1_len1'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos1_len1'."
#  endif
#endif

static TyObject *
depr_star_pos1_len1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos1_len1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    if (nargs == 2) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing 2 positional arguments to depr_star_pos1_len1() is "
                "deprecated. Parameter 'b' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = depr_star_pos1_len1_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos1_len2_with_kwd__doc__,
"depr_star_pos1_len2_with_kwd($module, /, a, b, c, *, d)\n"
"--\n"
"\n"
"Note: Passing more than 1 positional argument to\n"
"depr_star_pos1_len2_with_kwd() is deprecated. Parameters \'b\' and \'c\'\n"
"will become keyword-only parameters in Python 3.14.\n"
"");

#define DEPR_STAR_POS1_LEN2_WITH_KWD_METHODDEF    \
    {"depr_star_pos1_len2_with_kwd", _PyCFunction_CAST(depr_star_pos1_len2_with_kwd), METH_FASTCALL|METH_KEYWORDS, depr_star_pos1_len2_with_kwd__doc__},

static TyObject *
depr_star_pos1_len2_with_kwd_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject *c, TyObject *d);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos1_len2_with_kwd'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos1_len2_with_kwd'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos1_len2_with_kwd'."
#  endif
#endif

static TyObject *
depr_star_pos1_len2_with_kwd(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos1_len2_with_kwd",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;

    if (nargs > 1 && nargs <= 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to "
                "depr_star_pos1_len2_with_kwd() is deprecated. Parameters 'b' and"
                " 'c' will become keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    return_value = depr_star_pos1_len2_with_kwd_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos2_len1__doc__,
"depr_star_pos2_len1($module, /, a, b, c)\n"
"--\n"
"\n"
"Note: Passing 3 positional arguments to depr_star_pos2_len1() is\n"
"deprecated. Parameter \'c\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_STAR_POS2_LEN1_METHODDEF    \
    {"depr_star_pos2_len1", _PyCFunction_CAST(depr_star_pos2_len1), METH_FASTCALL|METH_KEYWORDS, depr_star_pos2_len1__doc__},

static TyObject *
depr_star_pos2_len1_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos2_len1'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos2_len1'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos2_len1'."
#  endif
#endif

static TyObject *
depr_star_pos2_len1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos2_len1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject *a;
    TyObject *b;
    TyObject *c;

    if (nargs == 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing 3 positional arguments to depr_star_pos2_len1() is "
                "deprecated. Parameter 'c' will become a keyword-only parameter "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    return_value = depr_star_pos2_len1_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos2_len2__doc__,
"depr_star_pos2_len2($module, /, a, b, c, d)\n"
"--\n"
"\n"
"Note: Passing more than 2 positional arguments to\n"
"depr_star_pos2_len2() is deprecated. Parameters \'c\' and \'d\' will\n"
"become keyword-only parameters in Python 3.14.\n"
"");

#define DEPR_STAR_POS2_LEN2_METHODDEF    \
    {"depr_star_pos2_len2", _PyCFunction_CAST(depr_star_pos2_len2), METH_FASTCALL|METH_KEYWORDS, depr_star_pos2_len2__doc__},

static TyObject *
depr_star_pos2_len2_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c, TyObject *d);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos2_len2'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos2_len2'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos2_len2'."
#  endif
#endif

static TyObject *
depr_star_pos2_len2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos2_len2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;

    if (nargs > 2 && nargs <= 4) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 2 positional arguments to "
                "depr_star_pos2_len2() is deprecated. Parameters 'c' and 'd' will"
                " become keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    return_value = depr_star_pos2_len2_impl(module, a, b, c, d);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_pos2_len2_with_kwd__doc__,
"depr_star_pos2_len2_with_kwd($module, /, a, b, c, d, *, e)\n"
"--\n"
"\n"
"Note: Passing more than 2 positional arguments to\n"
"depr_star_pos2_len2_with_kwd() is deprecated. Parameters \'c\' and \'d\'\n"
"will become keyword-only parameters in Python 3.14.\n"
"");

#define DEPR_STAR_POS2_LEN2_WITH_KWD_METHODDEF    \
    {"depr_star_pos2_len2_with_kwd", _PyCFunction_CAST(depr_star_pos2_len2_with_kwd), METH_FASTCALL|METH_KEYWORDS, depr_star_pos2_len2_with_kwd__doc__},

static TyObject *
depr_star_pos2_len2_with_kwd_impl(TyObject *module, TyObject *a, TyObject *b,
                                  TyObject *c, TyObject *d, TyObject *e);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_pos2_len2_with_kwd'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_pos2_len2_with_kwd'.")
#  else
#    warning "Update the clinic input of 'depr_star_pos2_len2_with_kwd'."
#  endif
#endif

static TyObject *
depr_star_pos2_len2_with_kwd(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", "e", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_pos2_len2_with_kwd",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;
    TyObject *e;

    if (nargs > 2 && nargs <= 4) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 2 positional arguments to "
                "depr_star_pos2_len2_with_kwd() is deprecated. Parameters 'c' and"
                " 'd' will become keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 4, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    e = args[4];
    return_value = depr_star_pos2_len2_with_kwd_impl(module, a, b, c, d, e);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_noinline__doc__,
"depr_star_noinline($module, /, a, b, c=None, *, d=\'\')\n"
"--\n"
"\n"
"Note: Passing more than 1 positional argument to depr_star_noinline()\n"
"is deprecated. Parameters \'b\' and \'c\' will become keyword-only\n"
"parameters in Python 3.14.\n"
"");

#define DEPR_STAR_NOINLINE_METHODDEF    \
    {"depr_star_noinline", _PyCFunction_CAST(depr_star_noinline), METH_FASTCALL|METH_KEYWORDS, depr_star_noinline__doc__},

static TyObject *
depr_star_noinline_impl(TyObject *module, TyObject *a, TyObject *b,
                        TyObject *c, const char *d, Ty_ssize_t d_length);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_noinline'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_noinline'.")
#  else
#    warning "Update the clinic input of 'depr_star_noinline'."
#  endif
#endif

static TyObject *
depr_star_noinline(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "OO|O$s#:depr_star_noinline",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    const char *d = "";
    Ty_ssize_t d_length;

    if (nargs > 1 && nargs <= 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to depr_star_noinline() "
                "is deprecated. Parameters 'b' and 'c' will become keyword-only "
                "parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &a, &b, &c, &d, &d_length)) {
        goto exit;
    }
    return_value = depr_star_noinline_impl(module, a, b, c, d, d_length);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_star_multi__doc__,
"depr_star_multi($module, /, a, b, c, d, e, f, g, *, h)\n"
"--\n"
"\n"
"Note: Passing more than 1 positional argument to depr_star_multi() is\n"
"deprecated. Parameter \'b\' will become a keyword-only parameter in\n"
"Python 3.16. Parameters \'c\' and \'d\' will become keyword-only\n"
"parameters in Python 3.15. Parameters \'e\', \'f\' and \'g\' will become\n"
"keyword-only parameters in Python 3.14.\n"
"");

#define DEPR_STAR_MULTI_METHODDEF    \
    {"depr_star_multi", _PyCFunction_CAST(depr_star_multi), METH_FASTCALL|METH_KEYWORDS, depr_star_multi__doc__},

static TyObject *
depr_star_multi_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c,
                     TyObject *d, TyObject *e, TyObject *f, TyObject *g,
                     TyObject *h);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_star_multi'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_star_multi'.")
#  else
#    warning "Update the clinic input of 'depr_star_multi'."
#  endif
#endif

static TyObject *
depr_star_multi(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 8
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), _Ty_LATIN1_CHR('f'), _Ty_LATIN1_CHR('g'), _Ty_LATIN1_CHR('h'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", "d", "e", "f", "g", "h", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_star_multi",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[8];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;
    TyObject *e;
    TyObject *f;
    TyObject *g;
    TyObject *h;

    if (nargs > 1 && nargs <= 7) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to depr_star_multi() is "
                "deprecated. Parameter 'b' will become a keyword-only parameter "
                "in Python 3.16. Parameters 'c' and 'd' will become keyword-only "
                "parameters in Python 3.15. Parameters 'e', 'f' and 'g' will "
                "become keyword-only parameters in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 7, /*maxpos*/ 7, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    e = args[4];
    f = args[5];
    g = args[6];
    h = args[7];
    return_value = depr_star_multi_impl(module, a, b, c, d, e, f, g, h);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_required_1__doc__,
"depr_kwd_required_1($module, a, /, b)\n"
"--\n"
"\n"
"Note: Passing keyword argument \'b\' to depr_kwd_required_1() is\n"
"deprecated. Parameter \'b\' will become positional-only in Python 3.14.\n"
"");

#define DEPR_KWD_REQUIRED_1_METHODDEF    \
    {"depr_kwd_required_1", _PyCFunction_CAST(depr_kwd_required_1), METH_FASTCALL|METH_KEYWORDS, depr_kwd_required_1__doc__},

static TyObject *
depr_kwd_required_1_impl(TyObject *module, TyObject *a, TyObject *b);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_required_1'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_required_1'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_required_1'."
#  endif
#endif

static TyObject *
depr_kwd_required_1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_required_1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *a;
    TyObject *b;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 2) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'b' to depr_kwd_required_1() is "
                "deprecated. Parameter 'b' will become positional-only in Python "
                "3.14.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    b = args[1];
    return_value = depr_kwd_required_1_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_required_2__doc__,
"depr_kwd_required_2($module, a, /, b, c)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\' and \'c\' to depr_kwd_required_2()\n"
"is deprecated. Parameters \'b\' and \'c\' will become positional-only in\n"
"Python 3.14.\n"
"");

#define DEPR_KWD_REQUIRED_2_METHODDEF    \
    {"depr_kwd_required_2", _PyCFunction_CAST(depr_kwd_required_2), METH_FASTCALL|METH_KEYWORDS, depr_kwd_required_2__doc__},

static TyObject *
depr_kwd_required_2_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_required_2'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_required_2'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_required_2'."
#  endif
#endif

static TyObject *
depr_kwd_required_2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_required_2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject *a;
    TyObject *b;
    TyObject *c;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to depr_kwd_required_2() "
                "is deprecated. Parameters 'b' and 'c' will become "
                "positional-only in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    b = args[1];
    c = args[2];
    return_value = depr_kwd_required_2_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_optional_1__doc__,
"depr_kwd_optional_1($module, a, /, b=None)\n"
"--\n"
"\n"
"Note: Passing keyword argument \'b\' to depr_kwd_optional_1() is\n"
"deprecated. Parameter \'b\' will become positional-only in Python 3.14.\n"
"");

#define DEPR_KWD_OPTIONAL_1_METHODDEF    \
    {"depr_kwd_optional_1", _PyCFunction_CAST(depr_kwd_optional_1), METH_FASTCALL|METH_KEYWORDS, depr_kwd_optional_1__doc__},

static TyObject *
depr_kwd_optional_1_impl(TyObject *module, TyObject *a, TyObject *b);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_optional_1'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_optional_1'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_optional_1'."
#  endif
#endif

static TyObject *
depr_kwd_optional_1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_optional_1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames) && nargs < 2 && args[1]) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'b' to depr_kwd_optional_1() is "
                "deprecated. Parameter 'b' will become positional-only in Python "
                "3.14.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    b = args[1];
skip_optional_pos:
    return_value = depr_kwd_optional_1_impl(module, a, b);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_optional_2__doc__,
"depr_kwd_optional_2($module, a, /, b=None, c=None)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\' and \'c\' to depr_kwd_optional_2()\n"
"is deprecated. Parameters \'b\' and \'c\' will become positional-only in\n"
"Python 3.14.\n"
"");

#define DEPR_KWD_OPTIONAL_2_METHODDEF    \
    {"depr_kwd_optional_2", _PyCFunction_CAST(depr_kwd_optional_2), METH_FASTCALL|METH_KEYWORDS, depr_kwd_optional_2__doc__},

static TyObject *
depr_kwd_optional_2_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_optional_2'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_optional_2'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_optional_2'."
#  endif
#endif

static TyObject *
depr_kwd_optional_2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_optional_2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *a;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames) && ((nargs < 2 && args[1]) || (nargs < 3 && args[2]))) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to depr_kwd_optional_2() "
                "is deprecated. Parameters 'b' and 'c' will become "
                "positional-only in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        b = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    c = args[2];
skip_optional_pos:
    return_value = depr_kwd_optional_2_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_optional_3__doc__,
"depr_kwd_optional_3($module, /, a=None, b=None, c=None)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'a\', \'b\' and \'c\' to\n"
"depr_kwd_optional_3() is deprecated. Parameters \'a\', \'b\' and \'c\' will\n"
"become positional-only in Python 3.14.\n"
"");

#define DEPR_KWD_OPTIONAL_3_METHODDEF    \
    {"depr_kwd_optional_3", _PyCFunction_CAST(depr_kwd_optional_3), METH_FASTCALL|METH_KEYWORDS, depr_kwd_optional_3__doc__},

static TyObject *
depr_kwd_optional_3_impl(TyObject *module, TyObject *a, TyObject *b,
                         TyObject *c);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_optional_3'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_optional_3'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_optional_3'."
#  endif
#endif

static TyObject *
depr_kwd_optional_3(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_optional_3",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *a = Ty_None;
    TyObject *b = Ty_None;
    TyObject *c = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames) && ((nargs < 1 && args[0]) || (nargs < 2 && args[1]) || (nargs < 3 && args[2]))) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'a', 'b' and 'c' to "
                "depr_kwd_optional_3() is deprecated. Parameters 'a', 'b' and 'c'"
                " will become positional-only in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        a = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        b = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    c = args[2];
skip_optional_pos:
    return_value = depr_kwd_optional_3_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_required_optional__doc__,
"depr_kwd_required_optional($module, a, /, b, c=None)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\' and \'c\' to\n"
"depr_kwd_required_optional() is deprecated. Parameters \'b\' and \'c\'\n"
"will become positional-only in Python 3.14.\n"
"");

#define DEPR_KWD_REQUIRED_OPTIONAL_METHODDEF    \
    {"depr_kwd_required_optional", _PyCFunction_CAST(depr_kwd_required_optional), METH_FASTCALL|METH_KEYWORDS, depr_kwd_required_optional__doc__},

static TyObject *
depr_kwd_required_optional_impl(TyObject *module, TyObject *a, TyObject *b,
                                TyObject *c);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_required_optional'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_required_optional'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_required_optional'."
#  endif
#endif

static TyObject *
depr_kwd_required_optional(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_required_optional",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames) && ((nargs < 2) || (nargs < 3 && args[2]))) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to "
                "depr_kwd_required_optional() is deprecated. Parameters 'b' and "
                "'c' will become positional-only in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    b = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    c = args[2];
skip_optional_pos:
    return_value = depr_kwd_required_optional_impl(module, a, b, c);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_noinline__doc__,
"depr_kwd_noinline($module, a, /, b, c=None, d=\'\')\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\' and \'c\' to depr_kwd_noinline() is\n"
"deprecated. Parameters \'b\' and \'c\' will become positional-only in\n"
"Python 3.14.\n"
"");

#define DEPR_KWD_NOINLINE_METHODDEF    \
    {"depr_kwd_noinline", _PyCFunction_CAST(depr_kwd_noinline), METH_FASTCALL|METH_KEYWORDS, depr_kwd_noinline__doc__},

static TyObject *
depr_kwd_noinline_impl(TyObject *module, TyObject *a, TyObject *b,
                       TyObject *c, const char *d, Ty_ssize_t d_length);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_noinline'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_noinline'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_noinline'."
#  endif
#endif

static TyObject *
depr_kwd_noinline(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "OO|Os#:depr_kwd_noinline",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *a;
    TyObject *b;
    TyObject *c = Ty_None;
    const char *d = "";
    Ty_ssize_t d_length;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &a, &b, &c, &d, &d_length)) {
        goto exit;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames) && ((nargs < 2) || (nargs < 3 && PySequence_Contains(kwnames, _Ty_LATIN1_CHR('c'))))) {
        if (TyErr_Occurred()) { // PySequence_Contains() above can fail
            goto exit;
        }
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to depr_kwd_noinline() is "
                "deprecated. Parameters 'b' and 'c' will become positional-only "
                "in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    return_value = depr_kwd_noinline_impl(module, a, b, c, d, d_length);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_kwd_multi__doc__,
"depr_kwd_multi($module, a, /, b, c, d, e, f, g, h)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\', \'c\', \'d\', \'e\', \'f\' and \'g\' to\n"
"depr_kwd_multi() is deprecated. Parameter \'b\' will become positional-\n"
"only in Python 3.14. Parameters \'c\' and \'d\' will become positional-\n"
"only in Python 3.15. Parameters \'e\', \'f\' and \'g\' will become\n"
"positional-only in Python 3.16.\n"
"");

#define DEPR_KWD_MULTI_METHODDEF    \
    {"depr_kwd_multi", _PyCFunction_CAST(depr_kwd_multi), METH_FASTCALL|METH_KEYWORDS, depr_kwd_multi__doc__},

static TyObject *
depr_kwd_multi_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c,
                    TyObject *d, TyObject *e, TyObject *f, TyObject *g,
                    TyObject *h);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_kwd_multi'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_kwd_multi'.")
#  else
#    warning "Update the clinic input of 'depr_kwd_multi'."
#  endif
#endif

static TyObject *
depr_kwd_multi(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), _Ty_LATIN1_CHR('f'), _Ty_LATIN1_CHR('g'), _Ty_LATIN1_CHR('h'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", "e", "f", "g", "h", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_kwd_multi",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[8];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;
    TyObject *e;
    TyObject *f;
    TyObject *g;
    TyObject *h;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 8, /*maxpos*/ 8, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 7) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b', 'c', 'd', 'e', 'f' and 'g' to "
                "depr_kwd_multi() is deprecated. Parameter 'b' will become "
                "positional-only in Python 3.14. Parameters 'c' and 'd' will "
                "become positional-only in Python 3.15. Parameters 'e', 'f' and "
                "'g' will become positional-only in Python 3.16.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    e = args[4];
    f = args[5];
    g = args[6];
    h = args[7];
    return_value = depr_kwd_multi_impl(module, a, b, c, d, e, f, g, h);

exit:
    return return_value;
}

TyDoc_STRVAR(depr_multi__doc__,
"depr_multi($module, a, /, b, c, d, e, f, *, g)\n"
"--\n"
"\n"
"Note: Passing keyword arguments \'b\' and \'c\' to depr_multi() is\n"
"deprecated. Parameter \'b\' will become positional-only in Python 3.14.\n"
"Parameter \'c\' will become positional-only in Python 3.15.\n"
"\n"
"\n"
"Note: Passing more than 4 positional arguments to depr_multi() is\n"
"deprecated. Parameter \'e\' will become a keyword-only parameter in\n"
"Python 3.15. Parameter \'f\' will become a keyword-only parameter in\n"
"Python 3.14.\n"
"");

#define DEPR_MULTI_METHODDEF    \
    {"depr_multi", _PyCFunction_CAST(depr_multi), METH_FASTCALL|METH_KEYWORDS, depr_multi__doc__},

static TyObject *
depr_multi_impl(TyObject *module, TyObject *a, TyObject *b, TyObject *c,
                TyObject *d, TyObject *e, TyObject *f, TyObject *g);

// Emit compiler warnings when we get to Python 3.14.
#if PY_VERSION_HEX >= 0x030e00C0
#  error "Update the clinic input of 'depr_multi'."
#elif PY_VERSION_HEX >= 0x030e00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of 'depr_multi'.")
#  else
#    warning "Update the clinic input of 'depr_multi'."
#  endif
#endif

static TyObject *
depr_multi(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('b'), _Ty_LATIN1_CHR('c'), _Ty_LATIN1_CHR('d'), _Ty_LATIN1_CHR('e'), _Ty_LATIN1_CHR('f'), _Ty_LATIN1_CHR('g'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "b", "c", "d", "e", "f", "g", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "depr_multi",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[7];
    TyObject *a;
    TyObject *b;
    TyObject *c;
    TyObject *d;
    TyObject *e;
    TyObject *f;
    TyObject *g;

    if (nargs > 4 && nargs <= 6) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 4 positional arguments to depr_multi() is "
                "deprecated. Parameter 'e' will become a keyword-only parameter "
                "in Python 3.15. Parameter 'f' will become a keyword-only "
                "parameter in Python 3.14.", 1))
        {
            goto exit;
        }
    }
    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 6, /*maxpos*/ 6, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'b' and 'c' to depr_multi() is "
                "deprecated. Parameter 'b' will become positional-only in Python "
                "3.14. Parameter 'c' will become positional-only in Python 3.15.", 1))
        {
            goto exit;
        }
    }
    a = args[0];
    b = args[1];
    c = args[2];
    d = args[3];
    e = args[4];
    f = args[5];
    g = args[6];
    return_value = depr_multi_impl(module, a, b, c, d, e, f, g);

exit:
    return return_value;
}
/*[clinic end generated code: output=4e60af44fd6b7b94 input=a9049054013a1b77]*/
