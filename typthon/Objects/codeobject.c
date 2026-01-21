#include "Python.h"
#include "opcode.h"

#include "pycore_code.h"          // _PyCodeConstructor
#include "pycore_function.h"      // _TyFunction_ClearCodeByVersion()
#include "pycore_hashtable.h"     // _Ty_hashtable_t
#include "pycore_index_pool.h"    // _PyIndexPool_Fini()
#include "pycore_initconfig.h"    // _TyStatus_OK()
#include "pycore_interp.h"        // TyInterpreterState.co_extra_freefuncs
#include "pycore_interpframe.h"   // FRAME_SPECIALS_SIZE
#include "pycore_opcode_metadata.h" // _TyOpcode_Caches
#include "pycore_opcode_utils.h"  // RESUME_AT_FUNC_START
#include "pycore_optimizer.h"     // _Ty_ExecutorDetach
#include "pycore_pymem.h"         // _TyMem_FreeDelayed()
#include "pycore_pystate.h"       // _TyInterpreterState_GET()
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_tuple.h"         // _TyTuple_ITEMS()
#include "pycore_unicodeobject.h" // _TyUnicode_InternImmortal()
#include "pycore_uniqueid.h"      // _TyObject_AssignUniqueId()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include "clinic/codeobject.c.h"
#include <stdbool.h>


#define INITIAL_SPECIALIZED_CODE_SIZE 16

static const char *
code_event_name(PyCodeEvent event) {
    switch (event) {
        #define CASE(op)                \
        case PY_CODE_EVENT_##op:         \
            return "PY_CODE_EVENT_" #op;
        PY_FOREACH_CODE_EVENT(CASE)
        #undef CASE
    }
    Ty_UNREACHABLE();
}

static void
notify_code_watchers(PyCodeEvent event, PyCodeObject *co)
{
    assert(Ty_REFCNT(co) > 0);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);
    uint8_t bits = interp->active_code_watchers;
    int i = 0;
    while (bits) {
        assert(i < CODE_MAX_WATCHERS);
        if (bits & 1) {
            TyCode_WatchCallback cb = interp->code_watchers[i];
            // callback must be non-null if the watcher bit is set
            assert(cb != NULL);
            if (cb(event, co) < 0) {
                TyErr_FormatUnraisable(
                    "Exception ignored in %s watcher callback for %R",
                    code_event_name(event), co);
            }
        }
        i++;
        bits >>= 1;
    }
}

int
TyCode_AddWatcher(TyCode_WatchCallback callback)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);

    for (int i = 0; i < CODE_MAX_WATCHERS; i++) {
        if (!interp->code_watchers[i]) {
            interp->code_watchers[i] = callback;
            interp->active_code_watchers |= (1 << i);
            return i;
        }
    }

    TyErr_SetString(TyExc_RuntimeError, "no more code watcher IDs available");
    return -1;
}

static inline int
validate_watcher_id(TyInterpreterState *interp, int watcher_id)
{
    if (watcher_id < 0 || watcher_id >= CODE_MAX_WATCHERS) {
        TyErr_Format(TyExc_ValueError, "Invalid code watcher ID %d", watcher_id);
        return -1;
    }
    if (!interp->code_watchers[watcher_id]) {
        TyErr_Format(TyExc_ValueError, "No code watcher set for ID %d", watcher_id);
        return -1;
    }
    return 0;
}

int
TyCode_ClearWatcher(int watcher_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    assert(interp->_initialized);
    if (validate_watcher_id(interp, watcher_id) < 0) {
        return -1;
    }
    interp->code_watchers[watcher_id] = NULL;
    interp->active_code_watchers &= ~(1 << watcher_id);
    return 0;
}

/******************
 * generic helpers
 ******************/

#define _PyCodeObject_CAST(op)  (assert(TyCode_Check(op)), (PyCodeObject *)(op))

static int
should_intern_string(TyObject *o)
{
#ifdef Ty_GIL_DISABLED
    // The free-threaded build interns (and immortalizes) all string constants
    return 1;
#else
    // compute if s matches [a-zA-Z0-9_]
    const unsigned char *s, *e;

    if (!TyUnicode_IS_ASCII(o))
        return 0;

    s = TyUnicode_1BYTE_DATA(o);
    e = s + TyUnicode_GET_LENGTH(o);
    for (; s != e; s++) {
        if (!Ty_ISALNUM(*s) && *s != '_')
            return 0;
    }
    return 1;
#endif
}

#ifdef Ty_GIL_DISABLED
static TyObject *intern_one_constant(TyObject *op);

// gh-130851: In the free threading build, we intern and immortalize most
// constants, except code objects. However, users can generate code objects
// with arbitrary co_consts. We don't want to immortalize or intern unexpected
// constants or tuples/sets containing unexpected constants.
static int
should_immortalize_constant(TyObject *v)
{
    // Only immortalize containers if we've already immortalized all their
    // elements.
    if (TyTuple_CheckExact(v)) {
        for (Ty_ssize_t i = TyTuple_GET_SIZE(v); --i >= 0; ) {
            if (!_Ty_IsImmortal(TyTuple_GET_ITEM(v, i))) {
                return 0;
            }
        }
        return 1;
    }
    else if (TyFrozenSet_CheckExact(v)) {
        TyObject *item;
        Ty_hash_t hash;
        Ty_ssize_t pos = 0;
        while (_TySet_NextEntry(v, &pos, &item, &hash)) {
            if (!_Ty_IsImmortal(item)) {
                return 0;
            }
        }
        return 1;
    }
    else if (TySlice_Check(v)) {
        PySliceObject *slice = (PySliceObject *)v;
        return (_Ty_IsImmortal(slice->start) &&
                _Ty_IsImmortal(slice->stop) &&
                _Ty_IsImmortal(slice->step));
    }
    return (TyLong_CheckExact(v) || TyFloat_CheckExact(v) ||
            TyComplex_Check(v) || TyBytes_CheckExact(v));
}
#endif

static int
intern_strings(TyObject *tuple)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    Ty_ssize_t i;

    for (i = TyTuple_GET_SIZE(tuple); --i >= 0; ) {
        TyObject *v = TyTuple_GET_ITEM(tuple, i);
        if (v == NULL || !TyUnicode_CheckExact(v)) {
            TyErr_SetString(TyExc_SystemError,
                            "non-string found in code slot");
            return -1;
        }
        _TyUnicode_InternImmortal(interp, &_TyTuple_ITEMS(tuple)[i]);
    }
    return 0;
}

/* Intern constants. In the default build, this interns selected string
   constants. In the free-threaded build, this also interns non-string
   constants. */
static int
intern_constants(TyObject *tuple, int *modified)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    for (Ty_ssize_t i = TyTuple_GET_SIZE(tuple); --i >= 0; ) {
        TyObject *v = TyTuple_GET_ITEM(tuple, i);
        if (TyUnicode_CheckExact(v)) {
            if (should_intern_string(v)) {
                TyObject *w = v;
                _TyUnicode_InternMortal(interp, &v);
                if (w != v) {
                    TyTuple_SET_ITEM(tuple, i, v);
                    if (modified) {
                        *modified = 1;
                    }
                }
            }
        }
        else if (TyTuple_CheckExact(v)) {
            if (intern_constants(v, NULL) < 0) {
                return -1;
            }
        }
        else if (TyFrozenSet_CheckExact(v)) {
            TyObject *w = v;
            TyObject *tmp = PySequence_Tuple(v);
            if (tmp == NULL) {
                return -1;
            }
            int tmp_modified = 0;
            if (intern_constants(tmp, &tmp_modified) < 0) {
                Ty_DECREF(tmp);
                return -1;
            }
            if (tmp_modified) {
                v = TyFrozenSet_New(tmp);
                if (v == NULL) {
                    Ty_DECREF(tmp);
                    return -1;
                }

                TyTuple_SET_ITEM(tuple, i, v);
                Ty_DECREF(w);
                if (modified) {
                    *modified = 1;
                }
            }
            Ty_DECREF(tmp);
        }
#ifdef Ty_GIL_DISABLED
        else if (TySlice_Check(v)) {
            PySliceObject *slice = (PySliceObject *)v;
            TyObject *tmp = TyTuple_New(3);
            if (tmp == NULL) {
                return -1;
            }
            TyTuple_SET_ITEM(tmp, 0, Ty_NewRef(slice->start));
            TyTuple_SET_ITEM(tmp, 1, Ty_NewRef(slice->stop));
            TyTuple_SET_ITEM(tmp, 2, Ty_NewRef(slice->step));
            int tmp_modified = 0;
            if (intern_constants(tmp, &tmp_modified) < 0) {
                Ty_DECREF(tmp);
                return -1;
            }
            if (tmp_modified) {
                v = TySlice_New(TyTuple_GET_ITEM(tmp, 0),
                                TyTuple_GET_ITEM(tmp, 1),
                                TyTuple_GET_ITEM(tmp, 2));
                if (v == NULL) {
                    Ty_DECREF(tmp);
                    return -1;
                }
                TyTuple_SET_ITEM(tuple, i, v);
                Ty_DECREF(slice);
                if (modified) {
                    *modified = 1;
                }
            }
            Ty_DECREF(tmp);
        }

        // Intern non-string constants in the free-threaded build
        _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
        if (!_Ty_IsImmortal(v) && !TyUnicode_CheckExact(v) &&
            should_immortalize_constant(v) &&
            !tstate->suppress_co_const_immortalization)
        {
            TyObject *interned = intern_one_constant(v);
            if (interned == NULL) {
                return -1;
            }
            else if (interned != v) {
                TyTuple_SET_ITEM(tuple, i, interned);
                Ty_SETREF(v, interned);
                if (modified) {
                    *modified = 1;
                }
            }
        }
#endif
    }
    return 0;
}

/* Return a shallow copy of a tuple that is
   guaranteed to contain exact strings, by converting string subclasses
   to exact strings and complaining if a non-string is found. */
static TyObject*
validate_and_copy_tuple(TyObject *tup)
{
    TyObject *newtuple;
    TyObject *item;
    Ty_ssize_t i, len;

    len = TyTuple_GET_SIZE(tup);
    newtuple = TyTuple_New(len);
    if (newtuple == NULL)
        return NULL;

    for (i = 0; i < len; i++) {
        item = TyTuple_GET_ITEM(tup, i);
        if (TyUnicode_CheckExact(item)) {
            Ty_INCREF(item);
        }
        else if (!TyUnicode_Check(item)) {
            TyErr_Format(
                TyExc_TypeError,
                "name tuples must contain only "
                "strings, not '%.500s'",
                Ty_TYPE(item)->tp_name);
            Ty_DECREF(newtuple);
            return NULL;
        }
        else {
            item = _TyUnicode_Copy(item);
            if (item == NULL) {
                Ty_DECREF(newtuple);
                return NULL;
            }
        }
        TyTuple_SET_ITEM(newtuple, i, item);
    }

    return newtuple;
}

static int
init_co_cached(PyCodeObject *self)
{
    _PyCoCached *cached = FT_ATOMIC_LOAD_PTR(self->_co_cached);
    if (cached != NULL) {
        return 0;
    }

    Ty_BEGIN_CRITICAL_SECTION(self);
    cached = self->_co_cached;
    if (cached == NULL) {
        cached = TyMem_New(_PyCoCached, 1);
        if (cached == NULL) {
            TyErr_NoMemory();
        }
        else {
            cached->_co_code = NULL;
            cached->_co_cellvars = NULL;
            cached->_co_freevars = NULL;
            cached->_co_varnames = NULL;
            FT_ATOMIC_STORE_PTR(self->_co_cached, cached);
        }
    }
    Ty_END_CRITICAL_SECTION();
    return cached != NULL ? 0 : -1;
}

/******************
 * _TyCode_New()
 ******************/

// This is also used in compile.c.
void
_Ty_set_localsplus_info(int offset, TyObject *name, _PyLocals_Kind kind,
                        TyObject *names, TyObject *kinds)
{
    TyTuple_SET_ITEM(names, offset, Ty_NewRef(name));
    _PyLocals_SetKind(kinds, offset, kind);
}

static void
get_localsplus_counts(TyObject *names, TyObject *kinds,
                      int *pnlocals, int *pncellvars,
                      int *pnfreevars)
{
    int nlocals = 0;
    int ncellvars = 0;
    int nfreevars = 0;
    Ty_ssize_t nlocalsplus = TyTuple_GET_SIZE(names);
    for (int i = 0; i < nlocalsplus; i++) {
        _PyLocals_Kind kind = _PyLocals_GetKind(kinds, i);
        if (kind & CO_FAST_LOCAL) {
            nlocals += 1;
            if (kind & CO_FAST_CELL) {
                ncellvars += 1;
            }
        }
        else if (kind & CO_FAST_CELL) {
            ncellvars += 1;
        }
        else if (kind & CO_FAST_FREE) {
            nfreevars += 1;
        }
    }
    if (pnlocals != NULL) {
        *pnlocals = nlocals;
    }
    if (pncellvars != NULL) {
        *pncellvars = ncellvars;
    }
    if (pnfreevars != NULL) {
        *pnfreevars = nfreevars;
    }
}

static TyObject *
get_localsplus_names(PyCodeObject *co, _PyLocals_Kind kind, int num)
{
    TyObject *names = TyTuple_New(num);
    if (names == NULL) {
        return NULL;
    }
    int index = 0;
    for (int offset = 0; offset < co->co_nlocalsplus; offset++) {
        _PyLocals_Kind k = _PyLocals_GetKind(co->co_localspluskinds, offset);
        if ((k & kind) == 0) {
            continue;
        }
        assert(index < num);
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, offset);
        TyTuple_SET_ITEM(names, index, Ty_NewRef(name));
        index += 1;
    }
    assert(index == num);
    return names;
}

