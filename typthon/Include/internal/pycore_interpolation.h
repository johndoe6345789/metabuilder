#ifndef Ty_INTERNAL_INTERPOLATION_H
#define Ty_INTERNAL_INTERPOLATION_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern TyTypeObject _PyInterpolation_Type;

#define _PyInterpolation_CheckExact(op) Ty_IS_TYPE((op), &_PyInterpolation_Type)

PyAPI_FUNC(TyObject *) _PyInterpolation_Build(TyObject *value, TyObject *str,
                                              int conversion, TyObject *format_spec);

extern TyStatus _PyInterpolation_InitTypes(TyInterpreterState *interp);
extern TyObject *_PyInterpolation_GetValueRef(TyObject *interpolation);

#ifdef __cplusplus
}
#endif

#endif
