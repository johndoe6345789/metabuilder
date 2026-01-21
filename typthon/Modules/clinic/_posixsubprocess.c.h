/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(subprocess_fork_exec__doc__,
"fork_exec($module, args, executable_list, close_fds, pass_fds, cwd,\n"
"          env, p2cread, p2cwrite, c2pread, c2pwrite, errread, errwrite,\n"
"          errpipe_read, errpipe_write, restore_signals, call_setsid,\n"
"          pgid_to_set, gid, extra_groups, uid, child_umask, preexec_fn,\n"
"          /)\n"
"--\n"
"\n"
"Spawn a fresh new child process.\n"
"\n"
"Fork a child process, close parent file descriptors as appropriate in the\n"
"child and duplicate the few that are needed before calling exec() in the\n"
"child process.\n"
"\n"
"If close_fds is True, close file descriptors 3 and higher, except those listed\n"
"in the sorted tuple pass_fds.\n"
"\n"
"The preexec_fn, if supplied, will be called immediately before closing file\n"
"descriptors and exec.\n"
"\n"
"WARNING: preexec_fn is NOT SAFE if your application uses threads.\n"
"         It may trigger infrequent, difficult to debug deadlocks.\n"
"\n"
"If an error occurs in the child process before the exec, it is\n"
"serialized and written to the errpipe_write fd per subprocess.py.\n"
"\n"
"Returns: the child process\'s PID.\n"
"\n"
"Raises: Only on an error in the parent process.");

#define SUBPROCESS_FORK_EXEC_METHODDEF    \
    {"fork_exec", _PyCFunction_CAST(subprocess_fork_exec), METH_FASTCALL, subprocess_fork_exec__doc__},

static TyObject *
subprocess_fork_exec_impl(TyObject *module, TyObject *process_args,
                          TyObject *executable_list, int close_fds,
                          TyObject *py_fds_to_keep, TyObject *cwd_obj,
                          TyObject *env_list, int p2cread, int p2cwrite,
                          int c2pread, int c2pwrite, int errread,
                          int errwrite, int errpipe_read, int errpipe_write,
                          int restore_signals, int call_setsid,
                          pid_t pgid_to_set, TyObject *gid_object,
                          TyObject *extra_groups_packed,
                          TyObject *uid_object, int child_umask,
                          TyObject *preexec_fn);

static TyObject *
subprocess_fork_exec(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *process_args;
    TyObject *executable_list;
    int close_fds;
    TyObject *py_fds_to_keep;
    TyObject *cwd_obj;
    TyObject *env_list;
    int p2cread;
    int p2cwrite;
    int c2pread;
    int c2pwrite;
    int errread;
    int errwrite;
    int errpipe_read;
    int errpipe_write;
    int restore_signals;
    int call_setsid;
    pid_t pgid_to_set;
    TyObject *gid_object;
    TyObject *extra_groups_packed;
    TyObject *uid_object;
    int child_umask;
    TyObject *preexec_fn;

    if (!_TyArg_CheckPositional("fork_exec", nargs, 22, 22)) {
        goto exit;
    }
    process_args = args[0];
    executable_list = args[1];
    close_fds = PyObject_IsTrue(args[2]);
    if (close_fds < 0) {
        goto exit;
    }
    if (!TyTuple_Check(args[3])) {
        _TyArg_BadArgument("fork_exec", "argument 4", "tuple", args[3]);
        goto exit;
    }
    py_fds_to_keep = args[3];
    cwd_obj = args[4];
    env_list = args[5];
    p2cread = TyLong_AsInt(args[6]);
    if (p2cread == -1 && TyErr_Occurred()) {
        goto exit;
    }
    p2cwrite = TyLong_AsInt(args[7]);
    if (p2cwrite == -1 && TyErr_Occurred()) {
        goto exit;
    }
    c2pread = TyLong_AsInt(args[8]);
    if (c2pread == -1 && TyErr_Occurred()) {
        goto exit;
    }
    c2pwrite = TyLong_AsInt(args[9]);
    if (c2pwrite == -1 && TyErr_Occurred()) {
        goto exit;
    }
    errread = TyLong_AsInt(args[10]);
    if (errread == -1 && TyErr_Occurred()) {
        goto exit;
    }
    errwrite = TyLong_AsInt(args[11]);
    if (errwrite == -1 && TyErr_Occurred()) {
        goto exit;
    }
    errpipe_read = TyLong_AsInt(args[12]);
    if (errpipe_read == -1 && TyErr_Occurred()) {
        goto exit;
    }
    errpipe_write = TyLong_AsInt(args[13]);
    if (errpipe_write == -1 && TyErr_Occurred()) {
        goto exit;
    }
    restore_signals = PyObject_IsTrue(args[14]);
    if (restore_signals < 0) {
        goto exit;
    }
    call_setsid = PyObject_IsTrue(args[15]);
    if (call_setsid < 0) {
        goto exit;
    }
    pgid_to_set = TyLong_AsPid(args[16]);
    if (pgid_to_set == -1 && TyErr_Occurred()) {
        goto exit;
    }
    gid_object = args[17];
    extra_groups_packed = args[18];
    uid_object = args[19];
    child_umask = TyLong_AsInt(args[20]);
    if (child_umask == -1 && TyErr_Occurred()) {
        goto exit;
    }
    preexec_fn = args[21];
    return_value = subprocess_fork_exec_impl(module, process_args, executable_list, close_fds, py_fds_to_keep, cwd_obj, env_list, p2cread, p2cwrite, c2pread, c2pwrite, errread, errwrite, errpipe_read, errpipe_write, restore_signals, call_setsid, pgid_to_set, gid_object, extra_groups_packed, uid_object, child_umask, preexec_fn);

exit:
    return return_value;
}
/*[clinic end generated code: output=942bc2748a9c2785 input=a9049054013a1b77]*/
