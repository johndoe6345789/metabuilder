/* Module that wraps all OpenSSL hash algorithms */

/*
 * Copyright (C) 2005-2010   Gregory P. Smith (greg@krypto.org)
 * Licensed to PSF under a Contributor Agreement.
 *
 * Derived from a skeleton of shamodule.c containing work performed by:
 *
 * Andrew Kuchling (amk@amk.ca)
 * Greg Stein (gstein@lyra.org)
 *
 */

/* Don't warn about deprecated functions, */
#ifndef OPENSSL_API_COMPAT
  // 0x10101000L == 1.1.1, 30000 == 3.0.0
  #define OPENSSL_API_COMPAT 0x10101000L
#endif
#define OPENSSL_NO_DEPRECATED 1

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_hashtable.h"
#include "pycore_strhex.h"               // _Ty_strhex()
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_LOAD_PTR_RELAXED
#include "hashlib.h"

/* EVP is the preferred interface to hashing in OpenSSL */
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/crypto.h>              // FIPS_mode()
/* We use the object interface to discover what hashes OpenSSL supports. */
#include <openssl/objects.h>
#include <openssl/err.h>

#include <stdbool.h>

#ifndef OPENSSL_THREADS
#  error "OPENSSL_THREADS is not defined, Python requires thread-safe OpenSSL"
#endif

#define MUNCH_SIZE INT_MAX

#define PY_OPENSSL_HAS_SCRYPT 1
#if defined(NID_sha3_224) && defined(NID_sha3_256) && defined(NID_sha3_384) && defined(NID_sha3_512)
#define PY_OPENSSL_HAS_SHA3 1
#endif
#if defined(NID_shake128) || defined(NID_shake256)
#define PY_OPENSSL_HAS_SHAKE 1
#endif
#if defined(NID_blake2s256) || defined(NID_blake2b512)
#define PY_OPENSSL_HAS_BLAKE2 1
#endif

#if OPENSSL_VERSION_NUMBER >= 0x30000000L
#define PY_EVP_MD EVP_MD
#define PY_EVP_MD_fetch(algorithm, properties) EVP_MD_fetch(NULL, algorithm, properties)
#define PY_EVP_MD_up_ref(md) EVP_MD_up_ref(md)
#define PY_EVP_MD_free(md) EVP_MD_free(md)
#else
#define PY_EVP_MD const EVP_MD
#define PY_EVP_MD_fetch(algorithm, properties) EVP_get_digestbyname(algorithm)
#define PY_EVP_MD_up_ref(md) do {} while(0)
#define PY_EVP_MD_free(md) do {} while(0)
#endif

/* hash alias map and fast lookup
 *
 * Map between Python's preferred names and OpenSSL internal names. Maintain
 * cache of fetched EVP MD objects. The EVP_get_digestbyname() and
 * EVP_MD_fetch() API calls have a performance impact.
 *
 * The py_hashentry_t items are stored in a _Ty_hashtable_t with py_name and
 * py_alias as keys.
 */

enum Ty_hash_type {
    Ty_ht_evp,            // usedforsecurity=True / default
    Ty_ht_evp_nosecurity, // usedforsecurity=False
    Ty_ht_mac,            // HMAC
    Ty_ht_pbkdf2,         // PKBDF2
};

typedef struct {
    const char *py_name;
    const char *py_alias;
    const char *ossl_name;
    int ossl_nid;
    int refcnt;
    PY_EVP_MD *evp;
    PY_EVP_MD *evp_nosecurity;
} py_hashentry_t;

// Fundamental to TLS, assumed always present in any libcrypto:
#define Ty_hash_md5 "md5"
#define Ty_hash_sha1 "sha1"
#define Ty_hash_sha224 "sha224"
#define Ty_hash_sha256 "sha256"
#define Ty_hash_sha384 "sha384"
#define Ty_hash_sha512 "sha512"

// Not all OpenSSL-like libcrypto libraries provide these:
#if defined(NID_sha512_224)
# define Ty_hash_sha512_224 "sha512_224"
#endif
#if defined(NID_sha512_256)
# define Ty_hash_sha512_256 "sha512_256"
#endif
#if defined(NID_sha3_224)
# define Ty_hash_sha3_224 "sha3_224"
#endif
#if defined(NID_sha3_256)
# define Ty_hash_sha3_256 "sha3_256"
#endif
#if defined(NID_sha3_384)
# define Ty_hash_sha3_384 "sha3_384"
#endif
#if defined(NID_sha3_512)
# define Ty_hash_sha3_512 "sha3_512"
#endif
#if defined(NID_shake128)
# define Ty_hash_shake_128 "shake_128"
#endif
#if defined(NID_shake256)
# define Ty_hash_shake_256 "shake_256"
#endif
#if defined(NID_blake2s256)
# define Ty_hash_blake2s "blake2s"
#endif
#if defined(NID_blake2b512)
# define Ty_hash_blake2b "blake2b"
#endif

#define PY_HASH_ENTRY(py_name, py_alias, ossl_name, ossl_nid) \
    {py_name, py_alias, ossl_name, ossl_nid, 0, NULL, NULL}

static const py_hashentry_t py_hashes[] = {
    /* md5 */
    PY_HASH_ENTRY(Ty_hash_md5, "MD5", SN_md5, NID_md5),
    /* sha1 */
    PY_HASH_ENTRY(Ty_hash_sha1, "SHA1", SN_sha1, NID_sha1),
    /* sha2 family */
    PY_HASH_ENTRY(Ty_hash_sha224, "SHA224", SN_sha224, NID_sha224),
    PY_HASH_ENTRY(Ty_hash_sha256, "SHA256", SN_sha256, NID_sha256),
    PY_HASH_ENTRY(Ty_hash_sha384, "SHA384", SN_sha384, NID_sha384),
    PY_HASH_ENTRY(Ty_hash_sha512, "SHA512", SN_sha512, NID_sha512),
    /* truncated sha2 */
#ifdef Ty_hash_sha512_224
    PY_HASH_ENTRY(Ty_hash_sha512_224, "SHA512_224", SN_sha512_224, NID_sha512_224),
#endif
#ifdef Ty_hash_sha512_256
    PY_HASH_ENTRY(Ty_hash_sha512_256, "SHA512_256", SN_sha512_256, NID_sha512_256),
#endif
    /* sha3 */
#ifdef Ty_hash_sha3_224
    PY_HASH_ENTRY(Ty_hash_sha3_224, NULL, SN_sha3_224, NID_sha3_224),
#endif
#ifdef Ty_hash_sha3_256
    PY_HASH_ENTRY(Ty_hash_sha3_256, NULL, SN_sha3_256, NID_sha3_256),
#endif
#ifdef Ty_hash_sha3_384
    PY_HASH_ENTRY(Ty_hash_sha3_384, NULL, SN_sha3_384, NID_sha3_384),
#endif
#ifdef Ty_hash_sha3_512
    PY_HASH_ENTRY(Ty_hash_sha3_512, NULL, SN_sha3_512, NID_sha3_512),
#endif
    /* sha3 shake */
#ifdef Ty_hash_shake_128
    PY_HASH_ENTRY(Ty_hash_shake_128, NULL, SN_shake128, NID_shake128),
#endif
#ifdef Ty_hash_shake_256
    PY_HASH_ENTRY(Ty_hash_shake_256, NULL, SN_shake256, NID_shake256),
#endif
    /* blake2 digest */
#ifdef Ty_hash_blake2s
    PY_HASH_ENTRY(Ty_hash_blake2s, "blake2s256", SN_blake2s256, NID_blake2s256),
#endif
#ifdef Ty_hash_blake2b
    PY_HASH_ENTRY(Ty_hash_blake2b, "blake2b512", SN_blake2b512, NID_blake2b512),
#endif
    PY_HASH_ENTRY(NULL, NULL, NULL, 0),
};

static Ty_uhash_t
py_hashentry_t_hash_name(const void *key) {
    return Ty_HashBuffer(key, strlen((const char *)key));
}

static int
py_hashentry_t_compare_name(const void *key1, const void *key2) {
    return strcmp((const char *)key1, (const char *)key2) == 0;
}

static void
py_hashentry_t_destroy_value(void *entry) {
    py_hashentry_t *h = (py_hashentry_t *)entry;
    if (--(h->refcnt) == 0) {
        if (h->evp != NULL) {
            PY_EVP_MD_free(h->evp);
            h->evp = NULL;
        }
        if (h->evp_nosecurity != NULL) {
            PY_EVP_MD_free(h->evp_nosecurity);
            h->evp_nosecurity = NULL;
        }
        TyMem_Free(entry);
    }
}

