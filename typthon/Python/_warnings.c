#include "Python.h"
#include "pycore_frame.h"         // PyFrameObject
#include "pycore_genobject.h"     // PyAsyncGenObject
#include "pycore_import.h"        // _TyImport_GetModules()
#include "pycore_interpframe.h"   // _TyFrame_GetCode()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_pylifecycle.h"   // _Ty_IsInterpreterFinalizing()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttr()
#include "pycore_traceback.h"     // _Ty_DisplaySourceLine()
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()

#include <stdbool.h>
#include "clinic/_warnings.c.h"


#define MODULE_NAME "_warnings"

TyDoc_STRVAR(warnings__doc__,
MODULE_NAME " provides basic warning filtering support.\n"
"It is a helper module to speed up interpreter start-up.");


/*************************************************************************/

typedef struct _warnings_runtime_state WarningsState;

static inline int
check_interp(TyInterpreterState *interp)
{
    if (interp == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "warnings_get_state: could not identify "
                        "current interpreter");
        return 0;
    }
    return 1;
}

static inline TyInterpreterState *
get_current_interp(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return check_interp(interp) ? interp : NULL;
}

static inline TyThreadState *
get_current_tstate(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (tstate == NULL) {
        (void)check_interp(NULL);
        return NULL;
    }
    return check_interp(tstate->interp) ? tstate : NULL;
}

/* Given a module object, get its per-module state. */
static WarningsState *
warnings_get_state(TyInterpreterState *interp)
{
    return &interp->warnings;
}

/* Clear the given warnings module state. */
static void
warnings_clear_state(WarningsState *st)
{
    Ty_CLEAR(st->filters);
    Ty_CLEAR(st->once_registry);
    Ty_CLEAR(st->default_action);
    Ty_CLEAR(st->context);
}

#ifndef Ty_DEBUG
static TyObject *
create_filter(TyObject *category, TyObject *action_str, const char *modname)
{
    TyObject *modname_obj = NULL;

    /* Default to "no module name" for initial filter set */
    if (modname != NULL) {
        modname_obj = TyUnicode_InternFromString(modname);
        if (modname_obj == NULL) {
            return NULL;
        }
    } else {
        modname_obj = Ty_NewRef(Ty_None);
    }

    /* This assumes the line number is zero for now. */
    TyObject *filter = TyTuple_Pack(5, action_str, Ty_None,
                                    category, modname_obj, _TyLong_GetZero());
    Ty_DECREF(modname_obj);
    return filter;
}
#endif

static TyObject *
init_filters(TyInterpreterState *interp)
{
#ifdef Ty_DEBUG
    /* Ty_DEBUG builds show all warnings by default */
    return TyList_New(0);
#else
    /* Other builds ignore a number of warning categories by default */
    TyObject *filters = TyList_New(5);
    if (filters == NULL) {
        return NULL;
    }

    size_t pos = 0;  /* Post-incremented in each use. */
#define ADD(TYPE, ACTION, MODNAME) \
    TyList_SET_ITEM(filters, pos++, \
                    create_filter(TYPE, &_Ty_ID(ACTION), MODNAME));
    ADD(TyExc_DeprecationWarning, default, "__main__");
    ADD(TyExc_DeprecationWarning, ignore, NULL);
    ADD(TyExc_PendingDeprecationWarning, ignore, NULL);
    ADD(TyExc_ImportWarning, ignore, NULL);
    ADD(TyExc_ResourceWarning, ignore, NULL);
#undef ADD

    for (size_t x = 0; x < pos; x++) {
        if (TyList_GET_ITEM(filters, x) == NULL) {
            Ty_DECREF(filters);
            return NULL;
        }
    }
    return filters;
#endif
}

/* Initialize the given warnings module state. */
int
_TyWarnings_InitState(TyInterpreterState *interp)
{
    WarningsState *st = &interp->warnings;

    if (st->filters == NULL) {
        st->filters = init_filters(interp);
        if (st->filters == NULL) {
            return -1;
        }
    }

    if (st->once_registry == NULL) {
        st->once_registry = TyDict_New();
        if (st->once_registry == NULL) {
            return -1;
        }
    }

    if (st->default_action == NULL) {
        st->default_action = TyUnicode_FromString("default");
        if (st->default_action == NULL) {
            return -1;
        }
    }

    if (st->context == NULL) {
        st->context = PyContextVar_New("_warnings_context", NULL);
        if (st->context == NULL) {
            return -1;
        }
    }

    st->filters_version = 0;
    return 0;
}


/*************************************************************************/

static int
check_matched(TyInterpreterState *interp, TyObject *obj, TyObject *arg)
{
    TyObject *result;
    int rc;

    /* A 'None' filter always matches */
    if (obj == Ty_None)
        return 1;

    /* An internal plain text default filter must match exactly */
    if (TyUnicode_CheckExact(obj)) {
        int cmp_result = TyUnicode_Compare(obj, arg);
        if (cmp_result == -1 && TyErr_Occurred()) {
            return -1;
        }
        return !cmp_result;
    }

    /* Otherwise assume a regex filter and call its match() method */
    result = PyObject_CallMethodOneArg(obj, &_Ty_ID(match), arg);
    if (result == NULL)
        return -1;

    rc = PyObject_IsTrue(result);
    Ty_DECREF(result);
    return rc;
}

#define GET_WARNINGS_ATTR(interp, ATTR, try_import) \
    get_warnings_attr(interp, &_Ty_ID(ATTR), try_import)

/*
   Returns a new reference.
   A NULL return value can mean false or an error.
*/
static TyObject *
get_warnings_attr(TyInterpreterState *interp, TyObject *attr, int try_import)
{
    TyObject *warnings_module, *obj;

    /* don't try to import after the start of the Python finallization */
    if (try_import && !_Ty_IsInterpreterFinalizing(interp)) {
        warnings_module = TyImport_Import(&_Ty_ID(warnings));
        if (warnings_module == NULL) {
            /* Fallback to the C implementation if we cannot get
               the Python implementation */
            if (TyErr_ExceptionMatches(TyExc_ImportError)) {
                TyErr_Clear();
            }
            return NULL;
        }
    }
    else {
        /* if we're so late into Python finalization that the module dict is
           gone, then we can't even use TyImport_GetModule without triggering
           an interpreter abort.
        */
        if (!_TyImport_GetModules(interp)) {
            return NULL;
        }
        warnings_module = TyImport_GetModule(&_Ty_ID(warnings));
        if (warnings_module == NULL)
            return NULL;
    }

    (void)PyObject_GetOptionalAttr(warnings_module, attr, &obj);
    Ty_DECREF(warnings_module);
    return obj;
}

