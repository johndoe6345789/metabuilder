/* Dictionary object implementation using a hash table */

/* The distribution includes a separate file, Objects/dictnotes.txt,
   describing explorations into dictionary design and optimization.
   It covers typical dictionary use patterns, the parameters for
   tuning dictionaries, and several ideas for possible optimizations.
*/

/* PyDictKeysObject

This implements the dictionary's hashtable.

As of Python 3.6, this is compact and ordered. Basic idea is described here:
* https://mail.python.org/pipermail/python-dev/2012-December/123028.html
* https://morepypy.blogspot.com/2015/01/faster-more-memory-efficient-and-more.html

layout:

+---------------------+
| dk_refcnt           |
| dk_log2_size        |
| dk_log2_index_bytes |
| dk_kind             |
| dk_version          |
| dk_usable           |
| dk_nentries         |
+---------------------+
| dk_indices[]        |
|                     |
+---------------------+
| dk_entries[]        |
|                     |
+---------------------+

dk_indices is actual hashtable.  It holds index in entries, or DKIX_EMPTY(-1)
or DKIX_DUMMY(-2).
Size of indices is dk_size.  Type of each index in indices varies with dk_size:

* int8  for          dk_size <= 128
* int16 for 256   <= dk_size <= 2**15
* int32 for 2**16 <= dk_size <= 2**31
* int64 for 2**32 <= dk_size

dk_entries is array of PyDictKeyEntry when dk_kind == DICT_KEYS_GENERAL or
PyDictUnicodeEntry otherwise. Its length is USABLE_FRACTION(dk_size).

NOTE: Since negative value is used for DKIX_EMPTY and DKIX_DUMMY, type of
dk_indices entry is signed integer and int16 is used for table which
dk_size == 256.
*/


/*
The DictObject can be in one of two forms.

Either:
  A combined table:
    ma_values == NULL, dk_refcnt == 1.
    Values are stored in the me_value field of the PyDictKeyEntry.
Or:
  A split table:
    ma_values != NULL, dk_refcnt >= 1
    Values are stored in the ma_values array.
    Only string (unicode) keys are allowed.

There are four kinds of slots in the table (slot is index, and
DK_ENTRIES(keys)[index] if index >= 0):

1. Unused.  index == DKIX_EMPTY
   Does not hold an active (key, value) pair now and never did.  Unused can
   transition to Active upon key insertion.  This is each slot's initial state.

2. Active.  index >= 0, me_key != NULL and me_value != NULL
   Holds an active (key, value) pair.  Active can transition to Dummy or
   Pending upon key deletion (for combined and split tables respectively).
   This is the only case in which me_value != NULL.

3. Dummy.  index == DKIX_DUMMY  (combined only)
   Previously held an active (key, value) pair, but that was deleted and an
   active pair has not yet overwritten the slot.  Dummy can transition to
   Active upon key insertion.  Dummy slots cannot be made Unused again
   else the probe sequence in case of collision would have no way to know
   they were once active.
   In free-threaded builds dummy slots are not re-used to allow lock-free
   lookups to proceed safely.

4. Pending. index >= 0, key != NULL, and value == NULL  (split only)
   Not yet inserted in split-table.
*/

/*
Preserving insertion order

It's simple for combined table.  Since dk_entries is mostly append only, we can
get insertion order by just iterating dk_entries.

One exception is .popitem().  It removes last item in dk_entries and decrement
dk_nentries to achieve amortized O(1).  Since there are DKIX_DUMMY remains in
dk_indices, we can't increment dk_usable even though dk_nentries is
decremented.

To preserve the order in a split table, a bit vector is used  to record the
insertion order. When a key is inserted the bit vector is shifted up by 4 bits
and the index of the key is stored in the low 4 bits.
As a consequence of this, split keys have a maximum size of 16.
*/

/* TyDict_MINSIZE is the starting size for any new dict.
 * 8 allows dicts with no more than 5 active entries; experiments suggested
 * this suffices for the majority of dicts (consisting mostly of usually-small
 * dicts created to pass keyword arguments).
 * Making this 8, rather than 4 reduces the number of resizes for most
 * dictionaries, without any significant extra memory use.
 */
#define TyDict_LOG_MINSIZE 3
#define TyDict_MINSIZE 8

#include "Python.h"
#include "pycore_bitutils.h"      // _Ty_bit_length
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_code.h"          // stats
#include "pycore_critical_section.h" // Ty_BEGIN_CRITICAL_SECTION, Ty_END_CRITICAL_SECTION
#include "pycore_dict.h"          // export _TyDict_SizeOf()
#include "pycore_freelist.h"      // _PyFreeListState_GET()
#include "pycore_gc.h"            // _TyObject_GC_IS_TRACKED()
#include "pycore_object.h"        // _TyObject_GC_TRACK(), _PyDebugAllocatorStats()
#include "pycore_pyatomic_ft_wrappers.h" // FT_ATOMIC_LOAD_SSIZE_RELAXED
#include "pycore_pyerrors.h"      // _TyErr_GetRaisedException()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_tuple.h"         // _TyTuple_Recycle()
#include "pycore_unicodeobject.h" // _TyUnicode_InternImmortal()

#include "stringlib/eq.h"                // unicode_eq()
#include <stdbool.h>


/*[clinic input]
class dict "PyDictObject *" "&TyDict_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=f157a5a0ce9589d6]*/


/*
To ensure the lookup algorithm terminates, there must be at least one Unused
slot (NULL key) in the table.
To avoid slowing down lookups on a near-full table, we resize the table when
it's USABLE_FRACTION (currently two-thirds) full.
*/

#ifdef Ty_GIL_DISABLED

static inline void
ASSERT_DICT_LOCKED(TyObject *op)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
}
#define ASSERT_DICT_LOCKED(op) ASSERT_DICT_LOCKED(_Py_CAST(TyObject*, op))
#define ASSERT_WORLD_STOPPED_OR_DICT_LOCKED(op)                         \
    if (!_TyInterpreterState_GET()->stoptheworld.world_stopped) {       \
        ASSERT_DICT_LOCKED(op);                                         \
    }
#define ASSERT_WORLD_STOPPED_OR_OBJ_LOCKED(op)                         \
    if (!_TyInterpreterState_GET()->stoptheworld.world_stopped) {      \
        _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);                 \
    }

#define IS_DICT_SHARED(mp) _TyObject_GC_IS_SHARED(mp)
#define SET_DICT_SHARED(mp) _TyObject_GC_SET_SHARED(mp)
#define LOAD_INDEX(keys, size, idx) _Ty_atomic_load_int##size##_relaxed(&((const int##size##_t*)keys->dk_indices)[idx]);
#define STORE_INDEX(keys, size, idx, value) _Ty_atomic_store_int##size##_relaxed(&((int##size##_t*)keys->dk_indices)[idx], (int##size##_t)value);
#define ASSERT_OWNED_OR_SHARED(mp) \
    assert(_Ty_IsOwnedByCurrentThread((TyObject *)mp) || IS_DICT_SHARED(mp));

#define LOCK_KEYS_IF_SPLIT(keys, kind) \
        if (kind == DICT_KEYS_SPLIT) { \
            LOCK_KEYS(keys);           \
        }

#define UNLOCK_KEYS_IF_SPLIT(keys, kind) \
        if (kind == DICT_KEYS_SPLIT) {   \
            UNLOCK_KEYS(keys);           \
        }

static inline Ty_ssize_t
load_keys_nentries(PyDictObject *mp)
{
    PyDictKeysObject *keys = _Ty_atomic_load_ptr(&mp->ma_keys);
    return _Ty_atomic_load_ssize(&keys->dk_nentries);
}

static inline void
set_keys(PyDictObject *mp, PyDictKeysObject *keys)
{
    ASSERT_OWNED_OR_SHARED(mp);
    _Ty_atomic_store_ptr_release(&mp->ma_keys, keys);
}

static inline void
set_values(PyDictObject *mp, PyDictValues *values)
{
    ASSERT_OWNED_OR_SHARED(mp);
    _Ty_atomic_store_ptr_release(&mp->ma_values, values);
}

#define LOCK_KEYS(keys) PyMutex_LockFlags(&keys->dk_mutex, _Ty_LOCK_DONT_DETACH)
#define UNLOCK_KEYS(keys) PyMutex_Unlock(&keys->dk_mutex)

#define ASSERT_KEYS_LOCKED(keys) assert(PyMutex_IsLocked(&keys->dk_mutex))
#define LOAD_SHARED_KEY(key) _Ty_atomic_load_ptr_acquire(&key)
#define STORE_SHARED_KEY(key, value) _Ty_atomic_store_ptr_release(&key, value)
// Inc refs the keys object, giving the previous value
#define INCREF_KEYS(dk)  _Ty_atomic_add_ssize(&dk->dk_refcnt, 1)
// Dec refs the keys object, giving the previous value
#define DECREF_KEYS(dk)  _Ty_atomic_add_ssize(&dk->dk_refcnt, -1)
#define LOAD_KEYS_NENTRIES(keys) _Ty_atomic_load_ssize_relaxed(&keys->dk_nentries)

#define INCREF_KEYS_FT(dk) dictkeys_incref(dk)
#define DECREF_KEYS_FT(dk, shared) dictkeys_decref(_TyInterpreterState_GET(), dk, shared)

static inline void split_keys_entry_added(PyDictKeysObject *keys)
{
    ASSERT_KEYS_LOCKED(keys);

    // We increase before we decrease so we never get too small of a value
    // when we're racing with reads
    _Ty_atomic_store_ssize_relaxed(&keys->dk_nentries, keys->dk_nentries + 1);
    _Ty_atomic_store_ssize_release(&keys->dk_usable, keys->dk_usable - 1);
}

#else /* Ty_GIL_DISABLED */

#define ASSERT_DICT_LOCKED(op)
#define ASSERT_WORLD_STOPPED_OR_DICT_LOCKED(op)
#define ASSERT_WORLD_STOPPED_OR_OBJ_LOCKED(op)
#define LOCK_KEYS(keys)
#define UNLOCK_KEYS(keys)
#define ASSERT_KEYS_LOCKED(keys)
#define LOAD_SHARED_KEY(key) key
#define STORE_SHARED_KEY(key, value) key = value
#define INCREF_KEYS(dk)  dk->dk_refcnt++
#define DECREF_KEYS(dk)  dk->dk_refcnt--
#define LOAD_KEYS_NENTRIES(keys) keys->dk_nentries
#define INCREF_KEYS_FT(dk)
#define DECREF_KEYS_FT(dk, shared)
#define LOCK_KEYS_IF_SPLIT(keys, kind)
#define UNLOCK_KEYS_IF_SPLIT(keys, kind)
#define IS_DICT_SHARED(mp) (false)
#define SET_DICT_SHARED(mp)
#define LOAD_INDEX(keys, size, idx) ((const int##size##_t*)(keys->dk_indices))[idx]
#define STORE_INDEX(keys, size, idx, value) ((int##size##_t*)(keys->dk_indices))[idx] = (int##size##_t)value

static inline void split_keys_entry_added(PyDictKeysObject *keys)
{
    keys->dk_usable--;
    keys->dk_nentries++;
}

static inline void
set_keys(PyDictObject *mp, PyDictKeysObject *keys)
{
    mp->ma_keys = keys;
}

static inline void
set_values(PyDictObject *mp, PyDictValues *values)
{
    mp->ma_values = values;
}

static inline Ty_ssize_t
load_keys_nentries(PyDictObject *mp)
{
    return mp->ma_keys->dk_nentries;
}


#endif

#define STORE_KEY(ep, key) FT_ATOMIC_STORE_PTR_RELEASE((ep)->me_key, key)
#define STORE_VALUE(ep, value) FT_ATOMIC_STORE_PTR_RELEASE((ep)->me_value, value)
#define STORE_SPLIT_VALUE(mp, idx, value) FT_ATOMIC_STORE_PTR_RELEASE(mp->ma_values->values[idx], value)
#define STORE_HASH(ep, hash) FT_ATOMIC_STORE_SSIZE_RELAXED((ep)->me_hash, hash)
#define STORE_KEYS_USABLE(keys, usable) FT_ATOMIC_STORE_SSIZE_RELAXED(keys->dk_usable, usable)
#define STORE_KEYS_NENTRIES(keys, nentries) FT_ATOMIC_STORE_SSIZE_RELAXED(keys->dk_nentries, nentries)
#define STORE_USED(mp, used) FT_ATOMIC_STORE_SSIZE_RELAXED(mp->ma_used, used)

#define PERTURB_SHIFT 5

/*
Major subtleties ahead:  Most hash schemes depend on having a "good" hash
function, in the sense of simulating randomness.  Python doesn't:  its most
important hash functions (for ints) are very regular in common
cases:

  >>>[hash(i) for i in range(4)]
  [0, 1, 2, 3]

This isn't necessarily bad!  To the contrary, in a table of size 2**i, taking
the low-order i bits as the initial table index is extremely fast, and there
are no collisions at all for dicts indexed by a contiguous range of ints. So
this gives better-than-random behavior in common cases, and that's very
desirable.

OTOH, when collisions occur, the tendency to fill contiguous slices of the
hash table makes a good collision resolution strategy crucial.  Taking only
the last i bits of the hash code is also vulnerable:  for example, consider
the list [i << 16 for i in range(20000)] as a set of keys.  Since ints are
their own hash codes, and this fits in a dict of size 2**15, the last 15 bits
 of every hash code are all 0:  they *all* map to the same table index.

But catering to unusual cases should not slow the usual ones, so we just take
the last i bits anyway.  It's up to collision resolution to do the rest.  If
we *usually* find the key we're looking for on the first try (and, it turns
out, we usually do -- the table load factor is kept under 2/3, so the odds
are solidly in our favor), then it makes best sense to keep the initial index
computation dirt cheap.

The first half of collision resolution is to visit table indices via this
recurrence:

    j = ((5*j) + 1) mod 2**i

For any initial j in range(2**i), repeating that 2**i times generates each
int in range(2**i) exactly once (see any text on random-number generation for
proof).  By itself, this doesn't help much:  like linear probing (setting
j += 1, or j -= 1, on each loop trip), it scans the table entries in a fixed
order.  This would be bad, except that's not the only thing we do, and it's
actually *good* in the common cases where hash keys are consecutive.  In an
example that's really too small to make this entirely clear, for a table of
size 2**3 the order of indices is:

    0 -> 1 -> 6 -> 7 -> 4 -> 5 -> 2 -> 3 -> 0 [and here it's repeating]

If two things come in at index 5, the first place we look after is index 2,
not 6, so if another comes in at index 6 the collision at 5 didn't hurt it.
Linear probing is deadly in this case because there the fixed probe order
is the *same* as the order consecutive keys are likely to arrive.  But it's
extremely unlikely hash codes will follow a 5*j+1 recurrence by accident,
and certain that consecutive hash codes do not.

The other half of the strategy is to get the other bits of the hash code
into play.  This is done by initializing a (unsigned) vrbl "perturb" to the
full hash code, and changing the recurrence to:

    perturb >>= PERTURB_SHIFT;
    j = (5*j) + 1 + perturb;
    use j % 2**i as the next table index;

Now the probe sequence depends (eventually) on every bit in the hash code,
and the pseudo-scrambling property of recurring on 5*j+1 is more valuable,
because it quickly magnifies small differences in the bits that didn't affect
the initial index.  Note that because perturb is unsigned, if the recurrence
is executed often enough perturb eventually becomes and remains 0.  At that
point (very rarely reached) the recurrence is on (just) 5*j+1 again, and
that's certain to find an empty slot eventually (since it generates every int
in range(2**i), and we make sure there's always at least one empty slot).

Selecting a good value for PERTURB_SHIFT is a balancing act.  You want it
small so that the high bits of the hash code continue to affect the probe
sequence across iterations; but you want it large so that in really bad cases
the high-order hash bits have an effect on early iterations.  5 was "the
best" in minimizing total collisions across experiments Tim Peters ran (on
both normal and pathological cases), but 4 and 6 weren't significantly worse.

Historical: Reimer Behrends contributed the idea of using a polynomial-based
approach, using repeated multiplication by x in GF(2**n) where an irreducible
polynomial for each table size was chosen such that x was a primitive root.
Christian Tismer later extended that to use division by x instead, as an
efficient way to get the high bits of the hash code into play.  This scheme
also gave excellent collision statistics, but was more expensive:  two
if-tests were required inside the loop; computing "the next" index took about
the same number of operations but without as much potential parallelism
(e.g., computing 5*j can go on at the same time as computing 1+perturb in the
above, and then shifting perturb can be done while the table index is being
masked); and the PyDictObject struct required a member to hold the table's
polynomial.  In Tim's experiments the current scheme ran faster, produced
equally good collision statistics, needed less code & used less memory.

*/

static int dictresize(TyInterpreterState *interp, PyDictObject *mp,
                      uint8_t log_newsize, int unicode);

static TyObject* dict_iter(TyObject *dict);

static int
setitem_lock_held(PyDictObject *mp, TyObject *key, TyObject *value);
static int
dict_setdefault_ref_lock_held(TyObject *d, TyObject *key, TyObject *default_value,
                    TyObject **result, int incref_result);

#ifndef NDEBUG
static int _TyObject_InlineValuesConsistencyCheck(TyObject *obj);
#endif

#include "clinic/dictobject.c.h"


static inline Ty_hash_t
unicode_get_hash(TyObject *o)
{
    assert(TyUnicode_CheckExact(o));
    return FT_ATOMIC_LOAD_SSIZE_RELAXED(_PyASCIIObject_CAST(o)->hash);
}

/* Print summary info about the state of the optimized allocator */
void
_TyDict_DebugMallocStats(FILE *out)
{
    _PyDebugAllocatorStats(out, "free PyDictObject",
                           _Ty_FREELIST_SIZE(dicts),
                           sizeof(PyDictObject));
    _PyDebugAllocatorStats(out, "free PyDictKeysObject",
                           _Ty_FREELIST_SIZE(dictkeys),
                           sizeof(PyDictKeysObject));
}

#define DK_MASK(dk) (DK_SIZE(dk)-1)

#define _Ty_DICT_IMMORTAL_INITIAL_REFCNT PY_SSIZE_T_MIN

static void free_keys_object(PyDictKeysObject *keys, bool use_qsbr);

/* PyDictKeysObject has refcounts like TyObject does, so we have the
   following two functions to mirror what Ty_INCREF() and Ty_DECREF() do.
   (Keep in mind that PyDictKeysObject isn't actually a TyObject.)
   Likewise a PyDictKeysObject can be immortal (e.g. Ty_EMPTY_KEYS),
   so we apply a naive version of what Ty_INCREF() and Ty_DECREF() do
   for immortal objects. */

static inline void
dictkeys_incref(PyDictKeysObject *dk)
{
    if (FT_ATOMIC_LOAD_SSIZE_RELAXED(dk->dk_refcnt) < 0) {
        assert(FT_ATOMIC_LOAD_SSIZE_RELAXED(dk->dk_refcnt) == _Ty_DICT_IMMORTAL_INITIAL_REFCNT);
        return;
    }
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
    INCREF_KEYS(dk);
}

static inline void
dictkeys_decref(TyInterpreterState *interp, PyDictKeysObject *dk, bool use_qsbr)
{
    if (FT_ATOMIC_LOAD_SSIZE_RELAXED(dk->dk_refcnt) < 0) {
        assert(FT_ATOMIC_LOAD_SSIZE_RELAXED(dk->dk_refcnt) == _Ty_DICT_IMMORTAL_INITIAL_REFCNT);
        return;
    }
    assert(FT_ATOMIC_LOAD_SSIZE(dk->dk_refcnt) > 0);
#ifdef Ty_REF_DEBUG
    _Ty_DecRefTotal(_TyThreadState_GET());
#endif
    if (DECREF_KEYS(dk) == 1) {
        if (DK_IS_UNICODE(dk)) {
            PyDictUnicodeEntry *entries = DK_UNICODE_ENTRIES(dk);
            Ty_ssize_t i, n;
            for (i = 0, n = dk->dk_nentries; i < n; i++) {
                Ty_XDECREF(entries[i].me_key);
                Ty_XDECREF(entries[i].me_value);
            }
        }
        else {
            PyDictKeyEntry *entries = DK_ENTRIES(dk);
            Ty_ssize_t i, n;
            for (i = 0, n = dk->dk_nentries; i < n; i++) {
                Ty_XDECREF(entries[i].me_key);
                Ty_XDECREF(entries[i].me_value);
            }
        }
        free_keys_object(dk, use_qsbr);
    }
}

/* lookup indices.  returns DKIX_EMPTY, DKIX_DUMMY, or ix >=0 */
static inline Ty_ssize_t
dictkeys_get_index(const PyDictKeysObject *keys, Ty_ssize_t i)
{
    int log2size = DK_LOG_SIZE(keys);
    Ty_ssize_t ix;

    if (log2size < 8) {
        ix = LOAD_INDEX(keys, 8, i);
    }
    else if (log2size < 16) {
        ix = LOAD_INDEX(keys, 16, i);
    }
#if SIZEOF_VOID_P > 4
    else if (log2size >= 32) {
        ix = LOAD_INDEX(keys, 64, i);
    }
#endif
    else {
        ix = LOAD_INDEX(keys, 32, i);
    }
    assert(ix >= DKIX_DUMMY);
    return ix;
}

/* write to indices. */
static inline void
dictkeys_set_index(PyDictKeysObject *keys, Ty_ssize_t i, Ty_ssize_t ix)
{
    int log2size = DK_LOG_SIZE(keys);

    assert(ix >= DKIX_DUMMY);
    assert(keys->dk_version == 0);

    if (log2size < 8) {
        assert(ix <= 0x7f);
        STORE_INDEX(keys, 8, i, ix);
    }
    else if (log2size < 16) {
        assert(ix <= 0x7fff);
        STORE_INDEX(keys, 16, i, ix);
    }
#if SIZEOF_VOID_P > 4
    else if (log2size >= 32) {
        STORE_INDEX(keys, 64, i, ix);
    }
#endif
    else {
        assert(ix <= 0x7fffffff);
        STORE_INDEX(keys, 32, i, ix);
    }
}


/* USABLE_FRACTION is the maximum dictionary load.
 * Increasing this ratio makes dictionaries more dense resulting in more
 * collisions.  Decreasing it improves sparseness at the expense of spreading
 * indices over more cache lines and at the cost of total memory consumed.
 *
 * USABLE_FRACTION must obey the following:
 *     (0 < USABLE_FRACTION(n) < n) for all n >= 2
 *
 * USABLE_FRACTION should be quick to calculate.
 * Fractions around 1/2 to 2/3 seem to work well in practice.
 */
#define USABLE_FRACTION(n) (((n) << 1)/3)

/* Find the smallest dk_size >= minsize. */
static inline uint8_t
calculate_log2_keysize(Ty_ssize_t minsize)
{
#if SIZEOF_LONG == SIZEOF_SIZE_T
    minsize = Ty_MAX(minsize, TyDict_MINSIZE);
    return _Ty_bit_length(minsize - 1);
#elif defined(_MSC_VER)
    // On 64bit Windows, sizeof(long) == 4. We cannot use _Ty_bit_length.
    minsize = Ty_MAX(minsize, TyDict_MINSIZE);
    unsigned long msb;
    _BitScanReverse64(&msb, (uint64_t)minsize - 1);
    return (uint8_t)(msb + 1);
#else
    uint8_t log2_size;
    for (log2_size = TyDict_LOG_MINSIZE;
            (((Ty_ssize_t)1) << log2_size) < minsize;
            log2_size++)
        ;
    return log2_size;
#endif
}

/* estimate_keysize is reverse function of USABLE_FRACTION.
 *
 * This can be used to reserve enough size to insert n entries without
 * resizing.
 */
static inline uint8_t
estimate_log2_keysize(Ty_ssize_t n)
{
    return calculate_log2_keysize((n*3 + 1) / 2);
}


/* GROWTH_RATE. Growth rate upon hitting maximum load.
 * Currently set to used*3.
 * This means that dicts double in size when growing without deletions,
 * but have more head room when the number of deletions is on a par with the
 * number of insertions.  See also bpo-17563 and bpo-33205.
 *
 * GROWTH_RATE was set to used*4 up to version 3.2.
 * GROWTH_RATE was set to used*2 in version 3.3.0
 * GROWTH_RATE was set to used*2 + capacity/2 in 3.4.0-3.6.0.
 */
#define GROWTH_RATE(d) ((d)->ma_used*3)

/* This immutable, empty PyDictKeysObject is used for TyDict_Clear()
 * (which cannot fail and thus can do no allocation).
 *
 * See https://github.com/python/cpython/pull/127568#discussion_r1868070614
 * for the rationale of using dk_log2_index_bytes=3 instead of 0.
 */
static PyDictKeysObject empty_keys_struct = {
        _Ty_DICT_IMMORTAL_INITIAL_REFCNT, /* dk_refcnt */
        0, /* dk_log2_size */
        3, /* dk_log2_index_bytes */
        DICT_KEYS_UNICODE, /* dk_kind */
#ifdef Ty_GIL_DISABLED
        {0}, /* dk_mutex */
#endif
        1, /* dk_version */
        0, /* dk_usable (immutable) */
        0, /* dk_nentries */
        {DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY,
         DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY}, /* dk_indices */
};

#define Ty_EMPTY_KEYS &empty_keys_struct

/* Uncomment to check the dict content in _TyDict_CheckConsistency() */
// #define DEBUG_PYDICT

#ifdef DEBUG_PYDICT
#  define ASSERT_CONSISTENT(op) assert(_TyDict_CheckConsistency((TyObject *)(op), 1))
#else
#  define ASSERT_CONSISTENT(op) assert(_TyDict_CheckConsistency((TyObject *)(op), 0))
#endif

static inline int
get_index_from_order(PyDictObject *mp, Ty_ssize_t i)
{
    assert(mp->ma_used <= SHARED_KEYS_MAX_SIZE);
    assert(i < mp->ma_values->size);
    uint8_t *array = get_insertion_order_array(mp->ma_values);
    return array[i];
}

#ifdef DEBUG_PYDICT
static void
dump_entries(PyDictKeysObject *dk)
{
    for (Ty_ssize_t i = 0; i < dk->dk_nentries; i++) {
        if (DK_IS_UNICODE(dk)) {
            PyDictUnicodeEntry *ep = &DK_UNICODE_ENTRIES(dk)[i];
            printf("key=%p value=%p\n", ep->me_key, ep->me_value);
        }
        else {
            PyDictKeyEntry *ep = &DK_ENTRIES(dk)[i];
            printf("key=%p hash=%lx value=%p\n", ep->me_key, ep->me_hash, ep->me_value);
        }
    }
}
#endif

int
_TyDict_CheckConsistency(TyObject *op, int check_content)
{
    ASSERT_WORLD_STOPPED_OR_DICT_LOCKED(op);

#define CHECK(expr) \
    do { if (!(expr)) { _TyObject_ASSERT_FAILED_MSG(op, Ty_STRINGIFY(expr)); } } while (0)

    assert(op != NULL);
    CHECK(TyDict_Check(op));
    PyDictObject *mp = (PyDictObject *)op;

    PyDictKeysObject *keys = mp->ma_keys;
    int splitted = _TyDict_HasSplitTable(mp);
    Ty_ssize_t usable = USABLE_FRACTION(DK_SIZE(keys));

    // In the free-threaded build, shared keys may be concurrently modified,
    // so use atomic loads.
    Ty_ssize_t dk_usable = FT_ATOMIC_LOAD_SSIZE_ACQUIRE(keys->dk_usable);
    Ty_ssize_t dk_nentries = FT_ATOMIC_LOAD_SSIZE_ACQUIRE(keys->dk_nentries);

    CHECK(0 <= mp->ma_used && mp->ma_used <= usable);
    CHECK(0 <= dk_usable && dk_usable <= usable);
    CHECK(0 <= dk_nentries && dk_nentries <= usable);
    CHECK(dk_usable + dk_nentries <= usable);

    if (!splitted) {
        /* combined table */
        CHECK(keys->dk_kind != DICT_KEYS_SPLIT);
        CHECK(keys->dk_refcnt == 1 || keys == Ty_EMPTY_KEYS);
    }
    else {
        CHECK(keys->dk_kind == DICT_KEYS_SPLIT);
        CHECK(mp->ma_used <= SHARED_KEYS_MAX_SIZE);
        if (mp->ma_values->embedded) {
            CHECK(mp->ma_values->embedded == 1);
            CHECK(mp->ma_values->valid == 1);
        }
    }

    if (check_content) {
        LOCK_KEYS_IF_SPLIT(keys, keys->dk_kind);
        for (Ty_ssize_t i=0; i < DK_SIZE(keys); i++) {
            Ty_ssize_t ix = dictkeys_get_index(keys, i);
            CHECK(DKIX_DUMMY <= ix && ix <= usable);
        }

        if (keys->dk_kind == DICT_KEYS_GENERAL) {
            PyDictKeyEntry *entries = DK_ENTRIES(keys);
            for (Ty_ssize_t i=0; i < usable; i++) {
                PyDictKeyEntry *entry = &entries[i];
                TyObject *key = entry->me_key;

                if (key != NULL) {
                    /* test_dict fails if PyObject_Hash() is called again */
                    CHECK(entry->me_hash != -1);
                    CHECK(entry->me_value != NULL);

                    if (TyUnicode_CheckExact(key)) {
                        Ty_hash_t hash = unicode_get_hash(key);
                        CHECK(entry->me_hash == hash);
                    }
                }
            }
        }
        else {
            PyDictUnicodeEntry *entries = DK_UNICODE_ENTRIES(keys);
            for (Ty_ssize_t i=0; i < usable; i++) {
                PyDictUnicodeEntry *entry = &entries[i];
                TyObject *key = entry->me_key;

                if (key != NULL) {
                    CHECK(TyUnicode_CheckExact(key));
                    Ty_hash_t hash = unicode_get_hash(key);
                    CHECK(hash != -1);
                    if (!splitted) {
                        CHECK(entry->me_value != NULL);
                    }
                }

                if (splitted) {
                    CHECK(entry->me_value == NULL);
                }
            }
        }

        if (splitted) {
            CHECK(mp->ma_used <= SHARED_KEYS_MAX_SIZE);
            /* splitted table */
            int duplicate_check = 0;
            for (Ty_ssize_t i=0; i < mp->ma_used; i++) {
                int index = get_index_from_order(mp, i);
                CHECK((duplicate_check & (1<<index)) == 0);
                duplicate_check |= (1<<index);
                CHECK(mp->ma_values->values[index] != NULL);
            }
        }
        UNLOCK_KEYS_IF_SPLIT(keys, keys->dk_kind);
    }
    return 1;

#undef CHECK
}


