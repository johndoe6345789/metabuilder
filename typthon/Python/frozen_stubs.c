/* Stub file for frozen modules and other missing symbols in minimal build */

#include "Python.h"
#include "pycore_pystate.h"
#include "pycore_import.h"
#include <errno.h>

/* Frozen module stubs - empty arrays to satisfy linker */
static const struct _frozen _frozen_bootstrap_list[] = {
    {0, 0, 0, 0}
};

static const struct _frozen _frozen_stdlib_list[] = {
    {0, 0, 0, 0}
};

static const struct _frozen _frozen_test_list[] = {
    {0, 0, 0, 0}
};

static const struct _module_alias _frozen_aliases_list[] = {
    {0, 0}
};

const struct _frozen *_TyImport_FrozenBootstrap = _frozen_bootstrap_list;
const struct _frozen *_TyImport_FrozenStdlib = _frozen_stdlib_list;
const struct _frozen *_TyImport_FrozenTest = _frozen_test_list;
const struct _frozen *TyImport_FrozenModules = NULL;
const struct _module_alias *_TyImport_FrozenAliases = _frozen_aliases_list;

/* Inittab stub */
struct _inittab _TyImport_Inittab[] = {
    {0, 0}
};

/* Build info stubs */

/* Use CMake-generated git information if available */
#ifndef GIT_COMMIT_HASH
#define GIT_COMMIT_HASH "unknown"
#endif

#ifndef GIT_BRANCH
#define GIT_BRANCH "default"
#endif

const char *
Ty_GetBuildInfo(void)
{
    return "Typthon 3.14.0 (" GIT_BRANCH ":" GIT_COMMIT_HASH ", " __DATE__ " " __TIME__ ")";
}

const char *
_Ty_gitidentifier(void)
{
    return GIT_BRANCH;
}

const char *
_Ty_gitversion(void)
{
    return "Typthon 3.14.0:" GIT_COMMIT_HASH;
}

/* DL open flags stub */
int
_TyImport_GetDLOpenFlags(TyInterpreterState *interp)
{
    return 0x102; /* RTLD_NOW | RTLD_GLOBAL */
}

/* Path config stub - minimal implementation */
TyStatus
_TyConfig_InitPathConfig(TyConfig *config, int compute_path_config)
{
    return TyStatus_Ok();
}

/* plock stub - not available on all systems */
#ifndef HAVE_PLOCK
int plock(int op)
{
    /* Not implemented */
    errno = ENOSYS;
    return -1;
}
#endif
