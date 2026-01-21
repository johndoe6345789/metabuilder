#ifndef Ty_INTERNAL_DEBUG_OFFSETS_H
#define Ty_INTERNAL_DEBUG_OFFSETS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


#define _Ty_Debug_Cookie "xdebugpy"

#if defined(__APPLE__)
#  include <mach-o/loader.h>
#endif

// Macros to burn global values in custom sections so out-of-process
// profilers can locate them easily.
#define GENERATE_DEBUG_SECTION(name, declaration)     \
   _GENERATE_DEBUG_SECTION_WINDOWS(name)            \
   _GENERATE_DEBUG_SECTION_APPLE(name)              \
   declaration                                      \
   _GENERATE_DEBUG_SECTION_LINUX(name)

// Please note that section names are truncated to eight bytes
// on Windows!
#if defined(MS_WINDOWS)
#define _GENERATE_DEBUG_SECTION_WINDOWS(name)                       \
   _Pragma(Ty_STRINGIFY(section(Ty_STRINGIFY(name), read, write))) \
   __declspec(allocate(Ty_STRINGIFY(name)))
#else
#define _GENERATE_DEBUG_SECTION_WINDOWS(name)
#endif

#if defined(__APPLE__)
#define _GENERATE_DEBUG_SECTION_APPLE(name) \
   __attribute__((section(SEG_DATA "," Ty_STRINGIFY(name))))      \
   __attribute__((used))
#else
#define _GENERATE_DEBUG_SECTION_APPLE(name)
#endif

#if defined(__linux__) && (defined(__GNUC__) || defined(__clang__))
#define _GENERATE_DEBUG_SECTION_LINUX(name) \
   __attribute__((section("." Ty_STRINGIFY(name))))               \
   __attribute__((used))
#else
#define _GENERATE_DEBUG_SECTION_LINUX(name)
#endif

#ifdef Ty_GIL_DISABLED
# define _Ty_Debug_gilruntimestate_enabled offsetof(struct _gil_runtime_state, enabled)
# define _Ty_Debug_Free_Threaded 1
# define _Ty_Debug_code_object_co_tlbc offsetof(PyCodeObject, co_tlbc)
# define _Ty_Debug_interpreter_frame_tlbc_index offsetof(_PyInterpreterFrame, tlbc_index)
# define _Ty_Debug_interpreter_state_tlbc_generation offsetof(TyInterpreterState, tlbc_indices.tlbc_generation)
#else
# define _Ty_Debug_gilruntimestate_enabled 0
# define _Ty_Debug_Free_Threaded 0
# define _Ty_Debug_code_object_co_tlbc 0
# define _Ty_Debug_interpreter_frame_tlbc_index 0
# define _Ty_Debug_interpreter_state_tlbc_generation 0
#endif


