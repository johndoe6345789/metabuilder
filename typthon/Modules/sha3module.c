/* SHA3 module
 *
 * This module provides an interface to the SHA3 algorithm
 *
 * See below for information about the original code this module was
 * based upon. Additional work performed by:
 *
 *  Andrew Kuchling (amk@amk.ca)
 *  Greg Stein (gstein@lyra.org)
 *  Trevor Perrin (trevp@trevp.net)
 *  Gregory P. Smith (greg@krypto.org)
 *
 * Copyright (C) 2012-2022  Christian Heimes (christian@python.org)
 * Licensed to PSF under a Contributor Agreement.
 *
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_strhex.h"        // _Ty_strhex()
#include "pycore_typeobject.h"    // _TyType_GetModuleState()
#include "hashlib.h"

#define SHA3_MAX_DIGESTSIZE 64 /* 64 Bytes (512 Bits) for 224 to 512 */

typedef struct {
    TyTypeObject *sha3_224_type;
    TyTypeObject *sha3_256_type;
    TyTypeObject *sha3_384_type;
    TyTypeObject *sha3_512_type;
    TyTypeObject *shake_128_type;
    TyTypeObject *shake_256_type;
} SHA3State;

static inline SHA3State*
sha3_get_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (SHA3State *)state;
}

/*[clinic input]
module _sha3
class _sha3.sha3_224 "SHA3object *" "&SHA3_224typ"
class _sha3.sha3_256 "SHA3object *" "&SHA3_256typ"
class _sha3.sha3_384 "SHA3object *" "&SHA3_384typ"
class _sha3.sha3_512 "SHA3object *" "&SHA3_512typ"
class _sha3.shake_128 "SHA3object *" "&SHAKE128type"
class _sha3.shake_256 "SHA3object *" "&SHAKE256type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b8a53680f370285a]*/

/* The structure for storing SHA3 info */

#include "_hacl/Hacl_Hash_SHA3.h"

typedef struct {
    PyObject_HEAD
    // Prevents undefined behavior via multiple threads entering the C API.
    bool use_mutex;
    PyMutex mutex;
    Hacl_Hash_SHA3_state_t *hash_state;
} SHA3object;

#define _SHA3object_CAST(op)    ((SHA3object *)(op))

#include "clinic/sha3module.c.h"

static SHA3object *
newSHA3object(TyTypeObject *type)
{
    SHA3object *newobj = PyObject_GC_New(SHA3object, type);
    if (newobj == NULL) {
        return NULL;
    }
    HASHLIB_INIT_MUTEX(newobj);

    PyObject_GC_Track(newobj);
    return newobj;
}

static void
sha3_update(Hacl_Hash_SHA3_state_t *state, uint8_t *buf, Ty_ssize_t len)
{
  /*
   * Note: we explicitly ignore the error code on the basis that it would
   * take more than 1 billion years to overflow the maximum admissible length
   * for SHA-3 (2^64 - 1).
   */
#if PY_SSIZE_T_MAX > UINT32_MAX
    while (len > UINT32_MAX) {
        (void)Hacl_Hash_SHA3_update(state, buf, UINT32_MAX);
        len -= UINT32_MAX;
        buf += UINT32_MAX;
    }
#endif
    /* cast to uint32_t is now safe */
    (void)Hacl_Hash_SHA3_update(state, buf, (uint32_t)len);
}

/*[clinic input]
@classmethod
_sha3.sha3_224.__new__ as py_sha3_new

    data as data_obj: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Return a new SHA3 hash object.
[clinic start generated code]*/

static TyObject *
py_sha3_new_impl(TyTypeObject *type, TyObject *data_obj, int usedforsecurity,
                 TyObject *string)
