/* JSON accelerator C extensor: _json module.
 *
 * It is built as a built-in module (Ty_BUILD_CORE_BUILTIN define) on Windows
 * and as an extension module (Ty_BUILD_CORE_MODULE define) on other
 * platforms. */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCall()
#include "pycore_global_strings.h" // _Ty_ID()
#include "pycore_pyerrors.h"      // _TyErr_FormatNote
#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_unicodeobject.h" // _TyUnicode_CheckConsistency()

#include <stdbool.h>              // bool


typedef struct _PyScannerObject {
    PyObject_HEAD
    signed char strict;
    TyObject *object_hook;
    TyObject *object_pairs_hook;
    TyObject *parse_float;
    TyObject *parse_int;
    TyObject *parse_constant;
} PyScannerObject;

#define PyScannerObject_CAST(op)    ((PyScannerObject *)(op))

static TyMemberDef scanner_members[] = {
    {"strict", Ty_T_BOOL, offsetof(PyScannerObject, strict), Py_READONLY, "strict"},
    {"object_hook", _Ty_T_OBJECT, offsetof(PyScannerObject, object_hook), Py_READONLY, "object_hook"},
    {"object_pairs_hook", _Ty_T_OBJECT, offsetof(PyScannerObject, object_pairs_hook), Py_READONLY},
    {"parse_float", _Ty_T_OBJECT, offsetof(PyScannerObject, parse_float), Py_READONLY, "parse_float"},
    {"parse_int", _Ty_T_OBJECT, offsetof(PyScannerObject, parse_int), Py_READONLY, "parse_int"},
    {"parse_constant", _Ty_T_OBJECT, offsetof(PyScannerObject, parse_constant), Py_READONLY, "parse_constant"},
    {NULL}
};

typedef struct _PyEncoderObject {
    PyObject_HEAD
    TyObject *markers;
    TyObject *defaultfn;
    TyObject *encoder;
    TyObject *indent;
    TyObject *key_separator;
    TyObject *item_separator;
    char sort_keys;
    char skipkeys;
    int allow_nan;
    PyCFunction fast_encode;
} PyEncoderObject;

#define PyEncoderObject_CAST(op)    ((PyEncoderObject *)(op))

static TyMemberDef encoder_members[] = {
    {"markers", _Ty_T_OBJECT, offsetof(PyEncoderObject, markers), Py_READONLY, "markers"},
    {"default", _Ty_T_OBJECT, offsetof(PyEncoderObject, defaultfn), Py_READONLY, "default"},
    {"encoder", _Ty_T_OBJECT, offsetof(PyEncoderObject, encoder), Py_READONLY, "encoder"},
    {"indent", _Ty_T_OBJECT, offsetof(PyEncoderObject, indent), Py_READONLY, "indent"},
    {"key_separator", _Ty_T_OBJECT, offsetof(PyEncoderObject, key_separator), Py_READONLY, "key_separator"},
    {"item_separator", _Ty_T_OBJECT, offsetof(PyEncoderObject, item_separator), Py_READONLY, "item_separator"},
    {"sort_keys", Ty_T_BOOL, offsetof(PyEncoderObject, sort_keys), Py_READONLY, "sort_keys"},
    {"skipkeys", Ty_T_BOOL, offsetof(PyEncoderObject, skipkeys), Py_READONLY, "skipkeys"},
    {NULL}
};

/* Forward decls */

static TyObject *
ascii_escape_unicode(TyObject *pystr);
static TyObject *
py_encode_basestring_ascii(TyObject* Py_UNUSED(self), TyObject *pystr);

static TyObject *
scan_once_unicode(PyScannerObject *s, TyObject *memo, TyObject *pystr, Ty_ssize_t idx, Ty_ssize_t *next_idx_ptr);
static TyObject *
_build_rval_index_tuple(TyObject *rval, Ty_ssize_t idx);
static TyObject *
scanner_new(TyTypeObject *type, TyObject *args, TyObject *kwds);
static void
scanner_dealloc(TyObject *self);
static int
scanner_clear(TyObject *self);

static TyObject *
encoder_new(TyTypeObject *type, TyObject *args, TyObject *kwds);
static void
encoder_dealloc(TyObject *self);
static int
encoder_clear(TyObject *self);
static int
encoder_listencode_list(PyEncoderObject *s, PyUnicodeWriter *writer, TyObject *seq, Ty_ssize_t indent_level, TyObject *indent_cache);
static int
encoder_listencode_obj(PyEncoderObject *s, PyUnicodeWriter *writer, TyObject *obj, Ty_ssize_t indent_level, TyObject *indent_cache);
static int
encoder_listencode_dict(PyEncoderObject *s, PyUnicodeWriter *writer, TyObject *dct, Ty_ssize_t indent_level, TyObject *indent_cache);
static TyObject *
_encoded_const(TyObject *obj);
static void
raise_errmsg(const char *msg, TyObject *s, Ty_ssize_t end);
static TyObject *
encoder_encode_string(PyEncoderObject *s, TyObject *obj);
static TyObject *
encoder_encode_float(PyEncoderObject *s, TyObject *obj);

#define S_CHAR(c) (c >= ' ' && c <= '~' && c != '\\' && c != '"')
#define IS_WHITESPACE(c) (((c) == ' ') || ((c) == '\t') || ((c) == '\n') || ((c) == '\r'))

static Ty_ssize_t
ascii_escape_unichar(Ty_UCS4 c, unsigned char *output, Ty_ssize_t chars)
{
    /* Escape unicode code point c to ASCII escape sequences
    in char *output. output must have at least 12 bytes unused to
    accommodate an escaped surrogate pair "\uXXXX\uXXXX" */
    output[chars++] = '\\';
    switch (c) {
        case '\\': output[chars++] = c; break;
        case '"': output[chars++] = c; break;
        case '\b': output[chars++] = 'b'; break;
        case '\f': output[chars++] = 'f'; break;
        case '\n': output[chars++] = 'n'; break;
        case '\r': output[chars++] = 'r'; break;
        case '\t': output[chars++] = 't'; break;
        default:
            if (c >= 0x10000) {
                /* UTF-16 surrogate pair */
                Ty_UCS4 v = Ty_UNICODE_HIGH_SURROGATE(c);
                output[chars++] = 'u';
                output[chars++] = Ty_hexdigits[(v >> 12) & 0xf];
                output[chars++] = Ty_hexdigits[(v >>  8) & 0xf];
                output[chars++] = Ty_hexdigits[(v >>  4) & 0xf];
                output[chars++] = Ty_hexdigits[(v      ) & 0xf];
                c = Ty_UNICODE_LOW_SURROGATE(c);
                output[chars++] = '\\';
            }
            output[chars++] = 'u';
            output[chars++] = Ty_hexdigits[(c >> 12) & 0xf];
            output[chars++] = Ty_hexdigits[(c >>  8) & 0xf];
            output[chars++] = Ty_hexdigits[(c >>  4) & 0xf];
            output[chars++] = Ty_hexdigits[(c      ) & 0xf];
    }
    return chars;
}

static TyObject *
ascii_escape_unicode(TyObject *pystr)
{
    /* Take a PyUnicode pystr and return a new ASCII-only escaped PyUnicode */
    Ty_ssize_t i;
    Ty_ssize_t input_chars;
    Ty_ssize_t output_size;
    Ty_ssize_t chars;
    TyObject *rval;
    const void *input;
    Ty_UCS1 *output;
    int kind;

    input_chars = TyUnicode_GET_LENGTH(pystr);
    input = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);

    /* Compute the output size */
    for (i = 0, output_size = 2; i < input_chars; i++) {
        Ty_UCS4 c = TyUnicode_READ(kind, input, i);
        Ty_ssize_t d;
        if (S_CHAR(c)) {
            d = 1;
        }
        else {
            switch(c) {
            case '\\': case '"': case '\b': case '\f':
            case '\n': case '\r': case '\t':
                d = 2; break;
            default:
                d = c >= 0x10000 ? 12 : 6;
            }
        }
        if (output_size > PY_SSIZE_T_MAX - d) {
            TyErr_SetString(TyExc_OverflowError, "string is too long to escape");
            return NULL;
        }
        output_size += d;
    }

    rval = TyUnicode_New(output_size, 127);
    if (rval == NULL) {
        return NULL;
    }
    output = TyUnicode_1BYTE_DATA(rval);
    chars = 0;
    output[chars++] = '"';
    for (i = 0; i < input_chars; i++) {
        Ty_UCS4 c = TyUnicode_READ(kind, input, i);
        if (S_CHAR(c)) {
            output[chars++] = c;
        }
        else {
            chars = ascii_escape_unichar(c, output, chars);
        }
    }
    output[chars++] = '"';