static PyDictKeysObject*
new_keys_object(TyInterpreterState *interp, uint8_t log2_size, bool unicode)
{
    Ty_ssize_t usable;
    int log2_bytes;
    size_t entry_size = unicode ? sizeof(PyDictUnicodeEntry) : sizeof(PyDictKeyEntry);

    assert(log2_size >= TyDict_LOG_MINSIZE);

    usable = USABLE_FRACTION((size_t)1<<log2_size);
    if (log2_size < 8) {
        log2_bytes = log2_size;
    }
    else if (log2_size < 16) {
        log2_bytes = log2_size + 1;
    }
#if SIZEOF_VOID_P > 4
    else if (log2_size >= 32) {
        log2_bytes = log2_size + 3;
    }
#endif
    else {
        log2_bytes = log2_size + 2;
    }

    PyDictKeysObject *dk = NULL;
    if (log2_size == TyDict_LOG_MINSIZE && unicode) {
        dk = _Ty_FREELIST_POP_MEM(dictkeys);
    }
    if (dk == NULL) {
        dk = TyMem_Malloc(sizeof(PyDictKeysObject)
                          + ((size_t)1 << log2_bytes)
                          + entry_size * usable);
        if (dk == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
    }
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
    dk->dk_refcnt = 1;
    dk->dk_log2_size = log2_size;
    dk->dk_log2_index_bytes = log2_bytes;
    dk->dk_kind = unicode ? DICT_KEYS_UNICODE : DICT_KEYS_GENERAL;
#ifdef Ty_GIL_DISABLED
    dk->dk_mutex = (PyMutex){0};
#endif
    dk->dk_nentries = 0;
    dk->dk_usable = usable;
    dk->dk_version = 0;
    memset(&dk->dk_indices[0], 0xff, ((size_t)1 << log2_bytes));
    memset(&dk->dk_indices[(size_t)1 << log2_bytes], 0, entry_size * usable);
    return dk;
}

static void
free_keys_object(PyDictKeysObject *keys, bool use_qsbr)
{
#ifdef Ty_GIL_DISABLED
    if (use_qsbr) {
        _TyMem_FreeDelayed(keys, _TyDict_KeysSize(keys));
        return;
    }
#endif
    if (DK_LOG_SIZE(keys) == TyDict_LOG_MINSIZE && keys->dk_kind == DICT_KEYS_UNICODE) {
        _Ty_FREELIST_FREE(dictkeys, keys, TyMem_Free);
    }
    else {
        TyMem_Free(keys);
    }
}

static size_t
values_size_from_count(size_t count)
{
    assert(count >= 1);
    size_t suffix_size = _Ty_SIZE_ROUND_UP(count, sizeof(TyObject *));
    assert(suffix_size < 128);
    assert(suffix_size % sizeof(TyObject *) == 0);
    return (count + 1) * sizeof(TyObject *) + suffix_size;
}

#define CACHED_KEYS(tp) (((PyHeapTypeObject*)tp)->ht_cached_keys)

static inline PyDictValues*
new_values(size_t size)
{
    size_t n = values_size_from_count(size);
    PyDictValues *res = (PyDictValues *)TyMem_Malloc(n);
    if (res == NULL) {
        return NULL;
    }
    res->embedded = 0;
    res->size = 0;
    assert(size < 256);
    res->capacity = (uint8_t)size;
    return res;
}

static inline void
free_values(PyDictValues *values, bool use_qsbr)
{
    assert(values->embedded == 0);
#ifdef Ty_GIL_DISABLED
    if (use_qsbr) {
        _TyMem_FreeDelayed(values, values_size_from_count(values->capacity));
        return;
    }
#endif
    TyMem_Free(values);
}

/* Consumes a reference to the keys object */
static TyObject *
new_dict(TyInterpreterState *interp,
         PyDictKeysObject *keys, PyDictValues *values,
         Ty_ssize_t used, int free_values_on_failure)
{
    assert(keys != NULL);
    PyDictObject *mp = _Ty_FREELIST_POP(PyDictObject, dicts);
    if (mp == NULL) {
        mp = PyObject_GC_New(PyDictObject, &TyDict_Type);
        if (mp == NULL) {
            dictkeys_decref(interp, keys, false);
            if (free_values_on_failure) {
                free_values(values, false);
            }
            return NULL;
        }
    }
    assert(Ty_IS_TYPE(mp, &TyDict_Type));
    mp->ma_keys = keys;
    mp->ma_values = values;
    mp->ma_used = used;
    mp->_ma_watcher_tag = 0;
    ASSERT_CONSISTENT(mp);
    _TyObject_GC_TRACK(mp);
    return (TyObject *)mp;
}

static TyObject *
new_dict_with_shared_keys(TyInterpreterState *interp, PyDictKeysObject *keys)
{
    size_t size = shared_keys_usable_size(keys);
    PyDictValues *values = new_values(size);
    if (values == NULL) {
        return TyErr_NoMemory();
    }
    dictkeys_incref(keys);
    for (size_t i = 0; i < size; i++) {
        values->values[i] = NULL;
    }
    return new_dict(interp, keys, values, 0, 1);
}


static PyDictKeysObject *
clone_combined_dict_keys(PyDictObject *orig)
{
    assert(TyDict_Check(orig));
    assert(Ty_TYPE(orig)->tp_iter == dict_iter);
    assert(orig->ma_values == NULL);
    assert(orig->ma_keys != Ty_EMPTY_KEYS);
    assert(orig->ma_keys->dk_refcnt == 1);

    ASSERT_DICT_LOCKED(orig);

    size_t keys_size = _TyDict_KeysSize(orig->ma_keys);
    PyDictKeysObject *keys = TyMem_Malloc(keys_size);
    if (keys == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    memcpy(keys, orig->ma_keys, keys_size);

    /* After copying key/value pairs, we need to incref all
       keys and values and they are about to be co-owned by a
       new dict object. */
    TyObject **pkey, **pvalue;
    size_t offs;
    if (DK_IS_UNICODE(orig->ma_keys)) {
        PyDictUnicodeEntry *ep0 = DK_UNICODE_ENTRIES(keys);
        pkey = &ep0->me_key;
        pvalue = &ep0->me_value;
        offs = sizeof(PyDictUnicodeEntry) / sizeof(TyObject*);
    }
    else {
        PyDictKeyEntry *ep0 = DK_ENTRIES(keys);
        pkey = &ep0->me_key;
        pvalue = &ep0->me_value;
        offs = sizeof(PyDictKeyEntry) / sizeof(TyObject*);
    }

    Ty_ssize_t n = keys->dk_nentries;
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *value = *pvalue;
        if (value != NULL) {
            Ty_INCREF(value);
            Ty_INCREF(*pkey);
        }
        pvalue += offs;
        pkey += offs;
    }

    /* Since we copied the keys table we now have an extra reference
       in the system.  Manually call increment _Ty_RefTotal to signal that
       we have it now; calling dictkeys_incref would be an error as
       keys->dk_refcnt is already set to 1 (after memcpy). */
#ifdef Ty_REF_DEBUG
    _Ty_IncRefTotal(_TyThreadState_GET());
#endif
    return keys;
}

TyObject *
TyDict_New(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    /* We don't incref Ty_EMPTY_KEYS here because it is immortal. */
    return new_dict(interp, Ty_EMPTY_KEYS, NULL, 0, 0);
}

/* Search index of hash table from offset of entry table */
static Ty_ssize_t
lookdict_index(PyDictKeysObject *k, Ty_hash_t hash, Ty_ssize_t index)
{
    size_t mask = DK_MASK(k);
    size_t perturb = (size_t)hash;
    size_t i = (size_t)hash & mask;

    for (;;) {
        Ty_ssize_t ix = dictkeys_get_index(k, i);
        if (ix == index) {
            return i;
        }
        if (ix == DKIX_EMPTY) {
            return DKIX_EMPTY;
        }
        perturb >>= PERTURB_SHIFT;
        i = mask & (i*5 + perturb + 1);
    }
    Ty_UNREACHABLE();
}

static inline Ty_ALWAYS_INLINE Ty_ssize_t
do_lookup(PyDictObject *mp, PyDictKeysObject *dk, TyObject *key, Ty_hash_t hash,
          int (*check_lookup)(PyDictObject *, PyDictKeysObject *, void *, Ty_ssize_t ix, TyObject *key, Ty_hash_t))
{
    void *ep0 = _DK_ENTRIES(dk);
    size_t mask = DK_MASK(dk);
    size_t perturb = hash;
    size_t i = (size_t)hash & mask;
    Ty_ssize_t ix;
    for (;;) {
        ix = dictkeys_get_index(dk, i);
        if (ix >= 0) {
            int cmp = check_lookup(mp, dk, ep0, ix, key, hash);
            if (cmp < 0) {
                return cmp;
            } else if (cmp) {
                return ix;
            }
        }
        else if (ix == DKIX_EMPTY) {
            return DKIX_EMPTY;
        }
        perturb >>= PERTURB_SHIFT;
        i = mask & (i*5 + perturb + 1);

        // Manual loop unrolling
        ix = dictkeys_get_index(dk, i);
        if (ix >= 0) {
            int cmp = check_lookup(mp, dk, ep0, ix, key, hash);
            if (cmp < 0) {
                return cmp;
            } else if (cmp) {
                return ix;
            }
        }
        else if (ix == DKIX_EMPTY) {
            return DKIX_EMPTY;
        }
        perturb >>= PERTURB_SHIFT;
        i = mask & (i*5 + perturb + 1);
    }
    Ty_UNREACHABLE();
}

static inline int
compare_unicode_generic(PyDictObject *mp, PyDictKeysObject *dk,
                        void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictUnicodeEntry *ep = &((PyDictUnicodeEntry *)ep0)[ix];
    assert(ep->me_key != NULL);
    assert(TyUnicode_CheckExact(ep->me_key));
    assert(!TyUnicode_CheckExact(key));

    if (unicode_get_hash(ep->me_key) == hash) {
        TyObject *startkey = ep->me_key;
        Ty_INCREF(startkey);
        int cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
        Ty_DECREF(startkey);
        if (cmp < 0) {
            return DKIX_ERROR;
        }
        if (dk == mp->ma_keys && ep->me_key == startkey) {
            return cmp;
        }
        else {
            /* The dict was mutated, restart */
            return DKIX_KEY_CHANGED;
        }
    }
    return 0;
}

// Search non-Unicode key from Unicode table
static Ty_ssize_t
unicodekeys_lookup_generic(PyDictObject *mp, PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(mp, dk, key, hash, compare_unicode_generic);
}

static inline int
compare_unicode_unicode(PyDictObject *mp, PyDictKeysObject *dk,
                        void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictUnicodeEntry *ep = &((PyDictUnicodeEntry *)ep0)[ix];
    TyObject *ep_key = FT_ATOMIC_LOAD_PTR_RELAXED(ep->me_key);
    assert(ep_key != NULL);
    assert(TyUnicode_CheckExact(ep_key));
    if (ep_key == key ||
            (unicode_get_hash(ep_key) == hash && unicode_eq(ep_key, key))) {
        return 1;
    }
    return 0;
}

static Ty_ssize_t _Ty_HOT_FUNCTION
unicodekeys_lookup_unicode(PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(NULL, dk, key, hash, compare_unicode_unicode);
}

static inline int
compare_generic(PyDictObject *mp, PyDictKeysObject *dk,
                void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictKeyEntry *ep = &((PyDictKeyEntry *)ep0)[ix];
    assert(ep->me_key != NULL);
    if (ep->me_key == key) {
        return 1;
    }
    if (ep->me_hash == hash) {
        TyObject *startkey = ep->me_key;
        Ty_INCREF(startkey);
        int cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
        Ty_DECREF(startkey);
        if (cmp < 0) {
            return DKIX_ERROR;
        }
        if (dk == mp->ma_keys && ep->me_key == startkey) {
            return cmp;
        }
        else {
            /* The dict was mutated, restart */
            return DKIX_KEY_CHANGED;
        }
    }
    return 0;
}

static Ty_ssize_t
dictkeys_generic_lookup(PyDictObject *mp, PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(mp, dk, key, hash, compare_generic);
}

static bool
check_keys_unicode(PyDictKeysObject *dk, TyObject *key)
{
    return TyUnicode_CheckExact(key) && (dk->dk_kind != DICT_KEYS_GENERAL);
}

static Ty_ssize_t
hash_unicode_key(TyObject *key)
{
    assert(TyUnicode_CheckExact(key));
    Ty_hash_t hash = unicode_get_hash(key);
    if (hash == -1) {
        hash = TyUnicode_Type.tp_hash(key);
        assert(hash != -1);
    }
    return hash;
}

#ifdef Ty_GIL_DISABLED
static Ty_ssize_t
unicodekeys_lookup_unicode_threadsafe(PyDictKeysObject* dk, TyObject *key,
                                      Ty_hash_t hash);
#endif

static Ty_ssize_t
unicodekeys_lookup_split(PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    Ty_ssize_t ix;
    assert(dk->dk_kind == DICT_KEYS_SPLIT);
    assert(TyUnicode_CheckExact(key));

#ifdef Ty_GIL_DISABLED
    // A split dictionaries keys can be mutated by other dictionaries
    // but if we have a unicode key we can avoid locking the shared
    // keys.
    ix = unicodekeys_lookup_unicode_threadsafe(dk, key, hash);
    if (ix == DKIX_KEY_CHANGED) {
        LOCK_KEYS(dk);
        ix = unicodekeys_lookup_unicode(dk, key, hash);
        UNLOCK_KEYS(dk);
    }
#else
    ix = unicodekeys_lookup_unicode(dk, key, hash);
#endif
    return ix;
}

/* Lookup a string in a (all unicode) dict keys.
 * Returns DKIX_ERROR if key is not a string,
 * or if the dict keys is not all strings.
 * If the keys is present then return the index of key.
 * If the key is not present then return DKIX_EMPTY.
 */
Ty_ssize_t
_PyDictKeys_StringLookup(PyDictKeysObject* dk, TyObject *key)
{
    if (!check_keys_unicode(dk, key)) {
        return DKIX_ERROR;
    }
    Ty_hash_t hash = hash_unicode_key(key);
    return unicodekeys_lookup_unicode(dk, key, hash);
}

Ty_ssize_t
_PyDictKeys_StringLookupAndVersion(PyDictKeysObject *dk, TyObject *key, uint32_t *version)
{
    if (!check_keys_unicode(dk, key)) {
        return DKIX_ERROR;
    }
    Ty_ssize_t ix;
    Ty_hash_t hash = hash_unicode_key(key);
    LOCK_KEYS(dk);
    ix = unicodekeys_lookup_unicode(dk, key, hash);
    *version = _PyDictKeys_GetVersionForCurrentState(_TyInterpreterState_GET(), dk);
    UNLOCK_KEYS(dk);
    return ix;
}

/* Like _PyDictKeys_StringLookup() but only works on split keys.  Note
 * that in free-threaded builds this locks the keys object as required.
 */
Ty_ssize_t
_PyDictKeys_StringLookupSplit(PyDictKeysObject* dk, TyObject *key)
{
    assert(dk->dk_kind == DICT_KEYS_SPLIT);
    assert(TyUnicode_CheckExact(key));
    Ty_hash_t hash = unicode_get_hash(key);
    if (hash == -1) {
        hash = TyUnicode_Type.tp_hash(key);
        if (hash == -1) {
            TyErr_Clear();
            return DKIX_ERROR;
        }
    }
    return unicodekeys_lookup_split(dk, key, hash);
}

/*
The basic lookup function used by all operations.
This is based on Algorithm D from Knuth Vol. 3, Sec. 6.4.
Open addressing is preferred over chaining since the link overhead for
chaining would be substantial (100% with typical malloc overhead).

The initial probe index is computed as hash mod the table size. Subsequent
probe indices are computed as explained earlier.

All arithmetic on hash should ignore overflow.

_Ty_dict_lookup() is general-purpose, and may return DKIX_ERROR if (and only if) a
comparison raises an exception.
When the key isn't found a DKIX_EMPTY is returned.
*/
Ty_ssize_t
_Ty_dict_lookup(PyDictObject *mp, TyObject *key, Ty_hash_t hash, TyObject **value_addr)
{
    PyDictKeysObject *dk;
    DictKeysKind kind;
    Ty_ssize_t ix;

    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(mp);
start:
    dk = mp->ma_keys;
    kind = dk->dk_kind;

    if (kind != DICT_KEYS_GENERAL) {
        if (TyUnicode_CheckExact(key)) {
#ifdef Ty_GIL_DISABLED
            if (kind == DICT_KEYS_SPLIT) {
                ix = unicodekeys_lookup_split(dk, key, hash);
            }
            else {
                ix = unicodekeys_lookup_unicode(dk, key, hash);
            }
#else
            ix = unicodekeys_lookup_unicode(dk, key, hash);
#endif
        }
        else {
            INCREF_KEYS_FT(dk);
            LOCK_KEYS_IF_SPLIT(dk, kind);

            ix = unicodekeys_lookup_generic(mp, dk, key, hash);

            UNLOCK_KEYS_IF_SPLIT(dk, kind);
            DECREF_KEYS_FT(dk, IS_DICT_SHARED(mp));
            if (ix == DKIX_KEY_CHANGED) {
                goto start;
            }
        }

        if (ix >= 0) {
            if (kind == DICT_KEYS_SPLIT) {
                *value_addr = mp->ma_values->values[ix];
            }
            else {
                *value_addr = DK_UNICODE_ENTRIES(dk)[ix].me_value;
            }
        }
        else {
            *value_addr = NULL;
        }
    }
    else {
        ix = dictkeys_generic_lookup(mp, dk, key, hash);
        if (ix == DKIX_KEY_CHANGED) {
            goto start;
        }
        if (ix >= 0) {
            *value_addr = DK_ENTRIES(dk)[ix].me_value;
        }
        else {
            *value_addr = NULL;
        }
    }

    return ix;
}

#ifdef Ty_GIL_DISABLED
static inline void
ensure_shared_on_read(PyDictObject *mp)
{
    if (!_Ty_IsOwnedByCurrentThread((TyObject *)mp) && !IS_DICT_SHARED(mp)) {
        // The first time we access a dict from a non-owning thread we mark it
        // as shared. This ensures that a concurrent resize operation will
        // delay freeing the old keys or values using QSBR, which is necessary
        // to safely allow concurrent reads without locking...
        Ty_BEGIN_CRITICAL_SECTION(mp);
        if (!IS_DICT_SHARED(mp)) {
            SET_DICT_SHARED(mp);
        }
        Ty_END_CRITICAL_SECTION();
    }
}

void
_TyDict_EnsureSharedOnRead(PyDictObject *mp)
{
    ensure_shared_on_read(mp);
}
#endif

static inline void
ensure_shared_on_resize(PyDictObject *mp)
{
#ifdef Ty_GIL_DISABLED
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(mp);

    if (!_Ty_IsOwnedByCurrentThread((TyObject *)mp) && !IS_DICT_SHARED(mp)) {
        // We are writing to the dict from another thread that owns
        // it and we haven't marked it as shared which will ensure
        // that when we re-size ma_keys or ma_values that we will
        // free using QSBR.  We need to lock the dictionary to
        // contend with writes from the owning thread, mark it as
        // shared, and then we can continue with lock-free reads.
        // Technically this is a little heavy handed, we could just
        // free the individual old keys / old-values using qsbr
        SET_DICT_SHARED(mp);
    }
#endif
}

static inline void
ensure_shared_on_keys_version_assignment(PyDictObject *mp)
{
    ASSERT_DICT_LOCKED((TyObject *) mp);
    #ifdef Ty_GIL_DISABLED
    if (!IS_DICT_SHARED(mp)) {
        // This ensures that a concurrent resize operation will delay
        // freeing the old keys or values using QSBR, which is necessary to
        // safely allow concurrent reads without locking.
        SET_DICT_SHARED(mp);
    }
    #endif
}

#ifdef Ty_GIL_DISABLED

static inline Ty_ALWAYS_INLINE int
compare_unicode_generic_threadsafe(PyDictObject *mp, PyDictKeysObject *dk,
                                   void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictUnicodeEntry *ep = &((PyDictUnicodeEntry *)ep0)[ix];
    TyObject *startkey = _Ty_atomic_load_ptr_relaxed(&ep->me_key);
    assert(startkey == NULL || TyUnicode_CheckExact(ep->me_key));
    assert(!TyUnicode_CheckExact(key));

    if (startkey != NULL) {
        if (!_Ty_TryIncrefCompare(&ep->me_key, startkey)) {
            return DKIX_KEY_CHANGED;
        }

        if (unicode_get_hash(startkey) == hash) {
            int cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
            Ty_DECREF(startkey);
            if (cmp < 0) {
                return DKIX_ERROR;
            }
            if (dk == _Ty_atomic_load_ptr_relaxed(&mp->ma_keys) &&
                startkey == _Ty_atomic_load_ptr_relaxed(&ep->me_key)) {
                return cmp;
            }
            else {
                /* The dict was mutated, restart */
                return DKIX_KEY_CHANGED;
            }
        }
        else {
            Ty_DECREF(startkey);
        }
    }
    return 0;
}

// Search non-Unicode key from Unicode table
static Ty_ssize_t
unicodekeys_lookup_generic_threadsafe(PyDictObject *mp, PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(mp, dk, key, hash, compare_unicode_generic_threadsafe);
}

static inline Ty_ALWAYS_INLINE int
compare_unicode_unicode_threadsafe(PyDictObject *mp, PyDictKeysObject *dk,
                                   void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictUnicodeEntry *ep = &((PyDictUnicodeEntry *)ep0)[ix];
    TyObject *startkey = _Ty_atomic_load_ptr_relaxed(&ep->me_key);
    if (startkey == key) {
        assert(TyUnicode_CheckExact(startkey));
        return 1;
    }
    if (startkey != NULL) {
        if (_Ty_IsImmortal(startkey)) {
            assert(TyUnicode_CheckExact(startkey));
            return unicode_get_hash(startkey) == hash && unicode_eq(startkey, key);
        }
        else {
            if (!_Ty_TryIncrefCompare(&ep->me_key, startkey)) {
                return DKIX_KEY_CHANGED;
            }
            assert(TyUnicode_CheckExact(startkey));
            if (unicode_get_hash(startkey) == hash && unicode_eq(startkey, key)) {
                Ty_DECREF(startkey);
                return 1;
            }
            Ty_DECREF(startkey);
        }
    }
    return 0;
}

static Ty_ssize_t _Ty_HOT_FUNCTION
unicodekeys_lookup_unicode_threadsafe(PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(NULL, dk, key, hash, compare_unicode_unicode_threadsafe);
}

static inline Ty_ALWAYS_INLINE int
compare_generic_threadsafe(PyDictObject *mp, PyDictKeysObject *dk,
                           void *ep0, Ty_ssize_t ix, TyObject *key, Ty_hash_t hash)
{
    PyDictKeyEntry *ep = &((PyDictKeyEntry *)ep0)[ix];
    TyObject *startkey = _Ty_atomic_load_ptr_relaxed(&ep->me_key);
    if (startkey == key) {
        return 1;
    }
    Ty_ssize_t ep_hash = _Ty_atomic_load_ssize_relaxed(&ep->me_hash);
    if (ep_hash == hash) {
        if (startkey == NULL || !_Ty_TryIncrefCompare(&ep->me_key, startkey)) {
            return DKIX_KEY_CHANGED;
        }
        int cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
        Ty_DECREF(startkey);
        if (cmp < 0) {
            return DKIX_ERROR;
        }
        if (dk == _Ty_atomic_load_ptr_relaxed(&mp->ma_keys) &&
            startkey == _Ty_atomic_load_ptr_relaxed(&ep->me_key)) {
            return cmp;
        }
        else {
            /* The dict was mutated, restart */
            return DKIX_KEY_CHANGED;
        }
    }
    return 0;
}

static Ty_ssize_t
dictkeys_generic_lookup_threadsafe(PyDictObject *mp, PyDictKeysObject* dk, TyObject *key, Ty_hash_t hash)
{
    return do_lookup(mp, dk, key, hash, compare_generic_threadsafe);
}

Ty_ssize_t
_Ty_dict_lookup_threadsafe(PyDictObject *mp, TyObject *key, Ty_hash_t hash, TyObject **value_addr)
{
    PyDictKeysObject *dk;
    DictKeysKind kind;
    Ty_ssize_t ix;
    TyObject *value;

    ensure_shared_on_read(mp);

    dk = _Ty_atomic_load_ptr(&mp->ma_keys);
    kind = dk->dk_kind;

    if (kind != DICT_KEYS_GENERAL) {
        if (TyUnicode_CheckExact(key)) {
            ix = unicodekeys_lookup_unicode_threadsafe(dk, key, hash);
        }
        else {
            ix = unicodekeys_lookup_generic_threadsafe(mp, dk, key, hash);
        }
        if (ix == DKIX_KEY_CHANGED) {
            goto read_failed;
        }

        if (ix >= 0) {
            if (kind == DICT_KEYS_SPLIT) {
                PyDictValues *values = _Ty_atomic_load_ptr(&mp->ma_values);
                if (values == NULL)
                    goto read_failed;

                uint8_t capacity = _Ty_atomic_load_uint8_relaxed(&values->capacity);
                if (ix >= (Ty_ssize_t)capacity)
                    goto read_failed;

                value = _Ty_TryXGetRef(&values->values[ix]);
                if (value == NULL)
                    goto read_failed;

                if (values != _Ty_atomic_load_ptr(&mp->ma_values)) {
                    Ty_DECREF(value);
                    goto read_failed;
                }
            }
            else {
                value = _Ty_TryXGetRef(&DK_UNICODE_ENTRIES(dk)[ix].me_value);
                if (value == NULL) {
                    goto read_failed;
                }

                if (dk != _Ty_atomic_load_ptr(&mp->ma_keys)) {
                    Ty_DECREF(value);
                    goto read_failed;
                }
            }
        }
        else {
            value = NULL;
        }
    }
    else {
        ix = dictkeys_generic_lookup_threadsafe(mp, dk, key, hash);
        if (ix == DKIX_KEY_CHANGED) {
            goto read_failed;
        }
        if (ix >= 0) {
            value = _Ty_TryXGetRef(&DK_ENTRIES(dk)[ix].me_value);
            if (value == NULL)
                goto read_failed;

            if (dk != _Ty_atomic_load_ptr(&mp->ma_keys)) {
                Ty_DECREF(value);
                goto read_failed;
            }
        }
        else {
            value = NULL;
        }
    }

    *value_addr = value;
    return ix;

read_failed:
    // In addition to the normal races of the dict being modified the _Ty_TryXGetRef
    // can all fail if they don't yet have a shared ref count.  That can happen here
    // or in the *_lookup_* helper.  In that case we need to take the lock to avoid
    // mutation and do a normal incref which will make them shared.
    Ty_BEGIN_CRITICAL_SECTION(mp);
    ix = _Ty_dict_lookup(mp, key, hash, &value);
    *value_addr = value;
    if (value != NULL) {
        assert(ix >= 0);
        _Ty_NewRefWithLock(value);
    }
    Ty_END_CRITICAL_SECTION();
    return ix;
}

Ty_ssize_t
_Ty_dict_lookup_threadsafe_stackref(PyDictObject *mp, TyObject *key, Ty_hash_t hash, _PyStackRef *value_addr)
{
    PyDictKeysObject *dk = _Ty_atomic_load_ptr(&mp->ma_keys);
    if (dk->dk_kind == DICT_KEYS_UNICODE && TyUnicode_CheckExact(key)) {
        Ty_ssize_t ix = unicodekeys_lookup_unicode_threadsafe(dk, key, hash);
        if (ix == DKIX_EMPTY) {
            *value_addr = PyStackRef_NULL;
            return ix;
        }
        else if (ix >= 0) {
            TyObject **addr_of_value = &DK_UNICODE_ENTRIES(dk)[ix].me_value;
            TyObject *value = _Ty_atomic_load_ptr(addr_of_value);
            if (value == NULL) {
                *value_addr = PyStackRef_NULL;
                return DKIX_EMPTY;
            }
            if (_TyObject_HasDeferredRefcount(value)) {
                *value_addr =  (_PyStackRef){ .bits = (uintptr_t)value | Ty_TAG_DEFERRED };
                return ix;
            }
            if (_Ty_TryIncrefCompare(addr_of_value, value)) {
                *value_addr = PyStackRef_FromPyObjectSteal(value);
                return ix;
            }
        }
    }

    TyObject *obj;
    Ty_ssize_t ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &obj);
    if (ix >= 0 && obj != NULL) {
        *value_addr = PyStackRef_FromPyObjectSteal(obj);
    }
    else {
        *value_addr = PyStackRef_NULL;
    }
    return ix;
}

