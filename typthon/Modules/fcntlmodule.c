/* fcntl module */

// Need limited C API version 3.13 for TyLong_AsInt()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "Python.h"

#include <errno.h>                // EINTR
#include <fcntl.h>                // fcntl()
#include <string.h>               // memcpy()
#include <sys/ioctl.h>            // ioctl()
#ifdef HAVE_SYS_FILE_H
#  include <sys/file.h>           // flock()
#endif
#ifdef HAVE_LINUX_FS_H
#  include <linux/fs.h>
#endif
#ifdef HAVE_STROPTS_H
#  include <stropts.h>            // I_FLUSHBAND
#endif

#define GUARDSZ 8
// NUL followed by random bytes.
static const char guard[GUARDSZ] _Ty_NONSTRING = "\x00\xfa\x69\xc4\x67\xa3\x6c\x58";

/*[clinic input]
module fcntl
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=124b58387c158179]*/

#include "clinic/fcntlmodule.c.h"

/*[clinic input]
fcntl.fcntl

    fd: fildes
    cmd as code: int
    arg: object(c_default='NULL') = 0
    /

Perform the operation `cmd` on file descriptor fd.

The values used for `cmd` are operating system dependent, and are available
as constants in the fcntl module, using the same names as used in
the relevant C header files.  The argument arg is optional, and
defaults to 0; it may be an int or a string.  If arg is given as a string,
the return value of fcntl is a string of that length, containing the
resulting value put in the arg buffer by the operating system.  The length
of the arg string is not allowed to exceed 1024 bytes.  If the arg given
is an integer or if none is specified, the result value is an integer
corresponding to the return value of the fcntl call in the C code.
[clinic start generated code]*/

static TyObject *
fcntl_fcntl_impl(TyObject *module, int fd, int code, TyObject *arg)
/*[clinic end generated code: output=888fc93b51c295bd input=7955340198e5f334]*/
{
    int ret;
    int async_err = 0;

    if (TySys_Audit("fcntl.fcntl", "iiO", fd, code, arg ? arg : Ty_None) < 0) {
        return NULL;
    }

    if (arg == NULL || PyIndex_Check(arg)) {
        unsigned int int_arg = 0;
        if (arg != NULL) {
            if (!TyArg_Parse(arg, "I", &int_arg)) {
                return NULL;
            }
        }

        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = fcntl(fd, code, (int)int_arg);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
        if (ret < 0) {
            return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
        }
        return TyLong_FromLong(ret);
    }
    if (TyUnicode_Check(arg) || PyObject_CheckBuffer(arg)) {
        Ty_buffer view;
#define FCNTL_BUFSZ 1024
        /* argument plus NUL byte plus guard to detect a buffer overflow */
        char buf[FCNTL_BUFSZ+GUARDSZ];

        if (!TyArg_Parse(arg, "s*", &view)) {
            return NULL;
        }
        Ty_ssize_t len = view.len;
        if (len > FCNTL_BUFSZ) {
            TyErr_SetString(TyExc_ValueError,
                            "fcntl argument 3 is too long");
            PyBuffer_Release(&view);
            return NULL;
        }
        memcpy(buf, view.buf, len);
        memcpy(buf + len, guard, GUARDSZ);
        PyBuffer_Release(&view);

        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = fcntl(fd, code, buf);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
        if (ret < 0) {
            return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
        }
        if (memcmp(buf + len, guard, GUARDSZ) != 0) {
            TyErr_SetString(TyExc_SystemError, "buffer overflow");
            return NULL;
        }
        return TyBytes_FromStringAndSize(buf, len);
#undef FCNTL_BUFSZ
    }
    TyErr_Format(TyExc_TypeError,
                 "fcntl() argument 3 must be an integer, "
                 "a bytes-like object, or a string, not %T",
                 arg);
    return NULL;
}


