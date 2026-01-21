#ifndef Ty_CPYTHON_OBJECT_H
#  error "this header file must not be included directly"
#endif

PyAPI_FUNC(void) _Ty_NewReference(TyObject *op);
PyAPI_FUNC(void) _Ty_NewReferenceNoTotal(TyObject *op);
PyAPI_FUNC(void) _Ty_ResurrectReference(TyObject *op);
PyAPI_FUNC(void) _Ty_ForgetReference(TyObject *op);

#ifdef Ty_REF_DEBUG
/* These are useful as debugging aids when chasing down refleaks. */
PyAPI_FUNC(Ty_ssize_t) _Ty_GetGlobalRefTotal(void);
#  define _Ty_GetRefTotal() _Ty_GetGlobalRefTotal()
PyAPI_FUNC(Ty_ssize_t) _Ty_GetLegacyRefTotal(void);
PyAPI_FUNC(Ty_ssize_t) _TyInterpreterState_GetRefTotal(TyInterpreterState *);
#endif


/********************* String Literals ****************************************/
/* This structure helps managing static strings. The basic usage goes like this:
   Instead of doing

       r = PyObject_CallMethod(o, "foo", "args", ...);

   do

       _Ty_IDENTIFIER(foo);
       ...
       r = _TyObject_CallMethodId(o, &PyId_foo, "args", ...);

   PyId_foo is a static variable, either on block level or file level. On first
   usage, the string "foo" is interned, and the structures are linked. On interpreter
   shutdown, all strings are released.

   Alternatively, _Ty_static_string allows choosing the variable name.
   _TyUnicode_FromId returns a borrowed reference to the interned string.
   _TyObject_{Get,Set,Has}AttrId are __getattr__ versions using _Ty_Identifier*.
*/
typedef struct _Ty_Identifier {
    const char* string;
    // Index in TyInterpreterState.unicode.ids.array. It is process-wide
    // unique and must be initialized to -1.
    Ty_ssize_t index;
    // Hidden PyMutex struct for non free-threaded build.
    struct {
        uint8_t v;
    } mutex;
} _Ty_Identifier;

#ifndef Ty_BUILD_CORE
// For now we are keeping _Ty_IDENTIFIER for continued use
// in non-builtin extensions (and naughty PyPI modules).

#define _Ty_static_string_init(value) { .string = (value), .index = -1 }
#define _Ty_static_string(varname, value)  static _Ty_Identifier varname = _Ty_static_string_init(value)
#define _Ty_IDENTIFIER(varname) _Ty_static_string(PyId_##varname, #varname)

#endif /* !Ty_BUILD_CORE */


typedef struct {
    /* Number implementations must check *both*
       arguments for proper type and implement the necessary conversions
       in the slot functions themselves. */

    binaryfunc nb_add;
    binaryfunc nb_subtract;
    binaryfunc nb_multiply;
    binaryfunc nb_remainder;
    binaryfunc nb_divmod;
    ternaryfunc nb_power;
    unaryfunc nb_negative;
    unaryfunc nb_positive;
    unaryfunc nb_absolute;
    inquiry nb_bool;
    unaryfunc nb_invert;
    binaryfunc nb_lshift;
    binaryfunc nb_rshift;
    binaryfunc nb_and;
    binaryfunc nb_xor;
    binaryfunc nb_or;
    unaryfunc nb_int;
    void *nb_reserved;  /* the slot formerly known as nb_long */
    unaryfunc nb_float;

    binaryfunc nb_inplace_add;
    binaryfunc nb_inplace_subtract;
    binaryfunc nb_inplace_multiply;
    binaryfunc nb_inplace_remainder;
    ternaryfunc nb_inplace_power;
    binaryfunc nb_inplace_lshift;
    binaryfunc nb_inplace_rshift;
    binaryfunc nb_inplace_and;
    binaryfunc nb_inplace_xor;
    binaryfunc nb_inplace_or;

    binaryfunc nb_floor_divide;
    binaryfunc nb_true_divide;
    binaryfunc nb_inplace_floor_divide;
    binaryfunc nb_inplace_true_divide;

    unaryfunc nb_index;

    binaryfunc nb_matrix_multiply;
    binaryfunc nb_inplace_matrix_multiply;
} TyNumberMethods;

