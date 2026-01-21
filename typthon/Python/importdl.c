
/* Support for dynamic loading of extension modules */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallMethod()
#include "pycore_import.h"        // _TyImport_SwapPackageContext()
#include "pycore_importdl.h"
#include "pycore_moduleobject.h"  // _TyModule_GetDef()
#include "pycore_pyerrors.h"      // _TyErr_FormatFromCause()
#include "pycore_runtime.h"       // _Ty_ID()


/* ./configure sets HAVE_DYNAMIC_LOADING if dynamic loading of modules is
   supported on this platform. configure will then compile and link in one
   of the dynload_*.c files, as appropriate. We will call a function in
   those modules to get a function pointer to the module's init function.
*/
#ifdef HAVE_DYNAMIC_LOADING

#ifdef MS_WINDOWS
extern dl_funcptr _TyImport_FindSharedFuncptrWindows(const char *prefix,
                                                     const char *shortname,
                                                     TyObject *pathname,
                                                     FILE *fp);
#else
extern dl_funcptr _TyImport_FindSharedFuncptr(const char *prefix,
                                              const char *shortname,
                                              const char *pathname, FILE *fp);
#endif

#endif /* HAVE_DYNAMIC_LOADING */


/***********************************/
/* module info to use when loading */
/***********************************/

static const char * const ascii_only_prefix = "PyInit";
static const char * const nonascii_prefix = "PyInitU";

/* Get the variable part of a module's export symbol name.
 * Returns a bytes instance. For non-ASCII-named modules, the name is
 * encoded as per PEP 489.
 * The hook_prefix pointer is set to either ascii_only_prefix or
 * nonascii_prefix, as appropriate.
 */
static TyObject *
get_encoded_name(TyObject *name, const char **hook_prefix) {
    TyObject *tmp;
    TyObject *encoded = NULL;
    TyObject *modname = NULL;
    Ty_ssize_t name_len, lastdot;

    /* Get the short name (substring after last dot) */
    name_len = TyUnicode_GetLength(name);
    if (name_len < 0) {
        return NULL;
    }
    lastdot = TyUnicode_FindChar(name, '.', 0, name_len, -1);
    if (lastdot < -1) {
        return NULL;
    } else if (lastdot >= 0) {
        tmp = TyUnicode_Substring(name, lastdot + 1, name_len);
        if (tmp == NULL)
            return NULL;
        name = tmp;
        /* "name" now holds a new reference to the substring */
    } else {
        Ty_INCREF(name);
    }

    /* Encode to ASCII or Punycode, as needed */
    encoded = TyUnicode_AsEncodedString(name, "ascii", NULL);
    if (encoded != NULL) {
        *hook_prefix = ascii_only_prefix;
    } else {
        if (TyErr_ExceptionMatches(TyExc_UnicodeEncodeError)) {
            TyErr_Clear();
            encoded = TyUnicode_AsEncodedString(name, "punycode", NULL);
            if (encoded == NULL) {
                goto error;
            }
            *hook_prefix = nonascii_prefix;
        } else {
            goto error;
        }
    }

    /* Replace '-' by '_' */
    modname = _TyObject_CallMethod(encoded, &_Ty_ID(replace), "cc", '-', '_');
    if (modname == NULL)
        goto error;

    Ty_DECREF(name);
    Ty_DECREF(encoded);
    return modname;
error:
    Ty_DECREF(name);
    Ty_XDECREF(encoded);
    return NULL;
}

void
_Ty_ext_module_loader_info_clear(struct _Ty_ext_module_loader_info *info)
{
    Ty_CLEAR(info->filename);
#ifndef MS_WINDOWS
    Ty_CLEAR(info->filename_encoded);
#endif
    Ty_CLEAR(info->name);
    Ty_CLEAR(info->name_encoded);
}

