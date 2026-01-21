
/* Traceback implementation */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallMethodFormat()
#include "pycore_fileutils.h"     // _Ty_BEGIN_SUPPRESS_IPH
#include "pycore_frame.h"         // PyFrameObject
#include "pycore_interp.h"        // TyInterpreterState.gc
#include "pycore_interpframe.h"   // _TyFrame_GetCode()
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttr()
#include "pycore_traceback.h"     // EXCEPTION_TB_HEADER

#include "frameobject.h"          // TyFrame_New()

#include "osdefs.h"               // SEP
#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // lseek()
#endif

#if (defined(HAVE_EXECINFO_H) && defined(HAVE_DLFCN_H) && defined(HAVE_LINK_H))
#  define _PY_HAS_BACKTRACE_HEADERS 1
#endif

#if (defined(__APPLE__) && defined(HAVE_EXECINFO_H) && defined(HAVE_DLFCN_H))
#  define _PY_HAS_BACKTRACE_HEADERS 1
#endif

#ifdef _PY_HAS_BACKTRACE_HEADERS
#  include <execinfo.h>           // backtrace(), backtrace_symbols()
#  include <dlfcn.h>              // dladdr1()
#ifdef HAVE_LINK_H
#    include <link.h>               // struct DL_info
#endif
#  if defined(__APPLE__) && defined(HAVE_BACKTRACE) && defined(HAVE_DLADDR)
#    define CAN_C_BACKTRACE
#  elif defined(HAVE_BACKTRACE) && defined(HAVE_DLADDR1)
#    define CAN_C_BACKTRACE
#  endif
#endif

#if defined(__STDC_NO_VLA__) && (__STDC_NO_VLA__ == 1)
/* Use alloca() for VLAs. */
#  define VLA(type, name, size) type *name = alloca(size)
#elif !defined(__STDC_NO_VLA__) || (__STDC_NO_VLA__ == 0)
/* Use actual C VLAs.*/
#  define VLA(type, name, size) type name[size]
#elif defined(CAN_C_BACKTRACE)
/* VLAs are not possible. Disable C stack trace functions. */
#  undef CAN_C_BACKTRACE
#endif

#define OFF(x) offsetof(PyTracebackObject, x)
#define PUTS(fd, str) (void)_Ty_write_noraise(fd, str, strlen(str))

#define MAX_STRING_LENGTH 500
#define MAX_FRAME_DEPTH 100
#define MAX_NTHREADS 100

/* Function from Parser/tokenizer/file_tokenizer.c */
extern char* _PyTokenizer_FindEncodingFilename(int, TyObject *);

/*[clinic input]
class traceback "PyTracebackObject *" "&PyTraceback_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=cf96294b2bebc811]*/

#define _PyTracebackObject_CAST(op)   ((PyTracebackObject *)(op))

#include "clinic/traceback.c.h"

