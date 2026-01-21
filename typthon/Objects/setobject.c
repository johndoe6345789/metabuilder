
/* set object implementation

   Written and maintained by Raymond D. Hettinger <python@rcn.com>
   Derived from Objects/dictobject.c.

   The basic lookup function used by all operations.
   This is based on Algorithm D from Knuth Vol. 3, Sec. 6.4.

   The initial probe index is computed as hash mod the table size.
   Subsequent probe indices are computed as explained in Objects/dictobject.c.

   To improve cache locality, each probe inspects a series of consecutive
   nearby entries before moving on to probes elsewhere in memory.  This leaves
   us with a hybrid of linear probing and randomized probing.  The linear probing
   reduces the cost of hash collisions because consecutive memory accesses
   tend to be much cheaper than scattered probes.  After LINEAR_PROBES steps,
   we then use more of the upper bits from the hash value and apply a simple
   linear congruential random number generator.  This helps break-up long
   chains of collisions.

   All arithmetic on hash should ignore overflow.

   Unlike the dictionary implementation, the lookkey function can return
   NULL if the rich comparison returns an error.

   Use cases for sets differ considerably from dictionaries where looked-up
   keys are more likely to be present.  In contrast, sets are primarily
   about membership testing where the presence of an element is not known in
   advance.  Accordingly, the set implementation needs to optimize for both
   the found and not-found case.
*/

#include "Python.h"
#include "pycore_ceval.h"               // _TyEval_GetBuiltin()
#include "pycore_critical_section.h"    // Ty_BEGIN_CRITICAL_SECTION, Ty_END_CRITICAL_SECTION
#include "pycore_dict.h"                // _TyDict_Contains_KnownHash()
#include "pycore_modsupport.h"          // _TyArg_NoKwnames()
#include "pycore_object.h"              // _TyObject_GC_UNTRACK()
#include "pycore_pyatomic_ft_wrappers.h"  // FT_ATOMIC_LOAD_SSIZE_RELAXED()
#include "pycore_pyerrors.h"            // _TyErr_SetKeyError()
#include "pycore_setobject.h"           // _TySet_NextEntry() definition
#include "pycore_weakref.h"             // FT_CLEAR_WEAKREFS()

#include "stringlib/eq.h"               // unicode_eq()
#include <stddef.h>                     // offsetof()
#include "clinic/setobject.c.h"

/*[clinic input]
class set "PySetObject *" "&TySet_Type"
class frozenset "PySetObject *" "&TyFrozenSet_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=97ad1d3e9f117079]*/

/*[python input]
class setobject_converter(self_converter):
    type = "PySetObject *"
[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=33a44506d4d57793]*/

/* Object used as dummy key to fill deleted entries */
static TyObject _dummy_struct;

#define dummy (&_dummy_struct)


/* ======================================================================== */
/* ======= Begin logic for probing the hash table ========================= */

/* Set this to zero to turn-off linear probing */
#ifndef LINEAR_PROBES
#define LINEAR_PROBES 9
#endif

/* This must be >= 1 */
#define PERTURB_SHIFT 5

static setentry *
set_lookkey(PySetObject *so, TyObject *key, Ty_hash_t hash)
{
    setentry *table;
    setentry *entry;
    size_t perturb = hash;
    size_t mask = so->mask;
    size_t i = (size_t)hash & mask; /* Unsigned for defined overflow behavior */
    int probes;
    int cmp;

    while (1) {
        entry = &so->table[i];
        probes = (i + LINEAR_PROBES <= mask) ? LINEAR_PROBES: 0;
        do {
            if (entry->hash == 0 && entry->key == NULL)
                return entry;
            if (entry->hash == hash) {
                TyObject *startkey = entry->key;
                assert(startkey != dummy);
                if (startkey == key)
                    return entry;
                if (TyUnicode_CheckExact(startkey)
                    && TyUnicode_CheckExact(key)
                    && unicode_eq(startkey, key))
                    return entry;
                table = so->table;
                Ty_INCREF(startkey);
                cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
                Ty_DECREF(startkey);
                if (cmp < 0)
                    return NULL;
                if (table != so->table || entry->key != startkey)
                    return set_lookkey(so, key, hash);
                if (cmp > 0)
                    return entry;
                mask = so->mask;
            }
            entry++;
        } while (probes--);
        perturb >>= PERTURB_SHIFT;
        i = (i * 5 + 1 + perturb) & mask;
    }
}

static int set_table_resize(PySetObject *, Ty_ssize_t);

static int
set_add_entry_takeref(PySetObject *so, TyObject *key, Ty_hash_t hash)
{
    setentry *table;
    setentry *freeslot;
    setentry *entry;
    size_t perturb;
    size_t mask;
    size_t i;                       /* Unsigned for defined overflow behavior */
    int probes;
    int cmp;

  restart:

    mask = so->mask;
    i = (size_t)hash & mask;
    freeslot = NULL;
    perturb = hash;

    while (1) {
        entry = &so->table[i];
        probes = (i + LINEAR_PROBES <= mask) ? LINEAR_PROBES: 0;
        do {
            if (entry->hash == 0 && entry->key == NULL)
                goto found_unused_or_dummy;
            if (entry->hash == hash) {
                TyObject *startkey = entry->key;
                assert(startkey != dummy);
                if (startkey == key)
                    goto found_active;
                if (TyUnicode_CheckExact(startkey)
                    && TyUnicode_CheckExact(key)
                    && unicode_eq(startkey, key))
                    goto found_active;
                table = so->table;
                Ty_INCREF(startkey);
                cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
                Ty_DECREF(startkey);
                if (cmp > 0)
                    goto found_active;
                if (cmp < 0)
                    goto comparison_error;
                if (table != so->table || entry->key != startkey)
                    goto restart;
                mask = so->mask;
            }
            else if (entry->hash == -1) {
                assert (entry->key == dummy);
                freeslot = entry;
            }
            entry++;
        } while (probes--);
        perturb >>= PERTURB_SHIFT;
        i = (i * 5 + 1 + perturb) & mask;
    }

  found_unused_or_dummy:
    if (freeslot == NULL)
        goto found_unused;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, so->used + 1);
    freeslot->key = key;
    freeslot->hash = hash;
    return 0;

  found_unused:
    so->fill++;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, so->used + 1);
    entry->key = key;
    entry->hash = hash;
    if ((size_t)so->fill*5 < mask*3)
        return 0;
    return set_table_resize(so, so->used>50000 ? so->used*2 : so->used*4);

  found_active:
    Ty_DECREF(key);
    return 0;

  comparison_error:
    Ty_DECREF(key);
    return -1;
}

static int
set_add_entry(PySetObject *so, TyObject *key, Ty_hash_t hash)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);

    return set_add_entry_takeref(so, Ty_NewRef(key), hash);
}

static void
set_unhashable_type(TyObject *key)
{
    TyObject *exc = TyErr_GetRaisedException();
    assert(exc != NULL);
    if (!Ty_IS_TYPE(exc, (TyTypeObject*)TyExc_TypeError)) {
        TyErr_SetRaisedException(exc);
        return;
    }

    TyErr_Format(TyExc_TypeError,
                 "cannot use '%T' as a set element (%S)",
                 key, exc);
    Ty_DECREF(exc);
}

int
_TySet_AddTakeRef(PySetObject *so, TyObject *key)
{
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        set_unhashable_type(key);
        Ty_DECREF(key);
        return -1;
    }
    // We don't pre-increment here, the caller holds a strong
    // reference to the object which we are stealing.
    return set_add_entry_takeref(so, key, hash);
}

/*
Internal routine used by set_table_resize() to insert an item which is
known to be absent from the set.  Besides the performance benefit,
there is also safety benefit since using set_add_entry() risks making
a callback in the middle of a set_table_resize(), see issue 1456209.
The caller is responsible for updating the key's reference count and
the setobject's fill and used fields.
*/
static void
set_insert_clean(setentry *table, size_t mask, TyObject *key, Ty_hash_t hash)
{
    setentry *entry;
    size_t perturb = hash;
    size_t i = (size_t)hash & mask;
    size_t j;

    while (1) {
        entry = &table[i];
        if (entry->key == NULL)
            goto found_null;
        if (i + LINEAR_PROBES <= mask) {
            for (j = 0; j < LINEAR_PROBES; j++) {
                entry++;
                if (entry->key == NULL)
                    goto found_null;
            }
        }
        perturb >>= PERTURB_SHIFT;
        i = (i * 5 + 1 + perturb) & mask;
    }
  found_null:
    entry->key = key;
    entry->hash = hash;
}

/* ======== End logic for probing the hash table ========================== */
/* ======================================================================== */

