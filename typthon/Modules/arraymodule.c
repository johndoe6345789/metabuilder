/* Array object implementation */

/* An array is a uniform list -- all items have the same type.
   The item type is restricted to simple C types like int or float */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_bytesobject.h"   // _TyBytes_Repeat
#include "pycore_call.h"          // _TyObject_CallMethod()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include <stddef.h>               // offsetof()
#include <stdbool.h>

/*[clinic input]
module array
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=7d1b8d7f5958fd83]*/

struct arrayobject; /* Forward */
static struct TyModuleDef arraymodule;

/* All possible arraydescr values are defined in the vector "descriptors"
 * below.  That's defined later because the appropriate get and set
 * functions aren't visible yet.
 */
struct arraydescr {
    char typecode;
    int itemsize;
    TyObject * (*getitem)(struct arrayobject *, Ty_ssize_t);
    int (*setitem)(struct arrayobject *, Ty_ssize_t, TyObject *);
    int (*compareitems)(const void *, const void *, Ty_ssize_t);
    const char *formats;
    int is_integer_type;
    int is_signed;
};

typedef struct arrayobject {
    PyObject_VAR_HEAD
    char *ob_item;
    Ty_ssize_t allocated;
    const struct arraydescr *ob_descr;
    TyObject *weakreflist; /* List of weak references */
    Ty_ssize_t ob_exports;  /* Number of exported buffers */
} arrayobject;

typedef struct {
    PyObject_HEAD
    Ty_ssize_t index;
    arrayobject *ao;
    TyObject* (*getitem)(struct arrayobject *, Ty_ssize_t);
} arrayiterobject;

typedef struct {
    TyTypeObject *ArrayType;
    TyTypeObject *ArrayIterType;

    TyObject *array_reconstructor;

    TyObject *str_read;
    TyObject *str_write;
    TyObject *str___dict__;
    TyObject *str_iter;
} array_state;

static array_state *
get_array_state(TyObject *module)
{
    return (array_state *)_TyModule_GetState(module);
}

#define find_array_state_by_type(tp) \
    (get_array_state(TyType_GetModuleByDef(tp, &arraymodule)))
#define get_array_state_by_class(cls) \
    (get_array_state(TyType_GetModule(cls)))

#define arrayobject_CAST(op)        ((arrayobject *)(op))
#define arrayiterobject_CAST(op)    ((arrayiterobject *)(op))

enum machine_format_code {
    UNKNOWN_FORMAT = -1,
    /* UNKNOWN_FORMAT is used to indicate that the machine format for an
     * array type code cannot be interpreted. When this occurs, a list of
     * Python objects is used to represent the content of the array
     * instead of using the memory content of the array directly. In that
     * case, the array_reconstructor mechanism is bypassed completely, and
     * the standard array constructor is used instead.
     *
     * This is will most likely occur when the machine doesn't use IEEE
     * floating-point numbers.
     */

    UNSIGNED_INT8 = 0,
    SIGNED_INT8 = 1,
    UNSIGNED_INT16_LE = 2,
    UNSIGNED_INT16_BE = 3,
    SIGNED_INT16_LE = 4,
    SIGNED_INT16_BE = 5,
    UNSIGNED_INT32_LE = 6,
    UNSIGNED_INT32_BE = 7,
    SIGNED_INT32_LE = 8,
    SIGNED_INT32_BE = 9,
    UNSIGNED_INT64_LE = 10,
    UNSIGNED_INT64_BE = 11,
    SIGNED_INT64_LE = 12,
    SIGNED_INT64_BE = 13,
    IEEE_754_FLOAT_LE = 14,
    IEEE_754_FLOAT_BE = 15,
    IEEE_754_DOUBLE_LE = 16,
    IEEE_754_DOUBLE_BE = 17,
    UTF16_LE = 18,
    UTF16_BE = 19,
    UTF32_LE = 20,
    UTF32_BE = 21
};
#define MACHINE_FORMAT_CODE_MIN 0
#define MACHINE_FORMAT_CODE_MAX 21


/*
 * Must come after arrayobject, arrayiterobject,
 * and enum machine_code_type definitions.
 */
#include "clinic/arraymodule.c.h"

#define array_Check(op, state) PyObject_TypeCheck(op, state->ArrayType)

static int
array_resize(arrayobject *self, Ty_ssize_t newsize)
{
    char *items;
    size_t _new_size;

    if (self->ob_exports > 0 && newsize != Ty_SIZE(self)) {
        TyErr_SetString(TyExc_BufferError,
            "cannot resize an array that is exporting buffers");
        return -1;
    }

    /* Bypass realloc() when a previous overallocation is large enough
       to accommodate the newsize.  If the newsize is 16 smaller than the
       current size, then proceed with the realloc() to shrink the array.
    */

    if (self->allocated >= newsize &&
        Ty_SIZE(self) < newsize + 16 &&
        self->ob_item != NULL) {
        Ty_SET_SIZE(self, newsize);
        return 0;
    }

    if (newsize == 0) {
        TyMem_Free(self->ob_item);
        self->ob_item = NULL;
        Ty_SET_SIZE(self, 0);
        self->allocated = 0;
        return 0;
    }

    /* This over-allocates proportional to the array size, making room
     * for additional growth.  The over-allocation is mild, but is
     * enough to give linear-time amortized behavior over a long
     * sequence of appends() in the presence of a poorly-performing
     * system realloc().
     * The growth pattern is:  0, 4, 8, 16, 25, 34, 46, 56, 67, 79, ...
     * Note, the pattern starts out the same as for lists but then
     * grows at a smaller rate so that larger arrays only overallocate
     * by about 1/16th -- this is done because arrays are presumed to be more
     * memory critical.
     */

    _new_size = (newsize >> 4) + (Ty_SIZE(self) < 8 ? 3 : 7) + newsize;
    items = self->ob_item;
    /* XXX The following multiplication and division does not optimize away
       like it does for lists since the size is not known at compile time */
    if (_new_size <= ((~(size_t)0) / self->ob_descr->itemsize))
        TyMem_RESIZE(items, char, (_new_size * self->ob_descr->itemsize));
    else
        items = NULL;
    if (items == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    self->ob_item = items;
    Ty_SET_SIZE(self, newsize);
    self->allocated = _new_size;
    return 0;
}

/****************************************************************************
Get and Set functions for each type.
A Get function takes an arrayobject* and an integer index, returning the
array value at that index wrapped in an appropriate TyObject*.
A Set function takes an arrayobject, integer index, and TyObject*; sets
the array value at that index to the raw C data extracted from the TyObject*,
and returns 0 if successful, else nonzero on failure (TyObject* not of an
appropriate type or value).
Note that the basic Get and Set functions do NOT check that the index is
in bounds; that's the responsibility of the caller.
****************************************************************************/

static TyObject *
b_getitem(arrayobject *ap, Ty_ssize_t i)
{
    long x = ((signed char *)ap->ob_item)[i];
    return TyLong_FromLong(x);
}

static int
b_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    short x;
    /* TyArg_Parse's 'b' formatter is for an unsigned char, therefore
       must use the next size up that is signed ('h') and manually do
       the overflow checking */
    if (!TyArg_Parse(v, "h;array item must be integer", &x))
        return -1;
    else if (x < -128) {
        TyErr_SetString(TyExc_OverflowError,
            "signed char is less than minimum");
        return -1;
    }
    else if (x > 127) {
        TyErr_SetString(TyExc_OverflowError,
            "signed char is greater than maximum");
        return -1;
    }
    if (i >= 0)
        ((char *)ap->ob_item)[i] = (char)x;
    return 0;
}

static TyObject *
BB_getitem(arrayobject *ap, Ty_ssize_t i)
{
    long x = ((unsigned char *)ap->ob_item)[i];
    return TyLong_FromLong(x);
}

static int
BB_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    unsigned char x;
    /* 'B' == unsigned char, maps to TyArg_Parse's 'b' formatter */
    if (!TyArg_Parse(v, "b;array item must be integer", &x))
        return -1;
    if (i >= 0)
        ((unsigned char *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
u_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyUnicode_FromOrdinal(((wchar_t *) ap->ob_item)[i]);
}

static int
u_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    if (!TyUnicode_Check(v)) {
        TyErr_Format(TyExc_TypeError,
                     "array item must be a unicode character, not %T",
                     v);
        return -1;
    }

    Ty_ssize_t len = TyUnicode_AsWideChar(v, NULL, 0);
    if (len != 2) {
        if (TyUnicode_GET_LENGTH(v) != 1) {
            TyErr_Format(TyExc_TypeError,
                         "array item must be a unicode character, "
                         "not a string of length %zd",
                         TyUnicode_GET_LENGTH(v));
        }
        else {
            TyErr_Format(TyExc_TypeError,
                         "string %A cannot be converted to "
                         "a single wchar_t character",
                         v);
        }
        return -1;
    }

    wchar_t w;
    len = TyUnicode_AsWideChar(v, &w, 1);
    assert(len == 1);

    if (i >= 0) {
        ((wchar_t *)ap->ob_item)[i] = w;
    }
    return 0;
}

static TyObject *
w_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyUnicode_FromOrdinal(((Ty_UCS4 *) ap->ob_item)[i]);
}

static int
w_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    if (!TyUnicode_Check(v)) {
        TyErr_Format(TyExc_TypeError,
                     "array item must be a unicode character, not %T",
                     v);
        return -1;
    }

    if (TyUnicode_GET_LENGTH(v) != 1) {
        TyErr_Format(TyExc_TypeError,
                     "array item must be a unicode character, "
                     "not a string of length %zd",
                     TyUnicode_GET_LENGTH(v));
        return -1;
    }

    if (i >= 0) {
        ((Ty_UCS4 *)ap->ob_item)[i] = TyUnicode_READ_CHAR(v, 0);
    }
    return 0;
}

static TyObject *
h_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromLong((long) ((short *)ap->ob_item)[i]);
}


static int
h_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    short x;
    /* 'h' == signed short, maps to TyArg_Parse's 'h' formatter */
    if (!TyArg_Parse(v, "h;array item must be integer", &x))
        return -1;
    if (i >= 0)
                 ((short *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
HH_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromLong((long) ((unsigned short *)ap->ob_item)[i]);
}

static int
HH_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    int x;
    /* TyArg_Parse's 'h' formatter is for a signed short, therefore
       must use the next size up and manually do the overflow checking */
    if (!TyArg_Parse(v, "i;array item must be integer", &x))
        return -1;
    else if (x < 0) {
        TyErr_SetString(TyExc_OverflowError,
            "unsigned short is less than minimum");
        return -1;
    }
    else if (x > USHRT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
            "unsigned short is greater than maximum");
        return -1;
    }
    if (i >= 0)
        ((short *)ap->ob_item)[i] = (short)x;
    return 0;
}

static TyObject *
i_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromLong((long) ((int *)ap->ob_item)[i]);
}

static int
i_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    int x;
    /* 'i' == signed int, maps to TyArg_Parse's 'i' formatter */
    if (!TyArg_Parse(v, "i;array item must be integer", &x))
        return -1;
    if (i >= 0)
                 ((int *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
II_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromUnsignedLong(
        (unsigned long) ((unsigned int *)ap->ob_item)[i]);
}

static int
II_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    unsigned long x;
    int do_decref = 0; /* if nb_int was called */

    if (!TyLong_Check(v)) {
        v = _PyNumber_Index(v);
        if (NULL == v) {
            return -1;
        }
        do_decref = 1;
    }
    x = TyLong_AsUnsignedLong(v);
    if (x == (unsigned long)-1 && TyErr_Occurred()) {
        if (do_decref) {
            Ty_DECREF(v);
        }
        return -1;
    }
    if (x > UINT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "unsigned int is greater than maximum");
        if (do_decref) {
            Ty_DECREF(v);
        }
        return -1;
    }
    if (i >= 0)
        ((unsigned int *)ap->ob_item)[i] = (unsigned int)x;

    if (do_decref) {
        Ty_DECREF(v);
    }
    return 0;
}

static TyObject *
l_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromLong(((long *)ap->ob_item)[i]);
}

