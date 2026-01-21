#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
   // Need limited C API 3.13 for TyLong_AsInt()
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "parts.h"
#include "util.h"
#include "clinic/file.c.h"


/*[clinic input]
module _testcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=6361033e795369fc]*/


static TyObject *
pyfile_fromfd(TyObject *module, TyObject *args)
{
    int fd;
    const char *name;
    Ty_ssize_t size;
    const char *mode;
    int buffering;
    const char *encoding;
    const char *errors;
    const char *newline;
    int closefd;
    if (!TyArg_ParseTuple(args,
                          "iz#z#"
                          "iz#z#"
                          "z#i",
                          &fd, &name, &size, &mode, &size,
                          &buffering, &encoding, &size, &errors, &size,
                          &newline, &size, &closefd)) {
        return NULL;
    }

    return TyFile_FromFd(fd, name, mode, buffering,
                         encoding, errors, newline, closefd);
}


/*[clinic input]
_testcapi.pyfile_getline

    file: object
    n: int
    /

[clinic start generated code]*/

static TyObject *
_testcapi_pyfile_getline_impl(TyObject *module, TyObject *file, int n)
/*[clinic end generated code: output=137fde2774563266 input=df26686148b3657e]*/
{
    return TyFile_GetLine(file, n);
}


/*[clinic input]
_testcapi.pyfile_writeobject

    obj: object
    file: object
    flags: int
    /

[clinic start generated code]*/

static TyObject *
_testcapi_pyfile_writeobject_impl(TyObject *module, TyObject *obj,
                                  TyObject *file, int flags)
/*[clinic end generated code: output=ebb4d802e3db489c input=64a34a3e75b9935a]*/
{
    NULLABLE(obj);
    NULLABLE(file);
    RETURN_INT(TyFile_WriteObject(obj, file, flags));
}


static TyObject *
pyfile_writestring(TyObject *module, TyObject *args)
{
    const char *str;
    Ty_ssize_t size;
    TyObject *file;
    if (!TyArg_ParseTuple(args, "z#O", &str, &size, &file)) {
        return NULL;
    }
    NULLABLE(file);

    RETURN_INT(TyFile_WriteString(str, file));
}


/*[clinic input]
_testcapi.pyobject_asfiledescriptor

    obj: object
    /

[clinic start generated code]*/

static TyObject *
_testcapi_pyobject_asfiledescriptor(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=2d640c6a1970c721 input=45fa1171d62b18d7]*/
{
    NULLABLE(obj);
    RETURN_INT(PyObject_AsFileDescriptor(obj));
}


static TyMethodDef test_methods[] = {
    {"pyfile_fromfd", pyfile_fromfd, METH_VARARGS},
    _TESTCAPI_PYFILE_GETLINE_METHODDEF
    _TESTCAPI_PYFILE_WRITEOBJECT_METHODDEF
    {"pyfile_writestring", pyfile_writestring, METH_VARARGS},
    _TESTCAPI_PYOBJECT_ASFILEDESCRIPTOR_METHODDEF
    {NULL},
};

int
_PyTestLimitedCAPI_Init_File(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
