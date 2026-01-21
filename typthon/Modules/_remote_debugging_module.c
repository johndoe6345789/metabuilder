    /******************************************************************************
 * Python Remote Debugging Module
 *
 * This module provides functionality to debug Python processes remotely by
 * reading their memory and reconstructing stack traces and asyncio task states.
 ******************************************************************************/

#define _GNU_SOURCE

/* ============================================================================
 * HEADERS AND INCLUDES
 * ============================================================================ */

#include <errno.h>
#include <fcntl.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifndef Ty_BUILD_CORE_BUILTIN
#    define Ty_BUILD_CORE_MODULE 1
#endif
#include "Python.h"
#include <internal/pycore_debug_offsets.h>  // _Ty_DebugOffsets
#include <internal/pycore_frame.h>          // FRAME_SUSPENDED_YIELD_FROM
#include <internal/pycore_interpframe.h>    // FRAME_OWNED_BY_CSTACK
#include <internal/pycore_llist.h>          // struct llist_node
#include <internal/pycore_stackref.h>       // Ty_TAG_BITS
#include "../Python/remote_debug.h"

#ifndef HAVE_PROCESS_VM_READV
#    define HAVE_PROCESS_VM_READV 0
#endif

/* ============================================================================
 * TYPE DEFINITIONS AND STRUCTURES
 * ============================================================================ */

#define GET_MEMBER(type, obj, offset) (*(type*)((char*)(obj) + (offset)))
#define CLEAR_PTR_TAG(ptr) (((uintptr_t)(ptr) & ~Ty_TAG_BITS))
#define GET_MEMBER_NO_TAG(type, obj, offset) (type)(CLEAR_PTR_TAG(*(type*)((char*)(obj) + (offset))))

/* Size macros for opaque buffers */
#define SIZEOF_BYTES_OBJ sizeof(PyBytesObject)
#define SIZEOF_CODE_OBJ sizeof(PyCodeObject)
#define SIZEOF_GEN_OBJ sizeof(PyGenObject)
#define SIZEOF_INTERP_FRAME sizeof(_PyInterpreterFrame)
#define SIZEOF_LLIST_NODE sizeof(struct llist_node)
#define SIZEOF_PAGE_CACHE_ENTRY sizeof(page_cache_entry_t)
#define SIZEOF_PYOBJECT sizeof(TyObject)
#define SIZEOF_SET_OBJ sizeof(PySetObject)
#define SIZEOF_TASK_OBJ 4096
#define SIZEOF_THREAD_STATE sizeof(TyThreadState)
#define SIZEOF_TYPE_OBJ sizeof(TyTypeObject)
#define SIZEOF_UNICODE_OBJ sizeof(PyUnicodeObject)
#define SIZEOF_LONG_OBJ sizeof(PyLongObject)

// Calculate the minimum buffer size needed to read interpreter state fields
// We need to read code_object_generation and potentially tlbc_generation
#ifndef MAX
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#endif

#ifdef Ty_GIL_DISABLED
#define INTERP_STATE_MIN_SIZE MAX(MAX(MAX(offsetof(TyInterpreterState, _code_object_generation) + sizeof(uint64_t), \
                                          offsetof(TyInterpreterState, tlbc_indices.tlbc_generation) + sizeof(uint32_t)), \
                                      offsetof(TyInterpreterState, threads.head) + sizeof(void*)), \
                                  offsetof(TyInterpreterState, _gil.last_holder) + sizeof(TyThreadState*))
#else
#define INTERP_STATE_MIN_SIZE MAX(MAX(offsetof(TyInterpreterState, _code_object_generation) + sizeof(uint64_t), \
                                      offsetof(TyInterpreterState, threads.head) + sizeof(void*)), \
                                  offsetof(TyInterpreterState, _gil.last_holder) + sizeof(TyThreadState*))
#endif
#define INTERP_STATE_BUFFER_SIZE MAX(INTERP_STATE_MIN_SIZE, 256)



// Copied from Modules/_asynciomodule.c because it's not exported

struct _Ty_AsyncioModuleDebugOffsets {
    struct _asyncio_task_object {
        uint64_t size;
        uint64_t task_name;
        uint64_t task_awaited_by;
        uint64_t task_is_task;
        uint64_t task_awaited_by_is_set;
        uint64_t task_coro;
        uint64_t task_node;
    } asyncio_task_object;
    struct _asyncio_interpreter_state {
        uint64_t size;
        uint64_t asyncio_tasks_head;
    } asyncio_interpreter_state;
    struct _asyncio_thread_state {
        uint64_t size;
        uint64_t asyncio_running_loop;
        uint64_t asyncio_running_task;
        uint64_t asyncio_tasks_head;
    } asyncio_thread_state;
};

/* ============================================================================
 * STRUCTSEQ TYPE DEFINITIONS
 * ============================================================================ */

// TaskInfo structseq type - replaces 4-tuple (task_id, task_name, coroutine_stack, awaited_by)
static TyStructSequence_Field TaskInfo_fields[] = {
    {"task_id", "Task ID (memory address)"},
    {"task_name", "Task name"},
    {"coroutine_stack", "Coroutine call stack"},
    {"awaited_by", "Tasks awaiting this task"},
    {NULL}
};

static TyStructSequence_Desc TaskInfo_desc = {
    "_remote_debugging.TaskInfo",
    "Information about an asyncio task",
    TaskInfo_fields,
    4
};

// FrameInfo structseq type - replaces 3-tuple (filename, lineno, funcname)
static TyStructSequence_Field FrameInfo_fields[] = {
    {"filename", "Source code filename"},
    {"lineno", "Line number"},
    {"funcname", "Function name"},
    {NULL}
};

static TyStructSequence_Desc FrameInfo_desc = {
    "_remote_debugging.FrameInfo",
    "Information about a frame",
    FrameInfo_fields,
    3
};

// CoroInfo structseq type - replaces 2-tuple (call_stack, task_name)
static TyStructSequence_Field CoroInfo_fields[] = {
    {"call_stack", "Coroutine call stack"},
    {"task_name", "Task name"},
    {NULL}
};

static TyStructSequence_Desc CoroInfo_desc = {
    "_remote_debugging.CoroInfo",
    "Information about a coroutine",
    CoroInfo_fields,
    2
};

// ThreadInfo structseq type - replaces 2-tuple (thread_id, frame_info)
static TyStructSequence_Field ThreadInfo_fields[] = {
    {"thread_id", "Thread ID"},
    {"frame_info", "Frame information"},
    {NULL}
};

static TyStructSequence_Desc ThreadInfo_desc = {
    "_remote_debugging.ThreadInfo",
    "Information about a thread",
    ThreadInfo_fields,
    2
};

// AwaitedInfo structseq type - replaces 2-tuple (tid, awaited_by_list)
static TyStructSequence_Field AwaitedInfo_fields[] = {
    {"thread_id", "Thread ID"},
    {"awaited_by", "List of tasks awaited by this thread"},
    {NULL}
};

static TyStructSequence_Desc AwaitedInfo_desc = {
    "_remote_debugging.AwaitedInfo",
    "Information about what a thread is awaiting",
    AwaitedInfo_fields,
    2
};

typedef struct {
    TyObject *func_name;
    TyObject *file_name;
    int first_lineno;
    TyObject *linetable;  // bytes
    uintptr_t addr_code_adaptive;
} CachedCodeMetadata;

typedef struct {
    /* Types */
    TyTypeObject *RemoteDebugging_Type;
    TyTypeObject *TaskInfo_Type;
    TyTypeObject *FrameInfo_Type;
    TyTypeObject *CoroInfo_Type;
    TyTypeObject *ThreadInfo_Type;
    TyTypeObject *AwaitedInfo_Type;
} RemoteDebuggingState;

typedef struct {
    PyObject_HEAD
    proc_handle_t handle;
    uintptr_t runtime_start_address;
    struct _Ty_DebugOffsets debug_offsets;
    int async_debug_offsets_available;
    struct _Ty_AsyncioModuleDebugOffsets async_debug_offsets;
    uintptr_t interpreter_addr;
    uintptr_t tstate_addr;
    uint64_t code_object_generation;
    _Ty_hashtable_t *code_object_cache;
    int debug;
    int only_active_thread;
    RemoteDebuggingState *cached_state;  // Cached module state
#ifdef Ty_GIL_DISABLED
    // TLBC cache invalidation tracking
    uint32_t tlbc_generation;  // Track TLBC index pool changes
    _Ty_hashtable_t *tlbc_cache;  // Cache of TLBC arrays by code object address
#endif
} RemoteUnwinderObject;

#define RemoteUnwinder_CAST(op) ((RemoteUnwinderObject *)(op))

typedef struct
{
    int lineno;
    int end_lineno;
    int column;
    int end_column;
} LocationInfo;

typedef struct {
    uintptr_t remote_addr;
    size_t size;
    void *local_copy;
} StackChunkInfo;

typedef struct {
    StackChunkInfo *chunks;
    size_t count;
} StackChunkList;

#include "clinic/_remote_debugging_module.c.h"

/*[clinic input]
module _remote_debugging
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=5f507d5b2e76a7f7]*/


/* ============================================================================
 * FORWARD DECLARATIONS
 * ============================================================================ */

static inline int
is_frame_valid(
    RemoteUnwinderObject *unwinder,
    uintptr_t frame_addr,
    uintptr_t code_object_addr
);

typedef int (*thread_processor_func)(
    RemoteUnwinderObject *unwinder,
    uintptr_t thread_state_addr,
    unsigned long tid,
    void *context
);

typedef int (*set_entry_processor_func)(
    RemoteUnwinderObject *unwinder,
    uintptr_t key_addr,
    void *context
);


static int
parse_task(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address,
    TyObject *render_to
);

static int
parse_coro_chain(
    RemoteUnwinderObject *unwinder,
    uintptr_t coro_address,
    TyObject *render_to
);

/* Forward declarations for task parsing functions */
static int parse_frame_object(
    RemoteUnwinderObject *unwinder,
    TyObject** result,
    uintptr_t address,
    uintptr_t* address_of_code_object,
    uintptr_t* previous_frame
);

static int
parse_async_frame_chain(
    RemoteUnwinderObject *unwinder,
    TyObject *calls,
    uintptr_t address_of_thread,
    uintptr_t running_task_code_obj
);

static int read_py_ptr(RemoteUnwinderObject *unwinder, uintptr_t address, uintptr_t *ptr_addr);
static int read_Py_ssize_t(RemoteUnwinderObject *unwinder, uintptr_t address, Ty_ssize_t *size);

static int process_task_and_waiters(RemoteUnwinderObject *unwinder, uintptr_t task_addr, TyObject *result);
static int process_task_awaited_by(RemoteUnwinderObject *unwinder, uintptr_t task_address, set_entry_processor_func processor, void *context);
static int find_running_task_in_thread(RemoteUnwinderObject *unwinder, uintptr_t thread_state_addr, uintptr_t *running_task_addr);
static int get_task_code_object(RemoteUnwinderObject *unwinder, uintptr_t task_addr, uintptr_t *code_obj_addr);
static int append_awaited_by(RemoteUnwinderObject *unwinder, unsigned long tid, uintptr_t head_addr, TyObject *result);

/* ============================================================================
 * UTILITY FUNCTIONS AND HELPERS
 * ============================================================================ */

#define set_exception_cause(unwinder, exc_type, message) \
    if (unwinder->debug) { \
        _set_debug_exception_cause(exc_type, message); \
    }

static void
cached_code_metadata_destroy(void *ptr)
{
    CachedCodeMetadata *meta = (CachedCodeMetadata *)ptr;
    Ty_DECREF(meta->func_name);
    Ty_DECREF(meta->file_name);
    Ty_DECREF(meta->linetable);
    TyMem_RawFree(meta);
}

static inline RemoteDebuggingState *
RemoteDebugging_GetState(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (RemoteDebuggingState *)state;
}

static inline RemoteDebuggingState *
RemoteDebugging_GetStateFromType(TyTypeObject *type)
{
    TyObject *module = TyType_GetModule(type);
    assert(module != NULL);
    return RemoteDebugging_GetState(module);
}

