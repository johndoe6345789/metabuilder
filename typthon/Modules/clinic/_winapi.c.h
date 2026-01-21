/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_long.h"          // _TyLong_Size_t_Converter()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_winapi_Overlapped_GetOverlappedResult__doc__,
"GetOverlappedResult($self, wait, /)\n"
"--\n"
"\n");

#define _WINAPI_OVERLAPPED_GETOVERLAPPEDRESULT_METHODDEF    \
    {"GetOverlappedResult", (PyCFunction)_winapi_Overlapped_GetOverlappedResult, METH_O, _winapi_Overlapped_GetOverlappedResult__doc__},

static TyObject *
_winapi_Overlapped_GetOverlappedResult_impl(OverlappedObject *self, int wait);

static TyObject *
_winapi_Overlapped_GetOverlappedResult(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int wait;

    wait = PyObject_IsTrue(arg);
    if (wait < 0) {
        goto exit;
    }
    return_value = _winapi_Overlapped_GetOverlappedResult_impl((OverlappedObject *)self, wait);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_Overlapped_getbuffer__doc__,
"getbuffer($self, /)\n"
"--\n"
"\n");

#define _WINAPI_OVERLAPPED_GETBUFFER_METHODDEF    \
    {"getbuffer", (PyCFunction)_winapi_Overlapped_getbuffer, METH_NOARGS, _winapi_Overlapped_getbuffer__doc__},

static TyObject *
_winapi_Overlapped_getbuffer_impl(OverlappedObject *self);

static TyObject *
_winapi_Overlapped_getbuffer(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _winapi_Overlapped_getbuffer_impl((OverlappedObject *)self);
}

TyDoc_STRVAR(_winapi_Overlapped_cancel__doc__,
"cancel($self, /)\n"
"--\n"
"\n");

#define _WINAPI_OVERLAPPED_CANCEL_METHODDEF    \
    {"cancel", (PyCFunction)_winapi_Overlapped_cancel, METH_NOARGS, _winapi_Overlapped_cancel__doc__},

static TyObject *
_winapi_Overlapped_cancel_impl(OverlappedObject *self);

static TyObject *
_winapi_Overlapped_cancel(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _winapi_Overlapped_cancel_impl((OverlappedObject *)self);
}

TyDoc_STRVAR(_winapi_CloseHandle__doc__,
"CloseHandle($module, handle, /)\n"
"--\n"
"\n"
"Close handle.");

#define _WINAPI_CLOSEHANDLE_METHODDEF    \
    {"CloseHandle", (PyCFunction)_winapi_CloseHandle, METH_O, _winapi_CloseHandle__doc__},

static TyObject *
_winapi_CloseHandle_impl(TyObject *module, HANDLE handle);

static TyObject *
_winapi_CloseHandle(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE handle;

    if (!TyArg_Parse(arg, "" F_HANDLE ":CloseHandle", &handle)) {
        goto exit;
    }
    return_value = _winapi_CloseHandle_impl(module, handle);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_ConnectNamedPipe__doc__,
"ConnectNamedPipe($module, /, handle, overlapped=False)\n"
"--\n"
"\n");

#define _WINAPI_CONNECTNAMEDPIPE_METHODDEF    \
    {"ConnectNamedPipe", _PyCFunction_CAST(_winapi_ConnectNamedPipe), METH_FASTCALL|METH_KEYWORDS, _winapi_ConnectNamedPipe__doc__},

static TyObject *
_winapi_ConnectNamedPipe_impl(TyObject *module, HANDLE handle,
                              int use_overlapped);

static TyObject *
_winapi_ConnectNamedPipe(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(handle), &_Ty_ID(overlapped), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"handle", "overlapped", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_HANDLE "|p:ConnectNamedPipe",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE handle;
    int use_overlapped = 0;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &handle, &use_overlapped)) {
        goto exit;
    }
    return_value = _winapi_ConnectNamedPipe_impl(module, handle, use_overlapped);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_CreateEventW__doc__,
"CreateEventW($module, /, security_attributes, manual_reset,\n"
"             initial_state, name)\n"
"--\n"
"\n");

#define _WINAPI_CREATEEVENTW_METHODDEF    \
    {"CreateEventW", _PyCFunction_CAST(_winapi_CreateEventW), METH_FASTCALL|METH_KEYWORDS, _winapi_CreateEventW__doc__},

static HANDLE
_winapi_CreateEventW_impl(TyObject *module,
                          LPSECURITY_ATTRIBUTES security_attributes,
                          BOOL manual_reset, BOOL initial_state,
                          LPCWSTR name);

static TyObject *
_winapi_CreateEventW(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(security_attributes), &_Ty_ID(manual_reset), &_Ty_ID(initial_state), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"security_attributes", "manual_reset", "initial_state", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_POINTER "iiO&:CreateEventW",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    LPSECURITY_ATTRIBUTES security_attributes;
    BOOL manual_reset;
    BOOL initial_state;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &security_attributes, &manual_reset, &initial_state, _TyUnicode_WideCharString_Opt_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_CreateEventW_impl(module, security_attributes, manual_reset, initial_state, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreateFile__doc__,
"CreateFile($module, file_name, desired_access, share_mode,\n"
"           security_attributes, creation_disposition,\n"
"           flags_and_attributes, template_file, /)\n"
"--\n"
"\n");

#define _WINAPI_CREATEFILE_METHODDEF    \
    {"CreateFile", _PyCFunction_CAST(_winapi_CreateFile), METH_FASTCALL, _winapi_CreateFile__doc__},

static HANDLE
_winapi_CreateFile_impl(TyObject *module, LPCWSTR file_name,
                        DWORD desired_access, DWORD share_mode,
                        LPSECURITY_ATTRIBUTES security_attributes,
                        DWORD creation_disposition,
                        DWORD flags_and_attributes, HANDLE template_file);

static TyObject *
_winapi_CreateFile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    LPCWSTR file_name = NULL;
    DWORD desired_access;
    DWORD share_mode;
    LPSECURITY_ATTRIBUTES security_attributes;
    DWORD creation_disposition;
    DWORD flags_and_attributes;
    HANDLE template_file;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "O&kk" F_POINTER "kk" F_HANDLE ":CreateFile",
        _TyUnicode_WideCharString_Converter, &file_name, &desired_access, &share_mode, &security_attributes, &creation_disposition, &flags_and_attributes, &template_file)) {
        goto exit;
    }
    _return_value = _winapi_CreateFile_impl(module, file_name, desired_access, share_mode, security_attributes, creation_disposition, flags_and_attributes, template_file);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for file_name */
    TyMem_Free((void *)file_name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreateFileMapping__doc__,
"CreateFileMapping($module, file_handle, security_attributes, protect,\n"
"                  max_size_high, max_size_low, name, /)\n"
"--\n"
"\n");

