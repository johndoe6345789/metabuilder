/*
    An implementation of Windows console I/O

    Classes defined here: _WindowsConsoleIO

    Written by Steve Dower
*/

#include "Python.h"
#include "pycore_fileutils.h"     // _Ty_BEGIN_SUPPRESS_IPH
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#ifdef HAVE_WINDOWS_CONSOLE_IO


#ifdef HAVE_SYS_TYPES_H
#include <sys/types.h>
#endif
#ifdef HAVE_SYS_STAT_H
#include <sys/stat.h>
#endif
#include <stddef.h> /* For offsetof */

#ifndef WIN32_LEAN_AND_MEAN
#  define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>
#include <fcntl.h>

#include "_iomodule.h"

/* BUFSIZ determines how many characters can be typed at the console
   before it starts blocking. */
#if BUFSIZ < (16*1024)
#define SMALLCHUNK (2*1024)
#elif (BUFSIZ >= (2 << 25))
#error "unreasonable BUFSIZ > 64 MiB defined"
#else
#define SMALLCHUNK BUFSIZ
#endif

/* BUFMAX determines how many bytes can be read in one go. */
#define BUFMAX (32*1024*1024)

/* SMALLBUF determines how many utf-8 characters will be
   buffered within the stream, in order to support reads
   of less than one character */
#define SMALLBUF 4

char _get_console_type(HANDLE handle) {
    DWORD mode, peek_count;

    if (handle == INVALID_HANDLE_VALUE)
        return '\0';

    if (!GetConsoleMode(handle, &mode))
        return '\0';

    /* Peek at the handle to see whether it is an input or output handle */
    if (GetNumberOfConsoleInputEvents(handle, &peek_count))
        return 'r';
    return 'w';
}

char _PyIO_get_console_type(TyObject *path_or_fd) {
    int fd = TyLong_AsLong(path_or_fd);
    TyErr_Clear();
    if (fd >= 0) {
        HANDLE handle = _Ty_get_osfhandle_noraise(fd);
        if (handle == INVALID_HANDLE_VALUE)
            return '\0';
        return _get_console_type(handle);
    }

    TyObject *decoded;
    wchar_t *decoded_wstr;

    if (!TyUnicode_FSDecoder(path_or_fd, &decoded)) {
        TyErr_Clear();
        return '\0';
    }
    decoded_wstr = TyUnicode_AsWideCharString(decoded, NULL);
    Ty_CLEAR(decoded);
    if (!decoded_wstr) {
        TyErr_Clear();
        return '\0';
    }

    char m = '\0';
    if (!_wcsicmp(decoded_wstr, L"CONIN$")) {
        m = 'r';
    } else if (!_wcsicmp(decoded_wstr, L"CONOUT$")) {
        m = 'w';
    } else if (!_wcsicmp(decoded_wstr, L"CON")) {
        m = 'x';
    }
    if (m) {
        TyMem_Free(decoded_wstr);
        return m;
    }

    DWORD length;
    wchar_t name_buf[MAX_PATH], *pname_buf = name_buf;

    length = GetFullPathNameW(decoded_wstr, MAX_PATH, pname_buf, NULL);
    if (length > MAX_PATH) {
        pname_buf = TyMem_New(wchar_t, length);
        if (pname_buf)
            length = GetFullPathNameW(decoded_wstr, length, pname_buf, NULL);
        else
            length = 0;
    }
    TyMem_Free(decoded_wstr);

    if (length) {
        wchar_t *name = pname_buf;
        if (length >= 4 && name[3] == L'\\' &&
            (name[2] == L'.' || name[2] == L'?') &&
            name[1] == L'\\' && name[0] == L'\\') {
            name += 4;
        }
        if (!_wcsicmp(name, L"CONIN$")) {
            m = 'r';
        } else if (!_wcsicmp(name, L"CONOUT$")) {
            m = 'w';
        } else if (!_wcsicmp(name, L"CON")) {
            m = 'x';
        }
    }

    if (pname_buf != name_buf)
        TyMem_Free(pname_buf);
    return m;
}

static DWORD
_find_last_utf8_boundary(const unsigned char *buf, DWORD len)
{
    for (DWORD count = 1; count < 4 && count <= len; count++) {
        unsigned char c = buf[len - count];
        if (c < 0x80) {
            /* No starting byte found. */
            return len;
        }
        if (c >= 0xc0) {
            if (c < 0xe0 /* 2-bytes sequence */ ? count < 2 :
                c < 0xf0 /* 3-bytes sequence */ ? count < 3 :
                c < 0xf8 /* 4-bytes sequence */)
            {
                /* Incomplete multibyte sequence. */
                return len - count;
            }
            /* Either complete or invalid sequence. */
            return len;
        }
    }
    /* Either complete 4-bytes sequence or invalid sequence. */
    return len;
}