int
_TyCode_Validate(struct _PyCodeConstructor *con)
{
    /* Check argument types */
    if (con->argcount < con->posonlyargcount || con->posonlyargcount < 0 ||
        con->kwonlyargcount < 0 ||
        con->stacksize < 0 || con->flags < 0 ||
        con->code == NULL || !TyBytes_Check(con->code) ||
        con->consts == NULL || !TyTuple_Check(con->consts) ||
        con->names == NULL || !TyTuple_Check(con->names) ||
        con->localsplusnames == NULL || !TyTuple_Check(con->localsplusnames) ||
        con->localspluskinds == NULL || !TyBytes_Check(con->localspluskinds) ||
        TyTuple_GET_SIZE(con->localsplusnames)
            != TyBytes_GET_SIZE(con->localspluskinds) ||
        con->name == NULL || !TyUnicode_Check(con->name) ||
        con->qualname == NULL || !TyUnicode_Check(con->qualname) ||
        con->filename == NULL || !TyUnicode_Check(con->filename) ||
        con->linetable == NULL || !TyBytes_Check(con->linetable) ||
        con->exceptiontable == NULL || !TyBytes_Check(con->exceptiontable)
        ) {
        TyErr_BadInternalCall();
        return -1;
    }

    /* Make sure that code is indexable with an int, this is
       a long running assumption in ceval.c and many parts of
       the interpreter. */
    if (TyBytes_GET_SIZE(con->code) > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "code: co_code larger than INT_MAX");
        return -1;
    }
    if (TyBytes_GET_SIZE(con->code) % sizeof(_Ty_CODEUNIT) != 0 ||
        !_Ty_IS_ALIGNED(TyBytes_AS_STRING(con->code), sizeof(_Ty_CODEUNIT))
        ) {
        TyErr_SetString(TyExc_ValueError, "code: co_code is malformed");
        return -1;
    }

    /* Ensure that the co_varnames has enough names to cover the arg counts.
     * Note that totalargs = nlocals - nplainlocals.  We check nplainlocals
     * here to avoid the possibility of overflow (however remote). */
    int nlocals;
    get_localsplus_counts(con->localsplusnames, con->localspluskinds,
                          &nlocals, NULL, NULL);
    int nplainlocals = nlocals -
                       con->argcount -
                       con->kwonlyargcount -
                       ((con->flags & CO_VARARGS) != 0) -
                       ((con->flags & CO_VARKEYWORDS) != 0);
    if (nplainlocals < 0) {
        TyErr_SetString(TyExc_ValueError, "code: co_varnames is too small");
        return -1;
    }

    return 0;
}

extern void
_TyCode_Quicken(_Ty_CODEUNIT *instructions, Ty_ssize_t size, int enable_counters);

#ifdef Ty_GIL_DISABLED
static _PyCodeArray * _PyCodeArray_New(Ty_ssize_t size);
#endif