/*
Restructure the table by allocating a new table and reinserting all
keys again.  When entries have been deleted, the new table may
actually be smaller than the old one.
*/
static int
set_table_resize(PySetObject *so, Ty_ssize_t minused)
{
    setentry *oldtable, *newtable, *entry;
    Ty_ssize_t oldmask = so->mask;
    size_t newmask;
    int is_oldtable_malloced;
    setentry small_copy[TySet_MINSIZE];

    assert(minused >= 0);

    /* Find the smallest table size > minused. */
    /* XXX speed-up with intrinsics */
    size_t newsize = TySet_MINSIZE;
    while (newsize <= (size_t)minused) {
        newsize <<= 1; // The largest possible value is PY_SSIZE_T_MAX + 1.
    }

    /* Get space for a new table. */
    oldtable = so->table;
    assert(oldtable != NULL);
    is_oldtable_malloced = oldtable != so->smalltable;

    if (newsize == TySet_MINSIZE) {
        /* A large table is shrinking, or we can't get any smaller. */
        newtable = so->smalltable;
        if (newtable == oldtable) {
            if (so->fill == so->used) {
                /* No dummies, so no point doing anything. */
                return 0;
            }
            /* We're not going to resize it, but rebuild the
               table anyway to purge old dummy entries.
               Subtle:  This is *necessary* if fill==size,
               as set_lookkey needs at least one virgin slot to
               terminate failing searches.  If fill < size, it's
               merely desirable, as dummies slow searches. */
            assert(so->fill > so->used);
            memcpy(small_copy, oldtable, sizeof(small_copy));
            oldtable = small_copy;
        }
    }
    else {
        newtable = TyMem_NEW(setentry, newsize);
        if (newtable == NULL) {
            TyErr_NoMemory();
            return -1;
        }
    }

    /* Make the set empty, using the new table. */
    assert(newtable != oldtable);
    memset(newtable, 0, sizeof(setentry) * newsize);
    so->mask = newsize - 1;
    so->table = newtable;

    /* Copy the data over; this is refcount-neutral for active entries;
       dummy entries aren't copied over, of course */
    newmask = (size_t)so->mask;
    if (so->fill == so->used) {
        for (entry = oldtable; entry <= oldtable + oldmask; entry++) {
            if (entry->key != NULL) {
                set_insert_clean(newtable, newmask, entry->key, entry->hash);
            }
        }
    } else {
        so->fill = so->used;
        for (entry = oldtable; entry <= oldtable + oldmask; entry++) {
            if (entry->key != NULL && entry->key != dummy) {
                set_insert_clean(newtable, newmask, entry->key, entry->hash);
            }
        }
    }

    if (is_oldtable_malloced)
        TyMem_Free(oldtable);
    return 0;
}

static int
set_contains_entry(PySetObject *so, TyObject *key, Ty_hash_t hash)
{
    setentry *entry;

    entry = set_lookkey(so, key, hash);
    if (entry != NULL)
        return entry->key != NULL;
    return -1;
}

#define DISCARD_NOTFOUND 0
#define DISCARD_FOUND 1

static int
set_discard_entry(PySetObject *so, TyObject *key, Ty_hash_t hash)
{
    setentry *entry;
    TyObject *old_key;

    entry = set_lookkey(so, key, hash);
    if (entry == NULL)
        return -1;
    if (entry->key == NULL)
        return DISCARD_NOTFOUND;
    old_key = entry->key;
    entry->key = dummy;
    entry->hash = -1;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, so->used - 1);
    Ty_DECREF(old_key);
    return DISCARD_FOUND;
}

static int
set_add_key(PySetObject *so, TyObject *key)
{
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        set_unhashable_type(key);
        return -1;
    }
    return set_add_entry(so, key, hash);
}

static int
set_contains_key(PySetObject *so, TyObject *key)
{
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        set_unhashable_type(key);
        return -1;
    }
    return set_contains_entry(so, key, hash);
}

static int
set_discard_key(PySetObject *so, TyObject *key)
{
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        set_unhashable_type(key);
        return -1;
    }
    return set_discard_entry(so, key, hash);
}

static void
set_empty_to_minsize(PySetObject *so)
{
    memset(so->smalltable, 0, sizeof(so->smalltable));
    so->fill = 0;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, 0);
    so->mask = TySet_MINSIZE - 1;
    so->table = so->smalltable;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->hash, -1);
}

static int
set_clear_internal(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    setentry *entry;
    setentry *table = so->table;
    Ty_ssize_t fill = so->fill;
    Ty_ssize_t used = so->used;
    int table_is_malloced = table != so->smalltable;
    setentry small_copy[TySet_MINSIZE];

    assert (PyAnySet_Check(so));
    assert(table != NULL);

    /* This is delicate.  During the process of clearing the set,
     * decrefs can cause the set to mutate.  To avoid fatal confusion
     * (voice of experience), we have to make the set empty before
     * clearing the slots, and never refer to anything via so->ref while
     * clearing.
     */
    if (table_is_malloced)
        set_empty_to_minsize(so);

    else if (fill > 0) {
        /* It's a small table with something that needs to be cleared.
         * Afraid the only safe way is to copy the set entries into
         * another small table first.
         */
        memcpy(small_copy, table, sizeof(small_copy));
        table = small_copy;
        set_empty_to_minsize(so);
    }
    /* else it's a small table that's already empty */

    /* Now we can finally clear things.  If C had refcounts, we could
     * assert that the refcount on table is 1 now, i.e. that this function
     * has unique access to it, so decref side-effects can't alter it.
     */
    for (entry = table; used > 0; entry++) {
        if (entry->key && entry->key != dummy) {
            used--;
            Ty_DECREF(entry->key);
        }
    }

    if (table_is_malloced)
        TyMem_Free(table);
    return 0;
}

/*
 * Iterate over a set table.  Use like so:
 *
 *     Ty_ssize_t pos;
 *     setentry *entry;
 *     pos = 0;   # important!  pos should not otherwise be changed by you
 *     while (set_next(yourset, &pos, &entry)) {
 *              Refer to borrowed reference in entry->key.
 *     }
 *
 * CAUTION:  In general, it isn't safe to use set_next in a loop that
 * mutates the table.
 */
static int
set_next(PySetObject *so, Ty_ssize_t *pos_ptr, setentry **entry_ptr)
{
    Ty_ssize_t i;
    Ty_ssize_t mask;
    setentry *entry;

    assert (PyAnySet_Check(so));
    i = *pos_ptr;
    assert(i >= 0);
    mask = so->mask;
    entry = &so->table[i];
    while (i <= mask && (entry->key == NULL || entry->key == dummy)) {
        i++;
        entry++;
    }
    *pos_ptr = i+1;
    if (i > mask)
        return 0;
    assert(entry != NULL);
    *entry_ptr = entry;
    return 1;
}

static void
set_dealloc(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    setentry *entry;
    Ty_ssize_t used = so->used;

    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(so);
    FT_CLEAR_WEAKREFS(self, so->weakreflist);

    for (entry = so->table; used > 0; entry++) {
        if (entry->key && entry->key != dummy) {
                used--;
                Ty_DECREF(entry->key);
        }
    }
    if (so->table != so->smalltable)
        TyMem_Free(so->table);
    Ty_TYPE(so)->tp_free(so);
}

static TyObject *
set_repr_lock_held(PySetObject *so)
{
    TyObject *result=NULL, *keys, *listrepr, *tmp;
    int status = Ty_ReprEnter((TyObject*)so);

    if (status != 0) {
        if (status < 0)
            return NULL;
        return TyUnicode_FromFormat("%s(...)", Ty_TYPE(so)->tp_name);
    }

    /* shortcut for the empty set */
    if (!so->used) {
        Ty_ReprLeave((TyObject*)so);
        return TyUnicode_FromFormat("%s()", Ty_TYPE(so)->tp_name);
    }

    // gh-129967: avoid PySequence_List because it might re-lock the object
    // lock or the GIL and allow something to clear the set from underneath us.
    keys = TyList_New(so->used);
    if (keys == NULL) {
        goto done;
    }

    Ty_ssize_t pos = 0, idx = 0;
    setentry *entry;
    while (set_next(so, &pos, &entry)) {
        TyList_SET_ITEM(keys, idx++, Ty_NewRef(entry->key));
    }

    /* repr(keys)[1:-1] */
    listrepr = PyObject_Repr(keys);
    Ty_DECREF(keys);
    if (listrepr == NULL)
        goto done;
    tmp = TyUnicode_Substring(listrepr, 1, TyUnicode_GET_LENGTH(listrepr)-1);
    Ty_DECREF(listrepr);
    if (tmp == NULL)
        goto done;
    listrepr = tmp;

    if (!TySet_CheckExact(so))
        result = TyUnicode_FromFormat("%s({%U})",
                                      Ty_TYPE(so)->tp_name,
                                      listrepr);
    else
        result = TyUnicode_FromFormat("{%U}", listrepr);
    Ty_DECREF(listrepr);
done:
    Ty_ReprLeave((TyObject*)so);
    return result;
}

static TyObject *
set_repr(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    TyObject *result;
    Ty_BEGIN_CRITICAL_SECTION(so);
    result = set_repr_lock_held(so);
    Ty_END_CRITICAL_SECTION();
    return result;
}

static Ty_ssize_t
set_len(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    return FT_ATOMIC_LOAD_SSIZE_RELAXED(so->used);
}

static int
set_merge_lock_held(PySetObject *so, TyObject *otherset)
{
    PySetObject *other;
    TyObject *key;
    Ty_ssize_t i;
    setentry *so_entry;
    setentry *other_entry;

    assert (PyAnySet_Check(so));
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(otherset);

    other = _TySet_CAST(otherset);
    if (other == so || other->used == 0)
        /* a.update(a) or a.update(set()); nothing to do */
        return 0;
    /* Do one big resize at the start, rather than
     * incrementally resizing as we insert new keys.  Expect
     * that there will be no (or few) overlapping keys.
     */
    if ((so->fill + other->used)*5 >= so->mask*3) {
        if (set_table_resize(so, (so->used + other->used)*2) != 0)
            return -1;
    }
    so_entry = so->table;
    other_entry = other->table;

    /* If our table is empty, and both tables have the same size, and
       there are no dummies to eliminate, then just copy the pointers. */
    if (so->fill == 0 && so->mask == other->mask && other->fill == other->used) {
        for (i = 0; i <= other->mask; i++, so_entry++, other_entry++) {
            key = other_entry->key;
            if (key != NULL) {
                assert(so_entry->key == NULL);
                so_entry->key = Ty_NewRef(key);
                so_entry->hash = other_entry->hash;
            }
        }
        so->fill = other->fill;
        FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, other->used);
        return 0;
    }

    /* If our table is empty, we can use set_insert_clean() */
    if (so->fill == 0) {
        setentry *newtable = so->table;
        size_t newmask = (size_t)so->mask;
        so->fill = other->used;
        FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, other->used);
        for (i = other->mask + 1; i > 0 ; i--, other_entry++) {
            key = other_entry->key;
            if (key != NULL && key != dummy) {
                set_insert_clean(newtable, newmask, Ty_NewRef(key),
                                 other_entry->hash);
            }
        }
        return 0;
    }

    /* We can't assure there are no duplicates, so do normal insertions */
    for (i = 0; i <= other->mask; i++) {
        other_entry = &other->table[i];
        key = other_entry->key;
        if (key != NULL && key != dummy) {
            if (set_add_entry(so, key, other_entry->hash))
                return -1;
        }
    }
    return 0;
}

