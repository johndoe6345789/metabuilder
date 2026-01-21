#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
   // Need limited C API 3.14 to test TyUnicode_Equal()
#  define Ty_LIMITED_API 0x030e0000
#endif

#include "parts.h"
#include "util.h"

#include <stddef.h>               // ptrdiff_t
#include <string.h>               // memset()


static TyObject *
codec_incrementalencoder(TyObject *self, TyObject *args)
{
    const char *encoding, *errors = NULL;
    if (!TyArg_ParseTuple(args, "s|s:test_incrementalencoder",
                          &encoding, &errors))
        return NULL;
    return PyCodec_IncrementalEncoder(encoding, errors);
}

static TyObject *
codec_incrementaldecoder(TyObject *self, TyObject *args)
{
    const char *encoding, *errors = NULL;
    if (!TyArg_ParseTuple(args, "s|s:test_incrementaldecoder",
                          &encoding, &errors))
        return NULL;
    return PyCodec_IncrementalDecoder(encoding, errors);
}

static TyObject *
test_unicode_compare_with_ascii(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *py_s = TyUnicode_FromStringAndSize("str\0", 4);
    int result;
    if (py_s == NULL)
        return NULL;
    result = TyUnicode_CompareWithASCIIString(py_s, "str");
    Ty_DECREF(py_s);
    if (!result) {
        TyErr_SetString(TyExc_AssertionError, "Python string ending in NULL "
                        "should not compare equal to c string.");
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
test_widechar(TyObject *self, TyObject *Py_UNUSED(ignored))
{
#if defined(SIZEOF_WCHAR_T) && (SIZEOF_WCHAR_T == 4)
    const wchar_t wtext[2] = {(wchar_t)0x10ABCDu};
    size_t wtextlen = 1;
    const wchar_t invalid[1] = {(wchar_t)0x110000u};
#else
    const wchar_t wtext[3] = {(wchar_t)0xDBEAu, (wchar_t)0xDFCDu};
    size_t wtextlen = 2;
#endif
    TyObject *wide, *utf8;

    wide = TyUnicode_FromWideChar(wtext, wtextlen);
    if (wide == NULL)
        return NULL;

    utf8 = TyUnicode_FromString("\xf4\x8a\xaf\x8d");
    if (utf8 == NULL) {
        Ty_DECREF(wide);
        return NULL;
    }

    if (TyUnicode_GetLength(wide) != TyUnicode_GetLength(utf8)) {
        Ty_DECREF(wide);
        Ty_DECREF(utf8);
        TyErr_SetString(TyExc_AssertionError,
                        "test_widechar: "
                        "wide string and utf8 string "
                        "have different length");
        return NULL;
    }
    if (TyUnicode_Compare(wide, utf8)) {
        Ty_DECREF(wide);
        Ty_DECREF(utf8);
        if (TyErr_Occurred())
            return NULL;
        TyErr_SetString(TyExc_AssertionError,
                        "test_widechar: "
                        "wide string and utf8 string "
                        "are different");
        return NULL;
    }

    Ty_DECREF(wide);
    Ty_DECREF(utf8);

#if defined(SIZEOF_WCHAR_T) && (SIZEOF_WCHAR_T == 4)
    wide = TyUnicode_FromWideChar(invalid, 1);
    if (wide == NULL)
        TyErr_Clear();
    else {
        TyErr_SetString(TyExc_AssertionError,
                        "test_widechar: "
                        "TyUnicode_FromWideChar(L\"\\U00110000\", 1) didn't fail");
        return NULL;
    }
#endif
    Py_RETURN_NONE;
}


static TyObject *
unicode_copy(TyObject *unicode)
{
    if (!unicode) {
        return NULL;
    }
    if (!TyUnicode_Check(unicode)) {
        Ty_INCREF(unicode);
        return unicode;
    }

    // Create a new string by encoding to UTF-8 and then decode from UTF-8
    TyObject *utf8 = TyUnicode_AsUTF8String(unicode);
    if (!utf8) {
        return NULL;
    }

    TyObject *copy = TyUnicode_DecodeUTF8(
        TyBytes_AsString(utf8),
        TyBytes_Size(utf8),
        NULL);
    Ty_DECREF(utf8);

    return copy;
}

/* Test TyUnicode_WriteChar() */
static TyObject *
unicode_writechar(TyObject *self, TyObject *args)
{
    TyObject *to, *to_copy;
    Ty_ssize_t index;
    unsigned int character;
    int result;

    if (!TyArg_ParseTuple(args, "OnI", &to, &index, &character)) {
        return NULL;
    }

    NULLABLE(to);
    if (!(to_copy = unicode_copy(to)) && to) {
        return NULL;
    }

    result = TyUnicode_WriteChar(to_copy, index, (Ty_UCS4)character);
    if (result == -1 && TyErr_Occurred()) {
        Ty_DECREF(to_copy);
        return NULL;
    }
    return Ty_BuildValue("(Ni)", to_copy, result);
}

static void
unicode_fill(TyObject *str, Ty_ssize_t start, Ty_ssize_t end, Ty_UCS4 ch)
{
    assert(0 <= start);
    assert(end <= TyUnicode_GetLength(str));
    for (Ty_ssize_t i = start; i < end; i++) {
        int res = TyUnicode_WriteChar(str, i, ch);
        assert(res == 0);
    }
}


/* Test TyUnicode_Resize() */
static TyObject *
unicode_resize(TyObject *self, TyObject *args)
{
    TyObject *obj, *copy;
    Ty_ssize_t length;
    int result;

    if (!TyArg_ParseTuple(args, "On", &obj, &length)) {
        return NULL;
    }

    NULLABLE(obj);
    if (!(copy = unicode_copy(obj)) && obj) {
        return NULL;
    }
    result = TyUnicode_Resize(&copy, length);
    if (result == -1 && TyErr_Occurred()) {
        Ty_XDECREF(copy);
        return NULL;
    }
    if (obj && TyUnicode_Check(obj) && length > TyUnicode_GetLength(obj)) {
        unicode_fill(copy, TyUnicode_GetLength(obj), length, 0U);
    }
    return Ty_BuildValue("(Ni)", copy, result);
}

/* Test TyUnicode_Append() */
static TyObject *
unicode_append(TyObject *self, TyObject *args)
{
    TyObject *left, *right, *left_copy;

    if (!TyArg_ParseTuple(args, "OO", &left, &right))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    if (!(left_copy = unicode_copy(left)) && left) {
        return NULL;
    }
    TyUnicode_Append(&left_copy, right);
    return left_copy;
}

/* Test TyUnicode_AppendAndDel() */
static TyObject *
unicode_appendanddel(TyObject *self, TyObject *args)
{
    TyObject *left, *right, *left_copy;

    if (!TyArg_ParseTuple(args, "OO", &left, &right))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    if (!(left_copy = unicode_copy(left)) && left) {
        return NULL;
    }
    Ty_XINCREF(right);
    TyUnicode_AppendAndDel(&left_copy, right);
    return left_copy;
}

/* Test TyUnicode_FromStringAndSize() */
static TyObject *
unicode_fromstringandsize(TyObject *self, TyObject *args)
{
    const char *s;
    Ty_ssize_t bsize;
    Ty_ssize_t size = -100;

    if (!TyArg_ParseTuple(args, "z#|n", &s, &bsize, &size)) {
        return NULL;
    }

    if (size == -100) {
        size = bsize;
    }
    return TyUnicode_FromStringAndSize(s, size);
}

/* Test TyUnicode_FromString() */
static TyObject *
unicode_fromstring(TyObject *self, TyObject *arg)
{
    const char *s;
    Ty_ssize_t size;

    if (!TyArg_Parse(arg, "z#", &s, &size)) {
        return NULL;
    }
    return TyUnicode_FromString(s);
}

/* Test TyUnicode_Substring() */
static TyObject *
unicode_substring(TyObject *self, TyObject *args)
{
    TyObject *str;
    Ty_ssize_t start, end;

    if (!TyArg_ParseTuple(args, "Onn", &str, &start, &end)) {
        return NULL;
    }

    NULLABLE(str);
    return TyUnicode_Substring(str, start, end);
}

/* Test TyUnicode_GetLength() */
static TyObject *
unicode_getlength(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    RETURN_SIZE(TyUnicode_GetLength(arg));
}

/* Test TyUnicode_ReadChar() */
static TyObject *
unicode_readchar(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_ssize_t index;
    Ty_UCS4 result;

    if (!TyArg_ParseTuple(args, "On", &unicode, &index)) {
        return NULL;
    }

    NULLABLE(unicode);
    result = TyUnicode_ReadChar(unicode, index);
    if (result == (Ty_UCS4)-1)
        return NULL;
    return TyLong_FromUnsignedLong(result);
}

/* Test TyUnicode_FromEncodedObject() */
static TyObject *
unicode_fromencodedobject(TyObject *self, TyObject *args)
{
    TyObject *obj;
    const char *encoding;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "Oz|z", &obj, &encoding, &errors)) {
        return NULL;
    }

    NULLABLE(obj);
    return TyUnicode_FromEncodedObject(obj, encoding, errors);
}

