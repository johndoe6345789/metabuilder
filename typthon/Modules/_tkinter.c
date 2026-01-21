/***********************************************************
Copyright (C) 1994 Steen Lumholt.

                        All Rights Reserved

******************************************************************/

/* _tkinter.c -- Interface to libtk.a and libtcl.a. */

/* TCL/TK VERSION INFO:

    Only Tcl/Tk 8.5.12 and later are supported.  Older versions are not
    supported. Use Python 3.10 or older if you cannot upgrade your
    Tcl/Tk libraries.
*/

/* XXX Further speed-up ideas, involving Tcl 8.0 features:

   - Register a new Tcl type, "Python callable", which can be called more
   efficiently and passed to Tcl_EvalObj() directly (if this is possible).

*/

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#ifdef MS_WINDOWS
#  include "pycore_fileutils.h"   // _Ty_stat()
#endif

#include "pycore_long.h"          // _TyLong_IsNegative()
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttrString()
#include "pycore_unicodeobject.h" // _TyUnicode_AsUTF8String

#ifdef MS_WINDOWS
#  include <windows.h>
#endif

#define CHECK_SIZE(size, elemsize) \
    ((size_t)(size) <= Ty_MIN((size_t)INT_MAX, UINT_MAX / (size_t)(elemsize)))

/* If Tcl is compiled for threads, we must also define TCL_THREAD. We define
   it always; if Tcl is not threaded, the thread functions in
   Tcl are empty.  */
#define TCL_THREADS

#ifdef TK_FRAMEWORK
#  include <Tcl/tcl.h>
#  include <Tk/tk.h>
#else
#  include <tcl.h>
#  include <tk.h>
#endif

#include "tkinter.h"

#if TK_HEX_VERSION < 0x0805020c
#error "Tk older than 8.5.12 not supported"
#endif

#ifndef TCL_WITH_EXTERNAL_TOMMATH
#define TCL_NO_TOMMATH_H
#endif
#include <tclTomMath.h>

#if defined(TCL_WITH_EXTERNAL_TOMMATH) || (TK_HEX_VERSION >= 0x08070000)
#define USE_DEPRECATED_TOMMATH_API 0
#else
#define USE_DEPRECATED_TOMMATH_API 1
#endif

// As suggested by https://core.tcl-lang.org/tcl/wiki?name=Migrating+C+extensions+to+Tcl+9
#ifndef TCL_SIZE_MAX
typedef int Tcl_Size;
#define TCL_SIZE_MAX INT_MAX
#endif

#if !(defined(MS_WINDOWS) || defined(__CYGWIN__))
#define HAVE_CREATEFILEHANDLER
#endif

#ifdef HAVE_CREATEFILEHANDLER

/* This bit is to ensure that TCL_UNIX_FD is defined and doesn't interfere
   with the proper calculation of FHANDLETYPE == TCL_UNIX_FD below. */
#ifndef TCL_UNIX_FD
#  ifdef TCL_WIN_SOCKET
#    define TCL_UNIX_FD (! TCL_WIN_SOCKET)
#  else
#    define TCL_UNIX_FD 1
#  endif
#endif

/* Tcl_CreateFileHandler() changed several times; these macros deal with the
   messiness.  In Tcl 8.0 and later, it is not available on Windows (and on
   Unix, only because Jack added it back); when available on Windows, it only
   applies to sockets. */

#ifdef MS_WINDOWS
#define FHANDLETYPE TCL_WIN_SOCKET
#else
#define FHANDLETYPE TCL_UNIX_FD
#endif

/* If Tcl can wait for a Unix file descriptor, define the EventHook() routine
   which uses this to handle Tcl events while the user is typing commands. */

#if FHANDLETYPE == TCL_UNIX_FD
#define WAIT_FOR_STDIN
#endif

#endif /* HAVE_CREATEFILEHANDLER */

/* Use OS native encoding for converting between Python strings and
   Tcl objects.
   On Windows use UTF-16 (or UTF-32 for 32-bit Tcl_UniChar) with the
   "surrogatepass" error handler for converting to/from Tcl Unicode objects.
   On Linux use UTF-8 with the "surrogateescape" error handler for converting
   to/from Tcl String objects. */
#ifdef MS_WINDOWS
#define USE_TCL_UNICODE 1
#else
#define USE_TCL_UNICODE 0
#endif

#if PY_LITTLE_ENDIAN
#define NATIVE_BYTEORDER -1
#else
#define NATIVE_BYTEORDER 1
#endif

#ifdef MS_WINDOWS
#include <conio.h>
#define WAIT_FOR_STDIN

static TyObject *
_get_tcl_lib_path(void)
{
    static TyObject *tcl_library_path = NULL;
    static int already_checked = 0;

    if (already_checked == 0) {
        struct stat stat_buf;
        int stat_return_value;
        TyObject *prefix;

        (void) _TySys_GetOptionalAttrString("base_prefix", &prefix);
        if (prefix == NULL) {
            return NULL;
        }

        /* Check expected location for an installed Python first */
        tcl_library_path = TyUnicode_FromString("\\tcl\\tcl" TCL_VERSION);
        if (tcl_library_path == NULL) {
            Ty_DECREF(prefix);
            return NULL;
        }
        tcl_library_path = TyUnicode_Concat(prefix, tcl_library_path);
        Ty_DECREF(prefix);
        if (tcl_library_path == NULL) {
            return NULL;
        }
        stat_return_value = _Ty_stat(tcl_library_path, &stat_buf);
        if (stat_return_value == -2) {
            return NULL;
        }
        if (stat_return_value == -1) {
            /* install location doesn't exist, reset errno and see if
               we're a repository build */
            errno = 0;
#ifdef Ty_TCLTK_DIR
            tcl_library_path = TyUnicode_FromString(
                                    Ty_TCLTK_DIR "\\lib\\tcl" TCL_VERSION);
            if (tcl_library_path == NULL) {
                return NULL;
            }
            stat_return_value = _Ty_stat(tcl_library_path, &stat_buf);
            if (stat_return_value == -2) {
                return NULL;
            }
            if (stat_return_value == -1) {
                /* tcltkDir for a repository build doesn't exist either,
                   reset errno and leave Tcl to its own devices */
                errno = 0;
                tcl_library_path = NULL;
            }
#else
            tcl_library_path = NULL;
#endif
        }
        already_checked = 1;
    }
    return tcl_library_path;
}
#endif /* MS_WINDOWS */

/* The threading situation is complicated.  Tcl is not thread-safe, except
   when configured with --enable-threads.

   So we need to use a lock around all uses of Tcl.  Previously, the
   Python interpreter lock was used for this.  However, this causes
   problems when other Python threads need to run while Tcl is blocked
   waiting for events.

   To solve this problem, a separate lock for Tcl is introduced.
   Holding it is incompatible with holding Python's interpreter lock.
   The following four macros manipulate both locks together.

   ENTER_TCL and LEAVE_TCL are brackets, just like
   Ty_BEGIN_ALLOW_THREADS and Ty_END_ALLOW_THREADS.  They should be
   used whenever a call into Tcl is made that could call an event
   handler, or otherwise affect the state of a Tcl interpreter.  These
   assume that the surrounding code has the Python interpreter lock;
   inside the brackets, the Python interpreter lock has been released
   and the lock for Tcl has been acquired.

   Sometimes, it is necessary to have both the Python lock and the Tcl
   lock.  (For example, when transferring data from the Tcl
   interpreter result to a Python string object.)  This can be done by
   using different macros to close the ENTER_TCL block: ENTER_OVERLAP
   reacquires the Python lock (and restores the thread state) but
   doesn't release the Tcl lock; LEAVE_OVERLAP_TCL releases the Tcl
   lock.

   By contrast, ENTER_PYTHON and LEAVE_PYTHON are used in Tcl event
   handlers when the handler needs to use Python.  Such event handlers
   are entered while the lock for Tcl is held; the event handler
   presumably needs to use Python.  ENTER_PYTHON releases the lock for
   Tcl and acquires the Python interpreter lock, restoring the
   appropriate thread state, and LEAVE_PYTHON releases the Python
   interpreter lock and re-acquires the lock for Tcl.  It is okay for
   ENTER_TCL/LEAVE_TCL pairs to be contained inside the code between
   ENTER_PYTHON and LEAVE_PYTHON.

   These locks expand to several statements and brackets; they should
   not be used in branches of if statements and the like.

   If Tcl is threaded, this approach won't work anymore. The Tcl
   interpreter is only valid in the thread that created it, and all Tk
   activity must happen in this thread, also. That means that the
   mainloop must be invoked in the thread that created the
   interpreter. Invoking commands from other threads is possible;
   _tkinter will queue an event for the interpreter thread, which will
   then execute the command and pass back the result. If the main
   thread is not in the mainloop, and invoking commands causes an
   exception; if the main loop is running but not processing events,
   the command invocation will block.

   In addition, for a threaded Tcl, a single global tcl_tstate won't
   be sufficient anymore, since multiple Tcl interpreters may
   simultaneously dispatch in different threads. So we use the Tcl TLS
   API.

*/

static TyThread_type_lock tcl_lock = 0;

#ifdef TCL_THREADS
static Tcl_ThreadDataKey state_key;
typedef TyThreadState *ThreadSpecificData;
#define tcl_tstate \
    (*(TyThreadState**)Tcl_GetThreadData(&state_key, sizeof(TyThreadState*)))
#else
static TyThreadState *tcl_tstate = NULL;
#endif

#define ENTER_TCL \
    { TyThreadState *tstate = TyThreadState_Get(); \
      Ty_BEGIN_ALLOW_THREADS \
      if(tcl_lock)TyThread_acquire_lock(tcl_lock, 1); \
      tcl_tstate = tstate;

#define LEAVE_TCL \
    tcl_tstate = NULL; \
    if(tcl_lock)TyThread_release_lock(tcl_lock); \
    Ty_END_ALLOW_THREADS}

#define ENTER_OVERLAP \
    Ty_END_ALLOW_THREADS

#define LEAVE_OVERLAP_TCL \
    tcl_tstate = NULL; if(tcl_lock)TyThread_release_lock(tcl_lock); }

#define ENTER_PYTHON \
    { TyThreadState *tstate = tcl_tstate; tcl_tstate = NULL; \
      if(tcl_lock) \
        TyThread_release_lock(tcl_lock); \
      TyEval_RestoreThread((tstate)); }

#define LEAVE_PYTHON \
    { TyThreadState *tstate = TyEval_SaveThread(); \
      if(tcl_lock)TyThread_acquire_lock(tcl_lock, 1); \
      tcl_tstate = tstate; }

#ifndef FREECAST
#define FREECAST (char *)
#endif

/**** Tkapp Object Declaration ****/

static TyObject *Tkapp_Type;

typedef struct {
    PyObject_HEAD
    Tcl_Interp *interp;
    int wantobjects;
    int threaded; /* True if tcl_platform[threaded] */
    Tcl_ThreadId thread_id;
    int dispatching;
    TyObject *trace;
    /* We cannot include tclInt.h, as this is internal.
       So we cache interesting types here. */
    const Tcl_ObjType *OldBooleanType;
    const Tcl_ObjType *BooleanType;
    const Tcl_ObjType *ByteArrayType;
    const Tcl_ObjType *DoubleType;
    const Tcl_ObjType *IntType;
    const Tcl_ObjType *WideIntType;
    const Tcl_ObjType *BignumType;
    const Tcl_ObjType *ListType;
    const Tcl_ObjType *StringType;
    const Tcl_ObjType *UTF32StringType;
    const Tcl_ObjType *PixelType;
} TkappObject;

#define TkappObject_CAST(op)    ((TkappObject *)(op))
#define Tkapp_Interp(v)         (TkappObject_CAST(v)->interp)

static inline int
check_tcl_appartment(TkappObject *app)
{
    if (app->threaded && app->thread_id != Tcl_GetCurrentThread()) {
        TyErr_SetString(TyExc_RuntimeError,
                        "Calling Tcl from different apartment");
        return -1;
    }
    return 0;
}

#define CHECK_TCL_APPARTMENT(APP)               \
    do {                                        \
        if (check_tcl_appartment(APP) < 0) {    \
            return 0;                           \
        }                                       \
    } while (0)


/**** Error Handling ****/

static TyObject *Tkinter_TclError;
static int quitMainLoop = 0;
static int errorInCmd = 0;
static TyObject *excInCmd;


static TyObject *Tkapp_UnicodeResult(TkappObject *);

static TyObject *
Tkinter_Error(TkappObject *self)
{
    TyObject *res = Tkapp_UnicodeResult(self);
    if (res != NULL) {
        TyErr_SetObject(Tkinter_TclError, res);
        Ty_DECREF(res);
    }
    return NULL;
}



/**** Utils ****/

static int Tkinter_busywaitinterval = 20;

#ifndef MS_WINDOWS

/* Millisecond sleep() for Unix platforms. */

static void
Sleep(int milli)
{
    /* XXX Too bad if you don't have select(). */
    struct timeval t;
    t.tv_sec = milli/1000;
    t.tv_usec = (milli%1000) * 1000;
    select(0, (fd_set *)0, (fd_set *)0, (fd_set *)0, &t);
}
#endif /* MS_WINDOWS */

/* Wait up to 1s for the mainloop to come up. */

