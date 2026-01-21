/* pickle accelerator C extensor: _pickle module.
 *
 * It is built as a built-in module (Ty_BUILD_CORE_BUILTIN define) on Windows
 * and as an extension module (Ty_BUILD_CORE_MODULE define) on other
 * platforms. */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_bytesobject.h"   // _PyBytesWriter
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCall()
#include "pycore_critical_section.h" // Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_long.h"          // _TyLong_AsByteArray()
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_object.h"        // _PyNone_Type
#include "pycore_pyerrors.h"      // _TyErr_FormatNote
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_sysmodule.h"     // _TySys_GetSizeOf()
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()

#include <stdlib.h>               // strtol()


TyDoc_STRVAR(pickle_module_doc,
"Optimized C implementation for the Python pickle module.");

/*[clinic input]
module _pickle
class _pickle.Pickler "PicklerObject *" ""
class _pickle.PicklerMemoProxy "PicklerMemoProxyObject *" ""
class _pickle.Unpickler "UnpicklerObject *" ""
class _pickle.UnpicklerMemoProxy "UnpicklerMemoProxyObject *" ""
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b6d7191ab6466cda]*/

/* Bump HIGHEST_PROTOCOL when new opcodes are added to the pickle protocol.
   Bump DEFAULT_PROTOCOL only when the oldest still supported version of Python
   already includes it. */
enum {
    HIGHEST_PROTOCOL = 5,
    DEFAULT_PROTOCOL = 5
};

#ifdef MS_WINDOWS
// These are already typedefs from windows.h, pulled in via pycore_runtime.h.
#define FLOAT FLOAT_
#define INT INT_
#define LONG LONG_

/* This can already be defined on Windows to set the character set
   the Windows header files treat as default */
#ifdef UNICODE
#undef UNICODE
#endif
#endif

/* Pickle opcodes. These must be kept updated with pickle.py.
   Extensive docs are in pickletools.py. */
enum opcode {
    MARK            = '(',
    STOP            = '.',
    POP             = '0',
    POP_MARK        = '1',
    DUP             = '2',
    FLOAT           = 'F',
    INT             = 'I',
    BININT          = 'J',
    BININT1         = 'K',
    LONG            = 'L',
    BININT2         = 'M',
    NONE            = 'N',
    PERSID          = 'P',
    BINPERSID       = 'Q',
    REDUCE          = 'R',
    STRING          = 'S',
    BINSTRING       = 'T',
    SHORT_BINSTRING = 'U',
    UNICODE         = 'V',
    BINUNICODE      = 'X',
    APPEND          = 'a',
    BUILD           = 'b',
    GLOBAL          = 'c',
    DICT            = 'd',
    EMPTY_DICT      = '}',
    APPENDS         = 'e',
    GET             = 'g',
    BINGET          = 'h',
    INST            = 'i',
    LONG_BINGET     = 'j',
    LIST            = 'l',
    EMPTY_LIST      = ']',
    OBJ             = 'o',
    PUT             = 'p',
    BINPUT          = 'q',
    LONG_BINPUT     = 'r',
    SETITEM         = 's',
    TUPLE           = 't',
    EMPTY_TUPLE     = ')',
    SETITEMS        = 'u',
    BINFLOAT        = 'G',

    /* Protocol 2. */
    PROTO       = '\x80',
    NEWOBJ      = '\x81',
    EXT1        = '\x82',
    EXT2        = '\x83',
    EXT4        = '\x84',
    TUPLE1      = '\x85',
    TUPLE2      = '\x86',
    TUPLE3      = '\x87',
    NEWTRUE     = '\x88',
    NEWFALSE    = '\x89',
    LONG1       = '\x8a',
    LONG4       = '\x8b',

    /* Protocol 3 (Python 3.x) */
    BINBYTES       = 'B',
    SHORT_BINBYTES = 'C',

    /* Protocol 4 */
    SHORT_BINUNICODE = '\x8c',
    BINUNICODE8      = '\x8d',
    BINBYTES8        = '\x8e',
    EMPTY_SET        = '\x8f',
    ADDITEMS         = '\x90',
    FROZENSET        = '\x91',
    NEWOBJ_EX        = '\x92',
    STACK_GLOBAL     = '\x93',
    MEMOIZE          = '\x94',
    FRAME            = '\x95',

    /* Protocol 5 */
    BYTEARRAY8       = '\x96',
    NEXT_BUFFER      = '\x97',
    READONLY_BUFFER  = '\x98'
};

enum {
   /* Keep in synch with pickle.Pickler._BATCHSIZE.  This is how many elements
      batch_list/dict() pumps out before doing APPENDS/SETITEMS.  Nothing will
      break if this gets out of synch with pickle.py, but it's unclear that would
      help anything either. */
    BATCHSIZE = 1000,

    /* Nesting limit until Pickler, when running in "fast mode", starts
       checking for self-referential data-structures. */
    FAST_NESTING_LIMIT = 50,

    /* Initial size of the write buffer of Pickler. */
    WRITE_BUF_SIZE = 4096,

    /* Prefetch size when unpickling (disabled on unpeekable streams) */
    PREFETCH = 8192 * 16,

    FRAME_SIZE_MIN = 4,
    FRAME_SIZE_TARGET = 64 * 1024,
    FRAME_HEADER_SIZE = 9
};

/*************************************************************************/

/* State of the pickle module, per PEP 3121. */
typedef struct {
    /* Exception classes for pickle. */
    TyObject *PickleError;
    TyObject *PicklingError;
    TyObject *UnpicklingError;

    /* copyreg.dispatch_table, {type_object: pickling_function} */
    TyObject *dispatch_table;

    /* For the extension opcodes EXT1, EXT2 and EXT4. */

    /* copyreg._extension_registry, {(module_name, function_name): code} */
    TyObject *extension_registry;
    /* copyreg._extension_cache, {code: object} */
    TyObject *extension_cache;
    /* copyreg._inverted_registry, {code: (module_name, function_name)} */
    TyObject *inverted_registry;

    /* Import mappings for compatibility with Python 2.x */

    /* _compat_pickle.NAME_MAPPING,
       {(oldmodule, oldname): (newmodule, newname)} */
    TyObject *name_mapping_2to3;
    /* _compat_pickle.IMPORT_MAPPING, {oldmodule: newmodule} */
    TyObject *import_mapping_2to3;
    /* Same, but with REVERSE_NAME_MAPPING / REVERSE_IMPORT_MAPPING */
    TyObject *name_mapping_3to2;
    TyObject *import_mapping_3to2;

    /* codecs.encode, used for saving bytes in older protocols */
    TyObject *codecs_encode;
    /* builtins.getattr, used for saving nested names with protocol < 4 */
    TyObject *getattr;
    /* functools.partial, used for implementing __newobj_ex__ with protocols
       2 and 3 */
    TyObject *partial;

    /* Types */
    TyTypeObject *Pickler_Type;
    TyTypeObject *Unpickler_Type;
    TyTypeObject *Pdata_Type;
    TyTypeObject *PicklerMemoProxyType;
    TyTypeObject *UnpicklerMemoProxyType;
} PickleState;

/* Forward declaration of the _pickle module definition. */
static struct TyModuleDef _picklemodule;

/* Given a module object, get its per-module state. */
static inline PickleState *
_Pickle_GetState(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (PickleState *)state;
}

static inline PickleState *
_Pickle_GetStateByClass(TyTypeObject *cls)
{
    void *state = _TyType_GetModuleState(cls);
    assert(state != NULL);
    return (PickleState *)state;
}

static inline PickleState *
_Pickle_FindStateByType(TyTypeObject *tp)
{
    TyObject *module = TyType_GetModuleByDef(tp, &_picklemodule);
    assert(module != NULL);
    return _Pickle_GetState(module);
}

/* Clear the given pickle module state. */
static void
_Pickle_ClearState(PickleState *st)
{
    Ty_CLEAR(st->PickleError);
    Ty_CLEAR(st->PicklingError);
    Ty_CLEAR(st->UnpicklingError);
    Ty_CLEAR(st->dispatch_table);
    Ty_CLEAR(st->extension_registry);
    Ty_CLEAR(st->extension_cache);
    Ty_CLEAR(st->inverted_registry);
    Ty_CLEAR(st->name_mapping_2to3);
    Ty_CLEAR(st->import_mapping_2to3);
    Ty_CLEAR(st->name_mapping_3to2);
    Ty_CLEAR(st->import_mapping_3to2);
    Ty_CLEAR(st->codecs_encode);
    Ty_CLEAR(st->getattr);
    Ty_CLEAR(st->partial);
    Ty_CLEAR(st->Pickler_Type);
    Ty_CLEAR(st->Unpickler_Type);
    Ty_CLEAR(st->Pdata_Type);
    Ty_CLEAR(st->PicklerMemoProxyType);
    Ty_CLEAR(st->UnpicklerMemoProxyType);
}

/* Initialize the given pickle module state. */
static int
_Pickle_InitState(PickleState *st)
{
    TyObject *copyreg = NULL;
    TyObject *compat_pickle = NULL;

    st->getattr = _TyEval_GetBuiltin(&_Ty_ID(getattr));
    if (st->getattr == NULL)
        goto error;

    copyreg = TyImport_ImportModule("copyreg");
    if (!copyreg)
        goto error;
    st->dispatch_table = PyObject_GetAttrString(copyreg, "dispatch_table");
    if (!st->dispatch_table)
        goto error;
    if (!TyDict_CheckExact(st->dispatch_table)) {
        TyErr_Format(TyExc_RuntimeError,
                     "copyreg.dispatch_table should be a dict, not %.200s",
                     Ty_TYPE(st->dispatch_table)->tp_name);
        goto error;
    }
    st->extension_registry = \
        PyObject_GetAttrString(copyreg, "_extension_registry");
    if (!st->extension_registry)
        goto error;
    if (!TyDict_CheckExact(st->extension_registry)) {
        TyErr_Format(TyExc_RuntimeError,
                     "copyreg._extension_registry should be a dict, "
                     "not %.200s", Ty_TYPE(st->extension_registry)->tp_name);
        goto error;
    }
    st->inverted_registry = \
        PyObject_GetAttrString(copyreg, "_inverted_registry");
    if (!st->inverted_registry)
        goto error;
    if (!TyDict_CheckExact(st->inverted_registry)) {
        TyErr_Format(TyExc_RuntimeError,
                     "copyreg._inverted_registry should be a dict, "
                     "not %.200s", Ty_TYPE(st->inverted_registry)->tp_name);
        goto error;
    }
    st->extension_cache = PyObject_GetAttrString(copyreg, "_extension_cache");
    if (!st->extension_cache)
        goto error;
    if (!TyDict_CheckExact(st->extension_cache)) {
        TyErr_Format(TyExc_RuntimeError,
                     "copyreg._extension_cache should be a dict, "
                     "not %.200s", Ty_TYPE(st->extension_cache)->tp_name);
        goto error;
    }
    Ty_CLEAR(copyreg);

    /* Load the 2.x -> 3.x stdlib module mapping tables */
    compat_pickle = TyImport_ImportModule("_compat_pickle");
    if (!compat_pickle)
        goto error;
    st->name_mapping_2to3 = \
        PyObject_GetAttrString(compat_pickle, "NAME_MAPPING");
    if (!st->name_mapping_2to3)
        goto error;
    if (!TyDict_CheckExact(st->name_mapping_2to3)) {
        TyErr_Format(TyExc_RuntimeError,
                     "_compat_pickle.NAME_MAPPING should be a dict, not %.200s",
                     Ty_TYPE(st->name_mapping_2to3)->tp_name);
        goto error;
    }
    st->import_mapping_2to3 = \
        PyObject_GetAttrString(compat_pickle, "IMPORT_MAPPING");
    if (!st->import_mapping_2to3)
        goto error;
    if (!TyDict_CheckExact(st->import_mapping_2to3)) {
        TyErr_Format(TyExc_RuntimeError,
                     "_compat_pickle.IMPORT_MAPPING should be a dict, "
                     "not %.200s", Ty_TYPE(st->import_mapping_2to3)->tp_name);
        goto error;
    }
    /* ... and the 3.x -> 2.x mapping tables */
    st->name_mapping_3to2 = \
        PyObject_GetAttrString(compat_pickle, "REVERSE_NAME_MAPPING");
    if (!st->name_mapping_3to2)
        goto error;
    if (!TyDict_CheckExact(st->name_mapping_3to2)) {
        TyErr_Format(TyExc_RuntimeError,
                     "_compat_pickle.REVERSE_NAME_MAPPING should be a dict, "
                     "not %.200s", Ty_TYPE(st->name_mapping_3to2)->tp_name);
        goto error;
    }
    st->import_mapping_3to2 = \
        PyObject_GetAttrString(compat_pickle, "REVERSE_IMPORT_MAPPING");
    if (!st->import_mapping_3to2)
        goto error;
    if (!TyDict_CheckExact(st->import_mapping_3to2)) {
        TyErr_Format(TyExc_RuntimeError,
                     "_compat_pickle.REVERSE_IMPORT_MAPPING should be a dict, "
                     "not %.200s", Ty_TYPE(st->import_mapping_3to2)->tp_name);
        goto error;
    }
    Ty_CLEAR(compat_pickle);

    st->codecs_encode = TyImport_ImportModuleAttrString("codecs", "encode");
    if (st->codecs_encode == NULL) {
        goto error;
    }
    if (!PyCallable_Check(st->codecs_encode)) {
        TyErr_Format(TyExc_RuntimeError,
                     "codecs.encode should be a callable, not %.200s",
                     Ty_TYPE(st->codecs_encode)->tp_name);
        goto error;
    }

    st->partial = TyImport_ImportModuleAttrString("functools", "partial");
    if (!st->partial)
        goto error;

    return 0;

  error:
    Ty_CLEAR(copyreg);
    Ty_CLEAR(compat_pickle);
    _Pickle_ClearState(st);
    return -1;
}

/* Helper for calling a function with a single argument quickly.

   This function steals the reference of the given argument. */
static TyObject *
_Pickle_FastCall(TyObject *func, TyObject *obj)
{
    TyObject *result;

    result = PyObject_CallOneArg(func, obj);
    Ty_DECREF(obj);
    return result;
}

/*************************************************************************/

/* Internal data type used as the unpickling stack. */
typedef struct {
    PyObject_VAR_HEAD
    TyObject **data;
    int mark_set;          /* is MARK set? */
    Ty_ssize_t fence;      /* position of top MARK or 0 */
    Ty_ssize_t allocated;  /* number of slots in data allocated */
} Pdata;

#define Pdata_CAST(op)  ((Pdata *)(op))

static int
Pdata_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static void
Pdata_dealloc(TyObject *op)
{
    Pdata *self = Pdata_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    Ty_ssize_t i = Ty_SIZE(self);
    while (--i >= 0) {
        Ty_DECREF(self->data[i]);
    }
    TyMem_Free(self->data);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot pdata_slots[] = {
    {Ty_tp_dealloc, Pdata_dealloc},
    {Ty_tp_traverse, Pdata_traverse},
    {0, NULL},
};

static TyType_Spec pdata_spec = {
    .name = "_pickle.Pdata",
    .basicsize = sizeof(Pdata),
    .itemsize = sizeof(TyObject *),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = pdata_slots,
};

static TyObject *
Pdata_New(PickleState *state)
{
    Pdata *self;

    if (!(self = PyObject_GC_New(Pdata, state->Pdata_Type)))
        return NULL;
    Ty_SET_SIZE(self, 0);
    self->mark_set = 0;
    self->fence = 0;
    self->allocated = 8;
    self->data = TyMem_Malloc(self->allocated * sizeof(TyObject *));
    if (self->data) {
        PyObject_GC_Track(self);
        return (TyObject *)self;
    }
    Ty_DECREF(self);
    return TyErr_NoMemory();
}


/* Retain only the initial clearto items.  If clearto >= the current
 * number of items, this is a (non-erroneous) NOP.
 */
static int
Pdata_clear(Pdata *self, Ty_ssize_t clearto)
{
    Ty_ssize_t i = Ty_SIZE(self);

    assert(clearto >= self->fence);
    if (clearto >= i)
        return 0;

    while (--i >= clearto) {
        Ty_CLEAR(self->data[i]);
    }
    Ty_SET_SIZE(self, clearto);
    return 0;
}

static int
Pdata_grow(Pdata *self)
{
    TyObject **data = self->data;
    size_t allocated = (size_t)self->allocated;
    size_t new_allocated;

    new_allocated = (allocated >> 3) + 6;
    /* check for integer overflow */
    if (new_allocated > (size_t)PY_SSIZE_T_MAX - allocated)
        goto nomemory;
    new_allocated += allocated;
    TyMem_RESIZE(data, TyObject *, new_allocated);
    if (data == NULL)
        goto nomemory;

    self->data = data;
    self->allocated = (Ty_ssize_t)new_allocated;
    return 0;

  nomemory:
    TyErr_NoMemory();
    return -1;
}

static int
Pdata_stack_underflow(PickleState *st, Pdata *self)
{
    TyErr_SetString(st->UnpicklingError,
                    self->mark_set ?
                    "unexpected MARK found" :
                    "unpickling stack underflow");
    return -1;
}

/* D is a Pdata*.  Pop the topmost element and store it into V, which
 * must be an lvalue holding TyObject*.  On stack underflow, UnpicklingError
 * is raised and V is set to NULL.
 */
static TyObject *
Pdata_pop(PickleState *state, Pdata *self)
{
    if (Ty_SIZE(self) <= self->fence) {
        Pdata_stack_underflow(state, self);
        return NULL;
    }
    Ty_SET_SIZE(self, Ty_SIZE(self) - 1);
    return self->data[Ty_SIZE(self)];
}
#define PDATA_POP(S, D, V) do { (V) = Pdata_pop(S, (D)); } while (0)

static int
Pdata_push(Pdata *self, TyObject *obj)
{
    if (Ty_SIZE(self) == self->allocated && Pdata_grow(self) < 0) {
        return -1;
    }
    self->data[Ty_SIZE(self)] = obj;
    Ty_SET_SIZE(self, Ty_SIZE(self) + 1);
    return 0;
}

/* Push an object on stack, transferring its ownership to the stack. */
#define PDATA_PUSH(D, O, ER) do {                               \
        if (Pdata_push((D), (O)) < 0) return (ER); } while(0)

/* Push an object on stack, adding a new reference to the object. */
#define PDATA_APPEND(D, O, ER) do {                             \
        Ty_INCREF((O));                                         \
        if (Pdata_push((D), (O)) < 0) return (ER); } while(0)

static TyObject *
Pdata_poptuple(PickleState *state, Pdata *self, Ty_ssize_t start)
{
    TyObject *tuple;
    Ty_ssize_t len, i, j;

    if (start < self->fence) {
        Pdata_stack_underflow(state, self);
        return NULL;
    }
    len = Ty_SIZE(self) - start;
    tuple = TyTuple_New(len);
    if (tuple == NULL)
        return NULL;
    for (i = start, j = 0; j < len; i++, j++)
        TyTuple_SET_ITEM(tuple, j, self->data[i]);

    Ty_SET_SIZE(self, start);
    return tuple;
}

static TyObject *
Pdata_poplist(Pdata *self, Ty_ssize_t start)
{
    TyObject *list;
    Ty_ssize_t len, i, j;

    len = Ty_SIZE(self) - start;
    list = TyList_New(len);
    if (list == NULL)
        return NULL;
    for (i = start, j = 0; j < len; i++, j++)
        TyList_SET_ITEM(list, j, self->data[i]);

    Ty_SET_SIZE(self, start);
    return list;
}

typedef struct {
    TyObject *me_key;
    Ty_ssize_t me_value;
} PyMemoEntry;

typedef struct {
    size_t mt_mask;
    size_t mt_used;
    size_t mt_allocated;
    PyMemoEntry *mt_table;
} PyMemoTable;

typedef struct PicklerObject {
    PyObject_HEAD
    PyMemoTable *memo;          /* Memo table, keep track of the seen
                                   objects to support self-referential objects
                                   pickling. */
    TyObject *persistent_id;    /* persistent_id() method, can be NULL */
    TyObject *persistent_id_attr; /* instance attribute, can be NULL */
    TyObject *dispatch_table;   /* private dispatch_table, can be NULL */
    TyObject *reducer_override; /* hook for invoking user-defined callbacks
                                   instead of save_global when pickling
                                   functions and classes*/

    TyObject *write;            /* write() method of the output stream. */
    TyObject *output_buffer;    /* Write into a local bytearray buffer before
                                   flushing to the stream. */
    Ty_ssize_t output_len;      /* Length of output_buffer. */
    Ty_ssize_t max_output_len;  /* Allocation size of output_buffer. */
    int proto;                  /* Pickle protocol number, >= 0 */
    int bin;                    /* Boolean, true if proto > 0 */
    int framing;                /* True when framing is enabled, proto >= 4 */
    Ty_ssize_t frame_start;     /* Position in output_buffer where the
                                   current frame begins. -1 if there
                                   is no frame currently open. */

    Ty_ssize_t buf_size;        /* Size of the current buffered pickle data */
    int fast;                   /* Enable fast mode if set to a true value.
                                   The fast mode disable the usage of memo,
                                   therefore speeding the pickling process by
                                   not generating superfluous PUT opcodes. It
                                   should not be used if with self-referential
                                   objects. */
    int fast_nesting;
    int fix_imports;            /* Indicate whether Pickler should fix
                                   the name of globals for Python 2.x. */
    TyObject *fast_memo;
    TyObject *buffer_callback;  /* Callback for out-of-band buffers, or NULL */
} PicklerObject;

typedef struct UnpicklerObject {
    PyObject_HEAD
    Pdata *stack;               /* Pickle data stack, store unpickled objects. */

    /* The unpickler memo is just an array of TyObject *s. Using a dict
       is unnecessary, since the keys are contiguous ints. */
    TyObject **memo;
    size_t memo_size;       /* Capacity of the memo array */
    size_t memo_len;        /* Number of objects in the memo */

    TyObject *persistent_load;  /* persistent_load() method, can be NULL. */
    TyObject *persistent_load_attr;  /* instance attribute, can be NULL. */

    Ty_buffer buffer;
    char *input_buffer;
    char *input_line;
    Ty_ssize_t input_len;
    Ty_ssize_t next_read_idx;
    Ty_ssize_t prefetched_idx;  /* index of first prefetched byte */

    TyObject *read;             /* read() method of the input stream. */
    TyObject *readinto;         /* readinto() method of the input stream. */
    TyObject *readline;         /* readline() method of the input stream. */
    TyObject *peek;             /* peek() method of the input stream, or NULL */
    TyObject *buffers;          /* iterable of out-of-band buffers, or NULL */

    char *encoding;             /* Name of the encoding to be used for
                                   decoding strings pickled using Python
                                   2.x. The default value is "ASCII" */
    char *errors;               /* Name of errors handling scheme to used when
                                   decoding strings. The default value is
                                   "strict". */
    Ty_ssize_t *marks;          /* Mark stack, used for unpickling container
                                   objects. */
    Ty_ssize_t num_marks;       /* Number of marks in the mark stack. */
    Ty_ssize_t marks_size;      /* Current allocated size of the mark stack. */
    int proto;                  /* Protocol of the pickle loaded. */
    int fix_imports;            /* Indicate whether Unpickler should fix
                                   the name of globals pickled by Python 2.x. */
} UnpicklerObject;

typedef struct {
    PyObject_HEAD
    PicklerObject *pickler; /* Pickler whose memo table we're proxying. */
}  PicklerMemoProxyObject;

typedef struct {
    PyObject_HEAD
    UnpicklerObject *unpickler;
} UnpicklerMemoProxyObject;

#define PicklerObject_CAST(op)              ((PicklerObject *)(op))
#define UnpicklerObject_CAST(op)            ((UnpicklerObject *)(op))
#define PicklerMemoProxyObject_CAST(op)     ((PicklerMemoProxyObject *)(op))
#define UnpicklerMemoProxyObject_CAST(op)   ((UnpicklerMemoProxyObject *)(op))

/* Forward declarations */
static int save(PickleState *state, PicklerObject *, TyObject *, int);
static int save_reduce(PickleState *, PicklerObject *, TyObject *, TyObject *);

#include "clinic/_pickle.c.h"

/*************************************************************************
 A custom hashtable mapping void* to Python ints. This is used by the pickler
 for memoization. Using a custom hashtable rather than PyDict allows us to skip
 a bunch of unnecessary object creation. This makes a huge performance
 difference. */

#define MT_MINSIZE 8
#define PERTURB_SHIFT 5