/*[clinic input]
fcntl.ioctl

    fd: fildes
    request as code: unsigned_long(bitwise=True)
    arg: object(c_default='NULL') = 0
    mutate_flag as mutate_arg: bool = True
    /

Perform the operation `request` on file descriptor `fd`.

The values used for `request` are operating system dependent, and are available
as constants in the fcntl or termios library modules, using the same names as
used in the relevant C header files.

The argument `arg` is optional, and defaults to 0; it may be an int or a
buffer containing character data (most likely a string or an array).

If the argument is a mutable buffer (such as an array) and if the
mutate_flag argument (which is only allowed in this case) is true then the
buffer is (in effect) passed to the operating system and changes made by
the OS will be reflected in the contents of the buffer after the call has
returned.  The return value is the integer returned by the ioctl system
call.

If the argument is a mutable buffer and the mutable_flag argument is false,
the behavior is as if a string had been passed.

If the argument is an immutable buffer (most likely a string) then a copy
of the buffer is passed to the operating system and the return value is a
string of the same length containing whatever the operating system put in
the buffer.  The length of the arg buffer in this case is not allowed to
exceed 1024 bytes.

If the arg given is an integer or if none is specified, the result value is
an integer corresponding to the return value of the ioctl call in the C
code.
[clinic start generated code]*/

static TyObject *
fcntl_ioctl_impl(TyObject *module, int fd, unsigned long code, TyObject *arg,
                 int mutate_arg)
/*[clinic end generated code: output=f72baba2454d7a62 input=9c6cca5e2c339622]*/
{
    /* We use the unsigned non-checked 'I' format for the 'code' parameter
       because the system expects it to be a 32bit bit field value
       regardless of it being passed as an int or unsigned long on
       various platforms.  See the termios.TIOCSWINSZ constant across
       platforms for an example of this.

       If any of the 64bit platforms ever decide to use more than 32bits
       in their unsigned long ioctl codes this will break and need
       special casing based on the platform being built on.
     */
    int ret;
    int async_err = 0;

    if (TySys_Audit("fcntl.ioctl", "ikO", fd, code, arg ? arg : Ty_None) < 0) {
        return NULL;
    }

    if (arg == NULL || PyIndex_Check(arg)) {
        int int_arg = 0;
        if (arg != NULL) {
            if (!TyArg_Parse(arg, "i", &int_arg)) {
                return NULL;
            }
        }

        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = ioctl(fd, code, int_arg);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
        if (ret < 0) {
            return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
        }
        return TyLong_FromLong(ret);
    }
    if (TyUnicode_Check(arg) || PyObject_CheckBuffer(arg)) {
        Ty_buffer view;
#define IOCTL_BUFSZ 1024
        /* argument plus NUL byte plus guard to detect a buffer overflow */
        char buf[IOCTL_BUFSZ+GUARDSZ];
        if (mutate_arg && !TyBytes_Check(arg) && !TyUnicode_Check(arg)) {
            if (PyObject_GetBuffer(arg, &view, PyBUF_WRITABLE) == 0) {
                Ty_ssize_t len = view.len;
                void *ptr = view.buf;
                if (len <= IOCTL_BUFSZ) {
                    memcpy(buf, ptr, len);
                    memcpy(buf + len, guard, GUARDSZ);
                    ptr = buf;
                }
                do {
                    Ty_BEGIN_ALLOW_THREADS
                    ret = ioctl(fd, code, ptr);
                    Ty_END_ALLOW_THREADS
                } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
                if (ret < 0) {
                    if (!async_err) {
                        TyErr_SetFromErrno(TyExc_OSError);
                    }
                    PyBuffer_Release(&view);
                    return NULL;
                }
                if (ptr == buf) {
                    memcpy(view.buf, buf, len);
                }
                PyBuffer_Release(&view);
                if (ptr == buf && memcmp(buf + len, guard, GUARDSZ) != 0) {
                    TyErr_SetString(TyExc_SystemError, "buffer overflow");
                    return NULL;
                }
                return TyLong_FromLong(ret);
            }
            if (!TyErr_ExceptionMatches(TyExc_BufferError)) {
                return NULL;
            }
            TyErr_Clear();
        }

        if (!TyArg_Parse(arg, "s*", &view)) {
            return NULL;
        }
        Ty_ssize_t len = view.len;
        if (len > IOCTL_BUFSZ) {
            TyErr_SetString(TyExc_ValueError,
                            "ioctl argument 3 is too long");
            PyBuffer_Release(&view);
            return NULL;
        }
        memcpy(buf, view.buf, len);
        memcpy(buf + len, guard, GUARDSZ);
        PyBuffer_Release(&view);

        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = ioctl(fd, code, buf);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
        if (ret < 0) {
            return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
        }
        if (memcmp(buf + len, guard, GUARDSZ) != 0) {
            TyErr_SetString(TyExc_SystemError, "buffer overflow");
            return NULL;
        }
        return TyBytes_FromStringAndSize(buf, len);
#undef IOCTL_BUFSZ
    }
    TyErr_Format(TyExc_TypeError,
                 "ioctl() argument 3 must be an integer, "
                 "a bytes-like object, or a string, not %T",
                 arg);
    return NULL;
}

