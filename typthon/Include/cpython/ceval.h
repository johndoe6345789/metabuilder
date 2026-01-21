#ifndef Ty_CPYTHON_CEVAL_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(void) TyEval_SetProfile(Ty_tracefunc, TyObject *);
PyAPI_FUNC(void) TyEval_SetProfileAllThreads(Ty_tracefunc, TyObject *);
PyAPI_FUNC(void) TyEval_SetTrace(Ty_tracefunc, TyObject *);
PyAPI_FUNC(void) TyEval_SetTraceAllThreads(Ty_tracefunc, TyObject *);

/* Look at the current frame's (if any) code's co_flags, and turn on
   the corresponding compiler flags in cf->cf_flags.  Return 1 if any
   flag was set, else return 0. */
PyAPI_FUNC(int) TyEval_MergeCompilerFlags(PyCompilerFlags *cf);

PyAPI_FUNC(TyObject *) _TyEval_EvalFrameDefault(TyThreadState *tstate, struct _PyInterpreterFrame *f, int exc);

PyAPI_FUNC(Ty_ssize_t) PyUnstable_Eval_RequestCodeExtraIndex(freefunc);
// Old name -- remove when this API changes:
_Ty_DEPRECATED_EXTERNALLY(3.12) static inline Ty_ssize_t
_TyEval_RequestCodeExtraIndex(freefunc f) {
    return PyUnstable_Eval_RequestCodeExtraIndex(f);
}

PyAPI_FUNC(int) _TyEval_SliceIndex(TyObject *, Ty_ssize_t *);
PyAPI_FUNC(int) _TyEval_SliceIndexNotNone(TyObject *, Ty_ssize_t *);


// Trampoline API

typedef struct {
    FILE* perf_map;
    TyThread_type_lock map_lock;
} PerfMapState;

PyAPI_FUNC(int) PyUnstable_PerfMapState_Init(void);
PyAPI_FUNC(int) PyUnstable_WritePerfMapEntry(
    const void *code_addr,
    unsigned int code_size,
    const char *entry_name);
PyAPI_FUNC(void) PyUnstable_PerfMapState_Fini(void);
PyAPI_FUNC(int) PyUnstable_CopyPerfMapFile(const char* parent_filename);
PyAPI_FUNC(int) PyUnstable_PerfTrampoline_CompileCode(PyCodeObject *);
PyAPI_FUNC(int) PyUnstable_PerfTrampoline_SetPersistAfterFork(int enable);
