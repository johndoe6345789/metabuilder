// Need limited C API version 3.13 for TyImport_AddModuleRef()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "parts.h"
#include "util.h"


/* Test TyImport_GetMagicNumber() */
static TyObject *
pyimport_getmagicnumber(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(args))
{
    long magic = TyImport_GetMagicNumber();
    return TyLong_FromLong(magic);
}


/* Test TyImport_GetMagicTag() */
static TyObject *
pyimport_getmagictag(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(args))
{
    const char *tag = TyImport_GetMagicTag();
    return TyUnicode_FromString(tag);
}


/* Test TyImport_GetModuleDict() */
static TyObject *
pyimport_getmoduledict(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(args))
{
    return Ty_XNewRef(TyImport_GetModuleDict());
}


/* Test TyImport_GetModule() */
static TyObject *
pyimport_getmodule(TyObject *Py_UNUSED(module), TyObject *name)
{
    assert(!TyErr_Occurred());
    NULLABLE(name);
    TyObject *module = TyImport_GetModule(name);
    if (module == NULL && !TyErr_Occurred()) {
        return Ty_NewRef(TyExc_KeyError);
    }
    return module;
}


/* Test TyImport_AddModuleObject() */
static TyObject *
pyimport_addmoduleobject(TyObject *Py_UNUSED(module), TyObject *name)
{
    NULLABLE(name);
    return Ty_XNewRef(TyImport_AddModuleObject(name));
}


/* Test TyImport_AddModule() */
static TyObject *
pyimport_addmodule(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &name, &size)) {
        return NULL;
    }

    return Ty_XNewRef(TyImport_AddModule(name));
}


/* Test TyImport_AddModuleRef() */
static TyObject *
pyimport_addmoduleref(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &name, &size)) {
        return NULL;
    }

    return TyImport_AddModuleRef(name);
}


/* Test TyImport_Import() */
static TyObject *
pyimport_import(TyObject *Py_UNUSED(module), TyObject *name)
{
    NULLABLE(name);
    return TyImport_Import(name);
}


/* Test TyImport_ImportModule() */
static TyObject *
pyimport_importmodule(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &name, &size)) {
        return NULL;
    }

    return TyImport_ImportModule(name);
}


/* Test TyImport_ImportModuleNoBlock() */
static TyObject *
pyimport_importmodulenoblock(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &name, &size)) {
        return NULL;
    }

    _Ty_COMP_DIAG_PUSH
    _Ty_COMP_DIAG_IGNORE_DEPR_DECLS
    return TyImport_ImportModuleNoBlock(name);
    _Ty_COMP_DIAG_POP
}


/* Test TyImport_ImportModuleEx() */
static TyObject *
pyimport_importmoduleex(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *globals, *locals, *fromlist;
    if (!TyArg_ParseTuple(args, "z#OOO",
                          &name, &size, &globals, &locals, &fromlist)) {
        return NULL;
    }
    NULLABLE(globals);
    NULLABLE(locals);
    NULLABLE(fromlist);

    return TyImport_ImportModuleEx(name, globals, locals, fromlist);
}


/* Test TyImport_ImportModuleLevel() */
static TyObject *
pyimport_importmodulelevel(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *globals, *locals, *fromlist;
    int level;
    if (!TyArg_ParseTuple(args, "z#OOOi",
                          &name, &size, &globals, &locals, &fromlist, &level)) {
        return NULL;
    }
    NULLABLE(globals);
    NULLABLE(locals);
    NULLABLE(fromlist);

    return TyImport_ImportModuleLevel(name, globals, locals, fromlist, level);
}


/* Test TyImport_ImportModuleLevelObject() */
static TyObject *
pyimport_importmodulelevelobject(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *name, *globals, *locals, *fromlist;
    int level;
    if (!TyArg_ParseTuple(args, "OOOOi",
                          &name, &globals, &locals, &fromlist, &level)) {
        return NULL;
    }
    NULLABLE(name);
    NULLABLE(globals);
    NULLABLE(locals);
    NULLABLE(fromlist);

    return TyImport_ImportModuleLevelObject(name, globals, locals, fromlist, level);
}


/* Test TyImport_ImportFrozenModule() */
static TyObject *
pyimport_importfrozenmodule(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "z#", &name, &size)) {
        return NULL;
    }

    RETURN_INT(TyImport_ImportFrozenModule(name));
}


