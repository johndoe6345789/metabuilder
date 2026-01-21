#include "Python.h"
#include "pycore_pythonrun.h"     // _Ty_SourceAsString()
#include "pycore_symtable.h"      // struct symtable

#include "clinic/symtablemodule.c.h"
/*[clinic input]
module _symtable
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=f4685845a7100605]*/


/*[clinic input]
_symtable.symtable

    source:    object
    filename:  object(converter='TyUnicode_FSDecoder')
    startstr:  str
    /

Return symbol and scope dictionaries used internally by compiler.
[clinic start generated code]*/

static TyObject *
_symtable_symtable_impl(TyObject *module, TyObject *source,
                        TyObject *filename, const char *startstr)
/*[clinic end generated code: output=59eb0d5fc7285ac4 input=9dd8a50c0c36a4d7]*/
{
    struct symtable *st;
    TyObject *t;
    int start;
    PyCompilerFlags cf = _PyCompilerFlags_INIT;
    TyObject *source_copy = NULL;

    cf.cf_flags = PyCF_SOURCE_IS_UTF8;

    const char *str = _Ty_SourceAsString(source, "symtable", "string or bytes", &cf, &source_copy);
    if (str == NULL) {
        return NULL;
    }

    if (strcmp(startstr, "exec") == 0)
        start = Ty_file_input;
    else if (strcmp(startstr, "eval") == 0)
        start = Ty_eval_input;
    else if (strcmp(startstr, "single") == 0)
        start = Ty_single_input;
    else {
        TyErr_SetString(TyExc_ValueError,
           "symtable() arg 3 must be 'exec' or 'eval' or 'single'");
        Ty_DECREF(filename);
        Ty_XDECREF(source_copy);
        return NULL;
    }
    st = _Ty_SymtableStringObjectFlags(str, filename, start, &cf);
    Ty_DECREF(filename);
    Ty_XDECREF(source_copy);
    if (st == NULL) {
        return NULL;
    }
    t = Ty_NewRef(st->st_top);
    _TySymtable_Free(st);
    return t;
}

static TyMethodDef symtable_methods[] = {
    _SYMTABLE_SYMTABLE_METHODDEF
    {NULL,              NULL}           /* sentinel */
};

static int
symtable_init_constants(TyObject *m)
{
    if (TyModule_AddIntMacro(m, USE) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_GLOBAL) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_NONLOCAL) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_LOCAL) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_PARAM) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_TYPE_PARAM) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_FREE_CLASS) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_IMPORT) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_BOUND) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_ANNOT) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_COMP_ITER) < 0) return -1;
    if (TyModule_AddIntMacro(m, DEF_COMP_CELL) < 0) return -1;

    if (TyModule_AddIntConstant(m, "TYPE_FUNCTION", FunctionBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_CLASS", ClassBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_MODULE", ModuleBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_ANNOTATION", AnnotationBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_TYPE_ALIAS", TypeAliasBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_TYPE_PARAMETERS", TypeParametersBlock) < 0)
        return -1;
    if (TyModule_AddIntConstant(m, "TYPE_TYPE_VARIABLE", TypeVariableBlock) < 0)
        return -1;

    if (TyModule_AddIntMacro(m, LOCAL) < 0) return -1;
    if (TyModule_AddIntMacro(m, GLOBAL_EXPLICIT) < 0) return -1;
    if (TyModule_AddIntMacro(m, GLOBAL_IMPLICIT) < 0) return -1;
    if (TyModule_AddIntMacro(m, FREE) < 0) return -1;
    if (TyModule_AddIntMacro(m, CELL) < 0) return -1;

    if (TyModule_AddIntConstant(m, "SCOPE_OFF", SCOPE_OFFSET) < 0) return -1;
    if (TyModule_AddIntMacro(m, SCOPE_MASK) < 0) return -1;

    return 0;
}

static PyModuleDef_Slot symtable_slots[] = {
    {Ty_mod_exec, symtable_init_constants},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef symtablemodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_symtable",
    .m_size = 0,
    .m_methods = symtable_methods,
    .m_slots = symtable_slots,
};

PyMODINIT_FUNC
PyInit__symtable(void)
{
    return PyModuleDef_Init(&symtablemodule);
}
