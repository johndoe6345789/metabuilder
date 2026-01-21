/* File object implementation (what's left of it -- see io.py) */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_unicodeobject.h" // _TyUnicode_AsUTF8String()

#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // isatty()
#endif


#if defined(HAVE_GETC_UNLOCKED) && !defined(_Ty_MEMORY_SANITIZER)
   /* clang MemorySanitizer doesn't yet understand getc_unlocked. */
#  define GETC(f) getc_unlocked(f)
#  define FLOCKFILE(f) flockfile(f)
#  define FUNLOCKFILE(f) funlockfile(f)
#else
#  define GETC(f) getc(f)
#  define FLOCKFILE(f)
#  define FUNLOCKFILE(f)
#endif

/* Newline flags */
#define NEWLINE_UNKNOWN 0       /* No newline seen, yet */
#define NEWLINE_CR 1            /* \r newline seen */
#define NEWLINE_LF 2            /* \n newline seen */
#define NEWLINE_CRLF 4          /* \r\n newline seen */

/* External C interface */

TyObject *
TyFile_FromFd(int fd, const char *name, const char *mode, int buffering, const char *encoding,
              const char *errors, const char *newline, int closefd)
{
    TyObject *open, *stream;

    /* import _io in case we are being used to open io.py */
    open = TyImport_ImportModuleAttrString("_io", "open");
    if (open == NULL)
        return NULL;
    stream = PyObject_CallFunction(open, "isisssO", fd, mode,
                                  buffering, encoding, errors,
                                  newline, closefd ? Ty_True : Ty_False);
    Ty_DECREF(open);
    if (stream == NULL)
        return NULL;
    /* ignore name attribute because the name attribute of _BufferedIOMixin
       and TextIOWrapper is read only */
    return stream;
}

TyObject *
TyFile_GetLine(TyObject *f, int n)
{
    TyObject *result;

    if (f == NULL) {
        TyErr_BadInternalCall();
        return NULL;
    }

    if (n <= 0) {
        result = PyObject_CallMethodNoArgs(f, &_Ty_ID(readline));
    }
    else {
        result = _TyObject_CallMethod(f, &_Ty_ID(readline), "i", n);
    }
    if (result != NULL && !TyBytes_Check(result) &&
        !TyUnicode_Check(result)) {
        Ty_SETREF(result, NULL);
        TyErr_SetString(TyExc_TypeError,
                   "object.readline() returned non-string");
    }

    if (n < 0 && result != NULL && TyBytes_Check(result)) {
        const char *s = TyBytes_AS_STRING(result);
        Ty_ssize_t len = TyBytes_GET_SIZE(result);
        if (len == 0) {
            Ty_SETREF(result, NULL);
            TyErr_SetString(TyExc_EOFError,
                            "EOF when reading a line");
        }
        else if (s[len-1] == '\n') {
            (void) _TyBytes_Resize(&result, len-1);
        }
    }
    if (n < 0 && result != NULL && TyUnicode_Check(result)) {
        Ty_ssize_t len = TyUnicode_GET_LENGTH(result);
        if (len == 0) {
            Ty_SETREF(result, NULL);
            TyErr_SetString(TyExc_EOFError,
                            "EOF when reading a line");
        }
        else if (TyUnicode_READ_CHAR(result, len-1) == '\n') {
            TyObject *v;
            v = TyUnicode_Substring(result, 0, len-1);
            Ty_SETREF(result, v);
        }
    }
    return result;
}

/* Interfaces to write objects/strings to file-like objects */

int
TyFile_WriteObject(TyObject *v, TyObject *f, int flags)
{
    TyObject *writer, *value, *result;

    if (f == NULL) {
        TyErr_SetString(TyExc_TypeError, "writeobject with NULL file");
        return -1;
    }
    writer = PyObject_GetAttr(f, &_Ty_ID(write));
    if (writer == NULL)
        return -1;
    if (flags & Ty_PRINT_RAW) {
        value = PyObject_Str(v);
    }
    else
        value = PyObject_Repr(v);
    if (value == NULL) {
        Ty_DECREF(writer);
        return -1;
    }
    result = PyObject_CallOneArg(writer, value);
    Ty_DECREF(value);
    Ty_DECREF(writer);
    if (result == NULL)
        return -1;
    Ty_DECREF(result);
    return 0;
}

int
TyFile_WriteString(const char *s, TyObject *f)
{
    if (f == NULL) {
        /* Should be caused by a pre-existing error */
        if (!TyErr_Occurred())
            TyErr_SetString(TyExc_SystemError,
                            "null file for TyFile_WriteString");
        return -1;
    }
    else if (!TyErr_Occurred()) {
        TyObject *v = TyUnicode_FromString(s);
        int err;
        if (v == NULL)
            return -1;
        err = TyFile_WriteObject(v, f, Ty_PRINT_RAW);
        Ty_DECREF(v);
        return err;
    }
    else
        return -1;
}

