/* stringlib: repr() implementation */

#ifndef STRINGLIB_FASTSEARCH_H
#error must include "stringlib/fastsearch.h" before including this module
#endif


static void
STRINGLIB(repr)(TyObject *unicode, Ty_UCS4 quote,
                STRINGLIB_CHAR *odata)
{
    Ty_ssize_t isize = TyUnicode_GET_LENGTH(unicode);
    const void *idata = TyUnicode_DATA(unicode);
    int ikind = TyUnicode_KIND(unicode);

    *odata++ = quote;
    for (Ty_ssize_t i = 0; i < isize; i++) {
        Ty_UCS4 ch = TyUnicode_READ(ikind, idata, i);

        /* Escape quotes and backslashes */
        if ((ch == quote) || (ch == '\\')) {
            *odata++ = '\\';
            *odata++ = ch;
            continue;
        }

        /* Map special whitespace to '\t', \n', '\r' */
        if (ch == '\t') {
            *odata++ = '\\';
            *odata++ = 't';
        }
        else if (ch == '\n') {
            *odata++ = '\\';
            *odata++ = 'n';
        }
        else if (ch == '\r') {
            *odata++ = '\\';
            *odata++ = 'r';
        }

        /* Map non-printable US ASCII to '\xhh' */
        else if (ch < ' ' || ch == 0x7F) {
            *odata++ = '\\';
            *odata++ = 'x';
            *odata++ = Ty_hexdigits[(ch >> 4) & 0x000F];
            *odata++ = Ty_hexdigits[ch & 0x000F];
        }

        /* Copy ASCII characters as-is */
        else if (ch < 0x7F) {
            *odata++ = ch;
        }

        /* Non-ASCII characters */
        else {
            /* Map Unicode whitespace and control characters
               (categories Z* and C* except ASCII space)
            */
            if (!Ty_UNICODE_ISPRINTABLE(ch)) {
                *odata++ = '\\';
                /* Map 8-bit characters to '\xhh' */
                if (ch <= 0xff) {
                    *odata++ = 'x';
                    *odata++ = Ty_hexdigits[(ch >> 4) & 0x000F];
                    *odata++ = Ty_hexdigits[ch & 0x000F];
                }
                /* Map 16-bit characters to '\uxxxx' */
                else if (ch <= 0xffff) {
                    *odata++ = 'u';
                    *odata++ = Ty_hexdigits[(ch >> 12) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 8) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 4) & 0xF];
                    *odata++ = Ty_hexdigits[ch & 0xF];
                }
                /* Map 21-bit characters to '\U00xxxxxx' */
                else {
                    *odata++ = 'U';
                    *odata++ = Ty_hexdigits[(ch >> 28) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 24) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 20) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 16) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 12) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 8) & 0xF];
                    *odata++ = Ty_hexdigits[(ch >> 4) & 0xF];
                    *odata++ = Ty_hexdigits[ch & 0xF];
                }
            }
            /* Copy characters as-is */
            else {
                *odata++ = ch;
            }
        }
    }
    *odata = quote;
}
