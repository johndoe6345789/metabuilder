/* interpreters module */
/* low-level access to interpreter primitives */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_crossinterp.h"   // _PyXIData_t
#include "pycore_interp.h"        // _TyInterpreterState_LookUpID()
#include "pycore_pystate.h"       // _TyInterpreterState_GetIDObject()

#ifdef MS_WINDOWS
#ifndef WIN32_LEAN_AND_MEAN
#  define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>        // SwitchToThread()
#elif defined(HAVE_SCHED_H)
#include <sched.h>          // sched_yield()
#endif

#define REGISTERS_HEAP_TYPES
#define HAS_FALLBACK
#define HAS_UNBOUND_ITEMS
#include "_interpreters_common.h"
#undef HAS_UNBOUND_ITEMS
#undef HAS_FALLBACK
#undef REGISTERS_HEAP_TYPES


/*
This module has the following process-global state:

_globals (static struct globals):
    mutex (PyMutex)
    module_count (int)
    channels (struct _channels):
        numopen (int64_t)
        next_id; (int64_t)
        mutex (TyThread_type_lock)
        head (linked list of struct _channelref *):
            cid (int64_t)
            objcount (Ty_ssize_t)
            next (struct _channelref *):
                ...
            chan (struct _channel *):
                open (int)
                mutex (TyThread_type_lock)
                closing (struct _channel_closing *):
                    ref (struct _channelref *):
                        ...
                ends (struct _channelends *):
                    numsendopen (int64_t)
                    numrecvopen (int64_t)
                    send (struct _channelend *):
                        interpid (int64_t)
                        open (int)
                        next (struct _channelend *)
                    recv (struct _channelend *):
                        ...
                queue (struct _channelqueue *):
                    count (int64_t)
                    first (struct _channelitem *):
                        next (struct _channelitem *):
                            ...
                        data (_PyXIData_t *):
                            data (void *)
                            obj (TyObject *)
                            interpid (int64_t)
                            new_object (xid_newobjfunc)
                            free (xid_freefunc)
                    last (struct _channelitem *):
                        ...

The above state includes the following allocations by the module:

* 1 top-level mutex (to protect the rest of the state)
* for each channel:
   * 1 struct _channelref
   * 1 struct _channel
   * 0-1 struct _channel_closing
   * 1 struct _channelends
   * 2 struct _channelend
   * 1 struct _channelqueue
* for each item in each channel:
   * 1 struct _channelitem
   * 1 _PyXIData_t

The only objects in that global state are the references held by each
channel's queue, which are safely managed via the _PyXIData_*()
API..  The module does not create any objects that are shared globally.
*/

#define MODULE_NAME _interpchannels
#define MODULE_NAME_STR Ty_STRINGIFY(MODULE_NAME)
#define MODINIT_FUNC_NAME RESOLVE_MODINIT_FUNC_NAME(MODULE_NAME)


#define GLOBAL_MALLOC(TYPE) \
    TyMem_RawMalloc(sizeof(TYPE))
#define GLOBAL_FREE(VAR) \
    TyMem_RawFree(VAR)


#define XID_IGNORE_EXC 1
#define XID_FREE 2

static int
_release_xid_data(_PyXIData_t *data, int flags)
{
    int ignoreexc = flags & XID_IGNORE_EXC;
    TyObject *exc;
    if (ignoreexc) {
        exc = TyErr_GetRaisedException();
    }
    int res;
    if (flags & XID_FREE) {
        res = _PyXIData_ReleaseAndRawFree(data);
    }
    else {
        res = _PyXIData_Release(data);
    }
    if (res < 0) {
        /* The owning interpreter is already destroyed. */
        if (ignoreexc) {
            // XXX Emit a warning?
            TyErr_Clear();
        }
    }
    if (flags & XID_FREE) {
        /* Either way, we free the data. */
    }
    if (ignoreexc) {
        TyErr_SetRaisedException(exc);
    }
    return res;
}


static TyInterpreterState *
_get_current_interp(void)
{
    // TyInterpreterState_Get() aborts if lookup fails, so don't need
    // to check the result for NULL.
    return TyInterpreterState_Get();
}

static TyObject *
_get_current_module(void)
{
    TyObject *name = TyUnicode_FromString(MODULE_NAME_STR);
    if (name == NULL) {
        return NULL;
    }
    TyObject *mod = TyImport_GetModule(name);
    Ty_DECREF(name);
    if (mod == NULL) {
        return NULL;
    }
    assert(mod != Ty_None);
    return mod;
}

static TyObject *
get_module_from_owned_type(TyTypeObject *cls)
{
    assert(cls != NULL);
    return _get_current_module();
    // XXX Use the more efficient API now that we use heap types:
    //return TyType_GetModule(cls);
}

static struct TyModuleDef moduledef;

static TyObject *
get_module_from_type(TyTypeObject *cls)
{
    assert(cls != NULL);
    return _get_current_module();
    // XXX Use the more efficient API now that we use heap types:
    //return TyType_GetModuleByDef(cls, &moduledef);
}

static TyObject *
add_new_exception(TyObject *mod, const char *name, TyObject *base)
{
    assert(!PyObject_HasAttrStringWithError(mod, name));
    TyObject *exctype = TyErr_NewException(name, base, NULL);
    if (exctype == NULL) {
        return NULL;
    }
    int res = TyModule_AddType(mod, (TyTypeObject *)exctype);
    if (res < 0) {
        Ty_DECREF(exctype);
        return NULL;
    }
    return exctype;
}

#define ADD_NEW_EXCEPTION(MOD, NAME, BASE) \
    add_new_exception(MOD, MODULE_NAME_STR "." Ty_STRINGIFY(NAME), BASE)

static int
wait_for_lock(TyThread_type_lock mutex, PY_TIMEOUT_T timeout)
{
    TyLockStatus res = TyThread_acquire_lock_timed_with_retries(mutex, timeout);
    if (res == PY_LOCK_INTR) {
        /* KeyboardInterrupt, etc. */
        assert(TyErr_Occurred());
        return -1;
    }
    else if (res == PY_LOCK_FAILURE) {
        assert(!TyErr_Occurred());
        assert(timeout > 0);
        TyErr_SetString(TyExc_TimeoutError, "timed out");
        return -1;
    }
    assert(res == PY_LOCK_ACQUIRED);
    TyThread_release_lock(mutex);
    return 0;
}

static int
ensure_highlevel_module_loaded(void)
{
    TyObject *highlevel =
            TyImport_ImportModule("concurrent.interpreters._channels");
    if (highlevel == NULL) {
        TyErr_Clear();
        highlevel = TyImport_ImportModule("test.support.channels");
        if (highlevel == NULL) {
            return -1;
        }
    }
    Ty_DECREF(highlevel);
    return 0;
}


/* module state *************************************************************/

typedef struct {
    /* Added at runtime by interpreters module. */
    TyTypeObject *send_channel_type;
    TyTypeObject *recv_channel_type;

    /* heap types */
    TyTypeObject *ChannelInfoType;
    TyTypeObject *ChannelIDType;

    /* exceptions */
    TyObject *ChannelError;
    TyObject *ChannelNotFoundError;
    TyObject *ChannelClosedError;
    TyObject *ChannelEmptyError;
    TyObject *ChannelNotEmptyError;
} module_state;

static inline module_state *
get_module_state(TyObject *mod)
{
    assert(mod != NULL);
    module_state *state = TyModule_GetState(mod);
    assert(state != NULL);
    return state;
}

static module_state *
_get_current_module_state(void)
{
    TyObject *mod = _get_current_module();
    if (mod == NULL) {
        mod = TyImport_ImportModule(MODULE_NAME_STR);
        if (mod == NULL) {
            return NULL;
        }
    }
    module_state *state = get_module_state(mod);
    Ty_DECREF(mod);
    return state;
}

static int
traverse_module_state(module_state *state, visitproc visit, void *arg)
{
    /* external types */
    Ty_VISIT(state->send_channel_type);
    Ty_VISIT(state->recv_channel_type);

    /* heap types */
    Ty_VISIT(state->ChannelInfoType);
    Ty_VISIT(state->ChannelIDType);

    /* exceptions */
    Ty_VISIT(state->ChannelError);
    Ty_VISIT(state->ChannelNotFoundError);
    Ty_VISIT(state->ChannelClosedError);
    Ty_VISIT(state->ChannelEmptyError);
    Ty_VISIT(state->ChannelNotEmptyError);

    return 0;
}

static void
clear_xid_types(module_state *state)
{
    /* external types */
    if (state->send_channel_type != NULL) {
        (void)clear_xid_class(state->send_channel_type);
        Ty_CLEAR(state->send_channel_type);
    }
    if (state->recv_channel_type != NULL) {
        (void)clear_xid_class(state->recv_channel_type);
        Ty_CLEAR(state->recv_channel_type);
    }

    /* heap types */
    if (state->ChannelIDType != NULL) {
        (void)clear_xid_class(state->ChannelIDType);
        Ty_CLEAR(state->ChannelIDType);
    }
}

static int
clear_module_state(module_state *state)
{
    clear_xid_types(state);

    /* heap types */
    Ty_CLEAR(state->ChannelInfoType);

    /* exceptions */
    Ty_CLEAR(state->ChannelError);
    Ty_CLEAR(state->ChannelNotFoundError);
    Ty_CLEAR(state->ChannelClosedError);
    Ty_CLEAR(state->ChannelEmptyError);
    Ty_CLEAR(state->ChannelNotEmptyError);

    return 0;
}


/* channel-specific code ****************************************************/

#define CHANNEL_SEND 1
#define CHANNEL_BOTH 0
#define CHANNEL_RECV -1


/* channel errors */

#define ERR_CHANNEL_NOT_FOUND -2
#define ERR_CHANNEL_CLOSED -3
#define ERR_CHANNEL_INTERP_CLOSED -4
#define ERR_CHANNEL_EMPTY -5
#define ERR_CHANNEL_NOT_EMPTY -6
#define ERR_CHANNEL_MUTEX_INIT -7
#define ERR_CHANNELS_MUTEX_INIT -8
#define ERR_NO_NEXT_CHANNEL_ID -9
#define ERR_CHANNEL_CLOSED_WAITING -10

static int
exceptions_init(TyObject *mod)
{
    module_state *state = get_module_state(mod);
    if (state == NULL) {
        return -1;
    }

#define ADD(NAME, BASE) \
    do { \
        assert(state->NAME == NULL); \
        state->NAME = ADD_NEW_EXCEPTION(mod, NAME, BASE); \
        if (state->NAME == NULL) { \
            return -1; \
        } \
    } while (0)

    // A channel-related operation failed.
    ADD(ChannelError, TyExc_RuntimeError);
    // An operation tried to use a channel that doesn't exist.
    ADD(ChannelNotFoundError, state->ChannelError);
    // An operation tried to use a closed channel.
    ADD(ChannelClosedError, state->ChannelError);
    // An operation tried to pop from an empty channel.
    ADD(ChannelEmptyError, state->ChannelError);
    // An operation tried to close a non-empty channel.
    ADD(ChannelNotEmptyError, state->ChannelError);
#undef ADD

    return 0;
}

static int
handle_channel_error(int err, TyObject *mod, int64_t cid)
{
    if (err == 0) {
        assert(!TyErr_Occurred());
        return 0;
    }
    assert(err < 0);
    module_state *state = get_module_state(mod);
    assert(state != NULL);
    if (err == ERR_CHANNEL_NOT_FOUND) {
        TyErr_Format(state->ChannelNotFoundError,
                     "channel %" PRId64 " not found", cid);
    }
    else if (err == ERR_CHANNEL_CLOSED) {
        TyErr_Format(state->ChannelClosedError,
                     "channel %" PRId64 " is closed", cid);
    }
    else if (err == ERR_CHANNEL_CLOSED_WAITING) {
        TyErr_Format(state->ChannelClosedError,
                     "channel %" PRId64 " has closed", cid);
    }
    else if (err == ERR_CHANNEL_INTERP_CLOSED) {
        TyErr_Format(state->ChannelClosedError,
                     "channel %" PRId64 " is already closed", cid);
    }
    else if (err == ERR_CHANNEL_EMPTY) {
        TyErr_Format(state->ChannelEmptyError,
                     "channel %" PRId64 " is empty", cid);
    }
    else if (err == ERR_CHANNEL_NOT_EMPTY) {
        TyErr_Format(state->ChannelNotEmptyError,
                     "channel %" PRId64 " may not be closed "
                     "if not empty (try force=True)",
                     cid);
    }
    else if (err == ERR_CHANNEL_MUTEX_INIT) {
        TyErr_SetString(state->ChannelError,
                        "can't initialize mutex for new channel");
    }
    else if (err == ERR_CHANNELS_MUTEX_INIT) {
        TyErr_SetString(state->ChannelError,
                        "can't initialize mutex for channel management");
    }
    else if (err == ERR_NO_NEXT_CHANNEL_ID) {
        TyErr_SetString(state->ChannelError,
                        "failed to get a channel ID");
    }
    else {
        assert(TyErr_Occurred());
    }
    return 1;
}


