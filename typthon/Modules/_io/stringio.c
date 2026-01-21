#include "Python.h"
#include <stddef.h>               // offsetof()
#include "pycore_object.h"
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()
#include "_iomodule.h"

/* Implementation note: the buffer is always at least one character longer
   than the enclosed string, for proper functioning of _PyIO_find_line_ending.
*/

#define STATE_REALIZED 1
#define STATE_ACCUMULATING 2

/*[clinic input]
module _io
class _io.StringIO "stringio *" "clinic_state()->PyStringIO_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2693eada0658d470]*/

typedef struct {
    PyObject_HEAD
    Ty_UCS4 *buf;
    Ty_ssize_t pos;
    Ty_ssize_t string_size;
    size_t buf_size;

    /* The stringio object can be in two states: accumulating or realized.
       In accumulating state, the internal buffer contains nothing and
       the contents are given by the embedded _PyUnicodeWriter structure.
       In realized state, the internal buffer is meaningful and the
       _PyUnicodeWriter is destroyed.
    */
    int state;
    PyUnicodeWriter *writer;

    char ok; /* initialized? */
    char closed;
    char readuniversal;
    char readtranslate;
    TyObject *decoder;
    TyObject *readnl;
    TyObject *writenl;

    TyObject *dict;
    TyObject *weakreflist;
    _PyIO_State *module_state;
} stringio;

#define stringio_CAST(op)   ((stringio *)(op))

#define clinic_state() (find_io_state_by_def(Ty_TYPE(self)))
#include "clinic/stringio.c.h"
#undef clinic_state

static int _io_StringIO___init__(TyObject *self, TyObject *args, TyObject *kwargs);

#define CHECK_INITIALIZED(self) \
    if (self->ok <= 0) { \
        TyErr_SetString(TyExc_ValueError, \
            "I/O operation on uninitialized object"); \
        return NULL; \
    }

#define CHECK_CLOSED(self) \
    if (self->closed) { \
        TyErr_SetString(TyExc_ValueError, \
            "I/O operation on closed file"); \
        return NULL; \
    }

#define ENSURE_REALIZED(self) \
    if (realize(self) < 0) { \
        return NULL; \
    }


/* Internal routine for changing the size, in terms of characters, of the
   buffer of StringIO objects.  The caller should ensure that the 'size'
   argument is non-negative.  Returns 0 on success, -1 otherwise. */
