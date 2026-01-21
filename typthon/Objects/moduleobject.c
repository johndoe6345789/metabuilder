/* Module object implementation */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_dict.h"          // _TyDict_EnablePerThreadRefcounting()
#include "pycore_fileutils.h"     // _Ty_wgetcwd
#include "pycore_import.h"        // _TyImport_GetNextModuleIndex()
#include "pycore_interp.h"        // TyInterpreterState.importlib
#include "pycore_long.h"          // _TyLong_GetOne()
#include "pycore_modsupport.h"    // _TyModule_CreateInitialized()
#include "pycore_moduleobject.h"  // _TyModule_GetDef()
#include "pycore_object.h"        // _TyType_AllocNoTrack
#include "pycore_pyerrors.h"      // _TyErr_FormatFromCause()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttrString()
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include "osdefs.h"               // MAXPATHLEN


#define _TyModule_CAST(op) \
    (assert(TyModule_Check(op)), _Py_CAST(PyModuleObject*, (op)))


static TyMemberDef module_members[] = {
    {"__dict__", _Ty_T_OBJECT, offsetof(PyModuleObject, md_dict), Py_READONLY},
    {0}
};


TyTypeObject PyModuleDef_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "moduledef",                                /* tp_name */
    sizeof(TyModuleDef),                        /* tp_basicsize */
    0,                                          /* tp_itemsize */
};


int
_TyModule_IsExtension(TyObject *obj)
{
    if (!TyModule_Check(obj)) {
        return 0;
    }
    PyModuleObject *module = (PyModuleObject*)obj;

    TyModuleDef *def = module->md_def;
    return (def != NULL && def->m_methods != NULL);
}


TyObject*
PyModuleDef_Init(TyModuleDef* def)
{
    assert(PyModuleDef_Type.tp_flags & Ty_TPFLAGS_READY);
    if (def->m_base.m_index == 0) {
        Ty_SET_REFCNT(def, 1);
        Ty_SET_TYPE(def, &PyModuleDef_Type);
        def->m_base.m_index = _TyImport_GetNextModuleIndex();
    }
    return (TyObject*)def;
}

static int
module_init_dict(PyModuleObject *mod, TyObject *md_dict,
                 TyObject *name, TyObject *doc)
{
    assert(md_dict != NULL);
    if (doc == NULL)
        doc = Ty_None;

    if (TyDict_SetItem(md_dict, &_Ty_ID(__name__), name) != 0)
        return -1;
    if (TyDict_SetItem(md_dict, &_Ty_ID(__doc__), doc) != 0)
        return -1;
    if (TyDict_SetItem(md_dict, &_Ty_ID(__package__), Ty_None) != 0)
        return -1;
    if (TyDict_SetItem(md_dict, &_Ty_ID(__loader__), Ty_None) != 0)
        return -1;
    if (TyDict_SetItem(md_dict, &_Ty_ID(__spec__), Ty_None) != 0)
        return -1;
    if (TyUnicode_CheckExact(name)) {
        Ty_XSETREF(mod->md_name, Ty_NewRef(name));
    }

    return 0;
}

static PyModuleObject *
new_module_notrack(TyTypeObject *mt)
{
    PyModuleObject *m;
    m = (PyModuleObject *)_TyType_AllocNoTrack(mt, 0);
    if (m == NULL)
        return NULL;
    m->md_def = NULL;
    m->md_state = NULL;
    m->md_weaklist = NULL;
    m->md_name = NULL;
    m->md_dict = TyDict_New();
    if (m->md_dict == NULL) {
        Ty_DECREF(m);
        return NULL;
    }
    return m;
}

static void
track_module(PyModuleObject *m)
{
    _TyDict_EnablePerThreadRefcounting(m->md_dict);
    _TyObject_SetDeferredRefcount((TyObject *)m);
    PyObject_GC_Track(m);
}

static TyObject *
new_module(TyTypeObject *mt, TyObject *args, TyObject *kws)
{
    PyModuleObject *m = new_module_notrack(mt);
    if (m != NULL) {
        track_module(m);
    }
    return (TyObject *)m;
}

TyObject *
TyModule_NewObject(TyObject *name)
{
    PyModuleObject *m = new_module_notrack(&TyModule_Type);
    if (m == NULL)
        return NULL;
    if (module_init_dict(m, m->md_dict, name, NULL) != 0)
        goto fail;
    track_module(m);
    return (TyObject *)m;

 fail:
    Ty_DECREF(m);
    return NULL;
}

TyObject *
TyModule_New(const char *name)
{
    TyObject *nameobj, *module;
    nameobj = TyUnicode_FromString(name);
    if (nameobj == NULL)
        return NULL;
    module = TyModule_NewObject(nameobj);
    Ty_DECREF(nameobj);
    return module;
}

/* Check API/ABI version
 * Issues a warning on mismatch, which is usually not fatal.
 * Returns 0 if an exception is raised.
 */
static int
check_api_version(const char *name, int module_api_version)
{
    if (module_api_version != PYTHON_API_VERSION && module_api_version != PYTHON_ABI_VERSION) {
        int err;
        err = TyErr_WarnFormat(TyExc_RuntimeWarning, 1,
            "Python C API version mismatch for module %.100s: "
            "This Python has API version %d, module %.100s has version %d.",
             name,
             PYTHON_API_VERSION, name, module_api_version);
        if (err)
            return 0;
    }
    return 1;
}

