/* csv module */

/*

This module provides the low-level underpinnings of a CSV reading/writing
module.  Users should not use this module directly, but import the csv.py
module instead.

*/

// clinic/_csv.c.h uses internal pycore_modsupport.h API
#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_pyatomic_ft_wrappers.h"

#include <stddef.h>               // offsetof()
#include <stdbool.h>

/*[clinic input]
module _csv
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=385118b71aa43706]*/

#include "clinic/_csv.c.h"
#define NOT_SET ((Ty_UCS4)-1)
#define EOL ((Ty_UCS4)-2)


typedef struct {
    TyObject *error_obj;   /* CSV exception */
    TyObject *dialects;   /* Dialect registry */
    TyTypeObject *dialect_type;
    TyTypeObject *reader_type;
    TyTypeObject *writer_type;
    Ty_ssize_t field_limit;   /* max parsed field size */
    TyObject *str_write;
} _csvstate;

static struct TyModuleDef _csvmodule;

static inline _csvstate*
get_csv_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (_csvstate *)state;
}

static int
_csv_clear(TyObject *module)
{
    _csvstate *module_state = TyModule_GetState(module);
    Ty_CLEAR(module_state->error_obj);
    Ty_CLEAR(module_state->dialects);
    Ty_CLEAR(module_state->dialect_type);
    Ty_CLEAR(module_state->reader_type);
    Ty_CLEAR(module_state->writer_type);
    Ty_CLEAR(module_state->str_write);
    return 0;
}

static int
_csv_traverse(TyObject *module, visitproc visit, void *arg)
{
    _csvstate *module_state = TyModule_GetState(module);
    Ty_VISIT(module_state->error_obj);
    Ty_VISIT(module_state->dialects);
    Ty_VISIT(module_state->dialect_type);
    Ty_VISIT(module_state->reader_type);
    Ty_VISIT(module_state->writer_type);
    return 0;
}

static void
_csv_free(void *module)
{
    (void)_csv_clear((TyObject *)module);
}

typedef enum {
    START_RECORD, START_FIELD, ESCAPED_CHAR, IN_FIELD,
    IN_QUOTED_FIELD, ESCAPE_IN_QUOTED_FIELD, QUOTE_IN_QUOTED_FIELD,
    EAT_CRNL,AFTER_ESCAPED_CRNL
} ParserState;

typedef enum {
    QUOTE_MINIMAL, QUOTE_ALL, QUOTE_NONNUMERIC, QUOTE_NONE,
    QUOTE_STRINGS, QUOTE_NOTNULL
} QuoteStyle;

typedef struct {
    QuoteStyle style;
    const char *name;
} StyleDesc;

static const StyleDesc quote_styles[] = {
    { QUOTE_MINIMAL,    "QUOTE_MINIMAL" },
    { QUOTE_ALL,        "QUOTE_ALL" },
    { QUOTE_NONNUMERIC, "QUOTE_NONNUMERIC" },
    { QUOTE_NONE,       "QUOTE_NONE" },
    { QUOTE_STRINGS,    "QUOTE_STRINGS" },
    { QUOTE_NOTNULL,    "QUOTE_NOTNULL" },
    { 0 }
};

typedef struct {
    PyObject_HEAD

    char doublequote;           /* is " represented by ""? */
    char skipinitialspace;      /* ignore spaces following delimiter? */
    char strict;                /* raise exception on bad CSV */
    int quoting;                /* style of quoting to write */
    Ty_UCS4 delimiter;          /* field separator */
    Ty_UCS4 quotechar;          /* quote character */
    Ty_UCS4 escapechar;         /* escape character */
    TyObject *lineterminator;   /* string to write between records */

} DialectObj;

typedef struct {
    PyObject_HEAD

    TyObject *input_iter;   /* iterate over this for input lines */

    DialectObj *dialect;    /* parsing dialect */

    TyObject *fields;           /* field list for current record */
    ParserState state;          /* current CSV parse state */
    Ty_UCS4 *field;             /* temporary buffer */
    Ty_ssize_t field_size;      /* size of allocated buffer */
    Ty_ssize_t field_len;       /* length of current field */
    bool unquoted_field;        /* true if no quotes around the current field */
    unsigned long line_num;     /* Source-file line number */
} ReaderObj;

typedef struct {
    PyObject_HEAD

    TyObject *write;    /* write output lines to this file */

    DialectObj *dialect;    /* parsing dialect */

    Ty_UCS4 *rec;            /* buffer for parser.join */
    Ty_ssize_t rec_size;        /* size of allocated record */
    Ty_ssize_t rec_len;         /* length of record */
    int num_fields;             /* number of fields in record */

    TyObject *error_obj;       /* cached error object */
} WriterObj;

#define _DialectObj_CAST(op)    ((DialectObj *)(op))
#define _ReaderObj_CAST(op)     ((ReaderObj *)(op))
#define _WriterObj_CAST(op)     ((WriterObj *)(op))

/*
 * DIALECT class
 */

static TyObject *
get_dialect_from_registry(TyObject *name_obj, _csvstate *module_state)
{
    TyObject *dialect_obj;
    if (TyDict_GetItemRef(module_state->dialects, name_obj, &dialect_obj) == 0) {
        TyErr_SetString(module_state->error_obj, "unknown dialect");
    }
    return dialect_obj;
}

static TyObject *
get_char_or_None(Ty_UCS4 c)
{
    if (c == NOT_SET) {
        Py_RETURN_NONE;
    }
    else
        return TyUnicode_FromOrdinal(c);
}

static TyObject *
Dialect_get_lineterminator(TyObject *op, void *Py_UNUSED(ignored))
{
    DialectObj *self = _DialectObj_CAST(op);
    return Ty_XNewRef(self->lineterminator);
}

static TyObject *
Dialect_get_delimiter(TyObject *op, void *Py_UNUSED(ignored))
{
    DialectObj *self = _DialectObj_CAST(op);
    return get_char_or_None(self->delimiter);
}

static TyObject *
Dialect_get_escapechar(TyObject *op, void *Py_UNUSED(ignored))
{
    DialectObj *self = _DialectObj_CAST(op);
    return get_char_or_None(self->escapechar);
}

static TyObject *
Dialect_get_quotechar(TyObject *op, void *Py_UNUSED(ignored))
{
    DialectObj *self = _DialectObj_CAST(op);
    return get_char_or_None(self->quotechar);
}

static TyObject *
Dialect_get_quoting(TyObject *op, void *Py_UNUSED(ignored))
{
    DialectObj *self = _DialectObj_CAST(op);
    return TyLong_FromLong(self->quoting);
}

