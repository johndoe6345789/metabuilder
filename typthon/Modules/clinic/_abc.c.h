/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_abc__reset_registry__doc__,
"_reset_registry($module, self, /)\n"
"--\n"
"\n"
"Internal ABC helper to reset registry of a given class.\n"
"\n"
"Should be only used by refleak.py");

#define _ABC__RESET_REGISTRY_METHODDEF    \
    {"_reset_registry", (PyCFunction)_abc__reset_registry, METH_O, _abc__reset_registry__doc__},

TyDoc_STRVAR(_abc__reset_caches__doc__,
"_reset_caches($module, self, /)\n"
"--\n"
"\n"
"Internal ABC helper to reset both caches of a given class.\n"
"\n"
"Should be only used by refleak.py");

#define _ABC__RESET_CACHES_METHODDEF    \
    {"_reset_caches", (PyCFunction)_abc__reset_caches, METH_O, _abc__reset_caches__doc__},

TyDoc_STRVAR(_abc__get_dump__doc__,
"_get_dump($module, self, /)\n"
"--\n"
"\n"
"Internal ABC helper for cache and registry debugging.\n"
"\n"
"Return shallow copies of registry, of both caches, and\n"
"negative cache version. Don\'t call this function directly,\n"
"instead use ABC._dump_registry() for a nice repr.");

#define _ABC__GET_DUMP_METHODDEF    \
    {"_get_dump", (PyCFunction)_abc__get_dump, METH_O, _abc__get_dump__doc__},

TyDoc_STRVAR(_abc__abc_init__doc__,
"_abc_init($module, self, /)\n"
"--\n"
"\n"
"Internal ABC helper for class set-up. Should be never used outside abc module.");

#define _ABC__ABC_INIT_METHODDEF    \
    {"_abc_init", (PyCFunction)_abc__abc_init, METH_O, _abc__abc_init__doc__},

TyDoc_STRVAR(_abc__abc_register__doc__,
"_abc_register($module, self, subclass, /)\n"
"--\n"
"\n"
"Internal ABC helper for subclasss registration. Should be never used outside abc module.");

#define _ABC__ABC_REGISTER_METHODDEF    \
    {"_abc_register", _PyCFunction_CAST(_abc__abc_register), METH_FASTCALL, _abc__abc_register__doc__},

static TyObject *
_abc__abc_register_impl(TyObject *module, TyObject *self, TyObject *subclass);

static TyObject *
_abc__abc_register(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *self;
    TyObject *subclass;

    if (!_TyArg_CheckPositional("_abc_register", nargs, 2, 2)) {
        goto exit;
    }
    self = args[0];
    subclass = args[1];
    return_value = _abc__abc_register_impl(module, self, subclass);

exit:
    return return_value;
}

TyDoc_STRVAR(_abc__abc_instancecheck__doc__,
"_abc_instancecheck($module, self, instance, /)\n"
"--\n"
"\n"
"Internal ABC helper for instance checks. Should be never used outside abc module.");

#define _ABC__ABC_INSTANCECHECK_METHODDEF    \
    {"_abc_instancecheck", _PyCFunction_CAST(_abc__abc_instancecheck), METH_FASTCALL, _abc__abc_instancecheck__doc__},

static TyObject *
_abc__abc_instancecheck_impl(TyObject *module, TyObject *self,
                             TyObject *instance);

static TyObject *
_abc__abc_instancecheck(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *self;
    TyObject *instance;

    if (!_TyArg_CheckPositional("_abc_instancecheck", nargs, 2, 2)) {
        goto exit;
    }
    self = args[0];
    instance = args[1];
    return_value = _abc__abc_instancecheck_impl(module, self, instance);

exit:
    return return_value;
}

TyDoc_STRVAR(_abc__abc_subclasscheck__doc__,
"_abc_subclasscheck($module, self, subclass, /)\n"
"--\n"
"\n"
"Internal ABC helper for subclasss checks. Should be never used outside abc module.");

#define _ABC__ABC_SUBCLASSCHECK_METHODDEF    \
    {"_abc_subclasscheck", _PyCFunction_CAST(_abc__abc_subclasscheck), METH_FASTCALL, _abc__abc_subclasscheck__doc__},

static TyObject *
_abc__abc_subclasscheck_impl(TyObject *module, TyObject *self,
                             TyObject *subclass);

static TyObject *
_abc__abc_subclasscheck(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *self;
    TyObject *subclass;

    if (!_TyArg_CheckPositional("_abc_subclasscheck", nargs, 2, 2)) {
        goto exit;
    }
    self = args[0];
    subclass = args[1];
    return_value = _abc__abc_subclasscheck_impl(module, self, subclass);

exit:
    return return_value;
}

TyDoc_STRVAR(_abc_get_cache_token__doc__,
"get_cache_token($module, /)\n"
"--\n"
"\n"
"Returns the current ABC cache token.\n"
"\n"
"The token is an opaque object (supporting equality testing) identifying the\n"
"current version of the ABC cache for virtual subclasses. The token changes\n"
"with every call to register() on any ABC.");

#define _ABC_GET_CACHE_TOKEN_METHODDEF    \
    {"get_cache_token", (PyCFunction)_abc_get_cache_token, METH_NOARGS, _abc_get_cache_token__doc__},

static TyObject *
_abc_get_cache_token_impl(TyObject *module);

static TyObject *
_abc_get_cache_token(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _abc_get_cache_token_impl(module);
}
/*[clinic end generated code: output=1989b6716c950e17 input=a9049054013a1b77]*/
