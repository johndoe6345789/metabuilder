/*
 * Tests for Python/getargs.c and Python/modsupport.c;
 * APIs that parse and build arguments.
 */

#include "parts.h"

static TyObject *
parse_tuple_and_keywords(TyObject *self, TyObject *args)
{
    TyObject *sub_args;
    TyObject *sub_kwargs;
    const char *sub_format;
    TyObject *sub_keywords;

#define MAX_PARAMS 8
    double buffers[MAX_PARAMS][4]; /* double ensures alignment where necessary */
    char *keywords[MAX_PARAMS + 1]; /* space for NULL at end */

    TyObject *return_value = NULL;

    if (!TyArg_ParseTuple(args, "OOsO:parse_tuple_and_keywords",
                          &sub_args, &sub_kwargs, &sub_format, &sub_keywords))
    {
        return NULL;
    }

    if (!(TyList_CheckExact(sub_keywords) ||
        TyTuple_CheckExact(sub_keywords)))
    {
        TyErr_SetString(TyExc_ValueError,
            "parse_tuple_and_keywords: "
            "sub_keywords must be either list or tuple");
        return NULL;
    }

    memset(buffers, 0, sizeof(buffers));
    memset(keywords, 0, sizeof(keywords));

    Ty_ssize_t size = PySequence_Fast_GET_SIZE(sub_keywords);
    if (size > MAX_PARAMS) {
        TyErr_SetString(TyExc_ValueError,
            "parse_tuple_and_keywords: too many keywords in sub_keywords");
        goto exit;
    }

    for (Ty_ssize_t i = 0; i < size; i++) {
        TyObject *o = PySequence_Fast_GET_ITEM(sub_keywords, i);
        if (TyUnicode_Check(o)) {
            keywords[i] = (char *)TyUnicode_AsUTF8(o);
            if (keywords[i] == NULL) {
                goto exit;
            }
        }
        else if (TyBytes_Check(o)) {
            keywords[i] = TyBytes_AS_STRING(o);
        }
        else {
            TyErr_SetString(TyExc_ValueError,
                "parse_tuple_and_keywords: "
                "keywords must be str or bytes");
            goto exit;
        }
    }

    assert(MAX_PARAMS == 8);
    int result = TyArg_ParseTupleAndKeywords(sub_args, sub_kwargs,
        sub_format, keywords,
        buffers + 0, buffers + 1, buffers + 2, buffers + 3,
        buffers + 4, buffers + 5, buffers + 6, buffers + 7);

    if (result) {
        int objects_only = 1;
        int count = 0;
        for (const char *f = sub_format; *f; f++) {
            if (Ty_ISALNUM(*f)) {
                if (strchr("OSUY", *f) == NULL) {
                    objects_only = 0;
                    break;
                }
                count++;
            }
        }
        if (objects_only) {
            return_value = TyTuple_New(count);
            if (return_value == NULL) {
                goto exit;
            }
            for (Ty_ssize_t i = 0; i < count; i++) {
                TyObject *arg = *(TyObject **)(buffers + i);
                if (arg == NULL) {
                    arg = Ty_None;
                }
                TyTuple_SET_ITEM(return_value, i, Ty_NewRef(arg));
            }
        }
        else {
            return_value = Ty_NewRef(Ty_None);
        }
    }

exit:
    return return_value;
}

static TyObject *
get_args(TyObject *self, TyObject *args)
{
    if (args == NULL) {
        args = Ty_None;
    }
    return Ty_NewRef(args);
}

static TyObject *
get_kwargs(TyObject *self, TyObject *args, TyObject *kwargs)
{
    if (kwargs == NULL) {
        kwargs = Ty_None;
    }
    return Ty_NewRef(kwargs);
}

static TyObject *
getargs_w_star(TyObject *self, TyObject *args)
{
    Ty_buffer buffer;

    if (!TyArg_ParseTuple(args, "w*:getargs_w_star", &buffer)) {
        return NULL;
    }

    if (2 <= buffer.len) {
        char *str = buffer.buf;
        str[0] = '[';
        str[buffer.len-1] = ']';
    }

    TyObject *result = TyBytes_FromStringAndSize(buffer.buf, buffer.len);
    PyBuffer_Release(&buffer);
    return result;
}

