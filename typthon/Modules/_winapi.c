/*
 * Support routines from the Windows API
 *
 * This module was originally created by merging PC/_subprocess.c with
 * Modules/_multiprocessing/win32_functions.c.
 *
 * Copyright (c) 2004 by Fredrik Lundh <fredrik@pythonware.com>
 * Copyright (c) 2004 by Secret Labs AB, http://www.pythonware.com
 * Copyright (c) 2004 by Peter Astrand <astrand@lysator.liu.se>
 *
 * By obtaining, using, and/or copying this software and/or its
 * associated documentation, you agree that you have read, understood,
 * and will comply with the following terms and conditions:
 *
 * Permission to use, copy, modify, and distribute this software and
 * its associated documentation for any purpose and without fee is
 * hereby granted, provided that the above copyright notice appears in
 * all copies, and that both that copyright notice and this permission
 * notice appear in supporting documentation, and that the name of the
 * authors not be used in advertising or publicity pertaining to
 * distribution of the software without specific, written prior
 * permission.
 *
 * THE AUTHORS DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
 * NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */

/* Licensed to PSF under a Contributor Agreement. */
/* See https://www.python.org/2.4/license for licensing details. */

#include "Python.h"
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_pylifecycle.h"   // _Ty_IsInterpreterFinalizing()
#include "pycore_pystate.h"       // _TyInterpreterState_GET
#include "pycore_unicodeobject.h" // for Argument Clinic


#ifndef WINDOWS_LEAN_AND_MEAN
#  define WINDOWS_LEAN_AND_MEAN
#endif
#include <windows.h>
#include <winioctl.h>
#include <crtdbg.h>
#include "winreparse.h"

#if defined(MS_WIN32) && !defined(MS_WIN64)
#define HANDLE_TO_PYNUM(handle) \
    TyLong_FromUnsignedLong((unsigned long) handle)
#define PYNUM_TO_HANDLE(obj) ((HANDLE)TyLong_AsUnsignedLong(obj))
#define F_POINTER "k"
#define T_POINTER Ty_T_ULONG
#else
#define HANDLE_TO_PYNUM(handle) \
    TyLong_FromUnsignedLongLong((unsigned long long) handle)
#define PYNUM_TO_HANDLE(obj) ((HANDLE)TyLong_AsUnsignedLongLong(obj))
#define F_POINTER "K"
#define T_POINTER Ty_T_ULONGLONG
#endif

#define F_HANDLE F_POINTER
#define F_DWORD "k"

#define T_HANDLE T_POINTER

// winbase.h limits the STARTF_* flags to the desktop API as of 10.0.19041.
#ifndef STARTF_USESHOWWINDOW
#define STARTF_USESHOWWINDOW 0x00000001
#endif
#ifndef STARTF_USESIZE
#define STARTF_USESIZE 0x00000002
#endif
#ifndef STARTF_USEPOSITION
#define STARTF_USEPOSITION 0x00000004
#endif
#ifndef STARTF_USECOUNTCHARS
#define STARTF_USECOUNTCHARS 0x00000008
#endif
#ifndef STARTF_USEFILLATTRIBUTE
#define STARTF_USEFILLATTRIBUTE 0x00000010
#endif
#ifndef STARTF_RUNFULLSCREEN
#define STARTF_RUNFULLSCREEN 0x00000020
#endif
#ifndef STARTF_FORCEONFEEDBACK
#define STARTF_FORCEONFEEDBACK 0x00000040
#endif
#ifndef STARTF_FORCEOFFFEEDBACK
#define STARTF_FORCEOFFFEEDBACK 0x00000080
#endif
#ifndef STARTF_USESTDHANDLES
#define STARTF_USESTDHANDLES 0x00000100
#endif
#ifndef STARTF_USEHOTKEY
#define STARTF_USEHOTKEY 0x00000200
#endif
#ifndef STARTF_TITLEISLINKNAME
#define STARTF_TITLEISLINKNAME 0x00000800
#endif
#ifndef STARTF_TITLEISAPPID
#define STARTF_TITLEISAPPID 0x00001000
#endif
#ifndef STARTF_PREVENTPINNING
#define STARTF_PREVENTPINNING 0x00002000
#endif
#ifndef STARTF_UNTRUSTEDSOURCE
#define STARTF_UNTRUSTEDSOURCE 0x00008000
#endif

typedef struct {
    TyTypeObject *overlapped_type;
} WinApiState;

static inline WinApiState*
winapi_get_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (WinApiState *)state;
}

/*
 * A Python object wrapping an OVERLAPPED structure and other useful data
 * for overlapped I/O
 */

typedef struct {
    PyObject_HEAD
    OVERLAPPED overlapped;
    /* For convenience, we store the file handle too */
    HANDLE handle;
    /* Whether there's I/O in flight */
    int pending;
    /* Whether I/O completed successfully */
    int completed;
    /* Buffer used for reading (optional) */
    TyObject *read_buffer;
    /* Buffer used for writing (optional) */
    Ty_buffer write_buffer;
} OverlappedObject;

#define OverlappedObject_CAST(op)   ((OverlappedObject *)(op))