static int
resize_buffer(stringio *self, size_t size)
{
    /* Here, unsigned types are used to avoid dealing with signed integer
       overflow, which is undefined in C. */
    size_t alloc = self->buf_size;
    Ty_UCS4 *new_buf = NULL;

    assert(self->buf != NULL);

    /* Reserve one more char for line ending detection. */
    size = size + 1;
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

    if (alloc > PY_SIZE_MAX / sizeof(Ty_UCS4))
        goto overflow;
    new_buf = (Ty_UCS4 *)TyMem_Realloc(self->buf, alloc * sizeof(Ty_UCS4));
    if (new_buf == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    self->buf_size = alloc;
    self->buf = new_buf;

    return 0;

  overflow:
    TyErr_SetString(TyExc_OverflowError,
                    "new buffer size too large");
    return -1;
}

static TyObject *
make_intermediate(stringio *self)
{
    TyObject *intermediate = PyUnicodeWriter_Finish(self->writer);
    self->writer = NULL;
    self->state = STATE_REALIZED;
    if (intermediate == NULL)
        return NULL;

    self->writer = PyUnicodeWriter_Create(0);
    if (self->writer == NULL) {
        Ty_DECREF(intermediate);
        return NULL;
    }
    if (PyUnicodeWriter_WriteStr(self->writer, intermediate)) {
        Ty_DECREF(intermediate);
        return NULL;
    }
    self->state = STATE_ACCUMULATING;
    return intermediate;
}

static int
realize(stringio *self)
{
    Ty_ssize_t len;
    TyObject *intermediate;

    if (self->state == STATE_REALIZED)
        return 0;
    assert(self->state == STATE_ACCUMULATING);
    self->state = STATE_REALIZED;

    intermediate = PyUnicodeWriter_Finish(self->writer);
    self->writer = NULL;
    if (intermediate == NULL)
        return -1;

    /* Append the intermediate string to the internal buffer.
       The length should be equal to the current cursor position.
     */
    len = TyUnicode_GET_LENGTH(intermediate);
    if (resize_buffer(self, len) < 0) {
        Ty_DECREF(intermediate);
        return -1;
    }
    if (!TyUnicode_AsUCS4(intermediate, self->buf, len, 0)) {
        Ty_DECREF(intermediate);
        return -1;
    }

    Ty_DECREF(intermediate);
    return 0;
}

/* Internal routine for writing a whole PyUnicode object to the buffer of a
   StringIO object. Returns 0 on success, or -1 on error. */
static Ty_ssize_t
write_str(stringio *self, TyObject *obj)
{
    Ty_ssize_t len;
    TyObject *decoded = NULL;

    assert(self->buf != NULL);
    assert(self->pos >= 0);

    if (self->decoder != NULL) {
        decoded = _PyIncrementalNewlineDecoder_decode(
            self->decoder, obj, 1 /* always final */);
    }
    else {
        decoded = Ty_NewRef(obj);
    }
    if (self->writenl) {
        TyObject *translated = TyUnicode_Replace(
            decoded, _Ty_LATIN1_CHR('\n'), self->writenl, -1);
        Ty_SETREF(decoded, translated);
    }
    if (decoded == NULL)
        return -1;

    assert(TyUnicode_Check(decoded));
    len = TyUnicode_GET_LENGTH(decoded);
    assert(len >= 0);

    /* This overflow check is not strictly necessary. However, it avoids us to
       deal with funky things like comparing an unsigned and a signed
       integer. */
    if (self->pos > PY_SSIZE_T_MAX - len) {
        TyErr_SetString(TyExc_OverflowError,
                        "new position too large");
        goto fail;
    }

    if (self->state == STATE_ACCUMULATING) {
        if (self->string_size == self->pos) {
            if (PyUnicodeWriter_WriteStr(self->writer, decoded))
                goto fail;
            goto success;
        }
        if (realize(self))
            goto fail;
    }

    if (self->pos + len > self->string_size) {
        if (resize_buffer(self, self->pos + len) < 0)
            goto fail;
    }

    if (self->pos > self->string_size) {
        /* In case of overseek, pad with null bytes the buffer region between
           the end of stream and the current position.

          0   lo      string_size                           hi
          |   |<---used--->|<----------available----------->|
          |   |            <--to pad-->|<---to write--->    |
          0   buf                   position

        */
        memset(self->buf + self->string_size, '\0',
               (self->pos - self->string_size) * sizeof(Ty_UCS4));
    }

    /* Copy the data to the internal buffer, overwriting some of the
       existing data if self->pos < self->string_size. */
    if (!TyUnicode_AsUCS4(decoded,
                          self->buf + self->pos,
                          self->buf_size - self->pos,
                          0))
        goto fail;

success:
    /* Set the new length of the internal string if it has changed. */
    self->pos += len;
    if (self->string_size < self->pos)
        self->string_size = self->pos;

    Ty_DECREF(decoded);
    return 0;

fail:
    Ty_XDECREF(decoded);
    return -1;
}

/*[clinic input]
@critical_section
_io.StringIO.getvalue

Retrieve the entire contents of the object.
[clinic start generated code]*/

static TyObject *
_io_StringIO_getvalue_impl(stringio *self)
/*[clinic end generated code: output=27b6a7bfeaebce01 input=fb5dee06b8d467f3]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    if (self->state == STATE_ACCUMULATING)
        return make_intermediate(self);
    return TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND, self->buf,
                                     self->string_size);
}

/*[clinic input]
@critical_section
_io.StringIO.tell

Tell the current file position.
[clinic start generated code]*/

static TyObject *
_io_StringIO_tell_impl(stringio *self)
/*[clinic end generated code: output=2e87ac67b116c77b input=98a08f3e2dae3550]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    return TyLong_FromSsize_t(self->pos);
}

/*[clinic input]
@critical_section
_io.StringIO.read
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read at most size characters, returned as a string.

If the argument is negative or omitted, read until EOF
is reached. Return an empty string at EOF.
[clinic start generated code]*/

static TyObject *
_io_StringIO_read_impl(stringio *self, Ty_ssize_t size)
/*[clinic end generated code: output=ae8cf6002f71626c input=9fbef45d8aece8e7]*/
{
    Ty_ssize_t n;
    Ty_UCS4 *output;

    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);

    /* adjust invalid sizes */
    n = self->string_size - self->pos;
    if (size < 0 || size > n) {
        size = n;
        if (size < 0)
            size = 0;
    }

    /* Optimization for seek(0); read() */
    if (self->state == STATE_ACCUMULATING && self->pos == 0 && size == n) {
        TyObject *result = make_intermediate(self);
        self->pos = self->string_size;
        return result;
    }

    ENSURE_REALIZED(self);
    output = self->buf + self->pos;
    self->pos += size;
    return TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND, output, size);
}

