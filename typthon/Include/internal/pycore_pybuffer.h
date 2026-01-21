#ifndef Ty_INTERNAL_PYBUFFER_H
#define Ty_INTERNAL_PYBUFFER_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


// Exported for the _interpchannels module.
PyAPI_FUNC(int) _PyBuffer_ReleaseInInterpreter(
        TyInterpreterState *interp, Ty_buffer *view);
PyAPI_FUNC(int) _PyBuffer_ReleaseInInterpreterAndRawFree(
        TyInterpreterState *interp, Ty_buffer *view);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PYBUFFER_H */