static inline void
warnings_lock(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);
    _PyRecursiveMutex_Lock(&st->lock);
}

static inline int
warnings_unlock(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);
    return _PyRecursiveMutex_TryUnlock(&st->lock);
}

static inline bool
warnings_lock_held(WarningsState *st)
{
    return PyMutex_IsLocked(&st->lock.mutex);
}

static TyObject *
get_warnings_context(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    assert(PyContextVar_CheckExact(st->context));
    TyObject *ctx;
    if (PyContextVar_Get(st->context, NULL, &ctx) < 0) {
        return NULL;
    }
    if (ctx == NULL) {
        Py_RETURN_NONE;
    }
    return ctx;
}

static TyObject *
get_warnings_context_filters(TyInterpreterState *interp)
{
    TyObject *ctx = get_warnings_context(interp);
    if (ctx == NULL) {
        return NULL;
    }
    if (ctx == Ty_None) {
        Py_RETURN_NONE;
    }
    TyObject *context_filters = PyObject_GetAttr(ctx, &_Ty_ID(_filters));
    Ty_DECREF(ctx);
    if (context_filters == NULL) {
        return NULL;
    }
    if (!TyList_Check(context_filters)) {
        TyErr_SetString(TyExc_ValueError,
                        "_filters of warnings._warnings_context must be a list");
        Ty_DECREF(context_filters);
        return NULL;
    }
    return context_filters;
}

// Returns a borrowed reference to the list.
static TyObject *
get_warnings_filters(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    TyObject *warnings_filters = GET_WARNINGS_ATTR(interp, filters, 0);
    if (warnings_filters == NULL) {
        if (TyErr_Occurred())
            return NULL;
    }
    else {
        Ty_SETREF(st->filters, warnings_filters);
    }

    TyObject *filters = st->filters;
    if (filters == NULL || !TyList_Check(filters)) {
        TyErr_SetString(TyExc_ValueError,
                        MODULE_NAME ".filters must be a list");
        return NULL;
    }
    return filters;
}

/*[clinic input]
_acquire_lock as warnings_acquire_lock

[clinic start generated code]*/

static TyObject *
warnings_acquire_lock_impl(TyObject *module)
/*[clinic end generated code: output=594313457d1bf8e1 input=46ec20e55acca52f]*/
{
    TyInterpreterState *interp = get_current_interp();
    if (interp == NULL) {
        return NULL;
    }
    warnings_lock(interp);
    Py_RETURN_NONE;
}

/*[clinic input]
_release_lock as warnings_release_lock

[clinic start generated code]*/

static TyObject *
warnings_release_lock_impl(TyObject *module)
/*[clinic end generated code: output=d73d5a8789396750 input=ea01bb77870c5693]*/
{
    TyInterpreterState *interp = get_current_interp();
    if (interp == NULL) {
        return NULL;
    }
    if (warnings_unlock(interp) < 0) {
        TyErr_SetString(TyExc_RuntimeError, "cannot release un-acquired lock");
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
get_once_registry(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);

    assert(warnings_lock_held(st));

    TyObject *registry = GET_WARNINGS_ATTR(interp, onceregistry, 0);
    if (registry == NULL) {
        if (TyErr_Occurred())
            return NULL;
        assert(st->once_registry);
        return st->once_registry;
    }
    if (!TyDict_Check(registry)) {
        TyErr_Format(TyExc_TypeError,
                     MODULE_NAME ".onceregistry must be a dict, "
                     "not '%.200s'",
                     Ty_TYPE(registry)->tp_name);
        Ty_DECREF(registry);
        return NULL;
    }
    Ty_SETREF(st->once_registry, registry);
    return registry;
}


static TyObject *
get_default_action(TyInterpreterState *interp)
{
    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);

    assert(warnings_lock_held(st));

    TyObject *default_action = GET_WARNINGS_ATTR(interp, defaultaction, 0);
    if (default_action == NULL) {
        if (TyErr_Occurred()) {
            return NULL;
        }
        assert(st->default_action);
        return st->default_action;
    }
    if (!TyUnicode_Check(default_action)) {
        TyErr_Format(TyExc_TypeError,
                     MODULE_NAME ".defaultaction must be a string, "
                     "not '%.200s'",
                     Ty_TYPE(default_action)->tp_name);
        Ty_DECREF(default_action);
        return NULL;
    }
    Ty_SETREF(st->default_action, default_action);
    return default_action;
}

/* Search filters list of match, returns false on error.  If no match
 * then 'matched_action' is NULL.  */
