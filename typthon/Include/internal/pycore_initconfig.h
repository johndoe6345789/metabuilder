#ifndef Ty_INTERNAL_CORECONFIG_H
#define Ty_INTERNAL_CORECONFIG_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_typedefs.h"      // _PyRuntimeState

/* --- TyStatus ----------------------------------------------- */

/* Almost all errors causing Python initialization to fail */
#ifdef _MSC_VER
   /* Visual Studio 2015 doesn't implement C99 __func__ in C */
#  define _TyStatus_GET_FUNC() __FUNCTION__
#else
#  define _TyStatus_GET_FUNC() __func__
#endif

#define _TyStatus_OK() \
    (TyStatus){._type = _TyStatus_TYPE_OK}
    /* other fields are set to 0 */
#define _TyStatus_ERR(ERR_MSG) \
    (TyStatus){ \
        ._type = _TyStatus_TYPE_ERROR, \
        .func = _TyStatus_GET_FUNC(), \
        .err_msg = (ERR_MSG)}
        /* other fields are set to 0 */
#define _TyStatus_NO_MEMORY_ERRMSG "memory allocation failed"
#define _TyStatus_NO_MEMORY() _TyStatus_ERR(_TyStatus_NO_MEMORY_ERRMSG)
#define _TyStatus_EXIT(EXITCODE) \
    (TyStatus){ \
        ._type = _TyStatus_TYPE_EXIT, \
        .exitcode = (EXITCODE)}
#define _TyStatus_IS_ERROR(err) \
    ((err)._type == _TyStatus_TYPE_ERROR)
#define _TyStatus_IS_EXIT(err) \
    ((err)._type == _TyStatus_TYPE_EXIT)
#define _TyStatus_EXCEPTION(err) \
    ((err)._type != _TyStatus_TYPE_OK)
#define _TyStatus_UPDATE_FUNC(err) \
    do { (err).func = _TyStatus_GET_FUNC(); } while (0)

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(void) _TyErr_SetFromPyStatus(TyStatus status);


/* --- TyWideStringList ------------------------------------------------ */

#define _TyWideStringList_INIT (TyWideStringList){.length = 0, .items = NULL}

#ifndef NDEBUG
extern int _TyWideStringList_CheckConsistency(const TyWideStringList *list);
#endif
extern void _TyWideStringList_Clear(TyWideStringList *list);
extern int _TyWideStringList_Copy(TyWideStringList *list,
    const TyWideStringList *list2);
extern TyStatus _TyWideStringList_Extend(TyWideStringList *list,
    const TyWideStringList *list2);
extern TyObject* _TyWideStringList_AsList(const TyWideStringList *list);


/* --- _PyArgv ---------------------------------------------------- */

typedef struct _PyArgv {
    Ty_ssize_t argc;
    int use_bytes_argv;
    char * const *bytes_argv;
    wchar_t * const *wchar_argv;
} _PyArgv;

extern TyStatus _PyArgv_AsWstrList(const _PyArgv *args,
    TyWideStringList *list);


/* --- Helper functions ------------------------------------------- */

extern int _Ty_str_to_int(
    const char *str,
    int *result);
extern const wchar_t* _Ty_get_xoption(
    const TyWideStringList *xoptions,
    const wchar_t *name);
extern const char* _Ty_GetEnv(
    int use_environment,
    const char *name);
extern void _Ty_get_env_flag(
    int use_environment,
    int *flag,
    const char *name);

/* Ty_GetArgcArgv() helper */
extern void _Ty_ClearArgcArgv(void);


/* --- _PyPreCmdline ------------------------------------------------- */

typedef struct {
    TyWideStringList argv;
    TyWideStringList xoptions;     /* "-X value" option */
    int isolated;             /* -I option */
    int use_environment;      /* -E option */
    int dev_mode;             /* -X dev and PYTHONDEVMODE */
    int warn_default_encoding;     /* -X warn_default_encoding and PYTHONWARNDEFAULTENCODING */
} _PyPreCmdline;