static int
_set_bool(const char *name, char *target, TyObject *src, bool dflt)
{
    if (src == NULL)
        *target = dflt;
    else {
        int b = PyObject_IsTrue(src);
        if (b < 0)
            return -1;
        *target = (char)b;
    }
    return 0;
}

static int
_set_int(const char *name, int *target, TyObject *src, int dflt)
{
    if (src == NULL)
        *target = dflt;
    else {
        int value;
        if (!TyLong_CheckExact(src)) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be an integer, not %T", name, src);
            return -1;
        }
        value = TyLong_AsInt(src);
        if (value == -1 && TyErr_Occurred()) {
            return -1;
        }
        *target = value;
    }
    return 0;
}

static int
_set_char_or_none(const char *name, Ty_UCS4 *target, TyObject *src, Ty_UCS4 dflt)
{
    if (src == NULL) {
        *target = dflt;
    }
    else if (src == Ty_None) {
        *target = NOT_SET;
    }
    else {
        // similar to TyArg_Parse("C?")
        if (!TyUnicode_Check(src)) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be a unicode character or None, not %T",
                         name, src);
            return -1;
        }
        Ty_ssize_t len = TyUnicode_GetLength(src);
        if (len < 0) {
            return -1;
        }
        if (len != 1) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be a unicode character or None, "
                         "not a string of length %zd",
                         name, len);
            return -1;
        }
        *target = TyUnicode_READ_CHAR(src, 0);
    }
    return 0;
}

static int
_set_char(const char *name, Ty_UCS4 *target, TyObject *src, Ty_UCS4 dflt)
{
    if (src == NULL) {
        *target = dflt;
    }
    else {
        // similar to TyArg_Parse("C")
        if (!TyUnicode_Check(src)) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be a unicode character, not %T",
                         name, src);
            return -1;
        }
        Ty_ssize_t len = TyUnicode_GetLength(src);
        if (len < 0) {
            return -1;
        }
        if (len != 1) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be a unicode character, "
                         "not a string of length %zd",
                         name, len);
            return -1;
        }
        *target = TyUnicode_READ_CHAR(src, 0);
    }
    return 0;
}

static int
_set_str(const char *name, TyObject **target, TyObject *src, const char *dflt)
{
    if (src == NULL)
        *target = TyUnicode_DecodeASCII(dflt, strlen(dflt), NULL);
    else {
        if (!TyUnicode_Check(src)) {
            TyErr_Format(TyExc_TypeError,
                         "\"%s\" must be a string, not %T", name, src);
            return -1;
        }
        Ty_XSETREF(*target, Ty_NewRef(src));
    }
    return 0;
}

static int
dialect_check_quoting(int quoting)
{
    const StyleDesc *qs;

    for (qs = quote_styles; qs->name; qs++) {
        if ((int)qs->style == quoting)
            return 0;
    }
    TyErr_Format(TyExc_TypeError, "bad \"quoting\" value");
    return -1;
}

static int
dialect_check_char(const char *name, Ty_UCS4 c, DialectObj *dialect, bool allowspace)
{
    if (c == '\r' || c == '\n' || (c == ' ' && !allowspace)) {
        TyErr_Format(TyExc_ValueError, "bad %s value", name);
        return -1;
    }
    if (TyUnicode_FindChar(
        dialect->lineterminator, c, 0,
        TyUnicode_GET_LENGTH(dialect->lineterminator), 1) >= 0)
    {
        TyErr_Format(TyExc_ValueError, "bad %s or lineterminator value", name);
        return -1;
    }
    return 0;
}

 static int
dialect_check_chars(const char *name1, const char *name2, Ty_UCS4 c1, Ty_UCS4 c2)
{
    if (c1 == c2 && c1 != NOT_SET) {
        TyErr_Format(TyExc_ValueError, "bad %s or %s value", name1, name2);
        return -1;
    }
    return 0;
}

#define D_OFF(x) offsetof(DialectObj, x)

static struct TyMemberDef Dialect_memberlist[] = {
    { "skipinitialspace",   Ty_T_BOOL, D_OFF(skipinitialspace), Py_READONLY },
    { "doublequote",        Ty_T_BOOL, D_OFF(doublequote), Py_READONLY },
    { "strict",             Ty_T_BOOL, D_OFF(strict), Py_READONLY },
    { NULL }
};

#undef D_OFF

static TyGetSetDef Dialect_getsetlist[] = {
    {"delimiter",          Dialect_get_delimiter},
    {"escapechar",         Dialect_get_escapechar},
    {"lineterminator",     Dialect_get_lineterminator},
    {"quotechar",          Dialect_get_quotechar},
    {"quoting",            Dialect_get_quoting},
    {NULL},
};

static void
Dialect_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    tp->tp_clear((TyObject *)self);
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static char *dialect_kws[] = {
    "dialect",
    "delimiter",
    "doublequote",
    "escapechar",
    "lineterminator",
    "quotechar",
    "quoting",
    "skipinitialspace",
    "strict",
    NULL
};

static _csvstate *
_csv_state_from_type(TyTypeObject *type, const char *name)
{
    TyObject *module = TyType_GetModuleByDef(type, &_csvmodule);
    if (module == NULL) {
        return NULL;
    }
    _csvstate *module_state = TyModule_GetState(module);
    if (module_state == NULL) {
        TyErr_Format(TyExc_SystemError,
                     "%s: No _csv module state found", name);
        return NULL;
    }
    return module_state;
}

