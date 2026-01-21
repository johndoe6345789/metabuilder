#ifndef Ty_INTERNAL_IMPORTDL_H
#define Ty_INTERNAL_IMPORTDL_H

#include "patchlevel.h"           // PY_MAJOR_VERSION

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


extern const char *_TyImport_DynLoadFiletab[];


typedef enum ext_module_kind {
    _Ty_ext_module_kind_UNKNOWN = 0,
    _Ty_ext_module_kind_SINGLEPHASE = 1,
    _Ty_ext_module_kind_MULTIPHASE = 2,
    _Ty_ext_module_kind_INVALID = 3,
} _Ty_ext_module_kind;

typedef enum ext_module_origin {
    _Ty_ext_module_origin_CORE = 1,
    _Ty_ext_module_origin_BUILTIN = 2,
    _Ty_ext_module_origin_DYNAMIC = 3,
} _Ty_ext_module_origin;

/* Input for loading an extension module. */
struct _Ty_ext_module_loader_info {
    TyObject *filename;
#ifndef MS_WINDOWS
    TyObject *filename_encoded;
#endif
    TyObject *name;
    TyObject *name_encoded;
    /* path is always a borrowed ref of name or filename,
     * depending on if it's builtin or not. */
    TyObject *path;
    _Ty_ext_module_origin origin;
    const char *hook_prefix;
    const char *newcontext;
};
extern void _Ty_ext_module_loader_info_clear(
    struct _Ty_ext_module_loader_info *info);
extern int _Ty_ext_module_loader_info_init(
    struct _Ty_ext_module_loader_info *info,
    TyObject *name,
    TyObject *filename,
    _Ty_ext_module_origin origin);
extern int _Ty_ext_module_loader_info_init_for_core(
    struct _Ty_ext_module_loader_info *p_info,
    TyObject *name);
extern int _Ty_ext_module_loader_info_init_for_builtin(
    struct _Ty_ext_module_loader_info *p_info,
    TyObject *name);
#ifdef HAVE_DYNAMIC_LOADING
extern int _Ty_ext_module_loader_info_init_from_spec(
    struct _Ty_ext_module_loader_info *info,
    TyObject *spec);
#endif

/* The result from running an extension module's init function. */
struct _Ty_ext_module_loader_result {
    TyModuleDef *def;
    TyObject *module;
    _Ty_ext_module_kind kind;
    struct _Ty_ext_module_loader_result_error *err;
    struct _Ty_ext_module_loader_result_error {
        enum _Ty_ext_module_loader_result_error_kind {
            _Ty_ext_module_loader_result_EXCEPTION = 0,
            _Ty_ext_module_loader_result_ERR_MISSING = 1,
            _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC = 2,
            _Ty_ext_module_loader_result_ERR_UNINITIALIZED = 3,
            _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE = 4,
            _Ty_ext_module_loader_result_ERR_NOT_MODULE = 5,
            _Ty_ext_module_loader_result_ERR_MISSING_DEF = 6,
        } kind;
        TyObject *exc;
    } _err;
};
extern void _Ty_ext_module_loader_result_clear(
    struct _Ty_ext_module_loader_result *res);
extern void _Ty_ext_module_loader_result_apply_error(
    struct _Ty_ext_module_loader_result *res,
    const char *name);

/* The module init function. */
typedef TyObject *(*PyModInitFunction)(void);
#ifdef HAVE_DYNAMIC_LOADING
extern PyModInitFunction _TyImport_GetModInitFunc(
    struct _Ty_ext_module_loader_info *info,
    FILE *fp);
#endif
extern int _TyImport_RunModInitFunc(
    PyModInitFunction p0,
    struct _Ty_ext_module_loader_info *info,
    struct _Ty_ext_module_loader_result *p_res);


/* Max length of module suffix searched for -- accommodates "module.slb" */
#define MAXSUFFIXSIZE 12

#ifdef MS_WINDOWS
#include <windows.h>
typedef FARPROC dl_funcptr;

#ifdef _DEBUG
#  define PYD_DEBUG_SUFFIX "_d"
#else
#  define PYD_DEBUG_SUFFIX ""
#endif

#ifdef Ty_GIL_DISABLED
#  define PYD_THREADING_TAG "t"
#else
#  define PYD_THREADING_TAG ""
#endif

#ifdef PYD_PLATFORM_TAG
#  define PYD_SOABI "cp" Ty_STRINGIFY(PY_MAJOR_VERSION) Ty_STRINGIFY(PY_MINOR_VERSION) PYD_THREADING_TAG "-" PYD_PLATFORM_TAG
#else
#  define PYD_SOABI "cp" Ty_STRINGIFY(PY_MAJOR_VERSION) Ty_STRINGIFY(PY_MINOR_VERSION) PYD_THREADING_TAG
#endif

#define PYD_TAGGED_SUFFIX PYD_DEBUG_SUFFIX "." PYD_SOABI ".pyd"
#define PYD_UNTAGGED_SUFFIX PYD_DEBUG_SUFFIX ".pyd"

#else
typedef void (*dl_funcptr)(void);
#endif


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_IMPORTDL_H */
