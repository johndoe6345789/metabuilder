#include "parts.h"
#include "util.h"


static TyObject *
sys_getobject(TyObject *Py_UNUSED(module), TyObject *arg)
{
    const char *name;
    Ty_ssize_t size;
    if (!TyArg_Parse(arg, "z#", &name, &size)) {
        return NULL;
    }
    TyObject *result = TySys_GetObject(name);
    if (result == NULL) {
        result = TyExc_AttributeError;
    }
    return Ty_NewRef(result);
}

static TyObject *
sys_setobject(TyObject *Py_UNUSED(module), TyObject *args)
{
    const char *name;
    Ty_ssize_t size;
    TyObject *value;
    if (!TyArg_ParseTuple(args, "z#O", &name, &size, &value)) {
        return NULL;
    }
    NULLABLE(value);
    RETURN_INT(TySys_SetObject(name, value));
}

static TyObject *
sys_getxoptions(TyObject *Py_UNUSED(module), TyObject *Py_UNUSED(ignored))
{
    TyObject *result = TySys_GetXOptions();
    return Ty_XNewRef(result);
}


static TyMethodDef test_methods[] = {
    {"sys_getobject", sys_getobject, METH_O},
    {"sys_setobject", sys_setobject, METH_VARARGS},
    {"sys_getxoptions", sys_getxoptions, METH_NOARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Sys(TyObject *m)
{
    if (TyModule_AddFunctions(m, test_methods) < 0) {
        return -1;
    }

    return 0;
}
