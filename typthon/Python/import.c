/* Module definition and import implementation */

#include "Python.h"
#include "pycore_audit.h"         // _TySys_Audit()
#include "pycore_ceval.h"
#include "pycore_hashtable.h"     // _Ty_hashtable_new_full()
#include "pycore_import.h"        // _TyImport_BootstrapImp()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_interp.h"        // struct _import_runtime_state
#include "pycore_magic_number.h"  // PYC_MAGIC_NUMBER_TOKEN
#include "pycore_moduleobject.h"  // _TyModule_GetDef()
#include "pycore_namespace.h"     // _PyNamespace_Type
#include "pycore_object.h"        // _Ty_SetImmortal()
#include "pycore_pyerrors.h"      // _TyErr_SetString()
#include "pycore_pyhash.h"        // _Ty_KeyedHash()
#include "pycore_pylifecycle.h"
#include "pycore_pymem.h"         // _TyMem_DefaultRawFree()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_sysmodule.h"     // _TySys_ClearAttrString()
#include "pycore_time.h"          // _TyTime_AsMicroseconds()
#include "pycore_unicodeobject.h" // _TyUnicode_AsUTF8NoNUL()
#include "pycore_weakref.h"       // _TyWeakref_GET_REF()

#include "marshal.h"              // TyMarshal_ReadObjectFromString()
#include "pycore_importdl.h"      // _TyImport_DynLoadFiletab
#include "pydtrace.h"             // PyDTrace_IMPORT_FIND_LOAD_START_ENABLED()
#include <stdbool.h>              // bool

#ifdef HAVE_FCNTL_H
#include <fcntl.h>
#endif


/*[clinic input]
module _imp
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=9c332475d8686284]*/

#include "clinic/import.c.h"


#ifndef NDEBUG
static bool
is_interpreter_isolated(TyInterpreterState *interp)
{
    return !_Ty_IsMainInterpreter(interp)
        && !(interp->feature_flags & Ty_RTFLAGS_USE_MAIN_OBMALLOC)
        && interp->ceval.own_gil;
}
#endif


/*******************************/
/* process-global import state */
/*******************************/

/* This table is defined in config.c: */
extern struct _inittab _TyImport_Inittab[];

// This is not used after Ty_Initialize() is called.
// (See _PyRuntimeState.imports.inittab.)
struct _inittab *TyImport_Inittab = _TyImport_Inittab;
// When we dynamically allocate a larger table for TyImport_ExtendInittab(),
// we track the pointer here so we can deallocate it during finalization.
static struct _inittab *inittab_copy = NULL;


/*******************************/
/* runtime-global import state */
/*******************************/

#define INITTAB _PyRuntime.imports.inittab
#define LAST_MODULE_INDEX _PyRuntime.imports.last_module_index
#define EXTENSIONS _PyRuntime.imports.extensions

#define PKGCONTEXT (_PyRuntime.imports.pkgcontext)


/*******************************/
/* interpreter import state */
/*******************************/

#define MODULES(interp) \
    (interp)->imports.modules
#define MODULES_BY_INDEX(interp) \
    (interp)->imports.modules_by_index
#define IMPORTLIB(interp) \
    (interp)->imports.importlib
#define OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK(interp) \
    (interp)->imports.override_multi_interp_extensions_check
#define OVERRIDE_FROZEN_MODULES(interp) \
    (interp)->imports.override_frozen_modules
#ifdef HAVE_DLOPEN
#  define DLOPENFLAGS(interp) \
        (interp)->imports.dlopenflags
#endif
#define IMPORT_FUNC(interp) \
    (interp)->imports.import_func

#define IMPORT_LOCK(interp) \
    (interp)->imports.lock

#define FIND_AND_LOAD(interp) \
    (interp)->imports.find_and_load

#define _IMPORT_TIME_HEADER(interp)                                           \
    do {                                                                      \
        if (FIND_AND_LOAD((interp)).header) {                                 \
            fputs("import time: self [us] | cumulative | imported package\n", \
                  stderr);                                                    \
            FIND_AND_LOAD((interp)).header = 0;                               \
        }                                                                     \
    } while (0)


/*******************/
/* the import lock */
/*******************/

/* Locking primitives to prevent parallel imports of the same module
   in different threads to return with a partially loaded module.
   These calls are serialized by the global interpreter lock. */

void
_TyImport_AcquireLock(TyInterpreterState *interp)
{
    _PyRecursiveMutex_Lock(&IMPORT_LOCK(interp));
}

void
_TyImport_ReleaseLock(TyInterpreterState *interp)
{
    _PyRecursiveMutex_Unlock(&IMPORT_LOCK(interp));
}

void
_TyImport_ReInitLock(TyInterpreterState *interp)
{
    // gh-126688: Thread id may change after fork() on some operating systems.
    IMPORT_LOCK(interp).thread = TyThread_get_thread_ident_ex();
}


/***************/
/* sys.modules */
/***************/

TyObject *
_TyImport_InitModules(TyInterpreterState *interp)
{
    assert(MODULES(interp) == NULL);
    MODULES(interp) = TyDict_New();
    if (MODULES(interp) == NULL) {
        return NULL;
    }
    return MODULES(interp);
}

TyObject *
_TyImport_GetModules(TyInterpreterState *interp)
{
    return MODULES(interp);
}

TyObject *
_TyImport_GetModulesRef(TyInterpreterState *interp)
{
    _TyImport_AcquireLock(interp);
    TyObject *modules = MODULES(interp);
    if (modules == NULL) {
        /* The interpreter hasn't been initialized yet. */
        modules = Ty_None;
    }
    Ty_INCREF(modules);
    _TyImport_ReleaseLock(interp);
    return modules;
}

void
_TyImport_ClearModules(TyInterpreterState *interp)
{
    Ty_SETREF(MODULES(interp), NULL);
}

static inline TyObject *
get_modules_dict(TyThreadState *tstate, bool fatal)
{
    /* Technically, it would make sense to incref the dict,
     * since sys.modules could be swapped out and decref'ed to 0
     * before the caller is done using it.  However, that is highly
     * unlikely, especially since we can rely on a global lock
     * (i.e. the GIL) for thread-safety. */
    TyObject *modules = MODULES(tstate->interp);
    if (modules == NULL) {
        if (fatal) {
            Ty_FatalError("interpreter has no modules dictionary");
        }
        _TyErr_SetString(tstate, TyExc_RuntimeError,
                         "unable to get sys.modules");
        return NULL;
    }
    return modules;
}

TyObject *
TyImport_GetModuleDict(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return get_modules_dict(tstate, true);
}

int
_TyImport_SetModule(TyObject *name, TyObject *m)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *modules = get_modules_dict(tstate, true);
    return PyObject_SetItem(modules, name, m);
}

int
_TyImport_SetModuleString(const char *name, TyObject *m)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *modules = get_modules_dict(tstate, true);
    return PyMapping_SetItemString(modules, name, m);
}

static TyObject *
import_get_module(TyThreadState *tstate, TyObject *name)
{
    TyObject *modules = get_modules_dict(tstate, false);
    if (modules == NULL) {
        return NULL;
    }

    TyObject *m;
    Ty_INCREF(modules);
    (void)PyMapping_GetOptionalItem(modules, name, &m);
    Ty_DECREF(modules);
    return m;
}

static int
import_ensure_initialized(TyInterpreterState *interp, TyObject *mod, TyObject *name)
{
    TyObject *spec;

    /* Optimization: only call _bootstrap._lock_unlock_module() if
       __spec__._initializing is true.
       NOTE: because of this, initializing must be set *before*
       stuffing the new module in sys.modules.
    */
    int rc = PyObject_GetOptionalAttr(mod, &_Ty_ID(__spec__), &spec);
    if (rc > 0) {
        rc = _PyModuleSpec_IsInitializing(spec);
        Ty_DECREF(spec);
    }
    if (rc == 0) {
        goto done;
    }
    else if (rc < 0) {
        return rc;
    }

    /* Wait until module is done importing. */
    TyObject *value = PyObject_CallMethodOneArg(
        IMPORTLIB(interp), &_Ty_ID(_lock_unlock_module), name);
    if (value == NULL) {
        return -1;
    }
    Ty_DECREF(value);

done:
    /* When -X importtime=2, print an import time entry even if an
       imported module has already been loaded.
     */
    if (_TyInterpreterState_GetConfig(interp)->import_time == 2) {
        _IMPORT_TIME_HEADER(interp);
#define import_level FIND_AND_LOAD(interp).import_level
        fprintf(stderr, "import time: cached    | cached     | %*s\n",
                import_level*2, TyUnicode_AsUTF8(name));
#undef import_level
    }

    return 0;
}

static void remove_importlib_frames(TyThreadState *tstate);

TyObject *
TyImport_GetModule(TyObject *name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *mod;

    mod = import_get_module(tstate, name);
    if (mod != NULL && mod != Ty_None) {
        if (import_ensure_initialized(tstate->interp, mod, name) < 0) {
            Ty_DECREF(mod);
            remove_importlib_frames(tstate);
            return NULL;
        }
    }
    return mod;
}

/* Get the module object corresponding to a module name.
   First check the modules dictionary if there's one there,
   if not, create a new one and insert it in the modules dictionary. */

static TyObject *
import_add_module(TyThreadState *tstate, TyObject *name)
{
    TyObject *modules = get_modules_dict(tstate, false);
    if (modules == NULL) {
        return NULL;
    }

    TyObject *m;
    if (PyMapping_GetOptionalItem(modules, name, &m) < 0) {
        return NULL;
    }
    if (m != NULL && TyModule_Check(m)) {
        return m;
    }
    Ty_XDECREF(m);
    m = TyModule_NewObject(name);
    if (m == NULL)
        return NULL;
    if (PyObject_SetItem(modules, name, m) != 0) {
        Ty_DECREF(m);
        return NULL;
    }

    return m;
}

TyObject *
TyImport_AddModuleRef(const char *name)
{
    TyObject *name_obj = TyUnicode_FromString(name);
    if (name_obj == NULL) {
        return NULL;
    }
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *module = import_add_module(tstate, name_obj);
    Ty_DECREF(name_obj);
    return module;
}


TyObject *
TyImport_AddModuleObject(TyObject *name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *mod = import_add_module(tstate, name);
    if (!mod) {
        return NULL;
    }

    // gh-86160: TyImport_AddModuleObject() returns a borrowed reference.
    // Create a weak reference to produce a borrowed reference, since it can
    // become NULL. sys.modules type can be different than dict and it is not
    // guaranteed that it keeps a strong reference to the module. It can be a
    // custom mapping with __getitem__() which returns a new object or removes
    // returned object, or __setitem__ which does nothing. There is so much
    // unknown.  With weakref we can be sure that we get either a reference to
    // live object or NULL.
    //
    // Use TyImport_AddModuleRef() to avoid these issues.
    TyObject *ref = PyWeakref_NewRef(mod, NULL);
    Ty_DECREF(mod);
    if (ref == NULL) {
        return NULL;
    }
    mod = _TyWeakref_GET_REF(ref);
    Ty_DECREF(ref);
    Ty_XDECREF(mod);

    if (mod == NULL && !TyErr_Occurred()) {
        TyErr_SetString(TyExc_RuntimeError,
                        "sys.modules does not hold a strong reference "
                        "to the module");
    }
    return mod; /* borrowed reference */
}


TyObject *
TyImport_AddModule(const char *name)
{
    TyObject *nameobj = TyUnicode_FromString(name);
    if (nameobj == NULL) {
        return NULL;
    }
    TyObject *module = TyImport_AddModuleObject(nameobj);
    Ty_DECREF(nameobj);
    return module;
}


/* Remove name from sys.modules, if it's there.
 * Can be called with an exception raised.
 * If fail to remove name a new exception will be chained with the old
 * exception, otherwise the old exception is preserved.
 */
static void
remove_module(TyThreadState *tstate, TyObject *name)
{
    TyObject *exc = _TyErr_GetRaisedException(tstate);

    TyObject *modules = get_modules_dict(tstate, true);
    if (TyDict_CheckExact(modules)) {
        // Error is reported to the caller
        (void)TyDict_Pop(modules, name, NULL);
    }
    else if (PyMapping_DelItem(modules, name) < 0) {
        if (_TyErr_ExceptionMatches(tstate, TyExc_KeyError)) {
            _TyErr_Clear(tstate);
        }
    }

    _TyErr_ChainExceptions1(exc);
}


/************************************/
/* per-interpreter modules-by-index */
/************************************/

Ty_ssize_t
_TyImport_GetNextModuleIndex(void)
{
    return _Ty_atomic_add_ssize(&LAST_MODULE_INDEX, 1) + 1;
}

#ifndef NDEBUG
struct extensions_cache_value;
static struct extensions_cache_value * _find_cached_def(TyModuleDef *);
static Ty_ssize_t _get_cached_module_index(struct extensions_cache_value *);
#endif

static Ty_ssize_t
_get_module_index_from_def(TyModuleDef *def)
{
    Ty_ssize_t index = def->m_base.m_index;
#ifndef NDEBUG
    struct extensions_cache_value *cached = _find_cached_def(def);
    assert(cached == NULL || index == _get_cached_module_index(cached));
#endif
    return index;
}

static void
_set_module_index(TyModuleDef *def, Ty_ssize_t index)
{
    assert(index > 0);
    if (index == def->m_base.m_index) {
        /* There's nothing to do. */
    }
    else if (def->m_base.m_index == 0) {
        /* It should have been initialized by PyModuleDef_Init().
         * We assert here to catch this in dev, but keep going otherwise. */
        assert(def->m_base.m_index != 0);
        def->m_base.m_index = index;
    }
    else {
        /* It was already set for a different module.
         * We replace the old value. */
        assert(def->m_base.m_index > 0);
        def->m_base.m_index = index;
    }
}

static const char *
_modules_by_index_check(TyInterpreterState *interp, Ty_ssize_t index)
{
    if (index <= 0) {
        return "invalid module index";
    }
    if (MODULES_BY_INDEX(interp) == NULL) {
        return "Interpreters module-list not accessible.";
    }
    if (index >= TyList_GET_SIZE(MODULES_BY_INDEX(interp))) {
        return "Module index out of bounds.";
    }
    return NULL;
}

static TyObject *
_modules_by_index_get(TyInterpreterState *interp, Ty_ssize_t index)
{
    if (_modules_by_index_check(interp, index) != NULL) {
        return NULL;
    }
    TyObject *res = TyList_GET_ITEM(MODULES_BY_INDEX(interp), index);
    return res==Ty_None ? NULL : res;
}

static int
_modules_by_index_set(TyInterpreterState *interp,
                      Ty_ssize_t index, TyObject *module)
{
    assert(index > 0);

    if (MODULES_BY_INDEX(interp) == NULL) {
        MODULES_BY_INDEX(interp) = TyList_New(0);
        if (MODULES_BY_INDEX(interp) == NULL) {
            return -1;
        }
    }

    while (TyList_GET_SIZE(MODULES_BY_INDEX(interp)) <= index) {
        if (TyList_Append(MODULES_BY_INDEX(interp), Ty_None) < 0) {
            return -1;
        }
    }

    return TyList_SetItem(MODULES_BY_INDEX(interp), index, Ty_NewRef(module));
}

static int
_modules_by_index_clear_one(TyInterpreterState *interp, Ty_ssize_t index)
{
    const char *err = _modules_by_index_check(interp, index);
    if (err != NULL) {
        Ty_FatalError(err);
        return -1;
    }
    return TyList_SetItem(MODULES_BY_INDEX(interp), index, Ty_NewRef(Ty_None));
}


TyObject*
PyState_FindModule(TyModuleDef* module)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (module->m_slots) {
        return NULL;
    }
    Ty_ssize_t index = _get_module_index_from_def(module);
    return _modules_by_index_get(interp, index);
}

/* _PyState_AddModule() has been completely removed from the C-API
   (and was removed from the limited API in 3.6).  However, we're
   playing it safe and keeping it around for any stable ABI extensions
   built against 3.2-3.5. */
int
_PyState_AddModule(TyThreadState *tstate, TyObject* module, TyModuleDef* def)
{
    if (!def) {
        assert(_TyErr_Occurred(tstate));
        return -1;
    }
    if (def->m_slots) {
        _TyErr_SetString(tstate,
                         TyExc_SystemError,
                         "PyState_AddModule called on module with slots");
        return -1;
    }
    assert(def->m_slots == NULL);
    Ty_ssize_t index = _get_module_index_from_def(def);
    return _modules_by_index_set(tstate->interp, index, module);
}

int
PyState_AddModule(TyObject* module, TyModuleDef* def)
{
    if (!def) {
        Ty_FatalError("module definition is NULL");
        return -1;
    }

    TyThreadState *tstate = _TyThreadState_GET();
    if (def->m_slots) {
        _TyErr_SetString(tstate,
                         TyExc_SystemError,
                         "PyState_AddModule called on module with slots");
        return -1;
    }

    TyInterpreterState *interp = tstate->interp;
    Ty_ssize_t index = _get_module_index_from_def(def);
    if (MODULES_BY_INDEX(interp) &&
        index < TyList_GET_SIZE(MODULES_BY_INDEX(interp)) &&
        module == TyList_GET_ITEM(MODULES_BY_INDEX(interp), index))
    {
        _Ty_FatalErrorFormat(__func__, "module %p already added", module);
        return -1;
    }

    assert(def->m_slots == NULL);
    return _modules_by_index_set(interp, index, module);
}

int
PyState_RemoveModule(TyModuleDef* def)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (def->m_slots) {
        _TyErr_SetString(tstate,
                         TyExc_SystemError,
                         "PyState_RemoveModule called on module with slots");
        return -1;
    }
    Ty_ssize_t index = _get_module_index_from_def(def);
    return _modules_by_index_clear_one(tstate->interp, index);
}


