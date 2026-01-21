/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _Ty_convert_optional_to_ssize_t()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_io_BytesIO_readable__doc__,
"readable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be read.");

#define _IO_BYTESIO_READABLE_METHODDEF    \
    {"readable", (PyCFunction)_io_BytesIO_readable, METH_NOARGS, _io_BytesIO_readable__doc__},

static TyObject *
_io_BytesIO_readable_impl(bytesio *self);

static TyObject *
_io_BytesIO_readable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_readable_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_writable__doc__,
"writable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be written.");

#define _IO_BYTESIO_WRITABLE_METHODDEF    \
    {"writable", (PyCFunction)_io_BytesIO_writable, METH_NOARGS, _io_BytesIO_writable__doc__},

static TyObject *
_io_BytesIO_writable_impl(bytesio *self);

static TyObject *
_io_BytesIO_writable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_writable_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_seekable__doc__,
"seekable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be seeked.");

#define _IO_BYTESIO_SEEKABLE_METHODDEF    \
    {"seekable", (PyCFunction)_io_BytesIO_seekable, METH_NOARGS, _io_BytesIO_seekable__doc__},

static TyObject *
_io_BytesIO_seekable_impl(bytesio *self);

static TyObject *
_io_BytesIO_seekable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_seekable_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_flush__doc__,
"flush($self, /)\n"
"--\n"
"\n"
"Does nothing.");

#define _IO_BYTESIO_FLUSH_METHODDEF    \
    {"flush", (PyCFunction)_io_BytesIO_flush, METH_NOARGS, _io_BytesIO_flush__doc__},

static TyObject *
_io_BytesIO_flush_impl(bytesio *self);

static TyObject *
_io_BytesIO_flush(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_flush_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_getbuffer__doc__,
"getbuffer($self, /)\n"
"--\n"
"\n"
"Get a read-write view over the contents of the BytesIO object.");

#define _IO_BYTESIO_GETBUFFER_METHODDEF    \
    {"getbuffer", _PyCFunction_CAST(_io_BytesIO_getbuffer), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io_BytesIO_getbuffer__doc__},

static TyObject *
_io_BytesIO_getbuffer_impl(bytesio *self, TyTypeObject *cls);

static TyObject *
_io_BytesIO_getbuffer(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "getbuffer() takes no arguments");
        return NULL;
    }
    return _io_BytesIO_getbuffer_impl((bytesio *)self, cls);
}

TyDoc_STRVAR(_io_BytesIO_getvalue__doc__,
"getvalue($self, /)\n"
"--\n"
"\n"
"Retrieve the entire contents of the BytesIO object.");

#define _IO_BYTESIO_GETVALUE_METHODDEF    \
    {"getvalue", (PyCFunction)_io_BytesIO_getvalue, METH_NOARGS, _io_BytesIO_getvalue__doc__},

static TyObject *
_io_BytesIO_getvalue_impl(bytesio *self);

static TyObject *
_io_BytesIO_getvalue(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_getvalue_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_isatty__doc__,
"isatty($self, /)\n"
"--\n"
"\n"
"Always returns False.\n"
"\n"
"BytesIO objects are not connected to a TTY-like device.");

#define _IO_BYTESIO_ISATTY_METHODDEF    \
    {"isatty", (PyCFunction)_io_BytesIO_isatty, METH_NOARGS, _io_BytesIO_isatty__doc__},

static TyObject *
_io_BytesIO_isatty_impl(bytesio *self);

static TyObject *
_io_BytesIO_isatty(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_isatty_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_tell__doc__,
"tell($self, /)\n"
"--\n"
"\n"
"Current file position, an integer.");

#define _IO_BYTESIO_TELL_METHODDEF    \
    {"tell", (PyCFunction)_io_BytesIO_tell, METH_NOARGS, _io_BytesIO_tell__doc__},

static TyObject *
_io_BytesIO_tell_impl(bytesio *self);

static TyObject *
_io_BytesIO_tell(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_tell_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO_read__doc__,
"read($self, size=-1, /)\n"
"--\n"
"\n"
"Read at most size bytes, returned as a bytes object.\n"
"\n"
"If the size argument is negative, read until EOF is reached.\n"
"Return an empty bytes object at EOF.");

#define _IO_BYTESIO_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_io_BytesIO_read), METH_FASTCALL, _io_BytesIO_read__doc__},

