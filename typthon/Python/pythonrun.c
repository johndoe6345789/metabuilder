
/* Top level execution of Python code (including in __main__) */

/* To help control the interfaces between the startup, execution and
 * shutdown code, the phases are split across separate modules (bootstrap,
 * pythonrun, shutdown)
 */

/* TODO: Cull includes following phase split */

#include "Python.h"

#include "pycore_ast.h"           // TyAST_mod2obj()
#include "pycore_audit.h"         // _TySys_Audit()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCall()
#include "pycore_compile.h"       // _TyAST_Compile()
#include "pycore_fileutils.h"     // _PyFile_Flush
#include "pycore_import.h"        // _TyImport_GetImportlibExternalLoader()
#include "pycore_interp.h"        // TyInterpreterState.importlib
#include "pycore_object.h"        // _PyDebug_PrintTotalRefs()
#include "pycore_parser.h"        // _TyParser_ASTFromString()
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_pylifecycle.h"   // _Ty_FdIsInteractive()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_pythonrun.h"     // export _PyRun_InteractiveLoopObject()
#include "pycore_sysmodule.h"     // _TySys_SetAttr()
#include "pycore_traceback.h"     // _PyTraceBack_Print()
#include "pycore_unicodeobject.h" // _TyUnicode_Equal()

#include "errcode.h"              // E_EOF
#include "marshal.h"              // TyMarshal_ReadLongFromFile()

#include <stdbool.h>

#ifdef MS_WINDOWS
#  include "malloc.h"             // alloca()
#endif

#ifdef MS_WINDOWS
#  undef BYTE
#  include "windows.h"
#endif

/* Forward */
static void flush_io(void);
static TyObject *run_mod(mod_ty, TyObject *, TyObject *, TyObject *,
                          PyCompilerFlags *, PyArena *, TyObject*, int);
static TyObject *run_pyc_file(FILE *, TyObject *, TyObject *,
                              PyCompilerFlags *);
static int TyRun_InteractiveOneObjectEx(FILE *, TyObject *, PyCompilerFlags *);
static TyObject* pyrun_file(FILE *fp, TyObject *filename, int start,
                            TyObject *globals, TyObject *locals, int closeit,
                            PyCompilerFlags *flags);
static TyObject *
_PyRun_StringFlagsWithName(const char *str, TyObject* name, int start,
                           TyObject *globals, TyObject *locals, PyCompilerFlags *flags,
                           int generate_new_source);

int
_PyRun_AnyFileObject(FILE *fp, TyObject *filename, int closeit,
                     PyCompilerFlags *flags)
{
    int decref_filename = 0;
    if (filename == NULL) {
        filename = TyUnicode_FromString("???");
        if (filename == NULL) {
            TyErr_Print();
            return -1;
        }
        decref_filename = 1;
    }

    int res;
    if (_Ty_FdIsInteractive(fp, filename)) {
        res = _PyRun_InteractiveLoopObject(fp, filename, flags);
        if (closeit) {
            fclose(fp);
        }
    }
    else {
        res = _PyRun_SimpleFileObject(fp, filename, closeit, flags);
    }

    if (decref_filename) {
        Ty_DECREF(filename);
    }
    return res;
}

int
TyRun_AnyFileExFlags(FILE *fp, const char *filename, int closeit,
                     PyCompilerFlags *flags)
{
    TyObject *filename_obj = NULL;
    if (filename != NULL) {
        filename_obj = TyUnicode_DecodeFSDefault(filename);
        if (filename_obj == NULL) {
            TyErr_Print();
            return -1;
        }
    }
    int res = _PyRun_AnyFileObject(fp, filename_obj, closeit, flags);
    Ty_XDECREF(filename_obj);
    return res;
}


int
_PyRun_InteractiveLoopObject(FILE *fp, TyObject *filename, PyCompilerFlags *flags)
{
    PyCompilerFlags local_flags = _PyCompilerFlags_INIT;
    if (flags == NULL) {
        flags = &local_flags;
    }

    TyObject *v;
    if (_TySys_GetOptionalAttr(&_Ty_ID(ps1), &v) < 0) {
        TyErr_Print();
        return -1;
    }
    if (v == NULL) {
        v = TyUnicode_FromString(">>> ");
        if (v == NULL) {
            TyErr_Clear();
        }
        if (_TySys_SetAttr(&_Ty_ID(ps1), v) < 0) {
            TyErr_Clear();
        }
    }
    Ty_XDECREF(v);
    if (_TySys_GetOptionalAttr(&_Ty_ID(ps2), &v) < 0) {
        TyErr_Print();
        return -1;
    }
    if (v == NULL) {
        v = TyUnicode_FromString("... ");
        if (v == NULL) {
            TyErr_Clear();
        }
        if (_TySys_SetAttr(&_Ty_ID(ps2), v) < 0) {
            TyErr_Clear();
        }
    }
    Ty_XDECREF(v);

#ifdef Ty_REF_DEBUG
    int show_ref_count = _Ty_GetConfig()->show_ref_count;
#endif
    int err = 0;
    int ret;
    int nomem_count = 0;
    do {
        ret = TyRun_InteractiveOneObjectEx(fp, filename, flags);
        if (ret == -1 && TyErr_Occurred()) {
            /* Prevent an endless loop after multiple consecutive MemoryErrors
             * while still allowing an interactive command to fail with a
             * MemoryError. */
            if (TyErr_ExceptionMatches(TyExc_MemoryError)) {
                if (++nomem_count > 16) {
                    TyErr_Clear();
                    err = -1;
                    break;
                }
            } else {
                nomem_count = 0;
            }
            TyErr_Print();
            flush_io();
        } else {
            nomem_count = 0;
        }
#ifdef Ty_REF_DEBUG
        if (show_ref_count) {
            _PyDebug_PrintTotalRefs();
        }
#endif
    } while (ret != E_EOF);
    return err;
}


int
TyRun_InteractiveLoopFlags(FILE *fp, const char *filename, PyCompilerFlags *flags)
{
    TyObject *filename_obj = TyUnicode_DecodeFSDefault(filename);
    if (filename_obj == NULL) {
        TyErr_Print();
        return -1;
    }

    int err = _PyRun_InteractiveLoopObject(fp, filename_obj, flags);
    Ty_DECREF(filename_obj);
    return err;

}


