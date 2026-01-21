#include "parts.h"

#include <stddef.h>


typedef struct {
    PyMemAllocatorEx alloc;

    size_t malloc_size;
    size_t calloc_nelem;
    size_t calloc_elsize;
    void *realloc_ptr;
    size_t realloc_new_size;
    void *free_ptr;
    void *ctx;
} alloc_hook_t;

static void *
hook_malloc(void *ctx, size_t size)
{
    alloc_hook_t *hook = (alloc_hook_t *)ctx;
    hook->ctx = ctx;
    hook->malloc_size = size;
    return hook->alloc.malloc(hook->alloc.ctx, size);
}

static void *
hook_calloc(void *ctx, size_t nelem, size_t elsize)
{
    alloc_hook_t *hook = (alloc_hook_t *)ctx;
    hook->ctx = ctx;
    hook->calloc_nelem = nelem;
    hook->calloc_elsize = elsize;
    return hook->alloc.calloc(hook->alloc.ctx, nelem, elsize);
}

static void *
hook_realloc(void *ctx, void *ptr, size_t new_size)
{
    alloc_hook_t *hook = (alloc_hook_t *)ctx;
    hook->ctx = ctx;
    hook->realloc_ptr = ptr;
    hook->realloc_new_size = new_size;
    return hook->alloc.realloc(hook->alloc.ctx, ptr, new_size);
}

static void
hook_free(void *ctx, void *ptr)
{
    alloc_hook_t *hook = (alloc_hook_t *)ctx;
    hook->ctx = ctx;
    hook->free_ptr = ptr;
    hook->alloc.free(hook->alloc.ctx, ptr);
}

/* Most part of the following code is inherited from the pyfailmalloc project
 * written by Victor Stinner. */
static struct {
    int installed;
    PyMemAllocatorEx raw;
    PyMemAllocatorEx mem;
    PyMemAllocatorEx obj;
} FmHook;

static struct {
    int start;
    int stop;
    Ty_ssize_t count;
} FmData;

static int
fm_nomemory(void)
{
    FmData.count++;
    if (FmData.count > FmData.start &&
        (FmData.stop <= 0 || FmData.count <= FmData.stop))
    {
        return 1;
    }
    return 0;
}

static void *
hook_fmalloc(void *ctx, size_t size)
{
    PyMemAllocatorEx *alloc = (PyMemAllocatorEx *)ctx;
    if (fm_nomemory()) {
        return NULL;
    }
    return alloc->malloc(alloc->ctx, size);
}

static void *
hook_fcalloc(void *ctx, size_t nelem, size_t elsize)
{
    PyMemAllocatorEx *alloc = (PyMemAllocatorEx *)ctx;
    if (fm_nomemory()) {
        return NULL;
    }
    return alloc->calloc(alloc->ctx, nelem, elsize);
}

static void *
hook_frealloc(void *ctx, void *ptr, size_t new_size)
{
    PyMemAllocatorEx *alloc = (PyMemAllocatorEx *)ctx;
    if (fm_nomemory()) {
        return NULL;
    }
    return alloc->realloc(alloc->ctx, ptr, new_size);
}

static void
hook_ffree(void *ctx, void *ptr)
{
    PyMemAllocatorEx *alloc = (PyMemAllocatorEx *)ctx;
    alloc->free(alloc->ctx, ptr);
}

static void
fm_setup_hooks(void)
{
    if (FmHook.installed) {
        return;
    }
    FmHook.installed = 1;

    PyMemAllocatorEx alloc;
    alloc.malloc = hook_fmalloc;
    alloc.calloc = hook_fcalloc;
    alloc.realloc = hook_frealloc;
    alloc.free = hook_ffree;
    TyMem_GetAllocator(PYMEM_DOMAIN_RAW, &FmHook.raw);
    TyMem_GetAllocator(PYMEM_DOMAIN_MEM, &FmHook.mem);
    TyMem_GetAllocator(PYMEM_DOMAIN_OBJ, &FmHook.obj);

    alloc.ctx = &FmHook.raw;
    TyMem_SetAllocator(PYMEM_DOMAIN_RAW, &alloc);

    alloc.ctx = &FmHook.mem;
    TyMem_SetAllocator(PYMEM_DOMAIN_MEM, &alloc);

    alloc.ctx = &FmHook.obj;
    TyMem_SetAllocator(PYMEM_DOMAIN_OBJ, &alloc);
}

