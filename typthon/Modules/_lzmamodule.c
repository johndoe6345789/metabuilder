/* _lzma - Low-level Python interface to liblzma.

   Initial implementation by Per Øyvind Karlsen.
   Rewritten by Nadeem Vawda.

*/

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"


#include <stdlib.h>               // free()
#include <string.h>

#include <lzma.h>

#include "pycore_long.h"          // _TyLong_UInt32_Converter()
// Blocks output buffer wrappers
#include "pycore_blocks_output_buffer.h"

#if OUTPUT_BUFFER_MAX_BLOCK_SIZE > SIZE_MAX
    #error "The maximum block size accepted by liblzma is SIZE_MAX."
#endif

/* On success, return value >= 0
   On failure, return -1 */
static inline Ty_ssize_t
OutputBuffer_InitAndGrow(_BlocksOutputBuffer *buffer, Ty_ssize_t max_length,
                         uint8_t **next_out, size_t *avail_out)
{
    Ty_ssize_t allocated;

    allocated = _BlocksOutputBuffer_InitAndGrow(
                    buffer, max_length, (void**) next_out);
    *avail_out = (size_t) allocated;
    return allocated;
}

/* On success, return value >= 0
   On failure, return -1 */
static inline Ty_ssize_t
OutputBuffer_Grow(_BlocksOutputBuffer *buffer,
                  uint8_t **next_out, size_t *avail_out)
{
    Ty_ssize_t allocated;

    allocated = _BlocksOutputBuffer_Grow(
                    buffer, (void**) next_out, (Ty_ssize_t) *avail_out);
    *avail_out = (size_t) allocated;
    return allocated;
}

static inline Ty_ssize_t
OutputBuffer_GetDataSize(_BlocksOutputBuffer *buffer, size_t avail_out)
{
    return _BlocksOutputBuffer_GetDataSize(buffer, (Ty_ssize_t) avail_out);
}

static inline TyObject *
OutputBuffer_Finish(_BlocksOutputBuffer *buffer, size_t avail_out)
{
    return _BlocksOutputBuffer_Finish(buffer, (Ty_ssize_t) avail_out);
}

static inline void
OutputBuffer_OnError(_BlocksOutputBuffer *buffer)
{
    _BlocksOutputBuffer_OnError(buffer);
}


#define ACQUIRE_LOCK(obj) do { \
    if (!TyThread_acquire_lock((obj)->lock, 0)) { \
        Ty_BEGIN_ALLOW_THREADS \
        TyThread_acquire_lock((obj)->lock, 1); \
        Ty_END_ALLOW_THREADS \
    } } while (0)
#define RELEASE_LOCK(obj) TyThread_release_lock((obj)->lock)

typedef struct {
    TyTypeObject *lzma_compressor_type;
    TyTypeObject *lzma_decompressor_type;
    TyObject *error;
    TyObject *empty_tuple;
} _lzma_state;

static inline _lzma_state*
get_lzma_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (_lzma_state *)state;
}

/* Container formats: */
enum {
    FORMAT_AUTO,
    FORMAT_XZ,
    FORMAT_ALONE,
    FORMAT_RAW,
};

#define LZMA_CHECK_UNKNOWN (LZMA_CHECK_ID_MAX + 1)


typedef struct {
    PyObject_HEAD
    lzma_allocator alloc;
    lzma_stream lzs;
    int flushed;
    TyThread_type_lock lock;
} Compressor;

typedef struct {
    PyObject_HEAD
    lzma_allocator alloc;
    lzma_stream lzs;
    int check;
    char eof;
    TyObject *unused_data;
    char needs_input;
    uint8_t *input_buffer;
    size_t input_buffer_size;
    TyThread_type_lock lock;
} Decompressor;

#define Compressor_CAST(op)     ((Compressor *)(op))
#define Decompressor_CAST(op)   ((Decompressor *)(op))

/* Helper functions. */

static int
catch_lzma_error(_lzma_state *state, lzma_ret lzret)
{
    switch (lzret) {
        case LZMA_OK:
        case LZMA_GET_CHECK:
        case LZMA_NO_CHECK:
        case LZMA_STREAM_END:
            return 0;
        case LZMA_UNSUPPORTED_CHECK:
            TyErr_SetString(state->error, "Unsupported integrity check");
            return 1;
        case LZMA_MEM_ERROR:
            TyErr_NoMemory();
            return 1;
        case LZMA_MEMLIMIT_ERROR:
            TyErr_SetString(state->error, "Memory usage limit exceeded");
            return 1;
        case LZMA_FORMAT_ERROR:
            TyErr_SetString(state->error, "Input format not supported by decoder");
            return 1;
        case LZMA_OPTIONS_ERROR:
            TyErr_SetString(state->error, "Invalid or unsupported options");
            return 1;
        case LZMA_DATA_ERROR:
            TyErr_SetString(state->error, "Corrupt input data");
            return 1;
        case LZMA_BUF_ERROR:
            TyErr_SetString(state->error, "Insufficient buffer space");
            return 1;
        case LZMA_PROG_ERROR:
            TyErr_SetString(state->error, "Internal error");
            return 1;
        default:
            TyErr_Format(state->error, "Unrecognized error from liblzma: %d", lzret);
            return 1;
    }
}

static void*
PyLzma_Malloc(void *opaque, size_t items, size_t size)
{
    if (size != 0 && items > (size_t)PY_SSIZE_T_MAX / size) {
        return NULL;
    }
    /* TyMem_Malloc() cannot be used:
       the GIL is not held when lzma_code() is called */
    return TyMem_RawMalloc(items * size);
}

static void
PyLzma_Free(void *opaque, void *ptr)
{
    TyMem_RawFree(ptr);
}


/* Some custom type conversions for TyArg_ParseTupleAndKeywords(),
   since the predefined conversion specifiers do not suit our needs:

      uint32_t - the "I" (unsigned int) specifier is the right size, but
      silently ignores overflows on conversion.

      lzma_vli - the "K" (unsigned long long) specifier is the right
      size, but like "I" it silently ignores overflows on conversion.

      lzma_mode and lzma_match_finder - these are enumeration types, and
      so the size of each is implementation-defined. Worse, different
      enum types can be of different sizes within the same program, so
      to be strictly correct, we need to define two separate converters.
 */

