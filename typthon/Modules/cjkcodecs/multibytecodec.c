/*
 * multibytecodec.c: Common Multibyte Codec Implementation
 *
 * Written by Hye-Shik Chang <perky@FreeBSD.org>
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"

#include "multibytecodec.h"
#include "clinic/multibytecodec.c.h"

#include <stddef.h>               // offsetof()

#define MODULE_NAME "_multibytecodec"

typedef struct {
    TyTypeObject *encoder_type;
    TyTypeObject *decoder_type;
    TyTypeObject *reader_type;
    TyTypeObject *writer_type;
    TyTypeObject *multibytecodec_type;
    TyObject *str_write;
} module_state;

static module_state *
get_module_state(TyObject *module)
{
    module_state *state = TyModule_GetState(module);
    assert(state != NULL);
    return state;
}

static struct TyModuleDef _multibytecodecmodule;

static module_state *
find_state_by_def(TyTypeObject *type)
{
    TyObject *module = TyType_GetModuleByDef(type, &_multibytecodecmodule);
    assert(module != NULL);
    return get_module_state(module);
}

#define clinic_get_state() find_state_by_def(type)
/*[clinic input]
module _multibytecodec
class _multibytecodec.MultibyteCodec "MultibyteCodecObject *" "clinic_get_state()->multibytecodec_type"
class _multibytecodec.MultibyteIncrementalEncoder "MultibyteIncrementalEncoderObject *" "clinic_get_state()->encoder_type"
class _multibytecodec.MultibyteIncrementalDecoder "MultibyteIncrementalDecoderObject *" "clinic_get_state()->decoder_type"
class _multibytecodec.MultibyteStreamReader "MultibyteStreamReaderObject *" "clinic_get_state()->reader_type"
class _multibytecodec.MultibyteStreamWriter "MultibyteStreamWriterObject *" "clinic_get_state()->writer_type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=305a76dfdd24b99c]*/
#undef clinic_get_state

#define _MultibyteCodec_CAST(op)        ((MultibyteCodec *)(op))
#define _MultibyteCodecObject_CAST(op)  ((MultibyteCodecObject *)(op))

#define _MultibyteStatefulCodecContext_CAST(op) \
    ((MultibyteStatefulCodecContext *)(op))

#define _MultibyteStatefulEncoderContext_CAST(op)   \
    ((MultibyteStatefulEncoderContext *)(op))
#define _MultibyteStatefulDecoderContext_CAST(op)   \
    ((MultibyteStatefulDecoderContext *)(op))

#define _MultibyteIncrementalEncoderObject_CAST(op) \
    ((MultibyteIncrementalEncoderObject *)(op))
#define _MultibyteIncrementalDecoderObject_CAST(op) \
    ((MultibyteIncrementalDecoderObject *)(op))

#define _MultibyteStreamReaderObject_CAST(op)   \
    ((MultibyteStreamReaderObject *)(op))
#define _MultibyteStreamWriterObject_CAST(op)   \
    ((MultibyteStreamWriterObject *)(op))

typedef struct {
    TyObject            *inobj;
    Ty_ssize_t          inpos, inlen;
    unsigned char       *outbuf, *outbuf_end;
    TyObject            *excobj, *outobj;
} MultibyteEncodeBuffer;

typedef struct {
    const unsigned char *inbuf, *inbuf_top, *inbuf_end;
    TyObject            *excobj;
    _PyUnicodeWriter    writer;
} MultibyteDecodeBuffer;

static char *incnewkwarglist[] = {"errors", NULL};
static char *streamkwarglist[] = {"stream", "errors", NULL};

static TyObject *multibytecodec_encode(const MultibyteCodec *,
                MultibyteCodec_State *, TyObject *, Ty_ssize_t *,
                TyObject *, int);

#define MBENC_RESET     MBENC_MAX<<1 /* reset after an encoding session */

static TyObject *
make_tuple(TyObject *object, Ty_ssize_t len)
{
    TyObject *v, *w;

    if (object == NULL)
        return NULL;

    v = TyTuple_New(2);
    if (v == NULL) {
        Ty_DECREF(object);
        return NULL;
    }
    TyTuple_SET_ITEM(v, 0, object);

    w = TyLong_FromSsize_t(len);
    if (w == NULL) {
        Ty_DECREF(v);
        return NULL;
    }
    TyTuple_SET_ITEM(v, 1, w);

    return v;
}

static TyObject *
internal_error_callback(const char *errors)
{
    if (errors == NULL || strcmp(errors, "strict") == 0)
        return ERROR_STRICT;
    else if (strcmp(errors, "ignore") == 0)
        return ERROR_IGNORE;
    else if (strcmp(errors, "replace") == 0)
        return ERROR_REPLACE;
    else
        return TyUnicode_FromString(errors);
}

static TyObject *
call_error_callback(TyObject *errors, TyObject *exc)
{
    TyObject *cb, *r;
    const char *str;

    assert(TyUnicode_Check(errors));
    str = TyUnicode_AsUTF8(errors);
    if (str == NULL)
        return NULL;
    cb = PyCodec_LookupError(str);
    if (cb == NULL)
        return NULL;

    r = PyObject_CallOneArg(cb, exc);
    Ty_DECREF(cb);
    return r;
}

static TyObject *
codecctx_errors_get(TyObject *op, void *Py_UNUSED(closure))
{
    const char *errors;
    MultibyteStatefulCodecContext *self = _MultibyteStatefulCodecContext_CAST(op);

    if (self->errors == ERROR_STRICT)
        errors = "strict";
    else if (self->errors == ERROR_IGNORE)
        errors = "ignore";
    else if (self->errors == ERROR_REPLACE)
        errors = "replace";
    else {
        return Ty_NewRef(self->errors);
    }

    return TyUnicode_FromString(errors);
}

static int
codecctx_errors_set(TyObject *op, TyObject *value, void *Py_UNUSED(closure))
{
    TyObject *cb;
    const char *str;
    MultibyteStatefulCodecContext *self = _MultibyteStatefulCodecContext_CAST(op);

    if (value == NULL) {
        TyErr_SetString(TyExc_AttributeError, "cannot delete attribute");
        return -1;
    }
    if (!TyUnicode_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "errors must be a string");
        return -1;
    }

    str = TyUnicode_AsUTF8(value);
    if (str == NULL)
        return -1;

    cb = internal_error_callback(str);
    if (cb == NULL)
        return -1;

    ERROR_DECREF(self->errors);
    self->errors = cb;
    return 0;
}

/* This getset handlers list is used by all the stateful codec objects */
static TyGetSetDef codecctx_getsets[] = {
    {"errors", codecctx_errors_get, codecctx_errors_set,
     TyDoc_STR("how to treat errors")},
    {NULL,}
};

static int
expand_encodebuffer(MultibyteEncodeBuffer *buf, Ty_ssize_t esize)
{
    Ty_ssize_t orgpos, orgsize, incsize;

    orgpos = (Ty_ssize_t)((char *)buf->outbuf -
                            TyBytes_AS_STRING(buf->outobj));
    orgsize = TyBytes_GET_SIZE(buf->outobj);
    incsize = (esize < (orgsize >> 1) ? (orgsize >> 1) | 1 : esize);

    if (orgsize > PY_SSIZE_T_MAX - incsize) {
        TyErr_NoMemory();
        return -1;
    }

    if (_TyBytes_Resize(&buf->outobj, orgsize + incsize) == -1)
        return -1;

    buf->outbuf = (unsigned char *)TyBytes_AS_STRING(buf->outobj) +orgpos;
    buf->outbuf_end = (unsigned char *)TyBytes_AS_STRING(buf->outobj)
        + TyBytes_GET_SIZE(buf->outobj);

    return 0;
}
#define REQUIRE_ENCODEBUFFER(buf, s) do {                               \
    if ((s) < 0 || (s) > (buf)->outbuf_end - (buf)->outbuf)             \
        if (expand_encodebuffer(buf, s) == -1)                          \
            goto errorexit;                                             \
} while(0)


/**
 * MultibyteCodec object
 */

