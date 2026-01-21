/* Return the initial module search path. */

#include "Python.h"
#include "pycore_fileutils.h"     // _Py_abspath()
#include "pycore_initconfig.h"    // _TyStatus_EXCEPTION()
#include "pycore_pathconfig.h"    // _TyPathConfig_ReadGlobal()
#include "pycore_pymem.h"         // _TyMem_RawWcsdup()
#include "pycore_pystate.h"       // _TyThreadState_GET()

#include "marshal.h"              // TyMarshal_ReadObjectFromString
#include "osdefs.h"               // DELIM
#include <wchar.h>

#ifdef MS_WINDOWS
#  include <windows.h>            // GetFullPathNameW(), MAX_PATH
#  include <pathcch.h>
#endif

#ifdef __APPLE__
#  include <mach-o/dyld.h>
#endif

#ifdef HAVE_DLFCN_H
#  include <dlfcn.h>
#endif

/* Reference the precompiled getpath.py */
#include "Python/frozen_modules/getpath.h"

#if (!defined(PREFIX) || !defined(EXEC_PREFIX) \
        || !defined(VERSION) || !defined(VPATH) \
        || !defined(PLATLIBDIR))
#error "PREFIX, EXEC_PREFIX, VERSION, VPATH and PLATLIBDIR macros must be defined"
#endif

#if !defined(PYTHONPATH)
#define PYTHONPATH NULL
#endif

#if !defined(PYDEBUGEXT)
#define PYDEBUGEXT NULL
#endif

#if !defined(PYWINVER)
#ifdef MS_DLL_ID
#define PYWINVER MS_DLL_ID
#else
#define PYWINVER NULL
#endif
#endif

#if !defined(EXE_SUFFIX)
#if defined(MS_WINDOWS) || defined(__CYGWIN__) || defined(__MINGW32__)
#define EXE_SUFFIX L".exe"
#else
#define EXE_SUFFIX NULL
#endif
#endif


/* HELPER FUNCTIONS for getpath.py */

static TyObject *
getpath_abspath(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    wchar_t *path;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    Ty_ssize_t len;
    path = TyUnicode_AsWideCharString(pathobj, &len);
    if (path) {
        wchar_t *abs;
        if (_Py_abspath((const wchar_t *)_Py_normpath(path, -1), &abs) == 0 && abs) {
            r = TyUnicode_FromWideChar(abs, -1);
            TyMem_RawFree((void *)abs);
        } else {
            TyErr_SetString(TyExc_OSError, "failed to make path absolute");
        }
        TyMem_Free((void *)path);
    }
    return r;
}


static TyObject *
getpath_basename(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *path;
    if (!TyArg_ParseTuple(args, "U", &path)) {
        return NULL;
    }
    Ty_ssize_t end = TyUnicode_GET_LENGTH(path);
    Ty_ssize_t pos = TyUnicode_FindChar(path, SEP, 0, end, -1);
    if (pos < 0) {
        return Ty_NewRef(path);
    }
    return TyUnicode_Substring(path, pos + 1, end);
}


static TyObject *
getpath_dirname(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *path;
    if (!TyArg_ParseTuple(args, "U", &path)) {
        return NULL;
    }
    Ty_ssize_t end = TyUnicode_GET_LENGTH(path);
    Ty_ssize_t pos = TyUnicode_FindChar(path, SEP, 0, end, -1);
    if (pos < 0) {
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }
    return TyUnicode_Substring(path, 0, pos);
}


static TyObject *
getpath_isabs(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    const wchar_t *path;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (path) {
        r = _Py_isabs(path) ? Ty_True : Ty_False;
        TyMem_Free((void *)path);
    }
    return Ty_XNewRef(r);
}