static inline RemoteDebuggingState *
RemoteDebugging_GetStateFromObject(TyObject *obj)
{
    RemoteUnwinderObject *unwinder = (RemoteUnwinderObject *)obj;
    if (unwinder->cached_state == NULL) {
        unwinder->cached_state = RemoteDebugging_GetStateFromType(Ty_TYPE(obj));
    }
    return unwinder->cached_state;
}

static inline int
RemoteDebugging_InitState(RemoteDebuggingState *st)
{
    return 0;
}

static int
is_prerelease_version(uint64_t version)
{
    return (version & 0xF0) != 0xF0;
}

static inline int
validate_debug_offsets(struct _Ty_DebugOffsets *debug_offsets)
{
    if (memcmp(debug_offsets->cookie, _Ty_Debug_Cookie, sizeof(debug_offsets->cookie)) != 0) {
        // The remote is probably running a Python version predating debug offsets.
        TyErr_SetString(
            TyExc_RuntimeError,
            "Can't determine the Python version of the remote process");
        return -1;
    }

    // Assume debug offsets could change from one pre-release version to another,
    // or one minor version to another, but are stable across patch versions.
    if (is_prerelease_version(Ty_Version) && Ty_Version != debug_offsets->version) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "Can't attach from a pre-release Python interpreter"
            " to a process running a different Python version");
        return -1;
    }

    if (is_prerelease_version(debug_offsets->version) && Ty_Version != debug_offsets->version) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "Can't attach to a pre-release Python interpreter"
            " from a process running a different Python version");
        return -1;
    }

    unsigned int remote_major = (debug_offsets->version >> 24) & 0xFF;
    unsigned int remote_minor = (debug_offsets->version >> 16) & 0xFF;

    if (PY_MAJOR_VERSION != remote_major || PY_MINOR_VERSION != remote_minor) {
        TyErr_Format(
            TyExc_RuntimeError,
            "Can't attach from a Python %d.%d process to a Python %d.%d process",
            PY_MAJOR_VERSION, PY_MINOR_VERSION, remote_major, remote_minor);
        return -1;
    }

    // The debug offsets differ between free threaded and non-free threaded builds.
    if (_Ty_Debug_Free_Threaded && !debug_offsets->free_threaded) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "Cannot attach from a free-threaded Python process"
            " to a process running a non-free-threaded version");
        return -1;
    }

    if (!_Ty_Debug_Free_Threaded && debug_offsets->free_threaded) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "Cannot attach to a free-threaded Python process"
            " from a process running a non-free-threaded version");
        return -1;
    }

    return 0;
}

// Generic function to iterate through all threads
static int
iterate_threads(
    RemoteUnwinderObject *unwinder,
    thread_processor_func processor,
    void *context
) {
    uintptr_t thread_state_addr;
    unsigned long tid = 0;

    if (0 > _Ty_RemoteDebug_PagedReadRemoteMemory(
                &unwinder->handle,
                unwinder->interpreter_addr + unwinder->debug_offsets.interpreter_state.threads_main,
                sizeof(void*),
                &thread_state_addr))
    {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read main thread state");
        return -1;
    }

    while (thread_state_addr != 0) {
        if (0 > _Ty_RemoteDebug_PagedReadRemoteMemory(
                    &unwinder->handle,
                    thread_state_addr + unwinder->debug_offsets.thread_state.native_thread_id,
                    sizeof(tid),
                    &tid))
        {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read thread ID");
            return -1;
        }

        // Call the processor function for this thread
        if (processor(unwinder, thread_state_addr, tid, context) < 0) {
            return -1;
        }

        // Move to next thread
        if (0 > _Ty_RemoteDebug_PagedReadRemoteMemory(
                    &unwinder->handle,
                    thread_state_addr + unwinder->debug_offsets.thread_state.next,
                    sizeof(void*),
                    &thread_state_addr))
        {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read next thread state");
            return -1;
        }
    }

    return 0;
}

// Generic function to iterate through set entries
static int
iterate_set_entries(
    RemoteUnwinderObject *unwinder,
    uintptr_t set_addr,
    set_entry_processor_func processor,
    void *context
) {
    char set_object[SIZEOF_SET_OBJ];
    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, set_addr,
                                              SIZEOF_SET_OBJ, set_object) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read set object");
        return -1;
    }

    Ty_ssize_t num_els = GET_MEMBER(Ty_ssize_t, set_object, unwinder->debug_offsets.set_object.used);
    Ty_ssize_t set_len = GET_MEMBER(Ty_ssize_t, set_object, unwinder->debug_offsets.set_object.mask) + 1;
    uintptr_t table_ptr = GET_MEMBER(uintptr_t, set_object, unwinder->debug_offsets.set_object.table);

    Ty_ssize_t i = 0;
    Ty_ssize_t els = 0;
    while (i < set_len && els < num_els) {
        uintptr_t key_addr;
        if (read_py_ptr(unwinder, table_ptr, &key_addr) < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read set entry key");
            return -1;
        }

        if ((void*)key_addr != NULL) {
            Ty_ssize_t ref_cnt;
            if (read_Py_ssize_t(unwinder, table_ptr, &ref_cnt) < 0) {
                set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read set entry ref count");
                return -1;
            }

            if (ref_cnt) {
                // Process this valid set entry
                if (processor(unwinder, key_addr, context) < 0) {
                    return -1;
                }
                els++;
            }
        }
        table_ptr += sizeof(void*) * 2;
        i++;
    }

    return 0;
}

// Processor function for task waiters
static int
process_waiter_task(
    RemoteUnwinderObject *unwinder,
    uintptr_t key_addr,
    void *context
) {
    TyObject *result = (TyObject *)context;
    return process_task_and_waiters(unwinder, key_addr, result);
}

// Processor function for parsing tasks in sets
static int
process_task_parser(
    RemoteUnwinderObject *unwinder,
    uintptr_t key_addr,
    void *context
) {
    TyObject *awaited_by = (TyObject *)context;
    return parse_task(unwinder, key_addr, awaited_by);
}

/* ============================================================================
 * MEMORY READING FUNCTIONS
 * ============================================================================ */

#define DEFINE_MEMORY_READER(type_name, c_type, error_msg) \
static inline int \
read_##type_name(RemoteUnwinderObject *unwinder, uintptr_t address, c_type *result) \
{ \
    int res = _Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, address, sizeof(c_type), result); \
    if (res < 0) { \
        set_exception_cause(unwinder, TyExc_RuntimeError, error_msg); \
        return -1; \
    } \
    return 0; \
}

DEFINE_MEMORY_READER(ptr, uintptr_t, "Failed to read pointer from remote memory")
DEFINE_MEMORY_READER(Ty_ssize_t, Ty_ssize_t, "Failed to read Ty_ssize_t from remote memory")
DEFINE_MEMORY_READER(char, char, "Failed to read char from remote memory")

static int
read_py_ptr(RemoteUnwinderObject *unwinder, uintptr_t address, uintptr_t *ptr_addr)
{
    if (read_ptr(unwinder, address, ptr_addr)) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read Python pointer");
        return -1;
    }
    *ptr_addr &= ~Ty_TAG_BITS;
    return 0;
}

/* ============================================================================
 * PYTHON OBJECT READING FUNCTIONS
 * ============================================================================ */

static TyObject *
read_py_str(
    RemoteUnwinderObject *unwinder,
    uintptr_t address,
    Ty_ssize_t max_len
) {
    TyObject *result = NULL;
    char *buf = NULL;

    // Read the entire PyUnicodeObject at once
    char unicode_obj[SIZEOF_UNICODE_OBJ];
    int res = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        address,
        SIZEOF_UNICODE_OBJ,
        unicode_obj
    );
    if (res < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read PyUnicodeObject");
        goto err;
    }

    Ty_ssize_t len = GET_MEMBER(Ty_ssize_t, unicode_obj, unwinder->debug_offsets.unicode_object.length);
    if (len < 0 || len > max_len) {
        TyErr_Format(TyExc_RuntimeError,
                     "Invalid string length (%zd) at 0x%lx", len, address);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Invalid string length in remote Unicode object");
        return NULL;
    }

    buf = (char *)TyMem_RawMalloc(len+1);
    if (buf == NULL) {
        TyErr_NoMemory();
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate buffer for string reading");
        return NULL;
    }

    size_t offset = unwinder->debug_offsets.unicode_object.asciiobject_size;
    res = _Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, address + offset, len, buf);
    if (res < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read string data from remote memory");
        goto err;
    }
    buf[len] = '\0';

    result = TyUnicode_FromStringAndSize(buf, len);
    if (result == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create PyUnicode from remote string data");
        goto err;
    }

    TyMem_RawFree(buf);
    assert(result != NULL);
    return result;

err:
    if (buf != NULL) {
        TyMem_RawFree(buf);
    }
    return NULL;
}

static TyObject *
read_py_bytes(
    RemoteUnwinderObject *unwinder,
    uintptr_t address,
    Ty_ssize_t max_len
) {
    TyObject *result = NULL;
    char *buf = NULL;

    // Read the entire PyBytesObject at once
    char bytes_obj[SIZEOF_BYTES_OBJ];
    int res = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        address,
        SIZEOF_BYTES_OBJ,
        bytes_obj
    );
    if (res < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read PyBytesObject");
        goto err;
    }

    Ty_ssize_t len = GET_MEMBER(Ty_ssize_t, bytes_obj, unwinder->debug_offsets.bytes_object.ob_size);
    if (len < 0 || len > max_len) {
        TyErr_Format(TyExc_RuntimeError,
                     "Invalid bytes length (%zd) at 0x%lx", len, address);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Invalid bytes length in remote bytes object");
        return NULL;
    }

    buf = (char *)TyMem_RawMalloc(len+1);
    if (buf == NULL) {
        TyErr_NoMemory();
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate buffer for bytes reading");
        return NULL;
    }

    size_t offset = unwinder->debug_offsets.bytes_object.ob_sval;
    res = _Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, address + offset, len, buf);
    if (res < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read bytes data from remote memory");
        goto err;
    }
    buf[len] = '\0';

    result = TyBytes_FromStringAndSize(buf, len);
    if (result == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create PyBytes from remote bytes data");
        goto err;
    }

    TyMem_RawFree(buf);
    assert(result != NULL);
    return result;

err:
    if (buf != NULL) {
        TyMem_RawFree(buf);
    }
    return NULL;
}

static long
read_py_long(
    RemoteUnwinderObject *unwinder,
    uintptr_t address
)
{
    unsigned int shift = PYLONG_BITS_IN_DIGIT;

    // Read the entire PyLongObject at once
    char long_obj[SIZEOF_LONG_OBJ];
    int bytes_read = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        address,
        unwinder->debug_offsets.long_object.size,
        long_obj);
    if (bytes_read < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read PyLongObject");
        return -1;
    }

    uintptr_t lv_tag = GET_MEMBER(uintptr_t, long_obj, unwinder->debug_offsets.long_object.lv_tag);
    int negative = (lv_tag & 3) == 2;
    Ty_ssize_t size = lv_tag >> 3;

    if (size == 0) {
        return 0;
    }

    // If the long object has inline digits, use them directly
    digit *digits;
    if (size <= _PY_NSMALLNEGINTS + _PY_NSMALLPOSINTS) {
        // For small integers, digits are inline in the long_value.ob_digit array
        digits = (digit *)TyMem_RawMalloc(size * sizeof(digit));
        if (!digits) {
            TyErr_NoMemory();
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate digits for small PyLong");
            return -1;
        }
        memcpy(digits, long_obj + unwinder->debug_offsets.long_object.ob_digit, size * sizeof(digit));
    } else {
        // For larger integers, we need to read the digits separately
        digits = (digit *)TyMem_RawMalloc(size * sizeof(digit));
        if (!digits) {
            TyErr_NoMemory();
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate digits for large PyLong");
            return -1;
        }

        bytes_read = _Ty_RemoteDebug_PagedReadRemoteMemory(
            &unwinder->handle,
            address + unwinder->debug_offsets.long_object.ob_digit,
            sizeof(digit) * size,
            digits
        );
        if (bytes_read < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read PyLong digits from remote memory");
            goto error;
        }
    }

    long long value = 0;

    // In theory this can overflow, but because of llvm/llvm-project#16778
    // we can't use __builtin_mul_overflow because it fails to link with
    // __muloti4 on aarch64. In practice this is fine because all we're
    // testing here are task numbers that would fit in a single byte.
    for (Ty_ssize_t i = 0; i < size; ++i) {
        long long factor = digits[i] * (1UL << (Ty_ssize_t)(shift * i));
        value += factor;
    }
    TyMem_RawFree(digits);
    if (negative) {
        value *= -1;
    }
    return (long)value;
