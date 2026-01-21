#ifndef Ty_UNICODEOBJECT_H
#define Ty_UNICODEOBJECT_H

/*

Unicode implementation based on original code by Fredrik Lundh,
modified by Marc-Andre Lemburg (mal@lemburg.com) according to the
Unicode Integration Proposal. (See
http://www.egenix.com/files/python/unicode-proposal.txt).

Copyright (c) Corporation for National Research Initiatives.


 Original header:
 --------------------------------------------------------------------

 * Yet another Unicode string type for Python.  This type supports the
 * 16-bit Basic Multilingual Plane (BMP) only.
 *
 * Written by Fredrik Lundh, January 1999.
 *
 * Copyright (c) 1999 by Secret Labs AB.
 * Copyright (c) 1999 by Fredrik Lundh.
 *
 * fredrik@pythonware.com
 * http://www.pythonware.com
 *
 * --------------------------------------------------------------------
 * This Unicode String Type is
 *
 * Copyright (c) 1999 by Secret Labs AB
 * Copyright (c) 1999 by Fredrik Lundh
 *
 * By obtaining, using, and/or copying this software and/or its
 * associated documentation, you agree that you have read, understood,
 * and will comply with the following terms and conditions:
 *
 * Permission to use, copy, modify, and distribute this software and its
 * associated documentation for any purpose and without fee is hereby
 * granted, provided that the above copyright notice appears in all
 * copies, and that both that copyright notice and this permission notice
 * appear in supporting documentation, and that the name of Secret Labs
 * AB or the author not be used in advertising or publicity pertaining to
 * distribution of the software without specific, written prior
 * permission.
 *
 * SECRET LABS AB AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
 * THIS SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS.  IN NO EVENT SHALL SECRET LABS AB OR THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * -------------------------------------------------------------------- */

/* === Internal API ======================================================= */

/* --- Internal Unicode Format -------------------------------------------- */

/* Python 3.x requires unicode */
#define Ty_USING_UNICODE

#ifndef SIZEOF_WCHAR_T
#error Must define SIZEOF_WCHAR_T
#endif

#define Ty_UNICODE_SIZE SIZEOF_WCHAR_T

/* If wchar_t can be used for UCS-4 storage, set Ty_UNICODE_WIDE.
   Otherwise, Unicode strings are stored as UCS-2 (with limited support
   for UTF-16) */

#if Ty_UNICODE_SIZE >= 4
#define Ty_UNICODE_WIDE
#endif

/* Set these flags if the platform has "wchar.h" and the
   wchar_t type is a 16-bit unsigned type */
/* #define HAVE_WCHAR_H */
/* #define HAVE_USABLE_WCHAR_T */

/* If the compiler provides a wchar_t type we try to support it
   through the interface functions TyUnicode_FromWideChar(),
   TyUnicode_AsWideChar() and TyUnicode_AsWideCharString(). */

#ifdef HAVE_USABLE_WCHAR_T
# ifndef HAVE_WCHAR_H
#  define HAVE_WCHAR_H
# endif
#endif

/* Ty_UCS4 and Ty_UCS2 are typedefs for the respective
   unicode representations. */
typedef uint32_t Ty_UCS4;
typedef uint16_t Ty_UCS2;
typedef uint8_t Ty_UCS1;

#ifdef __cplusplus
extern "C" {
#endif


PyAPI_DATA(TyTypeObject) TyUnicode_Type;
PyAPI_DATA(TyTypeObject) PyUnicodeIter_Type;

#define TyUnicode_Check(op) \
    TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_UNICODE_SUBCLASS)
#define TyUnicode_CheckExact(op) Ty_IS_TYPE((op), &TyUnicode_Type)

/* --- Constants ---------------------------------------------------------- */

/* This Unicode character will be used as replacement character during
   decoding if the errors argument is set to "replace". Note: the
   Unicode character U+FFFD is the official REPLACEMENT CHARACTER in
   Unicode 3.0. */