#define _WINAPI_CREATEFILEMAPPING_METHODDEF    \
    {"CreateFileMapping", _PyCFunction_CAST(_winapi_CreateFileMapping), METH_FASTCALL, _winapi_CreateFileMapping__doc__},

static HANDLE
_winapi_CreateFileMapping_impl(TyObject *module, HANDLE file_handle,
                               LPSECURITY_ATTRIBUTES security_attributes,
                               DWORD protect, DWORD max_size_high,
                               DWORD max_size_low, LPCWSTR name);

static TyObject *
_winapi_CreateFileMapping(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE file_handle;
    LPSECURITY_ATTRIBUTES security_attributes;
    DWORD protect;
    DWORD max_size_high;
    DWORD max_size_low;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "" F_POINTER "kkkO&:CreateFileMapping",
        &file_handle, &security_attributes, &protect, &max_size_high, &max_size_low, _TyUnicode_WideCharString_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_CreateFileMapping_impl(module, file_handle, security_attributes, protect, max_size_high, max_size_low, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreateJunction__doc__,
"CreateJunction($module, src_path, dst_path, /)\n"
"--\n"
"\n");

#define _WINAPI_CREATEJUNCTION_METHODDEF    \
    {"CreateJunction", _PyCFunction_CAST(_winapi_CreateJunction), METH_FASTCALL, _winapi_CreateJunction__doc__},

static TyObject *
_winapi_CreateJunction_impl(TyObject *module, LPCWSTR src_path,
                            LPCWSTR dst_path);

static TyObject *
_winapi_CreateJunction(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    LPCWSTR src_path = NULL;
    LPCWSTR dst_path = NULL;

    if (!_TyArg_CheckPositional("CreateJunction", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("CreateJunction", "argument 1", "str", args[0]);
        goto exit;
    }
    src_path = TyUnicode_AsWideCharString(args[0], NULL);
    if (src_path == NULL) {
        goto exit;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("CreateJunction", "argument 2", "str", args[1]);
        goto exit;
    }
    dst_path = TyUnicode_AsWideCharString(args[1], NULL);
    if (dst_path == NULL) {
        goto exit;
    }
    return_value = _winapi_CreateJunction_impl(module, src_path, dst_path);

exit:
    /* Cleanup for src_path */
    TyMem_Free((void *)src_path);
    /* Cleanup for dst_path */
    TyMem_Free((void *)dst_path);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreateMutexW__doc__,
"CreateMutexW($module, /, security_attributes, initial_owner, name)\n"
"--\n"
"\n");

#define _WINAPI_CREATEMUTEXW_METHODDEF    \
    {"CreateMutexW", _PyCFunction_CAST(_winapi_CreateMutexW), METH_FASTCALL|METH_KEYWORDS, _winapi_CreateMutexW__doc__},

static HANDLE
_winapi_CreateMutexW_impl(TyObject *module,
                          LPSECURITY_ATTRIBUTES security_attributes,
                          BOOL initial_owner, LPCWSTR name);

static TyObject *
_winapi_CreateMutexW(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(security_attributes), &_Ty_ID(initial_owner), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"security_attributes", "initial_owner", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_POINTER "iO&:CreateMutexW",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    LPSECURITY_ATTRIBUTES security_attributes;
    BOOL initial_owner;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &security_attributes, &initial_owner, _TyUnicode_WideCharString_Opt_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_CreateMutexW_impl(module, security_attributes, initial_owner, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreateNamedPipe__doc__,
"CreateNamedPipe($module, name, open_mode, pipe_mode, max_instances,\n"
"                out_buffer_size, in_buffer_size, default_timeout,\n"
"                security_attributes, /)\n"
"--\n"
"\n");

#define _WINAPI_CREATENAMEDPIPE_METHODDEF    \
    {"CreateNamedPipe", _PyCFunction_CAST(_winapi_CreateNamedPipe), METH_FASTCALL, _winapi_CreateNamedPipe__doc__},

static HANDLE
_winapi_CreateNamedPipe_impl(TyObject *module, LPCWSTR name, DWORD open_mode,
                             DWORD pipe_mode, DWORD max_instances,
                             DWORD out_buffer_size, DWORD in_buffer_size,
                             DWORD default_timeout,
                             LPSECURITY_ATTRIBUTES security_attributes);

static TyObject *
_winapi_CreateNamedPipe(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    LPCWSTR name = NULL;
    DWORD open_mode;
    DWORD pipe_mode;
    DWORD max_instances;
    DWORD out_buffer_size;
    DWORD in_buffer_size;
    DWORD default_timeout;
    LPSECURITY_ATTRIBUTES security_attributes;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "O&kkkkkk" F_POINTER ":CreateNamedPipe",
        _TyUnicode_WideCharString_Converter, &name, &open_mode, &pipe_mode, &max_instances, &out_buffer_size, &in_buffer_size, &default_timeout, &security_attributes)) {
        goto exit;
    }
    _return_value = _winapi_CreateNamedPipe_impl(module, name, open_mode, pipe_mode, max_instances, out_buffer_size, in_buffer_size, default_timeout, security_attributes);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CreatePipe__doc__,
"CreatePipe($module, pipe_attrs, size, /)\n"
"--\n"
"\n"
"Create an anonymous pipe.\n"
"\n"
"  pipe_attrs\n"
"    Ignored internally, can be None.\n"
"\n"
"Returns a 2-tuple of handles, to the read and write ends of the pipe.");

#define _WINAPI_CREATEPIPE_METHODDEF    \
    {"CreatePipe", _PyCFunction_CAST(_winapi_CreatePipe), METH_FASTCALL, _winapi_CreatePipe__doc__},

static TyObject *
_winapi_CreatePipe_impl(TyObject *module, TyObject *pipe_attrs, DWORD size);

static TyObject *
_winapi_CreatePipe(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *pipe_attrs;
    DWORD size;

    if (!_TyArg_ParseStack(args, nargs, "Ok:CreatePipe",
        &pipe_attrs, &size)) {
        goto exit;
    }
    return_value = _winapi_CreatePipe_impl(module, pipe_attrs, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_CreateProcess__doc__,
"CreateProcess($module, application_name, command_line, proc_attrs,\n"
"              thread_attrs, inherit_handles, creation_flags,\n"
"              env_mapping, current_directory, startup_info, /)\n"
"--\n"
"\n"
"Create a new process and its primary thread.\n"
"\n"
"  command_line\n"
"    Can be str or None\n"
"  proc_attrs\n"
"    Ignored internally, can be None.\n"
"  thread_attrs\n"
"    Ignored internally, can be None.\n"
"\n"
"The return value is a tuple of the process handle, thread handle,\n"
"process ID, and thread ID.");

#define _WINAPI_CREATEPROCESS_METHODDEF    \
    {"CreateProcess", _PyCFunction_CAST(_winapi_CreateProcess), METH_FASTCALL, _winapi_CreateProcess__doc__},

static TyObject *
_winapi_CreateProcess_impl(TyObject *module, const wchar_t *application_name,
                           TyObject *command_line, TyObject *proc_attrs,
                           TyObject *thread_attrs, BOOL inherit_handles,
                           DWORD creation_flags, TyObject *env_mapping,
                           const wchar_t *current_directory,
                           TyObject *startup_info);

static TyObject *
_winapi_CreateProcess(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const wchar_t *application_name = NULL;
    TyObject *command_line;
    TyObject *proc_attrs;
    TyObject *thread_attrs;
    BOOL inherit_handles;
    DWORD creation_flags;
    TyObject *env_mapping;
    const wchar_t *current_directory = NULL;
    TyObject *startup_info;

    if (!_TyArg_ParseStack(args, nargs, "O&OOOikOO&O:CreateProcess",
        _TyUnicode_WideCharString_Opt_Converter, &application_name, &command_line, &proc_attrs, &thread_attrs, &inherit_handles, &creation_flags, &env_mapping, _TyUnicode_WideCharString_Opt_Converter, &current_directory, &startup_info)) {
        goto exit;
    }
    return_value = _winapi_CreateProcess_impl(module, application_name, command_line, proc_attrs, thread_attrs, inherit_handles, creation_flags, env_mapping, current_directory, startup_info);

exit:
    /* Cleanup for application_name */
    TyMem_Free((void *)application_name);
    /* Cleanup for current_directory */
    TyMem_Free((void *)current_directory);

    return return_value;
}

TyDoc_STRVAR(_winapi_DuplicateHandle__doc__,
"DuplicateHandle($module, source_process_handle, source_handle,\n"
"                target_process_handle, desired_access, inherit_handle,\n"
"                options=0, /)\n"
"--\n"
"\n"
"Return a duplicate handle object.\n"
"\n"
"The duplicate handle refers to the same object as the original\n"
"handle. Therefore, any changes to the object are reflected\n"
"through both handles.");

#define _WINAPI_DUPLICATEHANDLE_METHODDEF    \
    {"DuplicateHandle", _PyCFunction_CAST(_winapi_DuplicateHandle), METH_FASTCALL, _winapi_DuplicateHandle__doc__},

static HANDLE
_winapi_DuplicateHandle_impl(TyObject *module, HANDLE source_process_handle,
                             HANDLE source_handle,
                             HANDLE target_process_handle,
                             DWORD desired_access, BOOL inherit_handle,
                             DWORD options);

static TyObject *
_winapi_DuplicateHandle(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE source_process_handle;
    HANDLE source_handle;
    HANDLE target_process_handle;
    DWORD desired_access;
    BOOL inherit_handle;
    DWORD options = 0;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "" F_HANDLE "" F_HANDLE "ki|k:DuplicateHandle",
        &source_process_handle, &source_handle, &target_process_handle, &desired_access, &inherit_handle, &options)) {
        goto exit;
    }
    _return_value = _winapi_DuplicateHandle_impl(module, source_process_handle, source_handle, target_process_handle, desired_access, inherit_handle, options);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_ExitProcess__doc__,
"ExitProcess($module, ExitCode, /)\n"
"--\n"
"\n");