static TyObject *
dialect_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    DialectObj *self;
    TyObject *ret = NULL;
    TyObject *dialect = NULL;
    TyObject *delimiter = NULL;
    TyObject *doublequote = NULL;
    TyObject *escapechar = NULL;
    TyObject *lineterminator = NULL;
    TyObject *quotechar = NULL;
    TyObject *quoting = NULL;
    TyObject *skipinitialspace = NULL;
    TyObject *strict = NULL;

    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "|OOOOOOOOO", dialect_kws,
                                     &dialect,
                                     &delimiter,
                                     &doublequote,
                                     &escapechar,
                                     &lineterminator,
                                     &quotechar,
                                     &quoting,
                                     &skipinitialspace,
                                     &strict))
        return NULL;

    _csvstate *module_state = _csv_state_from_type(type, "dialect_new");
    if (module_state == NULL) {
        return NULL;
    }

    if (dialect != NULL) {
        if (TyUnicode_Check(dialect)) {
            dialect = get_dialect_from_registry(dialect, module_state);
            if (dialect == NULL)
                return NULL;
        }
        else
            Ty_INCREF(dialect);
        /* Can we reuse this instance? */
        if (PyObject_TypeCheck(dialect, module_state->dialect_type) &&
            delimiter == NULL &&
            doublequote == NULL &&
            escapechar == NULL &&
            lineterminator == NULL &&
            quotechar == NULL &&
            quoting == NULL &&
            skipinitialspace == NULL &&
            strict == NULL)
            return dialect;
    }

    self = (DialectObj *)type->tp_alloc(type, 0);
    if (self == NULL) {
        Ty_CLEAR(dialect);
        return NULL;
    }
    self->lineterminator = NULL;

    Ty_XINCREF(delimiter);
    Ty_XINCREF(doublequote);
    Ty_XINCREF(escapechar);
    Ty_XINCREF(lineterminator);
    Ty_XINCREF(quotechar);
    Ty_XINCREF(quoting);
    Ty_XINCREF(skipinitialspace);
    Ty_XINCREF(strict);
    if (dialect != NULL) {
#define DIALECT_GETATTR(v, n)                            \
        do {                                             \
            if (v == NULL) {                             \
                v = PyObject_GetAttrString(dialect, n);  \
                if (v == NULL)                           \
                    TyErr_Clear();                       \
            }                                            \
        } while (0)
        DIALECT_GETATTR(delimiter, "delimiter");
        DIALECT_GETATTR(doublequote, "doublequote");
        DIALECT_GETATTR(escapechar, "escapechar");
        DIALECT_GETATTR(lineterminator, "lineterminator");
        DIALECT_GETATTR(quotechar, "quotechar");
        DIALECT_GETATTR(quoting, "quoting");
        DIALECT_GETATTR(skipinitialspace, "skipinitialspace");
        DIALECT_GETATTR(strict, "strict");
    }
#undef DIALECT_GETATTR

    /* check types and convert to C values */
#define DIASET(meth, name, target, src, dflt) \
    if (meth(name, target, src, dflt)) \
        goto err
    DIASET(_set_char, "delimiter", &self->delimiter, delimiter, ',');
    DIASET(_set_bool, "doublequote", &self->doublequote, doublequote, true);
    DIASET(_set_char_or_none, "escapechar", &self->escapechar, escapechar, NOT_SET);
    DIASET(_set_str, "lineterminator", &self->lineterminator, lineterminator, "\r\n");
    DIASET(_set_char_or_none, "quotechar", &self->quotechar, quotechar, '"');
    DIASET(_set_int, "quoting", &self->quoting, quoting, QUOTE_MINIMAL);
    DIASET(_set_bool, "skipinitialspace", &self->skipinitialspace, skipinitialspace, false);
    DIASET(_set_bool, "strict", &self->strict, strict, false);
#undef DIASET

    /* validate options */
    if (dialect_check_quoting(self->quoting))
        goto err;
    if (quotechar == Ty_None && quoting == NULL)
        self->quoting = QUOTE_NONE;
    if (self->quoting != QUOTE_NONE && self->quotechar == NOT_SET) {
        TyErr_SetString(TyExc_TypeError,
                        "quotechar must be set if quoting enabled");
        goto err;
    }
    if (dialect_check_char("delimiter", self->delimiter, self, true) ||
        dialect_check_char("escapechar", self->escapechar, self,
                           !self->skipinitialspace) ||
        dialect_check_char("quotechar", self->quotechar, self,
                           !self->skipinitialspace) ||
        dialect_check_chars("delimiter", "escapechar",
                            self->delimiter, self->escapechar) ||
        dialect_check_chars("delimiter", "quotechar",
                            self->delimiter, self->quotechar) ||
        dialect_check_chars("escapechar", "quotechar",
                            self->escapechar, self->quotechar))
    {
        goto err;
    }

    ret = Ty_NewRef(self);
err:
    Ty_CLEAR(self);
    Ty_CLEAR(dialect);
    Ty_CLEAR(delimiter);
    Ty_CLEAR(doublequote);
    Ty_CLEAR(escapechar);
    Ty_CLEAR(lineterminator);
    Ty_CLEAR(quotechar);
    Ty_CLEAR(quoting);
    Ty_CLEAR(skipinitialspace);
    Ty_CLEAR(strict);
    return ret;
}

/* Since dialect is now a heap type, it inherits pickling method for
 * protocol 0 and 1 from object, therefore it needs to be overridden */

TyDoc_STRVAR(dialect_reduce_doc, "raises an exception to avoid pickling");

static TyObject *
Dialect_reduce(TyObject *self, TyObject *args) {
    TyErr_Format(TyExc_TypeError,
        "cannot pickle '%.100s' instances", _TyType_Name(Ty_TYPE(self)));
    return NULL;
}

static struct TyMethodDef dialect_methods[] = {
    {"__reduce__", Dialect_reduce, METH_VARARGS, dialect_reduce_doc},
    {"__reduce_ex__", Dialect_reduce, METH_VARARGS, dialect_reduce_doc},
    {NULL, NULL}
};

TyDoc_STRVAR(Dialect_Type_doc,
"CSV dialect\n"
"\n"
"The Dialect type records CSV parsing and generation options.\n");

static int
Dialect_clear(TyObject *op)
{
    DialectObj *self = _DialectObj_CAST(op);
    Ty_CLEAR(self->lineterminator);
    return 0;
}

static int
Dialect_traverse(TyObject *op, visitproc visit, void *arg)
{
    DialectObj *self = _DialectObj_CAST(op);
    Ty_VISIT(self->lineterminator);
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static TyType_Slot Dialect_Type_slots[] = {
    {Ty_tp_doc, (char*)Dialect_Type_doc},
    {Ty_tp_members, Dialect_memberlist},
    {Ty_tp_getset, Dialect_getsetlist},
    {Ty_tp_new, dialect_new},
    {Ty_tp_methods, dialect_methods},
    {Ty_tp_dealloc, Dialect_dealloc},
    {Ty_tp_clear, Dialect_clear},
    {Ty_tp_traverse, Dialect_traverse},
    {0, NULL}
};

TyType_Spec Dialect_Type_spec = {
    .name = "_csv.Dialect",
    .basicsize = sizeof(DialectObj),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = Dialect_Type_slots,
};


/*
 * Return an instance of the dialect type, given a Python instance or kwarg
 * description of the dialect
 */
static TyObject *
_call_dialect(_csvstate *module_state, TyObject *dialect_inst, TyObject *kwargs)
{
    TyObject *type = (TyObject *)module_state->dialect_type;
    if (dialect_inst) {
        return PyObject_VectorcallDict(type, &dialect_inst, 1, kwargs);
    }
    else {
        return PyObject_VectorcallDict(type, NULL, 0, kwargs);
    }
}

/*
 * READER
 */
static int
parse_save_field(ReaderObj *self)
{
    int quoting = self->dialect->quoting;
    TyObject *field;

    if (self->unquoted_field &&
        self->field_len == 0 &&
        (quoting == QUOTE_NOTNULL || quoting == QUOTE_STRINGS))
    {
        field = Ty_NewRef(Ty_None);
    }
    else {
        field = TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND,
                                        (void *) self->field, self->field_len);
        if (field == NULL) {
            return -1;
        }
        if (self->unquoted_field &&
            self->field_len != 0 &&
            (quoting == QUOTE_NONNUMERIC || quoting == QUOTE_STRINGS))
        {
            TyObject *tmp = PyNumber_Float(field);
            Ty_DECREF(field);
            if (tmp == NULL) {
                return -1;
            }
            field = tmp;
        }
        self->field_len = 0;
    }
    if (TyList_Append(self->fields, field) < 0) {
        Ty_DECREF(field);
        return -1;
    }
    Ty_DECREF(field);
    return 0;
}