/* the channel queue */

typedef uintptr_t _channelitem_id_t;

typedef struct wait_info {
    TyThread_type_lock mutex;
    enum {
        WAITING_NO_STATUS = 0,
        WAITING_ACQUIRED = 1,
        WAITING_RELEASING = 2,
        WAITING_RELEASED = 3,
    } status;
    int received;
    _channelitem_id_t itemid;
} _waiting_t;

static int
_waiting_init(_waiting_t *waiting)
{
    TyThread_type_lock mutex = TyThread_allocate_lock();
    if (mutex == NULL) {
        TyErr_NoMemory();
        return -1;
    }

    *waiting = (_waiting_t){
        .mutex = mutex,
        .status = WAITING_NO_STATUS,
    };
    return 0;
}

static void
_waiting_clear(_waiting_t *waiting)
{
    assert(waiting->status != WAITING_ACQUIRED
           && waiting->status != WAITING_RELEASING);
    if (waiting->mutex != NULL) {
        TyThread_free_lock(waiting->mutex);
        waiting->mutex = NULL;
    }
}

static _channelitem_id_t
_waiting_get_itemid(_waiting_t *waiting)
{
    return waiting->itemid;
}

static void
_waiting_acquire(_waiting_t *waiting)
{
    assert(waiting->status == WAITING_NO_STATUS);
    TyThread_acquire_lock(waiting->mutex, NOWAIT_LOCK);
    waiting->status = WAITING_ACQUIRED;
}

static void
_waiting_release(_waiting_t *waiting, int received)
{
    assert(waiting->mutex != NULL);
    assert(waiting->status == WAITING_ACQUIRED);
    assert(!waiting->received);

    waiting->status = WAITING_RELEASING;
    TyThread_release_lock(waiting->mutex);
    if (waiting->received != received) {
        assert(received == 1);
        waiting->received = received;
    }
    waiting->status = WAITING_RELEASED;
}

static void
_waiting_finish_releasing(_waiting_t *waiting)
{
    while (waiting->status == WAITING_RELEASING) {
#ifdef MS_WINDOWS
        SwitchToThread();
#elif defined(HAVE_SCHED_H)
        sched_yield();
#endif
    }
}

struct _channelitem;

typedef struct _channelitem {
    /* The interpreter that added the item to the queue.
       The actual bound interpid is found in item->data.
       This is necessary because item->data might be NULL,
       meaning the interpreter has been destroyed. */
    int64_t interpid;
    _PyXIData_t *data;
    _waiting_t *waiting;
    unboundop_t unboundop;
    struct _channelitem *next;
} _channelitem;

static inline _channelitem_id_t
_channelitem_ID(_channelitem *item)
{
    return (_channelitem_id_t)item;
}

static void
_channelitem_init(_channelitem *item,
                  int64_t interpid, _PyXIData_t *data,
                  _waiting_t *waiting, unboundop_t unboundop)
{
    if (interpid < 0) {
        interpid = _get_interpid(data);
    }
    else {
        assert(data == NULL
               || _PyXIData_INTERPID(data) < 0
               || interpid == _PyXIData_INTERPID(data));
    }
    *item = (_channelitem){
        .interpid = interpid,
        .data = data,
        .waiting = waiting,
        .unboundop = unboundop,
    };
    if (waiting != NULL) {
        waiting->itemid = _channelitem_ID(item);
    }
}

static void
_channelitem_clear_data(_channelitem *item, int removed)
{
    if (item->data != NULL) {
        // It was allocated in channel_send().
        (void)_release_xid_data(item->data, XID_IGNORE_EXC & XID_FREE);
        item->data = NULL;
    }

    if (item->waiting != NULL && removed) {
        if (item->waiting->status == WAITING_ACQUIRED) {
            _waiting_release(item->waiting, 0);
        }
        item->waiting = NULL;
    }
}

static void
_channelitem_clear(_channelitem *item)
{
    item->next = NULL;
    _channelitem_clear_data(item, 1);
}

static _channelitem *
_channelitem_new(int64_t interpid, _PyXIData_t *data,
                 _waiting_t *waiting, unboundop_t unboundop)
{
    _channelitem *item = GLOBAL_MALLOC(_channelitem);
    if (item == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    _channelitem_init(item, interpid, data, waiting, unboundop);
    return item;
}

static void
_channelitem_free(_channelitem *item)
{
    _channelitem_clear(item);
    GLOBAL_FREE(item);
}

static void
_channelitem_free_all(_channelitem *item)
{
    while (item != NULL) {
        _channelitem *last = item;
        item = item->next;
        _channelitem_free(last);
    }
}

static void
_channelitem_popped(_channelitem *item,
                    _PyXIData_t **p_data, _waiting_t **p_waiting,
                    int *p_unboundop)
{
    assert(item->waiting == NULL || item->waiting->status == WAITING_ACQUIRED);
    *p_data = item->data;
    *p_waiting = item->waiting;
    *p_unboundop = item->unboundop;
    // We clear them here, so they won't be released in _channelitem_clear().
    item->data = NULL;
    item->waiting = NULL;
    _channelitem_free(item);
}

static int
_channelitem_clear_interpreter(_channelitem *item)
{
    assert(item->interpid >= 0);
    if (item->data == NULL) {
        // Its interpreter was already cleared (or it was never bound).
        // For UNBOUND_REMOVE it should have been freed at that time.
        assert(item->unboundop != UNBOUND_REMOVE);
        return 0;
    }
    assert(_PyXIData_INTERPID(item->data) == item->interpid);

    switch (item->unboundop) {
    case UNBOUND_REMOVE:
        // The caller must free/clear it.
        return 1;
    case UNBOUND_ERROR:
    case UNBOUND_REPLACE:
        // We won't need the cross-interpreter data later
        // so we completely throw it away.
        _channelitem_clear_data(item, 0);
        return 0;
    default:
        Ty_FatalError("not reachable");
        return -1;
    }
}


typedef struct _channelqueue {
    int64_t count;
    _channelitem *first;
    _channelitem *last;
} _channelqueue;

static _channelqueue *
_channelqueue_new(void)
{
    _channelqueue *queue = GLOBAL_MALLOC(_channelqueue);
    if (queue == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    queue->count = 0;
    queue->first = NULL;
    queue->last = NULL;
    return queue;
}

static void
_channelqueue_clear(_channelqueue *queue)
{
    _channelitem_free_all(queue->first);
    queue->count = 0;
    queue->first = NULL;
    queue->last = NULL;
}

static void
_channelqueue_free(_channelqueue *queue)
{
    _channelqueue_clear(queue);
    GLOBAL_FREE(queue);
}

static int
_channelqueue_put(_channelqueue *queue,
                  int64_t interpid, _PyXIData_t *data,
                  _waiting_t *waiting, unboundop_t unboundop)
{
    _channelitem *item = _channelitem_new(interpid, data, waiting, unboundop);
    if (item == NULL) {
        return -1;
    }

    queue->count += 1;
    if (queue->first == NULL) {
        queue->first = item;
    }
    else {
        queue->last->next = item;
    }
    queue->last = item;

    if (waiting != NULL) {
        _waiting_acquire(waiting);
    }

    return 0;
}

static int
_channelqueue_get(_channelqueue *queue,
                  _PyXIData_t **p_data, _waiting_t **p_waiting,
                  int *p_unboundop)
{
    _channelitem *item = queue->first;
    if (item == NULL) {
        return ERR_CHANNEL_EMPTY;
    }
    queue->first = item->next;
    if (queue->last == item) {
        queue->last = NULL;
    }
    queue->count -= 1;

    _channelitem_popped(item, p_data, p_waiting, p_unboundop);
    return 0;
}

static int
_channelqueue_find(_channelqueue *queue, _channelitem_id_t itemid,
                   _channelitem **p_item, _channelitem **p_prev)
{
    _channelitem *prev = NULL;
    _channelitem *item = NULL;
    if (queue->first != NULL) {
        if (_channelitem_ID(queue->first) == itemid) {
            item = queue->first;
        }
        else {
            prev = queue->first;
            while (prev->next != NULL) {
                if (_channelitem_ID(prev->next) == itemid) {
                    item = prev->next;
                    break;
                }
                prev = prev->next;
            }
            if (item == NULL) {
                prev = NULL;
            }
        }
    }
    if (p_item != NULL) {
        *p_item = item;
    }
    if (p_prev != NULL) {
        *p_prev = prev;
    }
    return (item != NULL);
}

static void
_channelqueue_remove(_channelqueue *queue, _channelitem_id_t itemid,
                     _PyXIData_t **p_data, _waiting_t **p_waiting)
{
    _channelitem *prev = NULL;
    _channelitem *item = NULL;
    int found = _channelqueue_find(queue, itemid, &item, &prev);
    if (!found) {
        return;
    }

    assert(item->waiting != NULL);
    assert(!item->waiting->received);
    if (prev == NULL) {
        assert(queue->first == item);
        queue->first = item->next;
    }
    else {
        assert(queue->first != item);
        assert(prev->next == item);
        prev->next = item->next;
    }
    item->next = NULL;

    if (queue->last == item) {
        queue->last = prev;
    }
    queue->count -= 1;

    unboundop_t unboundop;
    _channelitem_popped(item, p_data, p_waiting, &unboundop);
}

static void
_channelqueue_clear_interpreter(_channelqueue *queue, int64_t interpid)
{
    _channelitem *prev = NULL;
    _channelitem *next = queue->first;
    while (next != NULL) {
        _channelitem *item = next;
        next = item->next;
        int remove = (item->interpid == interpid)
            ? _channelitem_clear_interpreter(item)
            : 0;
        if (remove) {
            _channelitem_free(item);
            if (prev == NULL) {
                queue->first = next;
            }
            else {
                prev->next = next;
            }
            queue->count -= 1;
        }
        else {
            prev = item;
        }
    }
}


/* channel-interpreter associations */

struct _channelend;

typedef struct _channelend {
    struct _channelend *next;
    int64_t interpid;
    int open;
} _channelend;

static _channelend *
_channelend_new(int64_t interpid)
{
    _channelend *end = GLOBAL_MALLOC(_channelend);
    if (end == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    end->next = NULL;
    end->interpid = interpid;
    end->open = 1;
    return end;
}

static void
_channelend_free(_channelend *end)
{
    GLOBAL_FREE(end);
}

static void
_channelend_free_all(_channelend *end)
{
    while (end != NULL) {
        _channelend *last = end;
        end = end->next;
        _channelend_free(last);
    }
}

static _channelend *
_channelend_find(_channelend *first, int64_t interpid, _channelend **pprev)
{
    _channelend *prev = NULL;
    _channelend *end = first;
    while (end != NULL) {
        if (end->interpid == interpid) {
            break;
        }
        prev = end;
        end = end->next;
    }
    if (pprev != NULL) {
        *pprev = prev;
    }
    return end;
}

typedef struct _channelassociations {
    // Note that the list entries are never removed for interpreter
    // for which the channel is closed.  This should not be a problem in
    // practice.  Also, a channel isn't automatically closed when an
    // interpreter is destroyed.
    int64_t numsendopen;
    int64_t numrecvopen;
    _channelend *send;
    _channelend *recv;
} _channelends;

static _channelends *
_channelends_new(void)
{
    _channelends *ends = GLOBAL_MALLOC(_channelends);
    if (ends== NULL) {
        return NULL;
    }
    ends->numsendopen = 0;
    ends->numrecvopen = 0;
    ends->send = NULL;
    ends->recv = NULL;
    return ends;
}

static void
_channelends_clear(_channelends *ends)
{
    _channelend_free_all(ends->send);
    ends->send = NULL;
    ends->numsendopen = 0;

    _channelend_free_all(ends->recv);
    ends->recv = NULL;
    ends->numrecvopen = 0;
}

static void
_channelends_free(_channelends *ends)
{
    _channelends_clear(ends);
    GLOBAL_FREE(ends);
}

static _channelend *
_channelends_add(_channelends *ends, _channelend *prev, int64_t interpid,
                 int send)
{
    _channelend *end = _channelend_new(interpid);
    if (end == NULL) {
        return NULL;
    }

    if (prev == NULL) {
        if (send) {
            ends->send = end;
        }
        else {
            ends->recv = end;
        }
    }
    else {
        prev->next = end;
    }
    if (send) {
        ends->numsendopen += 1;
    }
    else {
        ends->numrecvopen += 1;
    }
    return end;
}

static int
_channelends_associate(_channelends *ends, int64_t interpid, int send)
{
    _channelend *prev;
    _channelend *end = _channelend_find(send ? ends->send : ends->recv,
                                        interpid, &prev);
    if (end != NULL) {
        if (!end->open) {
            return ERR_CHANNEL_CLOSED;
        }
        // already associated
        return 0;
    }
    if (_channelends_add(ends, prev, interpid, send) == NULL) {
        return -1;
    }
    return 0;
}

static int
_channelends_is_open(_channelends *ends)
{
    if (ends->numsendopen != 0 || ends->numrecvopen != 0) {
        // At least one interpreter is still associated with the channel
        // (and hasn't been released).
        return 1;
    }
    // XXX This is wrong if an end can ever be removed.
    if (ends->send == NULL && ends->recv == NULL) {
        // The channel has never had any interpreters associated with it.
        return 1;
    }
    return 0;
}

static void
_channelends_release_end(_channelends *ends, _channelend *end, int send)
{
    end->open = 0;
    if (send) {
        ends->numsendopen -= 1;
    }
    else {
        ends->numrecvopen -= 1;
    }
}

static int
_channelends_release_interpreter(_channelends *ends, int64_t interpid, int which)
{
    _channelend *prev;
    _channelend *end;
    if (which >= 0) {  // send/both
        end = _channelend_find(ends->send, interpid, &prev);
        if (end == NULL) {
            // never associated so add it
            end = _channelends_add(ends, prev, interpid, 1);
            if (end == NULL) {
                return -1;
            }
        }
        _channelends_release_end(ends, end, 1);
    }
    if (which <= 0) {  // recv/both
        end = _channelend_find(ends->recv, interpid, &prev);
        if (end == NULL) {
            // never associated so add it
            end = _channelends_add(ends, prev, interpid, 0);
            if (end == NULL) {
                return -1;
            }
        }
        _channelends_release_end(ends, end, 0);
    }
    return 0;
}

static void
_channelends_release_all(_channelends *ends, int which, int force)
{
    // XXX Handle the ends.
    // XXX Handle force is True.

    // Ensure all the "send"-associated interpreters are closed.
    _channelend *end;
    for (end = ends->send; end != NULL; end = end->next) {
        _channelends_release_end(ends, end, 1);
    }

    // Ensure all the "recv"-associated interpreters are closed.
    for (end = ends->recv; end != NULL; end = end->next) {
        _channelends_release_end(ends, end, 0);
    }
}

static void
_channelends_clear_interpreter(_channelends *ends, int64_t interpid)
{
    // XXX Actually remove the entries?
    _channelend *end;
    end = _channelend_find(ends->send, interpid, NULL);
    if (end != NULL) {
        _channelends_release_end(ends, end, 1);
    }
    end = _channelend_find(ends->recv, interpid, NULL);
    if (end != NULL) {
        _channelends_release_end(ends, end, 0);
    }
}


/* each channel's state */

struct _channel;
struct _channel_closing;
static void _channel_clear_closing(struct _channel *);
static void _channel_finish_closing(struct _channel *);

typedef struct _channel {
    TyThread_type_lock mutex;
    _channelqueue *queue;
    _channelends *ends;
    struct _channeldefaults {
        unboundop_t unboundop;
        xidata_fallback_t fallback;
    } defaults;
    int open;
    struct _channel_closing *closing;
} _channel_state;

static _channel_state *
_channel_new(TyThread_type_lock mutex, struct _channeldefaults defaults)
{
    assert(check_unbound(defaults.unboundop));
    _channel_state *chan = GLOBAL_MALLOC(_channel_state);
    if (chan == NULL) {
        return NULL;
    }
    chan->mutex = mutex;
    chan->queue = _channelqueue_new();
    if (chan->queue == NULL) {
        GLOBAL_FREE(chan);
        return NULL;
    }
    chan->ends = _channelends_new();
    if (chan->ends == NULL) {
        _channelqueue_free(chan->queue);
        GLOBAL_FREE(chan);
        return NULL;
    }
    chan->defaults = defaults;
    chan->open = 1;
    chan->closing = NULL;
    return chan;
}

static void
_channel_free(_channel_state *chan)
{
    _channel_clear_closing(chan);
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);
    _channelqueue_free(chan->queue);
    _channelends_free(chan->ends);
    TyThread_release_lock(chan->mutex);

    TyThread_free_lock(chan->mutex);
    GLOBAL_FREE(chan);
}

static int
_channel_add(_channel_state *chan, int64_t interpid,
             _PyXIData_t *data, _waiting_t *waiting, unboundop_t unboundop)
{
    int res = -1;
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);

    if (!chan->open) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }
    if (_channelends_associate(chan->ends, interpid, 1) != 0) {
        res = ERR_CHANNEL_INTERP_CLOSED;
        goto done;
    }

    if (_channelqueue_put(chan->queue, interpid, data, waiting, unboundop) != 0) {
        goto done;
    }
    // Any errors past this point must cause a _waiting_release() call.

    res = 0;
done:
    TyThread_release_lock(chan->mutex);
    return res;
}