/*[clinic input]
@critical_section
set.pop
    so: setobject

Remove and return an arbitrary set element.

Raises KeyError if the set is empty.
[clinic start generated code]*/

static TyObject *
set_pop_impl(PySetObject *so)
/*[clinic end generated code: output=4d65180f1271871b input=9296c84921125060]*/
{
    /* Make sure the search finger is in bounds */
    setentry *entry = so->table + (so->finger & so->mask);
    setentry *limit = so->table + so->mask;
    TyObject *key;

    if (so->used == 0) {
        TyErr_SetString(TyExc_KeyError, "pop from an empty set");
        return NULL;
    }
    while (entry->key == NULL || entry->key==dummy) {
        entry++;
        if (entry > limit)
            entry = so->table;
    }
    key = entry->key;
    entry->key = dummy;
    entry->hash = -1;
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->used, so->used - 1);
    so->finger = entry - so->table + 1;   /* next place to start */
    return key;
}

static int
set_traverse(TyObject *self, visitproc visit, void *arg)
{
    PySetObject *so = _TySet_CAST(self);
    Ty_ssize_t pos = 0;
    setentry *entry;

    while (set_next(so, &pos, &entry))
        Ty_VISIT(entry->key);
    return 0;
}

/* Work to increase the bit dispersion for closely spaced hash values.
   This is important because some use cases have many combinations of a
   small number of elements with nearby hashes so that many distinct
   combinations collapse to only a handful of distinct hash values. */

static Ty_uhash_t
_shuffle_bits(Ty_uhash_t h)
{
    return ((h ^ 89869747UL) ^ (h << 16)) * 3644798167UL;
}

/* Most of the constants in this hash algorithm are randomly chosen
   large primes with "interesting bit patterns" and that passed tests
   for good collision statistics on a variety of problematic datasets
   including powersets and graph structures (such as David Eppstein's
   graph recipes in Lib/test/test_set.py).

   This hash algorithm can be used on either a frozenset or a set.
   When it is used on a set, it computes the hash value of the equivalent
   frozenset without creating a new frozenset object. */

static Ty_hash_t
frozenset_hash_impl(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    Ty_uhash_t hash = 0;
    setentry *entry;

    /* Xor-in shuffled bits from every entry's hash field because xor is
       commutative and a frozenset hash should be independent of order.

       For speed, include null entries and dummy entries and then
       subtract out their effect afterwards so that the final hash
       depends only on active entries.  This allows the code to be
       vectorized by the compiler and it saves the unpredictable
       branches that would arise when trying to exclude null and dummy
       entries on every iteration. */

    for (entry = so->table; entry <= &so->table[so->mask]; entry++)
        hash ^= _shuffle_bits(entry->hash);

    /* Remove the effect of an odd number of NULL entries */
    if ((so->mask + 1 - so->fill) & 1)
        hash ^= _shuffle_bits(0);

    /* Remove the effect of an odd number of dummy entries */
    if ((so->fill - so->used) & 1)
        hash ^= _shuffle_bits(-1);

    /* Factor in the number of active entries */
    hash ^= ((Ty_uhash_t)TySet_GET_SIZE(self) + 1) * 1927868237UL;

    /* Disperse patterns arising in nested frozensets */
    hash ^= (hash >> 11) ^ (hash >> 25);
    hash = hash * 69069U + 907133923UL;

    /* -1 is reserved as an error code */
    if (hash == (Ty_uhash_t)-1)
        hash = 590923713UL;

    return (Ty_hash_t)hash;
}

static Ty_hash_t
frozenset_hash(TyObject *self)
{
    PySetObject *so = _TySet_CAST(self);
    Ty_uhash_t hash;

    if (FT_ATOMIC_LOAD_SSIZE_RELAXED(so->hash) != -1) {
        return FT_ATOMIC_LOAD_SSIZE_RELAXED(so->hash);
    }

    hash = frozenset_hash_impl(self);
    FT_ATOMIC_STORE_SSIZE_RELAXED(so->hash, hash);
    return hash;
}

/***** Set iterator type ***********************************************/

typedef struct {
    PyObject_HEAD
    PySetObject *si_set; /* Set to NULL when iterator is exhausted */
    Ty_ssize_t si_used;
    Ty_ssize_t si_pos;
    Ty_ssize_t len;
} setiterobject;

static void
setiter_dealloc(TyObject *self)
{
    setiterobject *si = (setiterobject*)self;
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    _TyObject_GC_UNTRACK(si);
    Ty_XDECREF(si->si_set);
    PyObject_GC_Del(si);
}

static int
setiter_traverse(TyObject *self, visitproc visit, void *arg)
{
    setiterobject *si = (setiterobject*)self;
    Ty_VISIT(si->si_set);
    return 0;
}

static TyObject *
setiter_len(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    setiterobject *si = (setiterobject*)op;
    Ty_ssize_t len = 0;
    if (si->si_set != NULL && si->si_used == si->si_set->used)
        len = si->len;
    return TyLong_FromSsize_t(len);
}

TyDoc_STRVAR(length_hint_doc, "Private method returning an estimate of len(list(it)).");

static TyObject *
setiter_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    setiterobject *si = (setiterobject*)op;

    /* copy the iterator state */
    setiterobject tmp = *si;
    Ty_XINCREF(tmp.si_set);

    /* iterate the temporary into a list */
    TyObject *list = PySequence_List((TyObject*)&tmp);
    Ty_XDECREF(tmp.si_set);
    if (list == NULL) {
        return NULL;
    }
    return Ty_BuildValue("N(N)", _TyEval_GetBuiltin(&_Ty_ID(iter)), list);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyMethodDef setiter_methods[] = {
    {"__length_hint__", setiter_len, METH_NOARGS, length_hint_doc},
    {"__reduce__", setiter_reduce, METH_NOARGS, reduce_doc},
    {NULL,              NULL}           /* sentinel */
};

static TyObject *setiter_iternext(TyObject *self)
{
    setiterobject *si = (setiterobject*)self;
    TyObject *key = NULL;
    Ty_ssize_t i, mask;
    setentry *entry;
    PySetObject *so = si->si_set;

    if (so == NULL)
        return NULL;
    assert (PyAnySet_Check(so));

    Ty_ssize_t so_used = FT_ATOMIC_LOAD_SSIZE(so->used);
    Ty_ssize_t si_used = FT_ATOMIC_LOAD_SSIZE(si->si_used);
    if (si_used != so_used) {
        TyErr_SetString(TyExc_RuntimeError,
                        "Set changed size during iteration");
        si->si_used = -1; /* Make this state sticky */
        return NULL;
    }

    Ty_BEGIN_CRITICAL_SECTION(so);
    i = si->si_pos;
    assert(i>=0);
    entry = so->table;
    mask = so->mask;
    while (i <= mask && (entry[i].key == NULL || entry[i].key == dummy)) {
        i++;
    }
    if (i <= mask) {
        key = Ty_NewRef(entry[i].key);
    }
    Ty_END_CRITICAL_SECTION();
    si->si_pos = i+1;
    if (key == NULL) {
        si->si_set = NULL;
        Ty_DECREF(so);
        return NULL;
    }
    si->len--;
    return key;
}

TyTypeObject PySetIter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "set_iterator",                             /* tp_name */
    sizeof(setiterobject),                      /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    setiter_dealloc,                            /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,    /* tp_flags */
    0,                                          /* tp_doc */
    setiter_traverse,                           /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    setiter_iternext,                           /* tp_iternext */
    setiter_methods,                            /* tp_methods */
    0,
};

static TyObject *
set_iter(TyObject *so)
{
    Ty_ssize_t size = set_len(so);
    setiterobject *si = PyObject_GC_New(setiterobject, &PySetIter_Type);
    if (si == NULL)
        return NULL;
    si->si_set = (PySetObject*)Ty_NewRef(so);
    si->si_used = size;
    si->si_pos = 0;
    si->len = size;
    _TyObject_GC_TRACK(si);
    return (TyObject *)si;
}

static int
set_update_dict_lock_held(PySetObject *so, TyObject *other)
{
    assert(TyDict_CheckExact(other));

    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(other);

    /* Do one big resize at the start, rather than
    * incrementally resizing as we insert new keys.  Expect
    * that there will be no (or few) overlapping keys.
    */
    Ty_ssize_t dictsize = TyDict_GET_SIZE(other);
    if ((so->fill + dictsize)*5 >= so->mask*3) {
        if (set_table_resize(so, (so->used + dictsize)*2) != 0) {
            return -1;
        }
    }

    Ty_ssize_t pos = 0;
    TyObject *key;
    TyObject *value;
    Ty_hash_t hash;
    while (_TyDict_Next(other, &pos, &key, &value, &hash)) {
        if (set_add_entry(so, key, hash)) {
            return -1;
        }
    }
    return 0;
}

static int
set_update_iterable_lock_held(PySetObject *so, TyObject *other)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);

    TyObject *it = PyObject_GetIter(other);
    if (it == NULL) {
        return -1;
    }

    TyObject *key;
    while ((key = TyIter_Next(it)) != NULL) {
        if (set_add_key(so, key)) {
            Ty_DECREF(it);
            Ty_DECREF(key);
            return -1;
        }
        Ty_DECREF(key);
    }
    Ty_DECREF(it);
    if (TyErr_Occurred())
        return -1;
    return 0;
}

static int
set_update_lock_held(PySetObject *so, TyObject *other)
{
    if (PyAnySet_Check(other)) {
        return set_merge_lock_held(so, other);
    }
    else if (TyDict_CheckExact(other)) {
        return set_update_dict_lock_held(so, other);
    }
    return set_update_iterable_lock_held(so, other);
}