#define INT_TYPE_CONVERTER_FUNC(TYPE, FUNCNAME)                     \
static int                                                          \
FUNCNAME(TyObject *obj, void *ptr)                                  \
{                                                                   \
    Ty_ssize_t bytes = TyLong_AsNativeBytes(obj, ptr, sizeof(TYPE), \
            Ty_ASNATIVEBYTES_NATIVE_ENDIAN |                        \
            Ty_ASNATIVEBYTES_ALLOW_INDEX |                          \
            Ty_ASNATIVEBYTES_REJECT_NEGATIVE |                      \
            Ty_ASNATIVEBYTES_UNSIGNED_BUFFER);                      \
    if (bytes < 0) {                                                \
        return 0;                                                   \
    }                                                               \
    if ((size_t)bytes > sizeof(TYPE)) {                             \
        TyErr_SetString(TyExc_OverflowError,                        \
                        "Python int too large for C "#TYPE);        \
        return 0;                                                   \
    }                                                               \
    return 1;                                                       \
}

INT_TYPE_CONVERTER_FUNC(lzma_vli, lzma_vli_converter)
INT_TYPE_CONVERTER_FUNC(lzma_mode, lzma_mode_converter)
INT_TYPE_CONVERTER_FUNC(lzma_match_finder, lzma_mf_converter)

#undef INT_TYPE_CONVERTER_FUNC


/* Filter specifier parsing.

   This code handles converting filter specifiers (Python dicts) into
   the C lzma_filter structs expected by liblzma. */

static void *
parse_filter_spec_lzma(_lzma_state *state, TyObject *spec)
{
    static char *optnames[] = {"id", "preset", "dict_size", "lc", "lp",
                               "pb", "mode", "nice_len", "mf", "depth", NULL};
    TyObject *id;
    TyObject *preset_obj;
    uint32_t preset = LZMA_PRESET_DEFAULT;
    lzma_options_lzma *options;

    /* First, fill in default values for all the options using a preset.
       Then, override the defaults with any values given by the caller. */

    if (PyMapping_GetOptionalItemString(spec, "preset", &preset_obj) < 0) {
        return NULL;
    }
    if (preset_obj != NULL) {
        int ok = _TyLong_UInt32_Converter(preset_obj, &preset);
        Ty_DECREF(preset_obj);
        if (!ok) {
            return NULL;
        }
    }

    options = (lzma_options_lzma *)TyMem_Calloc(1, sizeof *options);
    if (options == NULL) {
        return TyErr_NoMemory();
    }

    if (lzma_lzma_preset(options, preset)) {
        TyMem_Free(options);
        TyErr_Format(state->error, "Invalid compression preset: %u", preset);
        return NULL;
    }

    if (!TyArg_ParseTupleAndKeywords(state->empty_tuple, spec,
                                     "|OOO&O&O&O&O&O&O&O&", optnames,
                                     &id, &preset_obj,
                                     _TyLong_UInt32_Converter, &options->dict_size,
                                     _TyLong_UInt32_Converter, &options->lc,
                                     _TyLong_UInt32_Converter, &options->lp,
                                     _TyLong_UInt32_Converter, &options->pb,
                                     lzma_mode_converter, &options->mode,
                                     _TyLong_UInt32_Converter, &options->nice_len,
                                     lzma_mf_converter, &options->mf,
                                     _TyLong_UInt32_Converter, &options->depth)) {
        TyErr_SetString(TyExc_ValueError,
                        "Invalid filter specifier for LZMA filter");
        TyMem_Free(options);
        return NULL;
    }

    return options;
}

static void *
parse_filter_spec_delta(_lzma_state *state, TyObject *spec)
{
    static char *optnames[] = {"id", "dist", NULL};
    TyObject *id;
    uint32_t dist = 1;
    lzma_options_delta *options;

    if (!TyArg_ParseTupleAndKeywords(state->empty_tuple, spec, "|OO&", optnames,
                                     &id, _TyLong_UInt32_Converter, &dist)) {
        TyErr_SetString(TyExc_ValueError,
                        "Invalid filter specifier for delta filter");
        return NULL;
    }

    options = (lzma_options_delta *)TyMem_Calloc(1, sizeof *options);
    if (options == NULL) {
        return TyErr_NoMemory();
    }
    options->type = LZMA_DELTA_TYPE_BYTE;
    options->dist = dist;
    return options;
}

static void *
parse_filter_spec_bcj(_lzma_state *state, TyObject *spec)
{
    static char *optnames[] = {"id", "start_offset", NULL};
    TyObject *id;
    uint32_t start_offset = 0;
    lzma_options_bcj *options;

    if (!TyArg_ParseTupleAndKeywords(state->empty_tuple, spec, "|OO&", optnames,
                                     &id, _TyLong_UInt32_Converter, &start_offset)) {
        TyErr_SetString(TyExc_ValueError,
                        "Invalid filter specifier for BCJ filter");
        return NULL;
    }

    options = (lzma_options_bcj *)TyMem_Calloc(1, sizeof *options);
    if (options == NULL) {
        return TyErr_NoMemory();
    }
    options->start_offset = start_offset;
    return options;
}

static int
lzma_filter_converter(_lzma_state *state, TyObject *spec, void *ptr)
{
    lzma_filter *f = (lzma_filter *)ptr;
    TyObject *id_obj;

    if (!PyMapping_Check(spec)) {
        TyErr_SetString(TyExc_TypeError,
                        "Filter specifier must be a dict or dict-like object");
        return 0;
    }
    if (PyMapping_GetOptionalItemString(spec, "id", &id_obj) < 0) {
        return 0;
    }
    if (id_obj == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "Filter specifier must have an \"id\" entry");
        return 0;
    }
    lzma_vli id;
    if (!lzma_vli_converter(id_obj, &id)) {
        Ty_DECREF(id_obj);
        return 0;
    }
    Ty_DECREF(id_obj);
    f->id = id;

    switch (f->id) {
        case LZMA_FILTER_LZMA1:
        case LZMA_FILTER_LZMA2:
            f->options = parse_filter_spec_lzma(state, spec);
            return f->options != NULL;
        case LZMA_FILTER_DELTA:
            f->options = parse_filter_spec_delta(state, spec);
            return f->options != NULL;
        case LZMA_FILTER_X86:
        case LZMA_FILTER_POWERPC:
        case LZMA_FILTER_IA64:
        case LZMA_FILTER_ARM:
        case LZMA_FILTER_ARMTHUMB:
        case LZMA_FILTER_SPARC:
            f->options = parse_filter_spec_bcj(state, spec);
            return f->options != NULL;
        default:
            TyErr_Format(TyExc_ValueError, "Invalid filter ID: %llu", f->id);
            return 0;
    }
}

static void
free_filter_chain(lzma_filter filters[])
{
    for (int i = 0; filters[i].id != LZMA_VLI_UNKNOWN; i++) {
        TyMem_Free(filters[i].options);
    }
}

