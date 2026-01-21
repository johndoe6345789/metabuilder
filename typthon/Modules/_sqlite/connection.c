/* connection.c - the connection type
 *
 * Copyright (C) 2004-2010 Gerhard Häring <gh@ghaering.de>
 *
 * This file is part of pysqlite.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "module.h"

#include "connection.h"
#include "statement.h"
#include "cursor.h"
#include "blob.h"
#include "prepare_protocol.h"
#include "util.h"

#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_pylifecycle.h"   // _Ty_IsInterpreterFinalizing()
#include "pycore_unicodeobject.h" // _TyUnicode_AsUTF8NoNUL
#include "pycore_weakref.h"

#include <stdbool.h>

#if SQLITE_VERSION_NUMBER >= 3025000
#define HAVE_WINDOW_FUNCTIONS
#endif

static const char *
get_isolation_level(const char *level)
{
    assert(level != NULL);
    static const char *const allowed_levels[] = {
        "",
        "DEFERRED",
        "IMMEDIATE",
        "EXCLUSIVE",
        NULL
    };
    for (int i = 0; allowed_levels[i] != NULL; i++) {
        const char *candidate = allowed_levels[i];
        if (sqlite3_stricmp(level, candidate) == 0) {
            return candidate;
        }
    }
    TyErr_SetString(TyExc_ValueError,
                    "isolation_level string must be '', 'DEFERRED', "
                    "'IMMEDIATE', or 'EXCLUSIVE'");
    return NULL;
}

static int
isolation_level_converter(TyObject *str_or_none, const char **result)
{
    if (Ty_IsNone(str_or_none)) {
        *result = NULL;
    }
    else if (TyUnicode_Check(str_or_none)) {
        const char *str = _TyUnicode_AsUTF8NoNUL(str_or_none);
        if (str == NULL) {
            return 0;
        }
        const char *level = get_isolation_level(str);
        if (level == NULL) {
            return 0;
        }
        *result = level;
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "isolation_level must be str or None");
        return 0;
    }
    return 1;
}

static int
autocommit_converter(TyObject *val, enum autocommit_mode *result)
{
    if (Ty_IsTrue(val)) {
        *result = AUTOCOMMIT_ENABLED;
        return 1;
    }
    if (Ty_IsFalse(val)) {
        *result = AUTOCOMMIT_DISABLED;
        return 1;
    }
    if (TyLong_Check(val) &&
        TyLong_AsLong(val) == LEGACY_TRANSACTION_CONTROL)
    {
        *result = AUTOCOMMIT_LEGACY;
        return 1;
    }

    TyErr_SetString(TyExc_ValueError,
        "autocommit must be True, False, or "
        "sqlite3.LEGACY_TRANSACTION_CONTROL");
    return 0;
}

static int
sqlite3_int64_converter(TyObject *obj, sqlite3_int64 *result)
{
    if (!TyLong_Check(obj)) {
        TyErr_SetString(TyExc_TypeError, "expected 'int'");
        return 0;
    }
    *result = _pysqlite_long_as_int64(obj);
    if (TyErr_Occurred()) {
        return 0;
    }
    return 1;
}

#define clinic_state() (pysqlite_get_state_by_type(Ty_TYPE(self)))
#include "clinic/connection.c.h"
#undef clinic_state

#define _pysqlite_Connection_CAST(op)   ((pysqlite_Connection *)(op))

/*[clinic input]
module _sqlite3
class _sqlite3.Connection "pysqlite_Connection *" "clinic_state()->ConnectionType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=67369db2faf80891]*/

static void _pysqlite_drop_unused_cursor_references(pysqlite_Connection* self);
static void free_callback_context(callback_context *ctx);
static void set_callback_context(callback_context **ctx_pp,
                                 callback_context *ctx);
static int connection_close(pysqlite_Connection *self);
TyObject *_pysqlite_query_execute(pysqlite_Cursor *, int, TyObject *, TyObject *);

static TyObject *
new_statement_cache(pysqlite_Connection *self, pysqlite_state *state,
                    int maxsize)
{
    TyObject *args[] = { NULL, TyLong_FromLong(maxsize), };
    if (args[1] == NULL) {
        return NULL;
    }
    TyObject *lru_cache = state->lru_cache;
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    TyObject *inner = PyObject_Vectorcall(lru_cache, args + 1, nargsf, NULL);
    Ty_DECREF(args[1]);
    if (inner == NULL) {
        return NULL;
    }

    args[1] = (TyObject *)self;  // Borrowed ref.
    nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    TyObject *res = PyObject_Vectorcall(inner, args + 1, nargsf, NULL);
    Ty_DECREF(inner);
    return res;
}

static inline int
connection_exec_stmt(pysqlite_Connection *self, const char *sql)
{
    int rc;
    Ty_BEGIN_ALLOW_THREADS
    int len = (int)strlen(sql) + 1;
    sqlite3_stmt *stmt;
    rc = sqlite3_prepare_v2(self->db, sql, len, &stmt, NULL);
    if (rc == SQLITE_OK) {
        (void)sqlite3_step(stmt);
        rc = sqlite3_finalize(stmt);
    }
    Ty_END_ALLOW_THREADS

    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return -1;
    }
    return 0;
}

/*[python input]
class IsolationLevel_converter(CConverter):
    type = "const char *"
    converter = "isolation_level_converter"

class Autocommit_converter(CConverter):
    type = "enum autocommit_mode"
    converter = "autocommit_converter"

class sqlite3_int64_converter(CConverter):
    type = "sqlite3_int64"
    converter = "sqlite3_int64_converter"

[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=dff8760fb1eba6a1]*/

/*[clinic input]
_sqlite3.Connection.__init__ as pysqlite_connection_init

    database: object
    * [from 3.15]
    timeout: double = 5.0
    detect_types: int = 0
    isolation_level: IsolationLevel = ""
    check_same_thread: bool = True
    factory: object(c_default='(TyObject*)clinic_state()->ConnectionType') = ConnectionType
    cached_statements as cache_size: int = 128
    uri: bool = False
    *
    autocommit: Autocommit(c_default='LEGACY_TRANSACTION_CONTROL') = sqlite3.LEGACY_TRANSACTION_CONTROL
[clinic start generated code]*/

static int
pysqlite_connection_init_impl(pysqlite_Connection *self, TyObject *database,
                              double timeout, int detect_types,
                              const char *isolation_level,
                              int check_same_thread, TyObject *factory,
                              int cache_size, int uri,
                              enum autocommit_mode autocommit)
/*[clinic end generated code: output=cba057313ea7712f input=219c3dbecbae7d99]*/
{
    if (TySys_Audit("sqlite3.connect", "O", database) < 0) {
        return -1;
    }

    TyObject *bytes;
    if (!TyUnicode_FSConverter(database, &bytes)) {
        return -1;
    }

    if (self->initialized) {
        self->initialized = 0;

        TyTypeObject *tp = Ty_TYPE(self);
        tp->tp_clear((TyObject *)self);
        if (connection_close(self) < 0) {
            return -1;
        }
    }

    // Create and configure SQLite database object.
    sqlite3 *db;
    int rc;
    Ty_BEGIN_ALLOW_THREADS
    rc = sqlite3_open_v2(TyBytes_AS_STRING(bytes), &db,
                         SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE |
                         (uri ? SQLITE_OPEN_URI : 0), NULL);
    if (rc == SQLITE_OK) {
        (void)sqlite3_busy_timeout(db, (int)(timeout*1000));
    }
    Ty_END_ALLOW_THREADS

    Ty_DECREF(bytes);
    if (db == NULL && rc == SQLITE_NOMEM) {
        TyErr_NoMemory();
        return -1;
    }

    pysqlite_state *state = pysqlite_get_state_by_type(Ty_TYPE(self));
    if (rc != SQLITE_OK) {
        set_error_from_db(state, db);
        goto error;
    }

    // Create LRU statement cache; returns a new reference.
    TyObject *statement_cache = new_statement_cache(self, state, cache_size);
    if (statement_cache == NULL) {
        goto error;
    }

    /* Create lists of weak references to cursors and blobs */
    TyObject *cursors = TyList_New(0);
    if (cursors == NULL) {
        Ty_DECREF(statement_cache);
        goto error;
    }

    TyObject *blobs = TyList_New(0);
    if (blobs == NULL) {
        Ty_DECREF(statement_cache);
        Ty_DECREF(cursors);
        goto error;
    }

    // Init connection state members.
    self->db = db;
    self->state = state;
    self->detect_types = detect_types;
    self->isolation_level = isolation_level;
    self->autocommit = autocommit;
    self->check_same_thread = check_same_thread;
    self->thread_ident = TyThread_get_thread_ident();
    self->statement_cache = statement_cache;
    self->cursors = cursors;
    self->blobs = blobs;
    self->created_cursors = 0;
    self->row_factory = Ty_NewRef(Ty_None);
    self->text_factory = Ty_NewRef(&TyUnicode_Type);
    self->trace_ctx = NULL;
    self->progress_ctx = NULL;
    self->authorizer_ctx = NULL;

    // Borrowed refs
    self->Warning               = state->Warning;
    self->Error                 = state->Error;
    self->InterfaceError        = state->InterfaceError;
    self->DatabaseError         = state->DatabaseError;
    self->DataError             = state->DataError;
    self->OperationalError      = state->OperationalError;
    self->IntegrityError        = state->IntegrityError;
    self->InternalError         = state->InternalError;
    self->ProgrammingError      = state->ProgrammingError;
    self->NotSupportedError     = state->NotSupportedError;

    if (TySys_Audit("sqlite3.connect/handle", "O", self) < 0) {
        return -1;  // Don't goto error; at this point, dealloc will clean up.
    }

    self->initialized = 1;

    if (autocommit == AUTOCOMMIT_DISABLED) {
        if (connection_exec_stmt(self, "BEGIN") < 0) {
            return -1;
        }
    }
    return 0;

error:
    // There are no statements or other SQLite objects attached to the
    // database, so sqlite3_close() should always return SQLITE_OK.
    rc = sqlite3_close(db);
    assert(rc == SQLITE_OK);
    return -1;
}

