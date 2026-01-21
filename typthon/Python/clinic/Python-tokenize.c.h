/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

static TyObject *
tokenizeriter_new_impl(TyTypeObject *type, TyObject *readline,
                       int extra_tokens, const char *encoding);

static TyObject *
tokenizeriter_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(extra_tokens), &_Ty_ID(encoding), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "extra_tokens", "encoding", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "tokenizeriter",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 2;
    TyObject *readline;
    int extra_tokens;
    const char *encoding = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 1, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    readline = fastargs[0];
    extra_tokens = PyObject_IsTrue(fastargs[1]);
    if (extra_tokens < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!TyUnicode_Check(fastargs[2])) {
        _TyArg_BadArgument("tokenizeriter", "argument 'encoding'", "str", fastargs[2]);
        goto exit;
    }
    Ty_ssize_t encoding_length;
    encoding = TyUnicode_AsUTF8AndSize(fastargs[2], &encoding_length);
    if (encoding == NULL) {
        goto exit;
    }
    if (strlen(encoding) != (size_t)encoding_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_kwonly:
    return_value = tokenizeriter_new_impl(type, readline, extra_tokens, encoding);

exit:
    return return_value;
}
/*[clinic end generated code: output=4c448f34d9c835c0 input=a9049054013a1b77]*/