#define _WINAPI_EXITPROCESS_METHODDEF    \
    {"ExitProcess", (PyCFunction)_winapi_ExitProcess, METH_O, _winapi_ExitProcess__doc__},

static TyObject *
_winapi_ExitProcess_impl(TyObject *module, UINT ExitCode);

static TyObject *
_winapi_ExitProcess(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    UINT ExitCode;

    if (!TyArg_Parse(arg, "I:ExitProcess", &ExitCode)) {
        goto exit;
    }
    return_value = _winapi_ExitProcess_impl(module, ExitCode);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetCurrentProcess__doc__,
"GetCurrentProcess($module, /)\n"
"--\n"
"\n"
"Return a handle object for the current process.");

#define _WINAPI_GETCURRENTPROCESS_METHODDEF    \
    {"GetCurrentProcess", (PyCFunction)_winapi_GetCurrentProcess, METH_NOARGS, _winapi_GetCurrentProcess__doc__},

static HANDLE
_winapi_GetCurrentProcess_impl(TyObject *module);

static TyObject *
_winapi_GetCurrentProcess(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    HANDLE _return_value;

    _return_value = _winapi_GetCurrentProcess_impl(module);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetExitCodeProcess__doc__,
"GetExitCodeProcess($module, process, /)\n"
"--\n"
"\n"
"Return the termination status of the specified process.");

#define _WINAPI_GETEXITCODEPROCESS_METHODDEF    \
    {"GetExitCodeProcess", (PyCFunction)_winapi_GetExitCodeProcess, METH_O, _winapi_GetExitCodeProcess__doc__},

static DWORD
_winapi_GetExitCodeProcess_impl(TyObject *module, HANDLE process);

