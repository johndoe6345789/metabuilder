#include "Python.h"
#include "pycore_fileutils.h"     // _Ty_HasFileSystemDefaultEncodeErrors
#include "pycore_getopt.h"        // _TyOS_GetOpt()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_interp.h"        // _PyInterpreterState.runtime
#include "pycore_long.h"          // _PY_LONG_MAX_STR_DIGITS_THRESHOLD
#include "pycore_pathconfig.h"    // _Ty_path_config
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_pylifecycle.h"   // _Ty_PreInitializeFromConfig()
#include "pycore_pymem.h"         // _TyMem_DefaultRawMalloc()
#include "pycore_pyhash.h"        // _Ty_HashSecret
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_pystats.h"       // _Ty_StatsOn()
#include "pycore_sysmodule.h"     // _TySys_SetIntMaxStrDigits()

#include "osdefs.h"               // DELIM

#include <locale.h>               // setlocale()
#include <stdlib.h>               // getenv()
#if defined(MS_WINDOWS) || defined(__CYGWIN__)
#  ifdef HAVE_IO_H
#    include <io.h>
#  endif
#  ifdef HAVE_FCNTL_H
#    include <fcntl.h>            // O_BINARY
#  endif
#endif

#ifdef __APPLE__
/* Enable system log by default on non-macOS Apple platforms */
#  if defined(TARGET_OS_IPHONE) && TARGET_OS_IPHONE
#define USE_SYSTEM_LOGGER_DEFAULT 1;
#  else
#define USE_SYSTEM_LOGGER_DEFAULT 0;
#  endif
#endif

#include "config_common.h"

/* --- TyConfig setters ------------------------------------------- */

typedef TyObject* (*config_sys_flag_setter) (int value);

static TyObject*
config_sys_flag_long(int value)
{
    return TyLong_FromLong(value);
}

static TyObject*
config_sys_flag_not(int value)
{
    value = (!value);
    return config_sys_flag_long(value);
}

/* --- TyConfig spec ---------------------------------------------- */

typedef enum {
    TyConfig_MEMBER_INT = 0,
    TyConfig_MEMBER_UINT = 1,
    TyConfig_MEMBER_ULONG = 2,
    TyConfig_MEMBER_BOOL = 3,

    TyConfig_MEMBER_WSTR = 10,
    TyConfig_MEMBER_WSTR_OPT = 11,
    TyConfig_MEMBER_WSTR_LIST = 12,
} PyConfigMemberType;

typedef enum {
    // Option which cannot be get or set by TyConfig_Get() and TyConfig_Set()
    TyConfig_MEMBER_INIT_ONLY = 0,

    // Option which cannot be set by TyConfig_Set()
    TyConfig_MEMBER_READ_ONLY = 1,

    // Public option: can be get and set by TyConfig_Get() and TyConfig_Set()
    TyConfig_MEMBER_PUBLIC = 2,
} PyConfigMemberVisibility;

typedef struct {
    const char *attr;
    int flag_index;
    config_sys_flag_setter flag_setter;
} PyConfigSysSpec;

typedef struct {
    const char *name;
    size_t offset;
    PyConfigMemberType type;
    PyConfigMemberVisibility visibility;
    PyConfigSysSpec sys;
} PyConfigSpec;