/*[clinic input]
fcntl.flock

    fd: fildes
    operation as code: int
    /

Perform the lock operation `operation` on file descriptor `fd`.

See the Unix manual page for flock(2) for details (On some systems, this
function is emulated using fcntl()).
[clinic start generated code]*/

static TyObject *
fcntl_flock_impl(TyObject *module, int fd, int code)
/*[clinic end generated code: output=84059e2b37d2fc64 input=0bfc00f795953452]*/
{
    int ret;
    int async_err = 0;

    if (TySys_Audit("fcntl.flock", "ii", fd, code) < 0) {
        return NULL;
    }

#ifdef HAVE_FLOCK
    do {
        Ty_BEGIN_ALLOW_THREADS
        ret = flock(fd, code);
        Ty_END_ALLOW_THREADS
    } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
#else

#ifndef LOCK_SH
#define LOCK_SH         1       /* shared lock */
#define LOCK_EX         2       /* exclusive lock */
#define LOCK_NB         4       /* don't block when locking */
#define LOCK_UN         8       /* unlock */
#endif
    {
        struct flock l;
        if (code == LOCK_UN)
            l.l_type = F_UNLCK;
        else if (code & LOCK_SH)
            l.l_type = F_RDLCK;
        else if (code & LOCK_EX)
            l.l_type = F_WRLCK;
        else {
            TyErr_SetString(TyExc_ValueError,
                            "unrecognized flock argument");
            return NULL;
        }
        l.l_whence = l.l_start = l.l_len = 0;
        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = fcntl(fd, (code & LOCK_NB) ? F_SETLK : F_SETLKW, &l);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
    }
#endif /* HAVE_FLOCK */
    if (ret < 0) {
        return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
    }
    Py_RETURN_NONE;
}


/*[clinic input]
fcntl.lockf

    fd: fildes
    cmd as code: int
    len as lenobj: object(c_default='NULL') = 0
    start as startobj: object(c_default='NULL') = 0
    whence: int = 0
    /

A wrapper around the fcntl() locking calls.

`fd` is the file descriptor of the file to lock or unlock, and operation is one
of the following values:

    LOCK_UN - unlock
    LOCK_SH - acquire a shared lock
    LOCK_EX - acquire an exclusive lock

When operation is LOCK_SH or LOCK_EX, it can also be bitwise ORed with
LOCK_NB to avoid blocking on lock acquisition.  If LOCK_NB is used and the
lock cannot be acquired, an OSError will be raised and the exception will
have an errno attribute set to EACCES or EAGAIN (depending on the operating
system -- for portability, check for either value).

`len` is the number of bytes to lock, with the default meaning to lock to
EOF.  `start` is the byte offset, relative to `whence`, to that the lock
starts.  `whence` is as with fileobj.seek(), specifically:

    0 - relative to the start of the file (SEEK_SET)
    1 - relative to the current buffer position (SEEK_CUR)
    2 - relative to the end of the file (SEEK_END)
[clinic start generated code]*/

static TyObject *
fcntl_lockf_impl(TyObject *module, int fd, int code, TyObject *lenobj,
                 TyObject *startobj, int whence)
