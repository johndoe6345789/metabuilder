// clinic/vectorcall.c.h uses internal pycore_modsupport.h API
#define PYTESTCAPI_NEED_INTERNAL_API

#include "parts.h"
#include "clinic/vectorcall.c.h"


#include <stddef.h>                 // offsetof

/*[clinic input]
module _testcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=6361033e795369fc]*/

/* Test PEP 590 - Vectorcall */

static int
fastcall_args(TyObject *args, TyObject ***stack, Ty_ssize_t *nargs)
{
    if (args == Ty_None) {
        *stack = NULL;
        *nargs = 0;
    }
    else if (TyTuple_Check(args)) {
        *stack = ((PyTupleObject *)args)->ob_item;
        *nargs = TyTuple_GET_SIZE(args);
    }
    else {
        TyErr_SetString(TyExc_TypeError, "args must be None or a tuple");
        return -1;
    }
    return 0;
}

/*[clinic input]
_testcapi.pyobject_fastcalldict
    func: object
    func_args: object
    kwargs: object
    /
[clinic start generated code]*/

static TyObject *
_testcapi_pyobject_fastcalldict_impl(TyObject *module, TyObject *func,
                                     TyObject *func_args, TyObject *kwargs)
/*[clinic end generated code: output=35902ece94de4418 input=b9c0196ca7d5f9e4]*/
{
    TyObject **stack;
    Ty_ssize_t nargs;

    if (fastcall_args(func_args, &stack, &nargs) < 0) {
        return NULL;
    }

    if (kwargs == Ty_None) {
        kwargs = NULL;
    }
    else if (!TyDict_Check(kwargs)) {
        TyErr_SetString(TyExc_TypeError, "kwnames must be None or a dict");
        return NULL;
    }

    return PyObject_VectorcallDict(func, stack, nargs, kwargs);
}

/*[clinic input]
_testcapi.pyobject_vectorcall
    func: object
    func_args: object
    kwnames: object
    /
[clinic start generated code]*/

static TyObject *
_testcapi_pyobject_vectorcall_impl(TyObject *module, TyObject *func,
                                   TyObject *func_args, TyObject *kwnames)
/*[clinic end generated code: output=ff77245bc6afe0d8 input=a0668dfef625764c]*/
{
    TyObject **stack;
    Ty_ssize_t nargs, nkw;

    if (fastcall_args(func_args, &stack, &nargs) < 0) {
        return NULL;
    }

    if (kwnames == Ty_None) {
        kwnames = NULL;
    }
    else if (TyTuple_Check(kwnames)) {
        nkw = TyTuple_GET_SIZE(kwnames);
        if (nargs < nkw) {
            TyErr_SetString(TyExc_ValueError, "kwnames longer than args");
            return NULL;
        }
        nargs -= nkw;
    }
    else {
        TyErr_SetString(TyExc_TypeError, "kwnames must be None or a tuple");
        return NULL;
    }
    return PyObject_Vectorcall(func, stack, nargs, kwnames);
}

static TyObject *
override_vectorcall(TyObject *callable, TyObject *const *args, size_t nargsf,
                    TyObject *kwnames)
{
    return TyUnicode_FromString("overridden");
}

static TyObject *
function_setvectorcall(TyObject *self, TyObject *func)
{
    if (!TyFunction_Check(func)) {
        TyErr_SetString(TyExc_TypeError, "'func' must be a function");
        return NULL;
    }
    TyFunction_SetVectorcall((PyFunctionObject *)func, (vectorcallfunc)override_vectorcall);
    Py_RETURN_NONE;
}

/*[clinic input]
_testcapi.pyvectorcall_call
    func: object
    argstuple: object
    kwargs: object = NULL
    /
[clinic start generated code]*/

static TyObject *
_testcapi_pyvectorcall_call_impl(TyObject *module, TyObject *func,
                                 TyObject *argstuple, TyObject *kwargs)
/*[clinic end generated code: output=809046fe78511306 input=4376ee7cabd698ce]*/
{
    if (!TyTuple_Check(argstuple)) {
        TyErr_SetString(TyExc_TypeError, "args must be a tuple");
        return NULL;
    }
    if (kwargs != NULL && !TyDict_Check(kwargs)) {
        TyErr_SetString(TyExc_TypeError, "kwargs must be a dict");
        return NULL;
    }

    return PyVectorcall_Call(func, argstuple, kwargs);
}

