#ifndef Ty_LIMITED_API
#ifndef Ty_BYTES_CTYPE_H
#define Ty_BYTES_CTYPE_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

/*
 * The internal implementation behind PyBytes (bytes) and PyByteArray (bytearray)
 * methods of the given names, they operate on ASCII byte strings.
 */
extern TyObject* _Ty_bytes_isspace(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_isalpha(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_isalnum(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_isascii(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_isdigit(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_islower(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_isupper(const char *cptr, Ty_ssize_t len);
extern TyObject* _Ty_bytes_istitle(const char *cptr, Ty_ssize_t len);

/* These store their len sized answer in the given preallocated *result arg. */
extern void _Ty_bytes_lower(char *result, const char *cptr, Ty_ssize_t len);
extern void _Ty_bytes_upper(char *result, const char *cptr, Ty_ssize_t len);
extern void _Ty_bytes_title(char *result, const char *s, Ty_ssize_t len);
extern void _Ty_bytes_capitalize(char *result, const char *s, Ty_ssize_t len);
extern void _Ty_bytes_swapcase(char *result, const char *s, Ty_ssize_t len);

extern TyObject *_Ty_bytes_find(const char *str, Ty_ssize_t len, TyObject *sub,
                                Ty_ssize_t start, Ty_ssize_t end);
extern TyObject *_Ty_bytes_index(const char *str, Ty_ssize_t len, TyObject *sub,
                                 Ty_ssize_t start, Ty_ssize_t end);
extern TyObject *_Ty_bytes_rfind(const char *str, Ty_ssize_t len, TyObject *sub,
                                 Ty_ssize_t start, Ty_ssize_t end);
extern TyObject *_Ty_bytes_rindex(const char *str, Ty_ssize_t len, TyObject *sub,
                                 Ty_ssize_t start, Ty_ssize_t end);
extern TyObject *_Ty_bytes_count(const char *str, Ty_ssize_t len, TyObject *sub,
                                 Ty_ssize_t start, Ty_ssize_t end);
extern int _Ty_bytes_contains(const char *str, Ty_ssize_t len, TyObject *arg);
extern TyObject *_Ty_bytes_startswith(const char *str, Ty_ssize_t len,
                                      TyObject *subobj, Ty_ssize_t start,
                                      Ty_ssize_t end);
extern TyObject *_Ty_bytes_endswith(const char *str, Ty_ssize_t len,
                                    TyObject *subobj, Ty_ssize_t start,
                                    Ty_ssize_t end);

/* The maketrans() static method. */
extern TyObject* _Ty_bytes_maketrans(Ty_buffer *frm, Ty_buffer *to);

/* Shared __doc__ strings. */
extern const char _Ty_isspace__doc__[];
extern const char _Ty_isalpha__doc__[];
extern const char _Ty_isalnum__doc__[];
extern const char _Ty_isascii__doc__[];
extern const char _Ty_isdigit__doc__[];
extern const char _Ty_islower__doc__[];
extern const char _Ty_isupper__doc__[];
extern const char _Ty_istitle__doc__[];
extern const char _Ty_lower__doc__[];
extern const char _Ty_upper__doc__[];
extern const char _Ty_title__doc__[];
extern const char _Ty_capitalize__doc__[];
extern const char _Ty_swapcase__doc__[];
extern const char _Ty_count__doc__[];
extern const char _Ty_find__doc__[];
extern const char _Ty_index__doc__[];
extern const char _Ty_rfind__doc__[];
extern const char _Ty_rindex__doc__[];
extern const char _Ty_startswith__doc__[];
extern const char _Ty_endswith__doc__[];
extern const char _Ty_maketrans__doc__[];
extern const char _Ty_expandtabs__doc__[];
extern const char _Ty_ljust__doc__[];
extern const char _Ty_rjust__doc__[];
extern const char _Ty_center__doc__[];
extern const char _Ty_zfill__doc__[];

/* this is needed because some docs are shared from the .o, not static */
#define PyDoc_STRVAR_shared(name,str) const char name[] = TyDoc_STR(str)

#endif /* !Ty_BYTES_CTYPE_H */
#endif /* !Ty_LIMITED_API */
