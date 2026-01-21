// TypeVar, TypeVarTuple, ParamSpec, and TypeAlias
#include "Python.h"
#include "pycore_interpframe.h"   // _PyInterpreterFrame
#include "pycore_object.h"        // _TyObject_GC_TRACK/UNTRACK, PyAnnotateFormat
#include "pycore_typevarobject.h"
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()
#include "pycore_unionobject.h"   // _Ty_union_type_or, _Ty_union_from_tuple
#include "structmember.h"

/*[clinic input]
class typevar "typevarobject *" "&_PyTypeVar_Type"
class paramspec "paramspecobject *" "&_PyParamSpec_Type"
class paramspecargs "paramspecattrobject *" "&_PyParamSpecArgs_Type"
class paramspeckwargs "paramspecattrobject *" "&_PyParamSpecKwargs_Type"
class typevartuple "typevartupleobject *" "&_PyTypeVarTuple_Type"
class typealias "typealiasobject *" "&_PyTypeAlias_Type"
class Generic "TyObject *" "&PyGeneric_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=aa86741931a0f55c]*/

typedef struct {
    PyObject_HEAD
    TyObject *name;
    TyObject *bound;
    TyObject *evaluate_bound;
    TyObject *constraints;
    TyObject *evaluate_constraints;
    TyObject *default_value;
    TyObject *evaluate_default;
    bool covariant;
    bool contravariant;
    bool infer_variance;
} typevarobject;

typedef struct {
    PyObject_HEAD
    TyObject *name;
    TyObject *default_value;
    TyObject *evaluate_default;
} typevartupleobject;

typedef struct {
    PyObject_HEAD
    TyObject *name;
    TyObject *bound;
    TyObject *default_value;
    TyObject *evaluate_default;
    bool covariant;
    bool contravariant;
    bool infer_variance;
} paramspecobject;

typedef struct {
    PyObject_HEAD
    TyObject *name;
    TyObject *type_params;
    TyObject *compute_value;
    TyObject *value;
    TyObject *module;
} typealiasobject;

#define typevarobject_CAST(op)      ((typevarobject *)(op))
#define typevartupleobject_CAST(op) ((typevartupleobject *)(op))
#define paramspecobject_CAST(op)    ((paramspecobject *)(op))
#define typealiasobject_CAST(op)    ((typealiasobject *)(op))

#include "clinic/typevarobject.c.h"

/* NoDefault is a marker object to indicate that a parameter has no default. */

static TyObject *
NoDefault_repr(TyObject *op)
{
    return TyUnicode_FromString("typing.NoDefault");
}

static TyObject *
NoDefault_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("NoDefault");
}

static TyMethodDef nodefault_methods[] = {
    {"__reduce__", NoDefault_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static TyObject *
nodefault_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || (kwargs && TyDict_GET_SIZE(kwargs))) {
        TyErr_SetString(TyExc_TypeError, "NoDefaultType takes no arguments");
        return NULL;
    }
    return &_Ty_NoDefaultStruct;
}

static void
nodefault_dealloc(TyObject *nodefault)
{
    /* This should never get called, but we also don't want to SEGV if
     * we accidentally decref NoDefault out of existence. Instead,
     * since NoDefault is an immortal object, re-set the reference count.
     */
    _Ty_SetImmortal(nodefault);
}

TyDoc_STRVAR(nodefault_doc,
"NoDefaultType()\n"
"--\n\n"
"The type of the NoDefault singleton.");

TyTypeObject _PyNoDefault_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "NoDefaultType",
    .tp_dealloc = nodefault_dealloc,
    .tp_repr = NoDefault_repr,
    .tp_flags = Ty_TPFLAGS_DEFAULT,
    .tp_doc = nodefault_doc,
    .tp_methods = nodefault_methods,
    .tp_new = nodefault_new,
};

TyObject _Ty_NoDefaultStruct = _TyObject_HEAD_INIT(&_PyNoDefault_Type);

typedef struct {
    PyObject_HEAD
    TyObject *value;
} constevaluatorobject;

#define constevaluatorobject_CAST(op)   ((constevaluatorobject *)(op))

static void
constevaluator_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    constevaluatorobject *ce = constevaluatorobject_CAST(self);

    _TyObject_GC_UNTRACK(self);

    Ty_XDECREF(ce->value);

    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static int
constevaluator_traverse(TyObject *self, visitproc visit, void *arg)
{
    constevaluatorobject *ce = constevaluatorobject_CAST(self);
    Ty_VISIT(ce->value);
    return 0;
}

static int
constevaluator_clear(TyObject *self)
{
    constevaluatorobject *ce = constevaluatorobject_CAST(self);
    Ty_CLEAR(ce->value);
    return 0;
}

static TyObject *
constevaluator_repr(TyObject *self)
{
    constevaluatorobject *ce = constevaluatorobject_CAST(self);
    return TyUnicode_FromFormat("<constevaluator %R>", ce->value);
}

static TyObject *
constevaluator_call(TyObject *self, TyObject *args, TyObject *kwargs)
{
    constevaluatorobject *ce = constevaluatorobject_CAST(self);
    if (!_TyArg_NoKeywords("constevaluator.__call__", kwargs)) {
        return NULL;
    }
    int format;
    if (!TyArg_ParseTuple(args, "i:constevaluator.__call__", &format)) {
        return NULL;
    }
    TyObject *value = ce->value;
    if (format == _Ty_ANNOTATE_FORMAT_STRING) {
        PyUnicodeWriter *writer = PyUnicodeWriter_Create(5);  // cannot be <5
        if (writer == NULL) {
            return NULL;
        }
        if (TyTuple_Check(value)) {
            if (PyUnicodeWriter_WriteChar(writer, '(') < 0) {
                PyUnicodeWriter_Discard(writer);
                return NULL;
            }
            for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(value); i++) {
                TyObject *item = TyTuple_GET_ITEM(value, i);
                if (i > 0) {
                    if (PyUnicodeWriter_WriteASCII(writer, ", ", 2) < 0) {
                        PyUnicodeWriter_Discard(writer);
                        return NULL;
                    }
                }
                if (_Ty_typing_type_repr(writer, item) < 0) {
                    PyUnicodeWriter_Discard(writer);
                    return NULL;
                }
            }
            if (PyUnicodeWriter_WriteChar(writer, ')') < 0) {
                PyUnicodeWriter_Discard(writer);
                return NULL;
            }
        }
        else {
            if (_Ty_typing_type_repr(writer, value) < 0) {
                PyUnicodeWriter_Discard(writer);
                return NULL;
            }
        }
        return PyUnicodeWriter_Finish(writer);
    }
    return Ty_NewRef(value);
}

static TyObject *
constevaluator_alloc(TyObject *value)
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.constevaluator_type;
    assert(tp != NULL);
    constevaluatorobject *ce = PyObject_GC_New(constevaluatorobject, tp);
    if (ce == NULL) {
        return NULL;
    }
    ce->value = Ty_NewRef(value);
    _TyObject_GC_TRACK(ce);
    return (TyObject *)ce;

}

TyDoc_STRVAR(constevaluator_doc,
"_ConstEvaluator()\n"
"--\n\n"
"Internal type for implementing evaluation functions.");

static TyType_Slot constevaluator_slots[] = {
    {Ty_tp_doc, (void *)constevaluator_doc},
    {Ty_tp_dealloc, constevaluator_dealloc},
    {Ty_tp_traverse, constevaluator_traverse},
    {Ty_tp_clear, constevaluator_clear},
    {Ty_tp_repr, constevaluator_repr},
    {Ty_tp_call, constevaluator_call},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {0, NULL},
};