// Used by finalize_modules()
void
_TyImport_ClearModulesByIndex(TyInterpreterState *interp)
{
    if (!MODULES_BY_INDEX(interp)) {
        return;
    }

    Ty_ssize_t i;
    for (i = 0; i < TyList_GET_SIZE(MODULES_BY_INDEX(interp)); i++) {
        TyObject *m = TyList_GET_ITEM(MODULES_BY_INDEX(interp), i);
        if (TyModule_Check(m)) {
            /* cleanup the saved copy of module dicts */
            TyModuleDef *md = TyModule_GetDef(m);
            if (md) {
                // XXX Do this more carefully.  The dict might be owned
                // by another interpreter.
                Ty_CLEAR(md->m_base.m_copy);
            }
        }
    }

    /* Setting modules_by_index to NULL could be dangerous, so we
       clear the list instead. */
    if (TyList_SetSlice(MODULES_BY_INDEX(interp),
                        0, TyList_GET_SIZE(MODULES_BY_INDEX(interp)),
                        NULL)) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing interpreters module list");
    }
}


/*********************/
/* extension modules */
/*********************/

/*
    It may help to have a big picture view of what happens
    when an extension is loaded.  This includes when it is imported
    for the first time.

    Here's a summary, using importlib._bootstrap._load() as a starting point.

    1.  importlib._bootstrap._load()
    2.    _load():  acquire import lock
    3.    _load() -> importlib._bootstrap._load_unlocked()
    4.      _load_unlocked() -> importlib._bootstrap.module_from_spec()
    5.        module_from_spec() -> ExtensionFileLoader.create_module()
    6.          create_module() -> _imp.create_dynamic()
                    (see below)
    7.        module_from_spec() -> importlib._bootstrap._init_module_attrs()
    8.      _load_unlocked():  sys.modules[name] = module
    9.      _load_unlocked() -> ExtensionFileLoader.exec_module()
    10.       exec_module() -> _imp.exec_dynamic()
                  (see below)
    11.   _load():  release import lock


    ...for single-phase init modules, where m_size == -1:

    (6). first time  (not found in _PyRuntime.imports.extensions):
       A. _imp_create_dynamic_impl() -> import_find_extension()
       B. _imp_create_dynamic_impl() -> _TyImport_GetModInitFunc()
       C.   _TyImport_GetModInitFunc():  load <module init func>
       D. _imp_create_dynamic_impl() -> import_run_extension()
       E.   import_run_extension() -> _TyImport_RunModInitFunc()
       F.     _TyImport_RunModInitFunc():  call <module init func>
       G.       <module init func> -> TyModule_Create() -> TyModule_Create2()
                                          -> TyModule_CreateInitialized()
       H.         TyModule_CreateInitialized() -> TyModule_New()
       I.         TyModule_CreateInitialized():  allocate mod->md_state
       J.         TyModule_CreateInitialized() -> TyModule_AddFunctions()
       K.         TyModule_CreateInitialized() -> TyModule_SetDocString()
       L.       TyModule_CreateInitialized():  set mod->md_def
       M.       <module init func>:  initialize the module, etc.
       N.   import_run_extension()
                -> _TyImport_CheckSubinterpIncompatibleExtensionAllowed()
       O.   import_run_extension():  set __file__
       P.   import_run_extension() -> update_global_state_for_extension()
       Q.     update_global_state_for_extension():
                      copy __dict__ into def->m_base.m_copy
       R.     update_global_state_for_extension():
                      add it to _PyRuntime.imports.extensions
       S.   import_run_extension() -> finish_singlephase_extension()
       T.     finish_singlephase_extension():
                      add it to interp->imports.modules_by_index
       U.     finish_singlephase_extension():  add it to sys.modules

       Step (Q) is skipped for core modules (sys/builtins).

    (6). subsequent times  (found in _PyRuntime.imports.extensions):
       A. _imp_create_dynamic_impl() -> import_find_extension()
       B.   import_find_extension() -> reload_singlephase_extension()
       C.     reload_singlephase_extension()
                  -> _TyImport_CheckSubinterpIncompatibleExtensionAllowed()
       D.     reload_singlephase_extension() -> import_add_module()
       E.       if name in sys.modules:  use that module
       F.       else:
                  1. import_add_module() -> TyModule_NewObject()
                  2. import_add_module():  set it on sys.modules
       G.     reload_singlephase_extension():  copy the "m_copy" dict into __dict__
       H.     reload_singlephase_extension():  add to modules_by_index

    (10). (every time):
       A. noop


    ...for single-phase init modules, where m_size >= 0:

    (6). not main interpreter and never loaded there - every time  (not found in _PyRuntime.imports.extensions):
       A-P. (same as for m_size == -1)
       Q.     _TyImport_RunModInitFunc():  set def->m_base.m_init
       R. (skipped)
       S-U. (same as for m_size == -1)

    (6). main interpreter - first time  (not found in _PyRuntime.imports.extensions):
       A-P. (same as for m_size == -1)
       Q.     _TyImport_RunModInitFunc():  set def->m_base.m_init
       R-U. (same as for m_size == -1)

    (6). subsequent times  (found in _PyRuntime.imports.extensions):
       A. _imp_create_dynamic_impl() -> import_find_extension()
       B.   import_find_extension() -> reload_singlephase_extension()
       C.     reload_singlephase_extension()
                  -> _TyImport_CheckSubinterpIncompatibleExtensionAllowed()
       D.     reload_singlephase_extension():  call def->m_base.m_init  (see above)
       E.     reload_singlephase_extension():  add the module to sys.modules
       F.     reload_singlephase_extension():  add to modules_by_index

    (10). every time:
       A. noop


    ...for multi-phase init modules:

    (6). every time:
       A. _imp_create_dynamic_impl() -> import_find_extension()  (not found)
       B. _imp_create_dynamic_impl() -> _TyImport_GetModInitFunc()
       C.   _TyImport_GetModInitFunc():  load <module init func>
       D. _imp_create_dynamic_impl() -> import_run_extension()
       E.   import_run_extension() -> _TyImport_RunModInitFunc()
       F.     _TyImport_RunModInitFunc():  call <module init func>
       G.   import_run_extension() -> TyModule_FromDefAndSpec()
       H.      TyModule_FromDefAndSpec(): gather/check moduledef slots
       I.      if there's a Ty_mod_create slot:
                 1. TyModule_FromDefAndSpec():  call its function
       J.      else:
                 1. TyModule_FromDefAndSpec() -> TyModule_NewObject()
       K:      TyModule_FromDefAndSpec():  set mod->md_def
       L.      TyModule_FromDefAndSpec() -> _add_methods_to_object()
       M.      TyModule_FromDefAndSpec() -> TyModule_SetDocString()

    (10). every time:
       A. _imp_exec_dynamic_impl() -> exec_builtin_or_dynamic()
       B.   if mod->md_state == NULL (including if m_size == 0):
            1. exec_builtin_or_dynamic() -> TyModule_ExecDef()
            2.   TyModule_ExecDef():  allocate mod->md_state
            3.   if there's a Ty_mod_exec slot:
                 1. TyModule_ExecDef():  call its function
 */


/* Make sure name is fully qualified.

   This is a bit of a hack: when the shared library is loaded,
   the module name is "package.module", but the module calls
   TyModule_Create*() with just "module" for the name.  The shared
   library loader squirrels away the true name of the module in
   _PyRuntime.imports.pkgcontext, and TyModule_Create*() will
   substitute this (if the name actually matches).
*/

#ifdef HAVE_THREAD_LOCAL
_Ty_thread_local const char *pkgcontext = NULL;
# undef PKGCONTEXT
# define PKGCONTEXT pkgcontext
#endif

const char *
_TyImport_ResolveNameWithPackageContext(const char *name)
{
#ifndef HAVE_THREAD_LOCAL
    PyMutex_Lock(&EXTENSIONS.mutex);
#endif
    if (PKGCONTEXT != NULL) {
        const char *p = strrchr(PKGCONTEXT, '.');
        if (p != NULL && strcmp(name, p+1) == 0) {
            name = PKGCONTEXT;
            PKGCONTEXT = NULL;
        }
    }
#ifndef HAVE_THREAD_LOCAL
    PyMutex_Unlock(&EXTENSIONS.mutex);
#endif
    return name;
}

const char *
_TyImport_SwapPackageContext(const char *newcontext)
{
#ifndef HAVE_THREAD_LOCAL
    PyMutex_Lock(&EXTENSIONS.mutex);
#endif
    const char *oldcontext = PKGCONTEXT;
    PKGCONTEXT = newcontext;
#ifndef HAVE_THREAD_LOCAL
    PyMutex_Unlock(&EXTENSIONS.mutex);
#endif
    return oldcontext;
}

#ifdef HAVE_DLOPEN
int
_TyImport_GetDLOpenFlags(TyInterpreterState *interp)
{
    return DLOPENFLAGS(interp);
}

void
_TyImport_SetDLOpenFlags(TyInterpreterState *interp, int new_val)
{
    DLOPENFLAGS(interp) = new_val;
}
#endif  // HAVE_DLOPEN


/* Common implementation for _imp.exec_dynamic and _imp.exec_builtin */
static int
exec_builtin_or_dynamic(TyObject *mod) {
    TyModuleDef *def;
    void *state;

    if (!TyModule_Check(mod)) {
        return 0;
    }

    def = TyModule_GetDef(mod);
    if (def == NULL) {
        return 0;
    }

    state = TyModule_GetState(mod);
    if (state) {
        /* Already initialized; skip reload */
        return 0;
    }

    return TyModule_ExecDef(mod, def);
}


static int clear_singlephase_extension(TyInterpreterState *interp,
                                       TyObject *name, TyObject *filename);

// Currently, this is only used for testing.
// (See _testinternalcapi.clear_extension().)
// If adding another use, be careful about modules that import themselves
// recursively (see gh-123880).
int
_TyImport_ClearExtension(TyObject *name, TyObject *filename)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    /* Clearing a module's C globals is up to the module. */
    if (clear_singlephase_extension(interp, name, filename) < 0) {
        return -1;
    }

    // In the future we'll probably also make sure the extension's
    // file handle (and DL handle) is closed (requires saving it).

    return 0;
}


/*****************************/
/* single-phase init modules */
/*****************************/

/*
We support a number of kinds of single-phase init builtin/extension modules:

* "basic"
    * no module state (TyModuleDef.m_size == -1)
    * does not support repeated init (we use TyModuleDef.m_base.m_copy)
    * may have process-global state
    * the module's def is cached in _PyRuntime.imports.extensions,
      by (name, filename)
* "reinit"
    * no module state (TyModuleDef.m_size == 0)
    * supports repeated init (m_copy is never used)
    * should not have any process-global state
    * its def is never cached in _PyRuntime.imports.extensions
      (except, currently, under the main interpreter, for some reason)
* "with state"  (almost the same as reinit)
    * has module state (TyModuleDef.m_size > 0)
    * supports repeated init (m_copy is never used)
    * should not have any process-global state
    * its def is never cached in _PyRuntime.imports.extensions
      (except, currently, under the main interpreter, for some reason)

There are also variants within those classes:

* two or more modules share a TyModuleDef
    * a module's init func uses another module's TyModuleDef
    * a module's init func calls another's module's init func
    * a module's init "func" is actually a variable statically initialized
      to another module's init func
* two or modules share "methods"
    * a module's init func copies another module's TyModuleDef
      (with a different name)
* (basic-only) two or modules share process-global state

In the first case, where modules share a TyModuleDef, the following
notable weirdness happens:

* the module's __name__ matches the def, not the requested name
* the last module (with the same def) to be imported for the first time wins
    * returned by PyState_Find_Module() (via interp->modules_by_index)
    * (non-basic-only) its init func is used when re-loading any of them
      (via the def's m_init)
    * (basic-only) the copy of its __dict__ is used when re-loading any of them
      (via the def's m_copy)

However, the following happens as expected:

* a new module object (with its own __dict__) is created for each request
* the module's __spec__ has the requested name
* the loaded module is cached in sys.modules under the requested name
* the m_index field of the shared def is not changed,
  so at least PyState_FindModule() will always look in the same place

For "basic" modules there are other quirks:

* (whether sharing a def or not) when loaded the first time,
  m_copy is set before _init_module_attrs() is called
  in importlib._bootstrap.module_from_spec(),
  so when the module is re-loaded, the previous value
  for __wpec__ (and others) is reset, possibly unexpectedly.

Generally, when multiple interpreters are involved, some of the above
gets even messier.
*/

static inline void
extensions_lock_acquire(void)
{
    PyMutex_Lock(&_PyRuntime.imports.extensions.mutex);
}

static inline void
extensions_lock_release(void)
{
    PyMutex_Unlock(&_PyRuntime.imports.extensions.mutex);
}


/* Magic for extension modules (built-in as well as dynamically
   loaded).  To prevent initializing an extension module more than
   once, we keep a static dictionary 'extensions' keyed by the tuple
   (module name, module name)  (for built-in modules) or by
   (filename, module name) (for dynamically loaded modules), containing these
   modules.  A copy of the module's dictionary is stored by calling
   fix_up_extension() immediately after the module initialization
   function succeeds.  A copy can be retrieved from there by calling
   import_find_extension().

   Modules which do support multiple initialization set their m_size
   field to a non-negative number (indicating the size of the
   module-specific state). They are still recorded in the extensions
   dictionary, to avoid loading shared libraries twice.
*/

typedef struct cached_m_dict {
    /* A shallow copy of the original module's __dict__. */
    TyObject *copied;
    /* The interpreter that owns the copy. */
    int64_t interpid;
} *cached_m_dict_t;

struct extensions_cache_value {
    TyModuleDef *def;

    /* The function used to re-initialize the module.
       This is only set for legacy (single-phase init) extension modules
       and only used for those that support multiple initializations
       (m_size >= 0).
       It is set by update_global_state_for_extension(). */
    PyModInitFunction m_init;

    /* The module's index into its interpreter's modules_by_index cache.
       This is set for all extension modules but only used for legacy ones.
       (See TyInterpreterState.modules_by_index for more info.) */
    Ty_ssize_t m_index;

    /* A copy of the module's __dict__ after the first time it was loaded.
       This is only set/used for legacy modules that do not support
       multiple initializations.
       It is set exclusively by fixup_cached_def(). */
    cached_m_dict_t m_dict;
    struct cached_m_dict _m_dict;

    _Ty_ext_module_origin origin;

#ifdef Ty_GIL_DISABLED
    /* The module's md_gil slot, for legacy modules that are reinitialized from
       m_dict rather than calling their initialization function again. */
    void *md_gil;
#endif
};