static TyObject *
getpath_hassuffix(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    TyObject *suffixobj;
    const wchar_t *path;
    const wchar_t *suffix;
    if (!TyArg_ParseTuple(args, "UU", &pathobj, &suffixobj)) {
        return NULL;
    }
    Ty_ssize_t len, suffixLen;
    path = TyUnicode_AsWideCharString(pathobj, &len);
    if (path) {
        suffix = TyUnicode_AsWideCharString(suffixobj, &suffixLen);
        if (suffix) {
            if (suffixLen > len ||
#ifdef MS_WINDOWS
                wcsicmp(&path[len - suffixLen], suffix) != 0
#else
                wcscmp(&path[len - suffixLen], suffix) != 0
#endif
            ) {
                r = Ty_NewRef(Ty_False);
            } else {
                r = Ty_NewRef(Ty_True);
            }
            TyMem_Free((void *)suffix);
        }
        TyMem_Free((void *)path);
    }
    return r;
}


static TyObject *
getpath_isdir(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    const wchar_t *path;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (path) {
#ifdef MS_WINDOWS
        DWORD attr = GetFileAttributesW(path);
        r = (attr != INVALID_FILE_ATTRIBUTES) &&
            (attr & FILE_ATTRIBUTE_DIRECTORY) ? Ty_True : Ty_False;
#else
        struct stat st;
        r = (_Py_wstat(path, &st) == 0) && S_ISDIR(st.st_mode) ? Ty_True : Ty_False;
#endif
        TyMem_Free((void *)path);
    }
    return Ty_XNewRef(r);
}


static TyObject *
getpath_isfile(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    const wchar_t *path;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (path) {
#ifdef MS_WINDOWS
        DWORD attr = GetFileAttributesW(path);
        r = (attr != INVALID_FILE_ATTRIBUTES) &&
            !(attr & FILE_ATTRIBUTE_DIRECTORY) ? Ty_True : Ty_False;
#else
        struct stat st;
        r = (_Py_wstat(path, &st) == 0) && S_ISREG(st.st_mode) ? Ty_True : Ty_False;
#endif
        TyMem_Free((void *)path);
    }
    return Ty_XNewRef(r);
}


static TyObject *
getpath_isxfile(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    const wchar_t *path;
    Ty_ssize_t cchPath;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    path = TyUnicode_AsWideCharString(pathobj, &cchPath);
    if (path) {
#ifdef MS_WINDOWS
        DWORD attr = GetFileAttributesW(path);
        r = (attr != INVALID_FILE_ATTRIBUTES) &&
            !(attr & FILE_ATTRIBUTE_DIRECTORY) &&
            (cchPath >= 4) &&
            (CompareStringOrdinal(path + cchPath - 4, -1, L".exe", -1, 1 /* ignore case */) == CSTR_EQUAL)
            ? Ty_True : Ty_False;
#else
        struct stat st;
        r = (_Py_wstat(path, &st) == 0) &&
            S_ISREG(st.st_mode) &&
            (st.st_mode & 0111)
            ? Ty_True : Ty_False;
#endif
        TyMem_Free((void *)path);
    }
    return Ty_XNewRef(r);
}