/*[clinic input]
# Create a new destination 'connect' for the docstring and methoddef only.
# This makes it possible to keep the signatures for Connection.__init__ and
# sqlite3.connect() synchronised.
output push
destination connect new file '{dirname}/clinic/_sqlite3.connect.c.h'

# Only output the docstring and the TyMethodDef entry.
output everything suppress
output docstring_definition connect
output methoddef_define connect

# Define the sqlite3.connect function by cloning Connection.__init__.
_sqlite3.connect as pysqlite_connect = _sqlite3.Connection.__init__

Open a connection to the SQLite database file 'database'.

You can use ":memory:" to open a database connection to a database that
resides in RAM instead of on disk.
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=92260edff95d1720]*/

/*[clinic input]
# Restore normal Argument Clinic operation for the rest of this file.
output pop
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b899ba9273edcce7]*/

#define VISIT_CALLBACK_CONTEXT(ctx) \
do {                                \
    if (ctx) {                      \
        Ty_VISIT(ctx->callable);    \
        Ty_VISIT(ctx->module);      \
    }                               \
} while (0)

static int
connection_traverse(TyObject *op, visitproc visit, void *arg)
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->statement_cache);
    Ty_VISIT(self->cursors);
    Ty_VISIT(self->blobs);
    Ty_VISIT(self->row_factory);
    Ty_VISIT(self->text_factory);
    VISIT_CALLBACK_CONTEXT(self->trace_ctx);
    VISIT_CALLBACK_CONTEXT(self->progress_ctx);
    VISIT_CALLBACK_CONTEXT(self->authorizer_ctx);
#undef VISIT_CALLBACK_CONTEXT
    return 0;
}

static inline void
clear_callback_context(callback_context *ctx)
{
    if (ctx != NULL) {
        Ty_CLEAR(ctx->callable);
        Ty_CLEAR(ctx->module);
    }
}

static int
connection_clear(TyObject *op)
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    Ty_CLEAR(self->statement_cache);
    Ty_CLEAR(self->cursors);
    Ty_CLEAR(self->blobs);
    Ty_CLEAR(self->row_factory);
    Ty_CLEAR(self->text_factory);
    clear_callback_context(self->trace_ctx);
    clear_callback_context(self->progress_ctx);
    clear_callback_context(self->authorizer_ctx);
    return 0;
}

static void
free_callback_contexts(pysqlite_Connection *self)
{
    set_callback_context(&self->trace_ctx, NULL);
    set_callback_context(&self->progress_ctx, NULL);
    set_callback_context(&self->authorizer_ctx, NULL);
}

static void
remove_callbacks(sqlite3 *db)
{
    /* None of these APIs can fail, as long as they are given a valid
     * database pointer. */
    assert(db != NULL);
    int rc = sqlite3_trace_v2(db, SQLITE_TRACE_STMT, 0, 0);
    assert(rc == SQLITE_OK), (void)rc;

    sqlite3_progress_handler(db, 0, 0, (void *)0);

    rc = sqlite3_set_authorizer(db, NULL, NULL);
    assert(rc == SQLITE_OK), (void)rc;
}

static int
connection_close(pysqlite_Connection *self)
{
    if (self->db == NULL) {
        return 0;
    }

    int rc = 0;
    if (self->autocommit == AUTOCOMMIT_DISABLED &&
        !sqlite3_get_autocommit(self->db))
    {
        if (connection_exec_stmt(self, "ROLLBACK") < 0) {
            rc = -1;
        }
    }

    sqlite3 *db = self->db;
    self->db = NULL;

    Ty_BEGIN_ALLOW_THREADS
    /* The v2 close call always returns SQLITE_OK if given a valid database
     * pointer (which we do), so we can safely ignore the return value */
    (void)sqlite3_close_v2(db);
    Ty_END_ALLOW_THREADS

    free_callback_contexts(self);
    return rc;
}

static void
connection_finalize(TyObject *self)
{
    pysqlite_Connection *con = (pysqlite_Connection *)self;
    TyObject *exc = TyErr_GetRaisedException();

    /* If close is implicitly called as a result of interpreter
     * tear-down, we must not call back into Python. */
    TyInterpreterState *interp = TyInterpreterState_Get();
    int teardown = _Ty_IsInterpreterFinalizing(interp);
    if (teardown && con->db) {
        remove_callbacks(con->db);
    }

    /* Clean up if user has not called .close() explicitly. */
    if (con->db) {
        if (TyErr_ResourceWarning(self, 1, "unclosed database in %R", self)) {
            /* Spurious errors can appear at shutdown */
            if (TyErr_ExceptionMatches(TyExc_Warning)) {
                TyErr_FormatUnraisable("Exception ignored while finalizing "
                                       "database connection %R", self);
            }
        }
    }
    if (connection_close(con) < 0) {
        if (teardown) {
            TyErr_Clear();
        }
        else {
            TyErr_FormatUnraisable("Exception ignored while closing database %R",
                                   self);
        }
    }

    TyErr_SetRaisedException(exc);
}

static void
connection_dealloc(TyObject *self)
{
    if (PyObject_CallFinalizerFromDealloc(self) < 0) {
        return;
    }
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)tp->tp_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

/*[clinic input]
_sqlite3.Connection.cursor as pysqlite_connection_cursor

    factory: object = NULL

Return a cursor for the connection.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_cursor_impl(pysqlite_Connection *self, TyObject *factory)
/*[clinic end generated code: output=562432a9e6af2aa1 input=4127345aa091b650]*/
{
    TyObject* cursor;

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (factory == NULL) {
        factory = (TyObject *)self->state->CursorType;
    }

    cursor = PyObject_CallOneArg(factory, (TyObject *)self);
    if (cursor == NULL)
        return NULL;
    if (!PyObject_TypeCheck(cursor, self->state->CursorType)) {
        TyErr_Format(TyExc_TypeError,
                     "factory must return a cursor, not %.100s",
                     Ty_TYPE(cursor)->tp_name);
        Ty_DECREF(cursor);
        return NULL;
    }

    _pysqlite_drop_unused_cursor_references(self);

    if (cursor && self->row_factory != Ty_None) {
        Ty_INCREF(self->row_factory);
        Ty_XSETREF(((pysqlite_Cursor *)cursor)->row_factory, self->row_factory);
    }

    return cursor;
}

/*[clinic input]
_sqlite3.Connection.blobopen as blobopen

    table: str
        Table name.
    column as col: str
        Column name.
    row: sqlite3_int64
        Row index.
    /
    *
    readonly: bool = False
        Open the BLOB without write permissions.
    name: str = "main"
        Database name.

Open and return a BLOB object.
[clinic start generated code]*/

static TyObject *
blobopen_impl(pysqlite_Connection *self, const char *table, const char *col,
              sqlite3_int64 row, int readonly, const char *name)
/*[clinic end generated code: output=6a02d43efb885d1c input=23576bd1108d8774]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    int rc;
    sqlite3_blob *blob;

    Ty_BEGIN_ALLOW_THREADS
    rc = sqlite3_blob_open(self->db, name, table, col, row, !readonly, &blob);
    Ty_END_ALLOW_THREADS

    if (rc == SQLITE_MISUSE) {
        set_error_from_code(self->state, rc);
        return NULL;
    }
    else if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return NULL;
    }

    pysqlite_Blob *obj = PyObject_GC_New(pysqlite_Blob, self->state->BlobType);
    if (obj == NULL) {
        goto error;
    }

    obj->connection = (pysqlite_Connection *)Ty_NewRef(self);
    obj->blob = blob;
    obj->offset = 0;
    obj->in_weakreflist = NULL;

    PyObject_GC_Track(obj);

    // Add our blob to connection blobs list
    TyObject *weakref = PyWeakref_NewRef((TyObject *)obj, NULL);
    if (weakref == NULL) {
        goto error;
    }
    rc = TyList_Append(self->blobs, weakref);
    Ty_DECREF(weakref);
    if (rc < 0) {
        goto error;
    }

    return (TyObject *)obj;

error:
    Ty_XDECREF(obj);
    return NULL;
}

/*[clinic input]
_sqlite3.Connection.close as pysqlite_connection_close

Close the database connection.

Any pending transaction is not committed implicitly.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_close_impl(pysqlite_Connection *self)
/*[clinic end generated code: output=a546a0da212c9b97 input=b3ed5b74f6fefc06]*/
{
    if (!pysqlite_check_thread(self)) {
        return NULL;
    }

    if (!self->initialized) {
        TyTypeObject *tp = Ty_TYPE(self);
        pysqlite_state *state = pysqlite_get_state_by_type(tp);
        TyErr_SetString(state->ProgrammingError,
                        "Base Connection.__init__ not called.");
        return NULL;
    }

    pysqlite_close_all_blobs(self);
    Ty_CLEAR(self->statement_cache);
    if (connection_close(self) < 0) {
        return NULL;
    }

    Py_RETURN_NONE;
}

/*
 * Checks if a connection object is usable (i. e. not closed).
 *
 * 0 => error; 1 => ok
 */
int pysqlite_check_connection(pysqlite_Connection* con)
{
    if (!con->initialized) {
        pysqlite_state *state = pysqlite_get_state_by_type(Ty_TYPE(con));
        TyErr_SetString(state->ProgrammingError,
                        "Base Connection.__init__ not called.");
        return 0;
    }

    if (!con->db) {
        TyErr_SetString(con->state->ProgrammingError,
                        "Cannot operate on a closed database.");
        return 0;
    } else {
        return 1;
    }
}