static int
_channel_next(_channel_state *chan, int64_t interpid,
              _PyXIData_t **p_data, _waiting_t **p_waiting, int *p_unboundop)
{
    int err = 0;
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);

    if (!chan->open) {
        err = ERR_CHANNEL_CLOSED;
        goto done;
    }
    if (_channelends_associate(chan->ends, interpid, 0) != 0) {
        err = ERR_CHANNEL_INTERP_CLOSED;
        goto done;
    }

    int empty = _channelqueue_get(chan->queue, p_data, p_waiting, p_unboundop);
    assert(!TyErr_Occurred());
    if (empty) {
        assert(empty == ERR_CHANNEL_EMPTY);
        if (chan->closing != NULL) {
            chan->open = 0;
        }
        err = ERR_CHANNEL_EMPTY;
        goto done;
    }

done:
    TyThread_release_lock(chan->mutex);
    if (chan->queue->count == 0) {
        _channel_finish_closing(chan);
    }
    return err;
}

static void
_channel_remove(_channel_state *chan, _channelitem_id_t itemid)
{
    _PyXIData_t *data = NULL;
    _waiting_t *waiting = NULL;

    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);
    _channelqueue_remove(chan->queue, itemid, &data, &waiting);
    TyThread_release_lock(chan->mutex);

    (void)_release_xid_data(data, XID_IGNORE_EXC | XID_FREE);
    if (waiting != NULL) {
        _waiting_release(waiting, 0);
    }

    if (chan->queue->count == 0) {
        _channel_finish_closing(chan);
    }
}

static int
_channel_release_interpreter(_channel_state *chan, int64_t interpid, int end)
{
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);

    int res = -1;
    if (!chan->open) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }

    if (_channelends_release_interpreter(chan->ends, interpid, end) != 0) {
        goto done;
    }
    chan->open = _channelends_is_open(chan->ends);
    // XXX Clear the queue if not empty?
    // XXX Activate the "closing" mechanism?

    res = 0;
done:
    TyThread_release_lock(chan->mutex);
    return res;
}

static int
_channel_release_all(_channel_state *chan, int end, int force)
{
    int res = -1;
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);

    if (!chan->open) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }

    if (!force && chan->queue->count > 0) {
        res = ERR_CHANNEL_NOT_EMPTY;
        goto done;
    }
    // XXX Clear the queue?

    chan->open = 0;

    // We *could* also just leave these in place, since we've marked
    // the channel as closed already.
    _channelends_release_all(chan->ends, end, force);

    res = 0;
done:
    TyThread_release_lock(chan->mutex);
    return res;
}

static void
_channel_clear_interpreter(_channel_state *chan, int64_t interpid)
{
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);

    _channelqueue_clear_interpreter(chan->queue, interpid);
    _channelends_clear_interpreter(chan->ends, interpid);
    chan->open = _channelends_is_open(chan->ends);

    TyThread_release_lock(chan->mutex);
}


/* the set of channels */

struct _channelref;

typedef struct _channelref {
    int64_t cid;
    _channel_state *chan;
    struct _channelref *next;
    // The number of ChannelID objects referring to this channel.
    Ty_ssize_t objcount;
} _channelref;

static _channelref *
_channelref_new(int64_t cid, _channel_state *chan)
{
    _channelref *ref = GLOBAL_MALLOC(_channelref);
    if (ref == NULL) {
        return NULL;
    }
    ref->cid = cid;
    ref->chan = chan;
    ref->next = NULL;
    ref->objcount = 0;
    return ref;
}

//static void
//_channelref_clear(_channelref *ref)
//{
//    ref->cid = -1;
//    ref->chan = NULL;
//    ref->next = NULL;
//    ref->objcount = 0;
//}

static void
_channelref_free(_channelref *ref)
{
    if (ref->chan != NULL) {
        _channel_clear_closing(ref->chan);
    }
    //_channelref_clear(ref);
    GLOBAL_FREE(ref);
}

static _channelref *
_channelref_find(_channelref *first, int64_t cid, _channelref **pprev)
{
    _channelref *prev = NULL;
    _channelref *ref = first;
    while (ref != NULL) {
        if (ref->cid == cid) {
            break;
        }
        prev = ref;
        ref = ref->next;
    }
    if (pprev != NULL) {
        *pprev = prev;
    }
    return ref;
}


typedef struct _channels {
    TyThread_type_lock mutex;
    _channelref *head;
    int64_t numopen;
    int64_t next_id;
} _channels;

static void
_channels_init(_channels *channels, TyThread_type_lock mutex)
{
    assert(mutex != NULL);
    assert(channels->mutex == NULL);
    *channels = (_channels){
        .mutex = mutex,
        .head = NULL,
        .numopen = 0,
        .next_id = 0,
    };
}

static void
_channels_fini(_channels *channels, TyThread_type_lock *p_mutex)
{
    TyThread_type_lock mutex = channels->mutex;
    assert(mutex != NULL);

    TyThread_acquire_lock(mutex, WAIT_LOCK);
    assert(channels->numopen == 0);
    assert(channels->head == NULL);
    *channels = (_channels){0};
    TyThread_release_lock(mutex);

    *p_mutex = mutex;
}

static int64_t
_channels_next_id(_channels *channels)  // needs lock
{
    int64_t cid = channels->next_id;
    if (cid < 0) {
        /* overflow */
        return -1;
    }
    channels->next_id += 1;
    return cid;
}

static int
_channels_lookup(_channels *channels, int64_t cid, TyThread_type_lock *pmutex,
                 _channel_state **res)
{
    int err = -1;
    _channel_state *chan = NULL;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);
    if (pmutex != NULL) {
        *pmutex = NULL;
    }

    _channelref *ref = _channelref_find(channels->head, cid, NULL);
    if (ref == NULL) {
        err = ERR_CHANNEL_NOT_FOUND;
        goto done;
    }
    if (ref->chan == NULL || !ref->chan->open) {
        err = ERR_CHANNEL_CLOSED;
        goto done;
    }

    if (pmutex != NULL) {
        // The mutex will be closed by the caller.
        *pmutex = channels->mutex;
    }

    chan = ref->chan;
    err = 0;