static int
init_code(PyCodeObject *co, struct _PyCodeConstructor *con)
{
    int nlocalsplus = (int)TyTuple_GET_SIZE(con->localsplusnames);
    int nlocals, ncellvars, nfreevars;
    get_localsplus_counts(con->localsplusnames, con->localspluskinds,
                          &nlocals, &ncellvars, &nfreevars);
    if (con->stacksize == 0) {
        con->stacksize = 1;
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();
    co->co_filename = Ty_NewRef(con->filename);
    co->co_name = Ty_NewRef(con->name);
    co->co_qualname = Ty_NewRef(con->qualname);
    _TyUnicode_InternMortal(interp, &co->co_filename);
    _TyUnicode_InternMortal(interp, &co->co_name);
    _TyUnicode_InternMortal(interp, &co->co_qualname);
    co->co_flags = con->flags;

    co->co_firstlineno = con->firstlineno;
    co->co_linetable = Ty_NewRef(con->linetable);

    co->co_consts = Ty_NewRef(con->consts);
    co->co_names = Ty_NewRef(con->names);

    co->co_localsplusnames = Ty_NewRef(con->localsplusnames);
    co->co_localspluskinds = Ty_NewRef(con->localspluskinds);

    co->co_argcount = con->argcount;
    co->co_posonlyargcount = con->posonlyargcount;
    co->co_kwonlyargcount = con->kwonlyargcount;

    co->co_stacksize = con->stacksize;

    co->co_exceptiontable = Ty_NewRef(con->exceptiontable);

    /* derived values */
    co->co_nlocalsplus = nlocalsplus;
    co->co_nlocals = nlocals;
    co->co_framesize = nlocalsplus + con->stacksize + FRAME_SPECIALS_SIZE;
    co->co_ncellvars = ncellvars;
    co->co_nfreevars = nfreevars;
#ifdef Ty_GIL_DISABLED
    PyMutex_Lock(&interp->func_state.mutex);
#endif
    co->co_version = interp->func_state.next_version;
    if (interp->func_state.next_version != 0) {
        interp->func_state.next_version++;
    }
#ifdef Ty_GIL_DISABLED
    PyMutex_Unlock(&interp->func_state.mutex);
#endif
    co->_co_monitoring = NULL;
    co->_co_instrumentation_version = 0;
    /* not set */
    co->co_weakreflist = NULL;
    co->co_extra = NULL;
    co->_co_cached = NULL;
    co->co_executors = NULL;

    memcpy(_TyCode_CODE(co), TyBytes_AS_STRING(con->code),
           TyBytes_GET_SIZE(con->code));
#ifdef Ty_GIL_DISABLED
    co->co_tlbc = _PyCodeArray_New(INITIAL_SPECIALIZED_CODE_SIZE);
    if (co->co_tlbc == NULL) {
        return -1;
    }
    co->co_tlbc->entries[0] = co->co_code_adaptive;
#endif
    int entry_point = 0;
    while (entry_point < Ty_SIZE(co) &&
        _TyCode_CODE(co)[entry_point].op.code != RESUME) {
        entry_point++;
    }
    co->_co_firsttraceable = entry_point;
#ifdef Ty_GIL_DISABLED
    _TyCode_Quicken(_TyCode_CODE(co), Ty_SIZE(co), interp->config.tlbc_enabled);
#else
    _TyCode_Quicken(_TyCode_CODE(co), Ty_SIZE(co), 1);
#endif
    notify_code_watchers(PY_CODE_EVENT_CREATE, co);
    return 0;
}

static int
scan_varint(const uint8_t *ptr)
{
    unsigned int read = *ptr++;
    unsigned int val = read & 63;
    unsigned int shift = 0;
    while (read & 64) {
        read = *ptr++;
        shift += 6;
        val |= (read & 63) << shift;
    }
    return val;
}

static int
scan_signed_varint(const uint8_t *ptr)
{
    unsigned int uval = scan_varint(ptr);
    if (uval & 1) {
        return -(int)(uval >> 1);
    }
    else {
        return uval >> 1;
    }
}

static int
get_line_delta(const uint8_t *ptr)
{
    int code = ((*ptr) >> 3) & 15;
    switch (code) {
        case PY_CODE_LOCATION_INFO_NONE:
            return 0;
        case PY_CODE_LOCATION_INFO_NO_COLUMNS:
        case PY_CODE_LOCATION_INFO_LONG:
            return scan_signed_varint(ptr+1);
        case PY_CODE_LOCATION_INFO_ONE_LINE0:
            return 0;
        case PY_CODE_LOCATION_INFO_ONE_LINE1:
            return 1;
        case PY_CODE_LOCATION_INFO_ONE_LINE2:
            return 2;
        default:
            /* Same line */
            return 0;
    }
}

static TyObject *
remove_column_info(TyObject *locations)
{
    Ty_ssize_t offset = 0;
    const uint8_t *data = (const uint8_t *)TyBytes_AS_STRING(locations);
    TyObject *res = TyBytes_FromStringAndSize(NULL, 32);
    if (res == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    uint8_t *output = (uint8_t *)TyBytes_AS_STRING(res);
    while (offset < TyBytes_GET_SIZE(locations)) {
        Ty_ssize_t write_offset = output - (uint8_t *)TyBytes_AS_STRING(res);
        if (write_offset + 16 >= TyBytes_GET_SIZE(res)) {
            if (_TyBytes_Resize(&res, TyBytes_GET_SIZE(res) * 2) < 0) {
                return NULL;
            }
            output = (uint8_t *)TyBytes_AS_STRING(res) + write_offset;
        }
        int code = (data[offset] >> 3) & 15;
        if (code == PY_CODE_LOCATION_INFO_NONE) {
            *output++ = data[offset];
        }
        else {
            int blength = (data[offset] & 7)+1;
            output += write_location_entry_start(
                output, PY_CODE_LOCATION_INFO_NO_COLUMNS, blength);
            int ldelta = get_line_delta(&data[offset]);
            output += write_signed_varint(output, ldelta);
        }
        offset++;
        while (offset < TyBytes_GET_SIZE(locations) &&
            (data[offset] & 128) == 0) {
            offset++;
        }
    }
    Ty_ssize_t write_offset = output - (uint8_t *)TyBytes_AS_STRING(res);
    if (_TyBytes_Resize(&res, write_offset)) {
        return NULL;
    }
    return res;
}

static int
intern_code_constants(struct _PyCodeConstructor *con)
{
#ifdef Ty_GIL_DISABLED
    TyInterpreterState *interp = _TyInterpreterState_GET();
    struct _py_code_state *state = &interp->code_state;
    PyMutex_Lock(&state->mutex);
#endif
    if (intern_strings(con->names) < 0) {
        goto error;
    }
    if (intern_constants(con->consts, NULL) < 0) {
        goto error;
    }
    if (intern_strings(con->localsplusnames) < 0) {
        goto error;
    }
#ifdef Ty_GIL_DISABLED
    PyMutex_Unlock(&state->mutex);
#endif
    return 0;

error:
#ifdef Ty_GIL_DISABLED
    PyMutex_Unlock(&state->mutex);
#endif
    return -1;
}

/* The caller is responsible for ensuring that the given data is valid. */

PyCodeObject *
_TyCode_New(struct _PyCodeConstructor *con)
{
    if (intern_code_constants(con) < 0) {
        return NULL;
    }

    TyObject *replacement_locations = NULL;
    // Compact the linetable if we are opted out of debug
    // ranges.
    if (!_Ty_GetConfig()->code_debug_ranges) {
        replacement_locations = remove_column_info(con->linetable);
        if (replacement_locations == NULL) {
            return NULL;
        }
        con->linetable = replacement_locations;
    }

    Ty_ssize_t size = TyBytes_GET_SIZE(con->code) / sizeof(_Ty_CODEUNIT);
    PyCodeObject *co;
#ifdef Ty_GIL_DISABLED
    co = PyObject_GC_NewVar(PyCodeObject, &TyCode_Type, size);
#else
    co = PyObject_NewVar(PyCodeObject, &TyCode_Type, size);
#endif
    if (co == NULL) {
        Ty_XDECREF(replacement_locations);
        TyErr_NoMemory();
        return NULL;
    }

    if (init_code(co, con) < 0) {
        Ty_DECREF(co);
        return NULL;
    }

#ifdef Ty_GIL_DISABLED
    co->_co_unique_id = _TyObject_AssignUniqueId((TyObject *)co);
    _TyObject_GC_TRACK(co);
#endif
    Ty_XDECREF(replacement_locations);
    return co;
}


/******************
 * the legacy "constructors"
 ******************/

PyCodeObject *
PyUnstable_Code_NewWithPosOnlyArgs(
                          int argcount, int posonlyargcount, int kwonlyargcount,
                          int nlocals, int stacksize, int flags,
                          TyObject *code, TyObject *consts, TyObject *names,
                          TyObject *varnames, TyObject *freevars, TyObject *cellvars,
                          TyObject *filename, TyObject *name,
                          TyObject *qualname, int firstlineno,
                          TyObject *linetable,
                          TyObject *exceptiontable)
{
    PyCodeObject *co = NULL;
    TyObject *localsplusnames = NULL;
    TyObject *localspluskinds = NULL;

    if (varnames == NULL || !TyTuple_Check(varnames) ||
        cellvars == NULL || !TyTuple_Check(cellvars) ||
        freevars == NULL || !TyTuple_Check(freevars)
        ) {
        TyErr_BadInternalCall();
        return NULL;
    }

    // Set the "fast locals plus" info.
    int nvarnames = (int)TyTuple_GET_SIZE(varnames);
    int ncellvars = (int)TyTuple_GET_SIZE(cellvars);
    int nfreevars = (int)TyTuple_GET_SIZE(freevars);
    int nlocalsplus = nvarnames + ncellvars + nfreevars;
    localsplusnames = TyTuple_New(nlocalsplus);
    if (localsplusnames == NULL) {
        goto error;
    }
    localspluskinds = TyBytes_FromStringAndSize(NULL, nlocalsplus);
    if (localspluskinds == NULL) {
        goto error;
    }
    int  offset = 0;
    for (int i = 0; i < nvarnames; i++, offset++) {
        TyObject *name = TyTuple_GET_ITEM(varnames, i);
        _Ty_set_localsplus_info(offset, name, CO_FAST_LOCAL,
                               localsplusnames, localspluskinds);
    }
    for (int i = 0; i < ncellvars; i++, offset++) {
        TyObject *name = TyTuple_GET_ITEM(cellvars, i);
        int argoffset = -1;
        for (int j = 0; j < nvarnames; j++) {
            int cmp = TyUnicode_Compare(TyTuple_GET_ITEM(varnames, j),
                                        name);
            assert(!TyErr_Occurred());
            if (cmp == 0) {
                argoffset = j;
                break;
            }
        }
        if (argoffset >= 0) {
            // Merge the localsplus indices.
            nlocalsplus -= 1;
            offset -= 1;
            _PyLocals_Kind kind = _PyLocals_GetKind(localspluskinds, argoffset);
            _PyLocals_SetKind(localspluskinds, argoffset, kind | CO_FAST_CELL);
            continue;
        }
        _Ty_set_localsplus_info(offset, name, CO_FAST_CELL,
                               localsplusnames, localspluskinds);
    }
    for (int i = 0; i < nfreevars; i++, offset++) {
        TyObject *name = TyTuple_GET_ITEM(freevars, i);
        _Ty_set_localsplus_info(offset, name, CO_FAST_FREE,
                               localsplusnames, localspluskinds);
    }

    // gh-110543: Make sure the CO_FAST_HIDDEN flag is set correctly.
    if (!(flags & CO_OPTIMIZED)) {
        Ty_ssize_t code_len = TyBytes_GET_SIZE(code);
        _Ty_CODEUNIT *code_data = (_Ty_CODEUNIT *)TyBytes_AS_STRING(code);
        Ty_ssize_t num_code_units = code_len / sizeof(_Ty_CODEUNIT);
        int extended_arg = 0;
        for (int i = 0; i < num_code_units; i += 1 + _TyOpcode_Caches[code_data[i].op.code]) {
            _Ty_CODEUNIT *instr = &code_data[i];
            uint8_t opcode = instr->op.code;
            if (opcode == EXTENDED_ARG) {
                extended_arg = extended_arg << 8 | instr->op.arg;
                continue;
            }
            if (opcode == LOAD_FAST_AND_CLEAR) {
                int oparg = extended_arg << 8 | instr->op.arg;
                if (oparg >= nlocalsplus) {
                    TyErr_Format(TyExc_ValueError,
                                "code: LOAD_FAST_AND_CLEAR oparg %d out of range",
                                oparg);
                    goto error;
                }
                _PyLocals_Kind kind = _PyLocals_GetKind(localspluskinds, oparg);
                _PyLocals_SetKind(localspluskinds, oparg, kind | CO_FAST_HIDDEN);
            }
            extended_arg = 0;
        }
    }

    // If any cells were args then nlocalsplus will have shrunk.
    if (nlocalsplus != TyTuple_GET_SIZE(localsplusnames)) {
        if (_TyTuple_Resize(&localsplusnames, nlocalsplus) < 0
                || _TyBytes_Resize(&localspluskinds, nlocalsplus) < 0) {
            goto error;
        }
    }

    struct _PyCodeConstructor con = {
        .filename = filename,
        .name = name,
        .qualname = qualname,
        .flags = flags,

        .code = code,
        .firstlineno = firstlineno,
        .linetable = linetable,

        .consts = consts,
        .names = names,

        .localsplusnames = localsplusnames,
        .localspluskinds = localspluskinds,

        .argcount = argcount,
        .posonlyargcount = posonlyargcount,
        .kwonlyargcount = kwonlyargcount,

        .stacksize = stacksize,

        .exceptiontable = exceptiontable,
    };

    if (_TyCode_Validate(&con) < 0) {
        goto error;
    }
    assert(TyBytes_GET_SIZE(code) % sizeof(_Ty_CODEUNIT) == 0);
    assert(_Ty_IS_ALIGNED(TyBytes_AS_STRING(code), sizeof(_Ty_CODEUNIT)));
    if (nlocals != TyTuple_GET_SIZE(varnames)) {
        TyErr_SetString(TyExc_ValueError,
                        "code: co_nlocals != len(co_varnames)");
        goto error;
    }

    co = _TyCode_New(&con);
    if (co == NULL) {
        goto error;
    }

error:
    Ty_XDECREF(localsplusnames);
    Ty_XDECREF(localspluskinds);
    return co;
}

PyCodeObject *
PyUnstable_Code_New(int argcount, int kwonlyargcount,
           int nlocals, int stacksize, int flags,
           TyObject *code, TyObject *consts, TyObject *names,
           TyObject *varnames, TyObject *freevars, TyObject *cellvars,
           TyObject *filename, TyObject *name, TyObject *qualname,
           int firstlineno,
           TyObject *linetable,
           TyObject *exceptiontable)
{
    return TyCode_NewWithPosOnlyArgs(argcount, 0, kwonlyargcount, nlocals,
                                     stacksize, flags, code, consts, names,
                                     varnames, freevars, cellvars, filename,
                                     name, qualname, firstlineno,
                                     linetable,
                                     exceptiontable);
}

// NOTE: When modifying the construction of TyCode_NewEmpty, please also change
// test.test_code.CodeLocationTest.test_code_new_empty to keep it in sync!

static const uint8_t assert0[6] = {
    RESUME, RESUME_AT_FUNC_START,
    LOAD_COMMON_CONSTANT, CONSTANT_ASSERTIONERROR,
    RAISE_VARARGS, 1
};

static const uint8_t linetable[2] = {
    (1 << 7)  // New entry.
    | (PY_CODE_LOCATION_INFO_NO_COLUMNS << 3)
    | (3 - 1),  // Three code units.
    0,  // Offset from co_firstlineno.
};

PyCodeObject *
TyCode_NewEmpty(const char *filename, const char *funcname, int firstlineno)
{
    TyObject *nulltuple = NULL;
    TyObject *filename_ob = NULL;
    TyObject *funcname_ob = NULL;
    TyObject *code_ob = NULL;
    TyObject *linetable_ob = NULL;
    PyCodeObject *result = NULL;

    nulltuple = TyTuple_New(0);
    if (nulltuple == NULL) {
        goto failed;
    }
    funcname_ob = TyUnicode_FromString(funcname);
    if (funcname_ob == NULL) {
        goto failed;
    }
    filename_ob = TyUnicode_DecodeFSDefault(filename);
    if (filename_ob == NULL) {
        goto failed;
    }
    code_ob = TyBytes_FromStringAndSize((const char *)assert0, 6);
    if (code_ob == NULL) {
        goto failed;
    }
    linetable_ob = TyBytes_FromStringAndSize((const char *)linetable, 2);
    if (linetable_ob == NULL) {
        goto failed;
    }

#define emptystring (TyObject *)&_Ty_SINGLETON(bytes_empty)
    struct _PyCodeConstructor con = {
        .filename = filename_ob,
        .name = funcname_ob,
        .qualname = funcname_ob,
        .code = code_ob,
        .firstlineno = firstlineno,
        .linetable = linetable_ob,
        .consts = nulltuple,
        .names = nulltuple,
        .localsplusnames = nulltuple,
        .localspluskinds = emptystring,
        .exceptiontable = emptystring,
        .stacksize = 1,
    };
    result = _TyCode_New(&con);

failed:
    Ty_XDECREF(nulltuple);
    Ty_XDECREF(funcname_ob);
    Ty_XDECREF(filename_ob);
    Ty_XDECREF(code_ob);
    Ty_XDECREF(linetable_ob);
    return result;
}


/******************
 * source location tracking (co_lines/co_positions)
 ******************/

int
TyCode_Addr2Line(PyCodeObject *co, int addrq)
{
    if (addrq < 0) {
        return co->co_firstlineno;
    }
    if (co->_co_monitoring && co->_co_monitoring->lines) {
        return _Ty_Instrumentation_GetLine(co, addrq/sizeof(_Ty_CODEUNIT));
    }
    assert(addrq >= 0 && addrq < _TyCode_NBYTES(co));
    PyCodeAddressRange bounds;
    _TyCode_InitAddressRange(co, &bounds);
    return _TyCode_CheckLineNumber(addrq, &bounds);
}

void
_PyLineTable_InitAddressRange(const char *linetable, Ty_ssize_t length, int firstlineno, PyCodeAddressRange *range)
{
    range->opaque.lo_next = (const uint8_t *)linetable;
    range->opaque.limit = range->opaque.lo_next + length;
    range->ar_start = -1;
    range->ar_end = 0;
    range->opaque.computed_line = firstlineno;
    range->ar_line = -1;
}

int
_TyCode_InitAddressRange(PyCodeObject* co, PyCodeAddressRange *bounds)
{
    assert(co->co_linetable != NULL);
    const char *linetable = TyBytes_AS_STRING(co->co_linetable);
    Ty_ssize_t length = TyBytes_GET_SIZE(co->co_linetable);
    _PyLineTable_InitAddressRange(linetable, length, co->co_firstlineno, bounds);
    return bounds->ar_line;
}

/* Update *bounds to describe the first and one-past-the-last instructions in
   the same line as lasti.  Return the number of that line, or -1 if lasti is out of bounds. */
int
_TyCode_CheckLineNumber(int lasti, PyCodeAddressRange *bounds)
{
    while (bounds->ar_end <= lasti) {
        if (!_PyLineTable_NextAddressRange(bounds)) {
            return -1;
        }
    }
    while (bounds->ar_start > lasti) {
        if (!_PyLineTable_PreviousAddressRange(bounds)) {
            return -1;
        }
    }
    return bounds->ar_line;
}

static int
is_no_line_marker(uint8_t b)
{
    return (b >> 3) == 0x1f;
}


#define ASSERT_VALID_BOUNDS(bounds) \
    assert(bounds->opaque.lo_next <=  bounds->opaque.limit && \
        (bounds->ar_line == -1 || bounds->ar_line == bounds->opaque.computed_line) && \
        (bounds->opaque.lo_next == bounds->opaque.limit || \
        (*bounds->opaque.lo_next) & 128))

static int
next_code_delta(PyCodeAddressRange *bounds)
{
    assert((*bounds->opaque.lo_next) & 128);
    return (((*bounds->opaque.lo_next) & 7) + 1) * sizeof(_Ty_CODEUNIT);
}

static int
previous_code_delta(PyCodeAddressRange *bounds)
{
    if (bounds->ar_start == 0) {
        // If we looking at the first entry, the
        // "previous" entry has an implicit length of 1.
        return 1;
    }
    const uint8_t *ptr = bounds->opaque.lo_next-1;
    while (((*ptr) & 128) == 0) {
        ptr--;
    }
    return (((*ptr) & 7) + 1) * sizeof(_Ty_CODEUNIT);
}

static int
read_byte(PyCodeAddressRange *bounds)
{
    return *bounds->opaque.lo_next++;
}

static int
read_varint(PyCodeAddressRange *bounds)
{
    unsigned int read = read_byte(bounds);
    unsigned int val = read & 63;
    unsigned int shift = 0;
    while (read & 64) {
        read = read_byte(bounds);
        shift += 6;
        val |= (read & 63) << shift;
    }
    return val;
}

static int
read_signed_varint(PyCodeAddressRange *bounds)
{
    unsigned int uval = read_varint(bounds);
    if (uval & 1) {
        return -(int)(uval >> 1);
    }
    else {
        return uval >> 1;
    }
}

static void
retreat(PyCodeAddressRange *bounds)
{
    ASSERT_VALID_BOUNDS(bounds);
    assert(bounds->ar_start >= 0);
    do {
        bounds->opaque.lo_next--;
    } while (((*bounds->opaque.lo_next) & 128) == 0);
    bounds->opaque.computed_line -= get_line_delta(bounds->opaque.lo_next);
    bounds->ar_end = bounds->ar_start;
    bounds->ar_start -= previous_code_delta(bounds);
    if (is_no_line_marker(bounds->opaque.lo_next[-1])) {
        bounds->ar_line = -1;
    }
    else {
        bounds->ar_line = bounds->opaque.computed_line;
    }
    ASSERT_VALID_BOUNDS(bounds);
}

static void
advance(PyCodeAddressRange *bounds)
{
    ASSERT_VALID_BOUNDS(bounds);
    bounds->opaque.computed_line += get_line_delta(bounds->opaque.lo_next);
    if (is_no_line_marker(*bounds->opaque.lo_next)) {
        bounds->ar_line = -1;
    }
    else {
        bounds->ar_line = bounds->opaque.computed_line;
    }
    bounds->ar_start = bounds->ar_end;
    bounds->ar_end += next_code_delta(bounds);
    do {
        bounds->opaque.lo_next++;
    } while (bounds->opaque.lo_next < bounds->opaque.limit &&
        ((*bounds->opaque.lo_next) & 128) == 0);
    ASSERT_VALID_BOUNDS(bounds);
}

static void
advance_with_locations(PyCodeAddressRange *bounds, int *endline, int *column, int *endcolumn)
{
    ASSERT_VALID_BOUNDS(bounds);
    int first_byte = read_byte(bounds);
    int code = (first_byte >> 3) & 15;
    bounds->ar_start = bounds->ar_end;
    bounds->ar_end = bounds->ar_start + ((first_byte & 7) + 1) * sizeof(_Ty_CODEUNIT);
    switch(code) {
        case PY_CODE_LOCATION_INFO_NONE:
            bounds->ar_line = *endline = -1;
            *column =  *endcolumn = -1;
            break;
        case PY_CODE_LOCATION_INFO_LONG:
        {
            bounds->opaque.computed_line += read_signed_varint(bounds);
            bounds->ar_line = bounds->opaque.computed_line;
            *endline = bounds->ar_line + read_varint(bounds);
            *column = read_varint(bounds)-1;
            *endcolumn = read_varint(bounds)-1;
            break;
        }
        case PY_CODE_LOCATION_INFO_NO_COLUMNS:
        {
            /* No column */
            bounds->opaque.computed_line += read_signed_varint(bounds);
            *endline = bounds->ar_line = bounds->opaque.computed_line;
            *column = *endcolumn = -1;
            break;
        }
        case PY_CODE_LOCATION_INFO_ONE_LINE0:
        case PY_CODE_LOCATION_INFO_ONE_LINE1:
        case PY_CODE_LOCATION_INFO_ONE_LINE2:
        {
            /* one line form */
            int line_delta = code - 10;
            bounds->opaque.computed_line += line_delta;
            *endline = bounds->ar_line = bounds->opaque.computed_line;
            *column = read_byte(bounds);
            *endcolumn = read_byte(bounds);
            break;
        }
        default:
        {
            /* Short forms */
            int second_byte = read_byte(bounds);
            assert((second_byte & 128) == 0);
            *endline = bounds->ar_line = bounds->opaque.computed_line;
            *column = code << 3 | (second_byte >> 4);
            *endcolumn = *column + (second_byte & 15);
        }
    }
    ASSERT_VALID_BOUNDS(bounds);
}
int
TyCode_Addr2Location(PyCodeObject *co, int addrq,
                     int *start_line, int *start_column,
                     int *end_line, int *end_column)
{
    if (addrq < 0) {
        *start_line = *end_line = co->co_firstlineno;
        *start_column = *end_column = 0;
        return 1;
    }
    assert(addrq >= 0 && addrq < _TyCode_NBYTES(co));
    PyCodeAddressRange bounds;
    _TyCode_InitAddressRange(co, &bounds);
    _TyCode_CheckLineNumber(addrq, &bounds);
    retreat(&bounds);
    advance_with_locations(&bounds, end_line, start_column, end_column);
    *start_line = bounds.ar_line;
    return 1;
}


static inline int
at_end(PyCodeAddressRange *bounds) {
    return bounds->opaque.lo_next >= bounds->opaque.limit;
}

int
_PyLineTable_PreviousAddressRange(PyCodeAddressRange *range)
{
    if (range->ar_start <= 0) {
        return 0;
    }
    retreat(range);
    assert(range->ar_end > range->ar_start);
    return 1;
}

int
_PyLineTable_NextAddressRange(PyCodeAddressRange *range)
{
    if (at_end(range)) {
        return 0;
    }
    advance(range);
    assert(range->ar_end > range->ar_start);
    return 1;
}

static int
emit_pair(TyObject **bytes, int *offset, int a, int b)
{
    Ty_ssize_t len = TyBytes_GET_SIZE(*bytes);
    if (*offset + 2 >= len) {
        if (_TyBytes_Resize(bytes, len * 2) < 0)
            return 0;
    }
    unsigned char *lnotab = (unsigned char *) TyBytes_AS_STRING(*bytes);
    lnotab += *offset;
    *lnotab++ = a;
    *lnotab++ = b;
    *offset += 2;
    return 1;
}

static int
emit_delta(TyObject **bytes, int bdelta, int ldelta, int *offset)
{
    while (bdelta > 255) {
        if (!emit_pair(bytes, offset, 255, 0)) {
            return 0;
        }
        bdelta -= 255;
    }
    while (ldelta > 127) {
        if (!emit_pair(bytes, offset, bdelta, 127)) {
            return 0;
        }
        bdelta = 0;
        ldelta -= 127;
    }
    while (ldelta < -128) {
        if (!emit_pair(bytes, offset, bdelta, -128)) {
            return 0;
        }
        bdelta = 0;
        ldelta += 128;
    }
    return emit_pair(bytes, offset, bdelta, ldelta);
}

static TyObject *
decode_linetable(PyCodeObject *code)
{
    PyCodeAddressRange bounds;
    TyObject *bytes;
    int table_offset = 0;
    int code_offset = 0;
    int line = code->co_firstlineno;
    bytes = TyBytes_FromStringAndSize(NULL, 64);
    if (bytes == NULL) {
        return NULL;
    }
    _TyCode_InitAddressRange(code, &bounds);
    while (_PyLineTable_NextAddressRange(&bounds)) {
        if (bounds.opaque.computed_line != line) {
            int bdelta = bounds.ar_start - code_offset;
            int ldelta = bounds.opaque.computed_line - line;
            if (!emit_delta(&bytes, bdelta, ldelta, &table_offset)) {
                Ty_DECREF(bytes);
                return NULL;
            }
            code_offset = bounds.ar_start;
            line = bounds.opaque.computed_line;
        }
    }
    _TyBytes_Resize(&bytes, table_offset);
    return bytes;
}


typedef struct {
    PyObject_HEAD
    PyCodeObject *li_code;
    PyCodeAddressRange li_line;
} lineiterator;


static void
lineiter_dealloc(TyObject *self)
{
    lineiterator *li = (lineiterator*)self;
    Ty_DECREF(li->li_code);
    Ty_TYPE(li)->tp_free(li);
}

static TyObject *
_source_offset_converter(void *arg) {
    int *value = (int*)arg;
    if (*value == -1) {
        Py_RETURN_NONE;
    }
    return TyLong_FromLong(*value);
}

static TyObject *
lineiter_next(TyObject *self)
{
    lineiterator *li = (lineiterator*)self;
    PyCodeAddressRange *bounds = &li->li_line;
    if (!_PyLineTable_NextAddressRange(bounds)) {
        return NULL;
    }
    int start = bounds->ar_start;
    int line = bounds->ar_line;
    // Merge overlapping entries:
    while (_PyLineTable_NextAddressRange(bounds)) {
        if (bounds->ar_line != line) {
            _PyLineTable_PreviousAddressRange(bounds);
            break;
        }
    }
    return Ty_BuildValue("iiO&", start, bounds->ar_end,
                         _source_offset_converter, &line);
}

TyTypeObject _PyLineIterator = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "line_iterator",                    /* tp_name */
    sizeof(lineiterator),               /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    lineiter_dealloc,                   /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    0,                                  /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    0,                                  /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,       /* tp_flags */
    0,                                  /* tp_doc */
    0,                                  /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    PyObject_SelfIter,                  /* tp_iter */
    lineiter_next,                      /* tp_iternext */
    0,                                  /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    0,                                  /* tp_alloc */
    0,                                  /* tp_new */
    PyObject_Free,                      /* tp_free */
};

static lineiterator *
new_linesiterator(PyCodeObject *code)
{
    lineiterator *li = (lineiterator *)TyType_GenericAlloc(&_PyLineIterator, 0);
    if (li == NULL) {
        return NULL;
    }
    li->li_code = (PyCodeObject*)Ty_NewRef(code);
    _TyCode_InitAddressRange(code, &li->li_line);
    return li;
}

/* co_positions iterator object. */
typedef struct {
    PyObject_HEAD
    PyCodeObject* pi_code;
    PyCodeAddressRange pi_range;
    int pi_offset;
    int pi_endline;
    int pi_column;
    int pi_endcolumn;
} positionsiterator;

static void
positionsiter_dealloc(TyObject *self)
{
    positionsiterator *pi = (positionsiterator*)self;
    Ty_DECREF(pi->pi_code);
    Ty_TYPE(pi)->tp_free(pi);
}

static TyObject*
positionsiter_next(TyObject *self)
{
    positionsiterator *pi = (positionsiterator*)self;
    if (pi->pi_offset >= pi->pi_range.ar_end) {
        assert(pi->pi_offset == pi->pi_range.ar_end);
        if (at_end(&pi->pi_range)) {
            return NULL;
        }
        advance_with_locations(&pi->pi_range, &pi->pi_endline, &pi->pi_column, &pi->pi_endcolumn);
    }
    pi->pi_offset += 2;
    return Ty_BuildValue("(O&O&O&O&)",
        _source_offset_converter, &pi->pi_range.ar_line,
        _source_offset_converter, &pi->pi_endline,
        _source_offset_converter, &pi->pi_column,
        _source_offset_converter, &pi->pi_endcolumn);
}

TyTypeObject _PyPositionsIterator = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "positions_iterator",               /* tp_name */
    sizeof(positionsiterator),          /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    positionsiter_dealloc,              /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    0,                                  /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    0,                                  /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,       /* tp_flags */
    0,                                  /* tp_doc */
    0,                                  /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    PyObject_SelfIter,                  /* tp_iter */
    positionsiter_next,                 /* tp_iternext */
    0,                                  /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    0,                                  /* tp_alloc */
    0,                                  /* tp_new */
    PyObject_Free,                      /* tp_free */
};

