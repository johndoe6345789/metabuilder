/* Function object interface */

#ifndef Ty_LIMITED_API
#ifndef Ty_FUNCOBJECT_H
#define Ty_FUNCOBJECT_H
#ifdef __cplusplus
extern "C" {
#endif


#define _Ty_COMMON_FIELDS(PREFIX) \
    TyObject *PREFIX ## globals; \
    TyObject *PREFIX ## builtins; \
    TyObject *PREFIX ## name; \
    TyObject *PREFIX ## qualname; \
    TyObject *PREFIX ## code;        /* A code object, the __code__ attribute */ \
    TyObject *PREFIX ## defaults;    /* NULL or a tuple */ \
    TyObject *PREFIX ## kwdefaults;  /* NULL or a dict */ \
    TyObject *PREFIX ## closure;     /* NULL or a tuple of cell objects */

typedef struct {
    _Ty_COMMON_FIELDS(fc_)
} PyFrameConstructor;

/* Function objects and code objects should not be confused with each other:
 *
 * Function objects are created by the execution of the 'def' statement.
 * They reference a code object in their __code__ attribute, which is a
 * purely syntactic object, i.e. nothing more than a compiled version of some
 * source code lines.  There is one code object per source code "fragment",
 * but each code object can be referenced by zero or many function objects
 * depending only on how many times the 'def' statement in the source was
 * executed so far.
 */

typedef struct {
    PyObject_HEAD
    _Ty_COMMON_FIELDS(func_)
    TyObject *func_doc;         /* The __doc__ attribute, can be anything */
    TyObject *func_dict;        /* The __dict__ attribute, a dict or NULL */
    TyObject *func_weakreflist; /* List of weak references */
    TyObject *func_module;      /* The __module__ attribute, can be anything */
    TyObject *func_annotations; /* Annotations, a dict or NULL */
    TyObject *func_annotate;    /* Callable to fill the annotations dictionary */
    TyObject *func_typeparams;  /* Tuple of active type variables or NULL */
    vectorcallfunc vectorcall;
    /* Version number for use by specializer.
     * Can set to non-zero when we want to specialize.
     * Will be set to zero if any of these change:
     *     defaults
     *     kwdefaults (only if the object changes, not the contents of the dict)
     *     code
     *     annotations
     *     vectorcall function pointer */
    uint32_t func_version;

    /* Invariant:
     *     func_closure contains the bindings for func_code->co_freevars, so
     *     TyTuple_Size(func_closure) == TyCode_GetNumFree(func_code)
     *     (func_closure may be NULL if TyCode_GetNumFree(func_code) == 0).
     */
} PyFunctionObject;

#undef _Ty_COMMON_FIELDS

PyAPI_DATA(TyTypeObject) TyFunction_Type;

#define TyFunction_Check(op) Ty_IS_TYPE((op), &TyFunction_Type)

PyAPI_FUNC(TyObject *) TyFunction_New(TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_NewWithQualName(TyObject *, TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetCode(TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetGlobals(TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetModule(TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetDefaults(TyObject *);
PyAPI_FUNC(int) TyFunction_SetDefaults(TyObject *, TyObject *);
PyAPI_FUNC(void) TyFunction_SetVectorcall(PyFunctionObject *, vectorcallfunc);
PyAPI_FUNC(TyObject *) TyFunction_GetKwDefaults(TyObject *);
PyAPI_FUNC(int) TyFunction_SetKwDefaults(TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetClosure(TyObject *);
PyAPI_FUNC(int) TyFunction_SetClosure(TyObject *, TyObject *);
PyAPI_FUNC(TyObject *) TyFunction_GetAnnotations(TyObject *);
PyAPI_FUNC(int) TyFunction_SetAnnotations(TyObject *, TyObject *);

#define _TyFunction_CAST(func) \
    (assert(TyFunction_Check(func)), _Py_CAST(PyFunctionObject*, func))

/* Static inline functions for direct access to these values.
   Type checks are *not* done, so use with care. */
static inline TyObject* TyFunction_GET_CODE(TyObject *func) {
    return _TyFunction_CAST(func)->func_code;
}
#define TyFunction_GET_CODE(func) TyFunction_GET_CODE(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_GLOBALS(TyObject *func) {
    return _TyFunction_CAST(func)->func_globals;
}
#define TyFunction_GET_GLOBALS(func) TyFunction_GET_GLOBALS(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_MODULE(TyObject *func) {
    return _TyFunction_CAST(func)->func_module;
}
#define TyFunction_GET_MODULE(func) TyFunction_GET_MODULE(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_DEFAULTS(TyObject *func) {
    return _TyFunction_CAST(func)->func_defaults;
}
#define TyFunction_GET_DEFAULTS(func) TyFunction_GET_DEFAULTS(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_KW_DEFAULTS(TyObject *func) {
    return _TyFunction_CAST(func)->func_kwdefaults;
}
#define TyFunction_GET_KW_DEFAULTS(func) TyFunction_GET_KW_DEFAULTS(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_CLOSURE(TyObject *func) {
    return _TyFunction_CAST(func)->func_closure;
}
#define TyFunction_GET_CLOSURE(func) TyFunction_GET_CLOSURE(_TyObject_CAST(func))

static inline TyObject* TyFunction_GET_ANNOTATIONS(TyObject *func) {
    return _TyFunction_CAST(func)->func_annotations;
}
#define TyFunction_GET_ANNOTATIONS(func) TyFunction_GET_ANNOTATIONS(_TyObject_CAST(func))

/* The classmethod and staticmethod types lives here, too */
PyAPI_DATA(TyTypeObject) TyClassMethod_Type;
PyAPI_DATA(TyTypeObject) TyStaticMethod_Type;

PyAPI_FUNC(TyObject *) TyClassMethod_New(TyObject *);
PyAPI_FUNC(TyObject *) TyStaticMethod_New(TyObject *);

#define PY_FOREACH_FUNC_EVENT(V) \
    V(CREATE)                    \
    V(DESTROY)                   \
    V(MODIFY_CODE)               \
    V(MODIFY_DEFAULTS)           \
    V(MODIFY_KWDEFAULTS)

typedef enum {
    #define PY_DEF_EVENT(EVENT) TyFunction_EVENT_##EVENT,
    PY_FOREACH_FUNC_EVENT(PY_DEF_EVENT)
    #undef PY_DEF_EVENT
} TyFunction_WatchEvent;

/*
 * A callback that is invoked for different events in a function's lifecycle.
 *
 * The callback is invoked with a borrowed reference to func, after it is
 * created and before it is modified or destroyed. The callback should not
 * modify func.
 *
 * When a function's code object, defaults, or kwdefaults are modified the
 * callback will be invoked with the respective event and new_value will
 * contain a borrowed reference to the new value that is about to be stored in
 * the function. Otherwise the third argument is NULL.
 *
 * If the callback returns with an exception set, it must return -1. Otherwise
 * it should return 0.
 */
typedef int (*TyFunction_WatchCallback)(
  TyFunction_WatchEvent event,
  PyFunctionObject *func,
  TyObject *new_value);

/*
 * Register a per-interpreter callback that will be invoked for function lifecycle
 * events.
 *
 * Returns a handle that may be passed to TyFunction_ClearWatcher on success,
 * or -1 and sets an error if no more handles are available.
 */
PyAPI_FUNC(int) TyFunction_AddWatcher(TyFunction_WatchCallback callback);

/*
 * Clear the watcher associated with the watcher_id handle.
 *
 * Returns 0 on success or -1 if no watcher exists for the supplied id.
 */
PyAPI_FUNC(int) TyFunction_ClearWatcher(int watcher_id);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_FUNCOBJECT_H */
#endif /* Ty_LIMITED_API */
