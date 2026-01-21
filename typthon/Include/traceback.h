#ifndef Ty_TRACEBACK_H
#define Ty_TRACEBACK_H
#ifdef __cplusplus
extern "C" {
#endif

/* Traceback interface */

PyAPI_FUNC(int) PyTraceBack_Here(PyFrameObject *);
PyAPI_FUNC(int) PyTraceBack_Print(TyObject *, TyObject *);

/* Reveal traceback type so we can typecheck traceback objects */
PyAPI_DATA(TyTypeObject) PyTraceBack_Type;
#define PyTraceBack_Check(v) Ty_IS_TYPE((v), &PyTraceBack_Type)


#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_TRACEBACK_H
#  include "cpython/traceback.h"
#  undef Ty_CPYTHON_TRACEBACK_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_TRACEBACK_H */