#else   // Ty_GIL_DISABLED

Ty_ssize_t
_Ty_dict_lookup_threadsafe(PyDictObject *mp, TyObject *key, Ty_hash_t hash, TyObject **value_addr)
{
    Ty_ssize_t ix = _Ty_dict_lookup(mp, key, hash, value_addr);
    Ty_XNewRef(*value_addr);
    return ix;
}

Ty_ssize_t
_Ty_dict_lookup_threadsafe_stackref(PyDictObject *mp, TyObject *key, Ty_hash_t hash, _PyStackRef *value_addr)
{
    TyObject *val;
    Ty_ssize_t ix = _Ty_dict_lookup(mp, key, hash, &val);
    if (val == NULL) {
        *value_addr = PyStackRef_NULL;
    }
    else {
        *value_addr = PyStackRef_FromPyObjectNew(val);
    }
    return ix;
}

#endif

int
_TyDict_HasOnlyStringKeys(TyObject *dict)
{
    Ty_ssize_t pos = 0;
    TyObject *key, *value;
    assert(TyDict_Check(dict));
    /* Shortcut */
    if (((PyDictObject *)dict)->ma_keys->dk_kind != DICT_KEYS_GENERAL)
        return 1;
    while (TyDict_Next(dict, &pos, &key, &value))
        if (!TyUnicode_Check(key))
            return 0;
    return 1;
}

void
_TyDict_EnablePerThreadRefcounting(TyObject *op)
{
    assert(TyDict_Check(op));
#ifdef Ty_GIL_DISABLED
    Ty_ssize_t id = _TyObject_AssignUniqueId(op);
    if (id == _Ty_INVALID_UNIQUE_ID) {
        return;
    }
    if ((uint64_t)id >= (uint64_t)DICT_UNIQUE_ID_MAX) {
        _TyObject_ReleaseUniqueId(id);
        return;
    }

    PyDictObject *mp = (PyDictObject *)op;
    assert((mp->_ma_watcher_tag >> DICT_UNIQUE_ID_SHIFT) == 0);
    mp->_ma_watcher_tag += (uint64_t)id << DICT_UNIQUE_ID_SHIFT;
#endif
}

static inline int
is_unusable_slot(Ty_ssize_t ix)
{
#ifdef Ty_GIL_DISABLED
    return ix >= 0 || ix == DKIX_DUMMY;
#else
    return ix >= 0;
#endif
}

/* Internal function to find slot for an item from its hash
   when it is known that the key is not present in the dict.
 */
static Ty_ssize_t
find_empty_slot(PyDictKeysObject *keys, Ty_hash_t hash)
{
    assert(keys != NULL);

    const size_t mask = DK_MASK(keys);
    size_t i = hash & mask;
    Ty_ssize_t ix = dictkeys_get_index(keys, i);
    for (size_t perturb = hash; is_unusable_slot(ix);) {
        perturb >>= PERTURB_SHIFT;
        i = (i*5 + perturb + 1) & mask;
        ix = dictkeys_get_index(keys, i);
    }
    return i;
}

static int
insertion_resize(TyInterpreterState *interp, PyDictObject *mp, int unicode)
{
    return dictresize(interp, mp, calculate_log2_keysize(GROWTH_RATE(mp)), unicode);
}

static inline int
insert_combined_dict(TyInterpreterState *interp, PyDictObject *mp,
                     Ty_hash_t hash, TyObject *key, TyObject *value)
{
    if (mp->ma_keys->dk_usable <= 0) {
        /* Need to resize. */
        if (insertion_resize(interp, mp, 1) < 0) {
            return -1;
        }
    }

    _TyDict_NotifyEvent(interp, TyDict_EVENT_ADDED, mp, key, value);
    FT_ATOMIC_STORE_UINT32_RELAXED(mp->ma_keys->dk_version, 0);

    Ty_ssize_t hashpos = find_empty_slot(mp->ma_keys, hash);
    dictkeys_set_index(mp->ma_keys, hashpos, mp->ma_keys->dk_nentries);

    if (DK_IS_UNICODE(mp->ma_keys)) {
        PyDictUnicodeEntry *ep;
        ep = &DK_UNICODE_ENTRIES(mp->ma_keys)[mp->ma_keys->dk_nentries];
        STORE_KEY(ep, key);
        STORE_VALUE(ep, value);
    }
    else {
        PyDictKeyEntry *ep;
        ep = &DK_ENTRIES(mp->ma_keys)[mp->ma_keys->dk_nentries];
        STORE_KEY(ep, key);
        STORE_VALUE(ep, value);
        STORE_HASH(ep, hash);
    }
    STORE_KEYS_USABLE(mp->ma_keys, mp->ma_keys->dk_usable - 1);
    STORE_KEYS_NENTRIES(mp->ma_keys, mp->ma_keys->dk_nentries + 1);
    assert(mp->ma_keys->dk_usable >= 0);
    return 0;
}

static Ty_ssize_t
insert_split_key(PyDictKeysObject *keys, TyObject *key, Ty_hash_t hash)
{
    assert(TyUnicode_CheckExact(key));
    Ty_ssize_t ix;


#ifdef Ty_GIL_DISABLED
    ix = unicodekeys_lookup_unicode_threadsafe(keys, key, hash);
    if (ix >= 0) {
        return ix;
    }
#endif

    LOCK_KEYS(keys);
    ix = unicodekeys_lookup_unicode(keys, key, hash);
    if (ix == DKIX_EMPTY && keys->dk_usable > 0) {
        // Insert into new slot
        FT_ATOMIC_STORE_UINT32_RELAXED(keys->dk_version, 0);
        Ty_ssize_t hashpos = find_empty_slot(keys, hash);
        ix = keys->dk_nentries;
        dictkeys_set_index(keys, hashpos, ix);
        PyDictUnicodeEntry *ep = &DK_UNICODE_ENTRIES(keys)[ix];
        STORE_SHARED_KEY(ep->me_key, Ty_NewRef(key));
        split_keys_entry_added(keys);
    }
    assert (ix < SHARED_KEYS_MAX_SIZE);
    UNLOCK_KEYS(keys);
    return ix;
}

static void
insert_split_value(TyInterpreterState *interp, PyDictObject *mp, TyObject *key, TyObject *value, Ty_ssize_t ix)
{
    assert(TyUnicode_CheckExact(key));
    ASSERT_DICT_LOCKED(mp);
    TyObject *old_value = mp->ma_values->values[ix];
    if (old_value == NULL) {
        _TyDict_NotifyEvent(interp, TyDict_EVENT_ADDED, mp, key, value);
        STORE_SPLIT_VALUE(mp, ix, Ty_NewRef(value));
        _PyDictValues_AddToInsertionOrder(mp->ma_values, ix);
        STORE_USED(mp, mp->ma_used + 1);
    }
    else {
        _TyDict_NotifyEvent(interp, TyDict_EVENT_MODIFIED, mp, key, value);
        STORE_SPLIT_VALUE(mp, ix, Ty_NewRef(value));
        // old_value should be DECREFed after GC track checking is done, if not, it could raise a segmentation fault,
        // when dict only holds the strong reference to value in ep->me_value.
        Ty_DECREF(old_value);
    }
    ASSERT_CONSISTENT(mp);
}

/*
Internal routine to insert a new item into the table.
Used both by the internal resize routine and by the public insert routine.
Returns -1 if an error occurred, or 0 on success.
Consumes key and value references.
*/
static int
insertdict(TyInterpreterState *interp, PyDictObject *mp,
           TyObject *key, Ty_hash_t hash, TyObject *value)
{
    TyObject *old_value;

    ASSERT_DICT_LOCKED(mp);

    if (DK_IS_UNICODE(mp->ma_keys) && !TyUnicode_CheckExact(key)) {
        if (insertion_resize(interp, mp, 0) < 0)
            goto Fail;
        assert(mp->ma_keys->dk_kind == DICT_KEYS_GENERAL);
    }

    if (_TyDict_HasSplitTable(mp)) {
        Ty_ssize_t ix = insert_split_key(mp->ma_keys, key, hash);
        if (ix != DKIX_EMPTY) {
            insert_split_value(interp, mp, key, value, ix);
            Ty_DECREF(key);
            Ty_DECREF(value);
            return 0;
        }

        /* No space in shared keys. Resize and continue below. */
        if (insertion_resize(interp, mp, 1) < 0) {
            goto Fail;
        }
    }

    Ty_ssize_t ix = _Ty_dict_lookup(mp, key, hash, &old_value);
    if (ix == DKIX_ERROR)
        goto Fail;

    if (ix == DKIX_EMPTY) {
        assert(!_TyDict_HasSplitTable(mp));
        /* Insert into new slot. */
        assert(old_value == NULL);
        if (insert_combined_dict(interp, mp, hash, key, value) < 0) {
            goto Fail;
        }
        STORE_USED(mp, mp->ma_used + 1);
        ASSERT_CONSISTENT(mp);
        return 0;
    }

    if (old_value != value) {
        _TyDict_NotifyEvent(interp, TyDict_EVENT_MODIFIED, mp, key, value);
        assert(old_value != NULL);
        assert(!_TyDict_HasSplitTable(mp));
        if (DK_IS_UNICODE(mp->ma_keys)) {
            PyDictUnicodeEntry *ep = &DK_UNICODE_ENTRIES(mp->ma_keys)[ix];
            STORE_VALUE(ep, value);
        }
        else {
            PyDictKeyEntry *ep = &DK_ENTRIES(mp->ma_keys)[ix];
            STORE_VALUE(ep, value);
        }
    }
    Ty_XDECREF(old_value); /* which **CAN** re-enter (see issue #22653) */
    ASSERT_CONSISTENT(mp);
    Ty_DECREF(key);
    return 0;

Fail:
    Ty_DECREF(value);
    Ty_DECREF(key);
    return -1;
}

// Same as insertdict but specialized for ma_keys == Ty_EMPTY_KEYS.
// Consumes key and value references.
static int
insert_to_emptydict(TyInterpreterState *interp, PyDictObject *mp,
                    TyObject *key, Ty_hash_t hash, TyObject *value)
{
    assert(mp->ma_keys == Ty_EMPTY_KEYS);
    ASSERT_DICT_LOCKED(mp);

    int unicode = TyUnicode_CheckExact(key);
    PyDictKeysObject *newkeys = new_keys_object(
            interp, TyDict_LOG_MINSIZE, unicode);
    if (newkeys == NULL) {
        Ty_DECREF(key);
        Ty_DECREF(value);
        return -1;
    }
    _TyDict_NotifyEvent(interp, TyDict_EVENT_ADDED, mp, key, value);

    /* We don't decref Ty_EMPTY_KEYS here because it is immortal. */
    assert(mp->ma_values == NULL);

    size_t hashpos = (size_t)hash & (TyDict_MINSIZE-1);
    dictkeys_set_index(newkeys, hashpos, 0);
    if (unicode) {
        PyDictUnicodeEntry *ep = DK_UNICODE_ENTRIES(newkeys);
        ep->me_key = key;
        STORE_VALUE(ep, value);
    }
    else {
        PyDictKeyEntry *ep = DK_ENTRIES(newkeys);
        ep->me_key = key;
        ep->me_hash = hash;
        STORE_VALUE(ep, value);
    }
    STORE_USED(mp, mp->ma_used + 1);
    newkeys->dk_usable--;
    newkeys->dk_nentries++;
    // We store the keys last so no one can see them in a partially inconsistent
    // state so that we don't need to switch the keys to being shared yet for
    // the case where we're inserting from the non-owner thread.  We don't use
    // set_keys here because the transition from empty to non-empty is safe
    // as the empty keys will never be freed.
    FT_ATOMIC_STORE_PTR_RELEASE(mp->ma_keys, newkeys);
    return 0;
}

/*
Internal routine used by dictresize() to build a hashtable of entries.
*/
static void
build_indices_generic(PyDictKeysObject *keys, PyDictKeyEntry *ep, Ty_ssize_t n)
{
    size_t mask = DK_MASK(keys);
    for (Ty_ssize_t ix = 0; ix != n; ix++, ep++) {
        Ty_hash_t hash = ep->me_hash;
        size_t i = hash & mask;
        for (size_t perturb = hash; dictkeys_get_index(keys, i) != DKIX_EMPTY;) {
            perturb >>= PERTURB_SHIFT;
            i = mask & (i*5 + perturb + 1);
        }
        dictkeys_set_index(keys, i, ix);
    }
}

static void
build_indices_unicode(PyDictKeysObject *keys, PyDictUnicodeEntry *ep, Ty_ssize_t n)
{
    size_t mask = DK_MASK(keys);
    for (Ty_ssize_t ix = 0; ix != n; ix++, ep++) {
        Ty_hash_t hash = unicode_get_hash(ep->me_key);
        assert(hash != -1);
        size_t i = hash & mask;
        for (size_t perturb = hash; dictkeys_get_index(keys, i) != DKIX_EMPTY;) {
            perturb >>= PERTURB_SHIFT;
            i = mask & (i*5 + perturb + 1);
        }
        dictkeys_set_index(keys, i, ix);
    }
}

static void
invalidate_and_clear_inline_values(PyDictValues *values)
{
    assert(values->embedded);
    FT_ATOMIC_STORE_UINT8(values->valid, 0);
    for (int i = 0; i < values->capacity; i++) {
        FT_ATOMIC_STORE_PTR_RELEASE(values->values[i], NULL);
    }
}

/*
Restructure the table by allocating a new table and reinserting all
items again.  When entries have been deleted, the new table may
actually be smaller than the old one.
If a table is split (its keys and hashes are shared, its values are not),
then the values are temporarily copied into the table, it is resized as
a combined table, then the me_value slots in the old table are NULLed out.
After resizing, a table is always combined.

This function supports:
 - Unicode split -> Unicode combined or Generic
 - Unicode combined -> Unicode combined or Generic
 - Generic -> Generic
*/
static int
dictresize(TyInterpreterState *interp, PyDictObject *mp,
           uint8_t log2_newsize, int unicode)
{
    PyDictKeysObject *oldkeys, *newkeys;
    PyDictValues *oldvalues;

    ASSERT_DICT_LOCKED(mp);

    if (log2_newsize >= SIZEOF_SIZE_T*8) {
        TyErr_NoMemory();
        return -1;
    }
    assert(log2_newsize >= TyDict_LOG_MINSIZE);

    oldkeys = mp->ma_keys;
    oldvalues = mp->ma_values;

    if (!DK_IS_UNICODE(oldkeys)) {
        unicode = 0;
    }

    ensure_shared_on_resize(mp);
    /* NOTE: Current odict checks mp->ma_keys to detect resize happen.
     * So we can't reuse oldkeys even if oldkeys->dk_size == newsize.
     * TODO: Try reusing oldkeys when reimplement odict.
     */

    /* Allocate a new table. */
    newkeys = new_keys_object(interp, log2_newsize, unicode);
    if (newkeys == NULL) {
        return -1;
    }
    // New table must be large enough.
    assert(newkeys->dk_usable >= mp->ma_used);

    Ty_ssize_t numentries = mp->ma_used;

    if (oldvalues != NULL) {
        LOCK_KEYS(oldkeys);
        PyDictUnicodeEntry *oldentries = DK_UNICODE_ENTRIES(oldkeys);
        /* Convert split table into new combined table.
         * We must incref keys; we can transfer values.
         */
        if (newkeys->dk_kind == DICT_KEYS_GENERAL) {
            // split -> generic
            PyDictKeyEntry *newentries = DK_ENTRIES(newkeys);

            for (Ty_ssize_t i = 0; i < numentries; i++) {
                int index = get_index_from_order(mp, i);
                PyDictUnicodeEntry *ep = &oldentries[index];
                assert(oldvalues->values[index] != NULL);
                newentries[i].me_key = Ty_NewRef(ep->me_key);
                newentries[i].me_hash = unicode_get_hash(ep->me_key);
                newentries[i].me_value = oldvalues->values[index];
            }
            build_indices_generic(newkeys, newentries, numentries);
        }
        else { // split -> combined unicode
            PyDictUnicodeEntry *newentries = DK_UNICODE_ENTRIES(newkeys);

            for (Ty_ssize_t i = 0; i < numentries; i++) {
                int index = get_index_from_order(mp, i);
                PyDictUnicodeEntry *ep = &oldentries[index];
                assert(oldvalues->values[index] != NULL);
                newentries[i].me_key = Ty_NewRef(ep->me_key);
                newentries[i].me_value = oldvalues->values[index];
            }
            build_indices_unicode(newkeys, newentries, numentries);
        }
        UNLOCK_KEYS(oldkeys);
        set_keys(mp, newkeys);
        dictkeys_decref(interp, oldkeys, IS_DICT_SHARED(mp));
        set_values(mp, NULL);
        if (oldvalues->embedded) {
            assert(oldvalues->embedded == 1);
            assert(oldvalues->valid == 1);
            invalidate_and_clear_inline_values(oldvalues);
        }
        else {
            free_values(oldvalues, IS_DICT_SHARED(mp));
        }
    }
    else {  // oldkeys is combined.
        if (oldkeys->dk_kind == DICT_KEYS_GENERAL) {
            // generic -> generic
            assert(newkeys->dk_kind == DICT_KEYS_GENERAL);
            PyDictKeyEntry *oldentries = DK_ENTRIES(oldkeys);
            PyDictKeyEntry *newentries = DK_ENTRIES(newkeys);
            if (oldkeys->dk_nentries == numentries) {
                memcpy(newentries, oldentries, numentries * sizeof(PyDictKeyEntry));
            }
            else {
                PyDictKeyEntry *ep = oldentries;
                for (Ty_ssize_t i = 0; i < numentries; i++) {
                    while (ep->me_value == NULL)
                        ep++;
                    newentries[i] = *ep++;
                }
            }
            build_indices_generic(newkeys, newentries, numentries);
        }
        else {  // oldkeys is combined unicode
            PyDictUnicodeEntry *oldentries = DK_UNICODE_ENTRIES(oldkeys);
            if (unicode) { // combined unicode -> combined unicode
                PyDictUnicodeEntry *newentries = DK_UNICODE_ENTRIES(newkeys);
                if (oldkeys->dk_nentries == numentries && mp->ma_keys->dk_kind == DICT_KEYS_UNICODE) {
                    memcpy(newentries, oldentries, numentries * sizeof(PyDictUnicodeEntry));
                }
                else {
                    PyDictUnicodeEntry *ep = oldentries;
                    for (Ty_ssize_t i = 0; i < numentries; i++) {
                        while (ep->me_value == NULL)
                            ep++;
                        newentries[i] = *ep++;
                    }
                }
                build_indices_unicode(newkeys, newentries, numentries);
            }
            else { // combined unicode -> generic
                PyDictKeyEntry *newentries = DK_ENTRIES(newkeys);
                PyDictUnicodeEntry *ep = oldentries;
                for (Ty_ssize_t i = 0; i < numentries; i++) {
                    while (ep->me_value == NULL)
                        ep++;
                    newentries[i].me_key = ep->me_key;
                    newentries[i].me_hash = unicode_get_hash(ep->me_key);
                    newentries[i].me_value = ep->me_value;
                    ep++;
                }
                build_indices_generic(newkeys, newentries, numentries);
            }
        }

        set_keys(mp, newkeys);

        if (oldkeys != Ty_EMPTY_KEYS) {
#ifdef Ty_REF_DEBUG
            _Ty_DecRefTotal(_TyThreadState_GET());
#endif
            assert(oldkeys->dk_kind != DICT_KEYS_SPLIT);
            assert(oldkeys->dk_refcnt == 1);
            free_keys_object(oldkeys, IS_DICT_SHARED(mp));
        }
    }

    STORE_KEYS_USABLE(mp->ma_keys, mp->ma_keys->dk_usable - numentries);
    STORE_KEYS_NENTRIES(mp->ma_keys, numentries);
    ASSERT_CONSISTENT(mp);
    return 0;
}

static TyObject *
dict_new_presized(TyInterpreterState *interp, Ty_ssize_t minused, bool unicode)
{
    const uint8_t log2_max_presize = 17;
    const Ty_ssize_t max_presize = ((Ty_ssize_t)1) << log2_max_presize;
    uint8_t log2_newsize;
    PyDictKeysObject *new_keys;

    if (minused <= USABLE_FRACTION(TyDict_MINSIZE)) {
        return TyDict_New();
    }
    /* There are no strict guarantee that returned dict can contain minused
     * items without resize.  So we create medium size dict instead of very
     * large dict or MemoryError.
     */
    if (minused > USABLE_FRACTION(max_presize)) {
        log2_newsize = log2_max_presize;
    }
    else {
        log2_newsize = estimate_log2_keysize(minused);
    }

    new_keys = new_keys_object(interp, log2_newsize, unicode);
    if (new_keys == NULL)
        return NULL;
    return new_dict(interp, new_keys, NULL, 0, 0);
}

TyObject *
_TyDict_NewPresized(Ty_ssize_t minused)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return dict_new_presized(interp, minused, false);
}

TyObject *
_TyDict_FromItems(TyObject *const *keys, Ty_ssize_t keys_offset,
                  TyObject *const *values, Ty_ssize_t values_offset,
                  Ty_ssize_t length)
{
    bool unicode = true;
    TyObject *const *ks = keys;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    for (Ty_ssize_t i = 0; i < length; i++) {
        if (!TyUnicode_CheckExact(*ks)) {
            unicode = false;
            break;
        }
        ks += keys_offset;
    }

    TyObject *dict = dict_new_presized(interp, length, unicode);
    if (dict == NULL) {
        return NULL;
    }

    ks = keys;
    TyObject *const *vs = values;

    for (Ty_ssize_t i = 0; i < length; i++) {
        TyObject *key = *ks;
        TyObject *value = *vs;
        if (setitem_lock_held((PyDictObject *)dict, key, value) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        ks += keys_offset;
        vs += values_offset;
    }

    return dict;
}

/* Note that, for historical reasons, TyDict_GetItem() suppresses all errors
 * that may occur (originally dicts supported only string keys, and exceptions
 * weren't possible).  So, while the original intent was that a NULL return
 * meant the key wasn't present, in reality it can mean that, or that an error
 * (suppressed) occurred while computing the key's hash, or that some error
 * (suppressed) occurred when comparing keys in the dict's internal probe
 * sequence.  A nasty example of the latter is when a Python-coded comparison
 * function hits a stack-depth error, which can cause this to return NULL
 * even if the key is present.
 */
static TyObject *
dict_getitem(TyObject *op, TyObject *key, const char *warnmsg)
{
    if (!TyDict_Check(op)) {
        return NULL;
    }
    PyDictObject *mp = (PyDictObject *)op;

    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        TyErr_FormatUnraisable(warnmsg);
        return NULL;
    }

    TyThreadState *tstate = _TyThreadState_GET();
#ifdef Ty_DEBUG
    // bpo-40839: Before Python 3.10, it was possible to call TyDict_GetItem()
    // with the GIL released.
    _Ty_EnsureTstateNotNULL(tstate);
#endif

    /* Preserve the existing exception */
    TyObject *value;
    Ty_ssize_t ix; (void)ix;

    TyObject *exc = _TyErr_GetRaisedException(tstate);
#ifdef Ty_GIL_DISABLED
    ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &value);
    Ty_XDECREF(value);
#else
    ix = _Ty_dict_lookup(mp, key, hash, &value);
#endif

    /* Ignore any exception raised by the lookup */
    TyObject *exc2 = _TyErr_Occurred(tstate);
    if (exc2 && !TyErr_GivenExceptionMatches(exc2, TyExc_KeyError)) {
        TyErr_FormatUnraisable(warnmsg);
    }
    _TyErr_SetRaisedException(tstate, exc);

    assert(ix >= 0 || value == NULL);
    return value;  // borrowed reference
}

TyObject *
TyDict_GetItem(TyObject *op, TyObject *key)
{
    return dict_getitem(op, key,
            "Exception ignored in TyDict_GetItem(); consider using "
            "TyDict_GetItemRef() or TyDict_GetItemWithError()");
}

static void
dict_unhashable_type(TyObject *key)
{
    TyObject *exc = TyErr_GetRaisedException();
    assert(exc != NULL);
    if (!Ty_IS_TYPE(exc, (TyTypeObject*)TyExc_TypeError)) {
        TyErr_SetRaisedException(exc);
        return;
    }

    TyErr_Format(TyExc_TypeError,
                 "cannot use '%T' as a dict key (%S)",
                 key, exc);
    Ty_DECREF(exc);
}

Ty_ssize_t
_TyDict_LookupIndex(PyDictObject *mp, TyObject *key)
{
    // TODO: Thread safety
    TyObject *value;
    assert(TyDict_CheckExact((TyObject*)mp));
    assert(TyUnicode_CheckExact(key));

    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return -1;
    }

    return _Ty_dict_lookup(mp, key, hash, &value);
}

/* Same as TyDict_GetItemWithError() but with hash supplied by caller.
   This returns NULL *with* an exception set if an exception occurred.
   It returns NULL *without* an exception set if the key wasn't present.
*/
TyObject *
_TyDict_GetItem_KnownHash(TyObject *op, TyObject *key, Ty_hash_t hash)
{
    Ty_ssize_t ix; (void)ix;
    PyDictObject *mp = (PyDictObject *)op;
    TyObject *value;

    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }

#ifdef Ty_GIL_DISABLED
    ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &value);
    Ty_XDECREF(value);
#else
    ix = _Ty_dict_lookup(mp, key, hash, &value);
#endif
    assert(ix >= 0 || value == NULL);
    return value;  // borrowed reference
}

/* Gets an item and provides a new reference if the value is present.
 * Returns 1 if the key is present, 0 if the key is missing, and -1 if an
 * exception occurred.
*/
int
_TyDict_GetItemRef_KnownHash_LockHeld(PyDictObject *op, TyObject *key,
                                      Ty_hash_t hash, TyObject **result)
{
    TyObject *value;
    Ty_ssize_t ix = _Ty_dict_lookup(op, key, hash, &value);
    assert(ix >= 0 || value == NULL);
    if (ix == DKIX_ERROR) {
        *result = NULL;
        return -1;
    }
    if (value == NULL) {
        *result = NULL;
        return 0;  // missing key
    }
    *result = Ty_NewRef(value);
    return 1;  // key is present
}

/* Gets an item and provides a new reference if the value is present.
 * Returns 1 if the key is present, 0 if the key is missing, and -1 if an
 * exception occurred.
*/
int
_TyDict_GetItemRef_KnownHash(PyDictObject *op, TyObject *key, Ty_hash_t hash, TyObject **result)
{
    TyObject *value;
#ifdef Ty_GIL_DISABLED
    Ty_ssize_t ix = _Ty_dict_lookup_threadsafe(op, key, hash, &value);
#else
    Ty_ssize_t ix = _Ty_dict_lookup(op, key, hash, &value);
#endif
    assert(ix >= 0 || value == NULL);
    if (ix == DKIX_ERROR) {
        *result = NULL;
        return -1;
    }
    if (value == NULL) {
        *result = NULL;
        return 0;  // missing key
    }
#ifdef Ty_GIL_DISABLED
    *result = value;
#else
    *result = Ty_NewRef(value);
#endif
    return 1;  // key is present
}

int
TyDict_GetItemRef(TyObject *op, TyObject *key, TyObject **result)
{
    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        *result = NULL;
        return -1;
    }

    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        *result = NULL;
        return -1;
    }

    return _TyDict_GetItemRef_KnownHash((PyDictObject *)op, key, hash, result);
}

int
_TyDict_GetItemRef_Unicode_LockHeld(PyDictObject *op, TyObject *key, TyObject **result)
{
    ASSERT_DICT_LOCKED(op);
    assert(TyUnicode_CheckExact(key));

    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        *result = NULL;
        return -1;
    }

    TyObject *value;
    Ty_ssize_t ix = _Ty_dict_lookup(op, key, hash, &value);
    assert(ix >= 0 || value == NULL);
    if (ix == DKIX_ERROR) {
        *result = NULL;
        return -1;
    }
    if (value == NULL) {
        *result = NULL;
        return 0;  // missing key
    }
    *result = Ty_NewRef(value);
    return 1;  // key is present
}

/* Variant of TyDict_GetItem() that doesn't suppress exceptions.
   This returns NULL *with* an exception set if an exception occurred.
   It returns NULL *without* an exception set if the key wasn't present.
*/
TyObject *
TyDict_GetItemWithError(TyObject *op, TyObject *key)
{
    Ty_ssize_t ix; (void)ix;
    Ty_hash_t hash;
    PyDictObject*mp = (PyDictObject *)op;
    TyObject *value;

    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return NULL;
    }

#ifdef Ty_GIL_DISABLED
    ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &value);
    Ty_XDECREF(value);
#else
    ix = _Ty_dict_lookup(mp, key, hash, &value);