// set_update for a `so` that is only visible to the current thread
static int
set_update_local(PySetObject *so, TyObject *other)
{
    assert(Ty_REFCNT(so) == 1);
    if (PyAnySet_Check(other)) {
        int rv;
        Ty_BEGIN_CRITICAL_SECTION(other);
        rv = set_merge_lock_held(so, other);
        Ty_END_CRITICAL_SECTION();
        return rv;
    }
    else if (TyDict_CheckExact(other)) {
        int rv;
        Ty_BEGIN_CRITICAL_SECTION(other);
        rv = set_update_dict_lock_held(so, other);
        Ty_END_CRITICAL_SECTION();
        return rv;
    }
    return set_update_iterable_lock_held(so, other);
}

static int
set_update_internal(PySetObject *so, TyObject *other)
{
    if (PyAnySet_Check(other)) {
        if (Ty_Is((TyObject *)so, other)) {
            return 0;
        }
        int rv;
        Ty_BEGIN_CRITICAL_SECTION2(so, other);
        rv = set_merge_lock_held(so, other);
        Ty_END_CRITICAL_SECTION2();
        return rv;
    }
    else if (TyDict_CheckExact(other)) {
        int rv;
        Ty_BEGIN_CRITICAL_SECTION2(so, other);
        rv = set_update_dict_lock_held(so, other);
        Ty_END_CRITICAL_SECTION2();
        return rv;
    }
    else {
        int rv;
        Ty_BEGIN_CRITICAL_SECTION(so);
        rv = set_update_iterable_lock_held(so, other);
        Ty_END_CRITICAL_SECTION();
        return rv;
    }
}

/*[clinic input]
set.update
    so: setobject
    *others: array

Update the set, adding elements from all others.
[clinic start generated code]*/

static TyObject *
set_update_impl(PySetObject *so, TyObject * const *others,
                Ty_ssize_t others_length)
/*[clinic end generated code: output=017c781c992d5c23 input=ed5d78885b076636]*/
{
    Ty_ssize_t i;

    for (i = 0; i < others_length; i++) {
        TyObject *other = others[i];
        if (set_update_internal(so, other))
            return NULL;
    }
    Py_RETURN_NONE;
}

/* XXX Todo:
   If aligned memory allocations become available, make the
   set object 64 byte aligned so that most of the fields
   can be retrieved or updated in a single cache line.
*/

static TyObject *
make_new_set(TyTypeObject *type, TyObject *iterable)
{
    assert(TyType_Check(type));
    PySetObject *so;

    so = (PySetObject *)type->tp_alloc(type, 0);
    if (so == NULL)
        return NULL;

    so->fill = 0;
    so->used = 0;
    so->mask = TySet_MINSIZE - 1;
    so->table = so->smalltable;
    so->hash = -1;
    so->finger = 0;
    so->weakreflist = NULL;

    if (iterable != NULL) {
        if (set_update_local(so, iterable)) {
            Ty_DECREF(so);
            return NULL;
        }
    }

    return (TyObject *)so;
}

static TyObject *
make_new_set_basetype(TyTypeObject *type, TyObject *iterable)
{
    if (type != &TySet_Type && type != &TyFrozenSet_Type) {
        if (TyType_IsSubtype(type, &TySet_Type))
            type = &TySet_Type;
        else
            type = &TyFrozenSet_Type;
    }
    return make_new_set(type, iterable);
}

static TyObject *
make_new_frozenset(TyTypeObject *type, TyObject *iterable)
{
    if (type != &TyFrozenSet_Type) {
        return make_new_set(type, iterable);
    }

    if (iterable != NULL && TyFrozenSet_CheckExact(iterable)) {
        /* frozenset(f) is idempotent */
        return Ty_NewRef(iterable);
    }
    return make_new_set(type, iterable);
}

static TyObject *
frozenset_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *iterable = NULL;

    if ((type == &TyFrozenSet_Type ||
         type->tp_init == TyFrozenSet_Type.tp_init) &&
        !_TyArg_NoKeywords("frozenset", kwds)) {
        return NULL;
    }

    if (!TyArg_UnpackTuple(args, type->tp_name, 0, 1, &iterable)) {
        return NULL;
    }

    return make_new_frozenset(type, iterable);
}

static TyObject *
frozenset_vectorcall(TyObject *type, TyObject * const*args,
                     size_t nargsf, TyObject *kwnames)
{
    if (!_TyArg_NoKwnames("frozenset", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("frozenset", nargs, 0, 1)) {
        return NULL;
    }

    TyObject *iterable = (nargs ? args[0] : NULL);
    return make_new_frozenset(_TyType_CAST(type), iterable);
}

static TyObject *
set_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    return make_new_set(type, NULL);
}

/* set_swap_bodies() switches the contents of any two sets by moving their
   internal data pointers and, if needed, copying the internal smalltables.
   Semantically equivalent to:

     t=set(a); a.clear(); a.update(b); b.clear(); b.update(t); del t

   The function always succeeds and it leaves both objects in a stable state.
   Useful for operations that update in-place (by allowing an intermediate
   result to be swapped into one of the original inputs).
*/

static void
set_swap_bodies(PySetObject *a, PySetObject *b)
{
    Ty_ssize_t t;
    setentry *u;
    setentry tab[TySet_MINSIZE];
    Ty_hash_t h;

    t = a->fill;     a->fill   = b->fill;        b->fill  = t;
    t = a->used;
    FT_ATOMIC_STORE_SSIZE_RELAXED(a->used, b->used);
    FT_ATOMIC_STORE_SSIZE_RELAXED(b->used, t);
    t = a->mask;     a->mask   = b->mask;        b->mask  = t;

    u = a->table;
    if (a->table == a->smalltable)
        u = b->smalltable;
    a->table  = b->table;
    if (b->table == b->smalltable)
        a->table = a->smalltable;
    b->table = u;

    if (a->table == a->smalltable || b->table == b->smalltable) {
        memcpy(tab, a->smalltable, sizeof(tab));
        memcpy(a->smalltable, b->smalltable, sizeof(tab));
        memcpy(b->smalltable, tab, sizeof(tab));
    }

    if (TyType_IsSubtype(Ty_TYPE(a), &TyFrozenSet_Type)  &&
        TyType_IsSubtype(Ty_TYPE(b), &TyFrozenSet_Type)) {
        h = FT_ATOMIC_LOAD_SSIZE_RELAXED(a->hash);
        FT_ATOMIC_STORE_SSIZE_RELAXED(a->hash, FT_ATOMIC_LOAD_SSIZE_RELAXED(b->hash));
        FT_ATOMIC_STORE_SSIZE_RELAXED(b->hash, h);
    } else {
        FT_ATOMIC_STORE_SSIZE_RELAXED(a->hash, -1);
        FT_ATOMIC_STORE_SSIZE_RELAXED(b->hash, -1);
    }
}

/*[clinic input]
@critical_section
set.copy
    so: setobject

Return a shallow copy of a set.
[clinic start generated code]*/

static TyObject *
set_copy_impl(PySetObject *so)
/*[clinic end generated code: output=c9223a1e1cc6b041 input=c169a4fbb8209257]*/
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    TyObject *copy = make_new_set_basetype(Ty_TYPE(so), NULL);
    if (copy == NULL) {
        return NULL;
    }
    if (set_merge_lock_held((PySetObject *)copy, (TyObject *)so) < 0) {
        Ty_DECREF(copy);
        return NULL;
    }
    return copy;
}

/*[clinic input]
@critical_section
frozenset.copy
    so: setobject

Return a shallow copy of a set.
[clinic start generated code]*/

static TyObject *
frozenset_copy_impl(PySetObject *so)
/*[clinic end generated code: output=b356263526af9e70 input=fbf5bef131268dd7]*/
{
    if (TyFrozenSet_CheckExact(so)) {
        return Ty_NewRef(so);
    }
    return set_copy_impl(so);
}

/*[clinic input]
@critical_section
set.clear
    so: setobject

Remove all elements from this set.
[clinic start generated code]*/

static TyObject *
set_clear_impl(PySetObject *so)
/*[clinic end generated code: output=4e71d5a83904161a input=c6f831b366111950]*/
{
    set_clear_internal((TyObject*)so);
    Py_RETURN_NONE;
}

/*[clinic input]
set.union
    so: setobject
    *others: array

Return a new set with elements from the set and all others.
[clinic start generated code]*/

static TyObject *
set_union_impl(PySetObject *so, TyObject * const *others,
               Ty_ssize_t others_length)
/*[clinic end generated code: output=b1bfa3d74065f27e input=55a2e81db6347a4f]*/
{
    PySetObject *result;
    TyObject *other;
    Ty_ssize_t i;

    result = (PySetObject *)set_copy((TyObject *)so, NULL);
    if (result == NULL)
        return NULL;

    for (i = 0; i < others_length; i++) {
        other = others[i];
        if ((TyObject *)so == other)
            continue;
        if (set_update_local(result, other)) {
            Ty_DECREF(result);
            return NULL;
        }
    }
    return (TyObject *)result;
}

