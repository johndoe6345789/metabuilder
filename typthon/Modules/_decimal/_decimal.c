/*
 * Copyright (c) 2008-2012 Stefan Krah. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include <Python.h>
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_typeobject.h"
#include "complexobject.h"

#include <mpdecimal.h>

// Reuse config from mpdecimal.h if present.
#if defined(MPD_CONFIG_64)
  #ifndef CONFIG_64
    #define CONFIG_64 MPD_CONFIG_64
  #endif
#elif defined(MPD_CONFIG_32)
  #ifndef CONFIG_32
    #define CONFIG_32 MPD_CONFIG_32
  #endif
#endif

#include <ctype.h>                // isascii()
#include <stdlib.h>

#include "docstrings.h"

#ifdef EXTRA_FUNCTIONALITY
  #define _PY_DEC_ROUND_GUARD MPD_ROUND_GUARD
#else
  #define _PY_DEC_ROUND_GUARD (MPD_ROUND_GUARD-1)
#endif

struct PyDecContextObject;
struct DecCondMap;

typedef struct {
    TyTypeObject *PyDecContextManager_Type;
    TyTypeObject *PyDecContext_Type;
    TyTypeObject *PyDecSignalDictMixin_Type;
    TyTypeObject *PyDec_Type;
    TyTypeObject *PyDecSignalDict_Type;
    TyTypeObject *DecimalTuple;

    /* Top level Exception; inherits from ArithmeticError */
    TyObject *DecimalException;

#ifndef WITH_DECIMAL_CONTEXTVAR
    /* Key for thread state dictionary */
    TyObject *tls_context_key;
    /* Invariant: NULL or a strong reference to the most recently accessed
       thread local context. */
    struct PyDecContextObject *cached_context;  /* Not borrowed */
#else
    TyObject *current_context_var;
#endif

    /* Template for creating new thread contexts, calling Context() without
     * arguments and initializing the module_context on first access. */
    TyObject *default_context_template;

    /* Basic and extended context templates */
    TyObject *basic_context_template;
    TyObject *extended_context_template;

    TyObject *round_map[_PY_DEC_ROUND_GUARD];

    /* Convert rationals for comparison */
    TyObject *Rational;

    /* Invariant: NULL or pointer to _pydecimal.Decimal */
    TyObject *PyDecimal;

    TyObject *SignalTuple;

    struct DecCondMap *signal_map;
    struct DecCondMap *cond_map;

    /* External C-API functions */
    binaryfunc _py_long_multiply;
    binaryfunc _py_long_floor_divide;
    ternaryfunc _py_long_power;
    unaryfunc _py_float_abs;
    PyCFunction _py_long_bit_length;
    PyCFunction _py_float_as_integer_ratio;
} decimal_state;

static inline decimal_state *
get_module_state(TyObject *mod)
{
    decimal_state *state = _TyModule_GetState(mod);
    assert(state != NULL);
    return state;
}

static struct TyModuleDef _decimal_module;
static TyType_Spec dec_spec;
static TyType_Spec context_spec;

static inline decimal_state *
get_module_state_by_def(TyTypeObject *tp)
{
    TyObject *mod = TyType_GetModuleByDef(tp, &_decimal_module);
    assert(mod != NULL);
    return get_module_state(mod);
}

static inline decimal_state *
find_state_left_or_right(TyObject *left, TyObject *right)
{
    TyTypeObject *base;
    if (TyType_GetBaseByToken(Ty_TYPE(left), &dec_spec, &base) != 1) {
        assert(!TyErr_Occurred());
        TyType_GetBaseByToken(Ty_TYPE(right), &dec_spec, &base);
    }
    assert(base != NULL);
    void *state = _TyType_GetModuleState(base);
    assert(state != NULL);
    Ty_DECREF(base);
    return (decimal_state *)state;
}

static inline decimal_state *
find_state_ternary(TyObject *left, TyObject *right, TyObject *modulus)
{
    TyTypeObject *base;
    if (TyType_GetBaseByToken(Ty_TYPE(left), &dec_spec, &base) != 1) {
        assert(!TyErr_Occurred());
        if (TyType_GetBaseByToken(Ty_TYPE(right), &dec_spec, &base) != 1) {
            assert(!TyErr_Occurred());
            TyType_GetBaseByToken(Ty_TYPE(modulus), &dec_spec, &base);
        }
    }
    assert(base != NULL);
    void *state = _TyType_GetModuleState(base);
    assert(state != NULL);
    Ty_DECREF(base);
    return (decimal_state *)state;
}


#if !defined(MPD_VERSION_HEX) || MPD_VERSION_HEX < 0x02050000
  #error "libmpdec version >= 2.5.0 required"
#endif


/*
 * Type sizes with assertions in mpdecimal.h and pyport.h:
 *    sizeof(size_t) == sizeof(Ty_ssize_t)
 *    sizeof(size_t) == sizeof(mpd_uint_t) == sizeof(mpd_ssize_t)
 */

#ifdef TEST_COVERAGE
  #undef Ty_LOCAL_INLINE
  #define Ty_LOCAL_INLINE Ty_LOCAL
#endif

#define MPD_Float_operation MPD_Not_implemented

#define BOUNDS_CHECK(x, MIN, MAX) x = (x < MIN || MAX < x) ? MAX : x

/* _Ty_DEC_MINALLOC >= MPD_MINALLOC */
#define _Ty_DEC_MINALLOC 4

typedef struct {
    PyObject_HEAD
    Ty_hash_t hash;
    mpd_t dec;
    mpd_uint_t data[_Ty_DEC_MINALLOC];
} PyDecObject;

#define _PyDecObject_CAST(op)   ((PyDecObject *)(op))

typedef struct {
    PyObject_HEAD
    uint32_t *flags;
} PyDecSignalDictObject;

#define _PyDecSignalDictObject_CAST(op) ((PyDecSignalDictObject *)(op))

typedef struct PyDecContextObject {
    PyObject_HEAD
    mpd_context_t ctx;
    TyObject *traps;
    TyObject *flags;
    int capitals;
    TyThreadState *tstate;
    decimal_state *modstate;
} PyDecContextObject;

#define _PyDecContextObject_CAST(op)    ((PyDecContextObject *)(op))

typedef struct {
    PyObject_HEAD
    TyObject *local;
    TyObject *global;
} PyDecContextManagerObject;

#define _PyDecContextManagerObject_CAST(op) ((PyDecContextManagerObject *)(op))

#undef MPD
#undef CTX
#define PyDec_CheckExact(st, v) Ty_IS_TYPE(v, (st)->PyDec_Type)
#define PyDec_Check(st, v) PyObject_TypeCheck(v, (st)->PyDec_Type)
#define PyDecSignalDict_Check(st, v) Ty_IS_TYPE(v, (st)->PyDecSignalDict_Type)
#define PyDecContext_Check(st, v) PyObject_TypeCheck(v, (st)->PyDecContext_Type)
#define MPD(v) (&_PyDecObject_CAST(v)->dec)
#define SdFlagAddr(v) (_PyDecSignalDictObject_CAST(v)->flags)
#define SdFlags(v) (*_PyDecSignalDictObject_CAST(v)->flags)
#define CTX(v) (&_PyDecContextObject_CAST(v)->ctx)
#define CtxCaps(v) (_PyDecContextObject_CAST(v)->capitals)

static inline decimal_state *
get_module_state_from_ctx(TyObject *v)
{
    assert(TyType_GetBaseByToken(Ty_TYPE(v), &context_spec, NULL) == 1);
    decimal_state *state = ((PyDecContextObject *)v)->modstate;
    assert(state != NULL);
    return state;
}


Ty_LOCAL_INLINE(TyObject *)
incr_true(void)
{
    return Ty_NewRef(Ty_True);
}

Ty_LOCAL_INLINE(TyObject *)
incr_false(void)
{
    return Ty_NewRef(Ty_False);
}

/* Error codes for functions that return signals or conditions */
#define DEC_INVALID_SIGNALS (MPD_Max_status+1U)
#define DEC_ERR_OCCURRED (DEC_INVALID_SIGNALS<<1)
#define DEC_ERRORS (DEC_INVALID_SIGNALS|DEC_ERR_OCCURRED)

typedef struct DecCondMap {
    const char *name;   /* condition or signal name */
    const char *fqname; /* fully qualified name */
    uint32_t flag;      /* libmpdec flag */
    TyObject *ex;       /* corresponding exception */
} DecCondMap;

/* Exceptions that correspond to IEEE signals */
#define SUBNORMAL 5
#define INEXACT 6
#define ROUNDED 7
#define SIGNAL_MAP_LEN 9
static DecCondMap signal_map_template[] = {
  {"InvalidOperation", "decimal.InvalidOperation", MPD_IEEE_Invalid_operation, NULL},
  {"FloatOperation", "decimal.FloatOperation", MPD_Float_operation, NULL},
  {"DivisionByZero", "decimal.DivisionByZero", MPD_Division_by_zero, NULL},
  {"Overflow", "decimal.Overflow", MPD_Overflow, NULL},
  {"Underflow", "decimal.Underflow", MPD_Underflow, NULL},
  {"Subnormal", "decimal.Subnormal", MPD_Subnormal, NULL},
  {"Inexact", "decimal.Inexact", MPD_Inexact, NULL},
  {"Rounded", "decimal.Rounded", MPD_Rounded, NULL},
  {"Clamped", "decimal.Clamped", MPD_Clamped, NULL},
  {NULL}
};

/* Exceptions that inherit from InvalidOperation */
static DecCondMap cond_map_template[] = {
  {"InvalidOperation", "decimal.InvalidOperation", MPD_Invalid_operation, NULL},
  {"ConversionSyntax", "decimal.ConversionSyntax", MPD_Conversion_syntax, NULL},
  {"DivisionImpossible", "decimal.DivisionImpossible", MPD_Division_impossible, NULL},
  {"DivisionUndefined", "decimal.DivisionUndefined", MPD_Division_undefined, NULL},
  {"InvalidContext", "decimal.InvalidContext", MPD_Invalid_context, NULL},
#ifdef EXTRA_FUNCTIONALITY
  {"MallocError", "decimal.MallocError", MPD_Malloc_error, NULL},
#endif
  {NULL}
};

/* Return a duplicate of DecCondMap template */
static inline DecCondMap *
dec_cond_map_init(DecCondMap *template, Ty_ssize_t size)
{
    DecCondMap *cm;
    cm = TyMem_Malloc(size);
    if (cm == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    memcpy(cm, template, size);
    return cm;
}

static const char *dec_signal_string[MPD_NUM_FLAGS] = {
    "Clamped",
    "InvalidOperation",
    "DivisionByZero",
    "InvalidOperation",
    "InvalidOperation",
    "InvalidOperation",
    "Inexact",
    "InvalidOperation",
    "InvalidOperation",
    "InvalidOperation",
    "FloatOperation",
    "Overflow",
    "Rounded",
    "Subnormal",
    "Underflow",
};

static const char *invalid_rounding_err =
"valid values for rounding are:\n\
  [ROUND_CEILING, ROUND_FLOOR, ROUND_UP, ROUND_DOWN,\n\
   ROUND_HALF_UP, ROUND_HALF_DOWN, ROUND_HALF_EVEN,\n\
   ROUND_05UP]";

static const char *invalid_signals_err =
"valid values for signals are:\n\
  [InvalidOperation, FloatOperation, DivisionByZero,\n\
   Overflow, Underflow, Subnormal, Inexact, Rounded,\n\
   Clamped]";

#ifdef EXTRA_FUNCTIONALITY
static const char *invalid_flags_err =
"valid values for _flags or _traps are:\n\
  signals:\n\
    [DecIEEEInvalidOperation, DecFloatOperation, DecDivisionByZero,\n\
     DecOverflow, DecUnderflow, DecSubnormal, DecInexact, DecRounded,\n\
     DecClamped]\n\
  conditions which trigger DecIEEEInvalidOperation:\n\
    [DecInvalidOperation, DecConversionSyntax, DecDivisionImpossible,\n\
     DecDivisionUndefined, DecFpuError, DecInvalidContext, DecMallocError]";
#endif

static int
value_error_int(const char *mesg)
{
    TyErr_SetString(TyExc_ValueError, mesg);
    return -1;
}

static TyObject *
value_error_ptr(const char *mesg)
{
    TyErr_SetString(TyExc_ValueError, mesg);
    return NULL;
}

static int
type_error_int(const char *mesg)
{
    TyErr_SetString(TyExc_TypeError, mesg);
    return -1;
}

static int
runtime_error_int(const char *mesg)
{
    TyErr_SetString(TyExc_RuntimeError, mesg);
    return -1;
}
#define INTERNAL_ERROR_INT(funcname) \
    return runtime_error_int("internal error in " funcname)

static TyObject *
runtime_error_ptr(const char *mesg)
{
    TyErr_SetString(TyExc_RuntimeError, mesg);
    return NULL;
}
#define INTERNAL_ERROR_PTR(funcname) \
    return runtime_error_ptr("internal error in " funcname)

static void
dec_traphandler(mpd_context_t *Py_UNUSED(ctx)) /* GCOV_NOT_REACHED */
{ /* GCOV_NOT_REACHED */
    return; /* GCOV_NOT_REACHED */
}

static TyObject *
flags_as_exception(decimal_state *state, uint32_t flags)
{
    DecCondMap *cm;

    for (cm = state->signal_map; cm->name != NULL; cm++) {
        if (flags&cm->flag) {
            return cm->ex;
        }
    }

    INTERNAL_ERROR_PTR("flags_as_exception"); /* GCOV_NOT_REACHED */
}

Ty_LOCAL_INLINE(uint32_t)
exception_as_flag(decimal_state *state, TyObject *ex)
{
    DecCondMap *cm;

    for (cm = state->signal_map; cm->name != NULL; cm++) {
        if (cm->ex == ex) {
            return cm->flag;
        }
    }

    TyErr_SetString(TyExc_KeyError, invalid_signals_err);
    return DEC_INVALID_SIGNALS;
}

static TyObject *
flags_as_list(decimal_state *state, uint32_t flags)
{
    TyObject *list;
    DecCondMap *cm;

    list = TyList_New(0);
    if (list == NULL) {
        return NULL;
    }

    for (cm = state->cond_map; cm->name != NULL; cm++) {
        if (flags&cm->flag) {
            if (TyList_Append(list, cm->ex) < 0) {
                goto error;
            }
        }
    }
    for (cm = state->signal_map+1; cm->name != NULL; cm++) {
        if (flags&cm->flag) {
            if (TyList_Append(list, cm->ex) < 0) {
                goto error;
            }
        }
    }

    return list;

error:
    Ty_DECREF(list);
    return NULL;
}

static TyObject *
signals_as_list(decimal_state *state, uint32_t flags)
{
    TyObject *list;
    DecCondMap *cm;

    list = TyList_New(0);
    if (list == NULL) {
        return NULL;
    }

    for (cm = state->signal_map; cm->name != NULL; cm++) {
        if (flags&cm->flag) {
            if (TyList_Append(list, cm->ex) < 0) {
                Ty_DECREF(list);
                return NULL;
            }
        }
    }

    return list;
}

static uint32_t
list_as_flags(decimal_state *state, TyObject *list)
{
    TyObject *item;
    uint32_t flags, x;
    Ty_ssize_t n, j;

    assert(TyList_Check(list));

    n = TyList_Size(list);
    flags = 0;
    for (j = 0; j < n; j++) {
        item = TyList_GetItem(list, j);
        x = exception_as_flag(state, item);
        if (x & DEC_ERRORS) {
            return x;
        }
        flags |= x;
    }

    return flags;
}

static TyObject *
flags_as_dict(decimal_state *state, uint32_t flags)
{
    DecCondMap *cm;
    TyObject *dict;

    dict = TyDict_New();
    if (dict == NULL) {
        return NULL;
    }

    for (cm = state->signal_map; cm->name != NULL; cm++) {
        TyObject *b = flags&cm->flag ? Ty_True : Ty_False;
        if (TyDict_SetItem(dict, cm->ex, b) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
    }

    return dict;
}

static uint32_t
dict_as_flags(decimal_state *state, TyObject *val)
{
    TyObject *b;
    DecCondMap *cm;
    uint32_t flags = 0;
    int x;

    if (!TyDict_Check(val)) {
        TyErr_SetString(TyExc_TypeError,
            "argument must be a signal dict");
        return DEC_INVALID_SIGNALS;
    }

    if (TyDict_Size(val) != SIGNAL_MAP_LEN) {
        TyErr_SetString(TyExc_KeyError,
            "invalid signal dict");
        return DEC_INVALID_SIGNALS;
    }

    for (cm = state->signal_map; cm->name != NULL; cm++) {
        b = TyDict_GetItemWithError(val, cm->ex);
        if (b == NULL) {
            if (TyErr_Occurred()) {
                return DEC_ERR_OCCURRED;
            }
            TyErr_SetString(TyExc_KeyError,
                "invalid signal dict");
            return DEC_INVALID_SIGNALS;
        }

        x = PyObject_IsTrue(b);
        if (x < 0) {
            return DEC_ERR_OCCURRED;
        }
        if (x == 1) {
            flags |= cm->flag;
        }
    }

    return flags;
}

#ifdef EXTRA_FUNCTIONALITY
static uint32_t
long_as_flags(TyObject *v)
{
    long x;

    x = TyLong_AsLong(v);
    if (x == -1 && TyErr_Occurred()) {
        return DEC_ERR_OCCURRED;
    }
    if (x < 0 || x > (long)MPD_Max_status) {
        TyErr_SetString(TyExc_TypeError, invalid_flags_err);
        return DEC_INVALID_SIGNALS;
    }

    return x;
}
#endif

static int
dec_addstatus(TyObject *context, uint32_t status)
{
    mpd_context_t *ctx = CTX(context);
    decimal_state *state = get_module_state_from_ctx(context);

    ctx->status |= status;
    if (status & (ctx->traps|MPD_Malloc_error)) {
        TyObject *ex, *siglist;

        if (status & MPD_Malloc_error) {
            TyErr_NoMemory();
            return 1;
        }

        ex = flags_as_exception(state, ctx->traps&status);
        if (ex == NULL) {
            return 1; /* GCOV_NOT_REACHED */
        }
        siglist = flags_as_list(state, ctx->traps&status);
        if (siglist == NULL) {
            return 1;
        }

        TyErr_SetObject(ex, siglist);
        Ty_DECREF(siglist);
        return 1;
    }
    return 0;
}

static int
getround(decimal_state *state, TyObject *v)
{
    int i;
    if (TyUnicode_Check(v)) {
        for (i = 0; i < _PY_DEC_ROUND_GUARD; i++) {
            if (v == state->round_map[i]) {
                return i;
            }
        }
        for (i = 0; i < _PY_DEC_ROUND_GUARD; i++) {
            if (TyUnicode_Compare(v, state->round_map[i]) == 0) {
                return i;
            }
        }
    }

    return type_error_int(invalid_rounding_err);
}


/******************************************************************************/
/*                            SignalDict Object                               */
/******************************************************************************/

/* The SignalDict is a MutableMapping that provides access to the
   mpd_context_t flags, which reside in the context object. When a
   new context is created, context.traps and context.flags are
   initialized to new SignalDicts. Once a SignalDict is tied to
   a context, it cannot be deleted. */

static const char *INVALID_SIGNALDICT_ERROR_MSG = "invalid signal dict";

static int
signaldict_init(TyObject *self,
                TyObject *Py_UNUSED(args), TyObject *Py_UNUSED(kwds))
{
    SdFlagAddr(self) = NULL;
    return 0;
}

static Ty_ssize_t
signaldict_len(TyObject *self)
{
    if (SdFlagAddr(self) == NULL) {
        return value_error_int(INVALID_SIGNALDICT_ERROR_MSG);
    }
    return SIGNAL_MAP_LEN;
}

static TyObject *
signaldict_iter(TyObject *self)
{
    if (SdFlagAddr(self) == NULL) {
        return value_error_ptr(INVALID_SIGNALDICT_ERROR_MSG);
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    return TyTuple_Type.tp_iter(state->SignalTuple);
}

static TyObject *
signaldict_getitem(TyObject *self, TyObject *key)
{
    uint32_t flag;
    if (SdFlagAddr(self) == NULL) {
        return value_error_ptr(INVALID_SIGNALDICT_ERROR_MSG);
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));

    flag = exception_as_flag(state, key);
    if (flag & DEC_ERRORS) {
        return NULL;
    }

    return SdFlags(self)&flag ? incr_true() : incr_false();
}

static int
signaldict_setitem(TyObject *self, TyObject *key, TyObject *value)
{
    uint32_t flag;
    int x;

    if (SdFlagAddr(self) == NULL) {
        return value_error_int(INVALID_SIGNALDICT_ERROR_MSG);
    }

    if (value == NULL) {
        return value_error_int("signal keys cannot be deleted");
    }

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    flag = exception_as_flag(state, key);
    if (flag & DEC_ERRORS) {
        return -1;
    }

    x = PyObject_IsTrue(value);
    if (x < 0) {
        return -1;
    }

    if (x == 1) {
        SdFlags(self) |= flag;
    }
    else {
        SdFlags(self) &= ~flag;
    }

    return 0;
}

static int
signaldict_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static void
signaldict_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
signaldict_repr(TyObject *self)
{
    DecCondMap *cm;
    const char *n[SIGNAL_MAP_LEN]; /* name */
    const char *b[SIGNAL_MAP_LEN]; /* bool */
    int i;

    if (SdFlagAddr(self) == NULL) {
        return value_error_ptr(INVALID_SIGNALDICT_ERROR_MSG);
    }

    assert(SIGNAL_MAP_LEN == 9);

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    for (cm=state->signal_map, i=0; cm->name != NULL; cm++, i++) {
        n[i] = cm->fqname;
        b[i] = SdFlags(self)&cm->flag ? "True" : "False";
    }
    return TyUnicode_FromFormat(
        "{<class '%s'>:%s, <class '%s'>:%s, <class '%s'>:%s, "
         "<class '%s'>:%s, <class '%s'>:%s, <class '%s'>:%s, "
         "<class '%s'>:%s, <class '%s'>:%s, <class '%s'>:%s}",
            n[0], b[0], n[1], b[1], n[2], b[2],
            n[3], b[3], n[4], b[4], n[5], b[5],
            n[6], b[6], n[7], b[7], n[8], b[8]);
}

static TyObject *
signaldict_richcompare(TyObject *v, TyObject *w, int op)
{
    TyObject *res = Ty_NotImplemented;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(v));
    assert(PyDecSignalDict_Check(state, v));

    if ((SdFlagAddr(v) == NULL) || (SdFlagAddr(w) == NULL)) {
        return value_error_ptr(INVALID_SIGNALDICT_ERROR_MSG);
    }

    if (op == Py_EQ || op == Py_NE) {
        if (PyDecSignalDict_Check(state, w)) {
            res = (SdFlags(v)==SdFlags(w)) ^ (op==Py_NE) ? Ty_True : Ty_False;
        }
        else if (TyDict_Check(w)) {
            uint32_t flags = dict_as_flags(state, w);
            if (flags & DEC_ERRORS) {
                if (flags & DEC_INVALID_SIGNALS) {
                    /* non-comparable: Ty_NotImplemented */
                    TyErr_Clear();
                }
                else {
                    return NULL;
                }
            }
            else {
                res = (SdFlags(v)==flags) ^ (op==Py_NE) ? Ty_True : Ty_False;
            }
        }
    }

    return Ty_NewRef(res);
}

static TyObject *
signaldict_copy(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    if (SdFlagAddr(self) == NULL) {
        return value_error_ptr(INVALID_SIGNALDICT_ERROR_MSG);
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    return flags_as_dict(state, SdFlags(self));
}


static TyMethodDef signaldict_methods[] = {
    { "copy", signaldict_copy, METH_NOARGS, NULL},
    {NULL, NULL}
};


static TyType_Slot signaldict_slots[] = {
    {Ty_tp_dealloc, signaldict_dealloc},
    {Ty_tp_traverse, signaldict_traverse},
    {Ty_tp_repr, signaldict_repr},
    {Ty_tp_hash, PyObject_HashNotImplemented},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_richcompare, signaldict_richcompare},
    {Ty_tp_iter, signaldict_iter},
    {Ty_tp_methods, signaldict_methods},
    {Ty_tp_init, signaldict_init},

    // Mapping protocol
    {Ty_mp_length, signaldict_len},
    {Ty_mp_subscript, signaldict_getitem},
    {Ty_mp_ass_subscript, signaldict_setitem},
    {0, NULL},
};

static TyType_Spec signaldict_spec = {
    .name = "decimal.SignalDictMixin",
    .basicsize = sizeof(PyDecSignalDictObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = signaldict_slots,
};


/******************************************************************************/
/*                         Context Object, Part 1                             */
/******************************************************************************/

#define Dec_CONTEXT_GET_SSIZE(mem)                          \
static TyObject *                                           \
context_get##mem(TyObject *self, void *Py_UNUSED(closure))  \
{                                                           \
    return TyLong_FromSsize_t(mpd_get##mem(CTX(self)));     \
}

#define Dec_CONTEXT_GET_ULONG(mem)                              \
static TyObject *                                               \
context_get##mem(TyObject *self, void *Py_UNUSED(closure))      \
{                                                               \
    return TyLong_FromUnsignedLong(mpd_get##mem(CTX(self)));    \
}

Dec_CONTEXT_GET_SSIZE(prec)
Dec_CONTEXT_GET_SSIZE(emax)
Dec_CONTEXT_GET_SSIZE(emin)
Dec_CONTEXT_GET_SSIZE(clamp)

#ifdef EXTRA_FUNCTIONALITY
Dec_CONTEXT_GET_ULONG(traps)
Dec_CONTEXT_GET_ULONG(status)
#endif

static TyObject *
context_getround(TyObject *self, void *Py_UNUSED(closure))
{
    int i = mpd_getround(CTX(self));
    decimal_state *state = get_module_state_from_ctx(self);

    return Ty_NewRef(state->round_map[i]);
}

static TyObject *
context_getcapitals(TyObject *self, void *Py_UNUSED(closure))
{
    return TyLong_FromLong(CtxCaps(self));
}

#ifdef EXTRA_FUNCTIONALITY
static TyObject *
context_getallcr(TyObject *self, void *Py_UNUSED(closure))
{
    return TyLong_FromLong(mpd_getcr(CTX(self)));
}
#endif

static TyObject *
context_getetiny(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return TyLong_FromSsize_t(mpd_etiny(CTX(self)));
}

static TyObject *
context_getetop(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return TyLong_FromSsize_t(mpd_etop(CTX(self)));
}

static int
context_setprec(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetprec(ctx, x)) {
        return value_error_int(
            "valid range for prec is [1, MAX_PREC]");
    }

    return 0;
}

static int
context_setemin(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetemin(ctx, x)) {
        return value_error_int(
            "valid range for Emin is [MIN_EMIN, 0]");
    }

    return 0;
}

static int
context_setemax(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetemax(ctx, x)) {
        return value_error_int(
            "valid range for Emax is [0, MAX_EMAX]");
    }

    return 0;
}

#ifdef CONFIG_32
static TyObject *
context_unsafe_setprec(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx = CTX(self);
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return NULL;
    }

    if (x < 1 || x > 1070000000L) {
        return value_error_ptr(
            "valid range for unsafe prec is [1, 1070000000]");
    }

    ctx->prec = x;
    Py_RETURN_NONE;
}