TyType_Spec constevaluator_spec = {
    .name = "_typing._ConstEvaluator",
    .basicsize = sizeof(constevaluatorobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE
        | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    .slots = constevaluator_slots,
};

int
_Ty_typing_type_repr(PyUnicodeWriter *writer, TyObject *p)
{
    TyObject *qualname = NULL;
    TyObject *module = NULL;
    TyObject *r = NULL;
    int rc;

    if (p == Ty_Ellipsis) {
        // The Ellipsis object
        r = TyUnicode_FromString("...");
        goto exit;
    }

    if (p == (TyObject *)&_PyNone_Type) {
        return PyUnicodeWriter_WriteASCII(writer, "None", 4);
    }

    if ((rc = PyObject_HasAttrWithError(p, &_Ty_ID(__origin__))) > 0 &&
        (rc = PyObject_HasAttrWithError(p, &_Ty_ID(__args__))) > 0)
    {
        // It looks like a GenericAlias
        goto use_repr;
    }
    if (rc < 0) {
        goto exit;
    }

    if (PyObject_GetOptionalAttr(p, &_Ty_ID(__qualname__), &qualname) < 0) {
        goto exit;
    }
    if (qualname == NULL) {
        goto use_repr;
    }
    if (PyObject_GetOptionalAttr(p, &_Ty_ID(__module__), &module) < 0) {
        goto exit;
    }
    if (module == NULL || module == Ty_None) {
        goto use_repr;
    }

    // Looks like a class
    if (TyUnicode_Check(module) &&
        _TyUnicode_EqualToASCIIString(module, "builtins"))
    {
        // builtins don't need a module name
        r = PyObject_Str(qualname);
        goto exit;
    }
    else {
        r = TyUnicode_FromFormat("%S.%S", module, qualname);
        goto exit;
    }

use_repr:
    r = PyObject_Repr(p);
exit:
    Ty_XDECREF(qualname);
    Ty_XDECREF(module);
    if (r == NULL) {
        return -1;
    }
    rc = PyUnicodeWriter_WriteStr(writer, r);
    Ty_DECREF(r);
    return rc;
}


static TyObject *
call_typing_func_object(const char *name, TyObject **args, size_t nargs)
{
    TyObject *typing = TyImport_ImportModule("typing");
    if (typing == NULL) {
        return NULL;
    }
    TyObject *func = PyObject_GetAttrString(typing, name);
    if (func == NULL) {
        Ty_DECREF(typing);
        return NULL;
    }
    TyObject *result = PyObject_Vectorcall(func, args, nargs, NULL);
    Ty_DECREF(func);
    Ty_DECREF(typing);
    return result;
}

static TyObject *
type_check(TyObject *arg, const char *msg)
{
    // Calling typing.py here leads to bootstrapping problems
    if (Ty_IsNone(arg)) {
        return Ty_NewRef(Ty_TYPE(arg));
    }
    TyObject *message_str = TyUnicode_FromString(msg);
    if (message_str == NULL) {
        return NULL;
    }
    TyObject *args[2] = {arg, message_str};
    TyObject *result = call_typing_func_object("_type_check", args, 2);
    Ty_DECREF(message_str);
    return result;
}

/*
 * Return a typing.Union. This is used as the nb_or (|) operator for
 * TypeVar and ParamSpec. We use this rather than _Ty_union_type_or
 * (which would produce a types.Union) because historically TypeVar
 * supported unions with string forward references, and we want to
 * preserve that behavior. _Ty_union_type_or only allows a small set
 * of types.
 */
static TyObject *
make_union(TyObject *self, TyObject *other)
{
    TyObject *args = TyTuple_Pack(2, self, other);
    if (args == NULL) {
        return NULL;
    }
    TyObject *u = _Ty_union_from_tuple(args);
    Ty_DECREF(args);
    return u;
}

static TyObject *
caller(void)
{
    _PyInterpreterFrame *f = _TyThreadState_GET()->current_frame;
    if (f == NULL) {
        Py_RETURN_NONE;
    }
    if (f == NULL || PyStackRef_IsNull(f->f_funcobj)) {
        Py_RETURN_NONE;
    }
    TyObject *r = TyFunction_GetModule(PyStackRef_AsPyObjectBorrow(f->f_funcobj));
    if (!r) {
        TyErr_Clear();
        Py_RETURN_NONE;
    }
    return Ty_NewRef(r);
}

static TyObject *
unpack(TyObject *self)
{
    TyObject *typing = TyImport_ImportModule("typing");
    if (typing == NULL) {
        return NULL;
    }
    TyObject *unpack = PyObject_GetAttrString(typing, "Unpack");
    if (unpack == NULL) {
        Ty_DECREF(typing);
        return NULL;
    }
    TyObject *unpacked = PyObject_GetItem(unpack, self);
    Ty_DECREF(typing);
    Ty_DECREF(unpack);
    return unpacked;
}

static int
contains_typevartuple(PyTupleObject *params)
{
    Ty_ssize_t n = TyTuple_GET_SIZE(params);
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.typevartuple_type;
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *param = TyTuple_GET_ITEM(params, i);
        if (Ty_IS_TYPE(param, tp)) {
            return 1;
        }
    }
    return 0;
}

static TyObject *
unpack_typevartuples(TyObject *params)
{
    assert(TyTuple_Check(params));
    // TypeVarTuple must be unpacked when passed to Generic, so we do that here.
    if (contains_typevartuple((PyTupleObject *)params)) {
        Ty_ssize_t n = TyTuple_GET_SIZE(params);
        TyObject *new_params = TyTuple_New(n);
        if (new_params == NULL) {
            return NULL;
        }
        TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.typevartuple_type;
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyObject *param = TyTuple_GET_ITEM(params, i);
            if (Ty_IS_TYPE(param, tp)) {
                TyObject *unpacked = unpack(param);
                if (unpacked == NULL) {
                    Ty_DECREF(new_params);
                    return NULL;
                }
                TyTuple_SET_ITEM(new_params, i, unpacked);
            }
            else {
                TyTuple_SET_ITEM(new_params, i, Ty_NewRef(param));
            }
        }
        return new_params;
    }
    else {
        return Ty_NewRef(params);
    }
}

static void
typevar_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    typevarobject *tv = typevarobject_CAST(self);

    _TyObject_GC_UNTRACK(self);

    Ty_DECREF(tv->name);
    Ty_XDECREF(tv->bound);
    Ty_XDECREF(tv->evaluate_bound);
    Ty_XDECREF(tv->constraints);
    Ty_XDECREF(tv->evaluate_constraints);
    Ty_XDECREF(tv->default_value);
    Ty_XDECREF(tv->evaluate_default);
    PyObject_ClearManagedDict(self);
    PyObject_ClearWeakRefs(self);

    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static int
typevar_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    typevarobject *tv = typevarobject_CAST(self);
    Ty_VISIT(tv->bound);
    Ty_VISIT(tv->evaluate_bound);
    Ty_VISIT(tv->constraints);
    Ty_VISIT(tv->evaluate_constraints);
    Ty_VISIT(tv->default_value);
    Ty_VISIT(tv->evaluate_default);
    PyObject_VisitManagedDict(self, visit, arg);
    return 0;
}

static int
typevar_clear(TyObject *op)
{
    typevarobject *self = typevarobject_CAST(op);
    Ty_CLEAR(self->bound);
    Ty_CLEAR(self->evaluate_bound);
    Ty_CLEAR(self->constraints);
    Ty_CLEAR(self->evaluate_constraints);
    Ty_CLEAR(self->default_value);
    Ty_CLEAR(self->evaluate_default);
    PyObject_ClearManagedDict(op);
    return 0;
}

static TyObject *
typevar_repr(TyObject *self)
{
    typevarobject *tv = typevarobject_CAST(self);

    if (tv->infer_variance) {
        return Ty_NewRef(tv->name);
    }

    char variance = tv->covariant ? '+' : tv->contravariant ? '-' : '~';
    return TyUnicode_FromFormat("%c%U", variance, tv->name);
}

static TyMemberDef typevar_members[] = {
    {"__name__", _Ty_T_OBJECT, offsetof(typevarobject, name), Py_READONLY},
    {"__covariant__", Ty_T_BOOL, offsetof(typevarobject, covariant), Py_READONLY},
    {"__contravariant__", Ty_T_BOOL, offsetof(typevarobject, contravariant), Py_READONLY},
    {"__infer_variance__", Ty_T_BOOL, offsetof(typevarobject, infer_variance), Py_READONLY},
    {0}
};

static TyObject *
typevar_bound(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->bound != NULL) {
        return Ty_NewRef(self->bound);
    }
    if (self->evaluate_bound == NULL) {
        Py_RETURN_NONE;
    }
    TyObject *bound = PyObject_CallNoArgs(self->evaluate_bound);
    self->bound = Ty_XNewRef(bound);
    return bound;
}

static TyObject *
typevar_default(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->default_value != NULL) {
        return Ty_NewRef(self->default_value);
    }
    if (self->evaluate_default == NULL) {
        return &_Ty_NoDefaultStruct;
    }
    TyObject *default_value = PyObject_CallNoArgs(self->evaluate_default);
    self->default_value = Ty_XNewRef(default_value);
    return default_value;
}

static TyObject *
typevar_constraints(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->constraints != NULL) {
        return Ty_NewRef(self->constraints);
    }
    if (self->evaluate_constraints == NULL) {
        return TyTuple_New(0);
    }
    TyObject *constraints = PyObject_CallNoArgs(self->evaluate_constraints);
    self->constraints = Ty_XNewRef(constraints);
    return constraints;
}

static TyObject *
typevar_evaluate_bound(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->evaluate_bound != NULL) {
        return Ty_NewRef(self->evaluate_bound);
    }
    if (self->bound != NULL) {
        return constevaluator_alloc(self->bound);
    }
    Py_RETURN_NONE;
}

static TyObject *
typevar_evaluate_constraints(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->evaluate_constraints != NULL) {
        return Ty_NewRef(self->evaluate_constraints);
    }
    if (self->constraints != NULL) {
        return constevaluator_alloc(self->constraints);
    }
    Py_RETURN_NONE;
}

static TyObject *
typevar_evaluate_default(TyObject *op, void *Py_UNUSED(closure))
{
    typevarobject *self = typevarobject_CAST(op);
    if (self->evaluate_default != NULL) {
        return Ty_NewRef(self->evaluate_default);
    }
    if (self->default_value != NULL) {
        return constevaluator_alloc(self->default_value);
    }
    Py_RETURN_NONE;
}

static TyGetSetDef typevar_getset[] = {
    {"__bound__", typevar_bound, NULL, NULL, NULL},
    {"__constraints__", typevar_constraints, NULL, NULL, NULL},
    {"__default__", typevar_default, NULL, NULL, NULL},
    {"evaluate_bound", typevar_evaluate_bound, NULL, NULL, NULL},
    {"evaluate_constraints", typevar_evaluate_constraints, NULL, NULL, NULL},
    {"evaluate_default", typevar_evaluate_default, NULL, NULL, NULL},
    {0}
};