typedef struct {
    lenfunc sq_length;
    binaryfunc sq_concat;
    ssizeargfunc sq_repeat;
    ssizeargfunc sq_item;
    void *was_sq_slice;
    ssizeobjargproc sq_ass_item;
    void *was_sq_ass_slice;
    objobjproc sq_contains;

    binaryfunc sq_inplace_concat;
    ssizeargfunc sq_inplace_repeat;
} PySequenceMethods;

typedef struct {
    lenfunc mp_length;
    binaryfunc mp_subscript;
    objobjargproc mp_ass_subscript;
} PyMappingMethods;

typedef PySendResult (*sendfunc)(TyObject *iter, TyObject *value, TyObject **result);

typedef struct {
    unaryfunc am_await;
    unaryfunc am_aiter;
    unaryfunc am_anext;
    sendfunc am_send;
} TyAsyncMethods;

typedef struct {
     getbufferproc bf_getbuffer;
     releasebufferproc bf_releasebuffer;
} PyBufferProcs;

/* Allow printfunc in the tp_vectorcall_offset slot for
 * backwards-compatibility */
typedef Ty_ssize_t printfunc;

// If this structure is modified, Doc/includes/typestruct.h should be updated
// as well.
struct _typeobject {
    PyObject_VAR_HEAD
    const char *tp_name; /* For printing, in format "<module>.<name>" */
    Ty_ssize_t tp_basicsize, tp_itemsize; /* For allocation */

    /* Methods to implement standard operations */

    destructor tp_dealloc;
    Ty_ssize_t tp_vectorcall_offset;
    getattrfunc tp_getattr;
    setattrfunc tp_setattr;
    TyAsyncMethods *tp_as_async; /* formerly known as tp_compare (Python 2)
                                    or tp_reserved (Python 3) */
    reprfunc tp_repr;

    /* Method suites for standard classes */

    TyNumberMethods *tp_as_number;
    PySequenceMethods *tp_as_sequence;
    PyMappingMethods *tp_as_mapping;

    /* More standard operations (here for binary compatibility) */

    hashfunc tp_hash;
    ternaryfunc tp_call;
    reprfunc tp_str;
    getattrofunc tp_getattro;
    setattrofunc tp_setattro;

    /* Functions to access object as input/output buffer */
    PyBufferProcs *tp_as_buffer;

    /* Flags to define presence of optional/expanded features */
    unsigned long tp_flags;

    const char *tp_doc; /* Documentation string */

    /* Assigned meaning in release 2.0 */
    /* call function for all accessible objects */
    traverseproc tp_traverse;

    /* delete references to contained objects */
    inquiry tp_clear;

    /* Assigned meaning in release 2.1 */
    /* rich comparisons */
    richcmpfunc tp_richcompare;

    /* weak reference enabler */
    Ty_ssize_t tp_weaklistoffset;

    /* Iterators */
    getiterfunc tp_iter;
    iternextfunc tp_iternext;

    /* Attribute descriptor and subclassing stuff */
    TyMethodDef *tp_methods;
    TyMemberDef *tp_members;
    TyGetSetDef *tp_getset;
    // Strong reference on a heap type, borrowed reference on a static type
    TyTypeObject *tp_base;
    TyObject *tp_dict;
    descrgetfunc tp_descr_get;
    descrsetfunc tp_descr_set;
    Ty_ssize_t tp_dictoffset;
    initproc tp_init;
    allocfunc tp_alloc;
    newfunc tp_new;
    freefunc tp_free; /* Low-level free-memory routine */
    inquiry tp_is_gc; /* For PyObject_IS_GC */
    TyObject *tp_bases;
    TyObject *tp_mro; /* method resolution order */
    TyObject *tp_cache; /* no longer used */
    void *tp_subclasses;  /* for static builtin types this is an index */
    TyObject *tp_weaklist; /* not used for static builtin types */
    destructor tp_del;

    /* Type attribute cache version tag. Added in version 2.6.
     * If zero, the cache is invalid and must be initialized.
     */
    unsigned int tp_version_tag;

    destructor tp_finalize;
    vectorcallfunc tp_vectorcall;

