/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(typevar_new__doc__,
"typevar(name, *constraints, bound=None, default=typing.NoDefault,\n"
"        covariant=False, contravariant=False, infer_variance=False)\n"
"--\n"
"\n"
"Create a TypeVar.");

static TyObject *
typevar_new_impl(TyTypeObject *type, TyObject *name, TyObject *constraints,
                 TyObject *bound, TyObject *default_value, int covariant,
                 int contravariant, int infer_variance);

static TyObject *
typevar_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 6
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(bound), &_Ty_ID(default), &_Ty_ID(covariant), &_Ty_ID(contravariant), &_Ty_ID(infer_variance), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "bound", "default", "covariant", "contravariant", "infer_variance", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "typevar",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = Ty_MIN(nargs, 1) + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *name;
    TyObject *constraints = NULL;
    TyObject *bound = Ty_None;
    TyObject *default_value = &_Ty_NoDefaultStruct;
    int covariant = 0;
    int contravariant = 0;
    int infer_variance = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 1, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[0])) {
        _TyArg_BadArgument("typevar", "argument 'name'", "str", fastargs[0]);
        goto exit;
    }
    name = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        bound = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        default_value = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        covariant = PyObject_IsTrue(fastargs[3]);
        if (covariant < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[4]) {
        contravariant = PyObject_IsTrue(fastargs[4]);
        if (contravariant < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    infer_variance = PyObject_IsTrue(fastargs[5]);
    if (infer_variance < 0) {
        goto exit;
    }
skip_optional_kwonly:
    constraints = TyTuple_GetSlice(args, 1, PY_SSIZE_T_MAX);
    if (!constraints) {
        goto exit;
    }
    return_value = typevar_new_impl(type, name, constraints, bound, default_value, covariant, contravariant, infer_variance);

exit:
    /* Cleanup for constraints */
    Ty_XDECREF(constraints);

    return return_value;
}

TyDoc_STRVAR(typevar_typing_subst__doc__,
"__typing_subst__($self, arg, /)\n"
"--\n"
"\n");

#define TYPEVAR_TYPING_SUBST_METHODDEF    \
    {"__typing_subst__", (PyCFunction)typevar_typing_subst, METH_O, typevar_typing_subst__doc__},

static TyObject *
typevar_typing_subst_impl(typevarobject *self, TyObject *arg);

static TyObject *
typevar_typing_subst(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;

    return_value = typevar_typing_subst_impl((typevarobject *)self, arg);

    return return_value;
}

TyDoc_STRVAR(typevar_typing_prepare_subst__doc__,
"__typing_prepare_subst__($self, alias, args, /)\n"
"--\n"
"\n");

#define TYPEVAR_TYPING_PREPARE_SUBST_METHODDEF    \
    {"__typing_prepare_subst__", _PyCFunction_CAST(typevar_typing_prepare_subst), METH_FASTCALL, typevar_typing_prepare_subst__doc__},

static TyObject *
typevar_typing_prepare_subst_impl(typevarobject *self, TyObject *alias,
                                  TyObject *args);

static TyObject *
typevar_typing_prepare_subst(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *alias;
    TyObject *__clinic_args;

    if (!_TyArg_CheckPositional("__typing_prepare_subst__", nargs, 2, 2)) {
        goto exit;
    }
    alias = args[0];
    __clinic_args = args[1];
    return_value = typevar_typing_prepare_subst_impl((typevarobject *)self, alias, __clinic_args);

exit:
    return return_value;
}

TyDoc_STRVAR(typevar_reduce__doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define TYPEVAR_REDUCE_METHODDEF    \
    {"__reduce__", (PyCFunction)typevar_reduce, METH_NOARGS, typevar_reduce__doc__},

static TyObject *
typevar_reduce_impl(typevarobject *self);

static TyObject *
typevar_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return typevar_reduce_impl((typevarobject *)self);
}

TyDoc_STRVAR(typevar_has_default__doc__,
"has_default($self, /)\n"
"--\n"
"\n");

#define TYPEVAR_HAS_DEFAULT_METHODDEF    \
    {"has_default", (PyCFunction)typevar_has_default, METH_NOARGS, typevar_has_default__doc__},

static TyObject *
typevar_has_default_impl(typevarobject *self);

static TyObject *
typevar_has_default(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return typevar_has_default_impl((typevarobject *)self);
}

TyDoc_STRVAR(paramspecargs_new__doc__,
"paramspecargs(origin)\n"
"--\n"
"\n"
"Create a ParamSpecArgs object.");

static TyObject *
paramspecargs_new_impl(TyTypeObject *type, TyObject *origin);

static TyObject *
paramspecargs_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(origin), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"origin", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "paramspecargs",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *origin;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    origin = fastargs[0];
    return_value = paramspecargs_new_impl(type, origin);

exit:
    return return_value;
}

