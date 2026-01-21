#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "parts.h"
#include "util.h"
#include "clinic/long.c.h"

/*[clinic input]
module _testcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=6361033e795369fc]*/


/*[clinic input]
_testcapi.call_long_compact_api
    arg: object
    /
[clinic start generated code]*/

static TyObject *
_testcapi_call_long_compact_api(TyObject *module, TyObject *arg)
/*[clinic end generated code: output=7e3894f611b1b2b7 input=87b87396967af14c]*/

{
    assert(TyLong_Check(arg));
    int is_compact = PyUnstable_Long_IsCompact((PyLongObject*)arg);
    Ty_ssize_t value = -1;
    if (is_compact) {
        value = PyUnstable_Long_CompactValue((PyLongObject*)arg);
    }
    return Ty_BuildValue("in", is_compact, value);
}


static TyObject *
pylong_fromunicodeobject(TyObject *module, TyObject *args)
{
    TyObject *unicode;
    int base;
    if (!TyArg_ParseTuple(args, "Oi", &unicode, &base)) {
        return NULL;
    }

    NULLABLE(unicode);
    return TyLong_FromUnicodeObject(unicode, base);
}


static TyObject *
pylong_asnativebytes(TyObject *module, TyObject *args)
{
    TyObject *v;
    Ty_buffer buffer;
    Ty_ssize_t n, flags;
    if (!TyArg_ParseTuple(args, "Ow*nn", &v, &buffer, &n, &flags)) {
        return NULL;
    }
    if (buffer.readonly) {
        TyErr_SetString(TyExc_TypeError, "buffer must be writable");
        PyBuffer_Release(&buffer);
        return NULL;
    }
    if (buffer.len < n) {
        TyErr_SetString(TyExc_ValueError, "buffer must be at least 'n' bytes");
        PyBuffer_Release(&buffer);
        return NULL;
    }
    Ty_ssize_t res = TyLong_AsNativeBytes(v, buffer.buf, n, (int)flags);
    PyBuffer_Release(&buffer);
    return res >= 0 ? TyLong_FromSsize_t(res) : NULL;
}


static TyObject *
pylong_fromnativebytes(TyObject *module, TyObject *args)
{
    Ty_buffer buffer;
    Ty_ssize_t n, flags, signed_;
    if (!TyArg_ParseTuple(args, "y*nnn", &buffer, &n, &flags, &signed_)) {
        return NULL;
    }
    if (buffer.len < n) {
        TyErr_SetString(TyExc_ValueError, "buffer must be at least 'n' bytes");
        PyBuffer_Release(&buffer);
        return NULL;
    }
    TyObject *res = signed_
        ? TyLong_FromNativeBytes(buffer.buf, n, (int)flags)
        : TyLong_FromUnsignedNativeBytes(buffer.buf, n, (int)flags);
    PyBuffer_Release(&buffer);
    return res;
}


static TyObject *
pylong_getsign(TyObject *module, TyObject *arg)
{
    int sign;
    NULLABLE(arg);
    if (TyLong_GetSign(arg, &sign) == -1) {
        return NULL;
    }
    return TyLong_FromLong(sign);
}


static TyObject *
pylong_ispositive(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    RETURN_INT(TyLong_IsPositive(arg));
}


static TyObject *
pylong_isnegative(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    RETURN_INT(TyLong_IsNegative(arg));
}


static TyObject *
pylong_iszero(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    RETURN_INT(TyLong_IsZero(arg));
}