error:
    TyMem_RawFree(digits);
    return -1;
}

/* ============================================================================
 * ASYNCIO DEBUG FUNCTIONS
 * ============================================================================ */

// Get the PyAsyncioDebug section address for any platform
static uintptr_t
_Ty_RemoteDebug_GetAsyncioDebugAddress(proc_handle_t* handle)
{
    uintptr_t address;

#ifdef MS_WINDOWS
    // On Windows, search for asyncio debug in executable or DLL
    address = search_windows_map_for_section(handle, "AsyncioD", L"_asyncio");
    if (address == 0) {
        // Error out: 'python' substring covers both executable and DLL
        TyObject *exc = TyErr_GetRaisedException();
        TyErr_SetString(TyExc_RuntimeError, "Failed to find the AsyncioDebug section in the process.");
        _TyErr_ChainExceptions1(exc);
    }
#elif defined(__linux__)
    // On Linux, search for asyncio debug in executable or DLL
    address = search_linux_map_for_section(handle, "AsyncioDebug", "_asyncio.cpython");
    if (address == 0) {
        // Error out: 'python' substring covers both executable and DLL
        TyObject *exc = TyErr_GetRaisedException();
        TyErr_SetString(TyExc_RuntimeError, "Failed to find the AsyncioDebug section in the process.");
        _TyErr_ChainExceptions1(exc);
    }
#elif defined(__APPLE__) && TARGET_OS_OSX
    // On macOS, try libpython first, then fall back to python
    address = search_map_for_section(handle, "AsyncioDebug", "_asyncio.cpython");
    if (address == 0) {
        TyErr_Clear();
        address = search_map_for_section(handle, "AsyncioDebug", "_asyncio.cpython");
    }
    if (address == 0) {
        // Error out: 'python' substring covers both executable and DLL
        TyObject *exc = TyErr_GetRaisedException();
        TyErr_SetString(TyExc_RuntimeError, "Failed to find the AsyncioDebug section in the process.");
        _TyErr_ChainExceptions1(exc);
    }
#else
    Ty_UNREACHABLE();
#endif

    return address;
}

static int
read_async_debug(
    RemoteUnwinderObject *unwinder
) {
    uintptr_t async_debug_addr = _Ty_RemoteDebug_GetAsyncioDebugAddress(&unwinder->handle);
    if (!async_debug_addr) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to get AsyncioDebug address");
        return -1;
    }

    size_t size = sizeof(struct _Ty_AsyncioModuleDebugOffsets);
    int result = _Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, async_debug_addr, size, &unwinder->async_debug_offsets);
    if (result < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read AsyncioDebug offsets");
    }
    return result;
}

/* ============================================================================
 * ASYNCIO TASK PARSING FUNCTIONS
 * ============================================================================ */

static TyObject *
parse_task_name(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address
) {
    // Read the entire TaskObj at once
    char task_obj[SIZEOF_TASK_OBJ];
    int err = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        task_address,
        unwinder->async_debug_offsets.asyncio_task_object.size,
        task_obj);
    if (err < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task object");
        return NULL;
    }

    uintptr_t task_name_addr = GET_MEMBER_NO_TAG(uintptr_t, task_obj, unwinder->async_debug_offsets.asyncio_task_object.task_name);

    // The task name can be a long or a string so we need to check the type
    char task_name_obj[SIZEOF_PYOBJECT];
    err = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        task_name_addr,
        SIZEOF_PYOBJECT,
        task_name_obj);
    if (err < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task name object");
        return NULL;
    }

    // Now read the type object to get the flags
    char type_obj[SIZEOF_TYPE_OBJ];
    err = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        GET_MEMBER(uintptr_t, task_name_obj, unwinder->debug_offsets.pyobject.ob_type),
        SIZEOF_TYPE_OBJ,
        type_obj);
    if (err < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task name type object");
        return NULL;
    }

    if ((GET_MEMBER(unsigned long, type_obj, unwinder->debug_offsets.type_object.tp_flags) & Ty_TPFLAGS_LONG_SUBCLASS)) {
        long res = read_py_long(unwinder, task_name_addr);
        if (res == -1) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Task name PyLong parsing failed");
            return NULL;
        }
        return TyUnicode_FromFormat("Task-%d", res);
    }

    if(!(GET_MEMBER(unsigned long, type_obj, unwinder->debug_offsets.type_object.tp_flags) & Ty_TPFLAGS_UNICODE_SUBCLASS)) {
        TyErr_SetString(TyExc_RuntimeError, "Invalid task name object");
        set_exception_cause(unwinder, TyExc_RuntimeError, "Task name object is neither long nor unicode");
        return NULL;
    }

    return read_py_str(
        unwinder,
        task_name_addr,
        255
    );
}

static int parse_task_awaited_by(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address,
    TyObject *awaited_by
) {
    return process_task_awaited_by(unwinder, task_address, process_task_parser, awaited_by);
}

static int
handle_yield_from_frame(
    RemoteUnwinderObject *unwinder,
    uintptr_t gi_iframe_addr,
    uintptr_t gen_type_addr,
    TyObject *render_to
) {
    // Read the entire interpreter frame at once
    char iframe[SIZEOF_INTERP_FRAME];
    int err = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        gi_iframe_addr,
        SIZEOF_INTERP_FRAME,
        iframe);
    if (err < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read interpreter frame in yield_from handler");
        return -1;
    }

    if (GET_MEMBER(char, iframe, unwinder->debug_offsets.interpreter_frame.owner) != FRAME_OWNED_BY_GENERATOR) {
        TyErr_SetString(
            TyExc_RuntimeError,
            "generator doesn't own its frame \\_o_/");
        set_exception_cause(unwinder, TyExc_RuntimeError, "Frame ownership mismatch in yield_from");
        return -1;
    }

    uintptr_t stackpointer_addr = GET_MEMBER_NO_TAG(uintptr_t, iframe, unwinder->debug_offsets.interpreter_frame.stackpointer);

    if ((void*)stackpointer_addr != NULL) {
        uintptr_t gi_await_addr;
        err = read_py_ptr(
            unwinder,
            stackpointer_addr - sizeof(void*),
            &gi_await_addr);
        if (err) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read gi_await address");
            return -1;
        }

        if ((void*)gi_await_addr != NULL) {
            uintptr_t gi_await_addr_type_addr;
            err = read_ptr(
                unwinder,
                gi_await_addr + unwinder->debug_offsets.pyobject.ob_type,
                &gi_await_addr_type_addr);
            if (err) {
                set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read gi_await type address");
                return -1;
            }

            if (gen_type_addr == gi_await_addr_type_addr) {
                /* This needs an explanation. We always start with parsing
                   native coroutine / generator frames. Ultimately they
                   are awaiting on something. That something can be
                   a native coroutine frame or... an iterator.
                   If it's the latter -- we can't continue building
                   our chain. So the condition to bail out of this is
                   to do that when the type of the current coroutine
                   doesn't match the type of whatever it points to
                   in its cr_await.
                */
                err = parse_coro_chain(unwinder, gi_await_addr, render_to);
                if (err) {
                    set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse coroutine chain in yield_from");
                    return -1;
                }
            }
        }
    }

    return 0;
}

static int
parse_coro_chain(
    RemoteUnwinderObject *unwinder,
    uintptr_t coro_address,
    TyObject *render_to
) {
    assert((void*)coro_address != NULL);

    // Read the entire generator object at once
    char gen_object[SIZEOF_GEN_OBJ];
    int err = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        coro_address,
        SIZEOF_GEN_OBJ,
        gen_object);
    if (err < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read generator object in coro chain");
        return -1;
    }

    int8_t frame_state = GET_MEMBER(int8_t, gen_object, unwinder->debug_offsets.gen_object.gi_frame_state);
    if (frame_state == FRAME_CLEARED) {
        return 0;
    }

    uintptr_t gen_type_addr = GET_MEMBER(uintptr_t, gen_object, unwinder->debug_offsets.pyobject.ob_type);

    TyObject* name = NULL;

    // Parse the previous frame using the gi_iframe from local copy
    uintptr_t prev_frame;
    uintptr_t gi_iframe_addr = coro_address + unwinder->debug_offsets.gen_object.gi_iframe;
    uintptr_t address_of_code_object = 0;
    if (parse_frame_object(unwinder, &name, gi_iframe_addr, &address_of_code_object, &prev_frame) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse frame object in coro chain");
        return -1;
    }

    if (!name) {
        return 0;
    }

    if (TyList_Append(render_to, name)) {
        Ty_DECREF(name);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append frame to coro chain");
        return -1;
    }
    Ty_DECREF(name);

    if (frame_state == FRAME_SUSPENDED_YIELD_FROM) {
        return handle_yield_from_frame(unwinder, gi_iframe_addr, gen_type_addr, render_to);
    }

    return 0;
}

static TyObject*
create_task_result(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address
) {
    TyObject* result = NULL;
    TyObject *call_stack = NULL;
    TyObject *tn = NULL;
    char task_obj[SIZEOF_TASK_OBJ];
    uintptr_t coro_addr;

    // Create call_stack first since it's the first tuple element
    call_stack = TyList_New(0);
    if (call_stack == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create call stack list");
        goto error;
    }

    // Create task name/address for second tuple element
    tn = TyLong_FromUnsignedLongLong(task_address);
    if (tn == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create task name/address");
        goto error;
    }

    // Parse coroutine chain
    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, task_address,
                                              unwinder->async_debug_offsets.asyncio_task_object.size,
                                              task_obj) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task object for coro chain");
        goto error;
    }

    coro_addr = GET_MEMBER_NO_TAG(uintptr_t, task_obj, unwinder->async_debug_offsets.asyncio_task_object.task_coro);

    if ((void*)coro_addr != NULL) {
        if (parse_coro_chain(unwinder, coro_addr, call_stack) < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse coroutine chain");
            goto error;
        }

        if (TyList_Reverse(call_stack)) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to reverse call stack");
            goto error;
        }
    }

    // Create final CoroInfo result
    RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
    result = TyStructSequence_New(state->CoroInfo_Type);
    if (result == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create CoroInfo");
        goto error;
    }

    // TyStructSequence_SetItem steals references, so we don't need to DECREF on success
    TyStructSequence_SetItem(result, 0, call_stack);  // This steals the reference
    TyStructSequence_SetItem(result, 1, tn);  // This steals the reference

    return result;

error:
    Ty_XDECREF(result);
    Ty_XDECREF(call_stack);
    Ty_XDECREF(tn);
    return NULL;
}

static int
parse_task(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address,
    TyObject *render_to
) {
    char is_task;
    TyObject* result = NULL;
    int err;

    err = read_char(
        unwinder,
        task_address + unwinder->async_debug_offsets.asyncio_task_object.task_is_task,
        &is_task);
    if (err) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read is_task flag");
        goto error;
    }

    if (is_task) {
        result = create_task_result(unwinder, task_address);
        if (!result) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create task result");
            goto error;
        }
    } else {
        // Create an empty CoroInfo for non-task objects
        RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
        result = TyStructSequence_New(state->CoroInfo_Type);
        if (result == NULL) {
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create empty CoroInfo");
            goto error;
        }
        TyObject *empty_list = TyList_New(0);
        if (empty_list == NULL) {
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create empty list");
            goto error;
        }
        TyObject *task_name = TyLong_FromUnsignedLongLong(task_address);
        if (task_name == NULL) {
            Ty_DECREF(empty_list);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create task name");
            goto error;
        }
        TyStructSequence_SetItem(result, 0, empty_list);  // This steals the reference
        TyStructSequence_SetItem(result, 1, task_name);  // This steals the reference
    }
    if (TyList_Append(render_to, result)) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append task result to render list");
        goto error;
    }

    Ty_DECREF(result);
    return 0;

error:
    Ty_XDECREF(result);
    return -1;
}

