/* UNIX group file access module */

// Argument Clinic uses the internal C API
#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "posixmodule.h"

#include <errno.h>                // ERANGE
#include <grp.h>                  // getgrgid_r()
#include <string.h>               // memcpy()
#include <unistd.h>               // sysconf()

#include "clinic/grpmodule.c.h"
/*[clinic input]
module grp
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=cade63f2ed1bd9f8]*/

static TyStructSequence_Field struct_group_type_fields[] = {
   {"gr_name", "group name"},
   {"gr_passwd", "password"},
   {"gr_gid", "group id"},
   {"gr_mem", "group members"},
   {0}
};

TyDoc_STRVAR(struct_group__doc__,
"grp.struct_group: Results from getgr*() routines.\n\n\
This object may be accessed either as a tuple of\n\
  (gr_name,gr_passwd,gr_gid,gr_mem)\n\
or via the object attributes as named in the above tuple.\n");

static TyStructSequence_Desc struct_group_type_desc = {
   "grp.struct_group",
   struct_group__doc__,
   struct_group_type_fields,
   4,
};


typedef struct {
  TyTypeObject *StructGrpType;
} grpmodulestate;

static inline grpmodulestate*
get_grp_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (grpmodulestate *)state;
}

static struct TyModuleDef grpmodule;

/* Mutex to protect calls to getgrgid(), getgrnam(), and getgrent().
 * These functions return pointer to static data structure, which
 * may be overwritten by any subsequent calls. */
static PyMutex group_db_mutex = {0};

#define DEFAULT_BUFFER_SIZE 1024

static TyObject *
mkgrent(TyObject *module, struct group *p)
{
    int setIndex = 0;
    TyObject *v, *w;
    char **member;

    v = TyStructSequence_New(get_grp_state(module)->StructGrpType);
    if (v == NULL)
        return NULL;

    if ((w = TyList_New(0)) == NULL) {
        Ty_DECREF(v);
        return NULL;
    }
    for (member = p->gr_mem; ; member++) {
        char *group_member;
        // member can be misaligned
        memcpy(&group_member, member, sizeof(group_member));
        if (group_member == NULL) {
            break;
        }
        TyObject *x = TyUnicode_DecodeFSDefault(group_member);
        if (x == NULL || TyList_Append(w, x) != 0) {
            Ty_XDECREF(x);
            Ty_DECREF(w);
            Ty_DECREF(v);
            return NULL;
        }
        Ty_DECREF(x);
    }

#define SET(i,val) TyStructSequence_SetItem(v, i, val)
    SET(setIndex++, TyUnicode_DecodeFSDefault(p->gr_name));
    if (p->gr_passwd)
            SET(setIndex++, TyUnicode_DecodeFSDefault(p->gr_passwd));
    else {
            SET(setIndex++, Ty_None);
            Ty_INCREF(Ty_None);
    }
    SET(setIndex++, _TyLong_FromGid(p->gr_gid));
    SET(setIndex++, w);
#undef SET

    if (TyErr_Occurred()) {
        Ty_DECREF(v);
        return NULL;
    }

    return v;
}

/*[clinic input]
grp.getgrgid

    id: object

Return the group database entry for the given numeric group ID.

If id is not valid, raise KeyError.
[clinic start generated code]*/