static TyObject *
context_unsafe_setemin(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx = CTX(self);
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return NULL;
    }

    if (x < -1070000000L || x > 0) {
        return value_error_ptr(
            "valid range for unsafe emin is [-1070000000, 0]");
    }

    ctx->emin = x;
    Py_RETURN_NONE;
}

static TyObject *
context_unsafe_setemax(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx = CTX(self);
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return NULL;
    }

    if (x < 0 || x > 1070000000L) {
        return value_error_ptr(
            "valid range for unsafe emax is [0, 1070000000]");
    }

    ctx->emax = x;
    Py_RETURN_NONE;
}
#endif

static int
context_setround(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    int x;

    decimal_state *state = get_module_state_from_ctx(self);
    x = getround(state, value);
    if (x == -1) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetround(ctx, x)) {
        INTERNAL_ERROR_INT("context_setround"); /* GCOV_NOT_REACHED */
    }

    return 0;
}

static int
context_setcapitals(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }

    if (x != 0 && x != 1) {
        return value_error_int(
            "valid values for capitals are 0 or 1");
    }
    CtxCaps(self) = (int)x;

    return 0;
}

#ifdef EXTRA_FUNCTIONALITY
static int
context_settraps(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    uint32_t flags;

    flags = long_as_flags(value);
    if (flags & DEC_ERRORS) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsettraps(ctx, flags)) {
        INTERNAL_ERROR_INT("context_settraps");
    }

    return 0;
}
#endif

static int
context_settraps_list(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx;
    uint32_t flags;
    decimal_state *state = get_module_state_from_ctx(self);
    flags = list_as_flags(state, value);
    if (flags & DEC_ERRORS) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsettraps(ctx, flags)) {
        INTERNAL_ERROR_INT("context_settraps_list");
    }

    return 0;
}

static int
context_settraps_dict(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx;
    uint32_t flags;

    decimal_state *state = get_module_state_from_ctx(self);
    if (PyDecSignalDict_Check(state, value)) {
        flags = SdFlags(value);
    }
    else {
        flags = dict_as_flags(state, value);
        if (flags & DEC_ERRORS) {
            return -1;
        }
    }

    ctx = CTX(self);
    if (!mpd_qsettraps(ctx, flags)) {
        INTERNAL_ERROR_INT("context_settraps_dict");
    }

    return 0;
}

#ifdef EXTRA_FUNCTIONALITY
static int
context_setstatus(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    uint32_t flags;

    flags = long_as_flags(value);
    if (flags & DEC_ERRORS) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetstatus(ctx, flags)) {
        INTERNAL_ERROR_INT("context_setstatus");
    }

    return 0;
}
#endif

static int
context_setstatus_list(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx;
    uint32_t flags;
    decimal_state *state = get_module_state_from_ctx(self);

    flags = list_as_flags(state, value);
    if (flags & DEC_ERRORS) {
        return -1;
    }

    ctx = CTX(self);
    if (!mpd_qsetstatus(ctx, flags)) {
        INTERNAL_ERROR_INT("context_setstatus_list");
    }

    return 0;
}

static int
context_setstatus_dict(TyObject *self, TyObject *value)
{
    mpd_context_t *ctx;
    uint32_t flags;

    decimal_state *state = get_module_state_from_ctx(self);
    if (PyDecSignalDict_Check(state, value)) {
        flags = SdFlags(value);
    }
    else {
        flags = dict_as_flags(state, value);
        if (flags & DEC_ERRORS) {
            return -1;
        }
    }

    ctx = CTX(self);
    if (!mpd_qsetstatus(ctx, flags)) {
        INTERNAL_ERROR_INT("context_setstatus_dict");
    }

    return 0;
}

static int
context_setclamp(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }
    BOUNDS_CHECK(x, INT_MIN, INT_MAX);

    ctx = CTX(self);
    if (!mpd_qsetclamp(ctx, (int)x)) {
        return value_error_int("valid values for clamp are 0 or 1");
    }

    return 0;
}

#ifdef EXTRA_FUNCTIONALITY
static int
context_setallcr(TyObject *self, TyObject *value, void *Py_UNUSED(closure))
{
    mpd_context_t *ctx;
    mpd_ssize_t x;

    x = TyLong_AsSsize_t(value);
    if (x == -1 && TyErr_Occurred()) {
        return -1;
    }
    BOUNDS_CHECK(x, INT_MIN, INT_MAX);

    ctx = CTX(self);
    if (!mpd_qsetcr(ctx, (int)x)) {
        return value_error_int("valid values for _allcr are 0 or 1");
    }

    return 0;
}
#endif

static TyObject *
context_getattr(TyObject *self, TyObject *name)
{
    TyObject *retval;

    if (TyUnicode_Check(name)) {
        if (TyUnicode_CompareWithASCIIString(name, "traps") == 0) {
            retval = ((PyDecContextObject *)self)->traps;
            return Ty_NewRef(retval);
        }
        if (TyUnicode_CompareWithASCIIString(name, "flags") == 0) {
            retval = ((PyDecContextObject *)self)->flags;
            return Ty_NewRef(retval);
        }
    }

    return PyObject_GenericGetAttr(self, name);
}

static int
context_setattr(TyObject *self, TyObject *name, TyObject *value)
{
    if (value == NULL) {
        TyErr_SetString(TyExc_AttributeError,
            "context attributes cannot be deleted");
        return -1;
    }

    if (TyUnicode_Check(name)) {
        if (TyUnicode_CompareWithASCIIString(name, "traps") == 0) {
            return context_settraps_dict(self, value);
        }
        if (TyUnicode_CompareWithASCIIString(name, "flags") == 0) {
            return context_setstatus_dict(self, value);
        }
    }

    return PyObject_GenericSetAttr(self, name, value);
}

static int
context_setattrs(TyObject *self, TyObject *prec, TyObject *rounding,
                 TyObject *emin, TyObject *emax, TyObject *capitals,
                 TyObject *clamp, TyObject *status, TyObject *traps) {

    int ret;
    if (prec != Ty_None && context_setprec(self, prec, NULL) < 0) {
        return -1;
    }
    if (rounding != Ty_None && context_setround(self, rounding, NULL) < 0) {
        return -1;
    }
    if (emin != Ty_None && context_setemin(self, emin, NULL) < 0) {
        return -1;
    }
    if (emax != Ty_None && context_setemax(self, emax, NULL) < 0) {
        return -1;
    }
    if (capitals != Ty_None && context_setcapitals(self, capitals, NULL) < 0) {
        return -1;
    }
    if (clamp != Ty_None && context_setclamp(self, clamp, NULL) < 0) {
       return -1;
    }

    if (traps != Ty_None) {
        if (TyList_Check(traps)) {
            ret = context_settraps_list(self, traps);
        }
#ifdef EXTRA_FUNCTIONALITY
        else if (TyLong_Check(traps)) {
            ret = context_settraps(self, traps, NULL);
        }
#endif
        else {
            ret = context_settraps_dict(self, traps);
        }
        if (ret < 0) {
            return ret;
        }
    }
    if (status != Ty_None) {
        if (TyList_Check(status)) {
            ret = context_setstatus_list(self, status);
        }
#ifdef EXTRA_FUNCTIONALITY
        else if (TyLong_Check(status)) {
            ret = context_setstatus(self, status, NULL);
        }
#endif
        else {
            ret = context_setstatus_dict(self, status);
        }
        if (ret < 0) {
            return ret;
        }
    }

    return 0;
}

static TyObject *
context_clear_traps(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    CTX(self)->traps = 0;
    Py_RETURN_NONE;
}

static TyObject *
context_clear_flags(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    CTX(self)->status = 0;
    Py_RETURN_NONE;
}

#define DEC_DFLT_EMAX 999999
#define DEC_DFLT_EMIN -999999

static mpd_context_t dflt_ctx = {
  28, DEC_DFLT_EMAX, DEC_DFLT_EMIN,
  MPD_IEEE_Invalid_operation|MPD_Division_by_zero|MPD_Overflow,
  0, 0, MPD_ROUND_HALF_EVEN, 0, 1
};

static TyObject *
context_new(TyTypeObject *type,
            TyObject *Py_UNUSED(args), TyObject *Py_UNUSED(kwds))
{
    PyDecContextObject *self = NULL;
    mpd_context_t *ctx;

    decimal_state *state = get_module_state_by_def(type);
    if (type == state->PyDecContext_Type) {
        self = PyObject_GC_New(PyDecContextObject, state->PyDecContext_Type);
    }
    else {
        self = (PyDecContextObject *)type->tp_alloc(type, 0);
    }

    if (self == NULL) {
        return NULL;
    }

    self->traps = PyObject_CallObject((TyObject *)state->PyDecSignalDict_Type, NULL);
    if (self->traps == NULL) {
        self->flags = NULL;
        Ty_DECREF(self);
        return NULL;
    }
    self->flags = PyObject_CallObject((TyObject *)state->PyDecSignalDict_Type, NULL);
    if (self->flags == NULL) {
        Ty_DECREF(self);
        return NULL;
    }

    ctx = CTX(self);

    if (state->default_context_template) {
        *ctx = *CTX(state->default_context_template);
    }
    else {
        *ctx = dflt_ctx;
    }

    SdFlagAddr(self->traps) = &ctx->traps;
    SdFlagAddr(self->flags) = &ctx->status;

    CtxCaps(self) = 1;
    self->tstate = NULL;
    self->modstate = state;

    if (type == state->PyDecContext_Type) {
        PyObject_GC_Track(self);
    }
    assert(PyObject_GC_IsTracked((TyObject *)self));
    return (TyObject *)self;
}

static int
context_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyDecContextObject *self = _PyDecContextObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->traps);
    Ty_VISIT(self->flags);
    return 0;
}

static int
context_clear(TyObject *op)
{
    PyDecContextObject *self = _PyDecContextObject_CAST(op);
    Ty_CLEAR(self->traps);
    Ty_CLEAR(self->flags);
    return 0;
}

static void
context_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)context_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
context_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {
      "prec", "rounding", "Emin", "Emax", "capitals", "clamp",
      "flags", "traps", NULL
    };
    TyObject *prec = Ty_None;
    TyObject *rounding = Ty_None;
    TyObject *emin = Ty_None;
    TyObject *emax = Ty_None;
    TyObject *capitals = Ty_None;
    TyObject *clamp = Ty_None;
    TyObject *status = Ty_None;
    TyObject *traps = Ty_None;

    assert(TyTuple_Check(args));

    if (!TyArg_ParseTupleAndKeywords(
            args, kwds,
            "|OOOOOOOO", kwlist,
            &prec, &rounding, &emin, &emax, &capitals, &clamp, &status, &traps
         )) {
        return -1;
    }

    return context_setattrs(
        self, prec, rounding,
        emin, emax, capitals,
        clamp, status, traps
    );
}

static TyObject *
context_repr(TyObject *self)
{
    mpd_context_t *ctx;
    char flags[MPD_MAX_SIGNAL_LIST];
    char traps[MPD_MAX_SIGNAL_LIST];
    int n, mem;

#ifdef Ty_DEBUG
    decimal_state *state = get_module_state_from_ctx(self);
    assert(PyDecContext_Check(state, self));
#endif
    ctx = CTX(self);

    mem = MPD_MAX_SIGNAL_LIST;
    n = mpd_lsnprint_signals(flags, mem, ctx->status, dec_signal_string);
    if (n < 0 || n >= mem) {
        INTERNAL_ERROR_PTR("context_repr");
    }

    n = mpd_lsnprint_signals(traps, mem, ctx->traps, dec_signal_string);
    if (n < 0 || n >= mem) {
        INTERNAL_ERROR_PTR("context_repr");
    }

    return TyUnicode_FromFormat(
        "Context(prec=%zd, rounding=%s, Emin=%zd, Emax=%zd, "
                "capitals=%d, clamp=%d, flags=%s, traps=%s)",
         ctx->prec, mpd_round_string[ctx->round], ctx->emin, ctx->emax,
         CtxCaps(self), ctx->clamp, flags, traps);
}

static void
init_basic_context(TyObject *v)
{
    mpd_context_t ctx = dflt_ctx;

    ctx.prec = 9;
    ctx.traps |= (MPD_Underflow|MPD_Clamped);
    ctx.round = MPD_ROUND_HALF_UP;

    *CTX(v) = ctx;
    CtxCaps(v) = 1;
}

static void
init_extended_context(TyObject *v)
{
    mpd_context_t ctx = dflt_ctx;

    ctx.prec = 9;
    ctx.traps = 0;

    *CTX(v) = ctx;
    CtxCaps(v) = 1;
}

/* Factory function for creating IEEE interchange format contexts */
static TyObject *
ieee_context(TyObject *module, TyObject *v)
{
    TyObject *context;
    mpd_ssize_t bits;
    mpd_context_t ctx;

    bits = TyLong_AsSsize_t(v);
    if (bits == -1 && TyErr_Occurred()) {
        return NULL;
    }
    if (bits <= 0 || bits > INT_MAX) {
        goto error;
    }
    if (mpd_ieee_context(&ctx, (int)bits) < 0) {
        goto error;
    }

    decimal_state *state = get_module_state(module);
    context = PyObject_CallObject((TyObject *)state->PyDecContext_Type, NULL);
    if (context == NULL) {
        return NULL;
    }
    *CTX(context) = ctx;

    return context;

error:
    TyErr_Format(TyExc_ValueError,
        "argument must be a multiple of 32, with a maximum of %d",
        MPD_IEEE_CONTEXT_MAX_BITS);

    return NULL;
}

static TyObject *
context_copy(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *copy;

    decimal_state *state = get_module_state_from_ctx(self);
    copy = PyObject_CallObject((TyObject *)state->PyDecContext_Type, NULL);
    if (copy == NULL) {
        return NULL;
    }

    *CTX(copy) = *CTX(self);
    CTX(copy)->newtrap = 0;
    CtxCaps(copy) = CtxCaps(self);

    return copy;
}

static TyObject *
context_reduce(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *flags;
    TyObject *traps;
    TyObject *ret;
    mpd_context_t *ctx;
    decimal_state *state = get_module_state_from_ctx(self);

    ctx = CTX(self);

    flags = signals_as_list(state, ctx->status);
    if (flags == NULL) {
        return NULL;
    }
    traps = signals_as_list(state, ctx->traps);
    if (traps == NULL) {
        Ty_DECREF(flags);
        return NULL;
    }

    ret = Ty_BuildValue(
            "O(nsnniiOO)",
            Ty_TYPE(self),
            ctx->prec, mpd_round_string[ctx->round], ctx->emin, ctx->emax,
            CtxCaps(self), ctx->clamp, flags, traps
    );

    Ty_DECREF(flags);
    Ty_DECREF(traps);
    return ret;
}


static TyGetSetDef context_getsets [] =
{
  { "prec", context_getprec, context_setprec, NULL, NULL},
  { "Emax", context_getemax, context_setemax, NULL, NULL},
  { "Emin", context_getemin, context_setemin, NULL, NULL},
  { "rounding", context_getround, context_setround, NULL, NULL},
  { "capitals", context_getcapitals, context_setcapitals, NULL, NULL},
  { "clamp", context_getclamp, context_setclamp, NULL, NULL},
#ifdef EXTRA_FUNCTIONALITY
  { "_allcr", context_getallcr, context_setallcr, NULL, NULL},
  { "_traps", context_gettraps, context_settraps, NULL, NULL},
  { "_flags", context_getstatus, context_setstatus, NULL, NULL},
#endif
  {NULL}
};


#define CONTEXT_CHECK(state, obj) \
    if (!PyDecContext_Check(state, obj)) { \
        TyErr_SetString(TyExc_TypeError,   \
            "argument must be a context"); \
        return NULL;                       \
    }

#define CONTEXT_CHECK_VA(state, obj) \
    if (obj == Ty_None) {                           \
        CURRENT_CONTEXT(state, obj);                \
    }                                               \
    else if (!PyDecContext_Check(state, obj)) {     \
        TyErr_SetString(TyExc_TypeError,            \
            "optional argument must be a context"); \
        return NULL;                                \
    }


/******************************************************************************/
/*                Global, thread local and temporary contexts                 */
/******************************************************************************/

/*
 * Thread local storage currently has a speed penalty of about 4%.
 * All functions that map Python's arithmetic operators to mpdecimal
 * functions have to look up the current context for each and every
 * operation.
 */

#ifndef WITH_DECIMAL_CONTEXTVAR
/* Get the context from the thread state dictionary. */
static TyObject *
current_context_from_dict(decimal_state *modstate)
{
    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    // The caller must hold the GIL
    _Ty_EnsureTstateNotNULL(tstate);
#endif

    TyObject *dict = _TyThreadState_GetDict(tstate);
    if (dict == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
            "cannot get thread state");
        return NULL;
    }

    TyObject *tl_context;
    tl_context = TyDict_GetItemWithError(dict, modstate->tls_context_key);
    if (tl_context != NULL) {
        /* We already have a thread local context. */
        CONTEXT_CHECK(modstate, tl_context);
    }
    else {
        if (TyErr_Occurred()) {
            return NULL;
        }

        /* Set up a new thread local context. */
        tl_context = context_copy(modstate->default_context_template, NULL);
        if (tl_context == NULL) {
            return NULL;
        }
        CTX(tl_context)->status = 0;

        if (TyDict_SetItem(dict, modstate->tls_context_key, tl_context) < 0) {
            Ty_DECREF(tl_context);
            return NULL;
        }
        Ty_DECREF(tl_context);
    }

    /* Cache the context of the current thread, assuming that it
     * will be accessed several times before a thread switch. */
    Ty_XSETREF(modstate->cached_context,
               (PyDecContextObject *)Ty_NewRef(tl_context));
    modstate->cached_context->tstate = tstate;

    /* Borrowed reference with refcount==1 */
    return tl_context;
}

/* Return borrowed reference to thread local context. */
static TyObject *
current_context(decimal_state *modstate)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (modstate->cached_context && modstate->cached_context->tstate == tstate) {
        return (TyObject *)(modstate->cached_context);
    }

    return current_context_from_dict(modstate);
}

/* ctxobj := borrowed reference to the current context */
#define CURRENT_CONTEXT(STATE, CTXOBJ)      \
    do {                                    \
        CTXOBJ = current_context(STATE);    \
        if (CTXOBJ == NULL) {               \
            return NULL;                    \
        }                                   \
    } while (0)

/* Return a new reference to the current context */
static TyObject *
PyDec_GetCurrentContext(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *context;
    decimal_state *state = get_module_state(self);

    CURRENT_CONTEXT(state, context);
    return Ty_NewRef(context);
}

/* Set the thread local context to a new context, decrement old reference */
static TyObject *
PyDec_SetCurrentContext(TyObject *self, TyObject *v)
{
    TyObject *dict;

    decimal_state *state = get_module_state(self);
    CONTEXT_CHECK(state, v);

    dict = TyThreadState_GetDict();
    if (dict == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
            "cannot get thread state");
        return NULL;
    }

    /* If the new context is one of the templates, make a copy.
     * This is the current behavior of decimal.py. */
    if (v == state->default_context_template ||
        v == state->basic_context_template ||
        v == state->extended_context_template) {
        v = context_copy(v, NULL);
        if (v == NULL) {
            return NULL;
        }
        CTX(v)->status = 0;
    }
    else {
        Ty_INCREF(v);
    }

    Ty_CLEAR(state->cached_context);
    if (TyDict_SetItem(dict, state->tls_context_key, v) < 0) {
        Ty_DECREF(v);
        return NULL;
    }

    Ty_DECREF(v);
    Py_RETURN_NONE;
}
#else
static TyObject *
init_current_context(decimal_state *state)
{
    TyObject *tl_context = context_copy(state->default_context_template, NULL);
    if (tl_context == NULL) {
        return NULL;
    }
    CTX(tl_context)->status = 0;

    TyObject *tok = PyContextVar_Set(state->current_context_var, tl_context);
    if (tok == NULL) {
        Ty_DECREF(tl_context);
        return NULL;
    }
    Ty_DECREF(tok);

    return tl_context;
}