/* Internal helper, used by stringio_readline and stringio_iternext */
static TyObject *
_stringio_readline(stringio *self, Ty_ssize_t limit)
{
    Ty_UCS4 *start, *end, old_char;
    Ty_ssize_t len, consumed;

    /* In case of overseek, return the empty string */
    if (self->pos >= self->string_size)
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);

    start = self->buf + self->pos;
    if (limit < 0 || limit > self->string_size - self->pos)
        limit = self->string_size - self->pos;

    end = start + limit;
    old_char = *end;
    *end = '\0';
    len = _PyIO_find_line_ending(
        self->readtranslate, self->readuniversal, self->readnl,
        TyUnicode_4BYTE_KIND, (char*)start, (char*)end, &consumed);
    *end = old_char;
    /* If we haven't found any line ending, we just return everything
       (`consumed` is ignored). */
    if (len < 0)
        len = limit;
    self->pos += len;
    return TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND, start, len);
}

/*[clinic input]
@critical_section
_io.StringIO.readline
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read until newline or EOF.

Returns an empty string if EOF is hit immediately.
[clinic start generated code]*/

static TyObject *
_io_StringIO_readline_impl(stringio *self, Ty_ssize_t size)
/*[clinic end generated code: output=cabd6452f1b7e85d input=4d14b8495dea1d98]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    ENSURE_REALIZED(self);

    return _stringio_readline(self, size);
}

static TyObject *
stringio_iternext(TyObject *op)
{
    TyObject *line;
    stringio *self = stringio_CAST(op);

    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    ENSURE_REALIZED(self);

    if (Ty_IS_TYPE(self, self->module_state->PyStringIO_Type)) {
        /* Skip method call overhead for speed */
        line = _stringio_readline(self, -1);
    }
    else {
        /* XXX is subclassing StringIO really supported? */
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
        /* Reached EOF */
        Ty_DECREF(line);
        return NULL;
    }

    return line;
}

/*[clinic input]
@critical_section
_io.StringIO.truncate
    pos as size: Ty_ssize_t(accept={int, NoneType}, c_default="((stringio *)self)->pos") = None
    /

Truncate size to pos.

The pos argument defaults to the current file position, as
returned by tell().  The current file position is unchanged.
Returns the new absolute position.
[clinic start generated code]*/

static TyObject *
_io_StringIO_truncate_impl(stringio *self, Ty_ssize_t size)
/*[clinic end generated code: output=eb3aef8e06701365 input=fa8a6c98bb2ba780]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);

    if (size < 0) {
        TyErr_Format(TyExc_ValueError,
                     "Negative size value %zd", size);
        return NULL;
    }

    if (size < self->string_size) {
        ENSURE_REALIZED(self);
        if (resize_buffer(self, size) < 0)
            return NULL;
        self->string_size = size;
    }

    return TyLong_FromSsize_t(size);
}

/*[clinic input]
@critical_section
_io.StringIO.seek
    pos: Ty_ssize_t
    whence: int = 0
    /

Change stream position.

Seek to character offset pos relative to position indicated by whence:
    0  Start of stream (the default).  pos should be >= 0;
    1  Current position - pos must be 0;
    2  End of stream - pos must be 0.
Returns the new absolute position.
[clinic start generated code]*/

