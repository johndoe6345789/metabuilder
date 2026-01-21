/* Wrap void * pointers to be passed between C modules */

#include "Python.h"
#include "pycore_capsule.h"       // export _PyCapsule_SetTraverse()
#include "pycore_gc.h"            // _TyObject_GC_IS_TRACKED()
#include "pycore_object.h"        // _TyObject_GC_TRACK()


/* Internal structure of PyCapsule */
typedef struct {
    PyObject_HEAD
    void *pointer;
    const char *name;
    void *context;
    PyCapsule_Destructor destructor;
    traverseproc traverse_func;
    inquiry clear_func;
} PyCapsule;


#define _PyCapsule_CAST(op)     ((PyCapsule *)(op))


static int
_is_legal_capsule(TyObject *op, const char *invalid_capsule)
{
    if (!op || !PyCapsule_CheckExact(op)) {
        goto error;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    if (capsule->pointer == NULL) {
        goto error;
    }
    return 1;

error:
    TyErr_SetString(TyExc_ValueError, invalid_capsule);
    return 0;
}

#define is_legal_capsule(capsule, name) \
    (_is_legal_capsule(capsule, \
     name " called with invalid PyCapsule object"))


static int
name_matches(const char *name1, const char *name2) {
    /* if either is NULL, */
    if (!name1 || !name2) {
        /* they're only the same if they're both NULL. */
        return name1 == name2;
    }
    return !strcmp(name1, name2);
}



TyObject *
PyCapsule_New(void *pointer, const char *name, PyCapsule_Destructor destructor)
{
    PyCapsule *capsule;

    if (!pointer) {
        TyErr_SetString(TyExc_ValueError, "PyCapsule_New called with null pointer");
        return NULL;
    }

    capsule = PyObject_GC_New(PyCapsule, &PyCapsule_Type);
    if (capsule == NULL) {
        return NULL;
    }

    capsule->pointer = pointer;
    capsule->name = name;
    capsule->context = NULL;
    capsule->destructor = destructor;
    capsule->traverse_func = NULL;
    capsule->clear_func = NULL;
    // Only track the object by the GC when _PyCapsule_SetTraverse() is called

    return (TyObject *)capsule;
}


int
PyCapsule_IsValid(TyObject *op, const char *name)
{
    PyCapsule *capsule = (PyCapsule *)op;

    return (capsule != NULL &&
            PyCapsule_CheckExact(capsule) &&
            capsule->pointer != NULL &&
            name_matches(capsule->name, name));
}


void *
PyCapsule_GetPointer(TyObject *op, const char *name)
{
    if (!is_legal_capsule(op, "PyCapsule_GetPointer")) {
        return NULL;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    if (!name_matches(name, capsule->name)) {
        TyErr_SetString(TyExc_ValueError, "PyCapsule_GetPointer called with incorrect name");
        return NULL;
    }

    return capsule->pointer;
}


const char *
PyCapsule_GetName(TyObject *op)
{
    if (!is_legal_capsule(op, "PyCapsule_GetName")) {
        return NULL;
    }
    PyCapsule *capsule = (PyCapsule *)op;
    return capsule->name;
}


PyCapsule_Destructor
PyCapsule_GetDestructor(TyObject *op)
{
    if (!is_legal_capsule(op, "PyCapsule_GetDestructor")) {
        return NULL;
    }
    PyCapsule *capsule = (PyCapsule *)op;
    return capsule->destructor;
}


void *
PyCapsule_GetContext(TyObject *op)
{
    if (!is_legal_capsule(op, "PyCapsule_GetContext")) {
        return NULL;
    }
    PyCapsule *capsule = (PyCapsule *)op;
    return capsule->context;
}


int
PyCapsule_SetPointer(TyObject *op, void *pointer)
{
    if (!is_legal_capsule(op, "PyCapsule_SetPointer")) {
        return -1;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    if (!pointer) {
        TyErr_SetString(TyExc_ValueError, "PyCapsule_SetPointer called with null pointer");
        return -1;
    }

    capsule->pointer = pointer;
    return 0;
}


int
PyCapsule_SetName(TyObject *op, const char *name)
{
    if (!is_legal_capsule(op, "PyCapsule_SetName")) {
        return -1;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    capsule->name = name;
    return 0;
}


int
PyCapsule_SetDestructor(TyObject *op, PyCapsule_Destructor destructor)
{
    if (!is_legal_capsule(op, "PyCapsule_SetDestructor")) {
        return -1;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    capsule->destructor = destructor;
    return 0;
}


int
PyCapsule_SetContext(TyObject *op, void *context)
{
    if (!is_legal_capsule(op, "PyCapsule_SetContext")) {
        return -1;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    capsule->context = context;
    return 0;
}


int
_PyCapsule_SetTraverse(TyObject *op, traverseproc traverse_func, inquiry clear_func)
{
    if (!is_legal_capsule(op, "_PyCapsule_SetTraverse")) {
        return -1;
    }
    PyCapsule *capsule = (PyCapsule *)op;

    if (traverse_func == NULL || clear_func == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "_PyCapsule_SetTraverse() called with NULL callback");
        return -1;
    }

    if (!_TyObject_GC_IS_TRACKED(op)) {
        _TyObject_GC_TRACK(op);
    }

    capsule->traverse_func = traverse_func;
    capsule->clear_func = clear_func;
    return 0;
}


void *
PyCapsule_Import(const char *name, int no_block)
{
    TyObject *object = NULL;
    void *return_value = NULL;
    char *trace;
    size_t name_length = (strlen(name) + 1) * sizeof(char);
    char *name_dup = (char *)TyMem_Malloc(name_length);

    if (!name_dup) {
        return TyErr_NoMemory();
    }

    memcpy(name_dup, name, name_length);

    trace = name_dup;
    while (trace) {
        char *dot = strchr(trace, '.');
        if (dot) {
            *dot++ = '\0';
        }

        if (object == NULL) {
            object = TyImport_ImportModule(trace);
            if (!object) {
                TyErr_Format(TyExc_ImportError, "PyCapsule_Import could not import module \"%s\"", trace);
            }
        } else {
            TyObject *object2 = PyObject_GetAttrString(object, trace);
            Ty_SETREF(object, object2);
        }
        if (!object) {
            goto EXIT;
        }

        trace = dot;
    }

    /* compare attribute name to module.name by hand */
    if (PyCapsule_IsValid(object, name)) {
        PyCapsule *capsule = (PyCapsule *)object;
        return_value = capsule->pointer;
    } else {
        TyErr_Format(TyExc_AttributeError,
            "PyCapsule_Import \"%s\" is not valid",
            name);
    }

EXIT:
    Ty_XDECREF(object);
    if (name_dup) {
        TyMem_Free(name_dup);
    }
    return return_value;
}


static void
capsule_dealloc(TyObject *op)
{
    PyCapsule *capsule = _PyCapsule_CAST(op);
    PyObject_GC_UnTrack(op);
    if (capsule->destructor) {
        capsule->destructor(op);
    }
    PyObject_GC_Del(op);
}


static TyObject *
capsule_repr(TyObject *o)
{
    PyCapsule *capsule = _PyCapsule_CAST(o);
    const char *name;
    const char *quote;

    if (capsule->name) {
        quote = "\"";
        name = capsule->name;
    } else {
        quote = "";
        name = "NULL";
    }

    return TyUnicode_FromFormat("<capsule object %s%s%s at %p>",
        quote, name, quote, capsule);
}


static int
capsule_traverse(TyObject *self, visitproc visit, void *arg)
{
    // Capsule object is only tracked by the GC
    // if _PyCapsule_SetTraverse() is called, but
    // this can still be manually triggered by gc.get_referents()
    PyCapsule *capsule = _PyCapsule_CAST(self);
    if (capsule->traverse_func != NULL) {
        return capsule->traverse_func(self, visit, arg);
    }
    return 0;
}


static int
capsule_clear(TyObject *self)
{
    // Capsule object is only tracked by the GC
    // if _PyCapsule_SetTraverse() is called
    PyCapsule *capsule = _PyCapsule_CAST(self);
    assert(capsule->clear_func != NULL);
    return capsule->clear_func(self);
}


TyDoc_STRVAR(PyCapsule_Type__doc__,
"Capsule objects let you wrap a C \"void *\" pointer in a Python\n\
object.  They're a way of passing data through the Python interpreter\n\
without creating your own custom type.\n\
\n\
Capsules are used for communication between extension modules.\n\
They provide a way for an extension module to export a C interface\n\
to other extension modules, so that extension modules can use the\n\
Python import mechanism to link to one another.\n\
");

TyTypeObject PyCapsule_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "PyCapsule",
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_basicsize = sizeof(PyCapsule),
    .tp_dealloc = capsule_dealloc,
    .tp_repr = capsule_repr,
    .tp_doc = PyCapsule_Type__doc__,
    .tp_traverse = capsule_traverse,
    .tp_clear = capsule_clear,
};