#ifdef Ty_DEBUG
    assert(_TyUnicode_CheckConsistency(rval, 1));
#endif
    return rval;
}

static TyObject *
escape_unicode(TyObject *pystr)
{
    /* Take a PyUnicode pystr and return a new escaped PyUnicode */
    Ty_ssize_t i;
    Ty_ssize_t input_chars;
    Ty_ssize_t output_size;
    Ty_ssize_t chars;
    TyObject *rval;
    const void *input;
    int kind;
    Ty_UCS4 maxchar;

    maxchar = TyUnicode_MAX_CHAR_VALUE(pystr);
    input_chars = TyUnicode_GET_LENGTH(pystr);
    input = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);

    /* Compute the output size */
    for (i = 0, output_size = 2; i < input_chars; i++) {
        Ty_UCS4 c = TyUnicode_READ(kind, input, i);
        Ty_ssize_t d;
        switch (c) {
        case '\\': case '"': case '\b': case '\f':
        case '\n': case '\r': case '\t':
            d = 2;
            break;
        default:
            if (c <= 0x1f)
                d = 6;
            else
                d = 1;
        }
        if (output_size > PY_SSIZE_T_MAX - d) {
            TyErr_SetString(TyExc_OverflowError, "string is too long to escape");
            return NULL;
        }
        output_size += d;
    }

    rval = TyUnicode_New(output_size, maxchar);
    if (rval == NULL)
        return NULL;

    kind = TyUnicode_KIND(rval);

#define ENCODE_OUTPUT do { \
        chars = 0; \
        output[chars++] = '"'; \
        for (i = 0; i < input_chars; i++) { \
            Ty_UCS4 c = TyUnicode_READ(kind, input, i); \
            switch (c) { \
            case '\\': output[chars++] = '\\'; output[chars++] = c; break; \
            case '"':  output[chars++] = '\\'; output[chars++] = c; break; \
            case '\b': output[chars++] = '\\'; output[chars++] = 'b'; break; \
            case '\f': output[chars++] = '\\'; output[chars++] = 'f'; break; \
            case '\n': output[chars++] = '\\'; output[chars++] = 'n'; break; \
            case '\r': output[chars++] = '\\'; output[chars++] = 'r'; break; \
            case '\t': output[chars++] = '\\'; output[chars++] = 't'; break; \
            default: \
                if (c <= 0x1f) { \
                    output[chars++] = '\\'; \
                    output[chars++] = 'u'; \
                    output[chars++] = '0'; \
                    output[chars++] = '0'; \
                    output[chars++] = Ty_hexdigits[(c >> 4) & 0xf]; \
                    output[chars++] = Ty_hexdigits[(c     ) & 0xf]; \
                } else { \
                    output[chars++] = c; \
                } \
            } \
        } \
        output[chars++] = '"'; \
    } while (0)

    if (kind == TyUnicode_1BYTE_KIND) {
        Ty_UCS1 *output = TyUnicode_1BYTE_DATA(rval);
        ENCODE_OUTPUT;
    } else if (kind == TyUnicode_2BYTE_KIND) {
        Ty_UCS2 *output = TyUnicode_2BYTE_DATA(rval);
        ENCODE_OUTPUT;
    } else {
        Ty_UCS4 *output = TyUnicode_4BYTE_DATA(rval);
        assert(kind == TyUnicode_4BYTE_KIND);
        ENCODE_OUTPUT;
    }
#undef ENCODE_OUTPUT

#ifdef Ty_DEBUG
    assert(_TyUnicode_CheckConsistency(rval, 1));
#endif
    return rval;
}

static void
raise_errmsg(const char *msg, TyObject *s, Ty_ssize_t end)
{
    /* Use JSONDecodeError exception to raise a nice looking ValueError subclass */
    _Ty_DECLARE_STR(json_decoder, "json.decoder");
    TyObject *JSONDecodeError =
         TyImport_ImportModuleAttr(&_Ty_STR(json_decoder), &_Ty_ID(JSONDecodeError));
    if (JSONDecodeError == NULL) {
        return;
    }

    TyObject *exc;
    exc = PyObject_CallFunction(JSONDecodeError, "zOn", msg, s, end);
    Ty_DECREF(JSONDecodeError);
    if (exc) {
        TyErr_SetObject(JSONDecodeError, exc);
        Ty_DECREF(exc);
    }
}

static void
raise_stop_iteration(Ty_ssize_t idx)
{
    TyObject *value = TyLong_FromSsize_t(idx);
    if (value != NULL) {
        TyErr_SetObject(TyExc_StopIteration, value);
        Ty_DECREF(value);
    }
}

static TyObject *
_build_rval_index_tuple(TyObject *rval, Ty_ssize_t idx) {
    /* return (rval, idx) tuple, stealing reference to rval */
    TyObject *tpl;
    TyObject *pyidx;
    /*
    steal a reference to rval, returns (rval, idx)
    */
    if (rval == NULL) {
        return NULL;
    }
    pyidx = TyLong_FromSsize_t(idx);
    if (pyidx == NULL) {
        Ty_DECREF(rval);
        return NULL;
    }
    tpl = TyTuple_New(2);
    if (tpl == NULL) {
        Ty_DECREF(pyidx);
        Ty_DECREF(rval);
        return NULL;
    }
    TyTuple_SET_ITEM(tpl, 0, rval);
    TyTuple_SET_ITEM(tpl, 1, pyidx);
    return tpl;
}

static inline int
_PyUnicodeWriter_IsEmpty(PyUnicodeWriter *writer_pub)
{
    _PyUnicodeWriter *writer = (_PyUnicodeWriter*)writer_pub;
    return (writer->pos == 0);
}

