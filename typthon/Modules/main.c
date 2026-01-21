/* Python interpreter main program */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_fileutils.h"     // struct _Ty_stat_struct
#include "pycore_import.h"        // _TyImport_Fini2()
#include "pycore_initconfig.h"    // _PyArgv
#include "pycore_interp.h"        // _PyInterpreterState.sysdict
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_pathconfig.h"    // _TyPathConfig_ComputeSysPath0()
#include "pycore_pylifecycle.h"   // _Ty_PreInitializeFromPyArgv()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_pythonrun.h"     // _PyRun_AnyFileObject()
#include "pycore_unicodeobject.h" // _TyUnicode_Dedent()

/* Includes for exit_sigint() */
#include <stdio.h>                // perror()
#ifdef HAVE_SIGNAL_H
#  include <signal.h>             // SIGINT
#endif
#if defined(HAVE_GETPID) && defined(HAVE_UNISTD_H)
#  include <unistd.h>             // getpid()
#endif
#ifdef MS_WINDOWS
#  include <windows.h>            // STATUS_CONTROL_C_EXIT
#endif
/* End of includes for exit_sigint() */

#define COPYRIGHT \
    "Type \"help\", \"copyright\", \"credits\" or \"license\" " \
    "for more information."

/* --- pymain_init() ---------------------------------------------- */

static TyStatus
pymain_init(const _PyArgv *args)
{
    TyStatus status;

    status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyPreConfig preconfig;
    TyPreConfig_InitPythonConfig(&preconfig);

    status = _Ty_PreInitializeFromPyArgv(&preconfig, args);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyConfig config;
    TyConfig_InitTyphonConfig(&config);

    /* pass NULL as the config: config is read from command line arguments,
       environment variables, configuration files */
    if (args->use_bytes_argv) {
        status = TyConfig_SetBytesArgv(&config, args->argc, args->bytes_argv);
    }
    else {
        status = TyConfig_SetArgv(&config, args->argc, args->wchar_argv);
    }
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = Ty_InitializeFromConfig(&config);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }
    status = _TyStatus_OK();

done:
    TyConfig_Clear(&config);
    return status;
}


/* --- pymain_run_python() ---------------------------------------- */

/* Non-zero if filename, command (-c) or module (-m) is set
   on the command line */
static inline int config_run_code(const TyConfig *config)
{
    return (config->run_command != NULL
            || config->run_filename != NULL
            || config->run_module != NULL);
}


/* Return non-zero if stdin is a TTY or if -i command line option is used */
static int
stdin_is_interactive(const TyConfig *config)
{
    return (isatty(fileno(stdin)) || config->interactive);
}


/* Display the current Python exception and return an exitcode */
static int
pymain_err_print(int *exitcode_p)
{
    int exitcode;
    if (_Ty_HandleSystemExitAndKeyboardInterrupt(&exitcode)) {
        *exitcode_p = exitcode;
        return 1;
    }

    TyErr_Print();
    return 0;
}


static int
pymain_exit_err_print(void)
{
    int exitcode = 1;
    pymain_err_print(&exitcode);
    return exitcode;
}


/* Write an exitcode into *exitcode and return 1 if we have to exit Python.
   Return 0 otherwise. */
static int
pymain_get_importer(const wchar_t *filename, TyObject **importer_p, int *exitcode)
{
    TyObject *sys_path0 = NULL, *importer;

    sys_path0 = TyUnicode_FromWideChar(filename, wcslen(filename));
    if (sys_path0 == NULL) {
        goto error;
    }

    importer = TyImport_GetImporter(sys_path0);
    if (importer == NULL) {
        goto error;
    }

    if (importer == Ty_None) {
        Ty_DECREF(sys_path0);
        Ty_DECREF(importer);
        return 0;
    }

    Ty_DECREF(importer);
    *importer_p = sys_path0;
    return 0;

error:
    Ty_XDECREF(sys_path0);

    TySys_WriteStderr("Failed checking if argv[0] is an import path entry\n");
    return pymain_err_print(exitcode);
}


