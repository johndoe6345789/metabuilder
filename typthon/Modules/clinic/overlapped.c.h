/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_long.h"          // _TyLong_UnsignedLong_Converter()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_overlapped_CreateIoCompletionPort__doc__,
"CreateIoCompletionPort($module, handle, port, key, concurrency, /)\n"
"--\n"
"\n"
"Create a completion port or register a handle with a port.");

#define _OVERLAPPED_CREATEIOCOMPLETIONPORT_METHODDEF    \
    {"CreateIoCompletionPort", _PyCFunction_CAST(_overlapped_CreateIoCompletionPort), METH_FASTCALL, _overlapped_CreateIoCompletionPort__doc__},

static TyObject *
_overlapped_CreateIoCompletionPort_impl(TyObject *module, HANDLE FileHandle,
                                        HANDLE ExistingCompletionPort,
                                        ULONG_PTR CompletionKey,
                                        DWORD NumberOfConcurrentThreads);

static TyObject *
_overlapped_CreateIoCompletionPort(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE FileHandle;
    HANDLE ExistingCompletionPort;
    ULONG_PTR CompletionKey;
    DWORD NumberOfConcurrentThreads;

    if (!_TyArg_CheckPositional("CreateIoCompletionPort", nargs, 4, 4)) {
        goto exit;
    }
    FileHandle = TyLong_AsVoidPtr(args[0]);
    if (!FileHandle && TyErr_Occurred()) {
        goto exit;
    }
    ExistingCompletionPort = TyLong_AsVoidPtr(args[1]);
    if (!ExistingCompletionPort && TyErr_Occurred()) {
        goto exit;
    }
    CompletionKey = (uintptr_t)TyLong_AsVoidPtr(args[2]);
    if (!CompletionKey && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[3], &NumberOfConcurrentThreads)) {
        goto exit;
    }
    return_value = _overlapped_CreateIoCompletionPort_impl(module, FileHandle, ExistingCompletionPort, CompletionKey, NumberOfConcurrentThreads);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_GetQueuedCompletionStatus__doc__,
"GetQueuedCompletionStatus($module, port, msecs, /)\n"
"--\n"
"\n"
"Get a message from completion port.\n"
"\n"
"Wait for up to msecs milliseconds.");

#define _OVERLAPPED_GETQUEUEDCOMPLETIONSTATUS_METHODDEF    \
    {"GetQueuedCompletionStatus", _PyCFunction_CAST(_overlapped_GetQueuedCompletionStatus), METH_FASTCALL, _overlapped_GetQueuedCompletionStatus__doc__},

static TyObject *
_overlapped_GetQueuedCompletionStatus_impl(TyObject *module,
                                           HANDLE CompletionPort,
                                           DWORD Milliseconds);

static TyObject *
_overlapped_GetQueuedCompletionStatus(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE CompletionPort;
    DWORD Milliseconds;

    if (!_TyArg_CheckPositional("GetQueuedCompletionStatus", nargs, 2, 2)) {
        goto exit;
    }
    CompletionPort = TyLong_AsVoidPtr(args[0]);
    if (!CompletionPort && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &Milliseconds)) {
        goto exit;
    }
    return_value = _overlapped_GetQueuedCompletionStatus_impl(module, CompletionPort, Milliseconds);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_PostQueuedCompletionStatus__doc__,
"PostQueuedCompletionStatus($module, port, bytes, key, address, /)\n"
"--\n"
"\n"
"Post a message to completion port.");

#define _OVERLAPPED_POSTQUEUEDCOMPLETIONSTATUS_METHODDEF    \
    {"PostQueuedCompletionStatus", _PyCFunction_CAST(_overlapped_PostQueuedCompletionStatus), METH_FASTCALL, _overlapped_PostQueuedCompletionStatus__doc__},

static TyObject *
_overlapped_PostQueuedCompletionStatus_impl(TyObject *module,
                                            HANDLE CompletionPort,
                                            DWORD NumberOfBytes,
                                            ULONG_PTR CompletionKey,
                                            OVERLAPPED *Overlapped);