/*[clinic end generated code: output=dcec1eca20395f2a input=c106e0b4e2d67d58]*/
{
    TyObject *data;
    if (_Ty_hashlib_data_argument(&data, data_obj, string) < 0) {
        return NULL;
    }

    Ty_buffer buf = {NULL, NULL};
    SHA3State *state = _TyType_GetModuleState(type);
    SHA3object *self = newSHA3object(type);
    if (self == NULL) {
        goto error;
    }

    assert(state != NULL);

    if (type == state->sha3_224_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_SHA3_224);
    }
    else if (type == state->sha3_256_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_SHA3_256);
    }
    else if (type == state->sha3_384_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_SHA3_384);
    }
    else if (type == state->sha3_512_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_SHA3_512);
    }
    else if (type == state->shake_128_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_Shake128);
    }
    else if (type == state->shake_256_type) {
        self->hash_state = Hacl_Hash_SHA3_malloc(Spec_Hash_Definitions_Shake256);
    }
    else {
        TyErr_BadInternalCall();
        goto error;
    }

    if (self->hash_state == NULL) {
        (void)TyErr_NoMemory();
        goto error;
    }

    if (data) {
        GET_BUFFER_VIEW_OR_ERROR(data, &buf, goto error);
        if (buf.len >= HASHLIB_GIL_MINSIZE) {
            /* We do not initialize self->lock here as this is the constructor
             * where it is not yet possible to have concurrent access. */
            Ty_BEGIN_ALLOW_THREADS
            sha3_update(self->hash_state, buf.buf, buf.len);
            Ty_END_ALLOW_THREADS
        }
        else {
            sha3_update(self->hash_state, buf.buf, buf.len);
        }
    }

    PyBuffer_Release(&buf);

    return (TyObject *)self;

error:
    if (self) {
        Ty_DECREF(self);
    }
    if (data && buf.obj) {
        PyBuffer_Release(&buf);
    }
    return NULL;
}


/* Internal methods for a hash object */

static int
SHA3_clear(TyObject *op)
{
    SHA3object *self = _SHA3object_CAST(op);
    if (self->hash_state != NULL) {
        Hacl_Hash_SHA3_free(self->hash_state);
        self->hash_state = NULL;
    }
    return 0;
}

static void
SHA3_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)SHA3_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
SHA3_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

/* External methods for a hash object */


/*[clinic input]
_sha3.sha3_224.copy

Return a copy of the hash object.
[clinic start generated code]*/

static TyObject *
_sha3_sha3_224_copy_impl(SHA3object *self)
/*[clinic end generated code: output=6c537411ecdcda4c input=93a44aaebea51ba8]*/
{
    SHA3object *newobj;

    if ((newobj = newSHA3object(Ty_TYPE(self))) == NULL) {
        return NULL;
    }
    ENTER_HASHLIB(self);
    newobj->hash_state = Hacl_Hash_SHA3_copy(self->hash_state);
    LEAVE_HASHLIB(self);
    if (newobj->hash_state == NULL) {
        Ty_DECREF(newobj);
        return TyErr_NoMemory();
    }
    return (TyObject *)newobj;
}


/*[clinic input]
_sha3.sha3_224.digest

Return the digest value as a bytes object.
[clinic start generated code]*/

static TyObject *
_sha3_sha3_224_digest_impl(SHA3object *self)
/*[clinic end generated code: output=fd531842e20b2d5b input=5b2a659536bbd248]*/
{
    unsigned char digest[SHA3_MAX_DIGESTSIZE];
    // This function errors out if the algorithm is SHAKE. Here, we know this
    // not to be the case, and therefore do not perform error checking.
    ENTER_HASHLIB(self);
    (void)Hacl_Hash_SHA3_digest(self->hash_state, digest);
    LEAVE_HASHLIB(self);
    return TyBytes_FromStringAndSize((const char *)digest,
        Hacl_Hash_SHA3_hash_len(self->hash_state));
}


/*[clinic input]
_sha3.sha3_224.hexdigest

Return the digest value as a string of hexadecimal digits.
[clinic start generated code]*/

static TyObject *
_sha3_sha3_224_hexdigest_impl(SHA3object *self)
/*[clinic end generated code: output=75ad03257906918d input=2d91bb6e0d114ee3]*/
{
    unsigned char digest[SHA3_MAX_DIGESTSIZE];
    ENTER_HASHLIB(self);
    (void)Hacl_Hash_SHA3_digest(self->hash_state, digest);
    LEAVE_HASHLIB(self);
    return _Ty_strhex((const char *)digest,
        Hacl_Hash_SHA3_hash_len(self->hash_state));
}


/*[clinic input]
_sha3.sha3_224.update

    data: object
    /

Update this hash object's state with the provided bytes-like object.
[clinic start generated code]*/

static TyObject *
_sha3_sha3_224_update_impl(SHA3object *self, TyObject *data)
/*[clinic end generated code: output=390b7abf7c9795a5 input=a887f54dcc4ae227]*/
{
    Ty_buffer buf;

    GET_BUFFER_VIEW_OR_ERROUT(data, &buf);

    if (!self->use_mutex && buf.len >= HASHLIB_GIL_MINSIZE) {
        self->use_mutex = true;
    }
    if (self->use_mutex) {
        Ty_BEGIN_ALLOW_THREADS
        PyMutex_Lock(&self->mutex);
        sha3_update(self->hash_state, buf.buf, buf.len);
        PyMutex_Unlock(&self->mutex);
        Ty_END_ALLOW_THREADS
    } else {
        sha3_update(self->hash_state, buf.buf, buf.len);
    }

    PyBuffer_Release(&buf);
    Py_RETURN_NONE;
}


