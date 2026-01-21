#ifndef Ty_INTERNAL_COMPLEXOBJECT_H
#define Ty_INTERNAL_COMPLEXOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_unicodeobject.h" // _PyUnicodeWriter

/* Format the object based on the format_spec, as defined in PEP 3101
   (Advanced String Formatting). */
extern int _TyComplex_FormatAdvancedWriter(
    _PyUnicodeWriter *writer,
    TyObject *obj,
    TyObject *format_spec,
    Ty_ssize_t start,
    Ty_ssize_t end);

// Operations on complex numbers.
PyAPI_FUNC(Ty_complex) _Ty_cr_sum(Ty_complex, double);
PyAPI_FUNC(Ty_complex) _Ty_cr_diff(Ty_complex, double);
PyAPI_FUNC(Ty_complex) _Ty_rc_diff(double, Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_cr_prod(Ty_complex, double);
PyAPI_FUNC(Ty_complex) _Ty_cr_quot(Ty_complex, double);
PyAPI_FUNC(Ty_complex) _Ty_rc_quot(double, Ty_complex);


#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_COMPLEXOBJECT_H