static bool
filter_search(TyInterpreterState *interp, TyObject *category,
              TyObject *text, Ty_ssize_t lineno,
              TyObject *module, char *list_name, TyObject *filters,
              TyObject **item, TyObject **matched_action) {
    bool result = true;
    *matched_action = NULL;
    /* Avoid the filters list changing while we iterate over it. */
    Ty_BEGIN_CRITICAL_SECTION(filters);
    for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(filters); i++) {
        TyObject *tmp_item, *action, *msg, *cat, *mod, *ln_obj;
        Ty_ssize_t ln;
        int is_subclass, good_msg, good_mod;

        tmp_item = TyList_GET_ITEM(filters, i);
        if (!TyTuple_Check(tmp_item) || TyTuple_GET_SIZE(tmp_item) != 5) {
            TyErr_Format(TyExc_ValueError,
                         "warnings.%s item %zd isn't a 5-tuple", list_name, i);
            result = false;
            break;
        }

        /* Python code: action, msg, cat, mod, ln = item */
        Ty_INCREF(tmp_item);
        action = TyTuple_GET_ITEM(tmp_item, 0);
        msg = TyTuple_GET_ITEM(tmp_item, 1);
        cat = TyTuple_GET_ITEM(tmp_item, 2);
        mod = TyTuple_GET_ITEM(tmp_item, 3);
        ln_obj = TyTuple_GET_ITEM(tmp_item, 4);

        if (!TyUnicode_Check(action)) {
            TyErr_Format(TyExc_TypeError,
                         "action must be a string, not '%.200s'",
                         Ty_TYPE(action)->tp_name);
            Ty_DECREF(tmp_item);
            result = false;
            break;
        }

        good_msg = check_matched(interp, msg, text);
        if (good_msg == -1) {
            Ty_DECREF(tmp_item);
            result = false;
            break;
        }

        good_mod = check_matched(interp, mod, module);
        if (good_mod == -1) {
            Ty_DECREF(tmp_item);
            result = false;
            break;
        }

        is_subclass = PyObject_IsSubclass(category, cat);
        if (is_subclass == -1) {
            Ty_DECREF(tmp_item);
            result = false;
            break;
        }

        ln = TyLong_AsSsize_t(ln_obj);
        if (ln == -1 && TyErr_Occurred()) {
            Ty_DECREF(tmp_item);
            result = false;
            break;
        }

        if (good_msg && is_subclass && good_mod && (ln == 0 || lineno == ln)) {
            *item = tmp_item;
            *matched_action = action;
            result = true;
            break;
        }

        Ty_DECREF(tmp_item);
    }
    Ty_END_CRITICAL_SECTION();
    return result;
}

/* The item is a new reference. */
static TyObject*
get_filter(TyInterpreterState *interp, TyObject *category,
           TyObject *text, Ty_ssize_t lineno,
           TyObject *module, TyObject **item)
{
#ifdef Ty_DEBUG
    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);
    assert(warnings_lock_held(st));
#endif

    /* check _warning_context _filters list */
    TyObject *context_filters = get_warnings_context_filters(interp);
    if (context_filters == NULL) {
        return NULL;
    }
    bool use_global_filters = false;
    if (context_filters == Ty_None) {
        use_global_filters = true;
    } else {
        TyObject *context_action = NULL;
        if (!filter_search(interp, category, text, lineno, module, "_warnings_context _filters",
                           context_filters, item, &context_action)) {
            Ty_DECREF(context_filters);
            return NULL;
        }
        Ty_DECREF(context_filters);
        if (context_action != NULL) {
            return context_action;
        }
    }

    TyObject *action;

    if (use_global_filters) {
        /* check warnings.filters list */
        TyObject *filters = get_warnings_filters(interp);
        if (filters == NULL) {
            return NULL;
        }
        if (!filter_search(interp, category, text, lineno, module, "filters",
                           filters, item, &action)) {
            return NULL;
        }
        if (action != NULL) {
            return action;
        }
    }

    action = get_default_action(interp);
    if (action != NULL) {
        *item = Ty_NewRef(Ty_None);
        return action;
    }

    return NULL;
}


static int
already_warned(TyInterpreterState *interp, TyObject *registry, TyObject *key,
               int should_set)
{
    TyObject *already_warned;

    if (key == NULL)
        return -1;

    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);
    assert(warnings_lock_held(st));

    TyObject *version_obj;
    if (TyDict_GetItemRef(registry, &_Ty_ID(version), &version_obj) < 0) {
        return -1;
    }
    bool should_update_version = (
        version_obj == NULL
        || !TyLong_CheckExact(version_obj)
        || TyLong_AsLong(version_obj) != st->filters_version
    );
    Ty_XDECREF(version_obj);
    if (should_update_version) {
        TyDict_Clear(registry);
        version_obj = TyLong_FromLong(st->filters_version);
        if (version_obj == NULL)
            return -1;
        if (TyDict_SetItem(registry, &_Ty_ID(version), version_obj) < 0) {
            Ty_DECREF(version_obj);
            return -1;
        }
        Ty_DECREF(version_obj);
    }
    else {
        if (TyDict_GetItemRef(registry, key, &already_warned) < 0) {
            return -1;
        }
        if (already_warned != NULL) {
            int rc = PyObject_IsTrue(already_warned);
            Ty_DECREF(already_warned);
            if (rc != 0)
                return rc;
        }
    }

    /* This warning wasn't found in the registry, set it. */
    if (should_set)
        return TyDict_SetItem(registry, key, Ty_True);
    return 0;
}

/* New reference. */
static TyObject *
normalize_module(TyObject *filename)
{
    TyObject *module;
    int kind;
    const void *data;
    Ty_ssize_t len;

    len = TyUnicode_GetLength(filename);
    if (len < 0)
        return NULL;

    if (len == 0)
        return TyUnicode_FromString("<unknown>");

    kind = TyUnicode_KIND(filename);
    data = TyUnicode_DATA(filename);

    /* if filename.endswith(".py"): */
    if (len >= 3 &&
        TyUnicode_READ(kind, data, len-3) == '.' &&
        TyUnicode_READ(kind, data, len-2) == 'p' &&
        TyUnicode_READ(kind, data, len-1) == 'y')
    {
        module = TyUnicode_Substring(filename, 0, len-3);
    }
    else {
        module = Ty_NewRef(filename);
    }
    return module;
}

static int
update_registry(TyInterpreterState *interp, TyObject *registry, TyObject *text,
                TyObject *category, int add_zero)
{
    TyObject *altkey;
    int rc;

    if (add_zero)
        altkey = TyTuple_Pack(3, text, category, _TyLong_GetZero());
    else
        altkey = TyTuple_Pack(2, text, category);

    rc = already_warned(interp, registry, altkey, 1);
    Ty_XDECREF(altkey);
    return rc;
}

