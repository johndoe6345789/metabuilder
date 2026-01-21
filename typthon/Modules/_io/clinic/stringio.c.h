/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _Ty_convert_optional_to_ssize_t()
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_io_StringIO_getvalue__doc__,
"getvalue($self, /)\n"
"--\n"
"\n"
"Retrieve the entire contents of the object.");

#define _IO_STRINGIO_GETVALUE_METHODDEF    \
    {"getvalue", (PyCFunction)_io_StringIO_getvalue, METH_NOARGS, _io_StringIO_getvalue__doc__},

static TyObject *
_io_StringIO_getvalue_impl(stringio *self);

static TyObject *
_io_StringIO_getvalue(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_getvalue_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO_tell__doc__,
"tell($self, /)\n"
"--\n"
"\n"
"Tell the current file position.");

#define _IO_STRINGIO_TELL_METHODDEF    \
    {"tell", (PyCFunction)_io_StringIO_tell, METH_NOARGS, _io_StringIO_tell__doc__},

static TyObject *
_io_StringIO_tell_impl(stringio *self);

static TyObject *
_io_StringIO_tell(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_tell_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO_read__doc__,
"read($self, size=-1, /)\n"
"--\n"
"\n"
"Read at most size characters, returned as a string.\n"
"\n"
"If the argument is negative or omitted, read until EOF\n"
"is reached. Return an empty string at EOF.");

#define _IO_STRINGIO_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_io_StringIO_read), METH_FASTCALL, _io_StringIO_read__doc__},

static TyObject *
_io_StringIO_read_impl(stringio *self, Ty_ssize_t size);

static TyObject *
_io_StringIO_read(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_read_impl((stringio *)self, size);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_StringIO_readline__doc__,
"readline($self, size=-1, /)\n"
"--\n"
"\n"
"Read until newline or EOF.\n"
"\n"
"Returns an empty string if EOF is hit immediately.");

#define _IO_STRINGIO_READLINE_METHODDEF    \
    {"readline", _PyCFunction_CAST(_io_StringIO_readline), METH_FASTCALL, _io_StringIO_readline__doc__},

static TyObject *
_io_StringIO_readline_impl(stringio *self, Ty_ssize_t size);

static TyObject *
_io_StringIO_readline(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_readline_impl((stringio *)self, size);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_StringIO_truncate__doc__,
"truncate($self, pos=None, /)\n"
"--\n"
"\n"
"Truncate size to pos.\n"
"\n"
"The pos argument defaults to the current file position, as\n"
"returned by tell().  The current file position is unchanged.\n"
"Returns the new absolute position.");

#define _IO_STRINGIO_TRUNCATE_METHODDEF    \
    {"truncate", _PyCFunction_CAST(_io_StringIO_truncate), METH_FASTCALL, _io_StringIO_truncate__doc__},

static TyObject *
_io_StringIO_truncate_impl(stringio *self, Ty_ssize_t size);

static TyObject *
_io_StringIO_truncate(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size = ((stringio *)self)->pos;

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
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_truncate_impl((stringio *)self, size);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_StringIO_seek__doc__,
"seek($self, pos, whence=0, /)\n"
"--\n"
"\n"
"Change stream position.\n"
"\n"
"Seek to character offset pos relative to position indicated by whence:\n"
"    0  Start of stream (the default).  pos should be >= 0;\n"
"    1  Current position - pos must be 0;\n"
"    2  End of stream - pos must be 0.\n"
"Returns the new absolute position.");

#define _IO_STRINGIO_SEEK_METHODDEF    \
    {"seek", _PyCFunction_CAST(_io_StringIO_seek), METH_FASTCALL, _io_StringIO_seek__doc__},

static TyObject *
_io_StringIO_seek_impl(stringio *self, Ty_ssize_t pos, int whence);

static TyObject *
_io_StringIO_seek(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_seek_impl((stringio *)self, pos, whence);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_io_StringIO_write__doc__,
"write($self, s, /)\n"
"--\n"
"\n"
"Write string to file.\n"
"\n"
"Returns the number of characters written, which is always equal to\n"
"the length of the string.");

#define _IO_STRINGIO_WRITE_METHODDEF    \
    {"write", (PyCFunction)_io_StringIO_write, METH_O, _io_StringIO_write__doc__},

static TyObject *
_io_StringIO_write_impl(stringio *self, TyObject *obj);

static TyObject *
_io_StringIO_write(TyObject *self, TyObject *obj)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_write_impl((stringio *)self, obj);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO_close__doc__,
"close($self, /)\n"
"--\n"
"\n"
"Close the IO object.\n"
"\n"
"Attempting any further operation after the object is closed\n"
"will raise a ValueError.\n"
"\n"
"This method has no effect if the file is already closed.");

#define _IO_STRINGIO_CLOSE_METHODDEF    \
    {"close", (PyCFunction)_io_StringIO_close, METH_NOARGS, _io_StringIO_close__doc__},

static TyObject *
_io_StringIO_close_impl(stringio *self);

static TyObject *
_io_StringIO_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_close_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO___init____doc__,
"StringIO(initial_value=\'\', newline=\'\\n\')\n"
"--\n"
"\n"
"Text I/O implementation using an in-memory buffer.\n"
"\n"
"The initial_value argument sets the value of object.  The newline\n"
"argument is like the one of TextIOWrapper\'s constructor.");

static int
_io_StringIO___init___impl(stringio *self, TyObject *value,
                           TyObject *newline_obj);

