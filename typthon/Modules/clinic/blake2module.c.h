/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_long.h"          // _TyLong_UnsignedLong_Converter()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(py_blake2b_new__doc__,
"blake2b(data=b\'\', *, digest_size=_blake2.blake2b.MAX_DIGEST_SIZE,\n"
"        key=b\'\', salt=b\'\', person=b\'\', fanout=1, depth=1, leaf_size=0,\n"
"        node_offset=0, node_depth=0, inner_size=0, last_node=False,\n"
"        usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new BLAKE2b hash object.");

static TyObject *
py_blake2b_new_impl(TyTypeObject *type, TyObject *data_obj, int digest_size,
                    Ty_buffer *key, Ty_buffer *salt, Ty_buffer *person,
                    int fanout, int depth, unsigned long leaf_size,
                    unsigned long long node_offset, int node_depth,
                    int inner_size, int last_node, int usedforsecurity,
                    TyObject *string);

static TyObject *
py_blake2b_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 14
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(data), &_Ty_ID(digest_size), &_Ty_ID(key), &_Ty_ID(salt), &_Ty_ID(person), &_Ty_ID(fanout), &_Ty_ID(depth), &_Ty_ID(leaf_size), &_Ty_ID(node_offset), &_Ty_ID(node_depth), &_Ty_ID(inner_size), &_Ty_ID(last_node), &_Ty_ID(usedforsecurity), &_Ty_ID(string), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "digest_size", "key", "salt", "person", "fanout", "depth", "leaf_size", "node_offset", "node_depth", "inner_size", "last_node", "usedforsecurity", "string", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "blake2b",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[14];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *data_obj = NULL;
    int digest_size = HACL_HASH_BLAKE2B_OUT_BYTES;
    Ty_buffer key = {NULL, NULL};
    Ty_buffer salt = {NULL, NULL};
    Ty_buffer person = {NULL, NULL};
    int fanout = 1;
    int depth = 1;
    unsigned long leaf_size = 0;
    unsigned long long node_offset = 0;
    int node_depth = 0;
    int inner_size = 0;
    int last_node = 0;
    int usedforsecurity = 1;
    TyObject *string = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        data_obj = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        digest_size = TyLong_AsInt(fastargs[1]);
        if (digest_size == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        if (PyObject_GetBuffer(fastargs[2], &key, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        if (PyObject_GetBuffer(fastargs[3], &salt, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[4]) {
        if (PyObject_GetBuffer(fastargs[4], &person, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[5]) {
        fanout = TyLong_AsInt(fastargs[5]);
        if (fanout == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[6]) {
        depth = TyLong_AsInt(fastargs[6]);
        if (depth == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[7]) {
        if (!_TyLong_UnsignedLong_Converter(fastargs[7], &leaf_size)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[8]) {
        if (!_TyLong_UnsignedLongLong_Converter(fastargs[8], &node_offset)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[9]) {
        node_depth = TyLong_AsInt(fastargs[9]);
        if (node_depth == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[10]) {
        inner_size = TyLong_AsInt(fastargs[10]);
        if (inner_size == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[11]) {
        last_node = PyObject_IsTrue(fastargs[11]);
        if (last_node < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[12]) {
        usedforsecurity = PyObject_IsTrue(fastargs[12]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string = fastargs[13];
skip_optional_kwonly:
    return_value = py_blake2b_new_impl(type, data_obj, digest_size, &key, &salt, &person, fanout, depth, leaf_size, node_offset, node_depth, inner_size, last_node, usedforsecurity, string);

exit:
    /* Cleanup for key */
    if (key.obj) {
       PyBuffer_Release(&key);
    }
    /* Cleanup for salt */
    if (salt.obj) {
       PyBuffer_Release(&salt);
    }
    /* Cleanup for person */
    if (person.obj) {
       PyBuffer_Release(&person);
    }

    return return_value;
}

TyDoc_STRVAR(py_blake2s_new__doc__,
"blake2s(data=b\'\', *, digest_size=_blake2.blake2s.MAX_DIGEST_SIZE,\n"
"        key=b\'\', salt=b\'\', person=b\'\', fanout=1, depth=1, leaf_size=0,\n"
"        node_offset=0, node_depth=0, inner_size=0, last_node=False,\n"
"        usedforsecurity=True, string=None)\n"
"--\n"
"\n"
"Return a new BLAKE2s hash object.");

static TyObject *
py_blake2s_new_impl(TyTypeObject *type, TyObject *data_obj, int digest_size,
                    Ty_buffer *key, Ty_buffer *salt, Ty_buffer *person,
                    int fanout, int depth, unsigned long leaf_size,
                    unsigned long long node_offset, int node_depth,
                    int inner_size, int last_node, int usedforsecurity,
                    TyObject *string);

static TyObject *
py_blake2s_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 14
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(data), &_Ty_ID(digest_size), &_Ty_ID(key), &_Ty_ID(salt), &_Ty_ID(person), &_Ty_ID(fanout), &_Ty_ID(depth), &_Ty_ID(leaf_size), &_Ty_ID(node_offset), &_Ty_ID(node_depth), &_Ty_ID(inner_size), &_Ty_ID(last_node), &_Ty_ID(usedforsecurity), &_Ty_ID(string), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"data", "digest_size", "key", "salt", "person", "fanout", "depth", "leaf_size", "node_offset", "node_depth", "inner_size", "last_node", "usedforsecurity", "string", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "blake2s",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[14];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *data_obj = NULL;
    int digest_size = HACL_HASH_BLAKE2S_OUT_BYTES;
    Ty_buffer key = {NULL, NULL};
    Ty_buffer salt = {NULL, NULL};
    Ty_buffer person = {NULL, NULL};
    int fanout = 1;
    int depth = 1;
    unsigned long leaf_size = 0;
    unsigned long long node_offset = 0;
    int node_depth = 0;
    int inner_size = 0;
    int last_node = 0;
    int usedforsecurity = 1;
    TyObject *string = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        data_obj = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        digest_size = TyLong_AsInt(fastargs[1]);
        if (digest_size == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        if (PyObject_GetBuffer(fastargs[2], &key, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        if (PyObject_GetBuffer(fastargs[3], &salt, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[4]) {
        if (PyObject_GetBuffer(fastargs[4], &person, PyBUF_SIMPLE) != 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[5]) {
        fanout = TyLong_AsInt(fastargs[5]);
        if (fanout == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[6]) {
        depth = TyLong_AsInt(fastargs[6]);
        if (depth == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[7]) {
        if (!_TyLong_UnsignedLong_Converter(fastargs[7], &leaf_size)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[8]) {
        if (!_TyLong_UnsignedLongLong_Converter(fastargs[8], &node_offset)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[9]) {
        node_depth = TyLong_AsInt(fastargs[9]);
        if (node_depth == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[10]) {
        inner_size = TyLong_AsInt(fastargs[10]);
        if (inner_size == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[11]) {
        last_node = PyObject_IsTrue(fastargs[11]);
        if (last_node < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[12]) {
        usedforsecurity = PyObject_IsTrue(fastargs[12]);
        if (usedforsecurity < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    string = fastargs[13];
skip_optional_kwonly:
    return_value = py_blake2s_new_impl(type, data_obj, digest_size, &key, &salt, &person, fanout, depth, leaf_size, node_offset, node_depth, inner_size, last_node, usedforsecurity, string);

exit:
    /* Cleanup for key */
    if (key.obj) {
       PyBuffer_Release(&key);
    }
    /* Cleanup for salt */
    if (salt.obj) {
       PyBuffer_Release(&salt);
    }
    /* Cleanup for person */
    if (person.obj) {
       PyBuffer_Release(&person);
    }

    return return_value;
}

TyDoc_STRVAR(_blake2_blake2b_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a copy of the hash object.");

#define _BLAKE2_BLAKE2B_COPY_METHODDEF    \
    {"copy", (PyCFunction)_blake2_blake2b_copy, METH_NOARGS, _blake2_blake2b_copy__doc__},

static TyObject *
_blake2_blake2b_copy_impl(Blake2Object *self);

static TyObject *
_blake2_blake2b_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _blake2_blake2b_copy_impl((Blake2Object *)self);
}

TyDoc_STRVAR(_blake2_blake2b_update__doc__,
"update($self, data, /)\n"
"--\n"
"\n"
"Update this hash object\'s state with the provided bytes-like object.");

#define _BLAKE2_BLAKE2B_UPDATE_METHODDEF    \
    {"update", (PyCFunction)_blake2_blake2b_update, METH_O, _blake2_blake2b_update__doc__},

static TyObject *
_blake2_blake2b_update_impl(Blake2Object *self, TyObject *data);

static TyObject *
_blake2_blake2b_update(TyObject *self, TyObject *data)
{
    TyObject *return_value = NULL;

    return_value = _blake2_blake2b_update_impl((Blake2Object *)self, data);

    return return_value;
}

TyDoc_STRVAR(_blake2_blake2b_digest__doc__,
"digest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a bytes object.");

#define _BLAKE2_BLAKE2B_DIGEST_METHODDEF    \
    {"digest", (PyCFunction)_blake2_blake2b_digest, METH_NOARGS, _blake2_blake2b_digest__doc__},

static TyObject *
_blake2_blake2b_digest_impl(Blake2Object *self);

static TyObject *
_blake2_blake2b_digest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _blake2_blake2b_digest_impl((Blake2Object *)self);
}

TyDoc_STRVAR(_blake2_blake2b_hexdigest__doc__,
"hexdigest($self, /)\n"
"--\n"
"\n"
"Return the digest value as a string of hexadecimal digits.");

#define _BLAKE2_BLAKE2B_HEXDIGEST_METHODDEF    \
    {"hexdigest", (PyCFunction)_blake2_blake2b_hexdigest, METH_NOARGS, _blake2_blake2b_hexdigest__doc__},

static TyObject *
_blake2_blake2b_hexdigest_impl(Blake2Object *self);

static TyObject *
_blake2_blake2b_hexdigest(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _blake2_blake2b_hexdigest_impl((Blake2Object *)self);
}
/*[clinic end generated code: output=eed18dcfaf6f7731 input=a9049054013a1b77]*/