static TyObject *
getpath_joinpath(TyObject *Py_UNUSED(self), TyObject *args)
{
    if (!TyTuple_Check(args)) {
        TyErr_SetString(TyExc_TypeError, "requires tuple of arguments");
        return NULL;
    }
    Ty_ssize_t n = TyTuple_GET_SIZE(args);
    if (n == 0) {
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }
    /* Convert all parts to wchar and accumulate max final length */
    wchar_t **parts = (wchar_t **)TyMem_Malloc(n * sizeof(wchar_t *));
    if (parts == NULL) {
        TyErr_NoMemory();
        return NULL;
    }
    memset(parts, 0, n * sizeof(wchar_t *));
    Ty_ssize_t cchFinal = 0;
    Ty_ssize_t first = 0;

    for (Ty_ssize_t i = 0; i < n; ++i) {
        TyObject *s = TyTuple_GET_ITEM(args, i);
        Ty_ssize_t cch;
        if (s == Ty_None) {
            cch = 0;
        } else if (TyUnicode_Check(s)) {
            parts[i] = TyUnicode_AsWideCharString(s, &cch);
            if (!parts[i]) {
                cchFinal = -1;
                break;
            }
            if (_Py_isabs(parts[i])) {
                first = i;
            }
        } else {
            TyErr_SetString(TyExc_TypeError, "all arguments to joinpath() must be str or None");
            cchFinal = -1;
            break;
        }
        cchFinal += cch + 1;
    }

    wchar_t *final = cchFinal > 0 ? (wchar_t *)TyMem_Malloc(cchFinal * sizeof(wchar_t)) : NULL;
    if (!final) {
        for (Ty_ssize_t i = 0; i < n; ++i) {
            TyMem_Free(parts[i]);
        }
        TyMem_Free(parts);
        if (cchFinal) {
            TyErr_NoMemory();
            return NULL;
        }
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }

    final[0] = '\0';
    /* Now join all the paths. The final result should be shorter than the buffer */
    for (Ty_ssize_t i = 0; i < n; ++i) {
        if (!parts[i]) {
            continue;
        }
        if (i >= first && final) {
            if (!final[0]) {
                /* final is definitely long enough to fit any individual part */
                wcscpy(final, parts[i]);
            } else if (_Py_add_relfile(final, parts[i], cchFinal) < 0) {
                /* if we fail, keep iterating to free memory, but stop adding parts */
                TyMem_Free(final);
                final = NULL;
            }
        }
        TyMem_Free(parts[i]);
    }
    TyMem_Free(parts);
    if (!final) {
        TyErr_SetString(TyExc_SystemError, "failed to join paths");
        return NULL;
    }
    TyObject *r = TyUnicode_FromWideChar(_Py_normpath(final, -1), -1);
    TyMem_Free(final);
    return r;
}


static TyObject *
getpath_readlines(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *r = NULL;
    TyObject *pathobj;
    const wchar_t *path;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
    path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (!path) {
        return NULL;
    }
    FILE *fp = _Py_wfopen(path, L"rb");
    if (!fp) {
        TyErr_SetFromErrno(TyExc_OSError);
        TyMem_Free((void *)path);
        return NULL;
    }
    TyMem_Free((void *)path);

    r = TyList_New(0);
    if (!r) {
        fclose(fp);
        return NULL;
    }
    const size_t MAX_FILE = 32 * 1024;
    char *buffer = (char *)TyMem_Malloc(MAX_FILE);
    if (!buffer) {
        Ty_DECREF(r);
        fclose(fp);
        return NULL;
    }

    size_t cb = fread(buffer, 1, MAX_FILE, fp);
    fclose(fp);
    if (!cb) {
        return r;
    }
    if (cb >= MAX_FILE) {
        Ty_DECREF(r);
        TyErr_SetString(TyExc_MemoryError,
            "cannot read file larger than 32KB during initialization");
        return NULL;
    }
    buffer[cb] = '\0';

    size_t len;
    wchar_t *wbuffer = _Py_DecodeUTF8_surrogateescape(buffer, cb, &len);
    TyMem_Free((void *)buffer);
    if (!wbuffer) {
        Ty_DECREF(r);
        TyErr_NoMemory();
        return NULL;
    }

    wchar_t *p1 = wbuffer;
    wchar_t *p2 = p1;
    while ((p2 = wcschr(p1, L'\n')) != NULL) {
        Ty_ssize_t cb = p2 - p1;
        while (cb >= 0 && (p1[cb] == L'\n' || p1[cb] == L'\r')) {
            --cb;
        }
        TyObject *u = TyUnicode_FromWideChar(p1, cb >= 0 ? cb + 1 : 0);
        if (!u || TyList_Append(r, u) < 0) {
            Ty_XDECREF(u);
            Ty_CLEAR(r);
            break;
        }
        Ty_DECREF(u);
        p1 = p2 + 1;
    }
    if (r && p1 && *p1) {
        TyObject *u = TyUnicode_FromWideChar(p1, -1);
        if (!u || TyList_Append(r, u) < 0) {
            Ty_CLEAR(r);
        }
        Ty_XDECREF(u);
    }
    TyMem_RawFree(wbuffer);
    return r;
}


