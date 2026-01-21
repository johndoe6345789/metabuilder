/*
    An implementation of Text I/O as defined by PEP 3116 - "New I/O"

    Classes defined here: TextIOBase, IncrementalNewlineDecoder, TextIOWrapper.

    Written by Amaury Forgeot d'Arc and Antoine Pitrou
*/

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallMethod()
#include "pycore_codecs.h"        // _PyCodecInfo_GetIncrementalDecoder()
#include "pycore_fileutils.h"     // _Ty_GetLocaleEncoding()
#include "pycore_interp.h"        // TyInterpreterState.fs_codec
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_unicodeobject.h" // _TyUnicode_AsASCIIString()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include "_iomodule.h"

/*[clinic input]
module _io
class _io.IncrementalNewlineDecoder "nldecoder_object *" "clinic_state()->PyIncrementalNewlineDecoder_Type"
class _io.TextIOWrapper "textio *" "clinic_state()->TextIOWrapper_Type"
class _io._TextIOBase "TyObject *" "&PyTextIOBase_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=8b7f24fa13bfdd7f]*/

typedef struct nldecoder_object nldecoder_object;
typedef struct textio textio;

#define clinic_state() (find_io_state_by_def(Ty_TYPE(self)))
#include "clinic/textio.c.h"
#undef clinic_state

/* TextIOBase */

TyDoc_STRVAR(textiobase_doc,
    "Base class for text I/O.\n"
    "\n"
    "This class provides a character and line based interface to stream\n"
    "I/O. There is no readinto method because Python's character strings\n"
    "are immutable.\n"
    );

static TyObject *
_unsupported(_PyIO_State *state, const char *message)
{
    TyErr_SetString(state->unsupported_operation, message);
    return NULL;
}

/*[clinic input]
_io._TextIOBase.detach
    cls: defining_class
    /

Separate the underlying buffer from the TextIOBase and return it.

After the underlying buffer has been detached, the TextIO is in an unusable state.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_detach_impl(TyObject *self, TyTypeObject *cls)
/*[clinic end generated code: output=50915f40c609eaa4 input=987ca3640d0a3776]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return _unsupported(state, "detach");
}

/*[clinic input]
_io._TextIOBase.read
    cls: defining_class
    size: int(unused=True) = -1
    /

Read at most size characters from stream.

Read from underlying buffer until we have size characters or we hit EOF.
If size is negative or omitted, read until EOF.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_read_impl(TyObject *self, TyTypeObject *cls,
                          int Py_UNUSED(size))
/*[clinic end generated code: output=51a5178a309ce647 input=f5e37720f9fc563f]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return _unsupported(state, "read");
}

/*[clinic input]
_io._TextIOBase.readline
    cls: defining_class
    size: int(unused=True) = -1
    /

Read until newline or EOF.

Return an empty string if EOF is hit immediately.
If size is specified, at most size characters will be read.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_readline_impl(TyObject *self, TyTypeObject *cls,
                              int Py_UNUSED(size))
/*[clinic end generated code: output=3f47d7966d6d074e input=42eafec94107fa27]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return _unsupported(state, "readline");
}

/*[clinic input]
_io._TextIOBase.write
    cls: defining_class
    s: str(unused=True)
    /

Write string s to stream.

Return the number of characters written
(which is always equal to the length of the string).
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_write_impl(TyObject *self, TyTypeObject *cls,
                           const char *Py_UNUSED(s))
/*[clinic end generated code: output=18b28231460275de input=e9cabaa5f6732b07]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return _unsupported(state, "write");
}

/*[clinic input]
@getter
_io._TextIOBase.encoding

Encoding of the text stream.

Subclasses should override.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_encoding_get_impl(TyObject *self)
/*[clinic end generated code: output=e0f5d8f548b92432 input=4736d7621dd38f43]*/
{
    Py_RETURN_NONE;
}

/*[clinic input]
@getter
_io._TextIOBase.newlines

Line endings translated so far.

Only line endings translated during reading are considered.

Subclasses should override.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_newlines_get_impl(TyObject *self)
/*[clinic end generated code: output=46ec147fb9f00c2a input=a5b196d076af1164]*/
{
    Py_RETURN_NONE;
}

/*[clinic input]
@getter
_io._TextIOBase.errors

The error setting of the decoder or encoder.

Subclasses should override.
[clinic start generated code]*/

static TyObject *
_io__TextIOBase_errors_get_impl(TyObject *self)
/*[clinic end generated code: output=c6623d6addcd087d input=974aa52d1db93a82]*/
{
    Py_RETURN_NONE;
}


static TyMethodDef textiobase_methods[] = {
    _IO__TEXTIOBASE_DETACH_METHODDEF
    _IO__TEXTIOBASE_READ_METHODDEF
    _IO__TEXTIOBASE_READLINE_METHODDEF
    _IO__TEXTIOBASE_WRITE_METHODDEF
    {NULL, NULL}
};

static TyGetSetDef textiobase_getset[] = {
    _IO__TEXTIOBASE_ENCODING_GETSETDEF
    _IO__TEXTIOBASE_NEWLINES_GETSETDEF
    _IO__TEXTIOBASE_ERRORS_GETSETDEF
    {NULL}
};

static TyType_Slot textiobase_slots[] = {
    {Ty_tp_doc, (void *)textiobase_doc},
    {Ty_tp_methods, textiobase_methods},
    {Ty_tp_getset, textiobase_getset},
    {0, NULL},
};

/* Do not set Ty_TPFLAGS_HAVE_GC so that tp_traverse and tp_clear are inherited */
TyType_Spec textiobase_spec = {
    .name = "_io._TextIOBase",
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = textiobase_slots,
};

/* IncrementalNewlineDecoder */

struct nldecoder_object {
    PyObject_HEAD
    TyObject *decoder;
    TyObject *errors;
    unsigned int pendingcr: 1;
    unsigned int translate: 1;
    unsigned int seennl: 3;
};

#define nldecoder_object_CAST(op)   ((nldecoder_object *)(op))

/*[clinic input]
_io.IncrementalNewlineDecoder.__init__
    decoder: object
    translate: bool
    errors: object(c_default="NULL") = "strict"

Codec used when reading a file in universal newlines mode.

It wraps another incremental decoder, translating \r\n and \r into \n.
It also records the types of newlines encountered.  When used with
translate=False, it ensures that the newline sequence is returned in
one piece. When used with decoder=None, it expects unicode strings as
decode input and translates newlines without first invoking an external
decoder.
[clinic start generated code]*/

static int
_io_IncrementalNewlineDecoder___init___impl(nldecoder_object *self,
                                            TyObject *decoder, int translate,
                                            TyObject *errors)
/*[clinic end generated code: output=fbd04d443e764ec2 input=ed547aa257616b0e]*/
{

    if (errors == NULL) {
        errors = &_Ty_ID(strict);
    }
    else {
        errors = Ty_NewRef(errors);
    }

    Ty_XSETREF(self->errors, errors);
    Ty_XSETREF(self->decoder, Ty_NewRef(decoder));
    self->translate = translate ? 1 : 0;
    self->seennl = 0;
    self->pendingcr = 0;

    return 0;
}

static int
incrementalnewlinedecoder_traverse(TyObject *op, visitproc visit, void *arg)
{
    nldecoder_object *self = nldecoder_object_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->decoder);
    Ty_VISIT(self->errors);
    return 0;
}

static int
incrementalnewlinedecoder_clear(TyObject *op)
{
    nldecoder_object *self = nldecoder_object_CAST(op);
    Ty_CLEAR(self->decoder);
    Ty_CLEAR(self->errors);
    return 0;
}

