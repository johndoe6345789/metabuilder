#include "Python.h"
#include "pycore_critical_section.h"
#include "pycore_lock.h"
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_object.h"        // _TyObject_GET_WEAKREFS_LISTPTR()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_pystate.h"
#include "pycore_weakref.h"       // _TyWeakref_GET_REF()

#ifdef Ty_GIL_DISABLED
/*
 * Thread-safety for free-threaded builds
 * ======================================
 *
 * In free-threaded builds we need to protect mutable state of:
 *
 * - The weakref (wr_object, hash, wr_callback)
 * - The referenced object (its head-of-list pointer)
 * - The linked list of weakrefs
 *
 * For now we've chosen to address this in a straightforward way:
 *
 * - The weakref's hash is protected using the weakref's per-object lock.
 * - The other mutable is protected by a striped lock keyed on the referenced
 *   object's address.
 * - The striped lock must be locked using `_Ty_LOCK_DONT_DETACH` in order to
 *   support atomic deletion from WeakValueDictionaries. As a result, we must
 *   be careful not to perform any operations that could suspend while the
 *   lock is held.
 *
 * Since the world is stopped when the GC runs, it is free to clear weakrefs
 * without acquiring any locks.
 */

#endif

#define GET_WEAKREFS_LISTPTR(o) \
        ((PyWeakReference **) _TyObject_GET_WEAKREFS_LISTPTR(o))


Ty_ssize_t
_TyWeakref_GetWeakrefCount(TyObject *obj)
{
    if (!_TyType_SUPPORTS_WEAKREFS(Ty_TYPE(obj))) {
        return 0;
    }

    LOCK_WEAKREFS(obj);
    Ty_ssize_t count = 0;
    PyWeakReference *head = *GET_WEAKREFS_LISTPTR(obj);
    while (head != NULL) {
        ++count;
        head = head->wr_next;
    }
    UNLOCK_WEAKREFS(obj);
    return count;
}

static TyObject *weakref_vectorcall(TyObject *self, TyObject *const *args, size_t nargsf, TyObject *kwnames);

static void
init_weakref(PyWeakReference *self, TyObject *ob, TyObject *callback)
{
    self->hash = -1;
    self->wr_object = ob;
    self->wr_prev = NULL;
    self->wr_next = NULL;
    self->wr_callback = Ty_XNewRef(callback);
    self->vectorcall = weakref_vectorcall;
#ifdef Ty_GIL_DISABLED
    self->weakrefs_lock = &WEAKREF_LIST_LOCK(ob);
    _TyObject_SetMaybeWeakref(ob);
    _TyObject_SetMaybeWeakref((TyObject *)self);
#endif
}

// Clear the weakref and steal its callback into `callback`, if provided.
static void
clear_weakref_lock_held(PyWeakReference *self, TyObject **callback)
{
    if (self->wr_object != Ty_None) {
        PyWeakReference **list = GET_WEAKREFS_LISTPTR(self->wr_object);
        if (*list == self) {
            /* If 'self' is the end of the list (and thus self->wr_next ==
               NULL) then the weakref list itself (and thus the value of *list)
               will end up being set to NULL. */
            FT_ATOMIC_STORE_PTR(*list, self->wr_next);
        }
        FT_ATOMIC_STORE_PTR(self->wr_object, Ty_None);
        if (self->wr_prev != NULL) {
            self->wr_prev->wr_next = self->wr_next;
        }
        if (self->wr_next != NULL) {
            self->wr_next->wr_prev = self->wr_prev;
        }
        self->wr_prev = NULL;
        self->wr_next = NULL;
    }
    if (callback != NULL) {
        *callback = self->wr_callback;
        self->wr_callback = NULL;
    }
}

// Clear the weakref and its callback
static void
clear_weakref(TyObject *op)
{
    PyWeakReference *self = _TyWeakref_CAST(op);
    TyObject *callback = NULL;

    // self->wr_object may be Ty_None if the GC cleared the weakref, so lock
    // using the pointer in the weakref.
    LOCK_WEAKREFS_FOR_WR(self);
    clear_weakref_lock_held(self, &callback);
    UNLOCK_WEAKREFS_FOR_WR(self);
    Ty_XDECREF(callback);
}


