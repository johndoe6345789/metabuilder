/*
    An implementation of the I/O abstract base classes hierarchy
    as defined by PEP 3116 - "New I/O"

    Classes defined here: IOBase, RawIOBase.

    Written by Amaury Forgeot d'Arc and Antoine Pitrou
*/


#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallMethod()
#include "pycore_fileutils.h"           // _PyFile_Flush
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_object.h"        // _TyType_HasFeature()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include <stddef.h>               // offsetof()
#include "_iomodule.h"

/*[clinic input]
module _io
class _io._IOBase "TyObject *" "clinic_state()->PyIOBase_Type"
class _io._RawIOBase "TyObject *" "clinic_state()->PyRawIOBase_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=9006b7802ab8ea85]*/

/*
 * IOBase class, an abstract class
 */

typedef struct {
    PyObject_HEAD

    TyObject *dict;
    TyObject *weakreflist;
} iobase;

#define iobase_CAST(op) ((iobase *)(op))

TyDoc_STRVAR(iobase_doc,
    "The abstract base class for all I/O classes.\n"
    "\n"
    "This class provides dummy implementations for many methods that\n"
    "derived classes can override selectively; the default implementations\n"
    "represent a file that cannot be read, written or seeked.\n"
    "\n"
    "Even though IOBase does not declare read, readinto, or write because\n"
    "their signatures will vary, implementations and clients should\n"
    "consider those methods part of the interface. Also, implementations\n"
    "may raise UnsupportedOperation when operations they do not support are\n"
    "called.\n"
    "\n"
    "The basic type used for binary data read from or written to a file is\n"
    "bytes. Other bytes-like objects are accepted as method arguments too.\n"
    "In some cases (such as readinto), a writable object is required. Text\n"
    "I/O classes work with str data.\n"
    "\n"
    "Note that calling any method (except additional calls to close(),\n"
    "which are ignored) on a closed stream should raise a ValueError.\n"
    "\n"
    "IOBase (and its subclasses) support the iterator protocol, meaning\n"
    "that an IOBase object can be iterated over yielding the lines in a\n"
    "stream.\n"
    "\n"
    "IOBase also supports the :keyword:`with` statement. In this example,\n"
    "fp is closed after the suite of the with statement is complete:\n"
    "\n"
    "with open('spam.txt', 'r') as fp:\n"
    "    fp.write('Spam and eggs!')\n");


/* Internal methods */

/* Use this function whenever you want to check the internal `closed` status
   of the IOBase object rather than the virtual `closed` attribute as returned
   by whatever subclass. */

static int
iobase_is_closed(TyObject *self)
{
    return PyObject_HasAttrWithError(self, &_Ty_ID(__IOBase_closed));
}

static TyObject *
iobase_unsupported(_PyIO_State *state, const char *message)
{
    TyErr_SetString(state->unsupported_operation, message);
    return NULL;
}

/* Positioning */

/*[clinic input]
_io._IOBase.seek
    cls: defining_class
    offset: int(unused=True)
      The stream position, relative to 'whence'.
    whence: int(unused=True, c_default='0') = os.SEEK_SET
      The relative position to seek from.
    /

Change the stream position to the given byte offset.

The offset is interpreted relative to the position indicated by whence.
Values for whence are:

* os.SEEK_SET or 0 -- start of stream (the default); offset should be zero or positive
* os.SEEK_CUR or 1 -- current stream position; offset may be negative
* os.SEEK_END or 2 -- end of stream; offset is usually negative

Return the new absolute position.
[clinic start generated code]*/

static TyObject *
_io__IOBase_seek_impl(TyObject *self, TyTypeObject *cls,
                      int Py_UNUSED(offset), int Py_UNUSED(whence))
/*[clinic end generated code: output=8bd74ea6538ded53 input=74211232b363363e]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return iobase_unsupported(state, "seek");
}

/*[clinic input]
_io._IOBase.tell

Return current stream position.
[clinic start generated code]*/

static TyObject *
_io__IOBase_tell_impl(TyObject *self)
/*[clinic end generated code: output=89a1c0807935abe2 input=04e615fec128801f]*/
{
    return _TyObject_CallMethod(self, &_Ty_ID(seek), "ii", 0, 1);
}