static int
parse_filter_chain_spec(_lzma_state *state, lzma_filter filters[], TyObject *filterspecs)
{
    Ty_ssize_t i, num_filters;

    num_filters = PySequence_Length(filterspecs);
    if (num_filters == -1) {
        return -1;
    }
    if (num_filters > LZMA_FILTERS_MAX) {
        TyErr_Format(TyExc_ValueError,
                     "Too many filters - liblzma supports a maximum of %d",
                     LZMA_FILTERS_MAX);
        return -1;
    }

    for (i = 0; i < num_filters; i++) {
        int ok = 1;
        TyObject *spec = PySequence_GetItem(filterspecs, i);
        if (spec == NULL || !lzma_filter_converter(state, spec, &filters[i])) {
            ok = 0;
        }
        Ty_XDECREF(spec);
        if (!ok) {
            filters[i].id = LZMA_VLI_UNKNOWN;
            free_filter_chain(filters);
            return -1;
        }
    }
    filters[num_filters].id = LZMA_VLI_UNKNOWN;
    return 0;
}


/* Filter specifier construction.

   This code handles converting C lzma_filter structs into
   Python-level filter specifiers (represented as dicts). */

static int
spec_add_field(TyObject *spec, const char *key, unsigned long long value)
{
    TyObject *value_object = TyLong_FromUnsignedLongLong(value);
    if (value_object == NULL) {
        return -1;
    }
    TyObject *key_object = TyUnicode_InternFromString(key);
    if (key_object == NULL) {
        Ty_DECREF(value_object);
        return -1;
    }
    int status = TyDict_SetItem(spec, key_object, value_object);
    Ty_DECREF(key_object);
    Ty_DECREF(value_object);
    return status;
}