static int
process_single_task_node(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_addr,
    TyObject **task_info,
    TyObject *result
) {
    TyObject *tn = NULL;
    TyObject *current_awaited_by = NULL;
    TyObject *task_id = NULL;
    TyObject *result_item = NULL;
    TyObject *coroutine_stack = NULL;

    tn = parse_task_name(unwinder, task_addr);
    if (tn == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse task name in single task node");
        goto error;
    }

    current_awaited_by = TyList_New(0);
    if (current_awaited_by == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create awaited_by list in single task node");
        goto error;
    }

    // Extract the coroutine stack for this task
    coroutine_stack = TyList_New(0);
    if (coroutine_stack == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create coroutine stack list in single task node");
        goto error;
    }

    if (parse_task(unwinder, task_addr, coroutine_stack) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse task coroutine stack in single task node");
        goto error;
    }

    task_id = TyLong_FromUnsignedLongLong(task_addr);
    if (task_id == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create task ID in single task node");
        goto error;
    }

    RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
    result_item = TyStructSequence_New(state->TaskInfo_Type);
    if (result_item == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create TaskInfo in single task node");
        goto error;
    }

    TyStructSequence_SetItem(result_item, 0, task_id);  // steals ref
    TyStructSequence_SetItem(result_item, 1, tn);  // steals ref
    TyStructSequence_SetItem(result_item, 2, coroutine_stack);  // steals ref
    TyStructSequence_SetItem(result_item, 3, current_awaited_by);  // steals ref

    // References transferred to tuple
    task_id = NULL;
    tn = NULL;
    coroutine_stack = NULL;
    current_awaited_by = NULL;

    if (TyList_Append(result, result_item)) {
        Ty_DECREF(result_item);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append result item in single task node");
        return -1;
    }
    if (task_info != NULL) {
        *task_info = result_item;
    }
    Ty_DECREF(result_item);

    // Get back current_awaited_by reference for parse_task_awaited_by
    current_awaited_by = TyStructSequence_GetItem(result_item, 3);
    if (parse_task_awaited_by(unwinder, task_addr, current_awaited_by) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse awaited_by in single task node");
        // No cleanup needed here since all references were transferred to result_item
        // and result_item was already added to result list and decreffed
        return -1;
    }

    return 0;

error:
    Ty_XDECREF(tn);
    Ty_XDECREF(current_awaited_by);
    Ty_XDECREF(task_id);
    Ty_XDECREF(result_item);
    Ty_XDECREF(coroutine_stack);
    return -1;
}

// Thread processor for get_all_awaited_by
static int
process_thread_for_awaited_by(
    RemoteUnwinderObject *unwinder,
    uintptr_t thread_state_addr,
    unsigned long tid,
    void *context
) {
    TyObject *result = (TyObject *)context;
    uintptr_t head_addr = thread_state_addr + unwinder->async_debug_offsets.asyncio_thread_state.asyncio_tasks_head;
    return append_awaited_by(unwinder, tid, head_addr, result);
}

// Generic function to process task awaited_by
static int
process_task_awaited_by(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_address,
    set_entry_processor_func processor,
    void *context
) {
    // Read the entire TaskObj at once
    char task_obj[SIZEOF_TASK_OBJ];
    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, task_address,
                                              unwinder->async_debug_offsets.asyncio_task_object.size,
                                              task_obj) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task object");
        return -1;
    }

    uintptr_t task_ab_addr = GET_MEMBER_NO_TAG(uintptr_t, task_obj, unwinder->async_debug_offsets.asyncio_task_object.task_awaited_by);
    if ((void*)task_ab_addr == NULL) {
        return 0;  // No tasks waiting for this one
    }

    char awaited_by_is_a_set = GET_MEMBER(char, task_obj, unwinder->async_debug_offsets.asyncio_task_object.task_awaited_by_is_set);

    if (awaited_by_is_a_set) {
        return iterate_set_entries(unwinder, task_ab_addr, processor, context);
    } else {
        // Single task waiting
        return processor(unwinder, task_ab_addr, context);
    }
}

static int
process_running_task_chain(
    RemoteUnwinderObject *unwinder,
    uintptr_t running_task_addr,
    uintptr_t thread_state_addr,
    TyObject *result
) {
    uintptr_t running_task_code_obj = 0;
    if(get_task_code_object(unwinder, running_task_addr, &running_task_code_obj) < 0) {
        return -1;
    }

    // First, add this task to the result
    TyObject *task_info = NULL;
    if (process_single_task_node(unwinder, running_task_addr, &task_info, result) < 0) {
        return -1;
    }

    // Get the chain from the current frame to this task
    TyObject *coro_chain = TyStructSequence_GET_ITEM(task_info, 2);
    assert(coro_chain != NULL);
    if (TyList_GET_SIZE(coro_chain) != 1) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Coro chain is not a single item");
        return -1;
    }
    TyObject *coro_info = TyList_GET_ITEM(coro_chain, 0);
    assert(coro_info != NULL);
    TyObject *frame_chain = TyStructSequence_GET_ITEM(coro_info, 0);
    assert(frame_chain != NULL);

    // Clear the coro_chain
    if (TyList_Clear(frame_chain) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to clear coroutine chain");
        return -1;
    }

    // Add the chain from the current frame to this task
    if (parse_async_frame_chain(unwinder, frame_chain, thread_state_addr, running_task_code_obj) < 0) {
        return -1;
    }

    // Now find all tasks that are waiting for this task and process them
    if (process_task_awaited_by(unwinder, running_task_addr, process_waiter_task, result) < 0) {
        return -1;
    }

    return 0;
}

// Thread processor for get_async_stack_trace
static int
process_thread_for_async_stack_trace(
    RemoteUnwinderObject *unwinder,
    uintptr_t thread_state_addr,
    unsigned long tid,
    void *context
) {
    TyObject *result = (TyObject *)context;

    // Find running task in this thread
    uintptr_t running_task_addr;
    if (find_running_task_in_thread(unwinder, thread_state_addr, &running_task_addr) < 0) {
        return 0;
    }

    // If we found a running task, process it and its waiters
    if ((void*)running_task_addr != NULL) {
        TyObject *task_list = TyList_New(0);
        if (task_list == NULL) {
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create task list for thread");
            return -1;
        }

        if (process_running_task_chain(unwinder, running_task_addr, thread_state_addr, task_list) < 0) {
            Ty_DECREF(task_list);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to process running task chain");
            return -1;
        }

        // Create AwaitedInfo structure for this thread
        TyObject *tid_py = TyLong_FromUnsignedLong(tid);
        if (tid_py == NULL) {
            Ty_DECREF(task_list);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create thread ID");
            return -1;
        }

        RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
        TyObject *awaited_info = TyStructSequence_New(state->AwaitedInfo_Type);
        if (awaited_info == NULL) {
            Ty_DECREF(tid_py);
            Ty_DECREF(task_list);
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create AwaitedInfo");
            return -1;
        }

        TyStructSequence_SetItem(awaited_info, 0, tid_py);  // steals ref
        TyStructSequence_SetItem(awaited_info, 1, task_list);  // steals ref

        if (TyList_Append(result, awaited_info)) {
            Ty_DECREF(awaited_info);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append AwaitedInfo to result");
            return -1;
        }
        Ty_DECREF(awaited_info);
    }

    return 0;
}

static int
process_task_and_waiters(
    RemoteUnwinderObject *unwinder,
    uintptr_t task_addr,
    TyObject *result
) {
    // First, add this task to the result
    if (process_single_task_node(unwinder, task_addr, NULL, result) < 0) {
        return -1;
    }

    // Now find all tasks that are waiting for this task and process them
    return process_task_awaited_by(unwinder, task_addr, process_waiter_task, result);
}

static int
find_running_task_in_thread(
    RemoteUnwinderObject *unwinder,
    uintptr_t thread_state_addr,
    uintptr_t *running_task_addr
) {
    *running_task_addr = (uintptr_t)NULL;

    uintptr_t address_of_running_loop;
    int bytes_read = read_py_ptr(
        unwinder,
        thread_state_addr + unwinder->async_debug_offsets.asyncio_thread_state.asyncio_running_loop,
        &address_of_running_loop);
    if (bytes_read == -1) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read running loop address");
        return -1;
    }

    // no asyncio loop is now running
    if ((void*)address_of_running_loop == NULL) {
        return 0;
    }

    int err = read_ptr(
        unwinder,
        thread_state_addr + unwinder->async_debug_offsets.asyncio_thread_state.asyncio_running_task,
        running_task_addr);
    if (err) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read running task address");
        return -1;
    }

    return 0;
}

static int
get_task_code_object(RemoteUnwinderObject *unwinder, uintptr_t task_addr, uintptr_t *code_obj_addr) {
    uintptr_t running_coro_addr = 0;

    if(read_py_ptr(
        unwinder,
        task_addr + unwinder->async_debug_offsets.asyncio_task_object.task_coro,
        &running_coro_addr) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Running task coro read failed");
        return -1;
    }

    if (running_coro_addr == 0) {
        TyErr_SetString(TyExc_RuntimeError, "Running task coro is NULL");
        set_exception_cause(unwinder, TyExc_RuntimeError, "Running task coro address is NULL");
        return -1;
    }

    // note: genobject's gi_iframe is an embedded struct so the address to
    // the offset leads directly to its first field: f_executable
    if (read_py_ptr(
        unwinder,
        running_coro_addr + unwinder->debug_offsets.gen_object.gi_iframe, code_obj_addr) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read running task code object");
        return -1;
    }

    if (*code_obj_addr == 0) {
        TyErr_SetString(TyExc_RuntimeError, "Running task code object is NULL");
        set_exception_cause(unwinder, TyExc_RuntimeError, "Running task code object address is NULL");
        return -1;
    }

    return 0;
}

/* ============================================================================
 * TLBC CACHING FUNCTIONS
 * ============================================================================ */

#ifdef Ty_GIL_DISABLED

typedef struct {
    void *tlbc_array;  // Local copy of the TLBC array
    Ty_ssize_t tlbc_array_size;  // Size of the TLBC array
    uint32_t generation;  // Generation when this was cached
} TLBCCacheEntry;

static void
tlbc_cache_entry_destroy(void *ptr)
{
    TLBCCacheEntry *entry = (TLBCCacheEntry *)ptr;
    if (entry->tlbc_array) {
        TyMem_RawFree(entry->tlbc_array);
    }
    TyMem_RawFree(entry);
}

static TLBCCacheEntry *
get_tlbc_cache_entry(RemoteUnwinderObject *self, uintptr_t code_addr, uint32_t current_generation)
{
    void *key = (void *)code_addr;
    TLBCCacheEntry *entry = _Ty_hashtable_get(self->tlbc_cache, key);

    if (entry && entry->generation != current_generation) {
        // Entry is stale, remove it by setting to NULL
        _Ty_hashtable_set(self->tlbc_cache, key, NULL);
        entry = NULL;
    }

    return entry;
}

static int
cache_tlbc_array(RemoteUnwinderObject *unwinder, uintptr_t code_addr, uintptr_t tlbc_array_addr, uint32_t generation)
{
    uintptr_t tlbc_array_ptr;
    void *tlbc_array = NULL;
    TLBCCacheEntry *entry = NULL;

    // Read the TLBC array pointer
    if (read_ptr(unwinder, tlbc_array_addr, &tlbc_array_ptr) != 0 || tlbc_array_ptr == 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read TLBC array pointer");
        return 0; // No TLBC array
    }

    // Read the TLBC array size
    Ty_ssize_t tlbc_size;
    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, tlbc_array_ptr, sizeof(tlbc_size), &tlbc_size) != 0 || tlbc_size <= 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read TLBC array size");
        return 0; // Invalid size
    }

    // Allocate and read the entire TLBC array
    size_t array_data_size = tlbc_size * sizeof(void*);
    tlbc_array = TyMem_RawMalloc(sizeof(Ty_ssize_t) + array_data_size);
    if (!tlbc_array) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate TLBC array");
        return 0; // Memory error
    }

    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, tlbc_array_ptr, sizeof(Ty_ssize_t) + array_data_size, tlbc_array) != 0) {
        TyMem_RawFree(tlbc_array);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read TLBC array data");
        return 0; // Read error
    }

    // Create cache entry
    entry = TyMem_RawMalloc(sizeof(TLBCCacheEntry));
    if (!entry) {
        TyMem_RawFree(tlbc_array);
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate TLBC cache entry");
        return 0; // Memory error
    }

    entry->tlbc_array = tlbc_array;
    entry->tlbc_array_size = tlbc_size;
    entry->generation = generation;

    // Store in cache
    void *key = (void *)code_addr;
    if (_Ty_hashtable_set(unwinder->tlbc_cache, key, entry) < 0) {
        tlbc_cache_entry_destroy(entry);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to store TLBC entry in cache");
        return 0; // Cache error
    }

    return 1; // Success
}