done:
    if (pmutex == NULL || *pmutex == NULL) {
        TyThread_release_lock(channels->mutex);
    }
    *res = chan;
    return err;
}

static int64_t
_channels_add(_channels *channels, _channel_state *chan)
{
    int64_t cid = -1;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    // Create a new ref.
    int64_t _cid = _channels_next_id(channels);
    if (_cid < 0) {
        cid = ERR_NO_NEXT_CHANNEL_ID;
        goto done;
    }
    _channelref *ref = _channelref_new(_cid, chan);
    if (ref == NULL) {
        goto done;
    }

    // Add it to the list.
    // We assume that the channel is a new one (not already in the list).
    ref->next = channels->head;
    channels->head = ref;
    channels->numopen += 1;

    cid = _cid;
done:
    TyThread_release_lock(channels->mutex);
    return cid;
}

/* forward */
static int _channel_set_closing(_channelref *, TyThread_type_lock);

static int
_channels_close(_channels *channels, int64_t cid, _channel_state **pchan,
                int end, int force)
{
    int res = -1;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);
    if (pchan != NULL) {
        *pchan = NULL;
    }

    _channelref *ref = _channelref_find(channels->head, cid, NULL);
    if (ref == NULL) {
        res = ERR_CHANNEL_NOT_FOUND;
        goto done;
    }

    if (ref->chan == NULL) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }
    else if (!force && end == CHANNEL_SEND && ref->chan->closing != NULL) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }
    else {
        int err = _channel_release_all(ref->chan, end, force);
        if (err != 0) {
            if (end == CHANNEL_SEND && err == ERR_CHANNEL_NOT_EMPTY) {
                if (ref->chan->closing != NULL) {
                    res = ERR_CHANNEL_CLOSED;
                    goto done;
                }
                // Mark the channel as closing and return.  The channel
                // will be cleaned up in _channel_next().
                TyErr_Clear();
                int err = _channel_set_closing(ref, channels->mutex);
                if (err != 0) {
                    res = err;
                    goto done;
                }
                if (pchan != NULL) {
                    *pchan = ref->chan;
                }
                res = 0;
            }
            else {
                res = err;
            }
            goto done;
        }
        if (pchan != NULL) {
            *pchan = ref->chan;
        }
        else  {
            _channel_free(ref->chan);
        }
        ref->chan = NULL;
    }

    res = 0;
done:
    TyThread_release_lock(channels->mutex);
    return res;
}

static void
_channels_remove_ref(_channels *channels, _channelref *ref, _channelref *prev,
                     _channel_state **pchan)
{
    if (ref == channels->head) {
        channels->head = ref->next;
    }
    else {
        prev->next = ref->next;
    }
    channels->numopen -= 1;

    if (pchan != NULL) {
        *pchan = ref->chan;
    }
    _channelref_free(ref);
}

static int
_channels_remove(_channels *channels, int64_t cid, _channel_state **pchan)
{
    int res = -1;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    if (pchan != NULL) {
        *pchan = NULL;
    }

    _channelref *prev = NULL;
    _channelref *ref = _channelref_find(channels->head, cid, &prev);
    if (ref == NULL) {
        res = ERR_CHANNEL_NOT_FOUND;
        goto done;
    }

    _channels_remove_ref(channels, ref, prev, pchan);

    res = 0;
done:
    TyThread_release_lock(channels->mutex);
    return res;
}

static int
_channels_add_id_object(_channels *channels, int64_t cid)
{
    int res = -1;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    _channelref *ref = _channelref_find(channels->head, cid, NULL);
    if (ref == NULL) {
        res = ERR_CHANNEL_NOT_FOUND;
        goto done;
    }
    ref->objcount += 1;

    res = 0;
done:
    TyThread_release_lock(channels->mutex);
    return res;
}

static void
_channels_release_cid_object(_channels *channels, int64_t cid)
{
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    _channelref *prev = NULL;
    _channelref *ref = _channelref_find(channels->head, cid, &prev);
    if (ref == NULL) {
        // Already destroyed.
        goto done;
    }
    ref->objcount -= 1;

    // Destroy if no longer used.
    if (ref->objcount == 0) {
        _channel_state *chan = NULL;
        _channels_remove_ref(channels, ref, prev, &chan);
        if (chan != NULL) {
            _channel_free(chan);
        }
    }

done:
    TyThread_release_lock(channels->mutex);
}

struct channel_id_and_info {
    int64_t id;
    struct _channeldefaults defaults;
};

static struct channel_id_and_info *
_channels_list_all(_channels *channels, int64_t *count)
{
    struct channel_id_and_info *cids = NULL;
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);
    struct channel_id_and_info *ids =
        TyMem_NEW(struct channel_id_and_info, (Ty_ssize_t)(channels->numopen));
    if (ids == NULL) {
        goto done;
    }
    _channelref *ref = channels->head;
    for (int64_t i=0; ref != NULL; ref = ref->next, i++) {
        ids[i] = (struct channel_id_and_info){
            .id = ref->cid,
            .defaults = ref->chan->defaults,
        };
    }
    *count = channels->numopen;

    cids = ids;
done:
    TyThread_release_lock(channels->mutex);
    return cids;
}

static void
_channels_clear_interpreter(_channels *channels, int64_t interpid)
{
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    _channelref *ref = channels->head;
    for (; ref != NULL; ref = ref->next) {
        if (ref->chan != NULL) {
            _channel_clear_interpreter(ref->chan, interpid);
        }
    }

    TyThread_release_lock(channels->mutex);
}


/* support for closing non-empty channels */

struct _channel_closing {
    _channelref *ref;
};

static int
_channel_set_closing(_channelref *ref, TyThread_type_lock mutex) {
    _channel_state *chan = ref->chan;
    if (chan == NULL) {
        // already closed
        return 0;
    }
    int res = -1;
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);
    if (chan->closing != NULL) {
        res = ERR_CHANNEL_CLOSED;
        goto done;
    }
    chan->closing = GLOBAL_MALLOC(struct _channel_closing);
    if (chan->closing == NULL) {
        goto done;
    }
    chan->closing->ref = ref;

    res = 0;
done:
    TyThread_release_lock(chan->mutex);
    return res;
}

static void
_channel_clear_closing(_channel_state *chan) {
    TyThread_acquire_lock(chan->mutex, WAIT_LOCK);
    if (chan->closing != NULL) {
        GLOBAL_FREE(chan->closing);
        chan->closing = NULL;
    }
    TyThread_release_lock(chan->mutex);
}

static void
_channel_finish_closing(_channel_state *chan) {
    struct _channel_closing *closing = chan->closing;
    if (closing == NULL) {
        return;
    }
    _channelref *ref = closing->ref;
    _channel_clear_closing(chan);
    // Do the things that would have been done in _channels_close().
    ref->chan = NULL;
    _channel_free(chan);
}


/* "high"-level channel-related functions */

// Create a new channel.
static int64_t
channel_create(_channels *channels, struct _channeldefaults defaults)
{
    TyThread_type_lock mutex = TyThread_allocate_lock();
    if (mutex == NULL) {
        return ERR_CHANNEL_MUTEX_INIT;
    }
    _channel_state *chan = _channel_new(mutex, defaults);
    if (chan == NULL) {
        TyThread_free_lock(mutex);
        return -1;
    }
    int64_t cid = _channels_add(channels, chan);
    if (cid < 0) {
        _channel_free(chan);
    }
    return cid;
}

// Completely destroy the channel.
static int
channel_destroy(_channels *channels, int64_t cid)
{
    _channel_state *chan = NULL;
    int err = _channels_remove(channels, cid, &chan);
    if (err != 0) {
        return err;
    }
    if (chan != NULL) {
        _channel_free(chan);
    }
    return 0;
}

// Push an object onto the channel.
// The current interpreter gets associated with the send end of the channel.
// Optionally request to be notified when it is received.
static int
channel_send(_channels *channels, int64_t cid, TyObject *obj,
             _waiting_t *waiting, unboundop_t unboundop, xidata_fallback_t fallback)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyInterpreterState *interp = tstate->interp;
    int64_t interpid = TyInterpreterState_GetID(interp);

    // Look up the channel.
    TyThread_type_lock mutex = NULL;
    _channel_state *chan = NULL;
    int err = _channels_lookup(channels, cid, &mutex, &chan);
    if (err != 0) {
        return err;
    }
    assert(chan != NULL);
    // Past this point we are responsible for releasing the mutex.

    if (chan->closing != NULL) {
        TyThread_release_lock(mutex);
        return ERR_CHANNEL_CLOSED;
    }

    // Convert the object to cross-interpreter data.
    _PyXIData_t *data = _PyXIData_New();
    if (data == NULL) {
        TyThread_release_lock(mutex);
        return -1;
    }
    if (_TyObject_GetXIData(tstate, obj, fallback, data) != 0) {
        TyThread_release_lock(mutex);
        GLOBAL_FREE(data);
        return -1;
    }

    // Add the data to the channel.
    int res = _channel_add(chan, interpid, data, waiting, unboundop);
    TyThread_release_lock(mutex);
    if (res != 0) {
        // We may chain an exception here:
        (void)_release_xid_data(data, 0);
        GLOBAL_FREE(data);
        return res;
    }

    return 0;
}

// Basically, un-send an object.
static void
channel_clear_sent(_channels *channels, int64_t cid, _waiting_t *waiting)
{
    // Look up the channel.
    TyThread_type_lock mutex = NULL;
    _channel_state *chan = NULL;
    int err = _channels_lookup(channels, cid, &mutex, &chan);
    if (err != 0) {
        // The channel was already closed, etc.
        assert(waiting->status == WAITING_RELEASED);
        return;  // Ignore the error.
    }
    assert(chan != NULL);
    // Past this point we are responsible for releasing the mutex.

    _channelitem_id_t itemid = _waiting_get_itemid(waiting);
    _channel_remove(chan, itemid);

    TyThread_release_lock(mutex);
}

// Like channel_send(), but strictly wait for the object to be received.
static int
channel_send_wait(_channels *channels, int64_t cid, TyObject *obj,
                  unboundop_t unboundop, PY_TIMEOUT_T timeout,
                  xidata_fallback_t fallback)
{
    // We use a stack variable here, so we must ensure that &waiting
    // is not held by any channel item at the point this function exits.
    _waiting_t waiting;
    if (_waiting_init(&waiting) < 0) {
        assert(TyErr_Occurred());
        return -1;
    }

    /* Queue up the object. */
    int res = channel_send(channels, cid, obj, &waiting, unboundop, fallback);
    if (res < 0) {
        assert(waiting.status == WAITING_NO_STATUS);
        goto finally;
    }

    /* Wait until the object is received. */
    if (wait_for_lock(waiting.mutex, timeout) < 0) {
        assert(TyErr_Occurred());
        _waiting_finish_releasing(&waiting);
        /* The send() call is failing now, so make sure the item
           won't be received. */
        channel_clear_sent(channels, cid, &waiting);
        assert(waiting.status == WAITING_RELEASED);
        if (!waiting.received) {
            res = -1;
            goto finally;
        }
        // XXX Emit a warning if not a TimeoutError?
        TyErr_Clear();
    }
    else {
        _waiting_finish_releasing(&waiting);
        assert(waiting.status == WAITING_RELEASED);
        if (!waiting.received) {
            res = ERR_CHANNEL_CLOSED_WAITING;
            goto finally;
        }
    }

    /* success! */
    res = 0;

finally:
    _waiting_clear(&waiting);
    return res;
}