/* Find the number of UTF-8 bytes that corresponds to the specified number of
 * wchars.
 * I.e. find x <= len so that MultiByteToWideChar(CP_UTF8, 0, s, x, NULL, 0) == n.
 *
 * WideCharToMultiByte() cannot be used for this, because the UTF-8 -> wchar
 * conversion is not reversible (invalid UTF-8 byte produces \ufffd which
 * will be converted back to 3-bytes UTF-8 sequence \xef\xbf\xbd).
 * So we need to use binary search.
 */
static DWORD
_wchar_to_utf8_count(const unsigned char *s, DWORD len, DWORD n)
{
    DWORD start = 0;
    while (1) {
        DWORD mid = 0;
        for (DWORD i = len / 2; i <= len; i++) {
            mid = _find_last_utf8_boundary(s, i);
            if (mid != 0) {
                break;
            }
            /* The middle could split the first multibytes sequence. */
        }
        if (mid == len) {
            return start + len;
        }
        if (mid == 0) {
            mid = len > 1 ? len - 1 : 1;
        }
        DWORD wlen = MultiByteToWideChar(CP_UTF8, 0, s, mid, NULL, 0);
        if (wlen <= n) {
            s += mid;
            start += mid;
            len -= mid;
            n -= wlen;
        }
        else {
            len = mid;
        }
    }
}

/*[clinic input]
module _io
class _io._WindowsConsoleIO "winconsoleio *" "clinic_state()->PyWindowsConsoleIO_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=05526e723011ab36]*/

typedef struct {
    PyObject_HEAD
    int fd;
    unsigned int created : 1;
    unsigned int readable : 1;
    unsigned int writable : 1;
    unsigned int closefd : 1;
    char finalizing;
    unsigned int blksize;
    TyObject *weakreflist;
    TyObject *dict;
    char buf[SMALLBUF];
    wchar_t wbuf;
} winconsoleio;

#define winconsoleio_CAST(op)   ((winconsoleio *)(op))

int
_PyWindowsConsoleIO_closed(TyObject *self)
{
    return ((winconsoleio *)self)->fd == -1;
}


/* Returns 0 on success, -1 with exception set on failure. */
static int
internal_close(winconsoleio *self)
{
    if (self->fd != -1) {
        if (self->closefd) {
            _Ty_BEGIN_SUPPRESS_IPH
            close(self->fd);
            _Ty_END_SUPPRESS_IPH
        }
        self->fd = -1;
    }
    return 0;
}

/*[clinic input]
_io._WindowsConsoleIO.close
    cls: defining_class
    /

Close the console object.

A closed console object cannot be used for further I/O operations.
close() may be called more than once without error.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_close_impl(winconsoleio *self, TyTypeObject *cls)
/*[clinic end generated code: output=e50c1808c063e1e2 input=161001bd2a649a4b]*/
{
    TyObject *res;
    TyObject *exc;
    int rc;

    _PyIO_State *state = get_io_state_by_cls(cls);
    res = PyObject_CallMethodOneArg((TyObject*)state->PyRawIOBase_Type,
                                    &_Ty_ID(close), (TyObject*)self);
    if (!self->closefd) {
        self->fd = -1;
        return res;
    }
    if (res == NULL) {
        exc = TyErr_GetRaisedException();
    }
    rc = internal_close(self);
    if (res == NULL) {
        _TyErr_ChainExceptions1(exc);
    }
    if (rc < 0) {
        Ty_CLEAR(res);
    }
    return res;
}

static TyObject *
winconsoleio_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    winconsoleio *self;

    assert(type != NULL && type->tp_alloc != NULL);

    self = (winconsoleio *) type->tp_alloc(type, 0);
    if (self != NULL) {
        self->fd = -1;
        self->created = 0;
        self->readable = 0;
        self->writable = 0;
        self->closefd = 0;
        self->blksize = 0;
        self->weakreflist = NULL;
    }

    return (TyObject *) self;
}

/*[clinic input]
_io._WindowsConsoleIO.__init__
    file as nameobj: object
    mode: str = "r"
    closefd: bool = True
    opener: object = None

Open a console buffer by file descriptor.

The mode can be 'rb' (default), or 'wb' for reading or writing bytes. All
other mode characters will be ignored. Mode 'b' will be assumed if it is
omitted. The *opener* parameter is always ignored.
[clinic start generated code]*/

