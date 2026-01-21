#ifndef Ty_INTERNAL_TEMPLATE_H
#define Ty_INTERNAL_TEMPLATE_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern TyTypeObject _PyTemplate_Type;
extern TyTypeObject _PyTemplateIter_Type;

#define _PyTemplate_CheckExact(op) Ty_IS_TYPE((op), &_PyTemplate_Type)
#define _PyTemplateIter_CheckExact(op) Ty_IS_TYPE((op), &_PyTemplateIter_Type)

extern TyObject *_PyTemplate_Concat(TyObject *self, TyObject *other);

PyAPI_FUNC(TyObject *) _PyTemplate_Build(TyObject *strings, TyObject *interpolations);

#ifdef __cplusplus
}
#endif

#endif
