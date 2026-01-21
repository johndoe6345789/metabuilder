/* cursor.c - the cursor type
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

#include "cursor.h"
#include "microprotocols.h"
#include "module.h"
#include "util.h"

#include "pycore_pyerrors.h"      // _TyErr_FormatFromCause()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

typedef enum {
    TYPE_LONG,
    TYPE_FLOAT,
    TYPE_UNICODE,
    TYPE_BUFFER,
    TYPE_UNKNOWN
} parameter_type;

#define clinic_state() (pysqlite_get_state_by_type(Ty_TYPE(self)))
#include "clinic/cursor.c.h"
#undef clinic_state

#define _pysqlite_Cursor_CAST(op)   ((pysqlite_Cursor *)(op))

static inline int
check_cursor_locked(pysqlite_Cursor *cur)
{
    if (cur->locked) {
        TyErr_SetString(cur->connection->ProgrammingError,
                        "Recursive use of cursors not allowed.");
        return 0;
    }
    return 1;
}

/*[clinic input]
module _sqlite3
class _sqlite3.Cursor "pysqlite_Cursor *" "clinic_state()->CursorType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=3c5b8115c5cf30f1]*/

/*
 * Registers a cursor with the connection.
 *
 * 0 => error; 1 => ok
 */
static int
register_cursor(pysqlite_Connection *connection, TyObject *cursor)
{
    TyObject *weakref = PyWeakref_NewRef((TyObject *)cursor, NULL);
    if (weakref == NULL) {
        return 0;
    }

    if (TyList_Append(connection->cursors, weakref) < 0) {
        Ty_CLEAR(weakref);
        return 0;
    }

    Ty_DECREF(weakref);
    return 1;
}

/*[clinic input]
_sqlite3.Cursor.__init__ as pysqlite_cursor_init

    connection: object(type='pysqlite_Connection *', subclass_of='clinic_state()->ConnectionType')
    /

[clinic start generated code]*/

static int
pysqlite_cursor_init_impl(pysqlite_Cursor *self,
                          pysqlite_Connection *connection)
/*[clinic end generated code: output=ac59dce49a809ca8 input=23d4265b534989fb]*/
{
    if (!check_cursor_locked(self)) {
        return -1;
    }

    Ty_INCREF(connection);
    Ty_XSETREF(self->connection, connection);
    Ty_CLEAR(self->statement);
    Ty_CLEAR(self->row_cast_map);

    Ty_INCREF(Ty_None);
    Ty_XSETREF(self->description, Ty_None);

    Ty_INCREF(Ty_None);
    Ty_XSETREF(self->lastrowid, Ty_None);

    self->arraysize = 1;
    self->closed = 0;
    self->rowcount = -1L;

    Ty_INCREF(Ty_None);
    Ty_XSETREF(self->row_factory, Ty_None);

    if (!pysqlite_check_thread(self->connection)) {
        return -1;
    }

    if (!register_cursor(connection, (TyObject *)self)) {
        return -1;
    }

    self->initialized = 1;

    return 0;
}

static inline int
stmt_reset(pysqlite_Statement *self)
{
    int rc = SQLITE_OK;

    if (self->st != NULL) {
        Ty_BEGIN_ALLOW_THREADS
        rc = sqlite3_reset(self->st);
        Ty_END_ALLOW_THREADS
    }

    return rc;
}

static int
cursor_traverse(TyObject *op, visitproc visit, void *arg)
{
    pysqlite_Cursor *self = _pysqlite_Cursor_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->connection);
    Ty_VISIT(self->description);
    Ty_VISIT(self->row_cast_map);
    Ty_VISIT(self->lastrowid);
    Ty_VISIT(self->row_factory);
    Ty_VISIT(self->statement);
    return 0;
}

static int
cursor_clear(TyObject *op)
{
    pysqlite_Cursor *self = _pysqlite_Cursor_CAST(op);
    Ty_CLEAR(self->connection);
    Ty_CLEAR(self->description);
    Ty_CLEAR(self->row_cast_map);
    Ty_CLEAR(self->lastrowid);
    Ty_CLEAR(self->row_factory);
    if (self->statement) {
        /* Reset the statement if the user has not closed the cursor */
        stmt_reset(self->statement);
        Ty_CLEAR(self->statement);
    }

    return 0;
}