static TyObject *
grp_getgrgid_impl(TyObject *module, TyObject *id)
/*[clinic end generated code: output=30797c289504a1ba input=15fa0e2ccf5cda25]*/
{
    TyObject *retval = NULL;
    int nomem = 0;
    char *buf = NULL, *buf2 = NULL;
    gid_t gid;
    struct group *p;

    if (!_Ty_Gid_Converter(id, &gid)) {
        return NULL;
    }
#ifdef HAVE_GETGRGID_R
    int status;
    Ty_ssize_t bufsize;
    /* Note: 'grp' will be used via pointer 'p' on getgrgid_r success. */
    struct group grp;

    Ty_BEGIN_ALLOW_THREADS
    bufsize = sysconf(_SC_GETGR_R_SIZE_MAX);
    if (bufsize == -1) {
        bufsize = DEFAULT_BUFFER_SIZE;
    }

    while (1) {
        buf2 = TyMem_RawRealloc(buf, bufsize);
        if (buf2 == NULL) {
            p = NULL;
            nomem = 1;
            break;
        }
        buf = buf2;
        status = getgrgid_r(gid, &grp, buf, bufsize, &p);
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
    PyMutex_Lock(&group_db_mutex);
    // The getgrgid() function need not be thread-safe.
    // https://pubs.opengroup.org/onlinepubs/9699919799/functions/getgrgid.html
    p = getgrgid(gid);
#endif
    if (p == NULL) {
#ifndef HAVE_GETGRGID_R
        PyMutex_Unlock(&group_db_mutex);
#endif
        TyMem_RawFree(buf);
        if (nomem == 1) {
            return TyErr_NoMemory();
        }
        TyObject *gid_obj = _TyLong_FromGid(gid);
        if (gid_obj == NULL)
            return NULL;
        TyErr_Format(TyExc_KeyError, "getgrgid(): gid not found: %S", gid_obj);
        Ty_DECREF(gid_obj);
        return NULL;
    }
    retval = mkgrent(module, p);
#ifdef HAVE_GETGRGID_R
    TyMem_RawFree(buf);
#else
    PyMutex_Unlock(&group_db_mutex);
#endif
    return retval;
}

/*[clinic input]
grp.getgrnam

    name: unicode

Return the group database entry for the given group name.

If name is not valid, raise KeyError.
[clinic start generated code]*/

static TyObject *
grp_getgrnam_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=67905086f403c21c input=08ded29affa3c863]*/
{
    char *buf = NULL, *buf2 = NULL, *name_chars;
    int nomem = 0;
    struct group *p;
    TyObject *bytes, *retval = NULL;

    if ((bytes = TyUnicode_EncodeFSDefault(name)) == NULL)
        return NULL;
    /* check for embedded null bytes */
    if (TyBytes_AsStringAndSize(bytes, &name_chars, NULL) == -1)
        goto out;
#ifdef HAVE_GETGRNAM_R
    int status;
    Ty_ssize_t bufsize;
    /* Note: 'grp' will be used via pointer 'p' on getgrnam_r success. */
    struct group grp;

    Ty_BEGIN_ALLOW_THREADS
    bufsize = sysconf(_SC_GETGR_R_SIZE_MAX);
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
        status = getgrnam_r(name_chars, &grp, buf, bufsize, &p);
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
    PyMutex_Lock(&group_db_mutex);
    // The getgrnam() function need not be thread-safe.
    // https://pubs.opengroup.org/onlinepubs/9699919799/functions/getgrnam.html
    p = getgrnam(name_chars);
#endif
    if (p == NULL) {
#ifndef HAVE_GETGRNAM_R
        PyMutex_Unlock(&group_db_mutex);
#endif
        if (nomem == 1) {
            TyErr_NoMemory();
        }
        else {
            TyErr_Format(TyExc_KeyError, "getgrnam(): name not found: %R", name);
        }
        goto out;
    }
    retval = mkgrent(module, p);
#ifndef HAVE_GETGRNAM_R
    PyMutex_Unlock(&group_db_mutex);
#endif
out:
    TyMem_RawFree(buf);
    Ty_DECREF(bytes);
    return retval;
}

/*[clinic input]
grp.getgrall

Return a list of all available group entries, in arbitrary order.

An entry whose name starts with '+' or '-' represents an instruction
to use YP/NIS and may not be accessible via getgrnam or getgrgid.
[clinic start generated code]*/

static TyObject *
grp_getgrall_impl(TyObject *module)
/*[clinic end generated code: output=585dad35e2e763d7 input=d7df76c825c367df]*/
{
    TyObject *d = TyList_New(0);
    if (d == NULL) {
        return NULL;
    }

    PyMutex_Lock(&group_db_mutex);
    setgrent();

    struct group *p;
    while ((p = getgrent()) != NULL) {
        // gh-126316: Don't release the mutex around mkgrent() since
        // setgrent()/endgrent() are not reentrant / thread-safe. A deadlock
        // is unlikely since mkgrent() should not be able to call arbitrary
        // Python code.
        TyObject *v = mkgrent(module, p);
        if (v == NULL || TyList_Append(d, v) != 0) {
            Ty_XDECREF(v);
            Ty_CLEAR(d);
            goto done;
        }
        Ty_DECREF(v);
    }

done:
    endgrent();
    PyMutex_Unlock(&group_db_mutex);
    return d;
}

static TyMethodDef grp_methods[] = {
    GRP_GETGRGID_METHODDEF
    GRP_GETGRNAM_METHODDEF
    GRP_GETGRALL_METHODDEF
    {NULL, NULL}
};

TyDoc_STRVAR(grp__doc__,
"Access to the Unix group database.\n\
\n\
Group entries are reported as 4-tuples containing the following fields\n\
from the group database, in order:\n\
\n\
  gr_name   - name of the group\n\
  gr_passwd - group password (encrypted); often empty\n\
  gr_gid    - numeric ID of the group\n\
  gr_mem    - list of members\n\
\n\
The gid is an integer, name and password are strings.  (Note that most\n\
users are not explicitly listed as members of the groups they are in\n\
according to the password database.  Check both databases to get\n\
complete membership information.)");

static int
grpmodule_exec(TyObject *module)
{
    grpmodulestate *state = get_grp_state(module);

    state->StructGrpType = TyStructSequence_NewType(&struct_group_type_desc);
    if (state->StructGrpType == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->StructGrpType) < 0) {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot grpmodule_slots[] = {
    {Ty_mod_exec, grpmodule_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int grpmodule_traverse(TyObject *m, visitproc visit, void *arg) {
    Ty_VISIT(get_grp_state(m)->StructGrpType);
    return 0;
}

static int grpmodule_clear(TyObject *m) {
    Ty_CLEAR(get_grp_state(m)->StructGrpType);
    return 0;
}

static void grpmodule_free(void *m) {
    grpmodule_clear((TyObject *)m);
}

static struct TyModuleDef grpmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "grp",
    .m_doc = grp__doc__,
    .m_size = sizeof(grpmodulestate),
    .m_methods = grp_methods,
    .m_slots = grpmodule_slots,
    .m_traverse = grpmodule_traverse,
    .m_clear = grpmodule_clear,
    .m_free = grpmodule_free,
};

PyMODINIT_FUNC
PyInit_grp(void)
{
   return PyModuleDef_Init(&grpmodule);
}