static TyObject *
_winapi_GetExitCodeProcess(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HANDLE process;
    DWORD _return_value;

    if (!TyArg_Parse(arg, "" F_HANDLE ":GetExitCodeProcess", &process)) {
        goto exit;
    }
    _return_value = _winapi_GetExitCodeProcess_impl(module, process);
    if ((_return_value == PY_DWORD_MAX) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromUnsignedLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetLastError__doc__,
"GetLastError($module, /)\n"
"--\n"
"\n");

#define _WINAPI_GETLASTERROR_METHODDEF    \
    {"GetLastError", (PyCFunction)_winapi_GetLastError, METH_NOARGS, _winapi_GetLastError__doc__},

static DWORD
_winapi_GetLastError_impl(TyObject *module);

static TyObject *
_winapi_GetLastError(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    DWORD _return_value;

    _return_value = _winapi_GetLastError_impl(module);
    if ((_return_value == PY_DWORD_MAX) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromUnsignedLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetLongPathName__doc__,
"GetLongPathName($module, /, path)\n"
"--\n"
"\n"
"Return the long version of the provided path.\n"
"\n"
"If the path is already in its long form, returns the same value.\n"
"\n"
"The path must already be a \'str\'. If the type is not known, use\n"
"os.fsdecode before calling this function.");

#define _WINAPI_GETLONGPATHNAME_METHODDEF    \
    {"GetLongPathName", _PyCFunction_CAST(_winapi_GetLongPathName), METH_FASTCALL|METH_KEYWORDS, _winapi_GetLongPathName__doc__},

static TyObject *
_winapi_GetLongPathName_impl(TyObject *module, LPCWSTR path);

static TyObject *
_winapi_GetLongPathName(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "GetLongPathName",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    LPCWSTR path = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("GetLongPathName", "argument 'path'", "str", args[0]);
        goto exit;
    }
    path = TyUnicode_AsWideCharString(args[0], NULL);
    if (path == NULL) {
        goto exit;
    }
    return_value = _winapi_GetLongPathName_impl(module, path);

exit:
    /* Cleanup for path */
    TyMem_Free((void *)path);

    return return_value;
}

TyDoc_STRVAR(_winapi_GetModuleFileName__doc__,
"GetModuleFileName($module, module_handle, /)\n"
"--\n"
"\n"
"Return the fully-qualified path for the file that contains module.\n"
"\n"
"The module must have been loaded by the current process.\n"
"\n"
"The module parameter should be a handle to the loaded module\n"
"whose path is being requested. If this parameter is 0,\n"
"GetModuleFileName retrieves the path of the executable file\n"
"of the current process.");

#define _WINAPI_GETMODULEFILENAME_METHODDEF    \
    {"GetModuleFileName", (PyCFunction)_winapi_GetModuleFileName, METH_O, _winapi_GetModuleFileName__doc__},

static TyObject *
_winapi_GetModuleFileName_impl(TyObject *module, HMODULE module_handle);

static TyObject *
_winapi_GetModuleFileName(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    HMODULE module_handle;

    if (!TyArg_Parse(arg, "" F_HANDLE ":GetModuleFileName", &module_handle)) {
        goto exit;
    }
    return_value = _winapi_GetModuleFileName_impl(module, module_handle);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetShortPathName__doc__,
"GetShortPathName($module, /, path)\n"
"--\n"
"\n"
"Return the short version of the provided path.\n"
"\n"
"If the path is already in its short form, returns the same value.\n"
"\n"
"The path must already be a \'str\'. If the type is not known, use\n"
"os.fsdecode before calling this function.");

#define _WINAPI_GETSHORTPATHNAME_METHODDEF    \
    {"GetShortPathName", _PyCFunction_CAST(_winapi_GetShortPathName), METH_FASTCALL|METH_KEYWORDS, _winapi_GetShortPathName__doc__},

static TyObject *
_winapi_GetShortPathName_impl(TyObject *module, LPCWSTR path);

static TyObject *
_winapi_GetShortPathName(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "GetShortPathName",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    LPCWSTR path = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("GetShortPathName", "argument 'path'", "str", args[0]);
        goto exit;
    }
    path = TyUnicode_AsWideCharString(args[0], NULL);
    if (path == NULL) {
        goto exit;
    }
    return_value = _winapi_GetShortPathName_impl(module, path);

exit:
    /* Cleanup for path */
    TyMem_Free((void *)path);

    return return_value;
}

TyDoc_STRVAR(_winapi_GetStdHandle__doc__,
"GetStdHandle($module, std_handle, /)\n"
"--\n"
"\n"
"Return a handle to the specified standard device.\n"
"\n"
"  std_handle\n"
"    One of STD_INPUT_HANDLE, STD_OUTPUT_HANDLE, or STD_ERROR_HANDLE.\n"
"\n"
"The integer associated with the handle object is returned.");

#define _WINAPI_GETSTDHANDLE_METHODDEF    \
    {"GetStdHandle", (PyCFunction)_winapi_GetStdHandle, METH_O, _winapi_GetStdHandle__doc__},

static HANDLE
_winapi_GetStdHandle_impl(TyObject *module, DWORD std_handle);

static TyObject *
_winapi_GetStdHandle(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    DWORD std_handle;
    HANDLE _return_value;

    if (!TyArg_Parse(arg, "k:GetStdHandle", &std_handle)) {
        goto exit;
    }
    _return_value = _winapi_GetStdHandle_impl(module, std_handle);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetVersion__doc__,
"GetVersion($module, /)\n"
"--\n"
"\n"
"Return the version number of the current operating system.");

#define _WINAPI_GETVERSION_METHODDEF    \
    {"GetVersion", (PyCFunction)_winapi_GetVersion, METH_NOARGS, _winapi_GetVersion__doc__},

static long
_winapi_GetVersion_impl(TyObject *module);

static TyObject *
_winapi_GetVersion(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    long _return_value;

    _return_value = _winapi_GetVersion_impl(module);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_MapViewOfFile__doc__,
"MapViewOfFile($module, file_map, desired_access, file_offset_high,\n"
"              file_offset_low, number_bytes, /)\n"
"--\n"
"\n");

#define _WINAPI_MAPVIEWOFFILE_METHODDEF    \
    {"MapViewOfFile", _PyCFunction_CAST(_winapi_MapViewOfFile), METH_FASTCALL, _winapi_MapViewOfFile__doc__},

static LPVOID
_winapi_MapViewOfFile_impl(TyObject *module, HANDLE file_map,
                           DWORD desired_access, DWORD file_offset_high,
                           DWORD file_offset_low, size_t number_bytes);

