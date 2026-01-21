/* Unicode name database interface */
#ifndef Ty_INTERNAL_UCNHASH_H
#define Ty_INTERNAL_UCNHASH_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

/* revised ucnhash CAPI interface (exported through a "wrapper") */

#define PyUnicodeData_CAPSULE_NAME "unicodedata._ucnhash_CAPI"

typedef struct {

    /* Get name for a given character code.
       Returns non-zero if success, zero if not.
       Does not set Python exceptions. */
    int (*getname)(Ty_UCS4 code, char* buffer, int buflen,
                   int with_alias_and_seq);

    /* Get character code for a given name.
       Same error handling as for getname(). */
    int (*getcode)(const char* name, int namelen, Ty_UCS4* code,
                   int with_named_seq);

} _TyUnicode_Name_CAPI;

extern _TyUnicode_Name_CAPI* _TyUnicode_GetNameCAPI(void);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_UCNHASH_H */