static int
l_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    long x;
    if (!TyArg_Parse(v, "l;array item must be integer", &x))
        return -1;
    if (i >= 0)
                 ((long *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
LL_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromUnsignedLong(((unsigned long *)ap->ob_item)[i]);
}

static int
LL_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    unsigned long x;
    int do_decref = 0; /* if nb_int was called */

    if (!TyLong_Check(v)) {
        v = _PyNumber_Index(v);
        if (NULL == v) {
            return -1;
        }
        do_decref = 1;
    }
    x = TyLong_AsUnsignedLong(v);
    if (x == (unsigned long)-1 && TyErr_Occurred()) {
        if (do_decref) {
            Ty_DECREF(v);
        }
        return -1;
    }
    if (i >= 0)
        ((unsigned long *)ap->ob_item)[i] = x;

    if (do_decref) {
        Ty_DECREF(v);
    }
    return 0;
}

static TyObject *
q_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromLongLong(((long long *)ap->ob_item)[i]);
}

static int
q_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    long long x;
    if (!TyArg_Parse(v, "L;array item must be integer", &x))
        return -1;
    if (i >= 0)
        ((long long *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
QQ_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyLong_FromUnsignedLongLong(
        ((unsigned long long *)ap->ob_item)[i]);
}

static int
QQ_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    unsigned long long x;
    int do_decref = 0; /* if nb_int was called */

    if (!TyLong_Check(v)) {
        v = _PyNumber_Index(v);
        if (NULL == v) {
            return -1;
        }
        do_decref = 1;
    }
    x = TyLong_AsUnsignedLongLong(v);
    if (x == (unsigned long long)-1 && TyErr_Occurred()) {
        if (do_decref) {
            Ty_DECREF(v);
        }
        return -1;
    }
    if (i >= 0)
        ((unsigned long long *)ap->ob_item)[i] = x;

    if (do_decref) {
        Ty_DECREF(v);
    }
    return 0;
}

static TyObject *
f_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyFloat_FromDouble((double) ((float *)ap->ob_item)[i]);
}

static int
f_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    float x;
    if (!TyArg_Parse(v, "f;array item must be float", &x))
        return -1;
    if (i >= 0)
                 ((float *)ap->ob_item)[i] = x;
    return 0;
}

static TyObject *
d_getitem(arrayobject *ap, Ty_ssize_t i)
{
    return TyFloat_FromDouble(((double *)ap->ob_item)[i]);
}

static int
d_setitem(arrayobject *ap, Ty_ssize_t i, TyObject *v)
{
    double x;
    if (!TyArg_Parse(v, "d;array item must be float", &x))
        return -1;
    if (i >= 0)
                 ((double *)ap->ob_item)[i] = x;
    return 0;
}

#define DEFINE_COMPAREITEMS(code, type) \
    static int \
    code##_compareitems(const void *lhs, const void *rhs, Ty_ssize_t length) \
    { \
        const type *a = lhs, *b = rhs; \
        for (Ty_ssize_t i = 0; i < length; ++i) \
            if (a[i] != b[i]) \
                return a[i] < b[i] ? -1 : 1; \
        return 0; \
    }

DEFINE_COMPAREITEMS(b, signed char)
DEFINE_COMPAREITEMS(BB, unsigned char)
DEFINE_COMPAREITEMS(u, wchar_t)
DEFINE_COMPAREITEMS(w, Ty_UCS4)
DEFINE_COMPAREITEMS(h, short)
DEFINE_COMPAREITEMS(HH, unsigned short)
DEFINE_COMPAREITEMS(i, int)
DEFINE_COMPAREITEMS(II, unsigned int)
DEFINE_COMPAREITEMS(l, long)
DEFINE_COMPAREITEMS(LL, unsigned long)
DEFINE_COMPAREITEMS(q, long long)
DEFINE_COMPAREITEMS(QQ, unsigned long long)

/* Description of types.
 *
 * Don't forget to update typecode_to_mformat_code() if you add a new
 * typecode.
 */
static const struct arraydescr descriptors[] = {
    {'b', 1, b_getitem, b_setitem, b_compareitems, "b", 1, 1},
    {'B', 1, BB_getitem, BB_setitem, BB_compareitems, "B", 1, 0},
    {'u', sizeof(wchar_t), u_getitem, u_setitem, u_compareitems, "u", 0, 0},
    {'w', sizeof(Ty_UCS4), w_getitem, w_setitem, w_compareitems, "w", 0, 0,},
    {'h', sizeof(short), h_getitem, h_setitem, h_compareitems, "h", 1, 1},
    {'H', sizeof(short), HH_getitem, HH_setitem, HH_compareitems, "H", 1, 0},
    {'i', sizeof(int), i_getitem, i_setitem, i_compareitems, "i", 1, 1},
    {'I', sizeof(int), II_getitem, II_setitem, II_compareitems, "I", 1, 0},
    {'l', sizeof(long), l_getitem, l_setitem, l_compareitems, "l", 1, 1},
    {'L', sizeof(long), LL_getitem, LL_setitem, LL_compareitems, "L", 1, 0},
    {'q', sizeof(long long), q_getitem, q_setitem, q_compareitems, "q", 1, 1},
    {'Q', sizeof(long long), QQ_getitem, QQ_setitem, QQ_compareitems, "Q", 1, 0},
    {'f', sizeof(float), f_getitem, f_setitem, NULL, "f", 0, 0},
    {'d', sizeof(double), d_getitem, d_setitem, NULL, "d", 0, 0},
    {'\0', 0, 0, 0, 0, 0, 0} /* Sentinel */
};

/****************************************************************************
Implementations of array object methods.
****************************************************************************/
/*[clinic input]
class array.array "arrayobject *" "ArrayType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=a5c29edf59f176a3]*/

static TyObject *
newarrayobject(TyTypeObject *type, Ty_ssize_t size, const struct arraydescr *descr)
{
    arrayobject *op;
    size_t nbytes;

    if (size < 0) {
        TyErr_BadInternalCall();
        return NULL;
    }

    /* Check for overflow */
    if (size > PY_SSIZE_T_MAX / descr->itemsize) {
        return TyErr_NoMemory();
    }
    nbytes = size * descr->itemsize;
    op = (arrayobject *) type->tp_alloc(type, 0);
    if (op == NULL) {
        return NULL;
    }
    op->ob_descr = descr;
    op->allocated = size;
    op->weakreflist = NULL;
    Ty_SET_SIZE(op, size);
    if (size <= 0) {
        op->ob_item = NULL;
    }
    else {
        op->ob_item = TyMem_NEW(char, nbytes);
        if (op->ob_item == NULL) {
            Ty_DECREF(op);
            return TyErr_NoMemory();
        }
    }
    op->ob_exports = 0;
    return (TyObject *) op;
}

static TyObject *
getarrayitem(TyObject *op, Ty_ssize_t i)
{
#ifndef NDEBUG
    array_state *state = find_array_state_by_type(Ty_TYPE(op));
    assert(array_Check(op, state));
#endif
    arrayobject *ap;
    ap = (arrayobject *)op;
    assert(i>=0 && i<Ty_SIZE(ap));
    return (*ap->ob_descr->getitem)(ap, i);
}

static int
ins1(arrayobject *self, Ty_ssize_t where, TyObject *v)
{
    char *items;
    Ty_ssize_t n = Ty_SIZE(self);
    if (v == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }
    if ((*self->ob_descr->setitem)(self, -1, v) < 0)
        return -1;

    if (array_resize(self, n+1) == -1)
        return -1;
    items = self->ob_item;
    if (where < 0) {
        where += n;
        if (where < 0)
            where = 0;
    }
    if (where > n)
        where = n;
    /* appends don't need to call memmove() */
    if (where != n)
        memmove(items + (where+1)*self->ob_descr->itemsize,
            items + where*self->ob_descr->itemsize,
            (n-where)*self->ob_descr->itemsize);
    return (*self->ob_descr->setitem)(self, where, v);
}

/* Methods */

static int
array_tp_traverse(TyObject *op, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(op));
    return 0;
}

static void
array_dealloc(TyObject *op)
{
    TyTypeObject *tp = Ty_TYPE(op);
    PyObject_GC_UnTrack(op);

    arrayobject *self = arrayobject_CAST(op);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    if (self->ob_item != NULL) {
        TyMem_Free(self->ob_item);
    }
    tp->tp_free(op);
    Ty_DECREF(tp);
}

static TyObject *
array_richcompare(TyObject *v, TyObject *w, int op)
{
    array_state *state = find_array_state_by_type(Ty_TYPE(v));
    arrayobject *va, *wa;
    TyObject *vi = NULL;
    TyObject *wi = NULL;
    Ty_ssize_t i, k;
    TyObject *res;

    if (!array_Check(v, state) || !array_Check(w, state))
        Py_RETURN_NOTIMPLEMENTED;

    va = (arrayobject *)v;
    wa = (arrayobject *)w;

    if (Ty_SIZE(va) != Ty_SIZE(wa) && (op == Py_EQ || op == Py_NE)) {
        /* Shortcut: if the lengths differ, the arrays differ */
        if (op == Py_EQ)
            res = Ty_False;
        else
            res = Ty_True;
        return Ty_NewRef(res);
    }

    if (va->ob_descr == wa->ob_descr && va->ob_descr->compareitems != NULL) {
        /* Fast path:
           arrays with same types can have their buffers compared directly */
        Ty_ssize_t common_length = Ty_MIN(Ty_SIZE(va), Ty_SIZE(wa));
        int result = va->ob_descr->compareitems(va->ob_item, wa->ob_item,
                                                common_length);
        if (result == 0)
            goto compare_sizes;

        int cmp;
        switch (op) {
        case Py_LT: cmp = result < 0; break;
        case Py_LE: cmp = result <= 0; break;
        case Py_EQ: cmp = result == 0; break;
        case Py_NE: cmp = result != 0; break;
        case Py_GT: cmp = result > 0; break;
        case Py_GE: cmp = result >= 0; break;
        default: return NULL; /* cannot happen */
        }
        TyObject *res = cmp ? Ty_True : Ty_False;
        return Ty_NewRef(res);
    }


    /* Search for the first index where items are different */
    k = 1;
    for (i = 0; i < Ty_SIZE(va) && i < Ty_SIZE(wa); i++) {
        vi = getarrayitem(v, i);
        if (vi == NULL) {
            return NULL;
        }
        wi = getarrayitem(w, i);
        if (wi == NULL) {
            Ty_DECREF(vi);
            return NULL;
        }
        k = PyObject_RichCompareBool(vi, wi, Py_EQ);
        if (k == 0)
            break; /* Keeping vi and wi alive! */
        Ty_DECREF(vi);
        Ty_DECREF(wi);
        if (k < 0)
            return NULL;
    }

    if (k) {
        /* No more items to compare -- compare sizes */
        compare_sizes: ;
        Ty_ssize_t vs = Ty_SIZE(va);
        Ty_ssize_t ws = Ty_SIZE(wa);
        int cmp;
        switch (op) {
        case Py_LT: cmp = vs <  ws; break;
        case Py_LE: cmp = vs <= ws; break;
        /* If the lengths were not equal,
           the earlier fast-path check would have caught that. */
        case Py_EQ: assert(vs == ws); cmp = 1; break;
        case Py_NE: assert(vs == ws); cmp = 0; break;
        case Py_GT: cmp = vs >  ws; break;
        case Py_GE: cmp = vs >= ws; break;
        default: return NULL; /* cannot happen */
        }
        if (cmp)
            res = Ty_True;
        else
            res = Ty_False;
        return Ty_NewRef(res);
    }

    /* We have an item that differs.  First, shortcuts for EQ/NE */
    if (op == Py_EQ) {
        res = Ty_NewRef(Ty_False);
    }
    else if (op == Py_NE) {
        res = Ty_NewRef(Ty_True);
    }
    else {
        /* Compare the final item again using the proper operator */
        res = PyObject_RichCompare(vi, wi, op);
    }
    Ty_DECREF(vi);
    Ty_DECREF(wi);
    return res;
}

static Ty_ssize_t
array_length(TyObject *op)
{
    return Ty_SIZE(op);
}

static TyObject *
array_item(TyObject *op, Ty_ssize_t i)
{
    if (i < 0 || i >= Ty_SIZE(op)) {
        TyErr_SetString(TyExc_IndexError, "array index out of range");
        return NULL;
    }
    return getarrayitem(op, i);
}

