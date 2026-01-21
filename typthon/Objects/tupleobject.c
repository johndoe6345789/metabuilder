/* Tuple object implementation */

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_freelist.h"      // _Ty_FREELIST_PUSH()
#include "pycore_gc.h"            // _TyObject_GC_IS_TRACKED()
#include "pycore_list.h"          // _Ty_memory_repeat()
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_object.h"        // _TyObject_GC_TRACK()
#include "pycore_stackref.h"      // PyStackRef_AsPyObjectSteal()
#include "pycore_tuple.h"         // _PyTupleIterObject


/*[clinic input]
class tuple "PyTupleObject *" "&TyTuple_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=f051ba3cfdf9a189]*/

#include "clinic/tupleobject.c.h"


static inline int maybe_freelist_push(PyTupleObject *);


/* Allocate an uninitialized tuple object. Before making it public, following
   steps must be done:

   - Initialize its items.
   - Call _TyObject_GC_TRACK() on it.

   Because the empty tuple is always reused and it's already tracked by GC,
   this function must not be called with size == 0 (unless from TyTuple_New()
   which wraps this function).
*/
static PyTupleObject *
tuple_alloc(Ty_ssize_t size)
{
    if (size < 0) {
        TyErr_BadInternalCall();
        return NULL;
    }
    assert(size != 0);    // The empty tuple is statically allocated.
    Ty_ssize_t index = size - 1;
    if (index < TyTuple_MAXSAVESIZE) {
        PyTupleObject *op = _Ty_FREELIST_POP(PyTupleObject, tuples[index]);
        if (op != NULL) {
            _TyTuple_RESET_HASH_CACHE(op);
            return op;
        }
    }
    /* Check for overflow */
    if ((size_t)size > ((size_t)PY_SSIZE_T_MAX - (sizeof(PyTupleObject) -
                sizeof(TyObject *))) / sizeof(TyObject *)) {
        return (PyTupleObject *)TyErr_NoMemory();
    }
    PyTupleObject *result = PyObject_GC_NewVar(PyTupleObject, &TyTuple_Type, size);
    if (result != NULL) {
        _TyTuple_RESET_HASH_CACHE(result);
    }
    return result;
}

// The empty tuple singleton is not tracked by the GC.
// It does not contain any Python object.
// Note that tuple subclasses have their own empty instances.

static inline TyObject *
tuple_get_empty(void)
{
    return (TyObject *)&_Ty_SINGLETON(tuple_empty);
}

TyObject *
TyTuple_New(Ty_ssize_t size)
{
    PyTupleObject *op;
    if (size == 0) {
        return tuple_get_empty();
    }
    op = tuple_alloc(size);
    if (op == NULL) {
        return NULL;
    }
    for (Ty_ssize_t i = 0; i < size; i++) {
        op->ob_item[i] = NULL;
    }
    _TyObject_GC_TRACK(op);
    return (TyObject *) op;
}