static void
show_warning(TyThreadState *tstate, TyObject *filename, int lineno,
             TyObject *text, TyObject *category, TyObject *sourceline)
{
    TyObject *f_stderr = NULL;
    TyObject *name;
    char lineno_str[128];

    TyOS_snprintf(lineno_str, sizeof(lineno_str), ":%d: ", lineno);

    name = PyObject_GetAttr(category, &_Ty_ID(__name__));
    if (name == NULL) {
        goto error;
    }

    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &f_stderr) <= 0) {
        fprintf(stderr, "lost sys.stderr\n");
        goto error;
    }

    /* Print "filename:lineno: category: text\n" */
    if (TyFile_WriteObject(filename, f_stderr, Ty_PRINT_RAW) < 0)
        goto error;
    if (TyFile_WriteString(lineno_str, f_stderr) < 0)
        goto error;
    if (TyFile_WriteObject(name, f_stderr, Ty_PRINT_RAW) < 0)
        goto error;
    if (TyFile_WriteString(": ", f_stderr) < 0)
        goto error;
    if (TyFile_WriteObject(text, f_stderr, Ty_PRINT_RAW) < 0)
        goto error;
    if (TyFile_WriteString("\n", f_stderr) < 0)
        goto error;
    Ty_CLEAR(name);

    /* Print "  source_line\n" */
    if (sourceline) {
        int kind;
        const void *data;
        Ty_ssize_t i, len;
        Ty_UCS4 ch;
        TyObject *truncated;

        kind = TyUnicode_KIND(sourceline);
        data = TyUnicode_DATA(sourceline);
        len = TyUnicode_GET_LENGTH(sourceline);
        for (i=0; i<len; i++) {
            ch = TyUnicode_READ(kind, data, i);
            if (ch != ' ' && ch != '\t' && ch != '\014')
                break;
        }

        truncated = TyUnicode_Substring(sourceline, i, len);
        if (truncated == NULL)
            goto error;

        TyFile_WriteObject(sourceline, f_stderr, Ty_PRINT_RAW);
        Ty_DECREF(truncated);
        TyFile_WriteString("\n", f_stderr);
    }
    else {
        _Ty_DisplaySourceLine(f_stderr, filename, lineno, 2, NULL, NULL);
    }

error:
    Ty_XDECREF(f_stderr);
    Ty_XDECREF(name);
    TyErr_Clear();
}

static int
call_show_warning(TyThreadState *tstate, TyObject *category,
                  TyObject *text, TyObject *message,
                  TyObject *filename, int lineno, TyObject *lineno_obj,
                  TyObject *sourceline, TyObject *source)
{
    TyObject *show_fn, *msg, *res, *warnmsg_cls = NULL;
    TyInterpreterState *interp = tstate->interp;

    /* The Python implementation is able to log the traceback where the source
       was allocated, whereas the C implementation doesn't. */
    show_fn = GET_WARNINGS_ATTR(interp, _showwarnmsg, 1);
    if (show_fn == NULL) {
        if (TyErr_Occurred())
            return -1;
        show_warning(tstate, filename, lineno, text, category, sourceline);
        return 0;
    }

    if (!PyCallable_Check(show_fn)) {
        TyErr_SetString(TyExc_TypeError,
                "warnings._showwarnmsg() must be set to a callable");
        goto error;
    }

    warnmsg_cls = GET_WARNINGS_ATTR(interp, WarningMessage, 0);
    if (warnmsg_cls == NULL) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_RuntimeError,
                    "unable to get warnings.WarningMessage");
        }
        goto error;
    }

    msg = PyObject_CallFunctionObjArgs(warnmsg_cls, message, category,
            filename, lineno_obj, Ty_None, Ty_None, source,
            NULL);
    Ty_DECREF(warnmsg_cls);
    if (msg == NULL)
        goto error;

    res = PyObject_CallOneArg(show_fn, msg);
    Ty_DECREF(show_fn);
    Ty_DECREF(msg);

    if (res == NULL)
        return -1;

    Ty_DECREF(res);
    return 0;

error:
    Ty_XDECREF(show_fn);
    return -1;
}

static TyObject *
warn_explicit(TyThreadState *tstate, TyObject *category, TyObject *message,
              TyObject *filename, int lineno,
              TyObject *module, TyObject *registry, TyObject *sourceline,
              TyObject *source)
{
    TyObject *key = NULL, *text = NULL, *result = NULL, *lineno_obj = NULL;
    TyObject *item = NULL;
    TyObject *action;
    int rc;
    TyInterpreterState *interp = tstate->interp;

    /* module can be None if a warning is emitted late during Python shutdown.
       In this case, the Python warnings module was probably unloaded, filters
       are no more available to choose as action. It is safer to ignore the
       warning and do nothing. */
    if (module == Ty_None)
        Py_RETURN_NONE;

    if (registry && !TyDict_Check(registry) && (registry != Ty_None)) {
        TyErr_SetString(TyExc_TypeError, "'registry' must be a dict or None");
        return NULL;
    }

    /* Normalize module. */
    if (module == NULL) {
        module = normalize_module(filename);
        if (module == NULL)
            return NULL;
    }
    else
        Ty_INCREF(module);

    /* Normalize message. */
    Ty_INCREF(message);  /* DECREF'ed in cleanup. */
    rc = PyObject_IsInstance(message, TyExc_Warning);
    if (rc == -1) {
        goto cleanup;
    }
    if (rc == 1) {
        text = PyObject_Str(message);
        if (text == NULL)
            goto cleanup;
        category = (TyObject*)Ty_TYPE(message);
    }
    else {
        text = message;
        message = PyObject_CallOneArg(category, message);
        if (message == NULL)
            goto cleanup;
    }

    lineno_obj = TyLong_FromLong(lineno);
    if (lineno_obj == NULL)
        goto cleanup;

    if (source == Ty_None) {
        source = NULL;
    }

    /* Create key. */
    key = TyTuple_Pack(3, text, category, lineno_obj);
    if (key == NULL)
        goto cleanup;

    if ((registry != NULL) && (registry != Ty_None)) {
        rc = already_warned(interp, registry, key, 0);
        if (rc == -1)
            goto cleanup;
        else if (rc == 1)
            goto return_none;
        /* Else this warning hasn't been generated before. */
    }

    action = get_filter(interp, category, text, lineno, module, &item);
    if (action == NULL)
        goto cleanup;

    if (_TyUnicode_EqualToASCIIString(action, "error")) {
        TyErr_SetObject(category, message);
        goto cleanup;
    }

    if (_TyUnicode_EqualToASCIIString(action, "ignore")) {
        goto return_none;
    }

    /* Store in the registry that we've been here, *except* when the action
       is "always" or "all". */
    rc = 0;
    if (!_TyUnicode_EqualToASCIIString(action, "always") && !_TyUnicode_EqualToASCIIString(action, "all")) {
        if (registry != NULL && registry != Ty_None &&
            TyDict_SetItem(registry, key, Ty_True) < 0)
        {
            goto cleanup;
        }

        if (_TyUnicode_EqualToASCIIString(action, "once")) {
            if (registry == NULL || registry == Ty_None) {
                registry = get_once_registry(interp);
                if (registry == NULL)
                    goto cleanup;
            }
            /* WarningsState.once_registry[(text, category)] = 1 */
            rc = update_registry(interp, registry, text, category, 0);
        }
        else if (_TyUnicode_EqualToASCIIString(action, "module")) {
            /* registry[(text, category, 0)] = 1 */
            if (registry != NULL && registry != Ty_None)
                rc = update_registry(interp, registry, text, category, 0);
        }
        else if (!_TyUnicode_EqualToASCIIString(action, "default")) {
            TyErr_Format(TyExc_RuntimeError,
                        "Unrecognized action (%R) in warnings.filters:\n %R",
                        action, item);
            goto cleanup;
        }
    }

    if (rc == 1)  /* Already warned for this module. */
        goto return_none;
    if (rc == 0) {
        if (call_show_warning(tstate, category, text, message, filename,
                              lineno, lineno_obj, sourceline, source) < 0)
            goto cleanup;
    }
    else /* if (rc == -1) */
        goto cleanup;

 return_none:
    result = Ty_NewRef(Ty_None);

 cleanup:
    Ty_XDECREF(item);
    Ty_XDECREF(key);
    Ty_XDECREF(text);
    Ty_XDECREF(lineno_obj);
    Ty_DECREF(module);
    Ty_XDECREF(message);
    return result;  /* Ty_None or NULL. */
}