static TyObject *
getargs_w_star_opt(TyObject *self, TyObject *args)
{
    Ty_buffer buffer;
    Ty_buffer buf2;
    int number = 1;

    if (!TyArg_ParseTuple(args, "w*|w*i:getargs_w_star",
                          &buffer, &buf2, &number)) {
        return NULL;
    }

    if (2 <= buffer.len) {
        char *str = buffer.buf;
        str[0] = '[';
        str[buffer.len-1] = ']';
    }

    TyObject *result = TyBytes_FromStringAndSize(buffer.buf, buffer.len);
    PyBuffer_Release(&buffer);
    return result;
}

/* Test the old w and w# codes that no longer work */
static TyObject *
test_w_code_invalid(TyObject *self, TyObject *arg)
{
    static const char * const keywords[] = {"a", "b", "c", "d", NULL};
    char *formats_3[] = {"O|w#$O",
                         "O|w$O",
                         "O|w#O",
                         "O|wO",
                         NULL};
    char *formats_4[] = {"O|w#O$O",
                         "O|wO$O",
                         "O|Ow#O",
                         "O|OwO",
                         "O|Ow#$O",
                         "O|Ow$O",
                         NULL};
    size_t n;
    TyObject *args;
    TyObject *kwargs;
    TyObject *tmp;

    if (!(args = TyTuple_Pack(1, Ty_None))) {
        return NULL;
    }

    kwargs = TyDict_New();
    if (!kwargs) {
        Ty_DECREF(args);
        return NULL;
    }

    if (TyDict_SetItemString(kwargs, "c", Ty_None)) {
        Ty_DECREF(args);
        Ty_XDECREF(kwargs);
        return NULL;
    }

    for (n = 0; formats_3[n]; ++n) {
        if (TyArg_ParseTupleAndKeywords(args, kwargs, formats_3[n],
                                        (char**) keywords,
                                        &tmp, &tmp, &tmp)) {
            Ty_DECREF(args);
            Ty_DECREF(kwargs);
            TyErr_Format(TyExc_AssertionError,
                         "test_w_code_invalid_suffix: %s",
                         formats_3[n]);
            return NULL;
        }
        else {
            if (!TyErr_ExceptionMatches(TyExc_SystemError)) {
                Ty_DECREF(args);
                Ty_DECREF(kwargs);
                return NULL;
            }
            TyErr_Clear();
        }
    }

    if (TyDict_DelItemString(kwargs, "c") ||
        TyDict_SetItemString(kwargs, "d", Ty_None)) {

        Ty_DECREF(kwargs);
        Ty_DECREF(args);
        return NULL;
    }

    for (n = 0; formats_4[n]; ++n) {
        if (TyArg_ParseTupleAndKeywords(args, kwargs, formats_4[n],
                                        (char**) keywords,
                                        &tmp, &tmp, &tmp, &tmp)) {
            Ty_DECREF(args);
            Ty_DECREF(kwargs);
            TyErr_Format(TyExc_AssertionError,
                         "test_w_code_invalid_suffix: %s",
                         formats_4[n]);
            return NULL;
        }
        else {
            if (!TyErr_ExceptionMatches(TyExc_SystemError)) {
                Ty_DECREF(args);
                Ty_DECREF(kwargs);
                return NULL;
            }
            TyErr_Clear();
        }
    }

    Ty_DECREF(args);
    Ty_DECREF(kwargs);
    Py_RETURN_NONE;
}

static TyObject *
getargs_empty(TyObject *self, TyObject *args, TyObject *kwargs)
{
    /* Test that formats can begin with '|'. See issue #4720. */
    assert(TyTuple_CheckExact(args));
    assert(kwargs == NULL || TyDict_CheckExact(kwargs));

    int result;
    if (kwargs != NULL && TyDict_GET_SIZE(kwargs) > 0) {
        static char *kwlist[] = {NULL};
        result = TyArg_ParseTupleAndKeywords(args, kwargs, "|:getargs_empty",
                                             kwlist);
    }
    else {
        result = TyArg_ParseTuple(args, "|:getargs_empty");
    }
    if (!result) {
        return NULL;
    }
    return TyLong_FromLong(result);
}