static int
multibytecodec_encerror(const MultibyteCodec *codec,
                        MultibyteCodec_State *state,
                        MultibyteEncodeBuffer *buf,
                        TyObject *errors, Ty_ssize_t e)
{
    TyObject *retobj = NULL, *retstr = NULL, *tobj;
    Ty_ssize_t retstrsize, newpos;
    Ty_ssize_t esize, start, end;
    const char *reason;

    if (e > 0) {
        reason = "illegal multibyte sequence";
        esize = e;
    }
    else {
        switch (e) {
        case MBERR_TOOSMALL:
            REQUIRE_ENCODEBUFFER(buf, -1);
            return 0; /* retry it */
        case MBERR_TOOFEW:
            reason = "incomplete multibyte sequence";
            esize = (Ty_ssize_t)buf->inpos;
            break;
        case MBERR_INTERNAL:
            TyErr_SetString(TyExc_RuntimeError,
                            "internal codec error");
            return -1;
        default:
            TyErr_SetString(TyExc_RuntimeError,
                            "unknown runtime error");
            return -1;
        }
    }

    if (errors == ERROR_REPLACE) {
        TyObject *replchar;
        Ty_ssize_t r;
        Ty_ssize_t inpos;
        int kind;
        const void *data;

        replchar = TyUnicode_FromOrdinal('?');
        if (replchar == NULL)
            goto errorexit;
        kind = TyUnicode_KIND(replchar);
        data = TyUnicode_DATA(replchar);

        inpos = 0;
        for (;;) {
            Ty_ssize_t outleft = (Ty_ssize_t)(buf->outbuf_end - buf->outbuf);

            r = codec->encode(state, codec,
                              kind, data, &inpos, 1,
                              &buf->outbuf, outleft, 0);
            if (r == MBERR_TOOSMALL) {
                REQUIRE_ENCODEBUFFER(buf, -1);
                continue;
            }
            else
                break;
        }

        Ty_DECREF(replchar);

        if (r != 0) {
            REQUIRE_ENCODEBUFFER(buf, 1);
            *buf->outbuf++ = '?';
        }
    }
    if (errors == ERROR_IGNORE || errors == ERROR_REPLACE) {
        buf->inpos += esize;
        return 0;
    }

    start = (Ty_ssize_t)buf->inpos;
    end = start + esize;

    /* use cached exception object if available */
    if (buf->excobj == NULL) {
        buf->excobj =  PyObject_CallFunction(TyExc_UnicodeEncodeError,
                                             "sOnns",
                                             codec->encoding, buf->inobj,
                                             start, end, reason);
        if (buf->excobj == NULL)
            goto errorexit;
    }
    else
        if (PyUnicodeEncodeError_SetStart(buf->excobj, start) != 0 ||
            PyUnicodeEncodeError_SetEnd(buf->excobj, end) != 0 ||
            PyUnicodeEncodeError_SetReason(buf->excobj, reason) != 0)
            goto errorexit;

    if (errors == ERROR_STRICT) {
        PyCodec_StrictErrors(buf->excobj);
        goto errorexit;
    }

    retobj = call_error_callback(errors, buf->excobj);
    if (retobj == NULL)
        goto errorexit;

    if (!TyTuple_Check(retobj) || TyTuple_GET_SIZE(retobj) != 2 ||
        (!TyUnicode_Check((tobj = TyTuple_GET_ITEM(retobj, 0))) && !TyBytes_Check(tobj)) ||
        !TyLong_Check(TyTuple_GET_ITEM(retobj, 1))) {
        TyErr_SetString(TyExc_TypeError,
                        "encoding error handler must return "
                        "(str, int) tuple");
        goto errorexit;
    }

    if (TyUnicode_Check(tobj)) {
        Ty_ssize_t inpos;

        retstr = multibytecodec_encode(codec, state, tobj,
                        &inpos, ERROR_STRICT,
                        MBENC_FLUSH);
        if (retstr == NULL)
            goto errorexit;
    }
    else {
        retstr = Ty_NewRef(tobj);
    }

    assert(TyBytes_Check(retstr));
    retstrsize = TyBytes_GET_SIZE(retstr);
    if (retstrsize > 0) {
        REQUIRE_ENCODEBUFFER(buf, retstrsize);
        memcpy(buf->outbuf, TyBytes_AS_STRING(retstr), retstrsize);
        buf->outbuf += retstrsize;
    }

    newpos = TyLong_AsSsize_t(TyTuple_GET_ITEM(retobj, 1));
    if (newpos < 0 && !TyErr_Occurred())
        newpos += (Ty_ssize_t)buf->inlen;
    if (newpos < 0 || newpos > buf->inlen) {
        TyErr_Clear();
        TyErr_Format(TyExc_IndexError,
                     "position %zd from error handler out of bounds",
                     newpos);
        goto errorexit;
    }
    buf->inpos = newpos;

    Ty_DECREF(retobj);
    Ty_DECREF(retstr);
    return 0;

errorexit:
    Ty_XDECREF(retobj);
    Ty_XDECREF(retstr);
    return -1;
}

static int
multibytecodec_decerror(const MultibyteCodec *codec,
                        MultibyteCodec_State *state,
                        MultibyteDecodeBuffer *buf,
                        TyObject *errors, Ty_ssize_t e)
{
    TyObject *retobj = NULL, *retuni = NULL;
    Ty_ssize_t newpos;
    const char *reason;
    Ty_ssize_t esize, start, end;

    if (e > 0) {
        reason = "illegal multibyte sequence";
        esize = e;
    }
    else {
        switch (e) {
        case MBERR_TOOSMALL:
            return 0; /* retry it */
        case MBERR_TOOFEW:
            reason = "incomplete multibyte sequence";
            esize = (Ty_ssize_t)(buf->inbuf_end - buf->inbuf);
            break;
        case MBERR_INTERNAL:
            TyErr_SetString(TyExc_RuntimeError,
                            "internal codec error");
            return -1;
        case MBERR_EXCEPTION:
            return -1;
        default:
            TyErr_SetString(TyExc_RuntimeError,
                            "unknown runtime error");
            return -1;
        }
    }

    if (errors == ERROR_REPLACE) {
        if (_PyUnicodeWriter_WriteChar(&buf->writer,
                                       Ty_UNICODE_REPLACEMENT_CHARACTER) < 0)
            goto errorexit;
    }
    if (errors == ERROR_IGNORE || errors == ERROR_REPLACE) {
        buf->inbuf += esize;
        return 0;
    }

    start = (Ty_ssize_t)(buf->inbuf - buf->inbuf_top);
    end = start + esize;

    /* use cached exception object if available */
    if (buf->excobj == NULL) {
        buf->excobj = PyUnicodeDecodeError_Create(codec->encoding,
                        (const char *)buf->inbuf_top,
                        (Ty_ssize_t)(buf->inbuf_end - buf->inbuf_top),
                        start, end, reason);
        if (buf->excobj == NULL)
            goto errorexit;
    }
    else
        if (PyUnicodeDecodeError_SetStart(buf->excobj, start) ||
            PyUnicodeDecodeError_SetEnd(buf->excobj, end) ||
            PyUnicodeDecodeError_SetReason(buf->excobj, reason))
            goto errorexit;

    if (errors == ERROR_STRICT) {
        PyCodec_StrictErrors(buf->excobj);
        goto errorexit;
    }

    retobj = call_error_callback(errors, buf->excobj);
    if (retobj == NULL)
        goto errorexit;

    if (!TyTuple_Check(retobj) || TyTuple_GET_SIZE(retobj) != 2 ||
        !TyUnicode_Check((retuni = TyTuple_GET_ITEM(retobj, 0))) ||
        !TyLong_Check(TyTuple_GET_ITEM(retobj, 1))) {
        TyErr_SetString(TyExc_TypeError,
                        "decoding error handler must return "
                        "(str, int) tuple");
        goto errorexit;
    }

    if (_PyUnicodeWriter_WriteStr(&buf->writer, retuni) < 0)
        goto errorexit;

    newpos = TyLong_AsSsize_t(TyTuple_GET_ITEM(retobj, 1));
    if (newpos < 0 && !TyErr_Occurred())
        newpos += (Ty_ssize_t)(buf->inbuf_end - buf->inbuf_top);
    if (newpos < 0 || buf->inbuf_top + newpos > buf->inbuf_end) {
        TyErr_Clear();
        TyErr_Format(TyExc_IndexError,
                     "position %zd from error handler out of bounds",
                     newpos);
        goto errorexit;
    }
    buf->inbuf = buf->inbuf_top + newpos;
    Ty_DECREF(retobj);
    return 0;

errorexit:
    Ty_XDECREF(retobj);
    return -1;
}

