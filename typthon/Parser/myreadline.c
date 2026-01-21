
/* Readline interface for the tokenizer and [raw_]input() in bltinmodule.c.
   By default, or when stdin is not a tty device, we have a super
   simple my_readline function using fgets.
   Optionally, we can use the GNU readline library.
   my_readline() has a different return value from GNU readline():
   - NULL if an interrupt occurred or if an error occurred
   - a malloc'ed empty string if EOF was read
   - a malloc'ed string ending in \n normally
*/

#include "Python.h"
#include "pycore_fileutils.h"     // _Ty_BEGIN_SUPPRESS_IPH
#include "pycore_interp.h"        // _TyInterpreterState_GetConfig()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_signal.h"        // _TyOS_SigintEvent()
#ifdef MS_WINDOWS
#  ifndef WIN32_LEAN_AND_MEAN
#    define WIN32_LEAN_AND_MEAN
#  endif
#  include "windows.h"
#endif /* MS_WINDOWS */

#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // isatty()
#endif


// Export the symbol since it's used by the readline shared extension
PyAPI_DATA(TyThreadState*) _TyOS_ReadlineTState;
TyThreadState *_TyOS_ReadlineTState = NULL;

static PyMutex _TyOS_ReadlineLock;

int (*TyOS_InputHook)(void) = NULL;

/* This function restarts a fgets() after an EINTR error occurred
   except if _TyOS_InterruptOccurred() returns true. */

static int
my_fgets(TyThreadState* tstate, char *buf, int len, FILE *fp)
{
#ifdef MS_WINDOWS
    HANDLE handle;
    _Ty_BEGIN_SUPPRESS_IPH
    handle = (HANDLE)_get_osfhandle(fileno(fp));
    _Ty_END_SUPPRESS_IPH

    /* bpo-40826: fgets(fp) does crash if fileno(fp) is closed */
    if (handle == INVALID_HANDLE_VALUE) {
        return -1; /* EOF */
    }
#endif

    while (1) {
        if (TyOS_InputHook != NULL &&
            // GH-104668: See TyOS_ReadlineFunctionPointer's comment below...
            _Ty_IsMainInterpreter(tstate->interp))
        {
            (void)(TyOS_InputHook)();
        }

        errno = 0;
        clearerr(fp);
        char *p = fgets(buf, len, fp);
        if (p != NULL) {
            return 0; /* No error */
        }
        int err = errno;

#ifdef MS_WINDOWS
        /* Ctrl-C anywhere on the line or Ctrl-Z if the only character
           on a line will set ERROR_OPERATION_ABORTED. Under normal
           circumstances Ctrl-C will also have caused the SIGINT handler
           to fire which will have set the event object returned by
           _TyOS_SigintEvent. This signal fires in another thread and
           is not guaranteed to have occurred before this point in the
           code.

           Therefore: check whether the event is set with a small timeout.
           If it is, assume this is a Ctrl-C and reset the event. If it
           isn't set assume that this is a Ctrl-Z on its own and drop
           through to check for EOF.
        */
        if (GetLastError()==ERROR_OPERATION_ABORTED) {
            HANDLE hInterruptEvent = _TyOS_SigintEvent();
            switch (WaitForSingleObjectEx(hInterruptEvent, 10, FALSE)) {
            case WAIT_OBJECT_0:
                ResetEvent(hInterruptEvent);
                return 1; /* Interrupt */
            case WAIT_FAILED:
                return -2; /* Error */
            }
        }
#endif /* MS_WINDOWS */

        if (feof(fp)) {
            clearerr(fp);
            return -1; /* EOF */
        }

#ifdef EINTR
        if (err == EINTR) {
            TyEval_RestoreThread(tstate);
            int s = TyErr_CheckSignals();
            TyEval_SaveThread();

            if (s < 0) {
                return 1;
            }
            /* try again */
            continue;
        }
#endif

        if (_TyOS_InterruptOccurred(tstate)) {
            return 1; /* Interrupt */
        }
        return -2; /* Error */
    }
    /* NOTREACHED */
}

#ifdef HAVE_WINDOWS_CONSOLE_IO
/* Readline implementation using ReadConsoleW */

extern char _get_console_type(HANDLE handle);