static PyMemoTable *
PyMemoTable_New(void)
{
    PyMemoTable *memo = TyMem_Malloc(sizeof(PyMemoTable));
    if (memo == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    memo->mt_used = 0;
    memo->mt_allocated = MT_MINSIZE;
    memo->mt_mask = MT_MINSIZE - 1;
    memo->mt_table = TyMem_Malloc(MT_MINSIZE * sizeof(PyMemoEntry));
    if (memo->mt_table == NULL) {
        TyMem_Free(memo);
        TyErr_NoMemory();
        return NULL;
    }
    memset(memo->mt_table, 0, MT_MINSIZE * sizeof(PyMemoEntry));

    return memo;
}

static PyMemoTable *
PyMemoTable_Copy(PyMemoTable *self)
{
    PyMemoTable *new = PyMemoTable_New();
    if (new == NULL)
        return NULL;

    new->mt_used = self->mt_used;
    new->mt_allocated = self->mt_allocated;
    new->mt_mask = self->mt_mask;
    /* The table we get from _New() is probably smaller than we wanted.
       Free it and allocate one that's the right size. */
    TyMem_Free(new->mt_table);
    new->mt_table = TyMem_NEW(PyMemoEntry, self->mt_allocated);
    if (new->mt_table == NULL) {
        TyMem_Free(new);
        TyErr_NoMemory();
        return NULL;
    }
    for (size_t i = 0; i < self->mt_allocated; i++) {
        Ty_XINCREF(self->mt_table[i].me_key);
    }
    memcpy(new->mt_table, self->mt_table,
           sizeof(PyMemoEntry) * self->mt_allocated);

    return new;
}

static Ty_ssize_t
PyMemoTable_Size(PyMemoTable *self)
{
    return self->mt_used;
}

static int
PyMemoTable_Clear(PyMemoTable *self)
{
    Ty_ssize_t i = self->mt_allocated;

    while (--i >= 0) {
        Ty_XDECREF(self->mt_table[i].me_key);
    }
    self->mt_used = 0;
    memset(self->mt_table, 0, self->mt_allocated * sizeof(PyMemoEntry));
    return 0;
}

static void
PyMemoTable_Del(PyMemoTable *self)
{
    if (self == NULL)
        return;
    PyMemoTable_Clear(self);

    TyMem_Free(self->mt_table);
    TyMem_Free(self);
}

/* Since entries cannot be deleted from this hashtable, _PyMemoTable_Lookup()
   can be considerably simpler than dictobject.c's lookdict(). */
static PyMemoEntry *
_PyMemoTable_Lookup(PyMemoTable *self, TyObject *key)
{
    size_t i;
    size_t perturb;
    size_t mask = self->mt_mask;
    PyMemoEntry *table = self->mt_table;
    PyMemoEntry *entry;
    Ty_hash_t hash = (Ty_hash_t)key >> 3;

    i = hash & mask;
    entry = &table[i];
    if (entry->me_key == NULL || entry->me_key == key)
        return entry;

    for (perturb = hash; ; perturb >>= PERTURB_SHIFT) {
        i = (i << 2) + i + perturb + 1;
        entry = &table[i & mask];
        if (entry->me_key == NULL || entry->me_key == key)
            return entry;
    }
    Ty_UNREACHABLE();
}

/* Returns -1 on failure, 0 on success. */
static int
_PyMemoTable_ResizeTable(PyMemoTable *self, size_t min_size)
{
    PyMemoEntry *oldtable = NULL;
    PyMemoEntry *oldentry, *newentry;
    size_t new_size = MT_MINSIZE;
    size_t to_process;

    assert(min_size > 0);

    if (min_size > PY_SSIZE_T_MAX) {
        TyErr_NoMemory();
        return -1;
    }

    /* Find the smallest valid table size >= min_size. */
    while (new_size < min_size) {
        new_size <<= 1;
    }
    /* new_size needs to be a power of two. */
    assert((new_size & (new_size - 1)) == 0);

    /* Allocate new table. */
    oldtable = self->mt_table;
    self->mt_table = TyMem_NEW(PyMemoEntry, new_size);
    if (self->mt_table == NULL) {
        self->mt_table = oldtable;
        TyErr_NoMemory();
        return -1;
    }
    self->mt_allocated = new_size;
    self->mt_mask = new_size - 1;
    memset(self->mt_table, 0, sizeof(PyMemoEntry) * new_size);

    /* Copy entries from the old table. */
    to_process = self->mt_used;
    for (oldentry = oldtable; to_process > 0; oldentry++) {
        if (oldentry->me_key != NULL) {
            to_process--;
            /* newentry is a pointer to a chunk of the new
               mt_table, so we're setting the key:value pair
               in-place. */
            newentry = _PyMemoTable_Lookup(self, oldentry->me_key);
            newentry->me_key = oldentry->me_key;
            newentry->me_value = oldentry->me_value;
        }
    }

    /* Deallocate the old table. */
    TyMem_Free(oldtable);
    return 0;
}

/* Returns NULL on failure, a pointer to the value otherwise. */
static Ty_ssize_t *
PyMemoTable_Get(PyMemoTable *self, TyObject *key)
{
    PyMemoEntry *entry = _PyMemoTable_Lookup(self, key);
    if (entry->me_key == NULL)
        return NULL;
    return &entry->me_value;
}

/* Returns -1 on failure, 0 on success. */
static int
PyMemoTable_Set(PyMemoTable *self, TyObject *key, Ty_ssize_t value)
{
    PyMemoEntry *entry;

    assert(key != NULL);

    entry = _PyMemoTable_Lookup(self, key);
    if (entry->me_key != NULL) {
        entry->me_value = value;
        return 0;
    }
    entry->me_key = Ty_NewRef(key);
    entry->me_value = value;
    self->mt_used++;

    /* If we added a key, we can safely resize. Otherwise just return!
     * If used >= 2/3 size, adjust size. Normally, this quaduples the size.
     *
     * Quadrupling the size improves average table sparseness
     * (reducing collisions) at the cost of some memory. It also halves
     * the number of expensive resize operations in a growing memo table.
     *
     * Very large memo tables (over 50K items) use doubling instead.
     * This may help applications with severe memory constraints.
     */
    if (SIZE_MAX / 3 >= self->mt_used && self->mt_used * 3 < self->mt_allocated * 2) {
        return 0;
    }
    // self->mt_used is always < PY_SSIZE_T_MAX, so this can't overflow.
    size_t desired_size = (self->mt_used > 50000 ? 2 : 4) * self->mt_used;
    return _PyMemoTable_ResizeTable(self, desired_size);
}

#undef MT_MINSIZE
#undef PERTURB_SHIFT

/*************************************************************************/


static int
_Pickler_ClearBuffer(PicklerObject *self)
{
    Ty_XSETREF(self->output_buffer,
              TyBytes_FromStringAndSize(NULL, self->max_output_len));
    if (self->output_buffer == NULL)
        return -1;
    self->output_len = 0;
    self->frame_start = -1;
    return 0;
}

static void
_write_size64(char *out, size_t value)
{
    size_t i;

    static_assert(sizeof(size_t) <= 8, "size_t is larger than 64-bit");

    for (i = 0; i < sizeof(size_t); i++) {
        out[i] = (unsigned char)((value >> (8 * i)) & 0xff);
    }
    for (i = sizeof(size_t); i < 8; i++) {
        out[i] = 0;
    }
}

static int
_Pickler_CommitFrame(PicklerObject *self)
{
    size_t frame_len;
    char *qdata;

    if (!self->framing || self->frame_start == -1)
        return 0;
    frame_len = self->output_len - self->frame_start - FRAME_HEADER_SIZE;
    qdata = TyBytes_AS_STRING(self->output_buffer) + self->frame_start;
    if (frame_len >= FRAME_SIZE_MIN) {
        qdata[0] = FRAME;
        _write_size64(qdata + 1, frame_len);
    }
    else {
        memmove(qdata, qdata + FRAME_HEADER_SIZE, frame_len);
        self->output_len -= FRAME_HEADER_SIZE;
    }
    self->frame_start = -1;
    return 0;
}

static TyObject *
_Pickler_GetString(PicklerObject *self)
{
    TyObject *output_buffer = self->output_buffer;

    assert(self->output_buffer != NULL);

    if (_Pickler_CommitFrame(self))
        return NULL;

    self->output_buffer = NULL;
    /* Resize down to exact size */
    if (_TyBytes_Resize(&output_buffer, self->output_len) < 0)
        return NULL;
    return output_buffer;
}

static int
_Pickler_FlushToFile(PicklerObject *self)
{
    TyObject *output, *result;

    assert(self->write != NULL);

    /* This will commit the frame first */
    output = _Pickler_GetString(self);
    if (output == NULL)
        return -1;

    result = _Pickle_FastCall(self->write, output);
    Ty_XDECREF(result);
    return (result == NULL) ? -1 : 0;
}

static int
_Pickler_OpcodeBoundary(PicklerObject *self)
{
    Ty_ssize_t frame_len;

    if (!self->framing || self->frame_start == -1) {
        return 0;
    }
    frame_len = self->output_len - self->frame_start - FRAME_HEADER_SIZE;
    if (frame_len >= FRAME_SIZE_TARGET) {
        if(_Pickler_CommitFrame(self)) {
            return -1;
        }
        /* Flush the content of the committed frame to the underlying
         * file and reuse the pickler buffer for the next frame so as
         * to limit memory usage when dumping large complex objects to
         * a file.
         *
         * self->write is NULL when called via dumps.
         */
        if (self->write != NULL) {
            if (_Pickler_FlushToFile(self) < 0) {
                return -1;
            }
            if (_Pickler_ClearBuffer(self) < 0) {
                return -1;
            }
        }
    }
    return 0;
}

static Ty_ssize_t
_Pickler_Write(PicklerObject *self, const char *s, Ty_ssize_t data_len)
{
    Ty_ssize_t i, n, required;
    char *buffer;
    int need_new_frame;

    assert(s != NULL);
    need_new_frame = (self->framing && self->frame_start == -1);

    if (need_new_frame)
        n = data_len + FRAME_HEADER_SIZE;
    else
        n = data_len;

    required = self->output_len + n;
    if (required > self->max_output_len) {
        /* Make place in buffer for the pickle chunk */
        if (self->output_len >= PY_SSIZE_T_MAX / 2 - n) {
            TyErr_NoMemory();
            return -1;
        }
        self->max_output_len = (self->output_len + n) / 2 * 3;
        if (_TyBytes_Resize(&self->output_buffer, self->max_output_len) < 0)
            return -1;
    }
    buffer = TyBytes_AS_STRING(self->output_buffer);
    if (need_new_frame) {
        /* Setup new frame */
        Ty_ssize_t frame_start = self->output_len;
        self->frame_start = frame_start;
        for (i = 0; i < FRAME_HEADER_SIZE; i++) {
            /* Write an invalid value, for debugging */
            buffer[frame_start + i] = 0xFE;
        }
        self->output_len += FRAME_HEADER_SIZE;
    }
    if (data_len < 8) {
        /* This is faster than memcpy when the string is short. */
        for (i = 0; i < data_len; i++) {
            buffer[self->output_len + i] = s[i];
        }
    }
    else {
        memcpy(buffer + self->output_len, s, data_len);
    }
    self->output_len += data_len;
    return data_len;
}

static PicklerObject *
_Pickler_New(PickleState *st)
{
    PyMemoTable *memo = PyMemoTable_New();
    if (memo == NULL) {
        return NULL;
    }

    const Ty_ssize_t max_output_len = WRITE_BUF_SIZE;
    TyObject *output_buffer = TyBytes_FromStringAndSize(NULL, max_output_len);
    if (output_buffer == NULL) {
        goto error;
    }

    PicklerObject *self = PyObject_GC_New(PicklerObject, st->Pickler_Type);
    if (self == NULL) {
        goto error;
    }

    self->memo = memo;
    self->persistent_id = NULL;
    self->persistent_id_attr = NULL;
    self->dispatch_table = NULL;
    self->reducer_override = NULL;
    self->write = NULL;
    self->output_buffer = output_buffer;
    self->output_len = 0;
    self->max_output_len = max_output_len;
    self->proto = 0;
    self->bin = 0;
    self->framing = 0;
    self->frame_start = -1;
    self->buf_size = 0;
    self->fast = 0;
    self->fast_nesting = 0;
    self->fix_imports = 0;
    self->fast_memo = NULL;
    self->buffer_callback = NULL;

    PyObject_GC_Track(self);
    return self;

error:
    TyMem_Free(memo);
    Ty_XDECREF(output_buffer);
    return NULL;
}

static int
_Pickler_SetProtocol(PicklerObject *self, TyObject *protocol, int fix_imports)
{
    long proto;

    if (protocol == Ty_None) {
        proto = DEFAULT_PROTOCOL;
    }
    else {
        proto = TyLong_AsLong(protocol);
        if (proto < 0) {
            if (proto == -1 && TyErr_Occurred())
                return -1;
            proto = HIGHEST_PROTOCOL;
        }
        else if (proto > HIGHEST_PROTOCOL) {
            TyErr_Format(TyExc_ValueError, "pickle protocol must be <= %d",
                         HIGHEST_PROTOCOL);
            return -1;
        }
    }
    self->proto = (int)proto;
    self->bin = proto > 0;
    self->fix_imports = fix_imports && proto < 3;
    return 0;
}

/* Returns -1 (with an exception set) on failure, 0 on success. This may
   be called once on a freshly created Pickler. */
static int
_Pickler_SetOutputStream(PicklerObject *self, TyObject *file)
{
    assert(file != NULL);
    if (PyObject_GetOptionalAttr(file, &_Ty_ID(write), &self->write) < 0) {
        return -1;
    }
    if (self->write == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "file must have a 'write' attribute");
        return -1;
    }

    return 0;
}

static int
_Pickler_SetBufferCallback(PicklerObject *self, TyObject *buffer_callback)
{
    if (buffer_callback == Ty_None) {
        buffer_callback = NULL;
    }
    if (buffer_callback != NULL && self->proto < 5) {
        TyErr_SetString(TyExc_ValueError,
                        "buffer_callback needs protocol >= 5");
        return -1;
    }

    self->buffer_callback = Ty_XNewRef(buffer_callback);
    return 0;
}

/* Returns the size of the input on success, -1 on failure. This takes its
   own reference to `input`. */
static Ty_ssize_t
_Unpickler_SetStringInput(UnpicklerObject *self, TyObject *input)
{
    if (self->buffer.buf != NULL)
        PyBuffer_Release(&self->buffer);
    if (PyObject_GetBuffer(input, &self->buffer, PyBUF_CONTIG_RO) < 0)
        return -1;
    self->input_buffer = self->buffer.buf;
    self->input_len = self->buffer.len;
    self->next_read_idx = 0;
    self->prefetched_idx = self->input_len;
    return self->input_len;
}

static int
bad_readline(PickleState *st)
{
    TyErr_SetString(st->UnpicklingError, "pickle data was truncated");
    return -1;
}

/* Skip any consumed data that was only prefetched using peek() */
static int
_Unpickler_SkipConsumed(UnpicklerObject *self)
{
    Ty_ssize_t consumed;
    TyObject *r;

    consumed = self->next_read_idx - self->prefetched_idx;
    if (consumed <= 0)
        return 0;

    assert(self->peek);  /* otherwise we did something wrong */
    /* This makes a useless copy... */
    r = PyObject_CallFunction(self->read, "n", consumed);
    if (r == NULL)
        return -1;
    Ty_DECREF(r);

    self->prefetched_idx = self->next_read_idx;
    return 0;
}

static const Ty_ssize_t READ_WHOLE_LINE = -1;

/* If reading from a file, we need to only pull the bytes we need, since there
   may be multiple pickle objects arranged contiguously in the same input
   buffer.

   If `n` is READ_WHOLE_LINE, read a whole line. Otherwise, read up to `n`
   bytes from the input stream/buffer.

   Update the unpickler's input buffer with the newly-read data. Returns -1 on
   failure; on success, returns the number of bytes read from the file.

   On success, self->input_len will be 0; this is intentional so that when
   unpickling from a file, the "we've run out of data" code paths will trigger,
   causing the Unpickler to go back to the file for more data. Use the returned
   size to tell you how much data you can process. */
static Ty_ssize_t
_Unpickler_ReadFromFile(UnpicklerObject *self, Ty_ssize_t n)
{
    TyObject *data;
    Ty_ssize_t read_size;

    assert(self->read != NULL);

    if (_Unpickler_SkipConsumed(self) < 0)
        return -1;

    if (n == READ_WHOLE_LINE) {
        data = PyObject_CallNoArgs(self->readline);
    }
    else {
        TyObject *len;
        /* Prefetch some data without advancing the file pointer, if possible */
        if (self->peek && n < PREFETCH) {
            len = TyLong_FromSsize_t(PREFETCH);
            if (len == NULL)
                return -1;
            data = _Pickle_FastCall(self->peek, len);
            if (data == NULL) {
                if (!TyErr_ExceptionMatches(TyExc_NotImplementedError))
                    return -1;
                /* peek() is probably not supported by the given file object */
                TyErr_Clear();
                Ty_CLEAR(self->peek);
            }
            else {
                read_size = _Unpickler_SetStringInput(self, data);
                Ty_DECREF(data);
                if (read_size < 0) {
                    return -1;
                }

                self->prefetched_idx = 0;
                if (n <= read_size)
                    return n;
            }
        }
        len = TyLong_FromSsize_t(n);
        if (len == NULL)
            return -1;
        data = _Pickle_FastCall(self->read, len);
    }
    if (data == NULL)
        return -1;

    read_size = _Unpickler_SetStringInput(self, data);
    Ty_DECREF(data);
    return read_size;
}

/* Don't call it directly: use _Unpickler_Read() */
static Ty_ssize_t
_Unpickler_ReadImpl(UnpicklerObject *self, PickleState *st, char **s, Ty_ssize_t n)
{
    Ty_ssize_t num_read;

    *s = NULL;
    if (self->next_read_idx > PY_SSIZE_T_MAX - n) {
        TyErr_SetString(st->UnpicklingError,
                        "read would overflow (invalid bytecode)");
        return -1;
    }

    /* This case is handled by the _Unpickler_Read() macro for efficiency */
    assert(self->next_read_idx + n > self->input_len);

    if (!self->read)
        return bad_readline(st);

    /* Extend the buffer to satisfy desired size */
    num_read = _Unpickler_ReadFromFile(self, n);
    if (num_read < 0)
        return -1;
    if (num_read < n)
        return bad_readline(st);
    *s = self->input_buffer;
    self->next_read_idx = n;
    return n;
}

/* Read `n` bytes from the unpickler's data source, storing the result in `buf`.
 *
 * This should only be used for non-small data reads where potentially
 * avoiding a copy is beneficial.  This method does not try to prefetch
 * more data into the input buffer.
 *
 * _Unpickler_Read() is recommended in most cases.
 */
static Ty_ssize_t
_Unpickler_ReadInto(PickleState *state, UnpicklerObject *self, char *buf,
                    Ty_ssize_t n)
{
    assert(n != READ_WHOLE_LINE);

    /* Read from available buffer data, if any */
    Ty_ssize_t in_buffer = self->input_len - self->next_read_idx;
    if (in_buffer > 0) {
        Ty_ssize_t to_read = Ty_MIN(in_buffer, n);
        memcpy(buf, self->input_buffer + self->next_read_idx, to_read);
        self->next_read_idx += to_read;
        buf += to_read;
        n -= to_read;
        if (n == 0) {
            /* Entire read was satisfied from buffer */
            return n;
        }
    }

    /* Read from file */
    if (!self->read) {
        /* We're unpickling memory, this means the input is truncated */
        return bad_readline(state);
    }
    if (_Unpickler_SkipConsumed(self) < 0) {
        return -1;
    }

    if (!self->readinto) {
        /* readinto() not supported on file-like object, fall back to read()
         * and copy into destination buffer (bpo-39681) */
        TyObject* len = TyLong_FromSsize_t(n);
        if (len == NULL) {
            return -1;
        }
        TyObject* data = _Pickle_FastCall(self->read, len);
        if (data == NULL) {
            return -1;
        }
        if (!TyBytes_Check(data)) {
            TyErr_Format(TyExc_ValueError,
                         "read() returned non-bytes object (%R)",
                         Ty_TYPE(data));
            Ty_DECREF(data);
            return -1;
        }
        Ty_ssize_t read_size = TyBytes_GET_SIZE(data);
        if (read_size < n) {
            Ty_DECREF(data);
            return bad_readline(state);
        }
        memcpy(buf, TyBytes_AS_STRING(data), n);
        Ty_DECREF(data);
        return n;
    }

    /* Call readinto() into user buffer */
    TyObject *buf_obj = TyMemoryView_FromMemory(buf, n, PyBUF_WRITE);
    if (buf_obj == NULL) {
        return -1;
    }
    TyObject *read_size_obj = _Pickle_FastCall(self->readinto, buf_obj);
    if (read_size_obj == NULL) {
        return -1;
    }
    Ty_ssize_t read_size = TyLong_AsSsize_t(read_size_obj);
    Ty_DECREF(read_size_obj);

    if (read_size < 0) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError,
                            "readinto() returned negative size");
        }
        return -1;
    }
    if (read_size < n) {
        return bad_readline(state);
    }
    return n;
}

/* Read `n` bytes from the unpickler's data source, storing the result in `*s`.

   This should be used for all data reads, rather than accessing the unpickler's
   input buffer directly. This method deals correctly with reading from input
   streams, which the input buffer doesn't deal with.

   Note that when reading from a file-like object, self->next_read_idx won't
   be updated (it should remain at 0 for the entire unpickling process). You
   should use this function's return value to know how many bytes you can
   consume.

   Returns -1 (with an exception set) on failure. On success, return the
   number of chars read. */
#define _Unpickler_Read(self, state, s, n) \
    (((n) <= (self)->input_len - (self)->next_read_idx)      \
     ? (*(s) = (self)->input_buffer + (self)->next_read_idx, \
        (self)->next_read_idx += (n),                        \
        (n))                                                 \
     : _Unpickler_ReadImpl(self, state, (s), (n)))

static Ty_ssize_t
_Unpickler_CopyLine(UnpicklerObject *self, char *line, Ty_ssize_t len,
                    char **result)
{
    char *input_line = TyMem_Realloc(self->input_line, len + 1);
    if (input_line == NULL) {
        TyErr_NoMemory();
        return -1;
    }

    memcpy(input_line, line, len);
    input_line[len] = '\0';
    self->input_line = input_line;
    *result = self->input_line;
    return len;
}

/* Read a line from the input stream/buffer. If we run off the end of the input
   before hitting \n, raise an error.

   Returns the number of chars read, or -1 on failure. */
static Ty_ssize_t
_Unpickler_Readline(PickleState *state, UnpicklerObject *self, char **result)
{
    Ty_ssize_t i, num_read;

    for (i = self->next_read_idx; i < self->input_len; i++) {
        if (self->input_buffer[i] == '\n') {
            char *line_start = self->input_buffer + self->next_read_idx;
            num_read = i - self->next_read_idx + 1;
            self->next_read_idx = i + 1;
            return _Unpickler_CopyLine(self, line_start, num_read, result);
        }
    }
    if (!self->read)
        return bad_readline(state);

    num_read = _Unpickler_ReadFromFile(self, READ_WHOLE_LINE);
    if (num_read < 0)
        return -1;
    if (num_read == 0 || self->input_buffer[num_read - 1] != '\n')
        return bad_readline(state);
    self->next_read_idx = num_read;
    return _Unpickler_CopyLine(self, self->input_buffer, num_read, result);
}

/* Returns -1 (with an exception set) on failure, 0 on success. The memo array
   will be modified in place. */
