/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_ssl_Certificate_public_bytes__doc__,
"public_bytes($self, /, format=Encoding.PEM)\n"
"--\n"
"\n");

#define _SSL_CERTIFICATE_PUBLIC_BYTES_METHODDEF    \
    {"public_bytes", _PyCFunction_CAST(_ssl_Certificate_public_bytes), METH_FASTCALL|METH_KEYWORDS, _ssl_Certificate_public_bytes__doc__},

static TyObject *
_ssl_Certificate_public_bytes_impl(PySSLCertificate *self, int format);

static TyObject *
_ssl_Certificate_public_bytes(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(format), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"format", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "public_bytes",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int format = PY_SSL_ENCODING_PEM;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    format = TyLong_AsInt(args[0]);
    if (format == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = _ssl_Certificate_public_bytes_impl((PySSLCertificate *)self, format);

exit:
    return return_value;
}

TyDoc_STRVAR(_ssl_Certificate_get_info__doc__,
"get_info($self, /)\n"
"--\n"
"\n");

#define _SSL_CERTIFICATE_GET_INFO_METHODDEF    \
    {"get_info", (PyCFunction)_ssl_Certificate_get_info, METH_NOARGS, _ssl_Certificate_get_info__doc__},

static TyObject *
_ssl_Certificate_get_info_impl(PySSLCertificate *self);

static TyObject *
_ssl_Certificate_get_info(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _ssl_Certificate_get_info_impl((PySSLCertificate *)self);
}
/*[clinic end generated code: output=bab2dba7dbc1523c input=a9049054013a1b77]*/