// Call _TyParser_ASTFromFile() with sys.stdin.encoding, sys.ps1 and sys.ps2
static int
pyrun_one_parse_ast(FILE *fp, TyObject *filename,
                    PyCompilerFlags *flags, PyArena *arena,
                    mod_ty *pmod, TyObject** interactive_src)
{
    // Get sys.stdin.encoding (as UTF-8)
    TyObject *attr;
    TyObject *encoding_obj = NULL;
    const char *encoding = NULL;
    if (fp == stdin) {
        if (_TySys_GetOptionalAttr(&_Ty_ID(stdin), &attr) < 0) {
            TyErr_Clear();
        }
        else if (attr != NULL && attr != Ty_None) {
            if (PyObject_GetOptionalAttr(attr, &_Ty_ID(encoding), &encoding_obj) < 0) {
                TyErr_Clear();
            }
            else if (encoding_obj && TyUnicode_Check(encoding_obj)) {
                encoding = TyUnicode_AsUTF8(encoding_obj);
                if (!encoding) {
                    TyErr_Clear();
                }
            }
        }
        Ty_XDECREF(attr);
    }

    // Get sys.ps1 (as UTF-8)
    TyObject *ps1_obj = NULL;
    const char *ps1 = "";
    if (_TySys_GetOptionalAttr(&_Ty_ID(ps1), &attr) < 0) {
        TyErr_Clear();
    }
    else if (attr != NULL) {
        ps1_obj = PyObject_Str(attr);
        Ty_DECREF(attr);
        if (ps1_obj == NULL) {
            TyErr_Clear();
        }
        else if (TyUnicode_Check(ps1_obj)) {
            ps1 = TyUnicode_AsUTF8(ps1_obj);
            if (ps1 == NULL) {
                TyErr_Clear();
                ps1 = "";
            }
        }
    }

    // Get sys.ps2 (as UTF-8)
    TyObject *ps2_obj = NULL;
    const char *ps2 = "";
    if (_TySys_GetOptionalAttr(&_Ty_ID(ps2), &attr) < 0) {
        TyErr_Clear();
    }
    else if (attr != NULL) {
        ps2_obj = PyObject_Str(attr);
        Ty_DECREF(attr);
        if (ps2_obj == NULL) {
            TyErr_Clear();
        }
        else if (TyUnicode_Check(ps2_obj)) {
            ps2 = TyUnicode_AsUTF8(ps2_obj);
            if (ps2 == NULL) {
                TyErr_Clear();
                ps2 = "";
            }
        }
    }

    int errcode = 0;
    *pmod = _TyParser_InteractiveASTFromFile(fp, filename, encoding,
                                             Ty_single_input, ps1, ps2,
                                             flags, &errcode, interactive_src, arena);
    Ty_XDECREF(ps1_obj);
    Ty_XDECREF(ps2_obj);
    Ty_XDECREF(encoding_obj);

    if (*pmod == NULL) {
        if (errcode == E_EOF) {
            TyErr_Clear();
            return E_EOF;
        }
        return -1;
    }
    return 0;
}


/* A TyRun_InteractiveOneObject() auxiliary function that does not print the
 * error on failure. */
static int
TyRun_InteractiveOneObjectEx(FILE *fp, TyObject *filename,
                             PyCompilerFlags *flags)
{
    PyArena *arena = _TyArena_New();
    if (arena == NULL) {
        return -1;
    }

    mod_ty mod;
    TyObject *interactive_src;
    int parse_res = pyrun_one_parse_ast(fp, filename, flags, arena, &mod, &interactive_src);
    if (parse_res != 0) {
        _TyArena_Free(arena);
        return parse_res;
    }

    TyObject *main_module = TyImport_AddModuleRef("__main__");
    if (main_module == NULL) {
        _TyArena_Free(arena);
        return -1;
    }
    TyObject *main_dict = TyModule_GetDict(main_module);  // borrowed ref

    TyObject *res = run_mod(mod, filename, main_dict, main_dict, flags, arena, interactive_src, 1);
    Ty_INCREF(interactive_src);
    _TyArena_Free(arena);
    Ty_DECREF(main_module);
    if (res == NULL) {
        TyThreadState *tstate = _TyThreadState_GET();
        TyObject *exc = _TyErr_GetRaisedException(tstate);
        if (TyType_IsSubtype(Ty_TYPE(exc),
                             (TyTypeObject *) TyExc_SyntaxError))
        {
            /* fix "text" attribute */
            assert(interactive_src != NULL);
            TyObject *xs = TyUnicode_Splitlines(interactive_src, 1);
            if (xs == NULL) {
                goto error;
            }
            TyObject *exc_lineno = PyObject_GetAttr(exc, &_Ty_ID(lineno));
            if (exc_lineno == NULL) {
                Ty_DECREF(xs);
                goto error;
            }
            int n = TyLong_AsInt(exc_lineno);
            Ty_DECREF(exc_lineno);
            if (n <= 0 || n > TyList_GET_SIZE(xs)) {
                Ty_DECREF(xs);
                goto error;
            }
            TyObject *line = TyList_GET_ITEM(xs, n - 1);
            PyObject_SetAttr(exc, &_Ty_ID(text), line);
            Ty_DECREF(xs);
        }
error:
        Ty_DECREF(interactive_src);
        _TyErr_SetRaisedException(tstate, exc);
        return -1;
    }
    Ty_DECREF(interactive_src);
    Ty_DECREF(res);

    flush_io();
    return 0;
}

int
TyRun_InteractiveOneObject(FILE *fp, TyObject *filename, PyCompilerFlags *flags)
{
    int res;

    res = TyRun_InteractiveOneObjectEx(fp, filename, flags);
    if (res == -1) {
        TyErr_Print();
        flush_io();
    }
    return res;
}

int
TyRun_InteractiveOneFlags(FILE *fp, const char *filename_str, PyCompilerFlags *flags)
{
    TyObject *filename;
    int res;

    filename = TyUnicode_DecodeFSDefault(filename_str);
    if (filename == NULL) {
        TyErr_Print();
        return -1;
    }
    res = TyRun_InteractiveOneObject(fp, filename, flags);
    Ty_DECREF(filename);
    return res;
}


/* Check whether a file maybe a pyc file: Look at the extension,
   the file type, and, if we may close it, at the first few bytes. */