/*[clinic input]
_sqlite3.Connection.commit as pysqlite_connection_commit

Commit any pending transaction to the database.

If there is no open transaction, this method is a no-op.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_commit_impl(pysqlite_Connection *self)
/*[clinic end generated code: output=3da45579e89407f2 input=c8793c97c3446065]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (self->autocommit == AUTOCOMMIT_LEGACY) {
        if (!sqlite3_get_autocommit(self->db)) {
            if (connection_exec_stmt(self, "COMMIT") < 0) {
                return NULL;
            }
        }
    }
    else if (self->autocommit == AUTOCOMMIT_DISABLED) {
        if (connection_exec_stmt(self, "COMMIT") < 0) {
            return NULL;
        }
        if (connection_exec_stmt(self, "BEGIN") < 0) {
            return NULL;
        }
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Connection.rollback as pysqlite_connection_rollback

Roll back to the start of any pending transaction.

If there is no open transaction, this method is a no-op.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_rollback_impl(pysqlite_Connection *self)
/*[clinic end generated code: output=b66fa0d43e7ef305 input=7f60a2f1076f16b3]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (self->autocommit == AUTOCOMMIT_LEGACY) {
        if (!sqlite3_get_autocommit(self->db)) {
            if (connection_exec_stmt(self, "ROLLBACK") < 0) {
                return NULL;
            }
        }
    }
    else if (self->autocommit == AUTOCOMMIT_DISABLED) {
        if (connection_exec_stmt(self, "ROLLBACK") < 0) {
            return NULL;
        }
        if (connection_exec_stmt(self, "BEGIN") < 0) {
            return NULL;
        }
    }
    Py_RETURN_NONE;
}

static int
_pysqlite_set_result(sqlite3_context* context, TyObject* py_val)
{
    if (py_val == Ty_None) {
        sqlite3_result_null(context);
    } else if (TyLong_Check(py_val)) {
        sqlite_int64 value = _pysqlite_long_as_int64(py_val);
        if (value == -1 && TyErr_Occurred())
            return -1;
        sqlite3_result_int64(context, value);
    } else if (TyFloat_Check(py_val)) {
        double value = TyFloat_AsDouble(py_val);
        if (value == -1 && TyErr_Occurred()) {
            return -1;
        }
        sqlite3_result_double(context, value);
    } else if (TyUnicode_Check(py_val)) {
        Ty_ssize_t sz;
        const char *str = TyUnicode_AsUTF8AndSize(py_val, &sz);
        if (str == NULL) {
            return -1;
        }
        if (sz > INT_MAX) {
            TyErr_SetString(TyExc_OverflowError,
                            "string is longer than INT_MAX bytes");
            return -1;
        }
        sqlite3_result_text(context, str, (int)sz, SQLITE_TRANSIENT);
    } else if (PyObject_CheckBuffer(py_val)) {
        Ty_buffer view;
        if (PyObject_GetBuffer(py_val, &view, PyBUF_SIMPLE) != 0) {
            return -1;
        }
        if (view.len > INT_MAX) {
            TyErr_SetString(TyExc_OverflowError,
                            "BLOB longer than INT_MAX bytes");
            PyBuffer_Release(&view);
            return -1;
        }
        sqlite3_result_blob(context, view.buf, (int)view.len, SQLITE_TRANSIENT);
        PyBuffer_Release(&view);
    } else {
        callback_context *ctx = (callback_context *)sqlite3_user_data(context);
        TyErr_Format(ctx->state->ProgrammingError,
                     "User-defined functions cannot return '%s' values to "
                     "SQLite",
                     Ty_TYPE(py_val)->tp_name);
        return -1;
    }
    return 0;
}

static TyObject *
_pysqlite_build_py_params(sqlite3_context *context, int argc,
                          sqlite3_value **argv)
{
    TyObject* args;
    int i;
    sqlite3_value* cur_value;
    TyObject* cur_py_value;

    args = TyTuple_New(argc);
    if (!args) {
        return NULL;
    }

    for (i = 0; i < argc; i++) {
        cur_value = argv[i];
        switch (sqlite3_value_type(argv[i])) {
            case SQLITE_INTEGER:
                cur_py_value = TyLong_FromLongLong(sqlite3_value_int64(cur_value));
                break;
            case SQLITE_FLOAT:
                cur_py_value = TyFloat_FromDouble(sqlite3_value_double(cur_value));
                break;
            case SQLITE_TEXT: {
                sqlite3 *db = sqlite3_context_db_handle(context);
                const char *text = (const char *)sqlite3_value_text(cur_value);

                if (text == NULL && sqlite3_errcode(db) == SQLITE_NOMEM) {
                    TyErr_NoMemory();
                    goto error;
                }

                Ty_ssize_t size = sqlite3_value_bytes(cur_value);
                cur_py_value = TyUnicode_FromStringAndSize(text, size);
                break;
            }
            case SQLITE_BLOB: {
                sqlite3 *db = sqlite3_context_db_handle(context);
                const void *blob = sqlite3_value_blob(cur_value);

                if (blob == NULL && sqlite3_errcode(db) == SQLITE_NOMEM) {
                    TyErr_NoMemory();
                    goto error;
                }

                Ty_ssize_t size = sqlite3_value_bytes(cur_value);
                cur_py_value = TyBytes_FromStringAndSize(blob, size);
                break;
            }
            case SQLITE_NULL:
            default:
                cur_py_value = Ty_NewRef(Ty_None);
        }

        if (!cur_py_value) {
            goto error;
        }

        TyTuple_SET_ITEM(args, i, cur_py_value);
    }

    return args;

error:
    Ty_DECREF(args);
    return NULL;
}

static void
print_or_clear_traceback(callback_context *ctx)
{
    assert(ctx != NULL);
    assert(ctx->state != NULL);
    if (ctx->state->enable_callback_tracebacks) {
        TyErr_FormatUnraisable("Exception ignored on sqlite3 callback %R",
                               ctx->callable);
    }
    else {
        TyErr_Clear();
    }
}

// Checks the Python exception and sets the appropriate SQLite error code.
static void
set_sqlite_error(sqlite3_context *context, const char *msg)
{
    assert(TyErr_Occurred());
    if (TyErr_ExceptionMatches(TyExc_MemoryError)) {
        sqlite3_result_error_nomem(context);
    }
    else if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
        sqlite3_result_error_toobig(context);
    }
    else {
        sqlite3_result_error(context, msg, -1);
    }
    callback_context *ctx = (callback_context *)sqlite3_user_data(context);
    print_or_clear_traceback(ctx);
}

static void
func_callback(sqlite3_context *context, int argc, sqlite3_value **argv)
{
    TyGILState_STATE threadstate = TyGILState_Ensure();

    TyObject* args;
    TyObject* py_retval = NULL;
    int ok;

    args = _pysqlite_build_py_params(context, argc, argv);
    if (args) {
        callback_context *ctx = (callback_context *)sqlite3_user_data(context);
        assert(ctx != NULL);
        py_retval = PyObject_CallObject(ctx->callable, args);
        Ty_DECREF(args);
    }

    ok = 0;
    if (py_retval) {
        ok = _pysqlite_set_result(context, py_retval) == 0;
        Ty_DECREF(py_retval);
    }
    if (!ok) {
        set_sqlite_error(context, "user-defined function raised exception");
    }

    TyGILState_Release(threadstate);
}

static void
step_callback(sqlite3_context *context, int argc, sqlite3_value **params)
{
    TyGILState_STATE threadstate = TyGILState_Ensure();

    TyObject* args;
    TyObject* function_result = NULL;
    TyObject** aggregate_instance;
    TyObject* stepmethod = NULL;

    callback_context *ctx = (callback_context *)sqlite3_user_data(context);
    assert(ctx != NULL);

    aggregate_instance = (TyObject**)sqlite3_aggregate_context(context, sizeof(TyObject*));
    if (aggregate_instance == NULL) {
        (void)TyErr_NoMemory();
        set_sqlite_error(context, "unable to allocate SQLite aggregate context");
        goto error;
    }
    if (*aggregate_instance == NULL) {
        *aggregate_instance = PyObject_CallNoArgs(ctx->callable);
        if (!*aggregate_instance) {
            set_sqlite_error(context,
                    "user-defined aggregate's '__init__' method raised error");
            goto error;
        }
    }

    stepmethod = PyObject_GetAttr(*aggregate_instance, ctx->state->str_step);
    if (!stepmethod) {
        set_sqlite_error(context,
                "user-defined aggregate's 'step' method not defined");
        goto error;
    }

    args = _pysqlite_build_py_params(context, argc, params);
    if (!args) {
        goto error;
    }

    function_result = PyObject_CallObject(stepmethod, args);
    Ty_DECREF(args);

    if (!function_result) {
        set_sqlite_error(context,
                "user-defined aggregate's 'step' method raised error");
    }

error:
    Ty_XDECREF(stepmethod);
    Ty_XDECREF(function_result);

    TyGILState_Release(threadstate);
}

static void
final_callback(sqlite3_context *context)
{
    TyGILState_STATE threadstate = TyGILState_Ensure();

    TyObject* function_result;
    TyObject** aggregate_instance;
    int ok;

    aggregate_instance = (TyObject**)sqlite3_aggregate_context(context, 0);
    if (aggregate_instance == NULL) {
        /* No rows matched the query; the step handler was never called. */
        goto error;
    }
    else if (!*aggregate_instance) {
        /* this branch is executed if there was an exception in the aggregate's
         * __init__ */

        goto error;
    }

    // Keep the exception (if any) of the last call to step, value, or inverse
    TyObject *exc = TyErr_GetRaisedException();

    callback_context *ctx = (callback_context *)sqlite3_user_data(context);
    assert(ctx != NULL);
    function_result = PyObject_CallMethodNoArgs(*aggregate_instance,
                                                ctx->state->str_finalize);
    Ty_DECREF(*aggregate_instance);

    ok = 0;
    if (function_result) {
        ok = _pysqlite_set_result(context, function_result) == 0;
        Ty_DECREF(function_result);
    }
    if (!ok) {
        int attr_err = TyErr_ExceptionMatches(TyExc_AttributeError);
        _TyErr_ChainExceptions1(exc);

        /* Note: contrary to the step, value, and inverse callbacks, SQLite
         * does _not_, as of SQLite 3.38.0, propagate errors to sqlite3_step()
         * from the finalize callback. This implies that execute*() will not
         * raise OperationalError, as it normally would. */
        set_sqlite_error(context, attr_err
                ? "user-defined aggregate's 'finalize' method not defined"
                : "user-defined aggregate's 'finalize' method raised error");
    }
    else {
        TyErr_SetRaisedException(exc);
    }

