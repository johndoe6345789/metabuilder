#ifndef Ty_INTERNAL_HAMT_H
#define Ty_INTERNAL_HAMT_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include "pycore_structs.h"       // PyHamtNode

/*
HAMT tree is shaped by hashes of keys. Every group of 5 bits of a hash denotes
the exact position of the key in one level of the tree. Since we're using
32 bit hashes, we can have at most 7 such levels. Although if there are
two distinct keys with equal hashes, they will have to occupy the same
cell in the 7th level of the tree -- so we'd put them in a "collision" node.
Which brings the total possible tree depth to 8. Read more about the actual
layout of the HAMT tree in `hamt.c`.

This constant is used to define a datastucture for storing iteration state.
*/
#define _Ty_HAMT_MAX_TREE_DEPTH 8


extern TyTypeObject _TyHamt_Type;
extern TyTypeObject _TyHamt_ArrayNode_Type;
extern TyTypeObject _TyHamt_BitmapNode_Type;
extern TyTypeObject _TyHamt_CollisionNode_Type;
extern TyTypeObject _PyHamtKeys_Type;
extern TyTypeObject _PyHamtValues_Type;
extern TyTypeObject _PyHamtItems_Type;


/* other API */

#define PyHamt_Check(o) Ty_IS_TYPE((o), &_TyHamt_Type)


/* A struct to hold the state of depth-first traverse of the tree.

   HAMT is an immutable collection.  Iterators will hold a strong reference
   to it, and every node in the HAMT has strong references to its children.

   So for iterators, we can implement zero allocations and zero reference
   inc/dec depth-first iteration.

   - i_nodes: an array of seven pointers to tree nodes
   - i_level: the current node in i_nodes
   - i_pos: an array of positions within nodes in i_nodes.
*/
typedef struct {
    PyHamtNode *i_nodes[_Ty_HAMT_MAX_TREE_DEPTH];
    Ty_ssize_t i_pos[_Ty_HAMT_MAX_TREE_DEPTH];
    int8_t i_level;
} PyHamtIteratorState;


/* Base iterator object.

   Contains the iteration state, a pointer to the HAMT tree,
   and a pointer to the 'yield function'.  The latter is a simple
   function that returns a key/value tuple for the 'Items' iterator,
   just a key for the 'Keys' iterator, and a value for the 'Values'
   iterator.
*/
typedef struct {
    PyObject_HEAD
    PyHamtObject *hi_obj;
    PyHamtIteratorState hi_iter;
    binaryfunc hi_yield;
} PyHamtIterator;


/* Create a new HAMT immutable mapping. */
PyHamtObject * _TyHamt_New(void);

/* Return a new collection based on "o", but with an additional
   key/val pair. */
PyHamtObject * _TyHamt_Assoc(PyHamtObject *o, TyObject *key, TyObject *val);

/* Return a new collection based on "o", but without "key". */
PyHamtObject * _TyHamt_Without(PyHamtObject *o, TyObject *key);

/* Find "key" in the "o" collection.

   Return:
   - -1: An error occurred.
   - 0: "key" wasn't found in "o".
   - 1: "key" is in "o"; "*val" is set to its value (a borrowed ref).
*/
int _TyHamt_Find(PyHamtObject *o, TyObject *key, TyObject **val);

/* Check if "v" is equal to "w".

   Return:
   - 0: v != w
   - 1: v == w
   - -1: An error occurred.
*/
int _TyHamt_Eq(PyHamtObject *v, PyHamtObject *w);

/* Return the size of "o"; equivalent of "len(o)". */
Ty_ssize_t _TyHamt_Len(PyHamtObject *o);

/* Return a Keys iterator over "o". */
TyObject * _TyHamt_NewIterKeys(PyHamtObject *o);

/* Return a Values iterator over "o". */
TyObject * _TyHamt_NewIterValues(PyHamtObject *o);

/* Return a Items iterator over "o". */
TyObject * _TyHamt_NewIterItems(PyHamtObject *o);

#endif /* !Ty_INTERNAL_HAMT_H */
