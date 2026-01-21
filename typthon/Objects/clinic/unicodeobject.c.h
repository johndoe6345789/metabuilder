/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(EncodingMap_size__doc__,
"size($self, /)\n"
"--\n"
"\n"
"Return the size (in bytes) of this object.");

#define ENCODINGMAP_SIZE_METHODDEF    \
    {"size", (PyCFunction)EncodingMap_size, METH_NOARGS, EncodingMap_size__doc__},

static TyObject *
EncodingMap_size_impl(struct encoding_map *self);

static TyObject *
EncodingMap_size(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return EncodingMap_size_impl((struct encoding_map *)self);
}

TyDoc_STRVAR(unicode_title__doc__,
"title($self, /)\n"
"--\n"
"\n"
"Return a version of the string where each word is titlecased.\n"
"\n"
"More specifically, words start with uppercased characters and all remaining\n"
"cased characters have lower case.");

#define UNICODE_TITLE_METHODDEF    \
    {"title", (PyCFunction)unicode_title, METH_NOARGS, unicode_title__doc__},

static TyObject *
unicode_title_impl(TyObject *self);

static TyObject *
unicode_title(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_title_impl(self);
}

TyDoc_STRVAR(unicode_capitalize__doc__,
"capitalize($self, /)\n"
"--\n"
"\n"
"Return a capitalized version of the string.\n"
"\n"
"More specifically, make the first character have upper case and the rest lower\n"
"case.");

#define UNICODE_CAPITALIZE_METHODDEF    \
    {"capitalize", (PyCFunction)unicode_capitalize, METH_NOARGS, unicode_capitalize__doc__},

static TyObject *
unicode_capitalize_impl(TyObject *self);

static TyObject *
unicode_capitalize(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_capitalize_impl(self);
}

TyDoc_STRVAR(unicode_casefold__doc__,
"casefold($self, /)\n"
"--\n"
"\n"
"Return a version of the string suitable for caseless comparisons.");

#define UNICODE_CASEFOLD_METHODDEF    \
    {"casefold", (PyCFunction)unicode_casefold, METH_NOARGS, unicode_casefold__doc__},

static TyObject *
unicode_casefold_impl(TyObject *self);

static TyObject *
unicode_casefold(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_casefold_impl(self);
}

TyDoc_STRVAR(unicode_center__doc__,
"center($self, width, fillchar=\' \', /)\n"
"--\n"
"\n"
"Return a centered string of length width.\n"
"\n"
"Padding is done using the specified fill character (default is a space).");

#define UNICODE_CENTER_METHODDEF    \
    {"center", _PyCFunction_CAST(unicode_center), METH_FASTCALL, unicode_center__doc__},

static TyObject *
unicode_center_impl(TyObject *self, Ty_ssize_t width, Ty_UCS4 fillchar);

static TyObject *
unicode_center(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    Ty_UCS4 fillchar = ' ';

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
    if (!convert_uc(args[1], &fillchar)) {
        goto exit;
    }
skip_optional:
    return_value = unicode_center_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_count__doc__,
"count($self, sub[, start[, end]], /)\n"
"--\n"
"\n"
"Return the number of non-overlapping occurrences of substring sub in string S[start:end].\n"
"\n"
"Optional arguments start and end are interpreted as in slice notation.");

#define UNICODE_COUNT_METHODDEF    \
    {"count", _PyCFunction_CAST(unicode_count), METH_FASTCALL, unicode_count__doc__},

static Ty_ssize_t
unicode_count_impl(TyObject *str, TyObject *substr, Ty_ssize_t start,
                   Ty_ssize_t end);

static TyObject *
unicode_count(TyObject *str, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *substr;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("count", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("count", "argument 1", "str", args[0]);
        goto exit;
    }
    substr = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    _return_value = unicode_count_impl(str, substr, start, end);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_encode__doc__,
"encode($self, /, encoding=\'utf-8\', errors=\'strict\')\n"
"--\n"
"\n"
"Encode the string using the codec registered for encoding.\n"
"\n"
"  encoding\n"
"    The encoding in which to encode the string.\n"
"  errors\n"
"    The error handling scheme to use for encoding errors.\n"
"    The default is \'strict\' meaning that encoding errors raise a\n"
"    UnicodeEncodeError.  Other possible values are \'ignore\', \'replace\' and\n"
"    \'xmlcharrefreplace\' as well as any other name registered with\n"
"    codecs.register_error that can handle UnicodeEncodeErrors.");

#define UNICODE_ENCODE_METHODDEF    \
    {"encode", _PyCFunction_CAST(unicode_encode), METH_FASTCALL|METH_KEYWORDS, unicode_encode__doc__},