static TyObject *
getpath_realpath(TyObject *Py_UNUSED(self) , TyObject *args)
{
    TyObject *pathobj;
    if (!TyArg_ParseTuple(args, "U", &pathobj)) {
        return NULL;
    }
#if defined(HAVE_READLINK)
    /* This readlink calculation only resolves a symlinked file, and
       does not resolve any path segments. This is consistent with
       prior releases, however, the realpath implementation below is
       potentially correct in more cases. */
    TyObject *r = NULL;
    int nlink = 0;
    wchar_t *path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (!path) {
        goto done;
    }
    wchar_t *path2 = _TyMem_RawWcsdup(path);
    TyMem_Free((void *)path);
    path = path2;
    while (path) {
        wchar_t resolved[MAXPATHLEN + 1];
        int linklen = _Py_wreadlink(path, resolved, Ty_ARRAY_LENGTH(resolved));
        if (linklen == -1) {
            r = TyUnicode_FromWideChar(path, -1);
            break;
        }
        if (_Py_isabs(resolved)) {
            TyMem_RawFree((void *)path);
            path = _TyMem_RawWcsdup(resolved);
        } else {
            wchar_t *s = wcsrchr(path, SEP);
            if (s) {
                *s = L'\0';
            }
            path2 = _Py_join_relfile(path, resolved);
            if (path2) {
                path2 = _Py_normpath(path2, -1);
            }
            TyMem_RawFree((void *)path);
            path = path2;
        }
        nlink++;
        /* 40 is the Linux kernel 4.2 limit */
        if (nlink >= 40) {
            TyErr_SetString(TyExc_OSError, "maximum number of symbolic links reached");
            break;
        }
    }
    if (!path) {
        TyErr_NoMemory();
    }
done:
    TyMem_RawFree((void *)path);
    return r;

#elif defined(HAVE_REALPATH)
    TyObject *r = NULL;
    struct stat st;
    const char *narrow = NULL;
    wchar_t *path = TyUnicode_AsWideCharString(pathobj, NULL);
    if (!path) {
        goto done;
    }
    narrow = Ty_EncodeLocale(path, NULL);
    if (!narrow) {
        TyErr_NoMemory();
        goto done;
    }
    if (lstat(narrow, &st)) {
        TyErr_SetFromErrno(TyExc_OSError);
        goto done;
    }
    if (!S_ISLNK(st.st_mode)) {
        r = Ty_NewRef(pathobj);
        goto done;
    }
    wchar_t resolved[MAXPATHLEN+1];
    if (_Py_wrealpath(path, resolved, MAXPATHLEN) == NULL) {
        TyErr_SetFromErrno(TyExc_OSError);
    } else {
        r = TyUnicode_FromWideChar(resolved, -1);
    }
done:
    TyMem_Free((void *)path);
    TyMem_Free((void *)narrow);
    return r;
#elif defined(MS_WINDOWS)
    HANDLE hFile;
    wchar_t resolved[MAXPATHLEN+1];
    int len = 0, err;
    Ty_ssize_t pathlen;
    TyObject *result;

    wchar_t *path = TyUnicode_AsWideCharString(pathobj, &pathlen);
    if (!path) {
        return NULL;
    }
    if (wcslen(path) != pathlen) {
        TyErr_SetString(TyExc_ValueError, "path contains embedded nulls");
        return NULL;
    }

    Ty_BEGIN_ALLOW_THREADS
    hFile = CreateFileW(path, 0, 0, NULL, OPEN_EXISTING, FILE_FLAG_BACKUP_SEMANTICS, NULL);
    if (hFile != INVALID_HANDLE_VALUE) {
        len = GetFinalPathNameByHandleW(hFile, resolved, MAXPATHLEN, VOLUME_NAME_DOS);
        err = len ? 0 : GetLastError();
        CloseHandle(hFile);
    } else {
        err = GetLastError();
    }
    Ty_END_ALLOW_THREADS

    if (err) {
        TyErr_SetFromWindowsErr(err);
        result = NULL;
    } else if (len <= MAXPATHLEN) {
        const wchar_t *p = resolved;
        if (0 == wcsncmp(p, L"\\\\?\\", 4)) {
            if (GetFileAttributesW(&p[4]) != INVALID_FILE_ATTRIBUTES) {
                p += 4;
                len -= 4;
            }
        }
        if (CompareStringOrdinal(path, (int)pathlen, p, len, TRUE) == CSTR_EQUAL) {
            result = Ty_NewRef(pathobj);
        } else {
            result = TyUnicode_FromWideChar(p, len);
        }
    } else {
        result = Ty_NewRef(pathobj);
    }
    TyMem_Free(path);
    return result;
#endif

    return Ty_NewRef(pathobj);
}