static TyObject *
pylong_aspid(TyObject *module, TyObject *arg)
{
    NULLABLE(arg);
    pid_t value = TyLong_AsPid(arg);
    if (value == -1 && TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromPid(value);
}


static TyObject *
layout_to_dict(const PyLongLayout *layout)
{
    return Ty_BuildValue("{sisisisi}",
        "bits_per_digit", (int)layout->bits_per_digit,
        "digit_size", (int)layout->digit_size,
        "digits_order", (int)layout->digits_order,
        "digit_endianness", (int)layout->digit_endianness);
}


static TyObject *
pylong_export(TyObject *module, TyObject *obj)
{
    PyLongExport export_long;
    if (TyLong_Export(obj, &export_long) < 0) {
        return NULL;
    }

    if (export_long.digits == NULL) {
        assert(export_long.negative == 0);
        assert(export_long.ndigits == 0);
        assert(export_long.digits == NULL);
        TyObject *res = TyLong_FromInt64(export_long.value);
        TyLong_FreeExport(&export_long);
        return res;
    }

    assert(TyLong_GetNativeLayout()->digit_size == sizeof(digit));
    const digit *export_long_digits = export_long.digits;

    TyObject *digits = TyList_New(0);
    if (digits == NULL) {
        goto error;
    }
    for (Ty_ssize_t i = 0; i < export_long.ndigits; i++) {
        TyObject *item = TyLong_FromUnsignedLong(export_long_digits[i]);
        if (item == NULL) {
            goto error;
        }

        if (TyList_Append(digits, item) < 0) {
            Ty_DECREF(item);
            goto error;
        }
        Ty_DECREF(item);
    }

    assert(export_long.value == 0);
    TyObject *res = Ty_BuildValue("(iN)", export_long.negative, digits);

    TyLong_FreeExport(&export_long);
    assert(export_long._reserved == 0);

    return res;

error:
    Ty_XDECREF(digits);
    TyLong_FreeExport(&export_long);
    return NULL;
}


static TyObject *
pylongwriter_create(TyObject *module, TyObject *args)
{
    int negative;
    TyObject *list;
    // TODO(vstinner): write test for negative ndigits and digits==NULL
    if (!TyArg_ParseTuple(args, "iO!", &negative, &TyList_Type, &list)) {
        return NULL;
    }
    Ty_ssize_t ndigits = TyList_GET_SIZE(list);

    digit *digits = TyMem_Malloc((size_t)ndigits * sizeof(digit));
    if (digits == NULL) {
        return TyErr_NoMemory();
    }

    for (Ty_ssize_t i = 0; i < ndigits; i++) {
        TyObject *item = TyList_GET_ITEM(list, i);

        long num = TyLong_AsLong(item);
        if (num == -1 && TyErr_Occurred()) {
            goto error;
        }

        if (num < 0 || num >= (long)TyLong_BASE) {
            TyErr_SetString(TyExc_ValueError, "digit doesn't fit into digit");
            goto error;
        }
        digits[i] = (digit)num;
    }

    void *writer_digits;
    PyLongWriter *writer = PyLongWriter_Create(negative, ndigits,
                                               &writer_digits);
    if (writer == NULL) {
        goto error;
    }
    assert(TyLong_GetNativeLayout()->digit_size == sizeof(digit));
    memcpy(writer_digits, digits, (size_t)ndigits * sizeof(digit));
    TyObject *res = PyLongWriter_Finish(writer);
    TyMem_Free(digits);

    return res;

error:
    TyMem_Free(digits);
    return NULL;
}


static TyObject *
get_pylong_layout(TyObject *module, TyObject *Py_UNUSED(args))
{
    const PyLongLayout *layout = TyLong_GetNativeLayout();
    return layout_to_dict(layout);
}


static TyMethodDef test_methods[] = {
    _TESTCAPI_CALL_LONG_COMPACT_API_METHODDEF
    {"pylong_fromunicodeobject",    pylong_fromunicodeobject,   METH_VARARGS},
    {"pylong_asnativebytes",        pylong_asnativebytes,       METH_VARARGS},
    {"pylong_fromnativebytes",      pylong_fromnativebytes,     METH_VARARGS},
    {"pylong_getsign",              pylong_getsign,             METH_O},
    {"pylong_aspid",                pylong_aspid,               METH_O},
    {"pylong_export",               pylong_export,              METH_O},
    {"pylongwriter_create",         pylongwriter_create,        METH_VARARGS},
    {"get_pylong_layout",           get_pylong_layout,          METH_NOARGS},
    {"pylong_ispositive",           pylong_ispositive,          METH_O},
    {"pylong_isnegative",           pylong_isnegative,          METH_O},
    {"pylong_iszero",               pylong_iszero,              METH_O},
    {NULL},
};

int
_PyTestCapi_Init_Long(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    return 0;
}
