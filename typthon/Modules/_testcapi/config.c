#include "parts.h"


static TyObject *
_testcapi_config_get(TyObject *module, TyObject *name_obj)
{
    const char *name;
    if (TyArg_Parse(name_obj, "s", &name) < 0) {
        return NULL;
    }

    return TyConfig_Get(name);
}


static TyObject *
_testcapi_config_getint(TyObject *module, TyObject *name_obj)
{
    const char *name;
    if (TyArg_Parse(name_obj, "s", &name) < 0) {
        return NULL;
    }

    int value;
    if (TyConfig_GetInt(name, &value) < 0) {
        return NULL;
    }
    return TyLong_FromLong(value);
}


static TyObject *
_testcapi_config_names(TyObject *module, TyObject* Py_UNUSED(args))
{
    return TyConfig_Names();
}


static TyObject *
_testcapi_config_set(TyObject *module, TyObject *args)
{
    const char *name;
    TyObject *value;
    if (TyArg_ParseTuple(args, "sO", &name, &value) < 0) {
        return NULL;
    }

    int res = TyConfig_Set(name, value);
    if (res < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"config_get", _testcapi_config_get, METH_O},
    {"config_getint", _testcapi_config_getint, METH_O},
    {"config_names", _testcapi_config_names, METH_NOARGS},
    {"config_set", _testcapi_config_set, METH_VARARGS},
    {NULL}
};

int
_PyTestCapi_Init_Config(TyObject *mod)
{
    return TyModule_AddFunctions(mod, test_methods);
}
