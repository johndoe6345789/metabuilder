
/* Float object interface */

/*
PyFloatObject represents a (double precision) floating-point number.
*/

#ifndef Ty_FLOATOBJECT_H
#define Ty_FLOATOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_DATA(TyTypeObject) TyFloat_Type;

#define TyFloat_Check(op) PyObject_TypeCheck(op, &TyFloat_Type)
#define TyFloat_CheckExact(op) Ty_IS_TYPE((op), &TyFloat_Type)

#define Ty_RETURN_NAN return TyFloat_FromDouble(Ty_NAN)

#define Ty_RETURN_INF(sign)                          \
    do {                                             \
        if (copysign(1., sign) == 1.) {              \
            return TyFloat_FromDouble(Ty_INFINITY);  \
        }                                            \
        else {                                       \
            return TyFloat_FromDouble(-Ty_INFINITY); \
        }                                            \
    } while(0)

PyAPI_FUNC(double) TyFloat_GetMax(void);
PyAPI_FUNC(double) TyFloat_GetMin(void);
PyAPI_FUNC(TyObject*) TyFloat_GetInfo(void);

/* Return Python float from string TyObject. */
PyAPI_FUNC(TyObject*) TyFloat_FromString(TyObject*);

/* Return Python float from C double. */
PyAPI_FUNC(TyObject*) TyFloat_FromDouble(double);

/* Extract C double from Python float.  The macro version trades safety for
   speed. */
PyAPI_FUNC(double) TyFloat_AsDouble(TyObject*);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_FLOATOBJECT_H
#  include "cpython/floatobject.h"
#  undef Ty_CPYTHON_FLOATOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_FLOATOBJECT_H */