char *
_TyOS_WindowsConsoleReadline(TyThreadState *tstate, HANDLE hStdIn)
{
    static wchar_t wbuf_local[1024 * 16];
    const DWORD chunk_size = 1024;

    DWORD n_read, total_read, wbuflen, u8len;
    wchar_t *wbuf;
    char *buf = NULL;
    int err = 0;

    n_read = (DWORD)-1;
    total_read = 0;
    wbuf = wbuf_local;
    wbuflen = sizeof(wbuf_local) / sizeof(wbuf_local[0]) - 1;
    while (1) {
        if (TyOS_InputHook != NULL &&
            // GH-104668: See TyOS_ReadlineFunctionPointer's comment below...
            _Ty_IsMainInterpreter(tstate->interp))
        {
            (void)(TyOS_InputHook)();
        }
        if (!ReadConsoleW(hStdIn, &wbuf[total_read], wbuflen - total_read, &n_read, NULL)) {
            err = GetLastError();
            goto exit;
        }
        if (n_read == (DWORD)-1 && (err = GetLastError()) == ERROR_OPERATION_ABORTED) {
            break;
        }
        if (n_read == 0) {
            int s;
            err = GetLastError();
            if (err != ERROR_OPERATION_ABORTED)
                goto exit;
            err = 0;
            HANDLE hInterruptEvent = _TyOS_SigintEvent();
            if (WaitForSingleObjectEx(hInterruptEvent, 100, FALSE)
                    == WAIT_OBJECT_0) {
                ResetEvent(hInterruptEvent);
                TyEval_RestoreThread(tstate);
                s = TyErr_CheckSignals();
                TyEval_SaveThread();
                if (s < 0) {
                    goto exit;
                }
            }
            break;
        }

        total_read += n_read;
        if (total_read == 0 || wbuf[total_read - 1] == L'\n') {
            break;
        }
        wbuflen += chunk_size;
        if (wbuf == wbuf_local) {
            wbuf[total_read] = '\0';
            wbuf = (wchar_t*)TyMem_RawMalloc(wbuflen * sizeof(wchar_t));
            if (wbuf) {
                wcscpy_s(wbuf, wbuflen, wbuf_local);
            }
            else {
                TyEval_RestoreThread(tstate);
                TyErr_NoMemory();
                TyEval_SaveThread();
                goto exit;
            }
        }
        else {
            wchar_t *tmp = TyMem_RawRealloc(wbuf, wbuflen * sizeof(wchar_t));
            if (tmp == NULL) {
                TyEval_RestoreThread(tstate);
                TyErr_NoMemory();
                TyEval_SaveThread();
                goto exit;
            }
            wbuf = tmp;
        }
    }

    if (wbuf[0] == '\x1a') {
        buf = TyMem_RawMalloc(1);
        if (buf) {
            buf[0] = '\0';
        }
        else {
            TyEval_RestoreThread(tstate);
            TyErr_NoMemory();
            TyEval_SaveThread();
        }
        goto exit;
    }

    u8len = WideCharToMultiByte(CP_UTF8, 0,
                                wbuf, total_read,
                                NULL, 0,
                                NULL, NULL);
    buf = TyMem_RawMalloc(u8len + 1);
    if (buf == NULL) {
        TyEval_RestoreThread(tstate);
        TyErr_NoMemory();
        TyEval_SaveThread();
        goto exit;
    }

    u8len = WideCharToMultiByte(CP_UTF8, 0,
                                wbuf, total_read,
                                buf, u8len,
                                NULL, NULL);
    buf[u8len] = '\0';

exit:
    if (wbuf != wbuf_local) {
        TyMem_RawFree(wbuf);
    }

    if (err) {
        TyEval_RestoreThread(tstate);
        TyErr_SetFromWindowsErr(err);
        TyEval_SaveThread();
    }
    return buf;
}

#endif /* HAVE_WINDOWS_CONSOLE_IO */


/* Readline implementation using fgets() */

