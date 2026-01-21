/*[clinic input]
preserve
[clinic start generated code]*/

TyDoc_STRVAR(pwd_getpwuid__doc__,
"getpwuid($module, uidobj, /)\n"
"--\n"
"\n"
"Return the password database entry for the given numeric user ID.\n"
"\n"
"See `help(pwd)` for more on password database entries.");

#define PWD_GETPWUID_METHODDEF    \
    {"getpwuid", (PyCFunction)pwd_getpwuid, METH_O, pwd_getpwuid__doc__},

TyDoc_STRVAR(pwd_getpwnam__doc__,
"getpwnam($module, name, /)\n"
"--\n"
"\n"
"Return the password database entry for the given user name.\n"
"\n"
"See `help(pwd)` for more on password database entries.");

#define PWD_GETPWNAM_METHODDEF    \
    {"getpwnam", (PyCFunction)pwd_getpwnam, METH_O, pwd_getpwnam__doc__},

static TyObject *
pwd_getpwnam_impl(TyObject *module, TyObject *name);

static TyObject *
pwd_getpwnam(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *name;

    if (!TyUnicode_Check(arg)) {
        TyErr_Format(TyExc_TypeError, "getpwnam() argument must be str, not %T", arg);
        goto exit;
    }
    name = arg;
    return_value = pwd_getpwnam_impl(module, name);

exit:
    return return_value;
}

#if defined(HAVE_GETPWENT)

TyDoc_STRVAR(pwd_getpwall__doc__,
"getpwall($module, /)\n"
"--\n"
"\n"
"Return a list of all available password database entries, in arbitrary order.\n"
"\n"
"See help(pwd) for more on password database entries.");

#define PWD_GETPWALL_METHODDEF    \
    {"getpwall", (PyCFunction)pwd_getpwall, METH_NOARGS, pwd_getpwall__doc__},

static TyObject *
pwd_getpwall_impl(TyObject *module);

static TyObject *
pwd_getpwall(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return pwd_getpwall_impl(module);
}

#endif /* defined(HAVE_GETPWENT) */

#ifndef PWD_GETPWALL_METHODDEF
    #define PWD_GETPWALL_METHODDEF
#endif /* !defined(PWD_GETPWALL_METHODDEF) */
/*[clinic end generated code: output=dac88d500f6d6f49 input=a9049054013a1b77]*/