static TyObject *
set_or(TyObject *self, TyObject *other)
{
    PySetObject *result;

    if (!PyAnySet_Check(self) || !PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;

    result = (PySetObject *)set_copy(self, NULL);
    if (result == NULL) {
        return NULL;
    }
    if (Ty_Is(self, other)) {
        return (TyObject *)result;
    }
    if (set_update_local(result, other)) {
        Ty_DECREF(result);
        return NULL;
    }
    return (TyObject *)result;
}

static TyObject *
set_ior(TyObject *self, TyObject *other)
{
    if (!PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    if (set_update_internal(so, other)) {
        return NULL;
    }
    return Ty_NewRef(so);
}

static TyObject *
set_intersection(PySetObject *so, TyObject *other)
{
    PySetObject *result;
    TyObject *key, *it, *tmp;
    Ty_hash_t hash;
    int rv;

    if ((TyObject *)so == other)
        return set_copy_impl(so);

    result = (PySetObject *)make_new_set_basetype(Ty_TYPE(so), NULL);
    if (result == NULL)
        return NULL;

    if (PyAnySet_Check(other)) {
        Ty_ssize_t pos = 0;
        setentry *entry;

        if (TySet_GET_SIZE(other) > TySet_GET_SIZE(so)) {
            tmp = (TyObject *)so;
            so = (PySetObject *)other;
            other = tmp;
        }

        while (set_next((PySetObject *)other, &pos, &entry)) {
            key = entry->key;
            hash = entry->hash;
            Ty_INCREF(key);
            rv = set_contains_entry(so, key, hash);
            if (rv < 0) {
                Ty_DECREF(result);
                Ty_DECREF(key);
                return NULL;
            }
            if (rv) {
                if (set_add_entry(result, key, hash)) {
                    Ty_DECREF(result);
                    Ty_DECREF(key);
                    return NULL;
                }
            }
            Ty_DECREF(key);
        }
        return (TyObject *)result;
    }

    it = PyObject_GetIter(other);
    if (it == NULL) {
        Ty_DECREF(result);
        return NULL;
    }

    while ((key = TyIter_Next(it)) != NULL) {
        hash = PyObject_Hash(key);
        if (hash == -1)
            goto error;
        rv = set_contains_entry(so, key, hash);
        if (rv < 0)
            goto error;
        if (rv) {
            if (set_add_entry(result, key, hash))
                goto error;
            if (TySet_GET_SIZE(result) >= TySet_GET_SIZE(so)) {
                Ty_DECREF(key);
                break;
            }
        }
        Ty_DECREF(key);
    }
    Ty_DECREF(it);
    if (TyErr_Occurred()) {
        Ty_DECREF(result);
        return NULL;
    }
    return (TyObject *)result;
  error:
    Ty_DECREF(it);
    Ty_DECREF(result);
    Ty_DECREF(key);
    return NULL;
}

/*[clinic input]
set.intersection as set_intersection_multi
    so: setobject
    *others: array

Return a new set with elements common to the set and all others.
[clinic start generated code]*/

static TyObject *
set_intersection_multi_impl(PySetObject *so, TyObject * const *others,
                            Ty_ssize_t others_length)
/*[clinic end generated code: output=db9ff9f875132b6b input=36c7b615694cadae]*/
{
    Ty_ssize_t i;

    if (others_length == 0) {
        return set_copy((TyObject *)so, NULL);
    }

    TyObject *result = Ty_NewRef(so);
    for (i = 0; i < others_length; i++) {
        TyObject *other = others[i];
        TyObject *newresult;
        Ty_BEGIN_CRITICAL_SECTION2(result, other);
        newresult = set_intersection((PySetObject *)result, other);
        Ty_END_CRITICAL_SECTION2();
        if (newresult == NULL) {
            Ty_DECREF(result);
            return NULL;
        }
        Ty_SETREF(result, newresult);
    }
    return result;
}

static TyObject *
set_intersection_update(PySetObject *so, TyObject *other)
{
    TyObject *tmp;

    tmp = set_intersection(so, other);
    if (tmp == NULL)
        return NULL;
    set_swap_bodies(so, (PySetObject *)tmp);
    Ty_DECREF(tmp);
    Py_RETURN_NONE;
}

/*[clinic input]
set.intersection_update as set_intersection_update_multi
    so: setobject
    *others: array

Update the set, keeping only elements found in it and all others.
[clinic start generated code]*/

static TyObject *
set_intersection_update_multi_impl(PySetObject *so, TyObject * const *others,
                                   Ty_ssize_t others_length)
/*[clinic end generated code: output=d768b5584675b48d input=782e422fc370e4fc]*/
{
    TyObject *tmp;

    tmp = set_intersection_multi_impl(so, others, others_length);
    if (tmp == NULL)
        return NULL;
    Ty_BEGIN_CRITICAL_SECTION(so);
    set_swap_bodies(so, (PySetObject *)tmp);
    Ty_END_CRITICAL_SECTION();
    Ty_DECREF(tmp);
    Py_RETURN_NONE;
}

static TyObject *
set_and(TyObject *self, TyObject *other)
{
    if (!PyAnySet_Check(self) || !PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    TyObject *rv;
    Ty_BEGIN_CRITICAL_SECTION2(so, other);
    rv = set_intersection(so, other);
    Ty_END_CRITICAL_SECTION2();

    return rv;
}

static TyObject *
set_iand(TyObject *self, TyObject *other)
{
    TyObject *result;

    if (!PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    Ty_BEGIN_CRITICAL_SECTION2(so, other);
    result = set_intersection_update(so, other);
    Ty_END_CRITICAL_SECTION2();

    if (result == NULL)
        return NULL;
    Ty_DECREF(result);
    return Ty_NewRef(so);
}

/*[clinic input]
@critical_section so other
set.isdisjoint
    so: setobject
    other: object
    /

Return True if two sets have a null intersection.
[clinic start generated code]*/

static TyObject *
set_isdisjoint_impl(PySetObject *so, TyObject *other)
/*[clinic end generated code: output=273493f2d57c565e input=32f8dcab5e0fc7d6]*/
{
    TyObject *key, *it, *tmp;
    int rv;

    if ((TyObject *)so == other) {
        if (TySet_GET_SIZE(so) == 0)
            Py_RETURN_TRUE;
        else
            Py_RETURN_FALSE;
    }

    if (PyAnySet_CheckExact(other)) {
        Ty_ssize_t pos = 0;
        setentry *entry;

        if (TySet_GET_SIZE(other) > TySet_GET_SIZE(so)) {
            tmp = (TyObject *)so;
            so = (PySetObject *)other;
            other = tmp;
        }
        while (set_next((PySetObject *)other, &pos, &entry)) {
            TyObject *key = entry->key;
            Ty_INCREF(key);
            rv = set_contains_entry(so, key, entry->hash);
            Ty_DECREF(key);
            if (rv < 0) {
                return NULL;
            }
            if (rv) {
                Py_RETURN_FALSE;
            }
        }
        Py_RETURN_TRUE;
    }

    it = PyObject_GetIter(other);
    if (it == NULL)
        return NULL;

    while ((key = TyIter_Next(it)) != NULL) {
        rv = set_contains_key(so, key);
        Ty_DECREF(key);
        if (rv < 0) {
            Ty_DECREF(it);
            return NULL;
        }
        if (rv) {
            Ty_DECREF(it);
            Py_RETURN_FALSE;
        }
    }
    Ty_DECREF(it);
    if (TyErr_Occurred())
        return NULL;
    Py_RETURN_TRUE;
}

static int
set_difference_update_internal(PySetObject *so, TyObject *other)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(other);

    if ((TyObject *)so == other)
        return set_clear_internal((TyObject*)so);

    if (PyAnySet_Check(other)) {
        setentry *entry;
        Ty_ssize_t pos = 0;

        /* Optimization:  When the other set is more than 8 times
           larger than the base set, replace the other set with
           intersection of the two sets.
        */
        if ((TySet_GET_SIZE(other) >> 3) > TySet_GET_SIZE(so)) {
            other = set_intersection(so, other);
            if (other == NULL)
                return -1;
        } else {
            Ty_INCREF(other);
        }

        while (set_next((PySetObject *)other, &pos, &entry)) {
            TyObject *key = entry->key;
            Ty_INCREF(key);
            if (set_discard_entry(so, key, entry->hash) < 0) {
                Ty_DECREF(other);
                Ty_DECREF(key);
                return -1;
            }
            Ty_DECREF(key);
        }

        Ty_DECREF(other);
    } else {
        TyObject *key, *it;
        it = PyObject_GetIter(other);
        if (it == NULL)
            return -1;

        while ((key = TyIter_Next(it)) != NULL) {
            if (set_discard_key(so, key) < 0) {
                Ty_DECREF(it);
                Ty_DECREF(key);
                return -1;
            }
            Ty_DECREF(key);
        }
        Ty_DECREF(it);
        if (TyErr_Occurred())
            return -1;
    }
    /* If more than 1/4th are dummies, then resize them away. */
    if ((size_t)(so->fill - so->used) <= (size_t)so->mask / 4)
        return 0;
    return set_table_resize(so, so->used>50000 ? so->used*2 : so->used*4);
}

/*[clinic input]
set.difference_update
    so: setobject
    *others: array

Update the set, removing elements found in others.
[clinic start generated code]*/

static TyObject *
set_difference_update_impl(PySetObject *so, TyObject * const *others,
                           Ty_ssize_t others_length)
/*[clinic end generated code: output=04a22179b322cfe6 input=93ac28ba5b233696]*/
{
    Ty_ssize_t i;

    for (i = 0; i < others_length; i++) {
        TyObject *other = others[i];
        int rv;
        Ty_BEGIN_CRITICAL_SECTION2(so, other);
        rv = set_difference_update_internal(so, other);
        Ty_END_CRITICAL_SECTION2();
        if (rv) {
            return NULL;
        }
    }
    Py_RETURN_NONE;
}

static TyObject *
set_copy_and_difference(PySetObject *so, TyObject *other)
{
    TyObject *result;

    result = set_copy_impl(so);
    if (result == NULL)
        return NULL;
    if (set_difference_update_internal((PySetObject *) result, other) == 0)
        return result;
    Ty_DECREF(result);
    return NULL;
}

static TyObject *
set_difference(PySetObject *so, TyObject *other)
{
    TyObject *result;
    TyObject *key;
    Ty_hash_t hash;
    setentry *entry;
    Ty_ssize_t pos = 0, other_size;
    int rv;

    if (PyAnySet_Check(other)) {
        other_size = TySet_GET_SIZE(other);
    }
    else if (TyDict_CheckExact(other)) {
        other_size = TyDict_GET_SIZE(other);
    }
    else {
        return set_copy_and_difference(so, other);
    }

    /* If len(so) much more than len(other), it's more efficient to simply copy
     * so and then iterate other looking for common elements. */
    if ((TySet_GET_SIZE(so) >> 2) > other_size) {
        return set_copy_and_difference(so, other);
    }

    result = make_new_set_basetype(Ty_TYPE(so), NULL);
    if (result == NULL)
        return NULL;

    if (TyDict_CheckExact(other)) {
        while (set_next(so, &pos, &entry)) {
            key = entry->key;
            hash = entry->hash;
            Ty_INCREF(key);
            rv = _TyDict_Contains_KnownHash(other, key, hash);
            if (rv < 0) {
                Ty_DECREF(result);
                Ty_DECREF(key);
                return NULL;
            }
            if (!rv) {
                if (set_add_entry((PySetObject *)result, key, hash)) {
                    Ty_DECREF(result);
                    Ty_DECREF(key);
                    return NULL;
                }
            }
            Ty_DECREF(key);
        }
        return result;
    }

    /* Iterate over so, checking for common elements in other. */
    while (set_next(so, &pos, &entry)) {
        key = entry->key;
        hash = entry->hash;
        Ty_INCREF(key);
        rv = set_contains_entry((PySetObject *)other, key, hash);
        if (rv < 0) {
            Ty_DECREF(result);
            Ty_DECREF(key);
            return NULL;
        }
        if (!rv) {
            if (set_add_entry((PySetObject *)result, key, hash)) {
                Ty_DECREF(result);
                Ty_DECREF(key);
                return NULL;
            }
        }
        Ty_DECREF(key);
    }
    return result;
}

/*[clinic input]
set.difference as set_difference_multi
    so: setobject
    *others: array

Return a new set with elements in the set that are not in the others.
[clinic start generated code]*/

static TyObject *
set_difference_multi_impl(PySetObject *so, TyObject * const *others,
                          Ty_ssize_t others_length)
/*[clinic end generated code: output=b0d33fb05d5477a7 input=c1eb448d483416ad]*/
{
    Ty_ssize_t i;
    TyObject *result, *other;

    if (others_length == 0) {
        return set_copy((TyObject *)so, NULL);
    }

    other = others[0];
    Ty_BEGIN_CRITICAL_SECTION2(so, other);
    result = set_difference(so, other);
    Ty_END_CRITICAL_SECTION2();
    if (result == NULL)
        return NULL;

    for (i = 1; i < others_length; i++) {
        other = others[i];
        int rv;
        Ty_BEGIN_CRITICAL_SECTION(other);
        rv = set_difference_update_internal((PySetObject *)result, other);
        Ty_END_CRITICAL_SECTION();
        if (rv) {
            Ty_DECREF(result);
            return NULL;
        }
    }
    return result;
}

static TyObject *
set_sub(TyObject *self, TyObject *other)
{
    if (!PyAnySet_Check(self) || !PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    TyObject *rv;
    Ty_BEGIN_CRITICAL_SECTION2(so, other);
    rv = set_difference(so, other);
    Ty_END_CRITICAL_SECTION2();
    return rv;
}

static TyObject *
set_isub(TyObject *self, TyObject *other)
{
    if (!PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    int rv;
    Ty_BEGIN_CRITICAL_SECTION2(so, other);
    rv = set_difference_update_internal(so, other);
    Ty_END_CRITICAL_SECTION2();
    if (rv < 0) {
        return NULL;
    }
    return Ty_NewRef(so);
}

static int
set_symmetric_difference_update_dict(PySetObject *so, TyObject *other)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(other);

    Ty_ssize_t pos = 0;
    TyObject *key, *value;
    Ty_hash_t hash;
    while (_TyDict_Next(other, &pos, &key, &value, &hash)) {
        Ty_INCREF(key);
        int rv = set_discard_entry(so, key, hash);
        if (rv < 0) {
            Ty_DECREF(key);
            return -1;
        }
        if (rv == DISCARD_NOTFOUND) {
            if (set_add_entry(so, key, hash)) {
                Ty_DECREF(key);
                return -1;
            }
        }
        Ty_DECREF(key);
    }
    return 0;
}

static int
set_symmetric_difference_update_set(PySetObject *so, PySetObject *other)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(so);
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(other);

    Ty_ssize_t pos = 0;
    setentry *entry;
    while (set_next(other, &pos, &entry)) {
        TyObject *key = Ty_NewRef(entry->key);
        Ty_hash_t hash = entry->hash;
        int rv = set_discard_entry(so, key, hash);
        if (rv < 0) {
            Ty_DECREF(key);
            return -1;
        }
        if (rv == DISCARD_NOTFOUND) {
            if (set_add_entry(so, key, hash)) {
                Ty_DECREF(key);
                return -1;
            }
        }
        Ty_DECREF(key);
    }
    return 0;
}

/*[clinic input]
set.symmetric_difference_update
    so: setobject
    other: object
    /

Update the set, keeping only elements found in either set, but not in both.
[clinic start generated code]*/

static TyObject *
set_symmetric_difference_update_impl(PySetObject *so, TyObject *other)
/*[clinic end generated code: output=79f80b4ee5da66c1 input=a50acf0365e1f0a5]*/
{
    if (Ty_Is((TyObject *)so, other)) {
        return set_clear((TyObject *)so, NULL);
    }

    int rv;
    if (TyDict_CheckExact(other)) {
        Ty_BEGIN_CRITICAL_SECTION2(so, other);
        rv = set_symmetric_difference_update_dict(so, other);
        Ty_END_CRITICAL_SECTION2();
    }
    else if (PyAnySet_Check(other)) {
        Ty_BEGIN_CRITICAL_SECTION2(so, other);
        rv = set_symmetric_difference_update_set(so, (PySetObject *)other);
        Ty_END_CRITICAL_SECTION2();
    }
    else {
        PySetObject *otherset = (PySetObject *)make_new_set_basetype(Ty_TYPE(so), other);
        if (otherset == NULL) {
            return NULL;
        }

        Ty_BEGIN_CRITICAL_SECTION(so);
        rv = set_symmetric_difference_update_set(so, otherset);
        Ty_END_CRITICAL_SECTION();

        Ty_DECREF(otherset);
    }
    if (rv < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
@critical_section so other
set.symmetric_difference
    so: setobject
    other: object
    /

Return a new set with elements in either the set or other but not both.
[clinic start generated code]*/

static TyObject *
set_symmetric_difference_impl(PySetObject *so, TyObject *other)
/*[clinic end generated code: output=270ee0b5d42b0797 input=624f6e7bbdf70db1]*/
{
    PySetObject *result = (PySetObject *)make_new_set_basetype(Ty_TYPE(so), NULL);
    if (result == NULL) {
        return NULL;
    }
    if (set_update_lock_held(result, other) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    if (set_symmetric_difference_update_set(result, so) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    return (TyObject *)result;
}

static TyObject *
set_xor(TyObject *self, TyObject *other)
{
    if (!PyAnySet_Check(self) || !PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);
    return set_symmetric_difference((TyObject*)so, other);
}

static TyObject *
set_ixor(TyObject *self, TyObject *other)
{
    TyObject *result;

    if (!PyAnySet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;
    PySetObject *so = _TySet_CAST(self);

    result = set_symmetric_difference_update((TyObject*)so, other);
    if (result == NULL)
        return NULL;
    Ty_DECREF(result);
    return Ty_NewRef(so);
}

/*[clinic input]
@critical_section so other
set.issubset
    so: setobject
    other: object
    /

Report whether another set contains this set.
[clinic start generated code]*/

static TyObject *
set_issubset_impl(PySetObject *so, TyObject *other)
/*[clinic end generated code: output=b2b59d5f314555ce input=f2a4fd0f2537758b]*/
{
    setentry *entry;
    Ty_ssize_t pos = 0;
    int rv;

    if (!PyAnySet_Check(other)) {
        TyObject *tmp = set_intersection(so, other);
        if (tmp == NULL) {
            return NULL;
        }
        int result = (TySet_GET_SIZE(tmp) == TySet_GET_SIZE(so));
        Ty_DECREF(tmp);
        return TyBool_FromLong(result);
    }
    if (TySet_GET_SIZE(so) > TySet_GET_SIZE(other))
        Py_RETURN_FALSE;

    while (set_next(so, &pos, &entry)) {
        TyObject *key = entry->key;
        Ty_INCREF(key);
        rv = set_contains_entry((PySetObject *)other, key, entry->hash);
        Ty_DECREF(key);
        if (rv < 0) {
            return NULL;
        }
        if (!rv) {
            Py_RETURN_FALSE;
        }
    }
    Py_RETURN_TRUE;
}

/*[clinic input]
@critical_section so other
set.issuperset
    so: setobject
    other: object
    /

Report whether this set contains another set.
[clinic start generated code]*/

static TyObject *
set_issuperset_impl(PySetObject *so, TyObject *other)
/*[clinic end generated code: output=ecf00ce552c09461 input=5f2e1f262e6e4ccc]*/
{
    if (PyAnySet_Check(other)) {
        return set_issubset(other, (TyObject *)so);
    }

    TyObject *key, *it = PyObject_GetIter(other);
    if (it == NULL) {
        return NULL;
    }
    while ((key = TyIter_Next(it)) != NULL) {
        int rv = set_contains_key(so, key);
        Ty_DECREF(key);
        if (rv < 0) {
            Ty_DECREF(it);
            return NULL;
        }
        if (!rv) {
            Ty_DECREF(it);
            Py_RETURN_FALSE;
        }
    }
    Ty_DECREF(it);
    if (TyErr_Occurred()) {
        return NULL;
    }
    Py_RETURN_TRUE;
}

static TyObject *
set_richcompare(TyObject *self, TyObject *w, int op)
{
    PySetObject *v = _TySet_CAST(self);
    TyObject *r1;
    int r2;

    if(!PyAnySet_Check(w))
        Py_RETURN_NOTIMPLEMENTED;

    switch (op) {
    case Py_EQ:
        if (TySet_GET_SIZE(v) != TySet_GET_SIZE(w))
            Py_RETURN_FALSE;
        Ty_hash_t v_hash = FT_ATOMIC_LOAD_SSIZE_RELAXED(v->hash);
        Ty_hash_t w_hash = FT_ATOMIC_LOAD_SSIZE_RELAXED(((PySetObject *)w)->hash);
        if (v_hash != -1 && w_hash != -1 && v_hash != w_hash)
            Py_RETURN_FALSE;
        return set_issubset((TyObject*)v, w);
    case Py_NE:
        r1 = set_richcompare((TyObject*)v, w, Py_EQ);
        if (r1 == NULL)
            return NULL;
        r2 = PyObject_IsTrue(r1);
        Ty_DECREF(r1);
        if (r2 < 0)
            return NULL;
        return TyBool_FromLong(!r2);
    case Py_LE:
        return set_issubset((TyObject*)v, w);
    case Py_GE:
        return set_issuperset((TyObject*)v, w);
    case Py_LT:
        if (TySet_GET_SIZE(v) >= TySet_GET_SIZE(w))
            Py_RETURN_FALSE;
        return set_issubset((TyObject*)v, w);
    case Py_GT:
        if (TySet_GET_SIZE(v) <= TySet_GET_SIZE(w))
            Py_RETURN_FALSE;
        return set_issuperset((TyObject*)v, w);
    }
    Py_RETURN_NOTIMPLEMENTED;
}

/*[clinic input]
@critical_section
set.add
    so: setobject
    object as key: object
    /

Add an element to a set.

This has no effect if the element is already present.
[clinic start generated code]*/

static TyObject *
set_add_impl(PySetObject *so, TyObject *key)
/*[clinic end generated code: output=4cc4a937f1425c96 input=03baf62cb0e66514]*/
{
    if (set_add_key(so, key))
        return NULL;
    Py_RETURN_NONE;
}

static int
set_contains_lock_held(PySetObject *so, TyObject *key)
{
    int rv;

    rv = set_contains_key(so, key);
    if (rv < 0) {
        if (!TySet_Check(key) || !TyErr_ExceptionMatches(TyExc_TypeError))
            return -1;
        TyErr_Clear();
        Ty_hash_t hash;
        Ty_BEGIN_CRITICAL_SECTION(key);
        hash = frozenset_hash_impl(key);
        Ty_END_CRITICAL_SECTION();
        rv = set_contains_entry(so, key, hash);
    }
    return rv;
}

int
_TySet_Contains(PySetObject *so, TyObject *key)
{
    int rv;
    Ty_BEGIN_CRITICAL_SECTION(so);
    rv = set_contains_lock_held(so, key);
    Ty_END_CRITICAL_SECTION();
    return rv;
}

static int
set_contains(TyObject *self, TyObject *key)
{
    PySetObject *so = _TySet_CAST(self);
    return _TySet_Contains(so, key);
}

/*[clinic input]
@critical_section
@coexist
set.__contains__
    so: setobject
    object as key: object
    /

x.__contains__(y) <==> y in x.
[clinic start generated code]*/

static TyObject *
set___contains___impl(PySetObject *so, TyObject *key)
/*[clinic end generated code: output=b44863d034b3c70e input=4a7d568459617f24]*/
{
    long result;

    result = set_contains_lock_held(so, key);
    if (result < 0)
        return NULL;
    return TyBool_FromLong(result);
}

/*[clinic input]
@coexist
frozenset.__contains__
    so: setobject
    object as key: object
    /

x.__contains__(y) <==> y in x.
[clinic start generated code]*/

static TyObject *
frozenset___contains___impl(PySetObject *so, TyObject *key)
/*[clinic end generated code: output=2301ed91bc3a6dd5 input=2f04922a98d8bab7]*/
{
    long result;

    result = set_contains_lock_held(so, key);
    if (result < 0)
        return NULL;
    return TyBool_FromLong(result);
}

/*[clinic input]
@critical_section
set.remove
    so: setobject
    object as key: object
    /

Remove an element from a set; it must be a member.

If the element is not a member, raise a KeyError.
[clinic start generated code]*/

static TyObject *
set_remove_impl(PySetObject *so, TyObject *key)
/*[clinic end generated code: output=0b9134a2a2200363 input=893e1cb1df98227a]*/
{
    int rv;

    rv = set_discard_key(so, key);
    if (rv < 0) {
        if (!TySet_Check(key) || !TyErr_ExceptionMatches(TyExc_TypeError))
            return NULL;
        TyErr_Clear();
        Ty_hash_t hash;
        Ty_BEGIN_CRITICAL_SECTION(key);
        hash = frozenset_hash_impl(key);
        Ty_END_CRITICAL_SECTION();
        rv = set_discard_entry(so, key, hash);
        if (rv < 0)
            return NULL;
    }

    if (rv == DISCARD_NOTFOUND) {
        _TyErr_SetKeyError(key);
        return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
@critical_section
set.discard
    so: setobject
    object as key: object
    /

Remove an element from a set if it is a member.

Unlike set.remove(), the discard() method does not raise
an exception when an element is missing from the set.
[clinic start generated code]*/

static TyObject *
set_discard_impl(PySetObject *so, TyObject *key)
/*[clinic end generated code: output=eec3b687bf32759e input=861cb7fb69b4def0]*/
{
    int rv;

    rv = set_discard_key(so, key);
    if (rv < 0) {
        if (!TySet_Check(key) || !TyErr_ExceptionMatches(TyExc_TypeError))
            return NULL;
        TyErr_Clear();
        Ty_hash_t hash;
        Ty_BEGIN_CRITICAL_SECTION(key);
        hash = frozenset_hash_impl(key);
        Ty_END_CRITICAL_SECTION();
        rv = set_discard_entry(so, key, hash);
        if (rv < 0)
            return NULL;
    }
    Py_RETURN_NONE;
}

/*[clinic input]
@critical_section
set.__reduce__
    so: setobject

Return state information for pickling.
[clinic start generated code]*/

static TyObject *
set___reduce___impl(PySetObject *so)
/*[clinic end generated code: output=9af7d0e029df87ee input=59405a4249e82f71]*/
{
    TyObject *keys=NULL, *args=NULL, *result=NULL, *state=NULL;

    keys = PySequence_List((TyObject *)so);
    if (keys == NULL)
        goto done;
    args = TyTuple_Pack(1, keys);
    if (args == NULL)
        goto done;
    state = _TyObject_GetState((TyObject *)so);
    if (state == NULL)
        goto done;
    result = TyTuple_Pack(3, Ty_TYPE(so), args, state);
done:
    Ty_XDECREF(args);
    Ty_XDECREF(keys);
    Ty_XDECREF(state);
    return result;
}

/*[clinic input]
@critical_section
set.__sizeof__
    so: setobject

S.__sizeof__() -> size of S in memory, in bytes.
[clinic start generated code]*/

static TyObject *
set___sizeof___impl(PySetObject *so)
/*[clinic end generated code: output=4bfa3df7bd38ed88 input=09e1a09f168eaa23]*/
{
    size_t res = _TyObject_SIZE(Ty_TYPE(so));
    if (so->table != so->smalltable) {
        res += ((size_t)so->mask + 1) * sizeof(setentry);
    }
    return TyLong_FromSize_t(res);
}

static int
set_init(TyObject *so, TyObject *args, TyObject *kwds)
{
    PySetObject *self = _TySet_CAST(so);
    TyObject *iterable = NULL;

    if (!_TyArg_NoKeywords("set", kwds))
        return -1;
    if (!TyArg_UnpackTuple(args, Ty_TYPE(self)->tp_name, 0, 1, &iterable))
        return -1;

    if (Ty_REFCNT(self) == 1 && self->fill == 0) {
        self->hash = -1;
        if (iterable == NULL) {
            return 0;
        }
        return set_update_local(self, iterable);
    }
    Ty_BEGIN_CRITICAL_SECTION(self);
    if (self->fill)
        set_clear_internal((TyObject*)self);
    self->hash = -1;
    Ty_END_CRITICAL_SECTION();

    if (iterable == NULL)
        return 0;
    return set_update_internal(self, iterable);
}

static TyObject*
set_vectorcall(TyObject *type, TyObject * const*args,
               size_t nargsf, TyObject *kwnames)
{
    assert(TyType_Check(type));

    if (!_TyArg_NoKwnames("set", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("set", nargs, 0, 1)) {
        return NULL;
    }

    if (nargs) {
        return make_new_set(_TyType_CAST(type), args[0]);
    }

    return make_new_set(_TyType_CAST(type), NULL);
}

static PySequenceMethods set_as_sequence = {
    set_len,                            /* sq_length */
    0,                                  /* sq_concat */
    0,                                  /* sq_repeat */
    0,                                  /* sq_item */
    0,                                  /* sq_slice */
    0,                                  /* sq_ass_item */
    0,                                  /* sq_ass_slice */
    set_contains,                       /* sq_contains */
};

/* set object ********************************************************/

static TyMethodDef set_methods[] = {
    SET_ADD_METHODDEF
    SET_CLEAR_METHODDEF
    SET___CONTAINS___METHODDEF
    SET_COPY_METHODDEF
    SET_DISCARD_METHODDEF
    SET_DIFFERENCE_MULTI_METHODDEF
    SET_DIFFERENCE_UPDATE_METHODDEF
    SET_INTERSECTION_MULTI_METHODDEF
    SET_INTERSECTION_UPDATE_MULTI_METHODDEF
    SET_ISDISJOINT_METHODDEF
    SET_ISSUBSET_METHODDEF
    SET_ISSUPERSET_METHODDEF
    SET_POP_METHODDEF
    SET___REDUCE___METHODDEF
    SET_REMOVE_METHODDEF
    SET___SIZEOF___METHODDEF
    SET_SYMMETRIC_DIFFERENCE_METHODDEF
    SET_SYMMETRIC_DIFFERENCE_UPDATE_METHODDEF
    SET_UNION_METHODDEF
    SET_UPDATE_METHODDEF
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL,              NULL}   /* sentinel */
};

static TyNumberMethods set_as_number = {
    0,                                  /*nb_add*/
    set_sub,                            /*nb_subtract*/
    0,                                  /*nb_multiply*/
    0,                                  /*nb_remainder*/
    0,                                  /*nb_divmod*/
    0,                                  /*nb_power*/
    0,                                  /*nb_negative*/
    0,                                  /*nb_positive*/
    0,                                  /*nb_absolute*/
    0,                                  /*nb_bool*/
    0,                                  /*nb_invert*/
    0,                                  /*nb_lshift*/
    0,                                  /*nb_rshift*/
    set_and,                            /*nb_and*/
    set_xor,                            /*nb_xor*/
    set_or,                             /*nb_or*/
    0,                                  /*nb_int*/
    0,                                  /*nb_reserved*/
    0,                                  /*nb_float*/
    0,                                  /*nb_inplace_add*/
    set_isub,                           /*nb_inplace_subtract*/
    0,                                  /*nb_inplace_multiply*/
    0,                                  /*nb_inplace_remainder*/
    0,                                  /*nb_inplace_power*/
    0,                                  /*nb_inplace_lshift*/
    0,                                  /*nb_inplace_rshift*/
    set_iand,                           /*nb_inplace_and*/
    set_ixor,                           /*nb_inplace_xor*/
    set_ior,                            /*nb_inplace_or*/
};

TyDoc_STRVAR(set_doc,
"set(iterable=(), /)\n\
--\n\
\n\
Build an unordered collection of unique elements.");

TyTypeObject TySet_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "set",                              /* tp_name */
    sizeof(PySetObject),                /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    set_dealloc,                        /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    set_repr,                           /* tp_repr */
    &set_as_number,                     /* tp_as_number */
    &set_as_sequence,                   /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    PyObject_HashNotImplemented,        /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE |
        _Ty_TPFLAGS_MATCH_SELF,         /* tp_flags */
    set_doc,                            /* tp_doc */
    set_traverse,                       /* tp_traverse */
    set_clear_internal,                 /* tp_clear */
    set_richcompare,                    /* tp_richcompare */
    offsetof(PySetObject, weakreflist), /* tp_weaklistoffset */
    set_iter,                           /* tp_iter */
    0,                                  /* tp_iternext */
    set_methods,                        /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    set_init,                           /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    set_new,                            /* tp_new */
    PyObject_GC_Del,                    /* tp_free */
    .tp_vectorcall = set_vectorcall,
    .tp_version_tag = _Ty_TYPE_VERSION_SET,
};

/* frozenset object ********************************************************/


static TyMethodDef frozenset_methods[] = {
    FROZENSET___CONTAINS___METHODDEF
    FROZENSET_COPY_METHODDEF
    SET_DIFFERENCE_MULTI_METHODDEF
    SET_INTERSECTION_MULTI_METHODDEF
    SET_ISDISJOINT_METHODDEF
    SET_ISSUBSET_METHODDEF
    SET_ISSUPERSET_METHODDEF
    SET___REDUCE___METHODDEF
    SET___SIZEOF___METHODDEF
    SET_SYMMETRIC_DIFFERENCE_METHODDEF
    SET_UNION_METHODDEF
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL,              NULL}   /* sentinel */
};

static TyNumberMethods frozenset_as_number = {
    0,                                  /*nb_add*/
    set_sub,                            /*nb_subtract*/
    0,                                  /*nb_multiply*/
    0,                                  /*nb_remainder*/
    0,                                  /*nb_divmod*/
    0,                                  /*nb_power*/
    0,                                  /*nb_negative*/
    0,                                  /*nb_positive*/
    0,                                  /*nb_absolute*/
    0,                                  /*nb_bool*/
    0,                                  /*nb_invert*/
    0,                                  /*nb_lshift*/
    0,                                  /*nb_rshift*/
    set_and,                            /*nb_and*/
    set_xor,                            /*nb_xor*/
    set_or,                             /*nb_or*/
};

TyDoc_STRVAR(frozenset_doc,
"frozenset(iterable=(), /)\n\
--\n\
\n\
Build an immutable unordered collection of unique elements.");

TyTypeObject TyFrozenSet_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "frozenset",                        /* tp_name */
    sizeof(PySetObject),                /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    set_dealloc,                        /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    set_repr,                           /* tp_repr */
    &frozenset_as_number,               /* tp_as_number */
    &set_as_sequence,                   /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    frozenset_hash,                     /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE |
        _Ty_TPFLAGS_MATCH_SELF,         /* tp_flags */
    frozenset_doc,                      /* tp_doc */
    set_traverse,                       /* tp_traverse */
    set_clear_internal,                 /* tp_clear */
    set_richcompare,                    /* tp_richcompare */
    offsetof(PySetObject, weakreflist), /* tp_weaklistoffset */
    set_iter,                           /* tp_iter */
    0,                                  /* tp_iternext */
    frozenset_methods,                  /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    frozenset_new,                      /* tp_new */
    PyObject_GC_Del,                    /* tp_free */
    .tp_vectorcall = frozenset_vectorcall,
    .tp_version_tag = _Ty_TYPE_VERSION_FROZEN_SET,
};


/***** C API functions *************************************************/

TyObject *
TySet_New(TyObject *iterable)
{
    return make_new_set(&TySet_Type, iterable);
}

TyObject *
TyFrozenSet_New(TyObject *iterable)
{
    return make_new_set(&TyFrozenSet_Type, iterable);
}

Ty_ssize_t
TySet_Size(TyObject *anyset)
{
    if (!PyAnySet_Check(anyset)) {
        TyErr_BadInternalCall();
        return -1;
    }
    return set_len(anyset);
}

int
TySet_Clear(TyObject *set)
{
    if (!TySet_Check(set)) {
        TyErr_BadInternalCall();
        return -1;
    }
    (void)set_clear(set, NULL);
    return 0;
}

void
_TySet_ClearInternal(PySetObject *so)
{
    (void)set_clear_internal((TyObject*)so);
}

int
TySet_Contains(TyObject *anyset, TyObject *key)
{
    if (!PyAnySet_Check(anyset)) {
        TyErr_BadInternalCall();
        return -1;
    }

    int rv;
    Ty_BEGIN_CRITICAL_SECTION(anyset);
    rv = set_contains_key((PySetObject *)anyset, key);
    Ty_END_CRITICAL_SECTION();
    return rv;
}

int
TySet_Discard(TyObject *set, TyObject *key)
{
    if (!TySet_Check(set)) {
        TyErr_BadInternalCall();
        return -1;
    }

    int rv;
    Ty_BEGIN_CRITICAL_SECTION(set);
    rv = set_discard_key((PySetObject *)set, key);
    Ty_END_CRITICAL_SECTION();
    return rv;
}

int
TySet_Add(TyObject *anyset, TyObject *key)
{
    if (!TySet_Check(anyset) &&
        (!TyFrozenSet_Check(anyset) || Ty_REFCNT(anyset) != 1)) {
        TyErr_BadInternalCall();
        return -1;
    }

    int rv;
    Ty_BEGIN_CRITICAL_SECTION(anyset);
    rv = set_add_key((PySetObject *)anyset, key);
    Ty_END_CRITICAL_SECTION();
    return rv;
}

int
_TySet_NextEntry(TyObject *set, Ty_ssize_t *pos, TyObject **key, Ty_hash_t *hash)
{
    setentry *entry;

    if (!PyAnySet_Check(set)) {
        TyErr_BadInternalCall();
        return -1;
    }
    if (set_next((PySetObject *)set, pos, &entry) == 0)
        return 0;
    *key = entry->key;
    *hash = entry->hash;
    return 1;
}

int
_TySet_NextEntryRef(TyObject *set, Ty_ssize_t *pos, TyObject **key, Ty_hash_t *hash)
{
    setentry *entry;

    if (!PyAnySet_Check(set)) {
        TyErr_BadInternalCall();
        return -1;
    }
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(set);
    if (set_next((PySetObject *)set, pos, &entry) == 0)
        return 0;
    *key = Ty_NewRef(entry->key);
    *hash = entry->hash;
    return 1;
}

TyObject *
TySet_Pop(TyObject *set)
{
    if (!TySet_Check(set)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return set_pop(set, NULL);
}

int
_TySet_Update(TyObject *set, TyObject *iterable)
{
    if (!TySet_Check(set)) {
        TyErr_BadInternalCall();
        return -1;
    }
    return set_update_internal((PySetObject *)set, iterable);
}

/* Exported for the gdb plugin's benefit. */
TyObject *_TySet_Dummy = dummy;

/***** Dummy Struct  *************************************************/

static TyObject *
dummy_repr(TyObject *op)
{
    return TyUnicode_FromString("<dummy key>");
}

static void _Ty_NO_RETURN
dummy_dealloc(TyObject* ignore)
{
    Ty_FatalError("deallocating <dummy key>");
}

static TyTypeObject _PySetDummy_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "<dummy key> type",
    0,
    0,
    dummy_dealloc,      /*tp_dealloc*/ /*never called*/
    0,                  /*tp_vectorcall_offset*/
    0,                  /*tp_getattr*/
    0,                  /*tp_setattr*/
    0,                  /*tp_as_async*/
    dummy_repr,         /*tp_repr*/
    0,                  /*tp_as_number*/
    0,                  /*tp_as_sequence*/
    0,                  /*tp_as_mapping*/
    0,                  /*tp_hash */
    0,                  /*tp_call */
    0,                  /*tp_str */
    0,                  /*tp_getattro */
    0,                  /*tp_setattro */
    0,                  /*tp_as_buffer */
    Ty_TPFLAGS_DEFAULT, /*tp_flags */
};

static TyObject _dummy_struct = _TyObject_HEAD_INIT(&_PySetDummy_Type);
