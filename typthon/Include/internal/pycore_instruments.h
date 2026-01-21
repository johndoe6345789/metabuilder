#ifndef Ty_INTERNAL_INSTRUMENT_H
#define Ty_INTERNAL_INSTRUMENT_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_structs.h"       // _Ty_CODEUNIT
#include "pycore_typedefs.h"      // _PyInterpreterFrame

#ifdef __cplusplus
extern "C" {
#endif

typedef uint32_t _PyMonitoringEventSet;

/* Tool IDs */

/* These are defined in PEP 669 for convenience to avoid clashes */
#define PY_MONITORING_DEBUGGER_ID 0
#define PY_MONITORING_COVERAGE_ID 1
#define PY_MONITORING_PROFILER_ID 2
#define PY_MONITORING_OPTIMIZER_ID 5

/* Internal IDs used to support sys.setprofile() and sys.settrace() */
#define PY_MONITORING_SYS_PROFILE_ID 6
#define PY_MONITORING_SYS_TRACE_ID 7


TyObject *_PyMonitoring_RegisterCallback(int tool_id, int event_id, TyObject *obj);

int _PyMonitoring_SetEvents(int tool_id, _PyMonitoringEventSet events);
int _PyMonitoring_SetLocalEvents(PyCodeObject *code, int tool_id, _PyMonitoringEventSet events);
int _PyMonitoring_GetLocalEvents(PyCodeObject *code, int tool_id, _PyMonitoringEventSet *events);

extern int
_Ty_call_instrumentation(TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr);

extern int
_Ty_call_instrumentation_line(TyThreadState *tstate, _PyInterpreterFrame* frame,
                              _Ty_CODEUNIT *instr, _Ty_CODEUNIT *prev);

extern int
_Ty_call_instrumentation_instruction(
    TyThreadState *tstate, _PyInterpreterFrame* frame, _Ty_CODEUNIT *instr);

_Ty_CODEUNIT *
_Ty_call_instrumentation_jump(
    _Ty_CODEUNIT *instr, TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *src, _Ty_CODEUNIT *dest);

extern int
_Ty_call_instrumentation_arg(TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg);

extern int
_Ty_call_instrumentation_2args(TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg0, TyObject *arg1);

extern void
_Ty_call_instrumentation_exc2(TyThreadState *tstate, int event,
    _PyInterpreterFrame *frame, _Ty_CODEUNIT *instr, TyObject *arg0, TyObject *arg1);

extern int
_Ty_Instrumentation_GetLine(PyCodeObject *code, int index);

extern TyObject _PyInstrumentation_MISSING;
extern TyObject _PyInstrumentation_DISABLE;


/* Total tool ids available */
#define  PY_MONITORING_TOOL_IDS 8
/* Count of all local monitoring events */
#define  _PY_MONITORING_LOCAL_EVENTS 11
/* Count of all "real" monitoring events (not derived from other events) */
#define _PY_MONITORING_UNGROUPED_EVENTS 16
/* Count of all  monitoring events */
#define _PY_MONITORING_EVENTS 19

/* Tables of which tools are active for each monitored event. */
typedef struct _Ty_LocalMonitors {
    uint8_t tools[_PY_MONITORING_LOCAL_EVENTS];
} _Ty_LocalMonitors;

typedef struct _Ty_GlobalMonitors {
    uint8_t tools[_PY_MONITORING_UNGROUPED_EVENTS];
} _Ty_GlobalMonitors;

/* Ancillary data structure used for instrumentation.
   Line instrumentation creates this with sufficient
   space for one entry per code unit. The total size
   of the data will be `bytes_per_entry * Ty_SIZE(code)` */
typedef struct {
    uint8_t bytes_per_entry;
    uint8_t data[1];
} _PyCoLineInstrumentationData;


/* Main data structure used for instrumentation.
 * This is allocated when needed for instrumentation
 */
typedef struct _PyCoMonitoringData {
    /* Monitoring specific to this code object */
    _Ty_LocalMonitors local_monitors;
    /* Monitoring that is active on this code object */
    _Ty_LocalMonitors active_monitors;
    /* The tools that are to be notified for events for the matching code unit */
    uint8_t *tools;
    /* The version of tools when they instrument the code */
    uintptr_t tool_versions[PY_MONITORING_TOOL_IDS];
    /* Information to support line events */
    _PyCoLineInstrumentationData *lines;
    /* The tools that are to be notified for line events for the matching code unit */
    uint8_t *line_tools;
    /* Information to support instruction events */
    /* The underlying instructions, which can themselves be instrumented */
    uint8_t *per_instruction_opcodes;
    /* The tools that are to be notified for instruction events for the matching code unit */
    uint8_t *per_instruction_tools;
} _PyCoMonitoringData;


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_INSTRUMENT_H */
