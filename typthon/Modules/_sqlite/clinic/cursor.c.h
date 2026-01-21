/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

static int
pysqlite_cursor_init_impl(pysqlite_Cursor *self,
                          pysqlite_Connection *connection);

static int
pysqlite_cursor_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    TyTypeObject *base_tp = clinic_state()->CursorType;
    pysqlite_Connection *connection;

    if ((Ty_IS_TYPE(self, base_tp) ||
         Ty_TYPE(self)->tp_new == base_tp->tp_new) &&
        !_TyArg_NoKeywords("Cursor", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("Cursor", TyTuple_GET_SIZE(args), 1, 1)) {
        goto exit;
    }
    if (!PyObject_TypeCheck(TyTuple_GET_ITEM(args, 0), clinic_state()->ConnectionType)) {
        _TyArg_BadArgument("Cursor", "argument 1", (clinic_state()->ConnectionType)->tp_name, TyTuple_GET_ITEM(args, 0));
        goto exit;
    }
    connection = (pysqlite_Connection *)TyTuple_GET_ITEM(args, 0);
    return_value = pysqlite_cursor_init_impl((pysqlite_Cursor *)self, connection);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_execute__doc__,
"execute($self, sql, parameters=(), /)\n"
"--\n"
"\n"
"Executes an SQL statement.");

#define PYSQLITE_CURSOR_EXECUTE_METHODDEF    \
    {"execute", _PyCFunction_CAST(pysqlite_cursor_execute), METH_FASTCALL, pysqlite_cursor_execute__doc__},

static TyObject *
pysqlite_cursor_execute_impl(pysqlite_Cursor *self, TyObject *sql,
                             TyObject *parameters);

static TyObject *
pysqlite_cursor_execute(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
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
    return_value = pysqlite_cursor_execute_impl((pysqlite_Cursor *)self, sql, parameters);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_executemany__doc__,
"executemany($self, sql, seq_of_parameters, /)\n"
"--\n"
"\n"
"Repeatedly executes an SQL statement.");

#define PYSQLITE_CURSOR_EXECUTEMANY_METHODDEF    \
    {"executemany", _PyCFunction_CAST(pysqlite_cursor_executemany), METH_FASTCALL, pysqlite_cursor_executemany__doc__},

static TyObject *
pysqlite_cursor_executemany_impl(pysqlite_Cursor *self, TyObject *sql,
                                 TyObject *seq_of_parameters);

static TyObject *
pysqlite_cursor_executemany(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *sql;
    TyObject *seq_of_parameters;

    if (!_TyArg_CheckPositional("executemany", nargs, 2, 2)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[0])) {
        _TyArg_BadArgument("executemany", "argument 1", "str", args[0]);
        goto exit;
    }
    sql = args[0];
    seq_of_parameters = args[1];
    return_value = pysqlite_cursor_executemany_impl((pysqlite_Cursor *)self, sql, seq_of_parameters);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_executescript__doc__,
"executescript($self, sql_script, /)\n"
"--\n"
"\n"
"Executes multiple SQL statements at once.");

#define PYSQLITE_CURSOR_EXECUTESCRIPT_METHODDEF    \
    {"executescript", (PyCFunction)pysqlite_cursor_executescript, METH_O, pysqlite_cursor_executescript__doc__},

static TyObject *
pysqlite_cursor_executescript_impl(pysqlite_Cursor *self,
                                   const char *sql_script);