static int
WaitForMainloop(TkappObject* self)
{
    int i;
    for (i = 0; i < 10; i++) {
        if (self->dispatching)
            return 1;
        Ty_BEGIN_ALLOW_THREADS
        Sleep(100);
        Ty_END_ALLOW_THREADS
    }
    if (self->dispatching)
        return 1;
    TyErr_SetString(TyExc_RuntimeError, "main thread is not in main loop");
    return 0;
}



#define ARGSZ 64



static TyObject *
unicodeFromTclStringAndSize(const char *s, Ty_ssize_t size)
{
    TyObject *r = TyUnicode_DecodeUTF8(s, size, NULL);
    if (r != NULL || !TyErr_ExceptionMatches(TyExc_UnicodeDecodeError)) {
        return r;
    }

    char *buf = NULL;
    TyErr_Clear();
    /* Tcl encodes null character as \xc0\x80.
       https://en.wikipedia.org/wiki/UTF-8#Modified_UTF-8 */
    if (memchr(s, '\xc0', size)) {
        char *q;
        const char *e = s + size;
        q = buf = (char *)TyMem_Malloc(size);
        if (buf == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
        while (s != e) {
            if (s + 1 != e && s[0] == '\xc0' && s[1] == '\x80') {
                *q++ = '\0';
                s += 2;
            }
            else
                *q++ = *s++;
        }
        s = buf;
        size = q - s;
    }
    r = TyUnicode_DecodeUTF8(s, size, "surrogateescape");
    if (buf != NULL) {
        TyMem_Free(buf);
    }
    if (r == NULL || TyUnicode_KIND(r) == TyUnicode_1BYTE_KIND) {
        return r;
    }

    /* In CESU-8 non-BMP characters are represented as a surrogate pair,
       like in UTF-16, and then each surrogate code point is encoded in UTF-8.
       https://en.wikipedia.org/wiki/CESU-8 */
    Ty_ssize_t len = TyUnicode_GET_LENGTH(r);
    Ty_ssize_t i, j;
    /* All encoded surrogate characters start with \xED. */
    i = TyUnicode_FindChar(r, 0xdcED, 0, len, 1);
    if (i == -2) {
        Ty_DECREF(r);
        return NULL;
    }
    if (i == -1) {
        return r;
    }
    Ty_UCS4 *u = TyUnicode_AsUCS4Copy(r);
    Ty_DECREF(r);
    if (u == NULL) {
        return NULL;
    }
    Ty_UCS4 ch;
    for (j = i; i < len; i++, u[j++] = ch) {
        Ty_UCS4 ch1, ch2, ch3, high, low;
        /* Low surrogates U+D800 - U+DBFF are encoded as
           \xED\xA0\x80 - \xED\xAF\xBF. */
        ch1 = ch = u[i];
        if (ch1 != 0xdcED) continue;
        ch2 = u[i + 1];
        if (!(0xdcA0 <= ch2 && ch2 <= 0xdcAF)) continue;
        ch3 = u[i + 2];
        if (!(0xdc80 <= ch3 && ch3 <= 0xdcBF)) continue;
        high = 0xD000 | ((ch2 & 0x3F) << 6) | (ch3 & 0x3F);
        assert(Ty_UNICODE_IS_HIGH_SURROGATE(high));
        /* High surrogates U+DC00 - U+DFFF are encoded as
           \xED\xB0\x80 - \xED\xBF\xBF. */
        ch1 = u[i + 3];
        if (ch1 != 0xdcED) continue;
        ch2 = u[i + 4];
        if (!(0xdcB0 <= ch2 && ch2 <= 0xdcBF)) continue;
        ch3 = u[i + 5];
        if (!(0xdc80 <= ch3 && ch3 <= 0xdcBF)) continue;
        low = 0xD000 | ((ch2 & 0x3F) << 6) | (ch3 & 0x3F);
        assert(Ty_UNICODE_IS_HIGH_SURROGATE(high));
        ch = Ty_UNICODE_JOIN_SURROGATES(high, low);
        i += 5;
    }
    r = TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND, u, j);
    TyMem_Free(u);
    return r;
}

static TyObject *
unicodeFromTclString(const char *s)
{
    return unicodeFromTclStringAndSize(s, strlen(s));
}

static TyObject *
unicodeFromTclObj(TkappObject *tkapp, Tcl_Obj *value)
{
    Tcl_Size len;
#if USE_TCL_UNICODE
    if (value->typePtr != NULL && tkapp != NULL &&
        (value->typePtr == tkapp->StringType ||
         value->typePtr == tkapp->UTF32StringType))
    {
        int byteorder = NATIVE_BYTEORDER;
        const Tcl_UniChar *u = Tcl_GetUnicodeFromObj(value, &len);
        if (sizeof(Tcl_UniChar) == 2)
            return TyUnicode_DecodeUTF16((const char *)u, len * 2,
                                         "surrogatepass", &byteorder);
        else if (sizeof(Tcl_UniChar) == 4)
            return TyUnicode_DecodeUTF32((const char *)u, len * 4,
                                         "surrogatepass", &byteorder);
        else
            Ty_UNREACHABLE();
    }
#endif /* USE_TCL_UNICODE */
    const char *s = Tcl_GetStringFromObj(value, &len);
    return unicodeFromTclStringAndSize(s, len);
}

/*[clinic input]
module _tkinter
class _tkinter.tkapp "TkappObject *" "&Tkapp_Type_spec"
class _tkinter.Tcl_Obj "PyTclObject *" "&PyTclObject_Type_spec"
class _tkinter.tktimertoken "TkttObject *" "&Tktt_Type_spec"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b1ebf15c162ee229]*/

/**** Tkapp Object ****/

#if TK_MAJOR_VERSION >= 9
int Tcl_AppInit(Tcl_Interp *);
#endif

#ifndef WITH_APPINIT
int
Tcl_AppInit(Tcl_Interp *interp)
{
    const char * _tkinter_skip_tk_init;

    if (Tcl_Init(interp) == TCL_ERROR) {
        TySys_WriteStderr("Tcl_Init error: %s\n", Tcl_GetStringResult(interp));
        return TCL_ERROR;
    }

    _tkinter_skip_tk_init = Tcl_GetVar(interp,
                    "_tkinter_skip_tk_init", TCL_GLOBAL_ONLY);
    if (_tkinter_skip_tk_init != NULL &&
                    strcmp(_tkinter_skip_tk_init, "1") == 0) {
        return TCL_OK;
    }

    if (Tk_Init(interp) == TCL_ERROR) {
        TySys_WriteStderr("Tk_Init error: %s\n", Tcl_GetStringResult(interp));
        return TCL_ERROR;
    }

    return TCL_OK;
}
#endif /* !WITH_APPINIT */




/* Initialize the Tk application; see the `main' function in
 * `tkMain.c'.
 */

static void EnableEventHook(void); /* Forward */
static void DisableEventHook(void); /* Forward */

static TkappObject *
Tkapp_New(const char *screenName, const char *className,
          int interactive, int wantobjects, int wantTk, int sync,
          const char *use)
{
    TkappObject *v;
    char *argv0;

    v = PyObject_New(TkappObject, (TyTypeObject *) Tkapp_Type);
    if (v == NULL)
        return NULL;

    v->interp = Tcl_CreateInterp();
    v->wantobjects = wantobjects;
    v->threaded = Tcl_GetVar2Ex(v->interp, "tcl_platform", "threaded",
                                TCL_GLOBAL_ONLY) != NULL;
    v->thread_id = Tcl_GetCurrentThread();
    v->dispatching = 0;
    v->trace = NULL;

#ifndef TCL_THREADS
    if (v->threaded) {
        TyErr_SetString(TyExc_RuntimeError,
                        "Tcl is threaded but _tkinter is not");
        Ty_DECREF(v);
        return 0;
    }
#endif
    if (v->threaded && tcl_lock) {
        /* If Tcl is threaded, we don't need the lock. */
        TyThread_free_lock(tcl_lock);
        tcl_lock = NULL;
    }

    v->OldBooleanType = Tcl_GetObjType("boolean");
    {
        Tcl_Obj *value;
        int boolValue;

        /* Tcl 8.5 "booleanString" type is not registered
           and is renamed to "boolean" in Tcl 9.0.
           Based on approach suggested at
           https://core.tcl-lang.org/tcl/info/3bb3bcf2da5b */
        value = Tcl_NewStringObj("true", -1);
        Tcl_GetBooleanFromObj(NULL, value, &boolValue);
        v->BooleanType = value->typePtr;
        Tcl_DecrRefCount(value);

        // "bytearray" type is not registered in Tcl 9.0
        value = Tcl_NewByteArrayObj(NULL, 0);
        v->ByteArrayType = value->typePtr;
        Tcl_DecrRefCount(value);
    }
    v->DoubleType = Tcl_GetObjType("double");
    /* TIP 484 suggests retrieving the "int" type without Tcl_GetObjType("int")
       since it is no longer registered in Tcl 9.0. But even though Tcl 8.7
       only uses the "wideInt" type on platforms with 32-bit long, it still has
       a registered "int" type, which FromObj() should recognize just in case. */
    v->IntType = Tcl_GetObjType("int");
    if (v->IntType == NULL) {
        Tcl_Obj *value = Tcl_NewIntObj(0);
        v->IntType = value->typePtr;
        Tcl_DecrRefCount(value);
    }
    v->WideIntType = Tcl_GetObjType("wideInt");
    v->BignumType = Tcl_GetObjType("bignum");
    v->ListType = Tcl_GetObjType("list");
    v->StringType = Tcl_GetObjType("string");
    v->UTF32StringType = Tcl_GetObjType("utf32string");
    v->PixelType = Tcl_GetObjType("pixel");

    /* Delete the 'exit' command, which can screw things up */
    Tcl_DeleteCommand(v->interp, "exit");

    if (screenName != NULL)
        Tcl_SetVar2(v->interp, "env", "DISPLAY",
                    screenName, TCL_GLOBAL_ONLY);

    if (interactive)
        Tcl_SetVar(v->interp, "tcl_interactive", "1", TCL_GLOBAL_ONLY);
    else
        Tcl_SetVar(v->interp, "tcl_interactive", "0", TCL_GLOBAL_ONLY);

    /* This is used to get the application class for Tk 4.1 and up */
    argv0 = (char*)TyMem_Malloc(strlen(className) + 1);
    if (!argv0) {
        TyErr_NoMemory();
        Ty_DECREF(v);
        return NULL;
    }

    strcpy(argv0, className);
    if (Ty_ISUPPER(argv0[0]))
        argv0[0] = Ty_TOLOWER(argv0[0]);
    Tcl_SetVar(v->interp, "argv0", argv0, TCL_GLOBAL_ONLY);
    TyMem_Free(argv0);

    if (! wantTk) {
        Tcl_SetVar(v->interp,
                        "_tkinter_skip_tk_init", "1", TCL_GLOBAL_ONLY);
    }

    /* some initial arguments need to be in argv */
    if (sync || use) {
        char *args;
        Ty_ssize_t len = 0;

        if (sync)
            len += sizeof "-sync";
        if (use)
            len += strlen(use) + sizeof "-use ";  /* never overflows */

        args = (char*)TyMem_Malloc(len);
        if (!args) {
            TyErr_NoMemory();
            Ty_DECREF(v);
            return NULL;
        }

        args[0] = '\0';
        if (sync)
            strcat(args, "-sync");
        if (use) {
            if (sync)
                strcat(args, " ");
            strcat(args, "-use ");
            strcat(args, use);
        }

        Tcl_SetVar(v->interp, "argv", args, TCL_GLOBAL_ONLY);
        TyMem_Free(args);
    }

#ifdef MS_WINDOWS
    {
        TyObject *str_path;
        TyObject *utf8_path;
        DWORD ret;

        ret = GetEnvironmentVariableW(L"TCL_LIBRARY", NULL, 0);
        if (!ret && GetLastError() == ERROR_ENVVAR_NOT_FOUND) {
            str_path = _get_tcl_lib_path();
            if (str_path == NULL && TyErr_Occurred()) {
                return NULL;
            }
            if (str_path != NULL) {
                utf8_path = TyUnicode_AsUTF8String(str_path);
                if (utf8_path == NULL) {
                    return NULL;
                }
                Tcl_SetVar(v->interp,
                           "tcl_library",
                           TyBytes_AS_STRING(utf8_path),
                           TCL_GLOBAL_ONLY);
                Ty_DECREF(utf8_path);
            }
        }
    }
#endif

    if (Tcl_AppInit(v->interp) != TCL_OK) {
        TyObject *result = Tkinter_Error(v);
        Ty_DECREF((TyObject *)v);
        return (TkappObject *)result;
    }

    EnableEventHook();

    return v;
}


static void
Tkapp_ThreadSend(TkappObject *self, Tcl_Event *ev,
                 Tcl_Condition *cond, Tcl_Mutex *mutex)
{
    Ty_BEGIN_ALLOW_THREADS;
    Tcl_MutexLock(mutex);
    Tcl_ThreadQueueEvent(self->thread_id, ev, TCL_QUEUE_TAIL);
    Tcl_ThreadAlert(self->thread_id);
    Tcl_ConditionWait(cond, mutex, NULL);
    Tcl_MutexUnlock(mutex);
    Ty_END_ALLOW_THREADS
}