static struct extensions_cache_value *
alloc_extensions_cache_value(void)
{
    struct extensions_cache_value *value
            = TyMem_RawMalloc(sizeof(struct extensions_cache_value));
    if (value == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    *value = (struct extensions_cache_value){0};
    return value;
}

static void
free_extensions_cache_value(struct extensions_cache_value *value)
{
    TyMem_RawFree(value);
}

static Ty_ssize_t
_get_cached_module_index(struct extensions_cache_value *cached)
{
    assert(cached->m_index > 0);
    return cached->m_index;
}

static void
fixup_cached_def(struct extensions_cache_value *value)
{
    /* For the moment, the values in the def's m_base may belong
     * to another module, and we're replacing them here.  This can
     * cause problems later if the old module is reloaded.
     *
     * Also, we don't decref any old cached values first when we
     * replace them here, in case we need to restore them in the
     * near future.  Instead, the caller is responsible for wrapping
     * this up by calling cleanup_old_cached_def() or
     * restore_old_cached_def() if there was an error. */
    TyModuleDef *def = value->def;
    assert(def != NULL);

    /* We assume that all module defs are statically allocated
       and will never be freed.  Otherwise, we would incref here. */
    _Ty_SetImmortalUntracked((TyObject *)def);

    def->m_base.m_init = value->m_init;

    assert(value->m_index > 0);
    _set_module_index(def, value->m_index);

    /* Different modules can share the same def, so we can't just
     * expect m_copy to be NULL. */
    assert(def->m_base.m_copy == NULL
           || def->m_base.m_init == NULL
           || value->m_dict != NULL);
    if (value->m_dict != NULL) {
        assert(value->m_dict->copied != NULL);
        /* As noted above, we don't first decref the old value, if any. */
        def->m_base.m_copy = Ty_NewRef(value->m_dict->copied);
    }
}

static void
restore_old_cached_def(TyModuleDef *def, PyModuleDef_Base *oldbase)
{
    def->m_base = *oldbase;
}

static void
cleanup_old_cached_def(PyModuleDef_Base *oldbase)
{
    Ty_XDECREF(oldbase->m_copy);
}

static void
del_cached_def(struct extensions_cache_value *value)
{
    /* If we hadn't made the stored defs immortal, we would decref here.
       However, this decref would be problematic if the module def were
       dynamically allocated, it were the last ref, and this function
       were called with an interpreter other than the def's owner. */
    assert(value->def == NULL || _Ty_IsImmortal(value->def));

    Ty_XDECREF(value->def->m_base.m_copy);
    value->def->m_base.m_copy = NULL;
}

static int
init_cached_m_dict(struct extensions_cache_value *value, TyObject *m_dict)
{
    assert(value != NULL);
    /* This should only have been called without an m_dict already set. */
    assert(value->m_dict == NULL);
    if (m_dict == NULL) {
        return 0;
    }
    assert(TyDict_Check(m_dict));
    assert(value->origin != _Ty_ext_module_origin_CORE);

    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(!is_interpreter_isolated(interp));

    /* XXX gh-88216: The copied dict is owned by the current
     * interpreter.  That's a problem if the interpreter has
     * its own obmalloc state or if the module is successfully
     * imported into such an interpreter.  If the interpreter
     * has its own GIL then there may be data races and
     * TyImport_ClearModulesByIndex() can crash.  Normally,
     * a single-phase init module cannot be imported in an
     * isolated interpreter, but there are ways around that.
     * Hence, heere be dragons!  Ideally we would instead do
     * something like make a read-only, immortal copy of the
     * dict using TyMem_RawMalloc() and store *that* in m_copy.
     * Then we'd need to make sure to clear that when the
     * runtime is finalized, rather than in
     * TyImport_ClearModulesByIndex(). */
    TyObject *copied = TyDict_Copy(m_dict);
    if (copied == NULL) {
        /* We expect this can only be "out of memory". */
        return -1;
    }
    // XXX We may want to make the copy immortal.

    value->_m_dict = (struct cached_m_dict){
        .copied=copied,
        .interpid=TyInterpreterState_GetID(interp),
    };

    value->m_dict = &value->_m_dict;
    return 0;
}

static void
del_cached_m_dict(struct extensions_cache_value *value)
{
    if (value->m_dict != NULL) {
        assert(value->m_dict == &value->_m_dict);
        assert(value->m_dict->copied != NULL);
        /* In the future we can take advantage of m_dict->interpid
         * to decref the dict using the owning interpreter. */
        Ty_XDECREF(value->m_dict->copied);
        value->m_dict = NULL;
    }
}

static TyObject * get_core_module_dict(
        TyInterpreterState *interp, TyObject *name, TyObject *path);

static TyObject *
get_cached_m_dict(struct extensions_cache_value *value,
                  TyObject *name, TyObject *path)
{
    assert(value != NULL);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    /* It might be a core module (e.g. sys & builtins),
       for which we don't cache m_dict. */
    if (value->origin == _Ty_ext_module_origin_CORE) {
        return get_core_module_dict(interp, name, path);
    }
    assert(value->def != NULL);
    // XXX Switch to value->m_dict.
    TyObject *m_dict = value->def->m_base.m_copy;
    Ty_XINCREF(m_dict);
    return m_dict;
}

static void
del_extensions_cache_value(void *raw)
{
    struct extensions_cache_value *value = raw;
    if (value != NULL) {
        del_cached_m_dict(value);
        del_cached_def(value);
        free_extensions_cache_value(value);
    }
}

static void *
hashtable_key_from_2_strings(TyObject *str1, TyObject *str2, const char sep)
{
    const char *str1_data = _TyUnicode_AsUTF8NoNUL(str1);
    const char *str2_data = _TyUnicode_AsUTF8NoNUL(str2);
    if (str1_data == NULL || str2_data == NULL) {
        return NULL;
    }
    Ty_ssize_t str1_len = strlen(str1_data);
    Ty_ssize_t str2_len = strlen(str2_data);

    /* Make sure sep and the NULL byte won't cause an overflow. */
    assert(SIZE_MAX - str1_len - str2_len > 2);
    size_t size = str1_len + 1 + str2_len + 1;

    // XXX Use a buffer if it's a temp value (every case but "set").
    char *key = TyMem_RawMalloc(size);
    if (key == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    memcpy(key, str1_data, str1_len);
    key[str1_len] = sep;
    memcpy(key + str1_len + 1, str2_data, str2_len);
    key[size - 1] = '\0';
    assert(strlen(key) == size - 1);
    return key;
}

static Ty_uhash_t
hashtable_hash_str(const void *key)
{
    return Ty_HashBuffer(key, strlen((const char *)key));
}

static int
hashtable_compare_str(const void *key1, const void *key2)
{
    return strcmp((const char *)key1, (const char *)key2) == 0;
}

static void
hashtable_destroy_str(void *ptr)
{
    TyMem_RawFree(ptr);
}

#ifndef NDEBUG
struct hashtable_next_match_def_data {
    TyModuleDef *def;
    struct extensions_cache_value *matched;
};

static int
hashtable_next_match_def(_Ty_hashtable_t *ht,
                         const void *key, const void *value, void *user_data)
{
    if (value == NULL) {
        /* It was previously deleted. */
        return 0;
    }
    struct hashtable_next_match_def_data *data
            = (struct hashtable_next_match_def_data *)user_data;
    struct extensions_cache_value *cur
            = (struct extensions_cache_value *)value;
    if (cur->def == data->def) {
        data->matched = cur;
        return 1;
    }
    return 0;
}

static struct extensions_cache_value *
_find_cached_def(TyModuleDef *def)
{
    struct hashtable_next_match_def_data data = {0};
    (void)_Ty_hashtable_foreach(
            EXTENSIONS.hashtable, hashtable_next_match_def, &data);
    return data.matched;
}
#endif

#define HTSEP ':'

static int
_extensions_cache_init(void)
{
    _Ty_hashtable_allocator_t alloc = {TyMem_RawMalloc, TyMem_RawFree};
    EXTENSIONS.hashtable = _Ty_hashtable_new_full(
        hashtable_hash_str,
        hashtable_compare_str,
        hashtable_destroy_str,  // key
        del_extensions_cache_value,  // value
        &alloc
    );
    if (EXTENSIONS.hashtable == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    return 0;
}

static _Ty_hashtable_entry_t *
_extensions_cache_find_unlocked(TyObject *path, TyObject *name,
                                void **p_key)
{
    if (EXTENSIONS.hashtable == NULL) {
        return NULL;
    }
    void *key = hashtable_key_from_2_strings(path, name, HTSEP);
    if (key == NULL) {
        return NULL;
    }
    _Ty_hashtable_entry_t *entry =
            _Ty_hashtable_get_entry(EXTENSIONS.hashtable, key);
    if (p_key != NULL) {
        *p_key = key;
    }
    else {
        hashtable_destroy_str(key);
    }
    return entry;
}

/* This can only fail with "out of memory". */
static struct extensions_cache_value *
_extensions_cache_get(TyObject *path, TyObject *name)
{
    struct extensions_cache_value *value = NULL;
    extensions_lock_acquire();

    _Ty_hashtable_entry_t *entry =
            _extensions_cache_find_unlocked(path, name, NULL);
    if (entry == NULL) {
        /* It was never added. */
        goto finally;
    }
    value = (struct extensions_cache_value *)entry->value;

finally:
    extensions_lock_release();
    return value;
}

/* This can only fail with "out of memory". */
static struct extensions_cache_value *
_extensions_cache_set(TyObject *path, TyObject *name,
                      TyModuleDef *def, PyModInitFunction m_init,
                      Ty_ssize_t m_index, TyObject *m_dict,
                      _Ty_ext_module_origin origin, void *md_gil)
{
    struct extensions_cache_value *value = NULL;
    void *key = NULL;
    struct extensions_cache_value *newvalue = NULL;
    PyModuleDef_Base olddefbase = def->m_base;

    assert(def != NULL);
    assert(m_init == NULL || m_dict == NULL);
    /* We expect the same symbol to be used and the shared object file
     * to have remained loaded, so it must be the same pointer. */
    assert(def->m_base.m_init == NULL || def->m_base.m_init == m_init);
    /* For now we don't worry about comparing value->m_copy. */
    assert(def->m_base.m_copy == NULL || m_dict != NULL);
    assert((origin == _Ty_ext_module_origin_DYNAMIC) == (name != path));
    assert(origin != _Ty_ext_module_origin_CORE || m_dict == NULL);

    extensions_lock_acquire();

    if (EXTENSIONS.hashtable == NULL) {
        if (_extensions_cache_init() < 0) {
            goto finally;
        }
    }

    /* Create a cached value to populate for the module. */
    _Ty_hashtable_entry_t *entry =
            _extensions_cache_find_unlocked(path, name, &key);
    value = entry == NULL
        ? NULL
        : (struct extensions_cache_value *)entry->value;
    if (value != NULL) {
        /* gh-123880: If there's an existing cache value, it means a module is
         * being imported recursively from its PyInit_* or Ty_mod_* function.
         * (That function presumably handles returning a partially
         *  constructed module in such a case.)
         * We can reuse the existing cache value; it is owned by the cache.
         * (Entries get removed from it in exceptional circumstances,
         *  after interpreter shutdown, and in runtime shutdown.)
         */
        goto finally_oldvalue;
    }
    newvalue = alloc_extensions_cache_value();
    if (newvalue == NULL) {
        goto finally;
    }

    /* Populate the new cache value data. */
    *newvalue = (struct extensions_cache_value){
        .def=def,
        .m_init=m_init,
        .m_index=m_index,
        /* m_dict is set by set_cached_m_dict(). */
        .origin=origin,
#ifdef Ty_GIL_DISABLED
        .md_gil=md_gil,
#endif
    };
#ifndef Ty_GIL_DISABLED
    (void)md_gil;
#endif
    if (init_cached_m_dict(newvalue, m_dict) < 0) {
        goto finally;
    }
    fixup_cached_def(newvalue);

    if (entry == NULL) {
        /* It was never added. */
        if (_Ty_hashtable_set(EXTENSIONS.hashtable, key, newvalue) < 0) {
            TyErr_NoMemory();
            goto finally;
        }
        /* The hashtable owns the key now. */
        key = NULL;
    }
    else if (value == NULL) {
        /* It was previously deleted. */
        entry->value = newvalue;
    }
    else {
        /* We are updating the entry for an existing module. */
        /* We expect def to be static, so it must be the same pointer. */
        assert(value->def == def);
        /* We expect the same symbol to be used and the shared object file
         * to have remained loaded, so it must be the same pointer. */
        assert(value->m_init == m_init);
        /* The same module can't switch between caching __dict__ and not. */
        assert((value->m_dict == NULL) == (m_dict == NULL));
        /* This shouldn't ever happen. */
        Ty_UNREACHABLE();
    }

    value = newvalue;

finally:
    if (value == NULL) {
        restore_old_cached_def(def, &olddefbase);
        if (newvalue != NULL) {
            del_extensions_cache_value(newvalue);
        }
    }
    else {
        cleanup_old_cached_def(&olddefbase);
    }

finally_oldvalue:
    extensions_lock_release();
    if (key != NULL) {
        hashtable_destroy_str(key);
    }

    return value;
}

static void
_extensions_cache_delete(TyObject *path, TyObject *name)
{
    extensions_lock_acquire();

    if (EXTENSIONS.hashtable == NULL) {
        /* It was never added. */
        goto finally;
    }

    _Ty_hashtable_entry_t *entry =
            _extensions_cache_find_unlocked(path, name, NULL);
    if (entry == NULL) {
        /* It was never added. */
        goto finally;
    }
    if (entry->value == NULL) {
        /* It was already removed. */
        goto finally;
    }
    struct extensions_cache_value *value = entry->value;
    entry->value = NULL;

    del_extensions_cache_value(value);

finally:
    extensions_lock_release();
}

static void
_extensions_cache_clear_all(void)
{
    /* The runtime (i.e. main interpreter) must be finalizing,
       so we don't need to worry about the lock. */
    _Ty_hashtable_destroy(EXTENSIONS.hashtable);
    EXTENSIONS.hashtable = NULL;
}

#undef HTSEP


static bool
check_multi_interp_extensions(TyInterpreterState *interp)
{
    int override = OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK(interp);
    if (override < 0) {
        return false;
    }
    else if (override > 0) {
        return true;
    }
    else if (_TyInterpreterState_HasFeature(
                interp, Ty_RTFLAGS_MULTI_INTERP_EXTENSIONS)) {
        return true;
    }
    return false;
}

int
_TyImport_CheckSubinterpIncompatibleExtensionAllowed(const char *name)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (check_multi_interp_extensions(interp)) {
        assert(!_Ty_IsMainInterpreter(interp));
        TyErr_Format(TyExc_ImportError,
                     "module %s does not support loading in subinterpreters",
                     name);
        return -1;
    }
    return 0;
}

#ifdef Ty_GIL_DISABLED
int
_TyImport_CheckGILForModule(TyObject* module, TyObject *module_name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (module == NULL) {
        _TyEval_DisableGIL(tstate);
        return 0;
    }

    if (!TyModule_Check(module) ||
        ((PyModuleObject *)module)->md_gil == Ty_MOD_GIL_USED) {
        if (_TyEval_EnableGILPermanent(tstate)) {
            int warn_result = TyErr_WarnFormat(
                TyExc_RuntimeWarning,
                1,
                "The global interpreter lock (GIL) has been enabled to load "
                "module '%U', which has not declared that it can run safely "
                "without the GIL. To override this behavior and keep the GIL "
                "disabled (at your own risk), run with PYTHON_GIL=0 or -Xgil=0.",
                module_name
            );
            if (warn_result < 0) {
                return warn_result;
            }
        }

        const TyConfig *config = _TyInterpreterState_GetConfig(tstate->interp);
        if (config->enable_gil == _TyConfig_GIL_DEFAULT && config->verbose) {
            TySys_FormatStderr("# loading module '%U', which requires the GIL\n",
                               module_name);
        }
    }
    else {
        _TyEval_DisableGIL(tstate);
    }

    return 0;
}
#endif

static TyThreadState *
switch_to_main_interpreter(TyThreadState *tstate)
{
    if (_Ty_IsMainInterpreter(tstate->interp)) {
        return tstate;
    }
    TyThreadState *main_tstate = _TyThreadState_NewBound(
            _TyInterpreterState_Main(), _TyThreadState_WHENCE_EXEC);
    if (main_tstate == NULL) {
        return NULL;
    }
#ifndef NDEBUG
    TyThreadState *old_tstate = TyThreadState_Swap(main_tstate);
    assert(old_tstate == tstate);
#else
    (void)TyThreadState_Swap(main_tstate);
#endif
    return main_tstate;
}

static void
switch_back_from_main_interpreter(TyThreadState *tstate,
                                  TyThreadState *main_tstate,
                                  TyObject *tempobj)
{
    assert(main_tstate == TyThreadState_GET());
    assert(_Ty_IsMainInterpreter(main_tstate->interp));
    assert(tstate->interp != main_tstate->interp);

    /* Handle any exceptions, which we cannot propagate directly
     * to the subinterpreter. */
    if (TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_MemoryError)) {
            /* We trust it will be caught again soon. */
            TyErr_Clear();
        }
        else {
            /* Printing the exception should be sufficient. */
            TyErr_PrintEx(0);
        }
    }

    Ty_XDECREF(tempobj);

    TyThreadState_Clear(main_tstate);
    (void)TyThreadState_Swap(tstate);
    TyThreadState_Delete(main_tstate);
}

static TyObject *
get_core_module_dict(TyInterpreterState *interp,
                     TyObject *name, TyObject *path)
{
    /* Only builtin modules are core. */
    if (path == name) {
        assert(!TyErr_Occurred());
        if (TyUnicode_CompareWithASCIIString(name, "sys") == 0) {
            return Ty_NewRef(interp->sysdict_copy);
        }
        assert(!TyErr_Occurred());
        if (TyUnicode_CompareWithASCIIString(name, "builtins") == 0) {
            return Ty_NewRef(interp->builtins_copy);
        }
        assert(!TyErr_Occurred());
    }
    return NULL;
}

#ifndef NDEBUG
static inline int
is_core_module(TyInterpreterState *interp, TyObject *name, TyObject *path)
{
    /* This might be called before the core dict copies are in place,
       so we can't rely on get_core_module_dict() here. */
    if (path == name) {
        if (TyUnicode_CompareWithASCIIString(name, "sys") == 0) {
            return 1;
        }
        if (TyUnicode_CompareWithASCIIString(name, "builtins") == 0) {
            return 1;
        }
    }
    return 0;
}


static _Ty_ext_module_kind
_get_extension_kind(TyModuleDef *def, bool check_size)
{
    _Ty_ext_module_kind kind;
    if (def == NULL) {
        /* It must be a module created by reload_singlephase_extension()
         * from m_copy.  Ideally we'd do away with this case. */
        kind = _Ty_ext_module_kind_SINGLEPHASE;
    }
    else if (def->m_slots != NULL) {
        kind = _Ty_ext_module_kind_MULTIPHASE;
    }
    else if (check_size && def->m_size == -1) {
        kind = _Ty_ext_module_kind_SINGLEPHASE;
    }
    else if (def->m_base.m_init != NULL) {
        kind = _Ty_ext_module_kind_SINGLEPHASE;
    }
    else {
        // This is probably single-phase init, but a multi-phase
        // module *can* have NULL m_slots.
        kind = _Ty_ext_module_kind_UNKNOWN;
    }
    return kind;
}

/* The module might not be fully initialized yet
 * and TyModule_FromDefAndSpec() checks m_size
 * so we skip m_size. */
#define assert_multiphase_def(def)                                  \
    do {                                                            \
        _Ty_ext_module_kind kind = _get_extension_kind(def, false); \
        assert(kind == _Ty_ext_module_kind_MULTIPHASE               \
                /* m_slots can be NULL. */                          \
                || kind == _Ty_ext_module_kind_UNKNOWN);            \
    } while (0)

#define assert_singlephase_def(def)                                 \
    do {                                                            \
        _Ty_ext_module_kind kind = _get_extension_kind(def, true);  \
        assert(kind == _Ty_ext_module_kind_SINGLEPHASE              \
                || kind == _Ty_ext_module_kind_UNKNOWN);            \
    } while (0)

#define assert_singlephase(cached)                                          \
    do {                                                                    \
        _Ty_ext_module_kind kind = _get_extension_kind(cached->def, true);  \
        assert(kind == _Ty_ext_module_kind_SINGLEPHASE);                    \
    } while (0)

#else  /* defined(NDEBUG) */
#define assert_multiphase_def(def)
#define assert_singlephase_def(def)
#define assert_singlephase(cached)
#endif


struct singlephase_global_update {
    PyModInitFunction m_init;
    Ty_ssize_t m_index;
    TyObject *m_dict;
    _Ty_ext_module_origin origin;
    void *md_gil;
};

static struct extensions_cache_value *
update_global_state_for_extension(TyThreadState *tstate,
                                  TyObject *path, TyObject *name,
                                  TyModuleDef *def,
                                  struct singlephase_global_update *singlephase)
{
    struct extensions_cache_value *cached = NULL;
    PyModInitFunction m_init = NULL;
    TyObject *m_dict = NULL;

    /* Set up for _extensions_cache_set(). */
    if (singlephase == NULL) {
        assert(def->m_base.m_init == NULL);
        assert(def->m_base.m_copy == NULL);
    }
    else {
        if (singlephase->m_init != NULL) {
            assert(singlephase->m_dict == NULL);
            assert(def->m_base.m_copy == NULL);
            assert(def->m_size >= 0);
            /* Remember pointer to module init function. */
            // XXX If two modules share a def then def->m_base will
            // reflect the last one added (here) to the global cache.
            // We should prevent this somehow.  The simplest solution
            // is probably to store m_copy/m_init in the cache along
            // with the def, rather than within the def.
            m_init = singlephase->m_init;
        }
        else if (singlephase->m_dict == NULL) {
            /* It must be a core builtin module. */
            assert(is_core_module(tstate->interp, name, path));
            assert(def->m_size == -1);
            assert(def->m_base.m_copy == NULL);
            assert(def->m_base.m_init == NULL);
        }
        else {
            assert(TyDict_Check(singlephase->m_dict));
            // gh-88216: Extensions and def->m_base.m_copy can be updated
            // when the extension module doesn't support sub-interpreters.
            assert(def->m_size == -1);
            assert(!is_core_module(tstate->interp, name, path));
            assert(TyUnicode_CompareWithASCIIString(name, "sys") != 0);
            assert(TyUnicode_CompareWithASCIIString(name, "builtins") != 0);
            m_dict = singlephase->m_dict;
        }
    }

