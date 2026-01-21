/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(grp_getgrgid__doc__,
"getgrgid($module, /, id)\n"
"--\n"
"\n"
"Return the group database entry for the given numeric group ID.\n"
"\n"
"If id is not valid, raise KeyError.");

#define GRP_GETGRGID_METHODDEF    \
    {"getgrgid", _PyCFunction_CAST(grp_getgrgid), METH_FASTCALL|METH_KEYWORDS, grp_getgrgid__doc__},

static TyObject *
grp_getgrgid_impl(TyObject *module, TyObject *id);

static TyObject *
grp_getgrgid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(id), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"id", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getgrgid",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *id;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    id = args[0];
    return_value = grp_getgrgid_impl(module, id);

exit:
    return return_value;
}

TyDoc_STRVAR(grp_getgrnam__doc__,
"getgrnam($module, /, name)\n"
"--\n"
"\n"
"Return the group database entry for the given group name.\n"
"\n"
"If name is not valid, raise KeyError.");

#define GRP_GETGRNAM_METHODDEF    \
    {"getgrnam", _PyCFunction_CAST(grp_getgrnam), METH_FASTCALL|METH_KEYWORDS, grp_getgrnam__doc__},

static TyObject *
grp_getgrnam_impl(TyObject *module, TyObject *name);

static TyObject *
grp_getgrnam(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getgrnam",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *name;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("getgrnam", "argument 'name'", "str", args[0]);
        goto exit;
    }
    name = args[0];
    return_value = grp_getgrnam_impl(module, name);

exit:
    return return_value;
}

TyDoc_STRVAR(grp_getgrall__doc__,
"getgrall($module, /)\n"
"--\n"
"\n"
"Return a list of all available group entries, in arbitrary order.\n"
"\n"
"An entry whose name starts with \'+\' or \'-\' represents an instruction\n"
"to use YP/NIS and may not be accessible via getgrnam or getgrgid.");

#define GRP_GETGRALL_METHODDEF    \
    {"getgrall", (PyCFunction)grp_getgrall, METH_NOARGS, grp_getgrall__doc__},

static TyObject *
grp_getgrall_impl(TyObject *module);

static TyObject *
grp_getgrall(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return grp_getgrall_impl(module);
}
/*[clinic end generated code: output=35aa81c00dbd3229 input=a9049054013a1b77]*/