static TyObject *
_winapi_MapViewOfFile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE file_map;
    DWORD desired_access;
    DWORD file_offset_high;
    DWORD file_offset_low;
    size_t number_bytes;
    LPVOID _return_value;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "kkkO&:MapViewOfFile",
        &file_map, &desired_access, &file_offset_high, &file_offset_low, _TyLong_Size_t_Converter, &number_bytes)) {
        goto exit;
    }
    _return_value = _winapi_MapViewOfFile_impl(module, file_map, desired_access, file_offset_high, file_offset_low, number_bytes);
    if ((_return_value == NULL) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_UnmapViewOfFile__doc__,
"UnmapViewOfFile($module, address, /)\n"
"--\n"
"\n");

#define _WINAPI_UNMAPVIEWOFFILE_METHODDEF    \
    {"UnmapViewOfFile", (PyCFunction)_winapi_UnmapViewOfFile, METH_O, _winapi_UnmapViewOfFile__doc__},

static TyObject *
_winapi_UnmapViewOfFile_impl(TyObject *module, LPCVOID address);

static TyObject *
_winapi_UnmapViewOfFile(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    LPCVOID address;

    if (!TyArg_Parse(arg, "" F_POINTER ":UnmapViewOfFile", &address)) {
        goto exit;
    }
    return_value = _winapi_UnmapViewOfFile_impl(module, address);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_OpenEventW__doc__,
"OpenEventW($module, /, desired_access, inherit_handle, name)\n"
"--\n"
"\n");

#define _WINAPI_OPENEVENTW_METHODDEF    \
    {"OpenEventW", _PyCFunction_CAST(_winapi_OpenEventW), METH_FASTCALL|METH_KEYWORDS, _winapi_OpenEventW__doc__},

static HANDLE
_winapi_OpenEventW_impl(TyObject *module, DWORD desired_access,
                        BOOL inherit_handle, LPCWSTR name);

static TyObject *
_winapi_OpenEventW(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(desired_access), &_Ty_ID(inherit_handle), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"desired_access", "inherit_handle", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "kiO&:OpenEventW",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    DWORD desired_access;
    BOOL inherit_handle;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &desired_access, &inherit_handle, _TyUnicode_WideCharString_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_OpenEventW_impl(module, desired_access, inherit_handle, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_OpenMutexW__doc__,
"OpenMutexW($module, /, desired_access, inherit_handle, name)\n"
"--\n"
"\n");

#define _WINAPI_OPENMUTEXW_METHODDEF    \
    {"OpenMutexW", _PyCFunction_CAST(_winapi_OpenMutexW), METH_FASTCALL|METH_KEYWORDS, _winapi_OpenMutexW__doc__},

static HANDLE
_winapi_OpenMutexW_impl(TyObject *module, DWORD desired_access,
                        BOOL inherit_handle, LPCWSTR name);

static TyObject *
_winapi_OpenMutexW(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(desired_access), &_Ty_ID(inherit_handle), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"desired_access", "inherit_handle", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "kiO&:OpenMutexW",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    DWORD desired_access;
    BOOL inherit_handle;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &desired_access, &inherit_handle, _TyUnicode_WideCharString_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_OpenMutexW_impl(module, desired_access, inherit_handle, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_OpenFileMapping__doc__,
"OpenFileMapping($module, desired_access, inherit_handle, name, /)\n"
"--\n"
"\n");

#define _WINAPI_OPENFILEMAPPING_METHODDEF    \
    {"OpenFileMapping", _PyCFunction_CAST(_winapi_OpenFileMapping), METH_FASTCALL, _winapi_OpenFileMapping__doc__},

static HANDLE
_winapi_OpenFileMapping_impl(TyObject *module, DWORD desired_access,
                             BOOL inherit_handle, LPCWSTR name);

static TyObject *
_winapi_OpenFileMapping(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    DWORD desired_access;
    BOOL inherit_handle;
    LPCWSTR name = NULL;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "kiO&:OpenFileMapping",
        &desired_access, &inherit_handle, _TyUnicode_WideCharString_Converter, &name)) {
        goto exit;
    }
    _return_value = _winapi_OpenFileMapping_impl(module, desired_access, inherit_handle, name);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_OpenProcess__doc__,
"OpenProcess($module, desired_access, inherit_handle, process_id, /)\n"
"--\n"
"\n");

#define _WINAPI_OPENPROCESS_METHODDEF    \
    {"OpenProcess", _PyCFunction_CAST(_winapi_OpenProcess), METH_FASTCALL, _winapi_OpenProcess__doc__},

static HANDLE
_winapi_OpenProcess_impl(TyObject *module, DWORD desired_access,
                         BOOL inherit_handle, DWORD process_id);

static TyObject *
_winapi_OpenProcess(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    DWORD desired_access;
    BOOL inherit_handle;
    DWORD process_id;
    HANDLE _return_value;

    if (!_TyArg_ParseStack(args, nargs, "kik:OpenProcess",
        &desired_access, &inherit_handle, &process_id)) {
        goto exit;
    }
    _return_value = _winapi_OpenProcess_impl(module, desired_access, inherit_handle, process_id);
    if ((_return_value == INVALID_HANDLE_VALUE) && TyErr_Occurred()) {
        goto exit;
    }
    if (_return_value == NULL) {
        Py_RETURN_NONE;
    }
    return_value = HANDLE_TO_PYNUM(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_PeekNamedPipe__doc__,
"PeekNamedPipe($module, handle, size=0, /)\n"
"--\n"
"\n");

#define _WINAPI_PEEKNAMEDPIPE_METHODDEF    \
    {"PeekNamedPipe", _PyCFunction_CAST(_winapi_PeekNamedPipe), METH_FASTCALL, _winapi_PeekNamedPipe__doc__},

static TyObject *
_winapi_PeekNamedPipe_impl(TyObject *module, HANDLE handle, int size);

static TyObject *
_winapi_PeekNamedPipe(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    int size = 0;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "|i:PeekNamedPipe",
        &handle, &size)) {
        goto exit;
    }
    return_value = _winapi_PeekNamedPipe_impl(module, handle, size);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_LCMapStringEx__doc__,
"LCMapStringEx($module, /, locale, flags, src)\n"
"--\n"
"\n");