static TyMethodDef getpath_methods[] = {
    {"abspath", getpath_abspath, METH_VARARGS, NULL},
    {"basename", getpath_basename, METH_VARARGS, NULL},
    {"dirname", getpath_dirname, METH_VARARGS, NULL},
    {"hassuffix", getpath_hassuffix, METH_VARARGS, NULL},
    {"isabs", getpath_isabs, METH_VARARGS, NULL},
    {"isdir", getpath_isdir, METH_VARARGS, NULL},
    {"isfile", getpath_isfile, METH_VARARGS, NULL},
    {"isxfile", getpath_isxfile, METH_VARARGS, NULL},
    {"joinpath", getpath_joinpath, METH_VARARGS, NULL},
    {"readlines", getpath_readlines, METH_VARARGS, NULL},
    {"realpath", getpath_realpath, METH_VARARGS, NULL},
    {NULL, NULL, 0, NULL}
};


/* Two implementations of warn() to use depending on whether warnings
   are enabled or not. */

static TyObject *
getpath_warn(TyObject *Py_UNUSED(self), TyObject *args)
{
    TyObject *msgobj;
    if (!TyArg_ParseTuple(args, "U", &msgobj)) {
        return NULL;
    }
    fprintf(stderr, "%s\n", TyUnicode_AsUTF8(msgobj));
    Py_RETURN_NONE;
}


static TyObject *
getpath_nowarn(TyObject *Py_UNUSED(self), TyObject *args)
{
    Py_RETURN_NONE;
}


static TyMethodDef getpath_warn_method = {"warn", getpath_warn, METH_VARARGS, NULL};
static TyMethodDef getpath_nowarn_method = {"warn", getpath_nowarn, METH_VARARGS, NULL};

/* Add the helper functions to the dict */
static int
funcs_to_dict(TyObject *dict, int warnings)
{
    for (TyMethodDef *m = getpath_methods; m->ml_name; ++m) {
        TyObject *f = PyCFunction_NewEx(m, NULL, NULL);
        if (!f) {
            return 0;
        }
        if (TyDict_SetItemString(dict, m->ml_name, f) < 0) {
            Ty_DECREF(f);
            return 0;
        }
        Ty_DECREF(f);
    }
    TyMethodDef *m2 = warnings ? &getpath_warn_method : &getpath_nowarn_method;
    TyObject *f = PyCFunction_NewEx(m2, NULL, NULL);
    if (!f) {
        return 0;
    }
    if (TyDict_SetItemString(dict, m2->ml_name, f) < 0) {
        Ty_DECREF(f);
        return 0;
    }
    Ty_DECREF(f);
    return 1;
}


