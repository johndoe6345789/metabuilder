
/* Support for dynamic loading of extension modules */

#include "Python.h"
#include "pycore_fileutils.h"     // struct _Ty_stat_struct
#include "pycore_import.h"        // _TyImport_GetDLOpenFlags()
#include "pycore_importdl.h"
#include "pycore_interp.h"        // _PyInterpreterState.dlopenflags
#include "pycore_pystate.h"       // _TyInterpreterState_GET()

#include <sys/types.h>
#include <sys/stat.h>

#if defined(__NetBSD__)
#include <sys/param.h>
#if (NetBSD < 199712)
#include <nlist.h>
#include <link.h>
#define dlerror() "error in dynamic linking"
#endif
#endif /* NetBSD */

#ifdef HAVE_DLFCN_H
#include <dlfcn.h>
#endif

#if (defined(__OpenBSD__) || defined(__NetBSD__)) && !defined(__ELF__)
#define LEAD_UNDERSCORE "_"
#else
#define LEAD_UNDERSCORE ""
#endif

/* The .so extension module ABI tag, supplied by the Makefile via
   Makefile.pre.in and configure.  This is used to discriminate between
   incompatible .so files so that extensions for different Python builds can
   live in the same directory.  E.g. foomodule.cpython-32.so
*/

const char *_TyImport_DynLoadFiletab[] = {
#ifdef __CYGWIN__
    ".dll",
#else  /* !__CYGWIN__ */
    "." SOABI ".so",
#ifdef ALT_SOABI
    "." ALT_SOABI ".so",
#endif
    ".abi" PYTHON_ABI_STRING ".so",
    ".so",
#endif  /* __CYGWIN__ */
    NULL,
};


dl_funcptr
_TyImport_FindSharedFuncptr(const char *prefix,
                            const char *shortname,
                            const char *pathname, FILE *fp)
{
    dl_funcptr p;
    void *handle;
    char funcname[258];
    char pathbuf[260];
    int dlopenflags=0;

    if (strchr(pathname, '/') == NULL) {
        /* Prefix bare filename with "./" */
        TyOS_snprintf(pathbuf, sizeof(pathbuf), "./%-.255s", pathname);
        pathname = pathbuf;
    }

    TyOS_snprintf(funcname, sizeof(funcname),
                  LEAD_UNDERSCORE "%.20s_%.200s", prefix, shortname);

    if (fp != NULL) {
        struct _Ty_stat_struct status;
        if (_Ty_fstat(fileno(fp), &status) == -1)
            return NULL;
    }

    dlopenflags = _TyImport_GetDLOpenFlags(_TyInterpreterState_GET());

    handle = dlopen(pathname, dlopenflags);

    if (handle == NULL) {
        TyObject *mod_name;
        TyObject *path;
        TyObject *error_ob;
        const char *error = dlerror();
        if (error == NULL)
            error = "unknown dlopen() error";
        error_ob = TyUnicode_DecodeLocale(error, "surrogateescape");
        if (error_ob == NULL)
            return NULL;
        mod_name = TyUnicode_FromString(shortname);
        if (mod_name == NULL) {
            Ty_DECREF(error_ob);
            return NULL;
        }
        path = TyUnicode_DecodeFSDefault(pathname);
        if (path == NULL) {
            Ty_DECREF(error_ob);
            Ty_DECREF(mod_name);
            return NULL;
        }
        TyErr_SetImportError(error_ob, mod_name, path);
        Ty_DECREF(error_ob);
        Ty_DECREF(mod_name);
        Ty_DECREF(path);
        return NULL;
    }
    p = (dl_funcptr) dlsym(handle, funcname);
    return p;
}
