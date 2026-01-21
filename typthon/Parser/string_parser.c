#include <Python.h>
#include "pycore_bytesobject.h"   // _TyBytes_DecodeEscape()
#include "pycore_unicodeobject.h" // _TyUnicode_DecodeUnicodeEscapeInternal()

#include "lexer/state.h"
#include "pegen.h"
#include "string_parser.h"

#include <stdbool.h>

//// STRING HANDLING FUNCTIONS ////

static int
warn_invalid_escape_sequence(Parser *p, const char* buffer, const char *first_invalid_escape, Token *t)
{
    if (p->call_invalid_rules) {
        // Do not report warnings if we are in the second pass of the parser
        // to avoid showing the warning twice.
        return 0;
    }
    unsigned char c = (unsigned char)*first_invalid_escape;
    if ((t->type == FSTRING_MIDDLE || t->type == FSTRING_END || t->type == TSTRING_MIDDLE || t->type == TSTRING_END)
            && (c == '{' || c == '}')) {
        // in this case the tokenizer has already emitted a warning,
        // see Parser/tokenizer/helpers.c:warn_invalid_escape_sequence
        return 0;
    }

    int octal = ('4' <= c && c <= '7');
    TyObject *msg =
        octal
        ? TyUnicode_FromFormat(
              "\"\\%.3s\" is an invalid octal escape sequence. "
              "Such sequences will not work in the future. "
              "Did you mean \"\\\\%.3s\"? A raw string is also an option.",
              first_invalid_escape, first_invalid_escape)
        : TyUnicode_FromFormat(
              "\"\\%c\" is an invalid escape sequence. "
              "Such sequences will not work in the future. "
              "Did you mean \"\\\\%c\"? A raw string is also an option.",
              c, c);
    if (msg == NULL) {
        return -1;
    }
    TyObject *category;
    if (p->feature_version >= 12) {
        category = TyExc_SyntaxWarning;
    }
    else {
        category = TyExc_DeprecationWarning;
    }

    // Calculate the lineno and the col_offset of the invalid escape sequence
    const char *start = buffer;
    const char *end = first_invalid_escape;
    int lineno = t->lineno;
    int col_offset = t->col_offset;
    while (start < end) {
        if (*start == '\n') {
            lineno++;
            col_offset = 0;
        }
        else {
            col_offset++;
        }
        start++;
    }

    // Count the number of quotes in the token
    char first_quote = 0;
    if (lineno == t->lineno) {
        int quote_count = 0;
        char* tok = TyBytes_AsString(t->bytes);
        for (int i = 0; i < TyBytes_Size(t->bytes); i++) {
            if (tok[i] == '\'' || tok[i] == '\"') {
                if (quote_count == 0) {
                    first_quote = tok[i];
                }
                if (tok[i] == first_quote) {
                    quote_count++;
                }
            } else {
                break;
            }
        }

        col_offset += quote_count;
    }

    if (TyErr_WarnExplicitObject(category, msg, p->tok->filename,
                                 lineno, NULL, NULL) < 0) {
        if (TyErr_ExceptionMatches(category)) {
            /* Replace the Syntax/DeprecationWarning exception with a SyntaxError
               to get a more accurate error report */
            TyErr_Clear();

            /* This is needed, in order for the SyntaxError to point to the token t,
               since _TyPegen_raise_error uses p->tokens[p->fill - 1] for the
               error location, if p->known_err_token is not set. */
            p->known_err_token = t;
            if (octal) {
                RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError, lineno, col_offset-1, lineno, col_offset+1,
                    "\"\\%.3s\" is an invalid octal escape sequence. "
                    "Did you mean \"\\\\%.3s\"? A raw string is also an option.",
                    first_invalid_escape, first_invalid_escape);
            }
            else {
                RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError, lineno, col_offset-1, lineno, col_offset+1,
                    "\"\\%c\" is an invalid escape sequence. "
                    "Did you mean \"\\\\%c\"? A raw string is also an option.",
                    c, c);
            }
        }
        Ty_DECREF(msg);
        return -1;
    }
    Ty_DECREF(msg);
    return 0;
}

static TyObject *
decode_utf8(const char **sPtr, const char *end)
{
    const char *s;
    const char *t;
    t = s = *sPtr;
    while (s < end && (*s & 0x80)) {
        s++;
    }
    *sPtr = s;
    return TyUnicode_DecodeUTF8(t, s - t, NULL);
}

