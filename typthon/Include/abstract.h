/* Abstract Object Interface (many thanks to Jim Fulton) */

#ifndef Ty_ABSTRACTOBJECT_H
#define Ty_ABSTRACTOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* === Object Protocol ================================================== */

/* Implemented elsewhere:

   int PyObject_Print(TyObject *o, FILE *fp, int flags);

   Print an object 'o' on file 'fp'.  Returns -1 on error. The flags argument
   is used to enable certain printing options. The only option currently
   supported is Ty_PRINT_RAW. By default (flags=0), PyObject_Print() formats
   the object by calling PyObject_Repr(). If flags equals to Ty_PRINT_RAW, it
   formats the object by calling PyObject_Str(). */


/* Implemented elsewhere:

   int PyObject_HasAttrString(TyObject *o, const char *attr_name);

   Returns 1 if object 'o' has the attribute attr_name, and 0 otherwise.

   This is equivalent to the Python expression: hasattr(o,attr_name).

   This function always succeeds. */


/* Implemented elsewhere:

   TyObject* PyObject_GetAttrString(TyObject *o, const char *attr_name);

   Retrieve an attributed named attr_name form object o.
   Returns the attribute value on success, or NULL on failure.

   This is the equivalent of the Python expression: o.attr_name. */


/* Implemented elsewhere:

   int PyObject_HasAttr(TyObject *o, TyObject *attr_name);

   Returns 1 if o has the attribute attr_name, and 0 otherwise.

   This is equivalent to the Python expression: hasattr(o,attr_name).

   This function always succeeds. */


/* Implemented elsewhere:

   int PyObject_HasAttrStringWithError(TyObject *o, const char *attr_name);

   Returns 1 if object 'o' has the attribute attr_name, and 0 otherwise.
   This is equivalent to the Python expression: hasattr(o,attr_name).
   Returns -1 on failure. */


/* Implemented elsewhere:

   int PyObject_HasAttrWithError(TyObject *o, TyObject *attr_name);

   Returns 1 if o has the attribute attr_name, and 0 otherwise.
   This is equivalent to the Python expression: hasattr(o,attr_name).
   Returns -1 on failure. */


/* Implemented elsewhere:

   TyObject* PyObject_GetAttr(TyObject *o, TyObject *attr_name);

   Retrieve an attributed named 'attr_name' form object 'o'.
   Returns the attribute value on success, or NULL on failure.

   This is the equivalent of the Python expression: o.attr_name. */


/* Implemented elsewhere:

   int PyObject_GetOptionalAttr(TyObject *obj, TyObject *attr_name, TyObject **result);

   Variant of PyObject_GetAttr() which doesn't raise AttributeError
   if the attribute is not found.

   If the attribute is found, return 1 and set *result to a new strong
   reference to the attribute.
   If the attribute is not found, return 0 and set *result to NULL;
   the AttributeError is silenced.
   If an error other than AttributeError is raised, return -1 and
   set *result to NULL.
*/


/* Implemented elsewhere:

   int PyObject_GetOptionalAttrString(TyObject *obj, const char *attr_name, TyObject **result);

   Variant of PyObject_GetAttrString() which doesn't raise AttributeError
   if the attribute is not found.

   If the attribute is found, return 1 and set *result to a new strong
   reference to the attribute.
   If the attribute is not found, return 0 and set *result to NULL;
   the AttributeError is silenced.
   If an error other than AttributeError is raised, return -1 and
   set *result to NULL.
*/


/* Implemented elsewhere:

   int PyObject_SetAttrString(TyObject *o, const char *attr_name, TyObject *v);

   Set the value of the attribute named attr_name, for object 'o',
   to the value 'v'. Raise an exception and return -1 on failure; return 0 on
   success.

   This is the equivalent of the Python statement o.attr_name=v. */


/* Implemented elsewhere:

   int PyObject_SetAttr(TyObject *o, TyObject *attr_name, TyObject *v);

   Set the value of the attribute named attr_name, for object 'o', to the value
   'v'. an exception and return -1 on failure; return 0 on success.

   This is the equivalent of the Python statement o.attr_name=v. */

