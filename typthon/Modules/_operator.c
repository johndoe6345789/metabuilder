#include "Python.h"
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_tuple.h"         // _TyTuple_ITEMS()
#include "pycore_typeobject.h"    // _TyType_GetModuleState()
#include "pycore_unicodeobject.h" // _TyUnicode_InternMortal()


#include "clinic/_operator.c.h"

typedef struct {
    TyObject *itemgetter_type;
    TyObject *attrgetter_type;
    TyObject *methodcaller_type;
} _operator_state;

static inline _operator_state*
get_operator_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (_operator_state *)state;
}

/*[clinic input]
module _operator
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=672ecf48487521e7]*/

TyDoc_STRVAR(operator_doc,
"Operator interface.\n\
\n\
This module exports a set of functions implemented in C corresponding\n\
to the intrinsic operators of Python.  For example, operator.add(x, y)\n\
is equivalent to the expression x+y.  The function names are those\n\
used for special methods; variants without leading and trailing\n\
'__' are also provided for convenience.");


/*[clinic input]
_operator.truth -> bool

    a: object
    /

Return True if a is true, False otherwise.
[clinic start generated code]*/

static int
_operator_truth_impl(TyObject *module, TyObject *a)
/*[clinic end generated code: output=eaf87767234fa5d7 input=bc74a4cd90235875]*/
{
    return PyObject_IsTrue(a);
}

/*[clinic input]
_operator.add

    a: object
    b: object
    /

Same as a + b.
[clinic start generated code]*/

static TyObject *
_operator_add_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=8292984204f45164 input=5efe3bff856ac215]*/
{
    return PyNumber_Add(a, b);
}

/*[clinic input]
_operator.sub = _operator.add

Same as a - b.
[clinic start generated code]*/

static TyObject *
_operator_sub_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=4adfc3b888c1ee2e input=6494c6b100b8e795]*/
{
    return PyNumber_Subtract(a, b);
}

/*[clinic input]
_operator.mul = _operator.add

Same as a * b.
[clinic start generated code]*/

static TyObject *
_operator_mul_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=d24d66f55a01944c input=2368615b4358b70d]*/
{
    return PyNumber_Multiply(a, b);
}

/*[clinic input]
_operator.matmul = _operator.add

Same as a @ b.
[clinic start generated code]*/

static TyObject *
_operator_matmul_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=a20d917eb35d0101 input=9ab304e37fb42dd4]*/
{
    return PyNumber_MatrixMultiply(a, b);
}

/*[clinic input]
_operator.floordiv = _operator.add

Same as a // b.
[clinic start generated code]*/

static TyObject *
_operator_floordiv_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=df26b71a60589f99 input=bb2e88ba446c612c]*/
{
    return PyNumber_FloorDivide(a, b);
}

/*[clinic input]
_operator.truediv = _operator.add

Same as a / b.
[clinic start generated code]*/

static TyObject *
_operator_truediv_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=0e6a959944d77719 input=ecbb947673f4eb1f]*/
{
    return PyNumber_TrueDivide(a, b);
}

/*[clinic input]
_operator.mod = _operator.add

Same as a % b.
[clinic start generated code]*/

static TyObject *
_operator_mod_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=9519822f0bbec166 input=102e19b422342ac1]*/
{
    return PyNumber_Remainder(a, b);
}

/*[clinic input]
_operator.neg

    a: object
    /

Same as -a.
[clinic start generated code]*/

static TyObject *
_operator_neg(TyObject *module, TyObject *a)
/*[clinic end generated code: output=36e08ecfc6a1c08c input=84f09bdcf27c96ec]*/
{
    return PyNumber_Negative(a);
}

/*[clinic input]
_operator.pos = _operator.neg

Same as +a.
[clinic start generated code]*/

static TyObject *
_operator_pos(TyObject *module, TyObject *a)
/*[clinic end generated code: output=dad7a126221dd091 input=b6445b63fddb8772]*/
{
    return PyNumber_Positive(a);
}

/*[clinic input]
_operator.abs = _operator.neg

Same as abs(a).
[clinic start generated code]*/

static TyObject *
_operator_abs(TyObject *module, TyObject *a)
/*[clinic end generated code: output=1389a93ba053ea3e input=341d07ba86f58039]*/
{
    return PyNumber_Absolute(a);
}

/*[clinic input]
_operator.inv = _operator.neg

Same as ~a.
[clinic start generated code]*/

static TyObject *
_operator_inv(TyObject *module, TyObject *a)
/*[clinic end generated code: output=a56875ba075ee06d input=b01a4677739f6eb2]*/
{
    return PyNumber_Invert(a);
}

/*[clinic input]
_operator.invert = _operator.neg

Same as ~a.
[clinic start generated code]*/

static TyObject *
_operator_invert(TyObject *module, TyObject *a)
/*[clinic end generated code: output=406b5aa030545fcc input=7f2d607176672e55]*/
{
    return PyNumber_Invert(a);
}

/*[clinic input]
_operator.lshift = _operator.add

Same as a << b.
[clinic start generated code]*/

static TyObject *
_operator_lshift_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=37f7e52c41435bd8 input=746e8a160cbbc9eb]*/
{
    return PyNumber_Lshift(a, b);
}

/*[clinic input]
_operator.rshift = _operator.add

Same as a >> b.
[clinic start generated code]*/

static TyObject *
_operator_rshift_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=4593c7ef30ec2ee3 input=d2c85bb5a64504c2]*/
{
    return PyNumber_Rshift(a, b);
}

/*[clinic input]
_operator.not_ = _operator.truth

Same as not a.
[clinic start generated code]*/

static int
_operator_not__impl(TyObject *module, TyObject *a)
/*[clinic end generated code: output=743f9c24a09759ef input=854156d50804d9b8]*/
{
    return PyObject_Not(a);
}

/*[clinic input]
_operator.and_ = _operator.add

Same as a & b.
[clinic start generated code]*/

static TyObject *
_operator_and__impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=93c4fe88f7b76d9e input=4f3057c90ec4c99f]*/
{
    return PyNumber_And(a, b);
}

/*[clinic input]
_operator.xor = _operator.add

Same as a ^ b.
[clinic start generated code]*/

static TyObject *
_operator_xor_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=b24cd8b79fde0004 input=3c5cfa7253d808dd]*/
{
    return PyNumber_Xor(a, b);
}

/*[clinic input]
_operator.or_ = _operator.add

Same as a | b.
[clinic start generated code]*/

static TyObject *
_operator_or__impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=58024867b8d90461 input=b40c6c44f7c79c09]*/
{
    return PyNumber_Or(a, b);
}

/*[clinic input]
_operator.iadd = _operator.add

Same as a += b.
[clinic start generated code]*/

static TyObject *
_operator_iadd_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=07dc627832526eb5 input=d22a91c07ac69227]*/
{
    return PyNumber_InPlaceAdd(a, b);
}

/*[clinic input]
_operator.isub = _operator.add

Same as a -= b.
[clinic start generated code]*/

static TyObject *
_operator_isub_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=4513467d23b5e0b1 input=4591b00d0a0ccafd]*/
{
    return PyNumber_InPlaceSubtract(a, b);
}

/*[clinic input]
_operator.imul = _operator.add

Same as a *= b.
[clinic start generated code]*/