static inline TyObject *
current_context(decimal_state *state)
{
    TyObject *tl_context;
    if (PyContextVar_Get(state->current_context_var, NULL, &tl_context) < 0) {
        return NULL;
    }

    if (tl_context != NULL) {
        return tl_context;
    }

    return init_current_context(state);
}

/* ctxobj := borrowed reference to the current context */
#define CURRENT_CONTEXT(STATE, CTXOBJ)      \
    do {                                    \
        CTXOBJ = current_context(STATE);    \
        if (CTXOBJ == NULL) {               \
            return NULL;                    \
        }                                   \
        Ty_DECREF(CTXOBJ);                  \
    } while (0)

/* Return a new reference to the current context */
static TyObject *
PyDec_GetCurrentContext(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    decimal_state *state = get_module_state(self);
    return current_context(state);
}

/* Set the thread local context to a new context, decrement old reference */
static TyObject *
PyDec_SetCurrentContext(TyObject *self, TyObject *v)
{
    decimal_state *state = get_module_state(self);
    CONTEXT_CHECK(state, v);

    /* If the new context is one of the templates, make a copy.
     * This is the current behavior of decimal.py. */
    if (v == state->default_context_template ||
        v == state->basic_context_template ||
        v == state->extended_context_template) {
        v = context_copy(v, NULL);
        if (v == NULL) {
            return NULL;
        }
        CTX(v)->status = 0;
    }
    else {
        Ty_INCREF(v);
    }

    TyObject *tok = PyContextVar_Set(state->current_context_var, v);
    Ty_DECREF(v);
    if (tok == NULL) {
        return NULL;
    }
    Ty_DECREF(tok);

    Py_RETURN_NONE;
}
#endif

/* Context manager object for the 'with' statement. The manager
 * owns one reference to the global (outer) context and one
 * to the local (inner) context. */
static TyObject *
ctxmanager_new(TyObject *m, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {
      "ctx", "prec", "rounding",
      "Emin", "Emax", "capitals",
      "clamp", "flags", "traps",
      NULL
    };
    TyObject *local = Ty_None;
    TyObject *global;

    TyObject *prec = Ty_None;
    TyObject *rounding = Ty_None;
    TyObject *Emin = Ty_None;
    TyObject *Emax = Ty_None;
    TyObject *capitals = Ty_None;
    TyObject *clamp = Ty_None;
    TyObject *flags = Ty_None;
    TyObject *traps = Ty_None;

    decimal_state *state = get_module_state(m);
    CURRENT_CONTEXT(state, global);
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|OOOOOOOOO", kwlist, &local,
          &prec, &rounding, &Emin, &Emax, &capitals, &clamp, &flags, &traps)) {
        return NULL;
    }
    if (local == Ty_None) {
        local = global;
    }
    else if (!PyDecContext_Check(state, local)) {
        TyErr_SetString(TyExc_TypeError,
            "optional argument must be a context");
        return NULL;
    }

    TyObject *local_copy = context_copy(local, NULL);
    if (local_copy == NULL) {
        return NULL;
    }

    int ret = context_setattrs(
        local_copy, prec, rounding,
        Emin, Emax, capitals,
        clamp, flags, traps
    );
    if (ret < 0) {
        Ty_DECREF(local_copy);
        return NULL;
    }

    PyDecContextManagerObject *self;
    self = PyObject_GC_New(PyDecContextManagerObject,
                           state->PyDecContextManager_Type);
    if (self == NULL) {
        Ty_DECREF(local_copy);
        return NULL;
    }

    self->local = local_copy;
    self->global = Ty_NewRef(global);
    PyObject_GC_Track(self);

    return (TyObject *)self;
}

static int
ctxmanager_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyDecContextManagerObject *self = _PyDecContextManagerObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->local);
    Ty_VISIT(self->global);
    return 0;
}

static int
ctxmanager_clear(TyObject *op)
{
    PyDecContextManagerObject *self = _PyDecContextManagerObject_CAST(op);
    Ty_CLEAR(self->local);
    Ty_CLEAR(self->global);
    return 0;
}

static void
ctxmanager_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)ctxmanager_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
ctxmanager_set_local(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    TyObject *ret;
    PyDecContextManagerObject *self = _PyDecContextManagerObject_CAST(op);
    ret = PyDec_SetCurrentContext(TyType_GetModule(Ty_TYPE(self)), self->local);
    if (ret == NULL) {
        return NULL;
    }
    Ty_DECREF(ret);

    return Ty_NewRef(self->local);
}

static TyObject *
ctxmanager_restore_global(TyObject *op, TyObject *Py_UNUSED(args))
{
    TyObject *ret;
    PyDecContextManagerObject *self = _PyDecContextManagerObject_CAST(op);
    ret = PyDec_SetCurrentContext(TyType_GetModule(Ty_TYPE(self)), self->global);
    if (ret == NULL) {
        return NULL;
    }
    Ty_DECREF(ret);

    Py_RETURN_NONE;
}


static TyMethodDef ctxmanager_methods[] = {
  {"__enter__", ctxmanager_set_local, METH_NOARGS, NULL},
  {"__exit__", ctxmanager_restore_global, METH_VARARGS, NULL},
  {NULL, NULL}
};

static TyType_Slot ctxmanager_slots[] = {
    {Ty_tp_dealloc, ctxmanager_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, ctxmanager_traverse},
    {Ty_tp_clear, ctxmanager_clear},
    {Ty_tp_methods, ctxmanager_methods},
    {0, NULL},
};

static TyType_Spec ctxmanager_spec = {
    .name = "decimal.ContextManager",
    .basicsize = sizeof(PyDecContextManagerObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = ctxmanager_slots,
};


/******************************************************************************/
/*                           New Decimal Object                               */
/******************************************************************************/

static TyObject *
PyDecType_New(decimal_state *state, TyTypeObject *type)
{
    PyDecObject *dec;

    if (type == state->PyDec_Type) {
        dec = PyObject_GC_New(PyDecObject, state->PyDec_Type);
    }
    else {
        dec = (PyDecObject *)type->tp_alloc(type, 0);
    }
    if (dec == NULL) {
        return NULL;
    }

    dec->hash = -1;

    MPD(dec)->flags = MPD_STATIC|MPD_STATIC_DATA;
    MPD(dec)->exp = 0;
    MPD(dec)->digits = 0;
    MPD(dec)->len = 0;
    MPD(dec)->alloc = _Ty_DEC_MINALLOC;
    MPD(dec)->data = dec->data;

    if (type == state->PyDec_Type) {
        PyObject_GC_Track(dec);
    }
    assert(PyObject_GC_IsTracked((TyObject *)dec));
    return (TyObject *)dec;
}
#define dec_alloc(st) PyDecType_New(st, (st)->PyDec_Type)

static int
dec_traverse(TyObject *dec, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(dec));
    return 0;
}

static void
dec_dealloc(TyObject *dec)
{
    TyTypeObject *tp = Ty_TYPE(dec);
    PyObject_GC_UnTrack(dec);
    mpd_del(MPD(dec));
    tp->tp_free(dec);
    Ty_DECREF(tp);
}


/******************************************************************************/
/*                           Conversions to Decimal                           */
/******************************************************************************/

Ty_LOCAL_INLINE(int)
is_space(int kind, const void *data, Ty_ssize_t pos)
{
    Ty_UCS4 ch = TyUnicode_READ(kind, data, pos);
    return Ty_UNICODE_ISSPACE(ch);
}

/* Return the ASCII representation of a numeric Unicode string. The numeric
   string may contain ascii characters in the range [1, 127], any Unicode
   space and any unicode digit. If strip_ws is true, leading and trailing
   whitespace is stripped. If ignore_underscores is true, underscores are
   ignored.

   Return NULL if malloc fails and an empty string if invalid characters
   are found. */
static char *
numeric_as_ascii(TyObject *u, int strip_ws, int ignore_underscores)
{
    int kind;
    const void *data;
    Ty_UCS4 ch;
    char *res, *cp;
    Ty_ssize_t j, len;
    int d;

    kind = TyUnicode_KIND(u);
    data = TyUnicode_DATA(u);
    len =  TyUnicode_GET_LENGTH(u);

    cp = res = TyMem_Malloc(len+1);
    if (res == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    j = 0;
    if (strip_ws) {
        while (len > 0 && is_space(kind, data, len-1)) {
            len--;
        }
        while (j < len && is_space(kind, data, j)) {
            j++;
        }
    }

    for (; j < len; j++) {
        ch = TyUnicode_READ(kind, data, j);
        if (ignore_underscores && ch == '_') {
            continue;
        }
        if (0 < ch && ch <= 127) {
            *cp++ = ch;
            continue;
        }
        if (Ty_UNICODE_ISSPACE(ch)) {
            *cp++ = ' ';
            continue;
        }
        d = Ty_UNICODE_TODECIMAL(ch);
        if (d < 0) {
            /* empty string triggers ConversionSyntax */
            *res = '\0';
            return res;
        }
        *cp++ = '0' + d;
    }
    *cp = '\0';
    return res;
}

/* Return a new PyDecObject or a subtype from a C string. Use the context
   during conversion. */
static TyObject *
PyDecType_FromCString(TyTypeObject *type, const char *s,
                      TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;

    decimal_state *state = get_module_state_from_ctx(context);
    dec = PyDecType_New(state, type);
    if (dec == NULL) {
        return NULL;
    }

    mpd_qset_string(MPD(dec), s, CTX(context), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }
    return dec;
}

/* Return a new PyDecObject or a subtype from a C string. Attempt exact
   conversion. If the operand cannot be converted exactly, set
   InvalidOperation. */
static TyObject *
PyDecType_FromCStringExact(TyTypeObject *type, const char *s,
                           TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;
    mpd_context_t maxctx;

    decimal_state *state = get_module_state_from_ctx(context);
    dec = PyDecType_New(state, type);
    if (dec == NULL) {
        return NULL;
    }

    mpd_maxcontext(&maxctx);

    mpd_qset_string(MPD(dec), s, &maxctx, &status);
    if (status & (MPD_Inexact|MPD_Rounded|MPD_Clamped)) {
        /* we want exact results */
        mpd_seterror(MPD(dec), MPD_Invalid_operation, &status);
    }
    status &= MPD_Errors;
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }

    return dec;
}

/* Return a new PyDecObject or a subtype from a PyUnicodeObject. */
static TyObject *
PyDecType_FromUnicode(TyTypeObject *type, TyObject *u,
                      TyObject *context)
{
    TyObject *dec;
    char *s;

    s = numeric_as_ascii(u, 0, 0);
    if (s == NULL) {
        return NULL;
    }

    dec = PyDecType_FromCString(type, s, context);
    TyMem_Free(s);
    return dec;
}

/* Return a new PyDecObject or a subtype from a PyUnicodeObject. Attempt exact
 * conversion. If the conversion is not exact, fail with InvalidOperation.
 * Allow leading and trailing whitespace in the input operand. */
static TyObject *
PyDecType_FromUnicodeExactWS(TyTypeObject *type, TyObject *u,
                             TyObject *context)
{
    TyObject *dec;
    char *s;

    s = numeric_as_ascii(u, 1, 1);
    if (s == NULL) {
        return NULL;
    }

    dec = PyDecType_FromCStringExact(type, s, context);
    TyMem_Free(s);
    return dec;
}

/* Set PyDecObject from triple without any error checking. */
Ty_LOCAL_INLINE(void)
_dec_settriple(TyObject *dec, uint8_t sign, uint32_t v, mpd_ssize_t exp)
{

#ifdef CONFIG_64
    MPD(dec)->data[0] = v;
    MPD(dec)->len = 1;
#else
    uint32_t q, r;
    q = v / MPD_RADIX;
    r = v - q * MPD_RADIX;
    MPD(dec)->data[1] = q;
    MPD(dec)->data[0] = r;
    MPD(dec)->len = q ? 2 : 1;
#endif
    mpd_set_flags(MPD(dec), sign);
    MPD(dec)->exp = exp;
    mpd_setdigits(MPD(dec));
}

/* Return a new PyDecObject from an mpd_ssize_t. */
static TyObject *
PyDecType_FromSsize(TyTypeObject *type, mpd_ssize_t v, TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;

    decimal_state *state = get_module_state_from_ctx(context);
    dec = PyDecType_New(state, type);
    if (dec == NULL) {
        return NULL;
    }

    mpd_qset_ssize(MPD(dec), v, CTX(context), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }
    return dec;
}

/* Return a new PyDecObject from an mpd_ssize_t. Conversion is exact. */
static TyObject *
PyDecType_FromSsizeExact(TyTypeObject *type, mpd_ssize_t v, TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;
    mpd_context_t maxctx;

    decimal_state *state = get_module_state_from_ctx(context);
    dec = PyDecType_New(state, type);
    if (dec == NULL) {
        return NULL;
    }

    mpd_maxcontext(&maxctx);

    mpd_qset_ssize(MPD(dec), v, &maxctx, &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }
    return dec;
}

/* Convert from a PyLongObject. The context is not modified; flags set
   during conversion are accumulated in the status parameter. */
static TyObject *
dec_from_long(decimal_state *state, TyTypeObject *type, TyObject *v,
              const mpd_context_t *ctx, uint32_t *status)
{
    TyObject *dec = PyDecType_New(state, type);

    if (dec == NULL) {
        return NULL;
    }

    PyLongExport export_long;

    if (TyLong_Export(v, &export_long) == -1) {
        Ty_DECREF(dec);
        return NULL;
    }
    if (export_long.digits) {
        const PyLongLayout *layout = TyLong_GetNativeLayout();

        assert(layout->bits_per_digit < 32);
        assert(layout->digits_order == -1);
        assert(layout->digit_endianness == (PY_LITTLE_ENDIAN ? -1 : 1));
        assert(layout->digit_size == 2 || layout->digit_size == 4);

        uint32_t base = (uint32_t)1 << layout->bits_per_digit;
        uint8_t sign = export_long.negative ? MPD_NEG : MPD_POS;
        Ty_ssize_t len = export_long.ndigits;

        if (layout->digit_size == 4) {
            mpd_qimport_u32(MPD(dec), export_long.digits, len, sign,
                            base, ctx, status);
        }
        else {
            mpd_qimport_u16(MPD(dec), export_long.digits, len, sign,
                            base, ctx, status);
        }
        TyLong_FreeExport(&export_long);
    }
    else {
        mpd_qset_i64(MPD(dec), export_long.value, ctx, status);
    }
    return dec;
}

/* Return a new PyDecObject from a PyLongObject. Use the context for
   conversion. */
static TyObject *
PyDecType_FromLong(TyTypeObject *type, TyObject *v, TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;

    if (!TyLong_Check(v)) {
        TyErr_SetString(TyExc_TypeError, "argument must be an integer");
        return NULL;
    }

    decimal_state *state = get_module_state_from_ctx(context);
    dec = dec_from_long(state, type, v, CTX(context), &status);
    if (dec == NULL) {
        return NULL;
    }

    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }

    return dec;
}

/* Return a new PyDecObject from a PyLongObject. Use a maximum context
   for conversion. If the conversion is not exact, set InvalidOperation. */
static TyObject *
PyDecType_FromLongExact(TyTypeObject *type, TyObject *v,
                        TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;
    mpd_context_t maxctx;

    if (!TyLong_Check(v)) {
        TyErr_SetString(TyExc_TypeError, "argument must be an integer");
        return NULL;
    }

    mpd_maxcontext(&maxctx);
    decimal_state *state = get_module_state_from_ctx(context);
    dec = dec_from_long(state, type, v, &maxctx, &status);
    if (dec == NULL) {
        return NULL;
    }

    if (status & (MPD_Inexact|MPD_Rounded|MPD_Clamped)) {
        /* we want exact results */
        mpd_seterror(MPD(dec), MPD_Invalid_operation, &status);
    }
    status &= MPD_Errors;
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }

    return dec;
}

/* Return a PyDecObject or a subtype from a PyFloatObject.
   Conversion is exact. */
static TyObject *
PyDecType_FromFloatExact(TyTypeObject *type, TyObject *v,
                         TyObject *context)
{
    TyObject *dec, *tmp;
    TyObject *n, *d, *n_d;
    mpd_ssize_t k;
    double x;
    int sign;
    mpd_t *d1, *d2;
    uint32_t status = 0;
    mpd_context_t maxctx;
    decimal_state *state = get_module_state_from_ctx(context);

#ifdef Ty_DEBUG
    assert(TyType_IsSubtype(type, state->PyDec_Type));
#endif
    if (TyLong_Check(v)) {
        return PyDecType_FromLongExact(type, v, context);
    }
    if (!TyFloat_Check(v)) {
        TyErr_SetString(TyExc_TypeError,
            "argument must be int or float");
        return NULL;
    }

    x = TyFloat_AsDouble(v);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    sign = (copysign(1.0, x) == 1.0) ? 0 : 1;

    if (isnan(x) || isinf(x)) {
        dec = PyDecType_New(state, type);
        if (dec == NULL) {
            return NULL;
        }
        if (isnan(x)) {
            /* decimal.py calls repr(float(+-nan)),
             * which always gives a positive result. */
            mpd_setspecial(MPD(dec), MPD_POS, MPD_NAN);
        }
        else {
            mpd_setspecial(MPD(dec), sign, MPD_INF);
        }
        return dec;
    }

    /* absolute value of the float */
    tmp = state->_py_float_abs(v);
    if (tmp == NULL) {
        return NULL;
    }

    /* float as integer ratio: numerator/denominator */
    n_d = state->_py_float_as_integer_ratio(tmp, NULL);
    Ty_DECREF(tmp);
    if (n_d == NULL) {
        return NULL;
    }
    n = TyTuple_GET_ITEM(n_d, 0);
    d = TyTuple_GET_ITEM(n_d, 1);

    tmp = state->_py_long_bit_length(d, NULL);
    if (tmp == NULL) {
        Ty_DECREF(n_d);
        return NULL;
    }
    k = TyLong_AsSsize_t(tmp);
    Ty_DECREF(tmp);
    if (k == -1 && TyErr_Occurred()) {
        Ty_DECREF(n_d);
        return NULL;
    }
    k--;

    dec = PyDecType_FromLongExact(type, n, context);
    Ty_DECREF(n_d);
    if (dec == NULL) {
        return NULL;
    }

    d1 = mpd_qnew();
    if (d1 == NULL) {
        Ty_DECREF(dec);
        TyErr_NoMemory();
        return NULL;
    }
    d2 = mpd_qnew();
    if (d2 == NULL) {
        mpd_del(d1);
        Ty_DECREF(dec);
        TyErr_NoMemory();
        return NULL;
    }

    mpd_maxcontext(&maxctx);
    mpd_qset_uint(d1, 5, &maxctx, &status);
    mpd_qset_ssize(d2, k, &maxctx, &status);
    mpd_qpow(d1, d1, d2, &maxctx, &status);
    if (dec_addstatus(context, status)) {
        mpd_del(d1);
        mpd_del(d2);
        Ty_DECREF(dec);
        return NULL;
    }

    /* result = n * 5**k */
    mpd_qmul(MPD(dec), MPD(dec), d1, &maxctx, &status);
    mpd_del(d1);
    mpd_del(d2);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }
    /* result = +- n * 5**k * 10**-k */
    mpd_set_sign(MPD(dec), sign);
    MPD(dec)->exp = -k;

    return dec;
}

static TyObject *
PyDecType_FromFloat(TyTypeObject *type, TyObject *v,
                    TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;

    dec = PyDecType_FromFloatExact(type, v, context);
    if (dec == NULL) {
        return NULL;
    }

    mpd_qfinalize(MPD(dec), CTX(context), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }

    return dec;
}

/* Return a new PyDecObject or a subtype from a Decimal. */
static TyObject *
PyDecType_FromDecimalExact(TyTypeObject *type, TyObject *v, TyObject *context)
{
    TyObject *dec;
    uint32_t status = 0;

    decimal_state *state = get_module_state_from_ctx(context);
    if (type == state->PyDec_Type && PyDec_CheckExact(state, v)) {
        return Ty_NewRef(v);
    }

    dec = PyDecType_New(state, type);
    if (dec == NULL) {
        return NULL;
    }

    mpd_qcopy(MPD(dec), MPD(v), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(dec);
        return NULL;
    }

    return dec;
}

static TyObject *
sequence_as_tuple(TyObject *v, TyObject *ex, const char *mesg)
{
    if (TyTuple_Check(v)) {
        return Ty_NewRef(v);
    }
    if (TyList_Check(v)) {
        return TyList_AsTuple(v);
    }

    TyErr_SetString(ex, mesg);
    return NULL;
}

/* Return a new C string representation of a DecimalTuple. */
static char *
dectuple_as_str(TyObject *dectuple)
{
    TyObject *digits = NULL, *tmp;
    char *decstring = NULL;
    char sign_special[6];
    char *cp;
    long sign, l;
    mpd_ssize_t exp = 0;
    Ty_ssize_t i, mem, tsize;
    int is_infinite = 0;
    int n;

    assert(TyTuple_Check(dectuple));

    if (TyTuple_Size(dectuple) != 3) {
        TyErr_SetString(TyExc_ValueError,
            "argument must be a sequence of length 3");
        goto error;
    }

    /* sign */
    tmp = TyTuple_GET_ITEM(dectuple, 0);
    if (!TyLong_Check(tmp)) {
        TyErr_SetString(TyExc_ValueError,
            "sign must be an integer with the value 0 or 1");
        goto error;
    }
    sign = TyLong_AsLong(tmp);
    if (sign == -1 && TyErr_Occurred()) {
        goto error;
    }
    if (sign != 0 && sign != 1) {
        TyErr_SetString(TyExc_ValueError,
            "sign must be an integer with the value 0 or 1");
        goto error;
    }
    sign_special[0] = sign ? '-' : '+';
    sign_special[1] = '\0';

    /* exponent or encoding for a special number */
    tmp = TyTuple_GET_ITEM(dectuple, 2);
    if (TyUnicode_Check(tmp)) {
        /* special */
        if (TyUnicode_CompareWithASCIIString(tmp, "F") == 0) {
            strcat(sign_special, "Inf");
            is_infinite = 1;
        }
        else if (TyUnicode_CompareWithASCIIString(tmp, "n") == 0) {
            strcat(sign_special, "NaN");
        }
        else if (TyUnicode_CompareWithASCIIString(tmp, "N") == 0) {
            strcat(sign_special, "sNaN");
        }
        else {
            TyErr_SetString(TyExc_ValueError,
                "string argument in the third position "
                "must be 'F', 'n' or 'N'");
            goto error;
        }
    }
    else {
        /* exponent */
        if (!TyLong_Check(tmp)) {
            TyErr_SetString(TyExc_ValueError,
                "exponent must be an integer");
            goto error;
        }
        exp = TyLong_AsSsize_t(tmp);
        if (exp == -1 && TyErr_Occurred()) {
            goto error;
        }
    }

    /* coefficient */
    digits = sequence_as_tuple(TyTuple_GET_ITEM(dectuple, 1), TyExc_ValueError,
                               "coefficient must be a tuple of digits");
    if (digits == NULL) {
        goto error;
    }

    tsize = TyTuple_Size(digits);
    /* [sign][coeffdigits+1][E][-][expdigits+1]['\0'] */
    mem = 1 + tsize + 3 + MPD_EXPDIGITS + 2;
    cp = decstring = TyMem_Malloc(mem);
    if (decstring == NULL) {
        TyErr_NoMemory();
        goto error;
    }

    n = snprintf(cp, mem, "%s", sign_special);
    if (n < 0 || n >= mem) {
        TyErr_SetString(TyExc_RuntimeError,
            "internal error in dec_sequence_as_str");
        goto error;
    }
    cp += n;

    if (tsize == 0 && sign_special[1] == '\0') {
        /* empty tuple: zero coefficient, except for special numbers */
        *cp++ = '0';
    }
    for (i = 0; i < tsize; i++) {
        tmp = TyTuple_GET_ITEM(digits, i);
        if (!TyLong_Check(tmp)) {
            TyErr_SetString(TyExc_ValueError,
                "coefficient must be a tuple of digits");
            goto error;
        }
        l = TyLong_AsLong(tmp);
        if (l == -1 && TyErr_Occurred()) {
            goto error;
        }
        if (l < 0 || l > 9) {
            TyErr_SetString(TyExc_ValueError,
                "coefficient must be a tuple of digits");
            goto error;
        }
        if (is_infinite) {
            /* accept but ignore any well-formed coefficient for compatibility
               with decimal.py */
            continue;
        }
        *cp++ = (char)l + '0';
    }
    *cp = '\0';

    if (sign_special[1] == '\0') {
        /* not a special number */
        *cp++ = 'E';
        n = snprintf(cp, MPD_EXPDIGITS+2, "%" PRI_mpd_ssize_t, exp);
        if (n < 0 || n >= MPD_EXPDIGITS+2) {
            TyErr_SetString(TyExc_RuntimeError,
                "internal error in dec_sequence_as_str");
            goto error;
        }
    }

    Ty_XDECREF(digits);
    return decstring;


error:
    Ty_XDECREF(digits);
    if (decstring) TyMem_Free(decstring);
    return NULL;
}