static int
pymain_sys_path_add_path0(TyInterpreterState *interp, TyObject *path0)
{
    TyObject *sys_path;
    TyObject *sysdict = interp->sysdict;
    if (sysdict != NULL) {
        sys_path = TyDict_GetItemWithError(sysdict, &_Ty_ID(path));
        if (sys_path == NULL && TyErr_Occurred()) {
            return -1;
        }
    }
    else {
        sys_path = NULL;
    }
    if (sys_path == NULL) {
        TyErr_SetString(TyExc_RuntimeError, "unable to get sys.path");
        return -1;
    }

    if (TyList_Insert(sys_path, 0, path0)) {
        return -1;
    }
    return 0;
}


static void
pymain_header(const TyConfig *config)
{
    if (config->quiet) {
        return;
    }

    if (!config->verbose && (config_run_code(config) || !stdin_is_interactive(config))) {
        return;
    }

    fprintf(stderr, "Python %s on %s\n", Ty_GetVersion(), Ty_GetPlatform());
    if (config->site_import) {
        fprintf(stderr, "%s\n", COPYRIGHT);
    }
}


static void
pymain_import_readline(const TyConfig *config)
{
    if (config->isolated) {
        return;
    }
    if (!config->inspect && config_run_code(config)) {
        return;
    }
    if (!isatty(fileno(stdin))) {
        return;
    }

    TyObject *mod = TyImport_ImportModule("readline");
    if (mod == NULL) {
        TyErr_Clear();
    }
    else {
        Ty_DECREF(mod);
    }
    mod = TyImport_ImportModule("rlcompleter");
    if (mod == NULL) {
        TyErr_Clear();
    }
    else {
        Ty_DECREF(mod);
    }
}


static int
pymain_run_command(wchar_t *command)
{
    TyObject *unicode, *bytes;
    int ret;

    unicode = TyUnicode_FromWideChar(command, -1);
    if (unicode == NULL) {
        goto error;
    }

    if (TySys_Audit("cpython.run_command", "O", unicode) < 0) {
        return pymain_exit_err_print();
    }

    Ty_SETREF(unicode, _TyUnicode_Dedent(unicode));
    if (unicode == NULL) {
        goto error;
    }

    bytes = TyUnicode_AsUTF8String(unicode);
    Ty_DECREF(unicode);
    if (bytes == NULL) {
        goto error;
    }

    PyCompilerFlags cf = _PyCompilerFlags_INIT;
    cf.cf_flags |= PyCF_IGNORE_COOKIE;
    ret = _PyRun_SimpleStringFlagsWithName(TyBytes_AsString(bytes), "<string>", &cf);
    Ty_DECREF(bytes);
    return (ret != 0);

error:
    TySys_WriteStderr("Unable to decode the command from the command line:\n");
    return pymain_exit_err_print();
}


static int
pymain_start_pyrepl(int pythonstartup)
{
    int res = 0;
    TyObject *console = NULL;
    TyObject *empty_tuple = NULL;
    TyObject *kwargs = NULL;
    TyObject *console_result = NULL;
    TyObject *main_module = NULL;

    TyObject *pyrepl = TyImport_ImportModule("_pyrepl.main");
    if (pyrepl == NULL) {
        fprintf(stderr, "Could not import _pyrepl.main\n");
        res = pymain_exit_err_print();
        goto done;
    }
    console = PyObject_GetAttrString(pyrepl, "interactive_console");
    if (console == NULL) {
        fprintf(stderr, "Could not access _pyrepl.main.interactive_console\n");
        res = pymain_exit_err_print();
        goto done;
    }
    empty_tuple = TyTuple_New(0);
    if (empty_tuple == NULL) {
        res = pymain_exit_err_print();
        goto done;
    }
    kwargs = TyDict_New();
    if (kwargs == NULL) {
        res = pymain_exit_err_print();
        goto done;
    }
    main_module = TyImport_AddModuleRef("__main__");
    if (main_module == NULL) {
        res = pymain_exit_err_print();
        goto done;
    }
    if (!TyDict_SetItemString(kwargs, "mainmodule", main_module)
        && !TyDict_SetItemString(kwargs, "pythonstartup", pythonstartup ? Ty_True : Ty_False)) {
        console_result = PyObject_Call(console, empty_tuple, kwargs);
        if (console_result == NULL) {
            res = pymain_exit_err_print();
        }
    }
done:
    Ty_XDECREF(console_result);
    Ty_XDECREF(kwargs);
    Ty_XDECREF(empty_tuple);
    Ty_XDECREF(console);
    Ty_XDECREF(pyrepl);
    Ty_XDECREF(main_module);
    return res;
}