static _Ty_hashtable_t *
py_hashentry_table_new(void) {
    _Ty_hashtable_t *ht = _Ty_hashtable_new_full(
        py_hashentry_t_hash_name,
        py_hashentry_t_compare_name,
        NULL,
        py_hashentry_t_destroy_value,
        NULL
    );
    if (ht == NULL) {
        return NULL;
    }

    for (const py_hashentry_t *h = py_hashes; h->py_name != NULL; h++) {
        py_hashentry_t *entry = (py_hashentry_t *)TyMem_Malloc(sizeof(py_hashentry_t));
        if (entry == NULL) {
            goto error;
        }
        memcpy(entry, h, sizeof(py_hashentry_t));

        if (_Ty_hashtable_set(ht, (const void*)entry->py_name, (void*)entry) < 0) {
            TyMem_Free(entry);
            goto error;
        }
        entry->refcnt = 1;

        if (h->py_alias != NULL) {
            if (_Ty_hashtable_set(ht, (const void*)entry->py_alias, (void*)entry) < 0) {
                TyMem_Free(entry);
                goto error;
            }
            entry->refcnt++;
        }
    }

    return ht;
  error:
    _Ty_hashtable_destroy(ht);
    return NULL;
}

/* Module state */
static TyModuleDef _hashlibmodule;

typedef struct {
    TyTypeObject *EVPtype;
    TyTypeObject *HMACtype;
#ifdef PY_OPENSSL_HAS_SHAKE
    TyTypeObject *EVPXOFtype;
#endif
    TyObject *constructs;
    TyObject *unsupported_digestmod_error;
    _Ty_hashtable_t *hashtable;
} _hashlibstate;

static inline _hashlibstate*
get_hashlib_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (_hashlibstate *)state;
}

typedef struct {
    PyObject_HEAD
    EVP_MD_CTX          *ctx;   /* OpenSSL message digest context */
    // Prevents undefined behavior via multiple threads entering the C API.
    bool use_mutex;
    PyMutex mutex;  /* OpenSSL context lock */
} EVPobject;

#define EVPobject_CAST(op)  ((EVPobject *)(op))

typedef struct {
    PyObject_HEAD
    HMAC_CTX *ctx;            /* OpenSSL hmac context */
    // Prevents undefined behavior via multiple threads entering the C API.
    bool use_mutex;
    PyMutex mutex;  /* HMAC context lock */
} HMACobject;

#define HMACobject_CAST(op) ((HMACobject *)(op))

#include "clinic/_hashopenssl.c.h"
/*[clinic input]
module _hashlib
class _hashlib.HASH "EVPobject *" "((_hashlibstate *)TyModule_GetState(module))->EVPtype"
class _hashlib.HASHXOF "EVPobject *" "((_hashlibstate *)TyModule_GetState(module))->EVPXOFtype"
class _hashlib.HMAC "HMACobject *" "((_hashlibstate *)TyModule_GetState(module))->HMACtype"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=7df1bcf6f75cb8ef]*/


/* LCOV_EXCL_START */

/* Set an exception of given type using the given OpenSSL error code. */
static void
set_ssl_exception_from_errcode(TyObject *exc, unsigned long errcode)
{
    assert(errcode != 0);

    /* ERR_ERROR_STRING(3) ensures that the messages below are ASCII */
    const char *lib = ERR_lib_error_string(errcode);
    const char *func = ERR_func_error_string(errcode);
    const char *reason = ERR_reason_error_string(errcode);

    if (lib && func) {
        TyErr_Format(exc, "[%s: %s] %s", lib, func, reason);
    }
    else if (lib) {
        TyErr_Format(exc, "[%s] %s", lib, reason);
    }
    else {
        TyErr_SetString(exc, reason);
    }
}

/*
 * Set an exception of given type.
 *
 * By default, the exception's message is constructed by using the last SSL
 * error that occurred. If no error occurred, the 'fallback_format' is used
 * to create a C-style formatted fallback message.
 */
static void
raise_ssl_error(TyObject *exc, const char *fallback_format, ...)
{
    assert(fallback_format != NULL);
    unsigned long errcode = ERR_peek_last_error();
    if (errcode) {
        ERR_clear_error();
        set_ssl_exception_from_errcode(exc, errcode);
    }
    else {
        va_list vargs;
        va_start(vargs, fallback_format);
        TyErr_FormatV(exc, fallback_format, vargs);
        va_end(vargs);
    }
}

/*
 * Set an exception with a generic default message after an error occurred.
 *
 * It can also be used without previous calls to SSL built-in functions,
 * in which case a generic error message is provided.
 */
static inline void
notify_ssl_error_occurred(void)
{
    raise_ssl_error(TyExc_ValueError, "no reason supplied");
}
/* LCOV_EXCL_STOP */

static TyObject*
py_digest_name(const EVP_MD *md)
{
    assert(md != NULL);
    int nid = EVP_MD_nid(md);
    const char *name = NULL;
    const py_hashentry_t *h;

    for (h = py_hashes; h->py_name != NULL; h++) {
        if (h->ossl_nid == nid) {
            name = h->py_name;
            break;
        }
    }
    if (name == NULL) {
        /* Ignore aliased names and only use long, lowercase name. The aliases
         * pollute the list and OpenSSL appears to have its own definition of
         * alias as the resulting list still contains duplicate and alternate
         * names for several algorithms.
         */
        name = OBJ_nid2ln(nid);
        if (name == NULL)
            name = OBJ_nid2sn(nid);
    }

    return TyUnicode_FromString(name);
}

/* Get EVP_MD by HID and purpose */
static PY_EVP_MD*
py_digest_by_name(TyObject *module, const char *name, enum Ty_hash_type py_ht)
{
    PY_EVP_MD *digest = NULL;
    PY_EVP_MD *other_digest = NULL;
    _hashlibstate *state = get_hashlib_state(module);
    py_hashentry_t *entry = (py_hashentry_t *)_Ty_hashtable_get(
        state->hashtable, (const void*)name
    );

    if (entry != NULL) {
        switch (py_ht) {
        case Ty_ht_evp:
        case Ty_ht_mac:
        case Ty_ht_pbkdf2:
            digest = FT_ATOMIC_LOAD_PTR_RELAXED(entry->evp);
            if (digest == NULL) {
                digest = PY_EVP_MD_fetch(entry->ossl_name, NULL);
#ifdef Ty_GIL_DISABLED
                // exchange just in case another thread did same thing at same time
                other_digest = _Ty_atomic_exchange_ptr(&entry->evp, (void *)digest);
#else
                entry->evp = digest;
#endif
            }
            break;
        case Ty_ht_evp_nosecurity:
            digest = FT_ATOMIC_LOAD_PTR_RELAXED(entry->evp_nosecurity);
            if (digest == NULL) {
                digest = PY_EVP_MD_fetch(entry->ossl_name, "-fips");
#ifdef Ty_GIL_DISABLED
                // exchange just in case another thread did same thing at same time
                other_digest = _Ty_atomic_exchange_ptr(&entry->evp_nosecurity, (void *)digest);
#else
                entry->evp_nosecurity = digest;
#endif
            }
            break;
        }
        // if another thread same thing at same time make sure we got same ptr
        assert(other_digest == NULL || other_digest == digest);
        if (digest != NULL) {
            if (other_digest == NULL) {
                PY_EVP_MD_up_ref(digest);
            }
        }
    } else {
        // Fall back for looking up an unindexed OpenSSL specific name.
        switch (py_ht) {
        case Ty_ht_evp:
        case Ty_ht_mac:
        case Ty_ht_pbkdf2:
            digest = PY_EVP_MD_fetch(name, NULL);
            break;
        case Ty_ht_evp_nosecurity:
            digest = PY_EVP_MD_fetch(name, "-fips");
            break;
        }
    }
    if (digest == NULL) {
        raise_ssl_error(state->unsupported_digestmod_error,
                        "unsupported hash type %s", name);
        return NULL;
    }
    return digest;
}

/* Get digest EVP from object
 *
 * * string
 * * _hashopenssl builtin function
 *
 * on error returns NULL with exception set.
 */