#endif

/* ============================================================================
 * LINE TABLE PARSING FUNCTIONS
 * ============================================================================ */

static int
scan_varint(const uint8_t **ptr)
{
    unsigned int read = **ptr;
    *ptr = *ptr + 1;
    unsigned int val = read & 63;
    unsigned int shift = 0;
    while (read & 64) {
        read = **ptr;
        *ptr = *ptr + 1;
        shift += 6;
        val |= (read & 63) << shift;
    }
    return val;
}

static int
scan_signed_varint(const uint8_t **ptr)
{
    unsigned int uval = scan_varint(ptr);
    if (uval & 1) {
        return -(int)(uval >> 1);
    }
    else {
        return uval >> 1;
    }
}

static bool
parse_linetable(const uintptr_t addrq, const char* linetable, int firstlineno, LocationInfo* info)
{
    const uint8_t* ptr = (const uint8_t*)(linetable);
    uint64_t addr = 0;
    info->lineno = firstlineno;

    while (*ptr != '\0') {
        // See InternalDocs/code_objects.md for where these magic numbers are from
        // and for the decoding algorithm.
        uint8_t first_byte = *(ptr++);
        uint8_t code = (first_byte >> 3) & 15;
        size_t length = (first_byte & 7) + 1;
        uintptr_t end_addr = addr + length;
        switch (code) {
            case PY_CODE_LOCATION_INFO_NONE: {
                break;
            }
            case PY_CODE_LOCATION_INFO_LONG: {
                int line_delta = scan_signed_varint(&ptr);
                info->lineno += line_delta;
                info->end_lineno = info->lineno + scan_varint(&ptr);
                info->column = scan_varint(&ptr) - 1;
                info->end_column = scan_varint(&ptr) - 1;
                break;
            }
            case PY_CODE_LOCATION_INFO_NO_COLUMNS: {
                int line_delta = scan_signed_varint(&ptr);
                info->lineno += line_delta;
                info->column = info->end_column = -1;
                break;
            }
            case PY_CODE_LOCATION_INFO_ONE_LINE0:
            case PY_CODE_LOCATION_INFO_ONE_LINE1:
            case PY_CODE_LOCATION_INFO_ONE_LINE2: {
                int line_delta = code - 10;
                info->lineno += line_delta;
                info->end_lineno = info->lineno;
                info->column = *(ptr++);
                info->end_column = *(ptr++);
                break;
            }
            default: {
                uint8_t second_byte = *(ptr++);
                if ((second_byte & 128) != 0) {
                    return false;
                }
                info->column = code << 3 | (second_byte >> 4);
                info->end_column = info->column + (second_byte & 15);
                break;
            }
        }
        if (addr <= addrq && end_addr > addrq) {
            return true;
        }
        addr = end_addr;
    }
    return false;
}

/* ============================================================================
 * CODE OBJECT AND FRAME PARSING FUNCTIONS
 * ============================================================================ */

static int
parse_code_object(RemoteUnwinderObject *unwinder,
                  TyObject **result,
                  uintptr_t address,
                  uintptr_t instruction_pointer,
                  uintptr_t *previous_frame,
                  int32_t tlbc_index)
{
    void *key = (void *)address;
    CachedCodeMetadata *meta = NULL;
    TyObject *func = NULL;
    TyObject *file = NULL;
    TyObject *linetable = NULL;
    TyObject *lineno = NULL;
    TyObject *tuple = NULL;

#ifdef Ty_GIL_DISABLED
    // In free threading builds, code object addresses might have the low bit set
    // as a flag, so we need to mask it off to get the real address
    uintptr_t real_address = address & (~1);
#else
    uintptr_t real_address = address;
#endif

    if (unwinder && unwinder->code_object_cache != NULL) {
        meta = _Ty_hashtable_get(unwinder->code_object_cache, key);
    }

    if (meta == NULL) {
        char code_object[SIZEOF_CODE_OBJ];
        if (_Ty_RemoteDebug_PagedReadRemoteMemory(
                &unwinder->handle, real_address, SIZEOF_CODE_OBJ, code_object) < 0)
        {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read code object");
            goto error;
        }

        func = read_py_str(unwinder,
            GET_MEMBER(uintptr_t, code_object, unwinder->debug_offsets.code_object.qualname), 1024);
        if (!func) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read function name from code object");
            goto error;
        }

        file = read_py_str(unwinder,
            GET_MEMBER(uintptr_t, code_object, unwinder->debug_offsets.code_object.filename), 1024);
        if (!file) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read filename from code object");
            goto error;
        }

        linetable = read_py_bytes(unwinder,
            GET_MEMBER(uintptr_t, code_object, unwinder->debug_offsets.code_object.linetable), 4096);
        if (!linetable) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read linetable from code object");
            goto error;
        }

        meta = TyMem_RawMalloc(sizeof(CachedCodeMetadata));
        if (!meta) {
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate cached code metadata");
            goto error;
        }

        meta->func_name = func;
        meta->file_name = file;
        meta->linetable = linetable;
        meta->first_lineno = GET_MEMBER(int, code_object, unwinder->debug_offsets.code_object.firstlineno);
        meta->addr_code_adaptive = real_address + unwinder->debug_offsets.code_object.co_code_adaptive;

        if (unwinder && unwinder->code_object_cache && _Ty_hashtable_set(unwinder->code_object_cache, key, meta) < 0) {
            cached_code_metadata_destroy(meta);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to cache code metadata");
            goto error;
        }

        // Ownership transferred to meta
        func = NULL;
        file = NULL;
        linetable = NULL;
    }

    uintptr_t ip = instruction_pointer;
    ptrdiff_t addrq;

#ifdef Ty_GIL_DISABLED
    // Handle thread-local bytecode (TLBC) in free threading builds
    if (tlbc_index == 0 || unwinder->debug_offsets.code_object.co_tlbc == 0 || unwinder == NULL) {
        // No TLBC or no unwinder - use main bytecode directly
        addrq = (uint16_t *)ip - (uint16_t *)meta->addr_code_adaptive;
        goto done_tlbc;
    }

    // Try to get TLBC data from cache (we'll get generation from the caller)
    TLBCCacheEntry *tlbc_entry = get_tlbc_cache_entry(unwinder, real_address, unwinder->tlbc_generation);

    if (!tlbc_entry) {
        // Cache miss - try to read and cache TLBC array
        if (!cache_tlbc_array(unwinder, real_address, real_address + unwinder->debug_offsets.code_object.co_tlbc, unwinder->tlbc_generation)) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to cache TLBC array");
            goto error;
        }
        tlbc_entry = get_tlbc_cache_entry(unwinder, real_address, unwinder->tlbc_generation);
    }

    if (tlbc_entry && tlbc_index < tlbc_entry->tlbc_array_size) {
        // Use cached TLBC data
        uintptr_t *entries = (uintptr_t *)((char *)tlbc_entry->tlbc_array + sizeof(Ty_ssize_t));
        uintptr_t tlbc_bytecode_addr = entries[tlbc_index];

        if (tlbc_bytecode_addr != 0) {
            // Calculate offset from TLBC bytecode
            addrq = (uint16_t *)ip - (uint16_t *)tlbc_bytecode_addr;
            goto done_tlbc;
        }
    }

    // Fall back to main bytecode
    addrq = (uint16_t *)ip - (uint16_t *)meta->addr_code_adaptive;

done_tlbc:
#else
    // Non-free-threaded build, always use the main bytecode
    (void)tlbc_index; // Suppress unused parameter warning
    (void)unwinder;   // Suppress unused parameter warning
    addrq = (uint16_t *)ip - (uint16_t *)meta->addr_code_adaptive;
#endif
    ;  // Empty statement to avoid C23 extension warning
    LocationInfo info = {0};
    bool ok = parse_linetable(addrq, TyBytes_AS_STRING(meta->linetable),
                              meta->first_lineno, &info);
    if (!ok) {
        info.lineno = -1;
    }

    lineno = TyLong_FromLong(info.lineno);
    if (!lineno) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create line number object");
        goto error;
    }

    RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
    tuple = TyStructSequence_New(state->FrameInfo_Type);
    if (!tuple) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create FrameInfo for code object");
        goto error;
    }

    Ty_INCREF(meta->func_name);
    Ty_INCREF(meta->file_name);
    TyStructSequence_SetItem(tuple, 0, meta->file_name);
    TyStructSequence_SetItem(tuple, 1, lineno);
    TyStructSequence_SetItem(tuple, 2, meta->func_name);

    *result = tuple;
    return 0;

error:
    Ty_XDECREF(func);
    Ty_XDECREF(file);
    Ty_XDECREF(linetable);
    Ty_XDECREF(lineno);
    Ty_XDECREF(tuple);
    return -1;
}

/* ============================================================================
 * STACK CHUNK MANAGEMENT FUNCTIONS
 * ============================================================================ */

static void
cleanup_stack_chunks(StackChunkList *chunks)
{
    for (size_t i = 0; i < chunks->count; ++i) {
        TyMem_RawFree(chunks->chunks[i].local_copy);
    }
    TyMem_RawFree(chunks->chunks);
}

static int
process_single_stack_chunk(
    RemoteUnwinderObject *unwinder,
    uintptr_t chunk_addr,
    StackChunkInfo *chunk_info
) {
    // Start with default size assumption
    size_t current_size = _PY_DATA_STACK_CHUNK_SIZE;

    char *this_chunk = TyMem_RawMalloc(current_size);
    if (!this_chunk) {
        TyErr_NoMemory();
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate stack chunk buffer");
        return -1;
    }

    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, chunk_addr, current_size, this_chunk) < 0) {
        TyMem_RawFree(this_chunk);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read stack chunk");
        return -1;
    }

    // Check actual size and reread if necessary
    size_t actual_size = GET_MEMBER(size_t, this_chunk, offsetof(_PyStackChunk, size));
    if (actual_size != current_size) {
        this_chunk = TyMem_RawRealloc(this_chunk, actual_size);
        if (!this_chunk) {
            TyErr_NoMemory();
            set_exception_cause(unwinder, TyExc_MemoryError, "Failed to reallocate stack chunk buffer");
            return -1;
        }

        if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, chunk_addr, actual_size, this_chunk) < 0) {
            TyMem_RawFree(this_chunk);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to reread stack chunk with correct size");
            return -1;
        }
        current_size = actual_size;
    }

    chunk_info->remote_addr = chunk_addr;
    chunk_info->size = current_size;
    chunk_info->local_copy = this_chunk;
    return 0;
}

static int
copy_stack_chunks(RemoteUnwinderObject *unwinder,
                  uintptr_t tstate_addr,
                  StackChunkList *out_chunks)
{
    uintptr_t chunk_addr;
    StackChunkInfo *chunks = NULL;
    size_t count = 0;
    size_t max_chunks = 16;

    if (read_ptr(unwinder, tstate_addr + unwinder->debug_offsets.thread_state.datastack_chunk, &chunk_addr)) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read initial stack chunk address");
        return -1;
    }

    chunks = TyMem_RawMalloc(max_chunks * sizeof(StackChunkInfo));
    if (!chunks) {
        TyErr_NoMemory();
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to allocate stack chunks array");
        return -1;
    }

    while (chunk_addr != 0) {
        // Grow array if needed
        if (count >= max_chunks) {
            max_chunks *= 2;
            StackChunkInfo *new_chunks = TyMem_RawRealloc(chunks, max_chunks * sizeof(StackChunkInfo));
            if (!new_chunks) {
                TyErr_NoMemory();
                set_exception_cause(unwinder, TyExc_MemoryError, "Failed to grow stack chunks array");
                goto error;
            }
            chunks = new_chunks;
        }

        // Process this chunk
        if (process_single_stack_chunk(unwinder, chunk_addr, &chunks[count]) < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to process stack chunk");
            goto error;
        }

        // Get next chunk address and increment count
        chunk_addr = GET_MEMBER(uintptr_t, chunks[count].local_copy, offsetof(_PyStackChunk, previous));
        count++;
    }

    out_chunks->chunks = chunks;
    out_chunks->count = count;
    return 0;