/* Cyclic gc uses this to *just* clear the passed-in reference, leaving
 * the callback intact and uncalled.  It must be possible to call self's
 * tp_dealloc() after calling this, so self has to be left in a sane enough
 * state for that to work.  We expect tp_dealloc to decref the callback
 * then.  The reason for not letting clear_weakref() decref the callback
 * right now is that if the callback goes away, that may in turn trigger
 * another callback (if a weak reference to the callback exists) -- running
 * arbitrary Python code in the middle of gc is a disaster.  The convolution
 * here allows gc to delay triggering such callbacks until the world is in
 * a sane state again.
 */
void
_TyWeakref_ClearRef(PyWeakReference *self)
{
    assert(self != NULL);
    assert(PyWeakref_Check(self));
    clear_weakref_lock_held(self, NULL);
}

static void
weakref_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    clear_weakref(self);
    Ty_TYPE(self)->tp_free(self);
}


static int
gc_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyWeakReference *self = _TyWeakref_CAST(op);
    Ty_VISIT(self->wr_callback);
    return 0;
}


static int
gc_clear(TyObject *op)
{
    PyWeakReference *self = _TyWeakref_CAST(op);
    TyObject *callback;
    // The world is stopped during GC in free-threaded builds. It's safe to
    // call this without holding the lock.
    clear_weakref_lock_held(self, &callback);
    Ty_XDECREF(callback);
    return 0;
}


static TyObject *
weakref_vectorcall(TyObject *self, TyObject *const *args,
                   size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("weakref", kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("weakref", nargs, 0, 0)) {
        return NULL;
    }
    TyObject *obj = _TyWeakref_GET_REF(self);
    if (obj == NULL) {
        Py_RETURN_NONE;
    }
    return obj;
}

static Ty_hash_t
weakref_hash_lock_held(PyWeakReference *self)
{
    if (self->hash != -1)
        return self->hash;
    TyObject* obj = _TyWeakref_GET_REF((TyObject*)self);
    if (obj == NULL) {
        TyErr_SetString(TyExc_TypeError, "weak object has gone away");
        return -1;
    }
    self->hash = PyObject_Hash(obj);
    Ty_DECREF(obj);
    return self->hash;
}

static Ty_hash_t
weakref_hash(TyObject *op)
{
    PyWeakReference *self = _TyWeakref_CAST(op);
    Ty_hash_t hash;
    Ty_BEGIN_CRITICAL_SECTION(self);
    hash = weakref_hash_lock_held(self);
    Ty_END_CRITICAL_SECTION();
    return hash;
}

static TyObject *
weakref_repr(TyObject *self)
{
    TyObject* obj = _TyWeakref_GET_REF(self);
    if (obj == NULL) {
        return TyUnicode_FromFormat("<weakref at %p; dead>", self);
    }

    TyObject *name = _TyObject_LookupSpecial(obj, &_Ty_ID(__name__));
    TyObject *repr;
    if (name == NULL || !TyUnicode_Check(name)) {
        repr = TyUnicode_FromFormat(
            "<weakref at %p; to '%T' at %p>",
            self, obj, obj);
    }
    else {
        repr = TyUnicode_FromFormat(
            "<weakref at %p; to '%T' at %p (%U)>",
            self, obj, obj, name);
    }
    Ty_DECREF(obj);
    Ty_XDECREF(name);
    return repr;
}

/* Weak references only support equality, not ordering. Two weak references
   are equal if the underlying objects are equal. If the underlying object has
   gone away, they are equal if they are identical. */