/* Add a wide-character string constant to the dict */
static int
wchar_to_dict(TyObject *dict, const char *key, const wchar_t *s)
{
    TyObject *u;
    int r;
    if (s && s[0]) {
        u = TyUnicode_FromWideChar(s, -1);
        if (!u) {
            return 0;
        }
    } else {
        u = Ty_NewRef(Ty_None);
    }
    r = TyDict_SetItemString(dict, key, u) == 0;
    Ty_DECREF(u);
    return r;
}


/* Add a narrow string constant to the dict, using default locale decoding */
static int
decode_to_dict(TyObject *dict, const char *key, const char *s)
{
    TyObject *u = NULL;
    int r;
    if (s && s[0]) {
        size_t len;
        const wchar_t *w = Ty_DecodeLocale(s, &len);
        if (w) {
            u = TyUnicode_FromWideChar(w, len);
            TyMem_RawFree((void *)w);
        }
        if (!u) {
            return 0;
        }
    } else {
        u = Ty_NewRef(Ty_None);
    }
    r = TyDict_SetItemString(dict, key, u) == 0;
    Ty_DECREF(u);
    return r;
}

/* Add an environment variable to the dict, optionally clearing it afterwards */
static int
env_to_dict(TyObject *dict, const char *key, int and_clear)
{
    TyObject *u = NULL;
    int r = 0;
    assert(strncmp(key, "ENV_", 4) == 0);
    assert(strlen(key) < 64);
#ifdef MS_WINDOWS
    wchar_t wkey[64];
    // Quick convert to wchar_t, since we know key is ASCII
    wchar_t *wp = wkey;
    for (const char *p = &key[4]; *p; ++p) {
        assert(!(*p & 0x80));
        *wp++ = *p;
    }
    *wp = L'\0';
    const wchar_t *v = _wgetenv(wkey);
    if (v) {
        u = TyUnicode_FromWideChar(v, -1);
        if (!u) {
            TyErr_Clear();
        }
    }
#else
    const char *v = getenv(&key[4]);
    if (v) {
        size_t len;
        const wchar_t *w = Ty_DecodeLocale(v, &len);
        if (w) {
            u = TyUnicode_FromWideChar(w, len);
            if (!u) {
                TyErr_Clear();
            }
            TyMem_RawFree((void *)w);
        }
    }
#endif
    if (u) {
        r = TyDict_SetItemString(dict, key, u) == 0;
        Ty_DECREF(u);
    } else {
        r = TyDict_SetItemString(dict, key, Ty_None) == 0;
    }
    if (r && and_clear) {
#ifdef MS_WINDOWS
        _wputenv_s(wkey, L"");
#else
        unsetenv(&key[4]);
#endif
    }
    return r;
}


/* Add an integer constant to the dict */
static int
int_to_dict(TyObject *dict, const char *key, int v)
{
    TyObject *o;
    int r;
    o = TyLong_FromLong(v);
    if (!o) {
        return 0;
    }
    r = TyDict_SetItemString(dict, key, o) == 0;
    Ty_DECREF(o);
    return r;
}


#ifdef MS_WINDOWS
static int
winmodule_to_dict(TyObject *dict, const char *key, HMODULE mod)
{
    wchar_t *buffer = NULL;
    for (DWORD cch = 256; buffer == NULL && cch < (1024 * 1024); cch *= 2) {
        buffer = (wchar_t*)TyMem_RawMalloc(cch * sizeof(wchar_t));
        if (buffer) {
            if (GetModuleFileNameW(mod, buffer, cch) == cch) {
                TyMem_RawFree(buffer);
                buffer = NULL;
            }
        }
    }
    int r = wchar_to_dict(dict, key, buffer);
    TyMem_RawFree(buffer);
    return r;
}
#endif


