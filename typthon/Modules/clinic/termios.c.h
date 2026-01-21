/*[clinic input]
preserve
[clinic start generated code]*/

TyDoc_STRVAR(termios_tcgetattr__doc__,
"tcgetattr($module, fd, /)\n"
"--\n"
"\n"
"Get the tty attributes for file descriptor fd.\n"
"\n"
"Returns a list [iflag, oflag, cflag, lflag, ispeed, ospeed, cc]\n"
"where cc is a list of the tty special characters (each a string of\n"
"length 1, except the items with indices VMIN and VTIME, which are\n"
"integers when these fields are defined).  The interpretation of the\n"
"flags and the speeds as well as the indexing in the cc array must be\n"
"done using the symbolic constants defined in this module.");

#define TERMIOS_TCGETATTR_METHODDEF    \
    {"tcgetattr", (PyCFunction)termios_tcgetattr, METH_O, termios_tcgetattr__doc__},

static TyObject *
termios_tcgetattr_impl(TyObject *module, int fd);

static TyObject *
termios_tcgetattr(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = termios_tcgetattr_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcsetattr__doc__,
"tcsetattr($module, fd, when, attributes, /)\n"
"--\n"
"\n"
"Set the tty attributes for file descriptor fd.\n"
"\n"
"The attributes to be set are taken from the attributes argument, which\n"
"is a list like the one returned by tcgetattr(). The when argument\n"
"determines when the attributes are changed: termios.TCSANOW to\n"
"change immediately, termios.TCSADRAIN to change after transmitting all\n"
"queued output, or termios.TCSAFLUSH to change after transmitting all\n"
"queued output and discarding all queued input.");

#define TERMIOS_TCSETATTR_METHODDEF    \
    {"tcsetattr", (PyCFunction)(void(*)(void))termios_tcsetattr, METH_FASTCALL, termios_tcsetattr__doc__},

static TyObject *
termios_tcsetattr_impl(TyObject *module, int fd, int when, TyObject *term);

static TyObject *
termios_tcsetattr(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int when;
    TyObject *term;

    if (nargs != 3) {
        TyErr_Format(TyExc_TypeError, "tcsetattr expected 3 arguments, got %zd", nargs);
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    when = TyLong_AsInt(args[1]);
    if (when == -1 && TyErr_Occurred()) {
        goto exit;
    }
    term = args[2];
    return_value = termios_tcsetattr_impl(module, fd, when, term);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcsendbreak__doc__,
"tcsendbreak($module, fd, duration, /)\n"
"--\n"
"\n"
"Send a break on file descriptor fd.\n"
"\n"
"A zero duration sends a break for 0.25-0.5 seconds; a nonzero duration\n"
"has a system dependent meaning.");

#define TERMIOS_TCSENDBREAK_METHODDEF    \
    {"tcsendbreak", (PyCFunction)(void(*)(void))termios_tcsendbreak, METH_FASTCALL, termios_tcsendbreak__doc__},

static TyObject *
termios_tcsendbreak_impl(TyObject *module, int fd, int duration);

static TyObject *
termios_tcsendbreak(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int duration;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "tcsendbreak expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    duration = TyLong_AsInt(args[1]);
    if (duration == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = termios_tcsendbreak_impl(module, fd, duration);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcdrain__doc__,
"tcdrain($module, fd, /)\n"
"--\n"
"\n"
"Wait until all output written to file descriptor fd has been transmitted.");

#define TERMIOS_TCDRAIN_METHODDEF    \
    {"tcdrain", (PyCFunction)termios_tcdrain, METH_O, termios_tcdrain__doc__},

static TyObject *
termios_tcdrain_impl(TyObject *module, int fd);

static TyObject *
termios_tcdrain(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = termios_tcdrain_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcflush__doc__,
"tcflush($module, fd, queue, /)\n"
"--\n"
"\n"
"Discard queued data on file descriptor fd.\n"
"\n"
"The queue selector specifies which queue: termios.TCIFLUSH for the input\n"
"queue, termios.TCOFLUSH for the output queue, or termios.TCIOFLUSH for\n"
"both queues.");

#define TERMIOS_TCFLUSH_METHODDEF    \
    {"tcflush", (PyCFunction)(void(*)(void))termios_tcflush, METH_FASTCALL, termios_tcflush__doc__},

static TyObject *
termios_tcflush_impl(TyObject *module, int fd, int queue);

static TyObject *
termios_tcflush(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int queue;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "tcflush expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    queue = TyLong_AsInt(args[1]);
    if (queue == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = termios_tcflush_impl(module, fd, queue);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcflow__doc__,
"tcflow($module, fd, action, /)\n"
"--\n"
"\n"
"Suspend or resume input or output on file descriptor fd.\n"
"\n"
"The action argument can be termios.TCOOFF to suspend output,\n"
"termios.TCOON to restart output, termios.TCIOFF to suspend input,\n"
"or termios.TCION to restart input.");

#define TERMIOS_TCFLOW_METHODDEF    \
    {"tcflow", (PyCFunction)(void(*)(void))termios_tcflow, METH_FASTCALL, termios_tcflow__doc__},

static TyObject *
termios_tcflow_impl(TyObject *module, int fd, int action);

static TyObject *
termios_tcflow(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    int action;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "tcflow expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    action = TyLong_AsInt(args[1]);
    if (action == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = termios_tcflow_impl(module, fd, action);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcgetwinsize__doc__,
"tcgetwinsize($module, fd, /)\n"
"--\n"
"\n"
"Get the tty winsize for file descriptor fd.\n"
"\n"
"Returns a tuple (ws_row, ws_col).");

#define TERMIOS_TCGETWINSIZE_METHODDEF    \
    {"tcgetwinsize", (PyCFunction)termios_tcgetwinsize, METH_O, termios_tcgetwinsize__doc__},

static TyObject *
termios_tcgetwinsize_impl(TyObject *module, int fd);

static TyObject *
termios_tcgetwinsize(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    int fd;

    fd = PyObject_AsFileDescriptor(arg);
    if (fd < 0) {
        goto exit;
    }
    return_value = termios_tcgetwinsize_impl(module, fd);

exit:
    return return_value;
}

TyDoc_STRVAR(termios_tcsetwinsize__doc__,
"tcsetwinsize($module, fd, winsize, /)\n"
"--\n"
"\n"
"Set the tty winsize for file descriptor fd.\n"
"\n"
"The winsize to be set is taken from the winsize argument, which\n"
"is a two-item tuple (ws_row, ws_col) like the one returned by tcgetwinsize().");

#define TERMIOS_TCSETWINSIZE_METHODDEF    \
    {"tcsetwinsize", (PyCFunction)(void(*)(void))termios_tcsetwinsize, METH_FASTCALL, termios_tcsetwinsize__doc__},

static TyObject *
termios_tcsetwinsize_impl(TyObject *module, int fd, TyObject *winsz);

static TyObject *
termios_tcsetwinsize(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int fd;
    TyObject *winsz;

    if (nargs != 2) {
        TyErr_Format(TyExc_TypeError, "tcsetwinsize expected 2 arguments, got %zd", nargs);
        goto exit;
    }
    fd = PyObject_AsFileDescriptor(args[0]);
    if (fd < 0) {
        goto exit;
    }
    winsz = args[1];
    return_value = termios_tcsetwinsize_impl(module, fd, winsz);

exit:
    return return_value;
}
/*[clinic end generated code: output=c6c6192583b0da36 input=a9049054013a1b77]*/