static typevarobject *
typevar_alloc(TyObject *name, TyObject *bound, TyObject *evaluate_bound,
              TyObject *constraints, TyObject *evaluate_constraints,
              TyObject *default_value,
              bool covariant, bool contravariant, bool infer_variance,
              TyObject *module)
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.typevar_type;
    assert(tp != NULL);
    typevarobject *tv = PyObject_GC_New(typevarobject, tp);
    if (tv == NULL) {
        return NULL;
    }

    tv->name = Ty_NewRef(name);

    tv->bound = Ty_XNewRef(bound);
    tv->evaluate_bound = Ty_XNewRef(evaluate_bound);
    tv->constraints = Ty_XNewRef(constraints);
    tv->evaluate_constraints = Ty_XNewRef(evaluate_constraints);
    tv->default_value = Ty_XNewRef(default_value);
    tv->evaluate_default = NULL;

    tv->covariant = covariant;
    tv->contravariant = contravariant;
    tv->infer_variance = infer_variance;
    _TyObject_GC_TRACK(tv);

    if (module != NULL) {
        if (PyObject_SetAttrString((TyObject *)tv, "__module__", module) < 0) {
            Ty_DECREF(tv);
            return NULL;
        }
    }

    return tv;
}

/*[clinic input]
@classmethod
typevar.__new__ as typevar_new

    name: object(subclass_of="&TyUnicode_Type")
    *constraints: tuple
    bound: object = None
    default as default_value: object(c_default="&_Ty_NoDefaultStruct") = typing.NoDefault
    covariant: bool = False
    contravariant: bool = False
    infer_variance: bool = False

Create a TypeVar.
[clinic start generated code]*/

static TyObject *
typevar_new_impl(TyTypeObject *type, TyObject *name, TyObject *constraints,
                 TyObject *bound, TyObject *default_value, int covariant,
                 int contravariant, int infer_variance)
/*[clinic end generated code: output=d2b248ff074eaab6 input=1b5b62e40c92c167]*/
{
    if (covariant && contravariant) {
        TyErr_SetString(TyExc_ValueError,
                        "Bivariant types are not supported.");
        return NULL;
    }

    if (infer_variance && (covariant || contravariant)) {
        TyErr_SetString(TyExc_ValueError,
                        "Variance cannot be specified with infer_variance.");
        return NULL;
    }

    if (Ty_IsNone(bound)) {
        bound = NULL;
    }
    if (bound != NULL) {
        bound = type_check(bound, "Bound must be a type.");
        if (bound == NULL) {
            return NULL;
        }
    }

    assert(TyTuple_CheckExact(constraints));
    Ty_ssize_t n_constraints = TyTuple_GET_SIZE(constraints);
    if (n_constraints == 1) {
        TyErr_SetString(TyExc_TypeError,
                        "A single constraint is not allowed");
        Ty_XDECREF(bound);
        return NULL;
    } else if (n_constraints == 0) {
        constraints = NULL;
    } else if (bound != NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "Constraints cannot be combined with bound=...");
        Ty_XDECREF(bound);
        return NULL;
    }
    TyObject *module = caller();
    if (module == NULL) {
        Ty_XDECREF(bound);
        return NULL;
    }

    TyObject *tv = (TyObject *)typevar_alloc(name, bound, NULL,
                                             constraints, NULL,
                                             default_value,
                                             covariant, contravariant,
                                             infer_variance, module);
    Ty_XDECREF(bound);
    Ty_XDECREF(module);
    return tv;
}

/*[clinic input]
typevar.__typing_subst__ as typevar_typing_subst

    arg: object
    /

[clinic start generated code]*/

static TyObject *
typevar_typing_subst_impl(typevarobject *self, TyObject *arg)
/*[clinic end generated code: output=c76ced134ed8f4e1 input=9e87b57f0fc59b92]*/
{
    TyObject *args[2] = {(TyObject *)self, arg};
    TyObject *result = call_typing_func_object("_typevar_subst", args, 2);
    return result;
}

/*[clinic input]
typevar.__typing_prepare_subst__ as typevar_typing_prepare_subst

    alias: object
    args: object
    /

[clinic start generated code]*/

static TyObject *
typevar_typing_prepare_subst_impl(typevarobject *self, TyObject *alias,
                                  TyObject *args)
/*[clinic end generated code: output=82c3f4691e0ded22 input=201a750415d14ffb]*/
{
    TyObject *params = PyObject_GetAttrString(alias, "__parameters__");
    if (params == NULL) {
        return NULL;
    }
    Ty_ssize_t i = PySequence_Index(params, (TyObject *)self);
    if (i == -1) {
        Ty_DECREF(params);
        return NULL;
    }
    Ty_ssize_t args_len = PySequence_Length(args);
    if (args_len == -1) {
        Ty_DECREF(params);
        return NULL;
    }
    if (i < args_len) {
        // We already have a value for our TypeVar
        Ty_DECREF(params);
        return Ty_NewRef(args);
    }
    else if (i == args_len) {
        // If the TypeVar has a default, use it.
        TyObject *dflt = typevar_default((TyObject *)self, NULL);
        if (dflt == NULL) {
            Ty_DECREF(params);
            return NULL;
        }
        if (dflt != &_Ty_NoDefaultStruct) {
            TyObject *new_args = TyTuple_Pack(1, dflt);
            Ty_DECREF(dflt);
            if (new_args == NULL) {
                Ty_DECREF(params);
                return NULL;
            }
            TyObject *result = PySequence_Concat(args, new_args);
            Ty_DECREF(params);
            Ty_DECREF(new_args);
            return result;
        }
    }
    Ty_DECREF(params);
    TyErr_Format(TyExc_TypeError,
                 "Too few arguments for %S; actual %d, expected at least %d",
                 alias, args_len, i + 1);
    return NULL;
}

/*[clinic input]
typevar.__reduce__ as typevar_reduce

[clinic start generated code]*/

static TyObject *
typevar_reduce_impl(typevarobject *self)
/*[clinic end generated code: output=02e5c55d7cf8a08f input=de76bc95f04fb9ff]*/
{
    return Ty_NewRef(self->name);
}


/*[clinic input]
typevar.has_default as typevar_has_default

[clinic start generated code]*/