#define SPEC(MEMBER, TYPE, VISIBILITY, sys) \
    {#MEMBER, offsetof(TyConfig, MEMBER), \
     TyConfig_MEMBER_##TYPE, TyConfig_MEMBER_##VISIBILITY, sys}

#define SYS_ATTR(name) {name, -1, NULL}
#define SYS_FLAG_SETTER(index, setter) {NULL, index, setter}
#define SYS_FLAG(index) SYS_FLAG_SETTER(index, NULL)
#define NO_SYS SYS_ATTR(NULL)

// Update _test_embed_set_config when adding new members
static const PyConfigSpec PYCONFIG_SPEC[] = {
    // --- Public options -----------

    SPEC(argv, WSTR_LIST, PUBLIC, SYS_ATTR("argv")),
    SPEC(base_exec_prefix, WSTR_OPT, PUBLIC, SYS_ATTR("base_exec_prefix")),
    SPEC(base_executable, WSTR_OPT, PUBLIC, SYS_ATTR("_base_executable")),
    SPEC(base_prefix, WSTR_OPT, PUBLIC, SYS_ATTR("base_prefix")),
    SPEC(bytes_warning, UINT, PUBLIC, SYS_FLAG(9)),
    SPEC(cpu_count, INT, PUBLIC, NO_SYS),
    SPEC(exec_prefix, WSTR_OPT, PUBLIC, SYS_ATTR("exec_prefix")),
    SPEC(executable, WSTR_OPT, PUBLIC, SYS_ATTR("executable")),
    SPEC(inspect, BOOL, PUBLIC, SYS_FLAG(1)),
    SPEC(int_max_str_digits, UINT, PUBLIC, NO_SYS),
    SPEC(interactive, BOOL, PUBLIC, SYS_FLAG(2)),
    SPEC(module_search_paths, WSTR_LIST, PUBLIC, SYS_ATTR("path")),
    SPEC(optimization_level, UINT, PUBLIC, SYS_FLAG(3)),
    SPEC(parser_debug, BOOL, PUBLIC, SYS_FLAG(0)),
    SPEC(platlibdir, WSTR, PUBLIC, SYS_ATTR("platlibdir")),
    SPEC(prefix, WSTR_OPT, PUBLIC, SYS_ATTR("prefix")),
    SPEC(pycache_prefix, WSTR_OPT, PUBLIC, SYS_ATTR("pycache_prefix")),
    SPEC(quiet, BOOL, PUBLIC, SYS_FLAG(10)),
    SPEC(stdlib_dir, WSTR_OPT, PUBLIC, SYS_ATTR("_stdlib_dir")),
    SPEC(use_environment, BOOL, PUBLIC, SYS_FLAG_SETTER(7, config_sys_flag_not)),
    SPEC(verbose, UINT, PUBLIC, SYS_FLAG(8)),
    SPEC(warnoptions, WSTR_LIST, PUBLIC, SYS_ATTR("warnoptions")),
    SPEC(write_bytecode, BOOL, PUBLIC, SYS_FLAG_SETTER(4, config_sys_flag_not)),
    SPEC(xoptions, WSTR_LIST, PUBLIC, SYS_ATTR("_xoptions")),

    // --- Read-only options -----------

#ifdef Ty_STATS
    SPEC(_pystats, BOOL, READ_ONLY, NO_SYS),
#endif
    SPEC(buffered_stdio, BOOL, READ_ONLY, NO_SYS),
    SPEC(check_hash_pycs_mode, WSTR, READ_ONLY, NO_SYS),
    SPEC(code_debug_ranges, BOOL, READ_ONLY, NO_SYS),
    SPEC(configure_c_stdio, BOOL, READ_ONLY, NO_SYS),
    SPEC(dev_mode, BOOL, READ_ONLY, NO_SYS),  // sys.flags.dev_mode
    SPEC(dump_refs, BOOL, READ_ONLY, NO_SYS),
    SPEC(dump_refs_file, WSTR_OPT, READ_ONLY, NO_SYS),
#ifdef Ty_GIL_DISABLED
    SPEC(enable_gil, INT, READ_ONLY, NO_SYS),
    SPEC(tlbc_enabled, INT, READ_ONLY, NO_SYS),
#endif
    SPEC(faulthandler, BOOL, READ_ONLY, NO_SYS),
    SPEC(filesystem_encoding, WSTR, READ_ONLY, NO_SYS),
    SPEC(filesystem_errors, WSTR, READ_ONLY, NO_SYS),
    SPEC(hash_seed, ULONG, READ_ONLY, NO_SYS),
    SPEC(home, WSTR_OPT, READ_ONLY, NO_SYS),
    SPEC(thread_inherit_context, INT, READ_ONLY, NO_SYS),
    SPEC(context_aware_warnings, INT, READ_ONLY, NO_SYS),
    SPEC(import_time, UINT, READ_ONLY, NO_SYS),
    SPEC(install_signal_handlers, BOOL, READ_ONLY, NO_SYS),
    SPEC(isolated, BOOL, READ_ONLY, NO_SYS),  // sys.flags.isolated
#ifdef MS_WINDOWS
    SPEC(legacy_windows_stdio, BOOL, READ_ONLY, NO_SYS),
#endif
    SPEC(malloc_stats, BOOL, READ_ONLY, NO_SYS),
    SPEC(orig_argv, WSTR_LIST, READ_ONLY, SYS_ATTR("orig_argv")),
    SPEC(parse_argv, BOOL, READ_ONLY, NO_SYS),
    SPEC(pathconfig_warnings, BOOL, READ_ONLY, NO_SYS),
    SPEC(perf_profiling, UINT, READ_ONLY, NO_SYS),
    SPEC(remote_debug, BOOL, READ_ONLY, NO_SYS),
    SPEC(program_name, WSTR, READ_ONLY, NO_SYS),
    SPEC(run_command, WSTR_OPT, READ_ONLY, NO_SYS),
    SPEC(run_filename, WSTR_OPT, READ_ONLY, NO_SYS),
    SPEC(run_module, WSTR_OPT, READ_ONLY, NO_SYS),
#ifdef Ty_DEBUG
    SPEC(run_presite, WSTR_OPT, READ_ONLY, NO_SYS),
#endif
    SPEC(safe_path, BOOL, READ_ONLY, NO_SYS),
    SPEC(show_ref_count, BOOL, READ_ONLY, NO_SYS),
    SPEC(site_import, BOOL, READ_ONLY, NO_SYS),  // sys.flags.no_site
    SPEC(skip_source_first_line, BOOL, READ_ONLY, NO_SYS),
    SPEC(stdio_encoding, WSTR, READ_ONLY, NO_SYS),
    SPEC(stdio_errors, WSTR, READ_ONLY, NO_SYS),
    SPEC(tracemalloc, UINT, READ_ONLY, NO_SYS),
    SPEC(use_frozen_modules, BOOL, READ_ONLY, NO_SYS),
    SPEC(use_hash_seed, BOOL, READ_ONLY, NO_SYS),
#ifdef __APPLE__
    SPEC(use_system_logger, BOOL, READ_ONLY, NO_SYS),
#endif
    SPEC(user_site_directory, BOOL, READ_ONLY, NO_SYS),  // sys.flags.no_user_site
    SPEC(warn_default_encoding, BOOL, READ_ONLY, NO_SYS),

    // --- Init-only options -----------

    SPEC(_config_init, UINT, INIT_ONLY, NO_SYS),
    SPEC(_init_main, BOOL, INIT_ONLY, NO_SYS),
    SPEC(_install_importlib, BOOL, INIT_ONLY, NO_SYS),
    SPEC(_is_python_build, BOOL, INIT_ONLY, NO_SYS),
    SPEC(module_search_paths_set, BOOL, INIT_ONLY, NO_SYS),
    SPEC(pythonpath_env, WSTR_OPT, INIT_ONLY, NO_SYS),
    SPEC(sys_path_0, WSTR_OPT, INIT_ONLY, NO_SYS),

    // Array terminator
    {NULL, 0, 0, 0, NO_SYS},
};

#undef SPEC
#define SPEC(MEMBER, TYPE, VISIBILITY) \
    {#MEMBER, offsetof(TyPreConfig, MEMBER), TyConfig_MEMBER_##TYPE, \
     TyConfig_MEMBER_##VISIBILITY, NO_SYS}

static const PyConfigSpec PYPRECONFIG_SPEC[] = {
    // --- Read-only options -----------

    SPEC(allocator, INT, READ_ONLY),
    SPEC(coerce_c_locale, BOOL, READ_ONLY),
    SPEC(coerce_c_locale_warn, BOOL, READ_ONLY),
    SPEC(configure_locale, BOOL, READ_ONLY),
#ifdef MS_WINDOWS
    SPEC(legacy_windows_fs_encoding, BOOL, READ_ONLY),
#endif
    SPEC(utf8_mode, BOOL, READ_ONLY),

    // --- Init-only options -----------
    // Members already present in PYCONFIG_SPEC

    SPEC(_config_init, INT, INIT_ONLY),
    SPEC(dev_mode, BOOL, INIT_ONLY),
    SPEC(isolated, BOOL, INIT_ONLY),
    SPEC(parse_argv, BOOL, INIT_ONLY),
    SPEC(use_environment, BOOL, INIT_ONLY),

    // Array terminator
    {NULL, 0, 0, 0, NO_SYS},
};

#undef SPEC
#undef SYS_ATTR
#undef SYS_FLAG_SETTER
#undef SYS_FLAG
#undef NO_SYS


// Forward declarations
static TyObject*
config_get(const TyConfig *config, const PyConfigSpec *spec,
           int use_sys);


/* --- Command line options --------------------------------------- */

/* Short usage message (with %s for argv0) */
static const char usage_line[] =
"usage: %ls [option] ... [-c cmd | -m mod | file | -] [arg] ...\n";

/* Long help message */
/* Lines sorted by option name; keep in sync with usage_envvars* below */
static const char usage_help[] = "\
Options (and corresponding environment variables):\n\
-b     : issue warnings about converting bytes/bytearray to str and comparing\n\
         bytes/bytearray with str or bytes with int. (-bb: issue errors)\n\
-B     : don't write .pyc files on import; also PYTHONDONTWRITEBYTECODE=x\n\
-c cmd : program passed in as string (terminates option list)\n\
-d     : turn on parser debugging output (for experts only, only works on\n\
         debug builds); also PYTHONDEBUG=x\n\
-E     : ignore PYTHON* environment variables (such as PYTHONPATH)\n\
-h     : print this help message and exit (also -? or --help)\n\
-i     : inspect interactively after running script; forces a prompt even\n\
         if stdin does not appear to be a terminal; also PYTHONINSPECT=x\n\
-I     : isolate Python from the user's environment (implies -E, -P and -s)\n\
-m mod : run library module as a script (terminates option list)\n\
-O     : remove assert and __debug__-dependent statements; add .opt-1 before\n\
         .pyc extension; also PYTHONOPTIMIZE=x\n\
-OO    : do -O changes and also discard docstrings; add .opt-2 before\n\
         .pyc extension\n\
-P     : don't prepend a potentially unsafe path to sys.path; also\n\
         PYTHONSAFEPATH\n\
-q     : don't print version and copyright messages on interactive startup\n\
-s     : don't add user site directory to sys.path; also PYTHONNOUSERSITE=x\n\
-S     : don't imply 'import site' on initialization\n\
-u     : force the stdout and stderr streams to be unbuffered;\n\
         this option has no effect on stdin; also PYTHONUNBUFFERED=x\n\
-v     : verbose (trace import statements); also PYTHONVERBOSE=x\n\
         can be supplied multiple times to increase verbosity\n\
-V     : print the Python version number and exit (also --version)\n\
         when given twice, print more information about the build\n\
-W arg : warning control; arg is action:message:category:module:lineno\n\
         also PYTHONWARNINGS=arg\n\
-x     : skip first line of source, allowing use of non-Unix forms of #!cmd\n\
-X opt : set implementation-specific option\n\
--check-hash-based-pycs always|default|never:\n\
         control how Python invalidates hash-based .pyc files\n\
--help-env: print help about Python environment variables and exit\n\
--help-xoptions: print help about implementation-specific -X options and exit\n\
--help-all: print complete help information and exit\n\
\n\
Arguments:\n\
file   : program read from script file\n\
-      : program read from stdin (default; interactive mode if a tty)\n\
arg ...: arguments passed to program in sys.argv[1:]\n\
";

static const char usage_xoptions[] = "\
The following implementation-specific options are available:\n\
-X cpu_count=N: override the return value of os.cpu_count();\n\
         -X cpu_count=default cancels overriding; also PYTHON_CPU_COUNT\n\
-X dev : enable Python Development Mode; also PYTHONDEVMODE\n\
-X faulthandler: dump the Python traceback on fatal errors;\n\
         also PYTHONFAULTHANDLER\n\
-X frozen_modules=[on|off]: whether to use frozen modules; the default is \"on\"\n\
         for installed Python and \"off\" for a local build;\n\
         also PYTHON_FROZEN_MODULES\n\
"
#ifdef Ty_GIL_DISABLED
"-X gil=[0|1]: enable (1) or disable (0) the GIL; also PYTHON_GIL\n"
#endif
"\
-X importtime[=2]: show how long each import takes; use -X importtime=2 to\n\
         log imports of already-loaded modules; also PYTHONPROFILEIMPORTTIME\n\
-X int_max_str_digits=N: limit the size of int<->str conversions;\n\
         0 disables the limit; also PYTHONINTMAXSTRDIGITS\n\
-X no_debug_ranges: don't include extra location information in code objects;\n\
         also PYTHONNODEBUGRANGES\n\
-X perf: support the Linux \"perf\" profiler; also PYTHONPERFSUPPORT=1\n\
-X perf_jit: support the Linux \"perf\" profiler with DWARF support;\n\
         also PYTHON_PERF_JIT_SUPPORT=1\n\
-X disable-remote-debug: disable remote debugging; also PYTHON_DISABLE_REMOTE_DEBUG\n\
"
#ifdef Ty_DEBUG
"-X presite=MOD: import this module before site; also PYTHON_PRESITE\n"
#endif
"\
-X pycache_prefix=PATH: write .pyc files to a parallel tree instead of to the\n\
         code tree; also PYTHONPYCACHEPREFIX\n\
"
#ifdef Ty_STATS
"-X pystats: enable pystats collection at startup; also PYTHONSTATS\n"
#endif
"\
-X showrefcount: output the total reference count and number of used\n\
         memory blocks when the program finishes or after each statement in\n\
         the interactive interpreter; only works on debug builds\n"
#ifdef Ty_GIL_DISABLED
"-X tlbc=[0|1]: enable (1) or disable (0) thread-local bytecode. Also\n\
         PYTHON_TLBC\n"
#endif
"\
-X thread_inherit_context=[0|1]: enable (1) or disable (0) threads inheriting\n\
         context vars by default; enabled by default in the free-threaded\n\
         build and disabled otherwise; also PYTHON_THREAD_INHERIT_CONTEXT\n\
-X context_aware_warnings=[0|1]: if true (1) then the warnings module will\n\
         use a context variables; if false (0) then the warnings module will\n\
         use module globals, which is not concurrent-safe; set to true for\n\
         free-threaded builds and false otherwise; also\n\
         PYTHON_CONTEXT_AWARE_WARNINGS\n\
-X tracemalloc[=N]: trace Python memory allocations; N sets a traceback limit\n \
         of N frames (default: 1); also PYTHONTRACEMALLOC=N\n\
-X utf8[=0|1]: enable (1) or disable (0) UTF-8 mode; also PYTHONUTF8\n\
-X warn_default_encoding: enable opt-in EncodingWarning for 'encoding=None';\n\
         also PYTHONWARNDEFAULTENCODING\
";

/* Envvars that don't have equivalent command-line options are listed first */
static const char usage_envvars[] =
"Environment variables that change behavior:\n"
"PYTHONSTARTUP   : file executed on interactive startup (no default)\n"
"PYTHONPATH      : '%lc'-separated list of directories prefixed to the\n"
"                  default module search path.  The result is sys.path.\n"
"PYTHONHOME      : alternate <prefix> directory (or <prefix>%lc<exec_prefix>).\n"
"                  The default module search path uses %s.\n"
"PYTHONPLATLIBDIR: override sys.platlibdir\n"
"PYTHONCASEOK    : ignore case in 'import' statements (Windows)\n"
"PYTHONIOENCODING: encoding[:errors] used for stdin/stdout/stderr\n"
"PYTHONHASHSEED  : if this variable is set to 'random', a random value is used\n"
"                  to seed the hashes of str and bytes objects.  It can also be\n"
"                  set to an integer in the range [0,4294967295] to get hash\n"
"                  values with a predictable seed.\n"
"PYTHONMALLOC    : set the Python memory allocators and/or install debug hooks\n"
"                  on Python memory allocators.  Use PYTHONMALLOC=debug to\n"
"                  install debug hooks.\n"
"PYTHONMALLOCSTATS: print memory allocator statistics\n"
"PYTHONCOERCECLOCALE: if this variable is set to 0, it disables the locale\n"
"                  coercion behavior.  Use PYTHONCOERCECLOCALE=warn to request\n"
"                  display of locale coercion and locale compatibility warnings\n"
"                  on stderr.\n"
"PYTHONBREAKPOINT: if this variable is set to 0, it disables the default\n"
"                  debugger.  It can be set to the callable of your debugger of\n"
"                  choice.\n"
"PYTHON_COLORS   : if this variable is set to 1, the interpreter will colorize\n"
"                  various kinds of output.  Setting it to 0 deactivates\n"
"                  this behavior.\n"
"PYTHON_HISTORY  : the location of a .python_history file.\n"
"PYTHONASYNCIODEBUG: enable asyncio debug mode\n"
#ifdef Ty_TRACE_REFS
"PYTHONDUMPREFS  : dump objects and reference counts still alive after shutdown\n"
"PYTHONDUMPREFSFILE: dump objects and reference counts to the specified file\n"
#endif
#ifdef __APPLE__
"PYTHONEXECUTABLE: set sys.argv[0] to this value (macOS only)\n"
#endif
#ifdef MS_WINDOWS
"PYTHONLEGACYWINDOWSFSENCODING: use legacy \"mbcs\" encoding for file system\n"
"PYTHONLEGACYWINDOWSSTDIO: use legacy Windows stdio\n"
#endif
"PYTHONUSERBASE  : defines the user base directory (site.USER_BASE)\n"
"PYTHON_BASIC_REPL: use the traditional parser-based REPL\n"
"\n"
"These variables have equivalent command-line options (see --help for details):\n"
"PYTHON_CPU_COUNT: override the return value of os.cpu_count() (-X cpu_count)\n"
"PYTHONDEBUG     : enable parser debug mode (-d)\n"
"PYTHONDEVMODE   : enable Python Development Mode (-X dev)\n"
"PYTHONDONTWRITEBYTECODE: don't write .pyc files (-B)\n"
"PYTHONFAULTHANDLER: dump the Python traceback on fatal errors (-X faulthandler)\n"
"PYTHON_FROZEN_MODULES: whether to use frozen modules; the default is \"on\"\n"
"                  for installed Python and \"off\" for a local build\n"
"                  (-X frozen_modules)\n"
#ifdef Ty_GIL_DISABLED
"PYTHON_GIL      : when set to 0, disables the GIL (-X gil)\n"
#endif
"PYTHONINSPECT   : inspect interactively after running script (-i)\n"
"PYTHONINTMAXSTRDIGITS: limit the size of int<->str conversions;\n"
"                  0 disables the limit (-X int_max_str_digits=N)\n"
"PYTHONNODEBUGRANGES: don't include extra location information in code objects\n"
"                  (-X no_debug_ranges)\n"
"PYTHONNOUSERSITE: disable user site directory (-s)\n"
"PYTHONOPTIMIZE  : enable level 1 optimizations (-O)\n"
"PYTHONPERFSUPPORT: support the Linux \"perf\" profiler (-X perf)\n"
"PYTHON_PERF_JIT_SUPPORT: enable Linux \"perf\" profiler support with JIT\n"
"                  (-X perf_jit)\n"
#ifdef Ty_DEBUG
"PYTHON_PRESITE: import this module before site (-X presite)\n"
#endif
"PYTHONPROFILEIMPORTTIME: show how long each import takes (-X importtime)\n"
"PYTHONPYCACHEPREFIX: root directory for bytecode cache (pyc) files\n"
"                  (-X pycache_prefix)\n"
"PYTHONSAFEPATH  : don't prepend a potentially unsafe path to sys.path.\n"
#ifdef Ty_STATS
"PYTHONSTATS     : turns on statistics gathering (-X pystats)\n"
#endif
#ifdef Ty_GIL_DISABLED
"PYTHON_TLBC     : when set to 0, disables thread-local bytecode (-X tlbc)\n"
#endif
"PYTHON_THREAD_INHERIT_CONTEXT: if true (1), threads inherit context vars\n"
"                   (-X thread_inherit_context)\n"
"PYTHON_CONTEXT_AWARE_WARNINGS: if true (1), enable thread-safe warnings module\n"
"                   behaviour (-X context_aware_warnings)\n"
"PYTHONTRACEMALLOC: trace Python memory allocations (-X tracemalloc)\n"
"PYTHONUNBUFFERED: disable stdout/stderr buffering (-u)\n"
"PYTHONUTF8      : control the UTF-8 mode (-X utf8)\n"
"PYTHONVERBOSE   : trace import statements (-v)\n"
"PYTHONWARNDEFAULTENCODING: enable opt-in EncodingWarning for 'encoding=None'\n"
"                  (-X warn_default_encoding)\n"
"PYTHONWARNINGS  : warning control (-W)\n"
;

#if defined(MS_WINDOWS)
#  define PYTHONHOMEHELP "<prefix>\\python{major}{minor}"
#else
#  define PYTHONHOMEHELP "<prefix>/lib/pythonX.X"
#endif


/* --- Global configuration variables ----------------------------- */

/* UTF-8 mode (PEP 540): if equals to 1, use the UTF-8 encoding, and change
   stdin and stdout error handler to "surrogateescape". */
int Ty_UTF8Mode = 0;
int Ty_DebugFlag = 0; /* Needed by parser.c */
int Ty_VerboseFlag = 0; /* Needed by import.c */
int Ty_QuietFlag = 0; /* Needed by sysmodule.c */
int Ty_InteractiveFlag = 0; /* Previously, was used by Ty_FdIsInteractive() */
int Ty_InspectFlag = 0; /* Needed to determine whether to exit at SystemExit */
int Ty_OptimizeFlag = 0; /* Needed by compile.c */
int Ty_NoSiteFlag = 0; /* Suppress 'import site' */
int Ty_BytesWarningFlag = 0; /* Warn on str(bytes) and str(buffer) */
int Ty_FrozenFlag = 0; /* Needed by getpath.c */
int Ty_IgnoreEnvironmentFlag = 0; /* e.g. PYTHONPATH, PYTHONHOME */
int Ty_DontWriteBytecodeFlag = 0; /* Suppress writing bytecode files (*.pyc) */
int Ty_NoUserSiteDirectory = 0; /* for -s and site.py */
int Ty_UnbufferedStdioFlag = 0; /* Unbuffered binary std{in,out,err} */
int Ty_HashRandomizationFlag = 0; /* for -R and PYTHONHASHSEED */
int Ty_IsolatedFlag = 0; /* for -I, isolate from user's env */
#ifdef MS_WINDOWS
int Ty_LegacyWindowsFSEncodingFlag = 0; /* Uses mbcs instead of utf-8 */
int Ty_LegacyWindowsStdioFlag = 0; /* Uses FileIO instead of WindowsConsoleIO */
#endif


static TyObject *
_Ty_GetGlobalVariablesAsDict(void)
{
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
    TyObject *dict, *obj;

    dict = TyDict_New();
    if (dict == NULL) {
        return NULL;
    }

#define SET_ITEM(KEY, EXPR) \
        do { \
            obj = (EXPR); \
            if (obj == NULL) { \
                return NULL; \
            } \
            int res = TyDict_SetItemString(dict, (KEY), obj); \
            Ty_DECREF(obj); \
            if (res < 0) { \
                goto fail; \
            } \
        } while (0)
#define SET_ITEM_INT(VAR) \
    SET_ITEM(#VAR, TyLong_FromLong(VAR))
#define FROM_STRING(STR) \
    ((STR != NULL) ? \
        TyUnicode_FromString(STR) \
        : Ty_NewRef(Ty_None))
#define SET_ITEM_STR(VAR) \
    SET_ITEM(#VAR, FROM_STRING(VAR))

    SET_ITEM_STR(Ty_FileSystemDefaultEncoding);
    SET_ITEM_INT(Ty_HasFileSystemDefaultEncoding);
    SET_ITEM_STR(Ty_FileSystemDefaultEncodeErrors);
    SET_ITEM_INT(_Ty_HasFileSystemDefaultEncodeErrors);

    SET_ITEM_INT(Ty_UTF8Mode);
    SET_ITEM_INT(Ty_DebugFlag);
    SET_ITEM_INT(Ty_VerboseFlag);
    SET_ITEM_INT(Ty_QuietFlag);
    SET_ITEM_INT(Ty_InteractiveFlag);
    SET_ITEM_INT(Ty_InspectFlag);

    SET_ITEM_INT(Ty_OptimizeFlag);
    SET_ITEM_INT(Ty_NoSiteFlag);
    SET_ITEM_INT(Ty_BytesWarningFlag);
    SET_ITEM_INT(Ty_FrozenFlag);
    SET_ITEM_INT(Ty_IgnoreEnvironmentFlag);
    SET_ITEM_INT(Ty_DontWriteBytecodeFlag);
    SET_ITEM_INT(Ty_NoUserSiteDirectory);
    SET_ITEM_INT(Ty_UnbufferedStdioFlag);
    SET_ITEM_INT(Ty_HashRandomizationFlag);
    SET_ITEM_INT(Ty_IsolatedFlag);

#ifdef MS_WINDOWS
    SET_ITEM_INT(Ty_LegacyWindowsFSEncodingFlag);
    SET_ITEM_INT(Ty_LegacyWindowsStdioFlag);
#endif

    return dict;

fail:
    Ty_DECREF(dict);
    return NULL;

#undef FROM_STRING
#undef SET_ITEM
#undef SET_ITEM_INT
#undef SET_ITEM_STR
_Ty_COMP_DIAG_POP
}

char*
Ty_GETENV(const char *name)
{
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
    if (Ty_IgnoreEnvironmentFlag) {
        return NULL;
    }
    return getenv(name);
_Ty_COMP_DIAG_POP
}

/* --- TyStatus ----------------------------------------------- */

TyStatus TyStatus_Ok(void)
{ return _TyStatus_OK(); }

TyStatus TyStatus_Error(const char *err_msg)
{
    assert(err_msg != NULL);
    return (TyStatus){._type = _TyStatus_TYPE_ERROR,
                      .err_msg = err_msg};
}

TyStatus TyStatus_NoMemory(void)
{ return TyStatus_Error("memory allocation failed"); }

TyStatus TyStatus_Exit(int exitcode)
{ return _TyStatus_EXIT(exitcode); }


int TyStatus_IsError(TyStatus status)
{ return _TyStatus_IS_ERROR(status); }

int TyStatus_IsExit(TyStatus status)
{ return _TyStatus_IS_EXIT(status); }

int TyStatus_Exception(TyStatus status)
{ return _TyStatus_EXCEPTION(status); }

void
_TyErr_SetFromPyStatus(TyStatus status)
{
    if (!_TyStatus_IS_ERROR(status)) {
        TyErr_Format(TyExc_SystemError,
                     "_TyErr_SetFromPyStatus() status is not an error");
        return;
    }

    const char *err_msg = status.err_msg;
    if (err_msg == NULL || strlen(err_msg) == 0) {
        TyErr_Format(TyExc_SystemError,
                     "_TyErr_SetFromPyStatus() status has no error message");
        return;
    }

    if (strcmp(err_msg, _TyStatus_NO_MEMORY_ERRMSG) == 0) {
        TyErr_NoMemory();
        return;
    }

    const char *func = status.func;
    if (func) {
        TyErr_Format(TyExc_RuntimeError, "%s: %s", func, err_msg);
    }
    else {
        TyErr_Format(TyExc_RuntimeError, "%s", err_msg);
    }
}


/* --- TyWideStringList ------------------------------------------------ */

#ifndef NDEBUG
int
_TyWideStringList_CheckConsistency(const TyWideStringList *list)
{
    assert(list->length >= 0);
    if (list->length != 0) {
        assert(list->items != NULL);
    }
    for (Ty_ssize_t i = 0; i < list->length; i++) {
        assert(list->items[i] != NULL);
    }
    return 1;
}
#endif   /* Ty_DEBUG */


static void
_TyWideStringList_ClearEx(TyWideStringList *list,
                          bool use_default_allocator)
{
    assert(_TyWideStringList_CheckConsistency(list));
    for (Ty_ssize_t i=0; i < list->length; i++) {
        if (use_default_allocator) {
            _TyMem_DefaultRawFree(list->items[i]);
        }
        else {
            TyMem_RawFree(list->items[i]);
        }
    }
    if (use_default_allocator) {
        _TyMem_DefaultRawFree(list->items);
    }
    else {
        TyMem_RawFree(list->items);
    }
    list->length = 0;
    list->items = NULL;
}

void
_TyWideStringList_Clear(TyWideStringList *list)
{
    _TyWideStringList_ClearEx(list, false);
}

static int
_TyWideStringList_CopyEx(TyWideStringList *list,
                         const TyWideStringList *list2,
                         bool use_default_allocator)
{
    assert(_TyWideStringList_CheckConsistency(list));
    assert(_TyWideStringList_CheckConsistency(list2));

    if (list2->length == 0) {
        _TyWideStringList_ClearEx(list, use_default_allocator);
        return 0;
    }

    TyWideStringList copy = _TyWideStringList_INIT;

    size_t size = list2->length * sizeof(list2->items[0]);
    if (use_default_allocator) {
        copy.items = _TyMem_DefaultRawMalloc(size);
    }
    else {
        copy.items = TyMem_RawMalloc(size);
    }
    if (copy.items == NULL) {
        return -1;
    }

    for (Ty_ssize_t i=0; i < list2->length; i++) {
        wchar_t *item;
        if (use_default_allocator) {
            item = _TyMem_DefaultRawWcsdup(list2->items[i]);
        }
        else {
            item = _TyMem_RawWcsdup(list2->items[i]);
        }
        if (item == NULL) {
            _TyWideStringList_ClearEx(&copy, use_default_allocator);
            return -1;
        }
        copy.items[i] = item;
        copy.length = i + 1;
    }

    _TyWideStringList_ClearEx(list, use_default_allocator);
    *list = copy;
    return 0;
}

int
_TyWideStringList_Copy(TyWideStringList *list, const TyWideStringList *list2)
{
    return _TyWideStringList_CopyEx(list, list2, false);
}

TyStatus
TyWideStringList_Insert(TyWideStringList *list,
                        Ty_ssize_t index, const wchar_t *item)
{
    Ty_ssize_t len = list->length;
    if (len == PY_SSIZE_T_MAX) {
        /* length+1 would overflow */
        return _TyStatus_NO_MEMORY();
    }
    if (index < 0) {
        return _TyStatus_ERR("TyWideStringList_Insert index must be >= 0");
    }
    if (index > len) {
        index = len;
    }

    wchar_t *item2 = _TyMem_RawWcsdup(item);
    if (item2 == NULL) {
        return _TyStatus_NO_MEMORY();
    }

    size_t size = (len + 1) * sizeof(list->items[0]);
    wchar_t **items2 = (wchar_t **)TyMem_RawRealloc(list->items, size);
    if (items2 == NULL) {
        TyMem_RawFree(item2);
        return _TyStatus_NO_MEMORY();
    }

    if (index < len) {
        memmove(&items2[index + 1],
                &items2[index],
                (len - index) * sizeof(items2[0]));
    }

    items2[index] = item2;
    list->items = items2;
    list->length++;
    return _TyStatus_OK();
}


TyStatus
TyWideStringList_Append(TyWideStringList *list, const wchar_t *item)
{
    return TyWideStringList_Insert(list, list->length, item);
}


TyStatus
_TyWideStringList_Extend(TyWideStringList *list, const TyWideStringList *list2)
{
    for (Ty_ssize_t i = 0; i < list2->length; i++) {
        TyStatus status = TyWideStringList_Append(list, list2->items[i]);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    return _TyStatus_OK();
}


static int
_TyWideStringList_Find(TyWideStringList *list, const wchar_t *item)
{
    for (Ty_ssize_t i = 0; i < list->length; i++) {
        if (wcscmp(list->items[i], item) == 0) {
            return 1;
        }
    }
    return 0;
}


TyObject*
_TyWideStringList_AsList(const TyWideStringList *list)
{
    assert(_TyWideStringList_CheckConsistency(list));

    TyObject *pylist = TyList_New(list->length);
    if (pylist == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < list->length; i++) {
        TyObject *item = TyUnicode_FromWideChar(list->items[i], -1);
        if (item == NULL) {
            Ty_DECREF(pylist);
            return NULL;
        }
        TyList_SET_ITEM(pylist, i, item);
    }
    return pylist;
}


static TyObject*
_TyWideStringList_AsTuple(const TyWideStringList *list)
{
    assert(_TyWideStringList_CheckConsistency(list));

    TyObject *tuple = TyTuple_New(list->length);
    if (tuple == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < list->length; i++) {
        TyObject *item = TyUnicode_FromWideChar(list->items[i], -1);
        if (item == NULL) {
            Ty_DECREF(tuple);
            return NULL;
        }
        TyTuple_SET_ITEM(tuple, i, item);
    }
    return tuple;
}


/* --- Ty_GetArgcArgv() ------------------------------------------- */

void
_Ty_ClearArgcArgv(void)
{
    _TyWideStringList_ClearEx(&_PyRuntime.orig_argv, true);
}


static int
_Ty_SetArgcArgv(Ty_ssize_t argc, wchar_t * const *argv)
{
    const TyWideStringList argv_list = {.length = argc, .items = (wchar_t **)argv};

    // XXX _PyRuntime.orig_argv only gets cleared by Ty_Main(),
    // so it currently leaks for embedders.
    return _TyWideStringList_CopyEx(&_PyRuntime.orig_argv, &argv_list, true);
}


// _TyConfig_Write() calls _Ty_SetArgcArgv() with TyConfig.orig_argv.
void
Ty_GetArgcArgv(int *argc, wchar_t ***argv)
{
    *argc = (int)_PyRuntime.orig_argv.length;
    *argv = _PyRuntime.orig_argv.items;
}


/* --- TyConfig ---------------------------------------------- */

#define MAX_HASH_SEED 4294967295UL


#ifndef NDEBUG
static int
config_check_consistency(const TyConfig *config)
{
    /* Check config consistency */
    assert(config->isolated >= 0);
    assert(config->use_environment >= 0);
    assert(config->dev_mode >= 0);
    assert(config->install_signal_handlers >= 0);
    assert(config->use_hash_seed >= 0);
    assert(config->hash_seed <= MAX_HASH_SEED);
    assert(config->faulthandler >= 0);
    assert(config->tracemalloc >= 0);
    assert(config->import_time >= 0);
    assert(config->code_debug_ranges >= 0);
    assert(config->show_ref_count >= 0);
    assert(config->dump_refs >= 0);
    assert(config->malloc_stats >= 0);
    assert(config->site_import >= 0);
    assert(config->bytes_warning >= 0);
    assert(config->warn_default_encoding >= 0);
    assert(config->inspect >= 0);
    assert(config->interactive >= 0);
    assert(config->optimization_level >= 0);
    assert(config->parser_debug >= 0);
    assert(config->write_bytecode >= 0);
    assert(config->verbose >= 0);
    assert(config->quiet >= 0);
    assert(config->user_site_directory >= 0);
    assert(config->parse_argv >= 0);
    assert(config->configure_c_stdio >= 0);
    assert(config->buffered_stdio >= 0);
    assert(_TyWideStringList_CheckConsistency(&config->orig_argv));
    assert(_TyWideStringList_CheckConsistency(&config->argv));
    /* sys.argv must be non-empty: empty argv is replaced with [''] */
    assert(config->argv.length >= 1);
    assert(_TyWideStringList_CheckConsistency(&config->xoptions));
    assert(_TyWideStringList_CheckConsistency(&config->warnoptions));
    assert(_TyWideStringList_CheckConsistency(&config->module_search_paths));
    assert(config->module_search_paths_set >= 0);
    assert(config->filesystem_encoding != NULL);
    assert(config->filesystem_errors != NULL);
    assert(config->stdio_encoding != NULL);
    assert(config->stdio_errors != NULL);
#ifdef MS_WINDOWS
    assert(config->legacy_windows_stdio >= 0);
#endif
    /* -c and -m options are exclusive */
    assert(!(config->run_command != NULL && config->run_module != NULL));
    assert(config->check_hash_pycs_mode != NULL);
    assert(config->_install_importlib >= 0);
    assert(config->pathconfig_warnings >= 0);
    assert(config->_is_python_build >= 0);
    assert(config->safe_path >= 0);
    assert(config->int_max_str_digits >= 0);
    // cpu_count can be -1 if the user doesn't override it.
    assert(config->cpu_count != 0);
    // config->use_frozen_modules is initialized later
    // by _TyConfig_InitImportConfig().
    assert(config->thread_inherit_context >= 0);
    assert(config->context_aware_warnings >= 0);
#ifdef __APPLE__
    assert(config->use_system_logger >= 0);
#endif
#ifdef Ty_STATS
    assert(config->_pystats >= 0);
#endif
    return 1;
}
#endif


/* Free memory allocated in config, but don't clear all attributes */
void
TyConfig_Clear(TyConfig *config)
{
#define CLEAR(ATTR) \
    do { \
        TyMem_RawFree(ATTR); \
        ATTR = NULL; \
    } while (0)

    CLEAR(config->pycache_prefix);
    CLEAR(config->pythonpath_env);
    CLEAR(config->home);
    CLEAR(config->program_name);

    _TyWideStringList_Clear(&config->argv);
    _TyWideStringList_Clear(&config->warnoptions);
    _TyWideStringList_Clear(&config->xoptions);
    _TyWideStringList_Clear(&config->module_search_paths);
    config->module_search_paths_set = 0;
    CLEAR(config->stdlib_dir);

    CLEAR(config->executable);
    CLEAR(config->base_executable);
    CLEAR(config->prefix);
    CLEAR(config->base_prefix);
    CLEAR(config->exec_prefix);
    CLEAR(config->base_exec_prefix);
    CLEAR(config->platlibdir);
    CLEAR(config->sys_path_0);

    CLEAR(config->filesystem_encoding);
    CLEAR(config->filesystem_errors);
    CLEAR(config->stdio_encoding);
    CLEAR(config->stdio_errors);
    CLEAR(config->run_command);
    CLEAR(config->run_module);
    CLEAR(config->run_filename);
    CLEAR(config->check_hash_pycs_mode);
#ifdef Ty_DEBUG
    CLEAR(config->run_presite);
#endif

    _TyWideStringList_Clear(&config->orig_argv);
#undef CLEAR
}


void
_TyConfig_InitCompatConfig(TyConfig *config)
{
    memset(config, 0, sizeof(*config));

    config->_config_init = (int)_TyConfig_INIT_COMPAT;
    config->import_time = -1;
    config->isolated = -1;
    config->use_environment = -1;
    config->dev_mode = -1;
    config->install_signal_handlers = 1;
    config->use_hash_seed = -1;
    config->faulthandler = -1;
    config->tracemalloc = -1;
    config->perf_profiling = -1;
    config->remote_debug = -1;
    config->module_search_paths_set = 0;
    config->parse_argv = 0;
    config->site_import = -1;
    config->bytes_warning = -1;
    config->warn_default_encoding = 0;
    config->inspect = -1;
    config->interactive = -1;
    config->optimization_level = -1;
    config->parser_debug= -1;
    config->write_bytecode = -1;
    config->verbose = -1;
    config->quiet = -1;
    config->user_site_directory = -1;
    config->configure_c_stdio = 0;
    config->buffered_stdio = -1;
    config->_install_importlib = 1;
    config->check_hash_pycs_mode = NULL;
    config->pathconfig_warnings = -1;
    config->_init_main = 1;
#ifdef MS_WINDOWS
    config->legacy_windows_stdio = -1;
#endif
#ifdef Ty_DEBUG
    config->use_frozen_modules = 0;
#else
    config->use_frozen_modules = 1;
#endif
    config->safe_path = 0;
    config->int_max_str_digits = -1;
    config->_is_python_build = 0;
    config->code_debug_ranges = 1;
    config->cpu_count = -1;
#ifdef Ty_GIL_DISABLED
    config->thread_inherit_context = 1;
    config->context_aware_warnings = 1;
#else
    config->thread_inherit_context = 0;
    config->context_aware_warnings = 0;
#endif
#ifdef __APPLE__
    config->use_system_logger = USE_SYSTEM_LOGGER_DEFAULT;
#endif
#ifdef Ty_GIL_DISABLED
    config->enable_gil = _TyConfig_GIL_DEFAULT;
    config->tlbc_enabled = 1;
#endif
}


static void
config_init_defaults(TyConfig *config)
{
    _TyConfig_InitCompatConfig(config);

    config->isolated = 0;
    config->use_environment = 1;
    config->site_import = 1;
    config->bytes_warning = 0;
    config->inspect = 0;
    config->interactive = 0;
    config->optimization_level = 0;
    config->parser_debug= 0;
    config->write_bytecode = 1;
    config->verbose = 0;
    config->quiet = 0;
    config->user_site_directory = 1;
    config->buffered_stdio = 1;
    config->pathconfig_warnings = 1;
#ifdef MS_WINDOWS
    config->legacy_windows_stdio = 0;
#endif
#ifdef Ty_GIL_DISABLED
    config->thread_inherit_context = 1;
    config->context_aware_warnings = 1;
#else
    config->thread_inherit_context = 0;
    config->context_aware_warnings = 0;
#endif
#ifdef __APPLE__
    config->use_system_logger = USE_SYSTEM_LOGGER_DEFAULT;
#endif
}


void
TyConfig_InitTyphonConfig(TyConfig *config)
{
    config_init_defaults(config);

    config->_config_init = (int)_TyConfig_INIT_PYTHON;
    config->configure_c_stdio = 1;
    config->parse_argv = 1;
}


void
TyConfig_InitIsolatedConfig(TyConfig *config)
{
    config_init_defaults(config);

    config->_config_init = (int)_TyConfig_INIT_ISOLATED;
    config->isolated = 1;
    config->use_environment = 0;
    config->user_site_directory = 0;
    config->dev_mode = 0;
    config->install_signal_handlers = 0;
    config->use_hash_seed = 0;
    config->tracemalloc = 0;
    config->perf_profiling = 0;
    config->int_max_str_digits = _PY_LONG_DEFAULT_MAX_STR_DIGITS;
    config->safe_path = 1;
    config->pathconfig_warnings = 0;
#ifdef Ty_GIL_DISABLED
    config->thread_inherit_context = 1;
#else
    config->thread_inherit_context = 0;
#endif
#ifdef MS_WINDOWS
    config->legacy_windows_stdio = 0;
#endif
#ifdef __APPLE__
    config->use_system_logger = USE_SYSTEM_LOGGER_DEFAULT;
#endif
}


/* Copy str into *config_str (duplicate the string) */
TyStatus
TyConfig_SetString(TyConfig *config, wchar_t **config_str, const wchar_t *str)
{
    TyStatus status = _Ty_PreInitializeFromConfig(config, NULL);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    wchar_t *str2;
    if (str != NULL) {
        str2 = _TyMem_RawWcsdup(str);
        if (str2 == NULL) {
            return _TyStatus_NO_MEMORY();
        }
    }
    else {
        str2 = NULL;
    }
    TyMem_RawFree(*config_str);
    *config_str = str2;
    return _TyStatus_OK();
}


static TyStatus
config_set_bytes_string(TyConfig *config, wchar_t **config_str,
                        const char *str, const char *decode_err_msg)
{
    TyStatus status = _Ty_PreInitializeFromConfig(config, NULL);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    wchar_t *str2;
    if (str != NULL) {
        size_t len;
        str2 = Ty_DecodeLocale(str, &len);
        if (str2 == NULL) {
            if (len == (size_t)-2) {
                return _TyStatus_ERR(decode_err_msg);
            }
            else {
                return  _TyStatus_NO_MEMORY();
            }
        }
    }
    else {
        str2 = NULL;
    }
    TyMem_RawFree(*config_str);
    *config_str = str2;
    return _TyStatus_OK();
}


#define CONFIG_SET_BYTES_STR(config, config_str, str, NAME) \
    config_set_bytes_string(config, config_str, str, "cannot decode " NAME)


/* Decode str using Ty_DecodeLocale() and set the result into *config_str.
   Pre-initialize Python if needed to ensure that encodings are properly
   configured. */
TyStatus
TyConfig_SetBytesString(TyConfig *config, wchar_t **config_str,
                        const char *str)
{
    return CONFIG_SET_BYTES_STR(config, config_str, str, "string");
}


static inline void*
config_get_spec_member(const TyConfig *config, const PyConfigSpec *spec)
{
    return (char *)config + spec->offset;
}


static inline void*
preconfig_get_spec_member(const TyPreConfig *preconfig, const PyConfigSpec *spec)
{
    return (char *)preconfig + spec->offset;
}


TyStatus
_TyConfig_Copy(TyConfig *config, const TyConfig *config2)
{
    TyConfig_Clear(config);

    TyStatus status;
    const PyConfigSpec *spec = PYCONFIG_SPEC;
    for (; spec->name != NULL; spec++) {
        void *member = config_get_spec_member(config, spec);
        const void *member2 = config_get_spec_member((TyConfig*)config2, spec);
        switch (spec->type) {
        case TyConfig_MEMBER_INT:
        case TyConfig_MEMBER_UINT:
        case TyConfig_MEMBER_BOOL:
        {
            *(int*)member = *(int*)member2;
            break;
        }
        case TyConfig_MEMBER_ULONG:
        {
            *(unsigned long*)member = *(unsigned long*)member2;
            break;
        }
        case TyConfig_MEMBER_WSTR:
        case TyConfig_MEMBER_WSTR_OPT:
        {
            const wchar_t *str = *(const wchar_t**)member2;
            status = TyConfig_SetString(config, (wchar_t**)member, str);
            if (_TyStatus_EXCEPTION(status)) {
                return status;
            }
            break;
        }
        case TyConfig_MEMBER_WSTR_LIST:
        {
            if (_TyWideStringList_Copy((TyWideStringList*)member,
                                       (const TyWideStringList*)member2) < 0) {
                return _TyStatus_NO_MEMORY();
            }
            break;
        }
        default:
            Ty_UNREACHABLE();
        }
    }
    return _TyStatus_OK();
}


TyObject *
_TyConfig_AsDict(const TyConfig *config)
{
    TyObject *dict = TyDict_New();
    if (dict == NULL) {
        return NULL;
    }

    const PyConfigSpec *spec = PYCONFIG_SPEC;
    for (; spec->name != NULL; spec++) {
        TyObject *obj = config_get(config, spec, 0);
        if (obj == NULL) {
            Ty_DECREF(dict);
            return NULL;
        }

        int res = TyDict_SetItemString(dict, spec->name, obj);
        Ty_DECREF(obj);
        if (res < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }
    return dict;
}


static void
config_dict_invalid_value(const char *name)
{
    TyErr_Format(TyExc_ValueError, "invalid config value: %s", name);
}


static int
config_dict_get_int(TyObject *dict, const char *name, int *result)
{
    TyObject *item = config_dict_get(dict, name);
    if (item == NULL) {
        return -1;
    }
    int value = TyLong_AsInt(item);
    Ty_DECREF(item);
    if (value == -1 && TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            config_dict_invalid_type(name);
        }
        else if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            config_dict_invalid_value(name);
        }
        return -1;
    }
    *result = value;
    return 0;
}


static int
config_dict_get_ulong(TyObject *dict, const char *name, unsigned long *result)
{
    TyObject *item = config_dict_get(dict, name);
    if (item == NULL) {
        return -1;
    }
    unsigned long value = TyLong_AsUnsignedLong(item);
    Ty_DECREF(item);
    if (value == (unsigned long)-1 && TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            config_dict_invalid_type(name);
        }
        else if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            config_dict_invalid_value(name);
        }
        return -1;
    }
    *result = value;
    return 0;
}


static int
config_dict_get_wstr(TyObject *dict, const char *name, TyConfig *config,
                     wchar_t **result)
{
    TyObject *item = config_dict_get(dict, name);
    if (item == NULL) {
        return -1;
    }

    TyStatus status;
    if (item == Ty_None) {
        status = TyConfig_SetString(config, result, NULL);
    }
    else if (!TyUnicode_Check(item)) {
        config_dict_invalid_type(name);
        goto error;
    }
    else {
        wchar_t *wstr = TyUnicode_AsWideCharString(item, NULL);
        if (wstr == NULL) {
            goto error;
        }
        status = TyConfig_SetString(config, result, wstr);
        TyMem_Free(wstr);
    }
    if (_TyStatus_EXCEPTION(status)) {
        TyErr_NoMemory();
        goto error;
    }
    Ty_DECREF(item);
    return 0;

error:
    Ty_DECREF(item);
    return -1;
}


static int
config_dict_get_wstrlist(TyObject *dict, const char *name, TyConfig *config,
                         TyWideStringList *result)
{
    TyObject *list = config_dict_get(dict, name);
    if (list == NULL) {
        return -1;
    }

    int is_list = TyList_CheckExact(list);
    if (!is_list && !TyTuple_CheckExact(list)) {
        Ty_DECREF(list);
        config_dict_invalid_type(name);
        return -1;
    }

    TyWideStringList wstrlist = _TyWideStringList_INIT;
    Ty_ssize_t len = is_list ? TyList_GET_SIZE(list) : TyTuple_GET_SIZE(list);
    for (Ty_ssize_t i=0; i < len; i++) {
        TyObject *item = is_list ? TyList_GET_ITEM(list, i) : TyTuple_GET_ITEM(list, i);

        if (item == Ty_None) {
            config_dict_invalid_value(name);
            goto error;
        }
        else if (!TyUnicode_Check(item)) {
            config_dict_invalid_type(name);
            goto error;
        }
        wchar_t *wstr = TyUnicode_AsWideCharString(item, NULL);
        if (wstr == NULL) {
            goto error;
        }
        TyStatus status = TyWideStringList_Append(&wstrlist, wstr);
        TyMem_Free(wstr);
        if (_TyStatus_EXCEPTION(status)) {
            TyErr_NoMemory();
            goto error;
        }
    }

    if (_TyWideStringList_Copy(result, &wstrlist) < 0) {
        TyErr_NoMemory();
        goto error;
    }
    _TyWideStringList_Clear(&wstrlist);
    Ty_DECREF(list);
    return 0;

error:
    _TyWideStringList_Clear(&wstrlist);
    Ty_DECREF(list);
    return -1;
}


static int
config_dict_get_xoptions(TyObject *dict, const char *name, TyConfig *config,
                         TyWideStringList *result)
{
    TyObject *xoptions = config_dict_get(dict, name);
    if (xoptions == NULL) {
        return -1;
    }

    if (!TyDict_CheckExact(xoptions)) {
        Ty_DECREF(xoptions);
        config_dict_invalid_type(name);
        return -1;
    }

    Ty_ssize_t pos = 0;
    TyObject *key, *value;
    TyWideStringList wstrlist = _TyWideStringList_INIT;
    while (TyDict_Next(xoptions, &pos, &key, &value)) {
        TyObject *item;

        if (value != Ty_True) {
            item = TyUnicode_FromFormat("%S=%S", key, value);
            if (item == NULL) {
                goto error;
            }
        }
        else {
            item = Ty_NewRef(key);
        }

        wchar_t *wstr = TyUnicode_AsWideCharString(item, NULL);
        Ty_DECREF(item);
        if (wstr == NULL) {
            goto error;
        }

        TyStatus status = TyWideStringList_Append(&wstrlist, wstr);
        TyMem_Free(wstr);
        if (_TyStatus_EXCEPTION(status)) {
            TyErr_NoMemory();
            goto error;
        }
    }

    if (_TyWideStringList_Copy(result, &wstrlist) < 0) {
        TyErr_NoMemory();
        goto error;
    }
    _TyWideStringList_Clear(&wstrlist);
    Ty_DECREF(xoptions);
    return 0;

error:
    _TyWideStringList_Clear(&wstrlist);
    Ty_DECREF(xoptions);
    return -1;
}


int
_TyConfig_FromDict(TyConfig *config, TyObject *dict)
{
    if (!TyDict_Check(dict)) {
        TyErr_SetString(TyExc_TypeError, "dict expected");
        return -1;
    }

    const PyConfigSpec *spec = PYCONFIG_SPEC;
    for (; spec->name != NULL; spec++) {
        char *member = (char *)config + spec->offset;
        switch (spec->type) {
        case TyConfig_MEMBER_INT:
        case TyConfig_MEMBER_UINT:
        case TyConfig_MEMBER_BOOL:
        {
            int value;
            if (config_dict_get_int(dict, spec->name, &value) < 0) {
                return -1;
            }
            if (spec->type == TyConfig_MEMBER_BOOL
                || spec->type == TyConfig_MEMBER_UINT)
            {
                if (value < 0) {
                    config_dict_invalid_value(spec->name);
                    return -1;
                }
            }
            *(int*)member = value;
            break;
        }
        case TyConfig_MEMBER_ULONG:
        {
            if (config_dict_get_ulong(dict, spec->name,
                                      (unsigned long*)member) < 0) {
                return -1;
            }
            break;
        }
        case TyConfig_MEMBER_WSTR:
        {
            wchar_t **wstr = (wchar_t**)member;
            if (config_dict_get_wstr(dict, spec->name, config, wstr) < 0) {
                return -1;
            }
            if (*wstr == NULL) {
                config_dict_invalid_value(spec->name);
                return -1;
            }
            break;
        }
        case TyConfig_MEMBER_WSTR_OPT:
        {
            wchar_t **wstr = (wchar_t**)member;
            if (config_dict_get_wstr(dict, spec->name, config, wstr) < 0) {
                return -1;
            }
            break;
        }
        case TyConfig_MEMBER_WSTR_LIST:
        {
            if (strcmp(spec->name, "xoptions") == 0) {
                if (config_dict_get_xoptions(dict, spec->name, config,
                                             (TyWideStringList*)member) < 0) {
                    return -1;
                }
            }
            else {
                if (config_dict_get_wstrlist(dict, spec->name, config,
                                             (TyWideStringList*)member) < 0) {
                    return -1;
                }
            }
            break;
        }
        default:
            Ty_UNREACHABLE();
        }
    }

    if (!(config->_config_init == _TyConfig_INIT_COMPAT
          || config->_config_init == _TyConfig_INIT_PYTHON
          || config->_config_init == _TyConfig_INIT_ISOLATED))
    {
        config_dict_invalid_value("_config_init");
        return -1;
    }

    if (config->hash_seed > MAX_HASH_SEED) {
        config_dict_invalid_value("hash_seed");
        return -1;
    }
    return 0;
}


static const char*
config_get_env(const TyConfig *config, const char *name)
{
    return _Ty_GetEnv(config->use_environment, name);
}


/* Get a copy of the environment variable as wchar_t*.
   Return 0 on success, but *dest can be NULL.
   Return -1 on memory allocation failure. Return -2 on decoding error. */
static TyStatus
config_get_env_dup(TyConfig *config,
                   wchar_t **dest,
                   wchar_t *wname, char *name,
                   const char *decode_err_msg)
{
    assert(*dest == NULL);
    assert(config->use_environment >= 0);

    if (!config->use_environment) {
        *dest = NULL;
        return _TyStatus_OK();
    }

#ifdef MS_WINDOWS
    const wchar_t *var = _wgetenv(wname);
    if (!var || var[0] == '\0') {
        *dest = NULL;
        return _TyStatus_OK();
    }

    return TyConfig_SetString(config, dest, var);
#else
    const char *var = getenv(name);
    if (!var || var[0] == '\0') {
        *dest = NULL;
        return _TyStatus_OK();
    }

    return config_set_bytes_string(config, dest, var, decode_err_msg);
#endif
}


#define CONFIG_GET_ENV_DUP(CONFIG, DEST, WNAME, NAME) \
    config_get_env_dup(CONFIG, DEST, WNAME, NAME, "cannot decode " NAME)


static void
config_get_global_vars(TyConfig *config)
{
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
    if (config->_config_init != _TyConfig_INIT_COMPAT) {
        /* Python and Isolated configuration ignore global variables */
        return;
    }

#define COPY_FLAG(ATTR, VALUE) \
        if (config->ATTR == -1) { \
            config->ATTR = VALUE; \
        }
#define COPY_NOT_FLAG(ATTR, VALUE) \
        if (config->ATTR == -1) { \
            config->ATTR = !(VALUE); \
        }

    COPY_FLAG(isolated, Ty_IsolatedFlag);
    COPY_NOT_FLAG(use_environment, Ty_IgnoreEnvironmentFlag);
    COPY_FLAG(bytes_warning, Ty_BytesWarningFlag);
    COPY_FLAG(inspect, Ty_InspectFlag);
    COPY_FLAG(interactive, Ty_InteractiveFlag);
    COPY_FLAG(optimization_level, Ty_OptimizeFlag);
    COPY_FLAG(parser_debug, Ty_DebugFlag);
    COPY_FLAG(verbose, Ty_VerboseFlag);
    COPY_FLAG(quiet, Ty_QuietFlag);
#ifdef MS_WINDOWS
    COPY_FLAG(legacy_windows_stdio, Ty_LegacyWindowsStdioFlag);
#endif
    COPY_NOT_FLAG(pathconfig_warnings, Ty_FrozenFlag);

    COPY_NOT_FLAG(buffered_stdio, Ty_UnbufferedStdioFlag);
    COPY_NOT_FLAG(site_import, Ty_NoSiteFlag);
    COPY_NOT_FLAG(write_bytecode, Ty_DontWriteBytecodeFlag);
    COPY_NOT_FLAG(user_site_directory, Ty_NoUserSiteDirectory);

#undef COPY_FLAG
#undef COPY_NOT_FLAG
_Ty_COMP_DIAG_POP
}


/* Set Ty_xxx global configuration variables from 'config' configuration. */
static void
config_set_global_vars(const TyConfig *config)
{
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS
#define COPY_FLAG(ATTR, VAR) \
        if (config->ATTR != -1) { \
            VAR = config->ATTR; \
        }
#define COPY_NOT_FLAG(ATTR, VAR) \
        if (config->ATTR != -1) { \
            VAR = !config->ATTR; \
        }

    COPY_FLAG(isolated, Ty_IsolatedFlag);
    COPY_NOT_FLAG(use_environment, Ty_IgnoreEnvironmentFlag);
    COPY_FLAG(bytes_warning, Ty_BytesWarningFlag);
    COPY_FLAG(inspect, Ty_InspectFlag);
    COPY_FLAG(interactive, Ty_InteractiveFlag);
    COPY_FLAG(optimization_level, Ty_OptimizeFlag);
    COPY_FLAG(parser_debug, Ty_DebugFlag);
    COPY_FLAG(verbose, Ty_VerboseFlag);
    COPY_FLAG(quiet, Ty_QuietFlag);
#ifdef MS_WINDOWS
    COPY_FLAG(legacy_windows_stdio, Ty_LegacyWindowsStdioFlag);
#endif
    COPY_NOT_FLAG(pathconfig_warnings, Ty_FrozenFlag);

    COPY_NOT_FLAG(buffered_stdio, Ty_UnbufferedStdioFlag);
    COPY_NOT_FLAG(site_import, Ty_NoSiteFlag);
    COPY_NOT_FLAG(write_bytecode, Ty_DontWriteBytecodeFlag);
    COPY_NOT_FLAG(user_site_directory, Ty_NoUserSiteDirectory);

    /* Random or non-zero hash seed */
    Ty_HashRandomizationFlag = (config->use_hash_seed == 0 ||
                                config->hash_seed != 0);

#undef COPY_FLAG
#undef COPY_NOT_FLAG
_Ty_COMP_DIAG_POP
}


static const wchar_t*
config_get_xoption(const TyConfig *config, wchar_t *name)
{
    return _Ty_get_xoption(&config->xoptions, name);
}

static const wchar_t*
config_get_xoption_value(const TyConfig *config, wchar_t *name)
{
    const wchar_t *xoption = config_get_xoption(config, name);
    if (xoption == NULL) {
        return NULL;
    }
    const wchar_t *sep = wcschr(xoption, L'=');
    return sep ? sep + 1 : L"";
}


static TyStatus
config_init_hash_seed(TyConfig *config)
{
    static_assert(sizeof(_Ty_HashSecret_t) == sizeof(_Ty_HashSecret.uc),
                  "_Ty_HashSecret_t has wrong size");

    const char *seed_text = config_get_env(config, "PYTHONHASHSEED");

    /* Convert a text seed to a numeric one */
    if (seed_text && strcmp(seed_text, "random") != 0) {
        const char *endptr = seed_text;
        unsigned long seed;
        errno = 0;
        seed = strtoul(seed_text, (char **)&endptr, 10);
        if (*endptr != '\0'
            || seed > MAX_HASH_SEED
            || (errno == ERANGE && seed == ULONG_MAX))
        {
            return _TyStatus_ERR("PYTHONHASHSEED must be \"random\" "
                                "or an integer in range [0; 4294967295]");
        }
        /* Use a specific hash */
        config->use_hash_seed = 1;
        config->hash_seed = seed;
    }
    else {
        /* Use a random hash */
        config->use_hash_seed = 0;
        config->hash_seed = 0;
    }
    return _TyStatus_OK();
}


static int
config_wstr_to_int(const wchar_t *wstr, int *result)
{
    const wchar_t *endptr = wstr;
    errno = 0;
    long value = wcstol(wstr, (wchar_t **)&endptr, 10);
    if (*endptr != '\0' || errno == ERANGE) {
        return -1;
    }
    if (value < INT_MIN || value > INT_MAX) {
        return -1;
    }

    *result = (int)value;
    return 0;
}

static TyStatus
config_read_gil(TyConfig *config, size_t len, wchar_t first_char)
{
    if (len == 1 && first_char == L'0') {
#ifdef Ty_GIL_DISABLED
        config->enable_gil = _TyConfig_GIL_DISABLE;
#else
        return _TyStatus_ERR("Disabling the GIL is not supported by this build");
#endif
    }
    else if (len == 1 && first_char == L'1') {
#ifdef Ty_GIL_DISABLED
        config->enable_gil = _TyConfig_GIL_ENABLE;
#else
        return _TyStatus_OK();
#endif
    }
    else {
        return _TyStatus_ERR("PYTHON_GIL / -X gil must be \"0\" or \"1\"");
    }
    return _TyStatus_OK();
}

static TyStatus
config_read_env_vars(TyConfig *config)
{
    TyStatus status;
    int use_env = config->use_environment;

    /* Get environment variables */
    _Ty_get_env_flag(use_env, &config->parser_debug, "PYTHONDEBUG");
    _Ty_get_env_flag(use_env, &config->verbose, "PYTHONVERBOSE");
    _Ty_get_env_flag(use_env, &config->optimization_level, "PYTHONOPTIMIZE");
    _Ty_get_env_flag(use_env, &config->inspect, "PYTHONINSPECT");

    int dont_write_bytecode = 0;
    _Ty_get_env_flag(use_env, &dont_write_bytecode, "PYTHONDONTWRITEBYTECODE");
    if (dont_write_bytecode) {
        config->write_bytecode = 0;
    }

    int no_user_site_directory = 0;
    _Ty_get_env_flag(use_env, &no_user_site_directory, "PYTHONNOUSERSITE");
    if (no_user_site_directory) {
        config->user_site_directory = 0;
    }

    int unbuffered_stdio = 0;
    _Ty_get_env_flag(use_env, &unbuffered_stdio, "PYTHONUNBUFFERED");
    if (unbuffered_stdio) {
        config->buffered_stdio = 0;
    }

#ifdef MS_WINDOWS
    _Ty_get_env_flag(use_env, &config->legacy_windows_stdio,
                     "PYTHONLEGACYWINDOWSSTDIO");
#endif

    if (config_get_env(config, "PYTHONDUMPREFS")) {
        config->dump_refs = 1;
    }
    if (config_get_env(config, "PYTHONMALLOCSTATS")) {
        config->malloc_stats = 1;
    }

    if (config->dump_refs_file == NULL) {
        status = CONFIG_GET_ENV_DUP(config, &config->dump_refs_file,
                                    L"PYTHONDUMPREFSFILE", "PYTHONDUMPREFSFILE");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->pythonpath_env == NULL) {
        status = CONFIG_GET_ENV_DUP(config, &config->pythonpath_env,
                                    L"PYTHONPATH", "PYTHONPATH");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if(config->platlibdir == NULL) {
        status = CONFIG_GET_ENV_DUP(config, &config->platlibdir,
                                    L"PYTHONPLATLIBDIR", "PYTHONPLATLIBDIR");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->use_hash_seed < 0) {
        status = config_init_hash_seed(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config_get_env(config, "PYTHONSAFEPATH")) {
        config->safe_path = 1;
    }

    const char *gil = config_get_env(config, "PYTHON_GIL");
    if (gil != NULL) {
        size_t len = strlen(gil);
        status = config_read_gil(config, len, gil[0]);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    return _TyStatus_OK();
}

static TyStatus
config_init_cpu_count(TyConfig *config)
{
    const char *env = config_get_env(config, "PYTHON_CPU_COUNT");
    if (env) {
        int cpu_count = -1;
        if (strcmp(env, "default") == 0) {
            cpu_count = -1;
        }
        else if (_Ty_str_to_int(env, &cpu_count) < 0 || cpu_count < 1) {
            goto error;
        }
        config->cpu_count = cpu_count;
    }

    const wchar_t *xoption = config_get_xoption(config, L"cpu_count");
    if (xoption) {
        int cpu_count = -1;
        const wchar_t *sep = wcschr(xoption, L'=');
        if (sep) {
            if (wcscmp(sep + 1, L"default") == 0) {
                cpu_count = -1;
            }
            else if (config_wstr_to_int(sep + 1, &cpu_count) < 0 || cpu_count < 1) {
                goto error;
            }
        }
        else {
            goto error;
        }
        config->cpu_count = cpu_count;
    }
    return _TyStatus_OK();

error:
    return _TyStatus_ERR("-X cpu_count=n option: n is missing or an invalid number, "
                         "n must be greater than 0");
}

static TyStatus
config_init_thread_inherit_context(TyConfig *config)
{
    const char *env = config_get_env(config, "PYTHON_THREAD_INHERIT_CONTEXT");
    if (env) {
        int enabled;
        if (_Ty_str_to_int(env, &enabled) < 0 || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "PYTHON_THREAD_INHERIT_CONTEXT=N: N is missing or invalid");
        }
        config->thread_inherit_context = enabled;
    }

    const wchar_t *xoption = config_get_xoption(config, L"thread_inherit_context");
    if (xoption) {
        int enabled;
        const wchar_t *sep = wcschr(xoption, L'=');
        if (!sep || (config_wstr_to_int(sep + 1, &enabled) < 0) || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "-X thread_inherit_context=n: n is missing or invalid");
        }
        config->thread_inherit_context = enabled;
    }
    return _TyStatus_OK();
}

static TyStatus
config_init_context_aware_warnings(TyConfig *config)
{
    const char *env = config_get_env(config, "PYTHON_CONTEXT_AWARE_WARNINGS");
    if (env) {
        int enabled;
        if (_Ty_str_to_int(env, &enabled) < 0 || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "PYTHON_CONTEXT_AWARE_WARNINGS=N: N is missing or invalid");
        }
        config->context_aware_warnings = enabled;
    }

    const wchar_t *xoption = config_get_xoption(config, L"context_aware_warnings");
    if (xoption) {
        int enabled;
        const wchar_t *sep = wcschr(xoption, L'=');
        if (!sep || (config_wstr_to_int(sep + 1, &enabled) < 0) || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "-X context_aware_warnings=n: n is missing or invalid");
        }
        config->context_aware_warnings = enabled;
    }
    return _TyStatus_OK();
}

static TyStatus
config_init_tlbc(TyConfig *config)
{
#ifdef Ty_GIL_DISABLED
    const char *env = config_get_env(config, "PYTHON_TLBC");
    if (env) {
        int enabled;
        if (_Ty_str_to_int(env, &enabled) < 0 || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "PYTHON_TLBC=N: N is missing or invalid");
        }
        config->tlbc_enabled = enabled;
    }

    const wchar_t *xoption = config_get_xoption(config, L"tlbc");
    if (xoption) {
        int enabled;
        const wchar_t *sep = wcschr(xoption, L'=');
        if (!sep || (config_wstr_to_int(sep + 1, &enabled) < 0) || (enabled < 0) || (enabled > 1)) {
            return _TyStatus_ERR(
                "-X tlbc=n: n is missing or invalid");
        }
        config->tlbc_enabled = enabled;
    }
    return _TyStatus_OK();
#else
    return _TyStatus_OK();
#endif
}