/* Test TyUnicode_FromObject() */
static TyObject *
unicode_fromobject(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_FromObject(arg);
}

/* Test TyUnicode_InternInPlace() */
static TyObject *
unicode_interninplace(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    Ty_XINCREF(arg);
    TyUnicode_InternInPlace(&arg);
    return arg;
}

/* Test TyUnicode_InternFromString() */
static TyObject *
unicode_internfromstring(TyObject *self, TyObject *arg)
{
    const char *s;
    Ty_ssize_t size;

    if (!TyArg_Parse(arg, "z#", &s, &size)) {
        return NULL;
    }
    return TyUnicode_InternFromString(s);
}

/* Test TyUnicode_FromWideChar() */
static TyObject *
unicode_fromwidechar(TyObject *self, TyObject *args)
{
    const char *s;
    Ty_ssize_t bsize;
    Ty_ssize_t size = -100;

    if (!TyArg_ParseTuple(args, "z#|n", &s, &bsize, &size)) {
        return NULL;
    }
    if (size == -100) {
        if (bsize % SIZEOF_WCHAR_T) {
            TyErr_SetString(TyExc_AssertionError,
                            "invalid size in unicode_fromwidechar()");
            return NULL;
        }
        size = bsize / SIZEOF_WCHAR_T;
    }
    return TyUnicode_FromWideChar((const wchar_t *)s, size);
}

/* Test TyUnicode_AsWideChar() */
static TyObject *
unicode_aswidechar(TyObject *self, TyObject *args)
{
    TyObject *unicode, *result;
    Ty_ssize_t buflen, size;
    wchar_t *buffer;

    if (!TyArg_ParseTuple(args, "On", &unicode, &buflen))
        return NULL;
    NULLABLE(unicode);
    buffer = TyMem_New(wchar_t, buflen);
    if (buffer == NULL)
        return TyErr_NoMemory();

    size = TyUnicode_AsWideChar(unicode, buffer, buflen);
    if (size == -1) {
        TyMem_Free(buffer);
        return NULL;
    }

    if (size < buflen)
        buflen = size + 1;
    else
        buflen = size;
    result = TyUnicode_FromWideChar(buffer, buflen);
    TyMem_Free(buffer);
    if (result == NULL)
        return NULL;

    return Ty_BuildValue("(Nn)", result, size);
}

/* Test TyUnicode_AsWideCharString() with NULL as buffer */
static TyObject *
unicode_aswidechar_null(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_ssize_t buflen;

    if (!TyArg_ParseTuple(args, "On", &unicode, &buflen))
        return NULL;
    NULLABLE(unicode);
    RETURN_SIZE(TyUnicode_AsWideChar(unicode, NULL, buflen));
}

/* Test TyUnicode_AsWideCharString() */
static TyObject *
unicode_aswidecharstring(TyObject *self, TyObject *args)
{
    TyObject *unicode, *result;
    Ty_ssize_t size = UNINITIALIZED_SIZE;
    wchar_t *buffer;

    if (!TyArg_ParseTuple(args, "O", &unicode))
        return NULL;

    NULLABLE(unicode);
    buffer = TyUnicode_AsWideCharString(unicode, &size);
    if (buffer == NULL) {
        assert(size == UNINITIALIZED_SIZE);
        return NULL;
    }

    result = TyUnicode_FromWideChar(buffer, size + 1);
    TyMem_Free(buffer);
    if (result == NULL)
        return NULL;
    return Ty_BuildValue("(Nn)", result, size);
}

/* Test TyUnicode_AsWideCharString() with NULL as the size address */
static TyObject *
unicode_aswidecharstring_null(TyObject *self, TyObject *args)
{
    TyObject *unicode, *result;
    wchar_t *buffer;

    if (!TyArg_ParseTuple(args, "O", &unicode))
        return NULL;

    NULLABLE(unicode);
    buffer = TyUnicode_AsWideCharString(unicode, NULL);
    if (buffer == NULL)
        return NULL;

    result = TyUnicode_FromWideChar(buffer, -1);
    TyMem_Free(buffer);
    if (result == NULL)
        return NULL;
    return result;
}


/* Test TyUnicode_FromOrdinal() */
static TyObject *
unicode_fromordinal(TyObject *self, TyObject *args)
{
    int ordinal;

    if (!TyArg_ParseTuple(args, "i", &ordinal))
        return NULL;

    return TyUnicode_FromOrdinal(ordinal);
}

/* Test TyUnicode_AsUTF8AndSize() */
static TyObject *
unicode_asutf8andsize(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_ssize_t buflen;
    const char *s;
    Ty_ssize_t size = UNINITIALIZED_SIZE;

    if (!TyArg_ParseTuple(args, "On", &unicode, &buflen))
        return NULL;

    NULLABLE(unicode);
    s = TyUnicode_AsUTF8AndSize(unicode, &size);
    if (s == NULL) {
        assert(size == -1);
        return NULL;
    }

    return Ty_BuildValue("(y#n)", s, buflen, size);
}

/* Test TyUnicode_AsUTF8AndSize() with NULL as the size address */
static TyObject *
unicode_asutf8andsize_null(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_ssize_t buflen;
    const char *s;

    if (!TyArg_ParseTuple(args, "On", &unicode, &buflen))
        return NULL;

    NULLABLE(unicode);
    s = TyUnicode_AsUTF8AndSize(unicode, NULL);
    if (s == NULL)
        return NULL;

    return TyBytes_FromStringAndSize(s, buflen);
}

/* Test TyUnicode_GetDefaultEncoding() */
static TyObject *
unicode_getdefaultencoding(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    const char *s = TyUnicode_GetDefaultEncoding();
    if (s == NULL)
        return NULL;

    return TyBytes_FromString(s);
}

/* Test TyUnicode_Decode() */
static TyObject *
unicode_decode(TyObject *self, TyObject *args)
{
    const char *s;
    Ty_ssize_t size;
    const char *encoding;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#z|z", &s, &size, &encoding, &errors))
        return NULL;

    return TyUnicode_Decode(s, size, encoding, errors);
}

/* Test TyUnicode_AsEncodedString() */
static TyObject *
unicode_asencodedstring(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    const char *encoding;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "Oz|z", &unicode, &encoding, &errors))
        return NULL;

    NULLABLE(unicode);
    return TyUnicode_AsEncodedString(unicode, encoding, errors);
}

/* Test TyUnicode_BuildEncodingMap() */
static TyObject *
unicode_buildencodingmap(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_BuildEncodingMap(arg);
}

/* Test TyUnicode_DecodeUTF7() */
static TyObject *
unicode_decodeutf7(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeUTF7(data, size, errors);
}