static TyObject *
multibytecodec_encode(const MultibyteCodec *codec,
                      MultibyteCodec_State *state,
                      TyObject *text, Ty_ssize_t *inpos_t,
                      TyObject *errors, int flags)
{
    MultibyteEncodeBuffer buf;
    Ty_ssize_t finalsize, r = 0;
    Ty_ssize_t datalen;
    int kind;
    const void *data;

    datalen = TyUnicode_GET_LENGTH(text);

    if (datalen == 0 && !(flags & MBENC_RESET))
        return TyBytes_FromStringAndSize(NULL, 0);

    buf.excobj = NULL;
    buf.outobj = NULL;
    buf.inobj = text;   /* borrowed reference */
    buf.inpos = 0;
    buf.inlen = datalen;
    kind = TyUnicode_KIND(buf.inobj);
    data = TyUnicode_DATA(buf.inobj);

    if (datalen > (PY_SSIZE_T_MAX - 16) / 2) {
        TyErr_NoMemory();
        goto errorexit;
    }

    buf.outobj = TyBytes_FromStringAndSize(NULL, datalen * 2 + 16);
    if (buf.outobj == NULL)
        goto errorexit;
    buf.outbuf = (unsigned char *)TyBytes_AS_STRING(buf.outobj);
    buf.outbuf_end = buf.outbuf + TyBytes_GET_SIZE(buf.outobj);

    while (buf.inpos < buf.inlen) {
        /* we don't reuse inleft and outleft here.
         * error callbacks can relocate the cursor anywhere on buffer*/
        Ty_ssize_t outleft = (Ty_ssize_t)(buf.outbuf_end - buf.outbuf);

        r = codec->encode(state, codec,
                          kind, data,
                          &buf.inpos, buf.inlen,
                          &buf.outbuf, outleft, flags);
        if ((r == 0) || (r == MBERR_TOOFEW && !(flags & MBENC_FLUSH)))
            break;
        else if (multibytecodec_encerror(codec, state, &buf, errors,r))
            goto errorexit;
        else if (r == MBERR_TOOFEW)
            break;
    }

    if (codec->encreset != NULL && (flags & MBENC_RESET))
        for (;;) {
            Ty_ssize_t outleft;

            outleft = (Ty_ssize_t)(buf.outbuf_end - buf.outbuf);
            r = codec->encreset(state, codec, &buf.outbuf,
                                outleft);
            if (r == 0)
                break;
            else if (multibytecodec_encerror(codec, state,
                                             &buf, errors, r))
                goto errorexit;
        }

    finalsize = (Ty_ssize_t)((char *)buf.outbuf -
                             TyBytes_AS_STRING(buf.outobj));

    if (finalsize != TyBytes_GET_SIZE(buf.outobj))
        if (_TyBytes_Resize(&buf.outobj, finalsize) == -1)
            goto errorexit;

    if (inpos_t)
        *inpos_t = buf.inpos;
    Ty_XDECREF(buf.excobj);
    return buf.outobj;

errorexit:
    Ty_XDECREF(buf.excobj);
    Ty_XDECREF(buf.outobj);
    return NULL;
}

/*[clinic input]
_multibytecodec.MultibyteCodec.encode

  input: object
  errors: str(accept={str, NoneType}) = None

Return an encoded string version of 'input'.

'errors' may be given to set a different error handling scheme. Default is
'strict' meaning that encoding errors raise a UnicodeEncodeError. Other possible
values are 'ignore', 'replace' and 'xmlcharrefreplace' as well as any other name
registered with codecs.register_error that can handle UnicodeEncodeErrors.
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteCodec_encode_impl(MultibyteCodecObject *self,
                                           TyObject *input,
                                           const char *errors)
/*[clinic end generated code: output=7b26652045ba56a9 input=2841745b95ed338f]*/
{
    MultibyteCodec_State state;
    TyObject *errorcb, *r, *ucvt;
    Ty_ssize_t datalen;

    if (TyUnicode_Check(input))
        ucvt = NULL;
    else {
        input = ucvt = PyObject_Str(input);
        if (input == NULL)
            return NULL;
        else if (!TyUnicode_Check(input)) {
            TyErr_SetString(TyExc_TypeError,
                "couldn't convert the object to unicode.");
            Ty_DECREF(ucvt);
            return NULL;
        }
    }

    datalen = TyUnicode_GET_LENGTH(input);

    errorcb = internal_error_callback(errors);
    if (errorcb == NULL) {
        Ty_XDECREF(ucvt);
        return NULL;
    }

    if (self->codec->encinit != NULL &&
        self->codec->encinit(&state, self->codec) != 0)
        goto errorexit;
    r = multibytecodec_encode(self->codec, &state,
                    input, NULL, errorcb,
                    MBENC_FLUSH | MBENC_RESET);
    if (r == NULL)
        goto errorexit;

    ERROR_DECREF(errorcb);
    Ty_XDECREF(ucvt);
    return make_tuple(r, datalen);

errorexit:
    ERROR_DECREF(errorcb);
    Ty_XDECREF(ucvt);
    return NULL;
}

/*[clinic input]
_multibytecodec.MultibyteCodec.decode

  input: Ty_buffer
  errors: str(accept={str, NoneType}) = None

Decodes 'input'.

'errors' may be given to set a different error handling scheme. Default is
'strict' meaning that encoding errors raise a UnicodeDecodeError. Other possible
values are 'ignore' and 'replace' as well as any other name registered with
codecs.register_error that is able to handle UnicodeDecodeErrors."
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteCodec_decode_impl(MultibyteCodecObject *self,
                                           Ty_buffer *input,
                                           const char *errors)
/*[clinic end generated code: output=ff419f65bad6cc77 input=e0c78fc7ab190def]*/
{
    MultibyteCodec_State state;
    MultibyteDecodeBuffer buf;
    TyObject *errorcb, *res;
    const char *data;
    Ty_ssize_t datalen;

    data = input->buf;
    datalen = input->len;

    errorcb = internal_error_callback(errors);
    if (errorcb == NULL) {
        return NULL;
    }

    if (datalen == 0) {
        ERROR_DECREF(errorcb);
        return make_tuple(Ty_GetConstant(Ty_CONSTANT_EMPTY_STR), 0);
    }

    _PyUnicodeWriter_Init(&buf.writer);
    buf.writer.min_length = datalen;
    buf.excobj = NULL;
    buf.inbuf = buf.inbuf_top = (unsigned char *)data;
    buf.inbuf_end = buf.inbuf_top + datalen;

    if (self->codec->decinit != NULL &&
        self->codec->decinit(&state, self->codec) != 0)
        goto errorexit;

    while (buf.inbuf < buf.inbuf_end) {
        Ty_ssize_t inleft, r;

        inleft = (Ty_ssize_t)(buf.inbuf_end - buf.inbuf);

        r = self->codec->decode(&state, self->codec,
                        &buf.inbuf, inleft, &buf.writer);
        if (r == 0)
            break;
        else if (multibytecodec_decerror(self->codec, &state,
                                         &buf, errorcb, r))
            goto errorexit;
    }

    res = _PyUnicodeWriter_Finish(&buf.writer);
    if (res == NULL)
        goto errorexit;

    Ty_XDECREF(buf.excobj);
    ERROR_DECREF(errorcb);
    return make_tuple(res, datalen);

errorexit:
    ERROR_DECREF(errorcb);
    Ty_XDECREF(buf.excobj);
    _PyUnicodeWriter_Dealloc(&buf.writer);

    return NULL;
}

static struct TyMethodDef multibytecodec_methods[] = {
    _MULTIBYTECODEC_MULTIBYTECODEC_ENCODE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTECODEC_DECODE_METHODDEF
    {NULL, NULL},
};

static int
multibytecodec_clear(TyObject *op)
{
    MultibyteCodecObject *self = _MultibyteCodecObject_CAST(op);
    Ty_CLEAR(self->cjk_module);
    return 0;
}