static TyObject *
decode_unicode_with_escapes(Parser *parser, const char *s, size_t len, Token *t)
{
    TyObject *v;
    TyObject *u;
    char *buf;
    char *p;
    const char *end;

    /* check for integer overflow */
    if (len > (size_t)PY_SSIZE_T_MAX / 6) {
        return NULL;
    }
    /* "ä" (2 bytes) may become "\U000000E4" (10 bytes), or 1:5
       "\ä" (3 bytes) may become "\u005c\U000000E4" (16 bytes), or ~1:6 */
    u = TyBytes_FromStringAndSize((char *)NULL, (Ty_ssize_t)len * 6);
    if (u == NULL) {
        return NULL;
    }
    p = buf = TyBytes_AsString(u);
    if (p == NULL) {
        return NULL;
    }
    end = s + len;
    while (s < end) {
        if (*s == '\\') {
            *p++ = *s++;
            if (s >= end || *s & 0x80) {
                strcpy(p, "u005c");
                p += 5;
                if (s >= end) {
                    break;
                }
            }
        }
        if (*s & 0x80) {
            TyObject *w;
            int kind;
            const void *data;
            Ty_ssize_t w_len;
            Ty_ssize_t i;
            w = decode_utf8(&s, end);
            if (w == NULL) {
                Ty_DECREF(u);
                return NULL;
            }
            kind = TyUnicode_KIND(w);
            data = TyUnicode_DATA(w);
            w_len = TyUnicode_GET_LENGTH(w);
            for (i = 0; i < w_len; i++) {
                Ty_UCS4 chr = TyUnicode_READ(kind, data, i);
                sprintf(p, "\\U%08x", chr);
                p += 10;
            }
            /* Should be impossible to overflow */
            assert(p - buf <= TyBytes_GET_SIZE(u));
            Ty_DECREF(w);
        }
        else {
            *p++ = *s++;
        }
    }
    len = (size_t)(p - buf);
    s = buf;

    int first_invalid_escape_char;
    const char *first_invalid_escape_ptr;
    v = _TyUnicode_DecodeUnicodeEscapeInternal2(s, (Ty_ssize_t)len, NULL, NULL,
                                                &first_invalid_escape_char,
                                                &first_invalid_escape_ptr);

    // HACK: later we can simply pass the line no, since we don't preserve the tokens
    // when we are decoding the string but we preserve the line numbers.
    if (v != NULL && first_invalid_escape_ptr != NULL && t != NULL) {
        if (warn_invalid_escape_sequence(parser, s, first_invalid_escape_ptr, t) < 0) {
            /* We have not decref u before because first_invalid_escape_ptr
               points inside u. */
            Ty_XDECREF(u);
            Ty_DECREF(v);
            return NULL;
        }
    }
    Ty_XDECREF(u);
    return v;
}

static TyObject *
decode_bytes_with_escapes(Parser *p, const char *s, Ty_ssize_t len, Token *t)
{
    int first_invalid_escape_char;
    const char *first_invalid_escape_ptr;
    TyObject *result = _TyBytes_DecodeEscape2(s, len, NULL,
                                              &first_invalid_escape_char,
                                              &first_invalid_escape_ptr);
    if (result == NULL) {
        return NULL;
    }

    if (first_invalid_escape_ptr != NULL) {
        if (warn_invalid_escape_sequence(p, s, first_invalid_escape_ptr, t) < 0) {
            Ty_DECREF(result);
            return NULL;
        }
    }
    return result;
}

TyObject *
_TyPegen_decode_string(Parser *p, int raw, const char *s, size_t len, Token *t)
{
    if (raw) {
        return TyUnicode_DecodeUTF8Stateful(s, (Ty_ssize_t)len, NULL, NULL);
    }
    return decode_unicode_with_escapes(p, s, len, t);
}

/* s must include the bracketing quote characters, and r, b &/or f prefixes
    (if any), and embedded escape sequences (if any). (f-strings are handled by the parser)
   _TyPegen_parse_string parses it, and returns the decoded Python string object. */
TyObject *
_TyPegen_parse_string(Parser *p, Token *t)
{
    const char *s = TyBytes_AsString(t->bytes);
    if (s == NULL) {
        return NULL;
    }

    size_t len;
    int quote = Ty_CHARMASK(*s);
    int bytesmode = 0;
    int rawmode = 0;

    if (Ty_ISALPHA(quote)) {
        while (!bytesmode || !rawmode) {
            if (quote == 'b' || quote == 'B') {
                quote =(unsigned char)*++s;
                bytesmode = 1;
            }
            else if (quote == 'u' || quote == 'U') {
                quote = (unsigned char)*++s;
            }
            else if (quote == 'r' || quote == 'R') {
                quote = (unsigned char)*++s;
                rawmode = 1;
            }
            else {
                break;
            }
        }
    }

    if (quote != '\'' && quote != '\"') {
        TyErr_BadInternalCall();
        return NULL;
    }

    /* Skip the leading quote char. */
    s++;
    len = strlen(s);
    // gh-120155: 's' contains at least the trailing quote,
    // so the code '--len' below is safe.
    assert(len >= 1);

    if (len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError, "string to parse is too long");
        return NULL;
    }
    if (s[--len] != quote) {
        /* Last quote char must match the first. */
        TyErr_BadInternalCall();
        return NULL;
    }
    if (len >= 4 && s[0] == quote && s[1] == quote) {
        /* A triple quoted string. We've already skipped one quote at
           the start and one at the end of the string. Now skip the
           two at the start. */
        s += 2;
        len -= 2;
        /* And check that the last two match. */
        if (s[--len] != quote || s[--len] != quote) {
            TyErr_BadInternalCall();
            return NULL;
        }
    }

    /* Avoid invoking escape decoding routines if possible. */
    rawmode = rawmode || strchr(s, '\\') == NULL;
    if (bytesmode) {
        /* Disallow non-ASCII characters. */
        const char *ch;
        for (ch = s; *ch; ch++) {
            if (Ty_CHARMASK(*ch) >= 0x80) {
                RAISE_SYNTAX_ERROR_KNOWN_LOCATION(
                                   t,
                                   "bytes can only contain ASCII "
                                   "literal characters");
                return NULL;
            }
        }
        if (rawmode) {
            return TyBytes_FromStringAndSize(s, (Ty_ssize_t)len);
        }
        return decode_bytes_with_escapes(p, s, (Ty_ssize_t)len, t);
    }
    return _TyPegen_decode_string(p, rawmode, s, len, t);
}
