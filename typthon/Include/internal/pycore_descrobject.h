#ifndef Ty_INTERNAL_DESCROBJECT_H
#define Ty_INTERNAL_DESCROBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

typedef struct {
    PyObject_HEAD
    TyObject *prop_get;
    TyObject *prop_set;
    TyObject *prop_del;
    TyObject *prop_doc;
    TyObject *prop_name;
    int getter_doc;
} propertyobject;

typedef propertyobject _PyPropertyObject;

extern TyTypeObject _PyMethodWrapper_Type;

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_DESCROBJECT_H */
