#ifndef Ty_LOCK_H
#define Ty_LOCK_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_LOCK_H
#  include "cpython/lock.h"
#  undef Ty_CPYTHON_LOCK_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_LOCK_H */