static int
maybe_pyc_file(FILE *fp, TyObject *filename, int closeit)
{
    TyObject *ext = TyUnicode_FromString(".pyc");
    if (ext == NULL) {
        return -1;
    }
    Ty_ssize_t endswith = TyUnicode_Tailmatch(filename, ext, 0, PY_SSIZE_T_MAX, +1);
    Ty_DECREF(ext);
    if (endswith) {
        return 1;
    }

    /* Only look into the file if we are allowed to close it, since
       it then should also be seekable. */
    if (!closeit) {
        return 0;
    }

    /* Read only two bytes of the magic. If the file was opened in
       text mode, the bytes 3 and 4 of the magic (\r\n) might not
       be read as they are on disk. */
    unsigned int halfmagic = TyImport_GetMagicNumber() & 0xFFFF;
    unsigned char buf[2];
    /* Mess:  In case of -x, the stream is NOT at its start now,
       and ungetc() was used to push back the first newline,
       which makes the current stream position formally undefined,
       and a x-platform nightmare.
       Unfortunately, we have no direct way to know whether -x
       was specified.  So we use a terrible hack:  if the current
       stream position is not 0, we assume -x was specified, and
       give up.  Bug 132850 on SourceForge spells out the
       hopelessness of trying anything else (fseek and ftell
       don't work predictably x-platform for text-mode files).
    */
    int ispyc = 0;
    if (ftell(fp) == 0) {
        if (fread(buf, 1, 2, fp) == 2 &&
            ((unsigned int)buf[1]<<8 | buf[0]) == halfmagic)
            ispyc = 1;
        rewind(fp);
    }
    return ispyc;
}


static int
set_main_loader(TyObject *d, TyObject *filename, const char *loader_name)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyObject *loader_type = _TyImport_GetImportlibExternalLoader(interp,
                                                                 loader_name);
    if (loader_type == NULL) {
        return -1;
    }

    TyObject *loader = PyObject_CallFunction(loader_type,
                                             "sO", "__main__", filename);
    Ty_DECREF(loader_type);
    if (loader == NULL) {
        return -1;
    }

    if (TyDict_SetItemString(d, "__loader__", loader) < 0) {
        Ty_DECREF(loader);
        return -1;
    }
    Ty_DECREF(loader);
    return 0;
}


int
_PyRun_SimpleFileObject(FILE *fp, TyObject *filename, int closeit,
                        PyCompilerFlags *flags)
{
    int ret = -1;

    TyObject *main_module = TyImport_AddModuleRef("__main__");
    if (main_module == NULL)
        return -1;
    TyObject *dict = TyModule_GetDict(main_module);  // borrowed ref

    int set_file_name = 0;
    int has_file = TyDict_ContainsString(dict, "__file__");
    if (has_file < 0) {
        goto done;
    }
    if (!has_file) {
        if (TyDict_SetItemString(dict, "__file__", filename) < 0) {
            goto done;
        }
        if (TyDict_SetItemString(dict, "__cached__", Ty_None) < 0) {
            goto done;
        }
        set_file_name = 1;
    }

    int pyc = maybe_pyc_file(fp, filename, closeit);
    if (pyc < 0) {
        goto done;
    }

    TyObject *v;
    if (pyc) {
        FILE *pyc_fp;
        /* Try to run a pyc file. First, re-open in binary */
        if (closeit) {
            fclose(fp);
        }

        pyc_fp = Ty_fopen(filename, "rb");
        if (pyc_fp == NULL) {
            fprintf(stderr, "python: Can't reopen .pyc file\n");
            goto done;
        }

        if (set_main_loader(dict, filename, "SourcelessFileLoader") < 0) {
            fprintf(stderr, "python: failed to set __main__.__loader__\n");
            ret = -1;
            fclose(pyc_fp);
            goto done;
        }
        v = run_pyc_file(pyc_fp, dict, dict, flags);
    } else {
        /* When running from stdin, leave __main__.__loader__ alone */
        if ((!TyUnicode_Check(filename) || !TyUnicode_EqualToUTF8(filename, "<stdin>")) &&
            set_main_loader(dict, filename, "SourceFileLoader") < 0) {
            fprintf(stderr, "python: failed to set __main__.__loader__\n");
            ret = -1;
            goto done;
        }
        v = pyrun_file(fp, filename, Ty_file_input, dict, dict,
                       closeit, flags);
    }
    flush_io();
    if (v == NULL) {
        Ty_CLEAR(main_module);
        TyErr_Print();
        goto done;
    }
    Ty_DECREF(v);
    ret = 0;

  done:
    if (set_file_name) {
        if (TyDict_PopString(dict, "__file__", NULL) < 0) {
            TyErr_Print();
        }
        if (TyDict_PopString(dict, "__cached__", NULL) < 0) {
            TyErr_Print();
        }
    }
    Ty_XDECREF(main_module);
    return ret;
}


int
TyRun_SimpleFileExFlags(FILE *fp, const char *filename, int closeit,
                        PyCompilerFlags *flags)
{
    TyObject *filename_obj = TyUnicode_DecodeFSDefault(filename);
    if (filename_obj == NULL) {
        return -1;
    }
    int res = _PyRun_SimpleFileObject(fp, filename_obj, closeit, flags);
    Ty_DECREF(filename_obj);
    return res;
}


int
_PyRun_SimpleStringFlagsWithName(const char *command, const char* name, PyCompilerFlags *flags) {
    TyObject *main_module = TyImport_AddModuleRef("__main__");
    if (main_module == NULL) {
        return -1;
    }
    TyObject *dict = TyModule_GetDict(main_module);  // borrowed ref

    TyObject *res = NULL;
    if (name == NULL) {
        res = TyRun_StringFlags(command, Ty_file_input, dict, dict, flags);
    } else {
        TyObject* the_name = TyUnicode_FromString(name);
        if (!the_name) {
            TyErr_Print();
            return -1;
        }
        res = _PyRun_StringFlagsWithName(command, the_name, Ty_file_input, dict, dict, flags, 0);
        Ty_DECREF(the_name);
    }
    Ty_DECREF(main_module);
    if (res == NULL) {
        TyErr_Print();
        return -1;
    }

    Ty_DECREF(res);
    return 0;
}

int
TyRun_SimpleStringFlags(const char *command, PyCompilerFlags *flags)
{
    return _PyRun_SimpleStringFlagsWithName(command, NULL, flags);
}

static int
parse_exit_code(TyObject *code, int *exitcode_p)
{
    if (TyLong_Check(code)) {
        // gh-125842: Use a long long to avoid an overflow error when `long`
        // is 32-bit. We still truncate the result to an int.
        int exitcode = (int)TyLong_AsLongLong(code);
        if (exitcode == -1 && TyErr_Occurred()) {
            // On overflow or other error, clear the exception and use -1
            // as the exit code to match historical Python behavior.
            TyErr_Clear();
            *exitcode_p = -1;
            return 1;
        }
        *exitcode_p = exitcode;
        return 1;
    }
    else if (code == Ty_None) {
        *exitcode_p = 0;
        return 1;
    }
    return 0;
}