static TyObject *
unicode_encode_impl(TyObject *self, const char *encoding, const char *errors);

static TyObject *
unicode_encode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(encoding), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"encoding", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "encode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    const char *encoding = NULL;
    const char *errors = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        if (!TyUnicode_Check(args[0])) {
            _TyArg_BadArgument("encode", "argument 'encoding'", "str", args[0]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(args[0], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("encode", "argument 'errors'", "str", args[1]);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(args[1], &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_pos:
    return_value = unicode_encode_impl(self, encoding, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_expandtabs__doc__,
"expandtabs($self, /, tabsize=8)\n"
"--\n"
"\n"
"Return a copy where all tab characters are expanded using spaces.\n"
"\n"
"If tabsize is not given, a tab size of 8 characters is assumed.");

#define UNICODE_EXPANDTABS_METHODDEF    \
    {"expandtabs", _PyCFunction_CAST(unicode_expandtabs), METH_FASTCALL|METH_KEYWORDS, unicode_expandtabs__doc__},

static TyObject *
unicode_expandtabs_impl(TyObject *self, int tabsize);

static TyObject *
unicode_expandtabs(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    return_value = unicode_expandtabs_impl(self, tabsize);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_find__doc__,
"find($self, sub[, start[, end]], /)\n"
"--\n"
"\n"
"Return the lowest index in S where substring sub is found, such that sub is contained within S[start:end].\n"
"\n"
"Optional arguments start and end are interpreted as in slice notation.\n"
"Return -1 on failure.");

#define UNICODE_FIND_METHODDEF    \
    {"find", _PyCFunction_CAST(unicode_find), METH_FASTCALL, unicode_find__doc__},

static Ty_ssize_t
unicode_find_impl(TyObject *str, TyObject *substr, Ty_ssize_t start,
                  Ty_ssize_t end);

static TyObject *
unicode_find(TyObject *str, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *substr;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("find", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("find", "argument 1", "str", args[0]);
        goto exit;
    }
    substr = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    _return_value = unicode_find_impl(str, substr, start, end);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_index__doc__,
"index($self, sub[, start[, end]], /)\n"
"--\n"
"\n"
"Return the lowest index in S where substring sub is found, such that sub is contained within S[start:end].\n"
"\n"
"Optional arguments start and end are interpreted as in slice notation.\n"
"Raises ValueError when the substring is not found.");

#define UNICODE_INDEX_METHODDEF    \
    {"index", _PyCFunction_CAST(unicode_index), METH_FASTCALL, unicode_index__doc__},

static Ty_ssize_t
unicode_index_impl(TyObject *str, TyObject *substr, Ty_ssize_t start,
                   Ty_ssize_t end);

static TyObject *
unicode_index(TyObject *str, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *substr;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("index", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("index", "argument 1", "str", args[0]);
        goto exit;
    }
    substr = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    _return_value = unicode_index_impl(str, substr, start, end);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_isascii__doc__,
"isascii($self, /)\n"
"--\n"
"\n"
"Return True if all characters in the string are ASCII, False otherwise.\n"
"\n"
"ASCII characters have code points in the range U+0000-U+007F.\n"
"Empty string is ASCII too.");

#define UNICODE_ISASCII_METHODDEF    \
    {"isascii", (PyCFunction)unicode_isascii, METH_NOARGS, unicode_isascii__doc__},

static TyObject *
unicode_isascii_impl(TyObject *self);

static TyObject *
unicode_isascii(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isascii_impl(self);
}

TyDoc_STRVAR(unicode_islower__doc__,
"islower($self, /)\n"
"--\n"
"\n"
"Return True if the string is a lowercase string, False otherwise.\n"
"\n"
"A string is lowercase if all cased characters in the string are lowercase and\n"
"there is at least one cased character in the string.");

#define UNICODE_ISLOWER_METHODDEF    \
    {"islower", (PyCFunction)unicode_islower, METH_NOARGS, unicode_islower__doc__},

static TyObject *
unicode_islower_impl(TyObject *self);

static TyObject *
unicode_islower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_islower_impl(self);
}

TyDoc_STRVAR(unicode_isupper__doc__,
"isupper($self, /)\n"
"--\n"
"\n"
"Return True if the string is an uppercase string, False otherwise.\n"
"\n"
"A string is uppercase if all cased characters in the string are uppercase and\n"
"there is at least one cased character in the string.");

#define UNICODE_ISUPPER_METHODDEF    \
    {"isupper", (PyCFunction)unicode_isupper, METH_NOARGS, unicode_isupper__doc__},

static TyObject *
unicode_isupper_impl(TyObject *self);

static TyObject *
unicode_isupper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isupper_impl(self);
}

TyDoc_STRVAR(unicode_istitle__doc__,
"istitle($self, /)\n"
"--\n"
"\n"
"Return True if the string is a title-cased string, False otherwise.\n"
"\n"
"In a title-cased string, upper- and title-case characters may only\n"
"follow uncased characters and lowercase characters only cased ones.");

#define UNICODE_ISTITLE_METHODDEF    \
    {"istitle", (PyCFunction)unicode_istitle, METH_NOARGS, unicode_istitle__doc__},

static TyObject *
unicode_istitle_impl(TyObject *self);

static TyObject *
unicode_istitle(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_istitle_impl(self);
}

TyDoc_STRVAR(unicode_isspace__doc__,
"isspace($self, /)\n"
"--\n"
"\n"
"Return True if the string is a whitespace string, False otherwise.\n"
"\n"
"A string is whitespace if all characters in the string are whitespace and there\n"
"is at least one character in the string.");

#define UNICODE_ISSPACE_METHODDEF    \
    {"isspace", (PyCFunction)unicode_isspace, METH_NOARGS, unicode_isspace__doc__},

static TyObject *
unicode_isspace_impl(TyObject *self);

static TyObject *
unicode_isspace(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isspace_impl(self);
}

TyDoc_STRVAR(unicode_isalpha__doc__,
"isalpha($self, /)\n"
"--\n"
"\n"
"Return True if the string is an alphabetic string, False otherwise.\n"
"\n"
"A string is alphabetic if all characters in the string are alphabetic and there\n"
"is at least one character in the string.");

#define UNICODE_ISALPHA_METHODDEF    \
    {"isalpha", (PyCFunction)unicode_isalpha, METH_NOARGS, unicode_isalpha__doc__},

static TyObject *
unicode_isalpha_impl(TyObject *self);

static TyObject *
unicode_isalpha(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isalpha_impl(self);
}

TyDoc_STRVAR(unicode_isalnum__doc__,
"isalnum($self, /)\n"
"--\n"
"\n"
"Return True if the string is an alpha-numeric string, False otherwise.\n"
"\n"
"A string is alpha-numeric if all characters in the string are alpha-numeric and\n"
"there is at least one character in the string.");

#define UNICODE_ISALNUM_METHODDEF    \
    {"isalnum", (PyCFunction)unicode_isalnum, METH_NOARGS, unicode_isalnum__doc__},

static TyObject *
unicode_isalnum_impl(TyObject *self);

static TyObject *
unicode_isalnum(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isalnum_impl(self);
}

TyDoc_STRVAR(unicode_isdecimal__doc__,
"isdecimal($self, /)\n"
"--\n"
"\n"
"Return True if the string is a decimal string, False otherwise.\n"
"\n"
"A string is a decimal string if all characters in the string are decimal and\n"
"there is at least one character in the string.");

#define UNICODE_ISDECIMAL_METHODDEF    \
    {"isdecimal", (PyCFunction)unicode_isdecimal, METH_NOARGS, unicode_isdecimal__doc__},

static TyObject *
unicode_isdecimal_impl(TyObject *self);

static TyObject *
unicode_isdecimal(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isdecimal_impl(self);
}

TyDoc_STRVAR(unicode_isdigit__doc__,
"isdigit($self, /)\n"
"--\n"
"\n"
"Return True if the string is a digit string, False otherwise.\n"
"\n"
"A string is a digit string if all characters in the string are digits and there\n"
"is at least one character in the string.");

#define UNICODE_ISDIGIT_METHODDEF    \
    {"isdigit", (PyCFunction)unicode_isdigit, METH_NOARGS, unicode_isdigit__doc__},

static TyObject *
unicode_isdigit_impl(TyObject *self);

static TyObject *
unicode_isdigit(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isdigit_impl(self);
}

TyDoc_STRVAR(unicode_isnumeric__doc__,
"isnumeric($self, /)\n"
"--\n"
"\n"
"Return True if the string is a numeric string, False otherwise.\n"
"\n"
"A string is numeric if all characters in the string are numeric and there is at\n"
"least one character in the string.");

#define UNICODE_ISNUMERIC_METHODDEF    \
    {"isnumeric", (PyCFunction)unicode_isnumeric, METH_NOARGS, unicode_isnumeric__doc__},

static TyObject *
unicode_isnumeric_impl(TyObject *self);

static TyObject *
unicode_isnumeric(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isnumeric_impl(self);
}

TyDoc_STRVAR(unicode_isidentifier__doc__,
"isidentifier($self, /)\n"
"--\n"
"\n"
"Return True if the string is a valid Python identifier, False otherwise.\n"
"\n"
"Call keyword.iskeyword(s) to test whether string s is a reserved identifier,\n"
"such as \"def\" or \"class\".");

#define UNICODE_ISIDENTIFIER_METHODDEF    \
    {"isidentifier", (PyCFunction)unicode_isidentifier, METH_NOARGS, unicode_isidentifier__doc__},

static TyObject *
unicode_isidentifier_impl(TyObject *self);

static TyObject *
unicode_isidentifier(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isidentifier_impl(self);
}

TyDoc_STRVAR(unicode_isprintable__doc__,
"isprintable($self, /)\n"
"--\n"
"\n"
"Return True if all characters in the string are printable, False otherwise.\n"
"\n"
"A character is printable if repr() may use it in its output.");

#define UNICODE_ISPRINTABLE_METHODDEF    \
    {"isprintable", (PyCFunction)unicode_isprintable, METH_NOARGS, unicode_isprintable__doc__},

static TyObject *
unicode_isprintable_impl(TyObject *self);

static TyObject *
unicode_isprintable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_isprintable_impl(self);
}

TyDoc_STRVAR(unicode_join__doc__,
"join($self, iterable, /)\n"
"--\n"
"\n"
"Concatenate any number of strings.\n"
"\n"
"The string whose method is called is inserted in between each given string.\n"
"The result is returned as a new string.\n"
"\n"
"Example: \'.\'.join([\'ab\', \'pq\', \'rs\']) -> \'ab.pq.rs\'");

#define UNICODE_JOIN_METHODDEF    \
    {"join", (PyCFunction)unicode_join, METH_O, unicode_join__doc__},

TyDoc_STRVAR(unicode_ljust__doc__,
"ljust($self, width, fillchar=\' \', /)\n"
"--\n"
"\n"
"Return a left-justified string of length width.\n"
"\n"
"Padding is done using the specified fill character (default is a space).");

#define UNICODE_LJUST_METHODDEF    \
    {"ljust", _PyCFunction_CAST(unicode_ljust), METH_FASTCALL, unicode_ljust__doc__},

static TyObject *
unicode_ljust_impl(TyObject *self, Ty_ssize_t width, Ty_UCS4 fillchar);

static TyObject *
unicode_ljust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    Ty_UCS4 fillchar = ' ';

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
    if (!convert_uc(args[1], &fillchar)) {
        goto exit;
    }
skip_optional:
    return_value = unicode_ljust_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_lower__doc__,
"lower($self, /)\n"
"--\n"
"\n"
"Return a copy of the string converted to lowercase.");