static int
_io__WindowsConsoleIO___init___impl(winconsoleio *self, TyObject *nameobj,
                                    const char *mode, int closefd,
                                    TyObject *opener)
/*[clinic end generated code: output=3fd9cbcdd8d95429 input=7a3eed6bbe998fd9]*/
{
    const char *s;
    wchar_t *name = NULL;
    char console_type = '\0';
    int ret = 0;
    int rwa = 0;
    int fd = -1;
    HANDLE handle = NULL;

#ifndef NDEBUG
    _PyIO_State *state = find_io_state_by_def(Ty_TYPE(self));
    assert(PyObject_TypeCheck(self, state->PyWindowsConsoleIO_Type));
#endif
    if (self->fd >= 0) {
        if (self->closefd) {
            /* Have to close the existing file first. */
            if (internal_close(self) < 0)
                return -1;
        }
        else
            self->fd = -1;
    }

    if (TyBool_Check(nameobj)) {
        if (TyErr_WarnEx(TyExc_RuntimeWarning,
                "bool is used as a file descriptor", 1))
        {
            return -1;
        }
    }
    fd = TyLong_AsInt(nameobj);
    if (fd < 0) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError,
                            "negative file descriptor");
            return -1;
        }
        TyErr_Clear();
    }
    self->fd = fd;

    if (fd < 0) {
        TyObject *decodedname;

        int d = TyUnicode_FSDecoder(nameobj, (void*)&decodedname);
        if (!d)
            return -1;

        name = TyUnicode_AsWideCharString(decodedname, NULL);
        console_type = _PyIO_get_console_type(decodedname);
        Ty_CLEAR(decodedname);
        if (name == NULL)
            return -1;
    }

    s = mode;
    while (*s) {
        switch (*s++) {
        case '+':
        case 'a':
        case 'b':
        case 'x':
            break;
        case 'r':
            if (rwa)
                goto bad_mode;
            rwa = 1;
            self->readable = 1;
            if (console_type == 'x')
                console_type = 'r';
            break;
        case 'w':
            if (rwa)
                goto bad_mode;
            rwa = 1;
            self->writable = 1;
            if (console_type == 'x')
                console_type = 'w';
            break;
        default:
            TyErr_Format(TyExc_ValueError,
                         "invalid mode: %.200s", mode);
            goto error;
        }
    }

    if (!rwa)
        goto bad_mode;

    if (fd >= 0) {
        handle = _Ty_get_osfhandle_noraise(fd);
        self->closefd = 0;
    } else {
        DWORD access = GENERIC_READ;

        self->closefd = 1;
        if (!closefd) {
            TyErr_SetString(TyExc_ValueError,
                "Cannot use closefd=False with file name");
            goto error;
        }

        if (self->writable)
            access = GENERIC_WRITE;

        Ty_BEGIN_ALLOW_THREADS
        /* Attempt to open for read/write initially, then fall back
           on the specific access. This is required for modern names
           CONIN$ and CONOUT$, which allow reading/writing state as
           well as reading/writing content. */
        handle = CreateFileW(name, GENERIC_READ | GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, 0, NULL);
        if (handle == INVALID_HANDLE_VALUE)
            handle = CreateFileW(name, access,
                FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, 0, NULL);
        Ty_END_ALLOW_THREADS

        if (handle == INVALID_HANDLE_VALUE) {
            TyErr_SetExcFromWindowsErrWithFilenameObject(TyExc_OSError, GetLastError(), nameobj);
            goto error;
        }

        if (self->writable)
            self->fd = _Ty_open_osfhandle_noraise(handle, _O_WRONLY | _O_BINARY | _O_NOINHERIT);
        else
            self->fd = _Ty_open_osfhandle_noraise(handle, _O_RDONLY | _O_BINARY | _O_NOINHERIT);
        if (self->fd < 0) {
            TyErr_SetFromErrnoWithFilenameObject(TyExc_OSError, nameobj);
            CloseHandle(handle);
            goto error;
        }
    }

    if (console_type == '\0')
        console_type = _get_console_type(handle);

    if (self->writable && console_type != 'w') {
        TyErr_SetString(TyExc_ValueError,
            "Cannot open console input buffer for writing");
        goto error;
    }
    if (self->readable && console_type != 'r') {
        TyErr_SetString(TyExc_ValueError,
            "Cannot open console output buffer for reading");
        goto error;
    }

    self->blksize = DEFAULT_BUFFER_SIZE;
    memset(self->buf, 0, 4);

    if (PyObject_SetAttr((TyObject *)self, &_Ty_ID(name), nameobj) < 0)
        goto error;

    goto done;

bad_mode:
    TyErr_SetString(TyExc_ValueError,
                    "Must have exactly one of read or write mode");
