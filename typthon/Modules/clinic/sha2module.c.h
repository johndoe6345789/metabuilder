/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(SHA256Type_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define SHA256TYPE_COPY_METHODDEF    \
    {"copy", _PyCFunction_CAST(SHA256Type_copy), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, SHA256Type_copy__doc__},

static TyObject *
SHA256Type_copy_impl(SHA256object *self, TyTypeObject *cls);

static TyObject *
SHA256Type_copy(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "copy() takes no arguments");
        return NULL;
    }
    return SHA256Type_copy_impl((SHA256object *)self, cls);
}

TyDoc_STRVAR(SHA512Type_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define SHA512TYPE_COPY_METHODDEF    \
    {"copy", _PyCFunction_CAST(SHA512Type_copy), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, SHA512Type_copy__doc__},

static TyObject *
SHA512Type_copy_impl(SHA512object *self, TyTypeObject *cls);

static TyObject *
SHA512Type_copy(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "copy() takes no arguments");
        return NULL;
    }
    return SHA512Type_copy_impl((SHA512object *)self, cls);
}

TyDoc_STRVAR(SHA256Type_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define SHA256TYPE_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)SHA256Type_digest, METH_NOARGS, SHA256Type_digest__doc__},

static TyObject *
SHA256Type_digest_impl(SHA256object *self);

static TyObject *
SHA256Type_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA256Type_digest_impl((SHA256object *)self);
}

TyDoc_STRVAR(SHA512Type_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define SHA512TYPE_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)SHA512Type_digest, METH_NOARGS, SHA512Type_digest__doc__},

static TyObject *
SHA512Type_digest_impl(SHA512object *self);

static TyObject *
SHA512Type_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA512Type_digest_impl((SHA512object *)self);
}

TyDoc_STRVAR(SHA256Type_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define SHA256TYPE_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)SHA256Type_hexdigest, METH_NOARGS, SHA256Type_hexdigest__doc__},

static TyObject *
SHA256Type_hexdigest_impl(SHA256object *self);

static TyObject *
SHA256Type_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA256Type_hexdigest_impl((SHA256object *)self);
}

TyDoc_STRVAR(SHA512Type_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define SHA512TYPE_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)SHA512Type_hexdigest, METH_NOARGS, SHA512Type_hexdigest__doc__},

static TyObject *
SHA512Type_hexdigest_impl(SHA512object *self);

static TyObject *
SHA512Type_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA512Type_hexdigest_impl((SHA512object *)self);
}

TyDoc_STRVAR(SHA256Type_update__doc__,
"update($self, obj, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided string.");

#define SHA256TYPE_UPDATE_METHODDEF    \
    {"update", (PyCFunction)SHA256Type_update, METH_O, SHA256Type_update__doc__},

static TyObject *
SHA256Type_update_impl(SHA256object *self, TyObject *obj);

static TyObject *
SHA256Type_update(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    return_value = SHA256Type_update_impl((SHA256object *)self, obj);

    return return_value;
}

TyDoc_STRVAR(SHA512Type_update__doc__,
"update($self, obj, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided string.");

#define SHA512TYPE_UPDATE_METHODDEF    \
    {"update", (PyCFunction)SHA512Type_update, METH_O, SHA512Type_update__doc__},

static TyObject *
SHA512Type_update_impl(SHA512object *self, TyObject *obj);

static TyObject *
SHA512Type_update(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    return_value = SHA512Type_update_impl((SHA512object *)self, obj);

    return return_value;
}

TyDoc_STRVAR(_sha2_sha256__doc__,
"sha256($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA-256 hash object; optionally initialized with a string.");

#define _SHA2_SHA256_METHODDEF    \
    {"sha256", _PyCFunction_CAST(_sha2_sha256), METH_FASTCALL|METH_KEYWORDS, _sha2_sha256__doc__},

static TyObject *
_sha2_sha256_impl(TyObject *module, TyObject *data, int usedforsecurity,
                  TyObject *string_obj);

static TyObject *
_sha2_sha256(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "sha256",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string_obj = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        data = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        usedforsecurity = PyObject_IsTrue(args[1]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string_obj = args[2];
skip_optional_kwonly:
    return_value = _sha2_sha256_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}

TyDoc_STRVAR(_sha2_sha224__doc__,
"sha224($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA-224 hash object; optionally initialized with a string.");

#define _SHA2_SHA224_METHODDEF    \
    {"sha224", _PyCFunction_CAST(_sha2_sha224), METH_FASTCALL|METH_KEYWORDS, _sha2_sha224__doc__},

static TyObject *
_sha2_sha224_impl(TyObject *module, TyObject *data, int usedforsecurity,
                  TyObject *string_obj);

static TyObject *
_sha2_sha224(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "sha224",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string_obj = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        data = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        usedforsecurity = PyObject_IsTrue(args[1]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string_obj = args[2];
skip_optional_kwonly:
    return_value = _sha2_sha224_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}

TyDoc_STRVAR(_sha2_sha512__doc__,
"sha512($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA-512 hash object; optionally initialized with a string.");

#define _SHA2_SHA512_METHODDEF    \
    {"sha512", _PyCFunction_CAST(_sha2_sha512), METH_FASTCALL|METH_KEYWORDS, _sha2_sha512__doc__},

static TyObject *
_sha2_sha512_impl(TyObject *module, TyObject *data, int usedforsecurity,
                  TyObject *string_obj);

static TyObject *
_sha2_sha512(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "sha512",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string_obj = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        data = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        usedforsecurity = PyObject_IsTrue(args[1]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string_obj = args[2];
skip_optional_kwonly:
    return_value = _sha2_sha512_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}

TyDoc_STRVAR(_sha2_sha384__doc__,
"sha384($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA-384 hash object; optionally initialized with a string.");

#define _SHA2_SHA384_METHODDEF    \
    {"sha384", _PyCFunction_CAST(_sha2_sha384), METH_FASTCALL|METH_KEYWORDS, _sha2_sha384__doc__},

static TyObject *
_sha2_sha384_impl(TyObject *module, TyObject *data, int usedforsecurity,
                  TyObject *string_obj);

static TyObject *
_sha2_sha384(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "sha384",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string_obj = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        data = args[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        usedforsecurity = PyObject_IsTrue(args[1]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string_obj = args[2];
skip_optional_kwonly:
    return_value = _sha2_sha384_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}
/*[clinic end generated code: output=90625b237c774a9f input=a9049054013a1b77]*/