/** Tcl Eval **/

typedef struct {
    PyObject_HEAD
    Tcl_Obj *value;
    TyObject *string; /* This cannot cause cycles. */
} PyTclObject;

// TODO(picnixz): maybe assert that 'op' is really a PyTclObject (we might want
//                to also add a FAST_CAST macro to bypass the check if needed).
#define PyTclObject_CAST(op)    ((PyTclObject *)(op))

static TyObject *PyTclObject_Type;
#define PyTclObject_Check(v) Ty_IS_TYPE(v, (TyTypeObject *)PyTclObject_Type)

static TyObject *
newPyTclObject(Tcl_Obj *arg)
{
    PyTclObject *self;
    self = PyObject_New(PyTclObject, (TyTypeObject *) PyTclObject_Type);
    if (self == NULL)
        return NULL;
    Tcl_IncrRefCount(arg);
    self->value = arg;
    self->string = NULL;
    return (TyObject*)self;
}

static void
PyTclObject_dealloc(TyObject *_self)
{
    PyTclObject *self = PyTclObject_CAST(_self);
    TyObject *tp = (TyObject *) Ty_TYPE(self);
    Tcl_DecrRefCount(self->value);
    Ty_XDECREF(self->string);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

/* Like _str, but create Unicode if necessary. */
TyDoc_STRVAR(PyTclObject_string__doc__,
"the string representation of this object, either as str or bytes");

static TyObject *
PyTclObject_string(TyObject *_self, void *Py_UNUSED(closure))
{
    PyTclObject *self = PyTclObject_CAST(_self);
    if (!self->string) {
        self->string = unicodeFromTclObj(NULL, self->value);
        if (!self->string)
            return NULL;
    }
    return Ty_NewRef(self->string);
}

static TyObject *
PyTclObject_str(TyObject *_self)
{
    PyTclObject *self = PyTclObject_CAST(_self);
    if (self->string) {
        return Ty_NewRef(self->string);
    }
    /* XXX Could cache result if it is non-ASCII. */
    return unicodeFromTclObj(NULL, self->value);
}

static TyObject *
PyTclObject_repr(TyObject *_self)
{
    PyTclObject *self = PyTclObject_CAST(_self);
    TyObject *repr, *str = PyTclObject_str(_self);
    if (str == NULL)
        return NULL;
    repr = TyUnicode_FromFormat("<%s object: %R>",
                                self->value->typePtr->name, str);
    Ty_DECREF(str);
    return repr;
}

static TyObject *
PyTclObject_richcompare(TyObject *self, TyObject *other, int op)
{
    int result;

    /* neither argument should be NULL, unless something's gone wrong */
    if (self == NULL || other == NULL) {
        TyErr_BadInternalCall();
        return NULL;
    }

    /* both arguments should be instances of PyTclObject */
    if (!PyTclObject_Check(self) || !PyTclObject_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    if (self == other) {
        /* fast path when self and other are identical */
        result = 0;
    }
    else {
        // 'self' and 'other' are known to be of correct type,
        // so we can fast cast them (no need to use the macro)
        result = strcmp(Tcl_GetString(((PyTclObject *)self)->value),
                        Tcl_GetString(((PyTclObject *)other)->value));
    }
    Py_RETURN_RICHCOMPARE(result, 0, op);
}

TyDoc_STRVAR(get_typename__doc__, "name of the Tcl type");

static TyObject*
get_typename(TyObject *self, void *Py_UNUSED(closure))
{
    PyTclObject *obj = PyTclObject_CAST(self);
    return unicodeFromTclString(obj->value->typePtr->name);
}


static TyGetSetDef PyTclObject_getsetlist[] = {
    {"typename", get_typename, NULL, get_typename__doc__},
    {"string", PyTclObject_string, NULL,
     PyTclObject_string__doc__},
    {0},
};

static TyType_Slot PyTclObject_Type_slots[] = {
    {Ty_tp_dealloc, PyTclObject_dealloc},
    {Ty_tp_repr, PyTclObject_repr},
    {Ty_tp_str, PyTclObject_str},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_richcompare, PyTclObject_richcompare},
    {Ty_tp_getset, PyTclObject_getsetlist},
    {0, 0}
};

static TyType_Spec PyTclObject_Type_spec = {
    "_tkinter.Tcl_Obj",
    sizeof(PyTclObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    PyTclObject_Type_slots,
};


#if SIZE_MAX > INT_MAX
#define CHECK_STRING_LENGTH(s) do {                                     \
        if (s != NULL && strlen(s) >= INT_MAX) {                        \
            TyErr_SetString(TyExc_OverflowError, "string is too long"); \
            return NULL;                                                \
        } } while(0)
#else
#define CHECK_STRING_LENGTH(s)
#endif

static Tcl_Obj*
asBignumObj(TyObject *value)
{
    Tcl_Obj *result;
    int neg;
    TyObject *hexstr;
    const char *hexchars;
    mp_int bigValue;

    assert(TyLong_Check(value));
    neg = _TyLong_IsNegative((PyLongObject *)value);
    hexstr = _TyLong_Format(value, 16);
    if (hexstr == NULL)
        return NULL;
    hexchars = TyUnicode_AsUTF8(hexstr);
    if (hexchars == NULL) {
        Ty_DECREF(hexstr);
        return NULL;
    }
    hexchars += neg + 2; /* skip sign and "0x" */
    if (mp_init(&bigValue) != MP_OKAY ||
        mp_read_radix(&bigValue, hexchars, 16) != MP_OKAY)
    {
        mp_clear(&bigValue);
        Ty_DECREF(hexstr);
        TyErr_NoMemory();
        return NULL;
    }
    Ty_DECREF(hexstr);
    bigValue.sign = neg ? MP_NEG : MP_ZPOS;
    result = Tcl_NewBignumObj(&bigValue);
    mp_clear(&bigValue);
    if (result == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    return result;
}

static Tcl_Obj*
AsObj(TyObject *value)
{
    Tcl_Obj *result;

    if (TyBytes_Check(value)) {
        if (TyBytes_GET_SIZE(value) >= INT_MAX) {
            TyErr_SetString(TyExc_OverflowError, "bytes object is too long");
            return NULL;
        }
        return Tcl_NewByteArrayObj((unsigned char *)TyBytes_AS_STRING(value),
                                   (int)TyBytes_GET_SIZE(value));
    }

    if (TyBool_Check(value))
        return Tcl_NewBooleanObj(PyObject_IsTrue(value));

    if (TyLong_CheckExact(value)) {
        int overflow;
        long longValue;
        Tcl_WideInt wideValue;
        longValue = TyLong_AsLongAndOverflow(value, &overflow);
        if (!overflow) {
            return Tcl_NewLongObj(longValue);
        }
        /* If there is an overflow in the long conversion,
           fall through to wideInt handling. */
        if (_TyLong_AsByteArray((PyLongObject *)value,
                                (unsigned char *)(void *)&wideValue,
                                sizeof(wideValue),
                                PY_LITTLE_ENDIAN,
                                /* signed */ 1,
                                /* with_exceptions */ 1) == 0) {
            return Tcl_NewWideIntObj(wideValue);
        }
        TyErr_Clear();
        /* If there is an overflow in the wideInt conversion,
           fall through to bignum handling. */
        return asBignumObj(value);
        /* If there is no wideInt or bignum support,
           fall through to default object handling. */
    }

    if (TyFloat_Check(value))
        return Tcl_NewDoubleObj(TyFloat_AS_DOUBLE(value));

    if (TyTuple_Check(value) || TyList_Check(value)) {
        Tcl_Obj **argv;
        Ty_ssize_t size, i;

        size = PySequence_Fast_GET_SIZE(value);
        if (size == 0)
            return Tcl_NewListObj(0, NULL);
        if (!CHECK_SIZE(size, sizeof(Tcl_Obj *))) {
            TyErr_SetString(TyExc_OverflowError,
                            TyTuple_Check(value) ? "tuple is too long" :
                                                   "list is too long");
            return NULL;
        }
        argv = (Tcl_Obj **) TyMem_Malloc(((size_t)size) * sizeof(Tcl_Obj *));
        if (!argv) {
          TyErr_NoMemory();
          return NULL;
        }
        for (i = 0; i < size; i++)
          argv[i] = AsObj(PySequence_Fast_GET_ITEM(value,i));
        result = Tcl_NewListObj((int)size, argv);
        TyMem_Free(argv);
        return result;
    }

    if (TyUnicode_Check(value)) {
        Ty_ssize_t size = TyUnicode_GET_LENGTH(value);
        if (size == 0) {
            return Tcl_NewStringObj("", 0);
        }
        if (!CHECK_SIZE(size, sizeof(Tcl_UniChar))) {
            TyErr_SetString(TyExc_OverflowError, "string is too long");
            return NULL;
        }
        if (TyUnicode_IS_ASCII(value) &&
            strlen(TyUnicode_DATA(value)) == (size_t)TyUnicode_GET_LENGTH(value))
        {
            return Tcl_NewStringObj((const char *)TyUnicode_DATA(value),
                                    (int)size);
        }

        TyObject *encoded;
#if USE_TCL_UNICODE
        if (sizeof(Tcl_UniChar) == 2)
            encoded = _TyUnicode_EncodeUTF16(value,
                    "surrogatepass", NATIVE_BYTEORDER);
        else if (sizeof(Tcl_UniChar) == 4)
            encoded = _TyUnicode_EncodeUTF32(value,
                    "surrogatepass", NATIVE_BYTEORDER);
        else
            Ty_UNREACHABLE();
        if (!encoded) {
            return NULL;
        }
        size = TyBytes_GET_SIZE(encoded);
        if (size > INT_MAX) {
            Ty_DECREF(encoded);
            TyErr_SetString(TyExc_OverflowError, "string is too long");
            return NULL;
        }
        result = Tcl_NewUnicodeObj((const Tcl_UniChar *)TyBytes_AS_STRING(encoded),
                                   (int)(size / sizeof(Tcl_UniChar)));
#else
        encoded = _TyUnicode_AsUTF8String(value, "surrogateescape");
        if (!encoded) {
            return NULL;
        }
        size = TyBytes_GET_SIZE(encoded);
        if (strlen(TyBytes_AS_STRING(encoded)) != (size_t)size) {
            /* The string contains embedded null characters.
             * Tcl needs a null character to be represented as \xc0\x80 in
             * the Modified UTF-8 encoding.  Otherwise the string can be
             * truncated in some internal operations.
             *
             * NOTE: stringlib_replace() could be used here, but optimizing
             * this obscure case isn't worth it unless stringlib_replace()
             * was already exposed in the C API for other reasons. */
            Ty_SETREF(encoded,
                      PyObject_CallMethod(encoded, "replace", "y#y#",
                                          "\0", (Ty_ssize_t)1,
                                          "\xc0\x80", (Ty_ssize_t)2));
            if (!encoded) {
                return NULL;
            }
            size = TyBytes_GET_SIZE(encoded);
        }
        if (size > INT_MAX) {
            Ty_DECREF(encoded);
            TyErr_SetString(TyExc_OverflowError, "string is too long");
            return NULL;
        }
        result = Tcl_NewStringObj(TyBytes_AS_STRING(encoded), (int)size);
#endif /* USE_TCL_UNICODE */
        Ty_DECREF(encoded);
        return result;
    }

    if (PyTclObject_Check(value)) {
        return ((PyTclObject*)value)->value;
    }

    {
        TyObject *v = PyObject_Str(value);
        if (!v)
            return 0;
        result = AsObj(v);
        Ty_DECREF(v);
        return result;
    }
}

static TyObject *
fromBoolean(TkappObject *tkapp, Tcl_Obj *value)
{
    int boolValue;
    if (Tcl_GetBooleanFromObj(Tkapp_Interp(tkapp), value, &boolValue) == TCL_ERROR)
        return Tkinter_Error(tkapp);
    return TyBool_FromLong(boolValue);
}

static TyObject*
fromWideIntObj(TkappObject *tkapp, Tcl_Obj *value)
{
        Tcl_WideInt wideValue;
        if (Tcl_GetWideIntFromObj(Tkapp_Interp(tkapp), value, &wideValue) == TCL_OK) {
            if (sizeof(wideValue) <= SIZEOF_LONG_LONG)
                return TyLong_FromLongLong(wideValue);
            return _TyLong_FromByteArray((unsigned char *)(void *)&wideValue,
                                         sizeof(wideValue),
                                         PY_LITTLE_ENDIAN,
                                         /* signed */ 1);
        }
        return NULL;
}

static TyObject*
fromBignumObj(TkappObject *tkapp, Tcl_Obj *value)
{
    mp_int bigValue;
    mp_err err;
#if USE_DEPRECATED_TOMMATH_API
    unsigned long numBytes;
#else
    size_t numBytes;
#endif
    unsigned char *bytes;
    TyObject *res;

    if (Tcl_GetBignumFromObj(Tkapp_Interp(tkapp), value, &bigValue) != TCL_OK)
        return Tkinter_Error(tkapp);
#if USE_DEPRECATED_TOMMATH_API
    numBytes = mp_unsigned_bin_size(&bigValue);
#else
    numBytes = mp_ubin_size(&bigValue);
#endif
    bytes = TyMem_Malloc(numBytes);
    if (bytes == NULL) {
        mp_clear(&bigValue);
        return TyErr_NoMemory();
    }
#if USE_DEPRECATED_TOMMATH_API
    err = mp_to_unsigned_bin_n(&bigValue, bytes, &numBytes);
#else
    err = mp_to_ubin(&bigValue, bytes, numBytes, NULL);
#endif
    if (err != MP_OKAY) {
        mp_clear(&bigValue);
        TyMem_Free(bytes);
        return TyErr_NoMemory();
    }
    res = _TyLong_FromByteArray(bytes, numBytes,
                                /* big-endian */ 0,
                                /* unsigned */ 0);
    TyMem_Free(bytes);
    if (res != NULL && bigValue.sign == MP_NEG) {
        TyObject *res2 = PyNumber_Negative(res);
        Ty_SETREF(res, res2);
    }
    mp_clear(&bigValue);
    return res;
}

static TyObject*
FromObj(TkappObject *tkapp, Tcl_Obj *value)
{
    TyObject *result = NULL;
    Tcl_Interp *interp = Tkapp_Interp(tkapp);

    if (value->typePtr == NULL) {
        return unicodeFromTclObj(tkapp, value);
    }

    if (value->typePtr == tkapp->BooleanType ||
        value->typePtr == tkapp->OldBooleanType) {
        return fromBoolean(tkapp, value);
    }

    if (value->typePtr == tkapp->ByteArrayType) {
        Tcl_Size size;
        char *data = (char*)Tcl_GetByteArrayFromObj(value, &size);
        return TyBytes_FromStringAndSize(data, size);
    }

    if (value->typePtr == tkapp->DoubleType) {
        return TyFloat_FromDouble(value->internalRep.doubleValue);
    }

    if (value->typePtr == tkapp->IntType ||
        value->typePtr == tkapp->WideIntType) {
        result = fromWideIntObj(tkapp, value);
        if (result != NULL || TyErr_Occurred())
            return result;
        Tcl_ResetResult(interp);
        /* If there is an error in the wideInt conversion,
           fall through to bignum handling. */
    }

    if (value->typePtr == tkapp->IntType ||
        value->typePtr == tkapp->WideIntType ||
        value->typePtr == tkapp->BignumType) {
        return fromBignumObj(tkapp, value);
    }

    if (value->typePtr == tkapp->ListType) {
        Tcl_Size i, size;
        int status;
        TyObject *elem;
        Tcl_Obj *tcl_elem;

        status = Tcl_ListObjLength(interp, value, &size);
        if (status == TCL_ERROR)
            return Tkinter_Error(tkapp);
        result = TyTuple_New(size);
        if (!result)
            return NULL;
        for (i = 0; i < size; i++) {
            status = Tcl_ListObjIndex(interp, value, i, &tcl_elem);
            if (status == TCL_ERROR) {
                Ty_DECREF(result);
                return Tkinter_Error(tkapp);
            }
            elem = FromObj(tkapp, tcl_elem);
            if (!elem) {
                Ty_DECREF(result);
                return NULL;
            }
            TyTuple_SET_ITEM(result, i, elem);
        }
        return result;
    }

    if (value->typePtr == tkapp->StringType ||
        value->typePtr == tkapp->UTF32StringType ||
        value->typePtr == tkapp->PixelType)
    {
        return unicodeFromTclObj(tkapp, value);
    }

    if (tkapp->BignumType == NULL &&
        strcmp(value->typePtr->name, "bignum") == 0) {
        /* bignum type is not registered in Tcl */
        tkapp->BignumType = value->typePtr;
        return fromBignumObj(tkapp, value);
    }

    return newPyTclObject(value);
}

/* This mutex synchronizes inter-thread command calls. */
TCL_DECLARE_MUTEX(call_mutex)

typedef struct Tkapp_CallEvent {
    Tcl_Event ev;            /* Must be first */
    TkappObject *self;
    TyObject *args;
    int flags;
    TyObject **res;
    TyObject **exc;
    Tcl_Condition *done;
} Tkapp_CallEvent;

static void
Tkapp_CallDeallocArgs(Tcl_Obj** objv, Tcl_Obj** objStore, Tcl_Size objc)
{
    Tcl_Size i;
    for (i = 0; i < objc; i++)
        Tcl_DecrRefCount(objv[i]);
    if (objv != objStore)
        TyMem_Free(objv);
}

/* Convert Python objects to Tcl objects. This must happen in the
   interpreter thread, which may or may not be the calling thread. */

static Tcl_Obj**
Tkapp_CallArgs(TyObject *args, Tcl_Obj** objStore, Tcl_Size *pobjc)
{
    Tcl_Obj **objv = objStore;
    Ty_ssize_t objc = 0, i;
    if (args == NULL)
        /* do nothing */;

    else if (!(TyTuple_Check(args) || TyList_Check(args))) {
        objv[0] = AsObj(args);
        if (objv[0] == NULL)
            goto finally;
        objc = 1;
        Tcl_IncrRefCount(objv[0]);
    }
    else {
        objc = PySequence_Fast_GET_SIZE(args);

        if (objc > ARGSZ) {
            if (!CHECK_SIZE(objc, sizeof(Tcl_Obj *))) {
                TyErr_SetString(TyExc_OverflowError,
                                TyTuple_Check(args) ? "tuple is too long" :
                                                      "list is too long");
                return NULL;
            }
            objv = (Tcl_Obj **)TyMem_Malloc(((size_t)objc) * sizeof(Tcl_Obj *));
            if (objv == NULL) {
                TyErr_NoMemory();
                objc = 0;
                goto finally;
            }
        }

        for (i = 0; i < objc; i++) {
            TyObject *v = PySequence_Fast_GET_ITEM(args, i);
            if (v == Ty_None) {
                objc = i;
                break;
            }
            objv[i] = AsObj(v);
            if (!objv[i]) {
                /* Reset objc, so it attempts to clear
                   objects only up to i. */
                objc = i;
                goto finally;
            }
            Tcl_IncrRefCount(objv[i]);
        }
    }
    *pobjc = (Tcl_Size)objc;
    return objv;
finally:
    Tkapp_CallDeallocArgs(objv, objStore, (Tcl_Size)objc);
    return NULL;
}

/* Convert the results of a command call into a Python string. */

static TyObject *
Tkapp_UnicodeResult(TkappObject *self)
{
    return unicodeFromTclObj(self, Tcl_GetObjResult(self->interp));
}


/* Convert the results of a command call into a Python objects. */

static TyObject *
Tkapp_ObjectResult(TkappObject *self)
{
    TyObject *res = NULL;
    Tcl_Obj *value = Tcl_GetObjResult(self->interp);
    if (self->wantobjects) {
        /* Not sure whether the IncrRef is necessary, but something
           may overwrite the interpreter result while we are
           converting it. */
        Tcl_IncrRefCount(value);
        res = FromObj(self, value);
        Tcl_DecrRefCount(value);
    } else {
        res = unicodeFromTclObj(self, value);
    }
    return res;
}

static int
Tkapp_Trace(TkappObject *self, TyObject *args)
{
    if (args == NULL) {
        return 0;
    }
    if (self->trace) {
        TyObject *res = PyObject_CallObject(self->trace, args);
        if (res == NULL) {
            Ty_DECREF(args);
            return 0;
        }
        Ty_DECREF(res);
    }
    Ty_DECREF(args);
    return 1;
}

#define TRACE(_self, ARGS) do {                 \
        if ((_self)->trace && !Tkapp_Trace((_self), Ty_BuildValue ARGS)) { \
            return NULL;                        \
        }                                       \
    } while (0)

/* Tkapp_CallProc is the event procedure that is executed in the context of
   the Tcl interpreter thread. Initially, it holds the Tcl lock, and doesn't
   hold the Python lock. */

static int
Tkapp_CallProc(Tcl_Event *evPtr, int flags)
{
    Tkapp_CallEvent *e = (Tkapp_CallEvent *)evPtr;
    Tcl_Obj *objStore[ARGSZ];
    Tcl_Obj **objv;
    Tcl_Size objc;
    int i;
    ENTER_PYTHON
    if (e->self->trace && !Tkapp_Trace(e->self, TyTuple_Pack(1, e->args))) {
        objv = NULL;
    }
    else {
        objv = Tkapp_CallArgs(e->args, objStore, &objc);
    }
    if (!objv) {
        *(e->exc) = TyErr_GetRaisedException();
        *(e->res) = NULL;
    }
    LEAVE_PYTHON
    if (!objv)
        goto done;
    i = Tcl_EvalObjv(e->self->interp, objc, objv, e->flags);
    ENTER_PYTHON
    if (i == TCL_ERROR) {
        *(e->res) = Tkinter_Error(e->self);
    }
    else {
        *(e->res) = Tkapp_ObjectResult(e->self);
    }
    if (*(e->res) == NULL) {
        *(e->exc) = TyErr_GetRaisedException();
    }
    LEAVE_PYTHON

    Tkapp_CallDeallocArgs(objv, objStore, objc);
done:
    /* Wake up calling thread. */
    Tcl_MutexLock(&call_mutex);
    Tcl_ConditionNotify(e->done);
    Tcl_MutexUnlock(&call_mutex);
    return 1;
}


/* This is the main entry point for calling a Tcl command.
   It supports three cases, with regard to threading:
   1. Tcl is not threaded: Must have the Tcl lock, then can invoke command in
      the context of the calling thread.
   2. Tcl is threaded, caller of the command is in the interpreter thread:
      Execute the command in the calling thread. Since the Tcl lock will
      not be used, we can merge that with case 1.
   3. Tcl is threaded, caller is in a different thread: Must queue an event to
      the interpreter thread. Allocation of Tcl objects needs to occur in the
      interpreter thread, so we ship the TyObject* args to the target thread,
      and perform processing there. */

static TyObject *
Tkapp_Call(TyObject *selfptr, TyObject *args)
{
    Tcl_Obj *objStore[ARGSZ];
    Tcl_Obj **objv = NULL;
    Tcl_Size objc;
    TyObject *res = NULL;
    TkappObject *self = TkappObject_CAST(selfptr);
    int flags = TCL_EVAL_DIRECT | TCL_EVAL_GLOBAL;

    /* If args is a single tuple, replace with contents of tuple */
    if (TyTuple_GET_SIZE(args) == 1) {
        TyObject *item = TyTuple_GET_ITEM(args, 0);
        if (TyTuple_Check(item))
            args = item;
    }
    if (self->threaded && self->thread_id != Tcl_GetCurrentThread()) {
        /* We cannot call the command directly. Instead, we must
           marshal the parameters to the interpreter thread. */
        Tkapp_CallEvent *ev;
        Tcl_Condition cond = NULL;
        TyObject *exc = NULL;  // init to make static analyzers happy
        if (!WaitForMainloop(self))
            return NULL;
        ev = (Tkapp_CallEvent*)attemptckalloc(sizeof(Tkapp_CallEvent));
        if (ev == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
        ev->ev.proc = Tkapp_CallProc;
        ev->self = self;
        ev->args = args;
        ev->res = &res;
        ev->exc = &exc;
        ev->done = &cond;

        Tkapp_ThreadSend(self, (Tcl_Event*)ev, &cond, &call_mutex);

        if (res == NULL) {
            if (exc) {
                TyErr_SetRaisedException(exc);
            }
            else {
                TyErr_SetObject(Tkinter_TclError, exc);
            }
        }
        Tcl_ConditionFinalize(&cond);
    }
    else
    {
        TRACE(self, ("(O)", args));

        int i;
        objv = Tkapp_CallArgs(args, objStore, &objc);
        if (!objv)
            return NULL;

        ENTER_TCL

        i = Tcl_EvalObjv(self->interp, objc, objv, flags);

        ENTER_OVERLAP

        if (i == TCL_ERROR)
            Tkinter_Error(self);
        else
            res = Tkapp_ObjectResult(self);

        LEAVE_OVERLAP_TCL

        Tkapp_CallDeallocArgs(objv, objStore, objc);
    }
    return res;
}


/*[clinic input]
_tkinter.tkapp.eval

    script: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_eval_impl(TkappObject *self, const char *script)
/*[clinic end generated code: output=24b79831f700dea0 input=481484123a455f22]*/
{
    TyObject *res = NULL;
    int err;

    CHECK_STRING_LENGTH(script);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "eval", script));

    ENTER_TCL
    err = Tcl_Eval(Tkapp_Interp(self), script);
    ENTER_OVERLAP
    if (err == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = Tkapp_UnicodeResult(self);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.evalfile

    fileName: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_evalfile_impl(TkappObject *self, const char *fileName)
/*[clinic end generated code: output=63be88dcee4f11d3 input=873ab707e5e947e1]*/
{
    TyObject *res = NULL;
    int err;

    CHECK_STRING_LENGTH(fileName);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "source", fileName));

    ENTER_TCL
    err = Tcl_EvalFile(Tkapp_Interp(self), fileName);
    ENTER_OVERLAP
    if (err == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = Tkapp_UnicodeResult(self);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.record

    script: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_record_impl(TkappObject *self, const char *script)
/*[clinic end generated code: output=0ffe08a0061730df input=c0b0db5a21412cac]*/
{
    TyObject *res = NULL;
    int err;

    CHECK_STRING_LENGTH(script);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ssss))", "history", "add", script, "exec"));

    ENTER_TCL
    err = Tcl_RecordAndEval(Tkapp_Interp(self), script, TCL_NO_EVAL);
    ENTER_OVERLAP
    if (err == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = Tkapp_UnicodeResult(self);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.adderrorinfo

    msg: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_adderrorinfo_impl(TkappObject *self, const char *msg)
/*[clinic end generated code: output=52162eaca2ee53cb input=f4b37aec7c7e8c77]*/
{
    CHECK_STRING_LENGTH(msg);
    CHECK_TCL_APPARTMENT(self);

    ENTER_TCL
    Tcl_AddErrorInfo(Tkapp_Interp(self), msg);
    LEAVE_TCL

    Py_RETURN_NONE;
}



/** Tcl Variable **/

typedef TyObject* (*EventFunc)(TkappObject *, TyObject *, int);

TCL_DECLARE_MUTEX(var_mutex)

typedef struct VarEvent {
    Tcl_Event ev; /* must be first */
    TkappObject *self;
    TyObject *args;
    int flags;
    EventFunc func;
    TyObject **res;
    TyObject **exc;
    Tcl_Condition *cond;
} VarEvent;

/*[python]

class varname_converter(CConverter):
    type = 'const char *'
    converter = 'varname_converter'

[python]*/
/*[python checksum: da39a3ee5e6b4b0d3255bfef95601890afd80709]*/

static int
varname_converter(TyObject *in, void *_out)
{
    const char *s;
    const char **out = (const char**)_out;
    if (TyBytes_Check(in)) {
        if (TyBytes_GET_SIZE(in) > INT_MAX) {
            TyErr_SetString(TyExc_OverflowError, "bytes object is too long");
            return 0;
        }
        s = TyBytes_AS_STRING(in);
        if (strlen(s) != (size_t)TyBytes_GET_SIZE(in)) {
            TyErr_SetString(TyExc_ValueError, "embedded null byte");
            return 0;
        }
        *out = s;
        return 1;
    }
    if (TyUnicode_Check(in)) {
        Ty_ssize_t size;
        s = TyUnicode_AsUTF8AndSize(in, &size);
        if (s == NULL) {
            return 0;
        }
        if (size > INT_MAX) {
            TyErr_SetString(TyExc_OverflowError, "string is too long");
            return 0;
        }
        if (strlen(s) != (size_t)size) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            return 0;
        }
        *out = s;
        return 1;
    }
    if (PyTclObject_Check(in)) {
        *out = Tcl_GetString(((PyTclObject *)in)->value);  // safe fast cast
        return 1;
    }
    TyErr_Format(TyExc_TypeError,
                 "must be str, bytes or Tcl_Obj, not %.50s",
                 Ty_TYPE(in)->tp_name);
    return 0;
}


static void
var_perform(VarEvent *ev)
{
    *(ev->res) = ev->func(ev->self, ev->args, ev->flags);
    if (!*(ev->res)) {
        *(ev->exc) = TyErr_GetRaisedException();;
    }

}

static int
var_proc(Tcl_Event *evPtr, int flags)
{
    VarEvent *ev = (VarEvent *)evPtr;
    ENTER_PYTHON
    var_perform(ev);
    Tcl_MutexLock(&var_mutex);
    Tcl_ConditionNotify(ev->cond);
    Tcl_MutexUnlock(&var_mutex);
    LEAVE_PYTHON
    return 1;
}


static TyObject*
var_invoke(EventFunc func, TyObject *selfptr, TyObject *args, int flags)
{
    TkappObject *self = TkappObject_CAST(selfptr);
    if (self->threaded && self->thread_id != Tcl_GetCurrentThread()) {
        VarEvent *ev;
        // init 'res' and 'exc' to make static analyzers happy
        TyObject *res = NULL, *exc = NULL;
        Tcl_Condition cond = NULL;

        /* The current thread is not the interpreter thread.  Marshal
           the call to the interpreter thread, then wait for
           completion. */
        if (!WaitForMainloop(self))
            return NULL;

        ev = (VarEvent*)attemptckalloc(sizeof(VarEvent));
        if (ev == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
        ev->self = self;
        ev->args = args;
        ev->flags = flags;
        ev->func = func;
        ev->res = &res;
        ev->exc = &exc;
        ev->cond = &cond;
        ev->ev.proc = var_proc;
        Tkapp_ThreadSend(self, (Tcl_Event*)ev, &cond, &var_mutex);
        Tcl_ConditionFinalize(&cond);
        if (!res) {
            TyErr_SetObject((TyObject*)Ty_TYPE(exc), exc);
            Ty_DECREF(exc);
            return NULL;
        }
        return res;
    }
    /* Tcl is not threaded, or this is the interpreter thread. */
    return func(self, args, flags);
}

static TyObject *
SetVar(TkappObject *self, TyObject *args, int flags)
{
    const char *name1, *name2;
    TyObject *newValue;
    TyObject *res = NULL;
    Tcl_Obj *newval, *ok;

    switch (TyTuple_GET_SIZE(args)) {
    case 2:
        if (!TyArg_ParseTuple(args, "O&O:setvar",
                              varname_converter, &name1, &newValue))
            return NULL;
        /* XXX Acquire tcl lock??? */
        newval = AsObj(newValue);
        if (newval == NULL)
            return NULL;

        if (flags & TCL_GLOBAL_ONLY) {
            TRACE(self, ("((ssssO))", "uplevel", "#0", "set",
                         name1, newValue));
        }
        else {
            TRACE(self, ("((ssO))", "set", name1, newValue));
        }

        ENTER_TCL
        ok = Tcl_SetVar2Ex(Tkapp_Interp(self), name1, NULL,
                           newval, flags);
        ENTER_OVERLAP
        if (!ok)
            Tkinter_Error(self);
        else {
            res = Ty_NewRef(Ty_None);
        }
        LEAVE_OVERLAP_TCL
        break;
    case 3:
        if (!TyArg_ParseTuple(args, "ssO:setvar",
                              &name1, &name2, &newValue))
            return NULL;
        CHECK_STRING_LENGTH(name1);
        CHECK_STRING_LENGTH(name2);

        /* XXX must hold tcl lock already??? */
        newval = AsObj(newValue);
        if (self->trace) {
            if (flags & TCL_GLOBAL_ONLY) {
                TRACE(self, ("((sssNO))", "uplevel", "#0", "set",
                             TyUnicode_FromFormat("%s(%s)", name1, name2),
                             newValue));
            }
            else {
                TRACE(self, ("((sNO))", "set",
                             TyUnicode_FromFormat("%s(%s)", name1, name2),
                             newValue));
            }
        }

        ENTER_TCL
        ok = Tcl_SetVar2Ex(Tkapp_Interp(self), name1, name2, newval, flags);
        ENTER_OVERLAP
        if (!ok)
            Tkinter_Error(self);
        else {
            res = Ty_NewRef(Ty_None);
        }
        LEAVE_OVERLAP_TCL
        break;
    default:
        TyErr_SetString(TyExc_TypeError, "setvar requires 2 to 3 arguments");
        return NULL;
    }
    return res;
}

static TyObject *
Tkapp_SetVar(TyObject *self, TyObject *args)
{
    return var_invoke(SetVar, self, args, TCL_LEAVE_ERR_MSG);
}

static TyObject *
Tkapp_GlobalSetVar(TyObject *self, TyObject *args)
{
    return var_invoke(SetVar, self, args, TCL_LEAVE_ERR_MSG | TCL_GLOBAL_ONLY);
}



static TyObject *
GetVar(TkappObject *self, TyObject *args, int flags)
{
    const char *name1, *name2=NULL;
    TyObject *res = NULL;
    Tcl_Obj *tres;

    if (!TyArg_ParseTuple(args, "O&|s:getvar",
                          varname_converter, &name1, &name2))
        return NULL;

    CHECK_STRING_LENGTH(name2);
    ENTER_TCL
    tres = Tcl_GetVar2Ex(Tkapp_Interp(self), name1, name2, flags);
    ENTER_OVERLAP
    if (tres == NULL) {
        Tkinter_Error(self);
    } else {
        if (self->wantobjects) {
            res = FromObj(self, tres);
        }
        else {
            res = unicodeFromTclObj(self, tres);
        }
    }
    LEAVE_OVERLAP_TCL
    return res;
}

static TyObject *
Tkapp_GetVar(TyObject *self, TyObject *args)
{
    return var_invoke(GetVar, self, args, TCL_LEAVE_ERR_MSG);
}

static TyObject *
Tkapp_GlobalGetVar(TyObject *self, TyObject *args)
{
    return var_invoke(GetVar, self, args, TCL_LEAVE_ERR_MSG | TCL_GLOBAL_ONLY);
}



static TyObject *
UnsetVar(TkappObject *self, TyObject *args, int flags)
{
    char *name1, *name2=NULL;
    int code;
    TyObject *res = NULL;

    if (!TyArg_ParseTuple(args, "s|s:unsetvar", &name1, &name2)) {
        return NULL;
    }

    CHECK_STRING_LENGTH(name1);
    CHECK_STRING_LENGTH(name2);

    if (self->trace) {
        if (flags & TCL_GLOBAL_ONLY) {
            if (name2) {
                TRACE(self, ("((sssN))", "uplevel", "#0", "unset",
                             TyUnicode_FromFormat("%s(%s)", name1, name2)));
            }
            else {
                TRACE(self, ("((ssss))", "uplevel", "#0", "unset", name1));
            }
        }
        else {
            if (name2) {
                TRACE(self, ("((sN))", "unset",
                             TyUnicode_FromFormat("%s(%s)", name1, name2)));
            }
            else {
                TRACE(self, ("((ss))", "unset", name1));
            }
        }
    }

    ENTER_TCL
    code = Tcl_UnsetVar2(Tkapp_Interp(self), name1, name2, flags);
    ENTER_OVERLAP
    if (code == TCL_ERROR)
        res = Tkinter_Error(self);
    else {
        res = Ty_NewRef(Ty_None);
    }
    LEAVE_OVERLAP_TCL
    return res;
}

static TyObject *
Tkapp_UnsetVar(TyObject *self, TyObject *args)
{
    return var_invoke(UnsetVar, self, args, TCL_LEAVE_ERR_MSG);
}

static TyObject *
Tkapp_GlobalUnsetVar(TyObject *self, TyObject *args)
{
    return var_invoke(UnsetVar, self, args,
                      TCL_LEAVE_ERR_MSG | TCL_GLOBAL_ONLY);
}



/** Tcl to Python **/

/*[clinic input]
_tkinter.tkapp.getint

    arg: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_getint_impl(TkappObject *self, TyObject *arg)
/*[clinic end generated code: output=5f75d31b260d4086 input=034026997c5b91f8]*/
{
    char *s;
    Tcl_Obj *value;
    TyObject *result;

    if (TyLong_Check(arg)) {
        return Ty_NewRef(arg);
    }

    if (PyTclObject_Check(arg)) {
        value = ((PyTclObject*)arg)->value;
        Tcl_IncrRefCount(value);
    }
    else {
        if (!TyArg_Parse(arg, "s:getint", &s))
            return NULL;
        CHECK_STRING_LENGTH(s);
        value = Tcl_NewStringObj(s, -1);
        if (value == NULL)
            return Tkinter_Error(self);
    }
    /* Don't use Tcl_GetInt() because it returns ambiguous result for value
       in ranges -2**32..-2**31-1 and 2**31..2**32-1 (on 32-bit platform).

       Prefer bignum because Tcl_GetWideIntFromObj returns ambiguous result for
       value in ranges -2**64..-2**63-1 and 2**63..2**64-1 (on 32-bit platform).
     */
    result = fromBignumObj(self, value);
    Tcl_DecrRefCount(value);
    if (result != NULL || TyErr_Occurred())
        return result;
    return Tkinter_Error(self);
}

/*[clinic input]
_tkinter.tkapp.getdouble

    arg: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_getdouble_impl(TkappObject *self, TyObject *arg)
/*[clinic end generated code: output=432433f2f52b09b6 input=22015729ce9ef7f8]*/
{
    char *s;
    double v;

    if (TyFloat_Check(arg)) {
        return Ty_NewRef(arg);
    }

    if (PyNumber_Check(arg)) {
        return PyNumber_Float(arg);
    }

    if (PyTclObject_Check(arg)) {
        if (Tcl_GetDoubleFromObj(Tkapp_Interp(self),
                                 ((PyTclObject*)arg)->value,
                                 &v) == TCL_ERROR)
            return Tkinter_Error(self);
        return TyFloat_FromDouble(v);
    }

    if (!TyArg_Parse(arg, "s:getdouble", &s))
        return NULL;
    CHECK_STRING_LENGTH(s);
    if (Tcl_GetDouble(Tkapp_Interp(self), s, &v) == TCL_ERROR)
        return Tkinter_Error(self);
    return TyFloat_FromDouble(v);
}

/*[clinic input]
_tkinter.tkapp.getboolean

    arg: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_getboolean_impl(TkappObject *self, TyObject *arg)
/*[clinic end generated code: output=3b05597cf2bfbd9f input=7f11248ef8f8776e]*/
{
    char *s;
    int v;

    if (TyLong_Check(arg)) { /* int or bool */
        return TyBool_FromLong(!_TyLong_IsZero((PyLongObject *)arg));
    }

    if (PyTclObject_Check(arg)) {
        if (Tcl_GetBooleanFromObj(Tkapp_Interp(self),
                                  ((PyTclObject*)arg)->value,
                                  &v) == TCL_ERROR)
            return Tkinter_Error(self);
        return TyBool_FromLong(v);
    }

    if (!TyArg_Parse(arg, "s:getboolean", &s))
        return NULL;
    CHECK_STRING_LENGTH(s);
    if (Tcl_GetBoolean(Tkapp_Interp(self), s, &v) == TCL_ERROR)
        return Tkinter_Error(self);
    return TyBool_FromLong(v);
}

/*[clinic input]
_tkinter.tkapp.exprstring

    s: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_exprstring_impl(TkappObject *self, const char *s)
/*[clinic end generated code: output=beda323d3ed0abb1 input=fa78f751afb2f21b]*/
{
    TyObject *res = NULL;
    int retval;

    CHECK_STRING_LENGTH(s);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "expr", s));

    ENTER_TCL
    retval = Tcl_ExprString(Tkapp_Interp(self), s);
    ENTER_OVERLAP
    if (retval == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = Tkapp_UnicodeResult(self);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.exprlong

    s: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_exprlong_impl(TkappObject *self, const char *s)
/*[clinic end generated code: output=5d6a46b63c6ebcf9 input=11bd7eee0c57b4dc]*/
{
    TyObject *res = NULL;
    int retval;
    long v;

    CHECK_STRING_LENGTH(s);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "expr", s));

    ENTER_TCL
    retval = Tcl_ExprLong(Tkapp_Interp(self), s, &v);
    ENTER_OVERLAP
    if (retval == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = TyLong_FromLong(v);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.exprdouble

    s: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_exprdouble_impl(TkappObject *self, const char *s)
/*[clinic end generated code: output=ff78df1081ea4158 input=ff02bc11798832d5]*/
{
    TyObject *res = NULL;
    double v;
    int retval;

    CHECK_STRING_LENGTH(s);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "expr", s));

    ENTER_TCL
    retval = Tcl_ExprDouble(Tkapp_Interp(self), s, &v);
    ENTER_OVERLAP
    if (retval == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = TyFloat_FromDouble(v);
    LEAVE_OVERLAP_TCL
    return res;
}

/*[clinic input]
_tkinter.tkapp.exprboolean

    s: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_exprboolean_impl(TkappObject *self, const char *s)
/*[clinic end generated code: output=8b28038c22887311 input=c8c66022bdb8d5d3]*/
{
    TyObject *res = NULL;
    int retval;
    int v;

    CHECK_STRING_LENGTH(s);
    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((ss))", "expr", s));

    ENTER_TCL
    retval = Tcl_ExprBoolean(Tkapp_Interp(self), s, &v);
    ENTER_OVERLAP
    if (retval == TCL_ERROR)
        res = Tkinter_Error(self);
    else
        res = TyLong_FromLong(v);
    LEAVE_OVERLAP_TCL
    return res;
}



/*[clinic input]
_tkinter.tkapp.splitlist

    arg: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_splitlist_impl(TkappObject *self, TyObject *arg)
/*[clinic end generated code: output=e517f462159c3000 input=2b2e13351e3c0b53]*/
{
    char *list;
    Tcl_Size argc, i;
    const char **argv;
    TyObject *v;

    if (PyTclObject_Check(arg)) {
        Tcl_Size objc;
        Tcl_Obj **objv;
        if (Tcl_ListObjGetElements(Tkapp_Interp(self),
                                   ((PyTclObject*)arg)->value,
                                   &objc, &objv) == TCL_ERROR) {
            return Tkinter_Error(self);
        }
        if (!(v = TyTuple_New(objc)))
            return NULL;
        for (i = 0; i < objc; i++) {
            TyObject *s = FromObj(self, objv[i]);
            if (!s) {
                Ty_DECREF(v);
                return NULL;
            }
            TyTuple_SET_ITEM(v, i, s);
        }
        return v;
    }
    if (TyTuple_Check(arg)) {
        return Ty_NewRef(arg);
    }
    if (TyList_Check(arg)) {
        return PySequence_Tuple(arg);
    }

    if (!TyArg_Parse(arg, "et:splitlist", "utf-8", &list))
        return NULL;

    if (strlen(list) >= INT_MAX) {
        TyErr_SetString(TyExc_OverflowError, "string is too long");
        TyMem_Free(list);
        return NULL;
    }
    if (Tcl_SplitList(Tkapp_Interp(self), list,
                      &argc, &argv) == TCL_ERROR)  {
        TyMem_Free(list);
        return Tkinter_Error(self);
    }

    if (!(v = TyTuple_New(argc)))
        goto finally;

    for (i = 0; i < argc; i++) {
        TyObject *s = unicodeFromTclString(argv[i]);
        if (!s) {
            Ty_SETREF(v, NULL);
            goto finally;
        }
        TyTuple_SET_ITEM(v, i, s);
    }

  finally:
    ckfree(FREECAST argv);
    TyMem_Free(list);
    return v;
}


/** Tcl Command **/

/* Client data struct */
typedef struct {
    TkappObject *self;
    TyObject *func;
} PythonCmd_ClientData;

static int
PythonCmd_Error(Tcl_Interp *interp)
{
    errorInCmd = 1;
    excInCmd = TyErr_GetRaisedException();
    LEAVE_PYTHON
    return TCL_ERROR;
}

/* This is the Tcl command that acts as a wrapper for Python
 * function or method.
 */
static int
PythonCmd(ClientData clientData, Tcl_Interp *interp,
          int objc, Tcl_Obj *const objv[])
{
    PythonCmd_ClientData *data = (PythonCmd_ClientData *)clientData;
    TyObject *args, *res;
    int i;
    Tcl_Obj *obj_res;
    int objargs = data->self->wantobjects >= 2;

    ENTER_PYTHON

    /* Create argument tuple (objv1, ..., objvN) */
    if (!(args = TyTuple_New(objc - 1)))
        return PythonCmd_Error(interp);

    for (i = 0; i < (objc - 1); i++) {
        TyObject *s = objargs ? FromObj(data->self, objv[i + 1])
                              : unicodeFromTclObj(data->self, objv[i + 1]);
        if (!s) {
            Ty_DECREF(args);
            return PythonCmd_Error(interp);
        }
        TyTuple_SET_ITEM(args, i, s);
    }

    res = PyObject_Call(data->func, args, NULL);
    Ty_DECREF(args);

    if (res == NULL)
        return PythonCmd_Error(interp);

    obj_res = AsObj(res);
    if (obj_res == NULL) {
        Ty_DECREF(res);
        return PythonCmd_Error(interp);
    }
    Tcl_SetObjResult(interp, obj_res);
    Ty_DECREF(res);

    LEAVE_PYTHON

    return TCL_OK;
}


static void
PythonCmdDelete(ClientData clientData)
{
    PythonCmd_ClientData *data = (PythonCmd_ClientData *)clientData;

    ENTER_PYTHON
    Ty_XDECREF(data->self);
    Ty_XDECREF(data->func);
    TyMem_Free(data);
    LEAVE_PYTHON
}




TCL_DECLARE_MUTEX(command_mutex)

typedef struct CommandEvent{
    Tcl_Event ev;
    Tcl_Interp* interp;
    const char *name;
    int create;
    int *status;
    ClientData *data;
    Tcl_Condition *done;
} CommandEvent;

static int
Tkapp_CommandProc(Tcl_Event *evPtr, int flags)
{
    CommandEvent *ev = (CommandEvent *)evPtr;
    if (ev->create)
        *ev->status = Tcl_CreateObjCommand(
            ev->interp, ev->name, PythonCmd,
            ev->data, PythonCmdDelete) == NULL;
    else
        *ev->status = Tcl_DeleteCommand(ev->interp, ev->name);
    Tcl_MutexLock(&command_mutex);
    Tcl_ConditionNotify(ev->done);
    Tcl_MutexUnlock(&command_mutex);
    return 1;
}

/*[clinic input]
_tkinter.tkapp.createcommand

    name: str
    func: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_createcommand_impl(TkappObject *self, const char *name,
                                  TyObject *func)
/*[clinic end generated code: output=2a1c79a4ee2af410 input=255785cb70edc6a0]*/
{
    PythonCmd_ClientData *data;
    int err;

    CHECK_STRING_LENGTH(name);
    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError, "command not callable");
        return NULL;
    }

    if (self->threaded && self->thread_id != Tcl_GetCurrentThread() &&
        !WaitForMainloop(self))
        return NULL;

    TRACE(self, ("((ss()O))", "proc", name, func));

    data = TyMem_NEW(PythonCmd_ClientData, 1);
    if (!data)
        return TyErr_NoMemory();
    Ty_INCREF(self);
    data->self = self;
    data->func = Ty_NewRef(func);
    if (self->threaded && self->thread_id != Tcl_GetCurrentThread()) {
        err = 0;  // init to make static analyzers happy

        Tcl_Condition cond = NULL;
        CommandEvent *ev = (CommandEvent*)attemptckalloc(sizeof(CommandEvent));
        if (ev == NULL) {
            TyErr_NoMemory();
            TyMem_Free(data);
            return NULL;
        }
        ev->ev.proc = Tkapp_CommandProc;
        ev->interp = self->interp;
        ev->create = 1;
        ev->name = name;
        ev->data = (ClientData)data;
        ev->status = &err;
        ev->done = &cond;
        Tkapp_ThreadSend(self, (Tcl_Event*)ev, &cond, &command_mutex);
        Tcl_ConditionFinalize(&cond);
    }
    else
    {
        ENTER_TCL
        err = Tcl_CreateObjCommand(
            Tkapp_Interp(self), name, PythonCmd,
            (ClientData)data, PythonCmdDelete) == NULL;
        LEAVE_TCL
    }
    if (err) {
        TyErr_SetString(Tkinter_TclError, "can't create Tcl command");
        TyMem_Free(data);
        return NULL;
    }

    Py_RETURN_NONE;
}



