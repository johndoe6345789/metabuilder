/* Type object implementation */

#include "Python.h"
#include "pycore_abstract.h"      // _PySequence_IterSearch()
#include "pycore_call.h"          // _TyObject_VectorcallTstate()
#include "pycore_code.h"          // CO_FAST_FREE
#include "pycore_dict.h"          // _TyDict_KeysSize()
#include "pycore_function.h"      // _TyFunction_GetVersionForCurrentState()
#include "pycore_interpframe.h"   // _PyInterpreterFrame
#include "pycore_lock.h"          // _PySeqLock_*
#include "pycore_long.h"          // _TyLong_IsNegative(), _TyLong_GetOne()
#include "pycore_memoryobject.h"  // _PyMemoryView_FromBufferProc()
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_moduleobject.h"  // _TyModule_GetDef()
#include "pycore_object.h"        // _TyType_HasFeature()
#include "pycore_object_alloc.h"  // _TyObject_MallocWithType()
#include "pycore_pyatomic_ft_wrappers.h"
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_symtable.h"      // _Ty_Mangle()
#include "pycore_typeobject.h"    // struct type_cache
#include "pycore_unicodeobject.h" // _TyUnicode_Copy
#include "pycore_unionobject.h"   // _Ty_union_type_or
#include "pycore_weakref.h"       // _TyWeakref_GET_REF()
#include "pycore_cell.h"          // TyCell_GetRef()
#include "pycore_stats.h"
#include "opcode.h"               // MAKE_CELL

#include <stddef.h>               // ptrdiff_t

/*[clinic input]
class type "TyTypeObject *" "&TyType_Type"
class object "TyObject *" "&PyBaseObject_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=4b94608d231c434b]*/

#include "clinic/typeobject.c.h"

/* Support type attribute lookup cache */

/* The cache can keep references to the names alive for longer than
   they normally would.  This is why the maximum size is limited to
   MCACHE_MAX_ATTR_SIZE, since it might be a problem if very large
   strings are used as attribute names. */
#define MCACHE_MAX_ATTR_SIZE    100
#define MCACHE_HASH(version, name_hash)                                 \
        (((unsigned int)(version) ^ (unsigned int)(name_hash))          \
         & ((1 << MCACHE_SIZE_EXP) - 1))

#define MCACHE_HASH_METHOD(type, name)                                  \
    MCACHE_HASH(FT_ATOMIC_LOAD_UINT32_RELAXED((type)->tp_version_tag),   \
                ((Ty_ssize_t)(name)) >> 3)
#define MCACHE_CACHEABLE_NAME(name)                             \
        TyUnicode_CheckExact(name) &&                           \
        (TyUnicode_GET_LENGTH(name) <= MCACHE_MAX_ATTR_SIZE)

#define NEXT_VERSION_TAG(interp) \
    (interp)->types.next_version_tag

#ifdef Ty_GIL_DISABLED

// There's a global lock for mutation of types.  This avoids having to take
// additional locks while doing various subclass processing which may result
// in odd behaviors w.r.t. running with the GIL as the outer type lock could
// be released and reacquired during a subclass update if there's contention
// on the subclass lock.
#define TYPE_LOCK &TyInterpreterState_Get()->types.mutex
#define BEGIN_TYPE_LOCK() Ty_BEGIN_CRITICAL_SECTION_MUT(TYPE_LOCK)
#define END_TYPE_LOCK() Ty_END_CRITICAL_SECTION()

#define BEGIN_TYPE_DICT_LOCK(d) \
    Ty_BEGIN_CRITICAL_SECTION2_MUT(TYPE_LOCK, &_TyObject_CAST(d)->ob_mutex)

#define END_TYPE_DICT_LOCK() Ty_END_CRITICAL_SECTION2()

#define ASSERT_TYPE_LOCK_HELD() \
    _Ty_CRITICAL_SECTION_ASSERT_MUTEX_LOCKED(TYPE_LOCK)

#else

#define BEGIN_TYPE_LOCK()
#define END_TYPE_LOCK()
#define BEGIN_TYPE_DICT_LOCK(d)
#define END_TYPE_DICT_LOCK()
#define ASSERT_TYPE_LOCK_HELD()

#endif

#define PyTypeObject_CAST(op)   ((TyTypeObject *)(op))

typedef struct PySlot_Offset {
    short subslot_offset;
    short slot_offset;
} PySlot_Offset;

static void
slot_bf_releasebuffer(TyObject *self, Ty_buffer *buffer);

static void
releasebuffer_call_python(TyObject *self, Ty_buffer *buffer);

static TyObject *
slot_tp_new(TyTypeObject *type, TyObject *args, TyObject *kwds);

static int
slot_tp_setattro(TyObject *self, TyObject *name, TyObject *value);

static inline TyTypeObject *
type_from_ref(TyObject *ref)
{
    TyObject *obj = _TyWeakref_GET_REF(ref);
    if (obj == NULL) {
        return NULL;
    }
    return _TyType_CAST(obj);
}


/* helpers for for static builtin types */

#ifndef NDEBUG
static inline int
managed_static_type_index_is_set(TyTypeObject *self)
{
    return self->tp_subclasses != NULL;
}
#endif

static inline size_t
managed_static_type_index_get(TyTypeObject *self)
{
    assert(managed_static_type_index_is_set(self));
    /* We store a 1-based index so 0 can mean "not initialized". */
    return (size_t)self->tp_subclasses - 1;
}

static inline void
managed_static_type_index_set(TyTypeObject *self, size_t index)
{
    assert(index < _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES);
    /* We store a 1-based index so 0 can mean "not initialized". */
    self->tp_subclasses = (TyObject *)(index + 1);
}

static inline void
managed_static_type_index_clear(TyTypeObject *self)
{
    self->tp_subclasses = NULL;
}

static TyTypeObject *
static_ext_type_lookup(TyInterpreterState *interp, size_t index,
                       int64_t *p_interp_count)
{
    assert(interp->runtime == &_PyRuntime);
    assert(index < _Ty_MAX_MANAGED_STATIC_EXT_TYPES);

    size_t full_index = index + _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES;
    int64_t interp_count = _Ty_atomic_load_int64(
            &_PyRuntime.types.managed_static.types[full_index].interp_count);
    assert((interp_count == 0) ==
            (_PyRuntime.types.managed_static.types[full_index].type == NULL));
    *p_interp_count = interp_count;

    TyTypeObject *type = interp->types.for_extensions.initialized[index].type;
    if (type == NULL) {
        return NULL;
    }
    assert(!interp->types.for_extensions.initialized[index].isbuiltin);
    assert(type == _PyRuntime.types.managed_static.types[full_index].type);
    assert(managed_static_type_index_is_set(type));
    return type;
}

static managed_static_type_state *
managed_static_type_state_get(TyInterpreterState *interp, TyTypeObject *self)
{
    // It's probably a builtin type.
    size_t index = managed_static_type_index_get(self);
    managed_static_type_state *state =
            &(interp->types.builtins.initialized[index]);
    if (state->type == self) {
        return state;
    }
    if (index > _Ty_MAX_MANAGED_STATIC_EXT_TYPES) {
        return state;
    }
    return &(interp->types.for_extensions.initialized[index]);
}

/* For static types we store some state in an array on each interpreter. */
managed_static_type_state *
_PyStaticType_GetState(TyInterpreterState *interp, TyTypeObject *self)
{
    assert(self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN);
    return managed_static_type_state_get(interp, self);
}

/* Set the type's per-interpreter state. */
static void
managed_static_type_state_init(TyInterpreterState *interp, TyTypeObject *self,
                               int isbuiltin, int initial)
{
    assert(interp->runtime == &_PyRuntime);

    size_t index;
    if (initial) {
        assert(!managed_static_type_index_is_set(self));
        if (isbuiltin) {
            index = interp->types.builtins.num_initialized;
            assert(index < _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES);
        }
        else {
            PyMutex_Lock(&interp->types.mutex);
            index = interp->types.for_extensions.next_index;
            interp->types.for_extensions.next_index++;
            PyMutex_Unlock(&interp->types.mutex);
            assert(index < _Ty_MAX_MANAGED_STATIC_EXT_TYPES);
        }
        managed_static_type_index_set(self, index);
    }
    else {
        index = managed_static_type_index_get(self);
        if (isbuiltin) {
            assert(index == interp->types.builtins.num_initialized);
            assert(index < _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES);
        }
        else {
            assert(index < _Ty_MAX_MANAGED_STATIC_EXT_TYPES);
        }
    }
    size_t full_index = isbuiltin
        ? index
        : index + _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES;

    assert((initial == 1) ==
            (_Ty_atomic_load_int64(&_PyRuntime.types.managed_static.types[full_index].interp_count) == 0));
    (void)_Ty_atomic_add_int64(
            &_PyRuntime.types.managed_static.types[full_index].interp_count, 1);

    if (initial) {
        assert(_PyRuntime.types.managed_static.types[full_index].type == NULL);
        _PyRuntime.types.managed_static.types[full_index].type = self;
    }
    else {
        assert(_PyRuntime.types.managed_static.types[full_index].type == self);
    }

    managed_static_type_state *state = isbuiltin
        ? &(interp->types.builtins.initialized[index])
        : &(interp->types.for_extensions.initialized[index]);

    /* It should only be called once for each builtin type per interpreter. */
    assert(state->type == NULL);
    state->type = self;
    state->isbuiltin = isbuiltin;

    /* state->tp_subclasses is left NULL until init_subclasses() sets it. */
    /* state->tp_weaklist is left NULL until insert_head() or insert_after()
       (in weakrefobject.c) sets it. */

    if (isbuiltin) {
        interp->types.builtins.num_initialized++;
    }
    else {
        interp->types.for_extensions.num_initialized++;
    }
}

/* Reset the type's per-interpreter state.
   This basically undoes what managed_static_type_state_init() did. */
static void
managed_static_type_state_clear(TyInterpreterState *interp, TyTypeObject *self,
                                int isbuiltin, int final)
{
    size_t index = managed_static_type_index_get(self);
    size_t full_index = isbuiltin
        ? index
        : index + _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES;

    managed_static_type_state *state = isbuiltin
        ? &(interp->types.builtins.initialized[index])
        : &(interp->types.for_extensions.initialized[index]);
    assert(state != NULL);

    assert(_Ty_atomic_load_int64(&_PyRuntime.types.managed_static.types[full_index].interp_count) > 0);
    assert(_PyRuntime.types.managed_static.types[full_index].type == state->type);

    assert(state->type != NULL);
    state->type = NULL;
    assert(state->tp_weaklist == NULL);  // It was already cleared out.

    (void)_Ty_atomic_add_int64(
            &_PyRuntime.types.managed_static.types[full_index].interp_count, -1);
    if (final) {
        assert(!_Ty_atomic_load_int64(&_PyRuntime.types.managed_static.types[full_index].interp_count));
        _PyRuntime.types.managed_static.types[full_index].type = NULL;

        managed_static_type_index_clear(self);
    }

    if (isbuiltin) {
        assert(interp->types.builtins.num_initialized > 0);
        interp->types.builtins.num_initialized--;
    }
    else {
        PyMutex_Lock(&interp->types.mutex);
        assert(interp->types.for_extensions.num_initialized > 0);
        interp->types.for_extensions.num_initialized--;
        if (interp->types.for_extensions.num_initialized == 0) {
            interp->types.for_extensions.next_index = 0;
        }
        PyMutex_Unlock(&interp->types.mutex);
    }
}



TyObject *
_PyStaticType_GetBuiltins(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    Ty_ssize_t count = (Ty_ssize_t)interp->types.builtins.num_initialized;
    assert(count <= _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES);

    TyObject *results = TyList_New(count);
    if (results == NULL) {
        return NULL;
    }
    for (Ty_ssize_t i = 0; i < count; i++) {
        TyTypeObject *cls = interp->types.builtins.initialized[i].type;
        assert(cls != NULL);
        assert(interp->types.builtins.initialized[i].isbuiltin);
        TyList_SET_ITEM(results, i, Ty_NewRef((TyObject *)cls));
    }

    return results;
}


// Also see _PyStaticType_InitBuiltin() and _PyStaticType_FiniBuiltin().

/* end static builtin helpers */

static void
type_set_flags(TyTypeObject *tp, unsigned long flags)
{
    if (tp->tp_flags & Ty_TPFLAGS_READY) {
        // It's possible the type object has been exposed to other threads
        // if it's been marked ready.  In that case, the type lock should be
        // held when flags are modified.
        ASSERT_TYPE_LOCK_HELD();
    }
    // Since TyType_HasFeature() reads the flags without holding the type
    // lock, we need an atomic store here.
    FT_ATOMIC_STORE_ULONG_RELAXED(tp->tp_flags, flags);
}

static void
type_set_flags_with_mask(TyTypeObject *tp, unsigned long mask, unsigned long flags)
{
    ASSERT_TYPE_LOCK_HELD();
    unsigned long new_flags = (tp->tp_flags & ~mask) | flags;
    type_set_flags(tp, new_flags);
}

static void
type_add_flags(TyTypeObject *tp, unsigned long flag)
{
    type_set_flags(tp, tp->tp_flags | flag);
}

static void
type_clear_flags(TyTypeObject *tp, unsigned long flag)
{
    type_set_flags(tp, tp->tp_flags & ~flag);
}

static inline void
start_readying(TyTypeObject *type)
{
    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = managed_static_type_state_get(interp, type);
        assert(state != NULL);
        assert(!state->readying);
        state->readying = 1;
        return;
    }
    assert((type->tp_flags & Ty_TPFLAGS_READYING) == 0);
    type_add_flags(type, Ty_TPFLAGS_READYING);
}

static inline void
stop_readying(TyTypeObject *type)
{
    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = managed_static_type_state_get(interp, type);
        assert(state != NULL);
        assert(state->readying);
        state->readying = 0;
        return;
    }
    assert(type->tp_flags & Ty_TPFLAGS_READYING);
    type_clear_flags(type, Ty_TPFLAGS_READYING);
}

static inline int
is_readying(TyTypeObject *type)
{
    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = managed_static_type_state_get(interp, type);
        assert(state != NULL);
        return state->readying;
    }
    return (type->tp_flags & Ty_TPFLAGS_READYING) != 0;
}


/* accessors for objects stored on TyTypeObject */

static inline TyObject *
lookup_tp_dict(TyTypeObject *self)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        assert(state != NULL);
        return state->tp_dict;
    }
    return self->tp_dict;
}

TyObject *
_TyType_GetDict(TyTypeObject *self)
{
    /* It returns a borrowed reference. */
    return lookup_tp_dict(self);
}

TyObject *
TyType_GetDict(TyTypeObject *self)
{
    TyObject *dict = lookup_tp_dict(self);
    return _Ty_XNewRef(dict);
}

static inline void
set_tp_dict(TyTypeObject *self, TyObject *dict)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        assert(state != NULL);
        state->tp_dict = dict;
        return;
    }
    self->tp_dict = dict;
}

static inline void
clear_tp_dict(TyTypeObject *self)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        assert(state != NULL);
        Ty_CLEAR(state->tp_dict);
        return;
    }
    Ty_CLEAR(self->tp_dict);
}


static inline TyObject *
lookup_tp_bases(TyTypeObject *self)
{
    return self->tp_bases;
}

TyObject *
_TyType_GetBases(TyTypeObject *self)
{
    TyObject *res;

    BEGIN_TYPE_LOCK();
    res = lookup_tp_bases(self);
    Ty_INCREF(res);
    END_TYPE_LOCK();

    return res;
}

static inline void
set_tp_bases(TyTypeObject *self, TyObject *bases, int initial)
{
    assert(TyTuple_Check(bases));
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        // XXX tp_bases can probably be statically allocated for each
        // static builtin type.
        assert(TyTuple_CheckExact(bases));
        assert(initial);
        assert(self->tp_bases == NULL);
        if (TyTuple_GET_SIZE(bases) == 0) {
            assert(self->tp_base == NULL);
        }
        else {
            assert(TyTuple_GET_SIZE(bases) == 1);
            assert(TyTuple_GET_ITEM(bases, 0) == (TyObject *)self->tp_base);
            assert(self->tp_base->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN);
            assert(_Ty_IsImmortal(self->tp_base));
        }
        _Ty_SetImmortal(bases);
    }
    self->tp_bases = bases;
}

static inline void
clear_tp_bases(TyTypeObject *self, int final)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        if (final) {
            if (self->tp_bases != NULL) {
                if (TyTuple_GET_SIZE(self->tp_bases) == 0) {
                    Ty_CLEAR(self->tp_bases);
                }
                else {
                    assert(_Ty_IsImmortal(self->tp_bases));
                    _Ty_ClearImmortal(self->tp_bases);
                }
            }
        }
        return;
    }
    Ty_CLEAR(self->tp_bases);
}


static inline TyObject *
lookup_tp_mro(TyTypeObject *self)
{
    ASSERT_TYPE_LOCK_HELD();
    return self->tp_mro;
}

TyObject *
_TyType_GetMRO(TyTypeObject *self)
{
#ifdef Ty_GIL_DISABLED
    TyObject *mro = _Ty_atomic_load_ptr_relaxed(&self->tp_mro);
    if (mro == NULL) {
        return NULL;
    }
    if (_Ty_TryIncrefCompare(&self->tp_mro, mro)) {
        return mro;
    }

    BEGIN_TYPE_LOCK();
    mro = lookup_tp_mro(self);
    Ty_XINCREF(mro);
    END_TYPE_LOCK();
    return mro;
#else
    return Ty_XNewRef(lookup_tp_mro(self));
#endif
}

static inline void
set_tp_mro(TyTypeObject *self, TyObject *mro, int initial)
{
    if (mro != NULL) {
        assert(TyTuple_CheckExact(mro));
        if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
            // XXX tp_mro can probably be statically allocated for each
            // static builtin type.
            assert(initial);
            assert(self->tp_mro == NULL);
            /* Other checks are done via set_tp_bases. */
            _Ty_SetImmortal(mro);
        }
    }
    self->tp_mro = mro;
}

static inline void
clear_tp_mro(TyTypeObject *self, int final)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        if (final) {
            if (self->tp_mro != NULL) {
                if (TyTuple_GET_SIZE(self->tp_mro) == 0) {
                    Ty_CLEAR(self->tp_mro);
                }
                else {
                    assert(_Ty_IsImmortal(self->tp_mro));
                    _Ty_ClearImmortal(self->tp_mro);
                }
            }
        }
        return;
    }
    Ty_CLEAR(self->tp_mro);
}


static TyObject *
init_tp_subclasses(TyTypeObject *self)
{
    TyObject *subclasses = TyDict_New();
    if (subclasses == NULL) {
        return NULL;
    }
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        state->tp_subclasses = subclasses;
        return subclasses;
    }
    self->tp_subclasses = (void *)subclasses;
    return subclasses;
}

static void
clear_tp_subclasses(TyTypeObject *self)
{
    /* Delete the dictionary to save memory. _PyStaticType_Dealloc()
       callers also test if tp_subclasses is NULL to check if a static type
       has no subclass. */
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        Ty_CLEAR(state->tp_subclasses);
        return;
    }
    Ty_CLEAR(self->tp_subclasses);
}

static inline TyObject *
lookup_tp_subclasses(TyTypeObject *self)
{
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        managed_static_type_state *state = _PyStaticType_GetState(interp, self);
        assert(state != NULL);
        return state->tp_subclasses;
    }
    return (TyObject *)self->tp_subclasses;
}

int
_TyType_HasSubclasses(TyTypeObject *self)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN
        // XXX _PyStaticType_GetState() should never return NULL.
        && _PyStaticType_GetState(interp, self) == NULL)
    {
        return 0;
    }
    if (lookup_tp_subclasses(self) == NULL) {
        return 0;
    }
    return 1;
}

TyObject*
_TyType_GetSubclasses(TyTypeObject *self)
{
    TyObject *list = TyList_New(0);
    if (list == NULL) {
        return NULL;
    }

    TyObject *subclasses = lookup_tp_subclasses(self);  // borrowed ref
    if (subclasses == NULL) {
        return list;
    }
    assert(TyDict_CheckExact(subclasses));
    // The loop cannot modify tp_subclasses, there is no need
    // to hold a strong reference (use a borrowed reference).

    Ty_ssize_t i = 0;
    TyObject *ref;  // borrowed ref
    while (TyDict_Next(subclasses, &i, NULL, &ref)) {
        TyTypeObject *subclass = type_from_ref(ref);
        if (subclass == NULL) {
            continue;
        }

        if (TyList_Append(list, _TyObject_CAST(subclass)) < 0) {
            Ty_DECREF(list);
            Ty_DECREF(subclass);
            return NULL;
        }
        Ty_DECREF(subclass);
    }
    return list;
}

/* end accessors for objects stored on TyTypeObject */


/*
 * finds the beginning of the docstring's introspection signature.
 * if present, returns a pointer pointing to the first '('.
 * otherwise returns NULL.
 *
 * doesn't guarantee that the signature is valid, only that it
 * has a valid prefix.  (the signature must also pass skip_signature.)
 */
static const char *
find_signature(const char *name, const char *doc)
{
    const char *dot;
    size_t length;

    if (!doc)
        return NULL;

    assert(name != NULL);

    /* for dotted names like classes, only use the last component */
    dot = strrchr(name, '.');
    if (dot)
        name = dot + 1;

    length = strlen(name);
    if (strncmp(doc, name, length))
        return NULL;
    doc += length;
    if (*doc != '(')
        return NULL;
    return doc;
}

#define SIGNATURE_END_MARKER         ")\n--\n\n"
#define SIGNATURE_END_MARKER_LENGTH  6
/*
 * skips past the end of the docstring's introspection signature.
 * (assumes doc starts with a valid signature prefix.)
 */
static const char *
skip_signature(const char *doc)
{
    while (*doc) {
        if ((*doc == *SIGNATURE_END_MARKER) &&
            !strncmp(doc, SIGNATURE_END_MARKER, SIGNATURE_END_MARKER_LENGTH))
            return doc + SIGNATURE_END_MARKER_LENGTH;
        if ((*doc == '\n') && (doc[1] == '\n'))
            return NULL;
        doc++;
    }
    return NULL;
}

int
_TyType_CheckConsistency(TyTypeObject *type)
{
#define CHECK(expr) \
    do { if (!(expr)) { _TyObject_ASSERT_FAILED_MSG((TyObject *)type, Ty_STRINGIFY(expr)); } } while (0)

    CHECK(!_TyObject_IsFreed((TyObject *)type));

    if (!(type->tp_flags & Ty_TPFLAGS_READY)) {
        /* don't check static types before TyType_Ready() */
        return 1;
    }

    CHECK(Ty_REFCNT(type) >= 1);
    CHECK(TyType_Check(type));

    CHECK(!is_readying(type));
    CHECK(lookup_tp_dict(type) != NULL);

    if (type->tp_flags & Ty_TPFLAGS_HAVE_GC) {
        // bpo-44263: tp_traverse is required if Ty_TPFLAGS_HAVE_GC is set.
        // Note: tp_clear is optional.
        CHECK(type->tp_traverse != NULL);
    }

    if (type->tp_flags & Ty_TPFLAGS_DISALLOW_INSTANTIATION) {
        CHECK(type->tp_new == NULL);
        CHECK(TyDict_Contains(lookup_tp_dict(type), &_Ty_ID(__new__)) == 0);
    }

    return 1;
#undef CHECK
}

static const char *
_TyType_DocWithoutSignature(const char *name, const char *internal_doc)
{
    const char *doc = find_signature(name, internal_doc);

    if (doc) {
        doc = skip_signature(doc);
        if (doc)
            return doc;
        }
    return internal_doc;
}

TyObject *
_TyType_GetDocFromInternalDoc(const char *name, const char *internal_doc)
{
    const char *doc = _TyType_DocWithoutSignature(name, internal_doc);

    if (!doc || *doc == '\0') {
        Py_RETURN_NONE;
    }

    return TyUnicode_FromString(doc);
}

static const char *
signature_from_flags(int flags)
{
    switch (flags & ~METH_COEXIST) {
        case METH_NOARGS:
            return "($self, /)";
        case METH_NOARGS|METH_CLASS:
            return "($type, /)";
        case METH_NOARGS|METH_STATIC:
            return "()";
        case METH_O:
            return "($self, object, /)";
        case METH_O|METH_CLASS:
            return "($type, object, /)";
        case METH_O|METH_STATIC:
            return "(object, /)";
        default:
            return NULL;
    }
}

TyObject *
_TyType_GetTextSignatureFromInternalDoc(const char *name, const char *internal_doc, int flags)
{
    const char *start = find_signature(name, internal_doc);
    const char *end;

    if (start)
        end = skip_signature(start);
    else
        end = NULL;
    if (!end) {
        start = signature_from_flags(flags);
        if (start) {
            return TyUnicode_FromString(start);
        }
        Py_RETURN_NONE;
    }

    /* back "end" up until it points just past the final ')' */
    end -= SIGNATURE_END_MARKER_LENGTH - 1;
    assert((end - start) >= 2); /* should be "()" at least */
    assert(end[-1] == ')');
    assert(end[0] == '\n');
    return TyUnicode_FromStringAndSize(start, end - start);
}


static struct type_cache*
get_type_cache(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return &interp->types.type_cache;
}


static void
type_cache_clear(struct type_cache *cache, TyObject *value)
{
    for (Ty_ssize_t i = 0; i < (1 << MCACHE_SIZE_EXP); i++) {
        struct type_cache_entry *entry = &cache->hashtable[i];
#ifdef Ty_GIL_DISABLED
        _PySeqLock_LockWrite(&entry->sequence);
#endif
        entry->version = 0;
        Ty_XSETREF(entry->name, _Ty_XNewRef(value));
        entry->value = NULL;
#ifdef Ty_GIL_DISABLED
        _PySeqLock_UnlockWrite(&entry->sequence);
#endif
    }
}


void
_TyType_InitCache(TyInterpreterState *interp)
{
    struct type_cache *cache = &interp->types.type_cache;
    for (Ty_ssize_t i = 0; i < (1 << MCACHE_SIZE_EXP); i++) {
        struct type_cache_entry *entry = &cache->hashtable[i];
        assert(entry->name == NULL);

        entry->version = 0;
        // Set to None so _TyType_LookupRef() can use Ty_SETREF(),
        // rather than using slower Ty_XSETREF().
        entry->name = Ty_None;
        entry->value = NULL;
    }
}


static unsigned int
_TyType_ClearCache(TyInterpreterState *interp)
{
    struct type_cache *cache = &interp->types.type_cache;
    // Set to None, rather than NULL, so _TyType_LookupRef() can
    // use Ty_SETREF() rather than using slower Ty_XSETREF().
    type_cache_clear(cache, Ty_None);

    return NEXT_VERSION_TAG(interp) - 1;
}


unsigned int
TyType_ClearCache(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return _TyType_ClearCache(interp);
}


void
_PyTypes_Fini(TyInterpreterState *interp)
{
    struct type_cache *cache = &interp->types.type_cache;
    type_cache_clear(cache, NULL);

    // All the managed static types should have been finalized already.
    assert(interp->types.for_extensions.num_initialized == 0);
    for (size_t i = 0; i < _Ty_MAX_MANAGED_STATIC_EXT_TYPES; i++) {
        assert(interp->types.for_extensions.initialized[i].type == NULL);
    }
    assert(interp->types.builtins.num_initialized == 0);
    for (size_t i = 0; i < _Ty_MAX_MANAGED_STATIC_BUILTIN_TYPES; i++) {
        assert(interp->types.builtins.initialized[i].type == NULL);
    }
}


int
TyType_AddWatcher(TyType_WatchCallback callback)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    // start at 1, 0 is reserved for cpython optimizer
    for (int i = 1; i < TYPE_MAX_WATCHERS; i++) {
        if (!interp->type_watchers[i]) {
            interp->type_watchers[i] = callback;
            return i;
        }
    }

    TyErr_SetString(TyExc_RuntimeError, "no more type watcher IDs available");
    return -1;
}

static inline int
validate_watcher_id(TyInterpreterState *interp, int watcher_id)
{
    if (watcher_id < 0 || watcher_id >= TYPE_MAX_WATCHERS) {
        TyErr_Format(TyExc_ValueError, "Invalid type watcher ID %d", watcher_id);
        return -1;
    }
    if (!interp->type_watchers[watcher_id]) {
        TyErr_Format(TyExc_ValueError, "No type watcher set for ID %d", watcher_id);
        return -1;
    }
    return 0;
}

int
TyType_ClearWatcher(int watcher_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id) < 0) {
        return -1;
    }
    interp->type_watchers[watcher_id] = NULL;
    return 0;
}

static int assign_version_tag(TyInterpreterState *interp, TyTypeObject *type);

int
TyType_Watch(int watcher_id, TyObject* obj)
{
    if (!TyType_Check(obj)) {
        TyErr_SetString(TyExc_ValueError, "Cannot watch non-type");
        return -1;
    }
    TyTypeObject *type = (TyTypeObject *)obj;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id) < 0) {
        return -1;
    }
    // ensure we will get a callback on the next modification
    BEGIN_TYPE_LOCK();
    assign_version_tag(interp, type);
    type->tp_watched |= (1 << watcher_id);
    END_TYPE_LOCK();
    return 0;
}

int
TyType_Unwatch(int watcher_id, TyObject* obj)
{
    if (!TyType_Check(obj)) {
        TyErr_SetString(TyExc_ValueError, "Cannot watch non-type");
        return -1;
    }
    TyTypeObject *type = (TyTypeObject *)obj;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id)) {
        return -1;
    }
    type->tp_watched &= ~(1 << watcher_id);
    return 0;
}

static void
set_version_unlocked(TyTypeObject *tp, unsigned int version)
{
    ASSERT_TYPE_LOCK_HELD();
    assert(version == 0 || (tp->tp_versions_used != _Ty_ATTR_CACHE_UNUSED));
#ifndef Ty_GIL_DISABLED
    TyInterpreterState *interp = _TyInterpreterState_GET();
    // lookup the old version and set to null
    if (tp->tp_version_tag != 0) {
        TyTypeObject **slot =
            interp->types.type_version_cache
            + (tp->tp_version_tag % TYPE_VERSION_CACHE_SIZE);
        *slot = NULL;
    }
    if (version) {
        tp->tp_versions_used++;
    }
#else
    if (version) {
        _Ty_atomic_add_uint16(&tp->tp_versions_used, 1);
    }
#endif
    FT_ATOMIC_STORE_UINT_RELAXED(tp->tp_version_tag, version);
#ifndef Ty_GIL_DISABLED
    if (version != 0) {
        TyTypeObject **slot =
            interp->types.type_version_cache
            + (version % TYPE_VERSION_CACHE_SIZE);
        *slot = tp;
    }
#endif
}

static void
type_modified_unlocked(TyTypeObject *type)
{
    /* Invalidate any cached data for the specified type and all
       subclasses.  This function is called after the base
       classes, mro, or attributes of the type are altered.

       Invariants:

       - before tp_version_tag can be set on a type,
         it must first be set on all super types.

       This function clears the tp_version_tag of a
       type (so it must first clear it on all subclasses).  The
       tp_version_tag value is meaningless when equal to zero.
       We don't assign new version tags eagerly, but only as
       needed.
     */
    ASSERT_TYPE_LOCK_HELD();
    if (type->tp_version_tag == 0) {
        return;
    }
    // Cannot modify static builtin types.
    assert((type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) == 0);

    TyObject *subclasses = lookup_tp_subclasses(type);
    if (subclasses != NULL) {
        assert(TyDict_CheckExact(subclasses));

        Ty_ssize_t i = 0;
        TyObject *ref;
        while (TyDict_Next(subclasses, &i, NULL, &ref)) {
            TyTypeObject *subclass = type_from_ref(ref);
            if (subclass == NULL) {
                continue;
            }
            type_modified_unlocked(subclass);
            Ty_DECREF(subclass);
        }
    }

    // Notify registered type watchers, if any
    if (type->tp_watched) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        int bits = type->tp_watched;
        int i = 0;
        while (bits) {
            assert(i < TYPE_MAX_WATCHERS);
            if (bits & 1) {
                TyType_WatchCallback cb = interp->type_watchers[i];
                if (cb && (cb(type) < 0)) {
                    TyErr_FormatUnraisable(
                        "Exception ignored in type watcher callback #%d for %R",
                        i, type);
                }
            }
            i++;
            bits >>= 1;
        }
    }

    set_version_unlocked(type, 0); /* 0 is not a valid version tag */
    if (TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        // This field *must* be invalidated if the type is modified (see the
        // comment on struct _specialization_cache):
        FT_ATOMIC_STORE_PTR_RELAXED(
            ((PyHeapTypeObject *)type)->_spec_cache.getitem, NULL);
    }
}

void
TyType_Modified(TyTypeObject *type)
{
    // Quick check without the lock held
    if (FT_ATOMIC_LOAD_UINT_RELAXED(type->tp_version_tag) == 0) {
        return;
    }

    BEGIN_TYPE_LOCK();
    type_modified_unlocked(type);
    END_TYPE_LOCK();
}

static int
is_subtype_with_mro(TyObject *a_mro, TyTypeObject *a, TyTypeObject *b);

// Check if the `mro` method on `type` is overridden, i.e.,
// `type(tp).mro is not type.mro`.
static int
has_custom_mro(TyTypeObject *tp)
{
    _PyCStackRef c_ref1, c_ref2;
    TyThreadState *tstate = _TyThreadState_GET();
    _TyThreadState_PushCStackRef(tstate, &c_ref1);
    _TyThreadState_PushCStackRef(tstate, &c_ref2);

    _TyType_LookupStackRefAndVersion(Ty_TYPE(tp), &_Ty_ID(mro), &c_ref1.ref);
    _TyType_LookupStackRefAndVersion(&TyType_Type, &_Ty_ID(mro), &c_ref2.ref);

    int custom = !PyStackRef_Is(c_ref1.ref, c_ref2.ref);

    _TyThreadState_PopCStackRef(tstate, &c_ref2);
    _TyThreadState_PopCStackRef(tstate, &c_ref1);
    return custom;
}

static void
type_mro_modified(TyTypeObject *type, TyObject *bases)
{
    /*
       Check that all base classes or elements of the MRO of type are
       able to be cached.  This function is called after the base
       classes or mro of the type are altered.

       Unset HAVE_VERSION_TAG and VALID_VERSION_TAG if the type
       has a custom MRO that includes a type which is not officially
       super type, or if the type implements its own mro() method.

       Called from mro_internal, which will subsequently be called on
       each subclass when their mro is recursively updated.
     */
    Ty_ssize_t i, n;

    ASSERT_TYPE_LOCK_HELD();
    if (!Ty_IS_TYPE(type, &TyType_Type) && has_custom_mro(type)) {
        goto clear;
    }
    n = TyTuple_GET_SIZE(bases);
    for (i = 0; i < n; i++) {
        TyObject *b = TyTuple_GET_ITEM(bases, i);
        TyTypeObject *cls = _TyType_CAST(b);

        if (cls->tp_versions_used >= _Ty_ATTR_CACHE_UNUSED) {
            goto clear;
        }

        if (!is_subtype_with_mro(lookup_tp_mro(type), type, cls)) {
            goto clear;
        }
    }
    return;

 clear:
    assert(!(type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN));
    set_version_unlocked(type, 0);  /* 0 is not a valid version tag */
    type->tp_versions_used = _Ty_ATTR_CACHE_UNUSED;
    if (TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        // This field *must* be invalidated if the type is modified (see the
        // comment on struct _specialization_cache):
        FT_ATOMIC_STORE_PTR_RELAXED(
            ((PyHeapTypeObject *)type)->_spec_cache.getitem, NULL);
    }
}

/*
The Tier 2 interpreter requires looking up the type object by the type version, so it can install
watchers to understand when they change.

So we add a global cache from type version to borrowed references of type objects.

This is similar to func_version_cache.
*/

void
_TyType_SetVersion(TyTypeObject *tp, unsigned int version)
{
    BEGIN_TYPE_LOCK();
    set_version_unlocked(tp, version);
    END_TYPE_LOCK();
}

TyTypeObject *
_TyType_LookupByVersion(unsigned int version)
{
#ifdef Ty_GIL_DISABLED
    return NULL;
#else
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyTypeObject **slot =
        interp->types.type_version_cache
        + (version % TYPE_VERSION_CACHE_SIZE);
    if (*slot && (*slot)->tp_version_tag == version) {
        return *slot;
    }
    return NULL;
#endif
}

unsigned int
_TyType_GetVersionForCurrentState(TyTypeObject *tp)
{
    return tp->tp_version_tag;
}



#define MAX_VERSIONS_PER_CLASS 1000
#if _Ty_ATTR_CACHE_UNUSED < MAX_VERSIONS_PER_CLASS
#error "_Ty_ATTR_CACHE_UNUSED must be bigger than max"
#endif

static inline unsigned int
next_global_version_tag(void)
{
    unsigned int old;
    do {
        old = _Ty_atomic_load_uint_relaxed(&_PyRuntime.types.next_version_tag);
        if (old >= _Ty_MAX_GLOBAL_TYPE_VERSION_TAG) {
            return 0;
        }
    } while (!_Ty_atomic_compare_exchange_uint(&_PyRuntime.types.next_version_tag, &old, old + 1));
    return old + 1;
}

static int
assign_version_tag(TyInterpreterState *interp, TyTypeObject *type)
{
    ASSERT_TYPE_LOCK_HELD();

    /* Ensure that the tp_version_tag is valid.
     * To respect the invariant, this must first be done on all super classes.
     * Return 0 if this cannot be done, 1 if tp_version_tag is set.
    */
    if (type->tp_version_tag != 0) {
        return 1;
    }
    if (!_TyType_HasFeature(type, Ty_TPFLAGS_READY)) {
        return 0;
    }
    if (type->tp_versions_used >= MAX_VERSIONS_PER_CLASS) {
        /* (this includes `tp_versions_used == _Ty_ATTR_CACHE_UNUSED`) */
        return 0;
    }

    TyObject *bases = lookup_tp_bases(type);
    Ty_ssize_t n = TyTuple_GET_SIZE(bases);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *b = TyTuple_GET_ITEM(bases, i);
        if (!assign_version_tag(interp, _TyType_CAST(b))) {
            return 0;
        }
    }
    if (type->tp_flags & Ty_TPFLAGS_IMMUTABLETYPE) {
        /* static types */
        unsigned int next_version_tag = next_global_version_tag();
        if (next_version_tag == 0) {
            /* We have run out of version numbers */
            return 0;
        }
        set_version_unlocked(type, next_version_tag);
        assert (type->tp_version_tag <= _Ty_MAX_GLOBAL_TYPE_VERSION_TAG);
    }
    else {
        /* heap types */
        if (NEXT_VERSION_TAG(interp) == 0) {
            /* We have run out of version numbers */
            return 0;
        }
        set_version_unlocked(type, NEXT_VERSION_TAG(interp)++);
        assert (type->tp_version_tag != 0);
    }
    return 1;
}

int PyUnstable_Type_AssignVersionTag(TyTypeObject *type)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    int assigned;
    BEGIN_TYPE_LOCK();
    assigned = assign_version_tag(interp, type);
    END_TYPE_LOCK();
    return assigned;
}


static TyMemberDef type_members[] = {
    {"__basicsize__", Ty_T_PYSSIZET, offsetof(TyTypeObject,tp_basicsize),Py_READONLY},
    {"__itemsize__", Ty_T_PYSSIZET, offsetof(TyTypeObject, tp_itemsize), Py_READONLY},
    {"__flags__", Ty_T_ULONG, offsetof(TyTypeObject, tp_flags), Py_READONLY},
    /* Note that this value is misleading for static builtin types,
       since the memory at this offset will always be NULL. */
    {"__weakrefoffset__", Ty_T_PYSSIZET,
     offsetof(TyTypeObject, tp_weaklistoffset), Py_READONLY},
    {"__base__", _Ty_T_OBJECT, offsetof(TyTypeObject, tp_base), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET,
     offsetof(TyTypeObject, tp_dictoffset), Py_READONLY},
    {0}
};

static int
check_set_special_type_attr(TyTypeObject *type, TyObject *value, const char *name)
{
    if (_TyType_HasFeature(type, Ty_TPFLAGS_IMMUTABLETYPE)) {
        TyErr_Format(TyExc_TypeError,
                     "cannot set '%s' attribute of immutable type '%s'",
                     name, type->tp_name);
        return 0;
    }
    if (!value) {
        TyErr_Format(TyExc_TypeError,
                     "cannot delete '%s' attribute of immutable type '%s'",
                     name, type->tp_name);
        return 0;
    }

    if (TySys_Audit("object.__setattr__", "OsO",
                    type, name, value) < 0) {
        return 0;
    }

    return 1;
}

const char *
_TyType_Name(TyTypeObject *type)
{
    assert(type->tp_name != NULL);
    const char *s = strrchr(type->tp_name, '.');
    if (s == NULL) {
        s = type->tp_name;
    }
    else {
        s++;
    }
    return s;
}

static TyObject *
type_name(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (type->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        PyHeapTypeObject* et = (PyHeapTypeObject*)type;
        return Ty_NewRef(et->ht_name);
    }
    else {
        return TyUnicode_FromString(_TyType_Name(type));
    }
}

static TyObject *
type_qualname(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (type->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        PyHeapTypeObject* et = (PyHeapTypeObject*)type;
        return Ty_NewRef(et->ht_qualname);
    }
    else {
        return TyUnicode_FromString(_TyType_Name(type));
    }
}

static int
type_set_name(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    const char *tp_name;
    Ty_ssize_t name_size;

    if (!check_set_special_type_attr(type, value, "__name__"))
        return -1;
    if (!TyUnicode_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "can only assign string to %s.__name__, not '%s'",
                     type->tp_name, Ty_TYPE(value)->tp_name);
        return -1;
    }

    tp_name = TyUnicode_AsUTF8AndSize(value, &name_size);
    if (tp_name == NULL)
        return -1;
    if (strlen(tp_name) != (size_t)name_size) {
        TyErr_SetString(TyExc_ValueError,
                        "type name must not contain null characters");
        return -1;
    }

    type->tp_name = tp_name;
    Ty_SETREF(((PyHeapTypeObject*)type)->ht_name, Ty_NewRef(value));

    return 0;
}

static int
type_set_qualname(TyObject *tp, TyObject *value, void *context)
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    PyHeapTypeObject* et;

    if (!check_set_special_type_attr(type, value, "__qualname__"))
        return -1;
    if (!TyUnicode_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "can only assign string to %s.__qualname__, not '%s'",
                     type->tp_name, Ty_TYPE(value)->tp_name);
        return -1;
    }

    et = (PyHeapTypeObject*)type;
    Ty_SETREF(et->ht_qualname, Ty_NewRef(value));
    return 0;
}

static TyObject *
type_module(TyTypeObject *type)
{
    TyObject *mod;
    if (type->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        TyObject *dict = lookup_tp_dict(type);
        if (TyDict_GetItemRef(dict, &_Ty_ID(__module__), &mod) == 0) {
            TyErr_Format(TyExc_AttributeError, "__module__");
        }
    }
    else {
        const char *s = strrchr(type->tp_name, '.');
        if (s != NULL) {
            mod = TyUnicode_FromStringAndSize(
                type->tp_name, (Ty_ssize_t)(s - type->tp_name));
            if (mod != NULL) {
                TyInterpreterState *interp = _TyInterpreterState_GET();
                _TyUnicode_InternMortal(interp, &mod);
            }
        }
        else {
            mod = &_Ty_ID(builtins);
        }
    }
    return mod;
}

static inline TyObject *
type_get_module(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    return type_module(type);
}

static int
type_set_module(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (!check_set_special_type_attr(type, value, "__module__"))
        return -1;

    TyType_Modified(type);

    TyObject *dict = lookup_tp_dict(type);
    if (TyDict_Pop(dict, &_Ty_ID(__firstlineno__), NULL) < 0) {
        return -1;
    }
    return TyDict_SetItem(dict, &_Ty_ID(__module__), value);
}


TyObject *
_TyType_GetFullyQualifiedName(TyTypeObject *type, char sep)
{
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        return TyUnicode_FromString(type->tp_name);
    }

    TyObject *qualname = type_qualname((TyObject *)type, NULL);
    if (qualname == NULL) {
        return NULL;
    }

    TyObject *module = type_module(type);
    if (module == NULL) {
        Ty_DECREF(qualname);
        return NULL;
    }

    TyObject *result;
    if (TyUnicode_Check(module)
        && !_TyUnicode_Equal(module, &_Ty_ID(builtins))
        && !_TyUnicode_Equal(module, &_Ty_ID(__main__)))
    {
        result = TyUnicode_FromFormat("%U%c%U", module, sep, qualname);
    }
    else {
        result = Ty_NewRef(qualname);
    }
    Ty_DECREF(module);
    Ty_DECREF(qualname);
    return result;
}

TyObject *
TyType_GetFullyQualifiedName(TyTypeObject *type)
{
    return _TyType_GetFullyQualifiedName(type, '.');
}

static TyObject *
type_abstractmethods(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    TyObject *res = NULL;
    /* type itself has an __abstractmethods__ descriptor (this). Don't return
       that. */
    if (type == &TyType_Type) {
        TyErr_SetObject(TyExc_AttributeError, &_Ty_ID(__abstractmethods__));
    }
    else {
        TyObject *dict = lookup_tp_dict(type);
        if (TyDict_GetItemRef(dict, &_Ty_ID(__abstractmethods__), &res) == 0) {
            TyErr_SetObject(TyExc_AttributeError, &_Ty_ID(__abstractmethods__));
        }
    }
    return res;
}

static int
type_set_abstractmethods(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    /* __abstractmethods__ should only be set once on a type, in
       abc.ABCMeta.__new__, so this function doesn't do anything
       special to update subclasses.
    */
    int abstract, res;
    TyObject *dict = lookup_tp_dict(type);
    if (value != NULL) {
        abstract = PyObject_IsTrue(value);
        if (abstract < 0)
            return -1;
        res = TyDict_SetItem(dict, &_Ty_ID(__abstractmethods__), value);
    }
    else {
        abstract = 0;
        res = TyDict_Pop(dict, &_Ty_ID(__abstractmethods__), NULL);
        if (res == 0) {
            TyErr_SetObject(TyExc_AttributeError, &_Ty_ID(__abstractmethods__));
            return -1;
        }
    }
    if (res < 0) {
        return -1;
    }

    BEGIN_TYPE_LOCK();
    type_modified_unlocked(type);
    if (abstract)
        type_add_flags(type, Ty_TPFLAGS_IS_ABSTRACT);
    else
        type_clear_flags(type, Ty_TPFLAGS_IS_ABSTRACT);
    END_TYPE_LOCK();

    return 0;
}

static TyObject *
type_get_bases(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    TyObject *bases = _TyType_GetBases(type);
    if (bases == NULL) {
        Py_RETURN_NONE;
    }
    return bases;
}

static TyObject *
type_get_mro(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    TyObject *mro;

    BEGIN_TYPE_LOCK();
    mro = lookup_tp_mro(type);
    if (mro == NULL) {
        mro = Ty_None;
    } else {
        Ty_INCREF(mro);
    }

    END_TYPE_LOCK();
    return mro;
}

static TyTypeObject *best_base(TyObject *);
static int mro_internal(TyTypeObject *, TyObject **);
static int type_is_subtype_base_chain(TyTypeObject *, TyTypeObject *);
static int compatible_for_assignment(TyTypeObject *, TyTypeObject *, const char *);
static int add_subclass(TyTypeObject*, TyTypeObject*);
static int add_all_subclasses(TyTypeObject *type, TyObject *bases);
static void remove_subclass(TyTypeObject *, TyTypeObject *);
static void remove_all_subclasses(TyTypeObject *type, TyObject *bases);
static void update_all_slots(TyTypeObject *);

typedef int (*update_callback)(TyTypeObject *, void *);
static int update_subclasses(TyTypeObject *type, TyObject *attr_name,
                             update_callback callback, void *data);
static int recurse_down_subclasses(TyTypeObject *type, TyObject *name,
                                   update_callback callback, void *data);

static int
mro_hierarchy(TyTypeObject *type, TyObject *temp)
{
    ASSERT_TYPE_LOCK_HELD();

    TyObject *old_mro;
    int res = mro_internal(type, &old_mro);
    if (res <= 0) {
        /* error / reentrance */
        return res;
    }
    TyObject *new_mro = lookup_tp_mro(type);

    TyObject *tuple;
    if (old_mro != NULL) {
        tuple = TyTuple_Pack(3, type, new_mro, old_mro);
    }
    else {
        tuple = TyTuple_Pack(2, type, new_mro);
    }

    if (tuple != NULL) {
        res = TyList_Append(temp, tuple);
    }
    else {
        res = -1;
    }
    Ty_XDECREF(tuple);

    if (res < 0) {
        set_tp_mro(type, old_mro, 0);
        Ty_DECREF(new_mro);
        return -1;
    }
    Ty_XDECREF(old_mro);

    // Avoid creating an empty list if there is no subclass
    if (_TyType_HasSubclasses(type)) {
        /* Obtain a copy of subclasses list to iterate over.

           Otherwise type->tp_subclasses might be altered
           in the middle of the loop, for example, through a custom mro(),
           by invoking type_set_bases on some subclass of the type
           which in turn calls remove_subclass/add_subclass on this type.

           Finally, this makes things simple avoiding the need to deal
           with dictionary iterators and weak references.
        */
        TyObject *subclasses = _TyType_GetSubclasses(type);
        if (subclasses == NULL) {
            return -1;
        }

        Ty_ssize_t n = TyList_GET_SIZE(subclasses);
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyTypeObject *subclass = _TyType_CAST(TyList_GET_ITEM(subclasses, i));
            res = mro_hierarchy(subclass, temp);
            if (res < 0) {
                break;
            }
        }
        Ty_DECREF(subclasses);
    }

    return res;
}

static int
type_set_bases_unlocked(TyTypeObject *type, TyObject *new_bases)
{
    // Check arguments
    if (!check_set_special_type_attr(type, new_bases, "__bases__")) {
        return -1;
    }
    assert(new_bases != NULL);

    if (!TyTuple_Check(new_bases)) {
        TyErr_Format(TyExc_TypeError,
             "can only assign tuple to %s.__bases__, not %s",
                 type->tp_name, Ty_TYPE(new_bases)->tp_name);
        return -1;
    }
    if (TyTuple_GET_SIZE(new_bases) == 0) {
        TyErr_Format(TyExc_TypeError,
             "can only assign non-empty tuple to %s.__bases__, not ()",
                 type->tp_name);
        return -1;
    }
    Ty_ssize_t n = TyTuple_GET_SIZE(new_bases);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *ob = TyTuple_GET_ITEM(new_bases, i);
        if (!TyType_Check(ob)) {
            TyErr_Format(TyExc_TypeError,
                         "%s.__bases__ must be tuple of classes, not '%s'",
                         type->tp_name, Ty_TYPE(ob)->tp_name);
            return -1;
        }
        TyTypeObject *base = (TyTypeObject*)ob;

        if (is_subtype_with_mro(lookup_tp_mro(base), base, type) ||
            /* In case of reentering here again through a custom mro()
               the above check is not enough since it relies on
               base->tp_mro which would gonna be updated inside
               mro_internal only upon returning from the mro().

               However, base->tp_base has already been assigned (see
               below), which in turn may cause an inheritance cycle
               through tp_base chain.  And this is definitely
               not what you want to ever happen.  */
            (lookup_tp_mro(base) != NULL
             && type_is_subtype_base_chain(base, type)))
        {
            TyErr_SetString(TyExc_TypeError,
                            "a __bases__ item causes an inheritance cycle");
            return -1;
        }
    }

    // Compute the new MRO and the new base class
    TyTypeObject *new_base = best_base(new_bases);
    if (new_base == NULL)
        return -1;

    if (!compatible_for_assignment(type->tp_base, new_base, "__bases__")) {
        return -1;
    }

    TyObject *old_bases = lookup_tp_bases(type);
    assert(old_bases != NULL);
    TyTypeObject *old_base = type->tp_base;

    set_tp_bases(type, Ty_NewRef(new_bases), 0);
    type->tp_base = (TyTypeObject *)Ty_NewRef(new_base);

    TyObject *temp = TyList_New(0);
    if (temp == NULL) {
        goto bail;
    }
    if (mro_hierarchy(type, temp) < 0) {
        goto undo;
    }
    Ty_DECREF(temp);

    /* Take no action in case if type->tp_bases has been replaced
       through reentrance.  */
    int res;
    if (lookup_tp_bases(type) == new_bases) {
        /* any base that was in __bases__ but now isn't, we
           need to remove |type| from its tp_subclasses.
           conversely, any class now in __bases__ that wasn't
           needs to have |type| added to its subclasses. */

        /* for now, sod that: just remove from all old_bases,
           add to all new_bases */
        remove_all_subclasses(type, old_bases);
        res = add_all_subclasses(type, new_bases);
        update_all_slots(type);
    }
    else {
        res = 0;
    }

    RARE_EVENT_INC(set_bases);
    Ty_DECREF(old_bases);
    Ty_DECREF(old_base);

    assert(_TyType_CheckConsistency(type));
    return res;

  undo:
    n = TyList_GET_SIZE(temp);
    for (Ty_ssize_t i = n - 1; i >= 0; i--) {
        TyTypeObject *cls;
        TyObject *new_mro, *old_mro = NULL;

        TyArg_UnpackTuple(TyList_GET_ITEM(temp, i),
                          "", 2, 3, &cls, &new_mro, &old_mro);
        /* Do not rollback if cls has a newer version of MRO.  */
        if (lookup_tp_mro(cls) == new_mro) {
            set_tp_mro(cls, Ty_XNewRef(old_mro), 0);
            Ty_DECREF(new_mro);
        }
    }
    Ty_DECREF(temp);

  bail:
    if (lookup_tp_bases(type) == new_bases) {
        assert(type->tp_base == new_base);

        set_tp_bases(type, old_bases, 0);
        type->tp_base = old_base;

        Ty_DECREF(new_bases);
        Ty_DECREF(new_base);
    }
    else {
        Ty_DECREF(old_bases);
        Ty_DECREF(old_base);
    }

    assert(_TyType_CheckConsistency(type));
    return -1;
}

static int
type_set_bases(TyObject *tp, TyObject *new_bases, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    int res;
    BEGIN_TYPE_LOCK();
    res = type_set_bases_unlocked(type, new_bases);
    END_TYPE_LOCK();
    return res;
}

static TyObject *
type_dict(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    TyObject *dict = lookup_tp_dict(type);
    if (dict == NULL) {
        Py_RETURN_NONE;
    }
    return PyDictProxy_New(dict);
}

static TyObject *
type_get_doc(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    TyObject *result;
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE) && type->tp_doc != NULL) {
        return _TyType_GetDocFromInternalDoc(type->tp_name, type->tp_doc);
    }
    TyObject *dict = lookup_tp_dict(type);
    if (TyDict_GetItemRef(dict, &_Ty_ID(__doc__), &result) == 0) {
        result = Ty_NewRef(Ty_None);
    }
    else if (result) {
        descrgetfunc descr_get = Ty_TYPE(result)->tp_descr_get;
        if (descr_get) {
            Ty_SETREF(result, descr_get(result, NULL, (TyObject *)type));
        }
    }
    return result;
}

static TyObject *
type_get_text_signature(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    return _TyType_GetTextSignatureFromInternalDoc(type->tp_name, type->tp_doc, 0);
}

static int
type_set_doc(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (!check_set_special_type_attr(type, value, "__doc__"))
        return -1;
    TyType_Modified(type);
    TyObject *dict = lookup_tp_dict(type);
    return TyDict_SetItem(dict, &_Ty_ID(__doc__), value);
}

static TyObject *
type_get_annotate(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        TyErr_Format(TyExc_AttributeError, "type object '%s' has no attribute '__annotate__'", type->tp_name);
        return NULL;
    }

    TyObject *annotate;
    TyObject *dict = TyType_GetDict(type);
    // First try __annotate__, in case that's been set explicitly
    if (TyDict_GetItemRef(dict, &_Ty_ID(__annotate__), &annotate) < 0) {
        Ty_DECREF(dict);
        return NULL;
    }
    if (!annotate) {
        if (TyDict_GetItemRef(dict, &_Ty_ID(__annotate_func__), &annotate) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }
    if (annotate) {
        descrgetfunc get = Ty_TYPE(annotate)->tp_descr_get;
        if (get) {
            Ty_SETREF(annotate, get(annotate, NULL, (TyObject *)type));
        }
    }
    else {
        annotate = Ty_None;
        int result = TyDict_SetItem(dict, &_Ty_ID(__annotate_func__), annotate);
        if (result < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }
    Ty_DECREF(dict);
    return annotate;
}

static int
type_set_annotate(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "cannot delete __annotate__ attribute");
        return -1;
    }
    if (_TyType_HasFeature(type, Ty_TPFLAGS_IMMUTABLETYPE)) {
        TyErr_Format(TyExc_TypeError,
                     "cannot set '__annotate__' attribute of immutable type '%s'",
                     type->tp_name);
        return -1;
    }

    if (!Ty_IsNone(value) && !PyCallable_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "__annotate__ must be callable or None");
        return -1;
    }

    TyObject *dict = TyType_GetDict(type);
    assert(TyDict_Check(dict));
    int result = TyDict_SetItem(dict, &_Ty_ID(__annotate_func__), value);
    if (result < 0) {
        Ty_DECREF(dict);
        return -1;
    }
    if (!Ty_IsNone(value)) {
        if (TyDict_Pop(dict, &_Ty_ID(__annotations_cache__), NULL) == -1) {
            Ty_DECREF(dict);
            TyType_Modified(type);
            return -1;
        }
    }
    Ty_DECREF(dict);
    TyType_Modified(type);
    return 0;
}

static TyObject *
type_get_annotations(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        TyErr_Format(TyExc_AttributeError, "type object '%s' has no attribute '__annotations__'", type->tp_name);
        return NULL;
    }

    TyObject *annotations;
    TyObject *dict = TyType_GetDict(type);
    // First try __annotations__ (e.g. for "from __future__ import annotations")
    if (TyDict_GetItemRef(dict, &_Ty_ID(__annotations__), &annotations) < 0) {
        Ty_DECREF(dict);
        return NULL;
    }
    if (!annotations) {
        if (TyDict_GetItemRef(dict, &_Ty_ID(__annotations_cache__), &annotations) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }

    if (annotations) {
        descrgetfunc get = Ty_TYPE(annotations)->tp_descr_get;
        if (get) {
            Ty_SETREF(annotations, get(annotations, NULL, tp));
        }
    }
    else {
        TyObject *annotate = PyObject_GetAttrString((TyObject *)type, "__annotate__");
        if (annotate == NULL) {
            Ty_DECREF(dict);
            return NULL;
        }
        if (PyCallable_Check(annotate)) {
            TyObject *one = _TyLong_GetOne();
            annotations = _TyObject_CallOneArg(annotate, one);
            if (annotations == NULL) {
                Ty_DECREF(dict);
                Ty_DECREF(annotate);
                return NULL;
            }
            if (!TyDict_Check(annotations)) {
                TyErr_Format(TyExc_TypeError, "__annotate__ returned non-dict of type '%.100s'",
                             Ty_TYPE(annotations)->tp_name);
                Ty_DECREF(annotations);
                Ty_DECREF(annotate);
                Ty_DECREF(dict);
                return NULL;
            }
        }
        else {
            annotations = TyDict_New();
        }
        Ty_DECREF(annotate);
        if (annotations) {
            int result = TyDict_SetItem(
                    dict, &_Ty_ID(__annotations_cache__), annotations);
            if (result) {
                Ty_CLEAR(annotations);
            } else {
                TyType_Modified(type);
            }
        }
    }
    Ty_DECREF(dict);
    return annotations;
}

static int
type_set_annotations(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (_TyType_HasFeature(type, Ty_TPFLAGS_IMMUTABLETYPE)) {
        TyErr_Format(TyExc_TypeError,
                     "cannot set '__annotations__' attribute of immutable type '%s'",
                     type->tp_name);
        return -1;
    }

    TyObject *dict = TyType_GetDict(type);
    int result = TyDict_ContainsString(dict, "__annotations__");
    if (result < 0) {
        Ty_DECREF(dict);
        return -1;
    }
    if (result) {
        // If __annotations__ is currently in the dict, we update it,
        if (value != NULL) {
            result = TyDict_SetItem(dict, &_Ty_ID(__annotations__), value);
        } else {
            result = TyDict_Pop(dict, &_Ty_ID(__annotations__), NULL);
            if (result == 0) {
                // Somebody else just deleted it?
                TyErr_SetString(TyExc_AttributeError, "__annotations__");
                Ty_DECREF(dict);
                return -1;
            }
        }
        if (result < 0) {
            Ty_DECREF(dict);
            return -1;
        }
        // Also clear __annotations_cache__ just in case.
        result = TyDict_Pop(dict, &_Ty_ID(__annotations_cache__), NULL);
    }
    else {
        // Else we update only __annotations_cache__.
        if (value != NULL) {
            /* set */
            result = TyDict_SetItem(dict, &_Ty_ID(__annotations_cache__), value);
        } else {
            /* delete */
            result = TyDict_Pop(dict, &_Ty_ID(__annotations_cache__), NULL);
            if (result == 0) {
                TyErr_SetString(TyExc_AttributeError, "__annotations__");
                Ty_DECREF(dict);
                return -1;
            }
        }
    }
    if (result < 0) {
        Ty_DECREF(dict);
        return -1;
    } else {  // result can be 0 or 1
        if (TyDict_Pop(dict, &_Ty_ID(__annotate_func__), NULL) < 0) {
            TyType_Modified(type);
            Ty_DECREF(dict);
            return -1;
        }
        if (TyDict_Pop(dict, &_Ty_ID(__annotate__), NULL) < 0) {
            TyType_Modified(type);
            Ty_DECREF(dict);
            return -1;
        }
    }
    TyType_Modified(type);
    Ty_DECREF(dict);
    return 0;
}

static TyObject *
type_get_type_params(TyObject *tp, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (type == &TyType_Type) {
        return TyTuple_New(0);
    }

    TyObject *params;
    if (TyDict_GetItemRef(lookup_tp_dict(type), &_Ty_ID(__type_params__), &params) == 0) {
        return TyTuple_New(0);
    }
    return params;
}

static int
type_set_type_params(TyObject *tp, TyObject *value, void *Py_UNUSED(closure))
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    if (!check_set_special_type_attr(type, value, "__type_params__")) {
        return -1;
    }

    TyObject *dict = lookup_tp_dict(type);
    int result = TyDict_SetItem(dict, &_Ty_ID(__type_params__), value);

    if (result == 0) {
        TyType_Modified(type);
    }
    return result;
}


/*[clinic input]
type.__instancecheck__ -> bool

    instance: object
    /

Check if an object is an instance.
[clinic start generated code]*/

static int
type___instancecheck___impl(TyTypeObject *self, TyObject *instance)
/*[clinic end generated code: output=08b6bf5f591c3618 input=cdbfeaee82c01a0f]*/
{
    return _TyObject_RealIsInstance(instance, (TyObject *)self);
}

/*[clinic input]
type.__subclasscheck__ -> bool

    subclass: object
    /

Check if a class is a subclass.
[clinic start generated code]*/

static int
type___subclasscheck___impl(TyTypeObject *self, TyObject *subclass)
/*[clinic end generated code: output=97a4e51694500941 input=071b2ca9e03355f4]*/
{
    return _TyObject_RealIsSubclass(subclass, (TyObject *)self);
}


static TyGetSetDef type_getsets[] = {
    {"__name__", type_name, type_set_name, NULL},
    {"__qualname__", type_qualname, type_set_qualname, NULL},
    {"__bases__", type_get_bases, type_set_bases, NULL},
    {"__mro__", type_get_mro, NULL, NULL},
    {"__module__", type_get_module, type_set_module, NULL},
    {"__abstractmethods__", type_abstractmethods,
     type_set_abstractmethods, NULL},
    {"__dict__",  type_dict,  NULL, NULL},
    {"__doc__", type_get_doc, type_set_doc, NULL},
    {"__text_signature__", type_get_text_signature, NULL, NULL},
    {"__annotations__", type_get_annotations, type_set_annotations, NULL},
    {"__annotate__", type_get_annotate, type_set_annotate, NULL},
    {"__type_params__", type_get_type_params, type_set_type_params, NULL},
    {0}
};

static TyObject *
type_repr(TyObject *self)
{
    TyTypeObject *type = PyTypeObject_CAST(self);
    if (type->tp_name == NULL) {
        // type_repr() called before the type is fully initialized
        // by TyType_Ready().
        return TyUnicode_FromFormat("<class at %p>", type);
    }

    TyObject *mod = type_module(type);
    if (mod == NULL) {
        TyErr_Clear();
    }
    else if (!TyUnicode_Check(mod)) {
        Ty_CLEAR(mod);
    }

    TyObject *name = type_qualname(self, NULL);
    if (name == NULL) {
        Ty_XDECREF(mod);
        return NULL;
    }

    TyObject *result;
    if (mod != NULL && !_TyUnicode_Equal(mod, &_Ty_ID(builtins))) {
        result = TyUnicode_FromFormat("<class '%U.%U'>", mod, name);
    }
    else {
        result = TyUnicode_FromFormat("<class '%s'>", type->tp_name);
    }
    Ty_XDECREF(mod);
    Ty_DECREF(name);

    return result;
}

static TyObject *
type_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyTypeObject *type = PyTypeObject_CAST(self);
    TyObject *obj;
    TyThreadState *tstate = _TyThreadState_GET();

#ifdef Ty_DEBUG
    /* type_call() must not be called with an exception set,
       because it can clear it (directly or indirectly) and so the
       caller loses its exception */
    assert(!_TyErr_Occurred(tstate));
#endif

    /* Special case: type(x) should return Ty_TYPE(x) */
    /* We only want type itself to accept the one-argument form (#27157) */
    if (type == &TyType_Type) {
        assert(args != NULL && TyTuple_Check(args));
        assert(kwds == NULL || TyDict_Check(kwds));
        Ty_ssize_t nargs = TyTuple_GET_SIZE(args);

        if (nargs == 1 && (kwds == NULL || !TyDict_GET_SIZE(kwds))) {
            obj = (TyObject *) Ty_TYPE(TyTuple_GET_ITEM(args, 0));
            return Ty_NewRef(obj);
        }

        /* SF bug 475327 -- if that didn't trigger, we need 3
           arguments. But TyArg_ParseTuple in type_new may give
           a msg saying type() needs exactly 3. */
        if (nargs != 3) {
            TyErr_SetString(TyExc_TypeError,
                            "type() takes 1 or 3 arguments");
            return NULL;
        }
    }

    if (type->tp_new == NULL) {
        _TyErr_Format(tstate, TyExc_TypeError,
                      "cannot create '%s' instances", type->tp_name);
        return NULL;
    }

    obj = type->tp_new(type, args, kwds);
    obj = _Ty_CheckFunctionResult(tstate, (TyObject*)type, obj, NULL);
    if (obj == NULL)
        return NULL;

    /* If the returned object is not an instance of type,
       it won't be initialized. */
    if (!PyObject_TypeCheck(obj, type))
        return obj;

    type = Ty_TYPE(obj);
    if (type->tp_init != NULL) {
        int res = type->tp_init(obj, args, kwds);
        if (res < 0) {
            assert(_TyErr_Occurred(tstate));
            Ty_SETREF(obj, NULL);
        }
        else {
            assert(!_TyErr_Occurred(tstate));
        }
    }
    return obj;
}

TyObject *
_TyType_NewManagedObject(TyTypeObject *type)
{
    assert(type->tp_flags & Ty_TPFLAGS_INLINE_VALUES);
    assert(_TyType_IS_GC(type));
    assert(type->tp_new == PyBaseObject_Type.tp_new);
    assert(type->tp_alloc == TyType_GenericAlloc);
    assert(type->tp_itemsize == 0);
    TyObject *obj = TyType_GenericAlloc(type, 0);
    if (obj == NULL) {
        return TyErr_NoMemory();
    }
    return obj;
}

TyObject *
_TyType_AllocNoTrack(TyTypeObject *type, Ty_ssize_t nitems)
{
    TyObject *obj;
    /* The +1 on nitems is needed for most types but not all. We could save a
     * bit of space by allocating one less item in certain cases, depending on
     * the type. However, given the extra complexity (e.g. an additional type
     * flag to indicate when that is safe) it does not seem worth the memory
     * savings. An example type that doesn't need the +1 is a subclass of
     * tuple. See GH-100659 and GH-81381. */
    size_t size = _TyObject_VAR_SIZE(type, nitems+1);

    const size_t presize = _TyType_PreHeaderSize(type);
    if (type->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        assert(type->tp_itemsize == 0);
        size += _PyInlineValuesSize(type);
    }
    char *alloc = _TyObject_MallocWithType(type, size + presize);
    if (alloc  == NULL) {
        return TyErr_NoMemory();
    }
    obj = (TyObject *)(alloc + presize);
    if (presize) {
        ((TyObject **)alloc)[0] = NULL;
        ((TyObject **)alloc)[1] = NULL;
    }
    if (TyType_IS_GC(type)) {
        _TyObject_GC_Link(obj);
    }
    // Zero out the object after the TyObject header. The header fields are
    // initialized by _TyObject_Init[Var]().
    memset((char *)obj + sizeof(TyObject), 0, size - sizeof(TyObject));

    if (type->tp_itemsize == 0) {
        _TyObject_Init(obj, type);
    }
    else {
        _TyObject_InitVar((TyVarObject *)obj, type, nitems);
    }
    if (type->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        _TyObject_InitInlineValues(obj, type);
    }
    return obj;
}

TyObject *
TyType_GenericAlloc(TyTypeObject *type, Ty_ssize_t nitems)
{
    TyObject *obj = _TyType_AllocNoTrack(type, nitems);
    if (obj == NULL) {
        return NULL;
    }

    if (_TyType_IS_GC(type)) {
        _TyObject_GC_TRACK(obj);
    }
    return obj;
}

TyObject *
TyType_GenericNew(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    return type->tp_alloc(type, 0);
}

/* Helpers for subtyping */

static inline TyMemberDef *
_PyHeapType_GET_MEMBERS(PyHeapTypeObject* type)
{
    return PyObject_GetItemData((TyObject *)type);
}

static int
traverse_slots(TyTypeObject *type, TyObject *self, visitproc visit, void *arg)
{
    Ty_ssize_t i, n;
    TyMemberDef *mp;

    n = Ty_SIZE(type);
    mp = _PyHeapType_GET_MEMBERS((PyHeapTypeObject *)type);
    for (i = 0; i < n; i++, mp++) {
        if (mp->type == Ty_T_OBJECT_EX) {
            char *addr = (char *)self + mp->offset;
            TyObject *obj = *(TyObject **)addr;
            if (obj != NULL) {
                int err = visit(obj, arg);
                if (err)
                    return err;
            }
        }
    }
    return 0;
}

static int
subtype_traverse(TyObject *self, visitproc visit, void *arg)
{
    TyTypeObject *type, *base;
    traverseproc basetraverse;

    /* Find the nearest base with a different tp_traverse,
       and traverse slots while we're at it */
    type = Ty_TYPE(self);
    base = type;
    while ((basetraverse = base->tp_traverse) == subtype_traverse) {
        if (Ty_SIZE(base)) {
            int err = traverse_slots(base, self, visit, arg);
            if (err)
                return err;
        }
        base = base->tp_base;
        assert(base);
    }

    if (type->tp_dictoffset != base->tp_dictoffset) {
        assert(base->tp_dictoffset == 0);
        if (type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
            assert(type->tp_dictoffset == -1);
            int err = PyObject_VisitManagedDict(self, visit, arg);
            if (err) {
                return err;
            }
        }
        else {
            TyObject **dictptr = _TyObject_ComputedDictPointer(self);
            if (dictptr && *dictptr) {
                Ty_VISIT(*dictptr);
            }
        }
    }

    if (type->tp_flags & Ty_TPFLAGS_HEAPTYPE
        && (!basetraverse || !(base->tp_flags & Ty_TPFLAGS_HEAPTYPE))) {
        /* For a heaptype, the instances count as references
           to the type.          Traverse the type so the collector
           can find cycles involving this link.
           Skip this visit if basetraverse belongs to a heap type: in that
           case, basetraverse will visit the type when we call it later.
           */
        Ty_VISIT(type);
    }

    if (basetraverse)
        return basetraverse(self, visit, arg);
    return 0;
}

static void
clear_slots(TyTypeObject *type, TyObject *self)
{
    Ty_ssize_t i, n;
    TyMemberDef *mp;

    n = Ty_SIZE(type);
    mp = _PyHeapType_GET_MEMBERS((PyHeapTypeObject *)type);
    for (i = 0; i < n; i++, mp++) {
        if (mp->type == Ty_T_OBJECT_EX && !(mp->flags & Py_READONLY)) {
            char *addr = (char *)self + mp->offset;
            TyObject *obj = *(TyObject **)addr;
            if (obj != NULL) {
                *(TyObject **)addr = NULL;
                Ty_DECREF(obj);
            }
        }
    }
}

static int
subtype_clear(TyObject *self)
{
    TyTypeObject *type, *base;
    inquiry baseclear;

    /* Find the nearest base with a different tp_clear
       and clear slots while we're at it */
    type = Ty_TYPE(self);
    base = type;
    while ((baseclear = base->tp_clear) == subtype_clear) {
        if (Ty_SIZE(base))
            clear_slots(base, self);
        base = base->tp_base;
        assert(base);
    }

    /* Clear the instance dict (if any), to break cycles involving only
       __dict__ slots (as in the case 'self.__dict__ is self'). */
    if (type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        if ((base->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0) {
            PyObject_ClearManagedDict(self);
        }
        else {
            assert((base->tp_flags & Ty_TPFLAGS_INLINE_VALUES) ==
                   (type->tp_flags & Ty_TPFLAGS_INLINE_VALUES));
        }
    }
    else if (type->tp_dictoffset != base->tp_dictoffset) {
        TyObject **dictptr = _TyObject_ComputedDictPointer(self);
        if (dictptr && *dictptr)
            Ty_CLEAR(*dictptr);
    }

    if (baseclear)
        return baseclear(self);
    return 0;
}

static void
subtype_dealloc(TyObject *self)
{
    TyTypeObject *type, *base;
    destructor basedealloc;
    int has_finalizer;

    /* Extract the type; we expect it to be a heap type */
    type = Ty_TYPE(self);
    _TyObject_ASSERT((TyObject *)type, type->tp_flags & Ty_TPFLAGS_HEAPTYPE);

    /* Test whether the type has GC exactly once */

    if (!_TyType_IS_GC(type)) {
        /* A non GC dynamic type allows certain simplifications:
           there's no need to call clear_slots(), or DECREF the dict,
           or clear weakrefs. */

        /* Maybe call finalizer; exit early if resurrected */
        if (type->tp_finalize) {
            if (PyObject_CallFinalizerFromDealloc(self) < 0)
                return;
        }
        if (type->tp_del) {
            type->tp_del(self);
            if (Ty_REFCNT(self) > 0) {
                return;
            }
        }

        /* Find the nearest base with a different tp_dealloc */
        base = type;
        while ((basedealloc = base->tp_dealloc) == subtype_dealloc) {
            base = base->tp_base;
            assert(base);
        }

        /* Extract the type again; tp_del may have changed it */
        type = Ty_TYPE(self);

        // Don't read type memory after calling basedealloc() since basedealloc()
        // can deallocate the type and free its memory.
        int type_needs_decref = (type->tp_flags & Ty_TPFLAGS_HEAPTYPE
                                 && !(base->tp_flags & Ty_TPFLAGS_HEAPTYPE));

        assert((type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0);

        /* Call the base tp_dealloc() */
        assert(basedealloc);
        basedealloc(self);

        /* Can't reference self beyond this point. It's possible tp_del switched
           our type from a HEAPTYPE to a non-HEAPTYPE, so be careful about
           reference counting. Only decref if the base type is not already a heap
           allocated type. Otherwise, basedealloc should have decref'd it already */
        if (type_needs_decref) {
            _Ty_DECREF_TYPE(type);
        }

        /* Done */
        return;
    }

    /* We get here only if the type has GC */

    /* UnTrack and re-Track around the trashcan macro, alas */
    /* See explanation at end of function for full disclosure */
    PyObject_GC_UnTrack(self);

    /* Find the nearest base with a different tp_dealloc */
    base = type;
    while ((/*basedealloc =*/ base->tp_dealloc) == subtype_dealloc) {
        base = base->tp_base;
        assert(base);
    }

    has_finalizer = type->tp_finalize || type->tp_del;

    if (type->tp_finalize) {
        _TyObject_GC_TRACK(self);
        if (PyObject_CallFinalizerFromDealloc(self) < 0) {
            /* Resurrected */
            return;
        }
        _TyObject_GC_UNTRACK(self);
    }
    /*
      If we added a weaklist, we clear it. Do this *before* calling tp_del,
      clearing slots, or clearing the instance dict.

      GC tracking must be off at this point. weakref callbacks (if any, and
      whether directly here or indirectly in something we call) may trigger GC,
      and if self is tracked at that point, it will look like trash to GC and GC
      will try to delete self again.
    */
    if (type->tp_weaklistoffset && !base->tp_weaklistoffset) {
        PyObject_ClearWeakRefs(self);
    }

    if (type->tp_del) {
        _TyObject_GC_TRACK(self);
        type->tp_del(self);
        if (Ty_REFCNT(self) > 0) {
            /* Resurrected */
            return;
        }
        _TyObject_GC_UNTRACK(self);
    }
    if (has_finalizer) {
        /* New weakrefs could be created during the finalizer call.
           If this occurs, clear them out without calling their
           finalizers since they might rely on part of the object
           being finalized that has already been destroyed. */
        if (type->tp_weaklistoffset && !base->tp_weaklistoffset) {
            _TyWeakref_ClearWeakRefsNoCallbacks(self);
        }
    }

    /*  Clear slots up to the nearest base with a different tp_dealloc */
    base = type;
    while ((basedealloc = base->tp_dealloc) == subtype_dealloc) {
        if (Ty_SIZE(base))
            clear_slots(base, self);
        base = base->tp_base;
        assert(base);
    }

    /* If we added a dict, DECREF it, or free inline values. */
    if (type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        PyObject_ClearManagedDict(self);
    }
    else if (type->tp_dictoffset && !base->tp_dictoffset) {
        TyObject **dictptr = _TyObject_ComputedDictPointer(self);
        if (dictptr != NULL) {
            TyObject *dict = *dictptr;
            if (dict != NULL) {
                Ty_DECREF(dict);
                *dictptr = NULL;
            }
        }
    }

    /* Extract the type again; tp_del may have changed it */
    type = Ty_TYPE(self);

    /* Call the base tp_dealloc(); first retrack self if
     * basedealloc knows about gc.
     */
    if (_TyType_IS_GC(base)) {
        _TyObject_GC_TRACK(self);
    }

    // Don't read type memory after calling basedealloc() since basedealloc()
    // can deallocate the type and free its memory.
    int type_needs_decref = (type->tp_flags & Ty_TPFLAGS_HEAPTYPE
                             && !(base->tp_flags & Ty_TPFLAGS_HEAPTYPE));

    assert(basedealloc);
    basedealloc(self);

    /* Can't reference self beyond this point. It's possible tp_del switched
       our type from a HEAPTYPE to a non-HEAPTYPE, so be careful about
       reference counting. Only decref if the base type is not already a heap
       allocated type. Otherwise, basedealloc should have decref'd it already */
    if (type_needs_decref) {
        _Ty_DECREF_TYPE(type);
    }
}

static TyTypeObject *solid_base(TyTypeObject *type);

/* type test with subclassing support */

static int
type_is_subtype_base_chain(TyTypeObject *a, TyTypeObject *b)
{
    do {
        if (a == b)
            return 1;
        a = a->tp_base;
    } while (a != NULL);

    return (b == &PyBaseObject_Type);
}

static int
is_subtype_with_mro(TyObject *a_mro, TyTypeObject *a, TyTypeObject *b)
{
    int res;
    if (a_mro != NULL) {
        /* Deal with multiple inheritance without recursion
           by walking the MRO tuple */
        Ty_ssize_t i, n;
        assert(TyTuple_Check(a_mro));
        n = TyTuple_GET_SIZE(a_mro);
        res = 0;
        for (i = 0; i < n; i++) {
            if (TyTuple_GET_ITEM(a_mro, i) == (TyObject *)b) {
                res = 1;
                break;
            }
        }
    }
    else {
        /* a is not completely initialized yet; follow tp_base */
        res = type_is_subtype_base_chain(a, b);
    }
    return res;
}

int
TyType_IsSubtype(TyTypeObject *a, TyTypeObject *b)
{
    return is_subtype_with_mro(a->tp_mro, a, b);
}

/* Routines to do a method lookup in the type without looking in the
   instance dictionary (so we can't use PyObject_GetAttr) but still
   binding it to the instance.

   Variants:

   - _TyObject_LookupSpecial() returns NULL without raising an exception
     when the _TyType_LookupRef() call fails;

   - lookup_maybe_method() and lookup_method() are internal routines similar
     to _TyObject_LookupSpecial(), but can return unbound PyFunction
     to avoid temporary method object. Pass self as first argument when
     unbound == 1.
*/

TyObject *
_TyObject_LookupSpecial(TyObject *self, TyObject *attr)
{
    TyObject *res;

    res = _TyType_LookupRef(Ty_TYPE(self), attr);
    if (res != NULL) {
        descrgetfunc f;
        if ((f = Ty_TYPE(res)->tp_descr_get) != NULL) {
            Ty_SETREF(res, f(res, self, (TyObject *)(Ty_TYPE(self))));
        }
    }
    return res;
}

// Lookup the method name `attr` on `self`. On entry, `method_and_self[0]`
// is null and `method_and_self[1]` is `self`. On exit, `method_and_self[0]`
// is the method object and `method_and_self[1]` is `self` if the method is
// not bound.
// Return 1 on success, -1 on error, and 0 if the method is missing.
int
_TyObject_LookupSpecialMethod(TyObject *attr, _PyStackRef *method_and_self)
{
    TyObject *self = PyStackRef_AsPyObjectBorrow(method_and_self[1]);
    _TyType_LookupStackRefAndVersion(Ty_TYPE(self), attr, &method_and_self[0]);
    TyObject *method_o = PyStackRef_AsPyObjectBorrow(method_and_self[0]);
    if (method_o == NULL) {
        return 0;
    }

    if (_TyType_HasFeature(Ty_TYPE(method_o), Ty_TPFLAGS_METHOD_DESCRIPTOR)) {
        /* Avoid temporary PyMethodObject */
        return 1;
    }

    descrgetfunc f = Ty_TYPE(method_o)->tp_descr_get;
    if (f != NULL) {
        TyObject *func = f(method_o, self, (TyObject *)(Ty_TYPE(self)));
        if (func == NULL) {
            return -1;
        }
        PyStackRef_CLEAR(method_and_self[0]); // clear method
        method_and_self[0] = PyStackRef_FromPyObjectSteal(func);
    }
    PyStackRef_CLEAR(method_and_self[1]); // clear self
    return 1;
}

static int
lookup_method_ex(TyObject *self, TyObject *attr, _PyStackRef *out,
                 int raise_attribute_error)
{
    _TyType_LookupStackRefAndVersion(Ty_TYPE(self), attr, out);
    if (PyStackRef_IsNull(*out)) {
        if (raise_attribute_error) {
            TyErr_SetObject(TyExc_AttributeError, attr);
        }
        return -1;
    }

    TyObject *value = PyStackRef_AsPyObjectBorrow(*out);
    if (_TyType_HasFeature(Ty_TYPE(value), Ty_TPFLAGS_METHOD_DESCRIPTOR)) {
        /* Avoid temporary PyMethodObject */
        return 1;
    }

    descrgetfunc f = Ty_TYPE(value)->tp_descr_get;
    if (f != NULL) {
        value = f(value, self, (TyObject *)(Ty_TYPE(self)));
        PyStackRef_CLEAR(*out);
        if (value == NULL) {
            if (!raise_attribute_error &&
                TyErr_ExceptionMatches(TyExc_AttributeError))
            {
                TyErr_Clear();
            }
            return -1;
        }
        *out = PyStackRef_FromPyObjectSteal(value);
    }
    return 0;
}

static int
lookup_maybe_method(TyObject *self, TyObject *attr, _PyStackRef *out)
{
    return lookup_method_ex(self, attr, out, 0);
}

static int
lookup_method(TyObject *self, TyObject *attr, _PyStackRef *out)
{
    return lookup_method_ex(self, attr, out, 1);
}


static inline TyObject*
vectorcall_unbound(TyThreadState *tstate, int unbound, TyObject *func,
                   TyObject *const *args, Ty_ssize_t nargs)
{
    size_t nargsf = nargs;
    if (!unbound) {
        /* Skip self argument, freeing up args[0] to use for
         * PY_VECTORCALL_ARGUMENTS_OFFSET */
        args++;
        nargsf = nargsf - 1 + PY_VECTORCALL_ARGUMENTS_OFFSET;
    }
    EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_SLOT, func);
    return _TyObject_VectorcallTstate(tstate, func, args, nargsf, NULL);
}

static TyObject*
call_unbound_noarg(int unbound, TyObject *func, TyObject *self)
{
    if (unbound) {
        return PyObject_CallOneArg(func, self);
    }
    else {
        return _TyObject_CallNoArgs(func);
    }
}

// Call the method with the name `attr` on `self`. Returns NULL with an
// exception set if the method is missing or an error occurs.
static TyObject *
call_method_noarg(TyObject *self, TyObject *attr)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);
    TyObject *res = NULL;
    int unbound = lookup_method(self, attr, &cref.ref);
    if (unbound >= 0) {
        TyObject *func = PyStackRef_AsPyObjectBorrow(cref.ref);
        res = call_unbound_noarg(unbound, func, self);
    }
    _TyThreadState_PopCStackRef(tstate, &cref);
    return res;
}

static TyObject *
call_method(TyObject *self, TyObject *attr, TyObject *args, TyObject *kwds)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);
    TyObject *res = NULL;
    int unbound = lookup_method(self, attr, &cref.ref);
    if (unbound >= 0) {
        TyObject *meth = PyStackRef_AsPyObjectBorrow(cref.ref);
        if (unbound) {
            res = _TyObject_Call_Prepend(tstate, meth, self, args, kwds);
        }
        else {
            res = _TyObject_Call(tstate, meth, args, kwds);
        }
    }
    _TyThreadState_PopCStackRef(tstate, &cref);
    return res;
}

/* A variation of PyObject_CallMethod* that uses lookup_method()
   instead of PyObject_GetAttrString().

   args is an argument vector of length nargs. The first element in this
   vector is the special object "self" which is used for the method lookup */
static TyObject *
vectorcall_method(TyObject *name, TyObject *const *args, Ty_ssize_t nargs)
{
    assert(nargs >= 1);

    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *retval = NULL;
    TyObject *self = args[0];
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);
    int unbound = lookup_method(self, name, &cref.ref);
    if (unbound >= 0) {
        TyObject *func = PyStackRef_AsPyObjectBorrow(cref.ref);
        retval = vectorcall_unbound(tstate, unbound, func, args, nargs);
    }
    _TyThreadState_PopCStackRef(tstate, &cref);
    return retval;
}

/* Clone of vectorcall_method() that returns NotImplemented
 * when the lookup fails. */
static TyObject *
vectorcall_maybe(TyThreadState *tstate, TyObject *name,
                 TyObject *const *args, Ty_ssize_t nargs)
{
    assert(nargs >= 1);

    TyObject *self = args[0];
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);
    int unbound = lookup_maybe_method(self, name, &cref.ref);
    TyObject *func = PyStackRef_AsPyObjectBorrow(cref.ref);
    if (func == NULL) {
        _TyThreadState_PopCStackRef(tstate, &cref);
        if (!TyErr_Occurred()) {
            Py_RETURN_NOTIMPLEMENTED;
        }
        return NULL;
    }
    TyObject *retval = vectorcall_unbound(tstate, unbound, func, args, nargs);
    _TyThreadState_PopCStackRef(tstate, &cref);
    return retval;
}

/* Call the method with the name `attr` on `self`. Returns NULL if the
   method is missing or an error occurs.  No exception is set if
   the method is missing. If attr_is_none is not NULL, it is set to 1 if
   the attribute was found and was None, or 0 if it was not found. */
static TyObject *
maybe_call_special_no_args(TyObject *self, TyObject *attr, int *attr_is_none)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);

    TyObject *res = NULL;
    int unbound = lookup_maybe_method(self, attr, &cref.ref);
    TyObject *func = PyStackRef_AsPyObjectBorrow(cref.ref);
    if (attr_is_none != NULL) {
        *attr_is_none = (func == Ty_None);
    }
    if (func != NULL && (func != Ty_None || attr_is_none == NULL)) {
        res = call_unbound_noarg(unbound, func, self);
    }
    _TyThreadState_PopCStackRef(tstate, &cref);
    return res;
}

static TyObject *
maybe_call_special_one_arg(TyObject *self, TyObject *attr, TyObject *arg,
                           int *attr_is_none)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);

    TyObject *res = NULL;
    int unbound = lookup_maybe_method(self, attr, &cref.ref);
    TyObject *func = PyStackRef_AsPyObjectBorrow(cref.ref);
    if (attr_is_none != NULL) {
        *attr_is_none = (func == Ty_None);
    }
    if (func != NULL && (func != Ty_None || attr_is_none == NULL)) {
        TyObject *args[] = { self, arg };
        res = vectorcall_unbound(tstate, unbound, func, args, 2);
    }
    _TyThreadState_PopCStackRef(tstate, &cref);
    return res;
}

TyObject *
_TyObject_MaybeCallSpecialNoArgs(TyObject *self, TyObject *attr)
{
    return maybe_call_special_no_args(self, attr, NULL);
}

TyObject *
_TyObject_MaybeCallSpecialOneArg(TyObject *self, TyObject *attr, TyObject *arg)
{
    return maybe_call_special_one_arg(self, attr, arg, NULL);
}

/*
    Method resolution order algorithm C3 described in
    "A Monotonic Superclass Linearization for Dylan",
    by Kim Barrett, Bob Cassel, Paul Haahr,
    David A. Moon, Keith Playford, and P. Tucker Withington.
    (OOPSLA 1996)

    Some notes about the rules implied by C3:

    No duplicate bases.
    It isn't legal to repeat a class in a list of base classes.

    The next three properties are the 3 constraints in "C3".

    Local precedence order.
    If A precedes B in C's MRO, then A will precede B in the MRO of all
    subclasses of C.

    Monotonicity.
    The MRO of a class must be an extension without reordering of the
    MRO of each of its superclasses.

    Extended Precedence Graph (EPG).
    Linearization is consistent if there is a path in the EPG from
    each class to all its successors in the linearization.  See
    the paper for definition of EPG.
 */

static int
tail_contains(TyObject *tuple, Ty_ssize_t whence, TyObject *o)
{
    Ty_ssize_t j, size;
    size = TyTuple_GET_SIZE(tuple);

    for (j = whence+1; j < size; j++) {
        if (TyTuple_GET_ITEM(tuple, j) == o)
            return 1;
    }
    return 0;
}

static TyObject *
class_name(TyObject *cls)
{
    TyObject *name;
    if (PyObject_GetOptionalAttr(cls, &_Ty_ID(__name__), &name) == 0) {
        name = PyObject_Repr(cls);
    }
    return name;
}

static int
check_duplicates(TyObject *tuple)
{
    Ty_ssize_t i, j, n;
    /* Let's use a quadratic time algorithm,
       assuming that the bases tuples is short.
    */
    n = TyTuple_GET_SIZE(tuple);
    for (i = 0; i < n; i++) {
        TyObject *o = TyTuple_GET_ITEM(tuple, i);
        for (j = i + 1; j < n; j++) {
            if (TyTuple_GET_ITEM(tuple, j) == o) {
                o = class_name(o);
                if (o != NULL) {
                    if (TyUnicode_Check(o)) {
                        TyErr_Format(TyExc_TypeError,
                                     "duplicate base class %U", o);
                    }
                    else {
                        TyErr_SetString(TyExc_TypeError,
                                        "duplicate base class");
                    }
                    Ty_DECREF(o);
                }
                return -1;
            }
        }
    }
    return 0;
}

/* Raise a TypeError for an MRO order disagreement.

   It's hard to produce a good error message.  In the absence of better
   insight into error reporting, report the classes that were candidates
   to be put next into the MRO.  There is some conflict between the
   order in which they should be put in the MRO, but it's hard to
   diagnose what constraint can't be satisfied.
*/

static void
set_mro_error(TyObject **to_merge, Ty_ssize_t to_merge_size, Ty_ssize_t *remain)
{
    Ty_ssize_t i, n, off;
    char buf[1000];
    TyObject *k, *v;
    TyObject *set = TyDict_New();
    if (!set) return;

    for (i = 0; i < to_merge_size; i++) {
        TyObject *L = to_merge[i];
        if (remain[i] < TyTuple_GET_SIZE(L)) {
            TyObject *c = TyTuple_GET_ITEM(L, remain[i]);
            if (TyDict_SetItem(set, c, Ty_None) < 0) {
                Ty_DECREF(set);
                return;
            }
        }
    }
    n = TyDict_GET_SIZE(set);

    off = TyOS_snprintf(buf, sizeof(buf), "Cannot create a \
consistent method resolution order (MRO) for bases");
    i = 0;
    while (TyDict_Next(set, &i, &k, &v) && (size_t)off < sizeof(buf)) {
        TyObject *name = class_name(k);
        const char *name_str = NULL;
        if (name != NULL) {
            if (TyUnicode_Check(name)) {
                name_str = TyUnicode_AsUTF8(name);
            }
            else {
                name_str = "?";
            }
        }
        if (name_str == NULL) {
            Ty_XDECREF(name);
            Ty_DECREF(set);
            return;
        }
        off += TyOS_snprintf(buf + off, sizeof(buf) - off, " %s", name_str);
        Ty_XDECREF(name);
        if (--n && (size_t)(off+1) < sizeof(buf)) {
            buf[off++] = ',';
            buf[off] = '\0';
        }
    }
    TyErr_SetString(TyExc_TypeError, buf);
    Ty_DECREF(set);
}

static int
pmerge(TyObject *acc, TyObject **to_merge, Ty_ssize_t to_merge_size)
{
    int res = 0;
    Ty_ssize_t i, j, empty_cnt;
    Ty_ssize_t *remain;

    /* remain stores an index into each sublist of to_merge.
       remain[i] is the index of the next base in to_merge[i]
       that is not included in acc.
    */
    remain = TyMem_New(Ty_ssize_t, to_merge_size);
    if (remain == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    for (i = 0; i < to_merge_size; i++)
        remain[i] = 0;

  again:
    empty_cnt = 0;
    for (i = 0; i < to_merge_size; i++) {
        TyObject *candidate;

        TyObject *cur_tuple = to_merge[i];

        if (remain[i] >= TyTuple_GET_SIZE(cur_tuple)) {
            empty_cnt++;
            continue;
        }

        /* Choose next candidate for MRO.

           The input sequences alone can determine the choice.
           If not, choose the class which appears in the MRO
           of the earliest direct superclass of the new class.
        */

        candidate = TyTuple_GET_ITEM(cur_tuple, remain[i]);
        for (j = 0; j < to_merge_size; j++) {
            TyObject *j_lst = to_merge[j];
            if (tail_contains(j_lst, remain[j], candidate))
                goto skip; /* continue outer loop */
        }
        res = TyList_Append(acc, candidate);
        if (res < 0)
            goto out;

        for (j = 0; j < to_merge_size; j++) {
            TyObject *j_lst = to_merge[j];
            if (remain[j] < TyTuple_GET_SIZE(j_lst) &&
                TyTuple_GET_ITEM(j_lst, remain[j]) == candidate) {
                remain[j]++;
            }
        }
        goto again;
      skip: ;
    }

    if (empty_cnt != to_merge_size) {
        set_mro_error(to_merge, to_merge_size, remain);
        res = -1;
    }

  out:
    TyMem_Free(remain);

    return res;
}

static TyObject *
mro_implementation_unlocked(TyTypeObject *type)
{
    ASSERT_TYPE_LOCK_HELD();

    if (!_TyType_IsReady(type)) {
        if (TyType_Ready(type) < 0)
            return NULL;
    }

    TyObject *bases = lookup_tp_bases(type);
    Ty_ssize_t n = TyTuple_GET_SIZE(bases);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(bases, i));
        if (lookup_tp_mro(base) == NULL) {
            TyErr_Format(TyExc_TypeError,
                         "Cannot extend an incomplete type '%.100s'",
                         base->tp_name);
            return NULL;
        }
        assert(TyTuple_Check(lookup_tp_mro(base)));
    }

    if (n == 1) {
        /* Fast path: if there is a single base, constructing the MRO
         * is trivial.
         */
        TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(bases, 0));
        TyObject *base_mro = lookup_tp_mro(base);
        Ty_ssize_t k = TyTuple_GET_SIZE(base_mro);
        TyObject *result = TyTuple_New(k + 1);
        if (result == NULL) {
            return NULL;
        }

        ;
        TyTuple_SET_ITEM(result, 0, Ty_NewRef(type));
        for (Ty_ssize_t i = 0; i < k; i++) {
            TyObject *cls = TyTuple_GET_ITEM(base_mro, i);
            TyTuple_SET_ITEM(result, i + 1, Ty_NewRef(cls));
        }
        return result;
    }

    /* This is just a basic sanity check. */
    if (check_duplicates(bases) < 0) {
        return NULL;
    }

    /* Find a superclass linearization that honors the constraints
       of the explicit tuples of bases and the constraints implied by
       each base class.

       to_merge is an array of tuples, where each tuple is a superclass
       linearization implied by a base class.  The last element of
       to_merge is the declared tuple of bases.
    */
    TyObject **to_merge = TyMem_New(TyObject *, n + 1);
    if (to_merge == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < n; i++) {
        TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(bases, i));
        to_merge[i] = lookup_tp_mro(base);
    }
    to_merge[n] = bases;

    TyObject *result = TyList_New(1);
    if (result == NULL) {
        TyMem_Free(to_merge);
        return NULL;
    }

    TyList_SET_ITEM(result, 0, Ty_NewRef(type));
    if (pmerge(result, to_merge, n + 1) < 0) {
        Ty_CLEAR(result);
    }
    TyMem_Free(to_merge);

    return result;
}

static TyObject *
mro_implementation(TyTypeObject *type)
{
    TyObject *mro;
    BEGIN_TYPE_LOCK();
    mro = mro_implementation_unlocked(type);
    END_TYPE_LOCK();
    return mro;
}

/*[clinic input]
type.mro

Return a type's method resolution order.
[clinic start generated code]*/

static TyObject *
type_mro_impl(TyTypeObject *self)
/*[clinic end generated code: output=bffc4a39b5b57027 input=28414f4e156db28d]*/
{
    TyObject *seq;
    seq = mro_implementation(self);
    if (seq != NULL && !TyList_Check(seq)) {
        Ty_SETREF(seq, PySequence_List(seq));
    }
    return seq;
}

static int
mro_check(TyTypeObject *type, TyObject *mro)
{
    TyTypeObject *solid;
    Ty_ssize_t i, n;

    solid = solid_base(type);

    n = TyTuple_GET_SIZE(mro);
    for (i = 0; i < n; i++) {
        TyObject *obj = TyTuple_GET_ITEM(mro, i);
        if (!TyType_Check(obj)) {
            TyErr_Format(
                TyExc_TypeError,
                "mro() returned a non-class ('%.500s')",
                Ty_TYPE(obj)->tp_name);
            return -1;
        }
        TyTypeObject *base = (TyTypeObject*)obj;

        if (!is_subtype_with_mro(lookup_tp_mro(solid), solid, solid_base(base))) {
            TyErr_Format(
                TyExc_TypeError,
                "mro() returned base with unsuitable layout ('%.500s')",
                base->tp_name);
            return -1;
        }
    }

    return 0;
}

/* Lookups an mcls.mro method, invokes it and checks the result (if needed,
   in case of a custom mro() implementation).

   Keep in mind that during execution of this function type->tp_mro
   can be replaced due to possible reentrance (for example,
   through type_set_bases):

      - when looking up the mcls.mro attribute (it could be
        a user-provided descriptor);

      - from inside a custom mro() itself;

      - through a finalizer of the return value of mro().
*/
static TyObject *
mro_invoke(TyTypeObject *type)
{
    TyObject *mro_result;
    TyObject *new_mro;

    ASSERT_TYPE_LOCK_HELD();

    const int custom = !Ty_IS_TYPE(type, &TyType_Type);

    if (custom) {
        mro_result = call_method_noarg((TyObject *)type, &_Ty_ID(mro));
    }
    else {
        mro_result = mro_implementation_unlocked(type);
    }
    if (mro_result == NULL)
        return NULL;

    new_mro = PySequence_Tuple(mro_result);
    Ty_DECREF(mro_result);
    if (new_mro == NULL) {
        return NULL;
    }

    if (TyTuple_GET_SIZE(new_mro) == 0) {
        Ty_DECREF(new_mro);
        TyErr_Format(TyExc_TypeError, "type MRO must not be empty");
        return NULL;
    }

    if (custom && mro_check(type, new_mro) < 0) {
        Ty_DECREF(new_mro);
        return NULL;
    }
    return new_mro;
}

/* Calculates and assigns a new MRO to type->tp_mro.
   Return values and invariants:

     - Returns 1 if a new MRO value has been set to type->tp_mro due to
       this call of mro_internal (no tricky reentrancy and no errors).

       In case if p_old_mro argument is not NULL, a previous value
       of type->tp_mro is put there, and the ownership of this
       reference is transferred to a caller.
       Otherwise, the previous value (if any) is decref'ed.

     - Returns 0 in case when type->tp_mro gets changed because of
       reentering here through a custom mro() (see a comment to mro_invoke).

       In this case, a refcount of an old type->tp_mro is adjusted
       somewhere deeper in the call stack (by the innermost mro_internal
       or its caller) and may become zero upon returning from here.
       This also implies that the whole hierarchy of subclasses of the type
       has seen the new value and updated their MRO accordingly.

     - Returns -1 in case of an error.
*/
static int
mro_internal_unlocked(TyTypeObject *type, int initial, TyObject **p_old_mro)
{
    ASSERT_TYPE_LOCK_HELD();

    TyObject *new_mro, *old_mro;
    int reent;

    /* Keep a reference to be able to do a reentrancy check below.
       Don't let old_mro be GC'ed and its address be reused for
       another object, like (suddenly!) a new tp_mro.  */
    old_mro = Ty_XNewRef(lookup_tp_mro(type));
    new_mro = mro_invoke(type);  /* might cause reentrance */
    reent = (lookup_tp_mro(type) != old_mro);
    Ty_XDECREF(old_mro);
    if (new_mro == NULL) {
        return -1;
    }

    if (reent) {
        Ty_DECREF(new_mro);
        return 0;
    }

    set_tp_mro(type, new_mro, initial);

    type_mro_modified(type, new_mro);
    /* corner case: the super class might have been hidden
       from the custom MRO */
    type_mro_modified(type, lookup_tp_bases(type));

    // XXX Expand this to Ty_TPFLAGS_IMMUTABLETYPE?
    if (!(type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN)) {
        type_modified_unlocked(type);
    }
    else {
        /* For static builtin types, this is only called during init
           before the method cache has been populated. */
        assert(type->tp_version_tag);
    }

    if (p_old_mro != NULL)
        *p_old_mro = old_mro;  /* transfer the ownership */
    else
        Ty_XDECREF(old_mro);

    return 1;
}

static int
mro_internal(TyTypeObject *type, TyObject **p_old_mro)
{
    int res;
    BEGIN_TYPE_LOCK();
    res = mro_internal_unlocked(type, 0, p_old_mro);
    END_TYPE_LOCK();
    return res;
}

/* Calculate the best base amongst multiple base classes.
   This is the first one that's on the path to the "solid base". */

static TyTypeObject *
best_base(TyObject *bases)
{
    Ty_ssize_t i, n;
    TyTypeObject *base, *winner, *candidate;

    assert(TyTuple_Check(bases));
    n = TyTuple_GET_SIZE(bases);
    assert(n > 0);
    base = NULL;
    winner = NULL;
    for (i = 0; i < n; i++) {
        TyObject *base_proto = TyTuple_GET_ITEM(bases, i);
        if (!TyType_Check(base_proto)) {
            TyErr_SetString(
                TyExc_TypeError,
                "bases must be types");
            return NULL;
        }
        TyTypeObject *base_i = (TyTypeObject *)base_proto;

        if (!_TyType_IsReady(base_i)) {
            if (TyType_Ready(base_i) < 0)
                return NULL;
        }
        if (!_TyType_HasFeature(base_i, Ty_TPFLAGS_BASETYPE)) {
            TyErr_Format(TyExc_TypeError,
                         "type '%.100s' is not an acceptable base type",
                         base_i->tp_name);
            return NULL;
        }
        candidate = solid_base(base_i);
        if (winner == NULL) {
            winner = candidate;
            base = base_i;
        }
        else if (TyType_IsSubtype(winner, candidate))
            ;
        else if (TyType_IsSubtype(candidate, winner)) {
            winner = candidate;
            base = base_i;
        }
        else {
            TyErr_SetString(
                TyExc_TypeError,
                "multiple bases have "
                "instance lay-out conflict");
            return NULL;
        }
    }
    assert (base != NULL);

    return base;
}

static int
shape_differs(TyTypeObject *t1, TyTypeObject *t2)
{
    return (
        t1->tp_basicsize != t2->tp_basicsize ||
        t1->tp_itemsize != t2->tp_itemsize
    );
}

static TyTypeObject *
solid_base(TyTypeObject *type)
{
    TyTypeObject *base;

    if (type->tp_base) {
        base = solid_base(type->tp_base);
    }
    else {
        base = &PyBaseObject_Type;
    }
    if (shape_differs(type, base)) {
        return type;
    }
    else {
        return base;
    }
}

static void object_dealloc(TyObject *);
static TyObject *object_new(TyTypeObject *, TyObject *, TyObject *);
static int object_init(TyObject *, TyObject *, TyObject *);
static int update_slot(TyTypeObject *, TyObject *);
static void fixup_slot_dispatchers(TyTypeObject *);
static int type_new_set_names(TyTypeObject *);
static int type_new_init_subclass(TyTypeObject *, TyObject *);

/*
 * Helpers for  __dict__ descriptor.  We don't want to expose the dicts
 * inherited from various builtin types.  The builtin base usually provides
 * its own __dict__ descriptor, so we use that when we can.
 */
static TyTypeObject *
get_builtin_base_with_dict(TyTypeObject *type)
{
    while (type->tp_base != NULL) {
        if (type->tp_dictoffset != 0 &&
            !(type->tp_flags & Ty_TPFLAGS_HEAPTYPE))
            return type;
        type = type->tp_base;
    }
    return NULL;
}

static TyObject *
get_dict_descriptor(TyTypeObject *type)
{
    TyObject *descr;

    descr = _TyType_Lookup(type, &_Ty_ID(__dict__));
    if (descr == NULL || !PyDescr_IsData(descr))
        return NULL;

    return descr;
}

static void
raise_dict_descr_error(TyObject *obj)
{
    TyErr_Format(TyExc_TypeError,
                 "this __dict__ descriptor does not support "
                 "'%.200s' objects", Ty_TYPE(obj)->tp_name);
}

static TyObject *
subtype_dict(TyObject *obj, void *context)
{
    TyTypeObject *base;

    base = get_builtin_base_with_dict(Ty_TYPE(obj));
    if (base != NULL) {
        descrgetfunc func;
        TyObject *descr = get_dict_descriptor(base);
        if (descr == NULL) {
            raise_dict_descr_error(obj);
            return NULL;
        }
        func = Ty_TYPE(descr)->tp_descr_get;
        if (func == NULL) {
            raise_dict_descr_error(obj);
            return NULL;
        }
        return func(descr, obj, (TyObject *)(Ty_TYPE(obj)));
    }
    return PyObject_GenericGetDict(obj, context);
}

int
_TyObject_SetDict(TyObject *obj, TyObject *value)
{
    if (value != NULL && !TyDict_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "__dict__ must be set to a dictionary, "
                     "not a '%.200s'", Ty_TYPE(value)->tp_name);
        return -1;
    }
    if (Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        return _TyObject_SetManagedDict(obj, value);
    }
    TyObject **dictptr = _TyObject_ComputedDictPointer(obj);
    if (dictptr == NULL) {
        TyErr_SetString(TyExc_AttributeError,
                        "This object has no __dict__");
        return -1;
    }
    Ty_BEGIN_CRITICAL_SECTION(obj);
    TyObject *olddict = *dictptr;
    FT_ATOMIC_STORE_PTR_RELEASE(*dictptr, Ty_NewRef(value));
#ifdef Ty_GIL_DISABLED
    _TyObject_XDecRefDelayed(olddict);
#else
    Ty_XDECREF(olddict);
#endif
    Ty_END_CRITICAL_SECTION();
    return 0;
}

static int
subtype_setdict(TyObject *obj, TyObject *value, void *context)
{
    TyTypeObject *base;

    base = get_builtin_base_with_dict(Ty_TYPE(obj));
    if (base != NULL) {
        descrsetfunc func;
        TyObject *descr = get_dict_descriptor(base);
        if (descr == NULL) {
            raise_dict_descr_error(obj);
            return -1;
        }
        func = Ty_TYPE(descr)->tp_descr_set;
        if (func == NULL) {
            raise_dict_descr_error(obj);
            return -1;
        }
        return func(descr, obj, value);
    }
    return _TyObject_SetDict(obj, value);
}

static TyObject *
subtype_getweakref(TyObject *obj, void *context)
{
    TyObject **weaklistptr;
    TyObject *result;
    TyTypeObject *type = Ty_TYPE(obj);

    if (type->tp_weaklistoffset == 0) {
        TyErr_SetString(TyExc_AttributeError,
                        "This object has no __weakref__");
        return NULL;
    }
    _TyObject_ASSERT((TyObject *)type,
                     type->tp_weaklistoffset > 0 ||
                     type->tp_weaklistoffset == MANAGED_WEAKREF_OFFSET);
    _TyObject_ASSERT((TyObject *)type,
                     ((type->tp_weaklistoffset + (Ty_ssize_t)sizeof(TyObject *))
                      <= type->tp_basicsize));
    weaklistptr = (TyObject **)((char *)obj + type->tp_weaklistoffset);
    if (*weaklistptr == NULL)
        result = Ty_None;
    else
        result = *weaklistptr;
    return Ty_NewRef(result);
}

/* Three variants on the subtype_getsets list. */

static TyGetSetDef subtype_getsets_full[] = {
    {"__dict__", subtype_dict, subtype_setdict,
     TyDoc_STR("dictionary for instance variables")},
    {"__weakref__", subtype_getweakref, NULL,
     TyDoc_STR("list of weak references to the object")},
    {0}
};

static TyGetSetDef subtype_getsets_dict_only[] = {
    {"__dict__", subtype_dict, subtype_setdict,
     TyDoc_STR("dictionary for instance variables")},
    {0}
};

static TyGetSetDef subtype_getsets_weakref_only[] = {
    {"__weakref__", subtype_getweakref, NULL,
     TyDoc_STR("list of weak references to the object")},
    {0}
};

static int
valid_identifier(TyObject *s)
{
    if (!TyUnicode_Check(s)) {
        TyErr_Format(TyExc_TypeError,
                     "__slots__ items must be strings, not '%.200s'",
                     Ty_TYPE(s)->tp_name);
        return 0;
    }
    if (!TyUnicode_IsIdentifier(s)) {
        TyErr_SetString(TyExc_TypeError,
                        "__slots__ must be identifiers");
        return 0;
    }
    return 1;
}

static int
type_init(TyObject *cls, TyObject *args, TyObject *kwds)
{
    assert(args != NULL && TyTuple_Check(args));
    assert(kwds == NULL || TyDict_Check(kwds));

    if (kwds != NULL && TyTuple_GET_SIZE(args) == 1 &&
        TyDict_GET_SIZE(kwds) != 0) {
        TyErr_SetString(TyExc_TypeError,
                        "type.__init__() takes no keyword arguments");
        return -1;
    }

    if ((TyTuple_GET_SIZE(args) != 1 && TyTuple_GET_SIZE(args) != 3)) {
        TyErr_SetString(TyExc_TypeError,
                        "type.__init__() takes 1 or 3 arguments");
        return -1;
    }

    return 0;
}


unsigned long
TyType_GetFlags(TyTypeObject *type)
{
    return FT_ATOMIC_LOAD_ULONG_RELAXED(type->tp_flags);
}


int
TyType_SUPPORTS_WEAKREFS(TyTypeObject *type)
{
    return _TyType_SUPPORTS_WEAKREFS(type);
}


/* Determine the most derived metatype. */
TyTypeObject *
_TyType_CalculateMetaclass(TyTypeObject *metatype, TyObject *bases)
{
    Ty_ssize_t i, nbases;
    TyTypeObject *winner;
    TyObject *tmp;
    TyTypeObject *tmptype;

    /* Determine the proper metatype to deal with this,
       and check for metatype conflicts while we're at it.
       Note that if some other metatype wins to contract,
       it's possible that its instances are not types. */

    nbases = TyTuple_GET_SIZE(bases);
    winner = metatype;
    for (i = 0; i < nbases; i++) {
        tmp = TyTuple_GET_ITEM(bases, i);
        tmptype = Ty_TYPE(tmp);
        if (TyType_IsSubtype(winner, tmptype))
            continue;
        if (TyType_IsSubtype(tmptype, winner)) {
            winner = tmptype;
            continue;
        }
        /* else: */
        TyErr_SetString(TyExc_TypeError,
                        "metaclass conflict: "
                        "the metaclass of a derived class "
                        "must be a (non-strict) subclass "
                        "of the metaclasses of all its bases");
        return NULL;
    }
    return winner;
}


// Forward declaration
static TyObject *
type_new(TyTypeObject *metatype, TyObject *args, TyObject *kwds);

typedef struct {
    TyTypeObject *metatype;
    TyObject *args;
    TyObject *kwds;
    TyObject *orig_dict;
    TyObject *name;
    TyObject *bases;
    TyTypeObject *base;
    TyObject *slots;
    Ty_ssize_t nslot;
    int add_dict;
    int add_weak;
    int may_add_dict;
    int may_add_weak;
} type_new_ctx;


/* Check for valid slot names and two special cases */
static int
type_new_visit_slots(type_new_ctx *ctx)
{
    TyObject *slots = ctx->slots;
    Ty_ssize_t nslot = ctx->nslot;
    for (Ty_ssize_t i = 0; i < nslot; i++) {
        TyObject *name = TyTuple_GET_ITEM(slots, i);
        if (!valid_identifier(name)) {
            return -1;
        }
        assert(TyUnicode_Check(name));
        if (_TyUnicode_Equal(name, &_Ty_ID(__dict__))) {
            if (!ctx->may_add_dict || ctx->add_dict != 0) {
                TyErr_SetString(TyExc_TypeError,
                    "__dict__ slot disallowed: "
                    "we already got one");
                return -1;
            }
            ctx->add_dict++;
        }
        if (_TyUnicode_Equal(name, &_Ty_ID(__weakref__))) {
            if (!ctx->may_add_weak || ctx->add_weak != 0) {
                TyErr_SetString(TyExc_TypeError,
                    "__weakref__ slot disallowed: "
                    "we already got one");
                return -1;
            }
            ctx->add_weak++;
        }
    }
    return 0;
}


/* Copy slots into a list, mangle names and sort them.
   Sorted names are needed for __class__ assignment.
   Convert them back to tuple at the end.
*/
static TyObject*
type_new_copy_slots(type_new_ctx *ctx, TyObject *dict)
{
    TyObject *slots = ctx->slots;
    Ty_ssize_t nslot = ctx->nslot;

    Ty_ssize_t new_nslot = nslot - ctx->add_dict - ctx->add_weak;
    TyObject *new_slots = TyList_New(new_nslot);
    if (new_slots == NULL) {
        return NULL;
    }

    Ty_ssize_t j = 0;
    for (Ty_ssize_t i = 0; i < nslot; i++) {
        TyObject *slot = TyTuple_GET_ITEM(slots, i);
        if ((ctx->add_dict && _TyUnicode_Equal(slot, &_Ty_ID(__dict__))) ||
            (ctx->add_weak && _TyUnicode_Equal(slot, &_Ty_ID(__weakref__))))
        {
            continue;
        }

        slot =_Ty_Mangle(ctx->name, slot);
        if (!slot) {
            goto error;
        }
        TyList_SET_ITEM(new_slots, j, slot);

        int r = TyDict_Contains(dict, slot);
        if (r < 0) {
            goto error;
        }
        if (r > 0) {
            /* CPython inserts these names (when needed)
               into the namespace when creating a class.  They will be deleted
               below so won't act as class variables. */
            if (!_TyUnicode_Equal(slot, &_Ty_ID(__qualname__)) &&
                !_TyUnicode_Equal(slot, &_Ty_ID(__classcell__)) &&
                !_TyUnicode_Equal(slot, &_Ty_ID(__classdictcell__)))
            {
                TyErr_Format(TyExc_ValueError,
                             "%R in __slots__ conflicts with class variable",
                             slot);
                goto error;
            }
        }

        j++;
    }
    assert(j == new_nslot);

    if (TyList_Sort(new_slots) == -1) {
        goto error;
    }

    TyObject *tuple = TyList_AsTuple(new_slots);
    Ty_DECREF(new_slots);
    if (tuple == NULL) {
        return NULL;
    }

    assert(TyTuple_GET_SIZE(tuple) == new_nslot);
    return tuple;

error:
    Ty_DECREF(new_slots);
    return NULL;
}


static void
type_new_slots_bases(type_new_ctx *ctx)
{
    Ty_ssize_t nbases = TyTuple_GET_SIZE(ctx->bases);
    if (nbases > 1 &&
        ((ctx->may_add_dict && ctx->add_dict == 0) ||
         (ctx->may_add_weak && ctx->add_weak == 0)))
    {
        for (Ty_ssize_t i = 0; i < nbases; i++) {
            TyObject *obj = TyTuple_GET_ITEM(ctx->bases, i);
            if (obj == (TyObject *)ctx->base) {
                /* Skip primary base */
                continue;
            }
            TyTypeObject *base = _TyType_CAST(obj);

            if (ctx->may_add_dict && ctx->add_dict == 0 &&
                base->tp_dictoffset != 0)
            {
                ctx->add_dict++;
            }
            if (ctx->may_add_weak && ctx->add_weak == 0 &&
                base->tp_weaklistoffset != 0)
            {
                ctx->add_weak++;
            }
            if (ctx->may_add_dict && ctx->add_dict == 0) {
                continue;
            }
            if (ctx->may_add_weak && ctx->add_weak == 0) {
                continue;
            }
            /* Nothing more to check */
            break;
        }
    }
}


static int
type_new_slots_impl(type_new_ctx *ctx, TyObject *dict)
{
    /* Are slots allowed? */
    if (ctx->nslot > 0 && ctx->base->tp_itemsize != 0) {
        TyErr_Format(TyExc_TypeError,
                     "nonempty __slots__ not supported for subtype of '%s'",
                     ctx->base->tp_name);
        return -1;
    }

    if (type_new_visit_slots(ctx) < 0) {
        return -1;
    }

    TyObject *new_slots = type_new_copy_slots(ctx, dict);
    if (new_slots == NULL) {
        return -1;
    }
    assert(TyTuple_CheckExact(new_slots));

    Ty_XSETREF(ctx->slots, new_slots);
    ctx->nslot = TyTuple_GET_SIZE(new_slots);

    /* Secondary bases may provide weakrefs or dict */
    type_new_slots_bases(ctx);
    return 0;
}


static Ty_ssize_t
type_new_slots(type_new_ctx *ctx, TyObject *dict)
{
    // Check for a __slots__ sequence variable in dict, and count it
    ctx->add_dict = 0;
    ctx->add_weak = 0;
    ctx->may_add_dict = (ctx->base->tp_dictoffset == 0);
    ctx->may_add_weak = (ctx->base->tp_weaklistoffset == 0
                         && ctx->base->tp_itemsize == 0);

    if (ctx->slots == NULL) {
        if (ctx->may_add_dict) {
            ctx->add_dict++;
        }
        if (ctx->may_add_weak) {
            ctx->add_weak++;
        }
    }
    else {
        /* Have slots */
        if (type_new_slots_impl(ctx, dict) < 0) {
            return -1;
        }
    }
    return 0;
}


static TyTypeObject*
type_new_alloc(type_new_ctx *ctx)
{
    TyTypeObject *metatype = ctx->metatype;
    TyTypeObject *type;

    // Allocate the type object
    type = (TyTypeObject *)metatype->tp_alloc(metatype, ctx->nslot);
    if (type == NULL) {
        return NULL;
    }
    PyHeapTypeObject *et = (PyHeapTypeObject *)type;

    // Initialize tp_flags.
    // All heap types need GC, since we can create a reference cycle by storing
    // an instance on one of its parents.
    type_set_flags(type, Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HEAPTYPE |
                   Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC);

    // Initialize essential fields
    type->tp_as_async = &et->as_async;
    type->tp_as_number = &et->as_number;
    type->tp_as_sequence = &et->as_sequence;
    type->tp_as_mapping = &et->as_mapping;
    type->tp_as_buffer = &et->as_buffer;

    set_tp_bases(type, Ty_NewRef(ctx->bases), 1);
    type->tp_base = (TyTypeObject *)Ty_NewRef(ctx->base);

    type->tp_dealloc = subtype_dealloc;
    /* Always override allocation strategy to use regular heap */
    type->tp_alloc = TyType_GenericAlloc;
    type->tp_free = PyObject_GC_Del;

    type->tp_traverse = subtype_traverse;
    type->tp_clear = subtype_clear;

    et->ht_name = Ty_NewRef(ctx->name);
    et->ht_module = NULL;
    et->_ht_tpname = NULL;
    et->ht_token = NULL;

#ifdef Ty_GIL_DISABLED
    et->unique_id = _TyObject_AssignUniqueId((TyObject *)et);
#endif

    return type;
}


static int
type_new_set_name(const type_new_ctx *ctx, TyTypeObject *type)
{
    Ty_ssize_t name_size;
    type->tp_name = TyUnicode_AsUTF8AndSize(ctx->name, &name_size);
    if (!type->tp_name) {
        return -1;
    }
    if (strlen(type->tp_name) != (size_t)name_size) {
        TyErr_SetString(TyExc_ValueError,
                        "type name must not contain null characters");
        return -1;
    }
    return 0;
}


/* Set __module__ in the dict */
static int
type_new_set_module(TyObject *dict)
{
    int r = TyDict_Contains(dict, &_Ty_ID(__module__));
    if (r < 0) {
        return -1;
    }
    if (r > 0) {
        return 0;
    }

    TyObject *globals = TyEval_GetGlobals();
    if (globals == NULL) {
        return 0;
    }

    TyObject *module;
    r = TyDict_GetItemRef(globals, &_Ty_ID(__name__), &module);
    if (module) {
        r = TyDict_SetItem(dict, &_Ty_ID(__module__), module);
        Ty_DECREF(module);
    }
    return r;
}


/* Set ht_qualname to dict['__qualname__'] if available, else to
   __name__.  The __qualname__ accessor will look for ht_qualname. */
static int
type_new_set_ht_name(TyTypeObject *type, TyObject *dict)
{
    PyHeapTypeObject *et = (PyHeapTypeObject *)type;
    TyObject *qualname;
    if (TyDict_GetItemRef(dict, &_Ty_ID(__qualname__), &qualname) < 0) {
        return -1;
    }
    if (qualname != NULL) {
        if (!TyUnicode_Check(qualname)) {
            TyErr_Format(TyExc_TypeError,
                    "type __qualname__ must be a str, not %s",
                    Ty_TYPE(qualname)->tp_name);
            Ty_DECREF(qualname);
            return -1;
        }
        et->ht_qualname = qualname;
        if (TyDict_DelItem(dict, &_Ty_ID(__qualname__)) < 0) {
            return -1;
        }
    }
    else {
        et->ht_qualname = Ty_NewRef(et->ht_name);
    }
    return 0;
}


/* Set tp_doc to a copy of dict['__doc__'], if the latter is there
   and is a string.  The __doc__ accessor will first look for tp_doc;
   if that fails, it will still look into __dict__. */
static int
type_new_set_doc(TyTypeObject *type, TyObject* dict)
{
    TyObject *doc = TyDict_GetItemWithError(dict, &_Ty_ID(__doc__));
    if (doc == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        // no __doc__ key
        return 0;
    }
    if (!TyUnicode_Check(doc)) {
        // ignore non-string __doc__
        return 0;
    }

    const char *doc_str = TyUnicode_AsUTF8(doc);
    if (doc_str == NULL) {
        return -1;
    }

    // Silently truncate the docstring if it contains a null byte
    Ty_ssize_t size = strlen(doc_str) + 1;
    char *tp_doc = (char *)TyMem_Malloc(size);
    if (tp_doc == NULL) {
        TyErr_NoMemory();
        return -1;
    }

    memcpy(tp_doc, doc_str, size);
    type->tp_doc = tp_doc;
    return 0;
}


static int
type_new_staticmethod(TyObject *dict, TyObject *attr)
{
    TyObject *func = TyDict_GetItemWithError(dict, attr);
    if (func == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    if (!TyFunction_Check(func)) {
        return 0;
    }

    TyObject *static_func = TyStaticMethod_New(func);
    if (static_func == NULL) {
        return -1;
    }
    if (TyDict_SetItem(dict, attr, static_func) < 0) {
        Ty_DECREF(static_func);
        return -1;
    }
    Ty_DECREF(static_func);
    return 0;
}


static int
type_new_classmethod(TyObject *dict, TyObject *attr)
{
    TyObject *func = TyDict_GetItemWithError(dict, attr);
    if (func == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    if (!TyFunction_Check(func)) {
        return 0;
    }

    TyObject *method = TyClassMethod_New(func);
    if (method == NULL) {
        return -1;
    }

    if (TyDict_SetItem(dict, attr, method) < 0) {
        Ty_DECREF(method);
        return -1;
    }
    Ty_DECREF(method);
    return 0;
}


/* Add descriptors for custom slots from __slots__, or for __dict__ */
static int
type_new_descriptors(const type_new_ctx *ctx, TyTypeObject *type)
{
    PyHeapTypeObject *et = (PyHeapTypeObject *)type;
    Ty_ssize_t slotoffset = ctx->base->tp_basicsize;
    if (et->ht_slots != NULL) {
        TyMemberDef *mp = _PyHeapType_GET_MEMBERS(et);
        Ty_ssize_t nslot = TyTuple_GET_SIZE(et->ht_slots);
        for (Ty_ssize_t i = 0; i < nslot; i++, mp++) {
            mp->name = TyUnicode_AsUTF8(
                TyTuple_GET_ITEM(et->ht_slots, i));
            if (mp->name == NULL) {
                return -1;
            }
            mp->type = Ty_T_OBJECT_EX;
            mp->offset = slotoffset;

            /* __dict__ and __weakref__ are already filtered out */
            assert(strcmp(mp->name, "__dict__") != 0);
            assert(strcmp(mp->name, "__weakref__") != 0);

            slotoffset += sizeof(TyObject *);
        }
    }

    if (ctx->add_weak) {
        assert((type->tp_flags & Ty_TPFLAGS_MANAGED_WEAKREF) == 0);
        type_add_flags(type, Ty_TPFLAGS_MANAGED_WEAKREF);
        type->tp_weaklistoffset = MANAGED_WEAKREF_OFFSET;
    }
    if (ctx->add_dict) {
        assert((type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0);
        type_add_flags(type, Ty_TPFLAGS_MANAGED_DICT);
        type->tp_dictoffset = -1;
    }

    type->tp_basicsize = slotoffset;
    type->tp_itemsize = ctx->base->tp_itemsize;
    type->tp_members = _PyHeapType_GET_MEMBERS(et);
    return 0;
}


static void
type_new_set_slots(const type_new_ctx *ctx, TyTypeObject *type)
{
    if (type->tp_weaklistoffset && type->tp_dictoffset) {
        type->tp_getset = subtype_getsets_full;
    }
    else if (type->tp_weaklistoffset && !type->tp_dictoffset) {
        type->tp_getset = subtype_getsets_weakref_only;
    }
    else if (!type->tp_weaklistoffset && type->tp_dictoffset) {
        type->tp_getset = subtype_getsets_dict_only;
    }
    else {
        type->tp_getset = NULL;
    }

    /* Special case some slots */
    if (type->tp_dictoffset != 0 || ctx->nslot > 0) {
        TyTypeObject *base = ctx->base;
        if (base->tp_getattr == NULL && base->tp_getattro == NULL) {
            type->tp_getattro = PyObject_GenericGetAttr;
        }
        if (base->tp_setattr == NULL && base->tp_setattro == NULL) {
            type->tp_setattro = PyObject_GenericSetAttr;
        }
    }
}


/* store type in class' cell if one is supplied */
static int
type_new_set_classcell(TyTypeObject *type, TyObject *dict)
{
    TyObject *cell = TyDict_GetItemWithError(dict, &_Ty_ID(__classcell__));
    if (cell == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }

    /* At least one method requires a reference to its defining class */
    if (!TyCell_Check(cell)) {
        TyErr_Format(TyExc_TypeError,
                     "__classcell__ must be a nonlocal cell, not %.200R",
                     Ty_TYPE(cell));
        return -1;
    }

    (void)TyCell_Set(cell, (TyObject *) type);
    if (TyDict_DelItem(dict, &_Ty_ID(__classcell__)) < 0) {
        return -1;
    }
    return 0;
}

static int
type_new_set_classdictcell(TyObject *dict)
{
    TyObject *cell = TyDict_GetItemWithError(dict, &_Ty_ID(__classdictcell__));
    if (cell == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }

    /* At least one method requires a reference to the dict of its defining class */
    if (!TyCell_Check(cell)) {
        TyErr_Format(TyExc_TypeError,
                     "__classdictcell__ must be a nonlocal cell, not %.200R",
                     Ty_TYPE(cell));
        return -1;
    }

    (void)TyCell_Set(cell, (TyObject *)dict);
    if (TyDict_DelItem(dict, &_Ty_ID(__classdictcell__)) < 0) {
        return -1;
    }
    return 0;
}

static int
type_new_set_attrs(const type_new_ctx *ctx, TyTypeObject *type)
{
    if (type_new_set_name(ctx, type) < 0) {
        return -1;
    }

    TyObject *dict = lookup_tp_dict(type);
    assert(dict);

    if (type_new_set_module(dict) < 0) {
        return -1;
    }

    if (type_new_set_ht_name(type, dict) < 0) {
        return -1;
    }

    if (type_new_set_doc(type, dict) < 0) {
        return -1;
    }

    /* Special-case __new__: if it's a plain function,
       make it a static function */
    if (type_new_staticmethod(dict, &_Ty_ID(__new__)) < 0) {
        return -1;
    }

    /* Special-case __init_subclass__ and __class_getitem__:
       if they are plain functions, make them classmethods */
    if (type_new_classmethod(dict, &_Ty_ID(__init_subclass__)) < 0) {
        return -1;
    }
    if (type_new_classmethod(dict, &_Ty_ID(__class_getitem__)) < 0) {
        return -1;
    }

    if (type_new_descriptors(ctx, type) < 0) {
        return -1;
    }

    type_new_set_slots(ctx, type);

    if (type_new_set_classcell(type, dict) < 0) {
        return -1;
    }
    if (type_new_set_classdictcell(dict) < 0) {
        return -1;
    }
    return 0;
}


static int
type_new_get_slots(type_new_ctx *ctx, TyObject *dict)
{
    TyObject *slots = TyDict_GetItemWithError(dict, &_Ty_ID(__slots__));
    if (slots == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        ctx->slots = NULL;
        ctx->nslot = 0;
        return 0;
    }

    // Make it into a tuple
    TyObject *new_slots;
    if (TyUnicode_Check(slots)) {
        new_slots = TyTuple_Pack(1, slots);
    }
    else {
        new_slots = PySequence_Tuple(slots);
    }
    if (new_slots == NULL) {
        return -1;
    }
    assert(TyTuple_CheckExact(new_slots));
    ctx->slots = new_slots;
    ctx->nslot = TyTuple_GET_SIZE(new_slots);
    return 0;
}


static TyTypeObject*
type_new_init(type_new_ctx *ctx)
{
    TyObject *dict = TyDict_Copy(ctx->orig_dict);
    if (dict == NULL) {
        goto error;
    }

    if (type_new_get_slots(ctx, dict) < 0) {
        goto error;
    }
    assert(!TyErr_Occurred());

    if (type_new_slots(ctx, dict) < 0) {
        goto error;
    }

    TyTypeObject *type = type_new_alloc(ctx);
    if (type == NULL) {
        goto error;
    }

    set_tp_dict(type, dict);

    PyHeapTypeObject *et = (PyHeapTypeObject*)type;
    et->ht_slots = ctx->slots;
    ctx->slots = NULL;

    return type;

error:
    Ty_CLEAR(ctx->slots);
    Ty_XDECREF(dict);
    return NULL;
}


static TyObject*
type_new_impl(type_new_ctx *ctx)
{
    TyTypeObject *type = type_new_init(ctx);
    if (type == NULL) {
        return NULL;
    }

    if (type_new_set_attrs(ctx, type) < 0) {
        goto error;
    }

    /* Initialize the rest */
    if (TyType_Ready(type) < 0) {
        goto error;
    }

    // Put the proper slots in place
    fixup_slot_dispatchers(type);

    if (!_TyDict_HasOnlyStringKeys(type->tp_dict)) {
        if (TyErr_WarnFormat(
                TyExc_RuntimeWarning,
                1,
                "non-string key in the __dict__ of class %.200s",
                type->tp_name) == -1)
        {
            goto error;
        }
    }

    if (type_new_set_names(type) < 0) {
        goto error;
    }

    if (type_new_init_subclass(type, ctx->kwds) < 0) {
        goto error;
    }

    assert(_TyType_CheckConsistency(type));

    return (TyObject *)type;

error:
    Ty_DECREF(type);
    return NULL;
}


static int
type_new_get_bases(type_new_ctx *ctx, TyObject **type)
{
    Ty_ssize_t nbases = TyTuple_GET_SIZE(ctx->bases);
    if (nbases == 0) {
        // Adjust for empty tuple bases
        ctx->base = &PyBaseObject_Type;
        TyObject *new_bases = TyTuple_Pack(1, ctx->base);
        if (new_bases == NULL) {
            return -1;
        }
        ctx->bases = new_bases;
        return 0;
    }

    for (Ty_ssize_t i = 0; i < nbases; i++) {
        TyObject *base = TyTuple_GET_ITEM(ctx->bases, i);
        if (TyType_Check(base)) {
            continue;
        }
        int rc = PyObject_HasAttrWithError(base, &_Ty_ID(__mro_entries__));
        if (rc < 0) {
            return -1;
        }
        if (rc) {
            TyErr_SetString(TyExc_TypeError,
                            "type() doesn't support MRO entry resolution; "
                            "use types.new_class()");
            return -1;
        }
    }

    // Search the bases for the proper metatype to deal with this
    TyTypeObject *winner;
    winner = _TyType_CalculateMetaclass(ctx->metatype, ctx->bases);
    if (winner == NULL) {
        return -1;
    }

    if (winner != ctx->metatype) {
        if (winner->tp_new != type_new) {
            /* Pass it to the winner */
            *type = winner->tp_new(winner, ctx->args, ctx->kwds);
            if (*type == NULL) {
                return -1;
            }
            return 1;
        }

        ctx->metatype = winner;
    }

    /* Calculate best base, and check that all bases are type objects */
    TyTypeObject *base = best_base(ctx->bases);
    if (base == NULL) {
        return -1;
    }

    ctx->base = base;
    ctx->bases = Ty_NewRef(ctx->bases);
    return 0;
}


static TyObject *
type_new(TyTypeObject *metatype, TyObject *args, TyObject *kwds)
{
    assert(args != NULL && TyTuple_Check(args));
    assert(kwds == NULL || TyDict_Check(kwds));

    /* Parse arguments: (name, bases, dict) */
    TyObject *name, *bases, *orig_dict;
    if (!TyArg_ParseTuple(args, "UO!O!:type.__new__",
                          &name,
                          &TyTuple_Type, &bases,
                          &TyDict_Type, &orig_dict))
    {
        return NULL;
    }

    type_new_ctx ctx = {
        .metatype = metatype,
        .args = args,
        .kwds = kwds,
        .orig_dict = orig_dict,
        .name = name,
        .bases = bases,
        .base = NULL,
        .slots = NULL,
        .nslot = 0,
        .add_dict = 0,
        .add_weak = 0,
        .may_add_dict = 0,
        .may_add_weak = 0};
    TyObject *type = NULL;
    int res = type_new_get_bases(&ctx, &type);
    if (res < 0) {
        assert(TyErr_Occurred());
        return NULL;
    }
    if (res == 1) {
        assert(type != NULL);
        return type;
    }
    assert(ctx.base != NULL);
    assert(ctx.bases != NULL);

    type = type_new_impl(&ctx);
    Ty_DECREF(ctx.bases);
    return type;
}


static TyObject *
type_vectorcall(TyObject *metatype, TyObject *const *args,
                 size_t nargsf, TyObject *kwnames)
{
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (nargs == 1 && metatype == (TyObject *)&TyType_Type){
        if (!_TyArg_NoKwnames("type", kwnames)) {
            return NULL;
        }
        return Ty_NewRef(Ty_TYPE(args[0]));
    }
    /* In other (much less common) cases, fall back to
       more flexible calling conventions. */
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyObject_MakeTpCall(tstate, metatype, args, nargs, kwnames);
}

/* An array of type slot offsets corresponding to Ty_tp_* constants,
  * for use in e.g. TyType_Spec and TyType_GetSlot.
  * Each entry has two offsets: "slot_offset" and "subslot_offset".
  * If is subslot_offset is -1, slot_offset is an offset within the
  * TyTypeObject struct.
  * Otherwise slot_offset is an offset to a pointer to a sub-slots struct
  * (such as "tp_as_number"), and subslot_offset is the offset within
  * that struct.
  * The actual table is generated by a script.
  */
static const PySlot_Offset pyslot_offsets[] = {
    {0, 0},
#include "typeslots.inc"
};

/* Align up to the nearest multiple of alignof(max_align_t)
 * (like _Ty_ALIGN_UP, but for a size rather than pointer)
 */
static Ty_ssize_t
_align_up(Ty_ssize_t size)
{
    return (size + ALIGNOF_MAX_ALIGN_T - 1) & ~(ALIGNOF_MAX_ALIGN_T - 1);
}

/* Given a TyType_FromMetaclass `bases` argument (NULL, type, or tuple of
 * types), return a tuple of types.
 */
inline static TyObject *
get_bases_tuple(TyObject *bases_in, TyType_Spec *spec)
{
    if (!bases_in) {
        /* Default: look in the spec, fall back to (type,). */
        TyTypeObject *base = &PyBaseObject_Type;  // borrowed ref
        TyObject *bases = NULL;  // borrowed ref
        const TyType_Slot *slot;
        for (slot = spec->slots; slot->slot; slot++) {
            switch (slot->slot) {
                case Ty_tp_base:
                    base = slot->pfunc;
                    break;
                case Ty_tp_bases:
                    bases = slot->pfunc;
                    break;
            }
        }
        if (!bases) {
            return TyTuple_Pack(1, base);
        }
        if (TyTuple_Check(bases)) {
            return Ty_NewRef(bases);
        }
        TyErr_SetString(TyExc_SystemError, "Ty_tp_bases is not a tuple");
        return NULL;
    }
    if (TyTuple_Check(bases_in)) {
        return Ty_NewRef(bases_in);
    }
    // Not a tuple, should be a single type
    return TyTuple_Pack(1, bases_in);
}

static inline int
check_basicsize_includes_size_and_offsets(TyTypeObject* type)
{
    if (type->tp_alloc != TyType_GenericAlloc) {
        // Custom allocators can ignore tp_basicsize
        return 1;
    }
    Ty_ssize_t max = (Ty_ssize_t)type->tp_basicsize;

    if (type->tp_base && type->tp_base->tp_basicsize > type->tp_basicsize) {
        TyErr_Format(TyExc_TypeError,
                     "tp_basicsize for type '%s' (%d) is too small for base '%s' (%d)",
                     type->tp_name, type->tp_basicsize,
                     type->tp_base->tp_name, type->tp_base->tp_basicsize);
        return 0;
    }
    if (type->tp_weaklistoffset + (Ty_ssize_t)sizeof(TyObject*) > max) {
        TyErr_Format(TyExc_TypeError,
                     "weaklist offset %d is out of bounds for type '%s' (tp_basicsize = %d)",
                     type->tp_weaklistoffset,
                     type->tp_name, type->tp_basicsize);
        return 0;
    }
    if (type->tp_dictoffset + (Ty_ssize_t)sizeof(TyObject*) > max) {
        TyErr_Format(TyExc_TypeError,
                     "dict offset %d is out of bounds for type '%s' (tp_basicsize = %d)",
                     type->tp_dictoffset,
                     type->tp_name, type->tp_basicsize);
        return 0;
    }
    if (type->tp_vectorcall_offset + (Ty_ssize_t)sizeof(vectorcallfunc*) > max) {
        TyErr_Format(TyExc_TypeError,
                     "vectorcall offset %d is out of bounds for type '%s' (tp_basicsize = %d)",
                     type->tp_vectorcall_offset,
                     type->tp_name, type->tp_basicsize);
        return 0;
    }
    return 1;
}

static int
check_immutable_bases(const char *type_name, TyObject *bases, int skip_first)
{
    Ty_ssize_t i = 0;
    if (skip_first) {
        // When testing the MRO, skip the type itself
        i = 1;
    }
    for (; i<TyTuple_GET_SIZE(bases); i++) {
        TyTypeObject *b = (TyTypeObject*)TyTuple_GET_ITEM(bases, i);
        if (!b) {
            return -1;
        }
        if (!_TyType_HasFeature(b, Ty_TPFLAGS_IMMUTABLETYPE)) {
            TyErr_Format(
                TyExc_TypeError,
                "Creating immutable type %s from mutable base %N",
                type_name, b
            );
            return -1;
        }
    }
    return 0;
}


/* Set *dest to the offset specified by a special "__*offset__" member.
 * Return 0 on success, -1 on failure.
 */
static inline int
special_offset_from_member(
            const TyMemberDef *memb /* may be NULL */,
            Ty_ssize_t type_data_offset,
            Ty_ssize_t *dest /* not NULL */)
{
    if (memb == NULL) {
        *dest = 0;
        return 0;
    }
    if (memb->type != Ty_T_PYSSIZET) {
        TyErr_Format(
            TyExc_SystemError,
            "type of %s must be Ty_T_PYSSIZET",
            memb->name);
        return -1;
    }
    if (memb->flags == Py_READONLY) {
        *dest = memb->offset;
        return 0;
    }
    else if (memb->flags == (Py_READONLY | Ty_RELATIVE_OFFSET)) {
        *dest = memb->offset + type_data_offset;
        return 0;
    }
    TyErr_Format(
        TyExc_SystemError,
        "flags for %s must be Py_READONLY or (Py_READONLY | Ty_RELATIVE_OFFSET)",
        memb->name);
    return -1;
}

TyObject *
TyType_FromMetaclass(
    TyTypeObject *metaclass, TyObject *module,
    TyType_Spec *spec, TyObject *bases_in)
{
    /* Invariant: A non-NULL value in one of these means this function holds
     * a strong reference or owns allocated memory.
     * These get decrefed/freed/returned at the end, on both success and error.
     */
    PyHeapTypeObject *res = NULL;
    TyTypeObject *type;
    TyObject *bases = NULL;
    char *tp_doc = NULL;
    TyObject *ht_name = NULL;
    char *_ht_tpname = NULL;

    int r;

    /* Prepare slots that need special handling.
     * Keep in mind that a slot can be given multiple times:
     * if that would cause trouble (leaks, UB, ...), raise an exception.
     */

    const TyType_Slot *slot;
    Ty_ssize_t nmembers = 0;
    const TyMemberDef *weaklistoffset_member = NULL;
    const TyMemberDef *dictoffset_member = NULL;
    const TyMemberDef *vectorcalloffset_member = NULL;
    char *res_start;

    for (slot = spec->slots; slot->slot; slot++) {
        if (slot->slot < 0
            || (size_t)slot->slot >= Ty_ARRAY_LENGTH(pyslot_offsets)) {
            TyErr_SetString(TyExc_RuntimeError, "invalid slot offset");
            goto finally;
        }
        switch (slot->slot) {
        case Ty_tp_members:
            if (nmembers != 0) {
                TyErr_SetString(
                    TyExc_SystemError,
                    "Multiple Ty_tp_members slots are not supported.");
                goto finally;
            }
            for (const TyMemberDef *memb = slot->pfunc; memb->name != NULL; memb++) {
                nmembers++;
                if (memb->flags & Ty_RELATIVE_OFFSET) {
                    if (spec->basicsize > 0) {
                        TyErr_SetString(
                            TyExc_SystemError,
                            "With Ty_RELATIVE_OFFSET, basicsize must be negative.");
                        goto finally;
                    }
                    if (memb->offset < 0 || memb->offset >= -spec->basicsize) {
                        TyErr_SetString(
                            TyExc_SystemError,
                            "Member offset out of range (0..-basicsize)");
                        goto finally;
                    }
                }
                if (strcmp(memb->name, "__weaklistoffset__") == 0) {
                    weaklistoffset_member = memb;
                }
                else if (strcmp(memb->name, "__dictoffset__") == 0) {
                    dictoffset_member = memb;
                }
                else if (strcmp(memb->name, "__vectorcalloffset__") == 0) {
                    vectorcalloffset_member = memb;
                }
            }
            break;
        case Ty_tp_doc:
            /* For the docstring slot, which usually points to a static string
               literal, we need to make a copy */
            if (tp_doc != NULL) {
                TyErr_SetString(
                    TyExc_SystemError,
                    "Multiple Ty_tp_doc slots are not supported.");
                goto finally;
            }
            if (slot->pfunc == NULL) {
                TyMem_Free(tp_doc);
                tp_doc = NULL;
            }
            else {
                size_t len = strlen(slot->pfunc)+1;
                tp_doc = TyMem_Malloc(len);
                if (tp_doc == NULL) {
                    TyErr_NoMemory();
                    goto finally;
                }
                memcpy(tp_doc, slot->pfunc, len);
            }
            break;
        }
    }

    /* Prepare the type name and qualname */

    if (spec->name == NULL) {
        TyErr_SetString(TyExc_SystemError,
                        "Type spec does not define the name field.");
        goto finally;
    }

    const char *s = strrchr(spec->name, '.');
    if (s == NULL) {
        s = spec->name;
    }
    else {
        s++;
    }

    ht_name = TyUnicode_FromString(s);
    if (!ht_name) {
        goto finally;
    }

    /* Copy spec->name to a buffer we own.
    *
    * Unfortunately, we can't use tp_name directly (with some
    * flag saying that it should be deallocated with the type),
    * because tp_name is public API and may be set independently
    * of any such flag.
    * So, we use a separate buffer, _ht_tpname, that's always
    * deallocated with the type (if it's non-NULL).
    */
    Ty_ssize_t name_buf_len = strlen(spec->name) + 1;
    _ht_tpname = TyMem_Malloc(name_buf_len);
    if (_ht_tpname == NULL) {
        goto finally;
    }
    memcpy(_ht_tpname, spec->name, name_buf_len);

    /* Get a tuple of bases.
     * bases is a strong reference (unlike bases_in).
     */
    bases = get_bases_tuple(bases_in, spec);
    if (!bases) {
        goto finally;
    }

    /* If this is an immutable type, check if all bases are also immutable,
     * and (for now) fire a deprecation warning if not.
     * (This isn't necessary for static types: those can't have heap bases,
     * and only heap types can be mutable.)
     */
    if (spec->flags & Ty_TPFLAGS_IMMUTABLETYPE) {
        if (check_immutable_bases(spec->name, bases, 0) < 0) {
            goto finally;
        }
    }

    /* Calculate the metaclass */

    if (!metaclass) {
        metaclass = &TyType_Type;
    }
    metaclass = _TyType_CalculateMetaclass(metaclass, bases);
    if (metaclass == NULL) {
        goto finally;
    }
    if (!TyType_Check(metaclass)) {
        TyErr_Format(TyExc_TypeError,
                     "Metaclass '%R' is not a subclass of 'type'.",
                     metaclass);
        goto finally;
    }
    if (metaclass->tp_new && metaclass->tp_new != TyType_Type.tp_new) {
        TyErr_SetString(
            TyExc_TypeError,
            "Metaclasses with custom tp_new are not supported.");
        goto finally;
    }

    /* Calculate best base, and check that all bases are type objects */
    TyTypeObject *base = best_base(bases);  // borrowed ref
    if (base == NULL) {
        goto finally;
    }
    // best_base should check Ty_TPFLAGS_BASETYPE & raise a proper exception,
    // here we just check its work
    assert(_TyType_HasFeature(base, Ty_TPFLAGS_BASETYPE));

    /* Calculate sizes */

    Ty_ssize_t basicsize = spec->basicsize;
    Ty_ssize_t type_data_offset = spec->basicsize;
    if (basicsize == 0) {
        /* Inherit */
        basicsize = base->tp_basicsize;
    }
    else if (basicsize < 0) {
        /* Extend */
        type_data_offset = _align_up(base->tp_basicsize);
        basicsize = type_data_offset + _align_up(-spec->basicsize);

        /* Inheriting variable-sized types is limited */
        if (base->tp_itemsize
            && !((base->tp_flags | spec->flags) & Ty_TPFLAGS_ITEMS_AT_END))
        {
            TyErr_SetString(
                TyExc_SystemError,
                "Cannot extend variable-size class without Ty_TPFLAGS_ITEMS_AT_END.");
            goto finally;
        }
    }

    Ty_ssize_t itemsize = spec->itemsize;

    /* Compute special offsets */

    Ty_ssize_t weaklistoffset = 0;
    if (special_offset_from_member(weaklistoffset_member, type_data_offset,
                                  &weaklistoffset) < 0) {
        goto finally;
    }
    Ty_ssize_t dictoffset = 0;
    if (special_offset_from_member(dictoffset_member, type_data_offset,
                                  &dictoffset) < 0) {
        goto finally;
    }
    Ty_ssize_t vectorcalloffset = 0;
    if (special_offset_from_member(vectorcalloffset_member, type_data_offset,
                                  &vectorcalloffset) < 0) {
        goto finally;
    }

    /* Allocate the new type
     *
     * Between here and TyType_Ready, we should limit:
     * - calls to Python code
     * - raising exceptions
     * - memory allocations
     */

    res = (PyHeapTypeObject*)metaclass->tp_alloc(metaclass, nmembers);
    if (res == NULL) {
        goto finally;
    }
    res_start = (char*)res;

    type = &res->ht_type;
    /* The flags must be initialized early, before the GC traverses us */
    type_set_flags(type, spec->flags | Ty_TPFLAGS_HEAPTYPE);

    res->ht_module = Ty_XNewRef(module);

    /* Initialize essential fields */

    type->tp_as_async = &res->as_async;
    type->tp_as_number = &res->as_number;
    type->tp_as_sequence = &res->as_sequence;
    type->tp_as_mapping = &res->as_mapping;
    type->tp_as_buffer = &res->as_buffer;

    /* Set slots we have prepared */

    type->tp_base = (TyTypeObject *)Ty_NewRef(base);
    set_tp_bases(type, bases, 1);
    bases = NULL;  // We give our reference to bases to the type

    type->tp_doc = tp_doc;
    tp_doc = NULL;  // Give ownership of the allocated memory to the type

    res->ht_qualname = Ty_NewRef(ht_name);
    res->ht_name = ht_name;
    ht_name = NULL;  // Give our reference to the type

    type->tp_name = _ht_tpname;
    res->_ht_tpname = _ht_tpname;
    _ht_tpname = NULL;  // Give ownership to the type

    /* Copy the sizes */

    type->tp_basicsize = basicsize;
    type->tp_itemsize = itemsize;

    /* Copy all the ordinary slots */

    for (slot = spec->slots; slot->slot; slot++) {
        switch (slot->slot) {
        case Ty_tp_base:
        case Ty_tp_bases:
        case Ty_tp_doc:
            /* Processed above */
            break;
        case Ty_tp_members:
            {
                /* Move the slots to the heap type itself */
                size_t len = Ty_TYPE(type)->tp_itemsize * nmembers;
                memcpy(_PyHeapType_GET_MEMBERS(res), slot->pfunc, len);
                type->tp_members = _PyHeapType_GET_MEMBERS(res);
                TyMemberDef *memb;
                Ty_ssize_t i;
                for (memb = _PyHeapType_GET_MEMBERS(res), i = nmembers;
                     i > 0; ++memb, --i)
                {
                    if (memb->flags & Ty_RELATIVE_OFFSET) {
                        memb->flags &= ~Ty_RELATIVE_OFFSET;
                        memb->offset += type_data_offset;
                    }
                }
            }
            break;
        case Ty_tp_token:
            {
                res->ht_token = slot->pfunc == Ty_TP_USE_SPEC ? spec : slot->pfunc;
            }
            break;
        default:
            {
                /* Copy other slots directly */
                PySlot_Offset slotoffsets = pyslot_offsets[slot->slot];
                short slot_offset = slotoffsets.slot_offset;
                if (slotoffsets.subslot_offset == -1) {
                    /* Set a slot in the main TyTypeObject */
                    *(void**)((char*)res_start + slot_offset) = slot->pfunc;
                }
                else {
                    void *procs = *(void**)((char*)res_start + slot_offset);
                    short subslot_offset = slotoffsets.subslot_offset;
                    *(void**)((char*)procs + subslot_offset) = slot->pfunc;
                }
            }
            break;
        }
    }
    if (type->tp_dealloc == NULL) {
        /* It's a heap type, so needs the heap types' dealloc.
           subtype_dealloc will call the base type's tp_dealloc, if
           necessary. */
        type->tp_dealloc = subtype_dealloc;
    }

    /* Set up offsets */

    type->tp_vectorcall_offset = vectorcalloffset;
    type->tp_weaklistoffset = weaklistoffset;
    type->tp_dictoffset = dictoffset;

#ifdef Ty_GIL_DISABLED
    // Assign a unique id to enable per-thread refcounting
    res->unique_id = _TyObject_AssignUniqueId((TyObject *)res);
#endif

    /* Ready the type (which includes inheritance).
     *
     * After this call we should generally only touch up what's
     * accessible to Python code, like __dict__.
     */

    if (TyType_Ready(type) < 0) {
        goto finally;
    }

    if (!check_basicsize_includes_size_and_offsets(type)) {
        goto finally;
    }

    TyObject *dict = lookup_tp_dict(type);
    if (type->tp_doc) {
        TyObject *__doc__ = TyUnicode_FromString(_TyType_DocWithoutSignature(type->tp_name, type->tp_doc));
        if (!__doc__) {
            goto finally;
        }
        r = TyDict_SetItem(dict, &_Ty_ID(__doc__), __doc__);
        Ty_DECREF(__doc__);
        if (r < 0) {
            goto finally;
        }
    }

    if (weaklistoffset) {
        if (TyDict_DelItem(dict, &_Ty_ID(__weaklistoffset__)) < 0) {
            goto finally;
        }
    }
    if (dictoffset) {
        if (TyDict_DelItem(dict, &_Ty_ID(__dictoffset__)) < 0) {
            goto finally;
        }
    }

    /* Set type.__module__ */
    r = TyDict_Contains(dict, &_Ty_ID(__module__));
    if (r < 0) {
        goto finally;
    }
    if (r == 0) {
        s = strrchr(spec->name, '.');
        if (s != NULL) {
            TyObject *modname = TyUnicode_FromStringAndSize(
                    spec->name, (Ty_ssize_t)(s - spec->name));
            if (modname == NULL) {
                goto finally;
            }
            r = TyDict_SetItem(dict, &_Ty_ID(__module__), modname);
            Ty_DECREF(modname);
            if (r != 0) {
                goto finally;
            }
        }
        else {
            if (TyErr_WarnFormat(TyExc_DeprecationWarning, 1,
                    "builtin type %.200s has no __module__ attribute",
                    spec->name))
                goto finally;
        }
    }

    assert(_TyType_CheckConsistency(type));

 finally:
    if (TyErr_Occurred()) {
        Ty_CLEAR(res);
    }
    Ty_XDECREF(bases);
    TyMem_Free(tp_doc);
    Ty_XDECREF(ht_name);
    TyMem_Free(_ht_tpname);
    return (TyObject*)res;
}

TyObject *
TyType_FromModuleAndSpec(TyObject *module, TyType_Spec *spec, TyObject *bases)
{
    return TyType_FromMetaclass(NULL, module, spec, bases);
}

TyObject *
TyType_FromSpecWithBases(TyType_Spec *spec, TyObject *bases)
{
    return TyType_FromMetaclass(NULL, NULL, spec, bases);
}

TyObject *
TyType_FromSpec(TyType_Spec *spec)
{
    return TyType_FromMetaclass(NULL, NULL, spec, NULL);
}

TyObject *
TyType_GetName(TyTypeObject *type)
{
    return type_name((TyObject *)type, NULL);
}

TyObject *
TyType_GetQualName(TyTypeObject *type)
{
    return type_qualname((TyObject *)type, NULL);
}

TyObject *
TyType_GetModuleName(TyTypeObject *type)
{
    return type_module(type);
}

void *
TyType_GetSlot(TyTypeObject *type, int slot)
{
    void *parent_slot;
    int slots_len = Ty_ARRAY_LENGTH(pyslot_offsets);

    if (slot <= 0 || slot >= slots_len) {
        TyErr_BadInternalCall();
        return NULL;
    }
    int slot_offset = pyslot_offsets[slot].slot_offset;

    if (slot_offset >= (int)sizeof(TyTypeObject)) {
        if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
            return NULL;
        }
    }

    parent_slot = *(void**)((char*)type + slot_offset);
    if (parent_slot == NULL) {
        return NULL;
    }
    /* Return slot directly if we have no sub slot. */
    if (pyslot_offsets[slot].subslot_offset == -1) {
        return parent_slot;
    }
    return *(void**)((char*)parent_slot + pyslot_offsets[slot].subslot_offset);
}

TyObject *
TyType_GetModule(TyTypeObject *type)
{
    assert(TyType_Check(type));
    if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        TyErr_Format(
            TyExc_TypeError,
            "TyType_GetModule: Type '%s' is not a heap type",
            type->tp_name);
        return NULL;
    }

    PyHeapTypeObject* et = (PyHeapTypeObject*)type;
    if (!et->ht_module) {
        TyErr_Format(
            TyExc_TypeError,
            "TyType_GetModule: Type '%s' has no associated module",
            type->tp_name);
        return NULL;
    }
    return et->ht_module;

}

void *
TyType_GetModuleState(TyTypeObject *type)
{
    TyObject *m = TyType_GetModule(type);
    if (m == NULL) {
        return NULL;
    }
    return _TyModule_GetState(m);
}


/* Get the module of the first superclass where the module has the
 * given TyModuleDef.
 */
TyObject *
TyType_GetModuleByDef(TyTypeObject *type, TyModuleDef *def)
{
    assert(TyType_Check(type));

    if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        // type_ready_mro() ensures that no heap type is
        // contained in a static type MRO.
        goto error;
    }
    else {
        PyHeapTypeObject *ht = (PyHeapTypeObject*)type;
        TyObject *module = ht->ht_module;
        if (module && _TyModule_GetDef(module) == def) {
            return module;
        }
    }

    TyObject *res = NULL;
    BEGIN_TYPE_LOCK();

    TyObject *mro = lookup_tp_mro(type);
    // The type must be ready
    assert(mro != NULL);
    assert(TyTuple_Check(mro));
    // mro_invoke() ensures that the type MRO cannot be empty.
    assert(TyTuple_GET_SIZE(mro) >= 1);
    // Also, the first item in the MRO is the type itself, which
    // we already checked above. We skip it in the loop.
    assert(TyTuple_GET_ITEM(mro, 0) == (TyObject *)type);

    Ty_ssize_t n = TyTuple_GET_SIZE(mro);
    for (Ty_ssize_t i = 1; i < n; i++) {
        TyObject *super = TyTuple_GET_ITEM(mro, i);
        if (!_TyType_HasFeature((TyTypeObject *)super, Ty_TPFLAGS_HEAPTYPE)) {
            // Static types in the MRO need to be skipped
            continue;
        }

        PyHeapTypeObject *ht = (PyHeapTypeObject*)super;
        TyObject *module = ht->ht_module;
        if (module && _TyModule_GetDef(module) == def) {
            res = module;
            break;
        }
    }
    END_TYPE_LOCK();

    if (res != NULL) {
        return res;
    }
error:
    TyErr_Format(
        TyExc_TypeError,
        "TyType_GetModuleByDef: No superclass of '%s' has the given module",
        type->tp_name);
    return NULL;
}


static TyTypeObject *
get_base_by_token_recursive(TyObject *bases, void *token)
{
    assert(bases != NULL);
    TyTypeObject *res = NULL;
    Ty_ssize_t n = TyTuple_GET_SIZE(bases);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(bases, i));
        if (!_TyType_HasFeature(base, Ty_TPFLAGS_HEAPTYPE)) {
            continue;
        }
        if (((PyHeapTypeObject*)base)->ht_token == token) {
            res = base;
            break;
        }
        base = get_base_by_token_recursive(lookup_tp_bases(base), token);
        if (base != NULL) {
            res = base;
            break;
        }
    }
    return res;  // Prefer to return recursively from one place
}

int
TyType_GetBaseByToken(TyTypeObject *type, void *token, TyTypeObject **result)
{
    if (result != NULL) {
        *result = NULL;
    }

    if (token == NULL) {
        TyErr_Format(TyExc_SystemError,
                     "TyType_GetBaseByToken called with token=NULL");
        return -1;
    }
    if (!TyType_Check(type)) {
        TyErr_Format(TyExc_TypeError,
                     "expected a type, got a '%T' object", type);
        return -1;
    }

    if (!_TyType_HasFeature(type, Ty_TPFLAGS_HEAPTYPE)) {
        // No static type has a heaptype superclass,
        // which is ensured by type_ready_mro().
        return 0;
    }
    if (((PyHeapTypeObject*)type)->ht_token == token) {
found:
        if (result != NULL) {
            *result = (TyTypeObject *)Ty_NewRef(type);
        }
        return 1;
    }

    TyObject *mro = type->tp_mro;  // No lookup, following TyType_IsSubtype()
    if (mro == NULL) {
        TyTypeObject *base;
        base = get_base_by_token_recursive(lookup_tp_bases(type), token);
        if (base != NULL) {
            // Copying the given type can cause a slowdown,
            // unlike the overwrite below.
            type = base;
            goto found;
        }
        return 0;
    }
    // mro_invoke() ensures that the type MRO cannot be empty.
    assert(TyTuple_GET_SIZE(mro) >= 1);
    // Also, the first item in the MRO is the type itself, which
    // we already checked above. We skip it in the loop.
    assert(TyTuple_GET_ITEM(mro, 0) == (TyObject *)type);
    Ty_ssize_t n = TyTuple_GET_SIZE(mro);
    for (Ty_ssize_t i = 1; i < n; i++) {
        TyTypeObject *base = (TyTypeObject *)TyTuple_GET_ITEM(mro, i);
        if (_TyType_HasFeature(base, Ty_TPFLAGS_HEAPTYPE)
            && ((PyHeapTypeObject*)base)->ht_token == token) {
            type = base;
            goto found;
        }
    }
    return 0;
}


void *
PyObject_GetTypeData(TyObject *obj, TyTypeObject *cls)
{
    assert(PyObject_TypeCheck(obj, cls));
    return (char *)obj + _align_up(cls->tp_base->tp_basicsize);
}

Ty_ssize_t
TyType_GetTypeDataSize(TyTypeObject *cls)
{
    ptrdiff_t result = cls->tp_basicsize - _align_up(cls->tp_base->tp_basicsize);
    if (result < 0) {
        return 0;
    }
    return result;
}

void *
PyObject_GetItemData(TyObject *obj)
{
    if (!TyType_HasFeature(Ty_TYPE(obj), Ty_TPFLAGS_ITEMS_AT_END)) {
        TyErr_Format(TyExc_TypeError,
                     "type '%s' does not have Ty_TPFLAGS_ITEMS_AT_END",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }
    return (char *)obj + Ty_TYPE(obj)->tp_basicsize;
}

/* Internal API to look for a name through the MRO, bypassing the method cache.
   This returns a borrowed reference, and might set an exception.
   'error' is set to: -1: error with exception; 1: error without exception; 0: ok */
static TyObject *
find_name_in_mro(TyTypeObject *type, TyObject *name, int *error)
{
    ASSERT_TYPE_LOCK_HELD();

    Ty_hash_t hash = _TyObject_HashFast(name);
    if (hash == -1) {
        *error = -1;
        return NULL;
    }

    /* Look in tp_dict of types in MRO */
    TyObject *mro = lookup_tp_mro(type);
    if (mro == NULL) {
        if (!is_readying(type)) {
            if (TyType_Ready(type) < 0) {
                *error = -1;
                return NULL;
            }
            mro = lookup_tp_mro(type);
        }
        if (mro == NULL) {
            *error = 1;
            return NULL;
        }
    }

    TyObject *res = NULL;
    /* Keep a strong reference to mro because type->tp_mro can be replaced
       during dict lookup, e.g. when comparing to non-string keys. */
    Ty_INCREF(mro);
    Ty_ssize_t n = TyTuple_GET_SIZE(mro);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *base = TyTuple_GET_ITEM(mro, i);
        TyObject *dict = lookup_tp_dict(_TyType_CAST(base));
        assert(dict && TyDict_Check(dict));
        if (_TyDict_GetItemRef_KnownHash((PyDictObject *)dict, name, hash, &res) < 0) {
            *error = -1;
            goto done;
        }
        if (res != NULL) {
            break;
        }
    }
    *error = 0;
done:
    Ty_DECREF(mro);
    return res;
}

/* Check if the "readied" PyUnicode name
   is a double-underscore special name. */
static int
is_dunder_name(TyObject *name)
{
    Ty_ssize_t length = TyUnicode_GET_LENGTH(name);
    int kind = TyUnicode_KIND(name);
    /* Special names contain at least "__x__" and are always ASCII. */
    if (length > 4 && kind == TyUnicode_1BYTE_KIND) {
        const Ty_UCS1 *characters = TyUnicode_1BYTE_DATA(name);
        return (
            ((characters[length-2] == '_') && (characters[length-1] == '_')) &&
            ((characters[0] == '_') && (characters[1] == '_'))
        );
    }
    return 0;
}

static TyObject *
update_cache(struct type_cache_entry *entry, TyObject *name, unsigned int version_tag, TyObject *value)
{
    _Ty_atomic_store_ptr_relaxed(&entry->value, value); /* borrowed */
    assert(_PyASCIIObject_CAST(name)->hash != -1);
    OBJECT_STAT_INC_COND(type_cache_collisions, entry->name != Ty_None && entry->name != name);
    // We're releasing this under the lock for simplicity sake because it's always a
    // exact unicode object or Ty_None so it's safe to do so.
    TyObject *old_name = entry->name;
    _Ty_atomic_store_ptr_relaxed(&entry->name, Ty_NewRef(name));
    // We must write the version last to avoid _Ty_TryXGetStackRef()
    // operating on an invalid (already deallocated) value inside
    // _TyType_LookupRefAndVersion().  If we write the version first then a
    // reader could pass the "entry_version == type_version" check but could
    // be using the old entry value.
    _Ty_atomic_store_uint32_release(&entry->version, version_tag);
    return old_name;
}

#if Ty_GIL_DISABLED

static void
update_cache_gil_disabled(struct type_cache_entry *entry, TyObject *name,
                          unsigned int version_tag, TyObject *value)
{
    _PySeqLock_LockWrite(&entry->sequence);

    // update the entry
    if (entry->name == name &&
        entry->value == value &&
        entry->version == version_tag) {
        // We raced with another update, bail and restore previous sequence.
        _PySeqLock_AbandonWrite(&entry->sequence);
        return;
    }

    TyObject *old_value = update_cache(entry, name, version_tag, value);

    // Then update sequence to the next valid value
    _PySeqLock_UnlockWrite(&entry->sequence);

    Ty_DECREF(old_value);
}

#endif

void
_PyTypes_AfterFork(void)
{
#ifdef Ty_GIL_DISABLED
    struct type_cache *cache = get_type_cache();
    for (Ty_ssize_t i = 0; i < (1 << MCACHE_SIZE_EXP); i++) {
        struct type_cache_entry *entry = &cache->hashtable[i];
        if (_PySeqLock_AfterFork(&entry->sequence)) {
            // Entry was in the process of updating while forking, clear it...
            entry->value = NULL;
            Ty_SETREF(entry->name, Ty_None);
            entry->version = 0;
        }
    }
#endif
}

/* Internal API to look for a name through the MRO.
   This returns a strong reference, and doesn't set an exception!
   If nonzero, version is set to the value of type->tp_version at the time of
   the lookup.
*/
TyObject *
_TyType_LookupRefAndVersion(TyTypeObject *type, TyObject *name, unsigned int *version)
{
    _PyStackRef out;
    unsigned int ver = _TyType_LookupStackRefAndVersion(type, name, &out);
    if (version) {
        *version = ver;
    }
    if (PyStackRef_IsNull(out)) {
        return NULL;
    }
    return PyStackRef_AsPyObjectSteal(out);
}

unsigned int
_TyType_LookupStackRefAndVersion(TyTypeObject *type, TyObject *name, _PyStackRef *out)
{
    unsigned int h = MCACHE_HASH_METHOD(type, name);
    struct type_cache *cache = get_type_cache();
    struct type_cache_entry *entry = &cache->hashtable[h];
#ifdef Ty_GIL_DISABLED
    // synchronize-with other writing threads by doing an acquire load on the sequence
    while (1) {
        uint32_t sequence = _PySeqLock_BeginRead(&entry->sequence);
        uint32_t entry_version = _Ty_atomic_load_uint32_acquire(&entry->version);
        uint32_t type_version = _Ty_atomic_load_uint32_acquire(&type->tp_version_tag);
        if (entry_version == type_version &&
            _Ty_atomic_load_ptr_relaxed(&entry->name) == name) {
            OBJECT_STAT_INC_COND(type_cache_hits, !is_dunder_name(name));
            OBJECT_STAT_INC_COND(type_cache_dunder_hits, is_dunder_name(name));
            if (_Ty_TryXGetStackRef(&entry->value, out)) {
                // If the sequence is still valid then we're done
                if (_PySeqLock_EndRead(&entry->sequence, sequence)) {
                    return entry_version;
                }
                PyStackRef_XCLOSE(*out);
            }
            else {
                // If we can't incref the object we need to fallback to locking
                break;
            }
        }
        else {
            // cache miss
            break;
        }
    }
#else
    if (entry->version == type->tp_version_tag && entry->name == name) {
        assert(type->tp_version_tag);
        OBJECT_STAT_INC_COND(type_cache_hits, !is_dunder_name(name));
        OBJECT_STAT_INC_COND(type_cache_dunder_hits, is_dunder_name(name));
        *out = entry->value ? PyStackRef_FromPyObjectNew(entry->value) : PyStackRef_NULL;
        return entry->version;
    }
#endif
    OBJECT_STAT_INC_COND(type_cache_misses, !is_dunder_name(name));
    OBJECT_STAT_INC_COND(type_cache_dunder_misses, is_dunder_name(name));

    /* We may end up clearing live exceptions below, so make sure it's ours. */
    assert(!TyErr_Occurred());

    // We need to atomically do the lookup and capture the version before
    // anyone else can modify our mro or mutate the type.

    TyObject *res;
    int error;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    int has_version = 0;
    unsigned int assigned_version = 0;
    BEGIN_TYPE_LOCK();
    // We must assign the version before doing the lookup.  If
    // find_name_in_mro() blocks and releases the critical section
    // then the type version can change.
    if (MCACHE_CACHEABLE_NAME(name)) {
        has_version = assign_version_tag(interp, type);
        assigned_version = type->tp_version_tag;
    }
    res = find_name_in_mro(type, name, &error);
    END_TYPE_LOCK();

    /* Only put NULL results into cache if there was no error. */
    if (error) {
        /* It's not ideal to clear the error condition,
           but this function is documented as not setting
           an exception, and I don't want to change that.
           E.g., when TyType_Ready() can't proceed, it won't
           set the "ready" flag, so future attempts to ready
           the same type will call it again -- hopefully
           in a context that propagates the exception out.
        */
        if (error == -1) {
            TyErr_Clear();
        }
        *out = PyStackRef_NULL;
        return 0;
    }

    if (has_version) {
#if Ty_GIL_DISABLED
        update_cache_gil_disabled(entry, name, assigned_version, res);
#else
        TyObject *old_value = update_cache(entry, name, assigned_version, res);
        Ty_DECREF(old_value);
#endif
    }
    *out = res ? PyStackRef_FromPyObjectSteal(res) : PyStackRef_NULL;
    return has_version ? assigned_version : 0;
}

/* Internal API to look for a name through the MRO.
   This returns a strong reference, and doesn't set an exception!
*/
TyObject *
_TyType_LookupRef(TyTypeObject *type, TyObject *name)
{
    return _TyType_LookupRefAndVersion(type, name, NULL);
}

/* Internal API to look for a name through the MRO.
   This returns a borrowed reference, and doesn't set an exception! */
TyObject *
_TyType_Lookup(TyTypeObject *type, TyObject *name)
{
    TyObject *res = _TyType_LookupRefAndVersion(type, name, NULL);
    Ty_XDECREF(res);
    return res;
}

int
_TyType_CacheInitForSpecialization(PyHeapTypeObject *type, TyObject *init,
                                   unsigned int tp_version)
{
    if (!init || !tp_version) {
        return 0;
    }
    int can_cache;
    BEGIN_TYPE_LOCK();
    can_cache = ((TyTypeObject*)type)->tp_version_tag == tp_version;
    #ifdef Ty_GIL_DISABLED
    can_cache = can_cache && _TyObject_HasDeferredRefcount(init);
    #endif
    if (can_cache) {
        FT_ATOMIC_STORE_PTR_RELEASE(type->_spec_cache.init, init);
    }
    END_TYPE_LOCK();
    return can_cache;
}

int
_TyType_CacheGetItemForSpecialization(PyHeapTypeObject *ht, TyObject *descriptor, uint32_t tp_version)
{
    if (!descriptor || !tp_version) {
        return 0;
    }
    int can_cache;
    BEGIN_TYPE_LOCK();
    can_cache = ((TyTypeObject*)ht)->tp_version_tag == tp_version;
    // This pointer is invalidated by TyType_Modified (see the comment on
    // struct _specialization_cache):
    PyFunctionObject *func = (PyFunctionObject *)descriptor;
    uint32_t version = _TyFunction_GetVersionForCurrentState(func);
    can_cache = can_cache && _TyFunction_IsVersionValid(version);
#ifdef Ty_GIL_DISABLED
    can_cache = can_cache && _TyObject_HasDeferredRefcount(descriptor);
#endif
    if (can_cache) {
        FT_ATOMIC_STORE_PTR_RELEASE(ht->_spec_cache.getitem, descriptor);
        FT_ATOMIC_STORE_UINT32_RELAXED(ht->_spec_cache.getitem_version, version);
    }
    END_TYPE_LOCK();
    return can_cache;
}

void
_TyType_SetFlags(TyTypeObject *self, unsigned long mask, unsigned long flags)
{
    BEGIN_TYPE_LOCK();
    type_set_flags_with_mask(self, mask, flags);
    END_TYPE_LOCK();
}

int
_TyType_Validate(TyTypeObject *ty, _py_validate_type validate, unsigned int *tp_version)
{
    int err;
    BEGIN_TYPE_LOCK();
    err = validate(ty);
    if (!err) {
        if(assign_version_tag(_TyInterpreterState_GET(), ty)) {
            *tp_version = ty->tp_version_tag;
        }
        else {
            err = -1;
        }
    }
    END_TYPE_LOCK();
    return err;
}

static void
set_flags_recursive(TyTypeObject *self, unsigned long mask, unsigned long flags)
{
    if (TyType_HasFeature(self, Ty_TPFLAGS_IMMUTABLETYPE) ||
        (self->tp_flags & mask) == flags)
    {
        return;
    }

    type_set_flags_with_mask(self, mask, flags);

    TyObject *children = _TyType_GetSubclasses(self);
    if (children == NULL) {
        return;
    }

    for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(children); i++) {
        TyObject *child = TyList_GET_ITEM(children, i);
        set_flags_recursive((TyTypeObject *)child, mask, flags);
    }
    Ty_DECREF(children);
}

void
_TyType_SetFlagsRecursive(TyTypeObject *self, unsigned long mask, unsigned long flags)
{
    BEGIN_TYPE_LOCK();
    set_flags_recursive(self, mask, flags);
    END_TYPE_LOCK();
}

/* This is similar to PyObject_GenericGetAttr(),
   but uses _TyType_LookupRef() instead of just looking in type->tp_dict.

   The argument suppress_missing_attribute is used to provide a
   fast path for hasattr. The possible values are:

   * NULL: do not suppress the exception
   * Non-zero pointer: suppress the TyExc_AttributeError and
     set *suppress_missing_attribute to 1 to signal we are returning NULL while
     having suppressed the exception (other exceptions are not suppressed)

   */
TyObject *
_Ty_type_getattro_impl(TyTypeObject *type, TyObject *name, int * suppress_missing_attribute)
{
    TyTypeObject *metatype = Ty_TYPE(type);
    TyObject *meta_attribute, *attribute;
    descrgetfunc meta_get;
    TyObject* res;

    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return NULL;
    }

    /* Initialize this type (we'll assume the metatype is initialized) */
    if (!_TyType_IsReady(type)) {
        if (TyType_Ready(type) < 0)
            return NULL;
    }

    /* No readable descriptor found yet */
    meta_get = NULL;

    /* Look for the attribute in the metatype */
    meta_attribute = _TyType_LookupRef(metatype, name);

    if (meta_attribute != NULL) {
        meta_get = Ty_TYPE(meta_attribute)->tp_descr_get;

        if (meta_get != NULL && PyDescr_IsData(meta_attribute)) {
            /* Data descriptors implement tp_descr_set to intercept
             * writes. Assume the attribute is not overridden in
             * type's tp_dict (and bases): call the descriptor now.
             */
            res = meta_get(meta_attribute, (TyObject *)type,
                           (TyObject *)metatype);
            Ty_DECREF(meta_attribute);
            return res;
        }
    }

    /* No data descriptor found on metatype. Look in tp_dict of this
     * type and its bases */
    attribute = _TyType_LookupRef(type, name);
    if (attribute != NULL) {
        /* Implement descriptor functionality, if any */
        descrgetfunc local_get = Ty_TYPE(attribute)->tp_descr_get;

        Ty_XDECREF(meta_attribute);

        if (local_get != NULL) {
            /* NULL 2nd argument indicates the descriptor was
             * found on the target object itself (or a base)  */
            res = local_get(attribute, (TyObject *)NULL,
                            (TyObject *)type);
            Ty_DECREF(attribute);
            return res;
        }

        return attribute;
    }

    /* No attribute found in local __dict__ (or bases): use the
     * descriptor from the metatype, if any */
    if (meta_get != NULL) {
        TyObject *res;
        res = meta_get(meta_attribute, (TyObject *)type,
                       (TyObject *)metatype);
        Ty_DECREF(meta_attribute);
        return res;
    }

    /* If an ordinary attribute was found on the metatype, return it now */
    if (meta_attribute != NULL) {
        return meta_attribute;
    }

    /* Give up */
    if (suppress_missing_attribute == NULL) {
        TyErr_Format(TyExc_AttributeError,
                        "type object '%.100s' has no attribute '%U'",
                        type->tp_name, name);
    } else {
        // signal the caller we have not set an TyExc_AttributeError and gave up
        *suppress_missing_attribute = 1;
    }
    return NULL;
}

/* This is similar to PyObject_GenericGetAttr(),
   but uses _TyType_LookupRef() instead of just looking in type->tp_dict. */
TyObject *
_Ty_type_getattro(TyObject *tp, TyObject *name)
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    return _Ty_type_getattro_impl(type, name, NULL);
}

static int
type_update_dict(TyTypeObject *type, PyDictObject *dict, TyObject *name,
                 TyObject *value, TyObject **old_value)
{
    // We don't want any re-entrancy between when we update the dict
    // and call type_modified_unlocked, including running the destructor
    // of the current value as it can observe the cache in an inconsistent
    // state.  Because we have an exact unicode and our dict has exact
    // unicodes we know that this will all complete without releasing
    // the locks.
    if (_TyDict_GetItemRef_Unicode_LockHeld(dict, name, old_value) < 0) {
        return -1;
    }

    /* Clear the VALID_VERSION flag of 'type' and all its
        subclasses.  This could possibly be unified with the
        update_subclasses() recursion in update_slot(), but carefully:
        they each have their own conditions on which to stop
        recursing into subclasses. */
    type_modified_unlocked(type);

    if (_TyDict_SetItem_LockHeld(dict, name, value) < 0) {
        TyErr_Format(TyExc_AttributeError,
                     "type object '%.50s' has no attribute '%U'",
                     ((TyTypeObject*)type)->tp_name, name);
        _TyObject_SetAttributeErrorContext((TyObject *)type, name);
        return -1;
    }

    if (is_dunder_name(name)) {
        return update_slot(type, name);
    }

    return 0;
}

static int
type_setattro(TyObject *self, TyObject *name, TyObject *value)
{
    TyTypeObject *type = PyTypeObject_CAST(self);
    int res;
    if (type->tp_flags & Ty_TPFLAGS_IMMUTABLETYPE) {
        TyErr_Format(
            TyExc_TypeError,
            "cannot set %R attribute of immutable type '%s'",
            name, type->tp_name);
        return -1;
    }
    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "attribute name must be string, not '%.200s'",
                     Ty_TYPE(name)->tp_name);
        return -1;
    }

    if (TyUnicode_CheckExact(name)) {
        Ty_INCREF(name);
    }
    else {
        name = _TyUnicode_Copy(name);
        if (name == NULL)
            return -1;
    }
    if (!TyUnicode_CHECK_INTERNED(name)) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        _TyUnicode_InternMortal(interp, &name);
        if (!TyUnicode_CHECK_INTERNED(name)) {
            TyErr_SetString(TyExc_MemoryError,
                            "Out of memory interning an attribute name");
            Ty_DECREF(name);
            return -1;
        }
    }

    TyTypeObject *metatype = Ty_TYPE(type);
    assert(!_TyType_HasFeature(metatype, Ty_TPFLAGS_INLINE_VALUES));
    assert(!_TyType_HasFeature(metatype, Ty_TPFLAGS_MANAGED_DICT));

    TyObject *old_value = NULL;
    TyObject *descr = _TyType_LookupRef(metatype, name);
    if (descr != NULL) {
        descrsetfunc f = Ty_TYPE(descr)->tp_descr_set;
        if (f != NULL) {
            res = f(descr, (TyObject *)type, value);
            goto done;
        }
    }

    TyObject *dict = type->tp_dict;
    if (dict == NULL) {
        // We don't just do TyType_Ready because we could already be readying
        BEGIN_TYPE_LOCK();
        dict = type->tp_dict;
        if (dict == NULL) {
            dict = type->tp_dict = TyDict_New();
        }
        END_TYPE_LOCK();
        if (dict == NULL) {
            res = -1;
            goto done;
        }
    }

    BEGIN_TYPE_DICT_LOCK(dict);
    res = type_update_dict(type, (PyDictObject *)dict, name, value, &old_value);
    assert(_TyType_CheckConsistency(type));
    END_TYPE_DICT_LOCK();

done:
    Ty_DECREF(name);
    Ty_XDECREF(descr);
    Ty_XDECREF(old_value);
    return res;
}


static void
type_dealloc_common(TyTypeObject *type)
{
    TyObject *bases = lookup_tp_bases(type);
    if (bases != NULL) {
        TyObject *exc = TyErr_GetRaisedException();
        remove_all_subclasses(type, bases);
        TyErr_SetRaisedException(exc);
    }
}


static void
clear_static_tp_subclasses(TyTypeObject *type, int isbuiltin)
{
    TyObject *subclasses = lookup_tp_subclasses(type);
    if (subclasses == NULL) {
        return;
    }

    /* Normally it would be a problem to finalize the type if its
       tp_subclasses wasn't cleared first.  However, this is only
       ever called at the end of runtime finalization, so we can be
       more liberal in cleaning up.  If the given type still has
       subtypes at this point then some extension module did not
       correctly finalize its objects.

       We can safely obliterate such subtypes since the extension
       module and its objects won't be used again, except maybe if
       the runtime were re-initialized.  In that case the sticky
       situation would only happen if the module were re-imported
       then and only if the subtype were stored in a global and only
       if that global were not overwritten during import.  We'd be
       fine since the extension is otherwise unsafe and unsupported
       in that situation, and likely problematic already.

       In any case, this situation means at least some memory is
       going to leak.  This mostly only affects embedding scenarios.
     */

#ifndef NDEBUG
    // For now we just do a sanity check and then clear tp_subclasses.
    Ty_ssize_t i = 0;
    TyObject *key, *ref;  // borrowed ref
    while (TyDict_Next(subclasses, &i, &key, &ref)) {
        TyTypeObject *subclass = type_from_ref(ref);
        if (subclass == NULL) {
            continue;
        }
        // All static builtin subtypes should have been finalized already.
        assert(!isbuiltin || !(subclass->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN));
        Ty_DECREF(subclass);
    }
#else
    (void)isbuiltin;
#endif

    clear_tp_subclasses(type);
}

static void
clear_static_type_objects(TyInterpreterState *interp, TyTypeObject *type,
                          int isbuiltin, int final)
{
    if (final) {
        Ty_CLEAR(type->tp_cache);
    }
    clear_tp_dict(type);
    clear_tp_bases(type, final);
    clear_tp_mro(type, final);
    clear_static_tp_subclasses(type, isbuiltin);
}


static void
fini_static_type(TyInterpreterState *interp, TyTypeObject *type,
                 int isbuiltin, int final)
{
    assert(type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN);
    assert(_Ty_IsImmortal((TyObject *)type));

    type_dealloc_common(type);

    clear_static_type_objects(interp, type, isbuiltin, final);

    if (final) {
        BEGIN_TYPE_LOCK();
        type_clear_flags(type, Ty_TPFLAGS_READY);
        set_version_unlocked(type, 0);
        END_TYPE_LOCK();
    }

    _PyStaticType_ClearWeakRefs(interp, type);
    managed_static_type_state_clear(interp, type, isbuiltin, final);
    /* We leave _Ty_TPFLAGS_STATIC_BUILTIN set on tp_flags. */
}

void
_PyTypes_FiniExtTypes(TyInterpreterState *interp)
{
    for (size_t i = _Ty_MAX_MANAGED_STATIC_EXT_TYPES; i > 0; i--) {
        if (interp->types.for_extensions.num_initialized == 0) {
            break;
        }
        int64_t count = 0;
        TyTypeObject *type = static_ext_type_lookup(interp, i-1, &count);
        if (type == NULL) {
            continue;
        }
        int final = (count == 1);
        fini_static_type(interp, type, 0, final);
    }
}

void
_PyStaticType_FiniBuiltin(TyInterpreterState *interp, TyTypeObject *type)
{
    fini_static_type(interp, type, 1, _Ty_IsMainInterpreter(interp));
}


static void
type_dealloc(TyObject *self)
{
    TyTypeObject *type = PyTypeObject_CAST(self);

    // Assert this is a heap-allocated type object
    _TyObject_ASSERT((TyObject *)type, type->tp_flags & Ty_TPFLAGS_HEAPTYPE);

    _TyObject_GC_UNTRACK(type);
    type_dealloc_common(type);

    // PyObject_ClearWeakRefs() raises an exception if Ty_REFCNT() != 0
    assert(Ty_REFCNT(type) == 0);
    PyObject_ClearWeakRefs((TyObject *)type);

    Ty_XDECREF(type->tp_base);
    Ty_XDECREF(type->tp_dict);
    Ty_XDECREF(type->tp_bases);
    Ty_XDECREF(type->tp_mro);
    Ty_XDECREF(type->tp_cache);
    clear_tp_subclasses(type);

    /* A type's tp_doc is heap allocated, unlike the tp_doc slots
     * of most other objects.  It's okay to cast it to char *.
     */
    TyMem_Free((char *)type->tp_doc);

    PyHeapTypeObject *et = (PyHeapTypeObject *)type;
    Ty_XDECREF(et->ht_name);
    Ty_XDECREF(et->ht_qualname);
    Ty_XDECREF(et->ht_slots);
    if (et->ht_cached_keys) {
        _PyDictKeys_DecRef(et->ht_cached_keys);
    }
    Ty_XDECREF(et->ht_module);
    TyMem_Free(et->_ht_tpname);
#ifdef Ty_GIL_DISABLED
    assert(et->unique_id == _Ty_INVALID_UNIQUE_ID);
#endif
    et->ht_token = NULL;
    Ty_TYPE(type)->tp_free((TyObject *)type);
}


/*[clinic input]
type.__subclasses__

Return a list of immediate subclasses.
[clinic start generated code]*/

static TyObject *
type___subclasses___impl(TyTypeObject *self)
/*[clinic end generated code: output=eb5eb54485942819 input=5af66132436f9a7b]*/
{
    return _TyType_GetSubclasses(self);
}

static TyObject *
type_prepare(TyObject *self, TyObject *const *args, Ty_ssize_t nargs,
             TyObject *kwnames)
{
    return TyDict_New();
}


/*
   Merge the __dict__ of aclass into dict, and recursively also all
   the __dict__s of aclass's base classes.  The order of merging isn't
   defined, as it's expected that only the final set of dict keys is
   interesting.
   Return 0 on success, -1 on error.
*/

static int
merge_class_dict(TyObject *dict, TyObject *aclass)
{
    TyObject *classdict;
    TyObject *bases;

    assert(TyDict_Check(dict));
    assert(aclass);

    /* Merge in the type's dict (if any). */
    if (PyObject_GetOptionalAttr(aclass, &_Ty_ID(__dict__), &classdict) < 0) {
        return -1;
    }
    if (classdict != NULL) {
        int status = TyDict_Update(dict, classdict);
        Ty_DECREF(classdict);
        if (status < 0)
            return -1;
    }

    /* Recursively merge in the base types' (if any) dicts. */
    if (PyObject_GetOptionalAttr(aclass, &_Ty_ID(__bases__), &bases) < 0) {
        return -1;
    }
    if (bases != NULL) {
        /* We have no guarantee that bases is a real tuple */
        Ty_ssize_t i, n;
        n = PySequence_Size(bases); /* This better be right */
        if (n < 0) {
            Ty_DECREF(bases);
            return -1;
        }
        else {
            for (i = 0; i < n; i++) {
                int status;
                TyObject *base = PySequence_GetItem(bases, i);
                if (base == NULL) {
                    Ty_DECREF(bases);
                    return -1;
                }
                status = merge_class_dict(dict, base);
                Ty_DECREF(base);
                if (status < 0) {
                    Ty_DECREF(bases);
                    return -1;
                }
            }
        }
        Ty_DECREF(bases);
    }
    return 0;
}

/* __dir__ for type objects: returns __dict__ and __bases__.
   We deliberately don't suck up its __class__, as methods belonging to the
   metaclass would probably be more confusing than helpful.
*/
/*[clinic input]
type.__dir__

Specialized __dir__ implementation for types.
[clinic start generated code]*/

static TyObject *
type___dir___impl(TyTypeObject *self)
/*[clinic end generated code: output=69d02fe92c0f15fa input=7733befbec645968]*/
{
    TyObject *result = NULL;
    TyObject *dict = TyDict_New();

    if (dict != NULL && merge_class_dict(dict, (TyObject *)self) == 0)
        result = TyDict_Keys(dict);

    Ty_XDECREF(dict);
    return result;
}

/*[clinic input]
type.__sizeof__

Return memory consumption of the type object.
[clinic start generated code]*/

static TyObject *
type___sizeof___impl(TyTypeObject *self)
/*[clinic end generated code: output=766f4f16cd3b1854 input=99398f24b9cf45d6]*/
{
    size_t size;
    if (self->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
        PyHeapTypeObject* et = (PyHeapTypeObject*)self;
        size = sizeof(PyHeapTypeObject);
        if (et->ht_cached_keys)
            size += _TyDict_KeysSize(et->ht_cached_keys);
    }
    else {
        size = sizeof(TyTypeObject);
    }
    return TyLong_FromSize_t(size);
}

static TyMethodDef type_methods[] = {
    TYPE_MRO_METHODDEF
    TYPE___SUBCLASSES___METHODDEF
    {"__prepare__", _PyCFunction_CAST(type_prepare),
     METH_FASTCALL | METH_KEYWORDS | METH_CLASS,
     TyDoc_STR("__prepare__($cls, name, bases, /, **kwds)\n"
               "--\n"
               "\n"
               "Create the namespace for the class statement")},
    TYPE___INSTANCECHECK___METHODDEF
    TYPE___SUBCLASSCHECK___METHODDEF
    TYPE___DIR___METHODDEF
    TYPE___SIZEOF___METHODDEF
    {0}
};

TyDoc_STRVAR(type_doc,
"type(object) -> the object's type\n"
"type(name, bases, dict, **kwds) -> a new type");

static int
type_traverse(TyObject *self, visitproc visit, void *arg)
{
    TyTypeObject *type = PyTypeObject_CAST(self);

    /* Because of type_is_gc(), the collector only calls this
       for heaptypes. */
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        char msg[200];
        sprintf(msg, "type_traverse() called on non-heap type '%.100s'",
                type->tp_name);
        _TyObject_ASSERT_FAILED_MSG((TyObject *)type, msg);
    }

    Ty_VISIT(type->tp_dict);
    Ty_VISIT(type->tp_cache);
    Ty_VISIT(type->tp_mro);
    Ty_VISIT(type->tp_bases);
    Ty_VISIT(type->tp_base);
    Ty_VISIT(((PyHeapTypeObject *)type)->ht_module);

    /* There's no need to visit others because they can't be involved
       in cycles:
       type->tp_subclasses is a list of weak references,
       ((PyHeapTypeObject *)type)->ht_slots is a tuple of strings,
       ((PyHeapTypeObject *)type)->ht_*name are strings.
       */

    return 0;
}

static int
type_clear(TyObject *self)
{
    TyTypeObject *type = PyTypeObject_CAST(self);

    /* Because of type_is_gc(), the collector only calls this
       for heaptypes. */
    _TyObject_ASSERT((TyObject *)type, type->tp_flags & Ty_TPFLAGS_HEAPTYPE);

    /* We need to invalidate the method cache carefully before clearing
       the dict, so that other objects caught in a reference cycle
       don't start calling destroyed methods.

       Otherwise, we need to clear tp_mro, which is
       part of a hard cycle (its first element is the class itself) that
       won't be broken otherwise (it's a tuple and tuples don't have a
       tp_clear handler).
       We also need to clear ht_module, if present: the module usually holds a
       reference to its class. None of the other fields need to be

       cleared, and here's why:

       tp_cache:
           Not used; if it were, it would be a dict.

       tp_bases, tp_base:
           If these are involved in a cycle, there must be at least
           one other, mutable object in the cycle, e.g. a base
           class's dict; the cycle will be broken that way.

       tp_subclasses:
           A dict of weak references can't be part of a cycle; and
           dicts have their own tp_clear.

       slots (in PyHeapTypeObject):
           A tuple of strings can't be part of a cycle.
    */

    TyType_Modified(type);
    TyObject *dict = lookup_tp_dict(type);
    if (dict) {
        TyDict_Clear(dict);
    }
    Ty_CLEAR(((PyHeapTypeObject *)type)->ht_module);

    Ty_CLEAR(type->tp_mro);

    return 0;
}

static int
type_is_gc(TyObject *tp)
{
    TyTypeObject *type = PyTypeObject_CAST(tp);
    return type->tp_flags & Ty_TPFLAGS_HEAPTYPE;
}


static TyNumberMethods type_as_number = {
        .nb_or = _Ty_union_type_or, // Add __or__ function
};

TyTypeObject TyType_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "type",                                     /* tp_name */
    sizeof(PyHeapTypeObject),                   /* tp_basicsize */
    sizeof(TyMemberDef),                        /* tp_itemsize */
    type_dealloc,                               /* tp_dealloc */
    offsetof(TyTypeObject, tp_vectorcall),      /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    type_repr,                                  /* tp_repr */
    &type_as_number,                            /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    type_call,                                  /* tp_call */
    0,                                          /* tp_str */
    _Ty_type_getattro,                          /* tp_getattro */
    type_setattro,                              /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
    Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_TYPE_SUBCLASS |
    Ty_TPFLAGS_HAVE_VECTORCALL |
    Ty_TPFLAGS_ITEMS_AT_END,                    /* tp_flags */
    type_doc,                                   /* tp_doc */
    type_traverse,                              /* tp_traverse */
    type_clear,                                 /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(TyTypeObject, tp_weaklist),        /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    type_methods,                               /* tp_methods */
    type_members,                               /* tp_members */
    type_getsets,                               /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(TyTypeObject, tp_dict),            /* tp_dictoffset */
    type_init,                                  /* tp_init */
    0,                                          /* tp_alloc */
    type_new,                                   /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
    type_is_gc,                                 /* tp_is_gc */
    .tp_vectorcall = type_vectorcall,
};


/* The base type of all types (eventually)... except itself. */

/* You may wonder why object.__new__() only complains about arguments
   when object.__init__() is not overridden, and vice versa.

   Consider the use cases:

   1. When neither is overridden, we want to hear complaints about
      excess (i.e., any) arguments, since their presence could
      indicate there's a bug.

   2. When defining an Immutable type, we are likely to override only
      __new__(), since __init__() is called too late to initialize an
      Immutable object.  Since __new__() defines the signature for the
      type, it would be a pain to have to override __init__() just to
      stop it from complaining about excess arguments.

   3. When defining a Mutable type, we are likely to override only
      __init__().  So here the converse reasoning applies: we don't
      want to have to override __new__() just to stop it from
      complaining.

   4. When __init__() is overridden, and the subclass __init__() calls
      object.__init__(), the latter should complain about excess
      arguments; ditto for __new__().

   Use cases 2 and 3 make it unattractive to unconditionally check for
   excess arguments.  The best solution that addresses all four use
   cases is as follows: __init__() complains about excess arguments
   unless __new__() is overridden and __init__() is not overridden
   (IOW, if __init__() is overridden or __new__() is not overridden);
   symmetrically, __new__() complains about excess arguments unless
   __init__() is overridden and __new__() is not overridden
   (IOW, if __new__() is overridden or __init__() is not overridden).

   However, for backwards compatibility, this breaks too much code.
   Therefore, in 2.6, we'll *warn* about excess arguments when both
   methods are overridden; for all other cases we'll use the above
   rules.

*/

/* Forward */
static TyObject *
object_new(TyTypeObject *type, TyObject *args, TyObject *kwds);

static int
excess_args(TyObject *args, TyObject *kwds)
{
    return TyTuple_GET_SIZE(args) ||
        (kwds && TyDict_Check(kwds) && TyDict_GET_SIZE(kwds));
}

static int
object_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyTypeObject *type = Ty_TYPE(self);
    if (excess_args(args, kwds)) {
        if (type->tp_init != object_init) {
            TyErr_SetString(TyExc_TypeError,
                            "object.__init__() takes exactly one argument (the instance to initialize)");
            return -1;
        }
        if (type->tp_new == object_new) {
            TyErr_Format(TyExc_TypeError,
                         "%.200s.__init__() takes exactly one argument (the instance to initialize)",
                         type->tp_name);
            return -1;
        }
    }
    return 0;
}

static TyObject *
object_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    if (excess_args(args, kwds)) {
        if (type->tp_new != object_new) {
            TyErr_SetString(TyExc_TypeError,
                            "object.__new__() takes exactly one argument (the type to instantiate)");
            return NULL;
        }
        if (type->tp_init == object_init) {
            TyErr_Format(TyExc_TypeError, "%.200s() takes no arguments",
                         type->tp_name);
            return NULL;
        }
    }

    if (type->tp_flags & Ty_TPFLAGS_IS_ABSTRACT) {
        TyObject *abstract_methods;
        TyObject *sorted_methods;
        TyObject *joined;
        TyObject* comma_w_quotes_sep;
        Ty_ssize_t method_count;

        /* Compute "', '".join(sorted(type.__abstractmethods__))
           into joined. */
        abstract_methods = type_abstractmethods((TyObject *)type, NULL);
        if (abstract_methods == NULL)
            return NULL;
        sorted_methods = PySequence_List(abstract_methods);
        Ty_DECREF(abstract_methods);
        if (sorted_methods == NULL)
            return NULL;
        if (TyList_Sort(sorted_methods)) {
            Ty_DECREF(sorted_methods);
            return NULL;
        }
        comma_w_quotes_sep = TyUnicode_FromString("', '");
        if (!comma_w_quotes_sep) {
            Ty_DECREF(sorted_methods);
            return NULL;
        }
        joined = TyUnicode_Join(comma_w_quotes_sep, sorted_methods);
        Ty_DECREF(comma_w_quotes_sep);
        if (joined == NULL)  {
            Ty_DECREF(sorted_methods);
            return NULL;
        }
        method_count = PyObject_Length(sorted_methods);
        Ty_DECREF(sorted_methods);
        if (method_count == -1) {
            Ty_DECREF(joined);
            return NULL;
        }

        TyErr_Format(TyExc_TypeError,
                     "Can't instantiate abstract class %s "
                     "without an implementation for abstract method%s '%U'",
                     type->tp_name,
                     method_count > 1 ? "s" : "",
                     joined);
        Ty_DECREF(joined);
        return NULL;
    }
    TyObject *obj = type->tp_alloc(type, 0);
    if (obj == NULL) {
        return NULL;
    }
    return obj;
}

static void
object_dealloc(TyObject *self)
{
    Ty_TYPE(self)->tp_free(self);
}

static TyObject *
object_repr(TyObject *self)
{
    TyTypeObject *type;
    TyObject *mod, *name, *rtn;

    type = Ty_TYPE(self);
    mod = type_module(type);
    if (mod == NULL)
        TyErr_Clear();
    else if (!TyUnicode_Check(mod)) {
        Ty_SETREF(mod, NULL);
    }
    name = type_qualname((TyObject *)type, NULL);
    if (name == NULL) {
        Ty_XDECREF(mod);
        return NULL;
    }
    if (mod != NULL && !_TyUnicode_Equal(mod, &_Ty_ID(builtins)))
        rtn = TyUnicode_FromFormat("<%U.%U object at %p>", mod, name, self);
    else
        rtn = TyUnicode_FromFormat("<%s object at %p>",
                                  type->tp_name, self);
    Ty_XDECREF(mod);
    Ty_DECREF(name);
    return rtn;
}

static TyObject *
object_str(TyObject *self)
{
    unaryfunc f;

    f = Ty_TYPE(self)->tp_repr;
    if (f == NULL)
        f = object_repr;
    return f(self);
}

static TyObject *
object_richcompare(TyObject *self, TyObject *other, int op)
{
    TyObject *res;

    switch (op) {

    case Py_EQ:
        /* Return NotImplemented instead of False, so if two
           objects are compared, both get a chance at the
           comparison.  See issue #1393. */
        res = Ty_NewRef((self == other) ? Ty_True : Ty_NotImplemented);
        break;

    case Py_NE:
        /* By default, __ne__() delegates to __eq__() and inverts the result,
           unless the latter returns NotImplemented. */
        if (Ty_TYPE(self)->tp_richcompare == NULL) {
            res = Ty_NewRef(Ty_NotImplemented);
            break;
        }
        res = (*Ty_TYPE(self)->tp_richcompare)(self, other, Py_EQ);
        if (res != NULL && res != Ty_NotImplemented) {
            int ok = PyObject_IsTrue(res);
            Ty_DECREF(res);
            if (ok < 0)
                res = NULL;
            else {
                if (ok)
                    res = Ty_NewRef(Ty_False);
                else
                    res = Ty_NewRef(Ty_True);
            }
        }
        break;

    default:
        res = Ty_NewRef(Ty_NotImplemented);
        break;
    }

    return res;
}

TyObject*
_Ty_BaseObject_RichCompare(TyObject* self, TyObject* other, int op)
{
    return object_richcompare(self, other, op);
}

static TyObject *
object_get_class(TyObject *self, void *closure)
{
    return Ty_NewRef(Ty_TYPE(self));
}

static int
compatible_with_tp_base(TyTypeObject *child)
{
    TyTypeObject *parent = child->tp_base;
    return (parent != NULL &&
            child->tp_basicsize == parent->tp_basicsize &&
            child->tp_itemsize == parent->tp_itemsize &&
            child->tp_dictoffset == parent->tp_dictoffset &&
            child->tp_weaklistoffset == parent->tp_weaklistoffset &&
            ((child->tp_flags & Ty_TPFLAGS_HAVE_GC) ==
             (parent->tp_flags & Ty_TPFLAGS_HAVE_GC)) &&
            (child->tp_dealloc == subtype_dealloc ||
             child->tp_dealloc == parent->tp_dealloc));
}

static int
same_slots_added(TyTypeObject *a, TyTypeObject *b)
{
    TyTypeObject *base = a->tp_base;
    Ty_ssize_t size;
    TyObject *slots_a, *slots_b;

    assert(base == b->tp_base);
    size = base->tp_basicsize;
    if (a->tp_dictoffset == size && b->tp_dictoffset == size)
        size += sizeof(TyObject *);
    if (a->tp_weaklistoffset == size && b->tp_weaklistoffset == size)
        size += sizeof(TyObject *);

    /* Check slots compliance */
    if (!(a->tp_flags & Ty_TPFLAGS_HEAPTYPE) ||
        !(b->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        return 0;
    }
    slots_a = ((PyHeapTypeObject *)a)->ht_slots;
    slots_b = ((PyHeapTypeObject *)b)->ht_slots;
    if (slots_a && slots_b) {
        if (PyObject_RichCompareBool(slots_a, slots_b, Py_EQ) != 1)
            return 0;
        size += sizeof(TyObject *) * TyTuple_GET_SIZE(slots_a);
    }
    return size == a->tp_basicsize && size == b->tp_basicsize;
}

static int
compatible_for_assignment(TyTypeObject* oldto, TyTypeObject* newto, const char* attr)
{
    TyTypeObject *newbase, *oldbase;

    if (newto->tp_free != oldto->tp_free) {
        TyErr_Format(TyExc_TypeError,
                     "%s assignment: "
                     "'%s' deallocator differs from '%s'",
                     attr,
                     newto->tp_name,
                     oldto->tp_name);
        return 0;
    }
    /*
     It's tricky to tell if two arbitrary types are sufficiently compatible as
     to be interchangeable; e.g., even if they have the same tp_basicsize, they
     might have totally different struct fields. It's much easier to tell if a
     type and its supertype are compatible; e.g., if they have the same
     tp_basicsize, then that means they have identical fields. So to check
     whether two arbitrary types are compatible, we first find the highest
     supertype that each is compatible with, and then if those supertypes are
     compatible then the original types must also be compatible.
    */
    newbase = newto;
    oldbase = oldto;
    while (compatible_with_tp_base(newbase))
        newbase = newbase->tp_base;
    while (compatible_with_tp_base(oldbase))
        oldbase = oldbase->tp_base;
    if (newbase != oldbase &&
        (newbase->tp_base != oldbase->tp_base ||
         !same_slots_added(newbase, oldbase))) {
        goto differs;
    }
    if ((oldto->tp_flags & Ty_TPFLAGS_INLINE_VALUES) !=
        ((newto->tp_flags & Ty_TPFLAGS_INLINE_VALUES)))
    {
        goto differs;
    }
    /* The above does not check for the preheader */
    if ((oldto->tp_flags & Ty_TPFLAGS_PREHEADER) ==
        ((newto->tp_flags & Ty_TPFLAGS_PREHEADER)))
    {
        return 1;
    }
differs:
    TyErr_Format(TyExc_TypeError,
                    "%s assignment: "
                    "'%s' object layout differs from '%s'",
                    attr,
                    newto->tp_name,
                    oldto->tp_name);
    return 0;
}



static int
object_set_class_world_stopped(TyObject *self, TyTypeObject *newto)
{
    TyTypeObject *oldto = Ty_TYPE(self);

    /* In versions of CPython prior to 3.5, the code in
       compatible_for_assignment was not set up to correctly check for memory
       layout / slot / etc. compatibility for non-HEAPTYPE classes, so we just
       disallowed __class__ assignment in any case that wasn't HEAPTYPE ->
       HEAPTYPE.

       During the 3.5 development cycle, we fixed the code in
       compatible_for_assignment to correctly check compatibility between
       arbitrary types, and started allowing __class__ assignment in all cases
       where the old and new types did in fact have compatible slots and
       memory layout (regardless of whether they were implemented as HEAPTYPEs
       or not).

       Just before 3.5 was released, though, we discovered that this led to
       problems with immutable types like int, where the interpreter assumes
       they are immutable and interns some values. Formerly this wasn't a
       problem, because they really were immutable -- in particular, all the
       types where the interpreter applied this interning trick happened to
       also be statically allocated, so the old HEAPTYPE rules were
       "accidentally" stopping them from allowing __class__ assignment. But
       with the changes to __class__ assignment, we started allowing code like

         class MyInt(int):
             ...
         # Modifies the type of *all* instances of 1 in the whole program,
         # including future instances (!), because the 1 object is interned.
         (1).__class__ = MyInt

       (see https://bugs.python.org/issue24912).

       In theory the proper fix would be to identify which classes rely on
       this invariant and somehow disallow __class__ assignment only for them,
       perhaps via some mechanism like a new Ty_TPFLAGS_IMMUTABLE flag (a
       "denylisting" approach). But in practice, since this problem wasn't
       noticed late in the 3.5 RC cycle, we're taking the conservative
       approach and reinstating the same HEAPTYPE->HEAPTYPE check that we used
       to have, plus an "allowlist". For now, the allowlist consists only of
       ModuleType subtypes, since those are the cases that motivated the patch
       in the first place -- see https://bugs.python.org/issue22986 -- and
       since module objects are mutable we can be sure that they are
       definitely not being interned. So now we allow HEAPTYPE->HEAPTYPE *or*
       ModuleType subtype -> ModuleType subtype.

       So far as we know, all the code beyond the following 'if' statement
       will correctly handle non-HEAPTYPE classes, and the HEAPTYPE check is
       needed only to protect that subset of non-HEAPTYPE classes for which
       the interpreter has baked in the assumption that all instances are
       truly immutable.
    */
    if (!(TyType_IsSubtype(newto, &TyModule_Type) &&
          TyType_IsSubtype(oldto, &TyModule_Type)) &&
        (_TyType_HasFeature(newto, Ty_TPFLAGS_IMMUTABLETYPE) ||
         _TyType_HasFeature(oldto, Ty_TPFLAGS_IMMUTABLETYPE))) {
        TyErr_Format(TyExc_TypeError,
                     "__class__ assignment only supported for mutable types "
                     "or ModuleType subclasses");
        return -1;
    }

    if (compatible_for_assignment(oldto, newto, "__class__")) {
        /* Changing the class will change the implicit dict keys,
         * so we must materialize the dictionary first. */
        if (oldto->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
            PyDictObject *dict = _TyObject_GetManagedDict(self);
            if (dict == NULL) {
                dict = _TyObject_MaterializeManagedDict_LockHeld(self);
                if (dict == NULL) {
                    return -1;
                }
            }

            assert(_TyObject_GetManagedDict(self) == dict);

            if (_TyDict_DetachFromObject(dict, self) < 0) {
                return -1;
            }

        }
        if (newto->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
            Ty_INCREF(newto);
        }

        Ty_SET_TYPE(self, newto);

        return 0;
    }
    else {
        return -1;
    }
}

static int
object_set_class(TyObject *self, TyObject *value, void *closure)
{

    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "can't delete __class__ attribute");
        return -1;
    }
    if (!TyType_Check(value)) {
        TyErr_Format(TyExc_TypeError,
          "__class__ must be set to a class, not '%s' object",
          Ty_TYPE(value)->tp_name);
        return -1;
    }
    TyTypeObject *newto = (TyTypeObject *)value;

    if (TySys_Audit("object.__setattr__", "OsO",
                    self, "__class__", value) < 0) {
        return -1;
    }

#ifdef Ty_GIL_DISABLED
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyEval_StopTheWorld(interp);
#endif
    TyTypeObject *oldto = Ty_TYPE(self);
    int res = object_set_class_world_stopped(self, newto);
#ifdef Ty_GIL_DISABLED
    _TyEval_StartTheWorld(interp);
#endif
    if (res == 0) {
        if (oldto->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
            Ty_DECREF(oldto);
        }

        RARE_EVENT_INC(set_class);
        return 0;
    }
    return res;
}

static TyGetSetDef object_getsets[] = {
    {"__class__", object_get_class, object_set_class,
     TyDoc_STR("the object's class")},
    {0}
};


/* Stuff to implement __reduce_ex__ for pickle protocols >= 2.
   We fall back to helpers in copyreg for:
   - pickle protocols < 2
   - calculating the list of slot names (done only once per class)
   - the __newobj__ function (which is used as a token but never called)
*/

static TyObject *
import_copyreg(void)
{
    /* Try to fetch cached copy of copyreg from sys.modules first in an
       attempt to avoid the import overhead. Previously this was implemented
       by storing a reference to the cached module in a static variable, but
       this broke when multiple embedded interpreters were in use (see issue
       #17408 and #19088). */
    TyObject *copyreg_module = TyImport_GetModule(&_Ty_ID(copyreg));
    if (copyreg_module != NULL) {
        return copyreg_module;
    }
    if (TyErr_Occurred()) {
        return NULL;
    }
    return TyImport_Import(&_Ty_ID(copyreg));
}

static TyObject *
_TyType_GetSlotNames(TyTypeObject *cls)
{
    TyObject *copyreg;
    TyObject *slotnames;

    assert(TyType_Check(cls));

    /* Get the slot names from the cache in the class if possible. */
    TyObject *dict = lookup_tp_dict(cls);
    if (TyDict_GetItemRef(dict, &_Ty_ID(__slotnames__), &slotnames) < 0) {
        return NULL;
    }
    if (slotnames != NULL) {
        if (slotnames != Ty_None && !TyList_Check(slotnames)) {
            TyErr_Format(TyExc_TypeError,
                         "%.200s.__slotnames__ should be a list or None, "
                         "not %.200s",
                         cls->tp_name, Ty_TYPE(slotnames)->tp_name);
            Ty_DECREF(slotnames);
            return NULL;
        }
        return slotnames;
    }

    /* The class does not have the slot names cached yet. */
    copyreg = import_copyreg();
    if (copyreg == NULL)
        return NULL;

    /* Use _slotnames function from the copyreg module to find the slots
       by this class and its bases. This function will cache the result
       in __slotnames__. */
    slotnames = PyObject_CallMethodOneArg(
            copyreg, &_Ty_ID(_slotnames), (TyObject *)cls);
    Ty_DECREF(copyreg);
    if (slotnames == NULL)
        return NULL;

    if (slotnames != Ty_None && !TyList_Check(slotnames)) {
        TyErr_SetString(TyExc_TypeError,
                        "copyreg._slotnames didn't return a list or None");
        Ty_DECREF(slotnames);
        return NULL;
    }

    return slotnames;
}

static TyObject *
object_getstate_default(TyObject *obj, int required)
{
    TyObject *state;
    TyObject *slotnames;

    if (required && Ty_TYPE(obj)->tp_itemsize) {
        TyErr_Format(TyExc_TypeError,
                     "cannot pickle %.200s objects",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }

    if (_TyObject_IsInstanceDictEmpty(obj)) {
        state = Ty_NewRef(Ty_None);
    }
    else {
        state = PyObject_GenericGetDict(obj, NULL);
        if (state == NULL) {
            return NULL;
        }
    }

    slotnames = _TyType_GetSlotNames(Ty_TYPE(obj));
    if (slotnames == NULL) {
        Ty_DECREF(state);
        return NULL;
    }

    assert(slotnames == Ty_None || TyList_Check(slotnames));
    if (required) {
        Ty_ssize_t basicsize = PyBaseObject_Type.tp_basicsize;
        if (Ty_TYPE(obj)->tp_dictoffset &&
            (Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0)
        {
            basicsize += sizeof(TyObject *);
        }
        if (Ty_TYPE(obj)->tp_weaklistoffset > 0) {
            basicsize += sizeof(TyObject *);
        }
        if (slotnames != Ty_None) {
            basicsize += sizeof(TyObject *) * TyList_GET_SIZE(slotnames);
        }
        if (Ty_TYPE(obj)->tp_basicsize > basicsize) {
            Ty_DECREF(slotnames);
            Ty_DECREF(state);
            TyErr_Format(TyExc_TypeError,
                         "cannot pickle '%.200s' object",
                         Ty_TYPE(obj)->tp_name);
            return NULL;
        }
    }

    if (slotnames != Ty_None && TyList_GET_SIZE(slotnames) > 0) {
        TyObject *slots;
        Ty_ssize_t slotnames_size, i;

        slots = TyDict_New();
        if (slots == NULL) {
            Ty_DECREF(slotnames);
            Ty_DECREF(state);
            return NULL;
        }

        slotnames_size = TyList_GET_SIZE(slotnames);
        for (i = 0; i < slotnames_size; i++) {
            TyObject *name, *value;

            name = Ty_NewRef(TyList_GET_ITEM(slotnames, i));
            if (PyObject_GetOptionalAttr(obj, name, &value) < 0) {
                Ty_DECREF(name);
                goto error;
            }
            if (value == NULL) {
                Ty_DECREF(name);
                /* It is not an error if the attribute is not present. */
            }
            else {
                int err = TyDict_SetItem(slots, name, value);
                Ty_DECREF(name);
                Ty_DECREF(value);
                if (err) {
                    goto error;
                }
            }

            /* The list is stored on the class so it may mutate while we
               iterate over it */
            if (slotnames_size != TyList_GET_SIZE(slotnames)) {
                TyErr_Format(TyExc_RuntimeError,
                             "__slotnames__ changed size during iteration");
                goto error;
            }

            /* We handle errors within the loop here. */
            if (0) {
              error:
                Ty_DECREF(slotnames);
                Ty_DECREF(slots);
                Ty_DECREF(state);
                return NULL;
            }
        }

        /* If we found some slot attributes, pack them in a tuple along
           the original attribute dictionary. */
        if (TyDict_GET_SIZE(slots) > 0) {
            TyObject *state2;

            state2 = TyTuple_Pack(2, state, slots);
            Ty_DECREF(state);
            if (state2 == NULL) {
                Ty_DECREF(slotnames);
                Ty_DECREF(slots);
                return NULL;
            }
            state = state2;
        }
        Ty_DECREF(slots);
    }
    Ty_DECREF(slotnames);

    return state;
}

static TyObject *
object_getstate(TyObject *obj, int required)
{
    TyObject *getstate, *state;

    getstate = PyObject_GetAttr(obj, &_Ty_ID(__getstate__));
    if (getstate == NULL) {
        return NULL;
    }
    if (PyCFunction_Check(getstate) &&
        PyCFunction_GET_SELF(getstate) == obj &&
        PyCFunction_GET_FUNCTION(getstate) == object___getstate__)
    {
        /* If __getstate__ is not overridden pass the required argument. */
        state = object_getstate_default(obj, required);
    }
    else {
        state = _TyObject_CallNoArgs(getstate);
    }
    Ty_DECREF(getstate);
    return state;
}

TyObject *
_TyObject_GetState(TyObject *obj)
{
    return object_getstate(obj, 0);
}

/*[clinic input]
object.__getstate__

Helper for pickle.
[clinic start generated code]*/

static TyObject *
object___getstate___impl(TyObject *self)
/*[clinic end generated code: output=5a2500dcb6217e9e input=692314d8fbe194ee]*/
{
    return object_getstate_default(self, 0);
}

static int
_TyObject_GetNewArguments(TyObject *obj, TyObject **args, TyObject **kwargs)
{
    TyObject *getnewargs, *getnewargs_ex;

    if (args == NULL || kwargs == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }

    /* We first attempt to fetch the arguments for __new__ by calling
       __getnewargs_ex__ on the object. */
    getnewargs_ex = _TyObject_LookupSpecial(obj, &_Ty_ID(__getnewargs_ex__));
    if (getnewargs_ex != NULL) {
        TyObject *newargs = _TyObject_CallNoArgs(getnewargs_ex);
        Ty_DECREF(getnewargs_ex);
        if (newargs == NULL) {
            return -1;
        }
        if (!TyTuple_Check(newargs)) {
            TyErr_Format(TyExc_TypeError,
                         "__getnewargs_ex__ should return a tuple, "
                         "not '%.200s'", Ty_TYPE(newargs)->tp_name);
            Ty_DECREF(newargs);
            return -1;
        }
        if (TyTuple_GET_SIZE(newargs) != 2) {
            TyErr_Format(TyExc_ValueError,
                         "__getnewargs_ex__ should return a tuple of "
                         "length 2, not %zd", TyTuple_GET_SIZE(newargs));
            Ty_DECREF(newargs);
            return -1;
        }
        *args = Ty_NewRef(TyTuple_GET_ITEM(newargs, 0));
        *kwargs = Ty_NewRef(TyTuple_GET_ITEM(newargs, 1));
        Ty_DECREF(newargs);

        /* XXX We should perhaps allow None to be passed here. */
        if (!TyTuple_Check(*args)) {
            TyErr_Format(TyExc_TypeError,
                         "first item of the tuple returned by "
                         "__getnewargs_ex__ must be a tuple, not '%.200s'",
                         Ty_TYPE(*args)->tp_name);
            Ty_CLEAR(*args);
            Ty_CLEAR(*kwargs);
            return -1;
        }
        if (!TyDict_Check(*kwargs)) {
            TyErr_Format(TyExc_TypeError,
                         "second item of the tuple returned by "
                         "__getnewargs_ex__ must be a dict, not '%.200s'",
                         Ty_TYPE(*kwargs)->tp_name);
            Ty_CLEAR(*args);
            Ty_CLEAR(*kwargs);
            return -1;
        }
        return 0;
    } else if (TyErr_Occurred()) {
        return -1;
    }

    /* The object does not have __getnewargs_ex__ so we fallback on using
       __getnewargs__ instead. */
    getnewargs = _TyObject_LookupSpecial(obj, &_Ty_ID(__getnewargs__));
    if (getnewargs != NULL) {
        *args = _TyObject_CallNoArgs(getnewargs);
        Ty_DECREF(getnewargs);
        if (*args == NULL) {
            return -1;
        }
        if (!TyTuple_Check(*args)) {
            TyErr_Format(TyExc_TypeError,
                         "__getnewargs__ should return a tuple, "
                         "not '%.200s'", Ty_TYPE(*args)->tp_name);
            Ty_CLEAR(*args);
            return -1;
        }
        *kwargs = NULL;
        return 0;
    } else if (TyErr_Occurred()) {
        return -1;
    }

    /* The object does not have __getnewargs_ex__ and __getnewargs__. This may
       mean __new__ does not takes any arguments on this object, or that the
       object does not implement the reduce protocol for pickling or
       copying. */
    *args = NULL;
    *kwargs = NULL;
    return 0;
}

static int
_TyObject_GetItemsIter(TyObject *obj, TyObject **listitems,
                       TyObject **dictitems)
{
    if (listitems == NULL || dictitems == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }

    if (!TyList_Check(obj)) {
        *listitems = Ty_NewRef(Ty_None);
    }
    else {
        *listitems = PyObject_GetIter(obj);
        if (*listitems == NULL)
            return -1;
    }

    if (!TyDict_Check(obj)) {
        *dictitems = Ty_NewRef(Ty_None);
    }
    else {
        TyObject *items = PyObject_CallMethodNoArgs(obj, &_Ty_ID(items));
        if (items == NULL) {
            Ty_CLEAR(*listitems);
            return -1;
        }
        *dictitems = PyObject_GetIter(items);
        Ty_DECREF(items);
        if (*dictitems == NULL) {
            Ty_CLEAR(*listitems);
            return -1;
        }
    }

    assert(*listitems != NULL && *dictitems != NULL);

    return 0;
}

static TyObject *
reduce_newobj(TyObject *obj)
{
    TyObject *args = NULL, *kwargs = NULL;
    TyObject *copyreg;
    TyObject *newobj, *newargs, *state, *listitems, *dictitems;
    TyObject *result;
    int hasargs;

    if (Ty_TYPE(obj)->tp_new == NULL) {
        TyErr_Format(TyExc_TypeError,
                     "cannot pickle '%.200s' object",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }
    if (_TyObject_GetNewArguments(obj, &args, &kwargs) < 0)
        return NULL;

    copyreg = import_copyreg();
    if (copyreg == NULL) {
        Ty_XDECREF(args);
        Ty_XDECREF(kwargs);
        return NULL;
    }
    hasargs = (args != NULL);
    if (kwargs == NULL || TyDict_GET_SIZE(kwargs) == 0) {
        TyObject *cls;
        Ty_ssize_t i, n;

        Ty_XDECREF(kwargs);
        newobj = PyObject_GetAttr(copyreg, &_Ty_ID(__newobj__));
        Ty_DECREF(copyreg);
        if (newobj == NULL) {
            Ty_XDECREF(args);
            return NULL;
        }
        n = args ? TyTuple_GET_SIZE(args) : 0;
        newargs = TyTuple_New(n+1);
        if (newargs == NULL) {
            Ty_XDECREF(args);
            Ty_DECREF(newobj);
            return NULL;
        }
        cls = (TyObject *) Ty_TYPE(obj);
        TyTuple_SET_ITEM(newargs, 0, Ty_NewRef(cls));
        for (i = 0; i < n; i++) {
            TyObject *v = TyTuple_GET_ITEM(args, i);
            TyTuple_SET_ITEM(newargs, i+1, Ty_NewRef(v));
        }
        Ty_XDECREF(args);
    }
    else if (args != NULL) {
        newobj = PyObject_GetAttr(copyreg, &_Ty_ID(__newobj_ex__));
        Ty_DECREF(copyreg);
        if (newobj == NULL) {
            Ty_DECREF(args);
            Ty_DECREF(kwargs);
            return NULL;
        }
        newargs = TyTuple_Pack(3, Ty_TYPE(obj), args, kwargs);
        Ty_DECREF(args);
        Ty_DECREF(kwargs);
        if (newargs == NULL) {
            Ty_DECREF(newobj);
            return NULL;
        }
    }
    else {
        /* args == NULL */
        Ty_DECREF(copyreg);
        Ty_DECREF(kwargs);
        TyErr_BadInternalCall();
        return NULL;
    }

    state = object_getstate(obj, !(hasargs || TyList_Check(obj) || TyDict_Check(obj)));
    if (state == NULL) {
        Ty_DECREF(newobj);
        Ty_DECREF(newargs);
        return NULL;
    }
    if (_TyObject_GetItemsIter(obj, &listitems, &dictitems) < 0) {
        Ty_DECREF(newobj);
        Ty_DECREF(newargs);
        Ty_DECREF(state);
        return NULL;
    }

    result = TyTuple_Pack(5, newobj, newargs, state, listitems, dictitems);
    Ty_DECREF(newobj);
    Ty_DECREF(newargs);
    Ty_DECREF(state);
    Ty_DECREF(listitems);
    Ty_DECREF(dictitems);
    return result;
}

/*
 * There were two problems when object.__reduce__ and object.__reduce_ex__
 * were implemented in the same function:
 *  - trying to pickle an object with a custom __reduce__ method that
 *    fell back to object.__reduce__ in certain circumstances led to
 *    infinite recursion at Python level and eventual RecursionError.
 *  - Pickling objects that lied about their type by overwriting the
 *    __class__ descriptor could lead to infinite recursion at C level
 *    and eventual segfault.
 *
 * Because of backwards compatibility, the two methods still have to
 * behave in the same way, even if this is not required by the pickle
 * protocol. This common functionality was moved to the _common_reduce
 * function.
 */
static TyObject *
_common_reduce(TyObject *self, int proto)
{
    TyObject *copyreg, *res;

    if (proto >= 2)
        return reduce_newobj(self);

    copyreg = import_copyreg();
    if (!copyreg)
        return NULL;

    res = PyObject_CallMethod(copyreg, "_reduce_ex", "Oi", self, proto);
    Ty_DECREF(copyreg);

    return res;
}

/*[clinic input]
object.__reduce__

Helper for pickle.
[clinic start generated code]*/

static TyObject *
object___reduce___impl(TyObject *self)
/*[clinic end generated code: output=d4ca691f891c6e2f input=11562e663947e18b]*/
{
    return _common_reduce(self, 0);
}

/*[clinic input]
object.__reduce_ex__

  protocol: int
  /

Helper for pickle.
[clinic start generated code]*/

static TyObject *
object___reduce_ex___impl(TyObject *self, int protocol)
/*[clinic end generated code: output=2e157766f6b50094 input=f326b43fb8a4c5ff]*/
{
    TyObject *reduce;
    if (PyObject_GetOptionalAttr(self, &_Ty_ID(__reduce__), &reduce) < 0) {
        return NULL;
    }
    if (reduce != NULL) {
        TyObject *cls, *clsreduce;
        int override;

        cls = (TyObject *) Ty_TYPE(self);
        clsreduce = PyObject_GetAttr(cls, &_Ty_ID(__reduce__));
        if (clsreduce == NULL) {
            Ty_DECREF(reduce);
            return NULL;
        }

        TyInterpreterState *interp = _TyInterpreterState_GET();
        override = (clsreduce != _Ty_INTERP_CACHED_OBJECT(interp, objreduce));
        Ty_DECREF(clsreduce);
        if (override) {
            TyObject *res = _TyObject_CallNoArgs(reduce);
            Ty_DECREF(reduce);
            return res;
        }
        else
            Ty_DECREF(reduce);
    }

    return _common_reduce(self, protocol);
}

static TyObject *
object_subclasshook(TyObject *cls, TyObject *args)
{
    Py_RETURN_NOTIMPLEMENTED;
}

TyDoc_STRVAR(object_subclasshook_doc,
"Abstract classes can override this to customize issubclass().\n"
"\n"
"This is invoked early on by abc.ABCMeta.__subclasscheck__().\n"
"It should return True, False or NotImplemented.  If it returns\n"
"NotImplemented, the normal algorithm is used.  Otherwise, it\n"
"overrides the normal algorithm (and the outcome is cached).\n");

static TyObject *
object_init_subclass(TyObject *cls, TyObject *arg)
{
    Py_RETURN_NONE;
}

TyDoc_STRVAR(object_init_subclass_doc,
"This method is called when a class is subclassed.\n"
"\n"
"The default implementation does nothing. It may be\n"
"overridden to extend subclasses.\n");

/*[clinic input]
object.__format__

  format_spec: unicode
  /

Default object formatter.

Return str(self) if format_spec is empty. Raise TypeError otherwise.
[clinic start generated code]*/

static TyObject *
object___format___impl(TyObject *self, TyObject *format_spec)
/*[clinic end generated code: output=34897efb543a974b input=b94d8feb006689ea]*/
{
    /* Issue 7994: If we're converting to a string, we
       should reject format specifications */
    if (TyUnicode_GET_LENGTH(format_spec) > 0) {
        TyErr_Format(TyExc_TypeError,
                     "unsupported format string passed to %.200s.__format__",
                     Ty_TYPE(self)->tp_name);
        return NULL;
    }
    return PyObject_Str(self);
}

/*[clinic input]
object.__sizeof__

Size of object in memory, in bytes.
[clinic start generated code]*/

static TyObject *
object___sizeof___impl(TyObject *self)
/*[clinic end generated code: output=73edab332f97d550 input=1200ff3dfe485306]*/
{
    Ty_ssize_t res, isize;

    res = 0;
    isize = Ty_TYPE(self)->tp_itemsize;
    if (isize > 0) {
        /* This assumes that ob_size is valid if tp_itemsize is not 0,
         which isn't true for PyLongObject. */
        res = _PyVarObject_CAST(self)->ob_size * isize;
    }
    res += Ty_TYPE(self)->tp_basicsize;

    return TyLong_FromSsize_t(res);
}

/* __dir__ for generic objects: returns __dict__, __class__,
   and recursively up the __class__.__bases__ chain.
*/
/*[clinic input]
object.__dir__

Default dir() implementation.
[clinic start generated code]*/

static TyObject *
object___dir___impl(TyObject *self)
/*[clinic end generated code: output=66dd48ea62f26c90 input=0a89305bec669b10]*/
{
    TyObject *result = NULL;
    TyObject *dict = NULL;
    TyObject *itsclass = NULL;

    /* Get __dict__ (which may or may not be a real dict...) */
    if (PyObject_GetOptionalAttr(self, &_Ty_ID(__dict__), &dict) < 0) {
        return NULL;
    }
    if (dict == NULL) {
        dict = TyDict_New();
    }
    else if (!TyDict_Check(dict)) {
        Ty_DECREF(dict);
        dict = TyDict_New();
    }
    else {
        /* Copy __dict__ to avoid mutating it. */
        TyObject *temp = TyDict_Copy(dict);
        Ty_SETREF(dict, temp);
    }

    if (dict == NULL)
        goto error;

    /* Merge in attrs reachable from its class. */
    if (PyObject_GetOptionalAttr(self, &_Ty_ID(__class__), &itsclass) < 0) {
        goto error;
    }
    /* XXX(tomer): Perhaps fall back to Ty_TYPE(obj) if no
                   __class__ exists? */
    if (itsclass != NULL && merge_class_dict(dict, itsclass) < 0)
        goto error;

    result = TyDict_Keys(dict);
    /* fall through */
error:
    Ty_XDECREF(itsclass);
    Ty_XDECREF(dict);
    return result;
}

static TyMethodDef object_methods[] = {
    OBJECT___REDUCE_EX___METHODDEF
    OBJECT___REDUCE___METHODDEF
    OBJECT___GETSTATE___METHODDEF
    {"__subclasshook__", object_subclasshook, METH_CLASS | METH_O,
     object_subclasshook_doc},
    {"__init_subclass__", object_init_subclass, METH_CLASS | METH_NOARGS,
     object_init_subclass_doc},
    OBJECT___FORMAT___METHODDEF
    OBJECT___SIZEOF___METHODDEF
    OBJECT___DIR___METHODDEF
    {0}
};

TyDoc_STRVAR(object_doc,
"object()\n--\n\n"
"The base class of the class hierarchy.\n\n"
"When called, it accepts no arguments and returns a new featureless\n"
"instance that has no instance attributes and cannot be given any.\n");

TyTypeObject PyBaseObject_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "object",                                   /* tp_name */
    sizeof(TyObject),                           /* tp_basicsize */
    0,                                          /* tp_itemsize */
    object_dealloc,                             /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    object_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    PyObject_GenericHash,                       /* tp_hash */
    0,                                          /* tp_call */
    object_str,                                 /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    PyObject_GenericSetAttr,                    /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,   /* tp_flags */
    object_doc,                                 /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    object_richcompare,                         /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    object_methods,                             /* tp_methods */
    0,                                          /* tp_members */
    object_getsets,                             /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    object_init,                                /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    object_new,                                 /* tp_new */
    PyObject_Free,                              /* tp_free */
};


static int
type_add_method(TyTypeObject *type, TyMethodDef *meth)
{
    TyObject *descr;
    int isdescr = 1;
    if (meth->ml_flags & METH_CLASS) {
        if (meth->ml_flags & METH_STATIC) {
            TyErr_SetString(TyExc_ValueError,
                    "method cannot be both class and static");
            return -1;
        }
        descr = PyDescr_NewClassMethod(type, meth);
    }
    else if (meth->ml_flags & METH_STATIC) {
        TyObject *cfunc = PyCFunction_NewEx(meth, (TyObject*)type, NULL);
        if (cfunc == NULL) {
            return -1;
        }
        descr = TyStaticMethod_New(cfunc);
        isdescr = 0;  // PyStaticMethod is not PyDescrObject
        Ty_DECREF(cfunc);
    }
    else {
        descr = PyDescr_NewMethod(type, meth);
    }
    if (descr == NULL) {
        return -1;
    }

    TyObject *name;
    if (isdescr) {
        name = PyDescr_NAME(descr);
    }
    else {
        name = TyUnicode_FromString(meth->ml_name);
        if (name == NULL) {
            Ty_DECREF(descr);
            return -1;
        }
    }

    int err;
    TyObject *dict = lookup_tp_dict(type);
    if (!(meth->ml_flags & METH_COEXIST)) {
        err = TyDict_SetDefaultRef(dict, name, descr, NULL) < 0;
    }
    else {
        err = TyDict_SetItem(dict, name, descr) < 0;
    }
    if (!isdescr) {
        Ty_DECREF(name);
    }
    Ty_DECREF(descr);
    if (err) {
        return -1;
    }
    return 0;
}

int
_TyType_AddMethod(TyTypeObject *type, TyMethodDef *meth)
{
    return type_add_method(type, meth);
}


/* Add the methods from tp_methods to the __dict__ in a type object */
static int
type_add_methods(TyTypeObject *type)
{
    TyMethodDef *meth = type->tp_methods;
    if (meth == NULL) {
        return 0;
    }

    for (; meth->ml_name != NULL; meth++) {
        if (type_add_method(type, meth) < 0) {
            return -1;
        }
    }
    return 0;
}


static int
type_add_members(TyTypeObject *type)
{
    TyMemberDef *memb = type->tp_members;
    if (memb == NULL) {
        return 0;
    }

    TyObject *dict = lookup_tp_dict(type);
    for (; memb->name != NULL; memb++) {
        TyObject *descr = PyDescr_NewMember(type, memb);
        if (descr == NULL)
            return -1;

        if (TyDict_SetDefaultRef(dict, PyDescr_NAME(descr), descr, NULL) < 0) {
            Ty_DECREF(descr);
            return -1;
        }
        Ty_DECREF(descr);
    }
    return 0;
}


static int
type_add_getset(TyTypeObject *type)
{
    TyGetSetDef *gsp = type->tp_getset;
    if (gsp == NULL) {
        return 0;
    }

    TyObject *dict = lookup_tp_dict(type);
    for (; gsp->name != NULL; gsp++) {
        TyObject *descr = PyDescr_NewGetSet(type, gsp);
        if (descr == NULL) {
            return -1;
        }

        if (TyDict_SetDefaultRef(dict, PyDescr_NAME(descr), descr, NULL) < 0) {
            Ty_DECREF(descr);
            return -1;
        }
        Ty_DECREF(descr);
    }
    return 0;
}


static void
inherit_special(TyTypeObject *type, TyTypeObject *base)
{
    /* Copying tp_traverse and tp_clear is connected to the GC flags */
    if (!(type->tp_flags & Ty_TPFLAGS_HAVE_GC) &&
        (base->tp_flags & Ty_TPFLAGS_HAVE_GC) &&
        (!type->tp_traverse && !type->tp_clear)) {
        type_add_flags(type, Ty_TPFLAGS_HAVE_GC);
        if (type->tp_traverse == NULL)
            type->tp_traverse = base->tp_traverse;
        if (type->tp_clear == NULL)
            type->tp_clear = base->tp_clear;
    }
    type_add_flags(type, base->tp_flags & Ty_TPFLAGS_PREHEADER);

    if (type->tp_basicsize == 0)
        type->tp_basicsize = base->tp_basicsize;

    /* Copy other non-function slots */

#define COPYVAL(SLOT) \
    if (type->SLOT == 0) { type->SLOT = base->SLOT; }

    COPYVAL(tp_itemsize);
    COPYVAL(tp_weaklistoffset);
    COPYVAL(tp_dictoffset);

#undef COPYVAL

    /* Setup fast subclass flags */
    TyObject *mro = lookup_tp_mro(base);
    unsigned long flags = 0;
    if (is_subtype_with_mro(mro, base, (TyTypeObject*)TyExc_BaseException)) {
        flags |= Ty_TPFLAGS_BASE_EXC_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyType_Type)) {
        flags |= Ty_TPFLAGS_TYPE_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyLong_Type)) {
        flags |= Ty_TPFLAGS_LONG_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyBytes_Type)) {
        flags |= Ty_TPFLAGS_BYTES_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyUnicode_Type)) {
        flags |= Ty_TPFLAGS_UNICODE_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyTuple_Type)) {
        flags |= Ty_TPFLAGS_TUPLE_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyList_Type)) {
        flags |= Ty_TPFLAGS_LIST_SUBCLASS;
    }
    else if (is_subtype_with_mro(mro, base, &TyDict_Type)) {
        flags |= Ty_TPFLAGS_DICT_SUBCLASS;
    }

    /* Setup some inheritable flags */
    if (TyType_HasFeature(base, _Ty_TPFLAGS_MATCH_SELF)) {
        flags |= _Ty_TPFLAGS_MATCH_SELF;
    }
    if (TyType_HasFeature(base, Ty_TPFLAGS_ITEMS_AT_END)) {
        flags |= Ty_TPFLAGS_ITEMS_AT_END;
    }
    type_add_flags(type, flags);
}

static int
overrides_hash(TyTypeObject *type)
{
    TyObject *dict = lookup_tp_dict(type);

    assert(dict != NULL);
    int r = TyDict_Contains(dict, &_Ty_ID(__eq__));
    if (r == 0) {
        r = TyDict_Contains(dict, &_Ty_ID(__hash__));
    }
    return r;
}

static int
inherit_slots(TyTypeObject *type, TyTypeObject *base)
{
    TyTypeObject *basebase;

#undef SLOTDEFINED
#undef COPYSLOT
#undef COPYNUM
#undef COPYSEQ
#undef COPYMAP
#undef COPYBUF

#define SLOTDEFINED(SLOT) \
    (base->SLOT != 0 && \
     (basebase == NULL || base->SLOT != basebase->SLOT))

#define COPYSLOT(SLOT) \
    if (!type->SLOT && SLOTDEFINED(SLOT)) type->SLOT = base->SLOT

#define COPYASYNC(SLOT) COPYSLOT(tp_as_async->SLOT)
#define COPYNUM(SLOT) COPYSLOT(tp_as_number->SLOT)
#define COPYSEQ(SLOT) COPYSLOT(tp_as_sequence->SLOT)
#define COPYMAP(SLOT) COPYSLOT(tp_as_mapping->SLOT)
#define COPYBUF(SLOT) COPYSLOT(tp_as_buffer->SLOT)

    /* This won't inherit indirect slots (from tp_as_number etc.)
       if type doesn't provide the space. */

    if (type->tp_as_number != NULL && base->tp_as_number != NULL) {
        basebase = base->tp_base;
        if (basebase->tp_as_number == NULL)
            basebase = NULL;
        COPYNUM(nb_add);
        COPYNUM(nb_subtract);
        COPYNUM(nb_multiply);
        COPYNUM(nb_remainder);
        COPYNUM(nb_divmod);
        COPYNUM(nb_power);
        COPYNUM(nb_negative);
        COPYNUM(nb_positive);
        COPYNUM(nb_absolute);
        COPYNUM(nb_bool);
        COPYNUM(nb_invert);
        COPYNUM(nb_lshift);
        COPYNUM(nb_rshift);
        COPYNUM(nb_and);
        COPYNUM(nb_xor);
        COPYNUM(nb_or);
        COPYNUM(nb_int);
        COPYNUM(nb_float);
        COPYNUM(nb_inplace_add);
        COPYNUM(nb_inplace_subtract);
        COPYNUM(nb_inplace_multiply);
        COPYNUM(nb_inplace_remainder);
        COPYNUM(nb_inplace_power);
        COPYNUM(nb_inplace_lshift);
        COPYNUM(nb_inplace_rshift);
        COPYNUM(nb_inplace_and);
        COPYNUM(nb_inplace_xor);
        COPYNUM(nb_inplace_or);
        COPYNUM(nb_true_divide);
        COPYNUM(nb_floor_divide);
        COPYNUM(nb_inplace_true_divide);
        COPYNUM(nb_inplace_floor_divide);
        COPYNUM(nb_index);
        COPYNUM(nb_matrix_multiply);
        COPYNUM(nb_inplace_matrix_multiply);
    }

    if (type->tp_as_async != NULL && base->tp_as_async != NULL) {
        basebase = base->tp_base;
        if (basebase->tp_as_async == NULL)
            basebase = NULL;
        COPYASYNC(am_await);
        COPYASYNC(am_aiter);
        COPYASYNC(am_anext);
    }

    if (type->tp_as_sequence != NULL && base->tp_as_sequence != NULL) {
        basebase = base->tp_base;
        if (basebase->tp_as_sequence == NULL)
            basebase = NULL;
        COPYSEQ(sq_length);
        COPYSEQ(sq_concat);
        COPYSEQ(sq_repeat);
        COPYSEQ(sq_item);
        COPYSEQ(sq_ass_item);
        COPYSEQ(sq_contains);
        COPYSEQ(sq_inplace_concat);
        COPYSEQ(sq_inplace_repeat);
    }

    if (type->tp_as_mapping != NULL && base->tp_as_mapping != NULL) {
        basebase = base->tp_base;
        if (basebase->tp_as_mapping == NULL)
            basebase = NULL;
        COPYMAP(mp_length);
        COPYMAP(mp_subscript);
        COPYMAP(mp_ass_subscript);
    }

    if (type->tp_as_buffer != NULL && base->tp_as_buffer != NULL) {
        basebase = base->tp_base;
        if (basebase->tp_as_buffer == NULL)
            basebase = NULL;
        COPYBUF(bf_getbuffer);
        COPYBUF(bf_releasebuffer);
    }

    basebase = base->tp_base;

    COPYSLOT(tp_dealloc);
    if (type->tp_getattr == NULL && type->tp_getattro == NULL) {
        type->tp_getattr = base->tp_getattr;
        type->tp_getattro = base->tp_getattro;
    }
    if (type->tp_setattr == NULL && type->tp_setattro == NULL) {
        type->tp_setattr = base->tp_setattr;
        type->tp_setattro = base->tp_setattro;
    }
    COPYSLOT(tp_repr);
    /* tp_hash see tp_richcompare */
    {
        /* Always inherit tp_vectorcall_offset to support PyVectorcall_Call().
         * If Ty_TPFLAGS_HAVE_VECTORCALL is not inherited, then vectorcall
         * won't be used automatically. */
        COPYSLOT(tp_vectorcall_offset);

        /* Inherit Ty_TPFLAGS_HAVE_VECTORCALL if tp_call is not overridden */
        if (!type->tp_call &&
            _TyType_HasFeature(base, Ty_TPFLAGS_HAVE_VECTORCALL))
        {
            type_add_flags(type, Ty_TPFLAGS_HAVE_VECTORCALL);
        }
        COPYSLOT(tp_call);
    }
    COPYSLOT(tp_str);
    {
        /* Copy comparison-related slots only when
           not overriding them anywhere */
        if (type->tp_richcompare == NULL &&
            type->tp_hash == NULL)
        {
            int r = overrides_hash(type);
            if (r < 0) {
                return -1;
            }
            if (!r) {
                type->tp_richcompare = base->tp_richcompare;
                type->tp_hash = base->tp_hash;
            }
        }
    }
    {
        COPYSLOT(tp_iter);
        COPYSLOT(tp_iternext);
    }
    {
        COPYSLOT(tp_descr_get);
        /* Inherit Ty_TPFLAGS_METHOD_DESCRIPTOR if tp_descr_get was inherited,
         * but only for extension types */
        if (base->tp_descr_get &&
            type->tp_descr_get == base->tp_descr_get &&
            _TyType_HasFeature(type, Ty_TPFLAGS_IMMUTABLETYPE) &&
            _TyType_HasFeature(base, Ty_TPFLAGS_METHOD_DESCRIPTOR))
        {
            type_add_flags(type, Ty_TPFLAGS_METHOD_DESCRIPTOR);
        }
        COPYSLOT(tp_descr_set);
        COPYSLOT(tp_dictoffset);
        COPYSLOT(tp_init);
        COPYSLOT(tp_alloc);
        COPYSLOT(tp_is_gc);
        COPYSLOT(tp_finalize);
        if ((type->tp_flags & Ty_TPFLAGS_HAVE_GC) ==
            (base->tp_flags & Ty_TPFLAGS_HAVE_GC)) {
            /* They agree about gc. */
            COPYSLOT(tp_free);
        }
        else if ((type->tp_flags & Ty_TPFLAGS_HAVE_GC) &&
                 type->tp_free == NULL &&
                 base->tp_free == PyObject_Free) {
            /* A bit of magic to plug in the correct default
             * tp_free function when a derived class adds gc,
             * didn't define tp_free, and the base uses the
             * default non-gc tp_free.
             */
            type->tp_free = PyObject_GC_Del;
        }
        /* else they didn't agree about gc, and there isn't something
         * obvious to be done -- the type is on its own.
         */
    }
    return 0;
}

static int add_operators(TyTypeObject *type);
static int add_tp_new_wrapper(TyTypeObject *type);

#define COLLECTION_FLAGS (Ty_TPFLAGS_SEQUENCE | Ty_TPFLAGS_MAPPING)

static int
type_ready_pre_checks(TyTypeObject *type)
{
    /* Consistency checks for PEP 590:
     * - Ty_TPFLAGS_METHOD_DESCRIPTOR requires tp_descr_get
     * - Ty_TPFLAGS_HAVE_VECTORCALL requires tp_call and
     *   tp_vectorcall_offset > 0
     * To avoid mistakes, we require this before inheriting.
     */
    if (type->tp_flags & Ty_TPFLAGS_METHOD_DESCRIPTOR) {
        _TyObject_ASSERT((TyObject *)type, type->tp_descr_get != NULL);
    }
    if (type->tp_flags & Ty_TPFLAGS_HAVE_VECTORCALL) {
        _TyObject_ASSERT((TyObject *)type, type->tp_vectorcall_offset > 0);
        _TyObject_ASSERT((TyObject *)type, type->tp_call != NULL);
    }

    /* Consistency checks for pattern matching
     * Ty_TPFLAGS_SEQUENCE and Ty_TPFLAGS_MAPPING are mutually exclusive */
    _TyObject_ASSERT((TyObject *)type, (type->tp_flags & COLLECTION_FLAGS) != COLLECTION_FLAGS);

    if (type->tp_name == NULL) {
        TyErr_Format(TyExc_SystemError,
                     "Type does not define the tp_name field.");
        return -1;
    }
    return 0;
}


static int
type_ready_set_base(TyTypeObject *type)
{
    /* Initialize tp_base (defaults to BaseObject unless that's us) */
    TyTypeObject *base = type->tp_base;
    if (base == NULL && type != &PyBaseObject_Type) {
        base = &PyBaseObject_Type;
        if (type->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
            type->tp_base = (TyTypeObject*)Ty_NewRef((TyObject*)base);
        }
        else {
            type->tp_base = base;
        }
    }
    assert(type->tp_base != NULL || type == &PyBaseObject_Type);

    /* Now the only way base can still be NULL is if type is
     * &PyBaseObject_Type. */

    /* Initialize the base class */
    if (base != NULL && !_TyType_IsReady(base)) {
        if (TyType_Ready(base) < 0) {
            return -1;
        }
    }

    return 0;
}

static int
type_ready_set_type(TyTypeObject *type)
{
    /* Initialize ob_type if NULL.      This means extensions that want to be
       compilable separately on Windows can call TyType_Ready() instead of
       initializing the ob_type field of their type objects. */
    /* The test for base != NULL is really unnecessary, since base is only
       NULL when type is &PyBaseObject_Type, and we know its ob_type is
       not NULL (it's initialized to &TyType_Type).      But coverity doesn't
       know that. */
    TyTypeObject *base = type->tp_base;
    if (Ty_IS_TYPE(type, NULL) && base != NULL) {
        Ty_SET_TYPE(type, Ty_TYPE(base));
    }

    return 0;
}

static int
type_ready_set_bases(TyTypeObject *type, int initial)
{
    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        if (!initial) {
            assert(lookup_tp_bases(type) != NULL);
            return 0;
        }
        assert(lookup_tp_bases(type) == NULL);
    }

    TyObject *bases = lookup_tp_bases(type);
    if (bases == NULL) {
        TyTypeObject *base = type->tp_base;
        if (base == NULL) {
            bases = TyTuple_New(0);
        }
        else {
            bases = TyTuple_Pack(1, base);
        }
        if (bases == NULL) {
            return -1;
        }
        set_tp_bases(type, bases, 1);
    }
    return 0;
}


static int
type_ready_set_dict(TyTypeObject *type)
{
    if (lookup_tp_dict(type) != NULL) {
        return 0;
    }

    TyObject *dict = TyDict_New();
    if (dict == NULL) {
        return -1;
    }
    set_tp_dict(type, dict);
    return 0;
}


/* If the type dictionary doesn't contain a __doc__, set it from
   the tp_doc slot. */
static int
type_dict_set_doc(TyTypeObject *type)
{
    TyObject *dict = lookup_tp_dict(type);
    int r = TyDict_Contains(dict, &_Ty_ID(__doc__));
    if (r < 0) {
        return -1;
    }
    if (r > 0) {
        return 0;
    }

    if (type->tp_doc != NULL) {
        const char *doc_str;
        doc_str = _TyType_DocWithoutSignature(type->tp_name, type->tp_doc);
        TyObject *doc = TyUnicode_FromString(doc_str);
        if (doc == NULL) {
            return -1;
        }

        if (TyDict_SetItem(dict, &_Ty_ID(__doc__), doc) < 0) {
            Ty_DECREF(doc);
            return -1;
        }
        Ty_DECREF(doc);
    }
    else {
        if (TyDict_SetItem(dict, &_Ty_ID(__doc__), Ty_None) < 0) {
            return -1;
        }
    }
    return 0;
}


static int
type_ready_fill_dict(TyTypeObject *type)
{
    /* Add type-specific descriptors to tp_dict */
    if (add_operators(type) < 0) {
        return -1;
    }
    if (type_add_methods(type) < 0) {
        return -1;
    }
    if (type_add_members(type) < 0) {
        return -1;
    }
    if (type_add_getset(type) < 0) {
        return -1;
    }
    if (type_dict_set_doc(type) < 0) {
        return -1;
    }
    return 0;
}

static int
type_ready_preheader(TyTypeObject *type)
{
    if (type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        if (type->tp_dictoffset > 0 || type->tp_dictoffset < -1) {
            TyErr_Format(TyExc_TypeError,
                        "type %s has the Ty_TPFLAGS_MANAGED_DICT flag "
                        "but tp_dictoffset is set",
                        type->tp_name);
            return -1;
        }
        type->tp_dictoffset = -1;
    }
    if (type->tp_flags & Ty_TPFLAGS_MANAGED_WEAKREF) {
        if (type->tp_weaklistoffset != 0 &&
            type->tp_weaklistoffset != MANAGED_WEAKREF_OFFSET)
        {
            TyErr_Format(TyExc_TypeError,
                        "type %s has the Ty_TPFLAGS_MANAGED_WEAKREF flag "
                        "but tp_weaklistoffset is set",
                        type->tp_name);
            return -1;
        }
        type->tp_weaklistoffset = MANAGED_WEAKREF_OFFSET;
    }
    return 0;
}

static int
type_ready_mro(TyTypeObject *type, int initial)
{
    ASSERT_TYPE_LOCK_HELD();

    if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) {
        if (!initial) {
            assert(lookup_tp_mro(type) != NULL);
            return 0;
        }
        assert(lookup_tp_mro(type) == NULL);
    }

    /* Calculate method resolution order */
    if (mro_internal_unlocked(type, initial, NULL) < 0) {
        return -1;
    }
    TyObject *mro = lookup_tp_mro(type);
    assert(mro != NULL);
    assert(TyTuple_Check(mro));

    /* All bases of statically allocated type should be statically allocated,
       and static builtin types must have static builtin bases. */
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        assert(type->tp_flags & Ty_TPFLAGS_IMMUTABLETYPE);
        Ty_ssize_t n = TyTuple_GET_SIZE(mro);
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(mro, i));
            if (base->tp_flags & Ty_TPFLAGS_HEAPTYPE) {
                TyErr_Format(TyExc_TypeError,
                             "type '%.100s' is not dynamically allocated but "
                             "its base type '%.100s' is dynamically allocated",
                             type->tp_name, base->tp_name);
                return -1;
            }
            assert(!(type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN) ||
                   (base->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN));
        }
    }
    return 0;
}


// For static types, inherit tp_as_xxx structures from the base class
// if it's NULL.
//
// For heap types, tp_as_xxx structures are not NULL: they are set to the
// PyHeapTypeObject.as_xxx fields by type_new_alloc().
static void
type_ready_inherit_as_structs(TyTypeObject *type, TyTypeObject *base)
{
    if (type->tp_as_async == NULL) {
        type->tp_as_async = base->tp_as_async;
    }
    if (type->tp_as_number == NULL) {
        type->tp_as_number = base->tp_as_number;
    }
    if (type->tp_as_sequence == NULL) {
        type->tp_as_sequence = base->tp_as_sequence;
    }
    if (type->tp_as_mapping == NULL) {
        type->tp_as_mapping = base->tp_as_mapping;
    }
    if (type->tp_as_buffer == NULL) {
        type->tp_as_buffer = base->tp_as_buffer;
    }
}

static void
inherit_patma_flags(TyTypeObject *type, TyTypeObject *base) {
    if ((type->tp_flags & COLLECTION_FLAGS) == 0) {
        type_add_flags(type, base->tp_flags & COLLECTION_FLAGS);
    }
}

static int
type_ready_inherit(TyTypeObject *type)
{
    ASSERT_TYPE_LOCK_HELD();

    /* Inherit special flags from dominant base */
    TyTypeObject *base = type->tp_base;
    if (base != NULL) {
        inherit_special(type, base);
    }

    // Inherit slots
    TyObject *mro = lookup_tp_mro(type);
    Ty_ssize_t n = TyTuple_GET_SIZE(mro);
    for (Ty_ssize_t i = 1; i < n; i++) {
        TyObject *b = TyTuple_GET_ITEM(mro, i);
        if (TyType_Check(b)) {
            if (inherit_slots(type, (TyTypeObject *)b) < 0) {
                return -1;
            }
            inherit_patma_flags(type, (TyTypeObject *)b);
        }
    }

    if (base != NULL) {
        type_ready_inherit_as_structs(type, base);
    }

    /* Sanity check for tp_free. */
    if (_TyType_IS_GC(type) && (type->tp_flags & Ty_TPFLAGS_BASETYPE) &&
        (type->tp_free == NULL || type->tp_free == PyObject_Free))
    {
        /* This base class needs to call tp_free, but doesn't have
         * one, or its tp_free is for non-gc'ed objects.
         */
        TyErr_Format(TyExc_TypeError, "type '%.100s' participates in "
                     "gc and is a base type but has inappropriate "
                     "tp_free slot",
                     type->tp_name);
        return -1;
    }

    return 0;
}


/* Hack for tp_hash and __hash__.
   If after all that, tp_hash is still NULL, and __hash__ is not in
   tp_dict, set tp_hash to PyObject_HashNotImplemented and
   tp_dict['__hash__'] equal to None.
   This signals that __hash__ is not inherited. */
static int
type_ready_set_hash(TyTypeObject *type)
{
    if (type->tp_hash != NULL) {
        return 0;
    }

    TyObject *dict = lookup_tp_dict(type);
    int r = TyDict_Contains(dict, &_Ty_ID(__hash__));
    if (r < 0) {
        return -1;
    }
    if (r > 0) {
        return 0;
    }

    if (TyDict_SetItem(dict, &_Ty_ID(__hash__), Ty_None) < 0) {
        return -1;
    }
    type->tp_hash = PyObject_HashNotImplemented;
    return 0;
}


/* Link into each base class's list of subclasses */
static int
type_ready_add_subclasses(TyTypeObject *type)
{
    TyObject *bases = lookup_tp_bases(type);
    Ty_ssize_t nbase = TyTuple_GET_SIZE(bases);
    for (Ty_ssize_t i = 0; i < nbase; i++) {
        TyObject *b = TyTuple_GET_ITEM(bases, i);
        if (TyType_Check(b) && add_subclass((TyTypeObject *)b, type) < 0) {
            return -1;
        }
    }
    return 0;
}


// Set tp_new and the "__new__" key in the type dictionary.
// Use the Ty_TPFLAGS_DISALLOW_INSTANTIATION flag.
static int
type_ready_set_new(TyTypeObject *type, int initial)
{
    TyTypeObject *base = type->tp_base;
    /* The condition below could use some explanation.

       It appears that tp_new is not inherited for static types whose base
       class is 'object'; this seems to be a precaution so that old extension
       types don't suddenly become callable (object.__new__ wouldn't insure the
       invariants that the extension type's own factory function ensures).

       Heap types, of course, are under our control, so they do inherit tp_new;
       static extension types that specify some other built-in type as the
       default also inherit object.__new__. */
    if (type->tp_new == NULL
        && base == &PyBaseObject_Type
        && !(type->tp_flags & Ty_TPFLAGS_HEAPTYPE))
    {
        if (initial) {
            type_add_flags(type, Ty_TPFLAGS_DISALLOW_INSTANTIATION);
        } else {
            assert(type->tp_flags & Ty_TPFLAGS_DISALLOW_INSTANTIATION);
        }
    }

    if (!(type->tp_flags & Ty_TPFLAGS_DISALLOW_INSTANTIATION)) {
        if (type->tp_new != NULL) {
            if (initial || base == NULL || type->tp_new != base->tp_new) {
                // If "__new__" key does not exists in the type dictionary,
                // set it to tp_new_wrapper().
                if (add_tp_new_wrapper(type) < 0) {
                    return -1;
                }
            }
        }
        else {
            if (initial) {
                // tp_new is NULL: inherit tp_new from base
                type->tp_new = base->tp_new;
            }
        }
    }
    else {
        // Ty_TPFLAGS_DISALLOW_INSTANTIATION sets tp_new to NULL
        if (initial) {
            type->tp_new = NULL;
        }
    }
    return 0;
}

static int
type_ready_managed_dict(TyTypeObject *type)
{
    if (!(type->tp_flags & Ty_TPFLAGS_MANAGED_DICT)) {
        return 0;
    }
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        TyErr_Format(TyExc_SystemError,
                     "type %s has the Ty_TPFLAGS_MANAGED_DICT flag "
                     "but not Ty_TPFLAGS_HEAPTYPE flag",
                     type->tp_name);
        return -1;
    }
    PyHeapTypeObject* et = (PyHeapTypeObject*)type;
    if (et->ht_cached_keys == NULL) {
        et->ht_cached_keys = _TyDict_NewKeysForClass(et);
        if (et->ht_cached_keys == NULL) {
            TyErr_NoMemory();
            return -1;
        }
    }
    if (type->tp_itemsize == 0) {
        type_add_flags(type, Ty_TPFLAGS_INLINE_VALUES);
    }
    return 0;
}

static int
type_ready_post_checks(TyTypeObject *type)
{
    // bpo-44263: tp_traverse is required if Ty_TPFLAGS_HAVE_GC is set.
    // Note: tp_clear is optional.
    if (type->tp_flags & Ty_TPFLAGS_HAVE_GC
        && type->tp_traverse == NULL)
    {
        TyErr_Format(TyExc_SystemError,
                     "type %s has the Ty_TPFLAGS_HAVE_GC flag "
                     "but has no traverse function",
                     type->tp_name);
        return -1;
    }
    if (type->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        if (type->tp_dictoffset != -1) {
            TyErr_Format(TyExc_SystemError,
                        "type %s has the Ty_TPFLAGS_MANAGED_DICT flag "
                        "but tp_dictoffset is set to incompatible value",
                        type->tp_name);
            return -1;
        }
    }
    else if (type->tp_dictoffset < (Ty_ssize_t)sizeof(TyObject)) {
        if (type->tp_dictoffset + type->tp_basicsize <= 0) {
            TyErr_Format(TyExc_SystemError,
                         "type %s has a tp_dictoffset that is too small",
                         type->tp_name);
        }
    }
    return 0;
}


static int
type_ready(TyTypeObject *type, int initial)
{
    ASSERT_TYPE_LOCK_HELD();

    _TyObject_ASSERT((TyObject *)type, !is_readying(type));
    start_readying(type);

    if (type_ready_pre_checks(type) < 0) {
        goto error;
    }

#ifdef Ty_TRACE_REFS
    /* TyType_Ready is the closest thing we have to a choke point
     * for type objects, so is the best place I can think of to try
     * to get type objects into the doubly-linked list of all objects.
     * Still, not all type objects go through TyType_Ready.
     */
    _Ty_AddToAllObjects((TyObject *)type);
#endif

    /* Initialize tp_dict: _TyType_IsReady() tests if tp_dict != NULL */
    if (type_ready_set_dict(type) < 0) {
        goto error;
    }
    if (type_ready_set_base(type) < 0) {
        goto error;
    }
    if (type_ready_set_type(type) < 0) {
        goto error;
    }
    if (type_ready_set_bases(type, initial) < 0) {
        goto error;
    }
    if (type_ready_mro(type, initial) < 0) {
        goto error;
    }
    if (type_ready_set_new(type, initial) < 0) {
        goto error;
    }
    if (type_ready_fill_dict(type) < 0) {
        goto error;
    }
    if (initial) {
        if (type_ready_inherit(type) < 0) {
            goto error;
        }
        if (type_ready_preheader(type) < 0) {
            goto error;
        }
    }
    if (type_ready_set_hash(type) < 0) {
        goto error;
    }
    if (type_ready_add_subclasses(type) < 0) {
        goto error;
    }
    if (initial) {
        if (type_ready_managed_dict(type) < 0) {
            goto error;
        }
        if (type_ready_post_checks(type) < 0) {
            goto error;
        }
    }

    /* All done -- set the ready flag */
    if (initial) {
        type_add_flags(type, Ty_TPFLAGS_READY);
    } else {
        assert(type->tp_flags & Ty_TPFLAGS_READY);
    }

    stop_readying(type);

    assert(_TyType_CheckConsistency(type));
    return 0;

error:
    stop_readying(type);
    return -1;
}

int
TyType_Ready(TyTypeObject *type)
{
    if (type->tp_flags & Ty_TPFLAGS_READY) {
        assert(_TyType_CheckConsistency(type));
        return 0;
    }
    assert(!(type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN));

    /* Historically, all static types were immutable. See bpo-43908 */
    if (!(type->tp_flags & Ty_TPFLAGS_HEAPTYPE)) {
        type_add_flags(type, Ty_TPFLAGS_IMMUTABLETYPE);
        /* Static types must be immortal */
        _Ty_SetImmortalUntracked((TyObject *)type);
    }

    int res;
    BEGIN_TYPE_LOCK();
    if (!(type->tp_flags & Ty_TPFLAGS_READY)) {
        res = type_ready(type, 1);
    } else {
        res = 0;
        assert(_TyType_CheckConsistency(type));
    }
    END_TYPE_LOCK();
    return res;
}


static int
init_static_type(TyInterpreterState *interp, TyTypeObject *self,
                 int isbuiltin, int initial)
{
    assert(_Ty_IsImmortal((TyObject *)self));
    assert(!(self->tp_flags & Ty_TPFLAGS_HEAPTYPE));
    assert(!(self->tp_flags & Ty_TPFLAGS_MANAGED_DICT));
    assert(!(self->tp_flags & Ty_TPFLAGS_MANAGED_WEAKREF));

    if (initial) {
        assert((self->tp_flags & Ty_TPFLAGS_READY) == 0);

        type_add_flags(self, _Ty_TPFLAGS_STATIC_BUILTIN);
        type_add_flags(self, Ty_TPFLAGS_IMMUTABLETYPE);

        if (self->tp_version_tag == 0) {
            unsigned int next_version_tag = next_global_version_tag();
            assert(next_version_tag != 0);
            _TyType_SetVersion(self, next_version_tag);
        }
    }
    else {
        assert(!initial);
        assert(self->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN);
        assert(self->tp_version_tag != 0);
    }

    managed_static_type_state_init(interp, self, isbuiltin, initial);

    int res;
    BEGIN_TYPE_LOCK();
    res = type_ready(self, initial);
    END_TYPE_LOCK();
    if (res < 0) {
        _PyStaticType_ClearWeakRefs(interp, self);
        managed_static_type_state_clear(interp, self, isbuiltin, initial);
    }
    return res;
}

int
_PyStaticType_InitForExtension(TyInterpreterState *interp, TyTypeObject *self)
{
    return init_static_type(interp, self, 0, ((self->tp_flags & Ty_TPFLAGS_READY) == 0));
}

int
_PyStaticType_InitBuiltin(TyInterpreterState *interp, TyTypeObject *self)
{
    return init_static_type(interp, self, 1, _Ty_IsMainInterpreter(interp));
}


static int
add_subclass(TyTypeObject *base, TyTypeObject *type)
{
    TyObject *key = TyLong_FromVoidPtr((void *) type);
    if (key == NULL)
        return -1;

    TyObject *ref = PyWeakref_NewRef((TyObject *)type, NULL);
    if (ref == NULL) {
        Ty_DECREF(key);
        return -1;
    }

    // Only get tp_subclasses after creating the key and value.
    // PyWeakref_NewRef() can trigger a garbage collection which can execute
    // arbitrary Python code and so modify base->tp_subclasses.
    TyObject *subclasses = lookup_tp_subclasses(base);
    if (subclasses == NULL) {
        subclasses = init_tp_subclasses(base);
        if (subclasses == NULL) {
            Ty_DECREF(key);
            Ty_DECREF(ref);
            return -1;
        }
    }
    assert(TyDict_CheckExact(subclasses));

    int result = TyDict_SetItem(subclasses, key, ref);
    Ty_DECREF(ref);
    Ty_DECREF(key);
    return result;
}

static int
add_all_subclasses(TyTypeObject *type, TyObject *bases)
{
    Ty_ssize_t n = TyTuple_GET_SIZE(bases);
    int res = 0;
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *obj = TyTuple_GET_ITEM(bases, i);
        // bases tuple must only contain types
        TyTypeObject *base = _TyType_CAST(obj);
        if (add_subclass(base, type) < 0) {
            res = -1;
        }
    }
    return res;
}

static TyObject *
get_subclasses_key(TyTypeObject *type, TyTypeObject *base)
{
    TyObject *key = TyLong_FromVoidPtr((void *) type);
    if (key != NULL) {
        return key;
    }
    TyErr_Clear();

    /* This basically means we're out of memory.
       We fall back to manually traversing the values. */
    Ty_ssize_t i = 0;
    TyObject *ref;  // borrowed ref
    TyObject *subclasses = lookup_tp_subclasses(base);
    if (subclasses != NULL) {
        while (TyDict_Next(subclasses, &i, &key, &ref)) {
            TyTypeObject *subclass = type_from_ref(ref);
            if (subclass == NULL) {
                continue;
            }
            if (subclass == type) {
                Ty_DECREF(subclass);
                return Ty_NewRef(key);
            }
            Ty_DECREF(subclass);
        }
    }
    /* It wasn't found. */
    return NULL;
}

static void
remove_subclass(TyTypeObject *base, TyTypeObject *type)
{
    TyObject *subclasses = lookup_tp_subclasses(base);  // borrowed ref
    if (subclasses == NULL) {
        return;
    }
    assert(TyDict_CheckExact(subclasses));

    TyObject *key = get_subclasses_key(type, base);
    if (key != NULL && TyDict_DelItem(subclasses, key)) {
        /* This can happen if the type initialization errored out before
           the base subclasses were updated (e.g. a non-str __qualname__
           was passed in the type dict). */
        TyErr_Clear();
    }
    Ty_XDECREF(key);

    if (TyDict_Size(subclasses) == 0) {
        clear_tp_subclasses(base);
    }
}

static void
remove_all_subclasses(TyTypeObject *type, TyObject *bases)
{
    assert(bases != NULL);
    // remove_subclass() can clear the current exception
    assert(!TyErr_Occurred());

    for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(bases); i++) {
        TyObject *base = TyTuple_GET_ITEM(bases, i);
        if (TyType_Check(base)) {
            remove_subclass((TyTypeObject*) base, type);
        }
    }
    assert(!TyErr_Occurred());
}

static int
check_num_args(TyObject *ob, int n)
{
    if (!TyTuple_CheckExact(ob)) {
        TyErr_SetString(TyExc_SystemError,
            "TyArg_UnpackTuple() argument list is not a tuple");
        return 0;
    }
    if (n == TyTuple_GET_SIZE(ob))
        return 1;
    TyErr_Format(
        TyExc_TypeError,
        "expected %d argument%s, got %zd", n, n == 1 ? "" : "s", TyTuple_GET_SIZE(ob));
    return 0;
}

static Ty_ssize_t
check_pow_args(TyObject *ob)
{
    // Returns the argument count on success or `-1` on error.
    int min = 1;
    int max = 2;
    if (!TyTuple_CheckExact(ob)) {
        TyErr_SetString(TyExc_SystemError,
            "TyArg_UnpackTuple() argument list is not a tuple");
        return -1;
    }
    Ty_ssize_t size = TyTuple_GET_SIZE(ob);
    if (size >= min && size <= max) {
        return size;
    }
    TyErr_Format(
        TyExc_TypeError,
        "expected %d or %d arguments, got %zd", min, max, TyTuple_GET_SIZE(ob));
    return -1;
}

/* Generic wrappers for overloadable 'operators' such as __getitem__ */

/* There's a wrapper *function* for each distinct function typedef used
   for type object slots (e.g. binaryfunc, ternaryfunc, etc.).  There's a
   wrapper *table* for each distinct operation (e.g. __len__, __add__).
   Most tables have only one entry; the tables for binary operators have two
   entries, one regular and one with reversed arguments. */

static TyObject *
wrap_lenfunc(TyObject *self, TyObject *args, void *wrapped)
{
    lenfunc func = (lenfunc)wrapped;
    Ty_ssize_t res;

    if (!check_num_args(args, 0))
        return NULL;
    res = (*func)(self);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    return TyLong_FromSsize_t(res);
}

static TyObject *
wrap_inquirypred(TyObject *self, TyObject *args, void *wrapped)
{
    inquiry func = (inquiry)wrapped;
    int res;

    if (!check_num_args(args, 0))
        return NULL;
    res = (*func)(self);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    return TyBool_FromLong((long)res);
}

static TyObject *
wrap_binaryfunc(TyObject *self, TyObject *args, void *wrapped)
{
    binaryfunc func = (binaryfunc)wrapped;
    TyObject *other;

    if (!check_num_args(args, 1))
        return NULL;
    other = TyTuple_GET_ITEM(args, 0);
    return (*func)(self, other);
}

static TyObject *
wrap_binaryfunc_l(TyObject *self, TyObject *args, void *wrapped)
{
    binaryfunc func = (binaryfunc)wrapped;
    TyObject *other;

    if (!check_num_args(args, 1))
        return NULL;
    other = TyTuple_GET_ITEM(args, 0);
    return (*func)(self, other);
}

static TyObject *
wrap_binaryfunc_r(TyObject *self, TyObject *args, void *wrapped)
{
    binaryfunc func = (binaryfunc)wrapped;
    TyObject *other;

    if (!check_num_args(args, 1))
        return NULL;
    other = TyTuple_GET_ITEM(args, 0);
    return (*func)(other, self);
}

static TyObject *
wrap_ternaryfunc(TyObject *self, TyObject *args, void *wrapped)
{
    ternaryfunc func = (ternaryfunc)wrapped;
    TyObject *other;
    TyObject *third = Ty_None;

    /* Note: This wrapper only works for __pow__() */

    Ty_ssize_t size = check_pow_args(args);
    if (size == -1) {
        return NULL;
    }
    other = TyTuple_GET_ITEM(args, 0);
    if (size == 2) {
       third = TyTuple_GET_ITEM(args, 1);
    }

    return (*func)(self, other, third);
}

static TyObject *
wrap_ternaryfunc_r(TyObject *self, TyObject *args, void *wrapped)
{
    ternaryfunc func = (ternaryfunc)wrapped;
    TyObject *other;
    TyObject *third = Ty_None;

    /* Note: This wrapper only works for __rpow__() */

    Ty_ssize_t size = check_pow_args(args);
    if (size == -1) {
        return NULL;
    }
    other = TyTuple_GET_ITEM(args, 0);
    if (size == 2) {
       third = TyTuple_GET_ITEM(args, 1);
    }

    return (*func)(other, self, third);
}

static TyObject *
wrap_unaryfunc(TyObject *self, TyObject *args, void *wrapped)
{
    unaryfunc func = (unaryfunc)wrapped;

    if (!check_num_args(args, 0))
        return NULL;
    return (*func)(self);
}

static TyObject *
wrap_indexargfunc(TyObject *self, TyObject *args, void *wrapped)
{
    ssizeargfunc func = (ssizeargfunc)wrapped;
    TyObject* o;
    Ty_ssize_t i;

    if (!check_num_args(args, 1))
        return NULL;
    o = TyTuple_GET_ITEM(args, 0);
    i = PyNumber_AsSsize_t(o, TyExc_OverflowError);
    if (i == -1 && TyErr_Occurred())
        return NULL;
    return (*func)(self, i);
}

static Ty_ssize_t
getindex(TyObject *self, TyObject *arg)
{
    Ty_ssize_t i;

    i = PyNumber_AsSsize_t(arg, TyExc_OverflowError);
    if (i == -1 && TyErr_Occurred())
        return -1;
    if (i < 0) {
        PySequenceMethods *sq = Ty_TYPE(self)->tp_as_sequence;
        if (sq && sq->sq_length) {
            Ty_ssize_t n = (*sq->sq_length)(self);
            if (n < 0) {
                assert(TyErr_Occurred());
                return -1;
            }
            i += n;
        }
    }
    return i;
}

static TyObject *
wrap_sq_item(TyObject *self, TyObject *args, void *wrapped)
{
    ssizeargfunc func = (ssizeargfunc)wrapped;
    TyObject *arg;
    Ty_ssize_t i;

    if (TyTuple_GET_SIZE(args) == 1) {
        arg = TyTuple_GET_ITEM(args, 0);
        i = getindex(self, arg);
        if (i == -1 && TyErr_Occurred())
            return NULL;
        return (*func)(self, i);
    }
    check_num_args(args, 1);
    assert(TyErr_Occurred());
    return NULL;
}

static TyObject *
wrap_sq_setitem(TyObject *self, TyObject *args, void *wrapped)
{
    ssizeobjargproc func = (ssizeobjargproc)wrapped;
    Ty_ssize_t i;
    int res;
    TyObject *arg, *value;

    if (!TyArg_UnpackTuple(args, "__setitem__", 2, 2, &arg, &value))
        return NULL;
    i = getindex(self, arg);
    if (i == -1 && TyErr_Occurred())
        return NULL;
    res = (*func)(self, i, value);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_sq_delitem(TyObject *self, TyObject *args, void *wrapped)
{
    ssizeobjargproc func = (ssizeobjargproc)wrapped;
    Ty_ssize_t i;
    int res;
    TyObject *arg;

    if (!check_num_args(args, 1))
        return NULL;
    arg = TyTuple_GET_ITEM(args, 0);
    i = getindex(self, arg);
    if (i == -1 && TyErr_Occurred())
        return NULL;
    res = (*func)(self, i, NULL);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    Py_RETURN_NONE;
}

/* XXX objobjproc is a misnomer; should be objargpred */
static TyObject *
wrap_objobjproc(TyObject *self, TyObject *args, void *wrapped)
{
    objobjproc func = (objobjproc)wrapped;
    int res;
    TyObject *value;

    if (!check_num_args(args, 1))
        return NULL;
    value = TyTuple_GET_ITEM(args, 0);
    res = (*func)(self, value);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    else
        return TyBool_FromLong(res);
}

static TyObject *
wrap_objobjargproc(TyObject *self, TyObject *args, void *wrapped)
{
    objobjargproc func = (objobjargproc)wrapped;
    int res;
    TyObject *key, *value;

    if (!TyArg_UnpackTuple(args, "__setitem__", 2, 2, &key, &value))
        return NULL;
    res = (*func)(self, key, value);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_delitem(TyObject *self, TyObject *args, void *wrapped)
{
    objobjargproc func = (objobjargproc)wrapped;
    int res;
    TyObject *key;

    if (!check_num_args(args, 1))
        return NULL;
    key = TyTuple_GET_ITEM(args, 0);
    res = (*func)(self, key, NULL);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    Py_RETURN_NONE;
}

/* Helper to check for object.__setattr__ or __delattr__ applied to a type.
   This is called the Carlo Verre hack after its discoverer.  See
   https://mail.python.org/pipermail/python-dev/2003-April/034535.html
   */
static int
hackcheck_unlocked(TyObject *self, setattrofunc func, const char *what)
{
    TyTypeObject *type = Ty_TYPE(self);

    ASSERT_TYPE_LOCK_HELD();

    TyObject *mro = lookup_tp_mro(type);
    if (!mro) {
        /* Probably ok not to check the call in this case. */
        return 1;
    }
    assert(TyTuple_Check(mro));

    /* Find the (base) type that defined the type's slot function. */
    TyTypeObject *defining_type = type;
    Ty_ssize_t i;
    for (i = TyTuple_GET_SIZE(mro) - 1; i >= 0; i--) {
        TyTypeObject *base = _TyType_CAST(TyTuple_GET_ITEM(mro, i));
        if (base->tp_setattro == slot_tp_setattro) {
            /* Ignore Python classes:
               they never define their own C-level setattro. */
        }
        else if (base->tp_setattro == type->tp_setattro) {
            defining_type = base;
            break;
        }
    }

    /* Reject calls that jump over intermediate C-level overrides. */
    for (TyTypeObject *base = defining_type; base; base = base->tp_base) {
        if (base->tp_setattro == func) {
            /* 'func' is the right slot function to call. */
            break;
        }
        else if (base->tp_setattro != slot_tp_setattro) {
            /* 'base' is not a Python class and overrides 'func'.
               Its tp_setattro should be called instead. */
            TyErr_Format(TyExc_TypeError,
                         "can't apply this %s to %s object",
                         what,
                         type->tp_name);
            return 0;
        }
    }
    return 1;
}

static int
hackcheck(TyObject *self, setattrofunc func, const char *what)
{
    if (!TyType_Check(self)) {
        return 1;
    }

    int res;
    BEGIN_TYPE_LOCK();
    res = hackcheck_unlocked(self, func, what);
    END_TYPE_LOCK();
    return res;
}

static TyObject *
wrap_setattr(TyObject *self, TyObject *args, void *wrapped)
{
    setattrofunc func = (setattrofunc)wrapped;
    int res;
    TyObject *name, *value;

    if (!TyArg_UnpackTuple(args, "__setattr__", 2, 2, &name, &value))
        return NULL;
    if (!hackcheck(self, func, "__setattr__"))
        return NULL;
    res = (*func)(self, name, value);
    if (res < 0)
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_delattr(TyObject *self, TyObject *args, void *wrapped)
{
    setattrofunc func = (setattrofunc)wrapped;
    int res;
    TyObject *name;

    if (!check_num_args(args, 1))
        return NULL;
    name = TyTuple_GET_ITEM(args, 0);
    if (!hackcheck(self, func, "__delattr__"))
        return NULL;
    res = (*func)(self, name, NULL);
    if (res < 0)
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_hashfunc(TyObject *self, TyObject *args, void *wrapped)
{
    hashfunc func = (hashfunc)wrapped;
    Ty_hash_t res;

    if (!check_num_args(args, 0))
        return NULL;
    res = (*func)(self);
    if (res == -1 && TyErr_Occurred())
        return NULL;
    return TyLong_FromSsize_t(res);
}

static TyObject *
wrap_call(TyObject *self, TyObject *args, void *wrapped, TyObject *kwds)
{
    ternaryfunc func = (ternaryfunc)wrapped;

    return (*func)(self, args, kwds);
}

static TyObject *
wrap_del(TyObject *self, TyObject *args, void *wrapped)
{
    destructor func = (destructor)wrapped;

    if (!check_num_args(args, 0))
        return NULL;

    (*func)(self);
    Py_RETURN_NONE;
}

static TyObject *
wrap_richcmpfunc(TyObject *self, TyObject *args, void *wrapped, int op)
{
    richcmpfunc func = (richcmpfunc)wrapped;
    TyObject *other;

    if (!check_num_args(args, 1))
        return NULL;
    other = TyTuple_GET_ITEM(args, 0);
    return (*func)(self, other, op);
}

#undef RICHCMP_WRAPPER
#define RICHCMP_WRAPPER(NAME, OP) \
static TyObject * \
richcmp_##NAME(TyObject *self, TyObject *args, void *wrapped) \
{ \
    return wrap_richcmpfunc(self, args, wrapped, OP); \
}

RICHCMP_WRAPPER(lt, Py_LT)
RICHCMP_WRAPPER(le, Py_LE)
RICHCMP_WRAPPER(eq, Py_EQ)
RICHCMP_WRAPPER(ne, Py_NE)
RICHCMP_WRAPPER(gt, Py_GT)
RICHCMP_WRAPPER(ge, Py_GE)

static TyObject *
wrap_next(TyObject *self, TyObject *args, void *wrapped)
{
    unaryfunc func = (unaryfunc)wrapped;
    TyObject *res;

    if (!check_num_args(args, 0))
        return NULL;
    res = (*func)(self);
    if (res == NULL && !TyErr_Occurred())
        TyErr_SetNone(TyExc_StopIteration);
    return res;
}

static TyObject *
wrap_descr_get(TyObject *self, TyObject *args, void *wrapped)
{
    descrgetfunc func = (descrgetfunc)wrapped;
    TyObject *obj;
    TyObject *type = NULL;

    if (!TyArg_UnpackTuple(args, "__get__", 1, 2, &obj, &type))
        return NULL;
    if (obj == Ty_None)
        obj = NULL;
    if (type == Ty_None)
        type = NULL;
    if (type == NULL && obj == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "__get__(None, None) is invalid");
        return NULL;
    }
    return (*func)(self, obj, type);
}

static TyObject *
wrap_descr_set(TyObject *self, TyObject *args, void *wrapped)
{
    descrsetfunc func = (descrsetfunc)wrapped;
    TyObject *obj, *value;
    int ret;

    if (!TyArg_UnpackTuple(args, "__set__", 2, 2, &obj, &value))
        return NULL;
    ret = (*func)(self, obj, value);
    if (ret < 0)
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_descr_delete(TyObject *self, TyObject *args, void *wrapped)
{
    descrsetfunc func = (descrsetfunc)wrapped;
    TyObject *obj;
    int ret;

    if (!check_num_args(args, 1))
        return NULL;
    obj = TyTuple_GET_ITEM(args, 0);
    ret = (*func)(self, obj, NULL);
    if (ret < 0)
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
wrap_buffer(TyObject *self, TyObject *args, void *wrapped)
{
    TyObject *arg = NULL;

    if (!TyArg_UnpackTuple(args, "__buffer__", 1, 1, &arg)) {
        return NULL;
    }
    Ty_ssize_t flags = PyNumber_AsSsize_t(arg, TyExc_OverflowError);
    if (flags == -1 && TyErr_Occurred()) {
        return NULL;
    }
    if (flags > INT_MAX || flags < INT_MIN) {
        TyErr_SetString(TyExc_OverflowError,
                        "buffer flags out of range");
        return NULL;
    }

    return _PyMemoryView_FromBufferProc(self, (int)flags,
                                        (getbufferproc)wrapped);
}

static TyObject *
wrap_releasebuffer(TyObject *self, TyObject *args, void *wrapped)
{
    TyObject *arg = NULL;
    if (!TyArg_UnpackTuple(args, "__release_buffer__", 1, 1, &arg)) {
        return NULL;
    }
    if (!TyMemoryView_Check(arg)) {
        TyErr_SetString(TyExc_TypeError,
                        "expected a memoryview object");
        return NULL;
    }
    PyMemoryViewObject *mview = (PyMemoryViewObject *)arg;
    if (mview->view.obj == NULL) {
        // Already released, ignore
        Py_RETURN_NONE;
    }
    if (mview->view.obj != self) {
        TyErr_SetString(TyExc_ValueError,
                        "memoryview's buffer is not this object");
        return NULL;
    }
    if (mview->flags & _Ty_MEMORYVIEW_RELEASED) {
        TyErr_SetString(TyExc_ValueError,
                        "memoryview's buffer has already been released");
        return NULL;
    }
    TyObject *res = PyObject_CallMethodNoArgs((TyObject *)mview, &_Ty_ID(release));
    if (res == NULL) {
        return NULL;
    }
    Ty_DECREF(res);
    Py_RETURN_NONE;
}

static TyObject *
wrap_init(TyObject *self, TyObject *args, void *wrapped, TyObject *kwds)
{
    initproc func = (initproc)wrapped;

    if (func(self, args, kwds) < 0)
        return NULL;
    Py_RETURN_NONE;
}

static TyObject *
tp_new_wrapper(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyTypeObject *staticbase;
    TyObject *arg0, *res;

    if (self == NULL || !TyType_Check(self)) {
        TyErr_Format(TyExc_SystemError,
                     "__new__() called with non-type 'self'");
        return NULL;
    }
    TyTypeObject *type = (TyTypeObject *)self;

    if (!TyTuple_Check(args) || TyTuple_GET_SIZE(args) < 1) {
        TyErr_Format(TyExc_TypeError,
                     "%s.__new__(): not enough arguments",
                     type->tp_name);
        return NULL;
    }
    arg0 = TyTuple_GET_ITEM(args, 0);
    if (!TyType_Check(arg0)) {
        TyErr_Format(TyExc_TypeError,
                     "%s.__new__(X): X is not a type object (%s)",
                     type->tp_name,
                     Ty_TYPE(arg0)->tp_name);
        return NULL;
    }
    TyTypeObject *subtype = (TyTypeObject *)arg0;

    if (!TyType_IsSubtype(subtype, type)) {
        TyErr_Format(TyExc_TypeError,
                     "%s.__new__(%s): %s is not a subtype of %s",
                     type->tp_name,
                     subtype->tp_name,
                     subtype->tp_name,
                     type->tp_name);
        return NULL;
    }

    /* Check that the use doesn't do something silly and unsafe like
       object.__new__(dict).  To do this, we check that the
       most derived base that's not a heap type is this type. */
    staticbase = subtype;
    while (staticbase && (staticbase->tp_new == slot_tp_new))
        staticbase = staticbase->tp_base;
    /* If staticbase is NULL now, it is a really weird type.
       In the spirit of backwards compatibility (?), just shut up. */
    if (staticbase && staticbase->tp_new != type->tp_new) {
        if (staticbase->tp_new == NULL) {
            TyErr_Format(TyExc_TypeError,
                         "cannot create '%s' instances", subtype->tp_name);
            return NULL;
        }
        TyErr_Format(TyExc_TypeError,
                     "%s.__new__(%s) is not safe, use %s.__new__()",
                     type->tp_name,
                     subtype->tp_name,
                     staticbase->tp_name);
        return NULL;
    }

    args = TyTuple_GetSlice(args, 1, TyTuple_GET_SIZE(args));
    if (args == NULL)
        return NULL;
    res = type->tp_new(subtype, args, kwds);
    Ty_DECREF(args);
    return res;
}

static struct TyMethodDef tp_new_methoddef[] = {
    {"__new__", _PyCFunction_CAST(tp_new_wrapper), METH_VARARGS|METH_KEYWORDS,
     TyDoc_STR("__new__($type, *args, **kwargs)\n--\n\n"
               "Create and return a new object.  "
               "See help(type) for accurate signature.")},
    {0}
};

static int
add_tp_new_wrapper(TyTypeObject *type)
{
    TyObject *dict = lookup_tp_dict(type);
    int r = TyDict_Contains(dict, &_Ty_ID(__new__));
    if (r > 0) {
        return 0;
    }
    if (r < 0) {
        return -1;
    }

    TyObject *func = PyCFunction_NewEx(tp_new_methoddef, (TyObject *)type, NULL);
    if (func == NULL) {
        return -1;
    }
    _TyObject_SetDeferredRefcount(func);
    r = TyDict_SetItem(dict, &_Ty_ID(__new__), func);
    Ty_DECREF(func);
    return r;
}

/* Slot wrappers that call the corresponding __foo__ slot.  See comments
   below at override_slots() for more explanation. */

#define SLOT0(FUNCNAME, DUNDER) \
static TyObject * \
FUNCNAME(TyObject *self) \
{ \
    TyObject* stack[1] = {self}; \
    return vectorcall_method(&_Ty_ID(DUNDER), stack, 1); \
}

#define SLOT1(FUNCNAME, DUNDER, ARG1TYPE) \
static TyObject * \
FUNCNAME(TyObject *self, ARG1TYPE arg1) \
{ \
    TyObject* stack[2] = {self, arg1}; \
    return vectorcall_method(&_Ty_ID(DUNDER), stack, 2); \
}

/* Boolean helper for SLOT1BINFULL().
   right.__class__ is a nontrivial subclass of left.__class__. */
static int
method_is_overloaded(TyObject *left, TyObject *right, TyObject *name)
{
    TyObject *a, *b;
    int ok;

    if (PyObject_GetOptionalAttr((TyObject *)(Ty_TYPE(right)), name, &b) < 0) {
        return -1;
    }
    if (b == NULL) {
        /* If right doesn't have it, it's not overloaded */
        return 0;
    }

    if (PyObject_GetOptionalAttr((TyObject *)(Ty_TYPE(left)), name, &a) < 0) {
        Ty_DECREF(b);
        return -1;
    }
    if (a == NULL) {
        Ty_DECREF(b);
        /* If right has it but left doesn't, it's overloaded */
        return 1;
    }

    ok = PyObject_RichCompareBool(a, b, Py_NE);
    Ty_DECREF(a);
    Ty_DECREF(b);
    return ok;
}


#define SLOT1BINFULL(FUNCNAME, TESTFUNC, SLOTNAME, DUNDER, RDUNDER) \
static TyObject * \
FUNCNAME(TyObject *self, TyObject *other) \
{ \
    TyObject* stack[2]; \
    TyThreadState *tstate = _TyThreadState_GET(); \
    int do_other = !Ty_IS_TYPE(self, Ty_TYPE(other)) && \
        Ty_TYPE(other)->tp_as_number != NULL && \
        Ty_TYPE(other)->tp_as_number->SLOTNAME == TESTFUNC; \
    if (Ty_TYPE(self)->tp_as_number != NULL && \
        Ty_TYPE(self)->tp_as_number->SLOTNAME == TESTFUNC) { \
        TyObject *r; \
        if (do_other && TyType_IsSubtype(Ty_TYPE(other), Ty_TYPE(self))) { \
            int ok = method_is_overloaded(self, other, &_Ty_ID(RDUNDER)); \
            if (ok < 0) { \
                return NULL; \
            } \
            if (ok) { \
                stack[0] = other; \
                stack[1] = self; \
                r = vectorcall_maybe(tstate, &_Ty_ID(RDUNDER), stack, 2); \
                if (r != Ty_NotImplemented) \
                    return r; \
                Ty_DECREF(r); \
                do_other = 0; \
            } \
        } \
        stack[0] = self; \
        stack[1] = other; \
        r = vectorcall_maybe(tstate, &_Ty_ID(DUNDER), stack, 2); \
        if (r != Ty_NotImplemented || \
            Ty_IS_TYPE(other, Ty_TYPE(self))) \
            return r; \
        Ty_DECREF(r); \
    } \
    if (do_other) { \
        stack[0] = other; \
        stack[1] = self; \
        return vectorcall_maybe(tstate, &_Ty_ID(RDUNDER), stack, 2); \
    } \
    Py_RETURN_NOTIMPLEMENTED; \
}

#define SLOT1BIN(FUNCNAME, SLOTNAME, DUNDER, RDUNDER) \
    SLOT1BINFULL(FUNCNAME, FUNCNAME, SLOTNAME, DUNDER, RDUNDER)

static Ty_ssize_t
slot_sq_length(TyObject *self)
{
    TyObject* stack[1] = {self};
    TyObject *res = vectorcall_method(&_Ty_ID(__len__), stack, 1);
    Ty_ssize_t len;

    if (res == NULL)
        return -1;

    Ty_SETREF(res, _PyNumber_Index(res));
    if (res == NULL)
        return -1;

    assert(TyLong_Check(res));
    if (_TyLong_IsNegative((PyLongObject *)res)) {
        Ty_DECREF(res);
        TyErr_SetString(TyExc_ValueError,
                        "__len__() should return >= 0");
        return -1;
    }

    len = PyNumber_AsSsize_t(res, TyExc_OverflowError);
    assert(len >= 0 || TyErr_ExceptionMatches(TyExc_OverflowError));
    Ty_DECREF(res);
    return len;
}

static TyObject *
slot_sq_item(TyObject *self, Ty_ssize_t i)
{
    TyObject *ival = TyLong_FromSsize_t(i);
    if (ival == NULL) {
        return NULL;
    }
    TyObject *stack[2] = {self, ival};
    TyObject *retval = vectorcall_method(&_Ty_ID(__getitem__), stack, 2);
    Ty_DECREF(ival);
    return retval;
}

static int
slot_sq_ass_item(TyObject *self, Ty_ssize_t index, TyObject *value)
{
    TyObject *stack[3];
    TyObject *res;
    TyObject *index_obj;

    index_obj = TyLong_FromSsize_t(index);
    if (index_obj == NULL) {
        return -1;
    }

    stack[0] = self;
    stack[1] = index_obj;
    if (value == NULL) {
        res = vectorcall_method(&_Ty_ID(__delitem__), stack, 2);
    }
    else {
        stack[2] = value;
        res = vectorcall_method(&_Ty_ID(__setitem__), stack, 3);
    }
    Ty_DECREF(index_obj);

    if (res == NULL) {
        return -1;
    }
    Ty_DECREF(res);
    return 0;
}

static int
slot_sq_contains(TyObject *self, TyObject *value)
{
    int attr_is_none = 0;
    TyObject *res = maybe_call_special_one_arg(self, &_Ty_ID(__contains__), value,
                                               &attr_is_none);
    if (attr_is_none) {
        TyErr_Format(TyExc_TypeError,
            "'%.200s' object is not a container",
            Ty_TYPE(self)->tp_name);
        return -1;
    }
    else if (res == NULL && TyErr_Occurred()) {
        return -1;
    }
    else if (res == NULL) {
        return (int)_PySequence_IterSearch(self, value, PY_ITERSEARCH_CONTAINS);
    }
    int result = PyObject_IsTrue(res);
    Ty_DECREF(res);
    return result;
}

#define slot_mp_length slot_sq_length

SLOT1(slot_mp_subscript, __getitem__, TyObject *)

static int
slot_mp_ass_subscript(TyObject *self, TyObject *key, TyObject *value)
{
    TyObject *stack[3];
    TyObject *res;

    stack[0] = self;
    stack[1] = key;
    if (value == NULL) {
        res = vectorcall_method(&_Ty_ID(__delitem__), stack, 2);
    }
    else {
        stack[2] = value;
        res = vectorcall_method(&_Ty_ID(__setitem__), stack, 3);
    }

    if (res == NULL)
        return -1;
    Ty_DECREF(res);
    return 0;
}

SLOT1BIN(slot_nb_add, nb_add, __add__, __radd__)
SLOT1BIN(slot_nb_subtract, nb_subtract, __sub__, __rsub__)
SLOT1BIN(slot_nb_multiply, nb_multiply, __mul__, __rmul__)
SLOT1BIN(slot_nb_matrix_multiply, nb_matrix_multiply, __matmul__, __rmatmul__)
SLOT1BIN(slot_nb_remainder, nb_remainder, __mod__, __rmod__)
SLOT1BIN(slot_nb_divmod, nb_divmod, __divmod__, __rdivmod__)

static TyObject *slot_nb_power(TyObject *, TyObject *, TyObject *);

SLOT1BINFULL(slot_nb_power_binary, slot_nb_power, nb_power, __pow__, __rpow__)

static TyObject *
slot_nb_power(TyObject *self, TyObject *other, TyObject *modulus)
{
    if (modulus == Ty_None)
        return slot_nb_power_binary(self, other);

    /* The following code is a copy of SLOT1BINFULL, but for three arguments. */
    TyObject* stack[3];
    TyThreadState *tstate = _TyThreadState_GET();
    int do_other = !Ty_IS_TYPE(self, Ty_TYPE(other)) &&
        Ty_TYPE(other)->tp_as_number != NULL &&
        Ty_TYPE(other)->tp_as_number->nb_power == slot_nb_power;
    if (Ty_TYPE(self)->tp_as_number != NULL &&
        Ty_TYPE(self)->tp_as_number->nb_power == slot_nb_power) {
        TyObject *r;
        if (do_other && TyType_IsSubtype(Ty_TYPE(other), Ty_TYPE(self))) {
            int ok = method_is_overloaded(self, other, &_Ty_ID(__rpow__));
            if (ok < 0) {
                return NULL;
            }
            if (ok) {
                stack[0] = other;
                stack[1] = self;
                stack[2] = modulus;
                r = vectorcall_maybe(tstate, &_Ty_ID(__rpow__), stack, 3);
                if (r != Ty_NotImplemented)
                    return r;
                Ty_DECREF(r);
                do_other = 0;
            }
        }
        stack[0] = self;
        stack[1] = other;
        stack[2] = modulus;
        r = vectorcall_maybe(tstate, &_Ty_ID(__pow__), stack, 3);
        if (r != Ty_NotImplemented ||
            Ty_IS_TYPE(other, Ty_TYPE(self)))
            return r;
        Ty_DECREF(r);
    }
    if (do_other) {
        stack[0] = other;
        stack[1] = self;
        stack[2] = modulus;
        return vectorcall_maybe(tstate, &_Ty_ID(__rpow__), stack, 3);
    }
    Py_RETURN_NOTIMPLEMENTED;
}

SLOT0(slot_nb_negative, __neg__)
SLOT0(slot_nb_positive, __pos__)
SLOT0(slot_nb_absolute, __abs__)

static int
slot_nb_bool(TyObject *self)
{
    int using_len = 0;
    int attr_is_none = 0;
    TyObject *value = maybe_call_special_no_args(self, &_Ty_ID(__bool__),
                                                 &attr_is_none);
    if (attr_is_none) {
        TyErr_Format(TyExc_TypeError,
                     "'%.200s' cannot be interpreted as a boolean",
                     Ty_TYPE(self)->tp_name);
        return -1;
    }
    else if (value == NULL && !TyErr_Occurred()) {
        value = _TyObject_MaybeCallSpecialNoArgs(self, &_Ty_ID(__len__));
        if (value == NULL && !TyErr_Occurred()) {
            return 1;
        }
        using_len = 1;
    }

    if (value == NULL) {
        return -1;
    }

    int result;
    if (using_len) {
        /* bool type enforced by slot_nb_len */
        result = PyObject_IsTrue(value);
    }
    else if (TyBool_Check(value)) {
        result = PyObject_IsTrue(value);
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "__bool__ should return "
                     "bool, returned %s",
                     Ty_TYPE(value)->tp_name);
        result = -1;
    }
    Ty_DECREF(value);
    return result;
}


static TyObject *
slot_nb_index(TyObject *self)
{
    TyObject *stack[1] = {self};
    return vectorcall_method(&_Ty_ID(__index__), stack, 1);
}


SLOT0(slot_nb_invert, __invert__)
SLOT1BIN(slot_nb_lshift, nb_lshift, __lshift__, __rlshift__)
SLOT1BIN(slot_nb_rshift, nb_rshift, __rshift__, __rrshift__)
SLOT1BIN(slot_nb_and, nb_and, __and__, __rand__)
SLOT1BIN(slot_nb_xor, nb_xor, __xor__, __rxor__)
SLOT1BIN(slot_nb_or, nb_or, __or__, __ror__)

SLOT0(slot_nb_int, __int__)
SLOT0(slot_nb_float, __float__)
SLOT1(slot_nb_inplace_add, __iadd__, TyObject *)
SLOT1(slot_nb_inplace_subtract, __isub__, TyObject *)
SLOT1(slot_nb_inplace_multiply, __imul__, TyObject *)
SLOT1(slot_nb_inplace_matrix_multiply, __imatmul__, TyObject *)
SLOT1(slot_nb_inplace_remainder, __imod__, TyObject *)
/* Can't use SLOT1 here, because nb_inplace_power is ternary */
static TyObject *
slot_nb_inplace_power(TyObject *self, TyObject * arg1, TyObject *arg2)
{
    TyObject *stack[2] = {self, arg1};
    return vectorcall_method(&_Ty_ID(__ipow__), stack, 2);
}
SLOT1(slot_nb_inplace_lshift, __ilshift__, TyObject *)
SLOT1(slot_nb_inplace_rshift, __irshift__, TyObject *)
SLOT1(slot_nb_inplace_and, __iand__, TyObject *)
SLOT1(slot_nb_inplace_xor, __ixor__, TyObject *)
SLOT1(slot_nb_inplace_or, __ior__, TyObject *)
SLOT1BIN(slot_nb_floor_divide, nb_floor_divide,
         __floordiv__, __rfloordiv__)
SLOT1BIN(slot_nb_true_divide, nb_true_divide, __truediv__, __rtruediv__)
SLOT1(slot_nb_inplace_floor_divide, __ifloordiv__, TyObject *)
SLOT1(slot_nb_inplace_true_divide, __itruediv__, TyObject *)

static TyObject *
slot_tp_repr(TyObject *self)
{
    TyObject *res = _TyObject_MaybeCallSpecialNoArgs(self, &_Ty_ID(__repr__));
    if (res != NULL) {
        return res;
    }
    else if (TyErr_Occurred()) {
        return NULL;
    }
    return TyUnicode_FromFormat("<%s object at %p>",
                                Ty_TYPE(self)->tp_name, self);
}

SLOT0(slot_tp_str, __str__)

static Ty_hash_t
slot_tp_hash(TyObject *self)
{
    TyObject *res;
    int attr_is_none = 0;
    res  = maybe_call_special_no_args(self, &_Ty_ID(__hash__), &attr_is_none);
    if (attr_is_none || res == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return PyObject_HashNotImplemented(self);
    }
    if (!TyLong_Check(res)) {
        TyErr_SetString(TyExc_TypeError,
                        "__hash__ method should return an integer");
        return -1;
    }
    /* Transform the PyLong `res` to a Ty_hash_t `h`.  For an existing
       hashable Python object x, hash(x) will always lie within the range of
       Ty_hash_t.  Therefore our transformation must preserve values that
       already lie within this range, to ensure that if x.__hash__() returns
       hash(y) then hash(x) == hash(y). */
    Ty_ssize_t h = TyLong_AsSsize_t(res);
    if (h == -1 && TyErr_Occurred()) {
        /* res was not within the range of a Ty_hash_t, so we're free to
           use any sufficiently bit-mixing transformation;
           long.__hash__ will do nicely. */
        TyErr_Clear();
        h = TyLong_Type.tp_hash(res);
    }
    /* -1 is reserved for errors. */
    if (h == -1)
        h = -2;
    Ty_DECREF(res);
    return h;
}

static TyObject *
slot_tp_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    return call_method(self, &_Ty_ID(__call__), args, kwds);
}

/* There are two slot dispatch functions for tp_getattro.

   - _Ty_slot_tp_getattro() is used when __getattribute__ is overridden
     but no __getattr__ hook is present;

   - _Ty_slot_tp_getattr_hook() is used when a __getattr__ hook is present.

   The code in update_one_slot() always installs _Ty_slot_tp_getattr_hook();
   this detects the absence of __getattr__ and then installs the simpler
   slot if necessary. */

TyObject *
_Ty_slot_tp_getattro(TyObject *self, TyObject *name)
{
    TyObject *stack[2] = {self, name};
    return vectorcall_method(&_Ty_ID(__getattribute__), stack, 2);
}

static inline TyObject *
call_attribute(TyObject *self, TyObject *attr, TyObject *name)
{
    TyObject *res, *descr = NULL;

    if (_TyType_HasFeature(Ty_TYPE(attr), Ty_TPFLAGS_METHOD_DESCRIPTOR)) {
        TyObject *args[] = { self, name };
        res = PyObject_Vectorcall(attr, args, 2, NULL);
        return res;
    }

    descrgetfunc f = Ty_TYPE(attr)->tp_descr_get;

    if (f != NULL) {
        descr = f(attr, self, (TyObject *)(Ty_TYPE(self)));
        if (descr == NULL)
            return NULL;
        else
            attr = descr;
    }
    res = PyObject_CallOneArg(attr, name);
    Ty_XDECREF(descr);
    return res;
}

TyObject *
_Ty_slot_tp_getattr_hook(TyObject *self, TyObject *name)
{
    TyTypeObject *tp = Ty_TYPE(self);
    TyObject *getattr, *getattribute, *res;

    /* speed hack: we could use lookup_maybe, but that would resolve the
       method fully for each attribute lookup for classes with
       __getattr__, even when the attribute is present. So we use
       _TyType_LookupRef and create the method only when needed, with
       call_attribute. */
    getattr = _TyType_LookupRef(tp, &_Ty_ID(__getattr__));
    if (getattr == NULL) {
        /* No __getattr__ hook: use a simpler dispatcher */
        tp->tp_getattro = _Ty_slot_tp_getattro;
        return _Ty_slot_tp_getattro(self, name);
    }
    /* speed hack: we could use lookup_maybe, but that would resolve the
       method fully for each attribute lookup for classes with
       __getattr__, even when self has the default __getattribute__
       method. So we use _TyType_LookupRef and create the method only when
       needed, with call_attribute. */
    getattribute = _TyType_LookupRef(tp, &_Ty_ID(__getattribute__));
    if (getattribute == NULL ||
        (Ty_IS_TYPE(getattribute, &PyWrapperDescr_Type) &&
         ((PyWrapperDescrObject *)getattribute)->d_wrapped ==
             (void *)PyObject_GenericGetAttr)) {
        Ty_XDECREF(getattribute);
        res = _TyObject_GenericGetAttrWithDict(self, name, NULL, 1);
        /* if res == NULL with no exception set, then it must be an
           AttributeError suppressed by us. */
        if (res == NULL && !TyErr_Occurred()) {
            res = call_attribute(self, getattr, name);
        }
    }
    else {
        res = call_attribute(self, getattribute, name);
        Ty_DECREF(getattribute);
        if (res == NULL && TyErr_ExceptionMatches(TyExc_AttributeError)) {
            TyErr_Clear();
            res = call_attribute(self, getattr, name);
        }
    }

    Ty_DECREF(getattr);
    return res;
}

static int
slot_tp_setattro(TyObject *self, TyObject *name, TyObject *value)
{
    TyObject *stack[3];
    TyObject *res;

    stack[0] = self;
    stack[1] = name;
    if (value == NULL) {
        res = vectorcall_method(&_Ty_ID(__delattr__), stack, 2);
    }
    else {
        stack[2] = value;
        res = vectorcall_method(&_Ty_ID(__setattr__), stack, 3);
    }
    if (res == NULL)
        return -1;
    Ty_DECREF(res);
    return 0;
}

static TyObject *name_op[] = {
    &_Ty_ID(__lt__),
    &_Ty_ID(__le__),
    &_Ty_ID(__eq__),
    &_Ty_ID(__ne__),
    &_Ty_ID(__gt__),
    &_Ty_ID(__ge__),
};

static TyObject *
slot_tp_richcompare(TyObject *self, TyObject *other, int op)
{
    TyObject *res = _TyObject_MaybeCallSpecialOneArg(self, name_op[op], other);
    if (res == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        Py_RETURN_NOTIMPLEMENTED;
    }
    return res;
}

static int
has_dunder_getitem(TyObject *self)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyCStackRef c_ref;
    _TyThreadState_PushCStackRef(tstate, &c_ref);
    lookup_maybe_method(self, &_Ty_ID(__getitem__), &c_ref.ref);
    int has_dunder_getitem = !PyStackRef_IsNull(c_ref.ref);
    _TyThreadState_PopCStackRef(tstate, &c_ref);
    return has_dunder_getitem;
}

static TyObject *
slot_tp_iter(TyObject *self)
{
    int attr_is_none = 0;
    TyObject *res = maybe_call_special_no_args(self, &_Ty_ID(__iter__),
                                               &attr_is_none);
    if (res != NULL) {
        return res;
    }
    else if (TyErr_Occurred()) {
        return NULL;
    }
    else if (attr_is_none || !has_dunder_getitem(self)) {
        TyErr_Format(TyExc_TypeError,
            "'%.200s' object is not iterable",
            Ty_TYPE(self)->tp_name);
        return NULL;
    }
    return TySeqIter_New(self);
}

static TyObject *
slot_tp_iternext(TyObject *self)
{
    TyObject *stack[1] = {self};
    return vectorcall_method(&_Ty_ID(__next__), stack, 1);
}

static TyObject *
slot_tp_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    TyTypeObject *tp = Ty_TYPE(self);
    TyObject *get;

    get = _TyType_LookupRef(tp, &_Ty_ID(__get__));
    if (get == NULL) {
        /* Avoid further slowdowns */
        if (tp->tp_descr_get == slot_tp_descr_get)
            tp->tp_descr_get = NULL;
        return Ty_NewRef(self);
    }
    if (obj == NULL)
        obj = Ty_None;
    if (type == NULL)
        type = Ty_None;
    TyObject *stack[3] = {self, obj, type};
    TyObject *res = PyObject_Vectorcall(get, stack, 3, NULL);
    Ty_DECREF(get);
    return res;
}

static int
slot_tp_descr_set(TyObject *self, TyObject *target, TyObject *value)
{
    TyObject* stack[3];
    TyObject *res;

    stack[0] = self;
    stack[1] = target;
    if (value == NULL) {
        res = vectorcall_method(&_Ty_ID(__delete__), stack, 2);
    }
    else {
        stack[2] = value;
        res = vectorcall_method(&_Ty_ID(__set__), stack, 3);
    }
    if (res == NULL)
        return -1;
    Ty_DECREF(res);
    return 0;
}

static int
slot_tp_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyObject *res = call_method(self, &_Ty_ID(__init__), args, kwds);
    if (res == NULL)
        return -1;
    if (res != Ty_None) {
        TyErr_Format(TyExc_TypeError,
                     "__init__() should return None, not '%.200s'",
                     Ty_TYPE(res)->tp_name);
        Ty_DECREF(res);
        return -1;
    }
    Ty_DECREF(res);
    return 0;
}

static TyObject *
slot_tp_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *func, *result;

    func = PyObject_GetAttr((TyObject *)type, &_Ty_ID(__new__));
    if (func == NULL) {
        return NULL;
    }

    result = _TyObject_Call_Prepend(tstate, func, (TyObject *)type, args, kwds);
    Ty_DECREF(func);
    return result;
}

static void
slot_tp_finalize(TyObject *self)
{
    /* Save the current exception, if any. */
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *exc = _TyErr_GetRaisedException(tstate);

    _PyCStackRef cref;
    _TyThreadState_PushCStackRef(tstate, &cref);

    /* Execute __del__ method, if any. */
    int unbound = lookup_maybe_method(self, &_Ty_ID(__del__), &cref.ref);
    if (unbound >= 0) {
        TyObject *del = PyStackRef_AsPyObjectBorrow(cref.ref);
        TyObject *res = call_unbound_noarg(unbound, del, self);
        if (res == NULL) {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "calling deallocator %R", del);
        }
        else {
            Ty_DECREF(res);
        }
    }

    _TyThreadState_PopCStackRef(tstate, &cref);

    /* Restore the saved exception. */
    _TyErr_SetRaisedException(tstate, exc);
}

typedef struct _PyBufferWrapper {
    PyObject_HEAD
    TyObject *mv;
    TyObject *obj;
} PyBufferWrapper;

#define PyBufferWrapper_CAST(op)    ((PyBufferWrapper *)(op))

static int
bufferwrapper_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyBufferWrapper *self = PyBufferWrapper_CAST(op);
    Ty_VISIT(self->mv);
    Ty_VISIT(self->obj);
    return 0;
}

static void
bufferwrapper_dealloc(TyObject *self)
{
    PyBufferWrapper *bw = PyBufferWrapper_CAST(self);

    _TyObject_GC_UNTRACK(self);
    Ty_XDECREF(bw->mv);
    Ty_XDECREF(bw->obj);
    Ty_TYPE(self)->tp_free(self);
}

static void
bufferwrapper_releasebuf(TyObject *self, Ty_buffer *view)
{
    PyBufferWrapper *bw = PyBufferWrapper_CAST(self);

    if (bw->mv == NULL || bw->obj == NULL) {
        // Already released
        return;
    }

    TyObject *mv = bw->mv;
    TyObject *obj = bw->obj;

    assert(TyMemoryView_Check(mv));
    Ty_TYPE(mv)->tp_as_buffer->bf_releasebuffer(mv, view);
    // We only need to call bf_releasebuffer if it's a Python function. If it's a C
    // bf_releasebuf, it will be called when the memoryview is released.
    if (((PyMemoryViewObject *)mv)->view.obj != obj
            && Ty_TYPE(obj)->tp_as_buffer != NULL
            && Ty_TYPE(obj)->tp_as_buffer->bf_releasebuffer == slot_bf_releasebuffer) {
        releasebuffer_call_python(obj, view);
    }

    Ty_CLEAR(bw->mv);
    Ty_CLEAR(bw->obj);
}

static PyBufferProcs bufferwrapper_as_buffer = {
    .bf_releasebuffer = bufferwrapper_releasebuf,
};


TyTypeObject _PyBufferWrapper_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "_buffer_wrapper",
    .tp_basicsize = sizeof(PyBufferWrapper),
    .tp_alloc = TyType_GenericAlloc,
    .tp_free = PyObject_GC_Del,
    .tp_traverse = bufferwrapper_traverse,
    .tp_dealloc = bufferwrapper_dealloc,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_as_buffer = &bufferwrapper_as_buffer,
};

static int
slot_bf_getbuffer(TyObject *self, Ty_buffer *buffer, int flags)
{
    TyObject *flags_obj = TyLong_FromLong(flags);
    if (flags_obj == NULL) {
        return -1;
    }
    PyBufferWrapper *wrapper = NULL;
    TyObject *stack[2] = {self, flags_obj};
    TyObject *ret = vectorcall_method(&_Ty_ID(__buffer__), stack, 2);
    if (ret == NULL) {
        goto fail;
    }
    if (!TyMemoryView_Check(ret)) {
        TyErr_Format(TyExc_TypeError,
                     "__buffer__ returned non-memoryview object");
        goto fail;
    }

    if (PyObject_GetBuffer(ret, buffer, flags) < 0) {
        goto fail;
    }
    assert(buffer->obj == ret);

    wrapper = PyObject_GC_New(PyBufferWrapper, &_PyBufferWrapper_Type);
    if (wrapper == NULL) {
        goto fail;
    }
    wrapper->mv = ret;
    wrapper->obj = Ty_NewRef(self);
    _TyObject_GC_TRACK(wrapper);

    buffer->obj = (TyObject *)wrapper;
    Ty_DECREF(ret);
    Ty_DECREF(flags_obj);
    return 0;

fail:
    Ty_XDECREF(wrapper);
    Ty_XDECREF(ret);
    Ty_DECREF(flags_obj);
    return -1;
}

static releasebufferproc
releasebuffer_maybe_call_super_unlocked(TyObject *self, Ty_buffer *buffer)
{
    TyTypeObject *self_type = Ty_TYPE(self);
    TyObject *mro = lookup_tp_mro(self_type);
    if (mro == NULL) {
        return NULL;
    }

    assert(TyTuple_Check(mro));
    Ty_ssize_t n = TyTuple_GET_SIZE(mro);
    Ty_ssize_t i;

    /* No need to check the last one: it's gonna be skipped anyway.  */
    for (i = 0;  i < n -1; i++) {
        if ((TyObject *)(self_type) == TyTuple_GET_ITEM(mro, i))
            break;
    }
    i++;  /* skip self_type */
    if (i >= n)
        return NULL;

    for (; i < n; i++) {
        TyObject *obj = TyTuple_GET_ITEM(mro, i);
        if (!TyType_Check(obj)) {
            continue;
        }
        TyTypeObject *base_type = (TyTypeObject *)obj;
        if (base_type->tp_as_buffer != NULL
            && base_type->tp_as_buffer->bf_releasebuffer != NULL
            && base_type->tp_as_buffer->bf_releasebuffer != slot_bf_releasebuffer) {
            return base_type->tp_as_buffer->bf_releasebuffer;
        }
    }

    return NULL;
}

static void
releasebuffer_maybe_call_super(TyObject *self, Ty_buffer *buffer)
{
    releasebufferproc base_releasebuffer;

    BEGIN_TYPE_LOCK();
    base_releasebuffer = releasebuffer_maybe_call_super_unlocked(self, buffer);
    END_TYPE_LOCK();

    if (base_releasebuffer != NULL) {
        base_releasebuffer(self, buffer);
    }
}

static void
releasebuffer_call_python(TyObject *self, Ty_buffer *buffer)
{
    // bf_releasebuffer may be called while an exception is already active.
    // We have no way to report additional errors up the stack, because
    // this slot returns void, so we simply stash away the active exception
    // and restore it after the call to Python returns.
    TyObject *exc = TyErr_GetRaisedException();

    TyObject *mv;
    bool is_buffer_wrapper = Ty_TYPE(buffer->obj) == &_PyBufferWrapper_Type;
    if (is_buffer_wrapper) {
        // Make sure we pass the same memoryview to
        // __release_buffer__() that __buffer__() returned.
        PyBufferWrapper *bw = (PyBufferWrapper *)buffer->obj;
        if (bw->mv == NULL) {
            goto end;
        }
        mv = Ty_NewRef(bw->mv);
    }
    else {
        // This means we are not dealing with a memoryview returned
        // from a Python __buffer__ function.
        mv = TyMemoryView_FromBuffer(buffer);
        if (mv == NULL) {
            TyErr_FormatUnraisable("Exception ignored in bf_releasebuffer of %s", Ty_TYPE(self)->tp_name);
            goto end;
        }
        // Set the memoryview to restricted mode, which forbids
        // users from saving any reference to the underlying buffer
        // (e.g., by doing .cast()). This is necessary to ensure
        // no Python code retains a reference to the to-be-released
        // buffer.
        ((PyMemoryViewObject *)mv)->flags |= _Ty_MEMORYVIEW_RESTRICTED;
    }
    TyObject *stack[2] = {self, mv};
    TyObject *ret = vectorcall_method(&_Ty_ID(__release_buffer__), stack, 2);
    if (ret == NULL) {
        TyErr_FormatUnraisable("Exception ignored in __release_buffer__ of %s", Ty_TYPE(self)->tp_name);
    }
    else {
        Ty_DECREF(ret);
    }
    if (!is_buffer_wrapper) {
        TyObject *res = PyObject_CallMethodNoArgs(mv, &_Ty_ID(release));
        if (res == NULL) {
            TyErr_FormatUnraisable("Exception ignored in bf_releasebuffer of %s", Ty_TYPE(self)->tp_name);
        }
        else {
            Ty_DECREF(res);
        }
    }
    Ty_DECREF(mv);
end:
    assert(!TyErr_Occurred());

    TyErr_SetRaisedException(exc);
}

/*
 * bf_releasebuffer is very delicate, because we need to ensure that
 * C bf_releasebuffer slots are called correctly (or we'll leak memory),
 * but we cannot trust any __release_buffer__ implemented in Python to
 * do so correctly. Therefore, if a base class has a C bf_releasebuffer
 * slot, we call it directly here. That is safe because this function
 * only gets called from C callers of the bf_releasebuffer slot. Python
 * code that calls __release_buffer__ directly instead goes through
 * wrap_releasebuffer(), which doesn't call the bf_releasebuffer slot
 * directly but instead simply releases the associated memoryview.
 */
static void
slot_bf_releasebuffer(TyObject *self, Ty_buffer *buffer)
{
    releasebuffer_call_python(self, buffer);
    releasebuffer_maybe_call_super(self, buffer);
}

static TyObject *
slot_am_generic(TyObject *self, TyObject *name)
{
    TyObject *res = _TyObject_MaybeCallSpecialNoArgs(self, name);
    if (res == NULL && !TyErr_Occurred()) {
        TyErr_Format(TyExc_AttributeError,
            "object %.50s does not have %U method",
            Ty_TYPE(self)->tp_name, name);
    }
    return res;
}

static TyObject *
slot_am_await(TyObject *self)
{
    return slot_am_generic(self, &_Ty_ID(__await__));
}

static TyObject *
slot_am_aiter(TyObject *self)
{
    return slot_am_generic(self, &_Ty_ID(__aiter__));
}

static TyObject *
slot_am_anext(TyObject *self)
{
    return slot_am_generic(self, &_Ty_ID(__anext__));
}

/*
Table mapping __foo__ names to tp_foo offsets and slot_tp_foo wrapper functions.

The table is ordered by offsets relative to the 'PyHeapTypeObject' structure,
which incorporates the additional structures used for numbers, sequences and
mappings.  Note that multiple names may map to the same slot (e.g. __eq__,
__ne__ etc. all map to tp_richcompare) and one name may map to multiple slots
(e.g. __str__ affects tp_str as well as tp_repr). The table is terminated with
an all-zero entry.
*/

#undef TPSLOT
#undef FLSLOT
#undef BUFSLOT
#undef AMSLOT
#undef ETSLOT
#undef SQSLOT
#undef MPSLOT
#undef NBSLOT
#undef UNSLOT
#undef IBSLOT
#undef BINSLOT
#undef RBINSLOT

#define TPSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    {#NAME, offsetof(TyTypeObject, SLOT), (void *)(FUNCTION), WRAPPER, \
     TyDoc_STR(DOC), .name_strobj = &_Ty_ID(NAME)}
#define FLSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC, FLAGS) \
    {#NAME, offsetof(TyTypeObject, SLOT), (void *)(FUNCTION), WRAPPER, \
     TyDoc_STR(DOC), FLAGS, .name_strobj = &_Ty_ID(NAME) }
#define ETSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    {#NAME, offsetof(PyHeapTypeObject, SLOT), (void *)(FUNCTION), WRAPPER, \
     TyDoc_STR(DOC), .name_strobj = &_Ty_ID(NAME) }
#define BUFSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_buffer.SLOT, FUNCTION, WRAPPER, DOC)
#define AMSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_async.SLOT, FUNCTION, WRAPPER, DOC)
#define SQSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_sequence.SLOT, FUNCTION, WRAPPER, DOC)
#define MPSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_mapping.SLOT, FUNCTION, WRAPPER, DOC)
#define NBSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, WRAPPER, DOC)
#define UNSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, WRAPPER, \
           #NAME "($self, /)\n--\n\n" DOC)
#define IBSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, WRAPPER, \
           #NAME "($self, value, /)\n--\n\nReturn self" DOC "value.")
#define BINSLOT(NAME, SLOT, FUNCTION, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, wrap_binaryfunc_l, \
           #NAME "($self, value, /)\n--\n\nReturn self" DOC "value.")
#define RBINSLOT(NAME, SLOT, FUNCTION, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, wrap_binaryfunc_r, \
           #NAME "($self, value, /)\n--\n\nReturn value" DOC "self.")
#define BINSLOTNOTINFIX(NAME, SLOT, FUNCTION, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, wrap_binaryfunc_l, \
           #NAME "($self, value, /)\n--\n\n" DOC)
#define RBINSLOTNOTINFIX(NAME, SLOT, FUNCTION, DOC) \
    ETSLOT(NAME, as_number.SLOT, FUNCTION, wrap_binaryfunc_r, \
           #NAME "($self, value, /)\n--\n\n" DOC)

static pytype_slotdef slotdefs[] = {
    TPSLOT(__getattribute__, tp_getattr, NULL, NULL, ""),
    TPSLOT(__getattr__, tp_getattr, NULL, NULL, ""),
    TPSLOT(__setattr__, tp_setattr, NULL, NULL, ""),
    TPSLOT(__delattr__, tp_setattr, NULL, NULL, ""),
    TPSLOT(__repr__, tp_repr, slot_tp_repr, wrap_unaryfunc,
           "__repr__($self, /)\n--\n\nReturn repr(self)."),
    TPSLOT(__hash__, tp_hash, slot_tp_hash, wrap_hashfunc,
           "__hash__($self, /)\n--\n\nReturn hash(self)."),
    FLSLOT(__call__, tp_call, slot_tp_call,
           _Ty_FUNC_CAST(wrapperfunc, wrap_call),
           "__call__($self, /, *args, **kwargs)\n--\n\nCall self as a function.",
           PyWrapperFlag_KEYWORDS),
    TPSLOT(__str__, tp_str, slot_tp_str, wrap_unaryfunc,
           "__str__($self, /)\n--\n\nReturn str(self)."),
    TPSLOT(__getattribute__, tp_getattro, _Ty_slot_tp_getattr_hook,
           wrap_binaryfunc,
           "__getattribute__($self, name, /)\n--\n\nReturn getattr(self, name)."),
    TPSLOT(__getattr__, tp_getattro, _Ty_slot_tp_getattr_hook, NULL,
           "__getattr__($self, name, /)\n--\n\nImplement getattr(self, name)."),
    TPSLOT(__setattr__, tp_setattro, slot_tp_setattro, wrap_setattr,
           "__setattr__($self, name, value, /)\n--\n\nImplement setattr(self, name, value)."),
    TPSLOT(__delattr__, tp_setattro, slot_tp_setattro, wrap_delattr,
           "__delattr__($self, name, /)\n--\n\nImplement delattr(self, name)."),
    TPSLOT(__lt__, tp_richcompare, slot_tp_richcompare, richcmp_lt,
           "__lt__($self, value, /)\n--\n\nReturn self<value."),
    TPSLOT(__le__, tp_richcompare, slot_tp_richcompare, richcmp_le,
           "__le__($self, value, /)\n--\n\nReturn self<=value."),
    TPSLOT(__eq__, tp_richcompare, slot_tp_richcompare, richcmp_eq,
           "__eq__($self, value, /)\n--\n\nReturn self==value."),
    TPSLOT(__ne__, tp_richcompare, slot_tp_richcompare, richcmp_ne,
           "__ne__($self, value, /)\n--\n\nReturn self!=value."),
    TPSLOT(__gt__, tp_richcompare, slot_tp_richcompare, richcmp_gt,
           "__gt__($self, value, /)\n--\n\nReturn self>value."),
    TPSLOT(__ge__, tp_richcompare, slot_tp_richcompare, richcmp_ge,
           "__ge__($self, value, /)\n--\n\nReturn self>=value."),
    TPSLOT(__iter__, tp_iter, slot_tp_iter, wrap_unaryfunc,
           "__iter__($self, /)\n--\n\nImplement iter(self)."),
    TPSLOT(__next__, tp_iternext, slot_tp_iternext, wrap_next,
           "__next__($self, /)\n--\n\nImplement next(self)."),
    TPSLOT(__get__, tp_descr_get, slot_tp_descr_get, wrap_descr_get,
           "__get__($self, instance, owner=None, /)\n--\n\nReturn an attribute of instance, which is of type owner."),
    TPSLOT(__set__, tp_descr_set, slot_tp_descr_set, wrap_descr_set,
           "__set__($self, instance, value, /)\n--\n\nSet an attribute of instance to value."),
    TPSLOT(__delete__, tp_descr_set, slot_tp_descr_set,
           wrap_descr_delete,
           "__delete__($self, instance, /)\n--\n\nDelete an attribute of instance."),
    FLSLOT(__init__, tp_init, slot_tp_init,
           _Ty_FUNC_CAST(wrapperfunc, wrap_init),
           "__init__($self, /, *args, **kwargs)\n--\n\n"
           "Initialize self.  See help(type(self)) for accurate signature.",
           PyWrapperFlag_KEYWORDS),
    TPSLOT(__new__, tp_new, slot_tp_new, NULL,
           "__new__(type, /, *args, **kwargs)\n--\n\n"
           "Create and return new object.  See help(type) for accurate signature."),
    TPSLOT(__del__, tp_finalize, slot_tp_finalize, (wrapperfunc)wrap_del,
           "__del__($self, /)\n--\n\n"
           "Called when the instance is about to be destroyed."),

    BUFSLOT(__buffer__, bf_getbuffer, slot_bf_getbuffer, wrap_buffer,
            "__buffer__($self, flags, /)\n--\n\n"
            "Return a buffer object that exposes the underlying memory of the object."),
    BUFSLOT(__release_buffer__, bf_releasebuffer, slot_bf_releasebuffer, wrap_releasebuffer,
            "__release_buffer__($self, buffer, /)\n--\n\n"
            "Release the buffer object that exposes the underlying memory of the object."),

    AMSLOT(__await__, am_await, slot_am_await, wrap_unaryfunc,
           "__await__($self, /)\n--\n\nReturn an iterator to be used in await expression."),
    AMSLOT(__aiter__, am_aiter, slot_am_aiter, wrap_unaryfunc,
           "__aiter__($self, /)\n--\n\nReturn an awaitable, that resolves in asynchronous iterator."),
    AMSLOT(__anext__, am_anext, slot_am_anext, wrap_unaryfunc,
           "__anext__($self, /)\n--\n\nReturn a value or raise StopAsyncIteration."),

    BINSLOT(__add__, nb_add, slot_nb_add,
           "+"),
    RBINSLOT(__radd__, nb_add, slot_nb_add,
           "+"),
    BINSLOT(__sub__, nb_subtract, slot_nb_subtract,
           "-"),
    RBINSLOT(__rsub__, nb_subtract, slot_nb_subtract,
           "-"),
    BINSLOT(__mul__, nb_multiply, slot_nb_multiply,
           "*"),
    RBINSLOT(__rmul__, nb_multiply, slot_nb_multiply,
           "*"),
    BINSLOT(__mod__, nb_remainder, slot_nb_remainder,
           "%"),
    RBINSLOT(__rmod__, nb_remainder, slot_nb_remainder,
           "%"),
    BINSLOTNOTINFIX(__divmod__, nb_divmod, slot_nb_divmod,
           "Return divmod(self, value)."),
    RBINSLOTNOTINFIX(__rdivmod__, nb_divmod, slot_nb_divmod,
           "Return divmod(value, self)."),
    NBSLOT(__pow__, nb_power, slot_nb_power, wrap_ternaryfunc,
           "__pow__($self, value, mod=None, /)\n--\n\nReturn pow(self, value, mod)."),
    NBSLOT(__rpow__, nb_power, slot_nb_power, wrap_ternaryfunc_r,
           "__rpow__($self, value, mod=None, /)\n--\n\nReturn pow(value, self, mod)."),
    UNSLOT(__neg__, nb_negative, slot_nb_negative, wrap_unaryfunc, "-self"),
    UNSLOT(__pos__, nb_positive, slot_nb_positive, wrap_unaryfunc, "+self"),
    UNSLOT(__abs__, nb_absolute, slot_nb_absolute, wrap_unaryfunc,
           "abs(self)"),
    UNSLOT(__bool__, nb_bool, slot_nb_bool, wrap_inquirypred,
           "True if self else False"),
    UNSLOT(__invert__, nb_invert, slot_nb_invert, wrap_unaryfunc, "~self"),
    BINSLOT(__lshift__, nb_lshift, slot_nb_lshift, "<<"),
    RBINSLOT(__rlshift__, nb_lshift, slot_nb_lshift, "<<"),
    BINSLOT(__rshift__, nb_rshift, slot_nb_rshift, ">>"),
    RBINSLOT(__rrshift__, nb_rshift, slot_nb_rshift, ">>"),
    BINSLOT(__and__, nb_and, slot_nb_and, "&"),
    RBINSLOT(__rand__, nb_and, slot_nb_and, "&"),
    BINSLOT(__xor__, nb_xor, slot_nb_xor, "^"),
    RBINSLOT(__rxor__, nb_xor, slot_nb_xor, "^"),
    BINSLOT(__or__, nb_or, slot_nb_or, "|"),
    RBINSLOT(__ror__, nb_or, slot_nb_or, "|"),
    UNSLOT(__int__, nb_int, slot_nb_int, wrap_unaryfunc,
           "int(self)"),
    UNSLOT(__float__, nb_float, slot_nb_float, wrap_unaryfunc,
           "float(self)"),
    IBSLOT(__iadd__, nb_inplace_add, slot_nb_inplace_add,
           wrap_binaryfunc, "+="),
    IBSLOT(__isub__, nb_inplace_subtract, slot_nb_inplace_subtract,
           wrap_binaryfunc, "-="),
    IBSLOT(__imul__, nb_inplace_multiply, slot_nb_inplace_multiply,
           wrap_binaryfunc, "*="),
    IBSLOT(__imod__, nb_inplace_remainder, slot_nb_inplace_remainder,
           wrap_binaryfunc, "%="),
    IBSLOT(__ipow__, nb_inplace_power, slot_nb_inplace_power,
           wrap_ternaryfunc, "**="),
    IBSLOT(__ilshift__, nb_inplace_lshift, slot_nb_inplace_lshift,
           wrap_binaryfunc, "<<="),
    IBSLOT(__irshift__, nb_inplace_rshift, slot_nb_inplace_rshift,
           wrap_binaryfunc, ">>="),
    IBSLOT(__iand__, nb_inplace_and, slot_nb_inplace_and,
           wrap_binaryfunc, "&="),
    IBSLOT(__ixor__, nb_inplace_xor, slot_nb_inplace_xor,
           wrap_binaryfunc, "^="),
    IBSLOT(__ior__, nb_inplace_or, slot_nb_inplace_or,
           wrap_binaryfunc, "|="),
    BINSLOT(__floordiv__, nb_floor_divide, slot_nb_floor_divide, "//"),
    RBINSLOT(__rfloordiv__, nb_floor_divide, slot_nb_floor_divide, "//"),
    BINSLOT(__truediv__, nb_true_divide, slot_nb_true_divide, "/"),
    RBINSLOT(__rtruediv__, nb_true_divide, slot_nb_true_divide, "/"),
    IBSLOT(__ifloordiv__, nb_inplace_floor_divide,
           slot_nb_inplace_floor_divide, wrap_binaryfunc, "//="),
    IBSLOT(__itruediv__, nb_inplace_true_divide,
           slot_nb_inplace_true_divide, wrap_binaryfunc, "/="),
    NBSLOT(__index__, nb_index, slot_nb_index, wrap_unaryfunc,
           "__index__($self, /)\n--\n\n"
           "Return self converted to an integer, if self is suitable "
           "for use as an index into a list."),
    BINSLOT(__matmul__, nb_matrix_multiply, slot_nb_matrix_multiply,
            "@"),
    RBINSLOT(__rmatmul__, nb_matrix_multiply, slot_nb_matrix_multiply,
             "@"),
    IBSLOT(__imatmul__, nb_inplace_matrix_multiply, slot_nb_inplace_matrix_multiply,
           wrap_binaryfunc, "@="),
    MPSLOT(__len__, mp_length, slot_mp_length, wrap_lenfunc,
           "__len__($self, /)\n--\n\nReturn len(self)."),
    MPSLOT(__getitem__, mp_subscript, slot_mp_subscript,
           wrap_binaryfunc,
           "__getitem__($self, key, /)\n--\n\nReturn self[key]."),
    MPSLOT(__setitem__, mp_ass_subscript, slot_mp_ass_subscript,
           wrap_objobjargproc,
           "__setitem__($self, key, value, /)\n--\n\nSet self[key] to value."),
    MPSLOT(__delitem__, mp_ass_subscript, slot_mp_ass_subscript,
           wrap_delitem,
           "__delitem__($self, key, /)\n--\n\nDelete self[key]."),

    SQSLOT(__len__, sq_length, slot_sq_length, wrap_lenfunc,
           "__len__($self, /)\n--\n\nReturn len(self)."),
    /* Heap types defining __add__/__mul__ have sq_concat/sq_repeat == NULL.
       The logic in abstract.c always falls back to nb_add/nb_multiply in
       this case.  Defining both the nb_* and the sq_* slots to call the
       user-defined methods has unexpected side-effects, as shown by
       test_descr.notimplemented() */
    SQSLOT(__add__, sq_concat, NULL, wrap_binaryfunc,
           "__add__($self, value, /)\n--\n\nReturn self+value."),
    SQSLOT(__mul__, sq_repeat, NULL, wrap_indexargfunc,
           "__mul__($self, value, /)\n--\n\nReturn self*value."),
    SQSLOT(__rmul__, sq_repeat, NULL, wrap_indexargfunc,
           "__rmul__($self, value, /)\n--\n\nReturn value*self."),
    SQSLOT(__getitem__, sq_item, slot_sq_item, wrap_sq_item,
           "__getitem__($self, key, /)\n--\n\nReturn self[key]."),
    SQSLOT(__setitem__, sq_ass_item, slot_sq_ass_item, wrap_sq_setitem,
           "__setitem__($self, key, value, /)\n--\n\nSet self[key] to value."),
    SQSLOT(__delitem__, sq_ass_item, slot_sq_ass_item, wrap_sq_delitem,
           "__delitem__($self, key, /)\n--\n\nDelete self[key]."),
    SQSLOT(__contains__, sq_contains, slot_sq_contains, wrap_objobjproc,
           "__contains__($self, key, /)\n--\n\nReturn bool(key in self)."),
    SQSLOT(__iadd__, sq_inplace_concat, NULL,
           wrap_binaryfunc,
           "__iadd__($self, value, /)\n--\n\nImplement self+=value."),
    SQSLOT(__imul__, sq_inplace_repeat, NULL,
           wrap_indexargfunc,
           "__imul__($self, value, /)\n--\n\nImplement self*=value."),

    {NULL}
};

/* Given a type pointer and an offset gotten from a slotdef entry, return a
   pointer to the actual slot.  This is not quite the same as simply adding
   the offset to the type pointer, since it takes care to indirect through the
   proper indirection pointer (as_buffer, etc.); it returns NULL if the
   indirection pointer is NULL. */
static void **
slotptr(TyTypeObject *type, int ioffset)
{
    char *ptr;
    long offset = ioffset;

    /* Note: this depends on the order of the members of PyHeapTypeObject! */
    assert(offset >= 0);
    assert((size_t)offset < offsetof(PyHeapTypeObject, ht_name));
    if ((size_t)offset >= offsetof(PyHeapTypeObject, as_buffer)) {
        ptr = (char *)type->tp_as_buffer;
        offset -= offsetof(PyHeapTypeObject, as_buffer);
    }
    else if ((size_t)offset >= offsetof(PyHeapTypeObject, as_sequence)) {
        ptr = (char *)type->tp_as_sequence;
        offset -= offsetof(PyHeapTypeObject, as_sequence);
    }
    else if ((size_t)offset >= offsetof(PyHeapTypeObject, as_mapping)) {
        ptr = (char *)type->tp_as_mapping;
        offset -= offsetof(PyHeapTypeObject, as_mapping);
    }
    else if ((size_t)offset >= offsetof(PyHeapTypeObject, as_number)) {
        ptr = (char *)type->tp_as_number;
        offset -= offsetof(PyHeapTypeObject, as_number);
    }
    else if ((size_t)offset >= offsetof(PyHeapTypeObject, as_async)) {
        ptr = (char *)type->tp_as_async;
        offset -= offsetof(PyHeapTypeObject, as_async);
    }
    else {
        ptr = (char *)type;
    }
    if (ptr != NULL)
        ptr += offset;
    return (void **)ptr;
}

/* Return a slot pointer for a given name, but ONLY if the attribute has
   exactly one slot function.  The name must be an interned string. */
static void **
resolve_slotdups(TyTypeObject *type, TyObject *name)
{
    /* XXX Maybe this could be optimized more -- but is it worth it? */

    /* pname and ptrs act as a little cache */
    TyInterpreterState *interp = _TyInterpreterState_GET();
#define pname _Ty_INTERP_CACHED_OBJECT(interp, type_slots_pname)
#define ptrs _Ty_INTERP_CACHED_OBJECT(interp, type_slots_ptrs)
    pytype_slotdef *p, **pp;
    void **res, **ptr;

    if (pname != name) {
        /* Collect all slotdefs that match name into ptrs. */
        pname = name;
        pp = ptrs;
        for (p = slotdefs; p->name_strobj; p++) {
            if (p->name_strobj == name)
                *pp++ = p;
        }
        *pp = NULL;
    }

    /* Look in all slots of the type matching the name. If exactly one of these
       has a filled-in slot, return a pointer to that slot.
       Otherwise, return NULL. */
    res = NULL;
    for (pp = ptrs; *pp; pp++) {
        ptr = slotptr(type, (*pp)->offset);
        if (ptr == NULL || *ptr == NULL)
            continue;
        if (res != NULL)
            return NULL;
        res = ptr;
    }
    return res;
#undef pname
#undef ptrs
}


/* Common code for update_slots_callback() and fixup_slot_dispatchers().
 *
 * This is meant to set a "slot" like type->tp_repr or
 * type->tp_as_sequence->sq_concat by looking up special methods like
 * __repr__ or __add__. The opposite (adding special methods from slots) is
 * done by add_operators(), called from TyType_Ready(). Since update_one_slot()
 * calls TyType_Ready() if needed, the special methods are already in place.
 *
 * The special methods corresponding to each slot are defined in the "slotdef"
 * array. Note that one slot may correspond to multiple special methods and vice
 * versa. For example, tp_richcompare uses 6 methods __lt__, ..., __ge__ and
 * tp_as_number->nb_add uses __add__ and __radd__. In the other direction,
 * __add__ is used by the number and sequence protocols and __getitem__ by the
 * sequence and mapping protocols. This causes a lot of complications.
 *
 * In detail, update_one_slot() does the following:
 *
 * First of all, if the slot in question does not exist, return immediately.
 * This can happen for example if it's tp_as_number->nb_add but tp_as_number
 * is NULL.
 *
 * For the given slot, we loop over all the special methods with a name
 * corresponding to that slot (for example, for tp_descr_set, this would be
 * __set__ and __delete__) and we look up these names in the MRO of the type.
 * If we don't find any special method, the slot is set to NULL (regardless of
 * what was in the slot before).
 *
 * Suppose that we find exactly one special method. If it's a wrapper_descriptor
 * (i.e. a special method calling a slot, for example str.__repr__ which calls
 * the tp_repr for the 'str' class) with the correct name ("__repr__" for
 * tp_repr), for the right class, calling the right wrapper C function (like
 * wrap_unaryfunc for tp_repr), then the slot is set to the slot that the
 * wrapper_descriptor originally wrapped. For example, a class inheriting
 * from 'str' and not redefining __repr__ will have tp_repr set to the tp_repr
 * of 'str'.
 * In all other cases where the special method exists, the slot is set to a
 * wrapper calling the special method. There is one exception: if the special
 * method is a wrapper_descriptor with the correct name but the type has
 * precisely one slot set for that name and that slot is not the one that we
 * are updating, then NULL is put in the slot (this exception is the only place
 * in update_one_slot() where the *existing* slots matter).
 *
 * When there are multiple special methods for the same slot, the above is
 * applied for each special method. As long as the results agree, the common
 * resulting slot is applied. If the results disagree, then a wrapper for
 * the special methods is installed. This is always safe, but less efficient
 * because it uses method lookup instead of direct C calls.
 *
 * There are some further special cases for specific slots, like supporting
 * __hash__ = None for tp_hash and special code for tp_new.
 *
 * When done, return a pointer to the next slotdef with a different offset,
 * because that's convenient for fixup_slot_dispatchers(). This function never
 * sets an exception: if an internal error happens (unlikely), it's ignored. */
static pytype_slotdef *
update_one_slot(TyTypeObject *type, pytype_slotdef *p)
{
    ASSERT_TYPE_LOCK_HELD();

    TyObject *descr;
    PyWrapperDescrObject *d;

    // The correct specialized C function, like "tp_repr of str" in the
    // example above
    void *specific = NULL;

    // A generic wrapper that uses method lookup (safe but slow)
    void *generic = NULL;

    // Set to 1 if the generic wrapper is necessary
    int use_generic = 0;

    int offset = p->offset;
    int error;
    void **ptr = slotptr(type, offset);

    if (ptr == NULL) {
        do {
            ++p;
        } while (p->offset == offset);
        return p;
    }
    /* We may end up clearing live exceptions below, so make sure it's ours. */
    assert(!TyErr_Occurred());
    do {
        /* Use faster uncached lookup as we won't get any cache hits during type setup. */
        descr = find_name_in_mro(type, p->name_strobj, &error);
        if (descr == NULL) {
            if (error == -1) {
                /* It is unlikely but not impossible that there has been an exception
                   during lookup. Since this function originally expected no errors,
                   we ignore them here in order to keep up the interface. */
                TyErr_Clear();
            }
            if (ptr == (void**)&type->tp_iternext) {
                specific = (void *)_TyObject_NextNotImplemented;
            }
            continue;
        }
        if (Ty_IS_TYPE(descr, &PyWrapperDescr_Type) &&
            ((PyWrapperDescrObject *)descr)->d_base->name_strobj == p->name_strobj) {
            void **tptr = resolve_slotdups(type, p->name_strobj);
            if (tptr == NULL || tptr == ptr)
                generic = p->function;
            d = (PyWrapperDescrObject *)descr;
            if ((specific == NULL || specific == d->d_wrapped) &&
                d->d_base->wrapper == p->wrapper &&
                is_subtype_with_mro(lookup_tp_mro(type), type, PyDescr_TYPE(d)))
            {
                specific = d->d_wrapped;
            }
            else {
                /* We cannot use the specific slot function because either
                   - it is not unique: there are multiple methods for this
                     slot and they conflict
                   - the signature is wrong (as checked by the ->wrapper
                     comparison above)
                   - it's wrapping the wrong class
                 */
                use_generic = 1;
            }
        }
        else if (Ty_IS_TYPE(descr, &PyCFunction_Type) &&
                 PyCFunction_GET_FUNCTION(descr) ==
                 _PyCFunction_CAST(tp_new_wrapper) &&
                 ptr == (void**)&type->tp_new)
        {
            /* The __new__ wrapper is not a wrapper descriptor,
               so must be special-cased differently.
               If we don't do this, creating an instance will
               always use slot_tp_new which will look up
               __new__ in the MRO which will call tp_new_wrapper
               which will look through the base classes looking
               for a static base and call its tp_new (usually
               TyType_GenericNew), after performing various
               sanity checks and constructing a new argument
               list.  Cut all that nonsense short -- this speeds
               up instance creation tremendously. */
            specific = (void *)type->tp_new;
            /* XXX I'm not 100% sure that there isn't a hole
               in this reasoning that requires additional
               sanity checks.  I'll buy the first person to
               point out a bug in this reasoning a beer. */
        }
        else if (descr == Ty_None &&
                 ptr == (void**)&type->tp_hash) {
            /* We specifically allow __hash__ to be set to None
               to prevent inheritance of the default
               implementation from object.__hash__ */
            specific = (void *)PyObject_HashNotImplemented;
        }
        else {
            use_generic = 1;
            if (generic == NULL && Ty_IS_TYPE(descr, &PyMethodDescr_Type) &&
                *ptr == ((PyMethodDescrObject *)descr)->d_method->ml_meth)
            {
                generic = *ptr;
            }
            else {
                generic = p->function;
            }
            if (p->function == slot_tp_call) {
                /* A generic __call__ is incompatible with vectorcall */
                type_clear_flags(type, Ty_TPFLAGS_HAVE_VECTORCALL);
            }
        }
        Ty_DECREF(descr);
    } while ((++p)->offset == offset);
    if (specific && !use_generic)
        *ptr = specific;
    else
        *ptr = generic;
    return p;
}

/* In the type, update the slots whose slotdefs are gathered in the pp array.
   This is a callback for update_subclasses(). */
static int
update_slots_callback(TyTypeObject *type, void *data)
{
    ASSERT_TYPE_LOCK_HELD();

    pytype_slotdef **pp = (pytype_slotdef **)data;
    for (; *pp; pp++) {
        update_one_slot(type, *pp);
    }
    return 0;
}

/* Update the slots after assignment to a class (type) attribute. */
static int
update_slot(TyTypeObject *type, TyObject *name)
{
    pytype_slotdef *ptrs[MAX_EQUIV];
    pytype_slotdef *p;
    pytype_slotdef **pp;
    int offset;

    ASSERT_TYPE_LOCK_HELD();
    assert(TyUnicode_CheckExact(name));
    assert(TyUnicode_CHECK_INTERNED(name));

    pp = ptrs;
    for (p = slotdefs; p->name; p++) {
        assert(TyUnicode_CheckExact(p->name_strobj));
        assert(TyUnicode_CHECK_INTERNED(p->name_strobj));
        assert(TyUnicode_CheckExact(name));
        /* bpo-40521: Using interned strings. */
        if (p->name_strobj == name) {
            *pp++ = p;
        }
    }
    *pp = NULL;
    for (pp = ptrs; *pp; pp++) {
        p = *pp;
        offset = p->offset;
        while (p > slotdefs && (p-1)->offset == offset)
            --p;
        *pp = p;
    }
    if (ptrs[0] == NULL)
        return 0; /* Not an attribute that affects any slots */
    return update_subclasses(type, name,
                             update_slots_callback, (void *)ptrs);
}

/* Store the proper functions in the slot dispatches at class (type)
   definition time, based upon which operations the class overrides in its
   dict. */
static void
fixup_slot_dispatchers(TyTypeObject *type)
{
    // This lock isn't strictly necessary because the type has not been
    // exposed to anyone else yet, but update_ont_slot calls find_name_in_mro
    // where we'd like to assert that the type is locked.
    BEGIN_TYPE_LOCK();

    assert(!TyErr_Occurred());
    for (pytype_slotdef *p = slotdefs; p->name; ) {
        p = update_one_slot(type, p);
    }

    END_TYPE_LOCK();
}

static void
update_all_slots(TyTypeObject* type)
{
    pytype_slotdef *p;

    ASSERT_TYPE_LOCK_HELD();

    /* Clear the VALID_VERSION flag of 'type' and all its subclasses. */
    type_modified_unlocked(type);

    for (p = slotdefs; p->name; p++) {
        /* update_slot returns int but can't actually fail */
        update_slot(type, p->name_strobj);
    }
}


TyObject *
_TyType_GetSlotWrapperNames(void)
{
    size_t len = Ty_ARRAY_LENGTH(slotdefs) - 1;
    TyObject *names = TyList_New(len);
    if (names == NULL) {
        return NULL;
    }
    assert(slotdefs[len].name == NULL);
    for (size_t i = 0; i < len; i++) {
        pytype_slotdef *slotdef = &slotdefs[i];
        assert(slotdef->name != NULL);
        TyList_SET_ITEM(names, i, Ty_NewRef(slotdef->name_strobj));
    }
    return names;
}


/* Call __set_name__ on all attributes (including descriptors)
  in a newly generated type */
static int
type_new_set_names(TyTypeObject *type)
{
    TyObject *dict = lookup_tp_dict(type);
    TyObject *names_to_set = TyDict_Copy(dict);
    if (names_to_set == NULL) {
        return -1;
    }

    Ty_ssize_t i = 0;
    TyObject *key, *value;
    while (TyDict_Next(names_to_set, &i, &key, &value)) {
        TyObject *set_name = _TyObject_LookupSpecial(value,
                                                     &_Ty_ID(__set_name__));
        if (set_name == NULL) {
            if (TyErr_Occurred()) {
                goto error;
            }
            continue;
        }

        TyObject *res = PyObject_CallFunctionObjArgs(set_name, type, key, NULL);
        Ty_DECREF(set_name);

        if (res == NULL) {
            _TyErr_FormatNote(
                "Error calling __set_name__ on '%.100s' instance %R "
                "in '%.100s'",
                Ty_TYPE(value)->tp_name, key, type->tp_name);
            goto error;
        }
        else {
            Ty_DECREF(res);
        }
    }

    Ty_DECREF(names_to_set);
    return 0;

error:
    Ty_DECREF(names_to_set);
    return -1;
}


/* Call __init_subclass__ on the parent of a newly generated type */
static int
type_new_init_subclass(TyTypeObject *type, TyObject *kwds)
{
    TyObject *args[2] = {(TyObject *)type, (TyObject *)type};
    TyObject *super = PyObject_Vectorcall((TyObject *)&TySuper_Type,
                                          args, 2, NULL);
    if (super == NULL) {
        return -1;
    }

    TyObject *func = PyObject_GetAttr(super, &_Ty_ID(__init_subclass__));
    Ty_DECREF(super);
    if (func == NULL) {
        return -1;
    }

    TyObject *result = PyObject_VectorcallDict(func, NULL, 0, kwds);
    Ty_DECREF(func);
    if (result == NULL) {
        return -1;
    }

    Ty_DECREF(result);
    return 0;
}


/* recurse_down_subclasses() and update_subclasses() are mutually
   recursive functions to call a callback for all subclasses,
   but refraining from recursing into subclasses that define 'attr_name'. */

static int
update_subclasses(TyTypeObject *type, TyObject *attr_name,
                  update_callback callback, void *data)
{
    if (callback(type, data) < 0) {
        return -1;
    }
    return recurse_down_subclasses(type, attr_name, callback, data);
}

static int
recurse_down_subclasses(TyTypeObject *type, TyObject *attr_name,
                        update_callback callback, void *data)
{
    // It is safe to use a borrowed reference because update_subclasses() is
    // only used with update_slots_callback() which doesn't modify
    // tp_subclasses.
    TyObject *subclasses = lookup_tp_subclasses(type);  // borrowed ref
    if (subclasses == NULL) {
        return 0;
    }
    assert(TyDict_CheckExact(subclasses));

    Ty_ssize_t i = 0;
    TyObject *ref;
    while (TyDict_Next(subclasses, &i, NULL, &ref)) {
        TyTypeObject *subclass = type_from_ref(ref);
        if (subclass == NULL) {
            continue;
        }

        /* Avoid recursing down into unaffected classes */
        TyObject *dict = lookup_tp_dict(subclass);
        if (dict != NULL && TyDict_Check(dict)) {
            int r = TyDict_Contains(dict, attr_name);
            if (r < 0) {
                Ty_DECREF(subclass);
                return -1;
            }
            if (r > 0) {
                Ty_DECREF(subclass);
                continue;
            }
        }

        if (update_subclasses(subclass, attr_name, callback, data) < 0) {
            Ty_DECREF(subclass);
            return -1;
        }
        Ty_DECREF(subclass);
    }
    return 0;
}

static int
slot_inherited(TyTypeObject *type, pytype_slotdef *slotdef, void **slot)
{
    void **slot_base = slotptr(type->tp_base, slotdef->offset);
    if (slot_base == NULL || *slot != *slot_base) {
        return 0;
    }

    /* Some slots are inherited in pairs. */
    if (slot == (void *)&type->tp_hash) {
        return (type->tp_richcompare == type->tp_base->tp_richcompare);
    }
    else if (slot == (void *)&type->tp_richcompare) {
        return (type->tp_hash == type->tp_base->tp_hash);
    }

    /* It must be inherited (see type_ready_inherit()). */
    return 1;
}

/* This function is called by TyType_Ready() to populate the type's
   dictionary with method descriptors for function slots.  For each
   function slot (like tp_repr) that's defined in the type, one or more
   corresponding descriptors are added in the type's tp_dict dictionary
   under the appropriate name (like __repr__).  Some function slots
   cause more than one descriptor to be added (for example, the nb_add
   slot adds both __add__ and __radd__ descriptors) and some function
   slots compete for the same descriptor (for example both sq_item and
   mp_subscript generate a __getitem__ descriptor).

   In the latter case, the first slotdef entry encountered wins.  Since
   slotdef entries are sorted by the offset of the slot in the
   PyHeapTypeObject, this gives us some control over disambiguating
   between competing slots: the members of PyHeapTypeObject are listed
   from most general to least general, so the most general slot is
   preferred.  In particular, because as_mapping comes before as_sequence,
   for a type that defines both mp_subscript and sq_item, mp_subscript
   wins.

   This only adds new descriptors and doesn't overwrite entries in
   tp_dict that were previously defined.  The descriptors contain a
   reference to the C function they must call, so that it's safe if they
   are copied into a subtype's __dict__ and the subtype has a different
   C function in its slot -- calling the method defined by the
   descriptor will call the C function that was used to create it,
   rather than the C function present in the slot when it is called.
   (This is important because a subtype may have a C function in the
   slot that calls the method from the dictionary, and we want to avoid
   infinite recursion here.) */

static int
add_operators(TyTypeObject *type)
{
    TyObject *dict = lookup_tp_dict(type);
    pytype_slotdef *p;
    TyObject *descr;
    void **ptr;

    for (p = slotdefs; p->name; p++) {
        if (p->wrapper == NULL)
            continue;
        ptr = slotptr(type, p->offset);
        if (!ptr || !*ptr)
            continue;
        /* Also ignore when the type slot has been inherited. */
        if (type->tp_flags & _Ty_TPFLAGS_STATIC_BUILTIN
            && type->tp_base != NULL
            && slot_inherited(type, p, ptr))
        {
            continue;
        }
        int r = TyDict_Contains(dict, p->name_strobj);
        if (r > 0)
            continue;
        if (r < 0) {
            return -1;
        }
        if (*ptr == (void *)PyObject_HashNotImplemented) {
            /* Classes may prevent the inheritance of the tp_hash
               slot by storing PyObject_HashNotImplemented in it. Make it
               visible as a None value for the __hash__ attribute. */
            if (TyDict_SetItem(dict, p->name_strobj, Ty_None) < 0)
                return -1;
        }
        else {
            descr = PyDescr_NewWrapper(type, p, *ptr);
            if (descr == NULL)
                return -1;
            if (TyDict_SetItem(dict, p->name_strobj, descr) < 0) {
                Ty_DECREF(descr);
                return -1;
            }
            Ty_DECREF(descr);
        }
    }
    return 0;
}


int
TyType_Freeze(TyTypeObject *type)
{
    // gh-121654: Check the __mro__ instead of __bases__
    TyObject *mro = type_get_mro((TyObject *)type, NULL);
    if (!TyTuple_Check(mro)) {
        Ty_DECREF(mro);
        TyErr_SetString(TyExc_TypeError, "unable to get the type MRO");
        return -1;
    }

    int check = check_immutable_bases(type->tp_name, mro, 1);
    Ty_DECREF(mro);
    if (check < 0) {
        return -1;
    }

    BEGIN_TYPE_LOCK();
    type_add_flags(type, Ty_TPFLAGS_IMMUTABLETYPE);
    type_modified_unlocked(type);
    END_TYPE_LOCK();

    return 0;
}


/* Cooperative 'super' */

typedef struct {
    PyObject_HEAD
    TyTypeObject *type;
    TyObject *obj;
    TyTypeObject *obj_type;
} superobject;

#define superobject_CAST(op)    ((superobject *)(op))

static TyMemberDef super_members[] = {
    {"__thisclass__", _Ty_T_OBJECT, offsetof(superobject, type), Py_READONLY,
     "the class invoking super()"},
    {"__self__",  _Ty_T_OBJECT, offsetof(superobject, obj), Py_READONLY,
     "the instance invoking super(); may be None"},
    {"__self_class__", _Ty_T_OBJECT, offsetof(superobject, obj_type), Py_READONLY,
     "the type of the instance invoking super(); may be None"},
    {0}
};

static void
super_dealloc(TyObject *self)
{
    superobject *su = superobject_CAST(self);

    _TyObject_GC_UNTRACK(self);
    Ty_XDECREF(su->obj);
    Ty_XDECREF(su->type);
    Ty_XDECREF(su->obj_type);
    Ty_TYPE(self)->tp_free(self);
}

static TyObject *
super_repr(TyObject *self)
{
    superobject *su = superobject_CAST(self);

    if (su->obj_type)
        return TyUnicode_FromFormat(
            "<super: <class '%s'>, <%s object>>",
            su->type ? su->type->tp_name : "NULL",
            su->obj_type->tp_name);
    else
        return TyUnicode_FromFormat(
            "<super: <class '%s'>, NULL>",
            su->type ? su->type->tp_name : "NULL");
}

/* Do a super lookup without executing descriptors or falling back to getattr
on the super object itself.

May return NULL with or without an exception set, like TyDict_GetItemWithError. */
static TyObject *
_super_lookup_descr(TyTypeObject *su_type, TyTypeObject *su_obj_type, TyObject *name)
{
    TyObject *mro, *res;
    Ty_ssize_t i, n;

    BEGIN_TYPE_LOCK();
    mro = lookup_tp_mro(su_obj_type);
    /* keep a strong reference to mro because su_obj_type->tp_mro can be
       replaced during TyDict_GetItemRef(dict, name, &res) and because
       another thread can modify it after we end the critical section
       below  */
    Ty_XINCREF(mro);
    END_TYPE_LOCK();

    if (mro == NULL)
        return NULL;

    assert(TyTuple_Check(mro));
    n = TyTuple_GET_SIZE(mro);

    /* No need to check the last one: it's gonna be skipped anyway.  */
    for (i = 0; i+1 < n; i++) {
        if ((TyObject *)(su_type) == TyTuple_GET_ITEM(mro, i))
            break;
    }
    i++;  /* skip su->type (if any)  */
    if (i >= n) {
        Ty_DECREF(mro);
        return NULL;
    }

    do {
        TyObject *obj = TyTuple_GET_ITEM(mro, i);
        TyObject *dict = lookup_tp_dict(_TyType_CAST(obj));
        assert(dict != NULL && TyDict_Check(dict));

        if (TyDict_GetItemRef(dict, name, &res) != 0) {
            // found or error
            Ty_DECREF(mro);
            return res;
        }

        i++;
    } while (i < n);
    Ty_DECREF(mro);
    return NULL;
}

// if `method` is non-NULL, we are looking for a method descriptor,
// and setting `*method = 1` means we found one.
static TyObject *
do_super_lookup(superobject *su, TyTypeObject *su_type, TyObject *su_obj,
                TyTypeObject *su_obj_type, TyObject *name, int *method)
{
    TyObject *res;
    int temp_su = 0;

    if (su_obj_type == NULL) {
        goto skip;
    }

    res = _super_lookup_descr(su_type, su_obj_type, name);
    if (res != NULL) {
        if (method && _TyType_HasFeature(Ty_TYPE(res), Ty_TPFLAGS_METHOD_DESCRIPTOR)) {
            *method = 1;
        }
        else {
            descrgetfunc f = Ty_TYPE(res)->tp_descr_get;
            if (f != NULL) {
                TyObject *res2;
                res2 = f(res,
                    /* Only pass 'obj' param if this is instance-mode super
                    (See SF ID #743627)  */
                    (su_obj == (TyObject *)su_obj_type) ? NULL : su_obj,
                    (TyObject *)su_obj_type);
                Ty_SETREF(res, res2);
            }
        }

        return res;
    }
    else if (TyErr_Occurred()) {
        return NULL;
    }

  skip:
    if (su == NULL) {
        TyObject *args[] = {(TyObject *)su_type, su_obj};
        su = (superobject *)PyObject_Vectorcall((TyObject *)&TySuper_Type, args, 2, NULL);
        if (su == NULL) {
            return NULL;
        }
        temp_su = 1;
    }
    res = PyObject_GenericGetAttr((TyObject *)su, name);
    if (temp_su) {
        Ty_DECREF(su);
    }
    return res;
}

static TyObject *
super_getattro(TyObject *self, TyObject *name)
{
    superobject *su = superobject_CAST(self);

    /* We want __class__ to return the class of the super object
       (i.e. super, or a subclass), not the class of su->obj. */
    if (TyUnicode_Check(name) &&
        TyUnicode_GET_LENGTH(name) == 9 &&
        _TyUnicode_Equal(name, &_Ty_ID(__class__)))
        return PyObject_GenericGetAttr(self, name);

    return do_super_lookup(su, su->type, su->obj, su->obj_type, name, NULL);
}

static TyTypeObject *
supercheck(TyTypeObject *type, TyObject *obj)
{
    /* Check that a super() call makes sense.  Return a type object.

       obj can be a class, or an instance of one:

       - If it is a class, it must be a subclass of 'type'.      This case is
         used for class methods; the return value is obj.

       - If it is an instance, it must be an instance of 'type'.  This is
         the normal case; the return value is obj.__class__.

       But... when obj is an instance, we want to allow for the case where
       Ty_TYPE(obj) is not a subclass of type, but obj.__class__ is!
       This will allow using super() with a proxy for obj.
    */

    /* Check for first bullet above (special case) */
    if (TyType_Check(obj) && TyType_IsSubtype((TyTypeObject *)obj, type)) {
        return (TyTypeObject *)Ty_NewRef(obj);
    }

    /* Normal case */
    if (TyType_IsSubtype(Ty_TYPE(obj), type)) {
        return (TyTypeObject*)Ty_NewRef(Ty_TYPE(obj));
    }
    else {
        /* Try the slow way */
        TyObject *class_attr;

        if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__class__), &class_attr) < 0) {
            return NULL;
        }
        if (class_attr != NULL &&
            TyType_Check(class_attr) &&
            (TyTypeObject *)class_attr != Ty_TYPE(obj))
        {
            int ok = TyType_IsSubtype(
                (TyTypeObject *)class_attr, type);
            if (ok) {
                return (TyTypeObject *)class_attr;
            }
        }
        Ty_XDECREF(class_attr);
    }

    const char *type_or_instance, *obj_str;

    if (TyType_Check(obj)) {
        type_or_instance = "type";
        obj_str = ((TyTypeObject*)obj)->tp_name;
    }
    else {
        type_or_instance = "instance of";
        obj_str = Ty_TYPE(obj)->tp_name;
    }

    TyErr_Format(TyExc_TypeError,
                "super(type, obj): obj (%s %.200s) is not "
                "an instance or subtype of type (%.200s).",
                type_or_instance, obj_str, type->tp_name);

    return NULL;
}

TyObject *
_PySuper_Lookup(TyTypeObject *su_type, TyObject *su_obj, TyObject *name, int *method)
{
    TyTypeObject *su_obj_type = supercheck(su_type, su_obj);
    if (su_obj_type == NULL) {
        return NULL;
    }
    TyObject *res = do_super_lookup(NULL, su_type, su_obj, su_obj_type, name, method);
    Ty_DECREF(su_obj_type);
    return res;
}

static TyObject *
super_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    superobject *su = superobject_CAST(self);
    superobject *newobj;

    if (obj == NULL || obj == Ty_None || su->obj != NULL) {
        /* Not binding to an object, or already bound */
        return Ty_NewRef(self);
    }
    if (!Ty_IS_TYPE(su, &TySuper_Type))
        /* If su is an instance of a (strict) subclass of super,
           call its type */
        return PyObject_CallFunctionObjArgs((TyObject *)Ty_TYPE(su),
                                            su->type, obj, NULL);
    else {
        /* Inline the common case */
        TyTypeObject *obj_type = supercheck(su->type, obj);
        if (obj_type == NULL)
            return NULL;
        newobj = (superobject *)TySuper_Type.tp_new(&TySuper_Type,
                                                 NULL, NULL);
        if (newobj == NULL) {
            Ty_DECREF(obj_type);
            return NULL;
        }
        newobj->type = (TyTypeObject*)Ty_NewRef(su->type);
        newobj->obj = Ty_NewRef(obj);
        newobj->obj_type = obj_type;
        return (TyObject *)newobj;
    }
}

static int
super_init_without_args(_PyInterpreterFrame *cframe, TyTypeObject **type_p,
                        TyObject **obj_p)
{
    PyCodeObject *co = _TyFrame_GetCode(cframe);
    if (co->co_argcount == 0) {
        TyErr_SetString(TyExc_RuntimeError,
                        "super(): no arguments");
        return -1;
    }

    assert(_TyFrame_GetCode(cframe)->co_nlocalsplus > 0);
    TyObject *firstarg = PyStackRef_AsPyObjectBorrow(_TyFrame_GetLocalsArray(cframe)[0]);
    if (firstarg == NULL) {
        TyErr_SetString(TyExc_RuntimeError, "super(): arg[0] deleted");
        return -1;
    }
    // The first argument might be a cell.
    // "firstarg" is a cell here unless (very unlikely) super()
    // was called from the C-API before the first MAKE_CELL op.
    if ((_PyLocals_GetKind(co->co_localspluskinds, 0) & CO_FAST_CELL) &&
            (_PyInterpreterFrame_LASTI(cframe) >= 0)) {
        // MAKE_CELL and COPY_FREE_VARS have no quickened forms, so no need
        // to use _TyOpcode_Deopt here:
        assert(_TyCode_CODE(co)[0].op.code == MAKE_CELL ||
                _TyCode_CODE(co)[0].op.code == COPY_FREE_VARS);
        assert(TyCell_Check(firstarg));
        firstarg = TyCell_GetRef((PyCellObject *)firstarg);
        if (firstarg == NULL) {
            TyErr_SetString(TyExc_RuntimeError, "super(): arg[0] deleted");
            return -1;
        }
    }
    else {
        Ty_INCREF(firstarg);
    }

    // Look for __class__ in the free vars.
    TyTypeObject *type = NULL;
    int i = PyUnstable_Code_GetFirstFree(co);
    for (; i < co->co_nlocalsplus; i++) {
        assert((_PyLocals_GetKind(co->co_localspluskinds, i) & CO_FAST_FREE) != 0);
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
        assert(TyUnicode_Check(name));
        if (_TyUnicode_Equal(name, &_Ty_ID(__class__))) {
            TyObject *cell = PyStackRef_AsPyObjectBorrow(_TyFrame_GetLocalsArray(cframe)[i]);
            if (cell == NULL || !TyCell_Check(cell)) {
                TyErr_SetString(TyExc_RuntimeError,
                  "super(): bad __class__ cell");
                Ty_DECREF(firstarg);
                return -1;
            }
            type = (TyTypeObject *) TyCell_GetRef((PyCellObject *)cell);
            if (type == NULL) {
                TyErr_SetString(TyExc_RuntimeError,
                  "super(): empty __class__ cell");
                Ty_DECREF(firstarg);
                return -1;
            }
            if (!TyType_Check(type)) {
                TyErr_Format(TyExc_RuntimeError,
                  "super(): __class__ is not a type (%s)",
                  Ty_TYPE(type)->tp_name);
                Ty_DECREF(type);
                Ty_DECREF(firstarg);
                return -1;
            }
            break;
        }
    }
    if (type == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "super(): __class__ cell not found");
        Ty_DECREF(firstarg);
        return -1;
    }

    *type_p = type;
    *obj_p = firstarg;
    return 0;
}

static int super_init_impl(TyObject *self, TyTypeObject *type, TyObject *obj);

static int
super_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyTypeObject *type = NULL;
    TyObject *obj = NULL;

    if (!_TyArg_NoKeywords("super", kwds))
        return -1;
    if (!TyArg_ParseTuple(args, "|O!O:super", &TyType_Type, &type, &obj))
        return -1;
    if (super_init_impl(self, type, obj) < 0) {
        return -1;
    }
    return 0;
}

static inline int
super_init_impl(TyObject *self, TyTypeObject *type, TyObject *obj) {
    superobject *su = superobject_CAST(self);
    TyTypeObject *obj_type = NULL;
    if (type == NULL) {
        /* Call super(), without args -- fill in from __class__
           and first local variable on the stack. */
        TyThreadState *tstate = _TyThreadState_GET();
        _PyInterpreterFrame *frame = _TyThreadState_GetFrame(tstate);
        if (frame == NULL) {
            TyErr_SetString(TyExc_RuntimeError,
                            "super(): no current frame");
            return -1;
        }
        int res = super_init_without_args(frame, &type, &obj);

        if (res < 0) {
            return -1;
        }
    }
    else {
        Ty_INCREF(type);
        Ty_XINCREF(obj);
    }

    if (obj == Ty_None) {
        Ty_DECREF(obj);
        obj = NULL;
    }
    if (obj != NULL) {
        obj_type = supercheck(type, obj);
        if (obj_type == NULL) {
            Ty_DECREF(type);
            Ty_DECREF(obj);
            return -1;
        }
    }
    Ty_XSETREF(su->type, (TyTypeObject*)type);
    Ty_XSETREF(su->obj, obj);
    Ty_XSETREF(su->obj_type, obj_type);
    return 0;
}

TyDoc_STRVAR(super_doc,
"super() -> same as super(__class__, <first argument>)\n"
"super(type) -> unbound super object\n"
"super(type, obj) -> bound super object; requires isinstance(obj, type)\n"
"super(type, type2) -> bound super object; requires issubclass(type2, type)\n"
"Typical use to call a cooperative superclass method:\n"
"class C(B):\n"
"    def meth(self, arg):\n"
"        super().meth(arg)\n"
"This works for class methods too:\n"
"class C(B):\n"
"    @classmethod\n"
"    def cmeth(cls, arg):\n"
"        super().cmeth(arg)\n");

static int
super_traverse(TyObject *self, visitproc visit, void *arg)
{
    superobject *su = superobject_CAST(self);

    Ty_VISIT(su->obj);
    Ty_VISIT(su->type);
    Ty_VISIT(su->obj_type);

    return 0;
}

static TyObject *
super_vectorcall(TyObject *self, TyObject *const *args,
    size_t nargsf, TyObject *kwnames)
{
    assert(TyType_Check(self));
    if (!_TyArg_NoKwnames("super", kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("super()", nargs, 0, 2)) {
        return NULL;
    }
    TyTypeObject *type = NULL;
    TyObject *obj = NULL;
    TyTypeObject *self_type = (TyTypeObject *)self;
    TyObject *su = self_type->tp_alloc(self_type, 0);
    if (su == NULL) {
        return NULL;
    }
    // 1 or 2 argument form super().
    if (nargs != 0) {
        TyObject *arg0 = args[0];
        if (!TyType_Check(arg0)) {
            TyErr_Format(TyExc_TypeError,
                "super() argument 1 must be a type, not %.200s", Ty_TYPE(arg0)->tp_name);
            goto fail;
        }
        type = (TyTypeObject *)arg0;
    }
    if (nargs == 2) {
        obj = args[1];
    }
    if (super_init_impl(su, type, obj) < 0) {
        goto fail;
    }
    return su;
fail:
    Ty_DECREF(su);
    return NULL;
}

TyTypeObject TySuper_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "super",                                    /* tp_name */
    sizeof(superobject),                        /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    super_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    super_repr,                                 /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    super_getattro,                             /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,                    /* tp_flags */
    super_doc,                                  /* tp_doc */
    super_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    super_members,                              /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    super_descr_get,                            /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    super_init,                                 /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    TyType_GenericNew,                          /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
    .tp_vectorcall = super_vectorcall,
};