/* Currently accepts tuples and lists. */
static TyObject *
PyDecType_FromSequence(TyTypeObject *type, TyObject *v,
                       TyObject *context)
{
    TyObject *dectuple;
    TyObject *dec;
    char *s;

    dectuple = sequence_as_tuple(v, TyExc_TypeError,
                                 "argument must be a tuple or list");
    if (dectuple == NULL) {
        return NULL;
    }

    s = dectuple_as_str(dectuple);
    Ty_DECREF(dectuple);
    if (s == NULL) {
        return NULL;
    }

    dec = PyDecType_FromCString(type, s, context);

    TyMem_Free(s);
    return dec;
}

/* Currently accepts tuples and lists. */
static TyObject *
PyDecType_FromSequenceExact(TyTypeObject *type, TyObject *v,
                            TyObject *context)
{
    TyObject *dectuple;
    TyObject *dec;
    char *s;

    dectuple = sequence_as_tuple(v, TyExc_TypeError,
                   "argument must be a tuple or list");
    if (dectuple == NULL) {
        return NULL;
    }

    s = dectuple_as_str(dectuple);
    Ty_DECREF(dectuple);
    if (s == NULL) {
        return NULL;
    }

    dec = PyDecType_FromCStringExact(type, s, context);

    TyMem_Free(s);
    return dec;
}

#define PyDec_FromCString(st, str, context) \
        PyDecType_FromCString((st)->PyDec_Type, str, context)
#define PyDec_FromCStringExact(st, str, context) \
        PyDecType_FromCStringExact((st)->PyDec_Type, str, context)

#define PyDec_FromUnicode(st, unicode, context) \
        PyDecType_FromUnicode((st)->PyDec_Type, unicode, context)
#define PyDec_FromUnicodeExact(st, unicode, context) \
        PyDecType_FromUnicodeExact((st)->PyDec_Type, unicode, context)
#define PyDec_FromUnicodeExactWS(st, unicode, context) \
        PyDecType_FromUnicodeExactWS((st)->PyDec_Type, unicode, context)

#define PyDec_FromSsize(st, v, context) \
        PyDecType_FromSsize((st)->PyDec_Type, v, context)
#define PyDec_FromSsizeExact(st, v, context) \
        PyDecType_FromSsizeExact((st)->PyDec_Type, v, context)

#define PyDec_FromLong(st, pylong, context) \
        PyDecType_FromLong((st)->PyDec_Type, pylong, context)
#define PyDec_FromLongExact(st, pylong, context) \
        PyDecType_FromLongExact((st)->PyDec_Type, pylong, context)

#define PyDec_FromFloat(st, pyfloat, context) \
        PyDecType_FromFloat((st)->PyDec_Type, pyfloat, context)
#define PyDec_FromFloatExact(st, pyfloat, context) \
        PyDecType_FromFloatExact((st)->PyDec_Type, pyfloat, context)

#define PyDec_FromSequence(st, sequence, context) \
        PyDecType_FromSequence((st)->PyDec_Type, sequence, context)
#define PyDec_FromSequenceExact(st, sequence, context) \
        PyDecType_FromSequenceExact((st)->PyDec_Type, sequence, context)

/* class method */
static TyObject *
dec_from_float(TyObject *type, TyObject *pyfloat)
{
    TyObject *context;
    TyObject *result;

    decimal_state *state = get_module_state_by_def((TyTypeObject *)type);
    CURRENT_CONTEXT(state, context);
    result = PyDecType_FromFloatExact(state->PyDec_Type, pyfloat, context);
    if (type != (TyObject *)state->PyDec_Type && result != NULL) {
        Ty_SETREF(result, PyObject_CallFunctionObjArgs(type, result, NULL));
    }

    return result;
}

/* 'v' can have any numeric type accepted by the Decimal constructor. Attempt
   an exact conversion. If the result does not meet the restrictions
   for an mpd_t, fail with InvalidOperation. */
static TyObject *
PyDecType_FromNumberExact(TyTypeObject *type, TyObject *v, TyObject *context)
{
    decimal_state *state = get_module_state_by_def(type);
    assert(v != NULL);
    if (PyDec_Check(state, v)) {
        return PyDecType_FromDecimalExact(type, v, context);
    }
    else if (TyLong_Check(v)) {
        return PyDecType_FromLongExact(type, v, context);
    }
    else if (TyFloat_Check(v)) {
        if (dec_addstatus(context, MPD_Float_operation)) {
            return NULL;
        }
        return PyDecType_FromFloatExact(type, v, context);
    }
    else {
        TyErr_Format(TyExc_TypeError,
            "conversion from %s to Decimal is not supported",
            Ty_TYPE(v)->tp_name);
        return NULL;
    }
}

/* class method */
static TyObject *
dec_from_number(TyObject *type, TyObject *number)
{
    TyObject *context;
    TyObject *result;

    decimal_state *state = get_module_state_by_def((TyTypeObject *)type);
    CURRENT_CONTEXT(state, context);
    result = PyDecType_FromNumberExact(state->PyDec_Type, number, context);
    if (type != (TyObject *)state->PyDec_Type && result != NULL) {
        Ty_SETREF(result, PyObject_CallFunctionObjArgs(type, result, NULL));
    }

    return result;
}

/* create_decimal_from_float */
static TyObject *
ctx_from_float(TyObject *context, TyObject *v)
{
    decimal_state *state = get_module_state_from_ctx(context);
    return PyDec_FromFloat(state, v, context);
}

