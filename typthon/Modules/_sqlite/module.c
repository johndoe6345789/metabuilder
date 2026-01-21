/* module.c - the module itself
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

#include "connection.h"
#include "statement.h"
#include "cursor.h"
#include "prepare_protocol.h"
#include "microprotocols.h"
#include "row.h"
#include "blob.h"

#if SQLITE_VERSION_NUMBER < 3015002
#error "SQLite 3.15.2 or higher required"
#endif

#define clinic_state() (pysqlite_get_state(module))
#include "clinic/module.c.h"
#undef clinic_state

/*[clinic input]
module _sqlite3
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=81e330492d57488e]*/

/*
 * We create 'clinic/_sqlite3.connect.c.h' in connection.c, in order to
 * keep the signatures of sqlite3.Connection.__init__ and
 * sqlite3.connect() synchronised.
 */
#include "clinic/_sqlite3.connect.c.h"

static TyObject *
pysqlite_connect(TyObject *module, TyObject *const *args, Ty_ssize_t nargsf,
                 TyObject *kwnames)
{
    pysqlite_state *state = pysqlite_get_state(module);
    TyObject *factory = (TyObject *)state->ConnectionType;

    static const int FACTORY_POS = 5;
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (nargs > 1 && nargs <= 8) {
        if (TyErr_WarnEx(TyExc_DeprecationWarning,
                "Passing more than 1 positional argument to sqlite3.connect()"
                " is deprecated. Parameters 'timeout', 'detect_types', "
                "'isolation_level', 'check_same_thread', 'factory', "
                "'cached_statements' and 'uri' will become keyword-only "
                "parameters in Python 3.15.", 1))
        {
                return NULL;
        }
    }
    if (nargs > FACTORY_POS) {
        factory = args[FACTORY_POS];
    }
    else if (kwnames != NULL) {
        for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(kwnames); i++) {
            TyObject *item = TyTuple_GET_ITEM(kwnames, i);  // borrowed ref.
            if (TyUnicode_CompareWithASCIIString(item, "factory") == 0) {
                factory = args[nargs + i];
                break;
            }
        }
    }

    return PyObject_Vectorcall(factory, args, nargsf, kwnames);
}

/*[clinic input]
_sqlite3.complete_statement as pysqlite_complete_statement

    statement: str

Checks if a string contains a complete SQL statement.
[clinic start generated code]*/

static TyObject *
pysqlite_complete_statement_impl(TyObject *module, const char *statement)
/*[clinic end generated code: output=e55f1ff1952df558 input=ac45d257375bb828]*/
{
    if (sqlite3_complete(statement)) {
        return Ty_NewRef(Ty_True);
    } else {
        return Ty_NewRef(Ty_False);
    }
}

/*[clinic input]
_sqlite3.register_adapter as pysqlite_register_adapter

    type: object(type='TyTypeObject *')
    adapter as caster: object
    /

Register a function to adapt Python objects to SQLite values.
[clinic start generated code]*/

static TyObject *
pysqlite_register_adapter_impl(TyObject *module, TyTypeObject *type,
                               TyObject *caster)
