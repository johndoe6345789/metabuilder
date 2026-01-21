/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_long.h"          // _TyLong_UnsignedLong_Converter()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(py_sha3_new__doc__,
"sha3_224(data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA3 hash object.");

static TyObject *
py_sha3_new_impl(TyTypeObject *type, TyObject *data_obj, int usedforsecurity,
                 TyObject *string);

static TyObject *
py_sha3_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(data), &_Ty_ID(usedforsecurity), &_Ty_ID(string), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "usedforsecurity", "string", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sha3_224",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *data_obj = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        data_obj = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        usedforsecurity = PyObject_IsTrue(fastargs[1]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string = fastargs[2];
skip_optional_kwonly:
    return_value = py_sha3_new_impl(type, data_obj, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_sha3_sha3_224_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define _SHA3_SHA3_224_COPY_METHODDEF    \
    {"copy", (PyCFunction)_sha3_sha3_224_copy, METH_NOARGS, _sha3_sha3_224_copy__doc__},

static TyObject *
_sha3_sha3_224_copy_impl(SHA3object *self);

static TyObject *
_sha3_sha3_224_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _sha3_sha3_224_copy_impl((SHA3object *)self);
}

TyDoc_STRVAR(_sha3_sha3_224_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define _SHA3_SHA3_224_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)_sha3_sha3_224_digest, METH_NOARGS, _sha3_sha3_224_digest__doc__},

static TyObject *
_sha3_sha3_224_digest_impl(SHA3object *self);

static TyObject *
_sha3_sha3_224_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _sha3_sha3_224_digest_impl((SHA3object *)self);
}

TyDoc_STRVAR(_sha3_sha3_224_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define _SHA3_SHA3_224_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)_sha3_sha3_224_hexdigest, METH_NOARGS, _sha3_sha3_224_hexdigest__doc__},

static TyObject *
_sha3_sha3_224_hexdigest_impl(SHA3object *self);

static TyObject *
_sha3_sha3_224_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _sha3_sha3_224_hexdigest_impl((SHA3object *)self);
}

TyDoc_STRVAR(_sha3_sha3_224_update__doc__,
"update($self, data, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided bytes-like object.");

#define _SHA3_SHA3_224_UPDATE_METHODDEF    \
    {"update", (PyCFunction)_sha3_sha3_224_update, METH_O, _sha3_sha3_224_update__doc__},

static TyObject *
_sha3_sha3_224_update_impl(SHA3object *self, TyObject *data);

static TyObject *
_sha3_sha3_224_update(TyObject *self, TyObject *data)
{
    TyObject *return_value = NULL;

    return_value = _sha3_sha3_224_update_impl((SHA3object *)self, data);

    return return_value;
}

TyDoc_STRVAR(_sha3_shake_128_digest__doc__,
"digest($self, /, length)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define _SHA3_SHAKE_128_DIGEST_METHODDEF    \
    {"digest", _PyCFunction_CAST(_sha3_shake_128_digest), METH_FASTCALL|METH_KEYWORDS, _sha3_shake_128_digest__doc__},

static TyObject *
_sha3_shake_128_digest_impl(SHA3object *self, unsigned long length);

static TyObject *
_sha3_shake_128_digest(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(length), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"length", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "digest",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    unsigned long length;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[0], &length)) {
        goto exit;
    }
    return_value = _sha3_shake_128_digest_impl((SHA3object *)self, length);

exit:
    return return_value;
}

TyDoc_STRVAR(_sha3_shake_128_hexdigest__doc__,
"hexdigest($self, /, length)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define _SHA3_SHAKE_128_HEXDIGEST_METHODDEF    \
    {"hexdigest", _PyCFunction_CAST(_sha3_shake_128_hexdigest), METH_FASTCALL|METH_KEYWORDS, _sha3_shake_128_hexdigest__doc__},

static TyObject *
_sha3_shake_128_hexdigest_impl(SHA3object *self, unsigned long length);

static TyObject *
_sha3_shake_128_hexdigest(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(length), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"length", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "hexdigest",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    unsigned long length;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[0], &length)) {
        goto exit;
    }
    return_value = _sha3_shake_128_hexdigest_impl((SHA3object *)self, length);

exit:
    return return_value;
}
/*[clinic end generated code: output=65e437799472b89f input=a9049054013a1b77]*/
