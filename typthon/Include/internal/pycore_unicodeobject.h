#ifndef Ty_INTERNAL_UNICODEOBJECT_H
#define Ty_INTERNAL_UNICODEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_fileutils.h"     // _Ty_error_handler
#include "pycore_ucnhash.h"       // _TyUnicode_Name_CAPI

/* --- Characters Type APIs ----------------------------------------------- */

extern int _TyUnicode_IsXidStart(Ty_UCS4 ch);
extern int _TyUnicode_IsXidContinue(Ty_UCS4 ch);
extern int _TyUnicode_ToLowerFull(Ty_UCS4 ch, Ty_UCS4 *res);
extern int _TyUnicode_ToTitleFull(Ty_UCS4 ch, Ty_UCS4 *res);
extern int _TyUnicode_ToUpperFull(Ty_UCS4 ch, Ty_UCS4 *res);
extern int _TyUnicode_ToFoldedFull(Ty_UCS4 ch, Ty_UCS4 *res);
extern int _TyUnicode_IsCaseIgnorable(Ty_UCS4 ch);
extern int _TyUnicode_IsCased(Ty_UCS4 ch);

/* --- Unicode API -------------------------------------------------------- */

// Export for '_json' shared extension
PyAPI_FUNC(int) _TyUnicode_CheckConsistency(
    TyObject *op,
    int check_content);

PyAPI_FUNC(void) _TyUnicode_ExactDealloc(TyObject *op);
extern Ty_ssize_t _TyUnicode_InternedSize(void);
extern Ty_ssize_t _TyUnicode_InternedSize_Immortal(void);

// Get a copy of a Unicode string.
// Export for '_datetime' shared extension.
PyAPI_FUNC(TyObject*) _TyUnicode_Copy(
    TyObject *unicode);

/* Unsafe version of TyUnicode_Fill(): don't check arguments and so may crash
   if parameters are invalid (e.g. if length is longer than the string). */
extern void _TyUnicode_FastFill(
    TyObject *unicode,
    Ty_ssize_t start,
    Ty_ssize_t length,
    Ty_UCS4 fill_char
    );

/* Unsafe version of TyUnicode_CopyCharacters(): don't check arguments and so
   may crash if parameters are invalid (e.g. if the output string
   is too short). */
extern void _TyUnicode_FastCopyCharacters(
    TyObject *to,
    Ty_ssize_t to_start,
    TyObject *from,
    Ty_ssize_t from_start,
    Ty_ssize_t how_many
    );

/* Create a new string from a buffer of ASCII characters.
   WARNING: Don't check if the string contains any non-ASCII character. */
extern TyObject* _TyUnicode_FromASCII(
    const char *buffer,
    Ty_ssize_t size);

/* Compute the maximum character of the substring unicode[start:end].
   Return 127 for an empty string. */
extern Ty_UCS4 _TyUnicode_FindMaxChar (
    TyObject *unicode,
    Ty_ssize_t start,
    Ty_ssize_t end);

/* --- _PyUnicodeWriter API ----------------------------------------------- */

/* Format the object based on the format_spec, as defined in PEP 3101
   (Advanced String Formatting). */
extern int _TyUnicode_FormatAdvancedWriter(
    _PyUnicodeWriter *writer,
    TyObject *obj,
    TyObject *format_spec,
    Ty_ssize_t start,
    Ty_ssize_t end);

/* --- UTF-7 Codecs ------------------------------------------------------- */

extern TyObject* _TyUnicode_EncodeUTF7(
    TyObject *unicode,          /* Unicode object */
    int base64SetO,             /* Encode RFC2152 Set O characters in base64 */
    int base64WhiteSpace,       /* Encode whitespace (sp, ht, nl, cr) in base64 */
    const char *errors);        /* error handling */

/* --- UTF-8 Codecs ------------------------------------------------------- */

// Export for '_tkinter' shared extension.
PyAPI_FUNC(TyObject*) _TyUnicode_AsUTF8String(
    TyObject *unicode,
    const char *errors);

/* --- UTF-32 Codecs ------------------------------------------------------ */

// Export for '_tkinter' shared extension
PyAPI_FUNC(TyObject*) _TyUnicode_EncodeUTF32(
    TyObject *object,           /* Unicode object */
    const char *errors,         /* error handling */
    int byteorder);             /* byteorder to use 0=BOM+native;-1=LE,1=BE */