/* Test tuple argument processing */
static TyObject *
getargs_tuple(TyObject *self, TyObject *args)
{
    int a, b, c;
    if (!TyArg_ParseTuple(args, "i(ii)", &a, &b, &c)) {
        return NULL;
    }
    return Ty_BuildValue("iii", a, b, c);
}

/* test TyArg_ParseTupleAndKeywords */
static TyObject *
getargs_keywords(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *keywords[] = {"arg1","arg2","arg3","arg4","arg5", NULL};
    static const char fmt[] = "(ii)i|(i(ii))(iii)i";
    int int_args[10] = {-1, -1, -1, -1, -1, -1, -1, -1, -1, -1};

    if (!TyArg_ParseTupleAndKeywords(args, kwargs, fmt, keywords,
        &int_args[0], &int_args[1], &int_args[2], &int_args[3], &int_args[4],
        &int_args[5], &int_args[6], &int_args[7], &int_args[8], &int_args[9]))
    {
        return NULL;
    }
    return Ty_BuildValue("iiiiiiiiii",
        int_args[0], int_args[1], int_args[2], int_args[3], int_args[4],
        int_args[5], int_args[6], int_args[7], int_args[8], int_args[9]);
}

/* test TyArg_ParseTupleAndKeywords keyword-only arguments */
static TyObject *
getargs_keyword_only(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *keywords[] = {"required", "optional", "keyword_only", NULL};
    int required = -1;
    int optional = -1;
    int keyword_only = -1;

    if (!TyArg_ParseTupleAndKeywords(args, kwargs, "i|i$i", keywords,
                                     &required, &optional, &keyword_only))
    {
        return NULL;
    }
    return Ty_BuildValue("iii", required, optional, keyword_only);
}

/* test TyArg_ParseTupleAndKeywords positional-only arguments */
static TyObject *
getargs_positional_only_and_keywords(TyObject *self, TyObject *args,
                                     TyObject *kwargs)
{
    static char *keywords[] = {"", "", "keyword", NULL};
    int required = -1;
    int optional = -1;
    int keyword = -1;

    if (!TyArg_ParseTupleAndKeywords(args, kwargs, "i|ii", keywords,
                                     &required, &optional, &keyword))
    {
        return NULL;
    }
    return Ty_BuildValue("iii", required, optional, keyword);
}

