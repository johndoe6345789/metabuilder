#include <stddef.h>               // ptrdiff_t

#include "parts.h"
#include "util.h"

/* Test TyUnicode_New() */
static TyObject *
unicode_new(TyObject *self, TyObject *args)
{
    Ty_ssize_t size;
    unsigned int maxchar;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "nI", &size, &maxchar)) {
        return NULL;
    }

    result = TyUnicode_New(size, (Ty_UCS4)maxchar);
    if (!result) {
        return NULL;
    }
    if (size > 0 && maxchar <= 0x10ffff &&
        TyUnicode_Fill(result, 0, size, (Ty_UCS4)maxchar) < 0)
    {
        Ty_DECREF(result);
        return NULL;
    }
    return result;
}


static TyObject *
unicode_copy(TyObject *unicode)
{
    TyObject *copy;

    if (!unicode) {
        return NULL;
    }
    if (!TyUnicode_Check(unicode)) {
        Ty_INCREF(unicode);
        return unicode;
    }

    copy = TyUnicode_New(TyUnicode_GET_LENGTH(unicode),
                         TyUnicode_MAX_CHAR_VALUE(unicode));
    if (!copy) {
        return NULL;
    }
    if (TyUnicode_CopyCharacters(copy, 0, unicode,
                                 0, TyUnicode_GET_LENGTH(unicode)) < 0)
    {
        Ty_DECREF(copy);
        return NULL;
    }
    return copy;
}


/* Test TyUnicode_Fill() */
static TyObject *
unicode_fill(TyObject *self, TyObject *args)
{
    TyObject *to, *to_copy;
    Ty_ssize_t start, length, filled;
    unsigned int fill_char;

    if (!TyArg_ParseTuple(args, "OnnI", &to, &start, &length, &fill_char)) {
        return NULL;
    }

    NULLABLE(to);
    if (!(to_copy = unicode_copy(to)) && to) {
        return NULL;
    }

    filled = TyUnicode_Fill(to_copy, start, length, (Ty_UCS4)fill_char);
    if (filled == -1 && TyErr_Occurred()) {
        Ty_DECREF(to_copy);
        return NULL;
    }
    return Ty_BuildValue("(Nn)", to_copy, filled);
}


/* Test TyUnicode_FromKindAndData() */
static TyObject *
unicode_fromkindanddata(TyObject *self, TyObject *args)
{
    int kind;
    void *buffer;
    Ty_ssize_t bsize;
    Ty_ssize_t size = -100;

    if (!TyArg_ParseTuple(args, "iz#|n", &kind, &buffer, &bsize, &size)) {
        return NULL;
    }

    if (size == -100) {
        size = bsize;
    }
    if (kind && size % kind) {
        TyErr_SetString(TyExc_AssertionError,
                        "invalid size in unicode_fromkindanddata()");
        return NULL;
    }
    return TyUnicode_FromKindAndData(kind, buffer, kind ? size / kind : 0);
}


// Test TyUnicode_AsUCS4().
// Part of the limited C API, but the test needs TyUnicode_FromKindAndData().
static TyObject *
unicode_asucs4(TyObject *self, TyObject *args)
{
    TyObject *unicode, *result;
    Ty_UCS4 *buffer;
    int copy_null;
    Ty_ssize_t str_len, buf_len;

    if (!TyArg_ParseTuple(args, "Onp:unicode_asucs4", &unicode, &str_len, &copy_null)) {
        return NULL;
    }

    NULLABLE(unicode);
    buf_len = str_len + 1;
    buffer = TyMem_NEW(Ty_UCS4, buf_len);
    if (buffer == NULL) {
        return TyErr_NoMemory();
    }
    memset(buffer, 0, sizeof(Ty_UCS4)*buf_len);
    buffer[str_len] = 0xffffU;

    if (!TyUnicode_AsUCS4(unicode, buffer, buf_len, copy_null)) {
        TyMem_Free(buffer);
        return NULL;
    }

    result = TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND, buffer, buf_len);
    TyMem_Free(buffer);
    return result;
}


// Test TyUnicode_AsUCS4Copy().
// Part of the limited C API, but the test needs TyUnicode_FromKindAndData().
static TyObject *
unicode_asucs4copy(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_UCS4 *buffer;
    TyObject *result;

    if (!TyArg_ParseTuple(args, "O", &unicode)) {
        return NULL;
    }

    NULLABLE(unicode);
    buffer = TyUnicode_AsUCS4Copy(unicode);
    if (buffer == NULL) {
        return NULL;
    }
    result = TyUnicode_FromKindAndData(TyUnicode_4BYTE_KIND,
                                       buffer,
                                       TyUnicode_GET_LENGTH(unicode) + 1);
    TyMem_FREE(buffer);
    return result;
}


