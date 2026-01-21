#ifndef Ty_INTERNAL_ATEXIT_H
#define Ty_INTERNAL_ATEXIT_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif



#ifdef Ty_GIL_DISABLED
#  define _PyAtExit_LockCallbacks(state) PyMutex_Lock(&state->ll_callbacks_lock);
#  define _PyAtExit_UnlockCallbacks(state) PyMutex_Unlock(&state->ll_callbacks_lock);
#else
#  define _PyAtExit_LockCallbacks(state)
#  define _PyAtExit_UnlockCallbacks(state)
#endif

// Export for '_interpchannels' shared extension
PyAPI_FUNC(int) _Py_AtExit(
    TyInterpreterState *interp,
    atexit_datacallbackfunc func,
    void *data);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_ATEXIT_H */