static TyObject *
array_slice(arrayobject *a, Ty_ssize_t ilow, Ty_ssize_t ihigh)
{
    array_state *state = find_array_state_by_type(Ty_TYPE(a));
    arrayobject *np;

    if (ilow < 0)
        ilow = 0;
    else if (ilow > Ty_SIZE(a))
        ilow = Ty_SIZE(a);
    if (ihigh < 0)
        ihigh = 0;
    if (ihigh < ilow)
        ihigh = ilow;
    else if (ihigh > Ty_SIZE(a))
        ihigh = Ty_SIZE(a);
    np = (arrayobject *) newarrayobject(state->ArrayType, ihigh - ilow, a->ob_descr);
    if (np == NULL)
        return NULL;
    if (ihigh > ilow) {
        memcpy(np->ob_item, a->ob_item + ilow * a->ob_descr->itemsize,
               (ihigh-ilow) * a->ob_descr->itemsize);
    }
    return (TyObject *)np;
}

/*[clinic input]
array.array.clear

Remove all items from the array.
[clinic start generated code]*/

static TyObject *
array_array_clear_impl(arrayobject *self)
/*[clinic end generated code: output=5efe0417062210a9 input=5dffa30e94e717a4]*/
{
    if (array_resize(self, 0) == -1) {
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.__copy__

Return a copy of the array.
[clinic start generated code]*/

static TyObject *
array_array___copy___impl(arrayobject *self)
/*[clinic end generated code: output=dec7c3f925d9619e input=ad1ee5b086965f09]*/
{
    return array_slice(self, 0, Ty_SIZE(self));
}

/*[clinic input]
array.array.__deepcopy__

    unused: object
    /

Return a copy of the array.
[clinic start generated code]*/

static TyObject *
array_array___deepcopy___impl(arrayobject *self, TyObject *unused)
/*[clinic end generated code: output=703b4c412feaaf31 input=2405ecb4933748c4]*/
{
    return array_array___copy___impl(self);
}

static TyObject *
array_concat(TyObject *op, TyObject *bb)
{
    arrayobject *a = arrayobject_CAST(op);
    array_state *state = find_array_state_by_type(Ty_TYPE(a));
    Ty_ssize_t size;
    arrayobject *np;
    if (!array_Check(bb, state)) {
        TyErr_Format(TyExc_TypeError,
             "can only append array (not \"%.200s\") to array",
                 Ty_TYPE(bb)->tp_name);
        return NULL;
    }
#define b ((arrayobject *)bb)
    if (a->ob_descr != b->ob_descr) {
        TyErr_BadArgument();
        return NULL;
    }
    if (Ty_SIZE(a) > PY_SSIZE_T_MAX - Ty_SIZE(b)) {
        return TyErr_NoMemory();
    }
    size = Ty_SIZE(a) + Ty_SIZE(b);
    np = (arrayobject *) newarrayobject(state->ArrayType, size, a->ob_descr);
    if (np == NULL) {
        return NULL;
    }
    if (Ty_SIZE(a) > 0) {
        memcpy(np->ob_item, a->ob_item, Ty_SIZE(a)*a->ob_descr->itemsize);
    }
    if (Ty_SIZE(b) > 0) {
        memcpy(np->ob_item + Ty_SIZE(a)*a->ob_descr->itemsize,
               b->ob_item, Ty_SIZE(b)*b->ob_descr->itemsize);
    }
    return (TyObject *)np;
#undef b
}

static TyObject *
array_repeat(TyObject *op, Ty_ssize_t n)
{
    arrayobject *a = arrayobject_CAST(op);
    array_state *state = find_array_state_by_type(Ty_TYPE(a));

    if (n < 0)
        n = 0;
    const Ty_ssize_t array_length = Ty_SIZE(a);
    if ((array_length != 0) && (n > PY_SSIZE_T_MAX / array_length)) {
        return TyErr_NoMemory();
    }
    Ty_ssize_t size = array_length * n;
    arrayobject* np = (arrayobject *) newarrayobject(state->ArrayType, size, a->ob_descr);
    if (np == NULL)
        return NULL;
    if (size == 0)
        return (TyObject *)np;

    const Ty_ssize_t oldbytes = array_length * a->ob_descr->itemsize;
    const Ty_ssize_t newbytes = oldbytes * n;
    _TyBytes_Repeat(np->ob_item, newbytes, a->ob_item, oldbytes);

    return (TyObject *)np;
}

static int
array_del_slice(arrayobject *a, Ty_ssize_t ilow, Ty_ssize_t ihigh)
{
    char *item;
    Ty_ssize_t d; /* Change in size */
    if (ilow < 0)
        ilow = 0;
    else if (ilow > Ty_SIZE(a))
        ilow = Ty_SIZE(a);
    if (ihigh < 0)
        ihigh = 0;
    if (ihigh < ilow)
        ihigh = ilow;
    else if (ihigh > Ty_SIZE(a))
        ihigh = Ty_SIZE(a);
    item = a->ob_item;
    d = ihigh-ilow;
    /* Issue #4509: If the array has exported buffers and the slice
       assignment would change the size of the array, fail early to make
       sure we don't modify it. */
    if (d != 0 && a->ob_exports > 0) {
        TyErr_SetString(TyExc_BufferError,
            "cannot resize an array that is exporting buffers");
        return -1;
    }
    if (d > 0) { /* Delete d items */
        memmove(item + (ihigh-d)*a->ob_descr->itemsize,
            item + ihigh*a->ob_descr->itemsize,
            (Ty_SIZE(a)-ihigh)*a->ob_descr->itemsize);
        if (array_resize(a, Ty_SIZE(a) - d) == -1)
            return -1;
    }
    return 0;
}

static int
array_ass_item(TyObject *op, Ty_ssize_t i, TyObject *v)
{
    arrayobject *a = arrayobject_CAST(op);
    if (i < 0 || i >= Ty_SIZE(a)) {
        TyErr_SetString(TyExc_IndexError,
                         "array assignment index out of range");
        return -1;
    }
    if (v == NULL)
        return array_del_slice(a, i, i+1);
    return (*a->ob_descr->setitem)(a, i, v);
}

static int
setarrayitem(TyObject *a, Ty_ssize_t i, TyObject *v)
{
#ifndef NDEBUG
    array_state *state = find_array_state_by_type(Ty_TYPE(a));
    assert(array_Check(a, state));
#endif
    return array_ass_item(a, i, v);
}

static int
array_iter_extend(arrayobject *self, TyObject *bb)
{
    TyObject *it, *v;

    it = PyObject_GetIter(bb);
    if (it == NULL)
        return -1;

    while ((v = TyIter_Next(it)) != NULL) {
        if (ins1(self, Ty_SIZE(self), v) != 0) {
            Ty_DECREF(v);
            Ty_DECREF(it);
            return -1;
        }
        Ty_DECREF(v);
    }
    Ty_DECREF(it);
    if (TyErr_Occurred())
        return -1;
    return 0;
}

static int
array_do_extend(array_state *state, arrayobject *self, TyObject *bb)
{
    Ty_ssize_t size, oldsize, bbsize;

    if (!array_Check(bb, state))
        return array_iter_extend(self, bb);
#define b ((arrayobject *)bb)
    if (self->ob_descr != b->ob_descr) {
        TyErr_SetString(TyExc_TypeError,
                     "can only extend with array of same kind");
        return -1;
    }
    if ((Ty_SIZE(self) > PY_SSIZE_T_MAX - Ty_SIZE(b)) ||
        ((Ty_SIZE(self) + Ty_SIZE(b)) > PY_SSIZE_T_MAX / self->ob_descr->itemsize)) {
        TyErr_NoMemory();
        return -1;
    }
    oldsize = Ty_SIZE(self);
    /* Get the size of bb before resizing the array since bb could be self. */
    bbsize = Ty_SIZE(bb);
    size = oldsize + Ty_SIZE(b);
    if (array_resize(self, size) == -1)
        return -1;
    if (bbsize > 0) {
        memcpy(self->ob_item + oldsize * self->ob_descr->itemsize,
            b->ob_item, bbsize * b->ob_descr->itemsize);
    }

    return 0;
#undef b
}

static TyObject *
array_inplace_concat(TyObject *op, TyObject *bb)
{
    arrayobject *self = arrayobject_CAST(op);
    array_state *state = find_array_state_by_type(Ty_TYPE(self));

    if (!array_Check(bb, state)) {
        TyErr_Format(TyExc_TypeError,
            "can only extend array with array (not \"%.200s\")",
            Ty_TYPE(bb)->tp_name);
        return NULL;
    }
    if (array_do_extend(state, self, bb) == -1)
        return NULL;
    return Ty_NewRef(self);
}

static TyObject *
array_inplace_repeat(TyObject *op, Ty_ssize_t n)
{
    arrayobject *self = arrayobject_CAST(op);
    const Ty_ssize_t array_size = Ty_SIZE(self);

    if (array_size > 0 && n != 1 ) {
        if (n < 0)
            n = 0;
        if ((self->ob_descr->itemsize != 0) &&
            (array_size > PY_SSIZE_T_MAX / self->ob_descr->itemsize)) {
            return TyErr_NoMemory();
        }
        Ty_ssize_t size = array_size * self->ob_descr->itemsize;
        if (n > 0 && size > PY_SSIZE_T_MAX / n) {
            return TyErr_NoMemory();
        }
        if (array_resize(self, n * array_size) == -1)
            return NULL;

        _TyBytes_Repeat(self->ob_item, n*size, self->ob_item, size);
    }
    return Ty_NewRef(self);
}


static TyObject *
ins(arrayobject *self, Ty_ssize_t where, TyObject *v)
{
    if (ins1(self, where, v) != 0)
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.count

    v: object
    /

Return number of occurrences of v in the array.
[clinic start generated code]*/

static TyObject *
array_array_count_impl(arrayobject *self, TyObject *v)
/*[clinic end generated code: output=93ead26a2affb739 input=d9bce9d65e39d1f5]*/
{
    Ty_ssize_t count = 0;
    Ty_ssize_t i;

    for (i = 0; i < Ty_SIZE(self); i++) {
        TyObject *selfi;
        int cmp;

        selfi = getarrayitem((TyObject *)self, i);
        if (selfi == NULL)
            return NULL;
        cmp = PyObject_RichCompareBool(selfi, v, Py_EQ);
        Ty_DECREF(selfi);
        if (cmp > 0)
            count++;
        else if (cmp < 0)
            return NULL;
    }
    return TyLong_FromSsize_t(count);
}


/*[clinic input]
array.array.index

    v: object
    start: slice_index(accept={int}) = 0
    stop: slice_index(accept={int}, c_default="PY_SSIZE_T_MAX") = sys.maxsize
    /

Return index of first occurrence of v in the array.

Raise ValueError if the value is not present.
[clinic start generated code]*/

static TyObject *
array_array_index_impl(arrayobject *self, TyObject *v, Ty_ssize_t start,
                       Ty_ssize_t stop)
/*[clinic end generated code: output=c45e777880c99f52 input=089dff7baa7e5a7e]*/
{
    if (start < 0) {
        start += Ty_SIZE(self);
        if (start < 0) {
            start = 0;
        }
    }
    if (stop < 0) {
        stop += Ty_SIZE(self);
    }
    // Use Ty_SIZE() for every iteration in case the array is mutated
    // during PyObject_RichCompareBool()
    for (Ty_ssize_t i = start; i < stop && i < Ty_SIZE(self); i++) {
        TyObject *selfi;
        int cmp;

        selfi = getarrayitem((TyObject *)self, i);
        if (selfi == NULL)
            return NULL;
        cmp = PyObject_RichCompareBool(selfi, v, Py_EQ);
        Ty_DECREF(selfi);
        if (cmp > 0) {
            return TyLong_FromSsize_t(i);
        }
        else if (cmp < 0)
            return NULL;
    }
    TyErr_SetString(TyExc_ValueError, "array.index(x): x not in array");
    return NULL;
}

static int
array_contains(TyObject *self, TyObject *v)
{
    Ty_ssize_t i;
    int cmp;

    for (i = 0, cmp = 0 ; cmp == 0 && i < Ty_SIZE(self); i++) {
        TyObject *selfi = getarrayitem(self, i);
        if (selfi == NULL)
            return -1;
        cmp = PyObject_RichCompareBool(selfi, v, Py_EQ);
        Ty_DECREF(selfi);
    }
    return cmp;
}

/*[clinic input]
array.array.remove

    v: object
    /

Remove the first occurrence of v in the array.
[clinic start generated code]*/

static TyObject *
array_array_remove_impl(arrayobject *self, TyObject *v)
/*[clinic end generated code: output=f2a24e288ecb2a35 input=0b1e5aed25590027]*/
{
    Ty_ssize_t i;

    for (i = 0; i < Ty_SIZE(self); i++) {
        TyObject *selfi;
        int cmp;

        selfi = getarrayitem((TyObject *)self,i);
        if (selfi == NULL)
            return NULL;
        cmp = PyObject_RichCompareBool(selfi, v, Py_EQ);
        Ty_DECREF(selfi);
        if (cmp > 0) {
            if (array_del_slice(self, i, i+1) != 0)
                return NULL;
            Py_RETURN_NONE;
        }
        else if (cmp < 0)
            return NULL;
    }
    TyErr_SetString(TyExc_ValueError, "array.remove(x): x not in array");
    return NULL;
}

/*[clinic input]
array.array.pop

    i: Ty_ssize_t = -1
    /

Return the i-th element and delete it from the array.

i defaults to -1.
[clinic start generated code]*/

static TyObject *
array_array_pop_impl(arrayobject *self, Ty_ssize_t i)
/*[clinic end generated code: output=bc1f0c54fe5308e4 input=8e5feb4c1a11cd44]*/
{
    TyObject *v;

    if (Ty_SIZE(self) == 0) {
        /* Special-case most common failure cause */
        TyErr_SetString(TyExc_IndexError, "pop from empty array");
        return NULL;
    }
    if (i < 0)
        i += Ty_SIZE(self);
    if (i < 0 || i >= Ty_SIZE(self)) {
        TyErr_SetString(TyExc_IndexError, "pop index out of range");
        return NULL;
    }
    v = getarrayitem((TyObject *)self, i);
    if (v == NULL)
        return NULL;
    if (array_del_slice(self, i, i+1) != 0) {
        Ty_DECREF(v);
        return NULL;
    }
    return v;
}

/*[clinic input]
array.array.extend

    cls: defining_class
    bb: object
    /

Append items to the end of the array.
[clinic start generated code]*/

static TyObject *
array_array_extend_impl(arrayobject *self, TyTypeObject *cls, TyObject *bb)
/*[clinic end generated code: output=e65eb7588f0bc266 input=8eb6817ec4d2cb62]*/
{
    array_state *state = get_array_state_by_class(cls);

    if (array_do_extend(state, self, bb) == -1)
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.insert

    i: Ty_ssize_t
    v: object
    /

Insert a new item v into the array before position i.
[clinic start generated code]*/

static TyObject *
array_array_insert_impl(arrayobject *self, Ty_ssize_t i, TyObject *v)
/*[clinic end generated code: output=5a3648e278348564 input=5577d1b4383e9313]*/
{
    return ins(self, i, v);
}

/*[clinic input]
array.array.buffer_info

Return a tuple (address, length) giving the current memory address and the length in items of the buffer used to hold array's contents.

The length should be multiplied by the itemsize attribute to calculate
the buffer length in bytes.
[clinic start generated code]*/

static TyObject *
array_array_buffer_info_impl(arrayobject *self)
/*[clinic end generated code: output=9b2a4ec3ae7e98e7 input=a58bae5c6e1ac6a6]*/
{
    TyObject *retval = NULL, *v;

    retval = TyTuple_New(2);
    if (!retval)
        return NULL;

    v = TyLong_FromVoidPtr(self->ob_item);
    if (v == NULL) {
        Ty_DECREF(retval);
        return NULL;
    }
    TyTuple_SET_ITEM(retval, 0, v);

    v = TyLong_FromSsize_t(Ty_SIZE(self));
    if (v == NULL) {
        Ty_DECREF(retval);
        return NULL;
    }
    TyTuple_SET_ITEM(retval, 1, v);

    return retval;
}

/*[clinic input]
array.array.append

    v: object
    /

Append new value v to the end of the array.
[clinic start generated code]*/

static TyObject *
array_array_append_impl(arrayobject *self, TyObject *v)
/*[clinic end generated code: output=2f1e8cbad70c2a8b input=0b98d9d78e78f0fa]*/
{
    return ins(self, Ty_SIZE(self), v);
}

/*[clinic input]
array.array.byteswap

Byteswap all items of the array.

If the items in the array are not 1, 2, 4, or 8 bytes in size, RuntimeError is
raised.
[clinic start generated code]*/

static TyObject *
array_array_byteswap_impl(arrayobject *self)
/*[clinic end generated code: output=5f8236cbdf0d90b5 input=6a85591b950a0186]*/
{
    char *p;
    Ty_ssize_t i;

    switch (self->ob_descr->itemsize) {
    case 1:
        break;
    case 2:
        for (p = self->ob_item, i = Ty_SIZE(self); --i >= 0; p += 2) {
            char p0 = p[0];
            p[0] = p[1];
            p[1] = p0;
        }
        break;
    case 4:
        for (p = self->ob_item, i = Ty_SIZE(self); --i >= 0; p += 4) {
            char p0 = p[0];
            char p1 = p[1];
            p[0] = p[3];
            p[1] = p[2];
            p[2] = p1;
            p[3] = p0;
        }
        break;
    case 8:
        for (p = self->ob_item, i = Ty_SIZE(self); --i >= 0; p += 8) {
            char p0 = p[0];
            char p1 = p[1];
            char p2 = p[2];
            char p3 = p[3];
            p[0] = p[7];
            p[1] = p[6];
            p[2] = p[5];
            p[3] = p[4];
            p[4] = p3;
            p[5] = p2;
            p[6] = p1;
            p[7] = p0;
        }
        break;
    default:
        TyErr_SetString(TyExc_RuntimeError,
                   "don't know how to byteswap this array type");
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.reverse

Reverse the order of the items in the array.
[clinic start generated code]*/

static TyObject *
array_array_reverse_impl(arrayobject *self)
/*[clinic end generated code: output=c04868b36f6f4089 input=cd904f01b27d966a]*/
{
    Ty_ssize_t itemsize = self->ob_descr->itemsize;
    char *p, *q;
    /* little buffer to hold items while swapping */
    char tmp[256];      /* 8 is probably enough -- but why skimp */
    assert((size_t)itemsize <= sizeof(tmp));

    if (Ty_SIZE(self) > 1) {
        for (p = self->ob_item,
             q = self->ob_item + (Ty_SIZE(self) - 1)*itemsize;
             p < q;
             p += itemsize, q -= itemsize) {
            /* memory areas guaranteed disjoint, so memcpy
             * is safe (& memmove may be slower).
             */
            memcpy(tmp, p, itemsize);
            memcpy(p, q, itemsize);
            memcpy(q, tmp, itemsize);
        }
    }

    Py_RETURN_NONE;
}

/*[clinic input]
array.array.fromfile

    cls: defining_class
    f: object
    n: Ty_ssize_t
    /

Read n objects from the file object f and append them to the end of the array.
[clinic start generated code]*/

static TyObject *
array_array_fromfile_impl(arrayobject *self, TyTypeObject *cls, TyObject *f,
                          Ty_ssize_t n)
/*[clinic end generated code: output=83a667080b345ebc input=3822e907c1c11f1a]*/
{
    TyObject *b, *res;
    Ty_ssize_t itemsize = self->ob_descr->itemsize;
    Ty_ssize_t nbytes;
    int not_enough_bytes;

    if (n < 0) {
        TyErr_SetString(TyExc_ValueError, "negative count");
        return NULL;
    }
    if (n > PY_SSIZE_T_MAX / itemsize) {
        TyErr_NoMemory();
        return NULL;
    }


    array_state *state = get_array_state_by_class(cls);
    assert(state != NULL);

    nbytes = n * itemsize;

    b = _TyObject_CallMethod(f, state->str_read, "n", nbytes);
    if (b == NULL)
        return NULL;

    if (!TyBytes_Check(b)) {
        TyErr_SetString(TyExc_TypeError,
                        "read() didn't return bytes");
        Ty_DECREF(b);
        return NULL;
    }

    not_enough_bytes = (TyBytes_GET_SIZE(b) != nbytes);

    res = array_array_frombytes((TyObject *)self, b);
    Ty_DECREF(b);
    if (res == NULL)
        return NULL;

    if (not_enough_bytes) {
        TyErr_SetString(TyExc_EOFError,
                        "read() didn't return enough bytes");
        Ty_DECREF(res);
        return NULL;
    }

    return res;
}

/*[clinic input]
array.array.tofile

    cls: defining_class
    f: object
    /

Write all items (as machine values) to the file object f.
[clinic start generated code]*/

static TyObject *
array_array_tofile_impl(arrayobject *self, TyTypeObject *cls, TyObject *f)
/*[clinic end generated code: output=4560c628d9c18bc2 input=5a24da7a7b407b52]*/
{
    Ty_ssize_t nbytes = Ty_SIZE(self) * self->ob_descr->itemsize;
    /* Write 64K blocks at a time */
    /* XXX Make the block size settable */
    int BLOCKSIZE = 64*1024;
    Ty_ssize_t nblocks = (nbytes + BLOCKSIZE - 1) / BLOCKSIZE;
    Ty_ssize_t i;

    if (Ty_SIZE(self) == 0)
        goto done;


    array_state *state = get_array_state_by_class(cls);
    assert(state != NULL);

    for (i = 0; i < nblocks; i++) {
        char* ptr = self->ob_item + i*BLOCKSIZE;
        Ty_ssize_t size = BLOCKSIZE;
        TyObject *bytes, *res;

        if (i*BLOCKSIZE + size > nbytes)
            size = nbytes - i*BLOCKSIZE;
        bytes = TyBytes_FromStringAndSize(ptr, size);
        if (bytes == NULL)
            return NULL;
        res = PyObject_CallMethodOneArg(f, state->str_write, bytes);
        Ty_DECREF(bytes);
        if (res == NULL)
            return NULL;
        Ty_DECREF(res); /* drop write result */
    }

  done:
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.fromlist

    list: object
    /

Append items to array from list.
[clinic start generated code]*/

static TyObject *
array_array_fromlist_impl(arrayobject *self, TyObject *list)
/*[clinic end generated code: output=6c23733a68dd68df input=be2605a96c49680f]*/
{
    Ty_ssize_t n;

    if (!TyList_Check(list)) {
        TyErr_SetString(TyExc_TypeError, "arg must be list");
        return NULL;
    }
    n = TyList_Size(list);
    if (n > 0) {
        Ty_ssize_t i, old_size;
        old_size = Ty_SIZE(self);
        if (array_resize(self, old_size + n) == -1)
            return NULL;
        for (i = 0; i < n; i++) {
            TyObject *v = TyList_GET_ITEM(list, i);
            if ((*self->ob_descr->setitem)(self,
                            Ty_SIZE(self) - n + i, v) != 0) {
                array_resize(self, old_size);
                return NULL;
            }
            if (n != TyList_GET_SIZE(list)) {
                TyErr_SetString(TyExc_RuntimeError,
                                "list changed size during iteration");
                array_resize(self, old_size);
                return NULL;
            }
        }
    }
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.tolist

Convert array to an ordinary list with the same items.
[clinic start generated code]*/

static TyObject *
array_array_tolist_impl(arrayobject *self)
/*[clinic end generated code: output=00b60cc9eab8ef89 input=a8d7784a94f86b53]*/
{
    TyObject *list = TyList_New(Ty_SIZE(self));
    Ty_ssize_t i;

    if (list == NULL)
        return NULL;
    for (i = 0; i < Ty_SIZE(self); i++) {
        TyObject *v = getarrayitem((TyObject *)self, i);
        if (v == NULL)
            goto error;
        TyList_SET_ITEM(list, i, v);
    }
    return list;

error:
    Ty_DECREF(list);
    return NULL;
}

static TyObject *
frombytes(arrayobject *self, Ty_buffer *buffer)
{
    int itemsize = self->ob_descr->itemsize;
    Ty_ssize_t n;
    if (buffer->itemsize != 1) {
        PyBuffer_Release(buffer);
        TyErr_SetString(TyExc_TypeError, "a bytes-like object is required");
        return NULL;
    }
    n = buffer->len;
    if (n % itemsize != 0) {
        PyBuffer_Release(buffer);
        TyErr_SetString(TyExc_ValueError,
                   "bytes length not a multiple of item size");
        return NULL;
    }
    n = n / itemsize;
    if (n > 0) {
        Ty_ssize_t old_size = Ty_SIZE(self);
        if ((n > PY_SSIZE_T_MAX - old_size) ||
            ((old_size + n) > PY_SSIZE_T_MAX / itemsize)) {
                PyBuffer_Release(buffer);
                return TyErr_NoMemory();
        }
        if (array_resize(self, old_size + n) == -1) {
            PyBuffer_Release(buffer);
            return NULL;
        }
        memcpy(self->ob_item + old_size * itemsize,
            buffer->buf, n * itemsize);
    }
    PyBuffer_Release(buffer);
    Py_RETURN_NONE;
}

/*[clinic input]
array.array.frombytes

    buffer: Ty_buffer
    /

Appends items from the string, interpreting it as an array of machine values, as if it had been read from a file using the fromfile() method.
[clinic start generated code]*/

static TyObject *
array_array_frombytes_impl(arrayobject *self, Ty_buffer *buffer)
/*[clinic end generated code: output=d9842c8f7510a516 input=378db226dfac949e]*/
{
    return frombytes(self, buffer);
}

/*[clinic input]
array.array.tobytes

Convert the array to an array of machine values and return the bytes representation.
[clinic start generated code]*/

static TyObject *
array_array_tobytes_impl(arrayobject *self)
/*[clinic end generated code: output=87318e4edcdc2bb6 input=90ee495f96de34f5]*/
{
    if (Ty_SIZE(self) <= PY_SSIZE_T_MAX / self->ob_descr->itemsize) {
        return TyBytes_FromStringAndSize(self->ob_item,
                            Ty_SIZE(self) * self->ob_descr->itemsize);
    } else {
        return TyErr_NoMemory();
    }
}

/*[clinic input]
array.array.fromunicode

    ustr: unicode
    /

Extends this array with data from the unicode string ustr.

The array must be a unicode type array; otherwise a ValueError is raised.
Use array.frombytes(ustr.encode(...)) to append Unicode data to an array of
some other type.
[clinic start generated code]*/

static TyObject *
array_array_fromunicode_impl(arrayobject *self, TyObject *ustr)
/*[clinic end generated code: output=24359f5e001a7f2b input=025db1fdade7a4ce]*/
{
    int typecode = self->ob_descr->typecode;
    if (typecode != 'u' && typecode != 'w') {
        TyErr_SetString(TyExc_ValueError,
            "fromunicode() may only be called on "
            "unicode type arrays ('u' or 'w')");
        return NULL;
    }

    if (typecode == 'u') {
        Ty_ssize_t ustr_length = TyUnicode_AsWideChar(ustr, NULL, 0);
        assert(ustr_length > 0);
        if (ustr_length > 1) {
            ustr_length--; /* trim trailing NUL character */
            Ty_ssize_t old_size = Ty_SIZE(self);
            if (array_resize(self, old_size + ustr_length) == -1) {
                return NULL;
            }

            // must not fail
            TyUnicode_AsWideChar(
                ustr, ((wchar_t *)self->ob_item) + old_size, ustr_length);
        }
    }
    else { // typecode == 'w'
        Ty_ssize_t ustr_length = TyUnicode_GetLength(ustr);
        Ty_ssize_t old_size = Ty_SIZE(self);
        Ty_ssize_t new_size = old_size + ustr_length;

        if (new_size < 0 || (size_t)new_size > PY_SSIZE_T_MAX / sizeof(Ty_UCS4)) {
            return TyErr_NoMemory();
        }
        if (array_resize(self, new_size) == -1) {
            return NULL;
        }

        // must not fail
        Ty_UCS4 *u = TyUnicode_AsUCS4(ustr, ((Ty_UCS4*)self->ob_item) + old_size,
                                      ustr_length, 0);
        assert(u != NULL);
        (void)u; // Suppress unused_variable warning.
    }

    Py_RETURN_NONE;
}

/*[clinic input]
array.array.tounicode

Extends this array with data from the unicode string ustr.

Convert the array to a unicode string.  The array must be a unicode type array;
otherwise a ValueError is raised.  Use array.tobytes().decode() to obtain a
unicode string from an array of some other type.
[clinic start generated code]*/

static TyObject *
array_array_tounicode_impl(arrayobject *self)
/*[clinic end generated code: output=08e442378336e1ef input=127242eebe70b66d]*/
{
    int typecode = self->ob_descr->typecode;
    if (typecode != 'u' && typecode != 'w') {
        TyErr_SetString(TyExc_ValueError,
             "tounicode() may only be called on unicode type arrays ('u' or 'w')");
        return NULL;
    }
    if (typecode == 'u') {
        return TyUnicode_FromWideChar((wchar_t *) self->ob_item, Ty_SIZE(self));
    }
    else { // typecode == 'w'
        int byteorder = 0; // native byteorder
        return TyUnicode_DecodeUTF32((const char *) self->ob_item, Ty_SIZE(self) * 4,
                                     NULL, &byteorder);
    }
}

/*[clinic input]
array.array.__sizeof__

Size of the array in memory, in bytes.
[clinic start generated code]*/

static TyObject *
array_array___sizeof___impl(arrayobject *self)
/*[clinic end generated code: output=d8e1c61ebbe3eaed input=805586565bf2b3c6]*/
{
    size_t res = _TyObject_SIZE(Ty_TYPE(self));
    res += (size_t)self->allocated * (size_t)self->ob_descr->itemsize;
    return TyLong_FromSize_t(res);
}


/*********************** Pickling support ************************/

static const struct mformatdescr {
    size_t size;
    int is_signed;
    int is_big_endian;
} mformat_descriptors[] = {
    {1, 0, 0},                  /* 0: UNSIGNED_INT8 */
    {1, 1, 0},                  /* 1: SIGNED_INT8 */
    {2, 0, 0},                  /* 2: UNSIGNED_INT16_LE */
    {2, 0, 1},                  /* 3: UNSIGNED_INT16_BE */
    {2, 1, 0},                  /* 4: SIGNED_INT16_LE */
    {2, 1, 1},                  /* 5: SIGNED_INT16_BE */
    {4, 0, 0},                  /* 6: UNSIGNED_INT32_LE */
    {4, 0, 1},                  /* 7: UNSIGNED_INT32_BE */
    {4, 1, 0},                  /* 8: SIGNED_INT32_LE */
    {4, 1, 1},                  /* 9: SIGNED_INT32_BE */
    {8, 0, 0},                  /* 10: UNSIGNED_INT64_LE */
    {8, 0, 1},                  /* 11: UNSIGNED_INT64_BE */
    {8, 1, 0},                  /* 12: SIGNED_INT64_LE */
    {8, 1, 1},                  /* 13: SIGNED_INT64_BE */
    {4, 0, 0},                  /* 14: IEEE_754_FLOAT_LE */
    {4, 0, 1},                  /* 15: IEEE_754_FLOAT_BE */
    {8, 0, 0},                  /* 16: IEEE_754_DOUBLE_LE */
    {8, 0, 1},                  /* 17: IEEE_754_DOUBLE_BE */
    {4, 0, 0},                  /* 18: UTF16_LE */
    {4, 0, 1},                  /* 19: UTF16_BE */
    {8, 0, 0},                  /* 20: UTF32_LE */
    {8, 0, 1}                   /* 21: UTF32_BE */
};


/*
 * Internal: This function is used to find the machine format of a given
 * array type code. This returns UNKNOWN_FORMAT when the machine format cannot
 * be found.
 */
static enum machine_format_code
typecode_to_mformat_code(char typecode)
{
    const int is_big_endian = PY_BIG_ENDIAN;

    size_t intsize;
    int is_signed;

    switch (typecode) {
    case 'b':
        return SIGNED_INT8;
    case 'B':
        return UNSIGNED_INT8;

    case 'u':
        if (sizeof(wchar_t) == 2) {
            return UTF16_LE + is_big_endian;
        }
        if (sizeof(wchar_t) == 4) {
            return UTF32_LE + is_big_endian;
        }
        return UNKNOWN_FORMAT;

    case 'w':
        return UTF32_LE + is_big_endian;

    case 'f':
        if (sizeof(float) == 4) {
            const float y = 16711938.0;
            if (memcmp(&y, "\x4b\x7f\x01\x02", 4) == 0)
                return IEEE_754_FLOAT_BE;
            if (memcmp(&y, "\x02\x01\x7f\x4b", 4) == 0)
                return IEEE_754_FLOAT_LE;
        }
        return UNKNOWN_FORMAT;

    case 'd':
        if (sizeof(double) == 8) {
            const double x = 9006104071832581.0;
            if (memcmp(&x, "\x43\x3f\xff\x01\x02\x03\x04\x05", 8) == 0)
                return IEEE_754_DOUBLE_BE;
            if (memcmp(&x, "\x05\x04\x03\x02\x01\xff\x3f\x43", 8) == 0)
                return IEEE_754_DOUBLE_LE;
        }
        return UNKNOWN_FORMAT;

    /* Integers */
    case 'h':
        intsize = sizeof(short);
        is_signed = 1;
        break;
    case 'H':
        intsize = sizeof(short);
        is_signed = 0;
        break;
    case 'i':
        intsize = sizeof(int);
        is_signed = 1;
        break;
    case 'I':
        intsize = sizeof(int);
        is_signed = 0;
        break;
    case 'l':
        intsize = sizeof(long);
        is_signed = 1;
        break;
    case 'L':
        intsize = sizeof(long);
        is_signed = 0;
        break;
    case 'q':
        intsize = sizeof(long long);
        is_signed = 1;
        break;
    case 'Q':
        intsize = sizeof(long long);
        is_signed = 0;
        break;
    default:
        return UNKNOWN_FORMAT;
    }
    switch (intsize) {
    case 2:
        return UNSIGNED_INT16_LE + is_big_endian + (2 * is_signed);
    case 4:
        return UNSIGNED_INT32_LE + is_big_endian + (2 * is_signed);
    case 8:
        return UNSIGNED_INT64_LE + is_big_endian + (2 * is_signed);
    default:
        return UNKNOWN_FORMAT;
    }
}

/* Forward declaration. */
static TyObject *array_new(TyTypeObject *type, TyObject *args, TyObject *kwds);

/*
 * Internal: This function wraps the array constructor--i.e., array_new()--to
 * allow the creation of array objects from C code without having to deal
 * directly the tuple argument of array_new(). The typecode argument is a
 * Unicode character value, like 'i' or 'f' for example, representing an array
 * type code. The items argument is a bytes or a list object from which
 * contains the initial value of the array.
 *
 * On success, this functions returns the array object created. Otherwise,
 * NULL is returned to indicate a failure.
 */
static TyObject *
make_array(TyTypeObject *arraytype, char typecode, TyObject *items)
{
    TyObject *new_args;
    TyObject *array_obj;
    TyObject *typecode_obj;

    assert(arraytype != NULL);
    assert(items != NULL);

    typecode_obj = TyUnicode_FromOrdinal(typecode);
    if (typecode_obj == NULL)
        return NULL;

    new_args = TyTuple_New(2);
    if (new_args == NULL) {
        Ty_DECREF(typecode_obj);
        return NULL;
    }
    TyTuple_SET_ITEM(new_args, 0, typecode_obj);
    TyTuple_SET_ITEM(new_args, 1, Ty_NewRef(items));

    array_obj = array_new(arraytype, new_args, NULL);
    Ty_DECREF(new_args);
    if (array_obj == NULL)
        return NULL;

    return array_obj;
}

/*
 * This functions is a special constructor used when unpickling an array. It
 * provides a portable way to rebuild an array from its memory representation.
 */
/*[clinic input]
array._array_reconstructor

    arraytype: object(type="TyTypeObject *")
    typecode: int(accept={str})
    mformat_code: int(type="enum machine_format_code")
    items: object
    /

Internal. Used for pickling support.
[clinic start generated code]*/

static TyObject *
array__array_reconstructor_impl(TyObject *module, TyTypeObject *arraytype,
                                int typecode,
                                enum machine_format_code mformat_code,
                                TyObject *items)
/*[clinic end generated code: output=e05263141ba28365 input=2464dc8f4c7736b5]*/
{
    array_state *state = get_array_state(module);
    TyObject *converted_items;
    TyObject *result;
    const struct arraydescr *descr;

    if (!TyType_Check(arraytype)) {
        TyErr_Format(TyExc_TypeError,
            "first argument must be a type object, not %.200s",
            Ty_TYPE(arraytype)->tp_name);
        return NULL;
    }
    if (!TyType_IsSubtype(arraytype, state->ArrayType)) {
        TyErr_Format(TyExc_TypeError,
            "%.200s is not a subtype of %.200s",
            arraytype->tp_name, state->ArrayType->tp_name);
        return NULL;
    }
    for (descr = descriptors; descr->typecode != '\0'; descr++) {
        if ((int)descr->typecode == typecode)
            break;
    }
    if (descr->typecode == '\0') {
        TyErr_SetString(TyExc_ValueError,
                        "second argument must be a valid type code");
        return NULL;
    }
    if (mformat_code < MACHINE_FORMAT_CODE_MIN ||
        mformat_code > MACHINE_FORMAT_CODE_MAX) {
        TyErr_SetString(TyExc_ValueError,
            "third argument must be a valid machine format code.");
        return NULL;
    }
    if (!TyBytes_Check(items)) {
        TyErr_Format(TyExc_TypeError,
            "fourth argument should be bytes, not %.200s",
            Ty_TYPE(items)->tp_name);
        return NULL;
    }

    /* Fast path: No decoding has to be done. */
    if (mformat_code == typecode_to_mformat_code((char)typecode) ||
        mformat_code == UNKNOWN_FORMAT) {
        return make_array(arraytype, (char)typecode, items);
    }

    /* Slow path: Decode the byte string according to the given machine
     * format code. This occurs when the computer unpickling the array
     * object is architecturally different from the one that pickled the
     * array.
     */
    if (Ty_SIZE(items) % mformat_descriptors[mformat_code].size != 0) {
        TyErr_SetString(TyExc_ValueError,
                        "string length not a multiple of item size");
        return NULL;
    }
    switch (mformat_code) {
    case IEEE_754_FLOAT_LE:
    case IEEE_754_FLOAT_BE: {
        Ty_ssize_t i;
        int le = (mformat_code == IEEE_754_FLOAT_LE) ? 1 : 0;
        Ty_ssize_t itemcount = Ty_SIZE(items) / 4;
        const char *memstr = TyBytes_AS_STRING(items);

        converted_items = TyList_New(itemcount);
        if (converted_items == NULL)
            return NULL;
        for (i = 0; i < itemcount; i++) {
            TyObject *pyfloat = TyFloat_FromDouble(
                TyFloat_Unpack4(&memstr[i * 4], le));
            if (pyfloat == NULL) {
                Ty_DECREF(converted_items);
                return NULL;
            }
            TyList_SET_ITEM(converted_items, i, pyfloat);
        }
        break;
    }
    case IEEE_754_DOUBLE_LE:
    case IEEE_754_DOUBLE_BE: {
        Ty_ssize_t i;
        int le = (mformat_code == IEEE_754_DOUBLE_LE) ? 1 : 0;
        Ty_ssize_t itemcount = Ty_SIZE(items) / 8;
        const char *memstr = TyBytes_AS_STRING(items);

        converted_items = TyList_New(itemcount);
        if (converted_items == NULL)
            return NULL;
        for (i = 0; i < itemcount; i++) {
            TyObject *pyfloat = TyFloat_FromDouble(
                TyFloat_Unpack8(&memstr[i * 8], le));
            if (pyfloat == NULL) {
                Ty_DECREF(converted_items);
                return NULL;
            }
            TyList_SET_ITEM(converted_items, i, pyfloat);
        }
        break;
    }
    case UTF16_LE:
    case UTF16_BE: {
        int byteorder = (mformat_code == UTF16_LE) ? -1 : 1;
        converted_items = TyUnicode_DecodeUTF16(
            TyBytes_AS_STRING(items), Ty_SIZE(items),
            "strict", &byteorder);
        if (converted_items == NULL)
            return NULL;
        break;
    }
    case UTF32_LE:
    case UTF32_BE: {
        int byteorder = (mformat_code == UTF32_LE) ? -1 : 1;
        converted_items = TyUnicode_DecodeUTF32(
            TyBytes_AS_STRING(items), Ty_SIZE(items),
            "strict", &byteorder);
        if (converted_items == NULL)
            return NULL;
        break;
    }

    case UNSIGNED_INT8:
    case SIGNED_INT8:
    case UNSIGNED_INT16_LE:
    case UNSIGNED_INT16_BE:
    case SIGNED_INT16_LE:
    case SIGNED_INT16_BE:
    case UNSIGNED_INT32_LE:
    case UNSIGNED_INT32_BE:
    case SIGNED_INT32_LE:
    case SIGNED_INT32_BE:
    case UNSIGNED_INT64_LE:
    case UNSIGNED_INT64_BE:
    case SIGNED_INT64_LE:
    case SIGNED_INT64_BE: {
        Ty_ssize_t i;
        const struct mformatdescr mf_descr =
            mformat_descriptors[mformat_code];
        Ty_ssize_t itemcount = Ty_SIZE(items) / mf_descr.size;
        const unsigned char *memstr =
            (unsigned char *)TyBytes_AS_STRING(items);
        const struct arraydescr *descr;

        /* If possible, try to pack array's items using a data type
         * that fits better. This may result in an array with narrower
         * or wider elements.
         *
         * For example, if a 32-bit machine pickles an L-code array of
         * unsigned longs, then the array will be unpickled by 64-bit
         * machine as an I-code array of unsigned ints.
         *
         * XXX: Is it possible to write a unit test for this?
         */
        for (descr = descriptors; descr->typecode != '\0'; descr++) {
            if (descr->is_integer_type &&
                (size_t)descr->itemsize == mf_descr.size &&
                descr->is_signed == mf_descr.is_signed)
                typecode = descr->typecode;
        }

        converted_items = TyList_New(itemcount);
        if (converted_items == NULL)
            return NULL;
        for (i = 0; i < itemcount; i++) {
            TyObject *pylong;

            pylong = _TyLong_FromByteArray(
                &memstr[i * mf_descr.size],
                mf_descr.size,
                !mf_descr.is_big_endian,
                mf_descr.is_signed);
            if (pylong == NULL) {
                Ty_DECREF(converted_items);
                return NULL;
            }
            TyList_SET_ITEM(converted_items, i, pylong);
        }
        break;
    }
    case UNKNOWN_FORMAT:
        /* Impossible, but needed to shut up GCC about the unhandled
         * enumeration value.
         */
    default:
        TyErr_BadArgument();
        return NULL;
    }

    result = make_array(arraytype, (char)typecode, converted_items);
    Ty_DECREF(converted_items);
    return result;
}

/*[clinic input]
array.array.__reduce_ex__

    cls: defining_class
    value: object
    /

Return state information for pickling.
[clinic start generated code]*/

static TyObject *
array_array___reduce_ex___impl(arrayobject *self, TyTypeObject *cls,
                               TyObject *value)
/*[clinic end generated code: output=4958ee5d79452ad5 input=19968cf0f91d3eea]*/
{
    TyObject *dict;
    TyObject *result;
    TyObject *array_str;
    int typecode = self->ob_descr->typecode;
    int mformat_code;
    long protocol;

    array_state *state = get_array_state_by_class(cls);
    assert(state != NULL);

    if (state->array_reconstructor == NULL) {
        state->array_reconstructor = TyImport_ImportModuleAttrString(
                "array", "_array_reconstructor");
        if (state->array_reconstructor == NULL) {
            return NULL;
        }
    }

    if (!TyLong_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "__reduce_ex__ argument should be an integer");
        return NULL;
    }
    protocol = TyLong_AsLong(value);
    if (protocol == -1 && TyErr_Occurred())
        return NULL;

    if (PyObject_GetOptionalAttr((TyObject *)self, state->str___dict__, &dict) < 0) {
        return NULL;
    }
    if (dict == NULL) {
        dict = Ty_NewRef(Ty_None);
    }

    mformat_code = typecode_to_mformat_code(typecode);
    if (mformat_code == UNKNOWN_FORMAT || protocol < 3) {
        /* Convert the array to a list if we got something weird
         * (e.g., non-IEEE floats), or we are pickling the array using
         * a Python 2.x compatible protocol.
         *
         * It is necessary to use a list representation for Python 2.x
         * compatible pickle protocol, since Python 2's str objects
         * are unpickled as unicode by Python 3. Thus it is impossible
         * to make arrays unpicklable by Python 3 by using their memory
         * representation, unless we resort to ugly hacks such as
         * coercing unicode objects to bytes in array_reconstructor.
         */
        TyObject *list;
        list = array_array_tolist_impl(self);
        if (list == NULL) {
            Ty_DECREF(dict);
            return NULL;
        }
        result = Ty_BuildValue(
            "O(CO)O", Ty_TYPE(self), typecode, list, dict);
        Ty_DECREF(list);
        Ty_DECREF(dict);
        return result;
    }

    array_str = array_array_tobytes_impl(self);
    if (array_str == NULL) {
        Ty_DECREF(dict);
        return NULL;
    }

    assert(state->array_reconstructor != NULL);
    result = Ty_BuildValue(
        "O(OCiN)O", state->array_reconstructor, Ty_TYPE(self), typecode,
        mformat_code, array_str, dict);
    Ty_DECREF(dict);
    return result;
}

static TyObject *
array_get_typecode(TyObject *op, void *Py_UNUSED(closure))
{
    arrayobject *a = arrayobject_CAST(op);
    char typecode = a->ob_descr->typecode;
    return TyUnicode_FromOrdinal(typecode);
}

static TyObject *
array_get_itemsize(TyObject *op, void *Py_UNUSED(closure))
{
    arrayobject *a = arrayobject_CAST(op);
    return TyLong_FromLong((long)a->ob_descr->itemsize);
}

static TyGetSetDef array_getsets [] = {
    {"typecode", array_get_typecode, NULL,
     "the typecode character used to create the array"},
    {"itemsize", array_get_itemsize, NULL,
     "the size, in bytes, of one array item"},
    {NULL}
};

static TyMethodDef array_methods[] = {
    ARRAY_ARRAY_APPEND_METHODDEF
    ARRAY_ARRAY_BUFFER_INFO_METHODDEF
    ARRAY_ARRAY_BYTESWAP_METHODDEF
    ARRAY_ARRAY_CLEAR_METHODDEF
    ARRAY_ARRAY___COPY___METHODDEF
    ARRAY_ARRAY_COUNT_METHODDEF
    ARRAY_ARRAY___DEEPCOPY___METHODDEF
    ARRAY_ARRAY_EXTEND_METHODDEF
    ARRAY_ARRAY_FROMFILE_METHODDEF
    ARRAY_ARRAY_FROMLIST_METHODDEF
    ARRAY_ARRAY_FROMBYTES_METHODDEF
    ARRAY_ARRAY_FROMUNICODE_METHODDEF
    ARRAY_ARRAY_INDEX_METHODDEF
    ARRAY_ARRAY_INSERT_METHODDEF
    ARRAY_ARRAY_POP_METHODDEF
    ARRAY_ARRAY___REDUCE_EX___METHODDEF
    ARRAY_ARRAY_REMOVE_METHODDEF
    ARRAY_ARRAY_REVERSE_METHODDEF
    ARRAY_ARRAY_TOFILE_METHODDEF
    ARRAY_ARRAY_TOLIST_METHODDEF
    ARRAY_ARRAY_TOBYTES_METHODDEF
    ARRAY_ARRAY_TOUNICODE_METHODDEF
    ARRAY_ARRAY___SIZEOF___METHODDEF
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL, NULL}  /* sentinel */
};

static TyObject *
array_repr(TyObject *op)
{
    char typecode;
    TyObject *s, *v = NULL;
    Ty_ssize_t len;
    arrayobject *a = arrayobject_CAST(op);

    len = Ty_SIZE(a);
    typecode = a->ob_descr->typecode;
    if (len == 0) {
        return TyUnicode_FromFormat("%s('%c')",
                                    _TyType_Name(Ty_TYPE(a)), (int)typecode);
    }
    if (typecode == 'u' || typecode == 'w') {
        v = array_array_tounicode_impl(a);
    } else {
        v = array_array_tolist_impl(a);
    }
    if (v == NULL)
        return NULL;

    s = TyUnicode_FromFormat("%s('%c', %R)",
                             _TyType_Name(Ty_TYPE(a)), (int)typecode, v);
    Ty_DECREF(v);
    return s;
}

static TyObject*
array_subscr(TyObject *op, TyObject *item)
{
    arrayobject *self = arrayobject_CAST(op);
    array_state *state = find_array_state_by_type(Ty_TYPE(self));

    if (PyIndex_Check(item)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(item, TyExc_IndexError);
        if (i==-1 && TyErr_Occurred()) {
            return NULL;
        }
        if (i < 0)
            i += Ty_SIZE(self);
        return array_item(op, i);
    }
    else if (TySlice_Check(item)) {
        Ty_ssize_t start, stop, step, slicelength, i;
        size_t cur;
        TyObject* result;
        arrayobject* ar;
        int itemsize = self->ob_descr->itemsize;

        if (TySlice_Unpack(item, &start, &stop, &step) < 0) {
            return NULL;
        }
        slicelength = TySlice_AdjustIndices(Ty_SIZE(self), &start, &stop,
                                            step);

        if (slicelength <= 0) {
            return newarrayobject(state->ArrayType, 0, self->ob_descr);
        }
        else if (step == 1) {
            TyObject *result = newarrayobject(state->ArrayType,
                                    slicelength, self->ob_descr);
            if (result == NULL)
                return NULL;
            memcpy(((arrayobject *)result)->ob_item,
                   self->ob_item + start * itemsize,
                   slicelength * itemsize);
            return result;
        }
        else {
            result = newarrayobject(state->ArrayType, slicelength, self->ob_descr);
            if (!result) return NULL;

            ar = (arrayobject*)result;

            for (cur = start, i = 0; i < slicelength;
                 cur += step, i++) {
                memcpy(ar->ob_item + i*itemsize,
                       self->ob_item + cur*itemsize,
                       itemsize);
            }

            return result;
        }
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "array indices must be integers");
        return NULL;
    }
}

static int
array_ass_subscr(TyObject *op, TyObject *item, TyObject *value)
{
    Ty_ssize_t start, stop, step, slicelength, needed;
    arrayobject *self = arrayobject_CAST(op);
    array_state* state = find_array_state_by_type(Ty_TYPE(self));
    arrayobject* other;
    int itemsize;

    if (PyIndex_Check(item)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(item, TyExc_IndexError);

        if (i == -1 && TyErr_Occurred())
            return -1;
        if (i < 0)
            i += Ty_SIZE(self);
        if (i < 0 || i >= Ty_SIZE(self)) {
            TyErr_SetString(TyExc_IndexError,
                "array assignment index out of range");
            return -1;
        }
        if (value == NULL) {
            /* Fall through to slice assignment */
            start = i;
            stop = i + 1;
            step = 1;
            slicelength = 1;
        }
        else
            return (*self->ob_descr->setitem)(self, i, value);
    }
    else if (TySlice_Check(item)) {
        if (TySlice_Unpack(item, &start, &stop, &step) < 0) {
            return -1;
        }
        slicelength = TySlice_AdjustIndices(Ty_SIZE(self), &start, &stop,
                                            step);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "array indices must be integers");
        return -1;
    }
    if (value == NULL) {
        other = NULL;
        needed = 0;
    }
    else if (array_Check(value, state)) {
        other = (arrayobject *)value;
        needed = Ty_SIZE(other);
        if (self == other) {
            /* Special case "self[i:j] = self" -- copy self first */
            int ret;
            value = array_slice(other, 0, needed);
            if (value == NULL)
                return -1;
            ret = array_ass_subscr(op, item, value);
            Ty_DECREF(value);
            return ret;
        }
        if (other->ob_descr != self->ob_descr) {
            TyErr_BadArgument();
            return -1;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
         "can only assign array (not \"%.200s\") to array slice",
                         Ty_TYPE(value)->tp_name);
        return -1;
    }
    itemsize = self->ob_descr->itemsize;
    /* for 'a[2:1] = ...', the insertion point is 'start', not 'stop' */
    if ((step > 0 && stop < start) ||
        (step < 0 && stop > start))
        stop = start;

    /* Issue #4509: If the array has exported buffers and the slice
       assignment would change the size of the array, fail early to make
       sure we don't modify it. */
    if ((needed == 0 || slicelength != needed) && self->ob_exports > 0) {
        TyErr_SetString(TyExc_BufferError,
            "cannot resize an array that is exporting buffers");
        return -1;
    }

    if (step == 1) {
        if (slicelength > needed) {
            memmove(self->ob_item + (start + needed) * itemsize,
                self->ob_item + stop * itemsize,
                (Ty_SIZE(self) - stop) * itemsize);
            if (array_resize(self, Ty_SIZE(self) +
                needed - slicelength) < 0)
                return -1;
        }
        else if (slicelength < needed) {
            if (array_resize(self, Ty_SIZE(self) +
                needed - slicelength) < 0)
                return -1;
            memmove(self->ob_item + (start + needed) * itemsize,
                self->ob_item + stop * itemsize,
                (Ty_SIZE(self) - start - needed) * itemsize);
        }
        if (needed > 0)
            memcpy(self->ob_item + start * itemsize,
                   other->ob_item, needed * itemsize);
        return 0;
    }
    else if (needed == 0) {
        /* Delete slice */
        size_t cur;
        Ty_ssize_t i;

        if (step < 0) {
            stop = start + 1;
            start = stop + step * (slicelength - 1) - 1;
            step = -step;
        }
        for (cur = start, i = 0; i < slicelength;
             cur += step, i++) {
            Ty_ssize_t lim = step - 1;

            if (cur + step >= (size_t)Ty_SIZE(self))
                lim = Ty_SIZE(self) - cur - 1;
            memmove(self->ob_item + (cur - i) * itemsize,
                self->ob_item + (cur + 1) * itemsize,
                lim * itemsize);
        }
        cur = start + (size_t)slicelength * step;
        if (cur < (size_t)Ty_SIZE(self)) {
            memmove(self->ob_item + (cur-slicelength) * itemsize,
                self->ob_item + cur * itemsize,
                (Ty_SIZE(self) - cur) * itemsize);
        }
        if (array_resize(self, Ty_SIZE(self) - slicelength) < 0)
            return -1;
        return 0;
    }
    else {
        size_t cur;
        Ty_ssize_t i;

        if (needed != slicelength) {
            TyErr_Format(TyExc_ValueError,
                "attempt to assign array of size %zd "
                "to extended slice of size %zd",
                needed, slicelength);
            return -1;
        }
        for (cur = start, i = 0; i < slicelength;
             cur += step, i++) {
            memcpy(self->ob_item + cur * itemsize,
                   other->ob_item + i * itemsize,
                   itemsize);
        }
        return 0;
    }
}

static const void *emptybuf = "";


static int
array_buffer_getbuf(TyObject *op, Ty_buffer *view, int flags)
{
    if (view == NULL) {
        TyErr_SetString(TyExc_BufferError,
            "array_buffer_getbuf: view==NULL argument is obsolete");
        return -1;
    }

    arrayobject *self = arrayobject_CAST(op);
    view->buf = (void *)self->ob_item;
    view->obj = Ty_NewRef(self);
    if (view->buf == NULL)
        view->buf = (void *)emptybuf;
    view->len = Ty_SIZE(self) * self->ob_descr->itemsize;
    view->readonly = 0;
    view->ndim = 1;
    view->itemsize = self->ob_descr->itemsize;
    view->suboffsets = NULL;
    view->shape = NULL;
    if ((flags & PyBUF_ND)==PyBUF_ND) {
        view->shape = &((TyVarObject*)self)->ob_size;
    }
    view->strides = NULL;
    if ((flags & PyBUF_STRIDES)==PyBUF_STRIDES)
        view->strides = &(view->itemsize);
    view->format = NULL;
    view->internal = NULL;
    if ((flags & PyBUF_FORMAT) == PyBUF_FORMAT) {
        view->format = (char *)self->ob_descr->formats;
#ifdef Ty_UNICODE_WIDE
        if (self->ob_descr->typecode == 'u') {
            view->format = "w";
        }
#endif
    }

    self->ob_exports++;
    return 0;
}

static void
array_buffer_relbuf(TyObject *op, Ty_buffer *Py_UNUSED(view))
{
    arrayobject *self = arrayobject_CAST(op);
    self->ob_exports--;
}

static TyObject *
array_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    array_state *state = find_array_state_by_type(type);
    int c;
    TyObject *initial = NULL, *it = NULL;
    const struct arraydescr *descr;

    if ((type == state->ArrayType ||
         type->tp_init == state->ArrayType->tp_init) &&
        !_TyArg_NoKeywords("array.array", kwds))
        return NULL;

    if (!TyArg_ParseTuple(args, "C|O:array", &c, &initial))
        return NULL;

    if (TySys_Audit("array.__new__", "CO",
                    c, initial ? initial : Ty_None) < 0) {
        return NULL;
    }

    if (c == 'u') {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                         "The 'u' type code is deprecated and "
                         "will be removed in Python 3.16",
                         1)) {
            return NULL;
        }
    }

    bool is_unicode = c == 'u' || c == 'w';

    if (initial && !is_unicode) {
        if (TyUnicode_Check(initial)) {
            TyErr_Format(TyExc_TypeError, "cannot use a str to initialize "
                         "an array with typecode '%c'", c);
            return NULL;
        }
        else if (array_Check(initial, state)) {
            int ic = ((arrayobject*)initial)->ob_descr->typecode;
            if (ic == 'u' || ic == 'w') {
                TyErr_Format(TyExc_TypeError, "cannot use a unicode array to "
                            "initialize an array with typecode '%c'", c);
                return NULL;
            }
        }
    }

    if (!(initial == NULL || TyList_Check(initial)
          || TyByteArray_Check(initial)
          || TyBytes_Check(initial)
          || TyTuple_Check(initial)
          || (is_unicode && TyUnicode_Check(initial))
          || (array_Check(initial, state)
              && c == ((arrayobject*)initial)->ob_descr->typecode))) {
        it = PyObject_GetIter(initial);
        if (it == NULL)
            return NULL;
        /* We set initial to NULL so that the subsequent code
           will create an empty array of the appropriate type
           and afterwards we can use array_iter_extend to populate
           the array.
        */
        initial = NULL;
    }
    for (descr = descriptors; descr->typecode != '\0'; descr++) {
        if (descr->typecode == c) {
            TyObject *a;
            Ty_ssize_t len;

            if (initial == NULL)
                len = 0;
            else if (TyList_Check(initial))
                len = TyList_GET_SIZE(initial);
            else if (TyTuple_Check(initial) || array_Check(initial, state))
                len = Ty_SIZE(initial);
            else
                len = 0;

            a = newarrayobject(type, len, descr);
            if (a == NULL)
                return NULL;

            if (len > 0 && !array_Check(initial, state)) {
                Ty_ssize_t i;
                for (i = 0; i < len; i++) {
                    TyObject *v =
                        PySequence_GetItem(initial, i);
                    if (v == NULL) {
                        Ty_DECREF(a);
                        return NULL;
                    }
                    if (setarrayitem(a, i, v) != 0) {
                        Ty_DECREF(v);
                        Ty_DECREF(a);
                        return NULL;
                    }
                    Ty_DECREF(v);
                }
            }
            else if (initial != NULL && (TyByteArray_Check(initial) ||
                               TyBytes_Check(initial))) {
                TyObject *v;
                v = array_array_frombytes((TyObject *)a, initial);
                if (v == NULL) {
                    Ty_DECREF(a);
                    return NULL;
                }
                Ty_DECREF(v);
            }
            else if (initial != NULL && TyUnicode_Check(initial))  {
                if (c == 'u') {
                    Ty_ssize_t n;
                    wchar_t *ustr = TyUnicode_AsWideCharString(initial, &n);
                    if (ustr == NULL) {
                        Ty_DECREF(a);
                        return NULL;
                    }

                    if (n > 0) {
                        arrayobject *self = (arrayobject *)a;
                        // self->ob_item may be NULL but it is safe.
                        TyMem_Free(self->ob_item);
                        self->ob_item = (char *)ustr;
                        Ty_SET_SIZE(self, n);
                        self->allocated = n;
                    }
                }
                else { // c == 'w'
                    Ty_ssize_t n = TyUnicode_GET_LENGTH(initial);
                    Ty_UCS4 *ustr = TyUnicode_AsUCS4Copy(initial);
                    if (ustr == NULL) {
                        Ty_DECREF(a);
                        return NULL;
                    }

                    arrayobject *self = (arrayobject *)a;
                    // self->ob_item may be NULL but it is safe.
                    TyMem_Free(self->ob_item);
                    self->ob_item = (char *)ustr;
                    Ty_SET_SIZE(self, n);
                    self->allocated = n;
                }
            }
            else if (initial != NULL && array_Check(initial, state) && len > 0) {
                arrayobject *self = (arrayobject *)a;
                arrayobject *other = (arrayobject *)initial;
                memcpy(self->ob_item, other->ob_item, len * other->ob_descr->itemsize);
            }
            if (it != NULL) {
                if (array_iter_extend((arrayobject *)a, it) == -1) {
                    Ty_DECREF(it);
                    Ty_DECREF(a);
                    return NULL;
                }
                Ty_DECREF(it);
            }
            return a;
        }
    }
    TyErr_SetString(TyExc_ValueError,
        "bad typecode (must be b, B, u, w, h, H, i, I, l, L, q, Q, f or d)");
    return NULL;
}


TyDoc_STRVAR(module_doc,
"This module defines an object type which can efficiently represent\n\
an array of basic values: characters, integers, floating-point\n\
numbers.  Arrays are sequence types and behave very much like lists,\n\
except that the type of objects stored in them is constrained.\n");

TyDoc_STRVAR(arraytype_doc,
"array(typecode [, initializer]) -> array\n\
\n\
Return a new array whose items are restricted by typecode, and\n\
initialized from the optional initializer value, which must be a list,\n\
string or iterable over elements of the appropriate type.\n\
\n\
Arrays represent basic values and behave very much like lists, except\n\
the type of objects stored in them is constrained. The type is specified\n\
at object creation time by using a type code, which is a single character.\n\
The following type codes are defined:\n\
\n\
    Type code   C Type             Minimum size in bytes\n\
    'b'         signed integer     1\n\
    'B'         unsigned integer   1\n\
    'u'         Unicode character  2 (see note)\n\
    'h'         signed integer     2\n\
    'H'         unsigned integer   2\n\
    'i'         signed integer     2\n\
    'I'         unsigned integer   2\n\
    'l'         signed integer     4\n\
    'L'         unsigned integer   4\n\
    'q'         signed integer     8 (see note)\n\
    'Q'         unsigned integer   8 (see note)\n\
    'f'         floating-point     4\n\
    'd'         floating-point     8\n\
\n\
NOTE: The 'u' typecode corresponds to Python's unicode character. On\n\
narrow builds this is 2-bytes on wide builds this is 4-bytes.\n\
\n\
NOTE: The 'q' and 'Q' type codes are only available if the platform\n\
C compiler used to build Python supports 'long long', or, on Windows,\n\
'__int64'.\n\
\n\
Methods:\n\
\n\
append() -- append a new item to the end of the array\n\
buffer_info() -- return information giving the current memory info\n\
byteswap() -- byteswap all the items of the array\n\
count() -- return number of occurrences of an object\n\
extend() -- extend array by appending multiple elements from an iterable\n\
fromfile() -- read items from a file object\n\
fromlist() -- append items from the list\n\
frombytes() -- append items from the string\n\
index() -- return index of first occurrence of an object\n\
insert() -- insert a new item into the array at a provided position\n\
pop() -- remove and return item (default last)\n\
remove() -- remove first occurrence of an object\n\
reverse() -- reverse the order of the items in the array\n\
tofile() -- write all items to a file object\n\
tolist() -- return the array converted to an ordinary list\n\
tobytes() -- return the array converted to a string\n\
\n\
Attributes:\n\
\n\
typecode -- the typecode character used to create the array\n\
itemsize -- the length in bytes of one array item\n\
");

static TyObject *array_iter(TyObject *op);

static struct TyMemberDef array_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(arrayobject, weakreflist), Py_READONLY},
    {NULL},
};

