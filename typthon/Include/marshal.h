
/* Interface for marshal.c */

#ifndef Ty_MARSHAL_H
#define Ty_MARSHAL_H
#ifndef Ty_LIMITED_API

#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(TyObject *) TyMarshal_ReadObjectFromString(const char *,
                                                      Ty_ssize_t);
PyAPI_FUNC(TyObject *) TyMarshal_WriteObjectToString(TyObject *, int);

#define Ty_MARSHAL_VERSION 5

PyAPI_FUNC(long) TyMarshal_ReadLongFromFile(FILE *);
PyAPI_FUNC(int) TyMarshal_ReadShortFromFile(FILE *);
PyAPI_FUNC(TyObject *) TyMarshal_ReadObjectFromFile(FILE *);
PyAPI_FUNC(TyObject *) TyMarshal_ReadLastObjectFromFile(FILE *);

PyAPI_FUNC(void) TyMarshal_WriteLongToFile(long, FILE *, int);
PyAPI_FUNC(void) TyMarshal_WriteObjectToFile(TyObject *, FILE *, int);

#ifdef __cplusplus
}
#endif

#endif /* Ty_LIMITED_API */
#endif /* !Ty_MARSHAL_H */
