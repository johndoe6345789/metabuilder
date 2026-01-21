/* util.c - various utility functions
 *
 * Copyright (C) 2005-2010 Gerhard Häring <gh@ghaering.de>
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
#include "pycore_long.h"          // _TyLong_AsByteArray()
#include "connection.h"

// Returns non-NULL if a new exception should be raised
static TyObject *
get_exception_class(pysqlite_state *state, int errorcode)
{
    switch (errorcode) {
        case SQLITE_OK:
            TyErr_Clear();
            return NULL;
        case SQLITE_INTERNAL:
        case SQLITE_NOTFOUND:
            return state->InternalError;
        case SQLITE_NOMEM:
            return TyErr_NoMemory();
        case SQLITE_ERROR:
        case SQLITE_PERM:
        case SQLITE_ABORT:
        case SQLITE_BUSY:
        case SQLITE_LOCKED:
        case SQLITE_READONLY:
        case SQLITE_INTERRUPT:
        case SQLITE_IOERR:
        case SQLITE_FULL:
        case SQLITE_CANTOPEN:
        case SQLITE_PROTOCOL:
        case SQLITE_EMPTY:
        case SQLITE_SCHEMA:
            return state->OperationalError;
        case SQLITE_CORRUPT:
            return state->DatabaseError;
        case SQLITE_TOOBIG:
            return state->DataError;
        case SQLITE_CONSTRAINT:
        case SQLITE_MISMATCH:
            return state->IntegrityError;
        case SQLITE_MISUSE:
        case SQLITE_RANGE:
            return state->InterfaceError;
        default:
            return state->DatabaseError;
    }
}

static void
raise_exception(TyObject *type, int errcode, const char *errmsg)
{
    TyObject *exc = NULL;
    TyObject *args[] = { TyUnicode_FromString(errmsg), };
    if (args[0] == NULL) {
        goto exit;
    }
    exc = PyObject_Vectorcall(type, args, 1, NULL);
    Ty_DECREF(args[0]);
    if (exc == NULL) {
        goto exit;
    }

    TyObject *code = TyLong_FromLong(errcode);
    if (code == NULL) {
        goto exit;
    }
    int rc = PyObject_SetAttrString(exc, "sqlite_errorcode", code);
    Ty_DECREF(code);
    if (rc < 0) {
        goto exit;
    }

    const char *error_name = pysqlite_error_name(errcode);
    TyObject *name;
    if (error_name) {
        name = TyUnicode_FromString(error_name);
    }
    else {
        name = TyUnicode_InternFromString("unknown");
    }
    if (name == NULL) {
        goto exit;
    }
    rc = PyObject_SetAttrString(exc, "sqlite_errorname", name);
    Ty_DECREF(name);
    if (rc < 0) {
        goto exit;
    }

    TyErr_SetObject(type, exc);

exit:
    Ty_XDECREF(exc);
}

void
set_error_from_code(pysqlite_state *state, int code)
{
    TyObject *exc_class = get_exception_class(state, code);
    if (exc_class == NULL) {
        // No new exception need be raised.
        return;
    }

    const char *errmsg = sqlite3_errstr(code);
    assert(errmsg != NULL);
    raise_exception(exc_class, code, errmsg);
}

/**
 * Checks the SQLite error code and sets the appropriate DB-API exception.
 */
void
set_error_from_db(pysqlite_state *state, sqlite3 *db)
{
    int errorcode = sqlite3_errcode(db);
    TyObject *exc_class = get_exception_class(state, errorcode);
    if (exc_class == NULL) {
        // No new exception need be raised.
        return;
    }

    /* Create and set the exception. */
    int extended_errcode = sqlite3_extended_errcode(db);
    // sqlite3_errmsg() always returns an UTF-8 encoded message
    const char *errmsg = sqlite3_errmsg(db);
    raise_exception(exc_class, extended_errcode, errmsg);
}

#ifdef WORDS_BIGENDIAN
# define IS_LITTLE_ENDIAN 0
#else
# define IS_LITTLE_ENDIAN 1
#endif

sqlite_int64
_pysqlite_long_as_int64(TyObject * py_val)
{
    int overflow;
    long long value = TyLong_AsLongLongAndOverflow(py_val, &overflow);
    if (value == -1 && TyErr_Occurred())
        return -1;
    if (!overflow) {
# if SIZEOF_LONG_LONG > 8
        if (-0x8000000000000000LL <= value && value <= 0x7FFFFFFFFFFFFFFFLL)
# endif
            return value;
    }
    else if (sizeof(value) < sizeof(sqlite_int64)) {
        sqlite_int64 int64val;
        if (_TyLong_AsByteArray((PyLongObject *)py_val,
                                (unsigned char *)&int64val, sizeof(int64val),
                                IS_LITTLE_ENDIAN, 1 /* signed */, 0) >= 0) {
            return int64val;
        }
    }
    TyErr_SetString(TyExc_OverflowError,
                    "Python int too large to convert to SQLite INTEGER");
    return -1;
}