static int
_Unpickler_ResizeMemoList(UnpicklerObject *self, size_t new_size)
{
    size_t i;

    assert(new_size > self->memo_size);

    TyObject **memo_new = self->memo;
    TyMem_RESIZE(memo_new, TyObject *, new_size);
    if (memo_new == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    self->memo = memo_new;
    for (i = self->memo_size; i < new_size; i++)
        self->memo[i] = NULL;
    self->memo_size = new_size;
    return 0;
}

/* Returns NULL if idx is out of bounds. */
static TyObject *
_Unpickler_MemoGet(UnpicklerObject *self, size_t idx)
{
    if (idx >= self->memo_size)
        return NULL;

    return self->memo[idx];
}

/* Returns -1 (with an exception set) on failure, 0 on success.
   This takes its own reference to `value`. */
static int
_Unpickler_MemoPut(UnpicklerObject *self, size_t idx, TyObject *value)
{
    TyObject *old_item;

    if (idx >= self->memo_size) {
        if (_Unpickler_ResizeMemoList(self, idx * 2) < 0)
            return -1;
        assert(idx < self->memo_size);
    }
    old_item = self->memo[idx];
    self->memo[idx] = Ty_NewRef(value);
    if (old_item != NULL) {
        Ty_DECREF(old_item);
    }
    else {
        self->memo_len++;
    }
    return 0;
}

static TyObject **
_Unpickler_NewMemo(Ty_ssize_t new_size)
{
    TyObject **memo = TyMem_NEW(TyObject *, new_size);
    if (memo == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    memset(memo, 0, new_size * sizeof(TyObject *));
    return memo;
}

/* Free the unpickler's memo, taking care to decref any items left in it. */
static void
_Unpickler_MemoCleanup(UnpicklerObject *self)
{
    Ty_ssize_t i;
    TyObject **memo = self->memo;

    if (self->memo == NULL)
        return;
    self->memo = NULL;
    i = self->memo_size;
    while (--i >= 0) {
        Ty_XDECREF(memo[i]);
    }
    TyMem_Free(memo);
}

static UnpicklerObject *
_Unpickler_New(TyObject *module)
{
    const int MEMO_SIZE = 32;
    TyObject **memo = _Unpickler_NewMemo(MEMO_SIZE);
    if (memo == NULL) {
        return NULL;
    }

    PickleState *st = _Pickle_GetState(module);
    TyObject *stack = Pdata_New(st);
    if (stack == NULL) {
        goto error;
    }

    UnpicklerObject *self = PyObject_GC_New(UnpicklerObject,
                                            st->Unpickler_Type);
    if (self == NULL) {
        goto error;
    }

    self->stack = (Pdata *)stack;
    self->memo = memo;
    self->memo_size = MEMO_SIZE;
    self->memo_len = 0;
    self->persistent_load = NULL;
    self->persistent_load_attr = NULL;
    memset(&self->buffer, 0, sizeof(Ty_buffer));
    self->input_buffer = NULL;
    self->input_line = NULL;
    self->input_len = 0;
    self->next_read_idx = 0;
    self->prefetched_idx = 0;
    self->read = NULL;
    self->readinto = NULL;
    self->readline = NULL;
    self->peek = NULL;
    self->buffers = NULL;
    self->encoding = NULL;
    self->errors = NULL;
    self->marks = NULL;
    self->num_marks = 0;
    self->marks_size = 0;
    self->proto = 0;
    self->fix_imports = 0;

    PyObject_GC_Track(self);
    return self;

error:
    TyMem_Free(memo);
    Ty_XDECREF(stack);
    return NULL;
}

/* Returns -1 (with an exception set) on failure, 0 on success. This may
   be called once on a freshly created Unpickler. */
static int
_Unpickler_SetInputStream(UnpicklerObject *self, TyObject *file)
{
    /* Optional file methods */
    if (PyObject_GetOptionalAttr(file, &_Ty_ID(peek), &self->peek) < 0) {
        goto error;
    }
    if (PyObject_GetOptionalAttr(file, &_Ty_ID(readinto), &self->readinto) < 0) {
        goto error;
    }
    if (PyObject_GetOptionalAttr(file, &_Ty_ID(read), &self->read) < 0) {
        goto error;
    }
    if (PyObject_GetOptionalAttr(file, &_Ty_ID(readline), &self->readline) < 0) {
        goto error;
    }
    if (!self->readline || !self->read) {
        TyErr_SetString(TyExc_TypeError,
                        "file must have 'read' and 'readline' attributes");
        goto error;
    }
    return 0;

error:
    Ty_CLEAR(self->read);
    Ty_CLEAR(self->readinto);
    Ty_CLEAR(self->readline);
    Ty_CLEAR(self->peek);
    return -1;
}

/* Returns -1 (with an exception set) on failure, 0 on success. This may
   be called once on a freshly created Unpickler. */
static int
_Unpickler_SetInputEncoding(UnpicklerObject *self,
                            const char *encoding,
                            const char *errors)
{
    if (encoding == NULL)
        encoding = "ASCII";
    if (errors == NULL)
        errors = "strict";

    self->encoding = _TyMem_Strdup(encoding);
    self->errors = _TyMem_Strdup(errors);
    if (self->encoding == NULL || self->errors == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    return 0;
}

/* Returns -1 (with an exception set) on failure, 0 on success. This may
   be called once on a freshly created Unpickler. */
static int
_Unpickler_SetBuffers(UnpicklerObject *self, TyObject *buffers)
{
    if (buffers == NULL || buffers == Ty_None) {
        self->buffers = NULL;
    }
    else {
        self->buffers = PyObject_GetIter(buffers);
        if (self->buffers == NULL) {
            return -1;
        }
    }
    return 0;
}

/* Generate a GET opcode for an object stored in the memo. */
static int
memo_get(PickleState *st, PicklerObject *self, TyObject *key)
{
    Ty_ssize_t *value;
    char pdata[30];
    Ty_ssize_t len;

    value = PyMemoTable_Get(self->memo, key);
    if (value == NULL)  {
        TyErr_SetObject(TyExc_KeyError, key);
        return -1;
    }

    if (!self->bin) {
        pdata[0] = GET;
        TyOS_snprintf(pdata + 1, sizeof(pdata) - 1,
                      "%zd\n", *value);
        len = strlen(pdata);
    }
    else {
        if (*value < 256) {
            pdata[0] = BINGET;
            pdata[1] = (unsigned char)(*value & 0xff);
            len = 2;
        }
        else if ((size_t)*value <= 0xffffffffUL) {
            pdata[0] = LONG_BINGET;
            pdata[1] = (unsigned char)(*value & 0xff);
            pdata[2] = (unsigned char)((*value >> 8) & 0xff);
            pdata[3] = (unsigned char)((*value >> 16) & 0xff);
            pdata[4] = (unsigned char)((*value >> 24) & 0xff);
            len = 5;
        }
        else { /* unlikely */
            TyErr_SetString(st->PicklingError,
                            "memo id too large for LONG_BINGET");
            return -1;
        }
    }

    if (_Pickler_Write(self, pdata, len) < 0)
        return -1;

    return 0;
}

/* Store an object in the memo, assign it a new unique ID based on the number
   of objects currently stored in the memo and generate a PUT opcode. */
static int
memo_put(PickleState *st, PicklerObject *self, TyObject *obj)
{
    char pdata[30];
    Ty_ssize_t len;
    Ty_ssize_t idx;

    const char memoize_op = MEMOIZE;

    if (self->fast)
        return 0;

    idx = PyMemoTable_Size(self->memo);
    if (PyMemoTable_Set(self->memo, obj, idx) < 0)
        return -1;

    if (self->proto >= 4) {
        if (_Pickler_Write(self, &memoize_op, 1) < 0)
            return -1;
        return 0;
    }
    else if (!self->bin) {
        pdata[0] = PUT;
        TyOS_snprintf(pdata + 1, sizeof(pdata) - 1,
                      "%zd\n", idx);
        len = strlen(pdata);
    }
    else {
        if (idx < 256) {
            pdata[0] = BINPUT;
            pdata[1] = (unsigned char)idx;
            len = 2;
        }
        else if ((size_t)idx <= 0xffffffffUL) {
            pdata[0] = LONG_BINPUT;
            pdata[1] = (unsigned char)(idx & 0xff);
            pdata[2] = (unsigned char)((idx >> 8) & 0xff);
            pdata[3] = (unsigned char)((idx >> 16) & 0xff);
            pdata[4] = (unsigned char)((idx >> 24) & 0xff);
            len = 5;
        }
        else { /* unlikely */
            TyErr_SetString(st->PicklingError,
                            "memo id too large for LONG_BINPUT");
            return -1;
        }
    }
    if (_Pickler_Write(self, pdata, len) < 0)
        return -1;

    return 0;
}

static TyObject *
get_dotted_path(TyObject *name)
{
    return TyUnicode_Split(name, _Ty_LATIN1_CHR('.'), -1);
}

static int
check_dotted_path(PickleState *st, TyObject *obj, TyObject *dotted_path)
{
    Ty_ssize_t i, n;
    n = TyList_GET_SIZE(dotted_path);
    assert(n >= 1);
    for (i = 0; i < n; i++) {
        TyObject *subpath = TyList_GET_ITEM(dotted_path, i);
        if (_TyUnicode_EqualToASCIIString(subpath, "<locals>")) {
            TyErr_Format(st->PicklingError,
                         "Can't pickle local object %R", obj);
            return -1;
        }
    }
    return 0;
}

static TyObject *
getattribute(TyObject *obj, TyObject *names, int raises)
{
    Ty_ssize_t i, n;

    assert(TyList_CheckExact(names));
    Ty_INCREF(obj);
    n = TyList_GET_SIZE(names);
    for (i = 0; i < n; i++) {
        TyObject *name = TyList_GET_ITEM(names, i);
        TyObject *parent = obj;
        if (raises) {
            obj = PyObject_GetAttr(parent, name);
        }
        else {
            (void)PyObject_GetOptionalAttr(parent, name, &obj);
        }
        Ty_DECREF(parent);
        if (obj == NULL) {
            return NULL;
        }
    }
    return obj;
}

static int
_checkmodule(TyObject *module_name, TyObject *module,
             TyObject *global, TyObject *dotted_path)
{
    if (module == Ty_None) {
        return -1;
    }
    if (TyUnicode_Check(module_name) &&
            _TyUnicode_EqualToASCIIString(module_name, "__main__")) {
        return -1;
    }

    TyObject *candidate = getattribute(module, dotted_path, 0);
    if (candidate == NULL) {
        return -1;
    }
    if (candidate != global) {
        Ty_DECREF(candidate);
        return -1;
    }
    Ty_DECREF(candidate);
    return 0;
}

static TyObject *
whichmodule(PickleState *st, TyObject *global, TyObject *global_name, TyObject *dotted_path)
{
    TyObject *module_name;
    TyObject *module = NULL;
    Ty_ssize_t i;
    TyObject *modules;

    if (check_dotted_path(st, global, dotted_path) < 0) {
        return NULL;
    }
    if (PyObject_GetOptionalAttr(global, &_Ty_ID(__module__), &module_name) < 0) {
        return NULL;
    }
    if (module_name == NULL || module_name == Ty_None) {
        /* In some rare cases (e.g., bound methods of extension types),
           __module__ can be None. If it is so, then search sys.modules for
           the module of global. */
        Ty_CLEAR(module_name);
        modules = _TySys_GetRequiredAttr(&_Ty_ID(modules));
        if (modules == NULL) {
            return NULL;
        }
        if (TyDict_CheckExact(modules)) {
            i = 0;
            while (TyDict_Next(modules, &i, &module_name, &module)) {
                Ty_INCREF(module_name);
                Ty_INCREF(module);
                if (_checkmodule(module_name, module, global, dotted_path) == 0) {
                    Ty_DECREF(module);
                    Ty_DECREF(modules);
                    return module_name;
                }
                Ty_DECREF(module);
                Ty_DECREF(module_name);
                if (TyErr_Occurred()) {
                    Ty_DECREF(modules);
                    return NULL;
                }
            }
        }
        else {
            TyObject *iterator = PyObject_GetIter(modules);
            if (iterator == NULL) {
                Ty_DECREF(modules);
                return NULL;
            }
            while ((module_name = TyIter_Next(iterator))) {
                module = PyObject_GetItem(modules, module_name);
                if (module == NULL) {
                    Ty_DECREF(module_name);
                    Ty_DECREF(iterator);
                    Ty_DECREF(modules);
                    return NULL;
                }
                if (_checkmodule(module_name, module, global, dotted_path) == 0) {
                    Ty_DECREF(module);
                    Ty_DECREF(iterator);
                    Ty_DECREF(modules);
                    return module_name;
                }
                Ty_DECREF(module);
                Ty_DECREF(module_name);
                if (TyErr_Occurred()) {
                    Ty_DECREF(iterator);
                    Ty_DECREF(modules);
                    return NULL;
                }
            }
            Ty_DECREF(iterator);
        }
        Ty_DECREF(modules);
        if (TyErr_Occurred()) {
            return NULL;
        }

        /* If no module is found, use __main__. */
        module_name = Ty_NewRef(&_Ty_ID(__main__));
    }

    /* XXX: Change to use the import C API directly with level=0 to disallow
       relative imports.

       XXX: TyImport_ImportModuleLevel could be used. However, this bypasses
       builtins.__import__. Therefore, _pickle, unlike pickle.py, will ignore
       custom import functions (IMHO, this would be a nice security
       feature). The import C API would need to be extended to support the
       extra parameters of __import__ to fix that. */
    module = TyImport_Import(module_name);
    if (module == NULL) {
        if (TyErr_ExceptionMatches(TyExc_ImportError) ||
            TyErr_ExceptionMatches(TyExc_ValueError))
        {
            TyObject *exc = TyErr_GetRaisedException();
            TyErr_Format(st->PicklingError,
                         "Can't pickle %R: %S", global, exc);
            _TyErr_ChainExceptions1(exc);
        }
        Ty_DECREF(module_name);
        return NULL;
    }
    TyObject *actual = getattribute(module, dotted_path, 1);
    Ty_DECREF(module);
    if (actual == NULL) {
        assert(TyErr_Occurred());
        if (TyErr_ExceptionMatches(TyExc_AttributeError)) {
            TyObject *exc = TyErr_GetRaisedException();
            TyErr_Format(st->PicklingError,
                         "Can't pickle %R: it's not found as %S.%S",
                         global, module_name, global_name);
            _TyErr_ChainExceptions1(exc);
        }
        Ty_DECREF(module_name);
        return NULL;
    }
    if (actual != global) {
        Ty_DECREF(actual);
        TyErr_Format(st->PicklingError,
                     "Can't pickle %R: it's not the same object as %S.%S",
                     global, module_name, global_name);
        Ty_DECREF(module_name);
        return NULL;
    }
    Ty_DECREF(actual);
    return module_name;
}

/* fast_save_enter() and fast_save_leave() are guards against recursive
   objects when Pickler is used with the "fast mode" (i.e., with object
   memoization disabled). If the nesting of a list or dict object exceed
   FAST_NESTING_LIMIT, these guards will start keeping an internal
   reference to the seen list or dict objects and check whether these objects
   are recursive. These are not strictly necessary, since save() has a
   hard-coded recursion limit, but they give a nicer error message than the
   typical RuntimeError. */
static int
fast_save_enter(PicklerObject *self, TyObject *obj)
{
    /* if fast_nesting < 0, we're doing an error exit. */
    if (++self->fast_nesting >= FAST_NESTING_LIMIT) {
        TyObject *key = NULL;
        if (self->fast_memo == NULL) {
            self->fast_memo = TyDict_New();
            if (self->fast_memo == NULL) {
                self->fast_nesting = -1;
                return 0;
            }
        }
        key = TyLong_FromVoidPtr(obj);
        if (key == NULL) {
            self->fast_nesting = -1;
            return 0;
        }
        int r = TyDict_Contains(self->fast_memo, key);
        if (r > 0) {
            TyErr_Format(TyExc_ValueError,
                         "fast mode: can't pickle cyclic objects "
                         "including object type %.200s at %p",
                         Ty_TYPE(obj)->tp_name, obj);
        }
        else if (r == 0) {
            r = TyDict_SetItem(self->fast_memo, key, Ty_None);
        }
        Ty_DECREF(key);
        if (r != 0) {
            self->fast_nesting = -1;
            return 0;
        }
    }
    return 1;
}

static int
fast_save_leave(PicklerObject *self, TyObject *obj)
{
    if (self->fast_nesting-- >= FAST_NESTING_LIMIT) {
        TyObject *key = TyLong_FromVoidPtr(obj);
        if (key == NULL)
            return 0;
        if (TyDict_DelItem(self->fast_memo, key) < 0) {
            Ty_DECREF(key);
            return 0;
        }
        Ty_DECREF(key);
    }
    return 1;
}

static int
save_none(PicklerObject *self, TyObject *obj)
{
    const char none_op = NONE;
    if (_Pickler_Write(self, &none_op, 1) < 0)
        return -1;

    return 0;
}

static int
save_bool(PicklerObject *self, TyObject *obj)
{
    if (self->proto >= 2) {
        const char bool_op = (obj == Ty_True) ? NEWTRUE : NEWFALSE;
        if (_Pickler_Write(self, &bool_op, 1) < 0)
            return -1;
    }
    else {
        /* These aren't opcodes -- they're ways to pickle bools before protocol 2
         * so that unpicklers written before bools were introduced unpickle them
         * as ints, but unpicklers after can recognize that bools were intended.
         * Note that protocol 2 added direct ways to pickle bools.
         */
        const char *bool_str = (obj == Ty_True) ? "I01\n" : "I00\n";
        if (_Pickler_Write(self, bool_str, strlen(bool_str)) < 0)
            return -1;
    }
    return 0;
}

static int
save_long(PicklerObject *self, TyObject *obj)
{
    TyObject *repr = NULL;
    Ty_ssize_t size;
    long val;
    int overflow;
    int status = 0;

    val= TyLong_AsLongAndOverflow(obj, &overflow);
    if (!overflow && (sizeof(long) <= 4 ||
            (val <= 0x7fffffffL && val >= (-0x7fffffffL - 1))))
    {
        /* result fits in a signed 4-byte integer.

           Note: we can't use -0x80000000L in the above condition because some
           compilers (e.g., MSVC) will promote 0x80000000L to an unsigned type
           before applying the unary minus when sizeof(long) <= 4. The
           resulting value stays unsigned which is commonly not what we want,
           so MSVC happily warns us about it.  However, that result would have
           been fine because we guard for sizeof(long) <= 4 which turns the
           condition true in that particular case. */
        char pdata[32];
        Ty_ssize_t len = 0;

        if (self->bin) {
            pdata[1] = (unsigned char)(val & 0xff);
            pdata[2] = (unsigned char)((val >> 8) & 0xff);
            pdata[3] = (unsigned char)((val >> 16) & 0xff);
            pdata[4] = (unsigned char)((val >> 24) & 0xff);

            if ((pdata[4] != 0) || (pdata[3] != 0)) {
                pdata[0] = BININT;
                len = 5;
            }
            else if (pdata[2] != 0) {
                pdata[0] = BININT2;
                len = 3;
            }
            else {
                pdata[0] = BININT1;
                len = 2;
            }
        }
        else {
            sprintf(pdata, "%c%ld\n", INT,  val);
            len = strlen(pdata);
        }
        if (_Pickler_Write(self, pdata, len) < 0)
            return -1;

        return 0;
    }
    assert(!TyErr_Occurred());

    if (self->proto >= 2) {
        /* Linear-time pickling. */
        int64_t nbits;
        size_t nbytes;
        unsigned char *pdata;
        char header[5];
        int i;

        int sign;
        assert(TyLong_Check(obj));
        (void)TyLong_GetSign(obj, &sign);
        if (sign == 0) {
            header[0] = LONG1;
            header[1] = 0;      /* It's 0 -- an empty bytestring. */
            if (_Pickler_Write(self, header, 2) < 0)
                goto error;
            return 0;
        }
        nbits = _TyLong_NumBits(obj);
        assert(nbits >= 0);
        assert(!TyErr_Occurred());
        /* How many bytes do we need?  There are nbits >> 3 full
         * bytes of data, and nbits & 7 leftover bits.  If there
         * are any leftover bits, then we clearly need another
         * byte.  What's not so obvious is that we *probably*
         * need another byte even if there aren't any leftovers:
         * the most-significant bit of the most-significant byte
         * acts like a sign bit, and it's usually got a sense
         * opposite of the one we need.  The exception is ints
         * of the form -(2**(8*j-1)) for j > 0.  Such an int is
         * its own 256's-complement, so has the right sign bit
         * even without the extra byte.  That's a pain to check
         * for in advance, though, so we always grab an extra
         * byte at the start, and cut it back later if possible.
         */
        nbytes = (size_t)((nbits >> 3) + 1);
        if (nbytes > 0x7fffffffL) {
            TyErr_SetString(TyExc_OverflowError,
                            "int too large to pickle");
            goto error;
        }
        repr = TyBytes_FromStringAndSize(NULL, (Ty_ssize_t)nbytes);
        if (repr == NULL)
            goto error;
        pdata = (unsigned char *)TyBytes_AS_STRING(repr);
        i = _TyLong_AsByteArray((PyLongObject *)obj,
                                pdata, nbytes,
                                1 /* little endian */ , 1 /* signed */ ,
                                1 /* with exceptions */);
        if (i < 0)
            goto error;
        /* If the int is negative, this may be a byte more than
         * needed.  This is so iff the MSB is all redundant sign
         * bits.
         */
        if (sign < 0 &&
            nbytes > 1 &&
            pdata[nbytes - 1] == 0xff &&
            (pdata[nbytes - 2] & 0x80) != 0) {
            nbytes--;
        }

        if (nbytes < 256) {
            header[0] = LONG1;
            header[1] = (unsigned char)nbytes;
            size = 2;
        }
        else {
            header[0] = LONG4;
            size = (Ty_ssize_t) nbytes;
            for (i = 1; i < 5; i++) {
                header[i] = (unsigned char)(size & 0xff);
                size >>= 8;
            }
            size = 5;
        }
        if (_Pickler_Write(self, header, size) < 0 ||
            _Pickler_Write(self, (char *)pdata, (int)nbytes) < 0)
            goto error;
    }
    else {
        const char long_op = LONG;
        const char *string;

        /* proto < 2: write the repr and newline.  This is quadratic-time (in
           the number of digits), in both directions.  We add a trailing 'L'
           to the repr, for compatibility with Python 2.x. */

        repr = PyObject_Repr(obj);
        if (repr == NULL)
            goto error;

        string = TyUnicode_AsUTF8AndSize(repr, &size);
        if (string == NULL)
            goto error;

        if (_Pickler_Write(self, &long_op, 1) < 0 ||
            _Pickler_Write(self, string, size) < 0 ||
            _Pickler_Write(self, "L\n", 2) < 0)
            goto error;
    }

    if (0) {
  error:
      status = -1;
    }
    Ty_XDECREF(repr);

    return status;
}

static int
save_float(PicklerObject *self, TyObject *obj)
{
    double x = TyFloat_AS_DOUBLE((PyFloatObject *)obj);

    if (self->bin) {
        char pdata[9];
        pdata[0] = BINFLOAT;
        if (TyFloat_Pack8(x, &pdata[1], 0) < 0)
            return -1;
        if (_Pickler_Write(self, pdata, 9) < 0)
            return -1;
   }
    else {
        int result = -1;
        char *buf = NULL;
        char op = FLOAT;

        if (_Pickler_Write(self, &op, 1) < 0)
            goto done;

        buf = TyOS_double_to_string(x, 'r', 0, Ty_DTSF_ADD_DOT_0, NULL);
        if (!buf) {
            TyErr_NoMemory();
            goto done;
        }

        if (_Pickler_Write(self, buf, strlen(buf)) < 0)
            goto done;

        if (_Pickler_Write(self, "\n", 1) < 0)
            goto done;

        result = 0;
done:
        TyMem_Free(buf);
        return result;
    }

    return 0;
}

/* Perform direct write of the header and payload of the binary object.

   The large contiguous data is written directly into the underlying file
   object, bypassing the output_buffer of the Pickler.  We intentionally
   do not insert a protocol 4 frame opcode to make it possible to optimize
   file.read calls in the loader.
 */
static int
_Pickler_write_bytes(PicklerObject *self,
                     const char *header, Ty_ssize_t header_size,
                     const char *data, Ty_ssize_t data_size,
                     TyObject *payload)
{
    int bypass_buffer = (data_size >= FRAME_SIZE_TARGET);
    int framing = self->framing;

    if (bypass_buffer) {
        assert(self->output_buffer != NULL);
        /* Commit the previous frame. */
        if (_Pickler_CommitFrame(self)) {
            return -1;
        }
        /* Disable framing temporarily */
        self->framing = 0;
    }

    if (_Pickler_Write(self, header, header_size) < 0) {
        return -1;
    }

    if (bypass_buffer && self->write != NULL) {
        /* Bypass the in-memory buffer to directly stream large data
           into the underlying file object. */
        TyObject *result, *mem = NULL;
        /* Dump the output buffer to the file. */
        if (_Pickler_FlushToFile(self) < 0) {
            return -1;
        }

        /* Stream write the payload into the file without going through the
           output buffer. */
        if (payload == NULL) {
            /* TODO: It would be better to use a memoryview with a linked
               original string if this is possible. */
            payload = mem = TyBytes_FromStringAndSize(data, data_size);
            if (payload == NULL) {
                return -1;
            }
        }
        result = PyObject_CallOneArg(self->write, payload);
        Ty_XDECREF(mem);
        if (result == NULL) {
            return -1;
        }
        Ty_DECREF(result);

        /* Reinitialize the buffer for subsequent calls to _Pickler_Write. */
        if (_Pickler_ClearBuffer(self) < 0) {
            return -1;
        }
    }
    else {
        if (_Pickler_Write(self, data, data_size) < 0) {
            return -1;
        }
    }

    /* Re-enable framing for subsequent calls to _Pickler_Write. */
    self->framing = framing;

    return 0;
}

static int
_save_bytes_data(PickleState *st, PicklerObject *self, TyObject *obj,
                 const char *data, Ty_ssize_t size)
{
    assert(self->proto >= 3);

    char header[9];
    Ty_ssize_t len;

    if (size < 0)
        return -1;

    if (size <= 0xff) {
        header[0] = SHORT_BINBYTES;
        header[1] = (unsigned char)size;
        len = 2;
    }
    else if ((size_t)size <= 0xffffffffUL) {
        header[0] = BINBYTES;
        header[1] = (unsigned char)(size & 0xff);
        header[2] = (unsigned char)((size >> 8) & 0xff);
        header[3] = (unsigned char)((size >> 16) & 0xff);
        header[4] = (unsigned char)((size >> 24) & 0xff);
        len = 5;
    }
    else if (self->proto >= 4) {
        header[0] = BINBYTES8;
        _write_size64(header + 1, size);
        len = 9;
    }
    else {
        TyErr_SetString(TyExc_OverflowError,
                        "serializing a bytes object larger than 4 GiB "
                        "requires pickle protocol 4 or higher");
        return -1;
    }

    if (_Pickler_write_bytes(self, header, len, data, size, obj) < 0) {
        return -1;
    }

    if (memo_put(st, self, obj) < 0) {
        return -1;
    }

    return 0;
}

static int
save_bytes(PickleState *st, PicklerObject *self, TyObject *obj)
{
    if (self->proto < 3) {
        /* Older pickle protocols do not have an opcode for pickling bytes
           objects. Therefore, we need to fake the copy protocol (i.e.,
           the __reduce__ method) to permit bytes object unpickling.

           Here we use a hack to be compatible with Python 2. Since in Python
           2 'bytes' is just an alias for 'str' (which has different
           parameters than the actual bytes object), we use codecs.encode
           to create the appropriate 'str' object when unpickled using
           Python 2 *and* the appropriate 'bytes' object when unpickled
           using Python 3. Again this is a hack and we don't need to do this
           with newer protocols. */
        TyObject *reduce_value;
        int status;

        if (TyBytes_GET_SIZE(obj) == 0) {
            reduce_value = Ty_BuildValue("(O())", (TyObject*)&TyBytes_Type);
        }
        else {
            TyObject *unicode_str =
                TyUnicode_DecodeLatin1(TyBytes_AS_STRING(obj),
                                       TyBytes_GET_SIZE(obj),
                                       "strict");

            if (unicode_str == NULL)
                return -1;
            reduce_value = Ty_BuildValue("(O(OO))",
                                         st->codecs_encode, unicode_str,
                                         &_Ty_ID(latin1));
            Ty_DECREF(unicode_str);
        }

        if (reduce_value == NULL)
            return -1;

        /* save_reduce() will memoize the object automatically. */
        status = save_reduce(st, self, reduce_value, obj);
        Ty_DECREF(reduce_value);
        return status;
    }
    else {
        return _save_bytes_data(st, self, obj, TyBytes_AS_STRING(obj),
                                TyBytes_GET_SIZE(obj));
    }
}

static int
_save_bytearray_data(PickleState *state, PicklerObject *self, TyObject *obj,
                     const char *data, Ty_ssize_t size)
{
    assert(self->proto >= 5);

    char header[9];
    Ty_ssize_t len;

    if (size < 0)
        return -1;

    header[0] = BYTEARRAY8;
    _write_size64(header + 1, size);
    len = 9;

    if (_Pickler_write_bytes(self, header, len, data, size, obj) < 0) {
        return -1;
    }

    if (memo_put(state, self, obj) < 0) {
        return -1;
    }

    return 0;
}

static int
save_bytearray(PickleState *state, PicklerObject *self, TyObject *obj)
{
    if (self->proto < 5) {
        /* Older pickle protocols do not have an opcode for pickling
         * bytearrays. */
        TyObject *reduce_value = NULL;
        int status;

        if (TyByteArray_GET_SIZE(obj) == 0) {
            reduce_value = Ty_BuildValue("(O())",
                                         (TyObject *) &TyByteArray_Type);
        }
        else {
            TyObject *bytes_obj = TyBytes_FromObject(obj);
            if (bytes_obj != NULL) {
                reduce_value = Ty_BuildValue("(O(O))",
                                             (TyObject *) &TyByteArray_Type,
                                             bytes_obj);
                Ty_DECREF(bytes_obj);
            }
        }
        if (reduce_value == NULL)
            return -1;

        /* save_reduce() will memoize the object automatically. */
        status = save_reduce(state, self, reduce_value, obj);
        Ty_DECREF(reduce_value);
        return status;
    }
    else {
        return _save_bytearray_data(state, self, obj,
                                    TyByteArray_AS_STRING(obj),
                                    TyByteArray_GET_SIZE(obj));
    }
}

static int
save_picklebuffer(PickleState *st, PicklerObject *self, TyObject *obj)
{
    if (self->proto < 5) {
        TyErr_SetString(st->PicklingError,
                        "PickleBuffer can only be pickled with protocol >= 5");
        return -1;
    }
    const Ty_buffer* view = PyPickleBuffer_GetBuffer(obj);
    if (view == NULL) {
        return -1;
    }
    if (view->suboffsets != NULL || !PyBuffer_IsContiguous(view, 'A')) {
        TyErr_SetString(st->PicklingError,
                        "PickleBuffer can not be pickled when "
                        "pointing to a non-contiguous buffer");
        return -1;
    }
    int in_band = 1;
    if (self->buffer_callback != NULL) {
        TyObject *ret = PyObject_CallOneArg(self->buffer_callback, obj);
        if (ret == NULL) {
            return -1;
        }
        in_band = PyObject_IsTrue(ret);
        Ty_DECREF(ret);
        if (in_band == -1) {
            return -1;
        }
    }
    if (in_band) {
        /* Write data in-band */
        if (view->readonly) {
            return _save_bytes_data(st, self, obj, (const char *)view->buf,
                                    view->len);
        }
        else {
            return _save_bytearray_data(st, self, obj, (const char *)view->buf,
                                        view->len);
        }
    }
    else {
        /* Write data out-of-band */
        const char next_buffer_op = NEXT_BUFFER;
        if (_Pickler_Write(self, &next_buffer_op, 1) < 0) {
            return -1;
        }
        if (view->readonly) {
            const char readonly_buffer_op = READONLY_BUFFER;
            if (_Pickler_Write(self, &readonly_buffer_op, 1) < 0) {
                return -1;
            }
        }
    }
    return 0;
}

/* A copy of TyUnicode_AsRawUnicodeEscapeString() that also translates
   backslash and newline characters to \uXXXX escapes. */
static TyObject *
raw_unicode_escape(TyObject *obj)
{
    char *p;
    Ty_ssize_t i, size;
    const void *data;
    int kind;
    _PyBytesWriter writer;

    _PyBytesWriter_Init(&writer);

    size = TyUnicode_GET_LENGTH(obj);
    data = TyUnicode_DATA(obj);
    kind = TyUnicode_KIND(obj);

    p = _PyBytesWriter_Alloc(&writer, size);
    if (p == NULL)
        goto error;
    writer.overallocate = 1;

    for (i=0; i < size; i++) {
        Ty_UCS4 ch = TyUnicode_READ(kind, data, i);
        /* Map 32-bit characters to '\Uxxxxxxxx' */
        if (ch >= 0x10000) {
            /* -1: subtract 1 preallocated byte */
            p = _PyBytesWriter_Prepare(&writer, p, 10-1);
            if (p == NULL)
                goto error;

            *p++ = '\\';
            *p++ = 'U';
            *p++ = Ty_hexdigits[(ch >> 28) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 24) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 20) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 16) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 12) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 8) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 4) & 0xf];
            *p++ = Ty_hexdigits[ch & 15];
        }
        /* Map 16-bit characters, '\\' and '\n' to '\uxxxx' */
        else if (ch >= 256 ||
                 ch == '\\' || ch == 0 || ch == '\n' || ch == '\r' ||
                 ch == 0x1a)
        {
            /* -1: subtract 1 preallocated byte */
            p = _PyBytesWriter_Prepare(&writer, p, 6-1);
            if (p == NULL)
                goto error;

            *p++ = '\\';
            *p++ = 'u';
            *p++ = Ty_hexdigits[(ch >> 12) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 8) & 0xf];
            *p++ = Ty_hexdigits[(ch >> 4) & 0xf];
            *p++ = Ty_hexdigits[ch & 15];
        }
        /* Copy everything else as-is */
        else
            *p++ = (char) ch;
    }

    return _PyBytesWriter_Finish(&writer, p);

error:
    _PyBytesWriter_Dealloc(&writer);
    return NULL;
}

static int
write_unicode_binary(PicklerObject *self, TyObject *obj)
{
    char header[9];
    Ty_ssize_t len;
    TyObject *encoded = NULL;
    Ty_ssize_t size;
    const char *data;

    data = TyUnicode_AsUTF8AndSize(obj, &size);
    if (data == NULL) {
        /* Issue #8383: for strings with lone surrogates, fallback on the
           "surrogatepass" error handler. */
        TyErr_Clear();
        encoded = TyUnicode_AsEncodedString(obj, "utf-8", "surrogatepass");
        if (encoded == NULL)
            return -1;

        data = TyBytes_AS_STRING(encoded);
        size = TyBytes_GET_SIZE(encoded);
    }

    assert(size >= 0);
    if (size <= 0xff && self->proto >= 4) {
        header[0] = SHORT_BINUNICODE;
        header[1] = (unsigned char)(size & 0xff);
        len = 2;
    }
    else if ((size_t)size <= 0xffffffffUL) {
        header[0] = BINUNICODE;
        header[1] = (unsigned char)(size & 0xff);
        header[2] = (unsigned char)((size >> 8) & 0xff);
        header[3] = (unsigned char)((size >> 16) & 0xff);
        header[4] = (unsigned char)((size >> 24) & 0xff);
        len = 5;
    }
    else if (self->proto >= 4) {
        header[0] = BINUNICODE8;
        _write_size64(header + 1, size);
        len = 9;
    }
    else {
        TyErr_SetString(TyExc_OverflowError,
                        "serializing a string larger than 4 GiB "
                        "requires pickle protocol 4 or higher");
        Ty_XDECREF(encoded);
        return -1;
    }

    if (_Pickler_write_bytes(self, header, len, data, size, encoded) < 0) {
        Ty_XDECREF(encoded);
        return -1;
    }
    Ty_XDECREF(encoded);
    return 0;
}

static int
save_unicode(PickleState *state, PicklerObject *self, TyObject *obj)
{
    if (self->bin) {
        if (write_unicode_binary(self, obj) < 0)
            return -1;
    }
    else {
        TyObject *encoded;
        Ty_ssize_t size;
        const char unicode_op = UNICODE;

        encoded = raw_unicode_escape(obj);
        if (encoded == NULL)
            return -1;

        if (_Pickler_Write(self, &unicode_op, 1) < 0) {
            Ty_DECREF(encoded);
            return -1;
        }

        size = TyBytes_GET_SIZE(encoded);
        if (_Pickler_Write(self, TyBytes_AS_STRING(encoded), size) < 0) {
            Ty_DECREF(encoded);
            return -1;
        }
        Ty_DECREF(encoded);

        if (_Pickler_Write(self, "\n", 1) < 0)
            return -1;
    }
    if (memo_put(state, self, obj) < 0)
        return -1;

    return 0;
}

/* A helper for save_tuple.  Push the len elements in tuple t on the stack. */
static int
store_tuple_elements(PickleState *state, PicklerObject *self, TyObject *t,
                     Ty_ssize_t len)
{
    Ty_ssize_t i;

    assert(TyTuple_Size(t) == len);

    for (i = 0; i < len; i++) {
        TyObject *element = TyTuple_GET_ITEM(t, i);

        if (element == NULL)
            return -1;
        if (save(state, self, element, 0) < 0) {
            _TyErr_FormatNote("when serializing %T item %zd", t, i);
            return -1;
        }
    }

    return 0;
}

/* Tuples are ubiquitous in the pickle protocols, so many techniques are
 * used across protocols to minimize the space needed to pickle them.
 * Tuples are also the only builtin immutable type that can be recursive
 * (a tuple can be reached from itself), and that requires some subtle
 * magic so that it works in all cases.  IOW, this is a long routine.
 */
static int
save_tuple(PickleState *state, PicklerObject *self, TyObject *obj)
{
    Ty_ssize_t len, i;

    const char mark_op = MARK;
    const char tuple_op = TUPLE;
    const char pop_op = POP;
    const char pop_mark_op = POP_MARK;
    const char len2opcode[] = {EMPTY_TUPLE, TUPLE1, TUPLE2, TUPLE3};

    if ((len = TyTuple_Size(obj)) < 0)
        return -1;

    if (len == 0) {
        char pdata[2];

        if (self->proto) {
            pdata[0] = EMPTY_TUPLE;
            len = 1;
        }
        else {
            pdata[0] = MARK;
            pdata[1] = TUPLE;
            len = 2;
        }
        if (_Pickler_Write(self, pdata, len) < 0)
            return -1;
        return 0;
    }

    /* The tuple isn't in the memo now.  If it shows up there after
     * saving the tuple elements, the tuple must be recursive, in
     * which case we'll pop everything we put on the stack, and fetch
     * its value from the memo.
     */
    if (len <= 3 && self->proto >= 2) {
        /* Use TUPLE{1,2,3} opcodes. */
        if (store_tuple_elements(state, self, obj, len) < 0)
            return -1;

        if (PyMemoTable_Get(self->memo, obj)) {
            /* pop the len elements */
            for (i = 0; i < len; i++)
                if (_Pickler_Write(self, &pop_op, 1) < 0)
                    return -1;
            /* fetch from memo */
            if (memo_get(state, self, obj) < 0)
                return -1;

            return 0;
        }
        else { /* Not recursive. */
            if (_Pickler_Write(self, len2opcode + len, 1) < 0)
                return -1;
        }
        goto memoize;
    }

    /* proto < 2 and len > 0, or proto >= 2 and len > 3.
     * Generate MARK e1 e2 ... TUPLE
     */
    if (_Pickler_Write(self, &mark_op, 1) < 0)
        return -1;

    if (store_tuple_elements(state, self, obj, len) < 0)
        return -1;

    if (PyMemoTable_Get(self->memo, obj)) {
        /* pop the stack stuff we pushed */
        if (self->bin) {
            if (_Pickler_Write(self, &pop_mark_op, 1) < 0)
                return -1;
        }
        else {
            /* Note that we pop one more than len, to remove
             * the MARK too.
             */
            for (i = 0; i <= len; i++)
                if (_Pickler_Write(self, &pop_op, 1) < 0)
                    return -1;
        }
        /* fetch from memo */
        if (memo_get(state, self, obj) < 0)
            return -1;

        return 0;
    }
    else { /* Not recursive. */
        if (_Pickler_Write(self, &tuple_op, 1) < 0)
            return -1;
    }

  memoize:
    if (memo_put(state, self, obj) < 0)
        return -1;

    return 0;
}

/* iter is an iterator giving items, and we batch up chunks of
 *     MARK item item ... item APPENDS
 * opcode sequences.  Calling code should have arranged to first create an
 * empty list, or list-like object, for the APPENDS to operate on.
 * Returns 0 on success, <0 on error.
 */
