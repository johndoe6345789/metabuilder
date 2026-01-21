/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(binascii_a2b_uu__doc__,
"a2b_uu($module, data, /)\n"
"--\n"
"\n"
"Decode a line of uuencoded data.");

#define BINASCII_A2B_UU_METHODDEF    \
    {"a2b_uu", (PyCFunction)binascii_a2b_uu, METH_O, binascii_a2b_uu__doc__},

static TyObject *
binascii_a2b_uu_impl(TyObject *module, Ty_buffer *data);

static TyObject *
binascii_a2b_uu(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};

    if (!ascii_buffer_converter(arg, &data)) {
        goto exit;
    }
    return_value = binascii_a2b_uu_impl(module, &data);

exit:
    /* Cleanup for data */
    if (data.obj)
       PyBuffer_Release(&data);

    return return_value;
}

TyDoc_STRVAR(binascii_b2a_uu__doc__,
"b2a_uu($module, data, /, *, backtick=False)\n"
"--\n"
"\n"
"Uuencode line of data.");

#define BINASCII_B2A_UU_METHODDEF    \
    {"b2a_uu", _PyCFunction_CAST(binascii_b2a_uu), METH_FASTCALL|METH_KEYWORDS, binascii_b2a_uu__doc__},

static TyObject *
binascii_b2a_uu_impl(TyObject *module, Ty_buffer *data, int backtick);

