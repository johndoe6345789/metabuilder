/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_testcapi_float_pack__doc__,
"float_pack($module, size, d, le, /)\n"
"--\n"
"\n"
"Test TyFloat_Pack2(), TyFloat_Pack4() and TyFloat_Pack8()");

#define _TESTCAPI_FLOAT_PACK_METHODDEF    \
    {"float_pack", _PyCFunction_CAST(_testcapi_float_pack), METH_FASTCALL, _testcapi_float_pack__doc__},

static TyObject *
_testcapi_float_pack_impl(TyObject *module, int size, double d, int le);

static TyObject *
_testcapi_float_pack(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int size;
    double d;
    int le;

    if (!_TyArg_CheckPositional("float_pack", nargs, 3, 3)) {
        goto exit;
    }
    size = TyLong_AsInt(args[0]);
    if (size == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (TyFloat_CheckExact(args[1])) {
        d = TyFloat_AS_DOUBLE(args[1]);
    }
    else
    {
        d = TyFloat_AsDouble(args[1]);
        if (d == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
    le = TyLong_AsInt(args[2]);
    if (le == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _testcapi_float_pack_impl(module, size, d, le);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_float_unpack__doc__,
"float_unpack($module, data, le, /)\n"
"--\n"
"\n"
"Test TyFloat_Unpack2(), TyFloat_Unpack4() and TyFloat_Unpack8()");

#define _TESTCAPI_FLOAT_UNPACK_METHODDEF    \
    {"float_unpack", _PyCFunction_CAST(_testcapi_float_unpack), METH_FASTCALL, _testcapi_float_unpack__doc__},

static TyObject *
_testcapi_float_unpack_impl(TyObject *module, const char *data,
                            Ty_ssize_t data_length, int le);

static TyObject *
_testcapi_float_unpack(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *data;
    Ty_ssize_t data_length;
    int le;

    if (!_TyArg_ParseStack(args, nargs, "y#i:float_unpack",
        &data, &data_length, &le)) {
        goto exit;
    }
    return_value = _testcapi_float_unpack_impl(module, data, data_length, le);

exit:
    return return_value;
}
/*[clinic end generated code: output=b43dfd3a77fe04ba input=a9049054013a1b77]*/