static TyObject *
get_frame_filename(PyFrameObject *frame)
{
    PyCodeObject *code = TyFrame_GetCode(frame);
    TyObject *filename = code->co_filename;
    Ty_DECREF(code);
    return filename;
}

static bool
is_internal_filename(TyObject *filename)
{
    if (!TyUnicode_Check(filename)) {
        return false;
    }

    int contains = TyUnicode_Contains(filename, &_Ty_ID(importlib));
    if (contains < 0) {
        return false;
    }
    else if (contains > 0) {
        contains = TyUnicode_Contains(filename, &_Ty_ID(_bootstrap));
        if (contains < 0) {
            return false;
        }
        else if (contains > 0) {
            return true;
        }
    }

    return false;
}

static bool
is_filename_to_skip(TyObject *filename, PyTupleObject *skip_file_prefixes)
{
    if (skip_file_prefixes) {
        if (!TyUnicode_Check(filename)) {
            return false;
        }

        Ty_ssize_t prefixes = TyTuple_GET_SIZE(skip_file_prefixes);
        for (Ty_ssize_t idx = 0; idx < prefixes; ++idx)
        {
            TyObject *prefix = TyTuple_GET_ITEM(skip_file_prefixes, idx);
            Ty_ssize_t found = TyUnicode_Tailmatch(filename, prefix,
                                                   0, PY_SSIZE_T_MAX, -1);
            if (found == 1) {
                return true;
            }
            if (found < 0) {
                return false;
            }
        }
    }
    return false;
}

static bool
is_internal_frame(PyFrameObject *frame)
{
    if (frame == NULL) {
        return false;
    }

    TyObject *filename = get_frame_filename(frame);
    if (filename == NULL) {
        return false;
    }

    return is_internal_filename(filename);
}

static PyFrameObject *
next_external_frame(PyFrameObject *frame, PyTupleObject *skip_file_prefixes)
{
    TyObject *frame_filename;
    do {
        PyFrameObject *back = TyFrame_GetBack(frame);
        Ty_SETREF(frame, back);
    } while (frame != NULL && (frame_filename = get_frame_filename(frame)) &&
             (is_internal_filename(frame_filename) ||
              is_filename_to_skip(frame_filename, skip_file_prefixes)));

    return frame;
}

/* filename, module, and registry are new refs, globals is borrowed */
/* skip_file_prefixes is either NULL or a tuple of strs. */
/* Returns 0 on error (no new refs), 1 on success */
static int
setup_context(Ty_ssize_t stack_level,
              PyTupleObject *skip_file_prefixes,
              TyObject **filename, int *lineno,
              TyObject **module, TyObject **registry)
{
    TyObject *globals;

    /* Setup globals, filename and lineno. */
    TyThreadState *tstate = get_current_tstate();
    if (tstate == NULL) {
        return 0;
    }
    if (skip_file_prefixes) {
        /* Type check our data structure up front. Later code that uses it
         * isn't structured to report errors. */
        Ty_ssize_t prefixes = TyTuple_GET_SIZE(skip_file_prefixes);
        for (Ty_ssize_t idx = 0; idx < prefixes; ++idx)
        {
            TyObject *prefix = TyTuple_GET_ITEM(skip_file_prefixes, idx);
            if (!TyUnicode_Check(prefix)) {
                TyErr_Format(TyExc_TypeError,
                             "Found non-str '%s' in skip_file_prefixes.",
                             Ty_TYPE(prefix)->tp_name);
                return 0;
            }
        }
    }
    TyInterpreterState *interp = tstate->interp;
    PyFrameObject *f = TyThreadState_GetFrame(tstate);
    // Stack level comparisons to Python code is off by one as there is no
    // warnings-related stack level to avoid.
    if (stack_level <= 0 || is_internal_frame(f)) {
        while (--stack_level > 0 && f != NULL) {
            PyFrameObject *back = TyFrame_GetBack(f);
            Ty_SETREF(f, back);
        }
    }
    else {
        while (--stack_level > 0 && f != NULL) {
            f = next_external_frame(f, skip_file_prefixes);
        }
    }

    if (f == NULL) {
        globals = interp->sysdict;
        *filename = TyUnicode_FromString("<sys>");
        *lineno = 0;
    }
    else {
        globals = f->f_frame->f_globals;
        *filename = Ty_NewRef(_TyFrame_GetCode(f->f_frame)->co_filename);
        *lineno = TyFrame_GetLineNumber(f);
        Ty_DECREF(f);
    }

    *module = NULL;

    /* Setup registry. */
    assert(globals != NULL);
    assert(TyDict_Check(globals));
    int rc = TyDict_GetItemRef(globals, &_Ty_ID(__warningregistry__),
                               registry);
    if (rc < 0) {
        goto handle_error;
    }
    if (*registry == NULL) {
        *registry = TyDict_New();
        if (*registry == NULL)
            goto handle_error;

         rc = TyDict_SetItem(globals, &_Ty_ID(__warningregistry__), *registry);
         if (rc < 0)
            goto handle_error;
    }

    /* Setup module. */
    rc = TyDict_GetItemRef(globals, &_Ty_ID(__name__), module);
    if (rc < 0) {
        goto handle_error;
    }
    if (rc > 0) {
        if (Ty_IsNone(*module) || TyUnicode_Check(*module)) {
            return 1;
        }
        Ty_DECREF(*module);
    }
    *module = TyUnicode_FromString("<string>");
    if (*module == NULL) {
        goto handle_error;
    }

    return 1;

 handle_error:
    Ty_XDECREF(*registry);
    Ty_XDECREF(*module);
    Ty_DECREF(*filename);
    return 0;
}

