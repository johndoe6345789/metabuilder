/* Boolean type, a subtype of int */

#include "Python.h"
#include "pycore_long.h"          // FALSE_TAG TRUE_TAG
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_object.h"        // _Ty_FatalRefcountError()
#include "pycore_runtime.h"       // _Ty_ID()

#include <stddef.h>

/* We define bool_repr to return "False" or "True" */

static TyObject *
bool_repr(TyObject *self)
{
    return self == Ty_True ? &_Ty_ID(True) : &_Ty_ID(False);
}

/* Function to return a bool from a C long */

TyObject *TyBool_FromLong(long ok)
{
    return ok ? Ty_True : Ty_False;
}

/* We define bool_new to always return either Ty_True or Ty_False */

static TyObject *
bool_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *x = Ty_False;
    long ok;

    if (!_TyArg_NoKeywords("bool", kwds))
        return NULL;
    if (!TyArg_UnpackTuple(args, "bool", 0, 1, &x))
        return NULL;
    ok = PyObject_IsTrue(x);
    if (ok < 0)
        return NULL;
    return TyBool_FromLong(ok);
}

static TyObject *
bool_vectorcall(TyObject *type, TyObject * const*args,
                size_t nargsf, TyObject *kwnames)
{
    long ok = 0;
    if (!_TyArg_NoKwnames("bool", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("bool", nargs, 0, 1)) {
        return NULL;
    }

    assert(TyType_Check(type));
    if (nargs) {
        ok = PyObject_IsTrue(args[0]);
        if (ok < 0) {
            return NULL;
        }
    }
    return TyBool_FromLong(ok);
}

/* Arithmetic operations redefined to return bool if both args are bool. */

static TyObject *
bool_invert(TyObject *v)
{
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
                     "Bitwise inversion '~' on bool is deprecated and will be removed in "
                     "Python 3.16. This returns the bitwise inversion of the underlying int "
                     "object and is usually not what you expect from negating "
                     "a bool. Use the 'not' operator for boolean negation or "
                     "~int(x) if you really want the bitwise inversion of the "
                     "underlying int.",
                     1) < 0) {
        return NULL;
    }
    return TyLong_Type.tp_as_number->nb_invert(v);
}

static TyObject *
bool_and(TyObject *a, TyObject *b)
{
    if (!TyBool_Check(a) || !TyBool_Check(b))
        return TyLong_Type.tp_as_number->nb_and(a, b);
    return TyBool_FromLong((a == Ty_True) & (b == Ty_True));
}

static TyObject *
bool_or(TyObject *a, TyObject *b)
{
    if (!TyBool_Check(a) || !TyBool_Check(b))
        return TyLong_Type.tp_as_number->nb_or(a, b);
    return TyBool_FromLong((a == Ty_True) | (b == Ty_True));
}

static TyObject *
bool_xor(TyObject *a, TyObject *b)
{
    if (!TyBool_Check(a) || !TyBool_Check(b))
        return TyLong_Type.tp_as_number->nb_xor(a, b);
    return TyBool_FromLong((a == Ty_True) ^ (b == Ty_True));
}

/* Doc string */

TyDoc_STRVAR(bool_doc,
"bool(object=False, /)\n\
--\n\
\n\
Returns True when the argument is true, False otherwise.\n\
The builtins True and False are the only two instances of the class bool.\n\
The class bool is a subclass of the class int, and cannot be subclassed.");

/* Arithmetic methods -- only so we can override &, |, ^. */

static TyNumberMethods bool_as_number = {
    0,                          /* nb_add */
    0,                          /* nb_subtract */
    0,                          /* nb_multiply */
    0,                          /* nb_remainder */
    0,                          /* nb_divmod */
    0,                          /* nb_power */
    0,                          /* nb_negative */
    0,                          /* nb_positive */
    0,                          /* nb_absolute */
    0,                          /* nb_bool */
    bool_invert,                /* nb_invert */
    0,                          /* nb_lshift */
    0,                          /* nb_rshift */
    bool_and,                   /* nb_and */
    bool_xor,                   /* nb_xor */
    bool_or,                    /* nb_or */
    0,                          /* nb_int */
    0,                          /* nb_reserved */
    0,                          /* nb_float */
    0,                          /* nb_inplace_add */
    0,                          /* nb_inplace_subtract */
    0,                          /* nb_inplace_multiply */
    0,                          /* nb_inplace_remainder */
    0,                          /* nb_inplace_power */
    0,                          /* nb_inplace_lshift */
    0,                          /* nb_inplace_rshift */
    0,                          /* nb_inplace_and */
    0,                          /* nb_inplace_xor */
    0,                          /* nb_inplace_or */
    0,                          /* nb_floor_divide */
    0,                          /* nb_true_divide */
    0,                          /* nb_inplace_floor_divide */
    0,                          /* nb_inplace_true_divide */
    0,                          /* nb_index */
};

static void
bool_dealloc(TyObject *boolean)
{
    /* This should never get called, but we also don't want to SEGV if
     * we accidentally decref Booleans out of existence. Instead,
     * since bools are immortal, re-set the reference count.
     */
    _Ty_SetImmortal(boolean);
}

/* The type object for bool.  Note that this cannot be subclassed! */

TyTypeObject TyBool_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "bool",
    offsetof(struct _longobject, long_value.ob_digit),  /* tp_basicsize */
    sizeof(digit),                              /* tp_itemsize */
    bool_dealloc,                               /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    bool_repr,                                  /* tp_repr */
    &bool_as_number,                            /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    0,                                          /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT,                         /* tp_flags */
    bool_doc,                                   /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    &TyLong_Type,                               /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    bool_new,                                   /* tp_new */
    .tp_vectorcall = bool_vectorcall,
};

/* The objects representing bool values False and True */

struct _longobject _Ty_FalseStruct = {
    PyObject_HEAD_INIT(&TyBool_Type)
    { .lv_tag = _TyLong_FALSE_TAG,
        { 0 }
    }
};

struct _longobject _Ty_TrueStruct = {
    PyObject_HEAD_INIT(&TyBool_Type)
    { .lv_tag = _TyLong_TRUE_TAG,
        { 1 }
    }
};