static TyObject *
scanstring_unicode(TyObject *pystr, Ty_ssize_t end, int strict, Ty_ssize_t *next_end_ptr)
{
    /* Read the JSON string from PyUnicode pystr.
    end is the index of the first character after the quote.
    if strict is zero then literal control characters are allowed
    *next_end_ptr is a return-by-reference index of the character
        after the end quote

    Return value is a new PyUnicode
    */
    TyObject *rval = NULL;
    Ty_ssize_t len;
    Ty_ssize_t begin = end - 1;
    Ty_ssize_t next /* = begin */;
    const void *buf;
    int kind;

    PyUnicodeWriter *writer = PyUnicodeWriter_Create(0);
    if (writer == NULL) {
        goto bail;
    }

    len = TyUnicode_GET_LENGTH(pystr);
    buf = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);

    if (end < 0 || len < end) {
        TyErr_SetString(TyExc_ValueError, "end is out of bounds");
        goto bail;
    }
    while (1) {
        /* Find the end of the string or the next escape */
        Ty_UCS4 c;
        {
            // Use tight scope variable to help register allocation.
            Ty_UCS4 d = 0;
            for (next = end; next < len; next++) {
                d = TyUnicode_READ(kind, buf, next);
                if (d == '"' || d == '\\') {
                    break;
                }
                if (d <= 0x1f && strict) {
                    raise_errmsg("Invalid control character at", pystr, next);
                    goto bail;
                }
            }
            c = d;
        }

        if (c == '"') {
            // Fast path for simple case.
            if (_PyUnicodeWriter_IsEmpty(writer)) {
                TyObject *ret = TyUnicode_Substring(pystr, end, next);
                if (ret == NULL) {
                    goto bail;
                }
                PyUnicodeWriter_Discard(writer);
                *next_end_ptr = next + 1;;
                return ret;
            }
        }
        else if (c != '\\') {
            raise_errmsg("Unterminated string starting at", pystr, begin);
            goto bail;
        }

        /* Pick up this chunk if it's not zero length */
        if (next != end) {
            if (PyUnicodeWriter_WriteSubstring(writer, pystr, end, next) < 0) {
                goto bail;
            }
        }
        next++;
        if (c == '"') {
            end = next;
            break;
        }
        if (next == len) {
            raise_errmsg("Unterminated string starting at", pystr, begin);
            goto bail;
        }
        c = TyUnicode_READ(kind, buf, next);
        if (c != 'u') {
            /* Non-unicode backslash escapes */
            end = next + 1;
            switch (c) {
                case '"': break;
                case '\\': break;
                case '/': break;
                case 'b': c = '\b'; break;
                case 'f': c = '\f'; break;
                case 'n': c = '\n'; break;
                case 'r': c = '\r'; break;
                case 't': c = '\t'; break;
                default: c = 0;
            }
            if (c == 0) {
                raise_errmsg("Invalid \\escape", pystr, end - 2);
                goto bail;
            }
        }
        else {
            c = 0;
            next++;
            end = next + 4;
            if (end >= len) {
                raise_errmsg("Invalid \\uXXXX escape", pystr, next - 1);
                goto bail;
            }
            /* Decode 4 hex digits */
            for (; next < end; next++) {
                Ty_UCS4 digit = TyUnicode_READ(kind, buf, next);
                c <<= 4;
                switch (digit) {
                    case '0': case '1': case '2': case '3': case '4':
                    case '5': case '6': case '7': case '8': case '9':
                        c |= (digit - '0'); break;
                    case 'a': case 'b': case 'c': case 'd': case 'e':
                    case 'f':
                        c |= (digit - 'a' + 10); break;
                    case 'A': case 'B': case 'C': case 'D': case 'E':
                    case 'F':
                        c |= (digit - 'A' + 10); break;
                    default:
                        raise_errmsg("Invalid \\uXXXX escape", pystr, end - 5);
                        goto bail;
                }
            }
            /* Surrogate pair */
            if (Ty_UNICODE_IS_HIGH_SURROGATE(c) && end + 6 < len &&
                TyUnicode_READ(kind, buf, next++) == '\\' &&
                TyUnicode_READ(kind, buf, next++) == 'u') {
                Ty_UCS4 c2 = 0;
                end += 6;
                /* Decode 4 hex digits */
                for (; next < end; next++) {
                    Ty_UCS4 digit = TyUnicode_READ(kind, buf, next);
                    c2 <<= 4;
                    switch (digit) {
                        case '0': case '1': case '2': case '3': case '4':
                        case '5': case '6': case '7': case '8': case '9':
                            c2 |= (digit - '0'); break;
                        case 'a': case 'b': case 'c': case 'd': case 'e':
                        case 'f':
                            c2 |= (digit - 'a' + 10); break;
                        case 'A': case 'B': case 'C': case 'D': case 'E':
                        case 'F':
                            c2 |= (digit - 'A' + 10); break;
                        default:
                            raise_errmsg("Invalid \\uXXXX escape", pystr, end - 5);
                            goto bail;
                    }
                }
                if (Ty_UNICODE_IS_LOW_SURROGATE(c2))
                    c = Ty_UNICODE_JOIN_SURROGATES(c, c2);
                else
                    end -= 6;
            }
        }
        if (PyUnicodeWriter_WriteChar(writer, c) < 0) {
            goto bail;
        }
    }

    rval = PyUnicodeWriter_Finish(writer);
    *next_end_ptr = end;
    return rval;

bail:
    *next_end_ptr = -1;
    PyUnicodeWriter_Discard(writer);
    return NULL;
}

TyDoc_STRVAR(pydoc_scanstring,
    "scanstring(string, end, strict=True) -> (string, end)\n"
    "\n"
    "Scan the string s for a JSON string. End is the index of the\n"
    "character in s after the quote that started the JSON string.\n"
    "Unescapes all valid JSON string escape sequences and raises ValueError\n"
    "on attempt to decode an invalid string. If strict is False then literal\n"
    "control characters are allowed in the string.\n"
    "\n"
    "Returns a tuple of the decoded string and the index of the character in s\n"
    "after the end quote."
);

static TyObject *
py_scanstring(TyObject* Py_UNUSED(self), TyObject *args)
{
    TyObject *pystr;
    TyObject *rval;
    Ty_ssize_t end;
    Ty_ssize_t next_end = -1;
    int strict = 1;
    if (!TyArg_ParseTuple(args, "On|p:scanstring", &pystr, &end, &strict)) {
        return NULL;
    }
    if (TyUnicode_Check(pystr)) {
        rval = scanstring_unicode(pystr, end, strict, &next_end);
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "first argument must be a string, not %.80s",
                     Ty_TYPE(pystr)->tp_name);
        return NULL;
    }
    return _build_rval_index_tuple(rval, next_end);
}

TyDoc_STRVAR(pydoc_encode_basestring_ascii,
    "encode_basestring_ascii(string) -> string\n"
    "\n"
    "Return an ASCII-only JSON representation of a Python string"
);

static TyObject *
py_encode_basestring_ascii(TyObject* Py_UNUSED(self), TyObject *pystr)
{
    TyObject *rval;
    /* Return an ASCII-only JSON representation of a Python string */
    /* METH_O */
    if (TyUnicode_Check(pystr)) {
        rval = ascii_escape_unicode(pystr);
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "first argument must be a string, not %.80s",
                     Ty_TYPE(pystr)->tp_name);
        return NULL;
    }
    return rval;
}


TyDoc_STRVAR(pydoc_encode_basestring,
    "encode_basestring(string) -> string\n"
    "\n"
    "Return a JSON representation of a Python string"
);

static TyObject *
py_encode_basestring(TyObject* Py_UNUSED(self), TyObject *pystr)
{
    TyObject *rval;
    /* Return a JSON representation of a Python string */
    /* METH_O */
    if (TyUnicode_Check(pystr)) {
        rval = escape_unicode(pystr);
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "first argument must be a string, not %.80s",
                     Ty_TYPE(pystr)->tp_name);
        return NULL;
    }
    return rval;
}

static void
scanner_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(self);
    (void)scanner_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
scanner_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyScannerObject *self = PyScannerObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->object_hook);
    Ty_VISIT(self->object_pairs_hook);
    Ty_VISIT(self->parse_float);
    Ty_VISIT(self->parse_int);
    Ty_VISIT(self->parse_constant);
    return 0;
}

static int
scanner_clear(TyObject *op)
{
    PyScannerObject *self = PyScannerObject_CAST(op);
    Ty_CLEAR(self->object_hook);
    Ty_CLEAR(self->object_pairs_hook);
    Ty_CLEAR(self->parse_float);
    Ty_CLEAR(self->parse_int);
    Ty_CLEAR(self->parse_constant);
    return 0;
}