static void
incrementalnewlinedecoder_dealloc(TyObject *op)
{
    nldecoder_object *self = nldecoder_object_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    (void)incrementalnewlinedecoder_clear(op);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
check_decoded(TyObject *decoded)
{
    if (decoded == NULL)
        return -1;
    if (!TyUnicode_Check(decoded)) {
        TyErr_Format(TyExc_TypeError,
                     "decoder should return a string result, not '%.200s'",
                     Ty_TYPE(decoded)->tp_name);
        Ty_DECREF(decoded);
        return -1;
    }
    return 0;
}

#define CHECK_INITIALIZED_DECODER(self) \
    if (self->errors == NULL) { \
        TyErr_SetString(TyExc_ValueError, \
                        "IncrementalNewlineDecoder.__init__() not called"); \
        return NULL; \
    }

#define SEEN_CR   1
#define SEEN_LF   2
#define SEEN_CRLF 4
#define SEEN_ALL (SEEN_CR | SEEN_LF | SEEN_CRLF)

TyObject *
_PyIncrementalNewlineDecoder_decode(TyObject *myself,
                                    TyObject *input, int final)
{
    TyObject *output;
    Ty_ssize_t output_len;
    nldecoder_object *self = nldecoder_object_CAST(myself);

    CHECK_INITIALIZED_DECODER(self);

    /* decode input (with the eventual \r from a previous pass) */
    if (self->decoder != Ty_None) {
        output = PyObject_CallMethodObjArgs(self->decoder,
            &_Ty_ID(decode), input, final ? Ty_True : Ty_False, NULL);
    }
    else {
        output = Ty_NewRef(input);
    }

    if (check_decoded(output) < 0)
        return NULL;

    output_len = TyUnicode_GET_LENGTH(output);
    if (self->pendingcr && (final || output_len > 0)) {
        /* Prefix output with CR */
        int kind;
        TyObject *modified;
        char *out;

        modified = TyUnicode_New(output_len + 1,
                                 TyUnicode_MAX_CHAR_VALUE(output));
        if (modified == NULL)
            goto error;
        kind = TyUnicode_KIND(modified);
        out = TyUnicode_DATA(modified);
        TyUnicode_WRITE(kind, out, 0, '\r');
        memcpy(out + kind, TyUnicode_DATA(output), kind * output_len);
        Ty_SETREF(output, modified);
        self->pendingcr = 0;
        output_len++;
    }

    /* retain last \r even when not translating data:
     * then readline() is sure to get \r\n in one pass
     */
    if (!final) {
        if (output_len > 0
            && TyUnicode_READ_CHAR(output, output_len - 1) == '\r')
        {
            TyObject *modified = TyUnicode_Substring(output, 0, output_len -1);
            if (modified == NULL)
                goto error;
            Ty_SETREF(output, modified);
            self->pendingcr = 1;
        }
    }

    /* Record which newlines are read and do newline translation if desired,
       all in one pass. */
    {
        const void *in_str;
        Ty_ssize_t len;
        int seennl = self->seennl;
        int only_lf = 0;
        int kind;

        in_str = TyUnicode_DATA(output);
        len = TyUnicode_GET_LENGTH(output);
        kind = TyUnicode_KIND(output);

        if (len == 0)
            return output;

        /* If, up to now, newlines are consistently \n, do a quick check
           for the \r *byte* with the libc's optimized memchr.
           */
        if (seennl == SEEN_LF || seennl == 0) {
            only_lf = (memchr(in_str, '\r', kind * len) == NULL);
        }

        if (only_lf) {
            /* If not already seen, quick scan for a possible "\n" character.
               (there's nothing else to be done, even when in translation mode)
            */
            if (seennl == 0 &&
                memchr(in_str, '\n', kind * len) != NULL) {
                if (kind == TyUnicode_1BYTE_KIND)
                    seennl |= SEEN_LF;
                else {
                    Ty_ssize_t i = 0;
                    for (;;) {
                        Ty_UCS4 c;
                        /* Fast loop for non-control characters */
                        while (TyUnicode_READ(kind, in_str, i) > '\n')
                            i++;
                        c = TyUnicode_READ(kind, in_str, i++);
                        if (c == '\n') {
                            seennl |= SEEN_LF;
                            break;
                        }
                        if (i >= len)
                            break;
                    }
                }
            }
            /* Finished: we have scanned for newlines, and none of them
               need translating */
        }
        else if (!self->translate) {
            Ty_ssize_t i = 0;
            /* We have already seen all newline types, no need to scan again */
            if (seennl == SEEN_ALL)
                goto endscan;
            for (;;) {
                Ty_UCS4 c;
                /* Fast loop for non-control characters */
                while (TyUnicode_READ(kind, in_str, i) > '\r')
                    i++;
                c = TyUnicode_READ(kind, in_str, i++);
                if (c == '\n')
                    seennl |= SEEN_LF;
                else if (c == '\r') {
                    if (TyUnicode_READ(kind, in_str, i) == '\n') {
                        seennl |= SEEN_CRLF;
                        i++;
                    }
                    else
                        seennl |= SEEN_CR;
                }
                if (i >= len)
                    break;
                if (seennl == SEEN_ALL)
                    break;
            }
        endscan:
            ;
        }
        else {
            void *translated;
            int kind = TyUnicode_KIND(output);
            const void *in_str = TyUnicode_DATA(output);
            Ty_ssize_t in, out;
            /* XXX: Previous in-place translation here is disabled as
               resizing is not possible anymore */
            /* We could try to optimize this so that we only do a copy
               when there is something to translate. On the other hand,
               we already know there is a \r byte, so chances are high
               that something needs to be done. */
            translated = TyMem_Malloc(kind * len);
            if (translated == NULL) {
                TyErr_NoMemory();
                goto error;
            }
            in = out = 0;
            for (;;) {
                Ty_UCS4 c;
                /* Fast loop for non-control characters */
                while ((c = TyUnicode_READ(kind, in_str, in++)) > '\r')
                    TyUnicode_WRITE(kind, translated, out++, c);
                if (c == '\n') {
                    TyUnicode_WRITE(kind, translated, out++, c);
                    seennl |= SEEN_LF;
                    continue;
                }
                if (c == '\r') {
                    if (TyUnicode_READ(kind, in_str, in) == '\n') {
                        in++;
                        seennl |= SEEN_CRLF;
                    }
                    else
                        seennl |= SEEN_CR;
                    TyUnicode_WRITE(kind, translated, out++, '\n');
                    continue;
                }
                if (in > len)
                    break;
                TyUnicode_WRITE(kind, translated, out++, c);
            }
            Ty_DECREF(output);
            output = TyUnicode_FromKindAndData(kind, translated, out);
            TyMem_Free(translated);
            if (!output)
                return NULL;
        }
        self->seennl |= seennl;
    }

    return output;

  error:
    Ty_DECREF(output);
    return NULL;
}

/*[clinic input]
_io.IncrementalNewlineDecoder.decode
    input: object
    final: bool = False
[clinic start generated code]*/

static TyObject *
_io_IncrementalNewlineDecoder_decode_impl(nldecoder_object *self,
                                          TyObject *input, int final)
/*[clinic end generated code: output=0d486755bb37a66e input=90e223c70322c5cd]*/
{
    return _PyIncrementalNewlineDecoder_decode((TyObject *) self, input, final);
}

/*[clinic input]
_io.IncrementalNewlineDecoder.getstate
[clinic start generated code]*/

static TyObject *
_io_IncrementalNewlineDecoder_getstate_impl(nldecoder_object *self)
/*[clinic end generated code: output=f0d2c9c136f4e0d0 input=f8ff101825e32e7f]*/
{
    TyObject *buffer;
    unsigned long long flag;

    CHECK_INITIALIZED_DECODER(self);

    if (self->decoder != Ty_None) {
        TyObject *state = PyObject_CallMethodNoArgs(self->decoder,
           &_Ty_ID(getstate));
        if (state == NULL)
            return NULL;
        if (!TyTuple_Check(state)) {
            TyErr_SetString(TyExc_TypeError,
                            "illegal decoder state");
            Ty_DECREF(state);
            return NULL;
        }
        if (!TyArg_ParseTuple(state, "OK;illegal decoder state",
                              &buffer, &flag))
        {
            Ty_DECREF(state);
            return NULL;
        }
        Ty_INCREF(buffer);
        Ty_DECREF(state);
    }
    else {
        buffer = Ty_GetConstant(Ty_CONSTANT_EMPTY_BYTES);
        flag = 0;
    }
    flag <<= 1;
    if (self->pendingcr)
        flag |= 1;
    return Ty_BuildValue("NK", buffer, flag);
}

/*[clinic input]
_io.IncrementalNewlineDecoder.setstate
    state: object
    /
[clinic start generated code]*/

static TyObject *
_io_IncrementalNewlineDecoder_setstate_impl(nldecoder_object *self,
                                            TyObject *state)
/*[clinic end generated code: output=09135cb6e78a1dc8 input=c53fb505a76dbbe2]*/
{
    TyObject *buffer;
    unsigned long long flag;

    CHECK_INITIALIZED_DECODER(self);

    if (!TyTuple_Check(state)) {
        TyErr_SetString(TyExc_TypeError, "state argument must be a tuple");
        return NULL;
    }
    if (!TyArg_ParseTuple(state, "OK;setstate(): illegal state argument",
                          &buffer, &flag))
    {
        return NULL;
    }

    self->pendingcr = (int) (flag & 1);
    flag >>= 1;

    if (self->decoder != Ty_None) {
        return _TyObject_CallMethod(self->decoder, &_Ty_ID(setstate),
                                    "((OK))", buffer, flag);
    }
    else {
        Py_RETURN_NONE;
    }
}

/*[clinic input]
_io.IncrementalNewlineDecoder.reset
[clinic start generated code]*/

static TyObject *
_io_IncrementalNewlineDecoder_reset_impl(nldecoder_object *self)
/*[clinic end generated code: output=32fa40c7462aa8ff input=728678ddaea776df]*/
{
    CHECK_INITIALIZED_DECODER(self);

    self->seennl = 0;
    self->pendingcr = 0;
    if (self->decoder != Ty_None)
        return PyObject_CallMethodNoArgs(self->decoder, &_Ty_ID(reset));
    else
        Py_RETURN_NONE;
}

static TyObject *
incrementalnewlinedecoder_newlines_get(TyObject *op, void *Py_UNUSED(context))
{
    nldecoder_object *self = nldecoder_object_CAST(op);
    CHECK_INITIALIZED_DECODER(self);

    switch (self->seennl) {
    case SEEN_CR:
        return TyUnicode_FromString("\r");
    case SEEN_LF:
        return TyUnicode_FromString("\n");
    case SEEN_CRLF:
        return TyUnicode_FromString("\r\n");
    case SEEN_CR | SEEN_LF:
        return Ty_BuildValue("ss", "\r", "\n");
    case SEEN_CR | SEEN_CRLF:
        return Ty_BuildValue("ss", "\r", "\r\n");
    case SEEN_LF | SEEN_CRLF:
        return Ty_BuildValue("ss", "\n", "\r\n");
    case SEEN_CR | SEEN_LF | SEEN_CRLF:
        return Ty_BuildValue("sss", "\r", "\n", "\r\n");
    default:
        Py_RETURN_NONE;
   }

}

/* TextIOWrapper */

typedef TyObject *(*encodefunc_t)(TyObject *, TyObject *);

struct textio
{
    PyObject_HEAD
    int ok; /* initialized? */
    int detached;
    Ty_ssize_t chunk_size;
    TyObject *buffer;
    TyObject *encoding;
    TyObject *encoder;
    TyObject *decoder;
    TyObject *readnl;
    TyObject *errors;
    const char *writenl; /* ASCII-encoded; NULL stands for \n */
    char line_buffering;
    char write_through;
    char readuniversal;
    char readtranslate;
    char writetranslate;
    char seekable;
    char has_read1;
    char telling;
    char finalizing;
    /* Specialized encoding func (see below) */
    encodefunc_t encodefunc;
    /* Whether or not it's the start of the stream */
    char encoding_start_of_stream;

    /* Reads and writes are internally buffered in order to speed things up.
       However, any read will first flush the write buffer if itsn't empty.

       Please also note that text to be written is first encoded before being
       buffered. This is necessary so that encoding errors are immediately
       reported to the caller, but it unfortunately means that the
       IncrementalEncoder (whose encode() method is always written in Python)
       becomes a bottleneck for small writes.
    */
    TyObject *decoded_chars;       /* buffer for text returned from decoder */
    Ty_ssize_t decoded_chars_used; /* offset into _decoded_chars for read() */
    TyObject *pending_bytes;       // data waiting to be written.
                                   // ascii unicode, bytes, or list of them.
    Ty_ssize_t pending_bytes_count;

    /* snapshot is either NULL, or a tuple (dec_flags, next_input) where
     * dec_flags is the second (integer) item of the decoder state and
     * next_input is the chunk of input bytes that comes next after the
     * snapshot point.  We use this to reconstruct decoder states in tell().
     */
    TyObject *snapshot;
    /* Bytes-to-characters ratio for the current chunk. Serves as input for
       the heuristic in tell(). */
    double b2cratio;

    /* Cache raw object if it's a FileIO object */
    TyObject *raw;

    TyObject *weakreflist;
    TyObject *dict;

    _PyIO_State *state;
};

#define textio_CAST(op) ((textio *)(op))

static void
textiowrapper_set_decoded_chars(textio *self, TyObject *chars);

/* A couple of specialized cases in order to bypass the slow incremental
   encoding methods for the most popular encodings. */

static TyObject *
ascii_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_AsASCIIString(text, TyUnicode_AsUTF8(self->errors));
}

static TyObject *
utf16be_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_EncodeUTF16(text, TyUnicode_AsUTF8(self->errors), 1);
}

static TyObject *
utf16le_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_EncodeUTF16(text, TyUnicode_AsUTF8(self->errors), -1);
}

static TyObject *
utf16_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    if (!self->encoding_start_of_stream) {
        /* Skip the BOM and use native byte ordering */
#if PY_BIG_ENDIAN
        return utf16be_encode(op, text);
#else
        return utf16le_encode(op, text);
#endif
    }
    return _TyUnicode_EncodeUTF16(text, TyUnicode_AsUTF8(self->errors), 0);
}

static TyObject *
utf32be_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_EncodeUTF32(text, TyUnicode_AsUTF8(self->errors), 1);
}

static TyObject *
utf32le_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_EncodeUTF32(text, TyUnicode_AsUTF8(self->errors), -1);
}

static TyObject *
utf32_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    if (!self->encoding_start_of_stream) {
        /* Skip the BOM and use native byte ordering */
#if PY_BIG_ENDIAN
        return utf32be_encode(op, text);
#else
        return utf32le_encode(op, text);
#endif
    }
    return _TyUnicode_EncodeUTF32(text, TyUnicode_AsUTF8(self->errors), 0);
}

static TyObject *
utf8_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_AsUTF8String(text, TyUnicode_AsUTF8(self->errors));
}

static TyObject *
latin1_encode(TyObject *op, TyObject *text)
{
    textio *self = textio_CAST(op);
    return _TyUnicode_AsLatin1String(text, TyUnicode_AsUTF8(self->errors));
}

// Return true when encoding can be skipped when text is ascii.
static inline int
is_asciicompat_encoding(encodefunc_t f)
{
    return f == ascii_encode || f == latin1_encode || f == utf8_encode;
}

/* Map normalized encoding names onto the specialized encoding funcs */

typedef struct {
    const char *name;
    encodefunc_t encodefunc;
} encodefuncentry;

static const encodefuncentry encodefuncs[] = {
    {"ascii",       ascii_encode},
    {"iso8859-1",   latin1_encode},
    {"utf-8",       utf8_encode},
    {"utf-16-be",   utf16be_encode},
    {"utf-16-le",   utf16le_encode},
    {"utf-16",      utf16_encode},
    {"utf-32-be",   utf32be_encode},
    {"utf-32-le",   utf32le_encode},
    {"utf-32",      utf32_encode},
    {NULL, NULL}
};

static int
validate_newline(const char *newline)
{
    if (newline && newline[0] != '\0'
        && !(newline[0] == '\n' && newline[1] == '\0')
        && !(newline[0] == '\r' && newline[1] == '\0')
        && !(newline[0] == '\r' && newline[1] == '\n' && newline[2] == '\0')) {
        TyErr_Format(TyExc_ValueError,
                     "illegal newline value: %s", newline);
        return -1;
    }
    return 0;
}

static int
set_newline(textio *self, const char *newline)
{
    TyObject *old = self->readnl;
    if (newline == NULL) {
        self->readnl = NULL;
    }
    else {
        self->readnl = TyUnicode_FromString(newline);
        if (self->readnl == NULL) {
            self->readnl = old;
            return -1;
        }
    }
    self->readuniversal = (newline == NULL || newline[0] == '\0');
    self->readtranslate = (newline == NULL);
    self->writetranslate = (newline == NULL || newline[0] != '\0');
    if (!self->readuniversal && self->readnl != NULL) {
        // validate_newline() accepts only ASCII newlines.
        assert(TyUnicode_KIND(self->readnl) == TyUnicode_1BYTE_KIND);
        self->writenl = (const char *)TyUnicode_1BYTE_DATA(self->readnl);
        if (strcmp(self->writenl, "\n") == 0) {
            self->writenl = NULL;
        }
    }
    else {
#ifdef MS_WINDOWS
        self->writenl = "\r\n";
#else
        self->writenl = NULL;
#endif
    }
    Ty_XDECREF(old);
    return 0;
}

static int
_textiowrapper_set_decoder(textio *self, TyObject *codec_info,
                           const char *errors)
{
    TyObject *res;
    int r;

    res = PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(readable));
    if (res == NULL)
        return -1;

    r = PyObject_IsTrue(res);
    Ty_DECREF(res);
    if (r == -1)
        return -1;

    if (r != 1)
        return 0;

    Ty_CLEAR(self->decoder);
    self->decoder = _PyCodecInfo_GetIncrementalDecoder(codec_info, errors);
    if (self->decoder == NULL)
        return -1;

    if (self->readuniversal) {
        _PyIO_State *state = self->state;
        TyObject *incrementalDecoder = PyObject_CallFunctionObjArgs(
            (TyObject *)state->PyIncrementalNewlineDecoder_Type,
            self->decoder, self->readtranslate ? Ty_True : Ty_False, NULL);
        if (incrementalDecoder == NULL)
            return -1;
        Ty_XSETREF(self->decoder, incrementalDecoder);
    }

    return 0;
}