int
_Ty_HandleSystemExitAndKeyboardInterrupt(int *exitcode_p)
{
    if (TyErr_ExceptionMatches(TyExc_KeyboardInterrupt)) {
        _Ty_atomic_store_int(&_PyRuntime.signals.unhandled_keyboard_interrupt, 1);
        return 0;
    }

    int inspect = _Ty_GetConfig()->inspect;
    if (inspect) {
        /* Don't exit if -i flag was given. This flag is set to 0
         * when entering interactive mode for inspecting. */
        return 0;
    }

    if (!TyErr_ExceptionMatches(TyExc_SystemExit)) {
        return 0;
    }

    fflush(stdout);

    TyObject *exc = TyErr_GetRaisedException();
    assert(exc != NULL && PyExceptionInstance_Check(exc));

    TyObject *code = PyObject_GetAttr(exc, &_Ty_ID(code));
    if (code == NULL) {
        // If the exception has no 'code' attribute, print the exception below
        TyErr_Clear();
    }
    else if (parse_exit_code(code, exitcode_p)) {
        Ty_DECREF(code);
        Ty_CLEAR(exc);
        return 1;
    }
    else {
        // If code is not an int or None, print it below
        Ty_SETREF(exc, code);
    }

    TyObject *sys_stderr;
    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &sys_stderr) < 0) {
        TyErr_Clear();
    }
    else if (sys_stderr != NULL && sys_stderr != Ty_None) {
        if (TyFile_WriteObject(exc, sys_stderr, Ty_PRINT_RAW) < 0) {
            TyErr_Clear();
        }
    }
    else {
        if (PyObject_Print(exc, stderr, Ty_PRINT_RAW) < 0) {
            TyErr_Clear();
        }
        fflush(stderr);
    }
    TySys_WriteStderr("\n");
    Ty_XDECREF(sys_stderr);
    Ty_CLEAR(exc);
    *exitcode_p = 1;
    return 1;
}


static void
handle_system_exit(void)
{
    int exitcode;
    if (_Ty_HandleSystemExitAndKeyboardInterrupt(&exitcode)) {
        Ty_Exit(exitcode);
    }
}


static void
_TyErr_PrintEx(TyThreadState *tstate, int set_sys_last_vars)
{
    TyObject *typ = NULL, *tb = NULL, *hook = NULL;
    handle_system_exit();

    TyObject *exc = _TyErr_GetRaisedException(tstate);
    if (exc == NULL) {
        goto done;
    }
    assert(PyExceptionInstance_Check(exc));
    typ = Ty_NewRef(Ty_TYPE(exc));
    tb = PyException_GetTraceback(exc);
    if (tb == NULL) {
        tb = Ty_NewRef(Ty_None);
    }

    if (set_sys_last_vars) {
        if (_TySys_SetAttr(&_Ty_ID(last_exc), exc) < 0) {
            _TyErr_Clear(tstate);
        }
        /* Legacy version: */
        if (_TySys_SetAttr(&_Ty_ID(last_type), typ) < 0) {
            _TyErr_Clear(tstate);
        }
        if (_TySys_SetAttr(&_Ty_ID(last_value), exc) < 0) {
            _TyErr_Clear(tstate);
        }
        if (_TySys_SetAttr(&_Ty_ID(last_traceback), tb) < 0) {
            _TyErr_Clear(tstate);
        }
    }
    if (_TySys_GetOptionalAttr(&_Ty_ID(excepthook), &hook) < 0) {
        TyErr_Clear();
    }
    if (_TySys_Audit(tstate, "sys.excepthook", "OOOO", hook ? hook : Ty_None,
                     typ, exc, tb) < 0) {
        if (TyErr_ExceptionMatches(TyExc_RuntimeError)) {
            TyErr_Clear();
            goto done;
        }
        TyErr_FormatUnraisable("Exception ignored in audit hook");
    }
    if (hook) {
        TyObject* args[3] = {typ, exc, tb};
        TyObject *result = PyObject_Vectorcall(hook, args, 3, NULL);
        if (result == NULL) {
            handle_system_exit();

            TyObject *exc2 = _TyErr_GetRaisedException(tstate);
            assert(exc2 && PyExceptionInstance_Check(exc2));
            fflush(stdout);
            TySys_WriteStderr("Error in sys.excepthook:\n");
            TyErr_DisplayException(exc2);
            TySys_WriteStderr("\nOriginal exception was:\n");
            TyErr_DisplayException(exc);
            Ty_DECREF(exc2);
        }
        else {
            Ty_DECREF(result);
        }
    }
    else {
        TySys_WriteStderr("sys.excepthook is missing\n");
        TyErr_DisplayException(exc);
    }

done:
    Ty_XDECREF(hook);
    Ty_XDECREF(typ);
    Ty_XDECREF(exc);
    Ty_XDECREF(tb);
}

void
_TyErr_Print(TyThreadState *tstate)
{
    _TyErr_PrintEx(tstate, 1);
}

void
TyErr_PrintEx(int set_sys_last_vars)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_PrintEx(tstate, set_sys_last_vars);
}

void
TyErr_Print(void)
{
    TyErr_PrintEx(1);
}

struct exception_print_context
{
    TyObject *file;
    TyObject *seen;            // Prevent cycles in recursion
};

static int
print_exception_invalid_type(struct exception_print_context *ctx,
                             TyObject *value)
{
    TyObject *f = ctx->file;
    const char *const msg = "TypeError: print_exception(): Exception expected "
                            "for value, ";
    if (TyFile_WriteString(msg, f) < 0) {
        return -1;
    }
    if (TyFile_WriteString(Ty_TYPE(value)->tp_name, f) < 0) {
        return -1;
    }
    if (TyFile_WriteString(" found\n", f) < 0) {
        return -1;
    }
    return 0;
}

static int
print_exception_traceback(struct exception_print_context *ctx, TyObject *value)
{
    TyObject *f = ctx->file;
    int err = 0;

    TyObject *tb = PyException_GetTraceback(value);
    if (tb && tb != Ty_None) {
        const char *header = EXCEPTION_TB_HEADER;
        err = _PyTraceBack_Print(tb, header, f);
    }
    Ty_XDECREF(tb);
    return err;
}