    /* bitset of which type-watchers care about this type */
    unsigned char tp_watched;

    /* Number of tp_version_tag values used.
     * Set to _Ty_ATTR_CACHE_UNUSED if the attribute cache is
     * disabled for this type (e.g. due to custom MRO entries).
     * Otherwise, limited to MAX_VERSIONS_PER_CLASS (defined elsewhere).
     */
    uint16_t tp_versions_used;
};

#define _Ty_ATTR_CACHE_UNUSED (30000)  // (see tp_versions_used)

/* This struct is used by the specializer
 * It should be treated as an opaque blob
 * by code other than the specializer and interpreter. */
struct _specialization_cache {
    // In order to avoid bloating the bytecode with lots of inline caches, the
    // members of this structure have a somewhat unique contract. They are set
    // by the specialization machinery, and are invalidated by TyType_Modified.
    // The rules for using them are as follows:
    // - If getitem is non-NULL, then it is the same Python function that
    //   TyType_Lookup(cls, "__getitem__") would return.
    // - If getitem is NULL, then getitem_version is meaningless.
    // - If getitem->func_version == getitem_version, then getitem can be called
    //   with two positional arguments and no keyword arguments, and has neither
    //   *args nor **kwargs (as required by BINARY_OP_SUBSCR_GETITEM):
    TyObject *getitem;
    uint32_t getitem_version;
    TyObject *init;
};

/* The *real* layout of a type object when allocated on the heap */
typedef struct _heaptypeobject {
    /* Note: there's a dependency on the order of these members
       in slotptr() in typeobject.c . */
    TyTypeObject ht_type;
    TyAsyncMethods as_async;
    TyNumberMethods as_number;
    PyMappingMethods as_mapping;
    PySequenceMethods as_sequence; /* as_sequence comes after as_mapping,
                                      so that the mapping wins when both
                                      the mapping and the sequence define
                                      a given operator (e.g. __getitem__).
                                      see add_operators() in typeobject.c . */
    PyBufferProcs as_buffer;
    TyObject *ht_name, *ht_slots, *ht_qualname;
    struct _dictkeysobject *ht_cached_keys;
    TyObject *ht_module;
    char *_ht_tpname;  // Storage for "tp_name"; see TyType_FromModuleAndSpec
    void *ht_token;  // Storage for the "Ty_tp_token" slot
    struct _specialization_cache _spec_cache; // For use by the specializer.
#ifdef Ty_GIL_DISABLED
    Ty_ssize_t unique_id;  // ID used for per-thread refcounting
#endif
    /* here are optional user slots, followed by the members. */
} PyHeapTypeObject;