/* Test TyUnicode_AsUTF8() */
static TyObject *
unicode_asutf8(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    Ty_ssize_t buflen;
    const char *s;

    if (!TyArg_ParseTuple(args, "On", &unicode, &buflen))
        return NULL;

    NULLABLE(unicode);
    s = TyUnicode_AsUTF8(unicode);
    if (s == NULL)
        return NULL;

    return TyBytes_FromStringAndSize(s, buflen);
}


/* Test TyUnicode_CopyCharacters() */
static TyObject *
unicode_copycharacters(TyObject *self, TyObject *args)
{
    TyObject *from, *to, *to_copy;
    Ty_ssize_t from_start, to_start, how_many, copied;

    if (!TyArg_ParseTuple(args, "UnOnn", &to, &to_start,
                          &from, &from_start, &how_many)) {
        return NULL;
    }

    NULLABLE(from);
    if (!(to_copy = TyUnicode_New(TyUnicode_GET_LENGTH(to),
                                  TyUnicode_MAX_CHAR_VALUE(to)))) {
        return NULL;
    }
    if (TyUnicode_Fill(to_copy, 0, TyUnicode_GET_LENGTH(to_copy), 0U) < 0) {
        Ty_DECREF(to_copy);
        return NULL;
    }

    copied = TyUnicode_CopyCharacters(to_copy, to_start, from,
                                      from_start, how_many);
    if (copied == -1 && TyErr_Occurred()) {
        Ty_DECREF(to_copy);
        return NULL;
    }

    return Ty_BuildValue("(Nn)", to_copy, copied);
}


// --- PyUnicodeWriter type -------------------------------------------------

typedef struct {
    PyObject_HEAD
    PyUnicodeWriter *writer;
} WriterObject;


static TyObject *
writer_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    WriterObject *self = (WriterObject *)type->tp_alloc(type, 0);
    if (!self) {
        return NULL;
    }
    self->writer = NULL;
    return (TyObject*)self;
}


static int
writer_init(TyObject *self_raw, TyObject *args, TyObject *kwargs)
{
    WriterObject *self = (WriterObject *)self_raw;

    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "n", &size)) {
        return -1;
    }

    if (self->writer) {
        PyUnicodeWriter_Discard(self->writer);
    }

    self->writer = PyUnicodeWriter_Create(size);
    if (self->writer == NULL) {
        return -1;
    }
    return 0;
}


static void
writer_dealloc(TyObject *self_raw)
{
    WriterObject *self = (WriterObject *)self_raw;
    TyTypeObject *tp = Ty_TYPE(self);
    if (self->writer) {
        PyUnicodeWriter_Discard(self->writer);
    }
    tp->tp_free(self);
    Ty_DECREF(tp);
}


static inline int
writer_check(WriterObject *self)
{
    if (self->writer == NULL) {
        TyErr_SetString(TyExc_ValueError, "operation on finished writer");
        return -1;
    }
    return 0;
}