error:
    ret = -1;
    internal_close(self);

done:
    if (name)
        TyMem_Free(name);
    return ret;
}

static int
winconsoleio_traverse(TyObject *op, visitproc visit, void *arg)
{
    winconsoleio *self = winconsoleio_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->dict);
    return 0;
}

static int
winconsoleio_clear(TyObject *op)
{
    winconsoleio *self = winconsoleio_CAST(op);
    Ty_CLEAR(self->dict);
    return 0;
}

static void
winconsoleio_dealloc(TyObject *op)
{
    winconsoleio *self = winconsoleio_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    self->finalizing = 1;
    if (_PyIOBase_finalize(op) < 0)
        return;
    _TyObject_GC_UNTRACK(self);
    FT_CLEAR_WEAKREFS(op, self->weakreflist);
    Ty_CLEAR(self->dict);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
err_closed(void)
{
    TyErr_SetString(TyExc_ValueError, "I/O operation on closed file");
    return NULL;
}

static TyObject *
err_mode(_PyIO_State *state, const char *action)
{
    return TyErr_Format(state->unsupported_operation,
                        "Console buffer does not support %s", action);
}

/*[clinic input]
_io._WindowsConsoleIO.fileno

Return the underlying file descriptor (an integer).

[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_fileno_impl(winconsoleio *self)
/*[clinic end generated code: output=006fa74ce3b5cfbf input=845c47ebbc3a2f67]*/
{
    if (self->fd < 0)
        return err_closed();
    return TyLong_FromLong(self->fd);
}

/*[clinic input]
_io._WindowsConsoleIO.readable

True if console is an input buffer.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_readable_impl(winconsoleio *self)
/*[clinic end generated code: output=daf9cef2743becf0 input=6be9defb5302daae]*/
{
    if (self->fd == -1)
        return err_closed();
    return TyBool_FromLong((long) self->readable);
}

/*[clinic input]
_io._WindowsConsoleIO.writable

True if console is an output buffer.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_writable_impl(winconsoleio *self)
/*[clinic end generated code: output=e0a2ad7eae5abf67 input=cefbd8abc24df6a0]*/
{
    if (self->fd == -1)
        return err_closed();
    return TyBool_FromLong((long) self->writable);
}

static DWORD
_buflen(winconsoleio *self)
{
    for (DWORD i = 0; i < SMALLBUF; ++i) {
        if (!self->buf[i])
            return i;
    }
    return SMALLBUF;
}

static DWORD
_copyfrombuf(winconsoleio *self, char *buf, DWORD len)
{
    DWORD n = 0;

    while (self->buf[0] && len--) {
        buf[n++] = self->buf[0];
        for (int i = 1; i < SMALLBUF; ++i)
            self->buf[i - 1] = self->buf[i];
        self->buf[SMALLBUF - 1] = 0;
    }

    return n;
}

static wchar_t *
read_console_w(HANDLE handle, DWORD maxlen, DWORD *readlen) {
    int err = 0, sig = 0;

    wchar_t *buf = (wchar_t*)TyMem_Malloc(maxlen * sizeof(wchar_t));
    if (!buf) {
        TyErr_NoMemory();
        goto error;
    }

    *readlen = 0;

    //DebugBreak();
    Ty_BEGIN_ALLOW_THREADS
    DWORD off = 0;
    while (off < maxlen) {
        DWORD n = (DWORD)-1;
        DWORD len = min(maxlen - off, BUFSIZ);
        SetLastError(0);
        BOOL res = ReadConsoleW(handle, &buf[off], len, &n, NULL);

        if (!res) {
            err = GetLastError();
            break;
        }
        if (n == (DWORD)-1 && (err = GetLastError()) == ERROR_OPERATION_ABORTED) {
            break;
        }
        if (n == 0) {
            err = GetLastError();
            if (err != ERROR_OPERATION_ABORTED)
                break;
            err = 0;
            HANDLE hInterruptEvent = _TyOS_SigintEvent();
            if (WaitForSingleObjectEx(hInterruptEvent, 100, FALSE)
                    == WAIT_OBJECT_0) {
                ResetEvent(hInterruptEvent);
                Ty_BLOCK_THREADS
                sig = TyErr_CheckSignals();
                Ty_UNBLOCK_THREADS
                if (sig < 0)
                    break;
            }
        }
        *readlen += n;

        /* If we didn't read a full buffer that time, don't try
           again or we will block a second time. */
        if (n < len)
            break;
        /* If the buffer ended with a newline, break out */
        if (buf[*readlen - 1] == '\n')
            break;
        /* If the buffer ends with a high surrogate, expand the
           buffer and read an extra character. */
        WORD char_type;
        if (off + BUFSIZ >= maxlen &&
            GetStringTypeW(CT_CTYPE3, &buf[*readlen - 1], 1, &char_type) &&
            char_type == C3_HIGHSURROGATE) {
            wchar_t *newbuf;
            maxlen += 1;
            Ty_BLOCK_THREADS
            newbuf = (wchar_t*)TyMem_Realloc(buf, maxlen * sizeof(wchar_t));
            Ty_UNBLOCK_THREADS
            if (!newbuf) {
                sig = -1;
                TyErr_NoMemory();
                break;
            }
            buf = newbuf;
            /* Only advance by n and not BUFSIZ in this case */
            off += n;
            continue;
        }

        off += BUFSIZ;
    }

    Ty_END_ALLOW_THREADS

    if (sig)
        goto error;
    if (err) {
        TyErr_SetFromWindowsErr(err);
        goto error;
    }

    if (*readlen > 0 && buf[0] == L'\x1a') {
        TyMem_Free(buf);
        buf = (wchar_t *)TyMem_Malloc(sizeof(wchar_t));
        if (!buf) {
            TyErr_NoMemory();
            goto error;
        }
        buf[0] = L'\0';
        *readlen = 0;
    }

    return buf;

error:
    if (buf)
        TyMem_Free(buf);
    return NULL;
}


static Ty_ssize_t
readinto(_PyIO_State *state, winconsoleio *self, char *buf, Ty_ssize_t len)
{
    if (self->fd == -1) {
        err_closed();
        return -1;
    }
    if (!self->readable) {
        err_mode(state, "reading");
        return -1;
    }
    if (len == 0)
        return 0;
    if (len > BUFMAX) {
        TyErr_Format(TyExc_ValueError, "cannot read more than %d bytes", BUFMAX);
        return -1;
    }

    HANDLE handle = _Ty_get_osfhandle(self->fd);
    if (handle == INVALID_HANDLE_VALUE)
        return -1;

    /* Each character may take up to 4 bytes in the final buffer.
       This is highly conservative, but necessary to avoid
       failure for any given Unicode input (e.g. \U0010ffff).
       If the caller requests fewer than 4 bytes, we buffer one
       character.
    */
    DWORD wlen = (DWORD)(len / 4);
    if (wlen == 0) {
        wlen = 1;
    }

    DWORD read_len = _copyfrombuf(self, buf, (DWORD)len);
    if (read_len) {
        buf = &buf[read_len];
        len -= read_len;
        wlen -= 1;
    }
    if (len == read_len || wlen == 0)
        return read_len;

    DWORD n;
    wchar_t *wbuf = read_console_w(handle, wlen, &n);
    if (wbuf == NULL)
        return -1;
    if (n == 0) {
        TyMem_Free(wbuf);
        return read_len;
    }

    int err = 0;
    DWORD u8n = 0;

    Ty_BEGIN_ALLOW_THREADS
    if (len < 4) {
        if (WideCharToMultiByte(CP_UTF8, 0, wbuf, n,
                self->buf, sizeof(self->buf) / sizeof(self->buf[0]),
                NULL, NULL))
            u8n = _copyfrombuf(self, buf, (DWORD)len);
    } else {
        u8n = WideCharToMultiByte(CP_UTF8, 0, wbuf, n,
            buf, (DWORD)len, NULL, NULL);
    }

    if (u8n) {
        read_len += u8n;
        u8n = 0;
    } else {
        err = GetLastError();
        if (err == ERROR_INSUFFICIENT_BUFFER) {
            /* Calculate the needed buffer for a more useful error, as this
                means our "/ 4" logic above is insufficient for some input.
            */
            u8n = WideCharToMultiByte(CP_UTF8, 0, wbuf, n,
                NULL, 0, NULL, NULL);
        }
    }
    Ty_END_ALLOW_THREADS

    TyMem_Free(wbuf);

    if (u8n) {
        TyErr_Format(TyExc_SystemError,
            "Buffer had room for %zd bytes but %u bytes required",
            len, u8n);
        return -1;
    }
    if (err) {
        TyErr_SetFromWindowsErr(err);
        return -1;
    }

    return read_len;
}

/*[clinic input]
_io._WindowsConsoleIO.readinto
    cls: defining_class
    buffer: Ty_buffer(accept={rwbuffer})
    /

Same as RawIOBase.readinto().
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_readinto_impl(winconsoleio *self, TyTypeObject *cls,
                                    Ty_buffer *buffer)
/*[clinic end generated code: output=96717c74f6204b79 input=4b0627c3b1645f78]*/
{
    _PyIO_State *state = get_io_state_by_cls(cls);
    Ty_ssize_t len = readinto(state, self, buffer->buf, buffer->len);
    if (len < 0)
        return NULL;

    return TyLong_FromSsize_t(len);
}

static DWORD
new_buffersize(winconsoleio *self, DWORD currentsize)
{
    DWORD addend;

    /* Expand the buffer by an amount proportional to the current size,
       giving us amortized linear-time behavior.  For bigger sizes, use a
       less-than-double growth factor to avoid excessive allocation. */
    if (currentsize > 65536)
        addend = currentsize >> 3;
    else
        addend = 256 + currentsize;
    if (addend < SMALLCHUNK)
        /* Avoid tiny read() calls. */
        addend = SMALLCHUNK;
    return addend + currentsize;
}

/*[clinic input]
_io._WindowsConsoleIO.readall

Read all data from the console, returned as bytes.

Return an empty bytes object at EOF.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_readall_impl(winconsoleio *self)
/*[clinic end generated code: output=e6d312c684f6e23b input=4024d649a1006e69]*/
{
    wchar_t *buf;
    DWORD bufsize, n, len = 0;
    TyObject *bytes;
    DWORD bytes_size, rn;
    HANDLE handle;

    if (self->fd == -1)
        return err_closed();

    handle = _Ty_get_osfhandle(self->fd);
    if (handle == INVALID_HANDLE_VALUE)
        return NULL;

    bufsize = BUFSIZ;

    buf = (wchar_t*)TyMem_Malloc((bufsize + 1) * sizeof(wchar_t));
    if (buf == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    while (1) {
        wchar_t *subbuf;

        if (len >= (Ty_ssize_t)bufsize) {
            DWORD newsize = new_buffersize(self, len);
            if (newsize > BUFMAX)
                break;
            if (newsize < bufsize) {
                TyErr_SetString(TyExc_OverflowError,
                                "unbounded read returned more bytes "
                                "than a Python bytes object can hold");
                TyMem_Free(buf);
                return NULL;
            }
            bufsize = newsize;

            wchar_t *tmp = TyMem_Realloc(buf,
                                         (bufsize + 1) * sizeof(wchar_t));
            if (tmp == NULL) {
                TyMem_Free(buf);
                TyErr_NoMemory();
                return NULL;
            }
            buf = tmp;
        }

        subbuf = read_console_w(handle, bufsize - len, &n);

        if (subbuf == NULL) {
            TyMem_Free(buf);
            return NULL;
        }

        if (n > 0)
            wcsncpy_s(&buf[len], bufsize - len + 1, subbuf, n);

        TyMem_Free(subbuf);

        /* when the read is empty we break */
        if (n == 0)
            break;

        len += n;
    }

    if (len == 0 && _buflen(self) == 0) {
        /* when the result starts with ^Z we return an empty buffer */
        TyMem_Free(buf);
        return TyBytes_FromStringAndSize(NULL, 0);
    }

    if (len) {
        Ty_BEGIN_ALLOW_THREADS
        bytes_size = WideCharToMultiByte(CP_UTF8, 0, buf, len,
            NULL, 0, NULL, NULL);
        Ty_END_ALLOW_THREADS

        if (!bytes_size) {
            DWORD err = GetLastError();
            TyMem_Free(buf);
            return TyErr_SetFromWindowsErr(err);
        }
    } else {
        bytes_size = 0;
    }

    bytes_size += _buflen(self);
    bytes = TyBytes_FromStringAndSize(NULL, bytes_size);
    rn = _copyfrombuf(self, TyBytes_AS_STRING(bytes), bytes_size);

    if (len) {
        Ty_BEGIN_ALLOW_THREADS
        bytes_size = WideCharToMultiByte(CP_UTF8, 0, buf, len,
            &TyBytes_AS_STRING(bytes)[rn], bytes_size - rn, NULL, NULL);
        Ty_END_ALLOW_THREADS

        if (!bytes_size) {
            DWORD err = GetLastError();
            TyMem_Free(buf);
            Ty_CLEAR(bytes);
            return TyErr_SetFromWindowsErr(err);
        }

        /* add back the number of preserved bytes */
        bytes_size += rn;
    }

    TyMem_Free(buf);
    if (bytes_size < (size_t)TyBytes_GET_SIZE(bytes)) {
        if (_TyBytes_Resize(&bytes, n * sizeof(wchar_t)) < 0) {
            Ty_CLEAR(bytes);
            return NULL;
        }
    }
    return bytes;
}

/*[clinic input]
_io._WindowsConsoleIO.read
    cls: defining_class
    size: Ty_ssize_t(accept={int, NoneType}) = -1
    /

Read at most size bytes, returned as bytes.

Only makes one system call when size is a positive integer,
so less data may be returned than requested.
Return an empty bytes object at EOF.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_read_impl(winconsoleio *self, TyTypeObject *cls,
                                Ty_ssize_t size)
/*[clinic end generated code: output=7e569a586537c0ae input=a14570a5da273365]*/
{
    TyObject *bytes;
    Ty_ssize_t bytes_size;

    if (self->fd == -1)
        return err_closed();
    if (!self->readable) {
        _PyIO_State *state = get_io_state_by_cls(cls);
        return err_mode(state, "reading");
    }

    if (size < 0)
        return _io__WindowsConsoleIO_readall_impl(self);
    if (size > BUFMAX) {
        TyErr_Format(TyExc_ValueError, "cannot read more than %d bytes", BUFMAX);
        return NULL;
    }

    bytes = TyBytes_FromStringAndSize(NULL, size);
    if (bytes == NULL)
        return NULL;

    _PyIO_State *state = get_io_state_by_cls(cls);
    bytes_size = readinto(state, self, TyBytes_AS_STRING(bytes),
                          TyBytes_GET_SIZE(bytes));
    if (bytes_size < 0) {
        Ty_CLEAR(bytes);
        return NULL;
    }

    if (bytes_size < TyBytes_GET_SIZE(bytes)) {
        if (_TyBytes_Resize(&bytes, bytes_size) < 0) {
            Ty_CLEAR(bytes);
            return NULL;
        }
    }

    return bytes;
}

/*[clinic input]
_io._WindowsConsoleIO.write
    cls: defining_class
    b: Ty_buffer
    /

Write buffer b to file, return number of bytes written.

Only makes one system call, so not all of the data may be written.
The number of bytes actually written is returned.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_write_impl(winconsoleio *self, TyTypeObject *cls,
                                 Ty_buffer *b)
/*[clinic end generated code: output=e8019f480243cb29 input=10ac37c19339dfbe]*/
{
    BOOL res = TRUE;
    wchar_t *wbuf;
    DWORD len, wlen, n = 0;
    HANDLE handle;

    if (self->fd == -1)
        return err_closed();
    if (!self->writable) {
        _PyIO_State *state = get_io_state_by_cls(cls);
        return err_mode(state, "writing");
    }

    handle = _Ty_get_osfhandle(self->fd);
    if (handle == INVALID_HANDLE_VALUE)
        return NULL;

    if (!b->len) {
        return TyLong_FromLong(0);
    }
    if (b->len > BUFMAX)
        len = BUFMAX;
    else
        len = (DWORD)b->len;

    Ty_BEGIN_ALLOW_THREADS
    /* issue11395 there is an unspecified upper bound on how many bytes
       can be written at once. We cap at 32k - the caller will have to
       handle partial writes.
       Since we don't know how many input bytes are being ignored, we
       have to reduce and recalculate. */
    const DWORD max_wlen = 32766 / sizeof(wchar_t);
    /* UTF-8 to wchar ratio is at most 3:1. */
    len = Ty_MIN(len, max_wlen * 3);
    while (1) {
        /* Fix for github issues gh-110913 and gh-82052. */
        len = _find_last_utf8_boundary(b->buf, len);
        wlen = MultiByteToWideChar(CP_UTF8, 0, b->buf, len, NULL, 0);
        if (wlen <= max_wlen) {
            break;
        }
        len /= 2;
    }
    Ty_END_ALLOW_THREADS

    if (!wlen) {
        return TyLong_FromLong(0);
    }

    wbuf = (wchar_t*)TyMem_Malloc(wlen * sizeof(wchar_t));
    if (!wbuf) {
        TyErr_NoMemory();
        return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    wlen = MultiByteToWideChar(CP_UTF8, 0, b->buf, len, wbuf, wlen);
    if (wlen) {
        res = WriteConsoleW(handle, wbuf, wlen, &n, NULL);
#ifdef Ty_DEBUG
        if (res) {
#else
        if (res && n < wlen) {
#endif
            /* Wrote fewer characters than expected, which means our
             * len value may be wrong. So recalculate it from the
             * characters that were written.
             */
            len = _wchar_to_utf8_count(b->buf, len, n);
        }
    } else
        res = 0;
    Ty_END_ALLOW_THREADS

    if (!res) {
        DWORD err = GetLastError();
        TyMem_Free(wbuf);
        return TyErr_SetFromWindowsErr(err);
    }

    TyMem_Free(wbuf);
    return TyLong_FromSsize_t(len);
}

static TyObject *
winconsoleio_repr(TyObject *op)
{
    winconsoleio *self = winconsoleio_CAST(op);
    const char *type_name = Ty_TYPE(self)->tp_name;

    if (self->fd == -1) {
        return TyUnicode_FromFormat("<%.100s [closed]>", type_name);
    }

    if (self->readable) {
        return TyUnicode_FromFormat("<%.100s mode='rb' closefd=%s>",
                                    type_name,
                                    self->closefd ? "True" : "False");
    }
    if (self->writable) {
        return TyUnicode_FromFormat("<%.100s mode='wb' closefd=%s>",
                                    type_name,
                                    self->closefd ? "True" : "False");
    }

    TyErr_SetString(TyExc_SystemError, "_WindowsConsoleIO has invalid mode");
    return NULL;
}

/*[clinic input]
_io._WindowsConsoleIO.isatty

Always True.
[clinic start generated code]*/

static TyObject *
_io__WindowsConsoleIO_isatty_impl(winconsoleio *self)
/*[clinic end generated code: output=9eac09d287c11bd7 input=9b91591dbe356f86]*/
{
    if (self->fd == -1)
        return err_closed();

    Py_RETURN_TRUE;
}

#define clinic_state() (find_io_state_by_def(Ty_TYPE(self)))
#include "clinic/winconsoleio.c.h"
#undef clinic_state

static TyMethodDef winconsoleio_methods[] = {
    _IO__WINDOWSCONSOLEIO_READ_METHODDEF
    _IO__WINDOWSCONSOLEIO_READALL_METHODDEF
    _IO__WINDOWSCONSOLEIO_READINTO_METHODDEF
    _IO__WINDOWSCONSOLEIO_WRITE_METHODDEF
    _IO__WINDOWSCONSOLEIO_CLOSE_METHODDEF
    _IO__WINDOWSCONSOLEIO_READABLE_METHODDEF
    _IO__WINDOWSCONSOLEIO_WRITABLE_METHODDEF
    _IO__WINDOWSCONSOLEIO_FILENO_METHODDEF
    _IO__WINDOWSCONSOLEIO_ISATTY_METHODDEF
    {"_isatty_open_only", _io__WindowsConsoleIO_isatty, METH_NOARGS},
    {NULL,           NULL}             /* sentinel */
};

/* 'closed' and 'mode' are attributes for compatibility with FileIO. */

static TyObject *
get_closed(TyObject *op, void *Py_UNUSED(closure))
{
    winconsoleio *self = winconsoleio_CAST(op);
    return TyBool_FromLong((long)(self->fd == -1));
}

static TyObject *
get_closefd(TyObject *op, void *Py_UNUSED(closure))
{
    winconsoleio *self = winconsoleio_CAST(op);
    return TyBool_FromLong((long)(self->closefd));
}

static TyObject *
get_mode(TyObject *op, void *Py_UNUSED(closure))
{
    winconsoleio *self = winconsoleio_CAST(op);
    return TyUnicode_FromString(self->readable ? "rb" : "wb");
}

static TyGetSetDef winconsoleio_getsetlist[] = {
    {"closed", get_closed, NULL, "True if the file is closed"},
    {"closefd", get_closefd, NULL,
        "True if the file descriptor will be closed by close()."},
    {"mode", get_mode, NULL, "String giving the file mode"},
    {NULL},
};

static TyMemberDef winconsoleio_members[] = {
    {"_blksize", Ty_T_UINT, offsetof(winconsoleio, blksize), 0},
    {"_finalizing", Ty_T_BOOL, offsetof(winconsoleio, finalizing), 0},
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(winconsoleio, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(winconsoleio, dict), Py_READONLY},
    {NULL}
};

static TyType_Slot winconsoleio_slots[] = {
    {Ty_tp_dealloc, winconsoleio_dealloc},
    {Ty_tp_repr, winconsoleio_repr},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_doc, (void *)_io__WindowsConsoleIO___init____doc__},
    {Ty_tp_traverse, winconsoleio_traverse},
    {Ty_tp_clear, winconsoleio_clear},
    {Ty_tp_methods, winconsoleio_methods},
    {Ty_tp_members, winconsoleio_members},
    {Ty_tp_getset, winconsoleio_getsetlist},
    {Ty_tp_init, _io__WindowsConsoleIO___init__},
    {Ty_tp_new, winconsoleio_new},
    {0, NULL},
};

TyType_Spec winconsoleio_spec = {
    .name = "_io._WindowsConsoleIO",
    .basicsize = sizeof(winconsoleio),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = winconsoleio_slots,
};

#endif /* HAVE_WINDOWS_CONSOLE_IO */
