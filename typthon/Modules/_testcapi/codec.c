#include "parts.h"
#include "util.h"

// === Codecs registration and un-registration ================================

static TyObject *
codec_register(TyObject *Py_UNUSED(module), TyObject *search_function)
{
    if (PyCodec_Register(search_function) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
codec_unregister(TyObject *Py_UNUSED(module), TyObject *search_function)
{
    if (PyCodec_Unregister(search_function) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
codec_known_encoding(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    if (!TyArg_ParseTuple(args, "z", &encoding)) {
        return NULL;
    }
    return PyCodec_KnownEncoding(encoding) ? Ty_True : Ty_False;
}

// === Codecs encoding and decoding interfaces ================================

static TyObject *
codec_encode(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *input;
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "O|zz", &input, &encoding, &errors)) {
        return NULL;
    }
    return PyCodec_Encode(input, encoding, errors);
}

static TyObject *
codec_decode(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *input;
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "O|zz", &input, &encoding, &errors)) {
        return NULL;
    }
    return PyCodec_Decode(input, encoding, errors);
}

static TyObject *
codec_encoder(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    if (!TyArg_ParseTuple(args, "z", &encoding)) {
        return NULL;
    }
    return PyCodec_Encoder(encoding);
}

static TyObject *
codec_decoder(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    if (!TyArg_ParseTuple(args, "z", &encoding)) {
        return NULL;
    }
    return PyCodec_Decoder(encoding);
}

static TyObject *
codec_incremental_encoder(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "zz", &encoding, &errors)) {
        return NULL;
    }
    return PyCodec_IncrementalEncoder(encoding, errors);
}

static TyObject *
codec_incremental_decoder(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "zz", &encoding, &errors)) {
        return NULL;
    }
    return PyCodec_IncrementalDecoder(encoding, errors);
}

static TyObject *
codec_stream_reader(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    TyObject *stream;
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "zOz", &encoding, &stream, &errors)) {
        return NULL;
    }
    return PyCodec_StreamReader(encoding, stream, errors);
}

static TyObject *
codec_stream_writer(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    TyObject *stream;
    const char *errors;                     // can be NULL
    if (!TyArg_ParseTuple(args, "zOz", &encoding, &stream, &errors)) {
        return NULL;
    }
    return PyCodec_StreamWriter(encoding, stream, errors);
}

// === Codecs errors handlers =================================================

static TyObject *
codec_register_error(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *encoding;   // must not be NULL
    TyObject *error;
    if (!TyArg_ParseTuple(args, "sO", &encoding, &error)) {
        return NULL;
    }
    if (PyCodec_RegisterError(encoding, error) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
codec_lookup_error(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *NULL_WOULD_RAISE(encoding); // NULL case will be tested
    if (!TyArg_ParseTuple(args, "z", &encoding)) {
        return NULL;
    }
    return PyCodec_LookupError(encoding);
}

static TyObject *
codec_strict_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_StrictErrors(exc);
}

static TyObject *
codec_ignore_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_IgnoreErrors(exc);
}

static TyObject *
codec_replace_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_ReplaceErrors(exc);
}

static TyObject *
codec_xmlcharrefreplace_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_XMLCharRefReplaceErrors(exc);
}

static TyObject *
codec_backslashreplace_errors(TyObject *Py_UNUSED(module), TyObject *exc)
{
    assert(exc != NULL);
    return PyCodec_BackslashReplaceErrors(exc);
}

static TyMethodDef test_methods[] = {
    /* codecs registration */
    {"codec_register", codec_register, METH_O},
    {"codec_unregister", codec_unregister, METH_O},
    {"codec_known_encoding", codec_known_encoding, METH_VARARGS},
    /* encoding and decoding interface */
    {"codec_encode", codec_encode, METH_VARARGS},
    {"codec_decode", codec_decode, METH_VARARGS},
    {"codec_encoder", codec_encoder, METH_VARARGS},
    {"codec_decoder", codec_decoder, METH_VARARGS},
    {"codec_incremental_encoder", codec_incremental_encoder, METH_VARARGS},
    {"codec_incremental_decoder", codec_incremental_decoder, METH_VARARGS},
    {"codec_stream_reader", codec_stream_reader, METH_VARARGS},
    {"codec_stream_writer", codec_stream_writer, METH_VARARGS},
    /* error handling */
    {"codec_register_error", codec_register_error, METH_VARARGS},
    {"codec_lookup_error", codec_lookup_error, METH_VARARGS},
    {"codec_strict_errors", codec_strict_errors, METH_O},
    {"codec_ignore_errors", codec_ignore_errors, METH_O},
    {"codec_replace_errors", codec_replace_errors, METH_O},
    {"codec_xmlcharrefreplace_errors", codec_xmlcharrefreplace_errors, METH_O},
    {"codec_backslashreplace_errors", codec_backslashreplace_errors, METH_O},
    // PyCodec_NameReplaceErrors() is tested in _testlimitedcapi/codec.c
    {NULL, NULL, 0, NULL},
};

int
_PyTestCapi_Init_Codec(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