static TyObject *
_io_StringIO_seek_impl(stringio *self, Ty_ssize_t pos, int whence)
/*[clinic end generated code: output=e9e0ac9a8ae71c25 input=c75ced09343a00d7]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);

    if (whence != 0 && whence != 1 && whence != 2) {
        TyErr_Format(TyExc_ValueError,
                     "Invalid whence (%i, should be 0, 1 or 2)", whence);
        return NULL;
    }
    else if (pos < 0 && whence == 0) {
        TyErr_Format(TyExc_ValueError,
                     "Negative seek position %zd", pos);
        return NULL;
    }
    else if (whence != 0 && pos != 0) {
        TyErr_SetString(TyExc_OSError,
                        "Can't do nonzero cur-relative seeks");
        return NULL;
    }

    /* whence = 0: offset relative to beginning of the string.
       whence = 1: no change to current position.
       whence = 2: change position to end of file. */
    if (whence == 1) {
        pos = self->pos;
    }
    else if (whence == 2) {
        pos = self->string_size;
    }

    self->pos = pos;

    return TyLong_FromSsize_t(self->pos);
}

/*[clinic input]
@critical_section
_io.StringIO.write
    s as obj: object
    /

Write string to file.

Returns the number of characters written, which is always equal to
the length of the string.
[clinic start generated code]*/

static TyObject *
_io_StringIO_write_impl(stringio *self, TyObject *obj)
/*[clinic end generated code: output=d53b1d841d7db288 input=1561272c0da4651f]*/
{
    Ty_ssize_t size;

    CHECK_INITIALIZED(self);
    if (!TyUnicode_Check(obj)) {
        TyErr_Format(TyExc_TypeError, "string argument expected, got '%s'",
                     Ty_TYPE(obj)->tp_name);
        return NULL;
    }
    CHECK_CLOSED(self);
    size = TyUnicode_GET_LENGTH(obj);

    if (size > 0 && write_str(self, obj) < 0)
        return NULL;

    return TyLong_FromSsize_t(size);
}

/*[clinic input]
@critical_section
_io.StringIO.close

Close the IO object.

Attempting any further operation after the object is closed
will raise a ValueError.

This method has no effect if the file is already closed.
[clinic start generated code]*/

static TyObject *
_io_StringIO_close_impl(stringio *self)
/*[clinic end generated code: output=04399355cbe518f1 input=305d19aa29cc40b9]*/
{
    self->closed = 1;
    /* Free up some memory */
    if (resize_buffer(self, 0) < 0)
        return NULL;
    PyUnicodeWriter_Discard(self->writer);
    self->writer = NULL;
    Ty_CLEAR(self->readnl);
    Ty_CLEAR(self->writenl);
    Ty_CLEAR(self->decoder);
    Py_RETURN_NONE;
}

static int
stringio_traverse(TyObject *op, visitproc visit, void *arg)
{
    stringio *self = stringio_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->readnl);
    Ty_VISIT(self->writenl);
    Ty_VISIT(self->decoder);
    Ty_VISIT(self->dict);
    return 0;
}

static int
stringio_clear(TyObject *op)
{
    stringio *self = stringio_CAST(op);
    Ty_CLEAR(self->readnl);
    Ty_CLEAR(self->writenl);
    Ty_CLEAR(self->decoder);
    Ty_CLEAR(self->dict);
    return 0;
}

static void
stringio_dealloc(TyObject *op)
{
    stringio *self = stringio_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    self->ok = 0;
    if (self->buf) {
        TyMem_Free(self->buf);
        self->buf = NULL;
    }
    PyUnicodeWriter_Discard(self->writer);
    (void)stringio_clear(op);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
stringio_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    stringio *self;

    assert(type != NULL && type->tp_alloc != NULL);
    self = (stringio *)type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    /* tp_alloc initializes all the fields to zero. So we don't have to
       initialize them here. */

    self->buf = (Ty_UCS4 *)TyMem_Malloc(0);
    if (self->buf == NULL) {
        Ty_DECREF(self);
        return TyErr_NoMemory();
    }

    return (TyObject *)self;
}

