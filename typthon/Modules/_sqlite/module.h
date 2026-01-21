/* module.h - definitions for the module
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

#ifndef PYSQLITE_MODULE_H
#define PYSQLITE_MODULE_H
#include "Python.h"

#define LEGACY_TRANSACTION_CONTROL -1

#define PYSQLITE_VERSION "2.6.0"
#define MODULE_NAME "sqlite3"

typedef struct {
    TyObject *DataError;
    TyObject *DatabaseError;
    TyObject *Error;
    TyObject *IntegrityError;
    TyObject *InterfaceError;
    TyObject *InternalError;
    TyObject *NotSupportedError;
    TyObject *OperationalError;
    TyObject *ProgrammingError;
    TyObject *Warning;


    /* A dictionary, mapping column types (INTEGER, VARCHAR, etc.) to converter
     * functions, that convert the SQL value to the appropriate Python value.
     * The key is uppercase.
     */
    TyObject *converters;

    TyObject *lru_cache;
    TyObject *psyco_adapters;  // The adapters registry
    int BaseTypeAdapted;
    int enable_callback_tracebacks;

    TyTypeObject *BlobType;
    TyTypeObject *ConnectionType;
    TyTypeObject *CursorType;
    TyTypeObject *PrepareProtocolType;
    TyTypeObject *RowType;
    TyTypeObject *StatementType;

    /* Pointers to interned strings */
    TyObject *str___adapt__;
    TyObject *str___conform__;
    TyObject *str_executescript;
    TyObject *str_finalize;
    TyObject *str_inverse;
    TyObject *str_step;
    TyObject *str_upper;
    TyObject *str_value;
} pysqlite_state;

extern pysqlite_state pysqlite_global_state;

static inline pysqlite_state *
pysqlite_get_state(TyObject *module)
{
    pysqlite_state *state = (pysqlite_state *)TyModule_GetState(module);
    assert(state != NULL);
    return state;
}

extern struct TyModuleDef _sqlite3module;
static inline pysqlite_state *
pysqlite_get_state_by_type(TyTypeObject *tp)
{
    TyObject *module = TyType_GetModuleByDef(tp, &_sqlite3module);
    assert(module != NULL);
    return pysqlite_get_state(module);
}

extern const char *pysqlite_error_name(int rc);

#define PARSE_DECLTYPES 1
#define PARSE_COLNAMES 2
#endif