static int
batch_list(PickleState *state, PicklerObject *self, TyObject *iter, TyObject *origobj)
{
    TyObject *obj = NULL;
    TyObject *firstitem = NULL;
    int i, n;
    Ty_ssize_t total = 0;

    const char mark_op = MARK;
    const char append_op = APPEND;
    const char appends_op = APPENDS;

    assert(iter != NULL);

    /* XXX: I think this function could be made faster by avoiding the
       iterator interface and fetching objects directly from list using
       TyList_GET_ITEM.
    */

    if (self->proto == 0) {
        /* APPENDS isn't available; do one at a time. */
        for (;; total++) {
            obj = TyIter_Next(iter);
            if (obj == NULL) {
                if (TyErr_Occurred())
                    return -1;
                break;
            }
            i = save(state, self, obj, 0);
            Ty_DECREF(obj);
            if (i < 0) {
                _TyErr_FormatNote("when serializing %T item %zd", origobj, total);
                return -1;
            }
            if (_Pickler_Write(self, &append_op, 1) < 0)
                return -1;
        }
        return 0;
    }

    /* proto > 0:  write in batches of BATCHSIZE. */
    do {
        /* Get first item */
        firstitem = TyIter_Next(iter);
        if (firstitem == NULL) {
            if (TyErr_Occurred())
                goto error;

            /* nothing more to add */
            break;
        }

        /* Try to get a second item */
        obj = TyIter_Next(iter);
        if (obj == NULL) {
            if (TyErr_Occurred())
                goto error;

            /* Only one item to write */
            if (save(state, self, firstitem, 0) < 0) {
                _TyErr_FormatNote("when serializing %T item %zd", origobj, total);
                goto error;
            }
            if (_Pickler_Write(self, &append_op, 1) < 0)
                goto error;
            Ty_CLEAR(firstitem);
            break;
        }

        /* More than one item to write */

        /* Pump out MARK, items, APPENDS. */
        if (_Pickler_Write(self, &mark_op, 1) < 0)
            goto error;

        if (save(state, self, firstitem, 0) < 0) {
            _TyErr_FormatNote("when serializing %T item %zd", origobj, total);
            goto error;
        }
        Ty_CLEAR(firstitem);
        total++;
        n = 1;

        /* Fetch and save up to BATCHSIZE items */
        while (obj) {
            if (save(state, self, obj, 0) < 0) {
                _TyErr_FormatNote("when serializing %T item %zd", origobj, total);
                goto error;
            }
            Ty_CLEAR(obj);
            total++;
            n += 1;

            if (n == BATCHSIZE)
                break;

            obj = TyIter_Next(iter);
            if (obj == NULL) {
                if (TyErr_Occurred())
                    goto error;
                break;
            }
        }

        if (_Pickler_Write(self, &appends_op, 1) < 0)
            goto error;

    } while (n == BATCHSIZE);
    return 0;

  error:
    Ty_XDECREF(firstitem);
    Ty_XDECREF(obj);
    return -1;
}

/* This is a variant of batch_list() above, specialized for lists (with no
 * support for list subclasses). Like batch_list(), we batch up chunks of
 *     MARK item item ... item APPENDS
 * opcode sequences.  Calling code should have arranged to first create an
 * empty list, or list-like object, for the APPENDS to operate on.
 * Returns 0 on success, -1 on error.
 *
 * This version is considerably faster than batch_list(), if less general.
 *
 * Note that this only works for protocols > 0.
 */
static int
batch_list_exact(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *item = NULL;
    Ty_ssize_t this_batch, total;

    const char append_op = APPEND;
    const char appends_op = APPENDS;
    const char mark_op = MARK;

    assert(obj != NULL);
    assert(self->proto > 0);
    assert(TyList_CheckExact(obj));

    if (TyList_GET_SIZE(obj) == 1) {
        item = TyList_GET_ITEM(obj, 0);
        Ty_INCREF(item);
        int err = save(state, self, item, 0);
        Ty_DECREF(item);
        if (err < 0) {
            _TyErr_FormatNote("when serializing %T item 0", obj);
            return -1;
        }
        if (_Pickler_Write(self, &append_op, 1) < 0)
            return -1;
        return 0;
    }

    /* Write in batches of BATCHSIZE. */
    total = 0;
    do {
        this_batch = 0;
        if (_Pickler_Write(self, &mark_op, 1) < 0)
            return -1;
        while (total < TyList_GET_SIZE(obj)) {
            item = TyList_GET_ITEM(obj, total);
            Ty_INCREF(item);
            int err = save(state, self, item, 0);
            Ty_DECREF(item);
            if (err < 0) {
                _TyErr_FormatNote("when serializing %T item %zd", obj, total);
                return -1;
            }
            total++;
            if (++this_batch == BATCHSIZE)
                break;
        }
        if (_Pickler_Write(self, &appends_op, 1) < 0)
            return -1;

    } while (total < TyList_GET_SIZE(obj));

    return 0;
}

static int
save_list(PickleState *state, PicklerObject *self, TyObject *obj)
{
    char header[3];
    Ty_ssize_t len;
    int status = 0;

    if (self->fast && !fast_save_enter(self, obj))
        goto error;

    /* Create an empty list. */
    if (self->bin) {
        header[0] = EMPTY_LIST;
        len = 1;
    }
    else {
        header[0] = MARK;
        header[1] = LIST;
        len = 2;
    }

    if (_Pickler_Write(self, header, len) < 0)
        goto error;

    /* Get list length, and bow out early if empty. */
    if ((len = TyList_Size(obj)) < 0)
        goto error;

    if (memo_put(state, self, obj) < 0)
        goto error;

    if (len != 0) {
        /* Materialize the list elements. */
        if (TyList_CheckExact(obj) && self->proto > 0) {
            if (_Ty_EnterRecursiveCall(" while pickling an object"))
                goto error;
            status = batch_list_exact(state, self, obj);
            _Ty_LeaveRecursiveCall();
        } else {
            TyObject *iter = PyObject_GetIter(obj);
            if (iter == NULL)
                goto error;

            if (_Ty_EnterRecursiveCall(" while pickling an object")) {
                Ty_DECREF(iter);
                goto error;
            }
            status = batch_list(state, self, iter, obj);
            _Ty_LeaveRecursiveCall();
            Ty_DECREF(iter);
        }
    }
    if (0) {
  error:
        status = -1;
    }

    if (self->fast && !fast_save_leave(self, obj))
        status = -1;

    return status;
}

/* iter is an iterator giving (key, value) pairs, and we batch up chunks of
 *     MARK key value ... key value SETITEMS
 * opcode sequences.  Calling code should have arranged to first create an
 * empty dict, or dict-like object, for the SETITEMS to operate on.
 * Returns 0 on success, <0 on error.
 *
 * This is very much like batch_list().  The difference between saving
 * elements directly, and picking apart two-tuples, is so long-winded at
 * the C level, though, that attempts to combine these routines were too
 * ugly to bear.
 */
static int
batch_dict(PickleState *state, PicklerObject *self, TyObject *iter, TyObject *origobj)
{
    TyObject *obj = NULL;
    TyObject *firstitem = NULL;
    int i, n;

    const char mark_op = MARK;
    const char setitem_op = SETITEM;
    const char setitems_op = SETITEMS;

    assert(iter != NULL);

    if (self->proto == 0) {
        /* SETITEMS isn't available; do one at a time. */
        for (;;) {
            obj = TyIter_Next(iter);
            if (obj == NULL) {
                if (TyErr_Occurred())
                    return -1;
                break;
            }
            if (!TyTuple_Check(obj) || TyTuple_Size(obj) != 2) {
                TyErr_SetString(TyExc_TypeError, "dict items "
                                "iterator must return 2-tuples");
                Ty_DECREF(obj);
                return -1;
            }
            i = save(state, self, TyTuple_GET_ITEM(obj, 0), 0);
            if (i >= 0) {
                i = save(state, self, TyTuple_GET_ITEM(obj, 1), 0);
                if (i < 0) {
                    _TyErr_FormatNote("when serializing %T item %R",
                                      origobj, TyTuple_GET_ITEM(obj, 0));
                }
            }
            Ty_DECREF(obj);
            if (i < 0)
                return -1;
            if (_Pickler_Write(self, &setitem_op, 1) < 0)
                return -1;
        }
        return 0;
    }

    /* proto > 0:  write in batches of BATCHSIZE. */
    do {
        /* Get first item */
        firstitem = TyIter_Next(iter);
        if (firstitem == NULL) {
            if (TyErr_Occurred())
                goto error;

            /* nothing more to add */
            break;
        }
        if (!TyTuple_Check(firstitem) || TyTuple_Size(firstitem) != 2) {
            TyErr_SetString(TyExc_TypeError, "dict items "
                                "iterator must return 2-tuples");
            goto error;
        }

        /* Try to get a second item */
        obj = TyIter_Next(iter);
        if (obj == NULL) {
            if (TyErr_Occurred())
                goto error;

            /* Only one item to write */
            if (save(state, self, TyTuple_GET_ITEM(firstitem, 0), 0) < 0)
                goto error;
            if (save(state, self, TyTuple_GET_ITEM(firstitem, 1), 0) < 0) {
                _TyErr_FormatNote("when serializing %T item %R",
                                  origobj, TyTuple_GET_ITEM(firstitem, 0));
                goto error;
            }
            if (_Pickler_Write(self, &setitem_op, 1) < 0)
                goto error;
            Ty_CLEAR(firstitem);
            break;
        }

        /* More than one item to write */

        /* Pump out MARK, items, SETITEMS. */
        if (_Pickler_Write(self, &mark_op, 1) < 0)
            goto error;

        if (save(state, self, TyTuple_GET_ITEM(firstitem, 0), 0) < 0)
            goto error;
        if (save(state, self, TyTuple_GET_ITEM(firstitem, 1), 0) < 0) {
            _TyErr_FormatNote("when serializing %T item %R",
                              origobj, TyTuple_GET_ITEM(firstitem, 0));
            goto error;
        }
        Ty_CLEAR(firstitem);
        n = 1;

        /* Fetch and save up to BATCHSIZE items */
        while (obj) {
            if (!TyTuple_Check(obj) || TyTuple_Size(obj) != 2) {
                TyErr_SetString(TyExc_TypeError, "dict items "
                    "iterator must return 2-tuples");
                goto error;
            }
            if (save(state, self, TyTuple_GET_ITEM(obj, 0), 0) < 0)
                goto error;
            if (save(state, self, TyTuple_GET_ITEM(obj, 1), 0) < 0) {
                _TyErr_FormatNote("when serializing %T item %R",
                                  origobj, TyTuple_GET_ITEM(obj, 0));
                goto error;
            }
            Ty_CLEAR(obj);
            n += 1;

            if (n == BATCHSIZE)
                break;

            obj = TyIter_Next(iter);
            if (obj == NULL) {
                if (TyErr_Occurred())
                    goto error;
                break;
            }
        }

        if (_Pickler_Write(self, &setitems_op, 1) < 0)
            goto error;

    } while (n == BATCHSIZE);
    return 0;

  error:
    Ty_XDECREF(firstitem);
    Ty_XDECREF(obj);
    return -1;
}

/* This is a variant of batch_dict() above that specializes for dicts, with no
 * support for dict subclasses. Like batch_dict(), we batch up chunks of
 *     MARK key value ... key value SETITEMS
 * opcode sequences.  Calling code should have arranged to first create an
 * empty dict, or dict-like object, for the SETITEMS to operate on.
 * Returns 0 on success, -1 on error.
 *
 * Note that this currently doesn't work for protocol 0.
 */
static int
batch_dict_exact(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *key = NULL, *value = NULL;
    int i;
    Ty_ssize_t dict_size, ppos = 0;

    const char mark_op = MARK;
    const char setitem_op = SETITEM;
    const char setitems_op = SETITEMS;

    assert(obj != NULL && TyDict_CheckExact(obj));
    assert(self->proto > 0);

    dict_size = TyDict_GET_SIZE(obj);

    /* Special-case len(d) == 1 to save space. */
    if (dict_size == 1) {
        TyDict_Next(obj, &ppos, &key, &value);
        Ty_INCREF(key);
        Ty_INCREF(value);
        if (save(state, self, key, 0) < 0) {
            goto error;
        }
        if (save(state, self, value, 0) < 0) {
            _TyErr_FormatNote("when serializing %T item %R", obj, key);
            goto error;
        }
        Ty_CLEAR(key);
        Ty_CLEAR(value);
        if (_Pickler_Write(self, &setitem_op, 1) < 0)
            return -1;
        return 0;
    }

    /* Write in batches of BATCHSIZE. */
    do {
        i = 0;
        if (_Pickler_Write(self, &mark_op, 1) < 0)
            return -1;
        while (TyDict_Next(obj, &ppos, &key, &value)) {
            Ty_INCREF(key);
            Ty_INCREF(value);
            if (save(state, self, key, 0) < 0) {
                goto error;
            }
            if (save(state, self, value, 0) < 0) {
                _TyErr_FormatNote("when serializing %T item %R", obj, key);
                goto error;
            }
            Ty_CLEAR(key);
            Ty_CLEAR(value);
            if (++i == BATCHSIZE)
                break;
        }
        if (_Pickler_Write(self, &setitems_op, 1) < 0)
            return -1;
        if (TyDict_GET_SIZE(obj) != dict_size) {
            TyErr_Format(
                TyExc_RuntimeError,
                "dictionary changed size during iteration");
            return -1;
        }

    } while (i == BATCHSIZE);
    return 0;
error:
    Ty_XDECREF(key);
    Ty_XDECREF(value);
    return -1;
}

static int
save_dict(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *items, *iter;
    char header[3];
    Ty_ssize_t len;
    int status = 0;
    assert(TyDict_Check(obj));

    if (self->fast && !fast_save_enter(self, obj))
        goto error;

    /* Create an empty dict. */
    if (self->bin) {
        header[0] = EMPTY_DICT;
        len = 1;
    }
    else {
        header[0] = MARK;
        header[1] = DICT;
        len = 2;
    }

    if (_Pickler_Write(self, header, len) < 0)
        goto error;

    if (memo_put(state, self, obj) < 0)
        goto error;

    if (TyDict_GET_SIZE(obj)) {
        /* Save the dict items. */
        if (TyDict_CheckExact(obj) && self->proto > 0) {
            /* We can take certain shortcuts if we know this is a dict and
               not a dict subclass. */
            if (_Ty_EnterRecursiveCall(" while pickling an object"))
                goto error;
            status = batch_dict_exact(state, self, obj);
            _Ty_LeaveRecursiveCall();
        } else {
            items = PyObject_CallMethodNoArgs(obj, &_Ty_ID(items));
            if (items == NULL)
                goto error;
            iter = PyObject_GetIter(items);
            Ty_DECREF(items);
            if (iter == NULL)
                goto error;
            if (_Ty_EnterRecursiveCall(" while pickling an object")) {
                Ty_DECREF(iter);
                goto error;
            }
            status = batch_dict(state, self, iter, obj);
            _Ty_LeaveRecursiveCall();
            Ty_DECREF(iter);
        }
    }

    if (0) {
  error:
        status = -1;
    }

    if (self->fast && !fast_save_leave(self, obj))
        status = -1;

    return status;
}

static int
save_set(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *item;
    int i;
    Ty_ssize_t set_size, ppos = 0;
    Ty_hash_t hash;

    const char empty_set_op = EMPTY_SET;
    const char mark_op = MARK;
    const char additems_op = ADDITEMS;

    if (self->proto < 4) {
        TyObject *items;
        TyObject *reduce_value;
        int status;

        items = PySequence_List(obj);
        if (items == NULL) {
            return -1;
        }
        reduce_value = Ty_BuildValue("(O(O))", (TyObject*)&TySet_Type, items);
        Ty_DECREF(items);
        if (reduce_value == NULL) {
            return -1;
        }
        /* save_reduce() will memoize the object automatically. */
        status = save_reduce(state, self, reduce_value, obj);
        Ty_DECREF(reduce_value);
        return status;
    }

    if (_Pickler_Write(self, &empty_set_op, 1) < 0)
        return -1;

    if (memo_put(state, self, obj) < 0)
        return -1;

    set_size = TySet_GET_SIZE(obj);
    if (set_size == 0)
        return 0;  /* nothing to do */

    /* Write in batches of BATCHSIZE. */
    do {
        i = 0;
        if (_Pickler_Write(self, &mark_op, 1) < 0)
            return -1;

        int err = 0;
        Ty_BEGIN_CRITICAL_SECTION(obj);
        while (_TySet_NextEntryRef(obj, &ppos, &item, &hash)) {
            err = save(state, self, item, 0);
            Ty_CLEAR(item);
            if (err < 0) {
                _TyErr_FormatNote("when serializing %T element", obj);
                break;
            }
            if (++i == BATCHSIZE)
                break;
        }
        Ty_END_CRITICAL_SECTION();
        if (err < 0) {
            return -1;
        }
        if (_Pickler_Write(self, &additems_op, 1) < 0)
            return -1;
        if (TySet_GET_SIZE(obj) != set_size) {
            TyErr_Format(
                TyExc_RuntimeError,
                "set changed size during iteration");
            return -1;
        }
    } while (i == BATCHSIZE);

    return 0;
}

static int
save_frozenset(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *iter;

    const char mark_op = MARK;
    const char frozenset_op = FROZENSET;

    if (self->fast && !fast_save_enter(self, obj))
        return -1;

    if (self->proto < 4) {
        TyObject *items;
        TyObject *reduce_value;
        int status;

        items = PySequence_List(obj);
        if (items == NULL) {
            return -1;
        }
        reduce_value = Ty_BuildValue("(O(O))", (TyObject*)&TyFrozenSet_Type,
                                     items);
        Ty_DECREF(items);
        if (reduce_value == NULL) {
            return -1;
        }
        /* save_reduce() will memoize the object automatically. */
        status = save_reduce(state, self, reduce_value, obj);
        Ty_DECREF(reduce_value);
        return status;
    }

    if (_Pickler_Write(self, &mark_op, 1) < 0)
        return -1;

    iter = PyObject_GetIter(obj);
    if (iter == NULL) {
        return -1;
    }
    for (;;) {
        TyObject *item;

        item = TyIter_Next(iter);
        if (item == NULL) {
            if (TyErr_Occurred()) {
                Ty_DECREF(iter);
                return -1;
            }
            break;
        }
        if (save(state, self, item, 0) < 0) {
            _TyErr_FormatNote("when serializing %T element", obj);
            Ty_DECREF(item);
            Ty_DECREF(iter);
            return -1;
        }
        Ty_DECREF(item);
    }
    Ty_DECREF(iter);

    /* If the object is already in the memo, this means it is
       recursive. In this case, throw away everything we put on the
       stack, and fetch the object back from the memo. */
    if (PyMemoTable_Get(self->memo, obj)) {
        const char pop_mark_op = POP_MARK;

        if (_Pickler_Write(self, &pop_mark_op, 1) < 0)
            return -1;
        if (memo_get(state, self, obj) < 0)
            return -1;
        return 0;
    }

    if (_Pickler_Write(self, &frozenset_op, 1) < 0)
        return -1;
    if (memo_put(state, self, obj) < 0)
        return -1;

    return 0;
}

static int
fix_imports(PickleState *st, TyObject **module_name, TyObject **global_name)
{
    TyObject *key;
    TyObject *item;

    key = TyTuple_Pack(2, *module_name, *global_name);
    if (key == NULL)
        return -1;
    item = TyDict_GetItemWithError(st->name_mapping_3to2, key);
    Ty_DECREF(key);
    if (item) {
        TyObject *fixed_module_name;
        TyObject *fixed_global_name;

        if (!TyTuple_Check(item) || TyTuple_GET_SIZE(item) != 2) {
            TyErr_Format(TyExc_RuntimeError,
                         "_compat_pickle.REVERSE_NAME_MAPPING values "
                         "should be 2-tuples, not %.200s",
                         Ty_TYPE(item)->tp_name);
            return -1;
        }
        fixed_module_name = TyTuple_GET_ITEM(item, 0);
        fixed_global_name = TyTuple_GET_ITEM(item, 1);
        if (!TyUnicode_Check(fixed_module_name) ||
            !TyUnicode_Check(fixed_global_name)) {
            TyErr_Format(TyExc_RuntimeError,
                         "_compat_pickle.REVERSE_NAME_MAPPING values "
                         "should be pairs of str, not (%.200s, %.200s)",
                         Ty_TYPE(fixed_module_name)->tp_name,
                         Ty_TYPE(fixed_global_name)->tp_name);
            return -1;
        }

        Ty_CLEAR(*module_name);
        Ty_CLEAR(*global_name);
        *module_name = Ty_NewRef(fixed_module_name);
        *global_name = Ty_NewRef(fixed_global_name);
        return 0;
    }
    else if (TyErr_Occurred()) {
        return -1;
    }

    item = TyDict_GetItemWithError(st->import_mapping_3to2, *module_name);
    if (item) {
        if (!TyUnicode_Check(item)) {
            TyErr_Format(TyExc_RuntimeError,
                         "_compat_pickle.REVERSE_IMPORT_MAPPING values "
                         "should be strings, not %.200s",
                         Ty_TYPE(item)->tp_name);
            return -1;
        }
        Ty_XSETREF(*module_name, Ty_NewRef(item));
    }
    else if (TyErr_Occurred()) {
        return -1;
    }

    return 0;
}

static int
save_global(PickleState *st, PicklerObject *self, TyObject *obj,
            TyObject *name)
{
    TyObject *global_name = NULL;
    TyObject *module_name = NULL;
    TyObject *dotted_path = NULL;
    int status = 0;

    const char global_op = GLOBAL;

    if (name) {
        global_name = Ty_NewRef(name);
    }
    else {
        if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__qualname__), &global_name) < 0)
            goto error;
        if (global_name == NULL) {
            global_name = PyObject_GetAttr(obj, &_Ty_ID(__name__));
            if (global_name == NULL)
                goto error;
        }
    }

    dotted_path = get_dotted_path(global_name);
    if (dotted_path == NULL)
        goto error;
    module_name = whichmodule(st, obj, global_name, dotted_path);
    if (module_name == NULL)
        goto error;

    if (self->proto >= 2) {
        /* See whether this is in the extension registry, and if
         * so generate an EXT opcode.
         */
        TyObject *extension_key;
        TyObject *code_obj;      /* extension code as Python object */
        long code;               /* extension code as C value */
        char pdata[5];
        Ty_ssize_t n;

        extension_key = TyTuple_Pack(2, module_name, global_name);
        if (extension_key == NULL) {
            goto error;
        }
        if (TyDict_GetItemRef(st->extension_registry, extension_key, &code_obj) < 0) {
            Ty_DECREF(extension_key);
            goto error;
        }
        Ty_DECREF(extension_key);
        if (code_obj == NULL) {
            /* The object is not registered in the extension registry.
               This is the most likely code path. */
            goto gen_global;
        }

        code = TyLong_AsLong(code_obj);
        Ty_DECREF(code_obj);
        if (code <= 0 || code > 0x7fffffffL) {
            /* Should never happen in normal circumstances, since the type and
               the value of the code are checked in copyreg.add_extension(). */
            if (!TyErr_Occurred())
                TyErr_Format(TyExc_RuntimeError, "extension code %ld is out of range", code);
            goto error;
        }

        /* Generate an EXT opcode. */
        if (code <= 0xff) {
            pdata[0] = EXT1;
            pdata[1] = (unsigned char)code;
            n = 2;
        }
        else if (code <= 0xffff) {
            pdata[0] = EXT2;
            pdata[1] = (unsigned char)(code & 0xff);
            pdata[2] = (unsigned char)((code >> 8) & 0xff);
            n = 3;
        }
        else {
            pdata[0] = EXT4;
            pdata[1] = (unsigned char)(code & 0xff);
            pdata[2] = (unsigned char)((code >> 8) & 0xff);
            pdata[3] = (unsigned char)((code >> 16) & 0xff);
            pdata[4] = (unsigned char)((code >> 24) & 0xff);
            n = 5;
        }

        if (_Pickler_Write(self, pdata, n) < 0)
            goto error;
    }
    else {
  gen_global:
        if (self->proto >= 4) {
            const char stack_global_op = STACK_GLOBAL;

            if (save(st, self, module_name, 0) < 0)
                goto error;
            if (save(st, self, global_name, 0) < 0)
                goto error;

            if (_Pickler_Write(self, &stack_global_op, 1) < 0)
                goto error;
        }
        else {
            /* Generate a normal global opcode if we are using a pickle
               protocol < 4, or if the object is not registered in the
               extension registry.

               Objects with multi-part __qualname__ are represented as
               getattr(getattr(..., attrname1), attrname2). */
            const char mark_op = MARK;
            const char tupletwo_op = (self->proto < 2) ? TUPLE : TUPLE2;
            const char reduce_op = REDUCE;
            Ty_ssize_t i;
            if (dotted_path) {
                if (TyList_GET_SIZE(dotted_path) > 1) {
                    Ty_SETREF(global_name, Ty_NewRef(TyList_GET_ITEM(dotted_path, 0)));
                }
                for (i = 1; i < TyList_GET_SIZE(dotted_path); i++) {
                    if (save(st, self, st->getattr, 0) < 0 ||
                        (self->proto < 2 && _Pickler_Write(self, &mark_op, 1) < 0))
                    {
                        goto error;
                    }
                }
            }

            TyObject *encoded;
            TyObject *(*unicode_encoder)(TyObject *);

            if (_Pickler_Write(self, &global_op, 1) < 0)
                goto error;

            /* For protocol < 3 and if the user didn't request against doing
               so, we convert module names to the old 2.x module names. */
            if (self->proto < 3 && self->fix_imports) {
                if (fix_imports(st, &module_name, &global_name) < 0) {
                    goto error;
                }
            }

            /* Since Python 3.0 now supports non-ASCII identifiers, we encode
               both the module name and the global name using UTF-8. We do so
               only when we are using the pickle protocol newer than version
               3. This is to ensure compatibility with older Unpickler running
               on Python 2.x. */
            if (self->proto == 3) {
                unicode_encoder = TyUnicode_AsUTF8String;
            }
            else {
                unicode_encoder = TyUnicode_AsASCIIString;
            }
            encoded = unicode_encoder(module_name);
            if (encoded == NULL) {
                if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
                    TyObject *exc = TyErr_GetRaisedException();
                    TyErr_Format(st->PicklingError,
                                 "can't pickle module identifier %R using "
                                 "pickle protocol %i",
                                 module_name, self->proto);
                    _TyErr_ChainExceptions1(exc);
                }
                goto error;
            }
            if (_Pickler_Write(self, TyBytes_AS_STRING(encoded),
                               TyBytes_GET_SIZE(encoded)) < 0) {
                Ty_DECREF(encoded);
                goto error;
            }
            Ty_DECREF(encoded);
            if(_Pickler_Write(self, "\n", 1) < 0)
                goto error;

            /* Save the name of the module. */
            encoded = unicode_encoder(global_name);
            if (encoded == NULL) {
                if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
                    TyObject *exc = TyErr_GetRaisedException();
                    TyErr_Format(st->PicklingError,
                                 "can't pickle global identifier %R using "
                                 "pickle protocol %i",
                                 global_name, self->proto);
                    _TyErr_ChainExceptions1(exc);
                }
                goto error;
            }
            if (_Pickler_Write(self, TyBytes_AS_STRING(encoded),
                               TyBytes_GET_SIZE(encoded)) < 0) {
                Ty_DECREF(encoded);
                goto error;
            }
            Ty_DECREF(encoded);
            if (_Pickler_Write(self, "\n", 1) < 0)
                goto error;

            if (dotted_path) {
                for (i = 1; i < TyList_GET_SIZE(dotted_path); i++) {
                    if (save(st, self, TyList_GET_ITEM(dotted_path, i), 0) < 0 ||
                        _Pickler_Write(self, &tupletwo_op, 1) < 0 ||
                        _Pickler_Write(self, &reduce_op, 1) < 0)
                    {
                        goto error;
                    }
                }
            }
        }
        /* Memoize the object. */
        if (memo_put(st, self, obj) < 0)
            goto error;
    }

    if (0) {
  error:
        status = -1;
    }
    Ty_XDECREF(module_name);
    Ty_XDECREF(global_name);
    Ty_XDECREF(dotted_path);

    return status;
}

static int
save_singleton_type(PickleState *state, PicklerObject *self, TyObject *obj,
                    TyObject *singleton)
{
    TyObject *reduce_value;
    int status;

    reduce_value = Ty_BuildValue("O(O)", &TyType_Type, singleton);
    if (reduce_value == NULL) {
        return -1;
    }
    status = save_reduce(state, self, reduce_value, obj);
    Ty_DECREF(reduce_value);
    return status;
}

static int
save_type(PickleState *state, PicklerObject *self, TyObject *obj)
{
    if (obj == (TyObject *)&_PyNone_Type) {
        return save_singleton_type(state, self, obj, Ty_None);
    }
    else if (obj == (TyObject *)&PyEllipsis_Type) {
        return save_singleton_type(state, self, obj, Ty_Ellipsis);
    }
    else if (obj == (TyObject *)&_PyNotImplemented_Type) {
        return save_singleton_type(state, self, obj, Ty_NotImplemented);
    }
    return save_global(state, self, obj, NULL);
}