/*[clinic input]
_io._IOBase.truncate
    cls: defining_class
    size: object(unused=True) = None
    /

Truncate file to size bytes.

File pointer is left unchanged. Size defaults to the current IO position
as reported by tell(). Return the new size.
[clinic start generated code]*/

static TyObject *
_io__IOBase_truncate_impl(TyObject *self, TyTypeObject *cls,
                          TyObject *Py_UNUSED(size))
/*[clinic end generated code: output=2013179bff1fe8ef input=660ac20936612c27]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return iobase_unsupported(state, "truncate");
}

/* Flush and close methods */

/*[clinic input]
_io._IOBase.flush

Flush write buffers, if applicable.

This is not implemented for read-only and non-blocking streams.
[clinic start generated code]*/

static TyObject *
_io__IOBase_flush_impl(TyObject *self)
/*[clinic end generated code: output=7cef4b4d54656a3b input=773be121abe270aa]*/
{
    /* XXX Should this return the number of bytes written??? */
    int closed = iobase_is_closed(self);

    if (!closed) {
        Py_RETURN_NONE;
    }
    if (closed > 0) {
        TyErr_SetString(TyExc_ValueError, "I/O operation on closed file.");
    }
    return NULL;
}

static TyObject *
iobase_closed_get(TyObject *self, void *context)
{
    int closed = iobase_is_closed(self);
    if (closed < 0) {
        return NULL;
    }
    return TyBool_FromLong(closed);
}

static int
iobase_check_closed(TyObject *self)
{
    TyObject *res;
    int closed;
    /* This gets the derived attribute, which is *not* __IOBase_closed
       in most cases! */
    closed = PyObject_GetOptionalAttr(self, &_Ty_ID(closed), &res);
    if (closed > 0) {
        closed = PyObject_IsTrue(res);
        Ty_DECREF(res);
        if (closed > 0) {
            TyErr_SetString(TyExc_ValueError, "I/O operation on closed file.");
            return -1;
        }
    }
    return closed;
}

TyObject *
_PyIOBase_check_closed(TyObject *self, TyObject *args)
{
    if (iobase_check_closed(self)) {
        return NULL;
    }
    if (args == Ty_True) {
        return Ty_None;
    }
    Py_RETURN_NONE;
}

static TyObject *
iobase_check_seekable(TyObject *self, TyObject *args)
{
    _PyIO_State *state = find_io_state_by_def(Ty_TYPE(self));
    return _PyIOBase_check_seekable(state, self, args);
}

static TyObject *
iobase_check_readable(TyObject *self, TyObject *args)
{
    _PyIO_State *state = find_io_state_by_def(Ty_TYPE(self));
    return _PyIOBase_check_readable(state, self, args);
}

static TyObject *
iobase_check_writable(TyObject *self, TyObject *args)
{
    _PyIO_State *state = find_io_state_by_def(Ty_TYPE(self));
    return _PyIOBase_check_writable(state, self, args);
}

TyObject *
_PyIOBase_cannot_pickle(TyObject *self, TyObject *args)
{
    TyErr_Format(TyExc_TypeError,
        "cannot pickle '%.100s' instances", _TyType_Name(Ty_TYPE(self)));
    return NULL;
}

/* XXX: IOBase thinks it has to maintain its own internal state in
   `__IOBase_closed` and call flush() by itself, but it is redundant with
   whatever behaviour a non-trivial derived class will implement. */

/*[clinic input]
_io._IOBase.close

Flush and close the IO object.

This method has no effect if the file is already closed.
[clinic start generated code]*/

static TyObject *
_io__IOBase_close_impl(TyObject *self)
/*[clinic end generated code: output=63c6a6f57d783d6d input=f4494d5c31dbc6b7]*/
{
    int rc1, rc2, closed = iobase_is_closed(self);

    if (closed < 0) {
        return NULL;
    }
    if (closed) {
        Py_RETURN_NONE;
    }

    rc1 = _PyFile_Flush(self);
    TyObject *exc = TyErr_GetRaisedException();
    rc2 = PyObject_SetAttr(self, &_Ty_ID(__IOBase_closed), Ty_True);
    _TyErr_ChainExceptions1(exc);
    if (rc1 < 0 || rc2 < 0) {
        return NULL;
    }

    Py_RETURN_NONE;
}

/* Finalization and garbage collection support */