static TyObject*
code_positionsiterator(TyObject *self, TyObject* Py_UNUSED(args))
{
    PyCodeObject *code = (PyCodeObject*)self;
    positionsiterator* pi = (positionsiterator*)TyType_GenericAlloc(&_PyPositionsIterator, 0);
    if (pi == NULL) {
        return NULL;
    }
    pi->pi_code = (PyCodeObject*)Ty_NewRef(code);
    _TyCode_InitAddressRange(code, &pi->pi_range);
    pi->pi_offset = pi->pi_range.ar_end;
    return (TyObject*)pi;
}


/******************
 * "extra" frame eval info (see PEP 523)
 ******************/

/* Holder for co_extra information */
typedef struct {
    Ty_ssize_t ce_size;
    void *ce_extras[1];
} _PyCodeObjectExtra;


int
PyUnstable_Code_GetExtra(TyObject *code, Ty_ssize_t index, void **extra)
{
    if (!TyCode_Check(code)) {
        TyErr_BadInternalCall();
        return -1;
    }

    PyCodeObject *o = (PyCodeObject*) code;
    _PyCodeObjectExtra *co_extra = (_PyCodeObjectExtra*) o->co_extra;

    if (co_extra == NULL || index < 0 || co_extra->ce_size <= index) {
        *extra = NULL;
        return 0;
    }

    *extra = co_extra->ce_extras[index];
    return 0;
}


int
PyUnstable_Code_SetExtra(TyObject *code, Ty_ssize_t index, void *extra)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    if (!TyCode_Check(code) || index < 0 ||
            index >= interp->co_extra_user_count) {
        TyErr_BadInternalCall();
        return -1;
    }

    PyCodeObject *o = (PyCodeObject*) code;
    _PyCodeObjectExtra *co_extra = (_PyCodeObjectExtra *) o->co_extra;

    if (co_extra == NULL || co_extra->ce_size <= index) {
        Ty_ssize_t i = (co_extra == NULL ? 0 : co_extra->ce_size);
        co_extra = TyMem_Realloc(
                co_extra,
                sizeof(_PyCodeObjectExtra) +
                (interp->co_extra_user_count-1) * sizeof(void*));
        if (co_extra == NULL) {
            return -1;
        }
        for (; i < interp->co_extra_user_count; i++) {
            co_extra->ce_extras[i] = NULL;
        }
        co_extra->ce_size = interp->co_extra_user_count;
        o->co_extra = co_extra;
    }

    if (co_extra->ce_extras[index] != NULL) {
        freefunc free = interp->co_extra_freefuncs[index];
        if (free != NULL) {
            free(co_extra->ce_extras[index]);
        }
    }

    co_extra->ce_extras[index] = extra;
    return 0;
}


/******************
 * other PyCodeObject accessor functions
 ******************/

static TyObject *
get_cached_locals(PyCodeObject *co, TyObject **cached_field,
    _PyLocals_Kind kind, int num)
{
    assert(cached_field != NULL);
    assert(co->_co_cached != NULL);
    TyObject *varnames = FT_ATOMIC_LOAD_PTR(*cached_field);
    if (varnames != NULL) {
        return Ty_NewRef(varnames);
    }

    Ty_BEGIN_CRITICAL_SECTION(co);
    varnames = *cached_field;
    if (varnames == NULL) {
        varnames = get_localsplus_names(co, kind, num);
        if (varnames != NULL) {
            FT_ATOMIC_STORE_PTR(*cached_field, varnames);
        }
    }
    Ty_END_CRITICAL_SECTION();
    return Ty_XNewRef(varnames);
}

TyObject *
_TyCode_GetVarnames(PyCodeObject *co)
{
    if (init_co_cached(co)) {
        return NULL;
    }
    return get_cached_locals(co, &co->_co_cached->_co_varnames, CO_FAST_LOCAL, co->co_nlocals);
}

TyObject *
TyCode_GetVarnames(PyCodeObject *code)
{
    return _TyCode_GetVarnames(code);
}

TyObject *
_TyCode_GetCellvars(PyCodeObject *co)
{
    if (init_co_cached(co)) {
        return NULL;
    }
    return get_cached_locals(co, &co->_co_cached->_co_cellvars, CO_FAST_CELL, co->co_ncellvars);
}

TyObject *
TyCode_GetCellvars(PyCodeObject *code)
{
    return _TyCode_GetCellvars(code);
}

TyObject *
_TyCode_GetFreevars(PyCodeObject *co)
{
    if (init_co_cached(co)) {
        return NULL;
    }
    return get_cached_locals(co, &co->_co_cached->_co_freevars, CO_FAST_FREE, co->co_nfreevars);
}

TyObject *
TyCode_GetFreevars(PyCodeObject *code)
{
    return _TyCode_GetFreevars(code);
}


#define GET_OPARG(co, i, initial) (initial)
// We may want to move these macros to pycore_opcode_utils.h
// and use them in Python/bytecodes.c.
#define LOAD_GLOBAL_NAME_INDEX(oparg) ((oparg)>>1)
#define LOAD_ATTR_NAME_INDEX(oparg) ((oparg)>>1)

#ifndef Ty_DEBUG
#define GETITEM(v, i) TyTuple_GET_ITEM((v), (i))
#else
static inline TyObject *
GETITEM(TyObject *v, Ty_ssize_t i)
{
    assert(TyTuple_Check(v));
    assert(i >= 0);
    assert(i < TyTuple_GET_SIZE(v));
    assert(TyTuple_GET_ITEM(v, i) != NULL);
    return TyTuple_GET_ITEM(v, i);
}
#endif

