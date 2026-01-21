#ifndef Ty_STRCMP_H
#define Ty_STRCMP_H

#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(int) TyOS_mystrnicmp(const char *, const char *, Ty_ssize_t);
PyAPI_FUNC(int) TyOS_mystricmp(const char *, const char *);

#ifdef MS_WINDOWS
#define TyOS_strnicmp strnicmp
#define TyOS_stricmp stricmp
#else
#define TyOS_strnicmp TyOS_mystrnicmp
#define TyOS_stricmp TyOS_mystricmp
#endif

#ifdef __cplusplus
}
#endif

#endif /* !Ty_STRCMP_H */