/*[clinic input]
_tkinter.tkapp.deletecommand

    name: str
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_deletecommand_impl(TkappObject *self, const char *name)
/*[clinic end generated code: output=a67e8cb5845e0d2d input=53e9952eae1f85f5]*/
{
    int err;

    CHECK_STRING_LENGTH(name);

    TRACE(self, ("((sss))", "rename", name, ""));

    if (self->threaded && self->thread_id != Tcl_GetCurrentThread()) {
        err = 0;  // init to make static analyzers happy

        Tcl_Condition cond = NULL;
        CommandEvent *ev;
        ev = (CommandEvent*)attemptckalloc(sizeof(CommandEvent));
        if (ev == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
        ev->ev.proc = Tkapp_CommandProc;
        ev->interp = self->interp;
        ev->create = 0;
        ev->name = name;
        ev->status = &err;
        ev->done = &cond;
        Tkapp_ThreadSend(self, (Tcl_Event*)ev, &cond,
                         &command_mutex);
        Tcl_ConditionFinalize(&cond);
    }
    else
    {
        ENTER_TCL
        err = Tcl_DeleteCommand(self->interp, name);
        LEAVE_TCL
    }
    if (err == -1) {
        TyErr_SetString(Tkinter_TclError, "can't delete Tcl command");
        return NULL;
    }
    Py_RETURN_NONE;
}



#ifdef HAVE_CREATEFILEHANDLER
/** File Handler **/

typedef struct _fhcdata {
    TyObject *func;
    TyObject *file;
    int id;
    struct _fhcdata *next;
} FileHandler_ClientData;

static FileHandler_ClientData *HeadFHCD;

static FileHandler_ClientData *
NewFHCD(TyObject *func, TyObject *file, int id)
{
    FileHandler_ClientData *p;
    p = TyMem_NEW(FileHandler_ClientData, 1);
    if (p != NULL) {
        p->func = Ty_XNewRef(func);
        p->file = Ty_XNewRef(file);
        p->id = id;
        p->next = HeadFHCD;
        HeadFHCD = p;
    }
    return p;
}

static void
DeleteFHCD(int id)
{
    FileHandler_ClientData *p, **pp;

    pp = &HeadFHCD;
    while ((p = *pp) != NULL) {
        if (p->id == id) {
            *pp = p->next;
            Ty_XDECREF(p->func);
            Ty_XDECREF(p->file);
            TyMem_Free(p);
        }
        else
            pp = &p->next;
    }
}

static void
FileHandler(ClientData clientData, int mask)
{
    FileHandler_ClientData *data = (FileHandler_ClientData *)clientData;
    TyObject *func, *file, *res;

    ENTER_PYTHON
    func = data->func;
    file = data->file;

    res = PyObject_CallFunction(func, "Oi", file, mask);
    if (res == NULL) {
        errorInCmd = 1;
        excInCmd = TyErr_GetRaisedException();
    }
    Ty_XDECREF(res);
    LEAVE_PYTHON
}

/*[clinic input]
_tkinter.tkapp.createfilehandler

    file: object
    mask: int
    func: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_createfilehandler_impl(TkappObject *self, TyObject *file,
                                      int mask, TyObject *func)
/*[clinic end generated code: output=f73ce82de801c353 input=84943a5286e47947]*/
{
    FileHandler_ClientData *data;
    int tfile;

    CHECK_TCL_APPARTMENT(self);

    tfile = PyObject_AsFileDescriptor(file);
    if (tfile < 0)
        return NULL;
    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError, "bad argument list");
        return NULL;
    }

    TRACE(self, ("((ssiiO))", "#", "createfilehandler", tfile, mask, func));

    data = NewFHCD(func, file, tfile);
    if (data == NULL)
        return NULL;

    /* Ought to check for null Tcl_File object... */
    ENTER_TCL
    Tcl_CreateFileHandler(tfile, mask, FileHandler, (ClientData) data);
    LEAVE_TCL
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.tkapp.deletefilehandler

    file: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_deletefilehandler_impl(TkappObject *self, TyObject *file)
