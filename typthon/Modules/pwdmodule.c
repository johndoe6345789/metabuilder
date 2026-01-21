
/* UNIX password file access module */

// Need limited C API version 3.13 for TyMem_RawRealloc()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#ifndef Ty_GIL_DISABLED
#  define Ty_LIMITED_API 0x030d0000
#endif

#include "Python.h"
#include "posixmodule.h"

#include <errno.h>                // ERANGE
#include <pwd.h>                  // getpwuid()
#include <unistd.h>               // sysconf()

#include "clinic/pwdmodule.c.h"
/*[clinic input]
module pwd
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=60f628ef356b97b6]*/

static TyStructSequence_Field struct_pwd_type_fields[] = {
    {"pw_name", "user name"},
    {"pw_passwd", "password"},
    {"pw_uid", "user id"},
    {"pw_gid", "group id"},
    {"pw_gecos", "real name"},
    {"pw_dir", "home directory"},
    {"pw_shell", "shell program"},
    {0}
};

TyDoc_STRVAR(struct_passwd__doc__,
"pwd.struct_passwd: Results from getpw*() routines.\n\n\
This object may be accessed either as a tuple of\n\
  (pw_name,pw_passwd,pw_uid,pw_gid,pw_gecos,pw_dir,pw_shell)\n\
or via the object attributes as named in the above tuple.");

static TyStructSequence_Desc struct_pwd_type_desc = {
    "pwd.struct_passwd",
    struct_passwd__doc__,
    struct_pwd_type_fields,
    7,
};

TyDoc_STRVAR(pwd__doc__,
"This module provides access to the Unix password database.\n\
It is available on all Unix versions.\n\
\n\
Password database entries are reported as 7-tuples containing the following\n\
items from the password database (see `<pwd.h>'), in order:\n\
pw_name, pw_passwd, pw_uid, pw_gid, pw_gecos, pw_dir, pw_shell.\n\
The uid and gid items are integers, all others are strings. An\n\
exception is raised if the entry asked for cannot be found.");


typedef struct {
    TyTypeObject *StructPwdType;
} pwdmodulestate;

static inline pwdmodulestate*
get_pwd_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (pwdmodulestate *)state;
}

static struct TyModuleDef pwdmodule;

#define DEFAULT_BUFFER_SIZE 1024

static TyObject *
mkpwent(TyObject *module, struct passwd *p)
{
    TyObject *v = TyStructSequence_New(get_pwd_state(module)->StructPwdType);
    if (v == NULL) {
        return NULL;
    }

    int setIndex = 0;

#define SET_STRING(VAL) \
    SET_RESULT((VAL) ? TyUnicode_DecodeFSDefault((VAL)) : Ty_NewRef(Ty_None))

#define SET_RESULT(CALL)                                     \
    do {                                                     \
        TyObject *item = (CALL);                             \
        if (item == NULL) {                                  \
            goto error;                                      \
        }                                                    \
        TyStructSequence_SetItem(v, setIndex++, item);       \
    } while(0)

    SET_STRING(p->pw_name);
#if defined(HAVE_STRUCT_PASSWD_PW_PASSWD) && !defined(__ANDROID__)
    SET_STRING(p->pw_passwd);
#else
    SET_STRING("");
#endif
    SET_RESULT(_TyLong_FromUid(p->pw_uid));
    SET_RESULT(_TyLong_FromGid(p->pw_gid));
#if defined(HAVE_STRUCT_PASSWD_PW_GECOS)
    SET_STRING(p->pw_gecos);
#else
    SET_STRING("");
#endif
    SET_STRING(p->pw_dir);
    SET_STRING(p->pw_shell);

#undef SET_STRING
#undef SET_RESULT

    return v;

error:
    Ty_DECREF(v);
    return NULL;
}

/*[clinic input]
pwd.getpwuid

    uidobj: object
    /

Return the password database entry for the given numeric user ID.

See `help(pwd)` for more on password database entries.
[clinic start generated code]*/

static TyObject *
pwd_getpwuid(TyObject *module, TyObject *uidobj)
/*[clinic end generated code: output=c4ee1d4d429b86c4 input=ae64d507a1c6d3e8]*/
{
    TyObject *retval = NULL;
    uid_t uid;
    int nomem = 0;
    struct passwd *p;
    char *buf = NULL, *buf2 = NULL;

    if (!_Ty_Uid_Converter(uidobj, &uid)) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError))
            TyErr_Format(TyExc_KeyError,
                         "getpwuid(): uid not found");
        return NULL;
    }
#ifdef HAVE_GETPWUID_R
    int status;
    Ty_ssize_t bufsize;
    /* Note: 'pwd' will be used via pointer 'p' on getpwuid_r success. */
    struct passwd pwd;

    Ty_BEGIN_ALLOW_THREADS
    bufsize = sysconf(_SC_GETPW_R_SIZE_MAX);
    if (bufsize == -1) {
        bufsize = DEFAULT_BUFFER_SIZE;
    }

    while(1) {
        buf2 = TyMem_RawRealloc(buf, bufsize);
        if (buf2 == NULL) {
            p = NULL;
            nomem = 1;
            break;
        }
        buf = buf2;
        status = getpwuid_r(uid, &pwd, buf, bufsize, &p);
        if (status != 0) {
            p = NULL;
        }
        if (p != NULL || status != ERANGE) {
            break;
        }
        if (bufsize > (PY_SSIZE_T_MAX >> 1)) {
            nomem = 1;
            break;
        }
        bufsize <<= 1;
    }

    Ty_END_ALLOW_THREADS