static int
save_pers(PickleState *state, PicklerObject *self, TyObject *obj)
{
    TyObject *pid = NULL;
    int status = 0;

    const char persid_op = PERSID;
    const char binpersid_op = BINPERSID;

    pid = PyObject_CallOneArg(self->persistent_id, obj);
    if (pid == NULL)
        return -1;

    if (pid != Ty_None) {
        if (self->bin) {
            if (save(state, self, pid, 1) < 0 ||
                _Pickler_Write(self, &binpersid_op, 1) < 0)
                goto error;
        }
        else {
            TyObject *pid_str;

            pid_str = PyObject_Str(pid);
            if (pid_str == NULL)
                goto error;

            /* XXX: Should it check whether the pid contains embedded
               newlines? */
            if (!TyUnicode_IS_ASCII(pid_str)) {
                TyErr_SetString(state->PicklingError,
                                "persistent IDs in protocol 0 must be "
                                "ASCII strings");
                Ty_DECREF(pid_str);
                goto error;
            }

            if (_Pickler_Write(self, &persid_op, 1) < 0 ||
                _Pickler_Write(self, TyUnicode_DATA(pid_str),
                               TyUnicode_GET_LENGTH(pid_str)) < 0 ||
                _Pickler_Write(self, "\n", 1) < 0) {
                Ty_DECREF(pid_str);
                goto error;
            }
            Ty_DECREF(pid_str);
        }
        status = 1;
    }

    if (0) {
  error:
        status = -1;
    }
    Ty_XDECREF(pid);

    return status;
}

static TyObject *
get_class(TyObject *obj)
{
    TyObject *cls;

    if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__class__), &cls) == 0) {
        cls = Ty_NewRef(Ty_TYPE(obj));
    }
    return cls;
}

/* We're saving obj, and args is the 2-thru-5 tuple returned by the
 * appropriate __reduce__ method for obj.
 */
static int
save_reduce(PickleState *st, PicklerObject *self, TyObject *args,
            TyObject *obj)
{
    TyObject *callable;
    TyObject *argtup;
    TyObject *state = NULL;
    TyObject *listitems = Ty_None;
    TyObject *dictitems = Ty_None;
    TyObject *state_setter = Ty_None;
    Ty_ssize_t size;
    int use_newobj = 0, use_newobj_ex = 0;

    const char reduce_op = REDUCE;
    const char build_op = BUILD;
    const char newobj_op = NEWOBJ;
    const char newobj_ex_op = NEWOBJ_EX;

    size = TyTuple_Size(args);
    if (size < 2 || size > 6) {
        TyErr_SetString(st->PicklingError,
                        "tuple returned by __reduce__ "
                        "must contain 2 through 6 elements");
        return -1;
    }

    if (!TyArg_UnpackTuple(args, "save_reduce", 2, 6,
                           &callable, &argtup, &state, &listitems, &dictitems,
                           &state_setter))
        return -1;

    if (!PyCallable_Check(callable)) {
        TyErr_Format(st->PicklingError,
                     "first item of the tuple returned by __reduce__ "
                     "must be callable, not %T", callable);
        return -1;
    }
    if (!TyTuple_Check(argtup)) {
        TyErr_Format(st->PicklingError,
                     "second item of the tuple returned by __reduce__ "
                     "must be a tuple, not %T", argtup);
        return -1;
    }

    if (state == Ty_None)
        state = NULL;

    if (listitems == Ty_None)
        listitems = NULL;
    else if (!TyIter_Check(listitems)) {
        TyErr_Format(st->PicklingError,
                     "fourth item of the tuple returned by __reduce__ "
                     "must be an iterator, not %T", listitems);
        return -1;
    }

    if (dictitems == Ty_None)
        dictitems = NULL;
    else if (!TyIter_Check(dictitems)) {
        TyErr_Format(st->PicklingError,
                     "fifth item of the tuple returned by __reduce__ "
                     "must be an iterator, not %T", dictitems);
        return -1;
    }

    if (state_setter == Ty_None)
        state_setter = NULL;
    else if (!PyCallable_Check(state_setter)) {
        TyErr_Format(st->PicklingError,
                     "sixth item of the tuple returned by __reduce__ "
                     "must be callable, not %T", state_setter);
        return -1;
    }

    if (self->proto >= 2) {
        TyObject *name;

        if (PyObject_GetOptionalAttr(callable, &_Ty_ID(__name__), &name) < 0) {
            return -1;
        }
        if (name != NULL && TyUnicode_Check(name)) {
            use_newobj_ex = _TyUnicode_Equal(name, &_Ty_ID(__newobj_ex__));
            if (!use_newobj_ex) {
                use_newobj = _TyUnicode_Equal(name, &_Ty_ID(__newobj__));
            }
        }
        Ty_XDECREF(name);
    }

    if (use_newobj_ex) {
        TyObject *cls;
        TyObject *args;
        TyObject *kwargs;

        if (TyTuple_GET_SIZE(argtup) != 3) {
            TyErr_Format(st->PicklingError,
                         "__newobj_ex__ expected 3 arguments, got %zd",
                         TyTuple_GET_SIZE(argtup));
            return -1;
        }

        cls = TyTuple_GET_ITEM(argtup, 0);
        if (!TyType_Check(cls)) {
            TyErr_Format(st->PicklingError,
                         "first argument to __newobj_ex__() "
                         "must be a class, not %T", cls);
            return -1;
        }
        args = TyTuple_GET_ITEM(argtup, 1);
        if (!TyTuple_Check(args)) {
            TyErr_Format(st->PicklingError,
                         "second argument to __newobj_ex__() "
                         "must be a tuple, not %T", args);
            return -1;
        }
        kwargs = TyTuple_GET_ITEM(argtup, 2);
        if (!TyDict_Check(kwargs)) {
            TyErr_Format(st->PicklingError,
                         "third argument to __newobj_ex__() "
                         "must be a dict, not %T", kwargs);
            return -1;
        }

        if (self->proto >= 4) {
            if (save(st, self, cls, 0) < 0) {
                _TyErr_FormatNote("when serializing %T class", obj);
                return -1;
            }
            if (save(st, self, args, 0) < 0 ||
                save(st, self, kwargs, 0) < 0)
            {
                _TyErr_FormatNote("when serializing %T __new__ arguments", obj);
                return -1;
            }
            if (_Pickler_Write(self, &newobj_ex_op, 1) < 0) {
                return -1;
            }
        }
        else {
            TyObject *newargs;
            TyObject *cls_new;
            Ty_ssize_t i;

            newargs = TyTuple_New(TyTuple_GET_SIZE(args) + 2);
            if (newargs == NULL)
                return -1;

            cls_new = PyObject_GetAttr(cls, &_Ty_ID(__new__));
            if (cls_new == NULL) {
                Ty_DECREF(newargs);
                return -1;
            }
            TyTuple_SET_ITEM(newargs, 0, cls_new);
            TyTuple_SET_ITEM(newargs, 1, Ty_NewRef(cls));
            for (i = 0; i < TyTuple_GET_SIZE(args); i++) {
                TyObject *item = TyTuple_GET_ITEM(args, i);
                TyTuple_SET_ITEM(newargs, i + 2, Ty_NewRef(item));
            }

            callable = PyObject_Call(st->partial, newargs, kwargs);
            Ty_DECREF(newargs);
            if (callable == NULL)
                return -1;

            newargs = TyTuple_New(0);
            if (newargs == NULL) {
                Ty_DECREF(callable);
                return -1;
            }

            if (save(st, self, callable, 0) < 0 ||
                save(st, self, newargs, 0) < 0)
            {
                _TyErr_FormatNote("when serializing %T reconstructor", obj);
                Ty_DECREF(newargs);
                Ty_DECREF(callable);
                return -1;
            }
            Ty_DECREF(newargs);
            Ty_DECREF(callable);
            if (_Pickler_Write(self, &reduce_op, 1) < 0) {
                return -1;
            }
        }
    }
    else if (use_newobj) {
        TyObject *cls;
        TyObject *newargtup;
        TyObject *obj_class;
        int p;

        /* Sanity checks. */
        if (TyTuple_GET_SIZE(argtup) < 1) {
            TyErr_Format(st->PicklingError,
                         "__newobj__ expected at least 1 argument, got %zd",
                         TyTuple_GET_SIZE(argtup));
            return -1;
        }

        cls = TyTuple_GET_ITEM(argtup, 0);
        if (!TyType_Check(cls)) {
            TyErr_Format(st->PicklingError,
                         "first argument to __newobj__() "
                         "must be a class, not %T", cls);
            return -1;
        }

        if (obj != NULL) {
            obj_class = get_class(obj);
            if (obj_class == NULL) {
                return -1;
            }
            if (obj_class != cls) {
                TyErr_Format(st->PicklingError,
                             "first argument to __newobj__() "
                             "must be %R, not %R", obj_class, cls);
                Ty_DECREF(obj_class);
                return -1;
            }
            Ty_DECREF(obj_class);
        }
        /* XXX: These calls save() are prone to infinite recursion. Imagine
           what happen if the value returned by the __reduce__() method of
           some extension type contains another object of the same type. Ouch!

           Here is a quick example, that I ran into, to illustrate what I
           mean:

             >>> import pickle, copyreg
             >>> copyreg.dispatch_table.pop(complex)
             >>> pickle.dumps(1+2j)
             Traceback (most recent call last):
               ...
             RecursionError: maximum recursion depth exceeded

           Removing the complex class from copyreg.dispatch_table made the
           __reduce_ex__() method emit another complex object:

             >>> (1+1j).__reduce_ex__(2)
             (<function __newobj__ at 0xb7b71c3c>,
               (<class 'complex'>, (1+1j)), None, None, None)

           Thus when save() was called on newargstup (the 2nd item) recursion
           ensued. Of course, the bug was in the complex class which had a
           broken __getnewargs__() that emitted another complex object. But,
           the point, here, is it is quite easy to end up with a broken reduce
           function. */

        /* Save the class and its __new__ arguments. */
        if (save(st, self, cls, 0) < 0) {
            _TyErr_FormatNote("when serializing %T class", obj);
            return -1;
        }

        newargtup = TyTuple_GetSlice(argtup, 1, TyTuple_GET_SIZE(argtup));
        if (newargtup == NULL)
            return -1;

        p = save(st, self, newargtup, 0);
        Ty_DECREF(newargtup);
        if (p < 0) {
            _TyErr_FormatNote("when serializing %T __new__ arguments", obj);
            return -1;
        }

        /* Add NEWOBJ opcode. */
        if (_Pickler_Write(self, &newobj_op, 1) < 0)
            return -1;
    }
    else { /* Not using NEWOBJ. */
        if (save(st, self, callable, 0) < 0) {
            _TyErr_FormatNote("when serializing %T reconstructor", obj);
            return -1;
        }
        if (save(st, self, argtup, 0) < 0) {
            _TyErr_FormatNote("when serializing %T reconstructor arguments", obj);
            return -1;
        }
        if (_Pickler_Write(self, &reduce_op, 1) < 0) {
            return -1;
        }
    }

    /* obj can be NULL when save_reduce() is used directly. A NULL obj means
       the caller do not want to memoize the object. Not particularly useful,
       but that is to mimic the behavior save_reduce() in pickle.py when
       obj is None. */
    if (obj != NULL) {
        /* If the object is already in the memo, this means it is
           recursive. In this case, throw away everything we put on the
           stack, and fetch the object back from the memo. */
        if (PyMemoTable_Get(self->memo, obj)) {
            const char pop_op = POP;

            if (_Pickler_Write(self, &pop_op, 1) < 0)
                return -1;
            if (memo_get(st, self, obj) < 0)
                return -1;

            return 0;
        }
        else if (memo_put(st, self, obj) < 0)
            return -1;
    }

    if (listitems && batch_list(st, self, listitems, obj) < 0)
        return -1;

    if (dictitems && batch_dict(st, self, dictitems, obj) < 0)
        return -1;

    if (state) {
        if (state_setter == NULL) {
            if (save(st, self, state, 0) < 0) {
                _TyErr_FormatNote("when serializing %T state", obj);
                return -1;
            }
            if (_Pickler_Write(self, &build_op, 1) < 0)
                return -1;
        }
        else {

            /* If a state_setter is specified, call it instead of load_build to
             * update obj's with its previous state.
             * The first 4 save/write instructions push state_setter and its
             * tuple of expected arguments (obj, state) onto the stack. The
             * REDUCE opcode triggers the state_setter(obj, state) function
             * call. Finally, because state-updating routines only do in-place
             * modification, the whole operation has to be stack-transparent.
             * Thus, we finally pop the call's output from the stack.*/

            const char tupletwo_op = TUPLE2;
            const char pop_op = POP;
            if (save(st, self, state_setter, 0) < 0) {
                _TyErr_FormatNote("when serializing %T state setter", obj);
                return -1;
            }
            if (save(st, self, obj, 0) < 0) {
                return -1;
            }
            if (save(st, self, state, 0) < 0) {
                _TyErr_FormatNote("when serializing %T state", obj);
                return -1;
            }
            if (_Pickler_Write(self, &tupletwo_op, 1) < 0 ||
                _Pickler_Write(self, &reduce_op, 1) < 0 ||
                _Pickler_Write(self, &pop_op, 1) < 0)
                return -1;
        }
    }
    return 0;
}

static int
save(PickleState *st, PicklerObject *self, TyObject *obj, int pers_save)
{
    TyTypeObject *type;
    TyObject *reduce_func = NULL;
    TyObject *reduce_value = NULL;
    int status = 0;

    if (_Pickler_OpcodeBoundary(self) < 0)
        return -1;

    /* The extra pers_save argument is necessary to avoid calling save_pers()
       on its returned object. */
    if (!pers_save && self->persistent_id) {
        /* save_pers() returns:
            -1   to signal an error;
             0   if it did nothing successfully;
             1   if a persistent id was saved.
         */
        if ((status = save_pers(st, self, obj)) != 0)
            return status;
    }

    type = Ty_TYPE(obj);

    /* The old cPickle had an optimization that used switch-case statement
       dispatching on the first letter of the type name.  This has was removed
       since benchmarks shown that this optimization was actually slowing
       things down. */

    /* Atom types; these aren't memoized, so don't check the memo. */

    if (obj == Ty_None) {
        return save_none(self, obj);
    }
    else if (obj == Ty_False || obj == Ty_True) {
        return save_bool(self, obj);
    }
    else if (type == &TyLong_Type) {
        return save_long(self, obj);
    }
    else if (type == &TyFloat_Type) {
        return save_float(self, obj);
    }

    /* Check the memo to see if it has the object. If so, generate
       a GET (or BINGET) opcode, instead of pickling the object
       once again. */
    if (PyMemoTable_Get(self->memo, obj)) {
        return memo_get(st, self, obj);
    }

    if (type == &TyBytes_Type) {
        return save_bytes(st, self, obj);
    }
    else if (type == &TyUnicode_Type) {
        return save_unicode(st, self, obj);
    }

    /* We're only calling _Ty_EnterRecursiveCall here so that atomic
       types above are pickled faster. */
    if (_Ty_EnterRecursiveCall(" while pickling an object")) {
        return -1;
    }

    if (type == &TyDict_Type) {
        status = save_dict(st, self, obj);
        goto done;
    }
    else if (type == &TySet_Type) {
        status = save_set(st, self, obj);
        goto done;
    }
    else if (type == &TyFrozenSet_Type) {
        status = save_frozenset(st, self, obj);
        goto done;
    }
    else if (type == &TyList_Type) {
        status = save_list(st, self, obj);
        goto done;
    }
    else if (type == &TyTuple_Type) {
        status = save_tuple(st, self, obj);
        goto done;
    }
    else if (type == &TyByteArray_Type) {
        status = save_bytearray(st, self, obj);
        goto done;
    }
    else if (type == &PyPickleBuffer_Type) {
        status = save_picklebuffer(st, self, obj);
        goto done;
    }

    /* Now, check reducer_override.  If it returns NotImplemented,
     * fallback to save_type or save_global, and then perhaps to the
     * regular reduction mechanism.
     */
    if (self->reducer_override != NULL) {
        reduce_value = PyObject_CallOneArg(self->reducer_override, obj);
        if (reduce_value == NULL) {
            goto error;
        }
        if (reduce_value != Ty_NotImplemented) {
            goto reduce;
        }
        Ty_SETREF(reduce_value, NULL);
    }

    if (type == &TyType_Type) {
        status = save_type(st, self, obj);
        goto done;
    }
    else if (type == &TyFunction_Type) {
        status = save_global(st, self, obj, NULL);
        goto done;
    }

    /* XXX: This part needs some unit tests. */

    /* Get a reduction callable, and call it.  This may come from
     * self.dispatch_table, copyreg.dispatch_table, the object's
     * __reduce_ex__ method, or the object's __reduce__ method.
     */
    if (self->dispatch_table == NULL) {
        reduce_func = TyDict_GetItemWithError(st->dispatch_table,
                                              (TyObject *)type);
        if (reduce_func == NULL) {
            if (TyErr_Occurred()) {
                goto error;
            }
        } else {
            /* TyDict_GetItemWithError() returns a borrowed reference.
               Increase the reference count to be consistent with
               PyObject_GetItem and _TyObject_GetAttrId used below. */
            Ty_INCREF(reduce_func);
        }
    }
    else if (PyMapping_GetOptionalItem(self->dispatch_table, (TyObject *)type,
                                       &reduce_func) < 0)
    {
        goto error;
    }

    if (reduce_func != NULL) {
        reduce_value = _Pickle_FastCall(reduce_func, Ty_NewRef(obj));
    }
    else if (TyType_IsSubtype(type, &TyType_Type)) {
        status = save_global(st, self, obj, NULL);
        goto done;
    }
    else {
        /* XXX: If the __reduce__ method is defined, __reduce_ex__ is
           automatically defined as __reduce__. While this is convenient, this
           make it impossible to know which method was actually called. Of
           course, this is not a big deal. But still, it would be nice to let
           the user know which method was called when something go
           wrong. Incidentally, this means if __reduce_ex__ is not defined, we
           don't actually have to check for a __reduce__ method. */

        /* Check for a __reduce_ex__ method. */
        if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__reduce_ex__), &reduce_func) < 0) {
            goto error;
        }
        if (reduce_func != NULL) {
            TyObject *proto;
            proto = TyLong_FromLong(self->proto);
            if (proto != NULL) {
                reduce_value = _Pickle_FastCall(reduce_func, proto);
            }
        }
        else {
            /* Check for a __reduce__ method. */
            if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__reduce__), &reduce_func) < 0) {
                goto error;
            }
            if (reduce_func != NULL) {
                reduce_value = PyObject_CallNoArgs(reduce_func);
            }
            else {
                TyErr_Format(st->PicklingError,
                             "Can't pickle %T object", obj);
                goto error;
            }
        }
    }

    if (reduce_value == NULL)
        goto error;

  reduce:
    if (TyUnicode_Check(reduce_value)) {
        status = save_global(st, self, obj, reduce_value);
        goto done;
    }

    if (!TyTuple_Check(reduce_value)) {
        TyErr_Format(st->PicklingError,
                     "__reduce__ must return a string or tuple, not %T", reduce_value);
        _TyErr_FormatNote("when serializing %T object", obj);
        goto error;
    }

    status = save_reduce(st, self, reduce_value, obj);
    if (status < 0) {
        _TyErr_FormatNote("when serializing %T object", obj);
    }

    if (0) {
  error:
        status = -1;
    }
  done:

    _Ty_LeaveRecursiveCall();
    Ty_XDECREF(reduce_func);
    Ty_XDECREF(reduce_value);

    return status;
}

static TyObject *
persistent_id(TyObject *self, TyObject *obj)
{
    Py_RETURN_NONE;
}

static int
dump(PickleState *state, PicklerObject *self, TyObject *obj)
{
    const char stop_op = STOP;
    int status = -1;
    TyObject *tmp;

    /* Cache the persistent_id method. */
    tmp = PyObject_GetAttr((TyObject *)self, &_Ty_ID(persistent_id));
    if (tmp == NULL) {
        goto error;
    }
    if (PyCFunction_Check(tmp) &&
        PyCFunction_GET_SELF(tmp) == (TyObject *)self &&
        PyCFunction_GET_FUNCTION(tmp) == persistent_id)
    {
        Ty_CLEAR(tmp);
    }
    Ty_XSETREF(self->persistent_id, tmp);

    /* Cache the reducer_override method, if it exists. */
    if (PyObject_GetOptionalAttr((TyObject *)self, &_Ty_ID(reducer_override),
                             &tmp) < 0) {
        goto error;
    }
    Ty_XSETREF(self->reducer_override, tmp);

    if (self->proto >= 2) {
        char header[2];

        header[0] = PROTO;
        assert(self->proto >= 0 && self->proto < 256);
        header[1] = (unsigned char)self->proto;
        if (_Pickler_Write(self, header, 2) < 0)
            goto error;
        if (self->proto >= 4)
            self->framing = 1;
    }

    if (save(state, self, obj, 0) < 0 ||
        _Pickler_Write(self, &stop_op, 1) < 0 ||
        _Pickler_CommitFrame(self) < 0)
        goto error;

    // Success
    status = 0;

  error:
    self->framing = 0;

    /* Break the reference cycle we generated at the beginning this function
     * call when setting the persistent_id and the reducer_override attributes
     * of the Pickler instance to a bound method of the same instance.
     * This is important as the Pickler instance holds a reference to each
     * object it has pickled (through its memo): thus, these objects won't
     * be garbage-collected as long as the Pickler itself is not collected. */
    Ty_CLEAR(self->persistent_id);
    Ty_CLEAR(self->reducer_override);
    return status;
}

/*[clinic input]

_pickle.Pickler.clear_memo

Clears the pickler's "memo".

The memo is the data structure that remembers which objects the
pickler has already seen, so that shared or recursive objects are
pickled by reference and not by value.  This method is useful when
re-using picklers.
[clinic start generated code]*/

static TyObject *
_pickle_Pickler_clear_memo_impl(PicklerObject *self)
/*[clinic end generated code: output=8665c8658aaa094b input=01bdad52f3d93e56]*/
{
    if (self->memo)
        PyMemoTable_Clear(self->memo);

    Py_RETURN_NONE;
}

/*[clinic input]

_pickle.Pickler.dump

  cls: defining_class
  obj: object
  /

Write a pickled representation of the given object to the open file.
[clinic start generated code]*/

static TyObject *
_pickle_Pickler_dump_impl(PicklerObject *self, TyTypeObject *cls,
                          TyObject *obj)
/*[clinic end generated code: output=952cf7f68b1445bb input=f949d84151983594]*/
{
    PickleState *st = _Pickle_GetStateByClass(cls);
    /* Check whether the Pickler was initialized correctly (issue3664).
       Developers often forget to call __init__() in their subclasses, which
       would trigger a segfault without this check. */
    if (self->write == NULL) {
        TyErr_Format(st->PicklingError,
                     "Pickler.__init__() was not called by %s.__init__()",
                     Ty_TYPE(self)->tp_name);
        return NULL;
    }

    if (_Pickler_ClearBuffer(self) < 0)
        return NULL;

    if (dump(st, self, obj) < 0)
        return NULL;

    if (_Pickler_FlushToFile(self) < 0)
        return NULL;

    Py_RETURN_NONE;
}

/*[clinic input]

_pickle.Pickler.__sizeof__ -> size_t

Returns size in memory, in bytes.
[clinic start generated code]*/

static size_t
_pickle_Pickler___sizeof___impl(PicklerObject *self)
/*[clinic end generated code: output=23ad75658d3b59ff input=d8127c8e7012ebd7]*/
{
    size_t res = _TyObject_SIZE(Ty_TYPE(self));
    if (self->memo != NULL) {
        res += sizeof(PyMemoTable);
        res += self->memo->mt_allocated * sizeof(PyMemoEntry);
    }
    if (self->output_buffer != NULL) {
        size_t s = _TySys_GetSizeOf(self->output_buffer);
        if (s == (size_t)-1) {
            return -1;
        }
        res += s;
    }
    return res;
}

static struct TyMethodDef Pickler_methods[] = {
    {"persistent_id", persistent_id, METH_O,
        TyDoc_STR("persistent_id($self, obj, /)\n--\n\n")},
    _PICKLE_PICKLER_DUMP_METHODDEF
    _PICKLE_PICKLER_CLEAR_MEMO_METHODDEF
    _PICKLE_PICKLER___SIZEOF___METHODDEF
    {NULL, NULL}                /* sentinel */
};

static int
Pickler_clear(TyObject *op)
{
    PicklerObject *self = PicklerObject_CAST(op);
    Ty_CLEAR(self->output_buffer);
    Ty_CLEAR(self->write);
    Ty_CLEAR(self->persistent_id);
    Ty_CLEAR(self->persistent_id_attr);
    Ty_CLEAR(self->dispatch_table);
    Ty_CLEAR(self->fast_memo);
    Ty_CLEAR(self->reducer_override);
    Ty_CLEAR(self->buffer_callback);

    if (self->memo != NULL) {
        PyMemoTable *memo = self->memo;
        self->memo = NULL;
        PyMemoTable_Del(memo);
    }
    return 0;
}

static void
Pickler_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)Pickler_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
Pickler_traverse(TyObject *op, visitproc visit, void *arg)
{
    PicklerObject *self = PicklerObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->write);
    Ty_VISIT(self->persistent_id);
    Ty_VISIT(self->persistent_id_attr);
    Ty_VISIT(self->dispatch_table);
    Ty_VISIT(self->fast_memo);
    Ty_VISIT(self->reducer_override);
    Ty_VISIT(self->buffer_callback);
    PyMemoTable *memo = self->memo;
    if (memo && memo->mt_table) {
        Ty_ssize_t i = memo->mt_allocated;
        while (--i >= 0) {
            Ty_VISIT(memo->mt_table[i].me_key);
        }
    }

    return 0;
}


/*[clinic input]

_pickle.Pickler.__init__

  file: object
  protocol: object = None
  fix_imports: bool = True
  buffer_callback: object = None

This takes a binary file for writing a pickle data stream.

The optional *protocol* argument tells the pickler to use the given
protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default
protocol is 5. It was introduced in Python 3.8, and is incompatible
with previous versions.

Specifying a negative protocol version selects the highest protocol
version supported.  The higher the protocol used, the more recent the
version of Python needed to read the pickle produced.

The *file* argument must have a write() method that accepts a single
bytes argument. It can thus be a file object opened for binary
writing, an io.BytesIO instance, or any other custom object that meets
this interface.

If *fix_imports* is True and protocol is less than 3, pickle will try
to map the new Python 3 names to the old module names used in Python
2, so that the pickle data stream is readable with Python 2.

If *buffer_callback* is None (the default), buffer views are
serialized into *file* as part of the pickle stream.

If *buffer_callback* is not None, then it can be called any number
of times with a buffer view.  If the callback returns a false value
(such as None), the given buffer is out-of-band; otherwise the
buffer is serialized in-band, i.e. inside the pickle stream.

It is an error if *buffer_callback* is not None and *protocol*
is None or smaller than 5.

[clinic start generated code]*/

static int
_pickle_Pickler___init___impl(PicklerObject *self, TyObject *file,
                              TyObject *protocol, int fix_imports,
                              TyObject *buffer_callback)
/*[clinic end generated code: output=0abedc50590d259b input=cddc50f66b770002]*/
{
    /* In case of multiple __init__() calls, clear previous content. */
    if (self->write != NULL)
        (void)Pickler_clear((TyObject *)self);

    if (_Pickler_SetProtocol(self, protocol, fix_imports) < 0)
        return -1;

    if (_Pickler_SetOutputStream(self, file) < 0)
        return -1;

    if (_Pickler_SetBufferCallback(self, buffer_callback) < 0)
        return -1;

    /* memo and output_buffer may have already been created in _Pickler_New */
    if (self->memo == NULL) {
        self->memo = PyMemoTable_New();
        if (self->memo == NULL)
            return -1;
    }
    self->output_len = 0;
    if (self->output_buffer == NULL) {
        self->max_output_len = WRITE_BUF_SIZE;
        self->output_buffer = TyBytes_FromStringAndSize(NULL,
                                                        self->max_output_len);
        if (self->output_buffer == NULL)
            return -1;
    }

    self->fast = 0;
    self->fast_nesting = 0;
    self->fast_memo = NULL;

    if (self->dispatch_table != NULL) {
        return 0;
    }
    if (PyObject_GetOptionalAttr((TyObject *)self, &_Ty_ID(dispatch_table),
                             &self->dispatch_table) < 0) {
        return -1;
    }

    return 0;
}


/* Define a proxy object for the Pickler's internal memo object. This is to
 * avoid breaking code like:
 *  pickler.memo.clear()
 * and
 *  pickler.memo = saved_memo
 * Is this a good idea? Not really, but we don't want to break code that uses
 * it. Note that we don't implement the entire mapping API here. This is
 * intentional, as these should be treated as black-box implementation details.
 */

/*[clinic input]
_pickle.PicklerMemoProxy.clear

Remove all items from memo.
[clinic start generated code]*/

static TyObject *
_pickle_PicklerMemoProxy_clear_impl(PicklerMemoProxyObject *self)
/*[clinic end generated code: output=5fb9370d48ae8b05 input=ccc186dacd0f1405]*/
{
    if (self->pickler->memo)
        PyMemoTable_Clear(self->pickler->memo);
    Py_RETURN_NONE;
}

/*[clinic input]
_pickle.PicklerMemoProxy.copy

Copy the memo to a new object.
[clinic start generated code]*/

static TyObject *
_pickle_PicklerMemoProxy_copy_impl(PicklerMemoProxyObject *self)
/*[clinic end generated code: output=bb83a919d29225ef input=b73043485ac30b36]*/
{
    PyMemoTable *memo;
    TyObject *new_memo = TyDict_New();
    if (new_memo == NULL)
        return NULL;

    memo = self->pickler->memo;
    for (size_t i = 0; i < memo->mt_allocated; ++i) {
        PyMemoEntry entry = memo->mt_table[i];
        if (entry.me_key != NULL) {
            int status;
            TyObject *key, *value;

            key = TyLong_FromVoidPtr(entry.me_key);
            if (key == NULL) {
                goto error;
            }
            value = Ty_BuildValue("nO", entry.me_value, entry.me_key);
            if (value == NULL) {
                Ty_DECREF(key);
                goto error;
            }
            status = TyDict_SetItem(new_memo, key, value);
            Ty_DECREF(key);
            Ty_DECREF(value);
            if (status < 0)
                goto error;
        }
    }
    return new_memo;

  error:
    Ty_XDECREF(new_memo);
    return NULL;
}