#endif
    assert(ix >= 0 || value == NULL);
    return value;  // borrowed reference
}

TyObject *
_TyDict_GetItemWithError(TyObject *dp, TyObject *kv)
{
    assert(TyUnicode_CheckExact(kv));
    Ty_hash_t hash = Ty_TYPE(kv)->tp_hash(kv);
    if (hash == -1) {
        return NULL;
    }
    return _TyDict_GetItem_KnownHash(dp, kv, hash);  // borrowed reference
}

TyObject *
_TyDict_GetItemIdWithError(TyObject *dp, _Ty_Identifier *key)
{
    TyObject *kv;
    kv = _TyUnicode_FromId(key); /* borrowed */
    if (kv == NULL)
        return NULL;
    Ty_hash_t hash = unicode_get_hash(kv);
    assert (hash != -1);  /* interned strings have their hash value initialised */
    return _TyDict_GetItem_KnownHash(dp, kv, hash);  // borrowed reference
}

TyObject *
_TyDict_GetItemStringWithError(TyObject *v, const char *key)
{
    TyObject *kv, *rv;
    kv = TyUnicode_FromString(key);
    if (kv == NULL) {
        return NULL;
    }
    rv = TyDict_GetItemWithError(v, kv);
    Ty_DECREF(kv);
    return rv;
}

/* Fast version of global value lookup (LOAD_GLOBAL).
 * Lookup in globals, then builtins.
 *
 *
 *
 *
 * Raise an exception and return NULL if an error occurred (ex: computing the
 * key hash failed, key comparison failed, ...). Return NULL if the key doesn't
 * exist. Return the value if the key exists.
 *
 * Returns a new reference.
 */
TyObject *
_TyDict_LoadGlobal(PyDictObject *globals, PyDictObject *builtins, TyObject *key)
{
    Ty_ssize_t ix;
    Ty_hash_t hash;
    TyObject *value;

    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        return NULL;
    }

    /* namespace 1: globals */
    ix = _Ty_dict_lookup_threadsafe(globals, key, hash, &value);
    if (ix == DKIX_ERROR)
        return NULL;
    if (ix != DKIX_EMPTY && value != NULL)
        return value;

    /* namespace 2: builtins */
    ix = _Ty_dict_lookup_threadsafe(builtins, key, hash, &value);
    assert(ix >= 0 || value == NULL);
    return value;
}

void
_TyDict_LoadGlobalStackRef(PyDictObject *globals, PyDictObject *builtins, TyObject *key, _PyStackRef *res)
{
    Ty_ssize_t ix;
    Ty_hash_t hash;

    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        *res = PyStackRef_NULL;
        return;
    }

    /* namespace 1: globals */
    ix = _Ty_dict_lookup_threadsafe_stackref(globals, key, hash, res);
    if (ix == DKIX_ERROR) {
        return;
    }
    if (ix != DKIX_EMPTY && !PyStackRef_IsNull(*res)) {
        return;
    }

    /* namespace 2: builtins */
    ix = _Ty_dict_lookup_threadsafe_stackref(builtins, key, hash, res);
    assert(ix >= 0 || PyStackRef_IsNull(*res));
}

TyObject *
_TyDict_LoadBuiltinsFromGlobals(TyObject *globals)
{
    if (!TyDict_Check(globals)) {
        TyErr_BadInternalCall();
        return NULL;
    }

    PyDictObject *mp = (PyDictObject *)globals;
    TyObject *key = &_Ty_ID(__builtins__);
    Ty_hash_t hash = unicode_get_hash(key);

    // Use the stackref variant to avoid reference count contention on the
    // builtins module in the free threading build. It's important not to
    // make any escaping calls between the lookup and the `PyStackRef_CLOSE()`
    // because the `ref` is not visible to the GC.
    _PyStackRef ref;
    Ty_ssize_t ix = _Ty_dict_lookup_threadsafe_stackref(mp, key, hash, &ref);
    if (ix == DKIX_ERROR) {
        return NULL;
    }
    if (PyStackRef_IsNull(ref)) {
        return Ty_NewRef(TyEval_GetBuiltins());
    }
    TyObject *builtins = PyStackRef_AsPyObjectBorrow(ref);
    if (TyModule_Check(builtins)) {
        builtins = _TyModule_GetDict(builtins);
        assert(builtins != NULL);
    }
    _Ty_INCREF_BUILTINS(builtins);
    PyStackRef_CLOSE(ref);
    return builtins;
}

/* Consumes references to key and value */
static int
setitem_take2_lock_held(PyDictObject *mp, TyObject *key, TyObject *value)
{
    ASSERT_DICT_LOCKED(mp);

    assert(key);
    assert(value);
    assert(TyDict_Check(mp));
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        Ty_DECREF(key);
        Ty_DECREF(value);
        return -1;
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();

    if (mp->ma_keys == Ty_EMPTY_KEYS) {
        return insert_to_emptydict(interp, mp, key, hash, value);
    }
    /* insertdict() handles any resizing that might be necessary */
    return insertdict(interp, mp, key, hash, value);
}

int
_TyDict_SetItem_Take2(PyDictObject *mp, TyObject *key, TyObject *value)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(mp);
    res = setitem_take2_lock_held(mp, key, value);
    Ty_END_CRITICAL_SECTION();
    return res;
}

/* CAUTION: TyDict_SetItem() must guarantee that it won't resize the
 * dictionary if it's merely replacing the value for an existing key.
 * This means that it's safe to loop over a dictionary with TyDict_Next()
 * and occasionally replace a value -- but you can't insert new keys or
 * remove them.
 */
int
TyDict_SetItem(TyObject *op, TyObject *key, TyObject *value)
{
    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    assert(key);
    assert(value);
    return _TyDict_SetItem_Take2((PyDictObject *)op,
                                 Ty_NewRef(key), Ty_NewRef(value));
}

static int
setitem_lock_held(PyDictObject *mp, TyObject *key, TyObject *value)
{
    assert(key);
    assert(value);
    return setitem_take2_lock_held(mp,
                                   Ty_NewRef(key), Ty_NewRef(value));
}


int
_TyDict_SetItem_KnownHash_LockHeld(PyDictObject *mp, TyObject *key, TyObject *value,
                                   Ty_hash_t hash)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (mp->ma_keys == Ty_EMPTY_KEYS) {
        return insert_to_emptydict(interp, mp, Ty_NewRef(key), hash, Ty_NewRef(value));
    }
    /* insertdict() handles any resizing that might be necessary */
    return insertdict(interp, mp, Ty_NewRef(key), hash, Ty_NewRef(value));
}

int
_TyDict_SetItem_KnownHash(TyObject *op, TyObject *key, TyObject *value,
                          Ty_hash_t hash)
{
    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    assert(key);
    assert(value);
    assert(hash != -1);

    int res;
    Ty_BEGIN_CRITICAL_SECTION(op);
    res = _TyDict_SetItem_KnownHash_LockHeld((PyDictObject *)op, key, value, hash);
    Ty_END_CRITICAL_SECTION();
    return res;
}

static void
delete_index_from_values(PyDictValues *values, Ty_ssize_t ix)
{
    uint8_t *array = get_insertion_order_array(values);
    int size = values->size;
    assert(size <= values->capacity);
    int i;
    for (i = 0; array[i] != ix; i++) {
        assert(i < size);
    }
    assert(i < size);
    size--;
    for (; i < size; i++) {
        array[i] = array[i+1];
    }
    values->size = size;
}

static void
delitem_common(PyDictObject *mp, Ty_hash_t hash, Ty_ssize_t ix,
               TyObject *old_value)
{
    TyObject *old_key;

    ASSERT_DICT_LOCKED(mp);

    Ty_ssize_t hashpos = lookdict_index(mp->ma_keys, hash, ix);
    assert(hashpos >= 0);

    STORE_USED(mp, mp->ma_used - 1);
    if (_TyDict_HasSplitTable(mp)) {
        assert(old_value == mp->ma_values->values[ix]);
        STORE_SPLIT_VALUE(mp, ix, NULL);
        assert(ix < SHARED_KEYS_MAX_SIZE);
        /* Update order */
        delete_index_from_values(mp->ma_values, ix);
        ASSERT_CONSISTENT(mp);
    }
    else {
        FT_ATOMIC_STORE_UINT32_RELAXED(mp->ma_keys->dk_version, 0);
        dictkeys_set_index(mp->ma_keys, hashpos, DKIX_DUMMY);
        if (DK_IS_UNICODE(mp->ma_keys)) {
            PyDictUnicodeEntry *ep = &DK_UNICODE_ENTRIES(mp->ma_keys)[ix];
            old_key = ep->me_key;
            STORE_KEY(ep, NULL);
            STORE_VALUE(ep, NULL);
        }
        else {
            PyDictKeyEntry *ep = &DK_ENTRIES(mp->ma_keys)[ix];
            old_key = ep->me_key;
            STORE_KEY(ep, NULL);
            STORE_VALUE(ep, NULL);
            STORE_HASH(ep, 0);
        }
        Ty_DECREF(old_key);
    }
    Ty_DECREF(old_value);

    ASSERT_CONSISTENT(mp);
}

int
TyDict_DelItem(TyObject *op, TyObject *key)
{
    assert(key);
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return -1;
    }

    return _TyDict_DelItem_KnownHash(op, key, hash);
}

static int
delitem_knownhash_lock_held(TyObject *op, TyObject *key, Ty_hash_t hash)
{
    Ty_ssize_t ix;
    PyDictObject *mp;
    TyObject *old_value;

    if (!TyDict_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }

    ASSERT_DICT_LOCKED(op);

    assert(key);
    assert(hash != -1);
    mp = (PyDictObject *)op;
    ix = _Ty_dict_lookup(mp, key, hash, &old_value);
    if (ix == DKIX_ERROR)
        return -1;
    if (ix == DKIX_EMPTY || old_value == NULL) {
        _TyErr_SetKeyError(key);
        return -1;
    }

    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyDict_NotifyEvent(interp, TyDict_EVENT_DELETED, mp, key, NULL);
    delitem_common(mp, hash, ix, old_value);
    return 0;
}

int
_TyDict_DelItem_KnownHash(TyObject *op, TyObject *key, Ty_hash_t hash)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(op);
    res = delitem_knownhash_lock_held(op, key, hash);
    Ty_END_CRITICAL_SECTION();
    return res;
}

static int
delitemif_lock_held(TyObject *op, TyObject *key,
                    int (*predicate)(TyObject *value, void *arg),
                    void *arg)
{
    Ty_ssize_t ix;
    PyDictObject *mp;
    Ty_hash_t hash;
    TyObject *old_value;
    int res;

    ASSERT_DICT_LOCKED(op);

    assert(key);
    hash = PyObject_Hash(key);
    if (hash == -1)
        return -1;
    mp = (PyDictObject *)op;
    ix = _Ty_dict_lookup(mp, key, hash, &old_value);
    if (ix == DKIX_ERROR) {
        return -1;
    }
    if (ix == DKIX_EMPTY || old_value == NULL) {
        return 0;
    }

    res = predicate(old_value, arg);
    if (res == -1)
        return -1;

    if (res > 0) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        _TyDict_NotifyEvent(interp, TyDict_EVENT_DELETED, mp, key, NULL);
        delitem_common(mp, hash, ix, old_value);
        return 1;
    } else {
        return 0;
    }
}
/* This function promises that the predicate -> deletion sequence is atomic
 * (i.e. protected by the GIL or the per-dict mutex in free threaded builds),
 * assuming the predicate itself doesn't release the GIL (or cause re-entrancy
 * which would release the per-dict mutex)
 */
int
_TyDict_DelItemIf(TyObject *op, TyObject *key,
                  int (*predicate)(TyObject *value, void *arg),
                  void *arg)
{
    assert(TyDict_Check(op));
    int res;
    Ty_BEGIN_CRITICAL_SECTION(op);
    res = delitemif_lock_held(op, key, predicate, arg);
    Ty_END_CRITICAL_SECTION();
    return res;
}

static void
clear_lock_held(TyObject *op)
{
    PyDictObject *mp;
    PyDictKeysObject *oldkeys;
    PyDictValues *oldvalues;
    Ty_ssize_t i, n;

    ASSERT_DICT_LOCKED(op);

    if (!TyDict_Check(op))
        return;
    mp = ((PyDictObject *)op);
    oldkeys = mp->ma_keys;
    oldvalues = mp->ma_values;
    if (oldkeys == Ty_EMPTY_KEYS) {
        return;
    }
    /* Empty the dict... */
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyDict_NotifyEvent(interp, TyDict_EVENT_CLEARED, mp, NULL, NULL);
    // We don't inc ref empty keys because they're immortal
    ensure_shared_on_resize(mp);
    STORE_USED(mp, 0);
    if (oldvalues == NULL) {
        set_keys(mp, Ty_EMPTY_KEYS);
        assert(oldkeys->dk_refcnt == 1);
        dictkeys_decref(interp, oldkeys, IS_DICT_SHARED(mp));
    }
    else {
        n = oldkeys->dk_nentries;
        for (i = 0; i < n; i++) {
            Ty_CLEAR(oldvalues->values[i]);
        }
        if (oldvalues->embedded) {
            oldvalues->size = 0;
        }
        else {
            set_values(mp, NULL);
            set_keys(mp, Ty_EMPTY_KEYS);
            free_values(oldvalues, IS_DICT_SHARED(mp));
            dictkeys_decref(interp, oldkeys, false);
        }
    }
    ASSERT_CONSISTENT(mp);
}

void
_TyDict_Clear_LockHeld(TyObject *op) {
    clear_lock_held(op);
}

void
TyDict_Clear(TyObject *op)
{
    Ty_BEGIN_CRITICAL_SECTION(op);
    clear_lock_held(op);
    Ty_END_CRITICAL_SECTION();
}

/* Internal version of TyDict_Next that returns a hash value in addition
 * to the key and value.
 * Return 1 on success, return 0 when the reached the end of the dictionary
 * (or if op is not a dictionary)
 */
int
_TyDict_Next(TyObject *op, Ty_ssize_t *ppos, TyObject **pkey,
             TyObject **pvalue, Ty_hash_t *phash)
{
    Ty_ssize_t i;
    PyDictObject *mp;
    TyObject *key, *value;
    Ty_hash_t hash;

    if (!TyDict_Check(op))
        return 0;

    mp = (PyDictObject *)op;
    i = *ppos;
    if (_TyDict_HasSplitTable(mp)) {
        assert(mp->ma_used <= SHARED_KEYS_MAX_SIZE);
        if (i < 0 || i >= mp->ma_used)
            return 0;
        int index = get_index_from_order(mp, i);
        value = mp->ma_values->values[index];
        key = LOAD_SHARED_KEY(DK_UNICODE_ENTRIES(mp->ma_keys)[index].me_key);
        hash = unicode_get_hash(key);
        assert(value != NULL);
    }
    else {
        Ty_ssize_t n = mp->ma_keys->dk_nentries;
        if (i < 0 || i >= n)
            return 0;
        if (DK_IS_UNICODE(mp->ma_keys)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(mp->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                return 0;
            key = entry_ptr->me_key;
            hash = unicode_get_hash(entry_ptr->me_key);
            value = entry_ptr->me_value;
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(mp->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                return 0;
            key = entry_ptr->me_key;
            hash = entry_ptr->me_hash;
            value = entry_ptr->me_value;
        }
    }
    *ppos = i+1;
    if (pkey)
        *pkey = key;
    if (pvalue)
        *pvalue = value;
    if (phash)
        *phash = hash;
    return 1;
}

/*
 * Iterate over a dict.  Use like so:
 *
 *     Ty_ssize_t i;
 *     TyObject *key, *value;
 *     i = 0;   # important!  i should not otherwise be changed by you
 *     while (TyDict_Next(yourdict, &i, &key, &value)) {
 *         Refer to borrowed references in key and value.
 *     }
 *
 * Return 1 on success, return 0 when the reached the end of the dictionary
 * (or if op is not a dictionary)
 *
 * CAUTION:  In general, it isn't safe to use TyDict_Next in a loop that
 * mutates the dict.  One exception:  it is safe if the loop merely changes
 * the values associated with the keys (but doesn't insert new keys or
 * delete keys), via TyDict_SetItem().
 */
int
TyDict_Next(TyObject *op, Ty_ssize_t *ppos, TyObject **pkey, TyObject **pvalue)
{
    return _TyDict_Next(op, ppos, pkey, pvalue, NULL);
}


/* Internal version of dict.pop(). */
int
_TyDict_Pop_KnownHash(PyDictObject *mp, TyObject *key, Ty_hash_t hash,
                      TyObject **result)
{
    assert(TyDict_Check(mp));

    ASSERT_DICT_LOCKED(mp);

    if (mp->ma_used == 0) {
        if (result) {
            *result = NULL;
        }
        return 0;
    }

    TyObject *old_value;
    Ty_ssize_t ix = _Ty_dict_lookup(mp, key, hash, &old_value);
    if (ix == DKIX_ERROR) {
        if (result) {
            *result = NULL;
        }
        return -1;
    }

    if (ix == DKIX_EMPTY || old_value == NULL) {
        if (result) {
            *result = NULL;
        }
        return 0;
    }

    assert(old_value != NULL);
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyDict_NotifyEvent(interp, TyDict_EVENT_DELETED, mp, key, NULL);
    delitem_common(mp, hash, ix, Ty_NewRef(old_value));

    ASSERT_CONSISTENT(mp);
    if (result) {
        *result = old_value;
    }
    else {
        Ty_DECREF(old_value);
    }
    return 1;
}

static int
pop_lock_held(TyObject *op, TyObject *key, TyObject **result)
{
    ASSERT_DICT_LOCKED(op);

    if (!TyDict_Check(op)) {
        if (result) {
            *result = NULL;
        }
        TyErr_BadInternalCall();
        return -1;
    }
    PyDictObject *dict = (PyDictObject *)op;

    if (dict->ma_used == 0) {
        if (result) {
            *result = NULL;
        }
        return 0;
    }

    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        if (result) {
            *result = NULL;
        }
        return -1;
    }
    return _TyDict_Pop_KnownHash(dict, key, hash, result);
}

int
TyDict_Pop(TyObject *op, TyObject *key, TyObject **result)
{
    int err;
    Ty_BEGIN_CRITICAL_SECTION(op);
    err = pop_lock_held(op, key, result);
    Ty_END_CRITICAL_SECTION();

    return err;
}


int
TyDict_PopString(TyObject *op, const char *key, TyObject **result)
{
    TyObject *key_obj = TyUnicode_FromString(key);
    if (key_obj == NULL) {
        if (result != NULL) {
            *result = NULL;
        }
        return -1;
    }

    int res = TyDict_Pop(op, key_obj, result);
    Ty_DECREF(key_obj);
    return res;
}


static TyObject *
dict_pop_default(TyObject *dict, TyObject *key, TyObject *default_value)
{
    TyObject *result;
    if (TyDict_Pop(dict, key, &result) == 0) {
        if (default_value != NULL) {
            return Ty_NewRef(default_value);
        }
        _TyErr_SetKeyError(key);
        return NULL;
    }
    return result;
}

TyObject *
_TyDict_Pop(TyObject *dict, TyObject *key, TyObject *default_value)
{
    return dict_pop_default(dict, key, default_value);
}

static PyDictObject *
dict_dict_fromkeys(TyInterpreterState *interp, PyDictObject *mp,
                   TyObject *iterable, TyObject *value)
{
    TyObject *oldvalue;
    Ty_ssize_t pos = 0;
    TyObject *key;
    Ty_hash_t hash;
    int unicode = DK_IS_UNICODE(((PyDictObject*)iterable)->ma_keys);
    uint8_t new_size = Ty_MAX(
        estimate_log2_keysize(TyDict_GET_SIZE(iterable)),
        DK_LOG_SIZE(mp->ma_keys));
    if (dictresize(interp, mp, new_size, unicode)) {
        Ty_DECREF(mp);
        return NULL;
    }

    while (_TyDict_Next(iterable, &pos, &key, &oldvalue, &hash)) {
        if (insertdict(interp, mp,
                        Ty_NewRef(key), hash, Ty_NewRef(value))) {
            Ty_DECREF(mp);
            return NULL;
        }
    }
    return mp;
}

static PyDictObject *
dict_set_fromkeys(TyInterpreterState *interp, PyDictObject *mp,
                  TyObject *iterable, TyObject *value)
{
    Ty_ssize_t pos = 0;
    TyObject *key;
    Ty_hash_t hash;
    uint8_t new_size = Ty_MAX(
        estimate_log2_keysize(TySet_GET_SIZE(iterable)),
        DK_LOG_SIZE(mp->ma_keys));
    if (dictresize(interp, mp, new_size, 0)) {
        Ty_DECREF(mp);
        return NULL;
    }

    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(iterable);
    while (_TySet_NextEntryRef(iterable, &pos, &key, &hash)) {
        if (insertdict(interp, mp, key, hash, Ty_NewRef(value))) {
            Ty_DECREF(mp);
            return NULL;
        }
    }
    return mp;
}

/* Internal version of dict.from_keys().  It is subclass-friendly. */
TyObject *
_TyDict_FromKeys(TyObject *cls, TyObject *iterable, TyObject *value)
{
    TyObject *it;       /* iter(iterable) */
    TyObject *key;
    TyObject *d;
    int status;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    d = _TyObject_CallNoArgs(cls);
    if (d == NULL)
        return NULL;


    if (TyDict_CheckExact(d)) {
        if (TyDict_CheckExact(iterable)) {
            PyDictObject *mp = (PyDictObject *)d;

            Ty_BEGIN_CRITICAL_SECTION2(d, iterable);
            d = (TyObject *)dict_dict_fromkeys(interp, mp, iterable, value);
            Ty_END_CRITICAL_SECTION2();
            return d;
        }
        else if (PyAnySet_CheckExact(iterable)) {
            PyDictObject *mp = (PyDictObject *)d;

            Ty_BEGIN_CRITICAL_SECTION2(d, iterable);
            d = (TyObject *)dict_set_fromkeys(interp, mp, iterable, value);
            Ty_END_CRITICAL_SECTION2();
            return d;
        }
    }

    it = PyObject_GetIter(iterable);
    if (it == NULL){
        Ty_DECREF(d);
        return NULL;
    }

    if (TyDict_CheckExact(d)) {
        Ty_BEGIN_CRITICAL_SECTION(d);
        while ((key = TyIter_Next(it)) != NULL) {
            status = setitem_lock_held((PyDictObject *)d, key, value);
            Ty_DECREF(key);
            if (status < 0) {
                assert(TyErr_Occurred());
                goto dict_iter_exit;
            }
        }
dict_iter_exit:;
        Ty_END_CRITICAL_SECTION();
    } else {
        while ((key = TyIter_Next(it)) != NULL) {
            status = PyObject_SetItem(d, key, value);
            Ty_DECREF(key);
            if (status < 0)
                goto Fail;
        }
    }

    if (TyErr_Occurred())
        goto Fail;
    Ty_DECREF(it);
    return d;

Fail:
    Ty_DECREF(it);
    Ty_DECREF(d);
    return NULL;
}

/* Methods */

static void
dict_dealloc(TyObject *self)
{
    PyDictObject *mp = (PyDictObject *)self;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyObject_ResurrectStart(self);
    _TyDict_NotifyEvent(interp, TyDict_EVENT_DEALLOCATED, mp, NULL, NULL);
    if (_TyObject_ResurrectEnd(self)) {
        return;
    }
    PyDictValues *values = mp->ma_values;
    PyDictKeysObject *keys = mp->ma_keys;
    Ty_ssize_t i, n;

    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(mp);
    if (values != NULL) {
        if (values->embedded == 0) {
            for (i = 0, n = values->capacity; i < n; i++) {
                Ty_XDECREF(values->values[i]);
            }
            free_values(values, false);
        }
        dictkeys_decref(interp, keys, false);
    }
    else if (keys != NULL) {
        assert(keys->dk_refcnt == 1 || keys == Ty_EMPTY_KEYS);
        dictkeys_decref(interp, keys, false);
    }
    if (Ty_IS_TYPE(mp, &TyDict_Type)) {
        _Ty_FREELIST_FREE(dicts, mp, Ty_TYPE(mp)->tp_free);
    }
    else {
        Ty_TYPE(mp)->tp_free((TyObject *)mp);
    }
}


static TyObject *
dict_repr_lock_held(TyObject *self)
{
    PyDictObject *mp = (PyDictObject *)self;
    TyObject *key = NULL, *value = NULL;
    ASSERT_DICT_LOCKED(mp);

    int res = Ty_ReprEnter((TyObject *)mp);
    if (res != 0) {
        return (res > 0 ? TyUnicode_FromString("{...}") : NULL);
    }

    if (mp->ma_used == 0) {
        Ty_ReprLeave((TyObject *)mp);
        return TyUnicode_FromString("{}");
    }

    // "{" + "1: 2" + ", 3: 4" * (len - 1) + "}"
    Ty_ssize_t prealloc = 1 + 4 + 6 * (mp->ma_used - 1) + 1;
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(prealloc);
    if (writer == NULL) {
        goto error;
    }

    if (PyUnicodeWriter_WriteChar(writer, '{') < 0) {
        goto error;
    }

    /* Do repr() on each key+value pair, and insert ": " between them.
       Note that repr may mutate the dict. */
    Ty_ssize_t i = 0;
    int first = 1;
    while (_TyDict_Next((TyObject *)mp, &i, &key, &value, NULL)) {
        // Prevent repr from deleting key or value during key format.
        Ty_INCREF(key);
        Ty_INCREF(value);

        if (!first) {
            // Write ", "
            if (PyUnicodeWriter_WriteChar(writer, ',') < 0) {
                goto error;
            }
            if (PyUnicodeWriter_WriteChar(writer, ' ') < 0) {
                goto error;
            }
        }
        first = 0;

        // Write repr(key)
        if (PyUnicodeWriter_WriteRepr(writer, key) < 0) {
            goto error;
        }

        // Write ": "
        if (PyUnicodeWriter_WriteChar(writer, ':') < 0) {
            goto error;
        }
        if (PyUnicodeWriter_WriteChar(writer, ' ') < 0) {
            goto error;
        }

        // Write repr(value)
        if (PyUnicodeWriter_WriteRepr(writer, value) < 0) {
            goto error;
        }

        Ty_CLEAR(key);
        Ty_CLEAR(value);
    }

    if (PyUnicodeWriter_WriteChar(writer, '}') < 0) {
        goto error;
    }

    Ty_ReprLeave((TyObject *)mp);

    return PyUnicodeWriter_Finish(writer);

error:
    Ty_ReprLeave((TyObject *)mp);
    PyUnicodeWriter_Discard(writer);
    Ty_XDECREF(key);
    Ty_XDECREF(value);
    return NULL;
}

static TyObject *
dict_repr(TyObject *self)
{
    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(self);
    res = dict_repr_lock_held(self);
    Ty_END_CRITICAL_SECTION();
    return res;
}

static Ty_ssize_t
dict_length(TyObject *self)
{
    return FT_ATOMIC_LOAD_SSIZE_RELAXED(((PyDictObject *)self)->ma_used);
}

static TyObject *
dict_subscript(TyObject *self, TyObject *key)
{
    PyDictObject *mp = (PyDictObject *)self;
    Ty_ssize_t ix;
    Ty_hash_t hash;
    TyObject *value;

    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return NULL;
    }
    ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &value);
    if (ix == DKIX_ERROR)
        return NULL;
    if (ix == DKIX_EMPTY || value == NULL) {
        if (!TyDict_CheckExact(mp)) {
            /* Look up __missing__ method if we're a subclass. */
            TyObject *missing, *res;
            missing = _TyObject_LookupSpecial(
                    (TyObject *)mp, &_Ty_ID(__missing__));
            if (missing != NULL) {
                res = PyObject_CallOneArg(missing, key);
                Ty_DECREF(missing);
                return res;
            }
            else if (TyErr_Occurred())
                return NULL;
        }
        _TyErr_SetKeyError(key);
        return NULL;
    }
    return value;
}

static int
dict_ass_sub(TyObject *mp, TyObject *v, TyObject *w)
{
    if (w == NULL)
        return TyDict_DelItem(mp, v);
    else
        return TyDict_SetItem(mp, v, w);
}

static PyMappingMethods dict_as_mapping = {
    dict_length, /*mp_length*/
    dict_subscript, /*mp_subscript*/
    dict_ass_sub, /*mp_ass_subscript*/
};

