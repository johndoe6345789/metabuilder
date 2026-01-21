/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_testmultiphase_StateAccessType_get_defining_module__doc__,
"get_defining_module($self, /)\n"
"--\n"
"\n"
"Return the module of the defining class.\n"
"\n"
"Also tests that result of TyType_GetModuleByDef matches defining_class\'s\n"
"module.");

#define _TESTMULTIPHASE_STATEACCESSTYPE_GET_DEFINING_MODULE_METHODDEF    \
    {"get_defining_module", _PyCFunction_CAST(_testmultiphase_StateAccessType_get_defining_module), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testmultiphase_StateAccessType_get_defining_module__doc__},

static TyObject *
_testmultiphase_StateAccessType_get_defining_module_impl(StateAccessTypeObject *self,
                                                         TyTypeObject *cls);

static TyObject *
_testmultiphase_StateAccessType_get_defining_module(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "get_defining_module() takes no arguments");
        return NULL;
    }
    return _testmultiphase_StateAccessType_get_defining_module_impl((StateAccessTypeObject *)self, cls);
}

TyDoc_STRVAR(_testmultiphase_StateAccessType_getmodulebydef_bad_def__doc__,
"getmodulebydef_bad_def($self, /)\n"
"--\n"
"\n"
"Test that result of TyType_GetModuleByDef with a bad def is NULL.");

#define _TESTMULTIPHASE_STATEACCESSTYPE_GETMODULEBYDEF_BAD_DEF_METHODDEF    \
    {"getmodulebydef_bad_def", _PyCFunction_CAST(_testmultiphase_StateAccessType_getmodulebydef_bad_def), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testmultiphase_StateAccessType_getmodulebydef_bad_def__doc__},

static TyObject *
_testmultiphase_StateAccessType_getmodulebydef_bad_def_impl(StateAccessTypeObject *self,
                                                            TyTypeObject *cls);

static TyObject *
_testmultiphase_StateAccessType_getmodulebydef_bad_def(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "getmodulebydef_bad_def() takes no arguments");
        return NULL;
    }
    return _testmultiphase_StateAccessType_getmodulebydef_bad_def_impl((StateAccessTypeObject *)self, cls);
}

TyDoc_STRVAR(_testmultiphase_StateAccessType_increment_count_clinic__doc__,
"increment_count_clinic($self, /, n=1, *, twice=False)\n"
"--\n"
"\n"
"Add \'n\' from the module-state counter.\n"
"\n"
"Pass \'twice\' to double that amount.\n"
"\n"
"This tests Argument Clinic support for defining_class.");

#define _TESTMULTIPHASE_STATEACCESSTYPE_INCREMENT_COUNT_CLINIC_METHODDEF    \
    {"increment_count_clinic", _PyCFunction_CAST(_testmultiphase_StateAccessType_increment_count_clinic), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testmultiphase_StateAccessType_increment_count_clinic__doc__},

static TyObject *
_testmultiphase_StateAccessType_increment_count_clinic_impl(StateAccessTypeObject *self,
                                                            TyTypeObject *cls,
                                                            int n, int twice);

static TyObject *
_testmultiphase_StateAccessType_increment_count_clinic(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { _Ty_LATIN1_CHR('n'), &_Ty_ID(twice), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"n", "twice", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "increment_count_clinic",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int n = 1;
    int twice = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        n = TyLong_AsInt(args[0]);
        if (n == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    twice = PyObject_IsTrue(args[1]);
    if (twice < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = _testmultiphase_StateAccessType_increment_count_clinic_impl((StateAccessTypeObject *)self, cls, n, twice);

exit:
    return return_value;
}

TyDoc_STRVAR(_testmultiphase_StateAccessType_get_count__doc__,
"get_count($self, /)\n"
"--\n"
"\n"
"Return the value of the module-state counter.");

#define _TESTMULTIPHASE_STATEACCESSTYPE_GET_COUNT_METHODDEF    \
    {"get_count", _PyCFunction_CAST(_testmultiphase_StateAccessType_get_count), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _testmultiphase_StateAccessType_get_count__doc__},

static TyObject *
_testmultiphase_StateAccessType_get_count_impl(StateAccessTypeObject *self,
                                               TyTypeObject *cls);

static TyObject *
_testmultiphase_StateAccessType_get_count(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "get_count() takes no arguments");
        return NULL;
    }
    return _testmultiphase_StateAccessType_get_count_impl((StateAccessTypeObject *)self, cls);
}
/*[clinic end generated code: output=8eed2f14292ec986 input=a9049054013a1b77]*/
