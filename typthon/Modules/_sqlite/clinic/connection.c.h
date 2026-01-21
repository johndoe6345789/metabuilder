/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

static int
pysqlite_connection_init_impl(pysqlite_Connection *self, TyObject *database,
                              double timeout, int detect_types,
                              const char *isolation_level,
                              int check_same_thread, TyObject *factory,
                              int cache_size, int uri,
                              enum autocommit_mode autocommit);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.__init__'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.__init__'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.__init__'."
#  endif
#endif

static int
pysqlite_connection_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 9
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(database), &_Ty_ID(timeout), &_Ty_ID(detect_types), &_Ty_ID(isolation_level), &_Ty_ID(check_same_thread), &_Ty_ID(factory), &_Ty_ID(cached_statements), &_Ty_ID(uri), &_Ty_ID(autocommit), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"database", "timeout", "detect_types", "isolation_level", "check_same_thread", "factory", "cached_statements", "uri", "autocommit", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "Connection",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[9];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *database;
    double timeout = 5.0;
    int detect_types = 0;
    const char *isolation_level = "";
    int check_same_thread = 1;
    TyObject *factory = (TyObject*)clinic_state()->ConnectionType;
    int cache_size = 128;
    int uri = 0;
    enum autocommit_mode autocommit = LEGACY_TRANSACTION_CONTROL;

    if (nargs > 1 && nargs <= 8) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to _sqlite3.Connection()"
                " is deprecated. Parameters 'timeout', 'detect_types', "
                "'isolation_level', 'check_same_thread', 'factory', "
                "'cached_statements' and 'uri' will become keyword-only "
                "parameters in Python 3.15.", 1))
        {
            goto exit;
        }
    }
    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 8, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    database = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        if (TyFloat_CheckExact(fastargs[1])) {
            timeout = TyFloat_AS_DOUBLE(fastargs[1]);
        }
        else
        {
            timeout = TyFloat_AsDouble(fastargs[1]);
            if (timeout == -1.0 && TyErr_Occurred()) {
                goto exit;
            }
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        detect_types = TyLong_AsInt(fastargs[2]);
        if (detect_types == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[3]) {
        if (!isolation_level_converter(fastargs[3], &isolation_level)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[4]) {
        check_same_thread = PyObject_IsTrue(fastargs[4]);
        if (check_same_thread < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[5]) {
        factory = fastargs[5];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[6]) {
        cache_size = TyLong_AsInt(fastargs[6]);
        if (cache_size == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[7]) {
        uri = PyObject_IsTrue(fastargs[7]);
        if (uri < 0) {
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
    if (!autocommit_converter(fastargs[8], &autocommit)) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = pysqlite_connection_init_impl((pysqlite_Connection *)self, database, timeout, detect_types, isolation_level, check_same_thread, factory, cache_size, uri, autocommit);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_cursor__doc__,
"cursor($self, /, factory=<unrepresentable>)\n"
"--\n"
"\n"
"Return a cursor for the connection.");

#define PYSQLITE_CONNECTION_CURSOR_METHODDEF    \
    {"cursor", _PyCFunction_CAST(pysqlite_connection_cursor), METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_cursor__doc__},

static TyObject *
pysqlite_connection_cursor_impl(pysqlite_Connection *self, TyObject *factory);

static TyObject *
pysqlite_connection_cursor(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(factory), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"factory", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "cursor",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *factory = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    factory = args[0];
skip_optional_pos:
    return_value = pysqlite_connection_cursor_impl((pysqlite_Connection *)self, factory);

exit:
    return return_value;
}

TyDoc_STRVAR(blobopen__doc__,
"blobopen($self, table, column, row, /, *, readonly=False, name=\'main\')\n"
"--\n"
"\n"
"Open and return a BLOB object.\n"
"\n"
"  table\n"
"    Table name.\n"
"  column\n"
"    Column name.\n"
"  row\n"
"    Row index.\n"
"  readonly\n"
"    Open the BLOB without write permissions.\n"
"  name\n"
"    Database name.");

#define BLOBOPEN_METHODDEF    \
    {"blobopen", _PyCFunction_CAST(blobopen), METH_FASTCALL|METH_KEYWORDS, blobopen__doc__},

static TyObject *
blobopen_impl(pysqlite_Connection *self, const char *table, const char *col,
              sqlite3_int64 row, int readonly, const char *name);

static TyObject *
blobopen(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(readonly), &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "", "readonly", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "blobopen",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    const char *table;
    const char *col;
    sqlite3_int64 row;
    int readonly = 0;
    const char *name = "main";

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("blobopen", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t table_length;
    table = TyUnicode_AsUTF8AndSize(args[0], &table_length);
    if (table == NULL) {
        goto exit;
    }
    if (strlen(table) != (size_t)table_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("blobopen", "argument 2", "str", args[1]);
        goto exit;
    }
    Ty_ssize_t col_length;
    col = TyUnicode_AsUTF8AndSize(args[1], &col_length);
    if (col == NULL) {
        goto exit;
    }
    if (strlen(col) != (size_t)col_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (!sqlite3_int64_converter(args[2], &row)) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        readonly = PyObject_IsTrue(args[3]);
        if (readonly < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (!TyUnicode_Check(args[4])) {
        _TyArg_BadArgument("blobopen", "argument 'name'", "str", args[4]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[4], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_kwonly:
    return_value = blobopen_impl((pysqlite_Connection *)self, table, col, row, readonly, name);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_close__doc__,
"close($self, /)\n"
"--\n"
"\n"
"Close the database connection.\n"
"\n"
"Any pending transaction is not committed implicitly.");

#define PYSQLITE_CONNECTION_CLOSE_METHODDEF    \
    {"close", (PyCFunction)pysqlite_connection_close, METH_NOARGS, pysqlite_connection_close__doc__},

static TyObject *
pysqlite_connection_close_impl(pysqlite_Connection *self);

static TyObject *
pysqlite_connection_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_connection_close_impl((pysqlite_Connection *)self);
}

TyDoc_STRVAR(pysqlite_connection_commit__doc__,
"commit($self, /)\n"
"--\n"
"\n"
"Commit any pending transaction to the database.\n"
"\n"
"If there is no open transaction, this method is a no-op.");

#define PYSQLITE_CONNECTION_COMMIT_METHODDEF    \
    {"commit", (PyCFunction)pysqlite_connection_commit, METH_NOARGS, pysqlite_connection_commit__doc__},

static TyObject *
pysqlite_connection_commit_impl(pysqlite_Connection *self);

static TyObject *
pysqlite_connection_commit(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_connection_commit_impl((pysqlite_Connection *)self);
}

TyDoc_STRVAR(pysqlite_connection_rollback__doc__,
"rollback($self, /)\n"
"--\n"
"\n"
"Roll back to the start of any pending transaction.\n"
"\n"
"If there is no open transaction, this method is a no-op.");

#define PYSQLITE_CONNECTION_ROLLBACK_METHODDEF    \
    {"rollback", (PyCFunction)pysqlite_connection_rollback, METH_NOARGS, pysqlite_connection_rollback__doc__},

static TyObject *
pysqlite_connection_rollback_impl(pysqlite_Connection *self);

static TyObject *
pysqlite_connection_rollback(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_connection_rollback_impl((pysqlite_Connection *)self);
}

TyDoc_STRVAR(pysqlite_connection_create_function__doc__,
"create_function($self, /, name, narg, func, *, deterministic=False)\n"
"--\n"
"\n"
"Creates a new function.\n"
"\n"
"Note: Passing keyword arguments \'name\', \'narg\' and \'func\' to\n"
"_sqlite3.Connection.create_function() is deprecated. Parameters\n"
"\'name\', \'narg\' and \'func\' will become positional-only in Python 3.15.\n"
"");

#define PYSQLITE_CONNECTION_CREATE_FUNCTION_METHODDEF    \
    {"create_function", _PyCFunction_CAST(pysqlite_connection_create_function), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_create_function__doc__},

static TyObject *
pysqlite_connection_create_function_impl(pysqlite_Connection *self,
                                         TyTypeObject *cls, const char *name,
                                         int narg, TyObject *func,
                                         int deterministic);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.create_function'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.create_function'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.create_function'."
#  endif
#endif

static TyObject *
pysqlite_connection_create_function(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), &_Ty_ID(narg), &_Ty_ID(func), &_Ty_ID(deterministic), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "narg", "func", "deterministic", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "create_function",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 3;
    const char *name;
    int narg;
    TyObject *func;
    int deterministic = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'name', 'narg' and 'func' to "
                "_sqlite3.Connection.create_function() is deprecated. Parameters "
                "'name', 'narg' and 'func' will become positional-only in Python "
                "3.15.", 1))
        {
            goto exit;
        }
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("create_function", "argument 'name'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    narg = TyLong_AsInt(args[1]);
    if (narg == -1 && TyErr_Occurred()) {
        goto exit;
    }
    func = args[2];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    deterministic = PyObject_IsTrue(args[3]);
    if (deterministic < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = pysqlite_connection_create_function_impl((pysqlite_Connection *)self, cls, name, narg, func, deterministic);

exit:
    return return_value;
}

#if defined(HAVE_WINDOW_FUNCTIONS)

TyDoc_STRVAR(create_window_function__doc__,
"create_window_function($self, name, num_params, aggregate_class, /)\n"
"--\n"
"\n"
"Creates or redefines an aggregate window function. Non-standard.\n"
"\n"
"  name\n"
"    The name of the SQL aggregate window function to be created or\n"
"    redefined.\n"
"  num_params\n"
"    The number of arguments the step and inverse methods takes.\n"
"  aggregate_class\n"
"    A class with step(), finalize(), value(), and inverse() methods.\n"
"    Set to None to clear the window function.");

#define CREATE_WINDOW_FUNCTION_METHODDEF    \
    {"create_window_function", _PyCFunction_CAST(create_window_function), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, create_window_function__doc__},

static TyObject *
create_window_function_impl(pysqlite_Connection *self, TyTypeObject *cls,
                            const char *name, int num_params,
                            TyObject *aggregate_class);

static TyObject *
create_window_function(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", "", "", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "create_window_function",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    const char *name;
    int num_params;
    TyObject *aggregate_class;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("create_window_function", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    num_params = TyLong_AsInt(args[1]);
    if (num_params == -1 && TyErr_Occurred()) {
        goto exit;
    }
    aggregate_class = args[2];
    return_value = create_window_function_impl((pysqlite_Connection *)self, cls, name, num_params, aggregate_class);

exit:
    return return_value;
}

#endif /* defined(HAVE_WINDOW_FUNCTIONS) */

TyDoc_STRVAR(pysqlite_connection_create_aggregate__doc__,
"create_aggregate($self, /, name, n_arg, aggregate_class)\n"
"--\n"
"\n"
"Creates a new aggregate.\n"
"\n"
"Note: Passing keyword arguments \'name\', \'n_arg\' and \'aggregate_class\'\n"
"to _sqlite3.Connection.create_aggregate() is deprecated. Parameters\n"
"\'name\', \'n_arg\' and \'aggregate_class\' will become positional-only in\n"
"Python 3.15.\n"
"");

#define PYSQLITE_CONNECTION_CREATE_AGGREGATE_METHODDEF    \
    {"create_aggregate", _PyCFunction_CAST(pysqlite_connection_create_aggregate), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_create_aggregate__doc__},

static TyObject *
pysqlite_connection_create_aggregate_impl(pysqlite_Connection *self,
                                          TyTypeObject *cls,
                                          const char *name, int n_arg,
                                          TyObject *aggregate_class);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.create_aggregate'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.create_aggregate'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.create_aggregate'."
#  endif
#endif

static TyObject *
pysqlite_connection_create_aggregate(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), &_Ty_ID(n_arg), &_Ty_ID(aggregate_class), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "n_arg", "aggregate_class", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "create_aggregate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    const char *name;
    int n_arg;
    TyObject *aggregate_class;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 3, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 3) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword arguments 'name', 'n_arg' and 'aggregate_class' "
                "to _sqlite3.Connection.create_aggregate() is deprecated. "
                "Parameters 'name', 'n_arg' and 'aggregate_class' will become "
                "positional-only in Python 3.15.", 1))
        {
            goto exit;
        }
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("create_aggregate", "argument 'name'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    n_arg = TyLong_AsInt(args[1]);
    if (n_arg == -1 && TyErr_Occurred()) {
        goto exit;
    }
    aggregate_class = args[2];
    return_value = pysqlite_connection_create_aggregate_impl((pysqlite_Connection *)self, cls, name, n_arg, aggregate_class);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_set_authorizer__doc__,
"set_authorizer($self, /, authorizer_callback)\n"
"--\n"
"\n"
"Set authorizer callback.\n"
"\n"
"Note: Passing keyword argument \'authorizer_callback\' to\n"
"_sqlite3.Connection.set_authorizer() is deprecated. Parameter\n"
"\'authorizer_callback\' will become positional-only in Python 3.15.\n"
"");

#define PYSQLITE_CONNECTION_SET_AUTHORIZER_METHODDEF    \
    {"set_authorizer", _PyCFunction_CAST(pysqlite_connection_set_authorizer), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_set_authorizer__doc__},

static TyObject *
pysqlite_connection_set_authorizer_impl(pysqlite_Connection *self,
                                        TyTypeObject *cls,
                                        TyObject *callable);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.set_authorizer'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.set_authorizer'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.set_authorizer'."
#  endif
#endif

static TyObject *
pysqlite_connection_set_authorizer(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(authorizer_callback), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"authorizer_callback", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "set_authorizer",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *callable;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'authorizer_callback' to "
                "_sqlite3.Connection.set_authorizer() is deprecated. Parameter "
                "'authorizer_callback' will become positional-only in Python "
                "3.15.", 1))
        {
            goto exit;
        }
    }
    callable = args[0];
    return_value = pysqlite_connection_set_authorizer_impl((pysqlite_Connection *)self, cls, callable);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_set_progress_handler__doc__,
"set_progress_handler($self, /, progress_handler, n)\n"
"--\n"
"\n"
"Set progress handler callback.\n"
"\n"
"  progress_handler\n"
"    A callable that takes no arguments.\n"
"    If the callable returns non-zero, the current query is terminated,\n"
"    and an exception is raised.\n"
"  n\n"
"    The number of SQLite virtual machine instructions that are\n"
"    executed between invocations of \'progress_handler\'.\n"
"\n"
"If \'progress_handler\' is None or \'n\' is 0, the progress handler is disabled.\n"
"\n"
"Note: Passing keyword argument \'progress_handler\' to\n"
"_sqlite3.Connection.set_progress_handler() is deprecated. Parameter\n"
"\'progress_handler\' will become positional-only in Python 3.15.\n"
"");

#define PYSQLITE_CONNECTION_SET_PROGRESS_HANDLER_METHODDEF    \
    {"set_progress_handler", _PyCFunction_CAST(pysqlite_connection_set_progress_handler), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_set_progress_handler__doc__},

static TyObject *
pysqlite_connection_set_progress_handler_impl(pysqlite_Connection *self,
                                              TyTypeObject *cls,
                                              TyObject *callable, int n);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.set_progress_handler'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.set_progress_handler'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.set_progress_handler'."
#  endif
#endif

static TyObject *
pysqlite_connection_set_progress_handler(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(progress_handler), _Ty_LATIN1_CHR('n'), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"progress_handler", "n", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "set_progress_handler",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *callable;
    int n;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'progress_handler' to "
                "_sqlite3.Connection.set_progress_handler() is deprecated. "
                "Parameter 'progress_handler' will become positional-only in "
                "Python 3.15.", 1))
        {
            goto exit;
        }
    }
    callable = args[0];
    n = TyLong_AsInt(args[1]);
    if (n == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = pysqlite_connection_set_progress_handler_impl((pysqlite_Connection *)self, cls, callable, n);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_set_trace_callback__doc__,
"set_trace_callback($self, /, trace_callback)\n"
"--\n"
"\n"
"Set a trace callback called for each SQL statement (passed as unicode).\n"
"\n"
"Note: Passing keyword argument \'trace_callback\' to\n"
"_sqlite3.Connection.set_trace_callback() is deprecated. Parameter\n"
"\'trace_callback\' will become positional-only in Python 3.15.\n"
"");

#define PYSQLITE_CONNECTION_SET_TRACE_CALLBACK_METHODDEF    \
    {"set_trace_callback", _PyCFunction_CAST(pysqlite_connection_set_trace_callback), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_set_trace_callback__doc__},

static TyObject *
pysqlite_connection_set_trace_callback_impl(pysqlite_Connection *self,
                                            TyTypeObject *cls,
                                            TyObject *callable);

// Emit compiler warnings when we get to Python 3.15.
#if PY_VERSION_HEX >= 0x030f00C0
#  error "Update the clinic input of '_sqlite3.Connection.set_trace_callback'."
#elif PY_VERSION_HEX >= 0x030f00A0
#  ifdef _MSC_VER
#    pragma message ("Update the clinic input of '_sqlite3.Connection.set_trace_callback'.")
#  else
#    warning "Update the clinic input of '_sqlite3.Connection.set_trace_callback'."
#  endif
#endif

static TyObject *
pysqlite_connection_set_trace_callback(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(trace_callback), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"trace_callback", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "set_trace_callback",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *callable;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing keyword argument 'trace_callback' to "
                "_sqlite3.Connection.set_trace_callback() is deprecated. "
                "Parameter 'trace_callback' will become positional-only in Python"
                " 3.15.", 1))
        {
            goto exit;
        }
    }
    callable = args[0];
    return_value = pysqlite_connection_set_trace_callback_impl((pysqlite_Connection *)self, cls, callable);