static TyObject *
keys_lock_held(TyObject *dict)
{
    ASSERT_DICT_LOCKED(dict);

    if (dict == NULL || !TyDict_Check(dict)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    PyDictObject *mp = (PyDictObject *)dict;
    TyObject *v;
    Ty_ssize_t n;

  again:
    n = mp->ma_used;
    v = TyList_New(n);
    if (v == NULL)
        return NULL;
    if (n != mp->ma_used) {
        /* Durnit.  The allocations caused the dict to resize.
         * Just start over, this shouldn't normally happen.
         */
        Ty_DECREF(v);
        goto again;
    }

    /* Nothing we do below makes any function calls. */
    Ty_ssize_t j = 0, pos = 0;
    TyObject *key;
    while (_TyDict_Next((TyObject*)mp, &pos, &key, NULL, NULL)) {
        assert(j < n);
        TyList_SET_ITEM(v, j, Ty_NewRef(key));
        j++;
    }
    assert(j == n);
    return v;
}

TyObject *
TyDict_Keys(TyObject *dict)
{
    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(dict);
    res = keys_lock_held(dict);
    Ty_END_CRITICAL_SECTION();

    return res;
}

static TyObject *
values_lock_held(TyObject *dict)
{
    ASSERT_DICT_LOCKED(dict);

    if (dict == NULL || !TyDict_Check(dict)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    PyDictObject *mp = (PyDictObject *)dict;
    TyObject *v;
    Ty_ssize_t n;

  again:
    n = mp->ma_used;
    v = TyList_New(n);
    if (v == NULL)
        return NULL;
    if (n != mp->ma_used) {
        /* Durnit.  The allocations caused the dict to resize.
         * Just start over, this shouldn't normally happen.
         */
        Ty_DECREF(v);
        goto again;
    }

    /* Nothing we do below makes any function calls. */
    Ty_ssize_t j = 0, pos = 0;
    TyObject *value;
    while (_TyDict_Next((TyObject*)mp, &pos, NULL, &value, NULL)) {
        assert(j < n);
        TyList_SET_ITEM(v, j, Ty_NewRef(value));
        j++;
    }
    assert(j == n);
    return v;
}

TyObject *
TyDict_Values(TyObject *dict)
{
    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(dict);
    res = values_lock_held(dict);
    Ty_END_CRITICAL_SECTION();
    return res;
}

static TyObject *
items_lock_held(TyObject *dict)
{
    ASSERT_DICT_LOCKED(dict);

    if (dict == NULL || !TyDict_Check(dict)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    PyDictObject *mp = (PyDictObject *)dict;
    TyObject *v;
    Ty_ssize_t i, n;
    TyObject *item;

    /* Preallocate the list of tuples, to avoid allocations during
     * the loop over the items, which could trigger GC, which
     * could resize the dict. :-(
     */
  again:
    n = mp->ma_used;
    v = TyList_New(n);
    if (v == NULL)
        return NULL;
    for (i = 0; i < n; i++) {
        item = TyTuple_New(2);
        if (item == NULL) {
            Ty_DECREF(v);
            return NULL;
        }
        TyList_SET_ITEM(v, i, item);
    }
    if (n != mp->ma_used) {
        /* Durnit.  The allocations caused the dict to resize.
         * Just start over, this shouldn't normally happen.
         */
        Ty_DECREF(v);
        goto again;
    }

    /* Nothing we do below makes any function calls. */
    Ty_ssize_t j = 0, pos = 0;
    TyObject *key, *value;
    while (_TyDict_Next((TyObject*)mp, &pos, &key, &value, NULL)) {
        assert(j < n);
        TyObject *item = TyList_GET_ITEM(v, j);
        TyTuple_SET_ITEM(item, 0, Ty_NewRef(key));
        TyTuple_SET_ITEM(item, 1, Ty_NewRef(value));
        j++;
    }
    assert(j == n);
    return v;
}

TyObject *
TyDict_Items(TyObject *dict)
{
    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(dict);
    res = items_lock_held(dict);
    Ty_END_CRITICAL_SECTION();

    return res;
}

/*[clinic input]
@classmethod
dict.fromkeys
    iterable: object
    value: object=None
    /

Create a new dictionary with keys from iterable and values set to value.
[clinic start generated code]*/

static TyObject *
dict_fromkeys_impl(TyTypeObject *type, TyObject *iterable, TyObject *value)
/*[clinic end generated code: output=8fb98e4b10384999 input=382ba4855d0f74c3]*/
{
    return _TyDict_FromKeys((TyObject *)type, iterable, value);
}

/* Single-arg dict update; used by dict_update_common and operators. */
static int
dict_update_arg(TyObject *self, TyObject *arg)
{
    if (TyDict_CheckExact(arg)) {
        return TyDict_Merge(self, arg, 1);
    }
    int has_keys = PyObject_HasAttrWithError(arg, &_Ty_ID(keys));
    if (has_keys < 0) {
        return -1;
    }
    if (has_keys) {
        return TyDict_Merge(self, arg, 1);
    }
    return TyDict_MergeFromSeq2(self, arg, 1);
}

static int
dict_update_common(TyObject *self, TyObject *args, TyObject *kwds,
                   const char *methname)
{
    TyObject *arg = NULL;
    int result = 0;

    if (!TyArg_UnpackTuple(args, methname, 0, 1, &arg)) {
        result = -1;
    }
    else if (arg != NULL) {
        result = dict_update_arg(self, arg);
    }

    if (result == 0 && kwds != NULL) {
        if (TyArg_ValidateKeywordArguments(kwds))
            result = TyDict_Merge(self, kwds, 1);
        else
            result = -1;
    }
    return result;
}

/* Note: dict.update() uses the METH_VARARGS|METH_KEYWORDS calling convention.
   Using METH_FASTCALL|METH_KEYWORDS would make dict.update(**dict2) calls
   slower, see the issue #29312. */
static TyObject *
dict_update(TyObject *self, TyObject *args, TyObject *kwds)
{
    if (dict_update_common(self, args, kwds, "update") != -1)
        Py_RETURN_NONE;
    return NULL;
}

/* Update unconditionally replaces existing items.
   Merge has a 3rd argument 'override'; if set, it acts like Update,
   otherwise it leaves existing items unchanged.

   TyDict_{Update,Merge} update/merge from a mapping object.

   TyDict_MergeFromSeq2 updates/merges from any iterable object
   producing iterable objects of length 2.
*/

static int
merge_from_seq2_lock_held(TyObject *d, TyObject *seq2, int override)
{
    TyObject *it;       /* iter(seq2) */
    Ty_ssize_t i;       /* index into seq2 of current element */
    TyObject *item;     /* seq2[i] */
    TyObject *fast;     /* item as a 2-tuple or 2-list */

    assert(d != NULL);
    assert(TyDict_Check(d));
    assert(seq2 != NULL);

    it = PyObject_GetIter(seq2);
    if (it == NULL)
        return -1;

    for (i = 0; ; ++i) {
        TyObject *key, *value;
        Ty_ssize_t n;

        fast = NULL;
        item = TyIter_Next(it);
        if (item == NULL) {
            if (TyErr_Occurred())
                goto Fail;
            break;
        }

        /* Convert item to sequence, and verify length 2. */
        fast = PySequence_Fast(item, "object is not iterable");
        if (fast == NULL) {
            if (TyErr_ExceptionMatches(TyExc_TypeError)) {
                _TyErr_FormatNote(
                    "Cannot convert dictionary update "
                    "sequence element #%zd to a sequence",
                    i);
            }
            goto Fail;
        }
        n = PySequence_Fast_GET_SIZE(fast);
        if (n != 2) {
            TyErr_Format(TyExc_ValueError,
                         "dictionary update sequence element #%zd "
                         "has length %zd; 2 is required",
                         i, n);
            goto Fail;
        }

        /* Update/merge with this (key, value) pair. */
        key = PySequence_Fast_GET_ITEM(fast, 0);
        value = PySequence_Fast_GET_ITEM(fast, 1);
        Ty_INCREF(key);
        Ty_INCREF(value);
        if (override) {
            if (setitem_lock_held((PyDictObject *)d, key, value) < 0) {
                Ty_DECREF(key);
                Ty_DECREF(value);
                goto Fail;
            }
        }
        else {
            if (dict_setdefault_ref_lock_held(d, key, value, NULL, 0) < 0) {
                Ty_DECREF(key);
                Ty_DECREF(value);
                goto Fail;
            }
        }

        Ty_DECREF(key);
        Ty_DECREF(value);
        Ty_DECREF(fast);
        Ty_DECREF(item);
    }

    i = 0;
    ASSERT_CONSISTENT(d);
    goto Return;
Fail:
    Ty_XDECREF(item);
    Ty_XDECREF(fast);
    i = -1;
Return:
    Ty_DECREF(it);
    return Ty_SAFE_DOWNCAST(i, Ty_ssize_t, int);
}

int
TyDict_MergeFromSeq2(TyObject *d, TyObject *seq2, int override)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(d);
    res = merge_from_seq2_lock_held(d, seq2, override);
    Ty_END_CRITICAL_SECTION();

    return res;
}

static int
dict_dict_merge(TyInterpreterState *interp, PyDictObject *mp, PyDictObject *other, int override)
{
    ASSERT_DICT_LOCKED(mp);
    ASSERT_DICT_LOCKED(other);

    if (other == mp || other->ma_used == 0)
        /* a.update(a) or a.update({}); nothing to do */
        return 0;
    if (mp->ma_used == 0) {
        /* Since the target dict is empty, TyDict_GetItem()
            * always returns NULL.  Setting override to 1
            * skips the unnecessary test.
            */
        override = 1;
        PyDictKeysObject *okeys = other->ma_keys;

        // If other is clean, combined, and just allocated, just clone it.
        if (mp->ma_values == NULL &&
            other->ma_values == NULL &&
            other->ma_used == okeys->dk_nentries &&
            (DK_LOG_SIZE(okeys) == TyDict_LOG_MINSIZE ||
             USABLE_FRACTION(DK_SIZE(okeys)/2) < other->ma_used)
        ) {
            _TyDict_NotifyEvent(interp, TyDict_EVENT_CLONED, mp, (TyObject *)other, NULL);
            PyDictKeysObject *keys = clone_combined_dict_keys(other);
            if (keys == NULL)
                return -1;

            ensure_shared_on_resize(mp);
            dictkeys_decref(interp, mp->ma_keys, IS_DICT_SHARED(mp));
            set_keys(mp, keys);
            STORE_USED(mp, other->ma_used);
            ASSERT_CONSISTENT(mp);

            if (_TyObject_GC_IS_TRACKED(other) && !_TyObject_GC_IS_TRACKED(mp)) {
                /* Maintain tracking. */
                _TyObject_GC_TRACK(mp);
            }

            return 0;
        }
    }
    /* Do one big resize at the start, rather than
        * incrementally resizing as we insert new items.  Expect
        * that there will be no (or few) overlapping keys.
        */
    if (USABLE_FRACTION(DK_SIZE(mp->ma_keys)) < other->ma_used) {
        int unicode = DK_IS_UNICODE(other->ma_keys);
        if (dictresize(interp, mp,
                        estimate_log2_keysize(mp->ma_used + other->ma_used),
                        unicode)) {
            return -1;
        }
    }

    Ty_ssize_t orig_size = other->ma_used;
    Ty_ssize_t pos = 0;
    Ty_hash_t hash;
    TyObject *key, *value;

    while (_TyDict_Next((TyObject*)other, &pos, &key, &value, &hash)) {
        int err = 0;
        Ty_INCREF(key);
        Ty_INCREF(value);
        if (override == 1) {
            err = insertdict(interp, mp,
                                Ty_NewRef(key), hash, Ty_NewRef(value));
        }
        else {
            err = _TyDict_Contains_KnownHash((TyObject *)mp, key, hash);
            if (err == 0) {
                err = insertdict(interp, mp,
                                    Ty_NewRef(key), hash, Ty_NewRef(value));
            }
            else if (err > 0) {
                if (override != 0) {
                    _TyErr_SetKeyError(key);
                    Ty_DECREF(value);
                    Ty_DECREF(key);
                    return -1;
                }
                err = 0;
            }
        }
        Ty_DECREF(value);
        Ty_DECREF(key);
        if (err != 0)
            return -1;

        if (orig_size != other->ma_used) {
            TyErr_SetString(TyExc_RuntimeError,
                    "dict mutated during update");
            return -1;
        }
    }
    return 0;
}

static int
dict_merge(TyInterpreterState *interp, TyObject *a, TyObject *b, int override)
{
    PyDictObject *mp, *other;

    assert(0 <= override && override <= 2);

    /* We accept for the argument either a concrete dictionary object,
     * or an abstract "mapping" object.  For the former, we can do
     * things quite efficiently.  For the latter, we only require that
     * PyMapping_Keys() and PyObject_GetItem() be supported.
     */
    if (a == NULL || !TyDict_Check(a) || b == NULL) {
        TyErr_BadInternalCall();
        return -1;
    }
    mp = (PyDictObject*)a;
    int res = 0;
    if (TyDict_Check(b) && (Ty_TYPE(b)->tp_iter == dict_iter)) {
        other = (PyDictObject*)b;
        int res;
        Ty_BEGIN_CRITICAL_SECTION2(a, b);
        res = dict_dict_merge(interp, (PyDictObject *)a, other, override);
        ASSERT_CONSISTENT(a);
        Ty_END_CRITICAL_SECTION2();
        return res;
    }
    else {
        /* Do it the generic, slower way */
        Ty_BEGIN_CRITICAL_SECTION(a);
        TyObject *keys = PyMapping_Keys(b);
        TyObject *iter;
        TyObject *key, *value;
        int status;

        if (keys == NULL) {
            /* Docstring says this is equivalent to E.keys() so
             * if E doesn't have a .keys() method we want
             * AttributeError to percolate up.  Might as well
             * do the same for any other error.
             */
            res = -1;
            goto slow_exit;
        }

        iter = PyObject_GetIter(keys);
        Ty_DECREF(keys);
        if (iter == NULL) {
            res = -1;
            goto slow_exit;
        }

        for (key = TyIter_Next(iter); key; key = TyIter_Next(iter)) {
            if (override != 1) {
                status = TyDict_Contains(a, key);
                if (status != 0) {
                    if (status > 0) {
                        if (override == 0) {
                            Ty_DECREF(key);
                            continue;
                        }
                        _TyErr_SetKeyError(key);
                    }
                    Ty_DECREF(key);
                    Ty_DECREF(iter);
                    res = -1;
                    goto slow_exit;
                }
            }
            value = PyObject_GetItem(b, key);
            if (value == NULL) {
                Ty_DECREF(iter);
                Ty_DECREF(key);
                res = -1;
                goto slow_exit;
            }
            status = setitem_lock_held(mp, key, value);
            Ty_DECREF(key);
            Ty_DECREF(value);
            if (status < 0) {
                Ty_DECREF(iter);
                res = -1;
                goto slow_exit;
                return -1;
            }
        }
        Ty_DECREF(iter);
        if (TyErr_Occurred()) {
            /* Iterator completed, via error */
            res = -1;
            goto slow_exit;
        }

slow_exit:
        ASSERT_CONSISTENT(a);
        Ty_END_CRITICAL_SECTION();
        return res;
    }
}

int
TyDict_Update(TyObject *a, TyObject *b)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return dict_merge(interp, a, b, 1);
}

int
TyDict_Merge(TyObject *a, TyObject *b, int override)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    /* XXX Deprecate override not in (0, 1). */
    return dict_merge(interp, a, b, override != 0);
}

int
_TyDict_MergeEx(TyObject *a, TyObject *b, int override)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return dict_merge(interp, a, b, override);
}

/*[clinic input]
dict.copy

Return a shallow copy of the dict.
[clinic start generated code]*/

static TyObject *
dict_copy_impl(PyDictObject *self)
/*[clinic end generated code: output=ffb782cf970a5c39 input=73935f042b639de4]*/
{
    return TyDict_Copy((TyObject *)self);
}

/* Copies the values, but does not change the reference
 * counts of the objects in the array.
 * Return NULL, but does *not* set an exception on failure  */
static PyDictValues *
copy_values(PyDictValues *values)
{
    PyDictValues *newvalues = new_values(values->capacity);
    if (newvalues == NULL) {
        return NULL;
    }
    newvalues->size = values->size;
    uint8_t *values_order = get_insertion_order_array(values);
    uint8_t *new_values_order = get_insertion_order_array(newvalues);
    memcpy(new_values_order, values_order, values->capacity);
    for (int i = 0; i < values->capacity; i++) {
        newvalues->values[i] = values->values[i];
    }
    assert(newvalues->embedded == 0);
    return newvalues;
}

static TyObject *
copy_lock_held(TyObject *o)
{
    TyObject *copy;
    PyDictObject *mp;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    ASSERT_DICT_LOCKED(o);

    mp = (PyDictObject *)o;
    if (mp->ma_used == 0) {
        /* The dict is empty; just return a new dict. */
        return TyDict_New();
    }

    if (_TyDict_HasSplitTable(mp)) {
        PyDictObject *split_copy;
        PyDictValues *newvalues = copy_values(mp->ma_values);
        if (newvalues == NULL) {
            return TyErr_NoMemory();
        }
        split_copy = PyObject_GC_New(PyDictObject, &TyDict_Type);
        if (split_copy == NULL) {
            free_values(newvalues, false);
            return NULL;
        }
        for (size_t i = 0; i < newvalues->capacity; i++) {
            Ty_XINCREF(newvalues->values[i]);
        }
        split_copy->ma_values = newvalues;
        split_copy->ma_keys = mp->ma_keys;
        split_copy->ma_used = mp->ma_used;
        split_copy->_ma_watcher_tag = 0;
        dictkeys_incref(mp->ma_keys);
        _TyObject_GC_TRACK(split_copy);
        return (TyObject *)split_copy;
    }

    if (Ty_TYPE(mp)->tp_iter == dict_iter &&
            mp->ma_values == NULL &&
            (mp->ma_used >= (mp->ma_keys->dk_nentries * 2) / 3))
    {
        /* Use fast-copy if:

           (1) type(mp) doesn't override tp_iter; and

           (2) 'mp' is not a split-dict; and

           (3) if 'mp' is non-compact ('del' operation does not resize dicts),
               do fast-copy only if it has at most 1/3 non-used keys.

           The last condition (3) is important to guard against a pathological
           case when a large dict is almost emptied with multiple del/pop
           operations and copied after that.  In cases like this, we defer to
           TyDict_Merge, which produces a compacted copy.
        */
        PyDictKeysObject *keys = clone_combined_dict_keys(mp);
        if (keys == NULL) {
            return NULL;
        }
        PyDictObject *new = (PyDictObject *)new_dict(interp, keys, NULL, 0, 0);
        if (new == NULL) {
            /* In case of an error, `new_dict()` takes care of
               cleaning up `keys`. */
            return NULL;
        }

        new->ma_used = mp->ma_used;
        ASSERT_CONSISTENT(new);
        return (TyObject *)new;
    }

    copy = TyDict_New();
    if (copy == NULL)
        return NULL;
    if (dict_merge(interp, copy, o, 1) == 0)
        return copy;
    Ty_DECREF(copy);
    return NULL;
}

TyObject *
TyDict_Copy(TyObject *o)
{
    if (o == NULL || !TyDict_Check(o)) {
        TyErr_BadInternalCall();
        return NULL;
    }

    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(o);

    res = copy_lock_held(o);

    Ty_END_CRITICAL_SECTION();
    return res;
}

Ty_ssize_t
TyDict_Size(TyObject *mp)
{
    if (mp == NULL || !TyDict_Check(mp)) {
        TyErr_BadInternalCall();
        return -1;
    }
    return FT_ATOMIC_LOAD_SSIZE_RELAXED(((PyDictObject *)mp)->ma_used);
}

/* Return 1 if dicts equal, 0 if not, -1 if error.
 * Gets out as soon as any difference is detected.
 * Uses only Py_EQ comparison.
 */
static int
dict_equal_lock_held(PyDictObject *a, PyDictObject *b)
{
    Ty_ssize_t i;

    ASSERT_DICT_LOCKED(a);
    ASSERT_DICT_LOCKED(b);

    if (a->ma_used != b->ma_used)
        /* can't be equal if # of entries differ */
        return 0;
    /* Same # of entries -- check all of 'em.  Exit early on any diff. */
    for (i = 0; i < LOAD_KEYS_NENTRIES(a->ma_keys); i++) {
        TyObject *key, *aval;
        Ty_hash_t hash;
        if (DK_IS_UNICODE(a->ma_keys)) {
            PyDictUnicodeEntry *ep = &DK_UNICODE_ENTRIES(a->ma_keys)[i];
            key = ep->me_key;
            if (key == NULL) {
                continue;
            }
            hash = unicode_get_hash(key);
            if (_TyDict_HasSplitTable(a))
                aval = a->ma_values->values[i];
            else
                aval = ep->me_value;
        }
        else {
            PyDictKeyEntry *ep = &DK_ENTRIES(a->ma_keys)[i];
            key = ep->me_key;
            aval = ep->me_value;
            hash = ep->me_hash;
        }
        if (aval != NULL) {
            int cmp;
            TyObject *bval;
            /* temporarily bump aval's refcount to ensure it stays
               alive until we're done with it */
            Ty_INCREF(aval);
            /* ditto for key */
            Ty_INCREF(key);
            /* reuse the known hash value */
            _Ty_dict_lookup(b, key, hash, &bval);
            if (bval == NULL) {
                Ty_DECREF(key);
                Ty_DECREF(aval);
                if (TyErr_Occurred())
                    return -1;
                return 0;
            }
            Ty_INCREF(bval);
            cmp = PyObject_RichCompareBool(aval, bval, Py_EQ);
            Ty_DECREF(key);
            Ty_DECREF(aval);
            Ty_DECREF(bval);
            if (cmp <= 0)  /* error or not equal */
                return cmp;
        }
    }
    return 1;
}

static int
dict_equal(PyDictObject *a, PyDictObject *b)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION2(a, b);
    res = dict_equal_lock_held(a, b);
    Ty_END_CRITICAL_SECTION2();

    return res;
}

static TyObject *
dict_richcompare(TyObject *v, TyObject *w, int op)
{
    int cmp;
    TyObject *res;

    if (!TyDict_Check(v) || !TyDict_Check(w)) {
        res = Ty_NotImplemented;
    }
    else if (op == Py_EQ || op == Py_NE) {
        cmp = dict_equal((PyDictObject *)v, (PyDictObject *)w);
        if (cmp < 0)
            return NULL;
        res = (cmp == (op == Py_EQ)) ? Ty_True : Ty_False;
    }
    else
        res = Ty_NotImplemented;
    return Ty_NewRef(res);
}

/*[clinic input]

@coexist
dict.__contains__

  key: object
  /

True if the dictionary has the specified key, else False.
[clinic start generated code]*/

static TyObject *
dict___contains___impl(PyDictObject *self, TyObject *key)
/*[clinic end generated code: output=1b314e6da7687dae input=fe1cb42ad831e820]*/
{
    int contains = TyDict_Contains((TyObject *)self, key);
    if (contains < 0) {
        return NULL;
    }
    if (contains) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

/*[clinic input]
dict.get

    key: object
    default: object = None
    /

Return the value for key if key is in the dictionary, else default.
[clinic start generated code]*/

static TyObject *
dict_get_impl(PyDictObject *self, TyObject *key, TyObject *default_value)
/*[clinic end generated code: output=bba707729dee05bf input=279ddb5790b6b107]*/
{
    TyObject *val = NULL;
    Ty_hash_t hash;
    Ty_ssize_t ix;

    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return NULL;
    }
    ix = _Ty_dict_lookup_threadsafe(self, key, hash, &val);
    if (ix == DKIX_ERROR)
        return NULL;
    if (ix == DKIX_EMPTY || val == NULL) {
        val = Ty_NewRef(default_value);
    }
    return val;
}

static int
dict_setdefault_ref_lock_held(TyObject *d, TyObject *key, TyObject *default_value,
                    TyObject **result, int incref_result)
{
    PyDictObject *mp = (PyDictObject *)d;
    TyObject *value;
    Ty_hash_t hash;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    ASSERT_DICT_LOCKED(d);

    if (!TyDict_Check(d)) {
        TyErr_BadInternalCall();
        if (result) {
            *result = NULL;
        }
        return -1;
    }

    hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        if (result) {
            *result = NULL;
        }
        return -1;
    }

    if (mp->ma_keys == Ty_EMPTY_KEYS) {
        if (insert_to_emptydict(interp, mp, Ty_NewRef(key), hash,
                                Ty_NewRef(default_value)) < 0) {
            if (result) {
                *result = NULL;
            }
            return -1;
        }
        if (result) {
            *result = incref_result ? Ty_NewRef(default_value) : default_value;
        }
        return 0;
    }

    if (!TyUnicode_CheckExact(key) && DK_IS_UNICODE(mp->ma_keys)) {
        if (insertion_resize(interp, mp, 0) < 0) {
            if (result) {
                *result = NULL;
            }
            return -1;
        }
    }

    if (_TyDict_HasSplitTable(mp)) {
        Ty_ssize_t ix = insert_split_key(mp->ma_keys, key, hash);
        if (ix != DKIX_EMPTY) {
            TyObject *value = mp->ma_values->values[ix];
            int already_present = value != NULL;
            if (!already_present) {
                insert_split_value(interp, mp, key, default_value, ix);
                value = default_value;
            }
            if (result) {
                *result = incref_result ? Ty_NewRef(value) : value;
            }
            return already_present;
        }

        /* No space in shared keys. Resize and continue below. */
        if (insertion_resize(interp, mp, 1) < 0) {
            goto error;
        }
    }

    assert(!_TyDict_HasSplitTable(mp));

    Ty_ssize_t ix = _Ty_dict_lookup(mp, key, hash, &value);
    if (ix == DKIX_ERROR) {
        if (result) {
            *result = NULL;
        }
        return -1;
    }

    if (ix == DKIX_EMPTY) {
        assert(!_TyDict_HasSplitTable(mp));
        value = default_value;

        if (insert_combined_dict(interp, mp, hash, Ty_NewRef(key), Ty_NewRef(value)) < 0) {
            Ty_DECREF(key);
            Ty_DECREF(value);
            if (result) {
                *result = NULL;
            }
            return -1;
        }

        STORE_USED(mp, mp->ma_used + 1);
        assert(mp->ma_keys->dk_usable >= 0);
        ASSERT_CONSISTENT(mp);
        if (result) {
            *result = incref_result ? Ty_NewRef(value) : value;
        }
        return 0;
    }

    assert(value != NULL);
    ASSERT_CONSISTENT(mp);
    if (result) {
        *result = incref_result ? Ty_NewRef(value) : value;
    }
    return 1;

error:
    if (result) {
        *result = NULL;
    }
    return -1;
}

int
TyDict_SetDefaultRef(TyObject *d, TyObject *key, TyObject *default_value,
                     TyObject **result)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(d);
    res = dict_setdefault_ref_lock_held(d, key, default_value, result, 1);
    Ty_END_CRITICAL_SECTION();
    return res;
}

TyObject *
TyDict_SetDefault(TyObject *d, TyObject *key, TyObject *defaultobj)
{
    TyObject *result;
    Ty_BEGIN_CRITICAL_SECTION(d);
    dict_setdefault_ref_lock_held(d, key, defaultobj, &result, 0);
    Ty_END_CRITICAL_SECTION();
    return result;
}

/*[clinic input]
@critical_section
dict.setdefault

    key: object
    default: object = None
    /

Insert key with a value of default if key is not in the dictionary.

Return the value for key if key is in the dictionary, else default.
[clinic start generated code]*/

static TyObject *
dict_setdefault_impl(PyDictObject *self, TyObject *key,
                     TyObject *default_value)
/*[clinic end generated code: output=f8c1101ebf69e220 input=9237af9a0a224302]*/
{
    TyObject *val;
    dict_setdefault_ref_lock_held((TyObject *)self, key, default_value, &val, 1);
    return val;
}


/*[clinic input]
dict.clear

Remove all items from the dict.
[clinic start generated code]*/

static TyObject *
dict_clear_impl(PyDictObject *self)
/*[clinic end generated code: output=5139a830df00830a input=0bf729baba97a4c2]*/
{
    TyDict_Clear((TyObject *)self);
    Py_RETURN_NONE;
}

/*[clinic input]
dict.pop

    key: object
    default: object = NULL
    /

D.pop(k[,d]) -> v, remove specified key and return the corresponding value.

If the key is not found, return the default if given; otherwise,
raise a KeyError.
[clinic start generated code]*/

static TyObject *
dict_pop_impl(PyDictObject *self, TyObject *key, TyObject *default_value)
/*[clinic end generated code: output=3abb47b89f24c21c input=e221baa01044c44c]*/
{
    return dict_pop_default((TyObject*)self, key, default_value);
}

/*[clinic input]
@critical_section
dict.popitem

Remove and return a (key, value) pair as a 2-tuple.

Pairs are returned in LIFO (last-in, first-out) order.
Raises KeyError if the dict is empty.
[clinic start generated code]*/

