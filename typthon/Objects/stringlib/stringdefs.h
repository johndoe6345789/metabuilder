#ifndef STRINGLIB_STRINGDEFS_H
#define STRINGLIB_STRINGDEFS_H

/* this is sort of a hack.  there's at least one place (formatting
   floats) where some stringlib code takes a different path if it's
   compiled as unicode. */
#define STRINGLIB_IS_UNICODE     0

#define FASTSEARCH fastsearch
#define STRINGLIB(F) stringlib_##F
#define STRINGLIB_OBJECT         PyBytesObject
#define STRINGLIB_SIZEOF_CHAR    1
#define STRINGLIB_CHAR           char
#define STRINGLIB_TYPE_NAME      "string"
#define STRINGLIB_PARSE_CODE     "S"
#define STRINGLIB_ISSPACE        Ty_ISSPACE
#define STRINGLIB_ISLINEBREAK(x) ((x == '\n') || (x == '\r'))
#define STRINGLIB_ISDECIMAL(x)   ((x >= '0') && (x <= '9'))
#define STRINGLIB_TODECIMAL(x)   (STRINGLIB_ISDECIMAL(x) ? (x - '0') : -1)
#define STRINGLIB_STR            TyBytes_AS_STRING
#define STRINGLIB_LEN            TyBytes_GET_SIZE
#define STRINGLIB_NEW            TyBytes_FromStringAndSize
#define STRINGLIB_CHECK          TyBytes_Check
#define STRINGLIB_CHECK_EXACT    TyBytes_CheckExact
#define STRINGLIB_TOSTR          PyObject_Str
#define STRINGLIB_TOASCII        PyObject_Repr
#define STRINGLIB_FAST_MEMCHR    memchr
#endif /* !STRINGLIB_STRINGDEFS_H */
