#ifndef _Ty_AUDIT_H
#define _Ty_AUDIT_H
#ifdef __cplusplus
extern "C" {
#endif


#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(int) TySys_Audit(
    const char *event,
    const char *argFormat,
    ...);

PyAPI_FUNC(int) TySys_AuditTuple(
    const char *event,
    TyObject *args);
#endif


#ifndef Ty_LIMITED_API
#  define _Ty_CPYTHON_AUDIT_H
#  include "cpython/audit.h"
#  undef _Ty_CPYTHON_AUDIT_H
#endif


#ifdef __cplusplus
}
#endif
#endif /* !_Ty_AUDIT_H */