/* Apply the context to the input operand. Return a new PyDecObject. */
static TyObject *
dec_apply(TyObject *v, TyObject *context)
{
    TyObject *result;
    uint32_t status = 0;

    decimal_state *state = get_module_state_from_ctx(context);
    result = dec_alloc(state);
    if (result == NULL) {
        return NULL;
    }

    mpd_qcopy(MPD(result), MPD(v), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    mpd_qfinalize(MPD(result), CTX(context), &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

/* 'v' can have any type accepted by the Decimal constructor. Attempt
   an exact conversion. If the result does not meet the restrictions
   for an mpd_t, fail with InvalidOperation. */
static TyObject *
PyDecType_FromObjectExact(TyTypeObject *type, TyObject *v, TyObject *context)
{
    decimal_state *state = get_module_state_from_ctx(context);
    if (v == NULL) {
        return PyDecType_FromSsizeExact(type, 0, context);
    }
    else if (PyDec_Check(state, v)) {
        return PyDecType_FromDecimalExact(type, v, context);
    }
    else if (TyUnicode_Check(v)) {
        return PyDecType_FromUnicodeExactWS(type, v, context);
    }
    else if (TyLong_Check(v)) {
        return PyDecType_FromLongExact(type, v, context);
    }
    else if (TyTuple_Check(v) || TyList_Check(v)) {
        return PyDecType_FromSequenceExact(type, v, context);
    }
    else if (TyFloat_Check(v)) {
        if (dec_addstatus(context, MPD_Float_operation)) {
            return NULL;
        }
        return PyDecType_FromFloatExact(type, v, context);
    }
    else {
        TyErr_Format(TyExc_TypeError,
            "conversion from %s to Decimal is not supported",
            Ty_TYPE(v)->tp_name);
        return NULL;
    }
}

/* The context is used during conversion. This function is the
   equivalent of context.create_decimal(). */
static TyObject *
PyDec_FromObject(TyObject *v, TyObject *context)
{
    decimal_state *state = get_module_state_from_ctx(context);
    if (v == NULL) {
        return PyDec_FromSsize(state, 0, context);
    }
    else if (PyDec_Check(state, v)) {
        mpd_context_t *ctx = CTX(context);
        if (mpd_isnan(MPD(v)) &&
            MPD(v)->digits > ctx->prec - ctx->clamp) {
            /* Special case: too many NaN payload digits */
            TyObject *result;
            if (dec_addstatus(context, MPD_Conversion_syntax)) {
                return NULL;
            }
            result = dec_alloc(state);
            if (result == NULL) {
                return NULL;
            }
            mpd_setspecial(MPD(result), MPD_POS, MPD_NAN);
            return result;
        }
        return dec_apply(v, context);
    }
    else if (TyUnicode_Check(v)) {
        return PyDec_FromUnicode(state, v, context);
    }
    else if (TyLong_Check(v)) {
        return PyDec_FromLong(state, v, context);
    }
    else if (TyTuple_Check(v) || TyList_Check(v)) {
        return PyDec_FromSequence(state, v, context);
    }
    else if (TyFloat_Check(v)) {
        if (dec_addstatus(context, MPD_Float_operation)) {
            return NULL;
        }
        return PyDec_FromFloat(state, v, context);
    }
    else {
        TyErr_Format(TyExc_TypeError,
            "conversion from %s to Decimal is not supported",
            Ty_TYPE(v)->tp_name);
        return NULL;
    }
}

static TyObject *
dec_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"value", "context", NULL};
    TyObject *v = NULL;
    TyObject *context = Ty_None;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|OO", kwlist,
                                     &v, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(type);
    CONTEXT_CHECK_VA(state, context);

    return PyDecType_FromObjectExact(type, v, context);
}

static TyObject *
ctx_create_decimal(TyObject *context, TyObject *args)
{
    TyObject *v = NULL;

    if (!TyArg_ParseTuple(args, "|O", &v)) {
        return NULL;
    }

    return PyDec_FromObject(v, context);
}


/******************************************************************************/
/*                        Implicit conversions to Decimal                     */
/******************************************************************************/

/* Try to convert TyObject v to a new PyDecObject conv. If the conversion
   fails, set conv to NULL (exception is set). If the conversion is not
   implemented, set conv to Ty_NotImplemented. */
#define NOT_IMPL 0
#define TYPE_ERR 1
Ty_LOCAL_INLINE(int)
convert_op(int type_err, TyObject **conv, TyObject *v, TyObject *context)
{
    decimal_state *state = get_module_state_from_ctx(context);
    if (PyDec_Check(state, v)) {
        *conv = Ty_NewRef(v);
        return 1;
    }
    if (TyLong_Check(v)) {
        *conv = PyDec_FromLongExact(state, v, context);
        if (*conv == NULL) {
            return 0;
        }
        return 1;
    }

    if (type_err) {
        TyErr_Format(TyExc_TypeError,
            "conversion from %s to Decimal is not supported",
            Ty_TYPE(v)->tp_name);
    }
    else {
        *conv = Ty_NewRef(Ty_NotImplemented);
    }
    return 0;
}

/* Return NotImplemented for unsupported types. */
#define CONVERT_OP(a, v, context) \
    if (!convert_op(NOT_IMPL, a, v, context)) { \
        return *(a);                            \
    }

#define CONVERT_BINOP(a, b, v, w, context) \
    if (!convert_op(NOT_IMPL, a, v, context)) { \
        return *(a);                            \
    }                                           \
    if (!convert_op(NOT_IMPL, b, w, context)) { \
        Ty_DECREF(*(a));                        \
        return *(b);                            \
    }

#define CONVERT_TERNOP(a, b, c, v, w, x, context) \
    if (!convert_op(NOT_IMPL, a, v, context)) {   \
        return *(a);                              \
    }                                             \
    if (!convert_op(NOT_IMPL, b, w, context)) {   \
        Ty_DECREF(*(a));                          \
        return *(b);                              \
    }                                             \
    if (!convert_op(NOT_IMPL, c, x, context)) {   \
        Ty_DECREF(*(a));                          \
        Ty_DECREF(*(b));                          \
        return *(c);                              \
    }

/* Raise TypeError for unsupported types. */
#define CONVERT_OP_RAISE(a, v, context) \
    if (!convert_op(TYPE_ERR, a, v, context)) { \
        return NULL;                            \
    }

#define CONVERT_BINOP_RAISE(a, b, v, w, context) \
    if (!convert_op(TYPE_ERR, a, v, context)) {  \
        return NULL;                             \
    }                                            \
    if (!convert_op(TYPE_ERR, b, w, context)) {  \
        Ty_DECREF(*(a));                         \
        return NULL;                             \
    }

#define CONVERT_TERNOP_RAISE(a, b, c, v, w, x, context) \
    if (!convert_op(TYPE_ERR, a, v, context)) {         \
        return NULL;                                    \
    }                                                   \
    if (!convert_op(TYPE_ERR, b, w, context)) {         \
        Ty_DECREF(*(a));                                \
        return NULL;                                    \
    }                                                   \
    if (!convert_op(TYPE_ERR, c, x, context)) {         \
        Ty_DECREF(*(a));                                \
        Ty_DECREF(*(b));                                \
        return NULL;                                    \
    }


/******************************************************************************/
/*              Implicit conversions to Decimal for comparison                */
/******************************************************************************/

static TyObject *
multiply_by_denominator(TyObject *v, TyObject *r, TyObject *context)
{
    TyObject *result;
    TyObject *tmp = NULL;
    TyObject *denom = NULL;
    uint32_t status = 0;
    mpd_context_t maxctx;
    mpd_ssize_t exp;
    mpd_t *vv;

    /* v is not special, r is a rational */
    tmp = PyObject_GetAttrString(r, "denominator");
    if (tmp == NULL) {
        return NULL;
    }
    decimal_state *state = get_module_state_from_ctx(context);
    denom = PyDec_FromLongExact(state, tmp, context);
    Ty_DECREF(tmp);
    if (denom == NULL) {
        return NULL;
    }

    vv = mpd_qncopy(MPD(v));
    if (vv == NULL) {
        Ty_DECREF(denom);
        TyErr_NoMemory();
        return NULL;
    }
    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(denom);
        mpd_del(vv);
        return NULL;
    }

    mpd_maxcontext(&maxctx);
    /* Prevent Overflow in the following multiplication. The result of
       the multiplication is only used in mpd_qcmp, which can handle
       values that are technically out of bounds, like (for 32-bit)
       99999999999999999999...99999999e+425000000. */
    exp = vv->exp;
    vv->exp = 0;
    mpd_qmul(MPD(result), vv, MPD(denom), &maxctx, &status);
    MPD(result)->exp = exp;

    Ty_DECREF(denom);
    mpd_del(vv);
    /* If any status has been accumulated during the multiplication,
       the result is invalid. This is very unlikely, since even the
       32-bit version supports 425000000 digits. */
    if (status) {
        TyErr_SetString(TyExc_ValueError,
            "exact conversion for comparison failed");
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject *
numerator_as_decimal(TyObject *r, TyObject *context)
{
    TyObject *tmp, *num;

    tmp = PyObject_GetAttrString(r, "numerator");
    if (tmp == NULL) {
        return NULL;
    }

    decimal_state *state = get_module_state_from_ctx(context);
    num = PyDec_FromLongExact(state, tmp, context);
    Ty_DECREF(tmp);
    return num;
}

/* Convert v and w for comparison. v is a Decimal. If w is a Rational, both
   v and w have to be transformed. Return 1 for success, with new references
   to the converted objects in vcmp and wcmp. Return 0 for failure. In that
   case wcmp is either NULL or Ty_NotImplemented (new reference) and vcmp
   is undefined. */
static int
convert_op_cmp(TyObject **vcmp, TyObject **wcmp, TyObject *v, TyObject *w,
               int op, TyObject *context)
{
    mpd_context_t *ctx = CTX(context);

    *vcmp = v;

    decimal_state *state = get_module_state_from_ctx(context);
    if (PyDec_Check(state, w)) {
        *wcmp = Ty_NewRef(w);
    }
    else if (TyLong_Check(w)) {
        *wcmp = PyDec_FromLongExact(state, w, context);
    }
    else if (TyFloat_Check(w)) {
        if (op != Py_EQ && op != Py_NE &&
            dec_addstatus(context, MPD_Float_operation)) {
            *wcmp = NULL;
        }
        else {
            ctx->status |= MPD_Float_operation;
            *wcmp = PyDec_FromFloatExact(state, w, context);
        }
    }
    else if (TyComplex_Check(w) && (op == Py_EQ || op == Py_NE)) {
        Ty_complex c = TyComplex_AsCComplex(w);
        if (c.real == -1.0 && TyErr_Occurred()) {
            *wcmp = NULL;
        }
        else if (c.imag == 0.0) {
            TyObject *tmp = TyFloat_FromDouble(c.real);
            if (tmp == NULL) {
                *wcmp = NULL;
            }
            else {
                ctx->status |= MPD_Float_operation;
                *wcmp = PyDec_FromFloatExact(state, tmp, context);
                Ty_DECREF(tmp);
            }
        }
        else {
            *wcmp = Ty_NewRef(Ty_NotImplemented);
        }
    }
    else {
        int is_rational = PyObject_IsInstance(w, state->Rational);
        if (is_rational < 0) {
            *wcmp = NULL;
        }
        else if (is_rational > 0) {
            *wcmp = numerator_as_decimal(w, context);
            if (*wcmp && !mpd_isspecial(MPD(v))) {
                *vcmp = multiply_by_denominator(v, w, context);
                if (*vcmp == NULL) {
                    Ty_CLEAR(*wcmp);
                }
            }
        }
        else {
            *wcmp = Ty_NewRef(Ty_NotImplemented);
        }
    }

    if (*wcmp == NULL || *wcmp == Ty_NotImplemented) {
        return 0;
    }
    if (*vcmp == v) {
        Ty_INCREF(v);
    }
    return 1;
}

#define CONVERT_BINOP_CMP(vcmp, wcmp, v, w, op, ctx) \
    if (!convert_op_cmp(vcmp, wcmp, v, w, op, ctx)) {  \
        return *(wcmp);                                \
    }                                                  \


/******************************************************************************/
/*                          Conversions from decimal                          */
/******************************************************************************/

static TyObject *
unicode_fromascii(const char *s, Ty_ssize_t size)
{
    TyObject *res;

    res = TyUnicode_New(size, 127);
    if (res == NULL) {
        return NULL;
    }

    memcpy(TyUnicode_1BYTE_DATA(res), s, size);
    return res;
}

/* PyDecObject as a string. The default module context is only used for
   the value of 'capitals'. */
static TyObject *
dec_str(TyObject *dec)
{
    TyObject *res, *context;
    mpd_ssize_t size;
    char *cp;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CURRENT_CONTEXT(state, context);
    size = mpd_to_sci_size(&cp, MPD(dec), CtxCaps(context));
    if (size < 0) {
        TyErr_NoMemory();
        return NULL;
    }

    res = unicode_fromascii(cp, size);
    mpd_free(cp);
    return res;
}

/* Representation of a PyDecObject. */
static TyObject *
dec_repr(TyObject *dec)
{
    TyObject *res, *context;
    char *cp;
    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CURRENT_CONTEXT(state, context);
    cp = mpd_to_sci(MPD(dec), CtxCaps(context));
    if (cp == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    res = TyUnicode_FromFormat("Decimal('%s')", cp);
    mpd_free(cp);
    return res;
}

/* Return a duplicate of src, copy embedded null characters. */
static char *
dec_strdup(const char *src, Ty_ssize_t size)
{
    char *dest = TyMem_Malloc(size+1);
    if (dest == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    memcpy(dest, src, size);
    dest[size] = '\0';
    return dest;
}

static void
dec_replace_fillchar(char *dest)
{
     while (*dest != '\0') {
         if (*dest == '\xff') *dest = '\0';
         dest++;
     }
}

/* Convert decimal_point or thousands_sep, which may be multibyte or in
   the range [128, 255], to a UTF8 string. */
static TyObject *
dotsep_as_utf8(const char *s)
{
    TyObject *utf8;
    TyObject *tmp;
    wchar_t buf[2];
    size_t n;

    n = mbstowcs(buf, s, 2);
    if (n != 1) { /* Issue #7442 */
        TyErr_SetString(TyExc_ValueError,
            "invalid decimal point or unsupported "
            "combination of LC_CTYPE and LC_NUMERIC");
        return NULL;
    }
    tmp = TyUnicode_FromWideChar(buf, n);
    if (tmp == NULL) {
        return NULL;
    }
    utf8 = TyUnicode_AsUTF8String(tmp);
    Ty_DECREF(tmp);
    return utf8;
}

static int
dict_get_item_string(TyObject *dict, const char *key, TyObject **valueobj, const char **valuestr)
{
    *valueobj = NULL;
    TyObject *keyobj = TyUnicode_FromString(key);
    if (keyobj == NULL) {
        return -1;
    }
    TyObject *value = TyDict_GetItemWithError(dict, keyobj);
    Ty_DECREF(keyobj);
    if (value == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    value = TyUnicode_AsUTF8String(value);
    if (value == NULL) {
        return -1;
    }
    *valueobj = value;
    *valuestr = TyBytes_AS_STRING(value);
    return 0;
}

/*
 * Fallback _pydecimal formatting for new format specifiers that mpdecimal does
 * not yet support. As documented, libmpdec follows the PEP-3101 format language:
 * https://www.bytereef.org/mpdecimal/doc/libmpdec/assign-convert.html#to-string
 */
static TyObject *
pydec_format(TyObject *dec, TyObject *context, TyObject *fmt, decimal_state *state)
{
    TyObject *result;
    TyObject *pydec;
    TyObject *u;

    if (state->PyDecimal == NULL) {
        state->PyDecimal = TyImport_ImportModuleAttrString("_pydecimal", "Decimal");
        if (state->PyDecimal == NULL) {
            return NULL;
        }
    }

    u = dec_str(dec);
    if (u == NULL) {
        return NULL;
    }

    pydec = PyObject_CallOneArg(state->PyDecimal, u);
    Ty_DECREF(u);
    if (pydec == NULL) {
        return NULL;
    }

    result = PyObject_CallMethod(pydec, "__format__", "(OO)", fmt, context);
    Ty_DECREF(pydec);

    if (result == NULL && TyErr_ExceptionMatches(TyExc_ValueError)) {
        /* Do not confuse users with the _pydecimal exception */
        TyErr_Clear();
        TyErr_SetString(TyExc_ValueError, "invalid format string");
    }

    return result;
}

/* Formatted representation of a PyDecObject. */
static TyObject *
dec_format(TyObject *dec, TyObject *args)
{
    TyObject *result = NULL;
    TyObject *override = NULL;
    TyObject *dot = NULL;
    TyObject *sep = NULL;
    TyObject *grouping = NULL;
    TyObject *fmtarg;
    TyObject *context;
    mpd_spec_t spec;
    char *fmt;
    char *decstring = NULL;
    uint32_t status = 0;
    int replace_fillchar = 0;
    Ty_ssize_t size;


    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CURRENT_CONTEXT(state, context);
    if (!TyArg_ParseTuple(args, "O|O", &fmtarg, &override)) {
        return NULL;
    }

    if (TyUnicode_Check(fmtarg)) {
        fmt = (char *)TyUnicode_AsUTF8AndSize(fmtarg, &size);
        if (fmt == NULL) {
            return NULL;
        }

        if (size > 0 && fmt[size-1] == 'N') {
            if (TyErr_WarnEx(TyExc_DeprecationWarning,
                             "Format specifier 'N' is deprecated", 1) < 0) {
                return NULL;
            }
        }

        if (size > 0 && fmt[0] == '\0') {
            /* NUL fill character: must be replaced with a valid UTF-8 char
               before calling mpd_parse_fmt_str(). */
            replace_fillchar = 1;
            fmt = dec_strdup(fmt, size);
            if (fmt == NULL) {
                return NULL;
            }
            fmt[0] = '_';
        }
    }
    else {
        TyErr_SetString(TyExc_TypeError,
            "format arg must be str");
        return NULL;
    }

    if (!mpd_parse_fmt_str(&spec, fmt, CtxCaps(context))) {
        if (replace_fillchar) {
            TyMem_Free(fmt);
        }

        return pydec_format(dec, context, fmtarg, state);
    }

    if (replace_fillchar) {
        /* In order to avoid clobbering parts of UTF-8 thousands separators or
           decimal points when the substitution is reversed later, the actual
           placeholder must be an invalid UTF-8 byte. */
        spec.fill[0] = '\xff';
        spec.fill[1] = '\0';
    }

    if (override) {
        /* Values for decimal_point, thousands_sep and grouping can
           be explicitly specified in the override dict. These values
           take precedence over the values obtained from localeconv()
           in mpd_parse_fmt_str(). The feature is not documented and
           is only used in test_decimal. */
        if (!TyDict_Check(override)) {
            TyErr_SetString(TyExc_TypeError,
                "optional argument must be a dict");
            goto finish;
        }
        if (dict_get_item_string(override, "decimal_point", &dot, &spec.dot) ||
            dict_get_item_string(override, "thousands_sep", &sep, &spec.sep) ||
            dict_get_item_string(override, "grouping", &grouping, &spec.grouping))
        {
            goto finish;
        }
        if (mpd_validate_lconv(&spec) < 0) {
            TyErr_SetString(TyExc_ValueError,
                "invalid override dict");
            goto finish;
        }
    }
    else {
        size_t n = strlen(spec.dot);
        if (n > 1 || (n == 1 && !isascii((unsigned char)spec.dot[0]))) {
            /* fix locale dependent non-ascii characters */
            dot = dotsep_as_utf8(spec.dot);
            if (dot == NULL) {
                goto finish;
            }
            spec.dot = TyBytes_AS_STRING(dot);
        }
        n = strlen(spec.sep);
        if (n > 1 || (n == 1 && !isascii((unsigned char)spec.sep[0]))) {
            /* fix locale dependent non-ascii characters */
            sep = dotsep_as_utf8(spec.sep);
            if (sep == NULL) {
                goto finish;
            }
            spec.sep = TyBytes_AS_STRING(sep);
        }
    }


    decstring = mpd_qformat_spec(MPD(dec), &spec, CTX(context), &status);
    if (decstring == NULL) {
        if (status & MPD_Malloc_error) {
            TyErr_NoMemory();
        }
        else {
            TyErr_SetString(TyExc_ValueError,
                "format specification exceeds internal limits of _decimal");
        }
        goto finish;
    }
    size = strlen(decstring);
    if (replace_fillchar) {
        dec_replace_fillchar(decstring);
    }

    result = TyUnicode_DecodeUTF8(decstring, size, NULL);


finish:
    Ty_XDECREF(grouping);
    Ty_XDECREF(sep);
    Ty_XDECREF(dot);
    if (replace_fillchar) TyMem_Free(fmt);
    if (decstring) mpd_free(decstring);
    return result;
}

/* Return a PyLongObject from a PyDecObject, using the specified rounding
 * mode. The context precision is not observed. */
static TyObject *
dec_as_long(TyObject *dec, TyObject *context, int round)
{
    if (mpd_isspecial(MPD(dec))) {
        if (mpd_isnan(MPD(dec))) {
            TyErr_SetString(TyExc_ValueError,
                "cannot convert NaN to integer");
        }
        else {
            TyErr_SetString(TyExc_OverflowError,
                "cannot convert Infinity to integer");
        }
        return NULL;
    }

    mpd_t *x = mpd_qnew();

    if (x == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    mpd_context_t workctx = *CTX(context);
    uint32_t status = 0;

    workctx.round = round;
    mpd_qround_to_int(x, MPD(dec), &workctx, &status);
    if (dec_addstatus(context, status)) {
        mpd_del(x);
        return NULL;
    }

    status = 0;
    int64_t val = mpd_qget_i64(x, &status);

    if (!status) {
        mpd_del(x);
        return TyLong_FromInt64(val);
    }
    assert(!mpd_iszero(x));

    const PyLongLayout *layout = TyLong_GetNativeLayout();

    assert(layout->bits_per_digit < 32);
    assert(layout->digits_order == -1);
    assert(layout->digit_endianness == (PY_LITTLE_ENDIAN ? -1 : 1));
    assert(layout->digit_size == 2 || layout->digit_size == 4);

    uint32_t base = (uint32_t)1 << layout->bits_per_digit;
    /* We use a temporary buffer for digits for now, as for nonzero rdata
       mpd_qexport_u32/u16() require either space "allocated by one of
       libmpdec’s allocation functions" or "rlen MUST be correct" (to avoid
       reallocation).  This can be further optimized by using rlen from
       mpd_sizeinbase().  See gh-127925. */
    void *tmp_digits = NULL;
    size_t n;

    status = 0;
    if (layout->digit_size == 4) {
        n = mpd_qexport_u32((uint32_t **)&tmp_digits, 0, base, x, &status);
    }
    else {
        n = mpd_qexport_u16((uint16_t **)&tmp_digits, 0, base, x, &status);
    }

    if (n == SIZE_MAX) {
        TyErr_NoMemory();
        mpd_del(x);
        mpd_free(tmp_digits);
        return NULL;
    }

    void *digits;
    PyLongWriter *writer = PyLongWriter_Create(mpd_isnegative(x), n, &digits);

    mpd_del(x);
    if (writer == NULL) {
        mpd_free(tmp_digits);
        return NULL;
    }
    memcpy(digits, tmp_digits, layout->digit_size*n);
    mpd_free(tmp_digits);
    return PyLongWriter_Finish(writer);
}

/* Convert a Decimal to its exact integer ratio representation. */
static TyObject *
dec_as_integer_ratio(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *numerator = NULL;
    TyObject *denominator = NULL;
    TyObject *exponent = NULL;
    TyObject *result = NULL;
    TyObject *tmp;
    mpd_ssize_t exp;
    TyObject *context;
    uint32_t status = 0;

    if (mpd_isspecial(MPD(self))) {
        if (mpd_isnan(MPD(self))) {
            TyErr_SetString(TyExc_ValueError,
                "cannot convert NaN to integer ratio");
        }
        else {
            TyErr_SetString(TyExc_OverflowError,
                "cannot convert Infinity to integer ratio");
        }
        return NULL;
    }

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CURRENT_CONTEXT(state, context);

    tmp = dec_alloc(state);
    if (tmp == NULL) {
        return NULL;
    }

    if (!mpd_qcopy(MPD(tmp), MPD(self), &status)) {
        Ty_DECREF(tmp);
        TyErr_NoMemory();
        return NULL;
    }

    exp = mpd_iszero(MPD(tmp)) ? 0 : MPD(tmp)->exp;
    MPD(tmp)->exp = 0;

    /* context and rounding are unused here: the conversion is exact */
    numerator = dec_as_long(tmp, context, MPD_ROUND_FLOOR);
    Ty_DECREF(tmp);
    if (numerator == NULL) {
        goto error;
    }

    exponent = TyLong_FromSsize_t(exp < 0 ? -exp : exp);
    if (exponent == NULL) {
        goto error;
    }

    tmp = TyLong_FromLong(10);
    if (tmp == NULL) {
        goto error;
    }

    Ty_SETREF(exponent, state->_py_long_power(tmp, exponent, Ty_None));
    Ty_DECREF(tmp);
    if (exponent == NULL) {
        goto error;
    }

    if (exp >= 0) {
        Ty_SETREF(numerator, state->_py_long_multiply(numerator, exponent));
        if (numerator == NULL) {
            goto error;
        }
        denominator = TyLong_FromLong(1);
        if (denominator == NULL) {
            goto error;
        }
    }
    else {
        denominator = exponent;
        exponent = NULL;
        tmp = _TyLong_GCD(numerator, denominator);
        if (tmp == NULL) {
            goto error;
        }
        Ty_SETREF(numerator, state->_py_long_floor_divide(numerator, tmp));
        if (numerator == NULL) {
            Ty_DECREF(tmp);
            goto error;
        }
        Ty_SETREF(denominator, state->_py_long_floor_divide(denominator, tmp));
        Ty_DECREF(tmp);
        if (denominator == NULL) {
            goto error;
        }
    }

    result = TyTuple_Pack(2, numerator, denominator);


error:
    Ty_XDECREF(exponent);
    Ty_XDECREF(denominator);
    Ty_XDECREF(numerator);
    return result;
}

static TyObject *
PyDec_ToIntegralValue(TyObject *dec, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"rounding", "context", NULL};
    TyObject *result;
    TyObject *rounding = Ty_None;
    TyObject *context = Ty_None;
    uint32_t status = 0;
    mpd_context_t workctx;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|OO", kwlist,
                                     &rounding, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CONTEXT_CHECK_VA(state, context);

    workctx = *CTX(context);
    if (rounding != Ty_None) {
        int round = getround(state, rounding);
        if (round < 0) {
            return NULL;
        }
        if (!mpd_qsetround(&workctx, round)) {
            INTERNAL_ERROR_PTR("PyDec_ToIntegralValue"); /* GCOV_NOT_REACHED */
        }
    }

    result = dec_alloc(state);
    if (result == NULL) {
        return NULL;
    }

    mpd_qround_to_int(MPD(result), MPD(dec), &workctx, &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject *
PyDec_ToIntegralExact(TyObject *dec, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"rounding", "context", NULL};
    TyObject *result;
    TyObject *rounding = Ty_None;
    TyObject *context = Ty_None;
    uint32_t status = 0;
    mpd_context_t workctx;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|OO", kwlist,
                                     &rounding, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CONTEXT_CHECK_VA(state, context);

    workctx = *CTX(context);
    if (rounding != Ty_None) {
        int round = getround(state, rounding);
        if (round < 0) {
            return NULL;
        }
        if (!mpd_qsetround(&workctx, round)) {
            INTERNAL_ERROR_PTR("PyDec_ToIntegralExact"); /* GCOV_NOT_REACHED */
        }
    }

    result = dec_alloc(state);
    if (result == NULL) {
        return NULL;
    }

    mpd_qround_to_intx(MPD(result), MPD(dec), &workctx, &status);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject *
PyDec_AsFloat(TyObject *dec)
{
    TyObject *f, *s;

    if (mpd_isnan(MPD(dec))) {
        if (mpd_issnan(MPD(dec))) {
            TyErr_SetString(TyExc_ValueError,
                "cannot convert signaling NaN to float");
            return NULL;
        }
        if (mpd_isnegative(MPD(dec))) {
            s = TyUnicode_FromString("-nan");
        }
        else {
            s = TyUnicode_FromString("nan");
        }
    }
    else {
        s = dec_str(dec);
    }

    if (s == NULL) {
        return NULL;
    }

    f = TyFloat_FromString(s);
    Ty_DECREF(s);

    return f;
}

static TyObject *
PyDec_Round(TyObject *dec, TyObject *args)
{
    TyObject *result;
    TyObject *x = NULL;
    uint32_t status = 0;
    TyObject *context;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CURRENT_CONTEXT(state, context);
    if (!TyArg_ParseTuple(args, "|O", &x)) {
        return NULL;
    }

    if (x) {
        mpd_uint_t dq[1] = {1};
        mpd_t q = {MPD_STATIC|MPD_CONST_DATA,0,1,1,1,dq};
        mpd_ssize_t y;

        if (!TyLong_Check(x)) {
            TyErr_SetString(TyExc_TypeError,
                "optional arg must be an integer");
            return NULL;
        }

        y = TyLong_AsSsize_t(x);
        if (y == -1 && TyErr_Occurred()) {
            return NULL;
        }
        result = dec_alloc(state);
        if (result == NULL) {
            return NULL;
        }

        q.exp = (y == MPD_SSIZE_MIN) ? MPD_SSIZE_MAX : -y;
        mpd_qquantize(MPD(result), MPD(dec), &q, CTX(context), &status);
        if (dec_addstatus(context, status)) {
            Ty_DECREF(result);
            return NULL;
        }

        return result;
    }
    else {
        return dec_as_long(dec, context, MPD_ROUND_HALF_EVEN);
    }
}

/* Return the DecimalTuple representation of a PyDecObject. */
static TyObject *
PyDec_AsTuple(TyObject *dec, TyObject *Py_UNUSED(dummy))
{
    TyObject *result = NULL;
    TyObject *sign = NULL;
    TyObject *coeff = NULL;
    TyObject *expt = NULL;
    TyObject *tmp = NULL;
    mpd_t *x = NULL;
    char *intstring = NULL;
    Ty_ssize_t intlen, i;


    x = mpd_qncopy(MPD(dec));
    if (x == NULL) {
        TyErr_NoMemory();
        goto out;
    }

    sign = TyLong_FromUnsignedLong(mpd_sign(MPD(dec)));
    if (sign == NULL) {
        goto out;
    }

    if (mpd_isinfinite(x)) {
        expt = TyUnicode_FromString("F");
        if (expt == NULL) {
            goto out;
        }
        /* decimal.py has non-compliant infinity payloads. */
        coeff = Ty_BuildValue("(i)", 0);
        if (coeff == NULL) {
            goto out;
        }
    }
    else {
        if (mpd_isnan(x)) {
            expt = TyUnicode_FromString(mpd_isqnan(x)?"n":"N");
        }
        else {
            expt = TyLong_FromSsize_t(MPD(dec)->exp);
        }
        if (expt == NULL) {
            goto out;
        }

        /* coefficient is defined */
        if (x->len > 0) {

            /* make an integer */
            x->exp = 0;
            /* clear NaN and sign */
            mpd_clear_flags(x);
            intstring = mpd_to_sci(x, 1);
            if (intstring == NULL) {
                TyErr_NoMemory();
                goto out;
            }

            intlen = strlen(intstring);
            coeff = TyTuple_New(intlen);
            if (coeff == NULL) {
                goto out;
            }

            for (i = 0; i < intlen; i++) {
                tmp = TyLong_FromLong(intstring[i]-'0');
                if (tmp == NULL) {
                    goto out;
                }
                TyTuple_SET_ITEM(coeff, i, tmp);
            }
        }
        else {
            coeff = TyTuple_New(0);
            if (coeff == NULL) {
                goto out;
            }
        }
    }

    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    result = PyObject_CallFunctionObjArgs((TyObject *)state->DecimalTuple,
                                          sign, coeff, expt, NULL);

out:
    if (x) mpd_del(x);
    if (intstring) mpd_free(intstring);
    Ty_XDECREF(sign);
    Ty_XDECREF(coeff);
    Ty_XDECREF(expt);
    return result;
}


/******************************************************************************/
/*         Macros for converting mpdecimal functions to Decimal methods       */
/******************************************************************************/

/* Unary number method that uses the default module context. */
#define Dec_UnaryNumberMethod(MPDFUNC) \
static TyObject *                                           \
nm_##MPDFUNC(TyObject *self)                                \
{                                                           \
    TyObject *result;                                       \
    TyObject *context;                                      \
    uint32_t status = 0;                                    \
                                                            \
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));   \
    CURRENT_CONTEXT(state, context);                        \
    if ((result = dec_alloc(state)) == NULL) {              \
        return NULL;                                        \
    }                                                       \
                                                            \
    MPDFUNC(MPD(result), MPD(self), CTX(context), &status); \
    if (dec_addstatus(context, status)) {                   \
        Ty_DECREF(result);                                  \
        return NULL;                                        \
    }                                                       \
                                                            \
    return result;                                          \
}

/* Binary number method that uses default module context. */
#define Dec_BinaryNumberMethod(MPDFUNC) \
static TyObject *                                                \
nm_##MPDFUNC(TyObject *self, TyObject *other)                    \
{                                                                \
    TyObject *a, *b;                                             \
    TyObject *result;                                            \
    TyObject *context;                                           \
    uint32_t status = 0;                                         \
                                                                 \
    decimal_state *state = find_state_left_or_right(self, other);  \
    CURRENT_CONTEXT(state, context) ;                            \
    CONVERT_BINOP(&a, &b, self, other, context);                 \
                                                                 \
    if ((result = dec_alloc(state)) == NULL) {                   \
        Ty_DECREF(a);                                            \
        Ty_DECREF(b);                                            \
        return NULL;                                             \
    }                                                            \
                                                                 \
    MPDFUNC(MPD(result), MPD(a), MPD(b), CTX(context), &status); \
    Ty_DECREF(a);                                                \
    Ty_DECREF(b);                                                \
    if (dec_addstatus(context, status)) {                        \
        Ty_DECREF(result);                                       \
        return NULL;                                             \
    }                                                            \
                                                                 \
    return result;                                               \
}

/* Boolean function without a context arg. */
#define Dec_BoolFunc(MPDFUNC) \
static TyObject *                                           \
dec_##MPDFUNC(TyObject *self, TyObject *Py_UNUSED(dummy))   \
{                                                           \
    return MPDFUNC(MPD(self)) ? incr_true() : incr_false(); \
}

/* Boolean function with an optional context arg. */
#define Dec_BoolFuncVA(MPDFUNC) \
static TyObject *                                                         \
dec_##MPDFUNC(TyObject *self, TyObject *args, TyObject *kwds)             \
{                                                                         \
    static char *kwlist[] = {"context", NULL};                            \
    TyObject *context = Ty_None;                                          \
                                                                          \
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|O", kwlist,            \
                                     &context)) {                         \
        return NULL;                                                      \
    }                                                                     \
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));        \
    CONTEXT_CHECK_VA(state, context);                                     \
                                                                          \
    return MPDFUNC(MPD(self), CTX(context)) ? incr_true() : incr_false(); \
}

/* Unary function with an optional context arg. */
#define Dec_UnaryFuncVA(MPDFUNC) \
static TyObject *                                              \
dec_##MPDFUNC(TyObject *self, TyObject *args, TyObject *kwds)  \
{                                                              \
    static char *kwlist[] = {"context", NULL};                 \
    TyObject *result;                                          \
    TyObject *context = Ty_None;                               \
    uint32_t status = 0;                                       \
                                                               \
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|O", kwlist, \
                                     &context)) {              \
        return NULL;                                           \
    }                                                          \
    decimal_state *state =                                     \
        get_module_state_by_def(Ty_TYPE(self));                \
    CONTEXT_CHECK_VA(state, context);                          \
                                                               \
    if ((result = dec_alloc(state)) == NULL) {                 \
        return NULL;                                           \
    }                                                          \
                                                               \
    MPDFUNC(MPD(result), MPD(self), CTX(context), &status);    \
    if (dec_addstatus(context, status)) {                      \
        Ty_DECREF(result);                                     \
        return NULL;                                           \
    }                                                          \
                                                               \
    return result;                                             \
}

/* Binary function with an optional context arg. */
#define Dec_BinaryFuncVA(MPDFUNC) \
static TyObject *                                                \
dec_##MPDFUNC(TyObject *self, TyObject *args, TyObject *kwds)    \
{                                                                \
    static char *kwlist[] = {"other", "context", NULL};          \
    TyObject *other;                                             \
    TyObject *a, *b;                                             \
    TyObject *result;                                            \
    TyObject *context = Ty_None;                                 \
    uint32_t status = 0;                                         \
                                                                 \
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|O", kwlist,  \
                                     &other, &context)) {        \
        return NULL;                                             \
    }                                                            \
    decimal_state *state =                                       \
        get_module_state_by_def(Ty_TYPE(self));                  \
    CONTEXT_CHECK_VA(state, context);                            \
    CONVERT_BINOP_RAISE(&a, &b, self, other, context);           \
                                                                 \
    if ((result = dec_alloc(state)) == NULL) {                   \
        Ty_DECREF(a);                                            \
        Ty_DECREF(b);                                            \
        return NULL;                                             \
    }                                                            \
                                                                 \
    MPDFUNC(MPD(result), MPD(a), MPD(b), CTX(context), &status); \
    Ty_DECREF(a);                                                \
    Ty_DECREF(b);                                                \
    if (dec_addstatus(context, status)) {                        \
        Ty_DECREF(result);                                       \
        return NULL;                                             \
    }                                                            \
                                                                 \
    return result;                                               \
}

/* Binary function with an optional context arg. Actual MPDFUNC does
   NOT take a context. The context is used to record InvalidOperation
   if the second operand cannot be converted exactly. */
#define Dec_BinaryFuncVA_NO_CTX(MPDFUNC) \
static TyObject *                                               \
dec_##MPDFUNC(TyObject *self, TyObject *args, TyObject *kwds)   \
{                                                               \
    static char *kwlist[] = {"other", "context", NULL};         \
    TyObject *context = Ty_None;                                \
    TyObject *other;                                            \
    TyObject *a, *b;                                            \
    TyObject *result;                                           \
                                                                \
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|O", kwlist, \
                                     &other, &context)) {       \
        return NULL;                                            \
    }                                                           \
    decimal_state *state =                                      \
        get_module_state_by_def(Ty_TYPE(self));                 \
    CONTEXT_CHECK_VA(state, context);                           \
    CONVERT_BINOP_RAISE(&a, &b, self, other, context);          \
                                                                \
    if ((result = dec_alloc(state)) == NULL) {                  \
        Ty_DECREF(a);                                           \
        Ty_DECREF(b);                                           \
        return NULL;                                            \
    }                                                           \
                                                                \
    MPDFUNC(MPD(result), MPD(a), MPD(b));                       \
    Ty_DECREF(a);                                               \
    Ty_DECREF(b);                                               \
                                                                \
    return result;                                              \
}

/* Ternary function with an optional context arg. */
#define Dec_TernaryFuncVA(MPDFUNC) \
static TyObject *                                                        \
dec_##MPDFUNC(TyObject *self, TyObject *args, TyObject *kwds)            \
{                                                                        \
    static char *kwlist[] = {"other", "third", "context", NULL};         \
    TyObject *other, *third;                                             \
    TyObject *a, *b, *c;                                                 \
    TyObject *result;                                                    \
    TyObject *context = Ty_None;                                         \
    uint32_t status = 0;                                                 \
                                                                         \
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "OO|O", kwlist,         \
                                     &other, &third, &context)) {        \
        return NULL;                                                     \
    }                                                                    \
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));       \
    CONTEXT_CHECK_VA(state, context);                                    \
    CONVERT_TERNOP_RAISE(&a, &b, &c, self, other, third, context);       \
                                                                         \
    if ((result = dec_alloc(state)) == NULL) {                           \
        Ty_DECREF(a);                                                    \
        Ty_DECREF(b);                                                    \
        Ty_DECREF(c);                                                    \
        return NULL;                                                     \
    }                                                                    \
                                                                         \
    MPDFUNC(MPD(result), MPD(a), MPD(b), MPD(c), CTX(context), &status); \
    Ty_DECREF(a);                                                        \
    Ty_DECREF(b);                                                        \
    Ty_DECREF(c);                                                        \
    if (dec_addstatus(context, status)) {                                \
        Ty_DECREF(result);                                               \
        return NULL;                                                     \
    }                                                                    \
                                                                         \
    return result;                                                       \
}


/**********************************************/
/*              Number methods                */
/**********************************************/

Dec_UnaryNumberMethod(mpd_qminus)
Dec_UnaryNumberMethod(mpd_qplus)
Dec_UnaryNumberMethod(mpd_qabs)

Dec_BinaryNumberMethod(mpd_qadd)
Dec_BinaryNumberMethod(mpd_qsub)
Dec_BinaryNumberMethod(mpd_qmul)
Dec_BinaryNumberMethod(mpd_qdiv)
Dec_BinaryNumberMethod(mpd_qrem)
Dec_BinaryNumberMethod(mpd_qdivint)

static TyObject *
nm_dec_as_long(TyObject *dec)
{
    TyObject *context;
    decimal_state *state = get_module_state_by_def(Ty_TYPE(dec));
    CURRENT_CONTEXT(state, context);
    return dec_as_long(dec, context, MPD_ROUND_DOWN);
}

static int
nm_nonzero(TyObject *v)
{
    return !mpd_iszero(MPD(v));
}

static TyObject *
nm_mpd_qdivmod(TyObject *v, TyObject *w)
{
    TyObject *a, *b;
    TyObject *q, *r;
    TyObject *context;
    uint32_t status = 0;
    TyObject *ret;

    decimal_state *state = find_state_left_or_right(v, w);
    CURRENT_CONTEXT(state, context);
    CONVERT_BINOP(&a, &b, v, w, context);

    q = dec_alloc(state);
    if (q == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }
    r = dec_alloc(state);
    if (r == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        Ty_DECREF(q);
        return NULL;
    }

    mpd_qdivmod(MPD(q), MPD(r), MPD(a), MPD(b), CTX(context), &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(r);
        Ty_DECREF(q);
        return NULL;
    }

    ret = TyTuple_Pack(2, q, r);
    Ty_DECREF(r);
    Ty_DECREF(q);
    return ret;
}

static TyObject *
nm_mpd_qpow(TyObject *base, TyObject *exp, TyObject *mod)
{
    TyObject *a, *b, *c = NULL;
    TyObject *result;
    TyObject *context;
    uint32_t status = 0;

    decimal_state *state = find_state_ternary(base, exp, mod);
    CURRENT_CONTEXT(state, context);
    CONVERT_BINOP(&a, &b, base, exp, context);

    if (mod != Ty_None) {
        if (!convert_op(NOT_IMPL, &c, mod, context)) {
            Ty_DECREF(a);
            Ty_DECREF(b);
            return c;
        }
    }

    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        Ty_XDECREF(c);
        return NULL;
    }

    if (c == NULL) {
        mpd_qpow(MPD(result), MPD(a), MPD(b),
                 CTX(context), &status);
    }
    else {
        mpd_qpowmod(MPD(result), MPD(a), MPD(b), MPD(c),
                    CTX(context), &status);
        Ty_DECREF(c);
    }
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}


/******************************************************************************/
/*                             Decimal Methods                                */
/******************************************************************************/

/* Unary arithmetic functions, optional context arg */
Dec_UnaryFuncVA(mpd_qexp)
Dec_UnaryFuncVA(mpd_qln)
Dec_UnaryFuncVA(mpd_qlog10)
Dec_UnaryFuncVA(mpd_qnext_minus)
Dec_UnaryFuncVA(mpd_qnext_plus)
Dec_UnaryFuncVA(mpd_qreduce)
Dec_UnaryFuncVA(mpd_qsqrt)

/* Binary arithmetic functions, optional context arg */
Dec_BinaryFuncVA(mpd_qcompare)
Dec_BinaryFuncVA(mpd_qcompare_signal)
Dec_BinaryFuncVA(mpd_qmax)
Dec_BinaryFuncVA(mpd_qmax_mag)
Dec_BinaryFuncVA(mpd_qmin)
Dec_BinaryFuncVA(mpd_qmin_mag)
Dec_BinaryFuncVA(mpd_qnext_toward)
Dec_BinaryFuncVA(mpd_qrem_near)

/* Ternary arithmetic functions, optional context arg */
Dec_TernaryFuncVA(mpd_qfma)

/* Boolean functions, no context arg */
Dec_BoolFunc(mpd_iscanonical)
Dec_BoolFunc(mpd_isfinite)
Dec_BoolFunc(mpd_isinfinite)
Dec_BoolFunc(mpd_isnan)
Dec_BoolFunc(mpd_isqnan)
Dec_BoolFunc(mpd_issnan)
Dec_BoolFunc(mpd_issigned)
Dec_BoolFunc(mpd_iszero)

/* Boolean functions, optional context arg */
Dec_BoolFuncVA(mpd_isnormal)
Dec_BoolFuncVA(mpd_issubnormal)

/* Unary functions, no context arg */
static TyObject *
dec_mpd_adjexp(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    mpd_ssize_t retval;

    if (mpd_isspecial(MPD(self))) {
        retval = 0;
    }
    else {
        retval = mpd_adjexp(MPD(self));
    }

    return TyLong_FromSsize_t(retval);
}

static TyObject *
dec_canonical(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return Ty_NewRef(self);
}

static TyObject *
dec_conjugate(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return Ty_NewRef(self);
}

static inline TyObject *
_dec_mpd_radix(decimal_state *state)
{
    TyObject *result;

    result = dec_alloc(state);
    if (result == NULL) {
        return NULL;
    }

    _dec_settriple(result, MPD_POS, 10, 0);
    return result;
}

static TyObject *
dec_mpd_radix(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    return _dec_mpd_radix(state);
}

static TyObject *
dec_mpd_qcopy_abs(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *result;
    uint32_t status = 0;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    if ((result = dec_alloc(state)) == NULL) {
        return NULL;
    }

    mpd_qcopy_abs(MPD(result), MPD(self), &status);
    if (status & MPD_Malloc_error) {
        Ty_DECREF(result);
        TyErr_NoMemory();
        return NULL;
    }

    return result;
}

static TyObject *
dec_mpd_qcopy_negate(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *result;
    uint32_t status = 0;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    if ((result = dec_alloc(state)) == NULL) {
        return NULL;
    }

    mpd_qcopy_negate(MPD(result), MPD(self), &status);
    if (status & MPD_Malloc_error) {
        Ty_DECREF(result);
        TyErr_NoMemory();
        return NULL;
    }

    return result;
}

/* Unary functions, optional context arg */
Dec_UnaryFuncVA(mpd_qinvert)
Dec_UnaryFuncVA(mpd_qlogb)

static TyObject *
dec_mpd_class(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"context", NULL};
    TyObject *context = Ty_None;
    const char *cp;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|O", kwlist,
                                     &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CONTEXT_CHECK_VA(state, context);

    cp = mpd_class(MPD(self), CTX(context));
    return TyUnicode_FromString(cp);
}

static TyObject *
dec_mpd_to_eng(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"context", NULL};
    TyObject *result;
    TyObject *context = Ty_None;
    mpd_ssize_t size;
    char *s;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|O", kwlist,
                                     &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CONTEXT_CHECK_VA(state, context);

    size = mpd_to_eng_size(&s, MPD(self), CtxCaps(context));
    if (size < 0) {
        TyErr_NoMemory();
        return NULL;
    }

    result = unicode_fromascii(s, size);
    mpd_free(s);

    return result;
}

/* Binary functions, optional context arg for conversion errors */
Dec_BinaryFuncVA_NO_CTX(mpd_compare_total)
Dec_BinaryFuncVA_NO_CTX(mpd_compare_total_mag)

static TyObject *
dec_mpd_qcopy_sign(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"other", "context", NULL};
    TyObject *other;
    TyObject *a, *b;
    TyObject *result;
    TyObject *context = Ty_None;
    uint32_t status = 0;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|O", kwlist,
                                     &other, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CONTEXT_CHECK_VA(state, context);
    CONVERT_BINOP_RAISE(&a, &b, self, other, context);

    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }

    mpd_qcopy_sign(MPD(result), MPD(a), MPD(b), &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject *
dec_mpd_same_quantum(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"other", "context", NULL};
    TyObject *other;
    TyObject *a, *b;
    TyObject *result;
    TyObject *context = Ty_None;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|O", kwlist,
                                     &other, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CONTEXT_CHECK_VA(state, context);
    CONVERT_BINOP_RAISE(&a, &b, self, other, context);

    result = mpd_same_quantum(MPD(a), MPD(b)) ? incr_true() : incr_false();
    Ty_DECREF(a);
    Ty_DECREF(b);

    return result;
}

/* Binary functions, optional context arg */
Dec_BinaryFuncVA(mpd_qand)
Dec_BinaryFuncVA(mpd_qor)
Dec_BinaryFuncVA(mpd_qxor)

Dec_BinaryFuncVA(mpd_qrotate)
Dec_BinaryFuncVA(mpd_qscaleb)
Dec_BinaryFuncVA(mpd_qshift)

static TyObject *
dec_mpd_qquantize(TyObject *v, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"exp", "rounding", "context", NULL};
    TyObject *rounding = Ty_None;
    TyObject *context = Ty_None;
    TyObject *w, *a, *b;
    TyObject *result;
    uint32_t status = 0;
    mpd_context_t workctx;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O|OO", kwlist,
                                     &w, &rounding, &context)) {
        return NULL;
    }
    decimal_state *state = get_module_state_by_def(Ty_TYPE(v));
    CONTEXT_CHECK_VA(state, context);

    workctx = *CTX(context);
    if (rounding != Ty_None) {
        int round = getround(state, rounding);
        if (round < 0) {
            return NULL;
        }
        if (!mpd_qsetround(&workctx, round)) {
            INTERNAL_ERROR_PTR("dec_mpd_qquantize"); /* GCOV_NOT_REACHED */
        }
    }

    CONVERT_BINOP_RAISE(&a, &b, v, w, context);

    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }

    mpd_qquantize(MPD(result), MPD(a), MPD(b), &workctx, &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

/* Special methods */
static TyObject *
dec_richcompare(TyObject *v, TyObject *w, int op)
{
    TyObject *a;
    TyObject *b;
    TyObject *context;
    uint32_t status = 0;
    int a_issnan, b_issnan;
    int r;
    decimal_state *state = find_state_left_or_right(v, w);

#ifdef Ty_DEBUG
    assert(PyDec_Check(state, v));
#endif
    CURRENT_CONTEXT(state, context);
    CONVERT_BINOP_CMP(&a, &b, v, w, op, context);

    a_issnan = mpd_issnan(MPD(a));
    b_issnan = mpd_issnan(MPD(b));

    r = mpd_qcmp(MPD(a), MPD(b), &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (r == INT_MAX) {
        /* sNaNs or op={le,ge,lt,gt} always signal. */
        if (a_issnan || b_issnan || (op != Py_EQ && op != Py_NE)) {
            if (dec_addstatus(context, status)) {
                return NULL;
            }
        }
        /* qNaN comparison with op={eq,ne} or comparison
         * with InvalidOperation disabled. */
        return (op == Py_NE) ? incr_true() : incr_false();
    }

    switch (op) {
    case Py_EQ:
        r = (r == 0);
        break;
    case Py_NE:
        r = (r != 0);
        break;
    case Py_LE:
        r = (r <= 0);
        break;
    case Py_GE:
        r = (r >= 0);
        break;
    case Py_LT:
        r = (r == -1);
        break;
    case Py_GT:
        r = (r == 1);
        break;
    }

    return TyBool_FromLong(r);
}

/* __ceil__ */
static TyObject *
dec_ceil(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *context;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CURRENT_CONTEXT(state, context);
    return dec_as_long(self, context, MPD_ROUND_CEILING);
}

/* __complex__ */
static TyObject *
dec_complex(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *f;
    double x;

    f = PyDec_AsFloat(self);
    if (f == NULL) {
        return NULL;
    }

    x = TyFloat_AsDouble(f);
    Ty_DECREF(f);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }

    return TyComplex_FromDoubles(x, 0);
}

/* __copy__ (METH_NOARGS) and __deepcopy__ (METH_O) */
static TyObject *
dec_copy(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return Ty_NewRef(self);
}

/* __floor__ */
static TyObject *
dec_floor(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *context;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CURRENT_CONTEXT(state, context);
    return dec_as_long(self, context, MPD_ROUND_FLOOR);
}

/* Always uses the module context */
static Ty_hash_t
_dec_hash(PyDecObject *v)
{
#if defined(CONFIG_64) && _PyHASH_BITS == 61
    /* 2**61 - 1 */
    mpd_uint_t p_data[1] = {2305843009213693951ULL};
    mpd_t p = {MPD_POS|MPD_STATIC|MPD_CONST_DATA, 0, 19, 1, 1, p_data};
    /* Inverse of 10 modulo p */
    mpd_uint_t inv10_p_data[1] = {2075258708292324556ULL};
    mpd_t inv10_p = {MPD_POS|MPD_STATIC|MPD_CONST_DATA,
                     0, 19, 1, 1, inv10_p_data};
#elif defined(CONFIG_32) && _PyHASH_BITS == 31
    /* 2**31 - 1 */
    mpd_uint_t p_data[2] = {147483647UL, 2};
    mpd_t p = {MPD_POS|MPD_STATIC|MPD_CONST_DATA, 0, 10, 2, 2, p_data};
    /* Inverse of 10 modulo p */
    mpd_uint_t inv10_p_data[2] = {503238553UL, 1};
    mpd_t inv10_p = {MPD_POS|MPD_STATIC|MPD_CONST_DATA,
                     0, 10, 2, 2, inv10_p_data};
#else
    #error "No valid combination of CONFIG_64, CONFIG_32 and _PyHASH_BITS"
#endif
    const Ty_hash_t py_hash_inf = 314159;
    mpd_uint_t ten_data[1] = {10};
    mpd_t ten = {MPD_POS|MPD_STATIC|MPD_CONST_DATA,
                 0, 2, 1, 1, ten_data};
    Ty_hash_t result;
    mpd_t *exp_hash = NULL;
    mpd_t *tmp = NULL;
    mpd_ssize_t exp;
    uint32_t status = 0;
    mpd_context_t maxctx;


    if (mpd_isspecial(MPD(v))) {
        if (mpd_issnan(MPD(v))) {
            TyErr_SetString(TyExc_TypeError,
                "Cannot hash a signaling NaN value");
            return -1;
        }
        else if (mpd_isnan(MPD(v))) {
            return PyObject_GenericHash((TyObject *)v);
        }
        else {
            return py_hash_inf * mpd_arith_sign(MPD(v));
        }
    }

    mpd_maxcontext(&maxctx);
    exp_hash = mpd_qnew();
    if (exp_hash == NULL) {
        goto malloc_error;
    }
    tmp = mpd_qnew();
    if (tmp == NULL) {
        goto malloc_error;
    }

    /*
     * exp(v): exponent of v
     * int(v): coefficient of v
     */
    exp = MPD(v)->exp;
    if (exp >= 0) {
        /* 10**exp(v) % p */
        mpd_qsset_ssize(tmp, exp, &maxctx, &status);
        mpd_qpowmod(exp_hash, &ten, tmp, &p, &maxctx, &status);
    }
    else {
        /* inv10_p**(-exp(v)) % p */
        mpd_qsset_ssize(tmp, -exp, &maxctx, &status);
        mpd_qpowmod(exp_hash, &inv10_p, tmp, &p, &maxctx, &status);
    }

    /* hash = (int(v) * exp_hash) % p */
    if (!mpd_qcopy(tmp, MPD(v), &status)) {
        goto malloc_error;
    }
    tmp->exp = 0;
    mpd_set_positive(tmp);

    maxctx.prec = MPD_MAX_PREC + 21;
    maxctx.emax = MPD_MAX_EMAX + 21;
    maxctx.emin = MPD_MIN_EMIN - 21;

    mpd_qmul(tmp, tmp, exp_hash, &maxctx, &status);
    mpd_qrem(tmp, tmp, &p, &maxctx, &status);

    result = mpd_qget_ssize(tmp, &status);
    result = mpd_ispositive(MPD(v)) ? result : -result;
    result = (result == -1) ? -2 : result;

    if (status != 0) {
        if (status & MPD_Malloc_error) {
            goto malloc_error;
        }
        else {
            TyErr_SetString(TyExc_RuntimeError, /* GCOV_NOT_REACHED */
                "dec_hash: internal error: please report"); /* GCOV_NOT_REACHED */
        }
        result = -1; /* GCOV_NOT_REACHED */
    }


finish:
    if (exp_hash) mpd_del(exp_hash);
    if (tmp) mpd_del(tmp);
    return result;

malloc_error:
    TyErr_NoMemory();
    result = -1;
    goto finish;
}

static Ty_hash_t
dec_hash(TyObject *op)
{
    PyDecObject *self = _PyDecObject_CAST(op);
    if (self->hash == -1) {
        self->hash = _dec_hash(self);
    }

    return self->hash;
}

/* __reduce__ */
static TyObject *
dec_reduce(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *result, *str;

    str = dec_str(self);
    if (str == NULL) {
        return NULL;
    }

    result = Ty_BuildValue("O(O)", Ty_TYPE(self), str);
    Ty_DECREF(str);

    return result;
}

/* __sizeof__ */
static TyObject *
dec_sizeof(TyObject *v, TyObject *Py_UNUSED(dummy))
{
    size_t res = _TyObject_SIZE(Ty_TYPE(v));
    if (mpd_isdynamic_data(MPD(v))) {
        res += (size_t)MPD(v)->alloc * sizeof(mpd_uint_t);
    }
    return TyLong_FromSize_t(res);
}

/* __trunc__ */
static TyObject *
dec_trunc(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    TyObject *context;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    CURRENT_CONTEXT(state, context);
    return dec_as_long(self, context, MPD_ROUND_DOWN);
}

/* real and imag */
static TyObject *
dec_real(TyObject *self, void *Py_UNUSED(closure))
{
    return Ty_NewRef(self);
}

static TyObject *
dec_imag(TyObject *self, void *Py_UNUSED(closure))
{
    TyObject *result;

    decimal_state *state = get_module_state_by_def(Ty_TYPE(self));
    result = dec_alloc(state);
    if (result == NULL) {
        return NULL;
    }

    _dec_settriple(result, MPD_POS, 0, 0);
    return result;
}


static TyGetSetDef dec_getsets [] =
{
  { "real", dec_real, NULL, NULL, NULL},
  { "imag", dec_imag, NULL, NULL, NULL},
  {NULL}
};

static TyMethodDef dec_methods [] =
{
  /* Unary arithmetic functions, optional context arg */
  { "exp", _PyCFunction_CAST(dec_mpd_qexp), METH_VARARGS|METH_KEYWORDS, doc_exp },
  { "ln", _PyCFunction_CAST(dec_mpd_qln), METH_VARARGS|METH_KEYWORDS, doc_ln },
  { "log10", _PyCFunction_CAST(dec_mpd_qlog10), METH_VARARGS|METH_KEYWORDS, doc_log10 },
  { "next_minus", _PyCFunction_CAST(dec_mpd_qnext_minus), METH_VARARGS|METH_KEYWORDS, doc_next_minus },
  { "next_plus", _PyCFunction_CAST(dec_mpd_qnext_plus), METH_VARARGS|METH_KEYWORDS, doc_next_plus },
  { "normalize", _PyCFunction_CAST(dec_mpd_qreduce), METH_VARARGS|METH_KEYWORDS, doc_normalize },
  { "to_integral", _PyCFunction_CAST(PyDec_ToIntegralValue), METH_VARARGS|METH_KEYWORDS, doc_to_integral },
  { "to_integral_exact", _PyCFunction_CAST(PyDec_ToIntegralExact), METH_VARARGS|METH_KEYWORDS, doc_to_integral_exact },
  { "to_integral_value", _PyCFunction_CAST(PyDec_ToIntegralValue), METH_VARARGS|METH_KEYWORDS, doc_to_integral_value },
  { "sqrt", _PyCFunction_CAST(dec_mpd_qsqrt), METH_VARARGS|METH_KEYWORDS, doc_sqrt },

  /* Binary arithmetic functions, optional context arg */
  { "compare", _PyCFunction_CAST(dec_mpd_qcompare), METH_VARARGS|METH_KEYWORDS, doc_compare },
  { "compare_signal", _PyCFunction_CAST(dec_mpd_qcompare_signal), METH_VARARGS|METH_KEYWORDS, doc_compare_signal },
  { "max", _PyCFunction_CAST(dec_mpd_qmax), METH_VARARGS|METH_KEYWORDS, doc_max },
  { "max_mag", _PyCFunction_CAST(dec_mpd_qmax_mag), METH_VARARGS|METH_KEYWORDS, doc_max_mag },
  { "min", _PyCFunction_CAST(dec_mpd_qmin), METH_VARARGS|METH_KEYWORDS, doc_min },
  { "min_mag", _PyCFunction_CAST(dec_mpd_qmin_mag), METH_VARARGS|METH_KEYWORDS, doc_min_mag },
  { "next_toward", _PyCFunction_CAST(dec_mpd_qnext_toward), METH_VARARGS|METH_KEYWORDS, doc_next_toward },
  { "quantize", _PyCFunction_CAST(dec_mpd_qquantize), METH_VARARGS|METH_KEYWORDS, doc_quantize },
  { "remainder_near", _PyCFunction_CAST(dec_mpd_qrem_near), METH_VARARGS|METH_KEYWORDS, doc_remainder_near },

  /* Ternary arithmetic functions, optional context arg */
  { "fma", _PyCFunction_CAST(dec_mpd_qfma), METH_VARARGS|METH_KEYWORDS, doc_fma },

  /* Boolean functions, no context arg */
  { "is_canonical", dec_mpd_iscanonical, METH_NOARGS, doc_is_canonical },
  { "is_finite", dec_mpd_isfinite, METH_NOARGS, doc_is_finite },
  { "is_infinite", dec_mpd_isinfinite, METH_NOARGS, doc_is_infinite },
  { "is_nan", dec_mpd_isnan, METH_NOARGS, doc_is_nan },
  { "is_qnan", dec_mpd_isqnan, METH_NOARGS, doc_is_qnan },
  { "is_snan", dec_mpd_issnan, METH_NOARGS, doc_is_snan },
  { "is_signed", dec_mpd_issigned, METH_NOARGS, doc_is_signed },
  { "is_zero", dec_mpd_iszero, METH_NOARGS, doc_is_zero },

  /* Boolean functions, optional context arg */
  { "is_normal", _PyCFunction_CAST(dec_mpd_isnormal), METH_VARARGS|METH_KEYWORDS, doc_is_normal },
  { "is_subnormal", _PyCFunction_CAST(dec_mpd_issubnormal), METH_VARARGS|METH_KEYWORDS, doc_is_subnormal },

  /* Unary functions, no context arg */
  { "adjusted", dec_mpd_adjexp, METH_NOARGS, doc_adjusted },
  { "canonical", dec_canonical, METH_NOARGS, doc_canonical },
  { "conjugate", dec_conjugate, METH_NOARGS, doc_conjugate },
  { "radix", dec_mpd_radix, METH_NOARGS, doc_radix },

  /* Unary functions, optional context arg for conversion errors */
  { "copy_abs", dec_mpd_qcopy_abs, METH_NOARGS, doc_copy_abs },
  { "copy_negate", dec_mpd_qcopy_negate, METH_NOARGS, doc_copy_negate },

  /* Unary functions, optional context arg */
  { "logb", _PyCFunction_CAST(dec_mpd_qlogb), METH_VARARGS|METH_KEYWORDS, doc_logb },
  { "logical_invert", _PyCFunction_CAST(dec_mpd_qinvert), METH_VARARGS|METH_KEYWORDS, doc_logical_invert },
  { "number_class", _PyCFunction_CAST(dec_mpd_class), METH_VARARGS|METH_KEYWORDS, doc_number_class },
  { "to_eng_string", _PyCFunction_CAST(dec_mpd_to_eng), METH_VARARGS|METH_KEYWORDS, doc_to_eng_string },

  /* Binary functions, optional context arg for conversion errors */
  { "compare_total", _PyCFunction_CAST(dec_mpd_compare_total), METH_VARARGS|METH_KEYWORDS, doc_compare_total },
  { "compare_total_mag", _PyCFunction_CAST(dec_mpd_compare_total_mag), METH_VARARGS|METH_KEYWORDS, doc_compare_total_mag },
  { "copy_sign", _PyCFunction_CAST(dec_mpd_qcopy_sign), METH_VARARGS|METH_KEYWORDS, doc_copy_sign },
  { "same_quantum", _PyCFunction_CAST(dec_mpd_same_quantum), METH_VARARGS|METH_KEYWORDS, doc_same_quantum },

  /* Binary functions, optional context arg */
  { "logical_and", _PyCFunction_CAST(dec_mpd_qand), METH_VARARGS|METH_KEYWORDS, doc_logical_and },
  { "logical_or", _PyCFunction_CAST(dec_mpd_qor), METH_VARARGS|METH_KEYWORDS, doc_logical_or },
  { "logical_xor", _PyCFunction_CAST(dec_mpd_qxor), METH_VARARGS|METH_KEYWORDS, doc_logical_xor },
  { "rotate", _PyCFunction_CAST(dec_mpd_qrotate), METH_VARARGS|METH_KEYWORDS, doc_rotate },
  { "scaleb", _PyCFunction_CAST(dec_mpd_qscaleb), METH_VARARGS|METH_KEYWORDS, doc_scaleb },
  { "shift", _PyCFunction_CAST(dec_mpd_qshift), METH_VARARGS|METH_KEYWORDS, doc_shift },

  /* Miscellaneous */
  { "from_float", dec_from_float, METH_O|METH_CLASS, doc_from_float },
  { "from_number", dec_from_number, METH_O|METH_CLASS, doc_from_number },
  { "as_tuple", PyDec_AsTuple, METH_NOARGS, doc_as_tuple },
  { "as_integer_ratio", dec_as_integer_ratio, METH_NOARGS, doc_as_integer_ratio },

  /* Special methods */
  { "__copy__", dec_copy, METH_NOARGS, NULL },
  { "__deepcopy__", dec_copy, METH_O, NULL },
  { "__format__", dec_format, METH_VARARGS, NULL },
  { "__reduce__", dec_reduce, METH_NOARGS, NULL },
  { "__round__", PyDec_Round, METH_VARARGS, NULL },
  { "__ceil__", dec_ceil, METH_NOARGS, NULL },
  { "__floor__", dec_floor, METH_NOARGS, NULL },
  { "__trunc__", dec_trunc, METH_NOARGS, NULL },
  { "__complex__", dec_complex, METH_NOARGS, NULL },
  { "__sizeof__", dec_sizeof, METH_NOARGS, NULL },

  { NULL, NULL, 1 }
};

static TyType_Slot dec_slots[] = {
    {Ty_tp_token, Ty_TP_USE_SPEC},
    {Ty_tp_dealloc, dec_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, dec_traverse},
    {Ty_tp_repr, dec_repr},
    {Ty_tp_hash, dec_hash},
    {Ty_tp_str, dec_str},
    {Ty_tp_doc, (void *)doc_decimal},
    {Ty_tp_richcompare, dec_richcompare},
    {Ty_tp_methods, dec_methods},
    {Ty_tp_getset, dec_getsets},
    {Ty_tp_new, dec_new},

    // Number protocol
    {Ty_nb_add, nm_mpd_qadd},
    {Ty_nb_subtract, nm_mpd_qsub},
    {Ty_nb_multiply, nm_mpd_qmul},
    {Ty_nb_remainder, nm_mpd_qrem},
    {Ty_nb_divmod, nm_mpd_qdivmod},
    {Ty_nb_power, nm_mpd_qpow},
    {Ty_nb_negative, nm_mpd_qminus},
    {Ty_nb_positive, nm_mpd_qplus},
    {Ty_nb_absolute, nm_mpd_qabs},
    {Ty_nb_bool, nm_nonzero},
    {Ty_nb_int, nm_dec_as_long},
    {Ty_nb_float, PyDec_AsFloat},
    {Ty_nb_floor_divide, nm_mpd_qdivint},
    {Ty_nb_true_divide, nm_mpd_qdiv},
    {0, NULL},
};


static TyType_Spec dec_spec = {
    .name = "decimal.Decimal",
    .basicsize = sizeof(PyDecObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = dec_slots,
};


/******************************************************************************/
/*                         Context Object, Part 2                             */
/******************************************************************************/


/************************************************************************/
/*     Macros for converting mpdecimal functions to Context methods     */
/************************************************************************/

/* Boolean context method. */
#define DecCtx_BoolFunc(MPDFUNC) \
static TyObject *                                                     \
ctx_##MPDFUNC(TyObject *context, TyObject *v)                         \
{                                                                     \
    TyObject *ret;                                                    \
    TyObject *a;                                                      \
                                                                      \
    CONVERT_OP_RAISE(&a, v, context);                                 \
                                                                      \
    ret = MPDFUNC(MPD(a), CTX(context)) ? incr_true() : incr_false(); \
    Ty_DECREF(a);                                                     \
    return ret;                                                       \
}

/* Boolean context method. MPDFUNC does NOT use a context. */
#define DecCtx_BoolFunc_NO_CTX(MPDFUNC) \
static TyObject *                                       \
ctx_##MPDFUNC(TyObject *context, TyObject *v)           \
{                                                       \
    TyObject *ret;                                      \
    TyObject *a;                                        \
                                                        \
    CONVERT_OP_RAISE(&a, v, context);                   \
                                                        \
    ret = MPDFUNC(MPD(a)) ? incr_true() : incr_false(); \
    Ty_DECREF(a);                                       \
    return ret;                                         \
}

/* Unary context method. */
#define DecCtx_UnaryFunc(MPDFUNC) \
static TyObject *                                        \
ctx_##MPDFUNC(TyObject *context, TyObject *v)            \
{                                                        \
    TyObject *result, *a;                                \
    uint32_t status = 0;                                 \
                                                         \
    CONVERT_OP_RAISE(&a, v, context);                    \
    decimal_state *state =                               \
        get_module_state_from_ctx(context);              \
    if ((result = dec_alloc(state)) == NULL) {           \
        Ty_DECREF(a);                                    \
        return NULL;                                     \
    }                                                    \
                                                         \
    MPDFUNC(MPD(result), MPD(a), CTX(context), &status); \
    Ty_DECREF(a);                                        \
    if (dec_addstatus(context, status)) {                \
        Ty_DECREF(result);                               \
        return NULL;                                     \
    }                                                    \
                                                         \
    return result;                                       \
}

/* Binary context method. */
#define DecCtx_BinaryFunc(MPDFUNC) \
static TyObject *                                                \
ctx_##MPDFUNC(TyObject *context, TyObject *args)                 \
{                                                                \
    TyObject *v, *w;                                             \
    TyObject *a, *b;                                             \
    TyObject *result;                                            \
    uint32_t status = 0;                                         \
                                                                 \
    if (!TyArg_ParseTuple(args, "OO", &v, &w)) {                 \
        return NULL;                                             \
    }                                                            \
                                                                 \
    CONVERT_BINOP_RAISE(&a, &b, v, w, context);                  \
    decimal_state *state =                                       \
        get_module_state_from_ctx(context);                      \
    if ((result = dec_alloc(state)) == NULL) {                   \
        Ty_DECREF(a);                                            \
        Ty_DECREF(b);                                            \
        return NULL;                                             \
    }                                                            \
                                                                 \
    MPDFUNC(MPD(result), MPD(a), MPD(b), CTX(context), &status); \
    Ty_DECREF(a);                                                \
    Ty_DECREF(b);                                                \
    if (dec_addstatus(context, status)) {                        \
        Ty_DECREF(result);                                       \
        return NULL;                                             \
    }                                                            \
                                                                 \
    return result;                                               \
}

/*
 * Binary context method. The context is only used for conversion.
 * The actual MPDFUNC does NOT take a context arg.
 */
#define DecCtx_BinaryFunc_NO_CTX(MPDFUNC) \
static TyObject *                                \
ctx_##MPDFUNC(TyObject *context, TyObject *args) \
{                                                \
    TyObject *v, *w;                             \
    TyObject *a, *b;                             \
    TyObject *result;                            \
                                                 \
    if (!TyArg_ParseTuple(args, "OO", &v, &w)) { \
        return NULL;                             \
    }                                            \
                                                 \
    CONVERT_BINOP_RAISE(&a, &b, v, w, context);  \
    decimal_state *state =                       \
        get_module_state_from_ctx(context);      \
    if ((result = dec_alloc(state)) == NULL) {   \
        Ty_DECREF(a);                            \
        Ty_DECREF(b);                            \
        return NULL;                             \
    }                                            \
                                                 \
    MPDFUNC(MPD(result), MPD(a), MPD(b));        \
    Ty_DECREF(a);                                \
    Ty_DECREF(b);                                \
                                                 \
    return result;                               \
}

/* Ternary context method. */
#define DecCtx_TernaryFunc(MPDFUNC) \
static TyObject *                                                        \
ctx_##MPDFUNC(TyObject *context, TyObject *args)                         \
{                                                                        \
    TyObject *v, *w, *x;                                                 \
    TyObject *a, *b, *c;                                                 \
    TyObject *result;                                                    \
    uint32_t status = 0;                                                 \
                                                                         \
    if (!TyArg_ParseTuple(args, "OOO", &v, &w, &x)) {                    \
        return NULL;                                                     \
    }                                                                    \
                                                                         \
    CONVERT_TERNOP_RAISE(&a, &b, &c, v, w, x, context);                  \
    decimal_state *state = get_module_state_from_ctx(context);           \
    if ((result = dec_alloc(state)) == NULL) {                           \
        Ty_DECREF(a);                                                    \
        Ty_DECREF(b);                                                    \
        Ty_DECREF(c);                                                    \
        return NULL;                                                     \
    }                                                                    \
                                                                         \
    MPDFUNC(MPD(result), MPD(a), MPD(b), MPD(c), CTX(context), &status); \
    Ty_DECREF(a);                                                        \
    Ty_DECREF(b);                                                        \
    Ty_DECREF(c);                                                        \
    if (dec_addstatus(context, status)) {                                \
        Ty_DECREF(result);                                               \
        return NULL;                                                     \
    }                                                                    \
                                                                         \
    return result;                                                       \
}


/* Unary arithmetic functions */
DecCtx_UnaryFunc(mpd_qabs)
DecCtx_UnaryFunc(mpd_qexp)
DecCtx_UnaryFunc(mpd_qln)
DecCtx_UnaryFunc(mpd_qlog10)
DecCtx_UnaryFunc(mpd_qminus)
DecCtx_UnaryFunc(mpd_qnext_minus)
DecCtx_UnaryFunc(mpd_qnext_plus)
DecCtx_UnaryFunc(mpd_qplus)
DecCtx_UnaryFunc(mpd_qreduce)
DecCtx_UnaryFunc(mpd_qround_to_int)
DecCtx_UnaryFunc(mpd_qround_to_intx)
DecCtx_UnaryFunc(mpd_qsqrt)

/* Binary arithmetic functions */
DecCtx_BinaryFunc(mpd_qadd)
DecCtx_BinaryFunc(mpd_qcompare)
DecCtx_BinaryFunc(mpd_qcompare_signal)
DecCtx_BinaryFunc(mpd_qdiv)
DecCtx_BinaryFunc(mpd_qdivint)
DecCtx_BinaryFunc(mpd_qmax)
DecCtx_BinaryFunc(mpd_qmax_mag)
DecCtx_BinaryFunc(mpd_qmin)
DecCtx_BinaryFunc(mpd_qmin_mag)
DecCtx_BinaryFunc(mpd_qmul)
DecCtx_BinaryFunc(mpd_qnext_toward)
DecCtx_BinaryFunc(mpd_qquantize)
DecCtx_BinaryFunc(mpd_qrem)
DecCtx_BinaryFunc(mpd_qrem_near)
DecCtx_BinaryFunc(mpd_qsub)

static TyObject *
ctx_mpd_qdivmod(TyObject *context, TyObject *args)
{
    TyObject *v, *w;
    TyObject *a, *b;
    TyObject *q, *r;
    uint32_t status = 0;
    TyObject *ret;

    if (!TyArg_ParseTuple(args, "OO", &v, &w)) {
        return NULL;
    }

    CONVERT_BINOP_RAISE(&a, &b, v, w, context);
    decimal_state *state = get_module_state_from_ctx(context);
    q = dec_alloc(state);
    if (q == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }
    r = dec_alloc(state);
    if (r == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        Ty_DECREF(q);
        return NULL;
    }

    mpd_qdivmod(MPD(q), MPD(r), MPD(a), MPD(b), CTX(context), &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(r);
        Ty_DECREF(q);
        return NULL;
    }

    ret = TyTuple_Pack(2, q, r);
    Ty_DECREF(r);
    Ty_DECREF(q);
    return ret;
}

/* Binary or ternary arithmetic functions */
static TyObject *
ctx_mpd_qpow(TyObject *context, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"a", "b", "modulo", NULL};
    TyObject *base, *exp, *mod = Ty_None;
    TyObject *a, *b, *c = NULL;
    TyObject *result;
    uint32_t status = 0;

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "OO|O", kwlist,
                                     &base, &exp, &mod)) {
        return NULL;
    }

    CONVERT_BINOP_RAISE(&a, &b, base, exp, context);

    if (mod != Ty_None) {
        if (!convert_op(TYPE_ERR, &c, mod, context)) {
            Ty_DECREF(a);
            Ty_DECREF(b);
            return c;
        }
    }

    decimal_state *state = get_module_state_from_ctx(context);
    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        Ty_XDECREF(c);
        return NULL;
    }

    if (c == NULL) {
        mpd_qpow(MPD(result), MPD(a), MPD(b),
                 CTX(context), &status);
    }
    else {
        mpd_qpowmod(MPD(result), MPD(a), MPD(b), MPD(c),
                    CTX(context), &status);
        Ty_DECREF(c);
    }
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