static int
parse_grow_buff(ReaderObj *self)
{
    assert((size_t)self->field_size <= PY_SSIZE_T_MAX / sizeof(Ty_UCS4));

    Ty_ssize_t field_size_new = self->field_size ? 2 * self->field_size : 4096;
    Ty_UCS4 *field_new = self->field;
    TyMem_Resize(field_new, Ty_UCS4, field_size_new);
    if (field_new == NULL) {
        TyErr_NoMemory();
        return 0;
    }
    self->field = field_new;
    self->field_size = field_size_new;
    return 1;
}

static int
parse_add_char(ReaderObj *self, _csvstate *module_state, Ty_UCS4 c)
{
    Ty_ssize_t field_limit = FT_ATOMIC_LOAD_SSIZE_RELAXED(module_state->field_limit);
    if (self->field_len >= field_limit) {
        TyErr_Format(module_state->error_obj,
                     "field larger than field limit (%zd)",
                     field_limit);
        return -1;
    }
    if (self->field_len == self->field_size && !parse_grow_buff(self))
        return -1;
    self->field[self->field_len++] = c;
    return 0;
}

static int
parse_process_char(ReaderObj *self, _csvstate *module_state, Ty_UCS4 c)
{
    DialectObj *dialect = self->dialect;

    switch (self->state) {
    case START_RECORD:
        /* start of record */
        if (c == EOL)
            /* empty line - return [] */
            break;
        else if (c == '\n' || c == '\r') {
            self->state = EAT_CRNL;
            break;
        }
        /* normal character - handle as START_FIELD */
        self->state = START_FIELD;
        _Ty_FALLTHROUGH;
    case START_FIELD:
        /* expecting field */
        self->unquoted_field = true;
        if (c == '\n' || c == '\r' || c == EOL) {
            /* save empty field - return [fields] */
            if (parse_save_field(self) < 0)
                return -1;
            self->state = (c == EOL ? START_RECORD : EAT_CRNL);
        }
        else if (c == dialect->quotechar &&
                 dialect->quoting != QUOTE_NONE) {
            /* start quoted field */
            self->unquoted_field = false;
            self->state = IN_QUOTED_FIELD;
        }
        else if (c == dialect->escapechar) {
            /* possible escaped character */
            self->state = ESCAPED_CHAR;
        }
        else if (c == ' ' && dialect->skipinitialspace)
            /* ignore spaces at start of field */
            ;
        else if (c == dialect->delimiter) {
            /* save empty field */
            if (parse_save_field(self) < 0)
                return -1;
        }
        else {
            /* begin new unquoted field */
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
            self->state = IN_FIELD;
        }
        break;

    case ESCAPED_CHAR:
        if (c == '\n' || c=='\r') {
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
            self->state = AFTER_ESCAPED_CRNL;
            break;
        }
        if (c == EOL)
            c = '\n';
        if (parse_add_char(self, module_state, c) < 0)
            return -1;
        self->state = IN_FIELD;
        break;

    case AFTER_ESCAPED_CRNL:
        if (c == EOL)
            break;
        _Ty_FALLTHROUGH;

    case IN_FIELD:
        /* in unquoted field */
        if (c == '\n' || c == '\r' || c == EOL) {
            /* end of line - return [fields] */
            if (parse_save_field(self) < 0)
                return -1;
            self->state = (c == EOL ? START_RECORD : EAT_CRNL);
        }
        else if (c == dialect->escapechar) {
            /* possible escaped character */
            self->state = ESCAPED_CHAR;
        }
        else if (c == dialect->delimiter) {
            /* save field - wait for new field */
            if (parse_save_field(self) < 0)
                return -1;
            self->state = START_FIELD;
        }
        else {
            /* normal character - save in field */
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
        }
        break;

    case IN_QUOTED_FIELD:
        /* in quoted field */
        if (c == EOL)
            ;
        else if (c == dialect->escapechar) {
            /* Possible escape character */
            self->state = ESCAPE_IN_QUOTED_FIELD;
        }
        else if (c == dialect->quotechar &&
                 dialect->quoting != QUOTE_NONE) {
            if (dialect->doublequote) {
                /* doublequote; " represented by "" */
                self->state = QUOTE_IN_QUOTED_FIELD;
            }
            else {
                /* end of quote part of field */
                self->state = IN_FIELD;
            }
        }
        else {
            /* normal character - save in field */
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
        }
        break;

    case ESCAPE_IN_QUOTED_FIELD:
        if (c == EOL)
            c = '\n';
        if (parse_add_char(self, module_state, c) < 0)
            return -1;
        self->state = IN_QUOTED_FIELD;
        break;

    case QUOTE_IN_QUOTED_FIELD:
        /* doublequote - seen a quote in a quoted field */
        if (dialect->quoting != QUOTE_NONE &&
            c == dialect->quotechar) {
            /* save "" as " */
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
            self->state = IN_QUOTED_FIELD;
        }
        else if (c == dialect->delimiter) {
            /* save field - wait for new field */
            if (parse_save_field(self) < 0)
                return -1;
            self->state = START_FIELD;
        }
        else if (c == '\n' || c == '\r' || c == EOL) {
            /* end of line - return [fields] */
            if (parse_save_field(self) < 0)
                return -1;
            self->state = (c == EOL ? START_RECORD : EAT_CRNL);
        }
        else if (!dialect->strict) {
            if (parse_add_char(self, module_state, c) < 0)
                return -1;
            self->state = IN_FIELD;
        }
        else {
            /* illegal */
            TyErr_Format(module_state->error_obj, "'%c' expected after '%c'",
                            dialect->delimiter,
                            dialect->quotechar);
            return -1;
        }
        break;

    case EAT_CRNL:
        if (c == '\n' || c == '\r')
            ;
        else if (c == EOL)
            self->state = START_RECORD;
        else {
            TyErr_Format(module_state->error_obj,
                         "new-line character seen in unquoted field - "
                         "do you need to open the file with newline=''?");
            return -1;
        }
        break;

    }
    return 0;
}

