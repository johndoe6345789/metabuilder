/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_closesocket__doc__,
"closesocket($module, handle, /)\n"
"--\n"
"\n");

#define _MULTIPROCESSING_CLOSESOCKET_METHODDEF    \
    {"closesocket", (PyCFunction)_multiprocessing_closesocket, METH_O, _multiprocessing_closesocket__doc__},

static TyObject *
_multiprocessing_closesocket_impl(TyObject *module, HANDLE handle);

static TyObject *
_multiprocessing_closesocket(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE handle;

    handle = TyLong_AsVoidPtr(arg);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _multiprocessing_closesocket_impl(module, handle);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_recv__doc__,
"recv($module, handle, size, /)\n"
"--\n"
"\n");

#define _MULTIPROCESSING_RECV_METHODDEF    \
    {"recv", _PyCFunction_CAST(_multiprocessing_recv), METH_FASTCALL, _multiprocessing_recv__doc__},

static TyObject *
_multiprocessing_recv_impl(TyObject *module, HANDLE handle, int size);

static TyObject *
_multiprocessing_recv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    int size;

    if (!_TyArg_CheckPositional("recv", nargs, 2, 2)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    size = TyLong_AsInt(args[1]);
    if (size == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _multiprocessing_recv_impl(module, handle, size);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_send__doc__,
"send($module, handle, buf, /)\n"
"--\n"
"\n");

#define _MULTIPROCESSING_SEND_METHODDEF    \
    {"send", _PyCFunction_CAST(_multiprocessing_send), METH_FASTCALL, _multiprocessing_send__doc__},

static TyObject *
_multiprocessing_send_impl(TyObject *module, HANDLE handle, Ty_buffer *buf);

static TyObject *
_multiprocessing_send(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer buf = {NULL, NULL};

    if (!_TyArg_CheckPositional("send", nargs, 2, 2)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &buf, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _multiprocessing_send_impl(module, handle, &buf);

exit:
    /* Cleanup for buf */
    if (buf.obj) {
       PyBuffer_Release(&buf);
    }

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(_multiprocessing_sem_unlink__doc__,
"sem_unlink($module, name, /)\n"
"--\n"
"\n");

#define _MULTIPROCESSING_SEM_UNLINK_METHODDEF    \
    {"sem_unlink", (PyCFunction)_multiprocessing_sem_unlink, METH_O, _multiprocessing_sem_unlink__doc__},

static TyObject *
_multiprocessing_sem_unlink_impl(TyObject *module, const char *name);

static TyObject *
_multiprocessing_sem_unlink(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("sem_unlink", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(arg, &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = _multiprocessing_sem_unlink_impl(module, name);

exit:
    return return_value;
}

#ifndef _MULTIPROCESSING_CLOSESOCKET_METHODDEF
    #define _MULTIPROCESSING_CLOSESOCKET_METHODDEF
#endif /* !defined(_MULTIPROCESSING_CLOSESOCKET_METHODDEF) */

#ifndef _MULTIPROCESSING_RECV_METHODDEF
    #define _MULTIPROCESSING_RECV_METHODDEF
#endif /* !defined(_MULTIPROCESSING_RECV_METHODDEF) */

#ifndef _MULTIPROCESSING_SEND_METHODDEF
    #define _MULTIPROCESSING_SEND_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEND_METHODDEF) */
/*[clinic end generated code: output=73b4cb8428d816da input=a9049054013a1b77]*/
