/* Execute compiled code */

#define _PY_INTERPRETER

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_audit.h"         // _TySys_Audit()
#include "pycore_backoff.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_cell.h"          // TyCell_GetRef()
#include "pycore_ceval.h"         // SPECIAL___ENTER__
#include "pycore_code.h"
#include "pycore_dict.h"
#include "pycore_emscripten_signal.h"  // _Ty_CHECK_EMSCRIPTEN_SIGNALS
#include "pycore_floatobject.h"   // _TyFloat_ExactDealloc()
#include "pycore_frame.h"
#include "pycore_function.h"
#include "pycore_genobject.h"     // _PyCoro_GetAwaitableIter()
#include "pycore_import.h"        // _TyImport_IsDefaultImportFunc()
#include "pycore_instruments.h"
#include "pycore_interpframe.h"   // _TyFrame_SetStackPointer()
#include "pycore_interpolation.h" // _PyInterpolation_Build()
#include "pycore_intrinsics.h"
#include "pycore_jit.h"
#include "pycore_list.h"          // _TyList_GetItemRef()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_moduleobject.h"  // PyModuleObject
#include "pycore_object.h"        // _TyObject_GC_TRACK()
#include "pycore_opcode_metadata.h" // EXTRA_CASES
#include "pycore_opcode_utils.h"  // MAKE_FUNCTION_*
#include "pycore_optimizer.h"     // _PyUOpExecutor_Type
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_*
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_range.h"         // _PyRangeIterObject
#include "pycore_setobject.h"     // _TySet_Update()
#include "pycore_sliceobject.h"   // _PyBuildSlice_ConsumeRefs
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttrString()
#include "pycore_template.h"      // _PyTemplate_Build()
#include "pycore_traceback.h"     // _PyTraceBack_FromFrame
#include "pycore_tuple.h"         // _TyTuple_ITEMS()
#include "pycore_uop_ids.h"       // Uops

#include "dictobject.h"
#include "frameobject.h"          // _PyInterpreterFrame_GetLine
#include "opcode.h"
#include "pydtrace.h"
#include "setobject.h"
#include "pycore_stackref.h"

#include <stdbool.h>              // bool

#if !defined(Ty_BUILD_CORE)
#  error "ceval.c must be build with Ty_BUILD_CORE define for best performance"
#endif

#if !defined(Ty_DEBUG) && !defined(Ty_TRACE_REFS)
// GH-89279: The MSVC compiler does not inline these static inline functions
// in PGO build in _TyEval_EvalFrameDefault(), because this function is over
// the limit of PGO, and that limit cannot be configured.
// Define them as macros to make sure that they are always inlined by the
// preprocessor.

#undef Ty_IS_TYPE
#define Ty_IS_TYPE(ob, type) \
    (_TyObject_CAST(ob)->ob_type == (type))

#undef Ty_XDECREF
#define Ty_XDECREF(arg) \
    do { \
        TyObject *xop = _TyObject_CAST(arg); \
        if (xop != NULL) { \
            Ty_DECREF(xop); \
        } \
    } while (0)

#ifndef Ty_GIL_DISABLED

#undef Ty_DECREF
#define Ty_DECREF(arg) \
    do { \
        TyObject *op = _TyObject_CAST(arg); \
        if (_Ty_IsImmortal(op)) { \
            _Ty_DECREF_IMMORTAL_STAT_INC(); \
            break; \
        } \
        _Ty_DECREF_STAT_INC(); \
        if (--op->ob_refcnt == 0) { \
            _PyReftracerTrack(op, PyRefTracer_DESTROY); \
            destructor dealloc = Ty_TYPE(op)->tp_dealloc; \
            (*dealloc)(op); \
        } \
    } while (0)

#undef _Ty_DECREF_SPECIALIZED
#define _Ty_DECREF_SPECIALIZED(arg, dealloc) \
    do { \
        TyObject *op = _TyObject_CAST(arg); \
        if (_Ty_IsImmortal(op)) { \
            _Ty_DECREF_IMMORTAL_STAT_INC(); \
            break; \
        } \
        _Ty_DECREF_STAT_INC(); \
        if (--op->ob_refcnt == 0) { \
            _PyReftracerTrack(op, PyRefTracer_DESTROY); \
            destructor d = (destructor)(dealloc); \
            d(op); \
        } \
    } while (0)

#else // Ty_GIL_DISABLED

#undef Ty_DECREF
#define Ty_DECREF(arg) \
    do { \
        TyObject *op = _TyObject_CAST(arg); \
        uint32_t local = _Ty_atomic_load_uint32_relaxed(&op->ob_ref_local); \
        if (local == _Ty_IMMORTAL_REFCNT_LOCAL) { \
            _Ty_DECREF_IMMORTAL_STAT_INC(); \
            break; \
        } \
        _Ty_DECREF_STAT_INC(); \
        if (_Ty_IsOwnedByCurrentThread(op)) { \
            local--; \
            _Ty_atomic_store_uint32_relaxed(&op->ob_ref_local, local); \
            if (local == 0) { \
                _Ty_MergeZeroLocalRefcount(op); \
            } \
        } \
        else { \
            _Ty_DecRefShared(op); \
        } \
    } while (0)

#undef _Ty_DECREF_SPECIALIZED
#define _Ty_DECREF_SPECIALIZED(arg, dealloc) Ty_DECREF(arg)

#endif
#endif


#ifdef Ty_DEBUG
static void
dump_item(_PyStackRef item)
{
    if (PyStackRef_IsNull(item)) {
        printf("<NULL>");
        return;
    }
    if (PyStackRef_IsTaggedInt(item)) {
        printf("%" PRId64, (int64_t)PyStackRef_UntagInt(item));
        return;
    }
    TyObject *obj = PyStackRef_AsPyObjectBorrow(item);
    if (obj == NULL) {
        printf("<nil>");
        return;
    }
    // Don't call __repr__(), it might recurse into the interpreter.
    printf("<%s at %p>", Ty_TYPE(obj)->tp_name, (void *)obj);
}

static void
dump_stack(_PyInterpreterFrame *frame, _PyStackRef *stack_pointer)
{
    _TyFrame_SetStackPointer(frame, stack_pointer);
    _PyStackRef *locals_base = _TyFrame_GetLocalsArray(frame);
    _PyStackRef *stack_base = _TyFrame_Stackbase(frame);
    TyObject *exc = TyErr_GetRaisedException();
    printf("    locals=[");
    for (_PyStackRef *ptr = locals_base; ptr < stack_base; ptr++) {
        if (ptr != locals_base) {
            printf(", ");
        }
        dump_item(*ptr);
    }
    printf("]\n");
    if (stack_pointer < stack_base) {
        printf("    stack=%d\n", (int)(stack_pointer-stack_base));
    }
    else {
        printf("    stack=[");
        for (_PyStackRef *ptr = stack_base; ptr < stack_pointer; ptr++) {
            if (ptr != stack_base) {
                printf(", ");
            }
            dump_item(*ptr);
        }
        printf("]\n");
    }
    fflush(stdout);
    TyErr_SetRaisedException(exc);
    _TyFrame_GetStackPointer(frame);
}

static void
lltrace_instruction(_PyInterpreterFrame *frame,
                    _PyStackRef *stack_pointer,
                    _Ty_CODEUNIT *next_instr,
                    int opcode,
                    int oparg)
{
    int offset = 0;
    if (frame->owner < FRAME_OWNED_BY_INTERPRETER) {
        dump_stack(frame, stack_pointer);
        offset = (int)(next_instr - _TyFrame_GetBytecode(frame));
    }
    const char *opname = _TyOpcode_OpName[opcode];
    assert(opname != NULL);
    if (OPCODE_HAS_ARG((int)_TyOpcode_Deopt[opcode])) {
        printf("%d: %s %d\n", offset * 2, opname, oparg);
    }
    else {
        printf("%d: %s\n", offset * 2, opname);
    }
    fflush(stdout);
}

static void
lltrace_resume_frame(_PyInterpreterFrame *frame)
{
    TyObject *fobj = PyStackRef_AsPyObjectBorrow(frame->f_funcobj);
    if (!PyStackRef_CodeCheck(frame->f_executable) ||
        fobj == NULL ||
        !TyFunction_Check(fobj)
    ) {
        printf("\nResuming frame.\n");
        return;
    }
    PyFunctionObject *f = (PyFunctionObject *)fobj;
    TyObject *exc = TyErr_GetRaisedException();
    TyObject *name = f->func_qualname;
    if (name == NULL) {
        name = f->func_name;
    }
    printf("\nResuming frame");
    if (name) {
        printf(" for ");
        if (PyObject_Print(name, stdout, 0) < 0) {
            TyErr_Clear();
        }
    }
    if (f->func_module) {
        printf(" in module ");
        if (PyObject_Print(f->func_module, stdout, 0) < 0) {
            TyErr_Clear();
        }
    }
    printf("\n");
    fflush(stdout);
    TyErr_SetRaisedException(exc);
}

static int
maybe_lltrace_resume_frame(_PyInterpreterFrame *frame, TyObject *globals)
{
    if (globals == NULL) {
        return 0;
    }
    if (frame->owner >= FRAME_OWNED_BY_INTERPRETER) {
        return 0;
    }
    int r = TyDict_Contains(globals, &_Ty_ID(__lltrace__));
    if (r < 0) {
        return -1;
    }
    int lltrace = r * 5;  // Levels 1-4 only trace uops
    if (!lltrace) {
        // Can also be controlled by environment variable
        char *python_lltrace = Ty_GETENV("PYTHON_LLTRACE");
        if (python_lltrace != NULL && *python_lltrace >= '0') {
            lltrace = *python_lltrace - '0';  // TODO: Parse an int and all that
        }
    }
    if (lltrace >= 5) {
        lltrace_resume_frame(frame);
    }
    return lltrace;
}

#endif

static void monitor_reraise(TyThreadState *tstate,
                 _PyInterpreterFrame *frame,
                 _Ty_CODEUNIT *instr);
static int monitor_stop_iteration(TyThreadState *tstate,
                 _PyInterpreterFrame *frame,
                 _Ty_CODEUNIT *instr,
                 TyObject *value);
static void monitor_unwind(TyThreadState *tstate,
                 _PyInterpreterFrame *frame,
                 _Ty_CODEUNIT *instr);
static int monitor_handled(TyThreadState *tstate,
                 _PyInterpreterFrame *frame,
                 _Ty_CODEUNIT *instr, TyObject *exc);
static void monitor_throw(TyThreadState *tstate,
                 _PyInterpreterFrame *frame,
                 _Ty_CODEUNIT *instr);

static int get_exception_handler(PyCodeObject *, int, int*, int*, int*);
static  _PyInterpreterFrame *
_PyEvalFramePushAndInit_Ex(TyThreadState *tstate, _PyStackRef func,
    TyObject *locals, Ty_ssize_t nargs, TyObject *callargs, TyObject *kwargs, _PyInterpreterFrame *previous);

#ifdef HAVE_ERRNO_H
#include <errno.h>
#endif

int
Ty_GetRecursionLimit(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return interp->ceval.recursion_limit;
}

void
Ty_SetRecursionLimit(int new_limit)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyEval_StopTheWorld(interp);
    interp->ceval.recursion_limit = new_limit;
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, p) {
        int depth = p->py_recursion_limit - p->py_recursion_remaining;
        p->py_recursion_limit = new_limit;
        p->py_recursion_remaining = new_limit - depth;
    }
    _Ty_FOR_EACH_TSTATE_END(interp);
    _TyEval_StartTheWorld(interp);
}

int
_Ty_ReachedRecursionLimitWithMargin(TyThreadState *tstate, int margin_count)
{
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    if (here_addr > _tstate->c_stack_soft_limit + margin_count * _TyOS_STACK_MARGIN_BYTES) {
        return 0;
    }
    if (_tstate->c_stack_hard_limit == 0) {
        _Ty_InitializeRecursionLimits(tstate);
    }
    return here_addr <= _tstate->c_stack_soft_limit + margin_count * _TyOS_STACK_MARGIN_BYTES;
}

void
_Ty_EnterRecursiveCallUnchecked(TyThreadState *tstate)
{
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    if (here_addr < _tstate->c_stack_hard_limit) {
        Ty_FatalError("Unchecked stack overflow.");
    }
}

#if defined(__s390x__)
#  define Ty_C_STACK_SIZE 320000
#elif defined(_WIN32)
   // Don't define Ty_C_STACK_SIZE, ask the O/S
#elif defined(__ANDROID__)
#  define Ty_C_STACK_SIZE 1200000
#elif defined(__sparc__)
#  define Ty_C_STACK_SIZE 1600000
#elif defined(__hppa__) || defined(__powerpc64__)
#  define Ty_C_STACK_SIZE 2000000
#else
#  define Ty_C_STACK_SIZE 4000000
#endif

#if defined(__EMSCRIPTEN__)

// Temporary workaround to make `pthread_getattr_np` work on Emscripten.
// Emscripten 4.0.6 will contain a fix:
// https://github.com/emscripten-core/emscripten/pull/23887

#include "emscripten/stack.h"

#define pthread_attr_t workaround_pthread_attr_t
#define pthread_getattr_np workaround_pthread_getattr_np
#define pthread_attr_getguardsize workaround_pthread_attr_getguardsize
#define pthread_attr_getstack workaround_pthread_attr_getstack
#define pthread_attr_destroy workaround_pthread_attr_destroy

typedef struct {
    void *_a_stackaddr;
    size_t _a_stacksize, _a_guardsize;
} pthread_attr_t;

extern __attribute__((__visibility__("hidden"))) unsigned __default_guardsize;

// Modified version of pthread_getattr_np from the upstream PR.

int pthread_getattr_np(pthread_t thread, pthread_attr_t *attr) {
  attr->_a_stackaddr = (void*)emscripten_stack_get_base();
  attr->_a_stacksize = emscripten_stack_get_base() - emscripten_stack_get_end();
  attr->_a_guardsize = __default_guardsize;
  return 0;
}

// These three functions copied without any changes from Emscripten libc.

int pthread_attr_getguardsize(const pthread_attr_t *restrict a, size_t *restrict size)
{
	*size = a->_a_guardsize;
	return 0;
}

int pthread_attr_getstack(const pthread_attr_t *restrict a, void **restrict addr, size_t *restrict size)
{
/// XXX musl is not standard-conforming? It should not report EINVAL if _a_stackaddr is zero, and it should
///     report EINVAL if a is null: http://pubs.opengroup.org/onlinepubs/009695399/functions/pthread_attr_getstack.html
	if (!a) return EINVAL;
//	if (!a->_a_stackaddr)
//		return EINVAL;

	*size = a->_a_stacksize;
	*addr = (void *)(a->_a_stackaddr - *size);
	return 0;
}

int pthread_attr_destroy(pthread_attr_t *a)
{
	return 0;
}

#endif