/*[clinic end generated code: output=4985e7a172e7461a input=5480479fc63a04b8]*/
{
    int ret;
    int async_err = 0;

    if (TySys_Audit("fcntl.lockf", "iiOOi", fd, code, lenobj ? lenobj : Ty_None,
                    startobj ? startobj : Ty_None, whence) < 0) {
        return NULL;
    }

#ifndef LOCK_SH
#define LOCK_SH         1       /* shared lock */
#define LOCK_EX         2       /* exclusive lock */
#define LOCK_NB         4       /* don't block when locking */
#define LOCK_UN         8       /* unlock */
#endif  /* LOCK_SH */
    {
        struct flock l;
        if (code == LOCK_UN)
            l.l_type = F_UNLCK;
        else if (code & LOCK_SH)
            l.l_type = F_RDLCK;
        else if (code & LOCK_EX)
            l.l_type = F_WRLCK;
        else {
            TyErr_SetString(TyExc_ValueError,
                            "unrecognized lockf argument");
            return NULL;
        }
        l.l_start = l.l_len = 0;
        if (startobj != NULL) {
#if !defined(HAVE_LARGEFILE_SUPPORT)
            l.l_start = TyLong_AsLong(startobj);
#else
            l.l_start = TyLong_Check(startobj) ?
                            TyLong_AsLongLong(startobj) :
                    TyLong_AsLong(startobj);
#endif
            if (TyErr_Occurred())
                return NULL;
        }
        if (lenobj != NULL) {
#if !defined(HAVE_LARGEFILE_SUPPORT)
            l.l_len = TyLong_AsLong(lenobj);
#else
            l.l_len = TyLong_Check(lenobj) ?
                            TyLong_AsLongLong(lenobj) :
                    TyLong_AsLong(lenobj);
#endif
            if (TyErr_Occurred())
                return NULL;
        }
        l.l_whence = whence;
        do {
            Ty_BEGIN_ALLOW_THREADS
            ret = fcntl(fd, (code & LOCK_NB) ? F_SETLK : F_SETLKW, &l);
            Ty_END_ALLOW_THREADS
        } while (ret == -1 && errno == EINTR && !(async_err = TyErr_CheckSignals()));
    }
    if (ret < 0) {
        return !async_err ? TyErr_SetFromErrno(TyExc_OSError) : NULL;
    }
    Py_RETURN_NONE;
}

/* List of functions */

static TyMethodDef fcntl_methods[] = {
    FCNTL_FCNTL_METHODDEF
    FCNTL_IOCTL_METHODDEF
    FCNTL_FLOCK_METHODDEF
    FCNTL_LOCKF_METHODDEF
    {NULL, NULL}  /* sentinel */
};


TyDoc_STRVAR(module_doc,
"This module performs file control and I/O control on file\n\
descriptors.  It is an interface to the fcntl() and ioctl() Unix\n\
routines.  File descriptors can be obtained with the fileno() method of\n\
a file or socket object.");

/* Module initialisation */