/*[clinic end generated code: output=a287e8db18e8af23 input=29a5e0f213030242]*/
{
    int rc;

    /* a basic type is adapted; there's a performance optimization if that's not the case
     * (99 % of all usages) */
    if (type == &TyLong_Type || type == &TyFloat_Type
            || type == &TyUnicode_Type || type == &TyByteArray_Type) {
        pysqlite_state *state = pysqlite_get_state(module);
        state->BaseTypeAdapted = 1;
    }

    pysqlite_state *state = pysqlite_get_state(module);
    TyObject *protocol = (TyObject *)state->PrepareProtocolType;
    rc = pysqlite_microprotocols_add(state, type, protocol, caster);
    if (rc == -1) {
        return NULL;
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.register_converter as pysqlite_register_converter

    typename as orig_name: unicode
    converter as callable: object
    /

Register a function to convert SQLite values to Python objects.
[clinic start generated code]*/

static TyObject *
pysqlite_register_converter_impl(TyObject *module, TyObject *orig_name,
                                 TyObject *callable)
/*[clinic end generated code: output=a2f2bfeed7230062 input=159a444971b40378]*/
{
    TyObject* name = NULL;
    TyObject* retval = NULL;

    /* convert the name to upper case */
    pysqlite_state *state = pysqlite_get_state(module);
    name = PyObject_CallMethodNoArgs(orig_name, state->str_upper);
    if (!name) {
        goto error;
    }

    if (TyDict_SetItem(state->converters, name, callable) != 0) {
        goto error;
    }

    retval = Ty_NewRef(Ty_None);
error:
    Ty_XDECREF(name);
    return retval;
}

/*[clinic input]
_sqlite3.enable_callback_tracebacks as pysqlite_enable_callback_trace

    enable: int
    /

Enable or disable callback functions throwing errors to stderr.
[clinic start generated code]*/

static TyObject *
pysqlite_enable_callback_trace_impl(TyObject *module, int enable)
/*[clinic end generated code: output=4ff1d051c698f194 input=cb79d3581eb77c40]*/
{
    pysqlite_state *state = pysqlite_get_state(module);
    state->enable_callback_tracebacks = enable;

    Py_RETURN_NONE;
}

/*[clinic input]
_sqlite3.adapt as pysqlite_adapt

    obj: object
    proto: object(c_default='(TyObject *)clinic_state()->PrepareProtocolType') = PrepareProtocolType
    alt: object = NULL
    /

Adapt given object to given protocol.
[clinic start generated code]*/

static TyObject *
pysqlite_adapt_impl(TyObject *module, TyObject *obj, TyObject *proto,
                    TyObject *alt)
/*[clinic end generated code: output=0c3927c5fcd23dd9 input=a53dc9993e81e15f]*/
{
    pysqlite_state *state = pysqlite_get_state(module);
    return pysqlite_microprotocols_adapt(state, obj, proto, alt);
}

static int converters_init(TyObject* module)
{
    pysqlite_state *state = pysqlite_get_state(module);
    state->converters = TyDict_New();
    if (state->converters == NULL) {
        return -1;
    }

    return TyModule_AddObjectRef(module, "converters", state->converters);
}

static int
load_functools_lru_cache(TyObject *module)
{
    pysqlite_state *state = pysqlite_get_state(module);
    state->lru_cache = TyImport_ImportModuleAttrString("functools", "lru_cache");
    if (state->lru_cache == NULL) {
        return -1;
    }
    return 0;
}

static TyMethodDef module_methods[] = {
    PYSQLITE_ADAPT_METHODDEF
    PYSQLITE_COMPLETE_STATEMENT_METHODDEF
    {"connect", _PyCFunction_CAST(pysqlite_connect), METH_FASTCALL|METH_KEYWORDS, pysqlite_connect__doc__},
    PYSQLITE_ENABLE_CALLBACK_TRACE_METHODDEF
    PYSQLITE_REGISTER_ADAPTER_METHODDEF
    PYSQLITE_REGISTER_CONVERTER_METHODDEF
    {NULL, NULL}
};

/* SQLite C API result codes. See also:
 * - https://www.sqlite.org/c3ref/c_abort_rollback.html
 *
 * Note: the SQLite changelogs rarely mention new result codes, so in order to
 * keep the 'error_codes' table in sync with SQLite, we must manually inspect
 * sqlite3.h for every release.
 *
 * We keep the SQLITE_VERSION_NUMBER checks in order to easily declutter the
 * code when we adjust the SQLite version requirement.
 */
static const struct {
    const char *name;
    long value;
} error_codes[] = {
#define DECLARE_ERROR_CODE(code) {#code, code}
    // Primary result code list
    DECLARE_ERROR_CODE(SQLITE_ABORT),
    DECLARE_ERROR_CODE(SQLITE_AUTH),
    DECLARE_ERROR_CODE(SQLITE_BUSY),
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT),
    DECLARE_ERROR_CODE(SQLITE_CORRUPT),
    DECLARE_ERROR_CODE(SQLITE_DONE),
    DECLARE_ERROR_CODE(SQLITE_EMPTY),
    DECLARE_ERROR_CODE(SQLITE_ERROR),
    DECLARE_ERROR_CODE(SQLITE_FORMAT),
    DECLARE_ERROR_CODE(SQLITE_FULL),
    DECLARE_ERROR_CODE(SQLITE_INTERNAL),
    DECLARE_ERROR_CODE(SQLITE_INTERRUPT),
    DECLARE_ERROR_CODE(SQLITE_IOERR),
    DECLARE_ERROR_CODE(SQLITE_LOCKED),
    DECLARE_ERROR_CODE(SQLITE_MISMATCH),
    DECLARE_ERROR_CODE(SQLITE_MISUSE),
    DECLARE_ERROR_CODE(SQLITE_NOLFS),
    DECLARE_ERROR_CODE(SQLITE_NOMEM),
    DECLARE_ERROR_CODE(SQLITE_NOTADB),
    DECLARE_ERROR_CODE(SQLITE_NOTFOUND),
    DECLARE_ERROR_CODE(SQLITE_OK),
    DECLARE_ERROR_CODE(SQLITE_PERM),
    DECLARE_ERROR_CODE(SQLITE_PROTOCOL),
    DECLARE_ERROR_CODE(SQLITE_RANGE),
    DECLARE_ERROR_CODE(SQLITE_READONLY),
    DECLARE_ERROR_CODE(SQLITE_ROW),
    DECLARE_ERROR_CODE(SQLITE_SCHEMA),
    DECLARE_ERROR_CODE(SQLITE_TOOBIG),
    DECLARE_ERROR_CODE(SQLITE_NOTICE),
    DECLARE_ERROR_CODE(SQLITE_WARNING),
    // Extended result code list
    DECLARE_ERROR_CODE(SQLITE_ABORT_ROLLBACK),
    DECLARE_ERROR_CODE(SQLITE_BUSY_RECOVERY),
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_FULLPATH),
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_ISDIR),
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_NOTEMPDIR),
    DECLARE_ERROR_CODE(SQLITE_CORRUPT_VTAB),
    DECLARE_ERROR_CODE(SQLITE_IOERR_ACCESS),
    DECLARE_ERROR_CODE(SQLITE_IOERR_BLOCKED),
    DECLARE_ERROR_CODE(SQLITE_IOERR_CHECKRESERVEDLOCK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_CLOSE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_DELETE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_DELETE_NOENT),
    DECLARE_ERROR_CODE(SQLITE_IOERR_DIR_CLOSE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_DIR_FSYNC),
    DECLARE_ERROR_CODE(SQLITE_IOERR_FSTAT),
    DECLARE_ERROR_CODE(SQLITE_IOERR_FSYNC),
    DECLARE_ERROR_CODE(SQLITE_IOERR_LOCK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_NOMEM),
    DECLARE_ERROR_CODE(SQLITE_IOERR_RDLOCK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_READ),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SEEK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SHMLOCK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SHMMAP),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SHMOPEN),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SHMSIZE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_SHORT_READ),
    DECLARE_ERROR_CODE(SQLITE_IOERR_TRUNCATE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_UNLOCK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_WRITE),
    DECLARE_ERROR_CODE(SQLITE_LOCKED_SHAREDCACHE),
    DECLARE_ERROR_CODE(SQLITE_READONLY_CANTLOCK),
    DECLARE_ERROR_CODE(SQLITE_READONLY_RECOVERY),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_CHECK),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_COMMITHOOK),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_FOREIGNKEY),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_FUNCTION),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_NOTNULL),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_PRIMARYKEY),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_TRIGGER),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_UNIQUE),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_VTAB),
    DECLARE_ERROR_CODE(SQLITE_READONLY_ROLLBACK),
    DECLARE_ERROR_CODE(SQLITE_IOERR_MMAP),
    DECLARE_ERROR_CODE(SQLITE_NOTICE_RECOVER_ROLLBACK),
    DECLARE_ERROR_CODE(SQLITE_NOTICE_RECOVER_WAL),
    DECLARE_ERROR_CODE(SQLITE_BUSY_SNAPSHOT),
    DECLARE_ERROR_CODE(SQLITE_IOERR_GETTEMPPATH),
    DECLARE_ERROR_CODE(SQLITE_WARNING_AUTOINDEX),
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_CONVPATH),
    DECLARE_ERROR_CODE(SQLITE_IOERR_CONVPATH),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_ROWID),
    DECLARE_ERROR_CODE(SQLITE_READONLY_DBMOVED),
    DECLARE_ERROR_CODE(SQLITE_AUTH_USER),
    DECLARE_ERROR_CODE(SQLITE_IOERR_VNODE),
    DECLARE_ERROR_CODE(SQLITE_IOERR_AUTH),
    DECLARE_ERROR_CODE(SQLITE_OK_LOAD_PERMANENTLY),
