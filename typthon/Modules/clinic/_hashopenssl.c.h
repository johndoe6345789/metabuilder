/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_long.h"          // _TyLong_UnsignedLong_Converter()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(EVP_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define EVP_COPY_METHODDEF    \
    {"copy", (PyCFunction)EVP_copy, METH_NOARGS, EVP_copy__doc__},

static TyObject *
EVP_copy_impl(EVPobject *self);

static TyObject *
EVP_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return EVP_copy_impl((EVPobject *)self);
}

TyDoc_STRVAR(EVP_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define EVP_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)EVP_digest, METH_NOARGS, EVP_digest__doc__},

static TyObject *
EVP_digest_impl(EVPobject *self);

static TyObject *
EVP_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return EVP_digest_impl((EVPobject *)self);
}

TyDoc_STRVAR(EVP_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define EVP_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)EVP_hexdigest, METH_NOARGS, EVP_hexdigest__doc__},

static TyObject *
EVP_hexdigest_impl(EVPobject *self);

static TyObject *
EVP_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return EVP_hexdigest_impl((EVPobject *)self);
}

TyDoc_STRVAR(EVP_update__doc__,
"update($self, obj, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided string.");

#define EVP_UPDATE_METHODDEF    \
    {"update", (PyCFunction)EVP_update, METH_O, EVP_update__doc__},

static TyObject *
EVP_update_impl(EVPobject *self, TyObject *obj);

static TyObject *
EVP_update(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    return_value = EVP_update_impl((EVPobject *)self, obj);

    return return_value;
}

#if defined(PY_OPENSSL_HAS_SHAKE)

TyDoc_STRVAR(EVPXOF_digest__doc__,
"digest($self, /, length)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define EVPXOF_DIGEST_METHODDEF    \
    {"digest", _PyCFunction_CAST(EVPXOF_digest), METH_FASTCALL|METH_KEYWORDS, EVPXOF_digest__doc__},

static TyObject *
EVPXOF_digest_impl(EVPobject *self, Ty_ssize_t length);

static TyObject *
EVPXOF_digest(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    Ty_ssize_t length;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        length = ival;
    }
    return_value = EVPXOF_digest_impl((EVPobject *)self, length);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHAKE) */

#if defined(PY_OPENSSL_HAS_SHAKE)

TyDoc_STRVAR(EVPXOF_hexdigest__doc__,
"hexdigest($self, /, length)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define EVPXOF_HEXDIGEST_METHODDEF    \
    {"hexdigest", _PyCFunction_CAST(EVPXOF_hexdigest), METH_FASTCALL|METH_KEYWORDS, EVPXOF_hexdigest__doc__},

static TyObject *
EVPXOF_hexdigest_impl(EVPobject *self, Ty_ssize_t length);

static TyObject *
EVPXOF_hexdigest(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    Ty_ssize_t length;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        length = ival;
    }
    return_value = EVPXOF_hexdigest_impl((EVPobject *)self, length);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHAKE) */

TyDoc_STRVAR(_hashlib_new__doc__,
"new($module, /, name, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new hash object using the named algorithm.\n"
"\n"
"An optional string argument may be provided and will be\n"
"automatically hashed.\n"
"\n"
"The MD5 and SHA1 algorithms are always supported.");

#define _HASHLIB_NEW_METHODDEF    \
    {"new", _PyCFunction_CAST(_hashlib_new), METH_FASTCALL|METH_KEYWORDS, _hashlib_new__doc__},