/* Test TyUnicode_DecodeUTF7Stateful() */
static TyObject *
unicode_decodeutf7stateful(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF7Stateful(data, size, errors, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(Nn)", result, consumed);
}

/* Test TyUnicode_DecodeUTF8() */
static TyObject *
unicode_decodeutf8(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeUTF8(data, size, errors);
}

/* Test TyUnicode_DecodeUTF8Stateful() */
static TyObject *
unicode_decodeutf8stateful(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF8Stateful(data, size, errors, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(Nn)", result, consumed);
}

/* Test TyUnicode_AsUTF8String() */
static TyObject *
unicode_asutf8string(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsUTF8String(arg);
}

/* Test TyUnicode_DecodeUTF32() */
static TyObject *
unicode_decodeutf32(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    int byteorder = UNINITIALIZED_INT;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "iy#|z", &byteorder, &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF32(data, size, errors, &byteorder);
    if (!result) {
        return NULL;
    }
    return Ty_BuildValue("(iN)", byteorder, result);
}

/* Test TyUnicode_DecodeUTF32Stateful() */
static TyObject *
unicode_decodeutf32stateful(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    int byteorder = UNINITIALIZED_INT;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "iy#|z", &byteorder, &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF32Stateful(data, size, errors, &byteorder, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(iNn)", byteorder, result, consumed);
}

/* Test TyUnicode_AsUTF32String() */
static TyObject *
unicode_asutf32string(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsUTF32String(arg);
}

/* Test TyUnicode_DecodeUTF16() */
static TyObject *
unicode_decodeutf16(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    int byteorder = UNINITIALIZED_INT;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "iy#|z", &byteorder, &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF16(data, size, errors, &byteorder);
    if (!result) {
        return NULL;
    }
    return Ty_BuildValue("(iN)", byteorder, result);
}

/* Test TyUnicode_DecodeUTF16Stateful() */
static TyObject *
unicode_decodeutf16stateful(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    int byteorder = UNINITIALIZED_INT;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "iy#|z", &byteorder, &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeUTF16Stateful(data, size, errors, &byteorder, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(iNn)", byteorder, result, consumed);
}

/* Test TyUnicode_AsUTF16String() */
static TyObject *
unicode_asutf16string(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsUTF16String(arg);
}

/* Test TyUnicode_DecodeUnicodeEscape() */
static TyObject *
unicode_decodeunicodeescape(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeUnicodeEscape(data, size, errors);
}

/* Test TyUnicode_AsUnicodeEscapeString() */
static TyObject *
unicode_asunicodeescapestring(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsUnicodeEscapeString(arg);
}

static TyObject *
unicode_decoderawunicodeescape(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeRawUnicodeEscape(data, size, errors);
}

/* Test TyUnicode_AsRawUnicodeEscapeString() */
static TyObject *
unicode_asrawunicodeescapestring(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsRawUnicodeEscapeString(arg);
}

static TyObject *
unicode_decodelatin1(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeLatin1(data, size, errors);
}

/* Test TyUnicode_AsLatin1String() */
static TyObject *
unicode_aslatin1string(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsLatin1String(arg);
}

/* Test TyUnicode_DecodeASCII() */
static TyObject *
unicode_decodeascii(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeASCII(data, size, errors);
}

/* Test TyUnicode_AsASCIIString() */
static TyObject *
unicode_asasciistring(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsASCIIString(arg);
}

/* Test TyUnicode_DecodeCharmap() */
static TyObject *
unicode_decodecharmap(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    TyObject *mapping;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#O|z", &data, &size, &mapping, &errors))
        return NULL;

    NULLABLE(mapping);
    return TyUnicode_DecodeCharmap(data, size, mapping, errors);
}

/* Test TyUnicode_AsCharmapString() */
static TyObject *
unicode_ascharmapstring(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    TyObject *mapping;

    if (!TyArg_ParseTuple(args, "OO", &unicode, &mapping))
        return NULL;

    NULLABLE(unicode);
    NULLABLE(mapping);
    return TyUnicode_AsCharmapString(unicode, mapping);
}

#ifdef MS_WINDOWS

/* Test TyUnicode_DecodeMBCS() */
static TyObject *
unicode_decodembcs(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeMBCS(data, size, errors);
}

/* Test TyUnicode_DecodeMBCSStateful() */
static TyObject *
unicode_decodembcsstateful(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeMBCSStateful(data, size, errors, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(Nn)", result, consumed);
}

/* Test TyUnicode_DecodeCodePageStateful() */
static TyObject *
unicode_decodecodepagestateful(TyObject *self, TyObject *args)
{
    int code_page;
    const char *data;
    Ty_ssize_t size;
    const char *errors = NULL;
    Ty_ssize_t consumed = UNINITIALIZED_SIZE;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "iy#|z", &code_page, &data, &size, &errors))
        return NULL;

    result = TyUnicode_DecodeCodePageStateful(code_page, data, size, errors, &consumed);
    if (!result) {
        assert(consumed == UNINITIALIZED_SIZE);
        return NULL;
    }
    return Ty_BuildValue("(Nn)", result, consumed);
}

/* Test TyUnicode_AsMBCSString() */
static TyObject *
unicode_asmbcsstring(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_AsMBCSString(arg);
}

/* Test TyUnicode_EncodeCodePage() */
static TyObject *
unicode_encodecodepage(TyObject *self, TyObject *args)
{
    int code_page;
    TyObject *unicode;
    const char *errors;

    if (!TyArg_ParseTuple(args, "iO|z", &code_page, &unicode, &errors))
        return NULL;

    NULLABLE(unicode);
    return TyUnicode_EncodeCodePage(code_page, unicode, errors);
}

#endif /* MS_WINDOWS */

/* Test TyUnicode_DecodeLocaleAndSize() */
static TyObject *
unicode_decodelocaleandsize(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeLocaleAndSize(data, size, errors);
}

/* Test TyUnicode_DecodeLocale() */
static TyObject *
unicode_decodelocale(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;
    const char *errors;

    if (!TyArg_ParseTuple(args, "y#|z", &data, &size, &errors))
        return NULL;

    return TyUnicode_DecodeLocale(data, errors);
}

/* Test TyUnicode_EncodeLocale() */
static TyObject *
unicode_encodelocale(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    const char *errors;

    if (!TyArg_ParseTuple(args, "O|z", &unicode, &errors))
        return NULL;

    NULLABLE(unicode);
    return TyUnicode_EncodeLocale(unicode, errors);
}

/* Test TyUnicode_DecodeFSDefault() */
static TyObject *
unicode_decodefsdefault(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "y#", &data, &size))
        return NULL;

    return TyUnicode_DecodeFSDefault(data);
}

/* Test TyUnicode_DecodeFSDefaultAndSize() */
static TyObject *
unicode_decodefsdefaultandsize(TyObject *self, TyObject *args)
{
    const char *data;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "y#|n", &data, &size, &size))
        return NULL;

    return TyUnicode_DecodeFSDefaultAndSize(data, size);
}

/* Test TyUnicode_EncodeFSDefault() */
static TyObject *
unicode_encodefsdefault(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    return TyUnicode_EncodeFSDefault(arg);
}

/* Test TyUnicode_Concat() */
static TyObject *
unicode_concat(TyObject *self, TyObject *args)
{
    TyObject *left;
    TyObject *right;

    if (!TyArg_ParseTuple(args, "OO", &left, &right))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    return TyUnicode_Concat(left, right);
}

/* Test TyUnicode_Split() */
static TyObject *
unicode_split(TyObject *self, TyObject *args)
{
    TyObject *s;
    TyObject *sep;
    Ty_ssize_t maxsplit = -1;

    if (!TyArg_ParseTuple(args, "OO|n", &s, &sep, &maxsplit))
        return NULL;

    NULLABLE(s);
    NULLABLE(sep);
    return TyUnicode_Split(s, sep, maxsplit);
}

/* Test TyUnicode_RSplit() */
static TyObject *
unicode_rsplit(TyObject *self, TyObject *args)
{
    TyObject *s;
    TyObject *sep;
    Ty_ssize_t maxsplit = -1;

    if (!TyArg_ParseTuple(args, "OO|n", &s, &sep, &maxsplit))
        return NULL;

    NULLABLE(s);
    NULLABLE(sep);
    return TyUnicode_RSplit(s, sep, maxsplit);
}

/* Test TyUnicode_Splitlines() */
static TyObject *
unicode_splitlines(TyObject *self, TyObject *args)
{
    TyObject *s;
    int keepends = 0;

    if (!TyArg_ParseTuple(args, "O|i", &s, &keepends))
        return NULL;

    NULLABLE(s);
    return TyUnicode_Splitlines(s, keepends);
}

/* Test TyUnicode_Partition() */
static TyObject *
unicode_partition(TyObject *self, TyObject *args)
{
    TyObject *s;
    TyObject *sep;

    if (!TyArg_ParseTuple(args, "OO", &s, &sep))
        return NULL;

    NULLABLE(s);
    NULLABLE(sep);
    return TyUnicode_Partition(s, sep);
}

/* Test TyUnicode_RPartition() */
static TyObject *
unicode_rpartition(TyObject *self, TyObject *args)
{
    TyObject *s;
    TyObject *sep;

    if (!TyArg_ParseTuple(args, "OO", &s, &sep))
        return NULL;

    NULLABLE(s);
    NULLABLE(sep);
    return TyUnicode_RPartition(s, sep);
}

/* Test TyUnicode_Translate() */
static TyObject *
unicode_translate(TyObject *self, TyObject *args)
{
    TyObject *obj;
    TyObject *table;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "OO|z", &obj, &table, &errors))
        return NULL;

    NULLABLE(obj);
    NULLABLE(table);
    return TyUnicode_Translate(obj, table, errors);
}