exit:
    return return_value;
}

#if defined(PY_SQLITE_ENABLE_LOAD_EXTENSION)

TyDoc_STRVAR(pysqlite_connection_enable_load_extension__doc__,
"enable_load_extension($self, enable, /)\n"
"--\n"
"\n"
"Enable dynamic loading of SQLite extension modules.");

#define PYSQLITE_CONNECTION_ENABLE_LOAD_EXTENSION_METHODDEF    \
    {"enable_load_extension", (PyCFunction)pysqlite_connection_enable_load_extension, METH_O, pysqlite_connection_enable_load_extension__doc__},

static TyObject *
pysqlite_connection_enable_load_extension_impl(pysqlite_Connection *self,
                                               int onoff);

static TyObject *
pysqlite_connection_enable_load_extension(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int onoff;

    onoff = PyObject_IsTrue(arg);
    if (onoff < 0) {
        goto exit;
    }
    return_value = pysqlite_connection_enable_load_extension_impl((pysqlite_Connection *)self, onoff);

exit:
    return return_value;
}

#endif /* defined(PY_SQLITE_ENABLE_LOAD_EXTENSION) */

#if defined(PY_SQLITE_ENABLE_LOAD_EXTENSION)

TyDoc_STRVAR(pysqlite_connection_load_extension__doc__,
"load_extension($self, name, /, *, entrypoint=None)\n"
"--\n"
"\n"
"Load SQLite extension module.");