#define UNICODE_LOWER_METHODDEF    \
    {"lower", (PyCFunction)unicode_lower, METH_NOARGS, unicode_lower__doc__},

static TyObject *
unicode_lower_impl(TyObject *self);

static TyObject *
unicode_lower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_lower_impl(self);
}

TyDoc_STRVAR(unicode_strip__doc__,
"strip($self, chars=None, /)\n"
"--\n"
"\n"
"Return a copy of the string with leading and trailing whitespace removed.\n"
"\n"
"If chars is given and not None, remove characters in chars instead.");

#define UNICODE_STRIP_METHODDEF    \
    {"strip", _PyCFunction_CAST(unicode_strip), METH_FASTCALL, unicode_strip__doc__},

static TyObject *
unicode_strip_impl(TyObject *self, TyObject *chars);

static TyObject *
unicode_strip(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *chars = Ty_None;

    if (!_TyArg_CheckPositional("strip", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    chars = args[0];
skip_optional:
    return_value = unicode_strip_impl(self, chars);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_lstrip__doc__,
"lstrip($self, chars=None, /)\n"
"--\n"
"\n"
"Return a copy of the string with leading whitespace removed.\n"
"\n"
"If chars is given and not None, remove characters in chars instead.");

#define UNICODE_LSTRIP_METHODDEF    \
    {"lstrip", _PyCFunction_CAST(unicode_lstrip), METH_FASTCALL, unicode_lstrip__doc__},

static TyObject *
unicode_lstrip_impl(TyObject *self, TyObject *chars);

static TyObject *
unicode_lstrip(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *chars = Ty_None;

    if (!_TyArg_CheckPositional("lstrip", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    chars = args[0];
skip_optional:
    return_value = unicode_lstrip_impl(self, chars);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_rstrip__doc__,
"rstrip($self, chars=None, /)\n"
"--\n"
"\n"
"Return a copy of the string with trailing whitespace removed.\n"
"\n"
"If chars is given and not None, remove characters in chars instead.");

#define UNICODE_RSTRIP_METHODDEF    \
    {"rstrip", _PyCFunction_CAST(unicode_rstrip), METH_FASTCALL, unicode_rstrip__doc__},

static TyObject *
unicode_rstrip_impl(TyObject *self, TyObject *chars);

static TyObject *
unicode_rstrip(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *chars = Ty_None;

    if (!_TyArg_CheckPositional("rstrip", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    chars = args[0];
skip_optional:
    return_value = unicode_rstrip_impl(self, chars);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_replace__doc__,
"replace($self, old, new, /, count=-1)\n"
"--\n"
"\n"
"Return a copy with all occurrences of substring old replaced by new.\n"
"\n"
"  count\n"
"    Maximum number of occurrences to replace.\n"
"    -1 (the default value) means replace all occurrences.\n"
"\n"
"If the optional argument count is given, only the first count occurrences are\n"
"replaced.");

#define UNICODE_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(unicode_replace), METH_FASTCALL|METH_KEYWORDS, unicode_replace__doc__},

static TyObject *
unicode_replace_impl(TyObject *self, TyObject *old, TyObject *new,
                     Ty_ssize_t count);

static TyObject *
unicode_replace(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(count), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "count", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *old;
    TyObject *new;
    Ty_ssize_t count = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("replace", "argument 1", "str", args[0]);
        goto exit;
    }
    old = args[0];
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("replace", "argument 2", "str", args[1]);
        goto exit;
    }
    new = args[1];
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
    return_value = unicode_replace_impl(self, old, new, count);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_removeprefix__doc__,
"removeprefix($self, prefix, /)\n"
"--\n"
"\n"
"Return a str with the given prefix string removed if present.\n"
"\n"
"If the string starts with the prefix string, return string[len(prefix):].\n"
"Otherwise, return a copy of the original string.");

#define UNICODE_REMOVEPREFIX_METHODDEF    \
    {"removeprefix", (PyCFunction)unicode_removeprefix, METH_O, unicode_removeprefix__doc__},

static TyObject *
unicode_removeprefix_impl(TyObject *self, TyObject *prefix);

static TyObject *
unicode_removeprefix(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *prefix;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("removeprefix", "argument", "str", arg);
        goto exit;
    }
    prefix = arg;
    return_value = unicode_removeprefix_impl(self, prefix);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_removesuffix__doc__,
"removesuffix($self, suffix, /)\n"
"--\n"
"\n"
"Return a str with the given suffix string removed if present.\n"
"\n"
"If the string ends with the suffix string and that suffix is not empty,\n"
"return string[:-len(suffix)]. Otherwise, return a copy of the original\n"
"string.");

#define UNICODE_REMOVESUFFIX_METHODDEF    \
    {"removesuffix", (PyCFunction)unicode_removesuffix, METH_O, unicode_removesuffix__doc__},

static TyObject *
unicode_removesuffix_impl(TyObject *self, TyObject *suffix);

static TyObject *
unicode_removesuffix(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *suffix;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("removesuffix", "argument", "str", arg);
        goto exit;
    }
    suffix = arg;
    return_value = unicode_removesuffix_impl(self, suffix);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_rfind__doc__,
"rfind($self, sub[, start[, end]], /)\n"
"--\n"
"\n"
"Return the highest index in S where substring sub is found, such that sub is contained within S[start:end].\n"
"\n"
"Optional arguments start and end are interpreted as in slice notation.\n"
"Return -1 on failure.");

#define UNICODE_RFIND_METHODDEF    \
    {"rfind", _PyCFunction_CAST(unicode_rfind), METH_FASTCALL, unicode_rfind__doc__},

static Ty_ssize_t
unicode_rfind_impl(TyObject *str, TyObject *substr, Ty_ssize_t start,
                   Ty_ssize_t end);

static TyObject *
unicode_rfind(TyObject *str, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *substr;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("rfind", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("rfind", "argument 1", "str", args[0]);
        goto exit;
    }
    substr = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    _return_value = unicode_rfind_impl(str, substr, start, end);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_rindex__doc__,
"rindex($self, sub[, start[, end]], /)\n"
"--\n"
"\n"
"Return the highest index in S where substring sub is found, such that sub is contained within S[start:end].\n"
"\n"
"Optional arguments start and end are interpreted as in slice notation.\n"
"Raises ValueError when the substring is not found.");

#define UNICODE_RINDEX_METHODDEF    \
    {"rindex", _PyCFunction_CAST(unicode_rindex), METH_FASTCALL, unicode_rindex__doc__},

static Ty_ssize_t
unicode_rindex_impl(TyObject *str, TyObject *substr, Ty_ssize_t start,
                    Ty_ssize_t end);

static TyObject *
unicode_rindex(TyObject *str, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *substr;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("rindex", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("rindex", "argument 1", "str", args[0]);
        goto exit;
    }
    substr = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    _return_value = unicode_rindex_impl(str, substr, start, end);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_rjust__doc__,
"rjust($self, width, fillchar=\' \', /)\n"
"--\n"
"\n"
"Return a right-justified string of length width.\n"
"\n"
"Padding is done using the specified fill character (default is a space).");

#define UNICODE_RJUST_METHODDEF    \
    {"rjust", _PyCFunction_CAST(unicode_rjust), METH_FASTCALL, unicode_rjust__doc__},

static TyObject *
unicode_rjust_impl(TyObject *self, Ty_ssize_t width, Ty_UCS4 fillchar);

static TyObject *
unicode_rjust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t width;
    Ty_UCS4 fillchar = ' ';

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
    if (!convert_uc(args[1], &fillchar)) {
        goto exit;
    }
skip_optional:
    return_value = unicode_rjust_impl(self, width, fillchar);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_split__doc__,
"split($self, /, sep=None, maxsplit=-1)\n"
"--\n"
"\n"
"Return a list of the substrings in the string, using sep as the separator string.\n"
"\n"
"  sep\n"
"    The separator used to split the string.\n"
"\n"
"    When set to None (the default value), will split on any whitespace\n"
"    character (including \\n \\r \\t \\f and spaces) and will discard\n"
"    empty strings from the result.\n"
"  maxsplit\n"
"    Maximum number of splits.\n"
"    -1 (the default value) means no limit.\n"
"\n"
"Splitting starts at the front of the string and works to the end.\n"
"\n"
"Note, str.split() is mainly useful for data that has been intentionally\n"
"delimited.  With natural text that includes punctuation, consider using\n"
"the regular expression module.");

#define UNICODE_SPLIT_METHODDEF    \
    {"split", _PyCFunction_CAST(unicode_split), METH_FASTCALL|METH_KEYWORDS, unicode_split__doc__},

static TyObject *
unicode_split_impl(TyObject *self, TyObject *sep, Ty_ssize_t maxsplit);

static TyObject *
unicode_split(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(sep), &_Ty_ID(maxsplit), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"sep", "maxsplit", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "split",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *sep = Ty_None;
    Ty_ssize_t maxsplit = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        sep = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
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
    return_value = unicode_split_impl(self, sep, maxsplit);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_partition__doc__,
"partition($self, sep, /)\n"
"--\n"
"\n"
"Partition the string into three parts using the given separator.\n"
"\n"
"This will search for the separator in the string.  If the separator is found,\n"
"returns a 3-tuple containing the part before the separator, the separator\n"
"itself, and the part after it.\n"
"\n"
"If the separator is not found, returns a 3-tuple containing the original string\n"
"and two empty strings.");

#define UNICODE_PARTITION_METHODDEF    \
    {"partition", (PyCFunction)unicode_partition, METH_O, unicode_partition__doc__},

TyDoc_STRVAR(unicode_rpartition__doc__,
"rpartition($self, sep, /)\n"
"--\n"
"\n"
"Partition the string into three parts using the given separator.\n"
"\n"
"This will search for the separator in the string, starting at the end. If\n"
"the separator is found, returns a 3-tuple containing the part before the\n"
"separator, the separator itself, and the part after it.\n"
"\n"
"If the separator is not found, returns a 3-tuple containing two empty strings\n"
"and the original string.");

#define UNICODE_RPARTITION_METHODDEF    \
    {"rpartition", (PyCFunction)unicode_rpartition, METH_O, unicode_rpartition__doc__},

TyDoc_STRVAR(unicode_rsplit__doc__,
"rsplit($self, /, sep=None, maxsplit=-1)\n"
"--\n"
"\n"
"Return a list of the substrings in the string, using sep as the separator string.\n"
"\n"
"  sep\n"
"    The separator used to split the string.\n"
"\n"
"    When set to None (the default value), will split on any whitespace\n"
"    character (including \\n \\r \\t \\f and spaces) and will discard\n"
"    empty strings from the result.\n"
"  maxsplit\n"
"    Maximum number of splits.\n"
"    -1 (the default value) means no limit.\n"
"\n"
"Splitting starts at the end of the string and works to the front.");

#define UNICODE_RSPLIT_METHODDEF    \
    {"rsplit", _PyCFunction_CAST(unicode_rsplit), METH_FASTCALL|METH_KEYWORDS, unicode_rsplit__doc__},

static TyObject *
unicode_rsplit_impl(TyObject *self, TyObject *sep, Ty_ssize_t maxsplit);

static TyObject *
unicode_rsplit(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(sep), &_Ty_ID(maxsplit), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"sep", "maxsplit", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "rsplit",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *sep = Ty_None;
    Ty_ssize_t maxsplit = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        sep = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
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
    return_value = unicode_rsplit_impl(self, sep, maxsplit);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_splitlines__doc__,
"splitlines($self, /, keepends=False)\n"
"--\n"
"\n"
"Return a list of the lines in the string, breaking at line boundaries.\n"
"\n"
"Line breaks are not included in the resulting list unless keepends is given and\n"
"true.");

#define UNICODE_SPLITLINES_METHODDEF    \
    {"splitlines", _PyCFunction_CAST(unicode_splitlines), METH_FASTCALL|METH_KEYWORDS, unicode_splitlines__doc__},

static TyObject *
unicode_splitlines_impl(TyObject *self, int keepends);

static TyObject *
unicode_splitlines(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(keepends), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"keepends", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "splitlines",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int keepends = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    keepends = PyObject_IsTrue(args[0]);
    if (keepends < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = unicode_splitlines_impl(self, keepends);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_swapcase__doc__,
"swapcase($self, /)\n"
"--\n"
"\n"
"Convert uppercase characters to lowercase and lowercase characters to uppercase.");

#define UNICODE_SWAPCASE_METHODDEF    \
    {"swapcase", (PyCFunction)unicode_swapcase, METH_NOARGS, unicode_swapcase__doc__},

static TyObject *
unicode_swapcase_impl(TyObject *self);

static TyObject *
unicode_swapcase(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_swapcase_impl(self);
}

TyDoc_STRVAR(unicode_maketrans__doc__,
"maketrans(x, y=<unrepresentable>, z=<unrepresentable>, /)\n"
"--\n"
"\n"
"Return a translation table usable for str.translate().\n"
"\n"
"If there is only one argument, it must be a dictionary mapping Unicode\n"
"ordinals (integers) or characters to Unicode ordinals, strings or None.\n"
"Character keys will be then converted to ordinals.\n"
"If there are two arguments, they must be strings of equal length, and\n"
"in the resulting dictionary, each character in x will be mapped to the\n"
"character at the same position in y. If there is a third argument, it\n"
"must be a string, whose characters will be mapped to None in the result.");

#define UNICODE_MAKETRANS_METHODDEF    \
    {"maketrans", _PyCFunction_CAST(unicode_maketrans), METH_FASTCALL|METH_STATIC, unicode_maketrans__doc__},

static TyObject *
unicode_maketrans_impl(TyObject *x, TyObject *y, TyObject *z);

static TyObject *
unicode_maketrans(TyObject *null, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *x;
    TyObject *y = NULL;
    TyObject *z = NULL;

    if (!_TyArg_CheckPositional("maketrans", nargs, 1, 3)) {
        goto exit;
    }
    x = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("maketrans", "argument 2", "str", args[1]);
        goto exit;
    }
    y = args[1];
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("maketrans", "argument 3", "str", args[2]);
        goto exit;
    }
    z = args[2];
skip_optional:
    return_value = unicode_maketrans_impl(x, y, z);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_translate__doc__,
"translate($self, table, /)\n"
"--\n"
"\n"
"Replace each character in the string using the given translation table.\n"
"\n"
"  table\n"
"    Translation table, which must be a mapping of Unicode ordinals to\n"
"    Unicode ordinals, strings, or None.\n"
"\n"
"The table must implement lookup/indexing via __getitem__, for instance a\n"
"dictionary or list.  If this operation raises LookupError, the character is\n"
"left untouched.  Characters mapped to None are deleted.");