TyObject *
VectorCallClass_tpcall(TyObject *self, TyObject *args, TyObject *kwargs) {
    return TyUnicode_FromString("tp_call");
}

TyObject *
VectorCallClass_vectorcall(TyObject *callable,
                            TyObject *const *args,
                            size_t nargsf,
                            TyObject *kwnames) {
    return TyUnicode_FromString("vectorcall");
}

/*[clinic input]
class _testcapi.VectorCallClass "TyObject *" "&TyType_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=95c63c1a47f9a995]*/

/*[clinic input]
_testcapi.VectorCallClass.set_vectorcall

    type: object(subclass_of="&TyType_Type", type="TyTypeObject *")
    /

Set self's vectorcall function for `type` to one that returns "vectorcall"
[clinic start generated code]*/

static TyObject *
_testcapi_VectorCallClass_set_vectorcall_impl(TyObject *self,
                                              TyTypeObject *type)
/*[clinic end generated code: output=b37f0466f15da903 input=840de66182c7d71a]*/
{
    if (!PyObject_TypeCheck(self, type)) {
        return TyErr_Format(
            TyExc_TypeError,
            "expected %N instance",
            type);
    }
    if (!type->tp_vectorcall_offset) {
        return TyErr_Format(
            TyExc_TypeError,
            "type %N has no vectorcall offset",
            type);
    }
    *(vectorcallfunc*)((char*)self + type->tp_vectorcall_offset) = (
        VectorCallClass_vectorcall);
    Py_RETURN_NONE;
}

TyMethodDef VectorCallClass_methods[] = {
    _TESTCAPI_VECTORCALLCLASS_SET_VECTORCALL_METHODDEF
    {NULL, NULL}
};

TyMemberDef VectorCallClass_members[] = {
    {"__vectorcalloffset__", Ty_T_PYSSIZET, 0/* set later */, Py_READONLY},
    {NULL}
};

TyType_Slot VectorCallClass_slots[] = {
    {Ty_tp_call, VectorCallClass_tpcall},
    {Ty_tp_members, VectorCallClass_members},
    {Ty_tp_methods, VectorCallClass_methods},
    {0},
};

/*[clinic input]
_testcapi.make_vectorcall_class

    base: object(subclass_of="&TyType_Type", type="TyTypeObject *") = NULL
    /

Create a class whose instances return "tpcall" when called.

When the "set_vectorcall" method is called on an instance, a vectorcall
function that returns "vectorcall" will be installed.
[clinic start generated code]*/

static TyObject *
_testcapi_make_vectorcall_class_impl(TyObject *module, TyTypeObject *base)
/*[clinic end generated code: output=16dcfc3062ddf968 input=f72e01ccf52de2b4]*/
{
    if (!base) {
        base = (TyTypeObject *)&PyBaseObject_Type;
    }
    VectorCallClass_members[0].offset = base->tp_basicsize;
    TyType_Spec spec = {
        .name = "_testcapi.VectorcallClass",
        .basicsize = (int)(base->tp_basicsize + sizeof(vectorcallfunc)),
        .flags = Ty_TPFLAGS_DEFAULT
            | Ty_TPFLAGS_HAVE_VECTORCALL
            | Ty_TPFLAGS_BASETYPE,
        .slots = VectorCallClass_slots,
    };

    return TyType_FromSpecWithBases(&spec, (TyObject *)base);
}

/*[clinic input]
_testcapi.has_vectorcall_flag -> bool

    type: object(subclass_of="&TyType_Type", type="TyTypeObject *")
    /

Return true iff Ty_TPFLAGS_HAVE_VECTORCALL is set on the class.
[clinic start generated code]*/

static int
_testcapi_has_vectorcall_flag_impl(TyObject *module, TyTypeObject *type)
/*[clinic end generated code: output=3ae8d1374388c671 input=8eee492ac548749e]*/
{
    return TyType_HasFeature(type, Ty_TPFLAGS_HAVE_VECTORCALL);
}