#define _WINAPI_LCMAPSTRINGEX_METHODDEF    \
    {"LCMapStringEx", _PyCFunction_CAST(_winapi_LCMapStringEx), METH_FASTCALL|METH_KEYWORDS, _winapi_LCMapStringEx__doc__},

static TyObject *
_winapi_LCMapStringEx_impl(TyObject *module, LPCWSTR locale, DWORD flags,
                           TyObject *src);

static TyObject *
_winapi_LCMapStringEx(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(locale), &_Ty_ID(flags), &_Ty_ID(src), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"locale", "flags", "src", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "O&kU:LCMapStringEx",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    LPCWSTR locale = NULL;
    DWORD flags;
    TyObject *src;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        _TyUnicode_WideCharString_Converter, &locale, &flags, &src)) {
        goto exit;
    }
    return_value = _winapi_LCMapStringEx_impl(module, locale, flags, src);

exit:
    /* Cleanup for locale */
    TyMem_Free((void *)locale);

    return return_value;
}

TyDoc_STRVAR(_winapi_ReadFile__doc__,
"ReadFile($module, /, handle, size, overlapped=False)\n"
"--\n"
"\n");

#define _WINAPI_READFILE_METHODDEF    \
    {"ReadFile", _PyCFunction_CAST(_winapi_ReadFile), METH_FASTCALL|METH_KEYWORDS, _winapi_ReadFile__doc__},

static TyObject *
_winapi_ReadFile_impl(TyObject *module, HANDLE handle, DWORD size,
                      int use_overlapped);

static TyObject *
_winapi_ReadFile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(handle), &_Ty_ID(size), &_Ty_ID(overlapped), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"handle", "size", "overlapped", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_HANDLE "k|p:ReadFile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE handle;
    DWORD size;
    int use_overlapped = 0;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &handle, &size, &use_overlapped)) {
        goto exit;
    }
    return_value = _winapi_ReadFile_impl(module, handle, size, use_overlapped);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_ReleaseMutex__doc__,
"ReleaseMutex($module, /, mutex)\n"
"--\n"
"\n");

#define _WINAPI_RELEASEMUTEX_METHODDEF    \
    {"ReleaseMutex", _PyCFunction_CAST(_winapi_ReleaseMutex), METH_FASTCALL|METH_KEYWORDS, _winapi_ReleaseMutex__doc__},

static TyObject *
_winapi_ReleaseMutex_impl(TyObject *module, HANDLE mutex);

static TyObject *
_winapi_ReleaseMutex(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(mutex), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"mutex", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_HANDLE ":ReleaseMutex",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE mutex;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &mutex)) {
        goto exit;
    }
    return_value = _winapi_ReleaseMutex_impl(module, mutex);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_ResetEvent__doc__,
"ResetEvent($module, /, event)\n"
"--\n"
"\n");

#define _WINAPI_RESETEVENT_METHODDEF    \
    {"ResetEvent", _PyCFunction_CAST(_winapi_ResetEvent), METH_FASTCALL|METH_KEYWORDS, _winapi_ResetEvent__doc__},

static TyObject *
_winapi_ResetEvent_impl(TyObject *module, HANDLE event);

static TyObject *
_winapi_ResetEvent(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .format = "" F_HANDLE ":ResetEvent",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE event;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &event)) {
        goto exit;
    }
    return_value = _winapi_ResetEvent_impl(module, event);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_SetEvent__doc__,
"SetEvent($module, /, event)\n"
"--\n"
"\n");

#define _WINAPI_SETEVENT_METHODDEF    \
    {"SetEvent", _PyCFunction_CAST(_winapi_SetEvent), METH_FASTCALL|METH_KEYWORDS, _winapi_SetEvent__doc__},

static TyObject *
_winapi_SetEvent_impl(TyObject *module, HANDLE event);

static TyObject *
_winapi_SetEvent(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .format = "" F_HANDLE ":SetEvent",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE event;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &event)) {
        goto exit;
    }
    return_value = _winapi_SetEvent_impl(module, event);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_SetNamedPipeHandleState__doc__,
"SetNamedPipeHandleState($module, named_pipe, mode,\n"
"                        max_collection_count, collect_data_timeout, /)\n"
"--\n"
"\n");

#define _WINAPI_SETNAMEDPIPEHANDLESTATE_METHODDEF    \
    {"SetNamedPipeHandleState", _PyCFunction_CAST(_winapi_SetNamedPipeHandleState), METH_FASTCALL, _winapi_SetNamedPipeHandleState__doc__},

static TyObject *
_winapi_SetNamedPipeHandleState_impl(TyObject *module, HANDLE named_pipe,
                                     TyObject *mode,
                                     TyObject *max_collection_count,
                                     TyObject *collect_data_timeout);

static TyObject *
_winapi_SetNamedPipeHandleState(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE named_pipe;
    TyObject *mode;
    TyObject *max_collection_count;
    TyObject *collect_data_timeout;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "OOO:SetNamedPipeHandleState",
        &named_pipe, &mode, &max_collection_count, &collect_data_timeout)) {
        goto exit;
    }
    return_value = _winapi_SetNamedPipeHandleState_impl(module, named_pipe, mode, max_collection_count, collect_data_timeout);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_TerminateProcess__doc__,
"TerminateProcess($module, handle, exit_code, /)\n"
"--\n"
"\n"
"Terminate the specified process and all of its threads.");

#define _WINAPI_TERMINATEPROCESS_METHODDEF    \
    {"TerminateProcess", _PyCFunction_CAST(_winapi_TerminateProcess), METH_FASTCALL, _winapi_TerminateProcess__doc__},

static TyObject *
_winapi_TerminateProcess_impl(TyObject *module, HANDLE handle,
                              UINT exit_code);

static TyObject *
_winapi_TerminateProcess(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    UINT exit_code;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "I:TerminateProcess",
        &handle, &exit_code)) {
        goto exit;
    }
    return_value = _winapi_TerminateProcess_impl(module, handle, exit_code);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_VirtualQuerySize__doc__,
"VirtualQuerySize($module, address, /)\n"
"--\n"
"\n");

#define _WINAPI_VIRTUALQUERYSIZE_METHODDEF    \
    {"VirtualQuerySize", (PyCFunction)_winapi_VirtualQuerySize, METH_O, _winapi_VirtualQuerySize__doc__},

