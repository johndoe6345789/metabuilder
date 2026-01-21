/* stringlib: partition implementation */

#ifndef STRINGLIB_FASTSEARCH_H
#  error must include "stringlib/fastsearch.h" before including this module
#endif

#if !STRINGLIB_MUTABLE && !defined(STRINGLIB_GET_EMPTY)
#  error "STRINGLIB_GET_EMPTY must be defined if STRINGLIB_MUTABLE is zero"
#endif


Ty_LOCAL_INLINE(TyObject*)
STRINGLIB(partition)(TyObject* str_obj,
                    const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
                    TyObject* sep_obj,
                    const STRINGLIB_CHAR* sep, Ty_ssize_t sep_len)
{
    TyObject* out;
    Ty_ssize_t pos;

    if (sep_len == 0) {
        TyErr_SetString(TyExc_ValueError, "empty separator");
        return NULL;
    }

    out = TyTuple_New(3);
    if (!out)
        return NULL;

    pos = FASTSEARCH(str, str_len, sep, sep_len, -1, FAST_SEARCH);

    if (pos < 0) {
#if STRINGLIB_MUTABLE
        TyTuple_SET_ITEM(out, 0, STRINGLIB_NEW(str, str_len));
        TyTuple_SET_ITEM(out, 1, STRINGLIB_NEW(NULL, 0));
        TyTuple_SET_ITEM(out, 2, STRINGLIB_NEW(NULL, 0));

        if (TyErr_Occurred()) {
            Ty_DECREF(out);
            return NULL;
        }
#else
        Ty_INCREF(str_obj);
        TyTuple_SET_ITEM(out, 0, (TyObject*) str_obj);
        TyObject *empty = (TyObject*)STRINGLIB_GET_EMPTY();
        assert(empty != NULL);
        Ty_INCREF(empty);
        TyTuple_SET_ITEM(out, 1, empty);
        Ty_INCREF(empty);
        TyTuple_SET_ITEM(out, 2, empty);
#endif
        return out;
    }

    TyTuple_SET_ITEM(out, 0, STRINGLIB_NEW(str, pos));
    Ty_INCREF(sep_obj);
    TyTuple_SET_ITEM(out, 1, sep_obj);
    pos += sep_len;
    TyTuple_SET_ITEM(out, 2, STRINGLIB_NEW(str + pos, str_len - pos));

    if (TyErr_Occurred()) {
        Ty_DECREF(out);
        return NULL;
    }

    return out;
}

Ty_LOCAL_INLINE(TyObject*)
STRINGLIB(rpartition)(TyObject* str_obj,
                     const STRINGLIB_CHAR* str, Ty_ssize_t str_len,
                     TyObject* sep_obj,
                     const STRINGLIB_CHAR* sep, Ty_ssize_t sep_len)
{
    TyObject* out;
    Ty_ssize_t pos;

    if (sep_len == 0) {
        TyErr_SetString(TyExc_ValueError, "empty separator");
        return NULL;
    }

    out = TyTuple_New(3);
    if (!out)
        return NULL;

    pos = FASTSEARCH(str, str_len, sep, sep_len, -1, FAST_RSEARCH);

    if (pos < 0) {
#if STRINGLIB_MUTABLE
        TyTuple_SET_ITEM(out, 0, STRINGLIB_NEW(NULL, 0));
        TyTuple_SET_ITEM(out, 1, STRINGLIB_NEW(NULL, 0));
        TyTuple_SET_ITEM(out, 2, STRINGLIB_NEW(str, str_len));

        if (TyErr_Occurred()) {
            Ty_DECREF(out);
            return NULL;
        }
#else
        TyObject *empty = (TyObject*)STRINGLIB_GET_EMPTY();
        assert(empty != NULL);
        Ty_INCREF(empty);
        TyTuple_SET_ITEM(out, 0, empty);
        Ty_INCREF(empty);
        TyTuple_SET_ITEM(out, 1, empty);
        Ty_INCREF(str_obj);
        TyTuple_SET_ITEM(out, 2, (TyObject*) str_obj);
#endif
        return out;
    }

    TyTuple_SET_ITEM(out, 0, STRINGLIB_NEW(str, pos));
    Ty_INCREF(sep_obj);
    TyTuple_SET_ITEM(out, 1, sep_obj);
    pos += sep_len;
    TyTuple_SET_ITEM(out, 2, STRINGLIB_NEW(str + pos, str_len - pos));

    if (TyErr_Occurred()) {
        Ty_DECREF(out);
        return NULL;
    }

    return out;
}