static TyObject *
weakref_richcompare(TyObject* self, TyObject* other, int op)
{
    if ((op != Py_EQ && op != Py_NE) ||
        !PyWeakref_Check(self) ||
        !PyWeakref_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    TyObject* obj = _TyWeakref_GET_REF(self);
    TyObject* other_obj = _TyWeakref_GET_REF(other);
    if (obj == NULL || other_obj == NULL) {
        Ty_XDECREF(obj);
        Ty_XDECREF(other_obj);
        int res = (self == other);
        if (op == Py_NE)
            res = !res;
        if (res)
            Py_RETURN_TRUE;
        else
            Py_RETURN_FALSE;
    }
    TyObject* res = PyObject_RichCompare(obj, other_obj, op);
    Ty_DECREF(obj);
    Ty_DECREF(other_obj);
    return res;
}

/* Given the head of an object's list of weak references, extract the
 * two callback-less refs (ref and proxy).  Used to determine if the
 * shared references exist and to determine the back link for newly
 * inserted references.
 */
static void
get_basic_refs(PyWeakReference *head,
               PyWeakReference **refp, PyWeakReference **proxyp)
{
    *refp = NULL;
    *proxyp = NULL;

    if (head != NULL && head->wr_callback == NULL) {
        /* We need to be careful that the "basic refs" aren't
           subclasses of the main types.  That complicates this a
           little. */
        if (PyWeakref_CheckRefExact(head)) {
            *refp = head;
            head = head->wr_next;
        }
        if (head != NULL
            && head->wr_callback == NULL
            && PyWeakref_CheckProxy(head)) {
            *proxyp = head;
            /* head = head->wr_next; */
        }
    }
}

/* Insert 'newref' in the list after 'prev'.  Both must be non-NULL. */
static void
insert_after(PyWeakReference *newref, PyWeakReference *prev)
{
    newref->wr_prev = prev;
    newref->wr_next = prev->wr_next;
    if (prev->wr_next != NULL)
        prev->wr_next->wr_prev = newref;
    prev->wr_next = newref;
}

/* Insert 'newref' at the head of the list; 'list' points to the variable
 * that stores the head.
 */
static void
insert_head(PyWeakReference *newref, PyWeakReference **list)
{
    PyWeakReference *next = *list;

    newref->wr_prev = NULL;
    newref->wr_next = next;
    if (next != NULL)
        next->wr_prev = newref;
    *list = newref;
}

/* See if we can reuse either the basic ref or proxy in list instead of
 * creating a new weakref
 */
static PyWeakReference *
try_reuse_basic_ref(PyWeakReference *list, TyTypeObject *type,
                    TyObject *callback)
{
    if (callback != NULL) {
        return NULL;
    }

    PyWeakReference *ref, *proxy;
    get_basic_refs(list, &ref, &proxy);

    PyWeakReference *cand = NULL;
    if (type == &_TyWeakref_RefType) {
        cand = ref;
    }
    if ((type == &_TyWeakref_ProxyType) ||
        (type == &_TyWeakref_CallableProxyType)) {
        cand = proxy;
    }

    if (cand != NULL && _Ty_TryIncref((TyObject *) cand)) {
        return cand;
    }
    return NULL;
}

static int
is_basic_ref(PyWeakReference *ref)
{
    return (ref->wr_callback == NULL) && PyWeakref_CheckRefExact(ref);
}

static int
is_basic_proxy(PyWeakReference *proxy)
{
    return (proxy->wr_callback == NULL) && PyWeakref_CheckProxy(proxy);
}

static int
is_basic_ref_or_proxy(PyWeakReference *wr)
{
    return is_basic_ref(wr) || is_basic_proxy(wr);
}

/* Insert `newref` in the appropriate position in `list` */
static void
insert_weakref(PyWeakReference *newref, PyWeakReference **list)
{
    PyWeakReference *ref, *proxy;
    get_basic_refs(*list, &ref, &proxy);

    PyWeakReference *prev;
    if (is_basic_ref(newref)) {
        prev = NULL;
    }
    else if (is_basic_proxy(newref)) {
        prev = ref;
    }
    else {
        prev = (proxy == NULL) ? ref : proxy;
    }

    if (prev == NULL) {
        insert_head(newref, list);
    }
    else {
        insert_after(newref, prev);
    }
}

static PyWeakReference *
allocate_weakref(TyTypeObject *type, TyObject *obj, TyObject *callback)
{
    PyWeakReference *newref = (PyWeakReference *) type->tp_alloc(type, 0);
    if (newref == NULL) {
        return NULL;
    }
    init_weakref(newref, obj, callback);
    return newref;
}

static PyWeakReference *
get_or_create_weakref(TyTypeObject *type, TyObject *obj, TyObject *callback)
{
    if (!_TyType_SUPPORTS_WEAKREFS(Ty_TYPE(obj))) {
        TyErr_Format(TyExc_TypeError,
                     "cannot create weak reference to '%s' object",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }
    if (callback == Ty_None)
        callback = NULL;

    PyWeakReference **list = GET_WEAKREFS_LISTPTR(obj);
    if ((type == &_TyWeakref_RefType) ||
        (type == &_TyWeakref_ProxyType) ||
        (type == &_TyWeakref_CallableProxyType))
    {
        LOCK_WEAKREFS(obj);
        PyWeakReference *basic_ref = try_reuse_basic_ref(*list, type, callback);
        if (basic_ref != NULL) {
            UNLOCK_WEAKREFS(obj);
            return basic_ref;
        }
        PyWeakReference *newref = allocate_weakref(type, obj, callback);
        if (newref == NULL) {
            UNLOCK_WEAKREFS(obj);
            return NULL;
        }
        insert_weakref(newref, list);
        UNLOCK_WEAKREFS(obj);
        return newref;
    }
    else {
        // We may not be able to safely allocate inside the lock
        PyWeakReference *newref = allocate_weakref(type, obj, callback);
        if (newref == NULL) {
            return NULL;
        }
        LOCK_WEAKREFS(obj);
        insert_weakref(newref, list);
        UNLOCK_WEAKREFS(obj);
        return newref;
    }
}

static int
parse_weakref_init_args(const char *funcname, TyObject *args, TyObject *kwargs,
                        TyObject **obp, TyObject **callbackp)
{
    return TyArg_UnpackTuple(args, funcname, 1, 2, obp, callbackp);
}

static TyObject *
weakref___new__(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *ob, *callback = NULL;
    if (parse_weakref_init_args("__new__", args, kwargs, &ob, &callback)) {
        return (TyObject *)get_or_create_weakref(type, ob, callback);
    }
    return NULL;
}

static int
weakref___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    TyObject *tmp;

    if (!_TyArg_NoKeywords("ref", kwargs))
        return -1;

    if (parse_weakref_init_args("__init__", args, kwargs, &tmp, &tmp))
        return 0;
    else
        return -1;
}


static TyMemberDef weakref_members[] = {
    {"__callback__", _Ty_T_OBJECT, offsetof(PyWeakReference, wr_callback), Py_READONLY},
    {NULL} /* Sentinel */
};

static TyMethodDef weakref_methods[] = {
    {"__class_getitem__",    Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    {NULL} /* Sentinel */
};

TyTypeObject
_TyWeakref_RefType = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "weakref.ReferenceType",
    .tp_basicsize = sizeof(PyWeakReference),
    .tp_dealloc = weakref_dealloc,
    .tp_vectorcall_offset = offsetof(PyWeakReference, vectorcall),
    .tp_call = PyVectorcall_Call,
    .tp_repr = weakref_repr,
    .tp_hash = weakref_hash,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
                Ty_TPFLAGS_HAVE_VECTORCALL | Ty_TPFLAGS_BASETYPE,
    .tp_traverse = gc_traverse,
    .tp_clear = gc_clear,
    .tp_richcompare = weakref_richcompare,
    .tp_methods = weakref_methods,
    .tp_members = weakref_members,
    .tp_init = weakref___init__,
    .tp_alloc = TyType_GenericAlloc,
    .tp_new = weakref___new__,
    .tp_free = PyObject_GC_Del,
};


static bool
proxy_check_ref(TyObject *obj)
{
    if (obj == NULL) {
        TyErr_SetString(TyExc_ReferenceError,
                        "weakly-referenced object no longer exists");
        return false;
    }
    return true;
}


/* If a parameter is a proxy, check that it is still "live" and wrap it,
 * replacing the original value with the raw object.  Raises ReferenceError
 * if the param is a dead proxy.
 */
#define UNWRAP(o) \
        if (PyWeakref_CheckProxy(o)) { \
            o = _TyWeakref_GET_REF(o); \
            if (!proxy_check_ref(o)) { \
                return NULL; \
            } \
        } \
        else { \
            Ty_INCREF(o); \
        }

#define WRAP_UNARY(method, generic) \
    static TyObject * \
    method(TyObject *proxy) { \
        UNWRAP(proxy); \
        TyObject* res = generic(proxy); \
        Ty_DECREF(proxy); \
        return res; \
    }

#define WRAP_BINARY(method, generic) \
    static TyObject * \
    method(TyObject *x, TyObject *y) { \
        UNWRAP(x); \
        UNWRAP(y); \
        TyObject* res = generic(x, y); \
        Ty_DECREF(x); \
        Ty_DECREF(y); \
        return res; \
    }

/* Note that the third arg needs to be checked for NULL since the tp_call
 * slot can receive NULL for this arg.
 */
#define WRAP_TERNARY(method, generic) \
    static TyObject * \
    method(TyObject *proxy, TyObject *v, TyObject *w) { \
        UNWRAP(proxy); \
        UNWRAP(v); \
        if (w != NULL) { \
            UNWRAP(w); \
        } \
        TyObject* res = generic(proxy, v, w); \
        Ty_DECREF(proxy); \
        Ty_DECREF(v); \
        Ty_XDECREF(w); \
        return res; \
    }

#define WRAP_METHOD(method, SPECIAL) \
    static TyObject * \
    method(TyObject *proxy, TyObject *Py_UNUSED(ignored)) { \
            UNWRAP(proxy); \
            TyObject* res = PyObject_CallMethodNoArgs(proxy, &_Ty_ID(SPECIAL)); \
            Ty_DECREF(proxy); \
            return res; \
        }


/* direct slots */

WRAP_BINARY(proxy_getattr, PyObject_GetAttr)
WRAP_UNARY(proxy_str, PyObject_Str)
WRAP_TERNARY(proxy_call, PyObject_Call)

static TyObject *
proxy_repr(TyObject *proxy)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    TyObject *repr;
    if (obj != NULL) {
        repr = TyUnicode_FromFormat(
            "<weakproxy at %p; to '%T' at %p>",
            proxy, obj, obj);
        Ty_DECREF(obj);
    }
    else {
        repr = TyUnicode_FromFormat(
            "<weakproxy at %p; dead>",
            proxy);
    }
    return repr;
}


