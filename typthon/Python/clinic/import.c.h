/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_imp_lock_held__doc__,
"lock_held($module, /)\n"
"--\n"
"\n"
"Return True if the import lock is currently held, else False.\n"
"\n"
"On platforms without threads, return False.");

#define _IMP_LOCK_HELD_METHODDEF    \
    {"lock_held", (PyCFunction)_imp_lock_held, METH_NOARGS, _imp_lock_held__doc__},

static TyObject *
_imp_lock_held_impl(TyObject *module);

static TyObject *
_imp_lock_held(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _imp_lock_held_impl(module);
}

TyDoc_STRVAR(_imp_acquire_lock__doc__,
"acquire_lock($module, /)\n"
"--\n"
"\n"
"Acquires the interpreter\'s import lock for the current thread.\n"
"\n"
"This lock should be used by import hooks to ensure thread-safety when importing\n"
"modules. On platforms without threads, this function does nothing.");

#define _IMP_ACQUIRE_LOCK_METHODDEF    \
    {"acquire_lock", (PyCFunction)_imp_acquire_lock, METH_NOARGS, _imp_acquire_lock__doc__},

static TyObject *
_imp_acquire_lock_impl(TyObject *module);

static TyObject *
_imp_acquire_lock(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _imp_acquire_lock_impl(module);
}

TyDoc_STRVAR(_imp_release_lock__doc__,
"release_lock($module, /)\n"
"--\n"
"\n"
"Release the interpreter\'s import lock.\n"
"\n"
"On platforms without threads, this function does nothing.");

#define _IMP_RELEASE_LOCK_METHODDEF    \
    {"release_lock", (PyCFunction)_imp_release_lock, METH_NOARGS, _imp_release_lock__doc__},

static TyObject *
_imp_release_lock_impl(TyObject *module);

static TyObject *
_imp_release_lock(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _imp_release_lock_impl(module);
}

TyDoc_STRVAR(_imp__fix_co_filename__doc__,
"_fix_co_filename($module, code, path, /)\n"
"--\n"
"\n"
"Changes code.co_filename to specify the passed-in file path.\n"
"\n"
"  code\n"
"    Code object to change.\n"
"  path\n"
"    File path to use.");

#define _IMP__FIX_CO_FILENAME_METHODDEF    \
    {"_fix_co_filename", _PyCFunction_CAST(_imp__fix_co_filename), METH_FASTCALL, _imp__fix_co_filename__doc__},

static TyObject *
_imp__fix_co_filename_impl(TyObject *module, PyCodeObject *code,
                           TyObject *path);

static TyObject *
_imp__fix_co_filename(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    PyCodeObject *code;
    TyObject *path;

    if (!_TyArg_CheckPositional("_fix_co_filename", nargs, 2, 2)) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], &TyCode_Type)) {
        _TyArg_BadArgument("_fix_co_filename", "argument 1", (&TyCode_Type)->tp_name, args[0]);
        goto exit;
    }
    code = (PyCodeObject *)args[0];
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("_fix_co_filename", "argument 2", "str", args[1]);
        goto exit;
    }
    path = args[1];
    return_value = _imp__fix_co_filename_impl(module, code, path);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_create_builtin__doc__,
"create_builtin($module, spec, /)\n"
"--\n"
"\n"
"Create an extension module.");

#define _IMP_CREATE_BUILTIN_METHODDEF    \
    {"create_builtin", (PyCFunction)_imp_create_builtin, METH_O, _imp_create_builtin__doc__},

TyDoc_STRVAR(_imp_extension_suffixes__doc__,
"extension_suffixes($module, /)\n"
"--\n"
"\n"
"Returns the list of file suffixes used to identify extension modules.");

#define _IMP_EXTENSION_SUFFIXES_METHODDEF    \
    {"extension_suffixes", (PyCFunction)_imp_extension_suffixes, METH_NOARGS, _imp_extension_suffixes__doc__},

static TyObject *
_imp_extension_suffixes_impl(TyObject *module);

static TyObject *
_imp_extension_suffixes(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _imp_extension_suffixes_impl(module);
}

TyDoc_STRVAR(_imp_init_frozen__doc__,
"init_frozen($module, name, /)\n"
"--\n"
"\n"
"Initializes a frozen module.");

#define _IMP_INIT_FROZEN_METHODDEF    \
    {"init_frozen", (PyCFunction)_imp_init_frozen, METH_O, _imp_init_frozen__doc__},

static TyObject *
_imp_init_frozen_impl(TyObject *module, TyObject *name);

static TyObject *
_imp_init_frozen(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("init_frozen", "argument", "str", arg);
        goto exit;
    }
    name = arg;
    return_value = _imp_init_frozen_impl(module, name);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_find_frozen__doc__,
