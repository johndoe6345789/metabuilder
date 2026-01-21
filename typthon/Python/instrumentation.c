#include "Python.h"
#include "pycore_bitutils.h"      // _Ty_popcount32()
#include "pycore_call.h"          // _TyObject_VectorcallTstate()
#include "pycore_ceval.h"         // _PY_EVAL_EVENTS_BITS
#include "pycore_code.h"          // _TyCode_Clear_Executors()
#include "pycore_critical_section.h" // _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED()
#include "pycore_frame.h"         // PyFrameObject
#include "pycore_interpframe.h"   // _TyFrame_GetBytecode()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_modsupport.h"    // _TyModule_CreateInitialized()
#include "pycore_namespace.h"     // _PyNamespace_New()
#include "pycore_opcode_metadata.h" // IS_VALID_OPCODE()
#include "pycore_opcode_utils.h"  // IS_CONDITIONAL_JUMP_OPCODE()
#include "pycore_optimizer.h"     // _PyExecutorObject
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_STORE_UINTPTR_RELEASE()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_runtime_structs.h" // _PyCoMonitoringData
#include "pycore_tuple.h"         // _TyTuple_FromArraySteal()

#include "opcode_ids.h"


/* Uncomment this to dump debugging output when assertions fail */
// #define INSTRUMENT_DEBUG 1

#if defined(Ty_DEBUG) && defined(Ty_GIL_DISABLED)

#define ASSERT_WORLD_STOPPED_OR_LOCKED(obj)                         \
    if (!_TyInterpreterState_GET()->stoptheworld.world_stopped) {   \
        _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(obj);             \
    }
#define ASSERT_WORLD_STOPPED() assert(_TyInterpreterState_GET()->stoptheworld.world_stopped);

#else

#define ASSERT_WORLD_STOPPED_OR_LOCKED(obj)
#define ASSERT_WORLD_STOPPED()

#endif

#ifdef Ty_GIL_DISABLED

#define LOCK_CODE(code)                                             \
    assert(!_TyInterpreterState_GET()->stoptheworld.world_stopped); \
    Ty_BEGIN_CRITICAL_SECTION(code)

#define UNLOCK_CODE()   Ty_END_CRITICAL_SECTION()

#define MODIFY_BYTECODE(code, func, ...)                       \
    do {                                                       \
        PyCodeObject *co = (code);                             \
        for (Ty_ssize_t i = 0; i < code->co_tlbc->size; i++) { \
            char *bc = co->co_tlbc->entries[i];                \
            if (bc == NULL) {                                  \
                continue;                                      \
            }                                                  \
            (func)(code, (_Ty_CODEUNIT *)bc, __VA_ARGS__);           \
        }                                                      \
    } while (0)

#else

#define LOCK_CODE(code)
#define UNLOCK_CODE()
#define MODIFY_BYTECODE(code, func, ...) \
    (func)(code, _TyCode_CODE(code), __VA_ARGS__)

#endif

TyObject _PyInstrumentation_DISABLE = _TyObject_HEAD_INIT(&PyBaseObject_Type);

TyObject _PyInstrumentation_MISSING = _TyObject_HEAD_INIT(&PyBaseObject_Type);

static const int8_t EVENT_FOR_OPCODE[256] = {
    [RETURN_VALUE] = PY_MONITORING_EVENT_PY_RETURN,
    [INSTRUMENTED_RETURN_VALUE] = PY_MONITORING_EVENT_PY_RETURN,
    [CALL] = PY_MONITORING_EVENT_CALL,
    [INSTRUMENTED_CALL] = PY_MONITORING_EVENT_CALL,
    [CALL_KW] = PY_MONITORING_EVENT_CALL,
    [INSTRUMENTED_CALL_KW] = PY_MONITORING_EVENT_CALL,
    [CALL_FUNCTION_EX] = PY_MONITORING_EVENT_CALL,
    [INSTRUMENTED_CALL_FUNCTION_EX] = PY_MONITORING_EVENT_CALL,
    [LOAD_SUPER_ATTR] = PY_MONITORING_EVENT_CALL,
    [INSTRUMENTED_LOAD_SUPER_ATTR] = PY_MONITORING_EVENT_CALL,
    [RESUME] = -1,
    [YIELD_VALUE] = PY_MONITORING_EVENT_PY_YIELD,
    [INSTRUMENTED_YIELD_VALUE] = PY_MONITORING_EVENT_PY_YIELD,
    [JUMP_FORWARD] = PY_MONITORING_EVENT_JUMP,
    [JUMP_BACKWARD] = PY_MONITORING_EVENT_JUMP,
    [POP_JUMP_IF_FALSE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [POP_JUMP_IF_TRUE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [POP_JUMP_IF_NONE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [POP_JUMP_IF_NOT_NONE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [INSTRUMENTED_JUMP_FORWARD] = PY_MONITORING_EVENT_JUMP,
    [INSTRUMENTED_JUMP_BACKWARD] = PY_MONITORING_EVENT_JUMP,
    [INSTRUMENTED_POP_JUMP_IF_FALSE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [INSTRUMENTED_POP_JUMP_IF_TRUE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [INSTRUMENTED_POP_JUMP_IF_NONE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [INSTRUMENTED_POP_JUMP_IF_NOT_NONE] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [FOR_ITER] = PY_MONITORING_EVENT_BRANCH_LEFT,
    [INSTRUMENTED_FOR_ITER] = PY_MONITORING_EVENT_BRANCH_LEFT,
    [POP_ITER] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [INSTRUMENTED_POP_ITER] = PY_MONITORING_EVENT_BRANCH_RIGHT,
    [END_FOR] = PY_MONITORING_EVENT_STOP_ITERATION,
    [INSTRUMENTED_END_FOR] = PY_MONITORING_EVENT_STOP_ITERATION,
    [END_SEND] = PY_MONITORING_EVENT_STOP_ITERATION,
    [INSTRUMENTED_END_SEND] = PY_MONITORING_EVENT_STOP_ITERATION,
    [NOT_TAKEN] = PY_MONITORING_EVENT_BRANCH_LEFT,
    [INSTRUMENTED_NOT_TAKEN] = PY_MONITORING_EVENT_BRANCH_LEFT,
    [END_ASYNC_FOR] = PY_MONITORING_EVENT_BRANCH_RIGHT,
};

static const uint8_t DE_INSTRUMENT[256] = {
    [INSTRUMENTED_RESUME] = RESUME,
    [INSTRUMENTED_RETURN_VALUE] = RETURN_VALUE,
    [INSTRUMENTED_CALL] = CALL,
    [INSTRUMENTED_CALL_KW] = CALL_KW,
    [INSTRUMENTED_CALL_FUNCTION_EX] = CALL_FUNCTION_EX,
    [INSTRUMENTED_YIELD_VALUE] = YIELD_VALUE,
    [INSTRUMENTED_JUMP_FORWARD] = JUMP_FORWARD,
    [INSTRUMENTED_JUMP_BACKWARD] = JUMP_BACKWARD,
    [INSTRUMENTED_POP_JUMP_IF_FALSE] = POP_JUMP_IF_FALSE,
    [INSTRUMENTED_POP_JUMP_IF_TRUE] = POP_JUMP_IF_TRUE,
    [INSTRUMENTED_POP_JUMP_IF_NONE] = POP_JUMP_IF_NONE,
    [INSTRUMENTED_POP_JUMP_IF_NOT_NONE] = POP_JUMP_IF_NOT_NONE,
    [INSTRUMENTED_FOR_ITER] = FOR_ITER,
    [INSTRUMENTED_POP_ITER] = POP_ITER,
    [INSTRUMENTED_END_FOR] = END_FOR,
    [INSTRUMENTED_END_SEND] = END_SEND,
    [INSTRUMENTED_LOAD_SUPER_ATTR] = LOAD_SUPER_ATTR,
    [INSTRUMENTED_NOT_TAKEN] = NOT_TAKEN,
    [INSTRUMENTED_END_ASYNC_FOR] = END_ASYNC_FOR,
};

static const uint8_t INSTRUMENTED_OPCODES[256] = {
    [RETURN_VALUE] = INSTRUMENTED_RETURN_VALUE,
    [INSTRUMENTED_RETURN_VALUE] = INSTRUMENTED_RETURN_VALUE,
    [CALL] = INSTRUMENTED_CALL,
    [INSTRUMENTED_CALL] = INSTRUMENTED_CALL,
    [CALL_KW] = INSTRUMENTED_CALL_KW,
    [INSTRUMENTED_CALL_KW] = INSTRUMENTED_CALL_KW,
    [CALL_FUNCTION_EX] = INSTRUMENTED_CALL_FUNCTION_EX,
    [INSTRUMENTED_CALL_FUNCTION_EX] = INSTRUMENTED_CALL_FUNCTION_EX,
    [YIELD_VALUE] = INSTRUMENTED_YIELD_VALUE,
    [INSTRUMENTED_YIELD_VALUE] = INSTRUMENTED_YIELD_VALUE,
    [RESUME] = INSTRUMENTED_RESUME,
    [INSTRUMENTED_RESUME] = INSTRUMENTED_RESUME,
    [JUMP_FORWARD] = INSTRUMENTED_JUMP_FORWARD,
    [INSTRUMENTED_JUMP_FORWARD] = INSTRUMENTED_JUMP_FORWARD,
    [JUMP_BACKWARD] = INSTRUMENTED_JUMP_BACKWARD,
    [INSTRUMENTED_JUMP_BACKWARD] = INSTRUMENTED_JUMP_BACKWARD,
    [POP_JUMP_IF_FALSE] = INSTRUMENTED_POP_JUMP_IF_FALSE,
    [INSTRUMENTED_POP_JUMP_IF_FALSE] = INSTRUMENTED_POP_JUMP_IF_FALSE,
    [POP_JUMP_IF_TRUE] = INSTRUMENTED_POP_JUMP_IF_TRUE,
    [INSTRUMENTED_POP_JUMP_IF_TRUE] = INSTRUMENTED_POP_JUMP_IF_TRUE,
    [POP_JUMP_IF_NONE] = INSTRUMENTED_POP_JUMP_IF_NONE,
    [INSTRUMENTED_POP_JUMP_IF_NONE] = INSTRUMENTED_POP_JUMP_IF_NONE,
    [POP_JUMP_IF_NOT_NONE] = INSTRUMENTED_POP_JUMP_IF_NOT_NONE,
    [INSTRUMENTED_POP_JUMP_IF_NOT_NONE] = INSTRUMENTED_POP_JUMP_IF_NOT_NONE,
    [END_FOR] = INSTRUMENTED_END_FOR,
    [INSTRUMENTED_END_FOR] = INSTRUMENTED_END_FOR,
    [END_SEND] = INSTRUMENTED_END_SEND,
    [INSTRUMENTED_END_SEND] = INSTRUMENTED_END_SEND,
    [FOR_ITER] = INSTRUMENTED_FOR_ITER,
    [INSTRUMENTED_FOR_ITER] = INSTRUMENTED_FOR_ITER,
    [POP_ITER] = INSTRUMENTED_POP_ITER,
    [INSTRUMENTED_POP_ITER] = INSTRUMENTED_POP_ITER,
    [LOAD_SUPER_ATTR] = INSTRUMENTED_LOAD_SUPER_ATTR,
    [INSTRUMENTED_LOAD_SUPER_ATTR] = INSTRUMENTED_LOAD_SUPER_ATTR,
    [NOT_TAKEN] = INSTRUMENTED_NOT_TAKEN,
    [INSTRUMENTED_NOT_TAKEN] = INSTRUMENTED_NOT_TAKEN,
    [END_ASYNC_FOR] = INSTRUMENTED_END_ASYNC_FOR,
    [INSTRUMENTED_END_ASYNC_FOR] = INSTRUMENTED_END_ASYNC_FOR,

    [INSTRUMENTED_LINE] = INSTRUMENTED_LINE,
    [INSTRUMENTED_INSTRUCTION] = INSTRUMENTED_INSTRUCTION,
};

static inline bool
opcode_has_event(int opcode)
{
    return (
        opcode != INSTRUMENTED_LINE &&
        INSTRUMENTED_OPCODES[opcode] > 0
    );
}

static inline bool
is_instrumented(int opcode)
{
    assert(opcode != 0);
    assert(opcode != RESERVED);
    return opcode != ENTER_EXECUTOR && opcode >= MIN_INSTRUMENTED_OPCODE;
}

#ifndef NDEBUG
static inline bool
monitors_equals(_Ty_LocalMonitors a, _Ty_LocalMonitors b)
{
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        if (a.tools[i] != b.tools[i]) {
            return false;
        }
    }
    return true;
}
#endif

static inline _Ty_LocalMonitors
monitors_sub(_Ty_LocalMonitors a, _Ty_LocalMonitors b)
{
    _Ty_LocalMonitors res;
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        res.tools[i] = a.tools[i] & ~b.tools[i];
    }
    return res;
}

#ifndef NDEBUG
static inline _Ty_LocalMonitors
monitors_and(_Ty_LocalMonitors a, _Ty_LocalMonitors b)
{
    _Ty_LocalMonitors res;
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        res.tools[i] = a.tools[i] & b.tools[i];
    }
    return res;
}
#endif

/* The union of the *local* events in a and b.
 * Global events like RAISE are ignored.
 * Used for instrumentation, as only local
 * events get instrumented.
 */
static inline _Ty_LocalMonitors
local_union(_Ty_GlobalMonitors a, _Ty_LocalMonitors b)
{
    _Ty_LocalMonitors res;
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        res.tools[i] = a.tools[i] | b.tools[i];
    }
    return res;
}

static inline bool
monitors_are_empty(_Ty_LocalMonitors m)
{
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        if (m.tools[i]) {
            return false;
        }
    }
    return true;
}

static inline bool
multiple_tools(_Ty_LocalMonitors *m)
{
    for (int i = 0; i < _PY_MONITORING_LOCAL_EVENTS; i++) {
        if (_Ty_popcount32(m->tools[i]) > 1) {
            return true;
        }
    }
    return false;
}

static inline _PyMonitoringEventSet
get_local_events(_Ty_LocalMonitors *m, int tool_id)
{
    _PyMonitoringEventSet result = 0;
    for (int e = 0; e < _PY_MONITORING_LOCAL_EVENTS; e++) {
        if ((m->tools[e] >> tool_id) & 1) {
            result |= (1 << e);
        }
    }
    return result;
}

static inline _PyMonitoringEventSet
get_events(_Ty_GlobalMonitors *m, int tool_id)
{
    _PyMonitoringEventSet result = 0;
    for (int e = 0; e < _PY_MONITORING_UNGROUPED_EVENTS; e++) {
        if ((m->tools[e] >> tool_id) & 1) {
            result |= (1 << e);
        }
    }
    return result;
}

/* Module code can have line 0, even though modules start at line 1,
 * so -1 is a legal delta. */
#define NO_LINE (-2)

/* Returns the line delta. Defined as:
 * if line is None:
 *     line_delta = NO_LINE
 * else:
 *     line_delta = line - first_line
 */
static int
compute_line_delta(PyCodeObject *code, int line)
{
    if (line < 0) {
        assert(line == -1);
        return NO_LINE;
    }
    int delta = line - code->co_firstlineno;
    assert(delta > NO_LINE);
    return delta;
}

static int
compute_line(PyCodeObject *code, int line_delta)
{
    if (line_delta == NO_LINE) {
        return -1;
    }
    assert(line_delta > NO_LINE);
    return code->co_firstlineno + line_delta;
}

int
_PyInstruction_GetLength(PyCodeObject *code, int offset)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(code, offset);
    return 1 + _TyOpcode_Caches[inst.op.code];
}

static inline uint8_t
get_original_opcode(_PyCoLineInstrumentationData *line_data, int index)
{
    return line_data->data[index*line_data->bytes_per_entry];
}

static inline uint8_t *
get_original_opcode_ptr(_PyCoLineInstrumentationData *line_data, int index)
{
    return &line_data->data[index*line_data->bytes_per_entry];
}

static inline void
set_original_opcode(_PyCoLineInstrumentationData *line_data, int index, uint8_t opcode)
{
    line_data->data[index*line_data->bytes_per_entry] = opcode;
}

static inline int
get_line_delta(_PyCoLineInstrumentationData *line_data, int index)
{
    uint8_t *ptr = &line_data->data[index*line_data->bytes_per_entry+1];
    assert(line_data->bytes_per_entry >= 2);
    uint32_t value = *ptr;
    for (int idx = 2; idx < line_data->bytes_per_entry; idx++) {
        ptr++;
        int shift = (idx-1)*8;
        value |= ((uint32_t)(*ptr)) << shift;
    }
    assert(value < INT_MAX);
    /* NO_LINE is stored as zero. */
    return ((int)value) + NO_LINE;
}

static inline void
set_line_delta(_PyCoLineInstrumentationData *line_data, int index, int line_delta)
{
    /* Store line_delta + 2 as we need -2 to represent no line number */
    assert(line_delta >= NO_LINE);
    uint32_t adjusted = line_delta - NO_LINE;
    uint8_t *ptr = &line_data->data[index*line_data->bytes_per_entry+1];
    assert(adjusted < (1ULL << ((line_data->bytes_per_entry-1)*8)));
    assert(line_data->bytes_per_entry >= 2);
    *ptr = adjusted & 0xff;
    for (int idx = 2; idx < line_data->bytes_per_entry; idx++) {
        ptr++;
        adjusted >>= 8;
        *ptr = adjusted & 0xff;
    }
}

#ifdef INSTRUMENT_DEBUG

static void
dump_instrumentation_data_tools(PyCodeObject *code, uint8_t *tools, int i, FILE*out)
{
    if (tools == NULL) {
        fprintf(out, "tools = NULL");
    }
    else {
        fprintf(out, "tools = %d", tools[i]);
    }
}

static void
dump_instrumentation_data_lines(PyCodeObject *code, _PyCoLineInstrumentationData *lines, int i, FILE*out)
{
    if (lines == NULL) {
        fprintf(out, ", lines = NULL");
    }
    else {
        int opcode = get_original_opcode(lines, i);
        int line_delta = get_line_delta(lines, i);
        if (opcode == 0) {
            fprintf(out, ", lines = {original_opcode = No LINE (0), line_delta = %d)", line_delta);
        }
        else {
            fprintf(out, ", lines = {original_opcode = %s, line_delta = %d)", _TyOpcode_OpName[opcode], line_delta);
        }
    }
}

static void
dump_instrumentation_data_line_tools(PyCodeObject *code, uint8_t *line_tools, int i, FILE*out)
{
    if (line_tools == NULL) {
        fprintf(out, ", line_tools = NULL");
    }
    else {
        fprintf(out, ", line_tools = %d", line_tools[i]);
    }
}

static void
dump_instrumentation_data_per_instruction(PyCodeObject *code, _PyCoMonitoringData *data, int i, FILE*out)
{
    if (data->per_instruction_opcodes == NULL) {
        fprintf(out, ", per-inst opcode = NULL");
    }
    else {
        fprintf(out, ", per-inst opcode = %s", _TyOpcode_OpName[data->per_instruction_opcodes[i]]);
    }
    if (data->per_instruction_tools == NULL) {
        fprintf(out, ", per-inst tools = NULL");
    }
    else {
        fprintf(out, ", per-inst tools = %d", data->per_instruction_tools[i]);
    }
}

static void
dump_global_monitors(const char *prefix, _Ty_GlobalMonitors monitors, FILE*out)
{
    fprintf(out, "%s monitors:\n", prefix);
    for (int event = 0; event < _PY_MONITORING_UNGROUPED_EVENTS; event++) {
        fprintf(out, "    Event %d: Tools %x\n", event, monitors.tools[event]);
    }
}

static void
dump_local_monitors(const char *prefix, _Ty_LocalMonitors monitors, FILE*out)
{
    fprintf(out, "%s monitors:\n", prefix);
    for (int event = 0; event < _PY_MONITORING_LOCAL_EVENTS; event++) {
        fprintf(out, "    Event %d: Tools %x\n", event, monitors.tools[event]);
    }
}

/** NOTE:
 * Do not use TyCode_Addr2Line to determine the line number in instrumentation,
 * as `TyCode_Addr2Line` uses the monitoring data if it is available.
 */


/* No error checking -- Don't use this for anything but experimental debugging */
static void
dump_instrumentation_data(PyCodeObject *code, int star, FILE*out)
{
    _PyCoMonitoringData *data = code->_co_monitoring;
    fprintf(out, "\n");
    PyObject_Print(code->co_name, out, Ty_PRINT_RAW);
    fprintf(out, "\n");
    if (data == NULL) {
        fprintf(out, "NULL\n");
        return;
    }
    dump_global_monitors("Global", _TyInterpreterState_GET()->monitors, out);
    dump_local_monitors("Code", data->local_monitors, out);
    dump_local_monitors("Active", data->active_monitors, out);
    int code_len = (int)Ty_SIZE(code);
    bool starred = false;
    PyCodeAddressRange range;
    _TyCode_InitAddressRange(code, &range);
    for (int i = 0; i < code_len; i += _PyInstruction_GetLength(code, i)) {
        _Ty_CODEUNIT *instr = &_TyCode_CODE(code)[i];
        int opcode = instr->op.code;
        if (i == star) {
            fprintf(out, "**  ");
            starred = true;
        }
        fprintf(out, "Offset: %d, line: %d %s: ", i, _TyCode_CheckLineNumber(i*2, &range), _TyOpcode_OpName[opcode]);
        dump_instrumentation_data_tools(code, data->tools, i, out);
        dump_instrumentation_data_lines(code, data->lines, i, out);
        dump_instrumentation_data_line_tools(code, data->line_tools, i, out);
        dump_instrumentation_data_per_instruction(code, data, i, out);
        fprintf(out, "\n");
        ;
    }
    if (!starred && star >= 0) {
        fprintf(out, "Error offset not at valid instruction offset: %d\n", star);
        fprintf(out, "    ");
        dump_instrumentation_data_tools(code, data->tools, star, out);
        dump_instrumentation_data_lines(code, data->lines, star, out);
        dump_instrumentation_data_line_tools(code, data->line_tools, star, out);
        dump_instrumentation_data_per_instruction(code, data, star, out);
        fprintf(out, "\n");
    }
}

#define CHECK(test) do { \
    if (!(test)) { \
        dump_instrumentation_data(code, i, stderr); \
    } \
    assert(test); \
} while (0)