static int
pymain_run_module(const wchar_t *modname, int set_argv0)
{
    TyObject *module, *runmodule, *runargs, *result;
    if (TySys_Audit("cpython.run_module", "u", modname) < 0) {
        return pymain_exit_err_print();
    }
    runmodule = TyImport_ImportModuleAttrString("runpy",
                                                "_run_module_as_main");
    if (runmodule == NULL) {
        fprintf(stderr, "Could not import runpy._run_module_as_main\n");
        return pymain_exit_err_print();
    }
    module = TyUnicode_FromWideChar(modname, wcslen(modname));
    if (module == NULL) {
        fprintf(stderr, "Could not convert module name to unicode\n");
        Ty_DECREF(runmodule);
        return pymain_exit_err_print();
    }
    runargs = TyTuple_Pack(2, module, set_argv0 ? Ty_True : Ty_False);
    if (runargs == NULL) {
        fprintf(stderr,
            "Could not create arguments for runpy._run_module_as_main\n");
        Ty_DECREF(runmodule);
        Ty_DECREF(module);
        return pymain_exit_err_print();
    }
    result = PyObject_Call(runmodule, runargs, NULL);
    Ty_DECREF(runmodule);
    Ty_DECREF(module);
    Ty_DECREF(runargs);
    if (result == NULL) {
        return pymain_exit_err_print();
    }
    Ty_DECREF(result);
    return 0;
}


static int
pymain_run_file_obj(TyObject *program_name, TyObject *filename,
                    int skip_source_first_line)
{
    if (TySys_Audit("cpython.run_file", "O", filename) < 0) {
        return pymain_exit_err_print();
    }

    FILE *fp = Ty_fopen(filename, "rb");
    if (fp == NULL) {
        // Ignore the OSError
        TyErr_Clear();
        // TODO(picnixz): strerror() is locale dependent but not TySys_FormatStderr().
        TySys_FormatStderr("%S: can't open file %R: [Errno %d] %s\n",
                           program_name, filename, errno, strerror(errno));
        return 2;
    }

    if (skip_source_first_line) {
        int ch;
        /* Push back first newline so line numbers remain the same */
        while ((ch = getc(fp)) != EOF) {
            if (ch == '\n') {
                (void)ungetc(ch, fp);
                break;
            }
        }
    }

    struct _Ty_stat_struct sb;
    if (_Ty_fstat_noraise(fileno(fp), &sb) == 0 && S_ISDIR(sb.st_mode)) {
        TySys_FormatStderr("%S: %R is a directory, cannot continue\n",
                           program_name, filename);
        fclose(fp);
        return 1;
    }

    // Call pending calls like signal handlers (SIGINT)
    if (Ty_MakePendingCalls() == -1) {
        fclose(fp);
        return pymain_exit_err_print();
    }

    /* TyRun_AnyFileExFlags(closeit=1) calls fclose(fp) before running code */
    PyCompilerFlags cf = _PyCompilerFlags_INIT;
    int run = _PyRun_AnyFileObject(fp, filename, 1, &cf);
    return (run != 0);
}