/* Try to get a file-descriptor from a Python object.  If the object
   is an integer, its value is returned.  If not, the
   object's fileno() method is called if it exists; the method must return
   an integer, which is returned as the file descriptor value.
   -1 is returned on failure.
*/

int
PyObject_AsFileDescriptor(TyObject *o)
{
    int fd;
    TyObject *meth;

    if (TyLong_Check(o)) {
        if (TyBool_Check(o)) {
            if (TyErr_WarnEx(TyExc_RuntimeWarning,
                    "bool is used as a file descriptor", 1))
            {
                return -1;
            }
        }
        fd = TyLong_AsInt(o);
    }
    else if (PyObject_GetOptionalAttr(o, &_Ty_ID(fileno), &meth) < 0) {
        return -1;
    }
    else if (meth != NULL) {
        TyObject *fno = _TyObject_CallNoArgs(meth);
        Ty_DECREF(meth);
        if (fno == NULL)
            return -1;

        if (TyLong_Check(fno)) {
            fd = TyLong_AsInt(fno);
            Ty_DECREF(fno);
        }
        else {
            TyErr_SetString(TyExc_TypeError,
                            "fileno() returned a non-integer");
            Ty_DECREF(fno);
            return -1;
        }
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "argument must be an int, or have a fileno() method.");
        return -1;
    }

    if (fd == -1 && TyErr_Occurred())
        return -1;
    if (fd < 0) {
        TyErr_Format(TyExc_ValueError,
                     "file descriptor cannot be a negative integer (%i)",
                     fd);
        return -1;
    }
    return fd;
}

int
_TyLong_FileDescriptor_Converter(TyObject *o, void *ptr)
{
    int fd = PyObject_AsFileDescriptor(o);
    if (fd == -1) {
        return 0;
    }
    *(int *)ptr = fd;
    return 1;
}

char *
_Ty_UniversalNewlineFgetsWithSize(char *buf, int n, FILE *stream, TyObject *fobj, size_t* size)
{
    char *p = buf;
    int c;

    if (fobj) {
        errno = ENXIO;          /* What can you do... */
        return NULL;
    }
    FLOCKFILE(stream);
    while (--n > 0 && (c = GETC(stream)) != EOF ) {
        if (c == '\r') {
            // A \r is translated into a \n, and we skip an adjacent \n, if any.
            c = GETC(stream);
            if (c != '\n') {
                ungetc(c, stream);
                c = '\n';
            }
        }
        *p++ = c;
        if (c == '\n') {
            break;
        }
    }
    FUNLOCKFILE(stream);
    *p = '\0';
    if (p == buf) {
        return NULL;
    }
    *size = p - buf;
    return buf;
}

/*
** Ty_UniversalNewlineFgets is an fgets variation that understands
** all of \r, \n and \r\n conventions.
** The stream should be opened in binary mode.
** The fobj parameter exists solely for legacy reasons and must be NULL.
** Note that we need no error handling: fgets() treats error and eof
** identically.
*/

char *
Ty_UniversalNewlineFgets(char *buf, int n, FILE *stream, TyObject *fobj) {
    size_t size;
    return _Ty_UniversalNewlineFgetsWithSize(buf, n, stream, fobj, &size);
}

/* **************************** std printer ****************************
 * The stdprinter is used during the boot strapping phase as a preliminary
 * file like object for sys.stderr.
 */

typedef struct {
    PyObject_HEAD
    int fd;
} PyStdPrinter_Object;

TyObject *
TyFile_NewStdPrinter(int fd)
{
    PyStdPrinter_Object *self;

    if (fd != fileno(stdout) && fd != fileno(stderr)) {
        /* not enough infrastructure for TyErr_BadInternalCall() */
        return NULL;
    }

    self = PyObject_New(PyStdPrinter_Object,
                        &PyStdPrinter_Type);
    if (self != NULL) {
        self->fd = fd;
    }
    return (TyObject*)self;
}

static TyObject *
stdprinter_write(TyObject *op, TyObject *args)
{
    PyStdPrinter_Object *self = (PyStdPrinter_Object*)op;
    TyObject *unicode;
    TyObject *bytes = NULL;
    const char *str;
    Ty_ssize_t n;
    int err;

    /* The function can clear the current exception */
    assert(!TyErr_Occurred());

    if (self->fd < 0) {
        /* fd might be invalid on Windows
         * I can't raise an exception here. It may lead to an
         * unlimited recursion in the case stderr is invalid.
         */
        Py_RETURN_NONE;
    }

    if (!TyArg_ParseTuple(args, "U", &unicode)) {
        return NULL;
    }

    /* Encode Unicode to UTF-8/backslashreplace */
    str = TyUnicode_AsUTF8AndSize(unicode, &n);
    if (str == NULL) {
        TyErr_Clear();
        bytes = _TyUnicode_AsUTF8String(unicode, "backslashreplace");
        if (bytes == NULL)
            return NULL;
        str = TyBytes_AS_STRING(bytes);
        n = TyBytes_GET_SIZE(bytes);
    }

    n = _Ty_write(self->fd, str, n);
    /* save errno, it can be modified indirectly by Ty_XDECREF() */
    err = errno;

    Ty_XDECREF(bytes);

    if (n == -1) {
        if (err == EAGAIN) {
            TyErr_Clear();
            Py_RETURN_NONE;
        }
        return NULL;
    }

    return TyLong_FromSsize_t(n);
}

