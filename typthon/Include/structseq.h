
/* Named tuple object interface */

#ifndef Ty_STRUCTSEQ_H
#define Ty_STRUCTSEQ_H
#ifdef __cplusplus
extern "C" {
#endif

typedef struct TyStructSequence_Field {
    const char *name;
    const char *doc;
} TyStructSequence_Field;

typedef struct TyStructSequence_Desc {
    const char *name;
    const char *doc;
    TyStructSequence_Field *fields;
    int n_in_sequence;
} TyStructSequence_Desc;

PyAPI_DATA(const char * const) TyStructSequence_UnnamedField;

#ifndef Ty_LIMITED_API
PyAPI_FUNC(void) TyStructSequence_InitType(TyTypeObject *type,
                                           TyStructSequence_Desc *desc);
PyAPI_FUNC(int) TyStructSequence_InitType2(TyTypeObject *type,
                                           TyStructSequence_Desc *desc);
#endif
PyAPI_FUNC(TyTypeObject*) TyStructSequence_NewType(TyStructSequence_Desc *desc);

PyAPI_FUNC(TyObject *) TyStructSequence_New(TyTypeObject* type);

PyAPI_FUNC(void) TyStructSequence_SetItem(TyObject*, Ty_ssize_t, TyObject*);
PyAPI_FUNC(TyObject*) TyStructSequence_GetItem(TyObject*, Ty_ssize_t);

#ifndef Ty_LIMITED_API
typedef PyTupleObject PyStructSequence;
#define TyStructSequence_SET_ITEM TyStructSequence_SetItem
#define TyStructSequence_GET_ITEM TyStructSequence_GetItem
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_STRUCTSEQ_H */
