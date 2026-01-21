#ifndef Ty_COMPILE_H
#define Ty_COMPILE_H
#ifdef __cplusplus
extern "C" {
#endif

/* These definitions must match corresponding definitions in graminit.h. */
#define Ty_single_input 256
#define Ty_file_input 257
#define Ty_eval_input 258
#define Ty_func_type_input 345

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_COMPILE_H
#  include "cpython/compile.h"
#  undef Ty_CPYTHON_COMPILE_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_COMPILE_H */
