/* Generator object interface */

#ifndef Ty_LIMITED_API
#ifndef Ty_GENOBJECT_H
#define Ty_GENOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* --- Generators --------------------------------------------------------- */

typedef struct _PyGenObject PyGenObject;

PyAPI_DATA(TyTypeObject) TyGen_Type;

#define TyGen_Check(op) PyObject_TypeCheck((op), &TyGen_Type)
#define TyGen_CheckExact(op) Ty_IS_TYPE((op), &TyGen_Type)

PyAPI_FUNC(TyObject *) TyGen_New(PyFrameObject *);
PyAPI_FUNC(TyObject *) TyGen_NewWithQualName(PyFrameObject *,
    TyObject *name, TyObject *qualname);
PyAPI_FUNC(PyCodeObject *) TyGen_GetCode(PyGenObject *gen);


/* --- PyCoroObject ------------------------------------------------------- */

typedef struct _PyCoroObject PyCoroObject;

PyAPI_DATA(TyTypeObject) TyCoro_Type;

#define TyCoro_CheckExact(op) Ty_IS_TYPE((op), &TyCoro_Type)
PyAPI_FUNC(TyObject *) TyCoro_New(PyFrameObject *,
    TyObject *name, TyObject *qualname);


/* --- Asynchronous Generators -------------------------------------------- */

typedef struct _PyAsyncGenObject PyAsyncGenObject;

PyAPI_DATA(TyTypeObject) PyAsyncGen_Type;
PyAPI_DATA(TyTypeObject) _PyAsyncGenASend_Type;

PyAPI_FUNC(TyObject *) PyAsyncGen_New(PyFrameObject *,
    TyObject *name, TyObject *qualname);

#define PyAsyncGen_CheckExact(op) Ty_IS_TYPE((op), &PyAsyncGen_Type)

#define PyAsyncGenASend_CheckExact(op) Ty_IS_TYPE((op), &_PyAsyncGenASend_Type)

#undef _PyGenObject_HEAD

#ifdef __cplusplus
}
#endif
#endif /* !Ty_GENOBJECT_H */
#endif /* Ty_LIMITED_API */