static TyObject*
_textiowrapper_decode(_PyIO_State *state, TyObject *decoder, TyObject *bytes,
                      int eof)
{
    TyObject *chars;

    if (Ty_IS_TYPE(decoder, state->PyIncrementalNewlineDecoder_Type))
        chars = _PyIncrementalNewlineDecoder_decode(decoder, bytes, eof);
    else
        chars = PyObject_CallMethodObjArgs(decoder, &_Ty_ID(decode), bytes,
                                           eof ? Ty_True : Ty_False, NULL);

    if (check_decoded(chars) < 0)
        // check_decoded already decreases refcount
        return NULL;

    return chars;
}

static int
_textiowrapper_set_encoder(textio *self, TyObject *codec_info,
                           const char *errors)
{
    TyObject *res;
    int r;

    res = PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(writable));
    if (res == NULL)
        return -1;

    r = PyObject_IsTrue(res);
    Ty_DECREF(res);
    if (r == -1)
        return -1;

    if (r != 1)
        return 0;

    Ty_CLEAR(self->encoder);
    self->encodefunc = NULL;
    self->encoder = _PyCodecInfo_GetIncrementalEncoder(codec_info, errors);
    if (self->encoder == NULL)
        return -1;

    /* Get the normalized named of the codec */
    if (PyObject_GetOptionalAttr(codec_info, &_Ty_ID(name), &res) < 0) {
        return -1;
    }
    if (res != NULL && TyUnicode_Check(res)) {
        const encodefuncentry *e = encodefuncs;
        while (e->name != NULL) {
            if (_TyUnicode_EqualToASCIIString(res, e->name)) {
                self->encodefunc = e->encodefunc;
                break;
            }
            e++;
        }
    }
    Ty_XDECREF(res);

    return 0;
}

static int
_textiowrapper_fix_encoder_state(textio *self)
{
    if (!self->seekable || !self->encoder) {
        return 0;
    }

    self->encoding_start_of_stream = 1;

    TyObject *cookieObj = PyObject_CallMethodNoArgs(
        self->buffer, &_Ty_ID(tell));
    if (cookieObj == NULL) {
        return -1;
    }

    int cmp = PyObject_RichCompareBool(cookieObj, _TyLong_GetZero(), Py_EQ);
    Ty_DECREF(cookieObj);
    if (cmp < 0) {
        return -1;
    }

    if (cmp == 0) {
        self->encoding_start_of_stream = 0;
        TyObject *res = PyObject_CallMethodOneArg(
            self->encoder, &_Ty_ID(setstate), _TyLong_GetZero());
        if (res == NULL) {
            return -1;
        }
        Ty_DECREF(res);
    }

    return 0;
}

static int
io_check_errors(TyObject *errors)
{
    assert(errors != NULL && errors != Ty_None);

    TyInterpreterState *interp = _TyInterpreterState_GET();
#ifndef Ty_DEBUG
    /* In release mode, only check in development mode (-X dev) */
    if (!_TyInterpreterState_GetConfig(interp)->dev_mode) {
        return 0;
    }
#else
    /* Always check in debug mode */
#endif

    /* Avoid calling PyCodec_LookupError() before the codec registry is ready:
       before_PyUnicode_InitEncodings() is called. */
    if (!interp->unicode.fs_codec.encoding) {
        return 0;
    }

    const char *name = _TyUnicode_AsUTF8NoNUL(errors);
    if (name == NULL) {
        return -1;
    }
    TyObject *handler = PyCodec_LookupError(name);
    if (handler != NULL) {
        Ty_DECREF(handler);
        return 0;
    }
    return -1;
}



/*[clinic input]
_io.TextIOWrapper.__init__
    buffer: object
    encoding: str(accept={str, NoneType}) = None
    errors: object = None
    newline: str(accept={str, NoneType}) = None
    line_buffering: bool = False
    write_through: bool = False

Character and line based layer over a BufferedIOBase object, buffer.

encoding gives the name of the encoding that the stream will be
decoded or encoded with. It defaults to locale.getencoding().

errors determines the strictness of encoding and decoding (see
help(codecs.Codec) or the documentation for codecs.register) and
defaults to "strict".

newline controls how line endings are handled. It can be None, '',
'\n', '\r', and '\r\n'.  It works as follows:

* On input, if newline is None, universal newlines mode is
  enabled. Lines in the input can end in '\n', '\r', or '\r\n', and
  these are translated into '\n' before being returned to the
  caller. If it is '', universal newline mode is enabled, but line
  endings are returned to the caller untranslated. If it has any of
  the other legal values, input lines are only terminated by the given
  string, and the line ending is returned to the caller untranslated.

* On output, if newline is None, any '\n' characters written are
  translated to the system default line separator, os.linesep. If
  newline is '' or '\n', no translation takes place. If newline is any
  of the other legal values, any '\n' characters written are translated
  to the given string.

If line_buffering is True, a call to flush is implied when a call to
write contains a newline character.
[clinic start generated code]*/

static int
_io_TextIOWrapper___init___impl(textio *self, TyObject *buffer,
                                const char *encoding, TyObject *errors,
                                const char *newline, int line_buffering,
                                int write_through)
/*[clinic end generated code: output=72267c0c01032ed2 input=e6cfaaaf6059d4f5]*/
{
    TyObject *raw, *codec_info = NULL;
    TyObject *res;
    int r;

    self->ok = 0;
    self->detached = 0;

    if (encoding == NULL) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        if (_TyInterpreterState_GetConfig(interp)->warn_default_encoding) {
            if (TyErr_WarnEx(TyExc_EncodingWarning,
                             "'encoding' argument not specified", 1)) {
                return -1;
            }
        }
    }

    if (errors == Ty_None) {
        errors = &_Ty_ID(strict);
    }
    else if (!TyUnicode_Check(errors)) {
        // Check 'errors' argument here because Argument Clinic doesn't support
        // 'str(accept={str, NoneType})' converter.
        TyErr_Format(
            TyExc_TypeError,
            "TextIOWrapper() argument 'errors' must be str or None, not %.50s",
            Ty_TYPE(errors)->tp_name);
        return -1;
    }
    else if (io_check_errors(errors)) {
        return -1;
    }
    const char *errors_str = _TyUnicode_AsUTF8NoNUL(errors);
    if (errors_str == NULL) {
        return -1;
    }

    if (validate_newline(newline) < 0) {
        return -1;
    }

    Ty_CLEAR(self->buffer);
    Ty_CLEAR(self->encoding);
    Ty_CLEAR(self->encoder);
    Ty_CLEAR(self->decoder);
    Ty_CLEAR(self->readnl);
    Ty_CLEAR(self->decoded_chars);
    Ty_CLEAR(self->pending_bytes);
    Ty_CLEAR(self->snapshot);
    Ty_CLEAR(self->errors);
    Ty_CLEAR(self->raw);
    self->decoded_chars_used = 0;
    self->pending_bytes_count = 0;
    self->encodefunc = NULL;
    self->b2cratio = 0.0;

    if (encoding == NULL && _PyRuntime.preconfig.utf8_mode) {
        _Ty_DECLARE_STR(utf_8, "utf-8");
        self->encoding = &_Ty_STR(utf_8);
    }
    else if (encoding == NULL || (strcmp(encoding, "locale") == 0)) {
        self->encoding = _Ty_GetLocaleEncodingObject();
        if (self->encoding == NULL) {
            goto error;
        }
        assert(TyUnicode_Check(self->encoding));
    }

    if (self->encoding != NULL) {
        encoding = TyUnicode_AsUTF8(self->encoding);
        if (encoding == NULL)
            goto error;
    }
    else if (encoding != NULL) {
        self->encoding = TyUnicode_FromString(encoding);
        if (self->encoding == NULL)
            goto error;
    }
    else {
        TyErr_SetString(TyExc_OSError,
                        "could not determine default encoding");
        goto error;
    }

    /* Check we have been asked for a real text encoding */
    codec_info = _PyCodec_LookupTextEncoding(encoding, NULL);
    if (codec_info == NULL) {
        Ty_CLEAR(self->encoding);
        goto error;
    }

    /* XXX: Failures beyond this point have the potential to leak elements
     * of the partially constructed object (like self->encoding)
     */

    self->errors = Ty_NewRef(errors);
    self->chunk_size = 8192;
    self->line_buffering = line_buffering;
    self->write_through = write_through;
    if (set_newline(self, newline) < 0) {
        goto error;
    }

    self->buffer = Ty_NewRef(buffer);

    /* Build the decoder object */
    _PyIO_State *state = find_io_state_by_def(Ty_TYPE(self));
    self->state = state;
    if (_textiowrapper_set_decoder(self, codec_info, errors_str) != 0)
        goto error;

    /* Build the encoder object */
    if (_textiowrapper_set_encoder(self, codec_info, errors_str) != 0)
        goto error;

    /* Finished sorting out the codec details */
    Ty_CLEAR(codec_info);

    if (Ty_IS_TYPE(buffer, state->PyBufferedReader_Type) ||
        Ty_IS_TYPE(buffer, state->PyBufferedWriter_Type) ||
        Ty_IS_TYPE(buffer, state->PyBufferedRandom_Type))
    {
        if (PyObject_GetOptionalAttr(buffer, &_Ty_ID(raw), &raw) < 0)
            goto error;
        /* Cache the raw FileIO object to speed up 'closed' checks */
        if (raw != NULL) {
            if (Ty_IS_TYPE(raw, state->PyFileIO_Type))
                self->raw = raw;
            else
                Ty_DECREF(raw);
        }
    }

    res = PyObject_CallMethodNoArgs(buffer, &_Ty_ID(seekable));
    if (res == NULL)
        goto error;
    r = PyObject_IsTrue(res);
    Ty_DECREF(res);
    if (r < 0)
        goto error;
    self->seekable = self->telling = r;

    r = PyObject_HasAttrWithError(buffer, &_Ty_ID(read1));
    if (r < 0) {
        goto error;
    }
    self->has_read1 = r;

    self->encoding_start_of_stream = 0;
    if (_textiowrapper_fix_encoder_state(self) < 0) {
        goto error;
    }

    self->ok = 1;
    return 0;

  error:
    Ty_XDECREF(codec_info);
    return -1;
}

/* Return *default_value* if ob is None, 0 if ob is false, 1 if ob is true,
 * -1 on error.
 */
static int
convert_optional_bool(TyObject *obj, int default_value)
{
    long v;
    if (obj == Ty_None) {
        v = default_value;
    }
    else {
        v = TyLong_AsLong(obj);
        if (v == -1 && TyErr_Occurred())
            return -1;
    }
    return v != 0;
}