static int
parse_reset(ReaderObj *self)
{
    Ty_XSETREF(self->fields, TyList_New(0));
    if (self->fields == NULL)
        return -1;
    self->field_len = 0;
    self->state = START_RECORD;
    self->unquoted_field = false;
    return 0;
}

static TyObject *
Reader_iternext(TyObject *op)
{
    ReaderObj *self = _ReaderObj_CAST(op);

    TyObject *fields = NULL;
    Ty_UCS4 c;
    Ty_ssize_t pos, linelen;
    int kind;
    const void *data;
    TyObject *lineobj;

    _csvstate *module_state = _csv_state_from_type(Ty_TYPE(self),
                                                   "Reader.__next__");
    if (module_state == NULL) {
        return NULL;
    }

    if (parse_reset(self) < 0)
        return NULL;
    do {
        lineobj = TyIter_Next(self->input_iter);
        if (lineobj == NULL) {
            /* End of input OR exception */
            if (!TyErr_Occurred() && (self->field_len != 0 ||
                                      self->state == IN_QUOTED_FIELD)) {
                if (self->dialect->strict)
                    TyErr_SetString(module_state->error_obj,
                                    "unexpected end of data");
                else if (parse_save_field(self) >= 0)
                    break;
            }
            return NULL;
        }
        if (!TyUnicode_Check(lineobj)) {
            TyErr_Format(module_state->error_obj,
                         "iterator should return strings, "
                         "not %.200s "
                         "(the file should be opened in text mode)",
                         Ty_TYPE(lineobj)->tp_name
                );
            Ty_DECREF(lineobj);
            return NULL;
        }
        ++self->line_num;
        kind = TyUnicode_KIND(lineobj);
        data = TyUnicode_DATA(lineobj);
        pos = 0;
        linelen = TyUnicode_GET_LENGTH(lineobj);
        while (linelen--) {
            c = TyUnicode_READ(kind, data, pos);
            if (parse_process_char(self, module_state, c) < 0) {
                Ty_DECREF(lineobj);
                goto err;
            }
            pos++;
        }
        Ty_DECREF(lineobj);
        if (parse_process_char(self, module_state, EOL) < 0)
            goto err;
    } while (self->state != START_RECORD);

    fields = self->fields;
    self->fields = NULL;
err:
    return fields;
}

static void
Reader_dealloc(TyObject *op)
{
    ReaderObj *self = _ReaderObj_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)tp->tp_clear(op);
    if (self->field != NULL) {
        TyMem_Free(self->field);
        self->field = NULL;
    }
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static int
Reader_traverse(TyObject *op, visitproc visit, void *arg)
{
    ReaderObj *self = _ReaderObj_CAST(op);
    Ty_VISIT(self->dialect);
    Ty_VISIT(self->input_iter);
    Ty_VISIT(self->fields);
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static int
Reader_clear(TyObject *op)
{
    ReaderObj *self = _ReaderObj_CAST(op);
    Ty_CLEAR(self->dialect);
    Ty_CLEAR(self->input_iter);
    Ty_CLEAR(self->fields);
    return 0;
}

TyDoc_STRVAR(Reader_Type_doc,
"CSV reader\n"
"\n"
"Reader objects are responsible for reading and parsing tabular data\n"
"in CSV format.\n"
);

static struct TyMethodDef Reader_methods[] = {
    { NULL, NULL }
};
#define R_OFF(x) offsetof(ReaderObj, x)

static struct TyMemberDef Reader_memberlist[] = {
    { "dialect", _Ty_T_OBJECT, R_OFF(dialect), Py_READONLY },
    { "line_num", Ty_T_ULONG, R_OFF(line_num), Py_READONLY },
    { NULL }
};

#undef R_OFF


static TyType_Slot Reader_Type_slots[] = {
    {Ty_tp_doc, (char*)Reader_Type_doc},
    {Ty_tp_traverse, Reader_traverse},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, Reader_iternext},
    {Ty_tp_methods, Reader_methods},
    {Ty_tp_members, Reader_memberlist},
    {Ty_tp_clear, Reader_clear},
    {Ty_tp_dealloc, Reader_dealloc},
    {0, NULL}
};

TyType_Spec Reader_Type_spec = {
    .name = "_csv.reader",
    .basicsize = sizeof(ReaderObj),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = Reader_Type_slots
};


static TyObject *
csv_reader(TyObject *module, TyObject *args, TyObject *keyword_args)
{
    TyObject * iterator, * dialect = NULL;
    _csvstate *module_state = get_csv_state(module);
    ReaderObj * self = PyObject_GC_New(
        ReaderObj,
        module_state->reader_type);

    if (!self)
        return NULL;

    self->dialect = NULL;
    self->fields = NULL;
    self->input_iter = NULL;
    self->field = NULL;
    self->field_size = 0;
    self->line_num = 0;

    if (parse_reset(self) < 0) {
        Ty_DECREF(self);
        return NULL;
    }

    if (!TyArg_UnpackTuple(args, "reader", 1, 2, &iterator, &dialect)) {
        Ty_DECREF(self);
        return NULL;
    }
    self->input_iter = PyObject_GetIter(iterator);
    if (self->input_iter == NULL) {
        Ty_DECREF(self);
        return NULL;
    }
    self->dialect = (DialectObj *)_call_dialect(module_state, dialect,
                                                keyword_args);
    if (self->dialect == NULL) {
        Ty_DECREF(self);
        return NULL;
    }

    PyObject_GC_Track(self);
    return (TyObject *)self;
}

/*
 * WRITER
 */
/* ---------------------------------------------------------------- */
static void
join_reset(WriterObj *self)
{
    self->rec_len = 0;
    self->num_fields = 0;
}

#define MEM_INCR 32768

/* Calculate new record length or append field to record.  Return new
 * record length.
 */
