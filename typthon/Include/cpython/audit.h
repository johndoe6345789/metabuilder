#ifndef _Ty_CPYTHON_AUDIT_H
#  error "this header file must not be included directly"
#endif


typedef int(*Ty_AuditHookFunction)(const char *, TyObject *, void *);

PyAPI_FUNC(int) TySys_AddAuditHook(Ty_AuditHookFunction, void*);
