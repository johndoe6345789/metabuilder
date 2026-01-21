/* ------------------------------------------------------------------------

   _codecs -- Provides access to the codec registry and the builtin
              codecs.

   This module should never be imported directly. The standard library
   module "codecs" wraps this builtin module for use within Python.

   The codec registry is accessible via:

     register(search_function) -> None

     lookup(encoding) -> CodecInfo object

   The builtin Unicode codecs use the following interface:

     <encoding>_encode(Unicode_object[,errors='strict']) ->
        (string object, bytes consumed)

     <encoding>_decode(char_buffer_obj[,errors='strict']) ->
        (Unicode object, bytes consumed)

   These <encoding>s are available: utf_8, unicode_escape,
   raw_unicode_escape, latin_1, ascii (7-bit), mbcs (on win32).


Written by Marc-Andre Lemburg (mal@lemburg.com).

Copyright (c) Corporation for National Research Initiatives.

   ------------------------------------------------------------------------ */

#include "Python.h"
#include "pycore_codecs.h"        // _PyCodec_Lookup()
#include "pycore_unicodeobject.h" // _TyUnicode_EncodeCharmap

#ifdef MS_WINDOWS
#include <windows.h>
#endif

/*[clinic input]
module _codecs
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=e1390e3da3cb9deb]*/

#include "pycore_runtime.h"
#include "clinic/_codecsmodule.c.h"

/* --- Registry ----------------------------------------------------------- */

/*[clinic input]
_codecs.register
    search_function: object
    /

Register a codec search function.

Search functions are expected to take one argument, the encoding name in
all lower case letters, and either return None, or a tuple of functions
(encoder, decoder, stream_reader, stream_writer) (or a CodecInfo object).
[clinic start generated code]*/

static TyObject *
_codecs_register(TyObject *module, TyObject *search_function)
/*[clinic end generated code: output=d1bf21e99db7d6d3 input=369578467955cae4]*/
{
    if (PyCodec_Register(search_function))
        return NULL;

    Py_RETURN_NONE;
}

/*[clinic input]
_codecs.unregister
    search_function: object
    /

Unregister a codec search function and clear the registry's cache.

If the search function is not registered, do nothing.
[clinic start generated code]*/

