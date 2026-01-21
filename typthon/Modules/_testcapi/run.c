#define PYTESTCAPI_NEED_INTERNAL_API
#include "parts.h"
#include "util.h"
#include "pycore_fileutils.h"     // _Ty_IsValidFD()

#include <stdio.h>
#include <errno.h>


static TyObject *
run_stringflags(TyObject *mod, TyObject *pos_args)
{
    const char *str;
    Ty_ssize_t size;
    int start;
    TyObject *globals = NULL;
    TyObject *locals = NULL;
    PyCompilerFlags flags = _PyCompilerFlags_INIT;
    PyCompilerFlags *pflags = NULL;
    int cf_flags = 0;
    int cf_feature_version = 0;

    if (!TyArg_ParseTuple(pos_args, "z#iO|Oii",
                          &str, &size, &start, &globals, &locals,
                          &cf_flags, &cf_feature_version)) {
        return NULL;
    }

    NULLABLE(globals);
    NULLABLE(locals);
    if (cf_flags || cf_feature_version) {
        flags.cf_flags = cf_flags;
        flags.cf_feature_version = cf_feature_version;
        pflags = &flags;
    }

    return TyRun_StringFlags(str, start, globals, locals, pflags);
}

static TyObject *
run_fileexflags(TyObject *mod, TyObject *pos_args)
{
    TyObject *result = NULL;
    const char *filename = NULL;
    Ty_ssize_t filename_size;
    int start;
    TyObject *globals = NULL;
    TyObject *locals = NULL;
    int closeit = 0;
    PyCompilerFlags flags = _PyCompilerFlags_INIT;
    PyCompilerFlags *pflags = NULL;
    int cf_flags = 0;
    int cf_feature_version = 0;

    FILE *fp = NULL;

    if (!TyArg_ParseTuple(pos_args, "z#iO|Oiii",
                          &filename, &filename_size, &start, &globals, &locals,
                          &closeit, &cf_flags, &cf_feature_version)) {
        return NULL;
    }

    NULLABLE(globals);
    NULLABLE(locals);
    if (cf_flags || cf_feature_version) {
        flags.cf_flags = cf_flags;
        flags.cf_feature_version = cf_feature_version;
        pflags = &flags;
    }

    fp = fopen(filename, "r");
    if (fp == NULL) {
        TyErr_SetFromErrnoWithFilename(TyExc_OSError, filename);
        return NULL;
    }
    int fd = fileno(fp);

    result = TyRun_FileExFlags(fp, filename, start, globals, locals, closeit, pflags);

    if (closeit && result && _Ty_IsValidFD(fd)) {
        TyErr_SetString(TyExc_AssertionError, "File was not closed after execution");
        Ty_DECREF(result);
        fclose(fp);
        return NULL;
    }

    if (!closeit && !_Ty_IsValidFD(fd)) {
        TyErr_SetString(TyExc_AssertionError, "Bad file descriptor after execution");
        Ty_XDECREF(result);
        return NULL;
    }

    if (!closeit) {
        fclose(fp); /* don't need open file any more*/
    }

    return result;
}

static TyMethodDef test_methods[] = {
    {"run_stringflags", run_stringflags, METH_VARARGS},
    {"run_fileexflags", run_fileexflags, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Run(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    return 0;
}
