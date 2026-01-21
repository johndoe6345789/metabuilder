
#include "Python.h"

#ifndef PLATFORM
#define PLATFORM "unknown"
#endif

const char *
Ty_GetPlatform(void)
{
    return PLATFORM;
}