static TyObject *
_io_BytesIO_read_impl(bytesio *self, Ty_ssize_t size);

static TyObject *
_io_BytesIO_read(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = -1;

    if (!_TyArg_CheckPositional("read", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &size)) {
        goto exit;
    }
skip_optional:
    return_value = _io_BytesIO_read_impl((bytesio *)self, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_read1__doc__,
"read1($self, size=-1, /)\n"
"--\n"
"\n"
"Read at most size bytes, returned as a bytes object.\n"
"\n"
"If the size argument is negative or omitted, read until EOF is reached.\n"
"Return an empty bytes object at EOF.");

#define _IO_BYTESIO_READ1_METHODDEF    \
    {"read1", _PyCFunction_CAST(_io_BytesIO_read1), METH_FASTCALL, _io_BytesIO_read1__doc__},

static TyObject *
_io_BytesIO_read1_impl(bytesio *self, Ty_ssize_t size);

static TyObject *
_io_BytesIO_read1(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = -1;

    if (!_TyArg_CheckPositional("read1", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &size)) {
        goto exit;
    }
skip_optional:
    return_value = _io_BytesIO_read1_impl((bytesio *)self, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_readline__doc__,
"readline($self, size=-1, /)\n"
"--\n"
"\n"
"Next line from the file, as a bytes object.\n"
"\n"
"Retain newline.  A non-negative size argument limits the maximum\n"
"number of bytes to return (an incomplete line may be returned then).\n"
"Return an empty bytes object at EOF.");

#define _IO_BYTESIO_READLINE_METHODDEF    \
    {"readline", _PyCFunction_CAST(_io_BytesIO_readline), METH_FASTCALL, _io_BytesIO_readline__doc__},

static TyObject *
_io_BytesIO_readline_impl(bytesio *self, Ty_ssize_t size);

static TyObject *
_io_BytesIO_readline(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = -1;

    if (!_TyArg_CheckPositional("readline", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &size)) {
        goto exit;
    }
skip_optional:
    return_value = _io_BytesIO_readline_impl((bytesio *)self, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_readlines__doc__,
"readlines($self, size=None, /)\n"
"--\n"
"\n"
"List of bytes objects, each a line from the file.\n"
"\n"
"Call readline() repeatedly and return a list of the lines so read.\n"
"The optional size argument, if given, is an approximate bound on the\n"
"total number of bytes in the lines returned.");

#define _IO_BYTESIO_READLINES_METHODDEF    \
    {"readlines", _PyCFunction_CAST(_io_BytesIO_readlines), METH_FASTCALL, _io_BytesIO_readlines__doc__},

static TyObject *
_io_BytesIO_readlines_impl(bytesio *self, TyObject *arg);

static TyObject *
_io_BytesIO_readlines(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *arg = Ty_None;

    if (!_TyArg_CheckPositional("readlines", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    arg = args[0];
skip_optional:
    return_value = _io_BytesIO_readlines_impl((bytesio *)self, arg);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_readinto__doc__,
"readinto($self, buffer, /)\n"
"--\n"
"\n"
"Read bytes into buffer.\n"
"\n"
"Returns number of bytes read (0 for EOF), or None if the object\n"
"is set not to block and has no data to read.");

#define _IO_BYTESIO_READINTO_METHODDEF    \
    {"readinto", (PyCFunction)_io_BytesIO_readinto, METH_O, _io_BytesIO_readinto__doc__},

static TyObject *
_io_BytesIO_readinto_impl(bytesio *self, Ty_buffer *buffer);

static TyObject *
_io_BytesIO_readinto(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_buffer buffer = {NULL, NULL};

    if (PyObject_GetBuffer(arg, &buffer, PyBUF_WRITABLE) < 0) {
        _TyArg_BadArgument("readinto", "argument", "read-write bytes-like object", arg);
        goto exit;
    }
    return_value = _io_BytesIO_readinto_impl((bytesio *)self, &buffer);

exit:
    /* Cleanup for buffer */
    if (buffer.obj) {
       PyBuffer_Release(&buffer);
    }

    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_truncate__doc__,
"truncate($self, size=None, /)\n"
"--\n"
"\n"
"Truncate the file to at most size bytes.\n"
"\n"
"Size defaults to the current file position, as returned by tell().\n"
"The current file position is unchanged.  Returns the new size.");

#define _IO_BYTESIO_TRUNCATE_METHODDEF    \
    {"truncate", _PyCFunction_CAST(_io_BytesIO_truncate), METH_FASTCALL, _io_BytesIO_truncate__doc__},

static TyObject *
_io_BytesIO_truncate_impl(bytesio *self, Ty_ssize_t size);

static TyObject *
_io_BytesIO_truncate(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = ((bytesio *)self)->pos;

    if (!_TyArg_CheckPositional("truncate", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &size)) {
        goto exit;
    }
skip_optional:
    return_value = _io_BytesIO_truncate_impl((bytesio *)self, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_seek__doc__,
"seek($self, pos, whence=0, /)\n"
"--\n"
"\n"
"Change stream position.\n"
"\n"
"Seek to byte offset pos relative to position indicated by whence:\n"
"     0  Start of stream (the default).  pos should be >= 0;\n"
"     1  Current position - pos may be negative;\n"
"     2  End of stream - pos usually negative.\n"
"Returns the new absolute position.");

#define _IO_BYTESIO_SEEK_METHODDEF    \
    {"seek", _PyCFunction_CAST(_io_BytesIO_seek), METH_FASTCALL, _io_BytesIO_seek__doc__},

static TyObject *
_io_BytesIO_seek_impl(bytesio *self, Ty_ssize_t pos, int whence);

static TyObject *
_io_BytesIO_seek(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t pos;
    int whence = 0;

    if (!_TyArg_CheckPositional("seek", nargs, 1, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        pos = ival;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    whence = TyLong_AsInt(args[1]);
    if (whence == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = _io_BytesIO_seek_impl((bytesio *)self, pos, whence);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_write__doc__,
"write($self, b, /)\n"
"--\n"
"\n"
"Write bytes to file.\n"
"\n"
"Return the number of bytes written.");

#define _IO_BYTESIO_WRITE_METHODDEF    \
    {"write", (PyCFunction)_io_BytesIO_write, METH_O, _io_BytesIO_write__doc__},

static TyObject *
_io_BytesIO_write_impl(bytesio *self, TyObject *b);

static TyObject *
_io_BytesIO_write(TyObject *self, TyObject *b)
{
    TyObject *return_value = NULL;

    return_value = _io_BytesIO_write_impl((bytesio *)self, b);

    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_writelines__doc__,
"writelines($self, lines, /)\n"
"--\n"
"\n"
"Write lines to the file.\n"
"\n"
"Note that newlines are not added.  lines can be any iterable object\n"
"producing bytes-like objects. This is equivalent to calling write() for\n"
"each element.");

#define _IO_BYTESIO_WRITELINES_METHODDEF    \
    {"writelines", (PyCFunction)_io_BytesIO_writelines, METH_O, _io_BytesIO_writelines__doc__},

static TyObject *
_io_BytesIO_writelines_impl(bytesio *self, TyObject *lines);

static TyObject *
_io_BytesIO_writelines(TyObject *self, TyObject *lines)
{
    TyObject *return_value = NULL;

    return_value = _io_BytesIO_writelines_impl((bytesio *)self, lines);

    return return_value;
}

TyDoc_STRVAR(_io_BytesIO_close__doc__,
"close($self, /)\n"
"--\n"
"\n"
"Disable all I/O operations.");

#define _IO_BYTESIO_CLOSE_METHODDEF    \
    {"close", (PyCFunction)_io_BytesIO_close, METH_NOARGS, _io_BytesIO_close__doc__},

static TyObject *
_io_BytesIO_close_impl(bytesio *self);

static TyObject *
_io_BytesIO_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io_BytesIO_close_impl((bytesio *)self);
}

TyDoc_STRVAR(_io_BytesIO___init____doc__,
"BytesIO(initial_bytes=b\'\')\n"
"--\n"
"\n"
"Buffered I/O implementation using an in-memory bytes buffer.");

static int
_io_BytesIO___init___impl(bytesio *self, TyObject *initvalue);

static int
_io_BytesIO___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { &_Ty_ID(initial_bytes), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"initial_bytes", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "BytesIO",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *initvalue = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    initvalue = fastargs[0];
skip_optional_pos:
    return_value = _io_BytesIO___init___impl((bytesio *)self, initvalue);

exit:
    return return_value;
}
/*[clinic end generated code: output=6dbfd82f4e9d4ef3 input=a9049054013a1b77]*/