static int
all_ins(TyObject* m)
{
    if (TyModule_AddIntMacro(m, LOCK_SH)) return -1;
    if (TyModule_AddIntMacro(m, LOCK_EX)) return -1;
    if (TyModule_AddIntMacro(m, LOCK_NB)) return -1;
    if (TyModule_AddIntMacro(m, LOCK_UN)) return -1;
/* GNU extensions, as of glibc 2.2.4 */
#ifdef LOCK_MAND
    if (TyModule_AddIntMacro(m, LOCK_MAND)) return -1;
#endif
#ifdef LOCK_READ
    if (TyModule_AddIntMacro(m, LOCK_READ)) return -1;
#endif
#ifdef LOCK_WRITE
    if (TyModule_AddIntMacro(m, LOCK_WRITE)) return -1;
#endif
#ifdef LOCK_RW
    if (TyModule_AddIntMacro(m, LOCK_RW)) return -1;
#endif

#ifdef F_DUPFD
    if (TyModule_AddIntMacro(m, F_DUPFD)) return -1;
#endif
#ifdef F_DUPFD_CLOEXEC
    if (TyModule_AddIntMacro(m, F_DUPFD_CLOEXEC)) return -1;
#endif
#ifdef F_GETFD
    if (TyModule_AddIntMacro(m, F_GETFD)) return -1;
#endif
#ifdef F_SETFD
    if (TyModule_AddIntMacro(m, F_SETFD)) return -1;
#endif
#ifdef F_GETFL
    if (TyModule_AddIntMacro(m, F_GETFL)) return -1;
#endif
#ifdef F_SETFL
    if (TyModule_AddIntMacro(m, F_SETFL)) return -1;
#endif
#ifdef F_GETLK
    if (TyModule_AddIntMacro(m, F_GETLK)) return -1;
#endif
#ifdef F_SETLK
    if (TyModule_AddIntMacro(m, F_SETLK)) return -1;
#endif
#ifdef F_SETLKW
    if (TyModule_AddIntMacro(m, F_SETLKW)) return -1;
#endif
#ifdef F_OFD_GETLK
    if (TyModule_AddIntMacro(m, F_OFD_GETLK)) return -1;
#endif
#ifdef F_OFD_SETLK
    if (TyModule_AddIntMacro(m, F_OFD_SETLK)) return -1;
#endif
#ifdef F_OFD_SETLKW
    if (TyModule_AddIntMacro(m, F_OFD_SETLKW)) return -1;
#endif
#ifdef F_GETOWN
    if (TyModule_AddIntMacro(m, F_GETOWN)) return -1;
#endif
#ifdef F_SETOWN
    if (TyModule_AddIntMacro(m, F_SETOWN)) return -1;
#endif
#ifdef F_GETPATH
    if (TyModule_AddIntMacro(m, F_GETPATH)) return -1;
#endif
#ifdef F_GETSIG
    if (TyModule_AddIntMacro(m, F_GETSIG)) return -1;
#endif
#ifdef F_SETSIG
    if (TyModule_AddIntMacro(m, F_SETSIG)) return -1;
#endif
#ifdef F_RDLCK
    if (TyModule_AddIntMacro(m, F_RDLCK)) return -1;
#endif
#ifdef F_WRLCK
    if (TyModule_AddIntMacro(m, F_WRLCK)) return -1;
#endif
#ifdef F_UNLCK
    if (TyModule_AddIntMacro(m, F_UNLCK)) return -1;
#endif
/* LFS constants */
#ifdef F_GETLK64
    if (TyModule_AddIntMacro(m, F_GETLK64)) return -1;
#endif
#ifdef F_SETLK64
    if (TyModule_AddIntMacro(m, F_SETLK64)) return -1;
#endif
#ifdef F_SETLKW64
    if (TyModule_AddIntMacro(m, F_SETLKW64)) return -1;
#endif
/* GNU extensions, as of glibc 2.2.4. */
#ifdef FASYNC
    if (TyModule_AddIntMacro(m, FASYNC)) return -1;
#endif
#ifdef F_SETLEASE
    if (TyModule_AddIntMacro(m, F_SETLEASE)) return -1;
#endif
#ifdef F_GETLEASE
    if (TyModule_AddIntMacro(m, F_GETLEASE)) return -1;
#endif
#ifdef F_NOTIFY
    if (TyModule_AddIntMacro(m, F_NOTIFY)) return -1;
#endif
#ifdef F_DUPFD_QUERY
    if (TyModule_AddIntMacro(m, F_DUPFD_QUERY)) return -1;
#endif
/* Old BSD flock(). */
#ifdef F_EXLCK
    if (TyModule_AddIntMacro(m, F_EXLCK)) return -1;
#endif
#ifdef F_SHLCK
    if (TyModule_AddIntMacro(m, F_SHLCK)) return -1;
#endif

/* Linux specifics */
#ifdef F_SETPIPE_SZ
    if (TyModule_AddIntMacro(m, F_SETPIPE_SZ)) return -1;
#endif
#ifdef F_GETPIPE_SZ
    if (TyModule_AddIntMacro(m, F_GETPIPE_SZ)) return -1;
#endif

/* On Android, FICLONE is blocked by SELinux. */
#ifndef __ANDROID__
#ifdef FICLONE
    if (TyModule_AddIntMacro(m, FICLONE)) return -1;
#endif
#ifdef FICLONERANGE
    if (TyModule_AddIntMacro(m, FICLONERANGE)) return -1;
#endif
#endif

#ifdef F_GETOWN_EX
    // since Linux 2.6.32
    if (TyModule_AddIntMacro(m, F_GETOWN_EX)) return -1;
    if (TyModule_AddIntMacro(m, F_SETOWN_EX)) return -1;
    if (TyModule_AddIntMacro(m, F_OWNER_TID)) return -1;
    if (TyModule_AddIntMacro(m, F_OWNER_PID)) return -1;
    if (TyModule_AddIntMacro(m, F_OWNER_PGRP)) return -1;
#endif
#ifdef F_GET_RW_HINT
    // since Linux 4.13
    if (TyModule_AddIntMacro(m, F_GET_RW_HINT)) return -1;
    if (TyModule_AddIntMacro(m, F_SET_RW_HINT)) return -1;
    if (TyModule_AddIntMacro(m, F_GET_FILE_RW_HINT)) return -1;
    if (TyModule_AddIntMacro(m, F_SET_FILE_RW_HINT)) return -1;
#ifndef RWH_WRITE_LIFE_NOT_SET  // typo in Linux < 5.5
# define RWH_WRITE_LIFE_NOT_SET RWF_WRITE_LIFE_NOT_SET
#endif
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_NOT_SET)) return -1;
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_NONE)) return -1;
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_SHORT)) return -1;
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_MEDIUM)) return -1;
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_LONG)) return -1;
    if (TyModule_AddIntMacro(m, RWH_WRITE_LIFE_EXTREME)) return -1;