static TyObject *
_operator_imul_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=5e87dacd19a71eab input=0e01fb8631e1b76f]*/
{
    return PyNumber_InPlaceMultiply(a, b);
}

/*[clinic input]
_operator.imatmul = _operator.add

Same as a @= b.
[clinic start generated code]*/

static TyObject *
_operator_imatmul_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=d603cbdf716ce519 input=bb614026372cd542]*/
{
    return PyNumber_InPlaceMatrixMultiply(a, b);
}

/*[clinic input]
_operator.ifloordiv = _operator.add

Same as a //= b.
[clinic start generated code]*/

static TyObject *
_operator_ifloordiv_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=535336048c681794 input=9df3b5021cff4ca1]*/
{
    return PyNumber_InPlaceFloorDivide(a, b);
}

/*[clinic input]
_operator.itruediv = _operator.add

Same as a /= b.
[clinic start generated code]*/

static TyObject *
_operator_itruediv_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=28017fbd3563952f input=9a1ee01608f5f590]*/
{
    return PyNumber_InPlaceTrueDivide(a, b);
}

/*[clinic input]
_operator.imod = _operator.add

Same as a %= b.
[clinic start generated code]*/

static TyObject *
_operator_imod_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=f7c540ae0fc70904 input=d0c384a3ce38e1dd]*/
{
    return PyNumber_InPlaceRemainder(a, b);
}

/*[clinic input]
_operator.ilshift = _operator.add

Same as a <<= b.
[clinic start generated code]*/

static TyObject *
_operator_ilshift_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=e73a8fee1ac18749 input=e21b6b310f54572e]*/
{
    return PyNumber_InPlaceLshift(a, b);
}

/*[clinic input]
_operator.irshift = _operator.add

Same as a >>= b.
[clinic start generated code]*/

static TyObject *
_operator_irshift_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=97f2af6b5ff2ed81 input=6778dbd0f6e1ec16]*/
{
    return PyNumber_InPlaceRshift(a, b);
}

/*[clinic input]
_operator.iand = _operator.add

Same as a &= b.
[clinic start generated code]*/

static TyObject *
_operator_iand_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=4599e9d40cbf7d00 input=71dfd8e70c156a7b]*/
{
    return PyNumber_InPlaceAnd(a, b);
}

/*[clinic input]
_operator.ixor = _operator.add

Same as a ^= b.
[clinic start generated code]*/

static TyObject *
_operator_ixor_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=5ff881766872be03 input=695c32bec0604d86]*/
{
    return PyNumber_InPlaceXor(a, b);
}

/*[clinic input]
_operator.ior = _operator.add

Same as a |= b.
[clinic start generated code]*/

static TyObject *
_operator_ior_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=48aac319445bf759 input=8f01d03eda9920cf]*/
{
    return PyNumber_InPlaceOr(a, b);
}

/*[clinic input]
_operator.concat = _operator.add

Same as a + b, for a and b sequences.
[clinic start generated code]*/

static TyObject *
_operator_concat_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=80028390942c5f11 input=8544ccd5341a3658]*/
{
    return PySequence_Concat(a, b);
}

/*[clinic input]
_operator.iconcat = _operator.add

Same as a += b, for a and b sequences.
[clinic start generated code]*/

static TyObject *
_operator_iconcat_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=3ea0a162ebb2e26d input=8f5fe5722fcd837e]*/
{
    return PySequence_InPlaceConcat(a, b);
}

/*[clinic input]
_operator.contains -> bool

    a: object
    b: object
    /

Same as b in a (note reversed operands).
[clinic start generated code]*/

static int
_operator_contains_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=413b4dbe82b6ffc1 input=9122a69b505fde13]*/
{
    return PySequence_Contains(a, b);
}

/*[clinic input]
_operator.indexOf -> Ty_ssize_t

    a: object
    b: object
    /

Return the first index of b in a.
[clinic start generated code]*/

static Ty_ssize_t
_operator_indexOf_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=c6226d8e0fb60fa6 input=8be2e43b6a6fffe3]*/
{
    return PySequence_Index(a, b);
}

/*[clinic input]
_operator.countOf = _operator.indexOf

Return the number of items in a which are, or which equal, b.
[clinic start generated code]*/

static Ty_ssize_t
_operator_countOf_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=9e1623197daf3382 input=93ea57f170f3f0bb]*/
{
    return PySequence_Count(a, b);
}

/*[clinic input]
_operator.getitem

    a: object
    b: object
    /

Same as a[b].
[clinic start generated code]*/

static TyObject *
_operator_getitem_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=6c8d8101a676e594 input=6682797320e48845]*/
{
    return PyObject_GetItem(a, b);
}

/*[clinic input]
_operator.setitem

    a: object
    b: object
    c: object
    /

Same as a[b] = c.
[clinic start generated code]*/

static TyObject *
_operator_setitem_impl(TyObject *module, TyObject *a, TyObject *b,
                       TyObject *c)
/*[clinic end generated code: output=1324f9061ae99e25 input=ceaf453c4d3a58df]*/
{
    if (-1 == PyObject_SetItem(a, b, c))
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
_operator.delitem = _operator.getitem

Same as del a[b].
[clinic start generated code]*/

static TyObject *
_operator_delitem_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=db18f61506295799 input=991bec56a0d3ec7f]*/
{
    if (-1 == PyObject_DelItem(a, b))
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
_operator.eq

    a: object
    b: object
    /

Same as a == b.
[clinic start generated code]*/

static TyObject *
_operator_eq_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=8d7d46ed4135677c input=586fca687a95a83f]*/
{
    return PyObject_RichCompare(a, b, Py_EQ);
}

/*[clinic input]
_operator.ne = _operator.eq

Same as a != b.
[clinic start generated code]*/

static TyObject *
_operator_ne_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=c99bd0c3a4c01297 input=5d88f23d35e9abac]*/
{
    return PyObject_RichCompare(a, b, Py_NE);
}

/*[clinic input]
_operator.lt = _operator.eq

Same as a < b.
[clinic start generated code]*/

static TyObject *
_operator_lt_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=082d7c45c440e535 input=34a59ad6d39d3a2b]*/
{
    return PyObject_RichCompare(a, b, Py_LT);
}

/*[clinic input]
_operator.le = _operator.eq

Same as a <= b.
[clinic start generated code]*/

static TyObject *
_operator_le_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=00970a2923d0ae17 input=b812a7860a0bef44]*/
{
    return PyObject_RichCompare(a, b, Py_LE);
}

/*[clinic input]
_operator.gt = _operator.eq

Same as a > b.
[clinic start generated code]*/

static TyObject *
_operator_gt_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=8d373349ecf25641 input=9bdb45b995ada35b]*/
{
    return PyObject_RichCompare(a, b, Py_GT);
}

/*[clinic input]
_operator.ge = _operator.eq

Same as a >= b.
[clinic start generated code]*/

static TyObject *
_operator_ge_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=7ce3882256d4b137 input=cf1dc4a5ca9c35f5]*/
{
    return PyObject_RichCompare(a, b, Py_GE);
}

/*[clinic input]
_operator.pow = _operator.add

Same as a ** b.
[clinic start generated code]*/

static TyObject *
_operator_pow_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=09e668ad50036120 input=690b40f097ab1637]*/
{
    return PyNumber_Power(a, b, Ty_None);
}