static int
proxy_setattr(TyObject *proxy, TyObject *name, TyObject *value)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return -1;
    }
    int res = PyObject_SetAttr(obj, name, value);
    Ty_DECREF(obj);
    return res;
}

static TyObject *
proxy_richcompare(TyObject *proxy, TyObject *v, int op)
{
    UNWRAP(proxy);
    UNWRAP(v);
    TyObject* res = PyObject_RichCompare(proxy, v, op);
    Ty_DECREF(proxy);
    Ty_DECREF(v);
    return res;
}

/* number slots */
WRAP_BINARY(proxy_add, PyNumber_Add)
WRAP_BINARY(proxy_sub, PyNumber_Subtract)
WRAP_BINARY(proxy_mul, PyNumber_Multiply)
WRAP_BINARY(proxy_floor_div, PyNumber_FloorDivide)
WRAP_BINARY(proxy_true_div, PyNumber_TrueDivide)
WRAP_BINARY(proxy_mod, PyNumber_Remainder)
WRAP_BINARY(proxy_divmod, PyNumber_Divmod)
WRAP_TERNARY(proxy_pow, PyNumber_Power)
WRAP_UNARY(proxy_neg, PyNumber_Negative)
WRAP_UNARY(proxy_pos, PyNumber_Positive)
WRAP_UNARY(proxy_abs, PyNumber_Absolute)
WRAP_UNARY(proxy_invert, PyNumber_Invert)
WRAP_BINARY(proxy_lshift, PyNumber_Lshift)
WRAP_BINARY(proxy_rshift, PyNumber_Rshift)
WRAP_BINARY(proxy_and, PyNumber_And)
WRAP_BINARY(proxy_xor, PyNumber_Xor)
WRAP_BINARY(proxy_or, PyNumber_Or)
WRAP_UNARY(proxy_int, PyNumber_Long)
WRAP_UNARY(proxy_float, PyNumber_Float)
WRAP_BINARY(proxy_iadd, PyNumber_InPlaceAdd)
WRAP_BINARY(proxy_isub, PyNumber_InPlaceSubtract)
WRAP_BINARY(proxy_imul, PyNumber_InPlaceMultiply)
WRAP_BINARY(proxy_ifloor_div, PyNumber_InPlaceFloorDivide)
WRAP_BINARY(proxy_itrue_div, PyNumber_InPlaceTrueDivide)
WRAP_BINARY(proxy_imod, PyNumber_InPlaceRemainder)
WRAP_TERNARY(proxy_ipow, PyNumber_InPlacePower)
WRAP_BINARY(proxy_ilshift, PyNumber_InPlaceLshift)
WRAP_BINARY(proxy_irshift, PyNumber_InPlaceRshift)
WRAP_BINARY(proxy_iand, PyNumber_InPlaceAnd)
WRAP_BINARY(proxy_ixor, PyNumber_InPlaceXor)
WRAP_BINARY(proxy_ior, PyNumber_InPlaceOr)
WRAP_UNARY(proxy_index, PyNumber_Index)
WRAP_BINARY(proxy_matmul, PyNumber_MatrixMultiply)
WRAP_BINARY(proxy_imatmul, PyNumber_InPlaceMatrixMultiply)

