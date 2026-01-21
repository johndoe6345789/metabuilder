#ifndef Ty_INTERNAL_JIT_H
#define Ty_INTERNAL_JIT_H

#ifdef __cplusplus
extern "C" {
#endif

#include "pycore_interp.h"
#include "pycore_optimizer.h"
#include "pycore_stackref.h"

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef _Ty_JIT

typedef _Ty_CODEUNIT *(*jit_func)(_PyInterpreterFrame *frame, _PyStackRef *stack_pointer, TyThreadState *tstate);

int _PyJIT_Compile(_PyExecutorObject *executor, const _PyUOpInstruction *trace, size_t length);
void _PyJIT_Free(_PyExecutorObject *executor);

#endif  // _Ty_JIT

#ifdef __cplusplus
}
#endif

#endif // !Ty_INTERNAL_JIT_H