static int
multibytecodec_traverse(TyObject *op, visitproc visit, void *arg)
{
    MultibyteCodecObject *self = _MultibyteCodecObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->cjk_module);
    return 0;
}

static void
multibytecodec_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    TyTypeObject *tp = Ty_TYPE(self);
    (void)multibytecodec_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot multibytecodec_slots[] = {
    {Ty_tp_dealloc, multibytecodec_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_methods, multibytecodec_methods},
    {Ty_tp_traverse, multibytecodec_traverse},
    {Ty_tp_clear, multibytecodec_clear},
    {0, NULL},
};

static TyType_Spec multibytecodec_spec = {
    .name = MODULE_NAME ".MultibyteCodec",
    .basicsize = sizeof(MultibyteCodecObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = multibytecodec_slots,
};


/**
 * Utility functions for stateful codec mechanism
 */

#define STATEFUL_DCTX(o)        ((MultibyteStatefulDecoderContext *)(o))
#define STATEFUL_ECTX(o)        ((MultibyteStatefulEncoderContext *)(o))

static TyObject *
encoder_encode_stateful(MultibyteStatefulEncoderContext *ctx,
                        TyObject *unistr, int final)
{
    TyObject *ucvt, *r = NULL;
    TyObject *inbuf = NULL;
    Ty_ssize_t inpos, datalen;
    TyObject *origpending = NULL;

    if (TyUnicode_Check(unistr))
        ucvt = NULL;
    else {
        unistr = ucvt = PyObject_Str(unistr);
        if (unistr == NULL)
            return NULL;
        else if (!TyUnicode_Check(unistr)) {
            TyErr_SetString(TyExc_TypeError,
                "couldn't convert the object to str.");
            Ty_DECREF(ucvt);
            return NULL;
        }
    }

    if (ctx->pending) {
        TyObject *inbuf_tmp;

        origpending = Ty_NewRef(ctx->pending);

        inbuf_tmp = Ty_NewRef(ctx->pending);
        TyUnicode_Append(&inbuf_tmp, unistr);
        if (inbuf_tmp == NULL)
            goto errorexit;
        Ty_CLEAR(ctx->pending);
        inbuf = inbuf_tmp;
    }
    else {
        origpending = NULL;

        inbuf = Ty_NewRef(unistr);
    }
    inpos = 0;
    datalen = TyUnicode_GET_LENGTH(inbuf);

    r = multibytecodec_encode(ctx->codec, &ctx->state,
                              inbuf, &inpos,
                              ctx->errors, final ? MBENC_FLUSH | MBENC_RESET : 0);
    if (r == NULL) {
        /* recover the original pending buffer */
        Ty_XSETREF(ctx->pending, origpending);
        origpending = NULL;
        goto errorexit;
    }
    Ty_XDECREF(origpending);

    if (inpos < datalen) {
        if (datalen - inpos > MAXENCPENDING) {
            /* normal codecs can't reach here */
            TyObject *excobj = PyObject_CallFunction(TyExc_UnicodeEncodeError,
                                                     "sOnns",
                                                     ctx->codec->encoding,
                                                     inbuf,
                                                     inpos, datalen,
                                                     "pending buffer overflow");
            if (excobj == NULL) goto errorexit;
            TyErr_SetObject(TyExc_UnicodeEncodeError, excobj);
            Ty_DECREF(excobj);
            goto errorexit;
        }
        ctx->pending = TyUnicode_Substring(inbuf, inpos, datalen);
        if (ctx->pending == NULL) {
            /* normal codecs can't reach here */
            goto errorexit;
        }
    }

    Ty_DECREF(inbuf);
    Ty_XDECREF(ucvt);
    return r;

errorexit:
    Ty_XDECREF(r);
    Ty_XDECREF(ucvt);
    Ty_XDECREF(origpending);
    Ty_XDECREF(inbuf);
    return NULL;
}

static int
decoder_append_pending(MultibyteStatefulDecoderContext *ctx,
                       MultibyteDecodeBuffer *buf)
{
    Ty_ssize_t npendings;

    npendings = (Ty_ssize_t)(buf->inbuf_end - buf->inbuf);
    if (npendings + ctx->pendingsize > MAXDECPENDING ||
        npendings > PY_SSIZE_T_MAX - ctx->pendingsize) {
            Ty_ssize_t bufsize = (Ty_ssize_t)(buf->inbuf_end - buf->inbuf_top);
            TyObject *excobj = PyUnicodeDecodeError_Create(ctx->codec->encoding,
                                                           (const char *)buf->inbuf_top,
                                                           bufsize,
                                                           0,
                                                           bufsize,
                                                           "pending buffer overflow");
            if (excobj == NULL) return -1;
            TyErr_SetObject(TyExc_UnicodeDecodeError, excobj);
            Ty_DECREF(excobj);
            return -1;
    }
    memcpy(ctx->pending + ctx->pendingsize, buf->inbuf, npendings);
    ctx->pendingsize += npendings;
    return 0;
}

static int
decoder_prepare_buffer(MultibyteDecodeBuffer *buf, const char *data,
                       Ty_ssize_t size)
{
    buf->inbuf = buf->inbuf_top = (const unsigned char *)data;
    buf->inbuf_end = buf->inbuf_top + size;
    buf->writer.min_length += size;
    return 0;
}

static int
decoder_feed_buffer(MultibyteStatefulDecoderContext *ctx,
                    MultibyteDecodeBuffer *buf)
{
    while (buf->inbuf < buf->inbuf_end) {
        Ty_ssize_t inleft;
        Ty_ssize_t r;

        inleft = (Ty_ssize_t)(buf->inbuf_end - buf->inbuf);

        r = ctx->codec->decode(&ctx->state, ctx->codec,
            &buf->inbuf, inleft, &buf->writer);
        if (r == 0 || r == MBERR_TOOFEW)
            break;
        else if (multibytecodec_decerror(ctx->codec, &ctx->state,
                                         buf, ctx->errors, r))
            return -1;
    }
    return 0;
}


/*[clinic input]
_multibytecodec.MultibyteIncrementalEncoder.encode

    input: object
    final: bool = False
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_encode_impl(MultibyteIncrementalEncoderObject *self,
                                                        TyObject *input,
                                                        int final)
/*[clinic end generated code: output=123361b6c505e2c1 input=bd5f7d40d43e99b0]*/
{
    return encoder_encode_stateful(STATEFUL_ECTX(self), input, final);
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalEncoder.getstate
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_getstate_impl(MultibyteIncrementalEncoderObject *self)
/*[clinic end generated code: output=9794a5ace70d7048 input=4a2a82874ffa40bb]*/
{
    /* state made up of 1 byte for buffer size, up to MAXENCPENDING*4 bytes
       for UTF-8 encoded buffer (each character can use up to 4
       bytes), and required bytes for MultibyteCodec_State.c. A byte
       array is used to avoid different compilers generating different
       values for the same state, e.g. as a result of struct padding.
    */
    unsigned char statebytes[1 + MAXENCPENDING*4 + sizeof(self->state.c)];
    Ty_ssize_t statesize;
    const char *pendingbuffer = NULL;
    Ty_ssize_t pendingsize;

    if (self->pending != NULL) {
        pendingbuffer = TyUnicode_AsUTF8AndSize(self->pending, &pendingsize);
        if (pendingbuffer == NULL) {
            return NULL;
        }
        if (pendingsize > MAXENCPENDING*4) {
            TyObject *excobj = PyObject_CallFunction(TyExc_UnicodeEncodeError,
                                                     "sOnns",
                                                     self->codec->encoding,
                                                     self->pending,
                                                     0, TyUnicode_GET_LENGTH(self->pending),
                                                     "pending buffer too large");
            if (excobj == NULL) {
                return NULL;
            }
            TyErr_SetObject(TyExc_UnicodeEncodeError, excobj);
            Ty_DECREF(excobj);
            return NULL;
        }
        statebytes[0] = (unsigned char)pendingsize;
        memcpy(statebytes + 1, pendingbuffer, pendingsize);
        statesize = 1 + pendingsize;
    } else {
        statebytes[0] = 0;
        statesize = 1;
    }
    memcpy(statebytes+statesize, self->state.c,
           sizeof(self->state.c));
    statesize += sizeof(self->state.c);

    return (TyObject *)_TyLong_FromByteArray(statebytes, statesize,
                                             1 /* little-endian */ ,
                                             0 /* unsigned */ );
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalEncoder.setstate
    state as statelong: object(type='PyLongObject *', subclass_of='&TyLong_Type')
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_setstate_impl(MultibyteIncrementalEncoderObject *self,
                                                          PyLongObject *statelong)
/*[clinic end generated code: output=4e5e98ac1f4039ca input=c80fb5830d4d2f76]*/
{
    TyObject *pending = NULL;
    unsigned char statebytes[1 + MAXENCPENDING*4 + sizeof(self->state.c)];

    if (_TyLong_AsByteArray(statelong, statebytes, sizeof(statebytes),
                            1 /* little-endian */ ,
                            0 /* unsigned */ ,
                            1 /* with_exceptions */) < 0) {
        goto errorexit;
    }

    if (statebytes[0] > MAXENCPENDING*4) {
        TyErr_SetString(TyExc_UnicodeError, "pending buffer too large");
        return NULL;
    }

    pending = TyUnicode_DecodeUTF8((const char *)statebytes+1,
                                   statebytes[0], "strict");
    if (pending == NULL) {
        goto errorexit;
    }

    Ty_XSETREF(self->pending, pending);
    memcpy(self->state.c, statebytes+1+statebytes[0],
           sizeof(self->state.c));

    Py_RETURN_NONE;

errorexit:
    Ty_XDECREF(pending);
    return NULL;
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalEncoder.reset
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalEncoder_reset_impl(MultibyteIncrementalEncoderObject *self)
/*[clinic end generated code: output=b4125d8f537a253f input=930f06760707b6ea]*/
{
    /* Longest output: 4 bytes (b'\x0F\x1F(B') with ISO 2022 */
    unsigned char buffer[4], *outbuf;
    Ty_ssize_t r;
    if (self->codec->encreset != NULL) {
        outbuf = buffer;
        r = self->codec->encreset(&self->state, self->codec,
                                  &outbuf, sizeof(buffer));
        if (r != 0)
            return NULL;
    }
    Ty_CLEAR(self->pending);
    Py_RETURN_NONE;
}

static struct TyMethodDef mbiencoder_methods[] = {
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_ENCODE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_GETSTATE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_SETSTATE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALENCODER_RESET_METHODDEF
    {NULL, NULL},
};

static TyObject *
mbiencoder_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    MultibyteIncrementalEncoderObject *self;
    TyObject *codec = NULL;
    char *errors = NULL;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|s:IncrementalEncoder",
                                     incnewkwarglist, &errors))
        return NULL;

    self = (MultibyteIncrementalEncoderObject *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    codec = PyObject_GetAttrString((TyObject *)type, "codec");
    if (codec == NULL)
        goto errorexit;

    module_state *state = find_state_by_def(type);
    if (!MultibyteCodec_Check(state, codec)) {
        TyErr_SetString(TyExc_TypeError, "codec is unexpected type");
        goto errorexit;
    }

    self->codec = ((MultibyteCodecObject *)codec)->codec;
    self->pending = NULL;
    self->errors = internal_error_callback(errors);
    if (self->errors == NULL)
        goto errorexit;
    if (self->codec->encinit != NULL &&
        self->codec->encinit(&self->state, self->codec) != 0)
        goto errorexit;

    Ty_DECREF(codec);
    return (TyObject *)self;

errorexit:
    Ty_XDECREF(self);
    Ty_XDECREF(codec);
    return NULL;
}

static int
mbiencoder_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    return 0;
}

static int
mbiencoder_traverse(TyObject *op, visitproc visit, void *arg)
{
    MultibyteIncrementalEncoderObject *self = _MultibyteIncrementalEncoderObject_CAST(op);
    if (ERROR_ISCUSTOM(self->errors))
        Ty_VISIT(self->errors);
    return 0;
}

static void
mbiencoder_dealloc(TyObject *op)
{
    MultibyteIncrementalEncoderObject *self = _MultibyteIncrementalEncoderObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    ERROR_DECREF(self->errors);
    Ty_CLEAR(self->pending);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot encoder_slots[] = {
    {Ty_tp_dealloc, mbiencoder_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, mbiencoder_traverse},
    {Ty_tp_methods, mbiencoder_methods},
    {Ty_tp_getset, codecctx_getsets},
    {Ty_tp_init, mbiencoder_init},
    {Ty_tp_new, mbiencoder_new},
    {0, NULL},
};

static TyType_Spec encoder_spec = {
    .name = MODULE_NAME ".MultibyteIncrementalEncoder",
    .basicsize = sizeof(MultibyteIncrementalEncoderObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = encoder_slots,
};


/*[clinic input]
_multibytecodec.MultibyteIncrementalDecoder.decode

    input: Ty_buffer
    final: bool = False
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_decode_impl(MultibyteIncrementalDecoderObject *self,
                                                        Ty_buffer *input,
                                                        int final)
/*[clinic end generated code: output=b9b9090e8a9ce2ba input=8795fbb20860027a]*/
{
    MultibyteDecodeBuffer buf;
    char *data, *wdata = NULL;
    Ty_ssize_t wsize, size, origpending;
    TyObject *res;

    data = input->buf;
    size = input->len;

    _PyUnicodeWriter_Init(&buf.writer);
    buf.excobj = NULL;
    origpending = self->pendingsize;

    if (self->pendingsize == 0) {
        wsize = size;
        wdata = data;
    }
    else {
        if (size > PY_SSIZE_T_MAX - self->pendingsize) {
            TyErr_NoMemory();
            goto errorexit;
        }
        wsize = size + self->pendingsize;
        wdata = TyMem_Malloc(wsize);
        if (wdata == NULL) {
            TyErr_NoMemory();
            goto errorexit;
        }
        memcpy(wdata, self->pending, self->pendingsize);
        memcpy(wdata + self->pendingsize, data, size);
        self->pendingsize = 0;
    }

    if (decoder_prepare_buffer(&buf, wdata, wsize) != 0)
        goto errorexit;

    if (decoder_feed_buffer(STATEFUL_DCTX(self), &buf))
        goto errorexit;

    if (final && buf.inbuf < buf.inbuf_end) {
        if (multibytecodec_decerror(self->codec, &self->state,
                        &buf, self->errors, MBERR_TOOFEW)) {
            /* recover the original pending buffer */
            memcpy(self->pending, wdata, origpending);
            self->pendingsize = origpending;
            goto errorexit;
        }
    }

    if (buf.inbuf < buf.inbuf_end) { /* pending sequence still exists */
        if (decoder_append_pending(STATEFUL_DCTX(self), &buf) != 0)
            goto errorexit;
    }

    res = _PyUnicodeWriter_Finish(&buf.writer);
    if (res == NULL)
        goto errorexit;

    if (wdata != data)
        TyMem_Free(wdata);
    Ty_XDECREF(buf.excobj);
    return res;

errorexit:
    if (wdata != NULL && wdata != data)
        TyMem_Free(wdata);
    Ty_XDECREF(buf.excobj);
    _PyUnicodeWriter_Dealloc(&buf.writer);
    return NULL;
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalDecoder.getstate
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_getstate_impl(MultibyteIncrementalDecoderObject *self)
/*[clinic end generated code: output=255009c4713b7f82 input=4006aa49bddbaa75]*/
{
    TyObject *buffer;
    TyObject *statelong;

    buffer = TyBytes_FromStringAndSize((const char *)self->pending,
                                       self->pendingsize);
    if (buffer == NULL) {
        return NULL;
    }

    statelong = (TyObject *)_TyLong_FromByteArray(self->state.c,
                                                  sizeof(self->state.c),
                                                  1 /* little-endian */ ,
                                                  0 /* unsigned */ );
    if (statelong == NULL) {
        Ty_DECREF(buffer);
        return NULL;
    }

    return Ty_BuildValue("NN", buffer, statelong);
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalDecoder.setstate
    state: object(subclass_of='&TyTuple_Type')
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_setstate_impl(MultibyteIncrementalDecoderObject *self,
                                                          TyObject *state)
/*[clinic end generated code: output=106b2fbca3e2dcc2 input=e5d794e8baba1a47]*/
{
    TyObject *buffer;
    PyLongObject *statelong;
    Ty_ssize_t buffersize;
    const char *bufferstr;
    unsigned char statebytes[8];

    if (!TyArg_ParseTuple(state, "SO!;setstate(): illegal state argument",
                          &buffer, &TyLong_Type, &statelong))
    {
        return NULL;
    }

    if (_TyLong_AsByteArray(statelong, statebytes, sizeof(statebytes),
                            1 /* little-endian */ ,
                            0 /* unsigned */ ,
                            1 /* with_exceptions */) < 0) {
        return NULL;
    }

    buffersize = TyBytes_Size(buffer);
    if (buffersize == -1) {
        return NULL;
    }

    if (buffersize > MAXDECPENDING) {
        TyObject *excobj = PyUnicodeDecodeError_Create(self->codec->encoding,
                                                       TyBytes_AS_STRING(buffer), buffersize,
                                                       0, buffersize,
                                                       "pending buffer too large");
        if (excobj == NULL) return NULL;
        TyErr_SetObject(TyExc_UnicodeDecodeError, excobj);
        Ty_DECREF(excobj);
        return NULL;
    }

    bufferstr = TyBytes_AsString(buffer);
    if (bufferstr == NULL) {
        return NULL;
    }
    self->pendingsize = buffersize;
    memcpy(self->pending, bufferstr, self->pendingsize);
    memcpy(self->state.c, statebytes, sizeof(statebytes));

    Py_RETURN_NONE;
}

/*[clinic input]
_multibytecodec.MultibyteIncrementalDecoder.reset
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteIncrementalDecoder_reset_impl(MultibyteIncrementalDecoderObject *self)
/*[clinic end generated code: output=da423b1782c23ed1 input=3b63b3be85b2fb45]*/
{
    if (self->codec->decreset != NULL &&
        self->codec->decreset(&self->state, self->codec) != 0)
        return NULL;
    self->pendingsize = 0;

    Py_RETURN_NONE;
}

static struct TyMethodDef mbidecoder_methods[] = {
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_DECODE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_GETSTATE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_SETSTATE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTEINCREMENTALDECODER_RESET_METHODDEF
    {NULL, NULL},
};

static TyObject *
mbidecoder_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    MultibyteIncrementalDecoderObject *self;
    TyObject *codec = NULL;
    char *errors = NULL;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|s:IncrementalDecoder",
                                     incnewkwarglist, &errors))
        return NULL;

    self = (MultibyteIncrementalDecoderObject *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    codec = PyObject_GetAttrString((TyObject *)type, "codec");
    if (codec == NULL)
        goto errorexit;

    module_state *state = find_state_by_def(type);
    if (!MultibyteCodec_Check(state, codec)) {
        TyErr_SetString(TyExc_TypeError, "codec is unexpected type");
        goto errorexit;
    }

    self->codec = ((MultibyteCodecObject *)codec)->codec;
    self->pendingsize = 0;
    self->errors = internal_error_callback(errors);
    if (self->errors == NULL)
        goto errorexit;
    if (self->codec->decinit != NULL &&
        self->codec->decinit(&self->state, self->codec) != 0)
        goto errorexit;

    Ty_DECREF(codec);
    return (TyObject *)self;

errorexit:
    Ty_XDECREF(self);
    Ty_XDECREF(codec);
    return NULL;
}

static int
mbidecoder_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    return 0;
}

static int
mbidecoder_traverse(TyObject *op, visitproc visit, void *arg)
{
    MultibyteIncrementalDecoderObject *self = _MultibyteIncrementalDecoderObject_CAST(op);
    if (ERROR_ISCUSTOM(self->errors))
        Ty_VISIT(self->errors);
    return 0;
}

static void
mbidecoder_dealloc(TyObject *op)
{
    MultibyteIncrementalDecoderObject *self = _MultibyteIncrementalDecoderObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    ERROR_DECREF(self->errors);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot decoder_slots[] = {
    {Ty_tp_dealloc, mbidecoder_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, mbidecoder_traverse},
    {Ty_tp_methods, mbidecoder_methods},
    {Ty_tp_getset, codecctx_getsets},
    {Ty_tp_init, mbidecoder_init},
    {Ty_tp_new, mbidecoder_new},
    {0, NULL},
};

static TyType_Spec decoder_spec = {
    .name = MODULE_NAME ".MultibyteIncrementalDecoder",
    .basicsize = sizeof(MultibyteIncrementalDecoderObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = decoder_slots,
};

static TyObject *
mbstreamreader_iread(MultibyteStreamReaderObject *self,
                     const char *method, Ty_ssize_t sizehint)
{
    MultibyteDecodeBuffer buf;
    TyObject *cres, *res;
    Ty_ssize_t rsize;

    if (sizehint == 0)
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);

    _PyUnicodeWriter_Init(&buf.writer);
    buf.excobj = NULL;
    cres = NULL;

    for (;;) {
        int endoffile;

        if (sizehint < 0)
            cres = PyObject_CallMethod(self->stream,
                            method, NULL);
        else
            cres = PyObject_CallMethod(self->stream,
                            method, "i", sizehint);
        if (cres == NULL)
            goto errorexit;

        if (!TyBytes_Check(cres)) {
            TyErr_Format(TyExc_TypeError,
                         "stream function returned a "
                         "non-bytes object (%.100s)",
                         Ty_TYPE(cres)->tp_name);
            goto errorexit;
        }

        endoffile = (TyBytes_GET_SIZE(cres) == 0);

        if (self->pendingsize > 0) {
            TyObject *ctr;
            char *ctrdata;

            if (TyBytes_GET_SIZE(cres) > PY_SSIZE_T_MAX - self->pendingsize) {
                TyErr_NoMemory();
                goto errorexit;
            }
            rsize = TyBytes_GET_SIZE(cres) + self->pendingsize;
            ctr = TyBytes_FromStringAndSize(NULL, rsize);
            if (ctr == NULL)
                goto errorexit;
            ctrdata = TyBytes_AS_STRING(ctr);
            memcpy(ctrdata, self->pending, self->pendingsize);
            memcpy(ctrdata + self->pendingsize,
                    TyBytes_AS_STRING(cres),
                    TyBytes_GET_SIZE(cres));
            Ty_SETREF(cres, ctr);
            self->pendingsize = 0;
        }

        rsize = TyBytes_GET_SIZE(cres);
        if (decoder_prepare_buffer(&buf, TyBytes_AS_STRING(cres),
                                   rsize) != 0)
            goto errorexit;

        if (rsize > 0 && decoder_feed_buffer(
                        (MultibyteStatefulDecoderContext *)self, &buf))
            goto errorexit;

        if (endoffile || sizehint < 0) {
            if (buf.inbuf < buf.inbuf_end &&
                multibytecodec_decerror(self->codec, &self->state,
                            &buf, self->errors, MBERR_TOOFEW))
                goto errorexit;
        }

        if (buf.inbuf < buf.inbuf_end) { /* pending sequence exists */
            if (decoder_append_pending(STATEFUL_DCTX(self),
                                       &buf) != 0)
                goto errorexit;
        }

        Ty_SETREF(cres, NULL);

        if (sizehint < 0 || buf.writer.pos != 0 || rsize == 0)
            break;

        sizehint = 1; /* read 1 more byte and retry */
    }

    res = _PyUnicodeWriter_Finish(&buf.writer);
    if (res == NULL)
        goto errorexit;

    Ty_XDECREF(cres);
    Ty_XDECREF(buf.excobj);
    return res;

errorexit:
    Ty_XDECREF(cres);
    Ty_XDECREF(buf.excobj);
    _PyUnicodeWriter_Dealloc(&buf.writer);
    return NULL;
}

/*[clinic input]
 _multibytecodec.MultibyteStreamReader.read

    sizeobj: object = None
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamReader_read_impl(MultibyteStreamReaderObject *self,
                                                TyObject *sizeobj)
/*[clinic end generated code: output=35621eb75355d5b8 input=015b0d3ff2fca485]*/
{
    Ty_ssize_t size;

    if (sizeobj == Ty_None)
        size = -1;
    else if (TyLong_Check(sizeobj))
        size = TyLong_AsSsize_t(sizeobj);
    else {
        TyErr_SetString(TyExc_TypeError, "arg 1 must be an integer");
        return NULL;
    }

    if (size == -1 && TyErr_Occurred())
        return NULL;

    return mbstreamreader_iread(self, "read", size);
}

/*[clinic input]
 _multibytecodec.MultibyteStreamReader.readline

    sizeobj: object = None
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamReader_readline_impl(MultibyteStreamReaderObject *self,
                                                    TyObject *sizeobj)
/*[clinic end generated code: output=4fbfaae1ed457a11 input=41ccc64f9bb0cec3]*/
{
    Ty_ssize_t size;

    if (sizeobj == Ty_None)
        size = -1;
    else if (TyLong_Check(sizeobj))
        size = TyLong_AsSsize_t(sizeobj);
    else {
        TyErr_SetString(TyExc_TypeError, "arg 1 must be an integer");
        return NULL;
    }

    if (size == -1 && TyErr_Occurred())
        return NULL;

    return mbstreamreader_iread(self, "readline", size);
}

/*[clinic input]
 _multibytecodec.MultibyteStreamReader.readlines

    sizehintobj: object = None
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamReader_readlines_impl(MultibyteStreamReaderObject *self,
                                                     TyObject *sizehintobj)
/*[clinic end generated code: output=e7c4310768ed2ad4 input=54932f5d4d88e880]*/
{
    TyObject *r, *sr;
    Ty_ssize_t sizehint;

    if (sizehintobj == Ty_None)
        sizehint = -1;
    else if (TyLong_Check(sizehintobj))
        sizehint = TyLong_AsSsize_t(sizehintobj);
    else {
        TyErr_SetString(TyExc_TypeError, "arg 1 must be an integer");
        return NULL;
    }

    if (sizehint == -1 && TyErr_Occurred())
        return NULL;

    r = mbstreamreader_iread(self, "read", sizehint);
    if (r == NULL)
        return NULL;

    sr = TyUnicode_Splitlines(r, 1);
    Ty_DECREF(r);
    return sr;
}

/*[clinic input]
 _multibytecodec.MultibyteStreamReader.reset
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamReader_reset_impl(MultibyteStreamReaderObject *self)
/*[clinic end generated code: output=138490370a680abc input=5d4140db84b5e1e2]*/
{
    if (self->codec->decreset != NULL &&
        self->codec->decreset(&self->state, self->codec) != 0)
        return NULL;
    self->pendingsize = 0;

    Py_RETURN_NONE;
}

static struct TyMethodDef mbstreamreader_methods[] = {
    _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READ_METHODDEF
    _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READLINE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTESTREAMREADER_READLINES_METHODDEF
    _MULTIBYTECODEC_MULTIBYTESTREAMREADER_RESET_METHODDEF
    {NULL,              NULL},
};

static TyMemberDef mbstreamreader_members[] = {
    {"stream",          _Ty_T_OBJECT,
                    offsetof(MultibyteStreamReaderObject, stream),
                    Py_READONLY, NULL},
    {NULL,}
};

static TyObject *
mbstreamreader_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    MultibyteStreamReaderObject *self;
    TyObject *stream, *codec = NULL;
    char *errors = NULL;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|s:StreamReader",
                            streamkwarglist, &stream, &errors))
        return NULL;

    self = (MultibyteStreamReaderObject *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    codec = PyObject_GetAttrString((TyObject *)type, "codec");
    if (codec == NULL)
        goto errorexit;

    module_state *state = find_state_by_def(type);
    if (!MultibyteCodec_Check(state, codec)) {
        TyErr_SetString(TyExc_TypeError, "codec is unexpected type");
        goto errorexit;
    }

    self->codec = ((MultibyteCodecObject *)codec)->codec;
    self->stream = Ty_NewRef(stream);
    self->pendingsize = 0;
    self->errors = internal_error_callback(errors);
    if (self->errors == NULL)
        goto errorexit;
    if (self->codec->decinit != NULL &&
        self->codec->decinit(&self->state, self->codec) != 0)
        goto errorexit;

    Ty_DECREF(codec);
    return (TyObject *)self;

errorexit:
    Ty_XDECREF(self);
    Ty_XDECREF(codec);
    return NULL;
}

static int
mbstreamreader_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    return 0;
}