typedef struct _Ty_DebugOffsets {
    char cookie[8] _Ty_NONSTRING;
    uint64_t version;
    uint64_t free_threaded;
    // Runtime state offset;
    struct _runtime_state {
        uint64_t size;
        uint64_t finalizing;
        uint64_t interpreters_head;
    } runtime_state;

    // Interpreter state offset;
    struct _interpreter_state {
        uint64_t size;
        uint64_t id;
        uint64_t next;
        uint64_t threads_head;
        uint64_t threads_main;
        uint64_t gc;
        uint64_t imports_modules;
        uint64_t sysdict;
        uint64_t builtins;
        uint64_t ceval_gil;
        uint64_t gil_runtime_state;
        uint64_t gil_runtime_state_enabled;
        uint64_t gil_runtime_state_locked;
        uint64_t gil_runtime_state_holder;
        uint64_t code_object_generation;
        uint64_t tlbc_generation;
    } interpreter_state;

    // Thread state offset;
    struct _thread_state{
        uint64_t size;
        uint64_t prev;
        uint64_t next;
        uint64_t interp;
        uint64_t current_frame;
        uint64_t thread_id;
        uint64_t native_thread_id;
        uint64_t datastack_chunk;
        uint64_t status;
    } thread_state;

    // InterpreterFrame offset;
    struct _interpreter_frame {
        uint64_t size;
        uint64_t previous;
        uint64_t executable;
        uint64_t instr_ptr;
        uint64_t localsplus;
        uint64_t owner;
        uint64_t stackpointer;
        uint64_t tlbc_index;
    } interpreter_frame;

    // Code object offset;
    struct _code_object {
        uint64_t size;
        uint64_t filename;
        uint64_t name;
        uint64_t qualname;
        uint64_t linetable;
        uint64_t firstlineno;
        uint64_t argcount;
        uint64_t localsplusnames;
        uint64_t localspluskinds;
        uint64_t co_code_adaptive;
        uint64_t co_tlbc;
    } code_object;

    // TyObject offset;
    struct _pyobject {
        uint64_t size;
        uint64_t ob_type;
    } pyobject;

    // TyTypeObject object offset;
    struct _type_object {
        uint64_t size;
        uint64_t tp_name;
        uint64_t tp_repr;
        uint64_t tp_flags;
    } type_object;

    // PyTuple object offset;
    struct _tuple_object {
        uint64_t size;
        uint64_t ob_item;
        uint64_t ob_size;
    } tuple_object;

    // PyList object offset;
    struct _list_object {
        uint64_t size;
        uint64_t ob_item;
        uint64_t ob_size;
    } list_object;

    // PySet object offset;
    struct _set_object {
        uint64_t size;
        uint64_t used;
        uint64_t table;
        uint64_t mask;
    } set_object;

    // PyDict object offset;
    struct _dict_object {
        uint64_t size;
        uint64_t ma_keys;
        uint64_t ma_values;
    } dict_object;

    // PyFloat object offset;
    struct _float_object {
        uint64_t size;
        uint64_t ob_fval;
    } float_object;

    // PyLong object offset;
    struct _long_object {
        uint64_t size;
        uint64_t lv_tag;
        uint64_t ob_digit;
    } long_object;

    // PyBytes object offset;
    struct _bytes_object {
        uint64_t size;
        uint64_t ob_size;
        uint64_t ob_sval;
    } bytes_object;

    // Unicode object offset;
    struct _unicode_object {
        uint64_t size;
        uint64_t state;
        uint64_t length;
        uint64_t asciiobject_size;
    } unicode_object;

    // GC runtime state offset;
    struct _gc {
        uint64_t size;
        uint64_t collecting;
    } gc;

    // Generator object offset;
    struct _gen_object {
        uint64_t size;
        uint64_t gi_name;
        uint64_t gi_iframe;
        uint64_t gi_frame_state;
    } gen_object;

    struct _llist_node {
        uint64_t next;
        uint64_t prev;
    } llist_node;

    struct _debugger_support {
        uint64_t eval_breaker;
        uint64_t remote_debugger_support;
        uint64_t remote_debugging_enabled;
        uint64_t debugger_pending_call;
        uint64_t debugger_script_path;
        uint64_t debugger_script_path_size;
    } debugger_support;
} _Ty_DebugOffsets;