static int
_add_methods_to_object(TyObject *module, TyObject *name, TyMethodDef *functions)
{
    TyObject *func;
    TyMethodDef *fdef;

    for (fdef = functions; fdef->ml_name != NULL; fdef++) {
        if ((fdef->ml_flags & METH_CLASS) ||
            (fdef->ml_flags & METH_STATIC)) {
            TyErr_SetString(TyExc_ValueError,
                            "module functions cannot set"
                            " METH_CLASS or METH_STATIC");
            return -1;
        }
        func = PyCFunction_NewEx(fdef, (TyObject*)module, name);
        if (func == NULL) {
            return -1;
        }
        _TyObject_SetDeferredRefcount(func);
        if (PyObject_SetAttrString(module, fdef->ml_name, func) != 0) {
            Ty_DECREF(func);
            return -1;
        }
        Ty_DECREF(func);
    }

    return 0;
}

TyObject *
TyModule_Create2(TyModuleDef* module, int module_api_version)
{
    if (!_TyImport_IsInitialized(_TyInterpreterState_GET())) {
        TyErr_SetString(TyExc_SystemError,
                        "Python import machinery not initialized");
        return NULL;
    }
    return _TyModule_CreateInitialized(module, module_api_version);
}

TyObject *
_TyModule_CreateInitialized(TyModuleDef* module, int module_api_version)
{
    const char* name;
    PyModuleObject *m;

    if (!PyModuleDef_Init(module))
        return NULL;
    name = module->m_name;
    if (!check_api_version(name, module_api_version)) {
        return NULL;
    }
    if (module->m_slots) {
        TyErr_Format(
            TyExc_SystemError,
            "module %s: TyModule_Create is incompatible with m_slots", name);
        return NULL;
    }
    name = _TyImport_ResolveNameWithPackageContext(name);

    m = (PyModuleObject*)TyModule_New(name);
    if (m == NULL)
        return NULL;

    if (module->m_size > 0) {
        m->md_state = TyMem_Malloc(module->m_size);
        if (!m->md_state) {
            TyErr_NoMemory();
            Ty_DECREF(m);
            return NULL;
        }
        memset(m->md_state, 0, module->m_size);
    }

    if (module->m_methods != NULL) {
        if (TyModule_AddFunctions((TyObject *) m, module->m_methods) != 0) {
            Ty_DECREF(m);
            return NULL;
        }
    }
    if (module->m_doc != NULL) {
        if (TyModule_SetDocString((TyObject *) m, module->m_doc) != 0) {
            Ty_DECREF(m);
            return NULL;
        }
    }
    m->md_def = module;
#ifdef Ty_GIL_DISABLED
    m->md_gil = Ty_MOD_GIL_USED;
#endif
    return (TyObject*)m;
}

