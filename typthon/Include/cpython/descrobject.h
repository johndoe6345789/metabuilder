#ifndef Ty_CPYTHON_DESCROBJECT_H
#  error "this header file must not be included directly"
#endif

typedef TyObject *(*wrapperfunc)(TyObject *self, TyObject *args,
                                 void *wrapped);

typedef TyObject *(*wrapperfunc_kwds)(TyObject *self, TyObject *args,
                                      void *wrapped, TyObject *kwds);

struct wrapperbase {
    const char *name;
    int offset;
    void *function;
    wrapperfunc wrapper;
    const char *doc;
    int flags;
    TyObject *name_strobj;
};

/* Flags for above struct */
#define PyWrapperFlag_KEYWORDS 1 /* wrapper function takes keyword args */

/* Various kinds of descriptor objects */

typedef struct {
    PyObject_HEAD
    TyTypeObject *d_type;
    TyObject *d_name;
    TyObject *d_qualname;
} PyDescrObject;

#define PyDescr_COMMON PyDescrObject d_common

#define PyDescr_TYPE(x) (((PyDescrObject *)(x))->d_type)
#define PyDescr_NAME(x) (((PyDescrObject *)(x))->d_name)

typedef struct {
    PyDescr_COMMON;
    TyMethodDef *d_method;
    vectorcallfunc vectorcall;
} PyMethodDescrObject;

typedef struct {
    PyDescr_COMMON;
    TyMemberDef *d_member;
} PyMemberDescrObject;

typedef struct {
    PyDescr_COMMON;
    TyGetSetDef *d_getset;
} PyGetSetDescrObject;

typedef struct {
    PyDescr_COMMON;
    struct wrapperbase *d_base;
    void *d_wrapped; /* This can be any function pointer */
} PyWrapperDescrObject;

PyAPI_FUNC(TyObject *) PyDescr_NewWrapper(TyTypeObject *,
                                                struct wrapperbase *, void *);
PyAPI_FUNC(int) PyDescr_IsData(TyObject *);
