#ifndef Ty_INTERNAL_STRUCTSEQ_H
#define Ty_INTERNAL_STRUCTSEQ_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/* other API */

// Export for '_curses' shared extension
PyAPI_FUNC(TyTypeObject*) _PyStructSequence_NewType(
    TyStructSequence_Desc *desc,
    unsigned long tp_flags);

extern int _PyStructSequence_InitBuiltinWithFlags(
    TyInterpreterState *interp,
    TyTypeObject *type,
    TyStructSequence_Desc *desc,
    unsigned long tp_flags);

static inline int
_PyStructSequence_InitBuiltin(TyInterpreterState *interp,
                              TyTypeObject *type,
                              TyStructSequence_Desc *desc)
{
    return _PyStructSequence_InitBuiltinWithFlags(interp, type, desc, 0);
}

extern void _PyStructSequence_FiniBuiltin(
    TyInterpreterState *interp,
    TyTypeObject *type);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_STRUCTSEQ_H */
