/* Minimal main program -- everything is loaded from the library */

#include "Python.h"

#ifdef MS_WINDOWS
int
wmain(int argc, wchar_t **argv)
{
    return Ty_Main(argc, argv);
}
#else
int
main(int argc, char **argv)
{
    return Ty_BytesMain(argc, argv);
}
#endif