static int
proxy_bool(TyObject *proxy)
{
    TyObject *o = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(o)) {
        return -1;
    }
    int res = PyObject_IsTrue(o);
    Ty_DECREF(o);
    return res;
}

static void
proxy_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    clear_weakref(self);
    PyObject_GC_Del(self);
}

/* sequence slots */

static int
proxy_contains(TyObject *proxy, TyObject *value)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return -1;
    }
    int res = PySequence_Contains(obj, value);
    Ty_DECREF(obj);
    return res;
}

/* mapping slots */

static Ty_ssize_t
proxy_length(TyObject *proxy)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return -1;
    }
    Ty_ssize_t res = PyObject_Length(obj);
    Ty_DECREF(obj);
    return res;
}

WRAP_BINARY(proxy_getitem, PyObject_GetItem)

static int
proxy_setitem(TyObject *proxy, TyObject *key, TyObject *value)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return -1;
    }
    int res;
    if (value == NULL) {
        res = PyObject_DelItem(obj, key);
    } else {
        res = PyObject_SetItem(obj, key, value);
    }
    Ty_DECREF(obj);
    return res;
}

/* iterator slots */

static TyObject *
proxy_iter(TyObject *proxy)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return NULL;
    }
    TyObject* res = PyObject_GetIter(obj);
    Ty_DECREF(obj);
    return res;
}