static bool
valid_opcode(int opcode)
{
    if (opcode == INSTRUMENTED_LINE) {
        return true;
    }
    if (IS_VALID_OPCODE(opcode) &&
        opcode != CACHE &&
        opcode != RESERVED &&
        opcode < 255)
    {
       return true;
    }
    return false;
}

static void
sanity_check_instrumentation(PyCodeObject *code)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    _PyCoMonitoringData *data = code->_co_monitoring;
    if (data == NULL) {
        return;
    }
    _Ty_GlobalMonitors global_monitors = _TyInterpreterState_GET()->monitors;
    _Ty_LocalMonitors active_monitors;
    if (code->_co_monitoring) {
        _Ty_LocalMonitors local_monitors = code->_co_monitoring->local_monitors;
        active_monitors = local_union(global_monitors, local_monitors);
    }
    else {
        _Ty_LocalMonitors empty = (_Ty_LocalMonitors) { 0 };
        active_monitors = local_union(global_monitors, empty);
    }
    assert(monitors_equals(
        code->_co_monitoring->active_monitors,
        active_monitors));
    int code_len = (int)Ty_SIZE(code);
    PyCodeAddressRange range;
    _TyCode_InitAddressRange(co, &range);
    for (int i = 0; i < code_len;) {
        _Ty_CODEUNIT *instr = &_TyCode_CODE(code)[i];
        int opcode = instr->op.code;
        int base_opcode = _Ty_GetBaseCodeUnit(code, i).op.code;
        CHECK(valid_opcode(opcode));
        CHECK(valid_opcode(base_opcode));
        if (opcode == INSTRUMENTED_INSTRUCTION) {
            opcode = data->per_instruction_opcodes[i];
            if (!is_instrumented(opcode)) {
                CHECK(_TyOpcode_Deopt[opcode] == opcode);
            }
        }
        if (opcode == INSTRUMENTED_LINE) {
            CHECK(data->lines);
            opcode = get_original_opcode(data->lines, i);
            CHECK(valid_opcode(opcode));
            CHECK(opcode != END_FOR);
            CHECK(opcode != RESUME);
            CHECK(opcode != RESUME_CHECK);
            CHECK(opcode != INSTRUMENTED_RESUME);
            if (!is_instrumented(opcode)) {
                CHECK(_TyOpcode_Deopt[opcode] == opcode);
            }
            CHECK(opcode != INSTRUMENTED_LINE);
        }
        else if (data->lines) {
            /* If original_opcode is INSTRUMENTED_INSTRUCTION
             * *and* we are executing a INSTRUMENTED_LINE instruction
             * that has de-instrumented itself, then we will execute
             * an invalid INSTRUMENTED_INSTRUCTION */
            CHECK(get_original_opcode(data->lines, i) != INSTRUMENTED_INSTRUCTION);
        }
        if (opcode == INSTRUMENTED_INSTRUCTION) {
            CHECK(data->per_instruction_opcodes[i] != 0);
            opcode = data->per_instruction_opcodes[i];
        }
        if (is_instrumented(opcode)) {
            CHECK(DE_INSTRUMENT[opcode] == base_opcode);
            int event = EVENT_FOR_OPCODE[DE_INSTRUMENT[opcode]];
            if (event < 0) {
                /* RESUME fixup */
                event = instr->op.arg ? 1: 0;
            }
            CHECK(active_monitors.tools[event] != 0);
        }
        if (data->lines && get_original_opcode(data->lines, i)) {
            int line1 = compute_line(code, get_line_delta(data->lines, i));
            int line2 = _TyCode_CheckLineNumber(i*sizeof(_Ty_CODEUNIT), &range);
            CHECK(line1 == line2);
        }
        CHECK(valid_opcode(opcode));
        if (data->tools) {
            uint8_t local_tools = data->tools[i];
            if (opcode_has_event(base_opcode)) {
                int event = EVENT_FOR_OPCODE[base_opcode];
                if (event == -1) {
                    /* RESUME fixup */
                    event = _TyCode_CODE(code)[i].op.arg;
                }
                CHECK((active_monitors.tools[event] & local_tools) == local_tools);
            }
            else {
                CHECK(local_tools == 0xff);
            }
        }
        i += _PyInstruction_GetLength(code, i);
        assert(i <= code_len);
    }
}
#else

#define CHECK(test) assert(test)

#endif

/* Get the underlying code unit, stripping instrumentation and ENTER_EXECUTOR */
_Ty_CODEUNIT
_Ty_GetBaseCodeUnit(PyCodeObject *code, int i)
{
    _Ty_CODEUNIT *src_instr = _TyCode_CODE(code) + i;
    _Ty_CODEUNIT inst = {
        .cache = FT_ATOMIC_LOAD_UINT16_RELAXED(*(uint16_t *)src_instr)};
    int opcode = inst.op.code;
    if (opcode < MIN_INSTRUMENTED_OPCODE) {
        inst.op.code = _TyOpcode_Deopt[opcode];
        assert(inst.op.code < MIN_SPECIALIZED_OPCODE);
        return inst;
    }
    if (opcode == ENTER_EXECUTOR) {
        _PyExecutorObject *exec = code->co_executors->executors[inst.op.arg];
        opcode = _TyOpcode_Deopt[exec->vm_data.opcode];
        inst.op.code = opcode;
        inst.op.arg = exec->vm_data.oparg;
        assert(inst.op.code < MIN_SPECIALIZED_OPCODE);
        return inst;
    }
    if (opcode == INSTRUMENTED_LINE) {
        opcode = get_original_opcode(code->_co_monitoring->lines, i);
    }
    if (opcode == INSTRUMENTED_INSTRUCTION) {
        opcode = code->_co_monitoring->per_instruction_opcodes[i];
    }
    CHECK(opcode != INSTRUMENTED_INSTRUCTION);
    CHECK(opcode != INSTRUMENTED_LINE);
    int deinstrumented = DE_INSTRUMENT[opcode];
    if (deinstrumented) {
        inst.op.code = deinstrumented;
    }
    else {
        inst.op.code = _TyOpcode_Deopt[opcode];
    }
    assert(inst.op.code < MIN_SPECIALIZED_OPCODE);
    return inst;
}

