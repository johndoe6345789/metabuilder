/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(cmath_acos__doc__,
"acos($module, z, /)\n"
"--\n"
"\n"
"Return the arc cosine of z.");

#define CMATH_ACOS_METHODDEF    \
    {"acos", (PyCFunction)cmath_acos, METH_O, cmath_acos__doc__},

static Ty_complex
cmath_acos_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_acos(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_acos_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_acosh__doc__,
"acosh($module, z, /)\n"
"--\n"
"\n"
"Return the inverse hyperbolic cosine of z.");

#define CMATH_ACOSH_METHODDEF    \
    {"acosh", (PyCFunction)cmath_acosh, METH_O, cmath_acosh__doc__},

static Ty_complex
cmath_acosh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_acosh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_acosh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_asin__doc__,
"asin($module, z, /)\n"
"--\n"
"\n"
"Return the arc sine of z.");

#define CMATH_ASIN_METHODDEF    \
    {"asin", (PyCFunction)cmath_asin, METH_O, cmath_asin__doc__},

static Ty_complex
cmath_asin_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_asin(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_asin_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_asinh__doc__,
"asinh($module, z, /)\n"
"--\n"
"\n"
"Return the inverse hyperbolic sine of z.");

#define CMATH_ASINH_METHODDEF    \
    {"asinh", (PyCFunction)cmath_asinh, METH_O, cmath_asinh__doc__},

static Ty_complex
cmath_asinh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_asinh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_asinh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_atan__doc__,
"atan($module, z, /)\n"
"--\n"
"\n"
"Return the arc tangent of z.");

#define CMATH_ATAN_METHODDEF    \
    {"atan", (PyCFunction)cmath_atan, METH_O, cmath_atan__doc__},

static Ty_complex
cmath_atan_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_atan(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_atan_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_atanh__doc__,
"atanh($module, z, /)\n"
"--\n"
"\n"
"Return the inverse hyperbolic tangent of z.");

#define CMATH_ATANH_METHODDEF    \
    {"atanh", (PyCFunction)cmath_atanh, METH_O, cmath_atanh__doc__},

static Ty_complex
cmath_atanh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_atanh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_atanh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_cos__doc__,
"cos($module, z, /)\n"
"--\n"
"\n"
"Return the cosine of z.");

#define CMATH_COS_METHODDEF    \
    {"cos", (PyCFunction)cmath_cos, METH_O, cmath_cos__doc__},

static Ty_complex
cmath_cos_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_cos(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_cos_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_cosh__doc__,
"cosh($module, z, /)\n"
"--\n"
"\n"
"Return the hyperbolic cosine of z.");

#define CMATH_COSH_METHODDEF    \
    {"cosh", (PyCFunction)cmath_cosh, METH_O, cmath_cosh__doc__},

static Ty_complex
cmath_cosh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_cosh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_cosh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_exp__doc__,
"exp($module, z, /)\n"
"--\n"
"\n"
"Return the exponential value e**z.");

#define CMATH_EXP_METHODDEF    \
    {"exp", (PyCFunction)cmath_exp, METH_O, cmath_exp__doc__},

static Ty_complex
cmath_exp_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_exp(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_exp_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_log10__doc__,
"log10($module, z, /)\n"
"--\n"
"\n"
"Return the base-10 logarithm of z.");

#define CMATH_LOG10_METHODDEF    \
    {"log10", (PyCFunction)cmath_log10, METH_O, cmath_log10__doc__},

static Ty_complex
cmath_log10_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_log10(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_log10_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_sin__doc__,
"sin($module, z, /)\n"
"--\n"
"\n"
"Return the sine of z.");

#define CMATH_SIN_METHODDEF    \
    {"sin", (PyCFunction)cmath_sin, METH_O, cmath_sin__doc__},

static Ty_complex
cmath_sin_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_sin(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_sin_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_sinh__doc__,
"sinh($module, z, /)\n"
"--\n"
"\n"
"Return the hyperbolic sine of z.");

#define CMATH_SINH_METHODDEF    \
    {"sinh", (PyCFunction)cmath_sinh, METH_O, cmath_sinh__doc__},