static TyMethodDef TestMethods[] = {
    _TESTCAPI_PYOBJECT_FASTCALLDICT_METHODDEF
    _TESTCAPI_PYOBJECT_VECTORCALL_METHODDEF
    {"function_setvectorcall", function_setvectorcall, METH_O},
    _TESTCAPI_PYVECTORCALL_CALL_METHODDEF
    _TESTCAPI_MAKE_VECTORCALL_CLASS_METHODDEF
    _TESTCAPI_HAS_VECTORCALL_FLAG_METHODDEF
    {NULL},
};


typedef struct {
    PyObject_HEAD
    vectorcallfunc vectorcall;
} MethodDescriptorObject;

static TyObject *
MethodDescriptor_vectorcall(TyObject *callable, TyObject *const *args,
                            size_t nargsf, TyObject *kwnames)
{
    /* True if using the vectorcall function in MethodDescriptorObject
     * but False for MethodDescriptor2Object */
    MethodDescriptorObject *md = (MethodDescriptorObject *)callable;
    return TyBool_FromLong(md->vectorcall != NULL);
}

static TyObject *
MethodDescriptor_new(TyTypeObject* type, TyObject* args, TyObject *kw)
{
    MethodDescriptorObject *op = (MethodDescriptorObject *)type->tp_alloc(type, 0);
    op->vectorcall = MethodDescriptor_vectorcall;
    return (TyObject *)op;
}

static TyObject *
func_descr_get(TyObject *func, TyObject *obj, TyObject *type)
{
    if (obj == Ty_None || obj == NULL) {
        return Ty_NewRef(func);
    }
    return TyMethod_New(func, obj);
}

static TyObject *
nop_descr_get(TyObject *func, TyObject *obj, TyObject *type)
{
    return Ty_NewRef(func);
}

static TyObject *
call_return_args(TyObject *self, TyObject *args, TyObject *kwargs)
{
    return Ty_NewRef(args);
}

static TyTypeObject MethodDescriptorBase_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "MethodDescriptorBase",
    sizeof(MethodDescriptorObject),
    .tp_new = MethodDescriptor_new,
    .tp_call = PyVectorcall_Call,
    .tp_vectorcall_offset = offsetof(MethodDescriptorObject, vectorcall),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
                Ty_TPFLAGS_METHOD_DESCRIPTOR | Ty_TPFLAGS_HAVE_VECTORCALL,
    .tp_descr_get = func_descr_get,
};

static TyTypeObject MethodDescriptorDerived_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "MethodDescriptorDerived",
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
};

static TyTypeObject MethodDescriptorNopGet_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "MethodDescriptorNopGet",
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .tp_call = call_return_args,
    .tp_descr_get = nop_descr_get,
};

typedef struct {
    MethodDescriptorObject base;
    vectorcallfunc vectorcall;
} MethodDescriptor2Object;

static TyObject *
MethodDescriptor2_new(TyTypeObject* type, TyObject* args, TyObject *kw)
{
    MethodDescriptor2Object *op = PyObject_New(MethodDescriptor2Object, type);
    if (op == NULL) {
        return NULL;
    }
    op->base.vectorcall = NULL;
    op->vectorcall = MethodDescriptor_vectorcall;
    return (TyObject *)op;
}

static TyTypeObject MethodDescriptor2_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "MethodDescriptor2",
    sizeof(MethodDescriptor2Object),
    .tp_new = MethodDescriptor2_new,
    .tp_call = PyVectorcall_Call,
    .tp_vectorcall_offset = offsetof(MethodDescriptor2Object, vectorcall),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_VECTORCALL,
};


int
_PyTestCapi_Init_Vectorcall(TyObject *m) {
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    if (TyType_Ready(&MethodDescriptorBase_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, &MethodDescriptorBase_Type) < 0) {
        return -1;
    }

    MethodDescriptorDerived_Type.tp_base = &MethodDescriptorBase_Type;
    if (TyType_Ready(&MethodDescriptorDerived_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, &MethodDescriptorDerived_Type) < 0) {
        return -1;
    }

    MethodDescriptorNopGet_Type.tp_base = &MethodDescriptorBase_Type;
    if (TyType_Ready(&MethodDescriptorNopGet_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, &MethodDescriptorNopGet_Type) < 0) {
        return -1;
    }

    MethodDescriptor2_Type.tp_base = &MethodDescriptorBase_Type;
    if (TyType_Ready(&MethodDescriptor2_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, &MethodDescriptor2_Type) < 0) {
        return -1;
    }

    return 0;
}