static TyObject *
typevar_has_default_impl(typevarobject *self)
/*[clinic end generated code: output=76bf0b8dc98b97dd input=31024aa030761cf6]*/
{
    if (self->evaluate_default != NULL ||
        (self->default_value != &_Ty_NoDefaultStruct && self->default_value != NULL)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
typevar_mro_entries(TyObject *self, TyObject *args)
{
    TyErr_SetString(TyExc_TypeError,
                    "Cannot subclass an instance of TypeVar");
    return NULL;
}

static TyMethodDef typevar_methods[] = {
    TYPEVAR_TYPING_SUBST_METHODDEF
    TYPEVAR_TYPING_PREPARE_SUBST_METHODDEF
    TYPEVAR_REDUCE_METHODDEF
    TYPEVAR_HAS_DEFAULT_METHODDEF
    {"__mro_entries__", typevar_mro_entries, METH_O},
    {0}
};

TyDoc_STRVAR(typevar_doc,
"Type variable.\n\
\n\
The preferred way to construct a type variable is via the dedicated\n\
syntax for generic functions, classes, and type aliases::\n\
\n\
    class Sequence[T]:  # T is a TypeVar\n\
        ...\n\
\n\
This syntax can also be used to create bound and constrained type\n\
variables::\n\
\n\
    # S is a TypeVar bound to str\n\
    class StrSequence[S: str]:\n\
        ...\n\
\n\
    # A is a TypeVar constrained to str or bytes\n\
    class StrOrBytesSequence[A: (str, bytes)]:\n\
        ...\n\
\n\
Type variables can also have defaults:\n\
\n\
    class IntDefault[T = int]:\n\
        ...\n\
\n\
However, if desired, reusable type variables can also be constructed\n\
manually, like so::\n\
\n\
   T = TypeVar('T')  # Can be anything\n\
   S = TypeVar('S', bound=str)  # Can be any subtype of str\n\
   A = TypeVar('A', str, bytes)  # Must be exactly str or bytes\n\
   D = TypeVar('D', default=int)  # Defaults to int\n\
\n\
Type variables exist primarily for the benefit of static type\n\
checkers.  They serve as the parameters for generic types as well\n\
as for generic function and type alias definitions.\n\
\n\
The variance of type variables is inferred by type checkers when they\n\
are created through the type parameter syntax and when\n\
``infer_variance=True`` is passed. Manually created type variables may\n\
be explicitly marked covariant or contravariant by passing\n\
``covariant=True`` or ``contravariant=True``. By default, manually\n\
created type variables are invariant. See PEP 484 and PEP 695 for more\n\
details.\n\
");

static TyType_Slot typevar_slots[] = {
    {Ty_tp_doc, (void *)typevar_doc},
    {Ty_tp_methods, typevar_methods},
    {Ty_nb_or, make_union},
    {Ty_tp_new, typevar_new},
    {Ty_tp_dealloc, typevar_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, typevar_traverse},
    {Ty_tp_clear, typevar_clear},
    {Ty_tp_repr, typevar_repr},
    {Ty_tp_members, typevar_members},
    {Ty_tp_getset, typevar_getset},
    {0, NULL},
};

TyType_Spec typevar_spec = {
    .name = "typing.TypeVar",
    .basicsize = sizeof(typevarobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE
        | Ty_TPFLAGS_MANAGED_DICT | Ty_TPFLAGS_MANAGED_WEAKREF,
    .slots = typevar_slots,
};

typedef struct {
    PyObject_HEAD
    TyObject *__origin__;
} paramspecattrobject;

#define paramspecattrobject_CAST(op)    ((paramspecattrobject *)(op))

static void
paramspecattr_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    paramspecattrobject *psa = paramspecattrobject_CAST(self);

    _TyObject_GC_UNTRACK(self);

    Ty_XDECREF(psa->__origin__);

    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static int
paramspecattr_traverse(TyObject *self, visitproc visit, void *arg)
{
    paramspecattrobject *psa = paramspecattrobject_CAST(self);
    Ty_VISIT(psa->__origin__);
    return 0;
}

static int
paramspecattr_clear(TyObject *op)
{
    paramspecattrobject *self = paramspecattrobject_CAST(op);
    Ty_CLEAR(self->__origin__);
    return 0;
}

static TyObject *
paramspecattr_richcompare(TyObject *a, TyObject *b, int op)
{
    if (!Ty_IS_TYPE(a, Ty_TYPE(b))) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    if (op != Py_EQ && op != Py_NE) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    paramspecattrobject *lhs = paramspecattrobject_CAST(a); // may be unsafe
    paramspecattrobject *rhs = (paramspecattrobject *)b;    // safe fast cast
    return PyObject_RichCompare(lhs->__origin__, rhs->__origin__, op);
}

static TyMemberDef paramspecattr_members[] = {
    {"__origin__", _Ty_T_OBJECT, offsetof(paramspecattrobject, __origin__), Py_READONLY},
    {0}
};

static paramspecattrobject *
paramspecattr_new(TyTypeObject *tp, TyObject *origin)
{
    paramspecattrobject *psa = PyObject_GC_New(paramspecattrobject, tp);
    if (psa == NULL) {
        return NULL;
    }
    psa->__origin__ = Ty_NewRef(origin);
    _TyObject_GC_TRACK(psa);
    return psa;
}

static TyObject *
paramspecargs_repr(TyObject *self)
{
    paramspecattrobject *psa = paramspecattrobject_CAST(self);
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.paramspec_type;
    if (Ty_IS_TYPE(psa->__origin__, tp)) {
        return TyUnicode_FromFormat("%U.args",
            ((paramspecobject *)psa->__origin__)->name);
    }
    return TyUnicode_FromFormat("%R.args", psa->__origin__);
}


/*[clinic input]
@classmethod
paramspecargs.__new__ as paramspecargs_new

    origin: object

Create a ParamSpecArgs object.
[clinic start generated code]*/

static TyObject *
paramspecargs_new_impl(TyTypeObject *type, TyObject *origin)
/*[clinic end generated code: output=9a1463dc8942fe4e input=3596a0bb6183c208]*/
{
    return (TyObject *)paramspecattr_new(type, origin);
}

static TyObject *
paramspecargs_mro_entries(TyObject *self, TyObject *args)
{
    TyErr_SetString(TyExc_TypeError,
                    "Cannot subclass an instance of ParamSpecArgs");
    return NULL;
}

static TyMethodDef paramspecargs_methods[] = {
    {"__mro_entries__", paramspecargs_mro_entries, METH_O},
    {0}
};

TyDoc_STRVAR(paramspecargs_doc,
"The args for a ParamSpec object.\n\
\n\
Given a ParamSpec object P, P.args is an instance of ParamSpecArgs.\n\
\n\
ParamSpecArgs objects have a reference back to their ParamSpec::\n\
\n\
    >>> P = ParamSpec(\"P\")\n\
    >>> P.args.__origin__ is P\n\
    True\n\
\n\
This type is meant for runtime introspection and has no special meaning\n\
to static type checkers.\n\
");

static TyType_Slot paramspecargs_slots[] = {
    {Ty_tp_doc, (void *)paramspecargs_doc},
    {Ty_tp_methods, paramspecargs_methods},
    {Ty_tp_new, paramspecargs_new},
    {Ty_tp_dealloc, paramspecattr_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, paramspecattr_traverse},
    {Ty_tp_clear, paramspecattr_clear},
    {Ty_tp_repr, paramspecargs_repr},
    {Ty_tp_members, paramspecattr_members},
    {Ty_tp_richcompare, paramspecattr_richcompare},
    {0, NULL},
};

TyType_Spec paramspecargs_spec = {
    .name = "typing.ParamSpecArgs",
    .basicsize = sizeof(paramspecattrobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE
        | Ty_TPFLAGS_MANAGED_WEAKREF,
    .slots = paramspecargs_slots,
};

static TyObject *
paramspeckwargs_repr(TyObject *self)
{
    paramspecattrobject *psk = paramspecattrobject_CAST(self);

    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.paramspec_type;
    if (Ty_IS_TYPE(psk->__origin__, tp)) {
        return TyUnicode_FromFormat("%U.kwargs",
            ((paramspecobject *)psk->__origin__)->name);
    }
    return TyUnicode_FromFormat("%R.kwargs", psk->__origin__);
}

/*[clinic input]
@classmethod
paramspeckwargs.__new__ as paramspeckwargs_new

    origin: object

Create a ParamSpecKwargs object.
[clinic start generated code]*/

static TyObject *
paramspeckwargs_new_impl(TyTypeObject *type, TyObject *origin)
/*[clinic end generated code: output=277b11967ebaf4ab input=981bca9b0cf9e40a]*/
{
    return (TyObject *)paramspecattr_new(type, origin);
}

static TyObject *
paramspeckwargs_mro_entries(TyObject *self, TyObject *args)
{
    TyErr_SetString(TyExc_TypeError,
                    "Cannot subclass an instance of ParamSpecKwargs");
    return NULL;
}

static TyMethodDef paramspeckwargs_methods[] = {
    {"__mro_entries__", paramspeckwargs_mro_entries, METH_O},
    {0}
};

TyDoc_STRVAR(paramspeckwargs_doc,
"The kwargs for a ParamSpec object.\n\
\n\
Given a ParamSpec object P, P.kwargs is an instance of ParamSpecKwargs.\n\
\n\
ParamSpecKwargs objects have a reference back to their ParamSpec::\n\
\n\
    >>> P = ParamSpec(\"P\")\n\
    >>> P.kwargs.__origin__ is P\n\
    True\n\
\n\
This type is meant for runtime introspection and has no special meaning\n\
to static type checkers.\n\
");

static TyType_Slot paramspeckwargs_slots[] = {
    {Ty_tp_doc, (void *)paramspeckwargs_doc},
    {Ty_tp_methods, paramspeckwargs_methods},
    {Ty_tp_new, paramspeckwargs_new},
    {Ty_tp_dealloc, paramspecattr_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, paramspecattr_traverse},
    {Ty_tp_clear, paramspecattr_clear},
    {Ty_tp_repr, paramspeckwargs_repr},
    {Ty_tp_members, paramspecattr_members},
    {Ty_tp_richcompare, paramspecattr_richcompare},
    {0, NULL},
};

TyType_Spec paramspeckwargs_spec = {
    .name = "typing.ParamSpecKwargs",
    .basicsize = sizeof(paramspecattrobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE
        | Ty_TPFLAGS_MANAGED_WEAKREF,
    .slots = paramspeckwargs_slots,
};

static void
paramspec_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    paramspecobject *ps = paramspecobject_CAST(self);

    _TyObject_GC_UNTRACK(self);

    Ty_DECREF(ps->name);
    Ty_XDECREF(ps->bound);
    Ty_XDECREF(ps->default_value);
    Ty_XDECREF(ps->evaluate_default);
    PyObject_ClearManagedDict(self);
    PyObject_ClearWeakRefs(self);

    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static int
paramspec_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    paramspecobject *ps = paramspecobject_CAST(self);
    Ty_VISIT(ps->bound);
    Ty_VISIT(ps->default_value);
    Ty_VISIT(ps->evaluate_default);
    PyObject_VisitManagedDict(self, visit, arg);
    return 0;
}

static int
paramspec_clear(TyObject *op)
{
    paramspecobject *self = paramspecobject_CAST(op);
    Ty_CLEAR(self->bound);
    Ty_CLEAR(self->default_value);
    Ty_CLEAR(self->evaluate_default);
    PyObject_ClearManagedDict(op);
    return 0;
}

static TyObject *
paramspec_repr(TyObject *self)
{
    paramspecobject *ps = paramspecobject_CAST(self);

    if (ps->infer_variance) {
        return Ty_NewRef(ps->name);
    }

    char variance = ps->covariant ? '+' : ps->contravariant ? '-' : '~';
    return TyUnicode_FromFormat("%c%U", variance, ps->name);
}

static TyMemberDef paramspec_members[] = {
    {"__name__", _Ty_T_OBJECT, offsetof(paramspecobject, name), Py_READONLY},
    {"__bound__", _Ty_T_OBJECT, offsetof(paramspecobject, bound), Py_READONLY},
    {"__covariant__", Ty_T_BOOL, offsetof(paramspecobject, covariant), Py_READONLY},
    {"__contravariant__", Ty_T_BOOL, offsetof(paramspecobject, contravariant), Py_READONLY},
    {"__infer_variance__", Ty_T_BOOL, offsetof(paramspecobject, infer_variance), Py_READONLY},
    {0}
};

static TyObject *
paramspec_args(TyObject *self, void *Py_UNUSED(closure))
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.paramspecargs_type;
    return (TyObject *)paramspecattr_new(tp, self);
}

static TyObject *
paramspec_kwargs(TyObject *self, void *Py_UNUSED(closure))
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.paramspeckwargs_type;
    return (TyObject *)paramspecattr_new(tp, self);
}

static TyObject *
paramspec_default(TyObject *op, void *Py_UNUSED(closure))
{
    paramspecobject *self = paramspecobject_CAST(op);
    if (self->default_value != NULL) {
        return Ty_NewRef(self->default_value);
    }
    if (self->evaluate_default == NULL) {
        return &_Ty_NoDefaultStruct;
    }
    TyObject *default_value = PyObject_CallNoArgs(self->evaluate_default);
    self->default_value = Ty_XNewRef(default_value);
    return default_value;
}

static TyObject *
paramspec_evaluate_default(TyObject *op, void *Py_UNUSED(closure))
{
    paramspecobject *self = paramspecobject_CAST(op);
    if (self->evaluate_default != NULL) {
        return Ty_NewRef(self->evaluate_default);
    }
    if (self->default_value != NULL) {
        return constevaluator_alloc(self->default_value);
    }
    Py_RETURN_NONE;
}

static TyGetSetDef paramspec_getset[] = {
    {"args", paramspec_args, NULL, TyDoc_STR("Represents positional arguments."), NULL},
    {"kwargs", paramspec_kwargs, NULL, TyDoc_STR("Represents keyword arguments."), NULL},
    {"__default__", paramspec_default, NULL, "The default value for this ParamSpec.", NULL},
    {"evaluate_default", paramspec_evaluate_default, NULL, NULL, NULL},
    {0},
};

static paramspecobject *
paramspec_alloc(TyObject *name, TyObject *bound, TyObject *default_value, bool covariant,
                bool contravariant, bool infer_variance, TyObject *module)
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.paramspec_type;
    paramspecobject *ps = PyObject_GC_New(paramspecobject, tp);
    if (ps == NULL) {
        return NULL;
    }
    ps->name = Ty_NewRef(name);
    ps->bound = Ty_XNewRef(bound);
    ps->covariant = covariant;
    ps->contravariant = contravariant;
    ps->infer_variance = infer_variance;
    ps->default_value = Ty_XNewRef(default_value);
    ps->evaluate_default = NULL;
    _TyObject_GC_TRACK(ps);
    if (module != NULL) {
        if (PyObject_SetAttrString((TyObject *)ps, "__module__", module) < 0) {
            Ty_DECREF(ps);
            return NULL;
        }
    }
    return ps;
}

/*[clinic input]
@classmethod
paramspec.__new__ as paramspec_new

    name: object(subclass_of="&TyUnicode_Type")
    *
    bound: object = None
    default as default_value: object(c_default="&_Ty_NoDefaultStruct") = typing.NoDefault
    covariant: bool = False
    contravariant: bool = False
    infer_variance: bool = False

Create a ParamSpec object.
[clinic start generated code]*/

static TyObject *
paramspec_new_impl(TyTypeObject *type, TyObject *name, TyObject *bound,
                   TyObject *default_value, int covariant, int contravariant,
                   int infer_variance)
/*[clinic end generated code: output=47ca9d63fa5a094d input=495e1565bc067ab9]*/
{
    if (covariant && contravariant) {
        TyErr_SetString(TyExc_ValueError, "Bivariant types are not supported.");
        return NULL;
    }
    if (infer_variance && (covariant || contravariant)) {
        TyErr_SetString(TyExc_ValueError, "Variance cannot be specified with infer_variance.");
        return NULL;
    }
    if (bound != NULL) {
        bound = type_check(bound, "Bound must be a type.");
        if (bound == NULL) {
            return NULL;
        }
    }
    TyObject *module = caller();
    if (module == NULL) {
        Ty_XDECREF(bound);
        return NULL;
    }
    TyObject *ps = (TyObject *)paramspec_alloc(
        name, bound, default_value, covariant, contravariant, infer_variance, module);
    Ty_XDECREF(bound);
    Ty_DECREF(module);
    return ps;
}


/*[clinic input]
paramspec.__typing_subst__ as paramspec_typing_subst

    arg: object
    /

[clinic start generated code]*/

static TyObject *
paramspec_typing_subst_impl(paramspecobject *self, TyObject *arg)
/*[clinic end generated code: output=803e1ade3f13b57d input=2d5b5e3d4a717189]*/
{
    TyObject *args[2] = {(TyObject *)self, arg};
    TyObject *result = call_typing_func_object("_paramspec_subst", args, 2);
    return result;
}

/*[clinic input]
paramspec.__typing_prepare_subst__ as paramspec_typing_prepare_subst

    alias: object
    args: object
    /

[clinic start generated code]*/

static TyObject *
paramspec_typing_prepare_subst_impl(paramspecobject *self, TyObject *alias,
                                    TyObject *args)
/*[clinic end generated code: output=95449d630a2adb9a input=6df6f9fef3e150da]*/
{
    TyObject *args_array[3] = {(TyObject *)self, alias, args};
    TyObject *result = call_typing_func_object(
        "_paramspec_prepare_subst", args_array, 3);
    return result;
}

/*[clinic input]
paramspec.__reduce__ as paramspec_reduce

[clinic start generated code]*/

static TyObject *
paramspec_reduce_impl(paramspecobject *self)
/*[clinic end generated code: output=b83398674416db27 input=5bf349f0d5dd426c]*/
{
    return Ty_NewRef(self->name);
}

/*[clinic input]
paramspec.has_default as paramspec_has_default

[clinic start generated code]*/

static TyObject *
paramspec_has_default_impl(paramspecobject *self)
/*[clinic end generated code: output=daaae7467a6a4368 input=2112e97eeb76cd59]*/
{
    if (self->evaluate_default != NULL ||
        (self->default_value != &_Ty_NoDefaultStruct && self->default_value != NULL)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
paramspec_mro_entries(TyObject *self, TyObject *args)
{
    TyErr_SetString(TyExc_TypeError,
                    "Cannot subclass an instance of ParamSpec");
    return NULL;
}

static TyMethodDef paramspec_methods[] = {
    PARAMSPEC_TYPING_SUBST_METHODDEF
    PARAMSPEC_TYPING_PREPARE_SUBST_METHODDEF
    PARAMSPEC_HAS_DEFAULT_METHODDEF
    PARAMSPEC_REDUCE_METHODDEF
    {"__mro_entries__", paramspec_mro_entries, METH_O},
    {0}
};

TyDoc_STRVAR(paramspec_doc,
"Parameter specification variable.\n\
\n\
The preferred way to construct a parameter specification is via the\n\
dedicated syntax for generic functions, classes, and type aliases,\n\
where the use of '**' creates a parameter specification::\n\
\n\
    type IntFunc[**P] = Callable[P, int]\n\
\n\
The following syntax creates a parameter specification that defaults\n\
to a callable accepting two positional-only arguments of types int\n\
and str:\n\
\n\
    type IntFuncDefault[**P = (int, str)] = Callable[P, int]\n\
\n\
For compatibility with Python 3.11 and earlier, ParamSpec objects\n\
can also be created as follows::\n\
\n\
    P = ParamSpec('P')\n\
    DefaultP = ParamSpec('DefaultP', default=(int, str))\n\
\n\
Parameter specification variables exist primarily for the benefit of\n\
static type checkers.  They are used to forward the parameter types of\n\
one callable to another callable, a pattern commonly found in\n\
higher-order functions and decorators.  They are only valid when used\n\
in ``Concatenate``, or as the first argument to ``Callable``, or as\n\
parameters for user-defined Generics. See class Generic for more\n\
information on generic types.\n\
\n\
An example for annotating a decorator::\n\
\n\
    def add_logging[**P, T](f: Callable[P, T]) -> Callable[P, T]:\n\
        '''A type-safe decorator to add logging to a function.'''\n\
        def inner(*args: P.args, **kwargs: P.kwargs) -> T:\n\
            logging.info(f'{f.__name__} was called')\n\
            return f(*args, **kwargs)\n\
        return inner\n\
\n\
    @add_logging\n\
    def add_two(x: float, y: float) -> float:\n\
        '''Add two numbers together.'''\n\
        return x + y\n\
\n\
Parameter specification variables can be introspected. e.g.::\n\
\n\
    >>> P = ParamSpec(\"P\")\n\
    >>> P.__name__\n\
    'P'\n\
\n\
Note that only parameter specification variables defined in the global\n\
scope can be pickled.\n\
");

static TyType_Slot paramspec_slots[] = {
    {Ty_tp_doc, (void *)paramspec_doc},
    {Ty_tp_members, paramspec_members},
    {Ty_tp_methods, paramspec_methods},
    {Ty_tp_getset, paramspec_getset},
    // Unions of ParamSpecs have no defined meaning, but they were allowed
    // by the Python implementation, so we allow them here too.
    {Ty_nb_or, make_union},
    {Ty_tp_new, paramspec_new},
    {Ty_tp_dealloc, paramspec_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, paramspec_traverse},
    {Ty_tp_clear, paramspec_clear},
    {Ty_tp_repr, paramspec_repr},
    {0, 0},
};

TyType_Spec paramspec_spec = {
    .name = "typing.ParamSpec",
    .basicsize = sizeof(paramspecobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE
        | Ty_TPFLAGS_MANAGED_DICT | Ty_TPFLAGS_MANAGED_WEAKREF,
    .slots = paramspec_slots,
};

static void
typevartuple_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    typevartupleobject *tvt = typevartupleobject_CAST(self);

    Ty_DECREF(tvt->name);
    Ty_XDECREF(tvt->default_value);
    Ty_XDECREF(tvt->evaluate_default);
    PyObject_ClearManagedDict(self);
    PyObject_ClearWeakRefs(self);

    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
unpack_iter(TyObject *self)
{
    TyObject *unpacked = unpack(self);
    if (unpacked == NULL) {
        return NULL;
    }
    TyObject *tuple = TyTuple_Pack(1, unpacked);
    if (tuple == NULL) {
        Ty_DECREF(unpacked);
        return NULL;
    }
    TyObject *result = PyObject_GetIter(tuple);
    Ty_DECREF(unpacked);
    Ty_DECREF(tuple);
    return result;
}

static TyObject *
typevartuple_repr(TyObject *self)
{
    typevartupleobject *tvt = typevartupleobject_CAST(self);
    return Ty_NewRef(tvt->name);
}

static TyMemberDef typevartuple_members[] = {
    {"__name__", _Ty_T_OBJECT, offsetof(typevartupleobject, name), Py_READONLY},
    {0}
};

static typevartupleobject *
typevartuple_alloc(TyObject *name, TyObject *module, TyObject *default_value)
{
    TyTypeObject *tp = _TyInterpreterState_GET()->cached_objects.typevartuple_type;
    typevartupleobject *tvt = PyObject_GC_New(typevartupleobject, tp);
    if (tvt == NULL) {
        return NULL;
    }
    tvt->name = Ty_NewRef(name);
    tvt->default_value = Ty_XNewRef(default_value);
    tvt->evaluate_default = NULL;
    _TyObject_GC_TRACK(tvt);
    if (module != NULL) {
        if (PyObject_SetAttrString((TyObject *)tvt, "__module__", module) < 0) {
            Ty_DECREF(tvt);
            return NULL;
        }
    }
    return tvt;
}

/*[clinic input]
@classmethod
typevartuple.__new__

    name: object(subclass_of="&TyUnicode_Type")
    *
    default as default_value: object(c_default="&_Ty_NoDefaultStruct") = typing.NoDefault

Create a new TypeVarTuple with the given name.
[clinic start generated code]*/

static TyObject *
typevartuple_impl(TyTypeObject *type, TyObject *name,
                  TyObject *default_value)
/*[clinic end generated code: output=9d6b76dfe95aae51 input=e149739929a866d0]*/
{
    TyObject *module = caller();
    if (module == NULL) {
        return NULL;
    }
    TyObject *result = (TyObject *)typevartuple_alloc(name, module, default_value);
    Ty_DECREF(module);
    return result;
}

/*[clinic input]
typevartuple.__typing_subst__ as typevartuple_typing_subst

    arg: object
    /

[clinic start generated code]*/

static TyObject *
typevartuple_typing_subst_impl(typevartupleobject *self, TyObject *arg)
/*[clinic end generated code: output=814316519441cd76 input=3fcf2dfd9eee7945]*/
{
    TyErr_SetString(TyExc_TypeError, "Substitution of bare TypeVarTuple is not supported");
    return NULL;
}

/*[clinic input]
typevartuple.__typing_prepare_subst__ as typevartuple_typing_prepare_subst

    alias: object
    args: object
    /

[clinic start generated code]*/

static TyObject *
typevartuple_typing_prepare_subst_impl(typevartupleobject *self,
                                       TyObject *alias, TyObject *args)
/*[clinic end generated code: output=ff999bc5b02036c1 input=685b149b0fc47556]*/
{
    TyObject *args_array[3] = {(TyObject *)self, alias, args};
    TyObject *result = call_typing_func_object(
        "_typevartuple_prepare_subst", args_array, 3);
    return result;
}

/*[clinic input]
typevartuple.__reduce__ as typevartuple_reduce

[clinic start generated code]*/

static TyObject *
typevartuple_reduce_impl(typevartupleobject *self)
/*[clinic end generated code: output=3215bc0477913d20 input=3018a4d66147e807]*/
{
    return Ty_NewRef(self->name);
}


/*[clinic input]
typevartuple.has_default as typevartuple_has_default

[clinic start generated code]*/

static TyObject *
typevartuple_has_default_impl(typevartupleobject *self)
/*[clinic end generated code: output=4895f602f56a5e29 input=9ef3250ddb2c1851]*/
{
    if (self->evaluate_default != NULL ||
        (self->default_value != &_Ty_NoDefaultStruct && self->default_value != NULL)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
typevartuple_mro_entries(TyObject *self, TyObject *args)
{
    TyErr_SetString(TyExc_TypeError,
                    "Cannot subclass an instance of TypeVarTuple");
    return NULL;
}

static int
typevartuple_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    typevartupleobject *tvt = typevartupleobject_CAST(self);
    Ty_VISIT(tvt->default_value);
    Ty_VISIT(tvt->evaluate_default);
    PyObject_VisitManagedDict(self, visit, arg);
    return 0;
}

static int
typevartuple_clear(TyObject *self)
{
    typevartupleobject *tvt = typevartupleobject_CAST(self);
    Ty_CLEAR(tvt->default_value);
    Ty_CLEAR(tvt->evaluate_default);
    PyObject_ClearManagedDict(self);
    return 0;
}

static TyObject *
typevartuple_default(TyObject *op, void *Py_UNUSED(closure))
{
    typevartupleobject *self = typevartupleobject_CAST(op);
    if (self->default_value != NULL) {
        return Ty_NewRef(self->default_value);
    }
    if (self->evaluate_default == NULL) {
        return &_Ty_NoDefaultStruct;
    }
    TyObject *default_value = PyObject_CallNoArgs(self->evaluate_default);
    self->default_value = Ty_XNewRef(default_value);
    return default_value;
}

static TyObject *
typevartuple_evaluate_default(TyObject *op, void *Py_UNUSED(closure))
{
    typevartupleobject *self = typevartupleobject_CAST(op);
    if (self->evaluate_default != NULL) {
        return Ty_NewRef(self->evaluate_default);
    }
    if (self->default_value != NULL) {
        return constevaluator_alloc(self->default_value);
    }
    Py_RETURN_NONE;
}

static TyGetSetDef typevartuple_getset[] = {
    {"__default__", typevartuple_default, NULL, "The default value for this TypeVarTuple.", NULL},
    {"evaluate_default", typevartuple_evaluate_default, NULL, NULL, NULL},
    {0},
};

static TyMethodDef typevartuple_methods[] = {
    TYPEVARTUPLE_TYPING_SUBST_METHODDEF
    TYPEVARTUPLE_TYPING_PREPARE_SUBST_METHODDEF
    TYPEVARTUPLE_REDUCE_METHODDEF
    TYPEVARTUPLE_HAS_DEFAULT_METHODDEF
    {"__mro_entries__", typevartuple_mro_entries, METH_O},
    {0}
};

TyDoc_STRVAR(typevartuple_doc,
"Type variable tuple. A specialized form of type variable that enables\n\
variadic generics.\n\
\n\
The preferred way to construct a type variable tuple is via the\n\
dedicated syntax for generic functions, classes, and type aliases,\n\
where a single '*' indicates a type variable tuple::\n\
\n\
    def move_first_element_to_last[T, *Ts](tup: tuple[T, *Ts]) -> tuple[*Ts, T]:\n\
        return (*tup[1:], tup[0])\n\
\n\
Type variables tuples can have default values:\n\
\n\
    type AliasWithDefault[*Ts = (str, int)] = tuple[*Ts]\n\
\n\
For compatibility with Python 3.11 and earlier, TypeVarTuple objects\n\
can also be created as follows::\n\
\n\
    Ts = TypeVarTuple('Ts')  # Can be given any name\n\
    DefaultTs = TypeVarTuple('Ts', default=(str, int))\n\
\n\
Just as a TypeVar (type variable) is a placeholder for a single type,\n\
a TypeVarTuple is a placeholder for an *arbitrary* number of types. For\n\
example, if we define a generic class using a TypeVarTuple::\n\
\n\
    class C[*Ts]: ...\n\
\n\
Then we can parameterize that class with an arbitrary number of type\n\
arguments::\n\
\n\
    C[int]       # Fine\n\
    C[int, str]  # Also fine\n\
    C[()]        # Even this is fine\n\
\n\
For more details, see PEP 646.\n\
\n\
Note that only TypeVarTuples defined in the global scope can be\n\
pickled.\n\
");

TyType_Slot typevartuple_slots[] = {
    {Ty_tp_doc, (void *)typevartuple_doc},
    {Ty_tp_members, typevartuple_members},
    {Ty_tp_methods, typevartuple_methods},
    {Ty_tp_getset, typevartuple_getset},
    {Ty_tp_new, typevartuple},
    {Ty_tp_iter, unpack_iter},
    {Ty_tp_repr, typevartuple_repr},
    {Ty_tp_dealloc, typevartuple_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, typevartuple_traverse},
    {Ty_tp_clear, typevartuple_clear},
    {0, 0},
};

TyType_Spec typevartuple_spec = {
    .name = "typing.TypeVarTuple",
    .basicsize = sizeof(typevartupleobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_MANAGED_DICT
        | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_MANAGED_WEAKREF,
    .slots = typevartuple_slots,
};

TyObject *
_Ty_make_typevar(TyObject *name, TyObject *evaluate_bound, TyObject *evaluate_constraints)
{
    return (TyObject *)typevar_alloc(name, NULL, evaluate_bound, NULL, evaluate_constraints,
                                     NULL, false, false, true, NULL);
}

TyObject *
_Ty_make_paramspec(TyThreadState *Py_UNUSED(ignored), TyObject *v)
{
    assert(TyUnicode_Check(v));
    return (TyObject *)paramspec_alloc(v, NULL, NULL, false, false, true, NULL);
}

TyObject *
_Ty_make_typevartuple(TyThreadState *Py_UNUSED(ignored), TyObject *v)
{
    assert(TyUnicode_Check(v));
    return (TyObject *)typevartuple_alloc(v, NULL, NULL);
}

static TyObject *
get_type_param_default(TyThreadState *ts, TyObject *typeparam) {
    // Does not modify refcount of existing objects.
    if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.typevar_type)) {
        return typevar_default(typeparam, NULL);
    }
    else if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.paramspec_type)) {
        return paramspec_default(typeparam, NULL);
    }
    else if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.typevartuple_type)) {
        return typevartuple_default(typeparam, NULL);
    }
    else {
        TyErr_Format(TyExc_TypeError, "Expected a type param, got %R", typeparam);
        return NULL;
    }
}

