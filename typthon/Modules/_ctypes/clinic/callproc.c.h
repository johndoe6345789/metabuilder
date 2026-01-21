/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_ctypes_sizeof__doc__,
"sizeof($module, obj, /)\n"
"--\n"
"\n"
"Return the size in bytes of a C instance.");

#define _CTYPES_SIZEOF_METHODDEF    \
    {"sizeof", (PyCFunction)_ctypes_sizeof, METH_O, _ctypes_sizeof__doc__},

TyDoc_STRVAR(_ctypes_byref__doc__,
"byref($module, obj, offset=0, /)\n"
"--\n"
"\n"
"Return a pointer lookalike to a C instance, only usable as function argument.");

#define _CTYPES_BYREF_METHODDEF    \
    {"byref", _PyCFunction_CAST(_ctypes_byref), METH_FASTCALL, _ctypes_byref__doc__},

static TyObject *
_ctypes_byref_impl(TyObject *module, TyObject *obj, Ty_ssize_t offset);

static TyObject *
_ctypes_byref(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *obj;
    Ty_ssize_t offset = 0;

    if (!_TyArg_CheckPositional("byref", nargs, 1, 2)) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], clinic_state()->PyCData_Type)) {
        _TyArg_BadArgument("byref", "argument 1", (clinic_state()->PyCData_Type)->tp_name, args[0]);
        goto exit;
    }
    obj = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        offset = ival;
    }
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(obj);
    return_value = _ctypes_byref_impl(module, obj, offset);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_ctypes_addressof__doc__,
"addressof($module, obj, /)\n"
"--\n"
"\n"
"Return the address of the C instance internal buffer");

#define _CTYPES_ADDRESSOF_METHODDEF    \
    {"addressof", (PyCFunction)_ctypes_addressof, METH_O, _ctypes_addressof__doc__},

static TyObject *
_ctypes_addressof_impl(TyObject *module, TyObject *obj);

static TyObject *
_ctypes_addressof(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *obj;

    if (!PyObject_TypeCheck(arg, clinic_state()->PyCData_Type)) {
        _TyArg_BadArgument("addressof", "argument", (clinic_state()->PyCData_Type)->tp_name, arg);
        goto exit;
    }
    obj = arg;
    Ty_BEGIN_CRITICAL_SECTION(obj);
    return_value = _ctypes_addressof_impl(module, obj);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_ctypes_resize__doc__,
"resize($module, obj, size, /)\n"
"--\n"
"\n");

#define _CTYPES_RESIZE_METHODDEF    \
    {"resize", _PyCFunction_CAST(_ctypes_resize), METH_FASTCALL, _ctypes_resize__doc__},

static TyObject *
_ctypes_resize_impl(TyObject *module, CDataObject *obj, Ty_ssize_t size);

static TyObject *
_ctypes_resize(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    CDataObject *obj;
    Ty_ssize_t size;

    if (!_TyArg_CheckPositional("resize", nargs, 2, 2)) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], clinic_state()->PyCData_Type)) {
        _TyArg_BadArgument("resize", "argument 1", (clinic_state()->PyCData_Type)->tp_name, args[0]);
        goto exit;
    }
    obj = (CDataObject *)args[0];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        size = ival;
    }
    Ty_BEGIN_CRITICAL_SECTION(obj);
    return_value = _ctypes_resize_impl(module, obj, size);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}
/*[clinic end generated code: output=23c74aced603977d input=a9049054013a1b77]*/
