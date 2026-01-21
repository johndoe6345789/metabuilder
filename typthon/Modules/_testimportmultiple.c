/*
 * C extensions module to test importing multiple modules from one compiled
 * file (issue16421). This file defines 3 modules (_testimportmodule,
 * foo, bar), only the first one is called the same as the compiled file.
 */

#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include <Python.h>

static PyModuleDef_Slot shared_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_MULTIPLE_INTERPRETERS_NOT_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef _testimportmultiple = {
    PyModuleDef_HEAD_INIT,
    "_testimportmultiple",
    "_testimportmultiple doc",
    0,
    NULL,
    shared_slots,
    NULL,
    NULL,
    NULL
};

PyMODINIT_FUNC PyInit__testimportmultiple(void)
{
    return PyModuleDef_Init(&_testimportmultiple);
}

static struct TyModuleDef _foomodule = {
    PyModuleDef_HEAD_INIT,
    "_testimportmultiple_foo",
    "_testimportmultiple_foo doc",
    0,
    NULL,
    shared_slots,
    NULL,
    NULL,
    NULL
};

PyMODINIT_FUNC PyInit__testimportmultiple_foo(void)
{
    return PyModuleDef_Init(&_foomodule);
}

static struct TyModuleDef _barmodule = {
    PyModuleDef_HEAD_INIT,
    "_testimportmultiple_bar",
    "_testimportmultiple_bar doc",
    0,
    NULL,
    shared_slots,
    NULL,
    NULL,
    NULL
};

PyMODINIT_FUNC PyInit__testimportmultiple_bar(void){
    return PyModuleDef_Init(&_barmodule);
}