#define UNICODE_TRANSLATE_METHODDEF    \
    {"translate", (PyCFunction)unicode_translate, METH_O, unicode_translate__doc__},

TyDoc_STRVAR(unicode_upper__doc__,
"upper($self, /)\n"
"--\n"
"\n"
"Return a copy of the string converted to uppercase.");

#define UNICODE_UPPER_METHODDEF    \
    {"upper", (PyCFunction)unicode_upper, METH_NOARGS, unicode_upper__doc__},

static TyObject *
unicode_upper_impl(TyObject *self);

static TyObject *
unicode_upper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_upper_impl(self);
}

TyDoc_STRVAR(unicode_zfill__doc__,
"zfill($self, width, /)\n"
"--\n"
"\n"
"Pad a numeric string with zeros on the left, to fill a field of the given width.\n"
"\n"
"The string is never truncated.");

#define UNICODE_ZFILL_METHODDEF    \
    {"zfill", (PyCFunction)unicode_zfill, METH_O, unicode_zfill__doc__},

static TyObject *
unicode_zfill_impl(TyObject *self, Ty_ssize_t width);

static TyObject *
unicode_zfill(TyObject *self, TyObject *arg)
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
    return_value = unicode_zfill_impl(self, width);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_startswith__doc__,
"startswith($self, prefix[, start[, end]], /)\n"
"--\n"
"\n"
"Return True if the string starts with the specified prefix, False otherwise.\n"
"\n"
"  prefix\n"
"    A string or a tuple of strings to try.\n"
"  start\n"
"    Optional start position. Default: start of the string.\n"
"  end\n"
"    Optional stop position. Default: end of the string.");