static int
print_exception_file_and_line(struct exception_print_context *ctx,
                              TyObject **value_p)
{
    TyObject *f = ctx->file;

    TyObject *tmp;
    int res = PyObject_GetOptionalAttr(*value_p, &_Ty_ID(print_file_and_line), &tmp);
    if (res <= 0) {
        if (res < 0) {
            TyErr_Clear();
        }
        return 0;
    }
    Ty_DECREF(tmp);

    TyObject *filename = NULL;
    Ty_ssize_t lineno = 0;
    TyObject* v = PyObject_GetAttr(*value_p, &_Ty_ID(filename));
    if (!v) {
        return -1;
    }
    if (v == Ty_None) {
        Ty_DECREF(v);
        _Ty_DECLARE_STR(anon_string, "<string>");
        filename = Ty_NewRef(&_Ty_STR(anon_string));
    }
    else {
        filename = v;
    }

    TyObject *line = TyUnicode_FromFormat("  File \"%S\", line %zd\n",
                                          filename, lineno);
    Ty_DECREF(filename);
    if (line == NULL) {
        goto error;
    }
    if (TyFile_WriteObject(line, f, Ty_PRINT_RAW) < 0) {
        goto error;
    }
    Ty_CLEAR(line);

    assert(!TyErr_Occurred());
    return 0;

error:
    Ty_XDECREF(line);
    return -1;
}

/* Prints the message line: module.qualname[: str(exc)] */
static int
print_exception_message(struct exception_print_context *ctx, TyObject *type,
                        TyObject *value)
{
    TyObject *f = ctx->file;

    if (TyErr_GivenExceptionMatches(value, TyExc_MemoryError)) {
        // The Python APIs in this function require allocating memory
        // for various objects. If we're out of memory, we can't do that,
        return -1;
    }

    assert(PyExceptionClass_Check(type));

    TyObject *modulename = PyObject_GetAttr(type, &_Ty_ID(__module__));
    if (modulename == NULL || !TyUnicode_Check(modulename)) {
        Ty_XDECREF(modulename);
        TyErr_Clear();
        if (TyFile_WriteString("<unknown>.", f) < 0) {
            return -1;
        }
    }
    else {
        if (!_TyUnicode_Equal(modulename, &_Ty_ID(builtins)) &&
            !_TyUnicode_Equal(modulename, &_Ty_ID(__main__)))
        {
            int res = TyFile_WriteObject(modulename, f, Ty_PRINT_RAW);
            Ty_DECREF(modulename);
            if (res < 0) {
                return -1;
            }
            if (TyFile_WriteString(".", f) < 0) {
                return -1;
            }
        }
        else {
            Ty_DECREF(modulename);
        }
    }

    TyObject *qualname = TyType_GetQualName((TyTypeObject *)type);
    if (qualname == NULL || !TyUnicode_Check(qualname)) {
        Ty_XDECREF(qualname);
        TyErr_Clear();
        if (TyFile_WriteString("<unknown>", f) < 0) {
            return -1;
        }
    }
    else {
        int res = TyFile_WriteObject(qualname, f, Ty_PRINT_RAW);
        Ty_DECREF(qualname);
        if (res < 0) {
            return -1;
        }
    }

    if (Ty_IsNone(value)) {
        return 0;
    }

    TyObject *s = PyObject_Str(value);
    if (s == NULL) {
        TyErr_Clear();
        if (TyFile_WriteString(": <exception str() failed>", f) < 0) {
            return -1;
        }
    }
    else {
        /* only print colon if the str() of the
           object is not the empty string
        */
        if (!TyUnicode_Check(s) || TyUnicode_GetLength(s) != 0) {
            if (TyFile_WriteString(": ", f) < 0) {
                Ty_DECREF(s);
                return -1;
            }
        }
        int res = TyFile_WriteObject(s, f, Ty_PRINT_RAW);
        Ty_DECREF(s);
        if (res < 0) {
            return -1;
        }
    }

    return 0;
}

static int
print_exception(struct exception_print_context *ctx, TyObject *value)
{
    TyObject *f = ctx->file;

    if (!PyExceptionInstance_Check(value)) {
        return print_exception_invalid_type(ctx, value);
    }

    Ty_INCREF(value);
    fflush(stdout);

    if (print_exception_traceback(ctx, value) < 0) {
        goto error;
    }

    /* grab the type and notes now because value can change below */
    TyObject *type = (TyObject *) Ty_TYPE(value);

    if (print_exception_file_and_line(ctx, &value) < 0) {
        goto error;
    }
    if (print_exception_message(ctx, type, value) < 0) {
        goto error;
    }
    if (TyFile_WriteString("\n", f) < 0) {
        goto error;
    }
    Ty_DECREF(value);
    assert(!TyErr_Occurred());
    return 0;
error:
    Ty_DECREF(value);
    return -1;
}

static const char cause_message[] =
    "The above exception was the direct cause "
    "of the following exception:\n";

static const char context_message[] =
    "During handling of the above exception, "
    "another exception occurred:\n";

static int
print_exception_recursive(struct exception_print_context*, TyObject*);

static int
print_chained(struct exception_print_context* ctx, TyObject *value,
              const char * message, const char *tag)
{
    TyObject *f = ctx->file;
    if (_Ty_EnterRecursiveCall(" in print_chained")) {
        return -1;
    }
    int res = print_exception_recursive(ctx, value);
    _Ty_LeaveRecursiveCall();
    if (res < 0) {
        return -1;
    }

    if (TyFile_WriteString("\n", f) < 0) {
        return -1;
    }
    if (TyFile_WriteString(message, f) < 0) {
        return -1;
    }
    if (TyFile_WriteString("\n", f) < 0) {
        return -1;
    }
    return 0;
}

/* Return true if value is in seen or there was a lookup error.
 * Return false if lookup succeeded and the item was not found.
 * We suppress errors because this makes us err on the side of
 * under-printing which is better than over-printing irregular
 * exceptions (e.g., unhashable ones).
 */
static bool
print_exception_seen_lookup(struct exception_print_context *ctx,
                            TyObject *value)
{
    TyObject *check_id = TyLong_FromVoidPtr(value);
    if (check_id == NULL) {
        TyErr_Clear();
        return true;
    }

    int in_seen = TySet_Contains(ctx->seen, check_id);
    Ty_DECREF(check_id);
    if (in_seen == -1) {
        TyErr_Clear();
        return true;
    }

    if (in_seen == 1) {
        /* value is in seen */
        return true;
    }
    return false;
}