int
_Ty_ext_module_loader_info_init(struct _Ty_ext_module_loader_info *p_info,
                                TyObject *name, TyObject *filename,
                                _Ty_ext_module_origin origin)
{
    struct _Ty_ext_module_loader_info info = {
        .origin=origin,
    };

    assert(name != NULL);
    if (!TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_TypeError,
                        "module name must be a string");
        _Ty_ext_module_loader_info_clear(&info);
        return -1;
    }
    assert(TyUnicode_GetLength(name) > 0);
    info.name = Ty_NewRef(name);

    info.name_encoded = get_encoded_name(info.name, &info.hook_prefix);
    if (info.name_encoded == NULL) {
        _Ty_ext_module_loader_info_clear(&info);
        return -1;
    }

    info.newcontext = TyUnicode_AsUTF8(info.name);
    if (info.newcontext == NULL) {
        _Ty_ext_module_loader_info_clear(&info);
        return -1;
    }

    if (filename != NULL) {
        if (!TyUnicode_Check(filename)) {
            TyErr_SetString(TyExc_TypeError,
                            "module filename must be a string");
            _Ty_ext_module_loader_info_clear(&info);
            return -1;
        }
        info.filename = Ty_NewRef(filename);

#ifndef MS_WINDOWS
        info.filename_encoded = TyUnicode_EncodeFSDefault(info.filename);
        if (info.filename_encoded == NULL) {
            _Ty_ext_module_loader_info_clear(&info);
            return -1;
        }
#endif

        info.path = info.filename;
    }
    else {
        info.path = info.name;
    }

    *p_info = info;
    return 0;
}

int
_Ty_ext_module_loader_info_init_for_builtin(
                            struct _Ty_ext_module_loader_info *info,
                            TyObject *name)
{
    assert(TyUnicode_Check(name));
    assert(TyUnicode_FindChar(name, '.', 0, TyUnicode_GetLength(name), -1) == -1);
    assert(TyUnicode_GetLength(name) > 0);

    TyObject *name_encoded = TyUnicode_AsEncodedString(name, "ascii", NULL);
    if (name_encoded == NULL) {
        return -1;
    }

    *info = (struct _Ty_ext_module_loader_info){
        .name=Ty_NewRef(name),
        .name_encoded=name_encoded,
        /* We won't need filename. */
        .path=name,
        .origin=_Ty_ext_module_origin_BUILTIN,
        .hook_prefix=ascii_only_prefix,
        .newcontext=NULL,
    };
    return 0;
}

int
_Ty_ext_module_loader_info_init_for_core(
                            struct _Ty_ext_module_loader_info *info,
                            TyObject *name)
{
    if (_Ty_ext_module_loader_info_init_for_builtin(info, name) < 0) {
        return -1;
    }
    info->origin = _Ty_ext_module_origin_CORE;
    return 0;
}

#ifdef HAVE_DYNAMIC_LOADING
int
_Ty_ext_module_loader_info_init_from_spec(
                            struct _Ty_ext_module_loader_info *p_info,
                            TyObject *spec)
{
    TyObject *name = PyObject_GetAttrString(spec, "name");
    if (name == NULL) {
        return -1;
    }
    TyObject *filename = PyObject_GetAttrString(spec, "origin");
    if (filename == NULL) {
        Ty_DECREF(name);
        return -1;
    }
    /* We could also accommodate builtin modules here without much trouble. */
    _Ty_ext_module_origin origin = _Ty_ext_module_origin_DYNAMIC;
    int err = _Ty_ext_module_loader_info_init(p_info, name, filename, origin);
    Ty_DECREF(name);
    Ty_DECREF(filename);
    return err;
}
#endif /* HAVE_DYNAMIC_LOADING */


/********************************/
/* module init function results */
/********************************/

void
_Ty_ext_module_loader_result_clear(struct _Ty_ext_module_loader_result *res)
{
    /* Instead, the caller should have called
     * _Ty_ext_module_loader_result_apply_error(). */
    assert(res->err == NULL);
    *res = (struct _Ty_ext_module_loader_result){0};
}

static void
_Ty_ext_module_loader_result_set_error(
                            struct _Ty_ext_module_loader_result *res,
                            enum _Ty_ext_module_loader_result_error_kind kind)
{
#ifndef NDEBUG
    switch (kind) {
    case _Ty_ext_module_loader_result_EXCEPTION: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC:
        assert(TyErr_Occurred());
        break;
    case _Ty_ext_module_loader_result_ERR_MISSING: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_UNINITIALIZED: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NOT_MODULE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_MISSING_DEF:
        assert(!TyErr_Occurred());
        break;
    default:
        /* We added a new error kind but forgot to add it to this switch. */
        assert(0);
    }
#endif

