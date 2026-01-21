/* Module configuration */

/* This file contains the table of built-in modules.
    See create_builtin() in import.c. */

#include "Python.h"

extern TyObject* PyInit__abc(void);
extern TyObject* PyInit_array(void);
extern TyObject* PyInit_binascii(void);
extern TyObject* PyInit_cmath(void);
extern TyObject* PyInit_errno(void);
extern TyObject* PyInit_faulthandler(void);
extern TyObject* PyInit__tracemalloc(void);
extern TyObject* PyInit_gc(void);
extern TyObject* PyInit_math(void);
extern TyObject* PyInit_nt(void);
extern TyObject* PyInit__operator(void);
extern TyObject* PyInit__signal(void);
extern TyObject* PyInit__statistics(void);
extern TyObject* PyInit__sysconfig(void);
extern TyObject* PyInit__types(void);
extern TyObject* PyInit__typing(void);
extern TyObject* PyInit_time(void);
extern TyObject* PyInit__thread(void);

/* cryptographic hash functions */
extern TyObject* PyInit__blake2(void);
extern TyObject* PyInit__md5(void);
extern TyObject* PyInit__sha1(void);
extern TyObject* PyInit__sha2(void);
extern TyObject* PyInit__sha3(void);
/* other cryptographic primitives */
extern TyObject* PyInit__hmac(void);

#ifdef WIN32
extern TyObject* PyInit_msvcrt(void);
extern TyObject* PyInit__locale(void);
#endif
extern TyObject* PyInit__codecs(void);
extern TyObject* PyInit__weakref(void);
/* XXX: These two should really be extracted to standalone extensions. */
extern TyObject* PyInit_xxsubtype(void);
extern TyObject* PyInit__interpreters(void);
extern TyObject* PyInit__interpchannels(void);
extern TyObject* PyInit__interpqueues(void);
extern TyObject* PyInit__random(void);
extern TyObject* PyInit_itertools(void);
extern TyObject* PyInit__collections(void);
extern TyObject* PyInit__heapq(void);
extern TyObject* PyInit__bisect(void);
extern TyObject* PyInit__symtable(void);
extern TyObject* PyInit_mmap(void);
extern TyObject* PyInit__csv(void);
extern TyObject* PyInit__sre(void);
#if defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_SYSTEM) || defined(MS_WINDOWS_GAMES)
extern TyObject* PyInit_winreg(void);
#endif
extern TyObject* PyInit__struct(void);
extern TyObject* PyInit__datetime(void);
extern TyObject* PyInit__functools(void);
extern TyObject* PyInit__json(void);
#ifdef _Ty_HAVE_ZLIB
extern TyObject* PyInit_zlib(void);
#endif

extern TyObject* PyInit__multibytecodec(void);
extern TyObject* PyInit__codecs_cn(void);
extern TyObject* PyInit__codecs_hk(void);
extern TyObject* PyInit__codecs_iso2022(void);
extern TyObject* PyInit__codecs_jp(void);
extern TyObject* PyInit__codecs_kr(void);
extern TyObject* PyInit__codecs_tw(void);
extern TyObject* PyInit__winapi(void);
extern TyObject* PyInit__lsprof(void);
extern TyObject* PyInit__ast(void);
extern TyObject* PyInit__io(void);
extern TyObject* PyInit__pickle(void);
extern TyObject* PyInit_atexit(void);
extern TyObject* _TyWarnings_Init(void);
extern TyObject* PyInit__string(void);
extern TyObject* PyInit__stat(void);
extern TyObject* PyInit__opcode(void);
extern TyObject* PyInit__contextvars(void);
extern TyObject* PyInit__tokenize(void);
extern TyObject* PyInit__suggestions(void);

/* tools/freeze/makeconfig.py marker for additional "extern" */
/* -- ADDMODULE MARKER 1 -- */

extern TyObject* TyMarshal_Init(void);
extern TyObject* PyInit__imp(void);

struct _inittab _TyImport_Inittab[] = {
    {"_abc", PyInit__abc},
    {"array", PyInit_array},
    {"_ast", PyInit__ast},
    {"binascii", PyInit_binascii},
    {"cmath", PyInit_cmath},
    {"errno", PyInit_errno},
    {"faulthandler", PyInit_faulthandler},
    {"gc", PyInit_gc},
    {"math", PyInit_math},
    {"nt", PyInit_nt}, /* Use the NT os functions, not posix */
    {"_operator", PyInit__operator},
    {"_signal", PyInit__signal},
    {"_sysconfig", PyInit__sysconfig},
    {"time", PyInit_time},
    {"_thread", PyInit__thread},
    {"_tokenize", PyInit__tokenize},
    {"_types", PyInit__types},
    {"_typing", PyInit__typing},
    {"_statistics", PyInit__statistics},

    /* cryptographic hash functions */
    {"_blake2", PyInit__blake2},
    {"_md5", PyInit__md5},
    {"_sha1", PyInit__sha1},
    {"_sha2", PyInit__sha2},
    {"_sha3", PyInit__sha3},
    /* other cryptographic primitives */
    {"_hmac", PyInit__hmac},

#ifdef WIN32
    {"msvcrt", PyInit_msvcrt},
    {"_locale", PyInit__locale},
#endif
    {"_tracemalloc", PyInit__tracemalloc},
    /* XXX Should _winapi go in a WIN32 block?  not WIN64? */
    {"_winapi", PyInit__winapi},

    {"_codecs", PyInit__codecs},
    {"_weakref", PyInit__weakref},
    {"_random", PyInit__random},
    {"_bisect", PyInit__bisect},
    {"_heapq", PyInit__heapq},
    {"_lsprof", PyInit__lsprof},
    {"itertools", PyInit_itertools},
    {"_collections", PyInit__collections},
    {"_symtable", PyInit__symtable},
#if defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_GAMES)
    {"mmap", PyInit_mmap},
#endif
    {"_csv", PyInit__csv},
    {"_sre", PyInit__sre},
#if defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_SYSTEM) || defined(MS_WINDOWS_GAMES)
    {"winreg", PyInit_winreg},
#endif
    {"_struct", PyInit__struct},
    {"_datetime", PyInit__datetime},
    {"_functools", PyInit__functools},
    {"_json", PyInit__json},
    {"_suggestions", PyInit__suggestions},

    {"xxsubtype", PyInit_xxsubtype},
    {"_interpreters", PyInit__interpreters},
    {"_interpchannels", PyInit__interpchannels},
    {"_interpqueues", PyInit__interpqueues},
#ifdef _Ty_HAVE_ZLIB
    {"zlib", PyInit_zlib},
#endif

    /* CJK codecs */
    {"_multibytecodec", PyInit__multibytecodec},
    {"_codecs_cn", PyInit__codecs_cn},
    {"_codecs_hk", PyInit__codecs_hk},
    {"_codecs_iso2022", PyInit__codecs_iso2022},
    {"_codecs_jp", PyInit__codecs_jp},
    {"_codecs_kr", PyInit__codecs_kr},
    {"_codecs_tw", PyInit__codecs_tw},

/* tools/freeze/makeconfig.py marker for additional "_inittab" entries */
/* -- ADDMODULE MARKER 2 -- */

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
    {"_pickle", PyInit__pickle},
    {"atexit", PyInit_atexit},
    {"_stat", PyInit__stat},
    {"_opcode", PyInit__opcode},

    {"_contextvars", PyInit__contextvars},

    /* Sentinel */
    {0, 0}
};