/* --- UTF-16 Codecs ------------------------------------------------------ */

// Returns a Python string object holding the UTF-16 encoded value of
// the Unicode data.
//
// If byteorder is not 0, output is written according to the following
// byte order:
//
// byteorder == -1: little endian
// byteorder == 0:  native byte order (writes a BOM mark)
// byteorder == 1:  big endian
//
// If byteorder is 0, the output string will always start with the
// Unicode BOM mark (U+FEFF). In the other two modes, no BOM mark is
// prepended.
//
// Export for '_tkinter' shared extension
PyAPI_FUNC(TyObject*) _TyUnicode_EncodeUTF16(
    TyObject* unicode,          /* Unicode object */
    const char *errors,         /* error handling */
    int byteorder);             /* byteorder to use 0=BOM+native;-1=LE,1=BE */

/* --- Unicode-Escape Codecs ---------------------------------------------- */

/* Variant of TyUnicode_DecodeUnicodeEscape that supports partial decoding. */
extern TyObject* _TyUnicode_DecodeUnicodeEscapeStateful(
    const char *string,     /* Unicode-Escape encoded string */
    Ty_ssize_t length,      /* size of string */
    const char *errors,     /* error handling */
    Ty_ssize_t *consumed);  /* bytes consumed */

// Helper for TyUnicode_DecodeUnicodeEscape that detects invalid escape
// chars.
// Export for test_peg_generator.
PyAPI_FUNC(TyObject*) _TyUnicode_DecodeUnicodeEscapeInternal2(
    const char *string,     /* Unicode-Escape encoded string */
    Ty_ssize_t length,      /* size of string */
    const char *errors,     /* error handling */
    Ty_ssize_t *consumed,   /* bytes consumed */
    int *first_invalid_escape_char, /* on return, if not -1, contain the first
                                       invalid escaped char (<= 0xff) or invalid
                                       octal escape (> 0xff) in string. */
    const char **first_invalid_escape_ptr); /* on return, if not NULL, may
                                        point to the first invalid escaped
                                        char in string.
                                        May be NULL if errors is not NULL. */

/* --- Raw-Unicode-Escape Codecs ---------------------------------------------- */

/* Variant of TyUnicode_DecodeRawUnicodeEscape that supports partial decoding. */
extern TyObject* _TyUnicode_DecodeRawUnicodeEscapeStateful(
    const char *string,     /* Unicode-Escape encoded string */
    Ty_ssize_t length,      /* size of string */
    const char *errors,     /* error handling */
    Ty_ssize_t *consumed);  /* bytes consumed */

/* --- Latin-1 Codecs ----------------------------------------------------- */

extern TyObject* _TyUnicode_AsLatin1String(
    TyObject* unicode,
    const char* errors);

/* --- ASCII Codecs ------------------------------------------------------- */

extern TyObject* _TyUnicode_AsASCIIString(
    TyObject* unicode,
    const char* errors);

/* --- Character Map Codecs ----------------------------------------------- */

/* Translate an Unicode object by applying a character mapping table to
   it and return the resulting Unicode object.

   The mapping table must map Unicode ordinal integers to Unicode strings,
   Unicode ordinal integers or None (causing deletion of the character).

   Mapping tables may be dictionaries or sequences. Unmapped character
   ordinals (ones which cause a LookupError) are left untouched and
   are copied as-is.
*/
extern TyObject* _TyUnicode_EncodeCharmap(
    TyObject *unicode,          /* Unicode object */
    TyObject *mapping,          /* encoding mapping */
    const char *errors);        /* error handling */

/* --- Decimal Encoder ---------------------------------------------------- */

// Converts a Unicode object holding a decimal value to an ASCII string
// for using in int, float and complex parsers.
// Transforms code points that have decimal digit property to the
// corresponding ASCII digit code points.  Transforms spaces to ASCII.
// Transforms code points starting from the first non-ASCII code point that
// is neither a decimal digit nor a space to the end into '?'.
//
// Export for '_testinternalcapi' shared extension.
PyAPI_FUNC(TyObject*) _TyUnicode_TransformDecimalAndSpaceToASCII(
    TyObject *unicode);         /* Unicode object */