void
_Ty_InitializeRecursionLimits(TyThreadState *tstate)
{
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
#ifdef WIN32
    ULONG_PTR low, high;
    GetCurrentThreadStackLimits(&low, &high);
    _tstate->c_stack_top = (uintptr_t)high;
    ULONG guarantee = 0;
    SetThreadStackGuarantee(&guarantee);
    _tstate->c_stack_hard_limit = ((uintptr_t)low) + guarantee + _TyOS_STACK_MARGIN_BYTES;
    _tstate->c_stack_soft_limit = _tstate->c_stack_hard_limit + _TyOS_STACK_MARGIN_BYTES;
#else
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
#  if defined(HAVE_PTHREAD_GETATTR_NP) && !defined(_AIX) && !defined(__NetBSD__)
    size_t stack_size, guard_size;
    void *stack_addr;
    pthread_attr_t attr;
    int err = pthread_getattr_np(pthread_self(), &attr);
    if (err == 0) {
        err = pthread_attr_getguardsize(&attr, &guard_size);
        err |= pthread_attr_getstack(&attr, &stack_addr, &stack_size);
        err |= pthread_attr_destroy(&attr);
    }
    if (err == 0) {
        uintptr_t base = ((uintptr_t)stack_addr) + guard_size;
        _tstate->c_stack_top = base + stack_size;
#ifdef _Ty_THREAD_SANITIZER
        // Thread sanitizer crashes if we use a bit more than half the stack.
        _tstate->c_stack_soft_limit = base + (stack_size / 2);
#else
        _tstate->c_stack_soft_limit = base + _TyOS_STACK_MARGIN_BYTES * 2;
#endif
        _tstate->c_stack_hard_limit = base + _TyOS_STACK_MARGIN_BYTES;
        assert(_tstate->c_stack_soft_limit < here_addr);
        assert(here_addr < _tstate->c_stack_top);
        return;
    }
#  endif
    _tstate->c_stack_top = _Ty_SIZE_ROUND_UP(here_addr, 4096);
    _tstate->c_stack_soft_limit = _tstate->c_stack_top - Ty_C_STACK_SIZE;
    _tstate->c_stack_hard_limit = _tstate->c_stack_top - (Ty_C_STACK_SIZE + _TyOS_STACK_MARGIN_BYTES);
#endif
}

/* The function _Ty_EnterRecursiveCallTstate() only calls _Ty_CheckRecursiveCall()
   if the recursion_depth reaches recursion_limit. */
int
_Ty_CheckRecursiveCall(TyThreadState *tstate, const char *where)
{
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    assert(_tstate->c_stack_soft_limit != 0);
    assert(_tstate->c_stack_hard_limit != 0);
    if (here_addr < _tstate->c_stack_hard_limit) {
        /* Overflowing while handling an overflow. Give up. */
        int kbytes_used = (int)(_tstate->c_stack_top - here_addr)/1024;
        char buffer[80];
        snprintf(buffer, 80, "Unrecoverable stack overflow (used %d kB)%s", kbytes_used, where);
        Ty_FatalError(buffer);
    }
    if (tstate->recursion_headroom) {
        return 0;
    }
    else {
        int kbytes_used = (int)(_tstate->c_stack_top - here_addr)/1024;
        tstate->recursion_headroom++;
        _TyErr_Format(tstate, TyExc_RecursionError,
                    "Stack overflow (used %d kB)%s",
                    kbytes_used,
                    where);
        tstate->recursion_headroom--;
        return -1;
    }
}


const binaryfunc _TyEval_BinaryOps[] = {
    [NB_ADD] = PyNumber_Add,
    [NB_AND] = PyNumber_And,
    [NB_FLOOR_DIVIDE] = PyNumber_FloorDivide,
    [NB_LSHIFT] = PyNumber_Lshift,
    [NB_MATRIX_MULTIPLY] = PyNumber_MatrixMultiply,
    [NB_MULTIPLY] = PyNumber_Multiply,
    [NB_REMAINDER] = PyNumber_Remainder,
    [NB_OR] = PyNumber_Or,
    [NB_POWER] = _PyNumber_PowerNoMod,
    [NB_RSHIFT] = PyNumber_Rshift,
    [NB_SUBTRACT] = PyNumber_Subtract,
    [NB_TRUE_DIVIDE] = PyNumber_TrueDivide,
    [NB_XOR] = PyNumber_Xor,
    [NB_INPLACE_ADD] = PyNumber_InPlaceAdd,
    [NB_INPLACE_AND] = PyNumber_InPlaceAnd,
    [NB_INPLACE_FLOOR_DIVIDE] = PyNumber_InPlaceFloorDivide,
    [NB_INPLACE_LSHIFT] = PyNumber_InPlaceLshift,
    [NB_INPLACE_MATRIX_MULTIPLY] = PyNumber_InPlaceMatrixMultiply,
    [NB_INPLACE_MULTIPLY] = PyNumber_InPlaceMultiply,
    [NB_INPLACE_REMAINDER] = PyNumber_InPlaceRemainder,
    [NB_INPLACE_OR] = PyNumber_InPlaceOr,
    [NB_INPLACE_POWER] = _PyNumber_InPlacePowerNoMod,
    [NB_INPLACE_RSHIFT] = PyNumber_InPlaceRshift,
    [NB_INPLACE_SUBTRACT] = PyNumber_InPlaceSubtract,
    [NB_INPLACE_TRUE_DIVIDE] = PyNumber_InPlaceTrueDivide,
    [NB_INPLACE_XOR] = PyNumber_InPlaceXor,
    [NB_SUBSCR] = PyObject_GetItem,
};

const conversion_func _TyEval_ConversionFuncs[4] = {
    [FVC_STR] = PyObject_Str,
    [FVC_REPR] = PyObject_Repr,
    [FVC_ASCII] = PyObject_ASCII
};

const _Ty_SpecialMethod _Ty_SpecialMethods[] = {
    [SPECIAL___ENTER__] = {
        .name = &_Ty_ID(__enter__),
        .error = (
            "'%T' object does not support the context manager protocol "
            "(missed __enter__ method)"
        ),
        .error_suggestion = (
            "'%T' object does not support the context manager protocol "
            "(missed __enter__ method) but it supports the asynchronous "
            "context manager protocol. Did you mean to use 'async with'?"
        )
    },
    [SPECIAL___EXIT__] = {
        .name = &_Ty_ID(__exit__),
        .error = (
            "'%T' object does not support the context manager protocol "
            "(missed __exit__ method)"
        ),
        .error_suggestion = (
            "'%T' object does not support the context manager protocol "
            "(missed __exit__ method) but it supports the asynchronous "
            "context manager protocol. Did you mean to use 'async with'?"
        )
    },
    [SPECIAL___AENTER__] = {
        .name = &_Ty_ID(__aenter__),
        .error = (
            "'%T' object does not support the asynchronous "
            "context manager protocol (missed __aenter__ method)"
        ),
        .error_suggestion = (
            "'%T' object does not support the asynchronous context manager "
            "protocol (missed __aenter__ method) but it supports the context "
            "manager protocol. Did you mean to use 'with'?"
        )
    },
    [SPECIAL___AEXIT__] = {
        .name = &_Ty_ID(__aexit__),
        .error = (
            "'%T' object does not support the asynchronous "
            "context manager protocol (missed __aexit__ method)"
        ),
        .error_suggestion = (
            "'%T' object does not support the asynchronous context manager "
            "protocol (missed __aexit__ method) but it supports the context "
            "manager protocol. Did you mean to use 'with'?"
        )
    }
};

const size_t _Ty_FunctionAttributeOffsets[] = {
    [MAKE_FUNCTION_CLOSURE] = offsetof(PyFunctionObject, func_closure),
    [MAKE_FUNCTION_ANNOTATIONS] = offsetof(PyFunctionObject, func_annotations),
    [MAKE_FUNCTION_KWDEFAULTS] = offsetof(PyFunctionObject, func_kwdefaults),
    [MAKE_FUNCTION_DEFAULTS] = offsetof(PyFunctionObject, func_defaults),
    [MAKE_FUNCTION_ANNOTATE] = offsetof(PyFunctionObject, func_annotate),
};

// PEP 634: Structural Pattern Matching


// Return a tuple of values corresponding to keys, with error checks for
// duplicate/missing keys.
TyObject *
_TyEval_MatchKeys(TyThreadState *tstate, TyObject *map, TyObject *keys)
{
    assert(TyTuple_CheckExact(keys));
    Ty_ssize_t nkeys = TyTuple_GET_SIZE(keys);
    if (!nkeys) {
        // No keys means no items.
        return TyTuple_New(0);
    }
    TyObject *seen = NULL;
    TyObject *dummy = NULL;
    TyObject *values = NULL;
    TyObject *get = NULL;
    // We use the two argument form of map.get(key, default) for two reasons:
    // - Atomically check for a key and get its value without error handling.
    // - Don't cause key creation or resizing in dict subclasses like
    //   collections.defaultdict that define __missing__ (or similar).
    int meth_found = _TyObject_GetMethod(map, &_Ty_ID(get), &get);
    if (get == NULL) {
        goto fail;
    }
    seen = TySet_New(NULL);
    if (seen == NULL) {
        goto fail;
    }
    // dummy = object()
    dummy = _TyObject_CallNoArgs((TyObject *)&PyBaseObject_Type);
    if (dummy == NULL) {
        goto fail;
    }
    values = TyTuple_New(nkeys);
    if (values == NULL) {
        goto fail;
    }
    for (Ty_ssize_t i = 0; i < nkeys; i++) {
        TyObject *key = TyTuple_GET_ITEM(keys, i);
        if (TySet_Contains(seen, key) || TySet_Add(seen, key)) {
            if (!_TyErr_Occurred(tstate)) {
                // Seen it before!
                _TyErr_Format(tstate, TyExc_ValueError,
                              "mapping pattern checks duplicate key (%R)", key);
            }
            goto fail;
        }
        TyObject *args[] = { map, key, dummy };
        TyObject *value = NULL;
        if (meth_found) {
            value = PyObject_Vectorcall(get, args, 3, NULL);
        }
        else {
            value = PyObject_Vectorcall(get, &args[1], 2, NULL);
        }
        if (value == NULL) {
            goto fail;
        }
        if (value == dummy) {
            // key not in map!
            Ty_DECREF(value);
            Ty_DECREF(values);
            // Return None:
            values = Ty_NewRef(Ty_None);
            goto done;
        }
        TyTuple_SET_ITEM(values, i, value);
    }
    // Success:
done:
    Ty_DECREF(get);
    Ty_DECREF(seen);
    Ty_DECREF(dummy);
    return values;
fail:
    Ty_XDECREF(get);
    Ty_XDECREF(seen);
    Ty_XDECREF(dummy);
    Ty_XDECREF(values);
    return NULL;
}

// Extract a named attribute from the subject, with additional bookkeeping to
// raise TypeErrors for repeated lookups. On failure, return NULL (with no
// error set). Use _TyErr_Occurred(tstate) to disambiguate.
static TyObject *
match_class_attr(TyThreadState *tstate, TyObject *subject, TyObject *type,
                 TyObject *name, TyObject *seen)
{
    assert(TyUnicode_CheckExact(name));
    assert(TySet_CheckExact(seen));
    if (TySet_Contains(seen, name) || TySet_Add(seen, name)) {
        if (!_TyErr_Occurred(tstate)) {
            // Seen it before!
            _TyErr_Format(tstate, TyExc_TypeError,
                          "%s() got multiple sub-patterns for attribute %R",
                          ((TyTypeObject*)type)->tp_name, name);
        }
        return NULL;
    }
    TyObject *attr;
    (void)PyObject_GetOptionalAttr(subject, name, &attr);
    return attr;
}

// On success (match), return a tuple of extracted attributes. On failure (no
// match), return NULL. Use _TyErr_Occurred(tstate) to disambiguate.
TyObject*
_TyEval_MatchClass(TyThreadState *tstate, TyObject *subject, TyObject *type,
                   Ty_ssize_t nargs, TyObject *kwargs)
{
    if (!TyType_Check(type)) {
        const char *e = "called match pattern must be a class";
        _TyErr_Format(tstate, TyExc_TypeError, e);
        return NULL;
    }
    assert(TyTuple_CheckExact(kwargs));
    // First, an isinstance check:
    if (PyObject_IsInstance(subject, type) <= 0) {
        return NULL;
    }
    // So far so good:
    TyObject *seen = TySet_New(NULL);
    if (seen == NULL) {
        return NULL;
    }
    TyObject *attrs = TyList_New(0);
    if (attrs == NULL) {
        Ty_DECREF(seen);
        return NULL;
    }
    // NOTE: From this point on, goto fail on failure:
    TyObject *match_args = NULL;
    // First, the positional subpatterns:
    if (nargs) {
        int match_self = 0;
        if (PyObject_GetOptionalAttr(type, &_Ty_ID(__match_args__), &match_args) < 0) {
            goto fail;
        }
        if (match_args) {
            if (!TyTuple_CheckExact(match_args)) {
                const char *e = "%s.__match_args__ must be a tuple (got %s)";
                _TyErr_Format(tstate, TyExc_TypeError, e,
                              ((TyTypeObject *)type)->tp_name,
                              Ty_TYPE(match_args)->tp_name);
                goto fail;
            }
        }
        else {
            // _Ty_TPFLAGS_MATCH_SELF is only acknowledged if the type does not
            // define __match_args__. This is natural behavior for subclasses:
            // it's as if __match_args__ is some "magic" value that is lost as
            // soon as they redefine it.
            match_args = TyTuple_New(0);
            match_self = TyType_HasFeature((TyTypeObject*)type,
                                            _Ty_TPFLAGS_MATCH_SELF);
        }
        assert(TyTuple_CheckExact(match_args));
        Ty_ssize_t allowed = match_self ? 1 : TyTuple_GET_SIZE(match_args);
        if (allowed < nargs) {
            const char *plural = (allowed == 1) ? "" : "s";
            _TyErr_Format(tstate, TyExc_TypeError,
                          "%s() accepts %d positional sub-pattern%s (%d given)",
                          ((TyTypeObject*)type)->tp_name,
                          allowed, plural, nargs);
            goto fail;
        }
        if (match_self) {
            // Easy. Copy the subject itself, and move on to kwargs.
            if (TyList_Append(attrs, subject) < 0) {
                goto fail;
            }
        }
        else {
            for (Ty_ssize_t i = 0; i < nargs; i++) {
                TyObject *name = TyTuple_GET_ITEM(match_args, i);
                if (!TyUnicode_CheckExact(name)) {
                    _TyErr_Format(tstate, TyExc_TypeError,
                                  "__match_args__ elements must be strings "
                                  "(got %s)", Ty_TYPE(name)->tp_name);
                    goto fail;
                }
                TyObject *attr = match_class_attr(tstate, subject, type, name,
                                                  seen);
                if (attr == NULL) {
                    goto fail;
                }
                if (TyList_Append(attrs, attr) < 0) {
                    Ty_DECREF(attr);
                    goto fail;
                }
                Ty_DECREF(attr);
            }
        }
        Ty_CLEAR(match_args);
    }
    // Finally, the keyword subpatterns:
    for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(kwargs); i++) {
        TyObject *name = TyTuple_GET_ITEM(kwargs, i);
        TyObject *attr = match_class_attr(tstate, subject, type, name, seen);
        if (attr == NULL) {
            goto fail;
        }
        if (TyList_Append(attrs, attr) < 0) {
            Ty_DECREF(attr);
            goto fail;
        }
        Ty_DECREF(attr);
    }
    Ty_SETREF(attrs, TyList_AsTuple(attrs));
    Ty_DECREF(seen);
    return attrs;