static int
print_exception_cause_and_context(struct exception_print_context *ctx,
                                  TyObject *value)
{
    TyObject *value_id = TyLong_FromVoidPtr(value);
    if (value_id == NULL || TySet_Add(ctx->seen, value_id) == -1) {
        TyErr_Clear();
        Ty_XDECREF(value_id);
        return 0;
    }
    Ty_DECREF(value_id);

    if (!PyExceptionInstance_Check(value)) {
        return 0;
    }

    TyObject *cause = PyException_GetCause(value);
    if (cause) {
        int err = 0;
        if (!print_exception_seen_lookup(ctx, cause)) {
            err = print_chained(ctx, cause, cause_message, "cause");
        }
        Ty_DECREF(cause);
        return err;
    }
    if (((TyBaseExceptionObject *)value)->suppress_context) {
        return 0;
    }
    TyObject *context = PyException_GetContext(value);
    if (context) {
        int err = 0;
        if (!print_exception_seen_lookup(ctx, context)) {
            err = print_chained(ctx, context, context_message, "context");
        }
        Ty_DECREF(context);
        return err;
    }
    return 0;
}

static int
print_exception_recursive(struct exception_print_context *ctx, TyObject *value)
{
    if (_Ty_EnterRecursiveCall(" in print_exception_recursive")) {
        return -1;
    }
    if (ctx->seen != NULL) {
        /* Exception chaining */
        if (print_exception_cause_and_context(ctx, value) < 0) {
            goto error;
        }
    }
    if (print_exception(ctx, value) < 0) {
        goto error;
    }
    assert(!TyErr_Occurred());

    _Ty_LeaveRecursiveCall();
    return 0;
error:
    _Ty_LeaveRecursiveCall();
    return -1;
}

void
_TyErr_Display(TyObject *file, TyObject *unused, TyObject *value, TyObject *tb)
{
    assert(value != NULL);
    assert(file != NULL && file != Ty_None);
    if (PyExceptionInstance_Check(value)
        && tb != NULL && PyTraceBack_Check(tb)) {
        /* Put the traceback on the exception, otherwise it won't get
           displayed.  See issue #18776. */
        TyObject *cur_tb = PyException_GetTraceback(value);
        if (cur_tb == NULL) {
            PyException_SetTraceback(value, tb);
        }
        else {
            Ty_DECREF(cur_tb);
        }
    }

    // Try first with the stdlib traceback module
    TyObject *print_exception_fn = TyImport_ImportModuleAttrString(
        "traceback",
        "_print_exception_bltin");
    if (print_exception_fn == NULL || !PyCallable_Check(print_exception_fn)) {
        goto fallback;
    }

    TyObject* result = PyObject_CallOneArg(print_exception_fn, value);

    Ty_XDECREF(print_exception_fn);
    if (result) {
        Ty_DECREF(result);
        return;
    }
fallback:
#ifdef Ty_DEBUG
     if (TyErr_Occurred()) {
         TyErr_FormatUnraisable(
             "Exception ignored in the internal traceback machinery");
     }
#endif
    TyErr_Clear();
    struct exception_print_context ctx;
    ctx.file = file;

    /* We choose to ignore seen being possibly NULL, and report
       at least the main exception (it could be a MemoryError).
    */
    ctx.seen = TySet_New(NULL);
    if (ctx.seen == NULL) {
        TyErr_Clear();
    }
    if (print_exception_recursive(&ctx, value) < 0) {
        TyErr_Clear();
        _TyObject_Dump(value);
        fprintf(stderr, "lost sys.stderr\n");
    }
    Ty_XDECREF(ctx.seen);

    /* Call file.flush() */
    if (_PyFile_Flush(file) < 0) {
        /* Silently ignore file.flush() error */
        TyErr_Clear();
    }
}

void
TyErr_Display(TyObject *unused, TyObject *value, TyObject *tb)
{
    TyObject *file;
    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &file) < 0) {
        TyObject *exc = TyErr_GetRaisedException();
        _TyObject_Dump(value);
        fprintf(stderr, "lost sys.stderr\n");
        _TyObject_Dump(exc);
        Ty_DECREF(exc);
        return;
    }
    if (file == NULL) {
        _TyObject_Dump(value);
        fprintf(stderr, "lost sys.stderr\n");
        return;
    }
    if (file == Ty_None) {
        Ty_DECREF(file);
        return;
    }
    _TyErr_Display(file, NULL, value, tb);
    Ty_DECREF(file);
}

void _TyErr_DisplayException(TyObject *file, TyObject *exc)
{
    _TyErr_Display(file, NULL, exc, NULL);
}

void TyErr_DisplayException(TyObject *exc)
{
    TyErr_Display(NULL, exc, NULL);
}

static TyObject *
_PyRun_StringFlagsWithName(const char *str, TyObject* name, int start,
                           TyObject *globals, TyObject *locals, PyCompilerFlags *flags,
                           int generate_new_source)
{
    TyObject *ret = NULL;
    mod_ty mod;
    PyArena *arena;

    arena = _TyArena_New();
    if (arena == NULL)
        return NULL;

    TyObject* source = NULL;
    _Ty_DECLARE_STR(anon_string, "<string>");

    if (name) {
        source = TyUnicode_FromString(str);
        if (!source) {
            TyErr_Clear();
        }
    } else {
        name = &_Ty_STR(anon_string);
    }

    mod = _TyParser_ASTFromString(str, name, start, flags, arena);

   if (mod != NULL) {
        ret = run_mod(mod, name, globals, locals, flags, arena, source, generate_new_source);
    }
    Ty_XDECREF(source);
    _TyArena_Free(arena);
    return ret;
}


TyObject *
TyRun_StringFlags(const char *str, int start, TyObject *globals,
                     TyObject *locals, PyCompilerFlags *flags) {

    return _PyRun_StringFlagsWithName(str, NULL, start, globals, locals, flags, 0);
}

static TyObject *
pyrun_file(FILE *fp, TyObject *filename, int start, TyObject *globals,
           TyObject *locals, int closeit, PyCompilerFlags *flags)
{
    PyArena *arena = _TyArena_New();
    if (arena == NULL) {
        return NULL;
    }

    mod_ty mod;
    mod = _TyParser_ASTFromFile(fp, filename, NULL, start, NULL, NULL,
                                flags, NULL, arena);

    if (closeit) {
        fclose(fp);
    }

    TyObject *ret;
    if (mod != NULL) {
        ret = run_mod(mod, filename, globals, locals, flags, arena, NULL, 0);
    }
    else {
        ret = NULL;
    }
    _TyArena_Free(arena);

    return ret;
}