    /* Add the module's def to the global cache. */
    // XXX Why special-case the main interpreter?
    if (_Ty_IsMainInterpreter(tstate->interp) || def->m_size == -1) {
#ifndef NDEBUG
        cached = _extensions_cache_get(path, name);
        assert(cached == NULL || cached->def == def);
#endif
        cached = _extensions_cache_set(
                path, name, def, m_init, singlephase->m_index, m_dict,
                singlephase->origin, singlephase->md_gil);
        if (cached == NULL) {
            // XXX Ignore this error?  Doing so would effectively
            // mark the module as not loadable.
            return NULL;
        }
    }

    return cached;
}

/* For multi-phase init modules, the module is finished
 * by TyModule_FromDefAndSpec(). */
static int
finish_singlephase_extension(TyThreadState *tstate, TyObject *mod,
                             struct extensions_cache_value *cached,
                             TyObject *name, TyObject *modules)
{
    assert(mod != NULL && TyModule_Check(mod));
    assert(cached->def == _TyModule_GetDef(mod));

    Ty_ssize_t index = _get_cached_module_index(cached);
    if (_modules_by_index_set(tstate->interp, index, mod) < 0) {
        return -1;
    }

    if (modules != NULL) {
        if (PyObject_SetItem(modules, name, mod) < 0) {
            return -1;
        }
    }

    return 0;
}


static TyObject *
reload_singlephase_extension(TyThreadState *tstate,
                             struct extensions_cache_value *cached,
                             struct _Ty_ext_module_loader_info *info)
{
    TyModuleDef *def = cached->def;
    assert(def != NULL);
    assert_singlephase(cached);
    TyObject *mod = NULL;

    /* It may have been successfully imported previously
       in an interpreter that allows legacy modules
       but is not allowed in the current interpreter. */
    const char *name_buf = TyUnicode_AsUTF8(info->name);
    assert(name_buf != NULL);
    if (_TyImport_CheckSubinterpIncompatibleExtensionAllowed(name_buf) < 0) {
        return NULL;
    }

    TyObject *modules = get_modules_dict(tstate, true);
    if (def->m_size == -1) {
        /* Module does not support repeated initialization */
        assert(cached->m_init == NULL);
        assert(def->m_base.m_init == NULL);
        // XXX Copying the cached dict may break interpreter isolation.
        // We could solve this by temporarily acquiring the original
        // interpreter's GIL.
        TyObject *m_copy = get_cached_m_dict(cached, info->name, info->path);
        if (m_copy == NULL) {
            assert(!TyErr_Occurred());
            return NULL;
        }
        mod = import_add_module(tstate, info->name);
        if (mod == NULL) {
            Ty_DECREF(m_copy);
            return NULL;
        }
        TyObject *mdict = TyModule_GetDict(mod);
        if (mdict == NULL) {
            Ty_DECREF(m_copy);
            Ty_DECREF(mod);
            return NULL;
        }
        int rc = TyDict_Update(mdict, m_copy);
        Ty_DECREF(m_copy);
        if (rc < 0) {
            Ty_DECREF(mod);
            return NULL;
        }
#ifdef Ty_GIL_DISABLED
        if (def->m_base.m_copy != NULL) {
            // For non-core modules, fetch the GIL slot that was stored by
            // import_run_extension().
            ((PyModuleObject *)mod)->md_gil = cached->md_gil;
        }
#endif
        /* We can't set mod->md_def if it's missing,
         * because _TyImport_ClearModulesByIndex() might break
         * due to violating interpreter isolation.
         * See the note in set_cached_m_dict().
         * Until that is solved, we leave md_def set to NULL. */
        assert(_TyModule_GetDef(mod) == NULL
               || _TyModule_GetDef(mod) == def);
    }
    else {
        assert(cached->m_dict == NULL);
        assert(def->m_base.m_copy == NULL);
        // XXX Use cached->m_init.
        PyModInitFunction p0 = def->m_base.m_init;
        if (p0 == NULL) {
            assert(!TyErr_Occurred());
            return NULL;
        }
        struct _Ty_ext_module_loader_result res;
        if (_TyImport_RunModInitFunc(p0, info, &res) < 0) {
            _Ty_ext_module_loader_result_apply_error(&res, name_buf);
            return NULL;
        }
        assert(!TyErr_Occurred());
        assert(res.err == NULL);
        assert(res.kind == _Ty_ext_module_kind_SINGLEPHASE);
        mod = res.module;
        /* Tchnically, the init function could return a different module def.
         * Then we would probably need to update the global cache.
         * However, we don't expect anyone to change the def. */
        assert(res.def == def);
        _Ty_ext_module_loader_result_clear(&res);

        /* Remember the filename as the __file__ attribute */
        if (info->filename != NULL) {
            if (TyModule_AddObjectRef(mod, "__file__", info->filename) < 0) {
                TyErr_Clear(); /* Not important enough to report */
            }
        }

        if (PyObject_SetItem(modules, info->name, mod) == -1) {
            Ty_DECREF(mod);
            return NULL;
        }
    }

    Ty_ssize_t index = _get_cached_module_index(cached);
    if (_modules_by_index_set(tstate->interp, index, mod) < 0) {
        PyMapping_DelItem(modules, info->name);
        Ty_DECREF(mod);
        return NULL;
    }

    return mod;
}

static TyObject *
import_find_extension(TyThreadState *tstate,
                      struct _Ty_ext_module_loader_info *info,
                      struct extensions_cache_value **p_cached)
{
    /* Only single-phase init modules will be in the cache. */
    struct extensions_cache_value *cached
            = _extensions_cache_get(info->path, info->name);
    if (cached == NULL) {
        return NULL;
    }
    assert(cached->def != NULL);
    assert_singlephase(cached);
    *p_cached = cached;

    /* It may have been successfully imported previously
       in an interpreter that allows legacy modules
       but is not allowed in the current interpreter. */
    const char *name_buf = TyUnicode_AsUTF8(info->name);
    assert(name_buf != NULL);
    if (_TyImport_CheckSubinterpIncompatibleExtensionAllowed(name_buf) < 0) {
        return NULL;
    }

    TyObject *mod = reload_singlephase_extension(tstate, cached, info);
    if (mod == NULL) {
        return NULL;
    }

    int verbose = _TyInterpreterState_GetConfig(tstate->interp)->verbose;
    if (verbose) {
        TySys_FormatStderr("import %U # previously loaded (%R)\n",
                           info->name, info->path);
    }

    return mod;
}

static TyObject *
import_run_extension(TyThreadState *tstate, PyModInitFunction p0,
                     struct _Ty_ext_module_loader_info *info,
                     TyObject *spec, TyObject *modules)
{
    /* Core modules go through _TyImport_FixupBuiltin(). */
    assert(!is_core_module(tstate->interp, info->name, info->path));

    TyObject *mod = NULL;
    TyModuleDef *def = NULL;
    struct extensions_cache_value *cached = NULL;
    const char *name_buf = TyBytes_AS_STRING(info->name_encoded);

    /* We cannot know if the module is single-phase init or
     * multi-phase init until after we call its init function. Even
     * in isolated interpreters (that do not support single-phase init),
     * the init function will run without restriction.  For multi-phase
     * init modules that isn't a problem because the init function only
     * runs PyModuleDef_Init() on the module's def and then returns it.
     *
     * However, for single-phase init the module's init function will
     * create the module, create other objects (and allocate other
     * memory), populate it and its module state, and initialize static
     * types.  Some modules store other objects and data in global C
     * variables and register callbacks with the runtime/stdlib or
     * even external libraries (which is part of why we can't just
     * dlclose() the module in the error case).  That's a problem
     * for isolated interpreters since all of the above happens
     * and only then * will the import fail.  Memory will leak,
     * callbacks will still get used, and sometimes there
     * will be crashes (memory access violations
     * and use-after-free).
     *
     * To put it another way, if the module is single-phase init
     * then the import will probably break interpreter isolation
     * and should fail ASAP.  However, the module's init function
     * will still get run.  That means it may still store state
     * in the shared-object/DLL address space (which never gets
     * closed/cleared), including objects (e.g. static types).
     * This is a problem for isolated subinterpreters since each
     * has its own object allocator.  If the loaded shared-object
     * still holds a reference to an object after the corresponding
     * interpreter has finalized then either we must let it leak
     * or else any later use of that object by another interpreter
     * (or across multiple init-fini cycles) will crash the process.
     *
     * To avoid all of that, we make sure the module's init function
     * is always run first with the main interpreter active.  If it was
     * already the main interpreter then we can continue loading the
     * module like normal.  Otherwise, right after the init function,
     * we take care of some import state bookkeeping, switch back
     * to the subinterpreter, check for single-phase init,
     * and then continue loading like normal. */

    bool switched = false;
    /* We *could* leave in place a legacy interpreter here
     * (one that shares obmalloc/GIL with main interp),
     * but there isn't a big advantage, we anticipate
     * such interpreters will be increasingly uncommon,
     * and the code is a bit simpler if we always switch
     * to the main interpreter. */
    TyThreadState *main_tstate = switch_to_main_interpreter(tstate);
    if (main_tstate == NULL) {
        return NULL;
    }
    else if (main_tstate != tstate) {
        switched = true;
        /* In the switched case, we could play it safe
         * by getting the main interpreter's import lock here.
         * It's unlikely to matter though. */
    }

    struct _Ty_ext_module_loader_result res;
    int rc = _TyImport_RunModInitFunc(p0, info, &res);
    if (rc < 0) {
        /* We discard res.def. */
        assert(res.module == NULL);
    }
    else {
        assert(!TyErr_Occurred());
        assert(res.err == NULL);

        mod = res.module;
        res.module = NULL;
        def = res.def;
        assert(def != NULL);

        /* Do anything else that should be done
         * while still using the main interpreter. */
        if (res.kind == _Ty_ext_module_kind_SINGLEPHASE) {
            /* Remember the filename as the __file__ attribute */
            if (info->filename != NULL) {
                TyObject *filename = NULL;
                if (switched) {
                    // The original filename may be allocated by subinterpreter's
                    // obmalloc, so we create a copy here.
                    filename = _TyUnicode_Copy(info->filename);
                    if (filename == NULL) {
                        return NULL;
                    }
                } else {
                    filename = Ty_NewRef(info->filename);
                }
                // XXX There's a refleak somewhere with the filename.
                // Until we can track it down, we immortalize it.
                TyInterpreterState *interp = _TyInterpreterState_GET();
                _TyUnicode_InternImmortal(interp, &filename);

                if (TyModule_AddObjectRef(mod, "__file__", filename) < 0) {
                    TyErr_Clear(); /* Not important enough to report */
                }
            }

            /* Update global import state. */
            assert(def->m_base.m_index != 0);
            struct singlephase_global_update singlephase = {
                // XXX Modules that share a def should each get their own index,
                // whereas currently they share (which means the per-interpreter
                // cache is less reliable than it should be).
                .m_index=def->m_base.m_index,
                .origin=info->origin,
#ifdef Ty_GIL_DISABLED
                .md_gil=((PyModuleObject *)mod)->md_gil,
#endif
            };
            // gh-88216: Extensions and def->m_base.m_copy can be updated
            // when the extension module doesn't support sub-interpreters.
            if (def->m_size == -1) {
                /* We will reload from m_copy. */
                assert(def->m_base.m_init == NULL);
                singlephase.m_dict = TyModule_GetDict(mod);
                assert(singlephase.m_dict != NULL);
            }
            else {
                /* We will reload via the init function. */
                assert(def->m_size >= 0);
                assert(def->m_base.m_copy == NULL);
                singlephase.m_init = p0;
            }
            cached = update_global_state_for_extension(
                    main_tstate, info->path, info->name, def, &singlephase);
            if (cached == NULL) {
                assert(TyErr_Occurred());
                goto main_finally;
            }
        }
    }

main_finally:
    /* Switch back to the subinterpreter. */
    if (switched) {
        assert(main_tstate != tstate);
        switch_back_from_main_interpreter(tstate, main_tstate, mod);
        /* Any module we got from the init function will have to be
         * reloaded in the subinterpreter. */
        mod = NULL;
    }

    /*****************************************************************/
    /* At this point we are back to the interpreter we started with. */
    /*****************************************************************/

    /* Finally we handle the error return from _TyImport_RunModInitFunc(). */
    if (rc < 0) {
        _Ty_ext_module_loader_result_apply_error(&res, name_buf);
        goto error;
    }

    if (res.kind == _Ty_ext_module_kind_MULTIPHASE) {
        assert_multiphase_def(def);
        assert(mod == NULL);
        /* Note that we cheat a little by not repeating the calls
         * to _TyImport_GetModInitFunc() and _TyImport_RunModInitFunc(). */
        mod = TyModule_FromDefAndSpec(def, spec);
        if (mod == NULL) {
            goto error;
        }
    }
    else {
        assert(res.kind == _Ty_ext_module_kind_SINGLEPHASE);
        assert_singlephase_def(def);

        if (_TyImport_CheckSubinterpIncompatibleExtensionAllowed(name_buf) < 0) {
            goto error;
        }
        assert(!TyErr_Occurred());

        if (switched) {
            /* We switched to the main interpreter to run the init
             * function, so now we will "reload" the module from the
             * cached data using the original subinterpreter. */
            assert(mod == NULL);
            mod = reload_singlephase_extension(tstate, cached, info);
            if (mod == NULL) {
                goto error;
            }
            assert(!TyErr_Occurred());
            assert(TyModule_Check(mod));
        }
        else {
            assert(mod != NULL);
            assert(TyModule_Check(mod));

            /* Update per-interpreter import state. */
            TyObject *modules = get_modules_dict(tstate, true);
            if (finish_singlephase_extension(
                    tstate, mod, cached, info->name, modules) < 0)
            {
                goto error;
            }
        }
    }

    _Ty_ext_module_loader_result_clear(&res);
    return mod;

error:
    Ty_XDECREF(mod);
    _Ty_ext_module_loader_result_clear(&res);
    return NULL;
}


