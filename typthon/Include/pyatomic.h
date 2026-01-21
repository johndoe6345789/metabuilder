#ifndef Ty_ATOMIC_H
#define Ty_ATOMIC_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_ATOMIC_H
#  include "cpython/pyatomic.h"
#  undef Ty_CPYTHON_ATOMIC_H
#endif

#ifdef __cplusplus
}
#endif
#endif  /* !Ty_ATOMIC_H */
