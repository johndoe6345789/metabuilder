#ifndef Ty_INTERNAL_STATS_H
#define Ty_INTERNAL_STATS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_structs.h"     //


#ifdef Ty_STATS

#include "pycore_bitutils.h"  // _Ty_bit_length

#define STAT_INC(opname, name) do { if (_Ty_stats) _Ty_stats->opcode_stats[opname].specialization.name++; } while (0)
#define STAT_DEC(opname, name) do { if (_Ty_stats) _Ty_stats->opcode_stats[opname].specialization.name--; } while (0)
#define OPCODE_EXE_INC(opname) do { if (_Ty_stats) _Ty_stats->opcode_stats[opname].execution_count++; } while (0)
#define CALL_STAT_INC(name) do { if (_Ty_stats) _Ty_stats->call_stats.name++; } while (0)
#define OBJECT_STAT_INC(name) do { if (_Ty_stats) _Ty_stats->object_stats.name++; } while (0)
#define OBJECT_STAT_INC_COND(name, cond) \
    do { if (_Ty_stats && cond) _Ty_stats->object_stats.name++; } while (0)
#define EVAL_CALL_STAT_INC(name) do { if (_Ty_stats) _Ty_stats->call_stats.eval_calls[name]++; } while (0)
#define EVAL_CALL_STAT_INC_IF_FUNCTION(name, callable) \
    do { if (_Ty_stats && TyFunction_Check(callable)) _Ty_stats->call_stats.eval_calls[name]++; } while (0)
#define GC_STAT_ADD(gen, name, n) do { if (_Ty_stats) _Ty_stats->gc_stats[(gen)].name += (n); } while (0)
#define OPT_STAT_INC(name) do { if (_Ty_stats) _Ty_stats->optimization_stats.name++; } while (0)
#define OPT_STAT_ADD(name, n) do { if (_Ty_stats) _Ty_stats->optimization_stats.name += (n); } while (0)
#define UOP_STAT_INC(opname, name) do { if (_Ty_stats) { assert(opname < 512); _Ty_stats->optimization_stats.opcode[opname].name++; } } while (0)
#define UOP_PAIR_INC(uopcode, lastuop)                                              \
    do {                                                                            \
        if (lastuop && _Ty_stats) {                                                 \
            _Ty_stats->optimization_stats.opcode[lastuop].pair_count[uopcode]++;    \
        }                                                                           \
        lastuop = uopcode;                                                          \
    } while (0)
#define OPT_UNSUPPORTED_OPCODE(opname) do { if (_Ty_stats) _Ty_stats->optimization_stats.unsupported_opcode[opname]++; } while (0)
#define OPT_ERROR_IN_OPCODE(opname) do { if (_Ty_stats) _Ty_stats->optimization_stats.error_in_opcode[opname]++; } while (0)
#define OPT_HIST(length, name) \
    do { \
        if (_Ty_stats) { \
            int bucket = _Ty_bit_length(length >= 1 ? length - 1 : 0); \
            bucket = (bucket >= _Ty_UOP_HIST_SIZE) ? _Ty_UOP_HIST_SIZE - 1 : bucket; \
            _Ty_stats->optimization_stats.name[bucket]++; \
        } \
    } while (0)
#define RARE_EVENT_STAT_INC(name) do { if (_Ty_stats) _Ty_stats->rare_event_stats.name++; } while (0)
#define OPCODE_DEFERRED_INC(opname) do { if (_Ty_stats && opcode == opname) _Ty_stats->opcode_stats[opname].specialization.deferred++; } while (0)

// Export for '_opcode' shared extension
PyAPI_FUNC(TyObject*) _Ty_GetSpecializationStats(void);

#else
#define STAT_INC(opname, name) ((void)0)
#define STAT_DEC(opname, name) ((void)0)
#define OPCODE_EXE_INC(opname) ((void)0)
#define CALL_STAT_INC(name) ((void)0)
#define OBJECT_STAT_INC(name) ((void)0)
#define OBJECT_STAT_INC_COND(name, cond) ((void)0)
#define EVAL_CALL_STAT_INC(name) ((void)0)
#define EVAL_CALL_STAT_INC_IF_FUNCTION(name, callable) ((void)0)
#define GC_STAT_ADD(gen, name, n) ((void)0)
#define OPT_STAT_INC(name) ((void)0)
#define OPT_STAT_ADD(name, n) ((void)0)
#define UOP_STAT_INC(opname, name) ((void)0)
#define UOP_PAIR_INC(uopcode, lastuop) ((void)0)
#define OPT_UNSUPPORTED_OPCODE(opname) ((void)0)
#define OPT_ERROR_IN_OPCODE(opname) ((void)0)
#define OPT_HIST(length, name) ((void)0)
#define RARE_EVENT_STAT_INC(name) ((void)0)
#define OPCODE_DEFERRED_INC(opname) ((void)0)
#endif  // !Ty_STATS


#define RARE_EVENT_INTERP_INC(interp, name) \
    do { \
        /* saturating add */ \
        int val = FT_ATOMIC_LOAD_UINT8_RELAXED(interp->rare_events.name); \
        if (val < UINT8_MAX) { \
            FT_ATOMIC_STORE_UINT8(interp->rare_events.name, val + 1); \
        } \
        RARE_EVENT_STAT_INC(name); \
    } while (0); \

#define RARE_EVENT_INC(name) \
    do { \
        TyInterpreterState *interp = TyInterpreterState_Get(); \
        RARE_EVENT_INTERP_INC(interp, name); \
    } while (0); \


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_STATS_H */
