/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_BadArgument()

TyDoc_STRVAR(_lzma_LZMACompressor_compress__doc__,
"compress($self, data, /)\n"
"--\n"
"\n"
"Provide data to the compressor object.\n"
"\n"
"Returns a chunk of compressed data if possible, or b\'\' otherwise.\n"
"\n"
"When you have finished providing data to the compressor, call the\n"
"flush() method to finish the compression process.");

#define _LZMA_LZMACOMPRESSOR_COMPRESS_METHODDEF    \
    {"compress", (PyCFunction)_lzma_LZMACompressor_compress, METH_O, _lzma_LZMACompressor_compress__doc__},

static TyObject *
_lzma_LZMACompressor_compress_impl(Compressor *self, Ty_buffer *data);

static TyObject *
_lzma_LZMACompressor_compress(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};

    if (PyObject_GetBuffer(arg, &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _lzma_LZMACompressor_compress_impl((Compressor *)self, &data);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_lzma_LZMACompressor_flush__doc__,
"flush($self, /)\n"
"--\n"
"\n"
"Finish the compression process.\n"
"\n"
"Returns the compressed data left in internal buffers.\n"
"\n"
"The compressor object may not be used after this method is called.");

#define _LZMA_LZMACOMPRESSOR_FLUSH_METHODDEF    \
    {"flush", (PyCFunction)_lzma_LZMACompressor_flush, METH_NOARGS, _lzma_LZMACompressor_flush__doc__},

static TyObject *
_lzma_LZMACompressor_flush_impl(Compressor *self);

static TyObject *
_lzma_LZMACompressor_flush(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _lzma_LZMACompressor_flush_impl((Compressor *)self);
}

TyDoc_STRVAR(_lzma_LZMADecompressor_decompress__doc__,
"decompress($self, /, data, max_length=-1)\n"
"--\n"
"\n"
"Decompress *data*, returning uncompressed data as bytes.\n"
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
"Attempting to decompress data after the end of stream is reached raises an\n"
"EOFError.  Any data found after the end of the stream is ignored and saved in\n"
"the unused_data attribute.");

#define _LZMA_LZMADECOMPRESSOR_DECOMPRESS_METHODDEF    \
    {"decompress", _PyCFunction_CAST(_lzma_LZMADecompressor_decompress), METH_FASTCALL|METH_KEYWORDS, _lzma_LZMADecompressor_decompress__doc__},

static TyObject *
_lzma_LZMADecompressor_decompress_impl(Decompressor *self, Ty_buffer *data,
                                       Ty_ssize_t max_length);

static TyObject *
_lzma_LZMADecompressor_decompress(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
    return_value = _lzma_LZMADecompressor_decompress_impl((Decompressor *)self, &data, max_length);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(_lzma_LZMADecompressor__doc__,
"LZMADecompressor(format=FORMAT_AUTO, memlimit=None, filters=None)\n"
"--\n"
"\n"
"Create a decompressor object for decompressing data incrementally.\n"
"\n"
"  format\n"
"    Specifies the container format of the input stream.  If this is\n"
"    FORMAT_AUTO (the default), the decompressor will automatically detect\n"
"    whether the input is FORMAT_XZ or FORMAT_ALONE.  Streams created with\n"
"    FORMAT_RAW cannot be autodetected.\n"
"  memlimit\n"
"    Limit the amount of memory used by the decompressor.  This will cause\n"
"    decompression to fail if the input cannot be decompressed within the\n"
"    given limit.\n"
"  filters\n"
"    A custom filter chain.  This argument is required for FORMAT_RAW, and\n"
"    not accepted with any other format.  When provided, this should be a\n"
"    sequence of dicts, each indicating the ID and options for a single\n"
"    filter.\n"
"\n"
"For one-shot decompression, use the decompress() function instead.");

static TyObject *
_lzma_LZMADecompressor_impl(TyTypeObject *type, int format,
                            TyObject *memlimit, TyObject *filters);

static TyObject *
_lzma_LZMADecompressor(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(format), &_Ty_ID(memlimit), &_Ty_ID(filters), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"format", "memlimit", "filters", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "LZMADecompressor",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    int format = FORMAT_AUTO;
    TyObject *memlimit = Ty_None;
    TyObject *filters = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        format = TyLong_AsInt(fastargs[0]);
        if (format == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[1]) {
        memlimit = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    filters = fastargs[2];
skip_optional_pos:
    return_value = _lzma_LZMADecompressor_impl(type, format, memlimit, filters);

exit:
    return return_value;
}

TyDoc_STRVAR(_lzma_is_check_supported__doc__,
"is_check_supported($module, check_id, /)\n"
"--\n"
"\n"
"Test whether the given integrity check is supported.\n"
"\n"
"Always returns True for CHECK_NONE and CHECK_CRC32.");

#define _LZMA_IS_CHECK_SUPPORTED_METHODDEF    \
    {"is_check_supported", (PyCFunction)_lzma_is_check_supported, METH_O, _lzma_is_check_supported__doc__},

static TyObject *
_lzma_is_check_supported_impl(TyObject *module, int check_id);

static TyObject *
_lzma_is_check_supported(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int check_id;

    check_id = TyLong_AsInt(arg);
    if (check_id == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _lzma_is_check_supported_impl(module, check_id);

exit:
    return return_value;
}

TyDoc_STRVAR(_lzma__decode_filter_properties__doc__,
"_decode_filter_properties($module, filter_id, encoded_props, /)\n"
"--\n"
"\n"
"Return a bytes object encoding the options (properties) of the filter specified by *filter* (a dict).\n"
"\n"
"The result does not include the filter ID itself, only the options.");

#define _LZMA__DECODE_FILTER_PROPERTIES_METHODDEF    \
    {"_decode_filter_properties", _PyCFunction_CAST(_lzma__decode_filter_properties), METH_FASTCALL, _lzma__decode_filter_properties__doc__},

static TyObject *
_lzma__decode_filter_properties_impl(TyObject *module, lzma_vli filter_id,
                                     Ty_buffer *encoded_props);

static TyObject *
_lzma__decode_filter_properties(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    lzma_vli filter_id;
    Ty_buffer encoded_props = {NULL, NULL};

    if (!_TyArg_CheckPositional("_decode_filter_properties", nargs, 2, 2)) {
        goto exit;
    }
    if (!lzma_vli_converter(args[0], &filter_id)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &encoded_props, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _lzma__decode_filter_properties_impl(module, filter_id, &encoded_props);

exit:
    /* Cleanup for encoded_props */
    if (encoded_props.obj) {
       PyBuffer_Release(&encoded_props);
    }

    return return_value;
}
/*[clinic end generated code: output=6386084cb43d2533 input=a9049054013a1b77]*/
