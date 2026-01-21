/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_testcapi_pyfile_newstdprinter__doc__,
"pyfile_newstdprinter($module, fd, /)\n"
"--\n"
"\n");

#define _TESTCAPI_PYFILE_NEWSTDPRINTER_METHODDEF    \
    {"pyfile_newstdprinter", (PyCFunction)_testcapi_pyfile_newstdprinter, METH_O, _testcapi_pyfile_newstdprinter__doc__},

static TyObject *
_testcapi_pyfile_newstdprinter_impl(TyObject *module, int fd);

static TyObject *
_testcapi_pyfile_newstdprinter(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _testcapi_pyfile_newstdprinter_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_py_fopen__doc__,
"py_fopen($module, path, mode, /)\n"
"--\n"
"\n"
"Call Ty_fopen(), fread(256) and Ty_fclose(). Return read bytes.");

#define _TESTCAPI_PY_FOPEN_METHODDEF    \
    {"py_fopen", _PyCFunction_CAST(_testcapi_py_fopen), METH_FASTCALL, _testcapi_py_fopen__doc__},

static TyObject *
_testcapi_py_fopen_impl(TyObject *module, TyObject *path, const char *mode,
                        Ty_ssize_t mode_length);

static TyObject *
_testcapi_py_fopen(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *path;
    const char *mode;
    Ty_ssize_t mode_length;

    if (!_TyArg_ParseStack(args, nargs, "Oz#:py_fopen",
        &path, &mode, &mode_length)) {
        goto exit;
    }
    return_value = _testcapi_py_fopen_impl(module, path, mode, mode_length);

exit:
    return return_value;
}

TyDoc_STRVAR(_testcapi_py_universalnewlinefgets__doc__,
"py_universalnewlinefgets($module, file, size, /)\n"
"--\n"
"\n"
"Read a line from a file using Ty_UniversalNewlineFgets.");

#define _TESTCAPI_PY_UNIVERSALNEWLINEFGETS_METHODDEF    \
    {"py_universalnewlinefgets", _PyCFunction_CAST(_testcapi_py_universalnewlinefgets), METH_FASTCALL, _testcapi_py_universalnewlinefgets__doc__},

static TyObject *
_testcapi_py_universalnewlinefgets_impl(TyObject *module, TyObject *file,
                                        int size);

static TyObject *
_testcapi_py_universalnewlinefgets(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *file;
    int size;

    if (!_TyArg_CheckPositional("py_universalnewlinefgets", nargs, 2, 2)) {
        goto exit;
    }
    file = args[0];
    size = TyLong_AsInt(args[1]);
    if (size == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _testcapi_py_universalnewlinefgets_impl(module, file, size);

exit:
    return return_value;
}
/*[clinic end generated code: output=a5ed111054e3a0bc input=a9049054013a1b77]*/
