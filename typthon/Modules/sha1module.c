/* SHA1 module */

/* This module provides an interface to the SHA1 algorithm */

/* See below for information about the original code this module was
   based upon. Additional work performed by:

   Andrew Kuchling (amk@amk.ca)
   Greg Stein (gstein@lyra.org)
   Trevor Perrin (trevp@trevp.net)

   Copyright (C) 2005-2007   Gregory P. Smith (greg@krypto.org)
   Licensed to PSF under a Contributor Agreement.

*/

/* SHA1 objects */
#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "hashlib.h"
#include "pycore_strhex.h"        // _Ty_strhex()
#include "pycore_typeobject.h"    // _TyType_GetModuleState()

/*[clinic input]
module _sha1
class SHA1Type "SHA1object *" "&TyType_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=3dc9a20d1becb759]*/

/* The SHA1 block size and message digest sizes, in bytes */

#define SHA1_BLOCKSIZE    64
#define SHA1_DIGESTSIZE   20

#include "_hacl/Hacl_Hash_SHA1.h"

typedef struct {
    PyObject_HEAD
    // Prevents undefined behavior via multiple threads entering the C API.
    bool use_mutex;
    PyMutex mutex;
    TyThread_type_lock lock;
    Hacl_Hash_SHA1_state_t *hash_state;
} SHA1object;

#define _SHA1object_CAST(op)    ((SHA1object *)(op))

#include "clinic/sha1module.c.h"


typedef struct {
    TyTypeObject* sha1_type;
} SHA1State;

static inline SHA1State*
sha1_get_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (SHA1State *)state;
}

static SHA1object *
newSHA1object(SHA1State *st)
{
    SHA1object *sha = PyObject_GC_New(SHA1object, st->sha1_type);
    if (sha == NULL) {
        return NULL;
    }
    HASHLIB_INIT_MUTEX(sha);

    PyObject_GC_Track(sha);
    return sha;
}


/* Internal methods for a hash object */
static int
SHA1_traverse(TyObject *ptr, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(ptr));
    return 0;
}

static void
SHA1_dealloc(TyObject *op)
{
    SHA1object *ptr = _SHA1object_CAST(op);
    if (ptr->hash_state != NULL) {
        Hacl_Hash_SHA1_free(ptr->hash_state);
        ptr->hash_state = NULL;
    }
    TyTypeObject *tp = Ty_TYPE(ptr);
    PyObject_GC_UnTrack(ptr);
    PyObject_GC_Del(ptr);
    Ty_DECREF(tp);
}


/* External methods for a hash object */

/*[clinic input]
SHA1Type.copy

    cls: defining_class

Return a copy of the hash object.
[clinic start generated code]*/

static TyObject *
SHA1Type_copy_impl(SHA1object *self, TyTypeObject *cls)
/*[clinic end generated code: output=b32d4461ce8bc7a7 input=6c22e66fcc34c58e]*/
{
    SHA1State *st = _TyType_GetModuleState(cls);

    SHA1object *newobj;
    if ((newobj = newSHA1object(st)) == NULL) {
        return NULL;
    }

    ENTER_HASHLIB(self);
    newobj->hash_state = Hacl_Hash_SHA1_copy(self->hash_state);
    LEAVE_HASHLIB(self);
    if (newobj->hash_state == NULL) {
        Ty_DECREF(newobj);
        return TyErr_NoMemory();
    }
    return (TyObject *)newobj;
}

/*[clinic input]
SHA1Type.digest

Return the digest value as a bytes object.
[clinic start generated code]*/

static TyObject *
SHA1Type_digest_impl(SHA1object *self)
/*[clinic end generated code: output=2f05302a7aa2b5cb input=13824b35407444bd]*/
{
    unsigned char digest[SHA1_DIGESTSIZE];
    ENTER_HASHLIB(self);
    Hacl_Hash_SHA1_digest(self->hash_state, digest);
    LEAVE_HASHLIB(self);
    return TyBytes_FromStringAndSize((const char *)digest, SHA1_DIGESTSIZE);
}

/*[clinic input]
SHA1Type.hexdigest

Return the digest value as a string of hexadecimal digits.
[clinic start generated code]*/

static TyObject *
SHA1Type_hexdigest_impl(SHA1object *self)
/*[clinic end generated code: output=4161fd71e68c6659 input=97691055c0c74ab0]*/
{
    unsigned char digest[SHA1_DIGESTSIZE];
    ENTER_HASHLIB(self);
    Hacl_Hash_SHA1_digest(self->hash_state, digest);
    LEAVE_HASHLIB(self);
    return _Ty_strhex((const char *)digest, SHA1_DIGESTSIZE);
}

static void
update(Hacl_Hash_SHA1_state_t *state, uint8_t *buf, Ty_ssize_t len)
{
    /*
     * Note: we explicitly ignore the error code on the basis that it would
     * take more than 1 billion years to overflow the maximum admissible length
     * for SHA-1 (2^61 - 1).
     */
#if PY_SSIZE_T_MAX > UINT32_MAX
    while (len > UINT32_MAX) {
        (void)Hacl_Hash_SHA1_update(state, buf, UINT32_MAX);
        len -= UINT32_MAX;
        buf += UINT32_MAX;
    }
#endif
    /* cast to uint32_t is now safe */
    (void)Hacl_Hash_SHA1_update(state, buf, (uint32_t)len);
}

/*[clinic input]
SHA1Type.update

    obj: object
    /

Update this hash object's state with the provided string.
[clinic start generated code]*/