static size_t
_winapi_VirtualQuerySize_impl(TyObject *module, LPCVOID address);

static TyObject *
_winapi_VirtualQuerySize(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    LPCVOID address;
    size_t _return_value;

    if (!TyArg_Parse(arg, "" F_POINTER ":VirtualQuerySize", &address)) {
        goto exit;
    }
    _return_value = _winapi_VirtualQuerySize_impl(module, address);
    if ((_return_value == (size_t)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_WaitNamedPipe__doc__,
"WaitNamedPipe($module, name, timeout, /)\n"
"--\n"
"\n");

#define _WINAPI_WAITNAMEDPIPE_METHODDEF    \
    {"WaitNamedPipe", _PyCFunction_CAST(_winapi_WaitNamedPipe), METH_FASTCALL, _winapi_WaitNamedPipe__doc__},

static TyObject *
_winapi_WaitNamedPipe_impl(TyObject *module, LPCWSTR name, DWORD timeout);

static TyObject *
_winapi_WaitNamedPipe(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    LPCWSTR name = NULL;
    DWORD timeout;

    if (!_TyArg_ParseStack(args, nargs, "O&k:WaitNamedPipe",
        _TyUnicode_WideCharString_Converter, &name, &timeout)) {
        goto exit;
    }
    return_value = _winapi_WaitNamedPipe_impl(module, name, timeout);

exit:
    /* Cleanup for name */
    TyMem_Free((void *)name);

    return return_value;
}

TyDoc_STRVAR(_winapi_BatchedWaitForMultipleObjects__doc__,
"BatchedWaitForMultipleObjects($module, /, handle_seq, wait_all,\n"
"                              milliseconds=_winapi.INFINITE)\n"
"--\n"
"\n"
"Supports a larger number of handles than WaitForMultipleObjects\n"
"\n"
"Note that the handles may be waited on other threads, which could cause\n"
"issues for objects like mutexes that become associated with the thread\n"
"that was waiting for them. Objects may also be left signalled, even if\n"
"the wait fails.\n"
"\n"
"It is recommended to use WaitForMultipleObjects whenever possible, and\n"
"only switch to BatchedWaitForMultipleObjects for scenarios where you\n"
"control all the handles involved, such as your own thread pool or\n"
"files, and all wait objects are left unmodified by a wait (for example,\n"
"manual reset events, threads, and files/pipes).\n"
"\n"
"Overlapped handles returned from this module use manual reset events.");

#define _WINAPI_BATCHEDWAITFORMULTIPLEOBJECTS_METHODDEF    \
    {"BatchedWaitForMultipleObjects", _PyCFunction_CAST(_winapi_BatchedWaitForMultipleObjects), METH_FASTCALL|METH_KEYWORDS, _winapi_BatchedWaitForMultipleObjects__doc__},

static TyObject *
_winapi_BatchedWaitForMultipleObjects_impl(TyObject *module,
                                           TyObject *handle_seq,
                                           BOOL wait_all, DWORD milliseconds);

static TyObject *
_winapi_BatchedWaitForMultipleObjects(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(handle_seq), &_Ty_ID(wait_all), &_Ty_ID(milliseconds), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"handle_seq", "wait_all", "milliseconds", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "Oi|k:BatchedWaitForMultipleObjects",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *handle_seq;
    BOOL wait_all;
    DWORD milliseconds = INFINITE;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &handle_seq, &wait_all, &milliseconds)) {
        goto exit;
    }
    return_value = _winapi_BatchedWaitForMultipleObjects_impl(module, handle_seq, wait_all, milliseconds);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_WaitForMultipleObjects__doc__,
"WaitForMultipleObjects($module, handle_seq, wait_flag,\n"
"                       milliseconds=_winapi.INFINITE, /)\n"
"--\n"
"\n");

#define _WINAPI_WAITFORMULTIPLEOBJECTS_METHODDEF    \
    {"WaitForMultipleObjects", _PyCFunction_CAST(_winapi_WaitForMultipleObjects), METH_FASTCALL, _winapi_WaitForMultipleObjects__doc__},

static TyObject *
_winapi_WaitForMultipleObjects_impl(TyObject *module, TyObject *handle_seq,
                                    BOOL wait_flag, DWORD milliseconds);

static TyObject *
_winapi_WaitForMultipleObjects(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *handle_seq;
    BOOL wait_flag;
    DWORD milliseconds = INFINITE;

    if (!_TyArg_ParseStack(args, nargs, "Oi|k:WaitForMultipleObjects",
        &handle_seq, &wait_flag, &milliseconds)) {
        goto exit;
    }
    return_value = _winapi_WaitForMultipleObjects_impl(module, handle_seq, wait_flag, milliseconds);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_WaitForSingleObject__doc__,
"WaitForSingleObject($module, handle, milliseconds, /)\n"
"--\n"
"\n"
"Wait for a single object.\n"
"\n"
"Wait until the specified object is in the signaled state or\n"
"the time-out interval elapses. The timeout value is specified\n"
"in milliseconds.");

#define _WINAPI_WAITFORSINGLEOBJECT_METHODDEF    \
    {"WaitForSingleObject", _PyCFunction_CAST(_winapi_WaitForSingleObject), METH_FASTCALL, _winapi_WaitForSingleObject__doc__},

static long
_winapi_WaitForSingleObject_impl(TyObject *module, HANDLE handle,
                                 DWORD milliseconds);

static TyObject *
_winapi_WaitForSingleObject(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    HANDLE handle;
    DWORD milliseconds;
    long _return_value;

    if (!_TyArg_ParseStack(args, nargs, "" F_HANDLE "k:WaitForSingleObject",
        &handle, &milliseconds)) {
        goto exit;
    }
    _return_value = _winapi_WaitForSingleObject_impl(module, handle, milliseconds);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_WriteFile__doc__,
"WriteFile($module, /, handle, buffer, overlapped=False)\n"
"--\n"
"\n");

#define _WINAPI_WRITEFILE_METHODDEF    \
    {"WriteFile", _PyCFunction_CAST(_winapi_WriteFile), METH_FASTCALL|METH_KEYWORDS, _winapi_WriteFile__doc__},