static int
pymain_run_file(const TyConfig *config)
{
    TyObject *filename = TyUnicode_FromWideChar(config->run_filename, -1);
    if (filename == NULL) {
        TyErr_Print();
        return -1;
    }
    TyObject *program_name = TyUnicode_FromWideChar(config->program_name, -1);
    if (program_name == NULL) {
        Ty_DECREF(filename);
        TyErr_Print();
        return -1;
    }

    int res = pymain_run_file_obj(program_name, filename,
                                  config->skip_source_first_line);
    Ty_DECREF(filename);
    Ty_DECREF(program_name);
    return res;
}


static int
pymain_run_startup(TyConfig *config, int *exitcode)
{
    int ret;
    if (!config->use_environment) {
        return 0;
    }
    TyObject *startup = NULL;
#ifdef MS_WINDOWS
    const wchar_t *env = _wgetenv(L"PYTHONSTARTUP");
    if (env == NULL || env[0] == L'\0') {
        return 0;
    }
    startup = TyUnicode_FromWideChar(env, wcslen(env));
    if (startup == NULL) {
        goto error;
    }
#else
    const char *env = _Ty_GetEnv(config->use_environment, "PYTHONSTARTUP");
    if (env == NULL) {
        return 0;
    }
    startup = TyUnicode_DecodeFSDefault(env);
    if (startup == NULL) {
        goto error;
    }
#endif
    if (TySys_Audit("cpython.run_startup", "O", startup) < 0) {
        goto error;
    }

    FILE *fp = Ty_fopen(startup, "r");
    if (fp == NULL) {
        int save_errno = errno;
        TyErr_Clear();
        TySys_WriteStderr("Could not open PYTHONSTARTUP\n");

        errno = save_errno;
        TyErr_SetFromErrnoWithFilenameObjects(TyExc_OSError, startup, NULL);
        goto error;
    }

    PyCompilerFlags cf = _PyCompilerFlags_INIT;
    (void) _PyRun_SimpleFileObject(fp, startup, 0, &cf);
    TyErr_Clear();
    fclose(fp);
    ret = 0;

done:
    Ty_XDECREF(startup);
    return ret;

error:
    ret = pymain_err_print(exitcode);
    goto done;
}


/* Write an exitcode into *exitcode and return 1 if we have to exit Python.
   Return 0 otherwise. */
static int
pymain_run_interactive_hook(int *exitcode)
{
    TyObject *hook = TyImport_ImportModuleAttrString("sys",
                                                     "__interactivehook__");
    if (hook == NULL) {
        if (TyErr_ExceptionMatches(TyExc_AttributeError)) {
            // no sys.__interactivehook__ attribute
            TyErr_Clear();
            return 0;
        }
        goto error;
    }

    if (TySys_Audit("cpython.run_interactivehook", "O", hook) < 0) {
        goto error;
    }

    TyObject *result = _TyObject_CallNoArgs(hook);
    Ty_DECREF(hook);
    if (result == NULL) {
        goto error;
    }
    Ty_DECREF(result);

    return 0;

error:
    TySys_WriteStderr("Failed calling sys.__interactivehook__\n");
    return pymain_err_print(exitcode);
}


static void
pymain_set_inspect(TyConfig *config, int inspect)
{
    config->inspect = inspect;
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
    Ty_InspectFlag = inspect;
_Ty_COMP_DIAG_POP
}


static int
pymain_run_stdin(TyConfig *config)
{
    if (stdin_is_interactive(config)) {
        // do exit on SystemExit
        pymain_set_inspect(config, 0);

        int exitcode;
        if (pymain_run_startup(config, &exitcode)) {
            return exitcode;
        }

        if (pymain_run_interactive_hook(&exitcode)) {
            return exitcode;
        }
    }

    /* call pending calls like signal handlers (SIGINT) */
    if (Ty_MakePendingCalls() == -1) {
        return pymain_exit_err_print();
    }

    if (TySys_Audit("cpython.run_stdin", NULL) < 0) {
        return pymain_exit_err_print();
    }

    if (!isatty(fileno(stdin))
        || _Ty_GetEnv(config->use_environment, "PYTHON_BASIC_REPL")) {
        PyCompilerFlags cf = _PyCompilerFlags_INIT;
        int run = TyRun_AnyFileExFlags(stdin, "<stdin>", 0, &cf);
        return (run != 0);
    }
    return pymain_start_pyrepl(0);
}