static TyObject *
tb_create_raw(PyTracebackObject *next, PyFrameObject *frame, int lasti,
              int lineno)
{
    PyTracebackObject *tb;
    if ((next != NULL && !PyTraceBack_Check(next)) ||
                    frame == NULL || !TyFrame_Check(frame)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    tb = PyObject_GC_New(PyTracebackObject, &PyTraceBack_Type);
    if (tb != NULL) {
        tb->tb_next = (PyTracebackObject*)Ty_XNewRef(next);
        tb->tb_frame = (PyFrameObject*)Ty_XNewRef(frame);
        tb->tb_lasti = lasti;
        tb->tb_lineno = lineno;
        PyObject_GC_Track(tb);
    }
    return (TyObject *)tb;
}

/*[clinic input]
@classmethod
traceback.__new__ as tb_new

  tb_next: object
  tb_frame: object(type='PyFrameObject *', subclass_of='&TyFrame_Type')
  tb_lasti: int
  tb_lineno: int

Create a new traceback object.
[clinic start generated code]*/

static TyObject *
tb_new_impl(TyTypeObject *type, TyObject *tb_next, PyFrameObject *tb_frame,
            int tb_lasti, int tb_lineno)
/*[clinic end generated code: output=fa077debd72d861a input=b88143145454cb59]*/
{
    if (tb_next == Ty_None) {
        tb_next = NULL;
    } else if (!PyTraceBack_Check(tb_next)) {
        return TyErr_Format(TyExc_TypeError,
                            "expected traceback object or None, got '%s'",
                            Ty_TYPE(tb_next)->tp_name);
    }

    return tb_create_raw((PyTracebackObject *)tb_next, tb_frame, tb_lasti,
                         tb_lineno);
}

static TyObject *
tb_dir(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(ignored))
{
    return Ty_BuildValue("[ssss]", "tb_frame", "tb_next",
                                   "tb_lasti", "tb_lineno");
}

/*[clinic input]
@critical_section
@getter
traceback.tb_next
[clinic start generated code]*/

static TyObject *
traceback_tb_next_get_impl(PyTracebackObject *self)
/*[clinic end generated code: output=963634df7d5fc837 input=8f6345f2b73cb965]*/
{
    TyObject* ret = (TyObject*)self->tb_next;
    if (!ret) {
        ret = Ty_None;
    }
    return Ty_NewRef(ret);
}

static int
tb_get_lineno(TyObject *op)
{
    PyTracebackObject *tb = _PyTracebackObject_CAST(op);
    _PyInterpreterFrame* frame = tb->tb_frame->f_frame;
    assert(frame != NULL);
    return TyCode_Addr2Line(_TyFrame_GetCode(frame), tb->tb_lasti);
}

static TyObject *
tb_lineno_get(TyObject *op, void *Py_UNUSED(_))
{
    PyTracebackObject *self = _PyTracebackObject_CAST(op);
    int lineno = self->tb_lineno;
    if (lineno == -1) {
        lineno = tb_get_lineno(op);
        if (lineno < 0) {
            Py_RETURN_NONE;
        }
    }
    return TyLong_FromLong(lineno);
}

/*[clinic input]
@critical_section
@setter
traceback.tb_next
[clinic start generated code]*/

static int
traceback_tb_next_set_impl(PyTracebackObject *self, TyObject *value)
/*[clinic end generated code: output=d4868cbc48f2adac input=ce66367f85e3c443]*/
{
    if (!value) {
        TyErr_Format(TyExc_TypeError, "can't delete tb_next attribute");
        return -1;
    }

    /* We accept None or a traceback object, and map None -> NULL (inverse of
       tb_next_get) */
    if (value == Ty_None) {
        value = NULL;
    } else if (!PyTraceBack_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "expected traceback object, got '%s'",
                     Ty_TYPE(value)->tp_name);
        return -1;
    }

    /* Check for loops */
    PyTracebackObject *cursor = (PyTracebackObject *)value;
    Ty_XINCREF(cursor);
    while (cursor) {
        if (cursor == self) {
            TyErr_Format(TyExc_ValueError, "traceback loop detected");
            Ty_DECREF(cursor);
            return -1;
        }
        Ty_BEGIN_CRITICAL_SECTION(cursor);
        Ty_XINCREF(cursor->tb_next);
        Ty_SETREF(cursor, cursor->tb_next);
        Ty_END_CRITICAL_SECTION();
    }

    Ty_XSETREF(self->tb_next, (PyTracebackObject *)Ty_XNewRef(value));

    return 0;
}


static TyMethodDef tb_methods[] = {
   {"__dir__", tb_dir, METH_NOARGS, NULL},
   {NULL, NULL, 0, NULL},
};

static TyMemberDef tb_memberlist[] = {
    {"tb_frame",        _Ty_T_OBJECT,       OFF(tb_frame),  Py_READONLY|Ty_AUDIT_READ},
    {"tb_lasti",        Ty_T_INT,          OFF(tb_lasti),  Py_READONLY},
    {NULL}      /* Sentinel */
};

static TyGetSetDef tb_getsetters[] = {
    TRACEBACK_TB_NEXT_GETSETDEF
    {"tb_lineno", tb_lineno_get, NULL, NULL, NULL},
    {NULL}      /* Sentinel */
};

static void
tb_dealloc(TyObject *op)
{
    PyTracebackObject *tb = _PyTracebackObject_CAST(op);
    PyObject_GC_UnTrack(tb);
    Ty_XDECREF(tb->tb_next);
    Ty_XDECREF(tb->tb_frame);
    PyObject_GC_Del(tb);
}

static int
tb_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyTracebackObject *tb = _PyTracebackObject_CAST(op);
    Ty_VISIT(tb->tb_next);
    Ty_VISIT(tb->tb_frame);
    return 0;
}

static int
tb_clear(TyObject *op)
{
    PyTracebackObject *tb = _PyTracebackObject_CAST(op);
    Ty_CLEAR(tb->tb_next);
    Ty_CLEAR(tb->tb_frame);
    return 0;
}

TyTypeObject PyTraceBack_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "traceback",
    sizeof(PyTracebackObject),
    0,
    tb_dealloc,         /*tp_dealloc*/
    0,                  /*tp_vectorcall_offset*/
    0,    /*tp_getattr*/
    0,                  /*tp_setattr*/
    0,                  /*tp_as_async*/
    0,                  /*tp_repr*/
    0,                  /*tp_as_number*/
    0,                  /*tp_as_sequence*/
    0,                  /*tp_as_mapping*/
    0,                  /* tp_hash */
    0,                  /* tp_call */
    0,                  /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                  /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    tb_new__doc__,                              /* tp_doc */
    tb_traverse,                                /* tp_traverse */
    tb_clear,                                   /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    tb_methods,         /* tp_methods */
    tb_memberlist,      /* tp_members */
    tb_getsetters,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    tb_new,                                     /* tp_new */
};


TyObject*
_PyTraceBack_FromFrame(TyObject *tb_next, PyFrameObject *frame)
{
    assert(tb_next == NULL || PyTraceBack_Check(tb_next));
    assert(frame != NULL);
    int addr = _PyInterpreterFrame_LASTI(frame->f_frame) * sizeof(_Ty_CODEUNIT);
    return tb_create_raw((PyTracebackObject *)tb_next, frame, addr, -1);
}


