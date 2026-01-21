#ifndef Ty_INTERNAL_SETOBJECT_H
#define Ty_INTERNAL_SETOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Export for '_abc' shared extension
PyAPI_FUNC(int) _TySet_NextEntry(
    TyObject *set,
    Ty_ssize_t *pos,
    TyObject **key,
    Ty_hash_t *hash);

// Export for '_pickle' shared extension
PyAPI_FUNC(int) _TySet_NextEntryRef(
    TyObject *set,
    Ty_ssize_t *pos,
    TyObject **key,
    Ty_hash_t *hash);

// Export for '_pickle' shared extension
PyAPI_FUNC(int) _TySet_Update(TyObject *set, TyObject *iterable);

// Export for the gdb plugin's (python-gdb.py) benefit
PyAPI_DATA(TyObject *) _TySet_Dummy;

PyAPI_FUNC(int) _TySet_Contains(PySetObject *so, TyObject *key);

// Clears the set without acquiring locks. Used by _TyCode_Fini.
extern void _TySet_ClearInternal(PySetObject *so);

PyAPI_FUNC(int) _TySet_AddTakeRef(PySetObject *so, TyObject *key);

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_SETOBJECT_H