static TyType_Slot array_slots[] = {
    {Ty_tp_dealloc, array_dealloc},
    {Ty_tp_repr, array_repr},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_doc, (void *)arraytype_doc},
    {Ty_tp_richcompare, array_richcompare},
    {Ty_tp_iter, array_iter},
    {Ty_tp_methods, array_methods},
    {Ty_tp_members, array_members},
    {Ty_tp_getset, array_getsets},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, array_new},
    {Ty_tp_traverse, array_tp_traverse},

    /* as sequence */
    {Ty_sq_length, array_length},
    {Ty_sq_concat, array_concat},
    {Ty_sq_repeat, array_repeat},
    {Ty_sq_item, array_item},
    {Ty_sq_ass_item, array_ass_item},
    {Ty_sq_contains, array_contains},
    {Ty_sq_inplace_concat, array_inplace_concat},
    {Ty_sq_inplace_repeat, array_inplace_repeat},

    /* as mapping */
    {Ty_mp_length, array_length},
    {Ty_mp_subscript, array_subscr},
    {Ty_mp_ass_subscript, array_ass_subscr},

    /* as buffer */
    {Ty_bf_getbuffer, array_buffer_getbuf},
    {Ty_bf_releasebuffer, array_buffer_relbuf},

    {0, NULL},
};