TyObject *
TyModule_FromDefAndSpec2(TyModuleDef* def, TyObject *spec, int module_api_version)
{
    PyModuleDef_Slot* cur_slot;
    TyObject *(*create)(TyObject *, TyModuleDef*) = NULL;
    TyObject *nameobj;
    TyObject *m = NULL;
    int has_multiple_interpreters_slot = 0;
    void *multiple_interpreters = (void *)0;
    int has_gil_slot = 0;
    void *gil_slot = Ty_MOD_GIL_USED;
    int has_execution_slots = 0;
    const char *name;
    int ret;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    PyModuleDef_Init(def);

    nameobj = PyObject_GetAttrString(spec, "name");
    if (nameobj == NULL) {
        return NULL;
    }
    name = TyUnicode_AsUTF8(nameobj);
    if (name == NULL) {
        goto error;
    }

    if (!check_api_version(name, module_api_version)) {
        goto error;
    }

    if (def->m_size < 0) {
        TyErr_Format(
            TyExc_SystemError,
            "module %s: m_size may not be negative for multi-phase initialization",
            name);
        goto error;
    }

    for (cur_slot = def->m_slots; cur_slot && cur_slot->slot; cur_slot++) {
        switch (cur_slot->slot) {
            case Ty_mod_create:
                if (create) {
                    TyErr_Format(
                        TyExc_SystemError,
                        "module %s has multiple create slots",
                        name);
                    goto error;
                }
                create = cur_slot->value;
                break;
            case Ty_mod_exec:
                has_execution_slots = 1;
                break;
            case Ty_mod_multiple_interpreters:
                if (has_multiple_interpreters_slot) {
                    TyErr_Format(
                        TyExc_SystemError,
                        "module %s has more than one 'multiple interpreters' slots",
                        name);
                    goto error;
                }
                multiple_interpreters = cur_slot->value;
                has_multiple_interpreters_slot = 1;
                break;
            case Ty_mod_gil:
                if (has_gil_slot) {
                    TyErr_Format(
                       TyExc_SystemError,
                       "module %s has more than one 'gil' slot",
                       name);
                    goto error;
                }
                gil_slot = cur_slot->value;
                has_gil_slot = 1;
                break;
            default:
                assert(cur_slot->slot < 0 || cur_slot->slot > _Ty_mod_LAST_SLOT);
                TyErr_Format(
                    TyExc_SystemError,
                    "module %s uses unknown slot ID %i",
                    name, cur_slot->slot);
                goto error;
        }
    }

    /* By default, multi-phase init modules are expected
       to work under multiple interpreters. */
    if (!has_multiple_interpreters_slot) {
        multiple_interpreters = Ty_MOD_MULTIPLE_INTERPRETERS_SUPPORTED;
    }
    if (multiple_interpreters == Ty_MOD_MULTIPLE_INTERPRETERS_NOT_SUPPORTED) {
        if (!_Ty_IsMainInterpreter(interp)
            && _TyImport_CheckSubinterpIncompatibleExtensionAllowed(name) < 0)
        {
            goto error;
        }
    }
    else if (multiple_interpreters != Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED
             && interp->ceval.own_gil
             && !_Ty_IsMainInterpreter(interp)
             && _TyImport_CheckSubinterpIncompatibleExtensionAllowed(name) < 0)
    {
        goto error;
    }

    if (create) {
        m = create(spec, def);
        if (m == NULL) {
            if (!TyErr_Occurred()) {
                TyErr_Format(
                    TyExc_SystemError,
                    "creation of module %s failed without setting an exception",
                    name);
            }
            goto error;
        } else {
            if (TyErr_Occurred()) {
                _TyErr_FormatFromCause(
                    TyExc_SystemError,
                    "creation of module %s raised unreported exception",
                    name);
                goto error;
            }
        }
    } else {
        m = TyModule_NewObject(nameobj);
        if (m == NULL) {
            goto error;
        }
    }

    if (TyModule_Check(m)) {
        ((PyModuleObject*)m)->md_state = NULL;
        ((PyModuleObject*)m)->md_def = def;
#ifdef Ty_GIL_DISABLED
        ((PyModuleObject*)m)->md_gil = gil_slot;
#else
        (void)gil_slot;
#endif
    } else {
        if (def->m_size > 0 || def->m_traverse || def->m_clear || def->m_free) {
            TyErr_Format(
                TyExc_SystemError,
                "module %s is not a module object, but requests module state",
                name);
            goto error;
        }
        if (has_execution_slots) {
            TyErr_Format(
                TyExc_SystemError,
                "module %s specifies execution slots, but did not create "
                    "a ModuleType instance",
                name);
            goto error;
        }
    }

    if (def->m_methods != NULL) {
        ret = _add_methods_to_object(m, nameobj, def->m_methods);
        if (ret != 0) {
            goto error;
        }
    }

    if (def->m_doc != NULL) {
        ret = TyModule_SetDocString(m, def->m_doc);
        if (ret != 0) {
            goto error;
        }
    }

    Ty_DECREF(nameobj);
    return m;

error:
    Ty_DECREF(nameobj);
    Ty_XDECREF(m);
    return NULL;
}

#ifdef Ty_GIL_DISABLED
int
PyUnstable_Module_SetGIL(TyObject *module, void *gil)
{
    if (!TyModule_Check(module)) {
        TyErr_BadInternalCall();
        return -1;
    }
    ((PyModuleObject *)module)->md_gil = gil;
    return 0;
}
#endif

int
TyModule_ExecDef(TyObject *module, TyModuleDef *def)
{
    PyModuleDef_Slot *cur_slot;
    const char *name;
    int ret;

    name = TyModule_GetName(module);
    if (name == NULL) {
        return -1;
    }

    if (def->m_size >= 0) {
        PyModuleObject *md = (PyModuleObject*)module;
        if (md->md_state == NULL) {
            /* Always set a state pointer; this serves as a marker to skip
             * multiple initialization (importlib.reload() is no-op) */
            md->md_state = TyMem_Malloc(def->m_size);
            if (!md->md_state) {
                TyErr_NoMemory();
                return -1;
            }
            memset(md->md_state, 0, def->m_size);
        }
    }

    if (def->m_slots == NULL) {
        return 0;
    }

    for (cur_slot = def->m_slots; cur_slot && cur_slot->slot; cur_slot++) {
        switch (cur_slot->slot) {
            case Ty_mod_create:
                /* handled in TyModule_FromDefAndSpec2 */
                break;
            case Ty_mod_exec:
                ret = ((int (*)(TyObject *))cur_slot->value)(module);
                if (ret != 0) {
                    if (!TyErr_Occurred()) {
                        TyErr_Format(
                            TyExc_SystemError,
                            "execution of module %s failed without setting an exception",
                            name);
                    }
                    return -1;
                }
                if (TyErr_Occurred()) {
                    _TyErr_FormatFromCause(
                        TyExc_SystemError,
                        "execution of module %s raised unreported exception",
                        name);
                    return -1;
                }
                break;
            case Ty_mod_multiple_interpreters:
            case Ty_mod_gil:
                /* handled in TyModule_FromDefAndSpec2 */
                break;
            default:
                TyErr_Format(
                    TyExc_SystemError,
                    "module %s initialized with unknown slot %i",
                    name, cur_slot->slot);
                return -1;
        }
    }
    return 0;
}

int
TyModule_AddFunctions(TyObject *m, TyMethodDef *functions)
{
    int res;
    TyObject *name = TyModule_GetNameObject(m);
    if (name == NULL) {
        return -1;
    }

    res = _add_methods_to_object(m, name, functions);
    Ty_DECREF(name);
    return res;
}

