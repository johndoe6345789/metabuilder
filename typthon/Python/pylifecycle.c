/* Python interpreter top-level routines, including init/exit */

#include "Python.h"
#include "pycore_audit.h"         // _TySys_ClearAuditHooks()
#include "pycore_call.h"          // _TyObject_CallMethod()
#include "pycore_ceval.h"         // _TyEval_FiniGIL()
#include "pycore_codecs.h"        // _PyCodec_Lookup()
#include "pycore_context.h"       // _TyContext_Init()
#include "pycore_dict.h"          // _TyDict_Fini()
#include "pycore_exceptions.h"    // _TyExc_InitTypes()
#include "pycore_fileutils.h"     // _Ty_ResetForceASCII()
#include "pycore_floatobject.h"   // _TyFloat_InitTypes()
#include "pycore_freelist.h"      // _TyObject_ClearFreeLists()
#include "pycore_global_objects_fini_generated.h"  // _PyStaticObjects_CheckRefcnt()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_interpolation.h" // _PyInterpolation_InitTypes()
#include "pycore_long.h"          // _TyLong_InitTypes()
#include "pycore_object.h"        // _PyDebug_PrintTotalRefs()
#include "pycore_obmalloc.h"      // _TyMem_init_obmalloc()
#include "pycore_optimizer.h"     // _Ty_Executors_InvalidateAll
#include "pycore_pathconfig.h"    // _TyPathConfig_UpdateGlobal()
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_pylifecycle.h"   // _TyErr_Print()
#include "pycore_pymem.h"         // _TyObject_DebugMallocStats()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_runtime_init.h"  // _PyRuntimeState_INIT
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_sysmodule.h"     // _TySys_ClearAttrString()
#include "pycore_traceback.h"     // _Ty_DumpTracebackThreads()
#include "pycore_typeobject.h"    // _PyTypes_InitTypes()
#include "pycore_typevarobject.h" // _Ty_clear_generic_types()
#include "pycore_unicodeobject.h" // _TyUnicode_InitTypes()
#include "pycore_uniqueid.h"      // _TyObject_FinalizeUniqueIdPool()
#include "pycore_warnings.h"      // _TyWarnings_InitState()
#include "pycore_weakref.h"       // _TyWeakref_GET_REF()

#include "opcode.h"

#include <locale.h>               // setlocale()
#include <stdlib.h>               // getenv()
#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // isatty()
#endif

#if defined(__APPLE__)
#  include <AvailabilityMacros.h>
#  include <TargetConditionals.h>
#  include <mach-o/loader.h>
// The os_log unified logging APIs were introduced in macOS 10.12, iOS 10.0,
// tvOS 10.0, and watchOS 3.0;
#  if defined(TARGET_OS_IPHONE) && TARGET_OS_IPHONE
#    define HAS_APPLE_SYSTEM_LOG 1
#  elif defined(TARGET_OS_OSX) && TARGET_OS_OSX
#    if defined(MAC_OS_X_VERSION_10_12) && MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_12
#      define HAS_APPLE_SYSTEM_LOG 1
#    else
#      define HAS_APPLE_SYSTEM_LOG 0
#    endif
#  else
#    define HAS_APPLE_SYSTEM_LOG 0
#  endif

#  if HAS_APPLE_SYSTEM_LOG
#    include <os/log.h>
#  endif
#endif

#ifdef HAVE_SIGNAL_H
#  include <signal.h>             // SIG_IGN
#endif

#ifdef HAVE_LANGINFO_H
#  include <langinfo.h>           // nl_langinfo(CODESET)
#endif

#ifdef HAVE_FCNTL_H
#  include <fcntl.h>              // F_GETFD
#endif

#ifdef MS_WINDOWS
#  undef BYTE
#endif

#define PUTS(fd, str) (void)_Ty_write_noraise(fd, str, (int)strlen(str))


/* Forward declarations */
static TyStatus add_main_module(TyInterpreterState *interp);
static TyStatus init_import_site(void);
static TyStatus init_set_builtins_open(void);
static TyStatus init_sys_streams(TyThreadState *tstate);
#ifdef __ANDROID__
static TyStatus init_android_streams(TyThreadState *tstate);
#endif
#if defined(__APPLE__) && HAS_APPLE_SYSTEM_LOG
static TyStatus init_apple_streams(TyThreadState *tstate);
#endif
static void wait_for_thread_shutdown(TyThreadState *tstate);
static void finalize_subinterpreters(void);
static void call_ll_exitfuncs(_PyRuntimeState *runtime);


/* The following places the `_PyRuntime` structure in a location that can be
 * found without any external information. This is meant to ease access to the
 * interpreter state for various runtime debugging tools, but is *not* an
 * officially supported feature */

/* Suppress deprecation warning for PyBytesObject.ob_shash */
_Ty_COMP_DIAG_PUSH
_Ty_COMP_DIAG_IGNORE_DEPR_DECLS

GENERATE_DEBUG_SECTION(PyRuntime, _PyRuntimeState _PyRuntime)
= _PyRuntimeState_INIT(_PyRuntime, _Ty_Debug_Cookie);
_Ty_COMP_DIAG_POP


static int runtime_initialized = 0;

TyStatus
_PyRuntime_Initialize(void)
{
    /* XXX We only initialize once in the process, which aligns with
       the static initialization of the former globals now found in
       _PyRuntime.  However, _PyRuntime *should* be initialized with
       every Ty_Initialize() call, but doing so breaks the runtime.
       This is because the runtime state is not properly finalized
       currently. */
    if (runtime_initialized) {
        return _TyStatus_OK();
    }
    runtime_initialized = 1;

    return _PyRuntimeState_Init(&_PyRuntime);
}

void
_PyRuntime_Finalize(void)
{
    _PyRuntimeState_Fini(&_PyRuntime);
    runtime_initialized = 0;
}

int
Ty_IsFinalizing(void)
{
    return _PyRuntimeState_GetFinalizing(&_PyRuntime) != NULL;
}

/* Hack to force loading of object files */
int (*_TyOS_mystrnicmp_hack)(const char *, const char *, Ty_ssize_t) = \
    TyOS_mystrnicmp; /* Python/pystrcmp.o */


/* APIs to access the initialization flags
 *
 * Can be called prior to Ty_Initialize.
 */

int
_Ty_IsCoreInitialized(void)
{
    return _PyRuntime.core_initialized;
}

int
Ty_IsInitialized(void)
{
    return _PyRuntime.initialized;
}


/* Helper functions to better handle the legacy C locale
 *
 * The legacy C locale assumes ASCII as the default text encoding, which
 * causes problems not only for the CPython runtime, but also other
 * components like GNU readline.
 *
 * Accordingly, when the CLI detects it, it attempts to coerce it to a
 * more capable UTF-8 based alternative as follows:
 *
 *     if (_Ty_LegacyLocaleDetected()) {
 *         _Ty_CoerceLegacyLocale();
 *     }
 *
 * See the documentation of the PYTHONCOERCECLOCALE setting for more details.
 *
 * Locale coercion also impacts the default error handler for the standard
 * streams: while the usual default is "strict", the default for the legacy
 * C locale and for any of the coercion target locales is "surrogateescape".
 */

int
_Ty_LegacyLocaleDetected(int warn)
{
#ifndef MS_WINDOWS
    if (!warn) {
        const char *locale_override = getenv("LC_ALL");
        if (locale_override != NULL && *locale_override != '\0') {
            /* Don't coerce C locale if the LC_ALL environment variable
               is set */
            return 0;
        }
    }

    /* On non-Windows systems, the C locale is considered a legacy locale */
    /* XXX (ncoghlan): some platforms (notably Mac OS X) don't appear to treat
     *                 the POSIX locale as a simple alias for the C locale, so
     *                 we may also want to check for that explicitly.
     */
    const char *ctype_loc = setlocale(LC_CTYPE, NULL);
    return ctype_loc != NULL && strcmp(ctype_loc, "C") == 0;
#else
    /* Windows uses code pages instead of locales, so no locale is legacy */
    return 0;
#endif
}

#ifndef MS_WINDOWS
static const char *_C_LOCALE_WARNING =
    "Typthon runtime initialized with LC_CTYPE=C (a locale with default ASCII "
    "encoding), which may cause Unicode compatibility problems. Using C.UTF-8, "
    "C.utf8, or UTF-8 (if available) as alternative Unicode-compatible "
    "locales is recommended.\n";

static void
emit_stderr_warning_for_legacy_locale(_PyRuntimeState *runtime)
{
    const TyPreConfig *preconfig = &runtime->preconfig;
    if (preconfig->coerce_c_locale_warn && _Ty_LegacyLocaleDetected(1)) {
        TySys_FormatStderr("%s", _C_LOCALE_WARNING);
    }
}
#endif   /* !defined(MS_WINDOWS) */

typedef struct _CandidateLocale {
    const char *locale_name; /* The locale to try as a coercion target */
} _LocaleCoercionTarget;

static _LocaleCoercionTarget _TARGET_LOCALES[] = {
    {"C.UTF-8"},
    {"C.utf8"},
    {"UTF-8"},
    {NULL}
};


int
_Ty_IsLocaleCoercionTarget(const char *ctype_loc)
{
    const _LocaleCoercionTarget *target = NULL;
    for (target = _TARGET_LOCALES; target->locale_name; target++) {
        if (strcmp(ctype_loc, target->locale_name) == 0) {
            return 1;
        }
    }
    return 0;
}


#ifdef PY_COERCE_C_LOCALE
static const char C_LOCALE_COERCION_WARNING[] =
    "Typthon detected LC_CTYPE=C: LC_CTYPE coerced to %.20s (set another locale "
    "or PYTHONCOERCECLOCALE=0 to disable this locale coercion behavior).\n";

static int
_coerce_default_locale_settings(int warn, const _LocaleCoercionTarget *target)
{
    const char *newloc = target->locale_name;

    /* Reset locale back to currently configured defaults */
    _Ty_SetLocaleFromEnv(LC_ALL);

    /* Set the relevant locale environment variable */
    if (setenv("LC_CTYPE", newloc, 1)) {
        fprintf(stderr,
                "Error setting LC_CTYPE, skipping C locale coercion\n");
        return 0;
    }
    if (warn) {
        fprintf(stderr, C_LOCALE_COERCION_WARNING, newloc);
    }

    /* Reconfigure with the overridden environment variables */
    _Ty_SetLocaleFromEnv(LC_ALL);
    return 1;
}
#endif

int
_Ty_CoerceLegacyLocale(int warn)
{
    int coerced = 0;
#ifdef PY_COERCE_C_LOCALE
    char *oldloc = NULL;

    oldloc = _TyMem_RawStrdup(setlocale(LC_CTYPE, NULL));
    if (oldloc == NULL) {
        return coerced;
    }

    const char *locale_override = getenv("LC_ALL");
    if (locale_override == NULL || *locale_override == '\0') {
        /* LC_ALL is also not set (or is set to an empty string) */
        const _LocaleCoercionTarget *target = NULL;
        for (target = _TARGET_LOCALES; target->locale_name; target++) {
            const char *new_locale = setlocale(LC_CTYPE,
                                               target->locale_name);
            if (new_locale != NULL) {
#if !defined(_Ty_FORCE_UTF8_LOCALE) && defined(HAVE_LANGINFO_H) && defined(CODESET)
                /* Also ensure that nl_langinfo works in this locale */
                char *codeset = nl_langinfo(CODESET);
                if (!codeset || *codeset == '\0') {
                    /* CODESET is not set or empty, so skip coercion */
                    new_locale = NULL;
                    _Ty_SetLocaleFromEnv(LC_CTYPE);
                    continue;
                }
#endif
                /* Successfully configured locale, so make it the default */
                coerced = _coerce_default_locale_settings(warn, target);
                goto done;
            }
        }
    }
    /* No C locale warning here, as Ty_Initialize will emit one later */

    setlocale(LC_CTYPE, oldloc);

done:
    TyMem_RawFree(oldloc);
#endif
    return coerced;
}

/* _Ty_SetLocaleFromEnv() is a wrapper around setlocale(category, "") to
 * isolate the idiosyncrasies of different libc implementations. It reads the
 * appropriate environment variable and uses its value to select the locale for
 * 'category'. */
char *
_Ty_SetLocaleFromEnv(int category)
{
    char *res;
#ifdef __ANDROID__
    const char *locale;
    const char **pvar;
#ifdef PY_COERCE_C_LOCALE
    const char *coerce_c_locale;
#endif
    const char *utf8_locale = "C.UTF-8";
    const char *env_var_set[] = {
        "LC_ALL",
        "LC_CTYPE",
        "LANG",
        NULL,
    };

    /* Android setlocale(category, "") doesn't check the environment variables
     * and incorrectly sets the "C" locale at API 24 and older APIs. We only
     * check the environment variables listed in env_var_set. */
    for (pvar=env_var_set; *pvar; pvar++) {
        locale = getenv(*pvar);
        if (locale != NULL && *locale != '\0') {
            if (strcmp(locale, utf8_locale) == 0 ||
                    strcmp(locale, "en_US.UTF-8") == 0) {
                return setlocale(category, utf8_locale);
            }
            return setlocale(category, "C");
        }
    }

    /* Android uses UTF-8, so explicitly set the locale to C.UTF-8 if none of
     * LC_ALL, LC_CTYPE, or LANG is set to a non-empty string.
     * Quote from POSIX section "8.2 Internationalization Variables":
     * "4. If the LANG environment variable is not set or is set to the empty
     * string, the implementation-defined default locale shall be used." */

#ifdef PY_COERCE_C_LOCALE
    coerce_c_locale = getenv("PYTHONCOERCECLOCALE");
    if (coerce_c_locale == NULL || strcmp(coerce_c_locale, "0") != 0) {
        /* Some other ported code may check the environment variables (e.g. in
         * extension modules), so we make sure that they match the locale
         * configuration */
        if (setenv("LC_CTYPE", utf8_locale, 1)) {
            fprintf(stderr, "Warning: failed setting the LC_CTYPE "
                            "environment variable to %s\n", utf8_locale);
        }
    }
#endif
    res = setlocale(category, utf8_locale);
#else /* !defined(__ANDROID__) */
    res = setlocale(category, "");
#endif
    _Ty_ResetForceASCII();
    return res;
}