static Ty_ssize_t
join_append_data(WriterObj *self, int field_kind, const void *field_data,
                 Ty_ssize_t field_len, int *quoted,
                 int copy_phase)
{
    DialectObj *dialect = self->dialect;
    Ty_ssize_t i;
    Ty_ssize_t rec_len;

#define INCLEN \
    do {\
        if (!copy_phase && rec_len == PY_SSIZE_T_MAX) {    \
            goto overflow; \
        } \
        rec_len++; \
    } while(0)

#define ADDCH(c)                                \
    do {\
        if (copy_phase) \
            self->rec[rec_len] = c;\
        INCLEN;\
    } while(0)

    rec_len = self->rec_len;

    /* If this is not the first field we need a field separator */
    if (self->num_fields > 0)
        ADDCH(dialect->delimiter);

    /* Handle preceding quote */
    if (copy_phase && *quoted)
        ADDCH(dialect->quotechar);

    /* Copy/count field data */
    /* If field is null just pass over */
    for (i = 0; field_data && (i < field_len); i++) {
        Ty_UCS4 c = TyUnicode_READ(field_kind, field_data, i);
        int want_escape = 0;

        if (c == dialect->delimiter ||
            c == dialect->escapechar ||
            c == dialect->quotechar  ||
            c == '\n'  ||
            c == '\r'  ||
            TyUnicode_FindChar(
                dialect->lineterminator, c, 0,
                TyUnicode_GET_LENGTH(dialect->lineterminator), 1) >= 0) {
            if (dialect->quoting == QUOTE_NONE)
                want_escape = 1;
            else {
                if (c == dialect->quotechar) {
                    if (dialect->doublequote)
                        ADDCH(dialect->quotechar);
                    else
                        want_escape = 1;
                }
                else if (c == dialect->escapechar) {
                    want_escape = 1;
                }
                if (!want_escape)
                    *quoted = 1;
            }
            if (want_escape) {
                if (dialect->escapechar == NOT_SET) {
                    TyErr_Format(self->error_obj,
                                 "need to escape, but no escapechar set");
                    return -1;
                }
                ADDCH(dialect->escapechar);
            }
        }
        /* Copy field character into record buffer.
         */
        ADDCH(c);
    }

    if (*quoted) {
        if (copy_phase)
            ADDCH(dialect->quotechar);
        else {
            INCLEN; /* starting quote */
            INCLEN; /* ending quote */
        }
    }
    return rec_len;

  overflow:
    TyErr_NoMemory();
    return -1;
#undef ADDCH
#undef INCLEN
}

static int
join_check_rec_size(WriterObj *self, Ty_ssize_t rec_len)
{
    assert(rec_len >= 0);

    if (rec_len > self->rec_size) {
        size_t rec_size_new = (size_t)(rec_len / MEM_INCR + 1) * MEM_INCR;
        Ty_UCS4 *rec_new = self->rec;
        TyMem_Resize(rec_new, Ty_UCS4, rec_size_new);
        if (rec_new == NULL) {
            TyErr_NoMemory();
            return 0;
        }
        self->rec = rec_new;
        self->rec_size = (Ty_ssize_t)rec_size_new;
    }
    return 1;
}

static int
join_append(WriterObj *self, TyObject *field, int quoted)
{
    DialectObj *dialect = self->dialect;
    int field_kind = -1;
    const void *field_data = NULL;
    Ty_ssize_t field_len = 0;
    Ty_ssize_t rec_len;

    if (field != NULL) {
        field_kind = TyUnicode_KIND(field);
        field_data = TyUnicode_DATA(field);
        field_len = TyUnicode_GET_LENGTH(field);
    }
    if (!field_len && dialect->delimiter == ' ' && dialect->skipinitialspace) {
        if (dialect->quoting == QUOTE_NONE ||
            (field == NULL &&
             (dialect->quoting == QUOTE_STRINGS ||
              dialect->quoting == QUOTE_NOTNULL)))
        {
            TyErr_Format(self->error_obj,
                         "empty field must be quoted if delimiter is a space "
                         "and skipinitialspace is true");
            return 0;
        }
        quoted = 1;
    }
    rec_len = join_append_data(self, field_kind, field_data, field_len,
                               &quoted, 0);
    if (rec_len < 0)
        return 0;

    /* grow record buffer if necessary */
    if (!join_check_rec_size(self, rec_len))
        return 0;

    self->rec_len = join_append_data(self, field_kind, field_data, field_len,
                                     &quoted, 1);
    self->num_fields++;

    return 1;
}

static int
join_append_lineterminator(WriterObj *self)
{
    Ty_ssize_t terminator_len, i;
    int term_kind;
    const void *term_data;

    terminator_len = TyUnicode_GET_LENGTH(self->dialect->lineterminator);
    if (terminator_len == -1)
        return 0;

    /* grow record buffer if necessary */
    if (!join_check_rec_size(self, self->rec_len + terminator_len))
        return 0;

    term_kind = TyUnicode_KIND(self->dialect->lineterminator);
    term_data = TyUnicode_DATA(self->dialect->lineterminator);
    for (i = 0; i < terminator_len; i++)
        self->rec[self->rec_len + i] = TyUnicode_READ(term_kind, term_data, i);
    self->rec_len += terminator_len;

    return 1;
}

TyDoc_STRVAR(csv_writerow_doc,
"writerow(iterable)\n"
"\n"
"Construct and write a CSV record from an iterable of fields.  Non-string\n"
"elements will be converted to string.");

static TyObject *
csv_writerow(TyObject *op, TyObject *seq)
{
    WriterObj *self = _WriterObj_CAST(op);
    DialectObj *dialect = self->dialect;
    TyObject *iter, *field, *line, *result;
    bool null_field = false;

    iter = PyObject_GetIter(seq);
    if (iter == NULL) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            TyErr_Format(self->error_obj,
                         "iterable expected, not %.200s",
                         Ty_TYPE(seq)->tp_name);
        }
        return NULL;
    }

    /* Join all fields in internal buffer.
     */
    join_reset(self);
    while ((field = TyIter_Next(iter))) {
        int append_ok;
        int quoted;

        switch (dialect->quoting) {
        case QUOTE_NONNUMERIC:
            quoted = !PyNumber_Check(field);
            break;
        case QUOTE_ALL:
            quoted = 1;
            break;
        case QUOTE_STRINGS:
            quoted = TyUnicode_Check(field);
            break;
        case QUOTE_NOTNULL:
            quoted = field != Ty_None;
            break;
        default:
            quoted = 0;
            break;
        }

        null_field = (field == Ty_None);
        if (TyUnicode_Check(field)) {
            append_ok = join_append(self, field, quoted);
            Ty_DECREF(field);
        }
        else if (null_field) {
            append_ok = join_append(self, NULL, quoted);
            Ty_DECREF(field);
        }
        else {
            TyObject *str;

            str = PyObject_Str(field);
            Ty_DECREF(field);
            if (str == NULL) {
                Ty_DECREF(iter);
                return NULL;
            }
            append_ok = join_append(self, str, quoted);
            Ty_DECREF(str);
        }
        if (!append_ok) {
            Ty_DECREF(iter);
            return NULL;
        }
    }
    Ty_DECREF(iter);
    if (TyErr_Occurred())
        return NULL;

    if (self->num_fields > 0 && self->rec_len == 0) {
        if (dialect->quoting == QUOTE_NONE ||
            (null_field &&
             (dialect->quoting == QUOTE_STRINGS ||
              dialect->quoting == QUOTE_NOTNULL)))
        {
            TyErr_Format(self->error_obj,
                "single empty field record must be quoted");
            return NULL;
        }
        self->num_fields--;
        if (!join_append(self, NULL, 1))
            return NULL;
    }

    /* Add line terminator.
     */
    if (!join_append_lineterminator(self)) {
        return NULL;
    }

    line = TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND,
                                     (void *) self->rec, self->rec_len);
    if (line == NULL) {
        return NULL;
    }
    result = PyObject_CallOneArg(self->write, line);
    Ty_DECREF(line);
    return result;
}