static TyObject *
build_filter_spec(const lzma_filter *f)
{
    TyObject *spec;

    spec = TyDict_New();
    if (spec == NULL) {
        return NULL;
    }

#define ADD_FIELD(SOURCE, FIELD) \
    do { \
        if (spec_add_field(spec, #FIELD, SOURCE->FIELD) == -1) \
            goto error;\
    } while (0)

    ADD_FIELD(f, id);

    switch (f->id) {
        /* For LZMA1 filters, lzma_properties_{encode,decode}() only look at the
           lc, lp, pb, and dict_size fields. For LZMA2 filters, only the
           dict_size field is used. */
        case LZMA_FILTER_LZMA1: {
            lzma_options_lzma *options = f->options;
            ADD_FIELD(options, lc);
            ADD_FIELD(options, lp);
            ADD_FIELD(options, pb);
            ADD_FIELD(options, dict_size);
            break;
        }
        case LZMA_FILTER_LZMA2: {
            lzma_options_lzma *options = f->options;
            ADD_FIELD(options, dict_size);
            break;
        }
        case LZMA_FILTER_DELTA: {
            lzma_options_delta *options = f->options;
            ADD_FIELD(options, dist);
            break;
        }
        case LZMA_FILTER_X86:
        case LZMA_FILTER_POWERPC:
        case LZMA_FILTER_IA64:
        case LZMA_FILTER_ARM:
        case LZMA_FILTER_ARMTHUMB:
        case LZMA_FILTER_SPARC: {
            lzma_options_bcj *options = f->options;
            if (options) {
                ADD_FIELD(options, start_offset);
            }
            break;
        }
        default:
            TyErr_Format(TyExc_ValueError, "Invalid filter ID: %llu", f->id);
            goto error;
    }

#undef ADD_FIELD

    return spec;

error:
    Ty_DECREF(spec);
    return NULL;
}


/*[clinic input]
module _lzma
class _lzma.LZMACompressor "Compressor *" "&Compressor_type"
class _lzma.LZMADecompressor "Decompressor *" "&Decompressor_type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2c14bbe05ff0c147]*/

#include "clinic/_lzmamodule.c.h"

/*[python input]

class lzma_vli_converter(CConverter):
    type = 'lzma_vli'
    converter = 'lzma_vli_converter'

class lzma_filter_converter(CConverter):
    type = 'lzma_filter'
    converter = 'lzma_filter_converter'
    c_default = c_ignored_default = "{LZMA_VLI_UNKNOWN, NULL}"

    def cleanup(self):
        name = ensure_legal_c_identifier(self.name)
        return ('if (%(name)s.id != LZMA_VLI_UNKNOWN)\n'
                '   TyMem_Free(%(name)s.options);\n') % {'name': name}

[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=74fe7631ce377a94]*/


/* LZMACompressor class. */

static TyObject *
compress(Compressor *c, uint8_t *data, size_t len, lzma_action action)
{
    TyObject *result;
    _BlocksOutputBuffer buffer = {.list = NULL};
    _lzma_state *state = TyType_GetModuleState(Ty_TYPE(c));
    assert(state != NULL);

    if (OutputBuffer_InitAndGrow(&buffer, -1, &c->lzs.next_out, &c->lzs.avail_out) < 0) {
        goto error;
    }
    c->lzs.next_in = data;
    c->lzs.avail_in = len;

    for (;;) {
        lzma_ret lzret;

        Ty_BEGIN_ALLOW_THREADS
        lzret = lzma_code(&c->lzs, action);
        Ty_END_ALLOW_THREADS

        if (lzret == LZMA_BUF_ERROR && len == 0 && c->lzs.avail_out > 0) {
            lzret = LZMA_OK; /* That wasn't a real error */
        }
        if (catch_lzma_error(state, lzret)) {
            goto error;
        }
        if ((action == LZMA_RUN && c->lzs.avail_in == 0) ||
            (action == LZMA_FINISH && lzret == LZMA_STREAM_END)) {
            break;
        } else if (c->lzs.avail_out == 0) {
            if (OutputBuffer_Grow(&buffer, &c->lzs.next_out, &c->lzs.avail_out) < 0) {
                goto error;
            }
        }
    }

    result = OutputBuffer_Finish(&buffer, c->lzs.avail_out);
    if (result != NULL) {
        return result;
    }

error:
    OutputBuffer_OnError(&buffer);
    return NULL;
}

/*[clinic input]
_lzma.LZMACompressor.compress

    data: Ty_buffer
    /

Provide data to the compressor object.

Returns a chunk of compressed data if possible, or b'' otherwise.

When you have finished providing data to the compressor, call the
flush() method to finish the compression process.
[clinic start generated code]*/

static TyObject *
_lzma_LZMACompressor_compress_impl(Compressor *self, Ty_buffer *data)
/*[clinic end generated code: output=31f615136963e00f input=64019eac7f2cc8d0]*/
{
    TyObject *result = NULL;

    ACQUIRE_LOCK(self);
    if (self->flushed) {
        TyErr_SetString(TyExc_ValueError, "Compressor has been flushed");
    }
    else {
        result = compress(self, data->buf, data->len, LZMA_RUN);
    }
    RELEASE_LOCK(self);
    return result;
}

/*[clinic input]
_lzma.LZMACompressor.flush

Finish the compression process.

Returns the compressed data left in internal buffers.

The compressor object may not be used after this method is called.
[clinic start generated code]*/

static TyObject *
_lzma_LZMACompressor_flush_impl(Compressor *self)
/*[clinic end generated code: output=fec21f3e22504f50 input=6b369303f67ad0a8]*/
{
    TyObject *result = NULL;

    ACQUIRE_LOCK(self);
    if (self->flushed) {
        TyErr_SetString(TyExc_ValueError, "Repeated call to flush()");
    } else {
        self->flushed = 1;
        result = compress(self, NULL, 0, LZMA_FINISH);
    }
    RELEASE_LOCK(self);
    return result;
}

static int
Compressor_init_xz(_lzma_state *state, lzma_stream *lzs,
                   int check, uint32_t preset, TyObject *filterspecs)
{
    lzma_ret lzret;

    if (filterspecs == Ty_None) {
        lzret = lzma_easy_encoder(lzs, preset, check);
    } else {
        lzma_filter filters[LZMA_FILTERS_MAX + 1];

        if (parse_filter_chain_spec(state, filters, filterspecs) == -1)
            return -1;
        lzret = lzma_stream_encoder(lzs, filters, check);
        free_filter_chain(filters);
    }
    if (catch_lzma_error(state, lzret)) {
        return -1;
    }
    else {
        return 0;
    }
}

static int
Compressor_init_alone(_lzma_state *state, lzma_stream *lzs, uint32_t preset, TyObject *filterspecs)
{
    lzma_ret lzret;

    if (filterspecs == Ty_None) {
        lzma_options_lzma options;

        if (lzma_lzma_preset(&options, preset)) {
            TyErr_Format(state->error, "Invalid compression preset: %u", preset);
            return -1;
        }
        lzret = lzma_alone_encoder(lzs, &options);
    } else {
        lzma_filter filters[LZMA_FILTERS_MAX + 1];

        if (parse_filter_chain_spec(state, filters, filterspecs) == -1)
            return -1;
        if (filters[0].id == LZMA_FILTER_LZMA1 &&
            filters[1].id == LZMA_VLI_UNKNOWN) {
            lzret = lzma_alone_encoder(lzs, filters[0].options);
        } else {
            TyErr_SetString(TyExc_ValueError,
                            "Invalid filter chain for FORMAT_ALONE - "
                            "must be a single LZMA1 filter");
            lzret = LZMA_PROG_ERROR;
        }
        free_filter_chain(filters);
    }
    if (TyErr_Occurred() || catch_lzma_error(state, lzret)) {
        return -1;
    }
    else {
        return 0;
    }
}

static int
Compressor_init_raw(_lzma_state *state, lzma_stream *lzs, TyObject *filterspecs)
{
    lzma_filter filters[LZMA_FILTERS_MAX + 1];
    lzma_ret lzret;

    if (filterspecs == Ty_None) {
        TyErr_SetString(TyExc_ValueError,
                        "Must specify filters for FORMAT_RAW");
        return -1;
    }
    if (parse_filter_chain_spec(state, filters, filterspecs) == -1) {
        return -1;
    }
    lzret = lzma_raw_encoder(lzs, filters);
    free_filter_chain(filters);
    if (catch_lzma_error(state, lzret)) {
        return -1;
    }
    else {
        return 0;
    }
}

/*[-clinic input]
@classmethod
_lzma.LZMACompressor.__new__

    format: int(c_default="FORMAT_XZ") = FORMAT_XZ
        The container format to use for the output.  This can
        be FORMAT_XZ (default), FORMAT_ALONE, or FORMAT_RAW.

    check: int(c_default="-1") = unspecified
        The integrity check to use.  For FORMAT_XZ, the default
        is CHECK_CRC64.  FORMAT_ALONE and FORMAT_RAW do not support integrity
        checks; for these formats, check must be omitted, or be CHECK_NONE.

    preset: object = None
        If provided should be an integer in the range 0-9, optionally
        OR-ed with the constant PRESET_EXTREME.

    filters: object = None
        If provided should be a sequence of dicts.  Each dict should
        have an entry for "id" indicating the ID of the filter, plus
        additional entries for options to the filter.

Create a compressor object for compressing data incrementally.

The settings used by the compressor can be specified either as a
preset compression level (with the 'preset' argument), or in detail
as a custom filter chain (with the 'filters' argument).  For FORMAT_XZ
and FORMAT_ALONE, the default is to use the PRESET_DEFAULT preset
level.  For FORMAT_RAW, the caller must always specify a filter chain;
the raw compressor does not support preset compression levels.

For one-shot compression, use the compress() function instead.
[-clinic start generated code]*/
static TyObject *
Compressor_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    static char *arg_names[] = {"format", "check", "preset", "filters", NULL};
    int format = FORMAT_XZ;
    int check = -1;
    uint32_t preset = LZMA_PRESET_DEFAULT;
    TyObject *preset_obj = Ty_None;
    TyObject *filterspecs = Ty_None;
    Compressor *self;

    _lzma_state *state = TyType_GetModuleState(type);
    assert(state != NULL);
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "|iiOO:LZMACompressor", arg_names,
                                     &format, &check, &preset_obj,
                                     &filterspecs)) {
        return NULL;
    }

    if (format != FORMAT_XZ && check != -1 && check != LZMA_CHECK_NONE) {
        TyErr_SetString(TyExc_ValueError,
                        "Integrity checks are only supported by FORMAT_XZ");
        return NULL;
    }

    if (preset_obj != Ty_None && filterspecs != Ty_None) {
        TyErr_SetString(TyExc_ValueError,
                        "Cannot specify both preset and filter chain");
        return NULL;
    }

    if (preset_obj != Ty_None && !_TyLong_UInt32_Converter(preset_obj, &preset)) {
        return NULL;
    }

    assert(type != NULL && type->tp_alloc != NULL);
    self = (Compressor *)type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }

    self->alloc.opaque = NULL;
    self->alloc.alloc = PyLzma_Malloc;
    self->alloc.free = PyLzma_Free;
    self->lzs.allocator = &self->alloc;

    self->lock = TyThread_allocate_lock();
    if (self->lock == NULL) {
        Ty_DECREF(self);
        TyErr_SetString(TyExc_MemoryError, "Unable to allocate lock");
        return NULL;
    }

    self->flushed = 0;
    switch (format) {
        case FORMAT_XZ:
            if (check == -1) {
                check = LZMA_CHECK_CRC64;
            }
            if (Compressor_init_xz(state, &self->lzs, check, preset, filterspecs) != 0) {
                goto error;
            }
            break;

        case FORMAT_ALONE:
            if (Compressor_init_alone(state, &self->lzs, preset, filterspecs) != 0) {
                goto error;
            }
            break;

        case FORMAT_RAW:
            if (Compressor_init_raw(state, &self->lzs, filterspecs) != 0) {
                goto error;
            }
            break;

        default:
            TyErr_Format(TyExc_ValueError,
                         "Invalid container format: %d", format);
            goto error;
    }

    return (TyObject *)self;

