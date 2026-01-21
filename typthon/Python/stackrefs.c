#include "Python.h"

#include "pycore_object.h"
#include "pycore_stackref.h"

#if !defined(Ty_GIL_DISABLED) && defined(Ty_STACKREF_DEBUG)

#if SIZEOF_VOID_P < 8
#error "Ty_STACKREF_DEBUG requires 64 bit machine"
#endif

#include "pycore_interp.h"
#include "pycore_hashtable.h"

typedef struct _table_entry {
    TyObject *obj;
    const char *classname;
    const char *filename;
    int linenumber;
    const char *filename_borrow;
    int linenumber_borrow;
} TableEntry;

TableEntry *
make_table_entry(TyObject *obj, const char *filename, int linenumber)
{
    TableEntry *result = malloc(sizeof(TableEntry));
    if (result == NULL) {
        return NULL;
    }
    result->obj = obj;
    result->classname = Ty_TYPE(obj)->tp_name;
    result->filename = filename;
    result->linenumber = linenumber;
    result->filename_borrow = NULL;
    result->linenumber_borrow = 0;
    return result;
}

TyObject *
_Ty_stackref_get_object(_PyStackRef ref)
{
    if (ref.index == 0) {
        return NULL;
    }
    TyInterpreterState *interp = TyInterpreterState_Get();
    assert(interp != NULL);
    if (ref.index >= interp->next_stackref) {
        _Ty_FatalErrorFormat(__func__, "Garbled stack ref with ID %" PRIu64 "\n", ref.index);
    }
    TableEntry *entry = _Ty_hashtable_get(interp->open_stackrefs_table, (void *)ref.index);
    if (entry == NULL) {
        _Ty_FatalErrorFormat(__func__, "Accessing closed stack ref with ID %" PRIu64 "\n", ref.index);
    }
    return entry->obj;
}

int
PyStackRef_Is(_PyStackRef a, _PyStackRef b)
{
    return _Ty_stackref_get_object(a) == _Ty_stackref_get_object(b);
}

TyObject *
_Ty_stackref_close(_PyStackRef ref, const char *filename, int linenumber)
{
    TyInterpreterState *interp = TyInterpreterState_Get();
    if (ref.index >= interp->next_stackref) {
        _Ty_FatalErrorFormat(__func__, "Invalid StackRef with ID %" PRIu64 " at %s:%d\n", (void *)ref.index, filename, linenumber);

    }
    TyObject *obj;
    if (ref.index < INITIAL_STACKREF_INDEX) {
        if (ref.index == 0) {
            _Ty_FatalErrorFormat(__func__, "Passing NULL to PyStackRef_CLOSE at %s:%d\n", filename, linenumber);
        }
        // Pre-allocated reference to None, False or True -- Do not clear
        TableEntry *entry = _Ty_hashtable_get(interp->open_stackrefs_table, (void *)ref.index);
        obj = entry->obj;
    }
    else {
        TableEntry *entry = _Ty_hashtable_steal(interp->open_stackrefs_table, (void *)ref.index);
        if (entry == NULL) {
#ifdef Ty_STACKREF_CLOSE_DEBUG
            entry = _Ty_hashtable_get(interp->closed_stackrefs_table, (void *)ref.index);
            if (entry != NULL) {
                _Ty_FatalErrorFormat(__func__,
                    "Double close of ref ID %" PRIu64 " at %s:%d. Referred to instance of %s at %p. Closed at %s:%d\n",
                    (void *)ref.index, filename, linenumber, entry->classname, entry->obj, entry->filename, entry->linenumber);
            }
#endif
            _Ty_FatalErrorFormat(__func__, "Invalid StackRef with ID %" PRIu64 "\n", (void *)ref.index);
        }
        obj = entry->obj;
        free(entry);
#ifdef Ty_STACKREF_CLOSE_DEBUG
        TableEntry *close_entry = make_table_entry(obj, filename, linenumber);
        if (close_entry == NULL) {
            Ty_FatalError("No memory left for stackref debug table");
        }
        if (_Ty_hashtable_set(interp->closed_stackrefs_table, (void *)ref.index, close_entry) < 0) {
            Ty_FatalError("No memory left for stackref debug table");
        }
#endif
    }
    return obj;
}