static void
de_instrument(PyCodeObject *code, _Ty_CODEUNIT *bytecode, _PyCoMonitoringData *monitoring, int i,
              int event)
{
    assert(event != PY_MONITORING_EVENT_INSTRUCTION);
    assert(event != PY_MONITORING_EVENT_LINE);

    _Ty_CODEUNIT *instr = &bytecode[i];
    uint8_t *opcode_ptr = &instr->op.code;
    int opcode = *opcode_ptr;
    assert(opcode != ENTER_EXECUTOR);
    if (opcode == INSTRUMENTED_LINE) {
        opcode_ptr = get_original_opcode_ptr(monitoring->lines, i);
        opcode = *opcode_ptr;
    }
    if (opcode == INSTRUMENTED_INSTRUCTION) {
        opcode_ptr = &monitoring->per_instruction_opcodes[i];
        opcode = *opcode_ptr;
    }
    int deinstrumented = DE_INSTRUMENT[opcode];
    if (deinstrumented == 0) {
        return;
    }
    CHECK(_TyOpcode_Deopt[deinstrumented] == deinstrumented);
    FT_ATOMIC_STORE_UINT8_RELAXED(*opcode_ptr, deinstrumented);
    if (_TyOpcode_Caches[deinstrumented]) {
        FT_ATOMIC_STORE_UINT16_RELAXED(instr[1].counter.value_and_backoff,
                                       adaptive_counter_warmup().value_and_backoff);
    }
}

static void
de_instrument_line(PyCodeObject *code, _Ty_CODEUNIT *bytecode, _PyCoMonitoringData *monitoring,
                   int i)
{
    _Ty_CODEUNIT *instr = &bytecode[i];
    int opcode = instr->op.code;
    if (opcode != INSTRUMENTED_LINE) {
        return;
    }
    _PyCoLineInstrumentationData *lines = monitoring->lines;
    int original_opcode = get_original_opcode(lines, i);
    if (original_opcode == INSTRUMENTED_INSTRUCTION) {
        set_original_opcode(lines, i, monitoring->per_instruction_opcodes[i]);
    }
    CHECK(original_opcode != 0);
    CHECK(original_opcode == _TyOpcode_Deopt[original_opcode]);
    FT_ATOMIC_STORE_UINT8(instr->op.code, original_opcode);
    if (_TyOpcode_Caches[original_opcode]) {
        FT_ATOMIC_STORE_UINT16_RELAXED(instr[1].counter.value_and_backoff,
                                       adaptive_counter_warmup().value_and_backoff);
    }
    assert(instr->op.code != INSTRUMENTED_LINE);
}

static void
de_instrument_per_instruction(PyCodeObject *code, _Ty_CODEUNIT *bytecode,
                              _PyCoMonitoringData *monitoring, int i)
{
    _Ty_CODEUNIT *instr = &bytecode[i];
    uint8_t *opcode_ptr = &instr->op.code;
    int opcode = *opcode_ptr;
    if (opcode == INSTRUMENTED_LINE) {
        opcode_ptr = get_original_opcode_ptr(monitoring->lines, i);
        opcode = *opcode_ptr;
    }
    if (opcode != INSTRUMENTED_INSTRUCTION) {
        return;
    }
    int original_opcode = monitoring->per_instruction_opcodes[i];
    CHECK(original_opcode != 0);
    CHECK(original_opcode == _TyOpcode_Deopt[original_opcode]);
    FT_ATOMIC_STORE_UINT8_RELAXED(*opcode_ptr, original_opcode);
    if (_TyOpcode_Caches[original_opcode]) {
        FT_ATOMIC_STORE_UINT16_RELAXED(instr[1].counter.value_and_backoff,
                                       adaptive_counter_warmup().value_and_backoff);
    }
    assert(*opcode_ptr != INSTRUMENTED_INSTRUCTION);
    assert(instr->op.code != INSTRUMENTED_INSTRUCTION);
}

static void
instrument(PyCodeObject *code, _Ty_CODEUNIT *bytecode, _PyCoMonitoringData *monitoring, int i)
{
    _Ty_CODEUNIT *instr = &bytecode[i];
    uint8_t *opcode_ptr = &instr->op.code;
    int opcode =*opcode_ptr;
    if (opcode == INSTRUMENTED_LINE) {
        opcode_ptr = get_original_opcode_ptr(monitoring->lines, i);
        opcode = *opcode_ptr;
    }
    if (opcode == INSTRUMENTED_INSTRUCTION) {
        opcode_ptr = &monitoring->per_instruction_opcodes[i];
        opcode = *opcode_ptr;
        CHECK(opcode != INSTRUMENTED_INSTRUCTION && opcode != INSTRUMENTED_LINE);
        CHECK(opcode == _TyOpcode_Deopt[opcode]);
    }
    CHECK(opcode != 0);
    if (!is_instrumented(opcode)) {
        int deopt = _TyOpcode_Deopt[opcode];
        int instrumented = INSTRUMENTED_OPCODES[deopt];
        assert(instrumented);
        FT_ATOMIC_STORE_UINT8_RELAXED(*opcode_ptr, instrumented);
        if (_TyOpcode_Caches[deopt]) {
            FT_ATOMIC_STORE_UINT16_RELAXED(instr[1].counter.value_and_backoff,
                                           adaptive_counter_warmup().value_and_backoff);
        }
    }
}

static void
instrument_line(PyCodeObject *code, _Ty_CODEUNIT *bytecode, _PyCoMonitoringData *monitoring, int i)
{
    uint8_t *opcode_ptr = &bytecode[i].op.code;
    int opcode = *opcode_ptr;
    if (opcode == INSTRUMENTED_LINE) {
        return;
    }
    set_original_opcode(monitoring->lines, i, _TyOpcode_Deopt[opcode]);
    CHECK(get_line_delta(monitoring->lines, i) > NO_LINE);
    FT_ATOMIC_STORE_UINT8_RELAXED(*opcode_ptr, INSTRUMENTED_LINE);
}

static void
instrument_per_instruction(PyCodeObject *code, _Ty_CODEUNIT *bytecode,
                           _PyCoMonitoringData *monitoring, int i)
{
    _Ty_CODEUNIT *instr = &bytecode[i];
    uint8_t *opcode_ptr = &instr->op.code;
    int opcode = *opcode_ptr;
    if (opcode == INSTRUMENTED_LINE) {
        opcode_ptr = get_original_opcode_ptr(monitoring->lines, i);
        opcode = *opcode_ptr;
    }
    if (opcode == INSTRUMENTED_INSTRUCTION) {
        assert(monitoring->per_instruction_opcodes[i] > 0);
        return;
    }
    CHECK(opcode != 0);
    if (is_instrumented(opcode)) {
        monitoring->per_instruction_opcodes[i] = opcode;
    }
    else {
        assert(opcode != 0);
        assert(_TyOpcode_Deopt[opcode] != 0);
        assert(_TyOpcode_Deopt[opcode] != RESUME);
        monitoring->per_instruction_opcodes[i] = _TyOpcode_Deopt[opcode];
    }
    assert(monitoring->per_instruction_opcodes[i] > 0);
    FT_ATOMIC_STORE_UINT8_RELAXED(*opcode_ptr, INSTRUMENTED_INSTRUCTION);
}

static void
remove_tools(PyCodeObject * code, int offset, int event, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    assert(event != PY_MONITORING_EVENT_LINE);
    assert(event != PY_MONITORING_EVENT_INSTRUCTION);
    assert(PY_MONITORING_IS_INSTRUMENTED_EVENT(event));
    assert(opcode_has_event(_Ty_GetBaseCodeUnit(code, offset).op.code));
    _PyCoMonitoringData *monitoring = code->_co_monitoring;
    assert(monitoring);
    bool should_de_instrument;
    if (monitoring->tools) {
        monitoring->tools[offset] &= ~tools;
        should_de_instrument = (monitoring->tools[offset] == 0);
    }
    else {
        /* Single tool */
        uint8_t single_tool = monitoring->active_monitors.tools[event];
        assert(_Ty_popcount32(single_tool) <= 1);
        should_de_instrument = ((single_tool & tools) == single_tool);
    }
    if (should_de_instrument) {
        MODIFY_BYTECODE(code, de_instrument, monitoring, offset, event);
    }
}

#ifndef NDEBUG
static bool
tools_is_subset_for_event(PyCodeObject * code, int event, int tools)
{
    int global_tools = _TyInterpreterState_GET()->monitors.tools[event];
    int local_tools = code->_co_monitoring->local_monitors.tools[event];
    return tools == ((global_tools | local_tools) & tools);
}
#endif

static void
remove_line_tools(PyCodeObject * code, int offset, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    _PyCoMonitoringData *monitoring = code->_co_monitoring;
    assert(monitoring);
    bool should_de_instrument;
    if (monitoring->line_tools)
    {
        uint8_t *toolsptr = &monitoring->line_tools[offset];
        *toolsptr &= ~tools;
        should_de_instrument = (*toolsptr == 0);
    }
    else {
        /* Single tool */
        uint8_t single_tool = monitoring->active_monitors.tools[PY_MONITORING_EVENT_LINE];
        assert(_Ty_popcount32(single_tool) <= 1);
        should_de_instrument = ((single_tool & tools) == single_tool);
    }
    if (should_de_instrument) {
        MODIFY_BYTECODE(code, de_instrument_line, monitoring, offset);
    }
}

static void
add_tools(PyCodeObject * code, int offset, int event, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    assert(event != PY_MONITORING_EVENT_LINE);
    assert(event != PY_MONITORING_EVENT_INSTRUCTION);
    assert(PY_MONITORING_IS_INSTRUMENTED_EVENT(event));
    assert(code->_co_monitoring);
    if (code->_co_monitoring &&
        code->_co_monitoring->tools
    ) {
        code->_co_monitoring->tools[offset] |= tools;
    }
    else {
        /* Single tool */
        assert(_Ty_popcount32(tools) == 1);
        assert(tools_is_subset_for_event(code, event, tools));
    }
    MODIFY_BYTECODE(code, instrument, code->_co_monitoring, offset);
}

static void
add_line_tools(PyCodeObject * code, int offset, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    assert(tools_is_subset_for_event(code, PY_MONITORING_EVENT_LINE, tools));
    assert(code->_co_monitoring);
    if (code->_co_monitoring->line_tools) {
        code->_co_monitoring->line_tools[offset] |= tools;
    }
    else {
        /* Single tool */
        assert(_Ty_popcount32(tools) == 1);
    }
    MODIFY_BYTECODE(code, instrument_line, code->_co_monitoring, offset);
}


static void
add_per_instruction_tools(PyCodeObject * code, int offset, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    assert(tools_is_subset_for_event(code, PY_MONITORING_EVENT_INSTRUCTION, tools));
    assert(code->_co_monitoring);
    if (code->_co_monitoring->per_instruction_tools) {
        code->_co_monitoring->per_instruction_tools[offset] |= tools;
    }
    else {
        /* Single tool */
        assert(_Ty_popcount32(tools) == 1);
    }
    MODIFY_BYTECODE(code, instrument_per_instruction, code->_co_monitoring, offset);
}


static void
remove_per_instruction_tools(PyCodeObject * code, int offset, int tools)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    _PyCoMonitoringData *monitoring = code->_co_monitoring;
    assert(code->_co_monitoring);
    bool should_de_instrument;
    if (code->_co_monitoring->per_instruction_tools) {
        uint8_t *toolsptr = &code->_co_monitoring->per_instruction_tools[offset];
        *toolsptr &= ~tools;
        should_de_instrument = (*toolsptr == 0);
    }
    else {
        /* Single tool */
        uint8_t single_tool = code->_co_monitoring->active_monitors.tools[PY_MONITORING_EVENT_INSTRUCTION];
        assert(_Ty_popcount32(single_tool) <= 1);
        should_de_instrument = ((single_tool & tools) == single_tool);
    }
    if (should_de_instrument) {
        MODIFY_BYTECODE(code, de_instrument_per_instruction, monitoring, offset);
    }
}


/* Return 1 if DISABLE returned, -1 if error, 0 otherwise */
static int
call_one_instrument(
    TyInterpreterState *interp, TyThreadState *tstate, TyObject **args,
    size_t nargsf, int8_t tool, int event)
{
    assert(0 <= tool && tool < 8);
    assert(tstate->tracing == 0);
    TyObject *instrument = interp->monitoring_callables[tool][event];
    if (instrument == NULL) {
        return 0;
    }
    int old_what = tstate->what_event;
    tstate->what_event = event;
    tstate->tracing++;
    TyObject *res = _TyObject_VectorcallTstate(tstate, instrument, args, nargsf, NULL);
    tstate->tracing--;
    tstate->what_event = old_what;
    if (res == NULL) {
        return -1;
    }
    Ty_DECREF(res);
    return (res == &_PyInstrumentation_DISABLE);
}

static const int8_t MOST_SIGNIFICANT_BITS[16] = {
    -1, 0, 1, 1,
    2, 2, 2, 2,
    3, 3, 3, 3,
    3, 3, 3, 3,
};

/* We could use _Ty_bit_length here, but that is designed for larger (32/64)
 * bit ints, and can perform relatively poorly on platforms without the
 * necessary intrinsics. */