/*[clinic input]
_io.StringIO.__init__
    initial_value as value: object(c_default="NULL") = ''
    newline as newline_obj: object(c_default="NULL") = '\n'

Text I/O implementation using an in-memory buffer.

The initial_value argument sets the value of object.  The newline
argument is like the one of TextIOWrapper's constructor.
[clinic start generated code]*/

static int
_io_StringIO___init___impl(stringio *self, TyObject *value,
                           TyObject *newline_obj)
/*[clinic end generated code: output=a421ea023b22ef4e input=cee2d9181b2577a3]*/
{
    const char *newline = "\n";
    Ty_ssize_t value_len;

    /* Parse the newline argument. We only want to allow unicode objects or
       None. */
    if (newline_obj == Ty_None) {
        newline = NULL;
    }
    else if (newline_obj) {
        if (!TyUnicode_Check(newline_obj)) {
            TyErr_Format(TyExc_TypeError,
                         "newline must be str or None, not %.200s",
                         Ty_TYPE(newline_obj)->tp_name);
            return -1;
        }
        newline = TyUnicode_AsUTF8(newline_obj);
        if (newline == NULL)
            return -1;
    }

    if (newline && newline[0] != '\0'
        && !(newline[0] == '\n' && newline[1] == '\0')
        && !(newline[0] == '\r' && newline[1] == '\0')
        && !(newline[0] == '\r' && newline[1] == '\n' && newline[2] == '\0')) {
        TyErr_Format(TyExc_ValueError,
                     "illegal newline value: %R", newline_obj);
        return -1;
    }
    if (value && value != Ty_None && !TyUnicode_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "initial_value must be str or None, not %.200s",
                     Ty_TYPE(value)->tp_name);
        return -1;
    }

    self->ok = 0;

    PyUnicodeWriter_Discard(self->writer);
    self->writer = NULL;
    Ty_CLEAR(self->readnl);
    Ty_CLEAR(self->writenl);
    Ty_CLEAR(self->decoder);

    assert((newline != NULL && newline_obj != Ty_None) ||
           (newline == NULL && newline_obj == Ty_None));

    if (newline) {
        self->readnl = TyUnicode_FromString(newline);
        if (self->readnl == NULL)
            return -1;
    }
    self->readuniversal = (newline == NULL || newline[0] == '\0');
    self->readtranslate = (newline == NULL);
    /* If newline == "", we don't translate anything.
       If newline == "\n" or newline == None, we translate to "\n", which is
       a no-op.
       (for newline == None, TextIOWrapper translates to os.linesep, but it
       is pointless for StringIO)
    */
    if (newline != NULL && newline[0] == '\r') {
        self->writenl = Ty_NewRef(self->readnl);
    }

    _PyIO_State *module_state = find_io_state_by_def(Ty_TYPE(self));
    if (self->readuniversal) {
        self->decoder = PyObject_CallFunctionObjArgs(
            (TyObject *)module_state->PyIncrementalNewlineDecoder_Type,
            Ty_None, self->readtranslate ? Ty_True : Ty_False, NULL);
        if (self->decoder == NULL)
            return -1;
    }

    /* Now everything is set up, resize buffer to size of initial value,
       and copy it */
    self->string_size = 0;
    if (value && value != Ty_None)
        value_len = TyUnicode_GetLength(value);
    else
        value_len = 0;
    if (value_len > 0) {
        /* This is a heuristic, for newline translation might change
           the string length. */
        if (resize_buffer(self, 0) < 0)
            return -1;
        self->state = STATE_REALIZED;
        self->pos = 0;
        if (write_str(self, value) < 0)
            return -1;
    }
    else {
        /* Empty stringio object, we can start by accumulating */
        if (resize_buffer(self, 0) < 0)
            return -1;
        self->writer = PyUnicodeWriter_Create(0);
        if (self->writer == NULL) {
            return -1;
        }
        self->state = STATE_ACCUMULATING;
    }
    self->pos = 0;
    self->module_state = module_state;
    self->closed = 0;
    self->ok = 1;
    return 0;
}

/* Properties and pseudo-properties */

/*[clinic input]
@critical_section
_io.StringIO.readable

Returns True if the IO object can be read.
[clinic start generated code]*/

