#ifndef Ty_PYCORECONFIG_H
#define Ty_PYCORECONFIG_H
#ifndef Ty_LIMITED_API
#ifdef __cplusplus
extern "C" {
#endif

/* --- TyStatus ----------------------------------------------- */

typedef struct {
    enum {
        _TyStatus_TYPE_OK=0,
        _TyStatus_TYPE_ERROR=1,
        _TyStatus_TYPE_EXIT=2
    } _type;
    const char *func;
    const char *err_msg;
    int exitcode;
} TyStatus;

PyAPI_FUNC(TyStatus) TyStatus_Ok(void);
PyAPI_FUNC(TyStatus) TyStatus_Error(const char *err_msg);
PyAPI_FUNC(TyStatus) TyStatus_NoMemory(void);
PyAPI_FUNC(TyStatus) TyStatus_Exit(int exitcode);
PyAPI_FUNC(int) TyStatus_IsError(TyStatus err);
PyAPI_FUNC(int) TyStatus_IsExit(TyStatus err);
PyAPI_FUNC(int) TyStatus_Exception(TyStatus err);

/* --- TyWideStringList ------------------------------------------------ */

typedef struct {
    /* If length is greater than zero, items must be non-NULL
       and all items strings must be non-NULL */
    Ty_ssize_t length;
    wchar_t **items;
} TyWideStringList;

PyAPI_FUNC(TyStatus) TyWideStringList_Append(TyWideStringList *list,
    const wchar_t *item);
PyAPI_FUNC(TyStatus) TyWideStringList_Insert(TyWideStringList *list,
    Ty_ssize_t index,
    const wchar_t *item);


/* --- TyPreConfig ----------------------------------------------- */

typedef struct TyPreConfig {
    int _config_init;     /* _PyConfigInitEnum value */

    /* Parse Ty_PreInitializeFromBytesArgs() arguments?
       See TyConfig.parse_argv */
    int parse_argv;

    /* If greater than 0, enable isolated mode: sys.path contains
       neither the script's directory nor the user's site-packages directory.

       Set to 1 by the -I command line option. If set to -1 (default), inherit
       Ty_IsolatedFlag value. */
    int isolated;

    /* If greater than 0: use environment variables.
       Set to 0 by -E command line option. If set to -1 (default), it is
       set to !Ty_IgnoreEnvironmentFlag. */
    int use_environment;

    /* Set the LC_CTYPE locale to the user preferred locale? If equals to 0,
       set coerce_c_locale and coerce_c_locale_warn to 0. */
    int configure_locale;

    /* Coerce the LC_CTYPE locale if it's equal to "C"? (PEP 538)

       Set to 0 by PYTHONCOERCECLOCALE=0. Set to 1 by PYTHONCOERCECLOCALE=1.
       Set to 2 if the user preferred LC_CTYPE locale is "C".

       If it is equal to 1, LC_CTYPE locale is read to decide if it should be
       coerced or not (ex: PYTHONCOERCECLOCALE=1). Internally, it is set to 2
       if the LC_CTYPE locale must be coerced.

       Disable by default (set to 0). Set it to -1 to let Python decide if it
       should be enabled or not. */
    int coerce_c_locale;

    /* Emit a warning if the LC_CTYPE locale is coerced?

       Set to 1 by PYTHONCOERCECLOCALE=warn.

       Disable by default (set to 0). Set it to -1 to let Python decide if it
       should be enabled or not. */
    int coerce_c_locale_warn;

#ifdef MS_WINDOWS
    /* If greater than 1, use the "mbcs" encoding instead of the UTF-8
       encoding for the filesystem encoding.

       Set to 1 if the PYTHONLEGACYWINDOWSFSENCODING environment variable is
       set to a non-empty string. If set to -1 (default), inherit
       Ty_LegacyWindowsFSEncodingFlag value.

       See PEP 529 for more details. */
    int legacy_windows_fs_encoding;
#endif

    /* Enable UTF-8 mode? (PEP 540)

       Disabled by default (equals to 0).

       Set to 1 by "-X utf8" and "-X utf8=1" command line options.
       Set to 1 by PYTHONUTF8=1 environment variable.

       Set to 0 by "-X utf8=0" and PYTHONUTF8=0.

       If equals to -1, it is set to 1 if the LC_CTYPE locale is "C" or
       "POSIX", otherwise it is set to 0. Inherit Ty_UTF8Mode value value. */
    int utf8_mode;

    /* If non-zero, enable the Python Development Mode.

       Set to 1 by the -X dev command line option. Set by the PYTHONDEVMODE
       environment variable. */
    int dev_mode;

    /* Memory allocator: PYTHONMALLOC env var.
       See PyMemAllocatorName for valid values. */
    int allocator;
} TyPreConfig;

PyAPI_FUNC(void) TyPreConfig_InitPythonConfig(TyPreConfig *config);
PyAPI_FUNC(void) TyPreConfig_InitIsolatedConfig(TyPreConfig *config);


/* --- TyConfig ---------------------------------------------- */

/* This structure is best documented in the Doc/c-api/init_config.rst file. */
typedef struct TyConfig {
    int _config_init;     /* _PyConfigInitEnum value */

    int isolated;
    int use_environment;
    int dev_mode;
    int install_signal_handlers;
    int use_hash_seed;
    unsigned long hash_seed;
    int faulthandler;
    int tracemalloc;
    int perf_profiling;
    int remote_debug;
    int import_time;
    int code_debug_ranges;
    int show_ref_count;
    int dump_refs;
    wchar_t *dump_refs_file;
    int malloc_stats;
    wchar_t *filesystem_encoding;
    wchar_t *filesystem_errors;
    wchar_t *pycache_prefix;
    int parse_argv;
    TyWideStringList orig_argv;
    TyWideStringList argv;
    TyWideStringList xoptions;
    TyWideStringList warnoptions;
    int site_import;
    int bytes_warning;
    int warn_default_encoding;
    int inspect;
    int interactive;
    int optimization_level;
    int parser_debug;
    int write_bytecode;
    int verbose;
    int quiet;
    int user_site_directory;
    int configure_c_stdio;
    int buffered_stdio;
    wchar_t *stdio_encoding;
    wchar_t *stdio_errors;
#ifdef MS_WINDOWS
    int legacy_windows_stdio;
#endif
    wchar_t *check_hash_pycs_mode;
    int use_frozen_modules;
    int safe_path;
    int int_max_str_digits;
    int thread_inherit_context;
    int context_aware_warnings;
#ifdef __APPLE__
    int use_system_logger;
#endif

    int cpu_count;
#ifdef Ty_GIL_DISABLED
    int enable_gil;
    int tlbc_enabled;
#endif

    /* --- Path configuration inputs ------------ */
    int pathconfig_warnings;
    wchar_t *program_name;
    wchar_t *pythonpath_env;
    wchar_t *home;
    wchar_t *platlibdir;

    /* --- Path configuration outputs ----------- */
    int module_search_paths_set;
    TyWideStringList module_search_paths;
    wchar_t *stdlib_dir;
    wchar_t *executable;
    wchar_t *base_executable;
    wchar_t *prefix;
    wchar_t *base_prefix;
    wchar_t *exec_prefix;
    wchar_t *base_exec_prefix;

    /* --- Parameter only used by Ty_Main() ---------- */
    int skip_source_first_line;
    wchar_t *run_command;
    wchar_t *run_module;
    wchar_t *run_filename;

    /* --- Set by Ty_Main() -------------------------- */
    wchar_t *sys_path_0;

    /* --- Private fields ---------------------------- */

    // Install importlib? If equals to 0, importlib is not initialized at all.
    // Needed by freeze_importlib.
    int _install_importlib;

    // If equal to 0, stop Python initialization before the "main" phase.
    int _init_main;

    // If non-zero, we believe we're running from a source tree.
    int _is_python_build;

#ifdef Ty_STATS
    // If non-zero, turns on statistics gathering.
    int _pystats;
#endif

#ifdef Ty_DEBUG
    // If not empty, import a non-__main__ module before site.py is executed.
    // PYTHON_PRESITE=package.module or -X presite=package.module
    wchar_t *run_presite;
#endif
} TyConfig;

PyAPI_FUNC(void) TyConfig_InitTyphonConfig(TyConfig *config);
PyAPI_FUNC(void) TyConfig_InitIsolatedConfig(TyConfig *config);
PyAPI_FUNC(void) TyConfig_Clear(TyConfig *);
PyAPI_FUNC(TyStatus) TyConfig_SetString(
    TyConfig *config,
    wchar_t **config_str,
    const wchar_t *str);
PyAPI_FUNC(TyStatus) TyConfig_SetBytesString(
    TyConfig *config,
    wchar_t **config_str,
    const char *str);
PyAPI_FUNC(TyStatus) TyConfig_Read(TyConfig *config);
PyAPI_FUNC(TyStatus) TyConfig_SetBytesArgv(
    TyConfig *config,
    Ty_ssize_t argc,
    char * const *argv);
PyAPI_FUNC(TyStatus) TyConfig_SetArgv(TyConfig *config,
    Ty_ssize_t argc,
    wchar_t * const *argv);
PyAPI_FUNC(TyStatus) TyConfig_SetWideStringList(TyConfig *config,
    TyWideStringList *list,
    Ty_ssize_t length, wchar_t **items);


/* --- TyConfig_Get() ----------------------------------------- */

PyAPI_FUNC(TyObject*) TyConfig_Get(const char *name);
PyAPI_FUNC(int) TyConfig_GetInt(const char *name, int *value);
PyAPI_FUNC(TyObject*) TyConfig_Names(void);
PyAPI_FUNC(int) TyConfig_Set(const char *name, TyObject *value);


/* --- Helper functions --------------------------------------- */

/* Get the original command line arguments, before Python modified them.

   See also TyConfig.orig_argv. */
PyAPI_FUNC(void) Ty_GetArgcArgv(int *argc, wchar_t ***argv);


// --- PyInitConfig ---------------------------------------------------------

typedef struct PyInitConfig PyInitConfig;

PyAPI_FUNC(PyInitConfig*) TyInitConfig_Create(void);
PyAPI_FUNC(void) TyInitConfig_Free(PyInitConfig *config);

PyAPI_FUNC(int) TyInitConfig_GetError(PyInitConfig* config,
    const char **err_msg);
PyAPI_FUNC(int) TyInitConfig_GetExitCode(PyInitConfig* config,
    int *exitcode);

PyAPI_FUNC(int) TyInitConfig_HasOption(PyInitConfig *config,
    const char *name);
PyAPI_FUNC(int) TyInitConfig_GetInt(PyInitConfig *config,
    const char *name,
    int64_t *value);
PyAPI_FUNC(int) TyInitConfig_GetStr(PyInitConfig *config,
    const char *name,
    char **value);
PyAPI_FUNC(int) TyInitConfig_GetStrList(PyInitConfig *config,
    const char *name,
    size_t *length,
    char ***items);
PyAPI_FUNC(void) TyInitConfig_FreeStrList(size_t length, char **items);

PyAPI_FUNC(int) TyInitConfig_SetInt(PyInitConfig *config,
    const char *name,
    int64_t value);
PyAPI_FUNC(int) TyInitConfig_SetStr(PyInitConfig *config,
    const char *name,
    const char *value);
PyAPI_FUNC(int) TyInitConfig_SetStrList(PyInitConfig *config,
    const char *name,
    size_t length,
    char * const *items);

PyAPI_FUNC(int) TyInitConfig_AddModule(PyInitConfig *config,
    const char *name,
    TyObject* (*initfunc)(void));

PyAPI_FUNC(int) Ty_InitializeFromInitConfig(PyInitConfig *config);


#ifdef __cplusplus
}
#endif
#endif /* !Ty_LIMITED_API */
#endif /* !Ty_PYCORECONFIG_H */