#define UNICODE_STARTSWITH_METHODDEF    \
    {"startswith", _PyCFunction_CAST(unicode_startswith), METH_FASTCALL, unicode_startswith__doc__},

static TyObject *
unicode_startswith_impl(TyObject *self, TyObject *subobj, Ty_ssize_t start,
                        Ty_ssize_t end);

static TyObject *
unicode_startswith(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *subobj;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;

    if (!_TyArg_CheckPositional("startswith", nargs, 1, 3)) {
        goto exit;
    }
    subobj = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    return_value = unicode_startswith_impl(self, subobj, start, end);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_endswith__doc__,
"endswith($self, suffix[, start[, end]], /)\n"
"--\n"
"\n"
"Return True if the string ends with the specified suffix, False otherwise.\n"
"\n"
"  suffix\n"
"    A string or a tuple of strings to try.\n"
"  start\n"
"    Optional start position. Default: start of the string.\n"
"  end\n"
"    Optional stop position. Default: end of the string.");

#define UNICODE_ENDSWITH_METHODDEF    \
    {"endswith", _PyCFunction_CAST(unicode_endswith), METH_FASTCALL, unicode_endswith__doc__},

static TyObject *
unicode_endswith_impl(TyObject *self, TyObject *subobj, Ty_ssize_t start,
                      Ty_ssize_t end);

