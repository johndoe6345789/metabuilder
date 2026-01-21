#ifndef Ty_DICTOBJECT_H
#define Ty_DICTOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

/* Dictionary object type -- mapping from hashable object to object */

/* The distribution includes a separate file, Objects/dictnotes.txt,
   describing explorations into dictionary design and optimization.
   It covers typical dictionary use patterns, the parameters for
   tuning dictionaries, and several ideas for possible optimizations.
*/

PyAPI_DATA(TyTypeObject) TyDict_Type;

#define TyDict_Check(op) \
                 TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_DICT_SUBCLASS)
#define TyDict_CheckExact(op) Ty_IS_TYPE((op), &TyDict_Type)

PyAPI_FUNC(TyObject *) TyDict_New(void);
PyAPI_FUNC(TyObject *) TyDict_GetItem(TyObject *mp, TyObject *key);
PyAPI_FUNC(TyObject *) TyDict_GetItemWithError(TyObject *mp, TyObject *key);
PyAPI_FUNC(int) TyDict_SetItem(TyObject *mp, TyObject *key, TyObject *item);
PyAPI_FUNC(int) TyDict_DelItem(TyObject *mp, TyObject *key);
PyAPI_FUNC(void) TyDict_Clear(TyObject *mp);
PyAPI_FUNC(int) TyDict_Next(
    TyObject *mp, Ty_ssize_t *pos, TyObject **key, TyObject **value);
PyAPI_FUNC(TyObject *) TyDict_Keys(TyObject *mp);
PyAPI_FUNC(TyObject *) TyDict_Values(TyObject *mp);
PyAPI_FUNC(TyObject *) TyDict_Items(TyObject *mp);
PyAPI_FUNC(Ty_ssize_t) TyDict_Size(TyObject *mp);
PyAPI_FUNC(TyObject *) TyDict_Copy(TyObject *mp);
PyAPI_FUNC(int) TyDict_Contains(TyObject *mp, TyObject *key);

/* TyDict_Update(mp, other) is equivalent to TyDict_Merge(mp, other, 1). */
PyAPI_FUNC(int) TyDict_Update(TyObject *mp, TyObject *other);

/* TyDict_Merge updates/merges from a mapping object (an object that
   supports PyMapping_Keys() and PyObject_GetItem()).  If override is true,
   the last occurrence of a key wins, else the first.  The Python
   dict.update(other) is equivalent to TyDict_Merge(dict, other, 1).
*/
PyAPI_FUNC(int) TyDict_Merge(TyObject *mp,
                             TyObject *other,
                             int override);

/* TyDict_MergeFromSeq2 updates/merges from an iterable object producing
   iterable objects of length 2.  If override is true, the last occurrence
   of a key wins, else the first.  The Python dict constructor dict(seq2)
   is equivalent to dict={}; TyDict_MergeFromSeq(dict, seq2, 1).
*/
PyAPI_FUNC(int) TyDict_MergeFromSeq2(TyObject *d,
                                     TyObject *seq2,
                                     int override);

PyAPI_FUNC(TyObject *) TyDict_GetItemString(TyObject *dp, const char *key);
PyAPI_FUNC(int) TyDict_SetItemString(TyObject *dp, const char *key, TyObject *item);
PyAPI_FUNC(int) TyDict_DelItemString(TyObject *dp, const char *key);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030D0000
// Return the object from dictionary *op* which has a key *key*.
// - If the key is present, set *result to a new strong reference to the value
//   and return 1.
// - If the key is missing, set *result to NULL and return 0 .
// - On error, raise an exception and return -1.
PyAPI_FUNC(int) TyDict_GetItemRef(TyObject *mp, TyObject *key, TyObject **result);
PyAPI_FUNC(int) TyDict_GetItemStringRef(TyObject *mp, const char *key, TyObject **result);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000
PyAPI_FUNC(TyObject *) PyObject_GenericGetDict(TyObject *, void *);
#endif

/* Dictionary (keys, values, items) views */

PyAPI_DATA(TyTypeObject) PyDictKeys_Type;
PyAPI_DATA(TyTypeObject) PyDictValues_Type;
PyAPI_DATA(TyTypeObject) PyDictItems_Type;

#define PyDictKeys_Check(op) PyObject_TypeCheck((op), &PyDictKeys_Type)
#define PyDictValues_Check(op) PyObject_TypeCheck((op), &PyDictValues_Type)
#define PyDictItems_Check(op) PyObject_TypeCheck((op), &PyDictItems_Type)
/* This excludes Values, since they are not sets. */
# define PyDictViewSet_Check(op) \
    (PyDictKeys_Check(op) || PyDictItems_Check(op))

/* Dictionary (key, value, items) iterators */

PyAPI_DATA(TyTypeObject) PyDictIterKey_Type;
PyAPI_DATA(TyTypeObject) PyDictIterValue_Type;
PyAPI_DATA(TyTypeObject) PyDictIterItem_Type;

PyAPI_DATA(TyTypeObject) PyDictRevIterKey_Type;
PyAPI_DATA(TyTypeObject) PyDictRevIterItem_Type;
PyAPI_DATA(TyTypeObject) PyDictRevIterValue_Type;


#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_DICTOBJECT_H
#  include "cpython/dictobject.h"
#  undef Ty_CPYTHON_DICTOBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_DICTOBJECT_H */