TyDoc_STRVAR(csv_writerows_doc,
"writerows(iterable of iterables)\n"
"\n"
"Construct and write a series of iterables to a csv file.  Non-string\n"
"elements will be converted to string.");

static TyObject *
csv_writerows(TyObject *self, TyObject *seqseq)
{
    TyObject *row_iter, *row_obj, *result;

    row_iter = PyObject_GetIter(seqseq);
    if (row_iter == NULL) {
        return NULL;
    }
    while ((row_obj = TyIter_Next(row_iter))) {
        result = csv_writerow(self, row_obj);
        Ty_DECREF(row_obj);
        if (!result) {
            Ty_DECREF(row_iter);
            return NULL;
        }
        else
             Ty_DECREF(result);
    }
    Ty_DECREF(row_iter);
    if (TyErr_Occurred())
        return NULL;
    Py_RETURN_NONE;
}

static struct TyMethodDef Writer_methods[] = {
    {"writerow", csv_writerow, METH_O, csv_writerow_doc},
    {"writerows", csv_writerows, METH_O, csv_writerows_doc},
    {NULL, NULL, 0, NULL}  /* sentinel */
};

#define W_OFF(x) offsetof(WriterObj, x)

static struct TyMemberDef Writer_memberlist[] = {
    { "dialect", _Ty_T_OBJECT, W_OFF(dialect), Py_READONLY },
    { NULL }
};

#undef W_OFF