// Pop the next object off the channel.  Fail if empty.
// The current interpreter gets associated with the recv end of the channel.
// XXX Support a "wait" mutex?
static int
channel_recv(_channels *channels, int64_t cid, TyObject **res, int *p_unboundop)
{
    int err;
    *res = NULL;

    TyInterpreterState *interp = _get_current_interp();
    if (interp == NULL) {
        // XXX Is this always an error?
        if (TyErr_Occurred()) {
            return -1;
        }
        return 0;
    }
    int64_t interpid = TyInterpreterState_GetID(interp);

    // Look up the channel.
    TyThread_type_lock mutex = NULL;
    _channel_state *chan = NULL;
    err = _channels_lookup(channels, cid, &mutex, &chan);
    if (err != 0) {
        return err;
    }
    assert(chan != NULL);
    // Past this point we are responsible for releasing the mutex.

    // Pop off the next item from the channel.
    _PyXIData_t *data = NULL;
    _waiting_t *waiting = NULL;
    err = _channel_next(chan, interpid, &data, &waiting, p_unboundop);
    TyThread_release_lock(mutex);
    if (err != 0) {
        return err;
    }
    else if (data == NULL) {
        // The item was unbound.
        assert(!TyErr_Occurred());
        *res = NULL;
        return 0;
    }

    // Convert the data back to an object.
    TyObject *obj = _PyXIData_NewObject(data);
    if (obj == NULL) {
        assert(TyErr_Occurred());
        // It was allocated in channel_send(), so we free it.
        (void)_release_xid_data(data, XID_IGNORE_EXC | XID_FREE);
        if (waiting != NULL) {
            _waiting_release(waiting, 0);
        }
        return -1;
    }
    // It was allocated in channel_send(), so we free it.
    int release_res = _release_xid_data(data, XID_FREE);
    if (release_res < 0) {
        // The source interpreter has been destroyed already.
        assert(TyErr_Occurred());
        Ty_DECREF(obj);
        if (waiting != NULL) {
            _waiting_release(waiting, 0);
        }
        return -1;
    }

    // Notify the sender.
    if (waiting != NULL) {
        _waiting_release(waiting, 1);
    }

    *res = obj;
    return 0;
}

// Disallow send/recv for the current interpreter.
// The channel is marked as closed if no other interpreters
// are currently associated.
static int
channel_release(_channels *channels, int64_t cid, int send, int recv)
{
    TyInterpreterState *interp = _get_current_interp();
    if (interp == NULL) {
        return -1;
    }
    int64_t interpid = TyInterpreterState_GetID(interp);

    // Look up the channel.
    TyThread_type_lock mutex = NULL;
    _channel_state *chan = NULL;
    int err = _channels_lookup(channels, cid, &mutex, &chan);
    if (err != 0) {
        return err;
    }
    // Past this point we are responsible for releasing the mutex.

    // Close one or both of the two ends.
    int res = _channel_release_interpreter(chan, interpid, send-recv);
    TyThread_release_lock(mutex);
    return res;
}

// Close the channel (for all interpreters).  Fail if it's already closed.
// Close immediately if it's empty.  Otherwise, disallow sending and
// finally close once empty.  Optionally, immediately clear and close it.
static int
channel_close(_channels *channels, int64_t cid, int end, int force)
{
    return _channels_close(channels, cid, NULL, end, force);
}

// Return true if the identified interpreter is associated
// with the given end of the channel.
static int
channel_is_associated(_channels *channels, int64_t cid, int64_t interpid,
                       int send)
{
    _channel_state *chan = NULL;
    int err = _channels_lookup(channels, cid, NULL, &chan);
    if (err != 0) {
        return err;
    }
    else if (send && chan->closing != NULL) {
        return ERR_CHANNEL_CLOSED;
    }

    _channelend *end = _channelend_find(send ? chan->ends->send : chan->ends->recv,
                                        interpid, NULL);

    return (end != NULL && end->open);
}

static int
channel_get_defaults(_channels *channels, int64_t cid, struct _channeldefaults *defaults)
{
    TyThread_type_lock mutex = NULL;
    _channel_state *channel = NULL;
    int err = _channels_lookup(channels, cid, &mutex, &channel);
    if (err != 0) {
        return err;
    }
    *defaults = channel->defaults;
    TyThread_release_lock(mutex);
    return 0;
}

static int
_channel_get_count(_channels *channels, int64_t cid, Ty_ssize_t *p_count)
{
    TyThread_type_lock mutex = NULL;
    _channel_state *chan = NULL;
    int err = _channels_lookup(channels, cid, &mutex, &chan);
    if (err != 0) {
        return err;
    }
    assert(chan != NULL);
    int64_t count = chan->queue->count;
    TyThread_release_lock(mutex);

    *p_count = (Ty_ssize_t)count;
    return 0;
}


/* channel info */

struct channel_info {
    struct {
        // 1: closed; -1: closing
        int closed;
        struct {
            Ty_ssize_t nsend_only;  // not released
            Ty_ssize_t nsend_only_released;
            Ty_ssize_t nrecv_only;  // not released
            Ty_ssize_t nrecv_only_released;
            Ty_ssize_t nboth;  // not released
            Ty_ssize_t nboth_released;
            Ty_ssize_t nboth_send_released;
            Ty_ssize_t nboth_recv_released;
        } all;
        struct {
            // 1: associated; -1: released
            int send;
            int recv;
        } cur;
    } status;
    int64_t count;
};

static int
_channel_get_info(_channels *channels, int64_t cid, struct channel_info *info)
{
    int err = 0;
    *info = (struct channel_info){0};

    // Get the current interpreter.
    TyInterpreterState *interp = _get_current_interp();
    if (interp == NULL) {
        return -1;
    }
    int64_t interpid = TyInterpreterState_GetID(interp);

    // Hold the global lock until we're done.
    TyThread_acquire_lock(channels->mutex, WAIT_LOCK);

    // Find the channel.
    _channelref *ref = _channelref_find(channels->head, cid, NULL);
    if (ref == NULL) {
        err = ERR_CHANNEL_NOT_FOUND;
        goto finally;
    }
    _channel_state *chan = ref->chan;

    // Check if open.
    if (chan == NULL) {
        info->status.closed = 1;
        goto finally;
    }
    if (!chan->open) {
        assert(chan->queue->count == 0);
        info->status.closed = 1;
        goto finally;
    }
    if (chan->closing != NULL) {
        assert(chan->queue->count > 0);
        info->status.closed = -1;
    }
    else {
        info->status.closed = 0;
    }

    // Get the number of queued objects.
    info->count = chan->queue->count;

    // Get the ends statuses.
    assert(info->status.cur.send == 0);
    assert(info->status.cur.recv == 0);
    _channelend *send = chan->ends->send;
    while (send != NULL) {
        if (send->interpid == interpid) {
            info->status.cur.send = send->open ? 1 : -1;
        }

        if (send->open) {
            info->status.all.nsend_only += 1;
        }
        else {
            info->status.all.nsend_only_released += 1;
        }
        send = send->next;
    }
    _channelend *recv = chan->ends->recv;
    while (recv != NULL) {
        if (recv->interpid == interpid) {
            info->status.cur.recv = recv->open ? 1 : -1;
        }

        // XXX This is O(n*n).  Why do we have 2 linked lists?
        _channelend *send = chan->ends->send;
        while (send != NULL) {
            if (send->interpid == recv->interpid) {
                break;
            }
            send = send->next;
        }
        if (send == NULL) {
            if (recv->open) {
                info->status.all.nrecv_only += 1;
            }
            else {
                info->status.all.nrecv_only_released += 1;
            }
        }
        else {
            if (recv->open) {
                if (send->open) {
                    info->status.all.nboth += 1;
                    info->status.all.nsend_only -= 1;
                }
                else {
                    info->status.all.nboth_recv_released += 1;
                    info->status.all.nsend_only_released -= 1;
                }
            }
            else {
                if (send->open) {
                    info->status.all.nboth_send_released += 1;
                    info->status.all.nsend_only -= 1;
                }
                else {
                    info->status.all.nboth_released += 1;
                    info->status.all.nsend_only_released -= 1;
                }
            }
        }
        recv = recv->next;
    }

finally:
    TyThread_release_lock(channels->mutex);
    return err;
}

TyDoc_STRVAR(channel_info_doc,
"ChannelInfo\n\
\n\
A named tuple of a channel's state.");

static TyStructSequence_Field channel_info_fields[] = {
    {"open", "both ends are open"},
    {"closing", "send is closed, recv is non-empty"},
    {"closed", "both ends are closed"},
    {"count", "queued objects"},

    {"num_interp_send", "interpreters bound to the send end"},
    {"num_interp_send_released",
     "interpreters bound to the send end and released"},

    {"num_interp_recv", "interpreters bound to the send end"},
    {"num_interp_recv_released",
     "interpreters bound to the send end and released"},

    {"num_interp_both", "interpreters bound to both ends"},
    {"num_interp_both_released",
     "interpreters bound to both ends and released_from_both"},
    {"num_interp_both_send_released",
     "interpreters bound to both ends and released_from_the send end"},
    {"num_interp_both_recv_released",
     "interpreters bound to both ends and released_from_the recv end"},

    {"send_associated", "current interpreter is bound to the send end"},
    {"send_released", "current interpreter *was* bound to the send end"},
    {"recv_associated", "current interpreter is bound to the recv end"},
    {"recv_released", "current interpreter *was* bound to the recv end"},
    {0}
};

static TyStructSequence_Desc channel_info_desc = {
    .name = MODULE_NAME_STR ".ChannelInfo",
    .doc = channel_info_doc,
    .fields = channel_info_fields,
    .n_in_sequence = 8,
};

static TyObject *
new_channel_info(TyObject *mod, struct channel_info *info)
{
    module_state *state = get_module_state(mod);
    if (state == NULL) {
        return NULL;
    }

    assert(state->ChannelInfoType != NULL);
    TyObject *self = TyStructSequence_New(state->ChannelInfoType);
    if (self == NULL) {
        return NULL;
    }

    int pos = 0;
#define SET_BOOL(val) \
    TyStructSequence_SET_ITEM(self, pos++, \
                              Ty_NewRef(val ? Ty_True : Ty_False))
#define SET_COUNT(val) \
    do { \
        TyObject *obj = TyLong_FromLongLong(val); \
        if (obj == NULL) { \
            Ty_CLEAR(self); \
            return NULL; \
        } \
        TyStructSequence_SET_ITEM(self, pos++, obj); \
    } while(0)
    SET_BOOL(info->status.closed == 0);
    SET_BOOL(info->status.closed == -1);
    SET_BOOL(info->status.closed == 1);
    SET_COUNT(info->count);
    SET_COUNT(info->status.all.nsend_only);
    SET_COUNT(info->status.all.nsend_only_released);
    SET_COUNT(info->status.all.nrecv_only);
    SET_COUNT(info->status.all.nrecv_only_released);
    SET_COUNT(info->status.all.nboth);
    SET_COUNT(info->status.all.nboth_released);
    SET_COUNT(info->status.all.nboth_send_released);
    SET_COUNT(info->status.all.nboth_recv_released);
    SET_BOOL(info->status.cur.send == 1);
    SET_BOOL(info->status.cur.send == -1);
    SET_BOOL(info->status.cur.recv == 1);
    SET_BOOL(info->status.cur.recv == -1);
#undef SET_COUNT
#undef SET_BOOL
    assert(!TyErr_Occurred());
    return self;
}


/* ChannelID class */

typedef struct channelid {
    PyObject_HEAD
    int64_t cid;
    int end;
    int resolve;
    _channels *channels;
} channelid;

#define channelid_CAST(op)  ((channelid *)(op))

struct channel_id_converter_data {
    TyObject *module;
    int64_t cid;
    int end;
};

static int
channel_id_converter(TyObject *arg, void *ptr)
{
    int64_t cid;
    int end = 0;
    struct channel_id_converter_data *data = ptr;
    module_state *state = get_module_state(data->module);
    assert(state != NULL);
    if (PyObject_TypeCheck(arg, state->ChannelIDType)) {
        cid = ((channelid *)arg)->cid;
        end = ((channelid *)arg)->end;
    }
    else if (PyIndex_Check(arg)) {
        cid = TyLong_AsLongLong(arg);
        if (cid == -1 && TyErr_Occurred()) {
            return 0;
        }
        if (cid < 0) {
            TyErr_Format(TyExc_ValueError,
                        "channel ID must be a non-negative int, got %R", arg);
            return 0;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "channel ID must be an int, got %.100s",
                     Ty_TYPE(arg)->tp_name);
        return 0;
    }
    data->cid = cid;
    data->end = end;
    return 1;
}

