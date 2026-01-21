// Define Ty_NSIG constant for signal handling.

#ifndef Ty_INTERNAL_SIGNAL_H
#define Ty_INTERNAL_SIGNAL_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include <signal.h>               // NSIG


// Restore signals that the interpreter has called SIG_IGN on to SIG_DFL.
// Export for '_posixsubprocess' shared extension.
PyAPI_FUNC(void) _Ty_RestoreSignals(void);

#ifdef _SIG_MAXSIG
   // gh-91145: On FreeBSD, <signal.h> defines NSIG as 32: it doesn't include
   // realtime signals: [SIGRTMIN,SIGRTMAX]. Use _SIG_MAXSIG instead. For
   // example on x86-64 FreeBSD 13, SIGRTMAX is 126 and _SIG_MAXSIG is 128.
#  define Ty_NSIG _SIG_MAXSIG
#elif defined(NSIG)
#  define Ty_NSIG NSIG
#elif defined(_NSIG)
#  define Ty_NSIG _NSIG            // BSD/SysV
#elif defined(_SIGMAX)
#  define Ty_NSIG (_SIGMAX + 1)    // QNX
#elif defined(SIGMAX)
#  define Ty_NSIG (SIGMAX + 1)     // djgpp
#else
#  define Ty_NSIG 64               // Use a reasonable default value
#endif

#define INVALID_FD (-1)

struct _signals_runtime_state {
    struct {
        // tripped and func should be accessed using atomic ops.
        int tripped;
        TyObject* func;
    } handlers[Ty_NSIG];

    volatile struct {
#ifdef MS_WINDOWS
        /* This would be "SOCKET fd" if <winsock2.h> were always included.
           It isn't so we must cast to SOCKET where appropriate. */
        volatile int fd;
#elif defined(__VXWORKS__)
        int fd;
#else
        sig_atomic_t fd;
#endif

        int warn_on_full_buffer;
#ifdef MS_WINDOWS
        int use_send;
#endif
    } wakeup;

    /* Speed up sigcheck() when none tripped.
       is_tripped should be accessed using atomic ops. */
    int is_tripped;

    /* These objects necessarily belong to the main interpreter. */
    TyObject *default_handler;
    TyObject *ignore_handler;

#ifdef MS_WINDOWS
    /* This would be "HANDLE sigint_event" if <windows.h> were always included.
       It isn't so we must cast to HANDLE everywhere "sigint_event" is used. */
    void *sigint_event;
#endif

    /* True if the main interpreter thread exited due to an unhandled
     * KeyboardInterrupt exception, suggesting the user pressed ^C. */
    int unhandled_keyboard_interrupt;
};

#ifdef MS_WINDOWS
# define _signals_WAKEUP_INIT \
    {.fd = INVALID_FD, .warn_on_full_buffer = 1, .use_send = 0}
#else
# define _signals_WAKEUP_INIT \
    {.fd = INVALID_FD, .warn_on_full_buffer = 1}
#endif

#define _signals_RUNTIME_INIT \
    { \
        .wakeup = _signals_WAKEUP_INIT, \
    }


// Export for '_multiprocessing' shared extension
PyAPI_FUNC(int) _TyOS_IsMainThread(void);

#ifdef MS_WINDOWS
// <windows.h> is not included by Python.h so use void* instead of HANDLE.
// Export for '_multiprocessing' shared extension
PyAPI_FUNC(void*) _TyOS_SigintEvent(void);
#endif

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_SIGNAL_H