static TyObject *
get_category(TyObject *message, TyObject *category)
{
    int rc;

    /* Get category. */
    rc = PyObject_IsInstance(message, TyExc_Warning);
    if (rc == -1)
        return NULL;

    if (rc == 1)
        category = (TyObject*)Ty_TYPE(message);
    else if (category == NULL || category == Ty_None)
        category = TyExc_UserWarning;

    /* Validate category. */
    rc = PyObject_IsSubclass(category, TyExc_Warning);
    /* category is not a subclass of TyExc_Warning or
       PyObject_IsSubclass raised an error */
    if (rc == -1 || rc == 0) {
        TyErr_Format(TyExc_TypeError,
                     "category must be a Warning subclass, not '%s'",
                     Ty_TYPE(category)->tp_name);
        return NULL;
    }

    return category;
}

static TyObject *
do_warn(TyObject *message, TyObject *category, Ty_ssize_t stack_level,
        TyObject *source, PyTupleObject *skip_file_prefixes)
{
    TyObject *filename, *module, *registry, *res;
    int lineno;

    TyThreadState *tstate = get_current_tstate();
    if (tstate == NULL) {
        return NULL;
    }

    if (!setup_context(stack_level, skip_file_prefixes,
                       &filename, &lineno, &module, &registry))
        return NULL;

    warnings_lock(tstate->interp);
    res = warn_explicit(tstate, category, message, filename, lineno, module, registry,
                        NULL, source);
    warnings_unlock(tstate->interp);
    Ty_DECREF(filename);
    Ty_DECREF(registry);
    Ty_DECREF(module);
    return res;
}

/*[clinic input]
warn as warnings_warn

    message: object
      Text of the warning message.
    category: object = None
      The Warning category subclass. Defaults to UserWarning.
    stacklevel: Ty_ssize_t = 1
      How far up the call stack to make this warning appear. A value of 2 for
      example attributes the warning to the caller of the code calling warn().
    source: object = None
      If supplied, the destroyed object which emitted a ResourceWarning
    *
    skip_file_prefixes: object(type='PyTupleObject *', subclass_of='&TyTuple_Type') = NULL
      An optional tuple of module filename prefixes indicating frames to skip
      during stacklevel computations for stack frame attribution.

Issue a warning, or maybe ignore it or raise an exception.
[clinic start generated code]*/

static TyObject *
warnings_warn_impl(TyObject *module, TyObject *message, TyObject *category,
                   Ty_ssize_t stacklevel, TyObject *source,
                   PyTupleObject *skip_file_prefixes)
/*[clinic end generated code: output=a68e0f6906c65f80 input=eb37c6a18bec4ea1]*/
{
    category = get_category(message, category);
    if (category == NULL)
        return NULL;
    if (skip_file_prefixes) {
        if (TyTuple_GET_SIZE(skip_file_prefixes) > 0) {
            if (stacklevel < 2) {
                stacklevel = 2;
            }
        } else {
            Ty_DECREF((TyObject *)skip_file_prefixes);
            skip_file_prefixes = NULL;
        }
    }
    return do_warn(message, category, stacklevel, source, skip_file_prefixes);
}

static TyObject *
get_source_line(TyInterpreterState *interp, TyObject *module_globals, int lineno)
{
    TyObject *loader;
    TyObject *module_name;
    TyObject *get_source;
    TyObject *source;
    TyObject *source_list;
    TyObject *source_line;

    /* stolen from import.c */
    loader = _TyImport_BlessMyLoader(interp, module_globals);
    if (loader == NULL) {
        return NULL;
    }

    int rc = TyDict_GetItemRef(module_globals, &_Ty_ID(__name__),
                               &module_name);
    if (rc < 0 || rc == 0) {
        Ty_DECREF(loader);
        return NULL;
    }

    /* Make sure the loader implements the optional get_source() method. */
    (void)PyObject_GetOptionalAttr(loader, &_Ty_ID(get_source), &get_source);
    Ty_DECREF(loader);
    if (!get_source) {
        Ty_DECREF(module_name);
        return NULL;
    }
    /* Call get_source() to get the source code. */
    source = PyObject_CallOneArg(get_source, module_name);
    Ty_DECREF(get_source);
    Ty_DECREF(module_name);
    if (!source) {
        return NULL;
    }
    if (source == Ty_None) {
        Ty_DECREF(source);
        return NULL;
    }

    /* Split the source into lines. */
    source_list = TyUnicode_Splitlines(source, 0);
    Ty_DECREF(source);
    if (!source_list) {
        return NULL;
    }

    /* Get the source line. */
    source_line = TyList_GetItem(source_list, lineno-1);
    Ty_XINCREF(source_line);
    Ty_DECREF(source_list);
    return source_line;
}

