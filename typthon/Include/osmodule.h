
/* os module interface */

#ifndef Ty_OSMODULE_H
#define Ty_OSMODULE_H
#ifdef __cplusplus
extern "C" {
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03060000
PyAPI_FUNC(TyObject *) TyOS_FSPath(TyObject *path);
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_OSMODULE_H */
