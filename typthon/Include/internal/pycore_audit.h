#ifndef Ty_INTERNAL_AUDIT_H
#define Ty_INTERNAL_AUDIT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/* Runtime audit hook state */

typedef struct _Ty_AuditHookEntry {
    struct _Ty_AuditHookEntry *next;
    Ty_AuditHookFunction hookCFunction;
    void *userData;
} _Ty_AuditHookEntry;


extern int _TySys_Audit(
    TyThreadState *tstate,
    const char *event,
    const char *argFormat,
    ...);

// _TySys_ClearAuditHooks() must not be exported: use extern rather than
// PyAPI_FUNC(). We want minimal exposure of this function.
extern void _TySys_ClearAuditHooks(TyThreadState *tstate);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_AUDIT_H */