static int
textiowrapper_change_encoding(textio *self, TyObject *encoding,
                              TyObject *errors, int newline_changed)
{
    /* Use existing settings where new settings are not specified */
    if (encoding == Ty_None && errors == Ty_None && !newline_changed) {
        return 0;  // no change
    }

    if (encoding == Ty_None) {
        encoding = self->encoding;
        if (errors == Ty_None) {
            errors = self->errors;
        }
        Ty_INCREF(encoding);
    }
    else {
        if (_TyUnicode_EqualToASCIIString(encoding, "locale")) {
            encoding = _Ty_GetLocaleEncodingObject();
            if (encoding == NULL) {
                return -1;
            }
        } else {
            Ty_INCREF(encoding);
        }
        if (errors == Ty_None) {
            errors = &_Ty_ID(strict);
        }
    }
    Ty_INCREF(errors);

    const char *c_encoding = TyUnicode_AsUTF8(encoding);
    if (c_encoding == NULL) {
        Ty_DECREF(encoding);
        Ty_DECREF(errors);
        return -1;
    }
    const char *c_errors = TyUnicode_AsUTF8(errors);
    if (c_errors == NULL) {
        Ty_DECREF(encoding);
        Ty_DECREF(errors);
        return -1;
    }

    // Create new encoder & decoder
    TyObject *codec_info = _PyCodec_LookupTextEncoding(c_encoding, NULL);
    if (codec_info == NULL) {
        Ty_DECREF(encoding);
        Ty_DECREF(errors);
        return -1;
    }
    if (_textiowrapper_set_decoder(self, codec_info, c_errors) != 0 ||
            _textiowrapper_set_encoder(self, codec_info, c_errors) != 0) {
        Ty_DECREF(codec_info);
        Ty_DECREF(encoding);
        Ty_DECREF(errors);
        return -1;
    }
    Ty_DECREF(codec_info);

    Ty_SETREF(self->encoding, encoding);
    Ty_SETREF(self->errors, errors);

    return _textiowrapper_fix_encoder_state(self);
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.reconfigure
    *
    encoding: object = None
    errors: object = None
    newline as newline_obj: object(c_default="NULL") = None
    line_buffering as line_buffering_obj: object = None
    write_through as write_through_obj: object = None

Reconfigure the text stream with new parameters.

This also does an implicit stream flush.

[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_reconfigure_impl(textio *self, TyObject *encoding,
                                   TyObject *errors, TyObject *newline_obj,
                                   TyObject *line_buffering_obj,
                                   TyObject *write_through_obj)
/*[clinic end generated code: output=52b812ff4b3d4b0f input=dc3bd35ebda702a7]*/
{
    int line_buffering;
    int write_through;
    const char *newline = NULL;

    if (encoding != Ty_None && !TyUnicode_Check(encoding)) {
        TyErr_Format(TyExc_TypeError,
                "reconfigure() argument 'encoding' must be str or None, not %s",
                Ty_TYPE(encoding)->tp_name);
        return NULL;
    }
    if (errors != Ty_None && !TyUnicode_Check(errors)) {
        TyErr_Format(TyExc_TypeError,
                "reconfigure() argument 'errors' must be str or None, not %s",
                Ty_TYPE(errors)->tp_name);
        return NULL;
    }
    if (newline_obj != NULL && newline_obj != Ty_None &&
        !TyUnicode_Check(newline_obj))
    {
        TyErr_Format(TyExc_TypeError,
                "reconfigure() argument 'newline' must be str or None, not %s",
                Ty_TYPE(newline_obj)->tp_name);
        return NULL;
    }
    /* Check if something is in the read buffer */
    if (self->decoded_chars != NULL) {
        if (encoding != Ty_None || errors != Ty_None || newline_obj != NULL) {
            _unsupported(self->state,
                         "It is not possible to set the encoding or newline "
                         "of stream after the first read");
            return NULL;
        }
    }

    if (newline_obj != NULL && newline_obj != Ty_None) {
        newline = TyUnicode_AsUTF8(newline_obj);
        if (newline == NULL || validate_newline(newline) < 0) {
            return NULL;
        }
    }

    line_buffering = convert_optional_bool(line_buffering_obj,
                                           self->line_buffering);
    if (line_buffering < 0) {
        return NULL;
    }
    write_through = convert_optional_bool(write_through_obj,
                                          self->write_through);
    if (write_through < 0) {
        return NULL;
    }

    if (_PyFile_Flush((TyObject *)self) < 0) {
        return NULL;
    }
    self->b2cratio = 0;

    if (newline_obj != NULL && set_newline(self, newline) < 0) {
        return NULL;
    }

    if (textiowrapper_change_encoding(
            self, encoding, errors, newline_obj != NULL) < 0) {
        return NULL;
    }

    self->line_buffering = line_buffering;
    self->write_through = write_through;
    Py_RETURN_NONE;
}

static int
textiowrapper_clear(TyObject *op)
{
    textio *self = textio_CAST(op);
    self->ok = 0;
    Ty_CLEAR(self->buffer);
    Ty_CLEAR(self->encoding);
    Ty_CLEAR(self->encoder);
    Ty_CLEAR(self->decoder);
    Ty_CLEAR(self->readnl);
    Ty_CLEAR(self->decoded_chars);
    Ty_CLEAR(self->pending_bytes);
    Ty_CLEAR(self->snapshot);
    Ty_CLEAR(self->errors);
    Ty_CLEAR(self->raw);

    Ty_CLEAR(self->dict);
    return 0;
}

static void
textiowrapper_dealloc(TyObject *op)
{
    textio *self = textio_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    self->finalizing = 1;
    if (_PyIOBase_finalize(op) < 0)
        return;
    self->ok = 0;
    _TyObject_GC_UNTRACK(self);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    (void)textiowrapper_clear(op);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
textiowrapper_traverse(TyObject *op, visitproc visit, void *arg)
{
    textio *self = textio_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->buffer);
    Ty_VISIT(self->encoding);
    Ty_VISIT(self->encoder);
    Ty_VISIT(self->decoder);
    Ty_VISIT(self->readnl);
    Ty_VISIT(self->decoded_chars);
    Ty_VISIT(self->pending_bytes);
    Ty_VISIT(self->snapshot);
    Ty_VISIT(self->errors);
    Ty_VISIT(self->raw);

    Ty_VISIT(self->dict);
    return 0;
}

static TyObject *
_io_TextIOWrapper_closed_get_impl(textio *self);

/* This macro takes some shortcuts to make the common case faster. */
#define CHECK_CLOSED(self) \
    do { \
        int r; \
        TyObject *_res; \
        if (Ty_IS_TYPE(self, self->state->PyTextIOWrapper_Type)) { \
            if (self->raw != NULL) \
                r = _PyFileIO_closed(self->raw); \
            else { \
                _res = _io_TextIOWrapper_closed_get_impl(self); \
                if (_res == NULL) \
                    return NULL; \
                r = PyObject_IsTrue(_res); \
                Ty_DECREF(_res); \
                if (r < 0) \
                    return NULL; \
            } \
            if (r > 0) { \
                TyErr_SetString(TyExc_ValueError, \
                                "I/O operation on closed file."); \
                return NULL; \
            } \
        } \
        else if (_PyIOBase_check_closed((TyObject *)self, Ty_True) == NULL) \
            return NULL; \
    } while (0)

#define CHECK_INITIALIZED(self) \
    if (self->ok <= 0) { \
        TyErr_SetString(TyExc_ValueError, \
            "I/O operation on uninitialized object"); \
        return NULL; \
    }

#define CHECK_ATTACHED(self) \
    CHECK_INITIALIZED(self); \
    if (self->detached) { \
        TyErr_SetString(TyExc_ValueError, \
             "underlying buffer has been detached"); \
        return NULL; \
    }

#define CHECK_ATTACHED_INT(self) \
    if (self->ok <= 0) { \
        TyErr_SetString(TyExc_ValueError, \
            "I/O operation on uninitialized object"); \
        return -1; \
    } else if (self->detached) { \
        TyErr_SetString(TyExc_ValueError, \
             "underlying buffer has been detached"); \
        return -1; \
    }


/*[clinic input]
@critical_section
_io.TextIOWrapper.detach
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_detach_impl(textio *self)
/*[clinic end generated code: output=7ba3715cd032d5f2 input=c908a3b4ef203b0f]*/
{
    TyObject *buffer;
    CHECK_ATTACHED(self);
    if (_PyFile_Flush((TyObject *)self) < 0) {
        return NULL;
    }
    buffer = self->buffer;
    self->buffer = NULL;
    self->detached = 1;
    return buffer;
}

/* Flush the internal write buffer. This doesn't explicitly flush the
   underlying buffered object, though. */
static int
_textiowrapper_writeflush(textio *self)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);

    if (self->pending_bytes == NULL)
        return 0;

    TyObject *pending = self->pending_bytes;
    TyObject *b;

    if (TyBytes_Check(pending)) {
        b = Ty_NewRef(pending);
    }
    else if (TyUnicode_Check(pending)) {
        assert(TyUnicode_IS_ASCII(pending));
        assert(TyUnicode_GET_LENGTH(pending) == self->pending_bytes_count);
        b = TyBytes_FromStringAndSize(
                TyUnicode_DATA(pending), TyUnicode_GET_LENGTH(pending));
        if (b == NULL) {
            return -1;
        }
    }
    else {
        assert(TyList_Check(pending));
        b = TyBytes_FromStringAndSize(NULL, self->pending_bytes_count);
        if (b == NULL) {
            return -1;
        }

        char *buf = TyBytes_AsString(b);
        Ty_ssize_t pos = 0;

        for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(pending); i++) {
            TyObject *obj = TyList_GET_ITEM(pending, i);
            char *src;
            Ty_ssize_t len;
            if (TyUnicode_Check(obj)) {
                assert(TyUnicode_IS_ASCII(obj));
                src = TyUnicode_DATA(obj);
                len = TyUnicode_GET_LENGTH(obj);
            }
            else {
                assert(TyBytes_Check(obj));
                if (TyBytes_AsStringAndSize(obj, &src, &len) < 0) {
                    Ty_DECREF(b);
                    return -1;
                }
            }
            memcpy(buf + pos, src, len);
            pos += len;
        }
        assert(pos == self->pending_bytes_count);
    }

    self->pending_bytes_count = 0;
    self->pending_bytes = NULL;
    Ty_DECREF(pending);

    TyObject *ret;
    do {
        ret = PyObject_CallMethodOneArg(self->buffer, &_Ty_ID(write), b);
    } while (ret == NULL && _PyIO_trap_eintr());
    Ty_DECREF(b);
    // NOTE: We cleared buffer but we don't know how many bytes are actually written
    // when an error occurred.
    if (ret == NULL)
        return -1;
    Ty_DECREF(ret);
    return 0;
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.write
    text: unicode
    /
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_write_impl(textio *self, TyObject *text)
/*[clinic end generated code: output=d2deb0d50771fcec input=73ec95c5c4a3489c]*/
{
    TyObject *ret;
    TyObject *b;
    Ty_ssize_t textlen;
    int haslf = 0;
    int needflush = 0, text_needflush = 0;

    CHECK_ATTACHED(self);
    CHECK_CLOSED(self);

    if (self->encoder == NULL) {
        return _unsupported(self->state, "not writable");
    }

    Ty_INCREF(text);

    textlen = TyUnicode_GET_LENGTH(text);

    if ((self->writetranslate && self->writenl != NULL) || self->line_buffering)
        if (TyUnicode_FindChar(text, '\n', 0, TyUnicode_GET_LENGTH(text), 1) != -1)
            haslf = 1;

    if (haslf && self->writetranslate && self->writenl != NULL) {
        TyObject *newtext = _TyObject_CallMethod(text, &_Ty_ID(replace),
                                                 "ss", "\n", self->writenl);
        Ty_DECREF(text);
        if (newtext == NULL)
            return NULL;
        text = newtext;
    }

    if (self->write_through)
        text_needflush = 1;
    if (self->line_buffering &&
        (haslf ||
         TyUnicode_FindChar(text, '\r', 0, TyUnicode_GET_LENGTH(text), 1) != -1))
        needflush = 1;

    /* XXX What if we were just reading? */
    if (self->encodefunc != NULL) {
        if (TyUnicode_IS_ASCII(text) &&
                // See bpo-43260
                TyUnicode_GET_LENGTH(text) <= self->chunk_size &&
                is_asciicompat_encoding(self->encodefunc)) {
            b = Ty_NewRef(text);
        }
        else {
            b = (*self->encodefunc)((TyObject *) self, text);
        }
        self->encoding_start_of_stream = 0;
    }
    else {
        b = PyObject_CallMethodOneArg(self->encoder, &_Ty_ID(encode), text);
    }

    Ty_DECREF(text);
    if (b == NULL)
        return NULL;
    if (b != text && !TyBytes_Check(b)) {
        TyErr_Format(TyExc_TypeError,
                     "encoder should return a bytes object, not '%.200s'",
                     Ty_TYPE(b)->tp_name);
        Ty_DECREF(b);
        return NULL;
    }

    Ty_ssize_t bytes_len;
    if (b == text) {
        bytes_len = TyUnicode_GET_LENGTH(b);
    }
    else {
        bytes_len = TyBytes_GET_SIZE(b);
    }

    // We should avoid concatenating huge data.
    // Flush the buffer before adding b to the buffer if b is not small.
    // https://github.com/python/cpython/issues/87426
    if (bytes_len >= self->chunk_size) {
        // _textiowrapper_writeflush() calls buffer.write().
        // self->pending_bytes can be appended during buffer->write()
        // or other thread.
        // We need to loop until buffer becomes empty.
        // https://github.com/python/cpython/issues/118138
        // https://github.com/python/cpython/issues/119506
        while (self->pending_bytes != NULL) {
            if (_textiowrapper_writeflush(self) < 0) {
                Ty_DECREF(b);
                return NULL;
            }
        }
    }

    if (self->pending_bytes == NULL) {
        assert(self->pending_bytes_count == 0);
        self->pending_bytes = b;
    }
    else if (!TyList_CheckExact(self->pending_bytes)) {
        TyObject *list = TyList_New(2);
        if (list == NULL) {
            Ty_DECREF(b);
            return NULL;
        }
        // Since Python 3.12, allocating GC object won't trigger GC and release
        // GIL. See https://github.com/python/cpython/issues/97922
        assert(!TyList_CheckExact(self->pending_bytes));
        TyList_SET_ITEM(list, 0, self->pending_bytes);
        TyList_SET_ITEM(list, 1, b);
        self->pending_bytes = list;
    }
    else {
        if (TyList_Append(self->pending_bytes, b) < 0) {
            Ty_DECREF(b);
            return NULL;
        }
        Ty_DECREF(b);
    }

    self->pending_bytes_count += bytes_len;
    if (self->pending_bytes_count >= self->chunk_size || needflush ||
        text_needflush) {
        if (_textiowrapper_writeflush(self) < 0)
            return NULL;
    }

    if (needflush) {
        if (_PyFile_Flush(self->buffer) < 0) {
            return NULL;
        }
    }

    if (self->snapshot != NULL) {
        textiowrapper_set_decoded_chars(self, NULL);
        Ty_CLEAR(self->snapshot);
    }

    if (self->decoder) {
        ret = PyObject_CallMethodNoArgs(self->decoder, &_Ty_ID(reset));
        if (ret == NULL)
            return NULL;
        Ty_DECREF(ret);
    }

    return TyLong_FromSsize_t(textlen);
}