fail:
    // We really don't care whether an error was raised or not... that's our
    // caller's problem. All we know is that the match failed.
    Ty_XDECREF(match_args);
    Ty_DECREF(seen);
    Ty_DECREF(attrs);
    return NULL;
}


static int do_raise(TyThreadState *tstate, TyObject *exc, TyObject *cause);

TyObject *
TyEval_EvalCode(TyObject *co, TyObject *globals, TyObject *locals)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (locals == NULL) {
        locals = globals;
    }
    TyObject *builtins = _TyDict_LoadBuiltinsFromGlobals(globals);
    if (builtins == NULL) {
        return NULL;
    }
    PyFrameConstructor desc = {
        .fc_globals = globals,
        .fc_builtins = builtins,
        .fc_name = ((PyCodeObject *)co)->co_name,
        .fc_qualname = ((PyCodeObject *)co)->co_name,
        .fc_code = co,
        .fc_defaults = NULL,
        .fc_kwdefaults = NULL,
        .fc_closure = NULL
    };
    PyFunctionObject *func = _TyFunction_FromConstructor(&desc);
    _Ty_DECREF_BUILTINS(builtins);
    if (func == NULL) {
        return NULL;
    }
    EVAL_CALL_STAT_INC(EVAL_CALL_LEGACY);
    TyObject *res = _TyEval_Vector(tstate, func, locals, NULL, 0, NULL);
    Ty_DECREF(func);
    return res;
}


/* Interpreter main loop */

TyObject *
TyEval_EvalFrame(PyFrameObject *f)
{
    /* Function kept for backward compatibility */
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyEval_EvalFrame(tstate, f->f_frame, 0);
}

TyObject *
TyEval_EvalFrameEx(PyFrameObject *f, int throwflag)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyEval_EvalFrame(tstate, f->f_frame, throwflag);
}

#include "ceval_macros.h"

int _Ty_CheckRecursiveCallPy(
    TyThreadState *tstate)
{
    if (tstate->recursion_headroom) {
        if (tstate->py_recursion_remaining < -50) {
            /* Overflowing while handling an overflow. Give up. */
            Ty_FatalError("Cannot recover from Python stack overflow.");
        }
    }
    else {
        if (tstate->py_recursion_remaining <= 0) {
            tstate->recursion_headroom++;
            _TyErr_Format(tstate, TyExc_RecursionError,
                        "maximum recursion depth exceeded");
            tstate->recursion_headroom--;
            return -1;
        }
    }
    return 0;
}

static const _Ty_CODEUNIT _Ty_INTERPRETER_TRAMPOLINE_INSTRUCTIONS[] = {
    /* Put a NOP at the start, so that the IP points into
    * the code, rather than before it */
    { .op.code = NOP, .op.arg = 0 },
    { .op.code = INTERPRETER_EXIT, .op.arg = 0 },  /* reached on return */
    { .op.code = NOP, .op.arg = 0 },
    { .op.code = INTERPRETER_EXIT, .op.arg = 0 },  /* reached on yield */
    { .op.code = RESUME, .op.arg = RESUME_OPARG_DEPTH1_MASK | RESUME_AT_FUNC_START }
};

#ifdef Ty_DEBUG
extern void _PyUOpPrint(const _PyUOpInstruction *uop);
#endif


/* Disable unused label warnings.  They are handy for debugging, even
   if computed gotos aren't used. */

/* TBD - what about other compilers? */
#if defined(__GNUC__) || defined(__clang__)
#  pragma GCC diagnostic push
#  pragma GCC diagnostic ignored "-Wunused-label"
#elif defined(_MSC_VER) /* MS_WINDOWS */
#  pragma warning(push)
#  pragma warning(disable:4102)
#endif


TyObject **
_PyObjectArray_FromStackRefArray(_PyStackRef *input, Ty_ssize_t nargs, TyObject **scratch)
{
    TyObject **result;
    if (nargs > MAX_STACKREF_SCRATCH) {
        // +1 in case PY_VECTORCALL_ARGUMENTS_OFFSET is set.
        result = TyMem_Malloc((nargs + 1) * sizeof(TyObject *));
        if (result == NULL) {
            return NULL;
        }
        result++;
    }
    else {
        result = scratch;
    }
    for (int i = 0; i < nargs; i++) {
        result[i] = PyStackRef_AsPyObjectBorrow(input[i]);
    }
    return result;
}

void
_PyObjectArray_Free(TyObject **array, TyObject **scratch)
{
    if (array != scratch) {
        TyMem_Free(array);
    }
}


/* _TyEval_EvalFrameDefault is too large to optimize for speed with PGO on MSVC.
 */
#if (defined(_MSC_VER) && \
     (_MSC_VER < 1943) && \
     defined(_Ty_USING_PGO))
#define DO_NOT_OPTIMIZE_INTERP_LOOP
#endif

#ifdef DO_NOT_OPTIMIZE_INTERP_LOOP
#  pragma optimize("t", off)
/* This setting is reversed below following _TyEval_EvalFrameDefault */
#endif

#if Ty_TAIL_CALL_INTERP
#include "opcode_targets.h"
#include "generated_cases.c.h"
#endif

#if (defined(__GNUC__) && __GNUC__ >= 10 && !defined(__clang__)) && defined(__x86_64__)
/*
 * gh-129987: The SLP autovectorizer can cause poor code generation for
 * opcode dispatch in some GCC versions (observed in GCCs 12 through 15,
 * probably caused by https://gcc.gnu.org/bugzilla/show_bug.cgi?id=115777),
 * negating any benefit we get from vectorization elsewhere in the
 * interpreter loop. Disabling it significantly affected older GCC versions
 * (prior to GCC 9, 40% performance drop), so we have to selectively disable
 * it.
 */
#define DONT_SLP_VECTORIZE __attribute__((optimize ("no-tree-slp-vectorize")))
#else
#define DONT_SLP_VECTORIZE
#endif

typedef struct {
    _PyInterpreterFrame frame;
    _PyStackRef stack[1];
} _PyEntryFrame;

TyObject* _Ty_HOT_FUNCTION DONT_SLP_VECTORIZE
_TyEval_EvalFrameDefault(TyThreadState *tstate, _PyInterpreterFrame *frame, int throwflag)
{
    _Ty_EnsureTstateNotNULL(tstate);
    CALL_STAT_INC(pyeval_calls);

#if USE_COMPUTED_GOTOS && !Ty_TAIL_CALL_INTERP
/* Import the static jump table */
#include "opcode_targets.h"
#endif

#ifdef Ty_STATS
    int lastopcode = 0;
#endif
#if !Ty_TAIL_CALL_INTERP
    uint8_t opcode;    /* Current opcode */
    int oparg;         /* Current opcode argument, if any */
    assert(tstate->current_frame == NULL || tstate->current_frame->stackpointer != NULL);
#endif
    _PyEntryFrame entry;

    if (_Ty_EnterRecursiveCallTstate(tstate, "")) {
        assert(frame->owner != FRAME_OWNED_BY_INTERPRETER);
        _TyEval_FrameClearAndPop(tstate, frame);
        return NULL;
    }

    /* Local "register" variables.
     * These are cached values from the frame and code object.  */
    _Ty_CODEUNIT *next_instr;
    _PyStackRef *stack_pointer;
    entry.stack[0] = PyStackRef_NULL;
#ifdef Ty_STACKREF_DEBUG
    entry.frame.f_funcobj = PyStackRef_None;
#elif defined(Ty_DEBUG)
    /* Set these to invalid but identifiable values for debugging. */
    entry.frame.f_funcobj = (_PyStackRef){.bits = 0xaaa0};
    entry.frame.f_locals = (TyObject*)0xaaa1;
    entry.frame.frame_obj = (PyFrameObject*)0xaaa2;
    entry.frame.f_globals = (TyObject*)0xaaa3;
    entry.frame.f_builtins = (TyObject*)0xaaa4;
#endif
    entry.frame.f_executable = PyStackRef_None;
    entry.frame.instr_ptr = (_Ty_CODEUNIT *)_Ty_INTERPRETER_TRAMPOLINE_INSTRUCTIONS + 1;
    entry.frame.stackpointer = entry.stack;
    entry.frame.owner = FRAME_OWNED_BY_INTERPRETER;
    entry.frame.visited = 0;
    entry.frame.return_offset = 0;
#ifdef Ty_DEBUG
    entry.frame.lltrace = 0;
#endif
    /* Push frame */
    entry.frame.previous = tstate->current_frame;
    frame->previous = &entry.frame;
    tstate->current_frame = frame;
    entry.frame.localsplus[0] = PyStackRef_NULL;
#ifdef _Ty_TIER2
    if (tstate->current_executor != NULL) {
        entry.frame.localsplus[0] = PyStackRef_FromPyObjectNew(tstate->current_executor);
        tstate->current_executor = NULL;
    }
#endif

    /* support for generator.throw() */
    if (throwflag) {
        if (_Ty_EnterRecursivePy(tstate)) {
            goto early_exit;
        }
#ifdef Ty_GIL_DISABLED
        /* Load thread-local bytecode */
        if (frame->tlbc_index != ((_PyThreadStateImpl *)tstate)->tlbc_index) {
            _Ty_CODEUNIT *bytecode =
                _TyEval_GetExecutableCode(tstate, _TyFrame_GetCode(frame));
            if (bytecode == NULL) {
                goto early_exit;
            }
            ptrdiff_t off = frame->instr_ptr - _TyFrame_GetBytecode(frame);
            frame->tlbc_index = ((_PyThreadStateImpl *)tstate)->tlbc_index;
            frame->instr_ptr = bytecode + off;
        }
#endif
        /* Because this avoids the RESUME, we need to update instrumentation */
        _Ty_Instrument(_TyFrame_GetCode(frame), tstate->interp);
        next_instr = frame->instr_ptr;
        monitor_throw(tstate, frame, next_instr);
        stack_pointer = _TyFrame_GetStackPointer(frame);
#if Ty_TAIL_CALL_INTERP
#   if Ty_STATS
        return _TAIL_CALL_error(frame, stack_pointer, tstate, next_instr, 0, lastopcode);
#   else
        return _TAIL_CALL_error(frame, stack_pointer, tstate, next_instr, 0);
#   endif
#else
        goto error;
#endif
    }

#if defined(_Ty_TIER2) && !defined(_Ty_JIT)
    /* Tier 2 interpreter state */
    _PyExecutorObject *current_executor = NULL;
    const _PyUOpInstruction *next_uop = NULL;
#endif
#if Ty_TAIL_CALL_INTERP
#   if Ty_STATS
        return _TAIL_CALL_start_frame(frame, NULL, tstate, NULL, 0, lastopcode);
#   else
        return _TAIL_CALL_start_frame(frame, NULL, tstate, NULL, 0);
#   endif
#else
    goto start_frame;
#   include "generated_cases.c.h"
#endif


#ifdef _Ty_TIER2

// Tier 2 is also here!
enter_tier_two:

#ifdef _Ty_JIT
    assert(0);
#else

#undef LOAD_IP
#define LOAD_IP(UNUSED) (void)0

#ifdef Ty_STATS
// Disable these macros that apply to Tier 1 stats when we are in Tier 2
#undef STAT_INC
#define STAT_INC(opname, name) ((void)0)
#undef STAT_DEC
#define STAT_DEC(opname, name) ((void)0)
#endif

#undef ENABLE_SPECIALIZATION
#define ENABLE_SPECIALIZATION 0
#undef ENABLE_SPECIALIZATION_FT
#define ENABLE_SPECIALIZATION_FT 0

    ; // dummy statement after a label, before a declaration
    uint16_t uopcode;
#ifdef Ty_STATS
    int lastuop = 0;
    uint64_t trace_uop_execution_counter = 0;
#endif

    assert(next_uop->opcode == _START_EXECUTOR);
tier2_dispatch:
    for (;;) {
        uopcode = next_uop->opcode;
#ifdef Ty_DEBUG
        if (frame->lltrace >= 3) {
            dump_stack(frame, stack_pointer);
            if (next_uop->opcode == _START_EXECUTOR) {
                printf("%4d uop: ", 0);
            }
            else {
                printf("%4d uop: ", (int)(next_uop - current_executor->trace));
            }
            _PyUOpPrint(next_uop);
            printf("\n");
        }
#endif
        next_uop++;
        OPT_STAT_INC(uops_executed);
        UOP_STAT_INC(uopcode, execution_count);
        UOP_PAIR_INC(uopcode, lastuop);
#ifdef Ty_STATS
        trace_uop_execution_counter++;
        ((_PyUOpInstruction  *)next_uop)[-1].execution_count++;
#endif

        switch (uopcode) {

#include "executor_cases.c.h"

            default:
#ifdef Ty_DEBUG
            {
                printf("Unknown uop: ");
                _PyUOpPrint(&next_uop[-1]);
                printf(" @ %d\n", (int)(next_uop - current_executor->trace - 1));
                Ty_FatalError("Unknown uop");
            }
#else
            Ty_UNREACHABLE();
#endif

        }
    }

jump_to_error_target:
#ifdef Ty_DEBUG
    if (frame->lltrace >= 2) {
        printf("Error: [UOp ");
        _PyUOpPrint(&next_uop[-1]);
        printf(" @ %d -> %s]\n",
               (int)(next_uop - current_executor->trace - 1),
               _TyOpcode_OpName[frame->instr_ptr->op.code]);
    }
#endif
    assert(next_uop[-1].format == UOP_FORMAT_JUMP);
    uint16_t target = uop_get_error_target(&next_uop[-1]);
    next_uop = current_executor->trace + target;
    goto tier2_dispatch;

jump_to_jump_target:
    assert(next_uop[-1].format == UOP_FORMAT_JUMP);
    target = uop_get_jump_target(&next_uop[-1]);
    next_uop = current_executor->trace + target;
    goto tier2_dispatch;

#endif  // _Ty_JIT

#endif // _Ty_TIER2

early_exit:
    assert(_TyErr_Occurred(tstate));
    _Ty_LeaveRecursiveCallPy(tstate);
    assert(frame->owner != FRAME_OWNED_BY_INTERPRETER);
    // GH-99729: We need to unlink the frame *before* clearing it:
    _PyInterpreterFrame *dying = frame;
    frame = tstate->current_frame = dying->previous;
    _TyEval_FrameClearAndPop(tstate, dying);
    frame->return_offset = 0;
    assert(frame->owner == FRAME_OWNED_BY_INTERPRETER);
    /* Restore previous frame and exit */
    tstate->current_frame = frame->previous;
    return NULL;
}