// Used in _TyImport_ClearExtension; see notes there.
static int
clear_singlephase_extension(TyInterpreterState *interp,
                            TyObject *name, TyObject *path)
{
    struct extensions_cache_value *cached = _extensions_cache_get(path, name);
    if (cached == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    TyModuleDef *def = cached->def;

    /* Clear data set when the module was initially loaded. */
    def->m_base.m_init = NULL;
    Ty_CLEAR(def->m_base.m_copy);
    def->m_base.m_index = 0;

    /* Clear the PyState_*Module() cache entry. */
    Ty_ssize_t index = _get_cached_module_index(cached);
    if (_modules_by_index_check(interp, index) == NULL) {
        if (_modules_by_index_clear_one(interp, index) < 0) {
            return -1;
        }
    }

    /* We must use the main interpreter to clean up the cache.
     * See the note in import_run_extension(). */
    TyThreadState *tstate = TyThreadState_GET();
    TyThreadState *main_tstate = switch_to_main_interpreter(tstate);
    if (main_tstate == NULL) {
        return -1;
    }

    /* Clear the cached module def. */
    _extensions_cache_delete(path, name);

    if (main_tstate != tstate) {
        switch_back_from_main_interpreter(tstate, main_tstate, NULL);
    }

    return 0;
}


/*******************/
/* builtin modules */
/*******************/

int
_TyImport_FixupBuiltin(TyThreadState *tstate, TyObject *mod, const char *name,
                       TyObject *modules)
{
    int res = -1;
    assert(mod != NULL && TyModule_Check(mod));

    TyObject *nameobj;
    nameobj = TyUnicode_InternFromString(name);
    if (nameobj == NULL) {
        return -1;
    }

    TyModuleDef *def = TyModule_GetDef(mod);
    if (def == NULL) {
        TyErr_BadInternalCall();
        goto finally;
    }

    /* We only use _TyImport_FixupBuiltin() for the core builtin modules
     * (sys and builtins).  These modules are single-phase init with no
     * module state, but we also don't populate def->m_base.m_copy
     * for them. */
    assert(is_core_module(tstate->interp, nameobj, nameobj));
    assert_singlephase_def(def);
    assert(def->m_size == -1);
    assert(def->m_base.m_copy == NULL);
    assert(def->m_base.m_index >= 0);

    /* We aren't using import_find_extension() for core modules,
     * so we have to do the extra check to make sure the module
     * isn't already in the global cache before calling
     * update_global_state_for_extension(). */
    struct extensions_cache_value *cached
            = _extensions_cache_get(nameobj, nameobj);
    if (cached == NULL) {
        struct singlephase_global_update singlephase = {
            .m_index=def->m_base.m_index,
            /* We don't want def->m_base.m_copy populated. */
            .m_dict=NULL,
            .origin=_Ty_ext_module_origin_CORE,
#ifdef Ty_GIL_DISABLED
            /* Unused when m_dict == NULL. */
            .md_gil=NULL,
#endif
        };
        cached = update_global_state_for_extension(
                tstate, nameobj, nameobj, def, &singlephase);
        if (cached == NULL) {
            goto finally;
        }
    }

    if (finish_singlephase_extension(tstate, mod, cached, nameobj, modules) < 0) {
        goto finally;
    }

    res = 0;

finally:
    Ty_DECREF(nameobj);
    return res;
}

/* Helper to test for built-in module */

static int
is_builtin(TyObject *name)
{
    int i;
    struct _inittab *inittab = INITTAB;
    for (i = 0; inittab[i].name != NULL; i++) {
        if (_TyUnicode_EqualToASCIIString(name, inittab[i].name)) {
            if (inittab[i].initfunc == NULL)
                return -1;
            else
                return 1;
        }
    }
    return 0;
}

static TyObject*
create_builtin(TyThreadState *tstate, TyObject *name, TyObject *spec)
{
    struct _Ty_ext_module_loader_info info;
    if (_Ty_ext_module_loader_info_init_for_builtin(&info, name) < 0) {
        return NULL;
    }

    struct extensions_cache_value *cached = NULL;
    TyObject *mod = import_find_extension(tstate, &info, &cached);
    if (mod != NULL) {
        assert(!_TyErr_Occurred(tstate));
        assert(cached != NULL);
        /* The module might not have md_def set in certain reload cases. */
        assert(_TyModule_GetDef(mod) == NULL
                || cached->def == _TyModule_GetDef(mod));
        assert_singlephase(cached);
        goto finally;
    }
    else if (_TyErr_Occurred(tstate)) {
        goto finally;
    }

    /* If the module was added to the global cache
     * but def->m_base.m_copy was cleared (e.g. subinterp fini)
     * then we have to do a little dance here. */
    if (cached != NULL) {
        assert(cached->def->m_base.m_copy == NULL);
        /* For now we clear the cache and move on. */
        _extensions_cache_delete(info.path, info.name);
    }

    struct _inittab *found = NULL;
    for (struct _inittab *p = INITTAB; p->name != NULL; p++) {
        if (_TyUnicode_EqualToASCIIString(info.name, p->name)) {
            found = p;
        }
    }
    if (found == NULL) {
        // not found
        mod = Ty_NewRef(Ty_None);
        goto finally;
    }

    PyModInitFunction p0 = (PyModInitFunction)found->initfunc;
    if (p0 == NULL) {
        /* Cannot re-init internal module ("sys" or "builtins") */
        assert(is_core_module(tstate->interp, info.name, info.path));
        mod = import_add_module(tstate, info.name);
        goto finally;
    }

#ifdef Ty_GIL_DISABLED
    // This call (and the corresponding call to _TyImport_CheckGILForModule())
    // would ideally be inside import_run_extension(). They are kept in the
    // callers for now because that would complicate the control flow inside
    // import_run_extension(). It should be possible to restructure
    // import_run_extension() to address this.
    _TyEval_EnableGILTransient(tstate);
#endif
    /* Now load it. */
    mod = import_run_extension(
                    tstate, p0, &info, spec, get_modules_dict(tstate, true));
#ifdef Ty_GIL_DISABLED
    if (_TyImport_CheckGILForModule(mod, info.name) < 0) {
        Ty_CLEAR(mod);
        goto finally;
    }
#endif

finally:
    _Ty_ext_module_loader_info_clear(&info);
    return mod;
}


/*****************************/
/* the builtin modules table */
/*****************************/

/* API for embedding applications that want to add their own entries
   to the table of built-in modules.  This should normally be called
   *before* Ty_Initialize().  When the table resize fails, -1 is
   returned and the existing table is unchanged.

   After a similar function by Just van Rossum. */

int
TyImport_ExtendInittab(struct _inittab *newtab)
{
    struct _inittab *p;
    size_t i, n;
    int res = 0;

    if (INITTAB != NULL) {
        Ty_FatalError("TyImport_ExtendInittab() may not be called after Ty_Initialize()");
    }

    /* Count the number of entries in both tables */
    for (n = 0; newtab[n].name != NULL; n++)
        ;
    if (n == 0)
        return 0; /* Nothing to do */
    for (i = 0; TyImport_Inittab[i].name != NULL; i++)
        ;

    /* Force default raw memory allocator to get a known allocator to be able
       to release the memory in _TyImport_Fini2() */
    /* Allocate new memory for the combined table */
    p = NULL;
    if (i + n <= SIZE_MAX / sizeof(struct _inittab) - 1) {
        size_t size = sizeof(struct _inittab) * (i + n + 1);
        p = _TyMem_DefaultRawRealloc(inittab_copy, size);
    }
    if (p == NULL) {
        res = -1;
        goto done;
    }

    /* Copy the tables into the new memory at the first call
       to TyImport_ExtendInittab(). */
    if (inittab_copy != TyImport_Inittab) {
        memcpy(p, TyImport_Inittab, (i+1) * sizeof(struct _inittab));
    }
    memcpy(p + i, newtab, (n + 1) * sizeof(struct _inittab));
    TyImport_Inittab = inittab_copy = p;
done:
    return res;
}

/* Shorthand to add a single entry given a name and a function */

int
TyImport_AppendInittab(const char *name, TyObject* (*initfunc)(void))
{
    struct _inittab newtab[2];

    if (INITTAB != NULL) {
        Ty_FatalError("TyImport_AppendInittab() may not be called after Ty_Initialize()");
    }

    memset(newtab, '\0', sizeof newtab);

    newtab[0].name = name;
    newtab[0].initfunc = initfunc;

    return TyImport_ExtendInittab(newtab);
}


/* the internal table */

static int
init_builtin_modules_table(void)
{
    size_t size;
    for (size = 0; TyImport_Inittab[size].name != NULL; size++)
        ;
    size++;

    /* Make the copy. */
    struct _inittab *copied = _TyMem_DefaultRawMalloc(size * sizeof(struct _inittab));
    if (copied == NULL) {
        return -1;
    }
    memcpy(copied, TyImport_Inittab, size * sizeof(struct _inittab));
    INITTAB = copied;
    return 0;
}

static void
fini_builtin_modules_table(void)
{
    struct _inittab *inittab = INITTAB;
    INITTAB = NULL;
    _TyMem_DefaultRawFree(inittab);
}

TyObject *
_TyImport_GetBuiltinModuleNames(void)
{
    TyObject *list = TyList_New(0);
    if (list == NULL) {
        return NULL;
    }
    struct _inittab *inittab = INITTAB;
    for (Ty_ssize_t i = 0; inittab[i].name != NULL; i++) {
        TyObject *name = TyUnicode_FromString(inittab[i].name);
        if (name == NULL) {
            Ty_DECREF(list);
            return NULL;
        }
        if (TyList_Append(list, name) < 0) {
            Ty_DECREF(name);
            Ty_DECREF(list);
            return NULL;
        }
        Ty_DECREF(name);
    }
    return list;
}


/********************/
/* the magic number */
/********************/

/* Helper for pythonrun.c -- return magic number and tag. */

long
TyImport_GetMagicNumber(void)
{
    return PYC_MAGIC_NUMBER_TOKEN;
}

extern const char * _TySys_ImplCacheTag;

const char *
TyImport_GetMagicTag(void)
{
    return _TySys_ImplCacheTag;
}


/*********************************/
/* a Python module's code object */
/*********************************/

/* Execute a code object in a module and return the module object
 * WITH INCREMENTED REFERENCE COUNT.  If an error occurs, name is
 * removed from sys.modules, to avoid leaving damaged module objects
 * in sys.modules.  The caller may wish to restore the original
 * module object (if any) in this case; TyImport_ReloadModule is an
 * example.
 *
 * Note that TyImport_ExecCodeModuleWithPathnames() is the preferred, richer
 * interface.  The other two exist primarily for backward compatibility.
 */
TyObject *
TyImport_ExecCodeModule(const char *name, TyObject *co)
{
    return TyImport_ExecCodeModuleWithPathnames(
        name, co, (char *)NULL, (char *)NULL);
}

TyObject *
TyImport_ExecCodeModuleEx(const char *name, TyObject *co, const char *pathname)
{
    return TyImport_ExecCodeModuleWithPathnames(
        name, co, pathname, (char *)NULL);
}

TyObject *
TyImport_ExecCodeModuleWithPathnames(const char *name, TyObject *co,
                                     const char *pathname,
                                     const char *cpathname)
{
    TyObject *m = NULL;
    TyObject *nameobj, *pathobj = NULL, *cpathobj = NULL, *external= NULL;

    nameobj = TyUnicode_FromString(name);
    if (nameobj == NULL)
        return NULL;

    if (cpathname != NULL) {
        cpathobj = TyUnicode_DecodeFSDefault(cpathname);
        if (cpathobj == NULL)
            goto error;
    }
    else
        cpathobj = NULL;

    if (pathname != NULL) {
        pathobj = TyUnicode_DecodeFSDefault(pathname);
        if (pathobj == NULL)
            goto error;
    }
    else if (cpathobj != NULL) {
        TyInterpreterState *interp = _TyInterpreterState_GET();

        if (interp == NULL) {
            Ty_FatalError("no current interpreter");
        }

        external= PyObject_GetAttrString(IMPORTLIB(interp),
                                         "_bootstrap_external");
        if (external != NULL) {
            pathobj = PyObject_CallMethodOneArg(
                external, &_Ty_ID(_get_sourcefile), cpathobj);
            Ty_DECREF(external);
        }
        if (pathobj == NULL)
            TyErr_Clear();
    }
    else
        pathobj = NULL;

    m = TyImport_ExecCodeModuleObject(nameobj, co, pathobj, cpathobj);
error:
    Ty_DECREF(nameobj);
    Ty_XDECREF(pathobj);
    Ty_XDECREF(cpathobj);
    return m;
}

static TyObject *
module_dict_for_exec(TyThreadState *tstate, TyObject *name)
{
    TyObject *m, *d;

    m = import_add_module(tstate, name);
    if (m == NULL)
        return NULL;
    /* If the module is being reloaded, we get the old module back
       and re-use its dict to exec the new code. */
    d = TyModule_GetDict(m);
    int r = TyDict_Contains(d, &_Ty_ID(__builtins__));
    if (r == 0) {
        r = TyDict_SetItem(d, &_Ty_ID(__builtins__), TyEval_GetBuiltins());
    }
    if (r < 0) {
        remove_module(tstate, name);
        Ty_DECREF(m);
        return NULL;
    }

    Ty_INCREF(d);
    Ty_DECREF(m);
    return d;
}

static TyObject *
exec_code_in_module(TyThreadState *tstate, TyObject *name,
                    TyObject *module_dict, TyObject *code_object)
{
    TyObject *v, *m;

    v = TyEval_EvalCode(code_object, module_dict, module_dict);
    if (v == NULL) {
        remove_module(tstate, name);
        return NULL;
    }
    Ty_DECREF(v);

    m = import_get_module(tstate, name);
    if (m == NULL && !_TyErr_Occurred(tstate)) {
        _TyErr_Format(tstate, TyExc_ImportError,
                      "Loaded module %R not found in sys.modules",
                      name);
    }

    return m;
}

TyObject*
TyImport_ExecCodeModuleObject(TyObject *name, TyObject *co, TyObject *pathname,
                              TyObject *cpathname)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *d, *external, *res;

    d = module_dict_for_exec(tstate, name);
    if (d == NULL) {
        return NULL;
    }

    if (pathname == NULL) {
        pathname = ((PyCodeObject *)co)->co_filename;
    }
    external = PyObject_GetAttrString(IMPORTLIB(tstate->interp),
                                      "_bootstrap_external");
    if (external == NULL) {
        Ty_DECREF(d);
        return NULL;
    }
    res = PyObject_CallMethodObjArgs(external, &_Ty_ID(_fix_up_module),
                                     d, name, pathname, cpathname, NULL);
    Ty_DECREF(external);
    if (res != NULL) {
        Ty_DECREF(res);
        res = exec_code_in_module(tstate, name, d, co);
    }
    Ty_DECREF(d);
    return res;
}


static void
update_code_filenames(PyCodeObject *co, TyObject *oldname, TyObject *newname)
{
    TyObject *constants, *tmp;
    Ty_ssize_t i, n;

    if (TyUnicode_Compare(co->co_filename, oldname))
        return;

    Ty_XSETREF(co->co_filename, Ty_NewRef(newname));

    constants = co->co_consts;
    n = TyTuple_GET_SIZE(constants);
    for (i = 0; i < n; i++) {
        tmp = TyTuple_GET_ITEM(constants, i);
        if (TyCode_Check(tmp))
            update_code_filenames((PyCodeObject *)tmp,
                                  oldname, newname);
    }
}

static void
update_compiled_module(PyCodeObject *co, TyObject *newname)
{
    TyObject *oldname;

    if (TyUnicode_Compare(co->co_filename, newname) == 0)
        return;

    oldname = co->co_filename;
    Ty_INCREF(oldname);
    update_code_filenames(co, oldname, newname);
    Ty_DECREF(oldname);
}


/******************/
/* frozen modules */
/******************/

/* Return true if the name is an alias.  In that case, "alias" is set
   to the original module name.  If it is an alias but the original
   module isn't known then "alias" is set to NULL while true is returned. */
static bool
resolve_module_alias(const char *name, const struct _module_alias *aliases,
                     const char **alias)
{
    const struct _module_alias *entry;
    for (entry = aliases; ; entry++) {
        if (entry->name == NULL) {
            /* It isn't an alias. */
            return false;
        }
        if (strcmp(name, entry->name) == 0) {
            if (alias != NULL) {
                *alias = entry->orig;
            }
            return true;
        }
    }
}

static bool
use_frozen(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    int override = OVERRIDE_FROZEN_MODULES(interp);
    if (override > 0) {
        return true;
    }
    else if (override < 0) {
        return false;
    }
    else {
        return interp->config.use_frozen_modules;
    }
}

static TyObject *
list_frozen_module_names(void)
{
    TyObject *names = TyList_New(0);
    if (names == NULL) {
        return NULL;
    }
    bool enabled = use_frozen();
    const struct _frozen *p;
#define ADD_MODULE(name) \
    do { \
        TyObject *nameobj = TyUnicode_FromString(name); \
        if (nameobj == NULL) { \
            goto error; \
        } \
        int res = TyList_Append(names, nameobj); \
        Ty_DECREF(nameobj); \
        if (res != 0) { \
            goto error; \
        } \
    } while(0)
    // We always use the bootstrap modules.
    for (p = _TyImport_FrozenBootstrap; ; p++) {
        if (p->name == NULL) {
            break;
        }
        ADD_MODULE(p->name);
    }
    // Frozen stdlib modules may be disabled.
    for (p = _TyImport_FrozenStdlib; ; p++) {
        if (p->name == NULL) {
            break;
        }
        if (enabled) {
            ADD_MODULE(p->name);
        }
    }
    for (p = _TyImport_FrozenTest; ; p++) {
        if (p->name == NULL) {
            break;
        }
        if (enabled) {
            ADD_MODULE(p->name);
        }
    }
#undef ADD_MODULE
    // Add any custom modules.
    if (TyImport_FrozenModules != NULL) {
        for (p = TyImport_FrozenModules; ; p++) {
            if (p->name == NULL) {
                break;
            }
            TyObject *nameobj = TyUnicode_FromString(p->name);
            if (nameobj == NULL) {
                goto error;
            }
            int found = PySequence_Contains(names, nameobj);
            if (found < 0) {
                Ty_DECREF(nameobj);
                goto error;
            }
            else if (found) {
                Ty_DECREF(nameobj);
            }
            else {
                int res = TyList_Append(names, nameobj);
                Ty_DECREF(nameobj);
                if (res != 0) {
                    goto error;
                }
            }
        }
    }
    return names;

error:
    Ty_DECREF(names);
    return NULL;
}

typedef enum {
    FROZEN_OKAY,
    FROZEN_BAD_NAME,    // The given module name wasn't valid.
    FROZEN_NOT_FOUND,   // It wasn't in TyImport_FrozenModules.
    FROZEN_DISABLED,    // -X frozen_modules=off (and not essential)
    FROZEN_EXCLUDED,    /* The TyImport_FrozenModules entry has NULL "code"
                           (module is present but marked as unimportable, stops search). */
    FROZEN_INVALID,     /* The TyImport_FrozenModules entry is bogus
                           (eg. does not contain executable code). */
} frozen_status;

static inline void
set_frozen_error(frozen_status status, TyObject *modname)
{
    const char *err = NULL;
    switch (status) {
        case FROZEN_BAD_NAME:
        case FROZEN_NOT_FOUND:
            err = "No such frozen object named %R";
            break;
        case FROZEN_DISABLED:
            err = "Frozen modules are disabled and the frozen object named %R is not essential";
            break;
        case FROZEN_EXCLUDED:
            err = "Excluded frozen object named %R";
            break;
        case FROZEN_INVALID:
            err = "Frozen object named %R is invalid";
            break;
        case FROZEN_OKAY:
            // There was no error.
            break;
        default:
            Ty_UNREACHABLE();
    }
    if (err != NULL) {
        TyObject *msg = TyUnicode_FromFormat(err, modname);
        if (msg == NULL) {
            TyErr_Clear();
        }
        TyErr_SetImportError(msg, modname, NULL);
        Ty_XDECREF(msg);
    }
}

static const struct _frozen *
look_up_frozen(const char *name)
{
    const struct _frozen *p;
    // We always use the bootstrap modules.
    for (p = _TyImport_FrozenBootstrap; ; p++) {
        if (p->name == NULL) {
            // We hit the end-of-list sentinel value.
            break;
        }
        if (strcmp(name, p->name) == 0) {
            return p;
        }
    }
    // Prefer custom modules, if any.  Frozen stdlib modules can be
    // disabled here by setting "code" to NULL in the array entry.
    if (TyImport_FrozenModules != NULL) {
        for (p = TyImport_FrozenModules; ; p++) {
            if (p->name == NULL) {
                break;
            }
            if (strcmp(name, p->name) == 0) {
                return p;
            }
        }
    }
    // Frozen stdlib modules may be disabled.
    if (use_frozen()) {
        for (p = _TyImport_FrozenStdlib; ; p++) {
            if (p->name == NULL) {
                break;
            }
            if (strcmp(name, p->name) == 0) {
                return p;
            }
        }
        for (p = _TyImport_FrozenTest; ; p++) {
            if (p->name == NULL) {
                break;
            }
            if (strcmp(name, p->name) == 0) {
                return p;
            }
        }
    }
    return NULL;
}

struct frozen_info {
    TyObject *nameobj;
    const char *data;
    Ty_ssize_t size;
    bool is_package;
    bool is_alias;
    const char *origname;
};

