/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(HAVE_GETRUSAGE)

TyDoc_STRVAR(resource_getrusage__doc__,
"getrusage($module, who, /)\n"
"--\n"
"\n");

#define RESOURCE_GETRUSAGE_METHODDEF    \
    {"getrusage", (PyCFunction)resource_getrusage, METH_O, resource_getrusage__doc__},

static TyObject *
resource_getrusage_impl(TyObject *module, int who);

static TyObject *
resource_getrusage(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int who;

    who = TyLong_AsInt(arg);
    if (who == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = resource_getrusage_impl(module, who);

exit:
    return return_value;
}

#endif /* defined(HAVE_GETRUSAGE) */

TyDoc_STRVAR(resource_getrlimit__doc__,
"getrlimit($module, resource, /)\n"
"--\n"
"\n");

#define RESOURCE_GETRLIMIT_METHODDEF    \
    {"getrlimit", (PyCFunction)resource_getrlimit, METH_O, resource_getrlimit__doc__},

static TyObject *
resource_getrlimit_impl(TyObject *module, int resource);

static TyObject *
resource_getrlimit(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int resource;

    resource = TyLong_AsInt(arg);
    if (resource == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = resource_getrlimit_impl(module, resource);

exit:
    return return_value;
}

TyDoc_STRVAR(resource_setrlimit__doc__,
"setrlimit($module, resource, limits, /)\n"
"--\n"
"\n");

#define RESOURCE_SETRLIMIT_METHODDEF    \
    {"setrlimit", (PyCFunction)(void(*)(void))resource_setrlimit, METH_FASTCALL, resource_setrlimit__doc__},

static TyObject *
resource_setrlimit_impl(TyObject *module, int resource, TyObject *limits);

static TyObject *
resource_setrlimit(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int resource;
    TyObject *limits;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "setrlimit expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    resource = TyLong_AsInt(args[0]);
    if (resource == -1 && TyErr_Occurred()) {
        goto exit;
    }
    limits = args[1];
    return_value = resource_setrlimit_impl(module, resource, limits);

exit:
    return return_value;
}

#if defined(HAVE_PRLIMIT)

TyDoc_STRVAR(resource_prlimit__doc__,
"prlimit($module, pid, resource, limits=None, /)\n"
"--\n"
"\n");

#define RESOURCE_PRLIMIT_METHODDEF    \
    {"prlimit", (PyCFunction)(void(*)(void))resource_prlimit, METH_FASTCALL, resource_prlimit__doc__},

static TyObject *
resource_prlimit_impl(TyObject *module, pid_t pid, int resource,
                      TyObject *limits);

static TyObject *
resource_prlimit(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    pid_t pid;
    int resource;
    TyObject *limits = Ty_None;

    if (nargs < 2) {
        TyErr_Format(TyExc_TypeError, "prlimit expected at least 2 arguments, got %zd", nargs);
        goto exit;
    }
    if (nargs > 3) {
        TyErr_Format(TyExc_TypeError, "prlimit expected at most 3 arguments, got %zd", nargs);
        goto exit;
    }
    pid = TyLong_AsPid(args[0]);
    if (pid == -1 && TyErr_Occurred()) {
        goto exit;
    }
    resource = TyLong_AsInt(args[1]);
    if (resource == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 3) {
        goto skip_optional;
    }
    limits = args[2];
skip_optional:
    return_value = resource_prlimit_impl(module, pid, resource, limits);

exit:
    return return_value;
}

#endif /* defined(HAVE_PRLIMIT) */

TyDoc_STRVAR(resource_getpagesize__doc__,
"getpagesize($module, /)\n"
"--\n"
"\n");

#define RESOURCE_GETPAGESIZE_METHODDEF    \
    {"getpagesize", (PyCFunction)resource_getpagesize, METH_NOARGS, resource_getpagesize__doc__},

static int
resource_getpagesize_impl(TyObject *module);

static TyObject *
resource_getpagesize(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    int _return_value;

    _return_value = resource_getpagesize_impl(module);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromLong((long)_return_value);

exit:
    return return_value;
}

#ifndef RESOURCE_GETRUSAGE_METHODDEF
    #define RESOURCE_GETRUSAGE_METHODDEF
#endif /* !defined(RESOURCE_GETRUSAGE_METHODDEF) */

#ifndef RESOURCE_PRLIMIT_METHODDEF
    #define RESOURCE_PRLIMIT_METHODDEF
#endif /* !defined(RESOURCE_PRLIMIT_METHODDEF) */
/*[clinic end generated code: output=e45883ace510414a input=a9049054013a1b77]*/