#define Ty_UNICODE_REPLACEMENT_CHARACTER ((Ty_UCS4) 0xFFFD)

/* === Public API ========================================================= */

/* Similar to TyUnicode_FromUnicode(), but u points to UTF-8 encoded bytes */
PyAPI_FUNC(TyObject*) TyUnicode_FromStringAndSize(
    const char *u,             /* UTF-8 encoded string */
    Ty_ssize_t size            /* size of buffer */
    );

/* Similar to TyUnicode_FromUnicode(), but u points to null-terminated
   UTF-8 encoded bytes.  The size is determined with strlen(). */
PyAPI_FUNC(TyObject*) TyUnicode_FromString(
    const char *u              /* UTF-8 encoded string */
    );

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject*) TyUnicode_Substring(
    TyObject *str,
    Ty_ssize_t start,
    Ty_ssize_t end);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
/* Copy the string into a UCS4 buffer including the null character if copy_null
   is set. Return NULL and raise an exception on error. Raise a SystemError if
   the buffer is smaller than the string. Return buffer on success.

   buflen is the length of the buffer in (Ty_UCS4) characters. */
PyAPI_FUNC(Ty_UCS4*) TyUnicode_AsUCS4(
    TyObject *unicode,
    Ty_UCS4* buffer,
    Ty_ssize_t buflen,
    int copy_null);

/* Copy the string into a UCS4 buffer. A new buffer is allocated using
 * TyMem_Malloc; if this fails, NULL is returned with a memory error
   exception set. */
PyAPI_FUNC(Ty_UCS4*) TyUnicode_AsUCS4Copy(TyObject *unicode);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
/* Get the length of the Unicode object. */

PyAPI_FUNC(Ty_ssize_t) TyUnicode_GetLength(
    TyObject *unicode
);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
/* Read a character from the string. */

PyAPI_FUNC(Ty_UCS4) TyUnicode_ReadChar(
    TyObject *unicode,
    Ty_ssize_t index
    );

/* Write a character to the string. The string must have been created through
   TyUnicode_New, must not be shared, and must not have been hashed yet.

   Return 0 on success, -1 on error. */

PyAPI_FUNC(int) TyUnicode_WriteChar(
    TyObject *unicode,
    Ty_ssize_t index,
    Ty_UCS4 character
    );
#endif

/* Resize a Unicode object. The length is the number of codepoints.

   *unicode is modified to point to the new (resized) object and 0
   returned on success.

   Try to resize the string in place (which is usually faster than allocating
   a new string and copy characters), or create a new string.

   Error handling is implemented as follows: an exception is set, -1
   is returned and *unicode left untouched.

   WARNING: The function doesn't check string content, the result may not be a
            string in canonical representation. */

PyAPI_FUNC(int) TyUnicode_Resize(
    TyObject **unicode,         /* Pointer to the Unicode object */
    Ty_ssize_t length           /* New length */
    );

/* Decode obj to a Unicode object.

   bytes, bytearray and other bytes-like objects are decoded according to the
   given encoding and error handler. The encoding and error handler can be
   NULL to have the interface use UTF-8 and "strict".

   All other objects (including Unicode objects) raise an exception.

   The API returns NULL in case of an error. The caller is responsible
   for decref'ing the returned objects.

*/