static TyStatus
config_init_perf_profiling(TyConfig *config)
{
    int active = 0;
    const char *env = config_get_env(config, "PYTHONPERFSUPPORT");
    if (env) {
        if (_Ty_str_to_int(env, &active) != 0) {
            active = 0;
        }
        if (active) {
            config->perf_profiling = 1;
        }
    }
    const wchar_t *xoption = config_get_xoption(config, L"perf");
    if (xoption) {
        config->perf_profiling = 1;
    }
    env = config_get_env(config, "PYTHON_PERF_JIT_SUPPORT");
    if (env) {
        if (_Ty_str_to_int(env, &active) != 0) {
            active = 0;
        }
        if (active) {
            config->perf_profiling = 2;
        }
    }
    xoption = config_get_xoption(config, L"perf_jit");
    if (xoption) {
        config->perf_profiling = 2;
    }

    return _TyStatus_OK();

}

static TyStatus
config_init_remote_debug(TyConfig *config)
{
#ifndef Ty_REMOTE_DEBUG
    config->remote_debug = 0;
#else
    int active = 1;
    const char *env = Ty_GETENV("PYTHON_DISABLE_REMOTE_DEBUG");
    if (env) {
        active = 0;
    }
    const wchar_t *xoption = config_get_xoption(config, L"disable-remote-debug");
    if (xoption) {
        active = 0;
    }

    config->remote_debug = active;
#endif
    return _TyStatus_OK();

}

