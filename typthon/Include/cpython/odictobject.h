#ifndef Ty_ODICTOBJECT_H
#define Ty_ODICTOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif


/* OrderedDict */
/* This API is optional and mostly redundant. */

#ifndef Ty_LIMITED_API

typedef struct _odictobject PyODictObject;

PyAPI_DATA(TyTypeObject) PyODict_Type;
PyAPI_DATA(TyTypeObject) PyODictIter_Type;
PyAPI_DATA(TyTypeObject) PyODictKeys_Type;
PyAPI_DATA(TyTypeObject) PyODictItems_Type;
PyAPI_DATA(TyTypeObject) PyODictValues_Type;

#define PyODict_Check(op) PyObject_TypeCheck((op), &PyODict_Type)
#define PyODict_CheckExact(op) Ty_IS_TYPE((op), &PyODict_Type)
#define PyODict_SIZE(op) TyDict_GET_SIZE((op))

PyAPI_FUNC(TyObject *) PyODict_New(void);
PyAPI_FUNC(int) PyODict_SetItem(TyObject *od, TyObject *key, TyObject *item);
PyAPI_FUNC(int) PyODict_DelItem(TyObject *od, TyObject *key);

/* wrappers around PyDict* functions */
#define PyODict_GetItem(od, key) TyDict_GetItem(_TyObject_CAST(od), (key))
#define PyODict_GetItemWithError(od, key) \
    TyDict_GetItemWithError(_TyObject_CAST(od), (key))
#define PyODict_Contains(od, key) TyDict_Contains(_TyObject_CAST(od), (key))
#define PyODict_Size(od) TyDict_Size(_TyObject_CAST(od))
#define PyODict_GetItemString(od, key) \
    TyDict_GetItemString(_TyObject_CAST(od), (key))

#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_ODICTOBJECT_H */