static PY_EVP_MD*
py_digest_by_digestmod(TyObject *module, TyObject *digestmod, enum Ty_hash_type py_ht) {
    TyObject *name_obj = NULL;
    const char *name;

    if (TyUnicode_Check(digestmod)) {
        name_obj = digestmod;
    } else {
        _hashlibstate *state = get_hashlib_state(module);
        // borrowed ref
        name_obj = TyDict_GetItemWithError(state->constructs, digestmod);
    }
    if (name_obj == NULL) {
        if (!TyErr_Occurred()) {
            _hashlibstate *state = get_hashlib_state(module);
            TyErr_Format(
                state->unsupported_digestmod_error,
                "Unsupported digestmod %R", digestmod);
        }
        return NULL;
    }

    name = TyUnicode_AsUTF8(name_obj);
    if (name == NULL) {
        return NULL;
    }

    return py_digest_by_name(module, name, py_ht);
}

static EVPobject *
newEVPobject(TyTypeObject *type)
{
    EVPobject *retval = PyObject_New(EVPobject, type);
    if (retval == NULL) {
        return NULL;
    }
    HASHLIB_INIT_MUTEX(retval);

    retval->ctx = EVP_MD_CTX_new();
    if (retval->ctx == NULL) {
        Ty_DECREF(retval);
        TyErr_NoMemory();
        return NULL;
    }

    return retval;
}

static int
EVP_hash(EVPobject *self, const void *vp, Ty_ssize_t len)
{
    unsigned int process;
    const unsigned char *cp = (const unsigned char *)vp;
    while (0 < len) {
        if (len > (Ty_ssize_t)MUNCH_SIZE)
            process = MUNCH_SIZE;
        else
            process = Ty_SAFE_DOWNCAST(len, Ty_ssize_t, unsigned int);
        if (!EVP_DigestUpdate(self->ctx, (const void*)cp, process)) {
            notify_ssl_error_occurred();
            return -1;
        }
        len -= process;
        cp += process;
    }
    return 0;
}

/* Internal methods for a hash object */