int
TyModule_SetDocString(TyObject *m, const char *doc)
{
    TyObject *v;

    v = TyUnicode_FromString(doc);
    if (v == NULL || PyObject_SetAttr(m, &_Ty_ID(__doc__), v) != 0) {
        Ty_XDECREF(v);
        return -1;
    }
    Ty_DECREF(v);
    return 0;
}

TyObject *
TyModule_GetDict(TyObject *m)
{
    if (!TyModule_Check(m)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return _TyModule_GetDict(m);  // borrowed reference
}

TyObject*
TyModule_GetNameObject(TyObject *mod)
{
    if (!TyModule_Check(mod)) {
        TyErr_BadArgument();
        return NULL;
    }
    TyObject *dict = ((PyModuleObject *)mod)->md_dict;  // borrowed reference
    if (dict == NULL || !TyDict_Check(dict)) {
        goto error;
    }
    TyObject *name;
    if (TyDict_GetItemRef(dict, &_Ty_ID(__name__), &name) <= 0) {
        // error or not found
        goto error;
    }
    if (!TyUnicode_Check(name)) {
        Ty_DECREF(name);
        goto error;
    }
    return name;

error:
    if (!TyErr_Occurred()) {
        TyErr_SetString(TyExc_SystemError, "nameless module");
    }
    return NULL;
}

const char *
TyModule_GetName(TyObject *m)
{
    TyObject *name = TyModule_GetNameObject(m);
    if (name == NULL) {
        return NULL;
    }
    assert(Ty_REFCNT(name) >= 2);
    Ty_DECREF(name);   /* module dict has still a reference */
    return TyUnicode_AsUTF8(name);
}

TyObject*
_TyModule_GetFilenameObject(TyObject *mod)
{
    // We return None to indicate "not found" or "bogus".
    if (!TyModule_Check(mod)) {
        TyErr_BadArgument();
        return NULL;
    }
    TyObject *dict = ((PyModuleObject *)mod)->md_dict;  // borrowed reference
    if (dict == NULL) {
        // The module has been tampered with.
        Py_RETURN_NONE;
    }
    TyObject *fileobj;
    int res = TyDict_GetItemRef(dict, &_Ty_ID(__file__), &fileobj);
    if (res < 0) {
        return NULL;
    }
    if (res == 0) {
        // __file__ isn't set.  There are several reasons why this might
        // be so, most of them valid reasons.  If it's the __main__
        // module then we're running the REPL or with -c.  Otherwise
        // it's a namespace package or other module with a loader that
        // isn't disk-based.  It could also be that a user created
        // a module manually but without manually setting __file__.
        Py_RETURN_NONE;
    }
    if (!TyUnicode_Check(fileobj)) {
        Ty_DECREF(fileobj);
        Py_RETURN_NONE;
    }
    return fileobj;
}

TyObject*
TyModule_GetFilenameObject(TyObject *mod)
{
    TyObject *fileobj = _TyModule_GetFilenameObject(mod);
    if (fileobj == NULL) {
        return NULL;
    }
    if (fileobj == Ty_None) {
        TyErr_SetString(TyExc_SystemError, "module filename missing");
        return NULL;
    }
    return fileobj;
}

const char *
TyModule_GetFilename(TyObject *m)
{
    TyObject *fileobj;
    const char *utf8;
    fileobj = TyModule_GetFilenameObject(m);
    if (fileobj == NULL)
        return NULL;
    utf8 = TyUnicode_AsUTF8(fileobj);
    Ty_DECREF(fileobj);   /* module dict has still a reference */
    return utf8;
}

Ty_ssize_t
_TyModule_GetFilenameUTF8(TyObject *mod, char *buffer, Ty_ssize_t maxlen)
{
    // We "return" an empty string for an invalid module
    // and for a missing, empty, or invalid filename.
    assert(maxlen >= 0);
    Ty_ssize_t size = -1;
    TyObject *filenameobj = _TyModule_GetFilenameObject(mod);
    if (filenameobj == NULL) {
        return -1;
    }
    if (filenameobj == Ty_None) {
        // It is missing or invalid.
        buffer[0] = '\0';
        size = 0;
    }
    else {
        const char *filename = TyUnicode_AsUTF8AndSize(filenameobj, &size);
        assert(size >= 0);
        if (size > maxlen) {
            size = -1;
            TyErr_SetString(TyExc_ValueError, "__file__ too long");
        }
        else {
            (void)strcpy(buffer, filename);
        }
    }
    Ty_DECREF(filenameobj);
    return size;
}

TyModuleDef*
TyModule_GetDef(TyObject* m)
{
    if (!TyModule_Check(m)) {
        TyErr_BadArgument();
        return NULL;
    }
    return _TyModule_GetDef(m);
}

void*
TyModule_GetState(TyObject* m)
{
    if (!TyModule_Check(m)) {
        TyErr_BadArgument();
        return NULL;
    }
    return _TyModule_GetState(m);
}

void
_TyModule_Clear(TyObject *m)
{
    TyObject *d = ((PyModuleObject *)m)->md_dict;
    if (d != NULL)
        _TyModule_ClearDict(d);
}

void
_TyModule_ClearDict(TyObject *d)
{
    /* To make the execution order of destructors for global
       objects a bit more predictable, we first zap all objects
       whose name starts with a single underscore, before we clear
       the entire dictionary.  We zap them by replacing them with
       None, rather than deleting them from the dictionary, to
       avoid rehashing the dictionary (to some extent). */

    Ty_ssize_t pos;
    TyObject *key, *value;

    int verbose = _Ty_GetConfig()->verbose;

    /* First, clear only names starting with a single underscore */
    pos = 0;
    while (TyDict_Next(d, &pos, &key, &value)) {
        if (value != Ty_None && TyUnicode_Check(key)) {
            if (TyUnicode_READ_CHAR(key, 0) == '_' &&
                TyUnicode_READ_CHAR(key, 1) != '_') {
                if (verbose > 1) {
                    const char *s = TyUnicode_AsUTF8(key);
                    if (s != NULL)
                        TySys_WriteStderr("#   clear[1] %s\n", s);
                    else
                        TyErr_Clear();
                }
                if (TyDict_SetItem(d, key, Ty_None) != 0) {
                    TyErr_FormatUnraisable("Exception ignored while "
                                           "clearing module dict");
                }
            }
        }
    }

    /* Next, clear all names except for __builtins__ */
    pos = 0;
    while (TyDict_Next(d, &pos, &key, &value)) {
        if (value != Ty_None && TyUnicode_Check(key)) {
            if (TyUnicode_READ_CHAR(key, 0) != '_' ||
                !_TyUnicode_EqualToASCIIString(key, "__builtins__"))
            {
                if (verbose > 1) {
                    const char *s = TyUnicode_AsUTF8(key);
                    if (s != NULL)
                        TySys_WriteStderr("#   clear[2] %s\n", s);
                    else
                        TyErr_Clear();
                }
                if (TyDict_SetItem(d, key, Ty_None) != 0) {
                    TyErr_FormatUnraisable("Exception ignored while "
                                           "clearing module dict");
                }
            }
        }
    }

    /* Note: we leave __builtins__ in place, so that destructors
       of non-global objects defined in this module can still use
       builtins, in particularly 'None'. */

}

/*[clinic input]
class module "PyModuleObject *" "&TyModule_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=3e35d4f708ecb6af]*/

#include "clinic/moduleobject.c.h"

/* Methods */

/*[clinic input]
module.__init__
    name: unicode
    doc: object = None

Create a module object.

The name must be a string; the optional doc argument can have any type.
[clinic start generated code]*/

static int
module___init___impl(PyModuleObject *self, TyObject *name, TyObject *doc)
/*[clinic end generated code: output=e7e721c26ce7aad7 input=57f9e177401e5e1e]*/
{
    return module_init_dict(self, self->md_dict, name, doc);
}

static void
module_dealloc(TyObject *self)
{
    PyModuleObject *m = _TyModule_CAST(self);

    PyObject_GC_UnTrack(m);

    int verbose = _Ty_GetConfig()->verbose;
    if (verbose && m->md_name) {
        TySys_FormatStderr("# destroy %U\n", m->md_name);
    }
    FT_CLEAR_WEAKREFS(self, m->md_weaklist);

    /* bpo-39824: Don't call m_free() if m_size > 0 and md_state=NULL */
    if (m->md_def && m->md_def->m_free
        && (m->md_def->m_size <= 0 || m->md_state != NULL))
    {
        m->md_def->m_free(m);
    }

    Ty_XDECREF(m->md_dict);
    Ty_XDECREF(m->md_name);
    if (m->md_state != NULL)
        TyMem_Free(m->md_state);
    Ty_TYPE(m)->tp_free((TyObject *)m);
}

static TyObject *
module_repr(TyObject *self)
{
    PyModuleObject *m = _TyModule_CAST(self);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return _TyImport_ImportlibModuleRepr(interp, (TyObject *)m);
}

/* Check if the "_initializing" attribute of the module spec is set to true.
 */
int
_PyModuleSpec_IsInitializing(TyObject *spec)
{
    if (spec == NULL) {
        return 0;
    }
    TyObject *value;
    int rc = PyObject_GetOptionalAttr(spec, &_Ty_ID(_initializing), &value);
    if (rc > 0) {
        rc = PyObject_IsTrue(value);
        Ty_DECREF(value);
    }
    return rc;
}

/* Check if the submodule name is in the "_uninitialized_submodules" attribute
   of the module spec.
 */
int
_PyModuleSpec_IsUninitializedSubmodule(TyObject *spec, TyObject *name)
{
    if (spec == NULL) {
         return 0;
    }

    TyObject *value;
    int rc = PyObject_GetOptionalAttr(spec, &_Ty_ID(_uninitialized_submodules), &value);
    if (rc > 0) {
        rc = PySequence_Contains(value, name);
        Ty_DECREF(value);
    }
    return rc;
}

int
_PyModuleSpec_GetFileOrigin(TyObject *spec, TyObject **p_origin)
{
    TyObject *has_location = NULL;
    int rc = PyObject_GetOptionalAttr(spec, &_Ty_ID(has_location), &has_location);
    if (rc <= 0) {
        return rc;
    }
    // If origin is not a location, or doesn't exist, or is not a str, we could consider falling
    // back to module.__file__. But the cases in which module.__file__ is not __spec__.origin
    // are cases in which we probably shouldn't be guessing.
    rc = PyObject_IsTrue(has_location);
    Ty_DECREF(has_location);
    if (rc <= 0) {
        return rc;
    }
    // has_location is true, so origin is a location
    TyObject *origin = NULL;
    rc = PyObject_GetOptionalAttr(spec, &_Ty_ID(origin), &origin);
    if (rc <= 0) {
        return rc;
    }
    assert(origin != NULL);
    if (!TyUnicode_Check(origin)) {
        Ty_DECREF(origin);
        return 0;
    }
    *p_origin = origin;
    return 1;
}

int
_TyModule_IsPossiblyShadowing(TyObject *origin)
{
    // origin must be a unicode subtype
    // Returns 1 if the module at origin could be shadowing a module of the
    // same name later in the module search path. The condition we check is basically:
    // root = os.path.dirname(origin.removesuffix(os.sep + "__init__.py"))
    // return not sys.flags.safe_path and root == (sys.path[0] or os.getcwd())
    // Returns 0 otherwise (or if we aren't sure)
    // Returns -1 if an error occurred that should be propagated
    if (origin == NULL) {
        return 0;
    }

    // not sys.flags.safe_path
    const TyConfig *config = _Ty_GetConfig();
    if (config->safe_path) {
        return 0;
    }

    // root = os.path.dirname(origin.removesuffix(os.sep + "__init__.py"))
    wchar_t root[MAXPATHLEN + 1];
    Ty_ssize_t size = TyUnicode_AsWideChar(origin, root, MAXPATHLEN);
    if (size < 0) {
        return -1;
    }
    assert(size <= MAXPATHLEN);
    root[size] = L'\0';

    wchar_t *sep = wcsrchr(root, SEP);
    if (sep == NULL) {
        return 0;
    }
    // If it's a package then we need to look one directory further up
    if (wcscmp(sep + 1, L"__init__.py") == 0) {
        *sep = L'\0';
        sep = wcsrchr(root, SEP);
        if (sep == NULL) {
            return 0;
        }
    }
    *sep = L'\0';

    // sys.path[0] or os.getcwd()
    wchar_t *sys_path_0 = config->sys_path_0;
    if (!sys_path_0) {
        return 0;
    }

    wchar_t sys_path_0_buf[MAXPATHLEN];
    if (sys_path_0[0] == L'\0') {
        // if sys.path[0] == "", treat it as if it were the current directory
        if (!_Ty_wgetcwd(sys_path_0_buf, MAXPATHLEN)) {
            // If we failed to getcwd, don't raise an exception and instead
            // let the caller proceed assuming no shadowing
            return 0;
        }
        sys_path_0 = sys_path_0_buf;
    }

    int result = wcscmp(sys_path_0, root) == 0;
    return result;
}

TyObject*
_Ty_module_getattro_impl(PyModuleObject *m, TyObject *name, int suppress)
{
    // When suppress=1, this function suppresses AttributeError.
    TyObject *attr, *mod_name, *getattr;
    attr = _TyObject_GenericGetAttrWithDict((TyObject *)m, name, NULL, suppress);
    if (attr) {
        return attr;
    }
    if (suppress == 1) {
        if (TyErr_Occurred()) {
            // pass up non-AttributeError exception
            return NULL;
        }
    }
    else {
        if (!TyErr_ExceptionMatches(TyExc_AttributeError)) {
            // pass up non-AttributeError exception
            return NULL;
        }
        TyErr_Clear();
    }
    assert(m->md_dict != NULL);
    if (TyDict_GetItemRef(m->md_dict, &_Ty_ID(__getattr__), &getattr) < 0) {
        return NULL;
    }
    if (getattr) {
        TyObject *result = PyObject_CallOneArg(getattr, name);
        if (result == NULL && suppress == 1 && TyErr_ExceptionMatches(TyExc_AttributeError)) {
            // suppress AttributeError
            TyErr_Clear();
        }
        Ty_DECREF(getattr);
        return result;
    }

    // The attribute was not found.  We make a best effort attempt at a useful error message,
    // but only if we're not suppressing AttributeError.
    if (suppress == 1) {
        return NULL;
    }
    if (TyDict_GetItemRef(m->md_dict, &_Ty_ID(__name__), &mod_name) < 0) {
        return NULL;
    }
    if (!mod_name || !TyUnicode_Check(mod_name)) {
        Ty_XDECREF(mod_name);
        TyErr_Format(TyExc_AttributeError,
                    "module has no attribute '%U'", name);
        return NULL;
    }
    TyObject *spec;
    if (TyDict_GetItemRef(m->md_dict, &_Ty_ID(__spec__), &spec) < 0) {
        Ty_DECREF(mod_name);
        return NULL;
    }
    if (spec == NULL) {
        TyErr_Format(TyExc_AttributeError,
                     "module '%U' has no attribute '%U'",
                     mod_name, name);
        Ty_DECREF(mod_name);
        return NULL;
    }

    TyObject *origin = NULL;
    if (_PyModuleSpec_GetFileOrigin(spec, &origin) < 0) {
        goto done;
    }

    int is_possibly_shadowing = _TyModule_IsPossiblyShadowing(origin);
    if (is_possibly_shadowing < 0) {
        goto done;
    }
    int is_possibly_shadowing_stdlib = 0;
    if (is_possibly_shadowing) {
        TyObject *stdlib_modules;
        if (_TySys_GetOptionalAttrString("stdlib_module_names", &stdlib_modules) < 0) {
            goto done;
        }
        if (stdlib_modules && PyAnySet_Check(stdlib_modules)) {
            is_possibly_shadowing_stdlib = TySet_Contains(stdlib_modules, mod_name);
            if (is_possibly_shadowing_stdlib < 0) {
                Ty_DECREF(stdlib_modules);
                goto done;
            }
        }
        Ty_XDECREF(stdlib_modules);
    }

    if (is_possibly_shadowing_stdlib) {
        assert(origin);
        TyErr_Format(TyExc_AttributeError,
                    "module '%U' has no attribute '%U' "
                    "(consider renaming '%U' since it has the same "
                    "name as the standard library module named '%U' "
                    "and prevents importing that standard library module)",
                    mod_name, name, origin, mod_name);
    }
    else {
        int rc = _PyModuleSpec_IsInitializing(spec);
        if (rc < 0) {
            goto done;
        }
        else if (rc > 0) {
            if (is_possibly_shadowing) {
                assert(origin);
                // For non-stdlib modules, only mention the possibility of
                // shadowing if the module is being initialized.
                TyErr_Format(TyExc_AttributeError,
                            "module '%U' has no attribute '%U' "
                            "(consider renaming '%U' if it has the same name "
                            "as a library you intended to import)",
                            mod_name, name, origin);
            }
            else if (origin) {
                TyErr_Format(TyExc_AttributeError,
                            "partially initialized "
                            "module '%U' from '%U' has no attribute '%U' "
                            "(most likely due to a circular import)",
                            mod_name, origin, name);
            }
            else {
                TyErr_Format(TyExc_AttributeError,
                            "partially initialized "
                            "module '%U' has no attribute '%U' "
                            "(most likely due to a circular import)",
                            mod_name, name);
            }
        }
        else {
            assert(rc == 0);
            rc = _PyModuleSpec_IsUninitializedSubmodule(spec, name);
            if (rc > 0) {
                TyErr_Format(TyExc_AttributeError,
                            "cannot access submodule '%U' of module '%U' "
                            "(most likely due to a circular import)",
                            name, mod_name);
            }
            else if (rc == 0) {
                TyErr_Format(TyExc_AttributeError,
                            "module '%U' has no attribute '%U'",
                            mod_name, name);
            }
        }
    }

done:
    Ty_XDECREF(origin);
    Ty_DECREF(spec);
    Ty_DECREF(mod_name);
    return NULL;
}


TyObject*
_Ty_module_getattro(TyObject *self, TyObject *name)
{
    PyModuleObject *m = _TyModule_CAST(self);
    return _Ty_module_getattro_impl(m, name, 0);
}

static int
module_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyModuleObject *m = _TyModule_CAST(self);

    /* bpo-39824: Don't call m_traverse() if m_size > 0 and md_state=NULL */
    if (m->md_def && m->md_def->m_traverse
        && (m->md_def->m_size <= 0 || m->md_state != NULL))
    {
        int res = m->md_def->m_traverse((TyObject*)m, visit, arg);
        if (res)
            return res;
    }

    Ty_VISIT(m->md_dict);
    return 0;
}