/* Functions to call TyArg_ParseTuple with integer format codes,
   and return the result.
*/
static TyObject *
getargs_b(TyObject *self, TyObject *args)
{
    unsigned char value;
    if (!TyArg_ParseTuple(args, "b", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLong((unsigned long)value);
}

static TyObject *
getargs_B(TyObject *self, TyObject *args)
{
    unsigned char value;
    if (!TyArg_ParseTuple(args, "B", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLong((unsigned long)value);
}

static TyObject *
getargs_h(TyObject *self, TyObject *args)
{
    short value;
    if (!TyArg_ParseTuple(args, "h", &value)) {
        return NULL;
    }
    return TyLong_FromLong((long)value);
}

static TyObject *
getargs_H(TyObject *self, TyObject *args)
{
    unsigned short value;
    if (!TyArg_ParseTuple(args, "H", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLong((unsigned long)value);
}

static TyObject *
getargs_I(TyObject *self, TyObject *args)
{
    unsigned int value;
    if (!TyArg_ParseTuple(args, "I", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLong((unsigned long)value);
}

static TyObject *
getargs_k(TyObject *self, TyObject *args)
{
    unsigned long value;
    if (!TyArg_ParseTuple(args, "k", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLong(value);
}

static TyObject *
getargs_i(TyObject *self, TyObject *args)
{
    int value;
    if (!TyArg_ParseTuple(args, "i", &value)) {
        return NULL;
    }
    return TyLong_FromLong((long)value);
}

static TyObject *
getargs_l(TyObject *self, TyObject *args)
{
    long value;
    if (!TyArg_ParseTuple(args, "l", &value)) {
        return NULL;
    }
    return TyLong_FromLong(value);
}

static TyObject *
getargs_n(TyObject *self, TyObject *args)
{
    Ty_ssize_t value;
    if (!TyArg_ParseTuple(args, "n", &value)) {
        return NULL;
    }
    return TyLong_FromSsize_t(value);
}

static TyObject *
getargs_p(TyObject *self, TyObject *args)
{
    int value;
    if (!TyArg_ParseTuple(args, "p", &value)) {
        return NULL;
    }
    return TyLong_FromLong(value);
}

static TyObject *
getargs_L(TyObject *self, TyObject *args)
{
    long long value;
    if (!TyArg_ParseTuple(args, "L", &value)) {
        return NULL;
    }
    return TyLong_FromLongLong(value);
}

static TyObject *
getargs_K(TyObject *self, TyObject *args)
{
    unsigned long long value;
    if (!TyArg_ParseTuple(args, "K", &value)) {
        return NULL;
    }
    return TyLong_FromUnsignedLongLong(value);
}

static TyObject *
getargs_f(TyObject *self, TyObject *args)
{
    float f;
    if (!TyArg_ParseTuple(args, "f", &f)) {
        return NULL;
    }
    return TyFloat_FromDouble(f);
}

static TyObject *
getargs_d(TyObject *self, TyObject *args)
{
    double d;
    if (!TyArg_ParseTuple(args, "d", &d)) {
        return NULL;
    }
    return TyFloat_FromDouble(d);
}

static TyObject *
getargs_D(TyObject *self, TyObject *args)
{
    Ty_complex cval;
    if (!TyArg_ParseTuple(args, "D", &cval)) {
        return NULL;
    }
    return TyComplex_FromCComplex(cval);
}

static TyObject *
getargs_S(TyObject *self, TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "S", &obj)) {
        return NULL;
    }
    return Ty_NewRef(obj);
}

static TyObject *
getargs_Y(TyObject *self, TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "Y", &obj)) {
        return NULL;
    }
    return Ty_NewRef(obj);
}

static TyObject *
getargs_U(TyObject *self, TyObject *args)
{
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "U", &obj)) {
        return NULL;
    }
    return Ty_NewRef(obj);
}

static TyObject *
getargs_c(TyObject *self, TyObject *args)
{
    char c;
    if (!TyArg_ParseTuple(args, "c", &c)) {
        return NULL;
    }
    return TyLong_FromLong((unsigned char)c);
}

static TyObject *
getargs_C(TyObject *self, TyObject *args)
{
    int c;
    if (!TyArg_ParseTuple(args, "C", &c)) {
        return NULL;
    }
    return TyLong_FromLong(c);
}

static TyObject *
getargs_s(TyObject *self, TyObject *args)
{
    char *str;
    if (!TyArg_ParseTuple(args, "s", &str)) {
        return NULL;
    }
    return TyBytes_FromString(str);
}

static TyObject *
getargs_s_star(TyObject *self, TyObject *args)
{
    Ty_buffer buffer;
    TyObject *bytes;
    if (!TyArg_ParseTuple(args, "s*", &buffer)) {
        return NULL;
    }
    bytes = TyBytes_FromStringAndSize(buffer.buf, buffer.len);
    PyBuffer_Release(&buffer);
    return bytes;
}

static TyObject *
getargs_s_hash(TyObject *self, TyObject *args)
{
    char *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "s#", &str, &size)) {
        return NULL;
    }
    return TyBytes_FromStringAndSize(str, size);
}

static TyObject *
getargs_z(TyObject *self, TyObject *args)
{
    char *str;
    if (!TyArg_ParseTuple(args, "z", &str)) {
        return NULL;
    }
    if (str != NULL) {
        return TyBytes_FromString(str);
    }
    Py_RETURN_NONE;
}

static TyObject *
getargs_z_star(TyObject *self, TyObject *args)
{
    Ty_buffer buffer;
    TyObject *bytes;
    if (!TyArg_ParseTuple(args, "z*", &buffer)) {
        return NULL;
    }
    if (buffer.buf != NULL) {
        bytes = TyBytes_FromStringAndSize(buffer.buf, buffer.len);
    }
    else {
        bytes = Ty_NewRef(Ty_None);
    }
    PyBuffer_Release(&buffer);
    return bytes;
}

static TyObject *
getargs_z_hash(TyObject *self, TyObject *args)
{
    char *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &str, &size)) {
        return NULL;
    }
    if (str != NULL) {
        return TyBytes_FromStringAndSize(str, size);
    }
    Py_RETURN_NONE;
}