#define _PyPreCmdline_INIT \
    (_PyPreCmdline){ \
        .use_environment = -1, \
        .isolated = -1, \
        .dev_mode = -1}
/* Note: _PyPreCmdline_INIT sets other fields to 0/NULL */

extern void _PyPreCmdline_Clear(_PyPreCmdline *cmdline);
extern TyStatus _PyPreCmdline_SetArgv(_PyPreCmdline *cmdline,
    const _PyArgv *args);
extern TyStatus _PyPreCmdline_SetConfig(
    const _PyPreCmdline *cmdline,
    TyConfig *config);
extern TyStatus _PyPreCmdline_Read(_PyPreCmdline *cmdline,
    const TyPreConfig *preconfig);


/* --- TyPreConfig ----------------------------------------------- */

// Export for '_testembed' program
PyAPI_FUNC(void) _TyPreConfig_InitCompatConfig(TyPreConfig *preconfig);

extern void _TyPreConfig_InitFromConfig(
    TyPreConfig *preconfig,
    const TyConfig *config);
extern TyStatus _TyPreConfig_InitFromPreConfig(
    TyPreConfig *preconfig,
    const TyPreConfig *config2);
extern TyObject* _TyPreConfig_AsDict(const TyPreConfig *preconfig);
extern void _TyPreConfig_GetConfig(TyPreConfig *preconfig,
    const TyConfig *config);
extern TyStatus _TyPreConfig_Read(TyPreConfig *preconfig,
    const _PyArgv *args);
extern TyStatus _TyPreConfig_Write(const TyPreConfig *preconfig);


/* --- TyConfig ---------------------------------------------- */

typedef enum {
    /* Ty_Initialize() API: backward compatibility with Python 3.6 and 3.7 */
    _TyConfig_INIT_COMPAT = 1,
    _TyConfig_INIT_PYTHON = 2,
    _TyConfig_INIT_ISOLATED = 3
} _PyConfigInitEnum;

typedef enum {
    /* For now, this means the GIL is enabled.

       gh-116329: This will eventually change to "the GIL is disabled but can
       be re-enabled by loading an incompatible extension module." */
    _TyConfig_GIL_DEFAULT = -1,

    /* The GIL has been forced off or on, and will not be affected by module loading. */
    _TyConfig_GIL_DISABLE = 0,
    _TyConfig_GIL_ENABLE = 1,
} _PyConfigGILEnum;

// Export for '_testembed' program
PyAPI_FUNC(void) _TyConfig_InitCompatConfig(TyConfig *config);

extern TyStatus _TyConfig_Copy(
    TyConfig *config,
    const TyConfig *config2);
extern TyStatus _TyConfig_InitPathConfig(
    TyConfig *config,
    int compute_path_config);
extern TyStatus _TyConfig_InitImportConfig(TyConfig *config);
extern TyStatus _TyConfig_Read(TyConfig *config, int compute_path_config);
extern TyStatus _TyConfig_Write(const TyConfig *config,
    _PyRuntimeState *runtime);
extern TyStatus _TyConfig_SetPyArgv(
    TyConfig *config,
    const _PyArgv *args);
extern TyObject* _TyConfig_CreateXOptionsDict(const TyConfig *config);

extern void _Ty_DumpPathConfig(TyThreadState *tstate);


/* --- Function used for testing ---------------------------------- */

// Export these functions for '_testinternalcapi' shared extension
PyAPI_FUNC(TyObject*) _TyConfig_AsDict(const TyConfig *config);
PyAPI_FUNC(int) _TyConfig_FromDict(TyConfig *config, TyObject *dict);
PyAPI_FUNC(TyObject*) _Ty_Get_Getpath_CodeObject(void);
PyAPI_FUNC(TyObject*) _Ty_GetConfigsAsDict(void);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_CORECONFIG_H */