error:
    for (size_t i = 0; i < count; ++i) {
        TyMem_RawFree(chunks[i].local_copy);
    }
    TyMem_RawFree(chunks);
    return -1;
}

static void *
find_frame_in_chunks(StackChunkList *chunks, uintptr_t remote_ptr)
{
    for (size_t i = 0; i < chunks->count; ++i) {
        uintptr_t base = chunks->chunks[i].remote_addr + offsetof(_PyStackChunk, data);
        size_t payload = chunks->chunks[i].size - offsetof(_PyStackChunk, data);

        if (remote_ptr >= base && remote_ptr < base + payload) {
            return (char *)chunks->chunks[i].local_copy + (remote_ptr - chunks->chunks[i].remote_addr);
        }
    }
    return NULL;
}

static int
parse_frame_from_chunks(
    RemoteUnwinderObject *unwinder,
    TyObject **result,
    uintptr_t address,
    uintptr_t *previous_frame,
    StackChunkList *chunks
) {
    void *frame_ptr = find_frame_in_chunks(chunks, address);
    if (!frame_ptr) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Frame not found in stack chunks");
        return -1;
    }

    char *frame = (char *)frame_ptr;
    *previous_frame = GET_MEMBER(uintptr_t, frame, unwinder->debug_offsets.interpreter_frame.previous);
    uintptr_t code_object = GET_MEMBER_NO_TAG(uintptr_t, frame_ptr, unwinder->debug_offsets.interpreter_frame.executable);
    int frame_valid = is_frame_valid(unwinder, (uintptr_t)frame, code_object);
    if (frame_valid != 1) {
        return frame_valid;
    }

    uintptr_t instruction_pointer = GET_MEMBER(uintptr_t, frame, unwinder->debug_offsets.interpreter_frame.instr_ptr);

    // Get tlbc_index for free threading builds
    int32_t tlbc_index = 0;
#ifdef Ty_GIL_DISABLED
    if (unwinder->debug_offsets.interpreter_frame.tlbc_index != 0) {
        tlbc_index = GET_MEMBER(int32_t, frame, unwinder->debug_offsets.interpreter_frame.tlbc_index);
    }
#endif

    return parse_code_object(unwinder, result, code_object, instruction_pointer, previous_frame, tlbc_index);
}

/* ============================================================================
 * INTERPRETER STATE AND THREAD DISCOVERY FUNCTIONS
 * ============================================================================ */

static int
populate_initial_state_data(
    int all_threads,
    RemoteUnwinderObject *unwinder,
    uintptr_t runtime_start_address,
    uintptr_t *interpreter_state,
    uintptr_t *tstate
) {
    uint64_t interpreter_state_list_head =
        unwinder->debug_offsets.runtime_state.interpreters_head;

    uintptr_t address_of_interpreter_state;
    int bytes_read = _Ty_RemoteDebug_PagedReadRemoteMemory(
            &unwinder->handle,
            runtime_start_address + interpreter_state_list_head,
            sizeof(void*),
            &address_of_interpreter_state);
    if (bytes_read < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read interpreter state address");
        return -1;
    }

    if (address_of_interpreter_state == 0) {
        TyErr_SetString(TyExc_RuntimeError, "No interpreter state found");
        set_exception_cause(unwinder, TyExc_RuntimeError, "Interpreter state is NULL");
        return -1;
    }

    *interpreter_state = address_of_interpreter_state;

    if (all_threads) {
        *tstate = 0;
        return 0;
    }

    uintptr_t address_of_thread = address_of_interpreter_state +
                    unwinder->debug_offsets.interpreter_state.threads_main;

    if (_Ty_RemoteDebug_PagedReadRemoteMemory(
            &unwinder->handle,
            address_of_thread,
            sizeof(void*),
            tstate) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read main thread state address");
        return -1;
    }

    return 0;
}


static int
find_running_frame(
    RemoteUnwinderObject *unwinder,
    uintptr_t address_of_thread,
    uintptr_t *frame
) {
    if ((void*)address_of_thread != NULL) {
        int err = read_ptr(
            unwinder,
            address_of_thread + unwinder->debug_offsets.thread_state.current_frame,
            frame);
        if (err) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read current frame pointer");
            return -1;
        }
        return 0;
    }

    *frame = (uintptr_t)NULL;
    return 0;
}

/* ============================================================================
 * FRAME PARSING FUNCTIONS
 * ============================================================================ */

static inline int
is_frame_valid(
    RemoteUnwinderObject *unwinder,
    uintptr_t frame_addr,
    uintptr_t code_object_addr
) {
    if ((void*)code_object_addr == NULL) {
        return 0;
    }

    void* frame = (void*)frame_addr;

    if (GET_MEMBER(char, frame, unwinder->debug_offsets.interpreter_frame.owner) == FRAME_OWNED_BY_CSTACK ||
        GET_MEMBER(char, frame, unwinder->debug_offsets.interpreter_frame.owner) == FRAME_OWNED_BY_INTERPRETER) {
        return 0;  // C frame
    }

    if (GET_MEMBER(char, frame, unwinder->debug_offsets.interpreter_frame.owner) != FRAME_OWNED_BY_GENERATOR
        && GET_MEMBER(char, frame, unwinder->debug_offsets.interpreter_frame.owner) != FRAME_OWNED_BY_THREAD) {
        TyErr_Format(TyExc_RuntimeError, "Unhandled frame owner %d.\n",
                    GET_MEMBER(char, frame, unwinder->debug_offsets.interpreter_frame.owner));
        set_exception_cause(unwinder, TyExc_RuntimeError, "Unhandled frame owner type in async frame");
        return -1;
    }
    return 1;
}

static int
parse_frame_object(
    RemoteUnwinderObject *unwinder,
    TyObject** result,
    uintptr_t address,
    uintptr_t* address_of_code_object,
    uintptr_t* previous_frame
) {
    char frame[SIZEOF_INTERP_FRAME];
    *address_of_code_object = 0;

    Ty_ssize_t bytes_read = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle,
        address,
        SIZEOF_INTERP_FRAME,
        frame
    );
    if (bytes_read < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read interpreter frame");
        return -1;
    }

    *previous_frame = GET_MEMBER(uintptr_t, frame, unwinder->debug_offsets.interpreter_frame.previous);
    uintptr_t code_object = GET_MEMBER_NO_TAG(uintptr_t, frame, unwinder->debug_offsets.interpreter_frame.executable);
    int frame_valid = is_frame_valid(unwinder, (uintptr_t)frame, code_object);
    if (frame_valid != 1) {
        return frame_valid;
    }

    uintptr_t instruction_pointer = GET_MEMBER(uintptr_t, frame, unwinder->debug_offsets.interpreter_frame.instr_ptr);

    // Get tlbc_index for free threading builds
    int32_t tlbc_index = 0;
#ifdef Ty_GIL_DISABLED
    if (unwinder->debug_offsets.interpreter_frame.tlbc_index != 0) {
        tlbc_index = GET_MEMBER(int32_t, frame, unwinder->debug_offsets.interpreter_frame.tlbc_index);
    }
#endif

    *address_of_code_object = code_object;
    return parse_code_object(unwinder, result, code_object, instruction_pointer, previous_frame, tlbc_index);
}

static int
 parse_async_frame_chain(
    RemoteUnwinderObject *unwinder,
    TyObject *calls,
    uintptr_t address_of_thread,
    uintptr_t running_task_code_obj
) {
    uintptr_t address_of_current_frame;
    if (find_running_frame(unwinder, address_of_thread, &address_of_current_frame) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Running frame search failed in async chain");
        return -1;
    }

    while ((void*)address_of_current_frame != NULL) {
        TyObject* frame_info = NULL;
        uintptr_t address_of_code_object;
        int res = parse_frame_object(
            unwinder,
            &frame_info,
            address_of_current_frame,
            &address_of_code_object,
            &address_of_current_frame
        );

        if (res < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Async frame object parsing failed in chain");
            return -1;
        }

        if (!frame_info) {
            continue;
        }

        if (TyList_Append(calls, frame_info) == -1) {
            Ty_DECREF(frame_info);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append frame info to async chain");
            return -1;
        }

        Ty_DECREF(frame_info);

        if (address_of_code_object == running_task_code_obj) {
            break;
        }
    }

    return 0;
}

/* ============================================================================
 * AWAITED BY PARSING FUNCTIONS
 * ============================================================================ */

static int
append_awaited_by_for_thread(
    RemoteUnwinderObject *unwinder,
    uintptr_t head_addr,
    TyObject *result
) {
    char task_node[SIZEOF_LLIST_NODE];

    if (_Ty_RemoteDebug_PagedReadRemoteMemory(&unwinder->handle, head_addr,
                                              sizeof(task_node), task_node) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read task node head");
        return -1;
    }

    size_t iteration_count = 0;
    const size_t MAX_ITERATIONS = 2 << 15;  // A reasonable upper bound

    while (GET_MEMBER(uintptr_t, task_node, unwinder->debug_offsets.llist_node.next) != head_addr) {
        if (++iteration_count > MAX_ITERATIONS) {
            TyErr_SetString(TyExc_RuntimeError, "Task list appears corrupted");
            set_exception_cause(unwinder, TyExc_RuntimeError, "Task list iteration limit exceeded");
            return -1;
        }

        if (GET_MEMBER(uintptr_t, task_node, unwinder->debug_offsets.llist_node.next) == 0) {
            TyErr_SetString(TyExc_RuntimeError,
                           "Invalid linked list structure reading remote memory");
            set_exception_cause(unwinder, TyExc_RuntimeError, "NULL pointer in task linked list");
            return -1;
        }

        uintptr_t task_addr = (uintptr_t)GET_MEMBER(uintptr_t, task_node, unwinder->debug_offsets.llist_node.next)
            - unwinder->async_debug_offsets.asyncio_task_object.task_node;

        if (process_single_task_node(unwinder, task_addr, NULL, result) < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to process task node in awaited_by");
            return -1;
        }

        // Read next node
        if (_Ty_RemoteDebug_PagedReadRemoteMemory(
                &unwinder->handle,
                (uintptr_t)GET_MEMBER(uintptr_t, task_node, unwinder->debug_offsets.llist_node.next),
                sizeof(task_node),
                task_node) < 0) {
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read next task node in awaited_by");
            return -1;
        }
    }

    return 0;
}

static int
append_awaited_by(
    RemoteUnwinderObject *unwinder,
    unsigned long tid,
    uintptr_t head_addr,
    TyObject *result)
{
    TyObject *tid_py = TyLong_FromUnsignedLong(tid);
    if (tid_py == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create thread ID object");
        return -1;
    }

    TyObject* awaited_by_for_thread = TyList_New(0);
    if (awaited_by_for_thread == NULL) {
        Ty_DECREF(tid_py);
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create awaited_by thread list");
        return -1;
    }

    RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
    TyObject *result_item = TyStructSequence_New(state->AwaitedInfo_Type);
    if (result_item == NULL) {
        Ty_DECREF(tid_py);
        Ty_DECREF(awaited_by_for_thread);
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create AwaitedInfo");
        return -1;
    }

    TyStructSequence_SetItem(result_item, 0, tid_py);  // steals ref
    TyStructSequence_SetItem(result_item, 1, awaited_by_for_thread);  // steals ref
    if (TyList_Append(result, result_item)) {
        Ty_DECREF(result_item);
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append awaited_by result item");
        return -1;
    }
    Ty_DECREF(result_item);

    if (append_awaited_by_for_thread(unwinder, head_addr, awaited_by_for_thread))
    {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append awaited_by for thread");
        return -1;
    }

    return 0;
}

/* ============================================================================
 * STACK UNWINDING FUNCTIONS
 * ============================================================================ */

