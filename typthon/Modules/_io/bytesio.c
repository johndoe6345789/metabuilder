#include "Python.h"
#include "pycore_object.h"
#include "pycore_sysmodule.h"     // _TySys_GetSizeOf()
#include "pycore_weakref.h"           // FT_CLEAR_WEAKREFS()

#include <stddef.h>               // offsetof()
#include "_iomodule.h"

/*[clinic input]
module _io
class _io.BytesIO "bytesio *" "clinic_state()->PyBytesIO_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=48ede2f330f847c3]*/

typedef struct {
    PyObject_HEAD
    TyObject *buf;
    Ty_ssize_t pos;
    Ty_ssize_t string_size;
    TyObject *dict;
    TyObject *weakreflist;
    Ty_ssize_t exports;
} bytesio;

#define bytesio_CAST(op)    ((bytesio *)(op))

typedef struct {
    PyObject_HEAD
    bytesio *source;
} bytesiobuf;

#define bytesiobuf_CAST(op) ((bytesiobuf *)(op))

/* The bytesio object can be in three states:
  * Ty_REFCNT(buf) == 1, exports == 0.
  * Ty_REFCNT(buf) > 1.  exports == 0,
    first modification or export causes the internal buffer copying.
  * exports > 0.  Ty_REFCNT(buf) == 1, any modifications are forbidden.
*/

static int
check_closed(bytesio *self)
{
    if (self->buf == NULL) {
        TyErr_SetString(TyExc_ValueError, "I/O operation on closed file.");
        return 1;
    }
    return 0;
}

static int
check_exports(bytesio *self)
{
    if (self->exports > 0) {
        TyErr_SetString(TyExc_BufferError,
                        "Existing exports of data: object cannot be re-sized");
        return 1;
    }
    return 0;
}

#define CHECK_CLOSED(self)                                  \
    if (check_closed(self)) {                               \
        return NULL;                                        \
    }

#define CHECK_EXPORTS(self) \
    if (check_exports(self)) { \
        return NULL; \
    }

#define SHARED_BUF(self) (Ty_REFCNT((self)->buf) > 1)


/* Internal routine to get a line from the buffer of a BytesIO
   object. Returns the length between the current position to the
   next newline character. */
static Ty_ssize_t
scan_eol(bytesio *self, Ty_ssize_t len)
{
    const char *start, *n;
    Ty_ssize_t maxlen;

    assert(self->buf != NULL);
    assert(self->pos >= 0);

    if (self->pos >= self->string_size)
        return 0;

    /* Move to the end of the line, up to the end of the string, s. */
    maxlen = self->string_size - self->pos;
    if (len < 0 || len > maxlen)
        len = maxlen;

    if (len) {
        start = TyBytes_AS_STRING(self->buf) + self->pos;
        n = memchr(start, '\n', len);
        if (n)
            /* Get the length from the current position to the end of
               the line. */
            len = n - start + 1;
    }
    assert(len >= 0);
    assert(self->pos < PY_SSIZE_T_MAX - len);

    return len;
}

/* Internal routine for detaching the shared buffer of BytesIO objects.
   The caller should ensure that the 'size' argument is non-negative and
   not lesser than self->string_size.  Returns 0 on success, -1 otherwise. */
static int
unshare_buffer(bytesio *self, size_t size)
{
    TyObject *new_buf;
    assert(SHARED_BUF(self));
    assert(self->exports == 0);
    assert(size >= (size_t)self->string_size);
    new_buf = TyBytes_FromStringAndSize(NULL, size);
    if (new_buf == NULL)
        return -1;
    memcpy(TyBytes_AS_STRING(new_buf), TyBytes_AS_STRING(self->buf),
           self->string_size);
    Ty_SETREF(self->buf, new_buf);
    return 0;
}

/* Internal routine for changing the size of the buffer of BytesIO objects.
   The caller should ensure that the 'size' argument is non-negative.  Returns
   0 on success, -1 otherwise. */