/* Add the current executable's path to the dict */
static int
progname_to_dict(TyObject *dict, const char *key)
{
#ifdef MS_WINDOWS
    return winmodule_to_dict(dict, key, NULL);
#elif defined(__APPLE__)
    char *path;
    uint32_t pathLen = 256;
    while (pathLen) {
        path = TyMem_RawMalloc((pathLen + 1) * sizeof(char));
        if (!path) {
            return 0;
        }
        if (_NSGetExecutablePath(path, &pathLen) != 0) {
            TyMem_RawFree(path);
            continue;
        }
        // Only keep if the path is absolute
        if (path[0] == SEP) {
            int r = decode_to_dict(dict, key, path);
            TyMem_RawFree(path);
            return r;
        }
        // Fall back and store None
        TyMem_RawFree(path);
        break;
    }
#endif
    return TyDict_SetItemString(dict, key, Ty_None) == 0;
}


/* Add the runtime library's path to the dict */
static int
library_to_dict(TyObject *dict, const char *key)
{
/* macOS framework builds do not link against a libpython dynamic library, but
   instead link against a macOS Framework. */
#if defined(Ty_ENABLE_SHARED) || defined(WITH_NEXT_FRAMEWORK)

#ifdef MS_WINDOWS
    extern HMODULE PyWin_DLLhModule;
    if (PyWin_DLLhModule) {
        return winmodule_to_dict(dict, key, PyWin_DLLhModule);
    }
#endif

#if HAVE_DLADDR
    Dl_info libpython_info;
    if (dladdr(&Ty_Initialize, &libpython_info) && libpython_info.dli_fname) {
        return decode_to_dict(dict, key, libpython_info.dli_fname);
    }
#endif
#endif

    return TyDict_SetItemString(dict, key, Ty_None) == 0;
}


TyObject *
_Py_Get_Getpath_CodeObject(void)
{
    return TyMarshal_ReadObjectFromString(
        (const char*)_Py_M__getpath, sizeof(_Py_M__getpath));
}