static int
process_frame_chain(
    RemoteUnwinderObject *unwinder,
    uintptr_t initial_frame_addr,
    StackChunkList *chunks,
    TyObject *frame_info
) {
    uintptr_t frame_addr = initial_frame_addr;
    uintptr_t prev_frame_addr = 0;
    const size_t MAX_FRAMES = 1024;
    size_t frame_count = 0;

    while ((void*)frame_addr != NULL) {
        TyObject *frame = NULL;
        uintptr_t next_frame_addr = 0;

        if (++frame_count > MAX_FRAMES) {
            TyErr_SetString(TyExc_RuntimeError, "Too many stack frames (possible infinite loop)");
            set_exception_cause(unwinder, TyExc_RuntimeError, "Frame chain iteration limit exceeded");
            return -1;
        }

        // Try chunks first, fallback to direct memory read
        if (parse_frame_from_chunks(unwinder, &frame, frame_addr, &next_frame_addr, chunks) < 0) {
            TyErr_Clear();
            uintptr_t address_of_code_object = 0;
            if (parse_frame_object(unwinder, &frame, frame_addr, &address_of_code_object ,&next_frame_addr) < 0) {
                set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to parse frame object in chain");
                return -1;
            }
        }

        if (!frame) {
            break;
        }

        if (prev_frame_addr && frame_addr != prev_frame_addr) {
            TyErr_Format(TyExc_RuntimeError,
                        "Broken frame chain: expected frame at 0x%lx, got 0x%lx",
                        prev_frame_addr, frame_addr);
            Ty_DECREF(frame);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Frame chain consistency check failed");
            return -1;
        }

        if (TyList_Append(frame_info, frame) == -1) {
            Ty_DECREF(frame);
            set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to append frame to frame info list");
            return -1;
        }
        Ty_DECREF(frame);

        prev_frame_addr = next_frame_addr;
        frame_addr = next_frame_addr;
    }

    return 0;
}

static TyObject*
unwind_stack_for_thread(
    RemoteUnwinderObject *unwinder,
    uintptr_t *current_tstate
) {
    TyObject *frame_info = NULL;
    TyObject *thread_id = NULL;
    TyObject *result = NULL;
    StackChunkList chunks = {0};

    char ts[SIZEOF_THREAD_STATE];
    int bytes_read = _Ty_RemoteDebug_PagedReadRemoteMemory(
        &unwinder->handle, *current_tstate, unwinder->debug_offsets.thread_state.size, ts);
    if (bytes_read < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to read thread state");
        goto error;
    }

    uintptr_t frame_addr = GET_MEMBER(uintptr_t, ts, unwinder->debug_offsets.thread_state.current_frame);

    frame_info = TyList_New(0);
    if (!frame_info) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create frame info list");
        goto error;
    }

    if (copy_stack_chunks(unwinder, *current_tstate, &chunks) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to copy stack chunks");
        goto error;
    }

    if (process_frame_chain(unwinder, frame_addr, &chunks, frame_info) < 0) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to process frame chain");
        goto error;
    }

    *current_tstate = GET_MEMBER(uintptr_t, ts, unwinder->debug_offsets.thread_state.next);

    thread_id = TyLong_FromLongLong(
        GET_MEMBER(long, ts, unwinder->debug_offsets.thread_state.native_thread_id));
    if (thread_id == NULL) {
        set_exception_cause(unwinder, TyExc_RuntimeError, "Failed to create thread ID");
        goto error;
    }

    RemoteDebuggingState *state = RemoteDebugging_GetStateFromObject((TyObject*)unwinder);
    result = TyStructSequence_New(state->ThreadInfo_Type);
    if (result == NULL) {
        set_exception_cause(unwinder, TyExc_MemoryError, "Failed to create ThreadInfo");
        goto error;
    }

    TyStructSequence_SetItem(result, 0, thread_id);  // Steals reference
    TyStructSequence_SetItem(result, 1, frame_info); // Steals reference

    cleanup_stack_chunks(&chunks);
    return result;

error:
    Ty_XDECREF(frame_info);
    Ty_XDECREF(thread_id);
    Ty_XDECREF(result);
    cleanup_stack_chunks(&chunks);
    return NULL;
}


/* ============================================================================
 * REMOTEUNWINDER CLASS IMPLEMENTATION
 * ============================================================================ */

/*[clinic input]
class _remote_debugging.RemoteUnwinder "RemoteUnwinderObject *" "&RemoteUnwinder_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=55f164d8803318be]*/

/*[clinic input]
_remote_debugging.RemoteUnwinder.__init__
    pid: int
    *
    all_threads: bool = False
    only_active_thread: bool = False
    debug: bool = False

Initialize a new RemoteUnwinder object for debugging a remote Python process.

Args:
    pid: Process ID of the target Python process to debug
    all_threads: If True, initialize state for all threads in the process.
                If False, only initialize for the main thread.
    only_active_thread: If True, only sample the thread holding the GIL.
                       Cannot be used together with all_threads=True.
    debug: If True, chain exceptions to explain the sequence of events that
           lead to the exception.

The RemoteUnwinder provides functionality to inspect and debug a running Python
process, including examining thread states, stack frames and other runtime data.

Raises:
    PermissionError: If access to the target process is denied
    OSError: If unable to attach to the target process or access its memory
    RuntimeError: If unable to read debug information from the target process
    ValueError: If both all_threads and only_active_thread are True
[clinic start generated code]*/

static int
_remote_debugging_RemoteUnwinder___init___impl(RemoteUnwinderObject *self,
                                               int pid, int all_threads,
                                               int only_active_thread,
                                               int debug)
/*[clinic end generated code: output=13ba77598ecdcbe1 input=8f8f12504e17da04]*/
{
    // Validate that all_threads and only_active_thread are not both True
    if (all_threads && only_active_thread) {
        TyErr_SetString(TyExc_ValueError,
                       "all_threads and only_active_thread cannot both be True");
        return -1;
    }

#ifdef Ty_GIL_DISABLED
    if (only_active_thread) {
        TyErr_SetString(TyExc_ValueError,
                       "only_active_thread is not supported when Ty_GIL_DISABLED is not defined");
        return -1;
    }
#endif

    self->debug = debug;
    self->only_active_thread = only_active_thread;
    self->cached_state = NULL;
    if (_Ty_RemoteDebug_InitProcHandle(&self->handle, pid) < 0) {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to initialize process handle");
        return -1;
    }

    self->runtime_start_address = _Ty_RemoteDebug_GetPyRuntimeAddress(&self->handle);
    if (self->runtime_start_address == 0) {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to get Python runtime address");
        return -1;
    }

    if (_Ty_RemoteDebug_ReadDebugOffsets(&self->handle,
                                         &self->runtime_start_address,
                                         &self->debug_offsets) < 0)
    {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to read debug offsets");
        return -1;
    }

    // Validate that the debug offsets are valid
    if(validate_debug_offsets(&self->debug_offsets) == -1) {
        set_exception_cause(self, TyExc_RuntimeError, "Invalid debug offsets found");
        return -1;
    }

    // Try to read async debug offsets, but don't fail if they're not available
    self->async_debug_offsets_available = 1;
    if (read_async_debug(self) < 0) {
        TyErr_Clear();
        memset(&self->async_debug_offsets, 0, sizeof(self->async_debug_offsets));
        self->async_debug_offsets_available = 0;
    }

    if (populate_initial_state_data(all_threads, self, self->runtime_start_address,
                    &self->interpreter_addr ,&self->tstate_addr) < 0)
    {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to populate initial state data");
        return -1;
    }

    self->code_object_cache = _Ty_hashtable_new_full(
        _Ty_hashtable_hash_ptr,
        _Ty_hashtable_compare_direct,
        NULL,  // keys are stable pointers, don't destroy
        cached_code_metadata_destroy,
        NULL
    );
    if (self->code_object_cache == NULL) {
        TyErr_NoMemory();
        set_exception_cause(self, TyExc_MemoryError, "Failed to create code object cache");
        return -1;
    }

#ifdef Ty_GIL_DISABLED
    // Initialize TLBC cache
    self->tlbc_generation = 0;
    self->tlbc_cache = _Ty_hashtable_new_full(
        _Ty_hashtable_hash_ptr,
        _Ty_hashtable_compare_direct,
        NULL,  // keys are stable pointers, don't destroy
        tlbc_cache_entry_destroy,
        NULL
    );
    if (self->tlbc_cache == NULL) {
        _Ty_hashtable_destroy(self->code_object_cache);
        TyErr_NoMemory();
        set_exception_cause(self, TyExc_MemoryError, "Failed to create TLBC cache");
        return -1;
    }
#endif

    return 0;
}

/*[clinic input]
@critical_section
_remote_debugging.RemoteUnwinder.get_stack_trace

Returns a list of stack traces for threads in the target process.

Each element in the returned list is a tuple of (thread_id, frame_list), where:
- thread_id is the OS thread identifier
- frame_list is a list of tuples (function_name, filename, line_number) representing
  the Python stack frames for that thread, ordered from most recent to oldest

The threads returned depend on the initialization parameters:
- If only_active_thread was True: returns only the thread holding the GIL
- If all_threads was True: returns all threads
- Otherwise: returns only the main thread

Example:
    [
        (1234, [
            ('process_data', 'worker.py', 127),
            ('run_worker', 'worker.py', 45),
            ('main', 'app.py', 23)
        ]),
        (1235, [
            ('handle_request', 'server.py', 89),
            ('serve_forever', 'server.py', 52)
        ])
    ]

Raises:
    RuntimeError: If there is an error copying memory from the target process
    OSError: If there is an error accessing the target process
    PermissionError: If access to the target process is denied
    UnicodeDecodeError: If there is an error decoding strings from the target process

[clinic start generated code]*/

static TyObject *
_remote_debugging_RemoteUnwinder_get_stack_trace_impl(RemoteUnwinderObject *self)
/*[clinic end generated code: output=666192b90c69d567 input=f756f341206f9116]*/
{
    TyObject* result = NULL;
    // Read interpreter state into opaque buffer
    char interp_state_buffer[INTERP_STATE_BUFFER_SIZE];
    if (_Ty_RemoteDebug_PagedReadRemoteMemory(
            &self->handle,
            self->interpreter_addr,
            INTERP_STATE_BUFFER_SIZE,
            interp_state_buffer) < 0) {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to read interpreter state buffer");
        goto exit;
    }

    // Get code object generation from buffer
    uint64_t code_object_generation = GET_MEMBER(uint64_t, interp_state_buffer,
            self->debug_offsets.interpreter_state.code_object_generation);

    if (code_object_generation != self->code_object_generation) {
        self->code_object_generation = code_object_generation;
        _Ty_hashtable_clear(self->code_object_cache);
    }

    // If only_active_thread is true, we need to determine which thread holds the GIL
    TyThreadState* gil_holder = NULL;
    if (self->only_active_thread) {
        // The GIL state is already in interp_state_buffer, just read from there
        // Check if GIL is locked
        int gil_locked = GET_MEMBER(int, interp_state_buffer,
            self->debug_offsets.interpreter_state.gil_runtime_state_locked);

        if (gil_locked) {
            // Get the last holder (current holder when GIL is locked)
            gil_holder = GET_MEMBER(TyThreadState*, interp_state_buffer,
                self->debug_offsets.interpreter_state.gil_runtime_state_holder);
        } else {
            // GIL is not locked, return empty list
            result = TyList_New(0);
            if (!result) {
                set_exception_cause(self, TyExc_MemoryError, "Failed to create empty result list");
            }
            goto exit;
        }
    }

#ifdef Ty_GIL_DISABLED
    // Check TLBC generation and invalidate cache if needed
    uint32_t current_tlbc_generation = GET_MEMBER(uint32_t, interp_state_buffer,
                                                  self->debug_offsets.interpreter_state.tlbc_generation);
    if (current_tlbc_generation != self->tlbc_generation) {
        self->tlbc_generation = current_tlbc_generation;
        _Ty_hashtable_clear(self->tlbc_cache);
    }
#endif

    uintptr_t current_tstate;
    if (self->only_active_thread && gil_holder != NULL) {
        // We have the GIL holder, process only that thread
        current_tstate = (uintptr_t)gil_holder;
    } else if (self->tstate_addr == 0) {
        // Get threads head from buffer
        current_tstate = GET_MEMBER(uintptr_t, interp_state_buffer,
                self->debug_offsets.interpreter_state.threads_head);
    } else {
        current_tstate = self->tstate_addr;
    }

    result = TyList_New(0);
    if (!result) {
        set_exception_cause(self, TyExc_MemoryError, "Failed to create stack trace result list");
        goto exit;
    }

    while (current_tstate != 0) {
        TyObject* frame_info = unwind_stack_for_thread(self, &current_tstate);
        if (!frame_info) {
            Ty_CLEAR(result);
            set_exception_cause(self, TyExc_RuntimeError, "Failed to unwind stack for thread");
            goto exit;
        }

        if (TyList_Append(result, frame_info) == -1) {
            Ty_DECREF(frame_info);
            Ty_CLEAR(result);
            set_exception_cause(self, TyExc_RuntimeError, "Failed to append thread frame info");
            goto exit;
        }
        Ty_DECREF(frame_info);

        // We are targeting a single tstate, break here
        if (self->tstate_addr) {
            break;
        }

        // If we're only processing the GIL holder, we're done after one iteration
        if (self->only_active_thread && gil_holder != NULL) {
            break;
        }
    }

exit:
   _Ty_RemoteDebug_ClearCache(&self->handle);
    return result;
}