static TyObject *
_parse_object_unicode(PyScannerObject *s, TyObject *memo, TyObject *pystr, Ty_ssize_t idx, Ty_ssize_t *next_idx_ptr)
{
    /* Read a JSON object from PyUnicode pystr.
    idx is the index of the first character after the opening curly brace.
    *next_idx_ptr is a return-by-reference index to the first character after
        the closing curly brace.

    Returns a new TyObject (usually a dict, but object_hook can change that)
    */
    const void *str;
    int kind;
    Ty_ssize_t end_idx;
    TyObject *val = NULL;
    TyObject *rval = NULL;
    TyObject *key = NULL;
    int has_pairs_hook = (s->object_pairs_hook != Ty_None);
    Ty_ssize_t next_idx;
    Ty_ssize_t comma_idx;

    str = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);
    end_idx = TyUnicode_GET_LENGTH(pystr) - 1;

    if (has_pairs_hook)
        rval = TyList_New(0);
    else
        rval = TyDict_New();
    if (rval == NULL)
        return NULL;

    /* skip whitespace after { */
    while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind,str, idx))) idx++;

    /* only loop if the object is non-empty */
    if (idx > end_idx || TyUnicode_READ(kind, str, idx) != '}') {
        while (1) {
            TyObject *memokey;

            /* read key */
            if (idx > end_idx || TyUnicode_READ(kind, str, idx) != '"') {
                raise_errmsg("Expecting property name enclosed in double quotes", pystr, idx);
                goto bail;
            }
            key = scanstring_unicode(pystr, idx + 1, s->strict, &next_idx);
            if (key == NULL)
                goto bail;
            if (TyDict_SetDefaultRef(memo, key, key, &memokey) < 0) {
                goto bail;
            }
            Ty_SETREF(key, memokey);
            idx = next_idx;

            /* skip whitespace between key and : delimiter, read :, skip whitespace */
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;
            if (idx > end_idx || TyUnicode_READ(kind, str, idx) != ':') {
                raise_errmsg("Expecting ':' delimiter", pystr, idx);
                goto bail;
            }
            idx++;
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

            /* read any JSON term */
            val = scan_once_unicode(s, memo, pystr, idx, &next_idx);
            if (val == NULL)
                goto bail;

            if (has_pairs_hook) {
                TyObject *item = TyTuple_Pack(2, key, val);
                if (item == NULL)
                    goto bail;
                Ty_CLEAR(key);
                Ty_CLEAR(val);
                if (TyList_Append(rval, item) == -1) {
                    Ty_DECREF(item);
                    goto bail;
                }
                Ty_DECREF(item);
            }
            else {
                if (TyDict_SetItem(rval, key, val) < 0)
                    goto bail;
                Ty_CLEAR(key);
                Ty_CLEAR(val);
            }
            idx = next_idx;

            /* skip whitespace before } or , */
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

            /* bail if the object is closed or we didn't get the , delimiter */
            if (idx <= end_idx && TyUnicode_READ(kind, str, idx) == '}')
                break;
            if (idx > end_idx || TyUnicode_READ(kind, str, idx) != ',') {
                raise_errmsg("Expecting ',' delimiter", pystr, idx);
                goto bail;
            }
            comma_idx = idx;
            idx++;

            /* skip whitespace after , delimiter */
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

            if (idx <= end_idx && TyUnicode_READ(kind, str, idx) == '}') {
                raise_errmsg("Illegal trailing comma before end of object", pystr, comma_idx);
                goto bail;
            }
        }
    }

    *next_idx_ptr = idx + 1;

    if (has_pairs_hook) {
        val = PyObject_CallOneArg(s->object_pairs_hook, rval);
        Ty_DECREF(rval);
        return val;
    }

    /* if object_hook is not None: rval = object_hook(rval) */
    if (s->object_hook != Ty_None) {
        val = PyObject_CallOneArg(s->object_hook, rval);
        Ty_DECREF(rval);
        return val;
    }
    return rval;
bail:
    Ty_XDECREF(key);
    Ty_XDECREF(val);
    Ty_XDECREF(rval);
    return NULL;
}

static TyObject *
_parse_array_unicode(PyScannerObject *s, TyObject *memo, TyObject *pystr, Ty_ssize_t idx, Ty_ssize_t *next_idx_ptr) {
    /* Read a JSON array from PyUnicode pystr.
    idx is the index of the first character after the opening brace.
    *next_idx_ptr is a return-by-reference index to the first character after
        the closing brace.

    Returns a new PyList
    */
    const void *str;
    int kind;
    Ty_ssize_t end_idx;
    TyObject *val = NULL;
    TyObject *rval;
    Ty_ssize_t next_idx;
    Ty_ssize_t comma_idx;

    rval = TyList_New(0);
    if (rval == NULL)
        return NULL;

    str = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);
    end_idx = TyUnicode_GET_LENGTH(pystr) - 1;

    /* skip whitespace after [ */
    while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

    /* only loop if the array is non-empty */
    if (idx > end_idx || TyUnicode_READ(kind, str, idx) != ']') {
        while (1) {

            /* read any JSON term  */
            val = scan_once_unicode(s, memo, pystr, idx, &next_idx);
            if (val == NULL)
                goto bail;

            if (TyList_Append(rval, val) == -1)
                goto bail;

            Ty_CLEAR(val);
            idx = next_idx;

            /* skip whitespace between term and , */
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

            /* bail if the array is closed or we didn't get the , delimiter */
            if (idx <= end_idx && TyUnicode_READ(kind, str, idx) == ']')
                break;
            if (idx > end_idx || TyUnicode_READ(kind, str, idx) != ',') {
                raise_errmsg("Expecting ',' delimiter", pystr, idx);
                goto bail;
            }
            comma_idx = idx;
            idx++;

            /* skip whitespace after , */
            while (idx <= end_idx && IS_WHITESPACE(TyUnicode_READ(kind, str, idx))) idx++;

            if (idx <= end_idx && TyUnicode_READ(kind, str, idx) == ']') {
                raise_errmsg("Illegal trailing comma before end of array", pystr, comma_idx);
                goto bail;
            }
        }
    }

    /* verify that idx < end_idx, TyUnicode_READ(kind, str, idx) should be ']' */
    if (idx > end_idx || TyUnicode_READ(kind, str, idx) != ']') {
        raise_errmsg("Expecting value", pystr, end_idx);
        goto bail;
    }
    *next_idx_ptr = idx + 1;
    return rval;
bail:
    Ty_XDECREF(val);
    Ty_DECREF(rval);
    return NULL;
}

static TyObject *
_parse_constant(PyScannerObject *s, const char *constant, Ty_ssize_t idx, Ty_ssize_t *next_idx_ptr) {
    /* Read a JSON constant.
    constant is the constant string that was found
        ("NaN", "Infinity", "-Infinity").
    idx is the index of the first character of the constant
    *next_idx_ptr is a return-by-reference index to the first character after
        the constant.

    Returns the result of parse_constant
    */
    TyObject *cstr;
    TyObject *rval;
    /* constant is "NaN", "Infinity", or "-Infinity" */
    cstr = TyUnicode_InternFromString(constant);
    if (cstr == NULL)
        return NULL;

    /* rval = parse_constant(constant) */
    rval = PyObject_CallOneArg(s->parse_constant, cstr);
    idx += TyUnicode_GET_LENGTH(cstr);
    Ty_DECREF(cstr);
    *next_idx_ptr = idx;
    return rval;
}