/*[clinic input]
warn_explicit as warnings_warn_explicit

    message: object
    category: object
    filename: unicode
    lineno: int
    module as mod: object = NULL
    registry: object = None
    module_globals: object = None
    source as sourceobj: object = None

Issue a warning, or maybe ignore it or raise an exception.
[clinic start generated code]*/

static TyObject *
warnings_warn_explicit_impl(TyObject *module, TyObject *message,
                            TyObject *category, TyObject *filename,
                            int lineno, TyObject *mod, TyObject *registry,
                            TyObject *module_globals, TyObject *sourceobj)
/*[clinic end generated code: output=c49c62b15a49a186 input=df6eeb8b45e712f1]*/
{
    TyObject *source_line = NULL;
    TyObject *returned;

    TyThreadState *tstate = get_current_tstate();
    if (tstate == NULL) {
        return NULL;
    }

    if (module_globals && module_globals != Ty_None) {
        if (!TyDict_Check(module_globals)) {
            TyErr_Format(TyExc_TypeError,
                         "module_globals must be a dict, not '%.200s'",
                         Ty_TYPE(module_globals)->tp_name);
            return NULL;
        }

        source_line = get_source_line(tstate->interp, module_globals, lineno);
        if (source_line == NULL && TyErr_Occurred()) {
            return NULL;
        }
    }

    warnings_lock(tstate->interp);
    returned = warn_explicit(tstate, category, message, filename, lineno,
                             mod, registry, source_line, sourceobj);
    warnings_unlock(tstate->interp);
    Ty_XDECREF(source_line);
    return returned;
}

/*[clinic input]
_filters_mutated_lock_held as warnings_filters_mutated_lock_held

[clinic start generated code]*/

static TyObject *
warnings_filters_mutated_lock_held_impl(TyObject *module)
/*[clinic end generated code: output=df5c84f044e856ec input=34208bf03d70e432]*/
{
    TyInterpreterState *interp = get_current_interp();
    if (interp == NULL) {
        return NULL;
    }

    WarningsState *st = warnings_get_state(interp);
    assert(st != NULL);

    // Note that the lock must be held by the caller.
    if (!warnings_lock_held(st)) {
        TyErr_SetString(TyExc_RuntimeError, "warnings lock is not held");
        return NULL;
    }

    st->filters_version++;

    Py_RETURN_NONE;
}

/* Function to issue a warning message; may raise an exception. */

static int
warn_unicode(TyObject *category, TyObject *message,
             Ty_ssize_t stack_level, TyObject *source)
{
    TyObject *res;

    if (category == NULL)
        category = TyExc_RuntimeWarning;

    res = do_warn(message, category, stack_level, source, NULL);
    if (res == NULL)
        return -1;
    Ty_DECREF(res);

    return 0;
}

static int
_TyErr_WarnFormatV(TyObject *source,
                   TyObject *category, Ty_ssize_t stack_level,
                   const char *format, va_list vargs)
{
    TyObject *message;
    int res;

    message = TyUnicode_FromFormatV(format, vargs);
    if (message == NULL)
        return -1;

    res = warn_unicode(category, message, stack_level, source);
    Ty_DECREF(message);
    return res;
}

int
TyErr_WarnFormat(TyObject *category, Ty_ssize_t stack_level,
                 const char *format, ...)
{
    int res;
    va_list vargs;

    va_start(vargs, format);
    res = _TyErr_WarnFormatV(NULL, category, stack_level, format, vargs);
    va_end(vargs);
    return res;
}

static int
_TyErr_WarnFormat(TyObject *source, TyObject *category, Ty_ssize_t stack_level,
                  const char *format, ...)
{
    int res;
    va_list vargs;

    va_start(vargs, format);
    res = _TyErr_WarnFormatV(source, category, stack_level, format, vargs);
    va_end(vargs);
    return res;
}

int
TyErr_ResourceWarning(TyObject *source, Ty_ssize_t stack_level,
                      const char *format, ...)
{
    int res;
    va_list vargs;

    va_start(vargs, format);
    res = _TyErr_WarnFormatV(source, TyExc_ResourceWarning,
                             stack_level, format, vargs);
    va_end(vargs);
    return res;
}


int
TyErr_WarnEx(TyObject *category, const char *text, Ty_ssize_t stack_level)
{
    int ret;
    TyObject *message = TyUnicode_FromString(text);
    if (message == NULL)
        return -1;
    ret = warn_unicode(category, message, stack_level, NULL);
    Ty_DECREF(message);
    return ret;
}

/* TyErr_Warn is only for backwards compatibility and will be removed.
   Use TyErr_WarnEx instead. */

#undef TyErr_Warn

int
TyErr_Warn(TyObject *category, const char *text)
{
    return TyErr_WarnEx(category, text, 1);
}

/* Warning with explicit origin */
int
TyErr_WarnExplicitObject(TyObject *category, TyObject *message,
                         TyObject *filename, int lineno,
                         TyObject *module, TyObject *registry)
{
    TyObject *res;
    if (category == NULL)
        category = TyExc_RuntimeWarning;
    TyThreadState *tstate = get_current_tstate();
    if (tstate == NULL) {
        return -1;
    }

    warnings_lock(tstate->interp);
    res = warn_explicit(tstate, category, message, filename, lineno,
                        module, registry, NULL, NULL);
    warnings_unlock(tstate->interp);
    if (res == NULL)
        return -1;
    Ty_DECREF(res);
    return 0;
}

/* Like TyErr_WarnExplicitObject, but automatically sets up context */
int
_TyErr_WarnExplicitObjectWithContext(TyObject *category, TyObject *message,
                                     TyObject *filename, int lineno)
{
    TyObject *unused_filename, *module, *registry;
    int unused_lineno;
    int stack_level = 1;

    if (!setup_context(stack_level, NULL, &unused_filename, &unused_lineno,
                       &module, &registry)) {
        return -1;
    }

    int rc = TyErr_WarnExplicitObject(category, message, filename, lineno,
                                      module, registry);
    Ty_DECREF(unused_filename);
    Ty_DECREF(registry);
    Ty_DECREF(module);
    return rc;
}