static frozen_status
find_frozen(TyObject *nameobj, struct frozen_info *info)
{
    if (info != NULL) {
        memset(info, 0, sizeof(*info));
    }

    if (nameobj == NULL || nameobj == Ty_None) {
        return FROZEN_BAD_NAME;
    }
    const char *name = TyUnicode_AsUTF8(nameobj);
    if (name == NULL) {
        // Note that this function previously used
        // _TyUnicode_EqualToASCIIString().  We clear the error here
        // (instead of propagating it) to match the earlier behavior
        // more closely.
        TyErr_Clear();
        return FROZEN_BAD_NAME;
    }

    const struct _frozen *p = look_up_frozen(name);
    if (p == NULL) {
        return FROZEN_NOT_FOUND;
    }
    if (info != NULL) {
        info->nameobj = nameobj;  // borrowed
        info->data = (const char *)p->code;
        info->size = p->size;
        info->is_package = p->is_package;
        if (p->size < 0) {
            // backward compatibility with negative size values
            info->size = -(p->size);
            info->is_package = true;
        }
        info->origname = name;
        info->is_alias = resolve_module_alias(name, _TyImport_FrozenAliases,
                                              &info->origname);
    }
    if (p->code == NULL) {
        /* It is frozen but marked as un-importable. */
        return FROZEN_EXCLUDED;
    }
    if (p->code[0] == '\0' || p->size == 0) {
        /* Does not contain executable code. */
        return FROZEN_INVALID;
    }
    return FROZEN_OKAY;
}

static TyObject *
unmarshal_frozen_code(TyInterpreterState *interp, struct frozen_info *info)
{
    TyObject *co = TyMarshal_ReadObjectFromString(info->data, info->size);
    if (co == NULL) {
        /* Does not contain executable code. */
        TyErr_Clear();
        set_frozen_error(FROZEN_INVALID, info->nameobj);
        return NULL;
    }
    if (!TyCode_Check(co)) {
        // We stick with TypeError for backward compatibility.
        TyErr_Format(TyExc_TypeError,
                     "frozen object %R is not a code object",
                     info->nameobj);
        Ty_DECREF(co);
        return NULL;
    }
    return co;
}


/* Initialize a frozen module.
   Return 1 for success, 0 if the module is not found, and -1 with
   an exception set if the initialization failed.
   This function is also used from frozenmain.c */

int
TyImport_ImportFrozenModuleObject(TyObject *name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *co, *m, *d = NULL;
    int err;

    struct frozen_info info;
    frozen_status status = find_frozen(name, &info);
    if (status == FROZEN_NOT_FOUND || status == FROZEN_DISABLED) {
        return 0;
    }
    else if (status == FROZEN_BAD_NAME) {
        return 0;
    }
    else if (status != FROZEN_OKAY) {
        set_frozen_error(status, name);
        return -1;
    }
    co = unmarshal_frozen_code(tstate->interp, &info);
    if (co == NULL) {
        return -1;
    }
    if (info.is_package) {
        /* Set __path__ to the empty list */
        TyObject *l;
        m = import_add_module(tstate, name);
        if (m == NULL)
            goto err_return;
        d = TyModule_GetDict(m);
        l = TyList_New(0);
        if (l == NULL) {
            Ty_DECREF(m);
            goto err_return;
        }
        err = TyDict_SetItemString(d, "__path__", l);
        Ty_DECREF(l);
        Ty_DECREF(m);
        if (err != 0)
            goto err_return;
    }
    d = module_dict_for_exec(tstate, name);
    if (d == NULL) {
        goto err_return;
    }
    m = exec_code_in_module(tstate, name, d, co);
    if (m == NULL) {
        goto err_return;
    }
    Ty_DECREF(m);
    /* Set __origname__ (consumed in FrozenImporter._setup_module()). */
    TyObject *origname;
    if (info.origname) {
        origname = TyUnicode_FromString(info.origname);
        if (origname == NULL) {
            goto err_return;
        }
    }
    else {
        origname = Ty_NewRef(Ty_None);
    }
    err = TyDict_SetItemString(d, "__origname__", origname);
    Ty_DECREF(origname);
    if (err != 0) {
        goto err_return;
    }
    Ty_DECREF(d);
    Ty_DECREF(co);
    return 1;

err_return:
    Ty_XDECREF(d);
    Ty_DECREF(co);
    return -1;
}

int
TyImport_ImportFrozenModule(const char *name)
{
    TyObject *nameobj;
    int ret;
    nameobj = TyUnicode_InternFromString(name);
    if (nameobj == NULL)
        return -1;
    ret = TyImport_ImportFrozenModuleObject(nameobj);
    Ty_DECREF(nameobj);
    return ret;
}


/*************/
/* importlib */
/*************/

/* Import the _imp extension by calling manually _imp.create_builtin() and
   _imp.exec_builtin() since importlib is not initialized yet. Initializing
   importlib requires the _imp module: this function fix the bootstrap issue.
 */
static TyObject*
bootstrap_imp(TyThreadState *tstate)
{
    TyObject *name = TyUnicode_FromString("_imp");
    if (name == NULL) {
        return NULL;
    }

    // Mock a ModuleSpec object just good enough for TyModule_FromDefAndSpec():
    // an object with just a name attribute.
    //
    // _imp.__spec__ is overridden by importlib._bootstrap._instal() anyway.
    TyObject *attrs = Ty_BuildValue("{sO}", "name", name);
    if (attrs == NULL) {
        goto error;
    }
    TyObject *spec = _PyNamespace_New(attrs);
    Ty_DECREF(attrs);
    if (spec == NULL) {
        goto error;
    }

    // Create the _imp module from its definition.
    TyObject *mod = create_builtin(tstate, name, spec);
    Ty_CLEAR(name);
    Ty_DECREF(spec);
    if (mod == NULL) {
        goto error;
    }
    assert(mod != Ty_None);  // not found

    // Execute the _imp module: call imp_module_exec().
    if (exec_builtin_or_dynamic(mod) < 0) {
        Ty_DECREF(mod);
        goto error;
    }
    return mod;

error:
    Ty_XDECREF(name);
    return NULL;
}

/* Global initializations.  Can be undone by Ty_FinalizeEx().  Don't
   call this twice without an intervening Ty_FinalizeEx() call.  When
   initializations fail, a fatal error is issued and the function does
   not return.  On return, the first thread and interpreter state have
   been created.

   Locking: you must hold the interpreter lock while calling this.
   (If the lock has not yet been initialized, that's equivalent to
   having the lock, but you cannot use multiple threads.)

*/
static int
init_importlib(TyThreadState *tstate, TyObject *sysmod)
{
    assert(!_TyErr_Occurred(tstate));

    TyInterpreterState *interp = tstate->interp;
    int verbose = _TyInterpreterState_GetConfig(interp)->verbose;

    // Import _importlib through its frozen version, _frozen_importlib.
    if (verbose) {
        TySys_FormatStderr("import _frozen_importlib # frozen\n");
    }
    if (TyImport_ImportFrozenModule("_frozen_importlib") <= 0) {
        return -1;
    }

    TyObject *importlib = TyImport_AddModuleRef("_frozen_importlib");
    if (importlib == NULL) {
        return -1;
    }
    IMPORTLIB(interp) = importlib;

    // Import the _imp module
    if (verbose) {
        TySys_FormatStderr("import _imp # builtin\n");
    }
    TyObject *imp_mod = bootstrap_imp(tstate);
    if (imp_mod == NULL) {
        return -1;
    }
    if (_TyImport_SetModuleString("_imp", imp_mod) < 0) {
        Ty_DECREF(imp_mod);
        return -1;
    }

    // Install importlib as the implementation of import
    TyObject *value = PyObject_CallMethod(importlib, "_install",
                                          "OO", sysmod, imp_mod);
    Ty_DECREF(imp_mod);
    if (value == NULL) {
        return -1;
    }
    Ty_DECREF(value);

    assert(!_TyErr_Occurred(tstate));
    return 0;
}


static int
init_importlib_external(TyInterpreterState *interp)
{
    TyObject *value;
    value = PyObject_CallMethod(IMPORTLIB(interp),
                                "_install_external_importers", "");
    if (value == NULL) {
        return -1;
    }
    Ty_DECREF(value);
    return 0;
}

TyObject *
_TyImport_GetImportlibLoader(TyInterpreterState *interp,
                             const char *loader_name)
{
    return PyObject_GetAttrString(IMPORTLIB(interp), loader_name);
}

TyObject *
_TyImport_GetImportlibExternalLoader(TyInterpreterState *interp,
                                     const char *loader_name)
{
    TyObject *bootstrap = PyObject_GetAttrString(IMPORTLIB(interp),
                                                 "_bootstrap_external");
    if (bootstrap == NULL) {
        return NULL;
    }

    TyObject *loader_type = PyObject_GetAttrString(bootstrap, loader_name);
    Ty_DECREF(bootstrap);
    return loader_type;
}

TyObject *
_TyImport_BlessMyLoader(TyInterpreterState *interp, TyObject *module_globals)
{
    TyObject *external = PyObject_GetAttrString(IMPORTLIB(interp),
                                                "_bootstrap_external");
    if (external == NULL) {
        return NULL;
    }

    TyObject *loader = PyObject_CallMethod(external, "_bless_my_loader",
                                           "O", module_globals, NULL);
    Ty_DECREF(external);
    return loader;
}

TyObject *
_TyImport_ImportlibModuleRepr(TyInterpreterState *interp, TyObject *m)
{
    return PyObject_CallMethod(IMPORTLIB(interp), "_module_repr", "O", m);
}


/*******************/

/* Return a finder object for a sys.path/pkg.__path__ item 'p',
   possibly by fetching it from the path_importer_cache dict. If it
   wasn't yet cached, traverse path_hooks until a hook is found
   that can handle the path item. Return None if no hook could;
   this tells our caller that the path based finder could not find
   a finder for this path item. Cache the result in
   path_importer_cache. */

static TyObject *
get_path_importer(TyThreadState *tstate, TyObject *path_importer_cache,
                  TyObject *path_hooks, TyObject *p)
{
    TyObject *importer;
    Ty_ssize_t j, nhooks;

    if (!TyList_Check(path_hooks)) {
        TyErr_SetString(TyExc_RuntimeError, "sys.path_hooks is not a list");
        return NULL;
    }
    if (!TyDict_Check(path_importer_cache)) {
        TyErr_SetString(TyExc_RuntimeError, "sys.path_importer_cache is not a dict");
        return NULL;
    }

    nhooks = TyList_Size(path_hooks);
    if (nhooks < 0)
        return NULL; /* Shouldn't happen */

    if (TyDict_GetItemRef(path_importer_cache, p, &importer) != 0) {
        // found or error
        return importer;
    }
    // not found
    /* set path_importer_cache[p] to None to avoid recursion */
    if (TyDict_SetItem(path_importer_cache, p, Ty_None) != 0)
        return NULL;

    for (j = 0; j < nhooks; j++) {
        TyObject *hook = TyList_GetItem(path_hooks, j);
        if (hook == NULL)
            return NULL;
        importer = PyObject_CallOneArg(hook, p);
        if (importer != NULL)
            break;

        if (!_TyErr_ExceptionMatches(tstate, TyExc_ImportError)) {
            return NULL;
        }
        _TyErr_Clear(tstate);
    }
    if (importer == NULL) {
        Py_RETURN_NONE;
    }
    if (TyDict_SetItem(path_importer_cache, p, importer) < 0) {
        Ty_DECREF(importer);
        return NULL;
    }
    return importer;
}

TyObject *
TyImport_GetImporter(TyObject *path)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *path_importer_cache = _TySys_GetRequiredAttrString("path_importer_cache");
    if (path_importer_cache == NULL) {
        return NULL;
    }
    TyObject *path_hooks = _TySys_GetRequiredAttrString("path_hooks");
    if (path_hooks == NULL) {
        Ty_DECREF(path_importer_cache);
        return NULL;
    }
    TyObject *importer = get_path_importer(tstate, path_importer_cache, path_hooks, path);
    Ty_DECREF(path_hooks);
    Ty_DECREF(path_importer_cache);
    return importer;
}


/*********************/
/* importing modules */
/*********************/

int
_TyImport_InitDefaultImportFunc(TyInterpreterState *interp)
{
    // Get the __import__ function
    TyObject *import_func;
    if (TyDict_GetItemStringRef(interp->builtins, "__import__", &import_func) <= 0) {
        return -1;
    }
    IMPORT_FUNC(interp) = import_func;
    return 0;
}

int
_TyImport_IsDefaultImportFunc(TyInterpreterState *interp, TyObject *func)
{
    return func == IMPORT_FUNC(interp);
}


/* Import a module, either built-in, frozen, or external, and return
   its module object WITH INCREMENTED REFERENCE COUNT */

TyObject *
TyImport_ImportModule(const char *name)
{
    TyObject *pname;
    TyObject *result;

    pname = TyUnicode_FromString(name);
    if (pname == NULL)
        return NULL;
    result = TyImport_Import(pname);
    Ty_DECREF(pname);
    return result;
}


/* Import a module without blocking
 *
 * At first it tries to fetch the module from sys.modules. If the module was
 * never loaded before it loads it with TyImport_ImportModule() unless another
 * thread holds the import lock. In the latter case the function raises an
 * ImportError instead of blocking.
 *
 * Returns the module object with incremented ref count.
 */
TyObject *
TyImport_ImportModuleNoBlock(const char *name)
{
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
        "TyImport_ImportModuleNoBlock() is deprecated and scheduled for "
        "removal in Python 3.15. Use TyImport_ImportModule() instead.", 1))
    {
        return NULL;
    }
    return TyImport_ImportModule(name);
}


/* Remove importlib frames from the traceback,
 * except in Verbose mode. */
static void
remove_importlib_frames(TyThreadState *tstate)
{
    const char *importlib_filename = "<frozen importlib._bootstrap>";
    const char *external_filename = "<frozen importlib._bootstrap_external>";
    const char *remove_frames = "_call_with_frames_removed";
    int always_trim = 0;
    int in_importlib = 0;
    TyObject **prev_link, **outer_link = NULL;
    TyObject *base_tb = NULL;

    /* Synopsis: if it's an ImportError, we trim all importlib chunks
       from the traceback. We always trim chunks
       which end with a call to "_call_with_frames_removed". */

    TyObject *exc = _TyErr_GetRaisedException(tstate);
    if (exc == NULL || _TyInterpreterState_GetConfig(tstate->interp)->verbose) {
        goto done;
    }

    if (TyType_IsSubtype(Ty_TYPE(exc), (TyTypeObject *) TyExc_ImportError)) {
        always_trim = 1;
    }

    assert(PyExceptionInstance_Check(exc));
    base_tb = PyException_GetTraceback(exc);
    prev_link = &base_tb;
    TyObject *tb = base_tb;
    while (tb != NULL) {
        assert(PyTraceBack_Check(tb));
        PyTracebackObject *traceback = (PyTracebackObject *)tb;
        TyObject *next = (TyObject *) traceback->tb_next;
        PyFrameObject *frame = traceback->tb_frame;
        PyCodeObject *code = TyFrame_GetCode(frame);
        int now_in_importlib;

        now_in_importlib = _TyUnicode_EqualToASCIIString(code->co_filename, importlib_filename) ||
                           _TyUnicode_EqualToASCIIString(code->co_filename, external_filename);
        if (now_in_importlib && !in_importlib) {
            /* This is the link to this chunk of importlib tracebacks */
            outer_link = prev_link;
        }
        in_importlib = now_in_importlib;

        if (in_importlib &&
            (always_trim ||
             _TyUnicode_EqualToASCIIString(code->co_name, remove_frames))) {
            Ty_XSETREF(*outer_link, Ty_XNewRef(next));
            prev_link = outer_link;
        }
        else {
            prev_link = (TyObject **) &traceback->tb_next;
        }
        Ty_DECREF(code);
        tb = next;
    }
    if (base_tb == NULL) {
        base_tb = Ty_None;
        Ty_INCREF(Ty_None);
    }
    PyException_SetTraceback(exc, base_tb);
done:
    Ty_XDECREF(base_tb);
    _TyErr_SetRaisedException(tstate, exc);
}


static TyObject *
resolve_name(TyThreadState *tstate, TyObject *name, TyObject *globals, int level)
{
    TyObject *abs_name;
    TyObject *package = NULL;
    TyObject *spec = NULL;
    Ty_ssize_t last_dot;
    TyObject *base;
    int level_up;

    if (globals == NULL) {
        _TyErr_SetString(tstate, TyExc_KeyError, "'__name__' not in globals");
        goto error;
    }
    if (!TyDict_Check(globals)) {
        _TyErr_SetString(tstate, TyExc_TypeError, "globals must be a dict");
        goto error;
    }
    if (TyDict_GetItemRef(globals, &_Ty_ID(__package__), &package) < 0) {
        goto error;
    }
    if (package == Ty_None) {
        Ty_DECREF(package);
        package = NULL;
    }
    if (TyDict_GetItemRef(globals, &_Ty_ID(__spec__), &spec) < 0) {
        goto error;
    }

    if (package != NULL) {
        if (!TyUnicode_Check(package)) {
            _TyErr_SetString(tstate, TyExc_TypeError,
                             "package must be a string");
            goto error;
        }
        else if (spec != NULL && spec != Ty_None) {
            int equal;
            TyObject *parent = PyObject_GetAttr(spec, &_Ty_ID(parent));
            if (parent == NULL) {
                goto error;
            }

            equal = PyObject_RichCompareBool(package, parent, Py_EQ);
            Ty_DECREF(parent);
            if (equal < 0) {
                goto error;
            }
            else if (equal == 0) {
                if (TyErr_WarnEx(TyExc_DeprecationWarning,
                        "__package__ != __spec__.parent", 1) < 0) {
                    goto error;
                }
            }
        }
    }
    else if (spec != NULL && spec != Ty_None) {
        package = PyObject_GetAttr(spec, &_Ty_ID(parent));
        if (package == NULL) {
            goto error;
        }
        else if (!TyUnicode_Check(package)) {
            _TyErr_SetString(tstate, TyExc_TypeError,
                             "__spec__.parent must be a string");
            goto error;
        }
    }
    else {
        if (TyErr_WarnEx(TyExc_ImportWarning,
                    "can't resolve package from __spec__ or __package__, "
                    "falling back on __name__ and __path__", 1) < 0) {
            goto error;
        }

        if (TyDict_GetItemRef(globals, &_Ty_ID(__name__), &package) < 0) {
            goto error;
        }
        if (package == NULL) {
            _TyErr_SetString(tstate, TyExc_KeyError,
                             "'__name__' not in globals");
            goto error;
        }

        if (!TyUnicode_Check(package)) {
            _TyErr_SetString(tstate, TyExc_TypeError,
                             "__name__ must be a string");
            goto error;
        }

        int haspath = TyDict_Contains(globals, &_Ty_ID(__path__));
        if (haspath < 0) {
            goto error;
        }
        if (!haspath) {
            Ty_ssize_t dot;

            dot = TyUnicode_FindChar(package, '.',
                                        0, TyUnicode_GET_LENGTH(package), -1);
            if (dot == -2) {
                goto error;
            }
            else if (dot == -1) {
                goto no_parent_error;
            }
            TyObject *substr = TyUnicode_Substring(package, 0, dot);
            if (substr == NULL) {
                goto error;
            }
            Ty_SETREF(package, substr);
        }
    }

    last_dot = TyUnicode_GET_LENGTH(package);
    if (last_dot == 0) {
        goto no_parent_error;
    }

    for (level_up = 1; level_up < level; level_up += 1) {
        last_dot = TyUnicode_FindChar(package, '.', 0, last_dot, -1);
        if (last_dot == -2) {
            goto error;
        }
        else if (last_dot == -1) {
            _TyErr_SetString(tstate, TyExc_ImportError,
                             "attempted relative import beyond top-level "
                             "package");
            goto error;
        }
    }

    Ty_XDECREF(spec);
    base = TyUnicode_Substring(package, 0, last_dot);
    Ty_DECREF(package);
    if (base == NULL || TyUnicode_GET_LENGTH(name) == 0) {
        return base;
    }

    abs_name = TyUnicode_FromFormat("%U.%U", base, name);
    Ty_DECREF(base);
    return abs_name;

  no_parent_error:
    _TyErr_SetString(tstate, TyExc_ImportError,
                     "attempted relative import "
                     "with no known parent package");

  error:
    Ty_XDECREF(spec);
    Ty_XDECREF(package);
    return NULL;
}