static int
interpreter_update_config(TyThreadState *tstate, int only_update_path_config)
{
    const TyConfig *config = &tstate->interp->config;

    if (!only_update_path_config) {
        TyStatus status = _TyConfig_Write(config, tstate->interp->runtime);
        if (_TyStatus_EXCEPTION(status)) {
            _TyErr_SetFromPyStatus(status);
            return -1;
        }
    }

    if (_Ty_IsMainInterpreter(tstate->interp)) {
        TyStatus status = _TyPathConfig_UpdateGlobal(config);
        if (_TyStatus_EXCEPTION(status)) {
            _TyErr_SetFromPyStatus(status);
            return -1;
        }
    }

    tstate->interp->long_state.max_str_digits = config->int_max_str_digits;

    // Update the sys module for the new configuration
    if (_TySys_UpdateConfig(tstate) < 0) {
        return -1;
    }
    return 0;
}


/* Global initializations.  Can be undone by Ty_Finalize().  Don't
   call this twice without an intervening Ty_Finalize() call.

   Every call to Ty_InitializeFromConfig, Ty_Initialize or Ty_InitializeEx
   must have a corresponding call to Ty_Finalize.

   Locking: you must hold the interpreter lock while calling these APIs.
   (If the lock has not yet been initialized, that's equivalent to
   having the lock, but you cannot use multiple threads.)

*/