int
PyTraceBack_Here(PyFrameObject *frame)
{
    TyObject *exc = TyErr_GetRaisedException();
    assert(PyExceptionInstance_Check(exc));
    TyObject *tb = PyException_GetTraceback(exc);
    TyObject *newtb = _PyTraceBack_FromFrame(tb, frame);
    Ty_XDECREF(tb);
    if (newtb == NULL) {
        _TyErr_ChainExceptions1(exc);
        return -1;
    }
    PyException_SetTraceback(exc, newtb);
    Ty_XDECREF(newtb);
    TyErr_SetRaisedException(exc);
    return 0;
}

/* Insert a frame into the traceback for (funcname, filename, lineno). */
void _TyTraceback_Add(const char *funcname, const char *filename, int lineno)
{
    TyObject *globals;
    PyCodeObject *code;
    PyFrameObject *frame;
    TyThreadState *tstate = _TyThreadState_GET();

    /* Save and clear the current exception. Python functions must not be
       called with an exception set. Calling Python functions happens when
       the codec of the filesystem encoding is implemented in pure Python. */
    TyObject *exc = _TyErr_GetRaisedException(tstate);

    globals = TyDict_New();
    if (!globals)
        goto error;
    code = TyCode_NewEmpty(filename, funcname, lineno);
    if (!code) {
        Ty_DECREF(globals);
        goto error;
    }
    frame = TyFrame_New(tstate, code, globals, NULL);
    Ty_DECREF(globals);
    Ty_DECREF(code);
    if (!frame)
        goto error;
    frame->f_lineno = lineno;

    _TyErr_SetRaisedException(tstate, exc);
    PyTraceBack_Here(frame);
    Ty_DECREF(frame);
    return;

error:
    _TyErr_ChainExceptions1(exc);
}

static TyObject *
_Ty_FindSourceFile(TyObject *filename, char* namebuf, size_t namelen, TyObject *io)
{
    Ty_ssize_t i;
    TyObject *binary;
    TyObject *v;
    Ty_ssize_t npath;
    size_t taillen;
    TyObject *syspath;
    TyObject *path;
    const char* tail;
    TyObject *filebytes;
    const char* filepath;
    Ty_ssize_t len;
    TyObject* result;
    TyObject *open = NULL;

    filebytes = TyUnicode_EncodeFSDefault(filename);
    if (filebytes == NULL) {
        TyErr_Clear();
        return NULL;
    }
    filepath = TyBytes_AS_STRING(filebytes);

    /* Search tail of filename in sys.path before giving up */
    tail = strrchr(filepath, SEP);
    if (tail == NULL)
        tail = filepath;
    else
        tail++;
    taillen = strlen(tail);

    TyThreadState *tstate = _TyThreadState_GET();
    if (_TySys_GetOptionalAttr(&_Ty_ID(path), &syspath) < 0) {
        TyErr_Clear();
        goto error;
    }
    if (syspath == NULL || !TyList_Check(syspath)) {
        goto error;
    }
    npath = TyList_Size(syspath);

    open = PyObject_GetAttr(io, &_Ty_ID(open));
    for (i = 0; i < npath; i++) {
        v = TyList_GetItem(syspath, i);
        if (v == NULL) {
            TyErr_Clear();
            break;
        }
        if (!TyUnicode_Check(v))
            continue;
        path = TyUnicode_EncodeFSDefault(v);
        if (path == NULL) {
            TyErr_Clear();
            continue;
        }
        len = TyBytes_GET_SIZE(path);
        if (len + 1 + (Ty_ssize_t)taillen >= (Ty_ssize_t)namelen - 1) {
            Ty_DECREF(path);
            continue; /* Too long */
        }
        strcpy(namebuf, TyBytes_AS_STRING(path));
        Ty_DECREF(path);
        if (strlen(namebuf) != (size_t)len)
            continue; /* v contains '\0' */
        if (len > 0 && namebuf[len-1] != SEP)
            namebuf[len++] = SEP;
        strcpy(namebuf+len, tail);

        binary = _TyObject_CallMethodFormat(tstate, open, "ss", namebuf, "rb");
        if (binary != NULL) {
            result = binary;
            goto finally;
        }
        TyErr_Clear();
    }
    goto error;

error:
    result = NULL;
finally:
    Ty_XDECREF(open);
    Ty_XDECREF(syspath);
    Ty_DECREF(filebytes);
    return result;
}

/* Writes indent spaces. Returns 0 on success and non-zero on failure.
 */
int
_Ty_WriteIndent(int indent, TyObject *f)
{
    char buf[11] = "          ";
    assert(strlen(buf) == 10);
    while (indent > 0) {
        if (indent < 10) {
            buf[indent] = '\0';
        }
        if (TyFile_WriteString(buf, f) < 0) {
            return -1;
        }
        indent -= 10;
    }
    return 0;
}

