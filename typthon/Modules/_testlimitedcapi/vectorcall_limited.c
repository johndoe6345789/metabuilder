/* Test Vectorcall in the limited API */

// Need limited C API version 3.12 for PyObject_Vectorcall()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x030c0000
#endif

#include <stddef.h>                         // offsetof

#include "parts.h"
#include "clinic/vectorcall_limited.c.h"

/*[clinic input]
module _testlimitedcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2700057f9c1135ba]*/

static TyObject *
LimitedVectorCallClass_tpcall(TyObject *self, TyObject *args, TyObject *kwargs) {
    return TyUnicode_FromString("tp_call called");
}

static TyObject *
LimitedVectorCallClass_vectorcall(TyObject *callable,
                            TyObject *const *args,
                            size_t nargsf,
                            TyObject *kwnames) {
    return TyUnicode_FromString("vectorcall called");
}

static TyObject *
LimitedVectorCallClass_new(TyTypeObject *tp, TyObject *a, TyObject *kw)
{
    TyObject *self = ((allocfunc)TyType_GetSlot(tp, Ty_tp_alloc))(tp, 0);
    if (!self) {
        return NULL;
    }
    *(vectorcallfunc*)((char*)self + sizeof(TyObject)) = (
        LimitedVectorCallClass_vectorcall);
    return self;
}

/*[clinic input]
_testlimitedcapi.call_vectorcall

    callable: object
    /
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_call_vectorcall(TyObject *module, TyObject *callable)
/*[clinic end generated code: output=9cbb7832263a8eef input=0743636c12dccb28]*/
{
    TyObject *args[3] = { NULL, NULL, NULL };
    TyObject *kwname = NULL, *kwnames = NULL, *result = NULL;

    args[1] = TyUnicode_FromString("foo");
    if (!args[1]) {
        goto leave;
    }

    args[2] = TyUnicode_FromString("bar");
    if (!args[2]) {
        goto leave;
    }

    kwname = TyUnicode_InternFromString("baz");
    if (!kwname) {
        goto leave;
    }

    kwnames = TyTuple_New(1);
    if (!kwnames) {
        goto leave;
    }

    if (TyTuple_SetItem(kwnames, 0, kwname)) {
        goto leave;
    }

    result = PyObject_Vectorcall(
        callable,
        args + 1,
        1 | PY_VECTORCALL_ARGUMENTS_OFFSET,
        kwnames
    );

leave:
    Ty_XDECREF(args[1]);
    Ty_XDECREF(args[2]);
    Ty_XDECREF(kwnames);

    return result;
}

/*[clinic input]
_testlimitedcapi.call_vectorcall_method

    callable: object
    /
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_call_vectorcall_method(TyObject *module, TyObject *callable)
/*[clinic end generated code: output=4558323a46cc09eb input=a736f7dbf15f1be5]*/
{
    TyObject *args[3] = { NULL, NULL, NULL };
    TyObject *name = NULL, *kwname = NULL,
             *kwnames = NULL, *result = NULL;

    name = TyUnicode_FromString("f");
    if (!name) {
        goto leave;
    }

    args[0] = callable;
    args[1] = TyUnicode_FromString("foo");
    if (!args[1]) {
        goto leave;
    }

    args[2] = TyUnicode_FromString("bar");
    if (!args[2]) {
        goto leave;
    }

    kwname = TyUnicode_InternFromString("baz");
    if (!kwname) {
        goto leave;
    }

    kwnames = TyTuple_New(1);
    if (!kwnames) {
        goto leave;
    }

    if (TyTuple_SetItem(kwnames, 0, kwname)) {
        goto leave;
    }


    result = PyObject_VectorcallMethod(
        name,
        args,
        2 | PY_VECTORCALL_ARGUMENTS_OFFSET,
        kwnames
    );

leave:
    Ty_XDECREF(name);
    Ty_XDECREF(args[1]);
    Ty_XDECREF(args[2]);
    Ty_XDECREF(kwnames);

    return result;
}

static TyMemberDef LimitedVectorCallClass_members[] = {
    {"__vectorcalloffset__", Ty_T_PYSSIZET, sizeof(TyObject), Py_READONLY},
    {NULL}
};

static TyType_Slot LimitedVectorallClass_slots[] = {
    {Ty_tp_new, LimitedVectorCallClass_new},
    {Ty_tp_call, LimitedVectorCallClass_tpcall},
    {Ty_tp_members, LimitedVectorCallClass_members},
    {0},
};

static TyType_Spec LimitedVectorCallClass_spec = {
    .name = "_testlimitedcapi.LimitedVectorCallClass",
    .basicsize = (int)(sizeof(TyObject) + sizeof(vectorcallfunc)),
    .flags = Ty_TPFLAGS_DEFAULT
        | Ty_TPFLAGS_HAVE_VECTORCALL
        | Ty_TPFLAGS_BASETYPE,
    .slots = LimitedVectorallClass_slots,
};

typedef struct {
    vectorcallfunc vfunc;
} LimitedRelativeVectorCallStruct;

static TyObject *
LimitedRelativeVectorCallClass_new(TyTypeObject *tp, TyObject *a, TyObject *kw)
{
    TyObject *self = ((allocfunc)TyType_GetSlot(tp, Ty_tp_alloc))(tp, 0);
    if (!self) {
        return NULL;
    }
    LimitedRelativeVectorCallStruct *data = PyObject_GetTypeData(self, tp);
    data->vfunc = LimitedVectorCallClass_vectorcall;
    return self;
}


static TyType_Spec LimitedRelativeVectorCallClass_spec = {
    .name = "_testlimitedcapi.LimitedRelativeVectorCallClass",
    .basicsize = -(int)sizeof(LimitedRelativeVectorCallStruct),
    .flags = Ty_TPFLAGS_DEFAULT
        | Ty_TPFLAGS_HAVE_VECTORCALL,
    .slots = (TyType_Slot[]) {
        {Ty_tp_new, LimitedRelativeVectorCallClass_new},
        {Ty_tp_call, LimitedVectorCallClass_tpcall},
        {Ty_tp_members, (TyMemberDef[]){
            {"__vectorcalloffset__", Ty_T_PYSSIZET,
             offsetof(LimitedRelativeVectorCallStruct, vfunc),
             Py_READONLY | Ty_RELATIVE_OFFSET},
            {NULL}
        }},
        {0}
    },
};

static TyMethodDef TestMethods[] = {
    _TESTLIMITEDCAPI_CALL_VECTORCALL_METHODDEF
    _TESTLIMITEDCAPI_CALL_VECTORCALL_METHOD_METHODDEF
    {NULL},
};

int
_PyTestLimitedCAPI_Init_VectorcallLimited(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    TyObject *LimitedVectorCallClass = TyType_FromModuleAndSpec(
        m, &LimitedVectorCallClass_spec, NULL);
    if (!LimitedVectorCallClass) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject *)LimitedVectorCallClass) < 0) {
        return -1;
    }
    Ty_DECREF(LimitedVectorCallClass);

    TyObject *LimitedRelativeVectorCallClass = TyType_FromModuleAndSpec(
        m, &LimitedRelativeVectorCallClass_spec, NULL);
    if (!LimitedRelativeVectorCallClass) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject *)LimitedRelativeVectorCallClass) < 0) {
        return -1;
    }
    Ty_DECREF(LimitedRelativeVectorCallClass);

    return 0;
}