/* Ternary arithmetic functions */
DecCtx_TernaryFunc(mpd_qfma)

/* No argument */
static TyObject *
ctx_mpd_radix(TyObject *context, TyObject *dummy)
{
    decimal_state *state = get_module_state_from_ctx(context);
    return _dec_mpd_radix(state);
}

/* Boolean functions: single decimal argument */
DecCtx_BoolFunc(mpd_isnormal)
DecCtx_BoolFunc(mpd_issubnormal)
DecCtx_BoolFunc_NO_CTX(mpd_isfinite)
DecCtx_BoolFunc_NO_CTX(mpd_isinfinite)
DecCtx_BoolFunc_NO_CTX(mpd_isnan)
DecCtx_BoolFunc_NO_CTX(mpd_isqnan)
DecCtx_BoolFunc_NO_CTX(mpd_issigned)
DecCtx_BoolFunc_NO_CTX(mpd_issnan)
DecCtx_BoolFunc_NO_CTX(mpd_iszero)

static TyObject *
ctx_iscanonical(TyObject *context, TyObject *v)
{
    decimal_state *state = get_module_state_from_ctx(context);
    if (!PyDec_Check(state, v)) {
        TyErr_SetString(TyExc_TypeError,
            "argument must be a Decimal");
        return NULL;
    }

    return mpd_iscanonical(MPD(v)) ? incr_true() : incr_false();
}