static TyObject *
import_find_and_load(TyThreadState *tstate, TyObject *abs_name)
{
    TyObject *mod = NULL;
    TyInterpreterState *interp = tstate->interp;
    int import_time = _TyInterpreterState_GetConfig(interp)->import_time;
#define import_level FIND_AND_LOAD(interp).import_level
#define accumulated FIND_AND_LOAD(interp).accumulated

    TyTime_t t1 = 0, accumulated_copy = accumulated;

    TyObject *sys_path, *sys_meta_path, *sys_path_hooks;
    if (_TySys_GetOptionalAttrString("path", &sys_path) < 0) {
        return NULL;
    }
    if (_TySys_GetOptionalAttrString("meta_path", &sys_meta_path) < 0) {
        Ty_XDECREF(sys_path);
        return NULL;
    }
    if (_TySys_GetOptionalAttrString("path_hooks", &sys_path_hooks) < 0) {
        Ty_XDECREF(sys_meta_path);
        Ty_XDECREF(sys_path);
        return NULL;
    }
    if (_TySys_Audit(tstate, "import", "OOOOO",
                     abs_name, Ty_None, sys_path ? sys_path : Ty_None,
                     sys_meta_path ? sys_meta_path : Ty_None,
                     sys_path_hooks ? sys_path_hooks : Ty_None) < 0) {
        Ty_XDECREF(sys_path_hooks);
        Ty_XDECREF(sys_meta_path);
        Ty_XDECREF(sys_path);
        return NULL;
    }
    Ty_XDECREF(sys_path_hooks);
    Ty_XDECREF(sys_meta_path);
    Ty_XDECREF(sys_path);


    /* XOptions is initialized after first some imports.
     * So we can't have negative cache before completed initialization.
     * Anyway, importlib._find_and_load is much slower than
     * _TyDict_GetItemIdWithError().
     */
    if (import_time) {
        _IMPORT_TIME_HEADER(interp);

        import_level++;
        // ignore error: don't block import if reading the clock fails
        (void)PyTime_PerfCounterRaw(&t1);
        accumulated = 0;
    }

    if (PyDTrace_IMPORT_FIND_LOAD_START_ENABLED())
        PyDTrace_IMPORT_FIND_LOAD_START(TyUnicode_AsUTF8(abs_name));

    mod = PyObject_CallMethodObjArgs(IMPORTLIB(interp), &_Ty_ID(_find_and_load),
                                     abs_name, IMPORT_FUNC(interp), NULL);

    if (PyDTrace_IMPORT_FIND_LOAD_DONE_ENABLED())
        PyDTrace_IMPORT_FIND_LOAD_DONE(TyUnicode_AsUTF8(abs_name),
                                       mod != NULL);

    if (import_time) {
        TyTime_t t2;
        (void)PyTime_PerfCounterRaw(&t2);
        TyTime_t cum = t2 - t1;

        import_level--;
        fprintf(stderr, "import time: %9ld | %10ld | %*s%s\n",
                (long)_TyTime_AsMicroseconds(cum - accumulated, _TyTime_ROUND_CEILING),
                (long)_TyTime_AsMicroseconds(cum, _TyTime_ROUND_CEILING),
                import_level*2, "", TyUnicode_AsUTF8(abs_name));

        accumulated = accumulated_copy + cum;
    }

    return mod;
#undef import_level
#undef accumulated
}

TyObject *
TyImport_ImportModuleLevelObject(TyObject *name, TyObject *globals,
                                 TyObject *locals, TyObject *fromlist,
                                 int level)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *abs_name = NULL;
    TyObject *final_mod = NULL;
    TyObject *mod = NULL;
    TyObject *package = NULL;
    TyInterpreterState *interp = tstate->interp;
    int has_from;

    if (name == NULL) {
        _TyErr_SetString(tstate, TyExc_ValueError, "Empty module name");
        goto error;
    }

    /* The below code is importlib.__import__() & _gcd_import(), ported to C
       for added performance. */

    if (!TyUnicode_Check(name)) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "module name must be a string");
        goto error;
    }
    if (level < 0) {
        _TyErr_SetString(tstate, TyExc_ValueError, "level must be >= 0");
        goto error;
    }

    if (level > 0) {
        abs_name = resolve_name(tstate, name, globals, level);
        if (abs_name == NULL)
            goto error;
    }
    else {  /* level == 0 */
        if (TyUnicode_GET_LENGTH(name) == 0) {
            _TyErr_SetString(tstate, TyExc_ValueError, "Empty module name");
            goto error;
        }
        abs_name = Ty_NewRef(name);
    }

    mod = import_get_module(tstate, abs_name);
    if (mod == NULL && _TyErr_Occurred(tstate)) {
        goto error;
    }

    if (mod != NULL && mod != Ty_None) {
        if (import_ensure_initialized(tstate->interp, mod, abs_name) < 0) {
            goto error;
        }
    }
    else {
        Ty_XDECREF(mod);
        mod = import_find_and_load(tstate, abs_name);
        if (mod == NULL) {
            goto error;
        }
    }

    has_from = 0;
    if (fromlist != NULL && fromlist != Ty_None) {
        has_from = PyObject_IsTrue(fromlist);
        if (has_from < 0)
            goto error;
    }
    if (!has_from) {
        Ty_ssize_t len = TyUnicode_GET_LENGTH(name);
        if (level == 0 || len > 0) {
            Ty_ssize_t dot;

            dot = TyUnicode_FindChar(name, '.', 0, len, 1);
            if (dot == -2) {
                goto error;
            }

            if (dot == -1) {
                /* No dot in module name, simple exit */
                final_mod = Ty_NewRef(mod);
                goto error;
            }

            if (level == 0) {
                TyObject *front = TyUnicode_Substring(name, 0, dot);
                if (front == NULL) {
                    goto error;
                }

                final_mod = TyImport_ImportModuleLevelObject(front, NULL, NULL, NULL, 0);
                Ty_DECREF(front);
            }
            else {
                Ty_ssize_t cut_off = len - dot;
                Ty_ssize_t abs_name_len = TyUnicode_GET_LENGTH(abs_name);
                TyObject *to_return = TyUnicode_Substring(abs_name, 0,
                                                        abs_name_len - cut_off);
                if (to_return == NULL) {
                    goto error;
                }

                final_mod = import_get_module(tstate, to_return);
                if (final_mod == NULL) {
                    if (!_TyErr_Occurred(tstate)) {
                        _TyErr_Format(tstate, TyExc_KeyError,
                                      "%R not in sys.modules as expected",
                                      to_return);
                    }
                    Ty_DECREF(to_return);
                    goto error;
                }

                Ty_DECREF(to_return);
            }
        }
        else {
            final_mod = Ty_NewRef(mod);
        }
    }
    else {
        int has_path = PyObject_HasAttrWithError(mod, &_Ty_ID(__path__));
        if (has_path < 0) {
            goto error;
        }
        if (has_path) {
            final_mod = PyObject_CallMethodObjArgs(
                        IMPORTLIB(interp), &_Ty_ID(_handle_fromlist),
                        mod, fromlist, IMPORT_FUNC(interp), NULL);
        }
        else {
            final_mod = Ty_NewRef(mod);
        }
    }

  error:
    Ty_XDECREF(abs_name);
    Ty_XDECREF(mod);
    Ty_XDECREF(package);
    if (final_mod == NULL) {
        remove_importlib_frames(tstate);
    }
    return final_mod;
}

TyObject *
TyImport_ImportModuleLevel(const char *name, TyObject *globals, TyObject *locals,
                           TyObject *fromlist, int level)
{
    TyObject *nameobj, *mod;
    nameobj = TyUnicode_FromString(name);
    if (nameobj == NULL)
        return NULL;
    mod = TyImport_ImportModuleLevelObject(nameobj, globals, locals,
                                           fromlist, level);
    Ty_DECREF(nameobj);
    return mod;
}


/* Re-import a module of any kind and return its module object, WITH
   INCREMENTED REFERENCE COUNT */

TyObject *
TyImport_ReloadModule(TyObject *m)
{
    TyObject *reloaded_module = NULL;
    TyObject *importlib = TyImport_GetModule(&_Ty_ID(importlib));
    if (importlib == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }

        importlib = TyImport_ImportModule("importlib");
        if (importlib == NULL) {
            return NULL;
        }
    }

    reloaded_module = PyObject_CallMethodOneArg(importlib, &_Ty_ID(reload), m);
    Ty_DECREF(importlib);
    return reloaded_module;
}


/* Higher-level import emulator which emulates the "import" statement
   more accurately -- it invokes the __import__() function from the
   builtins of the current globals.  This means that the import is
   done using whatever import hooks are installed in the current
   environment.
   A dummy list ["__doc__"] is passed as the 4th argument so that
   e.g. TyImport_Import(TyUnicode_FromString("win32com.client.gencache"))
   will return <module "gencache"> instead of <module "win32com">. */

TyObject *
TyImport_Import(TyObject *module_name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *globals = NULL;
    TyObject *import = NULL;
    TyObject *builtins = NULL;
    TyObject *r = NULL;

    TyObject *from_list = TyList_New(0);
    if (from_list == NULL) {
        goto err;
    }

    /* Get the builtins from current globals */
    globals = TyEval_GetGlobals();  // borrowed
    if (globals != NULL) {
        Ty_INCREF(globals);
        // XXX Use _TyEval_EnsureBuiltins()?
        builtins = PyObject_GetItem(globals, &_Ty_ID(__builtins__));
        if (builtins == NULL) {
            // XXX Fall back to interp->builtins or sys.modules['builtins']?
            goto err;
        }
    }
    else if (_TyErr_Occurred(tstate)) {
        goto err;
    }
    else {
        /* No globals -- use standard builtins, and fake globals */
        globals = TyDict_New();
        if (globals == NULL) {
            goto err;
        }
        if (_TyEval_EnsureBuiltinsWithModule(tstate, globals, &builtins) < 0) {
            goto err;
        }
    }

    /* Get the __import__ function from the builtins */
    if (TyDict_Check(builtins)) {
        import = PyObject_GetItem(builtins, &_Ty_ID(__import__));
        if (import == NULL) {
            _TyErr_SetObject(tstate, TyExc_KeyError, &_Ty_ID(__import__));
        }
    }
    else
        import = PyObject_GetAttr(builtins, &_Ty_ID(__import__));
    if (import == NULL)
        goto err;

    /* Call the __import__ function with the proper argument list
       Always use absolute import here.
       Calling for side-effect of import. */
    r = PyObject_CallFunction(import, "OOOOi", module_name, globals,
                              globals, from_list, 0, NULL);
    if (r == NULL)
        goto err;
    Ty_DECREF(r);

    r = import_get_module(tstate, module_name);
    if (r == NULL && !_TyErr_Occurred(tstate)) {
        _TyErr_SetObject(tstate, TyExc_KeyError, module_name);
    }

  err:
    Ty_XDECREF(globals);
    Ty_XDECREF(builtins);
    Ty_XDECREF(import);
    Ty_XDECREF(from_list);

    return r;
}


/*********************/
/* runtime lifecycle */
/*********************/

TyStatus
_TyImport_Init(void)
{
    if (INITTAB != NULL) {
        return _TyStatus_ERR("global import state already initialized");
    }
    if (init_builtin_modules_table() != 0) {
        return TyStatus_NoMemory();
    }
    return _TyStatus_OK();
}

void
_TyImport_Fini(void)
{
    /* Destroy the database used by _TyImport_{Fixup,Find}Extension */
    // XXX Should we actually leave them (mostly) intact, since we don't
    // ever dlclose() the module files?
    _extensions_cache_clear_all();

    /* Free memory allocated by _TyImport_Init() */
    fini_builtin_modules_table();
}

void
_TyImport_Fini2(void)
{
    // Reset TyImport_Inittab
    TyImport_Inittab = _TyImport_Inittab;

    /* Free memory allocated by TyImport_ExtendInittab() */
    _TyMem_DefaultRawFree(inittab_copy);
    inittab_copy = NULL;
}


/*************************/
/* interpreter lifecycle */
/*************************/

TyStatus
_TyImport_InitCore(TyThreadState *tstate, TyObject *sysmod, int importlib)
{
    // XXX Initialize here: interp->modules and interp->import_func.
    // XXX Initialize here: sys.modules and sys.meta_path.

    if (importlib) {
        /* This call sets up builtin and frozen import support */
        if (init_importlib(tstate, sysmod) < 0) {
            return _TyStatus_ERR("failed to initialize importlib");
        }
    }

    return _TyStatus_OK();
}

/* In some corner cases it is important to be sure that the import
   machinery has been initialized (or not cleaned up yet).  For
   example, see issue #4236 and TyModule_Create2(). */

int
_TyImport_IsInitialized(TyInterpreterState *interp)
{
    if (MODULES(interp) == NULL)
        return 0;
    return 1;
}

/* Clear the direct per-interpreter import state, if not cleared already. */
void
_TyImport_ClearCore(TyInterpreterState *interp)
{
    /* interp->modules should have been cleaned up and cleared already
       by _TyImport_FiniCore(). */
    Ty_CLEAR(MODULES(interp));
    Ty_CLEAR(MODULES_BY_INDEX(interp));
    Ty_CLEAR(IMPORTLIB(interp));
    Ty_CLEAR(IMPORT_FUNC(interp));
}

void
_TyImport_FiniCore(TyInterpreterState *interp)
{
    int verbose = _TyInterpreterState_GetConfig(interp)->verbose;

    if (_TySys_ClearAttrString(interp, "meta_path", verbose) < 0) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing sys.meta_path");
    }

    // XXX Pull in most of finalize_modules() in pylifecycle.c.

    if (_TySys_ClearAttrString(interp, "modules", verbose) < 0) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing sys.modules");
    }

    _TyImport_ClearCore(interp);
}

// XXX Add something like _TyImport_Disable() for use early in interp fini?


/* "external" imports */

static int
init_zipimport(TyThreadState *tstate, int verbose)
{
    TyObject *path_hooks = _TySys_GetRequiredAttrString("path_hooks");
    if (path_hooks == NULL) {
        return -1;
    }

    if (verbose) {
        TySys_WriteStderr("# installing zipimport hook\n");
    }

    TyObject *zipimporter = TyImport_ImportModuleAttrString("zipimport", "zipimporter");
    if (zipimporter == NULL) {
        _TyErr_Clear(tstate); /* No zipimporter object -- okay */
        if (verbose) {
            TySys_WriteStderr("# can't import zipimport.zipimporter\n");
        }
    }
    else {
        /* sys.path_hooks.insert(0, zipimporter) */
        int err = TyList_Insert(path_hooks, 0, zipimporter);
        Ty_DECREF(zipimporter);
        if (err < 0) {
            Ty_DECREF(path_hooks);
            return -1;
        }
        if (verbose) {
            TySys_WriteStderr("# installed zipimport hook\n");
        }
    }
    Ty_DECREF(path_hooks);

    return 0;
}

TyStatus
_TyImport_InitExternal(TyThreadState *tstate)
{
    int verbose = _TyInterpreterState_GetConfig(tstate->interp)->verbose;

    // XXX Initialize here: sys.path_hooks and sys.path_importer_cache.

    if (init_importlib_external(tstate->interp) != 0) {
        _TyErr_Print(tstate);
        return _TyStatus_ERR("external importer setup failed");
    }

    if (init_zipimport(tstate, verbose) != 0) {
        TyErr_Print();
        return _TyStatus_ERR("initializing zipimport failed");
    }

    return _TyStatus_OK();
}

void
_TyImport_FiniExternal(TyInterpreterState *interp)
{
    int verbose = _TyInterpreterState_GetConfig(interp)->verbose;

    // XXX Uninstall importlib metapath importers here?

    if (_TySys_ClearAttrString(interp, "path_importer_cache", verbose) < 0) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing sys.path_importer_cache");
    }
    if (_TySys_ClearAttrString(interp, "path_hooks", verbose) < 0) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "clearing sys.path_hooks");
    }
}


/******************/
/* module helpers */
/******************/

TyObject *
TyImport_ImportModuleAttr(TyObject *modname, TyObject *attrname)
{
    TyObject *mod = TyImport_Import(modname);
    if (mod == NULL) {
        return NULL;
    }
    TyObject *result = PyObject_GetAttr(mod, attrname);
    Ty_DECREF(mod);
    return result;
}

TyObject *
TyImport_ImportModuleAttrString(const char *modname, const char *attrname)
{
    TyObject *pmodname = TyUnicode_FromString(modname);
    if (pmodname == NULL) {
        return NULL;
    }
    TyObject *pattrname = TyUnicode_FromString(attrname);
    if (pattrname == NULL) {
        Ty_DECREF(pmodname);
        return NULL;
    }
    TyObject *result = TyImport_ImportModuleAttr(pmodname, pattrname);
    Ty_DECREF(pattrname);
    Ty_DECREF(pmodname);
    return result;
}


