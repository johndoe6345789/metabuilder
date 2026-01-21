/* Limited C API of PyFrame API
 *
 * Include "frameobject.h" to get the PyFrameObject structure.
 */

#ifndef Ty_PYFRAME_H
#define Ty_PYFRAME_H
#ifdef __cplusplus
extern "C" {
#endif

/* Return the line of code the frame is currently executing. */
PyAPI_FUNC(int) TyFrame_GetLineNumber(PyFrameObject *);

PyAPI_FUNC(PyCodeObject *) TyFrame_GetCode(PyFrameObject *frame);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_PYFRAME_H
#  include "cpython/pyframe.h"
#  undef Ty_CPYTHON_PYFRAME_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_PYFRAME_H */
