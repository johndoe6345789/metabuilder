/* Complex number structure */

#ifndef Ty_COMPLEXOBJECT_H
#define Ty_COMPLEXOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* Complex object interface */

PyAPI_DATA(TyTypeObject) TyComplex_Type;

#define TyComplex_Check(op) PyObject_TypeCheck((op), &TyComplex_Type)
#define TyComplex_CheckExact(op) Ty_IS_TYPE((op), &TyComplex_Type)

PyAPI_FUNC(TyObject *) TyComplex_FromDoubles(double real, double imag);

PyAPI_FUNC(double) TyComplex_RealAsDouble(TyObject *op);
PyAPI_FUNC(double) TyComplex_ImagAsDouble(TyObject *op);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_COMPLEXOBJECT_H
#  include "cpython/complexobject.h"
#  undef Ty_CPYTHON_COMPLEXOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_COMPLEXOBJECT_H */