static TyStatus
config_init_tracemalloc(TyConfig *config)
{
    int nframe;
    int valid;

    const char *env = config_get_env(config, "PYTHONTRACEMALLOC");
    if (env) {
        if (!_Ty_str_to_int(env, &nframe)) {
            valid = (nframe >= 0);
        }
        else {
            valid = 0;
        }
        if (!valid) {
            return _TyStatus_ERR("PYTHONTRACEMALLOC: invalid number of frames");
        }
        config->tracemalloc = nframe;
    }

    const wchar_t *xoption = config_get_xoption(config, L"tracemalloc");
    if (xoption) {
        const wchar_t *sep = wcschr(xoption, L'=');
        if (sep) {
            if (!config_wstr_to_int(sep + 1, &nframe)) {
                valid = (nframe >= 0);
            }
            else {
                valid = 0;
            }
            if (!valid) {
                return _TyStatus_ERR("-X tracemalloc=NFRAME: "
                                     "invalid number of frames");
            }
        }
        else {
            /* -X tracemalloc behaves as -X tracemalloc=1 */
            nframe = 1;
        }
        config->tracemalloc = nframe;
    }
    return _TyStatus_OK();
}

static TyStatus
config_init_int_max_str_digits(TyConfig *config)
{
    int maxdigits;

    const char *env = config_get_env(config, "PYTHONINTMAXSTRDIGITS");
    if (env) {
        bool valid = 0;
        if (!_Ty_str_to_int(env, &maxdigits)) {
            valid = ((maxdigits == 0) || (maxdigits >= _PY_LONG_MAX_STR_DIGITS_THRESHOLD));
        }
        if (!valid) {
#define STRINGIFY(VAL) _STRINGIFY(VAL)
#define _STRINGIFY(VAL) #VAL
            return _TyStatus_ERR(
                    "PYTHONINTMAXSTRDIGITS: invalid limit; must be >= "
                    STRINGIFY(_PY_LONG_MAX_STR_DIGITS_THRESHOLD)
                    " or 0 for unlimited.");
        }
        config->int_max_str_digits = maxdigits;
    }

    const wchar_t *xoption = config_get_xoption(config, L"int_max_str_digits");
    if (xoption) {
        const wchar_t *sep = wcschr(xoption, L'=');
        bool valid = 0;
        if (sep) {
            if (!config_wstr_to_int(sep + 1, &maxdigits)) {
                valid = ((maxdigits == 0) || (maxdigits >= _PY_LONG_MAX_STR_DIGITS_THRESHOLD));
            }
        }
        if (!valid) {
            return _TyStatus_ERR(
                    "-X int_max_str_digits: invalid limit; must be >= "
                    STRINGIFY(_PY_LONG_MAX_STR_DIGITS_THRESHOLD)
                    " or 0 for unlimited.");
#undef _STRINGIFY
#undef STRINGIFY
        }
        config->int_max_str_digits = maxdigits;
    }
    if (config->int_max_str_digits < 0) {
        config->int_max_str_digits = _PY_LONG_DEFAULT_MAX_STR_DIGITS;
    }
    return _TyStatus_OK();
}