/*[clinic input]
_pickle.PicklerMemoProxy.__reduce__

Implement pickle support.
[clinic start generated code]*/

static TyObject *
_pickle_PicklerMemoProxy___reduce___impl(PicklerMemoProxyObject *self)
/*[clinic end generated code: output=bebba1168863ab1d input=2f7c540e24b7aae4]*/
{
    TyObject *reduce_value, *dict_args;
    TyObject *contents = _pickle_PicklerMemoProxy_copy_impl(self);
    if (contents == NULL)
        return NULL;

    reduce_value = TyTuple_New(2);
    if (reduce_value == NULL) {
        Ty_DECREF(contents);
        return NULL;
    }
    dict_args = TyTuple_New(1);
    if (dict_args == NULL) {
        Ty_DECREF(contents);
        Ty_DECREF(reduce_value);
        return NULL;
    }
    TyTuple_SET_ITEM(dict_args, 0, contents);
    TyTuple_SET_ITEM(reduce_value, 0, Ty_NewRef(&TyDict_Type));
    TyTuple_SET_ITEM(reduce_value, 1, dict_args);
    return reduce_value;
}

static TyMethodDef picklerproxy_methods[] = {
    _PICKLE_PICKLERMEMOPROXY_CLEAR_METHODDEF
    _PICKLE_PICKLERMEMOPROXY_COPY_METHODDEF
    _PICKLE_PICKLERMEMOPROXY___REDUCE___METHODDEF
    {NULL, NULL} /* sentinel */
};

static void
PicklerMemoProxy_dealloc(TyObject *op)
{
    PicklerMemoProxyObject *self = PicklerMemoProxyObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    Ty_CLEAR(self->pickler);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
PicklerMemoProxy_traverse(TyObject *op, visitproc visit, void *arg)
{
    PicklerMemoProxyObject *self = PicklerMemoProxyObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->pickler);
    return 0;
}

static int
PicklerMemoProxy_clear(TyObject *op)
{
    PicklerMemoProxyObject *self = PicklerMemoProxyObject_CAST(op);
    Ty_CLEAR(self->pickler);
    return 0;
}

static TyType_Slot memoproxy_slots[] = {
    {Ty_tp_dealloc, PicklerMemoProxy_dealloc},
    {Ty_tp_traverse, PicklerMemoProxy_traverse},
    {Ty_tp_clear, PicklerMemoProxy_clear},
    {Ty_tp_methods, picklerproxy_methods},
    {Ty_tp_hash, PyObject_HashNotImplemented},
    {0, NULL},
};

static TyType_Spec memoproxy_spec = {
    .name = "_pickle.PicklerMemoProxy",
    .basicsize = sizeof(PicklerMemoProxyObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = memoproxy_slots,
};

static TyObject *
PicklerMemoProxy_New(PicklerObject *pickler)
{
    PicklerMemoProxyObject *self;
    PickleState *st = _Pickle_FindStateByType(Ty_TYPE(pickler));
    self = PyObject_GC_New(PicklerMemoProxyObject, st->PicklerMemoProxyType);
    if (self == NULL)
        return NULL;
    self->pickler = (PicklerObject*)Ty_NewRef(pickler);
    PyObject_GC_Track(self);
    return (TyObject *)self;
}

/*****************************************************************************/

static TyObject *
Pickler_get_memo(TyObject *op, void *Py_UNUSED(closure))
{
    PicklerObject *self = PicklerObject_CAST(op);
    return PicklerMemoProxy_New(self);
}

static int
Pickler_set_memo(TyObject *op, TyObject *obj, void *Py_UNUSED(closure))
{
    PyMemoTable *new_memo = NULL;
    PicklerObject *self = PicklerObject_CAST(op);

    if (obj == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "attribute deletion is not supported");
        return -1;
    }

    PickleState *st = _Pickle_FindStateByType(Ty_TYPE(self));
    if (Ty_IS_TYPE(obj, st->PicklerMemoProxyType)) {
        PicklerObject *pickler = /* safe fast cast for 'obj' */
            ((PicklerMemoProxyObject *)obj)->pickler;

        new_memo = PyMemoTable_Copy(pickler->memo);
        if (new_memo == NULL)
            return -1;
    }
    else if (TyDict_Check(obj)) {
        Ty_ssize_t i = 0;
        TyObject *key, *value;

        new_memo = PyMemoTable_New();
        if (new_memo == NULL)
            return -1;

        while (TyDict_Next(obj, &i, &key, &value)) {
            Ty_ssize_t memo_id;
            TyObject *memo_obj;

            if (!TyTuple_Check(value) || TyTuple_GET_SIZE(value) != 2) {
                TyErr_SetString(TyExc_TypeError,
                                "'memo' values must be 2-item tuples");
                goto error;
            }
            memo_id = TyLong_AsSsize_t(TyTuple_GET_ITEM(value, 0));
            if (memo_id == -1 && TyErr_Occurred())
                goto error;
            memo_obj = TyTuple_GET_ITEM(value, 1);
            if (PyMemoTable_Set(new_memo, memo_obj, memo_id) < 0)
                goto error;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "'memo' attribute must be a PicklerMemoProxy object "
                     "or dict, not %.200s", Ty_TYPE(obj)->tp_name);
        return -1;
    }

    PyMemoTable_Del(self->memo);
    self->memo = new_memo;

    return 0;

  error:
    if (new_memo)
        PyMemoTable_Del(new_memo);
    return -1;
}

static TyObject *
Pickler_getattr(TyObject *self, TyObject *name)
{
    PicklerObject *po = PicklerObject_CAST(self);
    if (TyUnicode_Check(name)
        && TyUnicode_EqualToUTF8(name, "persistent_id")
        && po->persistent_id_attr)
    {
        return Ty_NewRef(po->persistent_id_attr);
    }

    return PyObject_GenericGetAttr(self, name);
}

static int
Pickler_setattr(TyObject *self, TyObject *name, TyObject *value)
{
    if (TyUnicode_Check(name)
        && TyUnicode_EqualToUTF8(name, "persistent_id"))
    {
        PicklerObject *po = PicklerObject_CAST(self);
        Ty_XINCREF(value);
        Ty_XSETREF(po->persistent_id_attr, value);
        return 0;
    }

    return PyObject_GenericSetAttr(self, name, value);
}

static TyMemberDef Pickler_members[] = {
    {"bin", Ty_T_INT, offsetof(PicklerObject, bin)},
    {"fast", Ty_T_INT, offsetof(PicklerObject, fast)},
    {"dispatch_table", Ty_T_OBJECT_EX, offsetof(PicklerObject, dispatch_table)},
    {NULL}
};

static TyGetSetDef Pickler_getsets[] = {
    {"memo", Pickler_get_memo, Pickler_set_memo},
    {NULL}
};

static TyType_Slot pickler_type_slots[] = {
    {Ty_tp_dealloc, Pickler_dealloc},
    {Ty_tp_getattro, Pickler_getattr},
    {Ty_tp_setattro, Pickler_setattr},
    {Ty_tp_methods, Pickler_methods},
    {Ty_tp_members, Pickler_members},
    {Ty_tp_getset, Pickler_getsets},
    {Ty_tp_clear, Pickler_clear},
    {Ty_tp_doc, (char*)_pickle_Pickler___init____doc__},
    {Ty_tp_traverse, Pickler_traverse},
    {Ty_tp_init, _pickle_Pickler___init__},
    {Ty_tp_new, TyType_GenericNew},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_free, PyObject_GC_Del},
    {0, NULL},
};