static int
newchannelid(TyTypeObject *cls, int64_t cid, int end, _channels *channels,
             int force, int resolve, channelid **res)
{
    *res = NULL;

    channelid *self = PyObject_New(channelid, cls);
    if (self == NULL) {
        return -1;
    }
    self->cid = cid;
    self->end = end;
    self->resolve = resolve;
    self->channels = channels;

    int err = _channels_add_id_object(channels, cid);
    if (err != 0) {
        if (force && err == ERR_CHANNEL_NOT_FOUND) {
            assert(!TyErr_Occurred());
        }
        else {
            Ty_DECREF((TyObject *)self);
            return err;
        }
    }

    *res = self;
    return 0;
}

static _channels * _global_channels(void);

static TyObject *
_channelid_new(TyObject *mod, TyTypeObject *cls,
               TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"id", "send", "recv", "force", "_resolve", NULL};
    int64_t cid;
    int end;
    struct channel_id_converter_data cid_data = {
        .module = mod,
    };
    int send = -1;
    int recv = -1;
    int force = 0;
    int resolve = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&|$pppp:ChannelID.__new__", kwlist,
                                     channel_id_converter, &cid_data,
                                     &send, &recv, &force, &resolve)) {
        return NULL;
    }
    cid = cid_data.cid;
    end = cid_data.end;

    // Handle "send" and "recv".
    if (send == 0 && recv == 0) {
        TyErr_SetString(TyExc_ValueError,
                        "'send' and 'recv' cannot both be False");
        return NULL;
    }
    else if (send == 1) {
        if (recv == 0 || recv == -1) {
            end = CHANNEL_SEND;
        }
        else {
            assert(recv == 1);
            end = 0;
        }
    }
    else if (recv == 1) {
        assert(send == 0 || send == -1);
        end = CHANNEL_RECV;
    }

    TyObject *cidobj = NULL;
    int err = newchannelid(cls, cid, end, _global_channels(),
                           force, resolve,
                           (channelid **)&cidobj);
    if (handle_channel_error(err, mod, cid)) {
        assert(cidobj == NULL);
        return NULL;
    }
    assert(cidobj != NULL);
    return cidobj;
}

static void
channelid_dealloc(TyObject *op)
{
    channelid *self = channelid_CAST(op);
    int64_t cid = self->cid;
    _channels *channels = self->channels;

    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free(self);
    /* "Instances of heap-allocated types hold a reference to their type."
     * See: https://docs.python.org/3.11/howto/isolating-extensions.html#garbage-collection-protocol
     * See: https://docs.python.org/3.11/c-api/typeobj.html#c.TyTypeObject.tp_traverse
    */
    // XXX Why don't we implement Ty_TPFLAGS_HAVE_GC, e.g. Ty_tp_traverse,
    // like we do for _abc._abc_data?
    Ty_DECREF(tp);

    _channels_release_cid_object(channels, cid);
}

static TyObject *
channelid_repr(TyObject *self)
{
    TyTypeObject *type = Ty_TYPE(self);
    const char *name = _TyType_Name(type);

    channelid *cidobj = channelid_CAST(self);
    const char *fmt;
    if (cidobj->end == CHANNEL_SEND) {
        fmt = "%s(%" PRId64 ", send=True)";
    }
    else if (cidobj->end == CHANNEL_RECV) {
        fmt = "%s(%" PRId64 ", recv=True)";
    }
    else {
        fmt = "%s(%" PRId64 ")";
    }
    return TyUnicode_FromFormat(fmt, name, cidobj->cid);
}

static TyObject *
channelid_str(TyObject *self)
{
    channelid *cidobj = channelid_CAST(self);
    return TyUnicode_FromFormat("%" PRId64 "", cidobj->cid);
}

static TyObject *
channelid_int(TyObject *self)
{
    channelid *cidobj = channelid_CAST(self);
    return TyLong_FromLongLong(cidobj->cid);
}

static Ty_hash_t
channelid_hash(TyObject *self)
{
    channelid *cidobj = channelid_CAST(self);
    TyObject *pyid = TyLong_FromLongLong(cidobj->cid);
    if (pyid == NULL) {
        return -1;
    }
    Ty_hash_t hash = PyObject_Hash(pyid);
    Ty_DECREF(pyid);
    return hash;
}

static TyObject *
channelid_richcompare(TyObject *self, TyObject *other, int op)
{
    TyObject *res = NULL;
    if (op != Py_EQ && op != Py_NE) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    TyObject *mod = get_module_from_type(Ty_TYPE(self));
    if (mod == NULL) {
        return NULL;
    }
    module_state *state = get_module_state(mod);
    if (state == NULL) {
        goto done;
    }

    if (!PyObject_TypeCheck(self, state->ChannelIDType)) {
        res = Ty_NewRef(Ty_NotImplemented);
        goto done;
    }

    channelid *cidobj = channelid_CAST(self);
    int equal;
    if (PyObject_TypeCheck(other, state->ChannelIDType)) {
        channelid *othercidobj = (channelid *)other;  // fast safe cast
        equal = (cidobj->end == othercidobj->end) && (cidobj->cid == othercidobj->cid);
    }
    else if (TyLong_Check(other)) {
        /* Fast path */
        int overflow;
        long long othercid = TyLong_AsLongLongAndOverflow(other, &overflow);
        if (othercid == -1 && TyErr_Occurred()) {
            goto done;
        }
        equal = !overflow && (othercid >= 0) && (cidobj->cid == othercid);
    }
    else if (PyNumber_Check(other)) {
        TyObject *pyid = TyLong_FromLongLong(cidobj->cid);
        if (pyid == NULL) {
            goto done;
        }
        res = PyObject_RichCompare(pyid, other, op);
        Ty_DECREF(pyid);
        goto done;
    }
    else {
        res = Ty_NewRef(Ty_NotImplemented);
        goto done;
    }

    if ((op == Py_EQ && equal) || (op == Py_NE && !equal)) {
        res = Ty_NewRef(Ty_True);
    }
    else {
        res = Ty_NewRef(Ty_False);
    }

done:
    Ty_DECREF(mod);
    return res;
}

static TyTypeObject * _get_current_channelend_type(int end);

static TyObject *
_channelobj_from_cidobj(TyObject *cidobj, int end)
{
    TyObject *cls = (TyObject *)_get_current_channelend_type(end);
    if (cls == NULL) {
        return NULL;
    }
    TyObject *chan = PyObject_CallFunctionObjArgs(cls, cidobj, NULL);
    Ty_DECREF(cls);
    if (chan == NULL) {
        return NULL;
    }
    return chan;
}

struct _channelid_xid {
    int64_t cid;
    int end;
    int resolve;
};

static TyObject *
_channelid_from_xid(_PyXIData_t *data)
{
    struct _channelid_xid *xid = (struct _channelid_xid *)_PyXIData_DATA(data);

    // It might not be imported yet, so we can't use _get_current_module().
    TyObject *mod = TyImport_ImportModule(MODULE_NAME_STR);
    if (mod == NULL) {
        return NULL;
    }
    assert(mod != Ty_None);
    module_state *state = get_module_state(mod);
    if (state == NULL) {
        return NULL;
    }

    // Note that we do not preserve the "resolve" flag.
    TyObject *cidobj = NULL;
    int err = newchannelid(state->ChannelIDType, xid->cid, xid->end,
                           _global_channels(), 0, 0,
                           (channelid **)&cidobj);
    if (err != 0) {
        assert(cidobj == NULL);
        (void)handle_channel_error(err, mod, xid->cid);
        goto done;
    }
    assert(cidobj != NULL);
    if (xid->end == 0) {
        goto done;
    }
    if (!xid->resolve) {
        goto done;
    }

    /* Try returning a high-level channel end but fall back to the ID. */
    TyObject *chan = _channelobj_from_cidobj(cidobj, xid->end);
    if (chan == NULL) {
        TyErr_Clear();
        goto done;
    }
    Ty_DECREF(cidobj);
    cidobj = chan;

done:
    Ty_DECREF(mod);
    return cidobj;
}

static int
_channelid_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *data)
{
    if (_PyXIData_InitWithSize(
            data, tstate->interp, sizeof(struct _channelid_xid), obj,
            _channelid_from_xid
            ) < 0)
    {
        return -1;
    }
    struct _channelid_xid *xid = (struct _channelid_xid *)_PyXIData_DATA(data);
    channelid *cidobj = channelid_CAST(obj);
    xid->cid = cidobj->cid;
    xid->end = cidobj->end;
    xid->resolve = cidobj->resolve;
    return 0;
}

static TyObject *
channelid_end(TyObject *self, void *end)
{
    int force = 1;
    channelid *cidobj = channelid_CAST(self);
    if (end != NULL) {
        TyObject *obj = NULL;
        int err = newchannelid(Ty_TYPE(self), cidobj->cid, *(int *)end,
                               cidobj->channels, force, cidobj->resolve,
                               (channelid **)&obj);
        if (err != 0) {
            assert(obj == NULL);
            TyObject *mod = get_module_from_type(Ty_TYPE(self));
            if (mod == NULL) {
                return NULL;
            }
            (void)handle_channel_error(err, mod, cidobj->cid);
            Ty_DECREF(mod);
            return NULL;
        }
        assert(obj != NULL);
        return obj;
    }

    if (cidobj->end == CHANNEL_SEND) {
        return TyUnicode_InternFromString("send");
    }
    if (cidobj->end == CHANNEL_RECV) {
        return TyUnicode_InternFromString("recv");
    }
    return TyUnicode_InternFromString("both");
}

static int _channelid_end_send = CHANNEL_SEND;
static int _channelid_end_recv = CHANNEL_RECV;

static TyGetSetDef channelid_getsets[] = {
    {"end", channelid_end, NULL,
     TyDoc_STR("'send', 'recv', or 'both'")},
    {"send", channelid_end, NULL,
     TyDoc_STR("the 'send' end of the channel"), &_channelid_end_send},
    {"recv", channelid_end, NULL,
     TyDoc_STR("the 'recv' end of the channel"), &_channelid_end_recv},
    {NULL}
};

TyDoc_STRVAR(channelid_doc,
"A channel ID identifies a channel and may be used as an int.");

static TyType_Slot channelid_typeslots[] = {
    {Ty_tp_dealloc, channelid_dealloc},
    {Ty_tp_doc, (void *)channelid_doc},
    {Ty_tp_repr, channelid_repr},
    {Ty_tp_str, channelid_str},
    {Ty_tp_hash, channelid_hash},
    {Ty_tp_richcompare, channelid_richcompare},
    {Ty_tp_getset, channelid_getsets},
    // number slots
    {Ty_nb_int, channelid_int},
    {Ty_nb_index, channelid_int},
    {0, NULL},
};

static TyType_Spec channelid_typespec = {
    .name = MODULE_NAME_STR ".ChannelID",
    .basicsize = sizeof(channelid),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = channelid_typeslots,
};

static TyTypeObject *
add_channelid_type(TyObject *mod)
{
    TyTypeObject *cls = (TyTypeObject *)TyType_FromModuleAndSpec(
                mod, &channelid_typespec, NULL);
    if (cls == NULL) {
        return NULL;
    }
    if (TyModule_AddType(mod, cls) < 0) {
        Ty_DECREF(cls);
        return NULL;
    }
    if (ensure_xid_class(cls, GETDATA(_channelid_shared)) < 0) {
        Ty_DECREF(cls);
        return NULL;
    }
    return cls;
}


/* SendChannel and RecvChannel classes */

// XXX Use a new __xid__ protocol instead?

static TyTypeObject *
_get_current_channelend_type(int end)
{
    module_state *state = _get_current_module_state();
    if (state == NULL) {
        return NULL;
    }
    TyTypeObject *cls;
    if (end == CHANNEL_SEND) {
        cls = state->send_channel_type;
    }
    else {
        assert(end == CHANNEL_RECV);
        cls = state->recv_channel_type;
    }
    if (cls == NULL) {
        // Force the module to be loaded, to register the type.
        if (ensure_highlevel_module_loaded() < 0) {
            return NULL;
        }
        if (end == CHANNEL_SEND) {
            cls = state->send_channel_type;
        }
        else {
            cls = state->recv_channel_type;
        }
        assert(cls != NULL);
    }
    return cls;
}