#if SQLITE_VERSION_NUMBER >= 3021000
    DECLARE_ERROR_CODE(SQLITE_IOERR_BEGIN_ATOMIC),
    DECLARE_ERROR_CODE(SQLITE_IOERR_COMMIT_ATOMIC),
    DECLARE_ERROR_CODE(SQLITE_IOERR_ROLLBACK_ATOMIC),
#endif
#if SQLITE_VERSION_NUMBER >= 3022000
    DECLARE_ERROR_CODE(SQLITE_ERROR_MISSING_COLLSEQ),
    DECLARE_ERROR_CODE(SQLITE_ERROR_RETRY),
    DECLARE_ERROR_CODE(SQLITE_READONLY_CANTINIT),
    DECLARE_ERROR_CODE(SQLITE_READONLY_DIRECTORY),
#endif
#if SQLITE_VERSION_NUMBER >= 3024000
    DECLARE_ERROR_CODE(SQLITE_CORRUPT_SEQUENCE),
    DECLARE_ERROR_CODE(SQLITE_LOCKED_VTAB),
#endif
#if SQLITE_VERSION_NUMBER >= 3025000
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_DIRTYWAL),
    DECLARE_ERROR_CODE(SQLITE_ERROR_SNAPSHOT),
#endif
#if SQLITE_VERSION_NUMBER >= 3031000
    DECLARE_ERROR_CODE(SQLITE_CANTOPEN_SYMLINK),
    DECLARE_ERROR_CODE(SQLITE_CONSTRAINT_PINNED),
    DECLARE_ERROR_CODE(SQLITE_OK_SYMLINK),
