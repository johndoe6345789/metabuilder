/* Thread and interpreter state structures and their interfaces */


#ifndef Ty_PYSTATE_H
#define Ty_PYSTATE_H
#ifdef __cplusplus
extern "C" {
#endif

/* This limitation is for performance and simplicity. If needed it can be
removed (with effort). */
#define MAX_CO_EXTRA_USERS 255

PyAPI_FUNC(TyInterpreterState *) TyInterpreterState_New(void);
PyAPI_FUNC(void) TyInterpreterState_Clear(TyInterpreterState *);
PyAPI_FUNC(void) TyInterpreterState_Delete(TyInterpreterState *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03090000
/* New in 3.9 */
/* Get the current interpreter state.

   Issue a fatal error if there no current Python thread state or no current
   interpreter. It cannot return NULL.

   The caller must hold the GIL. */
PyAPI_FUNC(TyInterpreterState *) TyInterpreterState_Get(void);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03080000
/* New in 3.8 */
PyAPI_FUNC(TyObject *) TyInterpreterState_GetDict(TyInterpreterState *);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03070000
/* New in 3.7 */
PyAPI_FUNC(int64_t) TyInterpreterState_GetID(TyInterpreterState *);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000

/* State unique per thread */

/* New in 3.3 */
PyAPI_FUNC(int) PyState_AddModule(TyObject*, TyModuleDef*);
PyAPI_FUNC(int) PyState_RemoveModule(TyModuleDef*);
#endif
PyAPI_FUNC(TyObject*) PyState_FindModule(TyModuleDef*);

PyAPI_FUNC(TyThreadState *) TyThreadState_New(TyInterpreterState *);
PyAPI_FUNC(void) TyThreadState_Clear(TyThreadState *);
PyAPI_FUNC(void) TyThreadState_Delete(TyThreadState *);

/* Get the current thread state.

   When the current thread state is NULL, this issues a fatal error (so that
   the caller needn't check for NULL).

   The caller must hold the GIL.

   See also TyThreadState_GetUnchecked() and _TyThreadState_GET(). */
PyAPI_FUNC(TyThreadState *) TyThreadState_Get(void);

// Alias to TyThreadState_Get()
#define TyThreadState_GET() TyThreadState_Get()

PyAPI_FUNC(TyThreadState *) TyThreadState_Swap(TyThreadState *);
PyAPI_FUNC(TyObject *) TyThreadState_GetDict(void);
PyAPI_FUNC(int) TyThreadState_SetAsyncExc(unsigned long, TyObject *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03090000
/* New in 3.9 */
PyAPI_FUNC(TyInterpreterState*) TyThreadState_GetInterpreter(TyThreadState *tstate);
PyAPI_FUNC(PyFrameObject*) TyThreadState_GetFrame(TyThreadState *tstate);
PyAPI_FUNC(uint64_t) TyThreadState_GetID(TyThreadState *tstate);
#endif

typedef
    enum {TyGILState_LOCKED, TyGILState_UNLOCKED}
        TyGILState_STATE;


/* Ensure that the current thread is ready to call the Python
   C API, regardless of the current state of Python, or of its
   thread lock.  This may be called as many times as desired
   by a thread so long as each call is matched with a call to
   TyGILState_Release().  In general, other thread-state APIs may
   be used between _Ensure() and _Release() calls, so long as the
   thread-state is restored to its previous state before the Release().
   For example, normal use of the Ty_BEGIN_ALLOW_THREADS/
   Ty_END_ALLOW_THREADS macros are acceptable.

   The return value is an opaque "handle" to the thread state when
   TyGILState_Ensure() was called, and must be passed to
   TyGILState_Release() to ensure Python is left in the same state. Even
   though recursive calls are allowed, these handles can *not* be shared -
   each unique call to TyGILState_Ensure must save the handle for its
   call to TyGILState_Release.

   When the function returns, the current thread will hold the GIL.

   Failure is a fatal error.
*/
PyAPI_FUNC(TyGILState_STATE) TyGILState_Ensure(void);

/* Release any resources previously acquired.  After this call, Python's
   state will be the same as it was prior to the corresponding
   TyGILState_Ensure() call (but generally this state will be unknown to
   the caller, hence the use of the GILState API.)

   Every call to TyGILState_Ensure must be matched by a call to
   TyGILState_Release on the same thread.
*/
PyAPI_FUNC(void) TyGILState_Release(TyGILState_STATE);

/* Helper/diagnostic function - get the current thread state for
   this thread.  May return NULL if no GILState API has been used
   on the current thread.  Note that the main thread always has such a
   thread-state, even if no auto-thread-state call has been made
   on the main thread.
*/
PyAPI_FUNC(TyThreadState *) TyGILState_GetThisThreadState(void);


#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_PYSTATE_H
#  include "cpython/pystate.h"
#  undef Ty_CPYTHON_PYSTATE_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PYSTATE_H */
