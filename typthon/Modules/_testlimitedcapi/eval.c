#include "parts.h"
#include "util.h"

static TyObject *
eval_get_func_name(TyObject *self, TyObject *func)
{
    return TyUnicode_FromString(TyEval_GetFuncName(func));
}

static TyObject *
eval_get_func_desc(TyObject *self, TyObject *func)
{
    return TyUnicode_FromString(TyEval_GetFuncDesc(func));
}

static TyObject *
eval_getlocals(TyObject *module, TyObject *Py_UNUSED(args))
{
    return Ty_XNewRef(TyEval_GetLocals());
}

static TyObject *
eval_getglobals(TyObject *module, TyObject *Py_UNUSED(args))
{
    return Ty_XNewRef(TyEval_GetGlobals());
}

static TyObject *
eval_getbuiltins(TyObject *module, TyObject *Py_UNUSED(args))
{
    return Ty_XNewRef(TyEval_GetBuiltins());
}

static TyObject *
eval_getframe(TyObject *module, TyObject *Py_UNUSED(args))
{
    return Ty_XNewRef(TyEval_GetFrame());
}

static TyObject *
eval_getframe_builtins(TyObject *module, TyObject *Py_UNUSED(args))
{
    return TyEval_GetFrameBuiltins();
}

static TyObject *
eval_getframe_globals(TyObject *module, TyObject *Py_UNUSED(args))
{
    return TyEval_GetFrameGlobals();
}

static TyObject *
eval_getframe_locals(TyObject *module, TyObject *Py_UNUSED(args))
{
    return TyEval_GetFrameLocals();
}

static TyObject *
eval_get_recursion_limit(TyObject *module, TyObject *Py_UNUSED(args))
{
    int limit = Ty_GetRecursionLimit();
    return TyLong_FromLong(limit);
}

static TyObject *
eval_set_recursion_limit(TyObject *module, TyObject *args)
{
    int limit;
    if (!TyArg_ParseTuple(args, "i", &limit)) {
        return NULL;
    }
    Ty_SetRecursionLimit(limit);
    Py_RETURN_NONE;
}

static TyMethodDef test_methods[] = {
    {"eval_get_func_name", eval_get_func_name, METH_O, NULL},
    {"eval_get_func_desc", eval_get_func_desc, METH_O, NULL},
    {"eval_getlocals", eval_getlocals, METH_NOARGS},
    {"eval_getglobals", eval_getglobals, METH_NOARGS},
    {"eval_getbuiltins", eval_getbuiltins, METH_NOARGS},
    {"eval_getframe", eval_getframe, METH_NOARGS},
    {"eval_getframe_builtins", eval_getframe_builtins, METH_NOARGS},
    {"eval_getframe_globals", eval_getframe_globals, METH_NOARGS},
    {"eval_getframe_locals", eval_getframe_locals, METH_NOARGS},
    {"eval_get_recursion_limit", eval_get_recursion_limit, METH_NOARGS},
    {"eval_set_recursion_limit", eval_set_recursion_limit, METH_VARARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Eval(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}