static int
module_clear(TyObject *self)
{
    PyModuleObject *m = _TyModule_CAST(self);

    /* bpo-39824: Don't call m_clear() if m_size > 0 and md_state=NULL */
    if (m->md_def && m->md_def->m_clear
        && (m->md_def->m_size <= 0 || m->md_state != NULL))
    {
        int res = m->md_def->m_clear((TyObject*)m);
        if (TyErr_Occurred()) {
            TyErr_FormatUnraisable("Exception ignored in m_clear of module%s%V",
                                   m->md_name ? " " : "",
                                   m->md_name, "");
        }
        if (res)
            return res;
    }
    Ty_CLEAR(m->md_dict);
    return 0;
}

static TyObject *
module_dir(TyObject *self, TyObject *args)
{
    TyObject *result = NULL;
    TyObject *dict = PyObject_GetAttr(self, &_Ty_ID(__dict__));

    if (dict != NULL) {
        if (TyDict_Check(dict)) {
            TyObject *dirfunc = TyDict_GetItemWithError(dict, &_Ty_ID(__dir__));
            if (dirfunc) {
                result = _TyObject_CallNoArgs(dirfunc);
            }
            else if (!TyErr_Occurred()) {
                result = TyDict_Keys(dict);
            }
        }
        else {
            TyErr_Format(TyExc_TypeError, "<module>.__dict__ is not a dictionary");
        }
    }

    Ty_XDECREF(dict);
    return result;
}

