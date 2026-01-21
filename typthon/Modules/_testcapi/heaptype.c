#include "parts.h"
#include <stddef.h>               // offsetof()


static struct TyModuleDef *_testcapimodule = NULL;  // set at initialization

/* Tests for heap types (TyType_From*) */

static TyObject *pytype_fromspec_meta(TyObject* self, TyObject *meta)
{
    if (!TyType_Check(meta)) {
        TyErr_SetString(
            TyExc_TypeError,
            "pytype_fromspec_meta: must be invoked with a type argument!");
        return NULL;
    }

    TyType_Slot HeapCTypeViaMetaclass_slots[] = {
        {0},
    };

    TyType_Spec HeapCTypeViaMetaclass_spec = {
        "_testcapi.HeapCTypeViaMetaclass",
        sizeof(TyObject),
        0,
        Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
        HeapCTypeViaMetaclass_slots
    };

    return TyType_FromMetaclass(
        (TyTypeObject *) meta, NULL, &HeapCTypeViaMetaclass_spec, NULL);
}


static TyType_Slot empty_type_slots[] = {
    {0, 0},
};

static TyType_Spec MinimalMetaclass_spec = {
    .name = "_testcapi.MinimalMetaclass",
    .basicsize = sizeof(PyHeapTypeObject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .slots = empty_type_slots,
};

static TyType_Spec MinimalType_spec = {
    .name = "_testcapi.MinimalSpecType",
    .basicsize = 0,  // Updated later
    .flags = Ty_TPFLAGS_DEFAULT,
    .slots = empty_type_slots,
};


static TyObject *
test_from_spec_metatype_inheritance(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *metaclass = NULL;
    TyObject *class = NULL;
    TyObject *new = NULL;
    TyObject *subclasses = NULL;
    TyObject *result = NULL;
    int r;

    metaclass = TyType_FromSpecWithBases(&MinimalMetaclass_spec, (TyObject*)&TyType_Type);
    if (metaclass == NULL) {
        goto finally;
    }
    class = PyObject_CallFunction(metaclass, "s(){}", "TestClass");
    if (class == NULL) {
        goto finally;
    }

    MinimalType_spec.basicsize = (int)(((TyTypeObject*)class)->tp_basicsize);
    new = TyType_FromSpecWithBases(&MinimalType_spec, class);
    if (new == NULL) {
        goto finally;
    }
    if (Ty_TYPE(new) != (TyTypeObject*)metaclass) {
        TyErr_SetString(TyExc_AssertionError,
                "Metaclass not set properly!");
        goto finally;
    }

    /* Assert that __subclasses__ is updated */
    subclasses = PyObject_CallMethod(class, "__subclasses__", "");
    if (!subclasses) {
        goto finally;
    }
    r = PySequence_Contains(subclasses, new);
    if (r < 0) {
        goto finally;
    }
    if (r == 0) {
        TyErr_SetString(TyExc_AssertionError,
                "subclasses not set properly!");
        goto finally;
    }

    result = Ty_NewRef(Ty_None);

finally:
    Ty_XDECREF(metaclass);
    Ty_XDECREF(class);
    Ty_XDECREF(new);
    Ty_XDECREF(subclasses);
    return result;
}


static TyObject *
test_from_spec_invalid_metatype_inheritance(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *metaclass_a = NULL;
    TyObject *metaclass_b = NULL;
    TyObject *class_a = NULL;
    TyObject *class_b = NULL;
    TyObject *bases = NULL;
    TyObject *new = NULL;
    TyObject *meta_error_string = NULL;
    TyObject *exc = NULL;
    TyObject *result = NULL;
    TyObject *message = NULL;
    TyObject *args = NULL;

    metaclass_a = TyType_FromSpecWithBases(&MinimalMetaclass_spec, (TyObject*)&TyType_Type);
    if (metaclass_a == NULL) {
        goto finally;
    }
    metaclass_b = TyType_FromSpecWithBases(&MinimalMetaclass_spec, (TyObject*)&TyType_Type);
    if (metaclass_b == NULL) {
        goto finally;
    }
    class_a = PyObject_CallFunction(metaclass_a, "s(){}", "TestClassA");
    if (class_a == NULL) {
        goto finally;
    }

    class_b = PyObject_CallFunction(metaclass_b, "s(){}", "TestClassB");
    if (class_b == NULL) {
        goto finally;
    }

    bases = TyTuple_Pack(2, class_a, class_b);
    if (bases == NULL) {
        goto finally;
    }

    /*
     * The following should raise a TypeError due to a MetaClass conflict.
     */
    new = TyType_FromSpecWithBases(&MinimalType_spec, bases);
    if (new != NULL) {
        TyErr_SetString(TyExc_AssertionError,
                "MetaType conflict not recognized by TyType_FromSpecWithBases");
            goto finally;
    }

    // Assert that the correct exception was raised
    if (TyErr_ExceptionMatches(TyExc_TypeError)) {
        exc = TyErr_GetRaisedException();
        args = PyException_GetArgs(exc);
        if (!TyTuple_Check(args) || TyTuple_Size(args) != 1) {
            TyErr_SetString(TyExc_AssertionError,
                    "TypeError args are not a one-tuple");
            goto finally;
        }
        message = Ty_NewRef(TyTuple_GET_ITEM(args, 0));
        meta_error_string = TyUnicode_FromString("metaclass conflict:");
        if (meta_error_string == NULL) {
            goto finally;
        }
        int res = TyUnicode_Contains(message, meta_error_string);
        if (res < 0) {
            goto finally;
        }
        if (res == 0) {
            TyErr_SetString(TyExc_AssertionError,
                    "TypeError did not include expected message.");
            goto finally;
        }
        result = Ty_NewRef(Ty_None);
    }
finally:
    Ty_XDECREF(metaclass_a);
    Ty_XDECREF(metaclass_b);
    Ty_XDECREF(bases);
    Ty_XDECREF(new);
    Ty_XDECREF(meta_error_string);
    Ty_XDECREF(exc);
    Ty_XDECREF(message);
    Ty_XDECREF(class_a);
    Ty_XDECREF(class_b);
    Ty_XDECREF(args);
    return result;
}


static TyObject *
simple_str(TyObject *self) {
    return TyUnicode_FromString("<test>");
}


static TyObject *
test_type_from_ephemeral_spec(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    // Test that a heap type can be created from a spec that's later deleted
    // (along with all its contents).
    // All necessary data must be copied and held by the class
    TyType_Spec *spec = NULL;
    char *name = NULL;
    char *doc = NULL;
    TyType_Slot *slots = NULL;
    TyObject *class = NULL;
    TyObject *instance = NULL;
    TyObject *obj = NULL;
    TyObject *result = NULL;

    /* create a spec (and all its contents) on the heap */

    const char NAME[] = "testcapi._Test";
    const char DOC[] = "a test class";

    spec = TyMem_New(TyType_Spec, 1);
    if (spec == NULL) {
        TyErr_NoMemory();
        goto finally;
    }
    name = TyMem_New(char, sizeof(NAME));
    if (name == NULL) {
        TyErr_NoMemory();
        goto finally;
    }
    memcpy(name, NAME, sizeof(NAME));

    doc = TyMem_New(char, sizeof(DOC));
    if (doc == NULL) {
        TyErr_NoMemory();
        goto finally;
    }
    memcpy(doc, DOC, sizeof(DOC));

    spec->name = name;
    spec->basicsize = sizeof(TyObject);
    spec->itemsize = 0;
    spec->flags = Ty_TPFLAGS_DEFAULT;
    slots = TyMem_New(TyType_Slot, 3);
    if (slots == NULL) {
        TyErr_NoMemory();
        goto finally;
    }
    slots[0].slot = Ty_tp_str;
    slots[0].pfunc = simple_str;
    slots[1].slot = Ty_tp_doc;
    slots[1].pfunc = doc;
    slots[2].slot = 0;
    slots[2].pfunc = NULL;
    spec->slots = slots;

    /* create the class */

    class = TyType_FromSpec(spec);
    if (class == NULL) {
        goto finally;
    }

    /* deallocate the spec (and all contents) */

    // (Explicitly overwrite memory before freeing,
    // so bugs show themselves even without the debug allocator's help.)
    memset(spec, 0xdd, sizeof(TyType_Spec));
    TyMem_Free(spec);
    spec = NULL;
    memset(name, 0xdd, sizeof(NAME));
    TyMem_Free(name);
    name = NULL;
    memset(doc, 0xdd, sizeof(DOC));
    TyMem_Free(doc);
    doc = NULL;
    memset(slots, 0xdd, 3 * sizeof(TyType_Slot));
    TyMem_Free(slots);
    slots = NULL;

    /* check that everything works */

    TyTypeObject *class_tp = (TyTypeObject *)class;
    PyHeapTypeObject *class_ht = (PyHeapTypeObject *)class;
    assert(strcmp(class_tp->tp_name, "testcapi._Test") == 0);
    assert(strcmp(TyUnicode_AsUTF8(class_ht->ht_name), "_Test") == 0);
    assert(strcmp(TyUnicode_AsUTF8(class_ht->ht_qualname), "_Test") == 0);
    assert(strcmp(class_tp->tp_doc, "a test class") == 0);

    // call and check __str__
    instance = PyObject_CallNoArgs(class);
    if (instance == NULL) {
        goto finally;
    }
    obj = PyObject_Str(instance);
    if (obj == NULL) {
        goto finally;
    }
    assert(strcmp(TyUnicode_AsUTF8(obj), "<test>") == 0);
    Ty_CLEAR(obj);

    result = Ty_NewRef(Ty_None);
  finally:
    TyMem_Free(spec);
    TyMem_Free(name);
    TyMem_Free(doc);
    TyMem_Free(slots);
    Ty_XDECREF(class);
    Ty_XDECREF(instance);
    Ty_XDECREF(obj);
    return result;
}

TyType_Slot repeated_doc_slots[] = {
    {Ty_tp_doc, "A class used for tests·"},
    {Ty_tp_doc, "A class used for tests"},
    {0, 0},
};

TyType_Spec repeated_doc_slots_spec = {
    .name = "RepeatedDocSlotClass",
    .basicsize = sizeof(TyObject),
    .slots = repeated_doc_slots,
};

typedef struct {
    PyObject_HEAD
    int data;
} HeapCTypeWithDataObject;


static struct TyMemberDef members_to_repeat[] = {
    {"Ty_T_INT", Ty_T_INT, offsetof(HeapCTypeWithDataObject, data), 0, NULL},
    {NULL}
};

TyType_Slot repeated_members_slots[] = {
    {Ty_tp_members, members_to_repeat},
    {Ty_tp_members, members_to_repeat},
    {0, 0},
};

TyType_Spec repeated_members_slots_spec = {
    .name = "RepeatedMembersSlotClass",
    .basicsize = sizeof(HeapCTypeWithDataObject),
    .slots = repeated_members_slots,
};

static TyObject *
create_type_from_repeated_slots(TyObject *self, TyObject *variant_obj)
{
    TyObject *class = NULL;
    int variant = TyLong_AsLong(variant_obj);
    if (TyErr_Occurred()) {
        return NULL;
    }
    switch (variant) {
        case 0:
            class = TyType_FromSpec(&repeated_doc_slots_spec);
            break;
        case 1:
            class = TyType_FromSpec(&repeated_members_slots_spec);
            break;
        default:
            TyErr_SetString(TyExc_ValueError, "bad test variant");
            break;
        }
    return class;
}


static TyObject *
make_immutable_type_with_base(TyObject *self, TyObject *base)
{
    assert(TyType_Check(base));
    TyType_Spec ImmutableSubclass_spec = {
        .name = "ImmutableSubclass",
        .basicsize = (int)((TyTypeObject*)base)->tp_basicsize,
        .slots = empty_type_slots,
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE,
    };
    return TyType_FromSpecWithBases(&ImmutableSubclass_spec, base);
}

static TyObject *
make_type_with_base(TyObject *self, TyObject *base)
{
    assert(TyType_Check(base));
    TyType_Spec ImmutableSubclass_spec = {
        .name = "_testcapi.Subclass",
        .basicsize = (int)((TyTypeObject*)base)->tp_basicsize,
        .slots = empty_type_slots,
        .flags = Ty_TPFLAGS_DEFAULT,
    };
    return TyType_FromSpecWithBases(&ImmutableSubclass_spec, base);
}


static TyObject *
pyobject_getitemdata(TyObject *self, TyObject *o)
{
    void *pointer = PyObject_GetItemData(o);
    if (pointer == NULL) {
        return NULL;
    }
    return TyLong_FromVoidPtr(pointer);
}


static TyObject *
create_type_with_token(TyObject *module, TyObject *args)
{
    const char *name;
    TyObject *py_token;
    if (!TyArg_ParseTuple(args, "sO", &name, &py_token)) {
        return NULL;
    }
    void *token = TyLong_AsVoidPtr(py_token);
    if (token == Ty_TP_USE_SPEC) {
        // Ty_TP_USE_SPEC requires the spec that at least outlives the class
        static TyType_Slot slots[] = {
            {Ty_tp_token, Ty_TP_USE_SPEC},
            {0},
        };
        static TyType_Spec spec = {
            .name = "_testcapi.DefaultTokenTest",
            .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
            .slots = slots,
        };
        TyObject *type = TyType_FromMetaclass(NULL, NULL, &spec, NULL);
        if (!type) {
            return NULL;
        }
        token = TyType_GetSlot((TyTypeObject *)type, Ty_tp_token);
        assert(!TyErr_Occurred());
        Ty_DECREF(type);
        if (token != &spec) {
            TyErr_SetString(TyExc_AssertionError,
                            "failed to convert token from Ty_TP_USE_SPEC");
            return NULL;
        }
    }
    // Test non-NULL token that must also outlive the class
    TyType_Slot slots[] = {
        {Ty_tp_token, token},
        {0},
    };
    TyType_Spec spec = {
        .name = name,
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
        .slots = slots,
    };
    return TyType_FromMetaclass(NULL, module, &spec, NULL);
}

static TyObject *
get_tp_token(TyObject *self, TyObject *type)
{
    void *token = TyType_GetSlot((TyTypeObject *)type, Ty_tp_token);
    if (TyErr_Occurred()) {
        return NULL;
    }
    return TyLong_FromVoidPtr(token);
}

static TyObject *
pytype_getbasebytoken(TyObject *self, TyObject *args)
{
    TyTypeObject *type;
    TyObject *py_token, *use_mro, *need_result;
    if (!TyArg_ParseTuple(args, "OOOO",
                          &type, &py_token, &use_mro, &need_result)) {
        return NULL;
    }

    TyObject *mro_save = NULL;
    if (use_mro != Ty_True) {
        // Test internal detail: TyType_GetBaseByToken works even with
        // types that are only partially initialized (or torn down):
        // if tp_mro=NULL we fall back to tp_bases.
        assert(TyType_Check(type));
        mro_save = type->tp_mro;
        type->tp_mro = NULL;
    }

    void *token = TyLong_AsVoidPtr(py_token);
    TyObject *result;
    int ret;
    if (need_result == Ty_True) {
        ret = TyType_GetBaseByToken(type, token, (TyTypeObject **)&result);
    }
    else {
        result = NULL;
        ret = TyType_GetBaseByToken(type, token, NULL);
    }

    if (use_mro != Ty_True) {
        type->tp_mro = mro_save;
    }
    if (ret < 0) {
        assert(result == NULL);
        return NULL;
    }
    TyObject *py_ret = TyLong_FromLong(ret);
    if (py_ret == NULL) {
        goto error;
    }
    TyObject *tuple = TyTuple_New(2);
    if (tuple == NULL) {
        goto error;
    }
    TyTuple_SET_ITEM(tuple, 0, py_ret);
    TyTuple_SET_ITEM(tuple, 1, result ? result : Ty_None);
    return tuple;
error:
    Ty_XDECREF(py_ret);
    Ty_XDECREF(result);
    return NULL;
}

static TyObject *
pytype_getmodulebydef(TyObject *self, TyObject *type)
{
    TyObject *mod = TyType_GetModuleByDef((TyTypeObject *)type, _testcapimodule);
    return Ty_XNewRef(mod);
}


static TyMethodDef TestMethods[] = {
    {"pytype_fromspec_meta",    pytype_fromspec_meta,            METH_O},
    {"test_type_from_ephemeral_spec", test_type_from_ephemeral_spec, METH_NOARGS},
    {"create_type_from_repeated_slots",
        create_type_from_repeated_slots, METH_O},
    {"test_from_spec_metatype_inheritance", test_from_spec_metatype_inheritance,
     METH_NOARGS},
    {"test_from_spec_invalid_metatype_inheritance",
     test_from_spec_invalid_metatype_inheritance,
     METH_NOARGS},
    {"make_immutable_type_with_base", make_immutable_type_with_base, METH_O},
    {"make_type_with_base", make_type_with_base, METH_O},
    {"pyobject_getitemdata", pyobject_getitemdata, METH_O},
    {"create_type_with_token", create_type_with_token, METH_VARARGS},
    {"get_tp_token", get_tp_token, METH_O},
    {"pytype_getbasebytoken", pytype_getbasebytoken, METH_VARARGS},
    {"pytype_getmodulebydef", pytype_getmodulebydef, METH_O},
    {NULL},
};


TyDoc_STRVAR(heapdocctype__doc__,
"HeapDocCType(arg1, arg2)\n"
"--\n"
"\n"
"somedoc");

typedef struct {
    PyObject_HEAD
} HeapDocCTypeObject;

static TyType_Slot HeapDocCType_slots[] = {
    {Ty_tp_doc, (char*)heapdocctype__doc__},
    {0},
};

static TyType_Spec HeapDocCType_spec = {
    "_testcapi.HeapDocCType",
    sizeof(HeapDocCTypeObject),
    0,
    Ty_TPFLAGS_DEFAULT,
    HeapDocCType_slots
};

typedef struct {
    PyObject_HEAD
} NullTpDocTypeObject;

static TyType_Slot NullTpDocType_slots[] = {
    {Ty_tp_doc, NULL},
    {0, 0},
};

static TyType_Spec NullTpDocType_spec = {
    "_testcapi.NullTpDocType",
    sizeof(NullTpDocTypeObject),
    0,
    Ty_TPFLAGS_DEFAULT,
    NullTpDocType_slots
};


TyDoc_STRVAR(heapgctype__doc__,
"A heap type with GC, and with overridden dealloc.\n\n"
"The 'value' attribute is set to 10 in __init__.");

typedef struct {
    PyObject_HEAD
    int value;
} HeapCTypeObject;

static struct TyMemberDef heapctype_members[] = {
    {"value", Ty_T_INT, offsetof(HeapCTypeObject, value)},
    {NULL} /* Sentinel */
};

static int
heapctype_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    ((HeapCTypeObject *)self)->value = 10;
    return 0;
}

