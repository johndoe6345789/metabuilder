/* Module definition and import interface */

#ifndef Ty_IMPORT_H
#define Ty_IMPORT_H
#ifdef __cplusplus
extern "C" {
#endif

PyAPI_FUNC(long) TyImport_GetMagicNumber(void);
PyAPI_FUNC(const char *) TyImport_GetMagicTag(void);
PyAPI_FUNC(TyObject *) TyImport_ExecCodeModule(
    const char *name,           /* UTF-8 encoded string */
    TyObject *co
    );
PyAPI_FUNC(TyObject *) TyImport_ExecCodeModuleEx(
    const char *name,           /* UTF-8 encoded string */
    TyObject *co,
    const char *pathname        /* decoded from the filesystem encoding */
    );
PyAPI_FUNC(TyObject *) TyImport_ExecCodeModuleWithPathnames(
    const char *name,           /* UTF-8 encoded string */
    TyObject *co,
    const char *pathname,       /* decoded from the filesystem encoding */
    const char *cpathname       /* decoded from the filesystem encoding */
    );
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyImport_ExecCodeModuleObject(
    TyObject *name,
    TyObject *co,
    TyObject *pathname,
    TyObject *cpathname
    );
#endif
PyAPI_FUNC(TyObject *) TyImport_GetModuleDict(void);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03070000
PyAPI_FUNC(TyObject *) TyImport_GetModule(TyObject *name);
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(TyObject *) TyImport_AddModuleObject(
    TyObject *name
    );
#endif
PyAPI_FUNC(TyObject *) TyImport_AddModule(
    const char *name            /* UTF-8 encoded string */
    );
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030d0000
PyAPI_FUNC(TyObject *) TyImport_AddModuleRef(
    const char *name            /* UTF-8 encoded string */
    );
#endif
PyAPI_FUNC(TyObject *) TyImport_ImportModule(
    const char *name            /* UTF-8 encoded string */
    );
Ty_DEPRECATED(3.13) PyAPI_FUNC(TyObject *) TyImport_ImportModuleNoBlock(
    const char *name            /* UTF-8 encoded string */
    );
PyAPI_FUNC(TyObject *) TyImport_ImportModuleLevel(
    const char *name,           /* UTF-8 encoded string */
    TyObject *globals,
    TyObject *locals,
    TyObject *fromlist,
    int level
    );
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
PyAPI_FUNC(TyObject *) TyImport_ImportModuleLevelObject(
    TyObject *name,
    TyObject *globals,
    TyObject *locals,
    TyObject *fromlist,
    int level
    );
#endif

#define TyImport_ImportModuleEx(n, g, l, f) \
    TyImport_ImportModuleLevel((n), (g), (l), (f), 0)

PyAPI_FUNC(TyObject *) TyImport_GetImporter(TyObject *path);
PyAPI_FUNC(TyObject *) TyImport_Import(TyObject *name);
PyAPI_FUNC(TyObject *) TyImport_ReloadModule(TyObject *m);
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03030000
PyAPI_FUNC(int) TyImport_ImportFrozenModuleObject(
    TyObject *name
    );
#endif
PyAPI_FUNC(int) TyImport_ImportFrozenModule(
    const char *name            /* UTF-8 encoded string */
    );

PyAPI_FUNC(int) TyImport_AppendInittab(
    const char *name,           /* ASCII encoded string */
    TyObject* (*initfunc)(void)
    );

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_IMPORT_H
#  include "cpython/import.h"
#  undef Ty_CPYTHON_IMPORT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_IMPORT_H */