static void
typealias_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    typealiasobject *ta = typealiasobject_CAST(self);
    Ty_DECREF(ta->name);
    Ty_XDECREF(ta->type_params);
    Ty_XDECREF(ta->compute_value);
    Ty_XDECREF(ta->value);
    Ty_XDECREF(ta->module);
    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
typealias_get_value(typealiasobject *ta)
{
    if (ta->value != NULL) {
        return Ty_NewRef(ta->value);
    }
    TyObject *result = PyObject_CallNoArgs(ta->compute_value);
    if (result == NULL) {
        return NULL;
    }
    ta->value = Ty_NewRef(result);
    return result;
}

static TyObject *
typealias_repr(TyObject *self)
{
    typealiasobject *ta = (typealiasobject *)self;
    return Ty_NewRef(ta->name);
}

static TyMemberDef typealias_members[] = {
    {"__name__", _Ty_T_OBJECT, offsetof(typealiasobject, name), Py_READONLY},
    {0}
};

static TyObject *
typealias_value(TyObject *self, void *Py_UNUSED(closure))
{
    typealiasobject *ta = typealiasobject_CAST(self);
    return typealias_get_value(ta);
}

static TyObject *
typealias_evaluate_value(TyObject *self, void *Py_UNUSED(closure))
{
    typealiasobject *ta = typealiasobject_CAST(self);
    if (ta->compute_value != NULL) {
        return Ty_NewRef(ta->compute_value);
    }
    assert(ta->value != NULL);
    return constevaluator_alloc(ta->value);
}