/* Implemented elsewhere:

   int PyObject_DelAttrString(TyObject *o, const char *attr_name);

   Delete attribute named attr_name, for object o. Returns
   -1 on failure.

   This is the equivalent of the Python statement: del o.attr_name.

   Implemented as a macro in the limited C API 3.12 and older. */
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 < 0x030d0000
#  define PyObject_DelAttrString(O, A) PyObject_SetAttrString((O), (A), NULL)
#endif


/* Implemented elsewhere:

   int PyObject_DelAttr(TyObject *o, TyObject *attr_name);

   Delete attribute named attr_name, for object o. Returns -1
   on failure.  This is the equivalent of the Python
   statement: del o.attr_name.

   Implemented as a macro in the limited C API 3.12 and older. */
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 < 0x030d0000
#  define PyObject_DelAttr(O, A) PyObject_SetAttr((O), (A), NULL)
#endif


/* Implemented elsewhere:

   TyObject *PyObject_Repr(TyObject *o);

   Compute the string representation of object 'o'.  Returns the
   string representation on success, NULL on failure.

   This is the equivalent of the Python expression: repr(o).

   Called by the repr() built-in function. */


/* Implemented elsewhere:

   TyObject *PyObject_Str(TyObject *o);

   Compute the string representation of object, o.  Returns the
   string representation on success, NULL on failure.

   This is the equivalent of the Python expression: str(o).

   Called by the str() and print() built-in functions. */


/* Declared elsewhere

   PyAPI_FUNC(int) PyCallable_Check(TyObject *o);

   Determine if the object, o, is callable.  Return 1 if the object is callable
   and 0 otherwise.

   This function always succeeds. */


#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03090000
/* Call a callable Python object without any arguments */
PyAPI_FUNC(TyObject *) PyObject_CallNoArgs(TyObject *func);
#endif


/* Call a callable Python object 'callable' with arguments given by the
   tuple 'args' and keywords arguments given by the dictionary 'kwargs'.

   'args' must not be NULL, use an empty tuple if no arguments are
   needed. If no named arguments are needed, 'kwargs' can be NULL.

   This is the equivalent of the Python expression:
   callable(*args, **kwargs). */
PyAPI_FUNC(TyObject *) PyObject_Call(TyObject *callable,
                                     TyObject *args, TyObject *kwargs);


/* Call a callable Python object 'callable', with arguments given by the
   tuple 'args'.  If no arguments are needed, then 'args' can be NULL.

   Returns the result of the call on success, or NULL on failure.

   This is the equivalent of the Python expression:
   callable(*args). */
PyAPI_FUNC(TyObject *) PyObject_CallObject(TyObject *callable,
                                           TyObject *args);

/* Call a callable Python object, callable, with a variable number of C
   arguments. The C arguments are described using a mkvalue-style format
   string.

   The format may be NULL, indicating that no arguments are provided.

   Returns the result of the call on success, or NULL on failure.

   This is the equivalent of the Python expression:
   callable(arg1, arg2, ...). */
PyAPI_FUNC(TyObject *) PyObject_CallFunction(TyObject *callable,
                                             const char *format, ...);

/* Call the method named 'name' of object 'obj' with a variable number of
   C arguments.  The C arguments are described by a mkvalue format string.

   The format can be NULL, indicating that no arguments are provided.

   Returns the result of the call on success, or NULL on failure.

   This is the equivalent of the Python expression:
   obj.name(arg1, arg2, ...). */
PyAPI_FUNC(TyObject *) PyObject_CallMethod(TyObject *obj,
                                           const char *name,
                                           const char *format, ...);

/* Call a callable Python object 'callable' with a variable number of C
   arguments. The C arguments are provided as TyObject* values, terminated
   by a NULL.

   Returns the result of the call on success, or NULL on failure.

   This is the equivalent of the Python expression:
   callable(arg1, arg2, ...). */
PyAPI_FUNC(TyObject *) PyObject_CallFunctionObjArgs(TyObject *callable,
                                                    ...);

/* Call the method named 'name' of object 'obj' with a variable number of
   C arguments.  The C arguments are provided as TyObject* values, terminated
   by NULL.

   Returns the result of the call on success, or NULL on failure.

   This is the equivalent of the Python expression: obj.name(*args). */