/**************/
/* the module */
/**************/

/*[clinic input]
_imp.lock_held

Return True if the import lock is currently held, else False.

On platforms without threads, return False.
[clinic start generated code]*/

static TyObject *
_imp_lock_held_impl(TyObject *module)
/*[clinic end generated code: output=8b89384b5e1963fc input=9b088f9b217d9bdf]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return TyBool_FromLong(PyMutex_IsLocked(&IMPORT_LOCK(interp).mutex));
}

/*[clinic input]
_imp.acquire_lock

Acquires the interpreter's import lock for the current thread.

This lock should be used by import hooks to ensure thread-safety when importing
modules. On platforms without threads, this function does nothing.
[clinic start generated code]*/

static TyObject *
_imp_acquire_lock_impl(TyObject *module)
/*[clinic end generated code: output=1aff58cb0ee1b026 input=4a2d4381866d5fdc]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyImport_AcquireLock(interp);
    Py_RETURN_NONE;
}

/*[clinic input]
_imp.release_lock

Release the interpreter's import lock.

On platforms without threads, this function does nothing.
[clinic start generated code]*/

static TyObject *
_imp_release_lock_impl(TyObject *module)
/*[clinic end generated code: output=7faab6d0be178b0a input=934fb11516dd778b]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (!_PyRecursiveMutex_IsLockedByCurrentThread(&IMPORT_LOCK(interp))) {
        TyErr_SetString(TyExc_RuntimeError,
                        "not holding the import lock");
        return NULL;
    }
    _TyImport_ReleaseLock(interp);
    Py_RETURN_NONE;
}


/*[clinic input]
_imp._fix_co_filename

    code: object(type="PyCodeObject *", subclass_of="&TyCode_Type")
        Code object to change.

    path: unicode
        File path to use.
    /

Changes code.co_filename to specify the passed-in file path.
[clinic start generated code]*/

static TyObject *
_imp__fix_co_filename_impl(TyObject *module, PyCodeObject *code,
                           TyObject *path)
/*[clinic end generated code: output=1d002f100235587d input=895ba50e78b82f05]*/

{
    update_compiled_module(code, path);

    Py_RETURN_NONE;
}


/*[clinic input]
_imp.create_builtin

    spec: object
    /

Create an extension module.
[clinic start generated code]*/

static TyObject *
_imp_create_builtin(TyObject *module, TyObject *spec)
/*[clinic end generated code: output=ace7ff22271e6f39 input=37f966f890384e47]*/
{
    TyThreadState *tstate = _TyThreadState_GET();

    TyObject *name = PyObject_GetAttrString(spec, "name");
    if (name == NULL) {
        return NULL;
    }

    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError,
                     "name must be string, not %.200s",
                     Ty_TYPE(name)->tp_name);
        Ty_DECREF(name);
        return NULL;
    }

    TyObject *mod = create_builtin(tstate, name, spec);
    Ty_DECREF(name);
    return mod;
}


/*[clinic input]
_imp.extension_suffixes

Returns the list of file suffixes used to identify extension modules.
[clinic start generated code]*/

static TyObject *
_imp_extension_suffixes_impl(TyObject *module)
/*[clinic end generated code: output=0bf346e25a8f0cd3 input=ecdeeecfcb6f839e]*/
{
    TyObject *list;

    list = TyList_New(0);
    if (list == NULL)
        return NULL;
#ifdef HAVE_DYNAMIC_LOADING
    const char *suffix;
    unsigned int index = 0;

    while ((suffix = _TyImport_DynLoadFiletab[index])) {
        TyObject *item = TyUnicode_FromString(suffix);
        if (item == NULL) {
            Ty_DECREF(list);
            return NULL;
        }
        if (TyList_Append(list, item) < 0) {
            Ty_DECREF(list);
            Ty_DECREF(item);
            return NULL;
        }
        Ty_DECREF(item);
        index += 1;
    }
#endif
    return list;
}

/*[clinic input]
_imp.init_frozen

    name: unicode
    /

Initializes a frozen module.
[clinic start generated code]*/

static TyObject *
_imp_init_frozen_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=fc0511ed869fd69c input=13019adfc04f3fb3]*/
{
    TyThreadState *tstate = _TyThreadState_GET();
    int ret;

    ret = TyImport_ImportFrozenModuleObject(name);
    if (ret < 0)
        return NULL;
    if (ret == 0) {
        Py_RETURN_NONE;
    }
    return import_add_module(tstate, name);
}

/*[clinic input]
_imp.find_frozen

    name: unicode
    /
    *
    withdata: bool = False

Return info about the corresponding frozen module (if there is one) or None.

The returned info (a 2-tuple):

 * data         the raw marshalled bytes
 * is_package   whether or not it is a package
 * origname     the originally frozen module's name, or None if not
                a stdlib module (this will usually be the same as
                the module's current name)
[clinic start generated code]*/

static TyObject *
_imp_find_frozen_impl(TyObject *module, TyObject *name, int withdata)
/*[clinic end generated code: output=8c1c3c7f925397a5 input=22a8847c201542fd]*/
{
    struct frozen_info info;
    frozen_status status = find_frozen(name, &info);
    if (status == FROZEN_NOT_FOUND || status == FROZEN_DISABLED) {
        Py_RETURN_NONE;
    }
    else if (status == FROZEN_BAD_NAME) {
        Py_RETURN_NONE;
    }
    else if (status != FROZEN_OKAY) {
        set_frozen_error(status, name);
        return NULL;
    }

    TyObject *data = NULL;
    if (withdata) {
        data = TyMemoryView_FromMemory((char *)info.data, info.size, PyBUF_READ);
        if (data == NULL) {
            return NULL;
        }
    }

    TyObject *origname = NULL;
    if (info.origname != NULL && info.origname[0] != '\0') {
        origname = TyUnicode_FromString(info.origname);
        if (origname == NULL) {
            Ty_XDECREF(data);
            return NULL;
        }
    }

    TyObject *result = TyTuple_Pack(3, data ? data : Ty_None,
                                    info.is_package ? Ty_True : Ty_False,
                                    origname ? origname : Ty_None);
    Ty_XDECREF(origname);
    Ty_XDECREF(data);
    return result;
}

/*[clinic input]
_imp.get_frozen_object

    name: unicode
    data as dataobj: object = None
    /

Create a code object for a frozen module.
[clinic start generated code]*/

static TyObject *
_imp_get_frozen_object_impl(TyObject *module, TyObject *name,
                            TyObject *dataobj)
/*[clinic end generated code: output=54368a673a35e745 input=034bdb88f6460b7b]*/
{
    struct frozen_info info = {0};
    Ty_buffer buf = {0};
    if (PyObject_CheckBuffer(dataobj)) {
        if (PyObject_GetBuffer(dataobj, &buf, PyBUF_SIMPLE) != 0) {
            return NULL;
        }
        info.data = (const char *)buf.buf;
        info.size = buf.len;
    }
    else if (dataobj != Ty_None) {
        _TyArg_BadArgument("get_frozen_object", "argument 2", "bytes", dataobj);
        return NULL;
    }
    else {
        frozen_status status = find_frozen(name, &info);
        if (status != FROZEN_OKAY) {
            set_frozen_error(status, name);
            return NULL;
        }
    }

    if (info.nameobj == NULL) {
        info.nameobj = name;
    }
    if (info.size == 0) {
        /* Does not contain executable code. */
        set_frozen_error(FROZEN_INVALID, name);
        return NULL;
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyObject *codeobj = unmarshal_frozen_code(interp, &info);
    if (dataobj != Ty_None) {
        PyBuffer_Release(&buf);
    }
    return codeobj;
}

/*[clinic input]
_imp.is_frozen_package

    name: unicode
    /

Returns True if the module name is of a frozen package.
[clinic start generated code]*/

static TyObject *
_imp_is_frozen_package_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=e70cbdb45784a1c9 input=81b6cdecd080fbb8]*/
{
    struct frozen_info info;
    frozen_status status = find_frozen(name, &info);
    if (status != FROZEN_OKAY && status != FROZEN_EXCLUDED) {
        set_frozen_error(status, name);
        return NULL;
    }
    return TyBool_FromLong(info.is_package);
}

/*[clinic input]
_imp.is_builtin

    name: unicode
    /

Returns True if the module name corresponds to a built-in module.
[clinic start generated code]*/

static TyObject *
_imp_is_builtin_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=3bfd1162e2d3be82 input=86befdac021dd1c7]*/
{
    return TyLong_FromLong(is_builtin(name));
}

/*[clinic input]
_imp.is_frozen

    name: unicode
    /

Returns True if the module name corresponds to a frozen module.
[clinic start generated code]*/

static TyObject *
_imp_is_frozen_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=01f408f5ec0f2577 input=7301dbca1897d66b]*/
{
    struct frozen_info info;
    frozen_status status = find_frozen(name, &info);
    if (status != FROZEN_OKAY) {
        Py_RETURN_FALSE;
    }
    Py_RETURN_TRUE;
}

/*[clinic input]
_imp._frozen_module_names

Returns the list of available frozen modules.
[clinic start generated code]*/

static TyObject *
_imp__frozen_module_names_impl(TyObject *module)
/*[clinic end generated code: output=80609ef6256310a8 input=76237fbfa94460d2]*/
{
    return list_frozen_module_names();
}

/*[clinic input]
_imp._override_frozen_modules_for_tests

    override: int
    /

(internal-only) Override TyConfig.use_frozen_modules.

(-1: "off", 1: "on", 0: no override)
See frozen_modules() in Lib/test/support/import_helper.py.
[clinic start generated code]*/

static TyObject *
_imp__override_frozen_modules_for_tests_impl(TyObject *module, int override)
/*[clinic end generated code: output=36d5cb1594160811 input=8f1f95a3ef21aec3]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    OVERRIDE_FROZEN_MODULES(interp) = override;
    Py_RETURN_NONE;
}

/*[clinic input]
_imp._override_multi_interp_extensions_check

    override: int
    /

(internal-only) Override PyInterpreterConfig.check_multi_interp_extensions.

(-1: "never", 1: "always", 0: no override)
[clinic start generated code]*/

static TyObject *
_imp__override_multi_interp_extensions_check_impl(TyObject *module,
                                                  int override)
/*[clinic end generated code: output=3ff043af52bbf280 input=e086a2ea181f92ae]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (_Ty_IsMainInterpreter(interp)) {
        TyErr_SetString(TyExc_RuntimeError,
                        "_imp._override_multi_interp_extensions_check() "
                        "cannot be used in the main interpreter");
        return NULL;
    }
#ifdef Ty_GIL_DISABLED
    TyErr_SetString(TyExc_RuntimeError,
                    "_imp._override_multi_interp_extensions_check() "
                    "cannot be used in the free-threaded build");
    return NULL;
#else
    int oldvalue = OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK(interp);
    OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK(interp) = override;
    return TyLong_FromLong(oldvalue);
#endif
}

#ifdef HAVE_DYNAMIC_LOADING

/*[clinic input]
_imp.create_dynamic

    spec: object
    file: object = NULL
    /

Create an extension module.
[clinic start generated code]*/

static TyObject *
_imp_create_dynamic_impl(TyObject *module, TyObject *spec, TyObject *file)
/*[clinic end generated code: output=83249b827a4fde77 input=c31b954f4cf4e09d]*/
{
    TyObject *mod = NULL;
    TyThreadState *tstate = _TyThreadState_GET();

    struct _Ty_ext_module_loader_info info;
    if (_Ty_ext_module_loader_info_init_from_spec(&info, spec) < 0) {
        return NULL;
    }

    struct extensions_cache_value *cached = NULL;
    mod = import_find_extension(tstate, &info, &cached);
    if (mod != NULL) {
        assert(!_TyErr_Occurred(tstate));
        assert(cached != NULL);
        /* The module might not have md_def set in certain reload cases. */
        assert(_TyModule_GetDef(mod) == NULL
                || cached->def == _TyModule_GetDef(mod));
        assert_singlephase(cached);
        goto finally;
    }
    else if (_TyErr_Occurred(tstate)) {
        goto finally;
    }
    /* Otherwise it must be multi-phase init or the first time it's loaded. */

    /* If the module was added to the global cache
     * but def->m_base.m_copy was cleared (e.g. subinterp fini)
     * then we have to do a little dance here. */
    if (cached != NULL) {
        assert(cached->def->m_base.m_copy == NULL);
        /* For now we clear the cache and move on. */
        _extensions_cache_delete(info.path, info.name);
    }

    if (TySys_Audit("import", "OOOOO", info.name, info.filename,
                    Ty_None, Ty_None, Ty_None) < 0)
    {
        goto finally;
    }

    /* We would move this (and the fclose() below) into
     * _TyImport_GetModInitFunc(), but it isn't clear if the intervening
     * code relies on fp still being open. */
    FILE *fp;
    if (file != NULL) {
        fp = Ty_fopen(info.filename, "r");
        if (fp == NULL) {
            goto finally;
        }
    }
    else {
        fp = NULL;
    }

    PyModInitFunction p0 = _TyImport_GetModInitFunc(&info, fp);
    if (p0 == NULL) {
        goto finally;
    }

#ifdef Ty_GIL_DISABLED
    // This call (and the corresponding call to _TyImport_CheckGILForModule())
    // would ideally be inside import_run_extension(). They are kept in the
    // callers for now because that would complicate the control flow inside
    // import_run_extension(). It should be possible to restructure
    // import_run_extension() to address this.
    _TyEval_EnableGILTransient(tstate);
#endif
    mod = import_run_extension(
                    tstate, p0, &info, spec, get_modules_dict(tstate, true));
#ifdef Ty_GIL_DISABLED
    if (_TyImport_CheckGILForModule(mod, info.name) < 0) {
        Ty_CLEAR(mod);
        goto finally;
    }
#endif

    // XXX Shouldn't this happen in the error cases too (i.e. in "finally")?
    if (fp) {
        fclose(fp);
    }

finally:
    _Ty_ext_module_loader_info_clear(&info);
    return mod;
}

/*[clinic input]
_imp.exec_dynamic -> int

    mod: object
    /

Initialize an extension module.
[clinic start generated code]*/

static int
_imp_exec_dynamic_impl(TyObject *module, TyObject *mod)
/*[clinic end generated code: output=f5720ac7b465877d input=9fdbfcb250280d3a]*/
{
    return exec_builtin_or_dynamic(mod);
}


#endif /* HAVE_DYNAMIC_LOADING */

/*[clinic input]
_imp.exec_builtin -> int

    mod: object
    /

Initialize a built-in module.
[clinic start generated code]*/

static int
_imp_exec_builtin_impl(TyObject *module, TyObject *mod)
/*[clinic end generated code: output=0262447b240c038e input=7beed5a2f12a60ca]*/
{
    return exec_builtin_or_dynamic(mod);
}

/*[clinic input]
_imp.source_hash

    key: long
    source: Ty_buffer
[clinic start generated code]*/

static TyObject *
_imp_source_hash_impl(TyObject *module, long key, Ty_buffer *source)
/*[clinic end generated code: output=edb292448cf399ea input=9aaad1e590089789]*/
{
    union {
        uint64_t x;
        char data[sizeof(uint64_t)];
    } hash;
    hash.x = _Ty_KeyedHash((uint64_t)key, source->buf, source->len);
#if !PY_LITTLE_ENDIAN
    // Force to little-endian. There really ought to be a succinct standard way
    // to do this.
    for (size_t i = 0; i < sizeof(hash.data)/2; i++) {
        char tmp = hash.data[i];
        hash.data[i] = hash.data[sizeof(hash.data) - i - 1];
        hash.data[sizeof(hash.data) - i - 1] = tmp;
    }
#endif
    return TyBytes_FromStringAndSize(hash.data, sizeof(hash.data));
}


TyDoc_STRVAR(doc_imp,
"(Extremely) low-level import machinery bits as used by importlib.");

static TyMethodDef imp_methods[] = {
    _IMP_EXTENSION_SUFFIXES_METHODDEF
    _IMP_LOCK_HELD_METHODDEF
    _IMP_ACQUIRE_LOCK_METHODDEF
    _IMP_RELEASE_LOCK_METHODDEF
    _IMP_FIND_FROZEN_METHODDEF
    _IMP_GET_FROZEN_OBJECT_METHODDEF
    _IMP_IS_FROZEN_PACKAGE_METHODDEF
    _IMP_CREATE_BUILTIN_METHODDEF
    _IMP_INIT_FROZEN_METHODDEF
    _IMP_IS_BUILTIN_METHODDEF
    _IMP_IS_FROZEN_METHODDEF
    _IMP__FROZEN_MODULE_NAMES_METHODDEF
    _IMP__OVERRIDE_FROZEN_MODULES_FOR_TESTS_METHODDEF
    _IMP__OVERRIDE_MULTI_INTERP_EXTENSIONS_CHECK_METHODDEF
    _IMP_CREATE_DYNAMIC_METHODDEF
    _IMP_EXEC_DYNAMIC_METHODDEF
    _IMP_EXEC_BUILTIN_METHODDEF
    _IMP__FIX_CO_FILENAME_METHODDEF
    _IMP_SOURCE_HASH_METHODDEF
    {NULL, NULL}  /* sentinel */
};


static int
imp_module_exec(TyObject *module)
{
    const wchar_t *mode = _Ty_GetConfig()->check_hash_pycs_mode;
    TyObject *pyc_mode = TyUnicode_FromWideChar(mode, -1);
    if (TyModule_Add(module, "check_hash_based_pycs", pyc_mode) < 0) {
        return -1;
    }

    if (TyModule_AddIntConstant(
            module, "pyc_magic_number_token", PYC_MAGIC_NUMBER_TOKEN) < 0)
    {
        return -1;
    }

    return 0;
}


static PyModuleDef_Slot imp_slots[] = {
    {Ty_mod_exec, imp_module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef imp_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_imp",
    .m_doc = doc_imp,
    .m_size = 0,
    .m_methods = imp_methods,
    .m_slots = imp_slots,
};

PyMODINIT_FUNC
PyInit__imp(void)
{
    return PyModuleDef_Init(&imp_module);
}