error:
    TyGILState_Release(threadstate);
}

static void _pysqlite_drop_unused_cursor_references(pysqlite_Connection* self)
{
    /* we only need to do this once in a while */
    if (self->created_cursors++ < 200) {
        return;
    }

    self->created_cursors = 0;

    TyObject* new_list = TyList_New(0);
    if (!new_list) {
        return;
    }

    for (Ty_ssize_t i = 0; i < TyList_Size(self->cursors); i++) {
        TyObject* weakref = TyList_GetItem(self->cursors, i);
        if (_TyWeakref_IsDead(weakref)) {
            continue;
        }
        if (TyList_Append(new_list, weakref) != 0) {
            Ty_DECREF(new_list);
            return;
        }
    }

    Ty_SETREF(self->cursors, new_list);
}

/* Allocate a UDF/callback context structure. In order to ensure that the state
 * pointer always outlives the callback context, we make sure it owns a
 * reference to the module itself. create_callback_context() is always called
 * from connection methods, so we use the defining class to fetch the module
 * pointer.
 */
static callback_context *
create_callback_context(TyTypeObject *cls, TyObject *callable)
{
    callback_context *ctx = TyMem_Malloc(sizeof(callback_context));
    if (ctx != NULL) {
        TyObject *module = TyType_GetModule(cls);
        ctx->callable = Ty_NewRef(callable);
        ctx->module = Ty_NewRef(module);
        ctx->state = pysqlite_get_state(module);
    }
    return ctx;
}

static void
free_callback_context(callback_context *ctx)
{
    assert(ctx != NULL);
    Ty_XDECREF(ctx->callable);
    Ty_XDECREF(ctx->module);
    TyMem_Free(ctx);
}

static void
set_callback_context(callback_context **ctx_pp, callback_context *ctx)
{
    assert(ctx_pp != NULL);
    callback_context *tmp = *ctx_pp;
    *ctx_pp = ctx;
    if (tmp != NULL) {
        free_callback_context(tmp);
    }
}

static void
destructor_callback(void *ctx)
{
    if (ctx != NULL) {
        // This function may be called without the GIL held, so we need to
        // ensure that we destroy 'ctx' with the GIL held.
        TyGILState_STATE gstate = TyGILState_Ensure();
        free_callback_context((callback_context *)ctx);
        TyGILState_Release(gstate);
    }
}

static int
check_num_params(pysqlite_Connection *self, const int n, const char *name)
{
    int limit = sqlite3_limit(self->db, SQLITE_LIMIT_FUNCTION_ARG, -1);
    assert(limit >= 0);
    if (n < -1 || n > limit) {
        TyErr_Format(self->ProgrammingError,
                     "'%s' must be between -1 and %d, not %d",
                     name, limit, n);
        return -1;
    }
    return 0;
}

/*[clinic input]
_sqlite3.Connection.create_function as pysqlite_connection_create_function

    cls: defining_class
    /
    name: str
    narg: int
    func: object
    / [from 3.15]
    *
    deterministic: bool = False

Creates a new function.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_create_function_impl(pysqlite_Connection *self,
                                         TyTypeObject *cls, const char *name,
                                         int narg, TyObject *func,
                                         int deterministic)
/*[clinic end generated code: output=8a811529287ad240 input=c7c313b0ca8b519e]*/
{
    int rc;
    int flags = SQLITE_UTF8;

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }
    if (check_num_params(self, narg, "narg") < 0) {
        return NULL;
    }

    if (deterministic) {
        flags |= SQLITE_DETERMINISTIC;
    }
    callback_context *ctx = create_callback_context(cls, func);
    if (ctx == NULL) {
        return NULL;
    }
    rc = sqlite3_create_function_v2(self->db, name, narg, flags, ctx,
                                    func_callback,
                                    NULL,
                                    NULL,
                                    &destructor_callback);  // will decref func

    if (rc != SQLITE_OK) {
        /* Workaround for SQLite bug: no error code or string is available here */
        TyErr_SetString(self->OperationalError, "Error creating function");
        return NULL;
    }
    Py_RETURN_NONE;
}

#ifdef HAVE_WINDOW_FUNCTIONS
/*
 * Regarding the 'inverse' aggregate callback:
 * This method is only required by window aggregate functions, not
 * ordinary aggregate function implementations.  It is invoked to remove
 * a row from the current window.  The function arguments, if any,
 * correspond to the row being removed.
 */
static void
inverse_callback(sqlite3_context *context, int argc, sqlite3_value **params)
{
    TyGILState_STATE gilstate = TyGILState_Ensure();

    callback_context *ctx = (callback_context *)sqlite3_user_data(context);
    assert(ctx != NULL);

    int size = sizeof(TyObject *);
    TyObject **cls = (TyObject **)sqlite3_aggregate_context(context, size);
    assert(cls != NULL);
    assert(*cls != NULL);

    TyObject *method = PyObject_GetAttr(*cls, ctx->state->str_inverse);
    if (method == NULL) {
        set_sqlite_error(context,
                "user-defined aggregate's 'inverse' method not defined");
        goto exit;
    }

    TyObject *args = _pysqlite_build_py_params(context, argc, params);
    if (args == NULL) {
        set_sqlite_error(context,
                "unable to build arguments for user-defined aggregate's "
                "'inverse' method");
        goto exit;
    }

    TyObject *res = PyObject_CallObject(method, args);
    Ty_DECREF(args);
    if (res == NULL) {
        set_sqlite_error(context,
                "user-defined aggregate's 'inverse' method raised error");
        goto exit;
    }
    Ty_DECREF(res);

exit:
    Ty_XDECREF(method);
    TyGILState_Release(gilstate);
}

/*
 * Regarding the 'value' aggregate callback:
 * This method is only required by window aggregate functions, not
 * ordinary aggregate function implementations.  It is invoked to return
 * the current value of the aggregate.
 */
static void
value_callback(sqlite3_context *context)
{
    TyGILState_STATE gilstate = TyGILState_Ensure();

    callback_context *ctx = (callback_context *)sqlite3_user_data(context);
    assert(ctx != NULL);

    int size = sizeof(TyObject *);
    TyObject **cls = (TyObject **)sqlite3_aggregate_context(context, size);
    assert(cls != NULL);
    assert(*cls != NULL);

    TyObject *res = PyObject_CallMethodNoArgs(*cls, ctx->state->str_value);
    if (res == NULL) {
        int attr_err = TyErr_ExceptionMatches(TyExc_AttributeError);
        set_sqlite_error(context, attr_err
                ? "user-defined aggregate's 'value' method not defined"
                : "user-defined aggregate's 'value' method raised error");
    }
    else {
        int rc = _pysqlite_set_result(context, res);
        Ty_DECREF(res);
        if (rc < 0) {
            set_sqlite_error(context,
                    "unable to set result from user-defined aggregate's "
                    "'value' method");
        }
    }

    TyGILState_Release(gilstate);
}

/*[clinic input]
_sqlite3.Connection.create_window_function as create_window_function

    cls: defining_class
    name: str
        The name of the SQL aggregate window function to be created or
        redefined.
    num_params: int
        The number of arguments the step and inverse methods takes.
    aggregate_class: object
        A class with step(), finalize(), value(), and inverse() methods.
        Set to None to clear the window function.
    /

Creates or redefines an aggregate window function. Non-standard.
[clinic start generated code]*/

static TyObject *
create_window_function_impl(pysqlite_Connection *self, TyTypeObject *cls,
                            const char *name, int num_params,
                            TyObject *aggregate_class)
/*[clinic end generated code: output=5332cd9464522235 input=46d57a54225b5228]*/
{
    if (sqlite3_libversion_number() < 3025000) {
        TyErr_SetString(self->NotSupportedError,
                        "create_window_function() requires "
                        "SQLite 3.25.0 or higher");
        return NULL;
    }
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }
    if (check_num_params(self, num_params, "num_params") < 0) {
        return NULL;
    }

    int flags = SQLITE_UTF8;
    int rc;
    if (Ty_IsNone(aggregate_class)) {
        rc = sqlite3_create_window_function(self->db, name, num_params, flags,
                                            0, 0, 0, 0, 0, 0);
    }
    else {
        callback_context *ctx = create_callback_context(cls, aggregate_class);
        if (ctx == NULL) {
            return NULL;
        }
        rc = sqlite3_create_window_function(self->db, name, num_params, flags,
                                            ctx,
                                            &step_callback,
                                            &final_callback,
                                            &value_callback,
                                            &inverse_callback,
                                            &destructor_callback);
    }

    if (rc != SQLITE_OK) {
        /* Errors are not set on the database connection; use result code
         * instead. */
        set_error_from_code(self->state, rc);
        return NULL;
    }
    Py_RETURN_NONE;
}
#endif

