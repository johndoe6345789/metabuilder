#include "Python.h"
#include "../_ssl.h"

#include "openssl/err.h"
#include "openssl/bio.h"
#include "openssl/pem.h"
#include "openssl/x509.h"

/*[clinic input]
module _ssl
class _ssl.Certificate "PySSLCertificate *" "PySSLCertificate_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=780fc647948cfffc]*/

#include "clinic/cert.c.h"

static TyObject *
newCertificate(TyTypeObject *type, X509 *cert, int upref)
{
    PySSLCertificate *self;

    assert(type != NULL && type->tp_alloc != NULL);
    assert(cert != NULL);

    self = (PySSLCertificate *) type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    if (upref == 1) {
        X509_up_ref(cert);
    }
    self->cert = cert;
    self->hash = -1;

    return (TyObject *) self;
}

static TyObject *
_PySSL_CertificateFromX509(_sslmodulestate *state, X509 *cert, int upref)
{
    return newCertificate(state->PySSLCertificate_Type, cert, upref);
}

static TyObject*
_PySSL_CertificateFromX509Stack(_sslmodulestate *state, STACK_OF(X509) *stack, int upref)
{
    int len, i;
    TyObject *result = NULL;

    len = sk_X509_num(stack);
    result = TyList_New(len);
    if (result == NULL) {
        return NULL;
    }
    for (i = 0; i < len; i++) {
        X509 *cert = sk_X509_value(stack, i);
        TyObject *ocert = _PySSL_CertificateFromX509(state, cert, upref);
        if (ocert == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
        TyList_SetItem(result, i, ocert);
    }
    return result;
}

/*[clinic input]
_ssl.Certificate.public_bytes
    format: int(c_default="PY_SSL_ENCODING_PEM") = Encoding.PEM

[clinic start generated code]*/

static TyObject *
_ssl_Certificate_public_bytes_impl(PySSLCertificate *self, int format)
/*[clinic end generated code: output=c01ddbb697429e12 input=4d38c45e874b0e64]*/
{
    BIO *bio;
    int retcode;
    TyObject *result;
    _sslmodulestate *state = get_state_cert(self);

    bio = BIO_new(BIO_s_mem());
    if (bio == NULL) {
        TyErr_SetString(state->PySSLErrorObject,
                        "failed to allocate BIO");
        return NULL;
    }
    switch(format) {
    case PY_SSL_ENCODING_PEM:
        retcode = PEM_write_bio_X509(bio, self->cert);
        break;
    case PY_SSL_ENCODING_PEM_AUX:
        retcode = PEM_write_bio_X509_AUX(bio, self->cert);
        break;
    case PY_SSL_ENCODING_DER:
        retcode = i2d_X509_bio(bio, self->cert);
        break;
    default:
        TyErr_SetString(TyExc_ValueError, "Unsupported format");
        BIO_free(bio);
        return NULL;
    }
    if (retcode != 1) {
        BIO_free(bio);
        _setSSLError(state, NULL, 0, __FILE__, __LINE__);
        return NULL;
    }
    if (format == PY_SSL_ENCODING_DER) {
        result = _PySSL_BytesFromBIO(state, bio);
    } else {
        result = _PySSL_UnicodeFromBIO(state, bio, "error");
    }
    BIO_free(bio);
    return result;
}


/*[clinic input]
_ssl.Certificate.get_info

[clinic start generated code]*/

static TyObject *
_ssl_Certificate_get_info_impl(PySSLCertificate *self)
/*[clinic end generated code: output=0f0deaac54f4408b input=ba2c1694b39d0778]*/
{
    return _decode_certificate(get_state_cert(self), self->cert);
}

static TyObject*
_x509name_print(_sslmodulestate *state, X509_NAME *name, int indent, unsigned long flags)
{
    TyObject *res;
    BIO *biobuf;

    biobuf = BIO_new(BIO_s_mem());
    if (biobuf == NULL) {
        TyErr_SetString(TyExc_MemoryError, "failed to allocate BIO");
        return NULL;
    }

    if (X509_NAME_print_ex(biobuf, name, indent, flags) <= 0) {
        _setSSLError(state, NULL, 0, __FILE__, __LINE__);
        BIO_free(biobuf);
        return NULL;
    }
    res = _PySSL_UnicodeFromBIO(state, biobuf, "strict");
    BIO_free(biobuf);
    return res;
}

/* ************************************************************************
 * PySSLCertificate_Type
 */

#define PySSLCertificate_CAST(op)   ((PySSLCertificate *)(op))

static TyObject *
certificate_repr(TyObject *op)
{
    TyObject *osubject, *result;
    PySSLCertificate *self = PySSLCertificate_CAST(op);

    /* subject string is ASCII encoded, UTF-8 chars are quoted */
    osubject = _x509name_print(
        get_state_cert(self),
        X509_get_subject_name(self->cert),
        0,
        XN_FLAG_RFC2253
    );
    if (osubject == NULL)
        return NULL;
    result = TyUnicode_FromFormat(
        "<%s '%U'>",
        Ty_TYPE(self)->tp_name, osubject
    );
    Ty_DECREF(osubject);
    return result;
}

static Ty_hash_t
certificate_hash(TyObject *op)
{
    PySSLCertificate *self = PySSLCertificate_CAST(op);
    if (self->hash == (Ty_hash_t)-1) {
        unsigned long hash;
        hash = X509_subject_name_hash(self->cert);
        if ((Ty_hash_t)hash == (Ty_hash_t)-1) {
            self->hash = -2;
        } else {
            self->hash = (Ty_hash_t)hash;
        }
    }
    return self->hash;
}

static TyObject *
certificate_richcompare(TyObject *lhs, TyObject *rhs, int op)
{
    int cmp;
    PySSLCertificate *self = PySSLCertificate_CAST(lhs);
    _sslmodulestate *state = get_state_cert(self);

    if (Ty_TYPE(rhs) != state->PySSLCertificate_Type) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    /* only support == and != */
    if ((op != Py_EQ) && (op != Py_NE)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    cmp = X509_cmp(self->cert, ((PySSLCertificate*)rhs)->cert);
    if (((op == Py_EQ) && (cmp == 0)) || ((op == Py_NE) && (cmp != 0))) {
        Py_RETURN_TRUE;
    } else {
        Py_RETURN_FALSE;
    }
}

static void
certificate_dealloc(TyObject *op)
{
    PySSLCertificate *self = PySSLCertificate_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    X509_free(self->cert);
    (void)Ty_TYPE(self)->tp_free(self);
    Ty_DECREF(tp);
}

static TyMethodDef certificate_methods[] = {
    /* methods */
    _SSL_CERTIFICATE_PUBLIC_BYTES_METHODDEF
    _SSL_CERTIFICATE_GET_INFO_METHODDEF
    {NULL, NULL}
};

static TyType_Slot PySSLCertificate_slots[] = {
    {Ty_tp_dealloc, certificate_dealloc},
    {Ty_tp_repr, certificate_repr},
    {Ty_tp_hash, certificate_hash},
    {Ty_tp_richcompare, certificate_richcompare},
    {Ty_tp_methods, certificate_methods},
    {0, 0},
};

static TyType_Spec PySSLCertificate_spec = {
    "_ssl.Certificate",
    sizeof(PySSLCertificate),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION | Ty_TPFLAGS_IMMUTABLETYPE,
    PySSLCertificate_slots,
};