static TyObject *
typealias_parameters(TyObject *self, void *Py_UNUSED(closure))
{
    typealiasobject *ta = typealiasobject_CAST(self);
    if (ta->type_params == NULL) {
        return TyTuple_New(0);
    }
    return unpack_typevartuples(ta->type_params);
}

static TyObject *
typealias_type_params(TyObject *self, void *Py_UNUSED(closure))
{
    typealiasobject *ta = typealiasobject_CAST(self);
    if (ta->type_params == NULL) {
        return TyTuple_New(0);
    }
    return Ty_NewRef(ta->type_params);
}

static TyObject *
typealias_module(TyObject *self, void *Py_UNUSED(closure))
{
    typealiasobject *ta = typealiasobject_CAST(self);
    if (ta->module != NULL) {
        return Ty_NewRef(ta->module);
    }
    if (ta->compute_value != NULL) {
        TyObject* mod = TyFunction_GetModule(ta->compute_value);
        if (mod != NULL) {
            // TyFunction_GetModule() returns a borrowed reference,
            // and it may return NULL (e.g., for functions defined
            // in an exec()'ed block).
            return Ty_NewRef(mod);
        }
    }
    Py_RETURN_NONE;
}

static TyGetSetDef typealias_getset[] = {
    {"__parameters__", typealias_parameters, NULL, NULL, NULL},
    {"__type_params__", typealias_type_params, NULL, NULL, NULL},
    {"__value__", typealias_value, NULL, NULL, NULL},
    {"evaluate_value", typealias_evaluate_value, NULL, NULL, NULL},
    {"__module__", typealias_module, NULL, NULL, NULL},
    {0}
};