static inline int most_significant_bit(uint8_t bits) {
    assert(bits != 0);
    if (bits > 15) {
        return MOST_SIGNIFICANT_BITS[bits>>4]+4;
    }
    return MOST_SIGNIFICANT_BITS[bits];
}

static uint32_t
global_version(TyInterpreterState *interp)
{
    uint32_t version = (uint32_t)_Ty_atomic_load_uintptr_relaxed(
        &interp->ceval.instrumentation_version);
#ifdef Ty_DEBUG
    TyThreadState *tstate = _TyThreadState_GET();
    uint32_t thread_version =
        (uint32_t)(_Ty_atomic_load_uintptr_relaxed(&tstate->eval_breaker) &
                   ~_PY_EVAL_EVENTS_MASK);
    assert(thread_version == version);
#endif
    return version;
}

/* Atomically set the given version in the given location, without touching
   anything in _PY_EVAL_EVENTS_MASK. */
static void
set_version_raw(uintptr_t *ptr, uint32_t version)
{
    uintptr_t old = _Ty_atomic_load_uintptr_relaxed(ptr);
    uintptr_t new;
    do {
        new = (old & _PY_EVAL_EVENTS_MASK) | version;
    } while (!_Ty_atomic_compare_exchange_uintptr(ptr, &old, new));
}

static void
set_global_version(TyThreadState *tstate, uint32_t version)
{
    assert((version & _PY_EVAL_EVENTS_MASK) == 0);
    TyInterpreterState *interp = tstate->interp;
    set_version_raw(&interp->ceval.instrumentation_version, version);

#ifdef Ty_GIL_DISABLED
    // Set the version on all threads in free-threaded builds.
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, tstate) {
        set_version_raw(&tstate->eval_breaker, version);
    };
    _Ty_FOR_EACH_TSTATE_END(interp);
#else
    // Normal builds take the current version from instrumentation_version when
    // attaching a thread, so we only have to set the current thread's version.
    set_version_raw(&tstate->eval_breaker, version);
#endif
}

static bool
is_version_up_to_date(PyCodeObject *code, TyInterpreterState *interp)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    return global_version(interp) == code->_co_instrumentation_version;
}

#ifndef NDEBUG
static bool
instrumentation_cross_checks(TyInterpreterState *interp, PyCodeObject *code)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    _Ty_LocalMonitors expected = local_union(
        interp->monitors,
        code->_co_monitoring->local_monitors);
    return monitors_equals(code->_co_monitoring->active_monitors, expected);
}

static int
debug_check_sanity(TyInterpreterState *interp, PyCodeObject *code)
{
    int res;
    LOCK_CODE(code);
    res = is_version_up_to_date(code, interp) &&
          instrumentation_cross_checks(interp, code);
    UNLOCK_CODE();
    return res;
}

#endif

static inline uint8_t
get_tools_for_instruction(PyCodeObject *code, TyInterpreterState *interp, int i, int event)
{
    uint8_t tools;
    assert(event != PY_MONITORING_EVENT_LINE);
    assert(event != PY_MONITORING_EVENT_INSTRUCTION);
    if (event >= _PY_MONITORING_UNGROUPED_EVENTS) {
        assert(event == PY_MONITORING_EVENT_C_RAISE ||
                event == PY_MONITORING_EVENT_C_RETURN);
        event = PY_MONITORING_EVENT_CALL;
    }
    if (PY_MONITORING_IS_INSTRUMENTED_EVENT(event)) {
        CHECK(debug_check_sanity(interp, code));
        if (code->_co_monitoring->tools) {
            tools = code->_co_monitoring->tools[i];
        }
        else {
            tools = code->_co_monitoring->active_monitors.tools[event];
        }
    }
    else {
        tools = interp->monitors.tools[event];
    }
    return tools;
}

static const char *const event_names [] = {
    [PY_MONITORING_EVENT_PY_START] = "PY_START",
    [PY_MONITORING_EVENT_PY_RESUME] = "PY_RESUME",
    [PY_MONITORING_EVENT_PY_RETURN] = "PY_RETURN",
    [PY_MONITORING_EVENT_PY_YIELD] = "PY_YIELD",
    [PY_MONITORING_EVENT_CALL] = "CALL",
    [PY_MONITORING_EVENT_LINE] = "LINE",
    [PY_MONITORING_EVENT_INSTRUCTION] = "INSTRUCTION",
    [PY_MONITORING_EVENT_JUMP] = "JUMP",
    [PY_MONITORING_EVENT_BRANCH] = "BRANCH",
    [PY_MONITORING_EVENT_BRANCH_LEFT] = "BRANCH_LEFT",
    [PY_MONITORING_EVENT_BRANCH_RIGHT] = "BRANCH_RIGHT",
    [PY_MONITORING_EVENT_C_RETURN] = "C_RETURN",
    [PY_MONITORING_EVENT_PY_THROW] = "PY_THROW",
    [PY_MONITORING_EVENT_RAISE] = "RAISE",
    [PY_MONITORING_EVENT_RERAISE] = "RERAISE",
    [PY_MONITORING_EVENT_EXCEPTION_HANDLED] = "EXCEPTION_HANDLED",
    [PY_MONITORING_EVENT_C_RAISE] = "C_RAISE",
    [PY_MONITORING_EVENT_PY_UNWIND] = "PY_UNWIND",
    [PY_MONITORING_EVENT_STOP_ITERATION] = "STOP_ITERATION",
};

static int
call_instrumentation_vector(
    _Ty_CODEUNIT *instr, TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *arg2, Ty_ssize_t nargs, TyObject *args[])
{
    if (tstate->tracing) {
        return 0;
    }
    assert(!_TyErr_Occurred(tstate));
    assert(args[0] == NULL);
    PyCodeObject *code = _TyFrame_GetCode(frame);
    assert(args[1] == NULL);
    args[1] = (TyObject *)code;
    int offset = (int)(instr - _TyFrame_GetBytecode(frame));
    /* Offset visible to user should be the offset in bytes, as that is the
     * convention for APIs involving code offsets. */
    int bytes_arg2 = (int)(arg2 - _TyFrame_GetBytecode(frame)) * (int)sizeof(_Ty_CODEUNIT);
    TyObject *arg2_obj = TyLong_FromLong(bytes_arg2);
    if (arg2_obj == NULL) {
        return -1;
    }
    assert(args[2] == NULL);
    args[2] = arg2_obj;
    TyInterpreterState *interp = tstate->interp;
    uint8_t tools = get_tools_for_instruction(code, interp, offset, event);
    size_t nargsf = (size_t) nargs | PY_VECTORCALL_ARGUMENTS_OFFSET;
    TyObject **callargs = &args[1];
    int err = 0;
    while (tools) {
        int tool = most_significant_bit(tools);
        assert(tool >= 0 && tool < 8);
        assert(tools & (1 << tool));
        tools ^= (1 << tool);
        int res = call_one_instrument(interp, tstate, callargs, nargsf, tool, event);
        if (res == 0) {
            /* Nothing to do */
        }
        else if (res < 0) {
            /* error */
            err = -1;
            break;
        }
        else {
            /* DISABLE */
            if (!PY_MONITORING_IS_INSTRUMENTED_EVENT(event)) {
                TyErr_Format(TyExc_ValueError,
                              "Cannot disable %s events. Callback removed.",
                             event_names[event]);
                /* Clear tool to prevent infinite loop */
                Ty_CLEAR(interp->monitoring_callables[tool][event]);
                err = -1;
                break;
            }
            else {
                LOCK_CODE(code);
                remove_tools(code, offset, event, 1 << tool);
                UNLOCK_CODE();
            }
        }
    }
    Ty_DECREF(arg2_obj);
    return err;
}

Ty_NO_INLINE int
_Ty_call_instrumentation(
    TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr)
{
    TyObject *args[3] = { NULL, NULL, NULL };
    return call_instrumentation_vector(instr, tstate, event, frame, instr, 2, args);
}

Ty_NO_INLINE int
_Ty_call_instrumentation_arg(
    TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg)
{
    TyObject *args[4] = { NULL, NULL, NULL, arg };
    return call_instrumentation_vector(instr, tstate, event, frame, instr, 3, args);
}

Ty_NO_INLINE int
_Ty_call_instrumentation_2args(
    TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg0, TyObject *arg1)
{
    TyObject *args[5] = { NULL, NULL, NULL, arg0, arg1 };
    return call_instrumentation_vector(instr, tstate, event, frame, instr, 4, args);
}

Ty_NO_INLINE _Ty_CODEUNIT *
_Ty_call_instrumentation_jump(
    _Ty_CODEUNIT *instr, TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *src, _Ty_CODEUNIT *dest)
{
    assert(event == PY_MONITORING_EVENT_JUMP ||
           event == PY_MONITORING_EVENT_BRANCH_RIGHT ||
           event == PY_MONITORING_EVENT_BRANCH_LEFT);
    int to = (int)(dest - _TyFrame_GetBytecode(frame));
    TyObject *to_obj = TyLong_FromLong(to * (int)sizeof(_Ty_CODEUNIT));
    if (to_obj == NULL) {
        return NULL;
    }
    TyObject *args[4] = { NULL, NULL, NULL, to_obj };
    _Ty_CODEUNIT *instr_ptr = frame->instr_ptr;
    int err = call_instrumentation_vector(instr, tstate, event, frame, src, 3, args);
    Ty_DECREF(to_obj);
    if (err) {
        return NULL;
    }
    if (frame->instr_ptr != instr_ptr) {
        /* The callback has caused a jump (by setting the line number) */
        return frame->instr_ptr;
    }
    return dest;
}

static void
call_instrumentation_vector_protected(
    TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, Ty_ssize_t nargs, TyObject *args[])
{
    assert(_TyErr_Occurred(tstate));
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    int err = call_instrumentation_vector(instr, tstate, event, frame, instr, nargs, args);
    if (err) {
        Ty_XDECREF(exc);
    }
    else {
        _TyErr_SetRaisedException(tstate, exc);
    }
    assert(_TyErr_Occurred(tstate));
}

Ty_NO_INLINE void
_Ty_call_instrumentation_exc2(
    TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg0, TyObject *arg1)
{
    assert(_TyErr_Occurred(tstate));
    TyObject *args[5] = { NULL, NULL, NULL, arg0, arg1 };
    call_instrumentation_vector_protected(tstate, event, frame, instr, 4, args);
}

int
_Ty_Instrumentation_GetLine(PyCodeObject *code, int index)
{
    _PyCoMonitoringData *monitoring = code->_co_monitoring;
    assert(monitoring != NULL);
    assert(monitoring->lines != NULL);
    assert(index < Ty_SIZE(code));
    _PyCoLineInstrumentationData *line_data = monitoring->lines;
    int line_delta = get_line_delta(line_data, index);
    int line = compute_line(code, line_delta);
    return line;
}

Ty_NO_INLINE int
_Ty_call_instrumentation_line(TyThreadState *tstate, _PyInterpreterFrame* frame, _Ty_CODEUNIT *instr, _Ty_CODEUNIT *prev)
{
    PyCodeObject *code = _TyFrame_GetCode(frame);
    assert(tstate->tracing == 0);
    assert(debug_check_sanity(tstate->interp, code));
    _Ty_CODEUNIT *bytecode = _TyFrame_GetBytecode(frame);
    int i = (int)(instr - bytecode);

    _PyCoMonitoringData *monitoring = code->_co_monitoring;
    _PyCoLineInstrumentationData *line_data = monitoring->lines;
    TyInterpreterState *interp = tstate->interp;
    int line = _Ty_Instrumentation_GetLine(code, i);
    assert(line >= 0);
    assert(prev != NULL);
    int prev_index = (int)(prev - bytecode);
    int prev_line = _Ty_Instrumentation_GetLine(code, prev_index);
    if (prev_line == line) {
        int prev_opcode = bytecode[prev_index].op.code;
        /* RESUME and INSTRUMENTED_RESUME are needed for the operation of
            * instrumentation, so must never be hidden by an INSTRUMENTED_LINE.
            */
        if (prev_opcode != RESUME && prev_opcode != INSTRUMENTED_RESUME) {
            goto done;
        }
    }

    uint8_t tools = code->_co_monitoring->line_tools != NULL ?
        code->_co_monitoring->line_tools[i] :
        (interp->monitors.tools[PY_MONITORING_EVENT_LINE] |
         code->_co_monitoring->local_monitors.tools[PY_MONITORING_EVENT_LINE]
        );
    /* Special case sys.settrace to avoid boxing the line number,
     * only to immediately unbox it. */
    if (tools & (1 << PY_MONITORING_SYS_TRACE_ID)) {
        if (tstate->c_tracefunc != NULL) {
            PyFrameObject *frame_obj = _TyFrame_GetFrameObject(frame);
            if (frame_obj == NULL) {
                return -1;
            }
            if (frame_obj->f_trace_lines) {
                /* Need to set tracing and what_event as if using
                 * the instrumentation call. */
                int old_what = tstate->what_event;
                tstate->what_event = PY_MONITORING_EVENT_LINE;
                tstate->tracing++;
                /* Call c_tracefunc directly, having set the line number. */
                Ty_INCREF(frame_obj);
                frame_obj->f_lineno = line;
                int err = tstate->c_tracefunc(tstate->c_traceobj, frame_obj, PyTrace_LINE, Ty_None);
                frame_obj->f_lineno = 0;
                tstate->tracing--;
                tstate->what_event = old_what;
                Ty_DECREF(frame_obj);
                if (err) {
                    return -1;
                }
            }
        }
        tools &= (255 - (1 << PY_MONITORING_SYS_TRACE_ID));
    }
    if (tools == 0) {
        goto done;
    }
    TyObject *line_obj = TyLong_FromLong(line);
    if (line_obj == NULL) {
        return -1;
    }
    TyObject *args[3] = { NULL, (TyObject *)code, line_obj };
    do {
        int tool = most_significant_bit(tools);
        assert(tool >= 0 && tool < PY_MONITORING_SYS_PROFILE_ID);
        assert(tools & (1 << tool));
        tools &= ~(1 << tool);
        int res = call_one_instrument(interp, tstate, &args[1],
                                      2 | PY_VECTORCALL_ARGUMENTS_OFFSET,
                                      tool, PY_MONITORING_EVENT_LINE);
        if (res == 0) {
            /* Nothing to do */
        }
        else if (res < 0) {
            /* error */
            Ty_DECREF(line_obj);
            return -1;
        }
        else {
            /* DISABLE  */
            LOCK_CODE(code);
            remove_line_tools(code, i, 1 << tool);
            UNLOCK_CODE();
        }
    } while (tools);
    Ty_DECREF(line_obj);
    uint8_t original_opcode;
done:
    original_opcode = get_original_opcode(line_data, i);
    assert(original_opcode != 0);
    assert(original_opcode != INSTRUMENTED_LINE);
    assert(_TyOpcode_Deopt[original_opcode] == original_opcode);
    return original_opcode;
}