static int
heapgcctype_traverse(TyObject *op, visitproc visit, void *arg)
{
    HeapCTypeObject *self = (HeapCTypeObject*)op;
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static void
heapgcctype_dealloc(TyObject *op)
{
    HeapCTypeObject *self = (HeapCTypeObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapGcCType_slots[] = {
    {Ty_tp_init, heapctype_init},
    {Ty_tp_members, heapctype_members},
    {Ty_tp_dealloc, heapgcctype_dealloc},
    {Ty_tp_traverse, heapgcctype_traverse},
    {Ty_tp_doc, (char*)heapgctype__doc__},
    {0, 0},
};

static TyType_Spec HeapGcCType_spec = {
    "_testcapi.HeapGcCType",
    sizeof(HeapCTypeObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    HeapGcCType_slots
};

TyDoc_STRVAR(heapctype__doc__,
"A heap type without GC, but with overridden dealloc.\n\n"
"The 'value' attribute is set to 10 in __init__.");

static void
heapctype_dealloc(TyObject *op)
{
    HeapCTypeObject *self = (HeapCTypeObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapCType_slots[] = {
    {Ty_tp_init, heapctype_init},
    {Ty_tp_members, heapctype_members},
    {Ty_tp_dealloc, heapctype_dealloc},
    {Ty_tp_doc, (char*)heapctype__doc__},
    {0, 0},
};

static TyType_Spec HeapCType_spec = {
    "_testcapi.HeapCType",
    sizeof(HeapCTypeObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCType_slots
};

TyDoc_STRVAR(heapctypesubclass__doc__,
"Subclass of HeapCType, without GC.\n\n"
"__init__ sets the 'value' attribute to 10 and 'value2' to 20.");

typedef struct {
    HeapCTypeObject base;
    int value2;
} HeapCTypeSubclassObject;

static int
heapctypesubclass_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    /* Call __init__ of the superclass */
    if (heapctype_init(self, args, kwargs) < 0) {
        return -1;
    }
    /* Initialize additional element */
    ((HeapCTypeSubclassObject *)self)->value2 = 20;
    return 0;
}

static struct TyMemberDef heapctypesubclass_members[] = {
    {"value2", Ty_T_INT, offsetof(HeapCTypeSubclassObject, value2)},
    {NULL} /* Sentinel */
};

static TyType_Slot HeapCTypeSubclass_slots[] = {
    {Ty_tp_init, heapctypesubclass_init},
    {Ty_tp_members, heapctypesubclass_members},
    {Ty_tp_doc, (char*)heapctypesubclass__doc__},
    {0, 0},
};

static TyType_Spec HeapCTypeSubclass_spec = {
    "_testcapi.HeapCTypeSubclass",
    sizeof(HeapCTypeSubclassObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeSubclass_slots
};

TyDoc_STRVAR(heapctypewithbuffer__doc__,
"Heap type with buffer support.\n\n"
"The buffer is set to [b'1', b'2', b'3', b'4']");

typedef struct {
    HeapCTypeObject base;
    char buffer[4];
} HeapCTypeWithBufferObject;

static int
heapctypewithbuffer_getbuffer(TyObject *op, Ty_buffer *view, int flags)
{
    HeapCTypeWithBufferObject *self = (HeapCTypeWithBufferObject*)op;
    self->buffer[0] = '1';
    self->buffer[1] = '2';
    self->buffer[2] = '3';
    self->buffer[3] = '4';
    return PyBuffer_FillInfo(
        view, (TyObject*)self, (void *)self->buffer, 4, 1, flags);
}

static void
heapctypewithbuffer_releasebuffer(TyObject *op, Ty_buffer *view)
{
    HeapCTypeWithBufferObject *self = (HeapCTypeWithBufferObject*)op;
    assert(view->obj == (void*) self);
}

static TyType_Slot HeapCTypeWithBuffer_slots[] = {
    {Ty_bf_getbuffer, heapctypewithbuffer_getbuffer},
    {Ty_bf_releasebuffer, heapctypewithbuffer_releasebuffer},
    {Ty_tp_doc, (char*)heapctypewithbuffer__doc__},
    {0, 0},
};

static TyType_Spec HeapCTypeWithBuffer_spec = {
    "_testcapi.HeapCTypeWithBuffer",
    sizeof(HeapCTypeWithBufferObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithBuffer_slots
};

TyDoc_STRVAR(heapctypesubclasswithfinalizer__doc__,
"Subclass of HeapCType with a finalizer that reassigns __class__.\n\n"
"__class__ is set to plain HeapCTypeSubclass during finalization.\n"
"__init__ sets the 'value' attribute to 10 and 'value2' to 20.");

static int
heapctypesubclasswithfinalizer_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    TyTypeObject *base = (TyTypeObject *)TyType_GetSlot(Ty_TYPE(self), Ty_tp_base);
    initproc base_init = TyType_GetSlot(base, Ty_tp_init);
    base_init(self, args, kwargs);
    return 0;
}

static void
heapctypesubclasswithfinalizer_finalize(TyObject *self)
{
    TyObject *oldtype = NULL, *newtype = NULL, *refcnt = NULL;

    /* Save the current exception, if any. */
    TyObject *exc = TyErr_GetRaisedException();

    if (_testcapimodule == NULL) {
        goto cleanup_finalize;
    }
    TyObject *m = PyState_FindModule(_testcapimodule);
    if (m == NULL) {
        goto cleanup_finalize;
    }
    oldtype = PyObject_GetAttrString(m, "HeapCTypeSubclassWithFinalizer");
    if (oldtype == NULL) {
        goto cleanup_finalize;
    }
    newtype = PyObject_GetAttrString(m, "HeapCTypeSubclass");
    if (newtype == NULL) {
        goto cleanup_finalize;
    }

    if (PyObject_SetAttrString(self, "__class__", newtype) < 0) {
        goto cleanup_finalize;
    }
    refcnt = TyLong_FromSsize_t(Ty_REFCNT(oldtype));
    if (refcnt == NULL) {
        goto cleanup_finalize;
    }
    if (PyObject_SetAttrString(oldtype, "refcnt_in_del", refcnt) < 0) {
        goto cleanup_finalize;
    }
    Ty_DECREF(refcnt);
    refcnt = TyLong_FromSsize_t(Ty_REFCNT(newtype));
    if (refcnt == NULL) {
        goto cleanup_finalize;
    }
    if (PyObject_SetAttrString(newtype, "refcnt_in_del", refcnt) < 0) {
        goto cleanup_finalize;
    }

cleanup_finalize:
    Ty_XDECREF(oldtype);
    Ty_XDECREF(newtype);
    Ty_XDECREF(refcnt);

    /* Restore the saved exception. */
    TyErr_SetRaisedException(exc);
}

static TyType_Slot HeapCTypeSubclassWithFinalizer_slots[] = {
    {Ty_tp_init, heapctypesubclasswithfinalizer_init},
    {Ty_tp_members, heapctypesubclass_members},
    {Ty_tp_finalize, heapctypesubclasswithfinalizer_finalize},
    {Ty_tp_doc, (char*)heapctypesubclasswithfinalizer__doc__},
    {0, 0},
};

static TyType_Spec HeapCTypeSubclassWithFinalizer_spec = {
    "_testcapi.HeapCTypeSubclassWithFinalizer",
    sizeof(HeapCTypeSubclassObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_FINALIZE,
    HeapCTypeSubclassWithFinalizer_slots
};

static TyType_Slot HeapCTypeMetaclass_slots[] = {
    {0},
};

static TyType_Spec HeapCTypeMetaclass_spec = {
    "_testcapi.HeapCTypeMetaclass",
    sizeof(PyHeapTypeObject),
    sizeof(TyMemberDef),
    Ty_TPFLAGS_DEFAULT,
    HeapCTypeMetaclass_slots
};

static TyObject *
heap_ctype_metaclass_custom_tp_new(TyTypeObject *tp, TyObject *args, TyObject *kwargs)
{
    return TyType_Type.tp_new(tp, args, kwargs);
}

static TyType_Slot HeapCTypeMetaclassCustomNew_slots[] = {
    { Ty_tp_new, heap_ctype_metaclass_custom_tp_new },
    {0},
};

static TyType_Spec HeapCTypeMetaclassCustomNew_spec = {
    "_testcapi.HeapCTypeMetaclassCustomNew",
    sizeof(PyHeapTypeObject),
    sizeof(TyMemberDef),
    Ty_TPFLAGS_DEFAULT,
    HeapCTypeMetaclassCustomNew_slots
};

static TyType_Spec HeapCTypeMetaclassNullNew_spec = {
    .name = "_testcapi.HeapCTypeMetaclassNullNew",
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION,
    .slots = empty_type_slots
};


typedef struct {
    PyObject_HEAD
    TyObject *dict;
} HeapCTypeWithDictObject;

static void
heapctypewithdict_dealloc(TyObject *op)
{
    HeapCTypeWithDictObject *self = (HeapCTypeWithDictObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    Ty_XDECREF(self->dict);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyGetSetDef heapctypewithdict_getsetlist[] = {
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
    {NULL} /* Sentinel */
};

static struct TyMemberDef heapctypewithdict_members[] = {
    {"dictobj", _Ty_T_OBJECT, offsetof(HeapCTypeWithDictObject, dict)},
    {"__dictoffset__", Ty_T_PYSSIZET, offsetof(HeapCTypeWithDictObject, dict), Py_READONLY},
    {NULL} /* Sentinel */
};

static TyType_Slot HeapCTypeWithDict_slots[] = {
    {Ty_tp_members, heapctypewithdict_members},
    {Ty_tp_getset, heapctypewithdict_getsetlist},
    {Ty_tp_dealloc, heapctypewithdict_dealloc},
    {0, 0},
};

static TyType_Spec HeapCTypeWithDict_spec = {
    "_testcapi.HeapCTypeWithDict",
    sizeof(HeapCTypeWithDictObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithDict_slots
};

static TyType_Spec HeapCTypeWithDict2_spec = {
    "_testcapi.HeapCTypeWithDict2",
    sizeof(HeapCTypeWithDictObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithDict_slots
};

static int
heapmanaged_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return PyObject_VisitManagedDict((TyObject *)self, visit, arg);
}

static int
heapmanaged_clear(TyObject *self)
{
    PyObject_ClearManagedDict(self);
    return 0;
}

static void
heapmanaged_dealloc(TyObject *op)
{
    HeapCTypeObject *self = (HeapCTypeObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_ClearManagedDict((TyObject *)self);
    PyObject_GC_UnTrack(self);
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapCTypeWithManagedDict_slots[] = {
    {Ty_tp_traverse, heapmanaged_traverse},
    {Ty_tp_getset, heapctypewithdict_getsetlist},
    {Ty_tp_clear, heapmanaged_clear},
    {Ty_tp_dealloc, heapmanaged_dealloc},
    {0, 0},
};

static TyType_Spec  HeapCTypeWithManagedDict_spec = {
    "_testcapi.HeapCTypeWithManagedDict",
    sizeof(TyObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_MANAGED_DICT,
    HeapCTypeWithManagedDict_slots
};

static void
heapctypewithmanagedweakref_dealloc(TyObject* self)
{

    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_ClearWeakRefs(self);
    PyObject_GC_UnTrack(self);
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapCTypeWithManagedWeakref_slots[] = {
    {Ty_tp_traverse, heapgcctype_traverse},
    {Ty_tp_getset, heapctypewithdict_getsetlist},
    {Ty_tp_dealloc, heapctypewithmanagedweakref_dealloc},
    {0, 0},
};

static TyType_Spec  HeapCTypeWithManagedWeakref_spec = {
    "_testcapi.HeapCTypeWithManagedWeakref",
    sizeof(TyObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_MANAGED_WEAKREF,
    HeapCTypeWithManagedWeakref_slots
};

static struct TyMemberDef heapctypewithnegativedict_members[] = {
    {"dictobj", _Ty_T_OBJECT, offsetof(HeapCTypeWithDictObject, dict)},
    {"__dictoffset__", Ty_T_PYSSIZET, -(Ty_ssize_t)sizeof(void*), Py_READONLY},
    {NULL} /* Sentinel */
};

static TyType_Slot HeapCTypeWithNegativeDict_slots[] = {
    {Ty_tp_members, heapctypewithnegativedict_members},
    {Ty_tp_getset, heapctypewithdict_getsetlist},
    {Ty_tp_dealloc, heapctypewithdict_dealloc},
    {0, 0},
};

static TyType_Spec HeapCTypeWithNegativeDict_spec = {
    "_testcapi.HeapCTypeWithNegativeDict",
    sizeof(HeapCTypeWithDictObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithNegativeDict_slots
};

typedef struct {
    PyObject_HEAD
    TyObject *weakreflist;
} HeapCTypeWithWeakrefObject;

static struct TyMemberDef heapctypewithweakref_members[] = {
    {"weakreflist", _Ty_T_OBJECT, offsetof(HeapCTypeWithWeakrefObject, weakreflist)},
    {"__weaklistoffset__", Ty_T_PYSSIZET,
      offsetof(HeapCTypeWithWeakrefObject, weakreflist), Py_READONLY},
    {NULL} /* Sentinel */
};

static void
heapctypewithweakref_dealloc(TyObject *op)
{
    HeapCTypeWithWeakrefObject *self = (HeapCTypeWithWeakrefObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    if (self->weakreflist != NULL)
        PyObject_ClearWeakRefs((TyObject *) self);
    Ty_XDECREF(self->weakreflist);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapCTypeWithWeakref_slots[] = {
    {Ty_tp_members, heapctypewithweakref_members},
    {Ty_tp_dealloc, heapctypewithweakref_dealloc},
    {0, 0},
};

static TyType_Spec HeapCTypeWithWeakref_spec = {
    "_testcapi.HeapCTypeWithWeakref",
    sizeof(HeapCTypeWithWeakrefObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithWeakref_slots
};

static TyType_Spec HeapCTypeWithWeakref2_spec = {
    "_testcapi.HeapCTypeWithWeakref2",
    sizeof(HeapCTypeWithWeakrefObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeWithWeakref_slots
};

TyDoc_STRVAR(heapctypesetattr__doc__,
"A heap type without GC, but with overridden __setattr__.\n\n"
"The 'value' attribute is set to 10 in __init__ and updated via attribute setting.");

typedef struct {
    PyObject_HEAD
    long value;
} HeapCTypeSetattrObject;

static struct TyMemberDef heapctypesetattr_members[] = {
    {"pvalue", Ty_T_LONG, offsetof(HeapCTypeSetattrObject, value)},
    {NULL} /* Sentinel */
};

static int
heapctypesetattr_init(TyObject *self, TyObject *args, TyObject *kwargs)
{
    ((HeapCTypeSetattrObject *)self)->value = 10;
    return 0;
}

static void
heapctypesetattr_dealloc(TyObject *op)
{
    HeapCTypeSetattrObject *self = (HeapCTypeSetattrObject*)op;
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static int
heapctypesetattr_setattro(TyObject *op, TyObject *attr, TyObject *value)
{
    HeapCTypeSetattrObject *self = (HeapCTypeSetattrObject*)op;
    TyObject *svalue = TyUnicode_FromString("value");
    if (svalue == NULL)
        return -1;
    int eq = PyObject_RichCompareBool(svalue, attr, Py_EQ);
    Ty_DECREF(svalue);
    if (eq < 0)
        return -1;
    if (!eq) {
        return PyObject_GenericSetAttr((TyObject*) self, attr, value);
    }
    if (value == NULL) {
        self->value = 0;
        return 0;
    }
    TyObject *ivalue = PyNumber_Long(value);
    if (ivalue == NULL)
        return -1;
    long v = TyLong_AsLong(ivalue);
    Ty_DECREF(ivalue);
    if (v == -1 && TyErr_Occurred())
        return -1;
    self->value = v;
    return 0;
}

static TyType_Slot HeapCTypeSetattr_slots[] = {
    {Ty_tp_init, heapctypesetattr_init},
    {Ty_tp_members, heapctypesetattr_members},
    {Ty_tp_setattro, heapctypesetattr_setattro},
    {Ty_tp_dealloc, heapctypesetattr_dealloc},
    {Ty_tp_doc, (char*)heapctypesetattr__doc__},
    {0, 0},
};

static TyType_Spec HeapCTypeSetattr_spec = {
    "_testcapi.HeapCTypeSetattr",
    sizeof(HeapCTypeSetattrObject),
    0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    HeapCTypeSetattr_slots
};

/*
 * The code below is for a test that uses TyType_FromSpec API to create a heap
 * type that simultaneously exposes
 *
 * - A regular __new__ / __init__ constructor pair
 * - A vector call handler in the type object
 *
 * A general requirement of vector call implementations is that they should
 * behave identically (except being potentially faster). The example below
 * deviates from this rule by initializing the instance with a different value.
 * This is only done here only so that we can see which path was taken and is
 * strongly discouraged in other cases.
 */

typedef struct {
    PyObject_HEAD
    long value;
} HeapCTypeVectorcallObject;

static TyObject *heapctype_vectorcall_vectorcall(TyObject *self,
                                                 TyObject *const *args_in,
                                                 size_t nargsf,
                                                 TyObject *kwargs_in)
{
    if (kwargs_in || PyVectorcall_NARGS(nargsf)) {
        return TyErr_Format(TyExc_IndexError, "HeapCTypeVectorcall() takes no arguments!");
    }

    HeapCTypeVectorcallObject *r =
        PyObject_New(HeapCTypeVectorcallObject, (TyTypeObject *) self);

    if (!r) {
        return NULL;
    }

    r->value = 1;

    return (TyObject *) r;
}

static TyObject *
heapctype_vectorcall_new(TyTypeObject* type, TyObject* args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || kwargs) {
        return TyErr_Format(TyExc_IndexError, "HeapCTypeVectorcall() takes no arguments!");
    }

    return (TyObject *) PyObject_New(HeapCTypeVectorcallObject, type);
}

static int
heapctype_vectorcall_init(TyObject *self, TyObject *args, TyObject *kwargs) {
    if (TyTuple_GET_SIZE(args) || kwargs) {
        TyErr_Format(TyExc_IndexError, "HeapCTypeVectorcall() takes no arguments!");
        return -1;
    }

    HeapCTypeVectorcallObject *o = (HeapCTypeVectorcallObject *) self;
    o->value = 2;
    return 0;
}

static struct TyMemberDef heapctype_vectorcall_members[] = {
    {"value", Ty_T_LONG, offsetof(HeapCTypeVectorcallObject, value), 0, NULL},
    {NULL}
};

static TyType_Slot HeapCTypeVectorcall_slots[] = {
    {Ty_tp_new, heapctype_vectorcall_new},
    {Ty_tp_init, heapctype_vectorcall_init},
    {Ty_tp_vectorcall, heapctype_vectorcall_vectorcall},
    {Ty_tp_members, heapctype_vectorcall_members},
    {0, 0},
};

static TyType_Spec HeapCTypeVectorcall_spec = {
    "_testcapi.HeapCTypeVectorcall",
    sizeof(HeapCTypeVectorcallObject),
    0,
    Ty_TPFLAGS_DEFAULT,
    HeapCTypeVectorcall_slots
};

TyDoc_STRVAR(HeapCCollection_doc,
"Tuple-like heap type that uses PyObject_GetItemData for items.");

static TyObject*
HeapCCollection_new(TyTypeObject *subtype, TyObject *args, TyObject *kwds)
{
    TyObject *self = NULL;
    TyObject *result = NULL;

    Ty_ssize_t size = TyTuple_GET_SIZE(args);
    self = subtype->tp_alloc(subtype, size);
    if (!self) {
        goto finally;
    }
    TyObject **data = PyObject_GetItemData(self);
    if (!data) {
        goto finally;
    }

    for (Ty_ssize_t i = 0; i < size; i++) {
        data[i] = Ty_NewRef(TyTuple_GET_ITEM(args, i));
    }

    result = self;
    self = NULL;
  finally:
    Ty_XDECREF(self);
    return result;
}

static Ty_ssize_t
HeapCCollection_length(TyObject *op)
{
    TyVarObject *self = (TyVarObject*)op;
    return Ty_SIZE(self);
}

static TyObject*
HeapCCollection_item(TyObject *self, Ty_ssize_t i)
{
    if (i < 0 || i >= Ty_SIZE(self)) {
        return TyErr_Format(TyExc_IndexError, "index %zd out of range", i);
    }
    TyObject **data = PyObject_GetItemData(self);
    if (!data) {
        return NULL;
    }
    return Ty_NewRef(data[i]);
}

static int
HeapCCollection_traverse(TyObject *self, visitproc visit, void *arg)
{
    TyObject **data = PyObject_GetItemData(self);
    if (!data) {
        return -1;
    }
    for (Ty_ssize_t i = 0; i < Ty_SIZE(self); i++) {
        Ty_VISIT(data[i]);
    }
    return 0;
}

static int
HeapCCollection_clear(TyObject *self)
{
    TyObject **data = PyObject_GetItemData(self);
    if (!data) {
        return -1;
    }
    Ty_ssize_t size = Ty_SIZE(self);
    Ty_SET_SIZE(self, 0);
    for (Ty_ssize_t i = 0; i < size; i++) {
        Ty_CLEAR(data[i]);
    }
    return 0;
}

static void
HeapCCollection_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    HeapCCollection_clear(self);
    PyObject_GC_UnTrack(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyType_Slot HeapCCollection_slots[] = {
    {Ty_tp_new, HeapCCollection_new},
    {Ty_sq_length, HeapCCollection_length},
    {Ty_sq_item, HeapCCollection_item},
    {Ty_tp_traverse, HeapCCollection_traverse},
    {Ty_tp_clear, HeapCCollection_clear},
    {Ty_tp_dealloc, HeapCCollection_dealloc},
    {Ty_tp_doc, (void *)HeapCCollection_doc},
    {0, 0},
};

static TyType_Spec HeapCCollection_spec = {
    .name = "_testcapi.HeapCCollection",
    .basicsize = sizeof(TyVarObject),
    .itemsize = sizeof(TyObject*),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_ITEMS_AT_END),
    .slots = HeapCCollection_slots,
};

int
_PyTestCapi_Init_Heaptype(TyObject *m) {
    _testcapimodule = TyModule_GetDef(m);

    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

#define ADD(name, value) do { \
        if (TyModule_Add(m, name, value) < 0) { \
            return -1; \
        } \
    } while (0)

    TyObject *HeapDocCType = TyType_FromSpec(&HeapDocCType_spec);
    ADD("HeapDocCType", HeapDocCType);

    /* bpo-41832: Add a new type to test TyType_FromSpec()
       now can accept a NULL tp_doc slot. */
    TyObject *NullTpDocType = TyType_FromSpec(&NullTpDocType_spec);
    ADD("NullTpDocType", NullTpDocType);

    TyObject *HeapGcCType = TyType_FromSpec(&HeapGcCType_spec);
    ADD("HeapGcCType", HeapGcCType);

    TyObject *HeapCType = TyType_FromSpec(&HeapCType_spec);
    if (HeapCType == NULL) {
        return -1;
    }
    TyObject *subclass_bases = TyTuple_Pack(1, HeapCType);
    Ty_DECREF(HeapCType);
    if (subclass_bases == NULL) {
        return -1;
    }
    TyObject *HeapCTypeSubclass = TyType_FromSpecWithBases(&HeapCTypeSubclass_spec, subclass_bases);
    Ty_DECREF(subclass_bases);
    ADD("HeapCTypeSubclass", HeapCTypeSubclass);

    TyObject *HeapCTypeWithDict = TyType_FromSpec(&HeapCTypeWithDict_spec);
    ADD("HeapCTypeWithDict", HeapCTypeWithDict);

    TyObject *HeapCTypeWithDict2 = TyType_FromSpec(&HeapCTypeWithDict2_spec);
    ADD("HeapCTypeWithDict2", HeapCTypeWithDict2);

    TyObject *HeapCTypeWithNegativeDict = TyType_FromSpec(&HeapCTypeWithNegativeDict_spec);
    ADD("HeapCTypeWithNegativeDict", HeapCTypeWithNegativeDict);

    TyObject *HeapCTypeWithManagedDict = TyType_FromSpec(&HeapCTypeWithManagedDict_spec);
    ADD("HeapCTypeWithManagedDict", HeapCTypeWithManagedDict);

    TyObject *HeapCTypeWithManagedWeakref = TyType_FromSpec(&HeapCTypeWithManagedWeakref_spec);
    ADD("HeapCTypeWithManagedWeakref", HeapCTypeWithManagedWeakref);

    TyObject *HeapCTypeWithWeakref = TyType_FromSpec(&HeapCTypeWithWeakref_spec);
    ADD("HeapCTypeWithWeakref", HeapCTypeWithWeakref);

    TyObject *HeapCTypeWithWeakref2 = TyType_FromSpec(&HeapCTypeWithWeakref2_spec);
    ADD("HeapCTypeWithWeakref2", HeapCTypeWithWeakref2);

    TyObject *HeapCTypeWithBuffer = TyType_FromSpec(&HeapCTypeWithBuffer_spec);
    ADD("HeapCTypeWithBuffer", HeapCTypeWithBuffer);

    TyObject *HeapCTypeSetattr = TyType_FromSpec(&HeapCTypeSetattr_spec);
    ADD("HeapCTypeSetattr", HeapCTypeSetattr);

    TyObject *HeapCTypeVectorcall = TyType_FromSpec(&HeapCTypeVectorcall_spec);
    ADD("HeapCTypeVectorcall", HeapCTypeVectorcall);

    TyObject *subclass_with_finalizer_bases = TyTuple_Pack(1, HeapCTypeSubclass);
    if (subclass_with_finalizer_bases == NULL) {
        return -1;
    }
    TyObject *HeapCTypeSubclassWithFinalizer = TyType_FromSpecWithBases(
        &HeapCTypeSubclassWithFinalizer_spec, subclass_with_finalizer_bases);
    Ty_DECREF(subclass_with_finalizer_bases);
    ADD("HeapCTypeSubclassWithFinalizer", HeapCTypeSubclassWithFinalizer);

    TyObject *HeapCTypeMetaclass = TyType_FromMetaclass(
        &TyType_Type, m, &HeapCTypeMetaclass_spec, (TyObject *) &TyType_Type);
    ADD("HeapCTypeMetaclass", HeapCTypeMetaclass);

    TyObject *HeapCTypeMetaclassCustomNew = TyType_FromMetaclass(
        &TyType_Type, m, &HeapCTypeMetaclassCustomNew_spec, (TyObject *) &TyType_Type);
    ADD("HeapCTypeMetaclassCustomNew", HeapCTypeMetaclassCustomNew);

    TyObject *HeapCTypeMetaclassNullNew = TyType_FromMetaclass(
        &TyType_Type, m, &HeapCTypeMetaclassNullNew_spec, (TyObject *) &TyType_Type);
    ADD("HeapCTypeMetaclassNullNew", HeapCTypeMetaclassNullNew);

    ADD("Ty_TP_USE_SPEC", TyLong_FromVoidPtr(Ty_TP_USE_SPEC));

    TyObject *HeapCCollection = TyType_FromMetaclass(
        NULL, m, &HeapCCollection_spec, NULL);
    if (HeapCCollection == NULL) {
        return -1;
    }
    int rc = TyModule_AddType(m, (TyTypeObject *)HeapCCollection);
    Ty_DECREF(HeapCCollection);
    if (rc < 0) {
        return -1;
    }

    return 0;
}