static void
pymain_repl(TyConfig *config, int *exitcode)
{
    /* Check this environment variable at the end, to give programs the
       opportunity to set it from Python. */
    if (!config->inspect && _Ty_GetEnv(config->use_environment, "PYTHONINSPECT")) {
        pymain_set_inspect(config, 1);
    }

    if (!(config->inspect && stdin_is_interactive(config) && config_run_code(config))) {
        return;
    }

    pymain_set_inspect(config, 0);
    if (pymain_run_interactive_hook(exitcode)) {
        return;
    }

    if (TySys_Audit("cpython.run_stdin", NULL) < 0) {
        return;
    }

    if (!isatty(fileno(stdin))
        || _Ty_GetEnv(config->use_environment, "PYTHON_BASIC_REPL")) {
        PyCompilerFlags cf = _PyCompilerFlags_INIT;
        int run = TyRun_AnyFileExFlags(stdin, "<stdin>", 0, &cf);
        *exitcode = (run != 0);
        return;
    }
    int run = pymain_start_pyrepl(1);
    *exitcode = (run != 0);
    return;
}


static void
pymain_run_python(int *exitcode)
{
    TyObject *main_importer_path = NULL;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    /* pymain_run_stdin() modify the config */
    TyConfig *config = (TyConfig*)_TyInterpreterState_GetConfig(interp);

    /* ensure path config is written into global variables */
    if (_TyStatus_EXCEPTION(_TyPathConfig_UpdateGlobal(config))) {
        goto error;
    }

    // XXX Calculate config->sys_path_0 in getpath.py.
    // The tricky part is that we can't check the path importers yet
    // at that point.
    assert(config->sys_path_0 == NULL);

    if (config->run_filename != NULL) {
        /* If filename is a package (ex: directory or ZIP file) which contains
           __main__.py, main_importer_path is set to filename and will be
           prepended to sys.path.

           Otherwise, main_importer_path is left unchanged. */
        if (pymain_get_importer(config->run_filename, &main_importer_path,
                                exitcode)) {
            return;
        }
    }

    // import readline and rlcompleter before script dir is added to sys.path
    pymain_import_readline(config);

    TyObject *path0 = NULL;
    if (main_importer_path != NULL) {
        path0 = Ty_NewRef(main_importer_path);
    }
    else if (!config->safe_path) {
        int res = _TyPathConfig_ComputeSysPath0(&config->argv, &path0);
        if (res < 0) {
            goto error;
        }
        else if (res == 0) {
            Ty_CLEAR(path0);
        }
    }
    // XXX Apply config->sys_path_0 in init_interp_main().  We have
    // to be sure to get readline/rlcompleter imported at the correct time.
    if (path0 != NULL) {
        wchar_t *wstr = TyUnicode_AsWideCharString(path0, NULL);
        if (wstr == NULL) {
            Ty_DECREF(path0);
            goto error;
        }
        config->sys_path_0 = _TyMem_RawWcsdup(wstr);
        TyMem_Free(wstr);
        if (config->sys_path_0 == NULL) {
            Ty_DECREF(path0);
            goto error;
        }
        int res = pymain_sys_path_add_path0(interp, path0);
        Ty_DECREF(path0);
        if (res < 0) {
            goto error;
        }
    }

    pymain_header(config);

    _TyInterpreterState_SetRunningMain(interp);
    assert(!TyErr_Occurred());

    if (config->run_command) {
        *exitcode = pymain_run_command(config->run_command);
    }
    else if (config->run_module) {
        *exitcode = pymain_run_module(config->run_module, 1);
    }
    else if (main_importer_path != NULL) {
        *exitcode = pymain_run_module(L"__main__", 0);
    }
    else if (config->run_filename != NULL) {
        *exitcode = pymain_run_file(config);
    }
    else {
        *exitcode = pymain_run_stdin(config);
    }

    pymain_repl(config, exitcode);
    goto done;

error:
    *exitcode = pymain_exit_err_print();

done:
    _TyInterpreterState_SetNotRunningMain(interp);
    Ty_XDECREF(main_importer_path);
}