int
TyErr_WarnExplicit(TyObject *category, const char *text,
                   const char *filename_str, int lineno,
                   const char *module_str, TyObject *registry)
{
    TyObject *message = TyUnicode_FromString(text);
    if (message == NULL) {
        return -1;
    }
    TyObject *filename = TyUnicode_DecodeFSDefault(filename_str);
    if (filename == NULL) {
        Ty_DECREF(message);
        return -1;
    }
    TyObject *module = NULL;
    if (module_str != NULL) {
        module = TyUnicode_FromString(module_str);
        if (module == NULL) {
            Ty_DECREF(filename);
            Ty_DECREF(message);
            return -1;
        }
    }

    int ret = TyErr_WarnExplicitObject(category, message, filename, lineno,
                                       module, registry);
    Ty_XDECREF(module);
    Ty_DECREF(filename);
    Ty_DECREF(message);
    return ret;
}

int
TyErr_WarnExplicitFormat(TyObject *category,
                         const char *filename_str, int lineno,
                         const char *module_str, TyObject *registry,
                         const char *format, ...)
{
    TyObject *message;
    TyObject *module = NULL;
    TyObject *filename = TyUnicode_DecodeFSDefault(filename_str);
    int ret = -1;
    va_list vargs;

    if (filename == NULL)
        goto exit;
    if (module_str != NULL) {
        module = TyUnicode_FromString(module_str);
        if (module == NULL)
            goto exit;
    }

    va_start(vargs, format);
    message = TyUnicode_FromFormatV(format, vargs);
    if (message != NULL) {
        TyObject *res;
        TyThreadState *tstate = get_current_tstate();
        if (tstate != NULL) {
            warnings_lock(tstate->interp);
            res = warn_explicit(tstate, category, message, filename, lineno,
                                module, registry, NULL, NULL);
            warnings_unlock(tstate->interp);
            Ty_DECREF(message);
            if (res != NULL) {
                Ty_DECREF(res);
                ret = 0;
            }
        }
    }
    va_end(vargs);
exit:
    Ty_XDECREF(module);
    Ty_XDECREF(filename);
    return ret;
}

void
_TyErr_WarnUnawaitedAgenMethod(PyAsyncGenObject *agen, TyObject *method)
{
    TyObject *exc = TyErr_GetRaisedException();
    if (_TyErr_WarnFormat((TyObject *)agen, TyExc_RuntimeWarning, 1,
                          "coroutine method %R of %R was never awaited",
                          method, agen->ag_qualname) < 0)
    {
        TyErr_FormatUnraisable("Exception ignored while "
                               "finalizing async generator %R", agen);
    }
    TyErr_SetRaisedException(exc);
}


void
_TyErr_WarnUnawaitedCoroutine(TyObject *coro)
{
    /* First, we attempt to funnel the warning through
       warnings._warn_unawaited_coroutine.

       This could raise an exception, due to:
       - a bug
       - some kind of shutdown-related brokenness
       - succeeding, but with an "error" warning filter installed, so the
         warning is converted into a RuntimeWarning exception

       In the first two cases, we want to print the error (so we know what it
       is!), and then print a warning directly as a fallback. In the last
       case, we want to print the error (since it's the warning!), but *not*
       do a fallback. And after we print the error we can't check for what
       type of error it was (because TyErr_WriteUnraisable clears it), so we
       need a flag to keep track.

       Since this is called from __del__ context, it's careful to never raise
       an exception.
    */
    int warned = 0;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp != NULL);
    TyObject *fn = GET_WARNINGS_ATTR(interp, _warn_unawaited_coroutine, 1);
    if (fn) {
        TyObject *res = PyObject_CallOneArg(fn, coro);
        Ty_DECREF(fn);
        if (res || TyErr_ExceptionMatches(TyExc_RuntimeWarning)) {
            warned = 1;
        }
        Ty_XDECREF(res);
    }

    if (TyErr_Occurred()) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "finalizing coroutine %R", coro);
    }

    if (!warned) {
        if (_TyErr_WarnFormat(coro, TyExc_RuntimeWarning, 1,
                              "coroutine '%S' was never awaited",
                              ((PyCoroObject *)coro)->cr_qualname) < 0)
        {
            TyErr_FormatUnraisable("Exception ignored while "
                                   "finalizing coroutine %R", coro);
        }
    }
}

static TyMethodDef warnings_functions[] = {
    WARNINGS_WARN_METHODDEF
    WARNINGS_WARN_EXPLICIT_METHODDEF
    WARNINGS_FILTERS_MUTATED_LOCK_HELD_METHODDEF
    WARNINGS_ACQUIRE_LOCK_METHODDEF
    WARNINGS_RELEASE_LOCK_METHODDEF
    /* XXX(brett.cannon): add showwarning? */
    /* XXX(brett.cannon): Reasonable to add formatwarning? */
    {NULL, NULL}                /* sentinel */
};


static int
warnings_module_exec(TyObject *module)
{
    TyInterpreterState *interp = get_current_interp();
    if (interp == NULL) {
        return -1;
    }
    WarningsState *st = warnings_get_state(interp);
    if (st == NULL) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "filters", st->filters) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "_onceregistry", st->once_registry) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "_defaultaction", st->default_action) < 0) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "_warnings_context", st->context) < 0) {
        return -1;
    }
    return 0;
}


static PyModuleDef_Slot warnings_slots[] = {
    {Ty_mod_exec, warnings_module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef warnings_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = MODULE_NAME,
    .m_doc = warnings__doc__,
    .m_size = 0,
    .m_methods = warnings_functions,
    .m_slots = warnings_slots,
};


PyMODINIT_FUNC
_TyWarnings_Init(void)
{
    return PyModuleDef_Init(&warnings_module);
}

// We need this to ensure that warnings still work until late in finalization.
void
_TyWarnings_Fini(TyInterpreterState *interp)
{
    warnings_clear_state(&interp->warnings);
}
