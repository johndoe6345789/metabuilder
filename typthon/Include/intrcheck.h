#ifndef Ty_INTRCHECK_H
#define Ty_INTRCHECK_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(int) TyOS_InterruptOccurred(void);

#ifdef HAVE_FORK
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03070000
PyAPI_FUNC(void) TyOS_BeforeFork(void);
PyAPI_FUNC(void) TyOS_AfterFork_Parent(void);
PyAPI_FUNC(void) TyOS_AfterFork_Child(void);
#endif
#endif

/* Deprecated, please use TyOS_AfterFork_Child() instead */
Ty_DEPRECATED(3.7) PyAPI_FUNC(void) TyOS_AfterFork(void);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTRCHECK_H */
