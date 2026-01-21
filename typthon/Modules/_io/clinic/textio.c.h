/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_SINGLETON()
#endif
#include "pycore_abstract.h"      // _Ty_convert_optional_to_ssize_t()
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_io__TextIOBase_detach__doc__,
"detach($self, /)\n"
"--\n"
"\n"
"Separate the underlying buffer from the TextIOBase and return it.\n"
"\n"
"After the underlying buffer has been detached, the TextIO is in an unusable state.");

#define _IO__TEXTIOBASE_DETACH_METHODDEF    \
    {"detach", _PyCFunction_CAST(_io__TextIOBase_detach), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__TextIOBase_detach__doc__},

static TyObject *
_io__TextIOBase_detach_impl(TyObject *self, TyTypeObject *cls);

static TyObject *
_io__TextIOBase_detach(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "detach() takes no arguments");
        return NULL;
    }
    return _io__TextIOBase_detach_impl(self, cls);
}

TyDoc_STRVAR(_io__TextIOBase_read__doc__,
"read($self, size=-1, /)\n"
"--\n"
"\n"
"Read at most size characters from stream.\n"
"\n"
"Read from underlying buffer until we have size characters or we hit EOF.\n"
"If size is negative or omitted, read until EOF.");

#define _IO__TEXTIOBASE_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_io__TextIOBase_read), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__TextIOBase_read__doc__},

static TyObject *
_io__TextIOBase_read_impl(TyObject *self, TyTypeObject *cls,
                          int Py_UNUSED(size));