static TyObject *
proxy_iternext(TyObject *proxy)
{
    TyObject *obj = _TyWeakref_GET_REF(proxy);
    if (!proxy_check_ref(obj)) {
        return NULL;
    }
    if (!TyIter_Check(obj)) {
        TyErr_Format(TyExc_TypeError,
            "Weakref proxy referenced a non-iterator '%.200s' object",
            Ty_TYPE(obj)->tp_name);
        Ty_DECREF(obj);
        return NULL;
    }
    TyObject* res = TyIter_Next(obj);
    Ty_DECREF(obj);
    return res;
}


WRAP_METHOD(proxy_bytes, __bytes__)
WRAP_METHOD(proxy_reversed, __reversed__)


static TyMethodDef proxy_methods[] = {
        {"__bytes__", proxy_bytes, METH_NOARGS},
        {"__reversed__", proxy_reversed, METH_NOARGS},
        {NULL, NULL}
};


static TyNumberMethods proxy_as_number = {
    proxy_add,              /*nb_add*/
    proxy_sub,              /*nb_subtract*/
    proxy_mul,              /*nb_multiply*/
    proxy_mod,              /*nb_remainder*/
    proxy_divmod,           /*nb_divmod*/
    proxy_pow,              /*nb_power*/
    proxy_neg,              /*nb_negative*/
    proxy_pos,              /*nb_positive*/
    proxy_abs,              /*nb_absolute*/
    proxy_bool,             /*nb_bool*/
    proxy_invert,           /*nb_invert*/
    proxy_lshift,           /*nb_lshift*/
    proxy_rshift,           /*nb_rshift*/
    proxy_and,              /*nb_and*/
    proxy_xor,              /*nb_xor*/
    proxy_or,               /*nb_or*/
    proxy_int,              /*nb_int*/
    0,                      /*nb_reserved*/
    proxy_float,            /*nb_float*/
    proxy_iadd,             /*nb_inplace_add*/
    proxy_isub,             /*nb_inplace_subtract*/
    proxy_imul,             /*nb_inplace_multiply*/
    proxy_imod,             /*nb_inplace_remainder*/
    proxy_ipow,             /*nb_inplace_power*/
    proxy_ilshift,          /*nb_inplace_lshift*/
    proxy_irshift,          /*nb_inplace_rshift*/
    proxy_iand,             /*nb_inplace_and*/
    proxy_ixor,             /*nb_inplace_xor*/
    proxy_ior,              /*nb_inplace_or*/
    proxy_floor_div,        /*nb_floor_divide*/
    proxy_true_div,         /*nb_true_divide*/
    proxy_ifloor_div,       /*nb_inplace_floor_divide*/
    proxy_itrue_div,        /*nb_inplace_true_divide*/
    proxy_index,            /*nb_index*/
    proxy_matmul,           /*nb_matrix_multiply*/
    proxy_imatmul,          /*nb_inplace_matrix_multiply*/
};

static PySequenceMethods proxy_as_sequence = {
    proxy_length,               /*sq_length*/
    0,                          /*sq_concat*/
    0,                          /*sq_repeat*/
    0,                          /*sq_item*/
    0,                          /*sq_slice*/
    0,                          /*sq_ass_item*/
    0,                          /*sq_ass_slice*/
    proxy_contains,             /* sq_contains */
};