static TyMethodDef SHA3_methods[] = {
    _SHA3_SHA3_224_COPY_METHODDEF
    _SHA3_SHA3_224_DIGEST_METHODDEF
    _SHA3_SHA3_224_HEXDIGEST_METHODDEF
    _SHA3_SHA3_224_UPDATE_METHODDEF
    {NULL,        NULL}         /* sentinel */
};


static TyObject *
SHA3_get_block_size(TyObject *op, void *Py_UNUSED(closure))
{
    SHA3object *self = _SHA3object_CAST(op);
    uint32_t rate = Hacl_Hash_SHA3_block_len(self->hash_state);
    return TyLong_FromLong(rate);
}


static TyObject *
SHA3_get_name(TyObject *self, void *Py_UNUSED(closure))
{
    TyTypeObject *type = Ty_TYPE(self);

    SHA3State *state = _TyType_GetModuleState(type);
    assert(state != NULL);

    if (type == state->sha3_224_type) {
        return TyUnicode_FromString("sha3_224");
    } else if (type == state->sha3_256_type) {
        return TyUnicode_FromString("sha3_256");
    } else if (type == state->sha3_384_type) {
        return TyUnicode_FromString("sha3_384");
    } else if (type == state->sha3_512_type) {
        return TyUnicode_FromString("sha3_512");
    } else if (type == state->shake_128_type) {
        return TyUnicode_FromString("shake_128");
    } else if (type == state->shake_256_type) {
        return TyUnicode_FromString("shake_256");
    } else {
        TyErr_BadInternalCall();
        return NULL;
    }
}


static TyObject *
SHA3_get_digest_size(TyObject *op, void *Py_UNUSED(closure))
{
    // Preserving previous behavior: variable-length algorithms return 0
    SHA3object *self = _SHA3object_CAST(op);
    if (Hacl_Hash_SHA3_is_shake(self->hash_state))
      return TyLong_FromLong(0);
    else
      return TyLong_FromLong(Hacl_Hash_SHA3_hash_len(self->hash_state));
}


static TyObject *
SHA3_get_capacity_bits(TyObject *op, void *Py_UNUSED(closure))
{
    SHA3object *self = _SHA3object_CAST(op);
    uint32_t rate = Hacl_Hash_SHA3_block_len(self->hash_state) * 8;
    assert(rate <= 1600);
    int capacity = 1600 - rate;
    return TyLong_FromLong(capacity);
}


static TyObject *
SHA3_get_rate_bits(TyObject *op, void *Py_UNUSED(closure))
{
    SHA3object *self = _SHA3object_CAST(op);
    uint32_t rate = Hacl_Hash_SHA3_block_len(self->hash_state) * 8;
    return TyLong_FromLong(rate);
}

static TyObject *
SHA3_get_suffix(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    unsigned char suffix[2] = {0x06, 0};
    return TyBytes_FromStringAndSize((const char *)suffix, 1);
}

static TyGetSetDef SHA3_getseters[] = {
    {"block_size", SHA3_get_block_size, NULL, NULL, NULL},
    {"name", SHA3_get_name, NULL, NULL, NULL},
    {"digest_size", SHA3_get_digest_size, NULL, NULL, NULL},
    {"_capacity_bits", SHA3_get_capacity_bits, NULL, NULL, NULL},
    {"_rate_bits", SHA3_get_rate_bits, NULL, NULL, NULL},
    {"_suffix", SHA3_get_suffix, NULL, NULL, NULL},
    {NULL}  /* Sentinel */
};

#define SHA3_TYPE_SLOTS(type_slots_obj, type_doc, type_methods, type_getseters) \
    static TyType_Slot type_slots_obj[] = { \
        {Ty_tp_clear, SHA3_clear}, \
        {Ty_tp_dealloc, SHA3_dealloc}, \
        {Ty_tp_traverse, SHA3_traverse}, \
        {Ty_tp_doc, (char*)type_doc}, \
        {Ty_tp_methods, type_methods}, \
        {Ty_tp_getset, type_getseters}, \
        {Ty_tp_new, py_sha3_new}, \
        {0, NULL} \
    }