static void
iobase_finalize(TyObject *self)
{
    TyObject *res;
    int closed;

    /* Save the current exception, if any. */
    TyObject *exc = TyErr_GetRaisedException();

    /* If `closed` doesn't exist or can't be evaluated as bool, then the
       object is probably in an unusable state, so ignore. */
    if (PyObject_GetOptionalAttr(self, &_Ty_ID(closed), &res) <= 0) {
        TyErr_Clear();
        closed = -1;
    }
    else {
        closed = PyObject_IsTrue(res);
        Ty_DECREF(res);
        if (closed == -1)
            TyErr_Clear();
    }
    if (closed == 0) {
        /* Signal close() that it was called as part of the object
           finalization process. */
        if (PyObject_SetAttr(self, &_Ty_ID(_finalizing), Ty_True))
            TyErr_Clear();
        res = PyObject_CallMethodNoArgs((TyObject *)self, &_Ty_ID(close));
        if (res == NULL) {
            TyErr_FormatUnraisable("Exception ignored "
                                   "while finalizing file %R", self);
        }
        else {
            Ty_DECREF(res);
        }
    }

    /* Restore the saved exception. */
    TyErr_SetRaisedException(exc);
}

int
_PyIOBase_finalize(TyObject *self)
{
    int is_zombie;

    /* If _PyIOBase_finalize() is called from a destructor, we need to
       resurrect the object as calling close() can invoke arbitrary code. */
    is_zombie = (Ty_REFCNT(self) == 0);
    if (is_zombie)
        return PyObject_CallFinalizerFromDealloc(self);
    else {
        PyObject_CallFinalizer(self);
        return 0;
    }
}

static int
iobase_traverse(TyObject *op, visitproc visit, void *arg)
{
    iobase *self = iobase_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->dict);
    return 0;
}

static int
iobase_clear(TyObject *op)
{
    iobase *self = iobase_CAST(op);
    Ty_CLEAR(self->dict);
    return 0;
}

/* Destructor */