static TyObject *
_match_number_unicode(PyScannerObject *s, TyObject *pystr, Ty_ssize_t start, Ty_ssize_t *next_idx_ptr) {
    /* Read a JSON number from PyUnicode pystr.
    idx is the index of the first character of the number
    *next_idx_ptr is a return-by-reference index to the first character after
        the number.

    Returns a new TyObject representation of that number:
        PyLong, or PyFloat.
        May return other types if parse_int or parse_float are set
    */
    const void *str;
    int kind;
    Ty_ssize_t end_idx;
    Ty_ssize_t idx = start;
    int is_float = 0;
    TyObject *rval;
    TyObject *numstr = NULL;
    TyObject *custom_func;

    str = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);
    end_idx = TyUnicode_GET_LENGTH(pystr) - 1;

    /* read a sign if it's there, make sure it's not the end of the string */
    if (TyUnicode_READ(kind, str, idx) == '-') {
        idx++;
        if (idx > end_idx) {
            raise_stop_iteration(start);
            return NULL;
        }
    }

    /* read as many integer digits as we find as long as it doesn't start with 0 */
    if (TyUnicode_READ(kind, str, idx) >= '1' && TyUnicode_READ(kind, str, idx) <= '9') {
        idx++;
        while (idx <= end_idx && TyUnicode_READ(kind, str, idx) >= '0' && TyUnicode_READ(kind, str, idx) <= '9') idx++;
    }
    /* if it starts with 0 we only expect one integer digit */
    else if (TyUnicode_READ(kind, str, idx) == '0') {
        idx++;
    }
    /* no integer digits, error */
    else {
        raise_stop_iteration(start);
        return NULL;
    }

    /* if the next char is '.' followed by a digit then read all float digits */
    if (idx < end_idx && TyUnicode_READ(kind, str, idx) == '.' && TyUnicode_READ(kind, str, idx + 1) >= '0' && TyUnicode_READ(kind, str, idx + 1) <= '9') {
        is_float = 1;
        idx += 2;
        while (idx <= end_idx && TyUnicode_READ(kind, str, idx) >= '0' && TyUnicode_READ(kind, str, idx) <= '9') idx++;
    }

    /* if the next char is 'e' or 'E' then maybe read the exponent (or backtrack) */
    if (idx < end_idx && (TyUnicode_READ(kind, str, idx) == 'e' || TyUnicode_READ(kind, str, idx) == 'E')) {
        Ty_ssize_t e_start = idx;
        idx++;

        /* read an exponent sign if present */
        if (idx < end_idx && (TyUnicode_READ(kind, str, idx) == '-' || TyUnicode_READ(kind, str, idx) == '+')) idx++;

        /* read all digits */
        while (idx <= end_idx && TyUnicode_READ(kind, str, idx) >= '0' && TyUnicode_READ(kind, str, idx) <= '9') idx++;

        /* if we got a digit, then parse as float. if not, backtrack */
        if (TyUnicode_READ(kind, str, idx - 1) >= '0' && TyUnicode_READ(kind, str, idx - 1) <= '9') {
            is_float = 1;
        }
        else {
            idx = e_start;
        }
    }

    if (is_float && s->parse_float != (TyObject *)&TyFloat_Type)
        custom_func = s->parse_float;
    else if (!is_float && s->parse_int != (TyObject *) &TyLong_Type)
        custom_func = s->parse_int;
    else
        custom_func = NULL;

    if (custom_func) {
        /* copy the section we determined to be a number */
        numstr = TyUnicode_FromKindAndData(kind,
                                           (char*)str + kind * start,
                                           idx - start);
        if (numstr == NULL)
            return NULL;
        rval = PyObject_CallOneArg(custom_func, numstr);
    }
    else {
        Ty_ssize_t i, n;
        char *buf;
        /* Straight conversion to ASCII, to avoid costly conversion of
           decimal unicode digits (which cannot appear here) */
        n = idx - start;
        numstr = TyBytes_FromStringAndSize(NULL, n);
        if (numstr == NULL)
            return NULL;
        buf = TyBytes_AS_STRING(numstr);
        for (i = 0; i < n; i++) {
            buf[i] = (char) TyUnicode_READ(kind, str, i + start);
        }
        if (is_float)
            rval = TyFloat_FromString(numstr);
        else
            rval = TyLong_FromString(buf, NULL, 10);
    }
    Ty_DECREF(numstr);
    *next_idx_ptr = idx;
    return rval;
}

static TyObject *
scan_once_unicode(PyScannerObject *s, TyObject *memo, TyObject *pystr, Ty_ssize_t idx, Ty_ssize_t *next_idx_ptr)
{
    /* Read one JSON term (of any kind) from PyUnicode pystr.
    idx is the index of the first character of the term
    *next_idx_ptr is a return-by-reference index to the first character after
        the number.

    Returns a new TyObject representation of the term.
    */
    TyObject *res;
    const void *str;
    int kind;
    Ty_ssize_t length;

    str = TyUnicode_DATA(pystr);
    kind = TyUnicode_KIND(pystr);
    length = TyUnicode_GET_LENGTH(pystr);

    if (idx < 0) {
        TyErr_SetString(TyExc_ValueError, "idx cannot be negative");
        return NULL;
    }
    if (idx >= length) {
        raise_stop_iteration(idx);
        return NULL;
    }

    switch (TyUnicode_READ(kind, str, idx)) {
        case '"':
            /* string */
            return scanstring_unicode(pystr, idx + 1, s->strict, next_idx_ptr);
        case '{':
            /* object */
            if (_Ty_EnterRecursiveCall(" while decoding a JSON object "
                                       "from a unicode string"))
                return NULL;
            res = _parse_object_unicode(s, memo, pystr, idx + 1, next_idx_ptr);
            _Ty_LeaveRecursiveCall();
            return res;
        case '[':
            /* array */
            if (_Ty_EnterRecursiveCall(" while decoding a JSON array "
                                       "from a unicode string"))
                return NULL;
            res = _parse_array_unicode(s, memo, pystr, idx + 1, next_idx_ptr);
            _Ty_LeaveRecursiveCall();
            return res;
        case 'n':
            /* null */
            if ((idx + 3 < length) && TyUnicode_READ(kind, str, idx + 1) == 'u' && TyUnicode_READ(kind, str, idx + 2) == 'l' && TyUnicode_READ(kind, str, idx + 3) == 'l') {
                *next_idx_ptr = idx + 4;
                Py_RETURN_NONE;
            }
            break;
        case 't':
            /* true */
            if ((idx + 3 < length) && TyUnicode_READ(kind, str, idx + 1) == 'r' && TyUnicode_READ(kind, str, idx + 2) == 'u' && TyUnicode_READ(kind, str, idx + 3) == 'e') {
                *next_idx_ptr = idx + 4;
                Py_RETURN_TRUE;
            }
            break;
        case 'f':
            /* false */
            if ((idx + 4 < length) && TyUnicode_READ(kind, str, idx + 1) == 'a' &&
                TyUnicode_READ(kind, str, idx + 2) == 'l' &&
                TyUnicode_READ(kind, str, idx + 3) == 's' &&
                TyUnicode_READ(kind, str, idx + 4) == 'e') {
                *next_idx_ptr = idx + 5;
                Py_RETURN_FALSE;
            }
            break;
        case 'N':
            /* NaN */
            if ((idx + 2 < length) && TyUnicode_READ(kind, str, idx + 1) == 'a' &&
                TyUnicode_READ(kind, str, idx + 2) == 'N') {
                return _parse_constant(s, "NaN", idx, next_idx_ptr);
            }
            break;
        case 'I':
            /* Infinity */
            if ((idx + 7 < length) && TyUnicode_READ(kind, str, idx + 1) == 'n' &&
                TyUnicode_READ(kind, str, idx + 2) == 'f' &&
                TyUnicode_READ(kind, str, idx + 3) == 'i' &&
                TyUnicode_READ(kind, str, idx + 4) == 'n' &&
                TyUnicode_READ(kind, str, idx + 5) == 'i' &&
                TyUnicode_READ(kind, str, idx + 6) == 't' &&
                TyUnicode_READ(kind, str, idx + 7) == 'y') {
                return _parse_constant(s, "Infinity", idx, next_idx_ptr);
            }
            break;
        case '-':
            /* -Infinity */
            if ((idx + 8 < length) && TyUnicode_READ(kind, str, idx + 1) == 'I' &&
                TyUnicode_READ(kind, str, idx + 2) == 'n' &&
                TyUnicode_READ(kind, str, idx + 3) == 'f' &&
                TyUnicode_READ(kind, str, idx + 4) == 'i' &&
                TyUnicode_READ(kind, str, idx + 5) == 'n' &&
                TyUnicode_READ(kind, str, idx + 6) == 'i' &&
                TyUnicode_READ(kind, str, idx + 7) == 't' &&
                TyUnicode_READ(kind, str, idx + 8) == 'y') {
                return _parse_constant(s, "-Infinity", idx, next_idx_ptr);
            }
            break;
    }
    /* Didn't find a string, object, array, or named constant. Look for a number. */
    return _match_number_unicode(s, pystr, idx, next_idx_ptr);
}

static TyObject *
scanner_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    /* Python callable interface to scan_once_{str,unicode} */
    TyObject *pystr;
    TyObject *rval;
    Ty_ssize_t idx;
    Ty_ssize_t next_idx = -1;
    static char *kwlist[] = {"string", "idx", NULL};
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "On:scan_once", kwlist, &pystr, &idx))
        return NULL;

    if (!TyUnicode_Check(pystr)) {
        TyErr_Format(TyExc_TypeError,
                     "first argument must be a string, not %.80s",
                     Ty_TYPE(pystr)->tp_name);
        return NULL;
    }

    TyObject *memo = TyDict_New();
    if (memo == NULL) {
        return NULL;
    }
    rval = scan_once_unicode(PyScannerObject_CAST(self),
                             memo, pystr, idx, &next_idx);
    Ty_DECREF(memo);
    if (rval == NULL)
        return NULL;
    return _build_rval_index_tuple(rval, next_idx);
}