static TyObject *
SHA1Type_update_impl(SHA1object *self, TyObject *obj)
/*[clinic end generated code: output=cdc8e0e106dbec5f input=aad8e07812edbba3]*/
{
    Ty_buffer buf;

    GET_BUFFER_VIEW_OR_ERROUT(obj, &buf);

    if (!self->use_mutex && buf.len >= HASHLIB_GIL_MINSIZE) {
        self->use_mutex = true;
    }
    if (self->use_mutex) {
        Ty_BEGIN_ALLOW_THREADS
        PyMutex_Lock(&self->mutex);
        update(self->hash_state, buf.buf, buf.len);
        PyMutex_Unlock(&self->mutex);
        Ty_END_ALLOW_THREADS
    } else {
        update(self->hash_state, buf.buf, buf.len);
    }

    PyBuffer_Release(&buf);
    Py_RETURN_NONE;
}

static TyMethodDef SHA1_methods[] = {
    SHA1TYPE_COPY_METHODDEF
    SHA1TYPE_DIGEST_METHODDEF
    SHA1TYPE_HEXDIGEST_METHODDEF
    SHA1TYPE_UPDATE_METHODDEF
    {NULL,        NULL}         /* sentinel */
};

static TyObject *
SHA1_get_block_size(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyLong_FromLong(SHA1_BLOCKSIZE);
}

static TyObject *
SHA1_get_name(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyUnicode_FromStringAndSize("sha1", 4);
}

static TyObject *
sha1_get_digest_size(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyLong_FromLong(SHA1_DIGESTSIZE);
}

static TyGetSetDef SHA1_getseters[] = {
    {"block_size", SHA1_get_block_size, NULL, NULL, NULL},
    {"name", SHA1_get_name, NULL, NULL, NULL},
    {"digest_size", sha1_get_digest_size, NULL, NULL, NULL},
    {NULL}  /* Sentinel */
};

static TyType_Slot sha1_type_slots[] = {
    {Ty_tp_dealloc, SHA1_dealloc},
    {Ty_tp_methods, SHA1_methods},
    {Ty_tp_getset, SHA1_getseters},
    {Ty_tp_traverse, SHA1_traverse},
    {0,0}
};

static TyType_Spec sha1_type_spec = {
    .name = "_sha1.sha1",
    .basicsize =  sizeof(SHA1object),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_GC),
    .slots = sha1_type_slots
};

/* The single module-level function: new() */

/*[clinic input]
_sha1.sha1

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string as string_obj: object(c_default="NULL") = None

Return a new SHA1 hash object; optionally initialized with a string.
[clinic start generated code]*/

static TyObject *
_sha1_sha1_impl(TyObject *module, TyObject *data, int usedforsecurity,
                TyObject *string_obj)
/*[clinic end generated code: output=0d453775924f88a7 input=807f25264e0ac656]*/
{
    SHA1object *new;
    Ty_buffer buf;
    TyObject *string;
    if (_Ty_hashlib_data_argument(&string, data, string_obj) < 0) {
        return NULL;
    }

    if (string) {
        GET_BUFFER_VIEW_OR_ERROUT(string, &buf);
    }

    SHA1State *st = sha1_get_state(module);
    if ((new = newSHA1object(st)) == NULL) {
        if (string) {
            PyBuffer_Release(&buf);
        }
        return NULL;
    }

    new->hash_state = Hacl_Hash_SHA1_malloc();

    if (new->hash_state == NULL) {
        Ty_DECREF(new);
        if (string) {
            PyBuffer_Release(&buf);
        }
        return TyErr_NoMemory();
    }
    if (string) {
        if (buf.len >= HASHLIB_GIL_MINSIZE) {
            /* We do not initialize self->lock here as this is the constructor
             * where it is not yet possible to have concurrent access. */
            Ty_BEGIN_ALLOW_THREADS
            update(new->hash_state, buf.buf, buf.len);
            Ty_END_ALLOW_THREADS
        }
        else {
            update(new->hash_state, buf.buf, buf.len);
        }
        PyBuffer_Release(&buf);
    }

    return (TyObject *)new;
}


/* List of functions exported by this module */

static struct TyMethodDef SHA1_functions[] = {
    _SHA1_SHA1_METHODDEF
    {NULL,      NULL}            /* Sentinel */
};

static int
_sha1_traverse(TyObject *module, visitproc visit, void *arg)
{
    SHA1State *state = sha1_get_state(module);
    Ty_VISIT(state->sha1_type);
    return 0;
}

static int
_sha1_clear(TyObject *module)
{
    SHA1State *state = sha1_get_state(module);
    Ty_CLEAR(state->sha1_type);
    return 0;
}

static void
_sha1_free(void *module)
{
    (void)_sha1_clear((TyObject *)module);
}

static int
_sha1_exec(TyObject *module)
{
    SHA1State* st = sha1_get_state(module);

    st->sha1_type = (TyTypeObject *)TyType_FromModuleAndSpec(
        module, &sha1_type_spec, NULL);
    if (TyModule_AddObjectRef(module,
                              "SHA1Type",
                              (TyObject *)st->sha1_type) < 0)
    {
        return -1;
    }
    if (TyModule_AddIntConstant(module,
                                "_GIL_MINSIZE",
                                HASHLIB_GIL_MINSIZE) < 0)
    {
        return -1;
    }

    return 0;
}


/* Initialize this module. */

static PyModuleDef_Slot _sha1_slots[] = {
    {Ty_mod_exec, _sha1_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _sha1module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_sha1",
    .m_size = sizeof(SHA1State),
    .m_methods = SHA1_functions,
    .m_slots = _sha1_slots,
    .m_traverse = _sha1_traverse,
    .m_clear = _sha1_clear,
    .m_free = _sha1_free
};

PyMODINIT_FUNC
PyInit__sha1(void)
{
    return PyModuleDef_Init(&_sha1module);
}