static TyMethodDef module_methods[] = {
    {"__dir__", module_dir, METH_NOARGS,
     TyDoc_STR("__dir__() -> list\nspecialized dir() implementation")},
    {0}
};

static TyObject *
module_get_dict(PyModuleObject *m)
{
    TyObject *dict = PyObject_GetAttr((TyObject *)m, &_Ty_ID(__dict__));
    if (dict == NULL) {
        return NULL;
    }
    if (!TyDict_Check(dict)) {
        TyErr_Format(TyExc_TypeError, "<module>.__dict__ is not a dictionary");
        Ty_DECREF(dict);
        return NULL;
    }
    return dict;
}

static TyObject *
module_get_annotate(TyObject *self, void *Py_UNUSED(ignored))
{
    PyModuleObject *m = _TyModule_CAST(self);

    TyObject *dict = module_get_dict(m);
    if (dict == NULL) {
        return NULL;
    }

    TyObject *annotate;
    if (TyDict_GetItemRef(dict, &_Ty_ID(__annotate__), &annotate) == 0) {
        annotate = Ty_None;
        if (TyDict_SetItem(dict, &_Ty_ID(__annotate__), annotate) == -1) {
            Ty_CLEAR(annotate);
        }
    }
    Ty_DECREF(dict);
    return annotate;
}