/* Steal a reference to chars and store it in the decoded_char buffer;
 */
static void
textiowrapper_set_decoded_chars(textio *self, TyObject *chars)
{
    Ty_XSETREF(self->decoded_chars, chars);
    self->decoded_chars_used = 0;
}

static TyObject *
textiowrapper_get_decoded_chars(textio *self, Ty_ssize_t n)
{
    TyObject *chars;
    Ty_ssize_t avail;

    if (self->decoded_chars == NULL)
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);

    avail = (TyUnicode_GET_LENGTH(self->decoded_chars)
             - self->decoded_chars_used);

    assert(avail >= 0);

    if (n < 0 || n > avail)
        n = avail;

    if (self->decoded_chars_used > 0 || n < avail) {
        chars = TyUnicode_Substring(self->decoded_chars,
                                    self->decoded_chars_used,
                                    self->decoded_chars_used + n);
        if (chars == NULL)
            return NULL;
    }
    else {
        chars = Ty_NewRef(self->decoded_chars);
    }

    self->decoded_chars_used += n;
    return chars;
}

/* Read and decode the next chunk of data from the BufferedReader.
 */
static int
textiowrapper_read_chunk(textio *self, Ty_ssize_t size_hint)
{
    TyObject *dec_buffer = NULL;
    TyObject *dec_flags = NULL;
    TyObject *input_chunk = NULL;
    Ty_buffer input_chunk_buf;
    TyObject *decoded_chars, *chunk_size;
    Ty_ssize_t nbytes, nchars;
    int eof;

    /* The return value is True unless EOF was reached.  The decoded string is
     * placed in self._decoded_chars (replacing its previous value).  The
     * entire input chunk is sent to the decoder, though some of it may remain
     * buffered in the decoder, yet to be converted.
     */

    if (self->decoder == NULL) {
        _unsupported(self->state, "not readable");
        return -1;
    }

    if (self->telling) {
        /* To prepare for tell(), we need to snapshot a point in the file
         * where the decoder's input buffer is empty.
         */
        TyObject *state = PyObject_CallMethodNoArgs(self->decoder,
                                                     &_Ty_ID(getstate));
        if (state == NULL)
            return -1;
        /* Given this, we know there was a valid snapshot point
         * len(dec_buffer) bytes ago with decoder state (b'', dec_flags).
         */
        if (!TyTuple_Check(state)) {
            TyErr_SetString(TyExc_TypeError,
                            "illegal decoder state");
            Ty_DECREF(state);
            return -1;
        }
        if (!TyArg_ParseTuple(state,
                              "OO;illegal decoder state", &dec_buffer, &dec_flags))
        {
            Ty_DECREF(state);
            return -1;
        }

        if (!TyBytes_Check(dec_buffer)) {
            TyErr_Format(TyExc_TypeError,
                         "illegal decoder state: the first item should be a "
                         "bytes object, not '%.200s'",
                         Ty_TYPE(dec_buffer)->tp_name);
            Ty_DECREF(state);
            return -1;
        }
        Ty_INCREF(dec_buffer);
        Ty_INCREF(dec_flags);
        Ty_DECREF(state);
    }

    /* Read a chunk, decode it, and put the result in self._decoded_chars. */
    if (size_hint > 0) {
        size_hint = (Ty_ssize_t)(Ty_MAX(self->b2cratio, 1.0) * size_hint);
    }
    chunk_size = TyLong_FromSsize_t(Ty_MAX(self->chunk_size, size_hint));
    if (chunk_size == NULL)
        goto fail;

    input_chunk = PyObject_CallMethodOneArg(self->buffer,
        (self->has_read1 ? &_Ty_ID(read1): &_Ty_ID(read)),
        chunk_size);
    Ty_DECREF(chunk_size);
    if (input_chunk == NULL)
        goto fail;

    if (PyObject_GetBuffer(input_chunk, &input_chunk_buf, 0) != 0) {
        TyErr_Format(TyExc_TypeError,
                     "underlying %s() should have returned a bytes-like object, "
                     "not '%.200s'", (self->has_read1 ? "read1": "read"),
                     Ty_TYPE(input_chunk)->tp_name);
        goto fail;
    }

    nbytes = input_chunk_buf.len;
    eof = (nbytes == 0);

    decoded_chars = _textiowrapper_decode(self->state, self->decoder,
                                          input_chunk, eof);
    PyBuffer_Release(&input_chunk_buf);
    if (decoded_chars == NULL)
        goto fail;

    textiowrapper_set_decoded_chars(self, decoded_chars);
    nchars = TyUnicode_GET_LENGTH(decoded_chars);
    if (nchars > 0)
        self->b2cratio = (double) nbytes / nchars;
    else
        self->b2cratio = 0.0;
    if (nchars > 0)
        eof = 0;

    if (self->telling) {
        /* At the snapshot point, len(dec_buffer) bytes before the read, the
         * next input to be decoded is dec_buffer + input_chunk.
         */
        TyObject *next_input = dec_buffer;
        TyBytes_Concat(&next_input, input_chunk);
        dec_buffer = NULL; /* Reference lost to TyBytes_Concat */
        if (next_input == NULL) {
            goto fail;
        }
        TyObject *snapshot = Ty_BuildValue("NN", dec_flags, next_input);
        if (snapshot == NULL) {
            dec_flags = NULL;
            goto fail;
        }
        Ty_XSETREF(self->snapshot, snapshot);
    }
    Ty_DECREF(input_chunk);

    return (eof == 0);

  fail:
    Ty_XDECREF(dec_buffer);
    Ty_XDECREF(dec_flags);
    Ty_XDECREF(input_chunk);
    return -1;
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.read
    size as n: Ty_ssize_t(accept={int, NoneType}) = -1
    /
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_read_impl(textio *self, Ty_ssize_t n)
/*[clinic end generated code: output=7e651ce6cc6a25a6 input=67d14c5661121377]*/
{
    TyObject *result = NULL, *chunks = NULL;

    CHECK_ATTACHED(self);
    CHECK_CLOSED(self);

    if (self->decoder == NULL) {
        return _unsupported(self->state, "not readable");
    }

    if (_textiowrapper_writeflush(self) < 0)
        return NULL;

    if (n < 0) {
        /* Read everything */
        TyObject *bytes = PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(read));
        TyObject *decoded;
        if (bytes == NULL)
            goto fail;

        if (bytes == Ty_None){
            Ty_DECREF(bytes);
            TyErr_SetString(TyExc_BlockingIOError, "Read returned None.");
            return NULL;
        }

        _PyIO_State *state = self->state;
        if (Ty_IS_TYPE(self->decoder, state->PyIncrementalNewlineDecoder_Type))
            decoded = _PyIncrementalNewlineDecoder_decode(self->decoder,
                                                          bytes, 1);
        else
            decoded = PyObject_CallMethodObjArgs(
                self->decoder, &_Ty_ID(decode), bytes, Ty_True, NULL);
        Ty_DECREF(bytes);
        if (check_decoded(decoded) < 0)
            goto fail;

        result = textiowrapper_get_decoded_chars(self, -1);

        if (result == NULL) {
            Ty_DECREF(decoded);
            return NULL;
        }

        TyUnicode_AppendAndDel(&result, decoded);
        if (result == NULL)
            goto fail;

        if (self->snapshot != NULL) {
            textiowrapper_set_decoded_chars(self, NULL);
            Ty_CLEAR(self->snapshot);
        }
        return result;
    }
    else {
        int res = 1;
        Ty_ssize_t remaining = n;

        result = textiowrapper_get_decoded_chars(self, n);
        if (result == NULL)
            goto fail;
        remaining -= TyUnicode_GET_LENGTH(result);

        /* Keep reading chunks until we have n characters to return */
        while (remaining > 0) {
            res = textiowrapper_read_chunk(self, remaining);
            if (res < 0) {
                /* NOTE: TyErr_SetFromErrno() calls TyErr_CheckSignals()
                   when EINTR occurs so we needn't do it ourselves. */
                if (_PyIO_trap_eintr()) {
                    continue;
                }
                goto fail;
            }
            if (res == 0)  /* EOF */
                break;
            if (chunks == NULL) {
                chunks = TyList_New(0);
                if (chunks == NULL)
                    goto fail;
            }
            if (TyUnicode_GET_LENGTH(result) > 0 &&
                TyList_Append(chunks, result) < 0)
                goto fail;
            Ty_DECREF(result);
            result = textiowrapper_get_decoded_chars(self, remaining);
            if (result == NULL)
                goto fail;
            remaining -= TyUnicode_GET_LENGTH(result);
        }
        if (chunks != NULL) {
            if (result != NULL && TyList_Append(chunks, result) < 0)
                goto fail;
            _Ty_DECLARE_STR(empty, "");
            Ty_XSETREF(result, TyUnicode_Join(&_Ty_STR(empty), chunks));
            if (result == NULL)
                goto fail;
            Ty_CLEAR(chunks);
        }
        return result;
    }
  fail:
    Ty_XDECREF(result);
    Ty_XDECREF(chunks);
    return NULL;
}


/* NOTE: `end` must point to the real end of the Ty_UCS4 storage,
   that is to the NUL character. Otherwise the function will produce
   incorrect results. */
static const char *
find_control_char(int kind, const char *s, const char *end, Ty_UCS4 ch)
{
    if (kind == TyUnicode_1BYTE_KIND) {
        assert(ch < 256);
        return (char *) memchr((const void *) s, (char) ch, end - s);
    }
    for (;;) {
        while (TyUnicode_READ(kind, s, 0) > ch)
            s += kind;
        if (TyUnicode_READ(kind, s, 0) == ch)
            return s;
        if (s == end)
            return NULL;
        s += kind;
    }
}

Ty_ssize_t
_PyIO_find_line_ending(
    int translated, int universal, TyObject *readnl,
    int kind, const char *start, const char *end, Ty_ssize_t *consumed)
{
    Ty_ssize_t len = (end - start)/kind;

    if (translated) {
        /* Newlines are already translated, only search for \n */
        const char *pos = find_control_char(kind, start, end, '\n');
        if (pos != NULL)
            return (pos - start)/kind + 1;
        else {
            *consumed = len;
            return -1;
        }
    }
    else if (universal) {
        /* Universal newline search. Find any of \r, \r\n, \n
         * The decoder ensures that \r\n are not split in two pieces
         */
        const char *s = start;
        for (;;) {
            Ty_UCS4 ch;
            /* Fast path for non-control chars. The loop always ends
               since the Unicode string is NUL-terminated. */
            while (TyUnicode_READ(kind, s, 0) > '\r')
                s += kind;
            if (s >= end) {
                *consumed = len;
                return -1;
            }
            ch = TyUnicode_READ(kind, s, 0);
            s += kind;
            if (ch == '\n')
                return (s - start)/kind;
            if (ch == '\r') {
                if (TyUnicode_READ(kind, s, 0) == '\n')
                    return (s - start)/kind + 1;
                else
                    return (s - start)/kind;
            }
        }
    }
    else {
        /* Non-universal mode. */
        Ty_ssize_t readnl_len = TyUnicode_GET_LENGTH(readnl);
        const Ty_UCS1 *nl = TyUnicode_1BYTE_DATA(readnl);
        /* Assume that readnl is an ASCII character. */
        assert(TyUnicode_KIND(readnl) == TyUnicode_1BYTE_KIND);
        if (readnl_len == 1) {
            const char *pos = find_control_char(kind, start, end, nl[0]);
            if (pos != NULL)
                return (pos - start)/kind + 1;
            *consumed = len;
            return -1;
        }
        else {
            const char *s = start;
            const char *e = end - (readnl_len - 1)*kind;
            const char *pos;
            if (e < s)
                e = s;
            while (s < e) {
                Ty_ssize_t i;
                const char *pos = find_control_char(kind, s, end, nl[0]);
                if (pos == NULL || pos >= e)
                    break;
                for (i = 1; i < readnl_len; i++) {
                    if (TyUnicode_READ(kind, pos, i) != nl[i])
                        break;
                }
                if (i == readnl_len)
                    return (pos - start)/kind + readnl_len;
                s = pos + kind;
            }
            pos = find_control_char(kind, e, end, nl[0]);
            if (pos == NULL)
                *consumed = len;
            else
                *consumed = (pos - start)/kind;
            return -1;
        }
    }
}