static int
mbstreamreader_traverse(TyObject *op, visitproc visit, void *arg)
{
    MultibyteStreamReaderObject *self = _MultibyteStreamReaderObject_CAST(op);
    if (ERROR_ISCUSTOM(self->errors))
        Ty_VISIT(self->errors);
    Ty_VISIT(self->stream);
    return 0;
}

static void
mbstreamreader_dealloc(TyObject *op)
{
    MultibyteStreamReaderObject *self = _MultibyteStreamReaderObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    ERROR_DECREF(self->errors);
    Ty_XDECREF(self->stream);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot reader_slots[] = {
    {Ty_tp_dealloc, mbstreamreader_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, mbstreamreader_traverse},
    {Ty_tp_methods, mbstreamreader_methods},
    {Ty_tp_members, mbstreamreader_members},
    {Ty_tp_getset, codecctx_getsets},
    {Ty_tp_init, mbstreamreader_init},
    {Ty_tp_new, mbstreamreader_new},
    {0, NULL},
};

static TyType_Spec reader_spec = {
    .name = MODULE_NAME ".MultibyteStreamReader",
    .basicsize = sizeof(MultibyteStreamReaderObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = reader_slots,
};

static int
mbstreamwriter_iwrite(MultibyteStreamWriterObject *self,
                      TyObject *unistr, TyObject *str_write)
{
    TyObject *str, *wr;

    str = encoder_encode_stateful(STATEFUL_ECTX(self), unistr, 0);
    if (str == NULL)
        return -1;

    wr = PyObject_CallMethodOneArg(self->stream, str_write, str);
    Ty_DECREF(str);
    if (wr == NULL)
        return -1;

    Ty_DECREF(wr);
    return 0;
}

/*[clinic input]
 _multibytecodec.MultibyteStreamWriter.write

    cls: defining_class
    strobj: object
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamWriter_write_impl(MultibyteStreamWriterObject *self,
                                                 TyTypeObject *cls,
                                                 TyObject *strobj)
/*[clinic end generated code: output=68ade3aea26410ac input=199f26f68bd8425a]*/
{
    module_state *state = TyType_GetModuleState(cls);
    assert(state != NULL);
    if (mbstreamwriter_iwrite(self, strobj, state->str_write)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
 _multibytecodec.MultibyteStreamWriter.writelines

    cls: defining_class
    lines: object
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamWriter_writelines_impl(MultibyteStreamWriterObject *self,
                                                      TyTypeObject *cls,
                                                      TyObject *lines)
/*[clinic end generated code: output=b4c99d2cf23ffb88 input=a6d5fe7c74972a34]*/
{
    TyObject *strobj;
    int i, r;

    if (!PySequence_Check(lines)) {
        TyErr_SetString(TyExc_TypeError,
                        "arg must be a sequence object");
        return NULL;
    }

    module_state *state = TyType_GetModuleState(cls);
    assert(state != NULL);
    for (i = 0; i < PySequence_Length(lines); i++) {
        /* length can be changed even within this loop */
        strobj = PySequence_GetItem(lines, i);
        if (strobj == NULL)
            return NULL;

        r = mbstreamwriter_iwrite(self, strobj, state->str_write);
        Ty_DECREF(strobj);
        if (r == -1)
            return NULL;
    }
    /* PySequence_Length() can fail */
    if (TyErr_Occurred())
        return NULL;

    Py_RETURN_NONE;
}

/*[clinic input]
 _multibytecodec.MultibyteStreamWriter.reset

    cls: defining_class
    /

[clinic start generated code]*/

static TyObject *
_multibytecodec_MultibyteStreamWriter_reset_impl(MultibyteStreamWriterObject *self,
                                                 TyTypeObject *cls)
/*[clinic end generated code: output=32ef224c2a38aa3d input=28af6a9cd38d1979]*/
{
    TyObject *pwrt;

    if (!self->pending)
        Py_RETURN_NONE;

    pwrt = multibytecodec_encode(self->codec, &self->state,
                    self->pending, NULL, self->errors,
                    MBENC_FLUSH | MBENC_RESET);
    /* some pending buffer can be truncated when UnicodeEncodeError is
     * raised on 'strict' mode. but, 'reset' method is designed to
     * reset the pending buffer or states so failed string sequence
     * ought to be missed */
    Ty_CLEAR(self->pending);
    if (pwrt == NULL)
        return NULL;

    assert(TyBytes_Check(pwrt));

    module_state *state = TyType_GetModuleState(cls);
    assert(state != NULL);

    if (TyBytes_Size(pwrt) > 0) {
        TyObject *wr;

        wr = PyObject_CallMethodOneArg(self->stream, state->str_write, pwrt);
        if (wr == NULL) {
            Ty_DECREF(pwrt);
            return NULL;
        }
    }
    Ty_DECREF(pwrt);

    Py_RETURN_NONE;
}

static TyObject *
mbstreamwriter_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    MultibyteStreamWriterObject *self;
    TyObject *stream, *codec = NULL;
    char *errors = NULL;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|s:StreamWriter",
                            streamkwarglist, &stream, &errors))
        return NULL;

    self = (MultibyteStreamWriterObject *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    codec = PyObject_GetAttrString((TyObject *)type, "codec");
    if (codec == NULL)
        goto errorexit;

    module_state *state = find_state_by_def(type);
    if (!MultibyteCodec_Check(state, codec)) {
        TyErr_SetString(TyExc_TypeError, "codec is unexpected type");
        goto errorexit;
    }

    self->codec = ((MultibyteCodecObject *)codec)->codec;
    self->stream = Ty_NewRef(stream);
    self->pending = NULL;
    self->errors = internal_error_callback(errors);
    if (self->errors == NULL)
        goto errorexit;
    if (self->codec->encinit != NULL &&
        self->codec->encinit(&self->state, self->codec) != 0)
        goto errorexit;

    Ty_DECREF(codec);
    return (TyObject *)self;

errorexit:
    Ty_XDECREF(self);
    Ty_XDECREF(codec);
    return NULL;
}

static int
mbstreamwriter_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    return 0;
}

static int
mbstreamwriter_traverse(TyObject *op, visitproc visit, void *arg)
{
    MultibyteStreamWriterObject *self = _MultibyteStreamWriterObject_CAST(op);
    if (ERROR_ISCUSTOM(self->errors))
        Ty_VISIT(self->errors);
    Ty_VISIT(self->stream);
    return 0;
}

static void
mbstreamwriter_dealloc(TyObject *op)
{
    MultibyteStreamWriterObject *self = _MultibyteStreamWriterObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    ERROR_DECREF(self->errors);
    Ty_XDECREF(self->stream);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static struct TyMethodDef mbstreamwriter_methods[] = {
    _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_WRITE_METHODDEF
    _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_WRITELINES_METHODDEF
    _MULTIBYTECODEC_MULTIBYTESTREAMWRITER_RESET_METHODDEF
    {NULL, NULL},
};

static TyMemberDef mbstreamwriter_members[] = {
    {"stream",          _Ty_T_OBJECT,
                    offsetof(MultibyteStreamWriterObject, stream),
                    Py_READONLY, NULL},
    {NULL,}
};

static TyType_Slot writer_slots[] = {
    {Ty_tp_dealloc, mbstreamwriter_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, mbstreamwriter_traverse},
    {Ty_tp_methods, mbstreamwriter_methods},
    {Ty_tp_members, mbstreamwriter_members},
    {Ty_tp_getset, codecctx_getsets},
    {Ty_tp_init, mbstreamwriter_init},
    {Ty_tp_new, mbstreamwriter_new},
    {0, NULL},
};

static TyType_Spec writer_spec = {
    .name = MODULE_NAME ".MultibyteStreamWriter",
    .basicsize = sizeof(MultibyteStreamWriterObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = writer_slots,
};


/*[clinic input]
_multibytecodec.__create_codec

    arg: object
    /
[clinic start generated code]*/

static TyObject *
_multibytecodec___create_codec(TyObject *module, TyObject *arg)
/*[clinic end generated code: output=cfa3dce8260e809d input=6840b2a6b183fcfa]*/
{
    MultibyteCodecObject *self;

    if (!PyCapsule_IsValid(arg, CODEC_CAPSULE)) {
        TyErr_SetString(TyExc_ValueError, "argument type invalid");
        return NULL;
    }

    codec_capsule *data = PyCapsule_GetPointer(arg, CODEC_CAPSULE);
    const MultibyteCodec *codec = data->codec;
    if (codec->codecinit != NULL && codec->codecinit(codec) != 0)
        return NULL;

    module_state *state = get_module_state(module);
    self = PyObject_GC_New(MultibyteCodecObject, state->multibytecodec_type);
    if (self == NULL)
        return NULL;
    self->codec = codec;
    self->cjk_module = Ty_NewRef(data->cjk_module);

    PyObject_GC_Track(self);
    return (TyObject *)self;
}

static int
_multibytecodec_traverse(TyObject *mod, visitproc visit, void *arg)
{
    module_state *state = get_module_state(mod);
    Ty_VISIT(state->multibytecodec_type);
    Ty_VISIT(state->encoder_type);
    Ty_VISIT(state->decoder_type);
    Ty_VISIT(state->reader_type);
    Ty_VISIT(state->writer_type);
    return 0;
}

static int
_multibytecodec_clear(TyObject *mod)
{
    module_state *state = get_module_state(mod);
    Ty_CLEAR(state->multibytecodec_type);
    Ty_CLEAR(state->encoder_type);
    Ty_CLEAR(state->decoder_type);
    Ty_CLEAR(state->reader_type);
    Ty_CLEAR(state->writer_type);
    Ty_CLEAR(state->str_write);
    return 0;
}

static void
_multibytecodec_free(void *mod)
{
    (void)_multibytecodec_clear((TyObject *)mod);
}

#define CREATE_TYPE(module, type, spec)                                      \
    do {                                                                     \
        type = (TyTypeObject *)TyType_FromModuleAndSpec(module, spec, NULL); \
        if (!type) {                                                         \
            return -1;                                                       \
        }                                                                    \
    } while (0)

#define ADD_TYPE(module, type)                    \
    do {                                          \
        if (TyModule_AddType(module, type) < 0) { \
            return -1;                            \
        }                                         \
    } while (0)

static int
_multibytecodec_exec(TyObject *mod)
{
    module_state *state = get_module_state(mod);
    state->str_write = TyUnicode_InternFromString("write");
    if (state->str_write == NULL) {
        return -1;
    }
    CREATE_TYPE(mod, state->multibytecodec_type, &multibytecodec_spec);
    CREATE_TYPE(mod, state->encoder_type, &encoder_spec);
    CREATE_TYPE(mod, state->decoder_type, &decoder_spec);
    CREATE_TYPE(mod, state->reader_type, &reader_spec);
    CREATE_TYPE(mod, state->writer_type, &writer_spec);

    ADD_TYPE(mod, state->encoder_type);
    ADD_TYPE(mod, state->decoder_type);
    ADD_TYPE(mod, state->reader_type);
    ADD_TYPE(mod, state->writer_type);
    return 0;
}

#undef CREATE_TYPE
#undef ADD_TYPE

static struct TyMethodDef _multibytecodec_methods[] = {
    _MULTIBYTECODEC___CREATE_CODEC_METHODDEF
    {NULL, NULL},
};

static PyModuleDef_Slot _multibytecodec_slots[] = {
    {Ty_mod_exec, _multibytecodec_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _multibytecodecmodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_multibytecodec",
    .m_size = sizeof(module_state),
    .m_methods = _multibytecodec_methods,
    .m_slots = _multibytecodec_slots,
    .m_traverse = _multibytecodec_traverse,
    .m_clear = _multibytecodec_clear,
    .m_free = _multibytecodec_free,
};

PyMODINIT_FUNC
PyInit__multibytecodec(void)
{
    return PyModuleDef_Init(&_multibytecodecmodule);
}
