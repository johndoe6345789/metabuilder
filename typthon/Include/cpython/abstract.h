#ifndef Ty_CPYTHON_ABSTRACTOBJECT_H
#  error "this header file must not be included directly"
#endif

/* === Object Protocol ================================================== */

/* Like PyObject_CallMethod(), but expect a _Ty_Identifier*
   as the method name. */
PyAPI_FUNC(TyObject*) _TyObject_CallMethodId(
    TyObject *obj,
    _Ty_Identifier *name,
    const char *format, ...);

/* Convert keyword arguments from the FASTCALL (stack: C array, kwnames: tuple)
   format to a Python dictionary ("kwargs" dict).

   The type of kwnames keys is not checked. The final function getting
   arguments is responsible to check if all keys are strings, for example using
   TyArg_ParseTupleAndKeywords() or TyArg_ValidateKeywordArguments().

   Duplicate keys are merged using the last value. If duplicate keys must raise
   an exception, the caller is responsible to implement an explicit keys on
   kwnames. */
PyAPI_FUNC(TyObject*) _PyStack_AsDict(TyObject *const *values, TyObject *kwnames);


/* === Vectorcall protocol (PEP 590) ============================= */

// PyVectorcall_NARGS() is exported as a function for the stable ABI.
// Here (when we are not using the stable ABI), the name is overridden to
// call a static inline function for best performance.
static inline Ty_ssize_t
_PyVectorcall_NARGS(size_t n)
{
    return n & ~PY_VECTORCALL_ARGUMENTS_OFFSET;
}
#define PyVectorcall_NARGS(n) _PyVectorcall_NARGS(n)

PyAPI_FUNC(vectorcallfunc) PyVectorcall_Function(TyObject *callable);

// Backwards compatibility aliases (PEP 590) for API that was provisional
// in Python 3.8
#define _TyObject_Vectorcall PyObject_Vectorcall
#define _TyObject_VectorcallMethod PyObject_VectorcallMethod
#define _TyObject_FastCallDict PyObject_VectorcallDict
#define _PyVectorcall_Function PyVectorcall_Function
#define _TyObject_CallOneArg PyObject_CallOneArg
#define _TyObject_CallMethodNoArgs PyObject_CallMethodNoArgs
#define _TyObject_CallMethodOneArg PyObject_CallMethodOneArg

/* Same as PyObject_Vectorcall except that keyword arguments are passed as
   dict, which may be NULL if there are no keyword arguments. */
PyAPI_FUNC(TyObject *) PyObject_VectorcallDict(
    TyObject *callable,
    TyObject *const *args,
    size_t nargsf,
    TyObject *kwargs);

PyAPI_FUNC(TyObject *) PyObject_CallOneArg(TyObject *func, TyObject *arg);

static inline TyObject *
PyObject_CallMethodNoArgs(TyObject *self, TyObject *name)
{
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    return PyObject_VectorcallMethod(name, &self, nargsf, _Py_NULL);
}

static inline TyObject *
PyObject_CallMethodOneArg(TyObject *self, TyObject *name, TyObject *arg)
{
    TyObject *args[2] = {self, arg};
    size_t nargsf = 2 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    assert(arg != NULL);
    return PyObject_VectorcallMethod(name, args, nargsf, _Py_NULL);
}

/* Guess the size of object 'o' using len(o) or o.__length_hint__().
   If neither of those return a non-negative value, then return the default
   value.  If one of the calls fails, this function returns -1. */
PyAPI_FUNC(Ty_ssize_t) PyObject_LengthHint(TyObject *o, Ty_ssize_t);

/* === Sequence protocol ================================================ */

/* Assume tp_as_sequence and sq_item exist and that 'i' does not
   need to be corrected for a negative index. */
#define PySequence_ITEM(o, i)\
    ( Ty_TYPE(o)->tp_as_sequence->sq_item((o), (i)) )

/* Return the size of the sequence 'o', assuming that 'o' was returned by
   PySequence_Fast and is not NULL. */
#define PySequence_Fast_GET_SIZE(o) \
    (TyList_Check(o) ? TyList_GET_SIZE(o) : TyTuple_GET_SIZE(o))

/* Return the 'i'-th element of the sequence 'o', assuming that o was returned
   by PySequence_Fast, and that i is within bounds. */
#define PySequence_Fast_GET_ITEM(o, i)\
     (TyList_Check(o) ? TyList_GET_ITEM((o), (i)) : TyTuple_GET_ITEM((o), (i)))

/* Return a pointer to the underlying item array for
   an object returned by PySequence_Fast */
#define PySequence_Fast_ITEMS(sf) \
    (TyList_Check(sf) ? ((PyListObject *)(sf))->ob_item \
                      : ((PyTupleObject *)(sf))->ob_item)