static TyObject *
scanner_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    PyScannerObject *s;
    TyObject *ctx;
    TyObject *strict;
    static char *kwlist[] = {"context", NULL};

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O:make_scanner", kwlist, &ctx))
        return NULL;

    s = (PyScannerObject *)type->tp_alloc(type, 0);
    if (s == NULL) {
        return NULL;
    }

    /* All of these will fail "gracefully" so we don't need to verify them */
    strict = PyObject_GetAttrString(ctx, "strict");
    if (strict == NULL)
        goto bail;
    s->strict = PyObject_IsTrue(strict);
    Ty_DECREF(strict);
    if (s->strict < 0)
        goto bail;
    s->object_hook = PyObject_GetAttrString(ctx, "object_hook");
    if (s->object_hook == NULL)
        goto bail;
    s->object_pairs_hook = PyObject_GetAttrString(ctx, "object_pairs_hook");
    if (s->object_pairs_hook == NULL)
        goto bail;
    s->parse_float = PyObject_GetAttrString(ctx, "parse_float");
    if (s->parse_float == NULL)
        goto bail;
    s->parse_int = PyObject_GetAttrString(ctx, "parse_int");
    if (s->parse_int == NULL)
        goto bail;
    s->parse_constant = PyObject_GetAttrString(ctx, "parse_constant");
    if (s->parse_constant == NULL)
        goto bail;

    return (TyObject *)s;

bail:
    Ty_DECREF(s);
    return NULL;
}

TyDoc_STRVAR(scanner_doc, "JSON scanner object");

static TyType_Slot PyScannerType_slots[] = {
    {Ty_tp_doc, (void *)scanner_doc},
    {Ty_tp_dealloc, scanner_dealloc},
    {Ty_tp_call, scanner_call},
    {Ty_tp_traverse, scanner_traverse},
    {Ty_tp_clear, scanner_clear},
    {Ty_tp_members, scanner_members},
    {Ty_tp_new, scanner_new},
    {0, 0}
};

static TyType_Spec PyScannerType_spec = {
    .name = "_json.Scanner",
    .basicsize = sizeof(PyScannerObject),
    .itemsize = 0,
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .slots = PyScannerType_slots,
};

static TyObject *
encoder_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"markers", "default", "encoder", "indent", "key_separator", "item_separator", "sort_keys", "skipkeys", "allow_nan", NULL};

    PyEncoderObject *s;
    TyObject *markers = Ty_None, *defaultfn, *encoder, *indent, *key_separator;
    TyObject *item_separator;
    int sort_keys, skipkeys, allow_nan;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O!?OOOUUppp:make_encoder", kwlist,
        &TyDict_Type, &markers, &defaultfn, &encoder, &indent,
        &key_separator, &item_separator,
        &sort_keys, &skipkeys, &allow_nan))
        return NULL;

    s = (PyEncoderObject *)type->tp_alloc(type, 0);
    if (s == NULL)
        return NULL;

    s->markers = Ty_NewRef(markers);
    s->defaultfn = Ty_NewRef(defaultfn);
    s->encoder = Ty_NewRef(encoder);
    s->indent = Ty_NewRef(indent);
    s->key_separator = Ty_NewRef(key_separator);
    s->item_separator = Ty_NewRef(item_separator);
    s->sort_keys = sort_keys;
    s->skipkeys = skipkeys;
    s->allow_nan = allow_nan;
    s->fast_encode = NULL;

    if (PyCFunction_Check(s->encoder)) {
        PyCFunction f = PyCFunction_GetFunction(s->encoder);
        if (f == py_encode_basestring_ascii || f == py_encode_basestring) {
            s->fast_encode = f;
        }
    }

    return (TyObject *)s;
}


/* indent_cache is a list that contains intermixed values at even and odd
 * positions:
 *
 * 2*k   : '\n' + indent * (k + initial_indent_level)
 *         strings written after opening and before closing brackets
 * 2*k-1 : item_separator + '\n' + indent * (k + initial_indent_level)
 *         strings written between items
 *
 * Its size is always an odd number.
 */
static TyObject *
create_indent_cache(PyEncoderObject *s, Ty_ssize_t indent_level)
{
    TyObject *newline_indent = TyUnicode_FromOrdinal('\n');
    if (newline_indent != NULL && indent_level) {
        TyUnicode_AppendAndDel(&newline_indent,
                               PySequence_Repeat(s->indent, indent_level));
    }
    if (newline_indent == NULL) {
        return NULL;
    }
    TyObject *indent_cache = TyList_New(1);
    if (indent_cache == NULL) {
        Ty_DECREF(newline_indent);
        return NULL;
    }
    TyList_SET_ITEM(indent_cache, 0, newline_indent);
    return indent_cache;
}

/* Extend indent_cache by adding values for the next level.
 * It should have values for the indent_level-1 level before the call.
 */
static int
update_indent_cache(PyEncoderObject *s,
                    Ty_ssize_t indent_level, TyObject *indent_cache)
{
    assert(indent_level * 2 == TyList_GET_SIZE(indent_cache) + 1);
    assert(indent_level > 0);
    TyObject *newline_indent = TyList_GET_ITEM(indent_cache, (indent_level - 1)*2);
    newline_indent = TyUnicode_Concat(newline_indent, s->indent);
    if (newline_indent == NULL) {
        return -1;
    }
    TyObject *separator_indent = TyUnicode_Concat(s->item_separator, newline_indent);
    if (separator_indent == NULL) {
        Ty_DECREF(newline_indent);
        return -1;
    }

    if (TyList_Append(indent_cache, separator_indent) < 0 ||
        TyList_Append(indent_cache, newline_indent) < 0)
    {
        Ty_DECREF(separator_indent);
        Ty_DECREF(newline_indent);
        return -1;
    }
    Ty_DECREF(separator_indent);
    Ty_DECREF(newline_indent);
    return 0;
}

static TyObject *
get_item_separator(PyEncoderObject *s,
                   Ty_ssize_t indent_level, TyObject *indent_cache)
{
    assert(indent_level > 0);
    if (indent_level * 2 > TyList_GET_SIZE(indent_cache)) {
        if (update_indent_cache(s, indent_level, indent_cache) < 0) {
            return NULL;
        }
    }
    assert(indent_level * 2 < TyList_GET_SIZE(indent_cache));
    return TyList_GET_ITEM(indent_cache, indent_level * 2 - 1);
}

static int
write_newline_indent(PyUnicodeWriter *writer,
                     Ty_ssize_t indent_level, TyObject *indent_cache)
{
    TyObject *newline_indent = TyList_GET_ITEM(indent_cache, indent_level * 2);
    return PyUnicodeWriter_WriteStr(writer, newline_indent);
}


static TyObject *
encoder_call(TyObject *op, TyObject *args, TyObject *kwds)
{
    /* Python callable interface to encode_listencode_obj */
    static char *kwlist[] = {"obj", "_current_indent_level", NULL};
    TyObject *obj;
    Ty_ssize_t indent_level;
    PyEncoderObject *self = PyEncoderObject_CAST(op);

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "On:_iterencode", kwlist,
                                     &obj, &indent_level))
        return NULL;

    PyUnicodeWriter *writer = PyUnicodeWriter_Create(0);
    if (writer == NULL) {
        return NULL;
    }

    TyObject *indent_cache = NULL;
    if (self->indent != Ty_None) {
        indent_cache = create_indent_cache(self, indent_level);
        if (indent_cache == NULL) {
            PyUnicodeWriter_Discard(writer);
            return NULL;
        }
    }
    if (encoder_listencode_obj(self, writer, obj, indent_level, indent_cache)) {
        PyUnicodeWriter_Discard(writer);
        Ty_XDECREF(indent_cache);
        return NULL;
    }
    Ty_XDECREF(indent_cache);

    TyObject *str = PyUnicodeWriter_Finish(writer);
    if (str == NULL) {
        return NULL;
    }
    TyObject *result = TyTuple_Pack(1, str);
    Ty_DECREF(str);
    return result;
}

