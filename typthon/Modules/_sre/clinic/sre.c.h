/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_sre_getcodesize__doc__,
"getcodesize($module, /)\n"
"--\n"
"\n");

#define _SRE_GETCODESIZE_METHODDEF    \
    {"getcodesize", (PyCFunction)_sre_getcodesize, METH_NOARGS, _sre_getcodesize__doc__},

static int
_sre_getcodesize_impl(TyObject *module);

static TyObject *
_sre_getcodesize(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = _sre_getcodesize_impl(module);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_ascii_iscased__doc__,
"ascii_iscased($module, character, /)\n"
"--\n"
"\n");

#define _SRE_ASCII_ISCASED_METHODDEF    \
    {"ascii_iscased", (PyCFunction)_sre_ascii_iscased, METH_O, _sre_ascii_iscased__doc__},

static int
_sre_ascii_iscased_impl(TyObject *module, int character);

static TyObject *
_sre_ascii_iscased(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int character;
    int _return_value;

    character = TyLong_AsInt(arg);
    if (character == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = _sre_ascii_iscased_impl(module, character);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_unicode_iscased__doc__,
"unicode_iscased($module, character, /)\n"
"--\n"
"\n");

#define _SRE_UNICODE_ISCASED_METHODDEF    \
    {"unicode_iscased", (PyCFunction)_sre_unicode_iscased, METH_O, _sre_unicode_iscased__doc__},

static int
_sre_unicode_iscased_impl(TyObject *module, int character);

static TyObject *
_sre_unicode_iscased(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int character;
    int _return_value;

    character = TyLong_AsInt(arg);
    if (character == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = _sre_unicode_iscased_impl(module, character);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_ascii_tolower__doc__,
"ascii_tolower($module, character, /)\n"
"--\n"
"\n");

#define _SRE_ASCII_TOLOWER_METHODDEF    \
    {"ascii_tolower", (PyCFunction)_sre_ascii_tolower, METH_O, _sre_ascii_tolower__doc__},

static int
_sre_ascii_tolower_impl(TyObject *module, int character);

static TyObject *
_sre_ascii_tolower(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int character;
    int _return_value;

    character = TyLong_AsInt(arg);
    if (character == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = _sre_ascii_tolower_impl(module, character);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_unicode_tolower__doc__,
"unicode_tolower($module, character, /)\n"
"--\n"
"\n");

#define _SRE_UNICODE_TOLOWER_METHODDEF    \
    {"unicode_tolower", (PyCFunction)_sre_unicode_tolower, METH_O, _sre_unicode_tolower__doc__},

static int
_sre_unicode_tolower_impl(TyObject *module, int character);

static TyObject *
_sre_unicode_tolower(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int character;
    int _return_value;

    character = TyLong_AsInt(arg);
    if (character == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = _sre_unicode_tolower_impl(module, character);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_match__doc__,
"match($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n"
"Matches zero or more characters at the beginning of the string.");

#define _SRE_SRE_PATTERN_MATCH_METHODDEF    \
    {"match", _PyCFunction_CAST(_sre_SRE_Pattern_match), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_match__doc__},

static TyObject *
_sre_SRE_Pattern_match_impl(PatternObject *self, TyTypeObject *cls,
                            TyObject *string, Ty_ssize_t pos,
                            Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_match(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "match",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_match_impl((PatternObject *)self, cls, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_fullmatch__doc__,
"fullmatch($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n"
"Matches against all of the string.");

#define _SRE_SRE_PATTERN_FULLMATCH_METHODDEF    \
    {"fullmatch", _PyCFunction_CAST(_sre_SRE_Pattern_fullmatch), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_fullmatch__doc__},

static TyObject *
_sre_SRE_Pattern_fullmatch_impl(PatternObject *self, TyTypeObject *cls,
                                TyObject *string, Ty_ssize_t pos,
                                Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_fullmatch(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fullmatch",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_fullmatch_impl((PatternObject *)self, cls, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_search__doc__,
"search($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n"
"Scan through string looking for a match, and return a corresponding match object instance.\n"
"\n"
"Return None if no position in the string matches.");

#define _SRE_SRE_PATTERN_SEARCH_METHODDEF    \
    {"search", _PyCFunction_CAST(_sre_SRE_Pattern_search), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_search__doc__},

static TyObject *
_sre_SRE_Pattern_search_impl(PatternObject *self, TyTypeObject *cls,
                             TyObject *string, Ty_ssize_t pos,
                             Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_search(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "search",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_search_impl((PatternObject *)self, cls, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_findall__doc__,
"findall($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n"
"Return a list of all non-overlapping matches of pattern in string.");

#define _SRE_SRE_PATTERN_FINDALL_METHODDEF    \
    {"findall", _PyCFunction_CAST(_sre_SRE_Pattern_findall), METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_findall__doc__},

static TyObject *
_sre_SRE_Pattern_findall_impl(PatternObject *self, TyObject *string,
                              Ty_ssize_t pos, Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_findall(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "findall",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_findall_impl((PatternObject *)self, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_finditer__doc__,
"finditer($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n"
"Return an iterator over all non-overlapping matches for the RE pattern in string.\n"
"\n"
"For each match, the iterator returns a match object.");

#define _SRE_SRE_PATTERN_FINDITER_METHODDEF    \
    {"finditer", _PyCFunction_CAST(_sre_SRE_Pattern_finditer), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_finditer__doc__},

static TyObject *
_sre_SRE_Pattern_finditer_impl(PatternObject *self, TyTypeObject *cls,
                               TyObject *string, Ty_ssize_t pos,
                               Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_finditer(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "finditer",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_finditer_impl((PatternObject *)self, cls, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_scanner__doc__,
"scanner($self, /, string, pos=0, endpos=sys.maxsize)\n"
"--\n"
"\n");

#define _SRE_SRE_PATTERN_SCANNER_METHODDEF    \
    {"scanner", _PyCFunction_CAST(_sre_SRE_Pattern_scanner), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_scanner__doc__},

static TyObject *
_sre_SRE_Pattern_scanner_impl(PatternObject *self, TyTypeObject *cls,
                              TyObject *string, Ty_ssize_t pos,
                              Ty_ssize_t endpos);

static TyObject *
_sre_SRE_Pattern_scanner(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(pos), &_Ty_ID(endpos), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "pos", "endpos", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "scanner",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t pos = 0;
    Ty_ssize_t endpos = PY_SSIZE_T_MAX;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[1]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            pos = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        endpos = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_scanner_impl((PatternObject *)self, cls, string, pos, endpos);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_split__doc__,
"split($self, /, string, maxsplit=0)\n"
"--\n"
"\n"
"Split string by the occurrences of pattern.");

#define _SRE_SRE_PATTERN_SPLIT_METHODDEF    \
    {"split", _PyCFunction_CAST(_sre_SRE_Pattern_split), METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_split__doc__},

static TyObject *
_sre_SRE_Pattern_split_impl(PatternObject *self, TyObject *string,
                            Ty_ssize_t maxsplit);

static TyObject *
_sre_SRE_Pattern_split(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(string), &_Ty_ID(maxsplit), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"string", "maxsplit", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "split",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *string;
    Ty_ssize_t maxsplit = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    string = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        maxsplit = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_split_impl((PatternObject *)self, string, maxsplit);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_sub__doc__,
"sub($self, /, repl, string, count=0)\n"
"--\n"
"\n"
"Return the string obtained by replacing the leftmost non-overlapping occurrences of pattern in string by the replacement repl.");

#define _SRE_SRE_PATTERN_SUB_METHODDEF    \
    {"sub", _PyCFunction_CAST(_sre_SRE_Pattern_sub), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_sub__doc__},

static TyObject *
_sre_SRE_Pattern_sub_impl(PatternObject *self, TyTypeObject *cls,
                          TyObject *repl, TyObject *string, Ty_ssize_t count);

static TyObject *
_sre_SRE_Pattern_sub(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(repl), &_Ty_ID(string), &_Ty_ID(count), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"repl", "string", "count", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sub",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *repl;
    TyObject *string;
    Ty_ssize_t count = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    repl = args[0];
    string = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_sub_impl((PatternObject *)self, cls, repl, string, count);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern_subn__doc__,
"subn($self, /, repl, string, count=0)\n"
"--\n"
"\n"
"Return the tuple (new_string, number_of_subs_made) found by replacing the leftmost non-overlapping occurrences of pattern with the replacement repl.");

#define _SRE_SRE_PATTERN_SUBN_METHODDEF    \
    {"subn", _PyCFunction_CAST(_sre_SRE_Pattern_subn), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Pattern_subn__doc__},

static TyObject *
_sre_SRE_Pattern_subn_impl(PatternObject *self, TyTypeObject *cls,
                           TyObject *repl, TyObject *string,
                           Ty_ssize_t count);

static TyObject *
_sre_SRE_Pattern_subn(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(repl), &_Ty_ID(string), &_Ty_ID(count), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"repl", "string", "count", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "subn",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *repl;
    TyObject *string;
    Ty_ssize_t count = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    repl = args[0];
    string = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
skip_optional_pos:
    return_value = _sre_SRE_Pattern_subn_impl((PatternObject *)self, cls, repl, string, count);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Pattern___copy____doc__,
"__copy__($self, /)\n"
"--\n"
"\n");

#define _SRE_SRE_PATTERN___COPY___METHODDEF    \
    {"__copy__", (PyCFunction)_sre_SRE_Pattern___copy__, METH_NOARGS, _sre_SRE_Pattern___copy____doc__},

static TyObject *
_sre_SRE_Pattern___copy___impl(PatternObject *self);

static TyObject *
_sre_SRE_Pattern___copy__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _sre_SRE_Pattern___copy___impl((PatternObject *)self);
}

TyDoc_STRVAR(_sre_SRE_Pattern___deepcopy____doc__,
"__deepcopy__($self, memo, /)\n"
"--\n"
"\n");

#define _SRE_SRE_PATTERN___DEEPCOPY___METHODDEF    \
    {"__deepcopy__", (PyCFunction)_sre_SRE_Pattern___deepcopy__, METH_O, _sre_SRE_Pattern___deepcopy____doc__},

static TyObject *
_sre_SRE_Pattern___deepcopy___impl(PatternObject *self, TyObject *memo);

static TyObject *
_sre_SRE_Pattern___deepcopy__(TyObject *self, TyObject *memo)
{
    TyObject *return_value = NULL;

    return_value = _sre_SRE_Pattern___deepcopy___impl((PatternObject *)self, memo);

    return return_value;
}

#if defined(Ty_DEBUG)

TyDoc_STRVAR(_sre_SRE_Pattern__fail_after__doc__,
"_fail_after($self, count, exception, /)\n"
"--\n"
"\n"
"For debugging.");

#define _SRE_SRE_PATTERN__FAIL_AFTER_METHODDEF    \
    {"_fail_after", _PyCFunction_CAST(_sre_SRE_Pattern__fail_after), METH_FASTCALL, _sre_SRE_Pattern__fail_after__doc__},

static TyObject *
_sre_SRE_Pattern__fail_after_impl(PatternObject *self, int count,
                                  TyObject *exception);

static TyObject *
_sre_SRE_Pattern__fail_after(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int count;
    TyObject *exception;

    if (!_TyArg_CheckPositional("_fail_after", nargs, 2, 2)) {
        goto exit;
    }
    count = TyLong_AsInt(args[0]);
    if (count == -1 && TyErr_Occurred()) {
        goto exit;
    }
    exception = args[1];
    return_value = _sre_SRE_Pattern__fail_after_impl((PatternObject *)self, count, exception);

exit:
    return return_value;
}

#endif /* defined(Ty_DEBUG) */

TyDoc_STRVAR(_sre_compile__doc__,
"compile($module, /, pattern, flags, code, groups, groupindex,\n"
"        indexgroup)\n"
"--\n"
"\n");

#define _SRE_COMPILE_METHODDEF    \
    {"compile", _PyCFunction_CAST(_sre_compile), METH_FASTCALL|METH_KEYWORDS, _sre_compile__doc__},

static TyObject *
_sre_compile_impl(TyObject *module, TyObject *pattern, int flags,
                  TyObject *code, Ty_ssize_t groups, TyObject *groupindex,
                  TyObject *indexgroup);

static TyObject *
_sre_compile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(pattern), &_Ty_ID(flags), &_Ty_ID(code), &_Ty_ID(groups), &_Ty_ID(groupindex), &_Ty_ID(indexgroup), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pattern", "flags", "code", "groups", "groupindex", "indexgroup", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "compile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    TyObject *pattern;
    int flags;
    TyObject *code;
    Ty_ssize_t groups;
    TyObject *groupindex;
    TyObject *indexgroup;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 6, /*maxpos*/ 6, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    pattern = args[0];
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyList_Check(args[2])) {
        _TyArg_BadArgument("compile", "argument 'code'", "list", args[2]);
        goto exit;
    }
    code = args[2];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[3]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        groups = ival;
    }
    if (!TyDict_Check(args[4])) {
        _TyArg_BadArgument("compile", "argument 'groupindex'", "dict", args[4]);
        goto exit;
    }
    groupindex = args[4];
    if (!TyTuple_Check(args[5])) {
        _TyArg_BadArgument("compile", "argument 'indexgroup'", "tuple", args[5]);
        goto exit;
    }
    indexgroup = args[5];
    return_value = _sre_compile_impl(module, pattern, flags, code, groups, groupindex, indexgroup);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_template__doc__,
"template($module, pattern, template, /)\n"
"--\n"
"\n"
"\n"
"\n"
"  template\n"
"    A list containing interleaved literal strings (str or bytes) and group\n"
"    indices (int), as returned by re._parser.parse_template():\n"
"        [literal1, group1, ..., literalN, groupN]");

#define _SRE_TEMPLATE_METHODDEF    \
    {"template", _PyCFunction_CAST(_sre_template), METH_FASTCALL, _sre_template__doc__},

static TyObject *
_sre_template_impl(TyObject *module, TyObject *pattern, TyObject *template);

static TyObject *
_sre_template(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *pattern;
    TyObject *template;

    if (!_TyArg_CheckPositional("template", nargs, 2, 2)) {
        goto exit;
    }
    pattern = args[0];
    if (!TyList_Check(args[1])) {
        _TyArg_BadArgument("template", "argument 2", "list", args[1]);
        goto exit;
    }
    template = args[1];
    return_value = _sre_template_impl(module, pattern, template);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_expand__doc__,
"expand($self, /, template)\n"
"--\n"
"\n"
"Return the string obtained by doing backslash substitution on the string template, as done by the sub() method.");

#define _SRE_SRE_MATCH_EXPAND_METHODDEF    \
    {"expand", _PyCFunction_CAST(_sre_SRE_Match_expand), METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Match_expand__doc__},

static TyObject *
_sre_SRE_Match_expand_impl(MatchObject *self, TyObject *template);

static TyObject *
_sre_SRE_Match_expand(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(template), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"template", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "expand",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *template;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    template = args[0];
    return_value = _sre_SRE_Match_expand_impl((MatchObject *)self, template);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_groups__doc__,
"groups($self, /, default=None)\n"
"--\n"
"\n"
"Return a tuple containing all the subgroups of the match, from 1.\n"
"\n"
"  default\n"
"    Is used for groups that did not participate in the match.");

#define _SRE_SRE_MATCH_GROUPS_METHODDEF    \
    {"groups", _PyCFunction_CAST(_sre_SRE_Match_groups), METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Match_groups__doc__},

static TyObject *
_sre_SRE_Match_groups_impl(MatchObject *self, TyObject *default_value);

static TyObject *
_sre_SRE_Match_groups(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "groups",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *default_value = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    default_value = args[0];
skip_optional_pos:
    return_value = _sre_SRE_Match_groups_impl((MatchObject *)self, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_groupdict__doc__,
"groupdict($self, /, default=None)\n"
"--\n"
"\n"
"Return a dictionary containing all the named subgroups of the match, keyed by the subgroup name.\n"
"\n"
"  default\n"
"    Is used for groups that did not participate in the match.");

#define _SRE_SRE_MATCH_GROUPDICT_METHODDEF    \
    {"groupdict", _PyCFunction_CAST(_sre_SRE_Match_groupdict), METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Match_groupdict__doc__},

static TyObject *
_sre_SRE_Match_groupdict_impl(MatchObject *self, TyObject *default_value);

static TyObject *
_sre_SRE_Match_groupdict(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "groupdict",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *default_value = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    default_value = args[0];
skip_optional_pos:
    return_value = _sre_SRE_Match_groupdict_impl((MatchObject *)self, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_start__doc__,
"start($self, group=0, /)\n"
"--\n"
"\n"
"Return index of the start of the substring matched by group.");

#define _SRE_SRE_MATCH_START_METHODDEF    \
    {"start", _PyCFunction_CAST(_sre_SRE_Match_start), METH_FASTCALL, _sre_SRE_Match_start__doc__},

static Ty_ssize_t
_sre_SRE_Match_start_impl(MatchObject *self, TyObject *group);

static TyObject *
_sre_SRE_Match_start(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *group = NULL;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("start", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    group = args[0];
skip_optional:
    _return_value = _sre_SRE_Match_start_impl((MatchObject *)self, group);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_end__doc__,
"end($self, group=0, /)\n"
"--\n"
"\n"
"Return index of the end of the substring matched by group.");

#define _SRE_SRE_MATCH_END_METHODDEF    \
    {"end", _PyCFunction_CAST(_sre_SRE_Match_end), METH_FASTCALL, _sre_SRE_Match_end__doc__},

static Ty_ssize_t
_sre_SRE_Match_end_impl(MatchObject *self, TyObject *group);

static TyObject *
_sre_SRE_Match_end(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *group = NULL;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("end", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    group = args[0];
skip_optional:
    _return_value = _sre_SRE_Match_end_impl((MatchObject *)self, group);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match_span__doc__,
"span($self, group=0, /)\n"
"--\n"
"\n"
"For match object m, return the 2-tuple (m.start(group), m.end(group)).");

#define _SRE_SRE_MATCH_SPAN_METHODDEF    \
    {"span", _PyCFunction_CAST(_sre_SRE_Match_span), METH_FASTCALL, _sre_SRE_Match_span__doc__},

static TyObject *
_sre_SRE_Match_span_impl(MatchObject *self, TyObject *group);

static TyObject *
_sre_SRE_Match_span(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *group = NULL;

    if (!_TyArg_CheckPositional("span", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    group = args[0];
skip_optional:
    return_value = _sre_SRE_Match_span_impl((MatchObject *)self, group);

exit:
    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Match___copy____doc__,
"__copy__($self, /)\n"
"--\n"
"\n");

#define _SRE_SRE_MATCH___COPY___METHODDEF    \
    {"__copy__", (PyCFunction)_sre_SRE_Match___copy__, METH_NOARGS, _sre_SRE_Match___copy____doc__},

static TyObject *
_sre_SRE_Match___copy___impl(MatchObject *self);

static TyObject *
_sre_SRE_Match___copy__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _sre_SRE_Match___copy___impl((MatchObject *)self);
}

TyDoc_STRVAR(_sre_SRE_Match___deepcopy____doc__,
"__deepcopy__($self, memo, /)\n"
"--\n"
"\n");

#define _SRE_SRE_MATCH___DEEPCOPY___METHODDEF    \
    {"__deepcopy__", (PyCFunction)_sre_SRE_Match___deepcopy__, METH_O, _sre_SRE_Match___deepcopy____doc__},

static TyObject *
_sre_SRE_Match___deepcopy___impl(MatchObject *self, TyObject *memo);

static TyObject *
_sre_SRE_Match___deepcopy__(TyObject *self, TyObject *memo)
{
    TyObject *return_value = NULL;

    return_value = _sre_SRE_Match___deepcopy___impl((MatchObject *)self, memo);

    return return_value;
}

TyDoc_STRVAR(_sre_SRE_Scanner_match__doc__,
"match($self, /)\n"
"--\n"
"\n");

#define _SRE_SRE_SCANNER_MATCH_METHODDEF    \
    {"match", _PyCFunction_CAST(_sre_SRE_Scanner_match), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Scanner_match__doc__},

static TyObject *
_sre_SRE_Scanner_match_impl(ScannerObject *self, TyTypeObject *cls);

static TyObject *
_sre_SRE_Scanner_match(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "match() takes no arguments");
        return NULL;
    }
    return _sre_SRE_Scanner_match_impl((ScannerObject *)self, cls);
}

TyDoc_STRVAR(_sre_SRE_Scanner_search__doc__,
"search($self, /)\n"
"--\n"
"\n");

#define _SRE_SRE_SCANNER_SEARCH_METHODDEF    \
    {"search", _PyCFunction_CAST(_sre_SRE_Scanner_search), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _sre_SRE_Scanner_search__doc__},

static TyObject *
_sre_SRE_Scanner_search_impl(ScannerObject *self, TyTypeObject *cls);

static TyObject *
_sre_SRE_Scanner_search(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "search() takes no arguments");
        return NULL;
    }
    return _sre_SRE_Scanner_search_impl((ScannerObject *)self, cls);
}

#ifndef _SRE_SRE_PATTERN__FAIL_AFTER_METHODDEF
    #define _SRE_SRE_PATTERN__FAIL_AFTER_METHODDEF
#endif /* !defined(_SRE_SRE_PATTERN__FAIL_AFTER_METHODDEF) */
/*[clinic end generated code: output=bbf42e1de3bdd3ae input=a9049054013a1b77]*/