/*[clinic end generated code: output=30b2c6ed195b0410 input=abbec19d66312e2a]*/
{
    int tfile;

    CHECK_TCL_APPARTMENT(self);

    tfile = PyObject_AsFileDescriptor(file);
    if (tfile < 0)
        return NULL;

    TRACE(self, ("((ssi))", "#", "deletefilehandler", tfile));

    DeleteFHCD(tfile);

    /* Ought to check for null Tcl_File object... */
    ENTER_TCL
    Tcl_DeleteFileHandler(tfile);
    LEAVE_TCL
    Py_RETURN_NONE;
}
#endif /* HAVE_CREATEFILEHANDLER */


/**** Tktt Object (timer token) ****/

static TyObject *Tktt_Type;
#define TkttObject_Check(op)    \
    PyObject_TypeCheck((op), (TyTypeObject *)Tktt_Type)

typedef struct {
    PyObject_HEAD
    Tcl_TimerToken token;
    TyObject *func;
} TkttObject;

#define TkttObject_CAST(op) (assert(TkttObject_Check(op)), (TkttObject *)(op))

/*[clinic input]
_tkinter.tktimertoken.deletetimerhandler

[clinic start generated code]*/

static TyObject *
_tkinter_tktimertoken_deletetimerhandler_impl(TkttObject *self)
/*[clinic end generated code: output=bd7fe17f328cfa55 input=40bd070ff85f5cf3]*/
{
    TkttObject *v = self;
    TyObject *func = v->func;

    if (v->token != NULL) {
        /* TRACE(...) */
        Tcl_DeleteTimerHandler(v->token);
        v->token = NULL;
    }
    if (func != NULL) {
        v->func = NULL;
        Ty_DECREF(func);
        Ty_DECREF(v); /* See Tktt_New() */
    }
    Py_RETURN_NONE;
}