Ty_NO_INLINE int
_Ty_call_instrumentation_instruction(TyThreadState *tstate, _PyInterpreterFrame* frame, _Ty_CODEUNIT *instr)
{
    PyCodeObject *code = _TyFrame_GetCode(frame);
    int offset = (int)(instr - _TyFrame_GetBytecode(frame));
    _PyCoMonitoringData *instrumentation_data = code->_co_monitoring;
    assert(instrumentation_data->per_instruction_opcodes);
    int next_opcode = instrumentation_data->per_instruction_opcodes[offset];
    if (tstate->tracing) {
        return next_opcode;
    }
    assert(debug_check_sanity(tstate->interp, code));
    TyInterpreterState *interp = tstate->interp;
    uint8_t tools = instrumentation_data->per_instruction_tools != NULL ?
        instrumentation_data->per_instruction_tools[offset] :
        (interp->monitors.tools[PY_MONITORING_EVENT_INSTRUCTION] |
         code->_co_monitoring->local_monitors.tools[PY_MONITORING_EVENT_INSTRUCTION]
        );
    int bytes_offset = offset * (int)sizeof(_Ty_CODEUNIT);
    TyObject *offset_obj = TyLong_FromLong(bytes_offset);
    if (offset_obj == NULL) {
        return -1;
    }
    TyObject *args[3] = { NULL, (TyObject *)code, offset_obj };
    while (tools) {
        int tool = most_significant_bit(tools);
        assert(tool >= 0 && tool < 8);
        assert(tools & (1 << tool));
        tools &= ~(1 << tool);
        int res = call_one_instrument(interp, tstate, &args[1],
                                      2 | PY_VECTORCALL_ARGUMENTS_OFFSET,
                                      tool, PY_MONITORING_EVENT_INSTRUCTION);
        if (res == 0) {
            /* Nothing to do */
        }
        else if (res < 0) {
            /* error */
            Ty_DECREF(offset_obj);
            return -1;
        }
        else {
            /* DISABLE  */
            LOCK_CODE(code);
            remove_per_instruction_tools(code, offset, 1 << tool);
            UNLOCK_CODE();
        }
    }
    Ty_DECREF(offset_obj);
    assert(next_opcode != 0);
    return next_opcode;
}

static void
initialize_tools(PyCodeObject *code)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    uint8_t* tools = code->_co_monitoring->tools;

    assert(tools != NULL);
    int code_len = (int)Ty_SIZE(code);
    for (int i = 0; i < code_len; i++) {
        _Ty_CODEUNIT *instr = &_TyCode_CODE(code)[i];
        int opcode = instr->op.code;
        assert(opcode != ENTER_EXECUTOR);
        if (opcode == INSTRUMENTED_LINE) {
            opcode = get_original_opcode(code->_co_monitoring->lines, i);
        }
        if (opcode == INSTRUMENTED_INSTRUCTION) {
            opcode = code->_co_monitoring->per_instruction_opcodes[i];
        }
        bool instrumented = is_instrumented(opcode);
        if (instrumented) {
            opcode = DE_INSTRUMENT[opcode];
            assert(opcode != 0);
        }
        opcode = _TyOpcode_Deopt[opcode];
        if (opcode_has_event(opcode)) {
            if (instrumented) {
                int8_t event;
                if (opcode == RESUME) {
                    event = instr->op.arg != 0;
                }
                else {
                    event = EVENT_FOR_OPCODE[opcode];
                    assert(event > 0);
                }
                assert(event >= 0);
                assert(PY_MONITORING_IS_INSTRUMENTED_EVENT(event));
                tools[i] = code->_co_monitoring->active_monitors.tools[event];
                CHECK(tools[i] != 0);
            }
            else {
                tools[i] = 0;
            }
        }
#ifdef Ty_DEBUG
        /* Initialize tools for invalid locations to all ones to try to catch errors */
        else {
            tools[i] = 0xff;
        }
        for (int j = 1; j <= _TyOpcode_Caches[opcode]; j++) {
            tools[i+j] = 0xff;
        }
#endif
        i += _TyOpcode_Caches[opcode];
    }
}

static void
initialize_lines(PyCodeObject *code, int bytes_per_entry)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    _PyCoLineInstrumentationData *line_data = code->_co_monitoring->lines;

    assert(line_data != NULL);
    line_data->bytes_per_entry = bytes_per_entry;
    int code_len = (int)Ty_SIZE(code);
    PyCodeAddressRange range;
    _TyCode_InitAddressRange(code, &range);
    int current_line = -1;
    for (int i = 0; i < code_len; ) {
        int opcode = _Ty_GetBaseCodeUnit(code, i).op.code;
        int line = _TyCode_CheckLineNumber(i*(int)sizeof(_Ty_CODEUNIT), &range);
        set_line_delta(line_data, i, compute_line_delta(code, line));
        int length = _PyInstruction_GetLength(code, i);
        if (i < code->_co_firsttraceable) {
            set_original_opcode(line_data, i, 0);
        }
        else {
            switch (opcode) {
                case END_ASYNC_FOR:
                case END_FOR:
                case END_SEND:
                case RESUME:
            case POP_ITER:
                    /* END_FOR cannot start a line, as it is skipped by FOR_ITER
                    * END_SEND cannot start a line, as it is skipped by SEND
                    * RESUME and POP_ITER must not be instrumented with INSTRUMENTED_LINE */
                    set_original_opcode(line_data, i, 0);
                    break;
                default:
                    /* Set original_opcode to the opcode iff the instruction
                    * starts a line, and thus should be instrumented.
                    * This saves having to perform this check every time the
                    * we turn instrumentation on or off, and serves as a sanity
                    * check when debugging.
                    */
                    if (line != current_line && line >= 0) {
                        set_original_opcode(line_data, i, opcode);
                        CHECK(get_line_delta(line_data, i) != NO_LINE);
                    }
                    else {
                        set_original_opcode(line_data, i, 0);
                    }
                    current_line = line;
            }
        }
        for (int j = 1; j < length; j++) {
            set_original_opcode(line_data, i+j, 0);
            set_line_delta(line_data, i+j, NO_LINE);
        }
        i += length;
    }
    for (int i = code->_co_firsttraceable; i < code_len; ) {
        _Ty_CODEUNIT inst =_Ty_GetBaseCodeUnit(code, i);
        int opcode = inst.op.code;
        int oparg = 0;
        while (opcode == EXTENDED_ARG) {
            oparg = (oparg << 8) | inst.op.arg;
            i++;
            inst =_Ty_GetBaseCodeUnit(code, i);
            opcode = inst.op.code;
        }
        oparg = (oparg << 8) | inst.op.arg;
        i += _PyInstruction_GetLength(code, i);
        int target = -1;
        switch (opcode) {
            case POP_JUMP_IF_FALSE:
            case POP_JUMP_IF_TRUE:
            case POP_JUMP_IF_NONE:
            case POP_JUMP_IF_NOT_NONE:
            case JUMP_FORWARD:
            {
                target = i + oparg;
                break;
            }
            case FOR_ITER:
            case SEND:
            {
                /* Skip over END_FOR/END_SEND */
                target = i + oparg + 1;
                break;
            }
            case JUMP_BACKWARD:
            case JUMP_BACKWARD_NO_INTERRUPT:
            {
                target = i - oparg;
                break;
            }
            default:
                continue;
        }
        assert(target >= 0);
        if (get_line_delta(line_data, target) != NO_LINE) {
            int opcode = _Ty_GetBaseCodeUnit(code, target).op.code;
            if (opcode != POP_ITER) {
                set_original_opcode(line_data, target, opcode);
            }
        }
    }
    /* Scan exception table */
    unsigned char *start = (unsigned char *)TyBytes_AS_STRING(code->co_exceptiontable);
    unsigned char *end = start + TyBytes_GET_SIZE(code->co_exceptiontable);
    unsigned char *scan = start;
    while (scan < end) {
        int start_offset, size, handler;
        scan = parse_varint(scan, &start_offset);
        assert(start_offset >= 0 && start_offset < code_len);
        scan = parse_varint(scan, &size);
        assert(size >= 0 && start_offset+size <= code_len);
        scan = parse_varint(scan, &handler);
        assert(handler >= 0 && handler < code_len);
        int depth_and_lasti;
        scan = parse_varint(scan, &depth_and_lasti);
        int original_opcode = _Ty_GetBaseCodeUnit(code, handler).op.code;
        /* Skip if not the start of a line.
         * END_ASYNC_FOR is a bit special as it marks the end of
         * an `async for` loop, which should not generate its own
         * line event. */
        if (get_line_delta(line_data, handler) != NO_LINE && original_opcode != END_ASYNC_FOR) {
            set_original_opcode(line_data, handler, original_opcode);
        }
    }
}

static void
initialize_line_tools(PyCodeObject *code, _Ty_LocalMonitors *all_events)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);
    uint8_t *line_tools = code->_co_monitoring->line_tools;

    assert(line_tools != NULL);
    int code_len = (int)Ty_SIZE(code);
    for (int i = 0; i < code_len; i++) {
        line_tools[i] = all_events->tools[PY_MONITORING_EVENT_LINE];
    }
}

static int
allocate_instrumentation_data(PyCodeObject *code)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    if (code->_co_monitoring == NULL) {
        code->_co_monitoring = TyMem_Malloc(sizeof(_PyCoMonitoringData));
        if (code->_co_monitoring == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        code->_co_monitoring->local_monitors = (_Ty_LocalMonitors){ 0 };
        code->_co_monitoring->active_monitors = (_Ty_LocalMonitors){ 0 };
        code->_co_monitoring->tools = NULL;
        code->_co_monitoring->lines = NULL;
        code->_co_monitoring->line_tools = NULL;
        code->_co_monitoring->per_instruction_opcodes = NULL;
        code->_co_monitoring->per_instruction_tools = NULL;
    }
    return 0;
}

static int
update_instrumentation_data(PyCodeObject *code, TyInterpreterState *interp)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    int code_len = (int)Ty_SIZE(code);
    if (allocate_instrumentation_data(code)) {
        return -1;
    }
    // If the local monitors are out of date, clear them up
    _Ty_LocalMonitors *local_monitors = &code->_co_monitoring->local_monitors;
    for (int i = 0; i < PY_MONITORING_TOOL_IDS; i++) {
        if (code->_co_monitoring->tool_versions[i] != interp->monitoring_tool_versions[i]) {
            for (int j = 0; j < _PY_MONITORING_LOCAL_EVENTS; j++) {
                local_monitors->tools[j] &= ~(1 << i);
            }
        }
    }

    _Ty_LocalMonitors all_events = local_union(
        interp->monitors,
        code->_co_monitoring->local_monitors);
    bool multitools = multiple_tools(&all_events);
    if (code->_co_monitoring->tools == NULL && multitools) {
        code->_co_monitoring->tools = TyMem_Malloc(code_len);
        if (code->_co_monitoring->tools == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        initialize_tools(code);
    }
    if (all_events.tools[PY_MONITORING_EVENT_LINE]) {
        if (code->_co_monitoring->lines == NULL) {
            PyCodeAddressRange range;
            _TyCode_InitAddressRange(code, &range);
            int max_line = code->co_firstlineno + 1;
            _TyCode_InitAddressRange(code, &range);
            for (int i = code->_co_firsttraceable; i < code_len; ) {
                int line = _TyCode_CheckLineNumber(i*(int)sizeof(_Ty_CODEUNIT), &range);
                if (line > max_line) {
                    max_line = line;
                }
                int length = _PyInstruction_GetLength(code, i);
                i += length;
            }
            int bytes_per_entry;
            int max_delta = max_line - code->co_firstlineno;
            /* We store delta+2 in the table, so 253 is max for one byte */
            if (max_delta < 256+NO_LINE) {
                bytes_per_entry = 2;
            }
            else if (max_delta < (1 << 16)+NO_LINE) {
                bytes_per_entry = 3;
            }
            else if (max_delta < (1 << 24)+NO_LINE) {
                bytes_per_entry = 4;
            }
            else {
                bytes_per_entry = 5;
            }
            code->_co_monitoring->lines = TyMem_Malloc(1 + code_len * bytes_per_entry);
            if (code->_co_monitoring->lines == NULL) {
                TyErr_NoMemory();
                return -1;
            }
            initialize_lines(code, bytes_per_entry);
        }
        if (multitools && code->_co_monitoring->line_tools == NULL) {
            code->_co_monitoring->line_tools = TyMem_Malloc(code_len);
            if (code->_co_monitoring->line_tools == NULL) {
                TyErr_NoMemory();
                return -1;
            }
            initialize_line_tools(code, &all_events);
        }
    }
    if (all_events.tools[PY_MONITORING_EVENT_INSTRUCTION]) {
        if (code->_co_monitoring->per_instruction_opcodes == NULL) {
            code->_co_monitoring->per_instruction_opcodes = TyMem_Malloc(code_len * sizeof(_PyCoLineInstrumentationData));
            if (code->_co_monitoring->per_instruction_opcodes == NULL) {
                TyErr_NoMemory();
                return -1;
            }
            // Initialize all of the instructions so if local events change while another thread is executing
            // we know what the original opcode was.
            for (int i = 0; i < code_len; i++) {
                int opcode = _TyCode_CODE(code)[i].op.code;
                code->_co_monitoring->per_instruction_opcodes[i] = _TyOpcode_Deopt[opcode];
            }
        }
        if (multitools && code->_co_monitoring->per_instruction_tools == NULL) {
            code->_co_monitoring->per_instruction_tools = TyMem_Malloc(code_len);
            if (code->_co_monitoring->per_instruction_tools == NULL) {
                TyErr_NoMemory();
                return -1;
            }
            for (int i = 0; i < code_len; i++) {
                code->_co_monitoring->per_instruction_tools[i] = 0;
            }
        }
    }
    return 0;
}