static TyObject *
_io__TextIOBase_read(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "read",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int size = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional_posonly;
    }
    size = TyLong_AsInt(args[0]);
    if (size == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_posonly:
    return_value = _io__TextIOBase_read_impl(self, cls, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io__TextIOBase_readline__doc__,
"readline($self, size=-1, /)\n"
"--\n"
"\n"
"Read until newline or EOF.\n"
"\n"
"Return an empty string if EOF is hit immediately.\n"
"If size is specified, at most size characters will be read.");

#define _IO__TEXTIOBASE_READLINE_METHODDEF    \
    {"readline", _PyCFunction_CAST(_io__TextIOBase_readline), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__TextIOBase_readline__doc__},

static TyObject *
_io__TextIOBase_readline_impl(TyObject *self, TyTypeObject *cls,
                              int Py_UNUSED(size));

static TyObject *
_io__TextIOBase_readline(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "readline",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int size = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional_posonly;
    }
    size = TyLong_AsInt(args[0]);
    if (size == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_posonly:
    return_value = _io__TextIOBase_readline_impl(self, cls, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io__TextIOBase_write__doc__,
"write($self, s, /)\n"
"--\n"
"\n"
"Write string s to stream.\n"
"\n"
"Return the number of characters written\n"
"(which is always equal to the length of the string).");

#define _IO__TEXTIOBASE_WRITE_METHODDEF    \
    {"write", _PyCFunction_CAST(_io__TextIOBase_write), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__TextIOBase_write__doc__},

static TyObject *
_io__TextIOBase_write_impl(TyObject *self, TyTypeObject *cls,
                           const char *Py_UNUSED(s));

static TyObject *
_io__TextIOBase_write(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "write",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    const char *s;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("write", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t s_length;
    s = TyUnicode_AsUTF8AndSize(args[0], &s_length);
    if (s == NULL) {
        goto exit;
    }
    if (strlen(s) != (size_t)s_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = _io__TextIOBase_write_impl(self, cls, s);

exit:
    return return_value;
}

TyDoc_STRVAR(_io__TextIOBase_encoding__doc__,
"Encoding of the text stream.\n"
"\n"
"Subclasses should override.");
#if defined(_io__TextIOBase_encoding_DOCSTR)
#   undef _io__TextIOBase_encoding_DOCSTR
#endif
#define _io__TextIOBase_encoding_DOCSTR _io__TextIOBase_encoding__doc__

#if !defined(_io__TextIOBase_encoding_DOCSTR)
#  define _io__TextIOBase_encoding_DOCSTR NULL
#endif
#if defined(_IO__TEXTIOBASE_ENCODING_GETSETDEF)
#  undef _IO__TEXTIOBASE_ENCODING_GETSETDEF
#  define _IO__TEXTIOBASE_ENCODING_GETSETDEF {"encoding", (getter)_io__TextIOBase_encoding_get, (setter)_io__TextIOBase_encoding_set, _io__TextIOBase_encoding_DOCSTR},
#else
#  define _IO__TEXTIOBASE_ENCODING_GETSETDEF {"encoding", (getter)_io__TextIOBase_encoding_get, NULL, _io__TextIOBase_encoding_DOCSTR},
#endif

static TyObject *
_io__TextIOBase_encoding_get_impl(TyObject *self);

static TyObject *
_io__TextIOBase_encoding_get(TyObject *self, void *Py_UNUSED(context))
{
    return _io__TextIOBase_encoding_get_impl(self);
}

TyDoc_STRVAR(_io__TextIOBase_newlines__doc__,
"Line endings translated so far.\n"
"\n"
"Only line endings translated during reading are considered.\n"
"\n"
"Subclasses should override.");
#if defined(_io__TextIOBase_newlines_DOCSTR)
#   undef _io__TextIOBase_newlines_DOCSTR
#endif
#define _io__TextIOBase_newlines_DOCSTR _io__TextIOBase_newlines__doc__

#if !defined(_io__TextIOBase_newlines_DOCSTR)
#  define _io__TextIOBase_newlines_DOCSTR NULL
#endif
#if defined(_IO__TEXTIOBASE_NEWLINES_GETSETDEF)
#  undef _IO__TEXTIOBASE_NEWLINES_GETSETDEF
#  define _IO__TEXTIOBASE_NEWLINES_GETSETDEF {"newlines", (getter)_io__TextIOBase_newlines_get, (setter)_io__TextIOBase_newlines_set, _io__TextIOBase_newlines_DOCSTR},
#else
#  define _IO__TEXTIOBASE_NEWLINES_GETSETDEF {"newlines", (getter)_io__TextIOBase_newlines_get, NULL, _io__TextIOBase_newlines_DOCSTR},
#endif

static TyObject *
_io__TextIOBase_newlines_get_impl(TyObject *self);

static TyObject *
_io__TextIOBase_newlines_get(TyObject *self, void *Py_UNUSED(context))
{
    return _io__TextIOBase_newlines_get_impl(self);
}

TyDoc_STRVAR(_io__TextIOBase_errors__doc__,
"The error setting of the decoder or encoder.\n"
"\n"
"Subclasses should override.");
#if defined(_io__TextIOBase_errors_DOCSTR)
#   undef _io__TextIOBase_errors_DOCSTR
#endif
#define _io__TextIOBase_errors_DOCSTR _io__TextIOBase_errors__doc__

#if !defined(_io__TextIOBase_errors_DOCSTR)
#  define _io__TextIOBase_errors_DOCSTR NULL
#endif
#if defined(_IO__TEXTIOBASE_ERRORS_GETSETDEF)
#  undef _IO__TEXTIOBASE_ERRORS_GETSETDEF
#  define _IO__TEXTIOBASE_ERRORS_GETSETDEF {"errors", (getter)_io__TextIOBase_errors_get, (setter)_io__TextIOBase_errors_set, _io__TextIOBase_errors_DOCSTR},
#else
#  define _IO__TEXTIOBASE_ERRORS_GETSETDEF {"errors", (getter)_io__TextIOBase_errors_get, NULL, _io__TextIOBase_errors_DOCSTR},
#endif

static TyObject *
_io__TextIOBase_errors_get_impl(TyObject *self);

static TyObject *
_io__TextIOBase_errors_get(TyObject *self, void *Py_UNUSED(context))
{
    return _io__TextIOBase_errors_get_impl(self);
}

TyDoc_STRVAR(_io_IncrementalNewlineDecoder___init____doc__,
"IncrementalNewlineDecoder(decoder, translate, errors=\'strict\')\n"
"--\n"
"\n"
"Codec used when reading a file in universal newlines mode.\n"
"\n"
"It wraps another incremental decoder, translating \\r\\n and \\r into \\n.\n"
"It also records the types of newlines encountered.  When used with\n"
"translate=False, it ensures that the newline sequence is returned in\n"
"one piece. When used with decoder=None, it expects unicode strings as\n"
"decode input and translates newlines without first invoking an external\n"
"decoder.");

static int
_io_IncrementalNewlineDecoder___init___impl(nldecoder_object *self,
                                            TyObject *decoder, int translate,
                                            TyObject *errors);

static int
_io_IncrementalNewlineDecoder___init__(TyObject *self, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(decoder), &_Ty_ID(translate), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"decoder", "translate", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "IncrementalNewlineDecoder",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 2;
    TyObject *decoder;
    int translate;
    TyObject *errors = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    decoder = fastargs[0];
    translate = PyObject_IsTrue(fastargs[1]);
    if (translate < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    errors = fastargs[2];
skip_optional_pos:
    return_value = _io_IncrementalNewlineDecoder___init___impl((nldecoder_object *)self, decoder, translate, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_IncrementalNewlineDecoder_decode__doc__,
"decode($self, /, input, final=False)\n"
"--\n"
"\n");

#define _IO_INCREMENTALNEWLINEDECODER_DECODE_METHODDEF    \
    {"decode", _PyCFunction_CAST(_io_IncrementalNewlineDecoder_decode), METH_FASTCALL|METH_KEYWORDS, _io_IncrementalNewlineDecoder_decode__doc__},

static TyObject *
_io_IncrementalNewlineDecoder_decode_impl(nldecoder_object *self,
                                          TyObject *input, int final);

static TyObject *
_io_IncrementalNewlineDecoder_decode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(input), &_Ty_ID(final), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"input", "final", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "decode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *input;
    int final = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    input = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    final = PyObject_IsTrue(args[1]);
    if (final < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = _io_IncrementalNewlineDecoder_decode_impl((nldecoder_object *)self, input, final);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_IncrementalNewlineDecoder_getstate__doc__,
"getstate($self, /)\n"
"--\n"
"\n");

#define _IO_INCREMENTALNEWLINEDECODER_GETSTATE_METHODDEF    \
    {"getstate", (PyCFunction)_io_IncrementalNewlineDecoder_getstate, METH_NOARGS, _io_IncrementalNewlineDecoder_getstate__doc__},

static TyObject *
_io_IncrementalNewlineDecoder_getstate_impl(nldecoder_object *self);

static TyObject *
_io_IncrementalNewlineDecoder_getstate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_IncrementalNewlineDecoder_getstate_impl((nldecoder_object *)self);
}

TyDoc_STRVAR(_io_IncrementalNewlineDecoder_setstate__doc__,
"setstate($self, state, /)\n"
"--\n"
"\n");

#define _IO_INCREMENTALNEWLINEDECODER_SETSTATE_METHODDEF    \
    {"setstate", (PyCFunction)_io_IncrementalNewlineDecoder_setstate, METH_O, _io_IncrementalNewlineDecoder_setstate__doc__},

static TyObject *
_io_IncrementalNewlineDecoder_setstate_impl(nldecoder_object *self,
                                            TyObject *state);

static TyObject *
_io_IncrementalNewlineDecoder_setstate(TyObject *self, TyObject *state)
{
    TyObject *return_value = NULL;

    return_value = _io_IncrementalNewlineDecoder_setstate_impl((nldecoder_object *)self, state);

    return return_value;
}

TyDoc_STRVAR(_io_IncrementalNewlineDecoder_reset__doc__,
"reset($self, /)\n"
"--\n"
"\n");

#define _IO_INCREMENTALNEWLINEDECODER_RESET_METHODDEF    \
    {"reset", (PyCFunction)_io_IncrementalNewlineDecoder_reset, METH_NOARGS, _io_IncrementalNewlineDecoder_reset__doc__},

static TyObject *
_io_IncrementalNewlineDecoder_reset_impl(nldecoder_object *self);

static TyObject *
_io_IncrementalNewlineDecoder_reset(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_IncrementalNewlineDecoder_reset_impl((nldecoder_object *)self);
}

TyDoc_STRVAR(_io_TextIOWrapper___init____doc__,
"TextIOWrapper(buffer, encoding=None, errors=None, newline=None,\n"
"              line_buffering=False, write_through=False)\n"
"--\n"
"\n"
"Character and line based layer over a BufferedIOBase object, buffer.\n"
"\n"
"encoding gives the name of the encoding that the stream will be\n"
"decoded or encoded with. It defaults to locale.getencoding().\n"
"\n"
"errors determines the strictness of encoding and decoding (see\n"
"help(codecs.Codec) or the documentation for codecs.register) and\n"
"defaults to \"strict\".\n"
"\n"
"newline controls how line endings are handled. It can be None, \'\',\n"
"\'\\n\', \'\\r\', and \'\\r\\n\'.  It works as follows:\n"
"\n"
"* On input, if newline is None, universal newlines mode is\n"
"  enabled. Lines in the input can end in \'\\n\', \'\\r\', or \'\\r\\n\', and\n"
"  these are translated into \'\\n\' before being returned to the\n"
"  caller. If it is \'\', universal newline mode is enabled, but line\n"
"  endings are returned to the caller untranslated. If it has any of\n"
"  the other legal values, input lines are only terminated by the given\n"
"  string, and the line ending is returned to the caller untranslated.\n"
"\n"
"* On output, if newline is None, any \'\\n\' characters written are\n"
"  translated to the system default line separator, os.linesep. If\n"
"  newline is \'\' or \'\\n\', no translation takes place. If newline is any\n"
"  of the other legal values, any \'\\n\' characters written are translated\n"
"  to the given string.\n"
"\n"
"If line_buffering is True, a call to flush is implied when a call to\n"
"write contains a newline character.");

static int
_io_TextIOWrapper___init___impl(textio *self, TyObject *buffer,
                                const char *encoding, TyObject *errors,
                                const char *newline, int line_buffering,
                                int write_through);

static int
_io_TextIOWrapper___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { &_Ty_ID(buffer), &_Ty_ID(encoding), &_Ty_ID(errors), &_Ty_ID(newline), &_Ty_ID(line_buffering), &_Ty_ID(write_through), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"buffer", "encoding", "errors", "newline", "line_buffering", "write_through", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "TextIOWrapper",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *buffer;
    const char *encoding = NULL;
    TyObject *errors = Ty_None;
    const char *newline = NULL;
    int line_buffering = 0;
    int write_through = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 6, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    buffer = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        if (fastargs[1] == Ty_None) {
            encoding = NULL;
        }
        else if (TyUnicode_Check(fastargs[1])) {
            Ty_ssize_t encoding_length;
            encoding = TyUnicode_AsUTF8AndSize(fastargs[1], &encoding_length);
            if (encoding == NULL) {
                goto exit;
            }
            if (strlen(encoding) != (size_t)encoding_length) {
                TyErr_SetString(TyExc_ValueError, "embedded null character");
                goto exit;
            }
        }
        else {
            _TyArg_BadArgument("TextIOWrapper", "argument 'encoding'", "str or None", fastargs[1]);
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        errors = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[3]) {
        if (fastargs[3] == Ty_None) {
            newline = NULL;
        }
        else if (TyUnicode_Check(fastargs[3])) {
            Ty_ssize_t newline_length;
            newline = TyUnicode_AsUTF8AndSize(fastargs[3], &newline_length);
            if (newline == NULL) {
                goto exit;
            }
            if (strlen(newline) != (size_t)newline_length) {
                TyErr_SetString(TyExc_ValueError, "embedded null character");
                goto exit;
            }
        }
        else {
            _TyArg_BadArgument("TextIOWrapper", "argument 'newline'", "str or None", fastargs[3]);
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[4]) {
        line_buffering = PyObject_IsTrue(fastargs[4]);
        if (line_buffering < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    write_through = PyObject_IsTrue(fastargs[5]);
    if (write_through < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = _io_TextIOWrapper___init___impl((textio *)self, buffer, encoding, errors, newline, line_buffering, write_through);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_reconfigure__doc__,
"reconfigure($self, /, *, encoding=None, errors=None, newline=None,\n"
"            line_buffering=None, write_through=None)\n"
"--\n"
"\n"
"Reconfigure the text stream with new parameters.\n"
"\n"
"This also does an implicit stream flush.");

#define _IO_TEXTIOWRAPPER_RECONFIGURE_METHODDEF    \
    {"reconfigure", _PyCFunction_CAST(_io_TextIOWrapper_reconfigure), METH_FASTCALL|METH_KEYWORDS, _io_TextIOWrapper_reconfigure__doc__},

static TyObject *
_io_TextIOWrapper_reconfigure_impl(textio *self, TyObject *encoding,
                                   TyObject *errors, TyObject *newline_obj,
                                   TyObject *line_buffering_obj,
                                   TyObject *write_through_obj);

static TyObject *
_io_TextIOWrapper_reconfigure(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(encoding), &_Ty_ID(errors), &_Ty_ID(newline), &_Ty_ID(line_buffering), &_Ty_ID(write_through), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"encoding", "errors", "newline", "line_buffering", "write_through", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "reconfigure",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *encoding = Ty_None;
    TyObject *errors = Ty_None;
    TyObject *newline_obj = NULL;
    TyObject *line_buffering_obj = Ty_None;
    TyObject *write_through_obj = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[0]) {
        encoding = args[0];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[1]) {
        errors = args[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        newline_obj = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        line_buffering_obj = args[3];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    write_through_obj = args[4];
skip_optional_kwonly:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_reconfigure_impl((textio *)self, encoding, errors, newline_obj, line_buffering_obj, write_through_obj);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_detach__doc__,
"detach($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_DETACH_METHODDEF    \
    {"detach", (PyCFunction)_io_TextIOWrapper_detach, METH_NOARGS, _io_TextIOWrapper_detach__doc__},

static TyObject *
_io_TextIOWrapper_detach_impl(textio *self);

static TyObject *
_io_TextIOWrapper_detach(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_detach_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_write__doc__,
"write($self, text, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_WRITE_METHODDEF    \
    {"write", (PyCFunction)_io_TextIOWrapper_write, METH_O, _io_TextIOWrapper_write__doc__},

static TyObject *
_io_TextIOWrapper_write_impl(textio *self, TyObject *text);

static TyObject *
_io_TextIOWrapper_write(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *text;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("write", "argument", "str", arg);
        goto exit;
    }
    text = arg;
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_write_impl((textio *)self, text);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_read__doc__,
"read($self, size=-1, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_io_TextIOWrapper_read), METH_FASTCALL, _io_TextIOWrapper_read__doc__},

static TyObject *
_io_TextIOWrapper_read_impl(textio *self, Ty_ssize_t n);

static TyObject *
_io_TextIOWrapper_read(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t n = -1;

    if (!_TyArg_CheckPositional("read", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &n)) {
        goto exit;
    }
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_read_impl((textio *)self, n);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_readline__doc__,
"readline($self, size=-1, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_READLINE_METHODDEF    \
    {"readline", _PyCFunction_CAST(_io_TextIOWrapper_readline), METH_FASTCALL, _io_TextIOWrapper_readline__doc__},

static TyObject *
_io_TextIOWrapper_readline_impl(textio *self, Ty_ssize_t size);

static TyObject *
_io_TextIOWrapper_readline(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = -1;

    if (!_TyArg_CheckPositional("readline", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
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
        size = ival;
    }
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_readline_impl((textio *)self, size);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_seek__doc__,
"seek($self, cookie, whence=os.SEEK_SET, /)\n"
"--\n"
"\n"
"Set the stream position, and return the new stream position.\n"
"\n"
"  cookie\n"
"    Zero or an opaque number returned by tell().\n"
"  whence\n"
"    The relative position to seek from.\n"
"\n"
"Four operations are supported, given by the following argument\n"
"combinations:\n"
"\n"
"- seek(0, SEEK_SET): Rewind to the start of the stream.\n"
"- seek(cookie, SEEK_SET): Restore a previous position;\n"
"  \'cookie\' must be a number returned by tell().\n"
"- seek(0, SEEK_END): Fast-forward to the end of the stream.\n"
"- seek(0, SEEK_CUR): Leave the current stream position unchanged.\n"
"\n"
"Any other argument combinations are invalid,\n"
"and may raise exceptions.");

#define _IO_TEXTIOWRAPPER_SEEK_METHODDEF    \
    {"seek", _PyCFunction_CAST(_io_TextIOWrapper_seek), METH_FASTCALL, _io_TextIOWrapper_seek__doc__},

static TyObject *
_io_TextIOWrapper_seek_impl(textio *self, TyObject *cookieObj, int whence);

static TyObject *
_io_TextIOWrapper_seek(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *cookieObj;
    int whence = 0;

    if (!_TyArg_CheckPositional("seek", nargs, 1, 2)) {
        goto exit;
    }
    cookieObj = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    whence = TyLong_AsInt(args[1]);
    if (whence == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_seek_impl((textio *)self, cookieObj, whence);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_tell__doc__,
"tell($self, /)\n"
"--\n"
"\n"
"Return the stream position as an opaque number.\n"
"\n"
"The return value of tell() can be given as input to seek(), to restore a\n"
"previous stream position.");

#define _IO_TEXTIOWRAPPER_TELL_METHODDEF    \
    {"tell", (PyCFunction)_io_TextIOWrapper_tell, METH_NOARGS, _io_TextIOWrapper_tell__doc__},

static TyObject *
_io_TextIOWrapper_tell_impl(textio *self);

static TyObject *
_io_TextIOWrapper_tell(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_tell_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_truncate__doc__,
"truncate($self, pos=None, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_TRUNCATE_METHODDEF    \
    {"truncate", _PyCFunction_CAST(_io_TextIOWrapper_truncate), METH_FASTCALL, _io_TextIOWrapper_truncate__doc__},

static TyObject *
_io_TextIOWrapper_truncate_impl(textio *self, TyObject *pos);

static TyObject *
_io_TextIOWrapper_truncate(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *pos = Ty_None;

    if (!_TyArg_CheckPositional("truncate", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    pos = args[0];
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_truncate_impl((textio *)self, pos);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_fileno__doc__,
"fileno($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_FILENO_METHODDEF    \
    {"fileno", (PyCFunction)_io_TextIOWrapper_fileno, METH_NOARGS, _io_TextIOWrapper_fileno__doc__},

static TyObject *
_io_TextIOWrapper_fileno_impl(textio *self);

static TyObject *
_io_TextIOWrapper_fileno(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_fileno_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_seekable__doc__,
"seekable($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_SEEKABLE_METHODDEF    \
    {"seekable", (PyCFunction)_io_TextIOWrapper_seekable, METH_NOARGS, _io_TextIOWrapper_seekable__doc__},

static TyObject *
_io_TextIOWrapper_seekable_impl(textio *self);

static TyObject *
_io_TextIOWrapper_seekable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_seekable_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_readable__doc__,
"readable($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_READABLE_METHODDEF    \
    {"readable", (PyCFunction)_io_TextIOWrapper_readable, METH_NOARGS, _io_TextIOWrapper_readable__doc__},

static TyObject *
_io_TextIOWrapper_readable_impl(textio *self);

static TyObject *
_io_TextIOWrapper_readable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_readable_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_writable__doc__,
"writable($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_WRITABLE_METHODDEF    \
    {"writable", (PyCFunction)_io_TextIOWrapper_writable, METH_NOARGS, _io_TextIOWrapper_writable__doc__},

static TyObject *
_io_TextIOWrapper_writable_impl(textio *self);

static TyObject *
_io_TextIOWrapper_writable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_writable_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_isatty__doc__,
"isatty($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_ISATTY_METHODDEF    \
    {"isatty", (PyCFunction)_io_TextIOWrapper_isatty, METH_NOARGS, _io_TextIOWrapper_isatty__doc__},

static TyObject *
_io_TextIOWrapper_isatty_impl(textio *self);

static TyObject *
_io_TextIOWrapper_isatty(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_isatty_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_flush__doc__,
"flush($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_FLUSH_METHODDEF    \
    {"flush", (PyCFunction)_io_TextIOWrapper_flush, METH_NOARGS, _io_TextIOWrapper_flush__doc__},

static TyObject *
_io_TextIOWrapper_flush_impl(textio *self);

static TyObject *
_io_TextIOWrapper_flush(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_flush_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_TextIOWrapper_close__doc__,
"close($self, /)\n"
"--\n"
"\n");

#define _IO_TEXTIOWRAPPER_CLOSE_METHODDEF    \
    {"close", (PyCFunction)_io_TextIOWrapper_close, METH_NOARGS, _io_TextIOWrapper_close__doc__},

static TyObject *
_io_TextIOWrapper_close_impl(textio *self);

static TyObject *
_io_TextIOWrapper_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_close_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper_name_DOCSTR)
#  define _io_TextIOWrapper_name_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER_NAME_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER_NAME_GETSETDEF
#  define _IO_TEXTIOWRAPPER_NAME_GETSETDEF {"name", (getter)_io_TextIOWrapper_name_get, (setter)_io_TextIOWrapper_name_set, _io_TextIOWrapper_name_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER_NAME_GETSETDEF {"name", (getter)_io_TextIOWrapper_name_get, NULL, _io_TextIOWrapper_name_DOCSTR},
#endif

static TyObject *
_io_TextIOWrapper_name_get_impl(textio *self);

static TyObject *
_io_TextIOWrapper_name_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_name_get_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper_closed_DOCSTR)
#  define _io_TextIOWrapper_closed_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER_CLOSED_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER_CLOSED_GETSETDEF
#  define _IO_TEXTIOWRAPPER_CLOSED_GETSETDEF {"closed", (getter)_io_TextIOWrapper_closed_get, (setter)_io_TextIOWrapper_closed_set, _io_TextIOWrapper_closed_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER_CLOSED_GETSETDEF {"closed", (getter)_io_TextIOWrapper_closed_get, NULL, _io_TextIOWrapper_closed_DOCSTR},
#endif

static TyObject *
_io_TextIOWrapper_closed_get_impl(textio *self);

static TyObject *
_io_TextIOWrapper_closed_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_closed_get_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper_newlines_DOCSTR)
#  define _io_TextIOWrapper_newlines_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER_NEWLINES_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER_NEWLINES_GETSETDEF
#  define _IO_TEXTIOWRAPPER_NEWLINES_GETSETDEF {"newlines", (getter)_io_TextIOWrapper_newlines_get, (setter)_io_TextIOWrapper_newlines_set, _io_TextIOWrapper_newlines_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER_NEWLINES_GETSETDEF {"newlines", (getter)_io_TextIOWrapper_newlines_get, NULL, _io_TextIOWrapper_newlines_DOCSTR},
#endif

static TyObject *
_io_TextIOWrapper_newlines_get_impl(textio *self);

static TyObject *
_io_TextIOWrapper_newlines_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_newlines_get_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper_errors_DOCSTR)
#  define _io_TextIOWrapper_errors_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER_ERRORS_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER_ERRORS_GETSETDEF
#  define _IO_TEXTIOWRAPPER_ERRORS_GETSETDEF {"errors", (getter)_io_TextIOWrapper_errors_get, (setter)_io_TextIOWrapper_errors_set, _io_TextIOWrapper_errors_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER_ERRORS_GETSETDEF {"errors", (getter)_io_TextIOWrapper_errors_get, NULL, _io_TextIOWrapper_errors_DOCSTR},
#endif

static TyObject *
_io_TextIOWrapper_errors_get_impl(textio *self);

static TyObject *
_io_TextIOWrapper_errors_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper_errors_get_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper__CHUNK_SIZE_DOCSTR)
#  define _io_TextIOWrapper__CHUNK_SIZE_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF
#  define _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF {"_CHUNK_SIZE", (getter)_io_TextIOWrapper__CHUNK_SIZE_get, (setter)_io_TextIOWrapper__CHUNK_SIZE_set, _io_TextIOWrapper__CHUNK_SIZE_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF {"_CHUNK_SIZE", (getter)_io_TextIOWrapper__CHUNK_SIZE_get, NULL, _io_TextIOWrapper__CHUNK_SIZE_DOCSTR},
#endif

static TyObject *
_io_TextIOWrapper__CHUNK_SIZE_get_impl(textio *self);

static TyObject *
_io_TextIOWrapper__CHUNK_SIZE_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper__CHUNK_SIZE_get_impl((textio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_TextIOWrapper__CHUNK_SIZE_DOCSTR)
#  define _io_TextIOWrapper__CHUNK_SIZE_DOCSTR NULL
#endif
#if defined(_IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF)
#  undef _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF
#  define _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF {"_CHUNK_SIZE", (getter)_io_TextIOWrapper__CHUNK_SIZE_get, (setter)_io_TextIOWrapper__CHUNK_SIZE_set, _io_TextIOWrapper__CHUNK_SIZE_DOCSTR},
#else
#  define _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF {"_CHUNK_SIZE", NULL, (setter)_io_TextIOWrapper__CHUNK_SIZE_set, NULL},
#endif

static int
_io_TextIOWrapper__CHUNK_SIZE_set_impl(textio *self, TyObject *value);

static int
_io_TextIOWrapper__CHUNK_SIZE_set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_TextIOWrapper__CHUNK_SIZE_set_impl((textio *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}
/*[clinic end generated code: output=30404271a1151056 input=a9049054013a1b77]*/
