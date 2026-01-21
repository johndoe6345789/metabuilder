
/* Return the full version string. */

#include "Python.h"

#include "patchlevel.h"

static int initialized = 0;
static char version[300];

void _Ty_InitVersion(void)
{
    if (initialized) {
        return;
    }
    initialized = 1;
#ifdef Ty_GIL_DISABLED
    const char *buildinfo_format = "%.80s free-threading build (%.80s) %.80s";
#else
    const char *buildinfo_format = "%.80s (%.80s) %.80s";
#endif
    TyOS_snprintf(version, sizeof(version), buildinfo_format,
                  PY_VERSION, Ty_GetBuildInfo(), Ty_GetCompiler());
}

const char *
Ty_GetVersion(void)
{
    _Ty_InitVersion();
    return version;
}

// Export the Python hex version as a constant.
const unsigned long Ty_Version = PY_VERSION_HEX;