#ifdef DO_NOT_OPTIMIZE_INTERP_LOOP
#  pragma optimize("", on)
#endif

#if defined(__GNUC__) || defined(__clang__)
#  pragma GCC diagnostic pop
#elif defined(_MSC_VER) /* MS_WINDOWS */
#  pragma warning(pop)
#endif

static void
format_missing(TyThreadState *tstate, const char *kind,
               PyCodeObject *co, TyObject *names, TyObject *qualname)
{
    int err;
    Ty_ssize_t len = TyList_GET_SIZE(names);
    TyObject *name_str, *comma, *tail, *tmp;

    assert(TyList_CheckExact(names));
    assert(len >= 1);
    /* Deal with the joys of natural language. */
    switch (len) {
    case 1:
        name_str = TyList_GET_ITEM(names, 0);
        Ty_INCREF(name_str);
        break;
    case 2:
        name_str = TyUnicode_FromFormat("%U and %U",
                                        TyList_GET_ITEM(names, len - 2),
                                        TyList_GET_ITEM(names, len - 1));
        break;
    default:
        tail = TyUnicode_FromFormat(", %U, and %U",
                                    TyList_GET_ITEM(names, len - 2),
                                    TyList_GET_ITEM(names, len - 1));
        if (tail == NULL)
            return;
        /* Chop off the last two objects in the list. This shouldn't actually
           fail, but we can't be too careful. */
        err = TyList_SetSlice(names, len - 2, len, NULL);
        if (err == -1) {
            Ty_DECREF(tail);
            return;
        }
        /* Stitch everything up into a nice comma-separated list. */
        comma = TyUnicode_FromString(", ");
        if (comma == NULL) {
            Ty_DECREF(tail);
            return;
        }
        tmp = TyUnicode_Join(comma, names);
        Ty_DECREF(comma);
        if (tmp == NULL) {
            Ty_DECREF(tail);
            return;
        }
        name_str = TyUnicode_Concat(tmp, tail);
        Ty_DECREF(tmp);
        Ty_DECREF(tail);
        break;
    }
    if (name_str == NULL)
        return;
    _TyErr_Format(tstate, TyExc_TypeError,
                  "%U() missing %i required %s argument%s: %U",
                  qualname,
                  len,
                  kind,
                  len == 1 ? "" : "s",
                  name_str);
    Ty_DECREF(name_str);
}

static void
missing_arguments(TyThreadState *tstate, PyCodeObject *co,
                  Ty_ssize_t missing, Ty_ssize_t defcount,
                  _PyStackRef *localsplus, TyObject *qualname)
{
    Ty_ssize_t i, j = 0;
    Ty_ssize_t start, end;
    int positional = (defcount != -1);
    const char *kind = positional ? "positional" : "keyword-only";
    TyObject *missing_names;

    /* Compute the names of the arguments that are missing. */
    missing_names = TyList_New(missing);
    if (missing_names == NULL)
        return;
    if (positional) {
        start = 0;
        end = co->co_argcount - defcount;
    }
    else {
        start = co->co_argcount;
        end = start + co->co_kwonlyargcount;
    }
    for (i = start; i < end; i++) {
        if (PyStackRef_IsNull(localsplus[i])) {
            TyObject *raw = TyTuple_GET_ITEM(co->co_localsplusnames, i);
            TyObject *name = PyObject_Repr(raw);
            if (name == NULL) {
                Ty_DECREF(missing_names);
                return;
            }
            TyList_SET_ITEM(missing_names, j++, name);
        }
    }
    assert(j == missing);
    format_missing(tstate, kind, co, missing_names, qualname);
    Ty_DECREF(missing_names);
}

static void
too_many_positional(TyThreadState *tstate, PyCodeObject *co,
                    Ty_ssize_t given, TyObject *defaults,
                    _PyStackRef *localsplus, TyObject *qualname)
{
    int plural;
    Ty_ssize_t kwonly_given = 0;
    Ty_ssize_t i;
    TyObject *sig, *kwonly_sig;
    Ty_ssize_t co_argcount = co->co_argcount;

    assert((co->co_flags & CO_VARARGS) == 0);
    /* Count missing keyword-only args. */
    for (i = co_argcount; i < co_argcount + co->co_kwonlyargcount; i++) {
        if (PyStackRef_AsPyObjectBorrow(localsplus[i]) != NULL) {
            kwonly_given++;
        }
    }
    Ty_ssize_t defcount = defaults == NULL ? 0 : TyTuple_GET_SIZE(defaults);
    if (defcount) {
        Ty_ssize_t atleast = co_argcount - defcount;
        plural = 1;
        sig = TyUnicode_FromFormat("from %zd to %zd", atleast, co_argcount);
    }
    else {
        plural = (co_argcount != 1);
        sig = TyUnicode_FromFormat("%zd", co_argcount);
    }
    if (sig == NULL)
        return;
    if (kwonly_given) {
        const char *format = " positional argument%s (and %zd keyword-only argument%s)";
        kwonly_sig = TyUnicode_FromFormat(format,
                                          given != 1 ? "s" : "",
                                          kwonly_given,
                                          kwonly_given != 1 ? "s" : "");
        if (kwonly_sig == NULL) {
            Ty_DECREF(sig);
            return;
        }
    }
    else {
        /* This will not fail. */
        kwonly_sig = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
        assert(kwonly_sig != NULL);
    }
    _TyErr_Format(tstate, TyExc_TypeError,
                  "%U() takes %U positional argument%s but %zd%U %s given",
                  qualname,
                  sig,
                  plural ? "s" : "",
                  given,
                  kwonly_sig,
                  given == 1 && !kwonly_given ? "was" : "were");
    Ty_DECREF(sig);
    Ty_DECREF(kwonly_sig);
}

static int
positional_only_passed_as_keyword(TyThreadState *tstate, PyCodeObject *co,
                                  Ty_ssize_t kwcount, TyObject* kwnames,
                                  TyObject *qualname)
{
    int posonly_conflicts = 0;
    TyObject* posonly_names = TyList_New(0);
    if (posonly_names == NULL) {
        goto fail;
    }
    for(int k=0; k < co->co_posonlyargcount; k++){
        TyObject* posonly_name = TyTuple_GET_ITEM(co->co_localsplusnames, k);

        for (int k2=0; k2<kwcount; k2++){
            /* Compare the pointers first and fallback to PyObject_RichCompareBool*/
            TyObject* kwname = TyTuple_GET_ITEM(kwnames, k2);
            if (kwname == posonly_name){
                if(TyList_Append(posonly_names, kwname) != 0) {
                    goto fail;
                }
                posonly_conflicts++;
                continue;
            }

            int cmp = PyObject_RichCompareBool(posonly_name, kwname, Py_EQ);

            if ( cmp > 0) {
                if(TyList_Append(posonly_names, kwname) != 0) {
                    goto fail;
                }
                posonly_conflicts++;
            } else if (cmp < 0) {
                goto fail;
            }

        }
    }
    if (posonly_conflicts) {
        TyObject* comma = TyUnicode_FromString(", ");
        if (comma == NULL) {
            goto fail;
        }
        TyObject* error_names = TyUnicode_Join(comma, posonly_names);
        Ty_DECREF(comma);
        if (error_names == NULL) {
            goto fail;
        }
        _TyErr_Format(tstate, TyExc_TypeError,
                      "%U() got some positional-only arguments passed"
                      " as keyword arguments: '%U'",
                      qualname, error_names);
        Ty_DECREF(error_names);
        goto fail;
    }

    Ty_DECREF(posonly_names);
    return 0;

fail:
    Ty_XDECREF(posonly_names);
    return 1;

}


static inline unsigned char *
scan_back_to_entry_start(unsigned char *p) {
    for (; (p[0]&128) == 0; p--);
    return p;
}

static inline unsigned char *
skip_to_next_entry(unsigned char *p, unsigned char *end) {
    while (p < end && ((p[0] & 128) == 0)) {
        p++;
    }
    return p;
}


#define MAX_LINEAR_SEARCH 40

static Ty_NO_INLINE int
get_exception_handler(PyCodeObject *code, int index, int *level, int *handler, int *lasti)
{
    unsigned char *start = (unsigned char *)TyBytes_AS_STRING(code->co_exceptiontable);
    unsigned char *end = start + TyBytes_GET_SIZE(code->co_exceptiontable);
    /* Invariants:
     * start_table == end_table OR
     * start_table points to a legal entry and end_table points
     * beyond the table or to a legal entry that is after index.
     */
    if (end - start > MAX_LINEAR_SEARCH) {
        int offset;
        parse_varint(start, &offset);
        if (offset > index) {
            return 0;
        }
        do {
            unsigned char * mid = start + ((end-start)>>1);
            mid = scan_back_to_entry_start(mid);
            parse_varint(mid, &offset);
            if (offset > index) {
                end = mid;
            }
            else {
                start = mid;
            }

        } while (end - start > MAX_LINEAR_SEARCH);
    }
    unsigned char *scan = start;
    while (scan < end) {
        int start_offset, size;
        scan = parse_varint(scan, &start_offset);
        if (start_offset > index) {
            break;
        }
        scan = parse_varint(scan, &size);
        if (start_offset + size > index) {
            scan = parse_varint(scan, handler);
            int depth_and_lasti;
            parse_varint(scan, &depth_and_lasti);
            *level = depth_and_lasti >> 1;
            *lasti = depth_and_lasti & 1;
            return 1;
        }
        scan = skip_to_next_entry(scan, end);
    }
    return 0;
}

static int
initialize_locals(TyThreadState *tstate, PyFunctionObject *func,
    _PyStackRef *localsplus, _PyStackRef const *args,
    Ty_ssize_t argcount, TyObject *kwnames)
{
    PyCodeObject *co = (PyCodeObject*)func->func_code;
    const Ty_ssize_t total_args = co->co_argcount + co->co_kwonlyargcount;
    /* Create a dictionary for keyword parameters (**kwags) */
    TyObject *kwdict;
    Ty_ssize_t i;
    if (co->co_flags & CO_VARKEYWORDS) {
        kwdict = TyDict_New();
        if (kwdict == NULL) {
            goto fail_pre_positional;
        }
        i = total_args;
        if (co->co_flags & CO_VARARGS) {
            i++;
        }
        assert(PyStackRef_IsNull(localsplus[i]));
        localsplus[i] = PyStackRef_FromPyObjectSteal(kwdict);
    }
    else {
        kwdict = NULL;
    }

    /* Copy all positional arguments into local variables */
    Ty_ssize_t j, n;
    if (argcount > co->co_argcount) {
        n = co->co_argcount;
    }
    else {
        n = argcount;
    }
    for (j = 0; j < n; j++) {
        assert(PyStackRef_IsNull(localsplus[j]));
        localsplus[j] = args[j];
    }

    /* Pack other positional arguments into the *args argument */
    if (co->co_flags & CO_VARARGS) {
        TyObject *u = NULL;
        if (argcount == n) {
            u = (TyObject *)&_Ty_SINGLETON(tuple_empty);
        }
        else {
            u = _TyTuple_FromStackRefStealOnSuccess(args + n, argcount - n);
            if (u == NULL) {
                for (Ty_ssize_t i = n; i < argcount; i++) {
                    PyStackRef_CLOSE(args[i]);
                }
            }
        }
        if (u == NULL) {
            goto fail_post_positional;
        }
        assert(PyStackRef_AsPyObjectBorrow(localsplus[total_args]) == NULL);
        localsplus[total_args] = PyStackRef_FromPyObjectSteal(u);
    }
    else if (argcount > n) {
        /* Too many positional args. Error is reported later */
        for (j = n; j < argcount; j++) {
            PyStackRef_CLOSE(args[j]);
        }
    }

    /* Handle keyword arguments */
    if (kwnames != NULL) {
        Ty_ssize_t kwcount = TyTuple_GET_SIZE(kwnames);
        for (i = 0; i < kwcount; i++) {
            TyObject **co_varnames;
            TyObject *keyword = TyTuple_GET_ITEM(kwnames, i);
            _PyStackRef value_stackref = args[i+argcount];
            Ty_ssize_t j;

            if (keyword == NULL || !TyUnicode_Check(keyword)) {
                _TyErr_Format(tstate, TyExc_TypeError,
                            "%U() keywords must be strings",
                          func->func_qualname);
                goto kw_fail;
            }

            /* Speed hack: do raw pointer compares. As names are
            normally interned this should almost always hit. */
            co_varnames = ((PyTupleObject *)(co->co_localsplusnames))->ob_item;
            for (j = co->co_posonlyargcount; j < total_args; j++) {
                TyObject *varname = co_varnames[j];
                if (varname == keyword) {
                    goto kw_found;
                }
            }

            /* Slow fallback, just in case */
            for (j = co->co_posonlyargcount; j < total_args; j++) {
                TyObject *varname = co_varnames[j];
                int cmp = PyObject_RichCompareBool( keyword, varname, Py_EQ);
                if (cmp > 0) {
                    goto kw_found;
                }
                else if (cmp < 0) {
                    goto kw_fail;
                }
            }

            assert(j >= total_args);
            if (kwdict == NULL) {

                if (co->co_posonlyargcount
                    && positional_only_passed_as_keyword(tstate, co,
                                                        kwcount, kwnames,
                                                        func->func_qualname))
                {
                    goto kw_fail;
                }

                TyObject* suggestion_keyword = NULL;
                if (total_args > co->co_posonlyargcount) {
                    TyObject* possible_keywords = TyList_New(total_args - co->co_posonlyargcount);

                    if (!possible_keywords) {
                        TyErr_Clear();
                    } else {
                        for (Ty_ssize_t k = co->co_posonlyargcount; k < total_args; k++) {
                            TyList_SET_ITEM(possible_keywords, k - co->co_posonlyargcount, co_varnames[k]);
                        }

                        suggestion_keyword = _Ty_CalculateSuggestions(possible_keywords, keyword);
                        Ty_DECREF(possible_keywords);
                    }
                }

                if (suggestion_keyword) {
                    _TyErr_Format(tstate, TyExc_TypeError,
                                "%U() got an unexpected keyword argument '%S'. Did you mean '%S'?",
                                func->func_qualname, keyword, suggestion_keyword);
                    Ty_DECREF(suggestion_keyword);
                } else {
                    _TyErr_Format(tstate, TyExc_TypeError,
                                "%U() got an unexpected keyword argument '%S'",
                                func->func_qualname, keyword);
                }

                goto kw_fail;
            }

            if (TyDict_SetItem(kwdict, keyword, PyStackRef_AsPyObjectBorrow(value_stackref)) == -1) {
                goto kw_fail;
            }
            PyStackRef_CLOSE(value_stackref);
            continue;

        kw_fail:
            for (;i < kwcount; i++) {
                PyStackRef_CLOSE(args[i+argcount]);
            }
            goto fail_post_args;

        kw_found:
            if (PyStackRef_AsPyObjectBorrow(localsplus[j]) != NULL) {
                _TyErr_Format(tstate, TyExc_TypeError,
                            "%U() got multiple values for argument '%S'",
                          func->func_qualname, keyword);
                goto kw_fail;
            }
            localsplus[j] = value_stackref;
        }
    }

    /* Check the number of positional arguments */
    if ((argcount > co->co_argcount) && !(co->co_flags & CO_VARARGS)) {
        too_many_positional(tstate, co, argcount, func->func_defaults, localsplus,
                            func->func_qualname);
        goto fail_post_args;
    }

    /* Add missing positional arguments (copy default values from defs) */
    if (argcount < co->co_argcount) {
        Ty_ssize_t defcount = func->func_defaults == NULL ? 0 : TyTuple_GET_SIZE(func->func_defaults);
        Ty_ssize_t m = co->co_argcount - defcount;
        Ty_ssize_t missing = 0;
        for (i = argcount; i < m; i++) {
            if (PyStackRef_IsNull(localsplus[i])) {
                missing++;
            }
        }
        if (missing) {
            missing_arguments(tstate, co, missing, defcount, localsplus,
                              func->func_qualname);
            goto fail_post_args;
        }
        if (n > m)
            i = n - m;
        else
            i = 0;
        if (defcount) {
            TyObject **defs = &TyTuple_GET_ITEM(func->func_defaults, 0);
            for (; i < defcount; i++) {
                if (PyStackRef_AsPyObjectBorrow(localsplus[m+i]) == NULL) {
                    TyObject *def = defs[i];
                    localsplus[m+i] = PyStackRef_FromPyObjectNew(def);
                }
            }
        }
    }

    /* Add missing keyword arguments (copy default values from kwdefs) */
    if (co->co_kwonlyargcount > 0) {
        Ty_ssize_t missing = 0;
        for (i = co->co_argcount; i < total_args; i++) {
            if (PyStackRef_AsPyObjectBorrow(localsplus[i]) != NULL)
                continue;
            TyObject *varname = TyTuple_GET_ITEM(co->co_localsplusnames, i);
            if (func->func_kwdefaults != NULL) {
                TyObject *def;
                if (TyDict_GetItemRef(func->func_kwdefaults, varname, &def) < 0) {
                    goto fail_post_args;
                }
                if (def) {
                    localsplus[i] = PyStackRef_FromPyObjectSteal(def);
                    continue;
                }
            }
            missing++;
        }
        if (missing) {
            missing_arguments(tstate, co, missing, -1, localsplus,
                              func->func_qualname);
            goto fail_post_args;
        }
    }
    return 0;

fail_pre_positional:
    for (j = 0; j < argcount; j++) {
        PyStackRef_CLOSE(args[j]);
    }
    /* fall through */
fail_post_positional:
    if (kwnames) {
        Ty_ssize_t kwcount = TyTuple_GET_SIZE(kwnames);
        for (j = argcount; j < argcount+kwcount; j++) {
            PyStackRef_CLOSE(args[j]);
        }
    }
    /* fall through */
fail_post_args:
    return -1;
}