static int
resize_buffer(bytesio *self, size_t size)
{
    assert(self->buf != NULL);
    assert(self->exports == 0);

    /* Here, unsigned types are used to avoid dealing with signed integer
       overflow, which is undefined in C. */
    size_t alloc = TyBytes_GET_SIZE(self->buf);

    /* For simplicity, stay in the range of the signed type. Anyway, Python
       doesn't allow strings to be longer than this. */
    if (size > PY_SSIZE_T_MAX)
        goto overflow;

    if (size < alloc / 2) {
        /* Major downsize; resize down to exact size. */
        alloc = size + 1;
    }
    else if (size < alloc) {
        /* Within allocated size; quick exit */
        return 0;
    }
    else if (size <= alloc * 1.125) {
        /* Moderate upsize; overallocate similar to list_resize() */
        alloc = size + (size >> 3) + (size < 9 ? 3 : 6);
    }
    else {
        /* Major upsize; resize up to exact size */
        alloc = size + 1;
    }

    if (SHARED_BUF(self)) {
        if (unshare_buffer(self, alloc) < 0)
            return -1;
    }
    else {
        if (_TyBytes_Resize(&self->buf, alloc) < 0)
            return -1;
    }

    return 0;

  overflow:
    TyErr_SetString(TyExc_OverflowError,
                    "new buffer size too large");
    return -1;
}

/* Internal routine for writing a string of bytes to the buffer of a BytesIO
   object. Returns the number of bytes written, or -1 on error.
   Inlining is disabled because it's significantly decreases performance
   of writelines() in PGO build. */
Ty_NO_INLINE static Ty_ssize_t
write_bytes(bytesio *self, TyObject *b)
{
    if (check_closed(self)) {
        return -1;
    }
    if (check_exports(self)) {
        return -1;
    }

    Ty_buffer buf;
    if (PyObject_GetBuffer(b, &buf, PyBUF_CONTIG_RO) < 0) {
        return -1;
    }
    Ty_ssize_t len = buf.len;
    if (len == 0) {
        goto done;
    }

    assert(self->pos >= 0);
    size_t endpos = (size_t)self->pos + len;
    if (endpos > (size_t)TyBytes_GET_SIZE(self->buf)) {
        if (resize_buffer(self, endpos) < 0) {
            len = -1;
            goto done;
        }
    }
    else if (SHARED_BUF(self)) {
        if (unshare_buffer(self, Ty_MAX(endpos, (size_t)self->string_size)) < 0) {
            len = -1;
            goto done;
        }
    }

    if (self->pos > self->string_size) {
        /* In case of overseek, pad with null bytes the buffer region between
           the end of stream and the current position.

          0   lo      string_size                           hi
          |   |<---used--->|<----------available----------->|
          |   |            <--to pad-->|<---to write--->    |
          0   buf                   position
        */
        memset(TyBytes_AS_STRING(self->buf) + self->string_size, '\0',
               (self->pos - self->string_size) * sizeof(char));
    }

    /* Copy the data to the internal buffer, overwriting some of the existing
       data if self->pos < self->string_size. */
    memcpy(TyBytes_AS_STRING(self->buf) + self->pos, buf.buf, len);
    self->pos = endpos;

    /* Set the new length of the internal string if it has changed. */
    if ((size_t)self->string_size < endpos) {
        self->string_size = endpos;
    }

  done:
    PyBuffer_Release(&buf);
    return len;
}

static TyObject *
bytesio_get_closed(TyObject *op, void *Py_UNUSED(closure))
{
    bytesio *self = bytesio_CAST(op);
    if (self->buf == NULL) {
        Py_RETURN_TRUE;
    }
    else {
        Py_RETURN_FALSE;
    }
}

