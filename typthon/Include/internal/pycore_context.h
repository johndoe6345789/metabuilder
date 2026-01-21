#ifndef Ty_INTERNAL_CONTEXT_H
#define Ty_INTERNAL_CONTEXT_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_structs.h"

extern TyTypeObject _PyContextTokenMissing_Type;

/* runtime lifecycle */

TyStatus _TyContext_Init(TyInterpreterState *);


/* other API */

typedef struct {
    PyObject_HEAD
} _PyContextTokenMissing;

struct _pycontextobject {
    PyObject_HEAD
    PyContext *ctx_prev;
    PyHamtObject *ctx_vars;
    TyObject *ctx_weakreflist;
    int ctx_entered;
};


struct _pycontextvarobject {
    PyObject_HEAD
    TyObject *var_name;
    TyObject *var_default;
#ifndef Ty_GIL_DISABLED
    TyObject *var_cached;
    uint64_t var_cached_tsid;
    uint64_t var_cached_tsver;
#endif
    Ty_hash_t var_hash;
};


struct _pycontexttokenobject {
    PyObject_HEAD
    PyContext *tok_ctx;
    PyContextVar *tok_var;
    TyObject *tok_oldval;
    int tok_used;
};


// _testinternalcapi.hamt() used by tests.
// Export for '_testcapi' shared extension
PyAPI_FUNC(TyObject*) _TyContext_NewHamtForTests(void);


#endif /* !Ty_INTERNAL_CONTEXT_H */