static TyObject *
_textiowrapper_readline(textio *self, Ty_ssize_t limit)
{
    TyObject *line = NULL, *chunks = NULL, *remaining = NULL;
    Ty_ssize_t start, endpos, chunked, offset_to_buffer;
    int res;

    CHECK_CLOSED(self);

    if (_textiowrapper_writeflush(self) < 0)
        return NULL;

    chunked = 0;

    while (1) {
        const char *ptr;
        Ty_ssize_t line_len;
        int kind;
        Ty_ssize_t consumed = 0;

        /* First, get some data if necessary */
        res = 1;
        while (!self->decoded_chars ||
               !TyUnicode_GET_LENGTH(self->decoded_chars)) {
            res = textiowrapper_read_chunk(self, 0);
            if (res < 0) {
                /* NOTE: TyErr_SetFromErrno() calls TyErr_CheckSignals()
                   when EINTR occurs so we needn't do it ourselves. */
                if (_PyIO_trap_eintr()) {
                    continue;
                }
                goto error;
            }
            if (res == 0)
                break;
        }
        if (res == 0) {
            /* end of file */
            textiowrapper_set_decoded_chars(self, NULL);
            Ty_CLEAR(self->snapshot);
            start = endpos = offset_to_buffer = 0;
            break;
        }

        if (remaining == NULL) {
            line = Ty_NewRef(self->decoded_chars);
            start = self->decoded_chars_used;
            offset_to_buffer = 0;
        }
        else {
            assert(self->decoded_chars_used == 0);
            line = TyUnicode_Concat(remaining, self->decoded_chars);
            start = 0;
            offset_to_buffer = TyUnicode_GET_LENGTH(remaining);
            Ty_CLEAR(remaining);
            if (line == NULL)
                goto error;
        }

        ptr = TyUnicode_DATA(line);
        line_len = TyUnicode_GET_LENGTH(line);
        kind = TyUnicode_KIND(line);

        endpos = _PyIO_find_line_ending(
            self->readtranslate, self->readuniversal, self->readnl,
            kind,
            ptr + kind * start,
            ptr + kind * line_len,
            &consumed);
        if (endpos >= 0) {
            endpos += start;
            if (limit >= 0 && (endpos - start) + chunked >= limit)
                endpos = start + limit - chunked;
            break;
        }

        /* We can put aside up to `endpos` */
        endpos = consumed + start;
        if (limit >= 0 && (endpos - start) + chunked >= limit) {
            /* Didn't find line ending, but reached length limit */
            endpos = start + limit - chunked;
            break;
        }

        if (endpos > start) {
            /* No line ending seen yet - put aside current data */
            TyObject *s;
            if (chunks == NULL) {
                chunks = TyList_New(0);
                if (chunks == NULL)
                    goto error;
            }
            s = TyUnicode_Substring(line, start, endpos);
            if (s == NULL)
                goto error;
            if (TyList_Append(chunks, s) < 0) {
                Ty_DECREF(s);
                goto error;
            }
            chunked += TyUnicode_GET_LENGTH(s);
            Ty_DECREF(s);
        }
        /* There may be some remaining bytes we'll have to prepend to the
           next chunk of data */
        if (endpos < line_len) {
            remaining = TyUnicode_Substring(line, endpos, line_len);
            if (remaining == NULL)
                goto error;
        }
        Ty_CLEAR(line);
        /* We have consumed the buffer */
        textiowrapper_set_decoded_chars(self, NULL);
    }

    if (line != NULL) {
        /* Our line ends in the current buffer */
        self->decoded_chars_used = endpos - offset_to_buffer;
        if (start > 0 || endpos < TyUnicode_GET_LENGTH(line)) {
            TyObject *s = TyUnicode_Substring(line, start, endpos);
            Ty_CLEAR(line);
            if (s == NULL)
                goto error;
            line = s;
        }
    }
    if (remaining != NULL) {
        if (chunks == NULL) {
            chunks = TyList_New(0);
            if (chunks == NULL)
                goto error;
        }
        if (TyList_Append(chunks, remaining) < 0)
            goto error;
        Ty_CLEAR(remaining);
    }
    if (chunks != NULL) {
        if (line != NULL) {
            if (TyList_Append(chunks, line) < 0)
                goto error;
            Ty_DECREF(line);
        }
        line = TyUnicode_Join(&_Ty_STR(empty), chunks);
        if (line == NULL)
            goto error;
        Ty_CLEAR(chunks);
    }
    if (line == NULL) {
        line = &_Ty_STR(empty);
    }

    return line;

  error:
    Ty_XDECREF(chunks);
    Ty_XDECREF(remaining);
    Ty_XDECREF(line);
    return NULL;
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.readline
    size: Ty_ssize_t = -1
    /
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_readline_impl(textio *self, Ty_ssize_t size)
/*[clinic end generated code: output=344afa98804e8b25 input=b65bab871dc3ddba]*/
{
    CHECK_ATTACHED(self);
    return _textiowrapper_readline(self, size);
}

/* Seek and Tell */

typedef struct {
    Ty_off_t start_pos;
    int dec_flags;
    int bytes_to_feed;
    int chars_to_skip;
    char need_eof;
} cookie_type;

/*
   To speed up cookie packing/unpacking, we store the fields in a temporary
   string and call _TyLong_FromByteArray() or _TyLong_AsByteArray (resp.).
   The following macros define at which offsets in the intermediary byte
   string the various CookieStruct fields will be stored.
 */

#define COOKIE_BUF_LEN      (sizeof(Ty_off_t) + 3 * sizeof(int) + sizeof(char))

#if PY_BIG_ENDIAN
/* We want the least significant byte of start_pos to also be the least
   significant byte of the cookie, which means that in big-endian mode we
   must copy the fields in reverse order. */

# define OFF_START_POS      (sizeof(char) + 3 * sizeof(int))
# define OFF_DEC_FLAGS      (sizeof(char) + 2 * sizeof(int))
# define OFF_BYTES_TO_FEED  (sizeof(char) + sizeof(int))
# define OFF_CHARS_TO_SKIP  (sizeof(char))
# define OFF_NEED_EOF       0

#else
/* Little-endian mode: the least significant byte of start_pos will
   naturally end up the least significant byte of the cookie. */

# define OFF_START_POS      0
# define OFF_DEC_FLAGS      (sizeof(Ty_off_t))
# define OFF_BYTES_TO_FEED  (sizeof(Ty_off_t) + sizeof(int))
# define OFF_CHARS_TO_SKIP  (sizeof(Ty_off_t) + 2 * sizeof(int))
# define OFF_NEED_EOF       (sizeof(Ty_off_t) + 3 * sizeof(int))

#endif

static int
textiowrapper_parse_cookie(cookie_type *cookie, TyObject *cookieObj)
{
    unsigned char buffer[COOKIE_BUF_LEN];
    PyLongObject *cookieLong = (PyLongObject *)PyNumber_Long(cookieObj);
    if (cookieLong == NULL)
        return -1;

    if (_TyLong_AsByteArray(cookieLong, buffer, sizeof(buffer),
                            PY_LITTLE_ENDIAN, 0, 1) < 0) {
        Ty_DECREF(cookieLong);
        return -1;
    }
    Ty_DECREF(cookieLong);

    memcpy(&cookie->start_pos, buffer + OFF_START_POS, sizeof(cookie->start_pos));
    memcpy(&cookie->dec_flags, buffer + OFF_DEC_FLAGS, sizeof(cookie->dec_flags));
    memcpy(&cookie->bytes_to_feed, buffer + OFF_BYTES_TO_FEED, sizeof(cookie->bytes_to_feed));
    memcpy(&cookie->chars_to_skip, buffer + OFF_CHARS_TO_SKIP, sizeof(cookie->chars_to_skip));
    memcpy(&cookie->need_eof, buffer + OFF_NEED_EOF, sizeof(cookie->need_eof));

    return 0;
}

static TyObject *
textiowrapper_build_cookie(cookie_type *cookie)
{
    unsigned char buffer[COOKIE_BUF_LEN];

    memcpy(buffer + OFF_START_POS, &cookie->start_pos, sizeof(cookie->start_pos));
    memcpy(buffer + OFF_DEC_FLAGS, &cookie->dec_flags, sizeof(cookie->dec_flags));
    memcpy(buffer + OFF_BYTES_TO_FEED, &cookie->bytes_to_feed, sizeof(cookie->bytes_to_feed));
    memcpy(buffer + OFF_CHARS_TO_SKIP, &cookie->chars_to_skip, sizeof(cookie->chars_to_skip));
    memcpy(buffer + OFF_NEED_EOF, &cookie->need_eof, sizeof(cookie->need_eof));

    return _TyLong_FromByteArray(buffer, sizeof(buffer),
                                 PY_LITTLE_ENDIAN, 0);
}

static int
_textiowrapper_decoder_setstate(textio *self, cookie_type *cookie)
{
    TyObject *res;
    /* When seeking to the start of the stream, we call decoder.reset()
       rather than decoder.getstate().
       This is for a few decoders such as utf-16 for which the state value
       at start is not (b"", 0) but e.g. (b"", 2) (meaning, in the case of
       utf-16, that we are expecting a BOM).
    */
    if (cookie->start_pos == 0 && cookie->dec_flags == 0) {
        res = PyObject_CallMethodNoArgs(self->decoder, &_Ty_ID(reset));
    }
    else {
        res = _TyObject_CallMethod(self->decoder, &_Ty_ID(setstate),
                                   "((yi))", "", cookie->dec_flags);
    }
    if (res == NULL) {
        return -1;
    }
    Ty_DECREF(res);
    return 0;
}

static int
_textiowrapper_encoder_reset(textio *self, int start_of_stream)
{
    TyObject *res;
    if (start_of_stream) {
        res = PyObject_CallMethodNoArgs(self->encoder, &_Ty_ID(reset));
        self->encoding_start_of_stream = 1;
    }
    else {
        res = PyObject_CallMethodOneArg(self->encoder, &_Ty_ID(setstate),
                                        _TyLong_GetZero());
        self->encoding_start_of_stream = 0;
    }
    if (res == NULL)
        return -1;
    Ty_DECREF(res);
    return 0;
}

static int
_textiowrapper_encoder_setstate(textio *self, cookie_type *cookie)
{
    /* Same as _textiowrapper_decoder_setstate() above. */
    return _textiowrapper_encoder_reset(
        self, cookie->start_pos == 0 && cookie->dec_flags == 0);
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.seek
    cookie as cookieObj: object
      Zero or an opaque number returned by tell().
    whence: int(c_default='0') = os.SEEK_SET
      The relative position to seek from.
    /

Set the stream position, and return the new stream position.

Four operations are supported, given by the following argument
combinations:

- seek(0, SEEK_SET): Rewind to the start of the stream.
- seek(cookie, SEEK_SET): Restore a previous position;
  'cookie' must be a number returned by tell().
- seek(0, SEEK_END): Fast-forward to the end of the stream.
- seek(0, SEEK_CUR): Leave the current stream position unchanged.

Any other argument combinations are invalid,
and may raise exceptions.
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_seek_impl(textio *self, TyObject *cookieObj, int whence)
/*[clinic end generated code: output=0a15679764e2d04d input=4bea78698be23d7e]*/
{
    TyObject *posobj;
    cookie_type cookie;
    TyObject *res;
    int cmp;
    TyObject *snapshot;

    CHECK_ATTACHED(self);
    CHECK_CLOSED(self);

    Ty_INCREF(cookieObj);

    if (!self->seekable) {
        _unsupported(self->state, "underlying stream is not seekable");
        goto fail;
    }

    TyObject *zero = _TyLong_GetZero();  // borrowed reference

    switch (whence) {
    case SEEK_CUR:
        /* seek relative to current position */
        cmp = PyObject_RichCompareBool(cookieObj, zero, Py_EQ);
        if (cmp < 0)
            goto fail;

        if (cmp == 0) {
            _unsupported(self->state, "can't do nonzero cur-relative seeks");
            goto fail;
        }

        /* Seeking to the current position should attempt to
         * sync the underlying buffer with the current position.
         */
        Ty_DECREF(cookieObj);
        cookieObj = PyObject_CallMethodNoArgs((TyObject *)self, &_Ty_ID(tell));
        if (cookieObj == NULL)
            goto fail;
        break;

    case SEEK_END:
        /* seek relative to end of file */
        cmp = PyObject_RichCompareBool(cookieObj, zero, Py_EQ);
        if (cmp < 0)
            goto fail;

        if (cmp == 0) {
            _unsupported(self->state, "can't do nonzero end-relative seeks");
            goto fail;
        }

        if (_PyFile_Flush((TyObject *)self) < 0) {
            goto fail;
        }

        textiowrapper_set_decoded_chars(self, NULL);
        Ty_CLEAR(self->snapshot);
        if (self->decoder) {
            res = PyObject_CallMethodNoArgs(self->decoder, &_Ty_ID(reset));
            if (res == NULL)
                goto fail;
            Ty_DECREF(res);
        }

        res = _TyObject_CallMethod(self->buffer, &_Ty_ID(seek), "ii", 0, 2);
        Ty_CLEAR(cookieObj);
        if (res == NULL)
            goto fail;
        if (self->encoder) {
            /* If seek() == 0, we are at the start of stream, otherwise not */
            cmp = PyObject_RichCompareBool(res, zero, Py_EQ);
            if (cmp < 0 || _textiowrapper_encoder_reset(self, cmp)) {
                Ty_DECREF(res);
                goto fail;
            }
        }
        return res;

    case SEEK_SET:
        break;

    default:
        TyErr_Format(TyExc_ValueError,
                     "invalid whence (%d, should be %d, %d or %d)", whence,
                     SEEK_SET, SEEK_CUR, SEEK_END);
        goto fail;
    }

    cmp = PyObject_RichCompareBool(cookieObj, zero, Py_LT);
    if (cmp < 0)
        goto fail;

    if (cmp == 1) {
        TyErr_Format(TyExc_ValueError,
                     "negative seek position %R", cookieObj);
        goto fail;
    }

    if (_PyFile_Flush((TyObject *)self) < 0) {
        goto fail;
    }

    /* The strategy of seek() is to go back to the safe start point
     * and replay the effect of read(chars_to_skip) from there.
     */
    if (textiowrapper_parse_cookie(&cookie, cookieObj) < 0)
        goto fail;

    /* Seek back to the safe start point. */
    posobj = TyLong_FromOff_t(cookie.start_pos);
    if (posobj == NULL)
        goto fail;
    res = PyObject_CallMethodOneArg(self->buffer, &_Ty_ID(seek), posobj);
    Ty_DECREF(posobj);
    if (res == NULL)
        goto fail;
    Ty_DECREF(res);

    textiowrapper_set_decoded_chars(self, NULL);
    Ty_CLEAR(self->snapshot);

    /* Restore the decoder to its state from the safe start point. */
    if (self->decoder) {
        if (_textiowrapper_decoder_setstate(self, &cookie) < 0)
            goto fail;
    }

    if (cookie.chars_to_skip) {
        /* Just like _read_chunk, feed the decoder and save a snapshot. */
        TyObject *input_chunk = _TyObject_CallMethod(self->buffer, &_Ty_ID(read),
                                                     "i", cookie.bytes_to_feed);
        TyObject *decoded;

        if (input_chunk == NULL)
            goto fail;

        if (!TyBytes_Check(input_chunk)) {
            TyErr_Format(TyExc_TypeError,
                         "underlying read() should have returned a bytes "
                         "object, not '%.200s'",
                         Ty_TYPE(input_chunk)->tp_name);
            Ty_DECREF(input_chunk);
            goto fail;
        }

        snapshot = Ty_BuildValue("iN", cookie.dec_flags, input_chunk);
        if (snapshot == NULL) {
            goto fail;
        }
        Ty_XSETREF(self->snapshot, snapshot);

        decoded = PyObject_CallMethodObjArgs(self->decoder, &_Ty_ID(decode),
            input_chunk, cookie.need_eof ? Ty_True : Ty_False, NULL);

        if (check_decoded(decoded) < 0)
            goto fail;

        textiowrapper_set_decoded_chars(self, decoded);

        /* Skip chars_to_skip of the decoded characters. */
        if (TyUnicode_GetLength(self->decoded_chars) < cookie.chars_to_skip) {
            TyErr_SetString(TyExc_OSError, "can't restore logical file position");
            goto fail;
        }
        self->decoded_chars_used = cookie.chars_to_skip;
    }
    else {
        snapshot = Ty_BuildValue("iy", cookie.dec_flags, "");
        if (snapshot == NULL)
            goto fail;
        Ty_XSETREF(self->snapshot, snapshot);
    }

    /* Finally, reset the encoder (merely useful for proper BOM handling) */
    if (self->encoder) {
        if (_textiowrapper_encoder_setstate(self, &cookie) < 0)
            goto fail;
    }
    return cookieObj;
  fail:
    Ty_XDECREF(cookieObj);
    return NULL;

}

/*[clinic input]
@critical_section
_io.TextIOWrapper.tell

Return the stream position as an opaque number.

The return value of tell() can be given as input to seek(), to restore a
previous stream position.
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_tell_impl(textio *self)
/*[clinic end generated code: output=4f168c08bf34ad5f input=415d6b4e4f8e6e8c]*/
{
    TyObject *res;
    TyObject *posobj = NULL;
    cookie_type cookie = {0,0,0,0,0};
    TyObject *next_input;
    Ty_ssize_t chars_to_skip, chars_decoded;
    Ty_ssize_t skip_bytes, skip_back;
    TyObject *saved_state = NULL;
    const char *input, *input_end;
    Ty_ssize_t dec_buffer_len;
    int dec_flags;

    CHECK_ATTACHED(self);
    CHECK_CLOSED(self);

    if (!self->seekable) {
        _unsupported(self->state, "underlying stream is not seekable");
        goto fail;
    }
    if (!self->telling) {
        TyErr_SetString(TyExc_OSError,
                        "telling position disabled by next() call");
        goto fail;
    }

    if (_textiowrapper_writeflush(self) < 0)
        return NULL;
    if (_PyFile_Flush((TyObject *)self) < 0) {
        goto fail;
    }

    posobj = PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(tell));
    if (posobj == NULL)
        goto fail;

    if (self->decoder == NULL || self->snapshot == NULL) {
        assert (self->decoded_chars == NULL || TyUnicode_GetLength(self->decoded_chars) == 0);
        return posobj;
    }

#if defined(HAVE_LARGEFILE_SUPPORT)
    cookie.start_pos = TyLong_AsLongLong(posobj);
#else
    cookie.start_pos = TyLong_AsLong(posobj);
#endif
    Ty_DECREF(posobj);
    if (TyErr_Occurred())
        goto fail;

    /* Skip backward to the snapshot point (see _read_chunk). */
    assert(TyTuple_Check(self->snapshot));
    if (!TyArg_ParseTuple(self->snapshot, "iO", &cookie.dec_flags, &next_input))
        goto fail;

    assert (TyBytes_Check(next_input));

    cookie.start_pos -= TyBytes_GET_SIZE(next_input);

    /* How many decoded characters have been used up since the snapshot? */
    if (self->decoded_chars_used == 0)  {
        /* We haven't moved from the snapshot point. */
        return textiowrapper_build_cookie(&cookie);
    }

    chars_to_skip = self->decoded_chars_used;

    /* Decoder state will be restored at the end */
    saved_state = PyObject_CallMethodNoArgs(self->decoder,
                                             &_Ty_ID(getstate));
    if (saved_state == NULL)
        goto fail;

#define DECODER_GETSTATE() do { \
        TyObject *dec_buffer; \
        TyObject *_state = PyObject_CallMethodNoArgs(self->decoder, \
            &_Ty_ID(getstate)); \
        if (_state == NULL) \
            goto fail; \
        if (!TyTuple_Check(_state)) { \
            TyErr_SetString(TyExc_TypeError, \
                            "illegal decoder state"); \
            Ty_DECREF(_state); \
            goto fail; \
        } \
        if (!TyArg_ParseTuple(_state, "Oi;illegal decoder state", \
                              &dec_buffer, &dec_flags)) \
        { \
            Ty_DECREF(_state); \
            goto fail; \
        } \
        if (!TyBytes_Check(dec_buffer)) { \
            TyErr_Format(TyExc_TypeError, \
                         "illegal decoder state: the first item should be a " \
                         "bytes object, not '%.200s'", \
                         Ty_TYPE(dec_buffer)->tp_name); \
            Ty_DECREF(_state); \
            goto fail; \
        } \
        dec_buffer_len = TyBytes_GET_SIZE(dec_buffer); \
        Ty_DECREF(_state); \
    } while (0)

#define DECODER_DECODE(start, len, res) do { \
        TyObject *_decoded = _TyObject_CallMethod( \
            self->decoder, &_Ty_ID(decode), "y#", start, len); \
        if (check_decoded(_decoded) < 0) \
            goto fail; \
        res = TyUnicode_GET_LENGTH(_decoded); \
        Ty_DECREF(_decoded); \
    } while (0)

    /* Fast search for an acceptable start point, close to our
       current pos */
    skip_bytes = (Ty_ssize_t) (self->b2cratio * chars_to_skip);
    skip_back = 1;
    assert(skip_back <= TyBytes_GET_SIZE(next_input));
    input = TyBytes_AS_STRING(next_input);
    while (skip_bytes > 0) {
        /* Decode up to temptative start point */
        if (_textiowrapper_decoder_setstate(self, &cookie) < 0)
            goto fail;
        DECODER_DECODE(input, skip_bytes, chars_decoded);
        if (chars_decoded <= chars_to_skip) {
            DECODER_GETSTATE();
            if (dec_buffer_len == 0) {
                /* Before pos and no bytes buffered in decoder => OK */
                cookie.dec_flags = dec_flags;
                chars_to_skip -= chars_decoded;
                break;
            }
            /* Skip back by buffered amount and reset heuristic */
            skip_bytes -= dec_buffer_len;
            skip_back = 1;
        }
        else {
            /* We're too far ahead, skip back a bit */
            skip_bytes -= skip_back;
            skip_back *= 2;
        }
    }
    if (skip_bytes <= 0) {
        skip_bytes = 0;
        if (_textiowrapper_decoder_setstate(self, &cookie) < 0)
            goto fail;
    }

    /* Note our initial start point. */
    cookie.start_pos += skip_bytes;
    cookie.chars_to_skip = Ty_SAFE_DOWNCAST(chars_to_skip, Ty_ssize_t, int);
    if (chars_to_skip == 0)
        goto finally;

    /* We should be close to the desired position.  Now feed the decoder one
     * byte at a time until we reach the `chars_to_skip` target.
     * As we go, note the nearest "safe start point" before the current
     * location (a point where the decoder has nothing buffered, so seek()
     * can safely start from there and advance to this location).
     */
    chars_decoded = 0;
    input = TyBytes_AS_STRING(next_input);
    input_end = input + TyBytes_GET_SIZE(next_input);
    input += skip_bytes;
    while (input < input_end) {
        Ty_ssize_t n;

        DECODER_DECODE(input, (Ty_ssize_t)1, n);
        /* We got n chars for 1 byte */
        chars_decoded += n;
        cookie.bytes_to_feed += 1;
        DECODER_GETSTATE();

        if (dec_buffer_len == 0 && chars_decoded <= chars_to_skip) {
            /* Decoder buffer is empty, so this is a safe start point. */
            cookie.start_pos += cookie.bytes_to_feed;
            chars_to_skip -= chars_decoded;
            cookie.dec_flags = dec_flags;
            cookie.bytes_to_feed = 0;
            chars_decoded = 0;
        }
        if (chars_decoded >= chars_to_skip)
            break;
        input++;
    }
    if (input == input_end) {
        /* We didn't get enough decoded data; signal EOF to get more. */
        TyObject *decoded = _TyObject_CallMethod(
            self->decoder, &_Ty_ID(decode), "yO", "", /* final = */ Ty_True);
        if (check_decoded(decoded) < 0)
            goto fail;
        chars_decoded += TyUnicode_GET_LENGTH(decoded);
        Ty_DECREF(decoded);
        cookie.need_eof = 1;

        if (chars_decoded < chars_to_skip) {
            TyErr_SetString(TyExc_OSError,
                            "can't reconstruct logical file position");
            goto fail;
        }
    }

