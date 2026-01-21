/* t-string Interpolation object implementation */

#include "Python.h"
#include "pycore_initconfig.h"    // _TyStatus_OK
#include "pycore_interpolation.h"
#include "pycore_typeobject.h"    // _TyType_GetDict

static int
_conversion_converter(TyObject *arg, TyObject **conversion)
{
    if (arg == Ty_None) {
        return 1;
    }

    if (!TyUnicode_Check(arg)) {
        TyErr_Format(TyExc_TypeError,
            "Interpolation() argument 'conversion' must be str, not %T",
            arg);
        return 0;
    }

    Ty_ssize_t len;
    const char *conv_str = TyUnicode_AsUTF8AndSize(arg, &len);
    if (len != 1 || !(conv_str[0] == 'a' || conv_str[0] == 'r' || conv_str[0] == 's')) {
        TyErr_SetString(TyExc_ValueError,
            "Interpolation() argument 'conversion' must be one of 's', 'a' or 'r'");
        return 0;
    }

    *conversion = arg;
    return 1;
}

#include "clinic/interpolationobject.c.h"

/*[clinic input]
class Interpolation "interpolationobject *" "&_PyInterpolation_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=161c64a16f9c4544]*/

typedef struct {
    PyObject_HEAD
    TyObject *value;
    TyObject *expression;
    TyObject *conversion;
    TyObject *format_spec;
} interpolationobject;

#define interpolationobject_CAST(op) \
    (assert(_PyInterpolation_CheckExact(op)), _Py_CAST(interpolationobject*, (op)))

/*[clinic input]
@classmethod
Interpolation.__new__ as interpolation_new

    value: object
    expression: object(subclass_of='&TyUnicode_Type', c_default='&_Ty_STR(empty)') = ""
    conversion: object(converter='_conversion_converter') = None
    format_spec: object(subclass_of='&TyUnicode_Type', c_default='&_Ty_STR(empty)') = ""
[clinic start generated code]*/

static TyObject *
interpolation_new_impl(TyTypeObject *type, TyObject *value,
                       TyObject *expression, TyObject *conversion,
                       TyObject *format_spec)
/*[clinic end generated code: output=6488e288765bc1a9 input=fc5c285c1dd23d36]*/
{
    interpolationobject *self = PyObject_GC_New(interpolationobject, type);
    if (!self) {
        return NULL;
    }

    self->value = Ty_NewRef(value);
    self->expression = Ty_NewRef(expression);
    self->conversion = Ty_NewRef(conversion);
    self->format_spec = Ty_NewRef(format_spec);
    PyObject_GC_Track(self);
    return (TyObject *) self;
}

static void
interpolation_dealloc(TyObject *op)
{
    PyObject_GC_UnTrack(op);
    Ty_TYPE(op)->tp_clear(op);
    Ty_TYPE(op)->tp_free(op);
}

static int
interpolation_clear(TyObject *op)
{
    interpolationobject *self = interpolationobject_CAST(op);
    Ty_CLEAR(self->value);
    Ty_CLEAR(self->expression);
    Ty_CLEAR(self->conversion);
    Ty_CLEAR(self->format_spec);
    return 0;
}

static int
interpolation_traverse(TyObject *op, visitproc visit, void *arg)
{
    interpolationobject *self = interpolationobject_CAST(op);
    Ty_VISIT(self->value);
    Ty_VISIT(self->expression);
    Ty_VISIT(self->conversion);
    Ty_VISIT(self->format_spec);
    return 0;
}

static TyObject *
interpolation_repr(TyObject *op)
{
    interpolationobject *self = interpolationobject_CAST(op);
    return TyUnicode_FromFormat("%s(%R, %R, %R, %R)",
                                _TyType_Name(Ty_TYPE(self)), self->value, self->expression,
                                self->conversion, self->format_spec);
}

static TyMemberDef interpolation_members[] = {
    {"value", Ty_T_OBJECT_EX, offsetof(interpolationobject, value), Py_READONLY, "Value"},
    {"expression", Ty_T_OBJECT_EX, offsetof(interpolationobject, expression), Py_READONLY, "Expression"},
    {"conversion", Ty_T_OBJECT_EX, offsetof(interpolationobject, conversion), Py_READONLY, "Conversion"},
    {"format_spec", Ty_T_OBJECT_EX, offsetof(interpolationobject, format_spec), Py_READONLY, "Format specifier"},
    {NULL}
};

static TyObject*
interpolation_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    interpolationobject *self = interpolationobject_CAST(op);
    return Ty_BuildValue("(O(OOOO))", (TyObject *)Ty_TYPE(op),
                         self->value, self->expression,
                         self->conversion, self->format_spec);
}

static TyMethodDef interpolation_methods[] = {
    {"__reduce__", interpolation_reduce, METH_NOARGS,
        TyDoc_STR("__reduce__() -> (cls, state)")},
    {"__class_getitem__", Ty_GenericAlias,
        METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL, NULL},
};

TyTypeObject _PyInterpolation_Type = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "string.templatelib.Interpolation",
    .tp_doc = TyDoc_STR("Interpolation object"),
    .tp_basicsize = sizeof(interpolationobject),
    .tp_itemsize = 0,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_new = interpolation_new,
    .tp_alloc = TyType_GenericAlloc,
    .tp_dealloc = interpolation_dealloc,
    .tp_clear = interpolation_clear,
    .tp_free = PyObject_GC_Del,
    .tp_repr = interpolation_repr,
    .tp_members = interpolation_members,
    .tp_methods = interpolation_methods,
    .tp_traverse = interpolation_traverse,
};

TyStatus
_PyInterpolation_InitTypes(TyInterpreterState *interp)
{
    TyObject *tuple = Ty_BuildValue("(ssss)", "value", "expression", "conversion", "format_spec");
    if (!tuple) {
        goto error;
    }

    TyObject *dict = _TyType_GetDict(&_PyInterpolation_Type);
    if (!dict) {
        Ty_DECREF(tuple);
        goto error;
    }

    int status = TyDict_SetItemString(dict, "__match_args__", tuple);
    Ty_DECREF(tuple);
    if (status < 0) {
        goto error;
    }
    return _TyStatus_OK();

error:
    return _TyStatus_ERR("Can't initialize interpolation types");
}

TyObject *
_PyInterpolation_Build(TyObject *value, TyObject *str, int conversion, TyObject *format_spec)
{
    interpolationobject *interpolation = PyObject_GC_New(interpolationobject, &_PyInterpolation_Type);
    if (!interpolation) {
        return NULL;
    }

    interpolation->value = Ty_NewRef(value);
    interpolation->expression = Ty_NewRef(str);
    interpolation->format_spec = Ty_NewRef(format_spec);
    interpolation->conversion = NULL;

    if (conversion == 0) {
        interpolation->conversion = Ty_None;
    }
    else {
        switch (conversion) {
            case FVC_ASCII:
                interpolation->conversion = _Ty_LATIN1_CHR('a');
                break;
            case FVC_REPR:
                interpolation->conversion = _Ty_LATIN1_CHR('r');
                break;
            case FVC_STR:
                interpolation->conversion = _Ty_LATIN1_CHR('s');
                break;
            default:
                TyErr_SetString(TyExc_SystemError,
                    "Interpolation() argument 'conversion' must be one of 's', 'a' or 'r'");
                Ty_DECREF(interpolation);
                return NULL;
        }
    }

    PyObject_GC_Track(interpolation);
    return (TyObject *) interpolation;
}

TyObject *
_PyInterpolation_GetValueRef(TyObject *interpolation)
{
    return Ty_NewRef(interpolationobject_CAST(interpolation)->value);
}