static TyObject *
_encoded_const(TyObject *obj)
{
    /* Return the JSON string representation of None, True, False */
    if (obj == Ty_None) {
        return &_Ty_ID(null);
    }
    else if (obj == Ty_True) {
        return &_Ty_ID(true);
    }
    else if (obj == Ty_False) {
        return &_Ty_ID(false);
    }
    else {
        TyErr_SetString(TyExc_ValueError, "not a const");
        return NULL;
    }
}

static TyObject *
encoder_encode_float(PyEncoderObject *s, TyObject *obj)
{
    /* Return the JSON representation of a PyFloat. */
    double i = TyFloat_AS_DOUBLE(obj);
    if (!isfinite(i)) {
        if (!s->allow_nan) {
            TyErr_Format(
                    TyExc_ValueError,
                    "Out of range float values are not JSON compliant: %R",
                    obj
                    );
            return NULL;
        }
        if (i > 0) {
            return TyUnicode_FromString("Infinity");
        }
        else if (i < 0) {
            return TyUnicode_FromString("-Infinity");
        }
        else {
            return TyUnicode_FromString("NaN");
        }
    }
    return TyFloat_Type.tp_repr(obj);
}

static TyObject *
encoder_encode_string(PyEncoderObject *s, TyObject *obj)
{
    /* Return the JSON representation of a string */
    TyObject *encoded;

    if (s->fast_encode) {
        return s->fast_encode(NULL, obj);
    }
    encoded = PyObject_CallOneArg(s->encoder, obj);
    if (encoded != NULL && !TyUnicode_Check(encoded)) {
        TyErr_Format(TyExc_TypeError,
                     "encoder() must return a string, not %.80s",
                     Ty_TYPE(encoded)->tp_name);
        Ty_DECREF(encoded);
        return NULL;
    }
    return encoded;
}

static int
_steal_accumulate(PyUnicodeWriter *writer, TyObject *stolen)
{
    /* Append stolen and then decrement its reference count */
    int rval = PyUnicodeWriter_WriteStr(writer, stolen);
    Ty_DECREF(stolen);
    return rval;
}

static int
encoder_listencode_obj(PyEncoderObject *s, PyUnicodeWriter *writer,
                       TyObject *obj,
                       Ty_ssize_t indent_level, TyObject *indent_cache)
{
    /* Encode Python object obj to a JSON term */
    TyObject *newobj;
    int rv;

    if (obj == Ty_None) {
      return PyUnicodeWriter_WriteASCII(writer, "null", 4);
    }
    else if (obj == Ty_True) {
      return PyUnicodeWriter_WriteASCII(writer, "true", 4);
    }
    else if (obj == Ty_False) {
      return PyUnicodeWriter_WriteASCII(writer, "false", 5);
    }
    else if (TyUnicode_Check(obj)) {
        TyObject *encoded = encoder_encode_string(s, obj);
        if (encoded == NULL)
            return -1;
        return _steal_accumulate(writer, encoded);
    }
    else if (TyLong_Check(obj)) {
        if (TyLong_CheckExact(obj)) {
            // Fast-path for exact integers
            return PyUnicodeWriter_WriteRepr(writer, obj);
        }
        TyObject *encoded = TyLong_Type.tp_repr(obj);
        if (encoded == NULL)
            return -1;
        return _steal_accumulate(writer, encoded);
    }
    else if (TyFloat_Check(obj)) {
        TyObject *encoded = encoder_encode_float(s, obj);
        if (encoded == NULL)
            return -1;
        return _steal_accumulate(writer, encoded);
    }
    else if (TyList_Check(obj) || TyTuple_Check(obj)) {
        if (_Ty_EnterRecursiveCall(" while encoding a JSON object"))
            return -1;
        rv = encoder_listencode_list(s, writer, obj, indent_level, indent_cache);
        _Ty_LeaveRecursiveCall();
        return rv;
    }
    else if (TyDict_Check(obj)) {
        if (_Ty_EnterRecursiveCall(" while encoding a JSON object"))
            return -1;
        rv = encoder_listencode_dict(s, writer, obj, indent_level, indent_cache);
        _Ty_LeaveRecursiveCall();
        return rv;
    }
    else {
        TyObject *ident = NULL;
        if (s->markers != Ty_None) {
            int has_key;
            ident = TyLong_FromVoidPtr(obj);
            if (ident == NULL)
                return -1;
            has_key = TyDict_Contains(s->markers, ident);
            if (has_key) {
                if (has_key != -1)
                    TyErr_SetString(TyExc_ValueError, "Circular reference detected");
                Ty_DECREF(ident);
                return -1;
            }
            if (TyDict_SetItem(s->markers, ident, obj)) {
                Ty_DECREF(ident);
                return -1;
            }
        }
        newobj = PyObject_CallOneArg(s->defaultfn, obj);
        if (newobj == NULL) {
            Ty_XDECREF(ident);
            return -1;
        }

        if (_Ty_EnterRecursiveCall(" while encoding a JSON object")) {
            Ty_DECREF(newobj);
            Ty_XDECREF(ident);
            return -1;
        }
        rv = encoder_listencode_obj(s, writer, newobj, indent_level, indent_cache);
        _Ty_LeaveRecursiveCall();

        Ty_DECREF(newobj);
        if (rv) {
            _TyErr_FormatNote("when serializing %T object", obj);
            Ty_XDECREF(ident);
            return -1;
        }
        if (ident != NULL) {
            if (TyDict_DelItem(s->markers, ident)) {
                Ty_XDECREF(ident);
                return -1;
            }
            Ty_XDECREF(ident);
        }
        return rv;
    }
}

static int
encoder_encode_key_value(PyEncoderObject *s, PyUnicodeWriter *writer, bool *first,
                         TyObject *dct, TyObject *key, TyObject *value,
                         Ty_ssize_t indent_level, TyObject *indent_cache,
                         TyObject *item_separator)
{
    TyObject *keystr = NULL;
    TyObject *encoded;

    if (TyUnicode_Check(key)) {
        keystr = Ty_NewRef(key);
    }
    else if (TyFloat_Check(key)) {
        keystr = encoder_encode_float(s, key);
    }
    else if (key == Ty_True || key == Ty_False || key == Ty_None) {
                    /* This must come before the TyLong_Check because
                       True and False are also 1 and 0.*/
        keystr = _encoded_const(key);
    }
    else if (TyLong_Check(key)) {
        keystr = TyLong_Type.tp_repr(key);
    }
    else if (s->skipkeys) {
        return 0;
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "keys must be str, int, float, bool or None, "
                     "not %.100s", Ty_TYPE(key)->tp_name);
        return -1;
    }

    if (keystr == NULL) {
        return -1;
    }

    if (*first) {
        *first = false;
        if (s->indent != Ty_None) {
            if (write_newline_indent(writer, indent_level, indent_cache) < 0) {
                Ty_DECREF(keystr);
                return -1;
            }
        }
    }
    else {
        if (PyUnicodeWriter_WriteStr(writer, item_separator) < 0) {
            Ty_DECREF(keystr);
            return -1;
        }
    }

    encoded = encoder_encode_string(s, keystr);
    Ty_DECREF(keystr);
    if (encoded == NULL) {
        return -1;
    }

    if (_steal_accumulate(writer, encoded) < 0) {
        return -1;
    }
    if (PyUnicodeWriter_WriteStr(writer, s->key_separator) < 0) {
        return -1;
    }
    if (encoder_listencode_obj(s, writer, value, indent_level, indent_cache) < 0) {
        _TyErr_FormatNote("when serializing %T item %R", dct, key);
        return -1;
    }
    return 0;
}