static TyObject *
_io_StringIO_readable_impl(stringio *self)
/*[clinic end generated code: output=b19d44dd8b1ceb99 input=6cd2ffd65a8e8763]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/*[clinic input]
@critical_section
_io.StringIO.writable

Returns True if the IO object can be written.
[clinic start generated code]*/

static TyObject *
_io_StringIO_writable_impl(stringio *self)
/*[clinic end generated code: output=13e4dd77187074ca input=1b3c63dbaa761c69]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/*[clinic input]
@critical_section
_io.StringIO.seekable

Returns True if the IO object can be seeked.
[clinic start generated code]*/

static TyObject *
_io_StringIO_seekable_impl(stringio *self)
/*[clinic end generated code: output=4d20b4641c756879 input=a820fad2cf085fc3]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    Py_RETURN_TRUE;
}

/* Pickling support.

   The implementation of __getstate__ is similar to the one for BytesIO,
   except that we also save the newline parameter. For __setstate__ and unlike
   BytesIO, we call __init__ to restore the object's state. Doing so allows us
   to avoid decoding the complex newline state while keeping the object
   representation compact.

   See comment in bytesio.c regarding why only pickle protocols and onward are
   supported.
*/

/*[clinic input]
@critical_section
_io.StringIO.__getstate__

[clinic start generated code]*/

static TyObject *
_io_StringIO___getstate___impl(stringio *self)
/*[clinic end generated code: output=780be4a996410199 input=76f27255ef83bb92]*/
{
    TyObject *initvalue = _io_StringIO_getvalue_impl(self);
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

    state = Ty_BuildValue("(OOnN)", initvalue,
                          self->readnl ? self->readnl : Ty_None,
                          self->pos, dict);
    Ty_DECREF(initvalue);
    return state;
}

/*[clinic input]
@critical_section
_io.StringIO.__setstate__

    state: object
    /
[clinic start generated code]*/

