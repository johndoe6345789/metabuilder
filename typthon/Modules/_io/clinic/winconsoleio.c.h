/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _Ty_convert_optional_to_ssize_t()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_close__doc__,
"close($self, /)\n"
"--\n"
"\n"
"Close the console object.\n"
"\n"
"A closed console object cannot be used for further I/O operations.\n"
"close() may be called more than once without error.");

#define _IO__WINDOWSCONSOLEIO_CLOSE_METHODDEF    \
    {"close", _PyCFunction_CAST(_io__WindowsConsoleIO_close), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__WindowsConsoleIO_close__doc__},

static TyObject *
_io__WindowsConsoleIO_close_impl(winconsoleio *self, TyTypeObject *cls);

static TyObject *
_io__WindowsConsoleIO_close(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "close() takes no arguments");
        return NULL;
    }
    return _io__WindowsConsoleIO_close_impl((winconsoleio *)self, cls);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO___init____doc__,
"_WindowsConsoleIO(file, mode=\'r\', closefd=True, opener=None)\n"
"--\n"
"\n"
"Open a console buffer by file descriptor.\n"
"\n"
"The mode can be \'rb\' (default), or \'wb\' for reading or writing bytes. All\n"
"other mode characters will be ignored. Mode \'b\' will be assumed if it is\n"
"omitted. The *opener* parameter is always ignored.");

static int
_io__WindowsConsoleIO___init___impl(winconsoleio *self, TyObject *nameobj,
                                    const char *mode, int closefd,
                                    TyObject *opener);

static int
_io__WindowsConsoleIO___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { &_Ty_ID(file), &_Ty_ID(mode), &_Ty_ID(closefd), &_Ty_ID(opener), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"file", "mode", "closefd", "opener", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_WindowsConsoleIO",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *nameobj;
    const char *mode = "r";
    int closefd = 1;
    TyObject *opener = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    nameobj = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        if (!TyUnicode_Check(fastargs[1])) {
            _TyArg_BadArgument("_WindowsConsoleIO", "argument 'mode'", "str", fastargs[1]);
            goto exit;
        }
        Ty_ssize_t mode_length;
        mode = TyUnicode_AsUTF8AndSize(fastargs[1], &mode_length);
        if (mode == NULL) {
            goto exit;
        }
        if (strlen(mode) != (size_t)mode_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        closefd = PyObject_IsTrue(fastargs[2]);
        if (closefd < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    opener = fastargs[3];
skip_optional_pos:
    return_value = _io__WindowsConsoleIO___init___impl((winconsoleio *)self, nameobj, mode, closefd, opener);

exit:
    return return_value;
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_fileno__doc__,
"fileno($self, /)\n"
"--\n"
"\n"
"Return the underlying file descriptor (an integer).");

#define _IO__WINDOWSCONSOLEIO_FILENO_METHODDEF    \
    {"fileno", (PyCFunction)_io__WindowsConsoleIO_fileno, METH_NOARGS, _io__WindowsConsoleIO_fileno__doc__},

static TyObject *
_io__WindowsConsoleIO_fileno_impl(winconsoleio *self);

static TyObject *
_io__WindowsConsoleIO_fileno(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io__WindowsConsoleIO_fileno_impl((winconsoleio *)self);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_readable__doc__,
"readable($self, /)\n"
"--\n"
"\n"
"True if console is an input buffer.");

#define _IO__WINDOWSCONSOLEIO_READABLE_METHODDEF    \
    {"readable", (PyCFunction)_io__WindowsConsoleIO_readable, METH_NOARGS, _io__WindowsConsoleIO_readable__doc__},

static TyObject *
_io__WindowsConsoleIO_readable_impl(winconsoleio *self);

static TyObject *
_io__WindowsConsoleIO_readable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io__WindowsConsoleIO_readable_impl((winconsoleio *)self);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_writable__doc__,
"writable($self, /)\n"
"--\n"
"\n"
"True if console is an output buffer.");

#define _IO__WINDOWSCONSOLEIO_WRITABLE_METHODDEF    \
    {"writable", (PyCFunction)_io__WindowsConsoleIO_writable, METH_NOARGS, _io__WindowsConsoleIO_writable__doc__},

static TyObject *
_io__WindowsConsoleIO_writable_impl(winconsoleio *self);

static TyObject *
_io__WindowsConsoleIO_writable(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io__WindowsConsoleIO_writable_impl((winconsoleio *)self);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_readinto__doc__,
"readinto($self, buffer, /)\n"
"--\n"
"\n"
"Same as RawIOBase.readinto().");

#define _IO__WINDOWSCONSOLEIO_READINTO_METHODDEF    \
    {"readinto", _PyCFunction_CAST(_io__WindowsConsoleIO_readinto), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__WindowsConsoleIO_readinto__doc__},

static TyObject *
_io__WindowsConsoleIO_readinto_impl(winconsoleio *self, TyTypeObject *cls,
                                    Ty_buffer *buffer);

static TyObject *
_io__WindowsConsoleIO_readinto(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "readinto",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_buffer buffer = {NULL, NULL};

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &buffer, PyBUF_WRITABLE) < 0) {
        _TyArg_BadArgument("readinto", "argument 1", "read-write bytes-like object", args[0]);
        goto exit;
    }
    return_value = _io__WindowsConsoleIO_readinto_impl((winconsoleio *)self, cls, &buffer);

