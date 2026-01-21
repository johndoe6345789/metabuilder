/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(SHA1Type_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define SHA1TYPE_COPY_METHODDEF    \
    {"copy", _PyCFunction_CAST(SHA1Type_copy), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, SHA1Type_copy__doc__},

static TyObject *
SHA1Type_copy_impl(SHA1object *self, TyTypeObject *cls);

static TyObject *
SHA1Type_copy(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "copy() takes no arguments");
        return NULL;
    }
    return SHA1Type_copy_impl((SHA1object *)self, cls);
}

TyDoc_STRVAR(SHA1Type_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define SHA1TYPE_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)SHA1Type_digest, METH_NOARGS, SHA1Type_digest__doc__},

static TyObject *
SHA1Type_digest_impl(SHA1object *self);

static TyObject *
SHA1Type_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA1Type_digest_impl((SHA1object *)self);
}

TyDoc_STRVAR(SHA1Type_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define SHA1TYPE_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)SHA1Type_hexdigest, METH_NOARGS, SHA1Type_hexdigest__doc__},

static TyObject *
SHA1Type_hexdigest_impl(SHA1object *self);

static TyObject *
SHA1Type_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return SHA1Type_hexdigest_impl((SHA1object *)self);
}

TyDoc_STRVAR(SHA1Type_update__doc__,
"update($self, obj, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided string.");

#define SHA1TYPE_UPDATE_METHODDEF    \
    {"update", (PyCFunction)SHA1Type_update, METH_O, SHA1Type_update__doc__},

static TyObject *
SHA1Type_update_impl(SHA1object *self, TyObject *obj);

static TyObject *
SHA1Type_update(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    return_value = SHA1Type_update_impl((SHA1object *)self, obj);

    return return_value;
}

TyDoc_STRVAR(_sha1_sha1__doc__,
"sha1($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new SHA1 hash object; optionally initialized with a string.");

#define _SHA1_SHA1_METHODDEF    \
    {"sha1", _PyCFunction_CAST(_sha1_sha1), METH_FASTCALL|METH_KEYWORDS, _sha1_sha1__doc__},

static TyObject *
_sha1_sha1_impl(TyObject *module, TyObject *data, int usedforsecurity,
                TyObject *string_obj);

static TyObject *
_sha1_sha1(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "sha1",
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
    return_value = _sha1_sha1_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}
/*[clinic end generated code: output=fd5a917404b68c4f input=a9049054013a1b77]*/
