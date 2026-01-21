#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
// windows.h must be included before pycore internal headers
#ifdef MS_WIN32
#  include <windows.h>
#endif

#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_runtime.h"       // _Ty_ID()

#ifdef MS_WIN32
#  include <malloc.h>
#endif

#include <ffi.h>
#include "ctypes.h"

#ifdef HAVE_ALLOCA_H
/* AIX needs alloca.h for alloca() */
#include <alloca.h>
#endif

/**************************************************************/

static int
CThunkObject_traverse(TyObject *myself, visitproc visit, void *arg)
{
    CThunkObject *self = (CThunkObject *)myself;
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->converters);
    Ty_VISIT(self->callable);
    Ty_VISIT(self->restype);
    return 0;
}

static int
CThunkObject_clear(TyObject *myself)
{
    CThunkObject *self = (CThunkObject *)myself;
    Ty_CLEAR(self->converters);
    Ty_CLEAR(self->callable);
    Ty_CLEAR(self->restype);
    return 0;
}

static void
CThunkObject_dealloc(TyObject *myself)
{
    CThunkObject *self = (CThunkObject *)myself;
    TyTypeObject *tp = Ty_TYPE(myself);
    PyObject_GC_UnTrack(self);
    (void)CThunkObject_clear(myself);
    if (self->pcl_write) {
        Ty_ffi_closure_free(self->pcl_write);
    }
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static TyType_Slot cthunk_slots[] = {
    {Ty_tp_doc, (void *)TyDoc_STR("CThunkObject")},
    {Ty_tp_dealloc, CThunkObject_dealloc},
    {Ty_tp_traverse, CThunkObject_traverse},
    {Ty_tp_clear, CThunkObject_clear},
    {0, NULL},
};

TyType_Spec cthunk_spec = {
    .name = "_ctypes.CThunkObject",
    .basicsize = sizeof(CThunkObject),
    .itemsize = sizeof(ffi_type),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = cthunk_slots,
};

/**************************************************************/

#ifdef MS_WIN32
/*
 * We must call AddRef() on non-NULL COM pointers we receive as arguments
 * to callback functions - these functions are COM method implementations.
 * The Python instances we create have a __del__ method which calls Release().
 *
 * The presence of a class attribute named '_needs_com_addref_' triggers this
 * behaviour.  It would also be possible to call the AddRef() Python method,
 * after checking for PyObject_IsTrue(), but this would probably be somewhat
 * slower.
 */
static int
TryAddRef(TyObject *cnv, CDataObject *obj)
{
    IUnknown *punk;
    TyObject *attrdict = _TyType_GetDict((TyTypeObject *)cnv);
    if (!attrdict) {
        return 0;
    }
    int r = TyDict_Contains(attrdict, &_Ty_ID(_needs_com_addref_));
    if (r <= 0) {
        return r;
    }

    punk = *(IUnknown **)obj->b_ptr;
    if (punk)
        punk->lpVtbl->AddRef(punk);
    return 0;
}
#endif

/******************************************************************************
 *
 * Call the python object with all arguments
 *
 */

// BEWARE: The GIL needs to be held throughout the function
static void _CallPythonObject(ctypes_state *st,
                              void *mem,
                              ffi_type *restype,
                              SETFUNC setfunc,
                              TyObject *callable,
                              TyObject *converters,
                              int flags,
                              void **pArgs)
{
    TyObject *result = NULL;
    Ty_ssize_t i = 0, j = 0, nargs = 0;
    TyObject *error_object = NULL;
    int *space;

    assert(TyTuple_Check(converters));
    nargs = TyTuple_GET_SIZE(converters);
    assert(nargs <= CTYPES_MAX_ARGCOUNT);
    TyObject **args = alloca(nargs * sizeof(TyObject *));
    TyObject **cnvs = PySequence_Fast_ITEMS(converters);
    for (i = 0; i < nargs; i++) {
        TyObject *cnv = cnvs[i]; // borrowed ref

        StgInfo *info;
        if (PyStgInfo_FromType(st, cnv, &info) < 0) {
            goto Error;
        }

        if (info && info->getfunc && !_ctypes_simple_instance(st, cnv)) {
            TyObject *v = info->getfunc(*pArgs, info->size);
            if (!v) {
                goto Error;
            }
            args[i] = v;
            /* XXX XXX XX
               We have the problem that c_byte or c_short have info->size of
               1 resp. 4, but these parameters are pushed as sizeof(int) bytes.
               BTW, the same problem occurs when they are pushed as parameters
            */
        }
        else if (info) {
            /* Hm, shouldn't we use PyCData_AtAddress() or something like that instead? */
            CDataObject *obj = (CDataObject *)_TyObject_CallNoArgs(cnv);
            if (!obj) {
                goto Error;
            }
            if (!CDataObject_Check(st, obj)) {
                TyErr_Format(TyExc_TypeError,
                             "%R returned unexpected result of type %T", cnv, obj);
                Ty_DECREF(obj);
                goto Error;
            }
            memcpy(obj->b_ptr, *pArgs, info->size);
            args[i] = (TyObject *)obj;
#ifdef MS_WIN32
            if (TryAddRef(cnv, obj) < 0) {
                goto Error;
            }
#endif
        } else {
            TyErr_Format(TyExc_TypeError,
                         "cannot build parameter of type %R", cnv);
            goto Error;
        }
        /* XXX error handling! */
        pArgs++;
    }

    if (flags & (FUNCFLAG_USE_ERRNO | FUNCFLAG_USE_LASTERROR)) {
        error_object = _ctypes_get_errobj(st, &space);
        if (error_object == NULL) {
            TyErr_FormatUnraisable(
                    "Exception ignored while setting error for "
                    "ctypes callback function %R",
                    callable);
            goto Done;
        }
        if (flags & FUNCFLAG_USE_ERRNO) {
            int temp = space[0];
            space[0] = errno;
            errno = temp;
        }
#ifdef MS_WIN32
        if (flags & FUNCFLAG_USE_LASTERROR) {
            int temp = space[1];
            space[1] = GetLastError();
            SetLastError(temp);
        }
#endif
    }

    result = PyObject_Vectorcall(callable, args, nargs, NULL);
    if (result == NULL) {
        TyErr_FormatUnraisable("Exception ignored while "
                               "calling ctypes callback function %R",
                               callable);
    }

#ifdef MS_WIN32
    if (flags & FUNCFLAG_USE_LASTERROR) {
        int temp = space[1];
        space[1] = GetLastError();
        SetLastError(temp);
    }
#endif
    if (flags & FUNCFLAG_USE_ERRNO) {
        int temp = space[0];
        space[0] = errno;
        errno = temp;
    }
    Ty_XDECREF(error_object);

    if (restype != &ffi_type_void && result) {
        assert(setfunc);

#ifdef WORDS_BIGENDIAN
        /* See the corresponding code in _ctypes_callproc():
           in callproc.c, around line 1219. */
        if (restype->type != FFI_TYPE_FLOAT && restype->size < sizeof(ffi_arg)) {
            mem = (char *)mem + sizeof(ffi_arg) - restype->size;
        }
#endif

        /* keep is an object we have to keep alive so that the result
           stays valid.  If there is no such object, the setfunc will
           have returned Ty_None.

           If there is such an object, we have no choice than to keep
           it alive forever - but a refcount and/or memory leak will
           be the result.  EXCEPT when restype is py_object - Python
           itself knows how to manage the refcount of these objects.
        */
        TyObject *keep = setfunc(mem, result, restype->size);

        if (keep == NULL) {
            /* Could not convert callback result. */
            TyErr_FormatUnraisable(
                    "Exception ignored while converting result "
                    "of ctypes callback function %R",
                    callable);
        }
        else if (setfunc != _ctypes_get_fielddesc("O")->setfunc) {
            if (keep == Ty_None) {
                /* Nothing to keep */
                Ty_DECREF(keep);
            }
            else if (TyErr_WarnEx(TyExc_RuntimeWarning,
                                  "memory leak in callback function.",
                                  1) == -1) {
                TyErr_FormatUnraisable(
                        "Exception ignored while converting result "
                        "of ctypes callback function %R",
                        callable);
            }
        }
    }

    Ty_XDECREF(result);

  Done:
    for (j = 0; j < i; j++) {
        Ty_DECREF(args[j]);
    }
    return;

  Error:
    TyErr_FormatUnraisable(
            "Exception ignored while creating argument %zd for "
            "ctypes callback function %R",
            i, callable);
    goto Done;
}

static void closure_fcn(ffi_cif *cif,
                        void *resp,
                        void **args,
                        void *userdata)
{
    TyGILState_STATE state = TyGILState_Ensure();

    CThunkObject *p = (CThunkObject *)userdata;
    ctypes_state *st = get_module_state_by_class(Ty_TYPE(p));

    _CallPythonObject(st,
                      resp,
                      p->ffi_restype,
                      p->setfunc,
                      p->callable,
                      p->converters,
                      p->flags,
                      args);

    TyGILState_Release(state);
}

static CThunkObject* CThunkObject_new(ctypes_state *st, Ty_ssize_t nargs)
{
    CThunkObject *p;
    Ty_ssize_t i;

    p = PyObject_GC_NewVar(CThunkObject, st->PyCThunk_Type, nargs);
    if (p == NULL) {
        return NULL;
    }

    p->pcl_write = NULL;
    p->pcl_exec = NULL;
    memset(&p->cif, 0, sizeof(p->cif));
    p->flags = 0;
    p->converters = NULL;
    p->callable = NULL;
    p->restype = NULL;
    p->setfunc = NULL;
    p->ffi_restype = NULL;

    for (i = 0; i < nargs + 1; ++i)
        p->atypes[i] = NULL;
    PyObject_GC_Track((TyObject *)p);
    return p;
}

CThunkObject *_ctypes_alloc_callback(ctypes_state *st,
                                    TyObject *callable,
                                    TyObject *converters,
                                    TyObject *restype,
                                    int flags)
{
    int result;
    CThunkObject *p;
    Ty_ssize_t nargs, i;
    ffi_abi cc;

    assert(TyTuple_Check(converters));
    nargs = TyTuple_GET_SIZE(converters);
    p = CThunkObject_new(st, nargs);
    if (p == NULL)
        return NULL;

    assert(CThunk_CheckExact(st, (TyObject *)p));

    p->pcl_write = Ty_ffi_closure_alloc(sizeof(ffi_closure), &p->pcl_exec);
    if (p->pcl_write == NULL) {
        TyErr_NoMemory();
        goto error;
    }

    p->flags = flags;
    TyObject **cnvs = PySequence_Fast_ITEMS(converters);
    for (i = 0; i < nargs; ++i) {
        TyObject *cnv = cnvs[i]; // borrowed ref
        p->atypes[i] = _ctypes_get_ffi_type(st, cnv);
    }
    p->atypes[i] = NULL;

    p->restype = Ty_NewRef(restype);
    if (restype == Ty_None) {
        p->setfunc = NULL;
        p->ffi_restype = &ffi_type_void;
    } else {
        StgInfo *info;
        if (PyStgInfo_FromType(st, restype, &info) < 0) {
            goto error;
        }

        if (info == NULL || info->setfunc == NULL) {
          TyErr_SetString(TyExc_TypeError,
                          "invalid result type for callback function");
          goto error;
        }
        p->setfunc = info->setfunc;
        p->ffi_restype = &info->ffi_type_pointer;
    }

    cc = FFI_DEFAULT_ABI;
#if defined(MS_WIN32) && !defined(_WIN32_WCE) && !defined(MS_WIN64) && !defined(_M_ARM)
    if ((flags & FUNCFLAG_CDECL) == 0)
        cc = FFI_STDCALL;
#endif
    result = ffi_prep_cif(&p->cif, cc,
                          Ty_SAFE_DOWNCAST(nargs, Ty_ssize_t, int),
                          p->ffi_restype,
                          &p->atypes[0]);
    if (result != FFI_OK) {
        TyErr_Format(TyExc_RuntimeError,
                     "ffi_prep_cif failed with %d", result);
        goto error;
    }


#if HAVE_FFI_PREP_CLOSURE_LOC
#   ifdef USING_APPLE_OS_LIBFFI
#    ifdef HAVE_BUILTIN_AVAILABLE
#      define HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME __builtin_available(macos 10.15, ios 13, watchos 6, tvos 13, *)
#    else
#      define HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME (ffi_prep_closure_loc != NULL)
#    endif
#   else
#      define HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME 1
#   endif
    if (HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME) {
        result = ffi_prep_closure_loc(p->pcl_write, &p->cif, closure_fcn,
                                    p,
                                    p->pcl_exec);
    } else
#endif
    {
#if defined(USING_APPLE_OS_LIBFFI) && defined(__arm64__)
        TyErr_Format(TyExc_NotImplementedError, "ffi_prep_closure_loc() is missing");
        goto error;
#else
        // GH-85272, GH-23327, GH-100540: On macOS,
        // HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME is checked at runtime because the
        // symbol might not be available at runtime when targeting macOS 10.14
        // or earlier. Even if ffi_prep_closure_loc() is called in practice,
        // the deprecated ffi_prep_closure() code path is needed if
        // HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME is false.
        //
        // On non-macOS platforms, even if HAVE_FFI_PREP_CLOSURE_LOC_RUNTIME is
        // defined as 1 and ffi_prep_closure_loc() is used in practice, this
        // code path is still compiled and emits a compiler warning. The
        // deprecated code path is likely to be removed by a simple
        // optimization pass.
        //
        // Ignore the compiler warning on the ffi_prep_closure() deprecation,
        // rather than using complex #if/#else code paths for the different
        // platforms.
        _Ty_COMP_DIAG_PUSH
        _Ty_COMP_DIAG_IGNORE_DEPR_DECLS
        result = ffi_prep_closure(p->pcl_write, &p->cif, closure_fcn, p);
        _Ty_COMP_DIAG_POP
#endif
    }

    if (result != FFI_OK) {
        TyErr_Format(TyExc_RuntimeError,
                     "ffi_prep_closure failed with %d", result);
        goto error;
    }

    p->converters = Ty_NewRef(converters);
    p->callable = Ty_NewRef(callable);
    return p;

  error:
    Ty_XDECREF(p);
    return NULL;
}

#ifdef MS_WIN32

static void LoadPython(void)
{
    if (!Ty_IsInitialized()) {
        Ty_Initialize();
    }
}

/******************************************************************/

long Call_GetClassObject(REFCLSID rclsid, REFIID riid, LPVOID *ppv)
{
    TyObject *func, *result;
    long retval;

    func = TyImport_ImportModuleAttrString("ctypes", "DllGetClassObject");
    if (!func) {
        /* There has been a warning before about this already */
        goto error;
    }

    {
        TyObject *py_rclsid = TyLong_FromVoidPtr((void *)rclsid);
        if (py_rclsid == NULL) {
            Ty_DECREF(func);
            goto error;
        }
        TyObject *py_riid = TyLong_FromVoidPtr((void *)riid);
        if (py_riid == NULL) {
            Ty_DECREF(func);
            Ty_DECREF(py_rclsid);
            goto error;
        }
        TyObject *py_ppv = TyLong_FromVoidPtr(ppv);
        if (py_ppv == NULL) {
            Ty_DECREF(py_rclsid);
            Ty_DECREF(py_riid);
            Ty_DECREF(func);
            goto error;
        }
        result = PyObject_CallFunctionObjArgs(func,
                                              py_rclsid,
                                              py_riid,
                                              py_ppv,
                                              NULL);
        Ty_DECREF(py_rclsid);
        Ty_DECREF(py_riid);
        Ty_DECREF(py_ppv);
    }
    Ty_DECREF(func);
    if (!result) {
        goto error;
    }

    retval = TyLong_AsLong(result);
    if (TyErr_Occurred()) {
        Ty_DECREF(result);
        goto error;
    }
    Ty_DECREF(result);
    return retval;

error:
    TyErr_FormatUnraisable("Exception ignored while calling "
                           "ctypes.DllGetClassObject");
    return E_FAIL;
}

STDAPI DllGetClassObject(REFCLSID rclsid,
                         REFIID riid,
                         LPVOID *ppv)
{
    long result;
    TyGILState_STATE state;

    LoadPython();
    state = TyGILState_Ensure();
    result = Call_GetClassObject(rclsid, riid, ppv);
    TyGILState_Release(state);
    return result;
}

long Call_CanUnloadNow(void)
{
    TyObject *func = TyImport_ImportModuleAttrString("ctypes",
                                                     "DllCanUnloadNow");
    if (!func) {
        goto error;
    }

    TyObject *result = _TyObject_CallNoArgs(func);
    Ty_DECREF(func);
    if (!result) {
        goto error;
    }

    long retval = TyLong_AsLong(result);
    if (TyErr_Occurred()) {
        Ty_DECREF(result);
        goto error;
    }
    Ty_DECREF(result);
    return retval;

error:
    TyErr_FormatUnraisable("Exception ignored while calling "
                           "ctypes.DllCanUnloadNow");
    return E_FAIL;
}

/*
  DllRegisterServer and DllUnregisterServer still missing
*/

STDAPI DllCanUnloadNow(void)
{
    long result;
    TyGILState_STATE state = TyGILState_Ensure();
    result = Call_CanUnloadNow();
    TyGILState_Release(state);
    return result;
}

#ifndef Ty_NO_ENABLE_SHARED
BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvRes)
{
    switch(fdwReason) {
    case DLL_PROCESS_ATTACH:
        DisableThreadLibraryCalls(hinstDLL);
        break;
    }
    return TRUE;
}
#endif

#endif

/*
 Local Variables:
 compile-command: "cd .. && python setup.py -q build_ext"
 End:
*/
