/* Test version macros in the limited API */

#include "pyconfig.h"  // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030e0000  // Added in 3.14
#endif

#include "parts.h"
#include "clinic/version.c.h"
#include <stdio.h>

/*[clinic input]
module _testlimitedcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2700057f9c1135ba]*/

/*[clinic input]
_testlimitedcapi.pack_full_version

    major: int
    minor: int
    micro: int
    level: int
    serial: int
    /
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_pack_full_version_impl(TyObject *module, int major,
                                        int minor, int micro, int level,
                                        int serial)
/*[clinic end generated code: output=b87a1e9805648861 input=2a304423be61d2ac]*/
{
    uint32_t macro_result = Ty_PACK_FULL_VERSION(
        major, minor, micro, level, serial);
#undef Ty_PACK_FULL_VERSION
    uint32_t func_result = Ty_PACK_FULL_VERSION(
        major, minor, micro, level, serial);

    assert(macro_result == func_result);
    return TyLong_FromUnsignedLong((unsigned long)func_result);
}

/*[clinic input]
_testlimitedcapi.pack_version

    major: int
    minor: int
    /
[clinic start generated code]*/

static TyObject *
_testlimitedcapi_pack_version_impl(TyObject *module, int major, int minor)
/*[clinic end generated code: output=771247bbd06e7883 input=3e39e9dcbc09e86a]*/
{
    uint32_t macro_result = Ty_PACK_VERSION(major, minor);
#undef Ty_PACK_VERSION
    uint32_t func_result = Ty_PACK_VERSION(major, minor);

    assert(macro_result == func_result);
    return TyLong_FromUnsignedLong((unsigned long)func_result);
}

static TyMethodDef TestMethods[] = {
    _TESTLIMITEDCAPI_PACK_FULL_VERSION_METHODDEF
    _TESTLIMITEDCAPI_PACK_VERSION_METHODDEF
    {NULL},
};

int
_PyTestLimitedCAPI_Init_Version(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }
    return 0;
}