/*[clinic input]
_operator.ipow = _operator.add

Same as a **= b.
[clinic start generated code]*/

static TyObject *
_operator_ipow_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=7189ff4d4367c808 input=f00623899d07499a]*/
{
    return PyNumber_InPlacePower(a, b, Ty_None);
}

/*[clinic input]
_operator.index

    a: object
    /

Same as a.__index__()
[clinic start generated code]*/

static TyObject *
_operator_index(TyObject *module, TyObject *a)
/*[clinic end generated code: output=d972b0764ac305fc input=6f54d50ea64a579c]*/
{
    return PyNumber_Index(a);
}

/*[clinic input]
_operator.is_ = _operator.add

Same as a is b.
[clinic start generated code]*/

static TyObject *
_operator_is__impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=bcd47a402e482e1d input=5fa9b97df03c427f]*/
{
    TyObject *result = Ty_Is(a, b) ? Ty_True : Ty_False;
    return Ty_NewRef(result);
}

/*[clinic input]
_operator.is_not = _operator.add

Same as a is not b.
[clinic start generated code]*/

static TyObject *
_operator_is_not_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=491a1f2f81f6c7f9 input=5a93f7e1a93535f1]*/
{
    TyObject *result;
    result = (a != b) ? Ty_True : Ty_False;
    return Ty_NewRef(result);
}

/*[clinic input]
_operator.is_none = _operator.neg

Same as a is None.
[clinic start generated code]*/

static TyObject *
_operator_is_none(TyObject *module, TyObject *a)
/*[clinic end generated code: output=07159cc102261dec input=0448b38af7b8533d]*/
{
    TyObject *result = Ty_IsNone(a) ? Ty_True : Ty_False;
    return Ty_NewRef(result);
}

/*[clinic input]
_operator.is_not_none = _operator.neg

Same as a is not None.
[clinic start generated code]*/

static TyObject *
_operator_is_not_none(TyObject *module, TyObject *a)
/*[clinic end generated code: output=b0168a51451d9140 input=7587f38ebac51688]*/
{
    TyObject *result = Ty_IsNone(a) ? Ty_False : Ty_True;
    return Ty_NewRef(result);
}

/* compare_digest **********************************************************/

/*
 * timing safe compare
 *
 * Returns 1 if the strings are equal.
 * In case of len(a) != len(b) the function tries to keep the timing
 * dependent on the length of b. CPU cache locality may still alter timing
 * a bit.
 */
static int
_tscmp(const unsigned char *a, const unsigned char *b,
        Ty_ssize_t len_a, Ty_ssize_t len_b)
{
    /* The volatile type declarations make sure that the compiler has no
     * chance to optimize and fold the code in any way that may change
     * the timing.
     */
    volatile Ty_ssize_t length;
    volatile const unsigned char *left;
    volatile const unsigned char *right;
    Ty_ssize_t i;
    volatile unsigned char result;

    /* loop count depends on length of b */
    length = len_b;
    left = NULL;
    right = b;

    /* don't use else here to keep the amount of CPU instructions constant,
     * volatile forces re-evaluation
     *  */
    if (len_a == length) {
        left = *((volatile const unsigned char**)&a);
        result = 0;
    }
    if (len_a != length) {
        left = b;
        result = 1;
    }

    for (i=0; i < length; i++) {
        result |= *left++ ^ *right++;
    }

    return (result == 0);
}

/*[clinic input]
_operator.length_hint -> Ty_ssize_t

    obj: object
    default: Ty_ssize_t = 0
    /

Return an estimate of the number of items in obj.

This is useful for presizing containers when building from an iterable.

If the object supports len(), the result will be exact.
Otherwise, it may over- or under-estimate by an arbitrary amount.
The result will be an integer >= 0.
[clinic start generated code]*/

static Ty_ssize_t
_operator_length_hint_impl(TyObject *module, TyObject *obj,
                           Ty_ssize_t default_value)
/*[clinic end generated code: output=01d469edc1d612ad input=65ed29f04401e96a]*/
{
    return PyObject_LengthHint(obj, default_value);
}

/* NOTE: Keep in sync with _hashopenssl.c implementation. */

/*[clinic input]
_operator._compare_digest = _operator.eq

Return 'a == b'.

This function uses an approach designed to prevent
timing analysis, making it appropriate for cryptography.

a and b must both be of the same type: either str (ASCII only),
or any bytes-like object.

Note: If a and b are of different lengths, or if an error occurs,
a timing attack could theoretically reveal information about the
types and lengths of a and b--but not their values.
[clinic start generated code]*/

static TyObject *
_operator__compare_digest_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=11d452bdd3a23cbc input=9ac7e2c4e30bc356]*/
{
    int rc;

    /* ASCII unicode string */
    if(TyUnicode_Check(a) && TyUnicode_Check(b)) {
        if (!TyUnicode_IS_ASCII(a) || !TyUnicode_IS_ASCII(b)) {
            TyErr_SetString(TyExc_TypeError,
                            "comparing strings with non-ASCII characters is "
                            "not supported");
            return NULL;
        }

        rc = _tscmp(TyUnicode_DATA(a),
                    TyUnicode_DATA(b),
                    TyUnicode_GET_LENGTH(a),
                    TyUnicode_GET_LENGTH(b));
    }
    /* fallback to buffer interface for bytes, bytearray and other */
    else {
        Ty_buffer view_a;
        Ty_buffer view_b;

        if (PyObject_CheckBuffer(a) == 0 && PyObject_CheckBuffer(b) == 0) {
            TyErr_Format(TyExc_TypeError,
                         "unsupported operand types(s) or combination of types: "
                         "'%.100s' and '%.100s'",
                         Ty_TYPE(a)->tp_name, Ty_TYPE(b)->tp_name);
            return NULL;
        }

        if (PyObject_GetBuffer(a, &view_a, PyBUF_SIMPLE) == -1) {
            return NULL;
        }
        if (view_a.ndim > 1) {
            TyErr_SetString(TyExc_BufferError,
                            "Buffer must be single dimension");
            PyBuffer_Release(&view_a);
            return NULL;
        }

        if (PyObject_GetBuffer(b, &view_b, PyBUF_SIMPLE) == -1) {
            PyBuffer_Release(&view_a);
            return NULL;
        }
        if (view_b.ndim > 1) {
            TyErr_SetString(TyExc_BufferError,
                            "Buffer must be single dimension");
            PyBuffer_Release(&view_a);
            PyBuffer_Release(&view_b);
            return NULL;
        }

        rc = _tscmp((const unsigned char*)view_a.buf,
                    (const unsigned char*)view_b.buf,
                    view_a.len,
                    view_b.len);

        PyBuffer_Release(&view_a);
        PyBuffer_Release(&view_b);
    }

    return TyBool_FromLong(rc);
}

TyDoc_STRVAR(_operator_call__doc__,
"call($module, obj, /, *args, **kwargs)\n"
"--\n"
"\n"
"Same as obj(*args, **kwargs).");

#define _OPERATOR_CALL_METHODDEF    \
    {"call", _PyCFunction_CAST(_operator_call), METH_FASTCALL | METH_KEYWORDS, _operator_call__doc__},

static TyObject *
_operator_call(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (!_TyArg_CheckPositional("call", nargs, 1, PY_SSIZE_T_MAX)) {
        return NULL;
    }
    return PyObject_Vectorcall(
            args[0],
            &args[1], (PyVectorcall_NARGS(nargs) - 1) | PY_VECTORCALL_ARGUMENTS_OFFSET,
            kwnames);
}