/*
Note: tp_clear (overlapped_clear) is not implemented because it
requires cancelling the IO operation if it's pending and the cancellation is
quite complex and can fail (see: overlapped_dealloc).
*/
static int
overlapped_traverse(TyObject *op, visitproc visit, void *arg)
{
    OverlappedObject *self = OverlappedObject_CAST(op);
    Ty_VISIT(self->read_buffer);
    Ty_VISIT(self->write_buffer.obj);
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static void
overlapped_dealloc(TyObject *op)
{
    DWORD bytes;
    int err = GetLastError();
    OverlappedObject *self = OverlappedObject_CAST(op);

    PyObject_GC_UnTrack(self);
    if (self->pending) {
        if (CancelIoEx(self->handle, &self->overlapped) &&
            GetOverlappedResult(self->handle, &self->overlapped, &bytes, TRUE))
        {
            /* The operation is no longer pending -- nothing to do. */
        }
        else if (_Ty_IsInterpreterFinalizing(_TyInterpreterState_GET())) {
            /* The operation is still pending -- give a warning.  This
               will probably only happen on Windows XP. */
            TyErr_SetString(TyExc_PythonFinalizationError,
                            "I/O operations still in flight while destroying "
                            "Overlapped object, the process may crash");
            TyErr_FormatUnraisable("Exception ignored while deallocating "
                                   "overlapped operation %R", self);
        }
        else {
            /* The operation is still pending, but the process is
               probably about to exit, so we need not worry too much
               about memory leaks.  Leaking self prevents a potential
               crash.  This can happen when a daemon thread is cleaned
               up at exit -- see #19565.  We only expect to get here
               on Windows XP. */
            CloseHandle(self->overlapped.hEvent);
            SetLastError(err);
            return;
        }
    }

    CloseHandle(self->overlapped.hEvent);
    SetLastError(err);
    if (self->write_buffer.obj)
        PyBuffer_Release(&self->write_buffer);
    Ty_CLEAR(self->read_buffer);
    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

/*[clinic input]
module _winapi
class _winapi.Overlapped "OverlappedObject *" "&OverlappedType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=c13d3f5fd1dabb84]*/

/*[python input]
def create_converter(type_, format_unit):
    name = type_ + '_converter'
    # registered upon creation by CConverter's metaclass
    type(name, (CConverter,), {'type': type_, 'format_unit': format_unit})

# format unit differs between platforms for these
create_converter('HANDLE', '" F_HANDLE "')
create_converter('HMODULE', '" F_HANDLE "')
create_converter('LPSECURITY_ATTRIBUTES', '" F_POINTER "')
create_converter('LPCVOID', '" F_POINTER "')

create_converter('BOOL', 'i') # F_BOOL used previously (always 'i')
create_converter('DWORD', 'k') # F_DWORD is always "k" (which is much shorter)
create_converter('UINT', 'I') # F_UINT used previously (always 'I')

class LPCWSTR_converter(Ty_UNICODE_converter):
    type = 'LPCWSTR'

class HANDLE_return_converter(CReturnConverter):
    type = 'HANDLE'

    def render(self, function, data):
        self.declare(data)
        self.err_occurred_if("_return_value == INVALID_HANDLE_VALUE", data)
        data.return_conversion.append(
            'if (_return_value == NULL) {\n    Py_RETURN_NONE;\n}\n')
        data.return_conversion.append(
            'return_value = HANDLE_TO_PYNUM(_return_value);\n')

class DWORD_return_converter(CReturnConverter):
    type = 'DWORD'

    def render(self, function, data):
        self.declare(data)
        self.err_occurred_if("_return_value == PY_DWORD_MAX", data)
        data.return_conversion.append(
            'return_value = TyLong_FromUnsignedLong(_return_value);\n')

class LPVOID_return_converter(CReturnConverter):
    type = 'LPVOID'

    def render(self, function, data):
        self.declare(data)
        self.err_occurred_if("_return_value == NULL", data)
        data.return_conversion.append(
            'return_value = HANDLE_TO_PYNUM(_return_value);\n')
[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=da0a4db751936ee7]*/

#include "clinic/_winapi.c.h"

/*[clinic input]
_winapi.Overlapped.GetOverlappedResult

    wait: bool
    /
[clinic start generated code]*/

static TyObject *
_winapi_Overlapped_GetOverlappedResult_impl(OverlappedObject *self, int wait)
/*[clinic end generated code: output=bdd0c1ed6518cd03 input=194505ee8e0e3565]*/
{
    BOOL res;
    DWORD transferred = 0;
    DWORD err;

    Ty_BEGIN_ALLOW_THREADS
    res = GetOverlappedResult(self->handle, &self->overlapped, &transferred,
                              wait != 0);
    Ty_END_ALLOW_THREADS

    err = res ? ERROR_SUCCESS : GetLastError();
    switch (err) {
        case ERROR_SUCCESS:
        case ERROR_MORE_DATA:
        case ERROR_OPERATION_ABORTED:
            self->completed = 1;
            self->pending = 0;
            break;
        case ERROR_IO_INCOMPLETE:
            break;
        default:
            self->pending = 0;
            return TyErr_SetExcFromWindowsErr(TyExc_OSError, err);
    }
    if (self->completed && self->read_buffer != NULL) {
        assert(TyBytes_CheckExact(self->read_buffer));
        if (transferred != TyBytes_GET_SIZE(self->read_buffer) &&
            _TyBytes_Resize(&self->read_buffer, transferred))
            return NULL;
    }
    return Ty_BuildValue("II", (unsigned) transferred, (unsigned) err);
}

/*[clinic input]
_winapi.Overlapped.getbuffer
[clinic start generated code]*/

static TyObject *
_winapi_Overlapped_getbuffer_impl(OverlappedObject *self)
/*[clinic end generated code: output=95a3eceefae0f748 input=347fcfd56b4ceabd]*/
{
    TyObject *res;
    if (!self->completed) {
        TyErr_SetString(TyExc_ValueError,
                        "can't get read buffer before GetOverlappedResult() "
                        "signals the operation completed");
        return NULL;
    }
    res = self->read_buffer ? self->read_buffer : Ty_None;
    return Ty_NewRef(res);
}

/*[clinic input]
_winapi.Overlapped.cancel
[clinic start generated code]*/

static TyObject *
_winapi_Overlapped_cancel_impl(OverlappedObject *self)
/*[clinic end generated code: output=fcb9ab5df4ebdae5 input=cbf3da142290039f]*/
{
    BOOL res = TRUE;

    if (self->pending) {
        Ty_BEGIN_ALLOW_THREADS
        res = CancelIoEx(self->handle, &self->overlapped);
        Ty_END_ALLOW_THREADS
    }

    /* CancelIoEx returns ERROR_NOT_FOUND if the I/O completed in-between */
    if (!res && GetLastError() != ERROR_NOT_FOUND)
        return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
    self->pending = 0;
    Py_RETURN_NONE;
}

static TyMethodDef overlapped_methods[] = {
    _WINAPI_OVERLAPPED_GETOVERLAPPEDRESULT_METHODDEF
    _WINAPI_OVERLAPPED_GETBUFFER_METHODDEF
    _WINAPI_OVERLAPPED_CANCEL_METHODDEF
    {NULL}
};

static TyMemberDef overlapped_members[] = {
    {"event", T_HANDLE,
     offsetof(OverlappedObject, overlapped) + offsetof(OVERLAPPED, hEvent),
     Py_READONLY, "overlapped event handle"},
    {NULL}
};

static TyType_Slot winapi_overlapped_type_slots[] = {
    {Ty_tp_traverse, overlapped_traverse},
    {Ty_tp_dealloc, overlapped_dealloc},
    {Ty_tp_doc, "OVERLAPPED structure wrapper"},
    {Ty_tp_methods, overlapped_methods},
    {Ty_tp_members, overlapped_members},
    {0,0}
};

static TyType_Spec winapi_overlapped_type_spec = {
    .name = "_winapi.Overlapped",
    .basicsize = sizeof(OverlappedObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = winapi_overlapped_type_slots,
};

static OverlappedObject *
new_overlapped(TyObject *module, HANDLE handle)
{
    WinApiState *st = winapi_get_state(module);
    OverlappedObject *self = PyObject_GC_New(OverlappedObject, st->overlapped_type);
    if (!self)
        return NULL;

    self->handle = handle;
    self->read_buffer = NULL;
    self->pending = 0;
    self->completed = 0;
    memset(&self->overlapped, 0, sizeof(OVERLAPPED));
    memset(&self->write_buffer, 0, sizeof(Ty_buffer));
    /* Manual reset, initially non-signalled */
    self->overlapped.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

    PyObject_GC_Track(self);
    return self;
}

/* -------------------------------------------------------------------- */
/* windows API functions */

/*[clinic input]
_winapi.CloseHandle

    handle: HANDLE
    /

Close handle.
[clinic start generated code]*/

static TyObject *
_winapi_CloseHandle_impl(TyObject *module, HANDLE handle)
/*[clinic end generated code: output=7ad37345f07bd782 input=7f0e4ac36e0352b8]*/
{
    BOOL success;

    Ty_BEGIN_ALLOW_THREADS
    success = CloseHandle(handle);
    Ty_END_ALLOW_THREADS

    if (!success)
        return TyErr_SetFromWindowsErr(0);

    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.ConnectNamedPipe

    handle: HANDLE
    overlapped as use_overlapped: bool = False
[clinic start generated code]*/

static TyObject *
_winapi_ConnectNamedPipe_impl(TyObject *module, HANDLE handle,
                              int use_overlapped)
/*[clinic end generated code: output=335a0e7086800671 input=a80e56e8bd370e31]*/
{
    BOOL success;
    OverlappedObject *overlapped = NULL;

    if (use_overlapped) {
        overlapped = new_overlapped(module, handle);
        if (!overlapped)
            return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    success = ConnectNamedPipe(handle,
                               overlapped ? &overlapped->overlapped : NULL);
    Ty_END_ALLOW_THREADS

    if (overlapped) {
        int err = GetLastError();
        /* Overlapped ConnectNamedPipe never returns a success code */
        assert(success == 0);
        if (err == ERROR_IO_PENDING)
            overlapped->pending = 1;
        else if (err == ERROR_PIPE_CONNECTED)
            SetEvent(overlapped->overlapped.hEvent);
        else {
            Ty_DECREF(overlapped);
            return TyErr_SetFromWindowsErr(err);
        }
        return (TyObject *) overlapped;
    }
    if (!success)
        return TyErr_SetFromWindowsErr(0);

    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.CreateEventW -> HANDLE

    security_attributes: LPSECURITY_ATTRIBUTES
    manual_reset: BOOL
    initial_state: BOOL
    name: LPCWSTR(accept={str, NoneType})
[clinic start generated code]*/

static HANDLE
_winapi_CreateEventW_impl(TyObject *module,
                          LPSECURITY_ATTRIBUTES security_attributes,
                          BOOL manual_reset, BOOL initial_state,
                          LPCWSTR name)
/*[clinic end generated code: output=2d4c7d5852ecb298 input=4187cee28ac763f8]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.CreateEventW", "bbu", manual_reset, initial_state, name) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = CreateEventW(security_attributes, manual_reset, initial_state, name);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE) {
        TyErr_SetFromWindowsErr(0);
    }

    return handle;
}

/*[clinic input]
_winapi.CreateFile -> HANDLE

    file_name: LPCWSTR
    desired_access: DWORD
    share_mode: DWORD
    security_attributes: LPSECURITY_ATTRIBUTES
    creation_disposition: DWORD
    flags_and_attributes: DWORD
    template_file: HANDLE
    /
[clinic start generated code]*/

static HANDLE
_winapi_CreateFile_impl(TyObject *module, LPCWSTR file_name,
                        DWORD desired_access, DWORD share_mode,
                        LPSECURITY_ATTRIBUTES security_attributes,
                        DWORD creation_disposition,
                        DWORD flags_and_attributes, HANDLE template_file)
/*[clinic end generated code: output=818c811e5e04d550 input=1fa870ed1c2e3d69]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.CreateFile", "ukkkk",
                    file_name, desired_access, share_mode,
                    creation_disposition, flags_and_attributes) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = CreateFileW(file_name, desired_access,
                         share_mode, security_attributes,
                         creation_disposition,
                         flags_and_attributes, template_file);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE) {
        TyErr_SetFromWindowsErr(0);
    }

    return handle;
}

/*[clinic input]
_winapi.CreateFileMapping -> HANDLE

    file_handle: HANDLE
    security_attributes: LPSECURITY_ATTRIBUTES
    protect: DWORD
    max_size_high: DWORD
    max_size_low: DWORD
    name: LPCWSTR
    /
[clinic start generated code]*/

static HANDLE
_winapi_CreateFileMapping_impl(TyObject *module, HANDLE file_handle,
                               LPSECURITY_ATTRIBUTES security_attributes,
                               DWORD protect, DWORD max_size_high,
                               DWORD max_size_low, LPCWSTR name)
/*[clinic end generated code: output=6c0a4d5cf7f6fcc6 input=3dc5cf762a74dee8]*/
{
    HANDLE handle;

    Ty_BEGIN_ALLOW_THREADS
    handle = CreateFileMappingW(file_handle, security_attributes,
                                protect, max_size_high, max_size_low,
                                name);
    Ty_END_ALLOW_THREADS

    if (handle == NULL) {
        TyObject *temp = TyUnicode_FromWideChar(name, -1);
        TyErr_SetExcFromWindowsErrWithFilenameObject(TyExc_OSError, 0, temp);
        Ty_XDECREF(temp);
        handle = INVALID_HANDLE_VALUE;
    }

    return handle;
}

/*[clinic input]
_winapi.CreateJunction

    src_path: LPCWSTR
    dst_path: LPCWSTR
    /
[clinic start generated code]*/

static TyObject *
_winapi_CreateJunction_impl(TyObject *module, LPCWSTR src_path,
                            LPCWSTR dst_path)
/*[clinic end generated code: output=44b3f5e9bbcc4271 input=963d29b44b9384a7]*/
{
    /* Privilege adjustment */
    HANDLE token = NULL;
    struct {
        TOKEN_PRIVILEGES base;
        /* overallocate by a few array elements */
        LUID_AND_ATTRIBUTES privs[4];
    } tp, previousTp;
    DWORD previousTpSize = 0;

    /* Reparse data buffer */
    const USHORT prefix_len = 4;
    USHORT print_len = 0;
    USHORT rdb_size = 0;
    _Ty_PREPARSE_DATA_BUFFER rdb = NULL;

    /* Junction point creation */
    HANDLE junction = NULL;
    DWORD ret = 0;

    if (src_path == NULL || dst_path == NULL)
        return TyErr_SetFromWindowsErr(ERROR_INVALID_PARAMETER);

    if (wcsncmp(src_path, L"\\??\\", prefix_len) == 0)
        return TyErr_SetFromWindowsErr(ERROR_INVALID_PARAMETER);

    if (TySys_Audit("_winapi.CreateJunction", "uu", src_path, dst_path) < 0) {
        return NULL;
    }

    /* Adjust privileges to allow rewriting directory entry as a
       junction point. */
    if (!OpenProcessToken(GetCurrentProcess(),
                          TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &token)) {
        goto cleanup;
    }

    if (!LookupPrivilegeValue(NULL, SE_RESTORE_NAME, &tp.base.Privileges[0].Luid)) {
        goto cleanup;
    }

    tp.base.PrivilegeCount = 1;
    tp.base.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;
    if (!AdjustTokenPrivileges(token, FALSE, &tp.base, sizeof(previousTp),
                               &previousTp.base, &previousTpSize)) {
        goto cleanup;
    }

    if (GetFileAttributesW(src_path) == INVALID_FILE_ATTRIBUTES)
        goto cleanup;

    /* Store the absolute link target path length in print_len. */
    print_len = (USHORT)GetFullPathNameW(src_path, 0, NULL, NULL);
    if (print_len == 0)
        goto cleanup;

    /* NUL terminator should not be part of print_len. */
    --print_len;

    /* REPARSE_DATA_BUFFER usage is heavily under-documented, especially for
       junction points. Here's what I've learned along the way:
       - A junction point has two components: a print name and a substitute
         name. They both describe the link target, but the substitute name is
         the physical target and the print name is shown in directory listings.
       - The print name must be a native name, prefixed with "\??\".
       - Both names are stored after each other in the same buffer (the
         PathBuffer) and both must be NUL-terminated.
       - There are four members defining their respective offset and length
         inside PathBuffer: SubstituteNameOffset, SubstituteNameLength,
         PrintNameOffset and PrintNameLength.
       - The total size we need to allocate for the REPARSE_DATA_BUFFER, thus,
         is the sum of:
         - the fixed header size (REPARSE_DATA_BUFFER_HEADER_SIZE)
         - the size of the MountPointReparseBuffer member without the PathBuffer
         - the size of the prefix ("\??\") in bytes
         - the size of the print name in bytes
         - the size of the substitute name in bytes
         - the size of two NUL terminators in bytes */
    rdb_size = _Ty_REPARSE_DATA_BUFFER_HEADER_SIZE +
        sizeof(rdb->MountPointReparseBuffer) -
        sizeof(rdb->MountPointReparseBuffer.PathBuffer) +
        /* Two +1's for NUL terminators. */
        (prefix_len + print_len + 1 + print_len + 1) * sizeof(WCHAR);
    rdb = (_Ty_PREPARSE_DATA_BUFFER)TyMem_RawCalloc(1, rdb_size);
    if (rdb == NULL)
        goto cleanup;

    rdb->ReparseTag = IO_REPARSE_TAG_MOUNT_POINT;
    rdb->ReparseDataLength = rdb_size - _Ty_REPARSE_DATA_BUFFER_HEADER_SIZE;
    rdb->MountPointReparseBuffer.SubstituteNameOffset = 0;
    rdb->MountPointReparseBuffer.SubstituteNameLength =
        (prefix_len + print_len) * sizeof(WCHAR);
    rdb->MountPointReparseBuffer.PrintNameOffset =
        rdb->MountPointReparseBuffer.SubstituteNameLength + sizeof(WCHAR);
    rdb->MountPointReparseBuffer.PrintNameLength = print_len * sizeof(WCHAR);

    /* Store the full native path of link target at the substitute name
       offset (0). */
    wcscpy(rdb->MountPointReparseBuffer.PathBuffer, L"\\??\\");
    if (GetFullPathNameW(src_path, print_len + 1,
                         rdb->MountPointReparseBuffer.PathBuffer + prefix_len,
                         NULL) == 0)
        goto cleanup;

    /* Copy everything but the native prefix to the print name offset. */
    wcscpy(rdb->MountPointReparseBuffer.PathBuffer +
             prefix_len + print_len + 1,
             rdb->MountPointReparseBuffer.PathBuffer + prefix_len);

    /* Create a directory for the junction point. */
    if (!CreateDirectoryW(dst_path, NULL))
        goto cleanup;

    junction = CreateFileW(dst_path, GENERIC_READ | GENERIC_WRITE, 0, NULL,
        OPEN_EXISTING,
        FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS, NULL);
    if (junction == INVALID_HANDLE_VALUE)
        goto cleanup;

    /* Make the directory entry a junction point. */
    if (!DeviceIoControl(junction, FSCTL_SET_REPARSE_POINT, rdb, rdb_size,
                         NULL, 0, &ret, NULL))
        goto cleanup;

cleanup:
    ret = GetLastError();

    if (previousTpSize) {
        AdjustTokenPrivileges(token, FALSE, &previousTp.base, previousTpSize,
                              NULL, NULL);
    }

    if (token != NULL)
        CloseHandle(token);
    if (junction != NULL)
        CloseHandle(junction);
    TyMem_RawFree(rdb);

    if (ret != 0)
        return TyErr_SetFromWindowsErr(ret);

    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.CreateMutexW -> HANDLE

    security_attributes: LPSECURITY_ATTRIBUTES
    initial_owner: BOOL
    name: LPCWSTR(accept={str, NoneType})
[clinic start generated code]*/

static HANDLE
_winapi_CreateMutexW_impl(TyObject *module,
                          LPSECURITY_ATTRIBUTES security_attributes,
                          BOOL initial_owner, LPCWSTR name)
/*[clinic end generated code: output=31b9ee8fc37e49a5 input=7d54b921e723254a]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.CreateMutexW", "bu", initial_owner, name) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = CreateMutexW(security_attributes, initial_owner, name);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE) {
        TyErr_SetFromWindowsErr(0);
    }

    return handle;
}

/*[clinic input]
_winapi.CreateNamedPipe -> HANDLE

    name: LPCWSTR
    open_mode: DWORD
    pipe_mode: DWORD
    max_instances: DWORD
    out_buffer_size: DWORD
    in_buffer_size: DWORD
    default_timeout: DWORD
    security_attributes: LPSECURITY_ATTRIBUTES
    /
[clinic start generated code]*/

static HANDLE
_winapi_CreateNamedPipe_impl(TyObject *module, LPCWSTR name, DWORD open_mode,
                             DWORD pipe_mode, DWORD max_instances,
                             DWORD out_buffer_size, DWORD in_buffer_size,
                             DWORD default_timeout,
                             LPSECURITY_ATTRIBUTES security_attributes)
/*[clinic end generated code: output=7d6fde93227680ba input=5bd4e4a55639ee02]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.CreateNamedPipe", "ukk",
                    name, open_mode, pipe_mode) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = CreateNamedPipeW(name, open_mode, pipe_mode,
                              max_instances, out_buffer_size,
                              in_buffer_size, default_timeout,
                              security_attributes);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE)
        TyErr_SetFromWindowsErr(0);

    return handle;
}

/*[clinic input]
_winapi.CreatePipe

    pipe_attrs: object
        Ignored internally, can be None.
    size: DWORD
    /

Create an anonymous pipe.

Returns a 2-tuple of handles, to the read and write ends of the pipe.
[clinic start generated code]*/

static TyObject *
_winapi_CreatePipe_impl(TyObject *module, TyObject *pipe_attrs, DWORD size)
/*[clinic end generated code: output=1c4411d8699f0925 input=c4f2cfa56ef68d90]*/
{
    HANDLE read_pipe;
    HANDLE write_pipe;
    BOOL result;

    if (TySys_Audit("_winapi.CreatePipe", NULL) < 0) {
        return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    result = CreatePipe(&read_pipe, &write_pipe, NULL, size);
    Ty_END_ALLOW_THREADS

    if (! result)
        return TyErr_SetFromWindowsErr(GetLastError());

    return Ty_BuildValue(
        "NN", HANDLE_TO_PYNUM(read_pipe), HANDLE_TO_PYNUM(write_pipe));
}

/* helpers for createprocess */

static unsigned long
getulong(TyObject* obj, const char* name)
{
    TyObject* value;
    unsigned long ret;

    value = PyObject_GetAttrString(obj, name);
    if (! value) {
        TyErr_Clear(); /* FIXME: propagate error? */
        return 0;
    }
    ret = TyLong_AsUnsignedLong(value);
    Ty_DECREF(value);
    return ret;
}

static HANDLE
gethandle(TyObject* obj, const char* name)
{
    TyObject* value;
    HANDLE ret;

    value = PyObject_GetAttrString(obj, name);
    if (! value) {
        TyErr_Clear(); /* FIXME: propagate error? */
        return NULL;
    }
    if (value == Ty_None)
        ret = NULL;
    else
        ret = PYNUM_TO_HANDLE(value);
    Ty_DECREF(value);
    return ret;
}

static TyObject *
sortenvironmentkey(TyObject *module, TyObject *item)
{
    return _winapi_LCMapStringEx_impl(NULL, LOCALE_NAME_INVARIANT,
                                      LCMAP_UPPERCASE, item);
}

static TyMethodDef sortenvironmentkey_def = {
    "sortenvironmentkey", _PyCFunction_CAST(sortenvironmentkey), METH_O, "",
};

static int
sort_environment_keys(TyObject *keys)
{
    TyObject *keyfunc = PyCFunction_New(&sortenvironmentkey_def, NULL);
    if (keyfunc == NULL) {
        return -1;
    }
    TyObject *kwnames = Ty_BuildValue("(s)", "key");
    if (kwnames == NULL) {
        Ty_DECREF(keyfunc);
        return -1;
    }
    TyObject *args[] = { keys, keyfunc };
    TyObject *ret = PyObject_VectorcallMethod(&_Ty_ID(sort), args, 1, kwnames);
    Ty_DECREF(keyfunc);
    Ty_DECREF(kwnames);
    if (ret == NULL) {
        return -1;
    }
    Ty_DECREF(ret);

    return 0;
}

static int
compare_string_ordinal(TyObject *str1, TyObject *str2, int *result)
{
    wchar_t *s1 = TyUnicode_AsWideCharString(str1, NULL);
    if (s1 == NULL) {
        return -1;
    }
    wchar_t *s2 = TyUnicode_AsWideCharString(str2, NULL);
    if (s2 == NULL) {
        TyMem_Free(s1);
        return -1;
    }
    *result = CompareStringOrdinal(s1, -1, s2, -1, TRUE);
    TyMem_Free(s1);
    TyMem_Free(s2);
    return 0;
}

static TyObject *
dedup_environment_keys(TyObject *keys)
{
    TyObject *result = TyList_New(0);
    if (result == NULL) {
        return NULL;
    }

    // Iterate over the pre-ordered keys, check whether the current key is equal
    // to the next key (ignoring case), if different, insert the current value
    // into the result list. If they are equal, do nothing because we always
    // want to keep the last inserted one.
    for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(keys); i++) {
        TyObject *key = TyList_GET_ITEM(keys, i);

        // The last key will always be kept.
        if (i + 1 == TyList_GET_SIZE(keys)) {
            if (TyList_Append(result, key) < 0) {
                Ty_DECREF(result);
                return NULL;
            }
            continue;
        }

        TyObject *next_key = TyList_GET_ITEM(keys, i + 1);
        int compare_result;
        if (compare_string_ordinal(key, next_key, &compare_result) < 0) {
            Ty_DECREF(result);
            return NULL;
        }
        if (compare_result == CSTR_EQUAL) {
            continue;
        }
        if (TyList_Append(result, key) < 0) {
            Ty_DECREF(result);
            return NULL;
        }
    }

    return result;
}

static TyObject *
normalize_environment(TyObject *environment)
{
    TyObject *keys = PyMapping_Keys(environment);
    if (keys == NULL) {
        return NULL;
    }

    if (sort_environment_keys(keys) < 0) {
        Ty_DECREF(keys);
        return NULL;
    }

    TyObject *normalized_keys = dedup_environment_keys(keys);
    Ty_DECREF(keys);
    if (normalized_keys == NULL) {
        return NULL;
    }

    TyObject *result = TyDict_New();
    if (result == NULL) {
        Ty_DECREF(normalized_keys);
        return NULL;
    }

    for (int i = 0; i < TyList_GET_SIZE(normalized_keys); i++) {
        TyObject *key = TyList_GET_ITEM(normalized_keys, i);
        TyObject *value = PyObject_GetItem(environment, key);
        if (value == NULL) {
            Ty_DECREF(normalized_keys);
            Ty_DECREF(result);
            return NULL;
        }

        int ret = PyObject_SetItem(result, key, value);
        Ty_DECREF(value);
        if (ret < 0) {
            Ty_DECREF(normalized_keys);
            Ty_DECREF(result);
            return NULL;
        }
    }

    Ty_DECREF(normalized_keys);

    return result;
}

static wchar_t *
getenvironment(TyObject* environment)
{
    Ty_ssize_t i, envsize, totalsize;
    wchar_t *buffer = NULL, *p, *end;
    TyObject *normalized_environment = NULL;
    TyObject *keys = NULL;
    TyObject *values = NULL;

    /* convert environment dictionary to windows environment string */
    if (! PyMapping_Check(environment)) {
        TyErr_SetString(
            TyExc_TypeError, "environment must be dictionary or None");
        return NULL;
    }

    normalized_environment = normalize_environment(environment);
    if (normalized_environment == NULL) {
        return NULL;
    }

    keys = PyMapping_Keys(normalized_environment);
    if (!keys) {
        goto error;
    }
    values = PyMapping_Values(normalized_environment);
    if (!values) {
        goto error;
    }

    envsize = TyList_GET_SIZE(keys);

    if (envsize == 0) {
        // A environment block must be terminated by two null characters --
        // one for the last string and one for the block.
        buffer = TyMem_Calloc(2, sizeof(wchar_t));
        if (!buffer) {
            TyErr_NoMemory();
        }
        goto cleanup;
    }

    if (TyList_GET_SIZE(values) != envsize) {
        TyErr_SetString(TyExc_RuntimeError,
            "environment changed size during iteration");
        goto error;
    }

    totalsize = 1; /* trailing null character */
    for (i = 0; i < envsize; i++) {
        TyObject* key = TyList_GET_ITEM(keys, i);
        TyObject* value = TyList_GET_ITEM(values, i);
        Ty_ssize_t size;

        if (! TyUnicode_Check(key) || ! TyUnicode_Check(value)) {
            TyErr_SetString(TyExc_TypeError,
                "environment can only contain strings");
            goto error;
        }
        if (TyUnicode_FindChar(key, '\0', 0, TyUnicode_GET_LENGTH(key), 1) != -1 ||
            TyUnicode_FindChar(value, '\0', 0, TyUnicode_GET_LENGTH(value), 1) != -1)
        {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto error;
        }
        /* Search from index 1 because on Windows starting '=' is allowed for
           defining hidden environment variables. */
        if (TyUnicode_GET_LENGTH(key) == 0 ||
            TyUnicode_FindChar(key, '=', 1, TyUnicode_GET_LENGTH(key), 1) != -1)
        {
            TyErr_SetString(TyExc_ValueError, "illegal environment variable name");
            goto error;
        }

        size = TyUnicode_AsWideChar(key, NULL, 0);
        assert(size > 1);
        if (totalsize > PY_SSIZE_T_MAX - size) {
            TyErr_SetString(TyExc_OverflowError, "environment too long");
            goto error;
        }
        totalsize += size;    /* including '=' */

        size = TyUnicode_AsWideChar(value, NULL, 0);
        assert(size > 0);
        if (totalsize > PY_SSIZE_T_MAX - size) {
            TyErr_SetString(TyExc_OverflowError, "environment too long");
            goto error;
        }
        totalsize += size;  /* including trailing '\0' */
    }

    buffer = TyMem_NEW(wchar_t, totalsize);
    if (! buffer) {
        TyErr_NoMemory();
        goto error;
    }
    p = buffer;
    end = buffer + totalsize;

    for (i = 0; i < envsize; i++) {
        TyObject* key = TyList_GET_ITEM(keys, i);
        TyObject* value = TyList_GET_ITEM(values, i);
        Ty_ssize_t size = TyUnicode_AsWideChar(key, p, end - p);
        assert(1 <= size && size < end - p);
        p += size;
        *p++ = L'=';
        size = TyUnicode_AsWideChar(value, p, end - p);
        assert(0 <= size && size < end - p);
        p += size + 1;
    }

    /* add trailing null character */
    *p++ = L'\0';
    assert(p == end);

cleanup:
error:
    Ty_XDECREF(normalized_environment);
    Ty_XDECREF(keys);
    Ty_XDECREF(values);
    return buffer;
}

static LPHANDLE
gethandlelist(TyObject *mapping, const char *name, Ty_ssize_t *size)
{
    LPHANDLE ret = NULL;
    TyObject *value_fast = NULL;
    TyObject *value;
    Ty_ssize_t i;

    value = PyMapping_GetItemString(mapping, name);
    if (!value) {
        TyErr_Clear();
        return NULL;
    }

    if (value == Ty_None) {
        goto cleanup;
    }

    value_fast = PySequence_Fast(value, "handle_list must be a sequence or None");
    if (value_fast == NULL)
        goto cleanup;

    *size = PySequence_Fast_GET_SIZE(value_fast) * sizeof(HANDLE);

    /* Passing an empty array causes CreateProcess to fail so just don't set it */
    if (*size == 0) {
        goto cleanup;
    }

    ret = TyMem_Malloc(*size);
    if (ret == NULL)
        goto cleanup;

    for (i = 0; i < PySequence_Fast_GET_SIZE(value_fast); i++) {
        ret[i] = PYNUM_TO_HANDLE(PySequence_Fast_GET_ITEM(value_fast, i));
        if (ret[i] == (HANDLE)-1 && TyErr_Occurred()) {
            TyMem_Free(ret);
            ret = NULL;
            goto cleanup;
        }
    }

cleanup:
    Ty_DECREF(value);
    Ty_XDECREF(value_fast);
    return ret;
}

typedef struct {
    LPPROC_THREAD_ATTRIBUTE_LIST attribute_list;
    LPHANDLE handle_list;
} AttributeList;

static void
freeattributelist(AttributeList *attribute_list)
{
    if (attribute_list->attribute_list != NULL) {
        DeleteProcThreadAttributeList(attribute_list->attribute_list);
        TyMem_Free(attribute_list->attribute_list);
    }

    TyMem_Free(attribute_list->handle_list);

    memset(attribute_list, 0, sizeof(*attribute_list));
}

static int
getattributelist(TyObject *obj, const char *name, AttributeList *attribute_list)
{
    int ret = 0;
    DWORD err;
    BOOL result;
    TyObject *value;
    Ty_ssize_t handle_list_size;
    DWORD attribute_count = 0;
    SIZE_T attribute_list_size = 0;

    value = PyObject_GetAttrString(obj, name);
    if (!value) {
        TyErr_Clear(); /* FIXME: propagate error? */
        return 0;
    }

    if (value == Ty_None) {
        ret = 0;
        goto cleanup;
    }

    if (!PyMapping_Check(value)) {
        ret = -1;
        TyErr_Format(TyExc_TypeError, "%s must be a mapping or None", name);
        goto cleanup;
    }

    attribute_list->handle_list = gethandlelist(value, "handle_list", &handle_list_size);
    if (attribute_list->handle_list == NULL && TyErr_Occurred()) {
        ret = -1;
        goto cleanup;
    }

    if (attribute_list->handle_list != NULL)
        ++attribute_count;

    /* Get how many bytes we need for the attribute list */
    result = InitializeProcThreadAttributeList(NULL, attribute_count, 0, &attribute_list_size);
    if (result || GetLastError() != ERROR_INSUFFICIENT_BUFFER) {
        ret = -1;
        TyErr_SetFromWindowsErr(GetLastError());
        goto cleanup;
    }

    attribute_list->attribute_list = TyMem_Malloc(attribute_list_size);
    if (attribute_list->attribute_list == NULL) {
        ret = -1;
        goto cleanup;
    }

    result = InitializeProcThreadAttributeList(
        attribute_list->attribute_list,
        attribute_count,
        0,
        &attribute_list_size);
    if (!result) {
        err = GetLastError();

        /* So that we won't call DeleteProcThreadAttributeList */
        TyMem_Free(attribute_list->attribute_list);
        attribute_list->attribute_list = NULL;

        ret = -1;
        TyErr_SetFromWindowsErr(err);
        goto cleanup;
    }

    if (attribute_list->handle_list != NULL) {
        result = UpdateProcThreadAttribute(
            attribute_list->attribute_list,
            0,
            PROC_THREAD_ATTRIBUTE_HANDLE_LIST,
            attribute_list->handle_list,
            handle_list_size,
            NULL,
            NULL);
        if (!result) {
            ret = -1;
            TyErr_SetFromWindowsErr(GetLastError());
            goto cleanup;
        }
    }

cleanup:
    Ty_DECREF(value);

    if (ret < 0)
        freeattributelist(attribute_list);

    return ret;
}

/*[clinic input]
_winapi.CreateProcess

    application_name: Ty_UNICODE(accept={str, NoneType})
    command_line: object
        Can be str or None
    proc_attrs: object
        Ignored internally, can be None.
    thread_attrs: object
        Ignored internally, can be None.
    inherit_handles: BOOL
    creation_flags: DWORD
    env_mapping: object
    current_directory: Ty_UNICODE(accept={str, NoneType})
    startup_info: object
    /

Create a new process and its primary thread.

The return value is a tuple of the process handle, thread handle,
process ID, and thread ID.
[clinic start generated code]*/

static TyObject *
_winapi_CreateProcess_impl(TyObject *module, const wchar_t *application_name,
                           TyObject *command_line, TyObject *proc_attrs,
                           TyObject *thread_attrs, BOOL inherit_handles,
                           DWORD creation_flags, TyObject *env_mapping,
                           const wchar_t *current_directory,
                           TyObject *startup_info)
/*[clinic end generated code: output=a25c8e49ea1d6427 input=42ac293eaea03fc4]*/
{
    TyObject *ret = NULL;
    BOOL result;
    PROCESS_INFORMATION pi;
    STARTUPINFOEXW si;
    wchar_t *wenvironment = NULL;
    wchar_t *command_line_copy = NULL;
    AttributeList attribute_list = {0};

    if (TySys_Audit("_winapi.CreateProcess", "uuu", application_name,
                    command_line, current_directory) < 0) {
        return NULL;
    }

    ZeroMemory(&si, sizeof(si));
    si.StartupInfo.cb = sizeof(si);

    /* note: we only support a small subset of all SI attributes */
    si.StartupInfo.dwFlags = getulong(startup_info, "dwFlags");
    si.StartupInfo.wShowWindow = (WORD)getulong(startup_info, "wShowWindow");
    si.StartupInfo.hStdInput = gethandle(startup_info, "hStdInput");
    si.StartupInfo.hStdOutput = gethandle(startup_info, "hStdOutput");
    si.StartupInfo.hStdError = gethandle(startup_info, "hStdError");
    if (TyErr_Occurred())
        goto cleanup;

    if (env_mapping != Ty_None) {
        wenvironment = getenvironment(env_mapping);
        if (wenvironment == NULL) {
            goto cleanup;
        }
    }

    if (getattributelist(startup_info, "lpAttributeList", &attribute_list) < 0)
        goto cleanup;

    si.lpAttributeList = attribute_list.attribute_list;
    if (TyUnicode_Check(command_line)) {
        command_line_copy = TyUnicode_AsWideCharString(command_line, NULL);
        if (command_line_copy == NULL) {
            goto cleanup;
        }
    }
    else if (command_line != Ty_None) {
        TyErr_Format(TyExc_TypeError,
                     "CreateProcess() argument 2 must be str or None, not %s",
                     Ty_TYPE(command_line)->tp_name);
        goto cleanup;
    }


    Ty_BEGIN_ALLOW_THREADS
    result = CreateProcessW(application_name,
                           command_line_copy,
                           NULL,
                           NULL,
                           inherit_handles,
                           creation_flags | EXTENDED_STARTUPINFO_PRESENT |
                           CREATE_UNICODE_ENVIRONMENT,
                           wenvironment,
                           current_directory,
                           (LPSTARTUPINFOW)&si,
                           &pi);
    Ty_END_ALLOW_THREADS

    if (!result) {
        TyErr_SetFromWindowsErr(GetLastError());
        goto cleanup;
    }

    ret = Ty_BuildValue("NNkk",
                        HANDLE_TO_PYNUM(pi.hProcess),
                        HANDLE_TO_PYNUM(pi.hThread),
                        pi.dwProcessId,
                        pi.dwThreadId);

cleanup:
    TyMem_Free(command_line_copy);
    TyMem_Free(wenvironment);
    freeattributelist(&attribute_list);

    return ret;
}

/*[clinic input]
_winapi.DuplicateHandle -> HANDLE

    source_process_handle: HANDLE
    source_handle: HANDLE
    target_process_handle: HANDLE
    desired_access: DWORD
    inherit_handle: BOOL
    options: DWORD = 0
    /

Return a duplicate handle object.

The duplicate handle refers to the same object as the original
handle. Therefore, any changes to the object are reflected
through both handles.
[clinic start generated code]*/

static HANDLE
_winapi_DuplicateHandle_impl(TyObject *module, HANDLE source_process_handle,
                             HANDLE source_handle,
                             HANDLE target_process_handle,
                             DWORD desired_access, BOOL inherit_handle,
                             DWORD options)
/*[clinic end generated code: output=ad9711397b5dcd4e input=b933e3f2356a8c12]*/
{
    HANDLE target_handle;
    BOOL result;

    Ty_BEGIN_ALLOW_THREADS
    result = DuplicateHandle(
        source_process_handle,
        source_handle,
        target_process_handle,
        &target_handle,
        desired_access,
        inherit_handle,
        options
    );
    Ty_END_ALLOW_THREADS

    if (! result) {
        TyErr_SetFromWindowsErr(GetLastError());
        return INVALID_HANDLE_VALUE;
    }

    return target_handle;
}

/*[clinic input]
_winapi.ExitProcess

    ExitCode: UINT
    /

[clinic start generated code]*/

static TyObject *
_winapi_ExitProcess_impl(TyObject *module, UINT ExitCode)
/*[clinic end generated code: output=a387deb651175301 input=4f05466a9406c558]*/
{
    #if defined(Ty_DEBUG)
#ifdef MS_WINDOWS_DESKTOP
        SetErrorMode(SEM_FAILCRITICALERRORS|SEM_NOALIGNMENTFAULTEXCEPT|
                     SEM_NOGPFAULTERRORBOX|SEM_NOOPENFILEERRORBOX);
#endif
        _CrtSetReportMode(_CRT_ASSERT, _CRTDBG_MODE_DEBUG);
    #endif

    ExitProcess(ExitCode);

    return NULL;
}

/*[clinic input]
_winapi.GetCurrentProcess -> HANDLE

Return a handle object for the current process.
[clinic start generated code]*/

static HANDLE
_winapi_GetCurrentProcess_impl(TyObject *module)
/*[clinic end generated code: output=ddeb4dd2ffadf344 input=b213403fd4b96b41]*/
{
    return GetCurrentProcess();
}

/*[clinic input]
_winapi.GetExitCodeProcess -> DWORD

    process: HANDLE
    /

Return the termination status of the specified process.
[clinic start generated code]*/

static DWORD
_winapi_GetExitCodeProcess_impl(TyObject *module, HANDLE process)
/*[clinic end generated code: output=b4620bdf2bccf36b input=61b6bfc7dc2ee374]*/
{
    DWORD exit_code;
    BOOL result;

    result = GetExitCodeProcess(process, &exit_code);

    if (! result) {
        TyErr_SetFromWindowsErr(GetLastError());
        exit_code = PY_DWORD_MAX;
    }

    return exit_code;
}

/*[clinic input]
_winapi.GetLastError -> DWORD
[clinic start generated code]*/

static DWORD
_winapi_GetLastError_impl(TyObject *module)
/*[clinic end generated code: output=8585b827cb1a92c5 input=62d47fb9bce038ba]*/
{
    return GetLastError();
}


/*[clinic input]
_winapi.GetLongPathName

    path: LPCWSTR

Return the long version of the provided path.

If the path is already in its long form, returns the same value.

The path must already be a 'str'. If the type is not known, use
os.fsdecode before calling this function.
[clinic start generated code]*/

static TyObject *
_winapi_GetLongPathName_impl(TyObject *module, LPCWSTR path)
/*[clinic end generated code: output=c4774b080275a2d0 input=9872e211e3a4a88f]*/
{
    DWORD cchBuffer;
    TyObject *result = NULL;

    Ty_BEGIN_ALLOW_THREADS
    cchBuffer = GetLongPathNameW(path, NULL, 0);
    Ty_END_ALLOW_THREADS
    if (cchBuffer) {
        WCHAR *buffer = (WCHAR *)TyMem_Malloc(cchBuffer * sizeof(WCHAR));
        if (buffer) {
            Ty_BEGIN_ALLOW_THREADS
            cchBuffer = GetLongPathNameW(path, buffer, cchBuffer);
            Ty_END_ALLOW_THREADS
            if (cchBuffer) {
                result = TyUnicode_FromWideChar(buffer, cchBuffer);
            } else {
                TyErr_SetFromWindowsErr(0);
            }
            TyMem_Free((void *)buffer);
        }
    } else {
        TyErr_SetFromWindowsErr(0);
    }
    return result;
}

/*[clinic input]
_winapi.GetModuleFileName

    module_handle: HMODULE
    /

Return the fully-qualified path for the file that contains module.

The module must have been loaded by the current process.

The module parameter should be a handle to the loaded module
whose path is being requested. If this parameter is 0,
GetModuleFileName retrieves the path of the executable file
of the current process.
[clinic start generated code]*/

static TyObject *
_winapi_GetModuleFileName_impl(TyObject *module, HMODULE module_handle)
/*[clinic end generated code: output=85b4b728c5160306 input=6d66ff7deca5d11f]*/
{
    BOOL result;
    WCHAR filename[MAX_PATH];

    Ty_BEGIN_ALLOW_THREADS
    result = GetModuleFileNameW(module_handle, filename, MAX_PATH);
    filename[MAX_PATH-1] = '\0';
    Ty_END_ALLOW_THREADS

    if (! result)
        return TyErr_SetFromWindowsErr(GetLastError());

    return TyUnicode_FromWideChar(filename, wcslen(filename));
}

/*[clinic input]
_winapi.GetShortPathName

    path: LPCWSTR

Return the short version of the provided path.

If the path is already in its short form, returns the same value.

The path must already be a 'str'. If the type is not known, use
os.fsdecode before calling this function.
[clinic start generated code]*/

static TyObject *
_winapi_GetShortPathName_impl(TyObject *module, LPCWSTR path)
/*[clinic end generated code: output=dab6ae494c621e81 input=43fa349aaf2ac718]*/
{
    DWORD cchBuffer;
    TyObject *result = NULL;

    Ty_BEGIN_ALLOW_THREADS
    cchBuffer = GetShortPathNameW(path, NULL, 0);
    Ty_END_ALLOW_THREADS
    if (cchBuffer) {
        WCHAR *buffer = (WCHAR *)TyMem_Malloc(cchBuffer * sizeof(WCHAR));
        if (buffer) {
            Ty_BEGIN_ALLOW_THREADS
            cchBuffer = GetShortPathNameW(path, buffer, cchBuffer);
            Ty_END_ALLOW_THREADS
            if (cchBuffer) {
                result = TyUnicode_FromWideChar(buffer, cchBuffer);
            } else {
                TyErr_SetFromWindowsErr(0);
            }
            TyMem_Free((void *)buffer);
        }
    } else {
        TyErr_SetFromWindowsErr(0);
    }
    return result;
}

/*[clinic input]
_winapi.GetStdHandle -> HANDLE

    std_handle: DWORD
        One of STD_INPUT_HANDLE, STD_OUTPUT_HANDLE, or STD_ERROR_HANDLE.
    /

Return a handle to the specified standard device.

The integer associated with the handle object is returned.
[clinic start generated code]*/

static HANDLE
_winapi_GetStdHandle_impl(TyObject *module, DWORD std_handle)
/*[clinic end generated code: output=0e613001e73ab614 input=07016b06a2fc8826]*/
{
    HANDLE handle;

    Ty_BEGIN_ALLOW_THREADS
    handle = GetStdHandle(std_handle);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE)
        TyErr_SetFromWindowsErr(GetLastError());

    return handle;
}

/*[clinic input]
_winapi.GetVersion -> long

Return the version number of the current operating system.
[clinic start generated code]*/

static long
_winapi_GetVersion_impl(TyObject *module)
/*[clinic end generated code: output=e41f0db5a3b82682 input=e21dff8d0baeded2]*/
/* Disable deprecation warnings about GetVersionEx as the result is
   being passed straight through to the caller, who is responsible for
   using it correctly. */
#pragma warning(push)
#pragma warning(disable:4996)

{
    return GetVersion();
}

#pragma warning(pop)

/*[clinic input]
_winapi.MapViewOfFile -> LPVOID

    file_map: HANDLE
    desired_access: DWORD
    file_offset_high: DWORD
    file_offset_low: DWORD
    number_bytes: size_t
    /
[clinic start generated code]*/

static LPVOID
_winapi_MapViewOfFile_impl(TyObject *module, HANDLE file_map,
                           DWORD desired_access, DWORD file_offset_high,
                           DWORD file_offset_low, size_t number_bytes)
/*[clinic end generated code: output=f23b1ee4823663e3 input=177471073be1a103]*/
{
    LPVOID address;

    Ty_BEGIN_ALLOW_THREADS
    address = MapViewOfFile(file_map, desired_access, file_offset_high,
                            file_offset_low, number_bytes);
    Ty_END_ALLOW_THREADS

    if (address == NULL)
        TyErr_SetFromWindowsErr(0);

    return address;
}

/*[clinic input]
_winapi.UnmapViewOfFile

    address: LPCVOID
    /
[clinic start generated code]*/

static TyObject *
_winapi_UnmapViewOfFile_impl(TyObject *module, LPCVOID address)
/*[clinic end generated code: output=4f7e18ac75d19744 input=8c4b6119ad9288a3]*/
{
    BOOL success;

    Ty_BEGIN_ALLOW_THREADS
    success = UnmapViewOfFile(address);
    Ty_END_ALLOW_THREADS

    if (!success) {
        return TyErr_SetFromWindowsErr(0);
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.OpenEventW -> HANDLE

    desired_access: DWORD
    inherit_handle: BOOL
    name: LPCWSTR
[clinic start generated code]*/

static HANDLE
_winapi_OpenEventW_impl(TyObject *module, DWORD desired_access,
                        BOOL inherit_handle, LPCWSTR name)
/*[clinic end generated code: output=c4a45e95545a4bd2 input=dec26598748d35aa]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.OpenEventW", "ku", desired_access, name) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = OpenEventW(desired_access, inherit_handle, name);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE) {
        TyErr_SetFromWindowsErr(0);
    }

    return handle;
}


/*[clinic input]
_winapi.OpenMutexW -> HANDLE

    desired_access: DWORD
    inherit_handle: BOOL
    name: LPCWSTR
[clinic start generated code]*/

static HANDLE
_winapi_OpenMutexW_impl(TyObject *module, DWORD desired_access,
                        BOOL inherit_handle, LPCWSTR name)
/*[clinic end generated code: output=dda39d7844397bf0 input=f3a7b466c5307712]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.OpenMutexW", "ku", desired_access, name) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = OpenMutexW(desired_access, inherit_handle, name);
    Ty_END_ALLOW_THREADS

    if (handle == INVALID_HANDLE_VALUE) {
        TyErr_SetFromWindowsErr(0);
    }

    return handle;
}

/*[clinic input]
_winapi.OpenFileMapping -> HANDLE

    desired_access: DWORD
    inherit_handle: BOOL
    name: LPCWSTR
    /
[clinic start generated code]*/

static HANDLE
_winapi_OpenFileMapping_impl(TyObject *module, DWORD desired_access,
                             BOOL inherit_handle, LPCWSTR name)
/*[clinic end generated code: output=08cc44def1cb11f1 input=131f2a405359de7f]*/
{
    HANDLE handle;

    Ty_BEGIN_ALLOW_THREADS
    handle = OpenFileMappingW(desired_access, inherit_handle, name);
    Ty_END_ALLOW_THREADS

    if (handle == NULL) {
        TyObject *temp = TyUnicode_FromWideChar(name, -1);
        TyErr_SetExcFromWindowsErrWithFilenameObject(TyExc_OSError, 0, temp);
        Ty_XDECREF(temp);
        handle = INVALID_HANDLE_VALUE;
    }

    return handle;
}

/*[clinic input]
_winapi.OpenProcess -> HANDLE

    desired_access: DWORD
    inherit_handle: BOOL
    process_id: DWORD
    /
[clinic start generated code]*/

static HANDLE
_winapi_OpenProcess_impl(TyObject *module, DWORD desired_access,
                         BOOL inherit_handle, DWORD process_id)
/*[clinic end generated code: output=b42b6b81ea5a0fc3 input=ec98c4cf4ea2ec36]*/
{
    HANDLE handle;

    if (TySys_Audit("_winapi.OpenProcess", "kk",
                    process_id, desired_access) < 0) {
        return INVALID_HANDLE_VALUE;
    }

    Ty_BEGIN_ALLOW_THREADS
    handle = OpenProcess(desired_access, inherit_handle, process_id);
    Ty_END_ALLOW_THREADS
    if (handle == NULL) {
        TyErr_SetFromWindowsErr(GetLastError());
        handle = INVALID_HANDLE_VALUE;
    }

    return handle;
}

/*[clinic input]
_winapi.PeekNamedPipe

    handle: HANDLE
    size: int = 0
    /
[clinic start generated code]*/

static TyObject *
_winapi_PeekNamedPipe_impl(TyObject *module, HANDLE handle, int size)
/*[clinic end generated code: output=d0c3e29e49d323dd input=c7aa53bfbce69d70]*/
{
    TyObject *buf = NULL;
    DWORD nread, navail, nleft;
    BOOL ret;

    if (size < 0) {
        TyErr_SetString(TyExc_ValueError, "negative size");
        return NULL;
    }

    if (size) {
        buf = TyBytes_FromStringAndSize(NULL, size);
        if (!buf)
            return NULL;
        Ty_BEGIN_ALLOW_THREADS
        ret = PeekNamedPipe(handle, TyBytes_AS_STRING(buf), size, &nread,
                            &navail, &nleft);
        Ty_END_ALLOW_THREADS
        if (!ret) {
            Ty_DECREF(buf);
            return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
        }
        if (_TyBytes_Resize(&buf, nread))
            return NULL;
        return Ty_BuildValue("NII", buf, navail, nleft);
    }
    else {
        Ty_BEGIN_ALLOW_THREADS
        ret = PeekNamedPipe(handle, NULL, 0, NULL, &navail, &nleft);
        Ty_END_ALLOW_THREADS
        if (!ret) {
            return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
        }
        return Ty_BuildValue("II", navail, nleft);
    }
}

/*[clinic input]
_winapi.LCMapStringEx

    locale: LPCWSTR
    flags: DWORD
    src: unicode

[clinic start generated code]*/

static TyObject *
_winapi_LCMapStringEx_impl(TyObject *module, LPCWSTR locale, DWORD flags,
                           TyObject *src)
/*[clinic end generated code: output=b90e6b26e028ff0a input=3e3dcd9b8164012f]*/
{
    if (flags & (LCMAP_SORTHANDLE | LCMAP_HASH | LCMAP_BYTEREV |
                 LCMAP_SORTKEY)) {
        return TyErr_Format(TyExc_ValueError, "unsupported flags");
    }

    Ty_ssize_t src_size;
    wchar_t *src_ = TyUnicode_AsWideCharString(src, &src_size);
    if (!src_) {
        return NULL;
    }
    if (src_size > INT_MAX) {
        TyMem_Free(src_);
        TyErr_SetString(TyExc_OverflowError, "input string is too long");
        return NULL;
    }

    int dest_size = LCMapStringEx(locale, flags, src_, (int)src_size, NULL, 0,
                                  NULL, NULL, 0);
    if (dest_size <= 0) {
        DWORD error = GetLastError();
        TyMem_Free(src_);
        return TyErr_SetFromWindowsErr(error);
    }

    wchar_t* dest = TyMem_NEW(wchar_t, dest_size);
    if (dest == NULL) {
        TyMem_Free(src_);
        return TyErr_NoMemory();
    }

    int nmapped = LCMapStringEx(locale, flags, src_, (int)src_size, dest, dest_size,
                                NULL, NULL, 0);
    if (nmapped <= 0) {
        DWORD error = GetLastError();
        TyMem_Free(src_);
        TyMem_DEL(dest);
        return TyErr_SetFromWindowsErr(error);
    }

    TyMem_Free(src_);
    TyObject *ret = TyUnicode_FromWideChar(dest, nmapped);
    TyMem_DEL(dest);

    return ret;
}

/*[clinic input]
_winapi.ReadFile

    handle: HANDLE
    size: DWORD
    overlapped as use_overlapped: bool = False
[clinic start generated code]*/

static TyObject *
_winapi_ReadFile_impl(TyObject *module, HANDLE handle, DWORD size,
                      int use_overlapped)
/*[clinic end generated code: output=d3d5b44a8201b944 input=4f82f8e909ad91ad]*/
{
    DWORD nread;
    TyObject *buf;
    BOOL ret;
    DWORD err;
    OverlappedObject *overlapped = NULL;

    buf = TyBytes_FromStringAndSize(NULL, size);
    if (!buf)
        return NULL;
    if (use_overlapped) {
        overlapped = new_overlapped(module, handle);
        if (!overlapped) {
            Ty_DECREF(buf);
            return NULL;
        }
        /* Steals reference to buf */
        overlapped->read_buffer = buf;
    }

    Ty_BEGIN_ALLOW_THREADS
    ret = ReadFile(handle, TyBytes_AS_STRING(buf), size, &nread,
                   overlapped ? &overlapped->overlapped : NULL);
    Ty_END_ALLOW_THREADS

    err = ret ? 0 : GetLastError();

    if (overlapped) {
        if (!ret) {
            if (err == ERROR_IO_PENDING)
                overlapped->pending = 1;
            else if (err != ERROR_MORE_DATA) {
                Ty_DECREF(overlapped);
                return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
            }
        }
        return Ty_BuildValue("NI", (TyObject *) overlapped, err);
    }

    if (!ret && err != ERROR_MORE_DATA) {
        Ty_DECREF(buf);
        return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
    }
    if (_TyBytes_Resize(&buf, nread))
        return NULL;
    return Ty_BuildValue("NI", buf, err);
}

/*[clinic input]
_winapi.ReleaseMutex

    mutex: HANDLE
[clinic start generated code]*/

static TyObject *
_winapi_ReleaseMutex_impl(TyObject *module, HANDLE mutex)
/*[clinic end generated code: output=5b9001a72dd8af37 input=49e9d20de3559d84]*/
{
    int err = 0;

    Ty_BEGIN_ALLOW_THREADS
    if (!ReleaseMutex(mutex)) {
        err = GetLastError();
    }
    Ty_END_ALLOW_THREADS
    if (err) {
        return TyErr_SetFromWindowsErr(err);
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.ResetEvent

    event: HANDLE
[clinic start generated code]*/

static TyObject *
_winapi_ResetEvent_impl(TyObject *module, HANDLE event)
/*[clinic end generated code: output=81c8501d57c0530d input=e2d42d990322e87a]*/
{
    int err = 0;

    Ty_BEGIN_ALLOW_THREADS
    if (!ResetEvent(event)) {
        err = GetLastError();
    }
    Ty_END_ALLOW_THREADS
    if (err) {
        return TyErr_SetFromWindowsErr(err);
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.SetEvent

    event: HANDLE
[clinic start generated code]*/

static TyObject *
_winapi_SetEvent_impl(TyObject *module, HANDLE event)
/*[clinic end generated code: output=c18ba09eb9aa774d input=e660e830a37c09f8]*/
{
    int err = 0;

    Ty_BEGIN_ALLOW_THREADS
    if (!SetEvent(event)) {
        err = GetLastError();
    }
    Ty_END_ALLOW_THREADS
    if (err) {
        return TyErr_SetFromWindowsErr(err);
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.SetNamedPipeHandleState

    named_pipe: HANDLE
    mode: object
    max_collection_count: object
    collect_data_timeout: object
    /
[clinic start generated code]*/

static TyObject *
_winapi_SetNamedPipeHandleState_impl(TyObject *module, HANDLE named_pipe,
                                     TyObject *mode,
                                     TyObject *max_collection_count,
                                     TyObject *collect_data_timeout)
/*[clinic end generated code: output=f2129d222cbfa095 input=9142d72163d0faa6]*/
{
    TyObject *oArgs[3] = {mode, max_collection_count, collect_data_timeout};
    DWORD dwArgs[3], *pArgs[3] = {NULL, NULL, NULL};
    int i;
    BOOL b;

    for (i = 0 ; i < 3 ; i++) {
        if (oArgs[i] != Ty_None) {
            dwArgs[i] = TyLong_AsUnsignedLongMask(oArgs[i]);
            if (TyErr_Occurred())
                return NULL;
            pArgs[i] = &dwArgs[i];
        }
    }

    Ty_BEGIN_ALLOW_THREADS
    b = SetNamedPipeHandleState(named_pipe, pArgs[0], pArgs[1], pArgs[2]);
    Ty_END_ALLOW_THREADS

    if (!b)
        return TyErr_SetFromWindowsErr(0);

    Py_RETURN_NONE;
}


/*[clinic input]
_winapi.TerminateProcess

    handle: HANDLE
    exit_code: UINT
    /

Terminate the specified process and all of its threads.
[clinic start generated code]*/

static TyObject *
_winapi_TerminateProcess_impl(TyObject *module, HANDLE handle,
                              UINT exit_code)
/*[clinic end generated code: output=f4e99ac3f0b1f34a input=d6bc0aa1ee3bb4df]*/
{
    BOOL result;

    if (TySys_Audit("_winapi.TerminateProcess", "nI",
                    (Ty_ssize_t)handle, exit_code) < 0) {
        return NULL;
    }

    result = TerminateProcess(handle, exit_code);

    if (! result)
        return TyErr_SetFromWindowsErr(GetLastError());

    Py_RETURN_NONE;
}

/*[clinic input]
_winapi.VirtualQuerySize -> size_t

    address: LPCVOID
    /
[clinic start generated code]*/

static size_t
_winapi_VirtualQuerySize_impl(TyObject *module, LPCVOID address)
/*[clinic end generated code: output=40c8e0ff5ec964df input=6b784a69755d0bb6]*/
{
    SIZE_T size_of_buf;
    MEMORY_BASIC_INFORMATION mem_basic_info;
    SIZE_T region_size;

    Ty_BEGIN_ALLOW_THREADS
    size_of_buf = VirtualQuery(address, &mem_basic_info, sizeof(mem_basic_info));
    Ty_END_ALLOW_THREADS

    if (size_of_buf == 0)
        TyErr_SetFromWindowsErr(0);

    region_size = mem_basic_info.RegionSize;
    return region_size;
}

/*[clinic input]
_winapi.WaitNamedPipe

    name: LPCWSTR
    timeout: DWORD
    /
[clinic start generated code]*/

static TyObject *
_winapi_WaitNamedPipe_impl(TyObject *module, LPCWSTR name, DWORD timeout)
/*[clinic end generated code: output=e161e2e630b3e9c2 input=099a4746544488fa]*/
{
    BOOL success;

    Ty_BEGIN_ALLOW_THREADS
    success = WaitNamedPipeW(name, timeout);
    Ty_END_ALLOW_THREADS

    if (!success)
        return TyErr_SetFromWindowsErr(0);

    Py_RETURN_NONE;
}


typedef struct {
    HANDLE handles[MAXIMUM_WAIT_OBJECTS];
    HANDLE cancel_event;
    DWORD handle_base;
    DWORD handle_count;
    HANDLE thread;
    volatile DWORD result;
} BatchedWaitData;

static DWORD WINAPI
_batched_WaitForMultipleObjects_thread(LPVOID param)
{
    BatchedWaitData *data = (BatchedWaitData *)param;
    data->result = WaitForMultipleObjects(
        data->handle_count,
        data->handles,
        FALSE,
        INFINITE
    );
    if (data->result == WAIT_FAILED) {
        DWORD err = GetLastError();
        SetEvent(data->cancel_event);
        return err;
    } else if (data->result >= WAIT_ABANDONED_0 && data->result < WAIT_ABANDONED_0 + MAXIMUM_WAIT_OBJECTS) {
        data->result = WAIT_FAILED;
        SetEvent(data->cancel_event);
        return ERROR_ABANDONED_WAIT_0;
    }
    return 0;
}

/*[clinic input]
_winapi.BatchedWaitForMultipleObjects

    handle_seq: object
    wait_all: BOOL
    milliseconds: DWORD(c_default='INFINITE') = _winapi.INFINITE

Supports a larger number of handles than WaitForMultipleObjects

Note that the handles may be waited on other threads, which could cause
issues for objects like mutexes that become associated with the thread
that was waiting for them. Objects may also be left signalled, even if
the wait fails.

It is recommended to use WaitForMultipleObjects whenever possible, and
only switch to BatchedWaitForMultipleObjects for scenarios where you
control all the handles involved, such as your own thread pool or
files, and all wait objects are left unmodified by a wait (for example,
manual reset events, threads, and files/pipes).

Overlapped handles returned from this module use manual reset events.
[clinic start generated code]*/

static TyObject *
_winapi_BatchedWaitForMultipleObjects_impl(TyObject *module,
                                           TyObject *handle_seq,
                                           BOOL wait_all, DWORD milliseconds)
/*[clinic end generated code: output=d21c1a4ad0a252fd input=7e196f29005dc77b]*/
{
    Ty_ssize_t thread_count = 0, handle_count = 0, i;
    Ty_ssize_t nhandles;
    BatchedWaitData *thread_data[MAXIMUM_WAIT_OBJECTS];
    HANDLE handles[MAXIMUM_WAIT_OBJECTS];
    HANDLE sigint_event = NULL;
    HANDLE cancel_event = NULL;
    DWORD result;

    const Ty_ssize_t _MAXIMUM_TOTAL_OBJECTS = (MAXIMUM_WAIT_OBJECTS - 1) * (MAXIMUM_WAIT_OBJECTS - 1);

    if (!PySequence_Check(handle_seq)) {
        TyErr_Format(TyExc_TypeError,
                     "sequence type expected, got '%s'",
                     Ty_TYPE(handle_seq)->tp_name);
        return NULL;
    }
    nhandles = PySequence_Length(handle_seq);
    if (nhandles == -1) {
        return NULL;
    }
    if (nhandles == 0) {
        return wait_all ? Ty_NewRef(Ty_None) : TyList_New(0);
    }

    /* If this is the main thread then make the wait interruptible
       by Ctrl-C. When waiting for *all* handles, it is only checked
       in between batches. */
    if (_TyOS_IsMainThread()) {
        sigint_event = _TyOS_SigintEvent();
        assert(sigint_event != NULL);
    }

    if (nhandles < 0 || nhandles > _MAXIMUM_TOTAL_OBJECTS) {
        TyErr_Format(TyExc_ValueError,
                     "need at most %zd handles, got a sequence of length %zd",
                     _MAXIMUM_TOTAL_OBJECTS, nhandles);
        return NULL;
    }

    if (!wait_all) {
        cancel_event = CreateEventW(NULL, TRUE, FALSE, NULL);
        if (!cancel_event) {
            TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
            return NULL;
        }
    }

    i = 0;
    while (i < nhandles) {
        BatchedWaitData *data = (BatchedWaitData*)TyMem_Malloc(sizeof(BatchedWaitData));
        if (!data) {
            goto error;
        }
        thread_data[thread_count++] = data;
        data->thread = NULL;
        data->cancel_event = cancel_event;
        data->handle_base = Ty_SAFE_DOWNCAST(i, Ty_ssize_t, DWORD);
        data->handle_count = Ty_SAFE_DOWNCAST(nhandles - i, Ty_ssize_t, DWORD);
        if (data->handle_count > MAXIMUM_WAIT_OBJECTS - 1) {
            data->handle_count = MAXIMUM_WAIT_OBJECTS - 1;
        }
        for (DWORD j = 0; j < data->handle_count; ++i, ++j) {
            TyObject *v = PySequence_GetItem(handle_seq, i);
            if (!v || !TyArg_Parse(v, F_HANDLE, &data->handles[j])) {
                Ty_XDECREF(v);
                goto error;
            }
            Ty_DECREF(v);
        }
        if (!wait_all) {
            data->handles[data->handle_count++] = cancel_event;
        }
    }

    DWORD err = 0;

    /* We need to use different strategies when waiting for ALL handles
       as opposed to ANY handle. This is because there is no way to
       (safely) interrupt a thread that is waiting for all handles in a
       group. So for ALL handles, we loop over each set and wait. For
       ANY handle, we use threads and wait on them. */
    if (wait_all) {
        Ty_BEGIN_ALLOW_THREADS
        long long deadline = 0;
        if (milliseconds != INFINITE) {
            deadline = (long long)GetTickCount64() + milliseconds;
        }

        for (i = 0; !err && i < thread_count; ++i) {
            DWORD timeout = milliseconds;
            if (deadline) {
                long long time_to_deadline = deadline - GetTickCount64();
                if (time_to_deadline <= 0) {
                    err = WAIT_TIMEOUT;
                    break;
                } else if (time_to_deadline < UINT_MAX) {
                    timeout = (DWORD)time_to_deadline;
                }
            }
            result = WaitForMultipleObjects(thread_data[i]->handle_count,
                                            thread_data[i]->handles, TRUE, timeout);
            // ABANDONED is not possible here because we own all the handles
            if (result == WAIT_FAILED) {
                err = GetLastError();
            } else if (result == WAIT_TIMEOUT) {
                err = WAIT_TIMEOUT;
            }

            if (!err && sigint_event) {
                result = WaitForSingleObject(sigint_event, 0);
                if (result == WAIT_OBJECT_0) {
                    err = ERROR_CONTROL_C_EXIT;
                } else if (result == WAIT_FAILED) {
                    err = GetLastError();
                }
            }
        }

        CloseHandle(cancel_event);

        Ty_END_ALLOW_THREADS
    } else {
        Ty_BEGIN_ALLOW_THREADS

        for (i = 0; i < thread_count; ++i) {
            BatchedWaitData *data = thread_data[i];
            data->thread = CreateThread(
                NULL,
                1,  // smallest possible initial stack
                _batched_WaitForMultipleObjects_thread,
                (LPVOID)data,
                CREATE_SUSPENDED,
                NULL
            );
            if (!data->thread) {
                err = GetLastError();
                break;
            }
            handles[handle_count++] = data->thread;
        }
        Ty_END_ALLOW_THREADS

        if (err) {
            TyErr_SetExcFromWindowsErr(TyExc_OSError, err);
            goto error;
        }
        if (handle_count > MAXIMUM_WAIT_OBJECTS - 1) {
            // basically an assert, but stronger
            TyErr_SetString(TyExc_SystemError, "allocated too many wait objects");
            goto error;
        }

        Ty_BEGIN_ALLOW_THREADS

        // Once we start resuming threads, can no longer "goto error"
        for (i = 0; i < thread_count; ++i) {
            ResumeThread(thread_data[i]->thread);
        }
        if (sigint_event) {
            handles[handle_count++] = sigint_event;
        }
        result = WaitForMultipleObjects((DWORD)handle_count, handles, wait_all, milliseconds);
        // ABANDONED is not possible here because we own all the handles
        if (result == WAIT_FAILED) {
            err = GetLastError();
        } else if (result == WAIT_TIMEOUT) {
            err = WAIT_TIMEOUT;
        } else if (sigint_event && result == WAIT_OBJECT_0 + handle_count) {
            err = ERROR_CONTROL_C_EXIT;
        }

        SetEvent(cancel_event);

        // Wait for all threads to finish before we start freeing their memory
        if (sigint_event) {
            handle_count -= 1;
        }
        WaitForMultipleObjects((DWORD)handle_count, handles, TRUE, INFINITE);

        for (i = 0; i < thread_count; ++i) {
            if (!err && thread_data[i]->result == WAIT_FAILED) {
                if (!GetExitCodeThread(thread_data[i]->thread, &err)) {
                    err = GetLastError();
                }
            }
            CloseHandle(thread_data[i]->thread);
        }

        CloseHandle(cancel_event);

        Ty_END_ALLOW_THREADS

    }

    TyObject *triggered_indices;
    if (sigint_event != NULL && err == ERROR_CONTROL_C_EXIT) {
        errno = EINTR;
        TyErr_SetFromErrno(TyExc_OSError);
        triggered_indices = NULL;
    } else if (err) {
        TyErr_SetExcFromWindowsErr(TyExc_OSError, err);
        triggered_indices = NULL;
    } else if (wait_all) {
        triggered_indices = Ty_NewRef(Ty_None);
    } else {
        triggered_indices = TyList_New(0);
        if (triggered_indices) {
            for (i = 0; i < thread_count; ++i) {
                Ty_ssize_t triggered = (Ty_ssize_t)thread_data[i]->result - WAIT_OBJECT_0;
                if (triggered >= 0 && (size_t)triggered < thread_data[i]->handle_count - 1) {
                    TyObject *v = TyLong_FromSsize_t(thread_data[i]->handle_base + triggered);
                    if (!v || TyList_Append(triggered_indices, v) < 0) {
                        Ty_XDECREF(v);
                        Ty_CLEAR(triggered_indices);
                        break;
                    }
                    Ty_DECREF(v);
                }
            }
        }
    }

    for (i = 0; i < thread_count; ++i) {
        TyMem_Free((void *)thread_data[i]);
    }

    return triggered_indices;

error:
    // We should only enter here before any threads start running.
    // Once we start resuming threads, different cleanup is required
    CloseHandle(cancel_event);
    while (--thread_count >= 0) {
        HANDLE t = thread_data[thread_count]->thread;
        if (t) {
            TerminateThread(t, WAIT_ABANDONED_0);
            CloseHandle(t);
        }
        TyMem_Free((void *)thread_data[thread_count]);
    }
    return NULL;
}

/*[clinic input]
_winapi.WaitForMultipleObjects

    handle_seq: object
    wait_flag: BOOL
    milliseconds: DWORD(c_default='INFINITE') = _winapi.INFINITE
    /
[clinic start generated code]*/

static TyObject *
_winapi_WaitForMultipleObjects_impl(TyObject *module, TyObject *handle_seq,
                                    BOOL wait_flag, DWORD milliseconds)
/*[clinic end generated code: output=295e3f00b8e45899 input=36f76ca057cd28a0]*/
{
    DWORD result;
    HANDLE handles[MAXIMUM_WAIT_OBJECTS];
    HANDLE sigint_event = NULL;
    Ty_ssize_t nhandles, i;

    if (!PySequence_Check(handle_seq)) {
        TyErr_Format(TyExc_TypeError,
                     "sequence type expected, got '%s'",
                     Ty_TYPE(handle_seq)->tp_name);
        return NULL;
    }
    nhandles = PySequence_Length(handle_seq);
    if (nhandles == -1)
        return NULL;
    if (nhandles < 0 || nhandles > MAXIMUM_WAIT_OBJECTS - 1) {
        TyErr_Format(TyExc_ValueError,
                     "need at most %zd handles, got a sequence of length %zd",
                     MAXIMUM_WAIT_OBJECTS - 1, nhandles);
        return NULL;
    }
    for (i = 0; i < nhandles; i++) {
        HANDLE h;
        TyObject *v = PySequence_GetItem(handle_seq, i);
        if (v == NULL)
            return NULL;
        if (!TyArg_Parse(v, F_HANDLE, &h)) {
            Ty_DECREF(v);
            return NULL;
        }
        handles[i] = h;
        Ty_DECREF(v);
    }
    /* If this is the main thread then make the wait interruptible
       by Ctrl-C unless we are waiting for *all* handles */
    if (!wait_flag && _TyOS_IsMainThread()) {
        sigint_event = _TyOS_SigintEvent();
        assert(sigint_event != NULL);
        handles[nhandles++] = sigint_event;
    }

    Ty_BEGIN_ALLOW_THREADS
    if (sigint_event != NULL)
        ResetEvent(sigint_event);
    result = WaitForMultipleObjects((DWORD) nhandles, handles,
                                    wait_flag, milliseconds);
    Ty_END_ALLOW_THREADS

    if (result == WAIT_FAILED)
        return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
    else if (sigint_event != NULL && result == WAIT_OBJECT_0 + nhandles - 1) {
        errno = EINTR;
        return TyErr_SetFromErrno(TyExc_OSError);
    }

    return TyLong_FromLong((int) result);
}

/*[clinic input]
_winapi.WaitForSingleObject -> long

    handle: HANDLE
    milliseconds: DWORD
    /

Wait for a single object.

Wait until the specified object is in the signaled state or
the time-out interval elapses. The timeout value is specified
in milliseconds.
[clinic start generated code]*/

static long
_winapi_WaitForSingleObject_impl(TyObject *module, HANDLE handle,
                                 DWORD milliseconds)
/*[clinic end generated code: output=3c4715d8f1b39859 input=443d1ab076edc7b1]*/
{
    DWORD result;

    Ty_BEGIN_ALLOW_THREADS
    result = WaitForSingleObject(handle, milliseconds);
    Ty_END_ALLOW_THREADS

    if (result == WAIT_FAILED) {
        TyErr_SetFromWindowsErr(GetLastError());
        return -1;
    }

    return result;
}

/*[clinic input]
_winapi.WriteFile

    handle: HANDLE
    buffer: object
    overlapped as use_overlapped: bool = False
[clinic start generated code]*/

static TyObject *
_winapi_WriteFile_impl(TyObject *module, HANDLE handle, TyObject *buffer,
                       int use_overlapped)
/*[clinic end generated code: output=2ca80f6bf3fa92e3 input=2badb008c8a2e2a0]*/
{
    Ty_buffer _buf, *buf;
    DWORD len, written;
    BOOL ret;
    DWORD err;
    OverlappedObject *overlapped = NULL;

    if (use_overlapped) {
        overlapped = new_overlapped(module, handle);
        if (!overlapped)
            return NULL;
        buf = &overlapped->write_buffer;
    }
    else
        buf = &_buf;

    if (!TyArg_Parse(buffer, "y*", buf)) {
        Ty_XDECREF(overlapped);
        return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    len = (DWORD)Ty_MIN(buf->len, PY_DWORD_MAX);
    ret = WriteFile(handle, buf->buf, len, &written,
                    overlapped ? &overlapped->overlapped : NULL);
    Ty_END_ALLOW_THREADS

    err = ret ? 0 : GetLastError();

    if (overlapped) {
        if (!ret) {
            if (err == ERROR_IO_PENDING)
                overlapped->pending = 1;
            else {
                Ty_DECREF(overlapped);
                return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
            }
        }
        return Ty_BuildValue("NI", (TyObject *) overlapped, err);
    }

    PyBuffer_Release(buf);
    if (!ret)
        return TyErr_SetExcFromWindowsErr(TyExc_OSError, 0);
    return Ty_BuildValue("II", written, err);
}

/*[clinic input]
_winapi.GetACP

Get the current Windows ANSI code page identifier.
[clinic start generated code]*/

static TyObject *
_winapi_GetACP_impl(TyObject *module)
/*[clinic end generated code: output=f7ee24bf705dbb88 input=1433c96d03a05229]*/
{
    return TyLong_FromUnsignedLong(GetACP());
}

/*[clinic input]
_winapi.GetFileType -> DWORD

    handle: HANDLE
[clinic start generated code]*/

static DWORD
_winapi_GetFileType_impl(TyObject *module, HANDLE handle)
/*[clinic end generated code: output=92b8466ac76ecc17 input=0058366bc40bbfbf]*/
{
    DWORD result;

    Ty_BEGIN_ALLOW_THREADS
    result = GetFileType(handle);
    Ty_END_ALLOW_THREADS

    if (result == FILE_TYPE_UNKNOWN && GetLastError() != NO_ERROR) {
        TyErr_SetFromWindowsErr(0);
        return -1;
    }

    return result;
}


/*[clinic input]
_winapi._mimetypes_read_windows_registry

    on_type_read: object

Optimized function for reading all known MIME types from the registry.

*on_type_read* is a callable taking *type* and *ext* arguments, as for
MimeTypes.add_type.
[clinic start generated code]*/

static TyObject *
_winapi__mimetypes_read_windows_registry_impl(TyObject *module,
                                              TyObject *on_type_read)
/*[clinic end generated code: output=20829f00bebce55b input=cd357896d6501f68]*/
{
#define CCH_EXT 128
#define CB_TYPE 510
    struct {
        wchar_t ext[CCH_EXT];
        wchar_t type[CB_TYPE / sizeof(wchar_t) + 1];
    } entries[64];
    int entry = 0;
    HKEY hkcr = NULL;
    LRESULT err;

    Ty_BEGIN_ALLOW_THREADS
    err = RegOpenKeyExW(HKEY_CLASSES_ROOT, NULL, 0, KEY_READ, &hkcr);
    for (DWORD i = 0; err == ERROR_SUCCESS || err == ERROR_MORE_DATA; ++i) {
        LPWSTR ext = entries[entry].ext;
        LPWSTR type = entries[entry].type;
        DWORD cchExt = CCH_EXT;
        DWORD cbType = CB_TYPE;
        HKEY subkey;
        DWORD regType;

        err = RegEnumKeyExW(hkcr, i, ext, &cchExt, NULL, NULL, NULL, NULL);
        if (err != ERROR_SUCCESS || (cchExt && ext[0] != L'.')) {
            continue;
        }

        err = RegOpenKeyExW(hkcr, ext, 0, KEY_READ, &subkey);
        if (err == ERROR_FILE_NOT_FOUND || err == ERROR_ACCESS_DENIED) {
            err = ERROR_SUCCESS;
            continue;
        } else if (err != ERROR_SUCCESS) {
            continue;
        }

        err = RegQueryValueExW(subkey, L"Content Type", NULL,
                              &regType, (LPBYTE)type, &cbType);
        RegCloseKey(subkey);
        if (err == ERROR_FILE_NOT_FOUND) {
            err = ERROR_SUCCESS;
            continue;
        } else if (err != ERROR_SUCCESS) {
            continue;
        } else if (regType != REG_SZ || !cbType) {
            continue;
        }
        type[cbType / sizeof(wchar_t)] = L'\0';

        entry += 1;

        /* Flush our cached entries if we are full */
        if (entry == sizeof(entries) / sizeof(entries[0])) {
            Ty_BLOCK_THREADS
            for (int j = 0; j < entry; ++j) {
                TyObject *r = PyObject_CallFunction(
                    on_type_read, "uu", entries[j].type, entries[j].ext
                );
                if (!r) {
                    /* We blocked threads, so safe to return from here */
                    RegCloseKey(hkcr);
                    return NULL;
                }
                Ty_DECREF(r);
            }
            Ty_UNBLOCK_THREADS
            entry = 0;
        }
    }
    if (hkcr) {
        RegCloseKey(hkcr);
    }
    Ty_END_ALLOW_THREADS

    if (err != ERROR_SUCCESS && err != ERROR_NO_MORE_ITEMS) {
        TyErr_SetFromWindowsErr((int)err);
        return NULL;
    }

    for (int j = 0; j < entry; ++j) {
        TyObject *r = PyObject_CallFunction(
            on_type_read, "uu", entries[j].type, entries[j].ext
        );
        if (!r) {
            return NULL;
        }
        Ty_DECREF(r);
    }

    Py_RETURN_NONE;
#undef CCH_EXT
#undef CB_TYPE
}

/*[clinic input]
_winapi.NeedCurrentDirectoryForExePath -> bool

    exe_name: LPCWSTR
    /
[clinic start generated code]*/

static int
_winapi_NeedCurrentDirectoryForExePath_impl(TyObject *module,
                                            LPCWSTR exe_name)
/*[clinic end generated code: output=a65ec879502b58fc input=972aac88a1ec2f00]*/
{
    BOOL result;

    Ty_BEGIN_ALLOW_THREADS
    result = NeedCurrentDirectoryForExePathW(exe_name);
    Ty_END_ALLOW_THREADS

    return result;
}


/*[clinic input]
_winapi.CopyFile2

    existing_file_name: LPCWSTR
    new_file_name: LPCWSTR
    flags: DWORD
    progress_routine: object = None

Copies a file from one name to a new name.

This is implemented using the CopyFile2 API, which preserves all stat
and metadata information apart from security attributes.

progress_routine is reserved for future use, but is currently not
implemented. Its value is ignored.
[clinic start generated code]*/

static TyObject *
_winapi_CopyFile2_impl(TyObject *module, LPCWSTR existing_file_name,
                       LPCWSTR new_file_name, DWORD flags,
                       TyObject *progress_routine)
/*[clinic end generated code: output=43d960d9df73d984 input=fb976b8d1492d130]*/
{
    HRESULT hr;
    COPYFILE2_EXTENDED_PARAMETERS params = { sizeof(COPYFILE2_EXTENDED_PARAMETERS) };

    if (TySys_Audit("_winapi.CopyFile2", "uuk",
                    existing_file_name, new_file_name, flags) < 0) {
        return NULL;
    }

    params.dwCopyFlags = flags;
    /* For future implementation. We ignore the value for now so that
       users only have to test for 'CopyFile2' existing and not whether
       the additional parameter exists.
    if (progress_routine != Ty_None) {
        params.pProgressRoutine = _winapi_CopyFile2ProgressRoutine;
        params.pvCallbackContext = Ty_NewRef(progress_routine);
    }
    */
    Ty_BEGIN_ALLOW_THREADS;
    hr = CopyFile2(existing_file_name, new_file_name, &params);
    Ty_END_ALLOW_THREADS;
    /* For future implementation.
    if (progress_routine != Ty_None) {
        Ty_DECREF(progress_routine);
    }
    */
    if (FAILED(hr)) {
        if ((hr & 0xFFFF0000) == 0x80070000) {
            TyErr_SetFromWindowsErr(hr & 0xFFFF);
        } else {
            TyErr_SetFromWindowsErr(hr);
        }
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyMethodDef winapi_functions[] = {
    _WINAPI_CLOSEHANDLE_METHODDEF
    _WINAPI_CONNECTNAMEDPIPE_METHODDEF
    _WINAPI_CREATEEVENTW_METHODDEF
    _WINAPI_CREATEFILE_METHODDEF
    _WINAPI_CREATEFILEMAPPING_METHODDEF
    _WINAPI_CREATEMUTEXW_METHODDEF
    _WINAPI_CREATENAMEDPIPE_METHODDEF
    _WINAPI_CREATEPIPE_METHODDEF
    _WINAPI_CREATEPROCESS_METHODDEF
    _WINAPI_CREATEJUNCTION_METHODDEF
    _WINAPI_DUPLICATEHANDLE_METHODDEF
    _WINAPI_EXITPROCESS_METHODDEF
    _WINAPI_GETCURRENTPROCESS_METHODDEF
    _WINAPI_GETEXITCODEPROCESS_METHODDEF
    _WINAPI_GETLASTERROR_METHODDEF
    _WINAPI_GETLONGPATHNAME_METHODDEF
    _WINAPI_GETMODULEFILENAME_METHODDEF
    _WINAPI_GETSHORTPATHNAME_METHODDEF
    _WINAPI_GETSTDHANDLE_METHODDEF
    _WINAPI_GETVERSION_METHODDEF
    _WINAPI_MAPVIEWOFFILE_METHODDEF
    _WINAPI_OPENEVENTW_METHODDEF
    _WINAPI_OPENFILEMAPPING_METHODDEF
    _WINAPI_OPENMUTEXW_METHODDEF
    _WINAPI_OPENPROCESS_METHODDEF
    _WINAPI_PEEKNAMEDPIPE_METHODDEF
    _WINAPI_LCMAPSTRINGEX_METHODDEF
    _WINAPI_READFILE_METHODDEF
    _WINAPI_RELEASEMUTEX_METHODDEF
    _WINAPI_RESETEVENT_METHODDEF
    _WINAPI_SETEVENT_METHODDEF
    _WINAPI_SETNAMEDPIPEHANDLESTATE_METHODDEF
    _WINAPI_TERMINATEPROCESS_METHODDEF
    _WINAPI_UNMAPVIEWOFFILE_METHODDEF
    _WINAPI_VIRTUALQUERYSIZE_METHODDEF
    _WINAPI_WAITNAMEDPIPE_METHODDEF
    _WINAPI_WAITFORMULTIPLEOBJECTS_METHODDEF
    _WINAPI_BATCHEDWAITFORMULTIPLEOBJECTS_METHODDEF
    _WINAPI_WAITFORSINGLEOBJECT_METHODDEF
    _WINAPI_WRITEFILE_METHODDEF
    _WINAPI_GETACP_METHODDEF
    _WINAPI_GETFILETYPE_METHODDEF
    _WINAPI__MIMETYPES_READ_WINDOWS_REGISTRY_METHODDEF
    _WINAPI_NEEDCURRENTDIRECTORYFOREXEPATH_METHODDEF
    _WINAPI_COPYFILE2_METHODDEF
    {NULL, NULL}
};

#define WINAPI_CONSTANT(fmt, con) \
    do { \
        TyObject *value = Ty_BuildValue(fmt, con); \
        if (value == NULL) { \
            return -1; \
        } \
        if (TyDict_SetItemString(d, #con, value) < 0) { \
            Ty_DECREF(value); \
            return -1; \
        } \
        Ty_DECREF(value); \
    } while (0)

static int winapi_exec(TyObject *m)
{
    WinApiState *st = winapi_get_state(m);

    st->overlapped_type = (TyTypeObject *)TyType_FromModuleAndSpec(m, &winapi_overlapped_type_spec, NULL);
    if (st->overlapped_type == NULL) {
        return -1;
    }

    if (TyModule_AddType(m, st->overlapped_type) < 0) {
        return -1;
    }

    TyObject *d = TyModule_GetDict(m);

    /* constants */
    WINAPI_CONSTANT(F_DWORD, CREATE_NEW_CONSOLE);
    WINAPI_CONSTANT(F_DWORD, CREATE_NEW_PROCESS_GROUP);
    WINAPI_CONSTANT(F_DWORD, DUPLICATE_SAME_ACCESS);
    WINAPI_CONSTANT(F_DWORD, DUPLICATE_CLOSE_SOURCE);
    WINAPI_CONSTANT(F_DWORD, ERROR_ACCESS_DENIED);
    WINAPI_CONSTANT(F_DWORD, ERROR_ALREADY_EXISTS);
    WINAPI_CONSTANT(F_DWORD, ERROR_BROKEN_PIPE);
    WINAPI_CONSTANT(F_DWORD, ERROR_IO_PENDING);
    WINAPI_CONSTANT(F_DWORD, ERROR_MORE_DATA);
    WINAPI_CONSTANT(F_DWORD, ERROR_NETNAME_DELETED);
    WINAPI_CONSTANT(F_DWORD, ERROR_NO_SYSTEM_RESOURCES);
    WINAPI_CONSTANT(F_DWORD, ERROR_MORE_DATA);
    WINAPI_CONSTANT(F_DWORD, ERROR_NETNAME_DELETED);
    WINAPI_CONSTANT(F_DWORD, ERROR_NO_DATA);
    WINAPI_CONSTANT(F_DWORD, ERROR_NO_SYSTEM_RESOURCES);
    WINAPI_CONSTANT(F_DWORD, ERROR_OPERATION_ABORTED);
    WINAPI_CONSTANT(F_DWORD, ERROR_PIPE_BUSY);
    WINAPI_CONSTANT(F_DWORD, ERROR_PIPE_CONNECTED);
    WINAPI_CONSTANT(F_DWORD, ERROR_PRIVILEGE_NOT_HELD);
    WINAPI_CONSTANT(F_DWORD, ERROR_SEM_TIMEOUT);
    WINAPI_CONSTANT(F_DWORD, FILE_FLAG_FIRST_PIPE_INSTANCE);
    WINAPI_CONSTANT(F_DWORD, FILE_FLAG_OVERLAPPED);
    WINAPI_CONSTANT(F_DWORD, FILE_GENERIC_READ);
    WINAPI_CONSTANT(F_DWORD, FILE_GENERIC_WRITE);
    WINAPI_CONSTANT(F_DWORD, FILE_MAP_ALL_ACCESS);
    WINAPI_CONSTANT(F_DWORD, FILE_MAP_COPY);
    WINAPI_CONSTANT(F_DWORD, FILE_MAP_EXECUTE);
    WINAPI_CONSTANT(F_DWORD, FILE_MAP_READ);
    WINAPI_CONSTANT(F_DWORD, FILE_MAP_WRITE);
    WINAPI_CONSTANT(F_DWORD, GENERIC_READ);
    WINAPI_CONSTANT(F_DWORD, GENERIC_WRITE);
    WINAPI_CONSTANT(F_DWORD, INFINITE);
    WINAPI_CONSTANT(F_HANDLE, INVALID_HANDLE_VALUE);
    WINAPI_CONSTANT(F_DWORD, MEM_COMMIT);
    WINAPI_CONSTANT(F_DWORD, MEM_FREE);
    WINAPI_CONSTANT(F_DWORD, MEM_IMAGE);
    WINAPI_CONSTANT(F_DWORD, MEM_MAPPED);
    WINAPI_CONSTANT(F_DWORD, MEM_PRIVATE);
    WINAPI_CONSTANT(F_DWORD, MEM_RESERVE);
    WINAPI_CONSTANT(F_DWORD, NMPWAIT_WAIT_FOREVER);
    WINAPI_CONSTANT(F_DWORD, OPEN_EXISTING);
    WINAPI_CONSTANT(F_DWORD, PAGE_EXECUTE);
    WINAPI_CONSTANT(F_DWORD, PAGE_EXECUTE_READ);
    WINAPI_CONSTANT(F_DWORD, PAGE_EXECUTE_READWRITE);
    WINAPI_CONSTANT(F_DWORD, PAGE_EXECUTE_WRITECOPY);
    WINAPI_CONSTANT(F_DWORD, PAGE_GUARD);
    WINAPI_CONSTANT(F_DWORD, PAGE_NOACCESS);
    WINAPI_CONSTANT(F_DWORD, PAGE_NOCACHE);
    WINAPI_CONSTANT(F_DWORD, PAGE_READONLY);
    WINAPI_CONSTANT(F_DWORD, PAGE_READWRITE);
    WINAPI_CONSTANT(F_DWORD, PAGE_WRITECOMBINE);
    WINAPI_CONSTANT(F_DWORD, PAGE_WRITECOPY);
    WINAPI_CONSTANT(F_DWORD, PIPE_ACCESS_DUPLEX);
    WINAPI_CONSTANT(F_DWORD, PIPE_ACCESS_INBOUND);
    WINAPI_CONSTANT(F_DWORD, PIPE_READMODE_MESSAGE);
    WINAPI_CONSTANT(F_DWORD, PIPE_TYPE_MESSAGE);
    WINAPI_CONSTANT(F_DWORD, PIPE_UNLIMITED_INSTANCES);
    WINAPI_CONSTANT(F_DWORD, PIPE_WAIT);
    WINAPI_CONSTANT(F_DWORD, PROCESS_ALL_ACCESS);
    WINAPI_CONSTANT(F_DWORD, SYNCHRONIZE);
    WINAPI_CONSTANT(F_DWORD, PROCESS_DUP_HANDLE);
    WINAPI_CONSTANT(F_DWORD, SEC_COMMIT);
    WINAPI_CONSTANT(F_DWORD, SEC_IMAGE);
    WINAPI_CONSTANT(F_DWORD, SEC_LARGE_PAGES);
    WINAPI_CONSTANT(F_DWORD, SEC_NOCACHE);
    WINAPI_CONSTANT(F_DWORD, SEC_RESERVE);
    WINAPI_CONSTANT(F_DWORD, SEC_WRITECOMBINE);
    WINAPI_CONSTANT(F_DWORD, STARTF_USESHOWWINDOW);
    WINAPI_CONSTANT(F_DWORD, STARTF_USESIZE);
    WINAPI_CONSTANT(F_DWORD, STARTF_USEPOSITION);
    WINAPI_CONSTANT(F_DWORD, STARTF_USECOUNTCHARS);
    WINAPI_CONSTANT(F_DWORD, STARTF_USEFILLATTRIBUTE);
    WINAPI_CONSTANT(F_DWORD, STARTF_RUNFULLSCREEN);
    WINAPI_CONSTANT(F_DWORD, STARTF_FORCEONFEEDBACK);
    WINAPI_CONSTANT(F_DWORD, STARTF_FORCEOFFFEEDBACK);
    WINAPI_CONSTANT(F_DWORD, STARTF_USESTDHANDLES);
    WINAPI_CONSTANT(F_DWORD, STARTF_USEHOTKEY);
    WINAPI_CONSTANT(F_DWORD, STARTF_TITLEISLINKNAME);
    WINAPI_CONSTANT(F_DWORD, STARTF_TITLEISAPPID);
    WINAPI_CONSTANT(F_DWORD, STARTF_PREVENTPINNING);
    WINAPI_CONSTANT(F_DWORD, STARTF_UNTRUSTEDSOURCE);
    WINAPI_CONSTANT(F_DWORD, STD_INPUT_HANDLE);
    WINAPI_CONSTANT(F_DWORD, STD_OUTPUT_HANDLE);
    WINAPI_CONSTANT(F_DWORD, STD_ERROR_HANDLE);
    WINAPI_CONSTANT(F_DWORD, STILL_ACTIVE);
    WINAPI_CONSTANT(F_DWORD, SW_HIDE);
    WINAPI_CONSTANT(F_DWORD, WAIT_OBJECT_0);
    WINAPI_CONSTANT(F_DWORD, WAIT_ABANDONED_0);
    WINAPI_CONSTANT(F_DWORD, WAIT_TIMEOUT);

    WINAPI_CONSTANT(F_DWORD, ABOVE_NORMAL_PRIORITY_CLASS);
    WINAPI_CONSTANT(F_DWORD, BELOW_NORMAL_PRIORITY_CLASS);
    WINAPI_CONSTANT(F_DWORD, HIGH_PRIORITY_CLASS);
    WINAPI_CONSTANT(F_DWORD, IDLE_PRIORITY_CLASS);
    WINAPI_CONSTANT(F_DWORD, NORMAL_PRIORITY_CLASS);
    WINAPI_CONSTANT(F_DWORD, REALTIME_PRIORITY_CLASS);

    WINAPI_CONSTANT(F_DWORD, CREATE_NO_WINDOW);
    WINAPI_CONSTANT(F_DWORD, DETACHED_PROCESS);
    WINAPI_CONSTANT(F_DWORD, CREATE_DEFAULT_ERROR_MODE);
    WINAPI_CONSTANT(F_DWORD, CREATE_BREAKAWAY_FROM_JOB);

    WINAPI_CONSTANT(F_DWORD, FILE_TYPE_UNKNOWN);
    WINAPI_CONSTANT(F_DWORD, FILE_TYPE_DISK);
    WINAPI_CONSTANT(F_DWORD, FILE_TYPE_CHAR);
    WINAPI_CONSTANT(F_DWORD, FILE_TYPE_PIPE);
    WINAPI_CONSTANT(F_DWORD, FILE_TYPE_REMOTE);

    WINAPI_CONSTANT("u", LOCALE_NAME_INVARIANT);
    WINAPI_CONSTANT(F_DWORD, LOCALE_NAME_MAX_LENGTH);
    WINAPI_CONSTANT("u", LOCALE_NAME_SYSTEM_DEFAULT);
    WINAPI_CONSTANT("u", LOCALE_NAME_USER_DEFAULT);

    WINAPI_CONSTANT(F_DWORD, LCMAP_FULLWIDTH);
    WINAPI_CONSTANT(F_DWORD, LCMAP_HALFWIDTH);
    WINAPI_CONSTANT(F_DWORD, LCMAP_HIRAGANA);
    WINAPI_CONSTANT(F_DWORD, LCMAP_KATAKANA);
    WINAPI_CONSTANT(F_DWORD, LCMAP_LINGUISTIC_CASING);
    WINAPI_CONSTANT(F_DWORD, LCMAP_LOWERCASE);
    WINAPI_CONSTANT(F_DWORD, LCMAP_SIMPLIFIED_CHINESE);
    WINAPI_CONSTANT(F_DWORD, LCMAP_TITLECASE);
    WINAPI_CONSTANT(F_DWORD, LCMAP_TRADITIONAL_CHINESE);
    WINAPI_CONSTANT(F_DWORD, LCMAP_UPPERCASE);

    WINAPI_CONSTANT(F_DWORD, COPY_FILE_ALLOW_DECRYPTED_DESTINATION);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_COPY_SYMLINK);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_FAIL_IF_EXISTS);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_NO_BUFFERING);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_NO_OFFLOAD);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_OPEN_SOURCE_FOR_WRITE);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_RESTARTABLE);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_REQUEST_SECURITY_PRIVILEGES);
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_RESUME_FROM_PAUSE);
#ifndef COPY_FILE_REQUEST_COMPRESSED_TRAFFIC
    // Only defined in newer WinSDKs
    #define COPY_FILE_REQUEST_COMPRESSED_TRAFFIC 0x10000000
#endif
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_REQUEST_COMPRESSED_TRAFFIC);
#ifndef COPY_FILE_DIRECTORY
    // Only defined in newer WinSDKs
    #define COPY_FILE_DIRECTORY 0x00000080
#endif
    WINAPI_CONSTANT(F_DWORD, COPY_FILE_DIRECTORY);

    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_CHUNK_STARTED);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_CHUNK_FINISHED);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_STREAM_STARTED);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_STREAM_FINISHED);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_POLL_CONTINUE);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_CALLBACK_ERROR);

    WINAPI_CONSTANT(F_DWORD, COPYFILE2_PROGRESS_CONTINUE);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_PROGRESS_CANCEL);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_PROGRESS_STOP);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_PROGRESS_QUIET);
    WINAPI_CONSTANT(F_DWORD, COPYFILE2_PROGRESS_PAUSE);

    WINAPI_CONSTANT("i", NULL);

    return 0;
}

static PyModuleDef_Slot winapi_slots[] = {
    {Ty_mod_exec, winapi_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
winapi_traverse(TyObject *module, visitproc visit, void *arg)
{
    WinApiState *st = winapi_get_state(module);
    Ty_VISIT(st->overlapped_type);
    return 0;
}

static int
winapi_clear(TyObject *module)
{
    WinApiState *st = winapi_get_state(module);
    Ty_CLEAR(st->overlapped_type);
    return 0;
}

static void
winapi_free(void *module)
{
    (void)winapi_clear((TyObject *)module);
}

static struct TyModuleDef winapi_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_winapi",
    .m_size = sizeof(WinApiState),
    .m_methods = winapi_functions,
    .m_slots = winapi_slots,
    .m_traverse = winapi_traverse,
    .m_clear = winapi_clear,
    .m_free = winapi_free,
};

PyMODINIT_FUNC
PyInit__winapi(void)
{
    return PyModuleDef_Init(&winapi_module);
}