static TyObject *
_overlapped_PostQueuedCompletionStatus(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE CompletionPort;
    DWORD NumberOfBytes;
    ULONG_PTR CompletionKey;
    OVERLAPPED *Overlapped;

    if (!_TyArg_CheckPositional("PostQueuedCompletionStatus", nargs, 4, 4)) {
        goto exit;
    }
    CompletionPort = TyLong_AsVoidPtr(args[0]);
    if (!CompletionPort && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &NumberOfBytes)) {
        goto exit;
    }
    CompletionKey = (uintptr_t)TyLong_AsVoidPtr(args[2]);
    if (!CompletionKey && TyErr_Occurred()) {
        goto exit;
    }
    Overlapped = TyLong_AsVoidPtr(args[3]);
    if (!Overlapped && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_PostQueuedCompletionStatus_impl(module, CompletionPort, NumberOfBytes, CompletionKey, Overlapped);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_RegisterWaitWithQueue__doc__,
"RegisterWaitWithQueue($module, Object, CompletionPort, Overlapped,\n"
"                      Timeout, /)\n"
"--\n"
"\n"
"Register wait for Object; when complete CompletionPort is notified.");

#define _OVERLAPPED_REGISTERWAITWITHQUEUE_METHODDEF    \
    {"RegisterWaitWithQueue", _PyCFunction_CAST(_overlapped_RegisterWaitWithQueue), METH_FASTCALL, _overlapped_RegisterWaitWithQueue__doc__},

static TyObject *
_overlapped_RegisterWaitWithQueue_impl(TyObject *module, HANDLE Object,
                                       HANDLE CompletionPort,
                                       OVERLAPPED *Overlapped,
                                       DWORD Milliseconds);

static TyObject *
_overlapped_RegisterWaitWithQueue(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE Object;
    HANDLE CompletionPort;
    OVERLAPPED *Overlapped;
    DWORD Milliseconds;

    if (!_TyArg_CheckPositional("RegisterWaitWithQueue", nargs, 4, 4)) {
        goto exit;
    }
    Object = TyLong_AsVoidPtr(args[0]);
    if (!Object && TyErr_Occurred()) {
        goto exit;
    }
    CompletionPort = TyLong_AsVoidPtr(args[1]);
    if (!CompletionPort && TyErr_Occurred()) {
        goto exit;
    }
    Overlapped = TyLong_AsVoidPtr(args[2]);
    if (!Overlapped && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[3], &Milliseconds)) {
        goto exit;
    }
    return_value = _overlapped_RegisterWaitWithQueue_impl(module, Object, CompletionPort, Overlapped, Milliseconds);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_UnregisterWait__doc__,
"UnregisterWait($module, WaitHandle, /)\n"
"--\n"
"\n"
"Unregister wait handle.");

#define _OVERLAPPED_UNREGISTERWAIT_METHODDEF    \
    {"UnregisterWait", (PyCFunction)_overlapped_UnregisterWait, METH_O, _overlapped_UnregisterWait__doc__},

static TyObject *
_overlapped_UnregisterWait_impl(TyObject *module, HANDLE WaitHandle);