/*[clinic input]
_sqlite3.Connection.create_aggregate as pysqlite_connection_create_aggregate

    cls: defining_class
    /
    name: str
    n_arg: int
    aggregate_class: object
    / [from 3.15]

Creates a new aggregate.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_create_aggregate_impl(pysqlite_Connection *self,
                                          TyTypeObject *cls,
                                          const char *name, int n_arg,
                                          TyObject *aggregate_class)
/*[clinic end generated code: output=1b02d0f0aec7ff96 input=8087056db6eae1cf]*/
{
    int rc;

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }
    if (check_num_params(self, n_arg, "n_arg") < 0) {
        return NULL;
    }

    callback_context *ctx = create_callback_context(cls, aggregate_class);
    if (ctx == NULL) {
        return NULL;
    }
    rc = sqlite3_create_function_v2(self->db, name, n_arg, SQLITE_UTF8, ctx,
                                    0,
                                    &step_callback,
                                    &final_callback,
                                    &destructor_callback); // will decref func
    if (rc != SQLITE_OK) {
        /* Workaround for SQLite bug: no error code or string is available here */
        TyErr_SetString(self->OperationalError, "Error creating aggregate");
        return NULL;
    }
    Py_RETURN_NONE;
}

static int
authorizer_callback(void *ctx, int action, const char *arg1,
                    const char *arg2 , const char *dbname,
                    const char *access_attempt_source)
{
    TyGILState_STATE gilstate = TyGILState_Ensure();

    TyObject *ret;
    int rc = SQLITE_DENY;

    assert(ctx != NULL);
    TyObject *callable = ((callback_context *)ctx)->callable;
    ret = PyObject_CallFunction(callable, "issss", action, arg1, arg2, dbname,
                                access_attempt_source);

    if (ret == NULL) {
        print_or_clear_traceback(ctx);
        rc = SQLITE_DENY;
    }
    else {
        if (TyLong_Check(ret)) {
            rc = TyLong_AsInt(ret);
            if (rc == -1 && TyErr_Occurred()) {
                print_or_clear_traceback(ctx);
                rc = SQLITE_DENY;
            }
        }
        else {
            rc = SQLITE_DENY;
        }
        Ty_DECREF(ret);
    }

    TyGILState_Release(gilstate);
    return rc;
}

static int
progress_callback(void *ctx)
{
    TyGILState_STATE gilstate = TyGILState_Ensure();

    int rc;
    TyObject *ret;

    assert(ctx != NULL);
    TyObject *callable = ((callback_context *)ctx)->callable;
    ret = PyObject_CallNoArgs(callable);
    if (!ret) {
        /* abort query if error occurred */
        rc = -1;
    }
    else {
        rc = PyObject_IsTrue(ret);
        Ty_DECREF(ret);
    }
    if (rc < 0) {
        print_or_clear_traceback(ctx);
    }

    TyGILState_Release(gilstate);
    return rc;
}

/*
 * From https://sqlite.org/c3ref/trace_v2.html:
 * The integer return value from the callback is currently ignored, though this
 * may change in future releases. Callback implementations should return zero
 * to ensure future compatibility.
 */
static int
trace_callback(unsigned int type, void *ctx, void *stmt, void *sql)
{
    if (type != SQLITE_TRACE_STMT) {
        return 0;
    }

    TyGILState_STATE gilstate = TyGILState_Ensure();

    assert(ctx != NULL);
    pysqlite_state *state = ((callback_context *)ctx)->state;
    assert(state != NULL);

    TyObject *py_statement = NULL;
    const char *expanded_sql = sqlite3_expanded_sql((sqlite3_stmt *)stmt);
    if (expanded_sql == NULL) {
        sqlite3 *db = sqlite3_db_handle((sqlite3_stmt *)stmt);
        if (sqlite3_errcode(db) == SQLITE_NOMEM) {
            (void)TyErr_NoMemory();
            goto exit;
        }

        TyErr_SetString(state->DataError,
                "Expanded SQL string exceeds the maximum string length");
        print_or_clear_traceback((callback_context *)ctx);

        // Fall back to unexpanded sql
        py_statement = TyUnicode_FromString((const char *)sql);
    }
    else {
        py_statement = TyUnicode_FromString(expanded_sql);
        sqlite3_free((void *)expanded_sql);
    }
    if (py_statement) {
        TyObject *callable = ((callback_context *)ctx)->callable;
        TyObject *ret = PyObject_CallOneArg(callable, py_statement);
        Ty_DECREF(py_statement);
        Ty_XDECREF(ret);
    }
    if (TyErr_Occurred()) {
        print_or_clear_traceback((callback_context *)ctx);
    }

exit:
    TyGILState_Release(gilstate);
    return 0;
}

/*[clinic input]
_sqlite3.Connection.set_authorizer as pysqlite_connection_set_authorizer

    cls: defining_class
    authorizer_callback as callable: object
    / [from 3.15]

Set authorizer callback.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_set_authorizer_impl(pysqlite_Connection *self,
                                        TyTypeObject *cls,
                                        TyObject *callable)
/*[clinic end generated code: output=75fa60114fc971c3 input=a52bd4937c588752]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    int rc;
    if (callable == Ty_None) {
        rc = sqlite3_set_authorizer(self->db, NULL, NULL);
        set_callback_context(&self->authorizer_ctx, NULL);
    }
    else {
        callback_context *ctx = create_callback_context(cls, callable);
        if (ctx == NULL) {
            return NULL;
        }
        rc = sqlite3_set_authorizer(self->db, authorizer_callback, ctx);
        set_callback_context(&self->authorizer_ctx, ctx);
    }
    if (rc != SQLITE_OK) {
        TyErr_SetString(self->OperationalError,
                        "Error setting authorizer callback");
        set_callback_context(&self->authorizer_ctx, NULL);
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Connection.set_progress_handler as pysqlite_connection_set_progress_handler

    cls: defining_class
    progress_handler as callable: object
        A callable that takes no arguments.
        If the callable returns non-zero, the current query is terminated,
        and an exception is raised.
    / [from 3.15]
    n: int
        The number of SQLite virtual machine instructions that are
        executed between invocations of 'progress_handler'.

Set progress handler callback.

If 'progress_handler' is None or 'n' is 0, the progress handler is disabled.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_set_progress_handler_impl(pysqlite_Connection *self,
                                              TyTypeObject *cls,
                                              TyObject *callable, int n)
/*[clinic end generated code: output=0739957fd8034a50 input=b4d6e2ef8b4d32f9]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (callable == Ty_None) {
        /* None clears the progress handler previously set */
        sqlite3_progress_handler(self->db, 0, 0, (void*)0);
        set_callback_context(&self->progress_ctx, NULL);
    }
    else {
        callback_context *ctx = create_callback_context(cls, callable);
        if (ctx == NULL) {
            return NULL;
        }
        sqlite3_progress_handler(self->db, n, progress_callback, ctx);
        set_callback_context(&self->progress_ctx, ctx);
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Connection.set_trace_callback as pysqlite_connection_set_trace_callback

    cls: defining_class
    trace_callback as callable: object
    / [from 3.15]

Set a trace callback called for each SQL statement (passed as unicode).
[clinic start generated code]*/

static TyObject *
pysqlite_connection_set_trace_callback_impl(pysqlite_Connection *self,
                                            TyTypeObject *cls,
                                            TyObject *callable)
/*[clinic end generated code: output=d91048c03bfcee05 input=d705d592ec03cf28]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (callable == Ty_None) {
        /*
         * None clears the trace callback previously set
         *
         * Ref.
         * - https://sqlite.org/c3ref/c_trace.html
         * - https://sqlite.org/c3ref/trace_v2.html
         */
        sqlite3_trace_v2(self->db, SQLITE_TRACE_STMT, 0, 0);
        set_callback_context(&self->trace_ctx, NULL);
    }
    else {
        callback_context *ctx = create_callback_context(cls, callable);
        if (ctx == NULL) {
            return NULL;
        }
        sqlite3_trace_v2(self->db, SQLITE_TRACE_STMT, trace_callback, ctx);
        set_callback_context(&self->trace_ctx, ctx);
    }

    Py_RETURN_NONE;
}

#ifdef PY_SQLITE_ENABLE_LOAD_EXTENSION
/*[clinic input]
_sqlite3.Connection.enable_load_extension as pysqlite_connection_enable_load_extension

    enable as onoff: bool
    /

Enable dynamic loading of SQLite extension modules.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_enable_load_extension_impl(pysqlite_Connection *self,
                                               int onoff)
/*[clinic end generated code: output=9cac37190d388baf input=2a1e87931486380f]*/
{
    int rc;

    if (TySys_Audit("sqlite3.enable_load_extension",
                    "OO", self, onoff ? Ty_True : Ty_False) < 0) {
        return NULL;
    }

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    rc = sqlite3_enable_load_extension(self->db, onoff);

    if (rc != SQLITE_OK) {
        TyErr_SetString(self->OperationalError,
                        "Error enabling load extension");
        return NULL;
    } else {
        Py_RETURN_NONE;
    }
}

/*[clinic input]
_sqlite3.Connection.load_extension as pysqlite_connection_load_extension

    name as extension_name: str
    /
    *
    entrypoint: str(accept={str, NoneType}) = None

Load SQLite extension module.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_load_extension_impl(pysqlite_Connection *self,
                                        const char *extension_name,
                                        const char *entrypoint)
/*[clinic end generated code: output=7e61a7add9de0286 input=c36b14ea702e04f5]*/
{
    int rc;
    char* errmsg;

    if (TySys_Audit("sqlite3.load_extension", "Os", self, extension_name) < 0) {
        return NULL;
    }

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    rc = sqlite3_load_extension(self->db, extension_name, entrypoint, &errmsg);
    if (rc != 0) {
        TyErr_SetString(self->OperationalError, errmsg);
        return NULL;
    } else {
        Py_RETURN_NONE;
    }
}
#endif