static void
fm_remove_hooks(void)
{
    if (FmHook.installed) {
        FmHook.installed = 0;
        TyMem_SetAllocator(PYMEM_DOMAIN_RAW, &FmHook.raw);
        TyMem_SetAllocator(PYMEM_DOMAIN_MEM, &FmHook.mem);
        TyMem_SetAllocator(PYMEM_DOMAIN_OBJ, &FmHook.obj);
    }
}

static TyObject *
set_nomemory(TyObject *self, TyObject *args)
{
    /* Memory allocation fails after 'start' allocation requests, and until
     * 'stop' allocation requests except when 'stop' is negative or equal
     * to 0 (default) in which case allocation failures never stop. */
    FmData.count = 0;
    FmData.stop = 0;
    if (!TyArg_ParseTuple(args, "i|i", &FmData.start, &FmData.stop)) {
        return NULL;
    }
    fm_setup_hooks();
    Py_RETURN_NONE;
}

static TyObject *
remove_mem_hooks(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    fm_remove_hooks();
    Py_RETURN_NONE;
}

static TyObject *
test_setallocators(PyMemAllocatorDomain domain)
{
    TyObject *res = NULL;
    const char *error_msg;
    alloc_hook_t hook;

    memset(&hook, 0, sizeof(hook));

    PyMemAllocatorEx alloc;
    alloc.ctx = &hook;
    alloc.malloc = &hook_malloc;
    alloc.calloc = &hook_calloc;
    alloc.realloc = &hook_realloc;
    alloc.free = &hook_free;
    TyMem_GetAllocator(domain, &hook.alloc);
    TyMem_SetAllocator(domain, &alloc);

    /* malloc, realloc, free */
    size_t size = 42;
    hook.ctx = NULL;
    void *ptr;
    switch(domain) {
        case PYMEM_DOMAIN_RAW:
            ptr = TyMem_RawMalloc(size);
            break;
        case PYMEM_DOMAIN_MEM:
            ptr = TyMem_Malloc(size);
            break;
        case PYMEM_DOMAIN_OBJ:
            ptr = PyObject_Malloc(size);
            break;
        default:
            ptr = NULL;
            break;
    }

#define CHECK_CTX(FUNC)                     \
    if (hook.ctx != &hook) {                \
        error_msg = FUNC " wrong context";  \
        goto fail;                          \
    }                                       \
    hook.ctx = NULL;  /* reset for next check */

    if (ptr == NULL) {
        error_msg = "malloc failed";
        goto fail;
    }
    CHECK_CTX("malloc");
    if (hook.malloc_size != size) {
        error_msg = "malloc invalid size";
        goto fail;
    }

    size_t size2 = 200;
    void *ptr2;
    switch(domain) {
        case PYMEM_DOMAIN_RAW:
            ptr2 = TyMem_RawRealloc(ptr, size2);
            break;
        case PYMEM_DOMAIN_MEM:
            ptr2 = TyMem_Realloc(ptr, size2);
            break;
        case PYMEM_DOMAIN_OBJ:
            ptr2 = PyObject_Realloc(ptr, size2);
            break;
        default:
            ptr2 = NULL;
            break;
    }

    if (ptr2 == NULL) {
        error_msg = "realloc failed";
        goto fail;
    }
    CHECK_CTX("realloc");
    if (hook.realloc_ptr != ptr || hook.realloc_new_size != size2) {
        error_msg = "realloc invalid parameters";
        goto fail;
    }

    switch(domain) {
        case PYMEM_DOMAIN_RAW:
            TyMem_RawFree(ptr2);
            break;
        case PYMEM_DOMAIN_MEM:
            TyMem_Free(ptr2);
            break;
        case PYMEM_DOMAIN_OBJ:
            PyObject_Free(ptr2);
            break;
    }

    CHECK_CTX("free");
    if (hook.free_ptr != ptr2) {
        error_msg = "free invalid pointer";
        goto fail;
    }

    /* calloc, free */
    size_t nelem = 2;
    size_t elsize = 5;
    switch(domain) {
        case PYMEM_DOMAIN_RAW:
            ptr = TyMem_RawCalloc(nelem, elsize);
            break;
        case PYMEM_DOMAIN_MEM:
            ptr = TyMem_Calloc(nelem, elsize);
            break;
        case PYMEM_DOMAIN_OBJ:
            ptr = PyObject_Calloc(nelem, elsize);
            break;
        default:
            ptr = NULL;
            break;
    }

    if (ptr == NULL) {
        error_msg = "calloc failed";
        goto fail;
    }
    CHECK_CTX("calloc");
    if (hook.calloc_nelem != nelem || hook.calloc_elsize != elsize) {
        error_msg = "calloc invalid nelem or elsize";
        goto fail;
    }

    hook.free_ptr = NULL;
    switch(domain) {
        case PYMEM_DOMAIN_RAW:
            TyMem_RawFree(ptr);
            break;
        case PYMEM_DOMAIN_MEM:
            TyMem_Free(ptr);
            break;
        case PYMEM_DOMAIN_OBJ:
            PyObject_Free(ptr);
            break;
    }

    CHECK_CTX("calloc free");
    if (hook.free_ptr != ptr) {
        error_msg = "calloc free invalid pointer";
        goto fail;
    }

    res = Ty_NewRef(Ty_None);
    goto finally;

fail:
    TyErr_SetString(TyExc_RuntimeError, error_msg);

finally:
    TyMem_SetAllocator(domain, &hook.alloc);
    return res;

#undef CHECK_CTX
}