static TyObject *
_overlapped_UnregisterWait(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE WaitHandle;

    WaitHandle = TyLong_AsVoidPtr(arg);
    if (!WaitHandle && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_UnregisterWait_impl(module, WaitHandle);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_UnregisterWaitEx__doc__,
"UnregisterWaitEx($module, WaitHandle, Event, /)\n"
"--\n"
"\n"
"Unregister wait handle.");

#define _OVERLAPPED_UNREGISTERWAITEX_METHODDEF    \
    {"UnregisterWaitEx", _PyCFunction_CAST(_overlapped_UnregisterWaitEx), METH_FASTCALL, _overlapped_UnregisterWaitEx__doc__},

static TyObject *
_overlapped_UnregisterWaitEx_impl(TyObject *module, HANDLE WaitHandle,
                                  HANDLE Event);

static TyObject *
_overlapped_UnregisterWaitEx(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE WaitHandle;
    HANDLE Event;

    if (!_TyArg_CheckPositional("UnregisterWaitEx", nargs, 2, 2)) {
        goto exit;
    }
    WaitHandle = TyLong_AsVoidPtr(args[0]);
    if (!WaitHandle && TyErr_Occurred()) {
        goto exit;
    }
    Event = TyLong_AsVoidPtr(args[1]);
    if (!Event && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_UnregisterWaitEx_impl(module, WaitHandle, Event);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_CreateEvent__doc__,
"CreateEvent($module, EventAttributes, ManualReset, InitialState, Name,\n"
"            /)\n"
"--\n"
"\n"
"Create an event.\n"
"\n"
"EventAttributes must be None.");

#define _OVERLAPPED_CREATEEVENT_METHODDEF    \
    {"CreateEvent", _PyCFunction_CAST(_overlapped_CreateEvent), METH_FASTCALL, _overlapped_CreateEvent__doc__},

static TyObject *
_overlapped_CreateEvent_impl(TyObject *module, TyObject *EventAttributes,
                             BOOL ManualReset, BOOL InitialState,
                             const wchar_t *Name);

static TyObject *
_overlapped_CreateEvent(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *EventAttributes;
    BOOL ManualReset;
    BOOL InitialState;
    const wchar_t *Name = NULL;

    if (!_TyArg_CheckPositional("CreateEvent", nargs, 4, 4)) {
        goto exit;
    }
    EventAttributes = args[0];
    ManualReset = TyLong_AsInt(args[1]);
    if (ManualReset == -1 && TyErr_Occurred()) {
        goto exit;
    }
    InitialState = TyLong_AsInt(args[2]);
    if (InitialState == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (args[3] == Ty_None) {
        Name = NULL;
    }
    else if (TyUnicode_Check(args[3])) {
        Name = TyUnicode_AsWideCharString(args[3], NULL);
        if (Name == NULL) {
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("CreateEvent", "argument 4", "str or None", args[3]);
        goto exit;
    }
    return_value = _overlapped_CreateEvent_impl(module, EventAttributes, ManualReset, InitialState, Name);

exit:
    /* Cleanup for Name */
    TyMem_Free((void *)Name);

    return return_value;
}

TyDoc_STRVAR(_overlapped_SetEvent__doc__,
"SetEvent($module, Handle, /)\n"
"--\n"
"\n"
"Set event.");

#define _OVERLAPPED_SETEVENT_METHODDEF    \
    {"SetEvent", (PyCFunction)_overlapped_SetEvent, METH_O, _overlapped_SetEvent__doc__},

static TyObject *
_overlapped_SetEvent_impl(TyObject *module, HANDLE Handle);

static TyObject *
_overlapped_SetEvent(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE Handle;

    Handle = TyLong_AsVoidPtr(arg);
    if (!Handle && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_SetEvent_impl(module, Handle);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_ResetEvent__doc__,
"ResetEvent($module, Handle, /)\n"
"--\n"
"\n"
"Reset event.");

#define _OVERLAPPED_RESETEVENT_METHODDEF    \
    {"ResetEvent", (PyCFunction)_overlapped_ResetEvent, METH_O, _overlapped_ResetEvent__doc__},

static TyObject *
_overlapped_ResetEvent_impl(TyObject *module, HANDLE Handle);

static TyObject *
_overlapped_ResetEvent(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE Handle;

    Handle = TyLong_AsVoidPtr(arg);
    if (!Handle && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_ResetEvent_impl(module, Handle);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_BindLocal__doc__,
"BindLocal($module, handle, family, /)\n"
"--\n"
"\n"
"Bind a socket handle to an arbitrary local port.\n"
"\n"
"family should be AF_INET or AF_INET6.");

#define _OVERLAPPED_BINDLOCAL_METHODDEF    \
    {"BindLocal", _PyCFunction_CAST(_overlapped_BindLocal), METH_FASTCALL, _overlapped_BindLocal__doc__},

static TyObject *
_overlapped_BindLocal_impl(TyObject *module, HANDLE Socket, int Family);

static TyObject *
_overlapped_BindLocal(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE Socket;
    int Family;

    if (!_TyArg_CheckPositional("BindLocal", nargs, 2, 2)) {
        goto exit;
    }
    Socket = TyLong_AsVoidPtr(args[0]);
    if (!Socket && TyErr_Occurred()) {
        goto exit;
    }
    Family = TyLong_AsInt(args[1]);
    if (Family == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_BindLocal_impl(module, Socket, Family);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_FormatMessage__doc__,
"FormatMessage($module, error_code, /)\n"
"--\n"
"\n"
"Return error message for an error code.");

#define _OVERLAPPED_FORMATMESSAGE_METHODDEF    \
    {"FormatMessage", (PyCFunction)_overlapped_FormatMessage, METH_O, _overlapped_FormatMessage__doc__},

static TyObject *
_overlapped_FormatMessage_impl(TyObject *module, DWORD code);

static TyObject *
_overlapped_FormatMessage(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    DWORD code;

    if (!_TyLong_UnsignedLong_Converter(arg, &code)) {
        goto exit;
    }
    return_value = _overlapped_FormatMessage_impl(module, code);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped__doc__,
"Overlapped(event=_overlapped.INVALID_HANDLE_VALUE)\n"
"--\n"
"\n"
"OVERLAPPED structure wrapper.");

static TyObject *
_overlapped_Overlapped_impl(TyTypeObject *type, HANDLE event);

static TyObject *
_overlapped_Overlapped(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(event), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"event", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "Overlapped",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    HANDLE event = INVALID_HANDLE_VALUE;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    event = TyLong_AsVoidPtr(fastargs[0]);
    if (!event && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = _overlapped_Overlapped_impl(type, event);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_cancel__doc__,
"cancel($self, /)\n"
"--\n"
"\n"
"Cancel overlapped operation.");

#define _OVERLAPPED_OVERLAPPED_CANCEL_METHODDEF    \
    {"cancel", (PyCFunction)_overlapped_Overlapped_cancel, METH_NOARGS, _overlapped_Overlapped_cancel__doc__},

static TyObject *
_overlapped_Overlapped_cancel_impl(OverlappedObject *self);

static TyObject *
_overlapped_Overlapped_cancel(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _overlapped_Overlapped_cancel_impl((OverlappedObject *)self);
}

TyDoc_STRVAR(_overlapped_Overlapped_getresult__doc__,
"getresult($self, wait=False, /)\n"
"--\n"
"\n"
"Retrieve result of operation.\n"
"\n"
"If wait is true then it blocks until the operation is finished.  If wait\n"
"is false and the operation is still pending then an error is raised.");

#define _OVERLAPPED_OVERLAPPED_GETRESULT_METHODDEF    \
    {"getresult", _PyCFunction_CAST(_overlapped_Overlapped_getresult), METH_FASTCALL, _overlapped_Overlapped_getresult__doc__},

static TyObject *
_overlapped_Overlapped_getresult_impl(OverlappedObject *self, BOOL wait);

static TyObject *
_overlapped_Overlapped_getresult(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    BOOL wait = FALSE;

    if (!_TyArg_CheckPositional("getresult", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    wait = TyLong_AsInt(args[0]);
    if (wait == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = _overlapped_Overlapped_getresult_impl((OverlappedObject *)self, wait);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_ReadFile__doc__,
"ReadFile($self, handle, size, /)\n"
"--\n"
"\n"
"Start overlapped read.");

#define _OVERLAPPED_OVERLAPPED_READFILE_METHODDEF    \
    {"ReadFile", _PyCFunction_CAST(_overlapped_Overlapped_ReadFile), METH_FASTCALL, _overlapped_Overlapped_ReadFile__doc__},

static TyObject *
_overlapped_Overlapped_ReadFile_impl(OverlappedObject *self, HANDLE handle,
                                     DWORD size);

static TyObject *
_overlapped_Overlapped_ReadFile(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    DWORD size;

    if (!_TyArg_CheckPositional("ReadFile", nargs, 2, 2)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &size)) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_ReadFile_impl((OverlappedObject *)self, handle, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_ReadFileInto__doc__,
"ReadFileInto($self, handle, buf, /)\n"
"--\n"
"\n"
"Start overlapped receive.");

#define _OVERLAPPED_OVERLAPPED_READFILEINTO_METHODDEF    \
    {"ReadFileInto", _PyCFunction_CAST(_overlapped_Overlapped_ReadFileInto), METH_FASTCALL, _overlapped_Overlapped_ReadFileInto__doc__},

static TyObject *
_overlapped_Overlapped_ReadFileInto_impl(OverlappedObject *self,
                                         HANDLE handle, Ty_buffer *bufobj);

static TyObject *
_overlapped_Overlapped_ReadFileInto(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};

    if (!_TyArg_CheckPositional("ReadFileInto", nargs, 2, 2)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_ReadFileInto_impl((OverlappedObject *)self, handle, &bufobj);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSARecv__doc__,
"WSARecv($self, handle, size, flags=0, /)\n"
"--\n"
"\n"
"Start overlapped receive.");

#define _OVERLAPPED_OVERLAPPED_WSARECV_METHODDEF    \
    {"WSARecv", _PyCFunction_CAST(_overlapped_Overlapped_WSARecv), METH_FASTCALL, _overlapped_Overlapped_WSARecv__doc__},

static TyObject *
_overlapped_Overlapped_WSARecv_impl(OverlappedObject *self, HANDLE handle,
                                    DWORD size, DWORD flags);

static TyObject *
_overlapped_Overlapped_WSARecv(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    DWORD size;
    DWORD flags = 0;

    if (!_TyArg_CheckPositional("WSARecv", nargs, 2, 3)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &size)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &flags)) {
        goto exit;
    }
skip_optional:
    return_value = _overlapped_Overlapped_WSARecv_impl((OverlappedObject *)self, handle, size, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSARecvInto__doc__,
"WSARecvInto($self, handle, buf, flags, /)\n"
"--\n"
"\n"
"Start overlapped receive.");

#define _OVERLAPPED_OVERLAPPED_WSARECVINTO_METHODDEF    \
    {"WSARecvInto", _PyCFunction_CAST(_overlapped_Overlapped_WSARecvInto), METH_FASTCALL, _overlapped_Overlapped_WSARecvInto__doc__},

static TyObject *
_overlapped_Overlapped_WSARecvInto_impl(OverlappedObject *self,
                                        HANDLE handle, Ty_buffer *bufobj,
                                        DWORD flags);

static TyObject *
_overlapped_Overlapped_WSARecvInto(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};
    DWORD flags;

    if (!_TyArg_CheckPositional("WSARecvInto", nargs, 3, 3)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &flags)) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_WSARecvInto_impl((OverlappedObject *)self, handle, &bufobj, flags);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WriteFile__doc__,
"WriteFile($self, handle, buf, /)\n"
"--\n"
"\n"
"Start overlapped write.");

#define _OVERLAPPED_OVERLAPPED_WRITEFILE_METHODDEF    \
    {"WriteFile", _PyCFunction_CAST(_overlapped_Overlapped_WriteFile), METH_FASTCALL, _overlapped_Overlapped_WriteFile__doc__},

static TyObject *
_overlapped_Overlapped_WriteFile_impl(OverlappedObject *self, HANDLE handle,
                                      Ty_buffer *bufobj);

static TyObject *
_overlapped_Overlapped_WriteFile(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};

    if (!_TyArg_CheckPositional("WriteFile", nargs, 2, 2)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_WriteFile_impl((OverlappedObject *)self, handle, &bufobj);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSASend__doc__,
"WSASend($self, handle, buf, flags, /)\n"
"--\n"
"\n"
"Start overlapped send.");

#define _OVERLAPPED_OVERLAPPED_WSASEND_METHODDEF    \
    {"WSASend", _PyCFunction_CAST(_overlapped_Overlapped_WSASend), METH_FASTCALL, _overlapped_Overlapped_WSASend__doc__},

static TyObject *
_overlapped_Overlapped_WSASend_impl(OverlappedObject *self, HANDLE handle,
                                    Ty_buffer *bufobj, DWORD flags);

static TyObject *
_overlapped_Overlapped_WSASend(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};
    DWORD flags;

    if (!_TyArg_CheckPositional("WSASend", nargs, 3, 3)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &flags)) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_WSASend_impl((OverlappedObject *)self, handle, &bufobj, flags);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_AcceptEx__doc__,
"AcceptEx($self, listen_handle, accept_handle, /)\n"
"--\n"
"\n"
"Start overlapped wait for client to connect.");

#define _OVERLAPPED_OVERLAPPED_ACCEPTEX_METHODDEF    \
    {"AcceptEx", _PyCFunction_CAST(_overlapped_Overlapped_AcceptEx), METH_FASTCALL, _overlapped_Overlapped_AcceptEx__doc__},

static TyObject *
_overlapped_Overlapped_AcceptEx_impl(OverlappedObject *self,
                                     HANDLE ListenSocket,
                                     HANDLE AcceptSocket);

static TyObject *
_overlapped_Overlapped_AcceptEx(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE ListenSocket;
    HANDLE AcceptSocket;

    if (!_TyArg_CheckPositional("AcceptEx", nargs, 2, 2)) {
        goto exit;
    }
    ListenSocket = TyLong_AsVoidPtr(args[0]);
    if (!ListenSocket && TyErr_Occurred()) {
        goto exit;
    }
    AcceptSocket = TyLong_AsVoidPtr(args[1]);
    if (!AcceptSocket && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_AcceptEx_impl((OverlappedObject *)self, ListenSocket, AcceptSocket);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_ConnectEx__doc__,
"ConnectEx($self, client_handle, address_as_bytes, /)\n"
"--\n"
"\n"
"Start overlapped connect.\n"
"\n"
"client_handle should be unbound.");

#define _OVERLAPPED_OVERLAPPED_CONNECTEX_METHODDEF    \
    {"ConnectEx", _PyCFunction_CAST(_overlapped_Overlapped_ConnectEx), METH_FASTCALL, _overlapped_Overlapped_ConnectEx__doc__},

static TyObject *
_overlapped_Overlapped_ConnectEx_impl(OverlappedObject *self,
                                      HANDLE ConnectSocket,
                                      TyObject *AddressObj);

static TyObject *
_overlapped_Overlapped_ConnectEx(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE ConnectSocket;
    TyObject *AddressObj;

    if (!_TyArg_CheckPositional("ConnectEx", nargs, 2, 2)) {
        goto exit;
    }
    ConnectSocket = TyLong_AsVoidPtr(args[0]);
    if (!ConnectSocket && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyTuple_Check(args[1])) {
        _TyArg_BadArgument("ConnectEx", "argument 2", "tuple", args[1]);
        goto exit;
    }
    AddressObj = args[1];
    return_value = _overlapped_Overlapped_ConnectEx_impl((OverlappedObject *)self, ConnectSocket, AddressObj);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_DisconnectEx__doc__,
"DisconnectEx($self, handle, flags, /)\n"
"--\n"
"\n");

#define _OVERLAPPED_OVERLAPPED_DISCONNECTEX_METHODDEF    \
    {"DisconnectEx", _PyCFunction_CAST(_overlapped_Overlapped_DisconnectEx), METH_FASTCALL, _overlapped_Overlapped_DisconnectEx__doc__},

static TyObject *
_overlapped_Overlapped_DisconnectEx_impl(OverlappedObject *self,
                                         HANDLE Socket, DWORD flags);

static TyObject *
_overlapped_Overlapped_DisconnectEx(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE Socket;
    DWORD flags;

    if (!_TyArg_CheckPositional("DisconnectEx", nargs, 2, 2)) {
        goto exit;
    }
    Socket = TyLong_AsVoidPtr(args[0]);
    if (!Socket && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &flags)) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_DisconnectEx_impl((OverlappedObject *)self, Socket, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_TransmitFile__doc__,
"TransmitFile($self, socket, file, offset, offset_high, count_to_write,\n"
"             count_per_send, flags, /)\n"
"--\n"
"\n"
"Transmit file data over a connected socket.");

#define _OVERLAPPED_OVERLAPPED_TRANSMITFILE_METHODDEF    \
    {"TransmitFile", _PyCFunction_CAST(_overlapped_Overlapped_TransmitFile), METH_FASTCALL, _overlapped_Overlapped_TransmitFile__doc__},

static TyObject *
_overlapped_Overlapped_TransmitFile_impl(OverlappedObject *self,
                                         HANDLE Socket, HANDLE File,
                                         DWORD offset, DWORD offset_high,
                                         DWORD count_to_write,
                                         DWORD count_per_send, DWORD flags);

static TyObject *
_overlapped_Overlapped_TransmitFile(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE Socket;
    HANDLE File;
    DWORD offset;
    DWORD offset_high;
    DWORD count_to_write;
    DWORD count_per_send;
    DWORD flags;

    if (!_TyArg_CheckPositional("TransmitFile", nargs, 7, 7)) {
        goto exit;
    }
    Socket = TyLong_AsVoidPtr(args[0]);
    if (!Socket && TyErr_Occurred()) {
        goto exit;
    }
    File = TyLong_AsVoidPtr(args[1]);
    if (!File && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &offset)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[3], &offset_high)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[4], &count_to_write)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[5], &count_per_send)) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[6], &flags)) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_TransmitFile_impl((OverlappedObject *)self, Socket, File, offset, offset_high, count_to_write, count_per_send, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_ConnectNamedPipe__doc__,
"ConnectNamedPipe($self, handle, /)\n"
"--\n"
"\n"
"Start overlapped wait for a client to connect.");

#define _OVERLAPPED_OVERLAPPED_CONNECTNAMEDPIPE_METHODDEF    \
    {"ConnectNamedPipe", (PyCFunction)_overlapped_Overlapped_ConnectNamedPipe, METH_O, _overlapped_Overlapped_ConnectNamedPipe__doc__},

static TyObject *
_overlapped_Overlapped_ConnectNamedPipe_impl(OverlappedObject *self,
                                             HANDLE Pipe);

static TyObject *
_overlapped_Overlapped_ConnectNamedPipe(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE Pipe;

    Pipe = TyLong_AsVoidPtr(arg);
    if (!Pipe && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_ConnectNamedPipe_impl((OverlappedObject *)self, Pipe);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_ConnectPipe__doc__,
"ConnectPipe($self, addr, /)\n"
"--\n"
"\n"
"Connect to the pipe for asynchronous I/O (overlapped).");

#define _OVERLAPPED_OVERLAPPED_CONNECTPIPE_METHODDEF    \
    {"ConnectPipe", (PyCFunction)_overlapped_Overlapped_ConnectPipe, METH_O, _overlapped_Overlapped_ConnectPipe__doc__},

static TyObject *
_overlapped_Overlapped_ConnectPipe_impl(OverlappedObject *self,
                                        const wchar_t *Address);

static TyObject *
_overlapped_Overlapped_ConnectPipe(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    const wchar_t *Address = NULL;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("ConnectPipe", "argument", "str", arg);
        goto exit;
    }
    Address = TyUnicode_AsWideCharString(arg, NULL);
    if (Address == NULL) {
        goto exit;
    }
    return_value = _overlapped_Overlapped_ConnectPipe_impl((OverlappedObject *)self, Address);

exit:
    /* Cleanup for Address */
    TyMem_Free((void *)Address);

    return return_value;
}

TyDoc_STRVAR(_overlapped_WSAConnect__doc__,
"WSAConnect($module, client_handle, address_as_bytes, /)\n"
"--\n"
"\n"
"Bind a remote address to a connectionless (UDP) socket.");

#define _OVERLAPPED_WSACONNECT_METHODDEF    \
    {"WSAConnect", _PyCFunction_CAST(_overlapped_WSAConnect), METH_FASTCALL, _overlapped_WSAConnect__doc__},

static TyObject *
_overlapped_WSAConnect_impl(TyObject *module, HANDLE ConnectSocket,
                            TyObject *AddressObj);

static TyObject *
_overlapped_WSAConnect(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE ConnectSocket;
    TyObject *AddressObj;

    if (!_TyArg_CheckPositional("WSAConnect", nargs, 2, 2)) {
        goto exit;
    }
    ConnectSocket = TyLong_AsVoidPtr(args[0]);
    if (!ConnectSocket && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyTuple_Check(args[1])) {
        _TyArg_BadArgument("WSAConnect", "argument 2", "tuple", args[1]);
        goto exit;
    }
    AddressObj = args[1];
    return_value = _overlapped_WSAConnect_impl(module, ConnectSocket, AddressObj);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSASendTo__doc__,
"WSASendTo($self, handle, buf, flags, address_as_bytes, /)\n"
"--\n"
"\n"
"Start overlapped sendto over a connectionless (UDP) socket.");

#define _OVERLAPPED_OVERLAPPED_WSASENDTO_METHODDEF    \
    {"WSASendTo", _PyCFunction_CAST(_overlapped_Overlapped_WSASendTo), METH_FASTCALL, _overlapped_Overlapped_WSASendTo__doc__},

static TyObject *
_overlapped_Overlapped_WSASendTo_impl(OverlappedObject *self, HANDLE handle,
                                      Ty_buffer *bufobj, DWORD flags,
                                      TyObject *AddressObj);

static TyObject *
_overlapped_Overlapped_WSASendTo(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};
    DWORD flags;
    TyObject *AddressObj;

    if (!_TyArg_CheckPositional("WSASendTo", nargs, 4, 4)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &flags)) {
        goto exit;
    }
    if (!TyTuple_Check(args[3])) {
        _TyArg_BadArgument("WSASendTo", "argument 4", "tuple", args[3]);
        goto exit;
    }
    AddressObj = args[3];
    return_value = _overlapped_Overlapped_WSASendTo_impl((OverlappedObject *)self, handle, &bufobj, flags, AddressObj);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSARecvFrom__doc__,
"WSARecvFrom($self, handle, size, flags=0, /)\n"
"--\n"
"\n"
"Start overlapped receive.");