Ty_ssize_t
TyTuple_Size(TyObject *op)
{
    if (!TyTuple_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    else
        return Ty_SIZE(op);
}

TyObject *
TyTuple_GetItem(TyObject *op, Ty_ssize_t i)
{
    if (!TyTuple_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    if (i < 0 || i >= Ty_SIZE(op)) {
        TyErr_SetString(TyExc_IndexError, "tuple index out of range");
        return NULL;
    }
    return ((PyTupleObject *)op) -> ob_item[i];
}

int
TyTuple_SetItem(TyObject *op, Ty_ssize_t i, TyObject *newitem)
{
    TyObject **p;
    if (!TyTuple_Check(op) || Ty_REFCNT(op) != 1) {
        Ty_XDECREF(newitem);
        TyErr_BadInternalCall();
        return -1;
    }
    if (i < 0 || i >= Ty_SIZE(op)) {
        Ty_XDECREF(newitem);
        TyErr_SetString(TyExc_IndexError,
                        "tuple assignment index out of range");
        return -1;
    }
    p = ((PyTupleObject *)op) -> ob_item + i;
    Ty_XSETREF(*p, newitem);
    return 0;
}

void
_TyTuple_MaybeUntrack(TyObject *op)
{
    PyTupleObject *t;
    Ty_ssize_t i, n;

    if (!TyTuple_CheckExact(op) || !_TyObject_GC_IS_TRACKED(op))
        return;
    t = (PyTupleObject *) op;
    n = Ty_SIZE(t);
    for (i = 0; i < n; i++) {
        TyObject *elt = TyTuple_GET_ITEM(t, i);
        /* Tuple with NULL elements aren't
           fully constructed, don't untrack
           them yet. */
        if (!elt ||
            _TyObject_GC_MAY_BE_TRACKED(elt))
            return;
    }
    _TyObject_GC_UNTRACK(op);
}

TyObject *
TyTuple_Pack(Ty_ssize_t n, ...)
{
    Ty_ssize_t i;
    TyObject *o;
    TyObject **items;
    va_list vargs;

    if (n == 0) {
        return tuple_get_empty();
    }

    va_start(vargs, n);
    PyTupleObject *result = tuple_alloc(n);
    if (result == NULL) {
        va_end(vargs);
        return NULL;
    }
    items = result->ob_item;
    for (i = 0; i < n; i++) {
        o = va_arg(vargs, TyObject *);
        items[i] = Ty_NewRef(o);
    }
    va_end(vargs);
    _TyObject_GC_TRACK(result);
    return (TyObject *)result;
}


/* Methods */

static void
tuple_dealloc(TyObject *self)
{
    PyTupleObject *op = _TyTuple_CAST(self);
    if (Ty_SIZE(op) == 0) {
        /* The empty tuple is statically allocated. */
        if (op == &_Ty_SINGLETON(tuple_empty)) {
#ifdef Ty_DEBUG
            _Ty_FatalRefcountError("deallocating the empty tuple singleton");
#else
            return;
#endif
        }
#ifdef Ty_DEBUG
        /* tuple subclasses have their own empty instances. */
        assert(!TyTuple_CheckExact(op));
#endif
    }

    PyObject_GC_UnTrack(op);

    Ty_ssize_t i = Ty_SIZE(op);
    while (--i >= 0) {
        Ty_XDECREF(op->ob_item[i]);
    }
    // This will abort on the empty singleton (if there is one).
    if (!maybe_freelist_push(op)) {
        Ty_TYPE(op)->tp_free((TyObject *)op);
    }
}

static TyObject *
tuple_repr(TyObject *self)
{
    PyTupleObject *v = _TyTuple_CAST(self);
    Ty_ssize_t n = TyTuple_GET_SIZE(v);
    if (n == 0) {
        return TyUnicode_FromString("()");
    }

    /* While not mutable, it is still possible to end up with a cycle in a
       tuple through an object that stores itself within a tuple (and thus
       infinitely asks for the repr of itself). This should only be
       possible within a type. */
    int res = Ty_ReprEnter((TyObject *)v);
    if (res != 0) {
        return res > 0 ? TyUnicode_FromString("(...)") : NULL;
    }

    Ty_ssize_t prealloc;
    if (n > 1) {
        // "(" + "1" + ", 2" * (len - 1) + ")"
        prealloc = 1 + 1 + (2 + 1) * (n - 1) + 1;
    }
    else {
        // "(1,)"
        prealloc = 4;
    }
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(prealloc);
    if (writer == NULL) {
        goto error;
    }

    if (PyUnicodeWriter_WriteChar(writer, '(') < 0) {
        goto error;
    }

    /* Do repr() on each element. */
    for (Ty_ssize_t i = 0; i < n; ++i) {
        if (i > 0) {
            if (PyUnicodeWriter_WriteChar(writer, ',') < 0) {
                goto error;
            }
            if (PyUnicodeWriter_WriteChar(writer, ' ') < 0) {
                goto error;
            }
        }

        if (PyUnicodeWriter_WriteRepr(writer, v->ob_item[i]) < 0) {
            goto error;
        }
    }

    if (n == 1) {
        if (PyUnicodeWriter_WriteChar(writer, ',') < 0) {
            goto error;
        }
    }
    if (PyUnicodeWriter_WriteChar(writer, ')') < 0) {
        goto error;
    }

    Ty_ReprLeave((TyObject *)v);
    return PyUnicodeWriter_Finish(writer);

error:
    PyUnicodeWriter_Discard(writer);
    Ty_ReprLeave((TyObject *)v);
    return NULL;
}


/* Hash for tuples. This is a slightly simplified version of the xxHash
   non-cryptographic hash:
   - we do not use any parallelism, there is only 1 accumulator.
   - we drop the final mixing since this is just a permutation of the
     output space: it does not help against collisions.
   - at the end, we mangle the length with a single constant.
   For the xxHash specification, see
   https://github.com/Cyan4973/xxHash/blob/master/doc/xxhash_spec.md

   The constants for the hash function are defined in pycore_tuple.h.
*/

static Ty_hash_t
tuple_hash(TyObject *op)
{
    PyTupleObject *v = _TyTuple_CAST(op);

    Ty_uhash_t acc = FT_ATOMIC_LOAD_SSIZE_RELAXED(v->ob_hash);
    if (acc != (Ty_uhash_t)-1) {
        return acc;
    }

    Ty_ssize_t len = Ty_SIZE(v);
    TyObject **item = v->ob_item;
    acc = _TyTuple_HASH_XXPRIME_5;
    for (Ty_ssize_t i = 0; i < len; i++) {
        Ty_uhash_t lane = PyObject_Hash(item[i]);
        if (lane == (Ty_uhash_t)-1) {
            return -1;
        }
        acc += lane * _TyTuple_HASH_XXPRIME_2;
        acc = _TyTuple_HASH_XXROTATE(acc);
        acc *= _TyTuple_HASH_XXPRIME_1;
    }

    /* Add input length, mangled to keep the historical value of hash(()). */
    acc += len ^ (_TyTuple_HASH_XXPRIME_5 ^ 3527539UL);

    if (acc == (Ty_uhash_t)-1) {
        acc = 1546275796;
    }

    FT_ATOMIC_STORE_SSIZE_RELAXED(v->ob_hash, acc);

    return acc;
}

static Ty_ssize_t
tuple_length(TyObject *self)
{
    PyTupleObject *a = _TyTuple_CAST(self);
    return Ty_SIZE(a);
}

static int
tuple_contains(TyObject *self, TyObject *el)
{
    PyTupleObject *a = _TyTuple_CAST(self);
    int cmp = 0;
    for (Ty_ssize_t i = 0; cmp == 0 && i < Ty_SIZE(a); ++i) {
        cmp = PyObject_RichCompareBool(TyTuple_GET_ITEM(a, i), el, Py_EQ);
    }
    return cmp;
}

static TyObject *
tuple_item(TyObject *op, Ty_ssize_t i)
{
    PyTupleObject *a = _TyTuple_CAST(op);
    if (i < 0 || i >= Ty_SIZE(a)) {
        TyErr_SetString(TyExc_IndexError, "tuple index out of range");
        return NULL;
    }
    return Ty_NewRef(a->ob_item[i]);
}

TyObject *
_TyTuple_FromArray(TyObject *const *src, Ty_ssize_t n)
{
    if (n == 0) {
        return tuple_get_empty();
    }

    PyTupleObject *tuple = tuple_alloc(n);
    if (tuple == NULL) {
        return NULL;
    }
    TyObject **dst = tuple->ob_item;
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *item = src[i];
        dst[i] = Ty_NewRef(item);
    }
    _TyObject_GC_TRACK(tuple);
    return (TyObject *)tuple;
}

TyObject *
_TyTuple_FromStackRefStealOnSuccess(const _PyStackRef *src, Ty_ssize_t n)
{
    if (n == 0) {
        return tuple_get_empty();
    }
    PyTupleObject *tuple = tuple_alloc(n);
    if (tuple == NULL) {
        return NULL;
    }
    TyObject **dst = tuple->ob_item;
    for (Ty_ssize_t i = 0; i < n; i++) {
        dst[i] = PyStackRef_AsPyObjectSteal(src[i]);
    }
    _TyObject_GC_TRACK(tuple);
    return (TyObject *)tuple;
}

TyObject *
_TyTuple_FromArraySteal(TyObject *const *src, Ty_ssize_t n)
{
    if (n == 0) {
        return tuple_get_empty();
    }
    PyTupleObject *tuple = tuple_alloc(n);
    if (tuple == NULL) {
        for (Ty_ssize_t i = 0; i < n; i++) {
            Ty_DECREF(src[i]);
        }
        return NULL;
    }
    TyObject **dst = tuple->ob_item;
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *item = src[i];
        dst[i] = item;
    }
    _TyObject_GC_TRACK(tuple);
    return (TyObject *)tuple;
}

