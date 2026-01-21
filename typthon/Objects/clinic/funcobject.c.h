/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(function___annotate____doc__,
"Get the code object for a function.");
#if defined(function___annotate___DOCSTR)
#   undef function___annotate___DOCSTR
#endif
#define function___annotate___DOCSTR function___annotate____doc__

#if !defined(function___annotate___DOCSTR)
#  define function___annotate___DOCSTR NULL
#endif
#if defined(FUNCTION___ANNOTATE___GETSETDEF)
#  undef FUNCTION___ANNOTATE___GETSETDEF
#  define FUNCTION___ANNOTATE___GETSETDEF {"__annotate__", (getter)function___annotate___get, (setter)function___annotate___set, function___annotate___DOCSTR},
#else
#  define FUNCTION___ANNOTATE___GETSETDEF {"__annotate__", (getter)function___annotate___get, NULL, function___annotate___DOCSTR},
#endif

static TyObject *
function___annotate___get_impl(PyFunctionObject *self);

static TyObject *
function___annotate___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___annotate___get_impl((PyFunctionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(function___annotate___DOCSTR)
#  define function___annotate___DOCSTR NULL
#endif
#if defined(FUNCTION___ANNOTATE___GETSETDEF)
#  undef FUNCTION___ANNOTATE___GETSETDEF
#  define FUNCTION___ANNOTATE___GETSETDEF {"__annotate__", (getter)function___annotate___get, (setter)function___annotate___set, function___annotate___DOCSTR},
#else
#  define FUNCTION___ANNOTATE___GETSETDEF {"__annotate__", NULL, (setter)function___annotate___set, NULL},
#endif

static int
function___annotate___set_impl(PyFunctionObject *self, TyObject *value);

static int
function___annotate___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___annotate___set_impl((PyFunctionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(function___annotations____doc__,
"Dict of annotations in a function object.");
#if defined(function___annotations___DOCSTR)
#   undef function___annotations___DOCSTR
#endif
#define function___annotations___DOCSTR function___annotations____doc__

#if !defined(function___annotations___DOCSTR)
#  define function___annotations___DOCSTR NULL
#endif
#if defined(FUNCTION___ANNOTATIONS___GETSETDEF)
#  undef FUNCTION___ANNOTATIONS___GETSETDEF
#  define FUNCTION___ANNOTATIONS___GETSETDEF {"__annotations__", (getter)function___annotations___get, (setter)function___annotations___set, function___annotations___DOCSTR},
#else
#  define FUNCTION___ANNOTATIONS___GETSETDEF {"__annotations__", (getter)function___annotations___get, NULL, function___annotations___DOCSTR},
#endif

static TyObject *
function___annotations___get_impl(PyFunctionObject *self);

static TyObject *
function___annotations___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___annotations___get_impl((PyFunctionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(function___annotations___DOCSTR)
#  define function___annotations___DOCSTR NULL
#endif
#if defined(FUNCTION___ANNOTATIONS___GETSETDEF)
#  undef FUNCTION___ANNOTATIONS___GETSETDEF
#  define FUNCTION___ANNOTATIONS___GETSETDEF {"__annotations__", (getter)function___annotations___get, (setter)function___annotations___set, function___annotations___DOCSTR},
#else
#  define FUNCTION___ANNOTATIONS___GETSETDEF {"__annotations__", NULL, (setter)function___annotations___set, NULL},
#endif

static int
function___annotations___set_impl(PyFunctionObject *self, TyObject *value);

static int
function___annotations___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___annotations___set_impl((PyFunctionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(function___type_params____doc__,
"Get the declared type parameters for a function.");
#if defined(function___type_params___DOCSTR)
#   undef function___type_params___DOCSTR
#endif
#define function___type_params___DOCSTR function___type_params____doc__

#if !defined(function___type_params___DOCSTR)
#  define function___type_params___DOCSTR NULL
#endif
#if defined(FUNCTION___TYPE_PARAMS___GETSETDEF)
#  undef FUNCTION___TYPE_PARAMS___GETSETDEF
#  define FUNCTION___TYPE_PARAMS___GETSETDEF {"__type_params__", (getter)function___type_params___get, (setter)function___type_params___set, function___type_params___DOCSTR},
#else
#  define FUNCTION___TYPE_PARAMS___GETSETDEF {"__type_params__", (getter)function___type_params___get, NULL, function___type_params___DOCSTR},
#endif

static TyObject *
function___type_params___get_impl(PyFunctionObject *self);

static TyObject *
function___type_params___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___type_params___get_impl((PyFunctionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(function___type_params___DOCSTR)
#  define function___type_params___DOCSTR NULL
#endif
#if defined(FUNCTION___TYPE_PARAMS___GETSETDEF)
#  undef FUNCTION___TYPE_PARAMS___GETSETDEF
#  define FUNCTION___TYPE_PARAMS___GETSETDEF {"__type_params__", (getter)function___type_params___get, (setter)function___type_params___set, function___type_params___DOCSTR},
#else
#  define FUNCTION___TYPE_PARAMS___GETSETDEF {"__type_params__", NULL, (setter)function___type_params___set, NULL},
#endif

static int
function___type_params___set_impl(PyFunctionObject *self, TyObject *value);

static int
function___type_params___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = function___type_params___set_impl((PyFunctionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(func_new__doc__,
"function(code, globals, name=None, argdefs=None, closure=None,\n"
"         kwdefaults=None)\n"
"--\n"
"\n"
"Create a function object.\n"
"\n"
"  code\n"
"    a code object\n"
"  globals\n"
"    the globals dictionary\n"
"  name\n"
"    a string that overrides the name from the code object\n"
"  argdefs\n"
"    a tuple that specifies the default argument values\n"
"  closure\n"
"    a tuple that supplies the bindings for free variables\n"
"  kwdefaults\n"
"    a dictionary that specifies the default keyword argument values");

static TyObject *
func_new_impl(TyTypeObject *type, PyCodeObject *code, TyObject *globals,
              TyObject *name, TyObject *defaults, TyObject *closure,
              TyObject *kwdefaults);

static TyObject *
func_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(code), &_Ty_ID(globals), &_Ty_ID(name), &_Ty_ID(argdefs), &_Ty_ID(closure), &_Ty_ID(kwdefaults), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"code", "globals", "name", "argdefs", "closure", "kwdefaults", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "function",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 2;
    PyCodeObject *code;
    TyObject *globals;
    TyObject *name = Ty_None;
    TyObject *defaults = Ty_None;
    TyObject *closure = Ty_None;
    TyObject *kwdefaults = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 2, /*maxpos*/ 6, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!PyObject_TypeCheck(fastargs[0], &TyCode_Type)) {
        _TyArg_BadArgument("function", "argument 'code'", (&TyCode_Type)->tp_name, fastargs[0]);
        goto exit;
    }
    code = (PyCodeObject *)fastargs[0];
    if (!TyDict_Check(fastargs[1])) {
        _TyArg_BadArgument("function", "argument 'globals'", "dict", fastargs[1]);
        goto exit;
    }
    globals = fastargs[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[2]) {
        name = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[3]) {
        defaults = fastargs[3];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[4]) {
        closure = fastargs[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    kwdefaults = fastargs[5];
skip_optional_pos:
    return_value = func_new_impl(type, code, globals, name, defaults, closure, kwdefaults);

exit:
    return return_value;
}
/*[clinic end generated code: output=12cb900088d41bdb input=a9049054013a1b77]*/