static int
identify_unbound_names(TyThreadState *tstate, PyCodeObject *co,
                       TyObject *globalnames, TyObject *attrnames,
                       TyObject *globalsns, TyObject *builtinsns,
                       struct co_unbound_counts *counts, int *p_numdupes)
{
    // This function is inspired by inspect.getclosurevars().
    // It would be nicer if we had something similar to co_localspluskinds,
    // but for co_names.
    assert(globalnames != NULL);
    assert(TySet_Check(globalnames));
    assert(TySet_GET_SIZE(globalnames) == 0 || counts != NULL);
    assert(attrnames != NULL);
    assert(TySet_Check(attrnames));
    assert(TySet_GET_SIZE(attrnames) == 0 || counts != NULL);
    assert(globalsns == NULL || TyDict_Check(globalsns));
    assert(builtinsns == NULL || TyDict_Check(builtinsns));
    assert(counts == NULL || counts->total == 0);
    struct co_unbound_counts unbound = {0};
    int numdupes = 0;
    Ty_ssize_t len = Ty_SIZE(co);
    for (int i = 0; i < len; i += _PyInstruction_GetLength(co, i)) {
        _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(co, i);
        if (inst.op.code == LOAD_ATTR) {
            int oparg = GET_OPARG(co, i, inst.op.arg);
            int index = LOAD_ATTR_NAME_INDEX(oparg);
            TyObject *name = GETITEM(co->co_names, index);
            if (TySet_Contains(attrnames, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                continue;
            }
            unbound.total += 1;
            unbound.numattrs += 1;
            if (TySet_Add(attrnames, name) < 0) {
                return -1;
            }
            if (TySet_Contains(globalnames, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                numdupes += 1;
            }
        }
        else if (inst.op.code == LOAD_GLOBAL) {
            int oparg = GET_OPARG(co, i, inst.op.arg);
            int index = LOAD_ATTR_NAME_INDEX(oparg);
            TyObject *name = GETITEM(co->co_names, index);
            if (TySet_Contains(globalnames, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                continue;
            }
            unbound.total += 1;
            unbound.globals.total += 1;
            if (globalsns != NULL && TyDict_Contains(globalsns, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                unbound.globals.numglobal += 1;
            }
            else if (builtinsns != NULL && TyDict_Contains(builtinsns, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                unbound.globals.numbuiltin += 1;
            }
            else {
                unbound.globals.numunknown += 1;
            }
            if (TySet_Add(globalnames, name) < 0) {
                return -1;
            }
            if (TySet_Contains(attrnames, name)) {
                if (_TyErr_Occurred(tstate)) {
                    return -1;
                }
                numdupes += 1;
            }
        }
    }
    if (counts != NULL) {
        *counts = unbound;
    }
    if (p_numdupes != NULL) {
        *p_numdupes = numdupes;
    }
    return 0;
}


void
_TyCode_GetVarCounts(PyCodeObject *co, _TyCode_var_counts_t *counts)
{
    assert(counts != NULL);

    // Count the locals, cells, and free vars.
    struct co_locals_counts locals = {0};
    int numfree = 0;
    TyObject *kinds = co->co_localspluskinds;
    Ty_ssize_t numlocalplusfree = TyBytes_GET_SIZE(kinds);
    for (int i = 0; i < numlocalplusfree; i++) {
        _PyLocals_Kind kind = _PyLocals_GetKind(co->co_localspluskinds, i);
        if (kind & CO_FAST_FREE) {
            assert(!(kind & CO_FAST_LOCAL));
            assert(!(kind & CO_FAST_HIDDEN));
            assert(!(kind & CO_FAST_ARG));
            numfree += 1;
        }
        else {
            // Apparently not all non-free vars a CO_FAST_LOCAL.
            assert(kind);
            locals.total += 1;
            if (kind & CO_FAST_ARG) {
                locals.args.total += 1;
                if (kind & CO_FAST_ARG_VAR) {
                    if (kind & CO_FAST_ARG_POS) {
                        assert(!(kind & CO_FAST_ARG_KW));
                        assert(!locals.args.varargs);
                        locals.args.varargs = 1;
                    }
                    else {
                        assert(kind & CO_FAST_ARG_KW);
                        assert(!locals.args.varkwargs);
                        locals.args.varkwargs = 1;
                    }
                }
                else if (kind & CO_FAST_ARG_POS) {
                    if (kind & CO_FAST_ARG_KW) {
                        locals.args.numposorkw += 1;
                    }
                    else {
                        locals.args.numposonly += 1;
                    }
                }
                else {
                    assert(kind & CO_FAST_ARG_KW);
                    locals.args.numkwonly += 1;
                }
                if (kind & CO_FAST_CELL) {
                    locals.cells.total += 1;
                    locals.cells.numargs += 1;
                }
                // Args are never hidden currently.
                assert(!(kind & CO_FAST_HIDDEN));
            }
            else {
                if (kind & CO_FAST_CELL) {
                    locals.cells.total += 1;
                    locals.cells.numothers += 1;
                    if (kind & CO_FAST_HIDDEN) {
                        locals.hidden.total += 1;
                        locals.hidden.numcells += 1;
                    }
                }
                else {
                    locals.numpure += 1;
                    if (kind & CO_FAST_HIDDEN) {
                        locals.hidden.total += 1;
                        locals.hidden.numpure += 1;
                    }
                }
            }
        }
    }
    assert(locals.args.total == (
            co->co_argcount + co->co_kwonlyargcount
            + !!(co->co_flags & CO_VARARGS)
            + !!(co->co_flags & CO_VARKEYWORDS)));
    assert(locals.args.numposonly == co->co_posonlyargcount);
    assert(locals.args.numposonly + locals.args.numposorkw == co->co_argcount);
    assert(locals.args.numkwonly == co->co_kwonlyargcount);
    assert(locals.cells.total == co->co_ncellvars);
    assert(locals.args.total + locals.numpure == co->co_nlocals);
    assert(locals.total + locals.cells.numargs == co->co_nlocals + co->co_ncellvars);
    assert(locals.total + numfree == co->co_nlocalsplus);
    assert(numfree == co->co_nfreevars);

    // Get the unbound counts.
    assert(TyTuple_GET_SIZE(co->co_names) >= 0);
    assert(TyTuple_GET_SIZE(co->co_names) < INT_MAX);
    int numunbound = (int)TyTuple_GET_SIZE(co->co_names);
    struct co_unbound_counts unbound = {
        .total = numunbound,
        // numglobal and numattrs can be set later
        // with _TyCode_SetUnboundVarCounts().
        .numunknown = numunbound,
    };

    // "Return" the result.
    *counts = (_TyCode_var_counts_t){
        .total = locals.total + numfree + unbound.total,
        .locals = locals,
        .numfree = numfree,
        .unbound = unbound,
    };
}

int
_TyCode_SetUnboundVarCounts(TyThreadState *tstate,
                            PyCodeObject *co, _TyCode_var_counts_t *counts,
                            TyObject *globalnames, TyObject *attrnames,
                            TyObject *globalsns, TyObject *builtinsns)
{
    int res = -1;
    TyObject *globalnames_owned = NULL;
    TyObject *attrnames_owned = NULL;

    // Prep the name sets.
    if (globalnames == NULL) {
        globalnames_owned = TySet_New(NULL);
        if (globalnames_owned == NULL) {
            goto finally;
        }
        globalnames = globalnames_owned;
    }
    else if (!TySet_Check(globalnames)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                     "expected a set for \"globalnames\", got %R", globalnames);
        goto finally;
    }
    if (attrnames == NULL) {
        attrnames_owned = TySet_New(NULL);
        if (attrnames_owned == NULL) {
            goto finally;
        }
        attrnames = attrnames_owned;
    }
    else if (!TySet_Check(attrnames)) {
        _TyErr_Format(tstate, TyExc_TypeError,
                     "expected a set for \"attrnames\", got %R", attrnames);
        goto finally;
    }

    // Fill in unbound.globals and unbound.numattrs.
    struct co_unbound_counts unbound = {0};
    int numdupes = 0;
    Ty_BEGIN_CRITICAL_SECTION(co);
    res = identify_unbound_names(
            tstate, co, globalnames, attrnames, globalsns, builtinsns,
            &unbound, &numdupes);
    Ty_END_CRITICAL_SECTION();
    if (res < 0) {
        goto finally;
    }
    assert(unbound.numunknown == 0);
    assert(unbound.total - numdupes <= counts->unbound.total);
    assert(counts->unbound.numunknown == counts->unbound.total);
    // There may be a name that is both a global and an attr.
    int totalunbound = counts->unbound.total + numdupes;
    unbound.numunknown = totalunbound - unbound.total;
    unbound.total = totalunbound;
    counts->unbound = unbound;
    counts->total += numdupes;
    res = 0;

finally:
    Ty_XDECREF(globalnames_owned);
    Ty_XDECREF(attrnames_owned);
    return res;
}


int
_TyCode_CheckNoInternalState(PyCodeObject *co, const char **p_errmsg)
{
    const char *errmsg = NULL;
    // We don't worry about co_executors, co_instrumentation,
    // or co_monitoring.  They are essentially ephemeral.
    if (co->co_extra != NULL) {
        errmsg = "only basic code objects are supported";
    }

    if (errmsg != NULL) {
        if (p_errmsg != NULL) {
            *p_errmsg = errmsg;
        }
        return 0;
    }
    return 1;
}

int
_TyCode_CheckNoExternalState(PyCodeObject *co, _TyCode_var_counts_t *counts,
                             const char **p_errmsg)
{
    const char *errmsg = NULL;
    if (counts->numfree > 0) {  // It's a closure.
        errmsg = "closures not supported";
    }
    else if (counts->unbound.globals.numglobal > 0) {
        errmsg = "globals not supported";
    }
    else if (counts->unbound.globals.numbuiltin > 0
             && counts->unbound.globals.numunknown > 0)
    {
        errmsg = "globals not supported";
    }
    // Otherwise we don't check counts.unbound.globals.numunknown since we can't
    // distinguish beween globals and builtins here.

    if (errmsg != NULL) {
        if (p_errmsg != NULL) {
            *p_errmsg = errmsg;
        }
        return 0;
    }
    return 1;
}

int
_TyCode_VerifyStateless(TyThreadState *tstate,
                        PyCodeObject *co, TyObject *globalnames,
                        TyObject *globalsns, TyObject *builtinsns)
{
    const char *errmsg;
   _TyCode_var_counts_t counts = {0};
    _TyCode_GetVarCounts(co, &counts);
    if (_TyCode_SetUnboundVarCounts(
                            tstate, co, &counts, globalnames, NULL,
                            globalsns, builtinsns) < 0)
    {
        return -1;
    }
    // We may consider relaxing the internal state constraints
    // if it becomes a problem.
    if (!_TyCode_CheckNoInternalState(co, &errmsg)) {
        _TyErr_SetString(tstate, TyExc_ValueError, errmsg);
        return -1;
    }
    if (builtinsns != NULL) {
        // Make sure the next check will fail for globals,
        // even if there aren't any builtins.
        counts.unbound.globals.numbuiltin += 1;
    }
    if (!_TyCode_CheckNoExternalState(co, &counts, &errmsg)) {
        _TyErr_SetString(tstate, TyExc_ValueError, errmsg);
        return -1;
    }
    // Note that we don't check co->co_flags & CO_NESTED for anything here.
    return 0;
}


int
_TyCode_CheckPureFunction(PyCodeObject *co, const char **p_errmsg)
{
    const char *errmsg = NULL;
    if (co->co_flags & CO_GENERATOR) {
        errmsg = "generators not supported";
    }
    else if (co->co_flags & CO_COROUTINE) {
        errmsg = "coroutines not supported";
    }
    else if (co->co_flags & CO_ITERABLE_COROUTINE) {
        errmsg = "coroutines not supported";
    }
    else if (co->co_flags & CO_ASYNC_GENERATOR) {
        errmsg = "generators not supported";
    }

    if (errmsg != NULL) {
        if (p_errmsg != NULL) {
            *p_errmsg = errmsg;
        }
        return 0;
    }
    return 1;
}

/* Here "value" means a non-None value, since a bare return is identical
 * to returning None explicitly.  Likewise a missing return statement
 * at the end of the function is turned into "return None". */
static int
code_returns_only_none(PyCodeObject *co)
{
    if (!_TyCode_CheckPureFunction(co, NULL)) {
        return 0;
    }
    int len = (int)Ty_SIZE(co);
    assert(len > 0);

    // The last instruction either returns or raises.  We can take advantage
    // of that for a quick exit.
    _Ty_CODEUNIT final = _Ty_GetBaseCodeUnit(co, len-1);

    // Look up None in co_consts.
    Ty_ssize_t nconsts = TyTuple_Size(co->co_consts);
    int none_index = 0;
    for (; none_index < nconsts; none_index++) {
        if (TyTuple_GET_ITEM(co->co_consts, none_index) == Ty_None) {
            break;
        }
    }
    if (none_index == nconsts) {
        // None wasn't there, which means there was no implicit return,
        // "return", or "return None".

        // That means there must be
        // an explicit return (non-None), or it only raises.
        if (IS_RETURN_OPCODE(final.op.code)) {
            // It was an explicit return (non-None).
            return 0;
        }
        // It must end with a raise then.  We still have to walk the
        // bytecode to see if there's any explicit return (non-None).
        assert(IS_RAISE_OPCODE(final.op.code));
        for (int i = 0; i < len; i += _PyInstruction_GetLength(co, i)) {
            _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(co, i);
            if (IS_RETURN_OPCODE(inst.op.code)) {
                // We alraedy know it isn't returning None.
                return 0;
            }
        }
        // It must only raise.
    }
    else {
        // Walk the bytecode, looking for RETURN_VALUE.
        for (int i = 0; i < len; i += _PyInstruction_GetLength(co, i)) {
            _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(co, i);
            if (IS_RETURN_OPCODE(inst.op.code)) {
                assert(i != 0);
                // Ignore it if it returns None.
                _Ty_CODEUNIT prev = _Ty_GetBaseCodeUnit(co, i-1);
                if (prev.op.code == LOAD_CONST) {
                    // We don't worry about EXTENDED_ARG for now.
                    if (prev.op.arg == none_index) {
                        continue;
                    }
                }
                return 0;
            }
        }
    }
    return 1;
}

int
_TyCode_ReturnsOnlyNone(PyCodeObject *co)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(co);
    res = code_returns_only_none(co);
    Ty_END_CRITICAL_SECTION();
    return res;
}


#ifdef _Ty_TIER2

static void
clear_executors(PyCodeObject *co)
{
    assert(co->co_executors);
    for (int i = 0; i < co->co_executors->size; i++) {
        if (co->co_executors->executors[i]) {
            _Ty_ExecutorDetach(co->co_executors->executors[i]);
            assert(co->co_executors->executors[i] == NULL);
        }
    }
    TyMem_Free(co->co_executors);
    co->co_executors = NULL;
}

void
_TyCode_Clear_Executors(PyCodeObject *code)
{
    clear_executors(code);
}

#endif

static void
deopt_code(PyCodeObject *code, _Ty_CODEUNIT *instructions)
{
    Ty_ssize_t len = Ty_SIZE(code);
    for (int i = 0; i < len; i++) {
        _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(code, i);
        assert(inst.op.code < MIN_SPECIALIZED_OPCODE);
        int caches = _TyOpcode_Caches[inst.op.code];
        instructions[i] = inst;
        for (int j = 1; j <= caches; j++) {
            instructions[i+j].cache = 0;
        }
        i += caches;
    }
}

TyObject *
_TyCode_GetCode(PyCodeObject *co)
{
    if (init_co_cached(co)) {
        return NULL;
    }

    _PyCoCached *cached = co->_co_cached;
    TyObject *code = FT_ATOMIC_LOAD_PTR(cached->_co_code);
    if (code != NULL) {
        return Ty_NewRef(code);
    }

    Ty_BEGIN_CRITICAL_SECTION(co);
    code = cached->_co_code;
    if (code == NULL) {
        code = TyBytes_FromStringAndSize((const char *)_TyCode_CODE(co),
                                         _TyCode_NBYTES(co));
        if (code != NULL) {
            deopt_code(co, (_Ty_CODEUNIT *)TyBytes_AS_STRING(code));
            assert(cached->_co_code == NULL);
            FT_ATOMIC_STORE_PTR(cached->_co_code, code);
        }
    }
    Ty_END_CRITICAL_SECTION();
    return Ty_XNewRef(code);
}

TyObject *
TyCode_GetCode(PyCodeObject *co)
{
    return _TyCode_GetCode(co);
}

/******************
 * TyCode_Type
 ******************/

/*[clinic input]
class code "PyCodeObject *" "&TyCode_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=78aa5d576683bb4b]*/

/*[clinic input]
@classmethod
code.__new__ as code_new

    argcount: int
    posonlyargcount: int
    kwonlyargcount: int
    nlocals: int
    stacksize: int
    flags: int
    codestring as code: object(subclass_of="&TyBytes_Type")
    constants as consts: object(subclass_of="&TyTuple_Type")
    names: object(subclass_of="&TyTuple_Type")
    varnames: object(subclass_of="&TyTuple_Type")
    filename: unicode
    name: unicode
    qualname: unicode
    firstlineno: int
    linetable: object(subclass_of="&TyBytes_Type")
    exceptiontable: object(subclass_of="&TyBytes_Type")
    freevars: object(subclass_of="&TyTuple_Type", c_default="NULL") = ()
    cellvars: object(subclass_of="&TyTuple_Type", c_default="NULL") = ()
    /

Create a code object.  Not for the faint of heart.
[clinic start generated code]*/

static TyObject *
code_new_impl(TyTypeObject *type, int argcount, int posonlyargcount,
              int kwonlyargcount, int nlocals, int stacksize, int flags,
              TyObject *code, TyObject *consts, TyObject *names,
              TyObject *varnames, TyObject *filename, TyObject *name,
              TyObject *qualname, int firstlineno, TyObject *linetable,
              TyObject *exceptiontable, TyObject *freevars,
              TyObject *cellvars)
/*[clinic end generated code: output=069fa20d299f9dda input=e31da3c41ad8064a]*/
{
    TyObject *co = NULL;
    TyObject *ournames = NULL;
    TyObject *ourvarnames = NULL;
    TyObject *ourfreevars = NULL;
    TyObject *ourcellvars = NULL;

    if (TySys_Audit("code.__new__", "OOOiiiiii",
                    code, filename, name, argcount, posonlyargcount,
                    kwonlyargcount, nlocals, stacksize, flags) < 0) {
        goto cleanup;
    }

    if (argcount < 0) {
        TyErr_SetString(
            TyExc_ValueError,
            "code: argcount must not be negative");
        goto cleanup;
    }

    if (posonlyargcount < 0) {
        TyErr_SetString(
            TyExc_ValueError,
            "code: posonlyargcount must not be negative");
        goto cleanup;
    }

    if (kwonlyargcount < 0) {
        TyErr_SetString(
            TyExc_ValueError,
            "code: kwonlyargcount must not be negative");
        goto cleanup;
    }
    if (nlocals < 0) {
        TyErr_SetString(
            TyExc_ValueError,
            "code: nlocals must not be negative");
        goto cleanup;
    }

    ournames = validate_and_copy_tuple(names);
    if (ournames == NULL)
        goto cleanup;
    ourvarnames = validate_and_copy_tuple(varnames);
    if (ourvarnames == NULL)
        goto cleanup;
    if (freevars)
        ourfreevars = validate_and_copy_tuple(freevars);
    else
        ourfreevars = TyTuple_New(0);
    if (ourfreevars == NULL)
        goto cleanup;
    if (cellvars)
        ourcellvars = validate_and_copy_tuple(cellvars);
    else
        ourcellvars = TyTuple_New(0);
    if (ourcellvars == NULL)
        goto cleanup;

    co = (TyObject *)TyCode_NewWithPosOnlyArgs(argcount, posonlyargcount,
                                               kwonlyargcount,
                                               nlocals, stacksize, flags,
                                               code, consts, ournames,
                                               ourvarnames, ourfreevars,
                                               ourcellvars, filename,
                                               name, qualname, firstlineno,
                                               linetable,
                                               exceptiontable
                                              );
  cleanup:
    Ty_XDECREF(ournames);
    Ty_XDECREF(ourvarnames);
    Ty_XDECREF(ourfreevars);
    Ty_XDECREF(ourcellvars);
    return co;
}

static void
free_monitoring_data(_PyCoMonitoringData *data)
{
    if (data == NULL) {
        return;
    }
    if (data->tools) {
        TyMem_Free(data->tools);
    }
    if (data->lines) {
        TyMem_Free(data->lines);
    }
    if (data->line_tools) {
        TyMem_Free(data->line_tools);
    }
    if (data->per_instruction_opcodes) {
        TyMem_Free(data->per_instruction_opcodes);
    }
    if (data->per_instruction_tools) {
        TyMem_Free(data->per_instruction_tools);
    }
    TyMem_Free(data);
}

static void
code_dealloc(TyObject *self)
{
    TyThreadState *tstate = TyThreadState_GET();
    _Ty_atomic_add_uint64(&tstate->interp->_code_object_generation, 1);
    PyCodeObject *co = _PyCodeObject_CAST(self);
    _TyObject_ResurrectStart(self);
    notify_code_watchers(PY_CODE_EVENT_DESTROY, co);
    if (_TyObject_ResurrectEnd(self)) {
        return;
    }

#ifdef Ty_GIL_DISABLED
    PyObject_GC_UnTrack(co);
#endif

    _TyFunction_ClearCodeByVersion(co->co_version);
    if (co->co_extra != NULL) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        _PyCodeObjectExtra *co_extra = co->co_extra;

        for (Ty_ssize_t i = 0; i < co_extra->ce_size; i++) {
            freefunc free_extra = interp->co_extra_freefuncs[i];

            if (free_extra != NULL) {
                free_extra(co_extra->ce_extras[i]);
            }
        }

        TyMem_Free(co_extra);
    }
#ifdef _Ty_TIER2
    if (co->co_executors != NULL) {
        clear_executors(co);
    }
#endif

    Ty_XDECREF(co->co_consts);
    Ty_XDECREF(co->co_names);
    Ty_XDECREF(co->co_localsplusnames);
    Ty_XDECREF(co->co_localspluskinds);
    Ty_XDECREF(co->co_filename);
    Ty_XDECREF(co->co_name);
    Ty_XDECREF(co->co_qualname);
    Ty_XDECREF(co->co_linetable);
    Ty_XDECREF(co->co_exceptiontable);
#ifdef Ty_GIL_DISABLED
    assert(co->_co_unique_id == _Ty_INVALID_UNIQUE_ID);
#endif
    if (co->_co_cached != NULL) {
        Ty_XDECREF(co->_co_cached->_co_code);
        Ty_XDECREF(co->_co_cached->_co_cellvars);
        Ty_XDECREF(co->_co_cached->_co_freevars);
        Ty_XDECREF(co->_co_cached->_co_varnames);
        TyMem_Free(co->_co_cached);
    }
    FT_CLEAR_WEAKREFS(self, co->co_weakreflist);
    free_monitoring_data(co->_co_monitoring);
#ifdef Ty_GIL_DISABLED
    // The first element always points to the mutable bytecode at the end of
    // the code object, which will be freed when the code object is freed.
    for (Ty_ssize_t i = 1; i < co->co_tlbc->size; i++) {
        char *entry = co->co_tlbc->entries[i];
        if (entry != NULL) {
            TyMem_Free(entry);
        }
    }
    TyMem_Free(co->co_tlbc);
#endif
    PyObject_Free(co);
}

#ifdef Ty_GIL_DISABLED
static int
code_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyCodeObject *co = _PyCodeObject_CAST(self);
    Ty_VISIT(co->co_consts);
    return 0;
}
#endif

static TyObject *
code_repr(TyObject *self)
{
    PyCodeObject *co = _PyCodeObject_CAST(self);
    int lineno;
    if (co->co_firstlineno != 0)
        lineno = co->co_firstlineno;
    else
        lineno = -1;
    if (co->co_filename && TyUnicode_Check(co->co_filename)) {
        return TyUnicode_FromFormat(
            "<code object %U at %p, file \"%U\", line %d>",
            co->co_name, co, co->co_filename, lineno);
    } else {
        return TyUnicode_FromFormat(
            "<code object %U at %p, file ???, line %d>",
            co->co_name, co, lineno);
    }
}

static TyObject *
code_richcompare(TyObject *self, TyObject *other, int op)
{
    PyCodeObject *co, *cp;
    int eq;
    TyObject *consts1, *consts2;
    TyObject *res;

    if ((op != Py_EQ && op != Py_NE) ||
        !TyCode_Check(self) ||
        !TyCode_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    co = (PyCodeObject *)self;
    cp = (PyCodeObject *)other;

    eq = PyObject_RichCompareBool(co->co_name, cp->co_name, Py_EQ);
    if (!eq) goto unequal;
    eq = co->co_argcount == cp->co_argcount;
    if (!eq) goto unequal;
    eq = co->co_posonlyargcount == cp->co_posonlyargcount;
    if (!eq) goto unequal;
    eq = co->co_kwonlyargcount == cp->co_kwonlyargcount;
    if (!eq) goto unequal;
    eq = co->co_flags == cp->co_flags;
    if (!eq) goto unequal;
    eq = co->co_firstlineno == cp->co_firstlineno;
    if (!eq) goto unequal;
    eq = Ty_SIZE(co) == Ty_SIZE(cp);
    if (!eq) {
        goto unequal;
    }
    for (int i = 0; i < Ty_SIZE(co); i++) {
        _Ty_CODEUNIT co_instr = _Ty_GetBaseCodeUnit(co, i);
        _Ty_CODEUNIT cp_instr = _Ty_GetBaseCodeUnit(cp, i);
        if (co_instr.cache != cp_instr.cache) {
            goto unequal;
        }
        i += _TyOpcode_Caches[co_instr.op.code];
    }

    /* compare constants */
    consts1 = _TyCode_ConstantKey(co->co_consts);
    if (!consts1)
        return NULL;
    consts2 = _TyCode_ConstantKey(cp->co_consts);
    if (!consts2) {
        Ty_DECREF(consts1);
        return NULL;
    }
    eq = PyObject_RichCompareBool(consts1, consts2, Py_EQ);
    Ty_DECREF(consts1);
    Ty_DECREF(consts2);
    if (eq <= 0) goto unequal;

    eq = PyObject_RichCompareBool(co->co_names, cp->co_names, Py_EQ);
    if (eq <= 0) goto unequal;
    eq = PyObject_RichCompareBool(co->co_localsplusnames,
                                  cp->co_localsplusnames, Py_EQ);
    if (eq <= 0) goto unequal;
    eq = PyObject_RichCompareBool(co->co_linetable, cp->co_linetable, Py_EQ);
    if (eq <= 0) {
        goto unequal;
    }
    eq = PyObject_RichCompareBool(co->co_exceptiontable,
                                  cp->co_exceptiontable, Py_EQ);
    if (eq <= 0) {
        goto unequal;
    }

    if (op == Py_EQ)
        res = Ty_True;
    else
        res = Ty_False;
    goto done;

  unequal:
    if (eq < 0)
        return NULL;
    if (op == Py_NE)
        res = Ty_True;
    else
        res = Ty_False;

  done:
    return Ty_NewRef(res);
}

static Ty_hash_t
code_hash(TyObject *self)
{
    PyCodeObject *co = _PyCodeObject_CAST(self);
    Ty_uhash_t uhash = 20221211;
    #define SCRAMBLE_IN(H) do {       \
        uhash ^= (Ty_uhash_t)(H);     \
        uhash *= PyHASH_MULTIPLIER;  \
    } while (0)
    #define SCRAMBLE_IN_HASH(EXPR) do {     \
        Ty_hash_t h = PyObject_Hash(EXPR);  \
        if (h == -1) {                      \
            return -1;                      \
        }                                   \
        SCRAMBLE_IN(h);                     \
    } while (0)