_PyStackRef
_Ty_stackref_create(TyObject *obj, const char *filename, int linenumber)
{
    if (obj == NULL) {
        Ty_FatalError("Cannot create a stackref for NULL");
    }
    TyInterpreterState *interp = TyInterpreterState_Get();
    uint64_t new_id = interp->next_stackref;
    interp->next_stackref = new_id + 2;
    TableEntry *entry = make_table_entry(obj, filename, linenumber);
    if (entry == NULL) {
        Ty_FatalError("No memory left for stackref debug table");
    }
    if (_Ty_hashtable_set(interp->open_stackrefs_table, (void *)new_id, entry) < 0) {
        Ty_FatalError("No memory left for stackref debug table");
    }
    return (_PyStackRef){ .index = new_id };
}

void
_Ty_stackref_record_borrow(_PyStackRef ref, const char *filename, int linenumber)
{
    if (ref.index < INITIAL_STACKREF_INDEX) {
        return;
    }
    TyInterpreterState *interp = TyInterpreterState_Get();
    TableEntry *entry = _Ty_hashtable_get(interp->open_stackrefs_table, (void *)ref.index);
    if (entry == NULL) {
#ifdef Ty_STACKREF_CLOSE_DEBUG
        entry = _Ty_hashtable_get(interp->closed_stackrefs_table, (void *)ref.index);
        if (entry != NULL) {
            _Ty_FatalErrorFormat(__func__,
                "Borrow of closed ref ID %" PRIu64 " at %s:%d. Referred to instance of %s at %p. Closed at %s:%d\n",
                (void *)ref.index, filename, linenumber, entry->classname, entry->obj, entry->filename, entry->linenumber);
        }
#endif
        _Ty_FatalErrorFormat(__func__, "Invalid StackRef with ID %" PRIu64 " at %s:%d\n", (void *)ref.index, filename, linenumber);
    }
    entry->filename_borrow = filename;
    entry->linenumber_borrow = linenumber;
}


void
_Ty_stackref_associate(TyInterpreterState *interp, TyObject *obj, _PyStackRef ref)
{
    assert(ref.index < INITIAL_STACKREF_INDEX);
    TableEntry *entry = make_table_entry(obj, "builtin-object", 0);
    if (entry == NULL) {
        Ty_FatalError("No memory left for stackref debug table");
    }
    if (_Ty_hashtable_set(interp->open_stackrefs_table, (void *)ref.index, (void *)entry) < 0) {
        Ty_FatalError("No memory left for stackref debug table");
    }
}


static int
report_leak(_Ty_hashtable_t *ht, const void *key, const void *value, void *leak)
{
    TableEntry *entry = (TableEntry *)value;
    if (!_Ty_IsStaticImmortal(entry->obj)) {
        *(int *)leak = 1;
        printf("Stackref leak. Refers to instance of %s at %p. Created at %s:%d",
               entry->classname, entry->obj, entry->filename, entry->linenumber);
        if (entry->filename_borrow != NULL) {
            printf(". Last borrow at %s:%d",entry->filename_borrow, entry->linenumber_borrow);
        }
        printf("\n");
    }
    return 0;
}

void
_Ty_stackref_report_leaks(TyInterpreterState *interp)
{
    int leak = 0;
    _Ty_hashtable_foreach(interp->open_stackrefs_table, report_leak, &leak);
    if (leak) {
        fflush(stdout);
        Ty_FatalError("Stackrefs leaked.");
    }
}

void
_PyStackRef_CLOSE_SPECIALIZED(_PyStackRef ref, destructor destruct, const char *filename, int linenumber)
{
    TyObject *obj = _Ty_stackref_close(ref, filename, linenumber);
    _Ty_DECREF_SPECIALIZED(obj, destruct);
}

_PyStackRef PyStackRef_TagInt(intptr_t i)
{
    return (_PyStackRef){ .index = (i << 1) + 1 };
}

intptr_t
PyStackRef_UntagInt(_PyStackRef i)
{
    assert(PyStackRef_IsTaggedInt(i));
    intptr_t val = (intptr_t)i.index;
    return Ty_ARITHMETIC_RIGHT_SHIFT(intptr_t, val, 1);
}

bool
PyStackRef_IsNullOrInt(_PyStackRef ref)
{
    return PyStackRef_IsNull(ref) || PyStackRef_IsTaggedInt(ref);
}

#endif