error:
    Ty_DECREF(self);
    return NULL;
}

static void
Compressor_dealloc(TyObject *op)
{
    Compressor *self = Compressor_CAST(op);
    lzma_end(&self->lzs);
    if (self->lock != NULL) {
        TyThread_free_lock(self->lock);
    }
    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyMethodDef Compressor_methods[] = {
    _LZMA_LZMACOMPRESSOR_COMPRESS_METHODDEF
    _LZMA_LZMACOMPRESSOR_FLUSH_METHODDEF
    {NULL}
};

static int
Compressor_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

TyDoc_STRVAR(Compressor_doc,
"LZMACompressor(format=FORMAT_XZ, check=-1, preset=None, filters=None)\n"
"\n"
"Create a compressor object for compressing data incrementally.\n"
"\n"
"format specifies the container format to use for the output. This can\n"
"be FORMAT_XZ (default), FORMAT_ALONE, or FORMAT_RAW.\n"
"\n"
"check specifies the integrity check to use. For FORMAT_XZ, the default\n"
"is CHECK_CRC64. FORMAT_ALONE and FORMAT_RAW do not support integrity\n"
"checks; for these formats, check must be omitted, or be CHECK_NONE.\n"
"\n"
"The settings used by the compressor can be specified either as a\n"
"preset compression level (with the 'preset' argument), or in detail\n"
"as a custom filter chain (with the 'filters' argument). For FORMAT_XZ\n"
"and FORMAT_ALONE, the default is to use the PRESET_DEFAULT preset\n"
"level. For FORMAT_RAW, the caller must always specify a filter chain;\n"
"the raw compressor does not support preset compression levels.\n"
"\n"
"preset (if provided) should be an integer in the range 0-9, optionally\n"
"OR-ed with the constant PRESET_EXTREME.\n"
"\n"
"filters (if provided) should be a sequence of dicts. Each dict should\n"
"have an entry for \"id\" indicating the ID of the filter, plus\n"
"additional entries for options to the filter.\n"
"\n"
"For one-shot compression, use the compress() function instead.\n");

static TyType_Slot lzma_compressor_type_slots[] = {
    {Ty_tp_dealloc, Compressor_dealloc},
    {Ty_tp_methods, Compressor_methods},
    {Ty_tp_new, Compressor_new},
    {Ty_tp_doc, (char *)Compressor_doc},
    {Ty_tp_traverse, Compressor_traverse},
    {0, 0}
};

static TyType_Spec lzma_compressor_type_spec = {
    .name = "_lzma.LZMACompressor",
    .basicsize = sizeof(Compressor),
    // Calling TyType_GetModuleState() on a subclass is not safe.
    // lzma_compressor_type_spec does not have Ty_TPFLAGS_BASETYPE flag
    // which prevents to create a subclass.
    // So calling TyType_GetModuleState() in this file is always safe.
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = lzma_compressor_type_slots,
};

/* LZMADecompressor class. */

/* Decompress data of length d->lzs.avail_in in d->lzs.next_in.  The output
   buffer is allocated dynamically and returned.  At most max_length bytes are
   returned, so some of the input may not be consumed. d->lzs.next_in and
   d->lzs.avail_in are updated to reflect the consumed input. */
static TyObject*
decompress_buf(Decompressor *d, Ty_ssize_t max_length)
{
    TyObject *result;
    lzma_stream *lzs = &d->lzs;
    _BlocksOutputBuffer buffer = {.list = NULL};
    _lzma_state *state = TyType_GetModuleState(Ty_TYPE(d));
    assert(state != NULL);

    if (OutputBuffer_InitAndGrow(&buffer, max_length, &lzs->next_out, &lzs->avail_out) < 0) {
        goto error;
    }

    for (;;) {
        lzma_ret lzret;

        Ty_BEGIN_ALLOW_THREADS
        lzret = lzma_code(lzs, LZMA_RUN);
        Ty_END_ALLOW_THREADS

        if (lzret == LZMA_BUF_ERROR && lzs->avail_in == 0 && lzs->avail_out > 0) {
            lzret = LZMA_OK; /* That wasn't a real error */
        }
        if (catch_lzma_error(state, lzret)) {
            goto error;
        }
        if (lzret == LZMA_GET_CHECK || lzret == LZMA_NO_CHECK) {
            d->check = lzma_get_check(&d->lzs);
        }
        if (lzret == LZMA_STREAM_END) {
            d->eof = 1;
            break;
        } else if (lzs->avail_out == 0) {
            /* Need to check lzs->avail_out before lzs->avail_in.
               Maybe lzs's internal state still have a few bytes
               can be output, grow the output buffer and continue
               if max_lengh < 0. */
            if (OutputBuffer_GetDataSize(&buffer, lzs->avail_out) == max_length) {
                break;
            }
            if (OutputBuffer_Grow(&buffer, &lzs->next_out, &lzs->avail_out) < 0) {
                goto error;
            }
        } else if (lzs->avail_in == 0) {
            break;
        }
    }

    result = OutputBuffer_Finish(&buffer, lzs->avail_out);
    if (result != NULL) {
        return result;
    }

error:
    OutputBuffer_OnError(&buffer);
    return NULL;
}

static TyObject *
decompress(Decompressor *d, uint8_t *data, size_t len, Ty_ssize_t max_length)
{
    char input_buffer_in_use;
    TyObject *result;
    lzma_stream *lzs = &d->lzs;

    /* Prepend unconsumed input if necessary */
    if (lzs->next_in != NULL) {
        size_t avail_now, avail_total;

        /* Number of bytes we can append to input buffer */
        avail_now = (d->input_buffer + d->input_buffer_size)
            - (lzs->next_in + lzs->avail_in);

        /* Number of bytes we can append if we move existing
           contents to beginning of buffer (overwriting
           consumed input) */
        avail_total = d->input_buffer_size - lzs->avail_in;

        if (avail_total < len) {
            size_t offset = lzs->next_in - d->input_buffer;
            uint8_t *tmp;
            size_t new_size = d->input_buffer_size + len - avail_now;

            /* Assign to temporary variable first, so we don't
               lose address of allocated buffer if realloc fails */
            tmp = TyMem_Realloc(d->input_buffer, new_size);
            if (tmp == NULL) {
                TyErr_SetNone(TyExc_MemoryError);
                return NULL;
            }
            d->input_buffer = tmp;
            d->input_buffer_size = new_size;

            lzs->next_in = d->input_buffer + offset;
        }
        else if (avail_now < len) {
            memmove(d->input_buffer, lzs->next_in,
                    lzs->avail_in);
            lzs->next_in = d->input_buffer;
        }
        memcpy((void*)(lzs->next_in + lzs->avail_in), data, len);
        lzs->avail_in += len;
        input_buffer_in_use = 1;
    }
    else {
        lzs->next_in = data;
        lzs->avail_in = len;
        input_buffer_in_use = 0;
    }

    result = decompress_buf(d, max_length);
    if (result == NULL) {
        lzs->next_in = NULL;
        return NULL;
    }

    if (d->eof) {
        d->needs_input = 0;
        if (lzs->avail_in > 0) {
            Ty_XSETREF(d->unused_data,
                      TyBytes_FromStringAndSize((char *)lzs->next_in, lzs->avail_in));
            if (d->unused_data == NULL) {
                goto error;
            }
        }
    }
    else if (lzs->avail_in == 0) {
        lzs->next_in = NULL;

        if (lzs->avail_out == 0) {
            /* (avail_in==0 && avail_out==0)
               Maybe lzs's internal state still have a few bytes can
               be output, try to output them next time. */
            d->needs_input = 0;

            /* If max_length < 0, lzs->avail_out always > 0 */
            assert(max_length >= 0);
        } else {
            /* Input buffer exhausted, output buffer has space. */
            d->needs_input = 1;
        }
    }
    else {
        d->needs_input = 0;

        /* If we did not use the input buffer, we now have
           to copy the tail from the caller's buffer into the
           input buffer */
        if (!input_buffer_in_use) {

            /* Discard buffer if it's too small
               (resizing it may needlessly copy the current contents) */
            if (d->input_buffer != NULL &&
                d->input_buffer_size < lzs->avail_in) {
                TyMem_Free(d->input_buffer);
                d->input_buffer = NULL;
            }

            /* Allocate if necessary */
            if (d->input_buffer == NULL) {
                d->input_buffer = TyMem_Malloc(lzs->avail_in);
                if (d->input_buffer == NULL) {
                    TyErr_SetNone(TyExc_MemoryError);
                    goto error;
                }
                d->input_buffer_size = lzs->avail_in;
            }

            /* Copy tail */
            memcpy(d->input_buffer, lzs->next_in, lzs->avail_in);
            lzs->next_in = d->input_buffer;
        }
    }

    return result;

error:
    Ty_XDECREF(result);
    return NULL;
}

/*[clinic input]
_lzma.LZMADecompressor.decompress

    data: Ty_buffer
    max_length: Ty_ssize_t=-1

Decompress *data*, returning uncompressed data as bytes.

If *max_length* is nonnegative, returns at most *max_length* bytes of
decompressed data. If this limit is reached and further output can be
produced, *self.needs_input* will be set to ``False``. In this case, the next
call to *decompress()* may provide *data* as b'' to obtain more of the output.

If all of the input data was decompressed and returned (either because this
was less than *max_length* bytes, or because *max_length* was negative),
*self.needs_input* will be set to True.

Attempting to decompress data after the end of stream is reached raises an
EOFError.  Any data found after the end of the stream is ignored and saved in
the unused_data attribute.
[clinic start generated code]*/

static TyObject *
_lzma_LZMADecompressor_decompress_impl(Decompressor *self, Ty_buffer *data,
                                       Ty_ssize_t max_length)
/*[clinic end generated code: output=ef4e20ec7122241d input=60c1f135820e309d]*/
{
    TyObject *result = NULL;

    ACQUIRE_LOCK(self);
    if (self->eof)
        TyErr_SetString(TyExc_EOFError, "Already at end of stream");
    else
        result = decompress(self, data->buf, data->len, max_length);
    RELEASE_LOCK(self);
    return result;
}

static int
Decompressor_init_raw(_lzma_state *state, lzma_stream *lzs, TyObject *filterspecs)
{
    lzma_filter filters[LZMA_FILTERS_MAX + 1];
    lzma_ret lzret;

    if (parse_filter_chain_spec(state, filters, filterspecs) == -1) {
        return -1;
    }
    lzret = lzma_raw_decoder(lzs, filters);
    free_filter_chain(filters);
    if (catch_lzma_error(state, lzret)) {
        return -1;
    }
    else {
        return 0;
    }
}

/*[clinic input]
@classmethod
_lzma.LZMADecompressor.__new__

    format: int(c_default="FORMAT_AUTO") = FORMAT_AUTO
        Specifies the container format of the input stream.  If this is
        FORMAT_AUTO (the default), the decompressor will automatically detect
        whether the input is FORMAT_XZ or FORMAT_ALONE.  Streams created with
        FORMAT_RAW cannot be autodetected.

    memlimit: object = None
        Limit the amount of memory used by the decompressor.  This will cause
        decompression to fail if the input cannot be decompressed within the
        given limit.

    filters: object = None
        A custom filter chain.  This argument is required for FORMAT_RAW, and
        not accepted with any other format.  When provided, this should be a
        sequence of dicts, each indicating the ID and options for a single
        filter.

Create a decompressor object for decompressing data incrementally.

For one-shot decompression, use the decompress() function instead.
[clinic start generated code]*/

static TyObject *
_lzma_LZMADecompressor_impl(TyTypeObject *type, int format,
                            TyObject *memlimit, TyObject *filters)
/*[clinic end generated code: output=2d46d5e70f10bc7f input=ca40cd1cb1202b0d]*/
{
    Decompressor *self;
    const uint32_t decoder_flags = LZMA_TELL_ANY_CHECK | LZMA_TELL_NO_CHECK;
    uint64_t memlimit_ = UINT64_MAX;
    lzma_ret lzret;
    _lzma_state *state = TyType_GetModuleState(type);
    assert(state != NULL);

    if (memlimit != Ty_None) {
        if (format == FORMAT_RAW) {
            TyErr_SetString(TyExc_ValueError,
                            "Cannot specify memory limit with FORMAT_RAW");
            return NULL;
        }
        if (!_TyLong_UInt64_Converter(memlimit, &memlimit_)) {
            return NULL;
        }
    }

    if (format == FORMAT_RAW && filters == Ty_None) {
        TyErr_SetString(TyExc_ValueError,
                        "Must specify filters for FORMAT_RAW");
        return NULL;
    } else if (format != FORMAT_RAW && filters != Ty_None) {
        TyErr_SetString(TyExc_ValueError,
                        "Cannot specify filters except with FORMAT_RAW");
        return NULL;
    }

    assert(type != NULL && type->tp_alloc != NULL);
    self = (Decompressor *)type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    self->alloc.opaque = NULL;
    self->alloc.alloc = PyLzma_Malloc;
    self->alloc.free = PyLzma_Free;
    self->lzs.allocator = &self->alloc;
    self->lzs.next_in = NULL;

    self->lock = TyThread_allocate_lock();
    if (self->lock == NULL) {
        Ty_DECREF(self);
        TyErr_SetString(TyExc_MemoryError, "Unable to allocate lock");
        return NULL;
    }

    self->check = LZMA_CHECK_UNKNOWN;
    self->needs_input = 1;
    self->input_buffer = NULL;
    self->input_buffer_size = 0;
    Ty_XSETREF(self->unused_data, TyBytes_FromStringAndSize(NULL, 0));
    if (self->unused_data == NULL) {
        goto error;
    }

    switch (format) {
        case FORMAT_AUTO:
            lzret = lzma_auto_decoder(&self->lzs, memlimit_, decoder_flags);
            if (catch_lzma_error(state, lzret)) {
                goto error;
            }
            break;

        case FORMAT_XZ:
            lzret = lzma_stream_decoder(&self->lzs, memlimit_, decoder_flags);
            if (catch_lzma_error(state, lzret)) {
                goto error;
            }
            break;

        case FORMAT_ALONE:
            self->check = LZMA_CHECK_NONE;
            lzret = lzma_alone_decoder(&self->lzs, memlimit_);
            if (catch_lzma_error(state, lzret)) {
                goto error;
            }
            break;

        case FORMAT_RAW:
            self->check = LZMA_CHECK_NONE;
            if (Decompressor_init_raw(state, &self->lzs, filters) == -1) {
                goto error;
            }
            break;

        default:
            TyErr_Format(TyExc_ValueError,
                         "Invalid container format: %d", format);
            goto error;
    }

    return (TyObject *)self;

error:
    Ty_DECREF(self);
    return NULL;
}

static void
Decompressor_dealloc(TyObject *op)
{
    Decompressor *self = Decompressor_CAST(op);
    if(self->input_buffer != NULL)
        TyMem_Free(self->input_buffer);

    lzma_end(&self->lzs);
    Ty_CLEAR(self->unused_data);
    if (self->lock != NULL) {
        TyThread_free_lock(self->lock);
    }
    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
Decompressor_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static TyMethodDef Decompressor_methods[] = {
    _LZMA_LZMADECOMPRESSOR_DECOMPRESS_METHODDEF
    {NULL}
};

TyDoc_STRVAR(Decompressor_check_doc,
"ID of the integrity check used by the input stream.");

TyDoc_STRVAR(Decompressor_eof_doc,
"True if the end-of-stream marker has been reached.");

TyDoc_STRVAR(Decompressor_needs_input_doc,
"True if more input is needed before more decompressed data can be produced.");

TyDoc_STRVAR(Decompressor_unused_data_doc,
"Data found after the end of the compressed stream.");

static TyMemberDef Decompressor_members[] = {
    {"check", Ty_T_INT, offsetof(Decompressor, check), Py_READONLY,
     Decompressor_check_doc},
    {"eof", Ty_T_BOOL, offsetof(Decompressor, eof), Py_READONLY,
     Decompressor_eof_doc},
    {"needs_input", Ty_T_BOOL, offsetof(Decompressor, needs_input), Py_READONLY,
     Decompressor_needs_input_doc},
    {"unused_data", Ty_T_OBJECT_EX, offsetof(Decompressor, unused_data), Py_READONLY,
     Decompressor_unused_data_doc},
    {NULL}
};

static TyType_Slot lzma_decompressor_type_slots[] = {
    {Ty_tp_dealloc, Decompressor_dealloc},
    {Ty_tp_methods, Decompressor_methods},
    {Ty_tp_new, _lzma_LZMADecompressor},
    {Ty_tp_doc, (char *)_lzma_LZMADecompressor__doc__},
    {Ty_tp_traverse, Decompressor_traverse},
    {Ty_tp_members, Decompressor_members},
    {0, 0}
};

static TyType_Spec lzma_decompressor_type_spec = {
    .name = "_lzma.LZMADecompressor",
    .basicsize = sizeof(Decompressor),
    // Calling TyType_GetModuleState() on a subclass is not safe.
    // lzma_decompressor_type_spec does not have Ty_TPFLAGS_BASETYPE flag
    // which prevents to create a subclass.
    // So calling TyType_GetModuleState() in this file is always safe.
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = lzma_decompressor_type_slots,
};


/* Module-level functions. */

/*[clinic input]
_lzma.is_check_supported
    check_id: int
    /

Test whether the given integrity check is supported.

Always returns True for CHECK_NONE and CHECK_CRC32.
[clinic start generated code]*/

static TyObject *
_lzma_is_check_supported_impl(TyObject *module, int check_id)
/*[clinic end generated code: output=e4f14ba3ce2ad0a5 input=5518297b97b2318f]*/
{
    return TyBool_FromLong(lzma_check_is_supported(check_id));
}

TyDoc_STRVAR(_lzma__encode_filter_properties__doc__,
"_encode_filter_properties($module, filter, /)\n"
"--\n"
"\n"
"Return a bytes object encoding the options (properties) of the filter specified by *filter* (a dict).\n"
"\n"
"The result does not include the filter ID itself, only the options.");

#define _LZMA__ENCODE_FILTER_PROPERTIES_METHODDEF    \
    {"_encode_filter_properties", _lzma__encode_filter_properties, METH_O, _lzma__encode_filter_properties__doc__},

static TyObject *
_lzma__encode_filter_properties_impl(TyObject *module, lzma_filter filter);

static TyObject *
_lzma__encode_filter_properties(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    lzma_filter filter = {LZMA_VLI_UNKNOWN, NULL};
    _lzma_state *state = get_lzma_state(module);
    assert(state != NULL);
    if (!lzma_filter_converter(state, arg, &filter)) {
        goto exit;
    }
    return_value = _lzma__encode_filter_properties_impl(module, filter);

exit:
    /* Cleanup for filter */
    if (filter.id != LZMA_VLI_UNKNOWN) {
       TyMem_Free(filter.options);
    }

    return return_value;
}

static TyObject *
_lzma__encode_filter_properties_impl(TyObject *module, lzma_filter filter)
{
    lzma_ret lzret;
    uint32_t encoded_size;
    TyObject *result = NULL;
    _lzma_state *state = get_lzma_state(module);
    assert(state != NULL);

    lzret = lzma_properties_size(&encoded_size, &filter);
    if (catch_lzma_error(state, lzret))
        goto error;

    result = TyBytes_FromStringAndSize(NULL, encoded_size);
    if (result == NULL)
        goto error;

    lzret = lzma_properties_encode(
            &filter, (uint8_t *)TyBytes_AS_STRING(result));
    if (catch_lzma_error(state, lzret)) {
        goto error;
    }

    return result;

error:
    Ty_XDECREF(result);
    return NULL;
}


/*[clinic input]
_lzma._decode_filter_properties
    filter_id: lzma_vli
    encoded_props: Ty_buffer
    /

Return a bytes object encoding the options (properties) of the filter specified by *filter* (a dict).

The result does not include the filter ID itself, only the options.
[clinic start generated code]*/

static TyObject *
_lzma__decode_filter_properties_impl(TyObject *module, lzma_vli filter_id,
                                     Ty_buffer *encoded_props)
/*[clinic end generated code: output=714fd2ef565d5c60 input=246410800782160c]*/
{
    lzma_filter filter;
    lzma_ret lzret;
    TyObject *result = NULL;
    filter.id = filter_id;
    _lzma_state *state = get_lzma_state(module);
    assert(state != NULL);

    lzret = lzma_properties_decode(
            &filter, NULL, encoded_props->buf, encoded_props->len);
    if (catch_lzma_error(state, lzret)) {
        return NULL;
    }

    result = build_filter_spec(&filter);

    /* We use vanilla free() here instead of TyMem_Free() - filter.options was
       allocated by lzma_properties_decode() using the default allocator. */
    free(filter.options);
    return result;
}

/* Some of our constants are more than 32 bits wide, so TyModule_AddIntConstant
   would not work correctly on platforms with 32-bit longs. */
static int
module_add_int_constant(TyObject *m, const char *name, long long value)
{
    return TyModule_Add(m, name, TyLong_FromLongLong(value));
}

static int
lzma_exec(TyObject *module)
{
#define ADD_INT_PREFIX_MACRO(module, macro)                                 \
    do {                                                                    \
        if (module_add_int_constant(module, #macro, LZMA_ ## macro) < 0) {  \
            return -1;                                                      \
        }                                                                   \
    } while(0)

#define ADD_INT_MACRO(module, macro)                                        \
    do {                                                                    \
        if (TyModule_AddIntMacro(module, macro) < 0) {                      \
            return -1;                                                      \
        }                                                                   \
    } while (0)


    _lzma_state *state = get_lzma_state(module);

    state->empty_tuple = TyTuple_New(0);
    if (state->empty_tuple == NULL) {
        return -1;
    }

    ADD_INT_MACRO(module, FORMAT_AUTO);
    ADD_INT_MACRO(module, FORMAT_XZ);
    ADD_INT_MACRO(module, FORMAT_ALONE);
    ADD_INT_MACRO(module, FORMAT_RAW);
    ADD_INT_PREFIX_MACRO(module, CHECK_NONE);
    ADD_INT_PREFIX_MACRO(module, CHECK_CRC32);
    ADD_INT_PREFIX_MACRO(module, CHECK_CRC64);
    ADD_INT_PREFIX_MACRO(module, CHECK_SHA256);
    ADD_INT_PREFIX_MACRO(module, CHECK_ID_MAX);
    ADD_INT_PREFIX_MACRO(module, CHECK_UNKNOWN);
    ADD_INT_PREFIX_MACRO(module, FILTER_LZMA1);
    ADD_INT_PREFIX_MACRO(module, FILTER_LZMA2);
    ADD_INT_PREFIX_MACRO(module, FILTER_DELTA);
    ADD_INT_PREFIX_MACRO(module, FILTER_X86);
    ADD_INT_PREFIX_MACRO(module, FILTER_IA64);
    ADD_INT_PREFIX_MACRO(module, FILTER_ARM);
    ADD_INT_PREFIX_MACRO(module, FILTER_ARMTHUMB);
    ADD_INT_PREFIX_MACRO(module, FILTER_SPARC);
    ADD_INT_PREFIX_MACRO(module, FILTER_POWERPC);
    ADD_INT_PREFIX_MACRO(module, MF_HC3);
    ADD_INT_PREFIX_MACRO(module, MF_HC4);
    ADD_INT_PREFIX_MACRO(module, MF_BT2);
    ADD_INT_PREFIX_MACRO(module, MF_BT3);
    ADD_INT_PREFIX_MACRO(module, MF_BT4);
    ADD_INT_PREFIX_MACRO(module, MODE_FAST);
    ADD_INT_PREFIX_MACRO(module, MODE_NORMAL);
    ADD_INT_PREFIX_MACRO(module, PRESET_DEFAULT);
    ADD_INT_PREFIX_MACRO(module, PRESET_EXTREME);

    state->error = TyErr_NewExceptionWithDoc("_lzma.LZMAError", "Call to liblzma failed.", NULL, NULL);
    if (state->error == NULL) {
        return -1;
    }

    if (TyModule_AddType(module, (TyTypeObject *)state->error) < 0) {
        return -1;
    }


    state->lzma_compressor_type = (TyTypeObject *)TyType_FromModuleAndSpec(module,
                                                            &lzma_compressor_type_spec, NULL);
    if (state->lzma_compressor_type == NULL) {
        return -1;
    }

    if (TyModule_AddType(module, state->lzma_compressor_type) < 0) {
        return -1;
    }

    state->lzma_decompressor_type = (TyTypeObject *)TyType_FromModuleAndSpec(module,
                                                         &lzma_decompressor_type_spec, NULL);
    if (state->lzma_decompressor_type == NULL) {
        return -1;
    }

    if (TyModule_AddType(module, state->lzma_decompressor_type) < 0) {
        return -1;
    }

    return 0;
}

static TyMethodDef lzma_methods[] = {
    _LZMA_IS_CHECK_SUPPORTED_METHODDEF
    _LZMA__ENCODE_FILTER_PROPERTIES_METHODDEF
    _LZMA__DECODE_FILTER_PROPERTIES_METHODDEF
    {NULL}
};

static PyModuleDef_Slot lzma_slots[] = {
    {Ty_mod_exec, lzma_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
lzma_traverse(TyObject *module, visitproc visit, void *arg)
{
    _lzma_state *state = get_lzma_state(module);
    Ty_VISIT(state->lzma_compressor_type);
    Ty_VISIT(state->lzma_decompressor_type);
    Ty_VISIT(state->error);
    Ty_VISIT(state->empty_tuple);
    return 0;
}

static int
lzma_clear(TyObject *module)
{
    _lzma_state *state = get_lzma_state(module);
    Ty_CLEAR(state->lzma_compressor_type);
    Ty_CLEAR(state->lzma_decompressor_type);
    Ty_CLEAR(state->error);
    Ty_CLEAR(state->empty_tuple);
    return 0;
}

static void
lzma_free(void *module)
{
    (void)lzma_clear((TyObject *)module);
}

static TyModuleDef _lzmamodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_lzma",
    .m_size = sizeof(_lzma_state),
    .m_methods = lzma_methods,
    .m_slots = lzma_slots,
    .m_traverse = lzma_traverse,
    .m_clear = lzma_clear,
    .m_free = lzma_free,
};

PyMODINIT_FUNC
PyInit__lzma(void)
{
    return PyModuleDef_Init(&_lzmamodule);
}
