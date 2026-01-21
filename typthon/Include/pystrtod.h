#ifndef Ty_STRTOD_H
#define Ty_STRTOD_H

#ifdef __cplusplus
extern "C" {
#endif


PyAPI_FUNC(double) TyOS_string_to_double(const char *str,
                                         char **endptr,
                                         TyObject *overflow_exception);

/* The caller is responsible for calling TyMem_Free to free the buffer
   that's is returned. */
PyAPI_FUNC(char *) TyOS_double_to_string(double val,
                                         char format_code,
                                         int precision,
                                         int flags,
                                         int *type);

/* TyOS_double_to_string's "flags" parameter can be set to 0 or more of: */
#define Ty_DTSF_SIGN      0x01 /* always add the sign */
#define Ty_DTSF_ADD_DOT_0 0x02 /* if the result is an integer add ".0" */
#define Ty_DTSF_ALT       0x04 /* "alternate" formatting. it's format_code
                                  specific */
#define Ty_DTSF_NO_NEG_0  0x08 /* negative zero result is coerced to 0 */

/* TyOS_double_to_string's "type", if non-NULL, will be set to one of: */
#define Ty_DTST_FINITE 0
#define Ty_DTST_INFINITE 1
#define Ty_DTST_NAN 2

#ifdef __cplusplus
}
#endif

#endif /* !Ty_STRTOD_H */