TyDoc_STRVAR(paramspeckwargs_new__doc__,
"paramspeckwargs(origin)\n"
"--\n"
"\n"
"Create a ParamSpecKwargs object.");

static TyObject *
paramspeckwargs_new_impl(TyTypeObject *type, TyObject *origin);

static TyObject *
paramspeckwargs_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(origin), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"origin", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "paramspeckwargs",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *origin;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    origin = fastargs[0];
    return_value = paramspeckwargs_new_impl(type, origin);

exit:
    return return_value;
}

TyDoc_STRVAR(paramspec_new__doc__,
"paramspec(name, *, bound=None, default=typing.NoDefault,\n"
"          covariant=False, contravariant=False, infer_variance=False)\n"
"--\n"
"\n"
"Create a ParamSpec object.");

static TyObject *
paramspec_new_impl(TyTypeObject *type, TyObject *name, TyObject *bound,
                   TyObject *default_value, int covariant, int contravariant,
                   int infer_variance);

static TyObject *
paramspec_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 6
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(bound), &_Ty_ID(default), &_Ty_ID(covariant), &_Ty_ID(contravariant), &_Ty_ID(infer_variance), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "bound", "default", "covariant", "contravariant", "infer_variance", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "paramspec",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *name;
    TyObject *bound = Ty_None;
    TyObject *default_value = &_Ty_NoDefaultStruct;
    int covariant = 0;
    int contravariant = 0;
    int infer_variance = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[0])) {
        _TyArg_BadArgument("paramspec", "argument 'name'", "str", fastargs[0]);
        goto exit;
    }
    name = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        bound = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        default_value = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        covariant = PyObject_IsTrue(fastargs[3]);
        if (covariant < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[4]) {
        contravariant = PyObject_IsTrue(fastargs[4]);
        if (contravariant < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    infer_variance = PyObject_IsTrue(fastargs[5]);
    if (infer_variance < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = paramspec_new_impl(type, name, bound, default_value, covariant, contravariant, infer_variance);

exit:
    return return_value;
}

TyDoc_STRVAR(paramspec_typing_subst__doc__,
"__typing_subst__($self, arg, /)\n"
"--\n"
"\n");

#define PARAMSPEC_TYPING_SUBST_METHODDEF    \
    {"__typing_subst__", (PyCFunction)paramspec_typing_subst, METH_O, paramspec_typing_subst__doc__},

static TyObject *
paramspec_typing_subst_impl(paramspecobject *self, TyObject *arg);

static TyObject *
paramspec_typing_subst(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;

    return_value = paramspec_typing_subst_impl((paramspecobject *)self, arg);

    return return_value;
}

TyDoc_STRVAR(paramspec_typing_prepare_subst__doc__,
"__typing_prepare_subst__($self, alias, args, /)\n"
"--\n"
"\n");

#define PARAMSPEC_TYPING_PREPARE_SUBST_METHODDEF    \
    {"__typing_prepare_subst__", _PyCFunction_CAST(paramspec_typing_prepare_subst), METH_FASTCALL, paramspec_typing_prepare_subst__doc__},

static TyObject *
paramspec_typing_prepare_subst_impl(paramspecobject *self, TyObject *alias,
                                    TyObject *args);

static TyObject *
paramspec_typing_prepare_subst(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *alias;
    TyObject *__clinic_args;

    if (!_TyArg_CheckPositional("__typing_prepare_subst__", nargs, 2, 2)) {
        goto exit;
    }
    alias = args[0];
    __clinic_args = args[1];
    return_value = paramspec_typing_prepare_subst_impl((paramspecobject *)self, alias, __clinic_args);

exit:
    return return_value;
}

TyDoc_STRVAR(paramspec_reduce__doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define PARAMSPEC_REDUCE_METHODDEF    \
    {"__reduce__", (PyCFunction)paramspec_reduce, METH_NOARGS, paramspec_reduce__doc__},

static TyObject *
paramspec_reduce_impl(paramspecobject *self);

static TyObject *
paramspec_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return paramspec_reduce_impl((paramspecobject *)self);
}

TyDoc_STRVAR(paramspec_has_default__doc__,
"has_default($self, /)\n"
"--\n"
"\n");

#define PARAMSPEC_HAS_DEFAULT_METHODDEF    \
    {"has_default", (PyCFunction)paramspec_has_default, METH_NOARGS, paramspec_has_default__doc__},

static TyObject *
paramspec_has_default_impl(paramspecobject *self);

static TyObject *
paramspec_has_default(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return paramspec_has_default_impl((paramspecobject *)self);
}

TyDoc_STRVAR(typevartuple__doc__,
"typevartuple(name, *, default=typing.NoDefault)\n"
"--\n"
"\n"
"Create a new TypeVarTuple with the given name.");

static TyObject *
typevartuple_impl(TyTypeObject *type, TyObject *name,
                  TyObject *default_value);

static TyObject *
typevartuple(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "typevartuple",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *name;
    TyObject *default_value = &_Ty_NoDefaultStruct;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[0])) {
        _TyArg_BadArgument("typevartuple", "argument 'name'", "str", fastargs[0]);
        goto exit;
    }
    name = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    default_value = fastargs[1];
skip_optional_kwonly:
    return_value = typevartuple_impl(type, name, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(typevartuple_typing_subst__doc__,
"__typing_subst__($self, arg, /)\n"
"--\n"
"\n");

#define TYPEVARTUPLE_TYPING_SUBST_METHODDEF    \
    {"__typing_subst__", (PyCFunction)typevartuple_typing_subst, METH_O, typevartuple_typing_subst__doc__},

static TyObject *
typevartuple_typing_subst_impl(typevartupleobject *self, TyObject *arg);

static TyObject *
typevartuple_typing_subst(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;

    return_value = typevartuple_typing_subst_impl((typevartupleobject *)self, arg);

    return return_value;
}

TyDoc_STRVAR(typevartuple_typing_prepare_subst__doc__,
"__typing_prepare_subst__($self, alias, args, /)\n"
"--\n"
"\n");

#define TYPEVARTUPLE_TYPING_PREPARE_SUBST_METHODDEF    \
    {"__typing_prepare_subst__", _PyCFunction_CAST(typevartuple_typing_prepare_subst), METH_FASTCALL, typevartuple_typing_prepare_subst__doc__},

static TyObject *
typevartuple_typing_prepare_subst_impl(typevartupleobject *self,
                                       TyObject *alias, TyObject *args);

static TyObject *
typevartuple_typing_prepare_subst(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *alias;
    TyObject *__clinic_args;

    if (!_TyArg_CheckPositional("__typing_prepare_subst__", nargs, 2, 2)) {
        goto exit;
    }
    alias = args[0];
    __clinic_args = args[1];
    return_value = typevartuple_typing_prepare_subst_impl((typevartupleobject *)self, alias, __clinic_args);

exit:
    return return_value;
}

TyDoc_STRVAR(typevartuple_reduce__doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define TYPEVARTUPLE_REDUCE_METHODDEF    \
    {"__reduce__", (PyCFunction)typevartuple_reduce, METH_NOARGS, typevartuple_reduce__doc__},

static TyObject *
typevartuple_reduce_impl(typevartupleobject *self);

static TyObject *
typevartuple_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return typevartuple_reduce_impl((typevartupleobject *)self);
}

TyDoc_STRVAR(typevartuple_has_default__doc__,
"has_default($self, /)\n"
"--\n"
"\n");

#define TYPEVARTUPLE_HAS_DEFAULT_METHODDEF    \
    {"has_default", (PyCFunction)typevartuple_has_default, METH_NOARGS, typevartuple_has_default__doc__},

static TyObject *
typevartuple_has_default_impl(typevartupleobject *self);

static TyObject *
typevartuple_has_default(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return typevartuple_has_default_impl((typevartupleobject *)self);
}

TyDoc_STRVAR(typealias_reduce__doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define TYPEALIAS_REDUCE_METHODDEF    \
    {"__reduce__", (PyCFunction)typealias_reduce, METH_NOARGS, typealias_reduce__doc__},

static TyObject *
typealias_reduce_impl(typealiasobject *self);

static TyObject *
typealias_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return typealias_reduce_impl((typealiasobject *)self);
}

TyDoc_STRVAR(typealias_new__doc__,
"typealias(name, value, *, type_params=<unrepresentable>)\n"
"--\n"
"\n"
"Create a TypeAliasType.");

static TyObject *
typealias_new_impl(TyTypeObject *type, TyObject *name, TyObject *value,
                   TyObject *type_params);

static TyObject *
typealias_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(value), &_Ty_ID(type_params), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "value", "type_params", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "typealias",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 2;
    TyObject *name;
    TyObject *value;
    TyObject *type_params = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[0])) {
        _TyArg_BadArgument("typealias", "argument 'name'", "str", fastargs[0]);
        goto exit;
    }
    name = fastargs[0];
    value = fastargs[1];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    type_params = fastargs[2];
skip_optional_kwonly:
    return_value = typealias_new_impl(type, name, value, type_params);

exit:
    return return_value;
}
/*[clinic end generated code: output=9dad71445e079303 input=a9049054013a1b77]*/