static TyObject *
_channelend_from_xid(_PyXIData_t *data)
{
    channelid *cidobj = (channelid *)_channelid_from_xid(data);
    if (cidobj == NULL) {
        return NULL;
    }
    TyTypeObject *cls = _get_current_channelend_type(cidobj->end);
    if (cls == NULL) {
        Ty_DECREF(cidobj);
        return NULL;
    }
    TyObject *obj = PyObject_CallOneArg((TyObject *)cls, (TyObject *)cidobj);
    Ty_DECREF(cidobj);
    return obj;
}

static int
_channelend_shared(TyThreadState *tstate, TyObject *obj, _PyXIData_t *data)
{
    TyObject *cidobj = PyObject_GetAttrString(obj, "_id");
    if (cidobj == NULL) {
        return -1;
    }
    int res = _channelid_shared(tstate, cidobj, data);
    Ty_DECREF(cidobj);
    if (res < 0) {
        return -1;
    }
    _PyXIData_SET_NEW_OBJECT(data, _channelend_from_xid);
    return 0;
}

static int
set_channelend_types(TyObject *mod, TyTypeObject *send, TyTypeObject *recv)
{
    module_state *state = get_module_state(mod);
    if (state == NULL) {
        return -1;
    }

    // Clear the old values if the .py module was reloaded.
    if (state->send_channel_type != NULL) {
        (void)clear_xid_class(state->send_channel_type);
        Ty_CLEAR(state->send_channel_type);
    }
    if (state->recv_channel_type != NULL) {
        (void)clear_xid_class(state->recv_channel_type);
        Ty_CLEAR(state->recv_channel_type);
    }

    // Add and register the types.
    state->send_channel_type = (TyTypeObject *)Ty_NewRef(send);
    state->recv_channel_type = (TyTypeObject *)Ty_NewRef(recv);
    if (ensure_xid_class(send, GETDATA(_channelend_shared)) < 0) {
        Ty_CLEAR(state->send_channel_type);
        Ty_CLEAR(state->recv_channel_type);
        return -1;
    }
    if (ensure_xid_class(recv, GETDATA(_channelend_shared)) < 0) {
        (void)clear_xid_class(state->send_channel_type);
        Ty_CLEAR(state->send_channel_type);
        Ty_CLEAR(state->recv_channel_type);
        return -1;
    }

    return 0;
}


/* module level code ********************************************************/

/* globals is the process-global state for the module.  It holds all
   the data that we need to share between interpreters, so it cannot
   hold TyObject values. */
static struct globals {
    PyMutex mutex;
    int module_count;
    _channels channels;
} _globals = {0};

static int
_globals_init(void)
{
    PyMutex_Lock(&_globals.mutex);
    assert(_globals.module_count >= 0);
    _globals.module_count++;
    if (_globals.module_count == 1) {
        // Called for the first time.
        TyThread_type_lock mutex = TyThread_allocate_lock();
        if (mutex == NULL) {
            _globals.module_count--;
            PyMutex_Unlock(&_globals.mutex);
            return ERR_CHANNELS_MUTEX_INIT;
        }
        _channels_init(&_globals.channels, mutex);
    }
    PyMutex_Unlock(&_globals.mutex);
    return 0;
}

static void
_globals_fini(void)
{
    PyMutex_Lock(&_globals.mutex);
    assert(_globals.module_count > 0);
    _globals.module_count--;
    if (_globals.module_count == 0) {
        TyThread_type_lock mutex;
        _channels_fini(&_globals.channels, &mutex);
        assert(mutex != NULL);
        TyThread_free_lock(mutex);
    }
    PyMutex_Unlock(&_globals.mutex);
}

static _channels *
_global_channels(void) {
    return &_globals.channels;
}


static void
clear_interpreter(void *data)
{
    if (_globals.module_count == 0) {
        return;
    }
    TyInterpreterState *interp = (TyInterpreterState *)data;
    assert(interp == _get_current_interp());
    int64_t interpid = TyInterpreterState_GetID(interp);
    _channels_clear_interpreter(&_globals.channels, interpid);
}


static TyObject *
channelsmod_create(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"unboundop", "fallback", NULL};
    int unboundarg = -1;
    int fallbackarg = -1;
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "|ii:create", kwlist,
                                     &unboundarg, &fallbackarg))
    {
        return NULL;
    }
    struct _channeldefaults defaults = {0};
    if (resolve_unboundop(unboundarg, UNBOUND_REPLACE,
                          &defaults.unboundop) < 0)
    {
        return NULL;
    }
    if (resolve_fallback(fallbackarg, _PyXIDATA_FULL_FALLBACK,
                         &defaults.fallback) < 0)
    {
        return NULL;
    }

    int64_t cid = channel_create(&_globals.channels, defaults);
    if (cid < 0) {
        (void)handle_channel_error(-1, self, cid);
        return NULL;
    }
    module_state *state = get_module_state(self);
    if (state == NULL) {
        return NULL;
    }
    channelid *cidobj = NULL;
    int err = newchannelid(state->ChannelIDType, cid, 0,
                           &_globals.channels, 0, 0,
                           &cidobj);
    if (handle_channel_error(err, self, cid)) {
        assert(cidobj == NULL);
        err = channel_destroy(&_globals.channels, cid);
        if (handle_channel_error(err, self, cid)) {
            // XXX issue a warning?
        }
        return NULL;
    }
    assert(cidobj != NULL);
    assert(cidobj->channels != NULL);
    return (TyObject *)cidobj;
}

TyDoc_STRVAR(channelsmod_create_doc,
"channel_create(unboundop) -> cid\n\
\n\
Create a new cross-interpreter channel and return a unique generated ID.");

static TyObject *
channelsmod_destroy(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", NULL};
    int64_t cid;
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O&:channel_destroy", kwlist,
                                     channel_id_converter, &cid_data)) {
        return NULL;
    }
    cid = cid_data.cid;

    int err = channel_destroy(&_globals.channels, cid);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(channelsmod_destroy_doc,
"channel_destroy(cid)\n\
\n\
Close and finalize the channel.  Afterward attempts to use the channel\n\
will behave as though it never existed.");

static TyObject *
channelsmod_list_all(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    int64_t count = 0;
    struct channel_id_and_info *cids =
        _channels_list_all(&_globals.channels, &count);
    if (cids == NULL) {
        if (count == 0) {
            return TyList_New(0);
        }
        return NULL;
    }
    TyObject *ids = TyList_New((Ty_ssize_t)count);
    if (ids == NULL) {
        goto finally;
    }
    module_state *state = get_module_state(self);
    if (state == NULL) {
        Ty_DECREF(ids);
        ids = NULL;
        goto finally;
    }
    struct channel_id_and_info *cur = cids;
    for (int64_t i=0; i < count; cur++, i++) {
        TyObject *cidobj = NULL;
        int err = newchannelid(state->ChannelIDType, cur->id, 0,
                               &_globals.channels, 0, 0,
                               (channelid **)&cidobj);
        if (handle_channel_error(err, self, cur->id)) {
            assert(cidobj == NULL);
            Ty_SETREF(ids, NULL);
            break;
        }
        assert(cidobj != NULL);

        TyObject *item = Ty_BuildValue("Oii", cidobj,
                                       cur->defaults.unboundop,
                                       cur->defaults.fallback);
        Ty_DECREF(cidobj);
        if (item == NULL) {
            Ty_SETREF(ids, NULL);
            break;
        }
        TyList_SET_ITEM(ids, (Ty_ssize_t)i, item);
    }

finally:
    TyMem_Free(cids);
    return ids;
}

TyDoc_STRVAR(channelsmod_list_all_doc,
"channel_list_all() -> [cid]\n\
\n\
Return the list of all IDs for active channels.");

static TyObject *
channelsmod_list_interpreters(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", "send", NULL};
    int64_t cid;            /* Channel ID */
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    int send = 0;           /* Send or receive end? */
    int64_t interpid;
    TyObject *ids, *interpid_obj;
    TyInterpreterState *interp;

    if (!TyArg_ParseTupleAndKeywords(
            args, kwds, "O&$p:channel_list_interpreters",
            kwlist, channel_id_converter, &cid_data, &send)) {
        return NULL;
    }
    cid = cid_data.cid;

    ids = TyList_New(0);
    if (ids == NULL) {
        goto except;
    }

    interp = TyInterpreterState_Head();
    while (interp != NULL) {
        interpid = TyInterpreterState_GetID(interp);
        assert(interpid >= 0);
        int res = channel_is_associated(&_globals.channels, cid, interpid, send);
        if (res < 0) {
            (void)handle_channel_error(res, self, cid);
            goto except;
        }
        if (res) {
            interpid_obj = _TyInterpreterState_GetIDObject(interp);
            if (interpid_obj == NULL) {
                goto except;
            }
            res = TyList_Insert(ids, 0, interpid_obj);
            Ty_DECREF(interpid_obj);
            if (res < 0) {
                goto except;
            }
        }
        interp = TyInterpreterState_Next(interp);
    }

    goto finally;

except:
    Ty_CLEAR(ids);

finally:
    return ids;
}

TyDoc_STRVAR(channelsmod_list_interpreters_doc,
"channel_list_interpreters(cid, *, send) -> [id]\n\
\n\
Return the list of all interpreter IDs associated with an end of the channel.\n\
\n\
The 'send' argument should be a boolean indicating whether to use the send or\n\
receive end.");


static TyObject *
channelsmod_send(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", "obj", "unboundop", "fallback",
                             "blocking", "timeout", NULL};
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    TyObject *obj;
    int unboundarg = -1;
    int fallbackarg = -1;
    int blocking = 1;
    TyObject *timeout_obj = NULL;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&O|ii$pO:channel_send", kwlist,
                                     channel_id_converter, &cid_data, &obj,
                                     &unboundarg, &fallbackarg,
                                     &blocking, &timeout_obj))
    {
        return NULL;
    }
    int64_t cid = cid_data.cid;
    PY_TIMEOUT_T timeout;
    if (TyThread_ParseTimeoutArg(timeout_obj, blocking, &timeout) < 0) {
        return NULL;
    }
    struct _channeldefaults defaults = {-1, -1};
    if (unboundarg < 0 || fallbackarg < 0) {
        int err = channel_get_defaults(&_globals.channels, cid, &defaults);
        if (handle_channel_error(err, self, cid)) {
            return NULL;
        }
    }
    unboundop_t unboundop;
    if (resolve_unboundop(unboundarg, defaults.unboundop, &unboundop) < 0) {
        return NULL;
    }
    xidata_fallback_t fallback;
    if (resolve_fallback(fallbackarg, defaults.fallback, &fallback) < 0) {
        return NULL;
    }

    /* Queue up the object. */
    int err = 0;
    if (blocking) {
        err = channel_send_wait(
                &_globals.channels, cid, obj, unboundop, timeout, fallback);
    }
    else {
        err = channel_send(
                &_globals.channels, cid, obj, NULL, unboundop, fallback);
    }
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }

    Py_RETURN_NONE;
}

TyDoc_STRVAR(channelsmod_send_doc,
"channel_send(cid, obj, *, blocking=True, timeout=None)\n\
\n\
Add the object's data to the channel's queue.\n\
By default this waits for the object to be received.");

static TyObject *
channelsmod_send_buffer(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", "obj", "unboundop", "fallback",
                             "blocking", "timeout", NULL};
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    TyObject *obj;
    int unboundarg = -1;
    int fallbackarg = -1;
    int blocking = -1;
    TyObject *timeout_obj = NULL;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&O|ii$pO:channel_send_buffer", kwlist,
                                     channel_id_converter, &cid_data, &obj,
                                     &unboundarg, &fallbackarg,
                                     &blocking, &timeout_obj))
    {
        return NULL;
    }
    int64_t cid = cid_data.cid;
    PY_TIMEOUT_T timeout;
    if (TyThread_ParseTimeoutArg(timeout_obj, blocking, &timeout) < 0) {
        return NULL;
    }
    struct _channeldefaults defaults = {-1, -1};
    if (unboundarg < 0 || fallbackarg < 0) {
        int err = channel_get_defaults(&_globals.channels, cid, &defaults);
        if (handle_channel_error(err, self, cid)) {
            return NULL;
        }
    }
    unboundop_t unboundop;
    if (resolve_unboundop(unboundarg, defaults.unboundop, &unboundop) < 0) {
        return NULL;
    }
    xidata_fallback_t fallback;
    if (resolve_fallback(fallbackarg, defaults.fallback, &fallback) < 0) {
        return NULL;
    }

    TyObject *tempobj = TyMemoryView_FromObject(obj);
    if (tempobj == NULL) {
        return NULL;
    }

    /* Queue up the object. */
    int err = 0;
    if (blocking) {
        err = channel_send_wait(
                &_globals.channels, cid, tempobj, unboundop, timeout, fallback);
    }
    else {
        err = channel_send(
                &_globals.channels, cid, tempobj, NULL, unboundop, fallback);
    }
    Ty_DECREF(tempobj);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }

    Py_RETURN_NONE;
}