/* Test TyUnicode_Join() */
static TyObject *
unicode_join(TyObject *self, TyObject *args)
{
    TyObject *sep;
    TyObject *seq;

    if (!TyArg_ParseTuple(args, "OO", &sep, &seq))
        return NULL;

    NULLABLE(sep);
    NULLABLE(seq);
    return TyUnicode_Join(sep, seq);
}

/* Test TyUnicode_Count() */
static TyObject *
unicode_count(TyObject *self, TyObject *args)
{
    TyObject *str;
    TyObject *substr;
    Ty_ssize_t start;
    Ty_ssize_t end;

    if (!TyArg_ParseTuple(args, "OOnn", &str, &substr, &start, &end))
        return NULL;

    NULLABLE(str);
    NULLABLE(substr);
    RETURN_SIZE(TyUnicode_Count(str, substr, start, end));
}

/* Test TyUnicode_Find() */
static TyObject *
unicode_find(TyObject *self, TyObject *args)
{
    TyObject *str;
    TyObject *substr;
    Ty_ssize_t start;
    Ty_ssize_t end;
    int direction;
    Ty_ssize_t result;

    if (!TyArg_ParseTuple(args, "OOnni", &str, &substr, &start, &end, &direction))
        return NULL;

    NULLABLE(str);
    NULLABLE(substr);
    result = TyUnicode_Find(str, substr, start, end, direction);
    if (result == -2) {
        assert(TyErr_Occurred());
        return NULL;
    }
    assert(!TyErr_Occurred());
    return TyLong_FromSsize_t(result);
}

/* Test TyUnicode_Tailmatch() */
static TyObject *
unicode_tailmatch(TyObject *self, TyObject *args)
{
    TyObject *str;
    TyObject *substr;
    Ty_ssize_t start;
    Ty_ssize_t end;
    int direction;

    if (!TyArg_ParseTuple(args, "OOnni", &str, &substr, &start, &end, &direction))
        return NULL;

    NULLABLE(str);
    NULLABLE(substr);
    RETURN_SIZE(TyUnicode_Tailmatch(str, substr, start, end, direction));
}

/* Test TyUnicode_FindChar() */
static TyObject *
unicode_findchar(TyObject *self, TyObject *args)
{
    TyObject *str;
    int direction;
    unsigned int ch;
    Ty_ssize_t result;
    Ty_ssize_t start, end;

    if (!TyArg_ParseTuple(args, "OInni:unicode_findchar", &str, &ch,
                          &start, &end, &direction)) {
        return NULL;
    }
    NULLABLE(str);
    result = TyUnicode_FindChar(str, (Ty_UCS4)ch, start, end, direction);
    if (result == -2) {
        assert(TyErr_Occurred());
        return NULL;
    }
    assert(!TyErr_Occurred());
    return TyLong_FromSsize_t(result);
}

/* Test TyUnicode_Replace() */
static TyObject *
unicode_replace(TyObject *self, TyObject *args)
{
    TyObject *str;
    TyObject *substr;
    TyObject *replstr;
    Ty_ssize_t maxcount = -1;

    if (!TyArg_ParseTuple(args, "OOO|n", &str, &substr, &replstr, &maxcount))
        return NULL;

    NULLABLE(str);
    NULLABLE(substr);
    NULLABLE(replstr);
    return TyUnicode_Replace(str, substr, replstr, maxcount);
}

/* Test TyUnicode_Compare() */
static TyObject *
unicode_compare(TyObject *self, TyObject *args)
{
    TyObject *left;
    TyObject *right;
    int result;

    if (!TyArg_ParseTuple(args, "OO", &left, &right))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    result = TyUnicode_Compare(left, right);
    if (result == -1 && TyErr_Occurred()) {
        return NULL;
    }
    assert(!TyErr_Occurred());
    return TyLong_FromLong(result);
}