static TyObject *
tuple_slice(PyTupleObject *a, Ty_ssize_t ilow,
           Ty_ssize_t ihigh)
{
    if (ilow < 0)
        ilow = 0;
    if (ihigh > Ty_SIZE(a))
        ihigh = Ty_SIZE(a);
    if (ihigh < ilow)
        ihigh = ilow;
    if (ilow == 0 && ihigh == Ty_SIZE(a) && TyTuple_CheckExact(a)) {
        return Ty_NewRef(a);
    }
    return _TyTuple_FromArray(a->ob_item + ilow, ihigh - ilow);
}

TyObject *
TyTuple_GetSlice(TyObject *op, Ty_ssize_t i, Ty_ssize_t j)
{
    if (op == NULL || !TyTuple_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return tuple_slice((PyTupleObject *)op, i, j);
}

static TyObject *
tuple_concat(TyObject *aa, TyObject *bb)
{
    PyTupleObject *a = _TyTuple_CAST(aa);
    if (Ty_SIZE(a) == 0 && TyTuple_CheckExact(bb)) {
        return Ty_NewRef(bb);
    }
    if (!TyTuple_Check(bb)) {
        TyErr_Format(TyExc_TypeError,
             "can only concatenate tuple (not \"%.200s\") to tuple",
                 Ty_TYPE(bb)->tp_name);
        return NULL;
    }
    PyTupleObject *b = (PyTupleObject *)bb;

    if (Ty_SIZE(b) == 0 && TyTuple_CheckExact(a)) {
        return Ty_NewRef(a);
    }
    assert((size_t)Ty_SIZE(a) + (size_t)Ty_SIZE(b) < PY_SSIZE_T_MAX);
    Ty_ssize_t size = Ty_SIZE(a) + Ty_SIZE(b);
    if (size == 0) {
        return tuple_get_empty();
    }

    PyTupleObject *np = tuple_alloc(size);
    if (np == NULL) {
        return NULL;
    }

    TyObject **src = a->ob_item;
    TyObject **dest = np->ob_item;
    for (Ty_ssize_t i = 0; i < Ty_SIZE(a); i++) {
        TyObject *v = src[i];
        dest[i] = Ty_NewRef(v);
    }

    src = b->ob_item;
    dest = np->ob_item + Ty_SIZE(a);
    for (Ty_ssize_t i = 0; i < Ty_SIZE(b); i++) {
        TyObject *v = src[i];
        dest[i] = Ty_NewRef(v);
    }

    _TyObject_GC_TRACK(np);
    return (TyObject *)np;
}

static TyObject *
tuple_repeat(TyObject *self, Ty_ssize_t n)
{
    PyTupleObject *a = _TyTuple_CAST(self);
    const Ty_ssize_t input_size = Ty_SIZE(a);
    if (input_size == 0 || n == 1) {
        if (TyTuple_CheckExact(a)) {
            /* Since tuples are immutable, we can return a shared
               copy in this case */
            return Ty_NewRef(a);
        }
    }
    if (input_size == 0 || n <= 0) {
        return tuple_get_empty();
    }
    assert(n>0);

    if (input_size > PY_SSIZE_T_MAX / n)
        return TyErr_NoMemory();
    Ty_ssize_t output_size = input_size * n;

    PyTupleObject *np = tuple_alloc(output_size);
    if (np == NULL)
        return NULL;

    TyObject **dest = np->ob_item;
    if (input_size == 1) {
        TyObject *elem = a->ob_item[0];
        _Ty_RefcntAdd(elem, n);
        TyObject **dest_end = dest + output_size;
        while (dest < dest_end) {
            *dest++ = elem;
        }
    }
    else {
        TyObject **src = a->ob_item;
        TyObject **src_end = src + input_size;
        while (src < src_end) {
            _Ty_RefcntAdd(*src, n);
            *dest++ = *src++;
        }

        _Ty_memory_repeat((char *)np->ob_item, sizeof(TyObject *)*output_size,
                          sizeof(TyObject *)*input_size);
    }
    _TyObject_GC_TRACK(np);
    return (TyObject *) np;
}

/*[clinic input]
tuple.index

    value: object
    start: slice_index(accept={int}) = 0
    stop: slice_index(accept={int}, c_default="PY_SSIZE_T_MAX") = sys.maxsize
    /

Return first index of value.

Raises ValueError if the value is not present.
[clinic start generated code]*/

static TyObject *
tuple_index_impl(PyTupleObject *self, TyObject *value, Ty_ssize_t start,
                 Ty_ssize_t stop)
/*[clinic end generated code: output=07b6f9f3cb5c33eb input=fb39e9874a21fe3f]*/
{
    Ty_ssize_t i;

    if (start < 0) {
        start += Ty_SIZE(self);
        if (start < 0)
            start = 0;
    }
    if (stop < 0) {
        stop += Ty_SIZE(self);
    }
    else if (stop > Ty_SIZE(self)) {
        stop = Ty_SIZE(self);
    }
    for (i = start; i < stop; i++) {
        int cmp = PyObject_RichCompareBool(self->ob_item[i], value, Py_EQ);
        if (cmp > 0)
            return TyLong_FromSsize_t(i);
        else if (cmp < 0)
            return NULL;
    }
    TyErr_SetString(TyExc_ValueError, "tuple.index(x): x not in tuple");
    return NULL;
}

/*[clinic input]
tuple.count

     value: object
     /

Return number of occurrences of value.
[clinic start generated code]*/

static TyObject *
tuple_count_impl(PyTupleObject *self, TyObject *value)
/*[clinic end generated code: output=cf02888d4bc15d7a input=531721aff65bd772]*/
{
    Ty_ssize_t count = 0;
    Ty_ssize_t i;

    for (i = 0; i < Ty_SIZE(self); i++) {
        int cmp = PyObject_RichCompareBool(self->ob_item[i], value, Py_EQ);
        if (cmp > 0)
            count++;
        else if (cmp < 0)
            return NULL;
    }
    return TyLong_FromSsize_t(count);
}

static int
tuple_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyTupleObject *o = _TyTuple_CAST(self);
    for (Ty_ssize_t i = Ty_SIZE(o); --i >= 0; ) {
        Ty_VISIT(o->ob_item[i]);
    }
    return 0;
}