static void
clear_thread_frame(TyThreadState *tstate, _PyInterpreterFrame * frame)
{
    assert(frame->owner == FRAME_OWNED_BY_THREAD);
    // Make sure that this is, indeed, the top frame. We can't check this in
    // _TyThreadState_PopFrame, since f_code is already cleared at that point:
    assert((TyObject **)frame + _TyFrame_GetCode(frame)->co_framesize ==
        tstate->datastack_top);
    assert(frame->frame_obj == NULL || frame->frame_obj->f_frame == frame);
    _TyFrame_ClearExceptCode(frame);
    PyStackRef_CLEAR(frame->f_executable);
    _TyThreadState_PopFrame(tstate, frame);
}

static void
clear_gen_frame(TyThreadState *tstate, _PyInterpreterFrame * frame)
{
    assert(frame->owner == FRAME_OWNED_BY_GENERATOR);
    PyGenObject *gen = _TyGen_GetGeneratorFromFrame(frame);
    gen->gi_frame_state = FRAME_CLEARED;
    assert(tstate->exc_info == &gen->gi_exc_state);
    tstate->exc_info = gen->gi_exc_state.previous_item;
    gen->gi_exc_state.previous_item = NULL;
    assert(frame->frame_obj == NULL || frame->frame_obj->f_frame == frame);
    _TyFrame_ClearExceptCode(frame);
    _TyErr_ClearExcState(&gen->gi_exc_state);
    frame->previous = NULL;
}

void
_TyEval_FrameClearAndPop(TyThreadState *tstate, _PyInterpreterFrame * frame)
{
    if (frame->owner == FRAME_OWNED_BY_THREAD) {
        clear_thread_frame(tstate, frame);
    }
    else {
        clear_gen_frame(tstate, frame);
    }
}

/* Consumes references to func, locals and all the args */
_PyInterpreterFrame *
_PyEvalFramePushAndInit(TyThreadState *tstate, _PyStackRef func,
                        TyObject *locals, _PyStackRef const* args,
                        size_t argcount, TyObject *kwnames, _PyInterpreterFrame *previous)
{
    PyFunctionObject *func_obj = (PyFunctionObject *)PyStackRef_AsPyObjectBorrow(func);
    PyCodeObject * code = (PyCodeObject *)func_obj->func_code;
    CALL_STAT_INC(frames_pushed);
    _PyInterpreterFrame *frame = _TyThreadState_PushFrame(tstate, code->co_framesize);
    if (frame == NULL) {
        goto fail;
    }
    _TyFrame_Initialize(tstate, frame, func, locals, code, 0, previous);
    if (initialize_locals(tstate, func_obj, frame->localsplus, args, argcount, kwnames)) {
        assert(frame->owner == FRAME_OWNED_BY_THREAD);
        clear_thread_frame(tstate, frame);
        return NULL;
    }
    return frame;
fail:
    /* Consume the references */
    PyStackRef_CLOSE(func);
    Ty_XDECREF(locals);
    for (size_t i = 0; i < argcount; i++) {
        PyStackRef_CLOSE(args[i]);
    }
    if (kwnames) {
        Ty_ssize_t kwcount = TyTuple_GET_SIZE(kwnames);
        for (Ty_ssize_t i = 0; i < kwcount; i++) {
            PyStackRef_CLOSE(args[i+argcount]);
        }
    }
    TyErr_NoMemory();
    return NULL;
}

/* Same as _PyEvalFramePushAndInit but takes an args tuple and kwargs dict.
   Steals references to func, callargs and kwargs.
*/
static _PyInterpreterFrame *
_PyEvalFramePushAndInit_Ex(TyThreadState *tstate, _PyStackRef func,
    TyObject *locals, Ty_ssize_t nargs, TyObject *callargs, TyObject *kwargs, _PyInterpreterFrame *previous)
{
    bool has_dict = (kwargs != NULL && TyDict_GET_SIZE(kwargs) > 0);
    TyObject *kwnames = NULL;
    _PyStackRef *newargs;
    TyObject *const *object_array = NULL;
    _PyStackRef stack_array[8];
    if (has_dict) {
        object_array = _PyStack_UnpackDict(tstate, _TyTuple_ITEMS(callargs), nargs, kwargs, &kwnames);
        if (object_array == NULL) {
            PyStackRef_CLOSE(func);
            goto error;
        }
        size_t total_args = nargs + TyDict_GET_SIZE(kwargs);
        assert(sizeof(TyObject *) == sizeof(_PyStackRef));
        newargs = (_PyStackRef *)object_array;
        for (size_t i = 0; i < total_args; i++) {
            newargs[i] = PyStackRef_FromPyObjectSteal(object_array[i]);
        }
    }
    else {
        if (nargs <= 8) {
            newargs = stack_array;
        }
        else {
            newargs = TyMem_Malloc(sizeof(_PyStackRef) *nargs);
            if (newargs == NULL) {
                TyErr_NoMemory();
                PyStackRef_CLOSE(func);
                goto error;
            }
        }
        /* We need to create a new reference for all our args since the new frame steals them. */
        for (Ty_ssize_t i = 0; i < nargs; i++) {
            newargs[i] = PyStackRef_FromPyObjectNew(TyTuple_GET_ITEM(callargs, i));
        }
    }
    _PyInterpreterFrame *new_frame = _PyEvalFramePushAndInit(
        tstate, func, locals,
        newargs, nargs, kwnames, previous
    );
    if (has_dict) {
        _PyStack_UnpackDict_FreeNoDecRef(object_array, kwnames);
    }
    else if (nargs > 8) {
       TyMem_Free((void *)newargs);
    }
    /* No need to decref func here because the reference has been stolen by
       _PyEvalFramePushAndInit.
    */
    Ty_DECREF(callargs);
    Ty_XDECREF(kwargs);
    return new_frame;
error:
    Ty_DECREF(callargs);
    Ty_XDECREF(kwargs);
    return NULL;
}

TyObject *
_TyEval_Vector(TyThreadState *tstate, PyFunctionObject *func,
               TyObject *locals,
               TyObject* const* args, size_t argcount,
               TyObject *kwnames)
{
    size_t total_args = argcount;
    if (kwnames) {
        total_args += TyTuple_GET_SIZE(kwnames);
    }
    _PyStackRef stack_array[8];
    _PyStackRef *arguments;
    if (total_args <= 8) {
        arguments = stack_array;
    }
    else {
        arguments = TyMem_Malloc(sizeof(_PyStackRef) * total_args);
        if (arguments == NULL) {
            return TyErr_NoMemory();
        }
    }
    /* _PyEvalFramePushAndInit consumes the references
     * to func, locals and all its arguments */
    Ty_XINCREF(locals);
    for (size_t i = 0; i < argcount; i++) {
        arguments[i] = PyStackRef_FromPyObjectNew(args[i]);
    }
    if (kwnames) {
        Ty_ssize_t kwcount = TyTuple_GET_SIZE(kwnames);
        for (Ty_ssize_t i = 0; i < kwcount; i++) {
            arguments[i+argcount] = PyStackRef_FromPyObjectNew(args[i+argcount]);
        }
    }
    _PyInterpreterFrame *frame = _PyEvalFramePushAndInit(
        tstate, PyStackRef_FromPyObjectNew(func), locals,
        arguments, argcount, kwnames, NULL);
    if (total_args > 8) {
        TyMem_Free(arguments);
    }
    if (frame == NULL) {
        return NULL;
    }
    EVAL_CALL_STAT_INC(EVAL_CALL_VECTOR);
    return _TyEval_EvalFrame(tstate, frame, 0);
}

/* Legacy API */
TyObject *
TyEval_EvalCodeEx(TyObject *_co, TyObject *globals, TyObject *locals,
                  TyObject *const *args, int argcount,
                  TyObject *const *kws, int kwcount,
                  TyObject *const *defs, int defcount,
                  TyObject *kwdefs, TyObject *closure)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *res = NULL;
    TyObject *defaults = _TyTuple_FromArray(defs, defcount);
    if (defaults == NULL) {
        return NULL;
    }
    TyObject *builtins = _TyDict_LoadBuiltinsFromGlobals(globals);
    if (builtins == NULL) {
        Ty_DECREF(defaults);
        return NULL;
    }
    if (locals == NULL) {
        locals = globals;
    }
    TyObject *kwnames = NULL;
    TyObject *const *allargs;
    TyObject **newargs = NULL;
    PyFunctionObject *func = NULL;
    if (kwcount == 0) {
        allargs = args;
    }
    else {
        kwnames = TyTuple_New(kwcount);
        if (kwnames == NULL) {
            goto fail;
        }
        newargs = TyMem_Malloc(sizeof(TyObject *)*(kwcount+argcount));
        if (newargs == NULL) {
            goto fail;
        }
        for (int i = 0; i < argcount; i++) {
            newargs[i] = args[i];
        }
        for (int i = 0; i < kwcount; i++) {
            TyTuple_SET_ITEM(kwnames, i, Ty_NewRef(kws[2*i]));
            newargs[argcount+i] = kws[2*i+1];
        }
        allargs = newargs;
    }
    PyFrameConstructor constr = {
        .fc_globals = globals,
        .fc_builtins = builtins,
        .fc_name = ((PyCodeObject *)_co)->co_name,
        .fc_qualname = ((PyCodeObject *)_co)->co_name,
        .fc_code = _co,
        .fc_defaults = defaults,
        .fc_kwdefaults = kwdefs,
        .fc_closure = closure
    };
    func = _TyFunction_FromConstructor(&constr);
    if (func == NULL) {
        goto fail;
    }
    EVAL_CALL_STAT_INC(EVAL_CALL_LEGACY);
    res = _TyEval_Vector(tstate, func, locals,
                         allargs, argcount,
                         kwnames);
fail:
    Ty_XDECREF(func);
    Ty_XDECREF(kwnames);
    TyMem_Free(newargs);
    _Ty_DECREF_BUILTINS(builtins);
    Ty_DECREF(defaults);
    return res;
}


/* Logic for the raise statement (too complicated for inlining).
   This *consumes* a reference count to each of its arguments. */
static int
do_raise(TyThreadState *tstate, TyObject *exc, TyObject *cause)
{
    TyObject *type = NULL, *value = NULL;

    if (exc == NULL) {
        /* Reraise */
        _TyErr_StackItem *exc_info = _TyErr_GetTopmostException(tstate);
        exc = exc_info->exc_value;
        if (Ty_IsNone(exc) || exc == NULL) {
            _TyErr_SetString(tstate, TyExc_RuntimeError,
                             "No active exception to reraise");
            return 0;
        }
        Ty_INCREF(exc);
        assert(PyExceptionInstance_Check(exc));
        _TyErr_SetRaisedException(tstate, exc);
        return 1;
    }

    /* We support the following forms of raise:
       raise
       raise <instance>
       raise <type> */

    if (PyExceptionClass_Check(exc)) {
        type = exc;
        value = _TyObject_CallNoArgs(exc);
        if (value == NULL)
            goto raise_error;
        if (!PyExceptionInstance_Check(value)) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "calling %R should have returned an instance of "
                          "BaseException, not %R",
                          type, Ty_TYPE(value));
             goto raise_error;
        }
    }
    else if (PyExceptionInstance_Check(exc)) {
        value = exc;
        type = PyExceptionInstance_Class(exc);
        Ty_INCREF(type);
    }
    else {
        /* Not something you can raise.  You get an exception
           anyway, just not what you specified :-) */
        Ty_DECREF(exc);
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "exceptions must derive from BaseException");
        goto raise_error;
    }

    assert(type != NULL);
    assert(value != NULL);

    if (cause) {
        TyObject *fixed_cause;
        if (PyExceptionClass_Check(cause)) {
            fixed_cause = _TyObject_CallNoArgs(cause);
            if (fixed_cause == NULL)
                goto raise_error;
            if (!PyExceptionInstance_Check(fixed_cause)) {
                _TyErr_Format(tstate, TyExc_TypeError,
                              "calling %R should have returned an instance of "
                              "BaseException, not %R",
                              cause, Ty_TYPE(fixed_cause));
                goto raise_error;
            }
            Ty_DECREF(cause);
        }
        else if (PyExceptionInstance_Check(cause)) {
            fixed_cause = cause;
        }
        else if (Ty_IsNone(cause)) {
            Ty_DECREF(cause);
            fixed_cause = NULL;
        }
        else {
            _TyErr_SetString(tstate, TyExc_TypeError,
                             "exception causes must derive from "
                             "BaseException");
            goto raise_error;
        }
        PyException_SetCause(value, fixed_cause);
    }

    _TyErr_SetObject(tstate, type, value);
    /* _TyErr_SetObject incref's its arguments */
    Ty_DECREF(value);
    Ty_DECREF(type);
    return 0;