static void
iobase_dealloc(TyObject *op)
{
    /* NOTE: since IOBaseObject has its own dict, Python-defined attributes
       are still available here for close() to use.
       However, if the derived class declares a __slots__, those slots are
       already gone.
    */
    iobase *self = iobase_CAST(op);
    if (_PyIOBase_finalize(op) < 0) {
        /* When called from a heap type's dealloc, the type will be
           decref'ed on return (see e.g. subtype_dealloc in typeobject.c). */
        if (_TyType_HasFeature(Ty_TYPE(self), Ty_TPFLAGS_HEAPTYPE)) {
            Ty_INCREF(Ty_TYPE(self));
        }
        return;
    }
    TyTypeObject *tp = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    Ty_CLEAR(self->dict);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

/* Inquiry methods */

/*[clinic input]
_io._IOBase.seekable

Return whether object supports random access.

If False, seek(), tell() and truncate() will raise OSError.
This method may need to do a test seek().
[clinic start generated code]*/

static TyObject *
_io__IOBase_seekable_impl(TyObject *self)
/*[clinic end generated code: output=4c24c67f5f32a43d input=b976622f7fdf3063]*/
{
    Py_RETURN_FALSE;
}

TyObject *
_PyIOBase_check_seekable(_PyIO_State *state, TyObject *self, TyObject *args)
{
    TyObject *res  = PyObject_CallMethodNoArgs(self, &_Ty_ID(seekable));
    if (res == NULL)
        return NULL;
    if (res != Ty_True) {
        Ty_CLEAR(res);
        iobase_unsupported(state, "File or stream is not seekable.");
        return NULL;
    }
    if (args == Ty_True) {
        Ty_DECREF(res);
    }
    return res;
}

/*[clinic input]
_io._IOBase.readable

Return whether object was opened for reading.

If False, read() will raise OSError.
[clinic start generated code]*/

static TyObject *
_io__IOBase_readable_impl(TyObject *self)
/*[clinic end generated code: output=e48089250686388b input=285b3b866a0ec35f]*/
{
    Py_RETURN_FALSE;
}

/* May be called with any object */
TyObject *
_PyIOBase_check_readable(_PyIO_State *state, TyObject *self, TyObject *args)
{
    TyObject *res = PyObject_CallMethodNoArgs(self, &_Ty_ID(readable));
    if (res == NULL)
        return NULL;
    if (res != Ty_True) {
        Ty_CLEAR(res);
        iobase_unsupported(state, "File or stream is not readable.");
        return NULL;
    }
    if (args == Ty_True) {
        Ty_DECREF(res);
    }
    return res;
}

/*[clinic input]
_io._IOBase.writable

Return whether object was opened for writing.

If False, write() will raise OSError.
[clinic start generated code]*/

static TyObject *
_io__IOBase_writable_impl(TyObject *self)
/*[clinic end generated code: output=406001d0985be14f input=9dcac18a013a05b5]*/
{
    Py_RETURN_FALSE;
}

/* May be called with any object */
TyObject *
_PyIOBase_check_writable(_PyIO_State *state, TyObject *self, TyObject *args)
{
    TyObject *res = PyObject_CallMethodNoArgs(self, &_Ty_ID(writable));
    if (res == NULL)
        return NULL;
    if (res != Ty_True) {
        Ty_CLEAR(res);
        iobase_unsupported(state, "File or stream is not writable.");
        return NULL;
    }
    if (args == Ty_True) {
        Ty_DECREF(res);
    }
    return res;
}

/* Context manager */

static TyObject *
iobase_enter(TyObject *self, TyObject *args)
{
    if (iobase_check_closed(self))
        return NULL;

    return Ty_NewRef(self);
}

static TyObject *
iobase_exit(TyObject *self, TyObject *args)
{
    return PyObject_CallMethodNoArgs(self, &_Ty_ID(close));
}

/* Lower-level APIs */

/* XXX Should these be present even if unimplemented? */

/*[clinic input]
_io._IOBase.fileno
    cls: defining_class
    /

Return underlying file descriptor if one exists.

Raise OSError if the IO object does not use a file descriptor.
[clinic start generated code]*/

static TyObject *
_io__IOBase_fileno_impl(TyObject *self, TyTypeObject *cls)
/*[clinic end generated code: output=7caaa32a6f4ada3d input=1927c8bea5c85099]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    return iobase_unsupported(state, "fileno");
}

/*[clinic input]
_io._IOBase.isatty

Return whether this is an 'interactive' stream.

Return False if it can't be determined.
[clinic start generated code]*/

static TyObject *
_io__IOBase_isatty_impl(TyObject *self)
/*[clinic end generated code: output=60cab77cede41cdd input=9ef76530d368458b]*/
{
    if (iobase_check_closed(self))
        return NULL;
    Py_RETURN_FALSE;
}

/* Readline(s) and writelines */

/*[clinic input]
_io._IOBase.readline
    size as limit: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read and return a line from the stream.

If size is specified, at most size bytes will be read.

The line terminator is always b'\n' for binary files; for text
files, the newlines argument to open can be used to select the line
terminator(s) recognized.
[clinic start generated code]*/

static TyObject *
_io__IOBase_readline_impl(TyObject *self, Ty_ssize_t limit)
/*[clinic end generated code: output=4479f79b58187840 input=d0c596794e877bff]*/
{
    /* For backwards compatibility, a (slowish) readline(). */

    TyObject *peek, *buffer, *result;
    Ty_ssize_t old_size = -1;

    if (PyObject_GetOptionalAttr(self, &_Ty_ID(peek), &peek) < 0) {
        return NULL;
    }

    buffer = TyByteArray_FromStringAndSize(NULL, 0);
    if (buffer == NULL) {
        Ty_XDECREF(peek);
        return NULL;
    }

    while (limit < 0 || TyByteArray_GET_SIZE(buffer) < limit) {
        Ty_ssize_t nreadahead = 1;
        TyObject *b;

        if (peek != NULL) {
            TyObject *readahead = PyObject_CallOneArg(peek, _TyLong_GetOne());
            if (readahead == NULL) {
                /* NOTE: TyErr_SetFromErrno() calls TyErr_CheckSignals()
                   when EINTR occurs so we needn't do it ourselves. */
                if (_PyIO_trap_eintr()) {
                    continue;
                }
                goto fail;
            }
            if (!TyBytes_Check(readahead)) {
                TyErr_Format(TyExc_OSError,
                             "peek() should have returned a bytes object, "
                             "not '%.200s'", Ty_TYPE(readahead)->tp_name);
                Ty_DECREF(readahead);
                goto fail;
            }
            if (TyBytes_GET_SIZE(readahead) > 0) {
                Ty_ssize_t n = 0;
                const char *buf = TyBytes_AS_STRING(readahead);
                if (limit >= 0) {
                    do {
                        if (n >= TyBytes_GET_SIZE(readahead) || n >= limit)
                            break;
                        if (buf[n++] == '\n')
                            break;
                    } while (1);
                }
                else {
                    do {
                        if (n >= TyBytes_GET_SIZE(readahead))
                            break;
                        if (buf[n++] == '\n')
                            break;
                    } while (1);
                }
                nreadahead = n;
            }
            Ty_DECREF(readahead);
        }

        b = _TyObject_CallMethod(self, &_Ty_ID(read), "n", nreadahead);
        if (b == NULL) {
            /* NOTE: TyErr_SetFromErrno() calls TyErr_CheckSignals()
               when EINTR occurs so we needn't do it ourselves. */
            if (_PyIO_trap_eintr()) {
                continue;
            }
            goto fail;
        }
        if (!TyBytes_Check(b)) {
            TyErr_Format(TyExc_OSError,
                         "read() should have returned a bytes object, "
                         "not '%.200s'", Ty_TYPE(b)->tp_name);
            Ty_DECREF(b);
            goto fail;
        }
        if (TyBytes_GET_SIZE(b) == 0) {
            Ty_DECREF(b);
            break;
        }

        old_size = TyByteArray_GET_SIZE(buffer);
        if (TyByteArray_Resize(buffer, old_size + TyBytes_GET_SIZE(b)) < 0) {
            Ty_DECREF(b);
            goto fail;
        }
        memcpy(TyByteArray_AS_STRING(buffer) + old_size,
               TyBytes_AS_STRING(b), TyBytes_GET_SIZE(b));

        Ty_DECREF(b);

        if (TyByteArray_AS_STRING(buffer)[TyByteArray_GET_SIZE(buffer) - 1] == '\n')
            break;
    }

    result = TyBytes_FromStringAndSize(TyByteArray_AS_STRING(buffer),
                                       TyByteArray_GET_SIZE(buffer));
    Ty_XDECREF(peek);
    Ty_DECREF(buffer);
    return result;
  fail:
    Ty_XDECREF(peek);
    Ty_DECREF(buffer);
    return NULL;
}

static TyObject *
iobase_iter(TyObject *self)
{
    if (iobase_check_closed(self))
        return NULL;

    return Ty_NewRef(self);
}

static TyObject *
iobase_iternext(TyObject *self)
{
    TyObject *line = PyObject_CallMethodNoArgs(self, &_Ty_ID(readline));

    if (line == NULL)
        return NULL;

    if (PyObject_Size(line) <= 0) {
        /* Error or empty */
        Ty_DECREF(line);
        return NULL;
    }

    return line;
}

/*[clinic input]
_io._IOBase.readlines
    hint: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Return a list of lines from the stream.

hint can be specified to control the number of lines read: no more
lines will be read if the total size (in bytes/characters) of all
lines so far exceeds hint.
[clinic start generated code]*/

static TyObject *
_io__IOBase_readlines_impl(TyObject *self, Ty_ssize_t hint)
/*[clinic end generated code: output=2f50421677fa3dea input=9400c786ea9dc416]*/
{
    Ty_ssize_t length = 0;
    TyObject *result, *it = NULL;

    result = TyList_New(0);
    if (result == NULL)
        return NULL;

    if (hint <= 0) {
        /* XXX special-casing this made sense in the Python version in order
           to remove the bytecode interpretation overhead, but it could
           probably be removed here. */
        TyObject *ret = PyObject_CallMethodObjArgs(result, &_Ty_ID(extend),
                                                   self, NULL);
        if (ret == NULL) {
            goto error;
        }
        Ty_DECREF(ret);
        return result;
    }

    it = PyObject_GetIter(self);
    if (it == NULL) {
        goto error;
    }

    while (1) {
        Ty_ssize_t line_length;
        TyObject *line = TyIter_Next(it);
        if (line == NULL) {
            if (TyErr_Occurred()) {
                goto error;
            }
            else
                break; /* StopIteration raised */
        }

        if (TyList_Append(result, line) < 0) {
            Ty_DECREF(line);
            goto error;
        }
        line_length = PyObject_Size(line);
        Ty_DECREF(line);
        if (line_length < 0) {
            goto error;
        }
        if (line_length > hint - length)
            break;
        length += line_length;
    }

    Ty_DECREF(it);
    return result;

 error:
    Ty_XDECREF(it);
    Ty_DECREF(result);
    return NULL;
}

/*[clinic input]
_io._IOBase.writelines
    lines: object
    /

Write a list of lines to stream.

Line separators are not added, so it is usual for each of the
lines provided to have a line separator at the end.
[clinic start generated code]*/

static TyObject *
_io__IOBase_writelines(TyObject *self, TyObject *lines)
/*[clinic end generated code: output=976eb0a9b60a6628 input=cac3fc8864183359]*/
{
    TyObject *iter, *res;

    if (iobase_check_closed(self))
        return NULL;

    iter = PyObject_GetIter(lines);
    if (iter == NULL)
        return NULL;

    while (1) {
        TyObject *line = TyIter_Next(iter);
        if (line == NULL) {
            if (TyErr_Occurred()) {
                Ty_DECREF(iter);
                return NULL;
            }
            else
                break; /* Stop Iteration */
        }

        res = NULL;
        do {
            res = PyObject_CallMethodObjArgs(self, &_Ty_ID(write), line, NULL);
        } while (res == NULL && _PyIO_trap_eintr());
        Ty_DECREF(line);
        if (res == NULL) {
            Ty_DECREF(iter);
            return NULL;
        }
        Ty_DECREF(res);
    }
    Ty_DECREF(iter);
    Py_RETURN_NONE;
}

#define clinic_state() (find_io_state_by_def(Ty_TYPE(self)))
#include "clinic/iobase.c.h"
#undef clinic_state

static TyMethodDef iobase_methods[] = {
    _IO__IOBASE_SEEK_METHODDEF
    _IO__IOBASE_TELL_METHODDEF
    _IO__IOBASE_TRUNCATE_METHODDEF
    _IO__IOBASE_FLUSH_METHODDEF
    _IO__IOBASE_CLOSE_METHODDEF

    _IO__IOBASE_SEEKABLE_METHODDEF
    _IO__IOBASE_READABLE_METHODDEF
    _IO__IOBASE_WRITABLE_METHODDEF

    {"_checkClosed",   _PyIOBase_check_closed, METH_NOARGS},
    {"_checkSeekable", iobase_check_seekable, METH_NOARGS},
    {"_checkReadable", iobase_check_readable, METH_NOARGS},
    {"_checkWritable", iobase_check_writable, METH_NOARGS},

    _IO__IOBASE_FILENO_METHODDEF
    _IO__IOBASE_ISATTY_METHODDEF

    {"__enter__", iobase_enter, METH_NOARGS},
    {"__exit__", iobase_exit, METH_VARARGS},

    _IO__IOBASE_READLINE_METHODDEF
    _IO__IOBASE_READLINES_METHODDEF
    _IO__IOBASE_WRITELINES_METHODDEF

    {NULL, NULL}
};

static TyGetSetDef iobase_getset[] = {
    {"__dict__", PyObject_GenericGetDict, NULL, NULL},
    {"closed", iobase_closed_get, NULL, NULL},
    {NULL}
};

static struct TyMemberDef iobase_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(iobase, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(iobase, dict), Py_READONLY},
    {NULL},
};