static TyObject *
typealias_check_type_params(TyObject *type_params, int *err) {
    // Can return type_params or NULL without exception set.
    // Does not change the reference count of type_params,
    // sets `*err` to 1 when error happens and sets an exception,
    // otherwise `*err` is set to 0.
    *err = 0;
    if (type_params == NULL) {
        return NULL;
    }

    assert(TyTuple_Check(type_params));
    Ty_ssize_t length = TyTuple_GET_SIZE(type_params);
    if (!length) {  // 0-length tuples are the same as `NULL`.
        return NULL;
    }

    TyThreadState *ts = _TyThreadState_GET();
    int default_seen = 0;
    for (Ty_ssize_t index = 0; index < length; index++) {
        TyObject *type_param = TyTuple_GET_ITEM(type_params, index);
        TyObject *dflt = get_type_param_default(ts, type_param);
        if (dflt == NULL) {
            *err = 1;
            return NULL;
        }
        if (dflt == &_Ty_NoDefaultStruct) {
            if (default_seen) {
                *err = 1;
                TyErr_Format(TyExc_TypeError,
                                "non-default type parameter '%R' "
                                "follows default type parameter",
                                type_param);
                return NULL;
            }
        } else {
            default_seen = 1;
            Ty_DECREF(dflt);
        }
    }

    return type_params;
}

static TyObject *
typelias_convert_type_params(TyObject *type_params)
{
    if (
        type_params == NULL
        || Ty_IsNone(type_params)
        || (TyTuple_Check(type_params) && TyTuple_GET_SIZE(type_params) == 0)
    ) {
        return NULL;
    }
    else {
        return type_params;
    }
}

static typealiasobject *
typealias_alloc(TyObject *name, TyObject *type_params, TyObject *compute_value,
                TyObject *value, TyObject *module)
{
    typealiasobject *ta = PyObject_GC_New(typealiasobject, &_PyTypeAlias_Type);
    if (ta == NULL) {
        return NULL;
    }
    ta->name = Ty_NewRef(name);
    ta->type_params = Ty_XNewRef(type_params);
    ta->compute_value = Ty_XNewRef(compute_value);
    ta->value = Ty_XNewRef(value);
    ta->module = Ty_XNewRef(module);
    _TyObject_GC_TRACK(ta);
    return ta;
}

static int
typealias_traverse(TyObject *op, visitproc visit, void *arg)
{
    typealiasobject *self = typealiasobject_CAST(op);
    Ty_VISIT(self->type_params);
    Ty_VISIT(self->compute_value);
    Ty_VISIT(self->value);
    Ty_VISIT(self->module);
    return 0;
}

static int
typealias_clear(TyObject *op)
{
    typealiasobject *self = typealiasobject_CAST(op);
    Ty_CLEAR(self->type_params);
    Ty_CLEAR(self->compute_value);
    Ty_CLEAR(self->value);
    Ty_CLEAR(self->module);
    return 0;
}

/*[clinic input]
typealias.__reduce__ as typealias_reduce

[clinic start generated code]*/

static TyObject *
typealias_reduce_impl(typealiasobject *self)
/*[clinic end generated code: output=913724f92ad3b39b input=4f06fbd9472ec0f1]*/
{
    return Ty_NewRef(self->name);
}

static TyObject *
typealias_subscript(TyObject *op, TyObject *args)
{
    typealiasobject *self = typealiasobject_CAST(op);
    if (self->type_params == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "Only generic type aliases are subscriptable");
        return NULL;
    }
    return Ty_GenericAlias(op, args);
}

static TyMethodDef typealias_methods[] = {
    TYPEALIAS_REDUCE_METHODDEF
    {0}
};


/*[clinic input]
@classmethod
typealias.__new__ as typealias_new

    name: object(subclass_of="&TyUnicode_Type")
    value: object
    *
    type_params: object = NULL

Create a TypeAliasType.
[clinic start generated code]*/

static TyObject *
typealias_new_impl(TyTypeObject *type, TyObject *name, TyObject *value,
                   TyObject *type_params)
/*[clinic end generated code: output=8920ce6bdff86f00 input=df163c34e17e1a35]*/
{
    if (type_params != NULL && !TyTuple_Check(type_params)) {
        TyErr_SetString(TyExc_TypeError, "type_params must be a tuple");
        return NULL;
    }

    int err = 0;
    TyObject *checked_params = typealias_check_type_params(type_params, &err);
    if (err) {
        return NULL;
    }

    TyObject *module = caller();
    if (module == NULL) {
        return NULL;
    }
    TyObject *ta = (TyObject *)typealias_alloc(name, checked_params, NULL, value,
                                               module);
    Ty_DECREF(module);
    return ta;
}