static TyObject *
getargs_y(TyObject *self, TyObject *args)
{
    char *str;
    if (!TyArg_ParseTuple(args, "y", &str)) {
        return NULL;
    }
    return TyBytes_FromString(str);
}

static TyObject *
getargs_y_star(TyObject *self, TyObject *args)
{
    Ty_buffer buffer;
    if (!TyArg_ParseTuple(args, "y*", &buffer)) {
        return NULL;
    }
    TyObject *bytes = TyBytes_FromStringAndSize(buffer.buf, buffer.len);
    PyBuffer_Release(&buffer);
    return bytes;
}

static TyObject *
getargs_y_hash(TyObject *self, TyObject *args)
{
    char *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "y#", &str, &size)) {
        return NULL;
    }
    return TyBytes_FromStringAndSize(str, size);
}

static TyObject *
getargs_es(TyObject *self, TyObject *args)
{
    TyObject *arg;
    const char *encoding = NULL;
    char *str;

    if (!TyArg_ParseTuple(args, "O|s", &arg, &encoding)) {
        return NULL;
    }
    if (!TyArg_Parse(arg, "es", encoding, &str)) {
        return NULL;
    }
    TyObject *result = TyBytes_FromString(str);
    TyMem_Free(str);
    return result;
}

static TyObject *
getargs_et(TyObject *self, TyObject *args)
{
    TyObject *arg;
    const char *encoding = NULL;
    char *str;

    if (!TyArg_ParseTuple(args, "O|s", &arg, &encoding)) {
        return NULL;
    }
    if (!TyArg_Parse(arg, "et", encoding, &str)) {
        return NULL;
    }
    TyObject *result = TyBytes_FromString(str);
    TyMem_Free(str);
    return result;
}

static TyObject *
getargs_es_hash(TyObject *self, TyObject *args)
{
    TyObject *arg;
    const char *encoding = NULL;
    PyByteArrayObject *buffer = NULL;
    char *str = NULL;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "O|sY", &arg, &encoding, &buffer)) {
        return NULL;
    }
    if (buffer != NULL) {
        str = TyByteArray_AS_STRING(buffer);
        size = TyByteArray_GET_SIZE(buffer);
    }
    if (!TyArg_Parse(arg, "es#", encoding, &str, &size)) {
        return NULL;
    }
    TyObject *result = TyBytes_FromStringAndSize(str, size);
    if (buffer == NULL) {
        TyMem_Free(str);
    }
    return result;
}

static TyObject *
getargs_et_hash(TyObject *self, TyObject *args)
{
    TyObject *arg;
    const char *encoding = NULL;
    PyByteArrayObject *buffer = NULL;
    char *str = NULL;
    Ty_ssize_t size;

    if (!TyArg_ParseTuple(args, "O|sY", &arg, &encoding, &buffer)) {
        return NULL;
    }
    if (buffer != NULL) {
        str = TyByteArray_AS_STRING(buffer);
        size = TyByteArray_GET_SIZE(buffer);
    }
    if (!TyArg_Parse(arg, "et#", encoding, &str, &size)) {
        return NULL;
    }
    TyObject *result = TyBytes_FromStringAndSize(str, size);
    if (buffer == NULL) {
        TyMem_Free(str);
    }
    return result;
}