static int
display_source_line(TyObject *f, TyObject *filename, int lineno, int indent,
                    int *truncation, TyObject **line)
{
    int fd;
    int i;
    char *found_encoding;
    const char *encoding;
    TyObject *io;
    TyObject *binary;
    TyObject *fob = NULL;
    TyObject *lineobj = NULL;
    TyObject *res;
    char buf[MAXPATHLEN+1];
    int kind;
    const void *data;

    /* open the file */
    if (filename == NULL)
        return 0;

    /* Do not attempt to open things like <string> or <stdin> */
    assert(TyUnicode_Check(filename));
    if (TyUnicode_READ_CHAR(filename, 0) == '<') {
        Ty_ssize_t len = TyUnicode_GET_LENGTH(filename);
        if (len > 0 && TyUnicode_READ_CHAR(filename, len - 1) == '>') {
            return 0;
        }
    }

    io = TyImport_ImportModule("io");
    if (io == NULL) {
        return -1;
    }

    binary = _TyObject_CallMethod(io, &_Ty_ID(open), "Os", filename, "rb");
    if (binary == NULL) {
        TyErr_Clear();

        binary = _Ty_FindSourceFile(filename, buf, sizeof(buf), io);
        if (binary == NULL) {
            Ty_DECREF(io);
            return -1;
        }
    }

    /* use the right encoding to decode the file as unicode */
    fd = PyObject_AsFileDescriptor(binary);
    if (fd < 0) {
        Ty_DECREF(io);
        Ty_DECREF(binary);
        return 0;
    }
    found_encoding = _PyTokenizer_FindEncodingFilename(fd, filename);
    if (found_encoding == NULL)
        TyErr_Clear();
    encoding = (found_encoding != NULL) ? found_encoding : "utf-8";
    /* Reset position */
    if (lseek(fd, 0, SEEK_SET) == (off_t)-1) {
        Ty_DECREF(io);
        Ty_DECREF(binary);
        TyMem_Free(found_encoding);
        return 0;
    }
    fob = _TyObject_CallMethod(io, &_Ty_ID(TextIOWrapper),
                               "Os", binary, encoding);
    Ty_DECREF(io);
    TyMem_Free(found_encoding);

    if (fob == NULL) {
        TyErr_Clear();

        res = PyObject_CallMethodNoArgs(binary, &_Ty_ID(close));
        Ty_DECREF(binary);
        if (res)
            Ty_DECREF(res);
        else
            TyErr_Clear();
        return 0;
    }
    Ty_DECREF(binary);

    /* get the line number lineno */
    for (i = 0; i < lineno; i++) {
        Ty_XDECREF(lineobj);
        lineobj = TyFile_GetLine(fob, -1);
        if (!lineobj) {
            TyErr_Clear();
            break;
        }
    }
    res = PyObject_CallMethodNoArgs(fob, &_Ty_ID(close));
    if (res) {
        Ty_DECREF(res);
    }
    else {
        TyErr_Clear();
    }
    Ty_DECREF(fob);
    if (!lineobj || !TyUnicode_Check(lineobj)) {
        Ty_XDECREF(lineobj);
        return -1;
    }

    if (line) {
        *line = Ty_NewRef(lineobj);
    }

    /* remove the indentation of the line */
    kind = TyUnicode_KIND(lineobj);
    data = TyUnicode_DATA(lineobj);
    for (i=0; i < TyUnicode_GET_LENGTH(lineobj); i++) {
        Ty_UCS4 ch = TyUnicode_READ(kind, data, i);
        if (ch != ' ' && ch != '\t' && ch != '\014')
            break;
    }
    if (i) {
        TyObject *truncated;
        truncated = TyUnicode_Substring(lineobj, i, TyUnicode_GET_LENGTH(lineobj));
        if (truncated) {
            Ty_SETREF(lineobj, truncated);
        } else {
            TyErr_Clear();
        }
    }

    if (truncation != NULL) {
        *truncation = i - indent;
    }

    /* Write some spaces before the line */
    if (_Ty_WriteIndent(indent, f) < 0) {
        goto error;
    }

    /* finally display the line */
    if (TyFile_WriteObject(lineobj, f, Ty_PRINT_RAW) < 0) {
        goto error;
    }

    if (TyFile_WriteString("\n", f) < 0) {
        goto error;
    }

    Ty_DECREF(lineobj);
    return 0;
error:
    Ty_DECREF(lineobj);
    return -1;
}

int
_Ty_DisplaySourceLine(TyObject *f, TyObject *filename, int lineno, int indent,
                      int *truncation, TyObject **line)
{
    return display_source_line(f, filename, lineno, indent, truncation, line);
}


#define IS_WHITESPACE(c) (((c) == ' ') || ((c) == '\t') || ((c) == '\f'))
#define _TRACEBACK_SOURCE_LINE_INDENT 4

static inline int
ignore_source_errors(void) {
    if (TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_KeyboardInterrupt)) {
            return -1;
        }
        TyErr_Clear();
    }
    return 0;
}

