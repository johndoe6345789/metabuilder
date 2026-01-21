/* Boolean object interface */

#ifndef Ty_BOOLOBJECT_H
#define Ty_BOOLOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif


// TyBool_Type is declared by object.h

#define TyBool_Check(x) Ty_IS_TYPE((x), &TyBool_Type)

/* Ty_False and Ty_True are the only two bools in existence. */

/* Don't use these directly */
PyAPI_DATA(PyLongObject) _Ty_FalseStruct;
PyAPI_DATA(PyLongObject) _Ty_TrueStruct;

/* Use these macros */
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030D0000
#  define Ty_False Ty_GetConstantBorrowed(Ty_CONSTANT_FALSE)
#  define Ty_True Ty_GetConstantBorrowed(Ty_CONSTANT_TRUE)
#else
#  define Ty_False _TyObject_CAST(&_Ty_FalseStruct)
#  define Ty_True _TyObject_CAST(&_Ty_TrueStruct)
#endif

// Test if an object is the True singleton, the same as "x is True" in Python.
PyAPI_FUNC(int) Ty_IsTrue(TyObject *x);
#define Ty_IsTrue(x) Ty_Is((x), Ty_True)

// Test if an object is the False singleton, the same as "x is False" in Python.
PyAPI_FUNC(int) Ty_IsFalse(TyObject *x);
#define Ty_IsFalse(x) Ty_Is((x), Ty_False)

/* Macros for returning Ty_True or Ty_False, respectively.
 * Only treat Ty_True and Ty_False as immortal in the limited C API 3.12
 * and newer. */
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 < 0x030c0000
#  define Py_RETURN_TRUE return Ty_NewRef(Ty_True)
#  define Py_RETURN_FALSE return Ty_NewRef(Ty_False)
#else
#  define Py_RETURN_TRUE return Ty_True
#  define Py_RETURN_FALSE return Ty_False
#endif

/* Function to return a bool from a C long */
PyAPI_FUNC(TyObject *) TyBool_FromLong(long);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_BOOLOBJECT_H */
