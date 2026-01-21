#ifndef Ty_LIMITED_API
#ifndef Ty_INTERNAL_IMPORT_H
#define Ty_INTERNAL_IMPORT_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_hashtable.h"     // _Ty_hashtable_t
#include "pycore_interp_structs.h" // _import_state

extern int _TyImport_IsInitialized(TyInterpreterState *);

// Export for 'pyexpat' shared extension
PyAPI_FUNC(int) _TyImport_SetModule(TyObject *name, TyObject *module);

extern int _TyImport_SetModuleString(const char *name, TyObject* module);

extern void _TyImport_AcquireLock(TyInterpreterState *interp);
extern void _TyImport_ReleaseLock(TyInterpreterState *interp);
extern void _TyImport_ReInitLock(TyInterpreterState *interp);

// This is used exclusively for the sys and builtins modules:
extern int _TyImport_FixupBuiltin(
    TyThreadState *tstate,
    TyObject *mod,
    const char *name,            /* UTF-8 encoded string */
    TyObject *modules
    );

#ifdef HAVE_DLOPEN
#  include <dlfcn.h>              // RTLD_NOW, RTLD_LAZY
#  if HAVE_DECL_RTLD_NOW
#    define _Ty_DLOPEN_FLAGS RTLD_NOW
#  else
#    define _Ty_DLOPEN_FLAGS RTLD_LAZY
#  endif
#  define DLOPENFLAGS_INIT .dlopenflags = _Ty_DLOPEN_FLAGS,
#else
#  define _Ty_DLOPEN_FLAGS 0
#  define DLOPENFLAGS_INIT
#endif

#define IMPORTS_INIT \
    { \
        DLOPENFLAGS_INIT \
        .find_and_load = { \
            .header = 1, \
        }, \
    }

extern void _TyImport_ClearCore(TyInterpreterState *interp);

extern Ty_ssize_t _TyImport_GetNextModuleIndex(void);
extern const char * _TyImport_ResolveNameWithPackageContext(const char *name);
extern const char * _TyImport_SwapPackageContext(const char *newcontext);

extern int _TyImport_GetDLOpenFlags(TyInterpreterState *interp);
extern void _TyImport_SetDLOpenFlags(TyInterpreterState *interp, int new_val);

extern TyObject * _TyImport_InitModules(TyInterpreterState *interp);
extern TyObject * _TyImport_GetModules(TyInterpreterState *interp);
extern TyObject * _TyImport_GetModulesRef(TyInterpreterState *interp);
extern void _TyImport_ClearModules(TyInterpreterState *interp);

extern void _TyImport_ClearModulesByIndex(TyInterpreterState *interp);

extern int _TyImport_InitDefaultImportFunc(TyInterpreterState *interp);
extern int _TyImport_IsDefaultImportFunc(
        TyInterpreterState *interp,
        TyObject *func);

extern TyObject * _TyImport_GetImportlibLoader(
        TyInterpreterState *interp,
        const char *loader_name);
extern TyObject * _TyImport_GetImportlibExternalLoader(
        TyInterpreterState *interp,
        const char *loader_name);
extern TyObject * _TyImport_BlessMyLoader(
        TyInterpreterState *interp,
        TyObject *module_globals);
extern TyObject * _TyImport_ImportlibModuleRepr(
        TyInterpreterState *interp,
        TyObject *module);


extern TyStatus _TyImport_Init(void);
extern void _TyImport_Fini(void);
extern void _TyImport_Fini2(void);

extern TyStatus _TyImport_InitCore(
        TyThreadState *tstate,
        TyObject *sysmod,
        int importlib);
extern TyStatus _TyImport_InitExternal(TyThreadState *tstate);
extern void _TyImport_FiniCore(TyInterpreterState *interp);
extern void _TyImport_FiniExternal(TyInterpreterState *interp);


extern TyObject* _TyImport_GetBuiltinModuleNames(void);

struct _module_alias {
    const char *name;                 /* ASCII encoded string */
    const char *orig;                 /* ASCII encoded string */
};

// Export these 3 symbols for test_ctypes
PyAPI_DATA(const struct _frozen*) _TyImport_FrozenBootstrap;
PyAPI_DATA(const struct _frozen*) _TyImport_FrozenStdlib;
PyAPI_DATA(const struct _frozen*) _TyImport_FrozenTest;

extern const struct _module_alias * _TyImport_FrozenAliases;

extern int _TyImport_CheckSubinterpIncompatibleExtensionAllowed(
    const char *name);


// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(int) _TyImport_ClearExtension(TyObject *name, TyObject *filename);

#ifdef Ty_GIL_DISABLED
// Assuming that the GIL is enabled from a call to
// _TyEval_EnableGILTransient(), resolve the transient request depending on the
// state of the module argument:
// - If module is NULL or a PyModuleObject with md_gil == Ty_MOD_GIL_NOT_USED,
//   call _TyEval_DisableGIL().
// - Otherwise, call _TyEval_EnableGILPermanent(). If the GIL was not already
//   enabled permanently, issue a warning referencing the module's name.
//
// This function may raise an exception.
extern int _TyImport_CheckGILForModule(TyObject *module, TyObject *module_name);
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_IMPORT_H */
#endif /* !Ty_LIMITED_API */