/* Functions with a single decimal argument */
static TyObject *
PyDecContext_Apply(TyObject *context, TyObject *v)
{
    TyObject *result, *a;

    CONVERT_OP_RAISE(&a, v, context);

    result = dec_apply(a, context);
    Ty_DECREF(a);
    return result;
}

static TyObject *
ctx_canonical(TyObject *context, TyObject *v)
{
    decimal_state *state = get_module_state_from_ctx(context);
    if (!PyDec_Check(state, v)) {
        TyErr_SetString(TyExc_TypeError,
            "argument must be a Decimal");
        return NULL;
    }

    return Ty_NewRef(v);
}

static TyObject *
ctx_mpd_qcopy_abs(TyObject *context, TyObject *v)
{
    TyObject *result, *a;
    uint32_t status = 0;

    CONVERT_OP_RAISE(&a, v, context);
    decimal_state *state = get_module_state_from_ctx(context);
    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        return NULL;
    }

    mpd_qcopy_abs(MPD(result), MPD(a), &status);
    Ty_DECREF(a);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject *
ctx_copy_decimal(TyObject *context, TyObject *v)
{
    TyObject *result;

    CONVERT_OP_RAISE(&result, v, context);
    return result;
}

static TyObject *
ctx_mpd_qcopy_negate(TyObject *context, TyObject *v)
{
    TyObject *result, *a;
    uint32_t status = 0;

    CONVERT_OP_RAISE(&a, v, context);
    decimal_state *state = get_module_state_from_ctx(context);
    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        return NULL;
    }

    mpd_qcopy_negate(MPD(result), MPD(a), &status);
    Ty_DECREF(a);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

DecCtx_UnaryFunc(mpd_qlogb)
DecCtx_UnaryFunc(mpd_qinvert)

static TyObject *
ctx_mpd_class(TyObject *context, TyObject *v)
{
    TyObject *a;
    const char *cp;

    CONVERT_OP_RAISE(&a, v, context);

    cp = mpd_class(MPD(a), CTX(context));
    Ty_DECREF(a);

    return TyUnicode_FromString(cp);
}

static TyObject *
ctx_mpd_to_sci(TyObject *context, TyObject *v)
{
    TyObject *result;
    TyObject *a;
    mpd_ssize_t size;
    char *s;

    CONVERT_OP_RAISE(&a, v, context);

    size = mpd_to_sci_size(&s, MPD(a), CtxCaps(context));
    Ty_DECREF(a);
    if (size < 0) {
        TyErr_NoMemory();
        return NULL;
    }

    result = unicode_fromascii(s, size);
    mpd_free(s);

    return result;
}

static TyObject *
ctx_mpd_to_eng(TyObject *context, TyObject *v)
{
    TyObject *result;
    TyObject *a;
    mpd_ssize_t size;
    char *s;

    CONVERT_OP_RAISE(&a, v, context);

    size = mpd_to_eng_size(&s, MPD(a), CtxCaps(context));
    Ty_DECREF(a);
    if (size < 0) {
        TyErr_NoMemory();
        return NULL;
    }

    result = unicode_fromascii(s, size);
    mpd_free(s);

    return result;
}

/* Functions with two decimal arguments */
DecCtx_BinaryFunc_NO_CTX(mpd_compare_total)
DecCtx_BinaryFunc_NO_CTX(mpd_compare_total_mag)

static TyObject *
ctx_mpd_qcopy_sign(TyObject *context, TyObject *args)
{
    TyObject *v, *w;
    TyObject *a, *b;
    TyObject *result;
    uint32_t status = 0;

    if (!TyArg_ParseTuple(args, "OO", &v, &w)) {
        return NULL;
    }

    CONVERT_BINOP_RAISE(&a, &b, v, w, context);
    decimal_state *state = get_module_state_from_ctx(context);
    result = dec_alloc(state);
    if (result == NULL) {
        Ty_DECREF(a);
        Ty_DECREF(b);
        return NULL;
    }

    mpd_qcopy_sign(MPD(result), MPD(a), MPD(b), &status);
    Ty_DECREF(a);
    Ty_DECREF(b);
    if (dec_addstatus(context, status)) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

DecCtx_BinaryFunc(mpd_qand)
DecCtx_BinaryFunc(mpd_qor)
DecCtx_BinaryFunc(mpd_qxor)

DecCtx_BinaryFunc(mpd_qrotate)
DecCtx_BinaryFunc(mpd_qscaleb)
DecCtx_BinaryFunc(mpd_qshift)

static TyObject *
ctx_mpd_same_quantum(TyObject *context, TyObject *args)
{
    TyObject *v, *w;
    TyObject *a, *b;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "OO", &v, &w)) {
        return NULL;
    }

    CONVERT_BINOP_RAISE(&a, &b, v, w, context);

    result = mpd_same_quantum(MPD(a), MPD(b)) ? incr_true() : incr_false();
    Ty_DECREF(a);
    Ty_DECREF(b);

    return result;
}


