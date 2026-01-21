#ifndef Ty_SSL_H
#define Ty_SSL_H

/* OpenSSL header files */
#include "openssl/evp.h"
#include "openssl/x509.h"

/*
 * ssl module state
 */
typedef struct {
    /* Types */
    TyTypeObject *PySSLContext_Type;
    TyTypeObject *PySSLSocket_Type;
    TyTypeObject *PySSLMemoryBIO_Type;
    TyTypeObject *PySSLSession_Type;
    TyTypeObject *PySSLCertificate_Type;
    /* SSL error object */
    TyObject *PySSLErrorObject;
    TyObject *PySSLCertVerificationErrorObject;
    TyObject *PySSLZeroReturnErrorObject;
    TyObject *PySSLWantReadErrorObject;
    TyObject *PySSLWantWriteErrorObject;
    TyObject *PySSLSyscallErrorObject;
    TyObject *PySSLEOFErrorObject;
    /* Error mappings */
    TyObject *err_codes_to_names;
    TyObject *lib_codes_to_names;
    /* socket type from module CAPI */
    TyTypeObject *Sock_Type;
    /* Interned strings */
    TyObject *str_library;
    TyObject *str_reason;
    TyObject *str_verify_code;
    TyObject *str_verify_message;
    /* keylog lock */
    TyThread_type_lock keylog_lock;
} _sslmodulestate;

static struct TyModuleDef _sslmodule_def;

Ty_LOCAL_INLINE(_sslmodulestate*)
get_ssl_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (_sslmodulestate *)state;
}

#define get_state_type(type) \
    (get_ssl_state(TyType_GetModuleByDef(type, &_sslmodule_def)))
#define get_state_ctx(c) (((PySSLContext *)(c))->state)
#define get_state_sock(s) (((PySSLSocket *)(s))->ctx->state)
#define get_state_obj(o) ((_sslmodulestate *)TyType_GetModuleState(Ty_TYPE(o)))
#define get_state_mbio(b) get_state_obj(b)
#define get_state_cert(c) get_state_obj(c)

/* ************************************************************************
 * certificate
 */

enum py_ssl_encoding {
    PY_SSL_ENCODING_PEM=X509_FILETYPE_PEM,
    PY_SSL_ENCODING_DER=X509_FILETYPE_ASN1,
    PY_SSL_ENCODING_PEM_AUX=X509_FILETYPE_PEM + 0x100,
};

typedef struct {
    PyObject_HEAD
    X509 *cert;
    Ty_hash_t hash;
} PySSLCertificate;

/* ************************************************************************
 * helpers and utils
 */
static TyObject *_PySSL_BytesFromBIO(_sslmodulestate *state, BIO *bio);
static TyObject *_PySSL_UnicodeFromBIO(_sslmodulestate *state, BIO *bio, const char *error);

#endif /* Ty_SSL_H */