TyDoc_STRVAR(typealias_doc,
"Type alias.\n\
\n\
Type aliases are created through the type statement::\n\
\n\
    type Alias = int\n\
\n\
In this example, Alias and int will be treated equivalently by static\n\
type checkers.\n\
\n\
At runtime, Alias is an instance of TypeAliasType. The __name__\n\
attribute holds the name of the type alias. The value of the type alias\n\
is stored in the __value__ attribute. It is evaluated lazily, so the\n\
value is computed only if the attribute is accessed.\n\
\n\
Type aliases can also be generic::\n\
\n\
    type ListOrSet[T] = list[T] | set[T]\n\
\n\
In this case, the type parameters of the alias are stored in the\n\
__type_params__ attribute.\n\
\n\
See PEP 695 for more information.\n\
");

static TyNumberMethods typealias_as_number = {
    .nb_or = _Ty_union_type_or,
};

static PyMappingMethods typealias_as_mapping = {
    .mp_subscript = typealias_subscript,
};

TyTypeObject _PyTypeAlias_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "typing.TypeAliasType",
    .tp_basicsize = sizeof(typealiasobject),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_GC,
    .tp_doc = typealias_doc,
    .tp_members = typealias_members,
    .tp_methods = typealias_methods,
    .tp_getset = typealias_getset,
    .tp_alloc = TyType_GenericAlloc,
    .tp_dealloc = typealias_dealloc,
    .tp_new = typealias_new,
    .tp_free = PyObject_GC_Del,
    .tp_iter = unpack_iter,
    .tp_traverse = typealias_traverse,
    .tp_clear = typealias_clear,
    .tp_repr = typealias_repr,
    .tp_as_number = &typealias_as_number,
    .tp_as_mapping = &typealias_as_mapping,
};

TyObject *
_Ty_make_typealias(TyThreadState* unused, TyObject *args)
{
    assert(TyTuple_Check(args));
    assert(TyTuple_GET_SIZE(args) == 3);
    TyObject *name = TyTuple_GET_ITEM(args, 0);
    assert(TyUnicode_Check(name));
    TyObject *type_params = typelias_convert_type_params(TyTuple_GET_ITEM(args, 1));
    TyObject *compute_value = TyTuple_GET_ITEM(args, 2);
    assert(TyFunction_Check(compute_value));
    return (TyObject *)typealias_alloc(name, type_params, compute_value, NULL, NULL);
}

TyDoc_STRVAR(generic_doc,
"Abstract base class for generic types.\n\
\n\
On Python 3.12 and newer, generic classes implicitly inherit from\n\
Generic when they declare a parameter list after the class's name::\n\
\n\
    class Mapping[KT, VT]:\n\
        def __getitem__(self, key: KT) -> VT:\n\
            ...\n\
        # Etc.\n\
\n\
On older versions of Python, however, generic classes have to\n\
explicitly inherit from Generic.\n\
\n\
After a class has been declared to be generic, it can then be used as\n\
follows::\n\
\n\
    def lookup_name[KT, VT](mapping: Mapping[KT, VT], key: KT, default: VT) -> VT:\n\
        try:\n\
            return mapping[key]\n\
        except KeyError:\n\
            return default\n\
");

TyDoc_STRVAR(generic_class_getitem_doc,
"Parameterizes a generic class.\n\
\n\
At least, parameterizing a generic class is the *main* thing this\n\
method does. For example, for some generic class `Foo`, this is called\n\
when we do `Foo[int]` - there, with `cls=Foo` and `params=int`.\n\
\n\
However, note that this method is also called when defining generic\n\
classes in the first place with `class Foo[T]: ...`.\n\
");

static TyObject *
call_typing_args_kwargs(const char *name, TyTypeObject *cls, TyObject *args, TyObject *kwargs)
{
    TyObject *typing = NULL, *func = NULL, *new_args = NULL;
    typing = TyImport_ImportModule("typing");
    if (typing == NULL) {
        goto error;
    }
    func = PyObject_GetAttrString(typing, name);
    if (func == NULL) {
        goto error;
    }
    assert(TyTuple_Check(args));
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    new_args = TyTuple_New(nargs + 1);
    if (new_args == NULL) {
        goto error;
    }
    TyTuple_SET_ITEM(new_args, 0, Ty_NewRef((TyObject *)cls));
    for (Ty_ssize_t i = 0; i < nargs; i++) {
        TyObject *arg = TyTuple_GET_ITEM(args, i);
        TyTuple_SET_ITEM(new_args, i + 1, Ty_NewRef(arg));
    }
    TyObject *result = PyObject_Call(func, new_args, kwargs);
    Ty_DECREF(typing);
    Ty_DECREF(func);
    Ty_DECREF(new_args);
    return result;
error:
    Ty_XDECREF(typing);
    Ty_XDECREF(func);
    Ty_XDECREF(new_args);
    return NULL;
}

static TyObject *
generic_init_subclass(TyObject *cls, TyObject *args, TyObject *kwargs)
{
    return call_typing_args_kwargs("_generic_init_subclass",
                                   (TyTypeObject*)cls, args, kwargs);
}

static TyObject *
generic_class_getitem(TyObject *cls, TyObject *args, TyObject *kwargs)
{
    return call_typing_args_kwargs("_generic_class_getitem",
                                   (TyTypeObject*)cls, args, kwargs);
}

TyObject *
_Ty_subscript_generic(TyThreadState* unused, TyObject *params)
{
    params = unpack_typevartuples(params);

    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (interp->cached_objects.generic_type == NULL) {
        TyErr_SetString(TyExc_SystemError, "Cannot find Generic type");
        return NULL;
    }
    TyObject *args[2] = {(TyObject *)interp->cached_objects.generic_type, params};
    TyObject *result = call_typing_func_object("_GenericAlias", args, 2);
    Ty_DECREF(params);
    return result;
}

static TyMethodDef generic_methods[] = {
    {"__class_getitem__", _PyCFunction_CAST(generic_class_getitem),
     METH_VARARGS | METH_KEYWORDS | METH_CLASS,
     generic_class_getitem_doc},
    {"__init_subclass__", _PyCFunction_CAST(generic_init_subclass),
     METH_VARARGS | METH_KEYWORDS | METH_CLASS,
     TyDoc_STR("Function to initialize subclasses.")},
    {NULL} /* Sentinel */
};

static void
generic_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static int
generic_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static TyType_Slot generic_slots[] = {
    {Ty_tp_doc, (void *)generic_doc},
    {Ty_tp_methods, generic_methods},
    {Ty_tp_dealloc, generic_dealloc},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {Ty_tp_traverse, generic_traverse},
    {0, NULL},
};

TyType_Spec generic_spec = {
    .name = "typing.Generic",
    .basicsize = sizeof(TyObject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    .slots = generic_slots,
};

int _Ty_initialize_generic(TyInterpreterState *interp)
{
#define MAKE_TYPE(name) \
    do { \
        TyTypeObject *name ## _type = (TyTypeObject *)TyType_FromSpec(&name ## _spec); \
        if (name ## _type == NULL) { \
            return -1; \
        } \
        interp->cached_objects.name ## _type = name ## _type; \
    } while(0)

    MAKE_TYPE(generic);
    MAKE_TYPE(typevar);
    MAKE_TYPE(typevartuple);
    MAKE_TYPE(paramspec);
    MAKE_TYPE(paramspecargs);
    MAKE_TYPE(paramspeckwargs);
    MAKE_TYPE(constevaluator);
#undef MAKE_TYPE
    return 0;
}

void _Ty_clear_generic_types(TyInterpreterState *interp)
{
    Ty_CLEAR(interp->cached_objects.generic_type);
    Ty_CLEAR(interp->cached_objects.typevar_type);
    Ty_CLEAR(interp->cached_objects.typevartuple_type);
    Ty_CLEAR(interp->cached_objects.paramspec_type);
    Ty_CLEAR(interp->cached_objects.paramspecargs_type);
    Ty_CLEAR(interp->cached_objects.paramspeckwargs_type);
    Ty_CLEAR(interp->cached_objects.constevaluator_type);
}

TyObject *
_Ty_set_typeparam_default(TyThreadState *ts, TyObject *typeparam, TyObject *evaluate_default)
{
    if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.typevar_type)) {
        Ty_XSETREF(((typevarobject *)typeparam)->evaluate_default, Ty_NewRef(evaluate_default));
        return Ty_NewRef(typeparam);
    }
    else if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.paramspec_type)) {
        Ty_XSETREF(((paramspecobject *)typeparam)->evaluate_default, Ty_NewRef(evaluate_default));
        return Ty_NewRef(typeparam);
    }
    else if (Ty_IS_TYPE(typeparam, ts->interp->cached_objects.typevartuple_type)) {
        Ty_XSETREF(((typevartupleobject *)typeparam)->evaluate_default, Ty_NewRef(evaluate_default));
        return Ty_NewRef(typeparam);
    }
    else {
        TyErr_Format(TyExc_TypeError, "Expected a type param, got %R", typeparam);
        return NULL;
    }
}