// Using _TyType_GetModuleState() on these types is safe since they
// cannot be subclassed: it does not have the Ty_TPFLAGS_BASETYPE flag.
#define SHA3_TYPE_SPEC(type_spec_obj, type_name, type_slots) \
    static TyType_Spec type_spec_obj = { \
        .name = "_sha3." type_name, \
        .basicsize = sizeof(SHA3object), \
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE \
                 | Ty_TPFLAGS_HAVE_GC, \
        .slots = type_slots \
    }

TyDoc_STRVAR(sha3_224__doc__,
"sha3_224([data], *, usedforsecurity=True) -> SHA3 object\n\
\n\
Return a new SHA3 hash object with a hashbit length of 28 bytes.");

TyDoc_STRVAR(sha3_256__doc__,
"sha3_256([data], *, usedforsecurity=True) -> SHA3 object\n\
\n\
Return a new SHA3 hash object with a hashbit length of 32 bytes.");

TyDoc_STRVAR(sha3_384__doc__,
"sha3_384([data], *, usedforsecurity=True) -> SHA3 object\n\
\n\
Return a new SHA3 hash object with a hashbit length of 48 bytes.");

TyDoc_STRVAR(sha3_512__doc__,
"sha3_512([data], *, usedforsecurity=True) -> SHA3 object\n\
\n\
Return a new SHA3 hash object with a hashbit length of 64 bytes.");

SHA3_TYPE_SLOTS(sha3_224_slots, sha3_224__doc__, SHA3_methods, SHA3_getseters);
SHA3_TYPE_SPEC(sha3_224_spec, "sha3_224", sha3_224_slots);

SHA3_TYPE_SLOTS(sha3_256_slots, sha3_256__doc__, SHA3_methods, SHA3_getseters);
SHA3_TYPE_SPEC(sha3_256_spec, "sha3_256", sha3_256_slots);

SHA3_TYPE_SLOTS(sha3_384_slots, sha3_384__doc__, SHA3_methods, SHA3_getseters);
SHA3_TYPE_SPEC(sha3_384_spec, "sha3_384", sha3_384_slots);

SHA3_TYPE_SLOTS(sha3_512_slots, sha3_512__doc__, SHA3_methods, SHA3_getseters);
SHA3_TYPE_SPEC(sha3_512_spec, "sha3_512", sha3_512_slots);

static TyObject *
_SHAKE_digest(TyObject *op, unsigned long digestlen, int hex)
{
    unsigned char *digest = NULL;
    TyObject *result = NULL;
    SHA3object *self = _SHA3object_CAST(op);

    if (digestlen >= (1 << 29)) {
        TyErr_SetString(TyExc_ValueError, "length is too large");
        return NULL;
    }
    digest = (unsigned char*)TyMem_Malloc(digestlen);
    if (digest == NULL) {
        return TyErr_NoMemory();
    }

    /* Get the raw (binary) digest value. The HACL functions errors out if:
     * - the algorithm is not shake -- not the case here
     * - the output length is zero -- we follow the existing behavior and return
     *   an empty digest, without raising an error */
    if (digestlen > 0) {
        (void)Hacl_Hash_SHA3_squeeze(self->hash_state, digest, digestlen);
    }
    if (hex) {
        result = _Ty_strhex((const char *)digest, digestlen);
    }
    else {
        result = TyBytes_FromStringAndSize((const char *)digest, digestlen);
    }
    TyMem_Free(digest);
    return result;
}


/*[clinic input]
_sha3.shake_128.digest

    length: unsigned_long

Return the digest value as a bytes object.
[clinic start generated code]*/

static TyObject *
_sha3_shake_128_digest_impl(SHA3object *self, unsigned long length)
/*[clinic end generated code: output=2313605e2f87bb8f input=93d6d6ff32904f18]*/
{
    return _SHAKE_digest((TyObject *)self, length, 0);
}


/*[clinic input]
_sha3.shake_128.hexdigest

    length: unsigned_long

Return the digest value as a string of hexadecimal digits.
[clinic start generated code]*/

static TyObject *
_sha3_shake_128_hexdigest_impl(SHA3object *self, unsigned long length)
/*[clinic end generated code: output=bf8e2f1e490944a8 input=562d74e7060b56ab]*/
{
    return _SHAKE_digest((TyObject *)self, length, 1);
}

static TyObject *
SHAKE_get_digest_size(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyLong_FromLong(0);
}

static TyObject *
SHAKE_get_suffix(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    unsigned char suffix[2] = {0x1f, 0};
    return TyBytes_FromStringAndSize((const char *)suffix, 1);
}