    SCRAMBLE_IN_HASH(co->co_name);
    SCRAMBLE_IN_HASH(co->co_consts);
    SCRAMBLE_IN_HASH(co->co_names);
    SCRAMBLE_IN_HASH(co->co_localsplusnames);
    SCRAMBLE_IN_HASH(co->co_linetable);
    SCRAMBLE_IN_HASH(co->co_exceptiontable);
    SCRAMBLE_IN(co->co_argcount);
    SCRAMBLE_IN(co->co_posonlyargcount);
    SCRAMBLE_IN(co->co_kwonlyargcount);
    SCRAMBLE_IN(co->co_flags);
    SCRAMBLE_IN(co->co_firstlineno);
    SCRAMBLE_IN(Ty_SIZE(co));
    for (int i = 0; i < Ty_SIZE(co); i++) {
        _Ty_CODEUNIT co_instr = _Ty_GetBaseCodeUnit(co, i);
        SCRAMBLE_IN(co_instr.op.code);
        SCRAMBLE_IN(co_instr.op.arg);
        i += _TyOpcode_Caches[co_instr.op.code];
    }
    if ((Ty_hash_t)uhash == -1) {
        return -2;
    }
    return (Ty_hash_t)uhash;
}


#define OFF(x) offsetof(PyCodeObject, x)

static TyMemberDef code_memberlist[] = {
    {"co_argcount",        Ty_T_INT,     OFF(co_argcount),        Py_READONLY},
    {"co_posonlyargcount", Ty_T_INT,     OFF(co_posonlyargcount), Py_READONLY},
    {"co_kwonlyargcount",  Ty_T_INT,     OFF(co_kwonlyargcount),  Py_READONLY},
    {"co_stacksize",       Ty_T_INT,     OFF(co_stacksize),       Py_READONLY},
    {"co_flags",           Ty_T_INT,     OFF(co_flags),           Py_READONLY},
    {"co_nlocals",         Ty_T_INT,     OFF(co_nlocals),         Py_READONLY},
    {"co_consts",          _Ty_T_OBJECT, OFF(co_consts),          Py_READONLY},
    {"co_names",           _Ty_T_OBJECT, OFF(co_names),           Py_READONLY},
    {"co_filename",        _Ty_T_OBJECT, OFF(co_filename),        Py_READONLY},
    {"co_name",            _Ty_T_OBJECT, OFF(co_name),            Py_READONLY},
    {"co_qualname",        _Ty_T_OBJECT, OFF(co_qualname),        Py_READONLY},
    {"co_firstlineno",     Ty_T_INT,     OFF(co_firstlineno),     Py_READONLY},
    {"co_linetable",       _Ty_T_OBJECT, OFF(co_linetable),       Py_READONLY},
    {"co_exceptiontable",  _Ty_T_OBJECT, OFF(co_exceptiontable),  Py_READONLY},
    {NULL}      /* Sentinel */
};


static TyObject *
code_getlnotab(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
                     "co_lnotab is deprecated, use co_lines instead.",
                     1) < 0) {
        return NULL;
    }
    return decode_linetable(code);
}

static TyObject *
code_getvarnames(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return _TyCode_GetVarnames(code);
}

static TyObject *
code_getcellvars(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return _TyCode_GetCellvars(code);
}

static TyObject *
code_getfreevars(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return _TyCode_GetFreevars(code);
}

static TyObject *
code_getcodeadaptive(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return TyBytes_FromStringAndSize(code->co_code_adaptive,
                                     _TyCode_NBYTES(code));
}

static TyObject *
code_getcode(TyObject *self, void *closure)
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return _TyCode_GetCode(code);
}

static TyGetSetDef code_getsetlist[] = {
    {"co_lnotab",         code_getlnotab,       NULL, NULL},
    {"_co_code_adaptive", code_getcodeadaptive, NULL, NULL},
    // The following old names are kept for backward compatibility.
    {"co_varnames",       code_getvarnames,     NULL, NULL},
    {"co_cellvars",       code_getcellvars,     NULL, NULL},
    {"co_freevars",       code_getfreevars,     NULL, NULL},
    {"co_code",           code_getcode,         NULL, NULL},
    {0}
};


static TyObject *
code_sizeof(TyObject *self, TyObject *Py_UNUSED(args))
{
    PyCodeObject *co = _PyCodeObject_CAST(self);
    size_t res = _TyObject_VAR_SIZE(Ty_TYPE(co), Ty_SIZE(co));
    _PyCodeObjectExtra *co_extra = (_PyCodeObjectExtra*) co->co_extra;
    if (co_extra != NULL) {
        res += sizeof(_PyCodeObjectExtra);
        res += ((size_t)co_extra->ce_size - 1) * sizeof(co_extra->ce_extras[0]);
    }
    return TyLong_FromSize_t(res);
}

static TyObject *
code_linesiterator(TyObject *self, TyObject *Py_UNUSED(args))
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return (TyObject *)new_linesiterator(code);
}

