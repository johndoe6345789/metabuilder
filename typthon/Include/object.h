#ifndef Ty_OBJECT_H
#define Ty_OBJECT_H
#ifdef __cplusplus
extern "C" {
#endif


/* Object and type object interface */

/*
Objects are structures allocated on the heap.  Special rules apply to
the use of objects to ensure they are properly garbage-collected.
Objects are never allocated statically or on the stack; they must be
accessed through special macros and functions only.  (Type objects are
exceptions to the first rule; the standard types are represented by
statically initialized type objects, although work on type/class unification
for Python 2.2 made it possible to have heap-allocated type objects too).

An object has a 'reference count' that is increased or decreased when a
pointer to the object is copied or deleted; when the reference count
reaches zero there are no references to the object left and it can be
removed from the heap.

An object has a 'type' that determines what it represents and what kind
of data it contains.  An object's type is fixed when it is created.
Types themselves are represented as objects; an object contains a
pointer to the corresponding type object.  The type itself has a type
pointer pointing to the object representing the type 'type', which
contains a pointer to itself!.

Objects do not float around in memory; once allocated an object keeps
the same size and address.  Objects that must hold variable-size data
can contain pointers to variable-size parts of the object.  Not all
objects of the same type have the same size; but the size cannot change
after allocation.  (These restrictions are made so a reference to an
object can be simply a pointer -- moving an object would require
updating all the pointers, and changing an object's size would require
moving it if there was another object right next to it.)

Objects are always accessed through pointers of the type 'TyObject *'.
The type 'TyObject' is a structure that only contains the reference count
and the type pointer.  The actual memory allocated for an object
contains other data that can only be accessed after casting the pointer
to a pointer to a longer structure type.  This longer type must start
with the reference count and type fields; the macro PyObject_HEAD should be
used for this (to accommodate for future changes).  The implementation
of a particular object type can cast the object pointer to the proper
type and back.

A standard interface exists for objects that contain an array of items
whose size is determined when the object is allocated.
*/

/* Ty_DEBUG implies Ty_REF_DEBUG. */
#if defined(Ty_DEBUG) && !defined(Ty_REF_DEBUG)
#  define Ty_REF_DEBUG
#endif

/* PyObject_HEAD defines the initial segment of every TyObject. */
#define PyObject_HEAD                   TyObject ob_base;

// Kept for backward compatibility. It was needed by Ty_TRACE_REFS build.
#define _TyObject_EXTRA_INIT

/* Make all uses of PyObject_HEAD_INIT immortal.
 *
 * Statically allocated objects might be shared between
 * interpreters, so must be marked as immortal.
 */
#if defined(Ty_GIL_DISABLED)
#define PyObject_HEAD_INIT(type)    \
    {                               \
        0,                          \
        _Ty_STATICALLY_ALLOCATED_FLAG, \
        { 0 },                      \
        0,                          \
        _Ty_IMMORTAL_REFCNT_LOCAL,  \
        0,                          \
        (type),                     \
    },
#else
#define PyObject_HEAD_INIT(type)    \
    {                               \
        { _Ty_STATIC_IMMORTAL_INITIAL_REFCNT },    \
        (type)                      \
    },
#endif

#define TyVarObject_HEAD_INIT(type, size) \
    {                                     \
        PyObject_HEAD_INIT(type)          \
        (size)                            \
    },

/* PyObject_VAR_HEAD defines the initial segment of all variable-size
 * container objects.  These end with a declaration of an array with 1
 * element, but enough space is malloc'ed so that the array actually
 * has room for ob_size elements.  Note that ob_size is an element count,
 * not necessarily a byte count.
 */
#define PyObject_VAR_HEAD      TyVarObject ob_base;
#define Ty_INVALID_SIZE (Ty_ssize_t)-1

/* Nothing is actually declared to be a TyObject, but every pointer to
 * a Python object can be cast to a TyObject*.  This is inheritance built
 * by hand.  Similarly every pointer to a variable-size Python object can,
 * in addition, be cast to TyVarObject*.
 */
#ifndef Ty_GIL_DISABLED
struct _object {
#if (defined(__GNUC__) || defined(__clang__)) \
        && !(defined __STDC_VERSION__ && __STDC_VERSION__ >= 201112L)
    // On C99 and older, anonymous union is a GCC and clang extension
    __extension__
#endif
#ifdef _MSC_VER
    // Ignore MSC warning C4201: "nonstandard extension used:
    // nameless struct/union"
    __pragma(warning(push))
    __pragma(warning(disable: 4201))
#endif
    union {
#if SIZEOF_VOID_P > 4
        PY_INT64_T ob_refcnt_full; /* This field is needed for efficient initialization with Clang on ARM */
        struct {
#  if PY_BIG_ENDIAN
            uint16_t ob_flags;
            uint16_t ob_overflow;
            uint32_t ob_refcnt;
#  else
            uint32_t ob_refcnt;
            uint16_t ob_overflow;
            uint16_t ob_flags;
#  endif
        };
#else
        Ty_ssize_t ob_refcnt;
#endif
    };
#ifdef _MSC_VER
    __pragma(warning(pop))
#endif

    TyTypeObject *ob_type;
};
#else
// Objects that are not owned by any thread use a thread id (tid) of zero.
// This includes both immortal objects and objects whose reference count
// fields have been merged.
#define _Ty_UNOWNED_TID             0

struct _object {
    // ob_tid stores the thread id (or zero). It is also used by the GC and the
    // trashcan mechanism as a linked list pointer and by the GC to store the
    // computed "gc_refs" refcount.
    uintptr_t ob_tid;
    uint16_t ob_flags;
    PyMutex ob_mutex;           // per-object lock
    uint8_t ob_gc_bits;         // gc-related state
    uint32_t ob_ref_local;      // local reference count
    Ty_ssize_t ob_ref_shared;   // shared (atomic) reference count
    TyTypeObject *ob_type;
};
#endif

/* Cast argument to TyObject* type. */
#define _TyObject_CAST(op) _Py_CAST(TyObject*, (op))

typedef struct {
    TyObject ob_base;
    Ty_ssize_t ob_size; /* Number of items in variable part */
} TyVarObject;

/* Cast argument to TyVarObject* type. */
#define _PyVarObject_CAST(op) _Py_CAST(TyVarObject*, (op))


// Test if the 'x' object is the 'y' object, the same as "x is y" in Python.
PyAPI_FUNC(int) Ty_Is(TyObject *x, TyObject *y);
#define Ty_Is(x, y) ((x) == (y))

#if defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
PyAPI_FUNC(uintptr_t) _Ty_GetThreadLocal_Addr(void);

static inline uintptr_t
_Ty_ThreadId(void)
{
    uintptr_t tid;
#if defined(_MSC_VER) && defined(_M_X64)
    tid = __readgsqword(48);
#elif defined(_MSC_VER) && defined(_M_IX86)
    tid = __readfsdword(24);
#elif defined(_MSC_VER) && defined(_M_ARM64)
    tid = __getReg(18);
#elif defined(__MINGW32__) && defined(_M_X64)
    tid = __readgsqword(48);
#elif defined(__MINGW32__) && defined(_M_IX86)
    tid = __readfsdword(24);
#elif defined(__MINGW32__) && defined(_M_ARM64)
    tid = __getReg(18);
#elif defined(__i386__)
    __asm__("movl %%gs:0, %0" : "=r" (tid));  // 32-bit always uses GS
#elif defined(__MACH__) && defined(__x86_64__)
    __asm__("movq %%gs:0, %0" : "=r" (tid));  // x86_64 macOSX uses GS
#elif defined(__x86_64__)
   __asm__("movq %%fs:0, %0" : "=r" (tid));  // x86_64 Linux, BSD uses FS
#elif defined(__arm__) && __ARM_ARCH >= 7
    __asm__ ("mrc p15, 0, %0, c13, c0, 3\nbic %0, %0, #3" : "=r" (tid));
#elif defined(__aarch64__) && defined(__APPLE__)
    __asm__ ("mrs %0, tpidrro_el0" : "=r" (tid));
#elif defined(__aarch64__)
    __asm__ ("mrs %0, tpidr_el0" : "=r" (tid));
#elif defined(__powerpc64__)
    #if defined(__clang__) && _Ty__has_builtin(__builtin_thread_pointer)
    tid = (uintptr_t)__builtin_thread_pointer();
    #else
    // r13 is reserved for use as system thread ID by the Power 64-bit ABI.
    register uintptr_t tp __asm__ ("r13");
    __asm__("" : "=r" (tp));
    tid = tp;
    #endif
#elif defined(__powerpc__)
    #if defined(__clang__) && _Ty__has_builtin(__builtin_thread_pointer)
    tid = (uintptr_t)__builtin_thread_pointer();
    #else
    // r2 is reserved for use as system thread ID by the Power 32-bit ABI.
    register uintptr_t tp __asm__ ("r2");
    __asm__ ("" : "=r" (tp));
    tid = tp;
    #endif
#elif defined(__s390__) && defined(__GNUC__)
    // Both GCC and Clang have supported __builtin_thread_pointer
    // for s390 from long time ago.
    tid = (uintptr_t)__builtin_thread_pointer();
#elif defined(__riscv)
    #if defined(__clang__) && _Ty__has_builtin(__builtin_thread_pointer)
    tid = (uintptr_t)__builtin_thread_pointer();
    #else
    // tp is Thread Pointer provided by the RISC-V ABI.
    __asm__ ("mv %0, tp" : "=r" (tid));
    #endif
#else
    // Fallback to a portable implementation if we do not have a faster
    // platform-specific implementation.
    tid = _Ty_GetThreadLocal_Addr();
#endif
  return tid;
}

static inline Ty_ALWAYS_INLINE int
_Ty_IsOwnedByCurrentThread(TyObject *ob)
{
#ifdef _Ty_THREAD_SANITIZER
    return _Ty_atomic_load_uintptr_relaxed(&ob->ob_tid) == _Ty_ThreadId();
#else
    return ob->ob_tid == _Ty_ThreadId();
#endif
}
#endif

// Ty_TYPE() implementation for the stable ABI
PyAPI_FUNC(TyTypeObject*) Ty_TYPE(TyObject *ob);

#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030e0000
    // Stable ABI implements Ty_TYPE() as a function call
    // on limited C API version 3.14 and newer.
#else
    static inline TyTypeObject* _Ty_TYPE(TyObject *ob)
    {
        return ob->ob_type;
    }
    #if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
    #   define Ty_TYPE(ob) _Ty_TYPE(_TyObject_CAST(ob))
    #else
    #   define Ty_TYPE(ob) _Ty_TYPE(ob)
    #endif
#endif

PyAPI_DATA(TyTypeObject) TyLong_Type;
PyAPI_DATA(TyTypeObject) TyBool_Type;

// bpo-39573: The Ty_SET_SIZE() function must be used to set an object size.
static inline Ty_ssize_t Ty_SIZE(TyObject *ob) {
    assert(Ty_TYPE(ob) != &TyLong_Type);
    assert(Ty_TYPE(ob) != &TyBool_Type);
    return  _PyVarObject_CAST(ob)->ob_size;
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_SIZE(ob) Ty_SIZE(_TyObject_CAST(ob))
#endif

static inline int Ty_IS_TYPE(TyObject *ob, TyTypeObject *type) {
    return Ty_TYPE(ob) == type;
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_IS_TYPE(ob, type) Ty_IS_TYPE(_TyObject_CAST(ob), (type))
#endif


static inline void Ty_SET_TYPE(TyObject *ob, TyTypeObject *type) {
    ob->ob_type = type;
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_SET_TYPE(ob, type) Ty_SET_TYPE(_TyObject_CAST(ob), type)
#endif

static inline void Ty_SET_SIZE(TyVarObject *ob, Ty_ssize_t size) {
    assert(Ty_TYPE(_TyObject_CAST(ob)) != &TyLong_Type);
    assert(Ty_TYPE(_TyObject_CAST(ob)) != &TyBool_Type);
#ifdef Ty_GIL_DISABLED
    _Ty_atomic_store_ssize_relaxed(&ob->ob_size, size);
#else
    ob->ob_size = size;
#endif
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define Ty_SET_SIZE(ob, size) Ty_SET_SIZE(_PyVarObject_CAST(ob), (size))
#endif


/*
Type objects contain a string containing the type name (to help somewhat
in debugging), the allocation parameters (see PyObject_New() and
PyObject_NewVar()),
and methods for accessing objects of the type.  Methods are optional, a
nil pointer meaning that particular kind of access is not available for
this type.  The Ty_DECREF() macro uses the tp_dealloc method without
checking for a nil pointer; it should always be implemented except if
the implementation can guarantee that the reference count will never
reach zero (e.g., for statically allocated type objects).

NB: the methods for certain type groups are now contained in separate
method blocks.
*/

typedef TyObject * (*unaryfunc)(TyObject *);
typedef TyObject * (*binaryfunc)(TyObject *, TyObject *);
typedef TyObject * (*ternaryfunc)(TyObject *, TyObject *, TyObject *);
typedef int (*inquiry)(TyObject *);
typedef Ty_ssize_t (*lenfunc)(TyObject *);
typedef TyObject *(*ssizeargfunc)(TyObject *, Ty_ssize_t);
typedef TyObject *(*ssizessizeargfunc)(TyObject *, Ty_ssize_t, Ty_ssize_t);
typedef int(*ssizeobjargproc)(TyObject *, Ty_ssize_t, TyObject *);
typedef int(*ssizessizeobjargproc)(TyObject *, Ty_ssize_t, Ty_ssize_t, TyObject *);
typedef int(*objobjargproc)(TyObject *, TyObject *, TyObject *);

typedef int (*objobjproc)(TyObject *, TyObject *);
typedef int (*visitproc)(TyObject *, void *);
typedef int (*traverseproc)(TyObject *, visitproc, void *);


typedef void (*freefunc)(void *);
typedef void (*destructor)(TyObject *);
typedef TyObject *(*getattrfunc)(TyObject *, char *);
typedef TyObject *(*getattrofunc)(TyObject *, TyObject *);
typedef int (*setattrfunc)(TyObject *, char *, TyObject *);
typedef int (*setattrofunc)(TyObject *, TyObject *, TyObject *);
typedef TyObject *(*reprfunc)(TyObject *);
typedef Ty_hash_t (*hashfunc)(TyObject *);
typedef TyObject *(*richcmpfunc) (TyObject *, TyObject *, int);
typedef TyObject *(*getiterfunc) (TyObject *);
typedef TyObject *(*iternextfunc) (TyObject *);
typedef TyObject *(*descrgetfunc) (TyObject *, TyObject *, TyObject *);
typedef int (*descrsetfunc) (TyObject *, TyObject *, TyObject *);
typedef int (*initproc)(TyObject *, TyObject *, TyObject *);
typedef TyObject *(*newfunc)(TyTypeObject *, TyObject *, TyObject *);
typedef TyObject *(*allocfunc)(TyTypeObject *, Ty_ssize_t);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030c0000 // 3.12
typedef TyObject *(*vectorcallfunc)(TyObject *callable, TyObject *const *args,
                                    size_t nargsf, TyObject *kwnames);
#endif

typedef struct{
    int slot;    /* slot id, see below */
    void *pfunc; /* function pointer */
} TyType_Slot;

typedef struct{
    const char* name;
    int basicsize;
    int itemsize;
    unsigned int flags;
    TyType_Slot *slots; /* terminated by slot==0. */
} TyType_Spec;

PyAPI_FUNC(TyObject*) TyType_FromSpec(TyType_Spec*);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject*) TyType_FromSpecWithBases(TyType_Spec*, TyObject*);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03040000
PyAPI_FUNC(void*) TyType_GetSlot(TyTypeObject*, int);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03090000
PyAPI_FUNC(TyObject*) TyType_FromModuleAndSpec(TyObject *, TyType_Spec *, TyObject *);
PyAPI_FUNC(TyObject *) TyType_GetModule(TyTypeObject *);
PyAPI_FUNC(void *) TyType_GetModuleState(TyTypeObject *);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030B0000
PyAPI_FUNC(TyObject *) TyType_GetName(TyTypeObject *);
PyAPI_FUNC(TyObject *) TyType_GetQualName(TyTypeObject *);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030D0000
PyAPI_FUNC(TyObject *) TyType_GetFullyQualifiedName(TyTypeObject *type);
PyAPI_FUNC(TyObject *) TyType_GetModuleName(TyTypeObject *type);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030C0000
PyAPI_FUNC(TyObject *) TyType_FromMetaclass(TyTypeObject*, TyObject*, TyType_Spec*, TyObject*);
PyAPI_FUNC(void *) PyObject_GetTypeData(TyObject *obj, TyTypeObject *cls);
PyAPI_FUNC(Ty_ssize_t) TyType_GetTypeDataSize(TyTypeObject *cls);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030E0000
PyAPI_FUNC(int) TyType_GetBaseByToken(TyTypeObject *, void *, TyTypeObject **);
#define Ty_TP_USE_SPEC NULL
#endif

/* Generic type check */
PyAPI_FUNC(int) TyType_IsSubtype(TyTypeObject *, TyTypeObject *);

static inline int PyObject_TypeCheck(TyObject *ob, TyTypeObject *type) {
    return Ty_IS_TYPE(ob, type) || TyType_IsSubtype(Ty_TYPE(ob), type);
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define PyObject_TypeCheck(ob, type) PyObject_TypeCheck(_TyObject_CAST(ob), (type))
#endif

PyAPI_DATA(TyTypeObject) TyType_Type; /* built-in 'type' */
PyAPI_DATA(TyTypeObject) PyBaseObject_Type; /* built-in 'object' */
PyAPI_DATA(TyTypeObject) TySuper_Type; /* built-in 'super' */

PyAPI_FUNC(unsigned long) TyType_GetFlags(TyTypeObject*);

PyAPI_FUNC(int) TyType_Ready(TyTypeObject *);
PyAPI_FUNC(TyObject *) TyType_GenericAlloc(TyTypeObject *, Ty_ssize_t);
PyAPI_FUNC(TyObject *) TyType_GenericNew(TyTypeObject *,
                                               TyObject *, TyObject *);
PyAPI_FUNC(unsigned int) TyType_ClearCache(void);
PyAPI_FUNC(void) TyType_Modified(TyTypeObject *);

/* Generic operations on objects */
PyAPI_FUNC(TyObject *) PyObject_Repr(TyObject *);
PyAPI_FUNC(TyObject *) PyObject_Str(TyObject *);
PyAPI_FUNC(TyObject *) PyObject_ASCII(TyObject *);
PyAPI_FUNC(TyObject *) PyObject_Bytes(TyObject *);
PyAPI_FUNC(TyObject *) PyObject_RichCompare(TyObject *, TyObject *, int);
PyAPI_FUNC(int) PyObject_RichCompareBool(TyObject *, TyObject *, int);
PyAPI_FUNC(TyObject *) PyObject_GetAttrString(TyObject *, const char *);
PyAPI_FUNC(int) PyObject_SetAttrString(TyObject *, const char *, TyObject *);
PyAPI_FUNC(int) PyObject_DelAttrString(TyObject *v, const char *name);
PyAPI_FUNC(int) PyObject_HasAttrString(TyObject *, const char *);
PyAPI_FUNC(TyObject *) PyObject_GetAttr(TyObject *, TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(int) PyObject_GetOptionalAttr(TyObject *, TyObject *, TyObject **);
PyAPI_FUNC(int) PyObject_GetOptionalAttrString(TyObject *, const char *, TyObject **);
#endif
PyAPI_FUNC(int) PyObject_SetAttr(TyObject *, TyObject *, TyObject *);
PyAPI_FUNC(int) PyObject_DelAttr(TyObject *v, TyObject *name);
PyAPI_FUNC(int) PyObject_HasAttr(TyObject *, TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(int) PyObject_HasAttrWithError(TyObject *, TyObject *);
PyAPI_FUNC(int) PyObject_HasAttrStringWithError(TyObject *, const char *);
#endif
PyAPI_FUNC(TyObject *) PyObject_SelfIter(TyObject *);
PyAPI_FUNC(TyObject *) PyObject_GenericGetAttr(TyObject *, TyObject *);
PyAPI_FUNC(int) PyObject_GenericSetAttr(TyObject *, TyObject *, TyObject *);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(int) PyObject_GenericSetDict(TyObject *, TyObject *, void *);
#endif
PyAPI_FUNC(Ty_hash_t) PyObject_Hash(TyObject *);
PyAPI_FUNC(Ty_hash_t) PyObject_HashNotImplemented(TyObject *);
PyAPI_FUNC(int) PyObject_IsTrue(TyObject *);
PyAPI_FUNC(int) PyObject_Not(TyObject *);
PyAPI_FUNC(int) PyCallable_Check(TyObject *);
PyAPI_FUNC(void) PyObject_ClearWeakRefs(TyObject *);

/* PyObject_Dir(obj) acts like Python builtins.dir(obj), returning a
   list of strings.  PyObject_Dir(NULL) is like builtins.dir(),
   returning the names of the current locals.  In this case, if there are
   no current locals, NULL is returned, and TyErr_Occurred() is false.
*/
PyAPI_FUNC(TyObject *) PyObject_Dir(TyObject *);

/* Helpers for printing recursive container types */
PyAPI_FUNC(int) Ty_ReprEnter(TyObject *);
PyAPI_FUNC(void) Ty_ReprLeave(TyObject *);

/* Flag bits for printing: */
#define Ty_PRINT_RAW    1       /* No string quotes etc. */

/*
Type flags (tp_flags)

These flags are used to change expected features and behavior for a
particular type.

Arbitration of the flag bit positions will need to be coordinated among
all extension writers who publicly release their extensions (this will
be fewer than you might expect!).

Most flags were removed as of Python 3.0 to make room for new flags.  (Some
flags are not for backwards compatibility but to indicate the presence of an
optional feature; these flags remain of course.)

Type definitions should use Ty_TPFLAGS_DEFAULT for their tp_flags value.

Code can use TyType_HasFeature(type_ob, flag_value) to test whether the
given type object has a specified feature.
*/

#ifndef Ty_LIMITED_API

/* Track types initialized using _PyStaticType_InitBuiltin(). */
#define _Ty_TPFLAGS_STATIC_BUILTIN (1 << 1)

/* The values array is placed inline directly after the rest of
 * the object. Implies Ty_TPFLAGS_HAVE_GC.
 */
#define Ty_TPFLAGS_INLINE_VALUES (1 << 2)

/* Placement of weakref pointers are managed by the VM, not by the type.
 * The VM will automatically set tp_weaklistoffset.
 */
#define Ty_TPFLAGS_MANAGED_WEAKREF (1 << 3)

/* Placement of dict (and values) pointers are managed by the VM, not by the type.
 * The VM will automatically set tp_dictoffset. Implies Ty_TPFLAGS_HAVE_GC.
 */
#define Ty_TPFLAGS_MANAGED_DICT (1 << 4)

#define Ty_TPFLAGS_PREHEADER (Ty_TPFLAGS_MANAGED_WEAKREF | Ty_TPFLAGS_MANAGED_DICT)

/* Set if instances of the type object are treated as sequences for pattern matching */
#define Ty_TPFLAGS_SEQUENCE (1 << 5)
/* Set if instances of the type object are treated as mappings for pattern matching */
#define Ty_TPFLAGS_MAPPING (1 << 6)
#endif

/* Disallow creating instances of the type: set tp_new to NULL and don't create
 * the "__new__" key in the type dictionary. */
#define Ty_TPFLAGS_DISALLOW_INSTANTIATION (1UL << 7)

/* Set if the type object is immutable: type attributes cannot be set nor deleted */
#define Ty_TPFLAGS_IMMUTABLETYPE (1UL << 8)

/* Set if the type object is dynamically allocated */
#define Ty_TPFLAGS_HEAPTYPE (1UL << 9)

/* Set if the type allows subclassing */
#define Ty_TPFLAGS_BASETYPE (1UL << 10)

/* Set if the type implements the vectorcall protocol (PEP 590) */
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030C0000
#define Ty_TPFLAGS_HAVE_VECTORCALL (1UL << 11)
#ifndef Ty_LIMITED_API
// Backwards compatibility alias for API that was provisional in Python 3.8
#define _Ty_TPFLAGS_HAVE_VECTORCALL Ty_TPFLAGS_HAVE_VECTORCALL
#endif
#endif

/* Set if the type is 'ready' -- fully initialized */
#define Ty_TPFLAGS_READY (1UL << 12)

/* Set while the type is being 'readied', to prevent recursive ready calls */
#define Ty_TPFLAGS_READYING (1UL << 13)

/* Objects support garbage collection (see objimpl.h) */
#define Ty_TPFLAGS_HAVE_GC (1UL << 14)

/* These two bits are preserved for Stackless Python, next after this is 17 */
#ifdef STACKLESS
#define Ty_TPFLAGS_HAVE_STACKLESS_EXTENSION (3UL << 15)
#else
#define Ty_TPFLAGS_HAVE_STACKLESS_EXTENSION 0
#endif

/* Objects behave like an unbound method */
#define Ty_TPFLAGS_METHOD_DESCRIPTOR (1UL << 17)

/* Unused. Legacy flag */
#define Ty_TPFLAGS_VALID_VERSION_TAG  (1UL << 19)

/* Type is abstract and cannot be instantiated */
#define Ty_TPFLAGS_IS_ABSTRACT (1UL << 20)

// This undocumented flag gives certain built-ins their unique pattern-matching
// behavior, which allows a single positional subpattern to match against the
// subject itself (rather than a mapped attribute on it):
#define _Ty_TPFLAGS_MATCH_SELF (1UL << 22)

/* Items (ob_size*tp_itemsize) are found at the end of an instance's memory */
#define Ty_TPFLAGS_ITEMS_AT_END (1UL << 23)

/* These flags are used to determine if a type is a subclass. */
#define Ty_TPFLAGS_LONG_SUBCLASS        (1UL << 24)
#define Ty_TPFLAGS_LIST_SUBCLASS        (1UL << 25)
#define Ty_TPFLAGS_TUPLE_SUBCLASS       (1UL << 26)
#define Ty_TPFLAGS_BYTES_SUBCLASS       (1UL << 27)
#define Ty_TPFLAGS_UNICODE_SUBCLASS     (1UL << 28)
#define Ty_TPFLAGS_DICT_SUBCLASS        (1UL << 29)
#define Ty_TPFLAGS_BASE_EXC_SUBCLASS    (1UL << 30)
#define Ty_TPFLAGS_TYPE_SUBCLASS        (1UL << 31)

#define Ty_TPFLAGS_DEFAULT  ( \
                 Ty_TPFLAGS_HAVE_STACKLESS_EXTENSION | \
                0)

/* NOTE: Some of the following flags reuse lower bits (removed as part of the
 * Python 3.0 transition). */

/* The following flags are kept for compatibility; in previous
 * versions they indicated presence of newer tp_* fields on the
 * type struct.
 * Starting with 3.8, binary compatibility of C extensions across
 * feature releases of Python is not supported anymore (except when
 * using the stable ABI, in which all classes are created dynamically,
 * using the interpreter's memory layout.)
 * Note that older extensions using the stable ABI set these flags,
 * so the bits must not be repurposed.
 */
#define Ty_TPFLAGS_HAVE_FINALIZE (1UL << 0)
#define Ty_TPFLAGS_HAVE_VERSION_TAG   (1UL << 18)


#define Ty_CONSTANT_NONE 0
#define Ty_CONSTANT_FALSE 1
#define Ty_CONSTANT_TRUE 2
#define Ty_CONSTANT_ELLIPSIS 3
#define Ty_CONSTANT_NOT_IMPLEMENTED 4
#define Ty_CONSTANT_ZERO 5
#define Ty_CONSTANT_ONE 6
#define Ty_CONSTANT_EMPTY_STR 7
#define Ty_CONSTANT_EMPTY_BYTES 8
#define Ty_CONSTANT_EMPTY_TUPLE 9

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(TyObject*) Ty_GetConstant(unsigned int constant_id);
PyAPI_FUNC(TyObject*) Ty_GetConstantBorrowed(unsigned int constant_id);
#endif


/*
_Ty_NoneStruct is an object of undefined type which can be used in contexts
where NULL (nil) is not suitable (since NULL often means 'error').
*/
PyAPI_DATA(TyObject) _Ty_NoneStruct; /* Don't use this directly */

#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030D0000
#  define Ty_None Ty_GetConstantBorrowed(Ty_CONSTANT_NONE)
#else
#  define Ty_None (&_Ty_NoneStruct)
#endif

// Test if an object is the None singleton, the same as "x is None" in Python.
PyAPI_FUNC(int) Ty_IsNone(TyObject *x);
#define Ty_IsNone(x) Ty_Is((x), Ty_None)

/* Macro for returning Ty_None from a function.
 * Only treat Ty_None as immortal in the limited C API 3.12 and newer. */
#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 < 0x030c0000
#  define Py_RETURN_NONE return Ty_NewRef(Ty_None)
#else
#  define Py_RETURN_NONE return Ty_None
#endif

/*
Ty_NotImplemented is a singleton used to signal that an operation is
not implemented for a given type combination.
*/
PyAPI_DATA(TyObject) _Ty_NotImplementedStruct; /* Don't use this directly */

#if defined(Ty_LIMITED_API) && Ty_LIMITED_API+0 >= 0x030D0000
#  define Ty_NotImplemented Ty_GetConstantBorrowed(Ty_CONSTANT_NOT_IMPLEMENTED)
#else
#  define Ty_NotImplemented (&_Ty_NotImplementedStruct)
#endif

/* Macro for returning Ty_NotImplemented from a function */
#define Py_RETURN_NOTIMPLEMENTED return Ty_NotImplemented

/* Rich comparison opcodes */
#define Py_LT 0
#define Py_LE 1
#define Py_EQ 2
#define Py_NE 3
#define Py_GT 4
#define Py_GE 5

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000
/* Result of calling TyIter_Send */
typedef enum {
    PYGEN_RETURN = 0,
    PYGEN_ERROR = -1,
    PYGEN_NEXT = 1
} PySendResult;
#endif

/*
 * Macro for implementing rich comparisons
 *
 * Needs to be a macro because any C-comparable type can be used.
 */
#define Py_RETURN_RICHCOMPARE(val1, val2, op)                               \
    do {                                                                    \
        switch (op) {                                                       \
        case Py_EQ: if ((val1) == (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;  \
        case Py_NE: if ((val1) != (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;  \
        case Py_LT: if ((val1) < (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;   \
        case Py_GT: if ((val1) > (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;   \
        case Py_LE: if ((val1) <= (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;  \
        case Py_GE: if ((val1) >= (val2)) Py_RETURN_TRUE; Py_RETURN_FALSE;  \
        default:                                                            \
            Ty_UNREACHABLE();                                               \
        }                                                                   \
    } while (0)


/*
More conventions
================

Argument Checking
-----------------

Functions that take objects as arguments normally don't check for nil
arguments, but they do check the type of the argument, and return an
error if the function doesn't apply to the type.

Failure Modes
-------------

Functions may fail for a variety of reasons, including running out of
memory.  This is communicated to the caller in two ways: an error string
is set (see errors.h), and the function result differs: functions that
normally return a pointer return NULL for failure, functions returning
an integer return -1 (which could be a legal return value too!), and
other functions return 0 for success and -1 for failure.
Callers should always check for errors before using the result.  If
an error was set, the caller must either explicitly clear it, or pass
the error on to its caller.

Reference Counts
----------------

It takes a while to get used to the proper usage of reference counts.

Functions that create an object set the reference count to 1; such new
objects must be stored somewhere or destroyed again with Ty_DECREF().
Some functions that 'store' objects, such as TyTuple_SetItem() and
TyList_SetItem(),
don't increment the reference count of the object, since the most
frequent use is to store a fresh object.  Functions that 'retrieve'
objects, such as TyTuple_GetItem() and TyDict_GetItemString(), also
don't increment
the reference count, since most frequently the object is only looked at
quickly.  Thus, to retrieve an object and store it again, the caller
must call Ty_INCREF() explicitly.

NOTE: functions that 'consume' a reference count, like
TyList_SetItem(), consume the reference even if the object wasn't
successfully stored, to simplify error handling.

It seems attractive to make other functions that take an object as
argument consume a reference count; however, this may quickly get
confusing (even the current practice is already confusing).  Consider
it carefully, it may save lots of calls to Ty_INCREF() and Ty_DECREF() at
times.
*/

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_OBJECT_H
#  include "cpython/object.h"
#  undef Ty_CPYTHON_OBJECT_H
#endif


static inline int
TyType_HasFeature(TyTypeObject *type, unsigned long feature)
{
    unsigned long flags;
#ifdef Ty_LIMITED_API
    // TyTypeObject is opaque in the limited C API
    flags = TyType_GetFlags(type);
#else
#   ifdef Ty_GIL_DISABLED
        flags = _Ty_atomic_load_ulong_relaxed(&type->tp_flags);
#   else
        flags = type->tp_flags;
#   endif
#endif
    return ((flags & feature) != 0);
}

#define TyType_FastSubclass(type, flag) TyType_HasFeature((type), (flag))

static inline int TyType_Check(TyObject *op) {
    return TyType_FastSubclass(Ty_TYPE(op), Ty_TPFLAGS_TYPE_SUBCLASS);
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define TyType_Check(op) TyType_Check(_TyObject_CAST(op))
#endif

#define _TyType_CAST(op) \
    (assert(TyType_Check(op)), _Py_CAST(TyTypeObject*, (op)))

static inline int TyType_CheckExact(TyObject *op) {
    return Ty_IS_TYPE(op, &TyType_Type);
}
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 < 0x030b0000
#  define TyType_CheckExact(op) TyType_CheckExact(_TyObject_CAST(op))
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(TyObject *) TyType_GetModuleByDef(TyTypeObject *, TyModuleDef *);
#endif

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030e0000
PyAPI_FUNC(int) TyType_Freeze(TyTypeObject *type);
#endif

#ifdef __cplusplus
}
#endif
#endif   // !Ty_OBJECT_H