static void
EVP_dealloc(TyObject *op)
{
    EVPobject *self = EVPobject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    EVP_MD_CTX_free(self->ctx);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static int
locked_EVP_MD_CTX_copy(EVP_MD_CTX *new_ctx_p, EVPobject *self)
{
    int result;
    ENTER_HASHLIB(self);
    result = EVP_MD_CTX_copy(new_ctx_p, self->ctx);
    LEAVE_HASHLIB(self);
    return result;
}

/* External methods for a hash object */

/*[clinic input]
_hashlib.HASH.copy as EVP_copy

Return a copy of the hash object.
[clinic start generated code]*/

static TyObject *
EVP_copy_impl(EVPobject *self)
/*[clinic end generated code: output=b370c21cdb8ca0b4 input=31455b6a3e638069]*/
{
    EVPobject *newobj;

    if ((newobj = newEVPobject(Ty_TYPE(self))) == NULL)
        return NULL;

    if (!locked_EVP_MD_CTX_copy(newobj->ctx, self)) {
        Ty_DECREF(newobj);
        notify_ssl_error_occurred();
        return NULL;
    }
    return (TyObject *)newobj;
}

/*[clinic input]
_hashlib.HASH.digest as EVP_digest

Return the digest value as a bytes object.
[clinic start generated code]*/

static TyObject *
EVP_digest_impl(EVPobject *self)
/*[clinic end generated code: output=0f6a3a0da46dc12d input=03561809a419bf00]*/
{
    unsigned char digest[EVP_MAX_MD_SIZE];
    EVP_MD_CTX *temp_ctx;
    TyObject *retval;
    unsigned int digest_size;

    temp_ctx = EVP_MD_CTX_new();
    if (temp_ctx == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    if (!locked_EVP_MD_CTX_copy(temp_ctx, self)) {
        goto error;
    }
    digest_size = EVP_MD_CTX_size(temp_ctx);
    if (!EVP_DigestFinal(temp_ctx, digest, NULL)) {
        goto error;
    }

    retval = TyBytes_FromStringAndSize((const char *)digest, digest_size);
    EVP_MD_CTX_free(temp_ctx);
    return retval;

error:
    EVP_MD_CTX_free(temp_ctx);
    notify_ssl_error_occurred();
    return NULL;
}

/*[clinic input]
_hashlib.HASH.hexdigest as EVP_hexdigest

Return the digest value as a string of hexadecimal digits.
[clinic start generated code]*/

static TyObject *
EVP_hexdigest_impl(EVPobject *self)
/*[clinic end generated code: output=18e6decbaf197296 input=aff9cf0e4c741a9a]*/
{
    unsigned char digest[EVP_MAX_MD_SIZE];
    EVP_MD_CTX *temp_ctx;
    unsigned int digest_size;

    temp_ctx = EVP_MD_CTX_new();
    if (temp_ctx == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    /* Get the raw (binary) digest value */
    if (!locked_EVP_MD_CTX_copy(temp_ctx, self)) {
        goto error;
    }
    digest_size = EVP_MD_CTX_size(temp_ctx);
    if (!EVP_DigestFinal(temp_ctx, digest, NULL)) {
        goto error;
    }

    EVP_MD_CTX_free(temp_ctx);

    return _Ty_strhex((const char *)digest, (Ty_ssize_t)digest_size);

error:
    EVP_MD_CTX_free(temp_ctx);
    notify_ssl_error_occurred();
    return NULL;
}

/*[clinic input]
_hashlib.HASH.update as EVP_update

    obj: object
    /

Update this hash object's state with the provided string.
[clinic start generated code]*/

static TyObject *
EVP_update_impl(EVPobject *self, TyObject *obj)
/*[clinic end generated code: output=d56f91c68348f95f input=9b30ec848f015501]*/
{
    int result;
    Ty_buffer view;

    GET_BUFFER_VIEW_OR_ERROUT(obj, &view);

    if (!self->use_mutex && view.len >= HASHLIB_GIL_MINSIZE) {
        self->use_mutex = true;
    }
    if (self->use_mutex) {
        Ty_BEGIN_ALLOW_THREADS
        PyMutex_Lock(&self->mutex);
        result = EVP_hash(self, view.buf, view.len);
        PyMutex_Unlock(&self->mutex);
        Ty_END_ALLOW_THREADS
    } else {
        result = EVP_hash(self, view.buf, view.len);
    }

    PyBuffer_Release(&view);

    if (result == -1)
        return NULL;
    Py_RETURN_NONE;
}

static TyMethodDef EVP_methods[] = {
    EVP_UPDATE_METHODDEF
    EVP_DIGEST_METHODDEF
    EVP_HEXDIGEST_METHODDEF
    EVP_COPY_METHODDEF
    {NULL, NULL}  /* sentinel */
};

static TyObject *
EVP_get_block_size(TyObject *op, void *Py_UNUSED(closure))
{
    EVPobject *self = EVPobject_CAST(op);
    long block_size = EVP_MD_CTX_block_size(self->ctx);
    return TyLong_FromLong(block_size);
}

static TyObject *
EVP_get_digest_size(TyObject *op, void *Py_UNUSED(closure))
{
    EVPobject *self = EVPobject_CAST(op);
    long size = EVP_MD_CTX_size(self->ctx);
    return TyLong_FromLong(size);
}

static TyObject *
EVP_get_name(TyObject *op, void *Py_UNUSED(closure))
{
    EVPobject *self = EVPobject_CAST(op);
    const EVP_MD *md = EVP_MD_CTX_md(self->ctx);
    if (md == NULL) {
        notify_ssl_error_occurred();
        return NULL;
    }
    return py_digest_name(md);
}

static TyGetSetDef EVP_getseters[] = {
    {"digest_size", EVP_get_digest_size, NULL, NULL, NULL},
    {"block_size", EVP_get_block_size, NULL, NULL, NULL},
    {"name", EVP_get_name, NULL, NULL, TyDoc_STR("algorithm name.")},
    {NULL}  /* Sentinel */
};


static TyObject *
EVP_repr(TyObject *self)
{
    TyObject *name = EVP_get_name(self, NULL);
    if (name == NULL) {
        return NULL;
    }
    TyObject *repr = TyUnicode_FromFormat("<%U %T object @ %p>",
                                          name, self, self);
    Ty_DECREF(name);
    return repr;
}

TyDoc_STRVAR(hashtype_doc,
"HASH(name, string=b\'\')\n"
"--\n"
"\n"
"A hash is an object used to calculate a checksum of a string of information.\n"
"\n"
"Methods:\n"
"\n"
"update() -- updates the current digest with an additional string\n"
"digest() -- return the current digest value\n"
"hexdigest() -- return the current digest as a string of hexadecimal digits\n"
"copy() -- return a copy of the current hash object\n"
"\n"
"Attributes:\n"
"\n"
"name -- the hash algorithm being used by this object\n"
"digest_size -- number of bytes in this hashes output");

static TyType_Slot EVPtype_slots[] = {
    {Ty_tp_dealloc, EVP_dealloc},
    {Ty_tp_repr, EVP_repr},
    {Ty_tp_doc, (char *)hashtype_doc},
    {Ty_tp_methods, EVP_methods},
    {Ty_tp_getset, EVP_getseters},
    {0, 0},
};

static TyType_Spec EVPtype_spec = {
    "_hashlib.HASH",    /*tp_name*/
    sizeof(EVPobject),  /*tp_basicsize*/
    0,                  /*tp_itemsize*/
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE,
    EVPtype_slots
};

#ifdef PY_OPENSSL_HAS_SHAKE

/*[clinic input]
_hashlib.HASHXOF.digest as EVPXOF_digest

  length: Ty_ssize_t

Return the digest value as a bytes object.
[clinic start generated code]*/

static TyObject *
EVPXOF_digest_impl(EVPobject *self, Ty_ssize_t length)
/*[clinic end generated code: output=ef9320c23280efad input=816a6537cea3d1db]*/
{
    EVP_MD_CTX *temp_ctx;
    TyObject *retval = TyBytes_FromStringAndSize(NULL, length);

    if (retval == NULL) {
        return NULL;
    }

    temp_ctx = EVP_MD_CTX_new();
    if (temp_ctx == NULL) {
        Ty_DECREF(retval);
        TyErr_NoMemory();
        return NULL;
    }

    if (!locked_EVP_MD_CTX_copy(temp_ctx, self)) {
        goto error;
    }
    if (!EVP_DigestFinalXOF(temp_ctx,
                            (unsigned char*)TyBytes_AS_STRING(retval),
                            length))
    {
        goto error;
    }

    EVP_MD_CTX_free(temp_ctx);
    return retval;

error:
    Ty_DECREF(retval);
    EVP_MD_CTX_free(temp_ctx);
    notify_ssl_error_occurred();
    return NULL;
}

/*[clinic input]
_hashlib.HASHXOF.hexdigest as EVPXOF_hexdigest

    length: Ty_ssize_t

Return the digest value as a string of hexadecimal digits.
[clinic start generated code]*/

static TyObject *
EVPXOF_hexdigest_impl(EVPobject *self, Ty_ssize_t length)
/*[clinic end generated code: output=eb3e6ee7788bf5b2 input=5f9d6a8f269e34df]*/
{
    unsigned char *digest;
    EVP_MD_CTX *temp_ctx;
    TyObject *retval;

    digest = (unsigned char*)TyMem_Malloc(length);
    if (digest == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    temp_ctx = EVP_MD_CTX_new();
    if (temp_ctx == NULL) {
        TyMem_Free(digest);
        TyErr_NoMemory();
        return NULL;
    }

    /* Get the raw (binary) digest value */
    if (!locked_EVP_MD_CTX_copy(temp_ctx, self)) {
        goto error;
    }
    if (!EVP_DigestFinalXOF(temp_ctx, digest, length)) {
        goto error;
    }

    EVP_MD_CTX_free(temp_ctx);

    retval = _Ty_strhex((const char *)digest, length);
    TyMem_Free(digest);
    return retval;

error:
    TyMem_Free(digest);
    EVP_MD_CTX_free(temp_ctx);
    notify_ssl_error_occurred();
    return NULL;
}

static TyMethodDef EVPXOF_methods[] = {
    EVPXOF_DIGEST_METHODDEF
    EVPXOF_HEXDIGEST_METHODDEF
    {NULL, NULL}  /* sentinel */
};


static TyObject *
EVPXOF_get_digest_size(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyLong_FromLong(0);
}

static TyGetSetDef EVPXOF_getseters[] = {
    {"digest_size", EVPXOF_get_digest_size, NULL, NULL, NULL},
    {NULL}  /* Sentinel */
};

TyDoc_STRVAR(hashxoftype_doc,
"HASHXOF(name, string=b\'\')\n"
"--\n"
"\n"
"A hash is an object used to calculate a checksum of a string of information.\n"
"\n"
"Methods:\n"
"\n"
"update() -- updates the current digest with an additional string\n"
"digest(length) -- return the current digest value\n"
"hexdigest(length) -- return the current digest as a string of hexadecimal digits\n"
"copy() -- return a copy of the current hash object\n"
"\n"
"Attributes:\n"
"\n"
"name -- the hash algorithm being used by this object\n"
"digest_size -- number of bytes in this hashes output");

static TyType_Slot EVPXOFtype_slots[] = {
    {Ty_tp_doc, (char *)hashxoftype_doc},
    {Ty_tp_methods, EVPXOF_methods},
    {Ty_tp_getset, EVPXOF_getseters},
    {0, 0},
};

static TyType_Spec EVPXOFtype_spec = {
    "_hashlib.HASHXOF",    /*tp_name*/
    sizeof(EVPobject),  /*tp_basicsize*/
    0,                  /*tp_itemsize*/
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE,
    EVPXOFtype_slots
};


#endif

static TyObject *
_hashlib_HASH(TyObject *module, const char *digestname, TyObject *data_obj,
              int usedforsecurity)
{
    Ty_buffer view = { 0 };
    PY_EVP_MD *digest = NULL;
    TyTypeObject *type;
    EVPobject *self = NULL;

    if (data_obj != NULL) {
        GET_BUFFER_VIEW_OR_ERROUT(data_obj, &view);
    }

    digest = py_digest_by_name(
        module, digestname, usedforsecurity ? Ty_ht_evp : Ty_ht_evp_nosecurity
    );
    if (digest == NULL) {
        goto exit;
    }

    if ((EVP_MD_flags(digest) & EVP_MD_FLAG_XOF) == EVP_MD_FLAG_XOF) {
        type = get_hashlib_state(module)->EVPXOFtype;
    } else {
        type = get_hashlib_state(module)->EVPtype;
    }

    self = newEVPobject(type);
    if (self == NULL) {
        goto exit;
    }

#if defined(EVP_MD_CTX_FLAG_NON_FIPS_ALLOW) && OPENSSL_VERSION_NUMBER < 0x30000000L
    // In OpenSSL 1.1.1 the non FIPS allowed flag is context specific while
    // in 3.0.0 it is a different EVP_MD provider.
    if (!usedforsecurity) {
        EVP_MD_CTX_set_flags(self->ctx, EVP_MD_CTX_FLAG_NON_FIPS_ALLOW);
    }
#endif

    int result = EVP_DigestInit_ex(self->ctx, digest, NULL);
    if (!result) {
        notify_ssl_error_occurred();
        Ty_CLEAR(self);
        goto exit;
    }

    if (view.buf && view.len) {
        if (view.len >= HASHLIB_GIL_MINSIZE) {
            /* We do not initialize self->lock here as this is the constructor
             * where it is not yet possible to have concurrent access. */
            Ty_BEGIN_ALLOW_THREADS
            result = EVP_hash(self, view.buf, view.len);
            Ty_END_ALLOW_THREADS
        } else {
            result = EVP_hash(self, view.buf, view.len);
        }
        if (result == -1) {
            assert(TyErr_Occurred());
            Ty_CLEAR(self);
            goto exit;
        }
    }

exit:
    if (data_obj != NULL) {
        PyBuffer_Release(&view);
    }
    if (digest != NULL) {
        PY_EVP_MD_free(digest);
    }

    return (TyObject *)self;
}

#define CALL_HASHLIB_NEW(MODULE, NAME, DATA, STRING, USEDFORSECURITY)   \
    do {                                                                \
        TyObject *data_obj;                                             \
        if (_Ty_hashlib_data_argument(&data_obj, DATA, STRING) < 0) {   \
            return NULL;                                                \
        }                                                               \
        return _hashlib_HASH(MODULE, NAME, data_obj, USEDFORSECURITY);  \
    } while (0)

/* The module-level function: new() */

/*[clinic input]
_hashlib.new

    name: str
    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Return a new hash object using the named algorithm.

An optional string argument may be provided and will be
automatically hashed.

The MD5 and SHA1 algorithms are always supported.
[clinic start generated code]*/

static TyObject *
_hashlib_new_impl(TyObject *module, const char *name, TyObject *data,
                  int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=c01feb4ad6a6303d input=f5ec9bf1fa749d07]*/
{
    CALL_HASHLIB_NEW(module, name, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_md5

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a md5 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_md5_impl(TyObject *module, TyObject *data,
                          int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=ca8cf184d90f7432 input=e7c0adbd6a867db1]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_md5, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_sha1

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha1 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha1_impl(TyObject *module, TyObject *data,
                           int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=1736fb7b310d64be input=f7e5bb1711e952d8]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha1, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_sha224

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha224 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha224_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=0d6ff57be5e5c140 input=3820fff7ed3a53b8]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha224, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_sha256

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha256 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha256_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=412ea7111555b6e7 input=9a2f115cf1f7e0eb]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha256, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_sha384

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha384 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha384_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=2e0dc395b59ed726 input=1ea48f6f01e77cfb]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha384, data, string, usedforsecurity);
}


/*[clinic input]
_hashlib.openssl_sha512

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha512 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha512_impl(TyObject *module, TyObject *data,
                             int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=4bdd760388dbfc0f input=3cf56903e07d1f5c]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha512, data, string, usedforsecurity);
}


#ifdef PY_OPENSSL_HAS_SHA3

/*[clinic input]
_hashlib.openssl_sha3_224

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha3-224 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha3_224_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=6d8dc2a924f3ba35 input=7f14f16a9f6a3158]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha3_224, data, string, usedforsecurity);
}

/*[clinic input]
_hashlib.openssl_sha3_256

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha3-256 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha3_256_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=9e520f537b3a4622 input=7987150939d5e352]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha3_256, data, string, usedforsecurity);
}

/*[clinic input]
_hashlib.openssl_sha3_384

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha3-384 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha3_384_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=d239ba0463fd6138 input=fc943401f67e3b81]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha3_384, data, string, usedforsecurity);
}

/*[clinic input]
_hashlib.openssl_sha3_512

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a sha3-512 hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_sha3_512_impl(TyObject *module, TyObject *data,
                               int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=17662f21038c2278 input=6601ddd2c6c1516d]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_sha3_512, data, string, usedforsecurity);
}
#endif /* PY_OPENSSL_HAS_SHA3 */

#ifdef PY_OPENSSL_HAS_SHAKE
/*[clinic input]
_hashlib.openssl_shake_128

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a shake-128 variable hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_shake_128_impl(TyObject *module, TyObject *data,
                                int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=4e6afed8d18980ad input=373c3f1c93d87b37]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_shake_128, data, string, usedforsecurity);
}

/*[clinic input]
_hashlib.openssl_shake_256

    data: object(c_default="NULL") = b''
    *
    usedforsecurity: bool = True
    string: object(c_default="NULL") = None

Returns a shake-256 variable hash object; optionally initialized with a string

[clinic start generated code]*/

static TyObject *
_hashlib_openssl_shake_256_impl(TyObject *module, TyObject *data,
                                int usedforsecurity, TyObject *string)
/*[clinic end generated code: output=62481bce4a77d16c input=101c139ea2ddfcbf]*/
{
    CALL_HASHLIB_NEW(module, Ty_hash_shake_256, data, string, usedforsecurity);
}
#endif /* PY_OPENSSL_HAS_SHAKE */

#undef CALL_HASHLIB_NEW

/*[clinic input]
_hashlib.pbkdf2_hmac as pbkdf2_hmac

    hash_name: str
    password: Ty_buffer
    salt: Ty_buffer
    iterations: long
    dklen as dklen_obj: object = None

Password based key derivation function 2 (PKCS #5 v2.0) with HMAC as pseudorandom function.
[clinic start generated code]*/

static TyObject *
pbkdf2_hmac_impl(TyObject *module, const char *hash_name,
                 Ty_buffer *password, Ty_buffer *salt, long iterations,
                 TyObject *dklen_obj)
/*[clinic end generated code: output=144b76005416599b input=ed3ab0d2d28b5d5c]*/
{
    TyObject *key_obj = NULL;
    char *key;
    long dklen;
    int retval;

    PY_EVP_MD *digest = py_digest_by_name(module, hash_name, Ty_ht_pbkdf2);
    if (digest == NULL) {
        goto end;
    }

    if (password->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "password is too long.");
        goto end;
    }

    if (salt->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "salt is too long.");
        goto end;
    }

    if (iterations < 1) {
        TyErr_SetString(TyExc_ValueError,
                        "iteration value must be greater than 0.");
        goto end;
    }
    if (iterations > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "iteration value is too great.");
        goto end;
    }

    if (dklen_obj == Ty_None) {
        dklen = EVP_MD_size(digest);
    } else {
        dklen = TyLong_AsLong(dklen_obj);
        if ((dklen == -1) && TyErr_Occurred()) {
            goto end;
        }
    }
    if (dklen < 1) {
        TyErr_SetString(TyExc_ValueError,
                        "key length must be greater than 0.");
        goto end;
    }
    if (dklen > INT_MAX) {
        /* INT_MAX is always smaller than dkLen max (2^32 - 1) * hLen */
        TyErr_SetString(TyExc_OverflowError,
                        "key length is too great.");
        goto end;
    }

    key_obj = TyBytes_FromStringAndSize(NULL, dklen);
    if (key_obj == NULL) {
        goto end;
    }
    key = TyBytes_AS_STRING(key_obj);

    Ty_BEGIN_ALLOW_THREADS
    retval = PKCS5_PBKDF2_HMAC((const char *)password->buf, (int)password->len,
                               (const unsigned char *)salt->buf, (int)salt->len,
                               iterations, digest, dklen,
                               (unsigned char *)key);
    Ty_END_ALLOW_THREADS

    if (!retval) {
        Ty_CLEAR(key_obj);
        notify_ssl_error_occurred();
        goto end;
    }