/* operator methods **********************************************************/

static struct TyMethodDef operator_methods[] = {

    _OPERATOR_TRUTH_METHODDEF
    _OPERATOR_CONTAINS_METHODDEF
    _OPERATOR_INDEXOF_METHODDEF
    _OPERATOR_COUNTOF_METHODDEF
    _OPERATOR_IS__METHODDEF
    _OPERATOR_IS_NOT_METHODDEF
    _OPERATOR_IS_NONE_METHODDEF
    _OPERATOR_IS_NOT_NONE_METHODDEF
    _OPERATOR_INDEX_METHODDEF
    _OPERATOR_ADD_METHODDEF
    _OPERATOR_SUB_METHODDEF
    _OPERATOR_MUL_METHODDEF
    _OPERATOR_MATMUL_METHODDEF
    _OPERATOR_FLOORDIV_METHODDEF
    _OPERATOR_TRUEDIV_METHODDEF
    _OPERATOR_MOD_METHODDEF
    _OPERATOR_NEG_METHODDEF
    _OPERATOR_POS_METHODDEF
    _OPERATOR_ABS_METHODDEF
    _OPERATOR_INV_METHODDEF
    _OPERATOR_INVERT_METHODDEF
    _OPERATOR_LSHIFT_METHODDEF
    _OPERATOR_RSHIFT_METHODDEF
    _OPERATOR_NOT__METHODDEF
    _OPERATOR_AND__METHODDEF
    _OPERATOR_XOR_METHODDEF
    _OPERATOR_OR__METHODDEF
    _OPERATOR_IADD_METHODDEF
    _OPERATOR_ISUB_METHODDEF
    _OPERATOR_IMUL_METHODDEF
    _OPERATOR_IMATMUL_METHODDEF
    _OPERATOR_IFLOORDIV_METHODDEF
    _OPERATOR_ITRUEDIV_METHODDEF
    _OPERATOR_IMOD_METHODDEF
    _OPERATOR_ILSHIFT_METHODDEF
    _OPERATOR_IRSHIFT_METHODDEF
    _OPERATOR_IAND_METHODDEF
    _OPERATOR_IXOR_METHODDEF
    _OPERATOR_IOR_METHODDEF
    _OPERATOR_CONCAT_METHODDEF
    _OPERATOR_ICONCAT_METHODDEF
    _OPERATOR_GETITEM_METHODDEF
    _OPERATOR_SETITEM_METHODDEF
    _OPERATOR_DELITEM_METHODDEF
    _OPERATOR_POW_METHODDEF
    _OPERATOR_IPOW_METHODDEF
    _OPERATOR_EQ_METHODDEF
    _OPERATOR_NE_METHODDEF
    _OPERATOR_LT_METHODDEF
    _OPERATOR_LE_METHODDEF
    _OPERATOR_GT_METHODDEF
    _OPERATOR_GE_METHODDEF
    _OPERATOR__COMPARE_DIGEST_METHODDEF
    _OPERATOR_LENGTH_HINT_METHODDEF
    _OPERATOR_CALL_METHODDEF
    {NULL,              NULL}           /* sentinel */

};


static TyObject *
text_signature(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyUnicode_FromString("(obj, /)");
}

static TyGetSetDef common_getset[] = {
    {"__text_signature__", text_signature, NULL},
    {NULL}
};

/* itemgetter object **********************************************************/

typedef struct {
    PyObject_HEAD
    Ty_ssize_t nitems;
    TyObject *item;
    Ty_ssize_t index; // -1 unless *item* is a single non-negative integer index
    vectorcallfunc vectorcall;
} itemgetterobject;

#define itemgetterobject_CAST(op)   ((itemgetterobject *)(op))

// Forward declarations
static TyObject *
itemgetter_vectorcall(TyObject *, TyObject *const *, size_t, TyObject *);
static TyObject *
itemgetter_call_impl(itemgetterobject *, TyObject *);

/* AC 3.5: treats first argument as an iterable, otherwise uses *args */
static TyObject *
itemgetter_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    itemgetterobject *ig;
    TyObject *item;
    Ty_ssize_t nitems;
    Ty_ssize_t index;

    if (!_TyArg_NoKeywords("itemgetter", kwds))
        return NULL;

    nitems = TyTuple_GET_SIZE(args);
    if (nitems <= 1) {
        if (!TyArg_UnpackTuple(args, "itemgetter", 1, 1, &item))
            return NULL;
    } else {
        item = args;
    }
    _operator_state *state = _TyType_GetModuleState(type);
    /* create itemgetterobject structure */
    ig = PyObject_GC_New(itemgetterobject, (TyTypeObject *) state->itemgetter_type);
    if (ig == NULL) {
        return NULL;
    }

    ig->item = Ty_NewRef(item);
    ig->nitems = nitems;
    ig->index = -1;
    if (TyLong_CheckExact(item)) {
        index = TyLong_AsSsize_t(item);
        if (index < 0) {
            /* If we get here, then either the index conversion failed
             * due to being out of range, or the index was a negative
             * integer.  Either way, we clear any possible exception
             * and fall back to the slow path, where ig->index is -1.
             */
            TyErr_Clear();
        }
        else {
            ig->index = index;
        }
    }

    ig->vectorcall = itemgetter_vectorcall;
    PyObject_GC_Track(ig);
    return (TyObject *)ig;
}

static int
itemgetter_clear(TyObject *op)
{
    itemgetterobject *ig = itemgetterobject_CAST(op);
    Ty_CLEAR(ig->item);
    return 0;
}

static void
itemgetter_dealloc(TyObject *op)
{
    TyTypeObject *tp = Ty_TYPE(op);
    PyObject_GC_UnTrack(op);
    (void)itemgetter_clear(op);
    tp->tp_free(op);
    Ty_DECREF(tp);
}

static int
itemgetter_traverse(TyObject *op, visitproc visit, void *arg)
{
    itemgetterobject *ig = itemgetterobject_CAST(op);
    Ty_VISIT(Ty_TYPE(ig));
    Ty_VISIT(ig->item);
    return 0;
}

static TyObject *
itemgetter_call(TyObject *op, TyObject *args, TyObject *kw)
{
    assert(TyTuple_CheckExact(args));
    if (!_TyArg_NoKeywords("itemgetter", kw))
        return NULL;
    if (!_TyArg_CheckPositional("itemgetter", TyTuple_GET_SIZE(args), 1, 1))
        return NULL;
    itemgetterobject *ig = itemgetterobject_CAST(op);
    return itemgetter_call_impl(ig, TyTuple_GET_ITEM(args, 0));
}

static TyObject *
itemgetter_vectorcall(TyObject *op, TyObject *const *args,
                      size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("itemgetter", kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("itemgetter", nargs, 1, 1)) {
        return NULL;
    }
    itemgetterobject *ig = itemgetterobject_CAST(op);
    return itemgetter_call_impl(ig, args[0]);
}