static TyObject *
dict_popitem_impl(PyDictObject *self)
/*[clinic end generated code: output=e65fcb04420d230d input=ef28b4da5f0f762e]*/
{
    Ty_ssize_t i, j;
    TyObject *res;
    TyInterpreterState *interp = _TyInterpreterState_GET();

    ASSERT_DICT_LOCKED(self);

    /* Allocate the result tuple before checking the size.  Believe it
     * or not, this allocation could trigger a garbage collection which
     * could empty the dict, so if we checked the size first and that
     * happened, the result would be an infinite loop (searching for an
     * entry that no longer exists).  Note that the usual popitem()
     * idiom is "while d: k, v = d.popitem()". so needing to throw the
     * tuple away if the dict *is* empty isn't a significant
     * inefficiency -- possible, but unlikely in practice.
     */
    res = TyTuple_New(2);
    if (res == NULL)
        return NULL;
    if (self->ma_used == 0) {
        Ty_DECREF(res);
        TyErr_SetString(TyExc_KeyError, "popitem(): dictionary is empty");
        return NULL;
    }
    /* Convert split table to combined table */
    if (_TyDict_HasSplitTable(self)) {
        if (dictresize(interp, self, DK_LOG_SIZE(self->ma_keys), 1) < 0) {
            Ty_DECREF(res);
            return NULL;
        }
    }
    FT_ATOMIC_STORE_UINT32_RELAXED(self->ma_keys->dk_version, 0);

    /* Pop last item */
    TyObject *key, *value;
    Ty_hash_t hash;
    if (DK_IS_UNICODE(self->ma_keys)) {
        PyDictUnicodeEntry *ep0 = DK_UNICODE_ENTRIES(self->ma_keys);
        i = self->ma_keys->dk_nentries - 1;
        while (i >= 0 && ep0[i].me_value == NULL) {
            i--;
        }
        assert(i >= 0);

        key = ep0[i].me_key;
        _TyDict_NotifyEvent(interp, TyDict_EVENT_DELETED, self, key, NULL);
        hash = unicode_get_hash(key);
        value = ep0[i].me_value;
        STORE_KEY(&ep0[i], NULL);
        STORE_VALUE(&ep0[i], NULL);
    }
    else {
        PyDictKeyEntry *ep0 = DK_ENTRIES(self->ma_keys);
        i = self->ma_keys->dk_nentries - 1;
        while (i >= 0 && ep0[i].me_value == NULL) {
            i--;
        }
        assert(i >= 0);

        key = ep0[i].me_key;
        _TyDict_NotifyEvent(interp, TyDict_EVENT_DELETED, self, key, NULL);
        hash = ep0[i].me_hash;
        value = ep0[i].me_value;
        STORE_KEY(&ep0[i], NULL);
        STORE_HASH(&ep0[i], -1);
        STORE_VALUE(&ep0[i], NULL);
    }

    j = lookdict_index(self->ma_keys, hash, i);
    assert(j >= 0);
    assert(dictkeys_get_index(self->ma_keys, j) == i);
    dictkeys_set_index(self->ma_keys, j, DKIX_DUMMY);

    TyTuple_SET_ITEM(res, 0, key);
    TyTuple_SET_ITEM(res, 1, value);
    /* We can't dk_usable++ since there is DKIX_DUMMY in indices */
    STORE_KEYS_NENTRIES(self->ma_keys, i);
    STORE_USED(self, self->ma_used - 1);
    ASSERT_CONSISTENT(self);
    return res;
}

static int
dict_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyDictObject *mp = (PyDictObject *)op;
    PyDictKeysObject *keys = mp->ma_keys;
    Ty_ssize_t i, n = keys->dk_nentries;

    if (DK_IS_UNICODE(keys)) {
        if (_TyDict_HasSplitTable(mp)) {
            if (!mp->ma_values->embedded) {
                for (i = 0; i < n; i++) {
                    Ty_VISIT(mp->ma_values->values[i]);
                }
            }
        }
        else {
            PyDictUnicodeEntry *entries = DK_UNICODE_ENTRIES(keys);
            for (i = 0; i < n; i++) {
                Ty_VISIT(entries[i].me_value);
            }
        }
    }
    else {
        PyDictKeyEntry *entries = DK_ENTRIES(keys);
        for (i = 0; i < n; i++) {
            if (entries[i].me_value != NULL) {
                Ty_VISIT(entries[i].me_value);
                Ty_VISIT(entries[i].me_key);
            }
        }
    }
    return 0;
}

static int
dict_tp_clear(TyObject *op)
{
    TyDict_Clear(op);
    return 0;
}

static TyObject *dictiter_new(PyDictObject *, TyTypeObject *);

static Ty_ssize_t
sizeof_lock_held(PyDictObject *mp)
{
    size_t res = _TyObject_SIZE(Ty_TYPE(mp));
    if (_TyDict_HasSplitTable(mp)) {
        res += shared_keys_usable_size(mp->ma_keys) * sizeof(TyObject*);
    }
    /* If the dictionary is split, the keys portion is accounted-for
       in the type object. */
    if (mp->ma_keys->dk_refcnt == 1) {
        res += _TyDict_KeysSize(mp->ma_keys);
    }
    assert(res <= (size_t)PY_SSIZE_T_MAX);
    return (Ty_ssize_t)res;
}

Ty_ssize_t
_TyDict_SizeOf(PyDictObject *mp)
{
    Ty_ssize_t res;
    Ty_BEGIN_CRITICAL_SECTION(mp);
    res = sizeof_lock_held(mp);
    Ty_END_CRITICAL_SECTION();

    return res;
}

size_t
_TyDict_KeysSize(PyDictKeysObject *keys)
{
    size_t es = (keys->dk_kind == DICT_KEYS_GENERAL
                 ? sizeof(PyDictKeyEntry) : sizeof(PyDictUnicodeEntry));
    size_t size = sizeof(PyDictKeysObject);
    size += (size_t)1 << keys->dk_log2_index_bytes;
    size += USABLE_FRACTION((size_t)DK_SIZE(keys)) * es;
    return size;
}

/*[clinic input]
dict.__sizeof__

Return the size of the dict in memory, in bytes.
[clinic start generated code]*/

static TyObject *
dict___sizeof___impl(PyDictObject *self)
/*[clinic end generated code: output=44279379b3824bda input=4fec4ddfc44a4d1a]*/
{
    return TyLong_FromSsize_t(_TyDict_SizeOf(self));
}

static TyObject *
dict_or(TyObject *self, TyObject *other)
{
    if (!TyDict_Check(self) || !TyDict_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    TyObject *new = TyDict_Copy(self);
    if (new == NULL) {
        return NULL;
    }
    if (dict_update_arg(new, other)) {
        Ty_DECREF(new);
        return NULL;
    }
    return new;
}

static TyObject *
dict_ior(TyObject *self, TyObject *other)
{
    if (dict_update_arg(self, other)) {
        return NULL;
    }
    return Ty_NewRef(self);
}

TyDoc_STRVAR(getitem__doc__,
"__getitem__($self, key, /)\n--\n\nReturn self[key].");

TyDoc_STRVAR(update__doc__,
"D.update([E, ]**F) -> None.  Update D from mapping/iterable E and F.\n\
If E is present and has a .keys() method, then does:  for k in E.keys(): D[k] = E[k]\n\
If E is present and lacks a .keys() method, then does:  for k, v in E: D[k] = v\n\
In either case, this is followed by: for k in F:  D[k] = F[k]");

/* Forward */

static TyMethodDef mapp_methods[] = {
    DICT___CONTAINS___METHODDEF
    {"__getitem__",     dict_subscript,                 METH_O | METH_COEXIST,
     getitem__doc__},
    DICT___SIZEOF___METHODDEF
    DICT_GET_METHODDEF
    DICT_SETDEFAULT_METHODDEF
    DICT_POP_METHODDEF
    DICT_POPITEM_METHODDEF
    DICT_KEYS_METHODDEF
    DICT_ITEMS_METHODDEF
    DICT_VALUES_METHODDEF
    {"update",          _PyCFunction_CAST(dict_update), METH_VARARGS | METH_KEYWORDS,
     update__doc__},
    DICT_FROMKEYS_METHODDEF
    DICT_CLEAR_METHODDEF
    DICT_COPY_METHODDEF
    DICT___REVERSED___METHODDEF
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {NULL,              NULL}   /* sentinel */
};

/* Return 1 if `key` is in dict `op`, 0 if not, and -1 on error. */
int
TyDict_Contains(TyObject *op, TyObject *key)
{
    Ty_hash_t hash = _TyObject_HashFast(key);
    if (hash == -1) {
        dict_unhashable_type(key);
        return -1;
    }

    return _TyDict_Contains_KnownHash(op, key, hash);
}

int
TyDict_ContainsString(TyObject *op, const char *key)
{
    TyObject *key_obj = TyUnicode_FromString(key);
    if (key_obj == NULL) {
        return -1;
    }
    int res = TyDict_Contains(op, key_obj);
    Ty_DECREF(key_obj);
    return res;
}

/* Internal version of TyDict_Contains used when the hash value is already known */
int
_TyDict_Contains_KnownHash(TyObject *op, TyObject *key, Ty_hash_t hash)
{
    PyDictObject *mp = (PyDictObject *)op;
    TyObject *value;
    Ty_ssize_t ix;

#ifdef Ty_GIL_DISABLED
    ix = _Ty_dict_lookup_threadsafe(mp, key, hash, &value);
#else
    ix = _Ty_dict_lookup(mp, key, hash, &value);
#endif
    if (ix == DKIX_ERROR)
        return -1;
    if (ix != DKIX_EMPTY && value != NULL) {
#ifdef Ty_GIL_DISABLED
        Ty_DECREF(value);
#endif
        return 1;
    }
    return 0;
}

int
_TyDict_ContainsId(TyObject *op, _Ty_Identifier *key)
{
    TyObject *kv = _TyUnicode_FromId(key); /* borrowed */
    if (kv == NULL) {
        return -1;
    }
    return TyDict_Contains(op, kv);
}

/* Hack to implement "key in dict" */
static PySequenceMethods dict_as_sequence = {
    0,                          /* sq_length */
    0,                          /* sq_concat */
    0,                          /* sq_repeat */
    0,                          /* sq_item */
    0,                          /* sq_slice */
    0,                          /* sq_ass_item */
    0,                          /* sq_ass_slice */
    TyDict_Contains,            /* sq_contains */
    0,                          /* sq_inplace_concat */
    0,                          /* sq_inplace_repeat */
};

static TyNumberMethods dict_as_number = {
    .nb_or = dict_or,
    .nb_inplace_or = dict_ior,
};

static TyObject *
dict_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    assert(type != NULL);
    assert(type->tp_alloc != NULL);
    // dict subclasses must implement the GC protocol
    assert(_TyType_IS_GC(type));

    TyObject *self = type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    PyDictObject *d = (PyDictObject *)self;

    d->ma_used = 0;
    d->_ma_watcher_tag = 0;
    // We don't inc ref empty keys because they're immortal
    assert((Ty_EMPTY_KEYS)->dk_refcnt == _Ty_DICT_IMMORTAL_INITIAL_REFCNT);
    d->ma_keys = Ty_EMPTY_KEYS;
    d->ma_values = NULL;
    ASSERT_CONSISTENT(d);
    if (!_TyObject_GC_IS_TRACKED(d)) {
        _TyObject_GC_TRACK(d);
    }
    return self;
}

static int
dict_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    return dict_update_common(self, args, kwds, "dict");
}

static TyObject *
dict_vectorcall(TyObject *type, TyObject * const*args,
                size_t nargsf, TyObject *kwnames)
{
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("dict", nargs, 0, 1)) {
        return NULL;
    }

    TyObject *self = dict_new(_TyType_CAST(type), NULL, NULL);
    if (self == NULL) {
        return NULL;
    }
    if (nargs == 1) {
        if (dict_update_arg(self, args[0]) < 0) {
            Ty_DECREF(self);
            return NULL;
        }
        args++;
    }
    if (kwnames != NULL) {
        for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(kwnames); i++) {
            if (TyDict_SetItem(self, TyTuple_GET_ITEM(kwnames, i), args[i]) < 0) {
                Ty_DECREF(self);
                return NULL;
            }
        }
    }
    return self;
}

static TyObject *
dict_iter(TyObject *self)
{
    PyDictObject *dict = (PyDictObject *)self;
    return dictiter_new(dict, &PyDictIterKey_Type);
}

TyDoc_STRVAR(dictionary_doc,
"dict() -> new empty dictionary\n"
"dict(mapping) -> new dictionary initialized from a mapping object's\n"
"    (key, value) pairs\n"
"dict(iterable) -> new dictionary initialized as if via:\n"
"    d = {}\n"
"    for k, v in iterable:\n"
"        d[k] = v\n"
"dict(**kwargs) -> new dictionary initialized with the name=value pairs\n"
"    in the keyword argument list.  For example:  dict(one=1, two=2)");

TyTypeObject TyDict_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict",
    sizeof(PyDictObject),
    0,
    dict_dealloc,                               /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    dict_repr,                                  /* tp_repr */
    &dict_as_number,                            /* tp_as_number */
    &dict_as_sequence,                          /* tp_as_sequence */
    &dict_as_mapping,                           /* tp_as_mapping */
    PyObject_HashNotImplemented,                /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_DICT_SUBCLASS |
        _Ty_TPFLAGS_MATCH_SELF | Ty_TPFLAGS_MAPPING,  /* tp_flags */
    dictionary_doc,                             /* tp_doc */
    dict_traverse,                              /* tp_traverse */
    dict_tp_clear,                              /* tp_clear */
    dict_richcompare,                           /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    dict_iter,                                  /* tp_iter */
    0,                                          /* tp_iternext */
    mapp_methods,                               /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    dict_init,                                  /* tp_init */
    _TyType_AllocNoTrack,                       /* tp_alloc */
    dict_new,                                   /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
    .tp_vectorcall = dict_vectorcall,
    .tp_version_tag = _Ty_TYPE_VERSION_DICT,
};

/* For backward compatibility with old dictionary interface */

TyObject *
TyDict_GetItemString(TyObject *v, const char *key)
{
    TyObject *kv, *rv;
    kv = TyUnicode_FromString(key);
    if (kv == NULL) {
        TyErr_FormatUnraisable(
            "Exception ignored in TyDict_GetItemString(); consider using "
            "TyDict_GetItemStringRef()");
        return NULL;
    }
    rv = dict_getitem(v, kv,
            "Exception ignored in TyDict_GetItemString(); consider using "
            "TyDict_GetItemStringRef()");
    Ty_DECREF(kv);
    return rv;  // borrowed reference
}

int
TyDict_GetItemStringRef(TyObject *v, const char *key, TyObject **result)
{
    TyObject *key_obj = TyUnicode_FromString(key);
    if (key_obj == NULL) {
        *result = NULL;
        return -1;
    }
    int res = TyDict_GetItemRef(v, key_obj, result);
    Ty_DECREF(key_obj);
    return res;
}

int
_TyDict_SetItemId(TyObject *v, _Ty_Identifier *key, TyObject *item)
{
    TyObject *kv;
    kv = _TyUnicode_FromId(key); /* borrowed */
    if (kv == NULL)
        return -1;
    return TyDict_SetItem(v, kv, item);
}

int
TyDict_SetItemString(TyObject *v, const char *key, TyObject *item)
{
    TyObject *kv;
    int err;
    kv = TyUnicode_FromString(key);
    if (kv == NULL)
        return -1;
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyUnicode_InternImmortal(interp, &kv); /* XXX Should we really? */
    err = TyDict_SetItem(v, kv, item);
    Ty_DECREF(kv);
    return err;
}

int
_TyDict_DelItemId(TyObject *v, _Ty_Identifier *key)
{
    TyObject *kv = _TyUnicode_FromId(key); /* borrowed */
    if (kv == NULL)
        return -1;
    return TyDict_DelItem(v, kv);
}

int
TyDict_DelItemString(TyObject *v, const char *key)
{
    TyObject *kv;
    int err;
    kv = TyUnicode_FromString(key);
    if (kv == NULL)
        return -1;
    err = TyDict_DelItem(v, kv);
    Ty_DECREF(kv);
    return err;
}

/* Dictionary iterator types */

typedef struct {
    PyObject_HEAD
    PyDictObject *di_dict; /* Set to NULL when iterator is exhausted */
    Ty_ssize_t di_used;
    Ty_ssize_t di_pos;
    TyObject* di_result; /* reusable result tuple for iteritems */
    Ty_ssize_t len;
} dictiterobject;

static TyObject *
dictiter_new(PyDictObject *dict, TyTypeObject *itertype)
{
    Ty_ssize_t used;
    dictiterobject *di;
    di = PyObject_GC_New(dictiterobject, itertype);
    if (di == NULL) {
        return NULL;
    }
    di->di_dict = (PyDictObject*)Ty_NewRef(dict);
    used = FT_ATOMIC_LOAD_SSIZE_RELAXED(dict->ma_used);
    di->di_used = used;
    di->len = used;
    if (itertype == &PyDictRevIterKey_Type ||
         itertype == &PyDictRevIterItem_Type ||
         itertype == &PyDictRevIterValue_Type) {
        if (_TyDict_HasSplitTable(dict)) {
            di->di_pos = used - 1;
        }
        else {
            di->di_pos = load_keys_nentries(dict) - 1;
        }
    }
    else {
        di->di_pos = 0;
    }
    if (itertype == &PyDictIterItem_Type ||
        itertype == &PyDictRevIterItem_Type) {
        di->di_result = TyTuple_Pack(2, Ty_None, Ty_None);
        if (di->di_result == NULL) {
            Ty_DECREF(di);
            return NULL;
        }
    }
    else {
        di->di_result = NULL;
    }
    _TyObject_GC_TRACK(di);
    return (TyObject *)di;
}

static void
dictiter_dealloc(TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    _TyObject_GC_UNTRACK(di);
    Ty_XDECREF(di->di_dict);
    Ty_XDECREF(di->di_result);
    PyObject_GC_Del(di);
}

static int
dictiter_traverse(TyObject *self, visitproc visit, void *arg)
{
    dictiterobject *di = (dictiterobject *)self;
    Ty_VISIT(di->di_dict);
    Ty_VISIT(di->di_result);
    return 0;
}

static TyObject *
dictiter_len(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    dictiterobject *di = (dictiterobject *)self;
    Ty_ssize_t len = 0;
    if (di->di_dict != NULL && di->di_used == FT_ATOMIC_LOAD_SSIZE_RELAXED(di->di_dict->ma_used))
        len = FT_ATOMIC_LOAD_SSIZE_RELAXED(di->len);
    return TyLong_FromSize_t(len);
}

TyDoc_STRVAR(length_hint_doc,
             "Private method returning an estimate of len(list(it)).");

static TyObject *
dictiter_reduce(TyObject *di, TyObject *Py_UNUSED(ignored));

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyMethodDef dictiter_methods[] = {
    {"__length_hint__", dictiter_len,                   METH_NOARGS,
     length_hint_doc},
     {"__reduce__",     dictiter_reduce,                METH_NOARGS,
     reduce_doc},
    {NULL,              NULL}           /* sentinel */
};

#ifdef Ty_GIL_DISABLED

static int
dictiter_iternext_threadsafe(PyDictObject *d, TyObject *self,
                             TyObject **out_key, TyObject **out_value);

#else /* Ty_GIL_DISABLED */

static TyObject*
dictiter_iternextkey_lock_held(PyDictObject *d, TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    TyObject *key;
    Ty_ssize_t i;
    PyDictKeysObject *k;

    assert (TyDict_Check(d));
    ASSERT_DICT_LOCKED(d);

    if (di->di_used != d->ma_used) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary changed size during iteration");
        di->di_used = -1; /* Make this state sticky */
        return NULL;
    }

    i = di->di_pos;
    k = d->ma_keys;
    assert(i >= 0);
    if (_TyDict_HasSplitTable(d)) {
        if (i >= d->ma_used)
            goto fail;
        int index = get_index_from_order(d, i);
        key = LOAD_SHARED_KEY(DK_UNICODE_ENTRIES(k)[index].me_key);
        assert(d->ma_values->values[index] != NULL);
    }
    else {
        Ty_ssize_t n = k->dk_nentries;
        if (DK_IS_UNICODE(k)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(k)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            key = entry_ptr->me_key;
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(k)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            key = entry_ptr->me_key;
        }
    }
    // We found an element (key), but did not expect it
    if (di->len == 0) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary keys changed during iteration");
        goto fail;
    }
    di->di_pos = i+1;
    di->len--;
    return Ty_NewRef(key);

fail:
    di->di_dict = NULL;
    Ty_DECREF(d);
    return NULL;
}

#endif  /* Ty_GIL_DISABLED */

static TyObject*
dictiter_iternextkey(TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    PyDictObject *d = di->di_dict;

    if (d == NULL)
        return NULL;

    TyObject *value;
#ifdef Ty_GIL_DISABLED
    if (dictiter_iternext_threadsafe(d, self, &value, NULL) < 0) {
        value = NULL;
    }
#else
    value = dictiter_iternextkey_lock_held(d, self);
#endif

    return value;
}

TyTypeObject PyDictIterKey_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_keyiterator",                         /* tp_name */
    sizeof(dictiterobject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictiter_dealloc,                           /* tp_dealloc */
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
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    dictiter_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    dictiter_iternextkey,                       /* tp_iternext */
    dictiter_methods,                           /* tp_methods */
    0,
};

#ifndef Ty_GIL_DISABLED

static TyObject *
dictiter_iternextvalue_lock_held(PyDictObject *d, TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    TyObject *value;
    Ty_ssize_t i;

    assert (TyDict_Check(d));
    ASSERT_DICT_LOCKED(d);

    if (di->di_used != d->ma_used) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary changed size during iteration");
        di->di_used = -1; /* Make this state sticky */
        return NULL;
    }

    i = di->di_pos;
    assert(i >= 0);
    if (_TyDict_HasSplitTable(d)) {
        if (i >= d->ma_used)
            goto fail;
        int index = get_index_from_order(d, i);
        value = d->ma_values->values[index];
        assert(value != NULL);
    }
    else {
        Ty_ssize_t n = d->ma_keys->dk_nentries;
        if (DK_IS_UNICODE(d->ma_keys)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(d->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            value = entry_ptr->me_value;
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(d->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            value = entry_ptr->me_value;
        }
    }
    // We found an element, but did not expect it
    if (di->len == 0) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary keys changed during iteration");
        goto fail;
    }
    di->di_pos = i+1;
    di->len--;
    return Ty_NewRef(value);

fail:
    di->di_dict = NULL;
    Ty_DECREF(d);
    return NULL;
}

#endif  /* Ty_GIL_DISABLED */

static TyObject *
dictiter_iternextvalue(TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    PyDictObject *d = di->di_dict;

    if (d == NULL)
        return NULL;

    TyObject *value;
#ifdef Ty_GIL_DISABLED
    if (dictiter_iternext_threadsafe(d, self, NULL, &value) < 0) {
        value = NULL;
    }
#else
    value = dictiter_iternextvalue_lock_held(d, self);
#endif

    return value;
}

TyTypeObject PyDictIterValue_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_valueiterator",                       /* tp_name */
    sizeof(dictiterobject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictiter_dealloc,                           /* tp_dealloc */
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
    dictiter_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    dictiter_iternextvalue,                     /* tp_iternext */
    dictiter_methods,                           /* tp_methods */
    0,
};

static int
dictiter_iternextitem_lock_held(PyDictObject *d, TyObject *self,
                                TyObject **out_key, TyObject **out_value)
{
    dictiterobject *di = (dictiterobject *)self;
    TyObject *key, *value;
    Ty_ssize_t i;

    assert (TyDict_Check(d));
    ASSERT_DICT_LOCKED(d);

    if (di->di_used != d->ma_used) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary changed size during iteration");
        di->di_used = -1; /* Make this state sticky */
        return -1;
    }

    i = FT_ATOMIC_LOAD_SSIZE_RELAXED(di->di_pos);

    assert(i >= 0);
    if (_TyDict_HasSplitTable(d)) {
        if (i >= d->ma_used)
            goto fail;
        int index = get_index_from_order(d, i);
        key = LOAD_SHARED_KEY(DK_UNICODE_ENTRIES(d->ma_keys)[index].me_key);
        value = d->ma_values->values[index];
        assert(value != NULL);
    }
    else {
        Ty_ssize_t n = d->ma_keys->dk_nentries;
        if (DK_IS_UNICODE(d->ma_keys)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(d->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            key = entry_ptr->me_key;
            value = entry_ptr->me_value;
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(d->ma_keys)[i];
            while (i < n && entry_ptr->me_value == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;
            key = entry_ptr->me_key;
            value = entry_ptr->me_value;
        }
    }
    // We found an element, but did not expect it
    if (di->len == 0) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary keys changed during iteration");
        goto fail;
    }
    di->di_pos = i+1;
    di->len--;
    if (out_key != NULL) {
        *out_key = Ty_NewRef(key);
    }
    if (out_value != NULL) {
        *out_value = Ty_NewRef(value);
    }
    return 0;

fail:
    di->di_dict = NULL;
    Ty_DECREF(d);
    return -1;
}

#ifdef Ty_GIL_DISABLED

// Grabs the key and/or value from the provided locations and if successful
// returns them with an increased reference count.  If either one is unsuccessful
// nothing is incref'd and returns -1.
static int
acquire_key_value(TyObject **key_loc, TyObject *value, TyObject **value_loc,
                  TyObject **out_key, TyObject **out_value)
{
    if (out_key) {
        *out_key = _Ty_TryXGetRef(key_loc);
        if (*out_key == NULL) {
            return -1;
        }
    }

    if (out_value) {
        if (!_Ty_TryIncrefCompare(value_loc, value)) {
            if (out_key) {
                Ty_DECREF(*out_key);
            }
            return -1;
        }
        *out_value = value;
    }

    return 0;
}

static int
dictiter_iternext_threadsafe(PyDictObject *d, TyObject *self,
                             TyObject **out_key, TyObject **out_value)
{
    int res;
    dictiterobject *di = (dictiterobject *)self;
    Ty_ssize_t i;
    PyDictKeysObject *k;

    assert (TyDict_Check(d));

    if (di->di_used != _Ty_atomic_load_ssize_relaxed(&d->ma_used)) {
        TyErr_SetString(TyExc_RuntimeError,
                        "dictionary changed size during iteration");
        di->di_used = -1; /* Make this state sticky */
        return -1;
    }

    ensure_shared_on_read(d);

    i = _Ty_atomic_load_ssize_relaxed(&di->di_pos);
    k = _Ty_atomic_load_ptr_acquire(&d->ma_keys);
    assert(i >= 0);
    if (_TyDict_HasSplitTable(d)) {
        PyDictValues *values = _Ty_atomic_load_ptr_relaxed(&d->ma_values);
        if (values == NULL) {
            goto concurrent_modification;
        }

        Ty_ssize_t used = (Ty_ssize_t)_Ty_atomic_load_uint8(&values->size);
        if (i >= used) {
            goto fail;
        }

        // We're racing against writes to the order from delete_index_from_values, but
        // single threaded can suffer from concurrent modification to those as well and
        // can have either duplicated or skipped attributes, so we strive to do no better
        // here.
        int index = get_index_from_order(d, i);
        TyObject *value = _Ty_atomic_load_ptr(&values->values[index]);
        if (acquire_key_value(&DK_UNICODE_ENTRIES(k)[index].me_key, value,
                               &values->values[index], out_key, out_value) < 0) {
            goto try_locked;
        }
    }
    else {
        Ty_ssize_t n = _Ty_atomic_load_ssize_relaxed(&k->dk_nentries);
        if (DK_IS_UNICODE(k)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(k)[i];
            TyObject *value;
            while (i < n &&
                  (value = _Ty_atomic_load_ptr(&entry_ptr->me_value)) == NULL) {
                entry_ptr++;
                i++;
            }
            if (i >= n)
                goto fail;

            if (acquire_key_value(&entry_ptr->me_key, value,
                                   &entry_ptr->me_value, out_key, out_value) < 0) {
                goto try_locked;
            }
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(k)[i];
            TyObject *value;
            while (i < n &&
                  (value = _Ty_atomic_load_ptr(&entry_ptr->me_value)) == NULL) {
                entry_ptr++;
                i++;
            }

            if (i >= n)
                goto fail;

            if (acquire_key_value(&entry_ptr->me_key, value,
                                   &entry_ptr->me_value, out_key, out_value) < 0) {
                goto try_locked;
            }
        }
    }
    // We found an element (key), but did not expect it
    Ty_ssize_t len;
    if ((len = _Ty_atomic_load_ssize_relaxed(&di->len)) == 0) {
        goto concurrent_modification;
    }

    _Ty_atomic_store_ssize_relaxed(&di->di_pos, i + 1);
    _Ty_atomic_store_ssize_relaxed(&di->len, len - 1);
    return 0;

concurrent_modification:
    TyErr_SetString(TyExc_RuntimeError,
                    "dictionary keys changed during iteration");

fail:
    di->di_dict = NULL;
    Ty_DECREF(d);
    return -1;

try_locked:
    Ty_BEGIN_CRITICAL_SECTION(d);
    res = dictiter_iternextitem_lock_held(d, self, out_key, out_value);
    Ty_END_CRITICAL_SECTION();
    return res;
}

#endif

static bool
has_unique_reference(TyObject *op)
{
#ifdef Ty_GIL_DISABLED
    return (_Ty_IsOwnedByCurrentThread(op) &&
            op->ob_ref_local == 1 &&
            _Ty_atomic_load_ssize_relaxed(&op->ob_ref_shared) == 0);
#else
    return Ty_REFCNT(op) == 1;
#endif
}

static bool
acquire_iter_result(TyObject *result)
{
    if (has_unique_reference(result)) {
        Ty_INCREF(result);
        return true;
    }
    return false;
}