finally:
    res = PyObject_CallMethodOneArg(
            self->decoder, &_Ty_ID(setstate), saved_state);
    Ty_DECREF(saved_state);
    if (res == NULL)
        return NULL;
    Ty_DECREF(res);

    /* The returned cookie corresponds to the last safe start point. */
    cookie.chars_to_skip = Ty_SAFE_DOWNCAST(chars_to_skip, Ty_ssize_t, int);
    return textiowrapper_build_cookie(&cookie);

fail:
    if (saved_state) {
        TyObject *exc = TyErr_GetRaisedException();
        res = PyObject_CallMethodOneArg(
                self->decoder, &_Ty_ID(setstate), saved_state);
        _TyErr_ChainExceptions1(exc);
        Ty_DECREF(saved_state);
        Ty_XDECREF(res);
    }
    return NULL;
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.truncate
    pos: object = None
    /
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_truncate_impl(textio *self, TyObject *pos)
/*[clinic end generated code: output=90ec2afb9bb7745f input=8bddb320834c93ee]*/
{
    CHECK_ATTACHED(self)

    if (_PyFile_Flush((TyObject *)self) < 0) {
        return NULL;
    }

    return PyObject_CallMethodOneArg(self->buffer, &_Ty_ID(truncate), pos);
}

static TyObject *
textiowrapper_repr(TyObject *op)
{
    TyObject *nameobj, *modeobj, *res, *s;
    int status;
    textio *self = textio_CAST(op);
    const char *type_name = Ty_TYPE(self)->tp_name;

    CHECK_INITIALIZED(self);

    res = TyUnicode_FromFormat("<%.100s", type_name);
    if (res == NULL)
        return NULL;

    status = Ty_ReprEnter(op);
    if (status != 0) {
        if (status > 0) {
            TyErr_Format(TyExc_RuntimeError,
                         "reentrant call inside %.100s.__repr__",
                         type_name);
        }
        goto error;
    }
    if (PyObject_GetOptionalAttr(op, &_Ty_ID(name), &nameobj) < 0) {
        if (!TyErr_ExceptionMatches(TyExc_ValueError)) {
            goto error;
        }
        /* Ignore ValueError raised if the underlying stream was detached */
        TyErr_Clear();
    }
    if (nameobj != NULL) {
        s = TyUnicode_FromFormat(" name=%R", nameobj);
        Ty_DECREF(nameobj);
        if (s == NULL)
            goto error;
        TyUnicode_AppendAndDel(&res, s);
        if (res == NULL)
            goto error;
    }
    if (PyObject_GetOptionalAttr(op, &_Ty_ID(mode), &modeobj) < 0) {
        goto error;
    }
    if (modeobj != NULL) {
        s = TyUnicode_FromFormat(" mode=%R", modeobj);
        Ty_DECREF(modeobj);
        if (s == NULL)
            goto error;
        TyUnicode_AppendAndDel(&res, s);
        if (res == NULL)
            goto error;
    }
    s = TyUnicode_FromFormat("%U encoding=%R>",
                             res, self->encoding);
    Ty_DECREF(res);
    if (status == 0) {
        Ty_ReprLeave(op);
    }
    return s;

  error:
    Ty_XDECREF(res);
    if (status == 0) {
        Ty_ReprLeave(op);
    }
    return NULL;
}