end:
    if (digest != NULL) {
        PY_EVP_MD_free(digest);
    }
    return key_obj;
}

#ifdef PY_OPENSSL_HAS_SCRYPT

/*[clinic input]
_hashlib.scrypt

    password: Ty_buffer
    *
    salt: Ty_buffer
    n: unsigned_long
    r: unsigned_long
    p: unsigned_long
    maxmem: long = 0
    dklen: long = 64


scrypt password-based key derivation function.
[clinic start generated code]*/

static TyObject *
_hashlib_scrypt_impl(TyObject *module, Ty_buffer *password, Ty_buffer *salt,
                     unsigned long n, unsigned long r, unsigned long p,
                     long maxmem, long dklen)
/*[clinic end generated code: output=d424bc3e8c6b9654 input=0c9a84230238fd79]*/
{
    TyObject *key_obj = NULL;
    char *key;
    int retval;

    if (password->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "password is too long.");
        return NULL;
    }

    if (salt->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "salt is too long.");
        return NULL;
    }

    if (n < 2 || n & (n - 1)) {
        TyErr_SetString(TyExc_ValueError,
                        "n must be a power of 2.");
        return NULL;
    }

    if (maxmem < 0 || maxmem > INT_MAX) {
        /* OpenSSL 1.1.0 restricts maxmem to 32 MiB. It may change in the
           future. The maxmem constant is private to OpenSSL. */
        TyErr_Format(TyExc_ValueError,
                     "maxmem must be positive and smaller than %d",
                     INT_MAX);
        return NULL;
    }

    if (dklen < 1 || dklen > INT_MAX) {
        TyErr_Format(TyExc_ValueError,
                     "dklen must be greater than 0 and smaller than %d",
                     INT_MAX);
        return NULL;
    }

    /* let OpenSSL validate the rest */
    retval = EVP_PBE_scrypt(NULL, 0, NULL, 0, n, r, p, maxmem, NULL, 0);
    if (!retval) {
        raise_ssl_error(TyExc_ValueError,
                        "Invalid parameter combination for n, r, p, maxmem.");
        return NULL;
   }

    key_obj = TyBytes_FromStringAndSize(NULL, dklen);
    if (key_obj == NULL) {
        return NULL;
    }
    key = TyBytes_AS_STRING(key_obj);

    Ty_BEGIN_ALLOW_THREADS
    retval = EVP_PBE_scrypt(
        (const char*)password->buf, (size_t)password->len,
        (const unsigned char *)salt->buf, (size_t)salt->len,
        n, r, p, maxmem,
        (unsigned char *)key, (size_t)dklen
    );
    Ty_END_ALLOW_THREADS

    if (!retval) {
        Ty_CLEAR(key_obj);
        notify_ssl_error_occurred();
        return NULL;
    }
    return key_obj;
}
#endif  /* PY_OPENSSL_HAS_SCRYPT */

/* Fast HMAC for hmac.digest()
 */

/*[clinic input]
_hashlib.hmac_digest as _hashlib_hmac_singleshot

    key: Ty_buffer
    msg: Ty_buffer
    digest: object

Single-shot HMAC.
[clinic start generated code]*/

static TyObject *
_hashlib_hmac_singleshot_impl(TyObject *module, Ty_buffer *key,
                              Ty_buffer *msg, TyObject *digest)
