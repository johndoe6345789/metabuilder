/* Module configuration */

/* This file contains the table of built-in modules.
    See create_builtin() in import.c. */

#include "Python.h"

#ifdef Ty_ENABLE_SHARED
/* Define extern variables omitted from minimal builds */
void *PyWin_DLLhModule = NULL;
#endif


extern TyObject* PyInit_faulthandler(void);
extern TyObject* PyInit__tracemalloc(void);
extern TyObject* PyInit_gc(void);
extern TyObject* PyInit_nt(void);
extern TyObject* PyInit__signal(void);
#if defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_SYSTEM) || defined(MS_WINDOWS_GAMES)
extern TyObject* PyInit_winreg(void);
#endif

extern TyObject* PyInit__ast(void);
extern TyObject* PyInit__io(void);
extern TyObject* PyInit_atexit(void);
extern TyObject* _TyWarnings_Init(void);
extern TyObject* PyInit__string(void);
extern TyObject* PyInit__tokenize(void);

extern TyObject* TyMarshal_Init(void);
extern TyObject* PyInit__imp(void);

struct _inittab _TyImport_Inittab[] = {
    {"_ast", PyInit__ast},
    {"faulthandler", PyInit_faulthandler},
    {"gc", PyInit_gc},
    {"nt", PyInit_nt}, /* Use the NT os functions, not posix */
    {"_signal", PyInit__signal},
    {"_tokenize", PyInit__tokenize},
    {"_tracemalloc", PyInit__tracemalloc},

#if defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_SYSTEM) || defined(MS_WINDOWS_GAMES)
    {"winreg", PyInit_winreg},
#endif

    /* This module "lives in" with marshal.c */
    {"marshal", TyMarshal_Init},

    /* This lives it with import.c */
    {"_imp", PyInit__imp},

    /* These entries are here for sys.builtin_module_names */
    {"builtins", NULL},
    {"sys", NULL},
    {"_warnings", _TyWarnings_Init},
    {"_string", PyInit__string},

    {"_io", PyInit__io},
    {"atexit", PyInit_atexit},

    /* Sentinel */
    {0, 0}
};