static TyType_Spec array_spec = {
    .name = "array.array",
    .basicsize = sizeof(arrayobject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_SEQUENCE),
    .slots = array_slots,
};

/*********************** Array Iterator **************************/

/*[clinic input]
class array.arrayiterator "arrayiterobject *" "find_array_state_by_type(type)->ArrayIterType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=fb46d5ef98dd95ff]*/

static TyObject *
array_iter(TyObject *op)
{
    arrayobject *ao = arrayobject_CAST(op);
    array_state *state = find_array_state_by_type(Ty_TYPE(ao));
    arrayiterobject *it;

    if (!array_Check(ao, state)) {
        TyErr_BadInternalCall();
        return NULL;
    }

    it = PyObject_GC_New(arrayiterobject, state->ArrayIterType);
    if (it == NULL)
        return NULL;

    it->ao = (arrayobject*)Ty_NewRef(ao);
    it->index = 0;
    it->getitem = ao->ob_descr->getitem;
    PyObject_GC_Track(it);
    return (TyObject *)it;
}

static TyObject *
arrayiter_next(TyObject *op)
{
    arrayiterobject *it = arrayiterobject_CAST(op);
    assert(it != NULL);
#ifndef NDEBUG
    array_state *state = find_array_state_by_type(Ty_TYPE(it));
    assert(PyObject_TypeCheck(it, state->ArrayIterType));
#endif
    arrayobject *ao = it->ao;
    if (ao == NULL) {
        return NULL;
    }
#ifndef NDEBUG
    assert(array_Check(ao, state));
#endif
    if (it->index < Ty_SIZE(ao)) {
        return (*it->getitem)(ao, it->index++);
    }
    it->ao = NULL;
    Ty_DECREF(ao);
    return NULL;
}