raise_error:
    Ty_XDECREF(value);
    Ty_XDECREF(type);
    Ty_XDECREF(cause);
    return 0;
}

/* Logic for matching an exception in an except* clause (too
   complicated for inlining).
*/

int
_TyEval_ExceptionGroupMatch(_PyInterpreterFrame *frame, TyObject* exc_value,
                            TyObject *match_type, TyObject **match, TyObject **rest)
{
    if (Ty_IsNone(exc_value)) {
        *match = Ty_NewRef(Ty_None);
        *rest = Ty_NewRef(Ty_None);
        return 0;
    }
    assert(PyExceptionInstance_Check(exc_value));

    if (TyErr_GivenExceptionMatches(exc_value, match_type)) {
        /* Full match of exc itself */
        bool is_eg = _PyBaseExceptionGroup_Check(exc_value);
        if (is_eg) {
            *match = Ty_NewRef(exc_value);
        }
        else {
            /* naked exception - wrap it */
            TyObject *excs = TyTuple_Pack(1, exc_value);
            if (excs == NULL) {
                return -1;
            }
            TyObject *wrapped = _TyExc_CreateExceptionGroup("", excs);
            Ty_DECREF(excs);
            if (wrapped == NULL) {
                return -1;
            }
            PyFrameObject *f = _TyFrame_GetFrameObject(frame);
            if (f != NULL) {
                TyObject *tb = _PyTraceBack_FromFrame(NULL, f);
                if (tb == NULL) {
                    return -1;
                }
                PyException_SetTraceback(wrapped, tb);
                Ty_DECREF(tb);
            }
            *match = wrapped;
        }
        *rest = Ty_NewRef(Ty_None);
        return 0;
    }

    /* exc_value does not match match_type.
     * Check for partial match if it's an exception group.
     */
    if (_PyBaseExceptionGroup_Check(exc_value)) {
        TyObject *pair = PyObject_CallMethod(exc_value, "split", "(O)",
                                             match_type);
        if (pair == NULL) {
            return -1;
        }

        if (!TyTuple_CheckExact(pair)) {
            TyErr_Format(TyExc_TypeError,
                         "%.200s.split must return a tuple, not %.200s",
                         Ty_TYPE(exc_value)->tp_name, Ty_TYPE(pair)->tp_name);
            Ty_DECREF(pair);
            return -1;
        }

        // allow tuples of length > 2 for backwards compatibility
        if (TyTuple_GET_SIZE(pair) < 2) {
            TyErr_Format(TyExc_TypeError,
                         "%.200s.split must return a 2-tuple, "
                         "got tuple of size %zd",
                         Ty_TYPE(exc_value)->tp_name, TyTuple_GET_SIZE(pair));
            Ty_DECREF(pair);
            return -1;
        }

        *match = Ty_NewRef(TyTuple_GET_ITEM(pair, 0));
        *rest = Ty_NewRef(TyTuple_GET_ITEM(pair, 1));
        Ty_DECREF(pair);
        return 0;
    }
    /* no match */
    *match = Ty_NewRef(Ty_None);
    *rest = Ty_NewRef(exc_value);
    return 0;
}

/* Iterate v argcnt times and store the results on the stack (via decreasing
   sp).  Return 1 for success, 0 if error.

   If argcntafter == -1, do a simple unpack. If it is >= 0, do an unpack
   with a variable target.
*/

int
_TyEval_UnpackIterableStackRef(TyThreadState *tstate, TyObject *v,
                       int argcnt, int argcntafter, _PyStackRef *sp)
{
    int i = 0, j = 0;
    Ty_ssize_t ll = 0;
    TyObject *it;  /* iter(v) */
    TyObject *w;
    TyObject *l = NULL; /* variable list */
    assert(v != NULL);

    it = PyObject_GetIter(v);
    if (it == NULL) {
        if (_TyErr_ExceptionMatches(tstate, TyExc_TypeError) &&
            Ty_TYPE(v)->tp_iter == NULL && !PySequence_Check(v))
        {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "cannot unpack non-iterable %.200s object",
                          Ty_TYPE(v)->tp_name);
        }
        return 0;
    }

    for (; i < argcnt; i++) {
        w = TyIter_Next(it);
        if (w == NULL) {
            /* Iterator done, via error or exhaustion. */
            if (!_TyErr_Occurred(tstate)) {
                if (argcntafter == -1) {
                    _TyErr_Format(tstate, TyExc_ValueError,
                                  "not enough values to unpack "
                                  "(expected %d, got %d)",
                                  argcnt, i);
                }
                else {
                    _TyErr_Format(tstate, TyExc_ValueError,
                                  "not enough values to unpack "
                                  "(expected at least %d, got %d)",
                                  argcnt + argcntafter, i);
                }
            }
            goto Error;
        }
        *--sp = PyStackRef_FromPyObjectSteal(w);
    }

    if (argcntafter == -1) {
        /* We better have exhausted the iterator now. */
        w = TyIter_Next(it);
        if (w == NULL) {
            if (_TyErr_Occurred(tstate))
                goto Error;
            Ty_DECREF(it);
            return 1;
        }
        Ty_DECREF(w);

        if (TyList_CheckExact(v) || TyTuple_CheckExact(v)
              || TyDict_CheckExact(v)) {
            ll = TyDict_CheckExact(v) ? TyDict_Size(v) : Ty_SIZE(v);
            if (ll > argcnt) {
                _TyErr_Format(tstate, TyExc_ValueError,
                              "too many values to unpack (expected %d, got %zd)",
                              argcnt, ll);
                goto Error;
            }
        }
        _TyErr_Format(tstate, TyExc_ValueError,
                      "too many values to unpack (expected %d)",
                      argcnt);
        goto Error;
    }

    l = PySequence_List(it);
    if (l == NULL)
        goto Error;
    *--sp = PyStackRef_FromPyObjectSteal(l);
    i++;

    ll = TyList_GET_SIZE(l);
    if (ll < argcntafter) {
        _TyErr_Format(tstate, TyExc_ValueError,
            "not enough values to unpack (expected at least %d, got %zd)",
            argcnt + argcntafter, argcnt + ll);
        goto Error;
    }

    /* Pop the "after-variable" args off the list. */
    for (j = argcntafter; j > 0; j--, i++) {
        *--sp = PyStackRef_FromPyObjectSteal(TyList_GET_ITEM(l, ll - j));
    }
    /* Resize the list. */
    Ty_SET_SIZE(l, ll - argcntafter);
    Ty_DECREF(it);
    return 1;

Error:
    for (; i > 0; i--, sp++) {
        PyStackRef_CLOSE(*sp);
    }
    Ty_XDECREF(it);
    return 0;
}

static int
do_monitor_exc(TyThreadState *tstate, _PyInterpreterFrame *frame,
               _Ty_CODEUNIT *instr, int event)
{
    assert(event < _PY_MONITORING_UNGROUPED_EVENTS);
    if (_TyFrame_GetCode(frame)->co_flags & CO_NO_MONITORING_EVENTS) {
        return 0;
    }
    TyObject *exc = TyErr_GetRaisedException();
    assert(exc != NULL);
    int err = _Ty_call_instrumentation_arg(tstate, event, frame, instr, exc);
    if (err == 0) {
        TyErr_SetRaisedException(exc);
    }
    else {
        assert(TyErr_Occurred());
        Ty_DECREF(exc);
    }
    return err;
}

static inline bool
no_tools_for_global_event(TyThreadState *tstate, int event)
{
    return tstate->interp->monitors.tools[event] == 0;
}

static inline bool
no_tools_for_local_event(TyThreadState *tstate, _PyInterpreterFrame *frame, int event)
{
    assert(event < _PY_MONITORING_LOCAL_EVENTS);
    _PyCoMonitoringData *data = _TyFrame_GetCode(frame)->_co_monitoring;
    if (data) {
        return data->active_monitors.tools[event] == 0;
    }
    else {
        return no_tools_for_global_event(tstate, event);
    }
}

void
_TyEval_MonitorRaise(TyThreadState *tstate, _PyInterpreterFrame *frame,
              _Ty_CODEUNIT *instr)
{
    if (no_tools_for_global_event(tstate, PY_MONITORING_EVENT_RAISE)) {
        return;
    }
    do_monitor_exc(tstate, frame, instr, PY_MONITORING_EVENT_RAISE);
}

static void
monitor_reraise(TyThreadState *tstate, _PyInterpreterFrame *frame,
              _Ty_CODEUNIT *instr)
{
    if (no_tools_for_global_event(tstate, PY_MONITORING_EVENT_RERAISE)) {
        return;
    }
    do_monitor_exc(tstate, frame, instr, PY_MONITORING_EVENT_RERAISE);
}

static int
monitor_stop_iteration(TyThreadState *tstate, _PyInterpreterFrame *frame,
                       _Ty_CODEUNIT *instr, TyObject *value)
{
    if (no_tools_for_local_event(tstate, frame, PY_MONITORING_EVENT_STOP_ITERATION)) {
        return 0;
    }
    assert(!TyErr_Occurred());
    TyErr_SetObject(TyExc_StopIteration, value);
    int res = do_monitor_exc(tstate, frame, instr, PY_MONITORING_EVENT_STOP_ITERATION);
    if (res < 0) {
        return res;
    }
    TyErr_SetRaisedException(NULL);
    return 0;
}

static void
monitor_unwind(TyThreadState *tstate,
               _PyInterpreterFrame *frame,
               _Ty_CODEUNIT *instr)
{
    if (no_tools_for_global_event(tstate, PY_MONITORING_EVENT_PY_UNWIND)) {
        return;
    }
    do_monitor_exc(tstate, frame, instr, PY_MONITORING_EVENT_PY_UNWIND);
}


static int
monitor_handled(TyThreadState *tstate,
                _PyInterpreterFrame *frame,
                _Ty_CODEUNIT *instr, TyObject *exc)
{
    if (no_tools_for_global_event(tstate, PY_MONITORING_EVENT_EXCEPTION_HANDLED)) {
        return 0;
    }
    return _Ty_call_instrumentation_arg(tstate, PY_MONITORING_EVENT_EXCEPTION_HANDLED, frame, instr, exc);
}

static void
monitor_throw(TyThreadState *tstate,
              _PyInterpreterFrame *frame,
              _Ty_CODEUNIT *instr)
{
    if (no_tools_for_global_event(tstate, PY_MONITORING_EVENT_PY_THROW)) {
        return;
    }
    do_monitor_exc(tstate, frame, instr, PY_MONITORING_EVENT_PY_THROW);
}

void
TyThreadState_EnterTracing(TyThreadState *tstate)
{
    assert(tstate->tracing >= 0);
    tstate->tracing++;
}

void
TyThreadState_LeaveTracing(TyThreadState *tstate)
{
    assert(tstate->tracing > 0);
    tstate->tracing--;
}


TyObject*
_TyEval_CallTracing(TyObject *func, TyObject *args)
{
    // Save and disable tracing
    TyThreadState *tstate = _TyThreadState_GET();
    int save_tracing = tstate->tracing;
    tstate->tracing = 0;

    // Call the tracing function
    TyObject *result = PyObject_Call(func, args, NULL);

    // Restore tracing
    tstate->tracing = save_tracing;
    return result;
}

void
TyEval_SetProfile(Ty_tracefunc func, TyObject *arg)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (_TyEval_SetProfile(tstate, func, arg) < 0) {
        /* Log _TySys_Audit() error */
        TyErr_FormatUnraisable("Exception ignored in TyEval_SetProfile");
    }
}

void
TyEval_SetProfileAllThreads(Ty_tracefunc func, TyObject *arg)
{
    TyThreadState *this_tstate = _TyThreadState_GET();
    TyInterpreterState* interp = this_tstate->interp;

    _PyRuntimeState *runtime = &_PyRuntime;
    HEAD_LOCK(runtime);
    TyThreadState* ts = TyInterpreterState_ThreadHead(interp);
    HEAD_UNLOCK(runtime);

    while (ts) {
        if (_TyEval_SetProfile(ts, func, arg) < 0) {
            TyErr_FormatUnraisable("Exception ignored in TyEval_SetProfileAllThreads");
        }
        HEAD_LOCK(runtime);
        ts = TyThreadState_Next(ts);
        HEAD_UNLOCK(runtime);
    }
}

void
TyEval_SetTrace(Ty_tracefunc func, TyObject *arg)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (_TyEval_SetTrace(tstate, func, arg) < 0) {
        /* Log _TySys_Audit() error */
        TyErr_FormatUnraisable("Exception ignored in TyEval_SetTrace");
    }
}

void
TyEval_SetTraceAllThreads(Ty_tracefunc func, TyObject *arg)
{
    TyThreadState *this_tstate = _TyThreadState_GET();
    TyInterpreterState* interp = this_tstate->interp;

    _PyRuntimeState *runtime = &_PyRuntime;
    HEAD_LOCK(runtime);
    TyThreadState* ts = TyInterpreterState_ThreadHead(interp);
    HEAD_UNLOCK(runtime);

    while (ts) {
        if (_TyEval_SetTrace(ts, func, arg) < 0) {
            TyErr_FormatUnraisable("Exception ignored in TyEval_SetTraceAllThreads");
        }
        HEAD_LOCK(runtime);
        ts = TyThreadState_Next(ts);
        HEAD_UNLOCK(runtime);
    }
}

int
_TyEval_SetCoroutineOriginTrackingDepth(int depth)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (depth < 0) {
        _TyErr_SetString(tstate, TyExc_ValueError, "depth must be >= 0");
        return -1;
    }
    tstate->coroutine_origin_tracking_depth = depth;
    return 0;
}


int
_TyEval_GetCoroutineOriginTrackingDepth(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return tstate->coroutine_origin_tracking_depth;
}

int
_TyEval_SetAsyncGenFirstiter(TyObject *firstiter)
{
    TyThreadState *tstate = _TyThreadState_GET();

    if (_TySys_Audit(tstate, "sys.set_asyncgen_hook_firstiter", NULL) < 0) {
        return -1;
    }

    Ty_XSETREF(tstate->async_gen_firstiter, Ty_XNewRef(firstiter));
    return 0;
}