#else
    p = getpwuid(uid);
#endif
    if (p == NULL) {
        TyMem_RawFree(buf);
        if (nomem == 1) {
            return TyErr_NoMemory();
        }
        TyObject *uid_obj = _TyLong_FromUid(uid);
        if (uid_obj == NULL)
            return NULL;
        TyErr_Format(TyExc_KeyError,
                     "getpwuid(): uid not found: %S", uid_obj);
        Ty_DECREF(uid_obj);
        return NULL;
    }
    retval = mkpwent(module, p);
#ifdef HAVE_GETPWUID_R
    TyMem_RawFree(buf);
#endif
    return retval;
}

/*[clinic input]
pwd.getpwnam

    name: unicode
    /

Return the password database entry for the given user name.

See `help(pwd)` for more on password database entries.
[clinic start generated code]*/

static TyObject *
pwd_getpwnam_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=359ce1ddeb7a824f input=a6aeb5e3447fb9e0]*/
{
    char *buf = NULL, *buf2 = NULL, *name_chars;
    int nomem = 0;
    struct passwd *p;
    TyObject *bytes, *retval = NULL;

    if ((bytes = TyUnicode_EncodeFSDefault(name)) == NULL)
        return NULL;
    /* check for embedded null bytes */
    if (TyBytes_AsStringAndSize(bytes, &name_chars, NULL) == -1)
        goto out;
#ifdef HAVE_GETPWNAM_R
    int status;
    Ty_ssize_t bufsize;
    /* Note: 'pwd' will be used via pointer 'p' on getpwnam_r success. */
    struct passwd pwd;

    Ty_BEGIN_ALLOW_THREADS
    bufsize = sysconf(_SC_GETPW_R_SIZE_MAX);
    if (bufsize == -1) {
        bufsize = DEFAULT_BUFFER_SIZE;
    }

    while(1) {
        buf2 = TyMem_RawRealloc(buf, bufsize);
        if (buf2 == NULL) {
            p = NULL;
            nomem = 1;
            break;
        }
        buf = buf2;
        status = getpwnam_r(name_chars, &pwd, buf, bufsize, &p);
        if (status != 0) {
            p = NULL;
        }
        if (p != NULL || status != ERANGE) {
            break;
        }
        if (bufsize > (PY_SSIZE_T_MAX >> 1)) {
            nomem = 1;
            break;
        }
        bufsize <<= 1;
    }

    Ty_END_ALLOW_THREADS
#else
    p = getpwnam(name_chars);
#endif
    if (p == NULL) {
        if (nomem == 1) {
            TyErr_NoMemory();
        }
        else {
            TyErr_Format(TyExc_KeyError,
                         "getpwnam(): name not found: %R", name);
        }
        goto out;
    }
    retval = mkpwent(module, p);
out:
    TyMem_RawFree(buf);
    Ty_DECREF(bytes);
    return retval;
}

#ifdef HAVE_GETPWENT
/*[clinic input]
pwd.getpwall

Return a list of all available password database entries, in arbitrary order.

See help(pwd) for more on password database entries.
[clinic start generated code]*/

static TyObject *
pwd_getpwall_impl(TyObject *module)
/*[clinic end generated code: output=4853d2f5a0afac8a input=d7ecebfd90219b85]*/
{
    TyObject *d;
    struct passwd *p;
    if ((d = TyList_New(0)) == NULL)
        return NULL;
    setpwent();
    while ((p = getpwent()) != NULL) {
        TyObject *v = mkpwent(module, p);
        if (v == NULL || TyList_Append(d, v) != 0) {
            Ty_XDECREF(v);
            Ty_DECREF(d);
            endpwent();
            return NULL;
        }
        Ty_DECREF(v);
    }
    endpwent();
    return d;
}
#endif

static TyMethodDef pwd_methods[] = {
    PWD_GETPWUID_METHODDEF
    PWD_GETPWNAM_METHODDEF
#ifdef HAVE_GETPWENT
    PWD_GETPWALL_METHODDEF
#endif
    {NULL,              NULL}           /* sentinel */
};

static int
pwdmodule_exec(TyObject *module)
{
    pwdmodulestate *state = get_pwd_state(module);

    state->StructPwdType = TyStructSequence_NewType(&struct_pwd_type_desc);
    if (state->StructPwdType == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->StructPwdType) < 0) {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot pwdmodule_slots[] = {
    {Ty_mod_exec, pwdmodule_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int pwdmodule_traverse(TyObject *m, visitproc visit, void *arg) {
    Ty_VISIT(get_pwd_state(m)->StructPwdType);
    return 0;
}
static int pwdmodule_clear(TyObject *m) {
    Ty_CLEAR(get_pwd_state(m)->StructPwdType);
    return 0;
}
static void pwdmodule_free(void *m) {
    pwdmodule_clear((TyObject *)m);
}

static struct TyModuleDef pwdmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "pwd",
    .m_doc = pwd__doc__,
    .m_size = sizeof(pwdmodulestate),
    .m_methods = pwd_methods,
    .m_slots = pwdmodule_slots,
    .m_traverse = pwdmodule_traverse,
    .m_clear = pwdmodule_clear,
    .m_free = pwdmodule_free,
};


PyMODINIT_FUNC
PyInit_pwd(void)
{
    return PyModuleDef_Init(&pwdmodule);
}