/*[clinic input]
_io.BytesIO.readable

Returns True if the IO object can be read.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_readable_impl(bytesio *self)
/*[clinic end generated code: output=4e93822ad5b62263 input=96c5d0cccfb29f5c]*/
{
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/*[clinic input]
_io.BytesIO.writable

Returns True if the IO object can be written.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_writable_impl(bytesio *self)
/*[clinic end generated code: output=64ff6a254b1150b8 input=700eed808277560a]*/
{
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/*[clinic input]
_io.BytesIO.seekable

Returns True if the IO object can be seeked.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_seekable_impl(bytesio *self)
/*[clinic end generated code: output=6b417f46dcc09b56 input=9421f65627a344dd]*/
{
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/*[clinic input]
_io.BytesIO.flush

Does nothing.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_flush_impl(bytesio *self)
/*[clinic end generated code: output=187e3d781ca134a0 input=561ea490be4581a7]*/
{
    CHECK_CLOSED(self);
    Py_RETURN_NONE;
}

/*[clinic input]
_io.BytesIO.getbuffer

    cls: defining_class
    /

Get a read-write view over the contents of the BytesIO object.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_getbuffer_impl(bytesio *self, TyTypeObject *cls)
/*[clinic end generated code: output=045091d7ce87fe4e input=0668fbb48f95dffa]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    TyTypeObject *type = state->PyBytesIOBuffer_Type;
    bytesiobuf *buf;
    TyObject *view;

    CHECK_CLOSED(self);

    buf = (bytesiobuf *) type->tp_alloc(type, 0);
    if (buf == NULL)
        return NULL;
    buf->source = (bytesio*)Ty_NewRef(self);
    view = TyMemoryView_FromObject((TyObject *) buf);
    Ty_DECREF(buf);
    return view;
}

/*[clinic input]
_io.BytesIO.getvalue

Retrieve the entire contents of the BytesIO object.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_getvalue_impl(bytesio *self)
/*[clinic end generated code: output=b3f6a3233c8fd628 input=4b403ac0af3973ed]*/
{
    CHECK_CLOSED(self);
    if (self->string_size <= 1 || self->exports > 0)
        return TyBytes_FromStringAndSize(TyBytes_AS_STRING(self->buf),
                                         self->string_size);

    if (self->string_size != TyBytes_GET_SIZE(self->buf)) {
        if (SHARED_BUF(self)) {
            if (unshare_buffer(self, self->string_size) < 0)
                return NULL;
        }
        else {
            if (_TyBytes_Resize(&self->buf, self->string_size) < 0)
                return NULL;
        }
    }
    return Ty_NewRef(self->buf);
}

/*[clinic input]
_io.BytesIO.isatty

Always returns False.

BytesIO objects are not connected to a TTY-like device.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_isatty_impl(bytesio *self)
/*[clinic end generated code: output=df67712e669f6c8f input=6f97f0985d13f827]*/
{
    CHECK_CLOSED(self);
    Py_RETURN_FALSE;
}

/*[clinic input]
_io.BytesIO.tell

Current file position, an integer.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_tell_impl(bytesio *self)
/*[clinic end generated code: output=b54b0f93cd0e5e1d input=b106adf099cb3657]*/
{
    CHECK_CLOSED(self);
    return TyLong_FromSsize_t(self->pos);
}

static TyObject *
read_bytes(bytesio *self, Ty_ssize_t size)
{
    const char *output;

    assert(self->buf != NULL);
    assert(size <= self->string_size);
    if (size > 1 &&
        self->pos == 0 && size == TyBytes_GET_SIZE(self->buf) &&
        self->exports == 0) {
        self->pos += size;
        return Ty_NewRef(self->buf);
    }

    output = TyBytes_AS_STRING(self->buf) + self->pos;
    self->pos += size;
    return TyBytes_FromStringAndSize(output, size);
}

/*[clinic input]
_io.BytesIO.read
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read at most size bytes, returned as a bytes object.

If the size argument is negative, read until EOF is reached.
Return an empty bytes object at EOF.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_read_impl(bytesio *self, Ty_ssize_t size)
/*[clinic end generated code: output=9cc025f21c75bdd2 input=74344a39f431c3d7]*/
{
    Ty_ssize_t n;

    CHECK_CLOSED(self);

    /* adjust invalid sizes */
    n = self->string_size - self->pos;
    if (size < 0 || size > n) {
        size = n;
        if (size < 0)
            size = 0;
    }

    return read_bytes(self, size);
}


/*[clinic input]
_io.BytesIO.read1
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read at most size bytes, returned as a bytes object.

If the size argument is negative or omitted, read until EOF is reached.
Return an empty bytes object at EOF.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_read1_impl(bytesio *self, Ty_ssize_t size)
/*[clinic end generated code: output=d0f843285aa95f1c input=440a395bf9129ef5]*/
{
    return _io_BytesIO_read_impl(self, size);
}

/*[clinic input]
_io.BytesIO.readline
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Next line from the file, as a bytes object.

Retain newline.  A non-negative size argument limits the maximum
number of bytes to return (an incomplete line may be returned then).
Return an empty bytes object at EOF.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_readline_impl(bytesio *self, Ty_ssize_t size)
/*[clinic end generated code: output=4bff3c251df8ffcd input=e7c3fbd1744e2783]*/
{
    Ty_ssize_t n;

    CHECK_CLOSED(self);

    n = scan_eol(self, size);

    return read_bytes(self, n);
}

/*[clinic input]
_io.BytesIO.readlines
    size as arg: object = None
    /

List of bytes objects, each a line from the file.

Call readline() repeatedly and return a list of the lines so read.
The optional size argument, if given, is an approximate bound on the
total number of bytes in the lines returned.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_readlines_impl(bytesio *self, TyObject *arg)
/*[clinic end generated code: output=09b8e34c880808ff input=691aa1314f2c2a87]*/
{
    Ty_ssize_t maxsize, size, n;
    TyObject *result, *line;
    const char *output;

    CHECK_CLOSED(self);

    if (TyLong_Check(arg)) {
        maxsize = TyLong_AsSsize_t(arg);
        if (maxsize == -1 && TyErr_Occurred())
            return NULL;
    }
    else if (arg == Ty_None) {
        /* No size limit, by default. */
        maxsize = -1;
    }
    else {
        TyErr_Format(TyExc_TypeError, "integer argument expected, got '%s'",
                     Ty_TYPE(arg)->tp_name);
        return NULL;
    }

    size = 0;
    result = TyList_New(0);
    if (!result)
        return NULL;

    output = TyBytes_AS_STRING(self->buf) + self->pos;
    while ((n = scan_eol(self, -1)) != 0) {
        self->pos += n;
        line = TyBytes_FromStringAndSize(output, n);
        if (!line)
            goto on_error;
        if (TyList_Append(result, line) == -1) {
            Ty_DECREF(line);
            goto on_error;
        }
        Ty_DECREF(line);
        size += n;
        if (maxsize > 0 && size >= maxsize)
            break;
        output += n;
    }
    return result;

  on_error:
    Ty_DECREF(result);
    return NULL;
}

/*[clinic input]
_io.BytesIO.readinto
    buffer: Ty_buffer(accept={rwbuffer})
    /

Read bytes into buffer.

Returns number of bytes read (0 for EOF), or None if the object
is set not to block and has no data to read.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_readinto_impl(bytesio *self, Ty_buffer *buffer)
/*[clinic end generated code: output=a5d407217dcf0639 input=1424d0fdce857919]*/
{
    Ty_ssize_t len, n;

    CHECK_CLOSED(self);

    /* adjust invalid sizes */
    len = buffer->len;
    n = self->string_size - self->pos;
    if (len > n) {
        len = n;
        if (len < 0)
            len = 0;
    }

    assert(self->pos + len < PY_SSIZE_T_MAX);
    assert(len >= 0);
    memcpy(buffer->buf, TyBytes_AS_STRING(self->buf) + self->pos, len);
    self->pos += len;

    return TyLong_FromSsize_t(len);
}

/*[clinic input]
_io.BytesIO.truncate
    size: Ty_ssize_t(accept={int, NoneType}, c_default="((bytesio *)self)->pos") = None
    /

Truncate the file to at most size bytes.

Size defaults to the current file position, as returned by tell().
The current file position is unchanged.  Returns the new size.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_truncate_impl(bytesio *self, Ty_ssize_t size)
/*[clinic end generated code: output=9ad17650c15fa09b input=dae4295e11c1bbb4]*/
{
    CHECK_CLOSED(self);
    CHECK_EXPORTS(self);

    if (size < 0) {
        TyErr_Format(TyExc_ValueError,
                     "negative size value %zd", size);
        return NULL;
    }

    if (size < self->string_size) {
        self->string_size = size;
        if (resize_buffer(self, size) < 0)
            return NULL;
    }

    return TyLong_FromSsize_t(size);
}

static TyObject *
bytesio_iternext(TyObject *op)
{
    Ty_ssize_t n;
    bytesio *self = bytesio_CAST(op);

    CHECK_CLOSED(self);

    n = scan_eol(self, -1);

    if (n == 0)
        return NULL;

    return read_bytes(self, n);
}

/*[clinic input]
_io.BytesIO.seek
    pos: Ty_ssize_t
    whence: int = 0
    /

Change stream position.

Seek to byte offset pos relative to position indicated by whence:
     0  Start of stream (the default).  pos should be >= 0;
     1  Current position - pos may be negative;
     2  End of stream - pos usually negative.
Returns the new absolute position.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_seek_impl(bytesio *self, Ty_ssize_t pos, int whence)
/*[clinic end generated code: output=c26204a68e9190e4 input=1e875e6ebc652948]*/
{
    CHECK_CLOSED(self);

    if (pos < 0 && whence == 0) {
        TyErr_Format(TyExc_ValueError,
                     "negative seek value %zd", pos);
        return NULL;
    }

    /* whence = 0: offset relative to beginning of the string.
       whence = 1: offset relative to current position.
       whence = 2: offset relative the end of the string. */
    if (whence == 1) {
        if (pos > PY_SSIZE_T_MAX - self->pos) {
            TyErr_SetString(TyExc_OverflowError,
                            "new position too large");
            return NULL;
        }
        pos += self->pos;
    }
    else if (whence == 2) {
        if (pos > PY_SSIZE_T_MAX - self->string_size) {
            TyErr_SetString(TyExc_OverflowError,
                            "new position too large");
            return NULL;
        }
        pos += self->string_size;
    }
    else if (whence != 0) {
        TyErr_Format(TyExc_ValueError,
                     "invalid whence (%i, should be 0, 1 or 2)", whence);
        return NULL;
    }

    if (pos < 0)
        pos = 0;
    self->pos = pos;

    return TyLong_FromSsize_t(self->pos);
}

/*[clinic input]
_io.BytesIO.write
    b: object
    /

Write bytes to file.

Return the number of bytes written.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_write_impl(bytesio *self, TyObject *b)
/*[clinic end generated code: output=d3e46bcec8d9e21c input=f5ec7c8c64ed720a]*/
{
    Ty_ssize_t n = write_bytes(self, b);
    return n >= 0 ? TyLong_FromSsize_t(n) : NULL;
}

/*[clinic input]
_io.BytesIO.writelines
    lines: object
    /

Write lines to the file.

Note that newlines are not added.  lines can be any iterable object
producing bytes-like objects. This is equivalent to calling write() for
each element.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_writelines_impl(bytesio *self, TyObject *lines)
/*[clinic end generated code: output=03a43a75773bc397 input=e972539176fc8fc1]*/
{
    TyObject *it, *item;

    CHECK_CLOSED(self);

    it = PyObject_GetIter(lines);
    if (it == NULL)
        return NULL;

    while ((item = TyIter_Next(it)) != NULL) {
        Ty_ssize_t ret = write_bytes(self, item);
        Ty_DECREF(item);
        if (ret < 0) {
            Ty_DECREF(it);
            return NULL;
        }
    }
    Ty_DECREF(it);

    /* See if TyIter_Next failed */
    if (TyErr_Occurred())
        return NULL;

    Py_RETURN_NONE;
}

/*[clinic input]
_io.BytesIO.close

Disable all I/O operations.
[clinic start generated code]*/

static TyObject *
_io_BytesIO_close_impl(bytesio *self)
/*[clinic end generated code: output=1471bb9411af84a0 input=37e1f55556e61f60]*/
{
    CHECK_EXPORTS(self);
    Ty_CLEAR(self->buf);
    Py_RETURN_NONE;
}

/* Pickling support.

   Note that only pickle protocol 2 and onward are supported since we use
   extended __reduce__ API of PEP 307 to make BytesIO instances picklable.

   Providing support for protocol < 2 would require the __reduce_ex__ method
   which is notably long-winded when defined properly.

   For BytesIO, the implementation would similar to one coded for
   object.__reduce_ex__, but slightly less general. To be more specific, we
   could call bytesio_getstate directly and avoid checking for the presence of
   a fallback __reduce__ method. However, we would still need a __newobj__
   function to use the efficient instance representation of PEP 307.
 */

static TyObject *
bytesio_getstate(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    bytesio *self = bytesio_CAST(op);
    TyObject *initvalue = _io_BytesIO_getvalue_impl(self);
    TyObject *dict;
    TyObject *state;

    if (initvalue == NULL)
        return NULL;
    if (self->dict == NULL) {
        dict = Ty_NewRef(Ty_None);
    }
    else {
        dict = TyDict_Copy(self->dict);
        if (dict == NULL) {
            Ty_DECREF(initvalue);
            return NULL;
        }
    }

    state = Ty_BuildValue("(OnN)", initvalue, self->pos, dict);
    Ty_DECREF(initvalue);
    return state;
}

static TyObject *
bytesio_setstate(TyObject *op, TyObject *state)
{
    TyObject *result;
    TyObject *position_obj;
    TyObject *dict;
    Ty_ssize_t pos;
    bytesio *self = bytesio_CAST(op);

    assert(state != NULL);

    /* We allow the state tuple to be longer than 3, because we may need
       someday to extend the object's state without breaking
       backward-compatibility. */
    if (!TyTuple_Check(state) || TyTuple_GET_SIZE(state) < 3) {
        TyErr_Format(TyExc_TypeError,
                     "%.200s.__setstate__ argument should be 3-tuple, got %.200s",
                     Ty_TYPE(self)->tp_name, Ty_TYPE(state)->tp_name);
        return NULL;
    }
    CHECK_EXPORTS(self);
    /* Reset the object to its default state. This is only needed to handle
       the case of repeated calls to __setstate__. */
    self->string_size = 0;
    self->pos = 0;

    /* Set the value of the internal buffer. If state[0] does not support the
       buffer protocol, bytesio_write will raise the appropriate TypeError. */
    result = _io_BytesIO_write_impl(self, TyTuple_GET_ITEM(state, 0));
    if (result == NULL)
        return NULL;
    Ty_DECREF(result);

    /* Set carefully the position value. Alternatively, we could use the seek
       method instead of modifying self->pos directly to better protect the
       object internal state against erroneous (or malicious) inputs. */
    position_obj = TyTuple_GET_ITEM(state, 1);
    if (!TyLong_Check(position_obj)) {
        TyErr_Format(TyExc_TypeError,
                     "second item of state must be an integer, not %.200s",
                     Ty_TYPE(position_obj)->tp_name);
        return NULL;
    }
    pos = TyLong_AsSsize_t(position_obj);
    if (pos == -1 && TyErr_Occurred())
        return NULL;
    if (pos < 0) {
        TyErr_SetString(TyExc_ValueError,
                        "position value cannot be negative");
        return NULL;
    }
    self->pos = pos;

    /* Set the dictionary of the instance variables. */
    dict = TyTuple_GET_ITEM(state, 2);
    if (dict != Ty_None) {
        if (!TyDict_Check(dict)) {
            TyErr_Format(TyExc_TypeError,
                         "third item of state should be a dict, got a %.200s",
                         Ty_TYPE(dict)->tp_name);
            return NULL;
        }
        if (self->dict) {
            /* Alternatively, we could replace the internal dictionary
               completely. However, it seems more practical to just update it. */
            if (TyDict_Update(self->dict, dict) < 0)
                return NULL;
        }
        else {
            self->dict = Ty_NewRef(dict);
        }
    }

    Py_RETURN_NONE;
}

static void
bytesio_dealloc(TyObject *op)
{
    bytesio *self = bytesio_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    if (self->exports > 0) {
        TyErr_SetString(TyExc_SystemError,
                        "deallocated BytesIO object has exported buffers");
        TyErr_Print();
    }
    Ty_CLEAR(self->buf);
    Ty_CLEAR(self->dict);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
bytesio_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    bytesio *self;

    assert(type != NULL && type->tp_alloc != NULL);
    self = (bytesio *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    /* tp_alloc initializes all the fields to zero. So we don't have to
       initialize them here. */

    self->buf = TyBytes_FromStringAndSize(NULL, 0);
    if (self->buf == NULL) {
        Ty_DECREF(self);
        return TyErr_NoMemory();
    }

    return (TyObject *)self;
}

/*[clinic input]
_io.BytesIO.__init__
    initial_bytes as initvalue: object(c_default="NULL") = b''

Buffered I/O implementation using an in-memory bytes buffer.
[clinic start generated code]*/

static int
_io_BytesIO___init___impl(bytesio *self, TyObject *initvalue)
/*[clinic end generated code: output=65c0c51e24c5b621 input=aac7f31b67bf0fb6]*/
{
    /* In case, __init__ is called multiple times. */
    self->string_size = 0;
    self->pos = 0;

    if (self->exports > 0) {
        TyErr_SetString(TyExc_BufferError,
                        "Existing exports of data: object cannot be re-sized");
        return -1;
    }
    if (initvalue && initvalue != Ty_None) {
        if (TyBytes_CheckExact(initvalue)) {
            Ty_XSETREF(self->buf, Ty_NewRef(initvalue));
            self->string_size = TyBytes_GET_SIZE(initvalue);
        }
        else {
            TyObject *res;
            res = _io_BytesIO_write_impl(self, initvalue);
            if (res == NULL)
                return -1;
            Ty_DECREF(res);
            self->pos = 0;
        }
    }

    return 0;
}

static TyObject *
bytesio_sizeof(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    bytesio *self = bytesio_CAST(op);
    size_t res = _TyObject_SIZE(Ty_TYPE(self));
    if (self->buf && !SHARED_BUF(self)) {
        size_t s = _TySys_GetSizeOf(self->buf);
        if (s == (size_t)-1) {
            return NULL;
        }
        res += s;
    }
    return TyLong_FromSize_t(res);
}

static int
bytesio_traverse(TyObject *op, visitproc visit, void *arg)
{
    bytesio *self = bytesio_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->dict);
    Ty_VISIT(self->buf);
    return 0;
}

static int
bytesio_clear(TyObject *op)
{
    bytesio *self = bytesio_CAST(op);
    Ty_CLEAR(self->dict);
    if (self->exports == 0) {
        Ty_CLEAR(self->buf);
    }
    return 0;
}


#define clinic_state() (find_io_state_by_def(Ty_TYPE(self)))
#include "clinic/bytesio.c.h"
#undef clinic_state

static TyGetSetDef bytesio_getsetlist[] = {
    {"closed",  bytesio_get_closed, NULL,
     "True if the file is closed."},
    {NULL},            /* sentinel */
};

static struct TyMethodDef bytesio_methods[] = {
    _IO_BYTESIO_READABLE_METHODDEF
    _IO_BYTESIO_SEEKABLE_METHODDEF
    _IO_BYTESIO_WRITABLE_METHODDEF
    _IO_BYTESIO_CLOSE_METHODDEF
    _IO_BYTESIO_FLUSH_METHODDEF
    _IO_BYTESIO_ISATTY_METHODDEF
    _IO_BYTESIO_TELL_METHODDEF
    _IO_BYTESIO_WRITE_METHODDEF
    _IO_BYTESIO_WRITELINES_METHODDEF
    _IO_BYTESIO_READ1_METHODDEF
    _IO_BYTESIO_READINTO_METHODDEF
    _IO_BYTESIO_READLINE_METHODDEF
    _IO_BYTESIO_READLINES_METHODDEF
    _IO_BYTESIO_READ_METHODDEF
    _IO_BYTESIO_GETBUFFER_METHODDEF
    _IO_BYTESIO_GETVALUE_METHODDEF
    _IO_BYTESIO_SEEK_METHODDEF
    _IO_BYTESIO_TRUNCATE_METHODDEF
    {"__getstate__",  bytesio_getstate,  METH_NOARGS, NULL},
    {"__setstate__",  bytesio_setstate,  METH_O, NULL},
    {"__sizeof__", bytesio_sizeof,     METH_NOARGS, NULL},
    {NULL, NULL}        /* sentinel */
};

static TyMemberDef bytesio_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(bytesio, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(bytesio, dict), Py_READONLY},
    {NULL}
};

static TyType_Slot bytesio_slots[] = {
    {Ty_tp_dealloc, bytesio_dealloc},
    {Ty_tp_doc, (void *)_io_BytesIO___init____doc__},
    {Ty_tp_traverse, bytesio_traverse},
    {Ty_tp_clear, bytesio_clear},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, bytesio_iternext},
    {Ty_tp_methods, bytesio_methods},
    {Ty_tp_members, bytesio_members},
    {Ty_tp_getset, bytesio_getsetlist},
    {Ty_tp_init, _io_BytesIO___init__},
    {Ty_tp_new, bytesio_new},
    {0, NULL},
};

TyType_Spec bytesio_spec = {
    .name = "_io.BytesIO",
    .basicsize = sizeof(bytesio),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = bytesio_slots,
};

/*
 * Implementation of the small intermediate object used by getbuffer().
 * getbuffer() returns a memoryview over this object, which should make it
 * invisible from Python code.
 */

static int
bytesiobuf_getbuffer(TyObject *op, Ty_buffer *view, int flags)
{
    bytesiobuf *obj = bytesiobuf_CAST(op);
    bytesio *b = bytesio_CAST(obj->source);

    if (view == NULL) {
        TyErr_SetString(TyExc_BufferError,
            "bytesiobuf_getbuffer: view==NULL argument is obsolete");
        return -1;
    }
    if (b->exports == 0 && SHARED_BUF(b)) {
        if (unshare_buffer(b, b->string_size) < 0)
            return -1;
    }

    /* cannot fail if view != NULL and readonly == 0 */
    (void)PyBuffer_FillInfo(view, op,
                            TyBytes_AS_STRING(b->buf), b->string_size,
                            0, flags);
    b->exports++;
    return 0;
}

static void
bytesiobuf_releasebuffer(TyObject *op, Ty_buffer *Py_UNUSED(view))
{
    bytesiobuf *obj = bytesiobuf_CAST(op);
    bytesio *b = bytesio_CAST(obj->source);
    b->exports--;
}

static int
bytesiobuf_traverse(TyObject *op, visitproc visit, void *arg)
{
    bytesiobuf *self = bytesiobuf_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->source);
    return 0;
}

static void
bytesiobuf_dealloc(TyObject *op)
{
    bytesiobuf *self = bytesiobuf_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(op);
    Ty_CLEAR(self->source);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot bytesiobuf_slots[] = {
    {Ty_tp_dealloc, bytesiobuf_dealloc},
    {Ty_tp_traverse, bytesiobuf_traverse},

    // Buffer protocol
    {Ty_bf_getbuffer, bytesiobuf_getbuffer},
    {Ty_bf_releasebuffer, bytesiobuf_releasebuffer},
    {0, NULL},
};

TyType_Spec bytesiobuf_spec = {
    .name = "_io._BytesIOBuffer",
    .basicsize = sizeof(bytesiobuf),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = bytesiobuf_slots,
};