int pysqlite_check_thread(pysqlite_Connection* self)
{
    if (self->check_same_thread) {
        if (TyThread_get_thread_ident() != self->thread_ident) {
            TyErr_Format(self->ProgrammingError,
                        "SQLite objects created in a thread can only be used in that same thread. "
                        "The object was created in thread id %lu and this is thread id %lu.",
                        self->thread_ident, TyThread_get_thread_ident());
            return 0;
        }

    }
    return 1;
}

static TyObject *
pysqlite_connection_get_isolation_level(TyObject *op, void *Py_UNUSED(closure))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (!pysqlite_check_connection(self)) {
        return NULL;
    }
    if (self->isolation_level != NULL) {
        return TyUnicode_FromString(self->isolation_level);
    }
    Py_RETURN_NONE;
}

static TyObject *
pysqlite_connection_get_total_changes(TyObject *op, void *Py_UNUSED(closure))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (!pysqlite_check_connection(self)) {
        return NULL;
    }
    return TyLong_FromLong(sqlite3_total_changes(self->db));
}

static TyObject *
pysqlite_connection_get_in_transaction(TyObject *op, void *Py_UNUSED(closure))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (!pysqlite_check_connection(self)) {
        return NULL;
    }
    if (!sqlite3_get_autocommit(self->db)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static int
pysqlite_connection_set_isolation_level(TyObject *op,
                                        TyObject *isolation_level,
                                        void *Py_UNUSED(ignored))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (isolation_level == NULL) {
        TyErr_SetString(TyExc_AttributeError, "cannot delete attribute");
        return -1;
    }
    if (Ty_IsNone(isolation_level)) {
        self->isolation_level = NULL;

        // Execute a COMMIT to re-enable autocommit mode
        TyObject *res = pysqlite_connection_commit_impl(self);
        if (res == NULL) {
            return -1;
        }
        Ty_DECREF(res);
        return 0;
    }
    if (!isolation_level_converter(isolation_level, &self->isolation_level)) {
        return -1;
    }
    return 0;
}

static TyObject *
pysqlite_connection_call(TyObject *op, TyObject *args, TyObject *kwargs)
{
    TyObject* sql;
    pysqlite_Statement* statement;
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (!_TyArg_NoKeywords(MODULE_NAME ".Connection", kwargs))
        return NULL;

    if (!TyArg_ParseTuple(args, "U", &sql))
        return NULL;

    statement = pysqlite_statement_create(self, sql);
    if (statement == NULL) {
        return NULL;
    }

    return (TyObject*)statement;
}

/*[clinic input]
_sqlite3.Connection.execute as pysqlite_connection_execute

    sql: unicode
    parameters: object = NULL
    /

Executes an SQL statement.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_execute_impl(pysqlite_Connection *self, TyObject *sql,
                                 TyObject *parameters)
/*[clinic end generated code: output=5be05ae01ee17ee4 input=27aa7792681ddba2]*/
{
    TyObject* result = 0;

    TyObject *cursor = pysqlite_connection_cursor_impl(self, NULL);
    if (!cursor) {
        goto error;
    }

    result = _pysqlite_query_execute((pysqlite_Cursor *)cursor, 0, sql, parameters);
    if (!result) {
        Ty_CLEAR(cursor);
    }

error:
    Ty_XDECREF(result);

    return cursor;
}

/*[clinic input]
_sqlite3.Connection.executemany as pysqlite_connection_executemany

    sql: unicode
    parameters: object
    /

Repeatedly executes an SQL statement.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_executemany_impl(pysqlite_Connection *self,
                                     TyObject *sql, TyObject *parameters)
/*[clinic end generated code: output=776cd2fd20bfe71f input=495be76551d525db]*/
{
    TyObject* result = 0;

    TyObject *cursor = pysqlite_connection_cursor_impl(self, NULL);
    if (!cursor) {
        goto error;
    }

    result = _pysqlite_query_execute((pysqlite_Cursor *)cursor, 1, sql, parameters);
    if (!result) {
        Ty_CLEAR(cursor);
    }

error:
    Ty_XDECREF(result);

    return cursor;
}

/*[clinic input]
_sqlite3.Connection.executescript as pysqlite_connection_executescript

    sql_script as script_obj: object
    /

Executes multiple SQL statements at once.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_executescript_impl(pysqlite_Connection *self,
                                       TyObject *script_obj)
/*[clinic end generated code: output=e921c49e2291782c input=f6e5f1ccfa313db4]*/
{
    TyObject* result = 0;

    TyObject *cursor = pysqlite_connection_cursor_impl(self, NULL);
    if (!cursor) {
        goto error;
    }

    TyObject *meth = self->state->str_executescript;  // borrowed ref.
    result = PyObject_CallMethodObjArgs(cursor, meth, script_obj, NULL);
    if (!result) {
        Ty_CLEAR(cursor);
    }

error:
    Ty_XDECREF(result);

    return cursor;
}

/* ------------------------- COLLATION CODE ------------------------ */

static int
collation_callback(void *context, int text1_length, const void *text1_data,
                   int text2_length, const void *text2_data)
{
    TyGILState_STATE gilstate = TyGILState_Ensure();

    TyObject* string1 = 0;
    TyObject* string2 = 0;
    TyObject* retval = NULL;
    long longval;
    int result = 0;

    /* This callback may be executed multiple times per sqlite3_step(). Bail if
     * the previous call failed */
    if (TyErr_Occurred()) {
        goto finally;
    }

    string1 = TyUnicode_FromStringAndSize((const char*)text1_data, text1_length);
    if (string1 == NULL) {
        goto finally;
    }
    string2 = TyUnicode_FromStringAndSize((const char*)text2_data, text2_length);
    if (string2 == NULL) {
        goto finally;
    }

    callback_context *ctx = (callback_context *)context;
    assert(ctx != NULL);
    TyObject *args[] = { NULL, string1, string2 };  // Borrowed refs.
    size_t nargsf = 2 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    retval = PyObject_Vectorcall(ctx->callable, args + 1, nargsf, NULL);
    if (retval == NULL) {
        /* execution failed */
        goto finally;
    }

    longval = TyLong_AsLongAndOverflow(retval, &result);
    if (longval == -1 && TyErr_Occurred()) {
        TyErr_Clear();
        result = 0;
    }
    else if (!result) {
        if (longval > 0)
            result = 1;
        else if (longval < 0)
            result = -1;
    }

finally:
    Ty_XDECREF(string1);
    Ty_XDECREF(string2);
    Ty_XDECREF(retval);
    TyGILState_Release(gilstate);
    return result;
}

/*[clinic input]
_sqlite3.Connection.interrupt as pysqlite_connection_interrupt

Abort any pending database operation.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_interrupt_impl(pysqlite_Connection *self)
/*[clinic end generated code: output=f193204bc9e70b47 input=75ad03ade7012859]*/
{
    TyObject* retval = NULL;

    if (!pysqlite_check_connection(self)) {
        goto finally;
    }

    sqlite3_interrupt(self->db);

    retval = Ty_NewRef(Ty_None);

finally:
    return retval;
}

/* Function author: Paul Kippes <kippesp@gmail.com>
 * Class method of Connection to call the Python function _iterdump
 * of the sqlite3 module.
 */
/*[clinic input]
_sqlite3.Connection.iterdump as pysqlite_connection_iterdump

    *
    filter: object = None
        An optional LIKE pattern for database objects to dump

Returns iterator to the dump of the database in an SQL text format.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_iterdump_impl(pysqlite_Connection *self,
                                  TyObject *filter)
/*[clinic end generated code: output=fd81069c4bdeb6b0 input=4ae6d9a898f108df]*/
{
    if (!pysqlite_check_connection(self)) {
        return NULL;
    }

    TyObject *iterdump = TyImport_ImportModuleAttrString(MODULE_NAME ".dump", "_iterdump");
    if (!iterdump) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(self->OperationalError,
                            "Failed to obtain _iterdump() reference");
        }
        return NULL;
    }
    TyObject *args[3] = {NULL, (TyObject *)self, filter};
    TyObject *kwnames = Ty_BuildValue("(s)", "filter");
    if (!kwnames) {
        Ty_DECREF(iterdump);
        return NULL;
    }
    Ty_ssize_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    TyObject *retval = PyObject_Vectorcall(iterdump, args + 1, nargsf, kwnames);
    Ty_DECREF(iterdump);
    Ty_DECREF(kwnames);
    return retval;
}