static TyObject *
tuple_richcompare(TyObject *v, TyObject *w, int op)
{
    PyTupleObject *vt, *wt;
    Ty_ssize_t i;
    Ty_ssize_t vlen, wlen;

    if (!TyTuple_Check(v) || !TyTuple_Check(w))
        Py_RETURN_NOTIMPLEMENTED;

    vt = (PyTupleObject *)v;
    wt = (PyTupleObject *)w;

    vlen = Ty_SIZE(vt);
    wlen = Ty_SIZE(wt);

    /* Note:  the corresponding code for lists has an "early out" test
     * here when op is EQ or NE and the lengths differ.  That pays there,
     * but Tim was unable to find any real code where EQ/NE tuple
     * compares don't have the same length, so testing for it here would
     * have cost without benefit.
     */

    /* Search for the first index where items are different.
     * Note that because tuples are immutable, it's safe to reuse
     * vlen and wlen across the comparison calls.
     */
    for (i = 0; i < vlen && i < wlen; i++) {
        int k = PyObject_RichCompareBool(vt->ob_item[i],
                                         wt->ob_item[i], Py_EQ);
        if (k < 0)
            return NULL;
        if (!k)
            break;
    }

    if (i >= vlen || i >= wlen) {
        /* No more items to compare -- compare sizes */
        Py_RETURN_RICHCOMPARE(vlen, wlen, op);
    }

    /* We have an item that differs -- shortcuts for EQ/NE */
    if (op == Py_EQ) {
        Py_RETURN_FALSE;
    }
    if (op == Py_NE) {
        Py_RETURN_TRUE;
    }

    /* Compare the final item again using the proper operator */
    return PyObject_RichCompare(vt->ob_item[i], wt->ob_item[i], op);
}