static TyObject *
stdprinter_fileno(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyStdPrinter_Object *self = (PyStdPrinter_Object*)op;
    return TyLong_FromLong((long) self->fd);
}

static TyObject *
stdprinter_repr(TyObject *op)
{
    PyStdPrinter_Object *self = (PyStdPrinter_Object*)op;
    return TyUnicode_FromFormat("<stdprinter(fd=%d) object at %p>",
                                self->fd, self);
}

static TyObject *
stdprinter_noop(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    Py_RETURN_NONE;
}

static TyObject *
stdprinter_isatty(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyStdPrinter_Object *self = (PyStdPrinter_Object*)op;
    long res;
    if (self->fd < 0) {
        Py_RETURN_FALSE;
    }

    Ty_BEGIN_ALLOW_THREADS
    res = isatty(self->fd);
    Ty_END_ALLOW_THREADS

    return TyBool_FromLong(res);
}

static TyMethodDef stdprinter_methods[] = {
    {"close", stdprinter_noop, METH_NOARGS, ""},
    {"flush", stdprinter_noop, METH_NOARGS, ""},
    {"fileno", stdprinter_fileno, METH_NOARGS, ""},
    {"isatty", stdprinter_isatty, METH_NOARGS, ""},
    {"write", stdprinter_write, METH_VARARGS, ""},
    {NULL,              NULL}  /*sentinel */
};

static TyObject *
get_closed(TyObject *self, void *Py_UNUSED(closure))
{
    Py_RETURN_FALSE;
}

static TyObject *
get_mode(TyObject *self, void *Py_UNUSED(closure))
{
    return TyUnicode_FromString("w");
}

static TyObject *
get_encoding(TyObject *self, void *Py_UNUSED(closure))
{
    Py_RETURN_NONE;
}

static TyGetSetDef stdprinter_getsetlist[] = {
    {"closed", get_closed, NULL, "True if the file is closed"},
    {"encoding", get_encoding, NULL, "Encoding of the file"},
    {"mode", get_mode, NULL, "String giving the file mode"},
    {0},
};

TyTypeObject PyStdPrinter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "stderrprinter",                            /* tp_name */
    sizeof(PyStdPrinter_Object),                /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    0,                                          /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    stdprinter_repr,                            /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION, /* tp_flags */
    0,                                          /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    stdprinter_methods,                         /* tp_methods */
    0,                                          /* tp_members */
    stdprinter_getsetlist,                      /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    0,                                          /* tp_new */
    PyObject_Free,                              /* tp_free */
};


/* ************************** open_code hook ***************************
 * The open_code hook allows embedders to override the method used to
 * open files that are going to be used by the runtime to execute code
 */

int
TyFile_SetOpenCodeHook(Ty_OpenCodeHookFunction hook, void *userData) {
    if (Ty_IsInitialized() &&
        TySys_Audit("setopencodehook", NULL) < 0) {
        return -1;
    }

    if (_PyRuntime.open_code_hook) {
        if (Ty_IsInitialized()) {
            TyErr_SetString(TyExc_SystemError,
                "failed to change existing open_code hook");
        }
        return -1;
    }

    _PyRuntime.open_code_hook = hook;
    _PyRuntime.open_code_userdata = userData;
    return 0;
}

TyObject *
TyFile_OpenCodeObject(TyObject *path)
{
    TyObject *f = NULL;

    if (!TyUnicode_Check(path)) {
        TyErr_Format(TyExc_TypeError, "'path' must be 'str', not '%.200s'",
                     Ty_TYPE(path)->tp_name);
        return NULL;
    }

    Ty_OpenCodeHookFunction hook = _PyRuntime.open_code_hook;
    if (hook) {
        f = hook(path, _PyRuntime.open_code_userdata);
    } else {
        TyObject *open = TyImport_ImportModuleAttrString("_io", "open");
        if (open) {
            f = PyObject_CallFunction(open, "Os", path, "rb");
            Ty_DECREF(open);
        }
    }

    return f;
}

TyObject *
TyFile_OpenCode(const char *utf8path)
{
    TyObject *pathobj = TyUnicode_FromString(utf8path);
    TyObject *f;
    if (!pathobj) {
        return NULL;
    }
    f = TyFile_OpenCodeObject(pathobj);
    Ty_DECREF(pathobj);
    return f;
}


int
_PyFile_Flush(TyObject *file)
{
    TyObject *tmp = PyObject_CallMethodNoArgs(file, &_Ty_ID(flush));
    if (tmp == NULL) {
        return -1;
    }
    Ty_DECREF(tmp);
    return 0;
}