/* Perform the actual path calculation.

   When compute_path_config is 0, this only reads any initialised path
   config values into the TyConfig struct. For example, Ty_SetHome() or
   Ty_SetPath(). The only error should be due to failed memory allocation.

   When compute_path_config is 1, full path calculation is performed.
   The GIL must be held, and there may be filesystem access, side
   effects, and potential unraisable errors that are reported directly
   to stderr.

   Calling this function multiple times on the same TyConfig is only
   safe because already-configured values are not recalculated. To
   actually recalculate paths, you need a clean TyConfig.
*/
TyStatus
_TyConfig_InitPathConfig(TyConfig *config, int compute_path_config)
{
    TyStatus status = _TyPathConfig_ReadGlobal(config);

    if (_TyStatus_EXCEPTION(status) || !compute_path_config) {
        return status;
    }

    if (!_TyThreadState_GET()) {
        return TyStatus_Error("cannot calculate path configuration without GIL");
    }

    TyObject *configDict = _TyConfig_AsDict(config);
    if (!configDict) {
        TyErr_Clear();
        return TyStatus_NoMemory();
    }

    TyObject *dict = TyDict_New();
    if (!dict) {
        TyErr_Clear();
        Ty_DECREF(configDict);
        return TyStatus_NoMemory();
    }

    if (TyDict_SetItemString(dict, "config", configDict) < 0) {
        TyErr_Clear();
        Ty_DECREF(configDict);
        Ty_DECREF(dict);
        return TyStatus_NoMemory();
    }
    /* reference now held by dict */
    Ty_DECREF(configDict);

    TyObject *co = _Py_Get_Getpath_CodeObject();
    if (!co || !TyCode_Check(co)) {
        TyErr_Clear();
        Ty_XDECREF(co);
        Ty_DECREF(dict);
        return TyStatus_Error("error reading frozen getpath.py");
    }

#ifdef MS_WINDOWS
    TyObject *winreg = TyImport_ImportModule("winreg");
    if (!winreg || TyDict_SetItemString(dict, "winreg", winreg) < 0) {
        TyErr_Clear();
        Ty_XDECREF(winreg);
        if (TyDict_SetItemString(dict, "winreg", Ty_None) < 0) {
            TyErr_Clear();
            Ty_DECREF(co);
            Ty_DECREF(dict);
            return TyStatus_Error("error importing winreg module");
        }
    } else {
        Ty_DECREF(winreg);
    }
#endif

    if (
#ifdef MS_WINDOWS
        !decode_to_dict(dict, "os_name", "nt") ||
#elif defined(__APPLE__)
        !decode_to_dict(dict, "os_name", "darwin") ||
#else
        !decode_to_dict(dict, "os_name", "posix") ||
#endif
#ifdef WITH_NEXT_FRAMEWORK
        !int_to_dict(dict, "WITH_NEXT_FRAMEWORK", 1) ||
#else
        !int_to_dict(dict, "WITH_NEXT_FRAMEWORK", 0) ||
#endif
        !decode_to_dict(dict, "PREFIX", PREFIX) ||
        !decode_to_dict(dict, "EXEC_PREFIX", EXEC_PREFIX) ||
        !decode_to_dict(dict, "PYTHONPATH", PYTHONPATH) ||
        !decode_to_dict(dict, "VPATH", VPATH) ||
        !decode_to_dict(dict, "PLATLIBDIR", PLATLIBDIR) ||
        !decode_to_dict(dict, "PYDEBUGEXT", PYDEBUGEXT) ||
        !int_to_dict(dict, "VERSION_MAJOR", PY_MAJOR_VERSION) ||
        !int_to_dict(dict, "VERSION_MINOR", PY_MINOR_VERSION) ||
        !decode_to_dict(dict, "PYWINVER", PYWINVER) ||
        !wchar_to_dict(dict, "EXE_SUFFIX", EXE_SUFFIX) ||
        !env_to_dict(dict, "ENV_PATH", 0) ||
        !env_to_dict(dict, "ENV_PYTHONHOME", 0) ||
        !env_to_dict(dict, "ENV_PYTHONEXECUTABLE", 0) ||
        !env_to_dict(dict, "ENV___PYVENV_LAUNCHER__", 1) ||
        !progname_to_dict(dict, "real_executable") ||
        !library_to_dict(dict, "library") ||
        !wchar_to_dict(dict, "executable_dir", NULL) ||
        !wchar_to_dict(dict, "py_setpath", _TyPathConfig_GetGlobalModuleSearchPath()) ||
        !funcs_to_dict(dict, config->pathconfig_warnings) ||
#ifdef Ty_GIL_DISABLED
        !decode_to_dict(dict, "ABI_THREAD", "t") ||
#else
        !decode_to_dict(dict, "ABI_THREAD", "") ||
#endif
#ifndef MS_WINDOWS
        TyDict_SetItemString(dict, "winreg", Ty_None) < 0 ||
#endif
        TyDict_SetItemString(dict, "__builtins__", TyEval_GetBuiltins()) < 0
    ) {
        Ty_DECREF(co);
        Ty_DECREF(dict);
        TyErr_FormatUnraisable("Exception ignored while preparing getpath");
        return TyStatus_Error("error evaluating initial values");
    }

    TyObject *r = TyEval_EvalCode(co, dict, dict);
    Ty_DECREF(co);

    if (!r) {
        Ty_DECREF(dict);
        TyErr_FormatUnraisable("Exception ignored while running getpath");
        return TyStatus_Error("error evaluating path");
    }
    Ty_DECREF(r);

    if (_TyConfig_FromDict(config, configDict) < 0) {
        TyErr_FormatUnraisable("Exception ignored while reading getpath results");
        Ty_DECREF(dict);
        return TyStatus_Error("error getting getpath results");
    }

    Ty_DECREF(dict);

    return _TyStatus_OK();
}