static TyObject *
itemgetter_call_impl(itemgetterobject *ig, TyObject *obj)
{
    TyObject *result;
    Ty_ssize_t i, nitems=ig->nitems;
    if (nitems == 1) {
        if (ig->index >= 0
            && TyTuple_CheckExact(obj)
            && ig->index < TyTuple_GET_SIZE(obj))
        {
            result = TyTuple_GET_ITEM(obj, ig->index);
            return Ty_NewRef(result);
        }
        return PyObject_GetItem(obj, ig->item);
    }

    assert(TyTuple_Check(ig->item));
    assert(TyTuple_GET_SIZE(ig->item) == nitems);

    result = TyTuple_New(nitems);
    if (result == NULL)
        return NULL;

    for (i=0 ; i < nitems ; i++) {
        TyObject *item, *val;
        item = TyTuple_GET_ITEM(ig->item, i);
        val = PyObject_GetItem(obj, item);
        if (val == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
        TyTuple_SET_ITEM(result, i, val);
    }
    return result;
}

static TyObject *
itemgetter_repr(TyObject *op)
{
    TyObject *repr;
    const char *reprfmt;
    itemgetterobject *ig = itemgetterobject_CAST(op);

    int status = Ty_ReprEnter(op);
    if (status != 0) {
        if (status < 0)
            return NULL;
        return TyUnicode_FromFormat("%s(...)", Ty_TYPE(ig)->tp_name);
    }

    reprfmt = ig->nitems == 1 ? "%s(%R)" : "%s%R";
    repr = TyUnicode_FromFormat(reprfmt, Ty_TYPE(ig)->tp_name, ig->item);
    Ty_ReprLeave(op);
    return repr;
}

static TyObject *
itemgetter_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    itemgetterobject *ig = itemgetterobject_CAST(op);
    if (ig->nitems == 1)
        return Ty_BuildValue("O(O)", Ty_TYPE(ig), ig->item);
    return TyTuple_Pack(2, Ty_TYPE(ig), ig->item);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling");

static TyMethodDef itemgetter_methods[] = {
    {"__reduce__", itemgetter_reduce, METH_NOARGS,
     reduce_doc},
    {NULL}
};

static TyMemberDef itemgetter_members[] = {
    {"__vectorcalloffset__", Ty_T_PYSSIZET, offsetof(itemgetterobject, vectorcall), Py_READONLY},
    {NULL} /* Sentinel */
};

TyDoc_STRVAR(itemgetter_doc,
"itemgetter(item, /, *items)\n--\n\n\
Return a callable object that fetches the given item(s) from its operand.\n\
After f = itemgetter(2), the call f(r) returns r[2].\n\
After g = itemgetter(2, 5, 3), the call g(r) returns (r[2], r[5], r[3])");

static TyType_Slot itemgetter_type_slots[] = {
    {Ty_tp_doc, (void *)itemgetter_doc},
    {Ty_tp_dealloc, itemgetter_dealloc},
    {Ty_tp_call, itemgetter_call},
    {Ty_tp_traverse, itemgetter_traverse},
    {Ty_tp_clear, itemgetter_clear},
    {Ty_tp_methods, itemgetter_methods},
    {Ty_tp_members, itemgetter_members},
    {Ty_tp_getset, common_getset},
    {Ty_tp_new, itemgetter_new},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_repr, itemgetter_repr},
    {0, 0}
};

static TyType_Spec itemgetter_type_spec = {
    .name = "operator.itemgetter",
    .basicsize = sizeof(itemgetterobject),
    .itemsize = 0,
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_VECTORCALL),
    .slots = itemgetter_type_slots,
};

/* attrgetter object **********************************************************/

typedef struct {
    PyObject_HEAD
    Ty_ssize_t nattrs;
    TyObject *attr;
    vectorcallfunc vectorcall;
} attrgetterobject;

#define attrgetterobject_CAST(op)   ((attrgetterobject *)(op))

// Forward declarations
static TyObject *
attrgetter_vectorcall(TyObject *, TyObject *const *, size_t, TyObject *);
static TyObject *
attrgetter_call_impl(attrgetterobject *, TyObject *);

/* AC 3.5: treats first argument as an iterable, otherwise uses *args */
static TyObject *
attrgetter_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    attrgetterobject *ag;
    TyObject *attr;
    Ty_ssize_t nattrs, idx, char_idx;

    if (!_TyArg_NoKeywords("attrgetter", kwds))
        return NULL;

    nattrs = TyTuple_GET_SIZE(args);
    if (nattrs <= 1) {
        if (!TyArg_UnpackTuple(args, "attrgetter", 1, 1, &attr))
            return NULL;
    }

    attr = TyTuple_New(nattrs);
    if (attr == NULL)
        return NULL;

    /* prepare attr while checking args */
    TyInterpreterState *interp = _TyInterpreterState_GET();
    for (idx = 0; idx < nattrs; ++idx) {
        TyObject *item = TyTuple_GET_ITEM(args, idx);
        int dot_count;

        if (!TyUnicode_Check(item)) {
            TyErr_SetString(TyExc_TypeError,
                            "attribute name must be a string");
            Ty_DECREF(attr);
            return NULL;
        }
        Ty_ssize_t item_len = TyUnicode_GET_LENGTH(item);
        int kind = TyUnicode_KIND(item);
        const void *data = TyUnicode_DATA(item);

        /* check whether the string is dotted */
        dot_count = 0;
        for (char_idx = 0; char_idx < item_len; ++char_idx) {
            if (TyUnicode_READ(kind, data, char_idx) == '.')
                ++dot_count;
        }

        if (dot_count == 0) {
            Ty_INCREF(item);
            _TyUnicode_InternMortal(interp, &item);
            TyTuple_SET_ITEM(attr, idx, item);
        } else { /* make it a tuple of non-dotted attrnames */
            TyObject *attr_chain = TyTuple_New(dot_count + 1);
            TyObject *attr_chain_item;
            Ty_ssize_t unibuff_from = 0;
            Ty_ssize_t unibuff_till = 0;
            Ty_ssize_t attr_chain_idx = 0;

            if (attr_chain == NULL) {
                Ty_DECREF(attr);
                return NULL;
            }

            for (; dot_count > 0; --dot_count) {
                while (TyUnicode_READ(kind, data, unibuff_till) != '.') {
                    ++unibuff_till;
                }
                attr_chain_item = TyUnicode_Substring(item,
                                      unibuff_from,
                                      unibuff_till);
                if (attr_chain_item == NULL) {
                    Ty_DECREF(attr_chain);
                    Ty_DECREF(attr);
                    return NULL;
                }
                _TyUnicode_InternMortal(interp, &attr_chain_item);
                TyTuple_SET_ITEM(attr_chain, attr_chain_idx, attr_chain_item);
                ++attr_chain_idx;
                unibuff_till = unibuff_from = unibuff_till + 1;
            }

            /* now add the last dotless name */
            attr_chain_item = TyUnicode_Substring(item,
                                                  unibuff_from, item_len);
            if (attr_chain_item == NULL) {
                Ty_DECREF(attr_chain);
                Ty_DECREF(attr);
                return NULL;
            }
            _TyUnicode_InternMortal(interp, &attr_chain_item);
            TyTuple_SET_ITEM(attr_chain, attr_chain_idx, attr_chain_item);

            TyTuple_SET_ITEM(attr, idx, attr_chain);
        }
    }

    _operator_state *state = _TyType_GetModuleState(type);
    /* create attrgetterobject structure */
    ag = PyObject_GC_New(attrgetterobject, (TyTypeObject *)state->attrgetter_type);
    if (ag == NULL) {
        Ty_DECREF(attr);
        return NULL;
    }

    ag->attr = attr;
    ag->nattrs = nattrs;
    ag->vectorcall = attrgetter_vectorcall;

    PyObject_GC_Track(ag);
    return (TyObject *)ag;
}

