/*[clinic input]
preserve
[clinic start generated code]*/

TyDoc_STRVAR(_testcapi_pyfile_getline__doc__,
"pyfile_getline($module, file, n, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYFILE_GETLINE_METHODDEF    \
    {"pyfile_getline", (PyCFunction)(void(*)(void))_testcapi_pyfile_getline, METH_FASTCALL, _testcapi_pyfile_getline__doc__},

static TyObject *
_testcapi_pyfile_getline_impl(TyObject *module, TyObject *file, int n);

static TyObject *
_testcapi_pyfile_getline(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *file;
    int n;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "pyfile_getline expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    file = args[0];
    n = TyLong_AsInt(args[1]);
    if (n == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _testcapi_pyfile_getline_impl(module, file, n);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_pyfile_writeobject__doc__,
"pyfile_writeobject($module, obj, file, flags, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYFILE_WRITEOBJECT_METHODDEF    \
    {"pyfile_writeobject", (PyCFunction)(void(*)(void))_testcapi_pyfile_writeobject, METH_FASTCALL, _testcapi_pyfile_writeobject__doc__},

static TyObject *
_testcapi_pyfile_writeobject_impl(TyObject *module, TyObject *obj,
                                  TyObject *file, int flags);

static TyObject *
_testcapi_pyfile_writeobject(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *obj;
    TyObject *file;
    int flags;

    if (nargs != 3) {
        TyErr_Format(TyExc_TypeError, "pyfile_writeobject expected 3 arguments, got %zd", nargs);
        goto exit;
    }
    obj = args[0];
    file = args[1];
    flags = TyLong_AsInt(args[2]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _testcapi_pyfile_writeobject_impl(module, obj, file, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_pyobject_asfiledescriptor__doc__,
"pyobject_asfiledescriptor($module, obj, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYOBJECT_ASFILEDESCRIPTOR_METHODDEF    \
    {"pyobject_asfiledescriptor", (PyCFunction)_testcapi_pyobject_asfiledescriptor, METH_O, _testcapi_pyobject_asfiledescriptor__doc__},
/*[clinic end generated code: output=ea572aaaa01aec7b input=a9049054013a1b77]*/