static int
module_set_annotate(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyModuleObject *m = _TyModule_CAST(self);
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "cannot delete __annotate__ attribute");
        return -1;
    }

    TyObject *dict = module_get_dict(m);
    if (dict == NULL) {
        return -1;
    }

    if (!Ty_IsNone(value) && !PyCallable_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "__annotate__ must be callable or None");
        Ty_DECREF(dict);
        return -1;
    }

    if (TyDict_SetItem(dict, &_Ty_ID(__annotate__), value) == -1) {
        Ty_DECREF(dict);
        return -1;
    }
    if (!Ty_IsNone(value)) {
        if (TyDict_Pop(dict, &_Ty_ID(__annotations__), NULL) == -1) {
            Ty_DECREF(dict);
            return -1;
        }
    }
    Ty_DECREF(dict);
    return 0;
}

static TyObject *
module_get_annotations(TyObject *self, void *Py_UNUSED(ignored))
{
    PyModuleObject *m = _TyModule_CAST(self);

    TyObject *dict = module_get_dict(m);
    if (dict == NULL) {
        return NULL;
    }

    TyObject *annotations;
    if (TyDict_GetItemRef(dict, &_Ty_ID(__annotations__), &annotations) == 0) {
        TyObject *spec;
        if (TyDict_GetItemRef(m->md_dict, &_Ty_ID(__spec__), &spec) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        bool is_initializing = false;
        if (spec != NULL) {
            int rc = _PyModuleSpec_IsInitializing(spec);
            if (rc < 0) {
                Ty_DECREF(spec);
                Ty_DECREF(dict);
                return NULL;
            }
            Ty_DECREF(spec);
            if (rc) {
                is_initializing = true;
            }
        }

        TyObject *annotate;
        int annotate_result = TyDict_GetItemRef(dict, &_Ty_ID(__annotate__), &annotate);
        if (annotate_result < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        if (annotate_result == 1 && PyCallable_Check(annotate)) {
            TyObject *one = _TyLong_GetOne();
            annotations = _TyObject_CallOneArg(annotate, one);
            if (annotations == NULL) {
                Ty_DECREF(annotate);
                Ty_DECREF(dict);
                return NULL;
            }
            if (!TyDict_Check(annotations)) {
                TyErr_Format(TyExc_TypeError, "__annotate__ returned non-dict of type '%.100s'",
                             Ty_TYPE(annotations)->tp_name);
                Ty_DECREF(annotate);
                Ty_DECREF(annotations);
                Ty_DECREF(dict);
                return NULL;
            }
        }
        else {
            annotations = TyDict_New();
        }
        Ty_XDECREF(annotate);
        // Do not cache annotations if the module is still initializing
        if (annotations && !is_initializing) {
            int result = TyDict_SetItem(
                    dict, &_Ty_ID(__annotations__), annotations);
            if (result) {
                Ty_CLEAR(annotations);
            }
        }
    }
    Ty_DECREF(dict);
    return annotations;
}

static int
module_set_annotations(TyObject *self, TyObject *value, void *Py_UNUSED(ignored))
{
    PyModuleObject *m = _TyModule_CAST(self);

    TyObject *dict = module_get_dict(m);
    if (dict == NULL) {
        return -1;
    }

    int ret = -1;
    if (value != NULL) {
        /* set */
        ret = TyDict_SetItem(dict, &_Ty_ID(__annotations__), value);
    }
    else {
        /* delete */
        ret = TyDict_Pop(dict, &_Ty_ID(__annotations__), NULL);
        if (ret == 0) {
            TyErr_SetObject(TyExc_AttributeError, &_Ty_ID(__annotations__));
            ret = -1;
        }
        else if (ret > 0) {
            ret = 0;
        }
    }
    if (ret == 0 && TyDict_Pop(dict, &_Ty_ID(__annotate__), NULL) < 0) {
        ret = -1;
    }

    Ty_DECREF(dict);
    return ret;
}


static TyGetSetDef module_getsets[] = {
    {"__annotations__", module_get_annotations, module_set_annotations},
    {"__annotate__", module_get_annotate, module_set_annotate},
    {NULL}
};

TyTypeObject TyModule_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "module",                                   /* tp_name */
    sizeof(PyModuleObject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    module_dealloc,                             /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    module_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    _Ty_module_getattro,                        /* tp_getattro */
    PyObject_GenericSetAttr,                    /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,                    /* tp_flags */
    module___init____doc__,                     /* tp_doc */
    module_traverse,                            /* tp_traverse */
    module_clear,                               /* tp_clear */
    0,                                          /* tp_richcompare */
    offsetof(PyModuleObject, md_weaklist),      /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    module_methods,                             /* tp_methods */
    module_members,                             /* tp_members */
    module_getsets,                             /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    offsetof(PyModuleObject, md_dict),          /* tp_dictoffset */
    module___init__,                            /* tp_init */
    0,                                          /* tp_alloc */
    new_module,                                 /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
};