TyObject *
TyRun_FileExFlags(FILE *fp, const char *filename, int start, TyObject *globals,
                  TyObject *locals, int closeit, PyCompilerFlags *flags)
{
    TyObject *filename_obj = TyUnicode_DecodeFSDefault(filename);
    if (filename_obj == NULL) {
        return NULL;
    }

    TyObject *res = pyrun_file(fp, filename_obj, start, globals,
                               locals, closeit, flags);
    Ty_DECREF(filename_obj);
    return res;

}

static void
flush_io_stream(TyThreadState *tstate, TyObject *name)
{
    TyObject *f;
    if (_TySys_GetOptionalAttr(name, &f) < 0) {
        TyErr_Clear();
    }
    if (f != NULL) {
        if (_PyFile_Flush(f) < 0) {
            TyErr_Clear();
        }
        Ty_DECREF(f);
    }
}

static void
flush_io(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    flush_io_stream(tstate, &_Ty_ID(stderr));
    flush_io_stream(tstate, &_Ty_ID(stdout));
    _TyErr_SetRaisedException(tstate, exc);
}

static TyObject *
run_eval_code_obj(TyThreadState *tstate, PyCodeObject *co, TyObject *globals, TyObject *locals)
{
    /* Set globals['__builtins__'] if it doesn't exist */
    if (!globals || !TyDict_Check(globals)) {
        TyErr_SetString(TyExc_SystemError, "globals must be a real dict");
        return NULL;
    }
    int has_builtins = TyDict_ContainsString(globals, "__builtins__");
    if (has_builtins < 0) {
        return NULL;
    }
    if (!has_builtins) {
        if (TyDict_SetItemString(globals, "__builtins__",
                                 tstate->interp->builtins) < 0)
        {
            return NULL;
        }
    }

    return TyEval_EvalCode((TyObject*)co, globals, locals);
}

static TyObject *
run_mod(mod_ty mod, TyObject *filename, TyObject *globals, TyObject *locals,
            PyCompilerFlags *flags, PyArena *arena, TyObject* interactive_src,
            int generate_new_source)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject* interactive_filename = filename;
    if (interactive_src) {
        TyInterpreterState *interp = tstate->interp;
        if (generate_new_source) {
            interactive_filename = TyUnicode_FromFormat(
                "%U-%d", filename, interp->_interactive_src_count++);
        } else {
            Ty_INCREF(interactive_filename);
        }
        if (interactive_filename == NULL) {
            return NULL;
        }
    }

    PyCodeObject *co = _TyAST_Compile(mod, interactive_filename, flags, -1, arena);
    if (co == NULL) {
        if (interactive_src) {
            Ty_DECREF(interactive_filename);
        }
        return NULL;
    }

    if (interactive_src) {
        TyObject *print_tb_func = TyImport_ImportModuleAttrString(
            "linecache",
            "_register_code");
        if (print_tb_func == NULL) {
            Ty_DECREF(co);
            Ty_DECREF(interactive_filename);
            return NULL;
        }

        if (!PyCallable_Check(print_tb_func)) {
            Ty_DECREF(co);
            Ty_DECREF(interactive_filename);
            Ty_DECREF(print_tb_func);
            TyErr_SetString(TyExc_ValueError, "linecache._register_code is not callable");
            return NULL;
        }

        TyObject* result = PyObject_CallFunction(
            print_tb_func, "OOO",
            co,
            interactive_src,
            filename
        );

        Ty_DECREF(interactive_filename);

        Ty_XDECREF(print_tb_func);
        Ty_XDECREF(result);
        if (!result) {
            Ty_DECREF(co);
            return NULL;
        }
    }

    if (_TySys_Audit(tstate, "exec", "O", co) < 0) {
        Ty_DECREF(co);
        return NULL;
    }

    TyObject *v = run_eval_code_obj(tstate, co, globals, locals);
    Ty_DECREF(co);
    return v;
}

static TyObject *
run_pyc_file(FILE *fp, TyObject *globals, TyObject *locals,
             PyCompilerFlags *flags)
{
    TyThreadState *tstate = _TyThreadState_GET();
    PyCodeObject *co;
    TyObject *v;
    long magic;
    long TyImport_GetMagicNumber(void);

    magic = TyMarshal_ReadLongFromFile(fp);
    if (magic != TyImport_GetMagicNumber()) {
        if (!TyErr_Occurred())
            TyErr_SetString(TyExc_RuntimeError,
                       "Bad magic number in .pyc file");
        goto error;
    }
    /* Skip the rest of the header. */
    (void) TyMarshal_ReadLongFromFile(fp);
    (void) TyMarshal_ReadLongFromFile(fp);
    (void) TyMarshal_ReadLongFromFile(fp);
    if (TyErr_Occurred()) {
        goto error;
    }
    v = TyMarshal_ReadLastObjectFromFile(fp);
    if (v == NULL || !TyCode_Check(v)) {
        Ty_XDECREF(v);
        TyErr_SetString(TyExc_RuntimeError,
                   "Bad code object in .pyc file");
        goto error;
    }
    fclose(fp);
    co = (PyCodeObject *)v;
    v = run_eval_code_obj(tstate, co, globals, locals);
    if (v && flags)
        flags->cf_flags |= (co->co_flags & PyCF_MASK);
    Ty_DECREF(co);
    return v;
error:
    fclose(fp);
    return NULL;
}

TyObject *
Ty_CompileStringObject(const char *str, TyObject *filename, int start,
                       PyCompilerFlags *flags, int optimize)
{
    PyCodeObject *co;
    mod_ty mod;
    PyArena *arena = _TyArena_New();
    if (arena == NULL)
        return NULL;

    mod = _TyParser_ASTFromString(str, filename, start, flags, arena);
    if (mod == NULL) {
        _TyArena_Free(arena);
        return NULL;
    }
    if (flags && (flags->cf_flags & PyCF_ONLY_AST)) {
        int syntax_check_only = ((flags->cf_flags & PyCF_OPTIMIZED_AST) == PyCF_ONLY_AST); /* unoptiomized AST */
        if (_PyCompile_AstPreprocess(mod, filename, flags, optimize, arena, syntax_check_only) < 0) {
            _TyArena_Free(arena);
            return NULL;
        }
        TyObject *result = TyAST_mod2obj(mod);
        _TyArena_Free(arena);
        return result;
    }
    co = _TyAST_Compile(mod, filename, flags, optimize, arena);
    _TyArena_Free(arena);
    return (TyObject *)co;
}