/* Test TyImport_ImportFrozenModuleObject() */
static TyObject *
pyimport_importfrozenmoduleobject(TyObject *Py_UNUSED(module), TyObject *name)
{
    NULLABLE(name);
    RETURN_INT(TyImport_ImportFrozenModuleObject(name));
}


/* Test TyImport_ExecCodeModule() */
static TyObject *
pyimport_executecodemodule(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *code;
    if (!TyArg_ParseTuple(args, "z#O", &name, &size, &code)) {
        return NULL;
    }
    NULLABLE(code);

    return TyImport_ExecCodeModule(name, code);
}


/* Test TyImport_ExecCodeModuleEx() */
static TyObject *
pyimport_executecodemoduleex(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *code;
    const char *pathname;
    if (!TyArg_ParseTuple(args, "z#Oz#", &name, &size, &code, &pathname, &size)) {
        return NULL;
    }
    NULLABLE(code);

    return TyImport_ExecCodeModuleEx(name, code, pathname);
}


/* Test TyImport_ExecCodeModuleWithPathnames() */
static TyObject *
pyimport_executecodemodulewithpathnames(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *code;
    const char *pathname;
    const char *cpathname;
    if (!TyArg_ParseTuple(args, "z#Oz#z#", &name, &size, &code, &pathname, &size, &cpathname, &size)) {
        return NULL;
    }
    NULLABLE(code);

    return TyImport_ExecCodeModuleWithPathnames(name, code,
                                                pathname, cpathname);
}


/* Test TyImport_ExecCodeModuleObject() */
static TyObject *
pyimport_executecodemoduleobject(TyObject *Py_UNUSED(module), TyObject *args)
{
    TyObject *name, *code, *pathname, *cpathname;
    if (!TyArg_ParseTuple(args, "OOOO", &name, &code, &pathname, &cpathname)) {
        return NULL;
    }
    NULLABLE(name);
    NULLABLE(code);
    NULLABLE(pathname);
    NULLABLE(cpathname);

    return TyImport_ExecCodeModuleObject(name, code, pathname, cpathname);
}


static TyMethodDef test_methods[] = {
    {"TyImport_GetMagicNumber", pyimport_getmagicnumber, METH_NOARGS},
    {"TyImport_GetMagicTag", pyimport_getmagictag, METH_NOARGS},
    {"TyImport_GetModuleDict", pyimport_getmoduledict, METH_NOARGS},
    {"TyImport_GetModule", pyimport_getmodule, METH_O},
    {"TyImport_AddModuleObject", pyimport_addmoduleobject, METH_O},
    {"TyImport_AddModule", pyimport_addmodule, METH_VARARGS},
    {"TyImport_AddModuleRef", pyimport_addmoduleref, METH_VARARGS},
    {"TyImport_Import", pyimport_import, METH_O},
    {"TyImport_ImportModule", pyimport_importmodule, METH_VARARGS},
    {"TyImport_ImportModuleNoBlock", pyimport_importmodulenoblock, METH_VARARGS},
    {"TyImport_ImportModuleEx", pyimport_importmoduleex, METH_VARARGS},
    {"TyImport_ImportModuleLevel", pyimport_importmodulelevel, METH_VARARGS},
    {"TyImport_ImportModuleLevelObject", pyimport_importmodulelevelobject, METH_VARARGS},
    {"TyImport_ImportFrozenModule", pyimport_importfrozenmodule, METH_VARARGS},
    {"TyImport_ImportFrozenModuleObject", pyimport_importfrozenmoduleobject, METH_O},
    {"TyImport_ExecCodeModule", pyimport_executecodemodule, METH_VARARGS},
    {"TyImport_ExecCodeModuleEx", pyimport_executecodemoduleex, METH_VARARGS},
    {"TyImport_ExecCodeModuleWithPathnames", pyimport_executecodemodulewithpathnames, METH_VARARGS},
    {"TyImport_ExecCodeModuleObject", pyimport_executecodemoduleobject, METH_VARARGS},
    {NULL},
};


int
_PyTestLimitedCAPI_Init_Import(TyObject *module)
{
    return TyModule_AddFunctions(module, test_methods);
}
