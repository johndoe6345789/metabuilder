/***********************************************************
Copyright (C) 1997, 2002, 2003, 2007, 2008 Martin von Loewis

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose and without fee is hereby granted,
provided that the above copyright notice appear in all copies.

This software comes with no warranty. Use at your own risk.

******************************************************************/

#include "Python.h"
#include "pycore_fileutils.h"     // _Ty_GetLocaleconvNumeric()
#include "pycore_pymem.h"         // _TyMem_Strdup()

#include <locale.h>               // setlocale()
#include <string.h>               // strlen()
#ifdef HAVE_ERRNO_H
#  include <errno.h>              // errno
#endif
#ifdef HAVE_LANGINFO_H
#  include <langinfo.h>           // nl_langinfo()
#endif
#ifdef HAVE_LIBINTL_H
#  include <libintl.h>
#endif
#ifdef MS_WINDOWS
#  ifndef WIN32_LEAN_AND_MEAN
#    define WIN32_LEAN_AND_MEAN
#  endif
#  include <windows.h>
#endif

TyDoc_STRVAR(locale__doc__, "Support for POSIX locales.");

typedef struct _locale_state {
    TyObject *Error;
} _locale_state;

static inline _locale_state*
get_locale_state(TyObject *m)
{
    void *state = TyModule_GetState(m);
    assert(state != NULL);
    return (_locale_state *)state;
}

#include "clinic/_localemodule.c.h"

/*[clinic input]
module _locale
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=ed98569b726feada]*/

/* support functions for formatting floating-point numbers */