static TyObject *
pysqlite_cursor_executescript(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *sql_script;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("executescript", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t sql_script_length;
    sql_script = TyUnicode_AsUTF8AndSize(arg, &sql_script_length);
    if (sql_script == NULL) {
        goto exit;
    }
    if (strlen(sql_script) != (size_t)sql_script_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = pysqlite_cursor_executescript_impl((pysqlite_Cursor *)self, sql_script);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_fetchone__doc__,
"fetchone($self, /)\n"
"--\n"
"\n"
"Fetches one row from the resultset.");

#define PYSQLITE_CURSOR_FETCHONE_METHODDEF    \
    {"fetchone", (PyCFunction)pysqlite_cursor_fetchone, METH_NOARGS, pysqlite_cursor_fetchone__doc__},

static TyObject *
pysqlite_cursor_fetchone_impl(pysqlite_Cursor *self);

static TyObject *
pysqlite_cursor_fetchone(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_cursor_fetchone_impl((pysqlite_Cursor *)self);
}

TyDoc_STRVAR(pysqlite_cursor_fetchmany__doc__,
"fetchmany($self, /, size=1)\n"
"--\n"
"\n"
"Fetches several rows from the resultset.\n"
"\n"
"  size\n"
"    The default value is set by the Cursor.arraysize attribute.");

#define PYSQLITE_CURSOR_FETCHMANY_METHODDEF    \
    {"fetchmany", _PyCFunction_CAST(pysqlite_cursor_fetchmany), METH_FASTCALL|METH_KEYWORDS, pysqlite_cursor_fetchmany__doc__},

static TyObject *
pysqlite_cursor_fetchmany_impl(pysqlite_Cursor *self, int maxrows);

static TyObject *
pysqlite_cursor_fetchmany(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(size), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"size", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "fetchmany",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int maxrows = ((pysqlite_Cursor *)self)->arraysize;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    maxrows = TyLong_AsInt(args[0]);
    if (maxrows == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_pos:
    return_value = pysqlite_cursor_fetchmany_impl((pysqlite_Cursor *)self, maxrows);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_fetchall__doc__,
"fetchall($self, /)\n"
"--\n"
"\n"
"Fetches all rows from the resultset.");

#define PYSQLITE_CURSOR_FETCHALL_METHODDEF    \
    {"fetchall", (PyCFunction)pysqlite_cursor_fetchall, METH_NOARGS, pysqlite_cursor_fetchall__doc__},

static TyObject *
pysqlite_cursor_fetchall_impl(pysqlite_Cursor *self);

static TyObject *
pysqlite_cursor_fetchall(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_cursor_fetchall_impl((pysqlite_Cursor *)self);
}

TyDoc_STRVAR(pysqlite_cursor_setinputsizes__doc__,
"setinputsizes($self, sizes, /)\n"
"--\n"
"\n"
"Required by DB-API. Does nothing in sqlite3.");

#define PYSQLITE_CURSOR_SETINPUTSIZES_METHODDEF    \
    {"setinputsizes", (PyCFunction)pysqlite_cursor_setinputsizes, METH_O, pysqlite_cursor_setinputsizes__doc__},

static TyObject *
pysqlite_cursor_setinputsizes_impl(pysqlite_Cursor *self, TyObject *sizes);

static TyObject *
pysqlite_cursor_setinputsizes(TyObject *self, TyObject *sizes)
{
    TyObject *return_value = NULL;

    return_value = pysqlite_cursor_setinputsizes_impl((pysqlite_Cursor *)self, sizes);

    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_setoutputsize__doc__,
"setoutputsize($self, size, column=None, /)\n"
"--\n"
"\n"
"Required by DB-API. Does nothing in sqlite3.");

#define PYSQLITE_CURSOR_SETOUTPUTSIZE_METHODDEF    \
    {"setoutputsize", _PyCFunction_CAST(pysqlite_cursor_setoutputsize), METH_FASTCALL, pysqlite_cursor_setoutputsize__doc__},

static TyObject *
pysqlite_cursor_setoutputsize_impl(pysqlite_Cursor *self, TyObject *size,
                                   TyObject *column);

static TyObject *
pysqlite_cursor_setoutputsize(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *size;
    TyObject *column = Ty_None;

    if (!_TyArg_CheckPositional("setoutputsize", nargs, 1, 2)) {
        goto exit;
    }
    size = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    column = args[1];
skip_optional:
    return_value = pysqlite_cursor_setoutputsize_impl((pysqlite_Cursor *)self, size, column);

exit:
    return return_value;
}

TyDoc_STRVAR(pysqlite_cursor_close__doc__,
"close($self, /)\n"
"--\n"
"\n"
"Closes the cursor.");

#define PYSQLITE_CURSOR_CLOSE_METHODDEF    \
    {"close", (PyCFunction)pysqlite_cursor_close, METH_NOARGS, pysqlite_cursor_close__doc__},

static TyObject *
pysqlite_cursor_close_impl(pysqlite_Cursor *self);

static TyObject *
pysqlite_cursor_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pysqlite_cursor_close_impl((pysqlite_Cursor *)self);
}
/*[clinic end generated code: output=d05c7cbbc8bcab26 input=a9049054013a1b77]*/