static TyGetSetDef SHAKE_getseters[] = {
    {"block_size", SHA3_get_block_size, NULL, NULL, NULL},
    {"name", SHA3_get_name, NULL, NULL, NULL},
    {"digest_size", SHAKE_get_digest_size, NULL, NULL, NULL},
    {"_capacity_bits", SHA3_get_capacity_bits, NULL, NULL, NULL},
    {"_rate_bits", SHA3_get_rate_bits, NULL, NULL, NULL},
    {"_suffix", SHAKE_get_suffix, NULL, NULL, NULL},
    {NULL}  /* Sentinel */
};


static TyMethodDef SHAKE_methods[] = {
    _SHA3_SHA3_224_COPY_METHODDEF
    _SHA3_SHAKE_128_DIGEST_METHODDEF
    _SHA3_SHAKE_128_HEXDIGEST_METHODDEF
    _SHA3_SHA3_224_UPDATE_METHODDEF
    {NULL,        NULL}         /* sentinel */
};

TyDoc_STRVAR(shake_128__doc__,
"shake_128([data], *, usedforsecurity=True) -> SHAKE object\n\
\n\
Return a new SHAKE hash object.");

TyDoc_STRVAR(shake_256__doc__,
"shake_256([data], *, usedforsecurity=True) -> SHAKE object\n\
\n\
Return a new SHAKE hash object.");

SHA3_TYPE_SLOTS(SHAKE128slots, shake_128__doc__, SHAKE_methods, SHAKE_getseters);
SHA3_TYPE_SPEC(SHAKE128_spec, "shake_128", SHAKE128slots);

SHA3_TYPE_SLOTS(SHAKE256slots, shake_256__doc__, SHAKE_methods, SHAKE_getseters);
SHA3_TYPE_SPEC(SHAKE256_spec, "shake_256", SHAKE256slots);


static int
_sha3_traverse(TyObject *module, visitproc visit, void *arg)
{
    SHA3State *state = sha3_get_state(module);
    Ty_VISIT(state->sha3_224_type);
    Ty_VISIT(state->sha3_256_type);
    Ty_VISIT(state->sha3_384_type);
    Ty_VISIT(state->sha3_512_type);
    Ty_VISIT(state->shake_128_type);
    Ty_VISIT(state->shake_256_type);
    return 0;
}

static int
_sha3_clear(TyObject *module)
{
    SHA3State *state = sha3_get_state(module);
    Ty_CLEAR(state->sha3_224_type);
    Ty_CLEAR(state->sha3_256_type);
    Ty_CLEAR(state->sha3_384_type);
    Ty_CLEAR(state->sha3_512_type);
    Ty_CLEAR(state->shake_128_type);
    Ty_CLEAR(state->shake_256_type);
    return 0;
}

static void
_sha3_free(void *module)
{
    (void)_sha3_clear((TyObject *)module);
}

static int
_sha3_exec(TyObject *m)
{
    SHA3State *st = sha3_get_state(m);

#define init_sha3type(type, typespec)                           \
    do {                                                        \
        st->type = (TyTypeObject *)TyType_FromModuleAndSpec(    \
            m, &typespec, NULL);                                \
        if (st->type == NULL) {                                 \
            return -1;                                          \
        }                                                       \
        if (TyModule_AddType(m, st->type) < 0) {                \
            return -1;                                          \
        }                                                       \
    } while(0)

    init_sha3type(sha3_224_type, sha3_224_spec);
    init_sha3type(sha3_256_type, sha3_256_spec);
    init_sha3type(sha3_384_type, sha3_384_spec);
    init_sha3type(sha3_512_type, sha3_512_spec);
    init_sha3type(shake_128_type, SHAKE128_spec);
    init_sha3type(shake_256_type, SHAKE256_spec);
#undef init_sha3type

    if (TyModule_AddStringConstant(m, "implementation", "HACL") < 0) {
        return -1;
    }
    if (TyModule_AddIntConstant(m, "_GIL_MINSIZE", HASHLIB_GIL_MINSIZE) < 0) {
        return -1;
    }

    return 0;
}

static PyModuleDef_Slot _sha3_slots[] = {
    {Ty_mod_exec, _sha3_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

/* Initialize this module. */
static struct TyModuleDef _sha3module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_sha3",
    .m_size = sizeof(SHA3State),
    .m_slots = _sha3_slots,
    .m_traverse = _sha3_traverse,
    .m_clear = _sha3_clear,
    .m_free = _sha3_free,
};


PyMODINIT_FUNC
PyInit__sha3(void)
{
    return PyModuleDef_Init(&_sha3module);
}