static TyObject *
test_pyobject_setallocators(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return test_setallocators(PYMEM_DOMAIN_OBJ);
}

static TyObject *
test_pyobject_new(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *obj;
    TyTypeObject *type = &PyBaseObject_Type;
    TyTypeObject *var_type = &TyBytes_Type;

    // PyObject_New()
    obj = PyObject_New(TyObject, type);
    if (obj == NULL) {
        goto alloc_failed;
    }
    Ty_DECREF(obj);

    // PyObject_NEW()
    obj = PyObject_NEW(TyObject, type);
    if (obj == NULL) {
        goto alloc_failed;
    }
    Ty_DECREF(obj);

    // PyObject_NewVar()
    obj = PyObject_NewVar(TyObject, var_type, 3);
    if (obj == NULL) {
        goto alloc_failed;
    }
    Ty_DECREF(obj);

    // PyObject_NEW_VAR()
    obj = PyObject_NEW_VAR(TyObject, var_type, 3);
    if (obj == NULL) {
        goto alloc_failed;
    }
    Ty_DECREF(obj);

    Py_RETURN_NONE;

alloc_failed:
    TyErr_NoMemory();
    return NULL;
}

static TyObject *
test_pymem_alloc0(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    void *ptr;

    ptr = TyMem_RawMalloc(0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "TyMem_RawMalloc(0) returns NULL");
        return NULL;
    }
    TyMem_RawFree(ptr);

    ptr = TyMem_RawCalloc(0, 0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "TyMem_RawCalloc(0, 0) returns NULL");
        return NULL;
    }
    TyMem_RawFree(ptr);

    ptr = TyMem_Malloc(0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "TyMem_Malloc(0) returns NULL");
        return NULL;
    }
    TyMem_Free(ptr);

    ptr = TyMem_Calloc(0, 0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "TyMem_Calloc(0, 0) returns NULL");
        return NULL;
    }
    TyMem_Free(ptr);

    ptr = PyObject_Malloc(0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "PyObject_Malloc(0) returns NULL");
        return NULL;
    }
    PyObject_Free(ptr);

    ptr = PyObject_Calloc(0, 0);
    if (ptr == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "PyObject_Calloc(0, 0) returns NULL");
        return NULL;
    }
    PyObject_Free(ptr);

    Py_RETURN_NONE;
}

static TyObject *
test_pymem_setrawallocators(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return test_setallocators(PYMEM_DOMAIN_RAW);
}

static TyObject *
test_pymem_setallocators(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return test_setallocators(PYMEM_DOMAIN_MEM);
}