static TyMethodDef context_methods [] =
{
  /* Unary arithmetic functions */
  { "abs", ctx_mpd_qabs, METH_O, doc_ctx_abs },
  { "exp", ctx_mpd_qexp, METH_O, doc_ctx_exp },
  { "ln", ctx_mpd_qln, METH_O, doc_ctx_ln },
  { "log10", ctx_mpd_qlog10, METH_O, doc_ctx_log10 },
  { "minus", ctx_mpd_qminus, METH_O, doc_ctx_minus },
  { "next_minus", ctx_mpd_qnext_minus, METH_O, doc_ctx_next_minus },
  { "next_plus", ctx_mpd_qnext_plus, METH_O, doc_ctx_next_plus },
  { "normalize", ctx_mpd_qreduce, METH_O, doc_ctx_normalize },
  { "plus", ctx_mpd_qplus, METH_O, doc_ctx_plus },
  { "to_integral", ctx_mpd_qround_to_int, METH_O, doc_ctx_to_integral },
  { "to_integral_exact", ctx_mpd_qround_to_intx, METH_O, doc_ctx_to_integral_exact },
  { "to_integral_value", ctx_mpd_qround_to_int, METH_O, doc_ctx_to_integral_value },
  { "sqrt", ctx_mpd_qsqrt, METH_O, doc_ctx_sqrt },

  /* Binary arithmetic functions */
  { "add", ctx_mpd_qadd, METH_VARARGS, doc_ctx_add },
  { "compare", ctx_mpd_qcompare, METH_VARARGS, doc_ctx_compare },
  { "compare_signal", ctx_mpd_qcompare_signal, METH_VARARGS, doc_ctx_compare_signal },
  { "divide", ctx_mpd_qdiv, METH_VARARGS, doc_ctx_divide },
  { "divide_int", ctx_mpd_qdivint, METH_VARARGS, doc_ctx_divide_int },
  { "divmod", ctx_mpd_qdivmod, METH_VARARGS, doc_ctx_divmod },
  { "max", ctx_mpd_qmax, METH_VARARGS, doc_ctx_max },
  { "max_mag", ctx_mpd_qmax_mag, METH_VARARGS, doc_ctx_max_mag },
  { "min", ctx_mpd_qmin, METH_VARARGS, doc_ctx_min },
  { "min_mag", ctx_mpd_qmin_mag, METH_VARARGS, doc_ctx_min_mag },
  { "multiply", ctx_mpd_qmul, METH_VARARGS, doc_ctx_multiply },
  { "next_toward", ctx_mpd_qnext_toward, METH_VARARGS, doc_ctx_next_toward },
  { "quantize", ctx_mpd_qquantize, METH_VARARGS, doc_ctx_quantize },
  { "remainder", ctx_mpd_qrem, METH_VARARGS, doc_ctx_remainder },
  { "remainder_near", ctx_mpd_qrem_near, METH_VARARGS, doc_ctx_remainder_near },
  { "subtract", ctx_mpd_qsub, METH_VARARGS, doc_ctx_subtract },

  /* Binary or ternary arithmetic functions */
  { "power", _PyCFunction_CAST(ctx_mpd_qpow), METH_VARARGS|METH_KEYWORDS, doc_ctx_power },

  /* Ternary arithmetic functions */
  { "fma", ctx_mpd_qfma, METH_VARARGS, doc_ctx_fma },

  /* No argument */
  { "Etiny", context_getetiny, METH_NOARGS, doc_ctx_Etiny },
  { "Etop", context_getetop, METH_NOARGS, doc_ctx_Etop },
  { "radix", ctx_mpd_radix, METH_NOARGS, doc_ctx_radix },

  /* Boolean functions */
  { "is_canonical", ctx_iscanonical, METH_O, doc_ctx_is_canonical },
  { "is_finite", ctx_mpd_isfinite, METH_O, doc_ctx_is_finite },
  { "is_infinite", ctx_mpd_isinfinite, METH_O, doc_ctx_is_infinite },
  { "is_nan", ctx_mpd_isnan, METH_O, doc_ctx_is_nan },
  { "is_normal", ctx_mpd_isnormal, METH_O, doc_ctx_is_normal },
  { "is_qnan", ctx_mpd_isqnan, METH_O, doc_ctx_is_qnan },
  { "is_signed", ctx_mpd_issigned, METH_O, doc_ctx_is_signed },
  { "is_snan", ctx_mpd_issnan, METH_O, doc_ctx_is_snan },
  { "is_subnormal", ctx_mpd_issubnormal, METH_O, doc_ctx_is_subnormal },
  { "is_zero", ctx_mpd_iszero, METH_O, doc_ctx_is_zero },

  /* Functions with a single decimal argument */
  { "_apply", PyDecContext_Apply, METH_O, NULL }, /* alias for apply */
#ifdef EXTRA_FUNCTIONALITY
  { "apply", PyDecContext_Apply, METH_O, doc_ctx_apply },
#endif
  { "canonical", ctx_canonical, METH_O, doc_ctx_canonical },
  { "copy_abs", ctx_mpd_qcopy_abs, METH_O, doc_ctx_copy_abs },
  { "copy_decimal", ctx_copy_decimal, METH_O, doc_ctx_copy_decimal },
  { "copy_negate", ctx_mpd_qcopy_negate, METH_O, doc_ctx_copy_negate },
  { "logb", ctx_mpd_qlogb, METH_O, doc_ctx_logb },
  { "logical_invert", ctx_mpd_qinvert, METH_O, doc_ctx_logical_invert },
  { "number_class", ctx_mpd_class, METH_O, doc_ctx_number_class },
  { "to_sci_string", ctx_mpd_to_sci, METH_O, doc_ctx_to_sci_string },
  { "to_eng_string", ctx_mpd_to_eng, METH_O, doc_ctx_to_eng_string },

  /* Functions with two decimal arguments */
  { "compare_total", ctx_mpd_compare_total, METH_VARARGS, doc_ctx_compare_total },
  { "compare_total_mag", ctx_mpd_compare_total_mag, METH_VARARGS, doc_ctx_compare_total_mag },
  { "copy_sign", ctx_mpd_qcopy_sign, METH_VARARGS, doc_ctx_copy_sign },
  { "logical_and", ctx_mpd_qand, METH_VARARGS, doc_ctx_logical_and },
  { "logical_or", ctx_mpd_qor, METH_VARARGS, doc_ctx_logical_or },
  { "logical_xor", ctx_mpd_qxor, METH_VARARGS, doc_ctx_logical_xor },
  { "rotate", ctx_mpd_qrotate, METH_VARARGS, doc_ctx_rotate },
  { "same_quantum", ctx_mpd_same_quantum, METH_VARARGS, doc_ctx_same_quantum },
  { "scaleb", ctx_mpd_qscaleb, METH_VARARGS, doc_ctx_scaleb },
  { "shift", ctx_mpd_qshift, METH_VARARGS, doc_ctx_shift },

  /* Set context values */
  { "clear_flags", context_clear_flags, METH_NOARGS, doc_ctx_clear_flags },
  { "clear_traps", context_clear_traps, METH_NOARGS, doc_ctx_clear_traps },

#ifdef CONFIG_32
  /* Unsafe set functions with relaxed range checks */
  { "_unsafe_setprec", context_unsafe_setprec, METH_O, NULL },
  { "_unsafe_setemin", context_unsafe_setemin, METH_O, NULL },
  { "_unsafe_setemax", context_unsafe_setemax, METH_O, NULL },
#endif

  /* Miscellaneous */
  { "__copy__", context_copy, METH_NOARGS, NULL },
  { "__reduce__", context_reduce, METH_NOARGS, NULL },
  { "copy", context_copy, METH_NOARGS, doc_ctx_copy },
  { "create_decimal", ctx_create_decimal, METH_VARARGS, doc_ctx_create_decimal },
  { "create_decimal_from_float", ctx_from_float, METH_O, doc_ctx_create_decimal_from_float },

  { NULL, NULL, 1 }
};

static TyType_Slot context_slots[] = {
    {Ty_tp_token, Ty_TP_USE_SPEC},
    {Ty_tp_dealloc, context_dealloc},
    {Ty_tp_traverse, context_traverse},
    {Ty_tp_clear, context_clear},
    {Ty_tp_repr, context_repr},
    {Ty_tp_getattro, context_getattr},
    {Ty_tp_setattro, context_setattr},
    {Ty_tp_doc, (void *)doc_context},
    {Ty_tp_methods, context_methods},
    {Ty_tp_getset, context_getsets},
    {Ty_tp_init, context_init},
    {Ty_tp_new, context_new},
    {0, NULL},
};

static TyType_Spec context_spec = {
    .name = "decimal.Context",
    .basicsize = sizeof(PyDecContextObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = context_slots,
};


static TyMethodDef _decimal_methods [] =
{
  { "getcontext", PyDec_GetCurrentContext, METH_NOARGS, doc_getcontext},
  { "setcontext", PyDec_SetCurrentContext, METH_O, doc_setcontext},
  { "localcontext", _PyCFunction_CAST(ctxmanager_new), METH_VARARGS|METH_KEYWORDS, doc_localcontext},
  { "IEEEContext", ieee_context, METH_O, doc_ieee_context},
  { NULL, NULL, 1, NULL }
};


struct ssize_constmap { const char *name; mpd_ssize_t val; };
static struct ssize_constmap ssize_constants [] = {
    {"MAX_PREC", MPD_MAX_PREC},
    {"MAX_EMAX", MPD_MAX_EMAX},
    {"MIN_EMIN",  MPD_MIN_EMIN},
    {"MIN_ETINY", MPD_MIN_ETINY},
    {NULL}
};

struct int_constmap { const char *name; int val; };
static struct int_constmap int_constants [] = {
    /* int constants */
    {"IEEE_CONTEXT_MAX_BITS", MPD_IEEE_CONTEXT_MAX_BITS},
#ifdef EXTRA_FUNCTIONALITY
    {"DECIMAL32", MPD_DECIMAL32},
    {"DECIMAL64", MPD_DECIMAL64},
    {"DECIMAL128", MPD_DECIMAL128},
    /* int condition flags */
    {"DecClamped", MPD_Clamped},
    {"DecConversionSyntax", MPD_Conversion_syntax},
    {"DecDivisionByZero", MPD_Division_by_zero},
    {"DecDivisionImpossible", MPD_Division_impossible},
    {"DecDivisionUndefined", MPD_Division_undefined},
    {"DecFpuError", MPD_Fpu_error},
    {"DecInexact", MPD_Inexact},
    {"DecInvalidContext", MPD_Invalid_context},
    {"DecInvalidOperation", MPD_Invalid_operation},
    {"DecIEEEInvalidOperation", MPD_IEEE_Invalid_operation},
    {"DecMallocError", MPD_Malloc_error},
    {"DecFloatOperation", MPD_Float_operation},
    {"DecOverflow", MPD_Overflow},
    {"DecRounded", MPD_Rounded},
    {"DecSubnormal", MPD_Subnormal},
    {"DecUnderflow", MPD_Underflow},
    {"DecErrors", MPD_Errors},
    {"DecTraps", MPD_Traps},
#endif
    {NULL}
};


#define CHECK_INT(expr) \
    do { if ((expr) < 0) goto error; } while (0)
#define ASSIGN_PTR(result, expr) \
    do { result = (expr); if (result == NULL) goto error; } while (0)
#define CHECK_PTR(expr) \
    do { if ((expr) == NULL) goto error; } while (0)


static PyCFunction
cfunc_noargs(TyTypeObject *t, const char *name)
{
    struct TyMethodDef *m;

    if (t->tp_methods == NULL) {
        goto error;
    }

    for (m = t->tp_methods; m->ml_name != NULL; m++) {
        if (strcmp(name, m->ml_name) == 0) {
            if (!(m->ml_flags & METH_NOARGS)) {
                goto error;
            }
            return m->ml_meth;
        }
    }

error:
    TyErr_Format(TyExc_RuntimeError,
        "internal error: could not find method %s", name);
    return NULL;
}

static int minalloc_is_set = 0;

static int
_decimal_exec(TyObject *m)
{
    TyObject *numbers = NULL;
    TyObject *Number = NULL;
    TyObject *collections = NULL;
    TyObject *collections_abc = NULL;
    TyObject *MutableMapping = NULL;
    TyObject *obj = NULL;
    DecCondMap *cm;
    struct ssize_constmap *ssize_cm;
    struct int_constmap *int_cm;
    int i;


    /* Init libmpdec */
    mpd_traphandler = dec_traphandler;
    mpd_mallocfunc = TyMem_Malloc;
    mpd_reallocfunc = TyMem_Realloc;
    mpd_callocfunc = mpd_callocfunc_em;
    mpd_free = TyMem_Free;

    /* Suppress the warning caused by multi-phase initialization */
    if (!minalloc_is_set) {
        mpd_setminalloc(_Ty_DEC_MINALLOC);
        minalloc_is_set = 1;
    }

    decimal_state *state = get_module_state(m);

    /* Init external C-API functions */
    state->_py_long_multiply = TyLong_Type.tp_as_number->nb_multiply;
    state->_py_long_floor_divide = TyLong_Type.tp_as_number->nb_floor_divide;
    state->_py_long_power = TyLong_Type.tp_as_number->nb_power;
    state->_py_float_abs = TyFloat_Type.tp_as_number->nb_absolute;
    ASSIGN_PTR(state->_py_float_as_integer_ratio,
               cfunc_noargs(&TyFloat_Type, "as_integer_ratio"));
    ASSIGN_PTR(state->_py_long_bit_length,
               cfunc_noargs(&TyLong_Type, "bit_length"));


    /* Init types */
#define CREATE_TYPE(mod, tp, spec) do {                               \
    tp = (TyTypeObject *)TyType_FromMetaclass(NULL, mod, spec, NULL); \
    CHECK_PTR(tp);                                                    \
} while (0)

    CREATE_TYPE(m, state->PyDec_Type, &dec_spec);
    CREATE_TYPE(m, state->PyDecContext_Type, &context_spec);
    CREATE_TYPE(m, state->PyDecContextManager_Type, &ctxmanager_spec);
    CREATE_TYPE(m, state->PyDecSignalDictMixin_Type, &signaldict_spec);

#undef CREATE_TYPE

    ASSIGN_PTR(obj, TyUnicode_FromString("decimal"));
    CHECK_INT(TyDict_SetItemString(state->PyDec_Type->tp_dict, "__module__", obj));
    CHECK_INT(TyDict_SetItemString(state->PyDecContext_Type->tp_dict,
                                   "__module__", obj));
    Ty_CLEAR(obj);


    /* Numeric abstract base classes */
    ASSIGN_PTR(numbers, TyImport_ImportModule("numbers"));
    ASSIGN_PTR(Number, PyObject_GetAttrString(numbers, "Number"));
    /* Register Decimal with the Number abstract base class */
    ASSIGN_PTR(obj, PyObject_CallMethod(Number, "register", "(O)",
                                        (TyObject *)state->PyDec_Type));
    Ty_CLEAR(obj);
    /* Rational is a global variable used for fraction comparisons. */
    ASSIGN_PTR(state->Rational, PyObject_GetAttrString(numbers, "Rational"));
    /* Done with numbers, Number */
    Ty_CLEAR(numbers);
    Ty_CLEAR(Number);

    /* DecimalTuple */
    ASSIGN_PTR(collections, TyImport_ImportModule("collections"));
    ASSIGN_PTR(state->DecimalTuple, (TyTypeObject *)PyObject_CallMethod(collections,
                                 "namedtuple", "(ss)", "DecimalTuple",
                                 "sign digits exponent"));

    ASSIGN_PTR(obj, TyUnicode_FromString("decimal"));
    CHECK_INT(TyDict_SetItemString(state->DecimalTuple->tp_dict, "__module__", obj));
    Ty_CLEAR(obj);

    /* MutableMapping */
    ASSIGN_PTR(collections_abc, TyImport_ImportModule("collections.abc"));
    ASSIGN_PTR(MutableMapping, PyObject_GetAttrString(collections_abc,
                                                      "MutableMapping"));
    /* Create SignalDict type */
    ASSIGN_PTR(state->PyDecSignalDict_Type,
                   (TyTypeObject *)PyObject_CallFunction(
                   (TyObject *)&TyType_Type, "s(OO){}",
                   "SignalDict", state->PyDecSignalDictMixin_Type,
                   MutableMapping));

    /* Done with collections, MutableMapping */
    Ty_CLEAR(collections);
    Ty_CLEAR(collections_abc);
    Ty_CLEAR(MutableMapping);

    /* For format specifiers not yet supported by libmpdec */
    state->PyDecimal = NULL;

    /* Add types to the module */
    CHECK_INT(TyModule_AddType(m, state->PyDec_Type));
    CHECK_INT(TyModule_AddType(m, state->PyDecContext_Type));
    CHECK_INT(TyModule_AddType(m, state->DecimalTuple));

    /* Create top level exception */
    ASSIGN_PTR(state->DecimalException, TyErr_NewException(
                                     "decimal.DecimalException",
                                     TyExc_ArithmeticError, NULL));
    CHECK_INT(TyModule_AddType(m, (TyTypeObject *)state->DecimalException));

    /* Create signal tuple */
    ASSIGN_PTR(state->SignalTuple, TyTuple_New(SIGNAL_MAP_LEN));

    /* Add exceptions that correspond to IEEE signals */
    ASSIGN_PTR(state->signal_map, dec_cond_map_init(signal_map_template,
                                                    sizeof(signal_map_template)));
    for (i = SIGNAL_MAP_LEN-1; i >= 0; i--) {
        TyObject *base;

        cm = state->signal_map + i;

        switch (cm->flag) {
        case MPD_Float_operation:
            base = TyTuple_Pack(2, state->DecimalException, TyExc_TypeError);
            break;
        case MPD_Division_by_zero:
            base = TyTuple_Pack(2, state->DecimalException,
                                TyExc_ZeroDivisionError);
            break;
        case MPD_Overflow:
            base = TyTuple_Pack(2, state->signal_map[INEXACT].ex,
                                   state->signal_map[ROUNDED].ex);
            break;
        case MPD_Underflow:
            base = TyTuple_Pack(3, state->signal_map[INEXACT].ex,
                                   state->signal_map[ROUNDED].ex,
                                   state->signal_map[SUBNORMAL].ex);
            break;
        default:
            base = TyTuple_Pack(1, state->DecimalException);
            break;
        }

        if (base == NULL) {
            goto error; /* GCOV_NOT_REACHED */
        }

        ASSIGN_PTR(cm->ex, TyErr_NewException(cm->fqname, base, NULL));
        Ty_DECREF(base);

        /* add to module */
        CHECK_INT(TyModule_AddObjectRef(m, cm->name, cm->ex));

        /* add to signal tuple */
        TyTuple_SET_ITEM(state->SignalTuple, i, Ty_NewRef(cm->ex));
    }

    /*
     * Unfortunately, InvalidOperation is a signal that comprises
     * several conditions, including InvalidOperation! Naming the
     * signal IEEEInvalidOperation would prevent the confusion.
     */
    ASSIGN_PTR(state->cond_map, dec_cond_map_init(cond_map_template,
                                                  sizeof(cond_map_template)));
    state->cond_map[0].ex = state->signal_map[0].ex;

    /* Add remaining exceptions, inherit from InvalidOperation */
    for (cm = state->cond_map+1; cm->name != NULL; cm++) {
        TyObject *base;
        if (cm->flag == MPD_Division_undefined) {
            base = TyTuple_Pack(2, state->signal_map[0].ex, TyExc_ZeroDivisionError);
        }
        else {
            base = TyTuple_Pack(1, state->signal_map[0].ex);
        }
        if (base == NULL) {
            goto error; /* GCOV_NOT_REACHED */
        }

        ASSIGN_PTR(cm->ex, TyErr_NewException(cm->fqname, base, NULL));
        Ty_DECREF(base);

        CHECK_INT(TyModule_AddObjectRef(m, cm->name, cm->ex));
    }


    /* Init default context template first */
    ASSIGN_PTR(state->default_context_template,
               PyObject_CallObject((TyObject *)state->PyDecContext_Type, NULL));
    CHECK_INT(TyModule_AddObjectRef(m, "DefaultContext",
                                    state->default_context_template));

#ifndef WITH_DECIMAL_CONTEXTVAR
    ASSIGN_PTR(state->tls_context_key,
               TyUnicode_FromString("___DECIMAL_CTX__"));
    CHECK_INT(TyModule_AddObjectRef(m, "HAVE_CONTEXTVAR", Ty_False));
#else
    ASSIGN_PTR(state->current_context_var, PyContextVar_New("decimal_context", NULL));
    CHECK_INT(TyModule_AddObjectRef(m, "HAVE_CONTEXTVAR", Ty_True));
#endif
    CHECK_INT(TyModule_AddObjectRef(m, "HAVE_THREADS", Ty_True));

    /* Init basic context template */
    ASSIGN_PTR(state->basic_context_template,
               PyObject_CallObject((TyObject *)state->PyDecContext_Type, NULL));
    init_basic_context(state->basic_context_template);
    CHECK_INT(TyModule_AddObjectRef(m, "BasicContext",
                                    state->basic_context_template));

    /* Init extended context template */
    ASSIGN_PTR(state->extended_context_template,
               PyObject_CallObject((TyObject *)state->PyDecContext_Type, NULL));
    init_extended_context(state->extended_context_template);
    CHECK_INT(TyModule_AddObjectRef(m, "ExtendedContext",
                                    state->extended_context_template));


    /* Init mpd_ssize_t constants */
    for (ssize_cm = ssize_constants; ssize_cm->name != NULL; ssize_cm++) {
        CHECK_INT(TyModule_Add(m, ssize_cm->name,
                               TyLong_FromSsize_t(ssize_cm->val)));
    }

    /* Init int constants */
    for (int_cm = int_constants; int_cm->name != NULL; int_cm++) {
        CHECK_INT(TyModule_AddIntConstant(m, int_cm->name,
                                          int_cm->val));
    }

    /* Init string constants */
    for (i = 0; i < _PY_DEC_ROUND_GUARD; i++) {
        ASSIGN_PTR(state->round_map[i], TyUnicode_InternFromString(mpd_round_string[i]));
        CHECK_INT(TyModule_AddObjectRef(m, mpd_round_string[i], state->round_map[i]));
    }

    /* Add specification version number */
    CHECK_INT(TyModule_AddStringConstant(m, "__version__", "1.70"));
    CHECK_INT(TyModule_AddStringConstant(m, "__libmpdec_version__", mpd_version()));

    return 0;

error:
    Ty_CLEAR(obj); /* GCOV_NOT_REACHED */
    Ty_CLEAR(numbers); /* GCOV_NOT_REACHED */
    Ty_CLEAR(Number); /* GCOV_NOT_REACHED */
    Ty_CLEAR(collections); /* GCOV_NOT_REACHED */
    Ty_CLEAR(collections_abc); /* GCOV_NOT_REACHED */
    Ty_CLEAR(MutableMapping); /* GCOV_NOT_REACHED */

    return -1;
}

static int
decimal_traverse(TyObject *module, visitproc visit, void *arg)
{
    decimal_state *state = get_module_state(module);
    Ty_VISIT(state->PyDecContextManager_Type);
    Ty_VISIT(state->PyDecContext_Type);
    Ty_VISIT(state->PyDecSignalDictMixin_Type);
    Ty_VISIT(state->PyDec_Type);
    Ty_VISIT(state->PyDecSignalDict_Type);
    Ty_VISIT(state->DecimalTuple);
    Ty_VISIT(state->DecimalException);

#ifndef WITH_DECIMAL_CONTEXTVAR
    Ty_VISIT(state->tls_context_key);
    Ty_VISIT(state->cached_context);
#else
    Ty_VISIT(state->current_context_var);
#endif

    Ty_VISIT(state->default_context_template);
    Ty_VISIT(state->basic_context_template);
    Ty_VISIT(state->extended_context_template);
    Ty_VISIT(state->Rational);
    Ty_VISIT(state->SignalTuple);

    if (state->signal_map != NULL) {
        for (DecCondMap *cm = state->signal_map; cm->name != NULL; cm++) {
            Ty_VISIT(cm->ex);
        }
    }
    if (state->cond_map != NULL) {
        for (DecCondMap *cm = state->cond_map + 1; cm->name != NULL; cm++) {
            Ty_VISIT(cm->ex);
        }
    }
    return 0;
}

static int
decimal_clear(TyObject *module)
{
    decimal_state *state = get_module_state(module);
    Ty_CLEAR(state->PyDecContextManager_Type);
    Ty_CLEAR(state->PyDecContext_Type);
    Ty_CLEAR(state->PyDecSignalDictMixin_Type);
    Ty_CLEAR(state->PyDec_Type);
    Ty_CLEAR(state->PyDecSignalDict_Type);
    Ty_CLEAR(state->DecimalTuple);
    Ty_CLEAR(state->DecimalException);

#ifndef WITH_DECIMAL_CONTEXTVAR
    Ty_CLEAR(state->tls_context_key);
    Ty_CLEAR(state->cached_context);
#else
    Ty_CLEAR(state->current_context_var);
#endif

    Ty_CLEAR(state->default_context_template);
    Ty_CLEAR(state->basic_context_template);
    Ty_CLEAR(state->extended_context_template);
    Ty_CLEAR(state->Rational);
    Ty_CLEAR(state->SignalTuple);
    Ty_CLEAR(state->PyDecimal);

    if (state->signal_map != NULL) {
        for (DecCondMap *cm = state->signal_map; cm->name != NULL; cm++) {
            Ty_DECREF(cm->ex);
        }
        TyMem_Free(state->signal_map);
        state->signal_map = NULL;
    }

    if (state->cond_map != NULL) {
        // cond_map[0].ex has borrowed a reference from signal_map[0].ex
        for (DecCondMap *cm = state->cond_map + 1; cm->name != NULL; cm++) {
            Ty_DECREF(cm->ex);
        }
        TyMem_Free(state->cond_map);
        state->cond_map = NULL;
    }
    return 0;
}

static void
decimal_free(void *module)
{
    (void)decimal_clear((TyObject *)module);
}

static struct PyModuleDef_Slot _decimal_slots[] = {
    {Ty_mod_exec, _decimal_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef _decimal_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "decimal",
    .m_doc = doc__decimal,
    .m_size = sizeof(decimal_state),
    .m_methods = _decimal_methods,
    .m_slots = _decimal_slots,
    .m_traverse = decimal_traverse,
    .m_clear = decimal_clear,
    .m_free = decimal_free,
};

PyMODINIT_FUNC
PyInit__decimal(void)
{
    return PyModuleDef_Init(&_decimal_module);
}