static TyObject *
tuple_subtype_new(TyTypeObject *type, TyObject *iterable);

/*[clinic input]
@classmethod
tuple.__new__ as tuple_new
    iterable: object(c_default="NULL") = ()
    /

Built-in immutable sequence.

If no argument is given, the constructor returns an empty tuple.
If iterable is specified the tuple is initialized from iterable's items.

If the argument is a tuple, the return value is the same object.
[clinic start generated code]*/

static TyObject *
tuple_new_impl(TyTypeObject *type, TyObject *iterable)
/*[clinic end generated code: output=4546d9f0d469bce7 input=86963bcde633b5a2]*/
{
    if (type != &TyTuple_Type)
        return tuple_subtype_new(type, iterable);

    if (iterable == NULL) {
        return tuple_get_empty();
    }
    else {
        return PySequence_Tuple(iterable);
    }
}

static TyObject *
tuple_vectorcall(TyObject *type, TyObject * const*args,
                 size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("tuple", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("tuple", nargs, 0, 1)) {
        return NULL;
    }

    if (nargs) {
        return tuple_new_impl(_TyType_CAST(type), args[0]);
    }
    else {
        return tuple_get_empty();
    }
}

static TyObject *
tuple_subtype_new(TyTypeObject *type, TyObject *iterable)
{
    TyObject *tmp, *newobj, *item;
    Ty_ssize_t i, n;

    assert(TyType_IsSubtype(type, &TyTuple_Type));
    // tuple subclasses must implement the GC protocol
    assert(_TyType_IS_GC(type));

    tmp = tuple_new_impl(&TyTuple_Type, iterable);
    if (tmp == NULL)
        return NULL;
    assert(TyTuple_Check(tmp));
    /* This may allocate an empty tuple that is not the global one. */
    newobj = type->tp_alloc(type, n = TyTuple_GET_SIZE(tmp));
    if (newobj == NULL) {
        Ty_DECREF(tmp);
        return NULL;
    }
    for (i = 0; i < n; i++) {
        item = TyTuple_GET_ITEM(tmp, i);
        TyTuple_SET_ITEM(newobj, i, Ty_NewRef(item));
    }
    Ty_DECREF(tmp);

    _TyTuple_RESET_HASH_CACHE(newobj);

    // Don't track if a subclass tp_alloc is TyType_GenericAlloc()
    if (!_TyObject_GC_IS_TRACKED(newobj)) {
        _TyObject_GC_TRACK(newobj);
    }
    return newobj;
}