static int
attrgetter_clear(TyObject *op)
{
    attrgetterobject *ag = attrgetterobject_CAST(op);
    Ty_CLEAR(ag->attr);
    return 0;
}

static void
attrgetter_dealloc(TyObject *op)
{
    TyTypeObject *tp = Ty_TYPE(op);
    PyObject_GC_UnTrack(op);
    (void)attrgetter_clear(op);
    tp->tp_free(op);
    Ty_DECREF(tp);
}

static int
attrgetter_traverse(TyObject *op, visitproc visit, void *arg)
{
    attrgetterobject *ag = attrgetterobject_CAST(op);
    Ty_VISIT(ag->attr);
    Ty_VISIT(Ty_TYPE(ag));
    return 0;
}

static TyObject *
dotted_getattr(TyObject *obj, TyObject *attr)
{
    TyObject *newobj;

    /* attr is either a tuple or instance of str.
       Ensured by the setup code of attrgetter_new */
    if (TyTuple_CheckExact(attr)) { /* chained getattr */
        Ty_ssize_t name_idx = 0, name_count;
        TyObject *attr_name;

        name_count = TyTuple_GET_SIZE(attr);
        Ty_INCREF(obj);
        for (name_idx = 0; name_idx < name_count; ++name_idx) {
            attr_name = TyTuple_GET_ITEM(attr, name_idx);
            newobj = PyObject_GetAttr(obj, attr_name);
            Ty_DECREF(obj);
            if (newobj == NULL) {
                return NULL;
            }
            /* here */
            obj = newobj;
        }
    } else { /* single getattr */
        newobj = PyObject_GetAttr(obj, attr);
        if (newobj == NULL)
            return NULL;
        obj = newobj;
    }

    return obj;
}

static TyObject *
attrgetter_call(TyObject *op, TyObject *args, TyObject *kw)
{
    if (!_TyArg_NoKeywords("attrgetter", kw))
        return NULL;
    if (!_TyArg_CheckPositional("attrgetter", TyTuple_GET_SIZE(args), 1, 1))
        return NULL;
    attrgetterobject *ag = attrgetterobject_CAST(op);
    return attrgetter_call_impl(ag, TyTuple_GET_ITEM(args, 0));
}

static TyObject *
attrgetter_vectorcall(TyObject *op, TyObject *const *args,
                      size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("attrgetter", kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("attrgetter", nargs, 1, 1)) {
        return NULL;
    }
    attrgetterobject *ag = attrgetterobject_CAST(op);
    return attrgetter_call_impl(ag, args[0]);
}

static TyObject *
attrgetter_call_impl(attrgetterobject *ag, TyObject *obj)
{
    TyObject *result;
    Ty_ssize_t i, nattrs=ag->nattrs;

    if (ag->nattrs == 1) {
        /* ag->attr is always a tuple */
        return dotted_getattr(obj, TyTuple_GET_ITEM(ag->attr, 0));
    }

    assert(TyTuple_Check(ag->attr));
    assert(TyTuple_GET_SIZE(ag->attr) == nattrs);

    result = TyTuple_New(nattrs);
    if (result == NULL)
        return NULL;

    for (i=0 ; i < nattrs ; i++) {
        TyObject *attr, *val;
        attr = TyTuple_GET_ITEM(ag->attr, i);
        val = dotted_getattr(obj, attr);
        if (val == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
        TyTuple_SET_ITEM(result, i, val);
    }
    return result;
}

static TyObject *
dotjoinattr(TyObject *attr, TyObject **attrsep)
{
    if (TyTuple_CheckExact(attr)) {
        if (*attrsep == NULL) {
            *attrsep = TyUnicode_FromString(".");
            if (*attrsep == NULL)
                return NULL;
        }
        return TyUnicode_Join(*attrsep, attr);
    } else {
        return Ty_NewRef(attr);
    }
}

static TyObject *
attrgetter_args(attrgetterobject *ag)
{
    Ty_ssize_t i;
    TyObject *attrsep = NULL;
    TyObject *attrstrings = TyTuple_New(ag->nattrs);
    if (attrstrings == NULL)
        return NULL;

    for (i = 0; i < ag->nattrs; ++i) {
        TyObject *attr = TyTuple_GET_ITEM(ag->attr, i);
        TyObject *attrstr = dotjoinattr(attr, &attrsep);
        if (attrstr == NULL) {
            Ty_XDECREF(attrsep);
            Ty_DECREF(attrstrings);
            return NULL;
        }
        TyTuple_SET_ITEM(attrstrings, i, attrstr);
    }
    Ty_XDECREF(attrsep);
    return attrstrings;
}

static TyObject *
attrgetter_repr(TyObject *op)
{
    TyObject *repr = NULL;
    attrgetterobject *ag = attrgetterobject_CAST(op);
    int status = Ty_ReprEnter(op);
    if (status != 0) {
        if (status < 0)
            return NULL;
        return TyUnicode_FromFormat("%s(...)", Ty_TYPE(ag)->tp_name);
    }

    if (ag->nattrs == 1) {
        TyObject *attrsep = NULL;
        TyObject *attr = dotjoinattr(TyTuple_GET_ITEM(ag->attr, 0), &attrsep);
        if (attr != NULL) {
            repr = TyUnicode_FromFormat("%s(%R)", Ty_TYPE(ag)->tp_name, attr);
            Ty_DECREF(attr);
        }
        Ty_XDECREF(attrsep);
    }
    else {
        TyObject *attrstrings = attrgetter_args(ag);
        if (attrstrings != NULL) {
            repr = TyUnicode_FromFormat("%s%R",
                                        Ty_TYPE(ag)->tp_name, attrstrings);
            Ty_DECREF(attrstrings);
        }
    }
    Ty_ReprLeave(op);
    return repr;
}

static TyObject *
attrgetter_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    attrgetterobject *ag = attrgetterobject_CAST(op);
    TyObject *attrstrings = attrgetter_args(ag);
    if (attrstrings == NULL)
        return NULL;
    return Ty_BuildValue("ON", Ty_TYPE(ag), attrstrings);
}

static TyMethodDef attrgetter_methods[] = {
    {"__reduce__", attrgetter_reduce, METH_NOARGS,
     reduce_doc},
    {NULL}
};

static TyMemberDef attrgetter_members[] = {
    {"__vectorcalloffset__", Ty_T_PYSSIZET, offsetof(attrgetterobject, vectorcall), Py_READONLY},
    {NULL} /* Sentinel*/
};

TyDoc_STRVAR(attrgetter_doc,
"attrgetter(attr, /, *attrs)\n--\n\n\
Return a callable object that fetches the given attribute(s) from its operand.\n\
After f = attrgetter('name'), the call f(r) returns r.name.\n\
After g = attrgetter('name', 'date'), the call g(r) returns (r.name, r.date).\n\
After h = attrgetter('name.first', 'name.last'), the call h(r) returns\n\
(r.name.first, r.name.last).");