/* Test TyUnicode_CompareWithASCIIString() */
static TyObject *
unicode_comparewithasciistring(TyObject *self, TyObject *args)
{
    TyObject *left;
    const char *right = NULL;
    Ty_ssize_t right_len;
    int result;

    if (!TyArg_ParseTuple(args, "O|y#", &left, &right, &right_len))
        return NULL;

    NULLABLE(left);
    result = TyUnicode_CompareWithASCIIString(left, right);
    if (result == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromLong(result);
}

/* Test TyUnicode_EqualToUTF8() */
static TyObject *
unicode_equaltoutf8(TyObject *self, TyObject *args)
{
    TyObject *left;
    const char *right = NULL;
    Ty_ssize_t right_len;
    int result;

    if (!TyArg_ParseTuple(args, "Oz#", &left, &right, &right_len)) {
        return NULL;
    }

    NULLABLE(left);
    result = TyUnicode_EqualToUTF8(left, right);
    assert(!TyErr_Occurred());
    return TyLong_FromLong(result);
}

/* Test TyUnicode_EqualToUTF8AndSize() */
static TyObject *
unicode_equaltoutf8andsize(TyObject *self, TyObject *args)
{
    TyObject *left;
    const char *right = NULL;
    Ty_ssize_t right_len;
    Ty_ssize_t size = -100;
    int result;

    if (!TyArg_ParseTuple(args, "Oz#|n", &left, &right, &right_len, &size)) {
        return NULL;
    }

    NULLABLE(left);
    if (size == -100) {
        size = right_len;
    }
    result = TyUnicode_EqualToUTF8AndSize(left, right, size);
    assert(!TyErr_Occurred());
    return TyLong_FromLong(result);
}

/* Test TyUnicode_RichCompare() */
static TyObject *
unicode_richcompare(TyObject *self, TyObject *args)
{
    TyObject *left;
    TyObject *right;
    int op;

    if (!TyArg_ParseTuple(args, "OOi", &left, &right, &op))
        return NULL;

    NULLABLE(left);
    NULLABLE(right);
    return TyUnicode_RichCompare(left, right, op);
}

/* Test TyUnicode_Format() */
static TyObject *
unicode_format(TyObject *self, TyObject *args)
{
    TyObject *format;
    TyObject *fargs;

    if (!TyArg_ParseTuple(args, "OO", &format, &fargs))
        return NULL;

    NULLABLE(format);
    NULLABLE(fargs);
    return TyUnicode_Format(format, fargs);
}

/* Test TyUnicode_Contains() */
static TyObject *
unicode_contains(TyObject *self, TyObject *args)
{
    TyObject *container;
    TyObject *element;

    if (!TyArg_ParseTuple(args, "OO", &container, &element))
        return NULL;

    NULLABLE(container);
    NULLABLE(element);
    RETURN_INT(TyUnicode_Contains(container, element));
}

/* Test TyUnicode_IsIdentifier() */
static TyObject *
unicode_isidentifier(TyObject *self, TyObject *arg)
{
    NULLABLE(arg);
    RETURN_INT(TyUnicode_IsIdentifier(arg));
}


static int
check_raised_systemerror(TyObject *result, char* msg)
{
    if (result) {
        // no exception
        TyErr_Format(TyExc_AssertionError,
                     "SystemError not raised: %s",
                     msg);
        return 0;
    }
    if (TyErr_ExceptionMatches(TyExc_SystemError)) {
        // expected exception
        TyErr_Clear();
        return 1;
    }
    // unexpected exception
    return 0;
}

static TyObject *
test_string_from_format(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *result;
    TyObject *unicode = TyUnicode_FromString("None");

#define CHECK_FORMAT_2(FORMAT, EXPECTED, ARG1, ARG2)                \
    result = TyUnicode_FromFormat(FORMAT, ARG1, ARG2);              \
    if (EXPECTED == NULL) {                                         \
        if (!check_raised_systemerror(result, FORMAT)) {            \
            goto Fail;                                              \
        }                                                           \
    }                                                               \
    else if (result == NULL)                                        \
        return NULL;                                                \
    else if (TyUnicode_CompareWithASCIIString(result, EXPECTED) != 0) { \
        TyObject *utf8 = TyUnicode_AsUTF8String(result);            \
        TyErr_Format(TyExc_AssertionError,                          \
                     "test_string_from_format: failed at \"%s\" "   \
                     "expected \"%s\" got \"%s\"",                  \
                     FORMAT, EXPECTED, utf8);                       \
        Ty_XDECREF(utf8);                                           \
        goto Fail;                                                  \
    }                                                               \
    Ty_XDECREF(result)

#define CHECK_FORMAT_1(FORMAT, EXPECTED, ARG)                       \
    CHECK_FORMAT_2(FORMAT, EXPECTED, ARG, 0)

#define CHECK_FORMAT_0(FORMAT, EXPECTED)                            \
    CHECK_FORMAT_2(FORMAT, EXPECTED, 0, 0)

    // Unrecognized
    CHECK_FORMAT_2("%u %? %u", NULL, 1, 2);

    // "%%" (options are rejected)
    CHECK_FORMAT_0(  "%%", "%");
    CHECK_FORMAT_0( "%0%", NULL);
    CHECK_FORMAT_0("%00%", NULL);
    CHECK_FORMAT_0( "%2%", NULL);
    CHECK_FORMAT_0("%02%", NULL);
    CHECK_FORMAT_0("%.0%", NULL);
    CHECK_FORMAT_0("%.2%", NULL);

    // "%c"
    CHECK_FORMAT_1(  "%c", "c", 'c');
    CHECK_FORMAT_1( "%0c", "c", 'c');
    CHECK_FORMAT_1("%00c", "c", 'c');
    CHECK_FORMAT_1( "%2c", NULL, 'c');
    CHECK_FORMAT_1("%02c", NULL, 'c');
    CHECK_FORMAT_1("%.0c", NULL, 'c');
    CHECK_FORMAT_1("%.2c", NULL, 'c');

    // Integers
    CHECK_FORMAT_1("%d",             "123",                (int)123);
    CHECK_FORMAT_1("%i",             "123",                (int)123);
    CHECK_FORMAT_1("%u",             "123",       (unsigned int)123);
    CHECK_FORMAT_1("%x",              "7b",       (unsigned int)123);
    CHECK_FORMAT_1("%X",              "7B",       (unsigned int)123);
    CHECK_FORMAT_1("%o",             "173",       (unsigned int)123);
    CHECK_FORMAT_1("%ld",            "123",               (long)123);
    CHECK_FORMAT_1("%li",            "123",               (long)123);
    CHECK_FORMAT_1("%lu",            "123",      (unsigned long)123);
    CHECK_FORMAT_1("%lx",             "7b",      (unsigned long)123);
    CHECK_FORMAT_1("%lX",             "7B",      (unsigned long)123);
    CHECK_FORMAT_1("%lo",            "173",      (unsigned long)123);
    CHECK_FORMAT_1("%lld",           "123",          (long long)123);
    CHECK_FORMAT_1("%lli",           "123",          (long long)123);
    CHECK_FORMAT_1("%llu",           "123", (unsigned long long)123);
    CHECK_FORMAT_1("%llx",            "7b", (unsigned long long)123);
    CHECK_FORMAT_1("%llX",            "7B", (unsigned long long)123);
    CHECK_FORMAT_1("%llo",           "173", (unsigned long long)123);
    CHECK_FORMAT_1("%zd",            "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%zi",            "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%zu",            "123",             (size_t)123);
    CHECK_FORMAT_1("%zx",             "7b",             (size_t)123);
    CHECK_FORMAT_1("%zX",             "7B",             (size_t)123);
    CHECK_FORMAT_1("%zo",            "173",             (size_t)123);
    CHECK_FORMAT_1("%td",            "123",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%ti",            "123",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%tu",            "123",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%tx",             "7b",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%tX",             "7B",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%to",            "173",          (ptrdiff_t)123);
    CHECK_FORMAT_1("%jd",            "123",           (intmax_t)123);
    CHECK_FORMAT_1("%ji",            "123",           (intmax_t)123);
    CHECK_FORMAT_1("%ju",            "123",          (uintmax_t)123);
    CHECK_FORMAT_1("%jx",             "7b",          (uintmax_t)123);
    CHECK_FORMAT_1("%jX",             "7B",          (uintmax_t)123);
    CHECK_FORMAT_1("%jo",            "173",          (uintmax_t)123);

    CHECK_FORMAT_1("%d",            "-123",               (int)-123);
    CHECK_FORMAT_1("%i",            "-123",               (int)-123);
    CHECK_FORMAT_1("%ld",           "-123",              (long)-123);
    CHECK_FORMAT_1("%li",           "-123",              (long)-123);
    CHECK_FORMAT_1("%lld",          "-123",         (long long)-123);
    CHECK_FORMAT_1("%lli",          "-123",         (long long)-123);
    CHECK_FORMAT_1("%zd",           "-123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%zi",           "-123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%td",           "-123",         (ptrdiff_t)-123);
    CHECK_FORMAT_1("%ti",           "-123",         (ptrdiff_t)-123);
    CHECK_FORMAT_1("%jd",           "-123",          (intmax_t)-123);
    CHECK_FORMAT_1("%ji",           "-123",          (intmax_t)-123);

    // Integers: width < length
    CHECK_FORMAT_1("%1d",            "123",                (int)123);
    CHECK_FORMAT_1("%1i",            "123",                (int)123);
    CHECK_FORMAT_1("%1u",            "123",       (unsigned int)123);
    CHECK_FORMAT_1("%1ld",           "123",               (long)123);
    CHECK_FORMAT_1("%1li",           "123",               (long)123);
    CHECK_FORMAT_1("%1lu",           "123",      (unsigned long)123);
    CHECK_FORMAT_1("%1lld",          "123",          (long long)123);
    CHECK_FORMAT_1("%1lli",          "123",          (long long)123);
    CHECK_FORMAT_1("%1llu",          "123", (unsigned long long)123);
    CHECK_FORMAT_1("%1zd",           "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%1zi",           "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%1zu",           "123",             (size_t)123);
    CHECK_FORMAT_1("%1x",             "7b",                (int)123);

    CHECK_FORMAT_1("%1d",           "-123",               (int)-123);
    CHECK_FORMAT_1("%1i",           "-123",               (int)-123);
    CHECK_FORMAT_1("%1ld",          "-123",              (long)-123);
    CHECK_FORMAT_1("%1li",          "-123",              (long)-123);
    CHECK_FORMAT_1("%1lld",         "-123",         (long long)-123);
    CHECK_FORMAT_1("%1lli",         "-123",         (long long)-123);
    CHECK_FORMAT_1("%1zd",          "-123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%1zi",          "-123",        (Ty_ssize_t)-123);

    // Integers: width > length
    CHECK_FORMAT_1("%5d",          "  123",                (int)123);
    CHECK_FORMAT_1("%5i",          "  123",                (int)123);
    CHECK_FORMAT_1("%5u",          "  123",       (unsigned int)123);
    CHECK_FORMAT_1("%5ld",         "  123",               (long)123);
    CHECK_FORMAT_1("%5li",         "  123",               (long)123);
    CHECK_FORMAT_1("%5lu",         "  123",      (unsigned long)123);
    CHECK_FORMAT_1("%5lld",        "  123",          (long long)123);
    CHECK_FORMAT_1("%5lli",        "  123",          (long long)123);
    CHECK_FORMAT_1("%5llu",        "  123", (unsigned long long)123);
    CHECK_FORMAT_1("%5zd",         "  123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%5zi",         "  123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%5zu",         "  123",             (size_t)123);
    CHECK_FORMAT_1("%5x",          "   7b",                (int)123);

    CHECK_FORMAT_1("%5d",          " -123",               (int)-123);
    CHECK_FORMAT_1("%5i",          " -123",               (int)-123);
    CHECK_FORMAT_1("%5ld",         " -123",              (long)-123);
    CHECK_FORMAT_1("%5li",         " -123",              (long)-123);
    CHECK_FORMAT_1("%5lld",        " -123",         (long long)-123);
    CHECK_FORMAT_1("%5lli",        " -123",         (long long)-123);
    CHECK_FORMAT_1("%5zd",         " -123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%5zi",         " -123",        (Ty_ssize_t)-123);

    // Integers: width > length, 0-flag
    CHECK_FORMAT_1("%05d",         "00123",                (int)123);
    CHECK_FORMAT_1("%05i",         "00123",                (int)123);
    CHECK_FORMAT_1("%05u",         "00123",       (unsigned int)123);
    CHECK_FORMAT_1("%05ld",        "00123",               (long)123);
    CHECK_FORMAT_1("%05li",        "00123",               (long)123);
    CHECK_FORMAT_1("%05lu",        "00123",      (unsigned long)123);
    CHECK_FORMAT_1("%05lld",       "00123",          (long long)123);
    CHECK_FORMAT_1("%05lli",       "00123",          (long long)123);
    CHECK_FORMAT_1("%05llu",       "00123", (unsigned long long)123);
    CHECK_FORMAT_1("%05zd",        "00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%05zi",        "00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%05zu",        "00123",             (size_t)123);
    CHECK_FORMAT_1("%05x",         "0007b",                (int)123);

    CHECK_FORMAT_1("%05d",         "-0123",               (int)-123);
    CHECK_FORMAT_1("%05i",         "-0123",               (int)-123);
    CHECK_FORMAT_1("%05ld",        "-0123",              (long)-123);
    CHECK_FORMAT_1("%05li",        "-0123",              (long)-123);
    CHECK_FORMAT_1("%05lld",       "-0123",         (long long)-123);
    CHECK_FORMAT_1("%05lli",       "-0123",         (long long)-123);
    CHECK_FORMAT_1("%05zd",        "-0123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%05zi",        "-0123",        (Ty_ssize_t)-123);

    // Integers: precision < length
    CHECK_FORMAT_1("%.1d",           "123",                (int)123);
    CHECK_FORMAT_1("%.1i",           "123",                (int)123);
    CHECK_FORMAT_1("%.1u",           "123",       (unsigned int)123);
    CHECK_FORMAT_1("%.1ld",          "123",               (long)123);
    CHECK_FORMAT_1("%.1li",          "123",               (long)123);
    CHECK_FORMAT_1("%.1lu",          "123",      (unsigned long)123);
    CHECK_FORMAT_1("%.1lld",         "123",          (long long)123);
    CHECK_FORMAT_1("%.1lli",         "123",          (long long)123);
    CHECK_FORMAT_1("%.1llu",         "123", (unsigned long long)123);
    CHECK_FORMAT_1("%.1zd",          "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%.1zi",          "123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%.1zu",          "123",             (size_t)123);
    CHECK_FORMAT_1("%.1x",            "7b",                (int)123);

    CHECK_FORMAT_1("%.1d",          "-123",               (int)-123);
    CHECK_FORMAT_1("%.1i",          "-123",               (int)-123);
    CHECK_FORMAT_1("%.1ld",         "-123",              (long)-123);
    CHECK_FORMAT_1("%.1li",         "-123",              (long)-123);
    CHECK_FORMAT_1("%.1lld",        "-123",         (long long)-123);
    CHECK_FORMAT_1("%.1lli",        "-123",         (long long)-123);
    CHECK_FORMAT_1("%.1zd",         "-123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%.1zi",         "-123",        (Ty_ssize_t)-123);

    // Integers: precision > length
    CHECK_FORMAT_1("%.5d",         "00123",                (int)123);
    CHECK_FORMAT_1("%.5i",         "00123",                (int)123);
    CHECK_FORMAT_1("%.5u",         "00123",       (unsigned int)123);
    CHECK_FORMAT_1("%.5ld",        "00123",               (long)123);
    CHECK_FORMAT_1("%.5li",        "00123",               (long)123);
    CHECK_FORMAT_1("%.5lu",        "00123",      (unsigned long)123);
    CHECK_FORMAT_1("%.5lld",       "00123",          (long long)123);
    CHECK_FORMAT_1("%.5lli",       "00123",          (long long)123);
    CHECK_FORMAT_1("%.5llu",       "00123", (unsigned long long)123);
    CHECK_FORMAT_1("%.5zd",        "00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%.5zi",        "00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%.5zu",        "00123",             (size_t)123);
    CHECK_FORMAT_1("%.5x",         "0007b",                (int)123);

    CHECK_FORMAT_1("%.5d",        "-00123",               (int)-123);
    CHECK_FORMAT_1("%.5i",        "-00123",               (int)-123);
    CHECK_FORMAT_1("%.5ld",       "-00123",              (long)-123);
    CHECK_FORMAT_1("%.5li",       "-00123",              (long)-123);
    CHECK_FORMAT_1("%.5lld",      "-00123",         (long long)-123);
    CHECK_FORMAT_1("%.5lli",      "-00123",         (long long)-123);
    CHECK_FORMAT_1("%.5zd",       "-00123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%.5zi",       "-00123",        (Ty_ssize_t)-123);

    // Integers: width > precision > length
    CHECK_FORMAT_1("%7.5d",      "  00123",                (int)123);
    CHECK_FORMAT_1("%7.5i",      "  00123",                (int)123);
    CHECK_FORMAT_1("%7.5u",      "  00123",       (unsigned int)123);
    CHECK_FORMAT_1("%7.5ld",     "  00123",               (long)123);
    CHECK_FORMAT_1("%7.5li",     "  00123",               (long)123);
    CHECK_FORMAT_1("%7.5lu",     "  00123",      (unsigned long)123);
    CHECK_FORMAT_1("%7.5lld",    "  00123",          (long long)123);
    CHECK_FORMAT_1("%7.5lli",    "  00123",          (long long)123);
    CHECK_FORMAT_1("%7.5llu",    "  00123", (unsigned long long)123);
    CHECK_FORMAT_1("%7.5zd",     "  00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%7.5zi",     "  00123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%7.5zu",     "  00123",             (size_t)123);
    CHECK_FORMAT_1("%7.5x",      "  0007b",                (int)123);

    CHECK_FORMAT_1("%7.5d",      " -00123",               (int)-123);
    CHECK_FORMAT_1("%7.5i",      " -00123",               (int)-123);
    CHECK_FORMAT_1("%7.5ld",     " -00123",              (long)-123);
    CHECK_FORMAT_1("%7.5li",     " -00123",              (long)-123);
    CHECK_FORMAT_1("%7.5lld",    " -00123",         (long long)-123);
    CHECK_FORMAT_1("%7.5lli",    " -00123",         (long long)-123);
    CHECK_FORMAT_1("%7.5zd",     " -00123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%7.5zi",     " -00123",        (Ty_ssize_t)-123);

    // Integers: width > precision > length, 0-flag
    CHECK_FORMAT_1("%07.5d",     "0000123",                (int)123);
    CHECK_FORMAT_1("%07.5i",     "0000123",                (int)123);
    CHECK_FORMAT_1("%07.5u",     "0000123",       (unsigned int)123);
    CHECK_FORMAT_1("%07.5ld",    "0000123",               (long)123);
    CHECK_FORMAT_1("%07.5li",    "0000123",               (long)123);
    CHECK_FORMAT_1("%07.5lu",    "0000123",      (unsigned long)123);
    CHECK_FORMAT_1("%07.5lld",   "0000123",          (long long)123);
    CHECK_FORMAT_1("%07.5lli",   "0000123",          (long long)123);
    CHECK_FORMAT_1("%07.5llu",   "0000123", (unsigned long long)123);
    CHECK_FORMAT_1("%07.5zd",    "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%07.5zi",    "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%07.5zu",    "0000123",             (size_t)123);
    CHECK_FORMAT_1("%07.5x",     "000007b",                (int)123);

    CHECK_FORMAT_1("%07.5d",     "-000123",               (int)-123);
    CHECK_FORMAT_1("%07.5i",     "-000123",               (int)-123);
    CHECK_FORMAT_1("%07.5ld",    "-000123",              (long)-123);
    CHECK_FORMAT_1("%07.5li",    "-000123",              (long)-123);
    CHECK_FORMAT_1("%07.5lld",   "-000123",         (long long)-123);
    CHECK_FORMAT_1("%07.5lli",   "-000123",         (long long)-123);
    CHECK_FORMAT_1("%07.5zd",    "-000123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%07.5zi",    "-000123",        (Ty_ssize_t)-123);

    // Integers: precision > width > length
    CHECK_FORMAT_1("%5.7d",      "0000123",                (int)123);
    CHECK_FORMAT_1("%5.7i",      "0000123",                (int)123);
    CHECK_FORMAT_1("%5.7u",      "0000123",       (unsigned int)123);
    CHECK_FORMAT_1("%5.7ld",     "0000123",               (long)123);
    CHECK_FORMAT_1("%5.7li",     "0000123",               (long)123);
    CHECK_FORMAT_1("%5.7lu",     "0000123",      (unsigned long)123);
    CHECK_FORMAT_1("%5.7lld",    "0000123",          (long long)123);
    CHECK_FORMAT_1("%5.7lli",    "0000123",          (long long)123);
    CHECK_FORMAT_1("%5.7llu",    "0000123", (unsigned long long)123);
    CHECK_FORMAT_1("%5.7zd",     "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%5.7zi",     "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%5.7zu",     "0000123",             (size_t)123);
    CHECK_FORMAT_1("%5.7x",      "000007b",                (int)123);

    CHECK_FORMAT_1("%5.7d",     "-0000123",               (int)-123);
    CHECK_FORMAT_1("%5.7i",     "-0000123",               (int)-123);
    CHECK_FORMAT_1("%5.7ld",    "-0000123",              (long)-123);
    CHECK_FORMAT_1("%5.7li",    "-0000123",              (long)-123);
    CHECK_FORMAT_1("%5.7lld",   "-0000123",         (long long)-123);
    CHECK_FORMAT_1("%5.7lli",   "-0000123",         (long long)-123);
    CHECK_FORMAT_1("%5.7zd",    "-0000123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%5.7zi",    "-0000123",        (Ty_ssize_t)-123);

    // Integers: precision > width > length, 0-flag
    CHECK_FORMAT_1("%05.7d",     "0000123",                (int)123);
    CHECK_FORMAT_1("%05.7i",     "0000123",                (int)123);
    CHECK_FORMAT_1("%05.7u",     "0000123",       (unsigned int)123);
    CHECK_FORMAT_1("%05.7ld",    "0000123",               (long)123);
    CHECK_FORMAT_1("%05.7li",    "0000123",               (long)123);
    CHECK_FORMAT_1("%05.7lu",    "0000123",      (unsigned long)123);
    CHECK_FORMAT_1("%05.7lld",   "0000123",          (long long)123);
    CHECK_FORMAT_1("%05.7lli",   "0000123",          (long long)123);
    CHECK_FORMAT_1("%05.7llu",   "0000123", (unsigned long long)123);
    CHECK_FORMAT_1("%05.7zd",    "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%05.7zi",    "0000123",         (Ty_ssize_t)123);
    CHECK_FORMAT_1("%05.7zu",    "0000123",             (size_t)123);
    CHECK_FORMAT_1("%05.7x",     "000007b",                (int)123);

    CHECK_FORMAT_1("%05.7d",    "-0000123",               (int)-123);
    CHECK_FORMAT_1("%05.7i",    "-0000123",               (int)-123);
    CHECK_FORMAT_1("%05.7ld",   "-0000123",              (long)-123);
    CHECK_FORMAT_1("%05.7li",   "-0000123",              (long)-123);
    CHECK_FORMAT_1("%05.7lld",  "-0000123",         (long long)-123);
    CHECK_FORMAT_1("%05.7lli",  "-0000123",         (long long)-123);
    CHECK_FORMAT_1("%05.7zd",   "-0000123",        (Ty_ssize_t)-123);
    CHECK_FORMAT_1("%05.7zi",   "-0000123",        (Ty_ssize_t)-123);

    // Integers: precision = 0, arg = 0 (empty string in C)
    CHECK_FORMAT_1("%.0d",             "0",                  (int)0);
    CHECK_FORMAT_1("%.0i",             "0",                  (int)0);
    CHECK_FORMAT_1("%.0u",             "0",         (unsigned int)0);
    CHECK_FORMAT_1("%.0ld",            "0",                 (long)0);
    CHECK_FORMAT_1("%.0li",            "0",                 (long)0);
    CHECK_FORMAT_1("%.0lu",            "0",        (unsigned long)0);
    CHECK_FORMAT_1("%.0lld",           "0",            (long long)0);
    CHECK_FORMAT_1("%.0lli",           "0",            (long long)0);
    CHECK_FORMAT_1("%.0llu",           "0",   (unsigned long long)0);
    CHECK_FORMAT_1("%.0zd",            "0",           (Ty_ssize_t)0);
    CHECK_FORMAT_1("%.0zi",            "0",           (Ty_ssize_t)0);
    CHECK_FORMAT_1("%.0zu",            "0",               (size_t)0);
    CHECK_FORMAT_1("%.0x",             "0",                  (int)0);

    // Strings
    CHECK_FORMAT_1("%s",     "None",  "None");
    CHECK_FORMAT_1("%ls",    "None", L"None");
    CHECK_FORMAT_1("%U",     "None", unicode);
    CHECK_FORMAT_1("%A",     "None", Ty_None);
    CHECK_FORMAT_1("%S",     "None", Ty_None);
    CHECK_FORMAT_1("%R",     "None", Ty_None);
    CHECK_FORMAT_2("%V",     "None", unicode, "ignored");
    CHECK_FORMAT_2("%V",     "None",    NULL,    "None");
    CHECK_FORMAT_2("%lV",    "None",    NULL,   L"None");

    // Strings: width < length
    CHECK_FORMAT_1("%1s",    "None",  "None");
    CHECK_FORMAT_1("%1ls",   "None", L"None");
    CHECK_FORMAT_1("%1U",    "None", unicode);
    CHECK_FORMAT_1("%1A",    "None", Ty_None);
    CHECK_FORMAT_1("%1S",    "None", Ty_None);
    CHECK_FORMAT_1("%1R",    "None", Ty_None);
    CHECK_FORMAT_2("%1V",    "None", unicode, "ignored");
    CHECK_FORMAT_2("%1V",    "None",    NULL,    "None");
    CHECK_FORMAT_2("%1lV",   "None",    NULL,    L"None");

    // Strings: width > length
    CHECK_FORMAT_1("%5s",   " None",  "None");
    CHECK_FORMAT_1("%5ls",  " None", L"None");
    CHECK_FORMAT_1("%5U",   " None", unicode);
    CHECK_FORMAT_1("%5A",   " None", Ty_None);
    CHECK_FORMAT_1("%5S",   " None", Ty_None);
    CHECK_FORMAT_1("%5R",   " None", Ty_None);
    CHECK_FORMAT_2("%5V",   " None", unicode, "ignored");
    CHECK_FORMAT_2("%5V",   " None",    NULL,    "None");
    CHECK_FORMAT_2("%5lV",  " None",    NULL,   L"None");

    // Strings: precision < length
    CHECK_FORMAT_1("%.1s",      "N",  "None");
    CHECK_FORMAT_1("%.1ls",     "N", L"None");
    CHECK_FORMAT_1("%.1U",      "N", unicode);
    CHECK_FORMAT_1("%.1A",      "N", Ty_None);
    CHECK_FORMAT_1("%.1S",      "N", Ty_None);
    CHECK_FORMAT_1("%.1R",      "N", Ty_None);
    CHECK_FORMAT_2("%.1V",      "N", unicode, "ignored");
    CHECK_FORMAT_2("%.1V",      "N",    NULL,    "None");
    CHECK_FORMAT_2("%.1lV",     "N",    NULL,   L"None");

    // Strings: precision > length
    CHECK_FORMAT_1("%.5s",   "None",  "None");
    CHECK_FORMAT_1("%.5ls",  "None", L"None");
    CHECK_FORMAT_1("%.5U",   "None", unicode);
    CHECK_FORMAT_1("%.5A",   "None", Ty_None);
    CHECK_FORMAT_1("%.5S",   "None", Ty_None);
    CHECK_FORMAT_1("%.5R",   "None", Ty_None);
    CHECK_FORMAT_2("%.5V",   "None", unicode, "ignored");
    CHECK_FORMAT_2("%.5V",   "None",    NULL,    "None");
    CHECK_FORMAT_2("%.5lV",  "None",    NULL,   L"None");

    // Strings: precision < length, width > length
    CHECK_FORMAT_1("%5.1s", "    N",  "None");
    CHECK_FORMAT_1("%5.1ls","    N", L"None");
    CHECK_FORMAT_1("%5.1U", "    N", unicode);
    CHECK_FORMAT_1("%5.1A", "    N", Ty_None);
    CHECK_FORMAT_1("%5.1S", "    N", Ty_None);
    CHECK_FORMAT_1("%5.1R", "    N", Ty_None);
    CHECK_FORMAT_2("%5.1V", "    N", unicode, "ignored");
    CHECK_FORMAT_2("%5.1V", "    N",    NULL,    "None");
    CHECK_FORMAT_2("%5.1lV","    N",    NULL,   L"None");

    // Strings: width < length, precision > length
    CHECK_FORMAT_1("%1.5s",  "None",  "None");
    CHECK_FORMAT_1("%1.5ls", "None",  L"None");
    CHECK_FORMAT_1("%1.5U",  "None", unicode);
    CHECK_FORMAT_1("%1.5A",  "None", Ty_None);
    CHECK_FORMAT_1("%1.5S",  "None", Ty_None);
    CHECK_FORMAT_1("%1.5R",  "None", Ty_None);
    CHECK_FORMAT_2("%1.5V",  "None", unicode, "ignored");
    CHECK_FORMAT_2("%1.5V",  "None",    NULL,    "None");
    CHECK_FORMAT_2("%1.5lV", "None",    NULL,   L"None");

    Ty_XDECREF(unicode);
    Py_RETURN_NONE;

 Fail:
    Ty_XDECREF(result);
    Ty_XDECREF(unicode);
    return NULL;

#undef CHECK_FORMAT_2
#undef CHECK_FORMAT_1
#undef CHECK_FORMAT_0
}


/* Test TyUnicode_Equal() */
static TyObject *
unicode_equal(TyObject *module, TyObject *args)
{
    TyObject *str1, *str2;
    if (!TyArg_ParseTuple(args, "OO", &str1, &str2)) {
        return NULL;
    }

    NULLABLE(str1);
    NULLABLE(str2);
    RETURN_INT(TyUnicode_Equal(str1, str2));
}



static TyMethodDef TestMethods[] = {
    {"codec_incrementalencoder", codec_incrementalencoder,       METH_VARARGS},
    {"codec_incrementaldecoder", codec_incrementaldecoder,       METH_VARARGS},
    {"test_unicode_compare_with_ascii",
     test_unicode_compare_with_ascii,                            METH_NOARGS},
    {"test_string_from_format",  test_string_from_format,        METH_NOARGS},
    {"test_widechar",            test_widechar,                  METH_NOARGS},
    {"unicode_writechar",        unicode_writechar,              METH_VARARGS},
    {"unicode_resize",           unicode_resize,                 METH_VARARGS},
    {"unicode_append",           unicode_append,                 METH_VARARGS},
    {"unicode_appendanddel",     unicode_appendanddel,           METH_VARARGS},
    {"unicode_fromstringandsize",unicode_fromstringandsize,      METH_VARARGS},
    {"unicode_fromstring",       unicode_fromstring,             METH_O},
    {"unicode_substring",        unicode_substring,              METH_VARARGS},
    {"unicode_getlength",        unicode_getlength,              METH_O},
    {"unicode_readchar",         unicode_readchar,               METH_VARARGS},
    {"unicode_fromencodedobject",unicode_fromencodedobject,      METH_VARARGS},
    {"unicode_fromobject",       unicode_fromobject,             METH_O},
    {"unicode_interninplace",    unicode_interninplace,          METH_O},
    {"unicode_internfromstring", unicode_internfromstring,       METH_O},
    {"unicode_fromwidechar",     unicode_fromwidechar,           METH_VARARGS},
    {"unicode_aswidechar",       unicode_aswidechar,             METH_VARARGS},
    {"unicode_aswidechar_null",  unicode_aswidechar_null,        METH_VARARGS},
    {"unicode_aswidecharstring", unicode_aswidecharstring,       METH_VARARGS},
    {"unicode_aswidecharstring_null",unicode_aswidecharstring_null,METH_VARARGS},
    {"unicode_fromordinal",      unicode_fromordinal,            METH_VARARGS},
    {"unicode_asutf8andsize",    unicode_asutf8andsize,          METH_VARARGS},
    {"unicode_asutf8andsize_null",unicode_asutf8andsize_null,    METH_VARARGS},
    {"unicode_getdefaultencoding",unicode_getdefaultencoding,    METH_NOARGS},
    {"unicode_decode",           unicode_decode,                 METH_VARARGS},
    {"unicode_asencodedstring",  unicode_asencodedstring,        METH_VARARGS},
    {"unicode_buildencodingmap", unicode_buildencodingmap,       METH_O},
    {"unicode_decodeutf7",       unicode_decodeutf7,             METH_VARARGS},
    {"unicode_decodeutf7stateful",unicode_decodeutf7stateful,    METH_VARARGS},
    {"unicode_decodeutf8",       unicode_decodeutf8,             METH_VARARGS},
    {"unicode_decodeutf8stateful",unicode_decodeutf8stateful,    METH_VARARGS},
    {"unicode_asutf8string",     unicode_asutf8string,           METH_O},
    {"unicode_decodeutf16",      unicode_decodeutf16,            METH_VARARGS},
    {"unicode_decodeutf16stateful",unicode_decodeutf16stateful,  METH_VARARGS},
    {"unicode_asutf16string",    unicode_asutf16string,          METH_O},
    {"unicode_decodeutf32",      unicode_decodeutf32,            METH_VARARGS},
    {"unicode_decodeutf32stateful",unicode_decodeutf32stateful,  METH_VARARGS},
    {"unicode_asutf32string",    unicode_asutf32string,          METH_O},
    {"unicode_decodeunicodeescape",unicode_decodeunicodeescape,  METH_VARARGS},
    {"unicode_asunicodeescapestring",unicode_asunicodeescapestring,METH_O},
    {"unicode_decoderawunicodeescape",unicode_decoderawunicodeescape,METH_VARARGS},
    {"unicode_asrawunicodeescapestring",unicode_asrawunicodeescapestring,METH_O},
    {"unicode_decodelatin1",     unicode_decodelatin1,           METH_VARARGS},
    {"unicode_aslatin1string",   unicode_aslatin1string,         METH_O},
    {"unicode_decodeascii",      unicode_decodeascii,            METH_VARARGS},
    {"unicode_asasciistring",    unicode_asasciistring,          METH_O},
    {"unicode_decodecharmap",    unicode_decodecharmap,          METH_VARARGS},
    {"unicode_ascharmapstring",  unicode_ascharmapstring,        METH_VARARGS},
#ifdef MS_WINDOWS
    {"unicode_decodembcs",       unicode_decodembcs,             METH_VARARGS},
    {"unicode_decodembcsstateful",unicode_decodembcsstateful,    METH_VARARGS},
    {"unicode_decodecodepagestateful",unicode_decodecodepagestateful,METH_VARARGS},
    {"unicode_asmbcsstring",     unicode_asmbcsstring,           METH_O},
    {"unicode_encodecodepage",   unicode_encodecodepage,         METH_VARARGS},
#endif /* MS_WINDOWS */
    {"unicode_decodelocaleandsize",unicode_decodelocaleandsize,  METH_VARARGS},
    {"unicode_decodelocale",     unicode_decodelocale,           METH_VARARGS},
    {"unicode_encodelocale",     unicode_encodelocale,           METH_VARARGS},
    {"unicode_decodefsdefault",  unicode_decodefsdefault,        METH_VARARGS},
    {"unicode_decodefsdefaultandsize",unicode_decodefsdefaultandsize,METH_VARARGS},
    {"unicode_encodefsdefault",  unicode_encodefsdefault,        METH_O},
    {"unicode_concat",           unicode_concat,                 METH_VARARGS},
    {"unicode_splitlines",       unicode_splitlines,             METH_VARARGS},
    {"unicode_split",            unicode_split,                  METH_VARARGS},
    {"unicode_rsplit",           unicode_rsplit,                 METH_VARARGS},
    {"unicode_partition",        unicode_partition,              METH_VARARGS},
    {"unicode_rpartition",       unicode_rpartition,             METH_VARARGS},
    {"unicode_translate",        unicode_translate,              METH_VARARGS},
    {"unicode_join",             unicode_join,                   METH_VARARGS},
    {"unicode_count",            unicode_count,                  METH_VARARGS},
    {"unicode_tailmatch",        unicode_tailmatch,              METH_VARARGS},
    {"unicode_find",             unicode_find,                   METH_VARARGS},
    {"unicode_findchar",         unicode_findchar,               METH_VARARGS},
    {"unicode_replace",          unicode_replace,                METH_VARARGS},
    {"unicode_compare",          unicode_compare,                METH_VARARGS},
    {"unicode_comparewithasciistring",unicode_comparewithasciistring,METH_VARARGS},
    {"unicode_equaltoutf8",      unicode_equaltoutf8,            METH_VARARGS},
    {"unicode_equaltoutf8andsize",unicode_equaltoutf8andsize,    METH_VARARGS},
    {"unicode_richcompare",      unicode_richcompare,            METH_VARARGS},
    {"unicode_format",           unicode_format,                 METH_VARARGS},
    {"unicode_contains",         unicode_contains,               METH_VARARGS},
    {"unicode_isidentifier",     unicode_isidentifier,           METH_O},
    {"unicode_equal",            unicode_equal,                  METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Unicode(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    return 0;
}
