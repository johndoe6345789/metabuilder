#ifndef Ty_MONITORING_H
#define Ty_MONITORING_H
#ifdef __cplusplus
extern "C" {
#endif

// There is currently no limited API for monitoring

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_MONITORING_H
#  include "cpython/monitoring.h"
#  undef Ty_CPYTHON_MONITORING_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_MONITORING_H */