static TyType_Slot attrgetter_type_slots[] = {
    {Ty_tp_doc, (void *)attrgetter_doc},
    {Ty_tp_dealloc, attrgetter_dealloc},
    {Ty_tp_call, attrgetter_call},
    {Ty_tp_traverse, attrgetter_traverse},
    {Ty_tp_clear, attrgetter_clear},
    {Ty_tp_methods, attrgetter_methods},
    {Ty_tp_members, attrgetter_members},
    {Ty_tp_getset, common_getset},
    {Ty_tp_new, attrgetter_new},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_repr, attrgetter_repr},
    {0, 0}
};

static TyType_Spec attrgetter_type_spec = {
    .name = "operator.attrgetter",
    .basicsize = sizeof(attrgetterobject),
    .itemsize = 0,
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_VECTORCALL),
    .slots = attrgetter_type_slots,
};


/* methodcaller object **********************************************************/

typedef struct {
    PyObject_HEAD
    TyObject *name;
    TyObject *args;
    TyObject *kwds;
    TyObject *vectorcall_args;
    TyObject *vectorcall_kwnames;
    vectorcallfunc vectorcall;
} methodcallerobject;

#define methodcallerobject_CAST(op) ((methodcallerobject *)(op))

#define _METHODCALLER_MAX_ARGS 8

static TyObject *
methodcaller_vectorcall(TyObject *op, TyObject *const *args,
                        size_t nargsf, TyObject* kwnames)
{
    methodcallerobject *mc = methodcallerobject_CAST(op);
    if (!_TyArg_CheckPositional("methodcaller", PyVectorcall_NARGS(nargsf), 1, 1)
        || !_TyArg_NoKwnames("methodcaller", kwnames)) {
        return NULL;
    }
    assert(mc->vectorcall_args != NULL);

    TyObject *tmp_args[_METHODCALLER_MAX_ARGS];
    tmp_args[0] = args[0];
    assert(1 + TyTuple_GET_SIZE(mc->vectorcall_args) <= _METHODCALLER_MAX_ARGS);
    memcpy(tmp_args + 1, _TyTuple_ITEMS(mc->vectorcall_args), sizeof(TyObject *) * TyTuple_GET_SIZE(mc->vectorcall_args));

    return PyObject_VectorcallMethod(mc->name, tmp_args,
            (1 + TyTuple_GET_SIZE(mc->args)) | PY_VECTORCALL_ARGUMENTS_OFFSET,
            mc->vectorcall_kwnames);
}

static int
_methodcaller_initialize_vectorcall(methodcallerobject* mc)
{
    TyObject* args = mc->args;
    TyObject* kwds = mc->kwds;

    if (kwds && TyDict_Size(kwds)) {
        TyObject *values = TyDict_Values(kwds);
        if (!values) {
            return -1;
        }
        TyObject *values_tuple = PySequence_Tuple(values);
        Ty_DECREF(values);
        if (!values_tuple) {
            return -1;
        }
        if (TyTuple_GET_SIZE(args)) {
            mc->vectorcall_args = PySequence_Concat(args, values_tuple);
            Ty_DECREF(values_tuple);
            if (mc->vectorcall_args == NULL) {
                return -1;
            }
        }
        else {
            mc->vectorcall_args = values_tuple;
        }
        mc->vectorcall_kwnames = PySequence_Tuple(kwds);
        if (!mc->vectorcall_kwnames) {
            return -1;
        }
    }
    else {
        mc->vectorcall_args = Ty_NewRef(args);
        mc->vectorcall_kwnames = NULL;
    }

    mc->vectorcall = methodcaller_vectorcall;
    return 0;
}

/* AC 3.5: variable number of arguments, not currently support by AC */
static TyObject *
methodcaller_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    methodcallerobject *mc;
    TyObject *name;

    if (TyTuple_GET_SIZE(args) < 1) {
        TyErr_SetString(TyExc_TypeError, "methodcaller needs at least "
                        "one argument, the method name");
        return NULL;
    }

    name = TyTuple_GET_ITEM(args, 0);
    if (!TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_TypeError,
                        "method name must be a string");
        return NULL;
    }

    _operator_state *state = _TyType_GetModuleState(type);
    /* create methodcallerobject structure */
    mc = PyObject_GC_New(methodcallerobject, (TyTypeObject *)state->methodcaller_type);
    if (mc == NULL) {
        return NULL;
    }
    mc->vectorcall = NULL;
    mc->vectorcall_args = NULL;
    mc->vectorcall_kwnames = NULL;
    mc->kwds = Ty_XNewRef(kwds);

    Ty_INCREF(name);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyUnicode_InternMortal(interp, &name);
    mc->name = name;

    mc->args = TyTuple_GetSlice(args, 1, TyTuple_GET_SIZE(args));
    if (mc->args == NULL) {
        Ty_DECREF(mc);
        return NULL;
    }

    Ty_ssize_t vectorcall_size = TyTuple_GET_SIZE(args)
                                   + (kwds ? TyDict_Size(kwds) : 0);
    if (vectorcall_size < (_METHODCALLER_MAX_ARGS)) {
        if (_methodcaller_initialize_vectorcall(mc) < 0) {
            Ty_DECREF(mc);
            return NULL;
        }
    }

    PyObject_GC_Track(mc);
    return (TyObject *)mc;
}

static void
methodcaller_clear(TyObject *op)
{
    methodcallerobject *mc = methodcallerobject_CAST(op);
    Ty_CLEAR(mc->name);
    Ty_CLEAR(mc->args);
    Ty_CLEAR(mc->kwds);
    Ty_CLEAR(mc->vectorcall_args);
    Ty_CLEAR(mc->vectorcall_kwnames);
}

static void
methodcaller_dealloc(TyObject *op)
{
    TyTypeObject *tp = Ty_TYPE(op);
    PyObject_GC_UnTrack(op);
    (void)methodcaller_clear(op);
    tp->tp_free(op);
    Ty_DECREF(tp);
}

static int
methodcaller_traverse(TyObject *op, visitproc visit, void *arg)
{
    methodcallerobject *mc = methodcallerobject_CAST(op);
    Ty_VISIT(mc->name);
    Ty_VISIT(mc->args);
    Ty_VISIT(mc->kwds);
    Ty_VISIT(mc->vectorcall_args);
    Ty_VISIT(mc->vectorcall_kwnames);
    Ty_VISIT(Ty_TYPE(mc));
    return 0;
}

static TyObject *
methodcaller_call(TyObject *op, TyObject *args, TyObject *kw)
{
    TyObject *method, *obj, *result;
    methodcallerobject *mc = methodcallerobject_CAST(op);

    if (!_TyArg_NoKeywords("methodcaller", kw))
        return NULL;
    if (!_TyArg_CheckPositional("methodcaller", TyTuple_GET_SIZE(args), 1, 1))
        return NULL;
    obj = TyTuple_GET_ITEM(args, 0);
    method = PyObject_GetAttr(obj, mc->name);
    if (method == NULL)
        return NULL;

    result = PyObject_Call(method, mc->args, mc->kwds);
    Ty_DECREF(method);
    return result;
}

