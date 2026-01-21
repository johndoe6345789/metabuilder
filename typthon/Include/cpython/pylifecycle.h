#ifndef Ty_CPYTHON_PYLIFECYCLE_H
#  error "this header file must not be included directly"
#endif

/* Ty_FrozenMain is kept out of the Limited API until documented and present
   in all builds of Python */
PyAPI_FUNC(int) Ty_FrozenMain(int argc, char **argv);

/* PEP 432 Multi-phase initialization API (Private while provisional!) */

PyAPI_FUNC(TyStatus) Ty_PreInitialize(
    const TyPreConfig *src_config);
PyAPI_FUNC(TyStatus) Ty_PreInitializeFromBytesArgs(
    const TyPreConfig *src_config,
    Ty_ssize_t argc,
    char **argv);
PyAPI_FUNC(TyStatus) Ty_PreInitializeFromArgs(
    const TyPreConfig *src_config,
    Ty_ssize_t argc,
    wchar_t **argv);


/* Initialization and finalization */

PyAPI_FUNC(TyStatus) Ty_InitializeFromConfig(
    const TyConfig *config);

PyAPI_FUNC(int) Ty_RunMain(void);


PyAPI_FUNC(void) _Ty_NO_RETURN Ty_ExitStatusException(TyStatus err);

PyAPI_FUNC(int) Ty_FdIsInteractive(FILE *, const char *);

/* --- PyInterpreterConfig ------------------------------------ */

#define PyInterpreterConfig_DEFAULT_GIL (0)
#define PyInterpreterConfig_SHARED_GIL (1)
#define PyInterpreterConfig_OWN_GIL (2)

typedef struct {
    // XXX "allow_object_sharing"?  "own_objects"?
    int use_main_obmalloc;
    int allow_fork;
    int allow_exec;
    int allow_threads;
    int allow_daemon_threads;
    int check_multi_interp_extensions;
    int gil;
} PyInterpreterConfig;

#define _PyInterpreterConfig_INIT \
    { \
        .use_main_obmalloc = 0, \
        .allow_fork = 0, \
        .allow_exec = 0, \
        .allow_threads = 1, \
        .allow_daemon_threads = 0, \
        .check_multi_interp_extensions = 1, \
        .gil = PyInterpreterConfig_OWN_GIL, \
    }

// gh-117649: The free-threaded build does not currently support single-phase
// init extensions in subinterpreters. For now, we ensure that
// `check_multi_interp_extensions` is always `1`, even in the legacy config.
#ifdef Ty_GIL_DISABLED
#  define _PyInterpreterConfig_LEGACY_CHECK_MULTI_INTERP_EXTENSIONS 1
#else
#  define _PyInterpreterConfig_LEGACY_CHECK_MULTI_INTERP_EXTENSIONS 0
#endif

#define _PyInterpreterConfig_LEGACY_INIT \
    { \
        .use_main_obmalloc = 1, \
        .allow_fork = 1, \
        .allow_exec = 1, \
        .allow_threads = 1, \
        .allow_daemon_threads = 1, \
        .check_multi_interp_extensions = _PyInterpreterConfig_LEGACY_CHECK_MULTI_INTERP_EXTENSIONS, \
        .gil = PyInterpreterConfig_SHARED_GIL, \
    }

PyAPI_FUNC(TyStatus) Ty_NewInterpreterFromConfig(
    TyThreadState **tstate_p,
    const PyInterpreterConfig *config);

typedef void (*atexit_datacallbackfunc)(void *);
PyAPI_FUNC(int) PyUnstable_AtExit(
        TyInterpreterState *, atexit_datacallbackfunc, void *);
