/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Py_BUILD_CORE) && !defined(Py_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_BadArgument()

TyDoc_STRVAR(_codecs_register__doc__,
"register($module, search_function, /)\n"
"--\n"
"\n"
"Register a codec search function.\n"
"\n"
"Search functions are expected to take one argument, the encoding name in\n"
"all lower case letters, and either return None, or a tuple of functions\n"
"(encoder, decoder, stream_reader, stream_writer) (or a CodecInfo object).");

#define _CODECS_REGISTER_METHODDEF    \
    {"register", (PyCFunction)_codecs_register, METH_O, _codecs_register__doc__},

TyDoc_STRVAR(_codecs_unregister__doc__,
"unregister($module, search_function, /)\n"
"--\n"
"\n"
"Unregister a codec search function and clear the registry\'s cache.\n"
"\n"
"If the search function is not registered, do nothing.");

#define _CODECS_UNREGISTER_METHODDEF    \
    {"unregister", (PyCFunction)_codecs_unregister, METH_O, _codecs_unregister__doc__},

TyDoc_STRVAR(_codecs_lookup__doc__,
"lookup($module, encoding, /)\n"
"--\n"
"\n"
"Looks up a codec tuple in the Python codec registry and returns a CodecInfo object.");

#define _CODECS_LOOKUP_METHODDEF    \
    {"lookup", (PyCFunction)_codecs_lookup, METH_O, _codecs_lookup__doc__},

static TyObject *
_codecs_lookup_impl(TyObject *module, const char *encoding);

static TyObject *
_codecs_lookup(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *encoding;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("lookup", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t encoding_length;
    encoding = TyUnicode_AsUTF8AndSize(arg, &encoding_length);
    if (encoding == NULL) {
        goto exit;
    }
    if (strlen(encoding) != (size_t)encoding_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = _codecs_lookup_impl(module, encoding);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_encode__doc__,
"encode($module, /, obj, encoding=\'utf-8\', errors=\'strict\')\n"
"--\n"
"\n"
"Encodes obj using the codec registered for encoding.\n"
"\n"
"The default encoding is \'utf-8\'.  errors may be given to set a\n"
"different error handling scheme.  Default is \'strict\' meaning that encoding\n"
"errors raise a ValueError.  Other possible values are \'ignore\', \'replace\'\n"
"and \'backslashreplace\' as well as any other name registered with\n"
"codecs.register_error that can handle ValueErrors.");

#define _CODECS_ENCODE_METHODDEF    \
    {"encode", _PyCFunction_CAST(_codecs_encode), METH_FASTCALL|METH_KEYWORDS, _codecs_encode__doc__},

static TyObject *
_codecs_encode_impl(TyObject *module, TyObject *obj, const char *encoding,
                    const char *errors);

static TyObject *
_codecs_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Py_BUILD_CORE) && !defined(Py_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(obj), &_Ty_ID(encoding), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Py_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Py_BUILD_CORE

    static const char * const _keywords[] = {"obj", "encoding", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "encode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *obj;
    const char *encoding = NULL;
    const char *errors = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    obj = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        if (!TyUnicode_Check(args[1])) {
            _TyArg_BadArgument("encode", "argument 'encoding'", "str", args[1]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(args[1], &encoding_length);
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
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("encode", "argument 'errors'", "str", args[2]);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(args[2], &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_pos:
    return_value = _codecs_encode_impl(module, obj, encoding, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_decode__doc__,
"decode($module, /, obj, encoding=\'utf-8\', errors=\'strict\')\n"
"--\n"
"\n"
"Decodes obj using the codec registered for encoding.\n"
"\n"
"Default encoding is \'utf-8\'.  errors may be given to set a\n"
"different error handling scheme.  Default is \'strict\' meaning that encoding\n"
"errors raise a ValueError.  Other possible values are \'ignore\', \'replace\'\n"
"and \'backslashreplace\' as well as any other name registered with\n"
"codecs.register_error that can handle ValueErrors.");

#define _CODECS_DECODE_METHODDEF    \
    {"decode", _PyCFunction_CAST(_codecs_decode), METH_FASTCALL|METH_KEYWORDS, _codecs_decode__doc__},

static TyObject *
_codecs_decode_impl(TyObject *module, TyObject *obj, const char *encoding,
                    const char *errors);

static TyObject *
_codecs_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Py_BUILD_CORE) && !defined(Py_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(obj), &_Ty_ID(encoding), &_Ty_ID(errors), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Py_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Py_BUILD_CORE

    static const char * const _keywords[] = {"obj", "encoding", "errors", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "decode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *obj;
    const char *encoding = NULL;
    const char *errors = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    obj = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        if (!TyUnicode_Check(args[1])) {
            _TyArg_BadArgument("decode", "argument 'encoding'", "str", args[1]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(args[1], &encoding_length);
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
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("decode", "argument 'errors'", "str", args[2]);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(args[2], &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_pos:
    return_value = _codecs_decode_impl(module, obj, encoding, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_escape_decode__doc__,
"escape_decode($module, data, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_ESCAPE_DECODE_METHODDEF    \
    {"escape_decode", _PyCFunction_CAST(_codecs_escape_decode), METH_FASTCALL, _codecs_escape_decode__doc__},

static TyObject *
_codecs_escape_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors);

static TyObject *
_codecs_escape_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("escape_decode", nargs, 1, 2)) {
        goto exit;
    }
    if (TyUnicode_Check(args[0])) {
        Ty_ssize_t len;
        const char *ptr = TyUnicode_AsUTF8AndSize(args[0], &len);
        if (ptr == NULL) {
            goto exit;
        }
        if (PyBuffer_FillInfo(&data, args[0], (void *)ptr, len, 1, PyBUF_SIMPLE) < 0) {
            goto exit;
        }
    }
    else { /* any bytes-like object */
        if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("escape_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_escape_decode_impl(module, &data, errors);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_escape_encode__doc__,
"escape_encode($module, data, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_ESCAPE_ENCODE_METHODDEF    \
    {"escape_encode", _PyCFunction_CAST(_codecs_escape_encode), METH_FASTCALL, _codecs_escape_encode__doc__},

static TyObject *
_codecs_escape_encode_impl(TyObject *module, TyObject *data,
                           const char *errors);

static TyObject *
_codecs_escape_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *data;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("escape_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyBytes_Check(args[0])) {
        _TyArg_BadArgument("escape_encode", "argument 1", "bytes", args[0]);
        goto exit;
    }
    data = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("escape_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_escape_encode_impl(module, data, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_7_decode__doc__,
"utf_7_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_7_DECODE_METHODDEF    \
    {"utf_7_decode", _PyCFunction_CAST(_codecs_utf_7_decode), METH_FASTCALL, _codecs_utf_7_decode__doc__},

static TyObject *
_codecs_utf_7_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors, int final);

static TyObject *
_codecs_utf_7_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_7_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_7_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_7_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_8_decode__doc__,
"utf_8_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_8_DECODE_METHODDEF    \
    {"utf_8_decode", _PyCFunction_CAST(_codecs_utf_8_decode), METH_FASTCALL, _codecs_utf_8_decode__doc__},

static TyObject *
_codecs_utf_8_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors, int final);

static TyObject *
_codecs_utf_8_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_8_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_8_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_8_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_decode__doc__,
"utf_16_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_DECODE_METHODDEF    \
    {"utf_16_decode", _PyCFunction_CAST(_codecs_utf_16_decode), METH_FASTCALL, _codecs_utf_16_decode__doc__},

static TyObject *
_codecs_utf_16_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors, int final);

static TyObject *
_codecs_utf_16_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_16_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_le_decode__doc__,
"utf_16_le_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_LE_DECODE_METHODDEF    \
    {"utf_16_le_decode", _PyCFunction_CAST(_codecs_utf_16_le_decode), METH_FASTCALL, _codecs_utf_16_le_decode__doc__},

static TyObject *
_codecs_utf_16_le_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final);

static TyObject *
_codecs_utf_16_le_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_16_le_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_le_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_le_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_be_decode__doc__,
"utf_16_be_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_BE_DECODE_METHODDEF    \
    {"utf_16_be_decode", _PyCFunction_CAST(_codecs_utf_16_be_decode), METH_FASTCALL, _codecs_utf_16_be_decode__doc__},

static TyObject *
_codecs_utf_16_be_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final);

static TyObject *
_codecs_utf_16_be_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_16_be_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_be_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_be_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_ex_decode__doc__,
"utf_16_ex_decode($module, data, errors=None, byteorder=0, final=False,\n"
"                 /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_EX_DECODE_METHODDEF    \
    {"utf_16_ex_decode", _PyCFunction_CAST(_codecs_utf_16_ex_decode), METH_FASTCALL, _codecs_utf_16_ex_decode__doc__},

static TyObject *
_codecs_utf_16_ex_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int byteorder, int final);

static TyObject *
_codecs_utf_16_ex_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int byteorder = 0;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_16_ex_decode", nargs, 1, 4)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_ex_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    byteorder = TyLong_AsInt(args[2]);
    if (byteorder == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[3]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_ex_decode_impl(module, &data, errors, byteorder, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_decode__doc__,
"utf_32_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_DECODE_METHODDEF    \
    {"utf_32_decode", _PyCFunction_CAST(_codecs_utf_32_decode), METH_FASTCALL, _codecs_utf_32_decode__doc__},

static TyObject *
_codecs_utf_32_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors, int final);

static TyObject *
_codecs_utf_32_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_32_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_le_decode__doc__,
"utf_32_le_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_LE_DECODE_METHODDEF    \
    {"utf_32_le_decode", _PyCFunction_CAST(_codecs_utf_32_le_decode), METH_FASTCALL, _codecs_utf_32_le_decode__doc__},

static TyObject *
_codecs_utf_32_le_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final);

static TyObject *
_codecs_utf_32_le_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_32_le_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_le_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_le_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_be_decode__doc__,
"utf_32_be_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_BE_DECODE_METHODDEF    \
    {"utf_32_be_decode", _PyCFunction_CAST(_codecs_utf_32_be_decode), METH_FASTCALL, _codecs_utf_32_be_decode__doc__},

static TyObject *
_codecs_utf_32_be_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final);

static TyObject *
_codecs_utf_32_be_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_32_be_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_be_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_be_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_ex_decode__doc__,
"utf_32_ex_decode($module, data, errors=None, byteorder=0, final=False,\n"
"                 /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_EX_DECODE_METHODDEF    \
    {"utf_32_ex_decode", _PyCFunction_CAST(_codecs_utf_32_ex_decode), METH_FASTCALL, _codecs_utf_32_ex_decode__doc__},

static TyObject *
_codecs_utf_32_ex_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int byteorder, int final);

static TyObject *
_codecs_utf_32_ex_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int byteorder = 0;
    int final = 0;

    if (!_TyArg_CheckPositional("utf_32_ex_decode", nargs, 1, 4)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_ex_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    byteorder = TyLong_AsInt(args[2]);
    if (byteorder == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[3]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_ex_decode_impl(module, &data, errors, byteorder, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_unicode_escape_decode__doc__,
"unicode_escape_decode($module, data, errors=None, final=True, /)\n"
"--\n"
"\n");

#define _CODECS_UNICODE_ESCAPE_DECODE_METHODDEF    \
    {"unicode_escape_decode", _PyCFunction_CAST(_codecs_unicode_escape_decode), METH_FASTCALL, _codecs_unicode_escape_decode__doc__},

static TyObject *
_codecs_unicode_escape_decode_impl(TyObject *module, Ty_buffer *data,
                                   const char *errors, int final);

static TyObject *
_codecs_unicode_escape_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 1;

    if (!_TyArg_CheckPositional("unicode_escape_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (TyUnicode_Check(args[0])) {
        Ty_ssize_t len;
        const char *ptr = TyUnicode_AsUTF8AndSize(args[0], &len);
        if (ptr == NULL) {
            goto exit;
        }
        if (PyBuffer_FillInfo(&data, args[0], (void *)ptr, len, 1, PyBUF_SIMPLE) < 0) {
            goto exit;
        }
    }
    else { /* any bytes-like object */
        if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("unicode_escape_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_unicode_escape_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_raw_unicode_escape_decode__doc__,
"raw_unicode_escape_decode($module, data, errors=None, final=True, /)\n"
"--\n"
"\n");

#define _CODECS_RAW_UNICODE_ESCAPE_DECODE_METHODDEF    \
    {"raw_unicode_escape_decode", _PyCFunction_CAST(_codecs_raw_unicode_escape_decode), METH_FASTCALL, _codecs_raw_unicode_escape_decode__doc__},

static TyObject *
_codecs_raw_unicode_escape_decode_impl(TyObject *module, Ty_buffer *data,
                                       const char *errors, int final);

static TyObject *
_codecs_raw_unicode_escape_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 1;

    if (!_TyArg_CheckPositional("raw_unicode_escape_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (TyUnicode_Check(args[0])) {
        Ty_ssize_t len;
        const char *ptr = TyUnicode_AsUTF8AndSize(args[0], &len);
        if (ptr == NULL) {
            goto exit;
        }
        if (PyBuffer_FillInfo(&data, args[0], (void *)ptr, len, 1, PyBUF_SIMPLE) < 0) {
            goto exit;
        }
    }
    else { /* any bytes-like object */
        if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("raw_unicode_escape_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_raw_unicode_escape_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_latin_1_decode__doc__,
"latin_1_decode($module, data, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_LATIN_1_DECODE_METHODDEF    \
    {"latin_1_decode", _PyCFunction_CAST(_codecs_latin_1_decode), METH_FASTCALL, _codecs_latin_1_decode__doc__},

static TyObject *
_codecs_latin_1_decode_impl(TyObject *module, Ty_buffer *data,
                            const char *errors);

static TyObject *
_codecs_latin_1_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("latin_1_decode", nargs, 1, 2)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("latin_1_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_latin_1_decode_impl(module, &data, errors);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_ascii_decode__doc__,
"ascii_decode($module, data, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_ASCII_DECODE_METHODDEF    \
    {"ascii_decode", _PyCFunction_CAST(_codecs_ascii_decode), METH_FASTCALL, _codecs_ascii_decode__doc__},

static TyObject *
_codecs_ascii_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors);

static TyObject *
_codecs_ascii_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("ascii_decode", nargs, 1, 2)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("ascii_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_ascii_decode_impl(module, &data, errors);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_charmap_decode__doc__,
"charmap_decode($module, data, errors=None, mapping=None, /)\n"
"--\n"
"\n");

#define _CODECS_CHARMAP_DECODE_METHODDEF    \
    {"charmap_decode", _PyCFunction_CAST(_codecs_charmap_decode), METH_FASTCALL, _codecs_charmap_decode__doc__},

static TyObject *
_codecs_charmap_decode_impl(TyObject *module, Ty_buffer *data,
                            const char *errors, TyObject *mapping);

static TyObject *
_codecs_charmap_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    TyObject *mapping = Ty_None;

    if (!_TyArg_CheckPositional("charmap_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("charmap_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    mapping = args[2];
skip_optional:
    return_value = _codecs_charmap_decode_impl(module, &data, errors, mapping);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_mbcs_decode__doc__,
"mbcs_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_MBCS_DECODE_METHODDEF    \
    {"mbcs_decode", _PyCFunction_CAST(_codecs_mbcs_decode), METH_FASTCALL, _codecs_mbcs_decode__doc__},

static TyObject *
_codecs_mbcs_decode_impl(TyObject *module, Ty_buffer *data,
                         const char *errors, int final);

static TyObject *
_codecs_mbcs_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("mbcs_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("mbcs_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_mbcs_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_oem_decode__doc__,
"oem_decode($module, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_OEM_DECODE_METHODDEF    \
    {"oem_decode", _PyCFunction_CAST(_codecs_oem_decode), METH_FASTCALL, _codecs_oem_decode__doc__},

static TyObject *
_codecs_oem_decode_impl(TyObject *module, Ty_buffer *data,
                        const char *errors, int final);

static TyObject *
_codecs_oem_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("oem_decode", nargs, 1, 3)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("oem_decode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[2]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_oem_decode_impl(module, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_code_page_decode__doc__,
"code_page_decode($module, codepage, data, errors=None, final=False, /)\n"
"--\n"
"\n");

#define _CODECS_CODE_PAGE_DECODE_METHODDEF    \
    {"code_page_decode", _PyCFunction_CAST(_codecs_code_page_decode), METH_FASTCALL, _codecs_code_page_decode__doc__},

static TyObject *
_codecs_code_page_decode_impl(TyObject *module, int codepage,
                              Ty_buffer *data, const char *errors, int final);

static TyObject *
_codecs_code_page_decode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int codepage;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;
    int final = 0;

    if (!_TyArg_CheckPositional("code_page_decode", nargs, 2, 4)) {
        goto exit;
    }
    codepage = TyLong_AsInt(args[0]);
    if (codepage == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (args[2] == Ty_None) {
        errors = NULL;
    }
    else if (TyUnicode_Check(args[2])) {
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[2], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("code_page_decode", "argument 3", "str or None", args[2]);
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    final = PyObject_IsTrue(args[3]);
    if (final < 0) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_code_page_decode_impl(module, codepage, &data, errors, final);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(_codecs_readbuffer_encode__doc__,
"readbuffer_encode($module, data, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_READBUFFER_ENCODE_METHODDEF    \
    {"readbuffer_encode", _PyCFunction_CAST(_codecs_readbuffer_encode), METH_FASTCALL, _codecs_readbuffer_encode__doc__},

static TyObject *
_codecs_readbuffer_encode_impl(TyObject *module, Ty_buffer *data,
                               const char *errors);

static TyObject *
_codecs_readbuffer_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("readbuffer_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (TyUnicode_Check(args[0])) {
        Ty_ssize_t len;
        const char *ptr = TyUnicode_AsUTF8AndSize(args[0], &len);
        if (ptr == NULL) {
            goto exit;
        }
        if (PyBuffer_FillInfo(&data, args[0], (void *)ptr, len, 1, PyBUF_SIMPLE) < 0) {
            goto exit;
        }
    }
    else { /* any bytes-like object */
        if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
    }
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("readbuffer_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_readbuffer_encode_impl(module, &data, errors);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_codecs_utf_7_encode__doc__,
"utf_7_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_7_ENCODE_METHODDEF    \
    {"utf_7_encode", _PyCFunction_CAST(_codecs_utf_7_encode), METH_FASTCALL, _codecs_utf_7_encode__doc__},

static TyObject *
_codecs_utf_7_encode_impl(TyObject *module, TyObject *str,
                          const char *errors);

static TyObject *
_codecs_utf_7_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_7_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_7_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_7_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_7_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_8_encode__doc__,
"utf_8_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_8_ENCODE_METHODDEF    \
    {"utf_8_encode", _PyCFunction_CAST(_codecs_utf_8_encode), METH_FASTCALL, _codecs_utf_8_encode__doc__},

static TyObject *
_codecs_utf_8_encode_impl(TyObject *module, TyObject *str,
                          const char *errors);

static TyObject *
_codecs_utf_8_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_8_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_8_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_8_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_8_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_encode__doc__,
"utf_16_encode($module, str, errors=None, byteorder=0, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_ENCODE_METHODDEF    \
    {"utf_16_encode", _PyCFunction_CAST(_codecs_utf_16_encode), METH_FASTCALL, _codecs_utf_16_encode__doc__},

static TyObject *
_codecs_utf_16_encode_impl(TyObject *module, TyObject *str,
                           const char *errors, int byteorder);

static TyObject *
_codecs_utf_16_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;
    int byteorder = 0;

    if (!_TyArg_CheckPositional("utf_16_encode", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_16_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    byteorder = TyLong_AsInt(args[2]);
    if (byteorder == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_encode_impl(module, str, errors, byteorder);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_le_encode__doc__,
"utf_16_le_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_LE_ENCODE_METHODDEF    \
    {"utf_16_le_encode", _PyCFunction_CAST(_codecs_utf_16_le_encode), METH_FASTCALL, _codecs_utf_16_le_encode__doc__},

static TyObject *
_codecs_utf_16_le_encode_impl(TyObject *module, TyObject *str,
                              const char *errors);

static TyObject *
_codecs_utf_16_le_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_16_le_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_16_le_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_le_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_le_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_16_be_encode__doc__,
"utf_16_be_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_16_BE_ENCODE_METHODDEF    \
    {"utf_16_be_encode", _PyCFunction_CAST(_codecs_utf_16_be_encode), METH_FASTCALL, _codecs_utf_16_be_encode__doc__},

static TyObject *
_codecs_utf_16_be_encode_impl(TyObject *module, TyObject *str,
                              const char *errors);

static TyObject *
_codecs_utf_16_be_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_16_be_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_16_be_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_16_be_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_16_be_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_encode__doc__,
"utf_32_encode($module, str, errors=None, byteorder=0, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_ENCODE_METHODDEF    \
    {"utf_32_encode", _PyCFunction_CAST(_codecs_utf_32_encode), METH_FASTCALL, _codecs_utf_32_encode__doc__},

static TyObject *
_codecs_utf_32_encode_impl(TyObject *module, TyObject *str,
                           const char *errors, int byteorder);

static TyObject *
_codecs_utf_32_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;
    int byteorder = 0;

    if (!_TyArg_CheckPositional("utf_32_encode", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_32_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    byteorder = TyLong_AsInt(args[2]);
    if (byteorder == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_encode_impl(module, str, errors, byteorder);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_le_encode__doc__,
"utf_32_le_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_LE_ENCODE_METHODDEF    \
    {"utf_32_le_encode", _PyCFunction_CAST(_codecs_utf_32_le_encode), METH_FASTCALL, _codecs_utf_32_le_encode__doc__},

static TyObject *
_codecs_utf_32_le_encode_impl(TyObject *module, TyObject *str,
                              const char *errors);

static TyObject *
_codecs_utf_32_le_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_32_le_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_32_le_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_le_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_le_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_utf_32_be_encode__doc__,
"utf_32_be_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UTF_32_BE_ENCODE_METHODDEF    \
    {"utf_32_be_encode", _PyCFunction_CAST(_codecs_utf_32_be_encode), METH_FASTCALL, _codecs_utf_32_be_encode__doc__},

static TyObject *
_codecs_utf_32_be_encode_impl(TyObject *module, TyObject *str,
                              const char *errors);

static TyObject *
_codecs_utf_32_be_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("utf_32_be_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("utf_32_be_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("utf_32_be_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_utf_32_be_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_unicode_escape_encode__doc__,
"unicode_escape_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_UNICODE_ESCAPE_ENCODE_METHODDEF    \
    {"unicode_escape_encode", _PyCFunction_CAST(_codecs_unicode_escape_encode), METH_FASTCALL, _codecs_unicode_escape_encode__doc__},

static TyObject *
_codecs_unicode_escape_encode_impl(TyObject *module, TyObject *str,
                                   const char *errors);

static TyObject *
_codecs_unicode_escape_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("unicode_escape_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("unicode_escape_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("unicode_escape_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_unicode_escape_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_raw_unicode_escape_encode__doc__,
"raw_unicode_escape_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_RAW_UNICODE_ESCAPE_ENCODE_METHODDEF    \
    {"raw_unicode_escape_encode", _PyCFunction_CAST(_codecs_raw_unicode_escape_encode), METH_FASTCALL, _codecs_raw_unicode_escape_encode__doc__},

static TyObject *
_codecs_raw_unicode_escape_encode_impl(TyObject *module, TyObject *str,
                                       const char *errors);

static TyObject *
_codecs_raw_unicode_escape_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("raw_unicode_escape_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("raw_unicode_escape_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("raw_unicode_escape_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_raw_unicode_escape_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_latin_1_encode__doc__,
"latin_1_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_LATIN_1_ENCODE_METHODDEF    \
    {"latin_1_encode", _PyCFunction_CAST(_codecs_latin_1_encode), METH_FASTCALL, _codecs_latin_1_encode__doc__},

static TyObject *
_codecs_latin_1_encode_impl(TyObject *module, TyObject *str,
                            const char *errors);

static TyObject *
_codecs_latin_1_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("latin_1_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("latin_1_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("latin_1_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_latin_1_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_ascii_encode__doc__,
"ascii_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_ASCII_ENCODE_METHODDEF    \
    {"ascii_encode", _PyCFunction_CAST(_codecs_ascii_encode), METH_FASTCALL, _codecs_ascii_encode__doc__},

static TyObject *
_codecs_ascii_encode_impl(TyObject *module, TyObject *str,
                          const char *errors);

static TyObject *
_codecs_ascii_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("ascii_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("ascii_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("ascii_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_ascii_encode_impl(module, str, errors);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_charmap_encode__doc__,
"charmap_encode($module, str, errors=None, mapping=None, /)\n"
"--\n"
"\n");

#define _CODECS_CHARMAP_ENCODE_METHODDEF    \
    {"charmap_encode", _PyCFunction_CAST(_codecs_charmap_encode), METH_FASTCALL, _codecs_charmap_encode__doc__},

static TyObject *
_codecs_charmap_encode_impl(TyObject *module, TyObject *str,
                            const char *errors, TyObject *mapping);

static TyObject *
_codecs_charmap_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;
    TyObject *mapping = Ty_None;

    if (!_TyArg_CheckPositional("charmap_encode", nargs, 1, 3)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("charmap_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("charmap_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    mapping = args[2];
skip_optional:
    return_value = _codecs_charmap_encode_impl(module, str, errors, mapping);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_charmap_build__doc__,
"charmap_build($module, map, /)\n"
"--\n"
"\n");

#define _CODECS_CHARMAP_BUILD_METHODDEF    \
    {"charmap_build", (PyCFunction)_codecs_charmap_build, METH_O, _codecs_charmap_build__doc__},

static TyObject *
_codecs_charmap_build_impl(TyObject *module, TyObject *map);

static TyObject *
_codecs_charmap_build(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *map;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("charmap_build", "argument", "str", arg);
        goto exit;
    }
    map = arg;
    return_value = _codecs_charmap_build_impl(module, map);

exit:
    return return_value;
}

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_mbcs_encode__doc__,
"mbcs_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_MBCS_ENCODE_METHODDEF    \
    {"mbcs_encode", _PyCFunction_CAST(_codecs_mbcs_encode), METH_FASTCALL, _codecs_mbcs_encode__doc__},

static TyObject *
_codecs_mbcs_encode_impl(TyObject *module, TyObject *str, const char *errors);

static TyObject *
_codecs_mbcs_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("mbcs_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("mbcs_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("mbcs_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_mbcs_encode_impl(module, str, errors);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_oem_encode__doc__,
"oem_encode($module, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_OEM_ENCODE_METHODDEF    \
    {"oem_encode", _PyCFunction_CAST(_codecs_oem_encode), METH_FASTCALL, _codecs_oem_encode__doc__},

static TyObject *
_codecs_oem_encode_impl(TyObject *module, TyObject *str, const char *errors);

static TyObject *
_codecs_oem_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("oem_encode", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("oem_encode", "argument 1", "str", args[0]);
        goto exit;
    }
    str = args[0];
    if (nargs < 2) {
        goto skip_optional;
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
        _TyArg_BadArgument("oem_encode", "argument 2", "str or None", args[1]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_oem_encode_impl(module, str, errors);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_codecs_code_page_encode__doc__,
"code_page_encode($module, code_page, str, errors=None, /)\n"
"--\n"
"\n");

#define _CODECS_CODE_PAGE_ENCODE_METHODDEF    \
    {"code_page_encode", _PyCFunction_CAST(_codecs_code_page_encode), METH_FASTCALL, _codecs_code_page_encode__doc__},

static TyObject *
_codecs_code_page_encode_impl(TyObject *module, int code_page, TyObject *str,
                              const char *errors);

static TyObject *
_codecs_code_page_encode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int code_page;
    TyObject *str;
    const char *errors = NULL;

    if (!_TyArg_CheckPositional("code_page_encode", nargs, 2, 3)) {
        goto exit;
    }
    code_page = TyLong_AsInt(args[0]);
    if (code_page == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("code_page_encode", "argument 2", "str", args[1]);
        goto exit;
    }
    str = args[1];
    if (nargs < 3) {
        goto skip_optional;
    }
    if (args[2] == Ty_None) {
        errors = NULL;
    }
    else if (TyUnicode_Check(args[2])) {
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[2], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("code_page_encode", "argument 3", "str or None", args[2]);
        goto exit;
    }
skip_optional:
    return_value = _codecs_code_page_encode_impl(module, code_page, str, errors);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(_codecs_register_error__doc__,
"register_error($module, errors, handler, /)\n"
"--\n"
"\n"
"Register the specified error handler under the name errors.\n"
"\n"
"handler must be a callable object, that will be called with an exception\n"
"instance containing information about the location of the encoding/decoding\n"
"error and must return a (replacement, new position) tuple.");

#define _CODECS_REGISTER_ERROR_METHODDEF    \
    {"register_error", _PyCFunction_CAST(_codecs_register_error), METH_FASTCALL, _codecs_register_error__doc__},

static TyObject *
_codecs_register_error_impl(TyObject *module, const char *errors,
                            TyObject *handler);

static TyObject *
_codecs_register_error(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *errors;
    TyObject *handler;

    if (!_TyArg_CheckPositional("register_error", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("register_error", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(args[0], &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    handler = args[1];
    return_value = _codecs_register_error_impl(module, errors, handler);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs__unregister_error__doc__,
"_unregister_error($module, errors, /)\n"
"--\n"
"\n"
"Un-register the specified error handler for the error handling `errors\'.\n"
"\n"
"Only custom error handlers can be un-registered. An exception is raised\n"
"if the error handling is a built-in one (e.g., \'strict\'), or if an error\n"
"occurs.\n"
"\n"
"Otherwise, this returns True if a custom handler has been successfully\n"
"un-registered, and False if no custom handler for the specified error\n"
"handling exists.");

#define _CODECS__UNREGISTER_ERROR_METHODDEF    \
    {"_unregister_error", (PyCFunction)_codecs__unregister_error, METH_O, _codecs__unregister_error__doc__},

static int
_codecs__unregister_error_impl(TyObject *module, const char *errors);

static TyObject *
_codecs__unregister_error(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *errors;
    int _return_value;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("_unregister_error", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t errors_length;
    errors = TyUnicode_AsUTF8AndSize(arg, &errors_length);
    if (errors == NULL) {
        goto exit;
    }
    if (strlen(errors) != (size_t)errors_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    _return_value = _codecs__unregister_error_impl(module, errors);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_codecs_lookup_error__doc__,
"lookup_error($module, name, /)\n"
"--\n"
"\n"
"lookup_error(errors) -> handler\n"
"\n"
"Return the error handler for the specified error handling name or raise a\n"
"LookupError, if no handler exists under this name.");

#define _CODECS_LOOKUP_ERROR_METHODDEF    \
    {"lookup_error", (PyCFunction)_codecs_lookup_error, METH_O, _codecs_lookup_error__doc__},

static TyObject *
_codecs_lookup_error_impl(TyObject *module, const char *name);

static TyObject *
_codecs_lookup_error(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("lookup_error", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(arg, &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = _codecs_lookup_error_impl(module, name);

exit:
    return return_value;
}

#ifndef _CODECS_MBCS_DECODE_METHODDEF
    #define _CODECS_MBCS_DECODE_METHODDEF
#endif /* !defined(_CODECS_MBCS_DECODE_METHODDEF) */

#ifndef _CODECS_OEM_DECODE_METHODDEF
    #define _CODECS_OEM_DECODE_METHODDEF
#endif /* !defined(_CODECS_OEM_DECODE_METHODDEF) */

#ifndef _CODECS_CODE_PAGE_DECODE_METHODDEF
    #define _CODECS_CODE_PAGE_DECODE_METHODDEF
#endif /* !defined(_CODECS_CODE_PAGE_DECODE_METHODDEF) */

#ifndef _CODECS_MBCS_ENCODE_METHODDEF
    #define _CODECS_MBCS_ENCODE_METHODDEF
#endif /* !defined(_CODECS_MBCS_ENCODE_METHODDEF) */

#ifndef _CODECS_OEM_ENCODE_METHODDEF
    #define _CODECS_OEM_ENCODE_METHODDEF
#endif /* !defined(_CODECS_OEM_ENCODE_METHODDEF) */

#ifndef _CODECS_CODE_PAGE_ENCODE_METHODDEF
    #define _CODECS_CODE_PAGE_ENCODE_METHODDEF
#endif /* !defined(_CODECS_CODE_PAGE_ENCODE_METHODDEF) */
/*[clinic end generated code: output=ed13f20dfb09e306 input=a9049054013a1b77]*/