static TyObject *
gh_99240_clear_args(TyObject *self, TyObject *args)
{
    char *a = NULL;
    char *b = NULL;

    if (!TyArg_ParseTuple(args, "eses", "idna", &a, "idna", &b)) {
        if (a || b) {
            TyErr_Clear();
            TyErr_SetString(TyExc_AssertionError, "Arguments are not cleared.");
        }
        return NULL;
    }
    TyMem_Free(a);
    TyMem_Free(b);
    Py_RETURN_NONE;
}

static TyMethodDef test_methods[] = {
    {"get_args",                get_args,                        METH_VARARGS},
    {"get_kwargs", _PyCFunction_CAST(get_kwargs), METH_VARARGS|METH_KEYWORDS},
    {"getargs_B",               getargs_B,                       METH_VARARGS},
    {"getargs_C",               getargs_C,                       METH_VARARGS},
    {"getargs_D",               getargs_D,                       METH_VARARGS},
    {"getargs_H",               getargs_H,                       METH_VARARGS},
    {"getargs_I",               getargs_I,                       METH_VARARGS},
    {"getargs_K",               getargs_K,                       METH_VARARGS},
    {"getargs_L",               getargs_L,                       METH_VARARGS},
    {"getargs_S",               getargs_S,                       METH_VARARGS},
    {"getargs_U",               getargs_U,                       METH_VARARGS},
    {"getargs_Y",               getargs_Y,                       METH_VARARGS},
    {"getargs_b",               getargs_b,                       METH_VARARGS},
    {"getargs_c",               getargs_c,                       METH_VARARGS},
    {"getargs_d",               getargs_d,                       METH_VARARGS},
    {"getargs_es",              getargs_es,                      METH_VARARGS},
    {"getargs_es_hash",         getargs_es_hash,                 METH_VARARGS},
    {"getargs_et",              getargs_et,                      METH_VARARGS},
    {"getargs_et_hash",         getargs_et_hash,                 METH_VARARGS},
    {"getargs_f",               getargs_f,                       METH_VARARGS},
    {"getargs_h",               getargs_h,                       METH_VARARGS},
    {"getargs_i",               getargs_i,                       METH_VARARGS},
    {"getargs_k",               getargs_k,                       METH_VARARGS},
    {"getargs_keyword_only", _PyCFunction_CAST(getargs_keyword_only), METH_VARARGS|METH_KEYWORDS},
    {"getargs_keywords", _PyCFunction_CAST(getargs_keywords), METH_VARARGS|METH_KEYWORDS},
    {"getargs_l",               getargs_l,                       METH_VARARGS},
    {"getargs_n",               getargs_n,                       METH_VARARGS},
    {"getargs_p",               getargs_p,                       METH_VARARGS},
    {"getargs_positional_only_and_keywords", _PyCFunction_CAST(getargs_positional_only_and_keywords), METH_VARARGS|METH_KEYWORDS},
    {"getargs_s",               getargs_s,                       METH_VARARGS},
    {"getargs_s_hash",          getargs_s_hash,                  METH_VARARGS},
    {"getargs_s_star",          getargs_s_star,                  METH_VARARGS},
    {"getargs_tuple",           getargs_tuple,                   METH_VARARGS},
    {"getargs_w_star",          getargs_w_star,                  METH_VARARGS},
    {"getargs_w_star_opt",      getargs_w_star_opt,              METH_VARARGS},
    {"getargs_empty",           _PyCFunction_CAST(getargs_empty), METH_VARARGS|METH_KEYWORDS},
    {"getargs_y",               getargs_y,                       METH_VARARGS},
    {"getargs_y_hash",          getargs_y_hash,                  METH_VARARGS},
    {"getargs_y_star",          getargs_y_star,                  METH_VARARGS},
    {"getargs_z",               getargs_z,                       METH_VARARGS},
    {"getargs_z_hash",          getargs_z_hash,                  METH_VARARGS},
    {"getargs_z_star",          getargs_z_star,                  METH_VARARGS},
    {"parse_tuple_and_keywords", parse_tuple_and_keywords,       METH_VARARGS},
    {"gh_99240_clear_args",     gh_99240_clear_args,             METH_VARARGS},
    {"test_w_code_invalid",     test_w_code_invalid,             METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_GetArgs(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
