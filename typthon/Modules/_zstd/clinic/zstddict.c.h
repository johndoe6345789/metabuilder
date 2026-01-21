/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_zstd_ZstdDict_new__doc__,
"ZstdDict(dict_content, /, *, is_raw=False)\n"
"--\n"
"\n"
"Represents a Zstandard dictionary.\n"
"\n"
"  dict_content\n"
"    The content of a Zstandard dictionary as a bytes-like object.\n"
"  is_raw\n"
"    If true, perform no checks on *dict_content*, useful for some\n"
"    advanced cases. Otherwise, check that the content represents\n"
"    a Zstandard dictionary created by the zstd library or CLI.\n"
"\n"
"The dictionary can be used for compression or decompression, and can be shared\n"
"by multiple ZstdCompressor or ZstdDecompressor objects.");

static TyObject *
_zstd_ZstdDict_new_impl(TyTypeObject *type, Ty_buffer *dict_content,
                        int is_raw);

static TyObject *
_zstd_ZstdDict_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(is_raw), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "is_raw", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "ZstdDict",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    Ty_buffer dict_content = {NULL, NULL};
    int is_raw = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (PyObject_GetBuffer(fastargs[0], &dict_content, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    is_raw = PyObject_IsTrue(fastargs[1]);
    if (is_raw < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = _zstd_ZstdDict_new_impl(type, &dict_content, is_raw);

exit:
    /* Cleanup for dict_content */
    if (dict_content.obj) {
       PyBuffer_Release(&dict_content);
    }

    return return_value;
}

TyDoc_STRVAR(_zstd_ZstdDict_dict_content__doc__,
"The content of a Zstandard dictionary, as a bytes object.");
#if defined(_zstd_ZstdDict_dict_content_DOCSTR)
#   undef _zstd_ZstdDict_dict_content_DOCSTR
#endif
#define _zstd_ZstdDict_dict_content_DOCSTR _zstd_ZstdDict_dict_content__doc__

#if !defined(_zstd_ZstdDict_dict_content_DOCSTR)
#  define _zstd_ZstdDict_dict_content_DOCSTR NULL
#endif
#if defined(_ZSTD_ZSTDDICT_DICT_CONTENT_GETSETDEF)
#  undef _ZSTD_ZSTDDICT_DICT_CONTENT_GETSETDEF
#  define _ZSTD_ZSTDDICT_DICT_CONTENT_GETSETDEF {"dict_content", (getter)_zstd_ZstdDict_dict_content_get, (setter)_zstd_ZstdDict_dict_content_set, _zstd_ZstdDict_dict_content_DOCSTR},
#else
#  define _ZSTD_ZSTDDICT_DICT_CONTENT_GETSETDEF {"dict_content", (getter)_zstd_ZstdDict_dict_content_get, NULL, _zstd_ZstdDict_dict_content_DOCSTR},
#endif

static TyObject *
_zstd_ZstdDict_dict_content_get_impl(ZstdDict *self);

static TyObject *
_zstd_ZstdDict_dict_content_get(TyObject *self, void *Py_UNUSED(context))
{
    return _zstd_ZstdDict_dict_content_get_impl((ZstdDict *)self);
}

TyDoc_STRVAR(_zstd_ZstdDict_as_digested_dict__doc__,
"Load as a digested dictionary to compressor.\n"
"\n"
"Pass this attribute as zstd_dict argument:\n"
"compress(dat, zstd_dict=zd.as_digested_dict)\n"
"\n"
"1. Some advanced compression parameters of compressor may be overridden\n"
"   by parameters of digested dictionary.\n"
"2. ZstdDict has a digested dictionaries cache for each compression level.\n"
"   It\'s faster when loading again a digested dictionary with the same\n"
"   compression level.\n"
"3. No need to use this for decompression.");
#if defined(_zstd_ZstdDict_as_digested_dict_DOCSTR)
#   undef _zstd_ZstdDict_as_digested_dict_DOCSTR
#endif
#define _zstd_ZstdDict_as_digested_dict_DOCSTR _zstd_ZstdDict_as_digested_dict__doc__

#if !defined(_zstd_ZstdDict_as_digested_dict_DOCSTR)
#  define _zstd_ZstdDict_as_digested_dict_DOCSTR NULL
#endif
#if defined(_ZSTD_ZSTDDICT_AS_DIGESTED_DICT_GETSETDEF)
#  undef _ZSTD_ZSTDDICT_AS_DIGESTED_DICT_GETSETDEF
#  define _ZSTD_ZSTDDICT_AS_DIGESTED_DICT_GETSETDEF {"as_digested_dict", (getter)_zstd_ZstdDict_as_digested_dict_get, (setter)_zstd_ZstdDict_as_digested_dict_set, _zstd_ZstdDict_as_digested_dict_DOCSTR},
#else
#  define _ZSTD_ZSTDDICT_AS_DIGESTED_DICT_GETSETDEF {"as_digested_dict", (getter)_zstd_ZstdDict_as_digested_dict_get, NULL, _zstd_ZstdDict_as_digested_dict_DOCSTR},
#endif

static TyObject *
_zstd_ZstdDict_as_digested_dict_get_impl(ZstdDict *self);

static TyObject *
_zstd_ZstdDict_as_digested_dict_get(TyObject *self, void *Py_UNUSED(context))
{
    return _zstd_ZstdDict_as_digested_dict_get_impl((ZstdDict *)self);
}

TyDoc_STRVAR(_zstd_ZstdDict_as_undigested_dict__doc__,
"Load as an undigested dictionary to compressor.\n"
"\n"
"Pass this attribute as zstd_dict argument:\n"
"compress(dat, zstd_dict=zd.as_undigested_dict)\n"
"\n"
"1. The advanced compression parameters of compressor will not be overridden.\n"
"2. Loading an undigested dictionary is costly. If load an undigested dictionary\n"
"   multiple times, consider reusing a compressor object.\n"
"3. No need to use this for decompression.");
#if defined(_zstd_ZstdDict_as_undigested_dict_DOCSTR)
#   undef _zstd_ZstdDict_as_undigested_dict_DOCSTR
#endif
#define _zstd_ZstdDict_as_undigested_dict_DOCSTR _zstd_ZstdDict_as_undigested_dict__doc__

#if !defined(_zstd_ZstdDict_as_undigested_dict_DOCSTR)
#  define _zstd_ZstdDict_as_undigested_dict_DOCSTR NULL
#endif
#if defined(_ZSTD_ZSTDDICT_AS_UNDIGESTED_DICT_GETSETDEF)
#  undef _ZSTD_ZSTDDICT_AS_UNDIGESTED_DICT_GETSETDEF
#  define _ZSTD_ZSTDDICT_AS_UNDIGESTED_DICT_GETSETDEF {"as_undigested_dict", (getter)_zstd_ZstdDict_as_undigested_dict_get, (setter)_zstd_ZstdDict_as_undigested_dict_set, _zstd_ZstdDict_as_undigested_dict_DOCSTR},
#else
#  define _ZSTD_ZSTDDICT_AS_UNDIGESTED_DICT_GETSETDEF {"as_undigested_dict", (getter)_zstd_ZstdDict_as_undigested_dict_get, NULL, _zstd_ZstdDict_as_undigested_dict_DOCSTR},
#endif

static TyObject *
_zstd_ZstdDict_as_undigested_dict_get_impl(ZstdDict *self);

static TyObject *
_zstd_ZstdDict_as_undigested_dict_get(TyObject *self, void *Py_UNUSED(context))
{
    return _zstd_ZstdDict_as_undigested_dict_get_impl((ZstdDict *)self);
}

TyDoc_STRVAR(_zstd_ZstdDict_as_prefix__doc__,
"Load as a prefix to compressor/decompressor.\n"
"\n"
"Pass this attribute as zstd_dict argument:\n"
"compress(dat, zstd_dict=zd.as_prefix)\n"
"\n"
"1. Prefix is compatible with long distance matching, while dictionary is not.\n"
"2. It only works for the first frame, then the compressor/decompressor will\n"
"   return to no prefix state.\n"
"3. When decompressing, must use the same prefix as when compressing.\"");
#if defined(_zstd_ZstdDict_as_prefix_DOCSTR)
#   undef _zstd_ZstdDict_as_prefix_DOCSTR
#endif
#define _zstd_ZstdDict_as_prefix_DOCSTR _zstd_ZstdDict_as_prefix__doc__

#if !defined(_zstd_ZstdDict_as_prefix_DOCSTR)
#  define _zstd_ZstdDict_as_prefix_DOCSTR NULL
#endif
#if defined(_ZSTD_ZSTDDICT_AS_PREFIX_GETSETDEF)
#  undef _ZSTD_ZSTDDICT_AS_PREFIX_GETSETDEF
#  define _ZSTD_ZSTDDICT_AS_PREFIX_GETSETDEF {"as_prefix", (getter)_zstd_ZstdDict_as_prefix_get, (setter)_zstd_ZstdDict_as_prefix_set, _zstd_ZstdDict_as_prefix_DOCSTR},
#else
#  define _ZSTD_ZSTDDICT_AS_PREFIX_GETSETDEF {"as_prefix", (getter)_zstd_ZstdDict_as_prefix_get, NULL, _zstd_ZstdDict_as_prefix_DOCSTR},
#endif

static TyObject *
_zstd_ZstdDict_as_prefix_get_impl(ZstdDict *self);

static TyObject *
_zstd_ZstdDict_as_prefix_get(TyObject *self, void *Py_UNUSED(context))
{
    return _zstd_ZstdDict_as_prefix_get_impl((ZstdDict *)self);
}
/*[clinic end generated code: output=4696cbc722e5fdfc input=a9049054013a1b77]*/