static TyObject *
_hashlib_new_impl(TyObject *module, const char *name, TyObject *data,
                  int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_new(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(data), &_Ty_ID(usedforsecurity), &_Ty_ID(string), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "data", "usedforsecurity", "string", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "new",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    const char *name;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("new", "argument 'name'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        data = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        usedforsecurity = PyObject_IsTrue(args[2]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string = args[3];
skip_optional_kwonly:
    return_value = _hashlib_new_impl(module, name, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_md5__doc__,
"openssl_md5($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Returns a md5 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_MD5_METHODDEF    \
    {"openssl_md5", _PyCFunction_CAST(_hashlib_openssl_md5), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_md5__doc__},

static TyObject *
_hashlib_openssl_md5_impl(TyObject *module, TyObject *data,
                          int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_md5(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_md5",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_md5_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_sha1__doc__,
"openssl_sha1($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Returns a sha1 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA1_METHODDEF    \
    {"openssl_sha1", _PyCFunction_CAST(_hashlib_openssl_sha1), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha1__doc__},

static TyObject *
_hashlib_openssl_sha1_impl(TyObject *module, TyObject *data,
                           int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha1",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha1_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_sha224__doc__,
"openssl_sha224($module, /, data=b\'\', *, usedforsecurity=True,\n"
"               string=None)\n"
"--\n"
"\n"
"Returns a sha224 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA224_METHODDEF    \
    {"openssl_sha224", _PyCFunction_CAST(_hashlib_openssl_sha224), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha224__doc__},

static TyObject *
_hashlib_openssl_sha224_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha224(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha224",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha224_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_sha256__doc__,
"openssl_sha256($module, /, data=b\'\', *, usedforsecurity=True,\n"
"               string=None)\n"
"--\n"
"\n"
"Returns a sha256 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA256_METHODDEF    \
    {"openssl_sha256", _PyCFunction_CAST(_hashlib_openssl_sha256), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha256__doc__},

static TyObject *
_hashlib_openssl_sha256_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha256(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha256",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha256_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_sha384__doc__,
"openssl_sha384($module, /, data=b\'\', *, usedforsecurity=True,\n"
"               string=None)\n"
"--\n"
"\n"
"Returns a sha384 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA384_METHODDEF    \
    {"openssl_sha384", _PyCFunction_CAST(_hashlib_openssl_sha384), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha384__doc__},

static TyObject *
_hashlib_openssl_sha384_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha384(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha384",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha384_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_openssl_sha512__doc__,
"openssl_sha512($module, /, data=b\'\', *, usedforsecurity=True,\n"
"               string=None)\n"
"--\n"
"\n"
"Returns a sha512 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA512_METHODDEF    \
    {"openssl_sha512", _PyCFunction_CAST(_hashlib_openssl_sha512), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha512__doc__},

static TyObject *
_hashlib_openssl_sha512_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha512(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha512",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha512_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#if defined(PY_OPENSSL_HAS_SHA3)

TyDoc_STRVAR(_hashlib_openssl_sha3_224__doc__,
"openssl_sha3_224($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                 string=None)\n"
"--\n"
"\n"
"Returns a sha3-224 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA3_224_METHODDEF    \
    {"openssl_sha3_224", _PyCFunction_CAST(_hashlib_openssl_sha3_224), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha3_224__doc__},

static TyObject *
_hashlib_openssl_sha3_224_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha3_224(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha3_224",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha3_224_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHA3) */

#if defined(PY_OPENSSL_HAS_SHA3)

TyDoc_STRVAR(_hashlib_openssl_sha3_256__doc__,
"openssl_sha3_256($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                 string=None)\n"
"--\n"
"\n"
"Returns a sha3-256 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA3_256_METHODDEF    \
    {"openssl_sha3_256", _PyCFunction_CAST(_hashlib_openssl_sha3_256), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha3_256__doc__},

static TyObject *
_hashlib_openssl_sha3_256_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha3_256(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha3_256",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha3_256_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHA3) */

#if defined(PY_OPENSSL_HAS_SHA3)

TyDoc_STRVAR(_hashlib_openssl_sha3_384__doc__,
"openssl_sha3_384($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                 string=None)\n"
"--\n"
"\n"
"Returns a sha3-384 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA3_384_METHODDEF    \
    {"openssl_sha3_384", _PyCFunction_CAST(_hashlib_openssl_sha3_384), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha3_384__doc__},

static TyObject *
_hashlib_openssl_sha3_384_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha3_384(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha3_384",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha3_384_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHA3) */

#if defined(PY_OPENSSL_HAS_SHA3)

TyDoc_STRVAR(_hashlib_openssl_sha3_512__doc__,
"openssl_sha3_512($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                 string=None)\n"
"--\n"
"\n"
"Returns a sha3-512 hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHA3_512_METHODDEF    \
    {"openssl_sha3_512", _PyCFunction_CAST(_hashlib_openssl_sha3_512), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_sha3_512__doc__},

static TyObject *
_hashlib_openssl_sha3_512_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_sha3_512(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_sha3_512",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_sha3_512_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHA3) */

#if defined(PY_OPENSSL_HAS_SHAKE)

TyDoc_STRVAR(_hashlib_openssl_shake_128__doc__,
"openssl_shake_128($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                  string=None)\n"
"--\n"
"\n"
"Returns a shake-128 variable hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHAKE_128_METHODDEF    \
    {"openssl_shake_128", _PyCFunction_CAST(_hashlib_openssl_shake_128), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_shake_128__doc__},

static TyObject *
_hashlib_openssl_shake_128_impl(TyObject *module, TyObject *data,
                                int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_shake_128(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_shake_128",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_shake_128_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHAKE) */

#if defined(PY_OPENSSL_HAS_SHAKE)

TyDoc_STRVAR(_hashlib_openssl_shake_256__doc__,
"openssl_shake_256($module, /, data=b\'\', *, usedforsecurity=True,\n"
"                  string=None)\n"
"--\n"
"\n"
"Returns a shake-256 variable hash object; optionally initialized with a string");

#define _HASHLIB_OPENSSL_SHAKE_256_METHODDEF    \
    {"openssl_shake_256", _PyCFunction_CAST(_hashlib_openssl_shake_256), METH_FASTCALL|METH_KEYWORDS, _hashlib_openssl_shake_256__doc__},

static TyObject *
_hashlib_openssl_shake_256_impl(TyObject *module, TyObject *data,
                                int usedforsecurity, TyObject *string);

static TyObject *
_hashlib_openssl_shake_256(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "openssl_shake_256",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *data = NULL;
    int usedforsecurity = 1;
    TyObject *string = NULL;

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
    string = args[2];
skip_optional_kwonly:
    return_value = _hashlib_openssl_shake_256_impl(module, data, usedforsecurity, string);

exit:
    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SHAKE) */

TyDoc_STRVAR(pbkdf2_hmac__doc__,
"pbkdf2_hmac($module, /, hash_name, password, salt, iterations,\n"
"            dklen=None)\n"
"--\n"
"\n"
"Password based key derivation function 2 (PKCS #5 v2.0) with HMAC as pseudorandom function.");

#define PBKDF2_HMAC_METHODDEF    \
    {"pbkdf2_hmac", _PyCFunction_CAST(pbkdf2_hmac), METH_FASTCALL|METH_KEYWORDS, pbkdf2_hmac__doc__},

static TyObject *
pbkdf2_hmac_impl(TyObject *module, const char *hash_name,
                 Ty_buffer *password, Ty_buffer *salt, long iterations,
                 TyObject *dklen_obj);

static TyObject *
pbkdf2_hmac(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(hash_name), &_Ty_ID(password), &_Ty_ID(salt), &_Ty_ID(iterations), &_Ty_ID(dklen), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"hash_name", "password", "salt", "iterations", "dklen", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "pbkdf2_hmac",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 4;
    const char *hash_name;
    Ty_buffer password = {NULL, NULL};
    Ty_buffer salt = {NULL, NULL};
    long iterations;
    TyObject *dklen_obj = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 5, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("pbkdf2_hmac", "argument 'hash_name'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t hash_name_length;
    hash_name = TyUnicode_AsUTF8AndSize(args[0], &hash_name_length);
    if (hash_name == NULL) {
        goto exit;
    }
    if (strlen(hash_name) != (size_t)hash_name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &password, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[2], &salt, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    iterations = TyLong_AsLong(args[3]);
    if (iterations == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    dklen_obj = args[4];
skip_optional_pos:
    return_value = pbkdf2_hmac_impl(module, hash_name, &password, &salt, iterations, dklen_obj);

exit:
    /* Cleanup for password */
    if (password.obj) {
       PyBuffer_Release(&password);
    }
    /* Cleanup for salt */
    if (salt.obj) {
       PyBuffer_Release(&salt);
    }

    return return_value;
}

#if defined(PY_OPENSSL_HAS_SCRYPT)

TyDoc_STRVAR(_hashlib_scrypt__doc__,
"scrypt($module, /, password, *, salt, n, r, p, maxmem=0, dklen=64)\n"
"--\n"
"\n"
"scrypt password-based key derivation function.");

#define _HASHLIB_SCRYPT_METHODDEF    \
    {"scrypt", _PyCFunction_CAST(_hashlib_scrypt), METH_FASTCALL|METH_KEYWORDS, _hashlib_scrypt__doc__},

static TyObject *
_hashlib_scrypt_impl(TyObject *module, Ty_buffer *password, Ty_buffer *salt,
                     unsigned long n, unsigned long r, unsigned long p,
                     long maxmem, long dklen);

static TyObject *
_hashlib_scrypt(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(password), &_Ty_ID(salt), _Ty_LATIN1_CHR('n'), _Ty_LATIN1_CHR('r'), _Ty_LATIN1_CHR('p'), &_Ty_ID(maxmem), &_Ty_ID(dklen), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"password", "salt", "n", "r", "p", "maxmem", "dklen", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "scrypt",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[7];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 5;
    Ty_buffer password = {NULL, NULL};
    Ty_buffer salt = {NULL, NULL};
    unsigned long n;
    unsigned long r;
    unsigned long p;
    long maxmem = 0;
    long dklen = 64;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 4, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &password, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &salt, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &n)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[3], &r)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[4], &p)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[5]) {
        maxmem = TyLong_AsLong(args[5]);
        if (maxmem == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    dklen = TyLong_AsLong(args[6]);
    if (dklen == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = _hashlib_scrypt_impl(module, &password, &salt, n, r, p, maxmem, dklen);

exit:
    /* Cleanup for password */
    if (password.obj) {
       PyBuffer_Release(&password);
    }
    /* Cleanup for salt */
    if (salt.obj) {
       PyBuffer_Release(&salt);
    }

    return return_value;
}

#endif /* defined(PY_OPENSSL_HAS_SCRYPT) */

TyDoc_STRVAR(_hashlib_hmac_singleshot__doc__,
"hmac_digest($module, /, key, msg, digest)\n"
"--\n"
"\n"
"Single-shot HMAC.");

#define _HASHLIB_HMAC_SINGLESHOT_METHODDEF    \
    {"hmac_digest", _PyCFunction_CAST(_hashlib_hmac_singleshot), METH_FASTCALL|METH_KEYWORDS, _hashlib_hmac_singleshot__doc__},

static TyObject *
_hashlib_hmac_singleshot_impl(TyObject *module, Ty_buffer *key,
                              Ty_buffer *msg, TyObject *digest);

static TyObject *
_hashlib_hmac_singleshot(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(msg), &_Ty_ID(digest), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "msg", "digest", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "hmac_digest",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_buffer key = {NULL, NULL};
    Ty_buffer msg = {NULL, NULL};
    TyObject *digest;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &key, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &msg, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    digest = args[2];
    return_value = _hashlib_hmac_singleshot_impl(module, &key, &msg, digest);

exit:
    /* Cleanup for key */
    if (key.obj) {
       PyBuffer_Release(&key);
    }
    /* Cleanup for msg */
    if (msg.obj) {
       PyBuffer_Release(&msg);
    }

    return return_value;
}

TyDoc_STRVAR(_hashlib_hmac_new__doc__,
"hmac_new($module, /, key, msg=b\'\', digestmod=None)\n"
"--\n"
"\n"
"Return a new hmac object.");

#define _HASHLIB_HMAC_NEW_METHODDEF    \
    {"hmac_new", _PyCFunction_CAST(_hashlib_hmac_new), METH_FASTCALL|METH_KEYWORDS, _hashlib_hmac_new__doc__},

static TyObject *
_hashlib_hmac_new_impl(TyObject *module, Ty_buffer *key, TyObject *msg_obj,
                       TyObject *digestmod);

static TyObject *
_hashlib_hmac_new(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(key), &_Ty_ID(msg), &_Ty_ID(digestmod), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "msg", "digestmod", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "hmac_new",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer key = {NULL, NULL};
    TyObject *msg_obj = NULL;
    TyObject *digestmod = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &key, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        msg_obj = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    digestmod = args[2];
skip_optional_pos:
    return_value = _hashlib_hmac_new_impl(module, &key, msg_obj, digestmod);

exit:
    /* Cleanup for key */
    if (key.obj) {
       PyBuffer_Release(&key);
    }

    return return_value;
}

TyDoc_STRVAR(_hashlib_HMAC_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy (\"clone\") of the HMAC object.");

#define _HASHLIB_HMAC_COPY_METHODDEF    \
    {"copy", (PyCFunction)_hashlib_HMAC_copy, METH_NOARGS, _hashlib_HMAC_copy__doc__},

static TyObject *
_hashlib_HMAC_copy_impl(HMACobject *self);

static TyObject *
_hashlib_HMAC_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _hashlib_HMAC_copy_impl((HMACobject *)self);
}

TyDoc_STRVAR(_hashlib_HMAC_update__doc__,
"update($self, /, msg)\n"
"--\n"
"\n"
"Update the HMAC object with msg.");

#define _HASHLIB_HMAC_UPDATE_METHODDEF    \
    {"update", _PyCFunction_CAST(_hashlib_HMAC_update), METH_FASTCALL|METH_KEYWORDS, _hashlib_HMAC_update__doc__},

static TyObject *
_hashlib_HMAC_update_impl(HMACobject *self, TyObject *msg);

static TyObject *
_hashlib_HMAC_update(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(msg), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"msg", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "update",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *msg;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    msg = args[0];
    return_value = _hashlib_HMAC_update_impl((HMACobject *)self, msg);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_HMAC_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest of the bytes passed to the update() method so far.");

#define _HASHLIB_HMAC_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)_hashlib_HMAC_digest, METH_NOARGS, _hashlib_HMAC_digest__doc__},

static TyObject *
_hashlib_HMAC_digest_impl(HMACobject *self);

static TyObject *
_hashlib_HMAC_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _hashlib_HMAC_digest_impl((HMACobject *)self);
}

TyDoc_STRVAR(_hashlib_HMAC_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return hexadecimal digest of the bytes passed to the update() method so far.\n"
"\n"
"This may be used to exchange the value safely in email or other non-binary\n"
"environments.");

#define _HASHLIB_HMAC_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)_hashlib_HMAC_hexdigest, METH_NOARGS, _hashlib_HMAC_hexdigest__doc__},

static TyObject *
_hashlib_HMAC_hexdigest_impl(HMACobject *self);

static TyObject *
_hashlib_HMAC_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _hashlib_HMAC_hexdigest_impl((HMACobject *)self);
}

TyDoc_STRVAR(_hashlib_get_fips_mode__doc__,
"get_fips_mode($module, /)\n"
"--\n"
"\n"
"Determine the OpenSSL FIPS mode of operation.\n"
"\n"
"For OpenSSL 3.0.0 and newer it returns the state of the default provider\n"
"in the default OSSL context. It\'s not quite the same as FIPS_mode() but good\n"
"enough for unittests.\n"
"\n"
"Effectively any non-zero return value indicates FIPS mode;\n"
"values other than 1 may have additional significance.");

#define _HASHLIB_GET_FIPS_MODE_METHODDEF    \
    {"get_fips_mode", (PyCFunction)_hashlib_get_fips_mode, METH_NOARGS, _hashlib_get_fips_mode__doc__},

static int
_hashlib_get_fips_mode_impl(TyObject *module);

static TyObject *
_hashlib_get_fips_mode(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = _hashlib_get_fips_mode_impl(module);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_hashlib_compare_digest__doc__,
"compare_digest($module, a, b, /)\n"
"--\n"
"\n"
"Return \'a == b\'.\n"
"\n"
"This function uses an approach designed to prevent\n"
"timing analysis, making it appropriate for cryptography.\n"
"\n"
"a and b must both be of the same type: either str (ASCII only),\n"
"or any bytes-like object.\n"
"\n"
"Note: If a and b are of different lengths, or if an error occurs,\n"
"a timing attack could theoretically reveal information about the\n"
"types and lengths of a and b--but not their values.");

#define _HASHLIB_COMPARE_DIGEST_METHODDEF    \
    {"compare_digest", _PyCFunction_CAST(_hashlib_compare_digest), METH_FASTCALL, _hashlib_compare_digest__doc__},

static TyObject *
_hashlib_compare_digest_impl(TyObject *module, TyObject *a, TyObject *b);

static TyObject *
_hashlib_compare_digest(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *a;
    TyObject *b;

    if (!_TyArg_CheckPositional("compare_digest", nargs, 2, 2)) {
        goto exit;
    }
    a = args[0];
    b = args[1];
    return_value = _hashlib_compare_digest_impl(module, a, b);

exit:
    return return_value;
}

#ifndef EVPXOF_DIGEST_METHODDEF
    #define EVPXOF_DIGEST_METHODDEF
#endif /* !defined(EVPXOF_DIGEST_METHODDEF) */

#ifndef EVPXOF_HEXDIGEST_METHODDEF
    #define EVPXOF_HEXDIGEST_METHODDEF
#endif /* !defined(EVPXOF_HEXDIGEST_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHA3_224_METHODDEF
    #define _HASHLIB_OPENSSL_SHA3_224_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHA3_224_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHA3_256_METHODDEF
    #define _HASHLIB_OPENSSL_SHA3_256_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHA3_256_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHA3_384_METHODDEF
    #define _HASHLIB_OPENSSL_SHA3_384_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHA3_384_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHA3_512_METHODDEF
    #define _HASHLIB_OPENSSL_SHA3_512_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHA3_512_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHAKE_128_METHODDEF
    #define _HASHLIB_OPENSSL_SHAKE_128_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHAKE_128_METHODDEF) */

#ifndef _HASHLIB_OPENSSL_SHAKE_256_METHODDEF
    #define _HASHLIB_OPENSSL_SHAKE_256_METHODDEF
#endif /* !defined(_HASHLIB_OPENSSL_SHAKE_256_METHODDEF) */

#ifndef _HASHLIB_SCRYPT_METHODDEF
    #define _HASHLIB_SCRYPT_METHODDEF
#endif /* !defined(_HASHLIB_SCRYPT_METHODDEF) */
/*[clinic end generated code: output=a863ec4166ed2fbb input=a9049054013a1b77]*/