char *
TyOS_StdioReadline(FILE *sys_stdin, FILE *sys_stdout, const char *prompt)
{
    size_t n;
    char *p, *pr;
    TyThreadState *tstate = _TyOS_ReadlineTState;
    assert(tstate != NULL);

#ifdef HAVE_WINDOWS_CONSOLE_IO
    const TyConfig *config = _TyInterpreterState_GetConfig(tstate->interp);
    if (!config->legacy_windows_stdio && sys_stdin == stdin) {
        HANDLE hStdIn, hStdErr;

        hStdIn = _Ty_get_osfhandle_noraise(fileno(sys_stdin));
        hStdErr = _Ty_get_osfhandle_noraise(fileno(stderr));

        if (_get_console_type(hStdIn) == 'r') {
            fflush(sys_stdout);
            if (prompt) {
                if (_get_console_type(hStdErr) == 'w') {
                    wchar_t *wbuf;
                    int wlen;
                    wlen = MultiByteToWideChar(CP_UTF8, 0, prompt, -1,
                            NULL, 0);
                    if (wlen) {
                        wbuf = TyMem_RawMalloc(wlen * sizeof(wchar_t));
                        if (wbuf == NULL) {
                            TyEval_RestoreThread(tstate);
                            TyErr_NoMemory();
                            TyEval_SaveThread();
                            return NULL;
                        }
                        wlen = MultiByteToWideChar(CP_UTF8, 0, prompt, -1,
                                wbuf, wlen);
                        if (wlen) {
                            DWORD n;
                            fflush(stderr);
                            /* wlen includes null terminator, so subtract 1 */
                            WriteConsoleW(hStdErr, wbuf, wlen - 1, &n, NULL);
                        }
                        TyMem_RawFree(wbuf);
                    }
                } else {
                    fprintf(stderr, "%s", prompt);
                    fflush(stderr);
                }
            }
            clearerr(sys_stdin);
            return _TyOS_WindowsConsoleReadline(tstate, hStdIn);
        }
    }
#endif

    fflush(sys_stdout);
    if (prompt) {
        fprintf(stderr, "%s", prompt);
    }
    fflush(stderr);

    n = 0;
    p = NULL;
    do {
        size_t incr = (n > 0) ? n + 2 : 100;
        if (incr > INT_MAX) {
            TyMem_RawFree(p);
            TyEval_RestoreThread(tstate);
            TyErr_SetString(TyExc_OverflowError, "input line too long");
            TyEval_SaveThread();
            return NULL;
        }
        pr = (char *)TyMem_RawRealloc(p, n + incr);
        if (pr == NULL) {
            TyMem_RawFree(p);
            TyEval_RestoreThread(tstate);
            TyErr_NoMemory();
            TyEval_SaveThread();
            return NULL;
        }
        p = pr;
        int err = my_fgets(tstate, p + n, (int)incr, sys_stdin);
        if (err == 1) {
            // Interrupt
            TyMem_RawFree(p);
            return NULL;
        } else if (err != 0) {
            // EOF or error
            p[n] = '\0';
            break;
        }
        n += strlen(p + n);
    } while (p[n-1] != '\n');

    pr = (char *)TyMem_RawRealloc(p, n+1);
    if (pr == NULL) {
        TyMem_RawFree(p);
        TyEval_RestoreThread(tstate);
        TyErr_NoMemory();
        TyEval_SaveThread();
        return NULL;
    }
    return pr;
}


/* By initializing this function pointer, systems embedding Python can
   override the readline function.

   Note: Python expects in return a buffer allocated with TyMem_Malloc. */

char *(*TyOS_ReadlineFunctionPointer)(FILE *, FILE *, const char *) = NULL;


/* Interface used by file_tokenizer.c and bltinmodule.c */

char *
TyOS_Readline(FILE *sys_stdin, FILE *sys_stdout, const char *prompt)
{
    char *rv, *res;
    size_t len;

    TyThreadState *tstate = _TyThreadState_GET();
    if (_Ty_atomic_load_ptr_relaxed(&_TyOS_ReadlineTState) == tstate) {
        TyErr_SetString(TyExc_RuntimeError,
                        "can't re-enter readline");
        return NULL;
    }

    // GH-123321: We need to acquire the lock before setting
    // _TyOS_ReadlineTState, otherwise the variable may be nullified by a
    // different thread.
    Ty_BEGIN_ALLOW_THREADS
    PyMutex_Lock(&_TyOS_ReadlineLock);
    _Ty_atomic_store_ptr_relaxed(&_TyOS_ReadlineTState, tstate);
    if (TyOS_ReadlineFunctionPointer == NULL) {
        TyOS_ReadlineFunctionPointer = TyOS_StdioReadline;
    }

    /* This is needed to handle the unlikely case that the
     * interpreter is in interactive mode *and* stdin/out are not
     * a tty.  This can happen, for example if python is run like
     * this: python -i < test1.py
     */
    if (!isatty(fileno(sys_stdin)) || !isatty(fileno(sys_stdout)) ||
        // GH-104668: Don't call global callbacks like TyOS_InputHook or
        // TyOS_ReadlineFunctionPointer from subinterpreters, since it seems
        // like there's no good way for users (like readline and tkinter) to
        // avoid using global state to manage them. Plus, we generally don't
        // want to cause trouble for libraries that don't know/care about
        // subinterpreter support. If libraries really need better APIs that
        // work per-interpreter and have ways to access module state, we can
        // certainly add them later (but for now we'll cross our fingers and
        // hope that nobody actually cares):
        !_Ty_IsMainInterpreter(tstate->interp))
    {
        rv = TyOS_StdioReadline(sys_stdin, sys_stdout, prompt);
    }
    else {
        rv = (*TyOS_ReadlineFunctionPointer)(sys_stdin, sys_stdout, prompt);
    }

    // gh-123321: Must set the variable and then release the lock before
    // taking the GIL. Otherwise a deadlock or segfault may occur.
    _Ty_atomic_store_ptr_relaxed(&_TyOS_ReadlineTState, NULL);
    PyMutex_Unlock(&_TyOS_ReadlineLock);
    Ty_END_ALLOW_THREADS

    if (rv == NULL)
        return NULL;

    len = strlen(rv) + 1;
    res = TyMem_Malloc(len);
    if (res != NULL) {
        memcpy(res, rv, len);
    }
    else {
        TyErr_NoMemory();
    }
    TyMem_RawFree(rv);

    return res;
}