    assert(res->err == NULL && res->_err.exc == NULL);
    res->err = &res->_err;
    *res->err = (struct _Ty_ext_module_loader_result_error){
        .kind=kind,
        .exc=TyErr_GetRaisedException(),
    };

    /* For some kinds, we also set/check res->kind. */
    switch (kind) {
    case _Ty_ext_module_loader_result_ERR_UNINITIALIZED:
        assert(res->kind == _Ty_ext_module_kind_UNKNOWN);
        res->kind = _Ty_ext_module_kind_INVALID;
        break;
    /* None of the rest affect the result kind. */
    case _Ty_ext_module_loader_result_EXCEPTION: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_MISSING: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NOT_MODULE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_MISSING_DEF:
        break;
    default:
        /* We added a new error kind but forgot to add it to this switch. */
        assert(0);
    }
}

void
_Ty_ext_module_loader_result_apply_error(
                            struct _Ty_ext_module_loader_result *res,
                            const char *name)
{
    assert(!TyErr_Occurred());
    assert(res->err != NULL && res->err == &res->_err);
    struct _Ty_ext_module_loader_result_error err = *res->err;
    res->err = NULL;

    /* We're otherwise done with the result at this point. */
    _Ty_ext_module_loader_result_clear(res);

#ifndef NDEBUG
    switch (err.kind) {
    case _Ty_ext_module_loader_result_EXCEPTION: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC:
        assert(err.exc != NULL);
        break;
    case _Ty_ext_module_loader_result_ERR_MISSING: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_UNINITIALIZED: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_NOT_MODULE: _Ty_FALLTHROUGH;
    case _Ty_ext_module_loader_result_ERR_MISSING_DEF:
        assert(err.exc == NULL);
        break;
    default:
        /* We added a new error kind but forgot to add it to this switch. */
        assert(0);
    }
#endif

    const char *msg = NULL;
    switch (err.kind) {
    case _Ty_ext_module_loader_result_EXCEPTION:
        break;
    case _Ty_ext_module_loader_result_ERR_MISSING:
        msg = "initialization of %s failed without raising an exception";
        break;
    case _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC:
        msg = "initialization of %s raised unreported exception";
        break;
    case _Ty_ext_module_loader_result_ERR_UNINITIALIZED:
        msg = "init function of %s returned uninitialized object";
        break;
    case _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE:
        msg = "initialization of %s did not return TyModuleDef";
        break;
    case _Ty_ext_module_loader_result_ERR_NOT_MODULE:
        msg = "initialization of %s did not return an extension module";
        break;
    case _Ty_ext_module_loader_result_ERR_MISSING_DEF:
        msg = "initialization of %s did not return a valid extension module";
        break;
    default:
        /* We added a new error kind but forgot to add it to this switch. */
        assert(0);
        TyErr_Format(TyExc_SystemError,
                     "loading %s failed due to init function", name);
        return;
    }

    if (err.exc != NULL) {
        TyErr_SetRaisedException(err.exc);
        err.exc = NULL;  /* TyErr_SetRaisedException() stole our reference. */
        if (msg != NULL) {
            _TyErr_FormatFromCause(TyExc_SystemError, msg, name);
        }
    }
    else {
        assert(msg != NULL);
        TyErr_Format(TyExc_SystemError, msg, name);
    }
}


/********************************************/
/* getting/running the module init function */
/********************************************/

#ifdef HAVE_DYNAMIC_LOADING
PyModInitFunction
_TyImport_GetModInitFunc(struct _Ty_ext_module_loader_info *info,
                         FILE *fp)
{
    const char *name_buf = TyBytes_AS_STRING(info->name_encoded);
    dl_funcptr exportfunc;
#ifdef MS_WINDOWS
    exportfunc = _TyImport_FindSharedFuncptrWindows(
            info->hook_prefix, name_buf, info->filename, fp);
#else
    {
        const char *path_buf = TyBytes_AS_STRING(info->filename_encoded);
        exportfunc = _TyImport_FindSharedFuncptr(
                        info->hook_prefix, name_buf, path_buf, fp);
    }
#endif

    if (exportfunc == NULL) {
        if (!TyErr_Occurred()) {
            TyObject *msg;
            msg = TyUnicode_FromFormat(
                "dynamic module does not define "
                "module export function (%s_%s)",
                info->hook_prefix, name_buf);
            if (msg != NULL) {
                TyErr_SetImportError(msg, info->name, info->filename);
                Ty_DECREF(msg);
            }
        }
        return NULL;
    }

    return (PyModInitFunction)exportfunc;
}
#endif /* HAVE_DYNAMIC_LOADING */