#define PYSQLITE_CONNECTION_LOAD_EXTENSION_METHODDEF    \
    {"load_extension", _PyCFunction_CAST(pysqlite_connection_load_extension), METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_load_extension__doc__},

static TyObject *
pysqlite_connection_load_extension_impl(pysqlite_Connection *self,
                                        const char *extension_name,
                                        const char *entrypoint);

static TyObject *
pysqlite_connection_load_extension(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(entrypoint), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "entrypoint", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "load_extension",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    const char *extension_name;
    const char *entrypoint = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("load_extension", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t extension_name_length;
    extension_name = TyUnicode_AsUTF8AndSize(args[0], &extension_name_length);
    if (extension_name == NULL) {
        goto exit;
    }
    if (strlen(extension_name) != (size_t)extension_name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1] == Ty_None) {
        entrypoint = NULL;
    }
    else if (TyUnicode_Check(args[1])) {
        Ty_ssize_t entrypoint_length;
        entrypoint = TyUnicode_AsUTF8AndSize(args[1], &entrypoint_length);
        if (entrypoint == NULL) {
            goto exit;
        }
        if (strlen(entrypoint) != (size_t)entrypoint_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("load_extension", "argument 'entrypoint'", "str or None", args[1]);
        goto exit;
    }
skip_optional_kwonly:
    return_value = pysqlite_connection_load_extension_impl((pysqlite_Connection *)self, extension_name, entrypoint);

exit:
    return return_value;
}

#endif /* defined(PY_SQLITE_ENABLE_LOAD_EXTENSION) */

TyDoc_STRVAR(pysqlite_connection_execute__doc__,
"execute($self, sql, parameters=<unrepresentable>, /)\n"
"--\n"
"\n"
"Executes an SQL statement.");

#define PYSQLITE_CONNECTION_EXECUTE_METHODDEF    \
    {"execute", _PyCFunction_CAST(pysqlite_connection_execute), METH_FASTCALL, pysqlite_connection_execute__doc__},

static TyObject *
pysqlite_connection_execute_impl(pysqlite_Connection *self, TyObject *sql,
                                 TyObject *parameters);

static TyObject *
pysqlite_connection_execute(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sql;
    TyObject *parameters = NULL;

    if (!_TyArg_CheckPositional("execute", nargs, 1, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("execute", "argument 1", "str", args[0]);
        goto exit;
    }
    sql = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    parameters = args[1];
skip_optional:
    return_value = pysqlite_connection_execute_impl((pysqlite_Connection *)self, sql, parameters);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_executemany__doc__,
"executemany($self, sql, parameters, /)\n"
"--\n"
"\n"
"Repeatedly executes an SQL statement.");

#define PYSQLITE_CONNECTION_EXECUTEMANY_METHODDEF    \
    {"executemany", _PyCFunction_CAST(pysqlite_connection_executemany), METH_FASTCALL, pysqlite_connection_executemany__doc__},

static TyObject *
pysqlite_connection_executemany_impl(pysqlite_Connection *self,
                                     TyObject *sql, TyObject *parameters);

static TyObject *
pysqlite_connection_executemany(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sql;
    TyObject *parameters;

    if (!_TyArg_CheckPositional("executemany", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("executemany", "argument 1", "str", args[0]);
        goto exit;
    }
    sql = args[0];
    parameters = args[1];
    return_value = pysqlite_connection_executemany_impl((pysqlite_Connection *)self, sql, parameters);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_executescript__doc__,
"executescript($self, sql_script, /)\n"
"--\n"
"\n"
"Executes multiple SQL statements at once.");

#define PYSQLITE_CONNECTION_EXECUTESCRIPT_METHODDEF    \
    {"executescript", (PyCFunction)pysqlite_connection_executescript, METH_O, pysqlite_connection_executescript__doc__},

static TyObject *
pysqlite_connection_executescript_impl(pysqlite_Connection *self,
                                       TyObject *script_obj);

static TyObject *
pysqlite_connection_executescript(TyObject *self, TyObject *script_obj)
{
    TyObject *return_value = NULL;

    return_value = pysqlite_connection_executescript_impl((pysqlite_Connection *)self, script_obj);

    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_interrupt__doc__,
"interrupt($self, /)\n"
"--\n"
"\n"
"Abort any pending database operation.");

#define PYSQLITE_CONNECTION_INTERRUPT_METHODDEF    \
    {"interrupt", (PyCFunction)pysqlite_connection_interrupt, METH_NOARGS, pysqlite_connection_interrupt__doc__},

static TyObject *
pysqlite_connection_interrupt_impl(pysqlite_Connection *self);

static TyObject *
pysqlite_connection_interrupt(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_connection_interrupt_impl((pysqlite_Connection *)self);
}

TyDoc_STRVAR(pysqlite_connection_iterdump__doc__,
"iterdump($self, /, *, filter=None)\n"
"--\n"
"\n"
"Returns iterator to the dump of the database in an SQL text format.\n"
"\n"
"  filter\n"
"    An optional LIKE pattern for database objects to dump");

#define PYSQLITE_CONNECTION_ITERDUMP_METHODDEF    \
    {"iterdump", _PyCFunction_CAST(pysqlite_connection_iterdump), METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_iterdump__doc__},

static TyObject *
pysqlite_connection_iterdump_impl(pysqlite_Connection *self,
                                  TyObject *filter);

static TyObject *
pysqlite_connection_iterdump(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(filter), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"filter", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "iterdump",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *filter = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    filter = args[0];
skip_optional_kwonly:
    return_value = pysqlite_connection_iterdump_impl((pysqlite_Connection *)self, filter);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_backup__doc__,
"backup($self, /, target, *, pages=-1, progress=None, name=\'main\',\n"
"       sleep=0.25)\n"
"--\n"
"\n"
"Makes a backup of the database.");

#define PYSQLITE_CONNECTION_BACKUP_METHODDEF    \
    {"backup", _PyCFunction_CAST(pysqlite_connection_backup), METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_backup__doc__},

static TyObject *
pysqlite_connection_backup_impl(pysqlite_Connection *self,
                                pysqlite_Connection *target, int pages,
                                TyObject *progress, const char *name,
                                double sleep);

static TyObject *
pysqlite_connection_backup(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(target), &_Ty_ID(pages), &_Ty_ID(progress), &_Ty_ID(name), &_Ty_ID(sleep), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"target", "pages", "progress", "name", "sleep", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "backup",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    pysqlite_Connection *target;
    int pages = -1;
    TyObject *progress = Ty_None;
    const char *name = "main";
    double sleep = 0.25;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], clinic_state()->ConnectionType)) {
        _TyArg_BadArgument("backup", "argument 'target'", (clinic_state()->ConnectionType)->tp_name, args[0]);
        goto exit;
    }
    target = (pysqlite_Connection *)args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        pages = TyLong_AsInt(args[1]);
        if (pages == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        progress = args[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        if (!TyUnicode_Check(args[3])) {
            _TyArg_BadArgument("backup", "argument 'name'", "str", args[3]);
            goto exit;
        }
        Ty_ssize_t name_length;
        name = TyUnicode_AsUTF8AndSize(args[3], &name_length);
        if (name == NULL) {
            goto exit;
        }
        if (strlen(name) != (size_t)name_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (TyFloat_CheckExact(args[4])) {
        sleep = TyFloat_AS_DOUBLE(args[4]);
    }
    else
    {
        sleep = TyFloat_AsDouble(args[4]);
        if (sleep == -1.0 && TyErr_Occurred()) {
            goto exit;
        }
    }
skip_optional_kwonly:
    return_value = pysqlite_connection_backup_impl((pysqlite_Connection *)self, target, pages, progress, name, sleep);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_connection_create_collation__doc__,
"create_collation($self, name, callback, /)\n"
"--\n"
"\n"
"Creates a collation function.");

#define PYSQLITE_CONNECTION_CREATE_COLLATION_METHODDEF    \
    {"create_collation", _PyCFunction_CAST(pysqlite_connection_create_collation), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pysqlite_connection_create_collation__doc__},

static TyObject *
pysqlite_connection_create_collation_impl(pysqlite_Connection *self,
                                          TyTypeObject *cls,
                                          const char *name,
                                          TyObject *callable);

static TyObject *
pysqlite_connection_create_collation(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", "", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "create_collation",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    const char *name;
    TyObject *callable;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("create_collation", "argument 1", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    callable = args[1];
    return_value = pysqlite_connection_create_collation_impl((pysqlite_Connection *)self, cls, name, callable);

exit:
    return return_value;
}

#if defined(PY_SQLITE_HAVE_SERIALIZE)

TyDoc_STRVAR(serialize__doc__,
"serialize($self, /, *, name=\'main\')\n"
"--\n"
"\n"
"Serialize a database into a byte string.\n"
"\n"
"  name\n"
"    Which database to serialize.\n"
"\n"
"For an ordinary on-disk database file, the serialization is just a copy of the\n"
"disk file. For an in-memory database or a \"temp\" database, the serialization is\n"
"the same sequence of bytes which would be written to disk if that database\n"
"were backed up to disk.");

#define SERIALIZE_METHODDEF    \
    {"serialize", _PyCFunction_CAST(serialize), METH_FASTCALL|METH_KEYWORDS, serialize__doc__},

static TyObject *
serialize_impl(pysqlite_Connection *self, const char *name);

static TyObject *
serialize(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "serialize",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    const char *name = "main";

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("serialize", "argument 'name'", "str", args[0]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[0], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_kwonly:
    return_value = serialize_impl((pysqlite_Connection *)self, name);

exit:
    return return_value;
}

#endif /* defined(PY_SQLITE_HAVE_SERIALIZE) */

#if defined(PY_SQLITE_HAVE_SERIALIZE)

TyDoc_STRVAR(deserialize__doc__,
"deserialize($self, data, /, *, name=\'main\')\n"
"--\n"
"\n"
"Load a serialized database.\n"
"\n"
"  data\n"
"    The serialized database content.\n"
"  name\n"
"    Which database to reopen with the deserialization.\n"
"\n"
"The deserialize interface causes the database connection to disconnect from the\n"
"target database, and then reopen it as an in-memory database based on the given\n"
"serialized data.\n"
"\n"
"The deserialize interface will fail with SQLITE_BUSY if the database is\n"
"currently in a read transaction or is involved in a backup operation.");

#define DESERIALIZE_METHODDEF    \
    {"deserialize", _PyCFunction_CAST(deserialize), METH_FASTCALL|METH_KEYWORDS, deserialize__doc__},

static TyObject *
deserialize_impl(pysqlite_Connection *self, Ty_buffer *data,
                 const char *name);

static TyObject *
deserialize(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(name), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "name", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "deserialize",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer data = {NULL, NULL};
    const char *name = "main";

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (TyUnicode_Check(args[0])) {
        Ty_ssize_t len;
        const char *ptr = TyUnicode_AsUTF8AndSize(args[0], &len);
        if (ptr == NULL) {
            goto exit;
        }
        if (PyBuffer_FillInfo(&data, args[0], (void *)ptr, len, 1, PyBUF_SIMPLE) < 0) {
            goto exit;
        }
    }
    else { /* any bytes-like object */
        if (PyObject_GetBuffer(args[0], &data, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("deserialize", "argument 'name'", "str", args[1]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(args[1], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_kwonly:
    return_value = deserialize_impl((pysqlite_Connection *)self, &data, name);

exit:
    /* Cleanup for data */
    if (data.obj) {
       PyBuffer_Release(&data);
    }

    return return_value;
}

#endif /* defined(PY_SQLITE_HAVE_SERIALIZE) */

TyDoc_STRVAR(pysqlite_connection_enter__doc__,
"__enter__($self, /)\n"
"--\n"
"\n"
"Called when the connection is used as a context manager.\n"
"\n"
"Returns itself as a convenience to the caller.");

#define PYSQLITE_CONNECTION_ENTER_METHODDEF    \
    {"__enter__", (PyCFunction)pysqlite_connection_enter, METH_NOARGS, pysqlite_connection_enter__doc__},

static TyObject *
pysqlite_connection_enter_impl(pysqlite_Connection *self);

static TyObject *
pysqlite_connection_enter(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_connection_enter_impl((pysqlite_Connection *)self);
}

TyDoc_STRVAR(pysqlite_connection_exit__doc__,
"__exit__($self, type, value, traceback, /)\n"
"--\n"
"\n"
"Called when the connection is used as a context manager.\n"
"\n"
"If there was any exception, a rollback takes place; otherwise we commit.");

#define PYSQLITE_CONNECTION_EXIT_METHODDEF    \
    {"__exit__", _PyCFunction_CAST(pysqlite_connection_exit), METH_FASTCALL, pysqlite_connection_exit__doc__},

static TyObject *
pysqlite_connection_exit_impl(pysqlite_Connection *self, TyObject *exc_type,
                              TyObject *exc_value, TyObject *exc_tb);

static TyObject *
pysqlite_connection_exit(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *exc_type;
    TyObject *exc_value;
    TyObject *exc_tb;

    if (!_TyArg_CheckPositional("__exit__", nargs, 3, 3)) {
        goto exit;
    }
    exc_type = args[0];
    exc_value = args[1];
    exc_tb = args[2];
    return_value = pysqlite_connection_exit_impl((pysqlite_Connection *)self, exc_type, exc_value, exc_tb);

exit:
    return return_value;
}

TyDoc_STRVAR(setlimit__doc__,
"setlimit($self, category, limit, /)\n"
"--\n"
"\n"
"Set connection run-time limits.\n"
"\n"
"  category\n"
"    The limit category to be set.\n"
"  limit\n"
"    The new limit. If the new limit is a negative number, the limit is\n"
"    unchanged.\n"
"\n"
"Attempts to increase a limit above its hard upper bound are silently truncated\n"
"to the hard upper bound. Regardless of whether or not the limit was changed,\n"
"the prior value of the limit is returned.");

#define SETLIMIT_METHODDEF    \
    {"setlimit", _PyCFunction_CAST(setlimit), METH_FASTCALL, setlimit__doc__},

static TyObject *
setlimit_impl(pysqlite_Connection *self, int category, int limit);

static TyObject *
setlimit(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int category;
    int limit;

    if (!_TyArg_CheckPositional("setlimit", nargs, 2, 2)) {
        goto exit;
    }
    category = TyLong_AsInt(args[0]);
    if (category == -1 && TyErr_Occurred()) {
        goto exit;
    }
    limit = TyLong_AsInt(args[1]);
    if (limit == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = setlimit_impl((pysqlite_Connection *)self, category, limit);

exit:
    return return_value;
}

TyDoc_STRVAR(getlimit__doc__,
"getlimit($self, category, /)\n"
"--\n"
"\n"
"Get connection run-time limits.\n"
"\n"
"  category\n"
"    The limit category to be queried.");

#define GETLIMIT_METHODDEF    \
    {"getlimit", (PyCFunction)getlimit, METH_O, getlimit__doc__},

static TyObject *
getlimit_impl(pysqlite_Connection *self, int category);

static TyObject *
getlimit(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int category;

    category = TyLong_AsInt(arg);
    if (category == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = getlimit_impl((pysqlite_Connection *)self, category);

exit:
    return return_value;
}

TyDoc_STRVAR(setconfig__doc__,
"setconfig($self, op, enable=True, /)\n"
"--\n"
"\n"
"Set a boolean connection configuration option.\n"
"\n"
"  op\n"
"    The configuration verb; one of the sqlite3.SQLITE_DBCONFIG codes.");

#define SETCONFIG_METHODDEF    \
    {"setconfig", _PyCFunction_CAST(setconfig), METH_FASTCALL, setconfig__doc__},

static TyObject *
setconfig_impl(pysqlite_Connection *self, int op, int enable);

static TyObject *
setconfig(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    int op;
    int enable = 1;

    if (!_TyArg_CheckPositional("setconfig", nargs, 1, 2)) {
        goto exit;
    }
    op = TyLong_AsInt(args[0]);
    if (op == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional;
    }
    enable = PyObject_IsTrue(args[1]);
    if (enable < 0) {
        goto exit;
    }
skip_optional:
    return_value = setconfig_impl((pysqlite_Connection *)self, op, enable);

exit:
    return return_value;
}

TyDoc_STRVAR(getconfig__doc__,
"getconfig($self, op, /)\n"
"--\n"
"\n"
"Query a boolean connection configuration option.\n"
"\n"
"  op\n"
"    The configuration verb; one of the sqlite3.SQLITE_DBCONFIG codes.");

#define GETCONFIG_METHODDEF    \
    {"getconfig", (PyCFunction)getconfig, METH_O, getconfig__doc__},

static int
getconfig_impl(pysqlite_Connection *self, int op);

static TyObject *
getconfig(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int op;
    int _return_value;

    op = TyLong_AsInt(arg);
    if (op == -1 && TyErr_Occurred()) {
        goto exit;
    }
    _return_value = getconfig_impl((pysqlite_Connection *)self, op);
    if ((_return_value == -1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyBool_FromLong((long)_return_value);

exit:
    return return_value;
}

#ifndef CREATE_WINDOW_FUNCTION_METHODDEF
    #define CREATE_WINDOW_FUNCTION_METHODDEF
#endif /* !defined(CREATE_WINDOW_FUNCTION_METHODDEF) */

#ifndef PYSQLITE_CONNECTION_ENABLE_LOAD_EXTENSION_METHODDEF
    #define PYSQLITE_CONNECTION_ENABLE_LOAD_EXTENSION_METHODDEF
#endif /* !defined(PYSQLITE_CONNECTION_ENABLE_LOAD_EXTENSION_METHODDEF) */

#ifndef PYSQLITE_CONNECTION_LOAD_EXTENSION_METHODDEF
    #define PYSQLITE_CONNECTION_LOAD_EXTENSION_METHODDEF
#endif /* !defined(PYSQLITE_CONNECTION_LOAD_EXTENSION_METHODDEF) */

#ifndef SERIALIZE_METHODDEF
    #define SERIALIZE_METHODDEF
#endif /* !defined(SERIALIZE_METHODDEF) */

#ifndef DESERIALIZE_METHODDEF
    #define DESERIALIZE_METHODDEF
#endif /* !defined(DESERIALIZE_METHODDEF) */
/*[clinic end generated code: output=2f325c2444b4bb47 input=a9049054013a1b77]*/
