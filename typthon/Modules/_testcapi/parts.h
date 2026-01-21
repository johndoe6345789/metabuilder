#ifndef Ty_TESTCAPI_PARTS_H
#define Ty_TESTCAPI_PARTS_H

// Always enable assertions
#undef NDEBUG

#ifdef PYTESTCAPI_NEED_INTERNAL_API
#  ifndef Ty_BUILD_CORE_BUILTIN
#    define Ty_BUILD_CORE_MODULE 1
#  endif
#else
   // The _testcapi extension tests the public C API: header files in Include/
   // and Include/cpython/ directories. The internal C API must not be tested
   // by _testcapi: use _testinternalcapi for that.
   //
   // _testcapi C files can built with the Ty_BUILD_CORE_BUILTIN macro defined
   // if one of the Modules/Setup files asks to build _testcapi as "static"
   // (gh-109723).
   //
   // The Visual Studio projects builds _testcapi with Ty_BUILD_CORE_MODULE.
#  undef Ty_BUILD_CORE_MODULE
#  undef Ty_BUILD_CORE_BUILTIN
#endif

#include "Python.h"

#if defined(Ty_BUILD_CORE) && !defined(PYTESTCAPI_NEED_INTERNAL_API)
#  error "_testcapi must test the public Python C API, not the internal C API"
#endif

int _PyTestCapi_Init_Vectorcall(TyObject *module);
int _PyTestCapi_Init_Heaptype(TyObject *module);
int _PyTestCapi_Init_Abstract(TyObject *module);
int _PyTestCapi_Init_Bytes(TyObject *module);
int _PyTestCapi_Init_Unicode(TyObject *module);
int _PyTestCapi_Init_GetArgs(TyObject *module);
int _PyTestCapi_Init_DateTime(TyObject *module);
int _PyTestCapi_Init_Docstring(TyObject *module);
int _PyTestCapi_Init_Mem(TyObject *module);
int _PyTestCapi_Init_Watchers(TyObject *module);
int _PyTestCapi_Init_Long(TyObject *module);
int _PyTestCapi_Init_Float(TyObject *module);
int _PyTestCapi_Init_Complex(TyObject *module);
int _PyTestCapi_Init_Numbers(TyObject *module);
int _PyTestCapi_Init_Dict(TyObject *module);
int _PyTestCapi_Init_Set(TyObject *module);
int _PyTestCapi_Init_List(TyObject *module);
int _PyTestCapi_Init_Tuple(TyObject *module);
int _PyTestCapi_Init_Structmember(TyObject *module);
int _PyTestCapi_Init_Exceptions(TyObject *module);
int _PyTestCapi_Init_Code(TyObject *module);
int _PyTestCapi_Init_Buffer(TyObject *module);
int _PyTestCapi_Init_PyAtomic(TyObject *module);
int _PyTestCapi_Init_Run(TyObject *module);
int _PyTestCapi_Init_File(TyObject *module);
int _PyTestCapi_Init_Codec(TyObject *module);
int _PyTestCapi_Init_Immortal(TyObject *module);
int _PyTestCapi_Init_GC(TyObject *module);
int _PyTestCapi_Init_Hash(TyObject *module);
int _PyTestCapi_Init_Time(TyObject *module);
int _PyTestCapi_Init_Monitoring(TyObject *module);
int _PyTestCapi_Init_Object(TyObject *module);
int _PyTestCapi_Init_Config(TyObject *mod);
int _PyTestCapi_Init_Import(TyObject *mod);
int _PyTestCapi_Init_Frame(TyObject *mod);
int _PyTestCapi_Init_Type(TyObject *mod);
int _PyTestCapi_Init_Function(TyObject *mod);

#endif // Ty_TESTCAPI_PARTS_H
