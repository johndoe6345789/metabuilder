#ifndef Ty_INTERNAL_FLOATOBJECT_H
#define Ty_INTERNAL_FLOATOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_unicodeobject.h" // _PyUnicodeWriter

/* runtime lifecycle */

extern void _TyFloat_InitState(TyInterpreterState *);
extern TyStatus _TyFloat_InitTypes(TyInterpreterState *);
extern void _TyFloat_FiniType(TyInterpreterState *);




PyAPI_FUNC(void) _TyFloat_ExactDealloc(TyObject *op);


extern void _TyFloat_DebugMallocStats(FILE* out);


/* Format the object based on the format_spec, as defined in PEP 3101
   (Advanced String Formatting). */
extern int _TyFloat_FormatAdvancedWriter(
    _PyUnicodeWriter *writer,
    TyObject *obj,
    TyObject *format_spec,
    Ty_ssize_t start,
    Ty_ssize_t end);

extern TyObject* _Ty_string_to_number_with_underscores(
    const char *str, Ty_ssize_t len, const char *what, TyObject *obj, void *arg,
    TyObject *(*innerfunc)(const char *, Ty_ssize_t, void *));

extern double _Ty_parse_inf_or_nan(const char *p, char **endptr);

extern int _Ty_convert_int_to_double(TyObject **v, double *dbl);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_FLOATOBJECT_H */
