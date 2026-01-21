/* Frame object interface */

#ifndef Ty_FRAMEOBJECT_H
#define Ty_FRAMEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#include "pyframe.h"

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_FRAMEOBJECT_H
#  include "cpython/frameobject.h"
#  undef Ty_CPYTHON_FRAMEOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_FRAMEOBJECT_H */