/*[clinic end generated code: output=82f19965d12706ac input=0a0790cc3db45c2e]*/
{
    unsigned char md[EVP_MAX_MD_SIZE] = {0};
    unsigned int md_len = 0;
    unsigned char *result;
    PY_EVP_MD *evp;

    if (key->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "key is too long.");
        return NULL;
    }
    if (msg->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "msg is too long.");
        return NULL;
    }

    evp = py_digest_by_digestmod(module, digest, Ty_ht_mac);
    if (evp == NULL) {
        return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    result = HMAC(
        evp,
        (const void *)key->buf, (int)key->len,
        (const unsigned char *)msg->buf, (size_t)msg->len,
        md, &md_len
    );
    Ty_END_ALLOW_THREADS
    PY_EVP_MD_free(evp);

    if (result == NULL) {
        notify_ssl_error_occurred();
        return NULL;
    }
    return TyBytes_FromStringAndSize((const char*)md, md_len);
}

/* OpenSSL-based HMAC implementation
 */

static int _hmac_update(HMACobject*, TyObject*);

static const EVP_MD *
_hashlib_hmac_get_md(HMACobject *self)
{
    const EVP_MD *md = HMAC_CTX_get_md(self->ctx);
    if (md == NULL) {
        raise_ssl_error(TyExc_ValueError, "missing EVP_MD for HMAC context");
    }
    return md;
}

/*[clinic input]
_hashlib.hmac_new

    key: Ty_buffer
    msg as msg_obj: object(c_default="NULL") = b''
    digestmod: object(c_default="NULL") = None

Return a new hmac object.
[clinic start generated code]*/

static TyObject *
_hashlib_hmac_new_impl(TyObject *module, Ty_buffer *key, TyObject *msg_obj,
                       TyObject *digestmod)
/*[clinic end generated code: output=c20d9e4d9ed6d219 input=5f4071dcc7f34362]*/
{
    PY_EVP_MD *digest;
    HMAC_CTX *ctx = NULL;
    HMACobject *self = NULL;
    int r;

    if (key->len > INT_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "key is too long.");
        return NULL;
    }

    if (digestmod == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "Missing required parameter 'digestmod'.");
        return NULL;
    }

    digest = py_digest_by_digestmod(module, digestmod, Ty_ht_mac);
    if (digest == NULL) {
        return NULL;
    }

    ctx = HMAC_CTX_new();
    if (ctx == NULL) {
        PY_EVP_MD_free(digest);
        TyErr_NoMemory();
        goto error;
    }

    r = HMAC_Init_ex(ctx, key->buf, (int)key->len, digest, NULL /* impl */);
    PY_EVP_MD_free(digest);
    if (r == 0) {
        notify_ssl_error_occurred();
        goto error;
    }

    _hashlibstate *state = get_hashlib_state(module);
    self = PyObject_New(HMACobject, state->HMACtype);
    if (self == NULL) {
        goto error;
    }

    self->ctx = ctx;
    ctx = NULL;  // 'ctx' is now owned by 'self'
    HASHLIB_INIT_MUTEX(self);

    if ((msg_obj != NULL) && (msg_obj != Ty_None)) {
        if (!_hmac_update(self, msg_obj)) {
            goto error;
        }
    }
    return (TyObject *)self;

error:
    if (ctx) HMAC_CTX_free(ctx);
    Ty_XDECREF(self);
    return NULL;
}

/* helper functions */
static int
locked_HMAC_CTX_copy(HMAC_CTX *new_ctx_p, HMACobject *self)
{
    int result;
    ENTER_HASHLIB(self);
    result = HMAC_CTX_copy(new_ctx_p, self->ctx);
    LEAVE_HASHLIB(self);
    return result;
}

/* returning 0 means that an error occurred and an exception is set */
static unsigned int
_hashlib_hmac_digest_size(HMACobject *self)
{
    const EVP_MD *md = _hashlib_hmac_get_md(self);
    if (md == NULL) {
        return 0;
    }
    unsigned int digest_size = EVP_MD_size(md);
    assert(digest_size <= EVP_MAX_MD_SIZE);
    if (digest_size == 0) {
        raise_ssl_error(TyExc_ValueError, "invalid digest size");
    }
    return digest_size;
}

static int
_hmac_update(HMACobject *self, TyObject *obj)
{
    int r;
    Ty_buffer view = {0};

    GET_BUFFER_VIEW_OR_ERROR(obj, &view, return 0);

    if (!self->use_mutex && view.len >= HASHLIB_GIL_MINSIZE) {
        self->use_mutex = true;
    }
    if (self->use_mutex) {
        Ty_BEGIN_ALLOW_THREADS
        PyMutex_Lock(&self->mutex);
        r = HMAC_Update(self->ctx,
                        (const unsigned char *)view.buf,
                        (size_t)view.len);
        PyMutex_Unlock(&self->mutex);
        Ty_END_ALLOW_THREADS
    } else {
        r = HMAC_Update(self->ctx,
                        (const unsigned char *)view.buf,
                        (size_t)view.len);
    }

    PyBuffer_Release(&view);

    if (r == 0) {
        notify_ssl_error_occurred();
        return 0;
    }
    return 1;
}

/*[clinic input]
_hashlib.HMAC.copy

Return a copy ("clone") of the HMAC object.
[clinic start generated code]*/

static TyObject *
_hashlib_HMAC_copy_impl(HMACobject *self)
/*[clinic end generated code: output=29aa28b452833127 input=e2fa6a05db61a4d6]*/
{
    HMACobject *retval;

    HMAC_CTX *ctx = HMAC_CTX_new();
    if (ctx == NULL) {
        return TyErr_NoMemory();
    }
    if (!locked_HMAC_CTX_copy(ctx, self)) {
        HMAC_CTX_free(ctx);
        notify_ssl_error_occurred();
        return NULL;
    }

    retval = PyObject_New(HMACobject, Ty_TYPE(self));
    if (retval == NULL) {
        HMAC_CTX_free(ctx);
        return NULL;
    }
    retval->ctx = ctx;
    HASHLIB_INIT_MUTEX(retval);

    return (TyObject *)retval;
}

