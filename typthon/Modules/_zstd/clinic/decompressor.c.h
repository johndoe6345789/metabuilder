/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_zstd_ZstdDecompressor_new__doc__,
"ZstdDecompressor(zstd_dict=None, options=None)\n"
"--\n"
"\n"
"Create a decompressor object for decompressing data incrementally.\n"
"\n"
"  zstd_dict\n"
"    A ZstdDict object, a pre-trained Zstandard dictionary.\n"
"  options\n"
"    A dict object that contains advanced decompression parameters.\n"
"\n"
"Thread-safe at method level. For one-shot decompression, use the decompress()\n"
"function instead.");

static TyObject *
_zstd_ZstdDecompressor_new_impl(TyTypeObject *type, TyObject *zstd_dict,
                                TyObject *options);

static TyObject *
_zstd_ZstdDecompressor_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(zstd_dict), &_Ty_ID(options), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"zstd_dict", "options", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "ZstdDecompressor",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *zstd_dict = Ty_None;
    TyObject *options = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        zstd_dict = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    options = fastargs[1];
skip_optional_pos:
    return_value = _zstd_ZstdDecompressor_new_impl(type, zstd_dict, options);

exit:
    return return_value;
}

TyDoc_STRVAR(_zstd_ZstdDecompressor_unused_data__doc__,
"A bytes object of un-consumed input data.\n"
"\n"
"When ZstdDecompressor object stops after a frame is\n"
"decompressed, unused input data after the frame. Otherwise this will be b\'\'.");
#if defined(_zstd_ZstdDecompressor_unused_data_DOCSTR)
#   undef _zstd_ZstdDecompressor_unused_data_DOCSTR
#endif
#define _zstd_ZstdDecompressor_unused_data_DOCSTR _zstd_ZstdDecompressor_unused_data__doc__

#if !defined(_zstd_ZstdDecompressor_unused_data_DOCSTR)
#  define _zstd_ZstdDecompressor_unused_data_DOCSTR NULL
#endif
#if defined(_ZSTD_ZSTDDECOMPRESSOR_UNUSED_DATA_GETSETDEF)
#  undef _ZSTD_ZSTDDECOMPRESSOR_UNUSED_DATA_GETSETDEF
#  define _ZSTD_ZSTDDECOMPRESSOR_UNUSED_DATA_GETSETDEF {"unused_data", (getter)_zstd_ZstdDecompressor_unused_data_get, (setter)_zstd_ZstdDecompressor_unused_data_set, _zstd_ZstdDecompressor_unused_data_DOCSTR},
#else
#  define _ZSTD_ZSTDDECOMPRESSOR_UNUSED_DATA_GETSETDEF {"unused_data", (getter)_zstd_ZstdDecompressor_unused_data_get, NULL, _zstd_ZstdDecompressor_unused_data_DOCSTR},
#endif

static TyObject *
_zstd_ZstdDecompressor_unused_data_get_impl(ZstdDecompressor *self);

static TyObject *
_zstd_ZstdDecompressor_unused_data_get(TyObject *self, void *Py_UNUSED(context))
{
    return _zstd_ZstdDecompressor_unused_data_get_impl((ZstdDecompressor *)self);
}

TyDoc_STRVAR(_zstd_ZstdDecompressor_decompress__doc__,
"decompress($self, /, data, max_length=-1)\n"
"--\n"
"\n"
"Decompress *data*, returning uncompressed bytes if possible, or b\'\' otherwise.\n"
"\n"
"  data\n"
"    A bytes-like object, Zstandard data to be decompressed.\n"
"  max_length\n"
"    Maximum size of returned data. When it is negative, the size of\n"
"    output buffer is unlimited. When it is nonnegative, returns at\n"
"    most max_length bytes of decompressed data.\n"
"\n"
"If *max_length* is nonnegative, returns at most *max_length* bytes of\n"
"decompressed data. If this limit is reached and further output can be\n"
"produced, *self.needs_input* will be set to ``False``. In this case, the next\n"
"call to *decompress()* may provide *data* as b\'\' to obtain more of the output.\n"
"\n"
"If all of the input data was decompressed and returned (either because this\n"
"was less than *max_length* bytes, or because *max_length* was negative),\n"
"*self.needs_input* will be set to True.\n"
"\n"
"Attempting to decompress data after the end of a frame is reached raises an\n"
"EOFError. Any data found after the end of the frame is ignored and saved in\n"
"the self.unused_data attribute.");

#define _ZSTD_ZSTDDECOMPRESSOR_DECOMPRESS_METHODDEF    \
    {"decompress", _PyCFunction_CAST(_zstd_ZstdDecompressor_decompress), METH_FASTCALL|METH_KEYWORDS, _zstd_ZstdDecompressor_decompress__doc__},

static TyObject *
_zstd_ZstdDecompressor_decompress_impl(ZstdDecompressor *self,
                                       Ty_buffer *data,
                                       Ty_ssize_t max_length);

static TyObject *
_zstd_ZstdDecompressor_decompress(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(max_length), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "max_length", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "decompress",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    Ty_ssize_t max_length = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        max_length = ival;
    }
skip_optional_pos:
    return_value = _zstd_ZstdDecompressor_decompress_impl((ZstdDecompressor *)self, &data, max_length);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}
/*[clinic end generated code: output=30c12ef047027ede input=a9049054013a1b77]*/