TyObject *
_TyEval_GetAsyncGenFirstiter(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return tstate->async_gen_firstiter;
}

int
_TyEval_SetAsyncGenFinalizer(TyObject *finalizer)
{
    TyThreadState *tstate = _TyThreadState_GET();

    if (_TySys_Audit(tstate, "sys.set_asyncgen_hook_finalizer", NULL) < 0) {
        return -1;
    }

    Ty_XSETREF(tstate->async_gen_finalizer, Ty_XNewRef(finalizer));
    return 0;
}

TyObject *
_TyEval_GetAsyncGenFinalizer(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return tstate->async_gen_finalizer;
}

_PyInterpreterFrame *
_TyEval_GetFrame(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyThreadState_GetFrame(tstate);
}

PyFrameObject *
TyEval_GetFrame(void)
{
    _PyInterpreterFrame *frame = _TyEval_GetFrame();
    if (frame == NULL) {
        return NULL;
    }
    PyFrameObject *f = _TyFrame_GetFrameObject(frame);
    if (f == NULL) {
        TyErr_Clear();
    }
    return f;
}

TyObject *
_TyEval_GetBuiltins(TyThreadState *tstate)
{
    _PyInterpreterFrame *frame = _TyThreadState_GetFrame(tstate);
    if (frame != NULL) {
        return frame->f_builtins;
    }
    return tstate->interp->builtins;
}

TyObject *
TyEval_GetBuiltins(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyEval_GetBuiltins(tstate);
}

/* Convenience function to get a builtin from its name */
TyObject *
_TyEval_GetBuiltin(TyObject *name)
{
    TyObject *attr;
    if (PyMapping_GetOptionalItem(TyEval_GetBuiltins(), name, &attr) == 0) {
        TyErr_SetObject(TyExc_AttributeError, name);
    }
    return attr;
}

TyObject *
_TyEval_GetBuiltinId(_Ty_Identifier *name)
{
    return _TyEval_GetBuiltin(_TyUnicode_FromId(name));
}

TyObject *
TyEval_GetLocals(void)
{
    // We need to return a borrowed reference here, so some tricks are needed
    TyThreadState *tstate = _TyThreadState_GET();
     _PyInterpreterFrame *current_frame = _TyThreadState_GetFrame(tstate);
    if (current_frame == NULL) {
        _TyErr_SetString(tstate, TyExc_SystemError, "frame does not exist");
        return NULL;
    }

    // Be aware that this returns a new reference
    TyObject *locals = _TyFrame_GetLocals(current_frame);

    if (locals == NULL) {
        return NULL;
    }

    if (PyFrameLocalsProxy_Check(locals)) {
        PyFrameObject *f = _TyFrame_GetFrameObject(current_frame);
        TyObject *ret = f->f_locals_cache;
        if (ret == NULL) {
            ret = TyDict_New();
            if (ret == NULL) {
                Ty_DECREF(locals);
                return NULL;
            }
            f->f_locals_cache = ret;
        }
        if (TyDict_Update(ret, locals) < 0) {
            // At this point, if the cache dict is broken, it will stay broken, as
            // trying to clean it up or replace it will just cause other problems
            ret = NULL;
        }
        Ty_DECREF(locals);
        return ret;
    }

    assert(PyMapping_Check(locals));
    assert(Ty_REFCNT(locals) > 1);
    Ty_DECREF(locals);

    return locals;
}

TyObject *
_TyEval_GetFrameLocals(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
     _PyInterpreterFrame *current_frame = _TyThreadState_GetFrame(tstate);
    if (current_frame == NULL) {
        _TyErr_SetString(tstate, TyExc_SystemError, "frame does not exist");
        return NULL;
    }

    TyObject *locals = _TyFrame_GetLocals(current_frame);
    if (locals == NULL) {
        return NULL;
    }

    if (PyFrameLocalsProxy_Check(locals)) {
        TyObject* ret = TyDict_New();
        if (ret == NULL) {
            Ty_DECREF(locals);
            return NULL;
        }
        if (TyDict_Update(ret, locals) < 0) {
            Ty_DECREF(ret);
            Ty_DECREF(locals);
            return NULL;
        }
        Ty_DECREF(locals);
        return ret;
    }

    assert(PyMapping_Check(locals));
    return locals;
}

static TyObject *
_TyEval_GetGlobals(TyThreadState *tstate)
{
    _PyInterpreterFrame *current_frame = _TyThreadState_GetFrame(tstate);
    if (current_frame == NULL) {
        return NULL;
    }
    return current_frame->f_globals;
}

TyObject *
TyEval_GetGlobals(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyEval_GetGlobals(tstate);
}

TyObject *
_TyEval_GetGlobalsFromRunningMain(TyThreadState *tstate)
{
    if (!_TyInterpreterState_IsRunningMain(tstate->interp)) {
        return NULL;
    }
    TyObject *mod = _Ty_GetMainModule(tstate);
    if (_Ty_CheckMainModule(mod) < 0) {
        Ty_XDECREF(mod);
        return NULL;
    }
    TyObject *globals = TyModule_GetDict(mod);  // borrowed
    Ty_DECREF(mod);
    return globals;
}

static TyObject *
get_globals_builtins(TyObject *globals)
{
    TyObject *builtins = NULL;
    if (TyDict_Check(globals)) {
        if (TyDict_GetItemRef(globals, &_Ty_ID(__builtins__), &builtins) < 0) {
            return NULL;
        }
    }
    else {
        if (PyMapping_GetOptionalItem(
                        globals, &_Ty_ID(__builtins__), &builtins) < 0)
        {
            return NULL;
        }
    }
    return builtins;
}

static int
set_globals_builtins(TyObject *globals, TyObject *builtins)
{
    if (TyDict_Check(globals)) {
        if (TyDict_SetItem(globals, &_Ty_ID(__builtins__), builtins) < 0) {
            return -1;
        }
    }
    else {
        if (PyObject_SetItem(globals, &_Ty_ID(__builtins__), builtins) < 0) {
            return -1;
        }
    }
    return 0;
}

int
_TyEval_EnsureBuiltins(TyThreadState *tstate, TyObject *globals,
                       TyObject **p_builtins)
{
    TyObject *builtins = get_globals_builtins(globals);
    if (builtins == NULL) {
        if (_TyErr_Occurred(tstate)) {
            return -1;
        }
        builtins = TyEval_GetBuiltins();  // borrowed
        if (builtins == NULL) {
            assert(_TyErr_Occurred(tstate));
            return -1;
        }
        Ty_INCREF(builtins);
        if (set_globals_builtins(globals, builtins) < 0) {
            Ty_DECREF(builtins);
            return -1;
        }
    }
    if (p_builtins != NULL) {
        *p_builtins = builtins;
    }
    else {
        Ty_DECREF(builtins);
    }
    return 0;
}

int
_TyEval_EnsureBuiltinsWithModule(TyThreadState *tstate, TyObject *globals,
                                 TyObject **p_builtins)
{
    TyObject *builtins = get_globals_builtins(globals);
    if (builtins == NULL) {
        if (_TyErr_Occurred(tstate)) {
            return -1;
        }
        builtins = TyImport_ImportModuleLevel("builtins", NULL, NULL, NULL, 0);
        if (builtins == NULL) {
            return -1;
        }
        if (set_globals_builtins(globals, builtins) < 0) {
            Ty_DECREF(builtins);
            return -1;
        }
    }
    if (p_builtins != NULL) {
        *p_builtins = builtins;
    }
    else {
        Ty_DECREF(builtins);
    }
    return 0;
}

TyObject*
TyEval_GetFrameLocals(void)
{
    return _TyEval_GetFrameLocals();
}

TyObject* TyEval_GetFrameGlobals(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyInterpreterFrame *current_frame = _TyThreadState_GetFrame(tstate);
    if (current_frame == NULL) {
        return NULL;
    }
    return Ty_XNewRef(current_frame->f_globals);
}

TyObject* TyEval_GetFrameBuiltins(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return Ty_XNewRef(_TyEval_GetBuiltins(tstate));
}

int
TyEval_MergeCompilerFlags(PyCompilerFlags *cf)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _PyInterpreterFrame *current_frame = tstate->current_frame;
    int result = cf->cf_flags != 0;

    if (current_frame != NULL) {
        const int codeflags = _TyFrame_GetCode(current_frame)->co_flags;
        const int compilerflags = codeflags & PyCF_MASK;
        if (compilerflags) {
            result = 1;
            cf->cf_flags |= compilerflags;
        }
    }
    return result;
}


const char *
TyEval_GetFuncName(TyObject *func)
{
    if (TyMethod_Check(func))
        return TyEval_GetFuncName(TyMethod_GET_FUNCTION(func));
    else if (TyFunction_Check(func))
        return TyUnicode_AsUTF8(((PyFunctionObject*)func)->func_name);
    else if (PyCFunction_Check(func))
        return ((PyCFunctionObject*)func)->m_ml->ml_name;
    else
        return Ty_TYPE(func)->tp_name;
}

const char *
TyEval_GetFuncDesc(TyObject *func)
{
    if (TyMethod_Check(func))
        return "()";
    else if (TyFunction_Check(func))
        return "()";
    else if (PyCFunction_Check(func))
        return "()";
    else
        return " object";
}

/* Extract a slice index from a PyLong or an object with the
   nb_index slot defined, and store in *pi.
   Silently reduce values larger than PY_SSIZE_T_MAX to PY_SSIZE_T_MAX,
   and silently boost values less than PY_SSIZE_T_MIN to PY_SSIZE_T_MIN.
   Return 0 on error, 1 on success.
*/
int
_TyEval_SliceIndex(TyObject *v, Ty_ssize_t *pi)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (!Ty_IsNone(v)) {
        Ty_ssize_t x;
        if (_PyIndex_Check(v)) {
            x = PyNumber_AsSsize_t(v, NULL);
            if (x == -1 && _TyErr_Occurred(tstate))
                return 0;
        }
        else {
            _TyErr_SetString(tstate, TyExc_TypeError,
                             "slice indices must be integers or "
                             "None or have an __index__ method");
            return 0;
        }
        *pi = x;
    }
    return 1;
}

int
_TyEval_SliceIndexNotNone(TyObject *v, Ty_ssize_t *pi)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t x;
    if (_PyIndex_Check(v)) {
        x = PyNumber_AsSsize_t(v, NULL);
        if (x == -1 && _TyErr_Occurred(tstate))
            return 0;
    }
    else {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "slice indices must be integers or "
                         "have an __index__ method");
        return 0;
    }
    *pi = x;
    return 1;
}

TyObject *
_TyEval_ImportName(TyThreadState *tstate, _PyInterpreterFrame *frame,
            TyObject *name, TyObject *fromlist, TyObject *level)
{
    TyObject *import_func;
    if (PyMapping_GetOptionalItem(frame->f_builtins, &_Ty_ID(__import__), &import_func) < 0) {
        return NULL;
    }
    if (import_func == NULL) {
        _TyErr_SetString(tstate, TyExc_ImportError, "__import__ not found");
        return NULL;
    }

    TyObject *locals = frame->f_locals;
    if (locals == NULL) {
        locals = Ty_None;
    }

    /* Fast path for not overloaded __import__. */
    if (_TyImport_IsDefaultImportFunc(tstate->interp, import_func)) {
        Ty_DECREF(import_func);
        int ilevel = TyLong_AsInt(level);
        if (ilevel == -1 && _TyErr_Occurred(tstate)) {
            return NULL;
        }
        return TyImport_ImportModuleLevelObject(
                        name,
                        frame->f_globals,
                        locals,
                        fromlist,
                        ilevel);
    }

    TyObject* args[5] = {name, frame->f_globals, locals, fromlist, level};
    TyObject *res = PyObject_Vectorcall(import_func, args, 5, NULL);
    Ty_DECREF(import_func);
    return res;
}

TyObject *
_TyEval_ImportFrom(TyThreadState *tstate, TyObject *v, TyObject *name)
{
    TyObject *x;
    TyObject *fullmodname, *mod_name, *origin, *mod_name_or_unknown, *errmsg, *spec;

    if (PyObject_GetOptionalAttr(v, name, &x) != 0) {
        return x;
    }
    /* Issue #17636: in case this failed because of a circular relative
       import, try to fallback on reading the module directly from
       sys.modules. */
    if (PyObject_GetOptionalAttr(v, &_Ty_ID(__name__), &mod_name) < 0) {
        return NULL;
    }
    if (mod_name == NULL || !TyUnicode_Check(mod_name)) {
        Ty_CLEAR(mod_name);
        goto error;
    }
    fullmodname = TyUnicode_FromFormat("%U.%U", mod_name, name);
    if (fullmodname == NULL) {
        Ty_DECREF(mod_name);
        return NULL;
    }
    x = TyImport_GetModule(fullmodname);
    Ty_DECREF(fullmodname);
    if (x == NULL && !_TyErr_Occurred(tstate)) {
        goto error;
    }
    Ty_DECREF(mod_name);
    return x;

 error:
    if (mod_name == NULL) {
        mod_name_or_unknown = TyUnicode_FromString("<unknown module name>");
        if (mod_name_or_unknown == NULL) {
            return NULL;
        }
    } else {
        mod_name_or_unknown = mod_name;
    }
    // mod_name is no longer an owned reference
    assert(mod_name_or_unknown);
    assert(mod_name == NULL || mod_name == mod_name_or_unknown);

    origin = NULL;
    if (PyObject_GetOptionalAttr(v, &_Ty_ID(__spec__), &spec) < 0) {
        Ty_DECREF(mod_name_or_unknown);
        return NULL;
    }
    if (spec == NULL) {
        errmsg = TyUnicode_FromFormat(
            "cannot import name %R from %R (unknown location)",
            name, mod_name_or_unknown
        );
        goto done_with_errmsg;
    }
    if (_PyModuleSpec_GetFileOrigin(spec, &origin) < 0) {
        goto done;
    }

    int is_possibly_shadowing = _TyModule_IsPossiblyShadowing(origin);
    if (is_possibly_shadowing < 0) {
        goto done;
    }
    int is_possibly_shadowing_stdlib = 0;
    if (is_possibly_shadowing) {
        TyObject *stdlib_modules;
        if (_TySys_GetOptionalAttrString("stdlib_module_names", &stdlib_modules) < 0) {
            goto done;
        }
        if (stdlib_modules && PyAnySet_Check(stdlib_modules)) {
            is_possibly_shadowing_stdlib = TySet_Contains(stdlib_modules, mod_name_or_unknown);
            if (is_possibly_shadowing_stdlib < 0) {
                Ty_DECREF(stdlib_modules);
                goto done;
            }
        }
        Ty_XDECREF(stdlib_modules);
    }

    if (origin == NULL && TyModule_Check(v)) {
        // Fall back to __file__ for diagnostics if we don't have
        // an origin that is a location
        origin = TyModule_GetFilenameObject(v);
        if (origin == NULL) {
            if (!TyErr_ExceptionMatches(TyExc_SystemError)) {
                goto done;
            }
            // TyModule_GetFilenameObject raised "module filename missing"
            _TyErr_Clear(tstate);
        }
        assert(origin == NULL || TyUnicode_Check(origin));
    }

    if (is_possibly_shadowing_stdlib) {
        assert(origin);
        errmsg = TyUnicode_FromFormat(
            "cannot import name %R from %R "
            "(consider renaming %R since it has the same "
            "name as the standard library module named %R "
            "and prevents importing that standard library module)",
            name, mod_name_or_unknown, origin, mod_name_or_unknown
        );
    }
    else {
        int rc = _PyModuleSpec_IsInitializing(spec);
        if (rc < 0) {
            goto done;
        }
        else if (rc > 0) {
            if (is_possibly_shadowing) {
                assert(origin);
                // For non-stdlib modules, only mention the possibility of
                // shadowing if the module is being initialized.
                errmsg = TyUnicode_FromFormat(
                    "cannot import name %R from %R "
                    "(consider renaming %R if it has the same name "
                    "as a library you intended to import)",
                    name, mod_name_or_unknown, origin
                );
            }
            else if (origin) {
                errmsg = TyUnicode_FromFormat(
                    "cannot import name %R from partially initialized module %R "
                    "(most likely due to a circular import) (%S)",
                    name, mod_name_or_unknown, origin
                );
            }
            else {
                errmsg = TyUnicode_FromFormat(
                    "cannot import name %R from partially initialized module %R "
                    "(most likely due to a circular import)",
                    name, mod_name_or_unknown
                );
            }
        }
        else {
            assert(rc == 0);
            if (origin) {
                errmsg = TyUnicode_FromFormat(
                    "cannot import name %R from %R (%S)",
                    name, mod_name_or_unknown, origin
                );
            }
            else {
                errmsg = TyUnicode_FromFormat(
                    "cannot import name %R from %R (unknown location)",
                    name, mod_name_or_unknown
                );
            }
        }
    }

done_with_errmsg:
    if (errmsg != NULL) {
        /* NULL checks for mod_name and origin done by _TyErr_SetImportErrorWithNameFrom */
        _TyErr_SetImportErrorWithNameFrom(errmsg, mod_name, origin, name);
        Ty_DECREF(errmsg);
    }

done:
    Ty_XDECREF(origin);
    Ty_XDECREF(spec);
    Ty_DECREF(mod_name_or_unknown);
    return NULL;
}

