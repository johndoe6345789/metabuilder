#ifndef Ty_INTERNAL_PYTHONRUN_H
#define Ty_INTERNAL_PYTHONRUN_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern int _PyRun_SimpleFileObject(
    FILE *fp,
    TyObject *filename,
    int closeit,
    PyCompilerFlags *flags);

extern int _PyRun_AnyFileObject(
    FILE *fp,
    TyObject *filename,
    int closeit,
    PyCompilerFlags *flags);

extern int _PyRun_InteractiveLoopObject(
    FILE *fp,
    TyObject *filename,
    PyCompilerFlags *flags);

extern int _TyObject_SupportedAsScript(TyObject *);
extern const char* _Ty_SourceAsString(
    TyObject *cmd,
    const char *funcname,
    const char *what,
    PyCompilerFlags *cf,
    TyObject **cmd_copy);


/* Stack size, in "pointers". This must be large enough, so
 * no two calls to check recursion depth are more than this far
 * apart. In practice, that means it must be larger than the C
 * stack consumption of TyEval_EvalDefault */
#if defined(_Ty_ADDRESS_SANITIZER) || defined(_Ty_THREAD_SANITIZER)
#  define _TyOS_LOG2_STACK_MARGIN 12
#elif defined(Ty_DEBUG) && defined(WIN32)
#  define _TyOS_LOG2_STACK_MARGIN 12
#else
#  define _TyOS_LOG2_STACK_MARGIN 11
#endif
#define _TyOS_STACK_MARGIN (1 << _TyOS_LOG2_STACK_MARGIN)
#define _TyOS_STACK_MARGIN_BYTES (_TyOS_STACK_MARGIN * sizeof(void *))

#if SIZEOF_VOID_P == 8
#  define _TyOS_STACK_MARGIN_SHIFT (_TyOS_LOG2_STACK_MARGIN + 3)
#else
#  define _TyOS_STACK_MARGIN_SHIFT (_TyOS_LOG2_STACK_MARGIN + 2)
#endif


#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_PYTHONRUN_H