TyDoc_STRVAR(channelsmod_send_buffer_doc,
"channel_send_buffer(cid, obj, *, blocking=True, timeout=None)\n\
\n\
Add the object's buffer to the channel's queue.\n\
By default this waits for the object to be received.");

static TyObject *
channelsmod_recv(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", "default", NULL};
    int64_t cid;
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    TyObject *dflt = NULL;
    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O&|O:channel_recv", kwlist,
                                     channel_id_converter, &cid_data, &dflt)) {
        return NULL;
    }
    cid = cid_data.cid;

    TyObject *obj = NULL;
    unboundop_t unboundop = 0;
    int err = channel_recv(&_globals.channels, cid, &obj, &unboundop);
    if (err == ERR_CHANNEL_EMPTY && dflt != NULL) {
        // Use the default.
        obj = Ty_NewRef(dflt);
        err = 0;
    }
    else if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    else if (obj == NULL) {
        // The item was unbound.
        return Ty_BuildValue("Oi", Ty_None, unboundop);
    }

    TyObject *res = Ty_BuildValue("OO", obj, Ty_None);
    Ty_DECREF(obj);
    return res;
}

TyDoc_STRVAR(channelsmod_recv_doc,
"channel_recv(cid, [default]) -> (obj, unboundop)\n\
\n\
Return a new object from the data at the front of the channel's queue.\n\
\n\
If there is nothing to receive then raise ChannelEmptyError, unless\n\
a default value is provided.  In that case return it.");

static TyObject *
channelsmod_close(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", "send", "recv", "force", NULL};
    int64_t cid;
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    int send = 0;
    int recv = 0;
    int force = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&|$ppp:channel_close", kwlist,
                                     channel_id_converter, &cid_data,
                                     &send, &recv, &force)) {
        return NULL;
    }
    cid = cid_data.cid;

    int err = channel_close(&_globals.channels, cid, send-recv, force);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(channelsmod_close_doc,
"channel_close(cid, *, send=None, recv=None, force=False)\n\
\n\
Close the channel for all interpreters.\n\
\n\
If the channel is empty then the keyword args are ignored and both\n\
ends are immediately closed.  Otherwise, if 'force' is True then\n\
all queued items are released and both ends are immediately\n\
closed.\n\
\n\
If the channel is not empty *and* 'force' is False then following\n\
happens:\n\
\n\
 * recv is True (regardless of send):\n\
   - raise ChannelNotEmptyError\n\
 * recv is None and send is None:\n\
   - raise ChannelNotEmptyError\n\
 * send is True and recv is not True:\n\
   - fully close the 'send' end\n\
   - close the 'recv' end to interpreters not already receiving\n\
   - fully close it once empty\n\
\n\
Closing an already closed channel results in a ChannelClosedError.\n\
\n\
Once the channel's ID has no more ref counts in any interpreter\n\
the channel will be destroyed.");

static TyObject *
channelsmod_release(TyObject *self, TyObject *args, TyObject *kwds)
{
    // Note that only the current interpreter is affected.
    static char *kwlist[] = {"cid", "send", "recv", "force", NULL};
    int64_t cid;
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    int send = 0;
    int recv = 0;
    int force = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&|$ppp:channel_release", kwlist,
                                     channel_id_converter, &cid_data,
                                     &send, &recv, &force)) {
        return NULL;
    }
    cid = cid_data.cid;
    if (send == 0 && recv == 0) {
        send = 1;
        recv = 1;
    }

    // XXX Handle force is True.
    // XXX Fix implicit release.

    int err = channel_release(&_globals.channels, cid, send, recv);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(channelsmod_release_doc,
"channel_release(cid, *, send=None, recv=None, force=True)\n\
\n\
Close the channel for the current interpreter.  'send' and 'recv'\n\
(bool) may be used to indicate the ends to close.  By default both\n\
ends are closed.  Closing an already closed end is a noop.");

static TyObject *
channelsmod_get_count(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", NULL};
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&:get_count", kwlist,
                                     channel_id_converter, &cid_data)) {
        return NULL;
    }
    int64_t cid = cid_data.cid;

    Ty_ssize_t count = -1;
    int err = _channel_get_count(&_globals.channels, cid, &count);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    assert(count >= 0);
    return TyLong_FromSsize_t(count);
}

TyDoc_STRVAR(channelsmod_get_count_doc,
"get_count(cid)\n\
\n\
Return the number of items in the channel.");

static TyObject *
channelsmod_get_info(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", NULL};
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&:_get_info", kwlist,
                                     channel_id_converter, &cid_data)) {
        return NULL;
    }
    int64_t cid = cid_data.cid;

    struct channel_info info;
    int err = _channel_get_info(&_globals.channels, cid, &info);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }
    return new_channel_info(self, &info);
}

TyDoc_STRVAR(channelsmod_get_info_doc,
"get_info(cid)\n\
\n\
Return details about the channel.");

static TyObject *
channelsmod_get_channel_defaults(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"cid", NULL};
    struct channel_id_converter_data cid_data = {
        .module = self,
    };
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "O&:get_channel_defaults", kwlist,
                                     channel_id_converter, &cid_data)) {
        return NULL;
    }
    int64_t cid = cid_data.cid;

    struct _channeldefaults defaults = {0};
    int err = channel_get_defaults(&_globals.channels, cid, &defaults);
    if (handle_channel_error(err, self, cid)) {
        return NULL;
    }

    TyObject *res = Ty_BuildValue("ii", defaults.unboundop, defaults.fallback);
    return res;
}

TyDoc_STRVAR(channelsmod_get_channel_defaults_doc,
"get_channel_defaults(cid)\n\
\n\
Return the channel's default values, set when it was created.");

static TyObject *
channelsmod__channel_id(TyObject *self, TyObject *args, TyObject *kwds)
{
    module_state *state = get_module_state(self);
    if (state == NULL) {
        return NULL;
    }
    TyTypeObject *cls = state->ChannelIDType;

    TyObject *mod = get_module_from_owned_type(cls);
    assert(mod == self);
    Ty_DECREF(mod);

    return _channelid_new(self, cls, args, kwds);
}

static TyObject *
channelsmod__register_end_types(TyObject *self, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"send", "recv", NULL};
    TyObject *send;
    TyObject *recv;
    if (!TyArg_ParseTupleAndKeywords(args, kwds,
                                     "OO:_register_end_types", kwlist,
                                     &send, &recv)) {
        return NULL;
    }
    if (!TyType_Check(send)) {
        TyErr_SetString(TyExc_TypeError, "expected a type for 'send'");
        return NULL;
    }
    if (!TyType_Check(recv)) {
        TyErr_SetString(TyExc_TypeError, "expected a type for 'recv'");
        return NULL;
    }
    TyTypeObject *cls_send = (TyTypeObject *)send;
    TyTypeObject *cls_recv = (TyTypeObject *)recv;

    if (set_channelend_types(self, cls_send, cls_recv) < 0) {
        return NULL;
    }

    Py_RETURN_NONE;
}

static TyMethodDef module_functions[] = {
    {"create",                     _PyCFunction_CAST(channelsmod_create),
     METH_VARARGS | METH_KEYWORDS, channelsmod_create_doc},
    {"destroy",                    _PyCFunction_CAST(channelsmod_destroy),
     METH_VARARGS | METH_KEYWORDS, channelsmod_destroy_doc},
    {"list_all",                   channelsmod_list_all,
     METH_NOARGS,                  channelsmod_list_all_doc},
    {"list_interpreters",          _PyCFunction_CAST(channelsmod_list_interpreters),
     METH_VARARGS | METH_KEYWORDS, channelsmod_list_interpreters_doc},
    {"send",                       _PyCFunction_CAST(channelsmod_send),
     METH_VARARGS | METH_KEYWORDS, channelsmod_send_doc},
    {"send_buffer",                _PyCFunction_CAST(channelsmod_send_buffer),
     METH_VARARGS | METH_KEYWORDS, channelsmod_send_buffer_doc},
    {"recv",                       _PyCFunction_CAST(channelsmod_recv),
     METH_VARARGS | METH_KEYWORDS, channelsmod_recv_doc},
    {"close",                      _PyCFunction_CAST(channelsmod_close),
     METH_VARARGS | METH_KEYWORDS, channelsmod_close_doc},
    {"release",                    _PyCFunction_CAST(channelsmod_release),
     METH_VARARGS | METH_KEYWORDS, channelsmod_release_doc},
    {"get_count",                   _PyCFunction_CAST(channelsmod_get_count),
     METH_VARARGS | METH_KEYWORDS, channelsmod_get_count_doc},
    {"get_info",                   _PyCFunction_CAST(channelsmod_get_info),
     METH_VARARGS | METH_KEYWORDS, channelsmod_get_info_doc},
    {"get_channel_defaults",       _PyCFunction_CAST(channelsmod_get_channel_defaults),
     METH_VARARGS | METH_KEYWORDS, channelsmod_get_channel_defaults_doc},
    {"_channel_id",                _PyCFunction_CAST(channelsmod__channel_id),
     METH_VARARGS | METH_KEYWORDS, NULL},
    {"_register_end_types",        _PyCFunction_CAST(channelsmod__register_end_types),
     METH_VARARGS | METH_KEYWORDS, NULL},

    {NULL,                        NULL}           /* sentinel */
};


/* initialization function */

TyDoc_STRVAR(module_doc,
"This module provides primitive operations to manage Python interpreters.\n\
The 'interpreters' module provides a more convenient interface.");

static int
module_exec(TyObject *mod)
{
    int err = _globals_init();
    if (handle_channel_error(err, mod, -1)) {
        return -1;
    }

    module_state *state = get_module_state(mod);
    if (state == NULL) {
        goto error;
    }

    /* Add exception types */
    if (exceptions_init(mod) != 0) {
        goto error;
    }

    /* Add other types */

    // ChannelInfo
    state->ChannelInfoType = TyStructSequence_NewType(&channel_info_desc);
    if (state->ChannelInfoType == NULL) {
        goto error;
    }
    if (TyModule_AddType(mod, state->ChannelInfoType) < 0) {
        goto error;
    }

    // ChannelID
    state->ChannelIDType = add_channelid_type(mod);
    if (state->ChannelIDType == NULL) {
        goto error;
    }

    /* Make sure chnnels drop objects owned by this interpreter. */
    TyInterpreterState *interp = _get_current_interp();
    PyUnstable_AtExit(interp, clear_interpreter, (void *)interp);

    return 0;

error:
    if (state != NULL) {
        clear_xid_types(state);
    }
    _globals_fini();
    return -1;
}

static struct PyModuleDef_Slot module_slots[] = {
    {Ty_mod_exec, module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static int
module_traverse(TyObject *mod, visitproc visit, void *arg)
{
    module_state *state = get_module_state(mod);
    assert(state != NULL);
    return traverse_module_state(state, visit, arg);
}

static int
module_clear(TyObject *mod)
{
    module_state *state = get_module_state(mod);
    assert(state != NULL);

    // Now we clear the module state.
    return clear_module_state(state);
}

static void
module_free(void *mod)
{
    module_state *state = get_module_state((TyObject *)mod);
    assert(state != NULL);

    // Now we clear the module state.
    (void)clear_module_state(state);

    _globals_fini();
}

static struct TyModuleDef moduledef = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = MODULE_NAME_STR,
    .m_doc = module_doc,
    .m_size = sizeof(module_state),
    .m_methods = module_functions,
    .m_slots = module_slots,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free,
};

PyMODINIT_FUNC
MODINIT_FUNC_NAME(void)
{
    return PyModuleDef_Init(&moduledef);
}
