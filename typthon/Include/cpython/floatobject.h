#ifndef Ty_CPYTHON_FLOATOBJECT_H
#  error "this header file must not be included directly"
#endif

typedef struct {
    PyObject_HEAD
    double ob_fval;
} PyFloatObject;

#define _TyFloat_CAST(op) \
    (assert(TyFloat_Check(op)), _Py_CAST(PyFloatObject*, op))

// Static inline version of TyFloat_AsDouble() trading safety for speed.
// It doesn't check if op is a double object.
static inline double TyFloat_AS_DOUBLE(TyObject *op) {
    return _TyFloat_CAST(op)->ob_fval;
}
#define TyFloat_AS_DOUBLE(op) TyFloat_AS_DOUBLE(_TyObject_CAST(op))


PyAPI_FUNC(int) TyFloat_Pack2(double x, char *p, int le);
PyAPI_FUNC(int) TyFloat_Pack4(double x, char *p, int le);
PyAPI_FUNC(int) TyFloat_Pack8(double x, char *p, int le);

PyAPI_FUNC(double) TyFloat_Unpack2(const char *p, int le);
PyAPI_FUNC(double) TyFloat_Unpack4(const char *p, int le);
PyAPI_FUNC(double) TyFloat_Unpack8(const char *p, int le);
