#include "parts.h"
#include "util.h"

// Test TyImport_ImportModuleAttr()
static TyObject *
pyimport_importmoduleattr(TyObject *self, TyObject *args)
{
    TyObject *mod_name, *attr_name;
    if (!TyArg_ParseTuple(args, "OO", &mod_name, &attr_name)) {
        return NULL;
    }
    NULLABLE(mod_name);
    NULLABLE(attr_name);

    return TyImport_ImportModuleAttr(mod_name, attr_name);
}


// Test TyImport_ImportModuleAttrString()
static TyObject *
pyimport_importmoduleattrstring(TyObject *self, TyObject *args)
{
    const char *mod_name, *attr_name;
    Ty_ssize_t len;
    if (!TyArg_ParseTuple(args, "z#z#", &mod_name, &len, &attr_name, &len)) {
        return NULL;
    }

    return TyImport_ImportModuleAttrString(mod_name, attr_name);
}


static TyMethodDef test_methods[] = {
    {"TyImport_ImportModuleAttr", pyimport_importmoduleattr, METH_VARARGS},
    {"TyImport_ImportModuleAttrString", pyimport_importmoduleattrstring, METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Import(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}