static Ty_complex
cmath_sinh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_sinh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_sinh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_sqrt__doc__,
"sqrt($module, z, /)\n"
"--\n"
"\n"
"Return the square root of z.");

#define CMATH_SQRT_METHODDEF    \
    {"sqrt", (PyCFunction)cmath_sqrt, METH_O, cmath_sqrt__doc__},

static Ty_complex
cmath_sqrt_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_sqrt(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_sqrt_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_tan__doc__,
"tan($module, z, /)\n"
"--\n"
"\n"
"Return the tangent of z.");

#define CMATH_TAN_METHODDEF    \
    {"tan", (PyCFunction)cmath_tan, METH_O, cmath_tan__doc__},

static Ty_complex
cmath_tan_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_tan(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_tan_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_tanh__doc__,
"tanh($module, z, /)\n"
"--\n"
"\n"
"Return the hyperbolic tangent of z.");

#define CMATH_TANH_METHODDEF    \
    {"tanh", (PyCFunction)cmath_tanh, METH_O, cmath_tanh__doc__},

static Ty_complex
cmath_tanh_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_tanh(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;
    Ty_complex _return_value;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    /* modifications for z */
    errno = 0;
    _return_value = cmath_tanh_impl(module, z);
    if (errno == EDOM) {
        TyErr_SetString(TyExc_ValueError, "math domain error");
        goto exit;
    }
    else if (errno == ERANGE) {
        TyErr_SetString(TyExc_OverflowError, "math range error");
        goto exit;
    }
    else {
        return_value = TyComplex_FromCComplex(_return_value);
    }

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_log__doc__,
"log($module, z, base=<unrepresentable>, /)\n"
"--\n"
"\n"
"log(z[, base]) -> the logarithm of z to the given base.\n"
"\n"
"If the base is not specified, returns the natural logarithm (base e) of z.");

#define CMATH_LOG_METHODDEF    \
    {"log", _PyCFunction_CAST(cmath_log), METH_FASTCALL, cmath_log__doc__},

static TyObject *
cmath_log_impl(TyObject *module, Ty_complex x, TyObject *y_obj);