PyAPI_FUNC(const char *) _TyType_Name(TyTypeObject *);
PyAPI_FUNC(TyObject *) _TyType_Lookup(TyTypeObject *, TyObject *);
PyAPI_FUNC(TyObject *) _TyType_LookupRef(TyTypeObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyType_GetDict(TyTypeObject *);

PyAPI_FUNC(int) PyObject_Print(TyObject *, FILE *, int);
PyAPI_FUNC(void) _Ty_BreakPoint(void);
PyAPI_FUNC(void) _TyObject_Dump(TyObject *);

PyAPI_FUNC(TyObject*) _TyObject_GetAttrId(TyObject *, _Ty_Identifier *);

PyAPI_FUNC(TyObject **) _TyObject_GetDictPtr(TyObject *);
PyAPI_FUNC(void) PyObject_CallFinalizer(TyObject *);
PyAPI_FUNC(int) PyObject_CallFinalizerFromDealloc(TyObject *);

PyAPI_FUNC(void) PyUnstable_Object_ClearWeakRefsNoCallbacks(TyObject *);

/* Same as PyObject_Generic{Get,Set}Attr, but passing the attributes
   dict as the last parameter. */
PyAPI_FUNC(TyObject *)
_TyObject_GenericGetAttrWithDict(TyObject *, TyObject *, TyObject *, int);
PyAPI_FUNC(int)
_TyObject_GenericSetAttrWithDict(TyObject *, TyObject *,
                                 TyObject *, TyObject *);

PyAPI_FUNC(TyObject *) _TyObject_FunctionStr(TyObject *);

/* Safely decref `dst` and set `dst` to `src`.
 *
 * As in case of Ty_CLEAR "the obvious" code can be deadly:
 *
 *     Ty_DECREF(dst);
 *     dst = src;
 *
 * The safe way is:
 *
 *      Ty_SETREF(dst, src);
 *
 * That arranges to set `dst` to `src` _before_ decref'ing, so that any code
 * triggered as a side-effect of `dst` getting torn down no longer believes
 * `dst` points to a valid object.
 *
 * Temporary variables are used to only evaluate macro arguments once and so
 * avoid the duplication of side effects. _Ty_TYPEOF() or memcpy() is used to
 * avoid a miscompilation caused by type punning. See Ty_CLEAR() comment for
 * implementation details about type punning.
 *
 * The memcpy() implementation does not emit a compiler warning if 'src' has
 * not the same type than 'src': any pointer type is accepted for 'src'.
 */
#ifdef _Ty_TYPEOF
#define Ty_SETREF(dst, src) \
    do { \
        _Ty_TYPEOF(dst)* _tmp_dst_ptr = &(dst); \
        _Ty_TYPEOF(dst) _tmp_old_dst = (*_tmp_dst_ptr); \
        *_tmp_dst_ptr = (src); \
        Ty_DECREF(_tmp_old_dst); \
    } while (0)
#else
#define Ty_SETREF(dst, src) \
    do { \
        TyObject **_tmp_dst_ptr = _Py_CAST(TyObject**, &(dst)); \
        TyObject *_tmp_old_dst = (*_tmp_dst_ptr); \
        TyObject *_tmp_src = _TyObject_CAST(src); \
        memcpy(_tmp_dst_ptr, &_tmp_src, sizeof(TyObject*)); \
        Ty_DECREF(_tmp_old_dst); \
    } while (0)
#endif

/* Ty_XSETREF() is a variant of Ty_SETREF() that uses Ty_XDECREF() instead of
 * Ty_DECREF().
 */
#ifdef _Ty_TYPEOF
#define Ty_XSETREF(dst, src) \
    do { \
        _Ty_TYPEOF(dst)* _tmp_dst_ptr = &(dst); \
        _Ty_TYPEOF(dst) _tmp_old_dst = (*_tmp_dst_ptr); \
        *_tmp_dst_ptr = (src); \
        Ty_XDECREF(_tmp_old_dst); \
    } while (0)
#else
#define Ty_XSETREF(dst, src) \
    do { \
        TyObject **_tmp_dst_ptr = _Py_CAST(TyObject**, &(dst)); \
        TyObject *_tmp_old_dst = (*_tmp_dst_ptr); \
        TyObject *_tmp_src = _TyObject_CAST(src); \
        memcpy(_tmp_dst_ptr, &_tmp_src, sizeof(TyObject*)); \
        Ty_XDECREF(_tmp_old_dst); \
    } while (0)
#endif


/* Define a pair of assertion macros:
   _TyObject_ASSERT_FROM(), _TyObject_ASSERT_WITH_MSG() and _TyObject_ASSERT().

   These work like the regular C assert(), in that they will abort the
   process with a message on stderr if the given condition fails to hold,
   but compile away to nothing if NDEBUG is defined.

   However, before aborting, Python will also try to call _TyObject_Dump() on
   the given object.  This may be of use when investigating bugs in which a
   particular object is corrupt (e.g. buggy a tp_visit method in an extension
   module breaking the garbage collector), to help locate the broken objects.

   The WITH_MSG variant allows you to supply an additional message that Python
   will attempt to print to stderr, after the object dump. */
#ifdef NDEBUG
   /* No debugging: compile away the assertions: */
#  define _TyObject_ASSERT_FROM(obj, expr, msg, filename, lineno, func) \
    ((void)0)
#else
   /* With debugging: generate checks: */
#  define _TyObject_ASSERT_FROM(obj, expr, msg, filename, lineno, func) \
    ((expr) \
      ? (void)(0) \
      : _TyObject_AssertFailed((obj), Ty_STRINGIFY(expr), \
                               (msg), (filename), (lineno), (func)))
#endif

#define _TyObject_ASSERT_WITH_MSG(obj, expr, msg) \
    _TyObject_ASSERT_FROM((obj), expr, (msg), __FILE__, __LINE__, __func__)
#define _TyObject_ASSERT(obj, expr) \
    _TyObject_ASSERT_WITH_MSG((obj), expr, NULL)

#define _TyObject_ASSERT_FAILED_MSG(obj, msg) \
    _TyObject_AssertFailed((obj), NULL, (msg), __FILE__, __LINE__, __func__)

/* Declare and define _TyObject_AssertFailed() even when NDEBUG is defined,
   to avoid causing compiler/linker errors when building extensions without
   NDEBUG against a Python built with NDEBUG defined.

   msg, expr and function can be NULL. */
PyAPI_FUNC(void) _Ty_NO_RETURN _TyObject_AssertFailed(
    TyObject *obj,
    const char *expr,
    const char *msg,
    const char *file,
    int line,
    const char *function);


PyAPI_FUNC(void) _PyTrash_thread_deposit_object(TyThreadState *tstate, TyObject *op);
PyAPI_FUNC(void) _PyTrash_thread_destroy_chain(TyThreadState *tstate);

PyAPI_FUNC(int) _Ty_ReachedRecursionLimitWithMargin(TyThreadState *tstate, int margin_count);

/* For backwards compatibility with the old trashcan mechanism */
#define Ty_TRASHCAN_BEGIN(op, dealloc)
#define Ty_TRASHCAN_END


PyAPI_FUNC(void *) PyObject_GetItemData(TyObject *obj);

PyAPI_FUNC(int) PyObject_VisitManagedDict(TyObject *obj, visitproc visit, void *arg);
PyAPI_FUNC(int) _TyObject_SetManagedDict(TyObject *obj, TyObject *new_dict);
PyAPI_FUNC(void) PyObject_ClearManagedDict(TyObject *obj);


typedef int(*TyType_WatchCallback)(TyTypeObject *);
PyAPI_FUNC(int) TyType_AddWatcher(TyType_WatchCallback callback);
PyAPI_FUNC(int) TyType_ClearWatcher(int watcher_id);
PyAPI_FUNC(int) TyType_Watch(int watcher_id, TyObject *type);
PyAPI_FUNC(int) TyType_Unwatch(int watcher_id, TyObject *type);

/* Attempt to assign a version tag to the given type.
 *
 * Returns 1 if the type already had a valid version tag or a new one was
 * assigned, or 0 if a new tag could not be assigned.
 */
PyAPI_FUNC(int) PyUnstable_Type_AssignVersionTag(TyTypeObject *type);


typedef enum {
    PyRefTracer_CREATE = 0,
    PyRefTracer_DESTROY = 1,
} PyRefTracerEvent;

typedef int (*PyRefTracer)(TyObject *, PyRefTracerEvent event, void *);
PyAPI_FUNC(int) PyRefTracer_SetTracer(PyRefTracer tracer, void *data);
PyAPI_FUNC(PyRefTracer) PyRefTracer_GetTracer(void**);

/* Enable PEP-703 deferred reference counting on the object.
 *
 * Returns 1 if deferred reference counting was successfully enabled, and
 * 0 if the runtime ignored it. This function cannot fail.
 */
PyAPI_FUNC(int) PyUnstable_Object_EnableDeferredRefcount(TyObject *);

/* Determine if the object exists as a unique temporary variable on the
 * topmost frame of the interpreter.
 */
PyAPI_FUNC(int) PyUnstable_Object_IsUniqueReferencedTemporary(TyObject *);

/* Check whether the object is immortal. This cannot fail. */
PyAPI_FUNC(int) PyUnstable_IsImmortal(TyObject *);

// Increments the reference count of the object, if it's not zero.
// PyUnstable_EnableTryIncRef() should be called on the object
// before calling this function in order to avoid spurious failures.
PyAPI_FUNC(int) PyUnstable_TryIncRef(TyObject *);
PyAPI_FUNC(void) PyUnstable_EnableTryIncRef(TyObject *);

PyAPI_FUNC(int) PyUnstable_Object_IsUniquelyReferenced(TyObject *);