PyAPI_FUNC(TyObject *) PyObject_CallMethodObjArgs(
    TyObject *obj,
    TyObject *name,
    ...);

/* Given a vectorcall nargsf argument, return the actual number of arguments.
 * (For use outside the limited API, this is re-defined as a static inline
 * function in cpython/abstract.h)
 */
PyAPI_FUNC(Ty_ssize_t) PyVectorcall_NARGS(size_t nargsf);

/* Call "callable" (which must support vectorcall) with positional arguments
   "tuple" and keyword arguments "dict". "dict" may also be NULL */
PyAPI_FUNC(TyObject *) PyVectorcall_Call(TyObject *callable, TyObject *tuple, TyObject *dict);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030C0000
#define PY_VECTORCALL_ARGUMENTS_OFFSET \
    (_Ty_STATIC_CAST(size_t, 1) << (8 * sizeof(size_t) - 1))

/* Perform a PEP 590-style vector call on 'callable' */
PyAPI_FUNC(TyObject *) PyObject_Vectorcall(
    TyObject *callable,
    TyObject *const *args,
    size_t nargsf,
    TyObject *kwnames);

/* Call the method 'name' on args[0] with arguments in args[1..nargsf-1]. */
PyAPI_FUNC(TyObject *) PyObject_VectorcallMethod(
    TyObject *name, TyObject *const *args,
    size_t nargsf, TyObject *kwnames);
#endif

/* Implemented elsewhere:

   Ty_hash_t PyObject_Hash(TyObject *o);

   Compute and return the hash, hash_value, of an object, o.  On
   failure, return -1.

   This is the equivalent of the Python expression: hash(o). */


/* Implemented elsewhere:

   int PyObject_IsTrue(TyObject *o);

   Returns 1 if the object, o, is considered to be true, 0 if o is
   considered to be false and -1 on failure.

   This is equivalent to the Python expression: not not o. */


/* Implemented elsewhere:

   int PyObject_Not(TyObject *o);

   Returns 0 if the object, o, is considered to be true, 1 if o is
   considered to be false and -1 on failure.

   This is equivalent to the Python expression: not o. */


/* Get the type of an object.

   On success, returns a type object corresponding to the object type of object
   'o'. On failure, returns NULL.

   This is equivalent to the Python expression: type(o) */
PyAPI_FUNC(TyObject *) PyObject_Type(TyObject *o);


/* Return the size of object 'o'.  If the object 'o' provides both sequence and
   mapping protocols, the sequence size is returned.

   On error, -1 is returned.

   This is the equivalent to the Python expression: len(o) */
PyAPI_FUNC(Ty_ssize_t) PyObject_Size(TyObject *o);


/* For DLL compatibility */
#undef PyObject_Length
PyAPI_FUNC(Ty_ssize_t) PyObject_Length(TyObject *o);
#define PyObject_Length PyObject_Size

/* Return element of 'o' corresponding to the object 'key'. Return NULL
  on failure.

  This is the equivalent of the Python expression: o[key] */
PyAPI_FUNC(TyObject *) PyObject_GetItem(TyObject *o, TyObject *key);


/* Map the object 'key' to the value 'v' into 'o'.

   Raise an exception and return -1 on failure; return 0 on success.

   This is the equivalent of the Python statement: o[key]=v. */
PyAPI_FUNC(int) PyObject_SetItem(TyObject *o, TyObject *key, TyObject *v);

/* Remove the mapping for the string 'key' from the object 'o'.
   Returns -1 on failure.

   This is equivalent to the Python statement: del o[key]. */
PyAPI_FUNC(int) PyObject_DelItemString(TyObject *o, const char *key);

/* Delete the mapping for the object 'key' from the object 'o'.
   Returns -1 on failure.

   This is the equivalent of the Python statement: del o[key]. */
PyAPI_FUNC(int) PyObject_DelItem(TyObject *o, TyObject *key);


/* Takes an arbitrary object and returns the result of calling
   obj.__format__(format_spec). */
PyAPI_FUNC(TyObject *) PyObject_Format(TyObject *obj,
                                       TyObject *format_spec);


/* ==== Iterators ================================================ */

