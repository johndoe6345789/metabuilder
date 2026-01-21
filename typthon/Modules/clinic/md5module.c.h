/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Py_BUILD_CORE) && !defined(Py_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(MD5Type_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define MD5TYPE_COPY_METHODDEF    \
    {"copy", _PyCFunction_CAST(MD5Type_copy), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, MD5Type_copy__doc__},

static TyObject *
MD5Type_copy_impl(MD5object *self, TyTypeObject *cls);

static TyObject *
MD5Type_copy(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "copy() takes no arguments");
        return NULL;
    }
    return MD5Type_copy_impl((MD5object *)self, cls);
}

TyDoc_STRVAR(MD5Type_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define MD5TYPE_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)MD5Type_digest, METH_NOARGS, MD5Type_digest__doc__},

static TyObject *
MD5Type_digest_impl(MD5object *self);

static TyObject *
MD5Type_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return MD5Type_digest_impl((MD5object *)self);
}

TyDoc_STRVAR(MD5Type_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define MD5TYPE_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)MD5Type_hexdigest, METH_NOARGS, MD5Type_hexdigest__doc__},

static TyObject *
MD5Type_hexdigest_impl(MD5object *self);

static TyObject *
MD5Type_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return MD5Type_hexdigest_impl((MD5object *)self);
}

TyDoc_STRVAR(MD5Type_update__doc__,
"update($self, obj, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided string.");

#define MD5TYPE_UPDATE_METHODDEF    \
    {"update", (PyCFunction)MD5Type_update, METH_O, MD5Type_update__doc__},

static TyObject *
MD5Type_update_impl(MD5object *self, TyObject *obj);

static TyObject *
MD5Type_update(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    return_value = MD5Type_update_impl((MD5object *)self, obj);

    return return_value;
}

TyDoc_STRVAR(_md5_md5__doc__,
"md5($module, /, data=b\'\', *, usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new MD5 hash object; optionally initialized with a string.");

#define _MD5_MD5_METHODDEF    \
    {"md5", _PyCFunction_CAST(_md5_md5), METH_FASTCALL|METH_KEYWORDS, _md5_md5__doc__},

static TyObject *
_md5_md5_impl(TyObject *module, TyObject *data, int usedforsecurity,
              TyObject *string_obj);

static TyObject *
_md5_md5(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Py_BUILD_CORE) && !defined(Py_BUILD_CORE_MODULE)

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

    #else  // !Py_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Py_BUILD_CORE

    static const char * const _keywords[] = {"data", "usedforsecurity", "string", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "md5",
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
    return_value = _md5_md5_impl(module, data, usedforsecurity, string_obj);

exit:
    return return_value;
}
/*[clinic end generated code: output=920fe54b9ed06f92 input=a9049054013a1b77]*/