#define _OVERLAPPED_OVERLAPPED_WSARECVFROM_METHODDEF    \
    {"WSARecvFrom", _PyCFunction_CAST(_overlapped_Overlapped_WSARecvFrom), METH_FASTCALL, _overlapped_Overlapped_WSARecvFrom__doc__},

static TyObject *
_overlapped_Overlapped_WSARecvFrom_impl(OverlappedObject *self,
                                        HANDLE handle, DWORD size,
                                        DWORD flags);

static TyObject *
_overlapped_Overlapped_WSARecvFrom(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    DWORD size;
    DWORD flags = 0;

    if (!_TyArg_CheckPositional("WSARecvFrom", nargs, 2, 3)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[1], &size)) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &flags)) {
        goto exit;
    }
skip_optional:
    return_value = _overlapped_Overlapped_WSARecvFrom_impl((OverlappedObject *)self, handle, size, flags);

exit:
    return return_value;
}

TyDoc_STRVAR(_overlapped_Overlapped_WSARecvFromInto__doc__,
"WSARecvFromInto($self, handle, buf, size, flags=0, /)\n"
"--\n"
"\n"
"Start overlapped receive.");

#define _OVERLAPPED_OVERLAPPED_WSARECVFROMINTO_METHODDEF    \
    {"WSARecvFromInto", _PyCFunction_CAST(_overlapped_Overlapped_WSARecvFromInto), METH_FASTCALL, _overlapped_Overlapped_WSARecvFromInto__doc__},

static TyObject *
_overlapped_Overlapped_WSARecvFromInto_impl(OverlappedObject *self,
                                            HANDLE handle, Ty_buffer *bufobj,
                                            DWORD size, DWORD flags);

static TyObject *
_overlapped_Overlapped_WSARecvFromInto(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    Ty_buffer bufobj = {NULL, NULL};
    DWORD size;
    DWORD flags = 0;

    if (!_TyArg_CheckPositional("WSARecvFromInto", nargs, 3, 4)) {
        goto exit;
    }
    handle = TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &bufobj, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLong_Converter(args[2], &size)) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    if (!_TyLong_UnsignedLong_Converter(args[3], &flags)) {
        goto exit;
    }
skip_optional:
    return_value = _overlapped_Overlapped_WSARecvFromInto_impl((OverlappedObject *)self, handle, &bufobj, size, flags);

exit:
    /* Cleanup for bufobj */
    if (bufobj.obj) {
       PyBuffer_Release(&bufobj);
    }

    return return_value;
}
/*[clinic end generated code: output=3e4cb2b55342cd96 input=a9049054013a1b77]*/