static int
tb_displayline(PyTracebackObject* tb, TyObject *f, TyObject *filename, int lineno,
               PyFrameObject *frame, TyObject *name)
{
    if (filename == NULL || name == NULL) {
        return -1;
    }

    TyObject *line = TyUnicode_FromFormat("  File \"%U\", line %d, in %U\n",
                                          filename, lineno, name);
    if (line == NULL) {
        return -1;
    }

    int res = TyFile_WriteObject(line, f, Ty_PRINT_RAW);
    Ty_DECREF(line);
    if (res < 0) {
        return -1;
    }

    int err = 0;

    int truncation = _TRACEBACK_SOURCE_LINE_INDENT;
    TyObject* source_line = NULL;
    int rc = display_source_line(
            f, filename, lineno, _TRACEBACK_SOURCE_LINE_INDENT,
            &truncation, &source_line);
    if (rc != 0 || !source_line) {
        /* ignore errors since we can't report them, can we? */
        err = ignore_source_errors();
    }
    Ty_XDECREF(source_line);
    return err;
}

static const int TB_RECURSIVE_CUTOFF = 3; // Also hardcoded in traceback.py.

static int
tb_print_line_repeated(TyObject *f, long cnt)
{
    cnt -= TB_RECURSIVE_CUTOFF;
    TyObject *line = TyUnicode_FromFormat(
        (cnt > 1)
          ? "  [Previous line repeated %ld more times]\n"
          : "  [Previous line repeated %ld more time]\n",
        cnt);
    if (line == NULL) {
        return -1;
    }
    int err = TyFile_WriteObject(line, f, Ty_PRINT_RAW);
    Ty_DECREF(line);
    return err;
}

static int
tb_printinternal(PyTracebackObject *tb, TyObject *f, long limit)
{
    PyCodeObject *code = NULL;
    Ty_ssize_t depth = 0;
    TyObject *last_file = NULL;
    int last_line = -1;
    TyObject *last_name = NULL;
    long cnt = 0;
    PyTracebackObject *tb1 = tb;
    while (tb1 != NULL) {
        depth++;
        tb1 = tb1->tb_next;
    }
    while (tb != NULL && depth > limit) {
        depth--;
        tb = tb->tb_next;
    }
    while (tb != NULL) {
        code = TyFrame_GetCode(tb->tb_frame);
        int tb_lineno = tb->tb_lineno;
        if (tb_lineno == -1) {
            tb_lineno = tb_get_lineno((TyObject *)tb);
        }
        if (last_file == NULL ||
            code->co_filename != last_file ||
            last_line == -1 || tb_lineno != last_line ||
            last_name == NULL || code->co_name != last_name) {
            if (cnt > TB_RECURSIVE_CUTOFF) {
                if (tb_print_line_repeated(f, cnt) < 0) {
                    goto error;
                }
            }
            last_file = code->co_filename;
            last_line = tb_lineno;
            last_name = code->co_name;
            cnt = 0;
        }
        cnt++;
        if (cnt <= TB_RECURSIVE_CUTOFF) {
            if (tb_displayline(tb, f, code->co_filename, tb_lineno,
                               tb->tb_frame, code->co_name) < 0) {
                goto error;
            }

            if (TyErr_CheckSignals() < 0) {
                goto error;
            }
        }
        Ty_CLEAR(code);
        tb = tb->tb_next;
    }
    if (cnt > TB_RECURSIVE_CUTOFF) {
        if (tb_print_line_repeated(f, cnt) < 0) {
            goto error;
        }
    }
    return 0;
error:
    Ty_XDECREF(code);
    return -1;
}

#define PyTraceBack_LIMIT 1000