/*[clinic input]
_sqlite3.Connection.backup as pysqlite_connection_backup

    target: object(type='pysqlite_Connection *', subclass_of='clinic_state()->ConnectionType')
    *
    pages: int = -1
    progress: object = None
    name: str = "main"
    sleep: double = 0.250

Makes a backup of the database.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_backup_impl(pysqlite_Connection *self,
                                pysqlite_Connection *target, int pages,
                                TyObject *progress, const char *name,
                                double sleep)
/*[clinic end generated code: output=306a3e6a38c36334 input=c6519d0f59d0fd7f]*/
{
    int rc;
    int sleep_ms = (int)(sleep * 1000.0);
    sqlite3 *bck_conn;
    sqlite3_backup *bck_handle;

    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    if (!pysqlite_check_connection(target)) {
        return NULL;
    }

    if (target == self) {
        TyErr_SetString(TyExc_ValueError, "target cannot be the same connection instance");
        return NULL;
    }

    if (progress != Ty_None && !PyCallable_Check(progress)) {
        TyErr_SetString(TyExc_TypeError, "progress argument must be a callable");
        return NULL;
    }

    if (pages == 0) {
        pages = -1;
    }

    bck_conn = target->db;

    Ty_BEGIN_ALLOW_THREADS
    bck_handle = sqlite3_backup_init(bck_conn, "main", self->db, name);
    Ty_END_ALLOW_THREADS

    if (bck_handle == NULL) {
        set_error_from_db(self->state, bck_conn);
        return NULL;
    }

    do {
        Ty_BEGIN_ALLOW_THREADS
        rc = sqlite3_backup_step(bck_handle, pages);
        Ty_END_ALLOW_THREADS

        if (progress != Ty_None) {
            int remaining = sqlite3_backup_remaining(bck_handle);
            int pagecount = sqlite3_backup_pagecount(bck_handle);
            TyObject *res = PyObject_CallFunction(progress, "iii", rc,
                                                  remaining, pagecount);
            if (res == NULL) {
                /* Callback failed: abort backup and bail. */
                Ty_BEGIN_ALLOW_THREADS
                sqlite3_backup_finish(bck_handle);
                Ty_END_ALLOW_THREADS
                return NULL;
            }
            Ty_DECREF(res);
        }

        /* Sleep for a while if there are still further pages to copy and
           the engine could not make any progress */
        if (rc == SQLITE_BUSY || rc == SQLITE_LOCKED) {
            Ty_BEGIN_ALLOW_THREADS
            sqlite3_sleep(sleep_ms);
            Ty_END_ALLOW_THREADS
        }
    } while (rc == SQLITE_OK || rc == SQLITE_BUSY || rc == SQLITE_LOCKED);

    Ty_BEGIN_ALLOW_THREADS
    rc = sqlite3_backup_finish(bck_handle);
    Ty_END_ALLOW_THREADS

    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, bck_conn);
        return NULL;
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Connection.create_collation as pysqlite_connection_create_collation

    cls: defining_class
    name: str
    callback as callable: object
    /

Creates a collation function.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_create_collation_impl(pysqlite_Connection *self,
                                          TyTypeObject *cls,
                                          const char *name,
                                          TyObject *callable)
/*[clinic end generated code: output=32d339e97869c378 input=f67ecd2e31e61ad3]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    callback_context *ctx = NULL;
    int rc;
    int flags = SQLITE_UTF8;
    if (callable == Ty_None) {
        rc = sqlite3_create_collation_v2(self->db, name, flags,
                                         NULL, NULL, NULL);
    }
    else {
        if (!PyCallable_Check(callable)) {
            TyErr_SetString(TyExc_TypeError, "parameter must be callable");
            return NULL;
        }
        ctx = create_callback_context(cls, callable);
        if (ctx == NULL) {
            return NULL;
        }
        rc = sqlite3_create_collation_v2(self->db, name, flags, ctx,
                                         &collation_callback,
                                         &destructor_callback);
    }

    if (rc != SQLITE_OK) {
        /* Unlike other sqlite3_* functions, the destructor callback is _not_
         * called if sqlite3_create_collation_v2() fails, so we have to free
         * the context before returning.
         */
        if (callable != Ty_None) {
            free_callback_context(ctx);
        }
        set_error_from_db(self->state, self->db);
        return NULL;
    }

    Py_RETURN_NONE;
}

#ifdef PY_SQLITE_HAVE_SERIALIZE
/*[clinic input]
_sqlite3.Connection.serialize as serialize

    *
    name: str = "main"
        Which database to serialize.

Serialize a database into a byte string.

For an ordinary on-disk database file, the serialization is just a copy of the
disk file. For an in-memory database or a "temp" database, the serialization is
the same sequence of bytes which would be written to disk if that database
were backed up to disk.
[clinic start generated code]*/

static TyObject *
serialize_impl(pysqlite_Connection *self, const char *name)
/*[clinic end generated code: output=97342b0e55239dd3 input=d2eb5194a65abe2b]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    /* If SQLite has a contiguous memory representation of the database, we can
     * avoid memory allocations, so we try with the no-copy flag first.
     */
    sqlite3_int64 size;
    unsigned int flags = SQLITE_SERIALIZE_NOCOPY;
    const char *data;

    Ty_BEGIN_ALLOW_THREADS
    data = (const char *)sqlite3_serialize(self->db, name, &size, flags);
    if (data == NULL) {
        flags &= ~SQLITE_SERIALIZE_NOCOPY;
        data = (const char *)sqlite3_serialize(self->db, name, &size, flags);
    }
    Ty_END_ALLOW_THREADS

    if (data == NULL) {
        TyErr_Format(self->OperationalError, "unable to serialize '%s'",
                     name);
        return NULL;
    }
    TyObject *res = TyBytes_FromStringAndSize(data, (Ty_ssize_t)size);
    if (!(flags & SQLITE_SERIALIZE_NOCOPY)) {
        sqlite3_free((void *)data);
    }
    return res;
}

/*[clinic input]
_sqlite3.Connection.deserialize as deserialize

    data: Ty_buffer(accept={buffer, str})
        The serialized database content.
    /
    *
    name: str = "main"
        Which database to reopen with the deserialization.

Load a serialized database.

The deserialize interface causes the database connection to disconnect from the
target database, and then reopen it as an in-memory database based on the given
serialized data.

The deserialize interface will fail with SQLITE_BUSY if the database is
currently in a read transaction or is involved in a backup operation.
[clinic start generated code]*/

static TyObject *
deserialize_impl(pysqlite_Connection *self, Ty_buffer *data,
                 const char *name)
/*[clinic end generated code: output=e394c798b98bad89 input=1be4ca1faacf28f2]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    /* Transfer ownership of the buffer to SQLite:
     * - Move buffer from Py to SQLite
     * - Tell SQLite to free buffer memory
     * - Tell SQLite that it is permitted to grow the resulting database
     *
     * Make sure we don't overflow sqlite3_deserialize(); it accepts a signed
     * 64-bit int as its data size argument.
     *
     * We can safely use sqlite3_malloc64 here, since it was introduced before
     * the serialize APIs.
     */
    if (data->len > 9223372036854775807) {  // (1 << 63) - 1
        TyErr_SetString(TyExc_OverflowError, "'data' is too large");
        return NULL;
    }

    sqlite3_int64 size = (sqlite3_int64)data->len;
    unsigned char *buf = sqlite3_malloc64(size);
    if (buf == NULL) {
        return TyErr_NoMemory();
    }

    const unsigned int flags = SQLITE_DESERIALIZE_FREEONCLOSE |
                               SQLITE_DESERIALIZE_RESIZEABLE;
    int rc;
    Ty_BEGIN_ALLOW_THREADS
    (void)memcpy(buf, data->buf, data->len);
    rc = sqlite3_deserialize(self->db, name, buf, size, size, flags);
    Ty_END_ALLOW_THREADS

    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return NULL;
    }
    Py_RETURN_NONE;
}
#endif  // PY_SQLITE_HAVE_SERIALIZE


/*[clinic input]
_sqlite3.Connection.__enter__ as pysqlite_connection_enter

Called when the connection is used as a context manager.

Returns itself as a convenience to the caller.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_enter_impl(pysqlite_Connection *self)
/*[clinic end generated code: output=457b09726d3e9dcd input=127d7a4f17e86d8f]*/
{
    if (!pysqlite_check_connection(self)) {
        return NULL;
    }
    return Ty_NewRef((TyObject *)self);
}

/*[clinic input]
_sqlite3.Connection.__exit__ as pysqlite_connection_exit

    type as exc_type: object
    value as exc_value: object
    traceback as exc_tb: object
    /

Called when the connection is used as a context manager.

If there was any exception, a rollback takes place; otherwise we commit.
[clinic start generated code]*/

static TyObject *
pysqlite_connection_exit_impl(pysqlite_Connection *self, TyObject *exc_type,
                              TyObject *exc_value, TyObject *exc_tb)
/*[clinic end generated code: output=0705200e9321202a input=bd66f1532c9c54a7]*/
{
    int commit = 0;
    TyObject* result;

    if (exc_type == Ty_None && exc_value == Ty_None && exc_tb == Ty_None) {
        commit = 1;
        result = pysqlite_connection_commit_impl(self);
    }
    else {
        result = pysqlite_connection_rollback_impl(self);
    }

    if (result == NULL) {
        if (commit) {
            /* Commit failed; try to rollback in order to unlock the database.
             * If rollback also fails, chain the exceptions. */
            TyObject *exc = TyErr_GetRaisedException();
            result = pysqlite_connection_rollback_impl(self);
            if (result == NULL) {
                _TyErr_ChainExceptions1(exc);
            }
            else {
                Ty_DECREF(result);
                TyErr_SetRaisedException(exc);
            }
        }
        return NULL;
    }
    Ty_DECREF(result);

    Py_RETURN_FALSE;
}

/*[clinic input]
_sqlite3.Connection.setlimit as setlimit

    category: int
        The limit category to be set.
    limit: int
        The new limit. If the new limit is a negative number, the limit is
        unchanged.
    /

Set connection run-time limits.

Attempts to increase a limit above its hard upper bound are silently truncated
to the hard upper bound. Regardless of whether or not the limit was changed,
the prior value of the limit is returned.
[clinic start generated code]*/

static TyObject *
setlimit_impl(pysqlite_Connection *self, int category, int limit)
/*[clinic end generated code: output=0d208213f8d68ccd input=9bd469537e195635]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }

    int old_limit = sqlite3_limit(self->db, category, limit);
    if (old_limit < 0) {
        TyErr_SetString(self->ProgrammingError, "'category' is out of bounds");
        return NULL;
    }
    return TyLong_FromLong(old_limit);
}

/*[clinic input]
_sqlite3.Connection.getlimit as getlimit

    category: int
        The limit category to be queried.
    /

Get connection run-time limits.
[clinic start generated code]*/