static TyObject *
dictiter_iternextitem(TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    PyDictObject *d = di->di_dict;

    if (d == NULL)
        return NULL;

    TyObject *key, *value;
#ifdef Ty_GIL_DISABLED
    if (dictiter_iternext_threadsafe(d, self, &key, &value) == 0) {
#else
    if (dictiter_iternextitem_lock_held(d, self, &key, &value) == 0) {

#endif
        TyObject *result = di->di_result;
        if (acquire_iter_result(result)) {
            TyObject *oldkey = TyTuple_GET_ITEM(result, 0);
            TyObject *oldvalue = TyTuple_GET_ITEM(result, 1);
            TyTuple_SET_ITEM(result, 0, key);
            TyTuple_SET_ITEM(result, 1, value);
            Ty_DECREF(oldkey);
            Ty_DECREF(oldvalue);
            // bpo-42536: The GC may have untracked this result tuple. Since we're
            // recycling it, make sure it's tracked again:
            _TyTuple_Recycle(result);
        }
        else {
            result = TyTuple_New(2);
            if (result == NULL)
                return NULL;
            TyTuple_SET_ITEM(result, 0, key);
            TyTuple_SET_ITEM(result, 1, value);
        }
        return result;
    }
    return NULL;
}

TyTypeObject PyDictIterItem_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_itemiterator",                        /* tp_name */
    sizeof(dictiterobject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictiter_dealloc,                           /* tp_dealloc */
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
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    dictiter_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    PyObject_SelfIter,                          /* tp_iter */
    dictiter_iternextitem,                      /* tp_iternext */
    dictiter_methods,                           /* tp_methods */
    0,
};


/* dictreviter */

static TyObject *
dictreviter_iter_lock_held(PyDictObject *d, TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;

    assert (TyDict_Check(d));
    ASSERT_DICT_LOCKED(d);

    if (di->di_used != d->ma_used) {
        TyErr_SetString(TyExc_RuntimeError,
                         "dictionary changed size during iteration");
        di->di_used = -1; /* Make this state sticky */
        return NULL;
    }

    Ty_ssize_t i = di->di_pos;
    PyDictKeysObject *k = d->ma_keys;
    TyObject *key, *value, *result;

    if (i < 0) {
        goto fail;
    }
    if (_TyDict_HasSplitTable(d)) {
        int index = get_index_from_order(d, i);
        key = LOAD_SHARED_KEY(DK_UNICODE_ENTRIES(k)[index].me_key);
        value = d->ma_values->values[index];
        assert (value != NULL);
    }
    else {
        if (DK_IS_UNICODE(k)) {
            PyDictUnicodeEntry *entry_ptr = &DK_UNICODE_ENTRIES(k)[i];
            while (entry_ptr->me_value == NULL) {
                if (--i < 0) {
                    goto fail;
                }
                entry_ptr--;
            }
            key = entry_ptr->me_key;
            value = entry_ptr->me_value;
        }
        else {
            PyDictKeyEntry *entry_ptr = &DK_ENTRIES(k)[i];
            while (entry_ptr->me_value == NULL) {
                if (--i < 0) {
                    goto fail;
                }
                entry_ptr--;
            }
            key = entry_ptr->me_key;
            value = entry_ptr->me_value;
        }
    }
    di->di_pos = i-1;
    di->len--;

    if (Ty_IS_TYPE(di, &PyDictRevIterKey_Type)) {
        return Ty_NewRef(key);
    }
    else if (Ty_IS_TYPE(di, &PyDictRevIterValue_Type)) {
        return Ty_NewRef(value);
    }
    else if (Ty_IS_TYPE(di, &PyDictRevIterItem_Type)) {
        result = di->di_result;
        if (Ty_REFCNT(result) == 1) {
            TyObject *oldkey = TyTuple_GET_ITEM(result, 0);
            TyObject *oldvalue = TyTuple_GET_ITEM(result, 1);
            TyTuple_SET_ITEM(result, 0, Ty_NewRef(key));
            TyTuple_SET_ITEM(result, 1, Ty_NewRef(value));
            Ty_INCREF(result);
            Ty_DECREF(oldkey);
            Ty_DECREF(oldvalue);
            // bpo-42536: The GC may have untracked this result tuple. Since
            // we're recycling it, make sure it's tracked again:
            _TyTuple_Recycle(result);
        }
        else {
            result = TyTuple_New(2);
            if (result == NULL) {
                return NULL;
            }
            TyTuple_SET_ITEM(result, 0, Ty_NewRef(key));
            TyTuple_SET_ITEM(result, 1, Ty_NewRef(value));
        }
        return result;
    }
    else {
        Ty_UNREACHABLE();
    }

fail:
    di->di_dict = NULL;
    Ty_DECREF(d);
    return NULL;
}

static TyObject *
dictreviter_iternext(TyObject *self)
{
    dictiterobject *di = (dictiterobject *)self;
    PyDictObject *d = di->di_dict;

    if (d == NULL)
        return NULL;

    TyObject *value;
    Ty_BEGIN_CRITICAL_SECTION(d);
    value = dictreviter_iter_lock_held(d, self);
    Ty_END_CRITICAL_SECTION();

    return value;
}

TyTypeObject PyDictRevIterKey_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_reversekeyiterator",
    sizeof(dictiterobject),
    .tp_dealloc = dictiter_dealloc,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = dictiter_traverse,
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = dictreviter_iternext,
    .tp_methods = dictiter_methods
};


/*[clinic input]
dict.__reversed__

Return a reverse iterator over the dict keys.
[clinic start generated code]*/

static TyObject *
dict___reversed___impl(PyDictObject *self)
/*[clinic end generated code: output=e674483336d1ed51 input=23210ef3477d8c4d]*/
{
    assert (TyDict_Check(self));
    return dictiter_new(self, &PyDictRevIterKey_Type);
}

static TyObject *
dictiter_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    dictiterobject *di = (dictiterobject *)self;
    /* copy the iterator state */
    dictiterobject tmp = *di;
    Ty_XINCREF(tmp.di_dict);
    TyObject *list = PySequence_List((TyObject*)&tmp);
    Ty_XDECREF(tmp.di_dict);
    if (list == NULL) {
        return NULL;
    }
    return Ty_BuildValue("N(N)", _TyEval_GetBuiltin(&_Ty_ID(iter)), list);
}

TyTypeObject PyDictRevIterItem_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_reverseitemiterator",
    sizeof(dictiterobject),
    .tp_dealloc = dictiter_dealloc,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = dictiter_traverse,
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = dictreviter_iternext,
    .tp_methods = dictiter_methods
};

TyTypeObject PyDictRevIterValue_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_reversevalueiterator",
    sizeof(dictiterobject),
    .tp_dealloc = dictiter_dealloc,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = dictiter_traverse,
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = dictreviter_iternext,
    .tp_methods = dictiter_methods
};

/***********************************************/
/* View objects for keys(), items(), values(). */
/***********************************************/

/* The instance lay-out is the same for all three; but the type differs. */

static void
dictview_dealloc(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    _TyObject_GC_UNTRACK(dv);
    Ty_XDECREF(dv->dv_dict);
    PyObject_GC_Del(dv);
}

static int
dictview_traverse(TyObject *self, visitproc visit, void *arg)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    Ty_VISIT(dv->dv_dict);
    return 0;
}

static Ty_ssize_t
dictview_len(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    Ty_ssize_t len = 0;
    if (dv->dv_dict != NULL)
        len = FT_ATOMIC_LOAD_SSIZE_RELAXED(dv->dv_dict->ma_used);
    return len;
}

TyObject *
_PyDictView_New(TyObject *dict, TyTypeObject *type)
{
    _PyDictViewObject *dv;
    if (dict == NULL) {
        TyErr_BadInternalCall();
        return NULL;
    }
    if (!TyDict_Check(dict)) {
        /* XXX Get rid of this restriction later */
        TyErr_Format(TyExc_TypeError,
                     "%s() requires a dict argument, not '%s'",
                     type->tp_name, Ty_TYPE(dict)->tp_name);
        return NULL;
    }
    dv = PyObject_GC_New(_PyDictViewObject, type);
    if (dv == NULL)
        return NULL;
    dv->dv_dict = (PyDictObject *)Ty_NewRef(dict);
    _TyObject_GC_TRACK(dv);
    return (TyObject *)dv;
}

static TyObject *
dictview_mapping(TyObject *view, void *Py_UNUSED(ignored)) {
    assert(view != NULL);
    assert(PyDictKeys_Check(view)
           || PyDictValues_Check(view)
           || PyDictItems_Check(view));
    TyObject *mapping = (TyObject *)((_PyDictViewObject *)view)->dv_dict;
    return PyDictProxy_New(mapping);
}

static TyGetSetDef dictview_getset[] = {
    {"mapping", dictview_mapping, NULL,
     TyDoc_STR("dictionary that this view refers to"), NULL},
    {0}
};

/* TODO(guido): The views objects are not complete:

 * support more set operations
 * support arbitrary mappings?
   - either these should be static or exported in dictobject.h
   - if public then they should probably be in builtins
*/

/* Return 1 if self is a subset of other, iterating over self;
   0 if not; -1 if an error occurred. */
static int
all_contained_in(TyObject *self, TyObject *other)
{
    TyObject *iter = PyObject_GetIter(self);
    int ok = 1;

    if (iter == NULL)
        return -1;
    for (;;) {
        TyObject *next = TyIter_Next(iter);
        if (next == NULL) {
            if (TyErr_Occurred())
                ok = -1;
            break;
        }
        ok = PySequence_Contains(other, next);
        Ty_DECREF(next);
        if (ok <= 0)
            break;
    }
    Ty_DECREF(iter);
    return ok;
}

static TyObject *
dictview_richcompare(TyObject *self, TyObject *other, int op)
{
    Ty_ssize_t len_self, len_other;
    int ok;
    TyObject *result;

    assert(self != NULL);
    assert(PyDictViewSet_Check(self));
    assert(other != NULL);

    if (!PyAnySet_Check(other) && !PyDictViewSet_Check(other))
        Py_RETURN_NOTIMPLEMENTED;

    len_self = PyObject_Size(self);
    if (len_self < 0)
        return NULL;
    len_other = PyObject_Size(other);
    if (len_other < 0)
        return NULL;

    ok = 0;
    switch(op) {

    case Py_NE:
    case Py_EQ:
        if (len_self == len_other)
            ok = all_contained_in(self, other);
        if (op == Py_NE && ok >= 0)
            ok = !ok;
        break;

    case Py_LT:
        if (len_self < len_other)
            ok = all_contained_in(self, other);
        break;

      case Py_LE:
          if (len_self <= len_other)
              ok = all_contained_in(self, other);
          break;

    case Py_GT:
        if (len_self > len_other)
            ok = all_contained_in(other, self);
        break;

    case Py_GE:
        if (len_self >= len_other)
            ok = all_contained_in(other, self);
        break;

    }
    if (ok < 0)
        return NULL;
    result = ok ? Ty_True : Ty_False;
    return Ty_NewRef(result);
}

static TyObject *
dictview_repr(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    TyObject *seq;
    TyObject *result = NULL;
    Ty_ssize_t rc;

    rc = Ty_ReprEnter((TyObject *)dv);
    if (rc != 0) {
        return rc > 0 ? TyUnicode_FromString("...") : NULL;
    }
    seq = PySequence_List((TyObject *)dv);
    if (seq == NULL) {
        goto Done;
    }
    result = TyUnicode_FromFormat("%s(%R)", Ty_TYPE(dv)->tp_name, seq);
    Ty_DECREF(seq);

Done:
    Ty_ReprLeave((TyObject *)dv);
    return result;
}

/*** dict_keys ***/

static TyObject *
dictkeys_iter(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictIterKey_Type);
}

static int
dictkeys_contains(TyObject *self, TyObject *obj)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL)
        return 0;
    return TyDict_Contains((TyObject *)dv->dv_dict, obj);
}

static PySequenceMethods dictkeys_as_sequence = {
    dictview_len,                       /* sq_length */
    0,                                  /* sq_concat */
    0,                                  /* sq_repeat */
    0,                                  /* sq_item */
    0,                                  /* sq_slice */
    0,                                  /* sq_ass_item */
    0,                                  /* sq_ass_slice */
    dictkeys_contains,                  /* sq_contains */
};

// Create a set object from dictviews object.
// Returns a new reference.
// This utility function is used by set operations.
static TyObject*
dictviews_to_set(TyObject *self)
{
    TyObject *left = self;
    if (PyDictKeys_Check(self)) {
        // TySet_New() has fast path for the dict object.
        TyObject *dict = (TyObject *)((_PyDictViewObject *)self)->dv_dict;
        if (TyDict_CheckExact(dict)) {
            left = dict;
        }
    }
    return TySet_New(left);
}

static TyObject*
dictviews_sub(TyObject *self, TyObject *other)
{
    TyObject *result = dictviews_to_set(self);
    if (result == NULL) {
        return NULL;
    }

    TyObject *tmp = PyObject_CallMethodOneArg(
            result, &_Ty_ID(difference_update), other);
    if (tmp == NULL) {
        Ty_DECREF(result);
        return NULL;
    }

    Ty_DECREF(tmp);
    return result;
}

static int
dictitems_contains(TyObject *dv, TyObject *obj);

TyObject *
_PyDictView_Intersect(TyObject* self, TyObject *other)
{
    TyObject *result;
    TyObject *it;
    TyObject *key;
    Ty_ssize_t len_self;
    int rv;
    objobjproc dict_contains;

    /* Python interpreter swaps parameters when dict view
       is on right side of & */
    if (!PyDictViewSet_Check(self)) {
        TyObject *tmp = other;
        other = self;
        self = tmp;
    }

    len_self = dictview_len(self);

    /* if other is a set and self is smaller than other,
       reuse set intersection logic */
    if (TySet_CheckExact(other) && len_self <= PyObject_Size(other)) {
        return PyObject_CallMethodObjArgs(
                other, &_Ty_ID(intersection), self, NULL);
    }

    /* if other is another dict view, and it is bigger than self,
       swap them */
    if (PyDictViewSet_Check(other)) {
        Ty_ssize_t len_other = dictview_len(other);
        if (len_other > len_self) {
            TyObject *tmp = other;
            other = self;
            self = tmp;
        }
    }

    /* at this point, two things should be true
       1. self is a dictview
       2. if other is a dictview then it is smaller than self */
    result = TySet_New(NULL);
    if (result == NULL)
        return NULL;

    it = PyObject_GetIter(other);
    if (it == NULL) {
        Ty_DECREF(result);
        return NULL;
    }

    if (PyDictKeys_Check(self)) {
        dict_contains = dictkeys_contains;
    }
    /* else PyDictItems_Check(self) */
    else {
        dict_contains = dictitems_contains;
    }

    while ((key = TyIter_Next(it)) != NULL) {
        rv = dict_contains(self, key);
        if (rv < 0) {
            goto error;
        }
        if (rv) {
            if (TySet_Add(result, key)) {
                goto error;
            }
        }
        Ty_DECREF(key);
    }
    Ty_DECREF(it);
    if (TyErr_Occurred()) {
        Ty_DECREF(result);
        return NULL;
    }
    return result;

error:
    Ty_DECREF(it);
    Ty_DECREF(result);
    Ty_DECREF(key);
    return NULL;
}

static TyObject*
dictviews_or(TyObject* self, TyObject *other)
{
    TyObject *result = dictviews_to_set(self);
    if (result == NULL) {
        return NULL;
    }

    if (_TySet_Update(result, other) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    return result;
}

static TyObject *
dictitems_xor_lock_held(TyObject *d1, TyObject *d2)
{
    ASSERT_DICT_LOCKED(d1);
    ASSERT_DICT_LOCKED(d2);

    TyObject *temp_dict = copy_lock_held(d1);
    if (temp_dict == NULL) {
        return NULL;
    }
    TyObject *result_set = TySet_New(NULL);
    if (result_set == NULL) {
        Ty_CLEAR(temp_dict);
        return NULL;
    }

    TyObject *key = NULL, *val1 = NULL, *val2 = NULL;
    Ty_ssize_t pos = 0;
    Ty_hash_t hash;

    while (_TyDict_Next(d2, &pos, &key, &val2, &hash)) {
        Ty_INCREF(key);
        Ty_INCREF(val2);
        val1 = _TyDict_GetItem_KnownHash(temp_dict, key, hash);

        int to_delete;
        if (val1 == NULL) {
            if (TyErr_Occurred()) {
                goto error;
            }
            to_delete = 0;
        }
        else {
            Ty_INCREF(val1);
            to_delete = PyObject_RichCompareBool(val1, val2, Py_EQ);
            if (to_delete < 0) {
                goto error;
            }
        }

        if (to_delete) {
            if (_TyDict_DelItem_KnownHash(temp_dict, key, hash) < 0) {
                goto error;
            }
        }
        else {
            TyObject *pair = TyTuple_Pack(2, key, val2);
            if (pair == NULL) {
                goto error;
            }
            if (TySet_Add(result_set, pair) < 0) {
                Ty_DECREF(pair);
                goto error;
            }
            Ty_DECREF(pair);
        }
        Ty_DECREF(key);
        Ty_XDECREF(val1);
        Ty_DECREF(val2);
    }
    key = val1 = val2 = NULL;

    TyObject *remaining_pairs = PyObject_CallMethodNoArgs(
            temp_dict, &_Ty_ID(items));
    if (remaining_pairs == NULL) {
        goto error;
    }
    if (_TySet_Update(result_set, remaining_pairs) < 0) {
        Ty_DECREF(remaining_pairs);
        goto error;
    }
    Ty_DECREF(temp_dict);
    Ty_DECREF(remaining_pairs);
    return result_set;

error:
    Ty_XDECREF(temp_dict);
    Ty_XDECREF(result_set);
    Ty_XDECREF(key);
    Ty_XDECREF(val1);
    Ty_XDECREF(val2);
    return NULL;
}

static TyObject *
dictitems_xor(TyObject *self, TyObject *other)
{
    assert(PyDictItems_Check(self));
    assert(PyDictItems_Check(other));
    TyObject *d1 = (TyObject *)((_PyDictViewObject *)self)->dv_dict;
    TyObject *d2 = (TyObject *)((_PyDictViewObject *)other)->dv_dict;

    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION2(d1, d2);
    res = dictitems_xor_lock_held(d1, d2);
    Ty_END_CRITICAL_SECTION2();

    return res;
}

static TyObject*
dictviews_xor(TyObject* self, TyObject *other)
{
    if (PyDictItems_Check(self) && PyDictItems_Check(other)) {
        return dictitems_xor(self, other);
    }
    TyObject *result = dictviews_to_set(self);
    if (result == NULL) {
        return NULL;
    }

    TyObject *tmp = PyObject_CallMethodOneArg(
            result, &_Ty_ID(symmetric_difference_update), other);
    if (tmp == NULL) {
        Ty_DECREF(result);
        return NULL;
    }

    Ty_DECREF(tmp);
    return result;
}

static TyNumberMethods dictviews_as_number = {
    0,                                  /*nb_add*/
    dictviews_sub,                      /*nb_subtract*/
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
    _PyDictView_Intersect,              /*nb_and*/
    dictviews_xor,                      /*nb_xor*/
    dictviews_or,                       /*nb_or*/
};

static TyObject*
dictviews_isdisjoint(TyObject *self, TyObject *other)
{
    TyObject *it;
    TyObject *item = NULL;

    if (self == other) {
        if (dictview_len(self) == 0)
            Py_RETURN_TRUE;
        else
            Py_RETURN_FALSE;
    }

    /* Iterate over the shorter object (only if other is a set,
     * because PySequence_Contains may be expensive otherwise): */
    if (PyAnySet_Check(other) || PyDictViewSet_Check(other)) {
        Ty_ssize_t len_self = dictview_len(self);
        Ty_ssize_t len_other = PyObject_Size(other);
        if (len_other == -1)
            return NULL;

        if ((len_other > len_self)) {
            TyObject *tmp = other;
            other = self;
            self = tmp;
        }
    }

    it = PyObject_GetIter(other);
    if (it == NULL)
        return NULL;

    while ((item = TyIter_Next(it)) != NULL) {
        int contains = PySequence_Contains(self, item);
        Ty_DECREF(item);
        if (contains == -1) {
            Ty_DECREF(it);
            return NULL;
        }

        if (contains) {
            Ty_DECREF(it);
            Py_RETURN_FALSE;
        }
    }
    Ty_DECREF(it);
    if (TyErr_Occurred())
        return NULL; /* TyIter_Next raised an exception. */
    Py_RETURN_TRUE;
}

TyDoc_STRVAR(isdisjoint_doc,
"Return True if the view and the given iterable have a null intersection.");

static TyObject* dictkeys_reversed(TyObject *dv, TyObject *Py_UNUSED(ignored));

TyDoc_STRVAR(reversed_keys_doc,
"Return a reverse iterator over the dict keys.");

static TyMethodDef dictkeys_methods[] = {
    {"isdisjoint",      dictviews_isdisjoint,           METH_O,
     isdisjoint_doc},
    {"__reversed__",    dictkeys_reversed,              METH_NOARGS,
     reversed_keys_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyDictKeys_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_keys",                                /* tp_name */
    sizeof(_PyDictViewObject),                  /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictview_dealloc,                           /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    dictview_repr,                              /* tp_repr */
    &dictviews_as_number,                       /* tp_as_number */
    &dictkeys_as_sequence,                      /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    dictview_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    dictview_richcompare,                       /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    dictkeys_iter,                              /* tp_iter */
    0,                                          /* tp_iternext */
    dictkeys_methods,                           /* tp_methods */
    .tp_getset = dictview_getset,
};

/*[clinic input]
dict.keys

Return a set-like object providing a view on the dict's keys.
[clinic start generated code]*/

static TyObject *
dict_keys_impl(PyDictObject *self)
/*[clinic end generated code: output=aac2830c62990358 input=42f48a7a771212a7]*/
{
    return _PyDictView_New((TyObject *)self, &PyDictKeys_Type);
}

static TyObject *
dictkeys_reversed(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictRevIterKey_Type);
}

/*** dict_items ***/

static TyObject *
dictitems_iter(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictIterItem_Type);
}

static int
dictitems_contains(TyObject *self, TyObject *obj)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    int result;
    TyObject *key, *value, *found;
    if (dv->dv_dict == NULL)
        return 0;
    if (!TyTuple_Check(obj) || TyTuple_GET_SIZE(obj) != 2)
        return 0;
    key = TyTuple_GET_ITEM(obj, 0);
    value = TyTuple_GET_ITEM(obj, 1);
    result = TyDict_GetItemRef((TyObject *)dv->dv_dict, key, &found);
    if (result == 1) {
        result = PyObject_RichCompareBool(found, value, Py_EQ);
        Ty_DECREF(found);
    }
    return result;
}

static PySequenceMethods dictitems_as_sequence = {
    dictview_len,                       /* sq_length */
    0,                                  /* sq_concat */
    0,                                  /* sq_repeat */
    0,                                  /* sq_item */
    0,                                  /* sq_slice */
    0,                                  /* sq_ass_item */
    0,                                  /* sq_ass_slice */
    dictitems_contains,                 /* sq_contains */
};

static TyObject* dictitems_reversed(TyObject *dv, TyObject *Py_UNUSED(ignored));

TyDoc_STRVAR(reversed_items_doc,
"Return a reverse iterator over the dict items.");

static TyMethodDef dictitems_methods[] = {
    {"isdisjoint",      dictviews_isdisjoint,           METH_O,
     isdisjoint_doc},
    {"__reversed__",    dictitems_reversed,             METH_NOARGS,
     reversed_items_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyDictItems_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_items",                               /* tp_name */
    sizeof(_PyDictViewObject),                  /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictview_dealloc,                           /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    dictview_repr,                              /* tp_repr */
    &dictviews_as_number,                       /* tp_as_number */
    &dictitems_as_sequence,                     /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    dictview_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    dictview_richcompare,                       /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    dictitems_iter,                             /* tp_iter */
    0,                                          /* tp_iternext */
    dictitems_methods,                          /* tp_methods */
    .tp_getset = dictview_getset,
};

/*[clinic input]
dict.items

Return a set-like object providing a view on the dict's items.
[clinic start generated code]*/

static TyObject *
dict_items_impl(PyDictObject *self)
/*[clinic end generated code: output=88c7db7150c7909a input=87c822872eb71f5a]*/
{
    return _PyDictView_New((TyObject *)self, &PyDictItems_Type);
}

static TyObject *
dictitems_reversed(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictRevIterItem_Type);
}

/*** dict_values ***/

static TyObject *
dictvalues_iter(TyObject *self)
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictIterValue_Type);
}

static PySequenceMethods dictvalues_as_sequence = {
    dictview_len,                       /* sq_length */
    0,                                  /* sq_concat */
    0,                                  /* sq_repeat */
    0,                                  /* sq_item */
    0,                                  /* sq_slice */
    0,                                  /* sq_ass_item */
    0,                                  /* sq_ass_slice */
    0,                                  /* sq_contains */
};

static TyObject* dictvalues_reversed(TyObject *dv, TyObject *Py_UNUSED(ignored));

TyDoc_STRVAR(reversed_values_doc,
"Return a reverse iterator over the dict values.");

static TyMethodDef dictvalues_methods[] = {
    {"__reversed__",    dictvalues_reversed,            METH_NOARGS,
     reversed_values_doc},
    {NULL,              NULL}           /* sentinel */
};

TyTypeObject PyDictValues_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "dict_values",                              /* tp_name */
    sizeof(_PyDictViewObject),                  /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    dictview_dealloc,                           /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    dictview_repr,                              /* tp_repr */
    0,                                          /* tp_as_number */
    &dictvalues_as_sequence,                    /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    dictview_traverse,                          /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    dictvalues_iter,                            /* tp_iter */
    0,                                          /* tp_iternext */
    dictvalues_methods,                         /* tp_methods */
    .tp_getset = dictview_getset,
};

/*[clinic input]
dict.values

Return an object providing a view on the dict's values.
[clinic start generated code]*/

static TyObject *
dict_values_impl(PyDictObject *self)
/*[clinic end generated code: output=ce9f2e9e8a959dd4 input=b46944f85493b230]*/
{
    return _PyDictView_New((TyObject *)self, &PyDictValues_Type);
}

static TyObject *
dictvalues_reversed(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    _PyDictViewObject *dv = (_PyDictViewObject *)self;
    if (dv->dv_dict == NULL) {
        Py_RETURN_NONE;
    }
    return dictiter_new(dv->dv_dict, &PyDictRevIterValue_Type);
}


/* Returns NULL if cannot allocate a new PyDictKeysObject,
   but does not set an error */
PyDictKeysObject *
_TyDict_NewKeysForClass(PyHeapTypeObject *cls)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    PyDictKeysObject *keys = new_keys_object(
            interp, NEXT_LOG2_SHARED_KEYS_MAX_SIZE, 1);
    if (keys == NULL) {
        TyErr_Clear();
    }
    else {
        assert(keys->dk_nentries == 0);
        /* Set to max size+1 as it will shrink by one before each new object */
        keys->dk_usable = SHARED_KEYS_MAX_SIZE;
        keys->dk_kind = DICT_KEYS_SPLIT;
    }
    if (cls->ht_type.tp_dict) {
        TyObject *attrs = TyDict_GetItem(cls->ht_type.tp_dict, &_Ty_ID(__static_attributes__));
        if (attrs != NULL && TyTuple_Check(attrs)) {
            for (Ty_ssize_t i = 0; i < TyTuple_GET_SIZE(attrs); i++) {
                TyObject *key = TyTuple_GET_ITEM(attrs, i);
                Ty_hash_t hash;
                if (TyUnicode_CheckExact(key) && (hash = unicode_get_hash(key)) != -1) {
                    if (insert_split_key(keys, key, hash) == DKIX_EMPTY) {
                        break;
                    }
                }
            }
        }
    }
    return keys;
}

void
_TyObject_InitInlineValues(TyObject *obj, TyTypeObject *tp)
{
    assert(tp->tp_flags & Ty_TPFLAGS_HEAPTYPE);
    assert(tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES);
    assert(tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
    PyDictKeysObject *keys = CACHED_KEYS(tp);
    assert(keys != NULL);
    OBJECT_STAT_INC(inline_values);
#ifdef Ty_GIL_DISABLED
    Ty_ssize_t usable = _Ty_atomic_load_ssize_relaxed(&keys->dk_usable);
    if (usable > 1) {
        LOCK_KEYS(keys);
        if (keys->dk_usable > 1) {
            _Ty_atomic_store_ssize(&keys->dk_usable, keys->dk_usable - 1);
        }
        UNLOCK_KEYS(keys);
    }
#else
    if (keys->dk_usable > 1) {
        keys->dk_usable--;
    }
#endif
    size_t size = shared_keys_usable_size(keys);
    PyDictValues *values = _TyObject_InlineValues(obj);
    assert(size < 256);
    values->capacity = (uint8_t)size;
    values->size = 0;
    values->embedded = 1;
    values->valid = 1;
    for (size_t i = 0; i < size; i++) {
        values->values[i] = NULL;
    }
    _TyObject_ManagedDictPointer(obj)->dict = NULL;
}

static PyDictObject *
make_dict_from_instance_attributes(TyInterpreterState *interp,
                                   PyDictKeysObject *keys, PyDictValues *values)
{
    dictkeys_incref(keys);
    Ty_ssize_t used = 0;
    size_t size = shared_keys_usable_size(keys);
    for (size_t i = 0; i < size; i++) {
        TyObject *val = values->values[i];
        if (val != NULL) {
            used += 1;
        }
    }
    PyDictObject *res = (PyDictObject *)new_dict(interp, keys, values, used, 0);
    return res;
}

PyDictObject *
_TyObject_MaterializeManagedDict_LockHeld(TyObject *obj)
{
    ASSERT_WORLD_STOPPED_OR_OBJ_LOCKED(obj);

    OBJECT_STAT_INC(dict_materialized_on_request);

    PyDictValues *values = _TyObject_InlineValues(obj);
    PyDictObject *dict;
    if (values->valid) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        PyDictKeysObject *keys = CACHED_KEYS(Ty_TYPE(obj));
        dict = make_dict_from_instance_attributes(interp, keys, values);
    }
    else {
        dict = (PyDictObject *)TyDict_New();
    }
    FT_ATOMIC_STORE_PTR_RELEASE(_TyObject_ManagedDictPointer(obj)->dict,
                                dict);
    return dict;
}