static TyStatus
config_init_pycache_prefix(TyConfig *config)
{
    assert(config->pycache_prefix == NULL);

    const wchar_t *xoption = config_get_xoption(config, L"pycache_prefix");
    if (xoption) {
        const wchar_t *sep = wcschr(xoption, L'=');
        if (sep && wcslen(sep) > 1) {
            config->pycache_prefix = _TyMem_RawWcsdup(sep + 1);
            if (config->pycache_prefix == NULL) {
                return _TyStatus_NO_MEMORY();
            }
        }
        else {
            // PYTHONPYCACHEPREFIX env var ignored
            // if "-X pycache_prefix=" option is used
            config->pycache_prefix = NULL;
        }
        return _TyStatus_OK();
    }

    return CONFIG_GET_ENV_DUP(config, &config->pycache_prefix,
                              L"PYTHONPYCACHEPREFIX",
                              "PYTHONPYCACHEPREFIX");
}


#ifdef Ty_DEBUG
static TyStatus
config_init_run_presite(TyConfig *config)
{
    assert(config->run_presite == NULL);

    const wchar_t *xoption = config_get_xoption(config, L"presite");
    if (xoption) {
        const wchar_t *sep = wcschr(xoption, L'=');
        if (sep && wcslen(sep) > 1) {
            config->run_presite = _TyMem_RawWcsdup(sep + 1);
            if (config->run_presite == NULL) {
                return _TyStatus_NO_MEMORY();
            }
        }
        else {
            // PYTHON_PRESITE env var ignored
            // if "-X presite=" option is used
            config->run_presite = NULL;
        }
        return _TyStatus_OK();
    }

    return CONFIG_GET_ENV_DUP(config, &config->run_presite,
                              L"PYTHON_PRESITE",
                              "PYTHON_PRESITE");
}
#endif

static TyStatus
config_init_import_time(TyConfig *config)
{
    int importtime = 0;

    const char *env = config_get_env(config, "PYTHONPROFILEIMPORTTIME");
    if (env) {
        if (_Ty_str_to_int(env, &importtime) != 0) {
            importtime = 1;
        }
        if (importtime < 0 || importtime > 2) {
            return _TyStatus_ERR(
                "PYTHONPROFILEIMPORTTIME: numeric values other than 1 and 2 "
                "are reserved for future use.");
        }
    }

    const wchar_t *x_value = config_get_xoption_value(config, L"importtime");
    if (x_value) {
        if (*x_value == 0 || config_wstr_to_int(x_value, &importtime) != 0) {
            importtime = 1;
        }
        if (importtime < 0 || importtime > 2) {
            return _TyStatus_ERR(
                "-X importtime: values other than 1 and 2 "
                "are reserved for future use.");
        }
    }

    config->import_time = importtime;
    return _TyStatus_OK();
}