static int
Writer_traverse(TyObject *op, visitproc visit, void *arg)
{
    WriterObj *self = _WriterObj_CAST(op);
    Ty_VISIT(self->dialect);
    Ty_VISIT(self->write);
    Ty_VISIT(self->error_obj);
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static int
Writer_clear(TyObject *op)
{
    WriterObj *self = _WriterObj_CAST(op);
    Ty_CLEAR(self->dialect);
    Ty_CLEAR(self->write);
    Ty_CLEAR(self->error_obj);
    return 0;
}

static void
Writer_dealloc(TyObject *op)
{
    WriterObj *self = _WriterObj_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    tp->tp_clear(op);
    if (self->rec != NULL) {
        TyMem_Free(self->rec);
    }
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

TyDoc_STRVAR(Writer_Type_doc,
"CSV writer\n"
"\n"
"Writer objects are responsible for generating tabular data\n"
"in CSV format from sequence input.\n"
);

static TyType_Slot Writer_Type_slots[] = {
    {Ty_tp_doc, (char*)Writer_Type_doc},
    {Ty_tp_traverse, Writer_traverse},
    {Ty_tp_clear, Writer_clear},
    {Ty_tp_dealloc, Writer_dealloc},
    {Ty_tp_methods, Writer_methods},
    {Ty_tp_members, Writer_memberlist},
    {0, NULL}
};

TyType_Spec Writer_Type_spec = {
    .name = "_csv.writer",
    .basicsize = sizeof(WriterObj),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = Writer_Type_slots,
};


static TyObject *
csv_writer(TyObject *module, TyObject *args, TyObject *keyword_args)
{
    TyObject * output_file, * dialect = NULL;
    _csvstate *module_state = get_csv_state(module);
    WriterObj * self = PyObject_GC_New(WriterObj, module_state->writer_type);

    if (!self)
        return NULL;

    self->dialect = NULL;
    self->write = NULL;

    self->rec = NULL;
    self->rec_size = 0;
    self->rec_len = 0;
    self->num_fields = 0;

    self->error_obj = Ty_NewRef(module_state->error_obj);

    if (!TyArg_UnpackTuple(args, "writer", 1, 2, &output_file, &dialect)) {
        Ty_DECREF(self);
        return NULL;
    }
    if (PyObject_GetOptionalAttr(output_file,
                             module_state->str_write,
                             &self->write) < 0) {
        Ty_DECREF(self);
        return NULL;
    }
    if (self->write == NULL || !PyCallable_Check(self->write)) {
        TyErr_SetString(TyExc_TypeError,
                        "argument 1 must have a \"write\" method");
        Ty_DECREF(self);
        return NULL;
    }
    self->dialect = (DialectObj *)_call_dialect(module_state, dialect,
                                                keyword_args);
    if (self->dialect == NULL) {
        Ty_DECREF(self);
        return NULL;
    }
    PyObject_GC_Track(self);
    return (TyObject *)self;
}

/*
 * DIALECT REGISTRY
 */

/*[clinic input]
_csv.list_dialects

Return a list of all known dialect names.

    names = csv.list_dialects()
[clinic start generated code]*/

static TyObject *
_csv_list_dialects_impl(TyObject *module)
/*[clinic end generated code: output=a5b92b215b006a6d input=8953943eb17d98ab]*/
{
    return TyDict_Keys(get_csv_state(module)->dialects);
}

static TyObject *
csv_register_dialect(TyObject *module, TyObject *args, TyObject *kwargs)
{
    TyObject *name_obj, *dialect_obj = NULL;
    _csvstate *module_state = get_csv_state(module);
    TyObject *dialect;

    if (!TyArg_UnpackTuple(args, "register_dialect", 1, 2, &name_obj, &dialect_obj))
        return NULL;
    if (!TyUnicode_Check(name_obj)) {
        TyErr_SetString(TyExc_TypeError,
                        "dialect name must be a string");
        return NULL;
    }
    dialect = _call_dialect(module_state, dialect_obj, kwargs);
    if (dialect == NULL)
        return NULL;
    if (TyDict_SetItem(module_state->dialects, name_obj, dialect) < 0) {
        Ty_DECREF(dialect);
        return NULL;
    }
    Ty_DECREF(dialect);
    Py_RETURN_NONE;
}


/*[clinic input]
_csv.unregister_dialect

    name: object

Delete the name/dialect mapping associated with a string name.

    csv.unregister_dialect(name)
[clinic start generated code]*/

static TyObject *
_csv_unregister_dialect_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=0813ebca6c058df4 input=6b5c1557bf60c7e7]*/
{
    _csvstate *module_state = get_csv_state(module);
    int rc = TyDict_Pop(module_state->dialects, name, NULL);
    if (rc < 0) {
        return NULL;
    }
    if (rc == 0) {
        TyErr_Format(module_state->error_obj, "unknown dialect");
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
_csv.get_dialect

    name: object

Return the dialect instance associated with name.

    dialect = csv.get_dialect(name)
[clinic start generated code]*/

static TyObject *
_csv_get_dialect_impl(TyObject *module, TyObject *name)
/*[clinic end generated code: output=aa988cd573bebebb input=edf9ddab32e448fb]*/
{
    return get_dialect_from_registry(name, get_csv_state(module));
}

/*[clinic input]
_csv.field_size_limit

    new_limit: object = NULL

Sets an upper limit on parsed fields.

    csv.field_size_limit([limit])

Returns old limit. If limit is not given, no new limit is set and
the old limit is returned
[clinic start generated code]*/

static TyObject *
_csv_field_size_limit_impl(TyObject *module, TyObject *new_limit)
/*[clinic end generated code: output=f2799ecd908e250b input=cec70e9226406435]*/
{
    _csvstate *module_state = get_csv_state(module);
    Ty_ssize_t old_limit = FT_ATOMIC_LOAD_SSIZE_RELAXED(module_state->field_limit);
    if (new_limit != NULL) {
        if (!TyLong_CheckExact(new_limit)) {
            TyErr_Format(TyExc_TypeError,
                         "limit must be an integer");
            return NULL;
        }
        Ty_ssize_t new_limit_value = TyLong_AsSsize_t(new_limit);
        if (new_limit_value == -1 && TyErr_Occurred()) {
            return NULL;
        }
        FT_ATOMIC_STORE_SSIZE_RELAXED(module_state->field_limit, new_limit_value);
    }
    return TyLong_FromSsize_t(old_limit);
}

static TyType_Slot error_slots[] = {
    {0, NULL},
};

TyType_Spec error_spec = {
    .name = "_csv.Error",
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .slots = error_slots,
};

/*
 * MODULE
 */

TyDoc_STRVAR(csv_module_doc, "CSV parsing and writing.\n");

TyDoc_STRVAR(csv_reader_doc,
"    csv_reader = reader(iterable [, dialect='excel']\n"
"                        [optional keyword args])\n"
"    for row in csv_reader:\n"
"        process(row)\n"
"\n"
"The \"iterable\" argument can be any object that returns a line\n"
"of input for each iteration, such as a file object or a list.  The\n"
"optional \"dialect\" parameter is discussed below.  The function\n"
"also accepts optional keyword arguments which override settings\n"
"provided by the dialect.\n"
"\n"
"The returned object is an iterator.  Each iteration returns a row\n"
"of the CSV file (which can span multiple input lines).\n");

TyDoc_STRVAR(csv_writer_doc,
"    csv_writer = csv.writer(fileobj [, dialect='excel']\n"
"                            [optional keyword args])\n"
"    for row in sequence:\n"
"        csv_writer.writerow(row)\n"
"\n"
"    [or]\n"
"\n"
"    csv_writer = csv.writer(fileobj [, dialect='excel']\n"
"                            [optional keyword args])\n"
"    csv_writer.writerows(rows)\n"
"\n"
"The \"fileobj\" argument can be any object that supports the file API.\n");

TyDoc_STRVAR(csv_register_dialect_doc,
"Create a mapping from a string name to a dialect class.\n"
"    dialect = csv.register_dialect(name[, dialect[, **fmtparams]])");

static struct TyMethodDef csv_methods[] = {
    { "reader", _PyCFunction_CAST(csv_reader),
        METH_VARARGS | METH_KEYWORDS, csv_reader_doc},
    { "writer", _PyCFunction_CAST(csv_writer),
        METH_VARARGS | METH_KEYWORDS, csv_writer_doc},
    { "register_dialect", _PyCFunction_CAST(csv_register_dialect),
        METH_VARARGS | METH_KEYWORDS, csv_register_dialect_doc},
    _CSV_LIST_DIALECTS_METHODDEF
    _CSV_UNREGISTER_DIALECT_METHODDEF
    _CSV_GET_DIALECT_METHODDEF
    _CSV_FIELD_SIZE_LIMIT_METHODDEF
    { NULL, NULL }
};

static int
csv_exec(TyObject *module) {
    const StyleDesc *style;
    TyObject *temp;
    _csvstate *module_state = get_csv_state(module);

    temp = TyType_FromModuleAndSpec(module, &Dialect_Type_spec, NULL);
    module_state->dialect_type = (TyTypeObject *)temp;
    if (TyModule_AddObjectRef(module, "Dialect", temp) < 0) {
        return -1;
    }

    temp = TyType_FromModuleAndSpec(module, &Reader_Type_spec, NULL);
    module_state->reader_type = (TyTypeObject *)temp;
    if (TyModule_AddObjectRef(module, "Reader", temp) < 0) {
        return -1;
    }

    temp = TyType_FromModuleAndSpec(module, &Writer_Type_spec, NULL);
    module_state->writer_type = (TyTypeObject *)temp;
    if (TyModule_AddObjectRef(module, "Writer", temp) < 0) {
        return -1;
    }

    /* Set the field limit */
    module_state->field_limit = 128 * 1024;

    /* Add _dialects dictionary */
    module_state->dialects = TyDict_New();
    if (TyModule_AddObjectRef(module, "_dialects", module_state->dialects) < 0) {
        return -1;
    }

    /* Add quote styles into dictionary */
    for (style = quote_styles; style->name; style++) {
        if (TyModule_AddIntConstant(module, style->name,
                                    style->style) == -1)
            return -1;
    }

    /* Add the CSV exception object to the module. */
    TyObject *bases = TyTuple_Pack(1, TyExc_Exception);
    if (bases == NULL) {
        return -1;
    }
    module_state->error_obj = TyType_FromModuleAndSpec(module, &error_spec,
                                                       bases);
    Ty_DECREF(bases);
    if (module_state->error_obj == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, (TyTypeObject *)module_state->error_obj) != 0) {
        return -1;
    }

    module_state->str_write = TyUnicode_InternFromString("write");
    if (module_state->str_write == NULL) {
        return -1;
    }
    return 0;
}

static PyModuleDef_Slot csv_slots[] = {
    {Ty_mod_exec, csv_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _csvmodule = {
    PyModuleDef_HEAD_INIT,
    "_csv",
    csv_module_doc,
    sizeof(_csvstate),
    csv_methods,
    csv_slots,
    _csv_traverse,
    _csv_clear,
    _csv_free
};

PyMODINIT_FUNC
PyInit__csv(void)
{
    return PyModuleDef_Init(&_csvmodule);
}
