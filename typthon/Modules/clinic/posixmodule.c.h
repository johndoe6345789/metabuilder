/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_long.h"          // _TyLong_UnsignedInt_Converter()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(os_stat__doc__,
"stat($module, /, path, *, dir_fd=None, follow_symlinks=True)\n"
"--\n"
"\n"
"Perform a stat system call on the given path.\n"
"\n"
"  path\n"
"    Path to be examined; can be string, bytes, a path-like object or\n"
"    open-file-descriptor int.\n"
"  dir_fd\n"
"    If not None, it should be a file descriptor open to a directory,\n"
"    and path should be a relative string; path will then be relative to\n"
"    that directory.\n"
"  follow_symlinks\n"
"    If False, and the last element of the path is a symbolic link,\n"
"    stat will examine the symbolic link itself instead of the file\n"
"    the link points to.\n"
"\n"
"dir_fd and follow_symlinks may not be implemented\n"
"  on your platform.  If they are unavailable, using them will raise a\n"
"  NotImplementedError.\n"
"\n"
"It\'s an error to use dir_fd or follow_symlinks when specifying path as\n"
"  an open file descriptor.");

#define OS_STAT_METHODDEF    \
    {"stat", _PyCFunction_CAST(os_stat), METH_FASTCALL|METH_KEYWORDS, os_stat__doc__},

static TyObject *
os_stat_impl(TyObject *module, path_t *path, int dir_fd, int follow_symlinks);