static TyObject *
cmath_log(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_complex x;
    TyObject *y_obj = NULL;

    if (!_TyArg_CheckPositional("log", nargs, 1, 2)) {
        goto exit;
    }
    x = TyComplex_AsCComplex(args[0]);
    if (TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    y_obj = args[1];
skip_optional:
    return_value = cmath_log_impl(module, x, y_obj);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_phase__doc__,
"phase($module, z, /)\n"
"--\n"
"\n"
"Return argument, also known as the phase angle, of a complex.");

#define CMATH_PHASE_METHODDEF    \
    {"phase", (PyCFunction)cmath_phase, METH_O, cmath_phase__doc__},

static TyObject *
cmath_phase_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_phase(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = cmath_phase_impl(module, z);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_polar__doc__,
"polar($module, z, /)\n"
"--\n"
"\n"
"Convert a complex from rectangular coordinates to polar coordinates.\n"
"\n"
"r is the distance from 0 and phi the phase angle.");

#define CMATH_POLAR_METHODDEF    \
    {"polar", (PyCFunction)cmath_polar, METH_O, cmath_polar__doc__},

static TyObject *
cmath_polar_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_polar(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = cmath_polar_impl(module, z);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_rect__doc__,
"rect($module, r, phi, /)\n"
"--\n"
"\n"
"Convert from polar coordinates to rectangular coordinates.");

#define CMATH_RECT_METHODDEF    \
    {"rect", _PyCFunction_CAST(cmath_rect), METH_FASTCALL, cmath_rect__doc__},

static TyObject *
cmath_rect_impl(TyObject *module, double r, double phi);

static TyObject *
cmath_rect(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    double r;
    double phi;

    if (!_TyArg_CheckPositional("rect", nargs, 2, 2)) {
        goto exit;
    }
    if (TyFloat_CheckExact(args[0])) {
        r = TyFloat_AS_DOUBLE(args[0]);
    }
    else
    {
        r = TyFloat_AsDouble(args[0]);
        if (r == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
    if (TyFloat_CheckExact(args[1])) {
        phi = TyFloat_AS_DOUBLE(args[1]);
    }
    else
    {
        phi = TyFloat_AsDouble(args[1]);
        if (phi == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
    return_value = cmath_rect_impl(module, r, phi);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_isfinite__doc__,
"isfinite($module, z, /)\n"
"--\n"
"\n"
"Return True if both the real and imaginary parts of z are finite, else False.");

#define CMATH_ISFINITE_METHODDEF    \
    {"isfinite", (PyCFunction)cmath_isfinite, METH_O, cmath_isfinite__doc__},

static TyObject *
cmath_isfinite_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_isfinite(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = cmath_isfinite_impl(module, z);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_isnan__doc__,
"isnan($module, z, /)\n"
"--\n"
"\n"
"Checks if the real or imaginary part of z not a number (NaN).");

#define CMATH_ISNAN_METHODDEF    \
    {"isnan", (PyCFunction)cmath_isnan, METH_O, cmath_isnan__doc__},

static TyObject *
cmath_isnan_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_isnan(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = cmath_isnan_impl(module, z);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_isinf__doc__,
"isinf($module, z, /)\n"
"--\n"
"\n"
"Checks if the real or imaginary part of z is infinite.");

#define CMATH_ISINF_METHODDEF    \
    {"isinf", (PyCFunction)cmath_isinf, METH_O, cmath_isinf__doc__},

static TyObject *
cmath_isinf_impl(TyObject *module, Ty_complex z);

static TyObject *
cmath_isinf(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_complex z;

    z = TyComplex_AsCComplex(arg);
    if (TyErr_Occurred()) {
        goto exit;
    }
    return_value = cmath_isinf_impl(module, z);

exit:
    return return_value;
}

TyDoc_STRVAR(cmath_isclose__doc__,
"isclose($module, /, a, b, *, rel_tol=1e-09, abs_tol=0.0)\n"
"--\n"
"\n"
"Determine whether two complex numbers are close in value.\n"
"\n"
"  rel_tol\n"
"    maximum difference for being considered \"close\", relative to the\n"
"    magnitude of the input values\n"
"  abs_tol\n"
"    maximum difference for being considered \"close\", regardless of the\n"
"    magnitude of the input values\n"
"\n"
"Return True if a is close in value to b, and False otherwise.\n"
"\n"
"For the values to be considered close, the difference between them must be\n"
"smaller than at least one of the tolerances.\n"
"\n"
"-inf, inf and NaN behave similarly to the IEEE 754 Standard. That is, NaN is\n"
"not close to anything, even itself. inf and -inf are only close to themselves.");

#define CMATH_ISCLOSE_METHODDEF    \
    {"isclose", _PyCFunction_CAST(cmath_isclose), METH_FASTCALL|METH_KEYWORDS, cmath_isclose__doc__},

static int
cmath_isclose_impl(TyObject *module, Ty_complex a, Ty_complex b,
                   double rel_tol, double abs_tol);

static TyObject *
cmath_isclose(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('a'), _Ty_LATIN1_CHR('b'), &_Ty_ID(rel_tol), &_Ty_ID(abs_tol), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"a", "b", "rel_tol", "abs_tol", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "isclose",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    Ty_complex a;
    Ty_complex b;
    double rel_tol = 1e-09;
    double abs_tol = 0.0;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    a = TyComplex_AsCComplex(args[0]);
    if (TyErr_Occurred()) {
        goto exit;
    }
    b = TyComplex_AsCComplex(args[1]);
    if (TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (TyFloat_CheckExact(args[2])) {
            rel_tol = TyFloat_AS_DOUBLE(args[2]);
        }
        else
        {
            rel_tol = TyFloat_AsDouble(args[2]);
            if (rel_tol == -1.0 && TyErr_Occurred()) {
                goto exit;
            }
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (TyFloat_CheckExact(args[3])) {
        abs_tol = TyFloat_AS_DOUBLE(args[3]);
    }
    else
    {
        abs_tol = TyFloat_AsDouble(args[3]);
        if (abs_tol == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
skip_optional_kwonly:
    _return_value = cmath_isclose_impl(module, a, b, rel_tol, abs_tol);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}
/*[clinic end generated code: output=631db17fb1c79d66 input=a9049054013a1b77]*/