static TyObject *
unicode_endswith(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *subobj;
    Ty_ssize_t start = 0;
    Ty_ssize_t end = PY_SSIZE_T_MAX;

    if (!_TyArg_CheckPositional("endswith", nargs, 1, 3)) {
        goto exit;
    }
    subobj = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[1], &start)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyEval_SliceIndex(args[2], &end)) {
        goto exit;
    }
skip_optional:
    return_value = unicode_endswith_impl(self, subobj, start, end);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode___format____doc__,
"__format__($self, format_spec, /)\n"
"--\n"
"\n"
"Return a formatted version of the string as described by format_spec.");

#define UNICODE___FORMAT___METHODDEF    \
    {"__format__", (PyCFunction)unicode___format__, METH_O, unicode___format____doc__},

static TyObject *
unicode___format___impl(TyObject *self, TyObject *format_spec);

static TyObject *
unicode___format__(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *format_spec;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("__format__", "argument", "str", arg);
        goto exit;
    }
    format_spec = arg;
    return_value = unicode___format___impl(self, format_spec);

exit:
    return return_value;
}

TyDoc_STRVAR(unicode_sizeof__doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n"
"Return the size of the string in memory, in bytes.");

#define UNICODE_SIZEOF_METHODDEF    \
    {"__sizeof__", (PyCFunction)unicode_sizeof, METH_NOARGS, unicode_sizeof__doc__},

static TyObject *
unicode_sizeof_impl(TyObject *self);

static TyObject *
unicode_sizeof(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return unicode_sizeof_impl(self);
}

static TyObject *
unicode_new_impl(TyTypeObject *type, TyObject *x, const char *encoding,
                 const char *errors);

static TyObject *
unicode_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(object), &_Ty_ID(encoding), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"object", "encoding", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "str",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *x = NULL;
    const char *encoding = NULL;
    const char *errors = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        x = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[1]) {
        if (!TyUnicode_Check(fastargs[1])) {
            _TyArg_BadArgument("str", "argument 'encoding'", "str", fastargs[1]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(fastargs[1], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (!TyUnicode_Check(fastargs[2])) {
        _TyArg_BadArgument("str", "argument 'errors'", "str", fastargs[2]);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(fastargs[2], &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_pos:
    return_value = unicode_new_impl(type, x, encoding, errors);

exit:
    return return_value;
}
/*[clinic end generated code: output=238917fe66120bde input=a9049054013a1b77]*/
