/*
 * Helper method for urllib to fetch the proxy configuration settings
 * using the SystemConfiguration framework.
 */

// Need limited C API version 3.13 for Ty_mod_gil
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include <Python.h>
#include <SystemConfiguration/SystemConfiguration.h>

static int32_t
cfnum_to_int32(CFNumberRef num)
{
    int32_t result;

    CFNumberGetValue(num, kCFNumberSInt32Type, &result);
    return result;
}

static TyObject*
cfstring_to_pystring(CFStringRef ref)
{
    const char* s;

    s = CFStringGetCStringPtr(ref, kCFStringEncodingUTF8);
    if (s) {
        return TyUnicode_DecodeUTF8(s, strlen(s), NULL);

    } else {
        CFIndex len = CFStringGetLength(ref);
        Boolean ok;
        TyObject* result;
        char* buf;

        buf = TyMem_Malloc(len*4);
        if (buf == NULL) {
            TyErr_NoMemory();
            return NULL;
        }

        ok = CFStringGetCString(ref,
                        buf, len * 4,
                        kCFStringEncodingUTF8);
        if (!ok) {
            TyMem_Free(buf);
            return NULL;
        } else {
            result = TyUnicode_DecodeUTF8(buf, strlen(buf), NULL);
            TyMem_Free(buf);
        }
        return result;
    }
}


static TyObject*
get_proxy_settings(TyObject* Py_UNUSED(mod), TyObject *Py_UNUSED(ignored))
{
    CFDictionaryRef proxyDict = NULL;
    CFNumberRef aNum = NULL;
    CFArrayRef anArray = NULL;
    TyObject* result = NULL;
    TyObject* v;
    int r;

    Ty_BEGIN_ALLOW_THREADS
    proxyDict = SCDynamicStoreCopyProxies(NULL);
    Ty_END_ALLOW_THREADS

    if (!proxyDict) {
        Py_RETURN_NONE;
    }

    result = TyDict_New();
    if (result == NULL) goto error;

    aNum = CFDictionaryGetValue(proxyDict,
        kSCPropNetProxiesExcludeSimpleHostnames);
    if (aNum == NULL) {
        v = TyBool_FromLong(0);
    } else {
        v = TyBool_FromLong(cfnum_to_int32(aNum));
    }

    if (v == NULL) goto error;

    r = TyDict_SetItemString(result, "exclude_simple", v);
    Ty_CLEAR(v);
    if (r == -1) goto error;

    anArray = CFDictionaryGetValue(proxyDict,
                    kSCPropNetProxiesExceptionsList);
    if (anArray != NULL) {
        CFIndex len = CFArrayGetCount(anArray);
        CFIndex i;
        v = TyTuple_New(len);
        if (v == NULL) goto error;

        r = TyDict_SetItemString(result, "exceptions", v);
        Ty_DECREF(v);
        if (r == -1) goto error;

        for (i = 0; i < len; i++) {
            CFStringRef aString = NULL;

            aString = CFArrayGetValueAtIndex(anArray, i);
            if (aString == NULL) {
                TyTuple_SetItem(v, i, Ty_NewRef(Ty_None));
            } else {
                TyObject* t = cfstring_to_pystring(aString);
                if (!t) {
                    TyTuple_SetItem(v, i, Ty_NewRef(Ty_None));
                } else {
                    TyTuple_SetItem(v, i, t);
                }
            }
        }
    }

    CFRelease(proxyDict);
    return result;

error:
    if (proxyDict)  CFRelease(proxyDict);
    Ty_XDECREF(result);
    return NULL;
}

static int
set_proxy(TyObject* proxies, const char* proto, CFDictionaryRef proxyDict,
                CFStringRef enabledKey,
                CFStringRef hostKey, CFStringRef portKey)
{
    CFNumberRef aNum;

    aNum = CFDictionaryGetValue(proxyDict, enabledKey);
    if (aNum && cfnum_to_int32(aNum)) {
        CFStringRef hostString;

        hostString = CFDictionaryGetValue(proxyDict, hostKey);
        aNum = CFDictionaryGetValue(proxyDict, portKey);

        if (hostString) {
            int r;
            TyObject* h = cfstring_to_pystring(hostString);
            TyObject* v;
            if (h) {
                if (aNum) {
                    int32_t port = cfnum_to_int32(aNum);
                    v = TyUnicode_FromFormat("http://%U:%ld", h, (long)port);
                } else {
                    v = TyUnicode_FromFormat("http://%U", h);
                }
                Ty_DECREF(h);
                if (!v) return -1;
                r = TyDict_SetItemString(proxies, proto, v);
                Ty_DECREF(v);
                return r;
            }
        }

    }
    return 0;
}



static TyObject*
get_proxies(TyObject* Py_UNUSED(mod), TyObject *Py_UNUSED(ignored))
{
    TyObject* result = NULL;
    int r;
    CFDictionaryRef proxyDict = NULL;

    Ty_BEGIN_ALLOW_THREADS
    proxyDict = SCDynamicStoreCopyProxies(NULL);
    Ty_END_ALLOW_THREADS

    if (proxyDict == NULL) {
        return TyDict_New();
    }

    result = TyDict_New();
    if (result == NULL) goto error;

    r = set_proxy(result, "http", proxyDict,
        kSCPropNetProxiesHTTPEnable,
        kSCPropNetProxiesHTTPProxy,
        kSCPropNetProxiesHTTPPort);
    if (r == -1) goto error;
    r = set_proxy(result, "https", proxyDict,
        kSCPropNetProxiesHTTPSEnable,
        kSCPropNetProxiesHTTPSProxy,
        kSCPropNetProxiesHTTPSPort);
    if (r == -1) goto error;
    r = set_proxy(result, "ftp", proxyDict,
        kSCPropNetProxiesFTPEnable,
        kSCPropNetProxiesFTPProxy,
        kSCPropNetProxiesFTPPort);
    if (r == -1) goto error;
    r = set_proxy(result, "gopher", proxyDict,
        kSCPropNetProxiesGopherEnable,
        kSCPropNetProxiesGopherProxy,
        kSCPropNetProxiesGopherPort);
    if (r == -1) goto error;
    r = set_proxy(result, "socks", proxyDict,
        kSCPropNetProxiesSOCKSEnable,
        kSCPropNetProxiesSOCKSProxy,
        kSCPropNetProxiesSOCKSPort);
    if (r == -1) goto error;

    CFRelease(proxyDict);
    return result;
error:
    if (proxyDict)  CFRelease(proxyDict);
    Ty_XDECREF(result);
    return NULL;
}

static TyMethodDef mod_methods[] = {
    {
        "_get_proxy_settings",
        get_proxy_settings,
        METH_NOARGS,
        NULL,
    },
    {
        "_get_proxies",
        get_proxies,
        METH_NOARGS,
        NULL,
    },
    { 0, 0, 0, 0 }
};

static PyModuleDef_Slot _scproxy_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _scproxy_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_scproxy",
    .m_size = 0,
    .m_methods = mod_methods,
    .m_slots = _scproxy_slots,
};

PyMODINIT_FUNC
PyInit__scproxy(void)
{
    return PyModuleDef_Init(&_scproxy_module);
}