"find_frozen($module, name, /, *, withdata=False)\n"
"--\n"
"\n"
"Return info about the corresponding frozen module (if there is one) or None.\n"
"\n"
"The returned info (a 2-tuple):\n"
"\n"
" * data         the raw marshalled bytes\n"
" * is_package   whether or not it is a package\n"
" * origname     the originally frozen module\'s name, or None if not\n"
"                a stdlib module (this will usually be the same as\n"
"                the module\'s current name)");

#define _IMP_FIND_FROZEN_METHODDEF    \
    {"find_frozen", _PyCFunction_CAST(_imp_find_frozen), METH_FASTCALL|METH_KEYWORDS, _imp_find_frozen__doc__},

static TyObject *
_imp_find_frozen_impl(TyObject *module, TyObject *name, int withdata);

static TyObject *
_imp_find_frozen(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(withdata), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "withdata", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "find_frozen",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *name;
    int withdata = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("find_frozen", "argument 1", "str", args[0]);
        goto exit;
    }
    name = args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    withdata = PyObject_IsTrue(args[1]);
    if (withdata < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = _imp_find_frozen_impl(module, name, withdata);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_get_frozen_object__doc__,
"get_frozen_object($module, name, data=None, /)\n"
"--\n"
"\n"
"Create a code object for a frozen module.");

#define _IMP_GET_FROZEN_OBJECT_METHODDEF    \
    {"get_frozen_object", _PyCFunction_CAST(_imp_get_frozen_object), METH_FASTCALL, _imp_get_frozen_object__doc__},

static TyObject *
_imp_get_frozen_object_impl(TyObject *module, TyObject *name,
                            TyObject *dataobj);

static TyObject *
_imp_get_frozen_object(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *name;
    TyObject *dataobj = Ty_None;

    if (!_TyArg_CheckPositional("get_frozen_object", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("get_frozen_object", "argument 1", "str", args[0]);
        goto exit;
    }
    name = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    dataobj = args[1];
skip_optional:
    return_value = _imp_get_frozen_object_impl(module, name, dataobj);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_is_frozen_package__doc__,
"is_frozen_package($module, name, /)\n"
"--\n"
"\n"
"Returns True if the module name is of a frozen package.");

#define _IMP_IS_FROZEN_PACKAGE_METHODDEF    \
    {"is_frozen_package", (PyCFunction)_imp_is_frozen_package, METH_O, _imp_is_frozen_package__doc__},

static TyObject *
_imp_is_frozen_package_impl(TyObject *module, TyObject *name);

static TyObject *
_imp_is_frozen_package(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("is_frozen_package", "argument", "str", arg);
        goto exit;
    }
    name = arg;
    return_value = _imp_is_frozen_package_impl(module, name);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_is_builtin__doc__,
"is_builtin($module, name, /)\n"
"--\n"
"\n"
"Returns True if the module name corresponds to a built-in module.");

#define _IMP_IS_BUILTIN_METHODDEF    \
    {"is_builtin", (PyCFunction)_imp_is_builtin, METH_O, _imp_is_builtin__doc__},

static TyObject *
_imp_is_builtin_impl(TyObject *module, TyObject *name);

static TyObject *
_imp_is_builtin(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("is_builtin", "argument", "str", arg);
        goto exit;
    }
    name = arg;
    return_value = _imp_is_builtin_impl(module, name);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_is_frozen__doc__,
"is_frozen($module, name, /)\n"
"--\n"
"\n"
"Returns True if the module name corresponds to a frozen module.");

#define _IMP_IS_FROZEN_METHODDEF    \
    {"is_frozen", (PyCFunction)_imp_is_frozen, METH_O, _imp_is_frozen__doc__},

static TyObject *
_imp_is_frozen_impl(TyObject *module, TyObject *name);

static TyObject *
_imp_is_frozen(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("is_frozen", "argument", "str", arg);
        goto exit;
    }
    name = arg;
    return_value = _imp_is_frozen_impl(module, name);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp__frozen_module_names__doc__,
"_frozen_module_names($module, /)\n"
"--\n"
"\n"
"Returns the list of available frozen modules.");

#define _IMP__FROZEN_MODULE_NAMES_METHODDEF    \
    {"_frozen_module_names", (PyCFunction)_imp__frozen_module_names, METH_NOARGS, _imp__frozen_module_names__doc__},

static TyObject *
_imp__frozen_module_names_impl(TyObject *module);

static TyObject *
_imp__frozen_module_names(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _imp__frozen_module_names_impl(module);
}

TyDoc_STRVAR(_imp__override_frozen_modules_for_tests__doc__,
"_override_frozen_modules_for_tests($module, override, /)\n"
"--\n"
"\n"
"(internal-only) Override TyConfig.use_frozen_modules.\n"
"\n"
"(-1: \"off\", 1: \"on\", 0: no override)\n"
"See frozen_modules() in Lib/test/support/import_helper.py.");

#define _IMP__OVERRIDE_FROZEN_MODULES_FOR_TESTS_METHODDEF    \
    {"_override_frozen_modules_for_tests", (PyCFunction)_imp__override_frozen_modules_for_tests, METH_O, _imp__override_frozen_modules_for_tests__doc__},