TyObject *
Ty_CompileStringExFlags(const char *str, const char *filename_str, int start,
                        PyCompilerFlags *flags, int optimize)
{
    TyObject *filename, *co;
    filename = TyUnicode_DecodeFSDefault(filename_str);
    if (filename == NULL)
        return NULL;
    co = Ty_CompileStringObject(str, filename, start, flags, optimize);
    Ty_DECREF(filename);
    return co;
}

int
_TyObject_SupportedAsScript(TyObject *cmd)
{
    if (TyUnicode_Check(cmd)) {
        return 1;
    }
    else if (TyBytes_Check(cmd)) {
        return 1;
    }
    else if (TyByteArray_Check(cmd)) {
        return 1;
    }
    else if (PyObject_CheckBuffer(cmd)) {
        return 1;
    }
    else {
        return 0;
    }
}

const char *
_Ty_SourceAsString(TyObject *cmd, const char *funcname, const char *what, PyCompilerFlags *cf, TyObject **cmd_copy)
{
    const char *str;
    Ty_ssize_t size;
    Ty_buffer view;

    *cmd_copy = NULL;
    if (TyUnicode_Check(cmd)) {
        cf->cf_flags |= PyCF_IGNORE_COOKIE;
        str = TyUnicode_AsUTF8AndSize(cmd, &size);
        if (str == NULL)
            return NULL;
    }
    else if (TyBytes_Check(cmd)) {
        str = TyBytes_AS_STRING(cmd);
        size = TyBytes_GET_SIZE(cmd);
    }
    else if (TyByteArray_Check(cmd)) {
        str = TyByteArray_AS_STRING(cmd);
        size = TyByteArray_GET_SIZE(cmd);
    }
    else if (PyObject_GetBuffer(cmd, &view, PyBUF_SIMPLE) == 0) {
        /* Copy to NUL-terminated buffer. */
        *cmd_copy = TyBytes_FromStringAndSize(
            (const char *)view.buf, view.len);
        PyBuffer_Release(&view);
        if (*cmd_copy == NULL) {
            return NULL;
        }
        str = TyBytes_AS_STRING(*cmd_copy);
        size = TyBytes_GET_SIZE(*cmd_copy);
    }
    else {
        TyErr_Format(TyExc_TypeError,
            "%s() arg 1 must be a %s object",
            funcname, what);
        return NULL;
    }

    if (strlen(str) != (size_t)size) {
        TyErr_SetString(TyExc_SyntaxError,
            "source code string cannot contain null bytes");
        Ty_CLEAR(*cmd_copy);
        return NULL;
    }
    return str;
}

#if defined(USE_STACKCHECK)

/* Stack checking */

/*
 * Return non-zero when we run out of memory on the stack; zero otherwise.
 */
int
TyOS_CheckStack(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _Ty_ReachedRecursionLimit(tstate);
}

#endif /* USE_STACKCHECK */

/* Deprecated C API functions still provided for binary compatibility */

#undef TyRun_AnyFile
PyAPI_FUNC(int)
TyRun_AnyFile(FILE *fp, const char *name)
{
    return TyRun_AnyFileExFlags(fp, name, 0, NULL);
}

#undef TyRun_AnyFileEx
PyAPI_FUNC(int)
TyRun_AnyFileEx(FILE *fp, const char *name, int closeit)
{
    return TyRun_AnyFileExFlags(fp, name, closeit, NULL);
}

#undef TyRun_AnyFileFlags
PyAPI_FUNC(int)
TyRun_AnyFileFlags(FILE *fp, const char *name, PyCompilerFlags *flags)
{
    return TyRun_AnyFileExFlags(fp, name, 0, flags);
}

#undef TyRun_File
PyAPI_FUNC(TyObject *)
TyRun_File(FILE *fp, const char *p, int s, TyObject *g, TyObject *l)
{
    return TyRun_FileExFlags(fp, p, s, g, l, 0, NULL);
}

#undef TyRun_FileEx
PyAPI_FUNC(TyObject *)
TyRun_FileEx(FILE *fp, const char *p, int s, TyObject *g, TyObject *l, int c)
{
    return TyRun_FileExFlags(fp, p, s, g, l, c, NULL);
}

#undef TyRun_FileFlags
PyAPI_FUNC(TyObject *)
TyRun_FileFlags(FILE *fp, const char *p, int s, TyObject *g, TyObject *l,
                PyCompilerFlags *flags)
{
    return TyRun_FileExFlags(fp, p, s, g, l, 0, flags);
}

#undef TyRun_SimpleFile
PyAPI_FUNC(int)
TyRun_SimpleFile(FILE *f, const char *p)
{
    return TyRun_SimpleFileExFlags(f, p, 0, NULL);
}

#undef TyRun_SimpleFileEx
PyAPI_FUNC(int)
TyRun_SimpleFileEx(FILE *f, const char *p, int c)
{
    return TyRun_SimpleFileExFlags(f, p, c, NULL);
}


#undef TyRun_String
PyAPI_FUNC(TyObject *)
TyRun_String(const char *str, int s, TyObject *g, TyObject *l)
{
    return TyRun_StringFlags(str, s, g, l, NULL);
}

#undef TyRun_SimpleString
PyAPI_FUNC(int)
TyRun_SimpleString(const char *s)
{
    return TyRun_SimpleStringFlags(s, NULL);
}

#undef Ty_CompileString
PyAPI_FUNC(TyObject *)
Ty_CompileString(const char *str, const char *p, int s)
{
    return Ty_CompileStringExFlags(str, p, s, NULL, -1);
}

#undef Ty_CompileStringFlags
PyAPI_FUNC(TyObject *)
Ty_CompileStringFlags(const char *str, const char *p, int s,
                      PyCompilerFlags *flags)
{
    return Ty_CompileStringExFlags(str, p, s, flags, -1);
}

#undef TyRun_InteractiveOne
PyAPI_FUNC(int)
TyRun_InteractiveOne(FILE *f, const char *p)
{
    return TyRun_InteractiveOneFlags(f, p, NULL);
}

#undef TyRun_InteractiveLoop
PyAPI_FUNC(int)
TyRun_InteractiveLoop(FILE *f, const char *p)
{
    return TyRun_InteractiveLoopFlags(f, p, NULL);
}