static TyObject *
code_branchesiterator(TyObject *self, TyObject *Py_UNUSED(args))
{
    PyCodeObject *code = _PyCodeObject_CAST(self);
    return _PyInstrumentation_BranchesIterator(code);
}

/*[clinic input]
@text_signature "($self, /, **changes)"
code.replace

    *
    co_argcount: int(c_default="((PyCodeObject *)self)->co_argcount") = unchanged
    co_posonlyargcount: int(c_default="((PyCodeObject *)self)->co_posonlyargcount") = unchanged
    co_kwonlyargcount: int(c_default="((PyCodeObject *)self)->co_kwonlyargcount") = unchanged
    co_nlocals: int(c_default="((PyCodeObject *)self)->co_nlocals") = unchanged
    co_stacksize: int(c_default="((PyCodeObject *)self)->co_stacksize") = unchanged
    co_flags: int(c_default="((PyCodeObject *)self)->co_flags") = unchanged
    co_firstlineno: int(c_default="((PyCodeObject *)self)->co_firstlineno") = unchanged
    co_code: object(subclass_of="&TyBytes_Type", c_default="NULL") = unchanged
    co_consts: object(subclass_of="&TyTuple_Type", c_default="((PyCodeObject *)self)->co_consts") = unchanged
    co_names: object(subclass_of="&TyTuple_Type", c_default="((PyCodeObject *)self)->co_names") = unchanged
    co_varnames: object(subclass_of="&TyTuple_Type", c_default="NULL") = unchanged
    co_freevars: object(subclass_of="&TyTuple_Type", c_default="NULL") = unchanged
    co_cellvars: object(subclass_of="&TyTuple_Type", c_default="NULL") = unchanged
    co_filename: unicode(c_default="((PyCodeObject *)self)->co_filename") = unchanged
    co_name: unicode(c_default="((PyCodeObject *)self)->co_name") = unchanged
    co_qualname: unicode(c_default="((PyCodeObject *)self)->co_qualname") = unchanged
    co_linetable: object(subclass_of="&TyBytes_Type", c_default="((PyCodeObject *)self)->co_linetable") = unchanged
    co_exceptiontable: object(subclass_of="&TyBytes_Type", c_default="((PyCodeObject *)self)->co_exceptiontable") = unchanged

Return a copy of the code object with new values for the specified fields.
[clinic start generated code]*/

static TyObject *
code_replace_impl(PyCodeObject *self, int co_argcount,
                  int co_posonlyargcount, int co_kwonlyargcount,
                  int co_nlocals, int co_stacksize, int co_flags,
                  int co_firstlineno, TyObject *co_code, TyObject *co_consts,
                  TyObject *co_names, TyObject *co_varnames,
                  TyObject *co_freevars, TyObject *co_cellvars,
                  TyObject *co_filename, TyObject *co_name,
                  TyObject *co_qualname, TyObject *co_linetable,
                  TyObject *co_exceptiontable)
/*[clinic end generated code: output=e75c48a15def18b9 input=a455a89c57ac9d42]*/
{
#define CHECK_INT_ARG(ARG) \
        if (ARG < 0) { \
            TyErr_SetString(TyExc_ValueError, \
                            #ARG " must be a positive integer"); \
            return NULL; \
        }

    CHECK_INT_ARG(co_argcount);
    CHECK_INT_ARG(co_posonlyargcount);
    CHECK_INT_ARG(co_kwonlyargcount);
    CHECK_INT_ARG(co_nlocals);
    CHECK_INT_ARG(co_stacksize);
    CHECK_INT_ARG(co_flags);
    CHECK_INT_ARG(co_firstlineno);

#undef CHECK_INT_ARG

    TyObject *code = NULL;
    if (co_code == NULL) {
        code = _TyCode_GetCode(self);
        if (code == NULL) {
            return NULL;
        }
        co_code = code;
    }

    if (TySys_Audit("code.__new__", "OOOiiiiii",
                    co_code, co_filename, co_name, co_argcount,
                    co_posonlyargcount, co_kwonlyargcount, co_nlocals,
                    co_stacksize, co_flags) < 0) {
        Ty_XDECREF(code);
        return NULL;
    }

    PyCodeObject *co = NULL;
    TyObject *varnames = NULL;
    TyObject *cellvars = NULL;
    TyObject *freevars = NULL;
    if (co_varnames == NULL) {
        varnames = get_localsplus_names(self, CO_FAST_LOCAL, self->co_nlocals);
        if (varnames == NULL) {
            goto error;
        }
        co_varnames = varnames;
    }
    if (co_cellvars == NULL) {
        cellvars = get_localsplus_names(self, CO_FAST_CELL, self->co_ncellvars);
        if (cellvars == NULL) {
            goto error;
        }
        co_cellvars = cellvars;
    }
    if (co_freevars == NULL) {
        freevars = get_localsplus_names(self, CO_FAST_FREE, self->co_nfreevars);
        if (freevars == NULL) {
            goto error;
        }
        co_freevars = freevars;
    }

    co = TyCode_NewWithPosOnlyArgs(
        co_argcount, co_posonlyargcount, co_kwonlyargcount, co_nlocals,
        co_stacksize, co_flags, co_code, co_consts, co_names,
        co_varnames, co_freevars, co_cellvars, co_filename, co_name,
        co_qualname, co_firstlineno,
        co_linetable, co_exceptiontable);

error:
    Ty_XDECREF(code);
    Ty_XDECREF(varnames);
    Ty_XDECREF(cellvars);
    Ty_XDECREF(freevars);
    return (TyObject *)co;
}

/*[clinic input]
code._varname_from_oparg

    oparg: int

(internal-only) Return the local variable name for the given oparg.

WARNING: this method is for internal use only and may change or go away.
[clinic start generated code]*/

static TyObject *
code__varname_from_oparg_impl(PyCodeObject *self, int oparg)
/*[clinic end generated code: output=1fd1130413184206 input=c5fa3ee9bac7d4ca]*/
{
    TyObject *name = TyTuple_GetItem(self->co_localsplusnames, oparg);
    if (name == NULL) {
        return NULL;
    }
    return Ty_NewRef(name);
}

/* XXX code objects need to participate in GC? */

static struct TyMethodDef code_methods[] = {
    {"__sizeof__", code_sizeof, METH_NOARGS},
    {"co_lines", code_linesiterator, METH_NOARGS},
    {"co_branches", code_branchesiterator, METH_NOARGS},
    {"co_positions", code_positionsiterator, METH_NOARGS},
    CODE_REPLACE_METHODDEF
    CODE__VARNAME_FROM_OPARG_METHODDEF
    {"__replace__", _PyCFunction_CAST(code_replace), METH_FASTCALL|METH_KEYWORDS,
     TyDoc_STR("__replace__($self, /, **changes)\n--\n\nThe same as replace().")},
    {NULL, NULL}                /* sentinel */
};


TyTypeObject TyCode_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "code",
    offsetof(PyCodeObject, co_code_adaptive),
    sizeof(_Ty_CODEUNIT),
    code_dealloc,                       /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    code_repr,                          /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    code_hash,                          /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
#ifdef Ty_GIL_DISABLED
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
#else
    Ty_TPFLAGS_DEFAULT,                 /* tp_flags */
#endif
    code_new__doc__,                    /* tp_doc */
#ifdef Ty_GIL_DISABLED
    code_traverse,                      /* tp_traverse */
#else
    0,                                  /* tp_traverse */
#endif
    0,                                  /* tp_clear */
    code_richcompare,                   /* tp_richcompare */
    offsetof(PyCodeObject, co_weakreflist),     /* tp_weaklistoffset */
    0,                                  /* tp_iter */
    0,                                  /* tp_iternext */
    code_methods,                       /* tp_methods */
    code_memberlist,                    /* tp_members */
    code_getsetlist,                    /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    0,                                  /* tp_alloc */
    code_new,                           /* tp_new */
};


/******************
 * other API
 ******************/

TyObject*
_TyCode_ConstantKey(TyObject *op)
{
    TyObject *key;

    /* Ty_None and Ty_Ellipsis are singletons. */
    if (op == Ty_None || op == Ty_Ellipsis
       || TyLong_CheckExact(op)
       || TyUnicode_CheckExact(op)
          /* code_richcompare() uses _TyCode_ConstantKey() internally */
       || TyCode_Check(op))
    {
        /* Objects of these types are always different from object of other
         * type and from tuples. */
        key = Ty_NewRef(op);
    }
    else if (TyBool_Check(op) || TyBytes_CheckExact(op)) {
        /* Make booleans different from integers 0 and 1.
         * Avoid BytesWarning from comparing bytes with strings. */
        key = TyTuple_Pack(2, Ty_TYPE(op), op);
    }
    else if (TyFloat_CheckExact(op)) {
        double d = TyFloat_AS_DOUBLE(op);
        /* all we need is to make the tuple different in either the 0.0
         * or -0.0 case from all others, just to avoid the "coercion".
         */
        if (d == 0.0 && copysign(1.0, d) < 0.0)
            key = TyTuple_Pack(3, Ty_TYPE(op), op, Ty_None);
        else
            key = TyTuple_Pack(2, Ty_TYPE(op), op);
    }
    else if (TyComplex_CheckExact(op)) {
        Ty_complex z;
        int real_negzero, imag_negzero;
        /* For the complex case we must make complex(x, 0.)
           different from complex(x, -0.) and complex(0., y)
           different from complex(-0., y), for any x and y.
           All four complex zeros must be distinguished.*/
        z = TyComplex_AsCComplex(op);
        real_negzero = z.real == 0.0 && copysign(1.0, z.real) < 0.0;
        imag_negzero = z.imag == 0.0 && copysign(1.0, z.imag) < 0.0;
        /* use True, False and None singleton as tags for the real and imag
         * sign, to make tuples different */
        if (real_negzero && imag_negzero) {
            key = TyTuple_Pack(3, Ty_TYPE(op), op, Ty_True);
        }
        else if (imag_negzero) {
            key = TyTuple_Pack(3, Ty_TYPE(op), op, Ty_False);
        }
        else if (real_negzero) {
            key = TyTuple_Pack(3, Ty_TYPE(op), op, Ty_None);
        }
        else {
            key = TyTuple_Pack(2, Ty_TYPE(op), op);
        }
    }
    else if (TyTuple_CheckExact(op)) {
        Ty_ssize_t i, len;
        TyObject *tuple;

        len = TyTuple_GET_SIZE(op);
        tuple = TyTuple_New(len);
        if (tuple == NULL)
            return NULL;

        for (i=0; i < len; i++) {
            TyObject *item, *item_key;

            item = TyTuple_GET_ITEM(op, i);
            item_key = _TyCode_ConstantKey(item);
            if (item_key == NULL) {
                Ty_DECREF(tuple);
                return NULL;
            }

            TyTuple_SET_ITEM(tuple, i, item_key);
        }

        key = TyTuple_Pack(2, tuple, op);
        Ty_DECREF(tuple);
    }
    else if (TyFrozenSet_CheckExact(op)) {
        Ty_ssize_t pos = 0;
        TyObject *item;
        Ty_hash_t hash;
        Ty_ssize_t i, len;
        TyObject *tuple, *set;

        len = TySet_GET_SIZE(op);
        tuple = TyTuple_New(len);
        if (tuple == NULL)
            return NULL;

        i = 0;
        while (_TySet_NextEntry(op, &pos, &item, &hash)) {
            TyObject *item_key;

            item_key = _TyCode_ConstantKey(item);
            if (item_key == NULL) {
                Ty_DECREF(tuple);
                return NULL;
            }

            assert(i < len);
            TyTuple_SET_ITEM(tuple, i, item_key);
            i++;
        }
        set = TyFrozenSet_New(tuple);
        Ty_DECREF(tuple);
        if (set == NULL)
            return NULL;

        key = TyTuple_Pack(2, set, op);
        Ty_DECREF(set);
        return key;
    }
    else if (TySlice_Check(op)) {
        PySliceObject *slice = (PySliceObject *)op;
        TyObject *start_key = NULL;
        TyObject *stop_key = NULL;
        TyObject *step_key = NULL;
        key = NULL;

        start_key = _TyCode_ConstantKey(slice->start);
        if (start_key == NULL) {
            goto slice_exit;
        }

        stop_key = _TyCode_ConstantKey(slice->stop);
        if (stop_key == NULL) {
            goto slice_exit;
        }

        step_key = _TyCode_ConstantKey(slice->step);
        if (step_key == NULL) {
            goto slice_exit;
        }

        TyObject *slice_key = TySlice_New(start_key, stop_key, step_key);
        if (slice_key == NULL) {
            goto slice_exit;
        }

        key = TyTuple_Pack(2, slice_key, op);
        Ty_DECREF(slice_key);
    slice_exit:
        Ty_XDECREF(start_key);
        Ty_XDECREF(stop_key);
        Ty_XDECREF(step_key);
    }
    else {
        /* for other types, use the object identifier as a unique identifier
         * to ensure that they are seen as unequal. */
        TyObject *obj_id = TyLong_FromVoidPtr(op);
        if (obj_id == NULL)
            return NULL;

        key = TyTuple_Pack(2, obj_id, op);
        Ty_DECREF(obj_id);
    }
    return key;
}

#ifdef Ty_GIL_DISABLED
static TyObject *
intern_one_constant(TyObject *op)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _Ty_hashtable_t *consts = interp->code_state.constants;

    assert(!TyUnicode_CheckExact(op));  // strings are interned separately

    _Ty_hashtable_entry_t *entry = _Ty_hashtable_get_entry(consts, op);
    if (entry == NULL) {
        if (_Ty_hashtable_set(consts, op, op) != 0) {
            TyErr_NoMemory();
            return NULL;
        }

#ifdef Ty_REF_DEBUG
        Ty_ssize_t refcnt = Ty_REFCNT(op);
        if (refcnt != 1) {
            // Adjust the reftotal to account for the fact that we only
            // restore a single reference in _TyCode_Fini.
            _Ty_AddRefTotal(_TyThreadState_GET(), -(refcnt - 1));
        }
#endif

        _Ty_SetImmortal(op);
        return op;
    }

    assert(_Ty_IsImmortal(entry->value));
    return (TyObject *)entry->value;
}

