#ifndef Ty_CPYTHON_COMPLEXOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct {
    double real;
    double imag;
} Ty_complex;

// Operations on complex numbers.
PyAPI_FUNC(Ty_complex) _Ty_c_sum(Ty_complex, Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_c_diff(Ty_complex, Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_c_neg(Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_c_prod(Ty_complex, Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_c_quot(Ty_complex, Ty_complex);
PyAPI_FUNC(Ty_complex) _Ty_c_pow(Ty_complex, Ty_complex);
PyAPI_FUNC(double) _Ty_c_abs(Ty_complex);


/* Complex object interface */

/*
PyComplexObject represents a complex number with double-precision
real and imaginary parts.
*/
typedef struct {
    PyObject_HEAD
    Ty_complex cval;
} PyComplexObject;

PyAPI_FUNC(TyObject *) TyComplex_FromCComplex(Ty_complex);

PyAPI_FUNC(Ty_complex) TyComplex_AsCComplex(TyObject *op);