static TyStatus
config_read_complex_options(TyConfig *config)
{
    /* More complex options configured by env var and -X option */
    if (config->faulthandler < 0) {
        if (config_get_env(config, "PYTHONFAULTHANDLER")
           || config_get_xoption(config, L"faulthandler")) {
            config->faulthandler = 1;
        }
    }
    if (config_get_env(config, "PYTHONNODEBUGRANGES")
       || config_get_xoption(config, L"no_debug_ranges")) {
        config->code_debug_ranges = 0;
    }

    TyStatus status;
    if (config->import_time < 0) {
        status = config_init_import_time(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->tracemalloc < 0) {
        status = config_init_tracemalloc(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->perf_profiling < 0) {
        status = config_init_perf_profiling(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->remote_debug < 0) {
        status = config_init_remote_debug(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->int_max_str_digits < 0) {
        status = config_init_int_max_str_digits(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->cpu_count < 0) {
        status = config_init_cpu_count(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->pycache_prefix == NULL) {
        status = config_init_pycache_prefix(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

#ifdef Ty_DEBUG
    if (config->run_presite == NULL) {
        status = config_init_run_presite(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
#endif

    status = config_init_thread_inherit_context(config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = config_init_context_aware_warnings(config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = config_init_tlbc(config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    return _TyStatus_OK();
}


static const wchar_t *
config_get_stdio_errors(const TyPreConfig *preconfig)
{
    if (preconfig->utf8_mode) {
        /* UTF-8 Mode uses UTF-8/surrogateescape */
        return L"surrogateescape";
    }

#ifndef MS_WINDOWS
    const char *loc = setlocale(LC_CTYPE, NULL);
    if (loc != NULL) {
        /* surrogateescape is the default in the legacy C and POSIX locales */
        if (strcmp(loc, "C") == 0 || strcmp(loc, "POSIX") == 0) {
            return L"surrogateescape";
        }

#ifdef PY_COERCE_C_LOCALE
        /* surrogateescape is the default in locale coercion target locales */
        if (_Ty_IsLocaleCoercionTarget(loc)) {
            return L"surrogateescape";
        }
#endif
    }

    return L"strict";
#else
    /* On Windows, always use surrogateescape by default */
    return L"surrogateescape";
#endif
}


// See also config_get_fs_encoding()
static TyStatus
config_get_locale_encoding(TyConfig *config, const TyPreConfig *preconfig,
                           wchar_t **locale_encoding)
{
    wchar_t *encoding;
    if (preconfig->utf8_mode) {
        encoding = _TyMem_RawWcsdup(L"utf-8");
    }
    else {
        encoding = _Ty_GetLocaleEncoding();
    }
    if (encoding == NULL) {
        return _TyStatus_NO_MEMORY();
    }
    TyStatus status = TyConfig_SetString(config, locale_encoding, encoding);
    TyMem_RawFree(encoding);
    return status;
}


static TyStatus
config_init_stdio_encoding(TyConfig *config,
                           const TyPreConfig *preconfig)
{
    TyStatus status;

    // Exit if encoding and errors are defined
    if (config->stdio_encoding != NULL && config->stdio_errors != NULL) {
        return _TyStatus_OK();
    }

    /* PYTHONIOENCODING environment variable */
    const char *opt = config_get_env(config, "PYTHONIOENCODING");
    if (opt) {
        char *pythonioencoding = _TyMem_RawStrdup(opt);
        if (pythonioencoding == NULL) {
            return _TyStatus_NO_MEMORY();
        }

        char *errors = strchr(pythonioencoding, ':');
        if (errors) {
            *errors = '\0';
            errors++;
            if (!errors[0]) {
                errors = NULL;
            }
        }

        /* Does PYTHONIOENCODING contain an encoding? */
        if (pythonioencoding[0]) {
            if (config->stdio_encoding == NULL) {
                status = CONFIG_SET_BYTES_STR(config, &config->stdio_encoding,
                                              pythonioencoding,
                                              "PYTHONIOENCODING environment variable");
                if (_TyStatus_EXCEPTION(status)) {
                    TyMem_RawFree(pythonioencoding);
                    return status;
                }
            }

            /* If the encoding is set but not the error handler,
               use "strict" error handler by default.
               PYTHONIOENCODING=latin1 behaves as
               PYTHONIOENCODING=latin1:strict. */
            if (!errors) {
                errors = "strict";
            }
        }

        if (config->stdio_errors == NULL && errors != NULL) {
            status = CONFIG_SET_BYTES_STR(config, &config->stdio_errors,
                                          errors,
                                          "PYTHONIOENCODING environment variable");
            if (_TyStatus_EXCEPTION(status)) {
                TyMem_RawFree(pythonioencoding);
                return status;
            }
        }

        TyMem_RawFree(pythonioencoding);
    }

    /* Choose the default error handler based on the current locale. */
    if (config->stdio_encoding == NULL) {
        status = config_get_locale_encoding(config, preconfig,
                                            &config->stdio_encoding);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    if (config->stdio_errors == NULL) {
        const wchar_t *errors = config_get_stdio_errors(preconfig);
        assert(errors != NULL);

        status = TyConfig_SetString(config, &config->stdio_errors, errors);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    return _TyStatus_OK();
}


// See also config_get_locale_encoding()
static TyStatus
config_get_fs_encoding(TyConfig *config, const TyPreConfig *preconfig,
                       wchar_t **fs_encoding)
{
#ifdef _Ty_FORCE_UTF8_FS_ENCODING
    return TyConfig_SetString(config, fs_encoding, L"utf-8");
#elif defined(MS_WINDOWS)
    const wchar_t *encoding;
    if (preconfig->legacy_windows_fs_encoding) {
        // Legacy Windows filesystem encoding: mbcs/replace
        encoding = L"mbcs";
    }
    else {
        // Windows defaults to utf-8/surrogatepass (PEP 529)
        encoding = L"utf-8";
    }
     return TyConfig_SetString(config, fs_encoding, encoding);
#else  // !MS_WINDOWS
    if (preconfig->utf8_mode) {
        return TyConfig_SetString(config, fs_encoding, L"utf-8");
    }

    if (_Ty_GetForceASCII()) {
        return TyConfig_SetString(config, fs_encoding, L"ascii");
    }

    return config_get_locale_encoding(config, preconfig, fs_encoding);
#endif  // !MS_WINDOWS
}


static TyStatus
config_init_fs_encoding(TyConfig *config, const TyPreConfig *preconfig)
{
    TyStatus status;

    if (config->filesystem_encoding == NULL) {
        status = config_get_fs_encoding(config, preconfig,
                                        &config->filesystem_encoding);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->filesystem_errors == NULL) {
        const wchar_t *errors;
#ifdef MS_WINDOWS
        if (preconfig->legacy_windows_fs_encoding) {
            errors = L"replace";
        }
        else {
            errors = L"surrogatepass";
        }
#else
        errors = L"surrogateescape";
#endif
        status = TyConfig_SetString(config, &config->filesystem_errors, errors);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    return _TyStatus_OK();
}


static TyStatus
config_init_import(TyConfig *config, int compute_path_config)
{
    TyStatus status;

    status = _TyConfig_InitPathConfig(config, compute_path_config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    const char *env = config_get_env(config, "PYTHON_FROZEN_MODULES");
    if (env == NULL) {
    }
    else if (strcmp(env, "on") == 0) {
        config->use_frozen_modules = 1;
    }
    else if (strcmp(env, "off") == 0) {
        config->use_frozen_modules = 0;
    } else {
        return TyStatus_Error("bad value for PYTHON_FROZEN_MODULES "
                              "(expected \"on\" or \"off\")");
    }

    /* -X frozen_modules=[on|off] */
    const wchar_t *value = config_get_xoption_value(config, L"frozen_modules");
    if (value == NULL) {
    }
    else if (wcscmp(value, L"on") == 0) {
        config->use_frozen_modules = 1;
    }
    else if (wcscmp(value, L"off") == 0) {
        config->use_frozen_modules = 0;
    }
    else if (wcslen(value) == 0) {
        // "-X frozen_modules" and "-X frozen_modules=" both imply "on".
        config->use_frozen_modules = 1;
    }
    else {
        return TyStatus_Error("bad value for option -X frozen_modules "
                              "(expected \"on\" or \"off\")");
    }

    assert(config->use_frozen_modules >= 0);
    return _TyStatus_OK();
}

TyStatus
_TyConfig_InitImportConfig(TyConfig *config)
{
    return config_init_import(config, 1);
}


static TyStatus
config_read(TyConfig *config, int compute_path_config)
{
    TyStatus status;
    const TyPreConfig *preconfig = &_PyRuntime.preconfig;

    if (config->use_environment) {
        status = config_read_env_vars(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    /* -X options */
    if (config_get_xoption(config, L"showrefcount")) {
        config->show_ref_count = 1;
    }

    const wchar_t *x_gil = config_get_xoption_value(config, L"gil");
    if (x_gil != NULL) {
        size_t len = wcslen(x_gil);
        status = config_read_gil(config, len, x_gil[0]);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

#ifdef Ty_STATS
    if (config_get_xoption(config, L"pystats")) {
        config->_pystats = 1;
    }
    else if (config_get_env(config, "PYTHONSTATS")) {
        config->_pystats = 1;
    }
    if (config->_pystats < 0) {
        config->_pystats = 0;
    }
#endif

    status = config_read_complex_options(config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (config->_install_importlib) {
        status = config_init_import(config, compute_path_config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    /* default values */
    if (config->dev_mode) {
        if (config->faulthandler < 0) {
            config->faulthandler = 1;
        }
    }
    if (config->faulthandler < 0) {
        config->faulthandler = 0;
    }
    if (config->tracemalloc < 0) {
        config->tracemalloc = 0;
    }
    if (config->perf_profiling < 0) {
        config->perf_profiling = 0;
    }
    if (config->remote_debug < 0) {
        config->remote_debug = -1;
    }
    if (config->use_hash_seed < 0) {
        config->use_hash_seed = 0;
        config->hash_seed = 0;
    }

    if (config->filesystem_encoding == NULL || config->filesystem_errors == NULL) {
        status = config_init_fs_encoding(config, preconfig);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    status = config_init_stdio_encoding(config, preconfig);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (config->argv.length < 1) {
        /* Ensure at least one (empty) argument is seen */
        status = TyWideStringList_Append(&config->argv, L"");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->check_hash_pycs_mode == NULL) {
        status = TyConfig_SetString(config, &config->check_hash_pycs_mode,
                                    L"default");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (config->configure_c_stdio < 0) {
        config->configure_c_stdio = 1;
    }

    // Only parse arguments once.
    if (config->parse_argv == 1) {
        config->parse_argv = 2;
    }

    return _TyStatus_OK();
}


static void
config_init_stdio(const TyConfig *config)
{
#if defined(MS_WINDOWS) || defined(__CYGWIN__)
    /* don't translate newlines (\r\n <=> \n) */
    _setmode(fileno(stdin), O_BINARY);
    _setmode(fileno(stdout), O_BINARY);
    _setmode(fileno(stderr), O_BINARY);
#endif

    if (!config->buffered_stdio) {
#ifdef HAVE_SETVBUF
        setvbuf(stdin,  (char *)NULL, _IONBF, BUFSIZ);
        setvbuf(stdout, (char *)NULL, _IONBF, BUFSIZ);
        setvbuf(stderr, (char *)NULL, _IONBF, BUFSIZ);
#else /* !HAVE_SETVBUF */
        setbuf(stdin,  (char *)NULL);
        setbuf(stdout, (char *)NULL);
        setbuf(stderr, (char *)NULL);
#endif /* !HAVE_SETVBUF */
    }
    else if (config->interactive) {
#ifdef MS_WINDOWS
        /* Doesn't have to have line-buffered -- use unbuffered */
        /* Any set[v]buf(stdin, ...) screws up Tkinter :-( */
        setvbuf(stdout, (char *)NULL, _IONBF, BUFSIZ);
#else /* !MS_WINDOWS */
#ifdef HAVE_SETVBUF
        setvbuf(stdin,  (char *)NULL, _IOLBF, BUFSIZ);
        setvbuf(stdout, (char *)NULL, _IOLBF, BUFSIZ);
#endif /* HAVE_SETVBUF */
#endif /* !MS_WINDOWS */
        /* Leave stderr alone - it should be unbuffered anyway. */
    }
}


/* Write the configuration:

   - set Ty_xxx global configuration variables
   - initialize C standard streams (stdin, stdout, stderr) */
TyStatus
_TyConfig_Write(const TyConfig *config, _PyRuntimeState *runtime)
{
    config_set_global_vars(config);

    if (config->configure_c_stdio) {
        config_init_stdio(config);
    }

    /* Write the new pre-configuration into _PyRuntime */
    TyPreConfig *preconfig = &runtime->preconfig;
    preconfig->isolated = config->isolated;
    preconfig->use_environment = config->use_environment;
    preconfig->dev_mode = config->dev_mode;

    if (_Ty_SetArgcArgv(config->orig_argv.length,
                        config->orig_argv.items) < 0)
    {
        return _TyStatus_NO_MEMORY();
    }

#ifdef Ty_STATS
    if (config->_pystats) {
        _Ty_StatsOn();
    }
#endif

    return _TyStatus_OK();
}


/* --- TyConfig command line parser -------------------------- */

static void
config_usage(int error, const wchar_t* program)
{
    FILE *f = error ? stderr : stdout;

    fprintf(f, usage_line, program);
    if (error)
        fprintf(f, "Try `python -h' for more information.\n");
    else {
        fputs(usage_help, f);
    }
}

static void
config_envvars_usage(void)
{
    printf(usage_envvars, (wint_t)DELIM, (wint_t)DELIM, PYTHONHOMEHELP);
}

static void
config_xoptions_usage(void)
{
    puts(usage_xoptions);
}

static void
config_complete_usage(const wchar_t* program)
{
   config_usage(0, program);
   putchar('\n');
   config_envvars_usage();
   putchar('\n');
   config_xoptions_usage();
}


/* Parse the command line arguments */
static TyStatus
config_parse_cmdline(TyConfig *config, TyWideStringList *warnoptions,
                     Ty_ssize_t *opt_index)
{
    TyStatus status;
    const TyWideStringList *argv = &config->argv;
    int print_version = 0;
    const wchar_t* program = config->program_name;
    if (!program && argv->length >= 1) {
        program = argv->items[0];
    }

    _TyOS_ResetGetOpt();
    do {
        int longindex = -1;
        int c = _TyOS_GetOpt(argv->length, argv->items, &longindex);
        if (c == EOF) {
            break;
        }

        if (c == 'c') {
            if (config->run_command == NULL) {
                /* -c is the last option; following arguments
                   that look like options are left for the
                   command to interpret. */
                size_t len = wcslen(_TyOS_optarg) + 1 + 1;
                wchar_t *command = TyMem_RawMalloc(sizeof(wchar_t) * len);
                if (command == NULL) {
                    return _TyStatus_NO_MEMORY();
                }
                memcpy(command, _TyOS_optarg, (len - 2) * sizeof(wchar_t));
                command[len - 2] = '\n';
                command[len - 1] = 0;
                config->run_command = command;
            }
            break;
        }

        if (c == 'm') {
            /* -m is the last option; following arguments
               that look like options are left for the
               module to interpret. */
            if (config->run_module == NULL) {
                config->run_module = _TyMem_RawWcsdup(_TyOS_optarg);
                if (config->run_module == NULL) {
                    return _TyStatus_NO_MEMORY();
                }
            }
            break;
        }

        switch (c) {
        // Integers represent long options, see Python/getopt.c
        case 0:
            // check-hash-based-pycs
            if (wcscmp(_TyOS_optarg, L"always") == 0
                || wcscmp(_TyOS_optarg, L"never") == 0
                || wcscmp(_TyOS_optarg, L"default") == 0)
            {
                status = TyConfig_SetString(config, &config->check_hash_pycs_mode,
                                            _TyOS_optarg);
                if (_TyStatus_EXCEPTION(status)) {
                    return status;
                }
            } else {
                fprintf(stderr, "--check-hash-based-pycs must be one of "
                        "'default', 'always', or 'never'\n");
                config_usage(1, program);
                return _TyStatus_EXIT(2);
            }
            break;

        case 1:
            // help-all
            config_complete_usage(program);
            return _TyStatus_EXIT(0);

        case 2:
            // help-env
            config_envvars_usage();
            return _TyStatus_EXIT(0);

        case 3:
            // help-xoptions
            config_xoptions_usage();
            return _TyStatus_EXIT(0);

        case 'b':
            config->bytes_warning++;
            break;

        case 'd':
            config->parser_debug++;
            break;

        case 'i':
            config->inspect++;
            config->interactive++;
            break;

        case 'E':
        case 'I':
        case 'X':
            /* option handled by _PyPreCmdline_Read() */
            break;

        case 'O':
            config->optimization_level++;
            break;

        case 'P':
            config->safe_path = 1;
            break;

        case 'B':
            config->write_bytecode = 0;
            break;

        case 's':
            config->user_site_directory = 0;
            break;

        case 'S':
            config->site_import = 0;
            break;

        case 't':
            /* ignored for backwards compatibility */
            break;

        case 'u':
            config->buffered_stdio = 0;
            break;

        case 'v':
            config->verbose++;
            break;

        case 'x':
            config->skip_source_first_line = 1;
            break;

        case 'h':
        case '?':
            config_usage(0, program);
            return _TyStatus_EXIT(0);

        case 'V':
            print_version++;
            break;

        case 'W':
            status = TyWideStringList_Append(warnoptions, _TyOS_optarg);
            if (_TyStatus_EXCEPTION(status)) {
                return status;
            }
            break;

        case 'q':
            config->quiet++;
            break;

        case 'R':
            config->use_hash_seed = 0;
            break;

        /* This space reserved for other options */

        default:
            /* unknown argument: parsing failed */
            config_usage(1, program);
            return _TyStatus_EXIT(2);
        }
    } while (1);

    if (print_version) {
        printf("Typthon %s\n",
                (print_version >= 2) ? Ty_GetVersion() : PY_VERSION);
        return _TyStatus_EXIT(0);
    }

    if (config->run_command == NULL && config->run_module == NULL
        && _TyOS_optind < argv->length
        && wcscmp(argv->items[_TyOS_optind], L"-") != 0
        && config->run_filename == NULL)
    {
        config->run_filename = _TyMem_RawWcsdup(argv->items[_TyOS_optind]);
        if (config->run_filename == NULL) {
            return _TyStatus_NO_MEMORY();
        }
    }

    if (config->run_command != NULL || config->run_module != NULL) {
        /* Backup _TyOS_optind */
        _TyOS_optind--;
    }

    *opt_index = _TyOS_optind;

    return _TyStatus_OK();
}


#ifdef MS_WINDOWS
#  define WCSTOK wcstok_s
#else
#  define WCSTOK wcstok
#endif

/* Get warning options from PYTHONWARNINGS environment variable. */
static TyStatus
config_init_env_warnoptions(TyConfig *config, TyWideStringList *warnoptions)
{
    TyStatus status;
    /* CONFIG_GET_ENV_DUP requires dest to be initialized to NULL */
    wchar_t *env = NULL;
    status = CONFIG_GET_ENV_DUP(config, &env,
                             L"PYTHONWARNINGS", "PYTHONWARNINGS");
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    /* env var is not set or is empty */
    if (env == NULL) {
        return _TyStatus_OK();
    }


    wchar_t *warning, *context = NULL;
    for (warning = WCSTOK(env, L",", &context);
         warning != NULL;
         warning = WCSTOK(NULL, L",", &context))
    {
        status = TyWideStringList_Append(warnoptions, warning);
        if (_TyStatus_EXCEPTION(status)) {
            TyMem_RawFree(env);
            return status;
        }
    }
    TyMem_RawFree(env);
    return _TyStatus_OK();
}


static TyStatus
warnoptions_append(TyConfig *config, TyWideStringList *options,
                   const wchar_t *option)
{
    /* config_init_warnoptions() add existing config warnoptions at the end:
       ensure that the new option is not already present in this list to
       prevent change the options order when config_init_warnoptions() is
       called twice. */
    if (_TyWideStringList_Find(&config->warnoptions, option)) {
        /* Already present: do nothing */
        return _TyStatus_OK();
    }
    if (_TyWideStringList_Find(options, option)) {
        /* Already present: do nothing */
        return _TyStatus_OK();
    }
    return TyWideStringList_Append(options, option);
}


static TyStatus
warnoptions_extend(TyConfig *config, TyWideStringList *options,
                   const TyWideStringList *options2)
{
    const Ty_ssize_t len = options2->length;
    wchar_t *const *items = options2->items;

    for (Ty_ssize_t i = 0; i < len; i++) {
        TyStatus status = warnoptions_append(config, options, items[i]);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    return _TyStatus_OK();
}


static TyStatus
config_init_warnoptions(TyConfig *config,
                        const TyWideStringList *cmdline_warnoptions,
                        const TyWideStringList *env_warnoptions,
                        const TyWideStringList *sys_warnoptions)
{
    TyStatus status;
    TyWideStringList options = _TyWideStringList_INIT;

    /* Priority of warnings options, lowest to highest:
     *
     * - any implicit filters added by _warnings.c/warnings.py
     * - TyConfig.dev_mode: "default" filter
     * - PYTHONWARNINGS environment variable
     * - '-W' command line options
     * - TyConfig.bytes_warning ('-b' and '-bb' command line options):
     *   "default::BytesWarning" or "error::BytesWarning" filter
     * - early TySys_AddWarnOption() calls
     * - TyConfig.warnoptions
     *
     * TyConfig.warnoptions is copied to sys.warnoptions. Since the warnings
     * module works on the basis of "the most recently added filter will be
     * checked first", we add the lowest precedence entries first so that later
     * entries override them.
     */

    if (config->dev_mode) {
        status = warnoptions_append(config, &options, L"default");
        if (_TyStatus_EXCEPTION(status)) {
            goto error;
        }
    }

    status = warnoptions_extend(config, &options, env_warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    status = warnoptions_extend(config, &options, cmdline_warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    /* If the bytes_warning_flag isn't set, bytesobject.c and bytearrayobject.c
     * don't even try to emit a warning, so we skip setting the filter in that
     * case.
     */
    if (config->bytes_warning) {
        const wchar_t *filter;
        if (config->bytes_warning> 1) {
            filter = L"error::BytesWarning";
        }
        else {
            filter = L"default::BytesWarning";
        }
        status = warnoptions_append(config, &options, filter);
        if (_TyStatus_EXCEPTION(status)) {
            goto error;
        }
    }

    status = warnoptions_extend(config, &options, sys_warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    /* Always add all TyConfig.warnoptions options */
    status = _TyWideStringList_Extend(&options, &config->warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    _TyWideStringList_Clear(&config->warnoptions);
    config->warnoptions = options;
    return _TyStatus_OK();

error:
    _TyWideStringList_Clear(&options);
    return status;
}


static TyStatus
config_update_argv(TyConfig *config, Ty_ssize_t opt_index)
{
    const TyWideStringList *cmdline_argv = &config->argv;
    TyWideStringList config_argv = _TyWideStringList_INIT;

    /* Copy argv to be able to modify it (to force -c/-m) */
    if (cmdline_argv->length <= opt_index) {
        /* Ensure at least one (empty) argument is seen */
        TyStatus status = TyWideStringList_Append(&config_argv, L"");
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    else {
        TyWideStringList slice;
        slice.length = cmdline_argv->length - opt_index;
        slice.items = &cmdline_argv->items[opt_index];
        if (_TyWideStringList_Copy(&config_argv, &slice) < 0) {
            return _TyStatus_NO_MEMORY();
        }
    }
    assert(config_argv.length >= 1);

    wchar_t *arg0 = NULL;
    if (config->run_command != NULL) {
        /* Force sys.argv[0] = '-c' */
        arg0 = L"-c";
    }
    else if (config->run_module != NULL) {
        /* Force sys.argv[0] = '-m'*/
        arg0 = L"-m";
    }

    if (arg0 != NULL) {
        arg0 = _TyMem_RawWcsdup(arg0);
        if (arg0 == NULL) {
            _TyWideStringList_Clear(&config_argv);
            return _TyStatus_NO_MEMORY();
        }

        TyMem_RawFree(config_argv.items[0]);
        config_argv.items[0] = arg0;
    }

    _TyWideStringList_Clear(&config->argv);
    config->argv = config_argv;
    return _TyStatus_OK();
}


static TyStatus
core_read_precmdline(TyConfig *config, _PyPreCmdline *precmdline)
{
    TyStatus status;

    if (config->parse_argv == 1) {
        if (_TyWideStringList_Copy(&precmdline->argv, &config->argv) < 0) {
            return _TyStatus_NO_MEMORY();
        }
    }

    TyPreConfig preconfig;

    status = _TyPreConfig_InitFromPreConfig(&preconfig, &_PyRuntime.preconfig);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    _TyPreConfig_GetConfig(&preconfig, config);

    status = _PyPreCmdline_Read(precmdline, &preconfig);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _PyPreCmdline_SetConfig(precmdline, config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    return _TyStatus_OK();
}


/* Get run_filename absolute path */
static TyStatus
config_run_filename_abspath(TyConfig *config)
{
    if (!config->run_filename) {
        return _TyStatus_OK();
    }

#ifndef MS_WINDOWS
    if (_Ty_isabs(config->run_filename)) {
        /* path is already absolute */
        return _TyStatus_OK();
    }
#endif

    wchar_t *abs_filename;
    if (_Ty_abspath(config->run_filename, &abs_filename) < 0) {
        /* failed to get the absolute path of the command line filename:
           ignore the error, keep the relative path */
        return _TyStatus_OK();
    }
    if (abs_filename == NULL) {
        return _TyStatus_NO_MEMORY();
    }

    TyMem_RawFree(config->run_filename);
    config->run_filename = abs_filename;
    return _TyStatus_OK();
}


static TyStatus
config_read_cmdline(TyConfig *config)
{
    TyStatus status;
    TyWideStringList cmdline_warnoptions = _TyWideStringList_INIT;
    TyWideStringList env_warnoptions = _TyWideStringList_INIT;
    TyWideStringList sys_warnoptions = _TyWideStringList_INIT;

    if (config->parse_argv < 0) {
        config->parse_argv = 1;
    }

    if (config->parse_argv == 1) {
        Ty_ssize_t opt_index;
        status = config_parse_cmdline(config, &cmdline_warnoptions, &opt_index);
        if (_TyStatus_EXCEPTION(status)) {
            goto done;
        }

        status = config_run_filename_abspath(config);
        if (_TyStatus_EXCEPTION(status)) {
            goto done;
        }

        status = config_update_argv(config, opt_index);
        if (_TyStatus_EXCEPTION(status)) {
            goto done;
        }
    }
    else {
        status = config_run_filename_abspath(config);
        if (_TyStatus_EXCEPTION(status)) {
            goto done;
        }
    }

    if (config->use_environment) {
        status = config_init_env_warnoptions(config, &env_warnoptions);
        if (_TyStatus_EXCEPTION(status)) {
            goto done;
        }
    }

    /* Handle early TySys_AddWarnOption() calls */
    status = _TySys_ReadPreinitWarnOptions(&sys_warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = config_init_warnoptions(config,
                                     &cmdline_warnoptions,
                                     &env_warnoptions,
                                     &sys_warnoptions);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = _TyStatus_OK();

done:
    _TyWideStringList_Clear(&cmdline_warnoptions);
    _TyWideStringList_Clear(&env_warnoptions);
    _TyWideStringList_Clear(&sys_warnoptions);
    return status;
}


TyStatus
_TyConfig_SetPyArgv(TyConfig *config, const _PyArgv *args)
{
    TyStatus status = _Ty_PreInitializeFromConfig(config, args);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    return _PyArgv_AsWstrList(args, &config->argv);
}


/* Set config.argv: decode argv using Ty_DecodeLocale(). Pre-initialize Python
   if needed to ensure that encodings are properly configured. */
TyStatus
TyConfig_SetBytesArgv(TyConfig *config, Ty_ssize_t argc, char * const *argv)
{
    _PyArgv args = {
        .argc = argc,
        .use_bytes_argv = 1,
        .bytes_argv = argv,
        .wchar_argv = NULL};
    return _TyConfig_SetPyArgv(config, &args);
}


TyStatus
TyConfig_SetArgv(TyConfig *config, Ty_ssize_t argc, wchar_t * const *argv)
{
    _PyArgv args = {
        .argc = argc,
        .use_bytes_argv = 0,
        .bytes_argv = NULL,
        .wchar_argv = argv};
    return _TyConfig_SetPyArgv(config, &args);
}


TyStatus
TyConfig_SetWideStringList(TyConfig *config, TyWideStringList *list,
                           Ty_ssize_t length, wchar_t **items)
{
    TyStatus status = _Ty_PreInitializeFromConfig(config, NULL);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyWideStringList list2 = {.length = length, .items = items};
    if (_TyWideStringList_Copy(list, &list2) < 0) {
        return _TyStatus_NO_MEMORY();
    }
    return _TyStatus_OK();
}


/* Read the configuration into TyConfig from:

   * Command line arguments
   * Environment variables
   * Ty_xxx global configuration variables

   The only side effects are to modify config and to call _Ty_SetArgcArgv(). */
TyStatus
_TyConfig_Read(TyConfig *config, int compute_path_config)
{
    TyStatus status;

    status = _Ty_PreInitializeFromConfig(config, NULL);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    config_get_global_vars(config);

    if (config->orig_argv.length == 0
        && !(config->argv.length == 1
             && wcscmp(config->argv.items[0], L"") == 0))
    {
        if (_TyWideStringList_Copy(&config->orig_argv, &config->argv) < 0) {
            return _TyStatus_NO_MEMORY();
        }
    }

    _PyPreCmdline precmdline = _PyPreCmdline_INIT;
    status = core_read_precmdline(config, &precmdline);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    assert(config->isolated >= 0);
    if (config->isolated) {
        config->safe_path = 1;
        config->use_environment = 0;
        config->user_site_directory = 0;
    }

    status = config_read_cmdline(config);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    /* Handle early TySys_AddXOption() calls */
    status = _TySys_ReadPreinitXOptions(config);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = config_read(config, compute_path_config);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    assert(config_check_consistency(config));

    status = _TyStatus_OK();

done:
    _PyPreCmdline_Clear(&precmdline);
    return status;
}


TyStatus
TyConfig_Read(TyConfig *config)
{
    return _TyConfig_Read(config, 0);
}


TyObject*
_Ty_GetConfigsAsDict(void)
{
    TyObject *result = NULL;
    TyObject *dict = NULL;

    result = TyDict_New();
    if (result == NULL) {
        goto error;
    }

    /* global result */
    dict = _Ty_GetGlobalVariablesAsDict();
    if (dict == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(result, "global_config", dict) < 0) {
        goto error;
    }
    Ty_CLEAR(dict);

    /* pre config */
    TyInterpreterState *interp = _TyInterpreterState_GET();
    const TyPreConfig *pre_config = &interp->runtime->preconfig;
    dict = _TyPreConfig_AsDict(pre_config);
    if (dict == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(result, "pre_config", dict) < 0) {
        goto error;
    }
    Ty_CLEAR(dict);

    /* core config */
    const TyConfig *config = _TyInterpreterState_GetConfig(interp);
    dict = _TyConfig_AsDict(config);
    if (dict == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(result, "config", dict) < 0) {
        goto error;
    }
    Ty_CLEAR(dict);

    return result;

error:
    Ty_XDECREF(result);
    Ty_XDECREF(dict);
    return NULL;
}


static void
init_dump_ascii_wstr(const wchar_t *str)
{
    if (str == NULL) {
        TySys_WriteStderr("(not set)");
        return;
    }

    TySys_WriteStderr("'");
    for (; *str != L'\0'; str++) {
        unsigned int ch = (unsigned int)*str;
        if (ch == L'\'') {
            TySys_WriteStderr("\\'");
        } else if (0x20 <= ch && ch < 0x7f) {
            TySys_WriteStderr("%c", ch);
        }
        else if (ch <= 0xff) {
            TySys_WriteStderr("\\x%02x", ch);
        }
#if SIZEOF_WCHAR_T > 2
        else if (ch > 0xffff) {
            TySys_WriteStderr("\\U%08x", ch);
        }
#endif
        else {
            TySys_WriteStderr("\\u%04x", ch);
        }
    }
    TySys_WriteStderr("'");
}


/* Dump the Python path configuration into sys.stderr */
void
_Ty_DumpPathConfig(TyThreadState *tstate)
{
    TyObject *exc = _TyErr_GetRaisedException(tstate);

    TySys_WriteStderr("Typthon path configuration:\n");

#define DUMP_CONFIG(NAME, FIELD) \
        do { \
            TySys_WriteStderr("  " NAME " = "); \
            init_dump_ascii_wstr(config->FIELD); \
            TySys_WriteStderr("\n"); \
        } while (0)

    const TyConfig *config = _TyInterpreterState_GetConfig(tstate->interp);
    DUMP_CONFIG("PYTHONHOME", home);
    DUMP_CONFIG("PYTHONPATH", pythonpath_env);
    DUMP_CONFIG("program name", program_name);
    TySys_WriteStderr("  isolated = %i\n", config->isolated);
    TySys_WriteStderr("  environment = %i\n", config->use_environment);
    TySys_WriteStderr("  user site = %i\n", config->user_site_directory);
    TySys_WriteStderr("  safe_path = %i\n", config->safe_path);
    TySys_WriteStderr("  import site = %i\n", config->site_import);
    TySys_WriteStderr("  is in build tree = %i\n", config->_is_python_build);
    DUMP_CONFIG("stdlib dir", stdlib_dir);
    DUMP_CONFIG("sys.path[0]", sys_path_0);
#undef DUMP_CONFIG

#define DUMP_SYS(NAME) \
        do { \
            TySys_FormatStderr("  sys.%s = ", #NAME); \
            if (_TySys_GetOptionalAttrString(#NAME, &obj) < 0) { \
                TyErr_Clear(); \
            } \
            if (obj != NULL) { \
                TySys_FormatStderr("%A", obj); \
                Ty_DECREF(obj); \
            } \
            else { \
                TySys_WriteStderr("(not set)"); \
            } \
            TySys_FormatStderr("\n"); \
        } while (0)

    TyObject *obj;
    DUMP_SYS(_base_executable);
    DUMP_SYS(base_prefix);
    DUMP_SYS(base_exec_prefix);
    DUMP_SYS(platlibdir);
    DUMP_SYS(executable);
    DUMP_SYS(prefix);
    DUMP_SYS(exec_prefix);
#undef DUMP_SYS

    TyObject *sys_path;
    (void) _TySys_GetOptionalAttrString("path", &sys_path);
    if (sys_path != NULL && TyList_Check(sys_path)) {
        TySys_WriteStderr("  sys.path = [\n");
        Ty_ssize_t len = TyList_GET_SIZE(sys_path);
        for (Ty_ssize_t i=0; i < len; i++) {
            TyObject *path = TyList_GET_ITEM(sys_path, i);
            TySys_FormatStderr("    %A,\n", path);
        }
        TySys_WriteStderr("  ]\n");
    }
    Ty_XDECREF(sys_path);

    _TyErr_SetRaisedException(tstate, exc);
}


// --- PyInitConfig API ---------------------------------------------------

struct PyInitConfig {
    TyPreConfig preconfig;
    TyConfig config;
    struct _inittab *inittab;
    Ty_ssize_t inittab_size;
    TyStatus status;
    char *err_msg;
};

static PyInitConfig*
initconfig_alloc(void)
{
    return calloc(1, sizeof(PyInitConfig));
}


PyInitConfig*
PyInitConfig_Create(void)
{
    PyInitConfig *config = initconfig_alloc();
    if (config == NULL) {
        return NULL;
    }
    TyPreConfig_InitIsolatedConfig(&config->preconfig);
    TyConfig_InitIsolatedConfig(&config->config);
    config->status = _TyStatus_OK();
    return config;
}


void
PyInitConfig_Free(PyInitConfig *config)
{
    if (config == NULL) {
        return;
    }
    free(config->err_msg);
    free(config);
}


int
PyInitConfig_GetError(PyInitConfig* config, const char **perr_msg)
{
    if (_TyStatus_IS_EXIT(config->status)) {
        char buffer[22];  // len("exit code -2147483648\0")
        TyOS_snprintf(buffer, sizeof(buffer),
                      "exit code %i",
                      config->status.exitcode);

        if (config->err_msg != NULL) {
            free(config->err_msg);
        }
        config->err_msg = strdup(buffer);
        if (config->err_msg != NULL) {
            *perr_msg = config->err_msg;
            return 1;
        }
        config->status = _TyStatus_NO_MEMORY();
    }

    if (_TyStatus_IS_ERROR(config->status) && config->status.err_msg != NULL) {
        *perr_msg = config->status.err_msg;
        return 1;
    }
    else {
        *perr_msg = NULL;
        return 0;
    }
}


int
PyInitConfig_GetExitCode(PyInitConfig* config, int *exitcode)
{
    if (_TyStatus_IS_EXIT(config->status)) {
        *exitcode = config->status.exitcode;
        return 1;
    }
    else {
        return 0;
    }
}


static void
initconfig_set_error(PyInitConfig *config, const char *err_msg)
{
    config->status = _TyStatus_ERR(err_msg);
}


static const PyConfigSpec*
initconfig_find_spec(const PyConfigSpec *spec, const char *name)
{
    for (; spec->name != NULL; spec++) {
        if (strcmp(name, spec->name) == 0) {
            return spec;
        }
    }
    return NULL;
}


int
PyInitConfig_HasOption(PyInitConfig *config, const char *name)
{
    const PyConfigSpec *spec = initconfig_find_spec(PYCONFIG_SPEC, name);
    if (spec == NULL) {
        spec = initconfig_find_spec(PYPRECONFIG_SPEC, name);
    }
    return (spec != NULL);
}


static const PyConfigSpec*
initconfig_prepare(PyInitConfig *config, const char *name, void **raw_member)
{
    const PyConfigSpec *spec = initconfig_find_spec(PYCONFIG_SPEC, name);
    if (spec != NULL) {
        *raw_member = config_get_spec_member(&config->config, spec);
        return spec;
    }

    spec = initconfig_find_spec(PYPRECONFIG_SPEC, name);
    if (spec != NULL) {
        *raw_member = preconfig_get_spec_member(&config->preconfig, spec);
        return spec;
    }

    initconfig_set_error(config, "unknown config option name");
    return NULL;
}


int
PyInitConfig_GetInt(PyInitConfig *config, const char *name, int64_t *value)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    switch (spec->type) {
    case TyConfig_MEMBER_INT:
    case TyConfig_MEMBER_UINT:
    case TyConfig_MEMBER_BOOL:
    {
        int *member = raw_member;
        *value = *member;
        break;
    }

    case TyConfig_MEMBER_ULONG:
    {
        unsigned long *member = raw_member;
#if SIZEOF_LONG >= 8
        if ((unsigned long)INT64_MAX < *member) {
            initconfig_set_error(config,
                "config option value doesn't fit into int64_t");
            return -1;
        }
#endif
        *value = *member;
        break;
    }

    default:
        initconfig_set_error(config, "config option type is not int");
        return -1;
    }
    return 0;
}


static char*
wstr_to_utf8(PyInitConfig *config, wchar_t *wstr)
{
    char *utf8;
    int res = _Ty_EncodeUTF8Ex(wstr, &utf8, NULL, NULL, 1, _Ty_ERROR_STRICT);
    if (res == -2) {
        initconfig_set_error(config, "encoding error");
        return NULL;
    }
    if (res < 0) {
        config->status = _TyStatus_NO_MEMORY();
        return NULL;
    }

    // Copy to use the malloc() memory allocator
    size_t size = strlen(utf8) + 1;
    char *str = malloc(size);
    if (str == NULL) {
        TyMem_RawFree(utf8);
        config->status = _TyStatus_NO_MEMORY();
        return NULL;
    }

    memcpy(str, utf8, size);
    TyMem_RawFree(utf8);
    return str;
}


int
PyInitConfig_GetStr(PyInitConfig *config, const char *name, char **value)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    if (spec->type != TyConfig_MEMBER_WSTR
        && spec->type != TyConfig_MEMBER_WSTR_OPT)
    {
        initconfig_set_error(config, "config option type is not string");
        return -1;
    }

    wchar_t **member = raw_member;
    if (*member == NULL) {
        *value = NULL;
        return 0;
    }

    *value = wstr_to_utf8(config, *member);
    if (*value == NULL) {
        return -1;
    }
    return 0;
}


int
PyInitConfig_GetStrList(PyInitConfig *config, const char *name, size_t *length, char ***items)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    if (spec->type != TyConfig_MEMBER_WSTR_LIST) {
        initconfig_set_error(config, "config option type is not string list");
        return -1;
    }

    TyWideStringList *list = raw_member;
    *length = list->length;

    *items = malloc(list->length * sizeof(char*));
    if (*items == NULL) {
        config->status = _TyStatus_NO_MEMORY();
        return -1;
    }

    for (Ty_ssize_t i=0; i < list->length; i++) {
        (*items)[i] = wstr_to_utf8(config, list->items[i]);
        if ((*items)[i] == NULL) {
            PyInitConfig_FreeStrList(i, *items);
            return -1;
        }
    }
    return 0;
}


void
PyInitConfig_FreeStrList(size_t length, char **items)
{
    for (size_t i=0; i < length; i++) {
        free(items[i]);
    }
    free(items);
}


int
PyInitConfig_SetInt(PyInitConfig *config, const char *name, int64_t value)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    switch (spec->type) {
    case TyConfig_MEMBER_INT:
    {
        if (value < (int64_t)INT_MIN || (int64_t)INT_MAX < value) {
            initconfig_set_error(config,
                "config option value is out of int range");
            return -1;
        }
        int int_value = (int)value;

        int *member = raw_member;
        *member = int_value;
        break;
    }

    case TyConfig_MEMBER_UINT:
    case TyConfig_MEMBER_BOOL:
    {
        if (value < 0 || (uint64_t)UINT_MAX < (uint64_t)value) {
            initconfig_set_error(config,
                "config option value is out of unsigned int range");
            return -1;
        }
        int int_value = (int)value;

        int *member = raw_member;
        *member = int_value;
        break;
    }

    case TyConfig_MEMBER_ULONG:
    {
        if (value < 0 || (uint64_t)ULONG_MAX < (uint64_t)value) {
            initconfig_set_error(config,
                "config option value is out of unsigned long range");
            return -1;
        }
        unsigned long ulong_value = (unsigned long)value;

        unsigned long *member = raw_member;
        *member = ulong_value;
        break;
    }

    default:
        initconfig_set_error(config, "config option type is not int");
        return -1;
    }

    if (strcmp(name, "hash_seed") == 0) {
        config->config.use_hash_seed = 1;
    }

    return 0;
}


static wchar_t*
utf8_to_wstr(PyInitConfig *config, const char *str)
{
    wchar_t *wstr;
    size_t wlen;
    int res = _Ty_DecodeUTF8Ex(str, strlen(str), &wstr, &wlen, NULL, _Ty_ERROR_STRICT);
    if (res == -2) {
        initconfig_set_error(config, "decoding error");
        return NULL;
    }
    if (res < 0) {
        config->status = _TyStatus_NO_MEMORY();
        return NULL;
    }

    // Copy to use the malloc() memory allocator
    size_t size = (wlen + 1) * sizeof(wchar_t);
    wchar_t *wstr2 = malloc(size);
    if (wstr2 == NULL) {
        TyMem_RawFree(wstr);
        config->status = _TyStatus_NO_MEMORY();
        return NULL;
    }

    memcpy(wstr2, wstr, size);
    TyMem_RawFree(wstr);
    return wstr2;
}


int
PyInitConfig_SetStr(PyInitConfig *config, const char *name, const char* value)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    if (spec->type != TyConfig_MEMBER_WSTR
            && spec->type != TyConfig_MEMBER_WSTR_OPT) {
        initconfig_set_error(config, "config option type is not string");
        return -1;
    }

    if (value == NULL && spec->type != TyConfig_MEMBER_WSTR_OPT) {
        initconfig_set_error(config, "config option string cannot be NULL");
    }

    wchar_t **member = raw_member;

    *member = utf8_to_wstr(config, value);
    if (*member == NULL) {
        return -1;
    }
    return 0;
}


static int
_TyWideStringList_FromUTF8(PyInitConfig *config, TyWideStringList *list,
                           Ty_ssize_t length, char * const *items)
{
    TyWideStringList wlist = _TyWideStringList_INIT;
    size_t size = sizeof(wchar_t*) * length;
    wlist.items = (wchar_t **)TyMem_RawMalloc(size);
    if (wlist.items == NULL) {
        config->status = _TyStatus_NO_MEMORY();
        return -1;
    }

    for (Ty_ssize_t i = 0; i < length; i++) {
        wchar_t *arg = utf8_to_wstr(config, items[i]);
        if (arg == NULL) {
            _TyWideStringList_Clear(&wlist);
            return -1;
        }
        wlist.items[i] = arg;
        wlist.length++;
    }

    _TyWideStringList_Clear(list);
    *list = wlist;
    return 0;
}


int
PyInitConfig_SetStrList(PyInitConfig *config, const char *name,
                        size_t length, char * const *items)
{
    void *raw_member;
    const PyConfigSpec *spec = initconfig_prepare(config, name, &raw_member);
    if (spec == NULL) {
        return -1;
    }

    if (spec->type != TyConfig_MEMBER_WSTR_LIST) {
        initconfig_set_error(config, "config option type is not strings list");
        return -1;
    }
    TyWideStringList *list = raw_member;
    if (_TyWideStringList_FromUTF8(config, list, length, items) < 0) {
        return -1;
    }

    if (strcmp(name, "module_search_paths") == 0) {
        config->config.module_search_paths_set = 1;
    }
    return 0;
}


int
PyInitConfig_AddModule(PyInitConfig *config, const char *name,
                       TyObject* (*initfunc)(void))
{
    size_t size = sizeof(struct _inittab) * (config->inittab_size + 2);
    struct _inittab *new_inittab = TyMem_RawRealloc(config->inittab, size);
    if (new_inittab == NULL) {
        config->status = _TyStatus_NO_MEMORY();
        return -1;
    }
    config->inittab = new_inittab;

    struct _inittab *entry = &config->inittab[config->inittab_size];
    entry->name = name;
    entry->initfunc = initfunc;

    // Terminator entry
    entry = &config->inittab[config->inittab_size + 1];
    entry->name = NULL;
    entry->initfunc = NULL;

    config->inittab_size++;
    return 0;
}


int
Ty_InitializeFromInitConfig(PyInitConfig *config)
{
    if (config->inittab_size >= 1) {
        if (TyImport_ExtendInittab(config->inittab) < 0) {
            config->status = _TyStatus_NO_MEMORY();
            return -1;
        }
    }

    _TyPreConfig_GetConfig(&config->preconfig, &config->config);

    config->status = Ty_PreInitializeFromArgs(
        &config->preconfig,
        config->config.argv.length,
        config->config.argv.items);
    if (_TyStatus_EXCEPTION(config->status)) {
        return -1;
    }

    config->status = Ty_InitializeFromConfig(&config->config);
    if (_TyStatus_EXCEPTION(config->status)) {
        return -1;
    }

    return 0;
}


// --- TyConfig_Get() -------------------------------------------------------

static const PyConfigSpec*
config_generic_find_spec(const PyConfigSpec *spec, const char *name)
{
    for (; spec->name != NULL; spec++) {
        if (spec->visibility == TyConfig_MEMBER_INIT_ONLY) {
            continue;
        }
        if (strcmp(name, spec->name) == 0) {
            return spec;
        }
    }
    return NULL;
}


static const PyConfigSpec*
config_find_spec(const char *name)
{
    return config_generic_find_spec(PYCONFIG_SPEC, name);
}


static const PyConfigSpec*
preconfig_find_spec(const char *name)
{
    return config_generic_find_spec(PYPRECONFIG_SPEC, name);
}


static int
config_add_xoption(TyObject *dict, const wchar_t *str)
{
    TyObject *name = NULL, *value = NULL;

    const wchar_t *name_end = wcschr(str, L'=');
    if (!name_end) {
        name = TyUnicode_FromWideChar(str, -1);
        if (name == NULL) {
            goto error;
        }
        value = Ty_NewRef(Ty_True);
    }
    else {
        name = TyUnicode_FromWideChar(str, name_end - str);
        if (name == NULL) {
            goto error;
        }
        value = TyUnicode_FromWideChar(name_end + 1, -1);
        if (value == NULL) {
            goto error;
        }
    }
    if (TyDict_SetItem(dict, name, value) < 0) {
        goto error;
    }
    Ty_DECREF(name);
    Ty_DECREF(value);
    return 0;

error:
    Ty_XDECREF(name);
    Ty_XDECREF(value);
    return -1;
}


TyObject*
_TyConfig_CreateXOptionsDict(const TyConfig *config)
{
    TyObject *dict = TyDict_New();
    if (dict == NULL) {
        return NULL;
    }

    Ty_ssize_t nxoption = config->xoptions.length;
    wchar_t **xoptions = config->xoptions.items;
    for (Ty_ssize_t i=0; i < nxoption; i++) {
        const wchar_t *option = xoptions[i];
        if (config_add_xoption(dict, option) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }
    return dict;
}


static int
config_get_sys_write_bytecode(const TyConfig *config, int *value)
{
    TyObject *attr = _TySys_GetRequiredAttrString("dont_write_bytecode");
    if (attr == NULL) {
        return -1;
    }

    int is_true = PyObject_IsTrue(attr);
    Ty_DECREF(attr);
    if (is_true < 0) {
        return -1;
    }
    *value = (!is_true);
    return 0;
}


static TyObject*
config_get(const TyConfig *config, const PyConfigSpec *spec,
           int use_sys)
{
    if (use_sys) {
        if (spec->sys.attr != NULL) {
            return _TySys_GetRequiredAttrString(spec->sys.attr);
        }

        if (strcmp(spec->name, "write_bytecode") == 0) {
            int value;
            if (config_get_sys_write_bytecode(config, &value) < 0) {
                return NULL;
            }
            return TyBool_FromLong(value);
        }

        if (strcmp(spec->name, "int_max_str_digits") == 0) {
            TyInterpreterState *interp = _TyInterpreterState_GET();
            return TyLong_FromLong(interp->long_state.max_str_digits);
        }
    }

    void *member = config_get_spec_member(config, spec);
    switch (spec->type) {
    case TyConfig_MEMBER_INT:
    case TyConfig_MEMBER_UINT:
    {
        int value = *(int *)member;
        return TyLong_FromLong(value);
    }

    case TyConfig_MEMBER_BOOL:
    {
        int value = *(int *)member;
        return TyBool_FromLong(value != 0);
    }

    case TyConfig_MEMBER_ULONG:
    {
        unsigned long value = *(unsigned long *)member;
        return TyLong_FromUnsignedLong(value);
    }

    case TyConfig_MEMBER_WSTR:
    case TyConfig_MEMBER_WSTR_OPT:
    {
        wchar_t *wstr = *(wchar_t **)member;
        if (wstr != NULL) {
            return TyUnicode_FromWideChar(wstr, -1);
        }
        else {
            return Ty_NewRef(Ty_None);
        }
    }

    case TyConfig_MEMBER_WSTR_LIST:
    {
        if (strcmp(spec->name, "xoptions") == 0) {
            return _TyConfig_CreateXOptionsDict(config);
        }
        else {
            const TyWideStringList *list = (const TyWideStringList *)member;
            return _TyWideStringList_AsTuple(list);
        }
    }

    default:
        Ty_UNREACHABLE();
    }
}


static TyObject*
preconfig_get(const TyPreConfig *preconfig, const PyConfigSpec *spec)
{
    // The type of all PYPRECONFIG_SPEC members is INT or BOOL.
    assert(spec->type == TyConfig_MEMBER_INT
           || spec->type == TyConfig_MEMBER_BOOL);

    char *member = (char *)preconfig + spec->offset;
    int value = *(int *)member;

    if (spec->type == TyConfig_MEMBER_BOOL) {
        return TyBool_FromLong(value != 0);
    }
    else {
        return TyLong_FromLong(value);
    }
}


static void
config_unknown_name_error(const char *name)
{
    TyErr_Format(TyExc_ValueError, "unknown config option name: %s", name);
}


TyObject*
TyConfig_Get(const char *name)
{
    const PyConfigSpec *spec = config_find_spec(name);
    if (spec != NULL) {
        const TyConfig *config = _Ty_GetConfig();
        return config_get(config, spec, 1);
    }

    spec = preconfig_find_spec(name);
    if (spec != NULL) {
        const TyPreConfig *preconfig = &_PyRuntime.preconfig;
        return preconfig_get(preconfig, spec);
    }

    config_unknown_name_error(name);
    return NULL;
}


int
TyConfig_GetInt(const char *name, int *value)
{
    assert(!TyErr_Occurred());

    TyObject *obj = TyConfig_Get(name);
    if (obj == NULL) {
        return -1;
    }

    if (!TyLong_Check(obj)) {
        Ty_DECREF(obj);
        TyErr_Format(TyExc_TypeError, "config option %s is not an int", name);
        return -1;
    }

    int as_int = TyLong_AsInt(obj);
    Ty_DECREF(obj);
    if (as_int == -1 && TyErr_Occurred()) {
        TyErr_Format(TyExc_OverflowError,
                     "config option %s value does not fit into a C int", name);
        return -1;
    }

    *value = as_int;
    return 0;
}


static int
config_names_add(TyObject *names, const PyConfigSpec *spec)
{
    for (; spec->name != NULL; spec++) {
        if (spec->visibility == TyConfig_MEMBER_INIT_ONLY) {
            continue;
        }
        TyObject *name = TyUnicode_FromString(spec->name);
        if (name == NULL) {
            return -1;
        }
        int res = TyList_Append(names, name);
        Ty_DECREF(name);
        if (res < 0) {
            return -1;
        }
    }
    return 0;
}


TyObject*
TyConfig_Names(void)
{
    TyObject *names = TyList_New(0);
    if (names == NULL) {
        goto error;
    }

    if (config_names_add(names, PYCONFIG_SPEC) < 0) {
        goto error;
    }
    if (config_names_add(names, PYPRECONFIG_SPEC) < 0) {
        goto error;
    }

    TyObject *frozen = TyFrozenSet_New(names);
    Ty_DECREF(names);
    return frozen;

error:
    Ty_XDECREF(names);
    return NULL;
}


// --- TyConfig_Set() -------------------------------------------------------

static int
config_set_sys_flag(const PyConfigSpec *spec, int int_value)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyConfig *config = &interp->config;

    if (spec->type == TyConfig_MEMBER_BOOL) {
        if (int_value != 0) {
            // convert values < 0 and values > 1 to 1
            int_value = 1;
        }
    }

    TyObject *value;
    if (spec->sys.flag_setter) {
        value = spec->sys.flag_setter(int_value);
    }
    else {
        value = config_sys_flag_long(int_value);
    }
    if (value == NULL) {
        return -1;
    }

    // Set sys.flags.FLAG
    Ty_ssize_t pos = spec->sys.flag_index;
    if (_TySys_SetFlagObj(pos, value) < 0) {
        goto error;
    }

    // Set TyConfig.ATTR
    assert(spec->type == TyConfig_MEMBER_INT
           || spec->type == TyConfig_MEMBER_UINT
           || spec->type == TyConfig_MEMBER_BOOL);
    int *member = config_get_spec_member(config, spec);
    *member = int_value;

    // Set sys.dont_write_bytecode attribute
    if (strcmp(spec->name, "write_bytecode") == 0) {
        if (TySys_SetObject("dont_write_bytecode", value) < 0) {
            goto error;
        }
    }

    Ty_DECREF(value);
    return 0;

error:
    Ty_DECREF(value);
    return -1;
}


// Set TyConfig.ATTR integer member
static int
config_set_int_attr(const PyConfigSpec *spec, int value)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyConfig *config = &interp->config;
    int *member = config_get_spec_member(config, spec);
    *member = value;
    return 0;
}


int
TyConfig_Set(const char *name, TyObject *value)
{
    if (TySys_Audit("cpython.TyConfig_Set", "sO", name, value) < 0) {
        return -1;
    }

    const PyConfigSpec *spec = config_find_spec(name);
    if (spec == NULL) {
        spec = preconfig_find_spec(name);
        if (spec == NULL) {
            config_unknown_name_error(name);
            return -1;
        }
        assert(spec->visibility != TyConfig_MEMBER_PUBLIC);
    }

    if (spec->visibility != TyConfig_MEMBER_PUBLIC) {
        TyErr_Format(TyExc_ValueError, "cannot set read-only option %s",
                     name);
        return -1;
    }

    int int_value = 0;
    int has_int_value = 0;

    switch (spec->type) {
    case TyConfig_MEMBER_INT:
    case TyConfig_MEMBER_UINT:
    case TyConfig_MEMBER_BOOL:
        if (!TyLong_Check(value)) {
            TyErr_Format(TyExc_TypeError, "expected int or bool, got %T", value);
            return -1;
        }
        int_value = TyLong_AsInt(value);
        if (int_value == -1 && TyErr_Occurred()) {
            return -1;
        }
        if (int_value < 0 && spec->type != TyConfig_MEMBER_INT) {
            TyErr_Format(TyExc_ValueError, "value must be >= 0");
            return -1;
        }
        has_int_value = 1;
        break;

    case TyConfig_MEMBER_ULONG:
        // not implemented: only hash_seed uses this type, and it's read-only
        goto cannot_set;

    case TyConfig_MEMBER_WSTR:
        if (!TyUnicode_CheckExact(value)) {
            TyErr_Format(TyExc_TypeError, "expected str, got %T", value);
            return -1;
        }
        break;

    case TyConfig_MEMBER_WSTR_OPT:
        if (value != Ty_None && !TyUnicode_CheckExact(value)) {
            TyErr_Format(TyExc_TypeError, "expected str or None, got %T", value);
            return -1;
        }
        break;

    case TyConfig_MEMBER_WSTR_LIST:
        if (strcmp(spec->name, "xoptions") != 0) {
            if (!TyList_Check(value)) {
                TyErr_Format(TyExc_TypeError, "expected list[str], got %T",
                             value);
                return -1;
            }
            for (Ty_ssize_t i=0; i < TyList_GET_SIZE(value); i++) {
                TyObject *item = TyList_GET_ITEM(value, i);
                if (!TyUnicode_Check(item)) {
                    TyErr_Format(TyExc_TypeError,
                                 "expected str, list item %zd has type %T",
                                 i, item);
                    return -1;
                }
            }
        }
        else {
            // xoptions type is dict[str, str]
            if (!TyDict_Check(value)) {
                TyErr_Format(TyExc_TypeError,
                             "expected dict[str, str | bool], got %T",
                             value);
                return -1;
            }

            Ty_ssize_t pos = 0;
            TyObject *key, *item;
            while (TyDict_Next(value, &pos, &key, &item)) {
                if (!TyUnicode_Check(key)) {
                    TyErr_Format(TyExc_TypeError,
                                 "expected str, "
                                 "got dict key type %T", key);
                    return -1;
                }
                if (!TyUnicode_Check(item) && !TyBool_Check(item)) {
                    TyErr_Format(TyExc_TypeError,
                                 "expected str or bool, "
                                 "got dict value type %T", key);
                    return -1;
                }
            }
        }
        break;

    default:
        Ty_UNREACHABLE();
    }

    if (spec->sys.attr != NULL) {
        // Set the sys attribute, but don't set TyInterpreterState.config
        // to keep the code simple.
        return TySys_SetObject(spec->sys.attr, value);
    }
    else if (has_int_value) {
        if (spec->sys.flag_index >= 0) {
            return config_set_sys_flag(spec, int_value);
        }
        else if (strcmp(spec->name, "int_max_str_digits") == 0) {
            return _TySys_SetIntMaxStrDigits(int_value);
        }
        else {
            return config_set_int_attr(spec, int_value);
        }
    }

cannot_set:
    TyErr_Format(TyExc_ValueError, "cannot set option %s", name);
    return -1;
}
