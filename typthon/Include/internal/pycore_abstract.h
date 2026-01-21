#ifndef Ty_INTERNAL_ABSTRACT_H
#define Ty_INTERNAL_ABSTRACT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Fast inlined version of PyIndex_Check()
static inline int
_PyIndex_Check(TyObject *obj)
{
    TyNumberMethods *tp_as_number = Ty_TYPE(obj)->tp_as_number;
    return (tp_as_number != NULL && tp_as_number->nb_index != NULL);
}

TyObject *_PyNumber_PowerNoMod(TyObject *lhs, TyObject *rhs);
TyObject *_PyNumber_InPlacePowerNoMod(TyObject *lhs, TyObject *rhs);

extern int _TyObject_HasLen(TyObject *o);

/* === Sequence protocol ================================================ */

#define PY_ITERSEARCH_COUNT    1
#define PY_ITERSEARCH_INDEX    2
#define PY_ITERSEARCH_CONTAINS 3

/* Iterate over seq.

   Result depends on the operation:

   PY_ITERSEARCH_COUNT:  return # of times obj appears in seq; -1 if
     error.
   PY_ITERSEARCH_INDEX:  return 0-based index of first occurrence of
     obj in seq; set ValueError and return -1 if none found;
     also return -1 on error.
   PY_ITERSEARCH_CONTAINS:  return 1 if obj in seq, else 0; -1 on
     error. */
extern Ty_ssize_t _PySequence_IterSearch(TyObject *seq,
                                         TyObject *obj, int operation);

/* === Mapping protocol ================================================= */

extern int _TyObject_RealIsInstance(TyObject *inst, TyObject *cls);

extern int _TyObject_RealIsSubclass(TyObject *derived, TyObject *cls);

// Convert Python int to Ty_ssize_t. Do nothing if the argument is None.
// Export for '_bisect' shared extension.
PyAPI_FUNC(int) _Ty_convert_optional_to_ssize_t(TyObject *, void *);

// Same as PyNumber_Index() but can return an instance of a subclass of int.
// Export for 'math' shared extension.
PyAPI_FUNC(TyObject*) _PyNumber_Index(TyObject *o);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_ABSTRACT_H */
