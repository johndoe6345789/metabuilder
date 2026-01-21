/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_zstd_train_dict__doc__,
"train_dict($module, samples_bytes, samples_sizes, dict_size, /)\n"
"--\n"
"\n"
"Train a Zstandard dictionary on sample data.\n"
"\n"
"  samples_bytes\n"
"    Concatenation of samples.\n"
"  samples_sizes\n"
"    Tuple of samples\' sizes.\n"
"  dict_size\n"
"    The size of the dictionary.");

#define _ZSTD_TRAIN_DICT_METHODDEF    \
    {"train_dict", _PyCFunction_CAST(_zstd_train_dict), METH_FASTCALL, _zstd_train_dict__doc__},

static TyObject *
_zstd_train_dict_impl(TyObject *module, PyBytesObject *samples_bytes,
                      TyObject *samples_sizes, Ty_ssize_t dict_size);

static TyObject *
_zstd_train_dict(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    PyBytesObject *samples_bytes;
    TyObject *samples_sizes;
    Ty_ssize_t dict_size;

    if (!_TyArg_CheckPositional("train_dict", nargs, 3, 3)) {
        goto exit;
    }
    if (!TyBytes_Check(args[0])) {
        _TyArg_BadArgument("train_dict", "argument 1", "bytes", args[0]);
        goto exit;
    }
    samples_bytes = (PyBytesObject *)args[0];
    if (!TyTuple_Check(args[1])) {
        _TyArg_BadArgument("train_dict", "argument 2", "tuple", args[1]);
        goto exit;
    }
    samples_sizes = args[1];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        dict_size = ival;
    }
    return_value = _zstd_train_dict_impl(module, samples_bytes, samples_sizes, dict_size);

exit:
    return return_value;
}

TyDoc_STRVAR(_zstd_finalize_dict__doc__,
"finalize_dict($module, custom_dict_bytes, samples_bytes, samples_sizes,\n"
"              dict_size, compression_level, /)\n"
"--\n"
"\n"
"Finalize a Zstandard dictionary.\n"
"\n"
"  custom_dict_bytes\n"
"    Custom dictionary content.\n"
"  samples_bytes\n"
"    Concatenation of samples.\n"
"  samples_sizes\n"
"    Tuple of samples\' sizes.\n"
"  dict_size\n"
"    The size of the dictionary.\n"
"  compression_level\n"
"    Optimize for a specific Zstandard compression level, 0 means default.");

#define _ZSTD_FINALIZE_DICT_METHODDEF    \
    {"finalize_dict", _PyCFunction_CAST(_zstd_finalize_dict), METH_FASTCALL, _zstd_finalize_dict__doc__},

static TyObject *
_zstd_finalize_dict_impl(TyObject *module, PyBytesObject *custom_dict_bytes,
                         PyBytesObject *samples_bytes,
                         TyObject *samples_sizes, Ty_ssize_t dict_size,
                         int compression_level);

static TyObject *
_zstd_finalize_dict(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    PyBytesObject *custom_dict_bytes;
    PyBytesObject *samples_bytes;
    TyObject *samples_sizes;
    Ty_ssize_t dict_size;
    int compression_level;

    if (!_TyArg_CheckPositional("finalize_dict", nargs, 5, 5)) {
        goto exit;
    }
    if (!TyBytes_Check(args[0])) {
        _TyArg_BadArgument("finalize_dict", "argument 1", "bytes", args[0]);
        goto exit;
    }
    custom_dict_bytes = (PyBytesObject *)args[0];
    if (!TyBytes_Check(args[1])) {
        _TyArg_BadArgument("finalize_dict", "argument 2", "bytes", args[1]);
        goto exit;
    }
    samples_bytes = (PyBytesObject *)args[1];
    if (!TyTuple_Check(args[2])) {
        _TyArg_BadArgument("finalize_dict", "argument 3", "tuple", args[2]);
        goto exit;
    }
    samples_sizes = args[2];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[3]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        dict_size = ival;
    }
    compression_level = TyLong_AsInt(args[4]);
    if (compression_level == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _zstd_finalize_dict_impl(module, custom_dict_bytes, samples_bytes, samples_sizes, dict_size, compression_level);

exit:
    return return_value;
}

TyDoc_STRVAR(_zstd_get_param_bounds__doc__,
"get_param_bounds($module, /, parameter, is_compress)\n"
"--\n"
"\n"
"Get CompressionParameter/DecompressionParameter bounds.\n"
"\n"
"  parameter\n"
"    The parameter to get bounds.\n"
"  is_compress\n"
"    True for CompressionParameter, False for DecompressionParameter.");

#define _ZSTD_GET_PARAM_BOUNDS_METHODDEF    \
    {"get_param_bounds", _PyCFunction_CAST(_zstd_get_param_bounds), METH_FASTCALL|METH_KEYWORDS, _zstd_get_param_bounds__doc__},

