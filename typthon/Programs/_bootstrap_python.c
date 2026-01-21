
/* Frozen modules bootstrap
 *
 * Limited and restricted Python interpreter to run
 * "Tools/build/deepfreeze.py" on systems with no or older Python
 * interpreter.
 */

#include "Python.h"
#include "pycore_import.h"

/* Includes for frozen modules: */
#include "Python/frozen_modules/importlib._bootstrap.h"
#include "Python/frozen_modules/importlib._bootstrap_external.h"
#include "Python/frozen_modules/zipimport.h"
/* End includes */

/* Note that a negative size indicates a package. */

static const struct _frozen bootstrap_modules[] = {
    {"_frozen_importlib", _Ty_M__importlib__bootstrap, (int)sizeof(_Ty_M__importlib__bootstrap)},
    {"_frozen_importlib_external", _Ty_M__importlib__bootstrap_external, (int)sizeof(_Ty_M__importlib__bootstrap_external)},
    {"zipimport", _Ty_M__zipimport, (int)sizeof(_Ty_M__zipimport)},
    {0, 0, 0} /* bootstrap sentinel */
};
static const struct _frozen stdlib_modules[] = {
    {0, 0, 0} /* stdlib sentinel */
};
static const struct _frozen test_modules[] = {
    {0, 0, 0} /* test sentinel */
};
const struct _frozen *_TyImport_FrozenBootstrap = bootstrap_modules;
const struct _frozen *_TyImport_FrozenStdlib = stdlib_modules;
const struct _frozen *_TyImport_FrozenTest = test_modules;

static const struct _module_alias aliases[] = {
    {"_frozen_importlib", "importlib._bootstrap"},
    {"_frozen_importlib_external", "importlib._bootstrap_external"},
    {0, 0} /* aliases sentinel */
};
const struct _module_alias *_TyImport_FrozenAliases = aliases;

/* Embedding apps may change this pointer to point to their favorite
   collection of frozen modules: */

const struct _frozen *TyImport_FrozenModules = NULL;

int
#ifdef MS_WINDOWS
wmain(int argc, wchar_t **argv)
#else
main(int argc, char **argv)
#endif
{
    TyStatus status;

    TyConfig config;
    TyConfig_InitIsolatedConfig(&config);
    // don't warn, pybuilddir.txt does not exist yet
    config.pathconfig_warnings = 0;
    // parse arguments
    config.parse_argv = 1;
    // add current script dir to sys.path
    config.isolated = 0;
    config.safe_path = 0;

#ifdef MS_WINDOWS
    status = TyConfig_SetArgv(&config, argc, argv);
#else
    status = TyConfig_SetBytesArgv(&config, argc, argv);
#endif
    if (TyStatus_Exception(status)) {
        goto error;
    }

    status = TyConfig_Read(&config);
    if (config.run_filename == NULL) {
        status = TyStatus_Error("Run filename expected");
        goto error;
    }

#define CLEAR(ATTR) \
    do { \
        TyMem_RawFree(ATTR); \
        ATTR = NULL; \
    } while (0)

    // isolate from system Python
    CLEAR(config.base_prefix);
    CLEAR(config.prefix);
    CLEAR(config.base_exec_prefix);
    CLEAR(config.exec_prefix);

    status = Ty_InitializeFromConfig(&config);
    if (TyStatus_Exception(status)) {
        goto error;
    }
    TyConfig_Clear(&config);

    return Ty_RunMain();

error:
    TyConfig_Clear(&config);
    if (TyStatus_IsExit(status)) {
        return status.exitcode;
    }
    Ty_ExitStatusException(status);
}

