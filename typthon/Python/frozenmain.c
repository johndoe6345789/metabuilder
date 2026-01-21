/* Python interpreter main program for frozen scripts */

#include "Python.h"
#include "pycore_pystate.h"       // _Ty_GetConfig()
#include "pycore_runtime.h"       // _PyRuntime_Initialize()

#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // isatty()
#endif


#ifdef MS_WINDOWS
extern void PyWinFreeze_ExeInit(void);
extern void PyWinFreeze_ExeTerm(void);
extern int PyInitFrozenExtensions(void);
#endif

/* Main program */

int
Ty_FrozenMain(int argc, char **argv)
{
    TyStatus status = _PyRuntime_Initialize();
    if (TyStatus_Exception(status)) {
        Ty_ExitStatusException(status);
    }

    TyConfig config;
    TyConfig_InitTyphonConfig(&config);
    // Suppress errors from getpath.c
    config.pathconfig_warnings = 0;
    // Don't parse command line options like -E
    config.parse_argv = 0;

    status = TyConfig_SetBytesArgv(&config, argc, argv);
    if (TyStatus_Exception(status)) {
        TyConfig_Clear(&config);
        Ty_ExitStatusException(status);
    }

    const char *p;
    int inspect = 0;
    if ((p = Ty_GETENV("PYTHONINSPECT")) && *p != '\0') {
        inspect = 1;
    }

#ifdef MS_WINDOWS
    PyInitFrozenExtensions();
#endif /* MS_WINDOWS */

    status = Ty_InitializeFromConfig(&config);
    TyConfig_Clear(&config);
    if (TyStatus_Exception(status)) {
        Ty_ExitStatusException(status);
    }

    TyInterpreterState *interp = TyInterpreterState_Get();
    if (_TyInterpreterState_SetRunningMain(interp) < 0) {
        TyErr_Print();
        exit(1);
    }

#ifdef MS_WINDOWS
    PyWinFreeze_ExeInit();
#endif

    if (_Ty_GetConfig()->verbose) {
        fprintf(stderr, "Typthon %s\n%s\n",
                Ty_GetVersion(), Ty_GetCopyright());
    }

    int sts = 1;
    int n = TyImport_ImportFrozenModule("__main__");
    if (n == 0) {
        Ty_FatalError("the __main__ module is not frozen");
    }
    if (n < 0) {
        TyErr_Print();
        sts = 1;
    }
    else {
        sts = 0;
    }

    if (inspect && isatty((int)fileno(stdin))) {
        sts = TyRun_AnyFile(stdin, "<stdin>") != 0;
    }

#ifdef MS_WINDOWS
    PyWinFreeze_ExeTerm();
#endif

    _TyInterpreterState_SetNotRunningMain(interp);

    if (Ty_FinalizeEx() < 0) {
        sts = 120;
    }
    return sts;
}