#endif
#if SQLITE_VERSION_NUMBER >= 3032000
    DECLARE_ERROR_CODE(SQLITE_BUSY_TIMEOUT),
    DECLARE_ERROR_CODE(SQLITE_CORRUPT_INDEX),
    DECLARE_ERROR_CODE(SQLITE_IOERR_DATA),
#endif
#if SQLITE_VERSION_NUMBER >= 3034000
    DECLARE_ERROR_CODE(SQLITE_IOERR_CORRUPTFS),
#endif
#undef DECLARE_ERROR_CODE
    {NULL, 0},
};

static int
add_error_constants(TyObject *module)
{
    for (int i = 0; error_codes[i].name != NULL; i++) {
        const char *name = error_codes[i].name;
        const long value = error_codes[i].value;
        if (TyModule_AddIntConstant(module, name, value) < 0) {
            return -1;
        }
    }
    return 0;
}

const char *
pysqlite_error_name(int rc)
{
    for (int i = 0; error_codes[i].name != NULL; i++) {
        if (error_codes[i].value == rc) {
            return error_codes[i].name;
        }
    }
    // No error code matched.
    return NULL;
}

static int
add_integer_constants(TyObject *module) {
#define ADD_INT(ival)                                           \
    do {                                                        \
        if (TyModule_AddIntConstant(module, #ival, ival) < 0) { \
            return -1;                                          \
        }                                                       \
    } while (0);                                                \

    ADD_INT(PARSE_DECLTYPES);
    ADD_INT(PARSE_COLNAMES);
    ADD_INT(SQLITE_DENY);
    ADD_INT(SQLITE_IGNORE);
    ADD_INT(SQLITE_CREATE_INDEX);
    ADD_INT(SQLITE_CREATE_TABLE);
    ADD_INT(SQLITE_CREATE_TEMP_INDEX);
    ADD_INT(SQLITE_CREATE_TEMP_TABLE);
    ADD_INT(SQLITE_CREATE_TEMP_TRIGGER);
    ADD_INT(SQLITE_CREATE_TEMP_VIEW);
    ADD_INT(SQLITE_CREATE_TRIGGER);
    ADD_INT(SQLITE_CREATE_VIEW);
    ADD_INT(SQLITE_DELETE);
    ADD_INT(SQLITE_DROP_INDEX);
    ADD_INT(SQLITE_DROP_TABLE);
    ADD_INT(SQLITE_DROP_TEMP_INDEX);
    ADD_INT(SQLITE_DROP_TEMP_TABLE);
    ADD_INT(SQLITE_DROP_TEMP_TRIGGER);
    ADD_INT(SQLITE_DROP_TEMP_VIEW);
    ADD_INT(SQLITE_DROP_TRIGGER);
    ADD_INT(SQLITE_DROP_VIEW);
    ADD_INT(SQLITE_INSERT);
    ADD_INT(SQLITE_PRAGMA);
    ADD_INT(SQLITE_READ);
    ADD_INT(SQLITE_SELECT);
    ADD_INT(SQLITE_TRANSACTION);
    ADD_INT(SQLITE_UPDATE);
    ADD_INT(SQLITE_ATTACH);
    ADD_INT(SQLITE_DETACH);
    ADD_INT(SQLITE_ALTER_TABLE);
    ADD_INT(SQLITE_REINDEX);
    ADD_INT(SQLITE_ANALYZE);
    ADD_INT(SQLITE_CREATE_VTABLE);
    ADD_INT(SQLITE_DROP_VTABLE);
    ADD_INT(SQLITE_FUNCTION);
    ADD_INT(SQLITE_SAVEPOINT);
    ADD_INT(SQLITE_RECURSIVE);
    // Run-time limit categories
    ADD_INT(SQLITE_LIMIT_LENGTH);
    ADD_INT(SQLITE_LIMIT_SQL_LENGTH);
    ADD_INT(SQLITE_LIMIT_COLUMN);
    ADD_INT(SQLITE_LIMIT_EXPR_DEPTH);
    ADD_INT(SQLITE_LIMIT_COMPOUND_SELECT);
    ADD_INT(SQLITE_LIMIT_VDBE_OP);
    ADD_INT(SQLITE_LIMIT_FUNCTION_ARG);
    ADD_INT(SQLITE_LIMIT_ATTACHED);
    ADD_INT(SQLITE_LIMIT_LIKE_PATTERN_LENGTH);
    ADD_INT(SQLITE_LIMIT_VARIABLE_NUMBER);
    ADD_INT(SQLITE_LIMIT_TRIGGER_DEPTH);
    ADD_INT(SQLITE_LIMIT_WORKER_THREADS);

    /*
     * Database connection configuration options.
     * See https://www.sqlite.org/c3ref/c_dbconfig_defensive.html
     */
    ADD_INT(SQLITE_DBCONFIG_ENABLE_FKEY);
    ADD_INT(SQLITE_DBCONFIG_ENABLE_TRIGGER);
    ADD_INT(SQLITE_DBCONFIG_ENABLE_FTS3_TOKENIZER);
    ADD_INT(SQLITE_DBCONFIG_ENABLE_LOAD_EXTENSION);
#if SQLITE_VERSION_NUMBER >= 3016000
    ADD_INT(SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE);
#endif
#if SQLITE_VERSION_NUMBER >= 3020000
    ADD_INT(SQLITE_DBCONFIG_ENABLE_QPSG);
#endif
#if SQLITE_VERSION_NUMBER >= 3022000
    ADD_INT(SQLITE_DBCONFIG_TRIGGER_EQP);
#endif
#if SQLITE_VERSION_NUMBER >= 3024000
    ADD_INT(SQLITE_DBCONFIG_RESET_DATABASE);
#endif
#if SQLITE_VERSION_NUMBER >= 3026000
    ADD_INT(SQLITE_DBCONFIG_DEFENSIVE);
#endif
#if SQLITE_VERSION_NUMBER >= 3028000
    ADD_INT(SQLITE_DBCONFIG_WRITABLE_SCHEMA);
#endif
#if SQLITE_VERSION_NUMBER >= 3029000
    ADD_INT(SQLITE_DBCONFIG_DQS_DDL);
    ADD_INT(SQLITE_DBCONFIG_DQS_DML);
    ADD_INT(SQLITE_DBCONFIG_LEGACY_ALTER_TABLE);
#endif
#if SQLITE_VERSION_NUMBER >= 3030000
    ADD_INT(SQLITE_DBCONFIG_ENABLE_VIEW);
#endif
#if SQLITE_VERSION_NUMBER >= 3031000
    ADD_INT(SQLITE_DBCONFIG_LEGACY_FILE_FORMAT);
    ADD_INT(SQLITE_DBCONFIG_TRUSTED_SCHEMA);
#endif
#undef ADD_INT
    return 0;
}

/* Convert SQLite default threading mode (as set by the compile-time constant
 * SQLITE_THREADSAFE) to the corresponding DB-API 2.0 (PEP 249) threadsafety
 * level. */
static int
get_threadsafety(pysqlite_state *state)
{
    int mode = sqlite3_threadsafe();
    switch (mode) {
    case 0:        // Single-thread mode; threads may not share the module.
        return 0;
    case 1:        // Serialized mode; threads may share the module,
        return 3;  // connections, and cursors.
    case 2:        // Multi-thread mode; threads may share the module, but not
        return 1;  // connections.
    default:
        TyErr_Format(state->InterfaceError,
                     "Unable to interpret SQLite threadsafety mode. Got %d, "
                     "expected 0, 1, or 2", mode);
        return -1;
    }
}

static int
module_traverse(TyObject *module, visitproc visit, void *arg)
{
    pysqlite_state *state = pysqlite_get_state(module);

    // Exceptions
    Ty_VISIT(state->DataError);
    Ty_VISIT(state->DatabaseError);
    Ty_VISIT(state->Error);
    Ty_VISIT(state->IntegrityError);
    Ty_VISIT(state->InterfaceError);
    Ty_VISIT(state->InternalError);
    Ty_VISIT(state->NotSupportedError);
    Ty_VISIT(state->OperationalError);
    Ty_VISIT(state->ProgrammingError);
    Ty_VISIT(state->Warning);

    // Types
    Ty_VISIT(state->BlobType);
    Ty_VISIT(state->ConnectionType);
    Ty_VISIT(state->CursorType);
    Ty_VISIT(state->PrepareProtocolType);
    Ty_VISIT(state->RowType);
    Ty_VISIT(state->StatementType);

    // Misc
    Ty_VISIT(state->converters);
    Ty_VISIT(state->lru_cache);
    Ty_VISIT(state->psyco_adapters);

    return 0;
}

static int
module_clear(TyObject *module)
{
    pysqlite_state *state = pysqlite_get_state(module);

    // Exceptions
    Ty_CLEAR(state->DataError);
    Ty_CLEAR(state->DatabaseError);
    Ty_CLEAR(state->Error);
    Ty_CLEAR(state->IntegrityError);
    Ty_CLEAR(state->InterfaceError);
    Ty_CLEAR(state->InternalError);
    Ty_CLEAR(state->NotSupportedError);
    Ty_CLEAR(state->OperationalError);
    Ty_CLEAR(state->ProgrammingError);
    Ty_CLEAR(state->Warning);

    // Types
    Ty_CLEAR(state->BlobType);
    Ty_CLEAR(state->ConnectionType);
    Ty_CLEAR(state->CursorType);
    Ty_CLEAR(state->PrepareProtocolType);
    Ty_CLEAR(state->RowType);
    Ty_CLEAR(state->StatementType);

    // Misc
    Ty_CLEAR(state->converters);
    Ty_CLEAR(state->lru_cache);
    Ty_CLEAR(state->psyco_adapters);

    // Interned strings
    Ty_CLEAR(state->str___adapt__);
    Ty_CLEAR(state->str___conform__);
    Ty_CLEAR(state->str_executescript);
    Ty_CLEAR(state->str_finalize);
    Ty_CLEAR(state->str_inverse);
    Ty_CLEAR(state->str_step);
    Ty_CLEAR(state->str_upper);
    Ty_CLEAR(state->str_value);

    return 0;
}

static void
module_free(void *module)
{
    (void)module_clear((TyObject *)module);
}

#define ADD_TYPE(module, type)                 \
do {                                           \
    if (TyModule_AddType(module, type) < 0) {  \
        goto error;                            \
    }                                          \
} while (0)

#define ADD_EXCEPTION(module, state, exc, base)                        \
do {                                                                   \
    state->exc = TyErr_NewException(MODULE_NAME "." #exc, base, NULL); \
    if (state->exc == NULL) {                                          \
        goto error;                                                    \
    }                                                                  \
    ADD_TYPE(module, (TyTypeObject *)state->exc);                      \
} while (0)

#define ADD_INTERNED(state, string)                      \
do {                                                     \
    TyObject *tmp = TyUnicode_InternFromString(#string); \
    if (tmp == NULL) {                                   \
        goto error;                                      \
    }                                                    \
    state->str_ ## string = tmp;                         \
} while (0)

static int
module_exec(TyObject *module)
{
    if (sqlite3_libversion_number() < 3015002) {
        TyErr_SetString(TyExc_ImportError, MODULE_NAME ": SQLite 3.15.2 or higher required");
        return -1;
    }

    int rc = sqlite3_initialize();
    if (rc != SQLITE_OK) {
        TyErr_SetString(TyExc_ImportError, sqlite3_errstr(rc));
        return -1;
    }

    if ((pysqlite_row_setup_types(module) < 0) ||
        (pysqlite_cursor_setup_types(module) < 0) ||
        (pysqlite_connection_setup_types(module) < 0) ||
        (pysqlite_statement_setup_types(module) < 0) ||
        (pysqlite_prepare_protocol_setup_types(module) < 0) ||
        (pysqlite_blob_setup_types(module) < 0)
       ) {
        goto error;
    }

    pysqlite_state *state = pysqlite_get_state(module);
    ADD_TYPE(module, state->BlobType);
    ADD_TYPE(module, state->ConnectionType);
    ADD_TYPE(module, state->CursorType);
    ADD_TYPE(module, state->PrepareProtocolType);
    ADD_TYPE(module, state->RowType);

    /*** Create DB-API Exception hierarchy */
    ADD_EXCEPTION(module, state, Error, TyExc_Exception);
    ADD_EXCEPTION(module, state, Warning, TyExc_Exception);

    /* Error subclasses */
    ADD_EXCEPTION(module, state, InterfaceError, state->Error);
    ADD_EXCEPTION(module, state, DatabaseError, state->Error);

    /* DatabaseError subclasses */
    ADD_EXCEPTION(module, state, InternalError, state->DatabaseError);
    ADD_EXCEPTION(module, state, OperationalError, state->DatabaseError);
    ADD_EXCEPTION(module, state, ProgrammingError, state->DatabaseError);
    ADD_EXCEPTION(module, state, IntegrityError, state->DatabaseError);
    ADD_EXCEPTION(module, state, DataError, state->DatabaseError);
    ADD_EXCEPTION(module, state, NotSupportedError, state->DatabaseError);

    /* Add interned strings */
    ADD_INTERNED(state, __adapt__);
    ADD_INTERNED(state, __conform__);
    ADD_INTERNED(state, executescript);
    ADD_INTERNED(state, finalize);
    ADD_INTERNED(state, inverse);
    ADD_INTERNED(state, step);
    ADD_INTERNED(state, upper);
    ADD_INTERNED(state, value);

    /* Set error constants */
    if (add_error_constants(module) < 0) {
        goto error;
    }

    /* Set integer constants */
    if (add_integer_constants(module) < 0) {
        goto error;
    }

    if (TyModule_AddStringConstant(module, "sqlite_version", sqlite3_libversion())) {
        goto error;
    }

    if (TyModule_AddIntMacro(module, LEGACY_TRANSACTION_CONTROL) < 0) {
        goto error;
    }

    int threadsafety = get_threadsafety(state);
    if (threadsafety < 0) {
        goto error;
    }
    if (TyModule_AddIntConstant(module, "threadsafety", threadsafety) < 0) {
        goto error;
    }

    /* initialize microprotocols layer */
    if (pysqlite_microprotocols_init(module) < 0) {
        goto error;
    }

    /* initialize the default converters */
    if (converters_init(module) < 0) {
        goto error;
    }

    if (load_functools_lru_cache(module) < 0) {
        goto error;
    }

    return 0;

error:
    sqlite3_shutdown();
    return -1;
}

static struct PyModuleDef_Slot module_slots[] = {
    {Ty_mod_exec, module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

struct TyModuleDef _sqlite3module = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_sqlite3",
    .m_size = sizeof(pysqlite_state),
    .m_methods = module_methods,
    .m_slots = module_slots,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free,
};

PyMODINIT_FUNC
PyInit__sqlite3(void)
{
    return PyModuleDef_Init(&_sqlite3module);
}