static TyType_Slot iobase_slots[] = {
    {Ty_tp_dealloc, iobase_dealloc},
    {Ty_tp_doc, (void *)iobase_doc},
    {Ty_tp_traverse, iobase_traverse},
    {Ty_tp_clear, iobase_clear},
    {Ty_tp_iter, iobase_iter},
    {Ty_tp_iternext, iobase_iternext},
    {Ty_tp_methods, iobase_methods},
    {Ty_tp_members, iobase_members},
    {Ty_tp_getset, iobase_getset},
    {Ty_tp_finalize, iobase_finalize},
    {0, NULL},
};

TyType_Spec iobase_spec = {
    .name = "_io._IOBase",
    .basicsize = sizeof(iobase),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = iobase_slots,
};

/*
 * RawIOBase class, Inherits from IOBase.
 */
TyDoc_STRVAR(rawiobase_doc,
             "Base class for raw binary I/O.");

/*
 * The read() method is implemented by calling readinto(); derived classes
 * that want to support read() only need to implement readinto() as a
 * primitive operation.  In general, readinto() can be more efficient than
 * read().
 *
 * (It would be tempting to also provide an implementation of readinto() in
 * terms of read(), in case the latter is a more suitable primitive operation,
 * but that would lead to nasty recursion in case a subclass doesn't implement
 * either.)
*/