static TyObject *
binascii_b2a_uu(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(backtick), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "backtick", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "b2a_uu",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    int backtick = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    backtick = PyObject_IsTrue(args[1]);
    if (backtick < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = binascii_b2a_uu_impl(module, &data, backtick);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_a2b_base64__doc__,
"a2b_base64($module, data, /, *, strict_mode=False)\n"
"--\n"
"\n"
"Decode a line of base64 data.\n"
"\n"
"  strict_mode\n"
"    When set to True, bytes that are not part of the base64 standard are not allowed.\n"
"    The same applies to excess data after padding (= / ==).");

#define BINASCII_A2B_BASE64_METHODDEF    \
    {"a2b_base64", _PyCFunction_CAST(binascii_a2b_base64), METH_FASTCALL|METH_KEYWORDS, binascii_a2b_base64__doc__},

static TyObject *
binascii_a2b_base64_impl(TyObject *module, Ty_buffer *data, int strict_mode);

static TyObject *
binascii_a2b_base64(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(strict_mode), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "strict_mode", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "a2b_base64",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    int strict_mode = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!ascii_buffer_converter(args[0], &data)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    strict_mode = PyObject_IsTrue(args[1]);
    if (strict_mode < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = binascii_a2b_base64_impl(module, &data, strict_mode);

exit:
    /* Cleanup for data */
    if (data.obj)
       PyBuffer_Release(&data);

    return return_value;
}

TyDoc_STRVAR(binascii_b2a_base64__doc__,
"b2a_base64($module, data, /, *, newline=True)\n"
"--\n"
"\n"
"Base64-code line of data.");

#define BINASCII_B2A_BASE64_METHODDEF    \
    {"b2a_base64", _PyCFunction_CAST(binascii_b2a_base64), METH_FASTCALL|METH_KEYWORDS, binascii_b2a_base64__doc__},

static TyObject *
binascii_b2a_base64_impl(TyObject *module, Ty_buffer *data, int newline);

static TyObject *
binascii_b2a_base64(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(newline), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "newline", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "b2a_base64",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    int newline = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    newline = PyObject_IsTrue(args[1]);
    if (newline < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = binascii_b2a_base64_impl(module, &data, newline);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_crc_hqx__doc__,
"crc_hqx($module, data, crc, /)\n"
"--\n"
"\n"
"Compute CRC-CCITT incrementally.");

#define BINASCII_CRC_HQX_METHODDEF    \
    {"crc_hqx", _PyCFunction_CAST(binascii_crc_hqx), METH_FASTCALL, binascii_crc_hqx__doc__},

static TyObject *
binascii_crc_hqx_impl(TyObject *module, Ty_buffer *data, unsigned int crc);

static TyObject *
binascii_crc_hqx(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    unsigned int crc;

    if (!_TyArg_CheckPositional("crc_hqx", nargs, 2, 2)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    crc = (unsigned int)TyLong_AsUnsignedLongMask(args[1]);
    if (crc == (unsigned int)-1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = binascii_crc_hqx_impl(module, &data, crc);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_crc32__doc__,
"crc32($module, data, crc=0, /)\n"
"--\n"
"\n"
"Compute CRC-32 incrementally.");

#define BINASCII_CRC32_METHODDEF    \
    {"crc32", _PyCFunction_CAST(binascii_crc32), METH_FASTCALL, binascii_crc32__doc__},

static unsigned int
binascii_crc32_impl(TyObject *module, Ty_buffer *data, unsigned int crc);

static TyObject *
binascii_crc32(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_buffer data = {NULL, NULL};
    unsigned int crc = 0;
    unsigned int _return_value;

    if (!_TyArg_CheckPositional("crc32", nargs, 1, 2)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    crc = (unsigned int)TyLong_AsUnsignedLongMask(args[1]);
    if (crc == (unsigned int)-1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    _return_value = binascii_crc32_impl(module, &data, crc);
    if ((_return_value == (unsigned int)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromUnsignedLong((unsigned long)_return_value);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_b2a_hex__doc__,
"b2a_hex($module, /, data, sep=<unrepresentable>, bytes_per_sep=1)\n"
"--\n"
"\n"
"Hexadecimal representation of binary data.\n"
"\n"
"  sep\n"
"    An optional single character or byte to separate hex bytes.\n"
"  bytes_per_sep\n"
"    How many bytes between separators.  Positive values count from the\n"
"    right, negative values count from the left.\n"
"\n"
"The return value is a bytes object.  This function is also\n"
"available as \"hexlify()\".\n"
"\n"
"Example:\n"
">>> binascii.b2a_hex(b\'\\xb9\\x01\\xef\')\n"
"b\'b901ef\'\n"
">>> binascii.hexlify(b\'\\xb9\\x01\\xef\', \':\')\n"
"b\'b9:01:ef\'\n"
">>> binascii.b2a_hex(b\'\\xb9\\x01\\xef\', b\'_\', 2)\n"
"b\'b9_01ef\'");

#define BINASCII_B2A_HEX_METHODDEF    \
    {"b2a_hex", _PyCFunction_CAST(binascii_b2a_hex), METH_FASTCALL|METH_KEYWORDS, binascii_b2a_hex__doc__},

static TyObject *
binascii_b2a_hex_impl(TyObject *module, Ty_buffer *data, TyObject *sep,
                      int bytes_per_sep);

static TyObject *
binascii_b2a_hex(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(sep), &_Ty_ID(bytes_per_sep), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "sep", "bytes_per_sep", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "b2a_hex",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    TyObject *sep = NULL;
    int bytes_per_sep = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        sep = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    bytes_per_sep = TyLong_AsInt(args[2]);
    if (bytes_per_sep == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = binascii_b2a_hex_impl(module, &data, sep, bytes_per_sep);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_hexlify__doc__,
"hexlify($module, /, data, sep=<unrepresentable>, bytes_per_sep=1)\n"
"--\n"
"\n"
"Hexadecimal representation of binary data.\n"
"\n"
"  sep\n"
"    An optional single character or byte to separate hex bytes.\n"
"  bytes_per_sep\n"
"    How many bytes between separators.  Positive values count from the\n"
"    right, negative values count from the left.\n"
"\n"
"The return value is a bytes object.  This function is also\n"
"available as \"b2a_hex()\".");

#define BINASCII_HEXLIFY_METHODDEF    \
    {"hexlify", _PyCFunction_CAST(binascii_hexlify), METH_FASTCALL|METH_KEYWORDS, binascii_hexlify__doc__},

static TyObject *
binascii_hexlify_impl(TyObject *module, Ty_buffer *data, TyObject *sep,
                      int bytes_per_sep);

static TyObject *
binascii_hexlify(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(sep), &_Ty_ID(bytes_per_sep), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "sep", "bytes_per_sep", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "hexlify",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    TyObject *sep = NULL;
    int bytes_per_sep = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        sep = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    bytes_per_sep = TyLong_AsInt(args[2]);
    if (bytes_per_sep == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = binascii_hexlify_impl(module, &data, sep, bytes_per_sep);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

TyDoc_STRVAR(binascii_a2b_hex__doc__,
"a2b_hex($module, hexstr, /)\n"
"--\n"
"\n"
"Binary data of hexadecimal representation.\n"
"\n"
"hexstr must contain an even number of hex digits (upper or lower case).\n"
"This function is also available as \"unhexlify()\".");

#define BINASCII_A2B_HEX_METHODDEF    \
    {"a2b_hex", (PyCFunction)binascii_a2b_hex, METH_O, binascii_a2b_hex__doc__},

static TyObject *
binascii_a2b_hex_impl(TyObject *module, Ty_buffer *hexstr);

static TyObject *
binascii_a2b_hex(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_buffer hexstr = {NULL, NULL};

    if (!ascii_buffer_converter(arg, &hexstr)) {
        goto exit;
    }
    return_value = binascii_a2b_hex_impl(module, &hexstr);

exit:
    /* Cleanup for hexstr */
    if (hexstr.obj)
       PyBuffer_Release(&hexstr);

    return return_value;
}

TyDoc_STRVAR(binascii_unhexlify__doc__,
"unhexlify($module, hexstr, /)\n"
"--\n"
"\n"
"Binary data of hexadecimal representation.\n"
"\n"
"hexstr must contain an even number of hex digits (upper or lower case).");

#define BINASCII_UNHEXLIFY_METHODDEF    \
    {"unhexlify", (PyCFunction)binascii_unhexlify, METH_O, binascii_unhexlify__doc__},

static TyObject *
binascii_unhexlify_impl(TyObject *module, Ty_buffer *hexstr);

static TyObject *
binascii_unhexlify(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_buffer hexstr = {NULL, NULL};

    if (!ascii_buffer_converter(arg, &hexstr)) {
        goto exit;
    }
    return_value = binascii_unhexlify_impl(module, &hexstr);

exit:
    /* Cleanup for hexstr */
    if (hexstr.obj)
       PyBuffer_Release(&hexstr);

    return return_value;
}

TyDoc_STRVAR(binascii_a2b_qp__doc__,
"a2b_qp($module, /, data, header=False)\n"
"--\n"
"\n"
"Decode a string of qp-encoded data.");

#define BINASCII_A2B_QP_METHODDEF    \
    {"a2b_qp", _PyCFunction_CAST(binascii_a2b_qp), METH_FASTCALL|METH_KEYWORDS, binascii_a2b_qp__doc__},

static TyObject *
binascii_a2b_qp_impl(TyObject *module, Ty_buffer *data, int header);

static TyObject *
binascii_a2b_qp(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(header), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "header", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "a2b_qp",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    int header = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!ascii_buffer_converter(args[0], &data)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    header = PyObject_IsTrue(args[1]);
    if (header < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = binascii_a2b_qp_impl(module, &data, header);

exit:
    /* Cleanup for data */
    if (data.obj)
       PyBuffer_Release(&data);

    return return_value;
}

TyDoc_STRVAR(binascii_b2a_qp__doc__,
"b2a_qp($module, /, data, quotetabs=False, istext=True, header=False)\n"
"--\n"
"\n"
"Encode a string using quoted-printable encoding.\n"
"\n"
"On encoding, when istext is set, newlines are not encoded, and white\n"
"space at end of lines is.  When istext is not set, \\r and \\n (CR/LF)\n"
"are both encoded.  When quotetabs is set, space and tabs are encoded.");

#define BINASCII_B2A_QP_METHODDEF    \
    {"b2a_qp", _PyCFunction_CAST(binascii_b2a_qp), METH_FASTCALL|METH_KEYWORDS, binascii_b2a_qp__doc__},

static TyObject *
binascii_b2a_qp_impl(TyObject *module, Ty_buffer *data, int quotetabs,
                     int istext, int header);

static TyObject *
binascii_b2a_qp(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(data), &_Ty_ID(quotetabs), &_Ty_ID(istext), &_Ty_ID(header), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "quotetabs", "istext", "header", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "b2a_qp",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    int quotetabs = 0;
    int istext = 1;
    int header = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        quotetabs = PyObject_IsTrue(args[1]);
        if (quotetabs < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        istext = PyObject_IsTrue(args[2]);
        if (istext < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    header = PyObject_IsTrue(args[3]);
    if (header < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = binascii_b2a_qp_impl(module, &data, quotetabs, istext, header);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}
/*[clinic end generated code: output=adb855a2797c3cad input=a9049054013a1b77]*/
