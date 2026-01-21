/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(warnings_acquire_lock__doc__,
"_acquire_lock($module, /)\n"
"--\n"
"\n");

#define WARNINGS_ACQUIRE_LOCK_METHODDEF    \
    {"_acquire_lock", (PyCFunction)warnings_acquire_lock, METH_NOARGS, warnings_acquire_lock__doc__},

static TyObject *
warnings_acquire_lock_impl(TyObject *module);

static TyObject *
warnings_acquire_lock(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return warnings_acquire_lock_impl(module);
}

TyDoc_STRVAR(warnings_release_lock__doc__,
"_release_lock($module, /)\n"
"--\n"
"\n");

#define WARNINGS_RELEASE_LOCK_METHODDEF    \
    {"_release_lock", (PyCFunction)warnings_release_lock, METH_NOARGS, warnings_release_lock__doc__},

static TyObject *
warnings_release_lock_impl(TyObject *module);

static TyObject *
warnings_release_lock(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return warnings_release_lock_impl(module);
}

TyDoc_STRVAR(warnings_warn__doc__,
"warn($module, /, message, category=None, stacklevel=1, source=None, *,\n"
"     skip_file_prefixes=<unrepresentable>)\n"
"--\n"
"\n"
"Issue a warning, or maybe ignore it or raise an exception.\n"
"\n"
"  message\n"
"    Text of the warning message.\n"
"  category\n"
"    The Warning category subclass. Defaults to UserWarning.\n"
"  stacklevel\n"
"    How far up the call stack to make this warning appear. A value of 2 for\n"
"    example attributes the warning to the caller of the code calling warn().\n"
"  source\n"
"    If supplied, the destroyed object which emitted a ResourceWarning\n"
"  skip_file_prefixes\n"
"    An optional tuple of module filename prefixes indicating frames to skip\n"
"    during stacklevel computations for stack frame attribution.");

#define WARNINGS_WARN_METHODDEF    \
    {"warn", _PyCFunction_CAST(warnings_warn), METH_FASTCALL|METH_KEYWORDS, warnings_warn__doc__},

static TyObject *
warnings_warn_impl(TyObject *module, TyObject *message, TyObject *category,
                   Ty_ssize_t stacklevel, TyObject *source,
                   PyTupleObject *skip_file_prefixes);

static TyObject *
warnings_warn(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(message), &_Ty_ID(category), &_Ty_ID(stacklevel), &_Ty_ID(source), &_Ty_ID(skip_file_prefixes), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"message", "category", "stacklevel", "source", "skip_file_prefixes", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "warn",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *message;
    TyObject *category = Ty_None;
    Ty_ssize_t stacklevel = 1;
    TyObject *source = Ty_None;
    PyTupleObject *skip_file_prefixes = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    message = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        category = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        {
            Ty_ssize_t ival = -1;
            TyObject *iobj = _PyNumber_Index(args[2]);
            if (iobj != NULL) {
                ival = TyLong_AsSsize_t(iobj);
                Ty_DECREF(iobj);
            }
            if (ival == -1 && TyErr_Occurred()) {
                goto exit;
            }
            stacklevel = ival;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[3]) {
        source = args[3];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!TyTuple_Check(args[4])) {
        _TyArg_BadArgument("warn", "argument 'skip_file_prefixes'", "tuple", args[4]);
        goto exit;
    }
    skip_file_prefixes = (PyTupleObject *)args[4];
skip_optional_kwonly:
    return_value = warnings_warn_impl(module, message, category, stacklevel, source, skip_file_prefixes);

exit:
    return return_value;
}

TyDoc_STRVAR(warnings_warn_explicit__doc__,
"warn_explicit($module, /, message, category, filename, lineno,\n"
"              module=<unrepresentable>, registry=None,\n"
"              module_globals=None, source=None)\n"
"--\n"
"\n"
"Issue a warning, or maybe ignore it or raise an exception.");

#define WARNINGS_WARN_EXPLICIT_METHODDEF    \
    {"warn_explicit", _PyCFunction_CAST(warnings_warn_explicit), METH_FASTCALL|METH_KEYWORDS, warnings_warn_explicit__doc__},

static TyObject *
warnings_warn_explicit_impl(TyObject *module, TyObject *message,
                            TyObject *category, TyObject *filename,
                            int lineno, TyObject *mod, TyObject *registry,
                            TyObject *module_globals, TyObject *sourceobj);

static TyObject *
warnings_warn_explicit(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 8
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(message), &_Ty_ID(category), &_Ty_ID(filename), &_Ty_ID(lineno), &_Ty_ID(module), &_Ty_ID(registry), &_Ty_ID(module_globals), &_Ty_ID(source), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"message", "category", "filename", "lineno", "module", "registry", "module_globals", "source", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "warn_explicit",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[8];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 4;
    TyObject *message;
    TyObject *category;
    TyObject *filename;
    int lineno;
    TyObject *mod = NULL;
    TyObject *registry = Ty_None;
    TyObject *module_globals = Ty_None;
    TyObject *sourceobj = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 8, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    message = args[0];
    category = args[1];
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("warn_explicit", "argument 'filename'", "str", args[2]);
        goto exit;
    }
    filename = args[2];
    lineno = TyLong_AsInt(args[3]);
    if (lineno == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[4]) {
        mod = args[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[5]) {
        registry = args[5];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[6]) {
        module_globals = args[6];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    sourceobj = args[7];
skip_optional_pos:
    return_value = warnings_warn_explicit_impl(module, message, category, filename, lineno, mod, registry, module_globals, sourceobj);

exit:
    return return_value;
}

TyDoc_STRVAR(warnings_filters_mutated_lock_held__doc__,
"_filters_mutated_lock_held($module, /)\n"
"--\n"
"\n");

#define WARNINGS_FILTERS_MUTATED_LOCK_HELD_METHODDEF    \
    {"_filters_mutated_lock_held", (PyCFunction)warnings_filters_mutated_lock_held, METH_NOARGS, warnings_filters_mutated_lock_held__doc__},

static TyObject *
warnings_filters_mutated_lock_held_impl(TyObject *module);

static TyObject *
warnings_filters_mutated_lock_held(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return warnings_filters_mutated_lock_held_impl(module);
}
/*[clinic end generated code: output=610ed5764bf40bb5 input=a9049054013a1b77]*/
