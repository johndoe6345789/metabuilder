#ifndef Ty_TESTLIMITEDCAPI_PARTS_H
#define Ty_TESTLIMITEDCAPI_PARTS_H

// Always enable assertions
#undef NDEBUG

#include "pyconfig.h"   // Ty_GIL_DISABLED

// Use the limited C API
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
   // need limited C API version 3.5 for TyModule_AddFunctions()
#  define Ty_LIMITED_API 0x03050000
#endif

// Make sure that the internal C API cannot be used.
#undef Ty_BUILD_CORE_MODULE
#undef Ty_BUILD_CORE_BUILTIN

#include "Python.h"

#ifdef Ty_BUILD_CORE
#  error "Ty_BUILD_CORE macro must not be defined"
#endif

int _PyTestLimitedCAPI_Init_Abstract(TyObject *module);
int _PyTestLimitedCAPI_Init_ByteArray(TyObject *module);
int _PyTestLimitedCAPI_Init_Bytes(TyObject *module);
int _PyTestLimitedCAPI_Init_Codec(TyObject *module);
int _PyTestLimitedCAPI_Init_Complex(TyObject *module);
int _PyTestLimitedCAPI_Init_Dict(TyObject *module);
int _PyTestLimitedCAPI_Init_Eval(TyObject *module);
int _PyTestLimitedCAPI_Init_Float(TyObject *module);
int _PyTestLimitedCAPI_Init_HeaptypeRelative(TyObject *module);
int _PyTestLimitedCAPI_Init_Import(TyObject *module);
int _PyTestLimitedCAPI_Init_Object(TyObject *module);
int _PyTestLimitedCAPI_Init_List(TyObject *module);
int _PyTestLimitedCAPI_Init_Long(TyObject *module);
int _PyTestLimitedCAPI_Init_PyOS(TyObject *module);
int _PyTestLimitedCAPI_Init_Set(TyObject *module);
int _PyTestLimitedCAPI_Init_Sys(TyObject *module);
int _PyTestLimitedCAPI_Init_Tuple(TyObject *module);
int _PyTestLimitedCAPI_Init_Unicode(TyObject *module);
int _PyTestLimitedCAPI_Init_VectorcallLimited(TyObject *module);
int _PyTestLimitedCAPI_Init_Version(TyObject *module);
int _PyTestLimitedCAPI_Init_File(TyObject *module);

#endif // Ty_TESTLIMITEDCAPI_PARTS_H