static void
arrayiter_dealloc(TyObject *op)
{
    arrayiterobject *it = arrayiterobject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(it);
    PyObject_GC_UnTrack(it);
    Ty_XDECREF(it->ao);
    PyObject_GC_Del(it);
    Ty_DECREF(tp);
}

static int
arrayiter_traverse(TyObject *op, visitproc visit, void *arg)
{
    arrayiterobject *it = arrayiterobject_CAST(op);
    Ty_VISIT(Ty_TYPE(it));
    Ty_VISIT(it->ao);
    return 0;
}

/*[clinic input]
array.arrayiterator.__reduce__

    cls: defining_class
    /

Return state information for pickling.
[clinic start generated code]*/

static TyObject *
array_arrayiterator___reduce___impl(arrayiterobject *self, TyTypeObject *cls)
/*[clinic end generated code: output=4b032417a2c8f5e6 input=ac64e65a87ad452e]*/
{

    array_state *state = get_array_state_by_class(cls);
    assert(state != NULL);
    TyObject *func = _TyEval_GetBuiltin(state->str_iter);
    if (self->ao == NULL) {
        return Ty_BuildValue("N(())", func);
    }
    return Ty_BuildValue("N(O)n", func, self->ao, self->index);
}

/*[clinic input]
array.arrayiterator.__setstate__

    state: object
    /

Set state information for unpickling.
[clinic start generated code]*/