static TyObject *
_codecs_unregister(TyObject *module, TyObject *search_function)
/*[clinic end generated code: output=1f0edee9cf246399 input=dd7c004c652d345e]*/
{
    if (PyCodec_Unregister(search_function) < 0) {
        return NULL;
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_codecs.lookup
    encoding: str
    /

Looks up a codec tuple in the Python codec registry and returns a CodecInfo object.
[clinic start generated code]*/

static TyObject *
_codecs_lookup_impl(TyObject *module, const char *encoding)
/*[clinic end generated code: output=9f0afa572080c36d input=3c572c0db3febe9c]*/
{
    return _PyCodec_Lookup(encoding);
}

/*[clinic input]
_codecs.encode
    obj: object
    encoding: str(c_default="NULL") = "utf-8"
    errors: str(c_default="NULL") = "strict"

Encodes obj using the codec registered for encoding.

The default encoding is 'utf-8'.  errors may be given to set a
different error handling scheme.  Default is 'strict' meaning that encoding
errors raise a ValueError.  Other possible values are 'ignore', 'replace'
and 'backslashreplace' as well as any other name registered with
codecs.register_error that can handle ValueErrors.
[clinic start generated code]*/

static TyObject *
_codecs_encode_impl(TyObject *module, TyObject *obj, const char *encoding,
                    const char *errors)
/*[clinic end generated code: output=385148eb9a067c86 input=cd5b685040ff61f0]*/
{
    if (encoding == NULL)
        encoding = TyUnicode_GetDefaultEncoding();

    /* Encode via the codec registry */
    return PyCodec_Encode(obj, encoding, errors);
}

/*[clinic input]
_codecs.decode
    obj: object
    encoding: str(c_default="NULL") = "utf-8"
    errors: str(c_default="NULL") = "strict"

Decodes obj using the codec registered for encoding.

Default encoding is 'utf-8'.  errors may be given to set a
different error handling scheme.  Default is 'strict' meaning that encoding
errors raise a ValueError.  Other possible values are 'ignore', 'replace'
and 'backslashreplace' as well as any other name registered with
codecs.register_error that can handle ValueErrors.
[clinic start generated code]*/

static TyObject *
_codecs_decode_impl(TyObject *module, TyObject *obj, const char *encoding,
                    const char *errors)
/*[clinic end generated code: output=679882417dc3a0bd input=7702c0cc2fa1add6]*/
{
    if (encoding == NULL)
        encoding = TyUnicode_GetDefaultEncoding();

    /* Decode via the codec registry */
    return PyCodec_Decode(obj, encoding, errors);
}

/* --- Helpers ------------------------------------------------------------ */

static
TyObject *codec_tuple(TyObject *decoded,
                      Ty_ssize_t len)
{
    if (decoded == NULL)
        return NULL;
    return Ty_BuildValue("Nn", decoded, len);
}

/* --- String codecs ------------------------------------------------------ */
/*[clinic input]
_codecs.escape_decode
    data: Ty_buffer(accept={str, buffer})
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_escape_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors)
/*[clinic end generated code: output=505200ba8056979a input=77298a561c90bd82]*/
{
    TyObject *decoded = TyBytes_DecodeEscape(data->buf, data->len,
                                             errors, 0, NULL);
    return codec_tuple(decoded, data->len);
}

/*[clinic input]
_codecs.escape_encode
    data: object(subclass_of='&TyBytes_Type')
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_escape_encode_impl(TyObject *module, TyObject *data,
                           const char *errors)
/*[clinic end generated code: output=4af1d477834bab34 input=8f4b144799a94245]*/
{
    Ty_ssize_t size;
    Ty_ssize_t newsize;
    TyObject *v;

    size = TyBytes_GET_SIZE(data);
    if (size > PY_SSIZE_T_MAX / 4) {
        TyErr_SetString(TyExc_OverflowError,
            "string is too large to encode");
            return NULL;
    }
    newsize = 4*size;
    v = TyBytes_FromStringAndSize(NULL, newsize);

    if (v == NULL) {
        return NULL;
    }
    else {
        Ty_ssize_t i;
        char c;
        char *p = TyBytes_AS_STRING(v);

        for (i = 0; i < size; i++) {
            /* There's at least enough room for a hex escape */
            assert(newsize - (p - TyBytes_AS_STRING(v)) >= 4);
            c = TyBytes_AS_STRING(data)[i];
            if (c == '\'' || c == '\\')
                *p++ = '\\', *p++ = c;
            else if (c == '\t')
                *p++ = '\\', *p++ = 't';
            else if (c == '\n')
                *p++ = '\\', *p++ = 'n';
            else if (c == '\r')
                *p++ = '\\', *p++ = 'r';
            else if (c < ' ' || c >= 0x7f) {
                *p++ = '\\';
                *p++ = 'x';
                *p++ = Ty_hexdigits[(c & 0xf0) >> 4];
                *p++ = Ty_hexdigits[c & 0xf];
            }
            else
                *p++ = c;
        }
        *p = '\0';
        if (_TyBytes_Resize(&v, (p - TyBytes_AS_STRING(v)))) {
            return NULL;
        }
    }

    return codec_tuple(v, size);
}

/* --- Decoder ------------------------------------------------------------ */
/*[clinic input]
_codecs.utf_7_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_7_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors, int final)
/*[clinic end generated code: output=0cd3a944a32a4089 input=dbf8c8998102dc7d]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF7Stateful(data->buf, data->len,
                                                     errors,
                                                     final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_8_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_8_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors, int final)
/*[clinic end generated code: output=10f74dec8d9bb8bf input=ca06bc8a9c970e25]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF8Stateful(data->buf, data->len,
                                                     errors,
                                                     final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_16_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors, int final)
/*[clinic end generated code: output=783b442abcbcc2d0 input=5b0f52071ba6cadc]*/
{
    int byteorder = 0;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF16Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_16_le_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_le_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final)
/*[clinic end generated code: output=899b9e6364379dcd input=115bd8c7b783d0bf]*/
{
    int byteorder = -1;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF16Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_16_be_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_be_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final)
/*[clinic end generated code: output=49f6465ea07669c8 input=63131422b01f9cb4]*/
{
    int byteorder = 1;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF16Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/* This non-standard version also provides access to the byteorder
   parameter of the builtin UTF-16 codec.

   It returns a tuple (unicode, bytesread, byteorder) with byteorder
   being the value in effect at the end of data.

*/
/*[clinic input]
_codecs.utf_16_ex_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    byteorder: int = 0
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_ex_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int byteorder, int final)
/*[clinic end generated code: output=0f385f251ecc1988 input=f368a51cf384bf4c]*/
{
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;

    TyObject *decoded = TyUnicode_DecodeUTF16Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    if (decoded == NULL)
        return NULL;
    return Ty_BuildValue("Nni", decoded, consumed, byteorder);
}

/*[clinic input]
_codecs.utf_32_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_decode_impl(TyObject *module, Ty_buffer *data,
                           const char *errors, int final)
/*[clinic end generated code: output=2fc961807f7b145f input=fcdf3658c5e9b5f3]*/
{
    int byteorder = 0;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF32Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_32_le_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_le_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final)
/*[clinic end generated code: output=ec8f46b67a94f3e6 input=12220556e885f817]*/
{
    int byteorder = -1;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF32Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.utf_32_be_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_be_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int final)
/*[clinic end generated code: output=ff82bae862c92c4e input=2bc669b4781598db]*/
{
    int byteorder = 1;
    /* This is overwritten unless final is true. */
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF32Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/* This non-standard version also provides access to the byteorder
   parameter of the builtin UTF-32 codec.

   It returns a tuple (unicode, bytesread, byteorder) with byteorder
   being the value in effect at the end of data.

*/
/*[clinic input]
_codecs.utf_32_ex_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    byteorder: int = 0
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_ex_decode_impl(TyObject *module, Ty_buffer *data,
                              const char *errors, int byteorder, int final)
/*[clinic end generated code: output=6bfb177dceaf4848 input=4a2323d0013620df]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeUTF32Stateful(data->buf, data->len,
                                                      errors, &byteorder,
                                                      final ? NULL : &consumed);
    if (decoded == NULL)
        return NULL;
    return Ty_BuildValue("Nni", decoded, consumed, byteorder);
}

/*[clinic input]
_codecs.unicode_escape_decode
    data: Ty_buffer(accept={str, buffer})
    errors: str(accept={str, NoneType}) = None
    final: bool = True
    /
[clinic start generated code]*/

static TyObject *
_codecs_unicode_escape_decode_impl(TyObject *module, Ty_buffer *data,
                                   const char *errors, int final)
/*[clinic end generated code: output=b284f97b12c635ee input=15019f081ffe272b]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = _TyUnicode_DecodeUnicodeEscapeStateful(data->buf, data->len,
                                                               errors,
                                                               final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.raw_unicode_escape_decode
    data: Ty_buffer(accept={str, buffer})
    errors: str(accept={str, NoneType}) = None
    final: bool = True
    /
[clinic start generated code]*/

static TyObject *
_codecs_raw_unicode_escape_decode_impl(TyObject *module, Ty_buffer *data,
                                       const char *errors, int final)
/*[clinic end generated code: output=11dbd96301e2879e input=b93f823aa8c343ad]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = _TyUnicode_DecodeRawUnicodeEscapeStateful(data->buf, data->len,
                                                                  errors,
                                                                  final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.latin_1_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_latin_1_decode_impl(TyObject *module, Ty_buffer *data,
                            const char *errors)
/*[clinic end generated code: output=07f3dfa3f72c7d8f input=76ca58fd6dcd08c7]*/
{
    TyObject *decoded = TyUnicode_DecodeLatin1(data->buf, data->len, errors);
    return codec_tuple(decoded, data->len);
}

/*[clinic input]
_codecs.ascii_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_ascii_decode_impl(TyObject *module, Ty_buffer *data,
                          const char *errors)
/*[clinic end generated code: output=2627d72058d42429 input=e428a267a04b4481]*/
{
    TyObject *decoded = TyUnicode_DecodeASCII(data->buf, data->len, errors);
    return codec_tuple(decoded, data->len);
}

/*[clinic input]
_codecs.charmap_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    mapping: object = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_charmap_decode_impl(TyObject *module, Ty_buffer *data,
                            const char *errors, TyObject *mapping)
/*[clinic end generated code: output=2c335b09778cf895 input=15b69df43458eb40]*/
{
    TyObject *decoded;

    if (mapping == Ty_None)
        mapping = NULL;

    decoded = TyUnicode_DecodeCharmap(data->buf, data->len, mapping, errors);
    return codec_tuple(decoded, data->len);
}

#ifdef MS_WINDOWS

/*[clinic input]
_codecs.mbcs_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_mbcs_decode_impl(TyObject *module, Ty_buffer *data,
                         const char *errors, int final)
/*[clinic end generated code: output=39b65b8598938c4b input=f144ad1ed6d8f5a6]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeMBCSStateful(data->buf, data->len,
            errors, final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.oem_decode
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_oem_decode_impl(TyObject *module, Ty_buffer *data,
                        const char *errors, int final)
/*[clinic end generated code: output=da1617612f3fcad8 input=629bf87376d211b4]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeCodePageStateful(CP_OEMCP,
        data->buf, data->len, errors, final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

/*[clinic input]
_codecs.code_page_decode
    codepage: int
    data: Ty_buffer
    errors: str(accept={str, NoneType}) = None
    final: bool = False
    /
[clinic start generated code]*/

static TyObject *
_codecs_code_page_decode_impl(TyObject *module, int codepage,
                              Ty_buffer *data, const char *errors, int final)
/*[clinic end generated code: output=53008ea967da3fff input=6a32589b0658c277]*/
{
    Ty_ssize_t consumed = data->len;
    TyObject *decoded = TyUnicode_DecodeCodePageStateful(codepage,
                                                         data->buf, data->len,
                                                         errors,
                                                         final ? NULL : &consumed);
    return codec_tuple(decoded, consumed);
}

#endif /* MS_WINDOWS */

/* --- Encoder ------------------------------------------------------------ */

/*[clinic input]
_codecs.readbuffer_encode
    data: Ty_buffer(accept={str, buffer})
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_readbuffer_encode_impl(TyObject *module, Ty_buffer *data,
                               const char *errors)
/*[clinic end generated code: output=c645ea7cdb3d6e86 input=aa10cfdf252455c5]*/
{
    TyObject *result = TyBytes_FromStringAndSize(data->buf, data->len);
    return codec_tuple(result, data->len);
}

/*[clinic input]
_codecs.utf_7_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_7_encode_impl(TyObject *module, TyObject *str,
                          const char *errors)
/*[clinic end generated code: output=0feda21ffc921bc8 input=2546dbbb3fa53114]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF7(str, 0, 0, errors),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.utf_8_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_8_encode_impl(TyObject *module, TyObject *str,
                          const char *errors)
/*[clinic end generated code: output=02bf47332b9c796c input=a3e71ae01c3f93f3]*/
{
    return codec_tuple(_TyUnicode_AsUTF8String(str, errors),
                       TyUnicode_GET_LENGTH(str));
}

/* This version provides access to the byteorder parameter of the
   builtin UTF-16 codecs as optional third argument. It defaults to 0
   which means: use the native byte order and prepend the data with a
   BOM mark.

*/

/*[clinic input]
_codecs.utf_16_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    byteorder: int = 0
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_encode_impl(TyObject *module, TyObject *str,
                           const char *errors, int byteorder)
/*[clinic end generated code: output=c654e13efa2e64e4 input=68cdc2eb8338555d]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF16(str, errors, byteorder),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.utf_16_le_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_le_encode_impl(TyObject *module, TyObject *str,
                              const char *errors)
/*[clinic end generated code: output=431b01e55f2d4995 input=83d042706eed6798]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF16(str, errors, -1),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.utf_16_be_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_16_be_encode_impl(TyObject *module, TyObject *str,
                              const char *errors)
/*[clinic end generated code: output=96886a6fd54dcae3 input=6f1e9e623b03071b]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF16(str, errors, +1),
                       TyUnicode_GET_LENGTH(str));
}

/* This version provides access to the byteorder parameter of the
   builtin UTF-32 codecs as optional third argument. It defaults to 0
   which means: use the native byte order and prepend the data with a
   BOM mark.

*/

/*[clinic input]
_codecs.utf_32_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    byteorder: int = 0
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_encode_impl(TyObject *module, TyObject *str,
                           const char *errors, int byteorder)
/*[clinic end generated code: output=5c760da0c09a8b83 input=8ec4c64d983bc52b]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF32(str, errors, byteorder),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.utf_32_le_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_le_encode_impl(TyObject *module, TyObject *str,
                              const char *errors)
/*[clinic end generated code: output=b65cd176de8e36d6 input=f0918d41de3eb1b1]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF32(str, errors, -1),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.utf_32_be_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_utf_32_be_encode_impl(TyObject *module, TyObject *str,
                              const char *errors)
/*[clinic end generated code: output=1d9e71a9358709e9 input=967a99a95748b557]*/
{
    return codec_tuple(_TyUnicode_EncodeUTF32(str, errors, +1),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.unicode_escape_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_unicode_escape_encode_impl(TyObject *module, TyObject *str,
                                   const char *errors)
/*[clinic end generated code: output=66271b30bc4f7a3c input=8c4de07597054e33]*/
{
    return codec_tuple(TyUnicode_AsUnicodeEscapeString(str),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.raw_unicode_escape_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_raw_unicode_escape_encode_impl(TyObject *module, TyObject *str,
                                       const char *errors)
/*[clinic end generated code: output=a66a806ed01c830a input=4aa6f280d78e4574]*/
{
    return codec_tuple(TyUnicode_AsRawUnicodeEscapeString(str),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.latin_1_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_latin_1_encode_impl(TyObject *module, TyObject *str,
                            const char *errors)
/*[clinic end generated code: output=2c28c83a27884e08 input=ec3ef74bf85c5c5d]*/
{
    return codec_tuple(_TyUnicode_AsLatin1String(str, errors),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.ascii_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_ascii_encode_impl(TyObject *module, TyObject *str,
                          const char *errors)
/*[clinic end generated code: output=b5e035182d33befc input=93e6e602838bd3de]*/
{
    return codec_tuple(_TyUnicode_AsASCIIString(str, errors),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.charmap_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    mapping: object = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_charmap_encode_impl(TyObject *module, TyObject *str,
                            const char *errors, TyObject *mapping)
/*[clinic end generated code: output=047476f48495a9e9 input=2a98feae73dadce8]*/
{
    if (mapping == Ty_None)
        mapping = NULL;

    return codec_tuple(_TyUnicode_EncodeCharmap(str, mapping, errors),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.charmap_build
    map: unicode
    /
[clinic start generated code]*/

static TyObject *
_codecs_charmap_build_impl(TyObject *module, TyObject *map)
/*[clinic end generated code: output=bb073c27031db9ac input=d91a91d1717dbc6d]*/
{
    return TyUnicode_BuildEncodingMap(map);
}

#ifdef MS_WINDOWS

/*[clinic input]
_codecs.mbcs_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_mbcs_encode_impl(TyObject *module, TyObject *str, const char *errors)
/*[clinic end generated code: output=76e2e170c966c080 input=2e932fc289ea5a5b]*/
{
    return codec_tuple(TyUnicode_EncodeCodePage(CP_ACP, str, errors),
                       TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.oem_encode
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_oem_encode_impl(TyObject *module, TyObject *str, const char *errors)
/*[clinic end generated code: output=65d5982c737de649 input=9eac86dc21eb14f2]*/
{
    return codec_tuple(TyUnicode_EncodeCodePage(CP_OEMCP, str, errors),
        TyUnicode_GET_LENGTH(str));
}

/*[clinic input]
_codecs.code_page_encode
    code_page: int
    str: unicode
    errors: str(accept={str, NoneType}) = None
    /
[clinic start generated code]*/

static TyObject *
_codecs_code_page_encode_impl(TyObject *module, int code_page, TyObject *str,
                              const char *errors)
/*[clinic end generated code: output=45673f6085657a9e input=7d18a33bc8cd0f94]*/
{
    return codec_tuple(TyUnicode_EncodeCodePage(code_page, str, errors),
                       TyUnicode_GET_LENGTH(str));
}

#endif /* MS_WINDOWS */

/* --- Error handler registry --------------------------------------------- */

/*[clinic input]
_codecs.register_error
    errors: str
    handler: object
    /

Register the specified error handler under the name errors.

handler must be a callable object, that will be called with an exception
instance containing information about the location of the encoding/decoding
error and must return a (replacement, new position) tuple.
[clinic start generated code]*/

static TyObject *
_codecs_register_error_impl(TyObject *module, const char *errors,
                            TyObject *handler)
/*[clinic end generated code: output=fa2f7d1879b3067d input=5e6709203c2e33fe]*/
{
    if (PyCodec_RegisterError(errors, handler))
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
_codecs._unregister_error -> bool
    errors: str
    /

Un-register the specified error handler for the error handling `errors'.

Only custom error handlers can be un-registered. An exception is raised
if the error handling is a built-in one (e.g., 'strict'), or if an error
occurs.

Otherwise, this returns True if a custom handler has been successfully
un-registered, and False if no custom handler for the specified error
handling exists.

[clinic start generated code]*/

static int
_codecs__unregister_error_impl(TyObject *module, const char *errors)
/*[clinic end generated code: output=28c22be667465503 input=a63ab9e9ce1686d4]*/
{
    return _PyCodec_UnregisterError(errors);
}

/*[clinic input]
_codecs.lookup_error
    name: str
    /

lookup_error(errors) -> handler

Return the error handler for the specified error handling name or raise a
LookupError, if no handler exists under this name.
[clinic start generated code]*/

static TyObject *
_codecs_lookup_error_impl(TyObject *module, const char *name)
/*[clinic end generated code: output=087f05dc0c9a98cc input=4775dd65e6235aba]*/
{
    return PyCodec_LookupError(name);
}

/* --- Module API --------------------------------------------------------- */

static TyMethodDef _codecs_functions[] = {
    _CODECS_REGISTER_METHODDEF
    _CODECS_UNREGISTER_METHODDEF
    _CODECS_LOOKUP_METHODDEF
    _CODECS_ENCODE_METHODDEF
    _CODECS_DECODE_METHODDEF
    _CODECS_ESCAPE_ENCODE_METHODDEF
    _CODECS_ESCAPE_DECODE_METHODDEF
    _CODECS_UTF_8_ENCODE_METHODDEF
    _CODECS_UTF_8_DECODE_METHODDEF
    _CODECS_UTF_7_ENCODE_METHODDEF
    _CODECS_UTF_7_DECODE_METHODDEF
    _CODECS_UTF_16_ENCODE_METHODDEF
    _CODECS_UTF_16_LE_ENCODE_METHODDEF
    _CODECS_UTF_16_BE_ENCODE_METHODDEF
    _CODECS_UTF_16_DECODE_METHODDEF
    _CODECS_UTF_16_LE_DECODE_METHODDEF
    _CODECS_UTF_16_BE_DECODE_METHODDEF
    _CODECS_UTF_16_EX_DECODE_METHODDEF
    _CODECS_UTF_32_ENCODE_METHODDEF
    _CODECS_UTF_32_LE_ENCODE_METHODDEF
    _CODECS_UTF_32_BE_ENCODE_METHODDEF
    _CODECS_UTF_32_DECODE_METHODDEF
    _CODECS_UTF_32_LE_DECODE_METHODDEF
    _CODECS_UTF_32_BE_DECODE_METHODDEF
    _CODECS_UTF_32_EX_DECODE_METHODDEF
    _CODECS_UNICODE_ESCAPE_ENCODE_METHODDEF
    _CODECS_UNICODE_ESCAPE_DECODE_METHODDEF
    _CODECS_RAW_UNICODE_ESCAPE_ENCODE_METHODDEF
    _CODECS_RAW_UNICODE_ESCAPE_DECODE_METHODDEF
    _CODECS_LATIN_1_ENCODE_METHODDEF
    _CODECS_LATIN_1_DECODE_METHODDEF
    _CODECS_ASCII_ENCODE_METHODDEF
    _CODECS_ASCII_DECODE_METHODDEF
    _CODECS_CHARMAP_ENCODE_METHODDEF
    _CODECS_CHARMAP_DECODE_METHODDEF
    _CODECS_CHARMAP_BUILD_METHODDEF
    _CODECS_READBUFFER_ENCODE_METHODDEF
    _CODECS_MBCS_ENCODE_METHODDEF
    _CODECS_MBCS_DECODE_METHODDEF
    _CODECS_OEM_ENCODE_METHODDEF
    _CODECS_OEM_DECODE_METHODDEF
    _CODECS_CODE_PAGE_ENCODE_METHODDEF
    _CODECS_CODE_PAGE_DECODE_METHODDEF
    _CODECS_REGISTER_ERROR_METHODDEF
    _CODECS__UNREGISTER_ERROR_METHODDEF
    _CODECS_LOOKUP_ERROR_METHODDEF
    {NULL, NULL}                /* sentinel */
};

static PyModuleDef_Slot _codecs_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef codecsmodule = {
        PyModuleDef_HEAD_INIT,
        "_codecs",
        NULL,
        0,
        _codecs_functions,
        _codecs_slots,
        NULL,
        NULL,
        NULL
};

PyMODINIT_FUNC
PyInit__codecs(void)
{
    return PyModuleDef_Init(&codecsmodule);
}
