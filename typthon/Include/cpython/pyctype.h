#ifndef Ty_LIMITED_API
#ifndef PYCTYPE_H
#define PYCTYPE_H
#ifdef __cplusplus
extern "C" {
#endif

#define PY_CTF_LOWER  0x01
#define PY_CTF_UPPER  0x02
#define PY_CTF_ALPHA  (PY_CTF_LOWER|PY_CTF_UPPER)
#define PY_CTF_DIGIT  0x04
#define PY_CTF_ALNUM  (PY_CTF_ALPHA|PY_CTF_DIGIT)
#define PY_CTF_SPACE  0x08
#define PY_CTF_XDIGIT 0x10

PyAPI_DATA(const unsigned int) _Ty_ctype_table[256];

/* Unlike their C counterparts, the following macros are not meant to
 * handle an int with any of the values [EOF, 0-UCHAR_MAX]. The argument
 * must be a signed/unsigned char. */
#define Ty_ISLOWER(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_LOWER)
#define Ty_ISUPPER(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_UPPER)
#define Ty_ISALPHA(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_ALPHA)
#define Ty_ISDIGIT(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_DIGIT)
#define Ty_ISXDIGIT(c) (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_XDIGIT)
#define Ty_ISALNUM(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_ALNUM)
#define Ty_ISSPACE(c)  (_Ty_ctype_table[Ty_CHARMASK(c)] & PY_CTF_SPACE)

PyAPI_DATA(const unsigned char) _Ty_ctype_tolower[256];
PyAPI_DATA(const unsigned char) _Ty_ctype_toupper[256];

#define Ty_TOLOWER(c) (_Ty_ctype_tolower[Ty_CHARMASK(c)])
#define Ty_TOUPPER(c) (_Ty_ctype_toupper[Ty_CHARMASK(c)])

#ifdef __cplusplus
}
#endif
#endif /* !PYCTYPE_H */
#endif /* !Ty_LIMITED_API */