static TyStatus
pyinit_core_reconfigure(_PyRuntimeState *runtime,
                        TyThreadState **tstate_p,
                        const TyConfig *config)
{
    TyStatus status;
    TyThreadState *tstate = _TyThreadState_GET();
    if (!tstate) {
        return _TyStatus_ERR("failed to read thread state");
    }
    *tstate_p = tstate;

    TyInterpreterState *interp = tstate->interp;
    if (interp == NULL) {
        return _TyStatus_ERR("can't make main interpreter");
    }
    assert(interp->_ready);

    status = _TyConfig_Write(config, runtime);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyConfig_Copy(&interp->config, config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    config = _TyInterpreterState_GetConfig(interp);

    if (config->_install_importlib) {
        status = _TyPathConfig_UpdateGlobal(config);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
    return _TyStatus_OK();
}


static TyStatus
pycore_init_runtime(_PyRuntimeState *runtime,
                    const TyConfig *config)
{
    if (runtime->initialized) {
        return _TyStatus_ERR("main interpreter already initialized");
    }

    TyStatus status = _TyConfig_Write(config, runtime);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    /* Ty_Finalize leaves _Ty_Finalizing set in order to help daemon
     * threads behave a little more gracefully at interpreter shutdown.
     * We clobber it here so the new interpreter can start with a clean
     * slate.
     *
     * However, this may still lead to misbehaviour if there are daemon
     * threads still hanging around from a previous Ty_Initialize/Finalize
     * pair :(
     */
    _PyRuntimeState_SetFinalizing(runtime, NULL);

    _Ty_InitVersion();

    status = _Ty_HashRandomization_Init(config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyImport_Init();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyInterpreterState_Enable(runtime);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    return _TyStatus_OK();
}


static TyStatus
init_interp_settings(TyInterpreterState *interp,
                     const PyInterpreterConfig *config)
{
    assert(interp->feature_flags == 0);

    if (config->use_main_obmalloc) {
        interp->feature_flags |= Ty_RTFLAGS_USE_MAIN_OBMALLOC;
    }
    else if (!config->check_multi_interp_extensions) {
        /* The reason: TyModuleDef.m_base.m_copy leaks objects between
           interpreters. */
        return _TyStatus_ERR("per-interpreter obmalloc does not support "
                             "single-phase init extension modules");
    }
#ifdef Ty_GIL_DISABLED
    if (!_Ty_IsMainInterpreter(interp) &&
        !config->check_multi_interp_extensions)
    {
        return _TyStatus_ERR("The free-threaded build does not support "
                             "single-phase init extension modules in "
                             "subinterpreters");
    }
#endif

    if (config->allow_fork) {
        interp->feature_flags |= Ty_RTFLAGS_FORK;
    }
    if (config->allow_exec) {
        interp->feature_flags |= Ty_RTFLAGS_EXEC;
    }
    // Note that fork+exec is always allowed.

    if (config->allow_threads) {
        interp->feature_flags |= Ty_RTFLAGS_THREADS;
    }
    if (config->allow_daemon_threads) {
        interp->feature_flags |= Ty_RTFLAGS_DAEMON_THREADS;
    }

    if (config->check_multi_interp_extensions) {
        interp->feature_flags |= Ty_RTFLAGS_MULTI_INTERP_EXTENSIONS;
    }

    switch (config->gil) {
    case PyInterpreterConfig_DEFAULT_GIL: break;
    case PyInterpreterConfig_SHARED_GIL: break;
    case PyInterpreterConfig_OWN_GIL: break;
    default:
        return _TyStatus_ERR("invalid interpreter config 'gil' value");
    }

    return _TyStatus_OK();
}


static void
init_interp_create_gil(TyThreadState *tstate, int gil)
{
    /* finalize_interp_delete() comment explains why _TyEval_FiniGIL() is
       only called here. */
    // XXX This is broken with a per-interpreter GIL.
    _TyEval_FiniGIL(tstate->interp);

    /* Auto-thread-state API */
    _TyGILState_SetTstate(tstate);

    int own_gil = (gil == PyInterpreterConfig_OWN_GIL);

    /* Create the GIL and take it */
    _TyEval_InitGIL(tstate, own_gil);
}

static int
builtins_dict_watcher(TyDict_WatchEvent event, TyObject *dict, TyObject *key, TyObject *new_value)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
#ifdef _Ty_TIER2
    if (interp->rare_events.builtin_dict < _Ty_MAX_ALLOWED_BUILTINS_MODIFICATIONS) {
        _Ty_Executors_InvalidateAll(interp, 1);
    }
#endif
    RARE_EVENT_INTERP_INC(interp, builtin_dict);
    return 0;
}

static TyStatus
pycore_create_interpreter(_PyRuntimeState *runtime,
                          const TyConfig *src_config,
                          TyThreadState **tstate_p)
{
    TyStatus status;
    TyInterpreterState *interp;
    status = _TyInterpreterState_New(NULL, &interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    assert(interp != NULL);
    assert(_Ty_IsMainInterpreter(interp));
    _TyInterpreterState_SetWhence(interp, _TyInterpreterState_WHENCE_RUNTIME);
    interp->_ready = 1;

    status = _TyConfig_Copy(&interp->config, src_config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    /* Auto-thread-state API */
    status = _TyGILState_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    PyInterpreterConfig config = _PyInterpreterConfig_LEGACY_INIT;
    // The main interpreter always has its own GIL and supports single-phase
    // init extensions.
    config.gil = PyInterpreterConfig_OWN_GIL;
    config.check_multi_interp_extensions = 0;
    status = init_interp_settings(interp, &config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    // This could be done in init_interpreter() (in pystate.c) if it
    // didn't depend on interp->feature_flags being set already.
    status = _TyObject_InitState(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    // initialize the interp->obmalloc state.  This must be done after
    // the settings are loaded (so that feature_flags are set) but before
    // any calls are made to obmalloc functions.
    if (_TyMem_init_obmalloc(interp) < 0) {
        return _TyStatus_NO_MEMORY();
    }

    status = _PyTraceMalloc_Init();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyThreadState *tstate = _TyThreadState_New(interp,
                                               _TyThreadState_WHENCE_INIT);
    if (tstate == NULL) {
        return _TyStatus_ERR("can't make first thread");
    }
    runtime->main_tstate = tstate;
    _TyThreadState_Bind(tstate);

    init_interp_create_gil(tstate, config.gil);

    *tstate_p = tstate;
    return _TyStatus_OK();
}


static TyStatus
pycore_init_global_objects(TyInterpreterState *interp)
{
    TyStatus status;

    _TyFloat_InitState(interp);

    status = _TyUnicode_InitGlobalObjects(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    _TyUnicode_InitState(interp);

    if (_Ty_IsMainInterpreter(interp)) {
        _Ty_GetConstant_Init();
    }

    return _TyStatus_OK();
}


static TyStatus
pycore_init_types(TyInterpreterState *interp)
{
    TyStatus status;

    status = _PyTypes_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyLong_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyUnicode_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyFloat_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (_TyExc_InitTypes(interp) < 0) {
        return _TyStatus_ERR("failed to initialize an exception type");
    }

    status = _TyExc_InitGlobalObjects(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyExc_InitState(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyErr_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyContext_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _PyXI_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _PyInterpolation_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _PyDateTime_InitTypes(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    return _TyStatus_OK();
}

static TyStatus
pycore_init_builtins(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;

    TyObject *bimod = _PyBuiltin_Init(interp);
    if (bimod == NULL) {
        goto error;
    }

    TyObject *modules = _TyImport_GetModules(interp);
    if (_TyImport_FixupBuiltin(tstate, bimod, "builtins", modules) < 0) {
        goto error;
    }

    TyObject *builtins_dict = TyModule_GetDict(bimod);
    if (builtins_dict == NULL) {
        goto error;
    }
    interp->builtins = Ty_NewRef(builtins_dict);

    TyObject *isinstance = TyDict_GetItemWithError(builtins_dict, &_Ty_ID(isinstance));
    if (!isinstance) {
        goto error;
    }
    interp->callable_cache.isinstance = isinstance;

    TyObject *len = TyDict_GetItemWithError(builtins_dict, &_Ty_ID(len));
    if (!len) {
        goto error;
    }
    interp->callable_cache.len = len;

    TyObject *all = TyDict_GetItemWithError(builtins_dict, &_Ty_ID(all));
    if (!all) {
        goto error;
    }

    TyObject *any = TyDict_GetItemWithError(builtins_dict, &_Ty_ID(any));
    if (!any) {
        goto error;
    }

    interp->common_consts[CONSTANT_ASSERTIONERROR] = TyExc_AssertionError;
    interp->common_consts[CONSTANT_NOTIMPLEMENTEDERROR] = TyExc_NotImplementedError;
    interp->common_consts[CONSTANT_BUILTIN_TUPLE] = (TyObject*)&TyTuple_Type;
    interp->common_consts[CONSTANT_BUILTIN_ALL] = all;
    interp->common_consts[CONSTANT_BUILTIN_ANY] = any;

    for (int i=0; i < NUM_COMMON_CONSTANTS; i++) {
        assert(interp->common_consts[i] != NULL);
    }

    TyObject *list_append = _TyType_Lookup(&TyList_Type, &_Ty_ID(append));
    if (list_append == NULL) {
        goto error;
    }
    interp->callable_cache.list_append = list_append;

    TyObject *object__getattribute__ = _TyType_Lookup(&PyBaseObject_Type, &_Ty_ID(__getattribute__));
    if (object__getattribute__ == NULL) {
        goto error;
    }
    interp->callable_cache.object__getattribute__ = object__getattribute__;

    if (_PyBuiltins_AddExceptions(bimod) < 0) {
        return _TyStatus_ERR("failed to add exceptions to builtins");
    }

    interp->builtins_copy = TyDict_Copy(interp->builtins);
    if (interp->builtins_copy == NULL) {
        goto error;
    }
    Ty_DECREF(bimod);

    if (_TyImport_InitDefaultImportFunc(interp) < 0) {
        goto error;
    }

    assert(!_TyErr_Occurred(tstate));
    return _TyStatus_OK();

error:
    Ty_XDECREF(bimod);
    return _TyStatus_ERR("can't initialize builtins module");
}


static TyStatus
pycore_interp_init(TyThreadState *tstate)
{
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    if (_tstate->c_stack_hard_limit == 0) {
        _Ty_InitializeRecursionLimits(tstate);
    }
    TyInterpreterState *interp = tstate->interp;
    TyStatus status;
    TyObject *sysmod = NULL;

    // Create singletons before the first TyType_Ready() call, since
    // TyType_Ready() uses singletons like the Unicode empty string (tp_doc)
    // and the empty tuple singletons (tp_bases).
    status = pycore_init_global_objects(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyCode_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _PyDtoa_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    // The GC must be initialized before the first GC collection.
    status = _TyGC_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = pycore_init_types(interp);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    if (_TyWarnings_InitState(interp) < 0) {
        return _TyStatus_ERR("can't initialize warnings");
    }

    status = _PyAtExit_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TySys_Create(tstate, &sysmod);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = pycore_init_builtins(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    status = _PyXI_Init(interp);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    const TyConfig *config = _TyInterpreterState_GetConfig(interp);

    status = _TyImport_InitCore(tstate, sysmod, config->_install_importlib);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

done:
    /* sys.modules['sys'] contains a strong reference to the module */
    Ty_XDECREF(sysmod);
    return status;
}


static TyStatus
pyinit_config(_PyRuntimeState *runtime,
              TyThreadState **tstate_p,
              const TyConfig *config)
{
    TyStatus status = pycore_init_runtime(runtime, config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyThreadState *tstate;
    status = pycore_create_interpreter(runtime, config, &tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    *tstate_p = tstate;

    status = pycore_interp_init(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    /* Only when we get here is the runtime core fully initialized */
    runtime->core_initialized = 1;
    return _TyStatus_OK();
}


TyStatus
_Ty_PreInitializeFromPyArgv(const TyPreConfig *src_config, const _PyArgv *args)
{
    TyStatus status;

    if (src_config == NULL) {
        return _TyStatus_ERR("preinitialization config is NULL");
    }

    status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    _PyRuntimeState *runtime = &_PyRuntime;

    if (runtime->preinitialized) {
        /* If it's already configured: ignored the new configuration */
        return _TyStatus_OK();
    }

    /* Note: preinitializing remains 1 on error, it is only set to 0
       at exit on success. */
    runtime->preinitializing = 1;

    TyPreConfig config;

    status = _TyPreConfig_InitFromPreConfig(&config, src_config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyPreConfig_Read(&config, args);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = _TyPreConfig_Write(&config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    runtime->preinitializing = 0;
    runtime->preinitialized = 1;
    return _TyStatus_OK();
}


TyStatus
Ty_PreInitializeFromBytesArgs(const TyPreConfig *src_config, Ty_ssize_t argc, char **argv)
{
    _PyArgv args = {.use_bytes_argv = 1, .argc = argc, .bytes_argv = argv};
    return _Ty_PreInitializeFromPyArgv(src_config, &args);
}


TyStatus
Ty_PreInitializeFromArgs(const TyPreConfig *src_config, Ty_ssize_t argc, wchar_t **argv)
{
    _PyArgv args = {.use_bytes_argv = 0, .argc = argc, .wchar_argv = argv};
    return _Ty_PreInitializeFromPyArgv(src_config, &args);
}


TyStatus
Ty_PreInitialize(const TyPreConfig *src_config)
{
    return _Ty_PreInitializeFromPyArgv(src_config, NULL);
}


TyStatus
_Ty_PreInitializeFromConfig(const TyConfig *config,
                            const _PyArgv *args)
{
    assert(config != NULL);

    TyStatus status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    _PyRuntimeState *runtime = &_PyRuntime;

    if (runtime->preinitialized) {
        /* Already initialized: do nothing */
        return _TyStatus_OK();
    }

    TyPreConfig preconfig;

    _TyPreConfig_InitFromConfig(&preconfig, config);

    if (!config->parse_argv) {
        return Ty_PreInitialize(&preconfig);
    }
    else if (args == NULL) {
        _PyArgv config_args = {
            .use_bytes_argv = 0,
            .argc = config->argv.length,
            .wchar_argv = config->argv.items};
        return _Ty_PreInitializeFromPyArgv(&preconfig, &config_args);
    }
    else {
        return _Ty_PreInitializeFromPyArgv(&preconfig, args);
    }
}


/* Begin interpreter initialization
 *
 * On return, the first thread and interpreter state have been created,
 * but the compiler, signal handling, multithreading and
 * multiple interpreter support, and codec infrastructure are not yet
 * available.
 *
 * The import system will support builtin and frozen modules only.
 * The only supported io is writing to sys.stderr
 *
 * If any operation invoked by this function fails, a fatal error is
 * issued and the function does not return.
 *
 * Any code invoked from this function should *not* assume it has access
 * to the Python C API (unless the API is explicitly listed as being
 * safe to call without calling Ty_Initialize first)
 */
static TyStatus
pyinit_core(_PyRuntimeState *runtime,
            const TyConfig *src_config,
            TyThreadState **tstate_p)
{
    TyStatus status;

    status = _Ty_PreInitializeFromConfig(src_config, NULL);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    TyConfig config;
    TyConfig_InitTyphonConfig(&config);

    status = _TyConfig_Copy(&config, src_config);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    // Read the configuration, but don't compute the path configuration
    // (it is computed in the main init).
    status = _TyConfig_Read(&config, 0);
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

    if (!runtime->core_initialized) {
        status = pyinit_config(runtime, tstate_p, &config);
    }
    else {
        status = pyinit_core_reconfigure(runtime, tstate_p, &config);
    }
    if (_TyStatus_EXCEPTION(status)) {
        goto done;
    }

done:
    TyConfig_Clear(&config);
    return status;
}


/* Ty_Initialize() has already been called: update the main interpreter
   configuration. Example of bpo-34008: Ty_Main() called after
   Ty_Initialize(). */
static TyStatus
pyinit_main_reconfigure(TyThreadState *tstate)
{
    if (interpreter_update_config(tstate, 0) < 0) {
        return _TyStatus_ERR("fail to reconfigure Python");
    }
    return _TyStatus_OK();
}


#ifdef Ty_DEBUG
static void
run_presite(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;
    const TyConfig *config = _TyInterpreterState_GetConfig(interp);

    if (!config->run_presite) {
        return;
    }

    TyObject *presite_modname = TyUnicode_FromWideChar(
        config->run_presite,
        wcslen(config->run_presite)
    );
    if (presite_modname == NULL) {
        fprintf(stderr, "Could not convert pre-site module name to unicode\n");
    }
    else {
        TyObject *presite = TyImport_Import(presite_modname);
        if (presite == NULL) {
            fprintf(stderr, "pre-site import failed:\n");
            _TyErr_Print(tstate);
        }
        Ty_XDECREF(presite);
        Ty_DECREF(presite_modname);
    }
}
#endif


static TyStatus
init_interp_main(TyThreadState *tstate)
{
    assert(!_TyErr_Occurred(tstate));

    TyStatus status;
    int is_main_interp = _Ty_IsMainInterpreter(tstate->interp);
    TyInterpreterState *interp = tstate->interp;
    const TyConfig *config = _TyInterpreterState_GetConfig(interp);

    if (!config->_install_importlib) {
        /* Special mode for freeze_importlib: run with no import system
         *
         * This means anything which needs support from extension modules
         * or pure Python code in the standard library won't work.
         */
        if (is_main_interp) {
            interp->runtime->initialized = 1;
        }
        return _TyStatus_OK();
    }

    // Initialize the import-related configuration.
    status = _TyConfig_InitImportConfig(&interp->config);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (interpreter_update_config(tstate, 1) < 0) {
        return _TyStatus_ERR("failed to update the Python config");
    }

    status = _TyImport_InitExternal(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (is_main_interp) {
        /* initialize the faulthandler module */
        status = _PyFaulthandler_Init(config->faulthandler);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    status = _TyUnicode_InitEncodings(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (is_main_interp) {
        if (_PySignal_Init(config->install_signal_handlers) < 0) {
            return _TyStatus_ERR("can't initialize signals");
        }

        if (config->tracemalloc) {
           if (_PyTraceMalloc_Start(config->tracemalloc) < 0) {
                return _TyStatus_ERR("can't start tracemalloc");
            }
        }

#ifdef PY_HAVE_PERF_TRAMPOLINE
        if (config->perf_profiling) {
            _PyPerf_Callbacks *cur_cb;
            if (config->perf_profiling == 1) {
                cur_cb = &_Ty_perfmap_callbacks;
            }
            else {
                cur_cb = &_Ty_perfmap_jit_callbacks;
            }
            if (_PyPerfTrampoline_SetCallbacks(cur_cb) < 0 ||
                    _PyPerfTrampoline_Init(config->perf_profiling) < 0) {
                return _TyStatus_ERR("can't initialize the perf trampoline");
            }
        }
#endif
    }

    status = init_sys_streams(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    status = init_set_builtins_open();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

#ifdef __ANDROID__
    status = init_android_streams(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
#endif
#if defined(__APPLE__) && HAS_APPLE_SYSTEM_LOG
    if (config->use_system_logger) {
        status = init_apple_streams(tstate);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }
#endif

#ifdef Ty_DEBUG
    run_presite(tstate);
#endif

    status = add_main_module(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    if (is_main_interp) {
        /* Initialize warnings. */
        TyObject *warnoptions;
        if (_TySys_GetOptionalAttrString("warnoptions", &warnoptions) < 0) {
            return _TyStatus_ERR("can't initialize warnings");
        }
        if (warnoptions != NULL && TyList_Check(warnoptions) &&
            TyList_Size(warnoptions) > 0)
        {
            TyObject *warnings_module = TyImport_ImportModule("warnings");
            if (warnings_module == NULL) {
                fprintf(stderr, "'import warnings' failed; traceback:\n");
                _TyErr_Print(tstate);
            }
            Ty_XDECREF(warnings_module);
        }
        Ty_XDECREF(warnoptions);

        interp->runtime->initialized = 1;
    }

    if (config->site_import) {
        status = init_import_site();
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    if (is_main_interp) {
#ifndef MS_WINDOWS
        emit_stderr_warning_for_legacy_locale(interp->runtime);
#endif
    }

    // Turn on experimental tier 2 (uops-based) optimizer
    // This is also needed when the JIT is enabled
#ifdef _Ty_TIER2
    if (is_main_interp) {
        int enabled = 1;
#if _Ty_TIER2 & 2
        enabled = 0;
#endif
        char *env = Ty_GETENV("PYTHON_JIT");
        if (env && *env != '\0') {
            // PYTHON_JIT=0|1 overrides the default
            enabled = *env != '0';
        }
        if (enabled) {
#ifdef _Ty_JIT
            // perf profiler works fine with tier 2 interpreter, so
            // only checking for a "real JIT".
            if (config->perf_profiling > 0) {
                (void)TyErr_WarnEx(
                    TyExc_RuntimeWarning,
                    "JIT deactivated as perf profiling support is active",
                    0);
            } else
#endif
            {
                interp->jit = true;
            }
        }
    }
#endif

    if (!is_main_interp) {
        // The main interpreter is handled in Ty_Main(), for now.
        if (config->sys_path_0 != NULL) {
            TyObject *path0 = TyUnicode_FromWideChar(config->sys_path_0, -1);
            if (path0 == NULL) {
                return _TyStatus_ERR("can't initialize sys.path[0]");
            }
            TyObject *sysdict = interp->sysdict;
            if (sysdict == NULL) {
                Ty_DECREF(path0);
                return _TyStatus_ERR("can't initialize sys.path[0]");
            }
            TyObject *sys_path = TyDict_GetItemWithError(sysdict, &_Ty_ID(path));
            if (sys_path == NULL) {
                Ty_DECREF(path0);
                return _TyStatus_ERR("can't initialize sys.path[0]");
            }
            int res = TyList_Insert(sys_path, 0, path0);
            Ty_DECREF(path0);
            if (res) {
                return _TyStatus_ERR("can't initialize sys.path[0]");
            }
        }
    }


    interp->dict_state.watchers[0] = &builtins_dict_watcher;
    if (TyDict_Watch(0, interp->builtins) != 0) {
        return _TyStatus_ERR("failed to set builtin dict watcher");
    }

    assert(!_TyErr_Occurred(tstate));

    return _TyStatus_OK();
}


/* Update interpreter state based on supplied configuration settings
 *
 * After calling this function, most of the restrictions on the interpreter
 * are lifted. The only remaining incomplete settings are those related
 * to the main module (sys.argv[0], __main__ metadata)
 *
 * Calling this when the interpreter is not initializing, is already
 * initialized or without a valid current thread state is a fatal error.
 * Other errors should be reported as normal Python exceptions with a
 * non-zero return code.
 */
static TyStatus
pyinit_main(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;
    if (!interp->runtime->core_initialized) {
        return _TyStatus_ERR("runtime core not initialized");
    }

    if (interp->runtime->initialized) {
        return pyinit_main_reconfigure(tstate);
    }

    TyStatus status = init_interp_main(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    return _TyStatus_OK();
}


TyStatus
Ty_InitializeFromConfig(const TyConfig *config)
{
    if (config == NULL) {
        return _TyStatus_ERR("initialization config is NULL");
    }

    TyStatus status;

    status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    _PyRuntimeState *runtime = &_PyRuntime;

    TyThreadState *tstate = NULL;
    status = pyinit_core(runtime, config, &tstate);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    config = _TyInterpreterState_GetConfig(tstate->interp);

    if (config->_init_main) {
        status = pyinit_main(tstate);
        if (_TyStatus_EXCEPTION(status)) {
            return status;
        }
    }

    return _TyStatus_OK();
}


void
Ty_InitializeEx(int install_sigs)
{
    TyStatus status;

    status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        Ty_ExitStatusException(status);
    }
    _PyRuntimeState *runtime = &_PyRuntime;

    if (runtime->initialized) {
        /* bpo-33932: Calling Ty_Initialize() twice does nothing. */
        return;
    }

    TyConfig config;
    _TyConfig_InitCompatConfig(&config);

    config.install_signal_handlers = install_sigs;

    status = Ty_InitializeFromConfig(&config);
    TyConfig_Clear(&config);
    if (_TyStatus_EXCEPTION(status)) {
        Ty_ExitStatusException(status);
    }
}

void
Ty_Initialize(void)
{
    Ty_InitializeEx(1);
}


static void
finalize_modules_delete_special(TyThreadState *tstate, int verbose)
{
    // List of names to clear in sys
    static const char * const sys_deletes[] = {
        "path", "argv", "ps1", "ps2", "last_exc",
        "last_type", "last_value", "last_traceback",
        "__interactivehook__",
        // path_hooks and path_importer_cache are cleared
        // by _TyImport_FiniExternal().
        // XXX Clear meta_path in _TyImport_FiniCore().
        "meta_path",
        NULL
    };

    static const char * const sys_files[] = {
        "stdin", "__stdin__",
        "stdout", "__stdout__",
        "stderr", "__stderr__",
        NULL
    };

    TyInterpreterState *interp = tstate->interp;
    if (verbose) {
        TySys_WriteStderr("# clear builtins._\n");
    }
    if (TyDict_SetItemString(interp->builtins, "_", Ty_None) < 0) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "setting builtin variable _");
    }

    const char * const *p;
    for (p = sys_deletes; *p != NULL; p++) {
        if (_TySys_ClearAttrString(interp, *p, verbose) < 0) {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "clearing sys.%s", *p);
        }
    }
    for (p = sys_files; *p != NULL; p+=2) {
        const char *name = p[0];
        const char *orig_name = p[1];
        if (verbose) {
            TySys_WriteStderr("# restore sys.%s\n", name);
        }
        TyObject *value;
        if (TyDict_GetItemStringRef(interp->sysdict, orig_name, &value) < 0) {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "restoring sys.%s", name);
        }
        if (value == NULL) {
            value = Ty_NewRef(Ty_None);
        }
        if (TyDict_SetItemString(interp->sysdict, name, value) < 0) {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "restoring sys.%s", name);
        }
        Ty_DECREF(value);
    }
}


static TyObject*
finalize_remove_modules(TyObject *modules, int verbose)
{
    TyObject *weaklist = TyList_New(0);
    if (weaklist == NULL) {
        TyErr_FormatUnraisable("Exception ignored while removing modules");
    }

#define STORE_MODULE_WEAKREF(name, mod) \
        if (weaklist != NULL) { \
            TyObject *wr = PyWeakref_NewRef(mod, NULL); \
            if (wr) { \
                TyObject *tup = TyTuple_Pack(2, name, wr); \
                if (!tup || TyList_Append(weaklist, tup) < 0) { \
                    TyErr_FormatUnraisable("Exception ignored while removing modules"); \
                } \
                Ty_XDECREF(tup); \
                Ty_DECREF(wr); \
            } \
            else { \
                TyErr_FormatUnraisable("Exception ignored while removing modules"); \
            } \
        }

#define CLEAR_MODULE(name, mod) \
        if (TyModule_Check(mod)) { \
            if (verbose && TyUnicode_Check(name)) { \
                TySys_FormatStderr("# cleanup[2] removing %U\n", name); \
            } \
            STORE_MODULE_WEAKREF(name, mod); \
            if (PyObject_SetItem(modules, name, Ty_None) < 0) { \
                TyErr_FormatUnraisable("Exception ignored while removing modules"); \
            } \
        }

    if (TyDict_CheckExact(modules)) {
        Ty_ssize_t pos = 0;
        TyObject *key, *value;
        while (TyDict_Next(modules, &pos, &key, &value)) {
            CLEAR_MODULE(key, value);
        }
    }
    else {
        TyObject *iterator = PyObject_GetIter(modules);
        if (iterator == NULL) {
            TyErr_FormatUnraisable("Exception ignored while removing modules");
        }
        else {
            TyObject *key;
            while ((key = TyIter_Next(iterator))) {
                TyObject *value = PyObject_GetItem(modules, key);
                if (value == NULL) {
                    TyErr_FormatUnraisable("Exception ignored while removing modules");
                    continue;
                }
                CLEAR_MODULE(key, value);
                Ty_DECREF(value);
                Ty_DECREF(key);
            }
            if (TyErr_Occurred()) {
                TyErr_FormatUnraisable("Exception ignored while removing modules");
            }
            Ty_DECREF(iterator);
        }
    }
#undef CLEAR_MODULE
#undef STORE_MODULE_WEAKREF

    return weaklist;
}


static void
finalize_clear_modules_dict(TyObject *modules)
{
    if (TyDict_CheckExact(modules)) {
        TyDict_Clear(modules);
    }
    else {
        if (PyObject_CallMethodNoArgs(modules, &_Ty_ID(clear)) == NULL) {
            TyErr_FormatUnraisable("Exception ignored while clearing sys.modules");
        }
    }
}


static void
finalize_restore_builtins(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;
    TyObject *dict = TyDict_Copy(interp->builtins);
    if (dict == NULL) {
        TyErr_FormatUnraisable("Exception ignored while restoring builtins");
    }
    TyDict_Clear(interp->builtins);
    if (TyDict_Update(interp->builtins, interp->builtins_copy)) {
        TyErr_FormatUnraisable("Exception ignored while restoring builtins");
    }
    Ty_XDECREF(dict);
}


static void
finalize_modules_clear_weaklist(TyInterpreterState *interp,
                                TyObject *weaklist, int verbose)
{
    // First clear modules imported later
    for (Ty_ssize_t i = TyList_GET_SIZE(weaklist) - 1; i >= 0; i--) {
        TyObject *tup = TyList_GET_ITEM(weaklist, i);
        TyObject *name = TyTuple_GET_ITEM(tup, 0);
        TyObject *mod = _TyWeakref_GET_REF(TyTuple_GET_ITEM(tup, 1));
        if (mod == NULL) {
            continue;
        }
        assert(TyModule_Check(mod));
        TyObject *dict = _TyModule_GetDict(mod);  // borrowed reference
        if (dict == interp->builtins || dict == interp->sysdict) {
            Ty_DECREF(mod);
            continue;
        }
        if (verbose && TyUnicode_Check(name)) {
            TySys_FormatStderr("# cleanup[3] wiping %U\n", name);
        }
        _TyModule_Clear(mod);
        Ty_DECREF(mod);
    }
}


static void
finalize_clear_sys_builtins_dict(TyInterpreterState *interp, int verbose)
{
    // Clear sys dict
    if (verbose) {
        TySys_FormatStderr("# cleanup[3] wiping sys\n");
    }
    _TyModule_ClearDict(interp->sysdict);

    // Clear builtins dict
    if (verbose) {
        TySys_FormatStderr("# cleanup[3] wiping builtins\n");
    }
    _TyModule_ClearDict(interp->builtins);
}


/* Clear modules, as good as we can */
// XXX Move most of this to import.c.
static void
finalize_modules(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;

    // Invalidate all executors and turn off JIT:
    interp->jit = false;
#ifdef _Ty_TIER2
    _Ty_Executors_InvalidateAll(interp, 0);
#endif

    // Stop watching __builtin__ modifications
    if (TyDict_Unwatch(0, interp->builtins) < 0) {
        // might happen if interp is cleared before watching the __builtin__
        TyErr_Clear();
    }
    TyObject *modules = _TyImport_GetModules(interp);
    if (modules == NULL) {
        // Already done
        return;
    }
    int verbose = _TyInterpreterState_GetConfig(interp)->verbose;

    // Delete some special builtins._ and sys attributes first.  These are
    // common places where user values hide and people complain when their
    // destructors fail.  Since the modules containing them are
    // deleted *last* of all, they would come too late in the normal
    // destruction order.  Sigh.
    //
    // XXX Perhaps these precautions are obsolete. Who knows?
    finalize_modules_delete_special(tstate, verbose);

    // Remove all modules from sys.modules, hoping that garbage collection
    // can reclaim most of them: set all sys.modules values to None.
    //
    // We prepare a list which will receive (name, weakref) tuples of
    // modules when they are removed from sys.modules.  The name is used
    // for diagnosis messages (in verbose mode), while the weakref helps
    // detect those modules which have been held alive.
    TyObject *weaklist = finalize_remove_modules(modules, verbose);

    // Clear the modules dict
    finalize_clear_modules_dict(modules);

    // Restore the original builtins dict, to ensure that any
    // user data gets cleared.
    finalize_restore_builtins(tstate);

    // Collect garbage
    _TyGC_CollectNoFail(tstate);

    // Dump GC stats before it's too late, since it uses the warnings
    // machinery.
    _TyGC_DumpShutdownStats(interp);

    if (weaklist != NULL) {
        // Now, if there are any modules left alive, clear their globals to
        // minimize potential leaks.  All C extension modules actually end
        // up here, since they are kept alive in the interpreter state.
        //
        // The special treatment of "builtins" here is because even
        // when it's not referenced as a module, its dictionary is
        // referenced by almost every module's __builtins__.  Since
        // deleting a module clears its dictionary (even if there are
        // references left to it), we need to delete the "builtins"
        // module last.  Likewise, we don't delete sys until the very
        // end because it is implicitly referenced (e.g. by print).
        //
        // Since dict is ordered in CPython 3.6+, modules are saved in
        // importing order.  First clear modules imported later.
        finalize_modules_clear_weaklist(interp, weaklist, verbose);
        Ty_DECREF(weaklist);
    }

    // Clear sys and builtins modules dict
    finalize_clear_sys_builtins_dict(interp, verbose);

    // Clear module dict copies stored in the interpreter state:
    // clear TyInterpreterState.modules_by_index and
    // clear TyModuleDef.m_base.m_copy (of extensions not using the multi-phase
    // initialization API)
    _TyImport_ClearModulesByIndex(interp);

    // Clear and delete the modules directory.  Actual modules will
    // still be there only if imported during the execution of some
    // destructor.
    _TyImport_ClearModules(interp);

    // Collect garbage once more
    _TyGC_CollectNoFail(tstate);
}


/* Flush stdout and stderr */

static int
file_is_closed(TyObject *fobj)
{
    int r;
    TyObject *tmp = PyObject_GetAttrString(fobj, "closed");
    if (tmp == NULL) {
        TyErr_Clear();
        return 0;
    }
    r = PyObject_IsTrue(tmp);
    Ty_DECREF(tmp);
    if (r < 0)
        TyErr_Clear();
    return r > 0;
}


static int
flush_std_files(void)
{
    TyObject *file;
    int status = 0;

    if (_TySys_GetOptionalAttr(&_Ty_ID(stdout), &file) < 0) {
        status = -1;
    }
    else if (file != NULL && file != Ty_None && !file_is_closed(file)) {
        if (_PyFile_Flush(file) < 0) {
            status = -1;
        }
    }
    if (status < 0) {
        TyErr_FormatUnraisable("Exception ignored while flushing sys.stdout");
    }
    Ty_XDECREF(file);

    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &file) < 0) {
        TyErr_Clear();
        status = -1;
    }
    else if (file != NULL && file != Ty_None && !file_is_closed(file)) {
        if (_PyFile_Flush(file) < 0) {
            TyErr_Clear();
            status = -1;
        }
    }
    Ty_XDECREF(file);

    return status;
}

/* Undo the effect of Ty_Initialize().

   Beware: if multiple interpreter and/or thread states exist, these
   are not wiped out; only the current thread and interpreter state
   are deleted.  But since everything else is deleted, those other
   interpreter and thread states should no longer be used.

   (XXX We should do better, e.g. wipe out all interpreters and
   threads.)

   Locking: as above.

*/


static void
finalize_interp_types(TyInterpreterState *interp)
{
    _PyTypes_FiniExtTypes(interp);
    _TyUnicode_FiniTypes(interp);
    _TySys_FiniTypes(interp);
    _PyXI_FiniTypes(interp);
    _TyExc_Fini(interp);
    _TyFloat_FiniType(interp);
    _TyLong_FiniTypes(interp);
    _PyThread_FiniType(interp);
    // XXX fini collections module static types (_PyStaticType_Dealloc())
    // XXX fini IO module static types (_PyStaticType_Dealloc())
    _TyErr_FiniTypes(interp);
    _PyTypes_FiniTypes(interp);

    _PyTypes_Fini(interp);
#ifdef Ty_GIL_DISABLED
    _TyObject_FinalizeUniqueIdPool(interp);
#endif

    _TyCode_Fini(interp);

    // Call _TyUnicode_ClearInterned() before _TyDict_Fini() since it uses
    // a dict internally.
    _TyUnicode_ClearInterned(interp);

    _TyUnicode_Fini(interp);

#ifndef Ty_GIL_DISABLED
    // With Ty_GIL_DISABLED:
    // the freelists for the current thread state have already been cleared.
    struct _Ty_freelists *freelists = _Ty_freelists_GET();
    _TyObject_ClearFreeLists(freelists, 1);
#endif

#ifdef Ty_DEBUG
    _PyStaticObjects_CheckRefcnt(interp);
#endif
}


static void
finalize_interp_clear(TyThreadState *tstate)
{
    int is_main_interp = _Ty_IsMainInterpreter(tstate->interp);

    _PyXI_Fini(tstate->interp);
    _TyExc_ClearExceptionGroupType(tstate->interp);
    _Ty_clear_generic_types(tstate->interp);

    /* Clear interpreter state and all thread states */
    _TyInterpreterState_Clear(tstate);

    /* Clear all loghooks */
    /* Both _TySys_Audit function and users still need TyObject, such as tuple.
       Call _TySys_ClearAuditHooks when TyObject available. */
    if (is_main_interp) {
        _TySys_ClearAuditHooks(tstate);
    }

    if (is_main_interp) {
        _Ty_HashRandomization_Fini();
        _TyArg_Fini();
        _Ty_ClearFileSystemEncoding();
        _PyPerfTrampoline_Fini();
        _PyPerfTrampoline_FreeArenas();
    }

    finalize_interp_types(tstate->interp);

    /* Finalize dtoa at last so that finalizers calling repr of float doesn't crash */
    _PyDtoa_Fini(tstate->interp);

    /* Free any delayed free requests immediately */
    _TyMem_FiniDelayed(tstate->interp);

    /* finalize_interp_types may allocate Python objects so we may need to
       abandon mimalloc segments again */
    _TyThreadState_ClearMimallocHeaps(tstate);
}


static void
finalize_interp_delete(TyInterpreterState *interp)
{
    /* Cleanup auto-thread-state */
    _TyGILState_Fini(interp);

    /* We can't call _TyEval_FiniGIL() here because destroying the GIL lock can
       fail when it is being awaited by another running daemon thread (see
       bpo-9901). Instead pycore_create_interpreter() destroys the previously
       created GIL, which ensures that Ty_Initialize / Ty_FinalizeEx can be
       called multiple times. */

    TyInterpreterState_Delete(interp);
}


/* Conceptually, there isn't a good reason for Ty_Finalize()
   to be called in any other thread than the one where Ty_Initialize()
   was called.  Consequently, it would make sense to fail if the thread
   or thread state (or interpreter) don't match.  However, such
   constraints have never been enforced, and, as unlikely as it may be,
   there may be users relying on the unconstrained behavior.  Thus,
   we do our best here to accommodate that possibility. */

static TyThreadState *
resolve_final_tstate(_PyRuntimeState *runtime)
{
    TyThreadState *main_tstate = runtime->main_tstate;
    assert(main_tstate != NULL);
    assert(main_tstate->thread_id == runtime->main_thread);
    TyInterpreterState *main_interp = _TyInterpreterState_Main();
    assert(main_tstate->interp == main_interp);

    TyThreadState *tstate = _TyThreadState_GET();
    if (_Ty_IsMainThread()) {
        if (tstate != main_tstate) {
            /* This implies that Ty_Finalize() was called while
               a non-main interpreter was active or while the main
               tstate was temporarily swapped out with another.
               Neither case should be allowed, but, until we get around
               to fixing that (and Ty_Exit()), we're letting it go. */
            (void)TyThreadState_Swap(main_tstate);
        }
    }
    else {
        /* This is another unfortunate case where Ty_Finalize() was
           called when it shouldn't have been.  We can't simply switch
           over to the main thread.  At the least, however, we can make
           sure the main interpreter is active. */
        if (!_Ty_IsMainInterpreter(tstate->interp)) {
            /* We don't go to the trouble of updating runtime->main_tstate
               since it will be dead soon anyway. */
            main_tstate =
                _TyThreadState_New(main_interp, _TyThreadState_WHENCE_FINI);
            if (main_tstate != NULL) {
                _TyThreadState_Bind(main_tstate);
                (void)TyThreadState_Swap(main_tstate);
            }
            else {
                /* Fall back to the current tstate.  It's better than nothing. */
                main_tstate = tstate;
            }
        }
    }
    assert(main_tstate != NULL);

    /* We might want to warn if main_tstate->current_frame != NULL. */

    return main_tstate;
}

static int
_Ty_Finalize(_PyRuntimeState *runtime)
{
    int status = 0;

    /* Bail out early if already finalized (or never initialized). */
    if (!runtime->initialized) {
        return status;
    }

    /* Get final thread state pointer. */
    TyThreadState *tstate = resolve_final_tstate(runtime);

    // Block some operations.
    tstate->interp->finalizing = 1;

    // Wrap up existing "threading"-module-created, non-daemon threads.
    wait_for_thread_shutdown(tstate);

    // Make any remaining pending calls.
    _Ty_FinishPendingCalls(tstate);

    /* The interpreter is still entirely intact at this point, and the
     * exit funcs may be relying on that.  In particular, if some thread
     * or exit func is still waiting to do an import, the import machinery
     * expects Ty_IsInitialized() to return true.  So don't say the
     * runtime is uninitialized until after the exit funcs have run.
     * Note that Threading.py uses an exit func to do a join on all the
     * threads created thru it, so this also protects pending imports in
     * the threads created via Threading.
     */

    _PyAtExit_Call(tstate->interp);

    assert(_TyThreadState_GET() == tstate);

    /* Copy the core config, TyInterpreterState_Delete() free
       the core config memory */
#ifdef Ty_REF_DEBUG
    int show_ref_count = tstate->interp->config.show_ref_count;
#endif
#ifdef Ty_TRACE_REFS
    int dump_refs = tstate->interp->config.dump_refs;
    wchar_t *dump_refs_file = tstate->interp->config.dump_refs_file;
#endif
#ifdef WITH_PYMALLOC
    int malloc_stats = tstate->interp->config.malloc_stats;
#endif

    /* Ensure that remaining threads are detached */
    _TyEval_StopTheWorldAll(runtime);

    /* Remaining daemon threads will be trapped in TyThread_hang_thread
       when they attempt to take the GIL (ex: TyEval_RestoreThread()). */
    _TyInterpreterState_SetFinalizing(tstate->interp, tstate);
    _PyRuntimeState_SetFinalizing(runtime, tstate);
    runtime->initialized = 0;
    runtime->core_initialized = 0;

    // XXX Call something like _TyImport_Disable() here?

    /* Remove the state of all threads of the interpreter, except for the
       current thread. In practice, only daemon threads should still be alive,
       except if wait_for_thread_shutdown() has been cancelled by CTRL+C.
       We start the world once we are the only thread state left,
       before we call destructors. */
    TyThreadState *list = _TyThreadState_RemoveExcept(tstate);
    for (TyThreadState *p = list; p != NULL; p = p->next) {
        _TyThreadState_SetShuttingDown(p);
    }
    _TyEval_StartTheWorldAll(runtime);

    /* Clear frames of other threads to call objects destructors. Destructors
       will be called in the current Python thread. Since
       _PyRuntimeState_SetFinalizing() has been called, no other Python thread
       can take the GIL at this point: if they try, they will hang in
       _TyThreadState_HangThread. */
    _TyThreadState_DeleteList(list, /*is_after_fork=*/0);

    /* At this point no Python code should be running at all.
       The only thread state left should be the main thread of the main
       interpreter (AKA tstate), in which this code is running right now.
       There may be other OS threads running but none of them will have
       thread states associated with them, nor will be able to create
       new thread states.

       Thus tstate is the only possible thread state from here on out.
       It may still be used during finalization to run Python code as
       needed or provide runtime state (e.g. sys.modules) but that will
       happen sparingly.  Furthermore, the order of finalization aims
       to not need a thread (or interpreter) state as soon as possible.
     */
    // XXX Make sure we are preventing the creating of any new thread states
    // (or interpreters).

    /* Flush sys.stdout and sys.stderr */
    if (flush_std_files() < 0) {
        status = -1;
    }

    /* Disable signal handling */
    _PySignal_Fini();

    /* Collect garbage.  This may call finalizers; it's nice to call these
     * before all modules are destroyed.
     * XXX If a __del__ or weakref callback is triggered here, and tries to
     * XXX import a module, bad things can happen, because Python no
     * XXX longer believes it's initialized.
     * XXX     Fatal Python error: Interpreter not initialized (version mismatch?)
     * XXX is easy to provoke that way.  I've also seen, e.g.,
     * XXX     Exception exceptions.ImportError: 'No module named sha'
     * XXX         in <function callback at 0x008F5718> ignored
     * XXX but I'm unclear on exactly how that one happens.  In any case,
     * XXX I haven't seen a real-life report of either of these.
     */
    TyGC_Collect();

    /* Destroy all modules */
    _TyImport_FiniExternal(tstate->interp);
    finalize_modules(tstate);

    /* Clean up any lingering subinterpreters. */
    finalize_subinterpreters();

    /* Print debug stats if any */
    _TyEval_Fini();

    /* Flush sys.stdout and sys.stderr (again, in case more was printed) */
    if (flush_std_files() < 0) {
        status = -1;
    }

    /* Collect final garbage.  This disposes of cycles created by
     * class definitions, for example.
     * XXX This is disabled because it caused too many problems.  If
     * XXX a __del__ or weakref callback triggers here, Python code has
     * XXX a hard time running, because even the sys module has been
     * XXX cleared out (sys.stdout is gone, sys.excepthook is gone, etc).
     * XXX One symptom is a sequence of information-free messages
     * XXX coming from threads (if a __del__ or callback is invoked,
     * XXX other threads can execute too, and any exception they encounter
     * XXX triggers a comedy of errors as subsystem after subsystem
     * XXX fails to find what it *expects* to find in sys to help report
     * XXX the exception and consequent unexpected failures).  I've also
     * XXX seen segfaults then, after adding print statements to the
     * XXX Python code getting called.
     */
#if 0
    _TyGC_CollectIfEnabled();
#endif

    /* Disable tracemalloc after all Python objects have been destroyed,
       so it is possible to use tracemalloc in objects destructor. */
    _PyTraceMalloc_Fini();

    /* Finalize any remaining import state */
    // XXX Move these up to where finalize_modules() is currently.
    _TyImport_FiniCore(tstate->interp);
    _TyImport_Fini();

    /* unload faulthandler module */
    _PyFaulthandler_Fini();

    /* dump hash stats */
    _PyHash_Fini();

#ifdef Ty_TRACE_REFS
    /* Display all objects still alive -- this can invoke arbitrary
     * __repr__ overrides, so requires a mostly-intact interpreter.
     * Alas, a lot of stuff may still be alive now that will be cleaned
     * up later.
     */

    FILE *dump_refs_fp = NULL;
    if (dump_refs_file != NULL) {
        dump_refs_fp = _Ty_wfopen(dump_refs_file, L"w");
        if (dump_refs_fp == NULL) {
            fprintf(stderr, "PYTHONDUMPREFSFILE: cannot create file: %ls\n", dump_refs_file);
        }
    }

    if (dump_refs) {
        _Ty_PrintReferences(tstate->interp, stderr);
    }

    if (dump_refs_fp != NULL) {
        _Ty_PrintReferences(tstate->interp, dump_refs_fp);
    }
#endif /* Ty_TRACE_REFS */

    /* At this point there's almost no other Python code that will run,
       nor interpreter state needed.  The only possibility is the
       finalizers of the objects stored on tstate (and tstate->interp),
       which are triggered via finalize_interp_clear().

       For now we operate as though none of those finalizers actually
       need an operational thread state or interpreter.  In reality,
       those finalizers may rely on some part of tstate or
       tstate->interp, and/or may raise exceptions
       or otherwise fail.
     */
    // XXX Do this sooner during finalization.
    // XXX Ensure finalizer errors are handled properly.

    finalize_interp_clear(tstate);


#ifdef Ty_TRACE_REFS
    /* Display addresses (& refcnts) of all objects still alive.
     * An address can be used to find the repr of the object, printed
     * above by _Ty_PrintReferences. */
    if (dump_refs) {
        _Ty_PrintReferenceAddresses(tstate->interp, stderr);
    }
    if (dump_refs_fp != NULL) {
        _Ty_PrintReferenceAddresses(tstate->interp, dump_refs_fp);
        fclose(dump_refs_fp);
    }
#endif /* Ty_TRACE_REFS */

#ifdef WITH_PYMALLOC
    if (malloc_stats) {
        _TyObject_DebugMallocStats(stderr);
    }
#endif

    finalize_interp_delete(tstate->interp);

#ifdef Ty_REF_DEBUG
    if (show_ref_count) {
        _PyDebug_PrintTotalRefs();
    }
    _Ty_FinalizeRefTotal(runtime);
#endif
    _Ty_FinalizeAllocatedBlocks(runtime);

    call_ll_exitfuncs(runtime);

    _PyRuntime_Finalize();
    return status;
}

int
Ty_FinalizeEx(void)
{
    return _Ty_Finalize(&_PyRuntime);
}

void
Ty_Finalize(void)
{
    (void)_Ty_Finalize(&_PyRuntime);
}


/* Create and initialize a new interpreter and thread, and return the
   new thread.  This requires that Ty_Initialize() has been called
   first.

   Unsuccessful initialization yields a NULL pointer.  Note that *no*
   exception information is available even in this case -- the
   exception information is held in the thread, and there is no
   thread.

   Locking: as above.

*/

static TyStatus
new_interpreter(TyThreadState **tstate_p,
                const PyInterpreterConfig *config, long whence)
{
    TyStatus status;

    status = _PyRuntime_Initialize();
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }
    _PyRuntimeState *runtime = &_PyRuntime;

    if (!runtime->initialized) {
        return _TyStatus_ERR("Ty_Initialize must be called first");
    }

    /* Issue #10915, #15751: The GIL API doesn't work with multiple
       interpreters: disable TyGILState_Check(). */
    runtime->gilstate.check_enabled = 0;

    TyInterpreterState *interp = TyInterpreterState_New();
    if (interp == NULL) {
        *tstate_p = NULL;
        return _TyStatus_OK();
    }
    _TyInterpreterState_SetWhence(interp, whence);
    interp->_ready = 1;

    // XXX Might new_interpreter() have been called without the GIL held?
    TyThreadState *save_tstate = _TyThreadState_GET();
    TyThreadState *tstate = NULL;

    /* From this point until the init_interp_create_gil() call,
       we must not do anything that requires that the GIL be held
       (or otherwise exist).  That applies whether or not the new
       interpreter has its own GIL (e.g. the main interpreter). */
    if (save_tstate != NULL) {
        _TyThreadState_Detach(save_tstate);
    }

    /* Copy the current interpreter config into the new interpreter */
    const TyConfig *src_config;
    if (save_tstate != NULL) {
        src_config = _TyInterpreterState_GetConfig(save_tstate->interp);
    }
    else
    {
        /* No current thread state, copy from the main interpreter */
        TyInterpreterState *main_interp = _TyInterpreterState_Main();
        src_config = _TyInterpreterState_GetConfig(main_interp);
    }

    /* This does not require that the GIL be held. */
    status = _TyConfig_Copy(&interp->config, src_config);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    /* This does not require that the GIL be held. */
    status = init_interp_settings(interp, config);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    // This could be done in init_interpreter() (in pystate.c) if it
    // didn't depend on interp->feature_flags being set already.
    status = _TyObject_InitState(interp);
    if (_TyStatus_EXCEPTION(status)) {
        return status;
    }

    // initialize the interp->obmalloc state.  This must be done after
    // the settings are loaded (so that feature_flags are set) but before
    // any calls are made to obmalloc functions.
    if (_TyMem_init_obmalloc(interp) < 0) {
        status = _TyStatus_NO_MEMORY();
        goto error;
    }

    tstate = _TyThreadState_New(interp, _TyThreadState_WHENCE_INIT);
    if (tstate == NULL) {
        status = _TyStatus_NO_MEMORY();
        goto error;
    }

    _TyThreadState_Bind(tstate);
    init_interp_create_gil(tstate, config->gil);

    /* No objects have been created yet. */

    status = pycore_interp_init(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    status = init_interp_main(tstate);
    if (_TyStatus_EXCEPTION(status)) {
        goto error;
    }

    *tstate_p = tstate;
    return _TyStatus_OK();

error:
    *tstate_p = NULL;
    if (tstate != NULL) {
        Ty_EndInterpreter(tstate);
    } else {
        TyInterpreterState_Delete(interp);
    }
    if (save_tstate != NULL) {
        _TyThreadState_Attach(save_tstate);
    }
    return status;
}

TyStatus
Ty_NewInterpreterFromConfig(TyThreadState **tstate_p,
                            const PyInterpreterConfig *config)
{
    long whence = _TyInterpreterState_WHENCE_CAPI;
    return new_interpreter(tstate_p, config, whence);
}

TyThreadState *
Ty_NewInterpreter(void)
{
    TyThreadState *tstate = NULL;
    long whence = _TyInterpreterState_WHENCE_LEGACY_CAPI;
    const PyInterpreterConfig config = _PyInterpreterConfig_LEGACY_INIT;
    TyStatus status = new_interpreter(&tstate, &config, whence);
    if (_TyStatus_EXCEPTION(status)) {
        Ty_ExitStatusException(status);
    }
    return tstate;
}

/* Delete an interpreter and its last thread.  This requires that the
   given thread state is current, that the thread has no remaining
   frames, and that it is its interpreter's only remaining thread.
   It is a fatal error to violate these constraints.

   (Ty_FinalizeEx() doesn't have these constraints -- it zaps
   everything, regardless.)

   Locking: as above.

*/

void
Ty_EndInterpreter(TyThreadState *tstate)
{
    TyInterpreterState *interp = tstate->interp;

    if (tstate != _TyThreadState_GET()) {
        Ty_FatalError("thread is not current");
    }
    if (tstate->current_frame != NULL) {
        Ty_FatalError("thread still has a frame");
    }
    interp->finalizing = 1;

    // Wrap up existing "threading"-module-created, non-daemon threads.
    wait_for_thread_shutdown(tstate);

    // Make any remaining pending calls.
    _Ty_FinishPendingCalls(tstate);

    _PyAtExit_Call(tstate->interp);

    if (tstate != interp->threads.head || tstate->next != NULL) {
        Ty_FatalError("not the last thread");
    }

    /* Remaining daemon threads will automatically exit
       when they attempt to take the GIL (ex: TyEval_RestoreThread()). */
    _TyInterpreterState_SetFinalizing(interp, tstate);

    // XXX Call something like _TyImport_Disable() here?

    _TyImport_FiniExternal(tstate->interp);
    finalize_modules(tstate);
    _TyImport_FiniCore(tstate->interp);

    finalize_interp_clear(tstate);
    finalize_interp_delete(tstate->interp);
}

int
_Ty_IsInterpreterFinalizing(TyInterpreterState *interp)
{
    /* We check the runtime first since, in a daemon thread,
       interp might be dangling pointer. */
    TyThreadState *finalizing = _PyRuntimeState_GetFinalizing(&_PyRuntime);
    if (finalizing == NULL) {
        finalizing = _TyInterpreterState_GetFinalizing(interp);
    }
    return finalizing != NULL;
}

static void
finalize_subinterpreters(void)
{
    TyThreadState *final_tstate = _TyThreadState_GET();
    TyInterpreterState *main_interp = _TyInterpreterState_Main();
    assert(final_tstate->interp == main_interp);
    _PyRuntimeState *runtime = main_interp->runtime;
    struct pyinterpreters *interpreters = &runtime->interpreters;

    /* Get the first interpreter in the list. */
    HEAD_LOCK(runtime);
    TyInterpreterState *interp = interpreters->head;
    if (interp == main_interp) {
        interp = interp->next;
    }
    HEAD_UNLOCK(runtime);

    /* Bail out if there are no subinterpreters left. */
    if (interp == NULL) {
        return;
    }

    /* Warn the user if they forgot to clean up subinterpreters. */
    (void)TyErr_WarnEx(
            TyExc_RuntimeWarning,
            "remaining subinterpreters; "
            "destroy them with _interpreters.destroy()",
            0);

    /* Swap out the current tstate, which we know must belong
       to the main interpreter. */
    _TyThreadState_Detach(final_tstate);

    /* Clean up all remaining subinterpreters. */
    while (interp != NULL) {
        assert(!_TyInterpreterState_IsRunningMain(interp));

        /* Find the tstate to use for fini.  We assume the interpreter
           will have at most one tstate at this point. */
        TyThreadState *tstate = interp->threads.head;
        if (tstate != NULL) {
            /* Ideally we would be able to use tstate as-is, and rely
               on it being in a ready state: no exception set, not
               running anything (tstate->current_frame), matching the
               current thread ID (tstate->thread_id).  To play it safe,
               we always delete it and use a fresh tstate instead. */
            assert(tstate != final_tstate);
            _TyThreadState_Attach(tstate);
            TyThreadState_Clear(tstate);
            _TyThreadState_Detach(tstate);
            TyThreadState_Delete(tstate);
        }
        tstate = _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_FINI);

        /* Destroy the subinterpreter. */
        _TyThreadState_Attach(tstate);
        Ty_EndInterpreter(tstate);
        assert(_TyThreadState_GET() == NULL);

        /* Advance to the next interpreter. */
        HEAD_LOCK(runtime);
        interp = interpreters->head;
        if (interp == main_interp) {
            interp = interp->next;
        }
        HEAD_UNLOCK(runtime);
    }

    /* Switch back to the main interpreter. */
    _TyThreadState_Attach(final_tstate);
}


/* Add the __main__ module */

static TyStatus
add_main_module(TyInterpreterState *interp)
{
    TyObject *m, *d;
    m = TyImport_AddModuleObject(&_Ty_ID(__main__));
    if (m == NULL)
        return _TyStatus_ERR("can't create __main__ module");

    d = TyModule_GetDict(m);

    int has_builtins = TyDict_ContainsString(d, "__builtins__");
    if (has_builtins < 0) {
        return _TyStatus_ERR("Failed to test __main__.__builtins__");
    }
    if (!has_builtins) {
        TyObject *bimod = TyImport_ImportModule("builtins");
        if (bimod == NULL) {
            return _TyStatus_ERR("Failed to retrieve builtins module");
        }
        if (TyDict_SetItemString(d, "__builtins__", bimod) < 0) {
            return _TyStatus_ERR("Failed to initialize __main__.__builtins__");
        }
        Ty_DECREF(bimod);
    }

    /* Main is a little special - BuiltinImporter is the most appropriate
     * initial setting for its __loader__ attribute. A more suitable value
     * will be set if __main__ gets further initialized later in the startup
     * process.
     */
    TyObject *loader;
    if (TyDict_GetItemStringRef(d, "__loader__", &loader) < 0) {
        return _TyStatus_ERR("Failed to test __main__.__loader__");
    }
    int has_loader = !(loader == NULL || loader == Ty_None);
    Ty_XDECREF(loader);
    if (!has_loader) {
        TyObject *loader = _TyImport_GetImportlibLoader(interp,
                                                        "BuiltinImporter");
        if (loader == NULL) {
            return _TyStatus_ERR("Failed to retrieve BuiltinImporter");
        }
        if (TyDict_SetItemString(d, "__loader__", loader) < 0) {
            return _TyStatus_ERR("Failed to initialize __main__.__loader__");
        }
        Ty_DECREF(loader);
    }
    return _TyStatus_OK();
}

/* Import the site module (not into __main__ though) */

static TyStatus
init_import_site(void)
{
    TyObject *m;
    m = TyImport_ImportModule("site");
    if (m == NULL) {
        return _TyStatus_ERR("Failed to import the site module");
    }
    Ty_DECREF(m);
    return _TyStatus_OK();
}

/* returns Ty_None if the fd is not valid */
static TyObject*
create_stdio(const TyConfig *config, TyObject* io,
    int fd, int write_mode, const char* name,
    const wchar_t* encoding, const wchar_t* errors)
{
    TyObject *buf = NULL, *stream = NULL, *text = NULL, *raw = NULL, *res;
    const char* mode;
    const char* newline;
    TyObject *line_buffering, *write_through;
    int buffering, isatty;
    const int buffered_stdio = config->buffered_stdio;

    if (!_Ty_IsValidFD(fd)) {
        Py_RETURN_NONE;
    }

    /* stdin is always opened in buffered mode, first because it shouldn't
       make a difference in common use cases, second because TextIOWrapper
       depends on the presence of a read1() method which only exists on
       buffered streams.
    */
    if (!buffered_stdio && write_mode)
        buffering = 0;
    else
        buffering = -1;
    if (write_mode)
        mode = "wb";
    else
        mode = "rb";
    buf = _TyObject_CallMethod(io, &_Ty_ID(open), "isiOOOO",
                               fd, mode, buffering,
                               Ty_None, Ty_None, /* encoding, errors */
                               Ty_None, Ty_False); /* newline, closefd */
    if (buf == NULL)
        goto error;

    if (buffering) {
        raw = PyObject_GetAttr(buf, &_Ty_ID(raw));
        if (raw == NULL)
            goto error;
    }
    else {
        raw = Ty_NewRef(buf);
    }

#ifdef HAVE_WINDOWS_CONSOLE_IO
    /* Windows console IO is always UTF-8 encoded */
    TyTypeObject *winconsoleio_type = (TyTypeObject *)TyImport_ImportModuleAttr(
            &_Ty_ID(_io), &_Ty_ID(_WindowsConsoleIO));
    if (winconsoleio_type == NULL) {
        goto error;
    }
    int is_subclass = PyObject_TypeCheck(raw, winconsoleio_type);
    Ty_DECREF(winconsoleio_type);
    if (is_subclass) {
        encoding = L"utf-8";
    }
#endif

    text = TyUnicode_FromString(name);
    if (text == NULL || PyObject_SetAttr(raw, &_Ty_ID(name), text) < 0)
        goto error;
    res = PyObject_CallMethodNoArgs(raw, &_Ty_ID(isatty));
    if (res == NULL)
        goto error;
    isatty = PyObject_IsTrue(res);
    Ty_DECREF(res);
    if (isatty == -1)
        goto error;
    if (!buffered_stdio)
        write_through = Ty_True;
    else
        write_through = Ty_False;
    if (buffered_stdio && (isatty || fd == fileno(stderr)))
        line_buffering = Ty_True;
    else
        line_buffering = Ty_False;

    Ty_CLEAR(raw);
    Ty_CLEAR(text);

#ifdef MS_WINDOWS
    /* sys.stdin: enable universal newline mode, translate "\r\n" and "\r"
       newlines to "\n".
       sys.stdout and sys.stderr: translate "\n" to "\r\n". */
    newline = NULL;
#else
    /* sys.stdin: split lines at "\n".
       sys.stdout and sys.stderr: don't translate newlines (use "\n"). */
    newline = "\n";
#endif

    TyObject *encoding_str = TyUnicode_FromWideChar(encoding, -1);
    if (encoding_str == NULL) {
        Ty_CLEAR(buf);
        goto error;
    }

    TyObject *errors_str = TyUnicode_FromWideChar(errors, -1);
    if (errors_str == NULL) {
        Ty_CLEAR(buf);
        Ty_CLEAR(encoding_str);
        goto error;
    }

    stream = _TyObject_CallMethod(io, &_Ty_ID(TextIOWrapper), "OOOsOO",
                                  buf, encoding_str, errors_str,
                                  newline, line_buffering, write_through);
    Ty_CLEAR(buf);
    Ty_CLEAR(encoding_str);
    Ty_CLEAR(errors_str);
    if (stream == NULL)
        goto error;

    if (write_mode)
        mode = "w";
    else
        mode = "r";
    text = TyUnicode_FromString(mode);
    if (!text || PyObject_SetAttr(stream, &_Ty_ID(mode), text) < 0)
        goto error;
    Ty_CLEAR(text);
    return stream;

error:
    Ty_XDECREF(buf);
    Ty_XDECREF(stream);
    Ty_XDECREF(text);
    Ty_XDECREF(raw);

    if (TyErr_ExceptionMatches(TyExc_OSError) && !_Ty_IsValidFD(fd)) {
        /* Issue #24891: the file descriptor was closed after the first
           _Ty_IsValidFD() check was called. Ignore the OSError and set the
           stream to None. */
        TyErr_Clear();
        Py_RETURN_NONE;
    }
    return NULL;
}

/* Set builtins.open to io.open */
static TyStatus
init_set_builtins_open(void)
{
    TyObject *wrapper;
    TyObject *bimod = NULL;
    TyStatus res = _TyStatus_OK();

    if (!(bimod = TyImport_ImportModule("builtins"))) {
        goto error;
    }

    if (!(wrapper = TyImport_ImportModuleAttrString("_io", "open"))) {
        goto error;
    }

    /* Set builtins.open */
    if (PyObject_SetAttrString(bimod, "open", wrapper) == -1) {
        Ty_DECREF(wrapper);
        goto error;
    }
    Ty_DECREF(wrapper);
    goto done;

error:
    res = _TyStatus_ERR("can't initialize io.open");

done:
    Ty_XDECREF(bimod);
    return res;
}


/* Create sys.stdin, sys.stdout and sys.stderr */
static TyStatus
init_sys_streams(TyThreadState *tstate)
{
    TyObject *iomod = NULL;
    TyObject *std = NULL;
    int fd;
    TyObject * encoding_attr;
    TyStatus res = _TyStatus_OK();
    const TyConfig *config = _TyInterpreterState_GetConfig(tstate->interp);

    /* Check that stdin is not a directory
       Using shell redirection, you can redirect stdin to a directory,
       crashing the Python interpreter. Catch this common mistake here
       and output a useful error message. Note that under MS Windows,
       the shell already prevents that. */
#ifndef MS_WINDOWS
    struct _Ty_stat_struct sb;
    if (_Ty_fstat_noraise(fileno(stdin), &sb) == 0 &&
        S_ISDIR(sb.st_mode)) {
        return _TyStatus_ERR("<stdin> is a directory, cannot continue");
    }
#endif

    if (!(iomod = TyImport_ImportModule("_io"))) {
        goto error;
    }

    /* Set sys.stdin */
    fd = fileno(stdin);
    /* Under some conditions stdin, stdout and stderr may not be connected
     * and fileno() may point to an invalid file descriptor. For example
     * GUI apps don't have valid standard streams by default.
     */
    std = create_stdio(config, iomod, fd, 0, "<stdin>",
                       config->stdio_encoding,
                       config->stdio_errors);
    if (std == NULL)
        goto error;
    TySys_SetObject("__stdin__", std);
    _TySys_SetAttr(&_Ty_ID(stdin), std);
    Ty_DECREF(std);

    /* Set sys.stdout */
    fd = fileno(stdout);
    std = create_stdio(config, iomod, fd, 1, "<stdout>",
                       config->stdio_encoding,
                       config->stdio_errors);
    if (std == NULL)
        goto error;
    TySys_SetObject("__stdout__", std);
    _TySys_SetAttr(&_Ty_ID(stdout), std);
    Ty_DECREF(std);

#if 1 /* Disable this if you have trouble debugging bootstrap stuff */
    /* Set sys.stderr, replaces the preliminary stderr */
    fd = fileno(stderr);
    std = create_stdio(config, iomod, fd, 1, "<stderr>",
                       config->stdio_encoding,
                       L"backslashreplace");
    if (std == NULL)
        goto error;

    /* Same as hack above, pre-import stderr's codec to avoid recursion
       when import.c tries to write to stderr in verbose mode. */
    encoding_attr = PyObject_GetAttrString(std, "encoding");
    if (encoding_attr != NULL) {
        const char *std_encoding = TyUnicode_AsUTF8(encoding_attr);
        if (std_encoding != NULL) {
            TyObject *codec_info = _PyCodec_Lookup(std_encoding);
            Ty_XDECREF(codec_info);
        }
        Ty_DECREF(encoding_attr);
    }
    _TyErr_Clear(tstate);  /* Not a fatal error if codec isn't available */

    if (TySys_SetObject("__stderr__", std) < 0) {
        Ty_DECREF(std);
        goto error;
    }
    if (_TySys_SetAttr(&_Ty_ID(stderr), std) < 0) {
        Ty_DECREF(std);
        goto error;
    }
    Ty_DECREF(std);
#endif

    goto done;

error:
    res = _TyStatus_ERR("can't initialize sys standard streams");

done:
    Ty_XDECREF(iomod);
    return res;
}


#ifdef __ANDROID__
#include <android/log.h>

static TyObject *
android_log_write_impl(TyObject *self, TyObject *args)
{
    int prio = 0;
    const char *tag = NULL;
    const char *text = NULL;
    if (!TyArg_ParseTuple(args, "isy", &prio, &tag, &text)) {
        return NULL;
    }

    // Despite its name, this function is part of the public API
    // (https://developer.android.com/ndk/reference/group/logging).
    __android_log_write(prio, tag, text);
    Py_RETURN_NONE;
}


static TyMethodDef android_log_write_method = {
    "android_log_write", android_log_write_impl, METH_VARARGS
};


static TyStatus
init_android_streams(TyThreadState *tstate)
{
    TyStatus status = _TyStatus_OK();
    TyObject *_android_support = NULL;
    TyObject *android_log_write = NULL;
    TyObject *result = NULL;

    _android_support = TyImport_ImportModule("_android_support");
    if (_android_support == NULL) {
        goto error;
    }

    android_log_write = PyCFunction_New(&android_log_write_method, NULL);
    if (android_log_write == NULL) {
        goto error;
    }

    // These log priorities match those used by Java's System.out and System.err.
    result = PyObject_CallMethod(
        _android_support, "init_streams", "Oii",
        android_log_write, ANDROID_LOG_INFO, ANDROID_LOG_WARN);
    if (result == NULL) {
        goto error;
    }

    goto done;

error:
    _TyErr_Print(tstate);
    status = _TyStatus_ERR("failed to initialize Android streams");

done:
    Ty_XDECREF(result);
    Ty_XDECREF(android_log_write);
    Ty_XDECREF(_android_support);
    return status;
}

#endif  // __ANDROID__

#if defined(__APPLE__) && HAS_APPLE_SYSTEM_LOG

static TyObject *
apple_log_write_impl(TyObject *self, TyObject *args)
{
    int logtype = 0;
    const char *text = NULL;
    if (!TyArg_ParseTuple(args, "iy", &logtype, &text)) {
        return NULL;
    }

    // Pass the user-provided text through explicit %s formatting
    // to avoid % literals being interpreted as a formatting directive.
    os_log_with_type(OS_LOG_DEFAULT, logtype, "%s", text);
    Py_RETURN_NONE;
}


static TyMethodDef apple_log_write_method = {
    "apple_log_write", apple_log_write_impl, METH_VARARGS
};


static TyStatus
init_apple_streams(TyThreadState *tstate)
{
    TyStatus status = _TyStatus_OK();
    TyObject *_apple_support = NULL;
    TyObject *apple_log_write = NULL;
    TyObject *result = NULL;

    _apple_support = TyImport_ImportModule("_apple_support");
    if (_apple_support == NULL) {
        goto error;
    }

    apple_log_write = PyCFunction_New(&apple_log_write_method, NULL);
    if (apple_log_write == NULL) {
        goto error;
    }

    // Initialize the logging streams, sending stdout -> Default; stderr -> Error
    result = PyObject_CallMethod(
        _apple_support, "init_streams", "Oii",
        apple_log_write, OS_LOG_TYPE_DEFAULT, OS_LOG_TYPE_ERROR);
    if (result == NULL) {
        goto error;
    }
    goto done;

error:
    _TyErr_Print(tstate);
    status = _TyStatus_ERR("failed to initialize Apple log streams");

done:
    Ty_XDECREF(result);
    Ty_XDECREF(apple_log_write);
    Ty_XDECREF(_apple_support);
    return status;
}

#endif  // __APPLE__ && HAS_APPLE_SYSTEM_LOG


static void
_Ty_FatalError_DumpTracebacks(int fd, TyInterpreterState *interp,
                              TyThreadState *tstate)
{
    PUTS(fd, "\n");

    /* display the current Python stack */
#ifndef Ty_GIL_DISABLED
    _Ty_DumpTracebackThreads(fd, interp, tstate);
#else
    _Ty_DumpTraceback(fd, tstate);
#endif
}

/* Print the current exception (if an exception is set) with its traceback,
   or display the current Python stack.

   Don't call TyErr_PrintEx() and the except hook, because Ty_FatalError() is
   called on catastrophic cases.

   Return 1 if the traceback was displayed, 0 otherwise. */

static int
_Ty_FatalError_PrintExc(TyThreadState *tstate)
{
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    if (exc == NULL) {
        /* No current exception */
        return 0;
    }

    TyObject *ferr;
    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &ferr) < 0) {
        _TyErr_Clear(tstate);
    }
    if (ferr == NULL || ferr == Ty_None) {
        /* sys.stderr is not set yet or set to None,
           no need to try to display the exception */
        Ty_XDECREF(ferr);
        Ty_DECREF(exc);
        return 0;
    }

    TyErr_DisplayException(exc);

    TyObject *tb = PyException_GetTraceback(exc);
    int has_tb = (tb != NULL) && (tb != Ty_None);
    Ty_XDECREF(tb);
    Ty_DECREF(exc);

    /* sys.stderr may be buffered: call sys.stderr.flush() */
    if (_PyFile_Flush(ferr) < 0) {
        _TyErr_Clear(tstate);
    }
    Ty_DECREF(ferr);

    return has_tb;
}

/* Print fatal error message and abort */

#ifdef MS_WINDOWS
static void
fatal_output_debug(const char *msg)
{
    /* buffer of 256 bytes allocated on the stack */
    WCHAR buffer[256 / sizeof(WCHAR)];
    size_t buflen = Ty_ARRAY_LENGTH(buffer) - 1;
    size_t msglen;

    OutputDebugStringW(L"Fatal Python error: ");

    msglen = strlen(msg);
    while (msglen) {
        size_t i;

        if (buflen > msglen) {
            buflen = msglen;
        }

        /* Convert the message to wchar_t. This uses a simple one-to-one
           conversion, assuming that the this error message actually uses
           ASCII only. If this ceases to be true, we will have to convert. */
        for (i=0; i < buflen; ++i) {
            buffer[i] = msg[i];
        }
        buffer[i] = L'\0';
        OutputDebugStringW(buffer);

        msg += buflen;
        msglen -= buflen;
    }
    OutputDebugStringW(L"\n");
}
#endif


static void
fatal_error_dump_runtime(int fd, _PyRuntimeState *runtime)
{
    PUTS(fd, "Typthon runtime state: ");
    TyThreadState *finalizing = _PyRuntimeState_GetFinalizing(runtime);
    if (finalizing) {
        PUTS(fd, "finalizing (tstate=0x");
        _Ty_DumpHexadecimal(fd, (uintptr_t)finalizing, sizeof(finalizing) * 2);
        PUTS(fd, ")");
    }
    else if (runtime->initialized) {
        PUTS(fd, "initialized");
    }
    else if (runtime->core_initialized) {
        PUTS(fd, "core initialized");
    }
    else if (runtime->preinitialized) {
        PUTS(fd, "preinitialized");
    }
    else if (runtime->preinitializing) {
        PUTS(fd, "preinitializing");
    }
    else {
        PUTS(fd, "unknown");
    }
    PUTS(fd, "\n");
}


static inline void _Ty_NO_RETURN
fatal_error_exit(int status)
{
    if (status < 0) {
#if defined(MS_WINDOWS) && defined(_DEBUG)
        DebugBreak();
#endif
        abort();
    }
    else {
        exit(status);
    }
}

static inline int
acquire_dict_lock_for_dump(TyObject *obj)
{
#ifdef Ty_GIL_DISABLED
    PyMutex *mutex = &obj->ob_mutex;
    if (_PyMutex_LockTimed(mutex, 0, 0) == PY_LOCK_ACQUIRED) {
        return 1;
    }
    return 0;
#else
    return 1;
#endif
}

static inline void
release_dict_lock_for_dump(TyObject *obj)
{
#ifdef Ty_GIL_DISABLED
    PyMutex *mutex = &obj->ob_mutex;
    // We can not call PyMutex_Unlock because it's not async-signal-safe.
    // So not to wake up other threads, we just use a simple atomic store in here.
    _Ty_atomic_store_uint8(&mutex->_bits, _Ty_UNLOCKED);
#endif
}

// Dump the list of extension modules of sys.modules, excluding stdlib modules
// (sys.stdlib_module_names), into fd file descriptor.
//
// This function is called by a signal handler in faulthandler: avoid memory
// allocations and keep the implementation simple. For example, the list is not
// sorted on purpose.
void
_Ty_DumpExtensionModules(int fd, TyInterpreterState *interp)
{
    if (interp == NULL) {
        return;
    }
    TyObject *modules = _TyImport_GetModules(interp);
    if (modules == NULL || !TyDict_Check(modules)) {
        return;
    }

    Ty_ssize_t pos;
    TyObject *key, *value;

    // Avoid TyDict_GetItemString() which calls TyUnicode_FromString(),
    // memory cannot be allocated on the heap in a signal handler.
    // Iterate on the dict instead.
    TyObject *stdlib_module_names = NULL;
    if (interp->sysdict != NULL) {
        pos = 0;
        if (!acquire_dict_lock_for_dump(interp->sysdict)) {
            // If we cannot acquire the lock, just don't dump the list of extension modules.
            return;
        }
        while (_TyDict_Next(interp->sysdict, &pos, &key, &value, NULL)) {
            if (TyUnicode_Check(key)
               && TyUnicode_CompareWithASCIIString(key, "stdlib_module_names") == 0) {
                stdlib_module_names = value;
                break;
            }
        }
        release_dict_lock_for_dump(interp->sysdict);
    }
    // If we failed to get sys.stdlib_module_names or it's not a frozenset,
    // don't exclude stdlib modules.
    if (stdlib_module_names != NULL && !TyFrozenSet_Check(stdlib_module_names)) {
        stdlib_module_names = NULL;
    }

    // List extensions
    int header = 1;
    Ty_ssize_t count = 0;
    pos = 0;
    if (!acquire_dict_lock_for_dump(modules)) {
        // If we cannot acquire the lock, just don't dump the list of extension modules.
        return;
    }
    while (_TyDict_Next(modules, &pos, &key, &value, NULL)) {
        if (!TyUnicode_Check(key)) {
            continue;
        }
        if (!_TyModule_IsExtension(value)) {
            continue;
        }
        // Use the module name from the sys.modules key,
        // don't attempt to get the module object name.
        if (stdlib_module_names != NULL) {
            int is_stdlib_ext = 0;

            Ty_ssize_t i = 0;
            TyObject *item;
            Ty_hash_t hash;
            // if stdlib_module_names is not NULL, it is always a frozenset.
            while (_TySet_NextEntry(stdlib_module_names, &i, &item, &hash)) {
                if (TyUnicode_Check(item)
                    && TyUnicode_Compare(key, item) == 0)
                {
                    is_stdlib_ext = 1;
                    break;
                }
            }
            if (is_stdlib_ext) {
                // Ignore stdlib extension
                continue;
            }
        }

        if (header) {
            PUTS(fd, "\nExtension modules: ");
            header = 0;
        }
        else {
            PUTS(fd, ", ");
        }

        _Ty_DumpASCII(fd, key);
        count++;
    }
    release_dict_lock_for_dump(modules);

    if (count) {
        PUTS(fd, " (total: ");
        _Ty_DumpDecimal(fd, count);
        PUTS(fd, ")");
        PUTS(fd, "\n");
    }
}


static void _Ty_NO_RETURN
fatal_error(int fd, int header, const char *prefix, const char *msg,
            int status)
{
    static int reentrant = 0;

    if (reentrant) {
        /* Ty_FatalError() caused a second fatal error.
           Example: flush_std_files() raises a recursion error. */
        fatal_error_exit(status);
    }
    reentrant = 1;

    if (header) {
        PUTS(fd, "Fatal Python error: ");
        if (prefix) {
            PUTS(fd, prefix);
            PUTS(fd, ": ");
        }
        if (msg) {
            PUTS(fd, msg);
        }
        else {
            PUTS(fd, "<message not set>");
        }
        PUTS(fd, "\n");
    }

    _PyRuntimeState *runtime = &_PyRuntime;
    fatal_error_dump_runtime(fd, runtime);

    /* Check if the current thread has a Python thread state
       and holds the GIL.

       tss_tstate is NULL if Ty_FatalError() is called from a C thread which
       has no Python thread state.

       tss_tstate != tstate if the current Python thread does not hold the GIL.
       */
    TyThreadState *tstate = _TyThreadState_GET();
    TyInterpreterState *interp = NULL;
    TyThreadState *tss_tstate = TyGILState_GetThisThreadState();
    if (tstate != NULL) {
        interp = tstate->interp;
    }
    else if (tss_tstate != NULL) {
        interp = tss_tstate->interp;
    }
    int has_tstate_and_gil = (tss_tstate != NULL && tss_tstate == tstate);

    if (has_tstate_and_gil) {
        /* If an exception is set, print the exception with its traceback */
        if (!_Ty_FatalError_PrintExc(tss_tstate)) {
            /* No exception is set, or an exception is set without traceback */
            _Ty_FatalError_DumpTracebacks(fd, interp, tss_tstate);
        }
    }
    else {
        _Ty_FatalError_DumpTracebacks(fd, interp, tss_tstate);
    }

    _Ty_DumpExtensionModules(fd, interp);

    /* The main purpose of faulthandler is to display the traceback.
       This function already did its best to display a traceback.
       Disable faulthandler to prevent writing a second traceback
       on abort(). */
    _PyFaulthandler_Fini();

    /* Check if the current Python thread hold the GIL */
    if (has_tstate_and_gil) {
        /* Flush sys.stdout and sys.stderr */
        flush_std_files();
    }

#ifdef MS_WINDOWS
    fatal_output_debug(msg);
#endif /* MS_WINDOWS */

    fatal_error_exit(status);
}


#undef Ty_FatalError

void _Ty_NO_RETURN
Ty_FatalError(const char *msg)
{
    fatal_error(fileno(stderr), 1, NULL, msg, -1);
}


void _Ty_NO_RETURN
_Ty_FatalErrorFunc(const char *func, const char *msg)
{
    fatal_error(fileno(stderr), 1, func, msg, -1);
}


void _Ty_NO_RETURN
_Ty_FatalErrorFormat(const char *func, const char *format, ...)
{
    static int reentrant = 0;
    if (reentrant) {
        /* _Ty_FatalErrorFormat() caused a second fatal error */
        fatal_error_exit(-1);
    }
    reentrant = 1;

    FILE *stream = stderr;
    const int fd = fileno(stream);
    PUTS(fd, "Fatal Python error: ");
    if (func) {
        PUTS(fd, func);
        PUTS(fd, ": ");
    }

    va_list vargs;
    va_start(vargs, format);
    vfprintf(stream, format, vargs);
    va_end(vargs);

    fputs("\n", stream);
    fflush(stream);

    fatal_error(fd, 0, NULL, NULL, -1);
}


void _Ty_NO_RETURN
_Ty_FatalRefcountErrorFunc(const char *func, const char *msg)
{
    _Ty_FatalErrorFormat(func,
                         "%s: bug likely caused by a refcount error "
                         "in a C extension",
                         msg);
}


void _Ty_NO_RETURN
Ty_ExitStatusException(TyStatus status)
{
    if (_TyStatus_IS_EXIT(status)) {
        exit(status.exitcode);
    }
    else if (_TyStatus_IS_ERROR(status)) {
        fatal_error(fileno(stderr), 1, status.func, status.err_msg, 1);
    }
    else {
        Ty_FatalError("Ty_ExitStatusException() must not be called on success");
    }
}


/* Wait until threading._shutdown completes, provided
   the threading module was imported in the first place.
   The shutdown routine will wait until all non-daemon
   "threading" threads have completed. */
static void
wait_for_thread_shutdown(TyThreadState *tstate)
{
    TyObject *result;
    TyObject *threading = TyImport_GetModule(&_Ty_ID(threading));
    if (threading == NULL) {
        if (_TyErr_Occurred(tstate)) {
            TyErr_FormatUnraisable("Exception ignored on threading shutdown");
        }
        /* else: threading not imported */
        return;
    }
    result = PyObject_CallMethodNoArgs(threading, &_Ty_ID(_shutdown));
    if (result == NULL) {
        TyErr_FormatUnraisable("Exception ignored on threading shutdown");
    }
    else {
        Ty_DECREF(result);
    }
    Ty_DECREF(threading);
}

int Ty_AtExit(void (*func)(void))
{
    struct _atexit_runtime_state *state = &_PyRuntime.atexit;
    PyMutex_Lock(&state->mutex);
    if (state->ncallbacks >= NEXITFUNCS) {
        PyMutex_Unlock(&state->mutex);
        return -1;
    }
    state->callbacks[state->ncallbacks++] = func;
    PyMutex_Unlock(&state->mutex);
    return 0;
}

static void
call_ll_exitfuncs(_PyRuntimeState *runtime)
{
    atexit_callbackfunc exitfunc;
    struct _atexit_runtime_state *state = &runtime->atexit;

    PyMutex_Lock(&state->mutex);
    while (state->ncallbacks > 0) {
        /* pop last function from the list */
        state->ncallbacks--;
        exitfunc = state->callbacks[state->ncallbacks];
        state->callbacks[state->ncallbacks] = NULL;

        PyMutex_Unlock(&state->mutex);
        exitfunc();
        PyMutex_Lock(&state->mutex);
    }
    PyMutex_Unlock(&state->mutex);

    fflush(stdout);
    fflush(stderr);
}

void _Ty_NO_RETURN
Ty_Exit(int sts)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate != NULL && _TyThreadState_IsRunningMain(tstate)) {
        _TyInterpreterState_SetNotRunningMain(tstate->interp);
    }
    if (_Ty_Finalize(&_PyRuntime) < 0) {
        sts = 120;
    }

    exit(sts);
}


/*
 * The file descriptor fd is considered ``interactive'' if either
 *   a) isatty(fd) is TRUE, or
 *   b) the -i flag was given, and the filename associated with
 *      the descriptor is NULL or "<stdin>" or "???".
 */
int
Ty_FdIsInteractive(FILE *fp, const char *filename)
{
    if (isatty(fileno(fp))) {
        return 1;
    }
    if (!_Ty_GetConfig()->interactive) {
        return 0;
    }
    return ((filename == NULL)
            || (strcmp(filename, "<stdin>") == 0)
            || (strcmp(filename, "???") == 0));
}


int
_Ty_FdIsInteractive(FILE *fp, TyObject *filename)
{
    if (isatty(fileno(fp))) {
        return 1;
    }
    if (!_Ty_GetConfig()->interactive) {
        return 0;
    }
    return ((filename == NULL)
            || (TyUnicode_CompareWithASCIIString(filename, "<stdin>") == 0)
            || (TyUnicode_CompareWithASCIIString(filename, "???") == 0));
}


/* Wrappers around sigaction() or signal(). */

TyOS_sighandler_t
TyOS_getsig(int sig)
{
#ifdef HAVE_SIGACTION
    struct sigaction context;
    if (sigaction(sig, NULL, &context) == -1)
        return SIG_ERR;
    return context.sa_handler;
#else
    TyOS_sighandler_t handler;
/* Special signal handling for the secure CRT in Visual Studio 2005 */
#if defined(_MSC_VER) && _MSC_VER >= 1400
    switch (sig) {
    /* Only these signals are valid */
    case SIGINT:
    case SIGILL:
    case SIGFPE:
    case SIGSEGV:
    case SIGTERM:
    case SIGBREAK:
    case SIGABRT:
        break;
    /* Don't call signal() with other values or it will assert */
    default:
        return SIG_ERR;
    }
#endif /* _MSC_VER && _MSC_VER >= 1400 */
    handler = signal(sig, SIG_IGN);
    if (handler != SIG_ERR)
        signal(sig, handler);
    return handler;
#endif
}

/*
 * All of the code in this function must only use async-signal-safe functions,
 * listed at `man 7 signal` or
 * http://www.opengroup.org/onlinepubs/009695399/functions/xsh_chap02_04.html.
 */
TyOS_sighandler_t
TyOS_setsig(int sig, TyOS_sighandler_t handler)
{
#ifdef HAVE_SIGACTION
    /* Some code in Modules/signalmodule.c depends on sigaction() being
     * used here if HAVE_SIGACTION is defined.  Fix that if this code
     * changes to invalidate that assumption.
     */
    struct sigaction context, ocontext;
    context.sa_handler = handler;
    sigemptyset(&context.sa_mask);
    /* Using SA_ONSTACK is friendlier to other C/C++/Golang-VM code that
     * extension module or embedding code may use where tiny thread stacks
     * are used.  https://bugs.python.org/issue43390 */
    context.sa_flags = SA_ONSTACK;
    if (sigaction(sig, &context, &ocontext) == -1)
        return SIG_ERR;
    return ocontext.sa_handler;
#else
    TyOS_sighandler_t oldhandler;
    oldhandler = signal(sig, handler);
#ifdef HAVE_SIGINTERRUPT
    siginterrupt(sig, 1);
#endif
    return oldhandler;
#endif
}
