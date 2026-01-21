#include "pegen.h"
#include "pycore_compile.h"       // _TyAST_Compile()


TyObject *
_build_return_object(mod_ty module, int mode, TyObject *filename_ob, PyArena *arena)
{
    TyObject *result = NULL;

    if (mode == 2) {
        result = (TyObject *)_TyAST_Compile(module, filename_ob, NULL, -1, arena);
    } else if (mode == 1) {
        result = TyAST_mod2obj(module);
    } else {
        result = Ty_NewRef(Ty_None);
    }

    return result;
}

static TyObject *
parse_file(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *keywords[] = {"file", "mode", NULL};
    const char *filename;
    int mode = 2;
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "s|i", keywords, &filename, &mode)) {
        return NULL;
    }
    if (mode < 0 || mode > 2) {
        return TyErr_Format(TyExc_ValueError, "Bad mode, must be 0 <= mode <= 2");
    }

    PyArena *arena = _TyArena_New();
    if (arena == NULL) {
        return NULL;
    }

    TyObject *result = NULL;

    TyObject *filename_ob = TyUnicode_FromString(filename);
    if (filename_ob == NULL) {
        goto error;
    }

    FILE *fp = fopen(filename, "rb");
    if (fp == NULL) {
        TyErr_SetFromErrnoWithFilename(TyExc_OSError, filename);
        goto error;
    }

    PyCompilerFlags flags = _PyCompilerFlags_INIT;
    mod_ty res = _TyPegen_run_parser_from_file_pointer(
                        fp, Ty_file_input, filename_ob,
                        NULL, NULL, NULL, &flags, NULL, NULL, arena);
    fclose(fp);
    if (res == NULL) {
        goto error;
    }

    result = _build_return_object(res, mode, filename_ob, arena);

error:
    Ty_XDECREF(filename_ob);
    _TyArena_Free(arena);
    return result;
}

static TyObject *
parse_string(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *keywords[] = {"str", "mode", NULL};
    const char *the_string;
    int mode = 2;
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "s|i", keywords, &the_string, &mode)) {
        return NULL;
    }
    if (mode < 0 || mode > 2) {
        return TyErr_Format(TyExc_ValueError, "Bad mode, must be 0 <= mode <= 2");
    }

    PyArena *arena = _TyArena_New();
    if (arena == NULL) {
        return NULL;
    }

    TyObject *result = NULL;

    TyObject *filename_ob = TyUnicode_FromString("<string>");
    if (filename_ob == NULL) {
        goto error;
    }

    PyCompilerFlags flags = _PyCompilerFlags_INIT;
    mod_ty res = _TyPegen_run_parser_from_string(the_string, Ty_file_input, filename_ob,
                                        &flags, arena);
    if (res == NULL) {
        goto error;
    }
    result = _build_return_object(res, mode, filename_ob, arena);

error:
    Ty_XDECREF(filename_ob);
    _TyArena_Free(arena);
    return result;
}

static TyObject *
clear_memo_stats(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(ignored))
{
#if defined(Ty_DEBUG)
    _TyPegen_clear_memo_statistics();
#endif
    Py_RETURN_NONE;
}

static TyObject *
get_memo_stats(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(ignored))
{
#if defined(Ty_DEBUG)
    return _TyPegen_get_memo_statistics();
#else
    Py_RETURN_NONE;
#endif
}

// TODO: Write to Python's sys.stdout instead of C's stdout.
static TyObject *
dump_memo_stats(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(ignored))
{
#if defined(Ty_DEBUG)
    TyObject *list = _TyPegen_get_memo_statistics();
    if (list == NULL) {
        return NULL;
    }
    Ty_ssize_t len = TyList_Size(list);
    for (Ty_ssize_t i = 0; i < len; i++) {
        TyObject *value = TyList_GetItem(list, i);  // Borrowed reference.
        long count = TyLong_AsLong(value);
        if (count < 0) {
            break;
        }
        if (count > 0) {
            printf("%4zd %9ld\n", i, count);
        }
    }
    Ty_DECREF(list);
#endif
    Py_RETURN_NONE;
}

static TyMethodDef ParseMethods[] = {
    {"parse_file", _PyCFunction_CAST(parse_file), METH_VARARGS|METH_KEYWORDS, "Parse a file."},
    {"parse_string", _PyCFunction_CAST(parse_string), METH_VARARGS|METH_KEYWORDS, "Parse a string."},
    {"clear_memo_stats", clear_memo_stats, METH_NOARGS},
    {"dump_memo_stats", dump_memo_stats, METH_NOARGS},
    {"get_memo_stats", get_memo_stats, METH_NOARGS},
    {NULL, NULL, 0, NULL}        /* Sentinel */
};

static struct TyModuleDef parsemodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "parse",
    .m_doc = "A parser.",
    .m_methods = ParseMethods,
};

PyMODINIT_FUNC
PyInit_parse(void)
{
    return TyModule_Create(&parsemodule);
}