static int
force_instrument_lock_held(PyCodeObject *code, TyInterpreterState *interp)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

#ifdef _Ty_TIER2
    if (code->co_executors != NULL) {
        _TyCode_Clear_Executors(code);
    }
    _Ty_Executors_InvalidateDependency(interp, code, 1);
#endif
    int code_len = (int)Ty_SIZE(code);
    /* Exit early to avoid creating instrumentation
     * data for potential statically allocated code
     * objects.
     * See https://github.com/python/cpython/issues/108390 */
    if (code->co_flags & CO_NO_MONITORING_EVENTS) {
        return 0;
    }
    if (update_instrumentation_data(code, interp)) {
        return -1;
    }
    _Ty_LocalMonitors active_events = local_union(
        interp->monitors,
        code->_co_monitoring->local_monitors);
    _Ty_LocalMonitors new_events;
    _Ty_LocalMonitors removed_events;

    bool restarted = interp->last_restart_version > code->_co_instrumentation_version;
    if (restarted) {
        removed_events = code->_co_monitoring->active_monitors;
        new_events = active_events;
    }
    else {
        removed_events = monitors_sub(code->_co_monitoring->active_monitors, active_events);
        new_events = monitors_sub(active_events, code->_co_monitoring->active_monitors);
        assert(monitors_are_empty(monitors_and(new_events, removed_events)));
    }
    code->_co_monitoring->active_monitors = active_events;
    if (monitors_are_empty(new_events) && monitors_are_empty(removed_events)) {
        goto done;
    }
    /* Insert instrumentation */
    for (int i = code->_co_firsttraceable; i < code_len; i+= _PyInstruction_GetLength(code, i)) {
        assert(_TyCode_CODE(code)[i].op.code != ENTER_EXECUTOR);
        _Ty_CODEUNIT instr = _Ty_GetBaseCodeUnit(code, i);
        CHECK(instr.op.code != 0);
        int base_opcode = instr.op.code;
        if (opcode_has_event(base_opcode)) {
            int8_t event;
            if (base_opcode == RESUME) {
                event = instr.op.arg > 0;
            }
            else {
                event = EVENT_FOR_OPCODE[base_opcode];
                assert(event > 0);
            }
            uint8_t removed_tools = removed_events.tools[event];
            if (removed_tools) {
                remove_tools(code, i, event, removed_tools);
            }
            uint8_t new_tools = new_events.tools[event];
            if (new_tools) {
                add_tools(code, i, event, new_tools);
            }
        }
    }

    // GH-103845: We need to remove both the line and instruction instrumentation before
    // adding new ones, otherwise we may remove the newly added instrumentation.
    uint8_t removed_line_tools = removed_events.tools[PY_MONITORING_EVENT_LINE];
    uint8_t removed_per_instruction_tools = removed_events.tools[PY_MONITORING_EVENT_INSTRUCTION];

    if (removed_line_tools) {
        _PyCoLineInstrumentationData *line_data = code->_co_monitoring->lines;
        for (int i = code->_co_firsttraceable; i < code_len;) {
            if (get_original_opcode(line_data, i)) {
                remove_line_tools(code, i, removed_line_tools);
            }
            i += _PyInstruction_GetLength(code, i);
        }
    }
    if (removed_per_instruction_tools) {
        for (int i = code->_co_firsttraceable; i < code_len;) {
            int opcode = _Ty_GetBaseCodeUnit(code, i).op.code;
            if (opcode == RESUME || opcode == END_FOR) {
                i += _PyInstruction_GetLength(code, i);
                continue;
            }
            remove_per_instruction_tools(code, i, removed_per_instruction_tools);
            i += _PyInstruction_GetLength(code, i);
        }
    }
#ifdef INSTRUMENT_DEBUG
    sanity_check_instrumentation(code);
#endif

    uint8_t new_line_tools = new_events.tools[PY_MONITORING_EVENT_LINE];
    uint8_t new_per_instruction_tools = new_events.tools[PY_MONITORING_EVENT_INSTRUCTION];

    if (new_line_tools) {
        _PyCoLineInstrumentationData *line_data = code->_co_monitoring->lines;
        for (int i = code->_co_firsttraceable; i < code_len;) {
            if (get_original_opcode(line_data, i)) {
                add_line_tools(code, i, new_line_tools);
            }
            i += _PyInstruction_GetLength(code, i);
        }
    }
    if (new_per_instruction_tools) {
        for (int i = code->_co_firsttraceable; i < code_len;) {
            int opcode = _Ty_GetBaseCodeUnit(code, i).op.code;
            if (opcode == RESUME || opcode == END_FOR) {
                i += _PyInstruction_GetLength(code, i);
                continue;
            }
            add_per_instruction_tools(code, i, new_per_instruction_tools);
            i += _PyInstruction_GetLength(code, i);
        }
    }

done:
    FT_ATOMIC_STORE_UINTPTR_RELEASE(code->_co_instrumentation_version,
                                    global_version(interp));

#ifdef INSTRUMENT_DEBUG
    sanity_check_instrumentation(code);
#endif
    return 0;
}

static int
instrument_lock_held(PyCodeObject *code, TyInterpreterState *interp)
{
    ASSERT_WORLD_STOPPED_OR_LOCKED(code);

    if (is_version_up_to_date(code, interp)) {
        assert(
            interp->ceval.instrumentation_version == 0 ||
            instrumentation_cross_checks(interp, code)
        );
        return 0;
    }

    return force_instrument_lock_held(code, interp);
}

int
_Ty_Instrument(PyCodeObject *code, TyInterpreterState *interp)
{
    int res;
    LOCK_CODE(code);
    res = instrument_lock_held(code, interp);
    UNLOCK_CODE();
    return res;
}

#define C_RETURN_EVENTS \
    ((1 << PY_MONITORING_EVENT_C_RETURN) | \
     (1 << PY_MONITORING_EVENT_C_RAISE))

#define C_CALL_EVENTS \
    (C_RETURN_EVENTS | (1 << PY_MONITORING_EVENT_CALL))


static int
instrument_all_executing_code_objects(TyInterpreterState *interp) {
    ASSERT_WORLD_STOPPED();

    _PyRuntimeState *runtime = &_PyRuntime;
    HEAD_LOCK(runtime);
    TyThreadState* ts = TyInterpreterState_ThreadHead(interp);
    HEAD_UNLOCK(runtime);
    while (ts) {
        _PyInterpreterFrame *frame = ts->current_frame;
        while (frame) {
            if (frame->owner < FRAME_OWNED_BY_INTERPRETER) {
                if (instrument_lock_held(_TyFrame_GetCode(frame), interp)) {
                    return -1;
                }
            }
            frame = frame->previous;
        }
        HEAD_LOCK(runtime);
        ts = TyThreadState_Next(ts);
        HEAD_UNLOCK(runtime);
    }
    return 0;
}

static void
set_events(_Ty_GlobalMonitors *m, int tool_id, _PyMonitoringEventSet events)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    for (int e = 0; e < _PY_MONITORING_UNGROUPED_EVENTS; e++) {
        uint8_t *tools = &m->tools[e];
        int active = (events >> e) & 1;
        *tools &= ~(1 << tool_id);
        *tools |= (active << tool_id);
    }
}

static void
set_local_events(_Ty_LocalMonitors *m, int tool_id, _PyMonitoringEventSet events)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    for (int e = 0; e < _PY_MONITORING_LOCAL_EVENTS; e++) {
        uint8_t *tools = &m->tools[e];
        int val = (events >> e) & 1;
        *tools &= ~(1 << tool_id);
        *tools |= (val << tool_id);
    }
}

static int
check_tool(TyInterpreterState *interp, int tool_id)
{
    if (tool_id < PY_MONITORING_SYS_PROFILE_ID &&
        interp->monitoring_tool_names[tool_id] == NULL)
    {
        TyErr_Format(TyExc_ValueError, "tool %d is not in use", tool_id);
        return -1;
    }
    return 0;
}

/* We share the eval-breaker with flags, so the monitoring
 * version goes in the top 24 bits */
#define MONITORING_VERSION_INCREMENT (1 << _PY_EVAL_EVENTS_BITS)

int
_PyMonitoring_SetEvents(int tool_id, _PyMonitoringEventSet events)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    TyThreadState *tstate = _TyThreadState_GET();
    TyInterpreterState *interp = tstate->interp;
    assert(events < (1 << _PY_MONITORING_UNGROUPED_EVENTS));
    if (check_tool(interp, tool_id)) {
        return -1;
    }

    int res;
    _TyEval_StopTheWorld(interp);
    uint32_t existing_events = get_events(&interp->monitors, tool_id);
    if (existing_events == events) {
        res = 0;
        goto done;
    }
    set_events(&interp->monitors, tool_id, events);
    uint32_t new_version = global_version(interp) + MONITORING_VERSION_INCREMENT;
    if (new_version == 0) {
        TyErr_Format(TyExc_OverflowError, "events set too many times");
        res = -1;
        goto done;
    }
    set_global_version(tstate, new_version);
#ifdef _Ty_TIER2
    _Ty_Executors_InvalidateAll(interp, 1);
#endif
    res = instrument_all_executing_code_objects(interp);
done:
    _TyEval_StartTheWorld(interp);
    return res;
}

int
_PyMonitoring_SetLocalEvents(PyCodeObject *code, int tool_id, _PyMonitoringEventSet events)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(events < (1 << _PY_MONITORING_LOCAL_EVENTS));
    if (code->_co_firsttraceable >= Ty_SIZE(code)) {
        TyErr_Format(TyExc_SystemError, "cannot instrument shim code object '%U'", code->co_name);
        return -1;
    }
    if (check_tool(interp, tool_id)) {
        return -1;
    }

    int res;
    _TyEval_StopTheWorld(interp);
    if (allocate_instrumentation_data(code)) {
        res = -1;
        goto done;
    }

    code->_co_monitoring->tool_versions[tool_id] = interp->monitoring_tool_versions[tool_id];

    _Ty_LocalMonitors *local = &code->_co_monitoring->local_monitors;
    uint32_t existing_events = get_local_events(local, tool_id);
    if (existing_events == events) {
        res = 0;
        goto done;
    }
    set_local_events(local, tool_id, events);

    res = force_instrument_lock_held(code, interp);

done:
    _TyEval_StartTheWorld(interp);
    return res;
}

int
_PyMonitoring_GetLocalEvents(PyCodeObject *code, int tool_id, _PyMonitoringEventSet *events)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (check_tool(interp, tool_id)) {
        return -1;
    }
    if (code->_co_monitoring == NULL) {
        *events = 0;
        return 0;
    }
    _Ty_LocalMonitors *local = &code->_co_monitoring->local_monitors;
    *events = get_local_events(local, tool_id);
    return 0;
}

int _PyMonitoring_ClearToolId(int tool_id)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    TyInterpreterState *interp = _TyInterpreterState_GET();

    for (int i = 0; i < _PY_MONITORING_EVENTS; i++) {
        TyObject *func = _PyMonitoring_RegisterCallback(tool_id, i, NULL);
        if (func != NULL) {
            Ty_DECREF(func);
        }
    }

    if (_PyMonitoring_SetEvents(tool_id, 0) < 0) {
        return -1;
    }

    _TyEval_StopTheWorld(interp);
    uint32_t version = global_version(interp) + MONITORING_VERSION_INCREMENT;
    if (version == 0) {
        TyErr_Format(TyExc_OverflowError, "events set too many times");
        _TyEval_StartTheWorld(interp);
        return -1;
    }

    // monitoring_tool_versions[tool_id] is set to latest global version here to
    //   1. invalidate local events on all existing code objects
    //   2. be ready for the next call to set local events
    interp->monitoring_tool_versions[tool_id] = version;

    // Set the new global version so all the code objects can refresh the
    // instrumentation.
    set_global_version(_TyThreadState_GET(), version);
    int res = instrument_all_executing_code_objects(interp);
    _TyEval_StartTheWorld(interp);
    return res;
}

/*[clinic input]
module monitoring
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=37257f5987a360cf]*/
/*[clinic end generated code]*/

#include "clinic/instrumentation.c.h"

static int
check_valid_tool(int tool_id)
{
    if (tool_id < 0 || tool_id >= PY_MONITORING_SYS_PROFILE_ID) {
        TyErr_Format(TyExc_ValueError, "invalid tool %d (must be between 0 and 5)", tool_id);
        return -1;
    }
    return 0;
}

/*[clinic input]
monitoring.use_tool_id

    tool_id: int
    name: object
    /

[clinic start generated code]*/

static TyObject *
monitoring_use_tool_id_impl(TyObject *module, int tool_id, TyObject *name)
/*[clinic end generated code: output=30d76dc92b7cd653 input=ebc453761c621be1]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    if (!TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_ValueError, "tool name must be a str");
        return NULL;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (interp->monitoring_tool_names[tool_id] != NULL) {
        TyErr_Format(TyExc_ValueError, "tool %d is already in use", tool_id);
        return NULL;
    }
    interp->monitoring_tool_names[tool_id] = Ty_NewRef(name);
    Py_RETURN_NONE;
}

/*[clinic input]
monitoring.clear_tool_id

    tool_id: int
    /

[clinic start generated code]*/

