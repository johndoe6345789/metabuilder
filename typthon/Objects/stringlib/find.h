/* stringlib: find/index implementation */

#ifndef STRINGLIB_FASTSEARCH_H
#error must include "stringlib/fastsearch.h" before including this module
#endif

Ty_LOCAL_INLINE(Ty_ssize_t)
STRINGLIB(find)(const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
               const STRINGLIB_CHAR* sub, Ty_ssize_t sub_len,
               Ty_ssize_t offset)
{
    Ty_ssize_t pos;

    assert(str_len >= 0);
    if (sub_len == 0)
        return offset;

    pos = FASTSEARCH(str, str_len, sub, sub_len, -1, FAST_SEARCH);

    if (pos >= 0)
        pos += offset;

    return pos;
}

Ty_LOCAL_INLINE(Ty_ssize_t)
STRINGLIB(rfind)(const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
                const STRINGLIB_CHAR* sub, Ty_ssize_t sub_len,
                Ty_ssize_t offset)
{
    Ty_ssize_t pos;

    assert(str_len >= 0);
    if (sub_len == 0)
        return str_len + offset;

    pos = FASTSEARCH(str, str_len, sub, sub_len, -1, FAST_RSEARCH);

    if (pos >= 0)
        pos += offset;

    return pos;
}

Ty_LOCAL_INLINE(Ty_ssize_t)
STRINGLIB(find_slice)(const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
                     const STRINGLIB_CHAR* sub, Ty_ssize_t sub_len,
                     Ty_ssize_t start, Ty_ssize_t end)
{
    return STRINGLIB(find)(str + start, end - start, sub, sub_len, start);
}

Ty_LOCAL_INLINE(Ty_ssize_t)
STRINGLIB(rfind_slice)(const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
                      const STRINGLIB_CHAR* sub, Ty_ssize_t sub_len,
                      Ty_ssize_t start, Ty_ssize_t end)
{
    return STRINGLIB(rfind)(str + start, end - start, sub, sub_len, start);
}

#ifdef STRINGLIB_WANT_CONTAINS_OBJ

Ty_LOCAL_INLINE(int)
STRINGLIB(contains_obj)(TyObject* str, TyObject* sub)
{
    return STRINGLIB(find)(
        STRINGLIB_STR(str), STRINGLIB_LEN(str),
        STRINGLIB_STR(sub), STRINGLIB_LEN(sub), 0
        ) != -1;
}

#endif /* STRINGLIB_WANT_CONTAINS_OBJ */