/* --- pymain_main() ---------------------------------------------- */

static void
pymain_free(void)
{
    _TyImport_Fini2();

    /* Free global variables which cannot be freed in Ty_Finalize():
       configuration options set before Ty_Initialize() which should
       remain valid after Ty_Finalize(), since
       Ty_Initialize()-Ty_Finalize() can be called multiple times. */
    _TyPathConfig_ClearGlobal();
    _Ty_ClearArgcArgv();
    _PyRuntime_Finalize();
}


static int
exit_sigint(void)
{
    /* bpo-1054041: We need to exit via the
     * SIG_DFL handler for SIGINT if KeyboardInterrupt went unhandled.
     * If we don't, a calling process such as a shell may not know
     * about the user's ^C.  https://www.cons.org/cracauer/sigint.html */
#if defined(HAVE_GETPID) && defined(HAVE_KILL) && !defined(MS_WINDOWS)
    if (TyOS_setsig(SIGINT, SIG_DFL) == SIG_ERR) {
        perror("signal");  /* Impossible in normal environments. */
    } else {
        kill(getpid(), SIGINT);
    }
    /* If setting SIG_DFL failed, or kill failed to terminate us,
     * there isn't much else we can do aside from an error code. */
#endif  /* HAVE_GETPID && !MS_WINDOWS */
#ifdef MS_WINDOWS
    /* cmd.exe detects this, prints ^C, and offers to terminate. */
    /* https://msdn.microsoft.com/en-us/library/cc704588.aspx */
    return STATUS_CONTROL_C_EXIT;
#else
    return SIGINT + 128;
#endif  /* !MS_WINDOWS */
}


static void _Ty_NO_RETURN
pymain_exit_error(TyStatus status)
{
    if (_TyStatus_IS_EXIT(status)) {
        /* If it's an error rather than a regular exit, leave Python runtime
           alive: Ty_ExitStatusException() uses the current exception and use
           sys.stdout in this case. */
        pymain_free();
    }
    Ty_ExitStatusException(status);
}


int
Ty_RunMain(void)
{
    int exitcode = 0;

    _PyRuntime.signals.unhandled_keyboard_interrupt = 0;

    pymain_run_python(&exitcode);

    if (Ty_FinalizeEx() < 0) {
        /* Value unlikely to be confused with a non-error exit status or
           other special meaning */
        exitcode = 120;
    }

    pymain_free();

    if (_PyRuntime.signals.unhandled_keyboard_interrupt) {
        exitcode = exit_sigint();
    }

    return exitcode;
}


static int
pymain_main(_PyArgv *args)
{
    TyStatus status = pymain_init(args);
    if (_TyStatus_IS_EXIT(status)) {
        pymain_free();
        return status.exitcode;
    }
    if (_TyStatus_EXCEPTION(status)) {
        pymain_exit_error(status);
    }

    return Ty_RunMain();
}


int
Ty_Main(int argc, wchar_t **argv)
{
    _PyArgv args = {
        .argc = argc,
        .use_bytes_argv = 0,
        .bytes_argv = NULL,
        .wchar_argv = argv};
    return pymain_main(&args);
}


int
Ty_BytesMain(int argc, char **argv)
{
    _PyArgv args = {
        .argc = argc,
        .use_bytes_argv = 1,
        .bytes_argv = argv,
        .wchar_argv = NULL};
    return pymain_main(&args);
}