static PyMappingMethods proxy_as_mapping = {
    proxy_length,                 /*mp_length*/
    proxy_getitem,                /*mp_subscript*/
    proxy_setitem,                /*mp_ass_subscript*/
};


TyTypeObject
_TyWeakref_ProxyType = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "weakref.ProxyType",
    sizeof(PyWeakReference),
    0,
    /* methods */
    proxy_dealloc,                      /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    proxy_repr,                         /* tp_repr */
    &proxy_as_number,                   /* tp_as_number */
    &proxy_as_sequence,                 /* tp_as_sequence */
    &proxy_as_mapping,                  /* tp_as_mapping */
// Notice that tp_hash is intentionally omitted as proxies are "mutable" (when the reference dies).
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    proxy_str,                          /* tp_str */
    proxy_getattr,                      /* tp_getattro */
    proxy_setattr,                      /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                  /* tp_doc */
    gc_traverse,                        /* tp_traverse */
    gc_clear,                           /* tp_clear */
    proxy_richcompare,                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    proxy_iter,                         /* tp_iter */
    proxy_iternext,                     /* tp_iternext */
    proxy_methods,                      /* tp_methods */
};


TyTypeObject
_TyWeakref_CallableProxyType = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "weakref.CallableProxyType",
    sizeof(PyWeakReference),
    0,
    /* methods */
    proxy_dealloc,                      /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    proxy_repr,                         /* tp_repr */
    &proxy_as_number,                   /* tp_as_number */
    &proxy_as_sequence,                 /* tp_as_sequence */
    &proxy_as_mapping,                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    proxy_call,                         /* tp_call */
    proxy_str,                          /* tp_str */
    proxy_getattr,                      /* tp_getattro */
    proxy_setattr,                      /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                  /* tp_doc */
    gc_traverse,                        /* tp_traverse */
    gc_clear,                           /* tp_clear */
    proxy_richcompare,                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    proxy_iter,                         /* tp_iter */
    proxy_iternext,                     /* tp_iternext */
};

TyObject *
PyWeakref_NewRef(TyObject *ob, TyObject *callback)
{
    return (TyObject *)get_or_create_weakref(&_TyWeakref_RefType, ob,
                                             callback);
}

TyObject *
PyWeakref_NewProxy(TyObject *ob, TyObject *callback)
{
    TyTypeObject *type = &_TyWeakref_ProxyType;
    if (PyCallable_Check(ob)) {
        type = &_TyWeakref_CallableProxyType;
    }
    return (TyObject *)get_or_create_weakref(type, ob, callback);
}

int
PyWeakref_IsDead(TyObject *ref)
{
    if (ref == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (!PyWeakref_Check(ref)) {
        TyErr_Format(TyExc_TypeError, "expected a weakref, got %T", ref);
        return -1;
    }
    return _TyWeakref_IS_DEAD(ref);
}

int
PyWeakref_GetRef(TyObject *ref, TyObject **pobj)
{
    if (ref == NULL) {
        *pobj = NULL;
        TyErr_BadInternalCall();
        return -1;
    }
    if (!PyWeakref_Check(ref)) {
        *pobj = NULL;
        TyErr_SetString(TyExc_TypeError, "expected a weakref");
        return -1;
    }
    *pobj = _TyWeakref_GET_REF(ref);
    return (*pobj != NULL);
}


TyObject *
PyWeakref_GetObject(TyObject *ref)
{
    if (ref == NULL || !PyWeakref_Check(ref)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    TyObject *obj = _TyWeakref_GET_REF(ref);
    if (obj == NULL) {
        return Ty_None;
    }
    Ty_DECREF(obj);
    return obj;  // borrowed reference
}

/* Note that there's an inlined copy-paste of handle_callback() in gcmodule.c's
 * handle_weakrefs().
 */
static void
handle_callback(PyWeakReference *ref, TyObject *callback)
{
    TyObject *cbresult = PyObject_CallOneArg(callback, (TyObject *)ref);

    if (cbresult == NULL) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "calling weakref callback %R", callback);
    }
    else {
        Ty_DECREF(cbresult);
    }
}

/* This function is called by the tp_dealloc handler to clear weak references.
 *
 * This iterates through the weak references for 'object' and calls callbacks
 * for those references which have one.  It returns when all callbacks have
 * been attempted.
 */