#endif

/* OS X specifics */
#ifdef F_FULLFSYNC
    if (TyModule_AddIntMacro(m, F_FULLFSYNC)) return -1;
#endif
#ifdef F_NOCACHE
    if (TyModule_AddIntMacro(m, F_NOCACHE)) return -1;
#endif

/* FreeBSD specifics */
#ifdef F_DUP2FD
    if (TyModule_AddIntMacro(m, F_DUP2FD)) return -1;
#endif
#ifdef F_DUP2FD_CLOEXEC
    if (TyModule_AddIntMacro(m, F_DUP2FD_CLOEXEC)) return -1;
#endif
#ifdef F_READAHEAD
    if (TyModule_AddIntMacro(m, F_READAHEAD)) return -1;
#endif
#ifdef F_RDAHEAD
    if (TyModule_AddIntMacro(m, F_RDAHEAD)) return -1;
#endif
#ifdef F_ISUNIONSTACK
    if (TyModule_AddIntMacro(m, F_ISUNIONSTACK)) return -1;
#endif
#ifdef F_KINFO
    if (TyModule_AddIntMacro(m, F_KINFO)) return -1;
#endif

/* NetBSD specifics */
#ifdef F_CLOSEM
    if (TyModule_AddIntMacro(m, F_CLOSEM)) return -1;
#endif
#ifdef F_MAXFD
    if (TyModule_AddIntMacro(m, F_MAXFD)) return -1;
#endif
#ifdef F_GETNOSIGPIPE
    if (TyModule_AddIntMacro(m, F_GETNOSIGPIPE)) return -1;
#endif
#ifdef F_SETNOSIGPIPE
    if (TyModule_AddIntMacro(m, F_SETNOSIGPIPE)) return -1;
#endif

/* For F_{GET|SET}FL */
#ifdef FD_CLOEXEC
    if (TyModule_AddIntMacro(m, FD_CLOEXEC)) return -1;
#endif

/* For F_NOTIFY */
#ifdef DN_ACCESS
    if (TyModule_AddIntMacro(m, DN_ACCESS)) return -1;
#endif
#ifdef DN_MODIFY
    if (TyModule_AddIntMacro(m, DN_MODIFY)) return -1;
#endif
#ifdef DN_CREATE
    if (TyModule_AddIntMacro(m, DN_CREATE)) return -1;
#endif
#ifdef DN_DELETE
    if (TyModule_AddIntMacro(m, DN_DELETE)) return -1;
#endif
#ifdef DN_RENAME
    if (TyModule_AddIntMacro(m, DN_RENAME)) return -1;
#endif
#ifdef DN_ATTRIB
    if (TyModule_AddIntMacro(m, DN_ATTRIB)) return -1;