static TyObject*
writer_write_char(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *str;
    if (!TyArg_ParseTuple(args, "U", &str)) {
        return NULL;
    }
    if (TyUnicode_GET_LENGTH(str) != 1) {
        TyErr_SetString(TyExc_ValueError, "expect a single character");
    }
    Ty_UCS4 ch = TyUnicode_READ_CHAR(str, 0);

    if (PyUnicodeWriter_WriteChar(self->writer, ch) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_utf8(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    char *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "yn", &str, &size)) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteUTF8(self->writer, str, size) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_ascii(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    char *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "yn", &str, &size)) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteASCII(self->writer, str, size) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_widechar(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *str;
    if (!TyArg_ParseTuple(args, "U", &str)) {
        return NULL;
    }

    Ty_ssize_t size;
    wchar_t *wstr = TyUnicode_AsWideCharString(str, &size);
    if (wstr == NULL) {
        return NULL;
    }

    int res = PyUnicodeWriter_WriteWideChar(self->writer, wstr, size);
    TyMem_Free(wstr);
    if (res < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_ucs4(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *str;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "Un", &str, &size)) {
        return NULL;
    }
    Ty_ssize_t len = TyUnicode_GET_LENGTH(str);
    size = Ty_MIN(size, len);

    Ty_UCS4 *ucs4 = TyUnicode_AsUCS4Copy(str);
    if (ucs4 == NULL) {
        return NULL;
    }

    int res = PyUnicodeWriter_WriteUCS4(self->writer, ucs4, size);
    TyMem_Free(ucs4);
    if (res < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_str(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *obj;
    if (!TyArg_ParseTuple(args, "O", &obj)) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteStr(self->writer, obj) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_repr(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *obj;
    if (!TyArg_ParseTuple(args, "O", &obj)) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteRepr(self->writer, obj) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_write_substring(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *str;
    Ty_ssize_t start, end;
    if (!TyArg_ParseTuple(args, "Unn", &str, &start, &end)) {
        return NULL;
    }

    if (PyUnicodeWriter_WriteSubstring(self->writer, str, start, end) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_decodeutf8stateful(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    const char *str;
    Ty_ssize_t len;
    const char *errors;
    int use_consumed = 0;
    if (!TyArg_ParseTuple(args, "yny|i", &str, &len, &errors, &use_consumed)) {
        return NULL;
    }

    Ty_ssize_t consumed = 12345;
    Ty_ssize_t *pconsumed = use_consumed ? &consumed : NULL;
    if (PyUnicodeWriter_DecodeUTF8Stateful(self->writer, str, len,
                                           errors, pconsumed) < 0) {
        if (use_consumed) {
            assert(consumed == 0);
        }
        return NULL;
    }

    if (use_consumed) {
        return TyLong_FromSsize_t(consumed);
    }
    Py_RETURN_NONE;
}


static TyObject*
writer_get_pointer(TyObject *self_raw, TyObject *args)
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    return TyLong_FromVoidPtr(self->writer);
}


static TyObject*
writer_finish(TyObject *self_raw, TyObject *Py_UNUSED(args))
{
    WriterObject *self = (WriterObject *)self_raw;
    if (writer_check(self) < 0) {
        return NULL;
    }

    TyObject *str = PyUnicodeWriter_Finish(self->writer);
    self->writer = NULL;
    return str;
}


static TyMethodDef writer_methods[] = {
    {"write_char", _PyCFunction_CAST(writer_write_char), METH_VARARGS},
    {"write_utf8", _PyCFunction_CAST(writer_write_utf8), METH_VARARGS},
    {"write_ascii", _PyCFunction_CAST(writer_write_ascii), METH_VARARGS},
    {"write_widechar", _PyCFunction_CAST(writer_write_widechar), METH_VARARGS},
    {"write_ucs4", _PyCFunction_CAST(writer_write_ucs4), METH_VARARGS},
    {"write_str", _PyCFunction_CAST(writer_write_str), METH_VARARGS},
    {"write_repr", _PyCFunction_CAST(writer_write_repr), METH_VARARGS},
    {"write_substring", _PyCFunction_CAST(writer_write_substring), METH_VARARGS},
    {"decodeutf8stateful", _PyCFunction_CAST(writer_decodeutf8stateful), METH_VARARGS},
    {"get_pointer", _PyCFunction_CAST(writer_get_pointer), METH_VARARGS},
    {"finish", _PyCFunction_CAST(writer_finish), METH_NOARGS},
    {NULL,              NULL}           /* sentinel */
};

static TyType_Slot Writer_Type_slots[] = {
    {Ty_tp_new, writer_new},
    {Ty_tp_init, writer_init},
    {Ty_tp_dealloc, writer_dealloc},
    {Ty_tp_methods, writer_methods},
    {0, 0},  /* sentinel */
};

static TyType_Spec Writer_spec = {
    .name = "_testcapi.PyUnicodeWriter",
    .basicsize = sizeof(WriterObject),
    .flags = Ty_TPFLAGS_DEFAULT,
    .slots = Writer_Type_slots,
};


static TyMethodDef TestMethods[] = {
    {"unicode_new",              unicode_new,                    METH_VARARGS},
    {"unicode_fill",             unicode_fill,                   METH_VARARGS},
    {"unicode_fromkindanddata",  unicode_fromkindanddata,        METH_VARARGS},
    {"unicode_asucs4",           unicode_asucs4,                 METH_VARARGS},
    {"unicode_asucs4copy",       unicode_asucs4copy,             METH_VARARGS},
    {"unicode_asutf8",           unicode_asutf8,                 METH_VARARGS},
    {"unicode_copycharacters",   unicode_copycharacters,         METH_VARARGS},
    {NULL},
};

int
_PyTestCapi_Init_Unicode(TyObject *m) {
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    TyTypeObject *writer_type = (TyTypeObject *)TyType_FromSpec(&Writer_spec);
    if (writer_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, writer_type) < 0) {
        Ty_DECREF(writer_type);
        return -1;
    }
    Ty_DECREF(writer_type);

    return 0;
}