/* Takes an object and returns an iterator for it.
   This is typically a new iterator but if the argument is an iterator, this
   returns itself. */
PyAPI_FUNC(TyObject *) PyObject_GetIter(TyObject *);

/* Takes an AsyncIterable object and returns an AsyncIterator for it.
   This is typically a new iterator but if the argument is an AsyncIterator,
   this returns itself. */
PyAPI_FUNC(TyObject *) PyObject_GetAIter(TyObject *);

/* Returns non-zero if the object 'obj' provides iterator protocols, and 0 otherwise.

   This function always succeeds. */
PyAPI_FUNC(int) TyIter_Check(TyObject *);

/* Returns non-zero if the object 'obj' provides AsyncIterator protocols, and 0 otherwise.

   This function always succeeds. */
PyAPI_FUNC(int) PyAIter_Check(TyObject *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030e0000
/* Return 1 and set 'item' to the next item of 'iter' on success.
 * Return 0 and set 'item' to NULL when there are no remaining values.
 * Return -1, set 'item' to NULL and set an exception on error.
 */
PyAPI_FUNC(int) TyIter_NextItem(TyObject *iter, TyObject **item);
#endif

/* Takes an iterator object and calls its tp_iternext slot,
   returning the next value.

   If the iterator is exhausted, this returns NULL without setting an
   exception.

   NULL with an exception means an error occurred.

   Prefer TyIter_NextItem() instead. */
PyAPI_FUNC(TyObject *) TyIter_Next(TyObject *);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000

/* Takes generator, coroutine or iterator object and sends the value into it.
   Returns:
   - PYGEN_RETURN (0) if generator has returned.
     'result' parameter is filled with return value
   - PYGEN_ERROR (-1) if exception was raised.
     'result' parameter is NULL
   - PYGEN_NEXT (1) if generator has yielded.
     'result' parameter is filled with yielded value. */
PyAPI_FUNC(PySendResult) TyIter_Send(TyObject *, TyObject *, TyObject **);
#endif


/* === Number Protocol ================================================== */

/* Returns 1 if the object 'o' provides numeric protocols, and 0 otherwise.

   This function always succeeds. */
PyAPI_FUNC(int) PyNumber_Check(TyObject *o);

/* Returns the result of adding o1 and o2, or NULL on failure.

   This is the equivalent of the Python expression: o1 + o2. */
PyAPI_FUNC(TyObject *) PyNumber_Add(TyObject *o1, TyObject *o2);

/* Returns the result of subtracting o2 from o1, or NULL on failure.

   This is the equivalent of the Python expression: o1 - o2. */
PyAPI_FUNC(TyObject *) PyNumber_Subtract(TyObject *o1, TyObject *o2);

/* Returns the result of multiplying o1 and o2, or NULL on failure.

   This is the equivalent of the Python expression: o1 * o2. */
PyAPI_FUNC(TyObject *) PyNumber_Multiply(TyObject *o1, TyObject *o2);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* This is the equivalent of the Python expression: o1 @ o2. */
PyAPI_FUNC(TyObject *) PyNumber_MatrixMultiply(TyObject *o1, TyObject *o2);
#endif

/* Returns the result of dividing o1 by o2 giving an integral result,
   or NULL on failure.

   This is the equivalent of the Python expression: o1 // o2. */
PyAPI_FUNC(TyObject *) PyNumber_FloorDivide(TyObject *o1, TyObject *o2);

/* Returns the result of dividing o1 by o2 giving a float result, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 / o2. */
PyAPI_FUNC(TyObject *) PyNumber_TrueDivide(TyObject *o1, TyObject *o2);

/* Returns the remainder of dividing o1 by o2, or NULL on failure.

   This is the equivalent of the Python expression: o1 % o2. */
PyAPI_FUNC(TyObject *) PyNumber_Remainder(TyObject *o1, TyObject *o2);

/* See the built-in function divmod.

   Returns NULL on failure.

   This is the equivalent of the Python expression: divmod(o1, o2). */
PyAPI_FUNC(TyObject *) PyNumber_Divmod(TyObject *o1, TyObject *o2);

/* See the built-in function pow. Returns NULL on failure.

   This is the equivalent of the Python expression: pow(o1, o2, o3),
   where o3 is optional. */
PyAPI_FUNC(TyObject *) PyNumber_Power(TyObject *o1, TyObject *o2,
                                      TyObject *o3);

/* Returns the negation of o on success, or NULL on failure.

 This is the equivalent of the Python expression: -o. */
PyAPI_FUNC(TyObject *) PyNumber_Negative(TyObject *o);

/* Returns the positive of o on success, or NULL on failure.

   This is the equivalent of the Python expression: +o. */
PyAPI_FUNC(TyObject *) PyNumber_Positive(TyObject *o);

/* Returns the absolute value of 'o', or NULL on failure.

   This is the equivalent of the Python expression: abs(o). */
PyAPI_FUNC(TyObject *) PyNumber_Absolute(TyObject *o);

/* Returns the bitwise negation of 'o' on success, or NULL on failure.

   This is the equivalent of the Python expression: ~o. */
PyAPI_FUNC(TyObject *) PyNumber_Invert(TyObject *o);

/* Returns the result of left shifting o1 by o2 on success, or NULL on failure.

   This is the equivalent of the Python expression: o1 << o2. */
PyAPI_FUNC(TyObject *) PyNumber_Lshift(TyObject *o1, TyObject *o2);

/* Returns the result of right shifting o1 by o2 on success, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 >> o2. */
PyAPI_FUNC(TyObject *) PyNumber_Rshift(TyObject *o1, TyObject *o2);

/* Returns the result of bitwise and of o1 and o2 on success, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 & o2. */
PyAPI_FUNC(TyObject *) PyNumber_And(TyObject *o1, TyObject *o2);

/* Returns the bitwise exclusive or of o1 by o2 on success, or NULL on failure.

   This is the equivalent of the Python expression: o1 ^ o2. */
PyAPI_FUNC(TyObject *) PyNumber_Xor(TyObject *o1, TyObject *o2);

/* Returns the result of bitwise or on o1 and o2 on success, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 | o2. */
PyAPI_FUNC(TyObject *) PyNumber_Or(TyObject *o1, TyObject *o2);

/* Returns 1 if obj is an index integer (has the nb_index slot of the
   tp_as_number structure filled in), and 0 otherwise. */
PyAPI_FUNC(int) PyIndex_Check(TyObject *);

/* Returns the object 'o' converted to a Python int, or NULL with an exception
   raised on failure. */
PyAPI_FUNC(TyObject *) PyNumber_Index(TyObject *o);

/* Returns the object 'o' converted to Ty_ssize_t by going through
   PyNumber_Index() first.

   If an overflow error occurs while converting the int to Ty_ssize_t, then the
   second argument 'exc' is the error-type to return.  If it is NULL, then the
   overflow error is cleared and the value is clipped. */
PyAPI_FUNC(Ty_ssize_t) PyNumber_AsSsize_t(TyObject *o, TyObject *exc);

/* Returns the object 'o' converted to an integer object on success, or NULL
   on failure.

   This is the equivalent of the Python expression: int(o). */
PyAPI_FUNC(TyObject *) PyNumber_Long(TyObject *o);

/* Returns the object 'o' converted to a float object on success, or NULL
  on failure.

  This is the equivalent of the Python expression: float(o). */
PyAPI_FUNC(TyObject *) PyNumber_Float(TyObject *o);


/* --- In-place variants of (some of) the above number protocol functions -- */

/* Returns the result of adding o2 to o1, possibly in-place, or NULL
   on failure.

   This is the equivalent of the Python expression: o1 += o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceAdd(TyObject *o1, TyObject *o2);

/* Returns the result of subtracting o2 from o1, possibly in-place or
   NULL on failure.

   This is the equivalent of the Python expression: o1 -= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceSubtract(TyObject *o1, TyObject *o2);

/* Returns the result of multiplying o1 by o2, possibly in-place, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 *= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceMultiply(TyObject *o1, TyObject *o2);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* This is the equivalent of the Python expression: o1 @= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceMatrixMultiply(TyObject *o1, TyObject *o2);
#endif

/* Returns the result of dividing o1 by o2 giving an integral result, possibly
   in-place, or NULL on failure.

   This is the equivalent of the Python expression: o1 /= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceFloorDivide(TyObject *o1,
                                                   TyObject *o2);

/* Returns the result of dividing o1 by o2 giving a float result, possibly
   in-place, or null on failure.

   This is the equivalent of the Python expression: o1 /= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceTrueDivide(TyObject *o1,
                                                  TyObject *o2);

/* Returns the remainder of dividing o1 by o2, possibly in-place, or NULL on
   failure.

   This is the equivalent of the Python expression: o1 %= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceRemainder(TyObject *o1, TyObject *o2);

/* Returns the result of raising o1 to the power of o2, possibly in-place,
   or NULL on failure.

   This is the equivalent of the Python expression: o1 **= o2,
   or o1 = pow(o1, o2, o3) if o3 is present. */
PyAPI_FUNC(TyObject *) PyNumber_InPlacePower(TyObject *o1, TyObject *o2,
                                             TyObject *o3);

/* Returns the result of left shifting o1 by o2, possibly in-place, or NULL
   on failure.

   This is the equivalent of the Python expression: o1 <<= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceLshift(TyObject *o1, TyObject *o2);

/* Returns the result of right shifting o1 by o2, possibly in-place or NULL
   on failure.

   This is the equivalent of the Python expression: o1 >>= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceRshift(TyObject *o1, TyObject *o2);

/* Returns the result of bitwise and of o1 and o2, possibly in-place, or NULL
   on failure.

   This is the equivalent of the Python expression: o1 &= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceAnd(TyObject *o1, TyObject *o2);

/* Returns the bitwise exclusive or of o1 by o2, possibly in-place, or NULL
   on failure.

   This is the equivalent of the Python expression: o1 ^= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceXor(TyObject *o1, TyObject *o2);

/* Returns the result of bitwise or of o1 and o2, possibly in-place,
   or NULL on failure.

   This is the equivalent of the Python expression: o1 |= o2. */
PyAPI_FUNC(TyObject *) PyNumber_InPlaceOr(TyObject *o1, TyObject *o2);

/* Returns the integer n converted to a string with a base, with a base
   marker of 0b, 0o or 0x prefixed if applicable.

   If n is not an int object, it is converted with PyNumber_Index first. */
PyAPI_FUNC(TyObject *) PyNumber_ToBase(TyObject *n, int base);


/* === Sequence protocol ================================================ */

/* Return 1 if the object provides sequence protocol, and zero
   otherwise.

   This function always succeeds. */
PyAPI_FUNC(int) PySequence_Check(TyObject *o);

/* Return the size of sequence object o, or -1 on failure. */
PyAPI_FUNC(Ty_ssize_t) PySequence_Size(TyObject *o);

/* For DLL compatibility */
#undef PySequence_Length
PyAPI_FUNC(Ty_ssize_t) PySequence_Length(TyObject *o);
#define PySequence_Length PySequence_Size


/* Return the concatenation of o1 and o2 on success, and NULL on failure.

   This is the equivalent of the Python expression: o1 + o2. */
PyAPI_FUNC(TyObject *) PySequence_Concat(TyObject *o1, TyObject *o2);

/* Return the result of repeating sequence object 'o' 'count' times,
  or NULL on failure.

  This is the equivalent of the Python expression: o * count. */
PyAPI_FUNC(TyObject *) PySequence_Repeat(TyObject *o, Ty_ssize_t count);

/* Return the ith element of o, or NULL on failure.

   This is the equivalent of the Python expression: o[i]. */
PyAPI_FUNC(TyObject *) PySequence_GetItem(TyObject *o, Ty_ssize_t i);

/* Return the slice of sequence object o between i1 and i2, or NULL on failure.

   This is the equivalent of the Python expression: o[i1:i2]. */
PyAPI_FUNC(TyObject *) PySequence_GetSlice(TyObject *o, Ty_ssize_t i1, Ty_ssize_t i2);

/* Assign object 'v' to the ith element of the sequence 'o'. Raise an exception
   and return -1 on failure; return 0 on success.

   This is the equivalent of the Python statement o[i] = v. */
PyAPI_FUNC(int) PySequence_SetItem(TyObject *o, Ty_ssize_t i, TyObject *v);

/* Delete the 'i'-th element of the sequence 'v'. Returns -1 on failure.

   This is the equivalent of the Python statement: del o[i]. */
PyAPI_FUNC(int) PySequence_DelItem(TyObject *o, Ty_ssize_t i);

/* Assign the sequence object 'v' to the slice in sequence object 'o',
   from 'i1' to 'i2'. Returns -1 on failure.

   This is the equivalent of the Python statement: o[i1:i2] = v. */
PyAPI_FUNC(int) PySequence_SetSlice(TyObject *o, Ty_ssize_t i1, Ty_ssize_t i2,
                                    TyObject *v);

/* Delete the slice in sequence object 'o' from 'i1' to 'i2'.
   Returns -1 on failure.

   This is the equivalent of the Python statement: del o[i1:i2]. */
PyAPI_FUNC(int) PySequence_DelSlice(TyObject *o, Ty_ssize_t i1, Ty_ssize_t i2);

/* Returns the sequence 'o' as a tuple on success, and NULL on failure.

   This is equivalent to the Python expression: tuple(o). */
PyAPI_FUNC(TyObject *) PySequence_Tuple(TyObject *o);

/* Returns the sequence 'o' as a list on success, and NULL on failure.
   This is equivalent to the Python expression: list(o) */
PyAPI_FUNC(TyObject *) PySequence_List(TyObject *o);

/* Return the sequence 'o' as a list, unless it's already a tuple or list.

   Use PySequence_Fast_GET_ITEM to access the members of this list, and
   PySequence_Fast_GET_SIZE to get its length.

   Returns NULL on failure.  If the object does not support iteration, raises a
   TypeError exception with 'm' as the message text. */
PyAPI_FUNC(TyObject *) PySequence_Fast(TyObject *o, const char* m);

/* Return the number of occurrences on value on 'o', that is, return
   the number of keys for which o[key] == value.

   On failure, return -1.  This is equivalent to the Python expression:
   o.count(value). */
PyAPI_FUNC(Ty_ssize_t) PySequence_Count(TyObject *o, TyObject *value);

/* Return 1 if 'ob' is in the sequence 'seq'; 0 if 'ob' is not in the sequence
   'seq'; -1 on error.

   Use __contains__ if possible, else _PySequence_IterSearch(). */
PyAPI_FUNC(int) PySequence_Contains(TyObject *seq, TyObject *ob);

/* For DLL-level backwards compatibility */
#undef PySequence_In
/* Determine if the sequence 'o' contains 'value'. If an item in 'o' is equal
   to 'value', return 1, otherwise return 0. On error, return -1.

   This is equivalent to the Python expression: value in o. */
PyAPI_FUNC(int) PySequence_In(TyObject *o, TyObject *value);

/* For source-level backwards compatibility */
#define PySequence_In PySequence_Contains


/* Return the first index for which o[i] == value.
   On error, return -1.

   This is equivalent to the Python expression: o.index(value). */
PyAPI_FUNC(Ty_ssize_t) PySequence_Index(TyObject *o, TyObject *value);


/* --- In-place versions of some of the above Sequence functions --- */

/* Append sequence 'o2' to sequence 'o1', in-place when possible. Return the
   resulting object, which could be 'o1', or NULL on failure.

  This is the equivalent of the Python expression: o1 += o2. */
PyAPI_FUNC(TyObject *) PySequence_InPlaceConcat(TyObject *o1, TyObject *o2);

/* Repeat sequence 'o' by 'count', in-place when possible. Return the resulting
   object, which could be 'o', or NULL on failure.

   This is the equivalent of the Python expression: o1 *= count.  */
PyAPI_FUNC(TyObject *) PySequence_InPlaceRepeat(TyObject *o, Ty_ssize_t count);


/* === Mapping protocol ================================================= */

/* Return 1 if the object provides mapping protocol, and 0 otherwise.

   This function always succeeds. */
PyAPI_FUNC(int) PyMapping_Check(TyObject *o);

/* Returns the number of keys in mapping object 'o' on success, and -1 on
  failure. This is equivalent to the Python expression: len(o). */
PyAPI_FUNC(Ty_ssize_t) PyMapping_Size(TyObject *o);

/* For DLL compatibility */
#undef PyMapping_Length
PyAPI_FUNC(Ty_ssize_t) PyMapping_Length(TyObject *o);
#define PyMapping_Length PyMapping_Size


/* Implemented as a macro:

   int PyMapping_DelItemString(TyObject *o, const char *key);

   Remove the mapping for the string 'key' from the mapping 'o'. Returns -1 on
   failure.

   This is equivalent to the Python statement: del o[key]. */
#define PyMapping_DelItemString(O, K) PyObject_DelItemString((O), (K))

/* Implemented as a macro:

   int PyMapping_DelItem(TyObject *o, TyObject *key);

   Remove the mapping for the object 'key' from the mapping object 'o'.
   Returns -1 on failure.

   This is equivalent to the Python statement: del o[key]. */
#define PyMapping_DelItem(O, K) PyObject_DelItem((O), (K))

/* On success, return 1 if the mapping object 'o' has the key 'key',
   and 0 otherwise.

   This is equivalent to the Python expression: key in o.

   This function always succeeds. */
PyAPI_FUNC(int) PyMapping_HasKeyString(TyObject *o, const char *key);

/* Return 1 if the mapping object has the key 'key', and 0 otherwise.

   This is equivalent to the Python expression: key in o.

   This function always succeeds. */
PyAPI_FUNC(int) PyMapping_HasKey(TyObject *o, TyObject *key);

/* Return 1 if the mapping object has the key 'key', and 0 otherwise.
   This is equivalent to the Python expression: key in o.
   On failure, return -1. */

PyAPI_FUNC(int) PyMapping_HasKeyWithError(TyObject *o, TyObject *key);

/* Return 1 if the mapping object has the key 'key', and 0 otherwise.
   This is equivalent to the Python expression: key in o.
   On failure, return -1. */

PyAPI_FUNC(int) PyMapping_HasKeyStringWithError(TyObject *o, const char *key);

/* On success, return a list of the keys in mapping object 'o'.
   On failure, return NULL. */
PyAPI_FUNC(TyObject *) PyMapping_Keys(TyObject *o);

/* On success, return a list of the values in mapping object 'o'.
   On failure, return NULL. */
PyAPI_FUNC(TyObject *) PyMapping_Values(TyObject *o);

/* On success, return a list of the items in mapping object 'o',
   where each item is a tuple containing a key-value pair. On failure, return
   NULL. */
PyAPI_FUNC(TyObject *) PyMapping_Items(TyObject *o);

/* Return element of 'o' corresponding to the string 'key' or NULL on failure.

   This is the equivalent of the Python expression: o[key]. */
PyAPI_FUNC(TyObject *) PyMapping_GetItemString(TyObject *o,
                                               const char *key);

/* Variants of PyObject_GetItem() and PyMapping_GetItemString() which don't
   raise KeyError if the key is not found.

   If the key is found, return 1 and set *result to a new strong
   reference to the corresponding value.
   If the key is not found, return 0 and set *result to NULL;
   the KeyError is silenced.
   If an error other than KeyError is raised, return -1 and
   set *result to NULL.
*/
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(int) PyMapping_GetOptionalItem(TyObject *, TyObject *, TyObject **);
PyAPI_FUNC(int) PyMapping_GetOptionalItemString(TyObject *, const char *, TyObject **);
#endif

/* Map the string 'key' to the value 'v' in the mapping 'o'.
   Returns -1 on failure.

   This is the equivalent of the Python statement: o[key]=v. */
PyAPI_FUNC(int) PyMapping_SetItemString(TyObject *o, const char *key,
                                        TyObject *value);

/* isinstance(object, typeorclass) */
PyAPI_FUNC(int) PyObject_IsInstance(TyObject *object, TyObject *typeorclass);

/* issubclass(object, typeorclass) */
PyAPI_FUNC(int) PyObject_IsSubclass(TyObject *object, TyObject *typeorclass);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_ABSTRACTOBJECT_H
#  include "cpython/abstract.h"
#  undef Ty_CPYTHON_ABSTRACTOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* Ty_ABSTRACTOBJECT_H */