static PySequenceMethods tuple_as_sequence = {
    tuple_length,                               /* sq_length */
    tuple_concat,                               /* sq_concat */
    tuple_repeat,                               /* sq_repeat */
    tuple_item,                                 /* sq_item */
    0,                                          /* sq_slice */
    0,                                          /* sq_ass_item */
    0,                                          /* sq_ass_slice */
    tuple_contains,                             /* sq_contains */
};

static TyObject*
tuple_subscript(TyObject *op, TyObject* item)
{
    PyTupleObject *self = _TyTuple_CAST(op);
    if (_PyIndex_Check(item)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(item, TyExc_IndexError);
        if (i == -1 && TyErr_Occurred())
            return NULL;
        if (i < 0)
            i += TyTuple_GET_SIZE(self);
        return tuple_item(op, i);
    }
    else if (TySlice_Check(item)) {
        Ty_ssize_t start, stop, step, slicelength, i;
        size_t cur;
        TyObject* it;
        TyObject **src, **dest;

        if (TySlice_Unpack(item, &start, &stop, &step) < 0) {
            return NULL;
        }
        slicelength = TySlice_AdjustIndices(TyTuple_GET_SIZE(self), &start,
                                            &stop, step);

        if (slicelength <= 0) {
            return tuple_get_empty();
        }
        else if (start == 0 && step == 1 &&
                 slicelength == TyTuple_GET_SIZE(self) &&
                 TyTuple_CheckExact(self)) {
            return Ty_NewRef(self);
        }
        else {
            PyTupleObject* result = tuple_alloc(slicelength);
            if (!result) return NULL;

            src = self->ob_item;
            dest = result->ob_item;
            for (cur = start, i = 0; i < slicelength;
                 cur += step, i++) {
                it = Ty_NewRef(src[cur]);
                dest[i] = it;
            }

            _TyObject_GC_TRACK(result);
            return (TyObject *)result;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "tuple indices must be integers or slices, not %.200s",
                     Ty_TYPE(item)->tp_name);
        return NULL;
    }
}

/*[clinic input]
tuple.__getnewargs__
[clinic start generated code]*/

static TyObject *
tuple___getnewargs___impl(PyTupleObject *self)
/*[clinic end generated code: output=25e06e3ee56027e2 input=1aeb4b286a21639a]*/
{
    return Ty_BuildValue("(N)", tuple_slice(self, 0, Ty_SIZE(self)));
}

static TyMethodDef tuple_methods[] = {
    TUPLE___GETNEWARGS___METHODDEF
    TUPLE_INDEX_METHODDEF
    TUPLE_COUNT_METHODDEF
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL,              NULL}           /* sentinel */
};

static PyMappingMethods tuple_as_mapping = {
    tuple_length,
    tuple_subscript,
    0
};

static TyObject *tuple_iter(TyObject *seq);