static TyObject *
monitoring_clear_tool_id_impl(TyObject *module, int tool_id)
/*[clinic end generated code: output=04defc23470b1be7 input=af643d6648a66163]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();

    if (interp->monitoring_tool_names[tool_id] != NULL) {
        if (_PyMonitoring_ClearToolId(tool_id) < 0) {
            return NULL;
        }
    }

    Py_RETURN_NONE;
}

/*[clinic input]
monitoring.free_tool_id

    tool_id: int
    /

[clinic start generated code]*/

static TyObject *
monitoring_free_tool_id_impl(TyObject *module, int tool_id)
/*[clinic end generated code: output=86c2d2a1219a8591 input=a23fb6be3a8618e9]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();

    if (interp->monitoring_tool_names[tool_id] != NULL) {
        if (_PyMonitoring_ClearToolId(tool_id) < 0) {
            return NULL;
        }
    }

    Ty_CLEAR(interp->monitoring_tool_names[tool_id]);
    Py_RETURN_NONE;
}

/*[clinic input]
monitoring.get_tool

    tool_id: int
    /

[clinic start generated code]*/

static TyObject *
monitoring_get_tool_impl(TyObject *module, int tool_id)
/*[clinic end generated code: output=1c05a98b404a9a16 input=eeee9bebd0bcae9d]*/

/*[clinic end generated code]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyObject *name = interp->monitoring_tool_names[tool_id];
    if (name == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(name);
}

/*[clinic input]
monitoring.register_callback


    tool_id: int
    event: int
    func: object
    /

[clinic start generated code]*/

static TyObject *
monitoring_register_callback_impl(TyObject *module, int tool_id, int event,
                                  TyObject *func)
/*[clinic end generated code: output=e64daa363004030c input=df6d70ea4cf81007]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    if (_Ty_popcount32(event) != 1) {
        TyErr_SetString(TyExc_ValueError, "The callback can only be set for one event at a time");
        return NULL;
    }
    int event_id = _Ty_bit_length(event)-1;
    if (event_id < 0 || event_id >= _PY_MONITORING_EVENTS) {
        TyErr_Format(TyExc_ValueError, "invalid event %d", event);
        return NULL;
    }
    if (TySys_Audit("sys.monitoring.register_callback", "O", func) < 0) {
        return NULL;
    }
    if (func == Ty_None) {
        func = NULL;
    }
    func = _PyMonitoring_RegisterCallback(tool_id, event_id, func);
    if (func == NULL) {
        Py_RETURN_NONE;
    }
    return func;
}

/*[clinic input]
monitoring.get_events -> int

    tool_id: int
    /

[clinic start generated code]*/

static int
monitoring_get_events_impl(TyObject *module, int tool_id)
/*[clinic end generated code: output=4450cc13f826c8c0 input=a64b238f76c4b2f7]*/
{
    if (check_valid_tool(tool_id))  {
        return -1;
    }
    _Ty_GlobalMonitors *m = &_TyInterpreterState_GET()->monitors;
    _PyMonitoringEventSet event_set = get_events(m, tool_id);
    return event_set;
}

/*[clinic input]
monitoring.set_events

    tool_id: int
    event_set: int
    /

[clinic start generated code]*/

static TyObject *
monitoring_set_events_impl(TyObject *module, int tool_id, int event_set)
/*[clinic end generated code: output=1916c1e49cfb5bdb input=a77ba729a242142b]*/
{
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    if (event_set < 0 || event_set >= (1 << _PY_MONITORING_EVENTS)) {
        TyErr_Format(TyExc_ValueError, "invalid event set 0x%x", event_set);
        return NULL;
    }
    if ((event_set & C_RETURN_EVENTS) && (event_set & C_CALL_EVENTS) != C_CALL_EVENTS) {
        TyErr_Format(TyExc_ValueError, "cannot set C_RETURN or C_RAISE events independently");
        return NULL;
    }
    event_set &= ~C_RETURN_EVENTS;
    if (event_set & (1 << PY_MONITORING_EVENT_BRANCH)) {
        event_set &= ~(1 << PY_MONITORING_EVENT_BRANCH);
        event_set |= (1 << PY_MONITORING_EVENT_BRANCH_RIGHT) | (1 << PY_MONITORING_EVENT_BRANCH_LEFT);
    }
    if (_PyMonitoring_SetEvents(tool_id, event_set)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
monitoring.get_local_events -> int

    tool_id: int
    code: object
    /

[clinic start generated code]*/

static int
monitoring_get_local_events_impl(TyObject *module, int tool_id,
                                 TyObject *code)
/*[clinic end generated code: output=d3e92c1c9c1de8f9 input=bb0f927530386a94]*/
{
    if (!TyCode_Check(code)) {
        TyErr_Format(
            TyExc_TypeError,
            "code must be a code object"
        );
        return -1;
    }
    if (check_valid_tool(tool_id))  {
        return -1;
    }
    _PyMonitoringEventSet event_set = 0;
    _PyCoMonitoringData *data = ((PyCodeObject *)code)->_co_monitoring;
    if (data != NULL) {
        for (int e = 0; e < _PY_MONITORING_LOCAL_EVENTS; e++) {
            if ((data->local_monitors.tools[e] >> tool_id) & 1) {
                event_set |= (1 << e);
            }
        }
    }
    return event_set;
}

/*[clinic input]
monitoring.set_local_events

    tool_id: int
    code: object
    event_set: int
    /

[clinic start generated code]*/

static TyObject *
monitoring_set_local_events_impl(TyObject *module, int tool_id,
                                 TyObject *code, int event_set)
/*[clinic end generated code: output=68cc755a65dfea99 input=5655ecd78d937a29]*/
{
    if (!TyCode_Check(code)) {
        TyErr_Format(
            TyExc_TypeError,
            "code must be a code object"
        );
        return NULL;
    }
    if (check_valid_tool(tool_id))  {
        return NULL;
    }
    if ((event_set & C_RETURN_EVENTS) && (event_set & C_CALL_EVENTS) != C_CALL_EVENTS) {
        TyErr_Format(TyExc_ValueError, "cannot set C_RETURN or C_RAISE events independently");
        return NULL;
    }
    event_set &= ~C_RETURN_EVENTS;
    if (event_set & (1 << PY_MONITORING_EVENT_BRANCH)) {
        event_set &= ~(1 << PY_MONITORING_EVENT_BRANCH);
        event_set |= (1 << PY_MONITORING_EVENT_BRANCH_RIGHT) | (1 << PY_MONITORING_EVENT_BRANCH_LEFT);
    }
    if (event_set < 0 || event_set >= (1 << _PY_MONITORING_LOCAL_EVENTS)) {
        TyErr_Format(TyExc_ValueError, "invalid local event set 0x%x", event_set);
        return NULL;
    }

    if (_PyMonitoring_SetLocalEvents((PyCodeObject*)code, tool_id, event_set)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
monitoring.restart_events

[clinic start generated code]*/

static TyObject *
monitoring_restart_events_impl(TyObject *module)
/*[clinic end generated code: output=e025dd5ba33314c4 input=add8a855063c8008]*/
{
    /* We want to ensure that:
     * last restart version > instrumented version for all code objects
     * last restart version < current version
     */
    TyThreadState *tstate = _TyThreadState_GET();
    TyInterpreterState *interp = tstate->interp;

    _TyEval_StopTheWorld(interp);
    uint32_t restart_version = global_version(interp) + MONITORING_VERSION_INCREMENT;
    uint32_t new_version = restart_version + MONITORING_VERSION_INCREMENT;
    if (new_version <= MONITORING_VERSION_INCREMENT) {
        _TyEval_StartTheWorld(interp);
        TyErr_Format(TyExc_OverflowError, "events set too many times");
        return NULL;
    }
    interp->last_restart_version = restart_version;
    set_global_version(tstate, new_version);
    int res = instrument_all_executing_code_objects(interp);
    _TyEval_StartTheWorld(interp);

    if (res) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static int
add_power2_constant(TyObject *obj, const char *name, int i)
{
    TyObject *val = TyLong_FromLong(1<<i);
    if (val == NULL) {
        return -1;
    }
    int err = PyObject_SetAttrString(obj, name, val);
    Ty_DECREF(val);
    return err;
}

/*[clinic input]
monitoring._all_events
[clinic start generated code]*/

static TyObject *
monitoring__all_events_impl(TyObject *module)
/*[clinic end generated code: output=6b7581e2dbb690f6 input=62ee9672c17b7f0e]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    TyObject *res = TyDict_New();
    if (res == NULL) {
        return NULL;
    }
    for (int e = 0; e < _PY_MONITORING_UNGROUPED_EVENTS; e++) {
        uint8_t tools = interp->monitors.tools[e];
        if (tools == 0) {
            continue;
        }
        TyObject *tools_obj = TyLong_FromLong(tools);
        assert(tools_obj != NULL);
        int err = TyDict_SetItemString(res, event_names[e], tools_obj);
        Ty_DECREF(tools_obj);
        if (err < 0) {
            Ty_DECREF(res);
            return NULL;
        }
    }
    return res;
}

static TyMethodDef methods[] = {
    MONITORING_USE_TOOL_ID_METHODDEF
    MONITORING_CLEAR_TOOL_ID_METHODDEF
    MONITORING_FREE_TOOL_ID_METHODDEF
    MONITORING_GET_TOOL_METHODDEF
    MONITORING_REGISTER_CALLBACK_METHODDEF
    MONITORING_GET_EVENTS_METHODDEF
    MONITORING_SET_EVENTS_METHODDEF
    MONITORING_GET_LOCAL_EVENTS_METHODDEF
    MONITORING_SET_LOCAL_EVENTS_METHODDEF
    MONITORING_RESTART_EVENTS_METHODDEF
    MONITORING__ALL_EVENTS_METHODDEF
    {NULL, NULL}  // sentinel
};

static struct TyModuleDef monitoring_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "sys.monitoring",
    .m_size = -1, /* multiple "initialization" just copies the module dict. */
    .m_methods = methods,
};

TyObject *_Ty_CreateMonitoringObject(void)
{
    TyObject *mod = _TyModule_CreateInitialized(&monitoring_module, PYTHON_API_VERSION);
    if (mod == NULL) {
        return NULL;
    }
    if (PyObject_SetAttrString(mod, "DISABLE", &_PyInstrumentation_DISABLE)) {
        goto error;
    }
    if (PyObject_SetAttrString(mod, "MISSING", &_PyInstrumentation_MISSING)) {
        goto error;
    }
    TyObject *events = _PyNamespace_New(NULL);
    if (events == NULL) {
        goto error;
    }
    int err = PyObject_SetAttrString(mod, "events", events);
    Ty_DECREF(events);
    if (err) {
        goto error;
    }
    for (int i = 0; i < _PY_MONITORING_EVENTS; i++) {
        if (add_power2_constant(events, event_names[i], i)) {
            goto error;
        }
    }
    err = PyObject_SetAttrString(events, "NO_EVENTS", _TyLong_GetZero());
    if (err) goto error;
    TyObject *val = TyLong_FromLong(PY_MONITORING_DEBUGGER_ID);
    assert(val != NULL); /* Can't return NULL because the int is small. */
    err = PyObject_SetAttrString(mod, "DEBUGGER_ID", val);
    Ty_DECREF(val);
    if (err) goto error;
    val = TyLong_FromLong(PY_MONITORING_COVERAGE_ID);
    assert(val != NULL);
    err = PyObject_SetAttrString(mod, "COVERAGE_ID", val);
    Ty_DECREF(val);
    if (err) goto error;
    val = TyLong_FromLong(PY_MONITORING_PROFILER_ID);
    assert(val != NULL);
    err = PyObject_SetAttrString(mod, "PROFILER_ID", val);
    Ty_DECREF(val);
    if (err) goto error;
    val = TyLong_FromLong(PY_MONITORING_OPTIMIZER_ID);
    assert(val != NULL);
    err = PyObject_SetAttrString(mod, "OPTIMIZER_ID", val);
    Ty_DECREF(val);
    if (err) goto error;
    return mod;
error:
    Ty_DECREF(mod);
    return NULL;
}


static int
capi_call_instrumentation(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                          TyObject **args, Ty_ssize_t nargs, int event)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyInterpreterState *interp = tstate->interp;

    uint8_t tools = state->active;
    assert(args[1] == NULL);
    args[1] = codelike;
    if (offset < 0) {
        TyErr_SetString(TyExc_ValueError, "offset must be non-negative");
        return -1;
    }
    if (event != PY_MONITORING_EVENT_LINE) {
        TyObject *offset_obj = TyLong_FromLong(offset);
        if (offset_obj == NULL) {
            return -1;
        }
        assert(args[2] == NULL);
        args[2] = offset_obj;
    }
    size_t nargsf = (size_t) nargs | PY_VECTORCALL_ARGUMENTS_OFFSET;
    TyObject **callargs = &args[1];
    int err = 0;

    while (tools) {
        int tool = most_significant_bit(tools);
        assert(tool >= 0 && tool < 8);
        assert(tools & (1 << tool));
        tools ^= (1 << tool);
        int res = call_one_instrument(interp, tstate, callargs, nargsf, tool, event);
        if (res == 0) {
            /* Nothing to do */
        }
        else if (res < 0) {
            /* error */
            err = -1;
            break;
        }
        else {
            /* DISABLE */
            if (!PY_MONITORING_IS_INSTRUMENTED_EVENT(event)) {
                TyErr_Format(TyExc_ValueError,
                             "Cannot disable %s events. Callback removed.",
                             event_names[event]);
                /* Clear tool to prevent infinite loop */
                Ty_CLEAR(interp->monitoring_callables[tool][event]);
                err = -1;
                break;
            }
            else {
                state->active &= ~(1 << tool);
            }
        }
    }
    return err;
}

int
PyMonitoring_EnterScope(PyMonitoringState *state_array, uint64_t *version,
                         const uint8_t *event_types, Ty_ssize_t length)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (global_version(interp) == *version) {
        return 0;
    }

    _Ty_GlobalMonitors *m = &interp->monitors;
    for (Ty_ssize_t i = 0; i < length; i++) {
        int event = event_types[i];
        state_array[i].active = m->tools[event];
    }
    *version = global_version(interp);
    return 0;
}

int
PyMonitoring_ExitScope(void)
{
    return 0;
}

int
_PyMonitoring_FirePyStartEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    assert(state->active);
    TyObject *args[3] = { NULL, NULL, NULL };
    return capi_call_instrumentation(state, codelike, offset, args, 2,
                                     PY_MONITORING_EVENT_PY_START);
}

int
_PyMonitoring_FirePyResumeEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    assert(state->active);
    TyObject *args[3] = { NULL, NULL, NULL };
    return capi_call_instrumentation(state, codelike, offset, args, 2,
                                     PY_MONITORING_EVENT_PY_RESUME);
}