PyDictObject *
_TyObject_MaterializeManagedDict(TyObject *obj)
{
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict != NULL) {
        return dict;
    }

    Ty_BEGIN_CRITICAL_SECTION(obj);

#ifdef Ty_GIL_DISABLED
    dict = _TyObject_GetManagedDict(obj);
    if (dict != NULL) {
        // We raced with another thread creating the dict
        goto exit;
    }
#endif
    dict = _TyObject_MaterializeManagedDict_LockHeld(obj);

#ifdef Ty_GIL_DISABLED
exit:
#endif
    Ty_END_CRITICAL_SECTION();
    return dict;
}

int
_TyDict_SetItem_LockHeld(PyDictObject *dict, TyObject *name, TyObject *value)
{
    if (value == NULL) {
        Ty_hash_t hash = _TyObject_HashFast(name);
        if (hash == -1) {
            dict_unhashable_type(name);
            return -1;
        }
        return delitem_knownhash_lock_held((TyObject *)dict, name, hash);
    } else {
        return setitem_lock_held(dict, name, value);
    }
}

// Called with either the object's lock or the dict's lock held
// depending on whether or not a dict has been materialized for
// the object.
static int
store_instance_attr_lock_held(TyObject *obj, PyDictValues *values,
                              TyObject *name, TyObject *value)
{
    PyDictKeysObject *keys = CACHED_KEYS(Ty_TYPE(obj));
    assert(keys != NULL);
    assert(values != NULL);
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES);
    Ty_ssize_t ix = DKIX_EMPTY;
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    assert(dict == NULL || ((PyDictObject *)dict)->ma_values == values);
    if (TyUnicode_CheckExact(name)) {
        Ty_hash_t hash = unicode_get_hash(name);
        if (hash == -1) {
            hash = TyUnicode_Type.tp_hash(name);
            assert(hash != -1);
        }

        ix = insert_split_key(keys, name, hash);

#ifdef Ty_STATS
        if (ix == DKIX_EMPTY) {
            if (TyUnicode_CheckExact(name)) {
                if (shared_keys_usable_size(keys) == SHARED_KEYS_MAX_SIZE) {
                    OBJECT_STAT_INC(dict_materialized_too_big);
                }
                else {
                    OBJECT_STAT_INC(dict_materialized_new_key);
                }
            }
            else {
                OBJECT_STAT_INC(dict_materialized_str_subclass);
            }
        }
#endif
    }

    if (ix == DKIX_EMPTY) {
        int res;
        if (dict == NULL) {
            // Make the dict but don't publish it in the object
            // so that no one else will see it.
            dict = make_dict_from_instance_attributes(TyInterpreterState_Get(), keys, values);
            if (dict == NULL ||
                _TyDict_SetItem_LockHeld(dict, name, value) < 0) {
                Ty_XDECREF(dict);
                return -1;
            }

            FT_ATOMIC_STORE_PTR_RELEASE(_TyObject_ManagedDictPointer(obj)->dict,
                                        (PyDictObject *)dict);
            return 0;
        }

        _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(dict);

        res = _TyDict_SetItem_LockHeld(dict, name, value);
        return res;
    }

    TyObject *old_value = values->values[ix];
    if (old_value == NULL && value == NULL) {
        TyErr_Format(TyExc_AttributeError,
                        "'%.100s' object has no attribute '%U'",
                        Ty_TYPE(obj)->tp_name, name);
        return -1;
    }

    if (dict) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        TyDict_WatchEvent event = (old_value == NULL ? TyDict_EVENT_ADDED :
                                   value == NULL ? TyDict_EVENT_DELETED :
                                   TyDict_EVENT_MODIFIED);
        _TyDict_NotifyEvent(interp, event, dict, name, value);
    }

    FT_ATOMIC_STORE_PTR_RELEASE(values->values[ix], Ty_XNewRef(value));

    if (old_value == NULL) {
        _PyDictValues_AddToInsertionOrder(values, ix);
        if (dict) {
            assert(dict->ma_values == values);
            STORE_USED(dict, dict->ma_used + 1);
        }
    }
    else {
        if (value == NULL) {
            delete_index_from_values(values, ix);
            if (dict) {
                assert(dict->ma_values == values);
                STORE_USED(dict, dict->ma_used - 1);
            }
        }
        Ty_DECREF(old_value);
    }
    return 0;
}

static inline int
store_instance_attr_dict(TyObject *obj, PyDictObject *dict, TyObject *name, TyObject *value)
{
    PyDictValues *values = _TyObject_InlineValues(obj);
    int res;
    Ty_BEGIN_CRITICAL_SECTION(dict);
    if (dict->ma_values == values) {
        res = store_instance_attr_lock_held(obj, values, name, value);
    }
    else {
        res = _TyDict_SetItem_LockHeld(dict, name, value);
    }
    Ty_END_CRITICAL_SECTION();
    return res;
}

int
_TyObject_StoreInstanceAttribute(TyObject *obj, TyObject *name, TyObject *value)
{
    PyDictValues *values = _TyObject_InlineValues(obj);
    if (!FT_ATOMIC_LOAD_UINT8(values->valid)) {
        PyDictObject *dict = _TyObject_GetManagedDict(obj);
        if (dict == NULL) {
            dict = (PyDictObject *)PyObject_GenericGetDict(obj, NULL);
            if (dict == NULL) {
                return -1;
            }
            int res = store_instance_attr_dict(obj, dict, name, value);
            Ty_DECREF(dict);
            return res;
        }
        return store_instance_attr_dict(obj, dict, name, value);
    }

#ifdef Ty_GIL_DISABLED
    // We have a valid inline values, at least for now...  There are two potential
    // races with having the values become invalid.  One is the dictionary
    // being detached from the object.  The other is if someone is inserting
    // into the dictionary directly and therefore causing it to resize.
    //
    // If we haven't materialized the dictionary yet we lock on the object, which
    // will also be used to prevent the dictionary from being materialized while
    // we're doing the insertion.  If we race and the dictionary gets created
    // then we'll need to release the object lock and lock the dictionary to
    // prevent resizing.
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL) {
        int res;
        Ty_BEGIN_CRITICAL_SECTION(obj);
        dict = _TyObject_GetManagedDict(obj);

        if (dict == NULL) {
            res = store_instance_attr_lock_held(obj, values, name, value);
        }
        Ty_END_CRITICAL_SECTION();

        if (dict == NULL) {
            return res;
        }
    }
    return store_instance_attr_dict(obj, dict, name, value);
#else
    return store_instance_attr_lock_held(obj, values, name, value);
#endif
}

/* Sanity check for managed dicts */
#if 0
#define CHECK(val) assert(val); if (!(val)) { return 0; }

int
_TyObject_ManagedDictValidityCheck(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    CHECK(tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
    PyManagedDictPointer *managed_dict = _TyObject_ManagedDictPointer(obj);
    if (_PyManagedDictPointer_IsValues(*managed_dict)) {
        PyDictValues *values = _PyManagedDictPointer_GetValues(*managed_dict);
        int size = ((uint8_t *)values)[-2];
        int count = 0;
        PyDictKeysObject *keys = CACHED_KEYS(tp);
        for (Ty_ssize_t i = 0; i < keys->dk_nentries; i++) {
            if (values->values[i] != NULL) {
                count++;
            }
        }
        CHECK(size == count);
    }
    else {
        if (managed_dict->dict != NULL) {
            CHECK(TyDict_Check(managed_dict->dict));
        }
    }
    return 1;
}
#endif

// Attempts to get an instance attribute from the inline values. Returns true
// if successful, or false if the caller needs to lookup in the dictionary.
bool
_TyObject_TryGetInstanceAttribute(TyObject *obj, TyObject *name, TyObject **attr)
{
    assert(TyUnicode_CheckExact(name));
    PyDictValues *values = _TyObject_InlineValues(obj);
    if (!FT_ATOMIC_LOAD_UINT8(values->valid)) {
        return false;
    }

    PyDictKeysObject *keys = CACHED_KEYS(Ty_TYPE(obj));
    assert(keys != NULL);
    Ty_ssize_t ix = _PyDictKeys_StringLookupSplit(keys, name);
    if (ix == DKIX_EMPTY) {
        *attr = NULL;
        return true;
    }

#ifdef Ty_GIL_DISABLED
    TyObject *value = _Ty_atomic_load_ptr_acquire(&values->values[ix]);
    if (value == NULL) {
        if (FT_ATOMIC_LOAD_UINT8(values->valid)) {
            *attr = NULL;
            return true;
        }
    }
    else if (_Ty_TryIncrefCompare(&values->values[ix], value)) {
        *attr = value;
        return true;
    }

    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL) {
        // No dict, lock the object to prevent one from being
        // materialized...
        bool success = false;
        Ty_BEGIN_CRITICAL_SECTION(obj);

        dict = _TyObject_GetManagedDict(obj);
        if (dict == NULL) {
            // Still no dict, we can read from the values
            assert(values->valid);
            value = values->values[ix];
            *attr = _Ty_XNewRefWithLock(value);
            success = true;
        }

        Ty_END_CRITICAL_SECTION();

        if (success) {
            return true;
        }
    }

    // We have a dictionary, we'll need to lock it to prevent
    // the values from being resized.
    assert(dict != NULL);

    bool success;
    Ty_BEGIN_CRITICAL_SECTION(dict);

    if (dict->ma_values == values && FT_ATOMIC_LOAD_UINT8(values->valid)) {
        value = _Ty_atomic_load_ptr_relaxed(&values->values[ix]);
        *attr = _Ty_XNewRefWithLock(value);
        success = true;
    } else {
        // Caller needs to lookup from the dictionary
        success = false;
    }

    Ty_END_CRITICAL_SECTION();

    return success;
#else
    TyObject *value = values->values[ix];
    *attr = Ty_XNewRef(value);
    return true;
#endif
}

int
_TyObject_IsInstanceDictEmpty(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    if (tp->tp_dictoffset == 0) {
        return 1;
    }
    PyDictObject *dict;
    if (tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        PyDictValues *values = _TyObject_InlineValues(obj);
        if (FT_ATOMIC_LOAD_UINT8(values->valid)) {
            PyDictKeysObject *keys = CACHED_KEYS(tp);
            for (Ty_ssize_t i = 0; i < keys->dk_nentries; i++) {
                if (FT_ATOMIC_LOAD_PTR_RELAXED(values->values[i]) != NULL) {
                    return 0;
                }
            }
            return 1;
        }
        dict = _TyObject_GetManagedDict(obj);
    }
    else if (tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT) {
        dict = _TyObject_GetManagedDict(obj);
    }
    else {
        TyObject **dictptr = _TyObject_ComputedDictPointer(obj);
        dict = (PyDictObject *)*dictptr;
    }
    if (dict == NULL) {
        return 1;
    }
    return FT_ATOMIC_LOAD_SSIZE_RELAXED(((PyDictObject *)dict)->ma_used) == 0;
}

int
PyObject_VisitManagedDict(TyObject *obj, visitproc visit, void *arg)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    if((tp->tp_flags & Ty_TPFLAGS_MANAGED_DICT) == 0) {
        return 0;
    }
    if (tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        PyDictValues *values = _TyObject_InlineValues(obj);
        if (values->valid) {
            for (Ty_ssize_t i = 0; i < values->capacity; i++) {
                Ty_VISIT(values->values[i]);
            }
            return 0;
        }
    }
    Ty_VISIT(_TyObject_ManagedDictPointer(obj)->dict);
    return 0;
}

static void
clear_inline_values(PyDictValues *values)
{
    if (values->valid) {
        FT_ATOMIC_STORE_UINT8(values->valid, 0);
        for (Ty_ssize_t i = 0; i < values->capacity; i++) {
            Ty_CLEAR(values->values[i]);
        }
    }
}

static void
set_dict_inline_values(TyObject *obj, PyDictObject *new_dict)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(obj);

    PyDictValues *values = _TyObject_InlineValues(obj);

    Ty_XINCREF(new_dict);
    FT_ATOMIC_STORE_PTR(_TyObject_ManagedDictPointer(obj)->dict, new_dict);

    clear_inline_values(values);
}

#ifdef Ty_GIL_DISABLED

// Trys and sets the dictionary for an object in the easy case when our current
// dictionary is either completely not materialized or is a dictionary which
// does not point at the inline values.
static bool
try_set_dict_inline_only_or_other_dict(TyObject *obj, TyObject *new_dict, PyDictObject **cur_dict)
{
    bool replaced = false;
    Ty_BEGIN_CRITICAL_SECTION(obj);

    PyDictObject *dict = *cur_dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL) {
        // We only have inline values, we can just completely replace them.
        set_dict_inline_values(obj, (PyDictObject *)new_dict);
        replaced = true;
        goto exit_lock;
    }

    if (FT_ATOMIC_LOAD_PTR_RELAXED(dict->ma_values) != _TyObject_InlineValues(obj)) {
        // We have a materialized dict which doesn't point at the inline values,
        // We get to simply swap dictionaries and free the old dictionary.
        FT_ATOMIC_STORE_PTR(_TyObject_ManagedDictPointer(obj)->dict,
                            (PyDictObject *)Ty_XNewRef(new_dict));
        replaced = true;
        goto exit_lock;
    }
    else {
        // We have inline values, we need to lock the dict and the object
        // at the same time to safely dematerialize them. To do that while releasing
        // the object lock we need a strong reference to the current dictionary.
        Ty_INCREF(dict);
    }
exit_lock:
    Ty_END_CRITICAL_SECTION();
    return replaced;
}

// Replaces a dictionary that is probably the dictionary which has been
// materialized and points at the inline values. We could have raced
// and replaced it with another dictionary though.
static int
replace_dict_probably_inline_materialized(TyObject *obj, PyDictObject *inline_dict,
                                          PyDictObject *cur_dict, TyObject *new_dict)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(obj);

    if (cur_dict == inline_dict) {
        assert(FT_ATOMIC_LOAD_PTR_RELAXED(inline_dict->ma_values) == _TyObject_InlineValues(obj));

        int err = _TyDict_DetachFromObject(inline_dict, obj);
        if (err != 0) {
            assert(new_dict == NULL);
            return err;
        }
    }

    FT_ATOMIC_STORE_PTR(_TyObject_ManagedDictPointer(obj)->dict,
                        (PyDictObject *)Ty_XNewRef(new_dict));
    return 0;
}

#endif

static void
decref_maybe_delay(TyObject *obj, bool delay)
{
    if (delay) {
        _TyObject_XDecRefDelayed(obj);
    }
    else {
        Ty_XDECREF(obj);
    }
}

int
_TyObject_SetManagedDict(TyObject *obj, TyObject *new_dict)
{
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
#ifndef NDEBUG
    Ty_BEGIN_CRITICAL_SECTION(obj);
    assert(_TyObject_InlineValuesConsistencyCheck(obj));
    Ty_END_CRITICAL_SECTION();
#endif
    int err = 0;
    TyTypeObject *tp = Ty_TYPE(obj);
    if (tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
#ifdef Ty_GIL_DISABLED
        PyDictObject *prev_dict;
        if (!try_set_dict_inline_only_or_other_dict(obj, new_dict, &prev_dict)) {
            // We had a materialized dictionary which pointed at the inline
            // values. We need to lock both the object and the dict at the
            // same time to safely replace it. We can't merely lock the dictionary
            // while the object is locked because it could suspend the object lock.
            PyDictObject *cur_dict;

            assert(prev_dict != NULL);
            Ty_BEGIN_CRITICAL_SECTION2(obj, prev_dict);

            // We could have had another thread race in between the call to
            // try_set_dict_inline_only_or_other_dict where we locked the object
            // and when we unlocked and re-locked the dictionary.
            cur_dict = _TyObject_GetManagedDict(obj);

            err = replace_dict_probably_inline_materialized(obj, prev_dict,
                                                            cur_dict, new_dict);

            Ty_END_CRITICAL_SECTION2();

            // Decref for the dictionary we incref'd in try_set_dict_inline_only_or_other_dict
            // while the object was locked
            decref_maybe_delay((TyObject *)prev_dict, prev_dict != cur_dict);
            if (err != 0) {
                return err;
            }

            prev_dict = cur_dict;
        }

        if (prev_dict != NULL) {
            // decref for the dictionary that we replaced
            decref_maybe_delay((TyObject *)prev_dict, true);
        }

        return 0;
#else
        PyDictObject *dict = _TyObject_GetManagedDict(obj);
        if (dict == NULL) {
            set_dict_inline_values(obj, (PyDictObject *)new_dict);
            return 0;
        }
        if (_TyDict_DetachFromObject(dict, obj) == 0) {
            _TyObject_ManagedDictPointer(obj)->dict = (PyDictObject *)Ty_XNewRef(new_dict);
            Ty_DECREF(dict);
            return 0;
        }
        assert(new_dict == NULL);
        return -1;
#endif
    }
    else {
        PyDictObject *dict;

        Ty_BEGIN_CRITICAL_SECTION(obj);

        dict = _TyObject_ManagedDictPointer(obj)->dict;

        FT_ATOMIC_STORE_PTR(_TyObject_ManagedDictPointer(obj)->dict,
                            (PyDictObject *)Ty_XNewRef(new_dict));

        Ty_END_CRITICAL_SECTION();
        decref_maybe_delay((TyObject *)dict, true);
    }
    assert(_TyObject_InlineValuesConsistencyCheck(obj));
    return err;
}

static int
detach_dict_from_object(PyDictObject *mp, TyObject *obj)
{
    assert(_TyObject_ManagedDictPointer(obj)->dict == mp);
    assert(_TyObject_InlineValuesConsistencyCheck(obj));

    if (FT_ATOMIC_LOAD_PTR_RELAXED(mp->ma_values) != _TyObject_InlineValues(obj)) {
        return 0;
    }

    // We could be called with an unlocked dict when the caller knows the
    // values are already detached, so we assert after inline values check.
    ASSERT_WORLD_STOPPED_OR_OBJ_LOCKED(mp);
    assert(mp->ma_values->embedded == 1);
    assert(mp->ma_values->valid == 1);
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES);

    PyDictValues *values = copy_values(mp->ma_values);

    if (values == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    mp->ma_values = values;

    invalidate_and_clear_inline_values(_TyObject_InlineValues(obj));

    assert(_TyObject_InlineValuesConsistencyCheck(obj));
    ASSERT_CONSISTENT(mp);
    return 0;
}


void
PyObject_ClearManagedDict(TyObject *obj)
{
    // This is called when the object is being freed or cleared
    // by the GC and therefore known to have no references.
    if (Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES) {
        PyDictObject *dict = _TyObject_GetManagedDict(obj);
        if (dict == NULL) {
            // We have no materialized dictionary and inline values
            // that just need to be cleared.
            // No dict to clear, we're done
            clear_inline_values(_TyObject_InlineValues(obj));
            return;
        }
        else if (FT_ATOMIC_LOAD_PTR_RELAXED(dict->ma_values) ==
                    _TyObject_InlineValues(obj)) {
            // We have a materialized object which points at the inline
            // values. We need to materialize the keys. Nothing can modify
            // this object, but we need to lock the dictionary.
            int err;
            Ty_BEGIN_CRITICAL_SECTION(dict);
            err = detach_dict_from_object(dict, obj);
            Ty_END_CRITICAL_SECTION();

            if (err) {
                /* Must be out of memory */
                assert(TyErr_Occurred() == TyExc_MemoryError);
                TyErr_FormatUnraisable("Exception ignored while "
                                       "clearing an object managed dict");
                /* Clear the dict */
                Ty_BEGIN_CRITICAL_SECTION(dict);
                TyInterpreterState *interp = _TyInterpreterState_GET();
                PyDictKeysObject *oldkeys = dict->ma_keys;
                set_keys(dict, Ty_EMPTY_KEYS);
                dict->ma_values = NULL;
                dictkeys_decref(interp, oldkeys, IS_DICT_SHARED(dict));
                STORE_USED(dict, 0);
                clear_inline_values(_TyObject_InlineValues(obj));
                Ty_END_CRITICAL_SECTION();
            }
        }
    }
    Ty_CLEAR(_TyObject_ManagedDictPointer(obj)->dict);
}

int
_TyDict_DetachFromObject(PyDictObject *mp, TyObject *obj)
{
    ASSERT_WORLD_STOPPED_OR_OBJ_LOCKED(obj);

    return detach_dict_from_object(mp, obj);
}

static inline TyObject *
ensure_managed_dict(TyObject *obj)
{
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL) {
        TyTypeObject *tp = Ty_TYPE(obj);
        if ((tp->tp_flags & Ty_TPFLAGS_INLINE_VALUES) &&
            FT_ATOMIC_LOAD_UINT8(_TyObject_InlineValues(obj)->valid)) {
            dict = _TyObject_MaterializeManagedDict(obj);
        }
        else {
#ifdef Ty_GIL_DISABLED
            // Check again that we're not racing with someone else creating the dict
            Ty_BEGIN_CRITICAL_SECTION(obj);
            dict = _TyObject_GetManagedDict(obj);
            if (dict != NULL) {
                goto done;
            }
#endif
            dict = (PyDictObject *)new_dict_with_shared_keys(_TyInterpreterState_GET(),
                                                             CACHED_KEYS(tp));
            FT_ATOMIC_STORE_PTR_RELEASE(_TyObject_ManagedDictPointer(obj)->dict,
                                        (PyDictObject *)dict);

#ifdef Ty_GIL_DISABLED
done:
            Ty_END_CRITICAL_SECTION();
#endif
        }
    }
    return (TyObject *)dict;
}

static inline TyObject *
ensure_nonmanaged_dict(TyObject *obj, TyObject **dictptr)
{
    PyDictKeysObject *cached;

    TyObject *dict = FT_ATOMIC_LOAD_PTR_ACQUIRE(*dictptr);
    if (dict == NULL) {
#ifdef Ty_GIL_DISABLED
        Ty_BEGIN_CRITICAL_SECTION(obj);
        dict = *dictptr;
        if (dict != NULL) {
            goto done;
        }
#endif
        TyTypeObject *tp = Ty_TYPE(obj);
        if (_TyType_HasFeature(tp, Ty_TPFLAGS_HEAPTYPE) && (cached = CACHED_KEYS(tp))) {
            TyInterpreterState *interp = _TyInterpreterState_GET();
            assert(!_TyType_HasFeature(tp, Ty_TPFLAGS_INLINE_VALUES));
            dict = new_dict_with_shared_keys(interp, cached);
        }
        else {
            dict = TyDict_New();
        }
        FT_ATOMIC_STORE_PTR_RELEASE(*dictptr, dict);
#ifdef Ty_GIL_DISABLED
done:
        Ty_END_CRITICAL_SECTION();
#endif
    }
    return dict;
}

TyObject *
PyObject_GenericGetDict(TyObject *obj, void *context)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    if (_TyType_HasFeature(tp, Ty_TPFLAGS_MANAGED_DICT)) {
        return Ty_XNewRef(ensure_managed_dict(obj));
    }
    else {
        TyObject **dictptr = _TyObject_ComputedDictPointer(obj);
        if (dictptr == NULL) {
            TyErr_SetString(TyExc_AttributeError,
                            "This object has no __dict__");
            return NULL;
        }

        return Ty_XNewRef(ensure_nonmanaged_dict(obj, dictptr));
    }
}

int
_PyObjectDict_SetItem(TyTypeObject *tp, TyObject *obj, TyObject **dictptr,
                      TyObject *key, TyObject *value)
{
    TyObject *dict;
    int res;

    assert(dictptr != NULL);
    dict = ensure_nonmanaged_dict(obj, dictptr);
    if (dict == NULL) {
        return -1;
    }

    Ty_BEGIN_CRITICAL_SECTION(dict);
    res = _TyDict_SetItem_LockHeld((PyDictObject *)dict, key, value);
    ASSERT_CONSISTENT(dict);
    Ty_END_CRITICAL_SECTION();
    return res;
}

void
_PyDictKeys_DecRef(PyDictKeysObject *keys)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    dictkeys_decref(interp, keys, false);
}

static inline uint32_t
get_next_dict_keys_version(TyInterpreterState *interp)
{
#ifdef Ty_GIL_DISABLED
    uint32_t v;
    do {
        v = _Ty_atomic_load_uint32_relaxed(
            &interp->dict_state.next_keys_version);
        if (v == 0) {
            return 0;
        }
    } while (!_Ty_atomic_compare_exchange_uint32(
        &interp->dict_state.next_keys_version, &v, v + 1));
#else
    if (interp->dict_state.next_keys_version == 0) {
        return 0;
    }
    uint32_t v = interp->dict_state.next_keys_version++;
#endif
    return v;
}

// In free-threaded builds the caller must ensure that the keys object is not
// being mutated concurrently by another thread.
uint32_t
_PyDictKeys_GetVersionForCurrentState(TyInterpreterState *interp,
                                      PyDictKeysObject *dictkeys)
{
    uint32_t dk_version = FT_ATOMIC_LOAD_UINT32_RELAXED(dictkeys->dk_version);
    if (dk_version != 0) {
        return dk_version;
    }
    dk_version = get_next_dict_keys_version(interp);
    FT_ATOMIC_STORE_UINT32_RELAXED(dictkeys->dk_version, dk_version);
    return dk_version;
}

uint32_t
_TyDict_GetKeysVersionForCurrentState(TyInterpreterState *interp,
                                      PyDictObject *dict)
{
    ASSERT_DICT_LOCKED((TyObject *) dict);
    uint32_t dk_version =
        _PyDictKeys_GetVersionForCurrentState(interp, dict->ma_keys);
    ensure_shared_on_keys_version_assignment(dict);
    return dk_version;
}

static inline int
validate_watcher_id(TyInterpreterState *interp, int watcher_id)
{
    if (watcher_id < 0 || watcher_id >= DICT_MAX_WATCHERS) {
        TyErr_Format(TyExc_ValueError, "Invalid dict watcher ID %d", watcher_id);
        return -1;
    }
    if (!interp->dict_state.watchers[watcher_id]) {
        TyErr_Format(TyExc_ValueError, "No dict watcher set for ID %d", watcher_id);
        return -1;
    }
    return 0;
}

int
TyDict_Watch(int watcher_id, TyObject* dict)
{
    if (!TyDict_Check(dict)) {
        TyErr_SetString(TyExc_ValueError, "Cannot watch non-dictionary");
        return -1;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id)) {
        return -1;
    }
    ((PyDictObject*)dict)->_ma_watcher_tag |= (1LL << watcher_id);
    return 0;
}

int
TyDict_Unwatch(int watcher_id, TyObject* dict)
{
    if (!TyDict_Check(dict)) {
        TyErr_SetString(TyExc_ValueError, "Cannot watch non-dictionary");
        return -1;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id)) {
        return -1;
    }
    ((PyDictObject*)dict)->_ma_watcher_tag &= ~(1LL << watcher_id);
    return 0;
}

int
TyDict_AddWatcher(TyDict_WatchCallback callback)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();

    /* Start at 2, as 0 and 1 are reserved for CPython */
    for (int i = 2; i < DICT_MAX_WATCHERS; i++) {
        if (!interp->dict_state.watchers[i]) {
            interp->dict_state.watchers[i] = callback;
            return i;
        }
    }

    TyErr_SetString(TyExc_RuntimeError, "no more dict watcher IDs available");
    return -1;
}

int
TyDict_ClearWatcher(int watcher_id)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    if (validate_watcher_id(interp, watcher_id)) {
        return -1;
    }
    interp->dict_state.watchers[watcher_id] = NULL;
    return 0;
}

static const char *
dict_event_name(TyDict_WatchEvent event) {
    switch (event) {
        #define CASE(op)                \
        case TyDict_EVENT_##op:         \
            return "TyDict_EVENT_" #op;
        PY_FOREACH_DICT_EVENT(CASE)
        #undef CASE
    }
    Ty_UNREACHABLE();
}

void
_TyDict_SendEvent(int watcher_bits,
                  TyDict_WatchEvent event,
                  PyDictObject *mp,
                  TyObject *key,
                  TyObject *value)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    for (int i = 0; i < DICT_MAX_WATCHERS; i++) {
        if (watcher_bits & 1) {
            TyDict_WatchCallback cb = interp->dict_state.watchers[i];
            if (cb && (cb(event, (TyObject*)mp, key, value) < 0)) {
                // We don't want to resurrect the dict by potentially having an
                // unraisablehook keep a reference to it, so we don't pass the
                // dict as context, just an informative string message.  Dict
                // repr can call arbitrary code, so we invent a simpler version.
                TyErr_FormatUnraisable(
                    "Exception ignored in %s watcher callback for <dict at %p>",
                    dict_event_name(event), mp);
            }
        }
        watcher_bits >>= 1;
    }
}

#ifndef NDEBUG
static int
_TyObject_InlineValuesConsistencyCheck(TyObject *obj)
{
    if ((Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES) == 0) {
        return 1;
    }
    assert(Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_MANAGED_DICT);
    PyDictObject *dict = _TyObject_GetManagedDict(obj);
    if (dict == NULL) {
        return 1;
    }
    if (dict->ma_values == _TyObject_InlineValues(obj) ||
        _TyObject_InlineValues(obj)->valid == 0) {
        return 1;
    }
    assert(0);
    return 0;
}
#endif