static TyObject *
getlimit_impl(pysqlite_Connection *self, int category)
/*[clinic end generated code: output=7c3f5d11f24cecb1 input=61e0849fb4fb058f]*/
{
    return setlimit_impl(self, category, -1);
}

static inline bool
is_int_config(const int op)
{
    switch (op) {
        case SQLITE_DBCONFIG_ENABLE_FKEY:
        case SQLITE_DBCONFIG_ENABLE_TRIGGER:
        case SQLITE_DBCONFIG_ENABLE_FTS3_TOKENIZER:
        case SQLITE_DBCONFIG_ENABLE_LOAD_EXTENSION:
#if SQLITE_VERSION_NUMBER >= 3016000
        case SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE:
#endif
#if SQLITE_VERSION_NUMBER >= 3020000
        case SQLITE_DBCONFIG_ENABLE_QPSG:
#endif
#if SQLITE_VERSION_NUMBER >= 3022000
        case SQLITE_DBCONFIG_TRIGGER_EQP:
#endif
#if SQLITE_VERSION_NUMBER >= 3024000
        case SQLITE_DBCONFIG_RESET_DATABASE:
#endif
#if SQLITE_VERSION_NUMBER >= 3026000
        case SQLITE_DBCONFIG_DEFENSIVE:
#endif
#if SQLITE_VERSION_NUMBER >= 3028000
        case SQLITE_DBCONFIG_WRITABLE_SCHEMA:
#endif
#if SQLITE_VERSION_NUMBER >= 3029000
        case SQLITE_DBCONFIG_DQS_DDL:
        case SQLITE_DBCONFIG_DQS_DML:
        case SQLITE_DBCONFIG_LEGACY_ALTER_TABLE:
#endif
#if SQLITE_VERSION_NUMBER >= 3030000
        case SQLITE_DBCONFIG_ENABLE_VIEW:
#endif
#if SQLITE_VERSION_NUMBER >= 3031000
        case SQLITE_DBCONFIG_LEGACY_FILE_FORMAT:
        case SQLITE_DBCONFIG_TRUSTED_SCHEMA:
#endif
            return true;
        default:
            return false;
    }
}

/*[clinic input]
_sqlite3.Connection.setconfig as setconfig

    op: int
        The configuration verb; one of the sqlite3.SQLITE_DBCONFIG codes.
    enable: bool = True
    /

Set a boolean connection configuration option.
[clinic start generated code]*/

static TyObject *
setconfig_impl(pysqlite_Connection *self, int op, int enable)
/*[clinic end generated code: output=c60b13e618aff873 input=a10f1539c2d7da6b]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }
    if (!is_int_config(op)) {
        return TyErr_Format(TyExc_ValueError, "unknown config 'op': %d", op);
    }

    int actual;
    int rc = sqlite3_db_config(self->db, op, enable, &actual);
    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return NULL;
    }
    if (enable != actual) {
        TyErr_SetString(self->state->OperationalError, "Unable to set config");
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Connection.getconfig as getconfig -> bool

    op: int
        The configuration verb; one of the sqlite3.SQLITE_DBCONFIG codes.
    /

Query a boolean connection configuration option.
[clinic start generated code]*/

static int
getconfig_impl(pysqlite_Connection *self, int op)
/*[clinic end generated code: output=25ac05044c7b78a3 input=b0526d7e432e3f2f]*/
{
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return -1;
    }
    if (!is_int_config(op)) {
        TyErr_Format(TyExc_ValueError, "unknown config 'op': %d", op);
        return -1;
    }

    int current;
    int rc = sqlite3_db_config(self->db, op, -1, &current);
    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return -1;
    }
    return current;
}

static TyObject *
get_autocommit(TyObject *op, void *Py_UNUSED(closure))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return NULL;
    }
    if (self->autocommit == AUTOCOMMIT_ENABLED) {
        Py_RETURN_TRUE;
    }
    if (self->autocommit == AUTOCOMMIT_DISABLED) {
        Py_RETURN_FALSE;
    }
    return TyLong_FromLong(LEGACY_TRANSACTION_CONTROL);
}

static int
set_autocommit(TyObject *op, TyObject *val, void *Py_UNUSED(closure))
{
    pysqlite_Connection *self = _pysqlite_Connection_CAST(op);
    if (!pysqlite_check_thread(self) || !pysqlite_check_connection(self)) {
        return -1;
    }
    if (!autocommit_converter(val, &self->autocommit)) {
        return -1;
    }
    if (self->autocommit == AUTOCOMMIT_ENABLED) {
        if (!sqlite3_get_autocommit(self->db)) {
            if (connection_exec_stmt(self, "COMMIT") < 0) {
                return -1;
            }
        }
    }
    else if (self->autocommit == AUTOCOMMIT_DISABLED) {
        if (sqlite3_get_autocommit(self->db)) {
            if (connection_exec_stmt(self, "BEGIN") < 0) {
                return -1;
            }
        }
    }
    return 0;
}

static TyObject *
get_sig(TyObject *Py_UNUSED(self), void *Py_UNUSED(closure))
{
    return TyUnicode_FromString("(sql, /)");
}


static const char connection_doc[] =
TyDoc_STR("SQLite database connection object.");

static TyGetSetDef connection_getset[] = {
    {"isolation_level", pysqlite_connection_get_isolation_level,
     pysqlite_connection_set_isolation_level},
    {"total_changes",  pysqlite_connection_get_total_changes, NULL},
    {"in_transaction", pysqlite_connection_get_in_transaction, NULL},
    {"autocommit",  get_autocommit, set_autocommit},
    {"__text_signature__", get_sig, NULL},
    {NULL}
};

static TyMethodDef connection_methods[] = {
    PYSQLITE_CONNECTION_BACKUP_METHODDEF
    PYSQLITE_CONNECTION_CLOSE_METHODDEF
    PYSQLITE_CONNECTION_COMMIT_METHODDEF
    PYSQLITE_CONNECTION_CREATE_AGGREGATE_METHODDEF
    PYSQLITE_CONNECTION_CREATE_COLLATION_METHODDEF
    PYSQLITE_CONNECTION_CREATE_FUNCTION_METHODDEF
    PYSQLITE_CONNECTION_CURSOR_METHODDEF
    PYSQLITE_CONNECTION_ENABLE_LOAD_EXTENSION_METHODDEF
    PYSQLITE_CONNECTION_ENTER_METHODDEF
    PYSQLITE_CONNECTION_EXECUTEMANY_METHODDEF
    PYSQLITE_CONNECTION_EXECUTESCRIPT_METHODDEF
    PYSQLITE_CONNECTION_EXECUTE_METHODDEF
    PYSQLITE_CONNECTION_EXIT_METHODDEF
    PYSQLITE_CONNECTION_INTERRUPT_METHODDEF
    PYSQLITE_CONNECTION_ITERDUMP_METHODDEF
    PYSQLITE_CONNECTION_LOAD_EXTENSION_METHODDEF
    PYSQLITE_CONNECTION_ROLLBACK_METHODDEF
    PYSQLITE_CONNECTION_SET_AUTHORIZER_METHODDEF
    PYSQLITE_CONNECTION_SET_PROGRESS_HANDLER_METHODDEF
    PYSQLITE_CONNECTION_SET_TRACE_CALLBACK_METHODDEF
    SETLIMIT_METHODDEF
    GETLIMIT_METHODDEF
    SERIALIZE_METHODDEF
    DESERIALIZE_METHODDEF
    CREATE_WINDOW_FUNCTION_METHODDEF
    BLOBOPEN_METHODDEF
    SETCONFIG_METHODDEF
    GETCONFIG_METHODDEF
    {NULL, NULL}
};

static struct TyMemberDef connection_members[] =
{
    {"Warning", _Ty_T_OBJECT, offsetof(pysqlite_Connection, Warning), Py_READONLY},
    {"Error", _Ty_T_OBJECT, offsetof(pysqlite_Connection, Error), Py_READONLY},
    {"InterfaceError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, InterfaceError), Py_READONLY},
    {"DatabaseError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, DatabaseError), Py_READONLY},
    {"DataError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, DataError), Py_READONLY},
    {"OperationalError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, OperationalError), Py_READONLY},
    {"IntegrityError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, IntegrityError), Py_READONLY},
    {"InternalError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, InternalError), Py_READONLY},
    {"ProgrammingError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, ProgrammingError), Py_READONLY},
    {"NotSupportedError", _Ty_T_OBJECT, offsetof(pysqlite_Connection, NotSupportedError), Py_READONLY},
    {"row_factory", _Ty_T_OBJECT, offsetof(pysqlite_Connection, row_factory)},
    {"text_factory", _Ty_T_OBJECT, offsetof(pysqlite_Connection, text_factory)},
    {NULL}
};

static TyType_Slot connection_slots[] = {
    {Ty_tp_finalize, connection_finalize},
    {Ty_tp_dealloc, connection_dealloc},
    {Ty_tp_doc, (void *)connection_doc},
    {Ty_tp_methods, connection_methods},
    {Ty_tp_members, connection_members},
    {Ty_tp_getset, connection_getset},
    {Ty_tp_init, pysqlite_connection_init},
    {Ty_tp_call, pysqlite_connection_call},
    {Ty_tp_traverse, connection_traverse},
    {Ty_tp_clear, connection_clear},
    {0, NULL},
};

static TyType_Spec connection_spec = {
    .name = MODULE_NAME ".Connection",
    .basicsize = sizeof(pysqlite_Connection),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = connection_slots,
};

int
pysqlite_connection_setup_types(TyObject *module)
{
    TyObject *type = TyType_FromModuleAndSpec(module, &connection_spec, NULL);
    if (type == NULL) {
        return -1;
    }
    pysqlite_state *state = pysqlite_get_state(module);
    state->ConnectionType = (TyTypeObject *)type;
    return 0;
}