static TyObject *
os_stat(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "stat",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("stat", "path", 0, 0, 0, 1);
    int dir_fd = DEFAULT_DIR_FD;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        if (!FSTATAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[2]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_stat_impl(module, &path, dir_fd, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_lstat__doc__,
"lstat($module, /, path, *, dir_fd=None)\n"
"--\n"
"\n"
"Perform a stat system call on the given path, without following symbolic links.\n"
"\n"
"Like stat(), but do not follow symbolic links.\n"
"Equivalent to stat(path, follow_symlinks=False).");

#define OS_LSTAT_METHODDEF    \
    {"lstat", _PyCFunction_CAST(os_lstat), METH_FASTCALL|METH_KEYWORDS, os_lstat__doc__},

static TyObject *
os_lstat_impl(TyObject *module, path_t *path, int dir_fd);

static TyObject *
os_lstat(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "lstat",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("lstat", "path", 0, 0, 0, 0);
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!FSTATAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_lstat_impl(module, &path, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_access__doc__,
"access($module, /, path, mode, *, dir_fd=None, effective_ids=False,\n"
"       follow_symlinks=True)\n"
"--\n"
"\n"
"Use the real uid/gid to test for access to a path.\n"
"\n"
"  path\n"
"    Path to be tested; can be string, bytes, or a path-like object.\n"
"  mode\n"
"    Operating-system mode bitfield.  Can be F_OK to test existence,\n"
"    or the inclusive-OR of R_OK, W_OK, and X_OK.\n"
"  dir_fd\n"
"    If not None, it should be a file descriptor open to a directory,\n"
"    and path should be relative; path will then be relative to that\n"
"    directory.\n"
"  effective_ids\n"
"    If True, access will use the effective uid/gid instead of\n"
"    the real uid/gid.\n"
"  follow_symlinks\n"
"    If False, and the last element of the path is a symbolic link,\n"
"    access will examine the symbolic link itself instead of the file\n"
"    the link points to.\n"
"\n"
"dir_fd, effective_ids, and follow_symlinks may not be implemented\n"
"  on your platform.  If they are unavailable, using them will raise a\n"
"  NotImplementedError.\n"
"\n"
"Note that most operations will use the effective uid/gid, therefore this\n"
"  routine can be used in a suid/sgid environment to test if the invoking user\n"
"  has the specified access to the path.");

#define OS_ACCESS_METHODDEF    \
    {"access", _PyCFunction_CAST(os_access), METH_FASTCALL|METH_KEYWORDS, os_access__doc__},

static int
os_access_impl(TyObject *module, path_t *path, int mode, int dir_fd,
               int effective_ids, int follow_symlinks);

static TyObject *
os_access(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), &_Ty_ID(dir_fd), &_Ty_ID(effective_ids), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", "dir_fd", "effective_ids", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "access",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("access", "path", 0, 0, 0, 0);
    int mode;
    int dir_fd = DEFAULT_DIR_FD;
    int effective_ids = 0;
    int follow_symlinks = 1;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    mode = TyLong_AsInt(args[1]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (!FACCESSAT_DIR_FD_CONVERTER(args[2], &dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        effective_ids = PyObject_IsTrue(args[3]);
        if (effective_ids < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[4]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    _return_value = os_access_impl(module, &path, mode, dir_fd, effective_ids, follow_symlinks);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(HAVE_TTYNAME_R)

TyDoc_STRVAR(os_ttyname__doc__,
"ttyname($module, fd, /)\n"
"--\n"
"\n"
"Return the name of the terminal device connected to \'fd\'.\n"
"\n"
"  fd\n"
"    Integer file descriptor handle.");

#define OS_TTYNAME_METHODDEF    \
    {"ttyname", (PyCFunction)os_ttyname, METH_O, os_ttyname__doc__},

static TyObject *
os_ttyname_impl(TyObject *module, int fd);

static TyObject *
os_ttyname(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_ttyname_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_TTYNAME_R) */

#if defined(HAVE_CTERMID)

TyDoc_STRVAR(os_ctermid__doc__,
"ctermid($module, /)\n"
"--\n"
"\n"
"Return the name of the controlling terminal for this process.");

#define OS_CTERMID_METHODDEF    \
    {"ctermid", (PyCFunction)os_ctermid, METH_NOARGS, os_ctermid__doc__},

static TyObject *
os_ctermid_impl(TyObject *module);

static TyObject *
os_ctermid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_ctermid_impl(module);
}

#endif /* defined(HAVE_CTERMID) */

TyDoc_STRVAR(os_chdir__doc__,
"chdir($module, /, path)\n"
"--\n"
"\n"
"Change the current working directory to the specified path.\n"
"\n"
"path may always be specified as a string.\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"If this functionality is unavailable, using it raises an exception.");

#define OS_CHDIR_METHODDEF    \
    {"chdir", _PyCFunction_CAST(os_chdir), METH_FASTCALL|METH_KEYWORDS, os_chdir__doc__},

static TyObject *
os_chdir_impl(TyObject *module, path_t *path);

static TyObject *
os_chdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "chdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("chdir", "path", 0, 0, 0, PATH_HAVE_FCHDIR);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os_chdir_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(HAVE_FCHDIR)

TyDoc_STRVAR(os_fchdir__doc__,
"fchdir($module, /, fd)\n"
"--\n"
"\n"
"Change to the directory of the given file descriptor.\n"
"\n"
"fd must be opened on a directory, not a file.\n"
"Equivalent to os.chdir(fd).");

#define OS_FCHDIR_METHODDEF    \
    {"fchdir", _PyCFunction_CAST(os_fchdir), METH_FASTCALL|METH_KEYWORDS, os_fchdir__doc__},

static TyObject *
os_fchdir_impl(TyObject *module, int fd);

static TyObject *
os_fchdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fchdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_fchdir_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_FCHDIR) */

TyDoc_STRVAR(os_chmod__doc__,
"chmod($module, /, path, mode, *, dir_fd=None,\n"
"      follow_symlinks=(os.name != \'nt\'))\n"
"--\n"
"\n"
"Change the access permissions of a file.\n"
"\n"
"  path\n"
"    Path to be modified.  May always be specified as a str, bytes, or a path-like object.\n"
"    On some platforms, path may also be specified as an open file descriptor.\n"
"    If this functionality is unavailable, using it raises an exception.\n"
"  mode\n"
"    Operating-system mode bitfield.\n"
"    Be careful when using number literals for *mode*. The conventional UNIX notation for\n"
"    numeric modes uses an octal base, which needs to be indicated with a ``0o`` prefix in\n"
"    Python.\n"
"  dir_fd\n"
"    If not None, it should be a file descriptor open to a directory,\n"
"    and path should be relative; path will then be relative to that\n"
"    directory.\n"
"  follow_symlinks\n"
"    If False, and the last element of the path is a symbolic link,\n"
"    chmod will modify the symbolic link itself instead of the file\n"
"    the link points to.\n"
"\n"
"It is an error to use dir_fd or follow_symlinks when specifying path as\n"
"  an open file descriptor.\n"
"dir_fd and follow_symlinks may not be implemented on your platform.\n"
"  If they are unavailable, using them will raise a NotImplementedError.");

#define OS_CHMOD_METHODDEF    \
    {"chmod", _PyCFunction_CAST(os_chmod), METH_FASTCALL|METH_KEYWORDS, os_chmod__doc__},

static TyObject *
os_chmod_impl(TyObject *module, path_t *path, int mode, int dir_fd,
              int follow_symlinks);

static TyObject *
os_chmod(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), &_Ty_ID(dir_fd), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", "dir_fd", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "chmod",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("chmod", "path", 0, 0, 0, PATH_HAVE_FCHMOD);
    int mode;
    int dir_fd = DEFAULT_DIR_FD;
    int follow_symlinks = CHMOD_DEFAULT_FOLLOW_SYMLINKS;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    mode = TyLong_AsInt(args[1]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (!FCHMODAT_DIR_FD_CONVERTER(args[2], &dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[3]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_chmod_impl(module, &path, mode, dir_fd, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if (defined(HAVE_FCHMOD) || defined(MS_WINDOWS))

TyDoc_STRVAR(os_fchmod__doc__,
"fchmod($module, /, fd, mode)\n"
"--\n"
"\n"
"Change the access permissions of the file given by file descriptor fd.\n"
"\n"
"  fd\n"
"    The file descriptor of the file to be modified.\n"
"  mode\n"
"    Operating-system mode bitfield.\n"
"    Be careful when using number literals for *mode*. The conventional UNIX notation for\n"
"    numeric modes uses an octal base, which needs to be indicated with a ``0o`` prefix in\n"
"    Python.\n"
"\n"
"Equivalent to os.chmod(fd, mode).");

#define OS_FCHMOD_METHODDEF    \
    {"fchmod", _PyCFunction_CAST(os_fchmod), METH_FASTCALL|METH_KEYWORDS, os_fchmod__doc__},

static TyObject *
os_fchmod_impl(TyObject *module, int fd, int mode);

static TyObject *
os_fchmod(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), &_Ty_ID(mode), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", "mode", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fchmod",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    int fd;
    int mode;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    mode = TyLong_AsInt(args[1]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_fchmod_impl(module, fd, mode);

exit:
    return return_value;
}

#endif /* (defined(HAVE_FCHMOD) || defined(MS_WINDOWS)) */

#if (defined(HAVE_LCHMOD) || defined(MS_WINDOWS))

TyDoc_STRVAR(os_lchmod__doc__,
"lchmod($module, /, path, mode)\n"
"--\n"
"\n"
"Change the access permissions of a file, without following symbolic links.\n"
"\n"
"If path is a symlink, this affects the link itself rather than the target.\n"
"Equivalent to chmod(path, mode, follow_symlinks=False).\"");

#define OS_LCHMOD_METHODDEF    \
    {"lchmod", _PyCFunction_CAST(os_lchmod), METH_FASTCALL|METH_KEYWORDS, os_lchmod__doc__},

static TyObject *
os_lchmod_impl(TyObject *module, path_t *path, int mode);

static TyObject *
os_lchmod(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "lchmod",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    path_t path = PATH_T_INITIALIZE_P("lchmod", "path", 0, 0, 0, 0);
    int mode;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    mode = TyLong_AsInt(args[1]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_lchmod_impl(module, &path, mode);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_LCHMOD) || defined(MS_WINDOWS)) */

#if defined(HAVE_CHFLAGS)

TyDoc_STRVAR(os_chflags__doc__,
"chflags($module, /, path, flags, follow_symlinks=True)\n"
"--\n"
"\n"
"Set file flags.\n"
"\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, chflags will change flags on the symbolic link itself instead of the\n"
"  file the link points to.\n"
"follow_symlinks may not be implemented on your platform.  If it is\n"
"unavailable, using it will raise a NotImplementedError.");

#define OS_CHFLAGS_METHODDEF    \
    {"chflags", _PyCFunction_CAST(os_chflags), METH_FASTCALL|METH_KEYWORDS, os_chflags__doc__},

static TyObject *
os_chflags_impl(TyObject *module, path_t *path, unsigned long flags,
                int follow_symlinks);

static TyObject *
os_chflags(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(flags), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "flags", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "chflags",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("chflags", "path", 0, 0, 0, 0);
    unsigned long flags;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!PyIndex_Check(args[1])) {
        _TyArg_BadArgument("chflags", "argument 'flags'", "int", args[1]);
        goto exit;
    }
    flags = TyLong_AsUnsignedLongMask(args[1]);
    if (!noptargs) {
        goto skip_optional_pos;
    }
    follow_symlinks = PyObject_IsTrue(args[2]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_chflags_impl(module, &path, flags, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_CHFLAGS) */

#if defined(HAVE_LCHFLAGS)

TyDoc_STRVAR(os_lchflags__doc__,
"lchflags($module, /, path, flags)\n"
"--\n"
"\n"
"Set file flags.\n"
"\n"
"This function will not follow symbolic links.\n"
"Equivalent to chflags(path, flags, follow_symlinks=False).");

#define OS_LCHFLAGS_METHODDEF    \
    {"lchflags", _PyCFunction_CAST(os_lchflags), METH_FASTCALL|METH_KEYWORDS, os_lchflags__doc__},

static TyObject *
os_lchflags_impl(TyObject *module, path_t *path, unsigned long flags);

static TyObject *
os_lchflags(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "lchflags",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    path_t path = PATH_T_INITIALIZE_P("lchflags", "path", 0, 0, 0, 0);
    unsigned long flags;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!PyIndex_Check(args[1])) {
        _TyArg_BadArgument("lchflags", "argument 'flags'", "int", args[1]);
        goto exit;
    }
    flags = TyLong_AsUnsignedLongMask(args[1]);
    return_value = os_lchflags_impl(module, &path, flags);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_LCHFLAGS) */

#if defined(HAVE_CHROOT)

TyDoc_STRVAR(os_chroot__doc__,
"chroot($module, /, path)\n"
"--\n"
"\n"
"Change root directory to path.");

#define OS_CHROOT_METHODDEF    \
    {"chroot", _PyCFunction_CAST(os_chroot), METH_FASTCALL|METH_KEYWORDS, os_chroot__doc__},

static TyObject *
os_chroot_impl(TyObject *module, path_t *path);

static TyObject *
os_chroot(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "chroot",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("chroot", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os_chroot_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_CHROOT) */

#if defined(HAVE_FSYNC)

TyDoc_STRVAR(os_fsync__doc__,
"fsync($module, /, fd)\n"
"--\n"
"\n"
"Force write of fd to disk.");

#define OS_FSYNC_METHODDEF    \
    {"fsync", _PyCFunction_CAST(os_fsync), METH_FASTCALL|METH_KEYWORDS, os_fsync__doc__},

static TyObject *
os_fsync_impl(TyObject *module, int fd);

static TyObject *
os_fsync(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fsync",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_fsync_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_FSYNC) */

#if defined(HAVE_SYNC)

TyDoc_STRVAR(os_sync__doc__,
"sync($module, /)\n"
"--\n"
"\n"
"Force write of everything to disk.");

#define OS_SYNC_METHODDEF    \
    {"sync", (PyCFunction)os_sync, METH_NOARGS, os_sync__doc__},

static TyObject *
os_sync_impl(TyObject *module);

static TyObject *
os_sync(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_sync_impl(module);
}

#endif /* defined(HAVE_SYNC) */

#if defined(HAVE_FDATASYNC)

TyDoc_STRVAR(os_fdatasync__doc__,
"fdatasync($module, /, fd)\n"
"--\n"
"\n"
"Force write of fd to disk without forcing update of metadata.");

#define OS_FDATASYNC_METHODDEF    \
    {"fdatasync", _PyCFunction_CAST(os_fdatasync), METH_FASTCALL|METH_KEYWORDS, os_fdatasync__doc__},

static TyObject *
os_fdatasync_impl(TyObject *module, int fd);

static TyObject *
os_fdatasync(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fdatasync",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_fdatasync_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_FDATASYNC) */

#if defined(HAVE_CHOWN)

TyDoc_STRVAR(os_chown__doc__,
"chown($module, /, path, uid, gid, *, dir_fd=None, follow_symlinks=True)\n"
"--\n"
"\n"
"Change the owner and group id of path to the numeric uid and gid.\\\n"
"\n"
"  path\n"
"    Path to be examined; can be string, bytes, a path-like object, or open-file-descriptor int.\n"
"  dir_fd\n"
"    If not None, it should be a file descriptor open to a directory,\n"
"    and path should be relative; path will then be relative to that\n"
"    directory.\n"
"  follow_symlinks\n"
"    If False, and the last element of the path is a symbolic link,\n"
"    stat will examine the symbolic link itself instead of the file\n"
"    the link points to.\n"
"\n"
"path may always be specified as a string.\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"  If this functionality is unavailable, using it raises an exception.\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, chown will modify the symbolic link itself instead of the file the\n"
"  link points to.\n"
"It is an error to use dir_fd or follow_symlinks when specifying path as\n"
"  an open file descriptor.\n"
"dir_fd and follow_symlinks may not be implemented on your platform.\n"
"  If they are unavailable, using them will raise a NotImplementedError.");

#define OS_CHOWN_METHODDEF    \
    {"chown", _PyCFunction_CAST(os_chown), METH_FASTCALL|METH_KEYWORDS, os_chown__doc__},

static TyObject *
os_chown_impl(TyObject *module, path_t *path, uid_t uid, gid_t gid,
              int dir_fd, int follow_symlinks);

static TyObject *
os_chown(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(uid), &_Ty_ID(gid), &_Ty_ID(dir_fd), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "uid", "gid", "dir_fd", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "chown",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    path_t path = PATH_T_INITIALIZE_P("chown", "path", 0, 0, 0, PATH_HAVE_FCHOWN);
    uid_t uid;
    gid_t gid;
    int dir_fd = DEFAULT_DIR_FD;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[1], &uid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[2], &gid)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        if (!FCHOWNAT_DIR_FD_CONVERTER(args[3], &dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[4]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_chown_impl(module, &path, uid, gid, dir_fd, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_CHOWN) */

#if defined(HAVE_FCHOWN)

TyDoc_STRVAR(os_fchown__doc__,
"fchown($module, /, fd, uid, gid)\n"
"--\n"
"\n"
"Change the owner and group id of the file specified by file descriptor.\n"
"\n"
"Equivalent to os.chown(fd, uid, gid).");

#define OS_FCHOWN_METHODDEF    \
    {"fchown", _PyCFunction_CAST(os_fchown), METH_FASTCALL|METH_KEYWORDS, os_fchown__doc__},

static TyObject *
os_fchown_impl(TyObject *module, int fd, uid_t uid, gid_t gid);

static TyObject *
os_fchown(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), &_Ty_ID(uid), &_Ty_ID(gid), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", "uid", "gid", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fchown",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    int fd;
    uid_t uid;
    gid_t gid;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[1], &uid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[2], &gid)) {
        goto exit;
    }
    return_value = os_fchown_impl(module, fd, uid, gid);

exit:
    return return_value;
}

#endif /* defined(HAVE_FCHOWN) */

#if defined(HAVE_LCHOWN)

TyDoc_STRVAR(os_lchown__doc__,
"lchown($module, /, path, uid, gid)\n"
"--\n"
"\n"
"Change the owner and group id of path to the numeric uid and gid.\n"
"\n"
"This function will not follow symbolic links.\n"
"Equivalent to os.chown(path, uid, gid, follow_symlinks=False).");

#define OS_LCHOWN_METHODDEF    \
    {"lchown", _PyCFunction_CAST(os_lchown), METH_FASTCALL|METH_KEYWORDS, os_lchown__doc__},

static TyObject *
os_lchown_impl(TyObject *module, path_t *path, uid_t uid, gid_t gid);

static TyObject *
os_lchown(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(uid), &_Ty_ID(gid), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "uid", "gid", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "lchown",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    path_t path = PATH_T_INITIALIZE_P("lchown", "path", 0, 0, 0, 0);
    uid_t uid;
    gid_t gid;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[1], &uid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[2], &gid)) {
        goto exit;
    }
    return_value = os_lchown_impl(module, &path, uid, gid);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_LCHOWN) */

TyDoc_STRVAR(os_getcwd__doc__,
"getcwd($module, /)\n"
"--\n"
"\n"
"Return a unicode string representing the current working directory.");

#define OS_GETCWD_METHODDEF    \
    {"getcwd", (PyCFunction)os_getcwd, METH_NOARGS, os_getcwd__doc__},

static TyObject *
os_getcwd_impl(TyObject *module);

static TyObject *
os_getcwd(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getcwd_impl(module);
}

TyDoc_STRVAR(os_getcwdb__doc__,
"getcwdb($module, /)\n"
"--\n"
"\n"
"Return a bytes string representing the current working directory.");

#define OS_GETCWDB_METHODDEF    \
    {"getcwdb", (PyCFunction)os_getcwdb, METH_NOARGS, os_getcwdb__doc__},

static TyObject *
os_getcwdb_impl(TyObject *module);

static TyObject *
os_getcwdb(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getcwdb_impl(module);
}

#if defined(HAVE_LINK)

TyDoc_STRVAR(os_link__doc__,
"link($module, /, src, dst, *, src_dir_fd=None, dst_dir_fd=None,\n"
"     follow_symlinks=(os.name != \'nt\'))\n"
"--\n"
"\n"
"Create a hard link to a file.\n"
"\n"
"If either src_dir_fd or dst_dir_fd is not None, it should be a file\n"
"  descriptor open to a directory, and the respective path string (src or dst)\n"
"  should be relative; the path will then be relative to that directory.\n"
"If follow_symlinks is False, and the last element of src is a symbolic\n"
"  link, link will create a link to the symbolic link itself instead of the\n"
"  file the link points to.\n"
"src_dir_fd, dst_dir_fd, and follow_symlinks may not be implemented on your\n"
"  platform.  If they are unavailable, using them will raise a\n"
"  NotImplementedError.");

#define OS_LINK_METHODDEF    \
    {"link", _PyCFunction_CAST(os_link), METH_FASTCALL|METH_KEYWORDS, os_link__doc__},

static TyObject *
os_link_impl(TyObject *module, path_t *src, path_t *dst, int src_dir_fd,
             int dst_dir_fd, int follow_symlinks);

static TyObject *
os_link(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(src_dir_fd), &_Ty_ID(dst_dir_fd), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "src_dir_fd", "dst_dir_fd", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "link",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t src = PATH_T_INITIALIZE_P("link", "src", 0, 0, 0, 0);
    path_t dst = PATH_T_INITIALIZE_P("link", "dst", 0, 0, 0, 0);
    int src_dir_fd = DEFAULT_DIR_FD;
    int dst_dir_fd = DEFAULT_DIR_FD;
    int follow_symlinks = -1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &src)) {
        goto exit;
    }
    if (!path_converter(args[1], &dst)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (!dir_fd_converter(args[2], &src_dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        if (!dir_fd_converter(args[3], &dst_dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[4]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_link_impl(module, &src, &dst, src_dir_fd, dst_dir_fd, follow_symlinks);

exit:
    /* Cleanup for src */
    path_cleanup(&src);
    /* Cleanup for dst */
    path_cleanup(&dst);

    return return_value;
}

#endif /* defined(HAVE_LINK) */

TyDoc_STRVAR(os_listdir__doc__,
"listdir($module, /, path=None)\n"
"--\n"
"\n"
"Return a list containing the names of the files in the directory.\n"
"\n"
"path can be specified as either str, bytes, or a path-like object.  If path is bytes,\n"
"  the filenames returned will also be bytes; in all other circumstances\n"
"  the filenames returned will be str.\n"
"If path is None, uses the path=\'.\'.\n"
"On some platforms, path may also be specified as an open file descriptor;\\\n"
"  the file descriptor must refer to a directory.\n"
"  If this functionality is unavailable, using it raises NotImplementedError.\n"
"\n"
"The list is in arbitrary order.  It does not include the special\n"
"entries \'.\' and \'..\' even if they are present in the directory.");

#define OS_LISTDIR_METHODDEF    \
    {"listdir", _PyCFunction_CAST(os_listdir), METH_FASTCALL|METH_KEYWORDS, os_listdir__doc__},

static TyObject *
os_listdir_impl(TyObject *module, path_t *path);

static TyObject *
os_listdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "listdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    path_t path = PATH_T_INITIALIZE_P("listdir", "path", 1, 0, 0, PATH_HAVE_FDOPENDIR);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_listdir_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_listdrives__doc__,
"listdrives($module, /)\n"
"--\n"
"\n"
"Return a list containing the names of drives in the system.\n"
"\n"
"A drive name typically looks like \'C:\\\\\'.");

#define OS_LISTDRIVES_METHODDEF    \
    {"listdrives", (PyCFunction)os_listdrives, METH_NOARGS, os_listdrives__doc__},

static TyObject *
os_listdrives_impl(TyObject *module);

static TyObject *
os_listdrives(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_listdrives_impl(module);
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_listvolumes__doc__,
"listvolumes($module, /)\n"
"--\n"
"\n"
"Return a list containing the volumes in the system.\n"
"\n"
"Volumes are typically represented as a GUID path.");

#define OS_LISTVOLUMES_METHODDEF    \
    {"listvolumes", (PyCFunction)os_listvolumes, METH_NOARGS, os_listvolumes__doc__},

static TyObject *
os_listvolumes_impl(TyObject *module);

static TyObject *
os_listvolumes(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_listvolumes_impl(module);
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_listmounts__doc__,
"listmounts($module, /, volume)\n"
"--\n"
"\n"
"Return a list containing mount points for a particular volume.\n"
"\n"
"\'volume\' should be a GUID path as returned from os.listvolumes.");

#define OS_LISTMOUNTS_METHODDEF    \
    {"listmounts", _PyCFunction_CAST(os_listmounts), METH_FASTCALL|METH_KEYWORDS, os_listmounts__doc__},

static TyObject *
os_listmounts_impl(TyObject *module, path_t *volume);

static TyObject *
os_listmounts(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(volume), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"volume", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "listmounts",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t volume = PATH_T_INITIALIZE_P("listmounts", "volume", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &volume)) {
        goto exit;
    }
    return_value = os_listmounts_impl(module, &volume);

exit:
    /* Cleanup for volume */
    path_cleanup(&volume);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_isdevdrive__doc__,
"_path_isdevdrive($module, /, path)\n"
"--\n"
"\n"
"Determines whether the specified path is on a Windows Dev Drive.");

#define OS__PATH_ISDEVDRIVE_METHODDEF    \
    {"_path_isdevdrive", _PyCFunction_CAST(os__path_isdevdrive), METH_FASTCALL|METH_KEYWORDS, os__path_isdevdrive__doc__},

static TyObject *
os__path_isdevdrive_impl(TyObject *module, path_t *path);

static TyObject *
os__path_isdevdrive(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_isdevdrive",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_isdevdrive", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__path_isdevdrive_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__getfullpathname__doc__,
"_getfullpathname($module, path, /)\n"
"--\n"
"\n");

#define OS__GETFULLPATHNAME_METHODDEF    \
    {"_getfullpathname", (PyCFunction)os__getfullpathname, METH_O, os__getfullpathname__doc__},

static TyObject *
os__getfullpathname_impl(TyObject *module, path_t *path);

static TyObject *
os__getfullpathname(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    path_t path = PATH_T_INITIALIZE_P("_getfullpathname", "path", 0, 0, 0, 0);

    if (!path_converter(arg, &path)) {
        goto exit;
    }
    return_value = os__getfullpathname_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__getfinalpathname__doc__,
"_getfinalpathname($module, path, /)\n"
"--\n"
"\n"
"A helper function for samepath on windows.");

#define OS__GETFINALPATHNAME_METHODDEF    \
    {"_getfinalpathname", (PyCFunction)os__getfinalpathname, METH_O, os__getfinalpathname__doc__},

static TyObject *
os__getfinalpathname_impl(TyObject *module, path_t *path);

static TyObject *
os__getfinalpathname(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    path_t path = PATH_T_INITIALIZE_P("_getfinalpathname", "path", 0, 0, 0, 0);

    if (!path_converter(arg, &path)) {
        goto exit;
    }
    return_value = os__getfinalpathname_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__findfirstfile__doc__,
"_findfirstfile($module, path, /)\n"
"--\n"
"\n"
"A function to get the real file name without accessing the file in Windows.");

#define OS__FINDFIRSTFILE_METHODDEF    \
    {"_findfirstfile", (PyCFunction)os__findfirstfile, METH_O, os__findfirstfile__doc__},

static TyObject *
os__findfirstfile_impl(TyObject *module, path_t *path);

static TyObject *
os__findfirstfile(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    path_t path = PATH_T_INITIALIZE_P("_findfirstfile", "path", 0, 0, 0, 0);

    if (!path_converter(arg, &path)) {
        goto exit;
    }
    return_value = os__findfirstfile_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__getvolumepathname__doc__,
"_getvolumepathname($module, /, path)\n"
"--\n"
"\n"
"A helper function for ismount on Win32.");

#define OS__GETVOLUMEPATHNAME_METHODDEF    \
    {"_getvolumepathname", _PyCFunction_CAST(os__getvolumepathname), METH_FASTCALL|METH_KEYWORDS, os__getvolumepathname__doc__},

static TyObject *
os__getvolumepathname_impl(TyObject *module, path_t *path);

static TyObject *
os__getvolumepathname(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_getvolumepathname",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_getvolumepathname", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__getvolumepathname_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_splitroot__doc__,
"_path_splitroot($module, /, path)\n"
"--\n"
"\n"
"Removes everything after the root on Win32.");

#define OS__PATH_SPLITROOT_METHODDEF    \
    {"_path_splitroot", _PyCFunction_CAST(os__path_splitroot), METH_FASTCALL|METH_KEYWORDS, os__path_splitroot__doc__},

static TyObject *
os__path_splitroot_impl(TyObject *module, path_t *path);

static TyObject *
os__path_splitroot(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_splitroot",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_splitroot", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__path_splitroot_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_exists__doc__,
"_path_exists($module, /, path)\n"
"--\n"
"\n"
"Test whether a path exists.  Returns False for broken symbolic links.");

#define OS__PATH_EXISTS_METHODDEF    \
    {"_path_exists", _PyCFunction_CAST(os__path_exists), METH_FASTCALL|METH_KEYWORDS, os__path_exists__doc__},

static int
os__path_exists_impl(TyObject *module, path_t *path);

static TyObject *
os__path_exists(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_exists",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_exists", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_exists_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_lexists__doc__,
"_path_lexists($module, /, path)\n"
"--\n"
"\n"
"Test whether a path exists.  Returns True for broken symbolic links.");

#define OS__PATH_LEXISTS_METHODDEF    \
    {"_path_lexists", _PyCFunction_CAST(os__path_lexists), METH_FASTCALL|METH_KEYWORDS, os__path_lexists__doc__},

static int
os__path_lexists_impl(TyObject *module, path_t *path);

static TyObject *
os__path_lexists(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_lexists",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_lexists", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_lexists_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_isdir__doc__,
"_path_isdir($module, /, s)\n"
"--\n"
"\n"
"Return true if the pathname refers to an existing directory.");

#define OS__PATH_ISDIR_METHODDEF    \
    {"_path_isdir", _PyCFunction_CAST(os__path_isdir), METH_FASTCALL|METH_KEYWORDS, os__path_isdir__doc__},

static int
os__path_isdir_impl(TyObject *module, path_t *path);

static TyObject *
os__path_isdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('s'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"s", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_isdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_isdir", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_isdir_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_isfile__doc__,
"_path_isfile($module, /, path)\n"
"--\n"
"\n"
"Test whether a path is a regular file");

#define OS__PATH_ISFILE_METHODDEF    \
    {"_path_isfile", _PyCFunction_CAST(os__path_isfile), METH_FASTCALL|METH_KEYWORDS, os__path_isfile__doc__},

static int
os__path_isfile_impl(TyObject *module, path_t *path);

static TyObject *
os__path_isfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_isfile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_isfile", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_isfile_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_islink__doc__,
"_path_islink($module, /, path)\n"
"--\n"
"\n"
"Test whether a path is a symbolic link");

#define OS__PATH_ISLINK_METHODDEF    \
    {"_path_islink", _PyCFunction_CAST(os__path_islink), METH_FASTCALL|METH_KEYWORDS, os__path_islink__doc__},

static int
os__path_islink_impl(TyObject *module, path_t *path);

static TyObject *
os__path_islink(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_islink",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_islink", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_islink_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__path_isjunction__doc__,
"_path_isjunction($module, /, path)\n"
"--\n"
"\n"
"Test whether a path is a junction");

#define OS__PATH_ISJUNCTION_METHODDEF    \
    {"_path_isjunction", _PyCFunction_CAST(os__path_isjunction), METH_FASTCALL|METH_KEYWORDS, os__path_isjunction__doc__},

static int
os__path_isjunction_impl(TyObject *module, path_t *path);

static TyObject *
os__path_isjunction(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_isjunction",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_path_isjunction", "path", 0, 0, 1, 1);
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    _return_value = os__path_isjunction_impl(module, &path);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(os__path_splitroot_ex__doc__,
"_path_splitroot_ex($module, /, p)\n"
"--\n"
"\n"
"Split a pathname into drive, root and tail.\n"
"\n"
"The tail contains anything after the root.");

#define OS__PATH_SPLITROOT_EX_METHODDEF    \
    {"_path_splitroot_ex", _PyCFunction_CAST(os__path_splitroot_ex), METH_FASTCALL|METH_KEYWORDS, os__path_splitroot_ex__doc__},

static TyObject *
os__path_splitroot_ex_impl(TyObject *module, path_t *path);

static TyObject *
os__path_splitroot_ex(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { _Ty_LATIN1_CHR('p'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"p", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_splitroot_ex",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE("_path_splitroot_ex", "path", 0, 1, 1, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__path_splitroot_ex_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os__path_normpath__doc__,
"_path_normpath($module, /, path)\n"
"--\n"
"\n"
"Normalize path, eliminating double slashes, etc.");

#define OS__PATH_NORMPATH_METHODDEF    \
    {"_path_normpath", _PyCFunction_CAST(os__path_normpath), METH_FASTCALL|METH_KEYWORDS, os__path_normpath__doc__},

static TyObject *
os__path_normpath_impl(TyObject *module, path_t *path);

static TyObject *
os__path_normpath(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_path_normpath",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE("_path_normpath", "path", 0, 1, 1, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__path_normpath_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_mkdir__doc__,
"mkdir($module, /, path, mode=511, *, dir_fd=None)\n"
"--\n"
"\n"
"Create a directory.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.\n"
"\n"
"The mode argument is ignored on Windows. Where it is used, the current umask\n"
"value is first masked out.");

#define OS_MKDIR_METHODDEF    \
    {"mkdir", _PyCFunction_CAST(os_mkdir), METH_FASTCALL|METH_KEYWORDS, os_mkdir__doc__},

static TyObject *
os_mkdir_impl(TyObject *module, path_t *path, int mode, int dir_fd);

static TyObject *
os_mkdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mkdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("mkdir", "path", 0, 0, 0, 0);
    int mode = 511;
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        mode = TyLong_AsInt(args[1]);
        if (mode == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!MKDIRAT_DIR_FD_CONVERTER(args[2], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_mkdir_impl(module, &path, mode, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(HAVE_NICE)

TyDoc_STRVAR(os_nice__doc__,
"nice($module, increment, /)\n"
"--\n"
"\n"
"Add increment to the priority of process and return the new priority.");

#define OS_NICE_METHODDEF    \
    {"nice", (PyCFunction)os_nice, METH_O, os_nice__doc__},

static TyObject *
os_nice_impl(TyObject *module, int increment);

static TyObject *
os_nice(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int increment;

    increment = TyLong_AsInt(arg);
    if (increment == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_nice_impl(module, increment);

exit:
    return return_value;
}

#endif /* defined(HAVE_NICE) */

#if defined(HAVE_GETPRIORITY)

TyDoc_STRVAR(os_getpriority__doc__,
"getpriority($module, /, which, who)\n"
"--\n"
"\n"
"Return program scheduling priority.");

#define OS_GETPRIORITY_METHODDEF    \
    {"getpriority", _PyCFunction_CAST(os_getpriority), METH_FASTCALL|METH_KEYWORDS, os_getpriority__doc__},

static TyObject *
os_getpriority_impl(TyObject *module, int which, int who);

static TyObject *
os_getpriority(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(which), &_Ty_ID(who), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"which", "who", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getpriority",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    int which;
    int who;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    which = TyLong_AsInt(args[0]);
    if (which == -1 && TyErr_Occurred()) {
        goto exit;
    }
    who = TyLong_AsInt(args[1]);
    if (who == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_getpriority_impl(module, which, who);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETPRIORITY) */

#if defined(HAVE_SETPRIORITY)

TyDoc_STRVAR(os_setpriority__doc__,
"setpriority($module, /, which, who, priority)\n"
"--\n"
"\n"
"Set program scheduling priority.");

#define OS_SETPRIORITY_METHODDEF    \
    {"setpriority", _PyCFunction_CAST(os_setpriority), METH_FASTCALL|METH_KEYWORDS, os_setpriority__doc__},

static TyObject *
os_setpriority_impl(TyObject *module, int which, int who, int priority);

static TyObject *
os_setpriority(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(which), &_Ty_ID(who), &_Ty_ID(priority), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"which", "who", "priority", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "setpriority",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    int which;
    int who;
    int priority;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    which = TyLong_AsInt(args[0]);
    if (which == -1 && TyErr_Occurred()) {
        goto exit;
    }
    who = TyLong_AsInt(args[1]);
    if (who == -1 && TyErr_Occurred()) {
        goto exit;
    }
    priority = TyLong_AsInt(args[2]);
    if (priority == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_setpriority_impl(module, which, who, priority);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETPRIORITY) */

TyDoc_STRVAR(os_rename__doc__,
"rename($module, /, src, dst, *, src_dir_fd=None, dst_dir_fd=None)\n"
"--\n"
"\n"
"Rename a file or directory.\n"
"\n"
"If either src_dir_fd or dst_dir_fd is not None, it should be a file\n"
"  descriptor open to a directory, and the respective path string (src or dst)\n"
"  should be relative; the path will then be relative to that directory.\n"
"src_dir_fd and dst_dir_fd, may not be implemented on your platform.\n"
"  If they are unavailable, using them will raise a NotImplementedError.");

#define OS_RENAME_METHODDEF    \
    {"rename", _PyCFunction_CAST(os_rename), METH_FASTCALL|METH_KEYWORDS, os_rename__doc__},

static TyObject *
os_rename_impl(TyObject *module, path_t *src, path_t *dst, int src_dir_fd,
               int dst_dir_fd);

static TyObject *
os_rename(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(src_dir_fd), &_Ty_ID(dst_dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "src_dir_fd", "dst_dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "rename",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t src = PATH_T_INITIALIZE_P("rename", "src", 0, 0, 0, 0);
    path_t dst = PATH_T_INITIALIZE_P("rename", "dst", 0, 0, 0, 0);
    int src_dir_fd = DEFAULT_DIR_FD;
    int dst_dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &src)) {
        goto exit;
    }
    if (!path_converter(args[1], &dst)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (!dir_fd_converter(args[2], &src_dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (!dir_fd_converter(args[3], &dst_dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_rename_impl(module, &src, &dst, src_dir_fd, dst_dir_fd);

exit:
    /* Cleanup for src */
    path_cleanup(&src);
    /* Cleanup for dst */
    path_cleanup(&dst);

    return return_value;
}

TyDoc_STRVAR(os_replace__doc__,
"replace($module, /, src, dst, *, src_dir_fd=None, dst_dir_fd=None)\n"
"--\n"
"\n"
"Rename a file or directory, overwriting the destination.\n"
"\n"
"If either src_dir_fd or dst_dir_fd is not None, it should be a file\n"
"  descriptor open to a directory, and the respective path string (src or dst)\n"
"  should be relative; the path will then be relative to that directory.\n"
"src_dir_fd and dst_dir_fd, may not be implemented on your platform.\n"
"  If they are unavailable, using them will raise a NotImplementedError.");

#define OS_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(os_replace), METH_FASTCALL|METH_KEYWORDS, os_replace__doc__},

static TyObject *
os_replace_impl(TyObject *module, path_t *src, path_t *dst, int src_dir_fd,
                int dst_dir_fd);

static TyObject *
os_replace(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(src_dir_fd), &_Ty_ID(dst_dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "src_dir_fd", "dst_dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t src = PATH_T_INITIALIZE_P("replace", "src", 0, 0, 0, 0);
    path_t dst = PATH_T_INITIALIZE_P("replace", "dst", 0, 0, 0, 0);
    int src_dir_fd = DEFAULT_DIR_FD;
    int dst_dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &src)) {
        goto exit;
    }
    if (!path_converter(args[1], &dst)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        if (!dir_fd_converter(args[2], &src_dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (!dir_fd_converter(args[3], &dst_dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_replace_impl(module, &src, &dst, src_dir_fd, dst_dir_fd);

exit:
    /* Cleanup for src */
    path_cleanup(&src);
    /* Cleanup for dst */
    path_cleanup(&dst);

    return return_value;
}

TyDoc_STRVAR(os_rmdir__doc__,
"rmdir($module, /, path, *, dir_fd=None)\n"
"--\n"
"\n"
"Remove a directory.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_RMDIR_METHODDEF    \
    {"rmdir", _PyCFunction_CAST(os_rmdir), METH_FASTCALL|METH_KEYWORDS, os_rmdir__doc__},

static TyObject *
os_rmdir_impl(TyObject *module, path_t *path, int dir_fd);

static TyObject *
os_rmdir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "rmdir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("rmdir", "path", 0, 0, 0, 0);
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!UNLINKAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_rmdir_impl(module, &path, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(HAVE_SYSTEM) && defined(MS_WINDOWS)

TyDoc_STRVAR(os_system__doc__,
"system($module, /, command)\n"
"--\n"
"\n"
"Execute the command in a subshell.");

#define OS_SYSTEM_METHODDEF    \
    {"system", _PyCFunction_CAST(os_system), METH_FASTCALL|METH_KEYWORDS, os_system__doc__},

static long
os_system_impl(TyObject *module, const wchar_t *command);

static TyObject *
os_system(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(command), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"command", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "system",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    const wchar_t *command = NULL;
    long _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("system", "argument 'command'", "str", args[0]);
        goto exit;
    }
    command = TyUnicode_AsWideCharString(args[0], NULL);
    if (command == NULL) {
        goto exit;
    }
    _return_value = os_system_impl(module, command);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    /* Cleanup for command */
    TyMem_Free((void *)command);

    return return_value;
}

#endif /* defined(HAVE_SYSTEM) && defined(MS_WINDOWS) */

#if defined(HAVE_SYSTEM) && !defined(MS_WINDOWS)

TyDoc_STRVAR(os_system__doc__,
"system($module, /, command)\n"
"--\n"
"\n"
"Execute the command in a subshell.");

#define OS_SYSTEM_METHODDEF    \
    {"system", _PyCFunction_CAST(os_system), METH_FASTCALL|METH_KEYWORDS, os_system__doc__},

static long
os_system_impl(TyObject *module, TyObject *command);

static TyObject *
os_system(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(command), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"command", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "system",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *command = NULL;
    long _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[0], &command)) {
        goto exit;
    }
    _return_value = os_system_impl(module, command);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    /* Cleanup for command */
    Ty_XDECREF(command);

    return return_value;
}

#endif /* defined(HAVE_SYSTEM) && !defined(MS_WINDOWS) */

#if defined(HAVE_UMASK)

TyDoc_STRVAR(os_umask__doc__,
"umask($module, mask, /)\n"
"--\n"
"\n"
"Set the current numeric umask and return the previous umask.");

#define OS_UMASK_METHODDEF    \
    {"umask", (PyCFunction)os_umask, METH_O, os_umask__doc__},

static TyObject *
os_umask_impl(TyObject *module, int mask);

static TyObject *
os_umask(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int mask;

    mask = TyLong_AsInt(arg);
    if (mask == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_umask_impl(module, mask);

exit:
    return return_value;
}

#endif /* defined(HAVE_UMASK) */

TyDoc_STRVAR(os_unlink__doc__,
"unlink($module, /, path, *, dir_fd=None)\n"
"--\n"
"\n"
"Remove a file (same as remove()).\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_UNLINK_METHODDEF    \
    {"unlink", _PyCFunction_CAST(os_unlink), METH_FASTCALL|METH_KEYWORDS, os_unlink__doc__},

static TyObject *
os_unlink_impl(TyObject *module, path_t *path, int dir_fd);

static TyObject *
os_unlink(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "unlink",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("unlink", "path", 0, 0, 0, 0);
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!UNLINKAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_unlink_impl(module, &path, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_remove__doc__,
"remove($module, /, path, *, dir_fd=None)\n"
"--\n"
"\n"
"Remove a file (same as unlink()).\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_REMOVE_METHODDEF    \
    {"remove", _PyCFunction_CAST(os_remove), METH_FASTCALL|METH_KEYWORDS, os_remove__doc__},

static TyObject *
os_remove_impl(TyObject *module, path_t *path, int dir_fd);

static TyObject *
os_remove(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "remove",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("remove", "path", 0, 0, 0, 0);
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!UNLINKAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_remove_impl(module, &path, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#if defined(HAVE_UNAME)

TyDoc_STRVAR(os_uname__doc__,
"uname($module, /)\n"
"--\n"
"\n"
"Return an object identifying the current operating system.\n"
"\n"
"The object behaves like a named tuple with the following fields:\n"
"  (sysname, nodename, release, version, machine)");

#define OS_UNAME_METHODDEF    \
    {"uname", (PyCFunction)os_uname, METH_NOARGS, os_uname__doc__},

static TyObject *
os_uname_impl(TyObject *module);

static TyObject *
os_uname(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_uname_impl(module);
}

#endif /* defined(HAVE_UNAME) */

TyDoc_STRVAR(os_utime__doc__,
"utime($module, /, path, times=None, *, ns=<unrepresentable>,\n"
"      dir_fd=None, follow_symlinks=True)\n"
"--\n"
"\n"
"Set the access and modified time of path.\n"
"\n"
"path may always be specified as a string.\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"  If this functionality is unavailable, using it raises an exception.\n"
"\n"
"If times is not None, it must be a tuple (atime, mtime);\n"
"    atime and mtime should be expressed as float seconds since the epoch.\n"
"If ns is specified, it must be a tuple (atime_ns, mtime_ns);\n"
"    atime_ns and mtime_ns should be expressed as integer nanoseconds\n"
"    since the epoch.\n"
"If times is None and ns is unspecified, utime uses the current time.\n"
"Specifying tuples for both times and ns is an error.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, utime will modify the symbolic link itself instead of the file the\n"
"  link points to.\n"
"It is an error to use dir_fd or follow_symlinks when specifying path\n"
"  as an open file descriptor.\n"
"dir_fd and follow_symlinks may not be available on your platform.\n"
"  If they are unavailable, using them will raise a NotImplementedError.");

#define OS_UTIME_METHODDEF    \
    {"utime", _PyCFunction_CAST(os_utime), METH_FASTCALL|METH_KEYWORDS, os_utime__doc__},

static TyObject *
os_utime_impl(TyObject *module, path_t *path, TyObject *times, TyObject *ns,
              int dir_fd, int follow_symlinks);

static TyObject *
os_utime(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(times), &_Ty_ID(ns), &_Ty_ID(dir_fd), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "times", "ns", "dir_fd", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "utime",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("utime", "path", 0, 0, 0, PATH_UTIME_HAVE_FD);
    TyObject *times = Ty_None;
    TyObject *ns = NULL;
    int dir_fd = DEFAULT_DIR_FD;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        times = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        ns = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        if (!FUTIMENSAT_DIR_FD_CONVERTER(args[3], &dir_fd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    follow_symlinks = PyObject_IsTrue(args[4]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_utime_impl(module, &path, times, ns, dir_fd, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os__exit__doc__,
"_exit($module, /, status)\n"
"--\n"
"\n"
"Exit to the system with specified status, without normal exit processing.");

#define OS__EXIT_METHODDEF    \
    {"_exit", _PyCFunction_CAST(os__exit), METH_FASTCALL|METH_KEYWORDS, os__exit__doc__},

static TyObject *
os__exit_impl(TyObject *module, int status);

static TyObject *
os__exit(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_exit",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os__exit_impl(module, status);

exit:
    return return_value;
}

#if defined(HAVE_EXECV)

TyDoc_STRVAR(os_execv__doc__,
"execv($module, path, argv, /)\n"
"--\n"
"\n"
"Execute an executable path with arguments, replacing current process.\n"
"\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.");

#define OS_EXECV_METHODDEF    \
    {"execv", _PyCFunction_CAST(os_execv), METH_FASTCALL, os_execv__doc__},

static TyObject *
os_execv_impl(TyObject *module, path_t *path, TyObject *argv);

static TyObject *
os_execv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    path_t path = PATH_T_INITIALIZE_P("execv", "path", 0, 0, 0, 0);
    TyObject *argv;

    if (!_TyArg_CheckPositional("execv", nargs, 2, 2)) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    argv = args[1];
    return_value = os_execv_impl(module, &path, argv);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_EXECV) */

#if defined(HAVE_EXECV)

TyDoc_STRVAR(os_execve__doc__,
"execve($module, /, path, argv, env)\n"
"--\n"
"\n"
"Execute an executable path with arguments, replacing current process.\n"
"\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.\n"
"  env\n"
"    Dictionary of strings mapping to strings.");

#define OS_EXECVE_METHODDEF    \
    {"execve", _PyCFunction_CAST(os_execve), METH_FASTCALL|METH_KEYWORDS, os_execve__doc__},

static TyObject *
os_execve_impl(TyObject *module, path_t *path, TyObject *argv, TyObject *env);

static TyObject *
os_execve(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(argv), &_Ty_ID(env), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "argv", "env", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "execve",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    path_t path = PATH_T_INITIALIZE_P("execve", "path", 0, 0, 0, PATH_HAVE_FEXECVE);
    TyObject *argv;
    TyObject *env;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    argv = args[1];
    env = args[2];
    return_value = os_execve_impl(module, &path, argv, env);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_EXECV) */

#if defined(HAVE_POSIX_SPAWN)

TyDoc_STRVAR(os_posix_spawn__doc__,
"posix_spawn($module, path, argv, env, /, *, file_actions=(),\n"
"            setpgroup=<unrepresentable>, resetids=False, setsid=False,\n"
"            setsigmask=(), setsigdef=(), scheduler=<unrepresentable>)\n"
"--\n"
"\n"
"Execute the program specified by path in a new process.\n"
"\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.\n"
"  env\n"
"    Dictionary of strings mapping to strings.\n"
"  file_actions\n"
"    A sequence of file action tuples.\n"
"  setpgroup\n"
"    The pgroup to use with the POSIX_SPAWN_SETPGROUP flag.\n"
"  resetids\n"
"    If the value is `true` the POSIX_SPAWN_RESETIDS will be activated.\n"
"  setsid\n"
"    If the value is `true` the POSIX_SPAWN_SETSID or POSIX_SPAWN_SETSID_NP will be activated.\n"
"  setsigmask\n"
"    The sigmask to use with the POSIX_SPAWN_SETSIGMASK flag.\n"
"  setsigdef\n"
"    The sigmask to use with the POSIX_SPAWN_SETSIGDEF flag.\n"
"  scheduler\n"
"    A tuple with the scheduler policy (optional) and parameters.");

#define OS_POSIX_SPAWN_METHODDEF    \
    {"posix_spawn", _PyCFunction_CAST(os_posix_spawn), METH_FASTCALL|METH_KEYWORDS, os_posix_spawn__doc__},

static TyObject *
os_posix_spawn_impl(TyObject *module, path_t *path, TyObject *argv,
                    TyObject *env, TyObject *file_actions,
                    TyObject *setpgroup, int resetids, int setsid,
                    TyObject *setsigmask, TyObject *setsigdef,
                    TyObject *scheduler);

static TyObject *
os_posix_spawn(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(file_actions), &_Ty_ID(setpgroup), &_Ty_ID(resetids), &_Ty_ID(setsid), &_Ty_ID(setsigmask), &_Ty_ID(setsigdef), &_Ty_ID(scheduler), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "", "file_actions", "setpgroup", "resetids", "setsid", "setsigmask", "setsigdef", "scheduler", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posix_spawn",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[10];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    path_t path = PATH_T_INITIALIZE_P("posix_spawn", "path", 0, 0, 0, 0);
    TyObject *argv;
    TyObject *env;
    TyObject *file_actions = NULL;
    TyObject *setpgroup = NULL;
    int resetids = 0;
    int setsid = 0;
    TyObject *setsigmask = NULL;
    TyObject *setsigdef = NULL;
    TyObject *scheduler = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    argv = args[1];
    env = args[2];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        file_actions = args[3];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[4]) {
        setpgroup = args[4];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[5]) {
        resetids = PyObject_IsTrue(args[5]);
        if (resetids < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[6]) {
        setsid = PyObject_IsTrue(args[6]);
        if (setsid < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[7]) {
        setsigmask = args[7];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[8]) {
        setsigdef = args[8];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    scheduler = args[9];
skip_optional_kwonly:
    return_value = os_posix_spawn_impl(module, &path, argv, env, file_actions, setpgroup, resetids, setsid, setsigmask, setsigdef, scheduler);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_POSIX_SPAWN) */

#if defined(HAVE_POSIX_SPAWNP)

TyDoc_STRVAR(os_posix_spawnp__doc__,
"posix_spawnp($module, path, argv, env, /, *, file_actions=(),\n"
"             setpgroup=<unrepresentable>, resetids=False, setsid=False,\n"
"             setsigmask=(), setsigdef=(), scheduler=<unrepresentable>)\n"
"--\n"
"\n"
"Execute the program specified by path in a new process.\n"
"\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.\n"
"  env\n"
"    Dictionary of strings mapping to strings.\n"
"  file_actions\n"
"    A sequence of file action tuples.\n"
"  setpgroup\n"
"    The pgroup to use with the POSIX_SPAWN_SETPGROUP flag.\n"
"  resetids\n"
"    If the value is `True` the POSIX_SPAWN_RESETIDS will be activated.\n"
"  setsid\n"
"    If the value is `True` the POSIX_SPAWN_SETSID or POSIX_SPAWN_SETSID_NP will be activated.\n"
"  setsigmask\n"
"    The sigmask to use with the POSIX_SPAWN_SETSIGMASK flag.\n"
"  setsigdef\n"
"    The sigmask to use with the POSIX_SPAWN_SETSIGDEF flag.\n"
"  scheduler\n"
"    A tuple with the scheduler policy (optional) and parameters.");

#define OS_POSIX_SPAWNP_METHODDEF    \
    {"posix_spawnp", _PyCFunction_CAST(os_posix_spawnp), METH_FASTCALL|METH_KEYWORDS, os_posix_spawnp__doc__},

static TyObject *
os_posix_spawnp_impl(TyObject *module, path_t *path, TyObject *argv,
                     TyObject *env, TyObject *file_actions,
                     TyObject *setpgroup, int resetids, int setsid,
                     TyObject *setsigmask, TyObject *setsigdef,
                     TyObject *scheduler);

static TyObject *
os_posix_spawnp(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(file_actions), &_Ty_ID(setpgroup), &_Ty_ID(resetids), &_Ty_ID(setsid), &_Ty_ID(setsigmask), &_Ty_ID(setsigdef), &_Ty_ID(scheduler), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "", "file_actions", "setpgroup", "resetids", "setsid", "setsigmask", "setsigdef", "scheduler", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "posix_spawnp",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[10];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    path_t path = PATH_T_INITIALIZE_P("posix_spawnp", "path", 0, 0, 0, 0);
    TyObject *argv;
    TyObject *env;
    TyObject *file_actions = NULL;
    TyObject *setpgroup = NULL;
    int resetids = 0;
    int setsid = 0;
    TyObject *setsigmask = NULL;
    TyObject *setsigdef = NULL;
    TyObject *scheduler = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    argv = args[1];
    env = args[2];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        file_actions = args[3];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[4]) {
        setpgroup = args[4];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[5]) {
        resetids = PyObject_IsTrue(args[5]);
        if (resetids < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[6]) {
        setsid = PyObject_IsTrue(args[6]);
        if (setsid < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[7]) {
        setsigmask = args[7];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[8]) {
        setsigdef = args[8];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    scheduler = args[9];
skip_optional_kwonly:
    return_value = os_posix_spawnp_impl(module, &path, argv, env, file_actions, setpgroup, resetids, setsid, setsigmask, setsigdef, scheduler);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_POSIX_SPAWNP) */

#if (defined(HAVE_SPAWNV) || defined(HAVE_WSPAWNV) || defined(HAVE_RTPSPAWN))

TyDoc_STRVAR(os_spawnv__doc__,
"spawnv($module, mode, path, argv, /)\n"
"--\n"
"\n"
"Execute the program specified by path in a new process.\n"
"\n"
"  mode\n"
"    Mode of process creation.\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.");

#define OS_SPAWNV_METHODDEF    \
    {"spawnv", _PyCFunction_CAST(os_spawnv), METH_FASTCALL, os_spawnv__doc__},

static TyObject *
os_spawnv_impl(TyObject *module, int mode, path_t *path, TyObject *argv);

static TyObject *
os_spawnv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int mode;
    path_t path = PATH_T_INITIALIZE_P("spawnv", "path", 0, 0, 0, 0);
    TyObject *argv;

    if (!_TyArg_CheckPositional("spawnv", nargs, 3, 3)) {
        goto exit;
    }
    mode = TyLong_AsInt(args[0]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!path_converter(args[1], &path)) {
        goto exit;
    }
    argv = args[2];
    return_value = os_spawnv_impl(module, mode, &path, argv);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_SPAWNV) || defined(HAVE_WSPAWNV) || defined(HAVE_RTPSPAWN)) */

#if (defined(HAVE_SPAWNV) || defined(HAVE_WSPAWNV) || defined(HAVE_RTPSPAWN))

TyDoc_STRVAR(os_spawnve__doc__,
"spawnve($module, mode, path, argv, env, /)\n"
"--\n"
"\n"
"Execute the program specified by path in a new process.\n"
"\n"
"  mode\n"
"    Mode of process creation.\n"
"  path\n"
"    Path of executable file.\n"
"  argv\n"
"    Tuple or list of strings.\n"
"  env\n"
"    Dictionary of strings mapping to strings.");

#define OS_SPAWNVE_METHODDEF    \
    {"spawnve", _PyCFunction_CAST(os_spawnve), METH_FASTCALL, os_spawnve__doc__},

static TyObject *
os_spawnve_impl(TyObject *module, int mode, path_t *path, TyObject *argv,
                TyObject *env);

static TyObject *
os_spawnve(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int mode;
    path_t path = PATH_T_INITIALIZE_P("spawnve", "path", 0, 0, 0, 0);
    TyObject *argv;
    TyObject *env;

    if (!_TyArg_CheckPositional("spawnve", nargs, 4, 4)) {
        goto exit;
    }
    mode = TyLong_AsInt(args[0]);
    if (mode == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!path_converter(args[1], &path)) {
        goto exit;
    }
    argv = args[2];
    env = args[3];
    return_value = os_spawnve_impl(module, mode, &path, argv, env);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_SPAWNV) || defined(HAVE_WSPAWNV) || defined(HAVE_RTPSPAWN)) */

#if defined(HAVE_FORK)

TyDoc_STRVAR(os_register_at_fork__doc__,
"register_at_fork($module, /, *, before=<unrepresentable>,\n"
"                 after_in_child=<unrepresentable>,\n"
"                 after_in_parent=<unrepresentable>)\n"
"--\n"
"\n"
"Register callables to be called when forking a new process.\n"
"\n"
"  before\n"
"    A callable to be called in the parent before the fork() syscall.\n"
"  after_in_child\n"
"    A callable to be called in the child after fork().\n"
"  after_in_parent\n"
"    A callable to be called in the parent after fork().\n"
"\n"
"\'before\' callbacks are called in reverse order.\n"
"\'after_in_child\' and \'after_in_parent\' callbacks are called in order.");

#define OS_REGISTER_AT_FORK_METHODDEF    \
    {"register_at_fork", _PyCFunction_CAST(os_register_at_fork), METH_FASTCALL|METH_KEYWORDS, os_register_at_fork__doc__},

static TyObject *
os_register_at_fork_impl(TyObject *module, TyObject *before,
                         TyObject *after_in_child, TyObject *after_in_parent);

static TyObject *
os_register_at_fork(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(before), &_Ty_ID(after_in_child), &_Ty_ID(after_in_parent), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"before", "after_in_child", "after_in_parent", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "register_at_fork",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *before = NULL;
    TyObject *after_in_child = NULL;
    TyObject *after_in_parent = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[0]) {
        before = args[0];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[1]) {
        after_in_child = args[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    after_in_parent = args[2];
skip_optional_kwonly:
    return_value = os_register_at_fork_impl(module, before, after_in_child, after_in_parent);

exit:
    return return_value;
}

#endif /* defined(HAVE_FORK) */

#if defined(HAVE_FORK1)

TyDoc_STRVAR(os_fork1__doc__,
"fork1($module, /)\n"
"--\n"
"\n"
"Fork a child process with a single multiplexed (i.e., not bound) thread.\n"
"\n"
"Return 0 to child process and PID of child to parent process.");

#define OS_FORK1_METHODDEF    \
    {"fork1", (PyCFunction)os_fork1, METH_NOARGS, os_fork1__doc__},

static TyObject *
os_fork1_impl(TyObject *module);

static TyObject *
os_fork1(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_fork1_impl(module);
}

#endif /* defined(HAVE_FORK1) */

#if defined(HAVE_FORK)

TyDoc_STRVAR(os_fork__doc__,
"fork($module, /)\n"
"--\n"
"\n"
"Fork a child process.\n"
"\n"
"Return 0 to child process and PID of child to parent process.");

#define OS_FORK_METHODDEF    \
    {"fork", (PyCFunction)os_fork, METH_NOARGS, os_fork__doc__},

static TyObject *
os_fork_impl(TyObject *module);

static TyObject *
os_fork(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_fork_impl(module);
}

#endif /* defined(HAVE_FORK) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_GET_PRIORITY_MAX)

TyDoc_STRVAR(os_sched_get_priority_max__doc__,
"sched_get_priority_max($module, /, policy)\n"
"--\n"
"\n"
"Get the maximum scheduling priority for policy.");

#define OS_SCHED_GET_PRIORITY_MAX_METHODDEF    \
    {"sched_get_priority_max", _PyCFunction_CAST(os_sched_get_priority_max), METH_FASTCALL|METH_KEYWORDS, os_sched_get_priority_max__doc__},

static TyObject *
os_sched_get_priority_max_impl(TyObject *module, int policy);

static TyObject *
os_sched_get_priority_max(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(policy), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"policy", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sched_get_priority_max",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int policy;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    policy = TyLong_AsInt(args[0]);
    if (policy == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_sched_get_priority_max_impl(module, policy);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_GET_PRIORITY_MAX) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_GET_PRIORITY_MAX)

TyDoc_STRVAR(os_sched_get_priority_min__doc__,
"sched_get_priority_min($module, /, policy)\n"
"--\n"
"\n"
"Get the minimum scheduling priority for policy.");

#define OS_SCHED_GET_PRIORITY_MIN_METHODDEF    \
    {"sched_get_priority_min", _PyCFunction_CAST(os_sched_get_priority_min), METH_FASTCALL|METH_KEYWORDS, os_sched_get_priority_min__doc__},

static TyObject *
os_sched_get_priority_min_impl(TyObject *module, int policy);

static TyObject *
os_sched_get_priority_min(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(policy), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"policy", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sched_get_priority_min",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int policy;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    policy = TyLong_AsInt(args[0]);
    if (policy == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_sched_get_priority_min_impl(module, policy);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_GET_PRIORITY_MAX) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETSCHEDULER)

TyDoc_STRVAR(os_sched_getscheduler__doc__,
"sched_getscheduler($module, pid, /)\n"
"--\n"
"\n"
"Get the scheduling policy for the process identified by pid.\n"
"\n"
"Passing 0 for pid returns the scheduling policy for the calling process.");

#define OS_SCHED_GETSCHEDULER_METHODDEF    \
    {"sched_getscheduler", (PyCFunction)os_sched_getscheduler, METH_O, os_sched_getscheduler__doc__},

static TyObject *
os_sched_getscheduler_impl(TyObject *module, pid_t pid);

static TyObject *
os_sched_getscheduler(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    pid_t pid;

    pid = TyLong_AsPid(arg);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_sched_getscheduler_impl(module, pid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETSCHEDULER) */

#if defined(HAVE_SCHED_H) && (defined(HAVE_SCHED_SETPARAM) || defined(HAVE_SCHED_SETSCHEDULER) || defined(POSIX_SPAWN_SETSCHEDULER) || defined(POSIX_SPAWN_SETSCHEDPARAM))

TyDoc_STRVAR(os_sched_param__doc__,
"sched_param(sched_priority)\n"
"--\n"
"\n"
"Currently has only one field: sched_priority\n"
"\n"
"  sched_priority\n"
"    A scheduling parameter.");

static TyObject *
os_sched_param_impl(TyTypeObject *type, TyObject *sched_priority);

static TyObject *
os_sched_param(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(sched_priority), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"sched_priority", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sched_param",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *sched_priority;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    sched_priority = fastargs[0];
    return_value = os_sched_param_impl(type, sched_priority);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && (defined(HAVE_SCHED_SETPARAM) || defined(HAVE_SCHED_SETSCHEDULER) || defined(POSIX_SPAWN_SETSCHEDULER) || defined(POSIX_SPAWN_SETSCHEDPARAM)) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETSCHEDULER)

TyDoc_STRVAR(os_sched_setscheduler__doc__,
"sched_setscheduler($module, pid, policy, param, /)\n"
"--\n"
"\n"
"Set the scheduling policy for the process identified by pid.\n"
"\n"
"If pid is 0, the calling process is changed.\n"
"param is an instance of sched_param.");

#define OS_SCHED_SETSCHEDULER_METHODDEF    \
    {"sched_setscheduler", _PyCFunction_CAST(os_sched_setscheduler), METH_FASTCALL, os_sched_setscheduler__doc__},

static TyObject *
os_sched_setscheduler_impl(TyObject *module, pid_t pid, int policy,
                           TyObject *param_obj);

static TyObject *
os_sched_setscheduler(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    int policy;
    TyObject *param_obj;

    if (!_TyArg_CheckPositional("sched_setscheduler", nargs, 3, 3)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    policy = TyLong_AsInt(args[1]);
    if (policy == -1 && TyErr_Occurred()) {
        goto exit;
    }
    param_obj = args[2];
    return_value = os_sched_setscheduler_impl(module, pid, policy, param_obj);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETSCHEDULER) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETPARAM)

TyDoc_STRVAR(os_sched_getparam__doc__,
"sched_getparam($module, pid, /)\n"
"--\n"
"\n"
"Returns scheduling parameters for the process identified by pid.\n"
"\n"
"If pid is 0, returns parameters for the calling process.\n"
"Return value is an instance of sched_param.");

#define OS_SCHED_GETPARAM_METHODDEF    \
    {"sched_getparam", (PyCFunction)os_sched_getparam, METH_O, os_sched_getparam__doc__},

static TyObject *
os_sched_getparam_impl(TyObject *module, pid_t pid);

static TyObject *
os_sched_getparam(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    pid_t pid;

    pid = TyLong_AsPid(arg);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_sched_getparam_impl(module, pid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETPARAM) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETPARAM)

TyDoc_STRVAR(os_sched_setparam__doc__,
"sched_setparam($module, pid, param, /)\n"
"--\n"
"\n"
"Set scheduling parameters for the process identified by pid.\n"
"\n"
"If pid is 0, sets parameters for the calling process.\n"
"param should be an instance of sched_param.");

#define OS_SCHED_SETPARAM_METHODDEF    \
    {"sched_setparam", _PyCFunction_CAST(os_sched_setparam), METH_FASTCALL, os_sched_setparam__doc__},

static TyObject *
os_sched_setparam_impl(TyObject *module, pid_t pid, TyObject *param_obj);

static TyObject *
os_sched_setparam(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    TyObject *param_obj;

    if (!_TyArg_CheckPositional("sched_setparam", nargs, 2, 2)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    param_obj = args[1];
    return_value = os_sched_setparam_impl(module, pid, param_obj);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETPARAM) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_RR_GET_INTERVAL)

TyDoc_STRVAR(os_sched_rr_get_interval__doc__,
"sched_rr_get_interval($module, pid, /)\n"
"--\n"
"\n"
"Return the round-robin quantum for the process identified by pid, in seconds.\n"
"\n"
"Value returned is a float.");

#define OS_SCHED_RR_GET_INTERVAL_METHODDEF    \
    {"sched_rr_get_interval", (PyCFunction)os_sched_rr_get_interval, METH_O, os_sched_rr_get_interval__doc__},

static double
os_sched_rr_get_interval_impl(TyObject *module, pid_t pid);

static TyObject *
os_sched_rr_get_interval(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    pid_t pid;
    double _return_value;

    pid = TyLong_AsPid(arg);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_sched_rr_get_interval_impl(module, pid);
    if ((_return_value == -1.0) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyFloat_FromDouble(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_RR_GET_INTERVAL) */

#if defined(HAVE_SCHED_H)

TyDoc_STRVAR(os_sched_yield__doc__,
"sched_yield($module, /)\n"
"--\n"
"\n"
"Voluntarily relinquish the CPU.");

#define OS_SCHED_YIELD_METHODDEF    \
    {"sched_yield", (PyCFunction)os_sched_yield, METH_NOARGS, os_sched_yield__doc__},

static TyObject *
os_sched_yield_impl(TyObject *module);

static TyObject *
os_sched_yield(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_sched_yield_impl(module);
}

#endif /* defined(HAVE_SCHED_H) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETAFFINITY)

TyDoc_STRVAR(os_sched_setaffinity__doc__,
"sched_setaffinity($module, pid, mask, /)\n"
"--\n"
"\n"
"Set the CPU affinity of the process identified by pid to mask.\n"
"\n"
"mask should be an iterable of integers identifying CPUs.");

#define OS_SCHED_SETAFFINITY_METHODDEF    \
    {"sched_setaffinity", _PyCFunction_CAST(os_sched_setaffinity), METH_FASTCALL, os_sched_setaffinity__doc__},

static TyObject *
os_sched_setaffinity_impl(TyObject *module, pid_t pid, TyObject *mask);

static TyObject *
os_sched_setaffinity(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    TyObject *mask;

    if (!_TyArg_CheckPositional("sched_setaffinity", nargs, 2, 2)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    mask = args[1];
    return_value = os_sched_setaffinity_impl(module, pid, mask);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETAFFINITY) */

#if defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETAFFINITY)

TyDoc_STRVAR(os_sched_getaffinity__doc__,
"sched_getaffinity($module, pid, /)\n"
"--\n"
"\n"
"Return the affinity of the process identified by pid (or the current process if zero).\n"
"\n"
"The affinity is returned as a set of CPU identifiers.");

#define OS_SCHED_GETAFFINITY_METHODDEF    \
    {"sched_getaffinity", (PyCFunction)os_sched_getaffinity, METH_O, os_sched_getaffinity__doc__},

static TyObject *
os_sched_getaffinity_impl(TyObject *module, pid_t pid);

static TyObject *
os_sched_getaffinity(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    pid_t pid;

    pid = TyLong_AsPid(arg);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_sched_getaffinity_impl(module, pid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SCHED_H) && defined(HAVE_SCHED_SETAFFINITY) */

#if defined(HAVE_POSIX_OPENPT)

TyDoc_STRVAR(os_posix_openpt__doc__,
"posix_openpt($module, oflag, /)\n"
"--\n"
"\n"
"Open and return a file descriptor for a master pseudo-terminal device.\n"
"\n"
"Performs a posix_openpt() C function call. The oflag argument is used to\n"
"set file status flags and file access modes as specified in the manual page\n"
"of posix_openpt() of your system.");

#define OS_POSIX_OPENPT_METHODDEF    \
    {"posix_openpt", (PyCFunction)os_posix_openpt, METH_O, os_posix_openpt__doc__},

static int
os_posix_openpt_impl(TyObject *module, int oflag);

static TyObject *
os_posix_openpt(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int oflag;
    int _return_value;

    oflag = TyLong_AsInt(arg);
    if (oflag == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_posix_openpt_impl(module, oflag);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_POSIX_OPENPT) */

#if defined(HAVE_GRANTPT)

TyDoc_STRVAR(os_grantpt__doc__,
"grantpt($module, fd, /)\n"
"--\n"
"\n"
"Grant access to the slave pseudo-terminal device.\n"
"\n"
"  fd\n"
"    File descriptor of a master pseudo-terminal device.\n"
"\n"
"Performs a grantpt() C function call.");

#define OS_GRANTPT_METHODDEF    \
    {"grantpt", (PyCFunction)os_grantpt, METH_O, os_grantpt__doc__},

static TyObject *
os_grantpt_impl(TyObject *module, int fd);

static TyObject *
os_grantpt(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_grantpt_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_GRANTPT) */

#if defined(HAVE_UNLOCKPT)

TyDoc_STRVAR(os_unlockpt__doc__,
"unlockpt($module, fd, /)\n"
"--\n"
"\n"
"Unlock a pseudo-terminal master/slave pair.\n"
"\n"
"  fd\n"
"    File descriptor of a master pseudo-terminal device.\n"
"\n"
"Performs an unlockpt() C function call.");

#define OS_UNLOCKPT_METHODDEF    \
    {"unlockpt", (PyCFunction)os_unlockpt, METH_O, os_unlockpt__doc__},

static TyObject *
os_unlockpt_impl(TyObject *module, int fd);

static TyObject *
os_unlockpt(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_unlockpt_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_UNLOCKPT) */

#if (defined(HAVE_PTSNAME) || defined(HAVE_PTSNAME_R))

TyDoc_STRVAR(os_ptsname__doc__,
"ptsname($module, fd, /)\n"
"--\n"
"\n"
"Return the name of the slave pseudo-terminal device.\n"
"\n"
"  fd\n"
"    File descriptor of a master pseudo-terminal device.\n"
"\n"
"If the ptsname_r() C function is available, it is called;\n"
"otherwise, performs a ptsname() C function call.");

#define OS_PTSNAME_METHODDEF    \
    {"ptsname", (PyCFunction)os_ptsname, METH_O, os_ptsname__doc__},

static TyObject *
os_ptsname_impl(TyObject *module, int fd);

static TyObject *
os_ptsname(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_ptsname_impl(module, fd);

exit:
    return return_value;
}

#endif /* (defined(HAVE_PTSNAME) || defined(HAVE_PTSNAME_R)) */

#if (defined(HAVE_OPENPTY) || defined(HAVE__GETPTY) || defined(HAVE_DEV_PTMX))

TyDoc_STRVAR(os_openpty__doc__,
"openpty($module, /)\n"
"--\n"
"\n"
"Open a pseudo-terminal.\n"
"\n"
"Return a tuple of (master_fd, slave_fd) containing open file descriptors\n"
"for both the master and slave ends.");

#define OS_OPENPTY_METHODDEF    \
    {"openpty", (PyCFunction)os_openpty, METH_NOARGS, os_openpty__doc__},

static TyObject *
os_openpty_impl(TyObject *module);

static TyObject *
os_openpty(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_openpty_impl(module);
}

#endif /* (defined(HAVE_OPENPTY) || defined(HAVE__GETPTY) || defined(HAVE_DEV_PTMX)) */

#if (defined(HAVE_LOGIN_TTY) || defined(HAVE_FALLBACK_LOGIN_TTY))

TyDoc_STRVAR(os_login_tty__doc__,
"login_tty($module, fd, /)\n"
"--\n"
"\n"
"Prepare the tty of which fd is a file descriptor for a new login session.\n"
"\n"
"Make the calling process a session leader; make the tty the\n"
"controlling tty, the stdin, the stdout, and the stderr of the\n"
"calling process; close fd.");

#define OS_LOGIN_TTY_METHODDEF    \
    {"login_tty", (PyCFunction)os_login_tty, METH_O, os_login_tty__doc__},

static TyObject *
os_login_tty_impl(TyObject *module, int fd);

static TyObject *
os_login_tty(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_login_tty_impl(module, fd);

exit:
    return return_value;
}

#endif /* (defined(HAVE_LOGIN_TTY) || defined(HAVE_FALLBACK_LOGIN_TTY)) */

#if defined(HAVE_FORKPTY)

TyDoc_STRVAR(os_forkpty__doc__,
"forkpty($module, /)\n"
"--\n"
"\n"
"Fork a new process with a new pseudo-terminal as controlling tty.\n"
"\n"
"Returns a tuple of (pid, master_fd).\n"
"Like fork(), return pid of 0 to the child process,\n"
"and pid of child to the parent process.\n"
"To both, return fd of newly opened pseudo-terminal.");

#define OS_FORKPTY_METHODDEF    \
    {"forkpty", (PyCFunction)os_forkpty, METH_NOARGS, os_forkpty__doc__},

static TyObject *
os_forkpty_impl(TyObject *module);

static TyObject *
os_forkpty(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_forkpty_impl(module);
}

#endif /* defined(HAVE_FORKPTY) */

#if defined(HAVE_GETEGID)

TyDoc_STRVAR(os_getegid__doc__,
"getegid($module, /)\n"
"--\n"
"\n"
"Return the current process\'s effective group id.");

#define OS_GETEGID_METHODDEF    \
    {"getegid", (PyCFunction)os_getegid, METH_NOARGS, os_getegid__doc__},

static TyObject *
os_getegid_impl(TyObject *module);

static TyObject *
os_getegid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getegid_impl(module);
}

#endif /* defined(HAVE_GETEGID) */

#if defined(HAVE_GETEUID)

TyDoc_STRVAR(os_geteuid__doc__,
"geteuid($module, /)\n"
"--\n"
"\n"
"Return the current process\'s effective user id.");

#define OS_GETEUID_METHODDEF    \
    {"geteuid", (PyCFunction)os_geteuid, METH_NOARGS, os_geteuid__doc__},

static TyObject *
os_geteuid_impl(TyObject *module);

static TyObject *
os_geteuid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_geteuid_impl(module);
}

#endif /* defined(HAVE_GETEUID) */

#if defined(HAVE_GETGID)

TyDoc_STRVAR(os_getgid__doc__,
"getgid($module, /)\n"
"--\n"
"\n"
"Return the current process\'s group id.");

#define OS_GETGID_METHODDEF    \
    {"getgid", (PyCFunction)os_getgid, METH_NOARGS, os_getgid__doc__},

static TyObject *
os_getgid_impl(TyObject *module);

static TyObject *
os_getgid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getgid_impl(module);
}

#endif /* defined(HAVE_GETGID) */

#if defined(HAVE_GETPID)

TyDoc_STRVAR(os_getpid__doc__,
"getpid($module, /)\n"
"--\n"
"\n"
"Return the current process id.");

#define OS_GETPID_METHODDEF    \
    {"getpid", (PyCFunction)os_getpid, METH_NOARGS, os_getpid__doc__},

static TyObject *
os_getpid_impl(TyObject *module);

static TyObject *
os_getpid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getpid_impl(module);
}

#endif /* defined(HAVE_GETPID) */

#if defined(HAVE_GETGROUPLIST) && defined(__APPLE__)

TyDoc_STRVAR(os_getgrouplist__doc__,
"getgrouplist($module, user, group, /)\n"
"--\n"
"\n"
"Returns a list of groups to which a user belongs.\n"
"\n"
"  user\n"
"    username to lookup\n"
"  group\n"
"    base group id of the user");

#define OS_GETGROUPLIST_METHODDEF    \
    {"getgrouplist", _PyCFunction_CAST(os_getgrouplist), METH_FASTCALL, os_getgrouplist__doc__},

static TyObject *
os_getgrouplist_impl(TyObject *module, const char *user, int basegid);

static TyObject *
os_getgrouplist(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *user;
    int basegid;

    if (!_TyArg_CheckPositional("getgrouplist", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("getgrouplist", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t user_length;
    user = TyUnicode_AsUTF8AndSize(args[0], &user_length);
    if (user == NULL) {
        goto exit;
    }
    if (strlen(user) != (size_t)user_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    basegid = TyLong_AsInt(args[1]);
    if (basegid == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_getgrouplist_impl(module, user, basegid);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETGROUPLIST) && defined(__APPLE__) */

#if defined(HAVE_GETGROUPLIST) && !defined(__APPLE__)

TyDoc_STRVAR(os_getgrouplist__doc__,
"getgrouplist($module, user, group, /)\n"
"--\n"
"\n"
"Returns a list of groups to which a user belongs.\n"
"\n"
"  user\n"
"    username to lookup\n"
"  group\n"
"    base group id of the user");

#define OS_GETGROUPLIST_METHODDEF    \
    {"getgrouplist", _PyCFunction_CAST(os_getgrouplist), METH_FASTCALL, os_getgrouplist__doc__},

static TyObject *
os_getgrouplist_impl(TyObject *module, const char *user, gid_t basegid);

static TyObject *
os_getgrouplist(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    const char *user;
    gid_t basegid;

    if (!_TyArg_CheckPositional("getgrouplist", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("getgrouplist", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t user_length;
    user = TyUnicode_AsUTF8AndSize(args[0], &user_length);
    if (user == NULL) {
        goto exit;
    }
    if (strlen(user) != (size_t)user_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[1], &basegid)) {
        goto exit;
    }
    return_value = os_getgrouplist_impl(module, user, basegid);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETGROUPLIST) && !defined(__APPLE__) */

#if defined(HAVE_GETGROUPS)

TyDoc_STRVAR(os_getgroups__doc__,
"getgroups($module, /)\n"
"--\n"
"\n"
"Return list of supplemental group IDs for the process.");

#define OS_GETGROUPS_METHODDEF    \
    {"getgroups", (PyCFunction)os_getgroups, METH_NOARGS, os_getgroups__doc__},

static TyObject *
os_getgroups_impl(TyObject *module);

static TyObject *
os_getgroups(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getgroups_impl(module);
}

#endif /* defined(HAVE_GETGROUPS) */

#if defined(HAVE_INITGROUPS) && defined(__APPLE__)

TyDoc_STRVAR(os_initgroups__doc__,
"initgroups($module, username, gid, /)\n"
"--\n"
"\n"
"Initialize the group access list.\n"
"\n"
"Call the system initgroups() to initialize the group access list with all of\n"
"the groups of which the specified username is a member, plus the specified\n"
"group id.");

#define OS_INITGROUPS_METHODDEF    \
    {"initgroups", _PyCFunction_CAST(os_initgroups), METH_FASTCALL, os_initgroups__doc__},

static TyObject *
os_initgroups_impl(TyObject *module, TyObject *oname, int gid);

static TyObject *
os_initgroups(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *oname = NULL;
    int gid;

    if (!_TyArg_CheckPositional("initgroups", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[0], &oname)) {
        goto exit;
    }
    gid = TyLong_AsInt(args[1]);
    if (gid == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_initgroups_impl(module, oname, gid);

exit:
    /* Cleanup for oname */
    Ty_XDECREF(oname);

    return return_value;
}

#endif /* defined(HAVE_INITGROUPS) && defined(__APPLE__) */

#if defined(HAVE_INITGROUPS) && !defined(__APPLE__)

TyDoc_STRVAR(os_initgroups__doc__,
"initgroups($module, username, gid, /)\n"
"--\n"
"\n"
"Initialize the group access list.\n"
"\n"
"Call the system initgroups() to initialize the group access list with all of\n"
"the groups of which the specified username is a member, plus the specified\n"
"group id.");

#define OS_INITGROUPS_METHODDEF    \
    {"initgroups", _PyCFunction_CAST(os_initgroups), METH_FASTCALL, os_initgroups__doc__},

static TyObject *
os_initgroups_impl(TyObject *module, TyObject *oname, gid_t gid);

static TyObject *
os_initgroups(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *oname = NULL;
    gid_t gid;

    if (!_TyArg_CheckPositional("initgroups", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[0], &oname)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[1], &gid)) {
        goto exit;
    }
    return_value = os_initgroups_impl(module, oname, gid);

exit:
    /* Cleanup for oname */
    Ty_XDECREF(oname);

    return return_value;
}

#endif /* defined(HAVE_INITGROUPS) && !defined(__APPLE__) */

#if defined(HAVE_GETPGID)

TyDoc_STRVAR(os_getpgid__doc__,
"getpgid($module, /, pid)\n"
"--\n"
"\n"
"Call the system call getpgid(), and return the result.");

#define OS_GETPGID_METHODDEF    \
    {"getpgid", _PyCFunction_CAST(os_getpgid), METH_FASTCALL|METH_KEYWORDS, os_getpgid__doc__},

static TyObject *
os_getpgid_impl(TyObject *module, pid_t pid);

static TyObject *
os_getpgid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(pid), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pid", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getpgid",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    pid_t pid;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_getpgid_impl(module, pid);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETPGID) */

#if defined(HAVE_GETPGRP)

TyDoc_STRVAR(os_getpgrp__doc__,
"getpgrp($module, /)\n"
"--\n"
"\n"
"Return the current process group id.");

#define OS_GETPGRP_METHODDEF    \
    {"getpgrp", (PyCFunction)os_getpgrp, METH_NOARGS, os_getpgrp__doc__},

static TyObject *
os_getpgrp_impl(TyObject *module);

static TyObject *
os_getpgrp(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getpgrp_impl(module);
}

#endif /* defined(HAVE_GETPGRP) */

#if defined(HAVE_SETPGRP)

TyDoc_STRVAR(os_setpgrp__doc__,
"setpgrp($module, /)\n"
"--\n"
"\n"
"Make the current process the leader of its process group.");

#define OS_SETPGRP_METHODDEF    \
    {"setpgrp", (PyCFunction)os_setpgrp, METH_NOARGS, os_setpgrp__doc__},

static TyObject *
os_setpgrp_impl(TyObject *module);

static TyObject *
os_setpgrp(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_setpgrp_impl(module);
}

#endif /* defined(HAVE_SETPGRP) */

#if defined(HAVE_GETPPID)

TyDoc_STRVAR(os_getppid__doc__,
"getppid($module, /)\n"
"--\n"
"\n"
"Return the parent\'s process id.\n"
"\n"
"If the parent process has already exited, Windows machines will still\n"
"return its id; others systems will return the id of the \'init\' process (1).");

#define OS_GETPPID_METHODDEF    \
    {"getppid", (PyCFunction)os_getppid, METH_NOARGS, os_getppid__doc__},

static TyObject *
os_getppid_impl(TyObject *module);

static TyObject *
os_getppid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getppid_impl(module);
}

#endif /* defined(HAVE_GETPPID) */

#if defined(HAVE_GETLOGIN)

TyDoc_STRVAR(os_getlogin__doc__,
"getlogin($module, /)\n"
"--\n"
"\n"
"Return the actual login name.");

#define OS_GETLOGIN_METHODDEF    \
    {"getlogin", (PyCFunction)os_getlogin, METH_NOARGS, os_getlogin__doc__},

static TyObject *
os_getlogin_impl(TyObject *module);

static TyObject *
os_getlogin(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getlogin_impl(module);
}

#endif /* defined(HAVE_GETLOGIN) */

#if defined(HAVE_GETUID)

TyDoc_STRVAR(os_getuid__doc__,
"getuid($module, /)\n"
"--\n"
"\n"
"Return the current process\'s user id.");

#define OS_GETUID_METHODDEF    \
    {"getuid", (PyCFunction)os_getuid, METH_NOARGS, os_getuid__doc__},

static TyObject *
os_getuid_impl(TyObject *module);

static TyObject *
os_getuid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getuid_impl(module);
}

#endif /* defined(HAVE_GETUID) */

#if defined(HAVE_KILL)

TyDoc_STRVAR(os_kill__doc__,
"kill($module, pid, signal, /)\n"
"--\n"
"\n"
"Kill a process with a signal.");

#define OS_KILL_METHODDEF    \
    {"kill", _PyCFunction_CAST(os_kill), METH_FASTCALL, os_kill__doc__},

static TyObject *
os_kill_impl(TyObject *module, pid_t pid, Ty_ssize_t signal);

static TyObject *
os_kill(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    Ty_ssize_t signal;

    if (!_TyArg_CheckPositional("kill", nargs, 2, 2)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        signal = ival;
    }
    return_value = os_kill_impl(module, pid, signal);

exit:
    return return_value;
}

#endif /* defined(HAVE_KILL) */

#if defined(HAVE_KILLPG)

TyDoc_STRVAR(os_killpg__doc__,
"killpg($module, pgid, signal, /)\n"
"--\n"
"\n"
"Kill a process group with a signal.");

#define OS_KILLPG_METHODDEF    \
    {"killpg", _PyCFunction_CAST(os_killpg), METH_FASTCALL, os_killpg__doc__},

static TyObject *
os_killpg_impl(TyObject *module, pid_t pgid, int signal);

static TyObject *
os_killpg(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pgid;
    int signal;

    if (!_TyArg_CheckPositional("killpg", nargs, 2, 2)) {
        goto exit;
    }
    pgid = TyLong_AsPid(args[0]);
    if (pgid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    signal = TyLong_AsInt(args[1]);
    if (signal == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_killpg_impl(module, pgid, signal);

exit:
    return return_value;
}

#endif /* defined(HAVE_KILLPG) */

#if defined(HAVE_PLOCK)

TyDoc_STRVAR(os_plock__doc__,
"plock($module, op, /)\n"
"--\n"
"\n"
"Lock program segments into memory.\");");

#define OS_PLOCK_METHODDEF    \
    {"plock", (PyCFunction)os_plock, METH_O, os_plock__doc__},

static TyObject *
os_plock_impl(TyObject *module, int op);

static TyObject *
os_plock(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int op;

    op = TyLong_AsInt(arg);
    if (op == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_plock_impl(module, op);

exit:
    return return_value;
}

#endif /* defined(HAVE_PLOCK) */

#if defined(HAVE_SETUID)

TyDoc_STRVAR(os_setuid__doc__,
"setuid($module, uid, /)\n"
"--\n"
"\n"
"Set the current process\'s user id.");

#define OS_SETUID_METHODDEF    \
    {"setuid", (PyCFunction)os_setuid, METH_O, os_setuid__doc__},

static TyObject *
os_setuid_impl(TyObject *module, uid_t uid);

static TyObject *
os_setuid(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    uid_t uid;

    if (!_Ty_Uid_Converter(arg, &uid)) {
        goto exit;
    }
    return_value = os_setuid_impl(module, uid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETUID) */

#if defined(HAVE_SETEUID)

TyDoc_STRVAR(os_seteuid__doc__,
"seteuid($module, euid, /)\n"
"--\n"
"\n"
"Set the current process\'s effective user id.");

#define OS_SETEUID_METHODDEF    \
    {"seteuid", (PyCFunction)os_seteuid, METH_O, os_seteuid__doc__},

static TyObject *
os_seteuid_impl(TyObject *module, uid_t euid);

static TyObject *
os_seteuid(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    uid_t euid;

    if (!_Ty_Uid_Converter(arg, &euid)) {
        goto exit;
    }
    return_value = os_seteuid_impl(module, euid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETEUID) */

#if defined(HAVE_SETEGID)

TyDoc_STRVAR(os_setegid__doc__,
"setegid($module, egid, /)\n"
"--\n"
"\n"
"Set the current process\'s effective group id.");

#define OS_SETEGID_METHODDEF    \
    {"setegid", (PyCFunction)os_setegid, METH_O, os_setegid__doc__},

static TyObject *
os_setegid_impl(TyObject *module, gid_t egid);

static TyObject *
os_setegid(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    gid_t egid;

    if (!_Ty_Gid_Converter(arg, &egid)) {
        goto exit;
    }
    return_value = os_setegid_impl(module, egid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETEGID) */

#if defined(HAVE_SETREUID)

TyDoc_STRVAR(os_setreuid__doc__,
"setreuid($module, ruid, euid, /)\n"
"--\n"
"\n"
"Set the current process\'s real and effective user ids.");

#define OS_SETREUID_METHODDEF    \
    {"setreuid", _PyCFunction_CAST(os_setreuid), METH_FASTCALL, os_setreuid__doc__},

static TyObject *
os_setreuid_impl(TyObject *module, uid_t ruid, uid_t euid);

static TyObject *
os_setreuid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    uid_t ruid;
    uid_t euid;

    if (!_TyArg_CheckPositional("setreuid", nargs, 2, 2)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[0], &ruid)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[1], &euid)) {
        goto exit;
    }
    return_value = os_setreuid_impl(module, ruid, euid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETREUID) */

#if defined(HAVE_SETREGID)

TyDoc_STRVAR(os_setregid__doc__,
"setregid($module, rgid, egid, /)\n"
"--\n"
"\n"
"Set the current process\'s real and effective group ids.");

#define OS_SETREGID_METHODDEF    \
    {"setregid", _PyCFunction_CAST(os_setregid), METH_FASTCALL, os_setregid__doc__},

static TyObject *
os_setregid_impl(TyObject *module, gid_t rgid, gid_t egid);

static TyObject *
os_setregid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    gid_t rgid;
    gid_t egid;

    if (!_TyArg_CheckPositional("setregid", nargs, 2, 2)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[0], &rgid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[1], &egid)) {
        goto exit;
    }
    return_value = os_setregid_impl(module, rgid, egid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETREGID) */

#if defined(HAVE_SETGID)

TyDoc_STRVAR(os_setgid__doc__,
"setgid($module, gid, /)\n"
"--\n"
"\n"
"Set the current process\'s group id.");

#define OS_SETGID_METHODDEF    \
    {"setgid", (PyCFunction)os_setgid, METH_O, os_setgid__doc__},

static TyObject *
os_setgid_impl(TyObject *module, gid_t gid);

static TyObject *
os_setgid(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    gid_t gid;

    if (!_Ty_Gid_Converter(arg, &gid)) {
        goto exit;
    }
    return_value = os_setgid_impl(module, gid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETGID) */

#if defined(HAVE_SETGROUPS)

TyDoc_STRVAR(os_setgroups__doc__,
"setgroups($module, groups, /)\n"
"--\n"
"\n"
"Set the groups of the current process to list.");

#define OS_SETGROUPS_METHODDEF    \
    {"setgroups", (PyCFunction)os_setgroups, METH_O, os_setgroups__doc__},

#endif /* defined(HAVE_SETGROUPS) */

#if defined(HAVE_WAIT3)

TyDoc_STRVAR(os_wait3__doc__,
"wait3($module, /, options)\n"
"--\n"
"\n"
"Wait for completion of a child process.\n"
"\n"
"Returns a tuple of information about the child process:\n"
"  (pid, status, rusage)");

#define OS_WAIT3_METHODDEF    \
    {"wait3", _PyCFunction_CAST(os_wait3), METH_FASTCALL|METH_KEYWORDS, os_wait3__doc__},

static TyObject *
os_wait3_impl(TyObject *module, int options);

static TyObject *
os_wait3(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(options), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"options", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "wait3",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int options;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    options = TyLong_AsInt(args[0]);
    if (options == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_wait3_impl(module, options);

exit:
    return return_value;
}

#endif /* defined(HAVE_WAIT3) */

#if defined(HAVE_WAIT4)

TyDoc_STRVAR(os_wait4__doc__,
"wait4($module, /, pid, options)\n"
"--\n"
"\n"
"Wait for completion of a specific child process.\n"
"\n"
"Returns a tuple of information about the child process:\n"
"  (pid, status, rusage)");

#define OS_WAIT4_METHODDEF    \
    {"wait4", _PyCFunction_CAST(os_wait4), METH_FASTCALL|METH_KEYWORDS, os_wait4__doc__},

static TyObject *
os_wait4_impl(TyObject *module, pid_t pid, int options);

static TyObject *
os_wait4(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(pid), &_Ty_ID(options), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pid", "options", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "wait4",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    pid_t pid;
    int options;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    options = TyLong_AsInt(args[1]);
    if (options == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_wait4_impl(module, pid, options);

exit:
    return return_value;
}

#endif /* defined(HAVE_WAIT4) */

#if defined(HAVE_WAITID)

TyDoc_STRVAR(os_waitid__doc__,
"waitid($module, idtype, id, options, /)\n"
"--\n"
"\n"
"Returns the result of waiting for a process or processes.\n"
"\n"
"  idtype\n"
"    Must be one of be P_PID, P_PGID or P_ALL.\n"
"  id\n"
"    The id to wait on.\n"
"  options\n"
"    Constructed from the ORing of one or more of WEXITED, WSTOPPED\n"
"    or WCONTINUED and additionally may be ORed with WNOHANG or WNOWAIT.\n"
"\n"
"Returns either waitid_result or None if WNOHANG is specified and there are\n"
"no children in a waitable state.");

#define OS_WAITID_METHODDEF    \
    {"waitid", _PyCFunction_CAST(os_waitid), METH_FASTCALL, os_waitid__doc__},

static TyObject *
os_waitid_impl(TyObject *module, idtype_t idtype, id_t id, int options);

static TyObject *
os_waitid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    idtype_t idtype;
    id_t id;
    int options;

    if (!_TyArg_CheckPositional("waitid", nargs, 3, 3)) {
        goto exit;
    }
    if (!idtype_t_converter(args[0], &idtype)) {
        goto exit;
    }
    id = (id_t)TyLong_AsPid(args[1]);
    if (id == (id_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    options = TyLong_AsInt(args[2]);
    if (options == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_waitid_impl(module, idtype, id, options);

exit:
    return return_value;
}

#endif /* defined(HAVE_WAITID) */

#if defined(HAVE_WAITPID)

TyDoc_STRVAR(os_waitpid__doc__,
"waitpid($module, pid, options, /)\n"
"--\n"
"\n"
"Wait for completion of a given child process.\n"
"\n"
"Returns a tuple of information regarding the child process:\n"
"    (pid, status)\n"
"\n"
"The options argument is ignored on Windows.");

#define OS_WAITPID_METHODDEF    \
    {"waitpid", _PyCFunction_CAST(os_waitpid), METH_FASTCALL, os_waitpid__doc__},

static TyObject *
os_waitpid_impl(TyObject *module, pid_t pid, int options);

static TyObject *
os_waitpid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    int options;

    if (!_TyArg_CheckPositional("waitpid", nargs, 2, 2)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    options = TyLong_AsInt(args[1]);
    if (options == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_waitpid_impl(module, pid, options);

exit:
    return return_value;
}

#endif /* defined(HAVE_WAITPID) */

#if !defined(HAVE_WAITPID) && defined(HAVE_CWAIT)

TyDoc_STRVAR(os_waitpid__doc__,
"waitpid($module, pid, options, /)\n"
"--\n"
"\n"
"Wait for completion of a given process.\n"
"\n"
"Returns a tuple of information regarding the process:\n"
"    (pid, status << 8)\n"
"\n"
"The options argument is ignored on Windows.");

#define OS_WAITPID_METHODDEF    \
    {"waitpid", _PyCFunction_CAST(os_waitpid), METH_FASTCALL, os_waitpid__doc__},

static TyObject *
os_waitpid_impl(TyObject *module, intptr_t pid, int options);

static TyObject *
os_waitpid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    intptr_t pid;
    int options;

    if (!_TyArg_CheckPositional("waitpid", nargs, 2, 2)) {
        goto exit;
    }
    pid = (intptr_t)TyLong_AsVoidPtr(args[0]);
    if (!pid && TyErr_Occurred()) {
        goto exit;
    }
    options = TyLong_AsInt(args[1]);
    if (options == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_waitpid_impl(module, pid, options);

exit:
    return return_value;
}

#endif /* !defined(HAVE_WAITPID) && defined(HAVE_CWAIT) */

#if defined(HAVE_WAIT)

TyDoc_STRVAR(os_wait__doc__,
"wait($module, /)\n"
"--\n"
"\n"
"Wait for completion of a child process.\n"
"\n"
"Returns a tuple of information about the child process:\n"
"    (pid, status)");

#define OS_WAIT_METHODDEF    \
    {"wait", (PyCFunction)os_wait, METH_NOARGS, os_wait__doc__},

static TyObject *
os_wait_impl(TyObject *module);

static TyObject *
os_wait(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_wait_impl(module);
}

#endif /* defined(HAVE_WAIT) */

#if (defined(__linux__) && defined(__NR_pidfd_open) && !(defined(__ANDROID__) && __ANDROID_API__ < 31))

TyDoc_STRVAR(os_pidfd_open__doc__,
"pidfd_open($module, /, pid, flags=0)\n"
"--\n"
"\n"
"Return a file descriptor referring to the process *pid*.\n"
"\n"
"The descriptor can be used to perform process management without races and\n"
"signals.");

#define OS_PIDFD_OPEN_METHODDEF    \
    {"pidfd_open", _PyCFunction_CAST(os_pidfd_open), METH_FASTCALL|METH_KEYWORDS, os_pidfd_open__doc__},

static TyObject *
os_pidfd_open_impl(TyObject *module, pid_t pid, unsigned int flags);

static TyObject *
os_pidfd_open(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(pid), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"pid", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "pidfd_open",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    pid_t pid;
    unsigned int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (!_TyLong_UnsignedInt_Converter(args[1], &flags)) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_pidfd_open_impl(module, pid, flags);

exit:
    return return_value;
}

#endif /* (defined(__linux__) && defined(__NR_pidfd_open) && !(defined(__ANDROID__) && __ANDROID_API__ < 31)) */

#if defined(HAVE_SETNS)

TyDoc_STRVAR(os_setns__doc__,
"setns($module, /, fd, nstype=0)\n"
"--\n"
"\n"
"Move the calling thread into different namespaces.\n"
"\n"
"  fd\n"
"    A file descriptor to a namespace.\n"
"  nstype\n"
"    Type of namespace.");

#define OS_SETNS_METHODDEF    \
    {"setns", _PyCFunction_CAST(os_setns), METH_FASTCALL|METH_KEYWORDS, os_setns__doc__},

static TyObject *
os_setns_impl(TyObject *module, int fd, int nstype);

static TyObject *
os_setns(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), &_Ty_ID(nstype), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", "nstype", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "setns",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    int fd;
    int nstype = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    nstype = TyLong_AsInt(args[1]);
    if (nstype == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_setns_impl(module, fd, nstype);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETNS) */

#if defined(HAVE_UNSHARE)

TyDoc_STRVAR(os_unshare__doc__,
"unshare($module, /, flags)\n"
"--\n"
"\n"
"Disassociate parts of a process (or thread) execution context.\n"
"\n"
"  flags\n"
"    Namespaces to be unshared.");

#define OS_UNSHARE_METHODDEF    \
    {"unshare", _PyCFunction_CAST(os_unshare), METH_FASTCALL|METH_KEYWORDS, os_unshare__doc__},

static TyObject *
os_unshare_impl(TyObject *module, int flags);

static TyObject *
os_unshare(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "unshare",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int flags;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    flags = TyLong_AsInt(args[0]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_unshare_impl(module, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_UNSHARE) */

#if (defined(HAVE_READLINK) || defined(MS_WINDOWS))

TyDoc_STRVAR(os_readlink__doc__,
"readlink($module, /, path, *, dir_fd=None)\n"
"--\n"
"\n"
"Return a string representing the path to which the symbolic link points.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"and path should be relative; path will then be relative to that directory.\n"
"\n"
"dir_fd may not be implemented on your platform.  If it is unavailable,\n"
"using it will raise a NotImplementedError.");

#define OS_READLINK_METHODDEF    \
    {"readlink", _PyCFunction_CAST(os_readlink), METH_FASTCALL|METH_KEYWORDS, os_readlink__doc__},

static TyObject *
os_readlink_impl(TyObject *module, path_t *path, int dir_fd);

static TyObject *
os_readlink(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "readlink",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("readlink", "path", 0, 0, 0, 0);
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!READLINKAT_DIR_FD_CONVERTER(args[1], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_readlink_impl(module, &path, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_READLINK) || defined(MS_WINDOWS)) */

#if defined(HAVE_SYMLINK)

TyDoc_STRVAR(os_symlink__doc__,
"symlink($module, /, src, dst, target_is_directory=False, *, dir_fd=None)\n"
"--\n"
"\n"
"Create a symbolic link pointing to src named dst.\n"
"\n"
"target_is_directory is required on Windows if the target is to be\n"
"  interpreted as a directory.  (On Windows, symlink requires\n"
"  Windows 6.0 or greater, and raises a NotImplementedError otherwise.)\n"
"  target_is_directory is ignored on non-Windows platforms.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_SYMLINK_METHODDEF    \
    {"symlink", _PyCFunction_CAST(os_symlink), METH_FASTCALL|METH_KEYWORDS, os_symlink__doc__},

static TyObject *
os_symlink_impl(TyObject *module, path_t *src, path_t *dst,
                int target_is_directory, int dir_fd);

static TyObject *
os_symlink(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(target_is_directory), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "target_is_directory", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "symlink",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t src = PATH_T_INITIALIZE_P("symlink", "src", 0, 0, 0, 0);
    path_t dst = PATH_T_INITIALIZE_P("symlink", "dst", 0, 0, 0, 0);
    int target_is_directory = 0;
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &src)) {
        goto exit;
    }
    if (!path_converter(args[1], &dst)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        target_is_directory = PyObject_IsTrue(args[2]);
        if (target_is_directory < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!SYMLINKAT_DIR_FD_CONVERTER(args[3], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_symlink_impl(module, &src, &dst, target_is_directory, dir_fd);

exit:
    /* Cleanup for src */
    path_cleanup(&src);
    /* Cleanup for dst */
    path_cleanup(&dst);

    return return_value;
}

#endif /* defined(HAVE_SYMLINK) */

TyDoc_STRVAR(os_times__doc__,
"times($module, /)\n"
"--\n"
"\n"
"Return a collection containing process timing information.\n"
"\n"
"The object returned behaves like a named tuple with these fields:\n"
"  (utime, stime, cutime, cstime, elapsed_time)\n"
"All fields are floating-point numbers.");

#define OS_TIMES_METHODDEF    \
    {"times", (PyCFunction)os_times, METH_NOARGS, os_times__doc__},

static TyObject *
os_times_impl(TyObject *module);

static TyObject *
os_times(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_times_impl(module);
}

#if defined(HAVE_TIMERFD_CREATE)

TyDoc_STRVAR(os_timerfd_create__doc__,
"timerfd_create($module, clockid, /, *, flags=0)\n"
"--\n"
"\n"
"Create and return a timer file descriptor.\n"
"\n"
"  clockid\n"
"    A valid clock ID constant as timer file descriptor.\n"
"\n"
"    time.CLOCK_REALTIME\n"
"    time.CLOCK_MONOTONIC\n"
"    time.CLOCK_BOOTTIME\n"
"  flags\n"
"    0 or a bit mask of os.TFD_NONBLOCK or os.TFD_CLOEXEC.\n"
"\n"
"    os.TFD_NONBLOCK\n"
"        If *TFD_NONBLOCK* is set as a flag, read doesn\'t blocks.\n"
"        If *TFD_NONBLOCK* is not set as a flag, read block until the timer fires.\n"
"\n"
"    os.TFD_CLOEXEC\n"
"        If *TFD_CLOEXEC* is set as a flag, enable the close-on-exec flag");

#define OS_TIMERFD_CREATE_METHODDEF    \
    {"timerfd_create", _PyCFunction_CAST(os_timerfd_create), METH_FASTCALL|METH_KEYWORDS, os_timerfd_create__doc__},

static TyObject *
os_timerfd_create_impl(TyObject *module, int clockid, int flags);

static TyObject *
os_timerfd_create(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "timerfd_create",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    int clockid;
    int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    clockid = TyLong_AsInt(args[0]);
    if (clockid == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_timerfd_create_impl(module, clockid, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_TIMERFD_CREATE) */

#if defined(HAVE_TIMERFD_CREATE)

TyDoc_STRVAR(os_timerfd_settime__doc__,
"timerfd_settime($module, fd, /, *, flags=0, initial=0.0, interval=0.0)\n"
"--\n"
"\n"
"Alter a timer file descriptor\'s internal timer in seconds.\n"
"\n"
"  fd\n"
"    A timer file descriptor.\n"
"  flags\n"
"    0 or a bit mask of TFD_TIMER_ABSTIME or TFD_TIMER_CANCEL_ON_SET.\n"
"  initial\n"
"    The initial expiration time, in seconds.\n"
"  interval\n"
"    The timer\'s interval, in seconds.");

#define OS_TIMERFD_SETTIME_METHODDEF    \
    {"timerfd_settime", _PyCFunction_CAST(os_timerfd_settime), METH_FASTCALL|METH_KEYWORDS, os_timerfd_settime__doc__},

static TyObject *
os_timerfd_settime_impl(TyObject *module, int fd, int flags,
                        double initial_double, double interval_double);

static TyObject *
os_timerfd_settime(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(flags), &_Ty_ID(initial), &_Ty_ID(interval), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "flags", "initial", "interval", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "timerfd_settime",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    int fd;
    int flags = 0;
    double initial_double = 0.0;
    double interval_double = 0.0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        flags = TyLong_AsInt(args[1]);
        if (flags == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        if (TyFloat_CheckExact(args[2])) {
            initial_double = TyFloat_AS_DOUBLE(args[2]);
        }
        else
        {
            initial_double = TyFloat_AsDouble(args[2]);
            if (initial_double == -1.0 && TyErr_Occurred()) {
                goto exit;
            }
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (TyFloat_CheckExact(args[3])) {
        interval_double = TyFloat_AS_DOUBLE(args[3]);
    }
    else
    {
        interval_double = TyFloat_AsDouble(args[3]);
        if (interval_double == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
skip_optional_kwonly:
    return_value = os_timerfd_settime_impl(module, fd, flags, initial_double, interval_double);

exit:
    return return_value;
}

#endif /* defined(HAVE_TIMERFD_CREATE) */

#if defined(HAVE_TIMERFD_CREATE)

TyDoc_STRVAR(os_timerfd_settime_ns__doc__,
"timerfd_settime_ns($module, fd, /, *, flags=0, initial=0, interval=0)\n"
"--\n"
"\n"
"Alter a timer file descriptor\'s internal timer in nanoseconds.\n"
"\n"
"  fd\n"
"    A timer file descriptor.\n"
"  flags\n"
"    0 or a bit mask of TFD_TIMER_ABSTIME or TFD_TIMER_CANCEL_ON_SET.\n"
"  initial\n"
"    initial expiration timing in seconds.\n"
"  interval\n"
"    interval for the timer in seconds.");

#define OS_TIMERFD_SETTIME_NS_METHODDEF    \
    {"timerfd_settime_ns", _PyCFunction_CAST(os_timerfd_settime_ns), METH_FASTCALL|METH_KEYWORDS, os_timerfd_settime_ns__doc__},

static TyObject *
os_timerfd_settime_ns_impl(TyObject *module, int fd, int flags,
                           long long initial, long long interval);

static TyObject *
os_timerfd_settime_ns(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(flags), &_Ty_ID(initial), &_Ty_ID(interval), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "flags", "initial", "interval", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "timerfd_settime_ns",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    int fd;
    int flags = 0;
    long long initial = 0;
    long long interval = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        flags = TyLong_AsInt(args[1]);
        if (flags == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        initial = TyLong_AsLongLong(args[2]);
        if (initial == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    interval = TyLong_AsLongLong(args[3]);
    if (interval == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_timerfd_settime_ns_impl(module, fd, flags, initial, interval);

exit:
    return return_value;
}

#endif /* defined(HAVE_TIMERFD_CREATE) */

#if defined(HAVE_TIMERFD_CREATE)

TyDoc_STRVAR(os_timerfd_gettime__doc__,
"timerfd_gettime($module, fd, /)\n"
"--\n"
"\n"
"Return a tuple of a timer file descriptor\'s (interval, next expiration) in float seconds.\n"
"\n"
"  fd\n"
"    A timer file descriptor.");

#define OS_TIMERFD_GETTIME_METHODDEF    \
    {"timerfd_gettime", (PyCFunction)os_timerfd_gettime, METH_O, os_timerfd_gettime__doc__},

static TyObject *
os_timerfd_gettime_impl(TyObject *module, int fd);

static TyObject *
os_timerfd_gettime(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_timerfd_gettime_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_TIMERFD_CREATE) */

#if defined(HAVE_TIMERFD_CREATE)

TyDoc_STRVAR(os_timerfd_gettime_ns__doc__,
"timerfd_gettime_ns($module, fd, /)\n"
"--\n"
"\n"
"Return a tuple of a timer file descriptor\'s (interval, next expiration) in nanoseconds.\n"
"\n"
"  fd\n"
"    A timer file descriptor.");

#define OS_TIMERFD_GETTIME_NS_METHODDEF    \
    {"timerfd_gettime_ns", (PyCFunction)os_timerfd_gettime_ns, METH_O, os_timerfd_gettime_ns__doc__},

static TyObject *
os_timerfd_gettime_ns_impl(TyObject *module, int fd);

static TyObject *
os_timerfd_gettime_ns(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_timerfd_gettime_ns_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_TIMERFD_CREATE) */

#if defined(HAVE_GETSID)

TyDoc_STRVAR(os_getsid__doc__,
"getsid($module, pid, /)\n"
"--\n"
"\n"
"Call the system call getsid(pid) and return the result.");

#define OS_GETSID_METHODDEF    \
    {"getsid", (PyCFunction)os_getsid, METH_O, os_getsid__doc__},

static TyObject *
os_getsid_impl(TyObject *module, pid_t pid);

static TyObject *
os_getsid(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    pid_t pid;

    pid = TyLong_AsPid(arg);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_getsid_impl(module, pid);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETSID) */

#if defined(HAVE_SETSID)

TyDoc_STRVAR(os_setsid__doc__,
"setsid($module, /)\n"
"--\n"
"\n"
"Call the system call setsid().");

#define OS_SETSID_METHODDEF    \
    {"setsid", (PyCFunction)os_setsid, METH_NOARGS, os_setsid__doc__},

static TyObject *
os_setsid_impl(TyObject *module);

static TyObject *
os_setsid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_setsid_impl(module);
}

#endif /* defined(HAVE_SETSID) */

#if defined(HAVE_SETPGID)

TyDoc_STRVAR(os_setpgid__doc__,
"setpgid($module, pid, pgrp, /)\n"
"--\n"
"\n"
"Call the system call setpgid(pid, pgrp).");

#define OS_SETPGID_METHODDEF    \
    {"setpgid", _PyCFunction_CAST(os_setpgid), METH_FASTCALL, os_setpgid__doc__},

static TyObject *
os_setpgid_impl(TyObject *module, pid_t pid, pid_t pgrp);

static TyObject *
os_setpgid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    pid_t pgrp;

    if (!_TyArg_CheckPositional("setpgid", nargs, 2, 2)) {
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    pgrp = TyLong_AsPid(args[1]);
    if (pgrp == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_setpgid_impl(module, pid, pgrp);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETPGID) */

#if defined(HAVE_TCGETPGRP)

TyDoc_STRVAR(os_tcgetpgrp__doc__,
"tcgetpgrp($module, fd, /)\n"
"--\n"
"\n"
"Return the process group associated with the terminal specified by fd.");

#define OS_TCGETPGRP_METHODDEF    \
    {"tcgetpgrp", (PyCFunction)os_tcgetpgrp, METH_O, os_tcgetpgrp__doc__},

static TyObject *
os_tcgetpgrp_impl(TyObject *module, int fd);

static TyObject *
os_tcgetpgrp(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_tcgetpgrp_impl(module, fd);

exit:
    return return_value;
}

#endif /* defined(HAVE_TCGETPGRP) */

#if defined(HAVE_TCSETPGRP)

TyDoc_STRVAR(os_tcsetpgrp__doc__,
"tcsetpgrp($module, fd, pgid, /)\n"
"--\n"
"\n"
"Set the process group associated with the terminal specified by fd.");

#define OS_TCSETPGRP_METHODDEF    \
    {"tcsetpgrp", _PyCFunction_CAST(os_tcsetpgrp), METH_FASTCALL, os_tcsetpgrp__doc__},

static TyObject *
os_tcsetpgrp_impl(TyObject *module, int fd, pid_t pgid);

static TyObject *
os_tcsetpgrp(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    pid_t pgid;

    if (!_TyArg_CheckPositional("tcsetpgrp", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    pgid = TyLong_AsPid(args[1]);
    if (pgid == (pid_t)(-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_tcsetpgrp_impl(module, fd, pgid);

exit:
    return return_value;
}

#endif /* defined(HAVE_TCSETPGRP) */

TyDoc_STRVAR(os_open__doc__,
"open($module, /, path, flags, mode=511, *, dir_fd=None)\n"
"--\n"
"\n"
"Open a file for low level IO.  Returns a file descriptor (integer).\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_OPEN_METHODDEF    \
    {"open", _PyCFunction_CAST(os_open), METH_FASTCALL|METH_KEYWORDS, os_open__doc__},

static int
os_open_impl(TyObject *module, path_t *path, int flags, int mode, int dir_fd);

static TyObject *
os_open(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(flags), &_Ty_ID(mode), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "flags", "mode", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "open",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("open", "path", 0, 0, 0, 0);
    int flags;
    int mode = 511;
    int dir_fd = DEFAULT_DIR_FD;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        mode = TyLong_AsInt(args[2]);
        if (mode == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!OPENAT_DIR_FD_CONVERTER(args[3], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    _return_value = os_open_impl(module, &path, flags, mode, dir_fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_close__doc__,
"close($module, /, fd)\n"
"--\n"
"\n"
"Close a file descriptor.");

#define OS_CLOSE_METHODDEF    \
    {"close", _PyCFunction_CAST(os_close), METH_FASTCALL|METH_KEYWORDS, os_close__doc__},

static TyObject *
os_close_impl(TyObject *module, int fd);

static TyObject *
os_close(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "close",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_close_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(os_closerange__doc__,
"closerange($module, fd_low, fd_high, /)\n"
"--\n"
"\n"
"Closes all file descriptors in [fd_low, fd_high), ignoring errors.");

#define OS_CLOSERANGE_METHODDEF    \
    {"closerange", _PyCFunction_CAST(os_closerange), METH_FASTCALL, os_closerange__doc__},

static TyObject *
os_closerange_impl(TyObject *module, int fd_low, int fd_high);

static TyObject *
os_closerange(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd_low;
    int fd_high;

    if (!_TyArg_CheckPositional("closerange", nargs, 2, 2)) {
        goto exit;
    }
    fd_low = TyLong_AsInt(args[0]);
    if (fd_low == -1 && TyErr_Occurred()) {
        goto exit;
    }
    fd_high = TyLong_AsInt(args[1]);
    if (fd_high == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_closerange_impl(module, fd_low, fd_high);

exit:
    return return_value;
}

TyDoc_STRVAR(os_dup__doc__,
"dup($module, fd, /)\n"
"--\n"
"\n"
"Return a duplicate of a file descriptor.");

#define OS_DUP_METHODDEF    \
    {"dup", (PyCFunction)os_dup, METH_O, os_dup__doc__},

static int
os_dup_impl(TyObject *module, int fd);

static TyObject *
os_dup(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;
    int _return_value;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_dup_impl(module, fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#if ((defined(HAVE_DUP3) || defined(F_DUPFD) || defined(MS_WINDOWS)))

TyDoc_STRVAR(os_dup2__doc__,
"dup2($module, /, fd, fd2, inheritable=True)\n"
"--\n"
"\n"
"Duplicate file descriptor.");

#define OS_DUP2_METHODDEF    \
    {"dup2", _PyCFunction_CAST(os_dup2), METH_FASTCALL|METH_KEYWORDS, os_dup2__doc__},

static int
os_dup2_impl(TyObject *module, int fd, int fd2, int inheritable);

static TyObject *
os_dup2(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), &_Ty_ID(fd2), &_Ty_ID(inheritable), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", "fd2", "inheritable", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dup2",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    int fd;
    int fd2;
    int inheritable = 1;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    fd2 = TyLong_AsInt(args[1]);
    if (fd2 == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    inheritable = PyObject_IsTrue(args[2]);
    if (inheritable < 0) {
        goto exit;
    }
skip_optional_pos:
    _return_value = os_dup2_impl(module, fd, fd2, inheritable);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* ((defined(HAVE_DUP3) || defined(F_DUPFD) || defined(MS_WINDOWS))) */

#if defined(HAVE_LOCKF)

TyDoc_STRVAR(os_lockf__doc__,
"lockf($module, fd, command, length, /)\n"
"--\n"
"\n"
"Apply, test or remove a POSIX lock on an open file descriptor.\n"
"\n"
"  fd\n"
"    An open file descriptor.\n"
"  command\n"
"    One of F_LOCK, F_TLOCK, F_ULOCK or F_TEST.\n"
"  length\n"
"    The number of bytes to lock, starting at the current position.");

#define OS_LOCKF_METHODDEF    \
    {"lockf", _PyCFunction_CAST(os_lockf), METH_FASTCALL, os_lockf__doc__},

static TyObject *
os_lockf_impl(TyObject *module, int fd, int command, Ty_off_t length);

static TyObject *
os_lockf(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int command;
    Ty_off_t length;

    if (!_TyArg_CheckPositional("lockf", nargs, 3, 3)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    command = TyLong_AsInt(args[1]);
    if (command == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &length)) {
        goto exit;
    }
    return_value = os_lockf_impl(module, fd, command, length);

exit:
    return return_value;
}

#endif /* defined(HAVE_LOCKF) */

TyDoc_STRVAR(os_lseek__doc__,
"lseek($module, fd, position, whence, /)\n"
"--\n"
"\n"
"Set the position of a file descriptor.  Return the new position.\n"
"\n"
"  fd\n"
"    An open file descriptor, as returned by os.open().\n"
"  position\n"
"    Position, interpreted relative to \'whence\'.\n"
"  whence\n"
"    The relative position to seek from. Valid values are:\n"
"    - SEEK_SET: seek from the start of the file.\n"
"    - SEEK_CUR: seek from the current file position.\n"
"    - SEEK_END: seek from the end of the file.\n"
"\n"
"The return value is the number of bytes relative to the beginning of the file.");

#define OS_LSEEK_METHODDEF    \
    {"lseek", _PyCFunction_CAST(os_lseek), METH_FASTCALL, os_lseek__doc__},

static Ty_off_t
os_lseek_impl(TyObject *module, int fd, Ty_off_t position, int how);

static TyObject *
os_lseek(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_off_t position;
    int how;
    Ty_off_t _return_value;

    if (!_TyArg_CheckPositional("lseek", nargs, 3, 3)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[1], &position)) {
        goto exit;
    }
    how = TyLong_AsInt(args[2]);
    if (how == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_lseek_impl(module, fd, position, how);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromPy_off_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_read__doc__,
"read($module, fd, length, /)\n"
"--\n"
"\n"
"Read from a file descriptor.  Returns a bytes object.");

#define OS_READ_METHODDEF    \
    {"read", _PyCFunction_CAST(os_read), METH_FASTCALL, os_read__doc__},

static TyObject *
os_read_impl(TyObject *module, int fd, Ty_ssize_t length);

static TyObject *
os_read(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_ssize_t length;

    if (!_TyArg_CheckPositional("read", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        length = ival;
    }
    return_value = os_read_impl(module, fd, length);

exit:
    return return_value;
}

TyDoc_STRVAR(os_readinto__doc__,
"readinto($module, fd, buffer, /)\n"
"--\n"
"\n"
"Read into a buffer object from a file descriptor.\n"
"\n"
"The buffer should be mutable and bytes-like. On success, returns the number of\n"
"bytes read. Less bytes may be read than the size of the buffer. The underlying\n"
"system call will be retried when interrupted by a signal, unless the signal\n"
"handler raises an exception. Other errors will not be retried and an error will\n"
"be raised.\n"
"\n"
"Returns 0 if *fd* is at end of file or if the provided *buffer* has length 0\n"
"(which can be used to check for errors without reading data). Never returns\n"
"negative.");

#define OS_READINTO_METHODDEF    \
    {"readinto", _PyCFunction_CAST(os_readinto), METH_FASTCALL, os_readinto__doc__},

static Ty_ssize_t
os_readinto_impl(TyObject *module, int fd, Ty_buffer *buffer);

static TyObject *
os_readinto(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_buffer buffer = {NULL, NULL};
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("readinto", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &buffer, PyBUF_WRITABLE) < 0) {
        _TyArg_BadArgument("readinto", "argument 2", "read-write bytes-like object", args[1]);
        goto exit;
    }
    _return_value = os_readinto_impl(module, fd, &buffer);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    /* Cleanup for buffer */
    if (buffer.obj) {
       PyBuffer_Release(&buffer);
    }

    return return_value;
}

#if defined(HAVE_READV)

TyDoc_STRVAR(os_readv__doc__,
"readv($module, fd, buffers, /)\n"
"--\n"
"\n"
"Read from a file descriptor fd into an iterable of buffers.\n"
"\n"
"The buffers should be mutable buffers accepting bytes.\n"
"readv will transfer data into each buffer until it is full\n"
"and then move on to the next buffer in the sequence to hold\n"
"the rest of the data.\n"
"\n"
"readv returns the total number of bytes read,\n"
"which may be less than the total capacity of all the buffers.");

#define OS_READV_METHODDEF    \
    {"readv", _PyCFunction_CAST(os_readv), METH_FASTCALL, os_readv__doc__},

static Ty_ssize_t
os_readv_impl(TyObject *module, int fd, TyObject *buffers);

static TyObject *
os_readv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    TyObject *buffers;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("readv", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    buffers = args[1];
    _return_value = os_readv_impl(module, fd, buffers);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_READV) */

#if defined(HAVE_PREAD)

TyDoc_STRVAR(os_pread__doc__,
"pread($module, fd, length, offset, /)\n"
"--\n"
"\n"
"Read a number of bytes from a file descriptor starting at a particular offset.\n"
"\n"
"Read length bytes from file descriptor fd, starting at offset bytes from\n"
"the beginning of the file.  The file offset remains unchanged.");

#define OS_PREAD_METHODDEF    \
    {"pread", _PyCFunction_CAST(os_pread), METH_FASTCALL, os_pread__doc__},

static TyObject *
os_pread_impl(TyObject *module, int fd, Ty_ssize_t length, Ty_off_t offset);

static TyObject *
os_pread(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_ssize_t length;
    Ty_off_t offset;

    if (!_TyArg_CheckPositional("pread", nargs, 3, 3)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[1]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        length = ival;
    }
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    return_value = os_pread_impl(module, fd, length, offset);

exit:
    return return_value;
}

#endif /* defined(HAVE_PREAD) */

#if (defined(HAVE_PREADV) || defined (HAVE_PREADV2))

TyDoc_STRVAR(os_preadv__doc__,
"preadv($module, fd, buffers, offset, flags=0, /)\n"
"--\n"
"\n"
"Reads from a file descriptor into a number of mutable bytes-like objects.\n"
"\n"
"Combines the functionality of readv() and pread(). As readv(), it will\n"
"transfer data into each buffer until it is full and then move on to the next\n"
"buffer in the sequence to hold the rest of the data. Its fourth argument,\n"
"specifies the file offset at which the input operation is to be performed. It\n"
"will return the total number of bytes read (which can be less than the total\n"
"capacity of all the objects).\n"
"\n"
"The flags argument contains a bitwise OR of zero or more of the following flags:\n"
"\n"
"- RWF_HIPRI\n"
"- RWF_NOWAIT\n"
"\n"
"Using non-zero flags requires Linux 4.6 or newer.");

#define OS_PREADV_METHODDEF    \
    {"preadv", _PyCFunction_CAST(os_preadv), METH_FASTCALL, os_preadv__doc__},

static Ty_ssize_t
os_preadv_impl(TyObject *module, int fd, TyObject *buffers, Ty_off_t offset,
               int flags);

static TyObject *
os_preadv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    TyObject *buffers;
    Ty_off_t offset;
    int flags = 0;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("preadv", nargs, 3, 4)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    buffers = args[1];
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    flags = TyLong_AsInt(args[3]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    _return_value = os_preadv_impl(module, fd, buffers, offset, flags);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

#endif /* (defined(HAVE_PREADV) || defined (HAVE_PREADV2)) */

TyDoc_STRVAR(os_write__doc__,
"write($module, fd, data, /)\n"
"--\n"
"\n"
"Write a bytes object to a file descriptor.");

#define OS_WRITE_METHODDEF    \
    {"write", _PyCFunction_CAST(os_write), METH_FASTCALL, os_write__doc__},

static Ty_ssize_t
os_write_impl(TyObject *module, int fd, Ty_buffer *data);

static TyObject *
os_write(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_buffer data = {NULL, NULL};
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("write", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &data, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    _return_value = os_write_impl(module, fd, &data);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#if defined(HAVE_SENDFILE) && defined(__APPLE__)

TyDoc_STRVAR(os_sendfile__doc__,
"sendfile($module, /, out_fd, in_fd, offset, count, headers=(),\n"
"         trailers=(), flags=0)\n"
"--\n"
"\n"
"Copy count bytes from file descriptor in_fd to file descriptor out_fd.");

#define OS_SENDFILE_METHODDEF    \
    {"sendfile", _PyCFunction_CAST(os_sendfile), METH_FASTCALL|METH_KEYWORDS, os_sendfile__doc__},

static TyObject *
os_sendfile_impl(TyObject *module, int out_fd, int in_fd, Ty_off_t offset,
                 Ty_off_t sbytes, TyObject *headers, TyObject *trailers,
                 int flags);

static TyObject *
os_sendfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(out_fd), &_Ty_ID(in_fd), &_Ty_ID(offset), &_Ty_ID(count), &_Ty_ID(headers), &_Ty_ID(trailers), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"out_fd", "in_fd", "offset", "count", "headers", "trailers", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sendfile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[7];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 4;
    int out_fd;
    int in_fd;
    Ty_off_t offset;
    Ty_off_t sbytes;
    TyObject *headers = NULL;
    TyObject *trailers = NULL;
    int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 7, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    out_fd = TyLong_AsInt(args[0]);
    if (out_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    in_fd = TyLong_AsInt(args[1]);
    if (in_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[3], &sbytes)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[4]) {
        headers = args[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[5]) {
        trailers = args[5];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    flags = TyLong_AsInt(args[6]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_sendfile_impl(module, out_fd, in_fd, offset, sbytes, headers, trailers, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_SENDFILE) && defined(__APPLE__) */

#if defined(HAVE_SENDFILE) && !defined(__APPLE__) && (defined(__FreeBSD__) || defined(__DragonFly__))

TyDoc_STRVAR(os_sendfile__doc__,
"sendfile($module, /, out_fd, in_fd, offset, count, headers=(),\n"
"         trailers=(), flags=0)\n"
"--\n"
"\n"
"Copy count bytes from file descriptor in_fd to file descriptor out_fd.");

#define OS_SENDFILE_METHODDEF    \
    {"sendfile", _PyCFunction_CAST(os_sendfile), METH_FASTCALL|METH_KEYWORDS, os_sendfile__doc__},

static TyObject *
os_sendfile_impl(TyObject *module, int out_fd, int in_fd, Ty_off_t offset,
                 Ty_ssize_t count, TyObject *headers, TyObject *trailers,
                 int flags);

static TyObject *
os_sendfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 7
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(out_fd), &_Ty_ID(in_fd), &_Ty_ID(offset), &_Ty_ID(count), &_Ty_ID(headers), &_Ty_ID(trailers), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"out_fd", "in_fd", "offset", "count", "headers", "trailers", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sendfile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[7];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 4;
    int out_fd;
    int in_fd;
    Ty_off_t offset;
    Ty_ssize_t count;
    TyObject *headers = NULL;
    TyObject *trailers = NULL;
    int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 7, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    out_fd = TyLong_AsInt(args[0]);
    if (out_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    in_fd = TyLong_AsInt(args[1]);
    if (in_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[3]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[4]) {
        headers = args[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[5]) {
        trailers = args[5];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    flags = TyLong_AsInt(args[6]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_sendfile_impl(module, out_fd, in_fd, offset, count, headers, trailers, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_SENDFILE) && !defined(__APPLE__) && (defined(__FreeBSD__) || defined(__DragonFly__)) */

#if defined(HAVE_SENDFILE) && !defined(__APPLE__) && !(defined(__FreeBSD__) || defined(__DragonFly__))

TyDoc_STRVAR(os_sendfile__doc__,
"sendfile($module, /, out_fd, in_fd, offset, count)\n"
"--\n"
"\n"
"Copy count bytes from file descriptor in_fd to file descriptor out_fd.");

#define OS_SENDFILE_METHODDEF    \
    {"sendfile", _PyCFunction_CAST(os_sendfile), METH_FASTCALL|METH_KEYWORDS, os_sendfile__doc__},

static TyObject *
os_sendfile_impl(TyObject *module, int out_fd, int in_fd, TyObject *offobj,
                 Ty_ssize_t count);

static TyObject *
os_sendfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(out_fd), &_Ty_ID(in_fd), &_Ty_ID(offset), &_Ty_ID(count), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"out_fd", "in_fd", "offset", "count", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "sendfile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    int out_fd;
    int in_fd;
    TyObject *offobj;
    Ty_ssize_t count;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 4, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    out_fd = TyLong_AsInt(args[0]);
    if (out_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    in_fd = TyLong_AsInt(args[1]);
    if (in_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    offobj = args[2];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[3]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
    return_value = os_sendfile_impl(module, out_fd, in_fd, offobj, count);

exit:
    return return_value;
}

#endif /* defined(HAVE_SENDFILE) && !defined(__APPLE__) && !(defined(__FreeBSD__) || defined(__DragonFly__)) */

#if defined(__APPLE__)

TyDoc_STRVAR(os__fcopyfile__doc__,
"_fcopyfile($module, in_fd, out_fd, flags, /)\n"
"--\n"
"\n"
"Efficiently copy content or metadata of 2 regular file descriptors (macOS).");

#define OS__FCOPYFILE_METHODDEF    \
    {"_fcopyfile", _PyCFunction_CAST(os__fcopyfile), METH_FASTCALL, os__fcopyfile__doc__},

static TyObject *
os__fcopyfile_impl(TyObject *module, int in_fd, int out_fd, int flags);

static TyObject *
os__fcopyfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int in_fd;
    int out_fd;
    int flags;

    if (!_TyArg_CheckPositional("_fcopyfile", nargs, 3, 3)) {
        goto exit;
    }
    in_fd = TyLong_AsInt(args[0]);
    if (in_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    out_fd = TyLong_AsInt(args[1]);
    if (out_fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    flags = TyLong_AsInt(args[2]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os__fcopyfile_impl(module, in_fd, out_fd, flags);

exit:
    return return_value;
}

#endif /* defined(__APPLE__) */

TyDoc_STRVAR(os_fstat__doc__,
"fstat($module, /, fd)\n"
"--\n"
"\n"
"Perform a stat system call on the given file descriptor.\n"
"\n"
"Like stat(), but for an open file descriptor.\n"
"Equivalent to os.stat(fd).");

#define OS_FSTAT_METHODDEF    \
    {"fstat", _PyCFunction_CAST(os_fstat), METH_FASTCALL|METH_KEYWORDS, os_fstat__doc__},

static TyObject *
os_fstat_impl(TyObject *module, int fd);

static TyObject *
os_fstat(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fstat",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_fstat_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(os_isatty__doc__,
"isatty($module, fd, /)\n"
"--\n"
"\n"
"Return True if the fd is connected to a terminal.\n"
"\n"
"Return True if the file descriptor is an open file descriptor\n"
"connected to the slave end of a terminal.");

#define OS_ISATTY_METHODDEF    \
    {"isatty", (PyCFunction)os_isatty, METH_O, os_isatty__doc__},

static int
os_isatty_impl(TyObject *module, int fd);

static TyObject *
os_isatty(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;
    int _return_value;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_isatty_impl(module, fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#if defined(HAVE_PIPE)

TyDoc_STRVAR(os_pipe__doc__,
"pipe($module, /)\n"
"--\n"
"\n"
"Create a pipe.\n"
"\n"
"Returns a tuple of two file descriptors:\n"
"  (read_fd, write_fd)");

#define OS_PIPE_METHODDEF    \
    {"pipe", (PyCFunction)os_pipe, METH_NOARGS, os_pipe__doc__},

static TyObject *
os_pipe_impl(TyObject *module);

static TyObject *
os_pipe(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_pipe_impl(module);
}

#endif /* defined(HAVE_PIPE) */

#if defined(HAVE_PIPE2)

TyDoc_STRVAR(os_pipe2__doc__,
"pipe2($module, flags, /)\n"
"--\n"
"\n"
"Create a pipe with flags set atomically.\n"
"\n"
"Returns a tuple of two file descriptors:\n"
"  (read_fd, write_fd)\n"
"\n"
"flags can be constructed by ORing together one or more of these values:\n"
"O_NONBLOCK, O_CLOEXEC.");

#define OS_PIPE2_METHODDEF    \
    {"pipe2", (PyCFunction)os_pipe2, METH_O, os_pipe2__doc__},

static TyObject *
os_pipe2_impl(TyObject *module, int flags);

static TyObject *
os_pipe2(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int flags;

    flags = TyLong_AsInt(arg);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_pipe2_impl(module, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_PIPE2) */

#if defined(HAVE_WRITEV)

TyDoc_STRVAR(os_writev__doc__,
"writev($module, fd, buffers, /)\n"
"--\n"
"\n"
"Iterate over buffers, and write the contents of each to a file descriptor.\n"
"\n"
"Returns the total number of bytes written.\n"
"buffers must be a sequence of bytes-like objects.");

#define OS_WRITEV_METHODDEF    \
    {"writev", _PyCFunction_CAST(os_writev), METH_FASTCALL, os_writev__doc__},

static Ty_ssize_t
os_writev_impl(TyObject *module, int fd, TyObject *buffers);

static TyObject *
os_writev(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    TyObject *buffers;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("writev", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    buffers = args[1];
    _return_value = os_writev_impl(module, fd, buffers);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_WRITEV) */

#if defined(HAVE_PWRITE)

TyDoc_STRVAR(os_pwrite__doc__,
"pwrite($module, fd, buffer, offset, /)\n"
"--\n"
"\n"
"Write bytes to a file descriptor starting at a particular offset.\n"
"\n"
"Write buffer to fd, starting at offset bytes from the beginning of\n"
"the file.  Returns the number of bytes written.  Does not change the\n"
"current file offset.");

#define OS_PWRITE_METHODDEF    \
    {"pwrite", _PyCFunction_CAST(os_pwrite), METH_FASTCALL, os_pwrite__doc__},

static Ty_ssize_t
os_pwrite_impl(TyObject *module, int fd, Ty_buffer *buffer, Ty_off_t offset);

static TyObject *
os_pwrite(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_buffer buffer = {NULL, NULL};
    Ty_off_t offset;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("pwrite", nargs, 3, 3)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[1], &buffer, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    _return_value = os_pwrite_impl(module, fd, &buffer, offset);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    /* Cleanup for buffer */
    if (buffer.obj) {
       PyBuffer_Release(&buffer);
    }

    return return_value;
}

#endif /* defined(HAVE_PWRITE) */

#if (defined(HAVE_PWRITEV) || defined (HAVE_PWRITEV2))

TyDoc_STRVAR(os_pwritev__doc__,
"pwritev($module, fd, buffers, offset, flags=0, /)\n"
"--\n"
"\n"
"Writes the contents of bytes-like objects to a file descriptor at a given offset.\n"
"\n"
"Combines the functionality of writev() and pwrite(). All buffers must be a sequence\n"
"of bytes-like objects. Buffers are processed in array order. Entire contents of first\n"
"buffer is written before proceeding to second, and so on. The operating system may\n"
"set a limit (sysconf() value SC_IOV_MAX) on the number of buffers that can be used.\n"
"This function writes the contents of each object to the file descriptor and returns\n"
"the total number of bytes written.\n"
"\n"
"The flags argument contains a bitwise OR of zero or more of the following flags:\n"
"\n"
"- RWF_DSYNC\n"
"- RWF_SYNC\n"
"- RWF_APPEND\n"
"\n"
"Using non-zero flags requires Linux 4.7 or newer.");

#define OS_PWRITEV_METHODDEF    \
    {"pwritev", _PyCFunction_CAST(os_pwritev), METH_FASTCALL, os_pwritev__doc__},

static Ty_ssize_t
os_pwritev_impl(TyObject *module, int fd, TyObject *buffers, Ty_off_t offset,
                int flags);

static TyObject *
os_pwritev(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    TyObject *buffers;
    Ty_off_t offset;
    int flags = 0;
    Ty_ssize_t _return_value;

    if (!_TyArg_CheckPositional("pwritev", nargs, 3, 4)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    buffers = args[1];
    if (!Ty_off_t_converter(args[2], &offset)) {
        goto exit;
    }
    if (nargs < 4) {
        goto skip_optional;
    }
    flags = TyLong_AsInt(args[3]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    _return_value = os_pwritev_impl(module, fd, buffers, offset, flags);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSsize_t(_return_value);

exit:
    return return_value;
}

#endif /* (defined(HAVE_PWRITEV) || defined (HAVE_PWRITEV2)) */

#if defined(HAVE_COPY_FILE_RANGE)

TyDoc_STRVAR(os_copy_file_range__doc__,
"copy_file_range($module, /, src, dst, count, offset_src=None,\n"
"                offset_dst=None)\n"
"--\n"
"\n"
"Copy count bytes from one file descriptor to another.\n"
"\n"
"  src\n"
"    Source file descriptor.\n"
"  dst\n"
"    Destination file descriptor.\n"
"  count\n"
"    Number of bytes to copy.\n"
"  offset_src\n"
"    Starting offset in src.\n"
"  offset_dst\n"
"    Starting offset in dst.\n"
"\n"
"If offset_src is None, then src is read from the current position;\n"
"respectively for offset_dst.");

#define OS_COPY_FILE_RANGE_METHODDEF    \
    {"copy_file_range", _PyCFunction_CAST(os_copy_file_range), METH_FASTCALL|METH_KEYWORDS, os_copy_file_range__doc__},

static TyObject *
os_copy_file_range_impl(TyObject *module, int src, int dst, Ty_ssize_t count,
                        TyObject *offset_src, TyObject *offset_dst);

static TyObject *
os_copy_file_range(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(count), &_Ty_ID(offset_src), &_Ty_ID(offset_dst), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "count", "offset_src", "offset_dst", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "copy_file_range",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    int src;
    int dst;
    Ty_ssize_t count;
    TyObject *offset_src = Ty_None;
    TyObject *offset_dst = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 5, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    src = TyLong_AsInt(args[0]);
    if (src == -1 && TyErr_Occurred()) {
        goto exit;
    }
    dst = TyLong_AsInt(args[1]);
    if (dst == -1 && TyErr_Occurred()) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[3]) {
        offset_src = args[3];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    offset_dst = args[4];
skip_optional_pos:
    return_value = os_copy_file_range_impl(module, src, dst, count, offset_src, offset_dst);

exit:
    return return_value;
}

#endif /* defined(HAVE_COPY_FILE_RANGE) */

#if ((defined(HAVE_SPLICE) && !defined(_AIX)))

TyDoc_STRVAR(os_splice__doc__,
"splice($module, /, src, dst, count, offset_src=None, offset_dst=None,\n"
"       flags=0)\n"
"--\n"
"\n"
"Transfer count bytes from one pipe to a descriptor or vice versa.\n"
"\n"
"  src\n"
"    Source file descriptor.\n"
"  dst\n"
"    Destination file descriptor.\n"
"  count\n"
"    Number of bytes to copy.\n"
"  offset_src\n"
"    Starting offset in src.\n"
"  offset_dst\n"
"    Starting offset in dst.\n"
"  flags\n"
"    Flags to modify the semantics of the call.\n"
"\n"
"If offset_src is None, then src is read from the current position;\n"
"respectively for offset_dst. The offset associated to the file\n"
"descriptor that refers to a pipe must be None.");

#define OS_SPLICE_METHODDEF    \
    {"splice", _PyCFunction_CAST(os_splice), METH_FASTCALL|METH_KEYWORDS, os_splice__doc__},

static TyObject *
os_splice_impl(TyObject *module, int src, int dst, Ty_ssize_t count,
               TyObject *offset_src, TyObject *offset_dst,
               unsigned int flags);

static TyObject *
os_splice(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 6
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(src), &_Ty_ID(dst), &_Ty_ID(count), &_Ty_ID(offset_src), &_Ty_ID(offset_dst), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"src", "dst", "count", "offset_src", "offset_dst", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "splice",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[6];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    int src;
    int dst;
    Ty_ssize_t count;
    TyObject *offset_src = Ty_None;
    TyObject *offset_dst = Ty_None;
    unsigned int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 6, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    src = TyLong_AsInt(args[0]);
    if (src == -1 && TyErr_Occurred()) {
        goto exit;
    }
    dst = TyLong_AsInt(args[1]);
    if (dst == -1 && TyErr_Occurred()) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        count = ival;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[3]) {
        offset_src = args[3];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[4]) {
        offset_dst = args[4];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (!_TyLong_UnsignedInt_Converter(args[5], &flags)) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_splice_impl(module, src, dst, count, offset_src, offset_dst, flags);

exit:
    return return_value;
}

#endif /* ((defined(HAVE_SPLICE) && !defined(_AIX))) */

#if defined(HAVE_MKFIFO)

TyDoc_STRVAR(os_mkfifo__doc__,
"mkfifo($module, /, path, mode=438, *, dir_fd=None)\n"
"--\n"
"\n"
"Create a \"fifo\" (a POSIX named pipe).\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_MKFIFO_METHODDEF    \
    {"mkfifo", _PyCFunction_CAST(os_mkfifo), METH_FASTCALL|METH_KEYWORDS, os_mkfifo__doc__},

static TyObject *
os_mkfifo_impl(TyObject *module, path_t *path, int mode, int dir_fd);

static TyObject *
os_mkfifo(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mkfifo",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("mkfifo", "path", 0, 0, 0, 0);
    int mode = 438;
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        mode = TyLong_AsInt(args[1]);
        if (mode == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!MKFIFOAT_DIR_FD_CONVERTER(args[2], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_mkfifo_impl(module, &path, mode, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_MKFIFO) */

#if (defined(HAVE_MKNOD) && defined(HAVE_MAKEDEV))

TyDoc_STRVAR(os_mknod__doc__,
"mknod($module, /, path, mode=384, device=0, *, dir_fd=None)\n"
"--\n"
"\n"
"Create a node in the file system.\n"
"\n"
"Create a node in the file system (file, device special file or named pipe)\n"
"at path.  mode specifies both the permissions to use and the\n"
"type of node to be created, being combined (bitwise OR) with one of\n"
"S_IFREG, S_IFCHR, S_IFBLK, and S_IFIFO.  If S_IFCHR or S_IFBLK is set on mode,\n"
"device defines the newly created device special file (probably using\n"
"os.makedev()).  Otherwise device is ignored.\n"
"\n"
"If dir_fd is not None, it should be a file descriptor open to a directory,\n"
"  and path should be relative; path will then be relative to that directory.\n"
"dir_fd may not be implemented on your platform.\n"
"  If it is unavailable, using it will raise a NotImplementedError.");

#define OS_MKNOD_METHODDEF    \
    {"mknod", _PyCFunction_CAST(os_mknod), METH_FASTCALL|METH_KEYWORDS, os_mknod__doc__},

static TyObject *
os_mknod_impl(TyObject *module, path_t *path, int mode, dev_t device,
              int dir_fd);

static TyObject *
os_mknod(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(mode), &_Ty_ID(device), &_Ty_ID(dir_fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "mode", "device", "dir_fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "mknod",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t path = PATH_T_INITIALIZE_P("mknod", "path", 0, 0, 0, 0);
    int mode = 384;
    dev_t device = 0;
    int dir_fd = DEFAULT_DIR_FD;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        mode = TyLong_AsInt(args[1]);
        if (mode == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        if (!_Ty_Dev_Converter(args[2], &device)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!MKNODAT_DIR_FD_CONVERTER(args[3], &dir_fd)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_mknod_impl(module, &path, mode, device, dir_fd);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_MKNOD) && defined(HAVE_MAKEDEV)) */

#if defined(HAVE_DEVICE_MACROS)

TyDoc_STRVAR(os_major__doc__,
"major($module, device, /)\n"
"--\n"
"\n"
"Extracts a device major number from a raw device number.");

#define OS_MAJOR_METHODDEF    \
    {"major", (PyCFunction)os_major, METH_O, os_major__doc__},

static TyObject *
os_major_impl(TyObject *module, dev_t device);

static TyObject *
os_major(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    dev_t device;

    if (!_Ty_Dev_Converter(arg, &device)) {
        goto exit;
    }
    return_value = os_major_impl(module, device);

exit:
    return return_value;
}

#endif /* defined(HAVE_DEVICE_MACROS) */

#if defined(HAVE_DEVICE_MACROS)

TyDoc_STRVAR(os_minor__doc__,
"minor($module, device, /)\n"
"--\n"
"\n"
"Extracts a device minor number from a raw device number.");

#define OS_MINOR_METHODDEF    \
    {"minor", (PyCFunction)os_minor, METH_O, os_minor__doc__},

static TyObject *
os_minor_impl(TyObject *module, dev_t device);

static TyObject *
os_minor(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    dev_t device;

    if (!_Ty_Dev_Converter(arg, &device)) {
        goto exit;
    }
    return_value = os_minor_impl(module, device);

exit:
    return return_value;
}

#endif /* defined(HAVE_DEVICE_MACROS) */

#if defined(HAVE_DEVICE_MACROS)

TyDoc_STRVAR(os_makedev__doc__,
"makedev($module, major, minor, /)\n"
"--\n"
"\n"
"Composes a raw device number from the major and minor device numbers.");

#define OS_MAKEDEV_METHODDEF    \
    {"makedev", _PyCFunction_CAST(os_makedev), METH_FASTCALL, os_makedev__doc__},

static dev_t
os_makedev_impl(TyObject *module, dev_t major, dev_t minor);

static TyObject *
os_makedev(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    dev_t major;
    dev_t minor;
    dev_t _return_value;

    if (!_TyArg_CheckPositional("makedev", nargs, 2, 2)) {
        goto exit;
    }
    if (!_Ty_Dev_Converter(args[0], &major)) {
        goto exit;
    }
    if (!_Ty_Dev_Converter(args[1], &minor)) {
        goto exit;
    }
    _return_value = os_makedev_impl(module, major, minor);
    if ((_return_value == (dev_t)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = _TyLong_FromDev(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_DEVICE_MACROS) */

#if (defined HAVE_FTRUNCATE || defined MS_WINDOWS)

TyDoc_STRVAR(os_ftruncate__doc__,
"ftruncate($module, fd, length, /)\n"
"--\n"
"\n"
"Truncate a file, specified by file descriptor, to a specific length.");

#define OS_FTRUNCATE_METHODDEF    \
    {"ftruncate", _PyCFunction_CAST(os_ftruncate), METH_FASTCALL, os_ftruncate__doc__},

static TyObject *
os_ftruncate_impl(TyObject *module, int fd, Ty_off_t length);

static TyObject *
os_ftruncate(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_off_t length;

    if (!_TyArg_CheckPositional("ftruncate", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[1], &length)) {
        goto exit;
    }
    return_value = os_ftruncate_impl(module, fd, length);

exit:
    return return_value;
}

#endif /* (defined HAVE_FTRUNCATE || defined MS_WINDOWS) */

#if (defined HAVE_TRUNCATE || defined MS_WINDOWS)

TyDoc_STRVAR(os_truncate__doc__,
"truncate($module, /, path, length)\n"
"--\n"
"\n"
"Truncate a file, specified by path, to a specific length.\n"
"\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"  If this functionality is unavailable, using it raises an exception.");

#define OS_TRUNCATE_METHODDEF    \
    {"truncate", _PyCFunction_CAST(os_truncate), METH_FASTCALL|METH_KEYWORDS, os_truncate__doc__},

static TyObject *
os_truncate_impl(TyObject *module, path_t *path, Ty_off_t length);

static TyObject *
os_truncate(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(length), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "length", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "truncate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    path_t path = PATH_T_INITIALIZE_P("truncate", "path", 0, 0, 0, PATH_HAVE_FTRUNCATE);
    Ty_off_t length;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[1], &length)) {
        goto exit;
    }
    return_value = os_truncate_impl(module, &path, length);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined HAVE_TRUNCATE || defined MS_WINDOWS) */

#if (defined(HAVE_POSIX_FALLOCATE) && !defined(POSIX_FADVISE_AIX_BUG) && !defined(__wasi__))

TyDoc_STRVAR(os_posix_fallocate__doc__,
"posix_fallocate($module, fd, offset, length, /)\n"
"--\n"
"\n"
"Ensure a file has allocated at least a particular number of bytes on disk.\n"
"\n"
"Ensure that the file specified by fd encompasses a range of bytes\n"
"starting at offset bytes from the beginning and continuing for length bytes.");

#define OS_POSIX_FALLOCATE_METHODDEF    \
    {"posix_fallocate", _PyCFunction_CAST(os_posix_fallocate), METH_FASTCALL, os_posix_fallocate__doc__},

static TyObject *
os_posix_fallocate_impl(TyObject *module, int fd, Ty_off_t offset,
                        Ty_off_t length);

static TyObject *
os_posix_fallocate(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_off_t offset;
    Ty_off_t length;

    if (!_TyArg_CheckPositional("posix_fallocate", nargs, 3, 3)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[1], &offset)) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &length)) {
        goto exit;
    }
    return_value = os_posix_fallocate_impl(module, fd, offset, length);

exit:
    return return_value;
}

#endif /* (defined(HAVE_POSIX_FALLOCATE) && !defined(POSIX_FADVISE_AIX_BUG) && !defined(__wasi__)) */

#if (defined(HAVE_POSIX_FADVISE) && !defined(POSIX_FADVISE_AIX_BUG))

TyDoc_STRVAR(os_posix_fadvise__doc__,
"posix_fadvise($module, fd, offset, length, advice, /)\n"
"--\n"
"\n"
"Announce an intention to access data in a specific pattern.\n"
"\n"
"Announce an intention to access data in a specific pattern, thus allowing\n"
"the kernel to make optimizations.\n"
"The advice applies to the region of the file specified by fd starting at\n"
"offset and continuing for length bytes.\n"
"advice is one of POSIX_FADV_NORMAL, POSIX_FADV_SEQUENTIAL,\n"
"POSIX_FADV_RANDOM, POSIX_FADV_NOREUSE, POSIX_FADV_WILLNEED, or\n"
"POSIX_FADV_DONTNEED.");

#define OS_POSIX_FADVISE_METHODDEF    \
    {"posix_fadvise", _PyCFunction_CAST(os_posix_fadvise), METH_FASTCALL, os_posix_fadvise__doc__},

static TyObject *
os_posix_fadvise_impl(TyObject *module, int fd, Ty_off_t offset,
                      Ty_off_t length, int advice);

static TyObject *
os_posix_fadvise(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    Ty_off_t offset;
    Ty_off_t length;
    int advice;

    if (!_TyArg_CheckPositional("posix_fadvise", nargs, 4, 4)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[1], &offset)) {
        goto exit;
    }
    if (!Ty_off_t_converter(args[2], &length)) {
        goto exit;
    }
    advice = TyLong_AsInt(args[3]);
    if (advice == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_posix_fadvise_impl(module, fd, offset, length, advice);

exit:
    return return_value;
}

#endif /* (defined(HAVE_POSIX_FADVISE) && !defined(POSIX_FADVISE_AIX_BUG)) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_putenv__doc__,
"putenv($module, name, value, /)\n"
"--\n"
"\n"
"Change or add an environment variable.");

#define OS_PUTENV_METHODDEF    \
    {"putenv", _PyCFunction_CAST(os_putenv), METH_FASTCALL, os_putenv__doc__},

static TyObject *
os_putenv_impl(TyObject *module, TyObject *name, TyObject *value);

static TyObject *
os_putenv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *name;
    TyObject *value;

    if (!_TyArg_CheckPositional("putenv", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("putenv", "argument 1", "str", args[0]);
        goto exit;
    }
    name = args[0];
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("putenv", "argument 2", "str", args[1]);
        goto exit;
    }
    value = args[1];
    return_value = os_putenv_impl(module, name, value);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if !defined(MS_WINDOWS)

TyDoc_STRVAR(os_putenv__doc__,
"putenv($module, name, value, /)\n"
"--\n"
"\n"
"Change or add an environment variable.");

#define OS_PUTENV_METHODDEF    \
    {"putenv", _PyCFunction_CAST(os_putenv), METH_FASTCALL, os_putenv__doc__},

static TyObject *
os_putenv_impl(TyObject *module, TyObject *name, TyObject *value);

static TyObject *
os_putenv(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *name = NULL;
    TyObject *value = NULL;

    if (!_TyArg_CheckPositional("putenv", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[0], &name)) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[1], &value)) {
        goto exit;
    }
    return_value = os_putenv_impl(module, name, value);

exit:
    /* Cleanup for name */
    Ty_XDECREF(name);
    /* Cleanup for value */
    Ty_XDECREF(value);

    return return_value;
}

#endif /* !defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_unsetenv__doc__,
"unsetenv($module, name, /)\n"
"--\n"
"\n"
"Delete an environment variable.");

#define OS_UNSETENV_METHODDEF    \
    {"unsetenv", (PyCFunction)os_unsetenv, METH_O, os_unsetenv__doc__},

static TyObject *
os_unsetenv_impl(TyObject *module, TyObject *name);

static TyObject *
os_unsetenv(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("unsetenv", "argument", "str", arg);
        goto exit;
    }
    name = arg;
    return_value = os_unsetenv_impl(module, name);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if !defined(MS_WINDOWS)

TyDoc_STRVAR(os_unsetenv__doc__,
"unsetenv($module, name, /)\n"
"--\n"
"\n"
"Delete an environment variable.");

#define OS_UNSETENV_METHODDEF    \
    {"unsetenv", (PyCFunction)os_unsetenv, METH_O, os_unsetenv__doc__},

static TyObject *
os_unsetenv_impl(TyObject *module, TyObject *name);

static TyObject *
os_unsetenv(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name = NULL;

    if (!TyUnicode_FSConverter(arg, &name)) {
        goto exit;
    }
    return_value = os_unsetenv_impl(module, name);

exit:
    /* Cleanup for name */
    Ty_XDECREF(name);

    return return_value;
}

#endif /* !defined(MS_WINDOWS) */

TyDoc_STRVAR(os_strerror__doc__,
"strerror($module, code, /)\n"
"--\n"
"\n"
"Translate an error code to a message string.");

#define OS_STRERROR_METHODDEF    \
    {"strerror", (PyCFunction)os_strerror, METH_O, os_strerror__doc__},

static TyObject *
os_strerror_impl(TyObject *module, int code);

static TyObject *
os_strerror(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int code;

    code = TyLong_AsInt(arg);
    if (code == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_strerror_impl(module, code);

exit:
    return return_value;
}

#if defined(HAVE_SYS_WAIT_H) && defined(WCOREDUMP)

TyDoc_STRVAR(os_WCOREDUMP__doc__,
"WCOREDUMP($module, status, /)\n"
"--\n"
"\n"
"Return True if the process returning status was dumped to a core file.");

#define OS_WCOREDUMP_METHODDEF    \
    {"WCOREDUMP", (PyCFunction)os_WCOREDUMP, METH_O, os_WCOREDUMP__doc__},

static int
os_WCOREDUMP_impl(TyObject *module, int status);

static TyObject *
os_WCOREDUMP(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int status;
    int _return_value;

    status = TyLong_AsInt(arg);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WCOREDUMP_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WCOREDUMP) */

#if defined(HAVE_SYS_WAIT_H) && defined(WIFCONTINUED)

TyDoc_STRVAR(os_WIFCONTINUED__doc__,
"WIFCONTINUED($module, /, status)\n"
"--\n"
"\n"
"Return True if a particular process was continued from a job control stop.\n"
"\n"
"Return True if the process returning status was continued from a\n"
"job control stop.");

#define OS_WIFCONTINUED_METHODDEF    \
    {"WIFCONTINUED", _PyCFunction_CAST(os_WIFCONTINUED), METH_FASTCALL|METH_KEYWORDS, os_WIFCONTINUED__doc__},

static int
os_WIFCONTINUED_impl(TyObject *module, int status);

static TyObject *
os_WIFCONTINUED(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WIFCONTINUED",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WIFCONTINUED_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WIFCONTINUED) */

#if defined(HAVE_SYS_WAIT_H) && defined(WIFSTOPPED)

TyDoc_STRVAR(os_WIFSTOPPED__doc__,
"WIFSTOPPED($module, /, status)\n"
"--\n"
"\n"
"Return True if the process returning status was stopped.");

#define OS_WIFSTOPPED_METHODDEF    \
    {"WIFSTOPPED", _PyCFunction_CAST(os_WIFSTOPPED), METH_FASTCALL|METH_KEYWORDS, os_WIFSTOPPED__doc__},

static int
os_WIFSTOPPED_impl(TyObject *module, int status);

static TyObject *
os_WIFSTOPPED(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WIFSTOPPED",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WIFSTOPPED_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WIFSTOPPED) */

#if defined(HAVE_SYS_WAIT_H) && defined(WIFSIGNALED)

TyDoc_STRVAR(os_WIFSIGNALED__doc__,
"WIFSIGNALED($module, /, status)\n"
"--\n"
"\n"
"Return True if the process returning status was terminated by a signal.");

#define OS_WIFSIGNALED_METHODDEF    \
    {"WIFSIGNALED", _PyCFunction_CAST(os_WIFSIGNALED), METH_FASTCALL|METH_KEYWORDS, os_WIFSIGNALED__doc__},

static int
os_WIFSIGNALED_impl(TyObject *module, int status);

static TyObject *
os_WIFSIGNALED(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WIFSIGNALED",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WIFSIGNALED_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WIFSIGNALED) */

#if defined(HAVE_SYS_WAIT_H) && defined(WIFEXITED)

TyDoc_STRVAR(os_WIFEXITED__doc__,
"WIFEXITED($module, /, status)\n"
"--\n"
"\n"
"Return True if the process returning status exited via the exit() system call.");

#define OS_WIFEXITED_METHODDEF    \
    {"WIFEXITED", _PyCFunction_CAST(os_WIFEXITED), METH_FASTCALL|METH_KEYWORDS, os_WIFEXITED__doc__},

static int
os_WIFEXITED_impl(TyObject *module, int status);

static TyObject *
os_WIFEXITED(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WIFEXITED",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WIFEXITED_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WIFEXITED) */

#if defined(HAVE_SYS_WAIT_H) && defined(WEXITSTATUS)

TyDoc_STRVAR(os_WEXITSTATUS__doc__,
"WEXITSTATUS($module, /, status)\n"
"--\n"
"\n"
"Return the process return code from status.");

#define OS_WEXITSTATUS_METHODDEF    \
    {"WEXITSTATUS", _PyCFunction_CAST(os_WEXITSTATUS), METH_FASTCALL|METH_KEYWORDS, os_WEXITSTATUS__doc__},

static int
os_WEXITSTATUS_impl(TyObject *module, int status);

static TyObject *
os_WEXITSTATUS(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WEXITSTATUS",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WEXITSTATUS_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WEXITSTATUS) */

#if defined(HAVE_SYS_WAIT_H) && defined(WTERMSIG)

TyDoc_STRVAR(os_WTERMSIG__doc__,
"WTERMSIG($module, /, status)\n"
"--\n"
"\n"
"Return the signal that terminated the process that provided the status value.");

#define OS_WTERMSIG_METHODDEF    \
    {"WTERMSIG", _PyCFunction_CAST(os_WTERMSIG), METH_FASTCALL|METH_KEYWORDS, os_WTERMSIG__doc__},

static int
os_WTERMSIG_impl(TyObject *module, int status);

static TyObject *
os_WTERMSIG(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WTERMSIG",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WTERMSIG_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WTERMSIG) */

#if defined(HAVE_SYS_WAIT_H) && defined(WSTOPSIG)

TyDoc_STRVAR(os_WSTOPSIG__doc__,
"WSTOPSIG($module, /, status)\n"
"--\n"
"\n"
"Return the signal that stopped the process that provided the status value.");

#define OS_WSTOPSIG_METHODDEF    \
    {"WSTOPSIG", _PyCFunction_CAST(os_WSTOPSIG), METH_FASTCALL|METH_KEYWORDS, os_WSTOPSIG__doc__},

static int
os_WSTOPSIG_impl(TyObject *module, int status);

static TyObject *
os_WSTOPSIG(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "WSTOPSIG",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int status;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status = TyLong_AsInt(args[0]);
    if (status == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_WSTOPSIG_impl(module, status);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYS_WAIT_H) && defined(WSTOPSIG) */

#if (defined(HAVE_FSTATVFS) && defined(HAVE_SYS_STATVFS_H))

TyDoc_STRVAR(os_fstatvfs__doc__,
"fstatvfs($module, fd, /)\n"
"--\n"
"\n"
"Perform an fstatvfs system call on the given fd.\n"
"\n"
"Equivalent to statvfs(fd).");

#define OS_FSTATVFS_METHODDEF    \
    {"fstatvfs", (PyCFunction)os_fstatvfs, METH_O, os_fstatvfs__doc__},

static TyObject *
os_fstatvfs_impl(TyObject *module, int fd);

static TyObject *
os_fstatvfs(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_fstatvfs_impl(module, fd);

exit:
    return return_value;
}

#endif /* (defined(HAVE_FSTATVFS) && defined(HAVE_SYS_STATVFS_H)) */

#if (defined(HAVE_STATVFS) && defined(HAVE_SYS_STATVFS_H))

TyDoc_STRVAR(os_statvfs__doc__,
"statvfs($module, /, path)\n"
"--\n"
"\n"
"Perform a statvfs system call on the given path.\n"
"\n"
"path may always be specified as a string.\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"  If this functionality is unavailable, using it raises an exception.");

#define OS_STATVFS_METHODDEF    \
    {"statvfs", _PyCFunction_CAST(os_statvfs), METH_FASTCALL|METH_KEYWORDS, os_statvfs__doc__},

static TyObject *
os_statvfs_impl(TyObject *module, path_t *path);

static TyObject *
os_statvfs(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "statvfs",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("statvfs", "path", 0, 0, 0, PATH_HAVE_FSTATVFS);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os_statvfs_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(HAVE_STATVFS) && defined(HAVE_SYS_STATVFS_H)) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__getdiskusage__doc__,
"_getdiskusage($module, /, path)\n"
"--\n"
"\n"
"Return disk usage statistics about the given path as a (total, free) tuple.");

#define OS__GETDISKUSAGE_METHODDEF    \
    {"_getdiskusage", _PyCFunction_CAST(os__getdiskusage), METH_FASTCALL|METH_KEYWORDS, os__getdiskusage__doc__},

static TyObject *
os__getdiskusage_impl(TyObject *module, path_t *path);

static TyObject *
os__getdiskusage(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_getdiskusage",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_getdiskusage", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__getdiskusage_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(HAVE_FPATHCONF)

TyDoc_STRVAR(os_fpathconf__doc__,
"fpathconf($module, fd, name, /)\n"
"--\n"
"\n"
"Return the configuration limit name for the file descriptor fd.\n"
"\n"
"If there is no limit, return -1.");

#define OS_FPATHCONF_METHODDEF    \
    {"fpathconf", _PyCFunction_CAST(os_fpathconf), METH_FASTCALL, os_fpathconf__doc__},

static long
os_fpathconf_impl(TyObject *module, int fd, int name);

static TyObject *
os_fpathconf(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int name;
    long _return_value;

    if (!_TyArg_CheckPositional("fpathconf", nargs, 2, 2)) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    if (!conv_confname(module, args[1], &name, "pathconf_names")) {
        goto exit;
    }
    _return_value = os_fpathconf_impl(module, fd, name);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_FPATHCONF) */

#if defined(HAVE_PATHCONF)

TyDoc_STRVAR(os_pathconf__doc__,
"pathconf($module, /, path, name)\n"
"--\n"
"\n"
"Return the configuration limit name for the file or directory path.\n"
"\n"
"If there is no limit, return -1.\n"
"On some platforms, path may also be specified as an open file descriptor.\n"
"  If this functionality is unavailable, using it raises an exception.");

#define OS_PATHCONF_METHODDEF    \
    {"pathconf", _PyCFunction_CAST(os_pathconf), METH_FASTCALL|METH_KEYWORDS, os_pathconf__doc__},

static long
os_pathconf_impl(TyObject *module, path_t *path, int name);

static TyObject *
os_pathconf(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "pathconf",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    path_t path = PATH_T_INITIALIZE_P("pathconf", "path", 0, 0, 0, PATH_HAVE_FPATHCONF);
    int name;
    long _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!conv_confname(module, args[1], &name, "pathconf_names")) {
        goto exit;
    }
    _return_value = os_pathconf_impl(module, &path, name);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(HAVE_PATHCONF) */

#if defined(HAVE_CONFSTR)

TyDoc_STRVAR(os_confstr__doc__,
"confstr($module, name, /)\n"
"--\n"
"\n"
"Return a string-valued system configuration variable.");

#define OS_CONFSTR_METHODDEF    \
    {"confstr", (PyCFunction)os_confstr, METH_O, os_confstr__doc__},

static TyObject *
os_confstr_impl(TyObject *module, int name);

static TyObject *
os_confstr(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int name;

    if (!conv_confname(module, arg, &name, "confstr_names")) {
        goto exit;
    }
    return_value = os_confstr_impl(module, name);

exit:
    return return_value;
}

#endif /* defined(HAVE_CONFSTR) */

#if defined(HAVE_SYSCONF)

TyDoc_STRVAR(os_sysconf__doc__,
"sysconf($module, name, /)\n"
"--\n"
"\n"
"Return an integer-valued system configuration variable.");

#define OS_SYSCONF_METHODDEF    \
    {"sysconf", (PyCFunction)os_sysconf, METH_O, os_sysconf__doc__},

static long
os_sysconf_impl(TyObject *module, int name);

static TyObject *
os_sysconf(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int name;
    long _return_value;

    if (!conv_confname(module, arg, &name, "sysconf_names")) {
        goto exit;
    }
    _return_value = os_sysconf_impl(module, name);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong(_return_value);

exit:
    return return_value;
}

#endif /* defined(HAVE_SYSCONF) */

TyDoc_STRVAR(os_abort__doc__,
"abort($module, /)\n"
"--\n"
"\n"
"Abort the interpreter immediately.\n"
"\n"
"This function \'dumps core\' or otherwise fails in the hardest way possible\n"
"on the hosting operating system.  This function never returns.");

#define OS_ABORT_METHODDEF    \
    {"abort", (PyCFunction)os_abort, METH_NOARGS, os_abort__doc__},

static TyObject *
os_abort_impl(TyObject *module);

static TyObject *
os_abort(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_abort_impl(module);
}

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_startfile__doc__,
"startfile($module, /, filepath, operation=<unrepresentable>,\n"
"          arguments=<unrepresentable>, cwd=None, show_cmd=1)\n"
"--\n"
"\n"
"Start a file with its associated application.\n"
"\n"
"When \"operation\" is not specified or \"open\", this acts like\n"
"double-clicking the file in Explorer, or giving the file name as an\n"
"argument to the DOS \"start\" command: the file is opened with whatever\n"
"application (if any) its extension is associated.\n"
"When another \"operation\" is given, it specifies what should be done with\n"
"the file.  A typical operation is \"print\".\n"
"\n"
"\"arguments\" is passed to the application, but should be omitted if the\n"
"file is a document.\n"
"\n"
"\"cwd\" is the working directory for the operation. If \"filepath\" is\n"
"relative, it will be resolved against this directory. This argument\n"
"should usually be an absolute path.\n"
"\n"
"\"show_cmd\" can be used to override the recommended visibility option.\n"
"See the Windows ShellExecute documentation for values.\n"
"\n"
"startfile returns as soon as the associated application is launched.\n"
"There is no option to wait for the application to close, and no way\n"
"to retrieve the application\'s exit status.\n"
"\n"
"The filepath is relative to the current directory.  If you want to use\n"
"an absolute path, make sure the first character is not a slash (\"/\");\n"
"the underlying Win32 ShellExecute function doesn\'t work if it is.");

#define OS_STARTFILE_METHODDEF    \
    {"startfile", _PyCFunction_CAST(os_startfile), METH_FASTCALL|METH_KEYWORDS, os_startfile__doc__},

static TyObject *
os_startfile_impl(TyObject *module, path_t *filepath,
                  const wchar_t *operation, const wchar_t *arguments,
                  path_t *cwd, int show_cmd);

static TyObject *
os_startfile(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(filepath), &_Ty_ID(operation), &_Ty_ID(arguments), &_Ty_ID(cwd), &_Ty_ID(show_cmd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"filepath", "operation", "arguments", "cwd", "show_cmd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "startfile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    path_t filepath = PATH_T_INITIALIZE_P("startfile", "filepath", 0, 0, 0, 0);
    const wchar_t *operation = NULL;
    const wchar_t *arguments = NULL;
    path_t cwd = PATH_T_INITIALIZE_P("startfile", "cwd", 1, 0, 0, 0);
    int show_cmd = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 5, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &filepath)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        if (!TyUnicode_Check(args[1])) {
            _TyArg_BadArgument("startfile", "argument 'operation'", "str", args[1]);
            goto exit;
        }
        operation = TyUnicode_AsWideCharString(args[1], NULL);
        if (operation == NULL) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[2]) {
        if (!TyUnicode_Check(args[2])) {
            _TyArg_BadArgument("startfile", "argument 'arguments'", "str", args[2]);
            goto exit;
        }
        arguments = TyUnicode_AsWideCharString(args[2], NULL);
        if (arguments == NULL) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[3]) {
        if (!path_converter(args[3], &cwd)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    show_cmd = TyLong_AsInt(args[4]);
    if (show_cmd == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_startfile_impl(module, &filepath, operation, arguments, &cwd, show_cmd);

exit:
    /* Cleanup for filepath */
    path_cleanup(&filepath);
    /* Cleanup for operation */
    TyMem_Free((void *)operation);
    /* Cleanup for arguments */
    TyMem_Free((void *)arguments);
    /* Cleanup for cwd */
    path_cleanup(&cwd);

    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(HAVE_GETLOADAVG)

TyDoc_STRVAR(os_getloadavg__doc__,
"getloadavg($module, /)\n"
"--\n"
"\n"
"Return average recent system load information.\n"
"\n"
"Return the number of processes in the system run queue averaged over\n"
"the last 1, 5, and 15 minutes as a tuple of three floats.\n"
"Raises OSError if the load average was unobtainable.");

#define OS_GETLOADAVG_METHODDEF    \
    {"getloadavg", (PyCFunction)os_getloadavg, METH_NOARGS, os_getloadavg__doc__},

static TyObject *
os_getloadavg_impl(TyObject *module);

static TyObject *
os_getloadavg(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getloadavg_impl(module);
}

#endif /* defined(HAVE_GETLOADAVG) */

TyDoc_STRVAR(os_device_encoding__doc__,
"device_encoding($module, /, fd)\n"
"--\n"
"\n"
"Return a string describing the encoding of a terminal\'s file descriptor.\n"
"\n"
"The file descriptor must be attached to a terminal.\n"
"If the device is not a terminal, return None.");

#define OS_DEVICE_ENCODING_METHODDEF    \
    {"device_encoding", _PyCFunction_CAST(os_device_encoding), METH_FASTCALL|METH_KEYWORDS, os_device_encoding__doc__},

static TyObject *
os_device_encoding_impl(TyObject *module, int fd);

static TyObject *
os_device_encoding(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "device_encoding",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_device_encoding_impl(module, fd);

exit:
    return return_value;
}

#if defined(HAVE_SETRESUID)

TyDoc_STRVAR(os_setresuid__doc__,
"setresuid($module, ruid, euid, suid, /)\n"
"--\n"
"\n"
"Set the current process\'s real, effective, and saved user ids.");

#define OS_SETRESUID_METHODDEF    \
    {"setresuid", _PyCFunction_CAST(os_setresuid), METH_FASTCALL, os_setresuid__doc__},

static TyObject *
os_setresuid_impl(TyObject *module, uid_t ruid, uid_t euid, uid_t suid);

static TyObject *
os_setresuid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    uid_t ruid;
    uid_t euid;
    uid_t suid;

    if (!_TyArg_CheckPositional("setresuid", nargs, 3, 3)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[0], &ruid)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[1], &euid)) {
        goto exit;
    }
    if (!_Ty_Uid_Converter(args[2], &suid)) {
        goto exit;
    }
    return_value = os_setresuid_impl(module, ruid, euid, suid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETRESUID) */

#if defined(HAVE_SETRESGID)

TyDoc_STRVAR(os_setresgid__doc__,
"setresgid($module, rgid, egid, sgid, /)\n"
"--\n"
"\n"
"Set the current process\'s real, effective, and saved group ids.");

#define OS_SETRESGID_METHODDEF    \
    {"setresgid", _PyCFunction_CAST(os_setresgid), METH_FASTCALL, os_setresgid__doc__},

static TyObject *
os_setresgid_impl(TyObject *module, gid_t rgid, gid_t egid, gid_t sgid);

static TyObject *
os_setresgid(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    gid_t rgid;
    gid_t egid;
    gid_t sgid;

    if (!_TyArg_CheckPositional("setresgid", nargs, 3, 3)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[0], &rgid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[1], &egid)) {
        goto exit;
    }
    if (!_Ty_Gid_Converter(args[2], &sgid)) {
        goto exit;
    }
    return_value = os_setresgid_impl(module, rgid, egid, sgid);

exit:
    return return_value;
}

#endif /* defined(HAVE_SETRESGID) */

#if defined(HAVE_GETRESUID)

TyDoc_STRVAR(os_getresuid__doc__,
"getresuid($module, /)\n"
"--\n"
"\n"
"Return a tuple of the current process\'s real, effective, and saved user ids.");

#define OS_GETRESUID_METHODDEF    \
    {"getresuid", (PyCFunction)os_getresuid, METH_NOARGS, os_getresuid__doc__},

static TyObject *
os_getresuid_impl(TyObject *module);

static TyObject *
os_getresuid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getresuid_impl(module);
}

#endif /* defined(HAVE_GETRESUID) */

#if defined(HAVE_GETRESGID)

TyDoc_STRVAR(os_getresgid__doc__,
"getresgid($module, /)\n"
"--\n"
"\n"
"Return a tuple of the current process\'s real, effective, and saved group ids.");

#define OS_GETRESGID_METHODDEF    \
    {"getresgid", (PyCFunction)os_getresgid, METH_NOARGS, os_getresgid__doc__},

static TyObject *
os_getresgid_impl(TyObject *module);

static TyObject *
os_getresgid(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_getresgid_impl(module);
}

#endif /* defined(HAVE_GETRESGID) */

#if defined(USE_XATTRS)

TyDoc_STRVAR(os_getxattr__doc__,
"getxattr($module, /, path, attribute, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Return the value of extended attribute attribute on path.\n"
"\n"
"path may be either a string, a path-like object, or an open file descriptor.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, getxattr will examine the symbolic link itself instead of the file\n"
"  the link points to.");

#define OS_GETXATTR_METHODDEF    \
    {"getxattr", _PyCFunction_CAST(os_getxattr), METH_FASTCALL|METH_KEYWORDS, os_getxattr__doc__},

static TyObject *
os_getxattr_impl(TyObject *module, path_t *path, path_t *attribute,
                 int follow_symlinks);

static TyObject *
os_getxattr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(attribute), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "attribute", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getxattr",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("getxattr", "path", 0, 0, 0, 1);
    path_t attribute = PATH_T_INITIALIZE_P("getxattr", "attribute", 0, 0, 0, 0);
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!path_converter(args[1], &attribute)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[2]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_getxattr_impl(module, &path, &attribute, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);
    /* Cleanup for attribute */
    path_cleanup(&attribute);

    return return_value;
}

#endif /* defined(USE_XATTRS) */

#if defined(USE_XATTRS)

TyDoc_STRVAR(os_setxattr__doc__,
"setxattr($module, /, path, attribute, value, flags=0, *,\n"
"         follow_symlinks=True)\n"
"--\n"
"\n"
"Set extended attribute attribute on path to value.\n"
"\n"
"path may be either a string, a path-like object,  or an open file descriptor.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, setxattr will modify the symbolic link itself instead of the file\n"
"  the link points to.");

#define OS_SETXATTR_METHODDEF    \
    {"setxattr", _PyCFunction_CAST(os_setxattr), METH_FASTCALL|METH_KEYWORDS, os_setxattr__doc__},

static TyObject *
os_setxattr_impl(TyObject *module, path_t *path, path_t *attribute,
                 Ty_buffer *value, int flags, int follow_symlinks);

static TyObject *
os_setxattr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(attribute), &_Ty_ID(value), &_Ty_ID(flags), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "attribute", "value", "flags", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "setxattr",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    path_t path = PATH_T_INITIALIZE_P("setxattr", "path", 0, 0, 0, 1);
    path_t attribute = PATH_T_INITIALIZE_P("setxattr", "attribute", 0, 0, 0, 0);
    Ty_buffer value = {NULL, NULL};
    int flags = 0;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!path_converter(args[1], &attribute)) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[2], &value, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[3]) {
        flags = TyLong_AsInt(args[3]);
        if (flags == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[4]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_setxattr_impl(module, &path, &attribute, &value, flags, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);
    /* Cleanup for attribute */
    path_cleanup(&attribute);
    /* Cleanup for value */
    if (value.obj) {
       PyBuffer_Release(&value);
    }

    return return_value;
}

#endif /* defined(USE_XATTRS) */

#if defined(USE_XATTRS)

TyDoc_STRVAR(os_removexattr__doc__,
"removexattr($module, /, path, attribute, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Remove extended attribute attribute on path.\n"
"\n"
"path may be either a string, a path-like object, or an open file descriptor.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, removexattr will modify the symbolic link itself instead of the file\n"
"  the link points to.");

#define OS_REMOVEXATTR_METHODDEF    \
    {"removexattr", _PyCFunction_CAST(os_removexattr), METH_FASTCALL|METH_KEYWORDS, os_removexattr__doc__},

static TyObject *
os_removexattr_impl(TyObject *module, path_t *path, path_t *attribute,
                    int follow_symlinks);

static TyObject *
os_removexattr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(attribute), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "attribute", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "removexattr",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    path_t path = PATH_T_INITIALIZE_P("removexattr", "path", 0, 0, 0, 1);
    path_t attribute = PATH_T_INITIALIZE_P("removexattr", "attribute", 0, 0, 0, 0);
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    if (!path_converter(args[1], &attribute)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[2]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_removexattr_impl(module, &path, &attribute, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);
    /* Cleanup for attribute */
    path_cleanup(&attribute);

    return return_value;
}

#endif /* defined(USE_XATTRS) */

#if defined(USE_XATTRS)

TyDoc_STRVAR(os_listxattr__doc__,
"listxattr($module, /, path=None, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Return a list of extended attributes on path.\n"
"\n"
"path may be either None, a string, a path-like object, or an open file descriptor.\n"
"if path is None, listxattr will examine the current directory.\n"
"If follow_symlinks is False, and the last element of the path is a symbolic\n"
"  link, listxattr will examine the symbolic link itself instead of the file\n"
"  the link points to.");

#define OS_LISTXATTR_METHODDEF    \
    {"listxattr", _PyCFunction_CAST(os_listxattr), METH_FASTCALL|METH_KEYWORDS, os_listxattr__doc__},

static TyObject *
os_listxattr_impl(TyObject *module, path_t *path, int follow_symlinks);

static TyObject *
os_listxattr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "listxattr",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    path_t path = PATH_T_INITIALIZE_P("listxattr", "path", 1, 0, 0, 1);
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        if (!path_converter(args[0], &path)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[1]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_listxattr_impl(module, &path, follow_symlinks);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* defined(USE_XATTRS) */

TyDoc_STRVAR(os_urandom__doc__,
"urandom($module, size, /)\n"
"--\n"
"\n"
"Return a bytes object containing random bytes suitable for cryptographic use.");

#define OS_URANDOM_METHODDEF    \
    {"urandom", (PyCFunction)os_urandom, METH_O, os_urandom__doc__},

static TyObject *
os_urandom_impl(TyObject *module, Ty_ssize_t size);

static TyObject *
os_urandom(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    Ty_ssize_t size;

    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(arg);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        size = ival;
    }
    return_value = os_urandom_impl(module, size);

exit:
    return return_value;
}

#if defined(HAVE_MEMFD_CREATE)

TyDoc_STRVAR(os_memfd_create__doc__,
"memfd_create($module, /, name, flags=MFD_CLOEXEC)\n"
"--\n"
"\n");

#define OS_MEMFD_CREATE_METHODDEF    \
    {"memfd_create", _PyCFunction_CAST(os_memfd_create), METH_FASTCALL|METH_KEYWORDS, os_memfd_create__doc__},

static TyObject *
os_memfd_create_impl(TyObject *module, TyObject *name, unsigned int flags);

static TyObject *
os_memfd_create(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "memfd_create",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *name = NULL;
    unsigned int flags = MFD_CLOEXEC;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_FSConverter(args[0], &name)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    flags = (unsigned int)TyLong_AsUnsignedLongMask(args[1]);
    if (flags == (unsigned int)-1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_memfd_create_impl(module, name, flags);

exit:
    /* Cleanup for name */
    Ty_XDECREF(name);

    return return_value;
}

#endif /* defined(HAVE_MEMFD_CREATE) */

#if (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC))

TyDoc_STRVAR(os_eventfd__doc__,
"eventfd($module, /, initval, flags=EFD_CLOEXEC)\n"
"--\n"
"\n"
"Creates and returns an event notification file descriptor.");

#define OS_EVENTFD_METHODDEF    \
    {"eventfd", _PyCFunction_CAST(os_eventfd), METH_FASTCALL|METH_KEYWORDS, os_eventfd__doc__},

static TyObject *
os_eventfd_impl(TyObject *module, unsigned int initval, int flags);

static TyObject *
os_eventfd(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(initval), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"initval", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "eventfd",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    unsigned int initval;
    int flags = EFD_CLOEXEC;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!_TyLong_UnsignedInt_Converter(args[0], &initval)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_eventfd_impl(module, initval, flags);

exit:
    return return_value;
}

#endif /* (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC)) */

#if (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC))

TyDoc_STRVAR(os_eventfd_read__doc__,
"eventfd_read($module, /, fd)\n"
"--\n"
"\n"
"Read eventfd value");

#define OS_EVENTFD_READ_METHODDEF    \
    {"eventfd_read", _PyCFunction_CAST(os_eventfd_read), METH_FASTCALL|METH_KEYWORDS, os_eventfd_read__doc__},

static TyObject *
os_eventfd_read_impl(TyObject *module, int fd);

static TyObject *
os_eventfd_read(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "eventfd_read",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int fd;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    return_value = os_eventfd_read_impl(module, fd);

exit:
    return return_value;
}

#endif /* (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC)) */

#if (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC))

TyDoc_STRVAR(os_eventfd_write__doc__,
"eventfd_write($module, /, fd, value)\n"
"--\n"
"\n"
"Write eventfd value.");

#define OS_EVENTFD_WRITE_METHODDEF    \
    {"eventfd_write", _PyCFunction_CAST(os_eventfd_write), METH_FASTCALL|METH_KEYWORDS, os_eventfd_write__doc__},

static TyObject *
os_eventfd_write_impl(TyObject *module, int fd, unsigned long long value);

static TyObject *
os_eventfd_write(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(fd), &_Ty_ID(value), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"fd", "value", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "eventfd_write",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    int fd;
    unsigned long long value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    if (!_TyLong_UnsignedLongLong_Converter(args[1], &value)) {
        goto exit;
    }
    return_value = os_eventfd_write_impl(module, fd, value);

exit:
    return return_value;
}

#endif /* (defined(HAVE_EVENTFD) && defined(EFD_CLOEXEC)) */

#if (defined(TERMSIZE_USE_CONIO) || defined(TERMSIZE_USE_IOCTL))

TyDoc_STRVAR(os_get_terminal_size__doc__,
"get_terminal_size($module, fd=<unrepresentable>, /)\n"
"--\n"
"\n"
"Return the size of the terminal window as (columns, lines).\n"
"\n"
"The optional argument fd (default standard output) specifies\n"
"which file descriptor should be queried.\n"
"\n"
"If the file descriptor is not connected to a terminal, an OSError\n"
"is thrown.\n"
"\n"
"This function will only be defined if an implementation is\n"
"available for this system.\n"
"\n"
"shutil.get_terminal_size is the high-level function which should\n"
"normally be used, os.get_terminal_size is the low-level implementation.");

#define OS_GET_TERMINAL_SIZE_METHODDEF    \
    {"get_terminal_size", _PyCFunction_CAST(os_get_terminal_size), METH_FASTCALL, os_get_terminal_size__doc__},

static TyObject *
os_get_terminal_size_impl(TyObject *module, int fd);

static TyObject *
os_get_terminal_size(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd = fileno(stdout);

    if (!_TyArg_CheckPositional("get_terminal_size", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional:
    return_value = os_get_terminal_size_impl(module, fd);

exit:
    return return_value;
}

#endif /* (defined(TERMSIZE_USE_CONIO) || defined(TERMSIZE_USE_IOCTL)) */

TyDoc_STRVAR(os_cpu_count__doc__,
"cpu_count($module, /)\n"
"--\n"
"\n"
"Return the number of logical CPUs in the system.\n"
"\n"
"Return None if indeterminable.");

#define OS_CPU_COUNT_METHODDEF    \
    {"cpu_count", (PyCFunction)os_cpu_count, METH_NOARGS, os_cpu_count__doc__},

static TyObject *
os_cpu_count_impl(TyObject *module);

static TyObject *
os_cpu_count(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os_cpu_count_impl(module);
}

TyDoc_STRVAR(os_get_inheritable__doc__,
"get_inheritable($module, fd, /)\n"
"--\n"
"\n"
"Get the close-on-exe flag of the specified file descriptor.");

#define OS_GET_INHERITABLE_METHODDEF    \
    {"get_inheritable", (PyCFunction)os_get_inheritable, METH_O, os_get_inheritable__doc__},

static int
os_get_inheritable_impl(TyObject *module, int fd);

static TyObject *
os_get_inheritable(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;
    int _return_value;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_get_inheritable_impl(module, fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_set_inheritable__doc__,
"set_inheritable($module, fd, inheritable, /)\n"
"--\n"
"\n"
"Set the inheritable flag of the specified file descriptor.");

#define OS_SET_INHERITABLE_METHODDEF    \
    {"set_inheritable", _PyCFunction_CAST(os_set_inheritable), METH_FASTCALL, os_set_inheritable__doc__},

static TyObject *
os_set_inheritable_impl(TyObject *module, int fd, int inheritable);

static TyObject *
os_set_inheritable(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int inheritable;

    if (!_TyArg_CheckPositional("set_inheritable", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    inheritable = TyLong_AsInt(args[1]);
    if (inheritable == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = os_set_inheritable_impl(module, fd, inheritable);

exit:
    return return_value;
}

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_get_handle_inheritable__doc__,
"get_handle_inheritable($module, handle, /)\n"
"--\n"
"\n"
"Get the close-on-exe flag of the specified file descriptor.");

#define OS_GET_HANDLE_INHERITABLE_METHODDEF    \
    {"get_handle_inheritable", (PyCFunction)os_get_handle_inheritable, METH_O, os_get_handle_inheritable__doc__},

static int
os_get_handle_inheritable_impl(TyObject *module, intptr_t handle);

static TyObject *
os_get_handle_inheritable(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    intptr_t handle;
    int _return_value;

    handle = (intptr_t)TyLong_AsVoidPtr(arg);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_get_handle_inheritable_impl(module, handle);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os_set_handle_inheritable__doc__,
"set_handle_inheritable($module, handle, inheritable, /)\n"
"--\n"
"\n"
"Set the inheritable flag of the specified handle.");

#define OS_SET_HANDLE_INHERITABLE_METHODDEF    \
    {"set_handle_inheritable", _PyCFunction_CAST(os_set_handle_inheritable), METH_FASTCALL, os_set_handle_inheritable__doc__},

static TyObject *
os_set_handle_inheritable_impl(TyObject *module, intptr_t handle,
                               int inheritable);

static TyObject *
os_set_handle_inheritable(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    intptr_t handle;
    int inheritable;

    if (!_TyArg_CheckPositional("set_handle_inheritable", nargs, 2, 2)) {
        goto exit;
    }
    handle = (intptr_t)TyLong_AsVoidPtr(args[0]);
    if (!handle && TyErr_Occurred()) {
        goto exit;
    }
    inheritable = PyObject_IsTrue(args[1]);
    if (inheritable < 0) {
        goto exit;
    }
    return_value = os_set_handle_inheritable_impl(module, handle, inheritable);

exit:
    return return_value;
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(os_get_blocking__doc__,
"get_blocking($module, fd, /)\n"
"--\n"
"\n"
"Get the blocking mode of the file descriptor.\n"
"\n"
"Return False if the O_NONBLOCK flag is set, True if the flag is cleared.");

#define OS_GET_BLOCKING_METHODDEF    \
    {"get_blocking", (PyCFunction)os_get_blocking, METH_O, os_get_blocking__doc__},

static int
os_get_blocking_impl(TyObject *module, int fd);

static TyObject *
os_get_blocking(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;
    int _return_value;

    fd = TyLong_AsInt(arg);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = os_get_blocking_impl(module, fd);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_set_blocking__doc__,
"set_blocking($module, fd, blocking, /)\n"
"--\n"
"\n"
"Set the blocking mode of the specified file descriptor.\n"
"\n"
"Set the O_NONBLOCK flag if blocking is False,\n"
"clear the O_NONBLOCK flag otherwise.");

#define OS_SET_BLOCKING_METHODDEF    \
    {"set_blocking", _PyCFunction_CAST(os_set_blocking), METH_FASTCALL, os_set_blocking__doc__},

static TyObject *
os_set_blocking_impl(TyObject *module, int fd, int blocking);

static TyObject *
os_set_blocking(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int blocking;

    if (!_TyArg_CheckPositional("set_blocking", nargs, 2, 2)) {
        goto exit;
    }
    fd = TyLong_AsInt(args[0]);
    if (fd == -1 && TyErr_Occurred()) {
        goto exit;
    }
    blocking = PyObject_IsTrue(args[1]);
    if (blocking < 0) {
        goto exit;
    }
    return_value = os_set_blocking_impl(module, fd, blocking);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_is_symlink__doc__,
"is_symlink($self, /)\n"
"--\n"
"\n"
"Return True if the entry is a symbolic link; cached per entry.");

#define OS_DIRENTRY_IS_SYMLINK_METHODDEF    \
    {"is_symlink", _PyCFunction_CAST(os_DirEntry_is_symlink), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, os_DirEntry_is_symlink__doc__},

static int
os_DirEntry_is_symlink_impl(DirEntry *self, TyTypeObject *defining_class);

static TyObject *
os_DirEntry_is_symlink(TyObject *self, TyTypeObject *defining_class, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    int _return_value;

    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "is_symlink() takes no arguments");
        goto exit;
    }
    _return_value = os_DirEntry_is_symlink_impl((DirEntry *)self, defining_class);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_is_junction__doc__,
"is_junction($self, /)\n"
"--\n"
"\n"
"Return True if the entry is a junction; cached per entry.");

#define OS_DIRENTRY_IS_JUNCTION_METHODDEF    \
    {"is_junction", (PyCFunction)os_DirEntry_is_junction, METH_NOARGS, os_DirEntry_is_junction__doc__},

static int
os_DirEntry_is_junction_impl(DirEntry *self);

static TyObject *
os_DirEntry_is_junction(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = os_DirEntry_is_junction_impl((DirEntry *)self);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_stat__doc__,
"stat($self, /, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Return stat_result object for the entry; cached per entry.");

#define OS_DIRENTRY_STAT_METHODDEF    \
    {"stat", _PyCFunction_CAST(os_DirEntry_stat), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, os_DirEntry_stat__doc__},

static TyObject *
os_DirEntry_stat_impl(DirEntry *self, TyTypeObject *defining_class,
                      int follow_symlinks);

static TyObject *
os_DirEntry_stat(TyObject *self, TyTypeObject *defining_class, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "stat",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int follow_symlinks = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[0]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = os_DirEntry_stat_impl((DirEntry *)self, defining_class, follow_symlinks);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_is_dir__doc__,
"is_dir($self, /, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Return True if the entry is a directory; cached per entry.");

#define OS_DIRENTRY_IS_DIR_METHODDEF    \
    {"is_dir", _PyCFunction_CAST(os_DirEntry_is_dir), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, os_DirEntry_is_dir__doc__},

static int
os_DirEntry_is_dir_impl(DirEntry *self, TyTypeObject *defining_class,
                        int follow_symlinks);

static TyObject *
os_DirEntry_is_dir(TyObject *self, TyTypeObject *defining_class, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "is_dir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int follow_symlinks = 1;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[0]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    _return_value = os_DirEntry_is_dir_impl((DirEntry *)self, defining_class, follow_symlinks);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_is_file__doc__,
"is_file($self, /, *, follow_symlinks=True)\n"
"--\n"
"\n"
"Return True if the entry is a file; cached per entry.");

#define OS_DIRENTRY_IS_FILE_METHODDEF    \
    {"is_file", _PyCFunction_CAST(os_DirEntry_is_file), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, os_DirEntry_is_file__doc__},

static int
os_DirEntry_is_file_impl(DirEntry *self, TyTypeObject *defining_class,
                         int follow_symlinks);

static TyObject *
os_DirEntry_is_file(TyObject *self, TyTypeObject *defining_class, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(follow_symlinks), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"follow_symlinks", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "is_file",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int follow_symlinks = 1;
    int _return_value;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    follow_symlinks = PyObject_IsTrue(args[0]);
    if (follow_symlinks < 0) {
        goto exit;
    }
skip_optional_kwonly:
    _return_value = os_DirEntry_is_file_impl((DirEntry *)self, defining_class, follow_symlinks);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(os_DirEntry_inode__doc__,
"inode($self, /)\n"
"--\n"
"\n"
"Return inode of the entry; cached per entry.");

#define OS_DIRENTRY_INODE_METHODDEF    \
    {"inode", (PyCFunction)os_DirEntry_inode, METH_NOARGS, os_DirEntry_inode__doc__},

static TyObject *
os_DirEntry_inode_impl(DirEntry *self);

static TyObject *
os_DirEntry_inode(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return os_DirEntry_inode_impl((DirEntry *)self);
}

TyDoc_STRVAR(os_DirEntry___fspath____doc__,
"__fspath__($self, /)\n"
"--\n"
"\n"
"Returns the path for the entry.");

#define OS_DIRENTRY___FSPATH___METHODDEF    \
    {"__fspath__", (PyCFunction)os_DirEntry___fspath__, METH_NOARGS, os_DirEntry___fspath____doc__},

static TyObject *
os_DirEntry___fspath___impl(DirEntry *self);

static TyObject *
os_DirEntry___fspath__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return os_DirEntry___fspath___impl((DirEntry *)self);
}

TyDoc_STRVAR(os_scandir__doc__,
"scandir($module, /, path=None)\n"
"--\n"
"\n"
"Return an iterator of DirEntry objects for given path.\n"
"\n"
"path can be specified as either str, bytes, or a path-like object.  If path\n"
"is bytes, the names of yielded DirEntry objects will also be bytes; in\n"
"all other circumstances they will be str.\n"
"\n"
"If path is None, uses the path=\'.\'.");

#define OS_SCANDIR_METHODDEF    \
    {"scandir", _PyCFunction_CAST(os_scandir), METH_FASTCALL|METH_KEYWORDS, os_scandir__doc__},

static TyObject *
os_scandir_impl(TyObject *module, path_t *path);

static TyObject *
os_scandir(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "scandir",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    path_t path = PATH_T_INITIALIZE_P("scandir", "path", 1, 0, 0, PATH_HAVE_FDOPENDIR);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_scandir_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

TyDoc_STRVAR(os_fspath__doc__,
"fspath($module, /, path)\n"
"--\n"
"\n"
"Return the file system path representation of the object.\n"
"\n"
"If the object is str or bytes, then allow it to pass through as-is. If the\n"
"object defines __fspath__(), then return the result of that method. All other\n"
"types raise a TypeError.");

#define OS_FSPATH_METHODDEF    \
    {"fspath", _PyCFunction_CAST(os_fspath), METH_FASTCALL|METH_KEYWORDS, os_fspath__doc__},

static TyObject *
os_fspath_impl(TyObject *module, TyObject *path);

static TyObject *
os_fspath(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fspath",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *path;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    path = args[0];
    return_value = os_fspath_impl(module, path);

exit:
    return return_value;
}

#if defined(HAVE_GETRANDOM_SYSCALL)

TyDoc_STRVAR(os_getrandom__doc__,
"getrandom($module, /, size, flags=0)\n"
"--\n"
"\n"
"Obtain a series of random bytes.");

#define OS_GETRANDOM_METHODDEF    \
    {"getrandom", _PyCFunction_CAST(os_getrandom), METH_FASTCALL|METH_KEYWORDS, os_getrandom__doc__},

static TyObject *
os_getrandom_impl(TyObject *module, Ty_ssize_t size, int flags);

static TyObject *
os_getrandom(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(size), &_Ty_ID(flags), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"size", "flags", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "getrandom",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_ssize_t size;
    int flags = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        size = ival;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    flags = TyLong_AsInt(args[1]);
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = os_getrandom_impl(module, size, flags);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETRANDOM_SYSCALL) */

#if (defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_APP) || defined(MS_WINDOWS_SYSTEM))

TyDoc_STRVAR(os__add_dll_directory__doc__,
"_add_dll_directory($module, /, path)\n"
"--\n"
"\n"
"Add a path to the DLL search path.\n"
"\n"
"This search path is used when resolving dependencies for imported\n"
"extension modules (the module itself is resolved through sys.path),\n"
"and also by ctypes.\n"
"\n"
"Returns an opaque value that may be passed to os.remove_dll_directory\n"
"to remove this directory from the search path.");

#define OS__ADD_DLL_DIRECTORY_METHODDEF    \
    {"_add_dll_directory", _PyCFunction_CAST(os__add_dll_directory), METH_FASTCALL|METH_KEYWORDS, os__add_dll_directory__doc__},

static TyObject *
os__add_dll_directory_impl(TyObject *module, path_t *path);

static TyObject *
os__add_dll_directory(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_add_dll_directory",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    path_t path = PATH_T_INITIALIZE_P("_add_dll_directory", "path", 0, 0, 0, 0);

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!path_converter(args[0], &path)) {
        goto exit;
    }
    return_value = os__add_dll_directory_impl(module, &path);

exit:
    /* Cleanup for path */
    path_cleanup(&path);

    return return_value;
}

#endif /* (defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_APP) || defined(MS_WINDOWS_SYSTEM)) */

#if (defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_APP) || defined(MS_WINDOWS_SYSTEM))

TyDoc_STRVAR(os__remove_dll_directory__doc__,
"_remove_dll_directory($module, /, cookie)\n"
"--\n"
"\n"
"Removes a path from the DLL search path.\n"
"\n"
"The parameter is an opaque value that was returned from\n"
"os.add_dll_directory. You can only remove directories that you added\n"
"yourself.");

#define OS__REMOVE_DLL_DIRECTORY_METHODDEF    \
    {"_remove_dll_directory", _PyCFunction_CAST(os__remove_dll_directory), METH_FASTCALL|METH_KEYWORDS, os__remove_dll_directory__doc__},

static TyObject *
os__remove_dll_directory_impl(TyObject *module, TyObject *cookie);

static TyObject *
os__remove_dll_directory(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(cookie), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"cookie", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_remove_dll_directory",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *cookie;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    cookie = args[0];
    return_value = os__remove_dll_directory_impl(module, cookie);

exit:
    return return_value;
}

#endif /* (defined(MS_WINDOWS_DESKTOP) || defined(MS_WINDOWS_APP) || defined(MS_WINDOWS_SYSTEM)) */

#if (defined(WIFEXITED) || defined(MS_WINDOWS))

TyDoc_STRVAR(os_waitstatus_to_exitcode__doc__,
"waitstatus_to_exitcode($module, /, status)\n"
"--\n"
"\n"
"Convert a wait status to an exit code.\n"
"\n"
"On Unix:\n"
"\n"
"* If WIFEXITED(status) is true, return WEXITSTATUS(status).\n"
"* If WIFSIGNALED(status) is true, return -WTERMSIG(status).\n"
"* Otherwise, raise a ValueError.\n"
"\n"
"On Windows, return status shifted right by 8 bits.\n"
"\n"
"On Unix, if the process is being traced or if waitpid() was called with\n"
"WUNTRACED option, the caller must first check if WIFSTOPPED(status) is true.\n"
"This function must not be called if WIFSTOPPED(status) is true.");

#define OS_WAITSTATUS_TO_EXITCODE_METHODDEF    \
    {"waitstatus_to_exitcode", _PyCFunction_CAST(os_waitstatus_to_exitcode), METH_FASTCALL|METH_KEYWORDS, os_waitstatus_to_exitcode__doc__},

static TyObject *
os_waitstatus_to_exitcode_impl(TyObject *module, TyObject *status_obj);

static TyObject *
os_waitstatus_to_exitcode(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(status), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"status", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "waitstatus_to_exitcode",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *status_obj;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    status_obj = args[0];
    return_value = os_waitstatus_to_exitcode_impl(module, status_obj);

exit:
    return return_value;
}

#endif /* (defined(WIFEXITED) || defined(MS_WINDOWS)) */

#if defined(MS_WINDOWS)

TyDoc_STRVAR(os__supports_virtual_terminal__doc__,
"_supports_virtual_terminal($module, /)\n"
"--\n"
"\n"
"Checks if virtual terminal is supported in windows");

#define OS__SUPPORTS_VIRTUAL_TERMINAL_METHODDEF    \
    {"_supports_virtual_terminal", (PyCFunction)os__supports_virtual_terminal, METH_NOARGS, os__supports_virtual_terminal__doc__},

static TyObject *
os__supports_virtual_terminal_impl(TyObject *module);

static TyObject *
os__supports_virtual_terminal(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os__supports_virtual_terminal_impl(module);
}

#endif /* defined(MS_WINDOWS) */

TyDoc_STRVAR(os__inputhook__doc__,
"_inputhook($module, /)\n"
"--\n"
"\n"
"Calls TyOS_CallInputHook droppong the GIL first");

#define OS__INPUTHOOK_METHODDEF    \
    {"_inputhook", (PyCFunction)os__inputhook, METH_NOARGS, os__inputhook__doc__},

static TyObject *
os__inputhook_impl(TyObject *module);

static TyObject *
os__inputhook(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os__inputhook_impl(module);
}

TyDoc_STRVAR(os__is_inputhook_installed__doc__,
"_is_inputhook_installed($module, /)\n"
"--\n"
"\n"
"Checks if TyOS_CallInputHook is set");

#define OS__IS_INPUTHOOK_INSTALLED_METHODDEF    \
    {"_is_inputhook_installed", (PyCFunction)os__is_inputhook_installed, METH_NOARGS, os__is_inputhook_installed__doc__},

static TyObject *
os__is_inputhook_installed_impl(TyObject *module);

static TyObject *
os__is_inputhook_installed(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os__is_inputhook_installed_impl(module);
}

TyDoc_STRVAR(os__create_environ__doc__,
"_create_environ($module, /)\n"
"--\n"
"\n"
"Create the environment dictionary.");

#define OS__CREATE_ENVIRON_METHODDEF    \
    {"_create_environ", (PyCFunction)os__create_environ, METH_NOARGS, os__create_environ__doc__},

static TyObject *
os__create_environ_impl(TyObject *module);

static TyObject *
os__create_environ(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os__create_environ_impl(module);
}

#if defined(__EMSCRIPTEN__)

TyDoc_STRVAR(os__emscripten_debugger__doc__,
"_emscripten_debugger($module, /)\n"
"--\n"
"\n"
"Create a breakpoint for the JavaScript debugger. Emscripten only.");

#define OS__EMSCRIPTEN_DEBUGGER_METHODDEF    \
    {"_emscripten_debugger", (PyCFunction)os__emscripten_debugger, METH_NOARGS, os__emscripten_debugger__doc__},

static TyObject *
os__emscripten_debugger_impl(TyObject *module);

static TyObject *
os__emscripten_debugger(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return os__emscripten_debugger_impl(module);
}

#endif /* defined(__EMSCRIPTEN__) */

#ifndef OS_TTYNAME_METHODDEF
    #define OS_TTYNAME_METHODDEF
#endif /* !defined(OS_TTYNAME_METHODDEF) */

#ifndef OS_CTERMID_METHODDEF
    #define OS_CTERMID_METHODDEF
#endif /* !defined(OS_CTERMID_METHODDEF) */

#ifndef OS_FCHDIR_METHODDEF
    #define OS_FCHDIR_METHODDEF
#endif /* !defined(OS_FCHDIR_METHODDEF) */

#ifndef OS_FCHMOD_METHODDEF
    #define OS_FCHMOD_METHODDEF
#endif /* !defined(OS_FCHMOD_METHODDEF) */

#ifndef OS_LCHMOD_METHODDEF
    #define OS_LCHMOD_METHODDEF
#endif /* !defined(OS_LCHMOD_METHODDEF) */

#ifndef OS_CHFLAGS_METHODDEF
    #define OS_CHFLAGS_METHODDEF
#endif /* !defined(OS_CHFLAGS_METHODDEF) */

#ifndef OS_LCHFLAGS_METHODDEF
    #define OS_LCHFLAGS_METHODDEF
#endif /* !defined(OS_LCHFLAGS_METHODDEF) */

#ifndef OS_CHROOT_METHODDEF
    #define OS_CHROOT_METHODDEF
#endif /* !defined(OS_CHROOT_METHODDEF) */

#ifndef OS_FSYNC_METHODDEF
    #define OS_FSYNC_METHODDEF
#endif /* !defined(OS_FSYNC_METHODDEF) */

#ifndef OS_SYNC_METHODDEF
    #define OS_SYNC_METHODDEF
#endif /* !defined(OS_SYNC_METHODDEF) */

#ifndef OS_FDATASYNC_METHODDEF
    #define OS_FDATASYNC_METHODDEF
#endif /* !defined(OS_FDATASYNC_METHODDEF) */

#ifndef OS_CHOWN_METHODDEF
    #define OS_CHOWN_METHODDEF
#endif /* !defined(OS_CHOWN_METHODDEF) */

#ifndef OS_FCHOWN_METHODDEF
    #define OS_FCHOWN_METHODDEF
#endif /* !defined(OS_FCHOWN_METHODDEF) */

#ifndef OS_LCHOWN_METHODDEF
    #define OS_LCHOWN_METHODDEF
#endif /* !defined(OS_LCHOWN_METHODDEF) */

#ifndef OS_LINK_METHODDEF
    #define OS_LINK_METHODDEF
#endif /* !defined(OS_LINK_METHODDEF) */

#ifndef OS_LISTDRIVES_METHODDEF
    #define OS_LISTDRIVES_METHODDEF
#endif /* !defined(OS_LISTDRIVES_METHODDEF) */

#ifndef OS_LISTVOLUMES_METHODDEF
    #define OS_LISTVOLUMES_METHODDEF
#endif /* !defined(OS_LISTVOLUMES_METHODDEF) */

#ifndef OS_LISTMOUNTS_METHODDEF
    #define OS_LISTMOUNTS_METHODDEF
#endif /* !defined(OS_LISTMOUNTS_METHODDEF) */

#ifndef OS__PATH_ISDEVDRIVE_METHODDEF
    #define OS__PATH_ISDEVDRIVE_METHODDEF
#endif /* !defined(OS__PATH_ISDEVDRIVE_METHODDEF) */

#ifndef OS__GETFULLPATHNAME_METHODDEF
    #define OS__GETFULLPATHNAME_METHODDEF
#endif /* !defined(OS__GETFULLPATHNAME_METHODDEF) */

#ifndef OS__GETFINALPATHNAME_METHODDEF
    #define OS__GETFINALPATHNAME_METHODDEF
#endif /* !defined(OS__GETFINALPATHNAME_METHODDEF) */

#ifndef OS__FINDFIRSTFILE_METHODDEF
    #define OS__FINDFIRSTFILE_METHODDEF
#endif /* !defined(OS__FINDFIRSTFILE_METHODDEF) */

#ifndef OS__GETVOLUMEPATHNAME_METHODDEF
    #define OS__GETVOLUMEPATHNAME_METHODDEF
#endif /* !defined(OS__GETVOLUMEPATHNAME_METHODDEF) */

#ifndef OS__PATH_SPLITROOT_METHODDEF
    #define OS__PATH_SPLITROOT_METHODDEF
#endif /* !defined(OS__PATH_SPLITROOT_METHODDEF) */

#ifndef OS__PATH_EXISTS_METHODDEF
    #define OS__PATH_EXISTS_METHODDEF
#endif /* !defined(OS__PATH_EXISTS_METHODDEF) */

#ifndef OS__PATH_LEXISTS_METHODDEF
    #define OS__PATH_LEXISTS_METHODDEF
#endif /* !defined(OS__PATH_LEXISTS_METHODDEF) */

#ifndef OS__PATH_ISDIR_METHODDEF
    #define OS__PATH_ISDIR_METHODDEF
#endif /* !defined(OS__PATH_ISDIR_METHODDEF) */

#ifndef OS__PATH_ISFILE_METHODDEF
    #define OS__PATH_ISFILE_METHODDEF
#endif /* !defined(OS__PATH_ISFILE_METHODDEF) */

#ifndef OS__PATH_ISLINK_METHODDEF
    #define OS__PATH_ISLINK_METHODDEF
#endif /* !defined(OS__PATH_ISLINK_METHODDEF) */

#ifndef OS__PATH_ISJUNCTION_METHODDEF
    #define OS__PATH_ISJUNCTION_METHODDEF
#endif /* !defined(OS__PATH_ISJUNCTION_METHODDEF) */

#ifndef OS_NICE_METHODDEF
    #define OS_NICE_METHODDEF
#endif /* !defined(OS_NICE_METHODDEF) */

#ifndef OS_GETPRIORITY_METHODDEF
    #define OS_GETPRIORITY_METHODDEF
#endif /* !defined(OS_GETPRIORITY_METHODDEF) */

#ifndef OS_SETPRIORITY_METHODDEF
    #define OS_SETPRIORITY_METHODDEF
#endif /* !defined(OS_SETPRIORITY_METHODDEF) */

#ifndef OS_SYSTEM_METHODDEF
    #define OS_SYSTEM_METHODDEF
#endif /* !defined(OS_SYSTEM_METHODDEF) */

#ifndef OS_UMASK_METHODDEF
    #define OS_UMASK_METHODDEF
#endif /* !defined(OS_UMASK_METHODDEF) */

#ifndef OS_UNAME_METHODDEF
    #define OS_UNAME_METHODDEF
#endif /* !defined(OS_UNAME_METHODDEF) */

#ifndef OS_EXECV_METHODDEF
    #define OS_EXECV_METHODDEF
#endif /* !defined(OS_EXECV_METHODDEF) */

#ifndef OS_EXECVE_METHODDEF
    #define OS_EXECVE_METHODDEF
#endif /* !defined(OS_EXECVE_METHODDEF) */

#ifndef OS_POSIX_SPAWN_METHODDEF
    #define OS_POSIX_SPAWN_METHODDEF
#endif /* !defined(OS_POSIX_SPAWN_METHODDEF) */

#ifndef OS_POSIX_SPAWNP_METHODDEF
    #define OS_POSIX_SPAWNP_METHODDEF
#endif /* !defined(OS_POSIX_SPAWNP_METHODDEF) */

#ifndef OS_SPAWNV_METHODDEF
    #define OS_SPAWNV_METHODDEF
#endif /* !defined(OS_SPAWNV_METHODDEF) */

#ifndef OS_SPAWNVE_METHODDEF
    #define OS_SPAWNVE_METHODDEF
#endif /* !defined(OS_SPAWNVE_METHODDEF) */

#ifndef OS_REGISTER_AT_FORK_METHODDEF
    #define OS_REGISTER_AT_FORK_METHODDEF
#endif /* !defined(OS_REGISTER_AT_FORK_METHODDEF) */

#ifndef OS_FORK1_METHODDEF
    #define OS_FORK1_METHODDEF
#endif /* !defined(OS_FORK1_METHODDEF) */

#ifndef OS_FORK_METHODDEF
    #define OS_FORK_METHODDEF
#endif /* !defined(OS_FORK_METHODDEF) */

#ifndef OS_SCHED_GET_PRIORITY_MAX_METHODDEF
    #define OS_SCHED_GET_PRIORITY_MAX_METHODDEF
#endif /* !defined(OS_SCHED_GET_PRIORITY_MAX_METHODDEF) */

#ifndef OS_SCHED_GET_PRIORITY_MIN_METHODDEF
    #define OS_SCHED_GET_PRIORITY_MIN_METHODDEF
#endif /* !defined(OS_SCHED_GET_PRIORITY_MIN_METHODDEF) */

#ifndef OS_SCHED_GETSCHEDULER_METHODDEF
    #define OS_SCHED_GETSCHEDULER_METHODDEF
#endif /* !defined(OS_SCHED_GETSCHEDULER_METHODDEF) */

#ifndef OS_SCHED_SETSCHEDULER_METHODDEF
    #define OS_SCHED_SETSCHEDULER_METHODDEF
#endif /* !defined(OS_SCHED_SETSCHEDULER_METHODDEF) */

#ifndef OS_SCHED_GETPARAM_METHODDEF
    #define OS_SCHED_GETPARAM_METHODDEF
#endif /* !defined(OS_SCHED_GETPARAM_METHODDEF) */

#ifndef OS_SCHED_SETPARAM_METHODDEF
    #define OS_SCHED_SETPARAM_METHODDEF
#endif /* !defined(OS_SCHED_SETPARAM_METHODDEF) */

#ifndef OS_SCHED_RR_GET_INTERVAL_METHODDEF
    #define OS_SCHED_RR_GET_INTERVAL_METHODDEF
#endif /* !defined(OS_SCHED_RR_GET_INTERVAL_METHODDEF) */

#ifndef OS_SCHED_YIELD_METHODDEF
    #define OS_SCHED_YIELD_METHODDEF
#endif /* !defined(OS_SCHED_YIELD_METHODDEF) */

#ifndef OS_SCHED_SETAFFINITY_METHODDEF
    #define OS_SCHED_SETAFFINITY_METHODDEF
#endif /* !defined(OS_SCHED_SETAFFINITY_METHODDEF) */

#ifndef OS_SCHED_GETAFFINITY_METHODDEF
    #define OS_SCHED_GETAFFINITY_METHODDEF
#endif /* !defined(OS_SCHED_GETAFFINITY_METHODDEF) */

#ifndef OS_POSIX_OPENPT_METHODDEF
    #define OS_POSIX_OPENPT_METHODDEF
#endif /* !defined(OS_POSIX_OPENPT_METHODDEF) */

#ifndef OS_GRANTPT_METHODDEF
    #define OS_GRANTPT_METHODDEF
#endif /* !defined(OS_GRANTPT_METHODDEF) */

#ifndef OS_UNLOCKPT_METHODDEF
    #define OS_UNLOCKPT_METHODDEF
#endif /* !defined(OS_UNLOCKPT_METHODDEF) */

#ifndef OS_PTSNAME_METHODDEF
    #define OS_PTSNAME_METHODDEF
#endif /* !defined(OS_PTSNAME_METHODDEF) */

#ifndef OS_OPENPTY_METHODDEF
    #define OS_OPENPTY_METHODDEF
#endif /* !defined(OS_OPENPTY_METHODDEF) */

#ifndef OS_LOGIN_TTY_METHODDEF
    #define OS_LOGIN_TTY_METHODDEF
#endif /* !defined(OS_LOGIN_TTY_METHODDEF) */

#ifndef OS_FORKPTY_METHODDEF
    #define OS_FORKPTY_METHODDEF
#endif /* !defined(OS_FORKPTY_METHODDEF) */

#ifndef OS_GETEGID_METHODDEF
    #define OS_GETEGID_METHODDEF
#endif /* !defined(OS_GETEGID_METHODDEF) */

#ifndef OS_GETEUID_METHODDEF
    #define OS_GETEUID_METHODDEF
#endif /* !defined(OS_GETEUID_METHODDEF) */

#ifndef OS_GETGID_METHODDEF
    #define OS_GETGID_METHODDEF
#endif /* !defined(OS_GETGID_METHODDEF) */

#ifndef OS_GETPID_METHODDEF
    #define OS_GETPID_METHODDEF
#endif /* !defined(OS_GETPID_METHODDEF) */

#ifndef OS_GETGROUPLIST_METHODDEF
    #define OS_GETGROUPLIST_METHODDEF
#endif /* !defined(OS_GETGROUPLIST_METHODDEF) */

#ifndef OS_GETGROUPS_METHODDEF
    #define OS_GETGROUPS_METHODDEF
#endif /* !defined(OS_GETGROUPS_METHODDEF) */

#ifndef OS_INITGROUPS_METHODDEF
    #define OS_INITGROUPS_METHODDEF
#endif /* !defined(OS_INITGROUPS_METHODDEF) */

#ifndef OS_GETPGID_METHODDEF
    #define OS_GETPGID_METHODDEF
#endif /* !defined(OS_GETPGID_METHODDEF) */

#ifndef OS_GETPGRP_METHODDEF
    #define OS_GETPGRP_METHODDEF
#endif /* !defined(OS_GETPGRP_METHODDEF) */

#ifndef OS_SETPGRP_METHODDEF
    #define OS_SETPGRP_METHODDEF
#endif /* !defined(OS_SETPGRP_METHODDEF) */

#ifndef OS_GETPPID_METHODDEF
    #define OS_GETPPID_METHODDEF
#endif /* !defined(OS_GETPPID_METHODDEF) */

#ifndef OS_GETLOGIN_METHODDEF
    #define OS_GETLOGIN_METHODDEF
#endif /* !defined(OS_GETLOGIN_METHODDEF) */

#ifndef OS_GETUID_METHODDEF
    #define OS_GETUID_METHODDEF
#endif /* !defined(OS_GETUID_METHODDEF) */

#ifndef OS_KILL_METHODDEF
    #define OS_KILL_METHODDEF
#endif /* !defined(OS_KILL_METHODDEF) */

#ifndef OS_KILLPG_METHODDEF
    #define OS_KILLPG_METHODDEF
#endif /* !defined(OS_KILLPG_METHODDEF) */

#ifndef OS_PLOCK_METHODDEF
    #define OS_PLOCK_METHODDEF
#endif /* !defined(OS_PLOCK_METHODDEF) */

#ifndef OS_SETUID_METHODDEF
    #define OS_SETUID_METHODDEF
#endif /* !defined(OS_SETUID_METHODDEF) */

#ifndef OS_SETEUID_METHODDEF
    #define OS_SETEUID_METHODDEF
#endif /* !defined(OS_SETEUID_METHODDEF) */

#ifndef OS_SETEGID_METHODDEF
    #define OS_SETEGID_METHODDEF
#endif /* !defined(OS_SETEGID_METHODDEF) */

#ifndef OS_SETREUID_METHODDEF
    #define OS_SETREUID_METHODDEF
#endif /* !defined(OS_SETREUID_METHODDEF) */

#ifndef OS_SETREGID_METHODDEF
    #define OS_SETREGID_METHODDEF
#endif /* !defined(OS_SETREGID_METHODDEF) */

#ifndef OS_SETGID_METHODDEF
    #define OS_SETGID_METHODDEF
#endif /* !defined(OS_SETGID_METHODDEF) */

#ifndef OS_SETGROUPS_METHODDEF
    #define OS_SETGROUPS_METHODDEF
#endif /* !defined(OS_SETGROUPS_METHODDEF) */

#ifndef OS_WAIT3_METHODDEF
    #define OS_WAIT3_METHODDEF
#endif /* !defined(OS_WAIT3_METHODDEF) */

#ifndef OS_WAIT4_METHODDEF
    #define OS_WAIT4_METHODDEF
#endif /* !defined(OS_WAIT4_METHODDEF) */

#ifndef OS_WAITID_METHODDEF
    #define OS_WAITID_METHODDEF
#endif /* !defined(OS_WAITID_METHODDEF) */

#ifndef OS_WAITPID_METHODDEF
    #define OS_WAITPID_METHODDEF
#endif /* !defined(OS_WAITPID_METHODDEF) */

#ifndef OS_WAIT_METHODDEF
    #define OS_WAIT_METHODDEF
#endif /* !defined(OS_WAIT_METHODDEF) */

#ifndef OS_PIDFD_OPEN_METHODDEF
    #define OS_PIDFD_OPEN_METHODDEF
#endif /* !defined(OS_PIDFD_OPEN_METHODDEF) */

#ifndef OS_SETNS_METHODDEF
    #define OS_SETNS_METHODDEF
#endif /* !defined(OS_SETNS_METHODDEF) */

#ifndef OS_UNSHARE_METHODDEF
    #define OS_UNSHARE_METHODDEF
#endif /* !defined(OS_UNSHARE_METHODDEF) */

#ifndef OS_READLINK_METHODDEF
    #define OS_READLINK_METHODDEF
#endif /* !defined(OS_READLINK_METHODDEF) */

#ifndef OS_SYMLINK_METHODDEF
    #define OS_SYMLINK_METHODDEF
#endif /* !defined(OS_SYMLINK_METHODDEF) */

#ifndef OS_TIMERFD_CREATE_METHODDEF
    #define OS_TIMERFD_CREATE_METHODDEF
#endif /* !defined(OS_TIMERFD_CREATE_METHODDEF) */

#ifndef OS_TIMERFD_SETTIME_METHODDEF
    #define OS_TIMERFD_SETTIME_METHODDEF
#endif /* !defined(OS_TIMERFD_SETTIME_METHODDEF) */

#ifndef OS_TIMERFD_SETTIME_NS_METHODDEF
    #define OS_TIMERFD_SETTIME_NS_METHODDEF
#endif /* !defined(OS_TIMERFD_SETTIME_NS_METHODDEF) */

#ifndef OS_TIMERFD_GETTIME_METHODDEF
    #define OS_TIMERFD_GETTIME_METHODDEF
#endif /* !defined(OS_TIMERFD_GETTIME_METHODDEF) */

#ifndef OS_TIMERFD_GETTIME_NS_METHODDEF
    #define OS_TIMERFD_GETTIME_NS_METHODDEF
#endif /* !defined(OS_TIMERFD_GETTIME_NS_METHODDEF) */

#ifndef OS_GETSID_METHODDEF
    #define OS_GETSID_METHODDEF
#endif /* !defined(OS_GETSID_METHODDEF) */

#ifndef OS_SETSID_METHODDEF
    #define OS_SETSID_METHODDEF
#endif /* !defined(OS_SETSID_METHODDEF) */

#ifndef OS_SETPGID_METHODDEF
    #define OS_SETPGID_METHODDEF
#endif /* !defined(OS_SETPGID_METHODDEF) */

#ifndef OS_TCGETPGRP_METHODDEF
    #define OS_TCGETPGRP_METHODDEF
#endif /* !defined(OS_TCGETPGRP_METHODDEF) */

#ifndef OS_TCSETPGRP_METHODDEF
    #define OS_TCSETPGRP_METHODDEF
#endif /* !defined(OS_TCSETPGRP_METHODDEF) */

#ifndef OS_DUP2_METHODDEF
    #define OS_DUP2_METHODDEF
#endif /* !defined(OS_DUP2_METHODDEF) */

#ifndef OS_LOCKF_METHODDEF
    #define OS_LOCKF_METHODDEF
#endif /* !defined(OS_LOCKF_METHODDEF) */

#ifndef OS_READV_METHODDEF
    #define OS_READV_METHODDEF
#endif /* !defined(OS_READV_METHODDEF) */

#ifndef OS_PREAD_METHODDEF
    #define OS_PREAD_METHODDEF
#endif /* !defined(OS_PREAD_METHODDEF) */

#ifndef OS_PREADV_METHODDEF
    #define OS_PREADV_METHODDEF
#endif /* !defined(OS_PREADV_METHODDEF) */

#ifndef OS_SENDFILE_METHODDEF
    #define OS_SENDFILE_METHODDEF
#endif /* !defined(OS_SENDFILE_METHODDEF) */

#ifndef OS__FCOPYFILE_METHODDEF
    #define OS__FCOPYFILE_METHODDEF
#endif /* !defined(OS__FCOPYFILE_METHODDEF) */

#ifndef OS_PIPE_METHODDEF
    #define OS_PIPE_METHODDEF
#endif /* !defined(OS_PIPE_METHODDEF) */

#ifndef OS_PIPE2_METHODDEF
    #define OS_PIPE2_METHODDEF
#endif /* !defined(OS_PIPE2_METHODDEF) */

#ifndef OS_WRITEV_METHODDEF
    #define OS_WRITEV_METHODDEF
#endif /* !defined(OS_WRITEV_METHODDEF) */

#ifndef OS_PWRITE_METHODDEF
    #define OS_PWRITE_METHODDEF
#endif /* !defined(OS_PWRITE_METHODDEF) */

#ifndef OS_PWRITEV_METHODDEF
    #define OS_PWRITEV_METHODDEF
#endif /* !defined(OS_PWRITEV_METHODDEF) */

#ifndef OS_COPY_FILE_RANGE_METHODDEF
    #define OS_COPY_FILE_RANGE_METHODDEF
#endif /* !defined(OS_COPY_FILE_RANGE_METHODDEF) */

#ifndef OS_SPLICE_METHODDEF
    #define OS_SPLICE_METHODDEF
#endif /* !defined(OS_SPLICE_METHODDEF) */

#ifndef OS_MKFIFO_METHODDEF
    #define OS_MKFIFO_METHODDEF
#endif /* !defined(OS_MKFIFO_METHODDEF) */

#ifndef OS_MKNOD_METHODDEF
    #define OS_MKNOD_METHODDEF
#endif /* !defined(OS_MKNOD_METHODDEF) */

#ifndef OS_MAJOR_METHODDEF
    #define OS_MAJOR_METHODDEF
#endif /* !defined(OS_MAJOR_METHODDEF) */

#ifndef OS_MINOR_METHODDEF
    #define OS_MINOR_METHODDEF
#endif /* !defined(OS_MINOR_METHODDEF) */

#ifndef OS_MAKEDEV_METHODDEF
    #define OS_MAKEDEV_METHODDEF
#endif /* !defined(OS_MAKEDEV_METHODDEF) */

#ifndef OS_FTRUNCATE_METHODDEF
    #define OS_FTRUNCATE_METHODDEF
#endif /* !defined(OS_FTRUNCATE_METHODDEF) */

#ifndef OS_TRUNCATE_METHODDEF
    #define OS_TRUNCATE_METHODDEF
#endif /* !defined(OS_TRUNCATE_METHODDEF) */

#ifndef OS_POSIX_FALLOCATE_METHODDEF
    #define OS_POSIX_FALLOCATE_METHODDEF
#endif /* !defined(OS_POSIX_FALLOCATE_METHODDEF) */

#ifndef OS_POSIX_FADVISE_METHODDEF
    #define OS_POSIX_FADVISE_METHODDEF
#endif /* !defined(OS_POSIX_FADVISE_METHODDEF) */

#ifndef OS_PUTENV_METHODDEF
    #define OS_PUTENV_METHODDEF
#endif /* !defined(OS_PUTENV_METHODDEF) */

#ifndef OS_UNSETENV_METHODDEF
    #define OS_UNSETENV_METHODDEF
#endif /* !defined(OS_UNSETENV_METHODDEF) */

#ifndef OS_WCOREDUMP_METHODDEF
    #define OS_WCOREDUMP_METHODDEF
#endif /* !defined(OS_WCOREDUMP_METHODDEF) */

#ifndef OS_WIFCONTINUED_METHODDEF
    #define OS_WIFCONTINUED_METHODDEF
#endif /* !defined(OS_WIFCONTINUED_METHODDEF) */

#ifndef OS_WIFSTOPPED_METHODDEF
    #define OS_WIFSTOPPED_METHODDEF
#endif /* !defined(OS_WIFSTOPPED_METHODDEF) */

#ifndef OS_WIFSIGNALED_METHODDEF
    #define OS_WIFSIGNALED_METHODDEF
#endif /* !defined(OS_WIFSIGNALED_METHODDEF) */

#ifndef OS_WIFEXITED_METHODDEF
    #define OS_WIFEXITED_METHODDEF
#endif /* !defined(OS_WIFEXITED_METHODDEF) */

#ifndef OS_WEXITSTATUS_METHODDEF
    #define OS_WEXITSTATUS_METHODDEF
#endif /* !defined(OS_WEXITSTATUS_METHODDEF) */

#ifndef OS_WTERMSIG_METHODDEF
    #define OS_WTERMSIG_METHODDEF
#endif /* !defined(OS_WTERMSIG_METHODDEF) */

#ifndef OS_WSTOPSIG_METHODDEF
    #define OS_WSTOPSIG_METHODDEF
#endif /* !defined(OS_WSTOPSIG_METHODDEF) */

#ifndef OS_FSTATVFS_METHODDEF
    #define OS_FSTATVFS_METHODDEF
#endif /* !defined(OS_FSTATVFS_METHODDEF) */

#ifndef OS_STATVFS_METHODDEF
    #define OS_STATVFS_METHODDEF
#endif /* !defined(OS_STATVFS_METHODDEF) */

#ifndef OS__GETDISKUSAGE_METHODDEF
    #define OS__GETDISKUSAGE_METHODDEF
#endif /* !defined(OS__GETDISKUSAGE_METHODDEF) */

#ifndef OS_FPATHCONF_METHODDEF
    #define OS_FPATHCONF_METHODDEF
#endif /* !defined(OS_FPATHCONF_METHODDEF) */

#ifndef OS_PATHCONF_METHODDEF
    #define OS_PATHCONF_METHODDEF
#endif /* !defined(OS_PATHCONF_METHODDEF) */

#ifndef OS_CONFSTR_METHODDEF
    #define OS_CONFSTR_METHODDEF
#endif /* !defined(OS_CONFSTR_METHODDEF) */

#ifndef OS_SYSCONF_METHODDEF
    #define OS_SYSCONF_METHODDEF
#endif /* !defined(OS_SYSCONF_METHODDEF) */

#ifndef OS_STARTFILE_METHODDEF
    #define OS_STARTFILE_METHODDEF
#endif /* !defined(OS_STARTFILE_METHODDEF) */

#ifndef OS_GETLOADAVG_METHODDEF
    #define OS_GETLOADAVG_METHODDEF
#endif /* !defined(OS_GETLOADAVG_METHODDEF) */

#ifndef OS_SETRESUID_METHODDEF
    #define OS_SETRESUID_METHODDEF
#endif /* !defined(OS_SETRESUID_METHODDEF) */

#ifndef OS_SETRESGID_METHODDEF
    #define OS_SETRESGID_METHODDEF
#endif /* !defined(OS_SETRESGID_METHODDEF) */

#ifndef OS_GETRESUID_METHODDEF
    #define OS_GETRESUID_METHODDEF
#endif /* !defined(OS_GETRESUID_METHODDEF) */

#ifndef OS_GETRESGID_METHODDEF
    #define OS_GETRESGID_METHODDEF
#endif /* !defined(OS_GETRESGID_METHODDEF) */

#ifndef OS_GETXATTR_METHODDEF
    #define OS_GETXATTR_METHODDEF
#endif /* !defined(OS_GETXATTR_METHODDEF) */

#ifndef OS_SETXATTR_METHODDEF
    #define OS_SETXATTR_METHODDEF
#endif /* !defined(OS_SETXATTR_METHODDEF) */

#ifndef OS_REMOVEXATTR_METHODDEF
    #define OS_REMOVEXATTR_METHODDEF
#endif /* !defined(OS_REMOVEXATTR_METHODDEF) */

#ifndef OS_LISTXATTR_METHODDEF
    #define OS_LISTXATTR_METHODDEF
#endif /* !defined(OS_LISTXATTR_METHODDEF) */

#ifndef OS_MEMFD_CREATE_METHODDEF
    #define OS_MEMFD_CREATE_METHODDEF
#endif /* !defined(OS_MEMFD_CREATE_METHODDEF) */

#ifndef OS_EVENTFD_METHODDEF
    #define OS_EVENTFD_METHODDEF
#endif /* !defined(OS_EVENTFD_METHODDEF) */

#ifndef OS_EVENTFD_READ_METHODDEF
    #define OS_EVENTFD_READ_METHODDEF
#endif /* !defined(OS_EVENTFD_READ_METHODDEF) */

#ifndef OS_EVENTFD_WRITE_METHODDEF
    #define OS_EVENTFD_WRITE_METHODDEF
#endif /* !defined(OS_EVENTFD_WRITE_METHODDEF) */

#ifndef OS_GET_TERMINAL_SIZE_METHODDEF
    #define OS_GET_TERMINAL_SIZE_METHODDEF
#endif /* !defined(OS_GET_TERMINAL_SIZE_METHODDEF) */

#ifndef OS_GET_HANDLE_INHERITABLE_METHODDEF
    #define OS_GET_HANDLE_INHERITABLE_METHODDEF
#endif /* !defined(OS_GET_HANDLE_INHERITABLE_METHODDEF) */

#ifndef OS_SET_HANDLE_INHERITABLE_METHODDEF
    #define OS_SET_HANDLE_INHERITABLE_METHODDEF
#endif /* !defined(OS_SET_HANDLE_INHERITABLE_METHODDEF) */

#ifndef OS_GETRANDOM_METHODDEF
    #define OS_GETRANDOM_METHODDEF
#endif /* !defined(OS_GETRANDOM_METHODDEF) */

#ifndef OS__ADD_DLL_DIRECTORY_METHODDEF
    #define OS__ADD_DLL_DIRECTORY_METHODDEF
#endif /* !defined(OS__ADD_DLL_DIRECTORY_METHODDEF) */

#ifndef OS__REMOVE_DLL_DIRECTORY_METHODDEF
    #define OS__REMOVE_DLL_DIRECTORY_METHODDEF
#endif /* !defined(OS__REMOVE_DLL_DIRECTORY_METHODDEF) */

#ifndef OS_WAITSTATUS_TO_EXITCODE_METHODDEF
    #define OS_WAITSTATUS_TO_EXITCODE_METHODDEF
#endif /* !defined(OS_WAITSTATUS_TO_EXITCODE_METHODDEF) */

#ifndef OS__SUPPORTS_VIRTUAL_TERMINAL_METHODDEF
    #define OS__SUPPORTS_VIRTUAL_TERMINAL_METHODDEF
#endif /* !defined(OS__SUPPORTS_VIRTUAL_TERMINAL_METHODDEF) */

#ifndef OS__EMSCRIPTEN_DEBUGGER_METHODDEF
    #define OS__EMSCRIPTEN_DEBUGGER_METHODDEF
#endif /* !defined(OS__EMSCRIPTEN_DEBUGGER_METHODDEF) */
/*[clinic end generated code: output=c693071966d11548 input=a9049054013a1b77]*/