#endif
#ifdef DN_MULTISHOT
    if (TyModule_AddIntMacro(m, DN_MULTISHOT)) return -1;
#endif

#ifdef HAVE_STROPTS_H
    /* Unix 98 guarantees that these are in stropts.h. */
    if (TyModule_AddIntMacro(m, I_PUSH)) return -1;
    if (TyModule_AddIntMacro(m, I_POP)) return -1;
    if (TyModule_AddIntMacro(m, I_LOOK)) return -1;
    if (TyModule_AddIntMacro(m, I_FLUSH)) return -1;
    if (TyModule_AddIntMacro(m, I_FLUSHBAND)) return -1;
    if (TyModule_AddIntMacro(m, I_SETSIG)) return -1;
    if (TyModule_AddIntMacro(m, I_GETSIG)) return -1;
    if (TyModule_AddIntMacro(m, I_FIND)) return -1;
    if (TyModule_AddIntMacro(m, I_PEEK)) return -1;
    if (TyModule_AddIntMacro(m, I_SRDOPT)) return -1;
    if (TyModule_AddIntMacro(m, I_GRDOPT)) return -1;
    if (TyModule_AddIntMacro(m, I_NREAD)) return -1;
    if (TyModule_AddIntMacro(m, I_FDINSERT)) return -1;
    if (TyModule_AddIntMacro(m, I_STR)) return -1;
    if (TyModule_AddIntMacro(m, I_SWROPT)) return -1;
#ifdef I_GWROPT
    /* despite the comment above, old-ish glibcs miss a couple... */
    if (TyModule_AddIntMacro(m, I_GWROPT)) return -1;
#endif
    if (TyModule_AddIntMacro(m, I_SENDFD)) return -1;
    if (TyModule_AddIntMacro(m, I_RECVFD)) return -1;
    if (TyModule_AddIntMacro(m, I_LIST)) return -1;
    if (TyModule_AddIntMacro(m, I_ATMARK)) return -1;
    if (TyModule_AddIntMacro(m, I_CKBAND)) return -1;
    if (TyModule_AddIntMacro(m, I_GETBAND)) return -1;
    if (TyModule_AddIntMacro(m, I_CANPUT)) return -1;
    if (TyModule_AddIntMacro(m, I_SETCLTIME)) return -1;
#ifdef I_GETCLTIME
    if (TyModule_AddIntMacro(m, I_GETCLTIME)) return -1;
#endif
    if (TyModule_AddIntMacro(m, I_LINK)) return -1;
    if (TyModule_AddIntMacro(m, I_UNLINK)) return -1;
    if (TyModule_AddIntMacro(m, I_PLINK)) return -1;
    if (TyModule_AddIntMacro(m, I_PUNLINK)) return -1;
#endif
#ifdef F_ADD_SEALS
    /* Linux: file sealing for memfd_create() */
    if (TyModule_AddIntMacro(m, F_ADD_SEALS)) return -1;
    if (TyModule_AddIntMacro(m, F_GET_SEALS)) return -1;
    if (TyModule_AddIntMacro(m, F_SEAL_SEAL)) return -1;
    if (TyModule_AddIntMacro(m, F_SEAL_SHRINK)) return -1;
    if (TyModule_AddIntMacro(m, F_SEAL_GROW)) return -1;
    if (TyModule_AddIntMacro(m, F_SEAL_WRITE)) return -1;
#ifdef F_SEAL_FUTURE_WRITE
    if (TyModule_AddIntMacro(m, F_SEAL_FUTURE_WRITE)) return -1;
#endif
#endif
    return 0;
}

static int
fcntl_exec(TyObject *module)
{
    if (all_ins(module) < 0) {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot fcntl_slots[] = {
    {Ty_mod_exec, fcntl_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef fcntlmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "fcntl",
    .m_doc = module_doc,
    .m_size = 0,
    .m_methods = fcntl_methods,
    .m_slots = fcntl_slots,
};

PyMODINIT_FUNC
PyInit_fcntl(void)
{
    return PyModuleDef_Init(&fcntlmodule);
}