TyTypeObject TyTuple_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "tuple",
    sizeof(PyTupleObject) - sizeof(TyObject *),
    sizeof(TyObject *),
    tuple_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    tuple_repr,                                 /* tp_repr */
    0,                                          /* tp_as_number */
    &tuple_as_sequence,                         /* tp_as_sequence */
    &tuple_as_mapping,                          /* tp_as_mapping */
    tuple_hash,                                 /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_TUPLE_SUBCLASS |
        _Ty_TPFLAGS_MATCH_SELF | Ty_TPFLAGS_SEQUENCE,  /* tp_flags */
    tuple_new__doc__,                           /* tp_doc */
    tuple_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    tuple_richcompare,                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    tuple_iter,                                 /* tp_iter */
    0,                                          /* tp_iternext */
    tuple_methods,                              /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    tuple_new,                                  /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
    .tp_vectorcall = tuple_vectorcall,
    .tp_version_tag = _Ty_TYPE_VERSION_TUPLE,
};

/* The following function breaks the notion that tuples are immutable:
   it changes the size of a tuple.  We get away with this only if there
   is only one module referencing the object.  You can also think of it
   as creating a new tuple object and destroying the old one, only more
   efficiently.  In any case, don't use this if the tuple may already be
   known to some other part of the code. */

int
_TyTuple_Resize(TyObject **pv, Ty_ssize_t newsize)
{
    PyTupleObject *v;
    PyTupleObject *sv;
    Ty_ssize_t i;
    Ty_ssize_t oldsize;

    v = (PyTupleObject *) *pv;
    if (v == NULL || !Ty_IS_TYPE(v, &TyTuple_Type) ||
        (Ty_SIZE(v) != 0 && Ty_REFCNT(v) != 1)) {
        *pv = 0;
        Ty_XDECREF(v);
        TyErr_BadInternalCall();
        return -1;
    }

    oldsize = Ty_SIZE(v);
    if (oldsize == newsize) {
        return 0;
    }
    if (newsize == 0) {
        Ty_DECREF(v);
        *pv = tuple_get_empty();
        return 0;
    }
    if (oldsize == 0) {
#ifdef Ty_DEBUG
        assert(v == &_Ty_SINGLETON(tuple_empty));
#endif
        /* The empty tuple is statically allocated so we never
           resize it in-place. */
        Ty_DECREF(v);
        *pv = TyTuple_New(newsize);
        return *pv == NULL ? -1 : 0;
    }

    if (_TyObject_GC_IS_TRACKED(v)) {
        _TyObject_GC_UNTRACK(v);
    }
#ifdef Ty_TRACE_REFS
    _Ty_ForgetReference((TyObject *) v);
#endif
    /* DECREF items deleted by shrinkage */
    for (i = newsize; i < oldsize; i++) {
        Ty_CLEAR(v->ob_item[i]);
    }
    _PyReftracerTrack((TyObject *)v, PyRefTracer_DESTROY);
    sv = PyObject_GC_Resize(PyTupleObject, v, newsize);
    if (sv == NULL) {
        *pv = NULL;
#ifdef Ty_REF_DEBUG
        _Ty_DecRefTotal(_TyThreadState_GET());
#endif
        PyObject_GC_Del(v);
        return -1;
    }
    _Ty_NewReferenceNoTotal((TyObject *) sv);
    /* Zero out items added by growing */
    if (newsize > oldsize)
        memset(&sv->ob_item[oldsize], 0,
               sizeof(*sv->ob_item) * (newsize - oldsize));
    *pv = (TyObject *) sv;
    _TyObject_GC_TRACK(sv);
    return 0;
}

/*********************** Tuple Iterator **************************/

#define _PyTupleIterObject_CAST(op) ((_PyTupleIterObject *)(op))

static void
tupleiter_dealloc(TyObject *self)
{
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);
    _TyObject_GC_UNTRACK(it);
    Ty_XDECREF(it->it_seq);
    assert(Ty_IS_TYPE(self, &PyTupleIter_Type));
    _Ty_FREELIST_FREE(tuple_iters, it, PyObject_GC_Del);
}

static int
tupleiter_traverse(TyObject *self, visitproc visit, void *arg)
{
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);
    Ty_VISIT(it->it_seq);
    return 0;
}

static TyObject *
tupleiter_next(TyObject *self)
{
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);
    PyTupleObject *seq;
    TyObject *item;

    assert(it != NULL);
    seq = it->it_seq;
#ifndef Ty_GIL_DISABLED
    if (seq == NULL)
        return NULL;