static TyObject *
array_arrayiterator___setstate___impl(arrayiterobject *self, TyObject *state)
/*[clinic end generated code: output=d7837ae4ac1fd8b9 input=f47d5ceda19e787b]*/
{
    Ty_ssize_t index = TyLong_AsSsize_t(state);
    if (index == -1 && TyErr_Occurred())
        return NULL;
    arrayobject *ao = self->ao;
    if (ao != NULL) {
        if (index < 0) {
            index = 0;
        }
        else if (index > Ty_SIZE(ao)) {
            index = Ty_SIZE(ao); /* iterator exhausted */
        }
        self->index = index;
    }
    Py_RETURN_NONE;
}

static TyMethodDef arrayiter_methods[] = {
    ARRAY_ARRAYITERATOR___REDUCE___METHODDEF
    ARRAY_ARRAYITERATOR___SETSTATE___METHODDEF
    {NULL, NULL} /* sentinel */
};

static TyType_Slot arrayiter_slots[] = {
    {Ty_tp_dealloc, arrayiter_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, arrayiter_traverse},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, arrayiter_next},
    {Ty_tp_methods, arrayiter_methods},
    {0, NULL},
};

static TyType_Spec arrayiter_spec = {
    .name = "array.arrayiterator",
    .basicsize = sizeof(arrayiterobject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = arrayiter_slots,
};


/*********************** Install Module **************************/

static int
array_traverse(TyObject *module, visitproc visit, void *arg)
{
    array_state *state = get_array_state(module);
    Ty_VISIT(state->ArrayType);
    Ty_VISIT(state->ArrayIterType);
    Ty_VISIT(state->array_reconstructor);
    return 0;
}

static int
array_clear(TyObject *module)
{
    array_state *state = get_array_state(module);
    Ty_CLEAR(state->ArrayType);
    Ty_CLEAR(state->ArrayIterType);
    Ty_CLEAR(state->array_reconstructor);
    Ty_CLEAR(state->str_read);
    Ty_CLEAR(state->str_write);
    Ty_CLEAR(state->str___dict__);
    Ty_CLEAR(state->str_iter);
    return 0;
}

static void
array_free(void *module)
{
    (void)array_clear((TyObject *)module);
}

/* No functions in array module. */
static TyMethodDef a_methods[] = {
    ARRAY__ARRAY_RECONSTRUCTOR_METHODDEF
    {NULL, NULL, 0, NULL}        /* Sentinel */
};

#define CREATE_TYPE(module, type, spec)                                  \
do {                                                                     \
    type = (TyTypeObject *)TyType_FromModuleAndSpec(module, spec, NULL); \
    if (type == NULL) {                                                  \
        return -1;                                                       \
    }                                                                    \
} while (0)

#define ADD_INTERNED(state, string)                      \
do {                                                     \
    TyObject *tmp = TyUnicode_InternFromString(#string); \
    if (tmp == NULL) {                                   \
        return -1;                                       \
    }                                                    \
    state->str_ ## string = tmp;                         \
} while (0)

static int
array_modexec(TyObject *m)
{
    array_state *state = get_array_state(m);
    char buffer[Ty_ARRAY_LENGTH(descriptors)], *p;
    TyObject *typecodes;
    const struct arraydescr *descr;

    state->array_reconstructor = NULL;
    /* Add interned strings */
    ADD_INTERNED(state, read);
    ADD_INTERNED(state, write);
    ADD_INTERNED(state, __dict__);
    ADD_INTERNED(state, iter);

    CREATE_TYPE(m, state->ArrayType, &array_spec);
    CREATE_TYPE(m, state->ArrayIterType, &arrayiter_spec);
    Ty_SET_TYPE(state->ArrayIterType, &TyType_Type);

    if (TyModule_AddObjectRef(m, "ArrayType",
                              (TyObject *)state->ArrayType) < 0) {
        return -1;
    }

    TyObject *mutablesequence = TyImport_ImportModuleAttrString(
            "collections.abc", "MutableSequence");
    if (!mutablesequence) {
        Ty_DECREF((TyObject *)state->ArrayType);
        return -1;
    }
    TyObject *res = PyObject_CallMethod(mutablesequence, "register", "O",
                                        (TyObject *)state->ArrayType);
    Ty_DECREF(mutablesequence);
    if (!res) {
        Ty_DECREF((TyObject *)state->ArrayType);
        return -1;
    }
    Ty_DECREF(res);

    if (TyModule_AddType(m, state->ArrayType) < 0) {
        return -1;
    }

    p = buffer;
    for (descr = descriptors; descr->typecode != '\0'; descr++) {
        *p++ = (char)descr->typecode;
    }
    typecodes = TyUnicode_DecodeASCII(buffer, p - buffer, NULL);
    if (TyModule_Add(m, "typecodes", typecodes) < 0) {
        return -1;
    }

    return 0;
}

static PyModuleDef_Slot arrayslots[] = {
    {Ty_mod_exec, array_modexec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};


static struct TyModuleDef arraymodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "array",
    .m_size = sizeof(array_state),
    .m_doc = module_doc,
    .m_methods = a_methods,
    .m_slots = arrayslots,
    .m_traverse = array_traverse,
    .m_clear = array_clear,
    .m_free = array_free,
};


PyMODINIT_FUNC
PyInit_array(void)
{
    return PyModuleDef_Init(&arraymodule);
}
