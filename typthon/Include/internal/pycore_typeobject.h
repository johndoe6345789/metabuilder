#ifndef Ty_INTERNAL_TYPEOBJECT_H
#define Ty_INTERNAL_TYPEOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_interp_structs.h" // managed_static_type_state
#include "pycore_moduleobject.h"  // PyModuleObject


/* state */

#define _Ty_TYPE_VERSION_INT 1
#define _Ty_TYPE_VERSION_FLOAT 2
#define _Ty_TYPE_VERSION_LIST 3
#define _Ty_TYPE_VERSION_TUPLE 4
#define _Ty_TYPE_VERSION_STR 5
#define _Ty_TYPE_VERSION_SET 6
#define _Ty_TYPE_VERSION_FROZEN_SET 7
#define _Ty_TYPE_VERSION_DICT 8
#define _Ty_TYPE_VERSION_BYTEARRAY 9
#define _Ty_TYPE_VERSION_BYTES 10
#define _Ty_TYPE_VERSION_COMPLEX 11

#define _Ty_TYPE_VERSION_NEXT 16


#define _Ty_TYPE_BASE_VERSION_TAG (2<<16)
#define _Ty_MAX_GLOBAL_TYPE_VERSION_TAG (_Ty_TYPE_BASE_VERSION_TAG - 1)


/* runtime lifecycle */

extern TyStatus _PyTypes_InitTypes(TyInterpreterState *);
extern void _PyTypes_FiniTypes(TyInterpreterState *);
extern void _PyTypes_FiniExtTypes(TyInterpreterState *interp);
extern void _PyTypes_Fini(TyInterpreterState *);
extern void _PyTypes_AfterFork(void);

static inline TyObject **
_PyStaticType_GET_WEAKREFS_LISTPTR(managed_static_type_state *state)
{
    assert(state != NULL);
    return &state->tp_weaklist;
}

extern int _PyStaticType_InitBuiltin(
    TyInterpreterState *interp,
    TyTypeObject *type);
extern void _PyStaticType_FiniBuiltin(
    TyInterpreterState *interp,
    TyTypeObject *type);
extern void _PyStaticType_ClearWeakRefs(
    TyInterpreterState *interp,
    TyTypeObject *type);
extern managed_static_type_state * _PyStaticType_GetState(
    TyInterpreterState *interp,
    TyTypeObject *type);

// Export for '_datetime' shared extension.
PyAPI_FUNC(int) _PyStaticType_InitForExtension(
    TyInterpreterState *interp,
     TyTypeObject *self);

// Export for _testinternalcapi extension.
PyAPI_FUNC(TyObject *) _PyStaticType_GetBuiltins(void);


/* Like TyType_GetModuleState, but skips verification
 * that type is a heap type with an associated module */
static inline void *
_TyType_GetModuleState(TyTypeObject *type)
{
    assert(TyType_Check(type));
    assert(type->tp_flags & Ty_TPFLAGS_HEAPTYPE);
    PyHeapTypeObject *et = (PyHeapTypeObject *)type;
    assert(et->ht_module);
    PyModuleObject *mod = (PyModuleObject *)(et->ht_module);
    assert(mod != NULL);
    return mod->md_state;
}


// Export for 'math' shared extension, used via _TyType_IsReady() static inline
// function
PyAPI_FUNC(TyObject *) _TyType_GetDict(TyTypeObject *);

extern TyObject * _TyType_GetBases(TyTypeObject *type);
extern TyObject * _TyType_GetMRO(TyTypeObject *type);
extern TyObject* _TyType_GetSubclasses(TyTypeObject *);
extern int _TyType_HasSubclasses(TyTypeObject *);

// Export for _testinternalcapi extension.
PyAPI_FUNC(TyObject *) _TyType_GetSlotWrapperNames(void);

// TyType_Ready() must be called if _TyType_IsReady() is false.
// See also the Ty_TPFLAGS_READY flag.
static inline int
_TyType_IsReady(TyTypeObject *type)
{
    return _TyType_GetDict(type) != NULL;
}

extern TyObject* _Ty_type_getattro_impl(TyTypeObject *type, TyObject *name,
                                        int *suppress_missing_attribute);
extern TyObject* _Ty_type_getattro(TyObject *type, TyObject *name);

extern TyObject* _Ty_BaseObject_RichCompare(TyObject* self, TyObject* other, int op);

extern TyObject* _Ty_slot_tp_getattro(TyObject *self, TyObject *name);
extern TyObject* _Ty_slot_tp_getattr_hook(TyObject *self, TyObject *name);

extern TyTypeObject _PyBufferWrapper_Type;

PyAPI_FUNC(TyObject*) _PySuper_Lookup(TyTypeObject *su_type, TyObject *su_obj,
                                 TyObject *name, int *meth_found);

extern TyObject* _TyType_GetFullyQualifiedName(TyTypeObject *type, char sep);

// Perform the following operation, in a thread-safe way when required by the
// build mode.
//
// self->tp_flags = (self->tp_flags & ~mask) | flags;
extern void _TyType_SetFlags(TyTypeObject *self, unsigned long mask,
                             unsigned long flags);
extern int _TyType_AddMethod(TyTypeObject *, TyMethodDef *);

// Like _TyType_SetFlags(), but apply the operation to self and any of its
// subclasses without Ty_TPFLAGS_IMMUTABLETYPE set.
extern void _TyType_SetFlagsRecursive(TyTypeObject *self, unsigned long mask,
                                      unsigned long flags);

extern unsigned int _TyType_GetVersionForCurrentState(TyTypeObject *tp);
PyAPI_FUNC(void) _TyType_SetVersion(TyTypeObject *tp, unsigned int version);
TyTypeObject *_TyType_LookupByVersion(unsigned int version);

// Function pointer type for user-defined validation function that will be
// called by _TyType_Validate().
// It should return 0 if the validation is passed, otherwise it will return -1.
typedef int (*_py_validate_type)(TyTypeObject *);

// It will verify the ``ty`` through user-defined validation function ``validate``,
// and if the validation is passed, it will set the ``tp_version`` as valid
// tp_version_tag from the ``ty``.
extern int _TyType_Validate(TyTypeObject *ty, _py_validate_type validate, unsigned int *tp_version);
extern int _TyType_CacheGetItemForSpecialization(PyHeapTypeObject *ht, TyObject *descriptor, uint32_t tp_version);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_TYPEOBJECT_H */