static TyObject *
_winapi_WriteFile_impl(TyObject *module, HANDLE handle, TyObject *buffer,
                       int use_overlapped);

static TyObject *
_winapi_WriteFile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(handle), &_Ty_ID(buffer), &_Ty_ID(overlapped), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"handle", "buffer", "overlapped", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_HANDLE "O|p:WriteFile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE handle;
    TyObject *buffer;
    int use_overlapped = 0;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &handle, &buffer, &use_overlapped)) {
        goto exit;
    }
    return_value = _winapi_WriteFile_impl(module, handle, buffer, use_overlapped);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_GetACP__doc__,
"GetACP($module, /)\n"
"--\n"
"\n"
"Get the current Windows ANSI code page identifier.");

#define _WINAPI_GETACP_METHODDEF    \
    {"GetACP", (PyCFunction)_winapi_GetACP, METH_NOARGS, _winapi_GetACP__doc__},

static TyObject *
_winapi_GetACP_impl(TyObject *module);

static TyObject *
_winapi_GetACP(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _winapi_GetACP_impl(module);
}

TyDoc_STRVAR(_winapi_GetFileType__doc__,
"GetFileType($module, /, handle)\n"
"--\n"
"\n");

#define _WINAPI_GETFILETYPE_METHODDEF    \
    {"GetFileType", _PyCFunction_CAST(_winapi_GetFileType), METH_FASTCALL|METH_KEYWORDS, _winapi_GetFileType__doc__},

static DWORD
_winapi_GetFileType_impl(TyObject *module, HANDLE handle);

static TyObject *
_winapi_GetFileType(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(handle), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"handle", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "" F_HANDLE ":GetFileType",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    HANDLE handle;
    DWORD _return_value;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        &handle)) {
        goto exit;
    }
    _return_value = _winapi_GetFileType_impl(module, handle);
    if ((_return_value == PY_DWORD_MAX) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromUnsignedLong(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi__mimetypes_read_windows_registry__doc__,
"_mimetypes_read_windows_registry($module, /, on_type_read)\n"
"--\n"
"\n"
"Optimized function for reading all known MIME types from the registry.\n"
"\n"
"*on_type_read* is a callable taking *type* and *ext* arguments, as for\n"
"MimeTypes.add_type.");

#define _WINAPI__MIMETYPES_READ_WINDOWS_REGISTRY_METHODDEF    \
    {"_mimetypes_read_windows_registry", _PyCFunction_CAST(_winapi__mimetypes_read_windows_registry), METH_FASTCALL|METH_KEYWORDS, _winapi__mimetypes_read_windows_registry__doc__},

static TyObject *
_winapi__mimetypes_read_windows_registry_impl(TyObject *module,
                                              TyObject *on_type_read);

static TyObject *
_winapi__mimetypes_read_windows_registry(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(on_type_read), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"on_type_read", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_mimetypes_read_windows_registry",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *on_type_read;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    on_type_read = args[0];
    return_value = _winapi__mimetypes_read_windows_registry_impl(module, on_type_read);

exit:
    return return_value;
}

TyDoc_STRVAR(_winapi_NeedCurrentDirectoryForExePath__doc__,
"NeedCurrentDirectoryForExePath($module, exe_name, /)\n"
"--\n"
"\n");

#define _WINAPI_NEEDCURRENTDIRECTORYFOREXEPATH_METHODDEF    \
    {"NeedCurrentDirectoryForExePath", (PyCFunction)_winapi_NeedCurrentDirectoryForExePath, METH_O, _winapi_NeedCurrentDirectoryForExePath__doc__},

static int
_winapi_NeedCurrentDirectoryForExePath_impl(TyObject *module,
                                            LPCWSTR exe_name);

static TyObject *
_winapi_NeedCurrentDirectoryForExePath(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    LPCWSTR exe_name = NULL;
    int _return_value;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("NeedCurrentDirectoryForExePath", "argument", "str", arg);
        goto exit;
    }
    exe_name = TyUnicode_AsWideCharString(arg, NULL);
    if (exe_name == NULL) {
        goto exit;
    }
    _return_value = _winapi_NeedCurrentDirectoryForExePath_impl(module, exe_name);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for exe_name */
    TyMem_Free((void *)exe_name);

    return return_value;
}

TyDoc_STRVAR(_winapi_CopyFile2__doc__,
"CopyFile2($module, /, existing_file_name, new_file_name, flags,\n"
"          progress_routine=None)\n"
"--\n"
"\n"
"Copies a file from one name to a new name.\n"
"\n"
"This is implemented using the CopyFile2 API, which preserves all stat\n"
"and metadata information apart from security attributes.\n"
"\n"
"progress_routine is reserved for future use, but is currently not\n"
"implemented. Its value is ignored.");

#define _WINAPI_COPYFILE2_METHODDEF    \
    {"CopyFile2", _PyCFunction_CAST(_winapi_CopyFile2), METH_FASTCALL|METH_KEYWORDS, _winapi_CopyFile2__doc__},

static TyObject *
_winapi_CopyFile2_impl(TyObject *module, LPCWSTR existing_file_name,
                       LPCWSTR new_file_name, DWORD flags,
                       TyObject *progress_routine);

static TyObject *
_winapi_CopyFile2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(existing_file_name), &_Ty_ID(new_file_name), &_Ty_ID(flags), &_Ty_ID(progress_routine), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"existing_file_name", "new_file_name", "flags", "progress_routine", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .format = "O&O&k|O:CopyFile2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    LPCWSTR existing_file_name = NULL;
    LPCWSTR new_file_name = NULL;
    DWORD flags;
    TyObject *progress_routine = Ty_None;

    if (!_TyArg_ParseStackAndKeywords(args, nargs, kwnames, &_parser,
        _TyUnicode_WideCharString_Converter, &existing_file_name, _TyUnicode_WideCharString_Converter, &new_file_name, &flags, &progress_routine)) {
        goto exit;
    }
    return_value = _winapi_CopyFile2_impl(module, existing_file_name, new_file_name, flags, progress_routine);

exit:
    /* Cleanup for existing_file_name */
    TyMem_Free((void *)existing_file_name);
    /* Cleanup for new_file_name */
    TyMem_Free((void *)new_file_name);

    return return_value;
}
/*[clinic end generated code: output=6cd07628af447d0a input=a9049054013a1b77]*/