#endif
    assert(TyTuple_Check(seq));

    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    if (index < TyTuple_GET_SIZE(seq)) {
        FT_ATOMIC_STORE_SSIZE_RELAXED(it->it_index, index + 1);
        item = TyTuple_GET_ITEM(seq, index);
        return Ty_NewRef(item);
    }

#ifndef Ty_GIL_DISABLED
    it->it_seq = NULL;
    Ty_DECREF(seq);
#endif
    return NULL;
}

static TyObject *
tupleiter_len(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);
    Ty_ssize_t len = 0;
#ifdef Ty_GIL_DISABLED
    Ty_ssize_t idx = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    Ty_ssize_t seq_len = TyTuple_GET_SIZE(it->it_seq);
    if (idx < seq_len)
        len = seq_len - idx;
#else
    if (it->it_seq)
        len = TyTuple_GET_SIZE(it->it_seq) - it->it_index;
#endif
    return TyLong_FromSsize_t(len);
}

TyDoc_STRVAR(length_hint_doc, "Private method returning an estimate of len(list(it)).");

static TyObject *
tupleiter_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *iter = _TyEval_GetBuiltin(&_Ty_ID(iter));

    /* _TyEval_GetBuiltin can invoke arbitrary code,
     * call must be before access of iterator pointers.
     * see issue #101765 */
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);

#ifdef Ty_GIL_DISABLED
    Ty_ssize_t idx = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    if (idx < TyTuple_GET_SIZE(it->it_seq))
        return Ty_BuildValue("N(O)n", iter, it->it_seq, idx);
#else
    if (it->it_seq)
        return Ty_BuildValue("N(O)n", iter, it->it_seq, it->it_index);
#endif
    return Ty_BuildValue("N(())", iter);
}

static TyObject *
tupleiter_setstate(TyObject *self, TyObject *state)
{
    _PyTupleIterObject *it = _PyTupleIterObject_CAST(self);
    Ty_ssize_t index = TyLong_AsSsize_t(state);
    if (index == -1 && TyErr_Occurred())
        return NULL;
    if (it->it_seq != NULL) {
        if (index < 0)
            index = 0;
        else if (index > TyTuple_GET_SIZE(it->it_seq))
            index = TyTuple_GET_SIZE(it->it_seq); /* exhausted iterator */
        FT_ATOMIC_STORE_SSIZE_RELAXED(it->it_index, index);
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");
TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyMethodDef tupleiter_methods[] = {
    {"__length_hint__", tupleiter_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", tupleiter_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", tupleiter_setstate, METH_O, setstate_doc},
    {NULL, NULL, 0, NULL} /* sentinel */
};

TyTypeObject PyTupleIter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "tuple_iterator",                           /* tp_name */
    sizeof(_PyTupleIterObject),                 /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    tupleiter_dealloc,                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    tupleiter_traverse,                         /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    tupleiter_next,                             /* tp_iternext */
    tupleiter_methods,                          /* tp_methods */
    0,
};

static TyObject *
tuple_iter(TyObject *seq)
{
    if (!TyTuple_Check(seq)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    _PyTupleIterObject *it = _Ty_FREELIST_POP(_PyTupleIterObject, tuple_iters);
    if (it == NULL) {
        it = PyObject_GC_New(_PyTupleIterObject, &PyTupleIter_Type);
        if (it == NULL)
            return NULL;
    }
    it->it_index = 0;
    it->it_seq = (PyTupleObject *)Ty_NewRef(seq);
    _TyObject_GC_TRACK(it);
    return (TyObject *)it;
}


/*************
 * freelists *
 *************/

static inline int
maybe_freelist_push(PyTupleObject *op)
{
    if (!Ty_IS_TYPE(op, &TyTuple_Type)) {
        return 0;
    }
    Ty_ssize_t index = Ty_SIZE(op) - 1;
    if (index < TyTuple_MAXSAVESIZE) {
        return _Ty_FREELIST_PUSH(tuples[index], op, Ty_tuple_MAXFREELIST);
    }
    return 0;
}

/* Print summary info about the state of the optimized allocator */
void
_TyTuple_DebugMallocStats(FILE *out)
{
    for (int i = 0; i < TyTuple_MAXSAVESIZE; i++) {
        int len = i + 1;
        char buf[128];
        TyOS_snprintf(buf, sizeof(buf),
                      "free %d-sized PyTupleObject", len);
        _PyDebugAllocatorStats(out, buf, _Ty_FREELIST_SIZE(tuples[i]),
                               _TyObject_VAR_SIZE(&TyTuple_Type, len));
    }
}