static TyObject *
_imp__override_frozen_modules_for_tests_impl(TyObject *module, int override);

static TyObject *
_imp__override_frozen_modules_for_tests(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int override;

    override = TyLong_AsInt(arg);
    if (override == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _imp__override_frozen_modules_for_tests_impl(module, override);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp__override_multi_interp_extensions_check__doc__,
"_override_multi_interp_extensions_check($module, override, /)\n"
"--\n"
"\n"
"(internal-only) Override PyInterpreterConfig.check_multi_interp_extensions.\n"
"\n"
"(-1: \"never\", 1: \"always\", 0: no override)");

#define _IMP__OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK_METHODDEF    \
    {"_override_multi_interp_extensions_check", (PyCFunction)_imp__override_multi_interp_extensions_check, METH_O, _imp__override_multi_interp_extensions_check__doc__},

static TyObject *
_imp__override_multi_interp_extensions_check_impl(TyObject *module,
                                                  int override);

static TyObject *
_imp__override_multi_interp_extensions_check(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int override;

    override = TyLong_AsInt(arg);
    if (override == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _imp__override_multi_interp_extensions_check_impl(module, override);

exit:
    return return_value;
}

#if defined(HAVE_DYNAMIC_LOADING)

TyDoc_STRVAR(_imp_create_dynamic__doc__,
"create_dynamic($module, spec, file=<unrepresentable>, /)\n"
"--\n"
"\n"
"Create an extension module.");

#define _IMP_CREATE_DYNAMIC_METHODDEF    \
    {"create_dynamic", _PyCFunction_CAST(_imp_create_dynamic), METH_FASTCALL, _imp_create_dynamic__doc__},

static TyObject *
_imp_create_dynamic_impl(TyObject *module, TyObject *spec, TyObject *file);

static TyObject *
_imp_create_dynamic(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *spec;
    TyObject *file = NULL;

    if (!_TyArg_CheckPositional("create_dynamic", nargs, 1, 2)) {
        goto exit;
    }
    spec = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    file = args[1];
skip_optional:
    return_value = _imp_create_dynamic_impl(module, spec, file);

exit:
    return return_value;
}

#endif /* defined(HAVE_DYNAMIC_LOADING) */

#if defined(HAVE_DYNAMIC_LOADING)

TyDoc_STRVAR(_imp_exec_dynamic__doc__,
"exec_dynamic($module, mod, /)\n"
"--\n"
"\n"
"Initialize an extension module.");

#define _IMP_EXEC_DYNAMIC_METHODDEF    \
    {"exec_dynamic", (PyCFunction)_imp_exec_dynamic, METH_O, _imp_exec_dynamic__doc__},

static int
_imp_exec_dynamic_impl(TyObject *module, TyObject *mod);

static TyObject *
_imp_exec_dynamic(TyObject *module, TyObject *mod)
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = _imp_exec_dynamic_impl(module, mod);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_DYNAMIC_LOADING) */

TyDoc_STRVAR(_imp_exec_builtin__doc__,
"exec_builtin($module, mod, /)\n"
"--\n"
"\n"
"Initialize a built-in module.");

#define _IMP_EXEC_BUILTIN_METHODDEF    \
    {"exec_builtin", (PyCFunction)_imp_exec_builtin, METH_O, _imp_exec_builtin__doc__},

static int
_imp_exec_builtin_impl(TyObject *module, TyObject *mod);

static TyObject *
_imp_exec_builtin(TyObject *module, TyObject *mod)
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = _imp_exec_builtin_impl(module, mod);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_imp_source_hash__doc__,
"source_hash($module, /, key, source)\n"
"--\n"
"\n");

#define _IMP_SOURCE_HASH_METHODDEF    \
    {"source_hash", _PyCFunction_CAST(_imp_source_hash), METH_FASTCALL|METH_KEYWORDS, _imp_source_hash__doc__},

static TyObject *
_imp_source_hash_impl(TyObject *module, long key, Ty_buffer *source);

static TyObject *
_imp_source_hash(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(source), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "source", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "source_hash",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    long key;
    Ty_buffer source = {NULL, NULL};

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    key = TyLong_AsLong(args[0]);
    if (key == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &source, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _imp_source_hash_impl(module, key, &source);

exit:
    /* Cleanup for source */
    if (source.obj) {
       PyBuffer_Release(&source);
    }

    return return_value;
}

#ifndef _IMP_CREATE_DYNAMIC_METHODDEF
    #define _IMP_CREATE_DYNAMIC_METHODDEF
#endif /* !defined(_IMP_CREATE_DYNAMIC_METHODDEF) */

#ifndef _IMP_EXEC_DYNAMIC_METHODDEF
    #define _IMP_EXEC_DYNAMIC_METHODDEF
#endif /* !defined(_IMP_EXEC_DYNAMIC_METHODDEF) */
/*[clinic end generated code: output=24f597d6b0f3feed input=a9049054013a1b77]*/
