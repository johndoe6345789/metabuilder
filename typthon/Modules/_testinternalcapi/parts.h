#ifndef Ty_TESTINTERNALCAPI_PARTS_H
#define Ty_TESTINTERNALCAPI_PARTS_H

// Always enable assertions
#undef NDEBUG

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"

int _PyTestInternalCapi_Init_Lock(TyObject *module);
int _PyTestInternalCapi_Init_PyTime(TyObject *module);
int _PyTestInternalCapi_Init_Set(TyObject *module);
int _PyTestInternalCapi_Init_Complex(TyObject *module);
int _PyTestInternalCapi_Init_CriticalSection(TyObject *module);

#endif // Ty_TESTINTERNALCAPI_PARTS_H