/*[clinic input]
_io._RawIOBase.read
    size as n: Ty_ssize_t = -1
    /
[clinic start generated code]*/

static TyObject *
_io__RawIOBase_read_impl(TyObject *self, Ty_ssize_t n)
/*[clinic end generated code: output=6cdeb731e3c9f13c input=b6d0dcf6417d1374]*/
{
    TyObject *b, *res;

    if (n < 0) {
        return PyObject_CallMethodNoArgs(self, &_Ty_ID(readall));
    }

    /* TODO: allocate a bytes object directly instead and manually construct
       a writable memoryview pointing to it. */
    b = TyByteArray_FromStringAndSize(NULL, n);
    if (b == NULL)
        return NULL;

    res = PyObject_CallMethodObjArgs(self, &_Ty_ID(readinto), b, NULL);
    if (res == NULL || res == Ty_None) {
        Ty_DECREF(b);
        return res;
    }

    n = PyNumber_AsSsize_t(res, TyExc_ValueError);
    Ty_DECREF(res);
    if (n == -1 && TyErr_Occurred()) {
        Ty_DECREF(b);
        return NULL;
    }

    res = TyBytes_FromStringAndSize(TyByteArray_AsString(b), n);
    Ty_DECREF(b);
    return res;
}


/*[clinic input]
_io._RawIOBase.readall

Read until EOF, using multiple read() call.
[clinic start generated code]*/

