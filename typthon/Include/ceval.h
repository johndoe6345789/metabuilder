/* Interface to random parts in ceval.c */

#ifndef Ty_CEVAL_H
#define Ty_CEVAL_H
#ifdef __cplusplus
extern "C" {
#endif


PyAPI_FUNC(TyObject *) TyEval_EvalCode(TyObject *, TyObject *, TyObject *);

PyAPI_FUNC(TyObject *) TyEval_EvalCodeEx(TyObject *co,
                                         TyObject *globals,
                                         TyObject *locals,
                                         TyObject *const *args, int argc,
                                         TyObject *const *kwds, int kwdc,
                                         TyObject *const *defs, int defc,
                                         TyObject *kwdefs, TyObject *closure);

PyAPI_FUNC(TyObject *) TyEval_GetBuiltins(void);
PyAPI_FUNC(TyObject *) TyEval_GetGlobals(void);
PyAPI_FUNC(TyObject *) TyEval_GetLocals(void);
PyAPI_FUNC(PyFrameObject *) TyEval_GetFrame(void);

PyAPI_FUNC(TyObject *) TyEval_GetFrameBuiltins(void);
PyAPI_FUNC(TyObject *) TyEval_GetFrameGlobals(void);
PyAPI_FUNC(TyObject *) TyEval_GetFrameLocals(void);

PyAPI_FUNC(int) Ty_AddPendingCall(int (*func)(void *), void *arg);
PyAPI_FUNC(int) Ty_MakePendingCalls(void);

/* Protection against deeply nested recursive calls

   In Python 3.0, this protection has two levels:
   * normal anti-recursion protection is triggered when the recursion level
     exceeds the current recursion limit. It raises a RecursionError, and sets
     the "overflowed" flag in the thread state structure. This flag
     temporarily *disables* the normal protection; this allows cleanup code
     to potentially outgrow the recursion limit while processing the
     RecursionError.
   * "last chance" anti-recursion protection is triggered when the recursion
     level exceeds "current recursion limit + 50". By construction, this
     protection can only be triggered when the "overflowed" flag is set. It
     means the cleanup code has itself gone into an infinite loop, or the
     RecursionError has been mistakenly ignored. When this protection is
     triggered, the interpreter aborts with a Fatal Error.

   In addition, the "overflowed" flag is automatically reset when the
   recursion level drops below "current recursion limit - 50". This heuristic
   is meant to ensure that the normal anti-recursion protection doesn't get
   disabled too long.

   Please note: this scheme has its own limitations. See:
   http://mail.python.org/pipermail/python-dev/2008-August/082106.html
   for some observations.
*/
PyAPI_FUNC(void) Ty_SetRecursionLimit(int);
PyAPI_FUNC(int) Ty_GetRecursionLimit(void);

PyAPI_FUNC(int) Ty_EnterRecursiveCall(const char *where);
PyAPI_FUNC(void) Ty_LeaveRecursiveCall(void);

PyAPI_FUNC(const char *) TyEval_GetFuncName(TyObject *);
PyAPI_FUNC(const char *) TyEval_GetFuncDesc(TyObject *);

PyAPI_FUNC(TyObject *) TyEval_EvalFrame(PyFrameObject *);
PyAPI_FUNC(TyObject *) TyEval_EvalFrameEx(PyFrameObject *f, int exc);

/* Interface for threads.

   A module that plans to do a blocking system call (or something else
   that lasts a long time and doesn't touch Python data) can allow other
   threads to run as follows:

    ...preparations here...
    Ty_BEGIN_ALLOW_THREADS
    ...blocking system call here...
    Ty_END_ALLOW_THREADS
    ...interpret result here...

   The Ty_BEGIN_ALLOW_THREADS/Ty_END_ALLOW_THREADS pair expands to a
   {}-surrounded block.
   To leave the block in the middle (e.g., with return), you must insert
   a line containing Ty_BLOCK_THREADS before the return, e.g.

    if (...premature_exit...) {
        Ty_BLOCK_THREADS
        TyErr_SetFromErrno(TyExc_OSError);
        return NULL;
    }

   An alternative is:

    Ty_BLOCK_THREADS
    if (...premature_exit...) {
        TyErr_SetFromErrno(TyExc_OSError);
        return NULL;
    }
    Ty_UNBLOCK_THREADS

   For convenience, that the value of 'errno' is restored across
   Ty_END_ALLOW_THREADS and Ty_BLOCK_THREADS.

   WARNING: NEVER NEST CALLS TO Ty_BEGIN_ALLOW_THREADS AND
   Ty_END_ALLOW_THREADS!!!

   Note that not yet all candidates have been converted to use this
   mechanism!
*/

PyAPI_FUNC(TyThreadState *) TyEval_SaveThread(void);
PyAPI_FUNC(void) TyEval_RestoreThread(TyThreadState *);

Ty_DEPRECATED(3.9) PyAPI_FUNC(void) TyEval_InitThreads(void);

PyAPI_FUNC(void) TyEval_AcquireThread(TyThreadState *tstate);
PyAPI_FUNC(void) TyEval_ReleaseThread(TyThreadState *tstate);

#define Ty_BEGIN_ALLOW_THREADS { \
                        TyThreadState *_save; \
                        _save = TyEval_SaveThread();
#define Ty_BLOCK_THREADS        TyEval_RestoreThread(_save);
#define Ty_UNBLOCK_THREADS      _save = TyEval_SaveThread();
#define Ty_END_ALLOW_THREADS    TyEval_RestoreThread(_save); \
                 }

/* Masks and values used by FORMAT_VALUE opcode. */
#define FVC_MASK      0x3
#define FVC_NONE      0x0
#define FVC_STR       0x1
#define FVC_REPR      0x2
#define FVC_ASCII     0x3
#define FVS_MASK      0x4
#define FVS_HAVE_SPEC 0x4

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_CEVAL_H
#  include "cpython/ceval.h"
#  undef Ty_CPYTHON_CEVAL_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_CEVAL_H */