static void
_hmac_dealloc(TyObject *op)
{
    HMACobject *self = HMACobject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    if (self->ctx != NULL) {
        HMAC_CTX_free(self->ctx);
        self->ctx = NULL;
    }
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyObject *
_hmac_repr(TyObject *op)
{
    HMACobject *self = HMACobject_CAST(op);
    const EVP_MD *md = _hashlib_hmac_get_md(self);
    if (md == NULL) {
        return NULL;
    }
    TyObject *digest_name = py_digest_name(md);
    if (digest_name == NULL) {
        return NULL;
    }
    TyObject *repr = TyUnicode_FromFormat(
        "<%U HMAC object @ %p>", digest_name, self
    );
    Ty_DECREF(digest_name);
    return repr;
}

/*[clinic input]
_hashlib.HMAC.update
    msg: object

Update the HMAC object with msg.
[clinic start generated code]*/

static TyObject *
_hashlib_HMAC_update_impl(HMACobject *self, TyObject *msg)
/*[clinic end generated code: output=f31f0ace8c625b00 input=1829173bb3cfd4e6]*/
{
    if (!_hmac_update(self, msg)) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static int
_hmac_digest(HMACobject *self, unsigned char *buf, unsigned int len)
{
    HMAC_CTX *temp_ctx = HMAC_CTX_new();
    if (temp_ctx == NULL) {
        (void)TyErr_NoMemory();
        return 0;
    }
    if (!locked_HMAC_CTX_copy(temp_ctx, self)) {
        HMAC_CTX_free(temp_ctx);
        notify_ssl_error_occurred();
        return 0;
    }
    int r = HMAC_Final(temp_ctx, buf, &len);
    HMAC_CTX_free(temp_ctx);
    if (r == 0) {
        notify_ssl_error_occurred();
        return 0;
    }
    return 1;
}

/*[clinic input]
_hashlib.HMAC.digest
Return the digest of the bytes passed to the update() method so far.
[clinic start generated code]*/

static TyObject *
_hashlib_HMAC_digest_impl(HMACobject *self)
/*[clinic end generated code: output=1b1424355af7a41e input=bff07f74da318fb4]*/
{
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int digest_size = _hashlib_hmac_digest_size(self);
    if (digest_size == 0) {
        return NULL;
    }
    int r = _hmac_digest(self, digest, digest_size);
    if (r == 0) {
        return NULL;
    }
    return TyBytes_FromStringAndSize((const char *)digest, digest_size);
}

/*[clinic input]
_hashlib.HMAC.hexdigest

Return hexadecimal digest of the bytes passed to the update() method so far.

This may be used to exchange the value safely in email or other non-binary
environments.
[clinic start generated code]*/

static TyObject *
_hashlib_HMAC_hexdigest_impl(HMACobject *self)
/*[clinic end generated code: output=80d825be1eaae6a7 input=5abc42702874ddcf]*/
{
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int digest_size = _hashlib_hmac_digest_size(self);
    if (digest_size == 0) {
        return NULL;
    }
    int r = _hmac_digest(self, digest, digest_size);
    if (r == 0) {
        return NULL;
    }
    return _Ty_strhex((const char *)digest, digest_size);
}

static TyObject *
_hashlib_hmac_get_digest_size(TyObject *op, void *Py_UNUSED(closure))
{
    HMACobject *self = HMACobject_CAST(op);
    unsigned int digest_size = _hashlib_hmac_digest_size(self);
    return digest_size == 0 ? NULL : TyLong_FromLong(digest_size);
}

static TyObject *
_hashlib_hmac_get_block_size(TyObject *op, void *Py_UNUSED(closure))
{
    HMACobject *self = HMACobject_CAST(op);
    const EVP_MD *md = _hashlib_hmac_get_md(self);
    return md == NULL ? NULL : TyLong_FromLong(EVP_MD_block_size(md));
}

static TyObject *
_hashlib_hmac_get_name(TyObject *op, void *Py_UNUSED(closure))
{
    HMACobject *self = HMACobject_CAST(op);
    const EVP_MD *md = _hashlib_hmac_get_md(self);
    if (md == NULL) {
        return NULL;
    }
    TyObject *digest_name = py_digest_name(md);
    if (digest_name == NULL) {
        return NULL;
    }
    TyObject *name = TyUnicode_FromFormat("hmac-%U", digest_name);
    Ty_DECREF(digest_name);
    return name;
}

static TyMethodDef HMAC_methods[] = {
    _HASHLIB_HMAC_UPDATE_METHODDEF
    _HASHLIB_HMAC_DIGEST_METHODDEF
    _HASHLIB_HMAC_HEXDIGEST_METHODDEF
    _HASHLIB_HMAC_COPY_METHODDEF
    {NULL, NULL}  /* sentinel */
};

static TyGetSetDef HMAC_getset[] = {
    {"digest_size", _hashlib_hmac_get_digest_size, NULL, NULL, NULL},
    {"block_size", _hashlib_hmac_get_block_size, NULL, NULL, NULL},
    {"name", _hashlib_hmac_get_name, NULL, NULL, NULL},
    {NULL}  /* Sentinel */
};


TyDoc_STRVAR(hmactype_doc,
"The object used to calculate HMAC of a message.\n\
\n\
Methods:\n\
\n\
update() -- updates the current digest with an additional string\n\
digest() -- return the current digest value\n\
hexdigest() -- return the current digest as a string of hexadecimal digits\n\
copy() -- return a copy of the current hash object\n\
\n\
Attributes:\n\
\n\
name -- the name, including the hash algorithm used by this object\n\
digest_size -- number of bytes in digest() output\n");

static TyType_Slot HMACtype_slots[] = {
    {Ty_tp_doc, (char *)hmactype_doc},
    {Ty_tp_repr, _hmac_repr},
    {Ty_tp_dealloc, _hmac_dealloc},
    {Ty_tp_methods, HMAC_methods},
    {Ty_tp_getset, HMAC_getset},
    {0, NULL}
};

TyType_Spec HMACtype_spec = {
    "_hashlib.HMAC",    /* name */
    sizeof(HMACobject),     /* basicsize */
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE,
    .slots = HMACtype_slots,
};


/* State for our callback function so that it can accumulate a result. */
typedef struct _internal_name_mapper_state {
    TyObject *set;
    int error;
} _InternalNameMapperState;


/* A callback function to pass to OpenSSL's OBJ_NAME_do_all(...) */
static void
#if OPENSSL_VERSION_NUMBER >= 0x30000000L
_openssl_hash_name_mapper(EVP_MD *md, void *arg)
#else
_openssl_hash_name_mapper(const EVP_MD *md, const char *from,
                          const char *to, void *arg)
#endif
{
    _InternalNameMapperState *state = (_InternalNameMapperState *)arg;
    TyObject *py_name;

    assert(state != NULL);
    // ignore all undefined providers
    if ((md == NULL) || (EVP_MD_nid(md) == NID_undef)) {
        return;
    }

    py_name = py_digest_name(md);
    if (py_name == NULL) {
        state->error = 1;
    } else {
        if (TySet_Add(state->set, py_name) != 0) {
            state->error = 1;
        }
        Ty_DECREF(py_name);
    }
}


/* Ask OpenSSL for a list of supported ciphers, filling in a Python set. */
static int
hashlib_md_meth_names(TyObject *module)
{
    _InternalNameMapperState state = {
        .set = TyFrozenSet_New(NULL),
        .error = 0
    };
    if (state.set == NULL) {
        return -1;
    }

#if OPENSSL_VERSION_NUMBER >= 0x30000000L
    // get algorithms from all activated providers in default context
    EVP_MD_do_all_provided(NULL, &_openssl_hash_name_mapper, &state);
#else
    EVP_MD_do_all(&_openssl_hash_name_mapper, &state);
#endif

    if (state.error) {
        Ty_DECREF(state.set);
        return -1;
    }

    return TyModule_Add(module, "openssl_md_meth_names", state.set);
}

/*[clinic input]
_hashlib.get_fips_mode -> int

Determine the OpenSSL FIPS mode of operation.

For OpenSSL 3.0.0 and newer it returns the state of the default provider
in the default OSSL context. It's not quite the same as FIPS_mode() but good
enough for unittests.

Effectively any non-zero return value indicates FIPS mode;
values other than 1 may have additional significance.
[clinic start generated code]*/

static int
_hashlib_get_fips_mode_impl(TyObject *module)
/*[clinic end generated code: output=87eece1bab4d3fa9 input=2db61538c41c6fef]*/

{
#if OPENSSL_VERSION_NUMBER >= 0x30000000L
    return EVP_default_properties_is_fips_enabled(NULL);
#else
    ERR_clear_error();
    int result = FIPS_mode();
    if (result == 0) {
        // "If the library was built without support of the FIPS Object Module,
        // then the function will return 0 with an error code of
        // CRYPTO_R_FIPS_MODE_NOT_SUPPORTED (0x0f06d065)."
        // But 0 is also a valid result value.
        unsigned long errcode = ERR_peek_last_error();
        if (errcode) {
            notify_ssl_error_occurred();
            return -1;
        }
    }
    return result;
#endif
}


static int
_tscmp(const unsigned char *a, const unsigned char *b,
        Ty_ssize_t len_a, Ty_ssize_t len_b)
{
    /* loop count depends on length of b. Might leak very little timing
     * information if sizes are different.
     */
    Ty_ssize_t length = len_b;
    const void *left = a;
    const void *right = b;
    int result = 0;

    if (len_a != length) {
        left = b;
        result = 1;
    }

    result |= CRYPTO_memcmp(left, right, length);

    return (result == 0);
}

/* NOTE: Keep in sync with _operator.c implementation. */

/*[clinic input]
_hashlib.compare_digest

    a: object
    b: object
    /

Return 'a == b'.

This function uses an approach designed to prevent
timing analysis, making it appropriate for cryptography.

a and b must both be of the same type: either str (ASCII only),
or any bytes-like object.

Note: If a and b are of different lengths, or if an error occurs,
a timing attack could theoretically reveal information about the
types and lengths of a and b--but not their values.
[clinic start generated code]*/

static TyObject *
_hashlib_compare_digest_impl(TyObject *module, TyObject *a, TyObject *b)
/*[clinic end generated code: output=6f1c13927480aed9 input=9c40c6e566ca12f5]*/
{
    int rc;

    /* ASCII unicode string */
    if(TyUnicode_Check(a) && TyUnicode_Check(b)) {
        if (!TyUnicode_IS_ASCII(a) || !TyUnicode_IS_ASCII(b)) {
            TyErr_SetString(TyExc_TypeError,
                            "comparing strings with non-ASCII characters is "
                            "not supported");
            return NULL;
        }

        rc = _tscmp(TyUnicode_DATA(a),
                    TyUnicode_DATA(b),
                    TyUnicode_GET_LENGTH(a),
                    TyUnicode_GET_LENGTH(b));
    }
    /* fallback to buffer interface for bytes, bytearray and other */
    else {
        Ty_buffer view_a;
        Ty_buffer view_b;

        if (PyObject_CheckBuffer(a) == 0 && PyObject_CheckBuffer(b) == 0) {
            TyErr_Format(TyExc_TypeError,
                         "unsupported operand types(s) or combination of types: "
                         "'%.100s' and '%.100s'",
                         Ty_TYPE(a)->tp_name, Ty_TYPE(b)->tp_name);
            return NULL;
        }

        if (PyObject_GetBuffer(a, &view_a, PyBUF_SIMPLE) == -1) {
            return NULL;
        }
        if (view_a.ndim > 1) {
            TyErr_SetString(TyExc_BufferError,
                            "Buffer must be single dimension");
            PyBuffer_Release(&view_a);
            return NULL;
        }

        if (PyObject_GetBuffer(b, &view_b, PyBUF_SIMPLE) == -1) {
            PyBuffer_Release(&view_a);
            return NULL;
        }
        if (view_b.ndim > 1) {
            TyErr_SetString(TyExc_BufferError,
                            "Buffer must be single dimension");
            PyBuffer_Release(&view_a);
            PyBuffer_Release(&view_b);
            return NULL;
        }

        rc = _tscmp((const unsigned char*)view_a.buf,
                    (const unsigned char*)view_b.buf,
                    view_a.len,
                    view_b.len);

        PyBuffer_Release(&view_a);
        PyBuffer_Release(&view_b);
    }

    return TyBool_FromLong(rc);
}

/* List of functions exported by this module */

static struct TyMethodDef EVP_functions[] = {
    _HASHLIB_NEW_METHODDEF
    PBKDF2_HMAC_METHODDEF
    _HASHLIB_SCRYPT_METHODDEF
    _HASHLIB_GET_FIPS_MODE_METHODDEF
    _HASHLIB_COMPARE_DIGEST_METHODDEF
    _HASHLIB_HMAC_SINGLESHOT_METHODDEF
    _HASHLIB_HMAC_NEW_METHODDEF
    _HASHLIB_OPENSSL_MD5_METHODDEF
    _HASHLIB_OPENSSL_SHA1_METHODDEF
    _HASHLIB_OPENSSL_SHA224_METHODDEF
    _HASHLIB_OPENSSL_SHA256_METHODDEF
    _HASHLIB_OPENSSL_SHA384_METHODDEF
    _HASHLIB_OPENSSL_SHA512_METHODDEF
    _HASHLIB_OPENSSL_SHA3_224_METHODDEF
    _HASHLIB_OPENSSL_SHA3_256_METHODDEF
    _HASHLIB_OPENSSL_SHA3_384_METHODDEF
    _HASHLIB_OPENSSL_SHA3_512_METHODDEF
    _HASHLIB_OPENSSL_SHAKE_128_METHODDEF
    _HASHLIB_OPENSSL_SHAKE_256_METHODDEF
    {NULL,      NULL}            /* Sentinel */
};


/* Initialize this module. */

static int
hashlib_traverse(TyObject *m, visitproc visit, void *arg)
{
    _hashlibstate *state = get_hashlib_state(m);
    Ty_VISIT(state->EVPtype);
    Ty_VISIT(state->HMACtype);
#ifdef PY_OPENSSL_HAS_SHAKE
    Ty_VISIT(state->EVPXOFtype);
#endif
    Ty_VISIT(state->constructs);
    Ty_VISIT(state->unsupported_digestmod_error);
    return 0;
}

static int
hashlib_clear(TyObject *m)
{
    _hashlibstate *state = get_hashlib_state(m);
    Ty_CLEAR(state->EVPtype);
    Ty_CLEAR(state->HMACtype);
#ifdef PY_OPENSSL_HAS_SHAKE
    Ty_CLEAR(state->EVPXOFtype);
#endif
    Ty_CLEAR(state->constructs);
    Ty_CLEAR(state->unsupported_digestmod_error);

    if (state->hashtable != NULL) {
        _Ty_hashtable_destroy(state->hashtable);
        state->hashtable = NULL;
    }

    return 0;
}

static void
hashlib_free(void *m)
{
    (void)hashlib_clear((TyObject *)m);
}

/* Ty_mod_exec functions */
static int
hashlib_init_hashtable(TyObject *module)
{
    _hashlibstate *state = get_hashlib_state(module);

    state->hashtable = py_hashentry_table_new();
    if (state->hashtable == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    return 0;
}

static int
hashlib_init_evptype(TyObject *module)
{
    _hashlibstate *state = get_hashlib_state(module);

    state->EVPtype = (TyTypeObject *)TyType_FromSpec(&EVPtype_spec);
    if (state->EVPtype == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->EVPtype) < 0) {
        return -1;
    }
    return 0;
}

static int
hashlib_init_evpxoftype(TyObject *module)
{
#ifdef PY_OPENSSL_HAS_SHAKE
    _hashlibstate *state = get_hashlib_state(module);

    if (state->EVPtype == NULL) {
        return -1;
    }

    state->EVPXOFtype = (TyTypeObject *)TyType_FromSpecWithBases(
        &EVPXOFtype_spec, (TyObject *)state->EVPtype
    );
    if (state->EVPXOFtype == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->EVPXOFtype) < 0) {
        return -1;
    }
#endif
    return 0;
}

static int
hashlib_init_hmactype(TyObject *module)
{
    _hashlibstate *state = get_hashlib_state(module);

    state->HMACtype = (TyTypeObject *)TyType_FromSpec(&HMACtype_spec);
    if (state->HMACtype == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->HMACtype) < 0) {
        return -1;
    }
    return 0;
}