static int
encoder_listencode_dict(PyEncoderObject *s, PyUnicodeWriter *writer,
                        TyObject *dct,
                       Ty_ssize_t indent_level, TyObject *indent_cache)
{
    /* Encode Python dict dct a JSON term */
    TyObject *ident = NULL;
    TyObject *items = NULL;
    TyObject *key, *value;
    bool first = true;

    if (TyDict_GET_SIZE(dct) == 0) {
        /* Fast path */
        return PyUnicodeWriter_WriteASCII(writer, "{}", 2);
    }

    if (s->markers != Ty_None) {
        int has_key;
        ident = TyLong_FromVoidPtr(dct);
        if (ident == NULL)
            goto bail;
        has_key = TyDict_Contains(s->markers, ident);
        if (has_key) {
            if (has_key != -1)
                TyErr_SetString(TyExc_ValueError, "Circular reference detected");
            goto bail;
        }
        if (TyDict_SetItem(s->markers, ident, dct)) {
            goto bail;
        }
    }

    if (PyUnicodeWriter_WriteChar(writer, '{')) {
        goto bail;
    }

    TyObject *separator = s->item_separator; // borrowed reference
    if (s->indent != Ty_None) {
        indent_level++;
        separator = get_item_separator(s, indent_level, indent_cache);
        if (separator == NULL)
            goto bail;
    }

    if (s->sort_keys || !TyDict_CheckExact(dct)) {
        items = PyMapping_Items(dct);
        if (items == NULL || (s->sort_keys && TyList_Sort(items) < 0))
            goto bail;

        for (Ty_ssize_t  i = 0; i < TyList_GET_SIZE(items); i++) {
            TyObject *item = TyList_GET_ITEM(items, i);

            if (!TyTuple_Check(item) || TyTuple_GET_SIZE(item) != 2) {
                TyErr_SetString(TyExc_ValueError, "items must return 2-tuples");
                goto bail;
            }

            key = TyTuple_GET_ITEM(item, 0);
            value = TyTuple_GET_ITEM(item, 1);
            if (encoder_encode_key_value(s, writer, &first, dct, key, value,
                                         indent_level, indent_cache,
                                         separator) < 0)
                goto bail;
        }
        Ty_CLEAR(items);

    } else {
        Ty_ssize_t pos = 0;
        while (TyDict_Next(dct, &pos, &key, &value)) {
            if (encoder_encode_key_value(s, writer, &first, dct, key, value,
                                         indent_level, indent_cache,
                                         separator) < 0)
                goto bail;
        }
    }

    if (ident != NULL) {
        if (TyDict_DelItem(s->markers, ident))
            goto bail;
        Ty_CLEAR(ident);
    }
    if (s->indent != Ty_None && !first) {
        indent_level--;
        if (write_newline_indent(writer, indent_level, indent_cache) < 0) {
            goto bail;
        }
    }

    if (PyUnicodeWriter_WriteChar(writer, '}')) {
        goto bail;
    }
    return 0;

bail:
    Ty_XDECREF(items);
    Ty_XDECREF(ident);
    return -1;
}

static int
encoder_listencode_list(PyEncoderObject *s, PyUnicodeWriter *writer,
                        TyObject *seq,
                        Ty_ssize_t indent_level, TyObject *indent_cache)
{
    TyObject *ident = NULL;
    TyObject *s_fast = NULL;
    Ty_ssize_t i;

    ident = NULL;
    s_fast = PySequence_Fast(seq, "_iterencode_list needs a sequence");
    if (s_fast == NULL)
        return -1;
    if (PySequence_Fast_GET_SIZE(s_fast) == 0) {
        Ty_DECREF(s_fast);
        return PyUnicodeWriter_WriteASCII(writer, "[]", 2);
    }

    if (s->markers != Ty_None) {
        int has_key;
        ident = TyLong_FromVoidPtr(seq);
        if (ident == NULL)
            goto bail;
        has_key = TyDict_Contains(s->markers, ident);
        if (has_key) {
            if (has_key != -1)
                TyErr_SetString(TyExc_ValueError, "Circular reference detected");
            goto bail;
        }
        if (TyDict_SetItem(s->markers, ident, seq)) {
            goto bail;
        }
    }

    if (PyUnicodeWriter_WriteChar(writer, '[')) {
        goto bail;
    }

    TyObject *separator = s->item_separator; // borrowed reference
    if (s->indent != Ty_None) {
        indent_level++;
        separator = get_item_separator(s, indent_level, indent_cache);
        if (separator == NULL ||
            write_newline_indent(writer, indent_level, indent_cache) < 0)
        {
            goto bail;
        }
    }
    for (i = 0; i < PySequence_Fast_GET_SIZE(s_fast); i++) {
        TyObject *obj = PySequence_Fast_GET_ITEM(s_fast, i);
        if (i) {
            if (PyUnicodeWriter_WriteStr(writer, separator) < 0)
                goto bail;
        }
        if (encoder_listencode_obj(s, writer, obj, indent_level, indent_cache)) {
            _TyErr_FormatNote("when serializing %T item %zd", seq, i);
            goto bail;
        }
    }
    if (ident != NULL) {
        if (TyDict_DelItem(s->markers, ident))
            goto bail;
        Ty_CLEAR(ident);
    }

    if (s->indent != Ty_None) {
        indent_level--;
        if (write_newline_indent(writer, indent_level, indent_cache) < 0) {
            goto bail;
        }
    }

    if (PyUnicodeWriter_WriteChar(writer, ']')) {
        goto bail;
    }
    Ty_DECREF(s_fast);
    return 0;

bail:
    Ty_XDECREF(ident);
    Ty_DECREF(s_fast);
    return -1;
}

static void
encoder_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(self);
    (void)encoder_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
encoder_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyEncoderObject *self = PyEncoderObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->markers);
    Ty_VISIT(self->defaultfn);
    Ty_VISIT(self->encoder);
    Ty_VISIT(self->indent);
    Ty_VISIT(self->key_separator);
    Ty_VISIT(self->item_separator);
    return 0;
}

static int
encoder_clear(TyObject *op)
{
    PyEncoderObject *self = PyEncoderObject_CAST(op);
    /* Deallocate Encoder */
    Ty_CLEAR(self->markers);
    Ty_CLEAR(self->defaultfn);
    Ty_CLEAR(self->encoder);
    Ty_CLEAR(self->indent);
    Ty_CLEAR(self->key_separator);
    Ty_CLEAR(self->item_separator);
    return 0;
}

TyDoc_STRVAR(encoder_doc, "Encoder(markers, default, encoder, indent, key_separator, item_separator, sort_keys, skipkeys, allow_nan)");

static TyType_Slot PyEncoderType_slots[] = {
    {Ty_tp_doc, (void *)encoder_doc},
    {Ty_tp_dealloc, encoder_dealloc},
    {Ty_tp_call, encoder_call},
    {Ty_tp_traverse, encoder_traverse},
    {Ty_tp_clear, encoder_clear},
    {Ty_tp_members, encoder_members},
    {Ty_tp_new, encoder_new},
    {0, 0}
};

static TyType_Spec PyEncoderType_spec = {
    .name = "_json.Encoder",
    .basicsize = sizeof(PyEncoderObject),
    .itemsize = 0,
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .slots = PyEncoderType_slots
};

static TyMethodDef speedups_methods[] = {
    {"encode_basestring_ascii",
        py_encode_basestring_ascii,
        METH_O,
        pydoc_encode_basestring_ascii},
    {"encode_basestring",
        py_encode_basestring,
        METH_O,
        pydoc_encode_basestring},
    {"scanstring",
        py_scanstring,
        METH_VARARGS,
        pydoc_scanstring},
    {NULL, NULL, 0, NULL}
};

TyDoc_STRVAR(module_doc,
"json speedups\n");

static int
_json_exec(TyObject *module)
{
    TyObject *PyScannerType = TyType_FromSpec(&PyScannerType_spec);
    if (TyModule_Add(module, "make_scanner", PyScannerType) < 0) {
        return -1;
    }

    TyObject *PyEncoderType = TyType_FromSpec(&PyEncoderType_spec);
    if (TyModule_Add(module, "make_encoder", PyEncoderType) < 0) {
        return -1;
    }

    return 0;
}

static PyModuleDef_Slot _json_slots[] = {
    {Ty_mod_exec, _json_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef jsonmodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_json",
    .m_doc = module_doc,
    .m_methods = speedups_methods,
    .m_slots = _json_slots,
};

PyMODINIT_FUNC
PyInit__json(void)
{
    return PyModuleDef_Init(&jsonmodule);
}
