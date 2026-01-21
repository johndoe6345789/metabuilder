/*
 * Python UUID module that wraps libuuid or Windows rpcrt4.dll.
 * DCE compatible Universally Unique Identifier library.
 */

// Need limited C API version 3.13 for Ty_mod_gil
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "Python.h"
#if defined(HAVE_UUID_H)
  // AIX, FreeBSD, libuuid with pkgconf
  #include <uuid.h>
#elif defined(HAVE_UUID_UUID_H)
  // libuuid without pkgconf
  #include <uuid/uuid.h>
#endif

#ifdef MS_WINDOWS
#include <rpc.h>
#endif

#ifndef MS_WINDOWS

static TyObject *
py_uuid_generate_time_safe(TyObject *Py_UNUSED(context),
                           TyObject *Py_UNUSED(ignored))
{
    uuid_t uuid;
#ifdef HAVE_UUID_GENERATE_TIME_SAFE
    int res;

    res = uuid_generate_time_safe(uuid);
    return Ty_BuildValue("y#i", (const char *) uuid, sizeof(uuid), res);
#elif defined(HAVE_UUID_CREATE)
    uint32_t status;
    uuid_create(&uuid, &status);
# if defined(HAVE_UUID_ENC_BE)
    unsigned char buf[sizeof(uuid)];
    uuid_enc_be(buf, &uuid);
    return Ty_BuildValue("y#i", buf, sizeof(uuid), (int) status);
# else
    return Ty_BuildValue("y#i", (const char *) &uuid, sizeof(uuid), (int) status);
# endif /* HAVE_UUID_CREATE */
#else /* HAVE_UUID_GENERATE_TIME_SAFE */
    uuid_generate_time(uuid);
    return Ty_BuildValue("y#O", (const char *) uuid, sizeof(uuid), Ty_None);
#endif /* HAVE_UUID_GENERATE_TIME_SAFE */
}

#else /* MS_WINDOWS */

static TyObject *
py_UuidCreate(TyObject *Py_UNUSED(context),
              TyObject *Py_UNUSED(ignored))
{
    UUID uuid;
    RPC_STATUS res;

    Ty_BEGIN_ALLOW_THREADS
    res = UuidCreateSequential(&uuid);
    Ty_END_ALLOW_THREADS

    switch (res) {
    case RPC_S_OK:
    case RPC_S_UUID_LOCAL_ONLY:
    case RPC_S_UUID_NO_ADDRESS:
        /*
        All success codes, but the latter two indicate that the UUID is random
        rather than based on the MAC address. If the OS can't figure this out,
        neither can we, so we'll take it anyway.
        */
        return Ty_BuildValue("y#", (const char *)&uuid, sizeof(uuid));
    }
    TyErr_SetFromWindowsErr(res);
    return NULL;
}

static int
py_windows_has_stable_node(void)
{
    UUID uuid;
    RPC_STATUS res;
    Ty_BEGIN_ALLOW_THREADS
    res = UuidCreateSequential(&uuid);
    Ty_END_ALLOW_THREADS
    return res == RPC_S_OK;
}
#endif /* MS_WINDOWS */


static int
uuid_exec(TyObject *module)
{
#define ADD_INT(NAME, VALUE)                                        \
    do {                                                            \
        if (TyModule_AddIntConstant(module, (NAME), (VALUE)) < 0) { \
           return -1;                                               \
        }                                                           \
    } while (0)

    assert(sizeof(uuid_t) == 16);
#if defined(MS_WINDOWS)
    ADD_INT("has_uuid_generate_time_safe", 0);
#elif defined(HAVE_UUID_GENERATE_TIME_SAFE)
    ADD_INT("has_uuid_generate_time_safe", 1);
#else
    ADD_INT("has_uuid_generate_time_safe", 0);
#endif

#if defined(MS_WINDOWS)
    ADD_INT("has_stable_extractable_node", py_windows_has_stable_node());
#elif defined(HAVE_UUID_GENERATE_TIME_SAFE_STABLE_MAC)
    ADD_INT("has_stable_extractable_node", 1);
#else
    ADD_INT("has_stable_extractable_node", 0);
#endif

#undef ADD_INT
    return 0;
}

static TyMethodDef uuid_methods[] = {
#if defined(HAVE_UUID_UUID_H) || defined(HAVE_UUID_H)
    {"generate_time_safe", py_uuid_generate_time_safe, METH_NOARGS, NULL},
#endif
#if defined(MS_WINDOWS)
    {"UuidCreate", py_UuidCreate, METH_NOARGS, NULL},
#endif
    {NULL, NULL, 0, NULL}           /* sentinel */
};

static PyModuleDef_Slot uuid_slots[] = {
    {Ty_mod_exec, uuid_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef uuidmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_uuid",
    .m_size = 0,
    .m_methods = uuid_methods,
    .m_slots = uuid_slots,
};

PyMODINIT_FUNC
PyInit__uuid(void)
{
    return PyModuleDef_Init(&uuidmodule);
}
