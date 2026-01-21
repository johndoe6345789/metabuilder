/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_multibytecodec_MultibyteCodec_encode__doc__,
"encode($self, /, input, errors=None)\n"
"--\n"
"\n"
"Return an encoded string version of \'input\'.\n"
"\n"
"\'errors\' may be given to set a different error handling scheme. Default is\n"
"\'strict\' meaning that encoding errors raise a UnicodeEncodeError. Other possible\n"
"values are \'ignore\', \'replace\' and \'xmlcharrefreplace\' as well as any other name\n"
"registered with codecs.register_error that can handle UnicodeEncodeErrors.");

#define _MULTIBYTECODEC_MULTIBYTECODEC_ENCODE_METHODDEF    \
    {"encode", _PyCFunction_CAST(_multibytecodec_MultibyteCodec_encode), METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteCodec_encode__doc__},

static TyObject *
_multibytecodec_MultibyteCodec_encode_impl(MultibyteCodecObject *self,
                                           TyObject *input,
                                           const char *errors);

static TyObject *
_multibytecodec_MultibyteCodec_encode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(input), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"input", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "encode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *input;
    const char *errors = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    input = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1] == Ty_None) {
        errors = NULL;
    }
    else if (TyUnicode_Check(args[1])) {
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[1], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("encode", "argument 'errors'", "str or None", args[1]);
        goto exit;
    }
skip_optional_pos:
    return_value = _multibytecodec_MultibyteCodec_encode_impl((MultibyteCodecObject *)self, input, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteCodec_decode__doc__,
"decode($self, /, input, errors=None)\n"
"--\n"
"\n"
"Decodes \'input\'.\n"
"\n"
"\'errors\' may be given to set a different error handling scheme. Default is\n"
"\'strict\' meaning that encoding errors raise a UnicodeDecodeError. Other possible\n"
"values are \'ignore\' and \'replace\' as well as any other name registered with\n"
"codecs.register_error that is able to handle UnicodeDecodeErrors.\"");

#define _MULTIBYTECODEC_MULTIBYTECODEC_DECODE_METHODDEF    \
    {"decode", _PyCFunction_CAST(_multibytecodec_MultibyteCodec_decode), METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteCodec_decode__doc__},

static TyObject *
_multibytecodec_MultibyteCodec_decode_impl(MultibyteCodecObject *self,
                                           Ty_buffer *input,
                                           const char *errors);

static TyObject *
_multibytecodec_MultibyteCodec_decode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(input), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"input", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "decode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer input = {NULL, NULL};
    const char *errors = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &input, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1] == Ty_None) {
        errors = NULL;
    }
    else if (TyUnicode_Check(args[1])) {
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[1], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("decode", "argument 'errors'", "str or None", args[1]);
        goto exit;
    }
skip_optional_pos:
    return_value = _multibytecodec_MultibyteCodec_decode_impl((MultibyteCodecObject *)self, &input, errors);

exit:
    /* Cleanup for input */
    if (input.obj) {
       PyBuffer_Release(&input);
    }

    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalEncoder_encode__doc__,
"encode($self, /, input, final=False)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_ENCODE_METHODDEF    \
    {"encode", _PyCFunction_CAST(_multibytecodec_MultibyteIncrementalEncoder_encode), METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteIncrementalEncoder_encode__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_encode_impl(MultibyteIncrementalEncoderObject *self,
                                                        TyObject *input,
                                                        int final);

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_encode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "encode",
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
    return_value = _multibytecodec_MultibyteIncrementalEncoder_encode_impl((MultibyteIncrementalEncoderObject *)self, input, final);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalEncoder_getstate__doc__,