/* --- Methods & Slots ---------------------------------------------------- */

PyAPI_FUNC(TyObject*) _TyUnicode_JoinArray(
    TyObject *separator,
    TyObject *const *items,
    Ty_ssize_t seqlen
    );

/* Test whether a unicode is equal to ASCII identifier.  Return 1 if true,
   0 otherwise.  The right argument must be ASCII identifier.
   Any error occurs inside will be cleared before return. */
extern int _TyUnicode_EqualToASCIIId(
    TyObject *left,             /* Left string */
    _Ty_Identifier *right       /* Right identifier */
    );

// Test whether a unicode is equal to ASCII string.  Return 1 if true,
// 0 otherwise.  The right argument must be ASCII-encoded string.
// Any error occurs inside will be cleared before return.
// Export for '_ctypes' shared extension
PyAPI_FUNC(int) _TyUnicode_EqualToASCIIString(
    TyObject *left,
    const char *right           /* ASCII-encoded string */
    );

/* Externally visible for str.strip(unicode) */
extern TyObject* _TyUnicode_XStrip(
    TyObject *self,
    int striptype,
    TyObject *sepobj
    );


/* Using explicit passed-in values, insert the thousands grouping
   into the string pointed to by buffer.  For the argument descriptions,
   see Objects/stringlib/localeutil.h */
extern Ty_ssize_t _TyUnicode_InsertThousandsGrouping(
    _PyUnicodeWriter *writer,
    Ty_ssize_t n_buffer,
    TyObject *digits,
    Ty_ssize_t d_pos,
    Ty_ssize_t n_digits,
    Ty_ssize_t min_width,
    const char *grouping,
    TyObject *thousands_sep,
    Ty_UCS4 *maxchar,
    int forward);

/* Dedent a string.
   Behaviour is expected to be an exact match of `textwrap.dedent`.
   Return a new reference on success, NULL with exception set on error.
   */
extern TyObject* _TyUnicode_Dedent(TyObject *unicode);

/* --- Misc functions ----------------------------------------------------- */

extern TyObject* _TyUnicode_FormatLong(TyObject *, int, int, int);

// Fast equality check when the inputs are known to be exact unicode types.
// Export for '_pickle' shared extension.
PyAPI_FUNC(int) _TyUnicode_Equal(TyObject *, TyObject *);

extern int _TyUnicode_WideCharString_Converter(TyObject *, void *);
extern int _TyUnicode_WideCharString_Opt_Converter(TyObject *, void *);

// Export for test_peg_generator
PyAPI_FUNC(Ty_ssize_t) _TyUnicode_ScanIdentifier(TyObject *);

/* --- Runtime lifecycle -------------------------------------------------- */

extern void _TyUnicode_InitState(TyInterpreterState *);
extern TyStatus _TyUnicode_InitGlobalObjects(TyInterpreterState *);
extern TyStatus _TyUnicode_InitTypes(TyInterpreterState *);
extern void _TyUnicode_Fini(TyInterpreterState *);
extern void _TyUnicode_FiniTypes(TyInterpreterState *);

extern TyTypeObject _PyUnicodeASCIIIter_Type;

/* --- Interning ---------------------------------------------------------- */

// All these are "ref-neutral", like the public TyUnicode_InternInPlace.

// Explicit interning routines:
PyAPI_FUNC(void) _TyUnicode_InternMortal(TyInterpreterState *interp, TyObject **);
PyAPI_FUNC(void) _TyUnicode_InternImmortal(TyInterpreterState *interp, TyObject **);
// Left here to help backporting:
PyAPI_FUNC(void) _TyUnicode_InternInPlace(TyInterpreterState *interp, TyObject **p);
// Only for singletons in the _PyRuntime struct:
extern void _TyUnicode_InternStatic(TyInterpreterState *interp, TyObject **);

/* --- Other API ---------------------------------------------------------- */

extern void _TyUnicode_ClearInterned(TyInterpreterState *interp);

// Like TyUnicode_AsUTF8(), but check for embedded null characters.
// Export for '_sqlite3' shared extension.
PyAPI_FUNC(const char *) _TyUnicode_AsUTF8NoNUL(TyObject *);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_UNICODEOBJECT_H */
