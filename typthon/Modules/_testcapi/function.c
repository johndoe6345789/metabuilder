#include "parts.h"
#include "util.h"


static TyObject *
function_get_code(TyObject *self, TyObject *func)
{
    TyObject *code = TyFunction_GetCode(func);
    if (code != NULL) {
        return Ty_NewRef(code);
    } else {
        return NULL;
    }
}


static TyObject *
function_get_globals(TyObject *self, TyObject *func)
{
    TyObject *globals = TyFunction_GetGlobals(func);
    if (globals != NULL) {
        return Ty_NewRef(globals);
    } else {
        return NULL;
    }
}


static TyObject *
function_get_module(TyObject *self, TyObject *func)
{
    TyObject *module = TyFunction_GetModule(func);
    if (module != NULL) {
        return Ty_NewRef(module);
    } else {
        return NULL;
    }
}


static TyObject *
function_get_defaults(TyObject *self, TyObject *func)
{
    TyObject *defaults = TyFunction_GetDefaults(func);
    if (defaults != NULL) {
        return Ty_NewRef(defaults);
    } else if (TyErr_Occurred()) {
        return NULL;
    } else {
        Py_RETURN_NONE;  // This can happen when `defaults` are set to `None`
    }
}


static TyObject *
function_set_defaults(TyObject *self, TyObject *args)
{
    TyObject *func = NULL, *defaults = NULL;
    if (!TyArg_ParseTuple(args, "OO", &func, &defaults)) {
        return NULL;
    }
    int result = TyFunction_SetDefaults(func, defaults);
    if (result == -1)
        return NULL;
    Py_RETURN_NONE;
}


static TyObject *
function_get_kw_defaults(TyObject *self, TyObject *func)
{
    TyObject *defaults = TyFunction_GetKwDefaults(func);
    if (defaults != NULL) {
        return Ty_NewRef(defaults);
    } else if (TyErr_Occurred()) {
        return NULL;
    } else {
        Py_RETURN_NONE;  // This can happen when `kwdefaults` are set to `None`
    }
}


static TyObject *
function_set_kw_defaults(TyObject *self, TyObject *args)
{
    TyObject *func = NULL, *defaults = NULL;
    if (!TyArg_ParseTuple(args, "OO", &func, &defaults)) {
        return NULL;
    }
    int result = TyFunction_SetKwDefaults(func, defaults);
    if (result == -1)
        return NULL;
    Py_RETURN_NONE;
}


static TyObject *
function_get_closure(TyObject *self, TyObject *func)
{
    TyObject *closure = TyFunction_GetClosure(func);
    if (closure != NULL) {
        return Ty_NewRef(closure);
    } else if (TyErr_Occurred()) {
        return NULL;
    } else {
        Py_RETURN_NONE;  // This can happen when `closure` is set to `None`
    }
}


static TyObject *
function_set_closure(TyObject *self, TyObject *args)
{
    TyObject *func = NULL, *closure = NULL;
    if (!TyArg_ParseTuple(args, "OO", &func, &closure)) {
        return NULL;
    }
    int result = TyFunction_SetClosure(func, closure);
    if (result == -1) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyMethodDef test_methods[] = {
    {"function_get_code", function_get_code, METH_O, NULL},
    {"function_get_globals", function_get_globals, METH_O, NULL},
    {"function_get_module", function_get_module, METH_O, NULL},
    {"function_get_defaults", function_get_defaults, METH_O, NULL},
    {"function_set_defaults", function_set_defaults, METH_VARARGS, NULL},
    {"function_get_kw_defaults", function_get_kw_defaults, METH_O, NULL},
    {"function_set_kw_defaults", function_set_kw_defaults, METH_VARARGS, NULL},
    {"function_get_closure", function_get_closure, METH_O, NULL},
    {"function_set_closure", function_set_closure, METH_VARARGS, NULL},
    {NULL},
};

int
_PyTestCapi_Init_Function(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