static TyObject *
_io_StringIO___setstate___impl(stringio *self, TyObject *state)
/*[clinic end generated code: output=cb3962bc6d5c5609 input=8a27784b11b82e47]*/
{
    TyObject *initarg;
    TyObject *position_obj;
    TyObject *dict;
    Ty_ssize_t pos;

    assert(state != NULL);
    CHECK_CLOSED(self);

    /* We allow the state tuple to be longer than 4, because we may need
       someday to extend the object's state without breaking
       backward-compatibility. */
    if (!TyTuple_Check(state) || TyTuple_GET_SIZE(state) < 4) {
        TyErr_Format(TyExc_TypeError,
                     "%.200s.__setstate__ argument should be 4-tuple, got %.200s",
                     Ty_TYPE(self)->tp_name, Ty_TYPE(state)->tp_name);
        return NULL;
    }

    /* Initialize the object's state. */
    initarg = TyTuple_GetSlice(state, 0, 2);
    if (initarg == NULL)
        return NULL;
    if (_io_StringIO___init__((TyObject *)self, initarg, NULL) < 0) {
        Ty_DECREF(initarg);
        return NULL;
    }
    Ty_DECREF(initarg);

    /* Restore the buffer state. Even if __init__ did initialize the buffer,
       we have to initialize it again since __init__ may translate the
       newlines in the initial_value string. We clearly do not want that
       because the string value in the state tuple has already been translated
       once by __init__. So we do not take any chance and replace object's
       buffer completely. */
    {
        TyObject *item = TyTuple_GET_ITEM(state, 0);
        if (TyUnicode_Check(item)) {
            Ty_UCS4 *buf = TyUnicode_AsUCS4Copy(item);
            if (buf == NULL)
                return NULL;
            Ty_ssize_t bufsize = TyUnicode_GET_LENGTH(item);

            if (resize_buffer(self, bufsize) < 0) {
                TyMem_Free(buf);
                return NULL;
            }
            memcpy(self->buf, buf, bufsize * sizeof(Ty_UCS4));
            TyMem_Free(buf);
            self->string_size = bufsize;
        }
        else {
            assert(item == Ty_None);
            self->string_size = 0;
        }
    }

    /* Set carefully the position value. Alternatively, we could use the seek
       method instead of modifying self->pos directly to better protect the
       object internal state against erroneous (or malicious) inputs. */
    position_obj = TyTuple_GET_ITEM(state, 2);
    if (!TyLong_Check(position_obj)) {
        TyErr_Format(TyExc_TypeError,
                     "third item of state must be an integer, got %.200s",
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
    dict = TyTuple_GET_ITEM(state, 3);
    if (dict != Ty_None) {
        if (!TyDict_Check(dict)) {
            TyErr_Format(TyExc_TypeError,
                         "fourth item of state should be a dict, got a %.200s",
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

/*[clinic input]
@critical_section
@getter
_io.StringIO.closed
[clinic start generated code]*/

static TyObject *
_io_StringIO_closed_get_impl(stringio *self)
/*[clinic end generated code: output=531ddca7954331d6 input=178d2ef24395fd49]*/
{
    CHECK_INITIALIZED(self);
    return TyBool_FromLong(self->closed);
}

/*[clinic input]
@critical_section
@getter
_io.StringIO.line_buffering
[clinic start generated code]*/

static TyObject *
_io_StringIO_line_buffering_get_impl(stringio *self)
/*[clinic end generated code: output=360710e0112966ae input=6a7634e7f890745e]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    Py_RETURN_FALSE;
}

/*[clinic input]
@critical_section
@getter
_io.StringIO.newlines
[clinic start generated code]*/

static TyObject *
_io_StringIO_newlines_get_impl(stringio *self)
/*[clinic end generated code: output=35d7c0b66d7e0160 input=092a14586718244b]*/
{
    CHECK_INITIALIZED(self);
    CHECK_CLOSED(self);
    if (self->decoder == NULL) {
        Py_RETURN_NONE;
    }
    return PyObject_GetAttr(self->decoder, &_Ty_ID(newlines));
}

static struct TyMethodDef stringio_methods[] = {
    _IO_STRINGIO_CLOSE_METHODDEF
    _IO_STRINGIO_GETVALUE_METHODDEF
    _IO_STRINGIO_READ_METHODDEF
    _IO_STRINGIO_READLINE_METHODDEF
    _IO_STRINGIO_TELL_METHODDEF
    _IO_STRINGIO_TRUNCATE_METHODDEF
    _IO_STRINGIO_SEEK_METHODDEF
    _IO_STRINGIO_WRITE_METHODDEF

    _IO_STRINGIO_SEEKABLE_METHODDEF
    _IO_STRINGIO_READABLE_METHODDEF
    _IO_STRINGIO_WRITABLE_METHODDEF

    _IO_STRINGIO___GETSTATE___METHODDEF
    _IO_STRINGIO___SETSTATE___METHODDEF
    {NULL, NULL}        /* sentinel */
};

static TyGetSetDef stringio_getset[] = {
    _IO_STRINGIO_CLOSED_GETSETDEF
    _IO_STRINGIO_NEWLINES_GETSETDEF
    /*  (following comments straight off of the original Python wrapper:)
        XXX Cruft to support the TextIOWrapper API. This would only
        be meaningful if StringIO supported the buffer attribute.
        Hopefully, a better solution, than adding these pseudo-attributes,
        will be found.
    */
    _IO_STRINGIO_LINE_BUFFERING_GETSETDEF
    {NULL}
};

static struct TyMemberDef stringio_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(stringio, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(stringio, dict), Py_READONLY},
    {NULL},
};

static TyType_Slot stringio_slots[] = {
    {Ty_tp_dealloc, stringio_dealloc},
    {Ty_tp_doc, (void *)_io_StringIO___init____doc__},
    {Ty_tp_traverse, stringio_traverse},
    {Ty_tp_clear, stringio_clear},
    {Ty_tp_iternext, stringio_iternext},
    {Ty_tp_methods, stringio_methods},
    {Ty_tp_members, stringio_members},
    {Ty_tp_getset, stringio_getset},
    {Ty_tp_init, _io_StringIO___init__},
    {Ty_tp_new, stringio_new},
    {0, NULL},
};

TyType_Spec stringio_spec = {
    .name = "_io.StringIO",
    .basicsize = sizeof(stringio),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = stringio_slots,
};