#define _Ty_DebugOffsets_INIT(debug_cookie) { \
    .cookie = debug_cookie, \
    .version = PY_VERSION_HEX, \
    .free_threaded = _Ty_Debug_Free_Threaded, \
    .runtime_state = { \
        .size = sizeof(_PyRuntimeState), \
        .finalizing = offsetof(_PyRuntimeState, _finalizing), \
        .interpreters_head = offsetof(_PyRuntimeState, interpreters.head), \
    }, \
    .interpreter_state = { \
        .size = sizeof(TyInterpreterState), \
        .id = offsetof(TyInterpreterState, id), \
        .next = offsetof(TyInterpreterState, next), \
        .threads_head = offsetof(TyInterpreterState, threads.head), \
        .threads_main = offsetof(TyInterpreterState, threads.main), \
        .gc = offsetof(TyInterpreterState, gc), \
        .imports_modules = offsetof(TyInterpreterState, imports.modules), \
        .sysdict = offsetof(TyInterpreterState, sysdict), \
        .builtins = offsetof(TyInterpreterState, builtins), \
        .ceval_gil = offsetof(TyInterpreterState, ceval.gil), \
        .gil_runtime_state = offsetof(TyInterpreterState, _gil), \
        .gil_runtime_state_enabled = _Ty_Debug_gilruntimestate_enabled, \
        .gil_runtime_state_locked = offsetof(TyInterpreterState, _gil.locked), \
        .gil_runtime_state_holder = offsetof(TyInterpreterState, _gil.last_holder), \
        .code_object_generation = offsetof(TyInterpreterState, _code_object_generation), \
        .tlbc_generation = _Ty_Debug_interpreter_state_tlbc_generation, \
    }, \
    .thread_state = { \
        .size = sizeof(TyThreadState), \
        .prev = offsetof(TyThreadState, prev), \
        .next = offsetof(TyThreadState, next), \
        .interp = offsetof(TyThreadState, interp), \
        .current_frame = offsetof(TyThreadState, current_frame), \
        .thread_id = offsetof(TyThreadState, thread_id), \
        .native_thread_id = offsetof(TyThreadState, native_thread_id), \
        .datastack_chunk = offsetof(TyThreadState, datastack_chunk), \
        .status = offsetof(TyThreadState, _status), \
    }, \
    .interpreter_frame = { \
        .size = sizeof(_PyInterpreterFrame), \
        .previous = offsetof(_PyInterpreterFrame, previous), \
        .executable = offsetof(_PyInterpreterFrame, f_executable), \
        .instr_ptr = offsetof(_PyInterpreterFrame, instr_ptr), \
        .localsplus = offsetof(_PyInterpreterFrame, localsplus), \
        .owner = offsetof(_PyInterpreterFrame, owner), \
        .stackpointer = offsetof(_PyInterpreterFrame, stackpointer), \
        .tlbc_index = _Ty_Debug_interpreter_frame_tlbc_index, \
    }, \
    .code_object = { \
        .size = sizeof(PyCodeObject), \
        .filename = offsetof(PyCodeObject, co_filename), \
        .name = offsetof(PyCodeObject, co_name), \
        .qualname = offsetof(PyCodeObject, co_qualname), \
        .linetable = offsetof(PyCodeObject, co_linetable), \
        .firstlineno = offsetof(PyCodeObject, co_firstlineno), \
        .argcount = offsetof(PyCodeObject, co_argcount), \
        .localsplusnames = offsetof(PyCodeObject, co_localsplusnames), \
        .localspluskinds = offsetof(PyCodeObject, co_localspluskinds), \
        .co_code_adaptive = offsetof(PyCodeObject, co_code_adaptive), \
        .co_tlbc = _Ty_Debug_code_object_co_tlbc, \
    }, \
    .pyobject = { \
        .size = sizeof(TyObject), \
        .ob_type = offsetof(TyObject, ob_type), \
    }, \
    .type_object = { \
        .size = sizeof(TyTypeObject), \
        .tp_name = offsetof(TyTypeObject, tp_name), \
        .tp_repr = offsetof(TyTypeObject, tp_repr), \
        .tp_flags = offsetof(TyTypeObject, tp_flags), \
    }, \
    .tuple_object = { \
        .size = sizeof(PyTupleObject), \
        .ob_item = offsetof(PyTupleObject, ob_item), \
        .ob_size = offsetof(PyTupleObject, ob_base.ob_size), \
    }, \
    .list_object = { \
        .size = sizeof(PyListObject), \
        .ob_item = offsetof(PyListObject, ob_item), \
        .ob_size = offsetof(PyListObject, ob_base.ob_size), \
    }, \
    .set_object = { \
        .size = sizeof(PySetObject), \
        .used = offsetof(PySetObject, used), \
        .table = offsetof(PySetObject, table), \
        .mask = offsetof(PySetObject, mask), \
    }, \
    .dict_object = { \
        .size = sizeof(PyDictObject), \
        .ma_keys = offsetof(PyDictObject, ma_keys), \
        .ma_values = offsetof(PyDictObject, ma_values), \
    }, \
    .float_object = { \
        .size = sizeof(PyFloatObject), \
        .ob_fval = offsetof(PyFloatObject, ob_fval), \
    }, \
    .long_object = { \
        .size = sizeof(PyLongObject), \
        .lv_tag = offsetof(PyLongObject, long_value.lv_tag), \
        .ob_digit = offsetof(PyLongObject, long_value.ob_digit), \
    }, \
    .bytes_object = { \
        .size = sizeof(PyBytesObject), \
        .ob_size = offsetof(PyBytesObject, ob_base.ob_size), \
        .ob_sval = offsetof(PyBytesObject, ob_sval), \
    }, \
    .unicode_object = { \
        .size = sizeof(PyUnicodeObject), \
        .state = offsetof(PyUnicodeObject, _base._base.state), \
        .length = offsetof(PyUnicodeObject, _base._base.length), \
        .asciiobject_size = sizeof(PyASCIIObject), \
    }, \
    .gc = { \
        .size = sizeof(struct _gc_runtime_state), \
        .collecting = offsetof(struct _gc_runtime_state, collecting), \
    }, \
    .gen_object = { \
        .size = sizeof(PyGenObject), \
        .gi_name = offsetof(PyGenObject, gi_name), \
        .gi_iframe = offsetof(PyGenObject, gi_iframe), \
        .gi_frame_state = offsetof(PyGenObject, gi_frame_state), \
    }, \
    .llist_node = { \
        .next = offsetof(struct llist_node, next), \
        .prev = offsetof(struct llist_node, prev), \
    }, \
    .debugger_support = { \
        .eval_breaker = offsetof(TyThreadState, eval_breaker), \
        .remote_debugger_support = offsetof(TyThreadState, remote_debugger_support),  \
        .remote_debugging_enabled = offsetof(TyInterpreterState, config.remote_debug),  \
        .debugger_pending_call = offsetof(_PyRemoteDebuggerSupport, debugger_pending_call),  \
        .debugger_script_path = offsetof(_PyRemoteDebuggerSupport, debugger_script_path),  \
        .debugger_script_path_size = Ty_MAX_SCRIPT_PATH_SIZE, \
    }, \
}


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_DEBUG_OFFSETS_H */