int
_PyTraceBack_Print(TyObject *v, const char *header, TyObject *f)
{
    TyObject *limitv;
    long limit = PyTraceBack_LIMIT;

    if (v == NULL) {
        return 0;
    }
    if (!PyTraceBack_Check(v)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (_TySys_GetOptionalAttrString("tracebacklimit", &limitv) < 0) {
        return -1;
    }
    else if (limitv != NULL && TyLong_Check(limitv)) {
        int overflow;
        limit = TyLong_AsLongAndOverflow(limitv, &overflow);
        if (overflow > 0) {
            limit = LONG_MAX;
        }
        else if (limit <= 0) {
            Ty_DECREF(limitv);
            return 0;
        }
    }
    Ty_XDECREF(limitv);

    if (TyFile_WriteString(header, f) < 0) {
        return -1;
    }

    if (tb_printinternal((PyTracebackObject *)v, f, limit) < 0) {
        return -1;
    }

    return 0;
}

int
PyTraceBack_Print(TyObject *v, TyObject *f)
{
    const char *header = EXCEPTION_TB_HEADER;
    return _PyTraceBack_Print(v, header, f);
}

/* Format an integer in range [0; 0xffffffff] to decimal and write it
   into the file fd.

   This function is signal safe. */

void
_Ty_DumpDecimal(int fd, size_t value)
{
    /* maximum number of characters required for output of %lld or %p.
       We need at most ceil(log10(256)*SIZEOF_LONG_LONG) digits,
       plus 1 for the null byte.  53/22 is an upper bound for log10(256). */
    char buffer[1 + (sizeof(size_t)*53-1) / 22 + 1];
    char *ptr, *end;

    end = &buffer[Ty_ARRAY_LENGTH(buffer) - 1];
    ptr = end;
    *ptr = '\0';
    do {
        --ptr;
        assert(ptr >= buffer);
        *ptr = '0' + (value % 10);
        value /= 10;
    } while (value);

    (void)_Ty_write_noraise(fd, ptr, end - ptr);
}

/* Format an integer as hexadecimal with width digits into fd file descriptor.
   The function is signal safe. */
static void
dump_hexadecimal(int fd, uintptr_t value, Ty_ssize_t width, int strip_zeros)
{
    char buffer[sizeof(uintptr_t) * 2 + 1], *ptr, *end;
    Ty_ssize_t size = Ty_ARRAY_LENGTH(buffer) - 1;

    if (width > size)
        width = size;
    /* it's ok if width is negative */

    end = &buffer[size];
    ptr = end;
    *ptr = '\0';
    do {
        --ptr;
        assert(ptr >= buffer);
        *ptr = Ty_hexdigits[value & 15];
        value >>= 4;
    } while ((end - ptr) < width || value);

    size = end - ptr;
    if (strip_zeros) {
        while (*ptr == '0' && size >= 2) {
            ptr++;
            size--;
        }
    }

    (void)_Ty_write_noraise(fd, ptr, size);
}

void
_Ty_DumpHexadecimal(int fd, uintptr_t value, Ty_ssize_t width)
{
    dump_hexadecimal(fd, value, width, 0);
}

#ifdef CAN_C_BACKTRACE
static void
dump_pointer(int fd, void *ptr)
{
    PUTS(fd, "0x");
    dump_hexadecimal(fd, (uintptr_t)ptr, sizeof(void*), 1);
}
#endif

static void
dump_char(int fd, char ch)
{
    char buf[1] = {ch};
    (void)_Ty_write_noraise(fd, buf, 1);
}

void
_Ty_DumpASCII(int fd, TyObject *text)
{
    PyASCIIObject *ascii = _PyASCIIObject_CAST(text);
    Ty_ssize_t i, size;
    int truncated;
    int kind;
    void *data = NULL;
    Ty_UCS4 ch;

    if (!TyUnicode_Check(text))
        return;

    size = ascii->length;
    kind = ascii->state.kind;
    if (ascii->state.compact) {
        if (ascii->state.ascii)
            data = ascii + 1;
        else
            data = _PyCompactUnicodeObject_CAST(text) + 1;
    }
    else {
        data = _PyUnicodeObject_CAST(text)->data.any;
        if (data == NULL)
            return;
    }

    if (MAX_STRING_LENGTH < size) {
        size = MAX_STRING_LENGTH;
        truncated = 1;
    }
    else {
        truncated = 0;
    }

    // Is an ASCII string?
    if (ascii->state.ascii) {
        assert(kind == TyUnicode_1BYTE_KIND);
        char *str = data;

        int need_escape = 0;
        for (i=0; i < size; i++) {
            ch = str[i];
            if (!(' ' <= ch && ch <= 126)) {
                need_escape = 1;
                break;
            }
        }
        if (!need_escape) {
            // The string can be written with a single write() syscall
            (void)_Ty_write_noraise(fd, str, size);
            goto done;
        }
    }

    for (i=0; i < size; i++) {
        ch = TyUnicode_READ(kind, data, i);
        if (' ' <= ch && ch <= 126) {
            /* printable ASCII character */
            dump_char(fd, (char)ch);
        }
        else if (ch <= 0xff) {
            PUTS(fd, "\\x");
            _Ty_DumpHexadecimal(fd, ch, 2);
        }
        else if (ch <= 0xffff) {
            PUTS(fd, "\\u");
            _Ty_DumpHexadecimal(fd, ch, 4);
        }
        else {
            PUTS(fd, "\\U");
            _Ty_DumpHexadecimal(fd, ch, 8);
        }
    }

done:
    if (truncated) {
        PUTS(fd, "...");
    }
}

/* Write a frame into the file fd: "File "xxx", line xxx in xxx".

   This function is signal safe. */

static void
dump_frame(int fd, _PyInterpreterFrame *frame)
{
    assert(frame->owner < FRAME_OWNED_BY_INTERPRETER);

    PyCodeObject *code =_TyFrame_GetCode(frame);
    PUTS(fd, "  File ");
    if (code->co_filename != NULL
        && TyUnicode_Check(code->co_filename))
    {
        PUTS(fd, "\"");
        _Ty_DumpASCII(fd, code->co_filename);
        PUTS(fd, "\"");
    } else {
        PUTS(fd, "???");
    }

    int lineno = PyUnstable_InterpreterFrame_GetLine(frame);
    PUTS(fd, ", line ");
    if (lineno >= 0) {
        _Ty_DumpDecimal(fd, (size_t)lineno);
    }
    else {
        PUTS(fd, "???");
    }
    PUTS(fd, " in ");

    if (code->co_name != NULL
       && TyUnicode_Check(code->co_name)) {
        _Ty_DumpASCII(fd, code->co_name);
    }
    else {
        PUTS(fd, "???");
    }

    PUTS(fd, "\n");
}

static int
tstate_is_freed(TyThreadState *tstate)
{
    if (_TyMem_IsPtrFreed(tstate)) {
        return 1;
    }
    if (_TyMem_IsPtrFreed(tstate->interp)) {
        return 1;
    }
    return 0;
}


static int
interp_is_freed(TyInterpreterState *interp)
{
    return _TyMem_IsPtrFreed(interp);
}


static void
dump_traceback(int fd, TyThreadState *tstate, int write_header)
{
    if (write_header) {
        PUTS(fd, "Stack (most recent call first):\n");
    }

    if (tstate_is_freed(tstate)) {
        PUTS(fd, "  <tstate is freed>\n");
        return;
    }

    _PyInterpreterFrame *frame = tstate->current_frame;
    if (frame == NULL) {
        PUTS(fd, "  <no Python frame>\n");
        return;
    }

    unsigned int depth = 0;
    while (1) {
        if (frame->owner == FRAME_OWNED_BY_INTERPRETER) {
            /* Trampoline frame */
            frame = frame->previous;
            if (frame == NULL) {
                break;
            }

            /* Can't have more than one shim frame in a row */
            assert(frame->owner != FRAME_OWNED_BY_INTERPRETER);
        }

        if (MAX_FRAME_DEPTH <= depth) {
            if (MAX_FRAME_DEPTH < depth) {
                PUTS(fd, "plus ");
                _Ty_DumpDecimal(fd, depth);
                PUTS(fd, " frames\n");
            }
            break;
        }

        dump_frame(fd, frame);
        frame = frame->previous;
        if (frame == NULL) {
            break;
        }
        depth++;
    }
}

/* Dump the traceback of a Python thread into fd. Use write() to write the
   traceback and retry if write() is interrupted by a signal (failed with
   EINTR), but don't call the Python signal handler.

   The caller is responsible to call TyErr_CheckSignals() to call Python signal
   handlers if signals were received. */
void
_Ty_DumpTraceback(int fd, TyThreadState *tstate)
{
    dump_traceback(fd, tstate, 1);
}

#if defined(HAVE_PTHREAD_GETNAME_NP) || defined(HAVE_PTHREAD_GET_NAME_NP)
# if defined(__OpenBSD__)
    /* pthread_*_np functions, especially pthread_{get,set}_name_np().
       pthread_np.h exists on both OpenBSD and FreeBSD but the latter declares
       pthread_getname_np() and pthread_setname_np() in pthread.h as long as
       __BSD_VISIBLE remains set.
     */
#   include <pthread_np.h>
# endif
#endif

/* Write the thread identifier into the file 'fd': "Current thread 0xHHHH:\" if
   is_current is true, "Thread 0xHHHH:\n" otherwise.

   This function is signal safe. */

static void
write_thread_id(int fd, TyThreadState *tstate, int is_current)
{
    if (is_current)
        PUTS(fd, "Current thread 0x");
    else
        PUTS(fd, "Thread 0x");
    _Ty_DumpHexadecimal(fd,
                        tstate->thread_id,
                        sizeof(unsigned long) * 2);

    // Write the thread name
#if defined(HAVE_PTHREAD_GETNAME_NP) || defined(HAVE_PTHREAD_GET_NAME_NP)
    char name[100];
    pthread_t thread = (pthread_t)tstate->thread_id;
#ifdef HAVE_PTHREAD_GETNAME_NP
    int rc = pthread_getname_np(thread, name, Ty_ARRAY_LENGTH(name));
#else /* defined(HAVE_PTHREAD_GET_NAME_NP) */
    int rc = 0; /* pthread_get_name_np() returns void */
    pthread_get_name_np(thread, name, Ty_ARRAY_LENGTH(name));
#endif
    if (!rc) {
        size_t len = strlen(name);
        if (len) {
            PUTS(fd, " [");
            (void)_Ty_write_noraise(fd, name, len);
            PUTS(fd, "]");
        }
    }
#endif

    PUTS(fd, " (most recent call first):\n");
}

/* Dump the traceback of all Python threads into fd. Use write() to write the
   traceback and retry if write() is interrupted by a signal (failed with
   EINTR), but don't call the Python signal handler.

   The caller is responsible to call TyErr_CheckSignals() to call Python signal
   handlers if signals were received. */
const char*
_Ty_DumpTracebackThreads(int fd, TyInterpreterState *interp,
                         TyThreadState *current_tstate)
{
    if (current_tstate == NULL) {
        /* _Ty_DumpTracebackThreads() is called from signal handlers by
           faulthandler.

           SIGSEGV, SIGFPE, SIGABRT, SIGBUS and SIGILL are synchronous signals
           and are thus delivered to the thread that caused the fault. Get the
           Python thread state of the current thread.

           TyThreadState_Get() doesn't give the state of the thread that caused
           the fault if the thread released the GIL, and so
           _TyThreadState_GET() cannot be used. Read the thread specific
           storage (TSS) instead: call TyGILState_GetThisThreadState(). */
        current_tstate = TyGILState_GetThisThreadState();
    }

    if (current_tstate != NULL && tstate_is_freed(current_tstate)) {
        return "tstate is freed";
    }

    if (interp == NULL) {
        if (current_tstate == NULL) {
            interp = _TyGILState_GetInterpreterStateUnsafe();
            if (interp == NULL) {
                /* We need the interpreter state to get Python threads */
                return "unable to get the interpreter state";
            }
        }
        else {
            interp = current_tstate->interp;
        }
    }
    assert(interp != NULL);

    if (interp_is_freed(interp)) {
        return "interp is freed";
    }

    /* Get the current interpreter from the current thread */
    TyThreadState *tstate = TyInterpreterState_ThreadHead(interp);
    if (tstate == NULL)
        return "unable to get the thread head state";

    /* Dump the traceback of each thread */
    tstate = TyInterpreterState_ThreadHead(interp);
    unsigned int nthreads = 0;
    _Ty_BEGIN_SUPPRESS_IPH
    do
    {
        if (nthreads != 0)
            PUTS(fd, "\n");
        if (nthreads >= MAX_NTHREADS) {
            PUTS(fd, "...\n");
            break;
        }
        write_thread_id(fd, tstate, tstate == current_tstate);
        if (tstate == current_tstate && tstate->interp->gc.collecting) {
            PUTS(fd, "  Garbage-collecting\n");
        }
        dump_traceback(fd, tstate, 0);
        tstate = TyThreadState_Next(tstate);
        nthreads++;
    } while (tstate != NULL);
    _Ty_END_SUPPRESS_IPH

    return NULL;
}

#ifdef CAN_C_BACKTRACE
/* Based on glibc's implementation of backtrace_symbols(), but only uses stack memory. */
void
_Ty_backtrace_symbols_fd(int fd, void *const *array, Ty_ssize_t size)
{
    VLA(Dl_info, info, size);
    VLA(int, status, size);
    /* Fill in the information we can get from dladdr() */
    for (Ty_ssize_t i = 0; i < size; ++i) {
#ifdef __APPLE__
        status[i] = dladdr(array[i], &info[i]);
#else
        struct link_map *map;
        status[i] = dladdr1(array[i], &info[i], (void **)&map, RTLD_DL_LINKMAP);
        if (status[i] != 0
            && info[i].dli_fname != NULL
            && info[i].dli_fname[0] != '\0') {
            /* The load bias is more useful to the user than the load
               address. The use of these addresses is to calculate an
               address in the ELF file, so its prelinked bias is not
               something we want to subtract out */
            info[i].dli_fbase = (void *) map->l_addr;
        }
#endif
    }
    for (Ty_ssize_t i = 0; i < size; ++i) {
        if (status[i] == 0
            || info[i].dli_fname == NULL
            || info[i].dli_fname[0] == '\0'
        ) {
            PUTS(fd, "  Binary file '<unknown>' [");
            dump_pointer(fd, array[i]);
            PUTS(fd, "]\n");
            continue;
        }

        if (info[i].dli_sname == NULL) {
            /* We found no symbol name to use, so describe it as
               relative to the file. */
            info[i].dli_saddr = info[i].dli_fbase;
        }

        if (info[i].dli_sname == NULL && info[i].dli_saddr == 0) {
            PUTS(fd, "  Binary file \"");
            PUTS(fd, info[i].dli_fname);
            PUTS(fd, "\" [");
            dump_pointer(fd, array[i]);
            PUTS(fd, "]\n");
        }
        else {
            char sign;
            ptrdiff_t offset;
            if (array[i] >= (void *) info[i].dli_saddr) {
                sign = '+';
                offset = array[i] - info[i].dli_saddr;
            }
            else {
                sign = '-';
                offset = info[i].dli_saddr - array[i];
            }
            const char *symbol_name = info[i].dli_sname != NULL ? info[i].dli_sname : "";
            PUTS(fd, "  Binary file \"");
            PUTS(fd, info[i].dli_fname);
            PUTS(fd, "\", at ");
            PUTS(fd, symbol_name);
            dump_char(fd, sign);
            PUTS(fd, "0x");
            dump_hexadecimal(fd, offset, sizeof(offset), 1);
            PUTS(fd, " [");
            dump_pointer(fd, array[i]);
            PUTS(fd, "]\n");
        }
    }
}

void
_Ty_DumpStack(int fd)
{
#define BACKTRACE_SIZE 32
    PUTS(fd, "Current thread's C stack trace (most recent call first):\n");
    VLA(void *, callstack, BACKTRACE_SIZE);
    int frames = backtrace(callstack, BACKTRACE_SIZE);
    if (frames == 0) {
        // Some systems won't return anything for the stack trace
        PUTS(fd, "  <system returned no stack trace>\n");
        return;
    }

    _Ty_backtrace_symbols_fd(fd, callstack, frames);
    if (frames == BACKTRACE_SIZE) {
        PUTS(fd, "  <truncated rest of calls>\n");
    }

#undef BACKTRACE_SIZE
}
#else
void
_Ty_DumpStack(int fd)
{
    PUTS(fd, "Current thread's C stack trace (most recent call first):\n");
    PUTS(fd, "  <cannot get C stack on this system>\n");
}
#endif