static TkttObject *
Tktt_New(TyObject *func)
{
    TkttObject *v;

    v = PyObject_New(TkttObject, (TyTypeObject *) Tktt_Type);
    if (v == NULL)
        return NULL;

    v->token = NULL;
    v->func = Ty_NewRef(func);

    /* Extra reference, deleted when called or when handler is deleted */
    return (TkttObject*)Ty_NewRef(v);
}

static void
Tktt_Dealloc(TyObject *self)
{
    TkttObject *v = TkttObject_CAST(self);
    TyObject *func = v->func;
    TyObject *tp = (TyObject *) Ty_TYPE(self);

    Ty_XDECREF(func);

    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyObject *
Tktt_Repr(TyObject *self)
{
    TkttObject *v = TkttObject_CAST(self);
    return TyUnicode_FromFormat("<tktimertoken at %p%s>",
                                v,
                                v->func == NULL ? ", handler deleted" : "");
}

/** Timer Handler **/

static void
TimerHandler(ClientData clientData)
{
    TkttObject *v = TkttObject_CAST(clientData);
    TyObject *func = v->func;
    TyObject *res;

    if (func == NULL)
        return;

    v->func = NULL;

    ENTER_PYTHON

    res = PyObject_CallNoArgs(func);
    Ty_DECREF(func);
    Ty_DECREF(v); /* See Tktt_New() */

    if (res == NULL) {
        errorInCmd = 1;
        excInCmd = TyErr_GetRaisedException();
    }
    else
        Ty_DECREF(res);

    LEAVE_PYTHON
}

/*[clinic input]
_tkinter.tkapp.createtimerhandler

    milliseconds: int
    func: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_createtimerhandler_impl(TkappObject *self, int milliseconds,
                                       TyObject *func)
/*[clinic end generated code: output=2da5959b9d031911 input=ba6729f32f0277a5]*/
{
    TkttObject *v;

    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError, "bad argument list");
        return NULL;
    }

    CHECK_TCL_APPARTMENT(self);

    TRACE(self, ("((siO))", "after", milliseconds, func));

    v = Tktt_New(func);
    if (v) {
        v->token = Tcl_CreateTimerHandler(milliseconds, TimerHandler,
                                          (ClientData)v);
    }

    return (TyObject *) v;
}


