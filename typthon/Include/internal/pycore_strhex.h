#ifndef Ty_INTERNAL_STRHEX_H
#define Ty_INTERNAL_STRHEX_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Returns a str() containing the hex representation of argbuf.
// Export for '_hashlib' shared extension.
PyAPI_FUNC(TyObject*) _Ty_strhex(const
    char* argbuf,
    const Ty_ssize_t arglen);

// Returns a bytes() containing the ASCII hex representation of argbuf.
extern TyObject* _Ty_strhex_bytes(
    const char* argbuf,
    const Ty_ssize_t arglen);

// These variants include support for a separator between every N bytes:
extern TyObject* _Ty_strhex_with_sep(
    const char* argbuf,
    const Ty_ssize_t arglen,
    TyObject* sep,
    const int bytes_per_group);

// Export for 'binascii' shared extension
PyAPI_FUNC(TyObject*) _Ty_strhex_bytes_with_sep(
    const char* argbuf,
    const Ty_ssize_t arglen,
    TyObject* sep,
    const int bytes_per_group);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_STRHEX_H */