static TyObject *
_zstd_get_param_bounds_impl(TyObject *module, int parameter, int is_compress);

static TyObject *
_zstd_get_param_bounds(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(parameter), &_Ty_ID(is_compress), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"parameter", "is_compress", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "get_param_bounds",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    int parameter;
    int is_compress;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    parameter = TyLong_AsInt(args[0]);
    if (parameter == -1 && TyErr_Occurred()) {
        goto exit;
    }
    is_compress = PyObject_IsTrue(args[1]);
    if (is_compress < 0) {
        goto exit;
    }
    return_value = _zstd_get_param_bounds_impl(module, parameter, is_compress);

exit:
    return return_value;
}

TyDoc_STRVAR(_zstd_get_frame_size__doc__,
"get_frame_size($module, /, frame_buffer)\n"
"--\n"
"\n"
"Get the size of a Zstandard frame, including the header and optional checksum.\n"
"\n"
"  frame_buffer\n"
"    A bytes-like object, it should start from the beginning of a frame,\n"
"    and contains at least one complete frame.");

#define _ZSTD_GET_FRAME_SIZE_METHODDEF    \
    {"get_frame_size", _PyCFunction_CAST(_zstd_get_frame_size), METH_FASTCALL|METH_KEYWORDS, _zstd_get_frame_size__doc__},

static TyObject *
_zstd_get_frame_size_impl(TyObject *module, Ty_buffer *frame_buffer);

static TyObject *
_zstd_get_frame_size(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(frame_buffer), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"frame_buffer", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "get_frame_size",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_buffer frame_buffer = {NULL, NULL};

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &frame_buffer, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _zstd_get_frame_size_impl(module, &frame_buffer);

exit:
    /* Cleanup for frame_buffer */
    if (frame_buffer.obj) {
       PyBuffer_Release(&frame_buffer);
    }

    return return_value;
}

TyDoc_STRVAR(_zstd_get_frame_info__doc__,
"get_frame_info($module, /, frame_buffer)\n"
"--\n"
"\n"
"Get Zstandard frame infomation from a frame header.\n"
"\n"
"  frame_buffer\n"
"    A bytes-like object, containing the header of a Zstandard frame.");

#define _ZSTD_GET_FRAME_INFO_METHODDEF    \
    {"get_frame_info", _PyCFunction_CAST(_zstd_get_frame_info), METH_FASTCALL|METH_KEYWORDS, _zstd_get_frame_info__doc__},

static TyObject *
_zstd_get_frame_info_impl(TyObject *module, Ty_buffer *frame_buffer);

static TyObject *
_zstd_get_frame_info(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(frame_buffer), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"frame_buffer", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "get_frame_info",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_buffer frame_buffer = {NULL, NULL};

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &frame_buffer, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _zstd_get_frame_info_impl(module, &frame_buffer);

exit:
    /* Cleanup for frame_buffer */
    if (frame_buffer.obj) {
       PyBuffer_Release(&frame_buffer);
    }

    return return_value;
}

TyDoc_STRVAR(_zstd_set_parameter_types__doc__,
"set_parameter_types($module, /, c_parameter_type, d_parameter_type)\n"
"--\n"
"\n"
"Set CompressionParameter and DecompressionParameter types for validity check.\n"
"\n"
"  c_parameter_type\n"
"    CompressionParameter IntEnum type object\n"
"  d_parameter_type\n"
"    DecompressionParameter IntEnum type object");

#define _ZSTD_SET_PARAMETER_TYPES_METHODDEF    \
    {"set_parameter_types", _PyCFunction_CAST(_zstd_set_parameter_types), METH_FASTCALL|METH_KEYWORDS, _zstd_set_parameter_types__doc__},

static TyObject *
_zstd_set_parameter_types_impl(TyObject *module, TyObject *c_parameter_type,
                               TyObject *d_parameter_type);

static TyObject *
_zstd_set_parameter_types(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(c_parameter_type), &_Ty_ID(d_parameter_type), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"c_parameter_type", "d_parameter_type", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "set_parameter_types",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *c_parameter_type;
    TyObject *d_parameter_type;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], &TyType_Type)) {
        _TyArg_BadArgument("set_parameter_types", "argument 'c_parameter_type'", (&TyType_Type)->tp_name, args[0]);
        goto exit;
    }
    c_parameter_type = args[0];
    if (!PyObject_TypeCheck(args[1], &TyType_Type)) {
        _TyArg_BadArgument("set_parameter_types", "argument 'd_parameter_type'", (&TyType_Type)->tp_name, args[1]);
        goto exit;
    }
    d_parameter_type = args[1];
    return_value = _zstd_set_parameter_types_impl(module, c_parameter_type, d_parameter_type);

exit:
    return return_value;
}
/*[clinic end generated code: output=437b084f149e68e5 input=a9049054013a1b77]*/
