#include "Python.h"
#include "../_ssl.h"

#include "openssl/bio.h"

/* BIO_s_mem() to PyBytes
 */
static TyObject *
_PySSL_BytesFromBIO(_sslmodulestate *state, BIO *bio)
{
    long size;
    char *data = NULL;
    size = BIO_get_mem_data(bio, &data);
    if (data == NULL || size < 0) {
        TyErr_SetString(TyExc_ValueError, "Not a memory BIO");
        return NULL;
    }
    return TyBytes_FromStringAndSize(data, size);
}

/* BIO_s_mem() to PyUnicode
 */
static TyObject *
_PySSL_UnicodeFromBIO(_sslmodulestate *state, BIO *bio, const char *error)
{
    long size;
    char *data = NULL;
    size = BIO_get_mem_data(bio, &data);
    if (data == NULL || size < 0) {
        TyErr_SetString(TyExc_ValueError, "Not a memory BIO");
        return NULL;
    }
    return TyUnicode_DecodeUTF8(data, size, error);
}