static TyObject *
methodcaller_repr(TyObject *op)
{
    methodcallerobject *mc = methodcallerobject_CAST(op);
    TyObject *argreprs, *repr = NULL, *sep, *joinedargreprs;
    Ty_ssize_t numtotalargs, numposargs, numkwdargs, i;
    int status = Ty_ReprEnter(op);
    if (status != 0) {
        if (status < 0)
            return NULL;
        return TyUnicode_FromFormat("%s(...)", Ty_TYPE(mc)->tp_name);
    }

    numkwdargs = mc->kwds != NULL ? TyDict_GET_SIZE(mc->kwds) : 0;
    numposargs = TyTuple_GET_SIZE(mc->args);
    numtotalargs = numposargs + numkwdargs;

    if (numtotalargs == 0) {
        repr = TyUnicode_FromFormat("%s(%R)", Ty_TYPE(mc)->tp_name, mc->name);
        Ty_ReprLeave(op);
        return repr;
    }

    argreprs = TyTuple_New(numtotalargs);
    if (argreprs == NULL) {
        Ty_ReprLeave(op);
        return NULL;
    }

    for (i = 0; i < numposargs; ++i) {
        TyObject *onerepr = PyObject_Repr(TyTuple_GET_ITEM(mc->args, i));
        if (onerepr == NULL)
            goto done;
        TyTuple_SET_ITEM(argreprs, i, onerepr);
    }

    if (numkwdargs != 0) {
        TyObject *key, *value;
        Ty_ssize_t pos = 0;
        while (TyDict_Next(mc->kwds, &pos, &key, &value)) {
            TyObject *onerepr = TyUnicode_FromFormat("%U=%R", key, value);
            if (onerepr == NULL)
                goto done;
            if (i >= numtotalargs) {
                i = -1;
                Ty_DECREF(onerepr);
                break;
            }
            TyTuple_SET_ITEM(argreprs, i, onerepr);
            ++i;
        }
        if (i != numtotalargs) {
            TyErr_SetString(TyExc_RuntimeError,
                            "keywords dict changed size during iteration");
            goto done;
        }
    }

    sep = TyUnicode_FromString(", ");
    if (sep == NULL)
        goto done;

    joinedargreprs = TyUnicode_Join(sep, argreprs);
    Ty_DECREF(sep);
    if (joinedargreprs == NULL)
        goto done;

    repr = TyUnicode_FromFormat("%s(%R, %U)", Ty_TYPE(mc)->tp_name,
                                mc->name, joinedargreprs);
    Ty_DECREF(joinedargreprs);

done:
    Ty_DECREF(argreprs);
    Ty_ReprLeave(op);
    return repr;
}

static TyObject *
methodcaller_reduce(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    methodcallerobject *mc = methodcallerobject_CAST(op);
    if (!mc->kwds || TyDict_GET_SIZE(mc->kwds) == 0) {
        Ty_ssize_t i;
        Ty_ssize_t callargcount = TyTuple_GET_SIZE(mc->args);
        TyObject *newargs = TyTuple_New(1 + callargcount);
        if (newargs == NULL)
            return NULL;
        TyTuple_SET_ITEM(newargs, 0, Ty_NewRef(mc->name));
        for (i = 0; i < callargcount; ++i) {
            TyObject *arg = TyTuple_GET_ITEM(mc->args, i);
            TyTuple_SET_ITEM(newargs, i + 1, Ty_NewRef(arg));
        }
        return Ty_BuildValue("ON", Ty_TYPE(mc), newargs);
    }
    else {
        TyObject *partial;
        TyObject *constructor;
        TyObject *newargs[2];

        partial = TyImport_ImportModuleAttrString("functools", "partial");
        if (!partial)
            return NULL;

        newargs[0] = (TyObject *)Ty_TYPE(mc);
        newargs[1] = mc->name;
        constructor = PyObject_VectorcallDict(partial, newargs, 2, mc->kwds);

        Ty_DECREF(partial);
        return Ty_BuildValue("NO", constructor, mc->args);
    }
}

static TyMethodDef methodcaller_methods[] = {
    {"__reduce__", methodcaller_reduce, METH_NOARGS,
     reduce_doc},
    {NULL}
};

static TyMemberDef methodcaller_members[] = {
    {"__vectorcalloffset__", Ty_T_PYSSIZET, offsetof(methodcallerobject, vectorcall), Py_READONLY},
    {NULL}
};

TyDoc_STRVAR(methodcaller_doc,
"methodcaller(name, /, *args, **kwargs)\n--\n\n\
Return a callable object that calls the given method on its operand.\n\
After f = methodcaller('name'), the call f(r) returns r.name().\n\
After g = methodcaller('name', 'date', foo=1), the call g(r) returns\n\
r.name('date', foo=1).");

static TyType_Slot methodcaller_type_slots[] = {
    {Ty_tp_doc, (void *)methodcaller_doc},
    {Ty_tp_dealloc, methodcaller_dealloc},
    {Ty_tp_call, methodcaller_call},
    {Ty_tp_traverse, methodcaller_traverse},
    {Ty_tp_clear, methodcaller_clear},
    {Ty_tp_methods, methodcaller_methods},
    {Ty_tp_members, methodcaller_members},
    {Ty_tp_getset, common_getset},
    {Ty_tp_new, methodcaller_new},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_repr, methodcaller_repr},
    {0, 0}
};

static TyType_Spec methodcaller_type_spec = {
    .name = "operator.methodcaller",
    .basicsize = sizeof(methodcallerobject),
    .itemsize = 0,
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_HAVE_VECTORCALL | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = methodcaller_type_slots,
};

static int
operator_exec(TyObject *module)
{
    _operator_state *state = get_operator_state(module);
    state->attrgetter_type = TyType_FromModuleAndSpec(module, &attrgetter_type_spec, NULL);
    if (state->attrgetter_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, (TyTypeObject *)state->attrgetter_type) < 0) {
        return -1;
    }

    state->itemgetter_type = TyType_FromModuleAndSpec(module, &itemgetter_type_spec, NULL);
    if (state->itemgetter_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, (TyTypeObject *)state->itemgetter_type) < 0) {
        return -1;
    }

    state->methodcaller_type = TyType_FromModuleAndSpec(module, &methodcaller_type_spec, NULL);
    if (state->methodcaller_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, (TyTypeObject *)state->methodcaller_type) < 0) {
        return -1;
    }

    return 0;
}


static struct PyModuleDef_Slot operator_slots[] = {
    {Ty_mod_exec, operator_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
operator_traverse(TyObject *module, visitproc visit, void *arg)
{
    _operator_state *state = get_operator_state(module);
    Ty_VISIT(state->attrgetter_type);
    Ty_VISIT(state->itemgetter_type);
    Ty_VISIT(state->methodcaller_type);
    return 0;
}

static int
operator_clear(TyObject *module)
{
    _operator_state *state = get_operator_state(module);
    Ty_CLEAR(state->attrgetter_type);
    Ty_CLEAR(state->itemgetter_type);
    Ty_CLEAR(state->methodcaller_type);
    return 0;
}

static void
operator_free(void *module)
{
    (void)operator_clear((TyObject *)module);
}

static struct TyModuleDef operatormodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_operator",
    .m_doc = operator_doc,
    .m_size = sizeof(_operator_state),
    .m_methods = operator_methods,
    .m_slots = operator_slots,
    .m_traverse = operator_traverse,
    .m_clear = operator_clear,
    .m_free = operator_free,
};

PyMODINIT_FUNC
PyInit__operator(void)
{
    return PyModuleDef_Init(&operatormodule);
}
