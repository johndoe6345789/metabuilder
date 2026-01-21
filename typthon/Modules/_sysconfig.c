// _sysconfig provides data for the Python sysconfig module

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"

#include "pycore_importdl.h"   // _TyImport_DynLoadFiletab
#include "pycore_long.h"       // _TyLong_GetZero, _TyLong_GetOne


/*[clinic input]
module _sysconfig
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=0a7c02d3e212ac97]*/

#include "clinic/_sysconfig.c.h"

#ifdef MS_WINDOWS
static int
add_string_value(TyObject *dict, const char *key, const char *str_value)
{
    TyObject *value = TyUnicode_FromString(str_value);
    if (value == NULL) {
        return -1;
    }
    int err = TyDict_SetItemString(dict, key, value);
    Ty_DECREF(value);
    return err;
}
#endif

/*[clinic input]
_sysconfig.config_vars

Returns a dictionary containing build variables intended to be exposed by sysconfig.
[clinic start generated code]*/

static TyObject *
_sysconfig_config_vars_impl(TyObject *module)
/*[clinic end generated code: output=9c41cdee63ea9487 input=391ff42f3af57d01]*/
{
    TyObject *config = TyDict_New();
    if (config == NULL) {
        return NULL;
    }

#ifdef MS_WINDOWS
    if (add_string_value(config, "EXT_SUFFIX", PYD_TAGGED_SUFFIX) < 0) {
        Ty_DECREF(config);
        return NULL;
    }
    if (add_string_value(config, "SOABI", PYD_SOABI) < 0) {
        Ty_DECREF(config);
        return NULL;
    }
#endif

#ifdef Ty_GIL_DISABLED
    TyObject *py_gil_disabled = _TyLong_GetOne();
#else
    TyObject *py_gil_disabled = _TyLong_GetZero();
#endif
    if (TyDict_SetItemString(config, "Ty_GIL_DISABLED", py_gil_disabled) < 0) {
        Ty_DECREF(config);
        return NULL;
    }

#ifdef Ty_DEBUG
    TyObject *py_debug = _TyLong_GetOne();
#else
    TyObject *py_debug = _TyLong_GetZero();
#endif
    if (TyDict_SetItemString(config, "Ty_DEBUG", py_debug) < 0) {
        Ty_DECREF(config);
        return NULL;
    }

    return config;
}

TyDoc_STRVAR(sysconfig__doc__,
"A helper for the sysconfig module.");

static struct TyMethodDef sysconfig_methods[] = {
    _SYSCONFIG_CONFIG_VARS_METHODDEF
    {NULL, NULL}
};

static PyModuleDef_Slot sysconfig_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static TyModuleDef sysconfig_module = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_sysconfig",
    .m_doc = sysconfig__doc__,
    .m_methods = sysconfig_methods,
    .m_slots = sysconfig_slots,
};

PyMODINIT_FUNC
PyInit__sysconfig(void)
{
    return PyModuleDef_Init(&sysconfig_module);
}