static TyObject *
_io__RawIOBase_readall_impl(TyObject *self)
/*[clinic end generated code: output=1987b9ce929425a0 input=688874141213622a]*/
{
    int r;
    TyObject *chunks = TyList_New(0);
    TyObject *result;

    if (chunks == NULL)
        return NULL;

    while (1) {
        TyObject *data = _TyObject_CallMethod(self, &_Ty_ID(read),
                                              "i", DEFAULT_BUFFER_SIZE);
        if (!data) {
            /* NOTE: TyErr_SetFromErrno() calls TyErr_CheckSignals()
               when EINTR occurs so we needn't do it ourselves. */
            if (_PyIO_trap_eintr()) {
                continue;
            }
            Ty_DECREF(chunks);
            return NULL;
        }
        if (data == Ty_None) {
            if (TyList_GET_SIZE(chunks) == 0) {
                Ty_DECREF(chunks);
                return data;
            }
            Ty_DECREF(data);
            break;
        }
        if (!TyBytes_Check(data)) {
            Ty_DECREF(chunks);
            Ty_DECREF(data);
            TyErr_SetString(TyExc_TypeError, "read() should return bytes");
            return NULL;
        }
        if (TyBytes_GET_SIZE(data) == 0) {
            /* EOF */
            Ty_DECREF(data);
            break;
        }
        r = TyList_Append(chunks, data);
        Ty_DECREF(data);
        if (r < 0) {
            Ty_DECREF(chunks);
            return NULL;
        }
    }
    result = TyBytes_Join((TyObject *)&_Ty_SINGLETON(bytes_empty), chunks);
    Ty_DECREF(chunks);
    return result;
}

static TyObject *
rawiobase_readinto(TyObject *self, TyObject *args)
{
    TyErr_SetNone(TyExc_NotImplementedError);
    return NULL;
}

static TyObject *
rawiobase_write(TyObject *self, TyObject *args)
{
    TyErr_SetNone(TyExc_NotImplementedError);
    return NULL;
}

static TyMethodDef rawiobase_methods[] = {
    _IO__RAWIOBASE_READ_METHODDEF
    _IO__RAWIOBASE_READALL_METHODDEF
    {"readinto", rawiobase_readinto, METH_VARARGS},
    {"write", rawiobase_write, METH_VARARGS},
    {NULL, NULL}
};

static TyType_Slot rawiobase_slots[] = {
    {Ty_tp_doc, (void *)rawiobase_doc},
    {Ty_tp_methods, rawiobase_methods},
    {0, NULL},
};

/* Do not set Ty_TPFLAGS_HAVE_GC so that tp_traverse and tp_clear are inherited */
TyType_Spec rawiobase_spec = {
    .name = "_io._RawIOBase",
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = rawiobase_slots,
};
