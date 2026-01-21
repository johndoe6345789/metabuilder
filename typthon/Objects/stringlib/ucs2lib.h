/* this is sort of a hack.  there's at least one place (formatting
   floats) where some stringlib code takes a different path if it's
   compiled as unicode. */
#define STRINGLIB_IS_UNICODE     1

#define FASTSEARCH               ucs2lib_fastsearch
#define STRINGLIB(F)             ucs2lib_##F
#define STRINGLIB_OBJECT         PyUnicodeObject
#define STRINGLIB_SIZEOF_CHAR    2
#define STRINGLIB_MAX_CHAR       0xFFFFu
#define STRINGLIB_CHAR           Ty_UCS2
#define STRINGLIB_TYPE_NAME      "unicode"
#define STRINGLIB_PARSE_CODE     "U"
#define STRINGLIB_ISSPACE        Ty_UNICODE_ISSPACE
#define STRINGLIB_ISLINEBREAK    BLOOM_LINEBREAK
#define STRINGLIB_ISDECIMAL      Ty_UNICODE_ISDECIMAL
#define STRINGLIB_TODECIMAL      Ty_UNICODE_TODECIMAL
#define STRINGLIB_STR            TyUnicode_2BYTE_DATA
#define STRINGLIB_LEN            TyUnicode_GET_LENGTH
#define STRINGLIB_NEW            _TyUnicode_FromUCS2
#define STRINGLIB_CHECK          TyUnicode_Check
#define STRINGLIB_CHECK_EXACT    TyUnicode_CheckExact
#define STRINGLIB_MUTABLE 0
#if SIZEOF_WCHAR_T == 2
#define STRINGLIB_FAST_MEMCHR(s, c, n)              \
    (Ty_UCS2 *)wmemchr((const wchar_t *)(s), c, n)
#endif

#define STRINGLIB_TOSTR          PyObject_Str
#define STRINGLIB_TOASCII        PyObject_ASCII
