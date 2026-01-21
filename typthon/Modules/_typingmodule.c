/* typing accelerator C extension: _typing module. */

#ifndef Ty_BUILD_CORE
#define Ty_BUILD_CORE
#endif

#include "Python.h"
#include "internal/pycore_interp.h"
#include "internal/pycore_typevarobject.h"
#include "internal/pycore_unionobject.h"  // _PyUnion_Type
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "clinic/_typingmodule.c.h"

/*[clinic input]
module _typing

[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=1db35baf1c72942b]*/

/* helper function to make typing.NewType.__call__ method faster */

/*[clinic input]
_typing._idfunc -> object

    x: object
    /

[clinic start generated code]*/

static TyObject *
_typing__idfunc(TyObject *module, TyObject *x)
/*[clinic end generated code: output=63c38be4a6ec5f2c input=49f17284b43de451]*/
{
    return Ty_NewRef(x);
}


static TyMethodDef typing_methods[] = {
    _TYPING__IDFUNC_METHODDEF
    {NULL, NULL, 0, NULL}
};

TyDoc_STRVAR(typing_doc,
"Primitives and accelerators for the typing module.\n");

static int
_typing_exec(TyObject *m)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

#define EXPORT_TYPE(name, typename) \
    if (TyModule_AddObjectRef(m, name, \
                              (TyObject *)interp->cached_objects.typename) < 0) { \
        return -1; \
    }

    EXPORT_TYPE("TypeVar", typevar_type);
    EXPORT_TYPE("TypeVarTuple", typevartuple_type);
    EXPORT_TYPE("ParamSpec", paramspec_type);
    EXPORT_TYPE("ParamSpecArgs", paramspecargs_type);
    EXPORT_TYPE("ParamSpecKwargs", paramspeckwargs_type);
    EXPORT_TYPE("Generic", generic_type);
#undef EXPORT_TYPE
    if (TyModule_AddObjectRef(m, "TypeAliasType", (TyObject *)&_PyTypeAlias_Type) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "Union", (TyObject *)&_PyUnion_Type) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "NoDefault", (TyObject *)&_Ty_NoDefaultStruct) < 0) {
        return -1;
    }
    return 0;
}

static struct PyModuleDef_Slot _typingmodule_slots[] = {
    {Ty_mod_exec, _typing_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef typingmodule = {
        PyModuleDef_HEAD_INIT,
        "_typing",
        typing_doc,
        0,
        typing_methods,
        _typingmodule_slots,
        NULL,
        NULL,
        NULL
};

PyMODINIT_FUNC
PyInit__typing(void)
{
    return PyModuleDef_Init(&typingmodule);
}