static int
_io_StringIO___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { &_Ty_ID(initial_value), &_Ty_ID(newline), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"initial_value", "newline", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "StringIO",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *value = NULL;
    TyObject *newline_obj = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        value = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    newline_obj = fastargs[1];
skip_optional_pos:
    return_value = _io_StringIO___init___impl((stringio *)self, value, newline_obj);

exit:
    return return_value;
}

TyDoc_STRVAR(_io_StringIO_readable__doc__,
"readable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be read.");

#define _IO_STRINGIO_READABLE_METHODDEF    \
    {"readable", (PyCFunction)_io_StringIO_readable, METH_NOARGS, _io_StringIO_readable__doc__},

static TyObject *
_io_StringIO_readable_impl(stringio *self);

static TyObject *
_io_StringIO_readable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_readable_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO_writable__doc__,
"writable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be written.");

#define _IO_STRINGIO_WRITABLE_METHODDEF    \
    {"writable", (PyCFunction)_io_StringIO_writable, METH_NOARGS, _io_StringIO_writable__doc__},

static TyObject *
_io_StringIO_writable_impl(stringio *self);

static TyObject *
_io_StringIO_writable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_writable_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO_seekable__doc__,
"seekable($self, /)\n"
"--\n"
"\n"
"Returns True if the IO object can be seeked.");

#define _IO_STRINGIO_SEEKABLE_METHODDEF    \
    {"seekable", (PyCFunction)_io_StringIO_seekable, METH_NOARGS, _io_StringIO_seekable__doc__},

static TyObject *
_io_StringIO_seekable_impl(stringio *self);

static TyObject *
_io_StringIO_seekable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_seekable_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO___getstate____doc__,
"__getstate__($self, /)\n"
"--\n"
"\n");

#define _IO_STRINGIO___GETSTATE___METHODDEF    \
    {"__getstate__", (PyCFunction)_io_StringIO___getstate__, METH_NOARGS, _io_StringIO___getstate____doc__},

static TyObject *
_io_StringIO___getstate___impl(stringio *self);

static TyObject *
_io_StringIO___getstate__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO___getstate___impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_io_StringIO___setstate____doc__,
"__setstate__($self, state, /)\n"
"--\n"
"\n");

#define _IO_STRINGIO___SETSTATE___METHODDEF    \
    {"__setstate__", (PyCFunction)_io_StringIO___setstate__, METH_O, _io_StringIO___setstate____doc__},

static TyObject *
_io_StringIO___setstate___impl(stringio *self, TyObject *state);

static TyObject *
_io_StringIO___setstate__(TyObject *self, TyObject *state)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO___setstate___impl((stringio *)self, state);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_StringIO_closed_DOCSTR)
#  define _io_StringIO_closed_DOCSTR NULL
#endif
#if defined(_IO_STRINGIO_CLOSED_GETSETDEF)
#  undef _IO_STRINGIO_CLOSED_GETSETDEF
#  define _IO_STRINGIO_CLOSED_GETSETDEF {"closed", (getter)_io_StringIO_closed_get, (setter)_io_StringIO_closed_set, _io_StringIO_closed_DOCSTR},
#else
#  define _IO_STRINGIO_CLOSED_GETSETDEF {"closed", (getter)_io_StringIO_closed_get, NULL, _io_StringIO_closed_DOCSTR},
#endif

static TyObject *
_io_StringIO_closed_get_impl(stringio *self);

static TyObject *
_io_StringIO_closed_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_closed_get_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_StringIO_line_buffering_DOCSTR)
#  define _io_StringIO_line_buffering_DOCSTR NULL
#endif
#if defined(_IO_STRINGIO_LINE_BUFFERING_GETSETDEF)
#  undef _IO_STRINGIO_LINE_BUFFERING_GETSETDEF
#  define _IO_STRINGIO_LINE_BUFFERING_GETSETDEF {"line_buffering", (getter)_io_StringIO_line_buffering_get, (setter)_io_StringIO_line_buffering_set, _io_StringIO_line_buffering_DOCSTR},
#else
#  define _IO_STRINGIO_LINE_BUFFERING_GETSETDEF {"line_buffering", (getter)_io_StringIO_line_buffering_get, NULL, _io_StringIO_line_buffering_DOCSTR},
#endif

static TyObject *
_io_StringIO_line_buffering_get_impl(stringio *self);

static TyObject *
_io_StringIO_line_buffering_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_line_buffering_get_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(_io_StringIO_newlines_DOCSTR)
#  define _io_StringIO_newlines_DOCSTR NULL
#endif
#if defined(_IO_STRINGIO_NEWLINES_GETSETDEF)
#  undef _IO_STRINGIO_NEWLINES_GETSETDEF
#  define _IO_STRINGIO_NEWLINES_GETSETDEF {"newlines", (getter)_io_StringIO_newlines_get, (setter)_io_StringIO_newlines_set, _io_StringIO_newlines_DOCSTR},
#else
#  define _IO_STRINGIO_NEWLINES_GETSETDEF {"newlines", (getter)_io_StringIO_newlines_get, NULL, _io_StringIO_newlines_DOCSTR},
#endif

static TyObject *
_io_StringIO_newlines_get_impl(stringio *self);

static TyObject *
_io_StringIO_newlines_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _io_StringIO_newlines_get_impl((stringio *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}
/*[clinic end generated code: output=5bfaaab7f41ee6b5 input=a9049054013a1b77]*/