/*[clinic input]
@critical_section
_remote_debugging.RemoteUnwinder.get_all_awaited_by

Get all tasks and their awaited_by relationships from the remote process.

This provides a tree structure showing which tasks are waiting for other tasks.

For each task, returns:
1. The call stack frames leading to where the task is currently executing
2. The name of the task
3. A list of tasks that this task is waiting for, with their own frames/names/etc

Returns a list of [frames, task_name, subtasks] where:
- frames: List of (func_name, filename, lineno) showing the call stack
- task_name: String identifier for the task
- subtasks: List of tasks being awaited by this task, in same format

Raises:
    RuntimeError: If AsyncioDebug section is not available in the remote process
    MemoryError: If memory allocation fails
    OSError: If reading from the remote process fails

Example output:
[
    # Task c2_root waiting for two subtasks
    [
        # Call stack of c2_root
        [("c5", "script.py", 10), ("c4", "script.py", 14)],
        "c2_root",
        [
            # First subtask (sub_main_2) and what it's waiting for
            [
                [("c1", "script.py", 23)],
                "sub_main_2",
                [...]
            ],
            # Second subtask and its waiters
            [...]
        ]
    ]
]
[clinic start generated code]*/

static TyObject *
_remote_debugging_RemoteUnwinder_get_all_awaited_by_impl(RemoteUnwinderObject *self)
/*[clinic end generated code: output=6a49cd345e8aec53 input=a452c652bb00701a]*/
{
    if (!self->async_debug_offsets_available) {
        TyErr_SetString(TyExc_RuntimeError, "AsyncioDebug section not available");
        set_exception_cause(self, TyExc_RuntimeError, "AsyncioDebug section unavailable in get_all_awaited_by");
        return NULL;
    }

    TyObject *result = TyList_New(0);
    if (result == NULL) {
        set_exception_cause(self, TyExc_MemoryError, "Failed to create awaited_by result list");
        goto result_err;
    }

    // Process all threads
    if (iterate_threads(self, process_thread_for_awaited_by, result) < 0) {
        goto result_err;
    }

    uintptr_t head_addr = self->interpreter_addr
        + self->async_debug_offsets.asyncio_interpreter_state.asyncio_tasks_head;

    // On top of a per-thread task lists used by default by asyncio to avoid
    // contention, there is also a fallback per-interpreter list of tasks;
    // any tasks still pending when a thread is destroyed will be moved to the
    // per-interpreter task list.  It's unlikely we'll find anything here, but
    // interesting for debugging.
    if (append_awaited_by(self, 0, head_addr, result))
    {
        set_exception_cause(self, TyExc_RuntimeError, "Failed to append interpreter awaited_by in get_all_awaited_by");
        goto result_err;
    }

    _Ty_RemoteDebug_ClearCache(&self->handle);
    return result;

result_err:
    _Ty_RemoteDebug_ClearCache(&self->handle);
    Ty_XDECREF(result);
    return NULL;
}

/*[clinic input]
@critical_section
_remote_debugging.RemoteUnwinder.get_async_stack_trace

Get the currently running async tasks and their dependency graphs from the remote process.

This returns information about running tasks and all tasks that are waiting for them,
forming a complete dependency graph for each thread's active task.

For each thread with a running task, returns the running task plus all tasks that
transitively depend on it (tasks waiting for the running task, tasks waiting for
those tasks, etc.).

Returns a list of per-thread results, where each thread result contains:
- Thread ID
- List of task information for the running task and all its waiters

Each task info contains:
- Task ID (memory address)
- Task name
- Call stack frames: List of (func_name, filename, lineno)
- List of tasks waiting for this task (recursive structure)

Raises:
    RuntimeError: If AsyncioDebug section is not available in the target process
    MemoryError: If memory allocation fails
    OSError: If reading from the remote process fails

Example output (similar structure to get_all_awaited_by but only for running tasks):
[
    # Thread 140234 results
    (140234, [
        # Running task and its complete waiter dependency graph
        (4345585712, 'main_task',
         [("run_server", "server.py", 127), ("main", "app.py", 23)],
         [
             # Tasks waiting for main_task
             (4345585800, 'worker_1', [...], [...]),
             (4345585900, 'worker_2', [...], [...])
         ])
    ])
]

[clinic start generated code]*/

static TyObject *
_remote_debugging_RemoteUnwinder_get_async_stack_trace_impl(RemoteUnwinderObject *self)
/*[clinic end generated code: output=6433d52b55e87bbe input=8744b47c9ec2220a]*/
{
    if (!self->async_debug_offsets_available) {
        TyErr_SetString(TyExc_RuntimeError, "AsyncioDebug section not available");
        set_exception_cause(self, TyExc_RuntimeError, "AsyncioDebug section unavailable in get_async_stack_trace");
        return NULL;
    }

    TyObject *result = TyList_New(0);
    if (result == NULL) {
        set_exception_cause(self, TyExc_MemoryError, "Failed to create result list in get_async_stack_trace");
        return NULL;
    }

    // Process all threads
    if (iterate_threads(self, process_thread_for_async_stack_trace, result) < 0) {
        goto result_err;
    }

    _Ty_RemoteDebug_ClearCache(&self->handle);
    return result;
result_err:
    _Ty_RemoteDebug_ClearCache(&self->handle);
    Ty_XDECREF(result);
    return NULL;
}

static TyMethodDef RemoteUnwinder_methods[] = {
    _REMOTE_DEBUGGING_REMOTEUNWINDER_GET_STACK_TRACE_METHODDEF
    _REMOTE_DEBUGGING_REMOTEUNWINDER_GET_ALL_AWAITED_BY_METHODDEF
    _REMOTE_DEBUGGING_REMOTEUNWINDER_GET_ASYNC_STACK_TRACE_METHODDEF
    {NULL, NULL}
};

static void
RemoteUnwinder_dealloc(TyObject *op)
{
    RemoteUnwinderObject *self = RemoteUnwinder_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    if (self->code_object_cache) {
        _Ty_hashtable_destroy(self->code_object_cache);
    }
#ifdef Ty_GIL_DISABLED
    if (self->tlbc_cache) {
        _Ty_hashtable_destroy(self->tlbc_cache);
    }
#endif
    if (self->handle.pid != 0) {
        _Ty_RemoteDebug_ClearCache(&self->handle);
        _Ty_RemoteDebug_CleanupProcHandle(&self->handle);
    }
    PyObject_Del(self);
    Ty_DECREF(tp);
}

static TyType_Slot RemoteUnwinder_slots[] = {
    {Ty_tp_doc, (void *)"RemoteUnwinder(pid): Inspect stack of a remote Python process."},
    {Ty_tp_methods, RemoteUnwinder_methods},
    {Ty_tp_init, _remote_debugging_RemoteUnwinder___init__},
    {Ty_tp_dealloc, RemoteUnwinder_dealloc},
    {0, NULL}
};

static TyType_Spec RemoteUnwinder_spec = {
    .name = "_remote_debugging.RemoteUnwinder",
    .basicsize = sizeof(RemoteUnwinderObject),
    .flags = Ty_TPFLAGS_DEFAULT,
    .slots = RemoteUnwinder_slots,
};

/* ============================================================================
 * MODULE INITIALIZATION
 * ============================================================================ */

static int
_remote_debugging_exec(TyObject *m)
{
    RemoteDebuggingState *st = RemoteDebugging_GetState(m);
#define CREATE_TYPE(mod, type, spec)                                        \
    do {                                                                    \
        type = (TyTypeObject *)TyType_FromMetaclass(NULL, mod, spec, NULL); \
        if (type == NULL) {                                                 \
            return -1;                                                      \
        }                                                                   \
    } while (0)

    CREATE_TYPE(m, st->RemoteDebugging_Type, &RemoteUnwinder_spec);

    if (TyModule_AddType(m, st->RemoteDebugging_Type) < 0) {
        return -1;
    }

    // Initialize structseq types
    st->TaskInfo_Type = TyStructSequence_NewType(&TaskInfo_desc);
    if (st->TaskInfo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, st->TaskInfo_Type) < 0) {
        return -1;
    }

    st->FrameInfo_Type = TyStructSequence_NewType(&FrameInfo_desc);
    if (st->FrameInfo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, st->FrameInfo_Type) < 0) {
        return -1;
    }

    st->CoroInfo_Type = TyStructSequence_NewType(&CoroInfo_desc);
    if (st->CoroInfo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, st->CoroInfo_Type) < 0) {
        return -1;
    }

    st->ThreadInfo_Type = TyStructSequence_NewType(&ThreadInfo_desc);
    if (st->ThreadInfo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, st->ThreadInfo_Type) < 0) {
        return -1;
    }

    st->AwaitedInfo_Type = TyStructSequence_NewType(&AwaitedInfo_desc);
    if (st->AwaitedInfo_Type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, st->AwaitedInfo_Type) < 0) {
        return -1;
    }
#ifdef Ty_GIL_DISABLED
    PyUnstable_Module_SetGIL(m, Ty_MOD_GIL_NOT_USED);
#endif
    int rc = TyModule_AddIntConstant(m, "PROCESS_VM_READV_SUPPORTED", HAVE_PROCESS_VM_READV);
    if (rc < 0) {
        return -1;
    }
    if (RemoteDebugging_InitState(st) < 0) {
        return -1;
    }
    return 0;
}

static int
remote_debugging_traverse(TyObject *mod, visitproc visit, void *arg)
{
    RemoteDebuggingState *state = RemoteDebugging_GetState(mod);
    Ty_VISIT(state->RemoteDebugging_Type);
    Ty_VISIT(state->TaskInfo_Type);
    Ty_VISIT(state->FrameInfo_Type);
    Ty_VISIT(state->CoroInfo_Type);
    Ty_VISIT(state->ThreadInfo_Type);
    Ty_VISIT(state->AwaitedInfo_Type);
    return 0;
}

static int
remote_debugging_clear(TyObject *mod)
{
    RemoteDebuggingState *state = RemoteDebugging_GetState(mod);
    Ty_CLEAR(state->RemoteDebugging_Type);
    Ty_CLEAR(state->TaskInfo_Type);
    Ty_CLEAR(state->FrameInfo_Type);
    Ty_CLEAR(state->CoroInfo_Type);
    Ty_CLEAR(state->ThreadInfo_Type);
    Ty_CLEAR(state->AwaitedInfo_Type);
    return 0;
}

static void
remote_debugging_free(void *mod)
{
    (void)remote_debugging_clear((TyObject *)mod);
}

static PyModuleDef_Slot remote_debugging_slots[] = {
    {Ty_mod_exec, _remote_debugging_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static TyMethodDef remote_debugging_methods[] = {
    {NULL, NULL, 0, NULL},
};

static struct TyModuleDef remote_debugging_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_remote_debugging",
    .m_size = sizeof(RemoteDebuggingState),
    .m_methods = remote_debugging_methods,
    .m_slots = remote_debugging_slots,
    .m_traverse = remote_debugging_traverse,
    .m_clear = remote_debugging_clear,
    .m_free = remote_debugging_free,
};

PyMODINIT_FUNC
PyInit__remote_debugging(void)
{
    return PyModuleDef_Init(&remote_debugging_module);
}