exit:
    /* Cleanup for buffer */
    if (buffer.obj) {
       PyBuffer_Release(&buffer);
    }

    return return_value;
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_readall__doc__,
"readall($self, /)\n"
"--\n"
"\n"
"Read all data from the console, returned as bytes.\n"
"\n"
"Return an empty bytes object at EOF.");

#define _IO__WINDOWSCONSOLEIO_READALL_METHODDEF    \
    {"readall", (PyCFunction)_io__WindowsConsoleIO_readall, METH_NOARGS, _io__WindowsConsoleIO_readall__doc__},

static TyObject *
_io__WindowsConsoleIO_readall_impl(winconsoleio *self);

static TyObject *
_io__WindowsConsoleIO_readall(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io__WindowsConsoleIO_readall_impl((winconsoleio *)self);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_read__doc__,
"read($self, size=-1, /)\n"
"--\n"
"\n"
"Read at most size bytes, returned as bytes.\n"
"\n"
"Only makes one system call when size is a positive integer,\n"
"so less data may be returned than requested.\n"
"Return an empty bytes object at EOF.");

#define _IO__WINDOWSCONSOLEIO_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(_io__WindowsConsoleIO_read), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__WindowsConsoleIO_read__doc__},

static TyObject *
_io__WindowsConsoleIO_read_impl(winconsoleio *self, TyTypeObject *cls,
                                Ty_ssize_t size);

static TyObject *
_io__WindowsConsoleIO_read(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "read",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t size = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional_posonly;
    }
    if (!_Ty_convert_optional_to_ssize_t(args[0], &size)) {
        goto exit;
    }
skip_optional_posonly:
    return_value = _io__WindowsConsoleIO_read_impl((winconsoleio *)self, cls, size);

exit:
    return return_value;
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_write__doc__,
"write($self, b, /)\n"
"--\n"
"\n"
"Write buffer b to file, return number of bytes written.\n"
"\n"
"Only makes one system call, so not all of the data may be written.\n"
"The number of bytes actually written is returned.");

#define _IO__WINDOWSCONSOLEIO_WRITE_METHODDEF    \
    {"write", _PyCFunction_CAST(_io__WindowsConsoleIO_write), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _io__WindowsConsoleIO_write__doc__},

static TyObject *
_io__WindowsConsoleIO_write_impl(winconsoleio *self, TyTypeObject *cls,
                                 Ty_buffer *b);

static TyObject *
_io__WindowsConsoleIO_write(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "write",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_buffer b = {NULL, NULL};

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &b, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _io__WindowsConsoleIO_write_impl((winconsoleio *)self, cls, &b);

exit:
    /* Cleanup for b */
    if (b.obj) {
       PyBuffer_Release(&b);
    }

    return return_value;
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#if defined(HAVE_WINDOWS_CONSOLE_IO)

TyDoc_STRVAR(_io__WindowsConsoleIO_isatty__doc__,
"isatty($self, /)\n"
"--\n"
"\n"
"Always True.");

#define _IO__WINDOWSCONSOLEIO_ISATTY_METHODDEF    \
    {"isatty", (PyCFunction)_io__WindowsConsoleIO_isatty, METH_NOARGS, _io__WindowsConsoleIO_isatty__doc__},

static TyObject *
_io__WindowsConsoleIO_isatty_impl(winconsoleio *self);

static TyObject *
_io__WindowsConsoleIO_isatty(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _io__WindowsConsoleIO_isatty_impl((winconsoleio *)self);
}

#endif /* defined(HAVE_WINDOWS_CONSOLE_IO) */

#ifndef _IO__WINDOWSCONSOLEIO_CLOSE_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_CLOSE_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_CLOSE_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_FILENO_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_FILENO_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_FILENO_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_READABLE_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_READABLE_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_READABLE_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_WRITABLE_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_WRITABLE_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_WRITABLE_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_READINTO_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_READINTO_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_READINTO_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_READALL_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_READALL_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_READALL_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_READ_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_READ_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_READ_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_WRITE_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_WRITE_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_WRITE_METHODDEF) */

#ifndef _IO__WINDOWSCONSOLEIO_ISATTY_METHODDEF
    #define _IO__WINDOWSCONSOLEIO_ISATTY_METHODDEF
#endif /* !defined(_IO__WINDOWSCONSOLEIO_ISATTY_METHODDEF) */
/*[clinic end generated code: output=ce50bcd905f1f213 input=a9049054013a1b77]*/