#define CANNOT_CATCH_MSG "catching classes that do not inherit from "\
                         "BaseException is not allowed"

#define CANNOT_EXCEPT_STAR_EG "catching ExceptionGroup with except* "\
                              "is not allowed. Use except instead."

int
_TyEval_CheckExceptTypeValid(TyThreadState *tstate, TyObject* right)
{
    if (TyTuple_Check(right)) {
        Ty_ssize_t i, length;
        length = TyTuple_GET_SIZE(right);
        for (i = 0; i < length; i++) {
            TyObject *exc = TyTuple_GET_ITEM(right, i);
            if (!PyExceptionClass_Check(exc)) {
                _TyErr_SetString(tstate, TyExc_TypeError,
                    CANNOT_CATCH_MSG);
                return -1;
            }
        }
    }
    else {
        if (!PyExceptionClass_Check(right)) {
            _TyErr_SetString(tstate, TyExc_TypeError,
                CANNOT_CATCH_MSG);
            return -1;
        }
    }
    return 0;
}

int
_TyEval_CheckExceptStarTypeValid(TyThreadState *tstate, TyObject* right)
{
    if (_TyEval_CheckExceptTypeValid(tstate, right) < 0) {
        return -1;
    }

    /* reject except *ExceptionGroup */

    int is_subclass = 0;
    if (TyTuple_Check(right)) {
        Ty_ssize_t length = TyTuple_GET_SIZE(right);
        for (Ty_ssize_t i = 0; i < length; i++) {
            TyObject *exc = TyTuple_GET_ITEM(right, i);
            is_subclass = PyObject_IsSubclass(exc, TyExc_BaseExceptionGroup);
            if (is_subclass < 0) {
                return -1;
            }
            if (is_subclass) {
                break;
            }
        }
    }
    else {
        is_subclass = PyObject_IsSubclass(right, TyExc_BaseExceptionGroup);
        if (is_subclass < 0) {
            return -1;
        }
    }
    if (is_subclass) {
        _TyErr_SetString(tstate, TyExc_TypeError,
            CANNOT_EXCEPT_STAR_EG);
            return -1;
    }
    return 0;
}

int
_Ty_Check_ArgsIterable(TyThreadState *tstate, TyObject *func, TyObject *args)
{
    if (Ty_TYPE(args)->tp_iter == NULL && !PySequence_Check(args)) {
        /* _Ty_Check_ArgsIterable() may be called with a live exception:
         * clear it to prevent calling _TyObject_FunctionStr() with an
         * exception set. */
        _TyErr_Clear(tstate);
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "%U argument after * must be an iterable, not %.200s",
                          funcstr, Ty_TYPE(args)->tp_name);
            Ty_DECREF(funcstr);
        }
        return -1;
    }
    return 0;
}

void
_TyEval_FormatKwargsError(TyThreadState *tstate, TyObject *func, TyObject *kwargs)
{
    /* _TyDict_MergeEx raises attribute
     * error (percolated from an attempt
     * to get 'keys' attribute) instead of
     * a type error if its second argument
     * is not a mapping.
     */
    if (_TyErr_ExceptionMatches(tstate, TyExc_AttributeError)) {
        _TyErr_Clear(tstate);
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            _TyErr_Format(
                tstate, TyExc_TypeError,
                "%U argument after ** must be a mapping, not %.200s",
                funcstr, Ty_TYPE(kwargs)->tp_name);
            Ty_DECREF(funcstr);
        }
    }
    else if (_TyErr_ExceptionMatches(tstate, TyExc_KeyError)) {
        TyObject *exc = _TyErr_GetRaisedException(tstate);
        TyObject *args = PyException_GetArgs(exc);
        if (exc && TyTuple_Check(args) && TyTuple_GET_SIZE(args) == 1) {
            _TyErr_Clear(tstate);
            TyObject *funcstr = _TyObject_FunctionStr(func);
            if (funcstr != NULL) {
                TyObject *key = TyTuple_GET_ITEM(args, 0);
                _TyErr_Format(
                    tstate, TyExc_TypeError,
                    "%U got multiple values for keyword argument '%S'",
                    funcstr, key);
                Ty_DECREF(funcstr);
            }
            Ty_XDECREF(exc);
        }
        else {
            _TyErr_SetRaisedException(tstate, exc);
        }
        Ty_DECREF(args);
    }
}

void
_TyEval_FormatExcCheckArg(TyThreadState *tstate, TyObject *exc,
                          const char *format_str, TyObject *obj)
{
    const char *obj_str;

    if (!obj)
        return;

    obj_str = TyUnicode_AsUTF8(obj);
    if (!obj_str)
        return;

    _TyErr_Format(tstate, exc, format_str, obj_str);

    if (exc == TyExc_NameError) {
        // Include the name in the NameError exceptions to offer suggestions later.
        TyObject *exc = TyErr_GetRaisedException();
        if (TyErr_GivenExceptionMatches(exc, TyExc_NameError)) {
            if (((TyNameErrorObject*)exc)->name == NULL) {
                // We do not care if this fails because we are going to restore the
                // NameError anyway.
                (void)PyObject_SetAttr(exc, &_Ty_ID(name), obj);
            }
        }
        TyErr_SetRaisedException(exc);
    }
}

void
_TyEval_FormatExcUnbound(TyThreadState *tstate, PyCodeObject *co, int oparg)
{
    TyObject *name;
    /* Don't stomp existing exception */
    if (_TyErr_Occurred(tstate))
        return;
    name = TyTuple_GET_ITEM(co->co_localsplusnames, oparg);
    if (oparg < PyUnstable_Code_GetFirstFree(co)) {
        _TyEval_FormatExcCheckArg(tstate, TyExc_UnboundLocalError,
                                  UNBOUNDLOCAL_ERROR_MSG, name);
    } else {
        _TyEval_FormatExcCheckArg(tstate, TyExc_NameError,
                                  UNBOUNDFREE_ERROR_MSG, name);
    }
}

void
_TyEval_FormatAwaitableError(TyThreadState *tstate, TyTypeObject *type, int oparg)
{
    if (type->tp_as_async == NULL || type->tp_as_async->am_await == NULL) {
        if (oparg == 1) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "'async with' received an object from __aenter__ "
                          "that does not implement __await__: %.100s",
                          type->tp_name);
        }
        else if (oparg == 2) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "'async with' received an object from __aexit__ "
                          "that does not implement __await__: %.100s",
                          type->tp_name);
        }
    }
}


Ty_ssize_t
PyUnstable_Eval_RequestCodeExtraIndex(freefunc free)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    Ty_ssize_t new_index;

    if (interp->co_extra_user_count == MAX_CO_EXTRA_USERS - 1) {
        return -1;
    }
    new_index = interp->co_extra_user_count++;
    interp->co_extra_freefuncs[new_index] = free;
    return new_index;
}

/* Implement Ty_EnterRecursiveCall() and Ty_LeaveRecursiveCall() as functions
   for the limited API. */

int Ty_EnterRecursiveCall(const char *where)
{
    return _Ty_EnterRecursiveCall(where);
}

void Ty_LeaveRecursiveCall(void)
{
    _Ty_LeaveRecursiveCall();
}

TyObject *
_TyEval_GetANext(TyObject *aiter)
{
    unaryfunc getter = NULL;
    TyObject *next_iter = NULL;
    TyTypeObject *type = Ty_TYPE(aiter);
    if (PyAsyncGen_CheckExact(aiter)) {
        return type->tp_as_async->am_anext(aiter);
    }
    if (type->tp_as_async != NULL){
        getter = type->tp_as_async->am_anext;
    }

    if (getter != NULL) {
        next_iter = (*getter)(aiter);
        if (next_iter == NULL) {
            return NULL;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                        "'async for' requires an iterator with "
                        "__anext__ method, got %.100s",
                        type->tp_name);
        return NULL;
    }

    TyObject *awaitable = _PyCoro_GetAwaitableIter(next_iter);
    if (awaitable == NULL) {
        _TyErr_FormatFromCause(
            TyExc_TypeError,
            "'async for' received an invalid object "
            "from __anext__: %.100s",
            Ty_TYPE(next_iter)->tp_name);
    }
    Ty_DECREF(next_iter);
    return awaitable;
}

void
_TyEval_LoadGlobalStackRef(TyObject *globals, TyObject *builtins, TyObject *name, _PyStackRef *writeto)
{
    if (TyDict_CheckExact(globals) && TyDict_CheckExact(builtins)) {
        _TyDict_LoadGlobalStackRef((PyDictObject *)globals,
                                    (PyDictObject *)builtins,
                                    name, writeto);
        if (PyStackRef_IsNull(*writeto) && !TyErr_Occurred()) {
            /* _TyDict_LoadGlobal() returns NULL without raising
                * an exception if the key doesn't exist */
            _TyEval_FormatExcCheckArg(TyThreadState_GET(), TyExc_NameError,
                                        NAME_ERROR_MSG, name);
        }
    }
    else {
        /* Slow-path if globals or builtins is not a dict */
        /* namespace 1: globals */
        TyObject *res;
        if (PyMapping_GetOptionalItem(globals, name, &res) < 0) {
            *writeto = PyStackRef_NULL;
            return;
        }
        if (res == NULL) {
            /* namespace 2: builtins */
            if (PyMapping_GetOptionalItem(builtins, name, &res) < 0) {
                *writeto = PyStackRef_NULL;
                return;
            }
            if (res == NULL) {
                _TyEval_FormatExcCheckArg(
                            TyThreadState_GET(), TyExc_NameError,
                            NAME_ERROR_MSG, name);
                *writeto = PyStackRef_NULL;
                return;
            }
        }
        *writeto = PyStackRef_FromPyObjectSteal(res);
    }
}

TyObject *
_TyEval_GetAwaitable(TyObject *iterable, int oparg)
{
    TyObject *iter = _PyCoro_GetAwaitableIter(iterable);

    if (iter == NULL) {
        _TyEval_FormatAwaitableError(TyThreadState_GET(),
            Ty_TYPE(iterable), oparg);
    }
    else if (TyCoro_CheckExact(iter)) {
        TyObject *yf = _TyGen_yf((PyGenObject*)iter);
        if (yf != NULL) {
            /* `iter` is a coroutine object that is being
                awaited, `yf` is a pointer to the current awaitable
                being awaited on. */
            Ty_DECREF(yf);
            Ty_CLEAR(iter);
            _TyErr_SetString(TyThreadState_GET(), TyExc_RuntimeError,
                                "coroutine is being awaited already");
        }
    }
    return iter;
}

TyObject *
_TyEval_LoadName(TyThreadState *tstate, _PyInterpreterFrame *frame, TyObject *name)
{

    TyObject *value;
    if (frame->f_locals == NULL) {
        _TyErr_SetString(tstate, TyExc_SystemError,
                            "no locals found");
        return NULL;
    }
    if (PyMapping_GetOptionalItem(frame->f_locals, name, &value) < 0) {
        return NULL;
    }
    if (value != NULL) {
        return value;
    }
    if (TyDict_GetItemRef(frame->f_globals, name, &value) < 0) {
        return NULL;
    }
    if (value != NULL) {
        return value;
    }
    if (PyMapping_GetOptionalItem(frame->f_builtins, name, &value) < 0) {
        return NULL;
    }
    if (value == NULL) {
        _TyEval_FormatExcCheckArg(
                    tstate, TyExc_NameError,
                    NAME_ERROR_MSG, name);
    }
    return value;
}

/* Check if a 'cls' provides the given special method. */
static inline int
type_has_special_method(TyTypeObject *cls, TyObject *name)
{
    // _TyType_Lookup() does not set an exception and returns a borrowed ref
    assert(!TyErr_Occurred());
    TyObject *r = _TyType_Lookup(cls, name);
    return r != NULL && Ty_TYPE(r)->tp_descr_get != NULL;
}

int
_TyEval_SpecialMethodCanSuggest(TyObject *self, int oparg)
{
    TyTypeObject *type = Ty_TYPE(self);
    switch (oparg) {
        case SPECIAL___ENTER__:
        case SPECIAL___EXIT__: {
            return type_has_special_method(type, &_Ty_ID(__aenter__))
                   && type_has_special_method(type, &_Ty_ID(__aexit__));
        }
        case SPECIAL___AENTER__:
        case SPECIAL___AEXIT__: {
            return type_has_special_method(type, &_Ty_ID(__enter__))
                   && type_has_special_method(type, &_Ty_ID(__exit__));
        }
        default:
            Ty_FatalError("unsupported special method");
    }
}