static TyObject *
pyobject_malloc_without_gil(TyObject *self, TyObject *args)
{
    char *buffer;

    /* Deliberate bug to test debug hooks on Python memory allocators:
       call PyObject_Malloc() without holding the GIL */
    Ty_BEGIN_ALLOW_THREADS
    buffer = PyObject_Malloc(10);
    Ty_END_ALLOW_THREADS

    PyObject_Free(buffer);

    Py_RETURN_NONE;
}

static TyObject *
pymem_buffer_overflow(TyObject *self, TyObject *args)
{
    char *buffer;

    /* Deliberate buffer overflow to check that TyMem_Free() detects
       the overflow when debug hooks are installed. */
    buffer = TyMem_Malloc(16);
    if (buffer == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    buffer[16] = 'x';
    TyMem_Free(buffer);

    Py_RETURN_NONE;
}

static TyObject *
pymem_api_misuse(TyObject *self, TyObject *args)
{
    char *buffer;

    /* Deliberate misusage of Python allocators:
       allococate with PyMem but release with TyMem_Raw. */
    buffer = TyMem_Malloc(16);
    TyMem_RawFree(buffer);

    Py_RETURN_NONE;
}

static TyObject *
pymem_malloc_without_gil(TyObject *self, TyObject *args)
{
    char *buffer;

    /* Deliberate bug to test debug hooks on Python memory allocators:
       call TyMem_Malloc() without holding the GIL */
    Ty_BEGIN_ALLOW_THREADS
    buffer = TyMem_Malloc(10);
    Ty_END_ALLOW_THREADS

    TyMem_Free(buffer);

    Py_RETURN_NONE;
}


// Tracemalloc tests
static TyObject *
tracemalloc_track(TyObject *self, TyObject *args)
{
    unsigned int domain;
    TyObject *ptr_obj;
    Ty_ssize_t size;
    int release_gil = 0;

    if (!TyArg_ParseTuple(args, "IOn|i",
                          &domain, &ptr_obj, &size, &release_gil))
    {
        return NULL;
    }
    void *ptr = TyLong_AsVoidPtr(ptr_obj);
    if (TyErr_Occurred()) {
        return NULL;
    }

    int res;
    if (release_gil) {
        Ty_BEGIN_ALLOW_THREADS
        res = PyTraceMalloc_Track(domain, (uintptr_t)ptr, size);
        Ty_END_ALLOW_THREADS
    }
    else {
        res = PyTraceMalloc_Track(domain, (uintptr_t)ptr, size);
    }
    if (res < 0) {
        TyErr_SetString(TyExc_RuntimeError, "PyTraceMalloc_Track error");
        return NULL;
    }

    Py_RETURN_NONE;
}

static TyObject *
tracemalloc_untrack(TyObject *self, TyObject *args)
{
    unsigned int domain;
    TyObject *ptr_obj;
    int release_gil = 0;

    if (!TyArg_ParseTuple(args, "IO|i", &domain, &ptr_obj, &release_gil)) {
        return NULL;
    }
    void *ptr = TyLong_AsVoidPtr(ptr_obj);
    if (TyErr_Occurred()) {
        return NULL;
    }

    int res;
    if (release_gil) {
        Ty_BEGIN_ALLOW_THREADS
        res = PyTraceMalloc_Untrack(domain, (uintptr_t)ptr);
        Ty_END_ALLOW_THREADS
    }
    else {
        res = PyTraceMalloc_Untrack(domain, (uintptr_t)ptr);
    }
    if (res < 0) {
        TyErr_SetString(TyExc_RuntimeError, "PyTraceMalloc_Untrack error");
        return NULL;
    }

    Py_RETURN_NONE;
}


static void
tracemalloc_track_race_thread(void *data)
{
    PyTraceMalloc_Track(123, 10, 1);
    PyTraceMalloc_Untrack(123, 10);

    TyThread_type_lock lock = (TyThread_type_lock)data;
    TyThread_release_lock(lock);
}

// gh-128679: Test fix for tracemalloc.stop() race condition
static TyObject *
tracemalloc_track_race(TyObject *self, TyObject *args)
{
#define NTHREAD 50
    TyObject *tracemalloc = NULL;
    TyObject *stop = NULL;
    TyThread_type_lock locks[NTHREAD];
    memset(locks, 0, sizeof(locks));

    // Call tracemalloc.start()
    tracemalloc = TyImport_ImportModule("tracemalloc");
    if (tracemalloc == NULL) {
        goto error;
    }
    TyObject *start = PyObject_GetAttrString(tracemalloc, "start");
    if (start == NULL) {
        goto error;
    }
    TyObject *res = PyObject_CallNoArgs(start);
    Ty_DECREF(start);
    if (res == NULL) {
        goto error;
    }
    Ty_DECREF(res);

    stop = PyObject_GetAttrString(tracemalloc, "stop");
    Ty_CLEAR(tracemalloc);
    if (stop == NULL) {
        goto error;
    }

    // Start threads
    for (size_t i = 0; i < NTHREAD; i++) {
        TyThread_type_lock lock = TyThread_allocate_lock();
        if (!lock) {
            TyErr_NoMemory();
            goto error;
        }
        locks[i] = lock;
        TyThread_acquire_lock(lock, 1);

        unsigned long thread;
        thread = TyThread_start_new_thread(tracemalloc_track_race_thread,
                                           (void*)lock);
        if (thread == (unsigned long)-1) {
            TyErr_SetString(TyExc_RuntimeError, "can't start new thread");
            goto error;
        }
    }

    // Call tracemalloc.stop() while threads are running
    res = PyObject_CallNoArgs(stop);
    Ty_CLEAR(stop);
    if (res == NULL) {
        goto error;
    }
    Ty_DECREF(res);

    // Wait until threads complete with the GIL released
    Ty_BEGIN_ALLOW_THREADS
    for (size_t i = 0; i < NTHREAD; i++) {
        TyThread_type_lock lock = locks[i];
        TyThread_acquire_lock(lock, 1);
        TyThread_release_lock(lock);
    }
    Ty_END_ALLOW_THREADS

    // Free threads locks
    for (size_t i=0; i < NTHREAD; i++) {
        TyThread_type_lock lock = locks[i];
        TyThread_free_lock(lock);
    }
    Py_RETURN_NONE;

error:
    Ty_CLEAR(tracemalloc);
    Ty_CLEAR(stop);
    for (size_t i=0; i < NTHREAD; i++) {
        TyThread_type_lock lock = locks[i];
        if (lock) {
            TyThread_free_lock(lock);
        }
    }
    return NULL;
#undef NTHREAD
}


static TyMethodDef test_methods[] = {
    {"pymem_api_misuse",              pymem_api_misuse,              METH_NOARGS},
    {"pymem_buffer_overflow",         pymem_buffer_overflow,         METH_NOARGS},
    {"pymem_malloc_without_gil",      pymem_malloc_without_gil,      METH_NOARGS},
    {"pyobject_malloc_without_gil",   pyobject_malloc_without_gil,   METH_NOARGS},
    {"remove_mem_hooks",              remove_mem_hooks,              METH_NOARGS,
        TyDoc_STR("Remove memory hooks.")},
    {"set_nomemory",                  set_nomemory,                  METH_VARARGS,
        TyDoc_STR("set_nomemory(start:int, stop:int = 0)")},
    {"test_pymem_alloc0",             test_pymem_alloc0,             METH_NOARGS},
    {"test_pymem_setallocators",      test_pymem_setallocators,      METH_NOARGS},
    {"test_pymem_setrawallocators",   test_pymem_setrawallocators,   METH_NOARGS},
    {"test_pyobject_new",             test_pyobject_new,             METH_NOARGS},
    {"test_pyobject_setallocators",   test_pyobject_setallocators,   METH_NOARGS},

    // Tracemalloc tests
    {"tracemalloc_track",             tracemalloc_track,             METH_VARARGS},
    {"tracemalloc_untrack",           tracemalloc_untrack,           METH_VARARGS},
    {"tracemalloc_track_race", tracemalloc_track_race, METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_Mem(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    TyObject *v;
#ifdef WITH_PYMALLOC
    v = Ty_True;
#else
    v = Ty_False;
#endif
    if (TyModule_AddObjectRef(mod, "WITH_PYMALLOC", v) < 0) {
        return -1;
    }

#ifdef WITH_MIMALLOC
    v = Ty_True;
#else
    v = Ty_False;
#endif
    if (TyModule_AddObjectRef(mod, "WITH_MIMALLOC", v) < 0) {
        return -1;
    }

    return 0;
}