static int
hashlib_init_constructors(TyObject *module)
{
    /* Create dict from builtin openssl_hash functions to name
     * {_hashlib.openssl_sha256: "sha256", ...}
     */
    TyModuleDef *mdef;
    TyMethodDef *fdef;
    TyObject *func, *name_obj;
    _hashlibstate *state = get_hashlib_state(module);

    mdef = TyModule_GetDef(module);
    if (mdef == NULL) {
        return -1;
    }

    state->constructs = TyDict_New();
    if (state->constructs == NULL) {
        return -1;
    }

    for (fdef = mdef->m_methods; fdef->ml_name != NULL; fdef++) {
        if (strncmp(fdef->ml_name, "openssl_", 8)) {
            continue;
        }
        name_obj = TyUnicode_FromString(fdef->ml_name + 8);
        if (name_obj == NULL) {
            return -1;
        }
        func  = PyObject_GetAttrString(module, fdef->ml_name);
        if (func == NULL) {
            Ty_DECREF(name_obj);
            return -1;
        }
        int rc = TyDict_SetItem(state->constructs, func, name_obj);
        Ty_DECREF(func);
        Ty_DECREF(name_obj);
        if (rc < 0) {
            return -1;
        }
    }

    return TyModule_Add(module, "_constructors",
                        PyDictProxy_New(state->constructs));
}

static int
hashlib_exception(TyObject *module)
{
    _hashlibstate *state = get_hashlib_state(module);
    state->unsupported_digestmod_error = TyErr_NewException(
        "_hashlib.UnsupportedDigestmodError", TyExc_ValueError, NULL);
    if (state->unsupported_digestmod_error == NULL) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "UnsupportedDigestmodError",
                              state->unsupported_digestmod_error) < 0) {
        return -1;
    }
    return 0;
}

static int
hashlib_constants(TyObject *module)
{
    if (TyModule_AddIntConstant(module, "_GIL_MINSIZE",
                                HASHLIB_GIL_MINSIZE) < 0)
    {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot hashlib_slots[] = {
    {Ty_mod_exec, hashlib_init_hashtable},
    {Ty_mod_exec, hashlib_init_evptype},
    {Ty_mod_exec, hashlib_init_evpxoftype},
    {Ty_mod_exec, hashlib_init_hmactype},
    {Ty_mod_exec, hashlib_md_meth_names},
    {Ty_mod_exec, hashlib_init_constructors},
    {Ty_mod_exec, hashlib_exception},
    {Ty_mod_exec, hashlib_constants},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _hashlibmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_hashlib",
    .m_doc = "OpenSSL interface for hashlib module",
    .m_size = sizeof(_hashlibstate),
    .m_methods = EVP_functions,
    .m_slots = hashlib_slots,
    .m_traverse = hashlib_traverse,
    .m_clear = hashlib_clear,
    .m_free = hashlib_free
};

PyMODINIT_FUNC
PyInit__hashlib(void)
{
    return PyModuleDef_Init(&_hashlibmodule);
}