"getstate($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_GETSTATE_METHODDEF    \
    {"getstate", (PyCFunction)_multibytecodec_MultibyteIncrementalEncoder_getstate, METH_NOARGS, _multibytecodec_MultibyteIncrementalEncoder_getstate__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_getstate_impl(MultibyteIncrementalEncoderObject *self);

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_getstate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multibytecodec_MultibyteIncrementalEncoder_getstate_impl((MultibyteIncrementalEncoderObject *)self);
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalEncoder_setstate__doc__,
"setstate($self, state, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_SETSTATE_METHODDEF    \
    {"setstate", (PyCFunction)_multibytecodec_MultibyteIncrementalEncoder_setstate, METH_O, _multibytecodec_MultibyteIncrementalEncoder_setstate__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_setstate_impl(MultibyteIncrementalEncoderObject *self,
                                                          PyLongObject *statelong);

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_setstate(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    PyLongObject *statelong;

    if (!TyLong_Check(arg)) {
        _TyArg_BadArgument("setstate", "argument", "int", arg);
        goto exit;
    }
    statelong = (PyLongObject *)arg;
    return_value = _multibytecodec_MultibyteIncrementalEncoder_setstate_impl((MultibyteIncrementalEncoderObject *)self, statelong);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalEncoder_reset__doc__,
"reset($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_RESET_METHODDEF    \
    {"reset", (PyCFunction)_multibytecodec_MultibyteIncrementalEncoder_reset, METH_NOARGS, _multibytecodec_MultibyteIncrementalEncoder_reset__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_reset_impl(MultibyteIncrementalEncoderObject *self);

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_reset(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multibytecodec_MultibyteIncrementalEncoder_reset_impl((MultibyteIncrementalEncoderObject *)self);
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalDecoder_decode__doc__,
"decode($self, /, input, final=False)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_DECODE_METHODDEF    \
    {"decode", _PyCFunction_CAST(_multibytecodec_MultibyteIncrementalDecoder_decode), METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteIncrementalDecoder_decode__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_decode_impl(MultibyteIncrementalDecoderObject *self,
                                                        Ty_buffer *input,
                                                        int final);

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_decode(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    Ty_buffer input = {NULL, NULL};
    int final = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &input, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    final = PyObject_IsTrue(args[1]);
    if (final < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = _multibytecodec_MultibyteIncrementalDecoder_decode_impl((MultibyteIncrementalDecoderObject *)self, &input, final);

exit:
    /* Cleanup for input */
    if (input.obj) {
       PyBuffer_Release(&input);
    }

    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalDecoder_getstate__doc__,
"getstate($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_GETSTATE_METHODDEF    \
    {"getstate", (PyCFunction)_multibytecodec_MultibyteIncrementalDecoder_getstate, METH_NOARGS, _multibytecodec_MultibyteIncrementalDecoder_getstate__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_getstate_impl(MultibyteIncrementalDecoderObject *self);

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_getstate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multibytecodec_MultibyteIncrementalDecoder_getstate_impl((MultibyteIncrementalDecoderObject *)self);
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalDecoder_setstate__doc__,
"setstate($self, state, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_SETSTATE_METHODDEF    \
    {"setstate", (PyCFunction)_multibytecodec_MultibyteIncrementalDecoder_setstate, METH_O, _multibytecodec_MultibyteIncrementalDecoder_setstate__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_setstate_impl(MultibyteIncrementalDecoderObject *self,
                                                          TyObject *state);

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_setstate(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *state;

    if (!TyTuple_Check(arg)) {
        _TyArg_BadArgument("setstate", "argument", "tuple", arg);
        goto exit;
    }
    state = arg;
    return_value = _multibytecodec_MultibyteIncrementalDecoder_setstate_impl((MultibyteIncrementalDecoderObject *)self, state);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteIncrementalDecoder_reset__doc__,
"reset($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_RESET_METHODDEF    \
    {"reset", (PyCFunction)_multibytecodec_MultibyteIncrementalDecoder_reset, METH_NOARGS, _multibytecodec_MultibyteIncrementalDecoder_reset__doc__},

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_reset_impl(MultibyteIncrementalDecoderObject *self);

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_reset(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multibytecodec_MultibyteIncrementalDecoder_reset_impl((MultibyteIncrementalDecoderObject *)self);
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamReader_read__doc__,
"read($self, sizeobj=None, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_multibytecodec_MultibyteStreamReader_read), METH_FASTCALL, _multibytecodec_MultibyteStreamReader_read__doc__},

static TyObject *
_multibytecodec_MultibyteStreamReader_read_impl(MultibyteStreamReaderObject *self,
                                                TyObject *sizeobj);

static TyObject *
_multibytecodec_MultibyteStreamReader_read(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sizeobj = Ty_None;

    if (!_TyArg_CheckPositional("read", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    sizeobj = args[0];
skip_optional:
    return_value = _multibytecodec_MultibyteStreamReader_read_impl((MultibyteStreamReaderObject *)self, sizeobj);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamReader_readline__doc__,
"readline($self, sizeobj=None, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READLINE_METHODDEF    \
    {"readline", _PyCFunction_CAST(_multibytecodec_MultibyteStreamReader_readline), METH_FASTCALL, _multibytecodec_MultibyteStreamReader_readline__doc__},

static TyObject *
_multibytecodec_MultibyteStreamReader_readline_impl(MultibyteStreamReaderObject *self,
                                                    TyObject *sizeobj);

static TyObject *
_multibytecodec_MultibyteStreamReader_readline(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sizeobj = Ty_None;

    if (!_TyArg_CheckPositional("readline", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    sizeobj = args[0];
skip_optional:
    return_value = _multibytecodec_MultibyteStreamReader_readline_impl((MultibyteStreamReaderObject *)self, sizeobj);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamReader_readlines__doc__,
"readlines($self, sizehintobj=None, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READLINES_METHODDEF    \
    {"readlines", _PyCFunction_CAST(_multibytecodec_MultibyteStreamReader_readlines), METH_FASTCALL, _multibytecodec_MultibyteStreamReader_readlines__doc__},

static TyObject *
_multibytecodec_MultibyteStreamReader_readlines_impl(MultibyteStreamReaderObject *self,
                                                     TyObject *sizehintobj);

static TyObject *
_multibytecodec_MultibyteStreamReader_readlines(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sizehintobj = Ty_None;

    if (!_TyArg_CheckPositional("readlines", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    sizehintobj = args[0];
skip_optional:
    return_value = _multibytecodec_MultibyteStreamReader_readlines_impl((MultibyteStreamReaderObject *)self, sizehintobj);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamReader_reset__doc__,
"reset($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMREADER_RESET_METHODDEF    \
    {"reset", (PyCFunction)_multibytecodec_MultibyteStreamReader_reset, METH_NOARGS, _multibytecodec_MultibyteStreamReader_reset__doc__},

static TyObject *
_multibytecodec_MultibyteStreamReader_reset_impl(MultibyteStreamReaderObject *self);

static TyObject *
_multibytecodec_MultibyteStreamReader_reset(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multibytecodec_MultibyteStreamReader_reset_impl((MultibyteStreamReaderObject *)self);
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamWriter_write__doc__,
"write($self, strobj, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_WRITE_METHODDEF    \
    {"write", _PyCFunction_CAST(_multibytecodec_MultibyteStreamWriter_write), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteStreamWriter_write__doc__},

static TyObject *
_multibytecodec_MultibyteStreamWriter_write_impl(MultibyteStreamWriterObject *self,
                                                 TyTypeObject *cls,
                                                 TyObject *strobj);

static TyObject *
_multibytecodec_MultibyteStreamWriter_write(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    TyObject *strobj;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    strobj = args[0];
    return_value = _multibytecodec_MultibyteStreamWriter_write_impl((MultibyteStreamWriterObject *)self, cls, strobj);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamWriter_writelines__doc__,
"writelines($self, lines, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_WRITELINES_METHODDEF    \
    {"writelines", _PyCFunction_CAST(_multibytecodec_MultibyteStreamWriter_writelines), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteStreamWriter_writelines__doc__},

static TyObject *
_multibytecodec_MultibyteStreamWriter_writelines_impl(MultibyteStreamWriterObject *self,
                                                      TyTypeObject *cls,
                                                      TyObject *lines);

static TyObject *
_multibytecodec_MultibyteStreamWriter_writelines(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "writelines",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *lines;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    lines = args[0];
    return_value = _multibytecodec_MultibyteStreamWriter_writelines_impl((MultibyteStreamWriterObject *)self, cls, lines);

exit:
    return return_value;
}

TyDoc_STRVAR(_multibytecodec_MultibyteStreamWriter_reset__doc__,
"reset($self, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_RESET_METHODDEF    \
    {"reset", _PyCFunction_CAST(_multibytecodec_MultibyteStreamWriter_reset), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _multibytecodec_MultibyteStreamWriter_reset__doc__},

static TyObject *
_multibytecodec_MultibyteStreamWriter_reset_impl(MultibyteStreamWriterObject *self,
                                                 TyTypeObject *cls);

static TyObject *
_multibytecodec_MultibyteStreamWriter_reset(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "reset() takes no arguments");
        return NULL;
    }
    return _multibytecodec_MultibyteStreamWriter_reset_impl((MultibyteStreamWriterObject *)self, cls);
}

TyDoc_STRVAR(_multibytecodec___create_codec__doc__,
"__create_codec($module, arg, /)\n"
"--\n"
"\n");

#define _MULTIBYTECODEC___CREATE_CODEC_METHODDEF    \
    {"__create_codec", (PyCFunction)_multibytecodec___create_codec, METH_O, _multibytecodec___create_codec__doc__},
/*[clinic end generated code: output=014f4f6bb9d29594 input=a9049054013a1b77]*/