int
_PyMonitoring_FirePyReturnEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                                TyObject* retval)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, retval };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_PY_RETURN);
}

int
_PyMonitoring_FirePyYieldEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                               TyObject* retval)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, retval };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_PY_YIELD);
}

int
_PyMonitoring_FireCallEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                            TyObject* callable, TyObject *arg0)
{
    assert(state->active);
    TyObject *args[5] = { NULL, NULL, NULL, callable, arg0 };
    return capi_call_instrumentation(state, codelike, offset, args, 4,
                                     PY_MONITORING_EVENT_CALL);
}

int
_PyMonitoring_FireLineEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                            int lineno)
{
    assert(state->active);
    TyObject *lno = TyLong_FromLong(lineno);
    if (lno == NULL) {
        return -1;
    }
    TyObject *args[3] = { NULL, NULL, lno };
    int res= capi_call_instrumentation(state, codelike, offset, args, 2,
                                       PY_MONITORING_EVENT_LINE);
    Ty_DECREF(lno);
    return res;
}

int
_PyMonitoring_FireJumpEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                            TyObject *target_offset)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, target_offset };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_JUMP);
}

int
_PyMonitoring_FireBranchEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                              TyObject *target_offset)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, target_offset };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_BRANCH_RIGHT);
}

int
_PyMonitoring_FireBranchRightEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                              TyObject *target_offset)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, target_offset };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_BRANCH_RIGHT);
}

int
_PyMonitoring_FireBranchLeftEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                              TyObject *target_offset)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, target_offset };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_BRANCH_LEFT);
}

int
_PyMonitoring_FireCReturnEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset,
                               TyObject *retval)
{
    assert(state->active);
    TyObject *args[4] = { NULL, NULL, NULL, retval };
    return capi_call_instrumentation(state, codelike, offset, args, 3,
                                     PY_MONITORING_EVENT_C_RETURN);
}

static inline int
exception_event_setup(TyObject **exc, int event) {
    *exc = TyErr_GetRaisedException();
    if (*exc == NULL) {
        TyErr_Format(TyExc_ValueError,
                     "Firing event %d with no exception set",
                     event);
        return -1;
    }
    return 0;
}


static inline int
exception_event_teardown(int err, TyObject *exc) {
    if (err == 0) {
        TyErr_SetRaisedException(exc);
    }
    else {
        assert(TyErr_Occurred());
        Ty_XDECREF(exc);
    }
    return err;
}

int
_PyMonitoring_FirePyThrowEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_PY_THROW;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FireRaiseEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_RAISE;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FireCRaiseEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_C_RAISE;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FireReraiseEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_RERAISE;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FireExceptionHandledEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_EXCEPTION_HANDLED;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FirePyUnwindEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset)
{
    int event = PY_MONITORING_EVENT_PY_UNWIND;
    assert(state->active);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    return exception_event_teardown(err, exc);
}

int
_PyMonitoring_FireStopIterationEvent(PyMonitoringState *state, TyObject *codelike, int32_t offset, TyObject *value)
{
    int event = PY_MONITORING_EVENT_STOP_ITERATION;
    assert(state->active);
    assert(!TyErr_Occurred());
    TyErr_SetObject(TyExc_StopIteration, value);
    TyObject *exc;
    if (exception_event_setup(&exc, event) < 0) {
        return -1;
    }
    TyObject *args[4] = { NULL, NULL, NULL, exc };
    int err = capi_call_instrumentation(state, codelike, offset, args, 3, event);
    Ty_DECREF(exc);
    return exception_event_teardown(err, NULL);
}



/* Handle legacy BRANCH event */

typedef struct _PyLegacyBranchEventHandler {
    PyObject_HEAD
    vectorcallfunc vectorcall;
    TyObject *handler;
    bool right;
    int tool_id;
} _PyLegacyBranchEventHandler;

#define _PyLegacyBranchEventHandler_CAST(op)    ((_PyLegacyBranchEventHandler *)(op))

static void
dealloc_branch_handler(TyObject *op)
{
    _PyLegacyBranchEventHandler *self = _PyLegacyBranchEventHandler_CAST(op);
    Ty_CLEAR(self->handler);
    PyObject_Free(self);
}

static TyTypeObject _PyLegacyBranchEventHandler_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "sys.monitoring.branch_event_handler",
    sizeof(_PyLegacyBranchEventHandler),
    .tp_dealloc = dealloc_branch_handler,
    .tp_vectorcall_offset = offsetof(_PyLegacyBranchEventHandler, vectorcall),
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
        Ty_TPFLAGS_HAVE_VECTORCALL | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    .tp_call = PyVectorcall_Call,
};


static TyObject *
branch_handler_vectorcall(
    TyObject *op, TyObject *const *args,
    size_t nargsf, TyObject *kwnames
) {
    _PyLegacyBranchEventHandler *self = _PyLegacyBranchEventHandler_CAST(op);
    // Find the other instrumented instruction and remove tool
    // The spec (PEP 669) allows spurious events after a DISABLE,
    // so a best effort is good enough.
    assert(PyVectorcall_NARGS(nargsf) >= 3);
    PyCodeObject *code = (PyCodeObject *)args[0];
    int src_offset = TyLong_AsLong(args[1]);
    if (TyErr_Occurred()) {
        return NULL;
    }
    _Ty_CODEUNIT instr = _TyCode_CODE(code)[src_offset/2];
    if (!is_instrumented(instr.op.code)) {
        /* Already disabled */
        return &_PyInstrumentation_DISABLE;
    }
    TyObject *res = PyObject_Vectorcall(self->handler, args, nargsf, kwnames);
    if (res == &_PyInstrumentation_DISABLE) {
        /* We need FOR_ITER and POP_JUMP_ to be the same size */
        assert(INLINE_CACHE_ENTRIES_FOR_ITER == 1);
        int offset;
        int other_event;
        if (instr.op.code == FOR_ITER) {
            if (self->right) {
                offset = src_offset/2;
                other_event = PY_MONITORING_EVENT_BRANCH_LEFT;
            }
            else {
                // We don't know where the POP_ITER is, so
                // we cannot de-instrument it.
                return res;
            }
        }
        else if (IS_CONDITIONAL_JUMP_OPCODE(instr.op.code)) {
            if (self->right) {
                offset = src_offset/2 + 2;
                other_event = PY_MONITORING_EVENT_BRANCH_LEFT;
                assert(_Ty_GetBaseCodeUnit(code, offset).op.code == NOT_TAKEN);
            }
            else {
                offset = src_offset/2;
                other_event = PY_MONITORING_EVENT_BRANCH_RIGHT;
            }
        }
        else {
            // Orphaned NOT_TAKEN -- Jump removed by the compiler
            return res;
        }
        LOCK_CODE(code);
        remove_tools(code, offset, other_event, 1 << self->tool_id);
        UNLOCK_CODE();
    }
    return res;
}

static TyObject *make_branch_handler(int tool_id, TyObject *handler, bool right)
{
    _PyLegacyBranchEventHandler *callback =
        PyObject_NEW(_PyLegacyBranchEventHandler, &_PyLegacyBranchEventHandler_Type);
    if (callback == NULL) {
        return NULL;
    }
    callback->vectorcall = branch_handler_vectorcall;
    callback->handler = Ty_NewRef(handler);
    callback->right = right;
    callback->tool_id = tool_id;
    return (TyObject *)callback;
}

TyObject *
_PyMonitoring_RegisterCallback(int tool_id, int event_id, TyObject *obj)
{
    assert(0 <= tool_id && tool_id < PY_MONITORING_TOOL_IDS);
    assert(0 <= event_id && event_id < _PY_MONITORING_EVENTS);
    TyObject *res;
    if (event_id == PY_MONITORING_EVENT_BRANCH) {
        TyObject *left, *right;
        if (obj == NULL) {
            left = NULL;
            right = NULL;
        }
        else {
            right = make_branch_handler(tool_id, obj, true);
            if (right == NULL) {
                return NULL;
            }
            left = make_branch_handler(tool_id, obj, false);
            if (left == NULL) {
                Ty_DECREF(right);
                return NULL;
            }
        }
        TyInterpreterState *interp = _TyInterpreterState_GET();
        _TyEval_StopTheWorld(interp);
        TyObject *old_right = interp->monitoring_callables[tool_id][PY_MONITORING_EVENT_BRANCH_RIGHT];
        interp->monitoring_callables[tool_id][PY_MONITORING_EVENT_BRANCH_RIGHT] = right;
        res = interp->monitoring_callables[tool_id][PY_MONITORING_EVENT_BRANCH_LEFT];
        interp->monitoring_callables[tool_id][PY_MONITORING_EVENT_BRANCH_LEFT] = left;
        _TyEval_StartTheWorld(interp);
        Ty_XDECREF(old_right);
    }
    else {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        _TyEval_StopTheWorld(interp);
        res = interp->monitoring_callables[tool_id][event_id];
        interp->monitoring_callables[tool_id][event_id] = Ty_XNewRef(obj);
        _TyEval_StartTheWorld(interp);
    }
    if (res != NULL && Ty_TYPE(res) == &_PyLegacyBranchEventHandler_Type) {
        _PyLegacyBranchEventHandler *wrapper = (_PyLegacyBranchEventHandler *)res;
        res = Ty_NewRef(wrapper->handler);
        Ty_DECREF(wrapper);
    }
    return res;
}

/* Branch Iterator */

typedef struct {
    PyObject_HEAD
    PyCodeObject *bi_code;
    int bi_offset;
} branchesiterator;

#define branchesiterator_CAST(op)   ((branchesiterator *)(op))

static TyObject *
int_triple(int a, int b, int c) {
    TyObject *obja = TyLong_FromLong(a);
    TyObject *objb = NULL;
    TyObject *objc = NULL;
    if (obja == NULL) {
        goto error;
    }
    objb = TyLong_FromLong(b);
    if (objb == NULL) {
        goto error;
    }
    objc = TyLong_FromLong(c);
    if (objc == NULL) {
        goto error;
    }
    TyObject *array[3] = { obja, objb, objc };
    return _TyTuple_FromArraySteal(array, 3);
error:
    Ty_XDECREF(obja);
    Ty_XDECREF(objb);
    Ty_XDECREF(objc);
    return NULL;
}

static TyObject *
branchesiter_next(TyObject *op)
{
    branchesiterator *bi = branchesiterator_CAST(op);
    int offset = bi->bi_offset;
    int oparg = 0;
    while (offset < Ty_SIZE(bi->bi_code)) {
        _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(bi->bi_code, offset);
        int next_offset = offset + 1 + _TyOpcode_Caches[inst.op.code];
        switch(inst.op.code) {
            case EXTENDED_ARG:
                oparg = (oparg << 8) | inst.op.arg;
                break;
            case FOR_ITER:
                oparg = (oparg << 8) | inst.op.arg;
                bi->bi_offset = next_offset;
                int target = next_offset + oparg+2; // Skips END_FOR and POP_ITER
                return int_triple(offset*2, next_offset*2, target*2);
            case POP_JUMP_IF_FALSE:
            case POP_JUMP_IF_TRUE:
            case POP_JUMP_IF_NONE:
            case POP_JUMP_IF_NOT_NONE:
                oparg = (oparg << 8) | inst.op.arg;
                /* Skip NOT_TAKEN */
                int not_taken = next_offset + 1;
                bi->bi_offset = not_taken;
                return int_triple(offset*2, not_taken*2, (next_offset + oparg)*2);
            case END_ASYNC_FOR:
                oparg = (oparg << 8) | inst.op.arg;
                int src_offset = next_offset - oparg;
                bi->bi_offset = next_offset;
                assert(_Ty_GetBaseCodeUnit(bi->bi_code, src_offset).op.code == END_SEND);
                assert(_Ty_GetBaseCodeUnit(bi->bi_code, src_offset+1).op.code == NOT_TAKEN);
                not_taken = src_offset + 2;
                return int_triple(src_offset *2, not_taken*2, next_offset*2);
            default:
                oparg = 0;
        }
        offset = next_offset;
    }
    return NULL;
}

static void
branchesiter_dealloc(TyObject *op)
{
    branchesiterator *bi = branchesiterator_CAST(op);
    Ty_DECREF(bi->bi_code);
    PyObject_Free(bi);
}

static TyTypeObject _PyBranchesIterator = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "line_iterator",                    /* tp_name */
    sizeof(branchesiterator),           /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    .tp_dealloc = branchesiter_dealloc,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = branchesiter_next,
    .tp_free = PyObject_Del,
};

TyObject *
_PyInstrumentation_BranchesIterator(PyCodeObject *code)
{

    branchesiterator *bi = (branchesiterator *)TyType_GenericAlloc(&_PyBranchesIterator, 0);
    if (bi == NULL) {
        return NULL;
    }
    bi->bi_code = (PyCodeObject*)Ty_NewRef(code);
    bi->bi_offset = 0;
    return (TyObject *)bi;
}