/* the grouping is terminated by either 0 or CHAR_MAX */
static TyObject*
copy_grouping(const char* s)
{
    int i;
    TyObject *result, *val = NULL;

    if (s[0] == '\0') {
        /* empty string: no grouping at all */
        return TyList_New(0);
    }

    for (i = 0; s[i] != '\0' && s[i] != CHAR_MAX; i++)
        ; /* nothing */

    result = TyList_New(i+1);
    if (!result)
        return NULL;

    i = -1;
    do {
        i++;
        val = TyLong_FromLong(s[i]);
        if (val == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
        TyList_SET_ITEM(result, i, val);
    } while (s[i] != '\0' && s[i] != CHAR_MAX);

    return result;
}

/*[clinic input]
_locale.setlocale

    category: int
    locale: str(accept={str, NoneType}) = NULL
    /

Activates/queries locale processing.
[clinic start generated code]*/

static TyObject *
_locale_setlocale_impl(TyObject *module, int category, const char *locale)
/*[clinic end generated code: output=a0e777ae5d2ff117 input=dbe18f1d66c57a6a]*/
{
    char *result;
    TyObject *result_object;

#if defined(MS_WINDOWS)
    if (category < LC_MIN || category > LC_MAX)
    {
        TyErr_SetString(get_locale_state(module)->Error,
                        "invalid locale category");
        return NULL;
    }
#endif

    if (locale) {
        /* set locale */
        result = setlocale(category, locale);
        if (!result) {
            /* operation failed, no setting was changed */
            TyErr_SetString(get_locale_state(module)->Error,
                            "unsupported locale setting");
            return NULL;
        }
        result_object = TyUnicode_DecodeLocale(result, NULL);
        if (!result_object)
            return NULL;
    } else {
        /* get locale */
        result = setlocale(category, NULL);
        if (!result) {
            TyErr_SetString(get_locale_state(module)->Error,
                            "locale query failed");
            return NULL;
        }
        result_object = TyUnicode_DecodeLocale(result, NULL);
    }
    return result_object;
}

static int
locale_is_ascii(const char *str)
{
    return (strlen(str) == 1 && ((unsigned char)str[0]) <= 127);
}

static int
is_all_ascii(const char *str)
{
    for (; *str; str++) {
        if ((unsigned char)*str > 127) {
            return 0;
        }
    }
    return 1;
}

static int
locale_decode_monetary(TyObject *dict, struct lconv *lc)
{
#ifndef MS_WINDOWS
    int change_locale;
    change_locale = (!locale_is_ascii(lc->int_curr_symbol)
                     || !locale_is_ascii(lc->currency_symbol)
                     || !locale_is_ascii(lc->mon_decimal_point)
                     || !locale_is_ascii(lc->mon_thousands_sep));

    /* Keep a copy of the LC_CTYPE locale */
    char *oldloc = NULL, *loc = NULL;
    if (change_locale) {
        oldloc = setlocale(LC_CTYPE, NULL);
        if (!oldloc) {
            TyErr_SetString(TyExc_RuntimeWarning,
                            "failed to get LC_CTYPE locale");
            return -1;
        }

        oldloc = _TyMem_Strdup(oldloc);
        if (!oldloc) {
            TyErr_NoMemory();
            return -1;
        }

        loc = setlocale(LC_MONETARY, NULL);
        if (loc != NULL && strcmp(loc, oldloc) == 0) {
            loc = NULL;
        }

        if (loc != NULL) {
            /* Only set the locale temporarily the LC_CTYPE locale
               to the LC_MONETARY locale if the two locales are different and
               at least one string is non-ASCII. */
            setlocale(LC_CTYPE, loc);
        }
    }

#define GET_LOCALE_STRING(ATTR) TyUnicode_DecodeLocale(lc->ATTR, NULL)
#else  /* MS_WINDOWS */
/* Use _W_* fields of Windows struct lconv */
#define GET_LOCALE_STRING(ATTR) TyUnicode_FromWideChar(lc->_W_ ## ATTR, -1)
#endif /* MS_WINDOWS */

    int res = -1;

#define RESULT_STRING(ATTR) \
    do { \
        TyObject *obj; \
        obj = GET_LOCALE_STRING(ATTR); \
        if (obj == NULL) { \
            goto done; \
        } \
        if (TyDict_SetItemString(dict, Ty_STRINGIFY(ATTR), obj) < 0) { \
            Ty_DECREF(obj); \
            goto done; \
        } \
        Ty_DECREF(obj); \
    } while (0)

    RESULT_STRING(int_curr_symbol);
    RESULT_STRING(currency_symbol);
    RESULT_STRING(mon_decimal_point);
    RESULT_STRING(mon_thousands_sep);
#undef RESULT_STRING
#undef GET_LOCALE_STRING

    res = 0;

done:
#ifndef MS_WINDOWS
    if (loc != NULL) {
        setlocale(LC_CTYPE, oldloc);
    }
    TyMem_Free(oldloc);
#endif
    return res;
}

/*[clinic input]
_locale.localeconv

Returns numeric and monetary locale-specific parameters.
[clinic start generated code]*/

static TyObject *
_locale_localeconv_impl(TyObject *module)
/*[clinic end generated code: output=43a54515e0a2aef5 input=f1132d15accf4444]*/
{
    TyObject* result;
    struct lconv *lc;
    TyObject *x;

    result = TyDict_New();
    if (!result) {
        return NULL;
    }

    /* if LC_NUMERIC is different in the C library, use saved value */
    lc = localeconv();

    /* hopefully, the localeconv result survives the C library calls
       involved herein */

#define RESULT(key, obj)\
    do { \
        if (obj == NULL) \
            goto failed; \
        if (TyDict_SetItemString(result, key, obj) < 0) { \
            Ty_DECREF(obj); \
            goto failed; \
        } \
        Ty_DECREF(obj); \
    } while (0)

#ifdef MS_WINDOWS
/* Use _W_* fields of Windows struct lconv */
#define GET_LOCALE_STRING(ATTR) TyUnicode_FromWideChar(lc->_W_ ## ATTR, -1)
#else
#define GET_LOCALE_STRING(ATTR) TyUnicode_DecodeLocale(lc->ATTR, NULL)
#endif
#define RESULT_STRING(s)\
    do { \
        x = GET_LOCALE_STRING(s); \
        RESULT(#s, x); \
    } while (0)

#define RESULT_INT(i)\
    do { \
        x = TyLong_FromLong(lc->i); \
        RESULT(#i, x); \
    } while (0)

    /* Monetary information: LC_MONETARY encoding */
    if (locale_decode_monetary(result, lc) < 0) {
        goto failed;
    }
    x = copy_grouping(lc->mon_grouping);
    RESULT("mon_grouping", x);

    RESULT_STRING(positive_sign);
    RESULT_STRING(negative_sign);
    RESULT_INT(int_frac_digits);
    RESULT_INT(frac_digits);
    RESULT_INT(p_cs_precedes);
    RESULT_INT(p_sep_by_space);
    RESULT_INT(n_cs_precedes);
    RESULT_INT(n_sep_by_space);
    RESULT_INT(p_sign_posn);
    RESULT_INT(n_sign_posn);

    /* Numeric information: LC_NUMERIC encoding */
    TyObject *decimal_point = NULL, *thousands_sep = NULL;
    if (_Ty_GetLocaleconvNumeric(lc, &decimal_point, &thousands_sep) < 0) {
        Ty_XDECREF(decimal_point);
        Ty_XDECREF(thousands_sep);
        goto failed;
    }

    if (TyDict_SetItemString(result, "decimal_point", decimal_point) < 0) {
        Ty_DECREF(decimal_point);
        Ty_DECREF(thousands_sep);
        goto failed;
    }
    Ty_DECREF(decimal_point);

    if (TyDict_SetItemString(result, "thousands_sep", thousands_sep) < 0) {
        Ty_DECREF(thousands_sep);
        goto failed;
    }
    Ty_DECREF(thousands_sep);

    x = copy_grouping(lc->grouping);
    RESULT("grouping", x);

    return result;

  failed:
    Ty_DECREF(result);
    return NULL;

#undef RESULT
#undef RESULT_STRING
#undef RESULT_INT
#undef GET_LOCALE_STRING
}

#if defined(HAVE_WCSCOLL)

/*[clinic input]
_locale.strcoll

    os1: unicode
    os2: unicode
    /

Compares two strings according to the locale.
[clinic start generated code]*/

static TyObject *
_locale_strcoll_impl(TyObject *module, TyObject *os1, TyObject *os2)
/*[clinic end generated code: output=82ddc6d62c76d618 input=693cd02bcbf38dd8]*/
{
    TyObject *result = NULL;
    wchar_t *ws1 = NULL, *ws2 = NULL;

    /* Convert the unicode strings to wchar[]. */
    ws1 = TyUnicode_AsWideCharString(os1, NULL);
    if (ws1 == NULL)
        goto done;
    ws2 = TyUnicode_AsWideCharString(os2, NULL);
    if (ws2 == NULL)
        goto done;
    /* Collate the strings. */
    result = TyLong_FromLong(wcscoll(ws1, ws2));
  done:
    /* Deallocate everything. */
    if (ws1) TyMem_Free(ws1);
    if (ws2) TyMem_Free(ws2);
    return result;
}
#endif

#ifdef HAVE_WCSXFRM

/*[clinic input]
_locale.strxfrm

    string as str: unicode
    /

Return a string that can be used as a key for locale-aware comparisons.
[clinic start generated code]*/

static TyObject *
_locale_strxfrm_impl(TyObject *module, TyObject *str)
/*[clinic end generated code: output=3081866ebffc01af input=1378bbe6a88b4780]*/
{
    Ty_ssize_t n1;
    wchar_t *s = NULL, *buf = NULL;
    size_t n2;
    TyObject *result = NULL;

    s = TyUnicode_AsWideCharString(str, &n1);
    if (s == NULL)
        goto exit;
    if (wcslen(s) != (size_t)n1) {
        TyErr_SetString(TyExc_ValueError,
                        "embedded null character");
        goto exit;
    }

    /* assume no change in size, first */
    n1 = n1 + 1;
    buf = TyMem_New(wchar_t, n1);
    if (!buf) {
        TyErr_NoMemory();
        goto exit;
    }
    errno = 0;
    n2 = wcsxfrm(buf, s, n1);
    if (errno && errno != ERANGE) {
        TyErr_SetFromErrno(TyExc_OSError);
        goto exit;
    }
    if (n2 >= (size_t)n1) {
        /* more space needed */
        wchar_t * new_buf = TyMem_Realloc(buf, (n2+1)*sizeof(wchar_t));
        if (!new_buf) {
            TyErr_NoMemory();
            goto exit;
        }
        buf = new_buf;
        errno = 0;
        n2 = wcsxfrm(buf, s, n2+1);
        if (errno) {
            TyErr_SetFromErrno(TyExc_OSError);
            goto exit;
        }
    }
    result = TyUnicode_FromWideChar(buf, n2);
exit:
    TyMem_Free(buf);
    TyMem_Free(s);
    return result;
}
#endif

#if defined(MS_WINDOWS)

/*[clinic input]
_locale._getdefaultlocale

[clinic start generated code]*/

static TyObject *
_locale__getdefaultlocale_impl(TyObject *module)
/*[clinic end generated code: output=e6254088579534c2 input=003ea41acd17f7c7]*/
{
    char encoding[20];
    char locale[100];

    TyOS_snprintf(encoding, sizeof(encoding), "cp%u", GetACP());

    if (GetLocaleInfoA(LOCALE_USER_DEFAULT,
                      LOCALE_SISO639LANGNAME,
                      locale, sizeof(locale))) {
        Ty_ssize_t i = strlen(locale);
        locale[i++] = '_';
        if (GetLocaleInfoA(LOCALE_USER_DEFAULT,
                          LOCALE_SISO3166CTRYNAME,
                          locale+i, (int)(sizeof(locale)-i)))
            return Ty_BuildValue("ss", locale, encoding);
    }

    /* If we end up here, this windows version didn't know about
       ISO639/ISO3166 names (it's probably Windows 95).  Return the
       Windows language identifier instead (a hexadecimal number) */

    locale[0] = '0';
    locale[1] = 'x';
    if (GetLocaleInfoA(LOCALE_USER_DEFAULT, LOCALE_IDEFAULTLANGUAGE,
                      locale+2, sizeof(locale)-2)) {
        return Ty_BuildValue("ss", locale, encoding);
    }

    /* cannot determine the language code (very unlikely) */
    Ty_INCREF(Ty_None);
    return Ty_BuildValue("Os", Ty_None, encoding);
}
#endif

#ifdef HAVE_LANGINFO_H
#define LANGINFO(X, Y) {#X, X, Y}
static struct langinfo_constant{
    const char *name;
    int value;
    int category;
} langinfo_constants[] =
{
    /* These constants should exist on any langinfo implementation */
    LANGINFO(DAY_1, LC_TIME),
    LANGINFO(DAY_2, LC_TIME),
    LANGINFO(DAY_3, LC_TIME),
    LANGINFO(DAY_4, LC_TIME),
    LANGINFO(DAY_5, LC_TIME),
    LANGINFO(DAY_6, LC_TIME),
    LANGINFO(DAY_7, LC_TIME),

    LANGINFO(ABDAY_1, LC_TIME),
    LANGINFO(ABDAY_2, LC_TIME),
    LANGINFO(ABDAY_3, LC_TIME),
    LANGINFO(ABDAY_4, LC_TIME),
    LANGINFO(ABDAY_5, LC_TIME),
    LANGINFO(ABDAY_6, LC_TIME),
    LANGINFO(ABDAY_7, LC_TIME),

    LANGINFO(MON_1, LC_TIME),
    LANGINFO(MON_2, LC_TIME),
    LANGINFO(MON_3, LC_TIME),
    LANGINFO(MON_4, LC_TIME),
    LANGINFO(MON_5, LC_TIME),
    LANGINFO(MON_6, LC_TIME),
    LANGINFO(MON_7, LC_TIME),
    LANGINFO(MON_8, LC_TIME),
    LANGINFO(MON_9, LC_TIME),
    LANGINFO(MON_10, LC_TIME),
    LANGINFO(MON_11, LC_TIME),
    LANGINFO(MON_12, LC_TIME),

    LANGINFO(ABMON_1, LC_TIME),
    LANGINFO(ABMON_2, LC_TIME),
    LANGINFO(ABMON_3, LC_TIME),
    LANGINFO(ABMON_4, LC_TIME),
    LANGINFO(ABMON_5, LC_TIME),
    LANGINFO(ABMON_6, LC_TIME),
    LANGINFO(ABMON_7, LC_TIME),
    LANGINFO(ABMON_8, LC_TIME),
    LANGINFO(ABMON_9, LC_TIME),
    LANGINFO(ABMON_10, LC_TIME),
    LANGINFO(ABMON_11, LC_TIME),
    LANGINFO(ABMON_12, LC_TIME),

#ifdef RADIXCHAR
    /* The following are not available with glibc 2.0 */
    LANGINFO(RADIXCHAR, LC_NUMERIC),
    LANGINFO(THOUSEP, LC_NUMERIC),
    /* YESSTR and NOSTR are deprecated in glibc, since they are
       a special case of message translation, which should be rather
       done using gettext. So we don't expose it to Python in the
       first place.
    LANGINFO(YESSTR, LC_MESSAGES),
    LANGINFO(NOSTR, LC_MESSAGES),
    */
    LANGINFO(CRNCYSTR, LC_MONETARY),
#endif

    LANGINFO(D_T_FMT, LC_TIME),
    LANGINFO(D_FMT, LC_TIME),
    LANGINFO(T_FMT, LC_TIME),
    LANGINFO(AM_STR, LC_TIME),
    LANGINFO(PM_STR, LC_TIME),

    /* The following constants are available only with XPG4, but...
       OpenBSD doesn't have CODESET but has T_FMT_AMPM, and doesn't have
       a few of the others.
       Solution: ifdef-test them all. */
#ifdef CODESET
    LANGINFO(CODESET, LC_CTYPE),
#endif
#ifdef T_FMT_AMPM
    LANGINFO(T_FMT_AMPM, LC_TIME),
#endif
#ifdef ERA
    LANGINFO(ERA, LC_TIME),
#endif
#ifdef ERA_D_FMT
    LANGINFO(ERA_D_FMT, LC_TIME),
#endif
#ifdef ERA_D_T_FMT
    LANGINFO(ERA_D_T_FMT, LC_TIME),
#endif
#ifdef ERA_T_FMT
    LANGINFO(ERA_T_FMT, LC_TIME),
#endif
#ifdef ALT_DIGITS
    LANGINFO(ALT_DIGITS, LC_TIME),
#endif
#ifdef YESEXPR
    LANGINFO(YESEXPR, LC_MESSAGES),
#endif
#ifdef NOEXPR
    LANGINFO(NOEXPR, LC_MESSAGES),
#endif
#ifdef _DATE_FMT
    /* This is not available in all glibc versions that have CODESET. */
    LANGINFO(_DATE_FMT, LC_TIME),
#endif
    {0, 0, 0}
};

/* Temporary make the LC_CTYPE locale to be the same as
 * the locale of the specified category. */
static int
change_locale(int category, char **oldloc)
{
    /* Keep a copy of the LC_CTYPE locale */
    *oldloc = setlocale(LC_CTYPE, NULL);
    if (!*oldloc) {
        TyErr_SetString(TyExc_RuntimeError, "failed to get LC_CTYPE locale");
        return -1;
    }
    *oldloc = _TyMem_Strdup(*oldloc);
    if (!*oldloc) {
        TyErr_NoMemory();
        return -1;
    }

    /* Set a new locale if it is different. */
    char *loc = setlocale(category, NULL);
    if (loc == NULL || strcmp(loc, *oldloc) == 0) {
        TyMem_Free(*oldloc);
        *oldloc = NULL;
        return 0;
    }

    setlocale(LC_CTYPE, loc);
    return 1;
}

/* Restore the old LC_CTYPE locale. */
static void
restore_locale(char *oldloc)
{
    if (oldloc != NULL) {
        setlocale(LC_CTYPE, oldloc);
        TyMem_Free(oldloc);
    }
}

#ifdef __GLIBC__
#if defined(ALT_DIGITS) || defined(ERA)
static TyObject *
decode_strings(const char *result, size_t max_count)
{
    /* Convert a sequence of NUL-separated C strings to a Python string
     * containing semicolon separated items. */
    size_t i = 0;
    size_t count = 0;
    for (; count < max_count && result[i]; count++) {
        i += strlen(result + i) + 1;
    }
    char *buf = TyMem_Malloc(i);
    if (buf == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    memcpy(buf, result, i);
    /* Replace all NULs with semicolons. */
    i = 0;
    while (--count) {
        i += strlen(buf + i);
        buf[i++] = ';';
    }
    TyObject *pyresult = TyUnicode_DecodeLocale(buf, NULL);
    TyMem_Free(buf);
    return pyresult;
}
#endif
#endif

/*[clinic input]
_locale.nl_langinfo

    key as item: int
    /

Return the value for the locale information associated with key.
[clinic start generated code]*/

static TyObject *
_locale_nl_langinfo_impl(TyObject *module, int item)
/*[clinic end generated code: output=6aea457b47e077a3 input=00798143eecfeddc]*/
{
    int i;
    /* Check whether this is a supported constant. GNU libc sometimes
       returns numeric values in the char* return value, which would
       crash TyUnicode_FromString.  */
    for (i = 0; langinfo_constants[i].name; i++) {
        if (langinfo_constants[i].value == item) {
            /* Check NULL as a workaround for GNU libc's returning NULL
               instead of an empty string for nl_langinfo(ERA).  */
            const char *result = nl_langinfo(item);
            result = result != NULL ? result : "";
            char *oldloc = NULL;
            if (langinfo_constants[i].category != LC_CTYPE
                && *result && (
#ifdef __GLIBC__
                    // gh-133740: Always change the locale for ALT_DIGITS and ERA
#  ifdef ALT_DIGITS
                    item == ALT_DIGITS ||
#  endif
#  ifdef ERA
                    item == ERA ||
#  endif
#endif
                    !is_all_ascii(result))
                && change_locale(langinfo_constants[i].category, &oldloc) < 0)
            {
                return NULL;
            }
            TyObject *pyresult;
#ifdef __GLIBC__
            /* According to the POSIX specification the result must be
             * a sequence of semicolon-separated strings.
             * But in Glibc they are NUL-separated. */
#ifdef ALT_DIGITS
            if (item == ALT_DIGITS && *result) {
                pyresult = decode_strings(result, 100);
            }
            else
#endif
#ifdef ERA
            if (item == ERA && *result) {
                pyresult = decode_strings(result, SIZE_MAX);
            }
            else
#endif
#endif
            {
                pyresult = TyUnicode_DecodeLocale(result, NULL);
            }
            restore_locale(oldloc);
            return pyresult;
        }
    }
    TyErr_SetString(TyExc_ValueError, "unsupported langinfo constant");
    return NULL;
}
#endif /* HAVE_LANGINFO_H */

#ifdef HAVE_LIBINTL_H

/*[clinic input]
_locale.gettext

    msg as in: str
    /

gettext(msg) -> string

Return translation of msg.
[clinic start generated code]*/

static TyObject *
_locale_gettext_impl(TyObject *module, const char *in)
/*[clinic end generated code: output=493bb4b38a4704fe input=949fc8efc2bb3bc3]*/
{
    return TyUnicode_DecodeLocale(gettext(in), NULL);
}

/*[clinic input]
_locale.dgettext

    domain: str(accept={str, NoneType})
    msg as in: str
    /

dgettext(domain, msg) -> string

Return translation of msg in domain.
[clinic start generated code]*/

static TyObject *
_locale_dgettext_impl(TyObject *module, const char *domain, const char *in)
/*[clinic end generated code: output=3c0cd5287b972c8f input=a277388a635109d8]*/
{
    return TyUnicode_DecodeLocale(dgettext(domain, in), NULL);
}

/*[clinic input]
_locale.dcgettext

    domain: str(accept={str, NoneType})
    msg as msgid: str
    category: int
    /

Return translation of msg in domain and category.
[clinic start generated code]*/

static TyObject *
_locale_dcgettext_impl(TyObject *module, const char *domain,
                       const char *msgid, int category)
/*[clinic end generated code: output=0f4cc4fce0aa283f input=ec5f8fed4336de67]*/
{
    return TyUnicode_DecodeLocale(dcgettext(domain,msgid,category), NULL);
}

/*[clinic input]
_locale.textdomain

    domain: str(accept={str, NoneType})
    /

Set the C library's textdmain to domain, returning the new domain.
[clinic start generated code]*/

static TyObject *
_locale_textdomain_impl(TyObject *module, const char *domain)
/*[clinic end generated code: output=7992df06aadec313 input=66359716f5eb1d38]*/
{
    domain = textdomain(domain);
    if (!domain) {
        TyErr_SetFromErrno(TyExc_OSError);
        return NULL;
    }
    return TyUnicode_DecodeLocale(domain, NULL);
}

/*[clinic input]
_locale.bindtextdomain

    domain: str
    dir as dirname_obj: object
    /

Bind the C library's domain to dir.
[clinic start generated code]*/

static TyObject *
_locale_bindtextdomain_impl(TyObject *module, const char *domain,
                            TyObject *dirname_obj)
/*[clinic end generated code: output=6d6f3c7b345d785c input=c0dff085acfe272b]*/
{
    const char *dirname, *current_dirname;
    TyObject *dirname_bytes = NULL, *result;

    if (!strlen(domain)) {
        TyErr_SetString(get_locale_state(module)->Error,
                        "domain must be a non-empty string");
        return 0;
    }
    if (dirname_obj != Ty_None) {
        if (!TyUnicode_FSConverter(dirname_obj, &dirname_bytes))
            return NULL;
        dirname = TyBytes_AsString(dirname_bytes);
    } else {
        dirname_bytes = NULL;
        dirname = NULL;
    }
    current_dirname = bindtextdomain(domain, dirname);
    if (current_dirname == NULL) {
        TyErr_SetFromErrno(TyExc_OSError);
        Ty_XDECREF(dirname_bytes);
        return NULL;
    }
    result = TyUnicode_DecodeLocale(current_dirname, NULL);
    Ty_XDECREF(dirname_bytes);
    return result;
}

#ifdef HAVE_BIND_TEXTDOMAIN_CODESET

/*[clinic input]
_locale.bind_textdomain_codeset

    domain: str
    codeset: str(accept={str, NoneType})
    /

Bind the C library's domain to codeset.
[clinic start generated code]*/

static TyObject *
_locale_bind_textdomain_codeset_impl(TyObject *module, const char *domain,
                                     const char *codeset)
/*[clinic end generated code: output=fa452f9c8b1b9e89 input=23fbe3540400f259]*/
{
    codeset = bind_textdomain_codeset(domain, codeset);
    if (codeset) {
        return TyUnicode_DecodeLocale(codeset, NULL);
    }
    Py_RETURN_NONE;
}
#endif  // HAVE_BIND_TEXTDOMAIN_CODESET

#endif  // HAVE_LIBINTL_H


/*[clinic input]
_locale.getencoding

Get the current locale encoding.
[clinic start generated code]*/

static TyObject *
_locale_getencoding_impl(TyObject *module)
/*[clinic end generated code: output=86b326b971872e46 input=6503d11e5958b360]*/
{
    return _Ty_GetLocaleEncodingObject();
}


static struct TyMethodDef PyLocale_Methods[] = {
    _LOCALE_SETLOCALE_METHODDEF
    _LOCALE_LOCALECONV_METHODDEF
#ifdef HAVE_WCSCOLL
    _LOCALE_STRCOLL_METHODDEF
#endif
#ifdef HAVE_WCSXFRM
    _LOCALE_STRXFRM_METHODDEF
#endif
#if defined(MS_WINDOWS)
    _LOCALE__GETDEFAULTLOCALE_METHODDEF
#endif
#ifdef HAVE_LANGINFO_H
    _LOCALE_NL_LANGINFO_METHODDEF
#endif
#ifdef HAVE_LIBINTL_H
    _LOCALE_GETTEXT_METHODDEF
    _LOCALE_DGETTEXT_METHODDEF
    _LOCALE_DCGETTEXT_METHODDEF
    _LOCALE_TEXTDOMAIN_METHODDEF
    _LOCALE_BINDTEXTDOMAIN_METHODDEF
#ifdef HAVE_BIND_TEXTDOMAIN_CODESET
    _LOCALE_BIND_TEXTDOMAIN_CODESET_METHODDEF
#endif
#endif
    _LOCALE_GETENCODING_METHODDEF
  {NULL, NULL}
};

static int
_locale_exec(TyObject *module)
{
#ifdef HAVE_LANGINFO_H
    int i;
#endif
#define ADD_INT(module, value)                                    \
    do {                                                          \
        if (TyModule_AddIntConstant(module, #value, value) < 0) { \
            return -1;                                            \
        }                                                         \
    } while (0)

    ADD_INT(module, LC_CTYPE);
    ADD_INT(module, LC_TIME);
    ADD_INT(module, LC_COLLATE);
    ADD_INT(module, LC_MONETARY);

#ifdef LC_MESSAGES
    ADD_INT(module, LC_MESSAGES);
#endif /* LC_MESSAGES */

    ADD_INT(module, LC_NUMERIC);
    ADD_INT(module, LC_ALL);
    ADD_INT(module, CHAR_MAX);

    _locale_state *state = get_locale_state(module);
    state->Error = TyErr_NewException("locale.Error", NULL, NULL);
    if (TyModule_AddObjectRef(module, "Error", state->Error) < 0) {
        return -1;
    }

#ifdef HAVE_LANGINFO_H
    for (i = 0; langinfo_constants[i].name; i++) {
        if (TyModule_AddIntConstant(module,
                                    langinfo_constants[i].name,
                                    langinfo_constants[i].value) < 0) {
            return -1;
        }
    }
#endif

    if (TyErr_Occurred()) {
        return -1;
    }
    return 0;

#undef ADD_INT
}

static struct PyModuleDef_Slot _locale_slots[] = {
    {Ty_mod_exec, _locale_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
locale_traverse(TyObject *module, visitproc visit, void *arg)
{
    _locale_state *state = get_locale_state(module);
    Ty_VISIT(state->Error);
    return 0;
}

static int
locale_clear(TyObject *module)
{
    _locale_state *state = get_locale_state(module);
    Ty_CLEAR(state->Error);
    return 0;
}

static void
locale_free(void *module)
{
    locale_clear((TyObject*)module);
}

static struct TyModuleDef _localemodule = {
    PyModuleDef_HEAD_INIT,
    "_locale",
    locale__doc__,
    sizeof(_locale_state),
    PyLocale_Methods,
    _locale_slots,
    locale_traverse,
    locale_clear,
    locale_free,
};

PyMODINIT_FUNC
PyInit__locale(void)
{
    return PyModuleDef_Init(&_localemodule);
}

/*
Local variables:
c-basic-offset: 4
indent-tabs-mode: nil
End:
*/