PyAPI_FUNC(TyObject*) TyUnicode_FromEncodedObject(
    TyObject *obj,              /* Object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Copy an instance of a Unicode subtype to a new true Unicode object if
   necessary. If obj is already a true Unicode object (not a subtype), return
   the reference with *incremented* refcount.

   The API returns NULL in case of an error. The caller is responsible
   for decref'ing the returned objects.

*/

PyAPI_FUNC(TyObject*) TyUnicode_FromObject(
    TyObject *obj      /* Object */
    );

PyAPI_FUNC(TyObject *) TyUnicode_FromFormatV(
    const char *format,   /* ASCII-encoded string  */
    va_list vargs
    );
PyAPI_FUNC(TyObject *) TyUnicode_FromFormat(
    const char *format,   /* ASCII-encoded string  */
    ...
    );

PyAPI_FUNC(void) TyUnicode_InternInPlace(TyObject **);
PyAPI_FUNC(TyObject *) TyUnicode_InternFromString(
    const char *u              /* UTF-8 encoded string */
    );

/* --- wchar_t support for platforms which support it --------------------- */

#ifdef HAVE_WCHAR_H

/* Create a Unicode Object from the wchar_t buffer w of the given
   size.

   The buffer is copied into the new object. */

PyAPI_FUNC(TyObject*) TyUnicode_FromWideChar(
    const wchar_t *w,           /* wchar_t buffer */
    Ty_ssize_t size             /* size of buffer */
    );

/* Copies the Unicode Object contents into the wchar_t buffer w.  At
   most size wchar_t characters are copied.

   Note that the resulting wchar_t string may or may not be
   0-terminated.  It is the responsibility of the caller to make sure
   that the wchar_t string is 0-terminated in case this is required by
   the application.

   Returns the number of wchar_t characters copied (excluding a
   possibly trailing 0-termination character) or -1 in case of an
   error. */

PyAPI_FUNC(Ty_ssize_t) TyUnicode_AsWideChar(
    TyObject *unicode,          /* Unicode object */
    wchar_t *w,                 /* wchar_t buffer */
    Ty_ssize_t size             /* size of buffer */
    );

/* Convert the Unicode object to a wide character string. The output string
   always ends with a nul character. If size is not NULL, write the number of
   wide characters (excluding the null character) into *size.

   Returns a buffer allocated by TyMem_Malloc() (use TyMem_Free() to free it)
   on success. On error, returns NULL, *size is undefined and raises a
   MemoryError. */

PyAPI_FUNC(wchar_t*) TyUnicode_AsWideCharString(
    TyObject *unicode,          /* Unicode object */
    Ty_ssize_t *size            /* number of characters of the result */
    );

#endif

/* --- Unicode ordinals --------------------------------------------------- */

/* Create a Unicode Object from the given Unicode code point ordinal.

   The ordinal must be in range(0x110000). A ValueError is
   raised in case it is not.

*/

PyAPI_FUNC(TyObject*) TyUnicode_FromOrdinal(int ordinal);

/* === Builtin Codecs =====================================================

   Many of these APIs take two arguments encoding and errors. These
   parameters encoding and errors have the same semantics as the ones
   of the builtin str() API.

   Setting encoding to NULL causes the default encoding (UTF-8) to be used.

   Error handling is set by errors which may also be set to NULL
   meaning to use the default handling defined for the codec. Default
   error handling for all builtin codecs is "strict" (ValueErrors are
   raised).

   The codecs all use a similar interface. Only deviation from the
   generic ones are documented.

*/

/* --- Manage the default encoding ---------------------------------------- */

/* Returns "utf-8".  */
PyAPI_FUNC(const char*) TyUnicode_GetDefaultEncoding(void);

/* --- Generic Codecs ----------------------------------------------------- */

/* Create a Unicode object by decoding the encoded string s of the
   given size. */

PyAPI_FUNC(TyObject*) TyUnicode_Decode(
    const char *s,              /* encoded string */
    Ty_ssize_t size,            /* size of buffer */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Decode a Unicode object unicode and return the result as Python
   object.

   This API is DEPRECATED and will be removed in 3.15.
   The only supported standard encoding is rot13.
   Use PyCodec_Decode() to decode with rot13 and non-standard codecs
   that decode from str. */

Ty_DEPRECATED(3.6) PyAPI_FUNC(TyObject*) TyUnicode_AsDecodedObject(
    TyObject *unicode,          /* Unicode object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Decode a Unicode object unicode and return the result as Unicode
   object.

   This API is DEPRECATED and will be removed in 3.15.
   The only supported standard encoding is rot13.
   Use PyCodec_Decode() to decode with rot13 and non-standard codecs
   that decode from str to str. */

Ty_DEPRECATED(3.6) PyAPI_FUNC(TyObject*) TyUnicode_AsDecodedUnicode(
    TyObject *unicode,          /* Unicode object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Encodes a Unicode object and returns the result as Python
   object.

   This API is DEPRECATED and will be removed in 3.15.
   It is superseded by TyUnicode_AsEncodedString()
   since all standard encodings (except rot13) encode str to bytes.
   Use PyCodec_Encode() for encoding with rot13 and non-standard codecs
   that encode form str to non-bytes. */

Ty_DEPRECATED(3.6) PyAPI_FUNC(TyObject*) TyUnicode_AsEncodedObject(
    TyObject *unicode,          /* Unicode object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Encodes a Unicode object and returns the result as Python string
   object. */

PyAPI_FUNC(TyObject*) TyUnicode_AsEncodedString(
    TyObject *unicode,          /* Unicode object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Encodes a Unicode object and returns the result as Unicode
   object.

   This API is DEPRECATED and will be removed in 3.15.
   The only supported standard encodings is rot13.
   Use PyCodec_Encode() to encode with rot13 and non-standard codecs
   that encode from str to str. */

Ty_DEPRECATED(3.6) PyAPI_FUNC(TyObject*) TyUnicode_AsEncodedUnicode(
    TyObject *unicode,          /* Unicode object */
    const char *encoding,       /* encoding */
    const char *errors          /* error handling */
    );

/* Build an encoding map. */

PyAPI_FUNC(TyObject*) TyUnicode_BuildEncodingMap(
    TyObject* string            /* 256 character map */
   );

/* --- UTF-7 Codecs ------------------------------------------------------- */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF7(
    const char *string,         /* UTF-7 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF7Stateful(
    const char *string,         /* UTF-7 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    Ty_ssize_t *consumed        /* bytes consumed */
    );

/* --- UTF-8 Codecs ------------------------------------------------------- */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF8(
    const char *string,         /* UTF-8 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF8Stateful(
    const char *string,         /* UTF-8 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    Ty_ssize_t *consumed        /* bytes consumed */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsUTF8String(
    TyObject *unicode           /* Unicode object */
    );

/* Returns a pointer to the default encoding (UTF-8) of the
   Unicode object unicode and the size of the encoded representation
   in bytes stored in *size.

   In case of an error, no *size is set.

   This function caches the UTF-8 encoded string in the unicodeobject
   and subsequent calls will return the same string.  The memory is released
   when the unicodeobject is deallocated.
*/

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000
PyAPI_FUNC(const char *) TyUnicode_AsUTF8AndSize(
    TyObject *unicode,
    Ty_ssize_t *size);
#endif

/* --- UTF-32 Codecs ------------------------------------------------------ */

/* Decodes length bytes from a UTF-32 encoded buffer string and returns
   the corresponding Unicode object.

   errors (if non-NULL) defines the error handling. It defaults
   to "strict".

   If byteorder is non-NULL, the decoder starts decoding using the
   given byte order:

    *byteorder == -1: little endian
    *byteorder == 0:  native order
    *byteorder == 1:  big endian

   In native mode, the first four bytes of the stream are checked for a
   BOM mark. If found, the BOM mark is analysed, the byte order
   adjusted and the BOM skipped.  In the other modes, no BOM mark
   interpretation is done. After completion, *byteorder is set to the
   current byte order at the end of input data.

   If byteorder is NULL, the codec starts in native order mode.

*/

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF32(
    const char *string,         /* UTF-32 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    int *byteorder              /* pointer to byteorder to use
                                   0=native;-1=LE,1=BE; updated on
                                   exit */
    );

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF32Stateful(
    const char *string,         /* UTF-32 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    int *byteorder,             /* pointer to byteorder to use
                                   0=native;-1=LE,1=BE; updated on
                                   exit */
    Ty_ssize_t *consumed        /* bytes consumed */
    );

/* Returns a Python string using the UTF-32 encoding in native byte
   order. The string always starts with a BOM mark.  */

PyAPI_FUNC(TyObject*) TyUnicode_AsUTF32String(
    TyObject *unicode           /* Unicode object */
    );

/* Returns a Python string object holding the UTF-32 encoded value of
   the Unicode data.

   If byteorder is not 0, output is written according to the following
   byte order:

   byteorder == -1: little endian
   byteorder == 0:  native byte order (writes a BOM mark)
   byteorder == 1:  big endian

   If byteorder is 0, the output string will always start with the
   Unicode BOM mark (U+FEFF). In the other two modes, no BOM mark is
   prepended.

*/

/* --- UTF-16 Codecs ------------------------------------------------------ */

/* Decodes length bytes from a UTF-16 encoded buffer string and returns
   the corresponding Unicode object.

   errors (if non-NULL) defines the error handling. It defaults
   to "strict".

   If byteorder is non-NULL, the decoder starts decoding using the
   given byte order:

    *byteorder == -1: little endian
    *byteorder == 0:  native order
    *byteorder == 1:  big endian

   In native mode, the first two bytes of the stream are checked for a
   BOM mark. If found, the BOM mark is analysed, the byte order
   adjusted and the BOM skipped.  In the other modes, no BOM mark
   interpretation is done. After completion, *byteorder is set to the
   current byte order at the end of input data.

   If byteorder is NULL, the codec starts in native order mode.

*/

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF16(
    const char *string,         /* UTF-16 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    int *byteorder              /* pointer to byteorder to use
                                   0=native;-1=LE,1=BE; updated on
                                   exit */
    );

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUTF16Stateful(
    const char *string,         /* UTF-16 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    int *byteorder,             /* pointer to byteorder to use
                                   0=native;-1=LE,1=BE; updated on
                                   exit */
    Ty_ssize_t *consumed        /* bytes consumed */
    );

/* Returns a Python string using the UTF-16 encoding in native byte
   order. The string always starts with a BOM mark.  */

PyAPI_FUNC(TyObject*) TyUnicode_AsUTF16String(
    TyObject *unicode           /* Unicode object */
    );

/* --- Unicode-Escape Codecs ---------------------------------------------- */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeUnicodeEscape(
    const char *string,         /* Unicode-Escape encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsUnicodeEscapeString(
    TyObject *unicode           /* Unicode object */
    );

/* --- Raw-Unicode-Escape Codecs ------------------------------------------ */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeRawUnicodeEscape(
    const char *string,         /* Raw-Unicode-Escape encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsRawUnicodeEscapeString(
    TyObject *unicode           /* Unicode object */
    );

/* --- Latin-1 Codecs -----------------------------------------------------

   Note: Latin-1 corresponds to the first 256 Unicode ordinals. */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeLatin1(
    const char *string,         /* Latin-1 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsLatin1String(
    TyObject *unicode           /* Unicode object */
    );

/* --- ASCII Codecs -------------------------------------------------------

   Only 7-bit ASCII data is expected. All other codes generate errors.

*/

PyAPI_FUNC(TyObject*) TyUnicode_DecodeASCII(
    const char *string,         /* ASCII encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsASCIIString(
    TyObject *unicode           /* Unicode object */
    );

/* --- Character Map Codecs -----------------------------------------------

   This codec uses mappings to encode and decode characters.

   Decoding mappings must map byte ordinals (integers in the range from 0 to
   255) to Unicode strings, integers (which are then interpreted as Unicode
   ordinals) or None.  Unmapped data bytes (ones which cause a LookupError)
   as well as mapped to None, 0xFFFE or '\ufffe' are treated as "undefined
   mapping" and cause an error.

   Encoding mappings must map Unicode ordinal integers to bytes objects,
   integers in the range from 0 to 255 or None.  Unmapped character
   ordinals (ones which cause a LookupError) as well as mapped to
   None are treated as "undefined mapping" and cause an error.

*/

PyAPI_FUNC(TyObject*) TyUnicode_DecodeCharmap(
    const char *string,         /* Encoded string */
    Ty_ssize_t length,          /* size of string */
    TyObject *mapping,          /* decoding mapping */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_AsCharmapString(
    TyObject *unicode,          /* Unicode object */
    TyObject *mapping           /* encoding mapping */
    );

/* --- MBCS codecs for Windows -------------------------------------------- */

#ifdef MS_WINDOWS
PyAPI_FUNC(TyObject*) TyUnicode_DecodeMBCS(
    const char *string,         /* MBCS encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors          /* error handling */
    );

PyAPI_FUNC(TyObject*) TyUnicode_DecodeMBCSStateful(
    const char *string,         /* MBCS encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    Ty_ssize_t *consumed        /* bytes consumed */
    );

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject*) TyUnicode_DecodeCodePageStateful(
    int code_page,              /* code page number */
    const char *string,         /* encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    Ty_ssize_t *consumed        /* bytes consumed */
    );
#endif

PyAPI_FUNC(TyObject*) TyUnicode_AsMBCSString(
    TyObject *unicode           /* Unicode object */
    );

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject*) TyUnicode_EncodeCodePage(
    int code_page,              /* code page number */
    TyObject *unicode,          /* Unicode object */
    const char *errors          /* error handling */
    );
#endif

#endif /* MS_WINDOWS */

/* --- Locale encoding --------------------------------------------------- */

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
/* Decode a string from the current locale encoding. The decoder is strict if
   *surrogateescape* is equal to zero, otherwise it uses the 'surrogateescape'
   error handler (PEP 383) to escape undecodable bytes. If a byte sequence can
   be decoded as a surrogate character and *surrogateescape* is not equal to
   zero, the byte sequence is escaped using the 'surrogateescape' error handler
   instead of being decoded. *str* must end with a null character but cannot
   contain embedded null characters. */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeLocaleAndSize(
    const char *str,
    Ty_ssize_t len,
    const char *errors);

/* Similar to TyUnicode_DecodeLocaleAndSize(), but compute the string
   length using strlen(). */

PyAPI_FUNC(TyObject*) TyUnicode_DecodeLocale(
    const char *str,
    const char *errors);

/* Encode a Unicode object to the current locale encoding. The encoder is
   strict is *surrogateescape* is equal to zero, otherwise the
   "surrogateescape" error handler is used. Return a bytes object. The string
   cannot contain embedded null characters. */

PyAPI_FUNC(TyObject*) TyUnicode_EncodeLocale(
    TyObject *unicode,
    const char *errors
    );
#endif

/* --- File system encoding ---------------------------------------------- */

/* ParseTuple converter: encode str objects to bytes using
   TyUnicode_EncodeFSDefault(); bytes objects are output as-is. */

PyAPI_FUNC(int) TyUnicode_FSConverter(TyObject*, void*);

/* ParseTuple converter: decode bytes objects to unicode using
   TyUnicode_DecodeFSDefaultAndSize(); str objects are output as-is. */

PyAPI_FUNC(int) TyUnicode_FSDecoder(TyObject*, void*);

/* Decode a null-terminated string from the Python filesystem encoding
   and error handler.

   If the string length is known, use TyUnicode_DecodeFSDefaultAndSize(). */
PyAPI_FUNC(TyObject*) TyUnicode_DecodeFSDefault(
    const char *s               /* encoded string */
    );

/* Decode a string from the Python filesystem encoding and error handler. */
PyAPI_FUNC(TyObject*) TyUnicode_DecodeFSDefaultAndSize(
    const char *s,               /* encoded string */
    Ty_ssize_t size              /* size */
    );

/* Encode a Unicode object to the Python filesystem encoding and error handler.
   Return bytes. */
PyAPI_FUNC(TyObject*) TyUnicode_EncodeFSDefault(
    TyObject *unicode
    );

/* --- Methods & Slots ----------------------------------------------------

   These are capable of handling Unicode objects and strings on input
   (we refer to them as strings in the descriptions) and return
   Unicode objects or integers as appropriate. */

/* Concat two strings giving a new Unicode string. */

PyAPI_FUNC(TyObject*) TyUnicode_Concat(
    TyObject *left,             /* Left string */
    TyObject *right             /* Right string */
    );

/* Concat two strings and put the result in *pleft
   (sets *pleft to NULL on error) */

PyAPI_FUNC(void) TyUnicode_Append(
    TyObject **pleft,           /* Pointer to left string */
    TyObject *right             /* Right string */
    );

/* Concat two strings, put the result in *pleft and drop the right object
   (sets *pleft to NULL on error) */

PyAPI_FUNC(void) TyUnicode_AppendAndDel(
    TyObject **pleft,           /* Pointer to left string */
    TyObject *right             /* Right string */
    );

/* Split a string giving a list of Unicode strings.

   If sep is NULL, splitting will be done at all whitespace
   substrings. Otherwise, splits occur at the given separator.

   At most maxsplit splits will be done. If negative, no limit is set.

   Separators are not included in the resulting list.

*/

PyAPI_FUNC(TyObject*) TyUnicode_Split(
    TyObject *s,                /* String to split */
    TyObject *sep,              /* String separator */
    Ty_ssize_t maxsplit         /* Maxsplit count */
    );

/* Dito, but split at line breaks.

   CRLF is considered to be one line break. Line breaks are not
   included in the resulting list. */

PyAPI_FUNC(TyObject*) TyUnicode_Splitlines(
    TyObject *s,                /* String to split */
    int keepends                /* If true, line end markers are included */
    );

/* Partition a string using a given separator. */

PyAPI_FUNC(TyObject*) TyUnicode_Partition(
    TyObject *s,                /* String to partition */
    TyObject *sep               /* String separator */
    );

/* Partition a string using a given separator, searching from the end of the
   string. */

PyAPI_FUNC(TyObject*) TyUnicode_RPartition(
    TyObject *s,                /* String to partition */
    TyObject *sep               /* String separator */
    );

/* Split a string giving a list of Unicode strings.

   If sep is NULL, splitting will be done at all whitespace
   substrings. Otherwise, splits occur at the given separator.

   At most maxsplit splits will be done. But unlike TyUnicode_Split
   TyUnicode_RSplit splits from the end of the string. If negative,
   no limit is set.

   Separators are not included in the resulting list.

*/

PyAPI_FUNC(TyObject*) TyUnicode_RSplit(
    TyObject *s,                /* String to split */
    TyObject *sep,              /* String separator */
    Ty_ssize_t maxsplit         /* Maxsplit count */
    );

/* Translate a string by applying a character mapping table to it and
   return the resulting Unicode object.

   The mapping table must map Unicode ordinal integers to Unicode strings,
   Unicode ordinal integers or None (causing deletion of the character).

   Mapping tables may be dictionaries or sequences. Unmapped character
   ordinals (ones which cause a LookupError) are left untouched and
   are copied as-is.

*/

PyAPI_FUNC(TyObject *) TyUnicode_Translate(
    TyObject *str,              /* String */
    TyObject *table,            /* Translate table */
    const char *errors          /* error handling */
    );

/* Join a sequence of strings using the given separator and return
   the resulting Unicode string. */

PyAPI_FUNC(TyObject*) TyUnicode_Join(
    TyObject *separator,        /* Separator string */
    TyObject *seq               /* Sequence object */
    );

/* Return 1 if substr matches str[start:end] at the given tail end, 0
   otherwise. */

PyAPI_FUNC(Ty_ssize_t) TyUnicode_Tailmatch(
    TyObject *str,              /* String */
    TyObject *substr,           /* Prefix or Suffix string */
    Ty_ssize_t start,           /* Start index */
    Ty_ssize_t end,             /* Stop index */
    int direction               /* Tail end: -1 prefix, +1 suffix */
    );

/* Return the first position of substr in str[start:end] using the
   given search direction or -1 if not found. -2 is returned in case
   an error occurred and an exception is set. */

PyAPI_FUNC(Ty_ssize_t) TyUnicode_Find(
    TyObject *str,              /* String */
    TyObject *substr,           /* Substring to find */
    Ty_ssize_t start,           /* Start index */
    Ty_ssize_t end,             /* Stop index */
    int direction               /* Find direction: +1 forward, -1 backward */
    );

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
/* Like TyUnicode_Find, but search for single character only. */
PyAPI_FUNC(Ty_ssize_t) TyUnicode_FindChar(
    TyObject *str,
    Ty_UCS4 ch,
    Ty_ssize_t start,
    Ty_ssize_t end,
    int direction
    );
#endif

/* Count the number of occurrences of substr in str[start:end]. */

PyAPI_FUNC(Ty_ssize_t) TyUnicode_Count(
    TyObject *str,              /* String */
    TyObject *substr,           /* Substring to count */
    Ty_ssize_t start,           /* Start index */
    Ty_ssize_t end              /* Stop index */
    );

/* Replace at most maxcount occurrences of substr in str with replstr
   and return the resulting Unicode object. */

PyAPI_FUNC(TyObject *) TyUnicode_Replace(
    TyObject *str,              /* String */
    TyObject *substr,           /* Substring to find */
    TyObject *replstr,          /* Substring to replace */
    Ty_ssize_t maxcount         /* Max. number of replacements to apply;
                                   -1 = all */
    );

/* Compare two strings and return -1, 0, 1 for less than, equal,
   greater than resp.
   Raise an exception and return -1 on error. */

PyAPI_FUNC(int) TyUnicode_Compare(
    TyObject *left,             /* Left string */
    TyObject *right             /* Right string */
    );

/* Compare a Unicode object with C string and return -1, 0, 1 for less than,
   equal, and greater than, respectively.  It is best to pass only
   ASCII-encoded strings, but the function interprets the input string as
   ISO-8859-1 if it contains non-ASCII characters.
   This function does not raise exceptions. */

PyAPI_FUNC(int) TyUnicode_CompareWithASCIIString(
    TyObject *left,
    const char *right           /* ASCII-encoded string */
    );

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030D0000
/* Compare a Unicode object with UTF-8 encoded C string.
   Return 1 if they are equal, or 0 otherwise.
   This function does not raise exceptions. */

PyAPI_FUNC(int) TyUnicode_EqualToUTF8(TyObject *, const char *);
PyAPI_FUNC(int) TyUnicode_EqualToUTF8AndSize(TyObject *, const char *, Ty_ssize_t);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030e0000
PyAPI_FUNC(int) TyUnicode_Equal(TyObject *str1, TyObject *str2);
#endif

/* Rich compare two strings and return one of the following:

   - NULL in case an exception was raised
   - Ty_True or Ty_False for successful comparisons
   - Ty_NotImplemented in case the type combination is unknown

   Possible values for op:

     Py_GT, Py_GE, Py_EQ, Py_NE, Py_LT, Py_LE

*/

PyAPI_FUNC(TyObject *) TyUnicode_RichCompare(
    TyObject *left,             /* Left string */
    TyObject *right,            /* Right string */
    int op                      /* Operation: Py_EQ, Py_NE, Py_GT, etc. */
    );

/* Apply an argument tuple or dictionary to a format string and return
   the resulting Unicode string. */

PyAPI_FUNC(TyObject *) TyUnicode_Format(
    TyObject *format,           /* Format string */
    TyObject *args              /* Argument tuple or dictionary */
    );

/* Checks whether element is contained in container and return 1/0
   accordingly.

   element has to coerce to a one element Unicode string. -1 is
   returned in case of an error. */

PyAPI_FUNC(int) TyUnicode_Contains(
    TyObject *container,        /* Container string */
    TyObject *element           /* Element string */
    );

/* Checks whether argument is a valid identifier. */

PyAPI_FUNC(int) TyUnicode_IsIdentifier(TyObject *s);

/* === Characters Type APIs =============================================== */

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_UNICODEOBJECT_H
#  include "cpython/unicodeobject.h"
#  undef Ty_CPYTHON_UNICODEOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_UNICODEOBJECT_H */
