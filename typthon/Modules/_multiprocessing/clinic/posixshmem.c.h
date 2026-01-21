/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(HAVE_SHM_OPEN)

TyDoc_STRVAR(_posixshmem_shm_open__doc__,
"shm_open($module, /, path, flags, mode=511)\n"
"--\n"
"\n"
"Open a shared memory object.  Returns a file descriptor (integer).");

#define _POSIXSHMEM_SHM_OPEN_METHODDEF    \
    {"shm_open", (PyCFunction)(void(*)(void))_posixshmem_shm_open, METH_VARARGS|METH_KEYWORDS, _posixshmem_shm_open__doc__},

static int
_posixshmem_shm_open_impl(TyObject *module, TyObject *path, int flags,
                          int mode);

static TyObject *
_posixshmem_shm_open(TyObject *module, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    static char *_keywords[] = {"path", "flags", "mode", NULL};
    TyObject *path;
    int flags;
    int mode = 511;
    int _return_value;

    if (!TyArg_ParseTupleAndKeywords(args, kwargs, "Ui|i:shm_open", _keywords,
        &path, &flags, &mode))
        goto exit;
    _return_value = _posixshmem_shm_open_impl(module, path, flags, mode);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SHM_OPEN) */

#if defined(HAVE_SHM_UNLINK)

TyDoc_STRVAR(_posixshmem_shm_unlink__doc__,
"shm_unlink($module, path, /)\n"
"--\n"
"\n"
"Remove a shared memory object (similar to unlink()).\n"
"\n"
"Remove a shared memory object name, and, once all processes  have  unmapped\n"
"the object, de-allocates and destroys the contents of the associated memory\n"
"region.");

#define _POSIXSHMEM_SHM_UNLINK_METHODDEF    \
    {"shm_unlink", (PyCFunction)_posixshmem_shm_unlink, METH_O, _posixshmem_shm_unlink__doc__},

static TyObject *
_posixshmem_shm_unlink_impl(TyObject *module, TyObject *path);

static TyObject *
_posixshmem_shm_unlink(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *path;

    if (!TyUnicode_Check(arg)) {
        TyErr_Format(TyExc_TypeError, "shm_unlink() argument must be str, not %T", arg);
        goto exit;
    }
    path = arg;
    return_value = _posixshmem_shm_unlink_impl(module, path);

exit:
    return return_value;
}

#endif /* defined(HAVE_SHM_UNLINK) */

#ifndef _POSIXSHMEM_SHM_OPEN_METHODDEF
    #define _POSIXSHMEM_SHM_OPEN_METHODDEF
#endif /* !defined(_POSIXSHMEM_SHM_OPEN_METHODDEF) */

#ifndef _POSIXSHMEM_SHM_UNLINK_METHODDEF
    #define _POSIXSHMEM_SHM_UNLINK_METHODDEF
#endif /* !defined(_POSIXSHMEM_SHM_UNLINK_METHODDEF) */
/*[clinic end generated code: output=74588a5abba6e36c input=a9049054013a1b77]*/