/** Event Loop **/

/*[clinic input]
_tkinter.tkapp.mainloop

    threshold: int = 0
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_mainloop_impl(TkappObject *self, int threshold)
/*[clinic end generated code: output=0ba8eabbe57841b0 input=036bcdcf03d5eca0]*/
{
    TyThreadState *tstate = TyThreadState_Get();

    CHECK_TCL_APPARTMENT(self);
    self->dispatching = 1;

    quitMainLoop = 0;
    while (Tk_GetNumMainWindows() > threshold &&
           !quitMainLoop &&
           !errorInCmd)
    {
        int result;

        if (self->threaded) {
            /* Allow other Python threads to run. */
            ENTER_TCL
            result = Tcl_DoOneEvent(0);
            LEAVE_TCL
        }
        else {
            Ty_BEGIN_ALLOW_THREADS
            if(tcl_lock)TyThread_acquire_lock(tcl_lock, 1);
            tcl_tstate = tstate;
            result = Tcl_DoOneEvent(TCL_DONT_WAIT);
            tcl_tstate = NULL;
            if(tcl_lock)TyThread_release_lock(tcl_lock);
            if (result == 0)
                Sleep(Tkinter_busywaitinterval);
            Ty_END_ALLOW_THREADS
        }

        if (TyErr_CheckSignals() != 0) {
            self->dispatching = 0;
            return NULL;
        }
        if (result < 0)
            break;
    }
    self->dispatching = 0;
    quitMainLoop = 0;

    if (errorInCmd) {
        errorInCmd = 0;
        TyErr_SetRaisedException(excInCmd);
        excInCmd = NULL;
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.tkapp.dooneevent

    flags: int = 0
    /

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_dooneevent_impl(TkappObject *self, int flags)
/*[clinic end generated code: output=27c6b2aa464cac29 input=6542b928e364b793]*/
{
    int rv;

    ENTER_TCL
    rv = Tcl_DoOneEvent(flags);
    LEAVE_TCL
    return TyLong_FromLong(rv);
}

/*[clinic input]
_tkinter.tkapp.quit
[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_quit_impl(TkappObject *self)
/*[clinic end generated code: output=7f21eeff481f754f input=e03020dc38aff23c]*/
{
    quitMainLoop = 1;
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.tkapp.interpaddr
[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_interpaddr_impl(TkappObject *self)
/*[clinic end generated code: output=6caaae3273b3c95a input=2dd32cbddb55a111]*/
{
    return TyLong_FromVoidPtr(Tkapp_Interp(self));
}

/*[clinic input]
_tkinter.tkapp.loadtk
[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_loadtk_impl(TkappObject *self)
/*[clinic end generated code: output=e9e10a954ce46d2a input=b5e82afedd6354f0]*/
{
    Tcl_Interp *interp = Tkapp_Interp(self);
    const char * _tk_exists = NULL;
    int err;

    /* We want to guard against calling Tk_Init() multiple times */
    CHECK_TCL_APPARTMENT(self);
    ENTER_TCL
    err = Tcl_Eval(Tkapp_Interp(self), "info exists     tk_version");
    ENTER_OVERLAP
    if (err == TCL_ERROR) {
        /* This sets an exception, but we cannot return right
           away because we need to exit the overlap first. */
        Tkinter_Error(self);
    } else {
        _tk_exists = Tcl_GetStringResult(Tkapp_Interp(self));
    }
    LEAVE_OVERLAP_TCL
    if (err == TCL_ERROR) {
        return NULL;
    }
    if (_tk_exists == NULL || strcmp(_tk_exists, "1") != 0)     {
        if (Tk_Init(interp)             == TCL_ERROR) {
            Tkinter_Error(self);
            return NULL;
        }
    }
    Py_RETURN_NONE;
}

static TyObject *
Tkapp_WantObjects(TyObject *op, TyObject *args)
{
    TkappObject *self = TkappObject_CAST(op);
    int wantobjects = -1;
    if (!TyArg_ParseTuple(args, "|i:wantobjects", &wantobjects)) {
        return NULL;
    }
    if (wantobjects == -1) {
        return TyLong_FromLong(self->wantobjects);
    }
    self->wantobjects = wantobjects;
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.tkapp.settrace

    func: object
    /

Set the tracing function.
[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_settrace_impl(TkappObject *self, TyObject *func)
/*[clinic end generated code: output=8c59938bc9005607 input=31b260d46d3d018a]*/
{
    if (func == Ty_None) {
        func = NULL;
    }
    else {
        Ty_INCREF(func);
    }
    Ty_XSETREF(self->trace, func);
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.tkapp.gettrace

Get the tracing function.
[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_gettrace_impl(TkappObject *self)
/*[clinic end generated code: output=d4e2ba7d63e77bb5 input=ac2aea5be74e8c4c]*/
{
    TyObject *func = self->trace;
    if (!func) {
        func = Ty_None;
    }
    Ty_INCREF(func);
    return func;
}

/*[clinic input]
_tkinter.tkapp.willdispatch

[clinic start generated code]*/

static TyObject *
_tkinter_tkapp_willdispatch_impl(TkappObject *self)
/*[clinic end generated code: output=0e3f46d244642155 input=d88f5970843d6dab]*/
{
    self->dispatching = 1;

    Py_RETURN_NONE;
}


/**** Tkapp Type Methods ****/

static void
Tkapp_Dealloc(TyObject *op)
{
    TkappObject *self = TkappObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    /*CHECK_TCL_APPARTMENT;*/
    ENTER_TCL
    Tcl_DeleteInterp(Tkapp_Interp(self));
    LEAVE_TCL
    Ty_XDECREF(self->trace);
    PyObject_Free(self);
    Ty_DECREF(tp);
    DisableEventHook();
}



/**** Tkinter Module ****/

typedef struct {
    TyObject* tuple;
    Ty_ssize_t size; /* current size */
    Ty_ssize_t maxsize; /* allocated size */
} FlattenContext;

static int
_bump(FlattenContext* context, Ty_ssize_t size)
{
    /* expand tuple to hold (at least) size new items.
       return true if successful, false if an exception was raised */

    Ty_ssize_t maxsize = context->maxsize * 2;  /* never overflows */

    if (maxsize < context->size + size)
        maxsize = context->size + size;  /* never overflows */

    context->maxsize = maxsize;

    return _TyTuple_Resize(&context->tuple, maxsize) >= 0;
}

static int
_flatten1(FlattenContext* context, TyObject* item, int depth)
{
    /* add tuple or list to argument tuple (recursively) */

    Ty_ssize_t i, size;

    if (depth > 1000) {
        TyErr_SetString(TyExc_ValueError,
                        "nesting too deep in _flatten");
        return 0;
    } else if (TyTuple_Check(item) || TyList_Check(item)) {
        size = PySequence_Fast_GET_SIZE(item);
        /* preallocate (assume no nesting) */
        if (context->size + size > context->maxsize &&
            !_bump(context, size))
            return 0;
        /* copy items to output tuple */
        for (i = 0; i < size; i++) {
            TyObject *o = PySequence_Fast_GET_ITEM(item, i);
            if (TyList_Check(o) || TyTuple_Check(o)) {
                if (!_flatten1(context, o, depth + 1))
                    return 0;
            } else if (o != Ty_None) {
                if (context->size + 1 > context->maxsize &&
                    !_bump(context, 1))
                    return 0;
                TyTuple_SET_ITEM(context->tuple,
                                 context->size++, Ty_NewRef(o));
            }
        }
    } else {
        TyErr_SetString(TyExc_TypeError, "argument must be sequence");
        return 0;
    }
    return 1;
}

/*[clinic input]
_tkinter._flatten

    item: object
    /

[clinic start generated code]*/

static TyObject *
_tkinter__flatten(TyObject *module, TyObject *item)
/*[clinic end generated code: output=cad02a3f97f29862 input=6b9c12260aa1157f]*/
{
    FlattenContext context;

    context.maxsize = PySequence_Size(item);
    if (context.maxsize < 0)
        return NULL;
    if (context.maxsize == 0)
        return TyTuple_New(0);

    context.tuple = TyTuple_New(context.maxsize);
    if (!context.tuple)
        return NULL;

    context.size = 0;

    if (!_flatten1(&context, item, 0)) {
        Ty_XDECREF(context.tuple);
        return NULL;
    }

    if (_TyTuple_Resize(&context.tuple, context.size))
        return NULL;

    return context.tuple;
}

/*[clinic input]
_tkinter.create

    screenName: str(accept={str, NoneType}) = None
    baseName: str = ""
    className: str = "Tk"
    interactive: bool = False
    wantobjects: int = 0
    wantTk: bool = True
        if false, then Tk_Init() doesn't get called
    sync: bool = False
        if true, then pass -sync to wish
    use: str(accept={str, NoneType}) = None
        if not None, then pass -use to wish
    /

[clinic start generated code]*/

static TyObject *
_tkinter_create_impl(TyObject *module, const char *screenName,
                     const char *baseName, const char *className,
                     int interactive, int wantobjects, int wantTk, int sync,
                     const char *use)
/*[clinic end generated code: output=e3315607648e6bb4 input=7e382ba431bed537]*/
{
    /* XXX baseName is not used anymore;
     * try getting rid of it. */
    CHECK_STRING_LENGTH(screenName);
    CHECK_STRING_LENGTH(baseName);
    CHECK_STRING_LENGTH(className);
    CHECK_STRING_LENGTH(use);

    return (TyObject *) Tkapp_New(screenName, className,
                                  interactive, wantobjects, wantTk,
                                  sync, use);
}

/*[clinic input]
_tkinter.setbusywaitinterval

    new_val: int
    /

Set the busy-wait interval in milliseconds between successive calls to Tcl_DoOneEvent in a threaded Python interpreter.

It should be set to a divisor of the maximum time between frames in an animation.
[clinic start generated code]*/

static TyObject *
_tkinter_setbusywaitinterval_impl(TyObject *module, int new_val)
/*[clinic end generated code: output=42bf7757dc2d0ab6 input=deca1d6f9e6dae47]*/
{
    if (new_val < 0) {
        TyErr_SetString(TyExc_ValueError,
                        "busywaitinterval must be >= 0");
        return NULL;
    }
    Tkinter_busywaitinterval = new_val;
    Py_RETURN_NONE;
}

/*[clinic input]
_tkinter.getbusywaitinterval -> int

Return the current busy-wait interval between successive calls to Tcl_DoOneEvent in a threaded Python interpreter.
[clinic start generated code]*/

static int
_tkinter_getbusywaitinterval_impl(TyObject *module)
/*[clinic end generated code: output=23b72d552001f5c7 input=a695878d2d576a84]*/
{
    return Tkinter_busywaitinterval;
}

#include "clinic/_tkinter.c.h"

static TyMethodDef Tktt_methods[] =
{
    _TKINTER_TKTIMERTOKEN_DELETETIMERHANDLER_METHODDEF
    {NULL, NULL}
};

static TyType_Slot Tktt_Type_slots[] = {
    {Ty_tp_dealloc, Tktt_Dealloc},
    {Ty_tp_repr, Tktt_Repr},
    {Ty_tp_methods, Tktt_methods},
    {0, 0}
};

static TyType_Spec Tktt_Type_spec = {
    "_tkinter.tktimertoken",
    sizeof(TkttObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    Tktt_Type_slots,
};


/**** Tkapp Method List ****/

static TyMethodDef Tkapp_methods[] =
{
    _TKINTER_TKAPP_WILLDISPATCH_METHODDEF
    {"wantobjects",            Tkapp_WantObjects, METH_VARARGS},
    _TKINTER_TKAPP_SETTRACE_METHODDEF
    _TKINTER_TKAPP_GETTRACE_METHODDEF
    {"call",                   Tkapp_Call, METH_VARARGS},
    _TKINTER_TKAPP_EVAL_METHODDEF
    _TKINTER_TKAPP_EVALFILE_METHODDEF
    _TKINTER_TKAPP_RECORD_METHODDEF
    _TKINTER_TKAPP_ADDERRORINFO_METHODDEF
    {"setvar",                 Tkapp_SetVar, METH_VARARGS},
    {"globalsetvar",       Tkapp_GlobalSetVar, METH_VARARGS},
    {"getvar",       Tkapp_GetVar, METH_VARARGS},
    {"globalgetvar",       Tkapp_GlobalGetVar, METH_VARARGS},
    {"unsetvar",     Tkapp_UnsetVar, METH_VARARGS},
    {"globalunsetvar",     Tkapp_GlobalUnsetVar, METH_VARARGS},
    _TKINTER_TKAPP_GETINT_METHODDEF
    _TKINTER_TKAPP_GETDOUBLE_METHODDEF
    _TKINTER_TKAPP_GETBOOLEAN_METHODDEF
    _TKINTER_TKAPP_EXPRSTRING_METHODDEF
    _TKINTER_TKAPP_EXPRLONG_METHODDEF
    _TKINTER_TKAPP_EXPRDOUBLE_METHODDEF
    _TKINTER_TKAPP_EXPRBOOLEAN_METHODDEF
    _TKINTER_TKAPP_SPLITLIST_METHODDEF
    _TKINTER_TKAPP_CREATECOMMAND_METHODDEF
    _TKINTER_TKAPP_DELETECOMMAND_METHODDEF
    _TKINTER_TKAPP_CREATEFILEHANDLER_METHODDEF
    _TKINTER_TKAPP_DELETEFILEHANDLER_METHODDEF
    _TKINTER_TKAPP_CREATETIMERHANDLER_METHODDEF
    _TKINTER_TKAPP_MAINLOOP_METHODDEF
    _TKINTER_TKAPP_DOONEEVENT_METHODDEF
    _TKINTER_TKAPP_QUIT_METHODDEF
    _TKINTER_TKAPP_INTERPADDR_METHODDEF
    _TKINTER_TKAPP_LOADTK_METHODDEF
    {NULL,                     NULL}
};

static TyType_Slot Tkapp_Type_slots[] = {
    {Ty_tp_dealloc, Tkapp_Dealloc},
    {Ty_tp_methods, Tkapp_methods},
    {0, 0}
};


static TyType_Spec Tkapp_Type_spec = {
    "_tkinter.tkapp",
    sizeof(TkappObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    Tkapp_Type_slots,
};

static TyMethodDef moduleMethods[] =
{
    _TKINTER__FLATTEN_METHODDEF
    _TKINTER_CREATE_METHODDEF
    _TKINTER_SETBUSYWAITINTERVAL_METHODDEF
    _TKINTER_GETBUSYWAITINTERVAL_METHODDEF
    {NULL,                 NULL}
};

#ifdef WAIT_FOR_STDIN

static int stdin_ready = 0;

#ifndef MS_WINDOWS
static void
MyFileProc(void *clientData, int mask)
{
    stdin_ready = 1;
}
#endif

static TyThreadState *event_tstate = NULL;

static int
EventHook(void)
{
#ifndef MS_WINDOWS
    int tfile;
#endif
    TyEval_RestoreThread(event_tstate);
    stdin_ready = 0;
    errorInCmd = 0;
#ifndef MS_WINDOWS
    tfile = fileno(stdin);
    Tcl_CreateFileHandler(tfile, TCL_READABLE, MyFileProc, NULL);
#endif
    while (!errorInCmd && !stdin_ready) {
        int result;
#ifdef MS_WINDOWS
        if (_kbhit()) {
            stdin_ready = 1;
            break;
        }
#endif
        Ty_BEGIN_ALLOW_THREADS
        if(tcl_lock)TyThread_acquire_lock(tcl_lock, 1);
        tcl_tstate = event_tstate;

        result = Tcl_DoOneEvent(TCL_DONT_WAIT);

        tcl_tstate = NULL;
        if(tcl_lock)TyThread_release_lock(tcl_lock);
        if (result == 0)
            Sleep(Tkinter_busywaitinterval);
        Ty_END_ALLOW_THREADS

        if (result < 0)
            break;
    }
#ifndef MS_WINDOWS
    Tcl_DeleteFileHandler(tfile);
#endif
    if (errorInCmd) {
        errorInCmd = 0;
        TyErr_SetRaisedException(excInCmd);
        excInCmd = NULL;
        TyErr_Print();
    }
    TyEval_SaveThread();
    return 0;
}

#endif

static void
EnableEventHook(void)
{
#ifdef WAIT_FOR_STDIN
    if (TyOS_InputHook == NULL) {
        event_tstate = TyThreadState_Get();
        TyOS_InputHook = EventHook;
    }
#endif
}

static void
DisableEventHook(void)
{
#ifdef WAIT_FOR_STDIN
    if (Tk_GetNumMainWindows() == 0 && TyOS_InputHook == EventHook) {
        TyOS_InputHook = NULL;
    }
#endif
}

static int
module_clear(TyObject *Py_UNUSED(mod))
{
    Ty_CLEAR(Tkinter_TclError);
    Ty_CLEAR(Tkapp_Type);
    Ty_CLEAR(Tktt_Type);
    Ty_CLEAR(PyTclObject_Type);
    return 0;
}

static int
module_traverse(TyObject *Py_UNUSED(module), visitproc visit, void *arg)
{
    Ty_VISIT(Tkinter_TclError);
    Ty_VISIT(Tkapp_Type);
    Ty_VISIT(Tktt_Type);
    Ty_VISIT(PyTclObject_Type);
    return 0;
}

static void
module_free(void *mod)
{
    (void)module_clear((TyObject *)mod);
}

static struct TyModuleDef _tkintermodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_tkinter",
    .m_size = -1,
    .m_methods = moduleMethods,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free
};

PyMODINIT_FUNC
PyInit__tkinter(void)
{
    TyObject *m, *uexe, *cexe;

    tcl_lock = TyThread_allocate_lock();
    if (tcl_lock == NULL)
        return NULL;

    m = TyModule_Create(&_tkintermodule);
    if (m == NULL)
        return NULL;
#ifdef Ty_GIL_DISABLED
    PyUnstable_Module_SetGIL(m, Ty_MOD_GIL_NOT_USED);
#endif

    Tkinter_TclError = TyErr_NewException("_tkinter.TclError", NULL, NULL);
    if (TyModule_AddObjectRef(m, "TclError", Tkinter_TclError)) {
        Ty_DECREF(m);
        return NULL;
    }

    if (TyModule_AddIntConstant(m, "READABLE", TCL_READABLE)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "WRITABLE", TCL_WRITABLE)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "EXCEPTION", TCL_EXCEPTION)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "WINDOW_EVENTS", TCL_WINDOW_EVENTS)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "FILE_EVENTS", TCL_FILE_EVENTS)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "TIMER_EVENTS", TCL_TIMER_EVENTS)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "IDLE_EVENTS", TCL_IDLE_EVENTS)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "ALL_EVENTS", TCL_ALL_EVENTS)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddIntConstant(m, "DONT_WAIT", TCL_DONT_WAIT)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddStringConstant(m, "TK_VERSION", TK_VERSION)) {
        Ty_DECREF(m);
        return NULL;
    }
    if (TyModule_AddStringConstant(m, "TCL_VERSION", TCL_VERSION)) {
        Ty_DECREF(m);
        return NULL;
    }

    Tkapp_Type = TyType_FromSpec(&Tkapp_Type_spec);
    if (TyModule_AddObjectRef(m, "TkappType", Tkapp_Type)) {
        Ty_DECREF(m);
        return NULL;
    }

    Tktt_Type = TyType_FromSpec(&Tktt_Type_spec);
    if (TyModule_AddObjectRef(m, "TkttType", Tktt_Type)) {
        Ty_DECREF(m);
        return NULL;
    }

    PyTclObject_Type = TyType_FromSpec(&PyTclObject_Type_spec);
    if (TyModule_AddObjectRef(m, "Tcl_Obj", PyTclObject_Type)) {
        Ty_DECREF(m);
        return NULL;
    }


    /* This helps the dynamic loader; in Unicode aware Tcl versions
       it also helps Tcl find its encodings. */
    (void) _TySys_GetOptionalAttrString("executable", &uexe);
    if (uexe && TyUnicode_Check(uexe)) {   // sys.executable can be None
        cexe = TyUnicode_EncodeFSDefault(uexe);
        Ty_DECREF(uexe);
        if (cexe) {
#ifdef MS_WINDOWS
            int set_var = 0;
            TyObject *str_path;
            wchar_t *wcs_path;
            DWORD ret;

            ret = GetEnvironmentVariableW(L"TCL_LIBRARY", NULL, 0);

            if (!ret && GetLastError() == ERROR_ENVVAR_NOT_FOUND) {
                str_path = _get_tcl_lib_path();
                if (str_path == NULL && TyErr_Occurred()) {
                    Ty_DECREF(cexe);
                    Ty_DECREF(m);
                    return NULL;
                }
                if (str_path != NULL) {
                    wcs_path = TyUnicode_AsWideCharString(str_path, NULL);
                    if (wcs_path == NULL) {
                        Ty_DECREF(cexe);
                        Ty_DECREF(m);
                        return NULL;
                    }
                    SetEnvironmentVariableW(L"TCL_LIBRARY", wcs_path);
                    set_var = 1;
                }
            }

            Tcl_FindExecutable(TyBytes_AS_STRING(cexe));

            if (set_var) {
                SetEnvironmentVariableW(L"TCL_LIBRARY", NULL);
                TyMem_Free(wcs_path);
            }
#else
            Tcl_FindExecutable(TyBytes_AS_STRING(cexe));
#endif /* MS_WINDOWS */
        }
        Ty_XDECREF(cexe);
    }
    else {
        Ty_XDECREF(uexe);
    }

    if (TyErr_Occurred()) {
        Ty_DECREF(m);
        return NULL;
    }

    return m;
}