static int
compare_constants(const void *key1, const void *key2)
{
    TyObject *op1 = (TyObject *)key1;
    TyObject *op2 = (TyObject *)key2;
    if (op1 == op2) {
        return 1;
    }
    if (Ty_TYPE(op1) != Ty_TYPE(op2)) {
        return 0;
    }
    // We compare container contents by identity because we have already
    // internalized the items.
    if (TyTuple_CheckExact(op1)) {
        Ty_ssize_t size = TyTuple_GET_SIZE(op1);
        if (size != TyTuple_GET_SIZE(op2)) {
            return 0;
        }
        for (Ty_ssize_t i = 0; i < size; i++) {
            if (TyTuple_GET_ITEM(op1, i) != TyTuple_GET_ITEM(op2, i)) {
                return 0;
            }
        }
        return 1;
    }
    else if (TyFrozenSet_CheckExact(op1)) {
        if (TySet_GET_SIZE(op1) != TySet_GET_SIZE(op2)) {
            return 0;
        }
        Ty_ssize_t pos1 = 0, pos2 = 0;
        TyObject *obj1, *obj2;
        Ty_hash_t hash1, hash2;
        while ((_TySet_NextEntry(op1, &pos1, &obj1, &hash1)) &&
               (_TySet_NextEntry(op2, &pos2, &obj2, &hash2)))
        {
            if (obj1 != obj2) {
                return 0;
            }
        }
        return 1;
    }
    else if (TySlice_Check(op1)) {
        PySliceObject *s1 = (PySliceObject *)op1;
        PySliceObject *s2 = (PySliceObject *)op2;
        return (s1->start == s2->start &&
                s1->stop  == s2->stop  &&
                s1->step  == s2->step);
    }
    else if (TyBytes_CheckExact(op1) || TyLong_CheckExact(op1)) {
        return PyObject_RichCompareBool(op1, op2, Py_EQ);
    }
    else if (TyFloat_CheckExact(op1)) {
        // Ensure that, for example, +0.0 and -0.0 are distinct
        double f1 = TyFloat_AS_DOUBLE(op1);
        double f2 = TyFloat_AS_DOUBLE(op2);
        return memcmp(&f1, &f2, sizeof(double)) == 0;
    }
    else if (TyComplex_CheckExact(op1)) {
        Ty_complex c1 = ((PyComplexObject *)op1)->cval;
        Ty_complex c2 = ((PyComplexObject *)op2)->cval;
        return memcmp(&c1, &c2, sizeof(Ty_complex)) == 0;
    }
    // gh-130851: Treat instances of unexpected types as distinct if they are
    // not the same object.
    return 0;
}

static Ty_uhash_t
hash_const(const void *key)
{
    TyObject *op = (TyObject *)key;
    if (TySlice_Check(op)) {
        PySliceObject *s = (PySliceObject *)op;
        TyObject *data[3] = { s->start, s->stop, s->step };
        return Ty_HashBuffer(&data, sizeof(data));
    }
    else if (TyTuple_CheckExact(op)) {
        Ty_ssize_t size = TyTuple_GET_SIZE(op);
        TyObject **data = _TyTuple_ITEMS(op);
        return Ty_HashBuffer(data, sizeof(TyObject *) * size);
    }
    Ty_hash_t h = PyObject_Hash(op);
    if (h == -1) {
        // gh-130851: Other than slice objects, every constant that the
        // bytecode compiler generates is hashable. However, users can
        // provide their own constants, when constructing code objects via
        // types.CodeType(). If the user-provided constant is unhashable, we
        // use the memory address of the object as a fallback hash value.
        TyErr_Clear();
        return (Ty_uhash_t)(uintptr_t)key;
    }
    return (Ty_uhash_t)h;
}

static int
clear_containers(_Ty_hashtable_t *ht, const void *key, const void *value,
                 void *user_data)
{
    // First clear containers to avoid recursive deallocation later on in
    // destroy_key.
    TyObject *op = (TyObject *)key;
    if (TyTuple_CheckExact(op)) {
        for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(op); i++) {
            Ty_CLEAR(_TyTuple_ITEMS(op)[i]);
        }
    }
    else if (TySlice_Check(op)) {
        PySliceObject *slice = (PySliceObject *)op;
        Ty_SETREF(slice->start, Ty_None);
        Ty_SETREF(slice->stop, Ty_None);
        Ty_SETREF(slice->step, Ty_None);
    }
    else if (TyFrozenSet_CheckExact(op)) {
        _TySet_ClearInternal((PySetObject *)op);
    }
    return 0;
}

static void
destroy_key(void *key)
{
    _Ty_ClearImmortal(key);
}
#endif

TyStatus
_TyCode_Init(TyInterpreterState *interp)
{
#ifdef Ty_GIL_DISABLED
    struct _py_code_state *state = &interp->code_state;
    state->constants = _Ty_hashtable_new_full(&hash_const, &compare_constants,
                                              &destroy_key, NULL, NULL);
    if (state->constants == NULL) {
        return _TyStatus_NO_MEMORY();
    }
#endif
    return _TyStatus_OK();
}

void
_TyCode_Fini(TyInterpreterState *interp)
{
#ifdef Ty_GIL_DISABLED
    // Free interned constants
    struct _py_code_state *state = &interp->code_state;
    if (state->constants) {
        _Ty_hashtable_foreach(state->constants, &clear_containers, NULL);
        _Ty_hashtable_destroy(state->constants);
        state->constants = NULL;
    }
    _PyIndexPool_Fini(&interp->tlbc_indices);
#endif
}

#ifdef Ty_GIL_DISABLED

// Thread-local bytecode (TLBC)
//
// Each thread specializes a thread-local copy of the bytecode, created on the
// first RESUME, in free-threaded builds. All copies of the bytecode for a code
// object are stored in the `co_tlbc` array. Threads reserve a globally unique
// index identifying its copy of the bytecode in all `co_tlbc` arrays at thread
// creation and release the index at thread destruction. The first entry in
// every `co_tlbc` array always points to the "main" copy of the bytecode that
// is stored at the end of the code object. This ensures that no bytecode is
// copied for programs that do not use threads.
//
// Thread-local bytecode can be disabled at runtime by providing either `-X
// tlbc=0` or `PYTHON_TLBC=0`. Disabling thread-local bytecode also disables
// specialization. All threads share the main copy of the bytecode when
// thread-local bytecode is disabled.
//
// Concurrent modifications to the bytecode made by the specializing
// interpreter and instrumentation use atomics, with specialization taking care
// not to overwrite an instruction that was instrumented concurrently.

int32_t
_Ty_ReserveTLBCIndex(TyInterpreterState *interp)
{
    if (interp->config.tlbc_enabled) {
        return _PyIndexPool_AllocIndex(&interp->tlbc_indices);
    }
    // All threads share the main copy of the bytecode when TLBC is disabled
    return 0;
}

void
_Ty_ClearTLBCIndex(_PyThreadStateImpl *tstate)
{
    TyInterpreterState *interp = ((TyThreadState *)tstate)->interp;
    if (interp->config.tlbc_enabled) {
        _PyIndexPool_FreeIndex(&interp->tlbc_indices, tstate->tlbc_index);
    }
}

static _PyCodeArray *
_PyCodeArray_New(Ty_ssize_t size)
{
    _PyCodeArray *arr = TyMem_Calloc(
        1, offsetof(_PyCodeArray, entries) + sizeof(void *) * size);
    if (arr == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    arr->size = size;
    return arr;
}

// Get the underlying code unit, leaving instrumentation
static _Ty_CODEUNIT
deopt_code_unit(PyCodeObject *code, int i)
{
    _Ty_CODEUNIT *src_instr = _TyCode_CODE(code) + i;
    _Ty_CODEUNIT inst = {
        .cache = FT_ATOMIC_LOAD_UINT16_RELAXED(*(uint16_t *)src_instr)};
    int opcode = inst.op.code;
    if (opcode < MIN_INSTRUMENTED_OPCODE) {
        inst.op.code = _TyOpcode_Deopt[opcode];
        assert(inst.op.code < MIN_SPECIALIZED_OPCODE);
    }
    // JIT should not be enabled with free-threading
    assert(inst.op.code != ENTER_EXECUTOR);
    return inst;
}

static void
copy_code(_Ty_CODEUNIT *dst, PyCodeObject *co)
{
    int code_len = (int) Ty_SIZE(co);
    for (int i = 0; i < code_len; i += _PyInstruction_GetLength(co, i)) {
        dst[i] = deopt_code_unit(co, i);
    }
    _TyCode_Quicken(dst, code_len, 1);
}

static Ty_ssize_t
get_pow2_greater(Ty_ssize_t initial, Ty_ssize_t limit)
{
    // initial must be a power of two
    assert(!(initial & (initial - 1)));
    Ty_ssize_t res = initial;
    while (res && res < limit) {
        res <<= 1;
    }
    return res;
}

static _Ty_CODEUNIT *
create_tlbc_lock_held(PyCodeObject *co, Ty_ssize_t idx)
{
    _PyCodeArray *tlbc = co->co_tlbc;
    if (idx >= tlbc->size) {
        Ty_ssize_t new_size = get_pow2_greater(tlbc->size, idx + 1);
        if (!new_size) {
            TyErr_NoMemory();
            return NULL;
        }
        _PyCodeArray *new_tlbc = _PyCodeArray_New(new_size);
        if (new_tlbc == NULL) {
            return NULL;
        }
        memcpy(new_tlbc->entries, tlbc->entries, tlbc->size * sizeof(void *));
        _Ty_atomic_store_ptr_release(&co->co_tlbc, new_tlbc);
        _TyMem_FreeDelayed(tlbc, tlbc->size * sizeof(void *));
        tlbc = new_tlbc;
    }
    char *bc = TyMem_Calloc(1, _TyCode_NBYTES(co));
    if (bc == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    copy_code((_Ty_CODEUNIT *) bc, co);
    assert(tlbc->entries[idx] == NULL);
    tlbc->entries[idx] = bc;
    return (_Ty_CODEUNIT *) bc;
}

static _Ty_CODEUNIT *
get_tlbc_lock_held(PyCodeObject *co)
{
    _PyCodeArray *tlbc = co->co_tlbc;
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)TyThreadState_GET();
    int32_t idx = tstate->tlbc_index;
    if (idx < tlbc->size && tlbc->entries[idx] != NULL) {
        return (_Ty_CODEUNIT *)tlbc->entries[idx];
    }
    return create_tlbc_lock_held(co, idx);
}

_Ty_CODEUNIT *
_TyCode_GetTLBC(PyCodeObject *co)
{
    _Ty_CODEUNIT *result;
    Ty_BEGIN_CRITICAL_SECTION(co);
    result = get_tlbc_lock_held(co);
    Ty_END_CRITICAL_SECTION();
    return result;
}

// My kingdom for a bitset
struct flag_set {
    uint8_t *flags;
    Ty_ssize_t size;
};

static inline int
flag_is_set(struct flag_set *flags, Ty_ssize_t idx)
{
    assert(idx >= 0);
    return (idx < flags->size) && flags->flags[idx];
}

// Set the flag for each tlbc index in use
static int
get_indices_in_use(TyInterpreterState *interp, struct flag_set *in_use)
{
    assert(interp->stoptheworld.world_stopped);
    assert(in_use->flags == NULL);
    int32_t max_index = 0;
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, p) {
        int32_t idx = ((_PyThreadStateImpl *) p)->tlbc_index;
        if (idx > max_index) {
            max_index = idx;
        }
    }
    _Ty_FOR_EACH_TSTATE_END(interp);
    in_use->size = (size_t) max_index + 1;
    in_use->flags = TyMem_Calloc(in_use->size, sizeof(*in_use->flags));
    if (in_use->flags == NULL) {
        return -1;
    }
    _Ty_FOR_EACH_TSTATE_BEGIN(interp, p) {
        in_use->flags[((_PyThreadStateImpl *) p)->tlbc_index] = 1;
    }
    _Ty_FOR_EACH_TSTATE_END(interp);
    return 0;
}

struct get_code_args {
    _PyObjectStack code_objs;
    struct flag_set indices_in_use;
    int err;
};

static void
clear_get_code_args(struct get_code_args *args)
{
    if (args->indices_in_use.flags != NULL) {
        TyMem_Free(args->indices_in_use.flags);
        args->indices_in_use.flags = NULL;
    }
    _PyObjectStack_Clear(&args->code_objs);
}

static inline int
is_bytecode_unused(_PyCodeArray *tlbc, Ty_ssize_t idx,
                   struct flag_set *indices_in_use)
{
    assert(idx > 0 && idx < tlbc->size);
    return tlbc->entries[idx] != NULL && !flag_is_set(indices_in_use, idx);
}

static int
get_code_with_unused_tlbc(TyObject *obj, void *data)
{
    struct get_code_args *args = (struct get_code_args *) data;
    if (!TyCode_Check(obj)) {
        return 1;
    }
    PyCodeObject *co = (PyCodeObject *) obj;
    _PyCodeArray *tlbc = co->co_tlbc;
    // The first index always points at the main copy of the bytecode embedded
    // in the code object.
    for (Ty_ssize_t i = 1; i < tlbc->size; i++) {
        if (is_bytecode_unused(tlbc, i, &args->indices_in_use)) {
            if (_PyObjectStack_Push(&args->code_objs, obj) < 0) {
                args->err = -1;
                return 0;
            }
            return 1;
        }
    }
    return 1;
}

static void
free_unused_bytecode(PyCodeObject *co, struct flag_set *indices_in_use)
{
    _PyCodeArray *tlbc = co->co_tlbc;
    // The first index always points at the main copy of the bytecode embedded
    // in the code object.
    for (Ty_ssize_t i = 1; i < tlbc->size; i++) {
        if (is_bytecode_unused(tlbc, i, indices_in_use)) {
            TyMem_Free(tlbc->entries[i]);
            tlbc->entries[i] = NULL;
        }
    }
}

int
_Ty_ClearUnusedTLBC(TyInterpreterState *interp)
{
    struct get_code_args args = {
        .code_objs = {NULL},
        .indices_in_use = {NULL, 0},
        .err = 0,
    };
    _TyEval_StopTheWorld(interp);
    // Collect in-use tlbc indices
    if (get_indices_in_use(interp, &args.indices_in_use) < 0) {
        goto err;
    }
    // Collect code objects that have bytecode not in use by any thread
    _TyGC_VisitObjectsWorldStopped(
        interp, get_code_with_unused_tlbc, &args);
    if (args.err < 0) {
        goto err;
    }
    // Free unused bytecode. This must happen outside of gc_visit_heaps; it is
    // unsafe to allocate or free any mimalloc managed memory when it's
    // running.
    TyObject *obj;
    while ((obj = _PyObjectStack_Pop(&args.code_objs)) != NULL) {
        free_unused_bytecode((PyCodeObject*) obj, &args.indices_in_use);
    }
    _TyEval_StartTheWorld(interp);
    clear_get_code_args(&args);
    return 0;

err:
    _TyEval_StartTheWorld(interp);
    clear_get_code_args(&args);
    TyErr_NoMemory();
    return -1;
}

#endif