static TyType_Spec pickler_type_spec = {
    .name = "_pickle.Pickler",
    .basicsize = sizeof(PicklerObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = pickler_type_slots,
};

/* Temporary helper for calling self.find_class().

   XXX: It would be nice to able to avoid Python function call overhead, by
   using directly the C version of find_class(), when find_class() is not
   overridden by a subclass. Although, this could become rather hackish. A
   simpler optimization would be to call the C function when self is not a
   subclass instance. */
static TyObject *
find_class(UnpicklerObject *self, TyObject *module_name, TyObject *global_name)
{
    return PyObject_CallMethodObjArgs((TyObject *)self, &_Ty_ID(find_class),
                                      module_name, global_name, NULL);
}

static Ty_ssize_t
marker(PickleState *st, UnpicklerObject *self)
{
    if (self->num_marks < 1) {
        TyErr_SetString(st->UnpicklingError, "could not find MARK");
        return -1;
    }

    Ty_ssize_t mark = self->marks[--self->num_marks];
    self->stack->mark_set = self->num_marks != 0;
    self->stack->fence = self->num_marks ?
            self->marks[self->num_marks - 1] : 0;
    return mark;
}

static int
load_none(PickleState *state, UnpicklerObject *self)
{
    PDATA_APPEND(self->stack, Ty_None, -1);
    return 0;
}

static int
load_int(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    char *endptr, *s;
    Ty_ssize_t len;
    long x;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);

    errno = 0;
    /* XXX(avassalotti): Should this uses TyOS_strtol()? */
    x = strtol(s, &endptr, 10);

    if (errno || (*endptr != '\n' && *endptr != '\0')) {
        /* Hm, maybe we've got something long.  Let's try reading
         * it as a Python int object. */
        errno = 0;
        value = TyLong_FromString(s, NULL, 10);
        if (value == NULL) {
            TyErr_SetString(TyExc_ValueError,
                            "could not convert string to int");
            return -1;
        }
    }
    else {
        if (len == 3 && (x == 0 || x == 1)) {
            if ((value = TyBool_FromLong(x)) == NULL)
                return -1;
        }
        else {
            if ((value = TyLong_FromLong(x)) == NULL)
                return -1;
        }
    }

    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

static int
load_bool(PickleState *state, UnpicklerObject *self, TyObject *boolean)
{
    assert(boolean == Ty_True || boolean == Ty_False);
    PDATA_APPEND(self->stack, boolean, -1);
    return 0;
}

/* s contains x bytes of an unsigned little-endian integer.  Return its value
 * as a C Ty_ssize_t, or -1 if it's higher than PY_SSIZE_T_MAX.
 */
static Ty_ssize_t
calc_binsize(char *bytes, int nbytes)
{
    unsigned char *s = (unsigned char *)bytes;
    int i;
    size_t x = 0;

    if (nbytes > (int)sizeof(size_t)) {
        /* Check for integer overflow.  BINBYTES8 and BINUNICODE8 opcodes
         * have 64-bit size that can't be represented on 32-bit platform.
         */
        for (i = (int)sizeof(size_t); i < nbytes; i++) {
            if (s[i])
                return -1;
        }
        nbytes = (int)sizeof(size_t);
    }
    for (i = 0; i < nbytes; i++) {
        x |= (size_t) s[i] << (8 * i);
    }

    if (x > PY_SSIZE_T_MAX)
        return -1;
    else
        return (Ty_ssize_t) x;
}

/* s contains x bytes of a little-endian integer.  Return its value as a
 * C int.  Obscure:  when x is 1 or 2, this is an unsigned little-endian
 * int, but when x is 4 it's a signed one.  This is a historical source
 * of x-platform bugs.
 */
static long
calc_binint(char *bytes, int nbytes)
{
    unsigned char *s = (unsigned char *)bytes;
    Ty_ssize_t i;
    long x = 0;

    for (i = 0; i < nbytes; i++) {
        x |= (long)s[i] << (8 * i);
    }

    /* Unlike BININT1 and BININT2, BININT (more accurately BININT4)
     * is signed, so on a box with longs bigger than 4 bytes we need
     * to extend a BININT's sign bit to the full width.
     */
    if (SIZEOF_LONG > 4 && nbytes == 4) {
        x |= -(x & (1L << 31));
    }

    return x;
}

static int
load_binintx(UnpicklerObject *self, char *s, int size)
{
    TyObject *value;
    long x;

    x = calc_binint(s, size);

    if ((value = TyLong_FromLong(x)) == NULL)
        return -1;

    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

static int
load_binint(PickleState *state, UnpicklerObject *self)
{
    char *s;
    if (_Unpickler_Read(self, state, &s, 4) < 0)
        return -1;

    return load_binintx(self, s, 4);
}

static int
load_binint1(PickleState *state, UnpicklerObject *self)
{
    char *s;
    if (_Unpickler_Read(self, state, &s, 1) < 0)
        return -1;

    return load_binintx(self, s, 1);
}

static int
load_binint2(PickleState *state, UnpicklerObject *self)
{
    char *s;
    if (_Unpickler_Read(self, state, &s, 2) < 0)
        return -1;

    return load_binintx(self, s, 2);
}

static int
load_long(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    char *s = NULL;
    Ty_ssize_t len;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);

    /* s[len-2] will usually be 'L' (and s[len-1] is '\n'); we need to remove
       the 'L' before calling TyLong_FromString.  In order to maintain
       compatibility with Python 3.0.0, we don't actually *require*
       the 'L' to be present. */
    if (s[len-2] == 'L')
        s[len-2] = '\0';
    value = TyLong_FromString(s, NULL, 10);
    if (value == NULL)
        return -1;

    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

/* 'size' bytes contain the # of bytes of little-endian 256's-complement
 * data following.
 */
static int
load_counted_long(PickleState *st, UnpicklerObject *self, int size)
{
    TyObject *value;
    char *nbytes;
    char *pdata;

    assert(size == 1 || size == 4);
    if (_Unpickler_Read(self, st, &nbytes, size) < 0)
        return -1;

    size = calc_binint(nbytes, size);
    if (size < 0) {
        /* Corrupt or hostile pickle -- we never write one like this */
        TyErr_SetString(st->UnpicklingError,
                        "LONG pickle has negative byte count");
        return -1;
    }

    if (size == 0)
        value = TyLong_FromLong(0L);
    else {
        /* Read the raw little-endian bytes and convert. */
        if (_Unpickler_Read(self, st, &pdata, size) < 0)
            return -1;
        value = _TyLong_FromByteArray((unsigned char *)pdata, (size_t)size,
                                      1 /* little endian */ , 1 /* signed */ );
    }
    if (value == NULL)
        return -1;
    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

static int
load_float(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    char *endptr, *s;
    Ty_ssize_t len;
    double d;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);

    errno = 0;
    d = TyOS_string_to_double(s, &endptr, TyExc_OverflowError);
    if (d == -1.0 && TyErr_Occurred())
        return -1;
    if ((endptr[0] != '\n') && (endptr[0] != '\0')) {
        TyErr_SetString(TyExc_ValueError, "could not convert string to float");
        return -1;
    }
    value = TyFloat_FromDouble(d);
    if (value == NULL)
        return -1;

    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

static int
load_binfloat(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    double x;
    char *s;

    if (_Unpickler_Read(self, state, &s, 8) < 0)
        return -1;

    x = TyFloat_Unpack8(s, 0);
    if (x == -1.0 && TyErr_Occurred())
        return -1;

    if ((value = TyFloat_FromDouble(x)) == NULL)
        return -1;

    PDATA_PUSH(self->stack, value, -1);
    return 0;
}

static int
load_string(PickleState *st, UnpicklerObject *self)
{
    TyObject *bytes;
    TyObject *obj;
    Ty_ssize_t len;
    char *s, *p;

    if ((len = _Unpickler_Readline(st, self, &s)) < 0)
        return -1;
    /* Strip the newline */
    len--;
    /* Strip outermost quotes */
    if (len >= 2 && s[0] == s[len - 1] && (s[0] == '\'' || s[0] == '"')) {
        p = s + 1;
        len -= 2;
    }
    else {
        TyErr_SetString(st->UnpicklingError,
                        "the STRING opcode argument must be quoted");
        return -1;
    }
    assert(len >= 0);

    /* Use the PyBytes API to decode the string, since that is what is used
       to encode, and then coerce the result to Unicode. */
    bytes = TyBytes_DecodeEscape(p, len, NULL, 0, NULL);
    if (bytes == NULL)
        return -1;

    /* Leave the Python 2.x strings as bytes if the *encoding* given to the
       Unpickler was 'bytes'. Otherwise, convert them to unicode. */
    if (strcmp(self->encoding, "bytes") == 0) {
        obj = bytes;
    }
    else {
        obj = TyUnicode_FromEncodedObject(bytes, self->encoding, self->errors);
        Ty_DECREF(bytes);
        if (obj == NULL) {
            return -1;
        }
    }

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static int
load_counted_binstring(PickleState *st, UnpicklerObject *self, int nbytes)
{
    TyObject *obj;
    long size;
    char *s;

    if (_Unpickler_Read(self, st, &s, nbytes) < 0)
        return -1;

    size = calc_binint(s, nbytes);
    if (size < 0) {
        TyErr_SetString(st->UnpicklingError,
                     "BINSTRING pickle has negative byte count");
        return -1;
    }

    if (_Unpickler_Read(self, st, &s, size) < 0)
        return -1;

    /* Convert Python 2.x strings to bytes if the *encoding* given to the
       Unpickler was 'bytes'. Otherwise, convert them to unicode. */
    if (strcmp(self->encoding, "bytes") == 0) {
        obj = TyBytes_FromStringAndSize(s, size);
    }
    else {
        obj = TyUnicode_Decode(s, size, self->encoding, self->errors);
    }
    if (obj == NULL) {
        return -1;
    }

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static int
load_counted_binbytes(PickleState *state, UnpicklerObject *self, int nbytes)
{
    TyObject *bytes;
    Ty_ssize_t size;
    char *s;

    if (_Unpickler_Read(self, state, &s, nbytes) < 0)
        return -1;

    size = calc_binsize(s, nbytes);
    if (size < 0) {
        TyErr_Format(TyExc_OverflowError,
                     "BINBYTES exceeds system's maximum size of %zd bytes",
                     PY_SSIZE_T_MAX);
        return -1;
    }

    bytes = TyBytes_FromStringAndSize(NULL, size);
    if (bytes == NULL)
        return -1;
    if (_Unpickler_ReadInto(state, self, TyBytes_AS_STRING(bytes), size) < 0) {
        Ty_DECREF(bytes);
        return -1;
    }

    PDATA_PUSH(self->stack, bytes, -1);
    return 0;
}

static int
load_counted_bytearray(PickleState *state, UnpicklerObject *self)
{
    TyObject *bytearray;
    Ty_ssize_t size;
    char *s;

    if (_Unpickler_Read(self, state, &s, 8) < 0) {
        return -1;
    }

    size = calc_binsize(s, 8);
    if (size < 0) {
        TyErr_Format(TyExc_OverflowError,
                     "BYTEARRAY8 exceeds system's maximum size of %zd bytes",
                     PY_SSIZE_T_MAX);
        return -1;
    }

    bytearray = TyByteArray_FromStringAndSize(NULL, size);
    if (bytearray == NULL) {
        return -1;
    }
    char *str = TyByteArray_AS_STRING(bytearray);
    if (_Unpickler_ReadInto(state, self, str, size) < 0) {
        Ty_DECREF(bytearray);
        return -1;
    }

    PDATA_PUSH(self->stack, bytearray, -1);
    return 0;
}

static int
load_next_buffer(PickleState *st, UnpicklerObject *self)
{
    if (self->buffers == NULL) {
        TyErr_SetString(st->UnpicklingError,
                        "pickle stream refers to out-of-band data "
                        "but no *buffers* argument was given");
        return -1;
    }
    TyObject *buf = TyIter_Next(self->buffers);
    if (buf == NULL) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(st->UnpicklingError,
                            "not enough out-of-band buffers");
        }
        return -1;
    }

    PDATA_PUSH(self->stack, buf, -1);
    return 0;
}

static int
load_readonly_buffer(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t len = Ty_SIZE(self->stack);
    if (len <= self->stack->fence) {
        return Pdata_stack_underflow(state, self->stack);
    }

    TyObject *obj = self->stack->data[len - 1];
    TyObject *view = TyMemoryView_FromObject(obj);
    if (view == NULL) {
        return -1;
    }
    if (!TyMemoryView_GET_BUFFER(view)->readonly) {
        /* Original object is writable */
        TyMemoryView_GET_BUFFER(view)->readonly = 1;
        self->stack->data[len - 1] = view;
        Ty_DECREF(obj);
    }
    else {
        /* Original object is read-only, no need to replace it */
        Ty_DECREF(view);
    }
    return 0;
}

static int
load_unicode(PickleState *state, UnpicklerObject *self)
{
    TyObject *str;
    Ty_ssize_t len;
    char *s = NULL;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 1)
        return bad_readline(state);

    str = TyUnicode_DecodeRawUnicodeEscape(s, len - 1, NULL);
    if (str == NULL)
        return -1;

    PDATA_PUSH(self->stack, str, -1);
    return 0;
}

static int
load_counted_binunicode(PickleState *state, UnpicklerObject *self, int nbytes)
{
    TyObject *str;
    Ty_ssize_t size;
    char *s;

    if (_Unpickler_Read(self, state, &s, nbytes) < 0)
        return -1;

    size = calc_binsize(s, nbytes);
    if (size < 0) {
        TyErr_Format(TyExc_OverflowError,
                     "BINUNICODE exceeds system's maximum size of %zd bytes",
                     PY_SSIZE_T_MAX);
        return -1;
    }

    if (_Unpickler_Read(self, state, &s, size) < 0)
        return -1;

    str = TyUnicode_DecodeUTF8(s, size, "surrogatepass");
    if (str == NULL)
        return -1;

    PDATA_PUSH(self->stack, str, -1);
    return 0;
}

static int
load_counted_tuple(PickleState *state, UnpicklerObject *self, Ty_ssize_t len)
{
    TyObject *tuple;

    if (Ty_SIZE(self->stack) < len)
        return Pdata_stack_underflow(state, self->stack);

    tuple = Pdata_poptuple(state, self->stack, Ty_SIZE(self->stack) - len);
    if (tuple == NULL)
        return -1;
    PDATA_PUSH(self->stack, tuple, -1);
    return 0;
}

static int
load_tuple(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t i;

    if ((i = marker(state, self)) < 0)
        return -1;

    return load_counted_tuple(state, self, Ty_SIZE(self->stack) - i);
}

static int
load_empty_list(PickleState *state, UnpicklerObject *self)
{
    TyObject *list;

    if ((list = TyList_New(0)) == NULL)
        return -1;
    PDATA_PUSH(self->stack, list, -1);
    return 0;
}

static int
load_empty_dict(PickleState *state, UnpicklerObject *self)
{
    TyObject *dict;

    if ((dict = TyDict_New()) == NULL)
        return -1;
    PDATA_PUSH(self->stack, dict, -1);
    return 0;
}

static int
load_empty_set(PickleState *state, UnpicklerObject *self)
{
    TyObject *set;

    if ((set = TySet_New(NULL)) == NULL)
        return -1;
    PDATA_PUSH(self->stack, set, -1);
    return 0;
}

static int
load_list(PickleState *state, UnpicklerObject *self)
{
    TyObject *list;
    Ty_ssize_t i;

    if ((i = marker(state, self)) < 0)
        return -1;

    list = Pdata_poplist(self->stack, i);
    if (list == NULL)
        return -1;
    PDATA_PUSH(self->stack, list, -1);
    return 0;
}

static int
load_dict(PickleState *st, UnpicklerObject *self)
{
    TyObject *dict, *key, *value;
    Ty_ssize_t i, j, k;

    if ((i = marker(st, self)) < 0)
        return -1;
    j = Ty_SIZE(self->stack);

    if ((dict = TyDict_New()) == NULL)
        return -1;

    if ((j - i) % 2 != 0) {
        TyErr_SetString(st->UnpicklingError, "odd number of items for DICT");
        Ty_DECREF(dict);
        return -1;
    }

    for (k = i + 1; k < j; k += 2) {
        key = self->stack->data[k - 1];
        value = self->stack->data[k];
        if (TyDict_SetItem(dict, key, value) < 0) {
            Ty_DECREF(dict);
            return -1;
        }
    }
    Pdata_clear(self->stack, i);
    PDATA_PUSH(self->stack, dict, -1);
    return 0;
}

static int
load_frozenset(PickleState *state, UnpicklerObject *self)
{
    TyObject *items;
    TyObject *frozenset;
    Ty_ssize_t i;

    if ((i = marker(state, self)) < 0)
        return -1;

    items = Pdata_poptuple(state, self->stack, i);
    if (items == NULL)
        return -1;

    frozenset = TyFrozenSet_New(items);
    Ty_DECREF(items);
    if (frozenset == NULL)
        return -1;

    PDATA_PUSH(self->stack, frozenset, -1);
    return 0;
}

static TyObject *
instantiate(TyObject *cls, TyObject *args)
{
    /* Caller must assure args are a tuple.  Normally, args come from
       Pdata_poptuple which packs objects from the top of the stack
       into a newly created tuple. */
    assert(TyTuple_Check(args));
    if (!TyTuple_GET_SIZE(args) && TyType_Check(cls)) {
        int rc = PyObject_HasAttrWithError(cls, &_Ty_ID(__getinitargs__));
        if (rc < 0) {
            return NULL;
        }
        if (!rc) {
            return PyObject_CallMethodOneArg(cls, &_Ty_ID(__new__), cls);
        }
    }
    return PyObject_CallObject(cls, args);
}

static int
load_obj(PickleState *state, UnpicklerObject *self)
{
    TyObject *cls, *args, *obj = NULL;
    Ty_ssize_t i;

    if ((i = marker(state, self)) < 0)
        return -1;

    if (Ty_SIZE(self->stack) - i < 1)
        return Pdata_stack_underflow(state, self->stack);

    args = Pdata_poptuple(state, self->stack, i + 1);
    if (args == NULL)
        return -1;

    PDATA_POP(state, self->stack, cls);
    if (cls) {
        obj = instantiate(cls, args);
        Ty_DECREF(cls);
    }
    Ty_DECREF(args);
    if (obj == NULL)
        return -1;

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static int
load_inst(PickleState *state, UnpicklerObject *self)
{
    TyObject *cls = NULL;
    TyObject *args = NULL;
    TyObject *obj = NULL;
    TyObject *module_name;
    TyObject *class_name;
    Ty_ssize_t len;
    Ty_ssize_t i;
    char *s;

    if ((i = marker(state, self)) < 0)
        return -1;
    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);

    /* Here it is safe to use TyUnicode_DecodeASCII(), even though non-ASCII
       identifiers are permitted in Python 3.0, since the INST opcode is only
       supported by older protocols on Python 2.x. */
    module_name = TyUnicode_DecodeASCII(s, len - 1, "strict");
    if (module_name == NULL)
        return -1;

    if ((len = _Unpickler_Readline(state, self, &s)) >= 0) {
        if (len < 2) {
            Ty_DECREF(module_name);
            return bad_readline(state);
        }
        class_name = TyUnicode_DecodeASCII(s, len - 1, "strict");
        if (class_name != NULL) {
            cls = find_class(self, module_name, class_name);
            Ty_DECREF(class_name);
        }
    }
    Ty_DECREF(module_name);

    if (cls == NULL)
        return -1;

    if ((args = Pdata_poptuple(state, self->stack, i)) != NULL) {
        obj = instantiate(cls, args);
        Ty_DECREF(args);
    }
    Ty_DECREF(cls);

    if (obj == NULL)
        return -1;

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static void
newobj_unpickling_error(PickleState *st, const char *msg, int use_kwargs,
                        TyObject *arg)
{
    TyErr_Format(st->UnpicklingError, msg,
                 use_kwargs ? "NEWOBJ_EX" : "NEWOBJ",
                 Ty_TYPE(arg)->tp_name);
}

static int
load_newobj(PickleState *state, UnpicklerObject *self, int use_kwargs)
{
    TyObject *cls, *args, *kwargs = NULL;
    TyObject *obj;

    /* Stack is ... cls args [kwargs], and we want to call
     * cls.__new__(cls, *args, **kwargs).
     */
    if (use_kwargs) {
        PDATA_POP(state, self->stack, kwargs);
        if (kwargs == NULL) {
            return -1;
        }
    }
    PDATA_POP(state, self->stack, args);
    if (args == NULL) {
        Ty_XDECREF(kwargs);
        return -1;
    }
    PDATA_POP(state, self->stack, cls);
    if (cls == NULL) {
        Ty_XDECREF(kwargs);
        Ty_DECREF(args);
        return -1;
    }

    if (!TyType_Check(cls)) {
        newobj_unpickling_error(state,
                                "%s class argument must be a type, not %.200s",
                                use_kwargs, cls);
        goto error;
    }
    if (((TyTypeObject *)cls)->tp_new == NULL) {
        newobj_unpickling_error(state,
                                "%s class argument '%.200s' doesn't have __new__",
                                use_kwargs, cls);
        goto error;
    }
    if (!TyTuple_Check(args)) {
        newobj_unpickling_error(state,
                                "%s args argument must be a tuple, not %.200s",
                                use_kwargs, args);
        goto error;
    }
    if (use_kwargs && !TyDict_Check(kwargs)) {
        newobj_unpickling_error(state,
                                "%s kwargs argument must be a dict, not %.200s",
                                use_kwargs, kwargs);
        goto error;
    }

    obj = ((TyTypeObject *)cls)->tp_new((TyTypeObject *)cls, args, kwargs);
    if (obj == NULL) {
        goto error;
    }
    Ty_XDECREF(kwargs);
    Ty_DECREF(args);
    Ty_DECREF(cls);
    PDATA_PUSH(self->stack, obj, -1);
    return 0;

error:
    Ty_XDECREF(kwargs);
    Ty_DECREF(args);
    Ty_DECREF(cls);
    return -1;
}

static int
load_global(PickleState *state, UnpicklerObject *self)
{
    TyObject *global = NULL;
    TyObject *module_name;
    TyObject *global_name;
    Ty_ssize_t len;
    char *s;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);
    module_name = TyUnicode_DecodeUTF8(s, len - 1, "strict");
    if (!module_name)
        return -1;

    if ((len = _Unpickler_Readline(state, self, &s)) >= 0) {
        if (len < 2) {
            Ty_DECREF(module_name);
            return bad_readline(state);
        }
        global_name = TyUnicode_DecodeUTF8(s, len - 1, "strict");
        if (global_name) {
            global = find_class(self, module_name, global_name);
            Ty_DECREF(global_name);
        }
    }
    Ty_DECREF(module_name);

    if (global == NULL)
        return -1;
    PDATA_PUSH(self->stack, global, -1);
    return 0;
}

static int
load_stack_global(PickleState *st, UnpicklerObject *self)
{
    TyObject *global;
    TyObject *module_name;
    TyObject *global_name;

    PDATA_POP(st, self->stack, global_name);
    if (global_name == NULL) {
        return -1;
    }
    PDATA_POP(st, self->stack, module_name);
    if (module_name == NULL) {
        Ty_DECREF(global_name);
        return -1;
    }
    if (!TyUnicode_CheckExact(module_name) ||
        !TyUnicode_CheckExact(global_name))
    {
        TyErr_SetString(st->UnpicklingError, "STACK_GLOBAL requires str");
        Ty_DECREF(global_name);
        Ty_DECREF(module_name);
        return -1;
    }
    global = find_class(self, module_name, global_name);
    Ty_DECREF(global_name);
    Ty_DECREF(module_name);
    if (global == NULL)
        return -1;
    PDATA_PUSH(self->stack, global, -1);
    return 0;
}

static int
load_persid(PickleState *st, UnpicklerObject *self)
{
    TyObject *pid, *obj;
    Ty_ssize_t len;
    char *s;

    if ((len = _Unpickler_Readline(st, self, &s)) < 0)
        return -1;
    if (len < 1)
        return bad_readline(st);

    pid = TyUnicode_DecodeASCII(s, len - 1, "strict");
    if (pid == NULL) {
        if (TyErr_ExceptionMatches(TyExc_UnicodeDecodeError)) {
            TyErr_SetString(st->UnpicklingError,
                            "persistent IDs in protocol 0 must be "
                            "ASCII strings");
        }
        return -1;
    }

    obj = PyObject_CallOneArg(self->persistent_load, pid);
    Ty_DECREF(pid);
    if (obj == NULL)
        return -1;

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static int
load_binpersid(PickleState *st, UnpicklerObject *self)
{
    TyObject *pid, *obj;

    PDATA_POP(st, self->stack, pid);
    if (pid == NULL)
        return -1;

    obj = PyObject_CallOneArg(self->persistent_load, pid);
    Ty_DECREF(pid);
    if (obj == NULL)
        return -1;

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

static int
load_pop(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t len = Ty_SIZE(self->stack);

    /* Note that we split the (pickle.py) stack into two stacks,
     * an object stack and a mark stack. We have to be clever and
     * pop the right one. We do this by looking at the top of the
     * mark stack first, and only signalling a stack underflow if
     * the object stack is empty and the mark stack doesn't match
     * our expectations.
     */
    if (self->num_marks > 0 && self->marks[self->num_marks - 1] == len) {
        self->num_marks--;
        self->stack->mark_set = self->num_marks != 0;
        self->stack->fence = self->num_marks ?
                self->marks[self->num_marks - 1] : 0;
    } else if (len <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    else {
        len--;
        Ty_DECREF(self->stack->data[len]);
        Ty_SET_SIZE(self->stack, len);
    }
    return 0;
}

static int
load_pop_mark(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t i;
    if ((i = marker(state, self)) < 0)
        return -1;

    Pdata_clear(self->stack, i);

    return 0;
}

static int
load_dup(PickleState *state, UnpicklerObject *self)
{
    TyObject *last;
    Ty_ssize_t len = Ty_SIZE(self->stack);

    if (len <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    last = self->stack->data[len - 1];
    PDATA_APPEND(self->stack, last, -1);
    return 0;
}

static int
load_get(PickleState *st, UnpicklerObject *self)
{
    TyObject *key, *value;
    Ty_ssize_t idx;
    Ty_ssize_t len;
    char *s;

    if ((len = _Unpickler_Readline(st, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(st);

    key = TyLong_FromString(s, NULL, 10);
    if (key == NULL)
        return -1;
    idx = TyLong_AsSsize_t(key);
    if (idx == -1 && TyErr_Occurred()) {
        Ty_DECREF(key);
        return -1;
    }

    value = _Unpickler_MemoGet(self, idx);
    if (value == NULL) {
        if (!TyErr_Occurred()) {
           TyErr_Format(st->UnpicklingError, "Memo value not found at index %ld", idx);
        }
        Ty_DECREF(key);
        return -1;
    }
    Ty_DECREF(key);

    PDATA_APPEND(self->stack, value, -1);
    return 0;
}

static int
load_binget(PickleState *st, UnpicklerObject *self)
{
    TyObject *value;
    Ty_ssize_t idx;
    char *s;

    if (_Unpickler_Read(self, st, &s, 1) < 0)
        return -1;

    idx = Ty_CHARMASK(s[0]);

    value = _Unpickler_MemoGet(self, idx);
    if (value == NULL) {
        TyObject *key = TyLong_FromSsize_t(idx);
        if (key != NULL) {
            TyErr_Format(st->UnpicklingError, "Memo value not found at index %ld", idx);
            Ty_DECREF(key);
        }
        return -1;
    }

    PDATA_APPEND(self->stack, value, -1);
    return 0;
}

static int
load_long_binget(PickleState *st, UnpicklerObject *self)
{
    TyObject *value;
    Ty_ssize_t idx;
    char *s;

    if (_Unpickler_Read(self, st, &s, 4) < 0)
        return -1;

    idx = calc_binsize(s, 4);

    value = _Unpickler_MemoGet(self, idx);
    if (value == NULL) {
        TyObject *key = TyLong_FromSsize_t(idx);
        if (key != NULL) {
            TyErr_Format(st->UnpicklingError, "Memo value not found at index %ld", idx);
            Ty_DECREF(key);
        }
        return -1;
    }

    PDATA_APPEND(self->stack, value, -1);
    return 0;
}

/* Push an object from the extension registry (EXT[124]).  nbytes is
 * the number of bytes following the opcode, holding the index (code) value.
 */
static int
load_extension(PickleState *st, UnpicklerObject *self, int nbytes)
{
    char *codebytes;            /* the nbytes bytes after the opcode */
    long code;                  /* calc_binint returns long */
    TyObject *py_code;          /* code as a Python int */
    TyObject *obj;              /* the object to push */
    TyObject *pair;             /* (module_name, class_name) */
    TyObject *module_name, *class_name;

    assert(nbytes == 1 || nbytes == 2 || nbytes == 4);
    if (_Unpickler_Read(self, st, &codebytes, nbytes) < 0)
        return -1;
    code = calc_binint(codebytes, nbytes);
    if (code <= 0) {            /* note that 0 is forbidden */
        /* Corrupt or hostile pickle. */
        TyErr_SetString(st->UnpicklingError, "EXT specifies code <= 0");
        return -1;
    }

    /* Look for the code in the cache. */
    py_code = TyLong_FromLong(code);
    if (py_code == NULL)
        return -1;
    obj = TyDict_GetItemWithError(st->extension_cache, py_code);
    if (obj != NULL) {
        /* Bingo. */
        Ty_DECREF(py_code);
        PDATA_APPEND(self->stack, obj, -1);
        return 0;
    }
    if (TyErr_Occurred()) {
        Ty_DECREF(py_code);
        return -1;
    }

    /* Look up the (module_name, class_name) pair. */
    pair = TyDict_GetItemWithError(st->inverted_registry, py_code);
    if (pair == NULL) {
        Ty_DECREF(py_code);
        if (!TyErr_Occurred()) {
            TyErr_Format(TyExc_ValueError, "unregistered extension "
                         "code %ld", code);
        }
        return -1;
    }
    /* Since the extension registry is manipulable via Python code,
     * confirm that pair is really a 2-tuple of strings.
     */
    if (!TyTuple_Check(pair) || TyTuple_Size(pair) != 2) {
        goto error;
    }

    module_name = TyTuple_GET_ITEM(pair, 0);
    if (!TyUnicode_Check(module_name)) {
        goto error;
    }

    class_name = TyTuple_GET_ITEM(pair, 1);
    if (!TyUnicode_Check(class_name)) {
        goto error;
    }

    /* Load the object. */
    obj = find_class(self, module_name, class_name);
    if (obj == NULL) {
        Ty_DECREF(py_code);
        return -1;
    }
    /* Cache code -> obj. */
    code = TyDict_SetItem(st->extension_cache, py_code, obj);
    Ty_DECREF(py_code);
    if (code < 0) {
        Ty_DECREF(obj);
        return -1;
    }
    PDATA_PUSH(self->stack, obj, -1);
    return 0;

error:
    Ty_DECREF(py_code);
    TyErr_Format(TyExc_ValueError, "_inverted_registry[%ld] "
                 "isn't a 2-tuple of strings", code);
    return -1;
}

static int
load_put(PickleState *state, UnpicklerObject *self)
{
    TyObject *key, *value;
    Ty_ssize_t idx;
    Ty_ssize_t len;
    char *s = NULL;

    if ((len = _Unpickler_Readline(state, self, &s)) < 0)
        return -1;
    if (len < 2)
        return bad_readline(state);
    if (Ty_SIZE(self->stack) <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    value = self->stack->data[Ty_SIZE(self->stack) - 1];

    key = TyLong_FromString(s, NULL, 10);
    if (key == NULL)
        return -1;
    idx = TyLong_AsSsize_t(key);
    Ty_DECREF(key);
    if (idx < 0) {
        if (!TyErr_Occurred())
            TyErr_SetString(TyExc_ValueError,
                            "negative PUT argument");
        return -1;
    }

    return _Unpickler_MemoPut(self, idx, value);
}

static int
load_binput(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    Ty_ssize_t idx;
    char *s;

    if (_Unpickler_Read(self, state, &s, 1) < 0)
        return -1;

    if (Ty_SIZE(self->stack) <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    value = self->stack->data[Ty_SIZE(self->stack) - 1];

    idx = Ty_CHARMASK(s[0]);

    return _Unpickler_MemoPut(self, idx, value);
}

static int
load_long_binput(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;
    Ty_ssize_t idx;
    char *s;

    if (_Unpickler_Read(self, state, &s, 4) < 0)
        return -1;

    if (Ty_SIZE(self->stack) <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    value = self->stack->data[Ty_SIZE(self->stack) - 1];

    idx = calc_binsize(s, 4);
    if (idx < 0) {
        TyErr_SetString(TyExc_ValueError,
                        "negative LONG_BINPUT argument");
        return -1;
    }

    return _Unpickler_MemoPut(self, idx, value);
}

static int
load_memoize(PickleState *state, UnpicklerObject *self)
{
    TyObject *value;

    if (Ty_SIZE(self->stack) <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    value = self->stack->data[Ty_SIZE(self->stack) - 1];

    return _Unpickler_MemoPut(self, self->memo_len, value);
}

static int
do_append(PickleState *state, UnpicklerObject *self, Ty_ssize_t x)
{
    TyObject *value;
    TyObject *slice;
    TyObject *list;
    TyObject *result;
    Ty_ssize_t len, i;

    len = Ty_SIZE(self->stack);
    if (x > len || x <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    if (len == x)  /* nothing to do */
        return 0;

    list = self->stack->data[x - 1];

    if (TyList_CheckExact(list)) {
        Ty_ssize_t list_len;
        int ret;

        slice = Pdata_poplist(self->stack, x);
        if (!slice)
            return -1;
        list_len = TyList_GET_SIZE(list);
        ret = TyList_SetSlice(list, list_len, list_len, slice);
        Ty_DECREF(slice);
        return ret;
    }
    else {
        TyObject *extend_func;

        if (PyObject_GetOptionalAttr(list, &_Ty_ID(extend), &extend_func) < 0) {
            return -1;
        }
        if (extend_func != NULL) {
            slice = Pdata_poplist(self->stack, x);
            if (!slice) {
                Ty_DECREF(extend_func);
                return -1;
            }
            result = _Pickle_FastCall(extend_func, slice);
            Ty_DECREF(extend_func);
            if (result == NULL)
                return -1;
            Ty_DECREF(result);
        }
        else {
            TyObject *append_func;

            /* Even if the PEP 307 requires extend() and append() methods,
               fall back on append() if the object has no extend() method
               for backward compatibility. */
            append_func = PyObject_GetAttr(list, &_Ty_ID(append));
            if (append_func == NULL)
                return -1;
            for (i = x; i < len; i++) {
                value = self->stack->data[i];
                result = _Pickle_FastCall(append_func, value);
                if (result == NULL) {
                    Pdata_clear(self->stack, i + 1);
                    Ty_SET_SIZE(self->stack, x);
                    Ty_DECREF(append_func);
                    return -1;
                }
                Ty_DECREF(result);
            }
            Ty_SET_SIZE(self->stack, x);
            Ty_DECREF(append_func);
        }
    }

    return 0;
}

static int
load_append(PickleState *state, UnpicklerObject *self)
{
    if (Ty_SIZE(self->stack) - 1 <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    return do_append(state, self, Ty_SIZE(self->stack) - 1);
}

static int
load_appends(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t i = marker(state, self);
    if (i < 0)
        return -1;
    return do_append(state, self, i);
}

static int
do_setitems(PickleState *st, UnpicklerObject *self, Ty_ssize_t x)
{
    TyObject *value, *key;
    TyObject *dict;
    Ty_ssize_t len, i;
    int status = 0;

    len = Ty_SIZE(self->stack);
    if (x > len || x <= self->stack->fence)
        return Pdata_stack_underflow(st, self->stack);
    if (len == x)  /* nothing to do */
        return 0;
    if ((len - x) % 2 != 0) {
        /* Corrupt or hostile pickle -- we never write one like this. */
        TyErr_SetString(st->UnpicklingError,
                        "odd number of items for SETITEMS");
        return -1;
    }

    /* Here, dict does not actually need to be a PyDict; it could be anything
       that supports the __setitem__ attribute. */
    dict = self->stack->data[x - 1];

    for (i = x + 1; i < len; i += 2) {
        key = self->stack->data[i - 1];
        value = self->stack->data[i];
        if (PyObject_SetItem(dict, key, value) < 0) {
            status = -1;
            break;
        }
    }

    Pdata_clear(self->stack, x);
    return status;
}

static int
load_setitem(PickleState *state, UnpicklerObject *self)
{
    return do_setitems(state, self, Ty_SIZE(self->stack) - 2);
}

static int
load_setitems(PickleState *state, UnpicklerObject *self)
{
    Ty_ssize_t i = marker(state, self);
    if (i < 0)
        return -1;
    return do_setitems(state, self, i);
}

static int
load_additems(PickleState *state, UnpicklerObject *self)
{
    TyObject *set;
    Ty_ssize_t mark, len, i;

    mark =  marker(state, self);
    if (mark < 0)
        return -1;
    len = Ty_SIZE(self->stack);
    if (mark > len || mark <= self->stack->fence)
        return Pdata_stack_underflow(state, self->stack);
    if (len == mark)  /* nothing to do */
        return 0;

    set = self->stack->data[mark - 1];

    if (TySet_Check(set)) {
        TyObject *items;
        int status;

        items = Pdata_poptuple(state, self->stack, mark);
        if (items == NULL)
            return -1;

        status = _TySet_Update(set, items);
        Ty_DECREF(items);
        return status;
    }
    else {
        TyObject *add_func;

        add_func = PyObject_GetAttr(set, &_Ty_ID(add));
        if (add_func == NULL)
            return -1;
        for (i = mark; i < len; i++) {
            TyObject *result;
            TyObject *item;

            item = self->stack->data[i];
            result = _Pickle_FastCall(add_func, item);
            if (result == NULL) {
                Pdata_clear(self->stack, i + 1);
                Ty_SET_SIZE(self->stack, mark);
                Ty_DECREF(add_func);
                return -1;
            }
            Ty_DECREF(result);
        }
        Ty_SET_SIZE(self->stack, mark);
        Ty_DECREF(add_func);
    }

    return 0;
}

static int
load_build(PickleState *st, UnpicklerObject *self)
{
    TyObject *inst, *slotstate;
    TyObject *setstate;
    int status = 0;

    /* Stack is ... instance, state.  We want to leave instance at
     * the stack top, possibly mutated via instance.__setstate__(state).
     */
    if (Ty_SIZE(self->stack) - 2 < self->stack->fence)
        return Pdata_stack_underflow(st, self->stack);

    TyObject *state;
    PDATA_POP(st, self->stack, state);
    if (state == NULL)
        return -1;

    inst = self->stack->data[Ty_SIZE(self->stack) - 1];

    if (PyObject_GetOptionalAttr(inst, &_Ty_ID(__setstate__), &setstate) < 0) {
        Ty_DECREF(state);
        return -1;
    }
    if (setstate != NULL) {
        TyObject *result;

        /* The explicit __setstate__ is responsible for everything. */
        result = _Pickle_FastCall(setstate, state);
        Ty_DECREF(setstate);
        if (result == NULL)
            return -1;
        Ty_DECREF(result);
        return 0;
    }

    /* A default __setstate__.  First see whether state embeds a
     * slot state dict too (a proto 2 addition).
     */
    if (TyTuple_Check(state) && TyTuple_GET_SIZE(state) == 2) {
        TyObject *tmp = state;

        state = TyTuple_GET_ITEM(tmp, 0);
        slotstate = TyTuple_GET_ITEM(tmp, 1);
        Ty_INCREF(state);
        Ty_INCREF(slotstate);
        Ty_DECREF(tmp);
    }
    else
        slotstate = NULL;

    /* Set inst.__dict__ from the state dict (if any). */
    if (state != Ty_None) {
        TyObject *dict;
        TyObject *d_key, *d_value;
        Ty_ssize_t i;

        if (!TyDict_Check(state)) {
            TyErr_SetString(st->UnpicklingError, "state is not a dictionary");
            goto error;
        }
        dict = PyObject_GetAttr(inst, &_Ty_ID(__dict__));
        if (dict == NULL)
            goto error;

        i = 0;
        while (TyDict_Next(state, &i, &d_key, &d_value)) {
            /* normally the keys for instance attributes are
               interned.  we should try to do that here. */
            Ty_INCREF(d_key);
            if (TyUnicode_CheckExact(d_key)) {
                TyInterpreterState *interp = _TyInterpreterState_GET();
                _TyUnicode_InternMortal(interp, &d_key);
            }
            if (PyObject_SetItem(dict, d_key, d_value) < 0) {
                Ty_DECREF(d_key);
                Ty_DECREF(dict);
                goto error;
            }
            Ty_DECREF(d_key);
        }
        Ty_DECREF(dict);
    }

    /* Also set instance attributes from the slotstate dict (if any). */
    if (slotstate != NULL) {
        TyObject *d_key, *d_value;
        Ty_ssize_t i;

        if (!TyDict_Check(slotstate)) {
            TyErr_SetString(st->UnpicklingError,
                            "slot state is not a dictionary");
            goto error;
        }
        i = 0;
        while (TyDict_Next(slotstate, &i, &d_key, &d_value)) {
            if (PyObject_SetAttr(inst, d_key, d_value) < 0)
                goto error;
        }
    }

    if (0) {
  error:
        status = -1;
    }

    Ty_DECREF(state);
    Ty_XDECREF(slotstate);
    return status;
}

static int
load_mark(PickleState *state, UnpicklerObject *self)
{

    /* Note that we split the (pickle.py) stack into two stacks, an
     * object stack and a mark stack. Here we push a mark onto the
     * mark stack.
     */

    if (self->num_marks >= self->marks_size) {
        size_t alloc = ((size_t)self->num_marks << 1) + 20;
        Ty_ssize_t *marks_new = self->marks;
        TyMem_RESIZE(marks_new, Ty_ssize_t, alloc);
        if (marks_new == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        self->marks = marks_new;
        self->marks_size = (Ty_ssize_t)alloc;
    }

    self->stack->mark_set = 1;
    self->marks[self->num_marks++] = self->stack->fence = Ty_SIZE(self->stack);

    return 0;
}

static int
load_reduce(PickleState *state, UnpicklerObject *self)
{
    TyObject *callable = NULL;
    TyObject *argtup = NULL;
    TyObject *obj = NULL;

    PDATA_POP(state, self->stack, argtup);
    if (argtup == NULL)
        return -1;
    PDATA_POP(state, self->stack, callable);
    if (callable) {
        obj = PyObject_CallObject(callable, argtup);
        Ty_DECREF(callable);
    }
    Ty_DECREF(argtup);

    if (obj == NULL)
        return -1;

    PDATA_PUSH(self->stack, obj, -1);
    return 0;
}

/* Just raises an error if we don't know the protocol specified.  PROTO
 * is the first opcode for protocols >= 2.
 */
static int
load_proto(PickleState *state, UnpicklerObject *self)
{
    char *s;
    int i;

    if (_Unpickler_Read(self, state, &s, 1) < 0)
        return -1;

    i = (unsigned char)s[0];
    if (i <= HIGHEST_PROTOCOL) {
        self->proto = i;
        return 0;
    }

    TyErr_Format(TyExc_ValueError, "unsupported pickle protocol: %d", i);
    return -1;
}

static int
load_frame(PickleState *state, UnpicklerObject *self)
{
    char *s;
    Ty_ssize_t frame_len;

    if (_Unpickler_Read(self, state, &s, 8) < 0)
        return -1;

    frame_len = calc_binsize(s, 8);
    if (frame_len < 0) {
        TyErr_Format(TyExc_OverflowError,
                     "FRAME length exceeds system's maximum of %zd bytes",
                     PY_SSIZE_T_MAX);
        return -1;
    }

    if (_Unpickler_Read(self, state, &s, frame_len) < 0)
        return -1;

    /* Rewind to start of frame */
    self->next_read_idx -= frame_len;
    return 0;
}

static TyObject *
load(PickleState *st, UnpicklerObject *self)
{
    TyObject *value = NULL;
    TyObject *tmp;
    char *s = NULL;

    self->num_marks = 0;
    self->stack->mark_set = 0;
    self->stack->fence = 0;
    self->proto = 0;
    if (Ty_SIZE(self->stack))
        Pdata_clear(self->stack, 0);

    /* Cache the persistent_load method. */
    tmp = PyObject_GetAttr((TyObject *)self, &_Ty_ID(persistent_load));
    if (tmp == NULL) {
        goto error;
    }
    Ty_XSETREF(self->persistent_load, tmp);

    /* Convenient macros for the dispatch while-switch loop just below. */
#define OP(opcode, load_func) \
    case opcode: if (load_func(st, self) < 0) break; continue;

#define OP_ARG(opcode, load_func, arg) \
    case opcode: if (load_func(st, self, (arg)) < 0) break; continue;

    while (1) {
        if (_Unpickler_Read(self, st, &s, 1) < 0) {
            if (TyErr_ExceptionMatches(st->UnpicklingError)) {
                TyErr_Format(TyExc_EOFError, "Ran out of input");
            }
            goto error;
        }

        switch ((enum opcode)s[0]) {
        OP(NONE, load_none)
        OP(BININT, load_binint)
        OP(BININT1, load_binint1)
        OP(BININT2, load_binint2)
        OP(INT, load_int)
        OP(LONG, load_long)
        OP_ARG(LONG1, load_counted_long, 1)
        OP_ARG(LONG4, load_counted_long, 4)
        OP(FLOAT, load_float)
        OP(BINFLOAT, load_binfloat)
        OP_ARG(SHORT_BINBYTES, load_counted_binbytes, 1)
        OP_ARG(BINBYTES, load_counted_binbytes, 4)
        OP_ARG(BINBYTES8, load_counted_binbytes, 8)
        OP(BYTEARRAY8, load_counted_bytearray)
        OP(NEXT_BUFFER, load_next_buffer)
        OP(READONLY_BUFFER, load_readonly_buffer)
        OP_ARG(SHORT_BINSTRING, load_counted_binstring, 1)
        OP_ARG(BINSTRING, load_counted_binstring, 4)
        OP(STRING, load_string)
        OP(UNICODE, load_unicode)
        OP_ARG(SHORT_BINUNICODE, load_counted_binunicode, 1)
        OP_ARG(BINUNICODE, load_counted_binunicode, 4)
        OP_ARG(BINUNICODE8, load_counted_binunicode, 8)
        OP_ARG(EMPTY_TUPLE, load_counted_tuple, 0)
        OP_ARG(TUPLE1, load_counted_tuple, 1)
        OP_ARG(TUPLE2, load_counted_tuple, 2)
        OP_ARG(TUPLE3, load_counted_tuple, 3)
        OP(TUPLE, load_tuple)
        OP(EMPTY_LIST, load_empty_list)
        OP(LIST, load_list)
        OP(EMPTY_DICT, load_empty_dict)
        OP(DICT, load_dict)
        OP(EMPTY_SET, load_empty_set)
        OP(ADDITEMS, load_additems)
        OP(FROZENSET, load_frozenset)
        OP(OBJ, load_obj)
        OP(INST, load_inst)
        OP_ARG(NEWOBJ, load_newobj, 0)
        OP_ARG(NEWOBJ_EX, load_newobj, 1)
        OP(GLOBAL, load_global)
        OP(STACK_GLOBAL, load_stack_global)
        OP(APPEND, load_append)
        OP(APPENDS, load_appends)
        OP(BUILD, load_build)
        OP(DUP, load_dup)
        OP(BINGET, load_binget)
        OP(LONG_BINGET, load_long_binget)
        OP(GET, load_get)
        OP(MARK, load_mark)
        OP(BINPUT, load_binput)
        OP(LONG_BINPUT, load_long_binput)
        OP(PUT, load_put)
        OP(MEMOIZE, load_memoize)
        OP(POP, load_pop)
        OP(POP_MARK, load_pop_mark)
        OP(SETITEM, load_setitem)
        OP(SETITEMS, load_setitems)
        OP(PERSID, load_persid)
        OP(BINPERSID, load_binpersid)
        OP(REDUCE, load_reduce)
        OP(PROTO, load_proto)
        OP(FRAME, load_frame)
        OP_ARG(EXT1, load_extension, 1)
        OP_ARG(EXT2, load_extension, 2)
        OP_ARG(EXT4, load_extension, 4)
        OP_ARG(NEWTRUE, load_bool, Ty_True)
        OP_ARG(NEWFALSE, load_bool, Ty_False)

        case STOP:
            break;

        default:
            {
                unsigned char c = (unsigned char) *s;
                if (0x20 <= c && c <= 0x7e && c != '\'' && c != '\\') {
                    TyErr_Format(st->UnpicklingError,
                                 "invalid load key, '%c'.", c);
                }
                else {
                    TyErr_Format(st->UnpicklingError,
                                 "invalid load key, '\\x%02x'.", c);
                }
                goto error;
            }
        }

        break;                  /* and we are done! */
    }

    if (TyErr_Occurred()) {
        goto error;
    }

    if (_Unpickler_SkipConsumed(self) < 0)
        goto error;

    Ty_CLEAR(self->persistent_load);
    PDATA_POP(st, self->stack, value);
    return value;

error:
    Ty_CLEAR(self->persistent_load);
    return NULL;
}

/*[clinic input]

_pickle.Unpickler.persistent_load

    cls: defining_class
    pid: object
    /

[clinic start generated code]*/

static TyObject *
_pickle_Unpickler_persistent_load_impl(UnpicklerObject *self,
                                       TyTypeObject *cls, TyObject *pid)
/*[clinic end generated code: output=9f4706f1330cb14d input=2f9554fae051276e]*/
{
    PickleState *st = _Pickle_GetStateByClass(cls);
    TyErr_SetString(st->UnpicklingError,
                    "A load persistent id instruction was encountered, "
                    "but no persistent_load function was specified.");
    return NULL;
}

/*[clinic input]

_pickle.Unpickler.load

    cls: defining_class

Load a pickle.

Read a pickled object representation from the open file object given
in the constructor, and return the reconstituted object hierarchy
specified therein.
[clinic start generated code]*/

static TyObject *
_pickle_Unpickler_load_impl(UnpicklerObject *self, TyTypeObject *cls)
/*[clinic end generated code: output=cc88168f608e3007 input=f5d2f87e61d5f07f]*/
{
    UnpicklerObject *unpickler = (UnpicklerObject*)self;

    PickleState *st = _Pickle_GetStateByClass(cls);

    /* Check whether the Unpickler was initialized correctly. This prevents
       segfaulting if a subclass overridden __init__ with a function that does
       not call Unpickler.__init__(). Here, we simply ensure that self->read
       is not NULL. */
    if (unpickler->read == NULL) {
        TyErr_Format(st->UnpicklingError,
                     "Unpickler.__init__() was not called by %s.__init__()",
                     Ty_TYPE(unpickler)->tp_name);
        return NULL;
    }

    return load(st, unpickler);
}

/* The name of find_class() is misleading. In newer pickle protocols, this
   function is used for loading any global (i.e., functions), not just
   classes. The name is kept only for backward compatibility. */

/*[clinic input]

_pickle.Unpickler.find_class

  cls: defining_class
  module_name: object
  global_name: object
  /

Return an object from a specified module.

If necessary, the module will be imported. Subclasses may override
this method (e.g. to restrict unpickling of arbitrary classes and
functions).

This method is called whenever a class or a function object is
needed.  Both arguments passed are str objects.
[clinic start generated code]*/

static TyObject *
_pickle_Unpickler_find_class_impl(UnpicklerObject *self, TyTypeObject *cls,
                                  TyObject *module_name,
                                  TyObject *global_name)
/*[clinic end generated code: output=99577948abb0be81 input=9577745719219fc7]*/
{
    TyObject *global;
    TyObject *module;

    if (TySys_Audit("pickle.find_class", "OO",
                    module_name, global_name) < 0) {
        return NULL;
    }

    /* Try to map the old names used in Python 2.x to the new ones used in
       Python 3.x.  We do this only with old pickle protocols and when the
       user has not disabled the feature. */
    if (self->proto < 3 && self->fix_imports) {
        TyObject *key;
        TyObject *item;
        PickleState *st = _Pickle_GetStateByClass(cls);

        /* Check if the global (i.e., a function or a class) was renamed
           or moved to another module. */
        key = TyTuple_Pack(2, module_name, global_name);
        if (key == NULL)
            return NULL;
        item = TyDict_GetItemWithError(st->name_mapping_2to3, key);
        Ty_DECREF(key);
        if (item) {
            if (!TyTuple_Check(item) || TyTuple_GET_SIZE(item) != 2) {
                TyErr_Format(TyExc_RuntimeError,
                             "_compat_pickle.NAME_MAPPING values should be "
                             "2-tuples, not %.200s", Ty_TYPE(item)->tp_name);
                return NULL;
            }
            module_name = TyTuple_GET_ITEM(item, 0);
            global_name = TyTuple_GET_ITEM(item, 1);
            if (!TyUnicode_Check(module_name) ||
                !TyUnicode_Check(global_name)) {
                TyErr_Format(TyExc_RuntimeError,
                             "_compat_pickle.NAME_MAPPING values should be "
                             "pairs of str, not (%.200s, %.200s)",
                             Ty_TYPE(module_name)->tp_name,
                             Ty_TYPE(global_name)->tp_name);
                return NULL;
            }
        }
        else if (TyErr_Occurred()) {
            return NULL;
        }
        else {
            /* Check if the module was renamed. */
            item = TyDict_GetItemWithError(st->import_mapping_2to3, module_name);
            if (item) {
                if (!TyUnicode_Check(item)) {
                    TyErr_Format(TyExc_RuntimeError,
                                "_compat_pickle.IMPORT_MAPPING values should be "
                                "strings, not %.200s", Ty_TYPE(item)->tp_name);
                    return NULL;
                }
                module_name = item;
            }
            else if (TyErr_Occurred()) {
                return NULL;
            }
        }
    }

    /*
     * we don't use TyImport_GetModule here, because it can return partially-
     * initialised modules, which then cause the getattribute to fail.
     */
    module = TyImport_Import(module_name);
    if (module == NULL) {
        return NULL;
    }
    if (self->proto >= 4) {
        TyObject *dotted_path = get_dotted_path(global_name);
        if (dotted_path == NULL) {
            Ty_DECREF(module);
            return NULL;
        }
        global = getattribute(module, dotted_path, 1);
        assert(global != NULL || TyErr_Occurred());
        if (global == NULL && TyList_GET_SIZE(dotted_path) > 1) {
            TyObject *exc = TyErr_GetRaisedException();
            TyErr_Format(TyExc_AttributeError,
                         "Can't resolve path %R on module %R",
                         global_name, module_name);
            _TyErr_ChainExceptions1(exc);
        }
        Ty_DECREF(dotted_path);
    }
    else {
        global = PyObject_GetAttr(module, global_name);
    }
    Ty_DECREF(module);
    return global;
}

/*[clinic input]

_pickle.Unpickler.__sizeof__ -> size_t

Returns size in memory, in bytes.
[clinic start generated code]*/

static size_t
_pickle_Unpickler___sizeof___impl(UnpicklerObject *self)
/*[clinic end generated code: output=4648d84c228196df input=27180b2b6b524012]*/
{
    size_t res = _TyObject_SIZE(Ty_TYPE(self));
    if (self->memo != NULL)
        res += self->memo_size * sizeof(TyObject *);
    if (self->marks != NULL)
        res += (size_t)self->marks_size * sizeof(Ty_ssize_t);
    if (self->input_line != NULL)
        res += strlen(self->input_line) + 1;
    if (self->encoding != NULL)
        res += strlen(self->encoding) + 1;
    if (self->errors != NULL)
        res += strlen(self->errors) + 1;
    return res;
}

static struct TyMethodDef Unpickler_methods[] = {
    _PICKLE_UNPICKLER_PERSISTENT_LOAD_METHODDEF
    _PICKLE_UNPICKLER_LOAD_METHODDEF
    _PICKLE_UNPICKLER_FIND_CLASS_METHODDEF
    _PICKLE_UNPICKLER___SIZEOF___METHODDEF
    {NULL, NULL}                /* sentinel */
};

static int
Unpickler_clear(TyObject *op)
{
    UnpicklerObject *self = UnpicklerObject_CAST(op);
    Ty_CLEAR(self->readline);
    Ty_CLEAR(self->readinto);
    Ty_CLEAR(self->read);
    Ty_CLEAR(self->peek);
    Ty_CLEAR(self->stack);
    Ty_CLEAR(self->persistent_load);
    Ty_CLEAR(self->persistent_load_attr);
    Ty_CLEAR(self->buffers);
    if (self->buffer.buf != NULL) {
        PyBuffer_Release(&self->buffer);
        self->buffer.buf = NULL;
    }

    _Unpickler_MemoCleanup(self);
    TyMem_Free(self->marks);
    self->marks = NULL;
    TyMem_Free(self->input_line);
    self->input_line = NULL;
    TyMem_Free(self->encoding);
    self->encoding = NULL;
    TyMem_Free(self->errors);
    self->errors = NULL;

    return 0;
}

static void
Unpickler_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)Unpickler_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
Unpickler_traverse(TyObject *op, visitproc visit, void *arg)
{
    UnpicklerObject *self = UnpicklerObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->readline);
    Ty_VISIT(self->readinto);
    Ty_VISIT(self->read);
    Ty_VISIT(self->peek);
    Ty_VISIT(self->stack);
    Ty_VISIT(self->persistent_load);
    Ty_VISIT(self->persistent_load_attr);
    Ty_VISIT(self->buffers);
    TyObject **memo = self->memo;
    if (memo) {
        Ty_ssize_t i = self->memo_size;
        while (--i >= 0) {
            Ty_VISIT(memo[i]);
        }
    }
    return 0;
}

/*[clinic input]

_pickle.Unpickler.__init__

  file: object
  *
  fix_imports: bool = True
  encoding: str = 'ASCII'
  errors: str = 'strict'
  buffers: object(c_default="NULL") = ()

This takes a binary file for reading a pickle data stream.

The protocol version of the pickle is detected automatically, so no
protocol argument is needed.  Bytes past the pickled object's
representation are ignored.

The argument *file* must have two methods, a read() method that takes
an integer argument, and a readline() method that requires no
arguments.  Both methods should return bytes.  Thus *file* can be a
binary file object opened for reading, an io.BytesIO object, or any
other custom object that meets this interface.

Optional keyword arguments are *fix_imports*, *encoding* and *errors*,
which are used to control compatibility support for pickle stream
generated by Python 2.  If *fix_imports* is True, pickle will try to
map the old Python 2 names to the new names used in Python 3.  The
*encoding* and *errors* tell pickle how to decode 8-bit string
instances pickled by Python 2; these default to 'ASCII' and 'strict',
respectively.  The *encoding* can be 'bytes' to read these 8-bit
string instances as bytes objects.
[clinic start generated code]*/

static int
_pickle_Unpickler___init___impl(UnpicklerObject *self, TyObject *file,
                                int fix_imports, const char *encoding,
                                const char *errors, TyObject *buffers)
/*[clinic end generated code: output=09f0192649ea3f85 input=ca4c1faea9553121]*/
{
    /* In case of multiple __init__() calls, clear previous content. */
    if (self->read != NULL)
        (void)Unpickler_clear((TyObject *)self);

    if (_Unpickler_SetInputStream(self, file) < 0)
        return -1;

    if (_Unpickler_SetInputEncoding(self, encoding, errors) < 0)
        return -1;

    if (_Unpickler_SetBuffers(self, buffers) < 0)
        return -1;

    self->fix_imports = fix_imports;

    TyTypeObject *tp = Ty_TYPE(self);
    PickleState *state = _Pickle_FindStateByType(tp);
    self->stack = (Pdata *)Pdata_New(state);
    if (self->stack == NULL)
        return -1;

    self->memo_size = 32;
    self->memo = _Unpickler_NewMemo(self->memo_size);
    if (self->memo == NULL)
        return -1;

    self->proto = 0;

    return 0;
}


/* Define a proxy object for the Unpickler's internal memo object. This is to
 * avoid breaking code like:
 *  unpickler.memo.clear()
 * and
 *  unpickler.memo = saved_memo
 * Is this a good idea? Not really, but we don't want to break code that uses
 * it. Note that we don't implement the entire mapping API here. This is
 * intentional, as these should be treated as black-box implementation details.
 *
 * We do, however, have to implement pickling/unpickling support because of
 * real-world code like cvs2svn.
 */

/*[clinic input]
_pickle.UnpicklerMemoProxy.clear

Remove all items from memo.
[clinic start generated code]*/

static TyObject *
_pickle_UnpicklerMemoProxy_clear_impl(UnpicklerMemoProxyObject *self)
/*[clinic end generated code: output=d20cd43f4ba1fb1f input=b1df7c52e7afd9bd]*/
{
    _Unpickler_MemoCleanup(self->unpickler);
    self->unpickler->memo = _Unpickler_NewMemo(self->unpickler->memo_size);
    if (self->unpickler->memo == NULL)
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
_pickle.UnpicklerMemoProxy.copy

Copy the memo to a new object.
[clinic start generated code]*/

static TyObject *
_pickle_UnpicklerMemoProxy_copy_impl(UnpicklerMemoProxyObject *self)
/*[clinic end generated code: output=e12af7e9bc1e4c77 input=97769247ce032c1d]*/
{
    size_t i;
    TyObject *new_memo = TyDict_New();
    if (new_memo == NULL)
        return NULL;

    for (i = 0; i < self->unpickler->memo_size; i++) {
        int status;
        TyObject *key, *value;

        value = self->unpickler->memo[i];
        if (value == NULL)
            continue;

        key = TyLong_FromSsize_t(i);
        if (key == NULL)
            goto error;
        status = TyDict_SetItem(new_memo, key, value);
        Ty_DECREF(key);
        if (status < 0)
            goto error;
    }
    return new_memo;

error:
    Ty_DECREF(new_memo);
    return NULL;
}

/*[clinic input]
_pickle.UnpicklerMemoProxy.__reduce__

Implement pickling support.
[clinic start generated code]*/

static TyObject *
_pickle_UnpicklerMemoProxy___reduce___impl(UnpicklerMemoProxyObject *self)
/*[clinic end generated code: output=6da34ac048d94cca input=6920862413407199]*/
{
    TyObject *reduce_value;
    TyObject *constructor_args;
    TyObject *contents = _pickle_UnpicklerMemoProxy_copy_impl(self);
    if (contents == NULL)
        return NULL;

    reduce_value = TyTuple_New(2);
    if (reduce_value == NULL) {
        Ty_DECREF(contents);
        return NULL;
    }
    constructor_args = TyTuple_New(1);
    if (constructor_args == NULL) {
        Ty_DECREF(contents);
        Ty_DECREF(reduce_value);
        return NULL;
    }
    TyTuple_SET_ITEM(constructor_args, 0, contents);
    TyTuple_SET_ITEM(reduce_value, 0, Ty_NewRef(&TyDict_Type));
    TyTuple_SET_ITEM(reduce_value, 1, constructor_args);
    return reduce_value;
}

static TyMethodDef unpicklerproxy_methods[] = {
    _PICKLE_UNPICKLERMEMOPROXY_CLEAR_METHODDEF
    _PICKLE_UNPICKLERMEMOPROXY_COPY_METHODDEF
    _PICKLE_UNPICKLERMEMOPROXY___REDUCE___METHODDEF
    {NULL, NULL}    /* sentinel */
};

static void
UnpicklerMemoProxy_dealloc(TyObject *op)
{
    UnpicklerMemoProxyObject *self = UnpicklerMemoProxyObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    Ty_CLEAR(self->unpickler);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
UnpicklerMemoProxy_traverse(TyObject *op, visitproc visit, void *arg)
{
    UnpicklerMemoProxyObject *self = UnpicklerMemoProxyObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->unpickler);
    return 0;
}

static int
UnpicklerMemoProxy_clear(TyObject *op)
{
    UnpicklerMemoProxyObject *self = UnpicklerMemoProxyObject_CAST(op);
    Ty_CLEAR(self->unpickler);
    return 0;
}

static TyType_Slot unpickler_memoproxy_slots[] = {
    {Ty_tp_dealloc, UnpicklerMemoProxy_dealloc},
    {Ty_tp_traverse, UnpicklerMemoProxy_traverse},
    {Ty_tp_clear, UnpicklerMemoProxy_clear},
    {Ty_tp_methods, unpicklerproxy_methods},
    {Ty_tp_hash, PyObject_HashNotImplemented},
    {0, NULL},
};

static TyType_Spec unpickler_memoproxy_spec = {
    .name = "_pickle.UnpicklerMemoProxy",
    .basicsize = sizeof(UnpicklerMemoProxyObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = unpickler_memoproxy_slots,
};

static TyObject *
UnpicklerMemoProxy_New(UnpicklerObject *unpickler)
{
    PickleState *state = _Pickle_FindStateByType(Ty_TYPE(unpickler));
    UnpicklerMemoProxyObject *self;
    self = PyObject_GC_New(UnpicklerMemoProxyObject,
                           state->UnpicklerMemoProxyType);
    if (self == NULL)
        return NULL;
    self->unpickler = (UnpicklerObject*)Ty_NewRef(unpickler);
    PyObject_GC_Track(self);
    return (TyObject *)self;
}

/*****************************************************************************/


static TyObject *
Unpickler_get_memo(TyObject *op, void *Py_UNUSED(closure))
{
    UnpicklerObject *self = UnpicklerObject_CAST(op);
    return UnpicklerMemoProxy_New(self);
}

static int
Unpickler_set_memo(TyObject *op, TyObject *obj, void *Py_UNUSED(closure))
{
    TyObject **new_memo;
    UnpicklerObject *self = UnpicklerObject_CAST(op);
    size_t new_memo_size = 0;

    if (obj == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "attribute deletion is not supported");
        return -1;
    }

    PickleState *state = _Pickle_FindStateByType(Ty_TYPE(self));
    if (Ty_IS_TYPE(obj, state->UnpicklerMemoProxyType)) {
        UnpicklerObject *unpickler = /* safe fast cast for 'obj' */
            ((UnpicklerMemoProxyObject *)obj)->unpickler;

        new_memo_size = unpickler->memo_size;
        new_memo = _Unpickler_NewMemo(new_memo_size);
        if (new_memo == NULL)
            return -1;

        for (size_t i = 0; i < new_memo_size; i++) {
            new_memo[i] = Ty_XNewRef(unpickler->memo[i]);
        }
    }
    else if (TyDict_Check(obj)) {
        Ty_ssize_t i = 0;
        TyObject *key, *value;

        new_memo_size = TyDict_GET_SIZE(obj);
        new_memo = _Unpickler_NewMemo(new_memo_size);
        if (new_memo == NULL)
            return -1;

        while (TyDict_Next(obj, &i, &key, &value)) {
            Ty_ssize_t idx;
            if (!TyLong_Check(key)) {
                TyErr_SetString(TyExc_TypeError,
                                "memo key must be integers");
                goto error;
            }
            idx = TyLong_AsSsize_t(key);
            if (idx == -1 && TyErr_Occurred())
                goto error;
            if (idx < 0) {
                TyErr_SetString(TyExc_ValueError,
                                "memo key must be positive integers.");
                goto error;
            }
            if (_Unpickler_MemoPut(self, idx, value) < 0)
                goto error;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "'memo' attribute must be an UnpicklerMemoProxy object "
                     "or dict, not %.200s", Ty_TYPE(obj)->tp_name);
        return -1;
    }

    _Unpickler_MemoCleanup(self);
    self->memo_size = new_memo_size;
    self->memo = new_memo;

    return 0;

  error:
    if (new_memo_size) {
        for (size_t i = new_memo_size - 1; i != SIZE_MAX; i--) {
            Ty_XDECREF(new_memo[i]);
        }
        TyMem_Free(new_memo);
    }
    return -1;
}

static TyObject *
Unpickler_getattr(TyObject *self, TyObject *name)
{
    UnpicklerObject *obj = UnpicklerObject_CAST(self);
    if (TyUnicode_Check(name)
        && TyUnicode_EqualToUTF8(name, "persistent_load")
        && obj->persistent_load_attr)
    {
        return Ty_NewRef(obj->persistent_load_attr);
    }

    return PyObject_GenericGetAttr(self, name);
}

static int
Unpickler_setattr(TyObject *self, TyObject *name, TyObject *value)
{
    if (TyUnicode_Check(name)
        && TyUnicode_EqualToUTF8(name, "persistent_load"))
    {
        UnpicklerObject *obj = UnpicklerObject_CAST(self);
        Ty_XINCREF(value);
        Ty_XSETREF(obj->persistent_load_attr, value);
        return 0;
    }

    return PyObject_GenericSetAttr(self, name, value);
}

static TyGetSetDef Unpickler_getsets[] = {
    {"memo", Unpickler_get_memo, Unpickler_set_memo},
    {NULL}
};

static TyType_Slot unpickler_type_slots[] = {
    {Ty_tp_dealloc, Unpickler_dealloc},
    {Ty_tp_doc, (char *)_pickle_Unpickler___init____doc__},
    {Ty_tp_getattro, Unpickler_getattr},
    {Ty_tp_setattro, Unpickler_setattr},
    {Ty_tp_traverse, Unpickler_traverse},
    {Ty_tp_clear, Unpickler_clear},
    {Ty_tp_methods, Unpickler_methods},
    {Ty_tp_getset, Unpickler_getsets},
    {Ty_tp_init, _pickle_Unpickler___init__},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, TyType_GenericNew},
    {Ty_tp_free, PyObject_GC_Del},
    {0, NULL},
};

static TyType_Spec unpickler_type_spec = {
    .name = "_pickle.Unpickler",
    .basicsize = sizeof(UnpicklerObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = unpickler_type_slots,
};

/*[clinic input]

_pickle.dump

  obj: object
  file: object
  protocol: object = None
  *
  fix_imports: bool = True
  buffer_callback: object = None

Write a pickled representation of obj to the open file object file.

This is equivalent to ``Pickler(file, protocol).dump(obj)``, but may
be more efficient.

The optional *protocol* argument tells the pickler to use the given
protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default
protocol is 5. It was introduced in Python 3.8, and is incompatible
with previous versions.

Specifying a negative protocol version selects the highest protocol
version supported.  The higher the protocol used, the more recent the
version of Python needed to read the pickle produced.

The *file* argument must have a write() method that accepts a single
bytes argument.  It can thus be a file object opened for binary
writing, an io.BytesIO instance, or any other custom object that meets
this interface.

If *fix_imports* is True and protocol is less than 3, pickle will try
to map the new Python 3 names to the old module names used in Python
2, so that the pickle data stream is readable with Python 2.

If *buffer_callback* is None (the default), buffer views are serialized
into *file* as part of the pickle stream.  It is an error if
*buffer_callback* is not None and *protocol* is None or smaller than 5.

[clinic start generated code]*/

static TyObject *
_pickle_dump_impl(TyObject *module, TyObject *obj, TyObject *file,
                  TyObject *protocol, int fix_imports,
                  TyObject *buffer_callback)
/*[clinic end generated code: output=706186dba996490c input=b89ce8d0e911fd46]*/
{
    PickleState *state = _Pickle_GetState(module);
    PicklerObject *pickler = _Pickler_New(state);

    if (pickler == NULL)
        return NULL;

    if (_Pickler_SetProtocol(pickler, protocol, fix_imports) < 0)
        goto error;

    if (_Pickler_SetOutputStream(pickler, file) < 0)
        goto error;

    if (_Pickler_SetBufferCallback(pickler, buffer_callback) < 0)
        goto error;

    if (dump(state, pickler, obj) < 0)
        goto error;

    if (_Pickler_FlushToFile(pickler) < 0)
        goto error;

    Ty_DECREF(pickler);
    Py_RETURN_NONE;

  error:
    Ty_XDECREF(pickler);
    return NULL;
}

/*[clinic input]

_pickle.dumps

  obj: object
  protocol: object = None
  *
  fix_imports: bool = True
  buffer_callback: object = None

Return the pickled representation of the object as a bytes object.

The optional *protocol* argument tells the pickler to use the given
protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default
protocol is 5. It was introduced in Python 3.8, and is incompatible
with previous versions.

Specifying a negative protocol version selects the highest protocol
version supported.  The higher the protocol used, the more recent the
version of Python needed to read the pickle produced.

If *fix_imports* is True and *protocol* is less than 3, pickle will
try to map the new Python 3 names to the old module names used in
Python 2, so that the pickle data stream is readable with Python 2.

If *buffer_callback* is None (the default), buffer views are serialized
into *file* as part of the pickle stream.  It is an error if
*buffer_callback* is not None and *protocol* is None or smaller than 5.

[clinic start generated code]*/

static TyObject *
_pickle_dumps_impl(TyObject *module, TyObject *obj, TyObject *protocol,
                   int fix_imports, TyObject *buffer_callback)
/*[clinic end generated code: output=fbab0093a5580fdf input=139fc546886c63ac]*/
{
    TyObject *result;
    PickleState *state = _Pickle_GetState(module);
    PicklerObject *pickler = _Pickler_New(state);

    if (pickler == NULL)
        return NULL;

    if (_Pickler_SetProtocol(pickler, protocol, fix_imports) < 0)
        goto error;

    if (_Pickler_SetBufferCallback(pickler, buffer_callback) < 0)
        goto error;

    if (dump(state, pickler, obj) < 0)
        goto error;

    result = _Pickler_GetString(pickler);
    Ty_DECREF(pickler);
    return result;

  error:
    Ty_XDECREF(pickler);
    return NULL;
}

/*[clinic input]

_pickle.load

  file: object
  *
  fix_imports: bool = True
  encoding: str = 'ASCII'
  errors: str = 'strict'
  buffers: object(c_default="NULL") = ()

Read and return an object from the pickle data stored in a file.

This is equivalent to ``Unpickler(file).load()``, but may be more
efficient.

The protocol version of the pickle is detected automatically, so no
protocol argument is needed.  Bytes past the pickled object's
representation are ignored.

The argument *file* must have two methods, a read() method that takes
an integer argument, and a readline() method that requires no
arguments.  Both methods should return bytes.  Thus *file* can be a
binary file object opened for reading, an io.BytesIO object, or any
other custom object that meets this interface.

Optional keyword arguments are *fix_imports*, *encoding* and *errors*,
which are used to control compatibility support for pickle stream
generated by Python 2.  If *fix_imports* is True, pickle will try to
map the old Python 2 names to the new names used in Python 3.  The
*encoding* and *errors* tell pickle how to decode 8-bit string
instances pickled by Python 2; these default to 'ASCII' and 'strict',
respectively.  The *encoding* can be 'bytes' to read these 8-bit
string instances as bytes objects.
[clinic start generated code]*/

static TyObject *
_pickle_load_impl(TyObject *module, TyObject *file, int fix_imports,
                  const char *encoding, const char *errors,
                  TyObject *buffers)
/*[clinic end generated code: output=250452d141c23e76 input=46c7c31c92f4f371]*/
{
    TyObject *result;
    UnpicklerObject *unpickler = _Unpickler_New(module);

    if (unpickler == NULL)
        return NULL;

    if (_Unpickler_SetInputStream(unpickler, file) < 0)
        goto error;

    if (_Unpickler_SetInputEncoding(unpickler, encoding, errors) < 0)
        goto error;

    if (_Unpickler_SetBuffers(unpickler, buffers) < 0)
        goto error;

    unpickler->fix_imports = fix_imports;

    PickleState *state = _Pickle_GetState(module);
    result = load(state, unpickler);
    Ty_DECREF(unpickler);
    return result;

  error:
    Ty_XDECREF(unpickler);
    return NULL;
}

/*[clinic input]

_pickle.loads

  data: object
  /
  *
  fix_imports: bool = True
  encoding: str = 'ASCII'
  errors: str = 'strict'
  buffers: object(c_default="NULL") = ()

Read and return an object from the given pickle data.

The protocol version of the pickle is detected automatically, so no
protocol argument is needed.  Bytes past the pickled object's
representation are ignored.

Optional keyword arguments are *fix_imports*, *encoding* and *errors*,
which are used to control compatibility support for pickle stream
generated by Python 2.  If *fix_imports* is True, pickle will try to
map the old Python 2 names to the new names used in Python 3.  The
*encoding* and *errors* tell pickle how to decode 8-bit string
instances pickled by Python 2; these default to 'ASCII' and 'strict',
respectively.  The *encoding* can be 'bytes' to read these 8-bit
string instances as bytes objects.
[clinic start generated code]*/

static TyObject *
_pickle_loads_impl(TyObject *module, TyObject *data, int fix_imports,
                   const char *encoding, const char *errors,
                   TyObject *buffers)
/*[clinic end generated code: output=82ac1e6b588e6d02 input=b3615540d0535087]*/
{
    TyObject *result;
    UnpicklerObject *unpickler = _Unpickler_New(module);

    if (unpickler == NULL)
        return NULL;

    if (_Unpickler_SetStringInput(unpickler, data) < 0)
        goto error;

    if (_Unpickler_SetInputEncoding(unpickler, encoding, errors) < 0)
        goto error;

    if (_Unpickler_SetBuffers(unpickler, buffers) < 0)
        goto error;

    unpickler->fix_imports = fix_imports;

    PickleState *state = _Pickle_GetState(module);
    result = load(state, unpickler);
    Ty_DECREF(unpickler);
    return result;

  error:
    Ty_XDECREF(unpickler);
    return NULL;
}

static struct TyMethodDef pickle_methods[] = {
    _PICKLE_DUMP_METHODDEF
    _PICKLE_DUMPS_METHODDEF
    _PICKLE_LOAD_METHODDEF
    _PICKLE_LOADS_METHODDEF
    {NULL, NULL} /* sentinel */
};

static int
pickle_clear(TyObject *m)
{
    _Pickle_ClearState(_Pickle_GetState(m));
    return 0;
}

static void
pickle_free(void *m)
{
    _Pickle_ClearState(_Pickle_GetState((TyObject*)m));
}

static int
pickle_traverse(TyObject *m, visitproc visit, void *arg)
{
    PickleState *st = _Pickle_GetState(m);
    Ty_VISIT(st->PickleError);
    Ty_VISIT(st->PicklingError);
    Ty_VISIT(st->UnpicklingError);
    Ty_VISIT(st->dispatch_table);
    Ty_VISIT(st->extension_registry);
    Ty_VISIT(st->extension_cache);
    Ty_VISIT(st->inverted_registry);
    Ty_VISIT(st->name_mapping_2to3);
    Ty_VISIT(st->import_mapping_2to3);
    Ty_VISIT(st->name_mapping_3to2);
    Ty_VISIT(st->import_mapping_3to2);
    Ty_VISIT(st->codecs_encode);
    Ty_VISIT(st->getattr);
    Ty_VISIT(st->partial);
    Ty_VISIT(st->Pickler_Type);
    Ty_VISIT(st->Unpickler_Type);
    Ty_VISIT(st->Pdata_Type);
    Ty_VISIT(st->PicklerMemoProxyType);
    Ty_VISIT(st->UnpicklerMemoProxyType);
    return 0;
}

static int
_pickle_exec(TyObject *m)
{
    PickleState *st = _Pickle_GetState(m);

#define CREATE_TYPE(mod, type, spec)                                        \
    do {                                                                    \
        type = (TyTypeObject *)TyType_FromMetaclass(NULL, mod, spec, NULL); \
        if (type == NULL) {                                                 \
            return -1;                                                      \
        }                                                                   \
    } while (0)

    CREATE_TYPE(m, st->Pdata_Type, &pdata_spec);
    CREATE_TYPE(m, st->PicklerMemoProxyType, &memoproxy_spec);
    CREATE_TYPE(m, st->UnpicklerMemoProxyType, &unpickler_memoproxy_spec);
    CREATE_TYPE(m, st->Pickler_Type, &pickler_type_spec);
    CREATE_TYPE(m, st->Unpickler_Type, &unpickler_type_spec);

#undef CREATE_TYPE

    /* Add types */
    if (TyModule_AddType(m, &PyPickleBuffer_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, st->Pickler_Type) < 0) {
        return -1;
    }
    if (TyModule_AddType(m, st->Unpickler_Type) < 0) {
        return -1;
    }

    /* Initialize the exceptions. */
    st->PickleError = TyErr_NewException("_pickle.PickleError", NULL, NULL);
    if (st->PickleError == NULL)
        return -1;
    st->PicklingError = \
        TyErr_NewException("_pickle.PicklingError", st->PickleError, NULL);
    if (st->PicklingError == NULL)
        return -1;
    st->UnpicklingError = \
        TyErr_NewException("_pickle.UnpicklingError", st->PickleError, NULL);
    if (st->UnpicklingError == NULL)
        return -1;

    if (TyModule_AddObjectRef(m, "PickleError", st->PickleError) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "PicklingError", st->PicklingError) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "UnpicklingError", st->UnpicklingError) < 0) {
        return -1;
    }

    if (_Pickle_InitState(st) < 0)
        return -1;

    return 0;
}

static PyModuleDef_Slot pickle_slots[] = {
    {Ty_mod_exec, _pickle_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef _picklemodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_pickle",
    .m_doc = pickle_module_doc,
    .m_size = sizeof(PickleState),
    .m_methods = pickle_methods,
    .m_slots = pickle_slots,
    .m_traverse = pickle_traverse,
    .m_clear = pickle_clear,
    .m_free = pickle_free,
};

PyMODINIT_FUNC
PyInit__pickle(void)
{
    return PyModuleDef_Init(&_picklemodule);
}