static void
cursor_dealloc(TyObject *op)
{
    pysqlite_Cursor *self = _pysqlite_Cursor_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    FT_CLEAR_WEAKREFS(op, self->in_weakreflist);
    (void)tp->tp_clear(op);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
_pysqlite_get_converter(pysqlite_state *state, const char *keystr,
                        Ty_ssize_t keylen)
{
    TyObject *key;
    TyObject *upcase_key;
    TyObject *retval;

    key = TyUnicode_FromStringAndSize(keystr, keylen);
    if (!key) {
        return NULL;
    }
    upcase_key = PyObject_CallMethodNoArgs(key, state->str_upper);
    Ty_DECREF(key);
    if (!upcase_key) {
        return NULL;
    }

    retval = TyDict_GetItemWithError(state->converters, upcase_key);
    Ty_DECREF(upcase_key);

    return retval;
}

static int
pysqlite_build_row_cast_map(pysqlite_Cursor* self)
{
    int i;
    const char* pos;
    const char* decltype;
    TyObject* converter;

    if (!self->connection->detect_types) {
        return 0;
    }

    Ty_XSETREF(self->row_cast_map, TyList_New(0));
    if (!self->row_cast_map) {
        return -1;
    }

    for (i = 0; i < sqlite3_column_count(self->statement->st); i++) {
        converter = NULL;

        if (self->connection->detect_types & PARSE_COLNAMES) {
            const char *colname = sqlite3_column_name(self->statement->st, i);
            if (colname == NULL) {
                TyErr_NoMemory();
                Ty_CLEAR(self->row_cast_map);
                return -1;
            }
            const char *type_start = NULL;
            for (pos = colname; *pos != 0; pos++) {
                if (*pos == '[') {
                    type_start = pos + 1;
                }
                else if (*pos == ']' && type_start != NULL) {
                    pysqlite_state *state = self->connection->state;
                    converter = _pysqlite_get_converter(state, type_start,
                                                        pos - type_start);
                    if (!converter && TyErr_Occurred()) {
                        Ty_CLEAR(self->row_cast_map);
                        return -1;
                    }
                    break;
                }
            }
        }

        if (!converter && self->connection->detect_types & PARSE_DECLTYPES) {
            decltype = sqlite3_column_decltype(self->statement->st, i);
            if (decltype) {
                for (pos = decltype;;pos++) {
                    /* Converter names are split at '(' and blanks.
                     * This allows 'INTEGER NOT NULL' to be treated as 'INTEGER' and
                     * 'NUMBER(10)' to be treated as 'NUMBER', for example.
                     * In other words, it will work as people expect it to work.*/
                    if (*pos == ' ' || *pos == '(' || *pos == 0) {
                        pysqlite_state *state = self->connection->state;
                        converter = _pysqlite_get_converter(state, decltype,
                                                            pos - decltype);
                        if (!converter && TyErr_Occurred()) {
                            Ty_CLEAR(self->row_cast_map);
                            return -1;
                        }
                        break;
                    }
                }
            }
        }

        if (!converter) {
            converter = Ty_None;
        }

        if (TyList_Append(self->row_cast_map, converter) != 0) {
            Ty_CLEAR(self->row_cast_map);
            return -1;
        }
    }

    return 0;
}

static TyObject *
_pysqlite_build_column_name(pysqlite_Cursor *self, const char *colname)
{
    const char* pos;
    Ty_ssize_t len;

    if (self->connection->detect_types & PARSE_COLNAMES) {
        for (pos = colname; *pos; pos++) {
            if (*pos == '[') {
                if ((pos != colname) && (*(pos-1) == ' ')) {
                    pos--;
                }
                break;
            }
        }
        len = pos - colname;
    }
    else {
        len = strlen(colname);
    }
    return TyUnicode_FromStringAndSize(colname, len);
}

/*
 * Returns a row from the currently active SQLite statement
 *
 * Precondidition:
 * - sqlite3_step() has been called before and it returned SQLITE_ROW.
 */
static TyObject *
_pysqlite_fetch_one_row(pysqlite_Cursor* self)
{
    int i, numcols;
    TyObject* row;
    int coltype;
    TyObject* converter;
    TyObject* converted;
    Ty_ssize_t nbytes;
    char buf[200];
    const char* colname;
    TyObject* error_msg;

    Ty_BEGIN_ALLOW_THREADS
    numcols = sqlite3_data_count(self->statement->st);
    Ty_END_ALLOW_THREADS

    row = TyTuple_New(numcols);
    if (!row)
        return NULL;

    sqlite3 *db = self->connection->db;
    for (i = 0; i < numcols; i++) {
        if (self->connection->detect_types
                && self->row_cast_map != NULL
                && i < TyList_GET_SIZE(self->row_cast_map))
        {
            converter = TyList_GET_ITEM(self->row_cast_map, i);
        }
        else {
            converter = Ty_None;
        }

        /*
         * Note, sqlite3_column_bytes() must come after sqlite3_column_blob()
         * or sqlite3_column_text().
         *
         * See https://sqlite.org/c3ref/column_blob.html for details.
         */
        if (converter != Ty_None) {
            const void *blob = sqlite3_column_blob(self->statement->st, i);
            if (blob == NULL) {
                if (sqlite3_errcode(db) == SQLITE_NOMEM) {
                    TyErr_NoMemory();
                    goto error;
                }
                converted = Ty_NewRef(Ty_None);
            }
            else {
                nbytes = sqlite3_column_bytes(self->statement->st, i);
                TyObject *item = TyBytes_FromStringAndSize(blob, nbytes);
                if (item == NULL) {
                    goto error;
                }
                converted = PyObject_CallOneArg(converter, item);
                Ty_DECREF(item);
            }
        } else {
            Ty_BEGIN_ALLOW_THREADS
            coltype = sqlite3_column_type(self->statement->st, i);
            Ty_END_ALLOW_THREADS
            if (coltype == SQLITE_NULL) {
                converted = Ty_NewRef(Ty_None);
            } else if (coltype == SQLITE_INTEGER) {
                converted = TyLong_FromLongLong(sqlite3_column_int64(self->statement->st, i));
            } else if (coltype == SQLITE_FLOAT) {
                converted = TyFloat_FromDouble(sqlite3_column_double(self->statement->st, i));
            } else if (coltype == SQLITE_TEXT) {
                const char *text = (const char*)sqlite3_column_text(self->statement->st, i);
                if (text == NULL && sqlite3_errcode(db) == SQLITE_NOMEM) {
                    TyErr_NoMemory();
                    goto error;
                }

                nbytes = sqlite3_column_bytes(self->statement->st, i);
                if (self->connection->text_factory == (TyObject*)&TyUnicode_Type) {
                    converted = TyUnicode_FromStringAndSize(text, nbytes);
                    if (!converted && TyErr_ExceptionMatches(TyExc_UnicodeDecodeError)) {
                        TyErr_Clear();
                        colname = sqlite3_column_name(self->statement->st, i);
                        if (colname == NULL) {
                            TyErr_NoMemory();
                            goto error;
                        }
                        TyOS_snprintf(buf, sizeof(buf) - 1, "Could not decode to UTF-8 column '%s' with text '%s'",
                                     colname , text);
                        error_msg = TyUnicode_Decode(buf, strlen(buf), "ascii", "replace");

                        TyObject *exc = self->connection->OperationalError;
                        if (!error_msg) {
                            TyErr_SetString(exc, "Could not decode to UTF-8");
                        } else {
                            TyErr_SetObject(exc, error_msg);
                            Ty_DECREF(error_msg);
                        }
                    }
                } else if (self->connection->text_factory == (TyObject*)&TyBytes_Type) {
                    converted = TyBytes_FromStringAndSize(text, nbytes);
                } else if (self->connection->text_factory == (TyObject*)&TyByteArray_Type) {
                    converted = TyByteArray_FromStringAndSize(text, nbytes);
                } else {
                    converted = PyObject_CallFunction(self->connection->text_factory, "y#", text, nbytes);
                }
            } else {
                /* coltype == SQLITE_BLOB */
                const void *blob = sqlite3_column_blob(self->statement->st, i);
                if (blob == NULL && sqlite3_errcode(db) == SQLITE_NOMEM) {
                    TyErr_NoMemory();
                    goto error;
                }

                nbytes = sqlite3_column_bytes(self->statement->st, i);
                converted = TyBytes_FromStringAndSize(blob, nbytes);
            }
        }

        if (!converted) {
            goto error;
        }
        TyTuple_SET_ITEM(row, i, converted);
    }

    if (TyErr_Occurred())
        goto error;

    return row;

error:
    Ty_DECREF(row);
    return NULL;
}

/*
 * Checks if a cursor object is usable.
 *
 * 0 => error; 1 => ok
 */
static int check_cursor(pysqlite_Cursor* cur)
{
    if (!cur->initialized) {
        pysqlite_state *state = pysqlite_get_state_by_type(Ty_TYPE(cur));
        TyErr_SetString(state->ProgrammingError,
                        "Base Cursor.__init__ not called.");
        return 0;
    }

    if (cur->closed) {
        TyErr_SetString(cur->connection->state->ProgrammingError,
                        "Cannot operate on a closed cursor.");
        return 0;
    }

    return (pysqlite_check_thread(cur->connection)
            && pysqlite_check_connection(cur->connection)
            && check_cursor_locked(cur));
}

static int
begin_transaction(pysqlite_Connection *self)
{
    assert(self->isolation_level != NULL);
    int rc;

    Ty_BEGIN_ALLOW_THREADS
    sqlite3_stmt *statement;
    char begin_stmt[16] = "BEGIN ";
#ifdef Ty_DEBUG
    size_t len = strlen(self->isolation_level);
    assert(len <= 9);
#endif
    (void)strcat(begin_stmt, self->isolation_level);
    rc = sqlite3_prepare_v2(self->db, begin_stmt, -1, &statement, NULL);
    if (rc == SQLITE_OK) {
        (void)sqlite3_step(statement);
        rc = sqlite3_finalize(statement);
    }
    Ty_END_ALLOW_THREADS

    if (rc != SQLITE_OK) {
        set_error_from_db(self->state, self->db);
        return -1;
    }

    return 0;
}

static TyObject *
get_statement_from_cache(pysqlite_Cursor *self, TyObject *operation)
{
    TyObject *args[] = { NULL, operation, };  // Borrowed ref.
    TyObject *cache = self->connection->statement_cache;
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    return PyObject_Vectorcall(cache, args + 1, nargsf, NULL);
}

static inline int
stmt_step(sqlite3_stmt *statement)
{
    int rc;

    Ty_BEGIN_ALLOW_THREADS
    rc = sqlite3_step(statement);
    Ty_END_ALLOW_THREADS

    return rc;
}

static int
bind_param(pysqlite_state *state, pysqlite_Statement *self, int pos,
           TyObject *parameter)
{
    int rc = SQLITE_OK;
    const char *string;
    Ty_ssize_t buflen;
    parameter_type paramtype;

    if (parameter == Ty_None) {
        rc = sqlite3_bind_null(self->st, pos);
        goto final;
    }

    if (TyLong_CheckExact(parameter)) {
        paramtype = TYPE_LONG;
    } else if (TyFloat_CheckExact(parameter)) {
        paramtype = TYPE_FLOAT;
    } else if (TyUnicode_CheckExact(parameter)) {
        paramtype = TYPE_UNICODE;
    } else if (TyLong_Check(parameter)) {
        paramtype = TYPE_LONG;
    } else if (TyFloat_Check(parameter)) {
        paramtype = TYPE_FLOAT;
    } else if (TyUnicode_Check(parameter)) {
        paramtype = TYPE_UNICODE;
    } else if (PyObject_CheckBuffer(parameter)) {
        paramtype = TYPE_BUFFER;
    } else {
        paramtype = TYPE_UNKNOWN;
    }

    switch (paramtype) {
        case TYPE_LONG: {
            sqlite_int64 value = _pysqlite_long_as_int64(parameter);
            if (value == -1 && TyErr_Occurred())
                rc = -1;
            else
                rc = sqlite3_bind_int64(self->st, pos, value);
            break;
        }
        case TYPE_FLOAT: {
            double value = TyFloat_AsDouble(parameter);
            if (value == -1 && TyErr_Occurred()) {
                rc = -1;
            }
            else {
                rc = sqlite3_bind_double(self->st, pos, value);
            }
            break;
        }
        case TYPE_UNICODE:
            string = TyUnicode_AsUTF8AndSize(parameter, &buflen);
            if (string == NULL)
                return -1;
            if (buflen > INT_MAX) {
                TyErr_SetString(TyExc_OverflowError,
                                "string longer than INT_MAX bytes");
                return -1;
            }
            rc = sqlite3_bind_text(self->st, pos, string, (int)buflen, SQLITE_TRANSIENT);
            break;
        case TYPE_BUFFER: {
            Ty_buffer view;
            if (PyObject_GetBuffer(parameter, &view, PyBUF_SIMPLE) != 0) {
                return -1;
            }
            if (view.len > INT_MAX) {
                TyErr_SetString(TyExc_OverflowError,
                                "BLOB longer than INT_MAX bytes");
                PyBuffer_Release(&view);
                return -1;
            }
            rc = sqlite3_bind_blob(self->st, pos, view.buf, (int)view.len, SQLITE_TRANSIENT);
            PyBuffer_Release(&view);
            break;
        }
        case TYPE_UNKNOWN:
            TyErr_Format(state->ProgrammingError,
                    "Error binding parameter %d: type '%s' is not supported",
                    pos, Ty_TYPE(parameter)->tp_name);
            rc = -1;
    }

final:
    return rc;
}

/* returns 0 if the object is one of Python's internal ones that don't need to be adapted */
static inline int
need_adapt(pysqlite_state *state, TyObject *obj)
{
    if (state->BaseTypeAdapted) {
        return 1;
    }

    if (TyLong_CheckExact(obj) || TyFloat_CheckExact(obj)
          || TyUnicode_CheckExact(obj) || TyByteArray_CheckExact(obj)) {
        return 0;
    } else {
        return 1;
    }
}

static void
bind_parameters(pysqlite_state *state, pysqlite_Statement *self,
                TyObject *parameters)
{
    TyObject* current_param;
    TyObject* adapted;
    const char* binding_name;
    int i;
    int rc;
    int num_params_needed;
    Ty_ssize_t num_params;

    Ty_BEGIN_ALLOW_THREADS
    num_params_needed = sqlite3_bind_parameter_count(self->st);
    Ty_END_ALLOW_THREADS

    if (TyTuple_CheckExact(parameters) || TyList_CheckExact(parameters) || (!TyDict_Check(parameters) && PySequence_Check(parameters))) {
        /* parameters passed as sequence */
        if (TyTuple_CheckExact(parameters)) {
            num_params = TyTuple_GET_SIZE(parameters);
        } else if (TyList_CheckExact(parameters)) {
            num_params = TyList_GET_SIZE(parameters);
        } else {
            num_params = PySequence_Size(parameters);
            if (num_params == -1) {
                return;
            }
        }
        if (num_params != num_params_needed) {
            TyErr_Format(state->ProgrammingError,
                         "Incorrect number of bindings supplied. The current "
                         "statement uses %d, and there are %zd supplied.",
                         num_params_needed, num_params);
            return;
        }
        for (i = 0; i < num_params; i++) {
            const char *name = sqlite3_bind_parameter_name(self->st, i+1);
            if (name != NULL && name[0] != '?') {
                TyErr_Format(state->ProgrammingError,
                        "Binding %d ('%s') is a named parameter, but you "
                        "supplied a sequence which requires nameless (qmark) "
                        "placeholders.",
                        i+1, name);
                return;
            }

            if (TyTuple_CheckExact(parameters)) {
                TyObject *item = TyTuple_GET_ITEM(parameters, i);
                current_param = Ty_NewRef(item);
            } else if (TyList_CheckExact(parameters)) {
                TyObject *item = TyList_GetItem(parameters, i);
                current_param = Ty_XNewRef(item);
            } else {
                current_param = PySequence_GetItem(parameters, i);
            }
            if (!current_param) {
                return;
            }

            if (!need_adapt(state, current_param)) {
                adapted = current_param;
            } else {
                TyObject *protocol = (TyObject *)state->PrepareProtocolType;
                adapted = pysqlite_microprotocols_adapt(state, current_param,
                                                        protocol,
                                                        current_param);
                Ty_DECREF(current_param);
                if (!adapted) {
                    return;
                }
            }

            rc = bind_param(state, self, i + 1, adapted);
            Ty_DECREF(adapted);

            if (rc != SQLITE_OK) {
                TyObject *exc = TyErr_GetRaisedException();
                sqlite3 *db = sqlite3_db_handle(self->st);
                set_error_from_db(state, db);
                _TyErr_ChainExceptions1(exc);
                return;
            }
        }
    } else if (TyDict_Check(parameters)) {
        /* parameters passed as dictionary */
        for (i = 1; i <= num_params_needed; i++) {
            Ty_BEGIN_ALLOW_THREADS
            binding_name = sqlite3_bind_parameter_name(self->st, i);
            Ty_END_ALLOW_THREADS
            if (!binding_name) {
                TyErr_Format(state->ProgrammingError,
                             "Binding %d has no name, but you supplied a "
                             "dictionary (which has only names).", i);
                return;
            }

            binding_name++; /* skip first char (the colon) */
            TyObject *current_param;
            (void)PyMapping_GetOptionalItemString(parameters, binding_name, &current_param);
            if (!current_param) {
                if (!TyErr_Occurred() || TyErr_ExceptionMatches(TyExc_LookupError)) {
                    TyErr_Format(state->ProgrammingError,
                                 "You did not supply a value for binding "
                                 "parameter :%s.", binding_name);
                }
                return;
            }

            if (!need_adapt(state, current_param)) {
                adapted = current_param;
            } else {
                TyObject *protocol = (TyObject *)state->PrepareProtocolType;
                adapted = pysqlite_microprotocols_adapt(state, current_param,
                                                        protocol,
                                                        current_param);
                Ty_DECREF(current_param);
                if (!adapted) {
                    return;
                }
            }

            rc = bind_param(state, self, i, adapted);
            Ty_DECREF(adapted);

            if (rc != SQLITE_OK) {
                TyObject *exc = TyErr_GetRaisedException();
                sqlite3 *db = sqlite3_db_handle(self->st);
                set_error_from_db(state, db);
                _TyErr_ChainExceptions1(exc);
                return;
           }
        }
    } else {
        TyErr_SetString(state->ProgrammingError,
                        "parameters are of unsupported type");
    }
}

TyObject *
_pysqlite_query_execute(pysqlite_Cursor* self, int multiple, TyObject* operation, TyObject* second_argument)
{
    TyObject* parameters_list = NULL;
    TyObject* parameters_iter = NULL;
    TyObject* parameters = NULL;
    int i;
    int rc;
    int numcols;
    TyObject* column_name;

    if (!check_cursor(self)) {
        goto error;
    }

    self->locked = 1;

    if (multiple) {
        if (TyIter_Check(second_argument)) {
            /* iterator */
            parameters_iter = Ty_NewRef(second_argument);
        } else {
            /* sequence */
            parameters_iter = PyObject_GetIter(second_argument);
            if (!parameters_iter) {
                goto error;
            }
        }
    } else {
        parameters_list = TyList_New(0);
        if (!parameters_list) {
            goto error;
        }

        if (second_argument == NULL) {
            second_argument = TyTuple_New(0);
            if (!second_argument) {
                goto error;
            }
        } else {
            Ty_INCREF(second_argument);
        }
        if (TyList_Append(parameters_list, second_argument) != 0) {
            Ty_DECREF(second_argument);
            goto error;
        }
        Ty_DECREF(second_argument);

        parameters_iter = PyObject_GetIter(parameters_list);
        if (!parameters_iter) {
            goto error;
        }
    }

    /* reset description */
    Ty_INCREF(Ty_None);
    Ty_SETREF(self->description, Ty_None);

    if (self->statement) {
        // Reset pending statements on this cursor.
        (void)stmt_reset(self->statement);
    }

    TyObject *stmt = get_statement_from_cache(self, operation);
    Ty_XSETREF(self->statement, (pysqlite_Statement *)stmt);
    if (!self->statement) {
        goto error;
    }

    pysqlite_state *state = self->connection->state;
    if (multiple && sqlite3_stmt_readonly(self->statement->st)) {
        TyErr_SetString(state->ProgrammingError,
                        "executemany() can only execute DML statements.");
        goto error;
    }

    if (sqlite3_stmt_busy(self->statement->st)) {
        Ty_SETREF(self->statement,
                  pysqlite_statement_create(self->connection, operation));
        if (self->statement == NULL) {
            goto error;
        }
    }

    (void)stmt_reset(self->statement);
    self->rowcount = self->statement->is_dml ? 0L : -1L;

    /* We start a transaction implicitly before a DML statement.
       SELECT is the only exception. See #9924. */
    if (self->connection->autocommit == AUTOCOMMIT_LEGACY
        && self->connection->isolation_level
        && self->statement->is_dml
        && sqlite3_get_autocommit(self->connection->db))
    {
        if (begin_transaction(self->connection) < 0) {
            goto error;
        }
    }

    assert(!sqlite3_stmt_busy(self->statement->st));
    while (1) {
        parameters = TyIter_Next(parameters_iter);
        if (!parameters) {
            break;
        }

        bind_parameters(state, self->statement, parameters);
        if (TyErr_Occurred()) {
            goto error;
        }

        rc = stmt_step(self->statement->st);
        if (rc != SQLITE_DONE && rc != SQLITE_ROW) {
            if (TyErr_Occurred()) {
                /* there was an error that occurred in a user-defined callback */
                if (state->enable_callback_tracebacks) {
                    TyErr_Print();
                } else {
                    TyErr_Clear();
                }
            }
            set_error_from_db(state, self->connection->db);
            goto error;
        }

        if (pysqlite_build_row_cast_map(self) != 0) {
            _TyErr_FormatFromCause(state->OperationalError,
                                   "Error while building row_cast_map");
            goto error;
        }

        assert(rc == SQLITE_ROW || rc == SQLITE_DONE);
        Ty_BEGIN_ALLOW_THREADS
        numcols = sqlite3_column_count(self->statement->st);
        Ty_END_ALLOW_THREADS
        if (self->description == Ty_None && numcols > 0) {
            Ty_SETREF(self->description, TyTuple_New(numcols));
            if (!self->description) {
                goto error;
            }
            for (i = 0; i < numcols; i++) {
                const char *colname;
                colname = sqlite3_column_name(self->statement->st, i);
                if (colname == NULL) {
                    TyErr_NoMemory();
                    goto error;
                }
                column_name = _pysqlite_build_column_name(self, colname);
                if (column_name == NULL) {
                    goto error;
                }
                TyObject *descriptor = TyTuple_Pack(7, column_name,
                                                    Ty_None, Ty_None, Ty_None,
                                                    Ty_None, Ty_None, Ty_None);
                Ty_DECREF(column_name);
                if (descriptor == NULL) {
                    goto error;
                }
                TyTuple_SET_ITEM(self->description, i, descriptor);
            }
        }

        if (rc == SQLITE_DONE) {
            if (self->statement->is_dml) {
                self->rowcount += (long)sqlite3_changes(self->connection->db);
            }
            stmt_reset(self->statement);
        }
        Ty_XDECREF(parameters);
    }

    if (!multiple) {
        sqlite_int64 lastrowid;

        Ty_BEGIN_ALLOW_THREADS
        lastrowid = sqlite3_last_insert_rowid(self->connection->db);
        Ty_END_ALLOW_THREADS

        Ty_SETREF(self->lastrowid, TyLong_FromLongLong(lastrowid));
        // Fall through on error.
    }

error:
    Ty_XDECREF(parameters);
    Ty_XDECREF(parameters_iter);
    Ty_XDECREF(parameters_list);

    self->locked = 0;

    if (TyErr_Occurred()) {
        if (self->statement) {
            (void)stmt_reset(self->statement);
            Ty_CLEAR(self->statement);
        }
        self->rowcount = -1L;
        return NULL;
    }
    if (self->statement && !sqlite3_stmt_busy(self->statement->st)) {
        Ty_CLEAR(self->statement);
    }
    return Ty_NewRef((TyObject *)self);
}

/*[clinic input]
_sqlite3.Cursor.execute as pysqlite_cursor_execute

    sql: unicode
    parameters: object(c_default = 'NULL') = ()
    /

Executes an SQL statement.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_execute_impl(pysqlite_Cursor *self, TyObject *sql,
                             TyObject *parameters)
/*[clinic end generated code: output=d81b4655c7c0bbad input=a8e0200a11627f94]*/
{
    return _pysqlite_query_execute(self, 0, sql, parameters);
}

/*[clinic input]
_sqlite3.Cursor.executemany as pysqlite_cursor_executemany

    sql: unicode
    seq_of_parameters: object
    /

Repeatedly executes an SQL statement.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_executemany_impl(pysqlite_Cursor *self, TyObject *sql,
                                 TyObject *seq_of_parameters)
/*[clinic end generated code: output=2c65a3c4733fb5d8 input=0d0a52e5eb7ccd35]*/
{
    return _pysqlite_query_execute(self, 1, sql, seq_of_parameters);
}

/*[clinic input]
_sqlite3.Cursor.executescript as pysqlite_cursor_executescript

    sql_script: str
    /

Executes multiple SQL statements at once.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_executescript_impl(pysqlite_Cursor *self,
                                   const char *sql_script)
/*[clinic end generated code: output=8fd726dde1c65164 input=78f093be415a8a2c]*/
{
    if (!check_cursor(self)) {
        return NULL;
    }

    size_t sql_len = strlen(sql_script);
    int max_length = sqlite3_limit(self->connection->db,
                                   SQLITE_LIMIT_SQL_LENGTH, -1);
    if (sql_len > (unsigned)max_length) {
        TyErr_SetString(self->connection->DataError,
                        "query string is too large");
        return NULL;
    }

    // Commit if needed
    sqlite3 *db = self->connection->db;
    if (self->connection->autocommit == AUTOCOMMIT_LEGACY
        && !sqlite3_get_autocommit(db))
    {
        int rc = SQLITE_OK;

        Ty_BEGIN_ALLOW_THREADS
        rc = sqlite3_exec(db, "COMMIT", NULL, NULL, NULL);
        Ty_END_ALLOW_THREADS

        if (rc != SQLITE_OK) {
            goto error;
        }
    }

    while (1) {
        int rc;
        const char *tail;

        Ty_BEGIN_ALLOW_THREADS
        sqlite3_stmt *stmt;
        rc = sqlite3_prepare_v2(db, sql_script, (int)sql_len + 1, &stmt,
                                &tail);
        if (rc == SQLITE_OK) {
            do {
                rc = sqlite3_step(stmt);
            } while (rc == SQLITE_ROW);
            rc = sqlite3_finalize(stmt);
        }
        Ty_END_ALLOW_THREADS

        if (rc != SQLITE_OK) {
            goto error;
        }

        if (*tail == (char)0) {
            break;
        }
        sql_len -= (tail - sql_script);
        sql_script = tail;
    }

    return Ty_NewRef((TyObject *)self);

error:
    set_error_from_db(self->connection->state, db);
    return NULL;
}

static TyObject *
pysqlite_cursor_iternext(TyObject *op)
{
    pysqlite_Cursor *self = _pysqlite_Cursor_CAST(op);
    if (!check_cursor(self)) {
        return NULL;
    }

    if (self->statement == NULL) {
        return NULL;
    }

    sqlite3_stmt *stmt = self->statement->st;
    assert(stmt != NULL);
    assert(sqlite3_data_count(stmt) != 0);

    self->locked = 1;  // GH-80254: Prevent recursive use of cursors.
    TyObject *row = _pysqlite_fetch_one_row(self);
    self->locked = 0;
    if (row == NULL) {
        return NULL;
    }
    int rc = stmt_step(stmt);
    if (rc == SQLITE_DONE) {
        if (self->statement->is_dml) {
            self->rowcount = (long)sqlite3_changes(self->connection->db);
        }
        (void)stmt_reset(self->statement);
        Ty_CLEAR(self->statement);
    }
    else if (rc != SQLITE_ROW) {
        set_error_from_db(self->connection->state, self->connection->db);
        (void)stmt_reset(self->statement);
        Ty_CLEAR(self->statement);
        Ty_DECREF(row);
        return NULL;
    }
    if (!Ty_IsNone(self->row_factory)) {
        TyObject *factory = self->row_factory;
        TyObject *args[] = { op, row, };
        TyObject *new_row = PyObject_Vectorcall(factory, args, 2, NULL);
        Ty_SETREF(row, new_row);
    }
    return row;
}

/*[clinic input]
_sqlite3.Cursor.fetchone as pysqlite_cursor_fetchone

Fetches one row from the resultset.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_fetchone_impl(pysqlite_Cursor *self)
/*[clinic end generated code: output=4bd2eabf5baaddb0 input=e78294ec5980fdba]*/
{
    TyObject* row;

    row = pysqlite_cursor_iternext((TyObject *)self);
    if (!row && !TyErr_Occurred()) {
        Py_RETURN_NONE;
    }

    return row;
}

/*[clinic input]
_sqlite3.Cursor.fetchmany as pysqlite_cursor_fetchmany

    size as maxrows: int(c_default='((pysqlite_Cursor *)self)->arraysize') = 1
        The default value is set by the Cursor.arraysize attribute.

Fetches several rows from the resultset.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_fetchmany_impl(pysqlite_Cursor *self, int maxrows)
/*[clinic end generated code: output=a8ef31fea64d0906 input=035dbe44a1005bf2]*/
{
    TyObject* row;
    TyObject* list;
    int counter = 0;

    list = TyList_New(0);
    if (!list) {
        return NULL;
    }

    while ((row = pysqlite_cursor_iternext((TyObject *)self))) {
        if (TyList_Append(list, row) < 0) {
            Ty_DECREF(row);
            break;
        }
        Ty_DECREF(row);

        if (++counter == maxrows) {
            break;
        }
    }

    if (TyErr_Occurred()) {
        Ty_DECREF(list);
        return NULL;
    } else {
        return list;
    }
}

/*[clinic input]
_sqlite3.Cursor.fetchall as pysqlite_cursor_fetchall

Fetches all rows from the resultset.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_fetchall_impl(pysqlite_Cursor *self)
/*[clinic end generated code: output=d5da12aca2da4b27 input=f5d401086a8df25a]*/
{
    TyObject* row;
    TyObject* list;

    list = TyList_New(0);
    if (!list) {
        return NULL;
    }

    while ((row = pysqlite_cursor_iternext((TyObject *)self))) {
        if (TyList_Append(list, row) < 0) {
            Ty_DECREF(row);
            break;
        }
        Ty_DECREF(row);
    }

    if (TyErr_Occurred()) {
        Ty_DECREF(list);
        return NULL;
    } else {
        return list;
    }
}

/*[clinic input]
_sqlite3.Cursor.setinputsizes as pysqlite_cursor_setinputsizes

    sizes: object
    /

Required by DB-API. Does nothing in sqlite3.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_setinputsizes_impl(pysqlite_Cursor *self, TyObject *sizes)
/*[clinic end generated code: output=a06c12790bd05f2e input=de7950a3aec79bdf]*/
{
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Cursor.setoutputsize as pysqlite_cursor_setoutputsize

    size: object
    column: object = None
    /

Required by DB-API. Does nothing in sqlite3.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_setoutputsize_impl(pysqlite_Cursor *self, TyObject *size,
                                   TyObject *column)
/*[clinic end generated code: output=018d7e9129d45efe input=607a6bece8bbb273]*/
{
    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.Cursor.close as pysqlite_cursor_close

Closes the cursor.
[clinic start generated code]*/

static TyObject *
pysqlite_cursor_close_impl(pysqlite_Cursor *self)
/*[clinic end generated code: output=b6055e4ec6fe63b6 input=08b36552dbb9a986]*/
{
    if (!check_cursor_locked(self)) {
        return NULL;
    }

    if (!self->connection) {
        TyTypeObject *tp = Ty_TYPE(self);
        pysqlite_state *state = pysqlite_get_state_by_type(tp);
        TyErr_SetString(state->ProgrammingError,
                        "Base Cursor.__init__ not called.");
        return NULL;
    }
    if (!pysqlite_check_thread(self->connection) || !pysqlite_check_connection(self->connection)) {
        return NULL;
    }

    if (self->statement) {
        (void)stmt_reset(self->statement);
        Ty_CLEAR(self->statement);
    }

    self->closed = 1;

    Py_RETURN_NONE;
}

static TyMethodDef cursor_methods[] = {
    PYSQLITE_CURSOR_CLOSE_METHODDEF
    PYSQLITE_CURSOR_EXECUTEMANY_METHODDEF
    PYSQLITE_CURSOR_EXECUTESCRIPT_METHODDEF
    PYSQLITE_CURSOR_EXECUTE_METHODDEF
    PYSQLITE_CURSOR_FETCHALL_METHODDEF
    PYSQLITE_CURSOR_FETCHMANY_METHODDEF
    PYSQLITE_CURSOR_FETCHONE_METHODDEF
    PYSQLITE_CURSOR_SETINPUTSIZES_METHODDEF
    PYSQLITE_CURSOR_SETOUTPUTSIZE_METHODDEF
    {NULL, NULL}
};

static struct TyMemberDef cursor_members[] =
{
    {"connection", _Ty_T_OBJECT, offsetof(pysqlite_Cursor, connection), Py_READONLY},
    {"description", _Ty_T_OBJECT, offsetof(pysqlite_Cursor, description), Py_READONLY},
    {"arraysize", Ty_T_INT, offsetof(pysqlite_Cursor, arraysize), 0},
    {"lastrowid", _Ty_T_OBJECT, offsetof(pysqlite_Cursor, lastrowid), Py_READONLY},
    {"rowcount", Ty_T_LONG, offsetof(pysqlite_Cursor, rowcount), Py_READONLY},
    {"row_factory", _Ty_T_OBJECT, offsetof(pysqlite_Cursor, row_factory), 0},
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(pysqlite_Cursor, in_weakreflist), Py_READONLY},
    {NULL}
};

static const char cursor_doc[] =
TyDoc_STR("SQLite database cursor class.");

static TyType_Slot cursor_slots[] = {
    {Ty_tp_dealloc, cursor_dealloc},
    {Ty_tp_doc, (void *)cursor_doc},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, pysqlite_cursor_iternext},
    {Ty_tp_methods, cursor_methods},
    {Ty_tp_members, cursor_members},
    {Ty_tp_init, pysqlite_cursor_init},
    {Ty_tp_traverse, cursor_traverse},
    {Ty_tp_clear, cursor_clear},
    {0, NULL},
};

static TyType_Spec cursor_spec = {
    .name = MODULE_NAME ".Cursor",
    .basicsize = sizeof(pysqlite_Cursor),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = cursor_slots,
};

int
pysqlite_cursor_setup_types(TyObject *module)
{
    TyObject *type = TyType_FromModuleAndSpec(module, &cursor_spec, NULL);
    if (type == NULL) {
        return -1;
    }
    pysqlite_state *state = pysqlite_get_state(module);
    state->CursorType = (TyTypeObject *)type;
    return 0;
}