void
PyObject_ClearWeakRefs(TyObject *object)
{
    PyWeakReference **list;

    if (object == NULL
        || !_TyType_SUPPORTS_WEAKREFS(Ty_TYPE(object))
        || Ty_REFCNT(object) != 0)
    {
        TyErr_BadInternalCall();
        return;
    }

    list = GET_WEAKREFS_LISTPTR(object);
    if (FT_ATOMIC_LOAD_PTR(*list) == NULL) {
        // Fast path for the common case
        return;
    }

    /* Remove the callback-less basic and proxy references, which always appear
       at the head of the list.
    */
    for (int done = 0; !done;) {
        LOCK_WEAKREFS(object);
        if (*list != NULL && is_basic_ref_or_proxy(*list)) {
            TyObject *callback;
            clear_weakref_lock_held(*list, &callback);
            assert(callback == NULL);
        }
        done = (*list == NULL) || !is_basic_ref_or_proxy(*list);
        UNLOCK_WEAKREFS(object);
    }

    /* Deal with non-canonical (subtypes or refs with callbacks) references. */
    Ty_ssize_t num_weakrefs = _TyWeakref_GetWeakrefCount(object);
    if (num_weakrefs == 0) {
        return;
    }

    TyObject *exc = TyErr_GetRaisedException();
    TyObject *tuple = TyTuple_New(num_weakrefs * 2);
    if (tuple == NULL) {
        _TyWeakref_ClearWeakRefsNoCallbacks(object);
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing object weakrefs");
        TyErr_SetRaisedException(exc);
        return;
    }

    Ty_ssize_t num_items = 0;
    for (int done = 0; !done;) {
        TyObject *callback = NULL;
        LOCK_WEAKREFS(object);
        PyWeakReference *cur = *list;
        if (cur != NULL) {
            clear_weakref_lock_held(cur, &callback);
            if (_Ty_TryIncref((TyObject *) cur)) {
                assert(num_items / 2 < num_weakrefs);
                TyTuple_SET_ITEM(tuple, num_items, (TyObject *) cur);
                TyTuple_SET_ITEM(tuple, num_items + 1, callback);
                num_items += 2;
                callback = NULL;
            }
        }
        done = (*list == NULL);
        UNLOCK_WEAKREFS(object);

        Ty_XDECREF(callback);
    }

    for (Ty_ssize_t i = 0; i < num_items; i += 2) {
        TyObject *callback = TyTuple_GET_ITEM(tuple, i + 1);
        if (callback != NULL) {
            TyObject *weakref = TyTuple_GET_ITEM(tuple, i);
            handle_callback((PyWeakReference *)weakref, callback);
        }
    }

    Ty_DECREF(tuple);

    assert(!TyErr_Occurred());
    TyErr_SetRaisedException(exc);
}

void
PyUnstable_Object_ClearWeakRefsNoCallbacks(TyObject *obj)
{
    if (_TyType_SUPPORTS_WEAKREFS(Ty_TYPE(obj))) {
        _TyWeakref_ClearWeakRefsNoCallbacks(obj);
    }
}

/* This function is called by _PyStaticType_Dealloc() to clear weak references.
 *
 * This is called at the end of runtime finalization, so we can just
 * wipe out the type's weaklist.  We don't bother with callbacks
 * or anything else.
 */
void
_PyStaticType_ClearWeakRefs(TyInterpreterState *interp, TyTypeObject *type)
{
    managed_static_type_state *state = _PyStaticType_GetState(interp, type);
    TyObject **list = _PyStaticType_GET_WEAKREFS_LISTPTR(state);
    // This is safe to do without holding the lock in free-threaded builds;
    // there is only one thread running and no new threads can be created.
    while (*list) {
        _TyWeakref_ClearRef((PyWeakReference *)*list);
    }
}

void
_TyWeakref_ClearWeakRefsNoCallbacks(TyObject *obj)
{
    /* Modeled after GET_WEAKREFS_LISTPTR().

       This is never triggered for static types so we can avoid the
       (slightly) more costly _TyObject_GET_WEAKREFS_LISTPTR(). */
    PyWeakReference **list = _TyObject_GET_WEAKREFS_LISTPTR_FROM_OFFSET(obj);
    LOCK_WEAKREFS(obj);
    while (*list) {
        _TyWeakref_ClearRef(*list);
    }
    UNLOCK_WEAKREFS(obj);
}

int
_TyWeakref_IsDead(TyObject *weakref)
{
    return _TyWeakref_IS_DEAD(weakref);
}