int
_TyImport_RunModInitFunc(PyModInitFunction p0,
                         struct _Ty_ext_module_loader_info *info,
                         struct _Ty_ext_module_loader_result *p_res)
{
    struct _Ty_ext_module_loader_result res = {
        .kind=_Ty_ext_module_kind_UNKNOWN,
    };

    /* Call the module init function. */

    /* Package context is needed for single-phase init */
    const char *oldcontext = _TyImport_SwapPackageContext(info->newcontext);
    TyObject *m = p0();
    _TyImport_SwapPackageContext(oldcontext);

    /* Validate the result (and populate "res". */

    if (m == NULL) {
        /* The init func for multi-phase init modules is expected
         * to return a TyModuleDef after calling PyModuleDef_Init().
         * That function never raises an exception nor returns NULL,
         * so at this point it must be a single-phase init modules. */
        res.kind = _Ty_ext_module_kind_SINGLEPHASE;
        if (TyErr_Occurred()) {
            _Ty_ext_module_loader_result_set_error(
                        &res, _Ty_ext_module_loader_result_EXCEPTION);
        }
        else {
            _Ty_ext_module_loader_result_set_error(
                        &res, _Ty_ext_module_loader_result_ERR_MISSING);
        }
        goto error;
    } else if (TyErr_Occurred()) {
        /* Likewise, we infer that this is a single-phase init module. */
        res.kind = _Ty_ext_module_kind_SINGLEPHASE;
        _Ty_ext_module_loader_result_set_error(
                &res, _Ty_ext_module_loader_result_ERR_UNREPORTED_EXC);
        /* We would probably be correct to decref m here,
         * but we weren't doing so before,
         * so we stick with doing nothing. */
        m = NULL;
        goto error;
    }

    if (Ty_IS_TYPE(m, NULL)) {
        /* This can happen when a TyModuleDef is returned without calling
         * PyModuleDef_Init on it
         */
        _Ty_ext_module_loader_result_set_error(
                &res, _Ty_ext_module_loader_result_ERR_UNINITIALIZED);
        /* Likewise, decref'ing here makes sense.  However, the original
         * code has a note about "prevent segfault in DECREF",
         * so we play it safe and leave it alone. */
        m = NULL; /* prevent segfault in DECREF */
        goto error;
    }

    if (PyObject_TypeCheck(m, &PyModuleDef_Type)) {
        /* multi-phase init */
        res.kind = _Ty_ext_module_kind_MULTIPHASE;
        res.def = (TyModuleDef *)m;
        /* Run TyModule_FromDefAndSpec() to finish loading the module. */
    }
    else if (info->hook_prefix == nonascii_prefix) {
        /* Non-ASCII is only supported for multi-phase init. */
        res.kind = _Ty_ext_module_kind_MULTIPHASE;
        /* Don't allow legacy init for non-ASCII module names. */
        _Ty_ext_module_loader_result_set_error(
                &res, _Ty_ext_module_loader_result_ERR_NONASCII_NOT_MULTIPHASE);
        goto error;
    }
    else {
        /* single-phase init (legacy) */
        res.kind = _Ty_ext_module_kind_SINGLEPHASE;
        res.module = m;

        if (!TyModule_Check(m)) {
            _Ty_ext_module_loader_result_set_error(
                    &res, _Ty_ext_module_loader_result_ERR_NOT_MODULE);
            goto error;
        }

        res.def = _TyModule_GetDef(m);
        if (res.def == NULL) {
            TyErr_Clear();
            _Ty_ext_module_loader_result_set_error(
                    &res, _Ty_ext_module_loader_result_ERR_MISSING_DEF);
            goto error;
        }
    }

    assert(!TyErr_Occurred());
    assert(res.err == NULL);
    *p_res = res;
    return 0;

error:
    assert(!TyErr_Occurred());
    assert(res.err != NULL);
    Ty_CLEAR(res.module);
    res.def = NULL;
    *p_res = res;
    p_res->err = &p_res->_err;
    return -1;
}