/* Inquiries */

/*[clinic input]
@critical_section
_io.TextIOWrapper.fileno
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_fileno_impl(textio *self)
/*[clinic end generated code: output=21490a4c3da13e6c input=515e1196aceb97ab]*/
{
    CHECK_ATTACHED(self);
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(fileno));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.seekable
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_seekable_impl(textio *self)
/*[clinic end generated code: output=ab223dbbcffc0f00 input=71c4c092736c549b]*/
{
    CHECK_ATTACHED(self);
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(seekable));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.readable
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_readable_impl(textio *self)
/*[clinic end generated code: output=72ff7ba289a8a91b input=80438d1f01b0a89b]*/
{
    CHECK_ATTACHED(self);
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(readable));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.writable
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_writable_impl(textio *self)
/*[clinic end generated code: output=a728c71790d03200 input=9d6c22befb0c340a]*/
{
    CHECK_ATTACHED(self);
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(writable));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.isatty
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_isatty_impl(textio *self)
/*[clinic end generated code: output=12be1a35bace882e input=7f83ff04d4d1733d]*/
{
    CHECK_ATTACHED(self);
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(isatty));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.flush
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_flush_impl(textio *self)
/*[clinic end generated code: output=59de9165f9c2e4d2 input=3ac3bf521bfed59d]*/
{
    CHECK_ATTACHED(self);
    CHECK_CLOSED(self);
    self->telling = self->seekable;
    if (_textiowrapper_writeflush(self) < 0)
        return NULL;
    return PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(flush));
}

/*[clinic input]
@critical_section
_io.TextIOWrapper.close
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_close_impl(textio *self)
/*[clinic end generated code: output=056ccf8b4876e4f4 input=8e12d7079d5ac5c1]*/
{
    TyObject *res;
    int r;
    CHECK_ATTACHED(self);

    res = _io_TextIOWrapper_closed_get_impl(self);
    if (res == NULL)
        return NULL;
    r = PyObject_IsTrue(res);
    Ty_DECREF(res);
    if (r < 0)
        return NULL;

    if (r > 0) {
        Py_RETURN_NONE; /* stream already closed */
    }
    else {
        TyObject *exc = NULL;
        if (self->finalizing) {
            res = PyObject_CallMethodOneArg(self->buffer, &_Ty_ID(_dealloc_warn),
                                            (TyObject *)self);
            if (res) {
                Ty_DECREF(res);
            }
            else {
                TyErr_Clear();
            }
        }
        if (_PyFile_Flush((TyObject *)self) < 0) {
            exc = TyErr_GetRaisedException();
        }

        res = PyObject_CallMethodNoArgs(self->buffer, &_Ty_ID(close));
        if (exc != NULL) {
            _TyErr_ChainExceptions1(exc);
            Ty_CLEAR(res);
        }
        return res;
    }
}

static TyObject *
textiowrapper_iternext_lock_held(TyObject *op)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    TyObject *line;
    textio *self = textio_CAST(op);

    CHECK_ATTACHED(self);

    self->telling = 0;
    if (Ty_IS_TYPE(self, self->state->PyTextIOWrapper_Type)) {
        /* Skip method call overhead for speed */
        line = _textiowrapper_readline(self, -1);
    }
    else {
        line = PyObject_CallMethodNoArgs(op, &_Ty_ID(readline));
        if (line && !TyUnicode_Check(line)) {
            TyErr_Format(TyExc_OSError,
                         "readline() should have returned a str object, "
                         "not '%.200s'", Ty_TYPE(line)->tp_name);
            Ty_DECREF(line);
            return NULL;
        }
    }

    if (line == NULL)
        return NULL;

    if (TyUnicode_GET_LENGTH(line) == 0) {
        /* Reached EOF or would have blocked */
        Ty_DECREF(line);
        Ty_CLEAR(self->snapshot);
        self->telling = self->seekable;
        return NULL;
    }

    return line;
}

static TyObject *
textiowrapper_iternext(TyObject *op)
{
    TyObject *result;
    Ty_BEGIN_CRITICAL_SECTION(op);
    result = textiowrapper_iternext_lock_held(op);
    Ty_END_CRITICAL_SECTION();
    return result;
}

/*[clinic input]
@critical_section
@getter
_io.TextIOWrapper.name
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_name_get_impl(textio *self)
/*[clinic end generated code: output=8c2f1d6d8756af40 input=26ecec9b39e30e07]*/
{
    CHECK_ATTACHED(self);
    return PyObject_GetAttr(self->buffer, &_Ty_ID(name));
}

/*[clinic input]
@critical_section
@getter
_io.TextIOWrapper.closed
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_closed_get_impl(textio *self)
/*[clinic end generated code: output=b49b68f443a85e3c input=7dfcf43f63c7003d]*/
{
    CHECK_ATTACHED(self);
    return PyObject_GetAttr(self->buffer, &_Ty_ID(closed));
}

/*[clinic input]
@critical_section
@getter
_io.TextIOWrapper.newlines
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_newlines_get_impl(textio *self)
/*[clinic end generated code: output=53aa03ac35573180 input=610df647e514b3e8]*/
{
    TyObject *res;
    CHECK_ATTACHED(self);
    if (self->decoder == NULL ||
        PyObject_GetOptionalAttr(self->decoder, &_Ty_ID(newlines), &res) == 0)
    {
        Py_RETURN_NONE;
    }
    return res;
}

/*[clinic input]
@critical_section
@getter
_io.TextIOWrapper.errors
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper_errors_get_impl(textio *self)
/*[clinic end generated code: output=dca3a3ef21b09484 input=b45f983e6d43c4d8]*/
{
    CHECK_INITIALIZED(self);
    return Ty_NewRef(self->errors);
}

/*[clinic input]
@critical_section
@getter
_io.TextIOWrapper._CHUNK_SIZE
[clinic start generated code]*/

static TyObject *
_io_TextIOWrapper__CHUNK_SIZE_get_impl(textio *self)
/*[clinic end generated code: output=039925cd2df375bc input=e9715b0e06ff0fa6]*/
{
    CHECK_ATTACHED(self);
    return TyLong_FromSsize_t(self->chunk_size);
}

/*[clinic input]
@critical_section
@setter
_io.TextIOWrapper._CHUNK_SIZE
[clinic start generated code]*/

static int
_io_TextIOWrapper__CHUNK_SIZE_set_impl(textio *self, TyObject *value)
/*[clinic end generated code: output=edb86d2db660a5ab input=32fc99861db02a0a]*/
{
    Ty_ssize_t n;
    CHECK_ATTACHED_INT(self);
    if (value == NULL) {
        TyErr_SetString(TyExc_AttributeError, "cannot delete attribute");
        return -1;
    }
    n = PyNumber_AsSsize_t(value, TyExc_ValueError);
    if (n == -1 && TyErr_Occurred())
        return -1;
    if (n <= 0) {
        TyErr_SetString(TyExc_ValueError,
                        "a strictly positive integer is required");
        return -1;
    }
    self->chunk_size = n;
    return 0;
}

static TyMethodDef incrementalnewlinedecoder_methods[] = {
    _IO_INCREMENTALNEWLINEDECODER_DECODE_METHODDEF
    _IO_INCREMENTALNEWLINEDECODER_GETSTATE_METHODDEF
    _IO_INCREMENTALNEWLINEDECODER_SETSTATE_METHODDEF
    _IO_INCREMENTALNEWLINEDECODER_RESET_METHODDEF
    {NULL}
};

static TyGetSetDef incrementalnewlinedecoder_getset[] = {
    {"newlines", incrementalnewlinedecoder_newlines_get, NULL, NULL},
    {NULL}
};

static TyType_Slot nldecoder_slots[] = {
    {Ty_tp_dealloc, incrementalnewlinedecoder_dealloc},
    {Ty_tp_doc, (void *)_io_IncrementalNewlineDecoder___init____doc__},
    {Ty_tp_methods, incrementalnewlinedecoder_methods},
    {Ty_tp_getset, incrementalnewlinedecoder_getset},
    {Ty_tp_traverse, incrementalnewlinedecoder_traverse},
    {Ty_tp_clear, incrementalnewlinedecoder_clear},
    {Ty_tp_init, _io_IncrementalNewlineDecoder___init__},
    {0, NULL},
};

TyType_Spec nldecoder_spec = {
    .name = "_io.IncrementalNewlineDecoder",
    .basicsize = sizeof(nldecoder_object),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = nldecoder_slots,
};


static TyMethodDef textiowrapper_methods[] = {
    _IO_TEXTIOWRAPPER_DETACH_METHODDEF
    _IO_TEXTIOWRAPPER_RECONFIGURE_METHODDEF
    _IO_TEXTIOWRAPPER_WRITE_METHODDEF
    _IO_TEXTIOWRAPPER_READ_METHODDEF
    _IO_TEXTIOWRAPPER_READLINE_METHODDEF
    _IO_TEXTIOWRAPPER_FLUSH_METHODDEF
    _IO_TEXTIOWRAPPER_CLOSE_METHODDEF

    _IO_TEXTIOWRAPPER_FILENO_METHODDEF
    _IO_TEXTIOWRAPPER_SEEKABLE_METHODDEF
    _IO_TEXTIOWRAPPER_READABLE_METHODDEF
    _IO_TEXTIOWRAPPER_WRITABLE_METHODDEF
    _IO_TEXTIOWRAPPER_ISATTY_METHODDEF

    _IO_TEXTIOWRAPPER_SEEK_METHODDEF
    _IO_TEXTIOWRAPPER_TELL_METHODDEF
    _IO_TEXTIOWRAPPER_TRUNCATE_METHODDEF

    {"__getstate__", _PyIOBase_cannot_pickle, METH_NOARGS},
    {NULL, NULL}
};

static TyMemberDef textiowrapper_members[] = {
    {"encoding", _Ty_T_OBJECT, offsetof(textio, encoding), Py_READONLY},
    {"buffer", _Ty_T_OBJECT, offsetof(textio, buffer), Py_READONLY},
    {"line_buffering", Ty_T_BOOL, offsetof(textio, line_buffering), Py_READONLY},
    {"write_through", Ty_T_BOOL, offsetof(textio, write_through), Py_READONLY},
    {"_finalizing", Ty_T_BOOL, offsetof(textio, finalizing), 0},
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(textio, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(textio, dict), Py_READONLY},
    {NULL}
};

static TyGetSetDef textiowrapper_getset[] = {
    _IO_TEXTIOWRAPPER_NAME_GETSETDEF
    _IO_TEXTIOWRAPPER_CLOSED_GETSETDEF
    _IO_TEXTIOWRAPPER_NEWLINES_GETSETDEF
    _IO_TEXTIOWRAPPER_ERRORS_GETSETDEF
    _IO_TEXTIOWRAPPER__CHUNK_SIZE_GETSETDEF
    {NULL}
};

TyType_Slot textiowrapper_slots[] = {
    {Ty_tp_dealloc, textiowrapper_dealloc},
    {Ty_tp_repr, textiowrapper_repr},
    {Ty_tp_doc, (void *)_io_TextIOWrapper___init____doc__},
    {Ty_tp_traverse, textiowrapper_traverse},
    {Ty_tp_clear, textiowrapper_clear},
    {Ty_tp_iternext, textiowrapper_iternext},
    {Ty_tp_methods, textiowrapper_methods},
    {Ty_tp_members, textiowrapper_members},
    {Ty_tp_getset, textiowrapper_getset},
    {Ty_tp_init, _io_TextIOWrapper___init__},
    {0, NULL},
};

TyType_Spec textiowrapper_spec = {
    .name = "_io.TextIOWrapper",
    .basicsize = sizeof(textio),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = textiowrapper_slots,
};
