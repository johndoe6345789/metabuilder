/*--------------------------------------------------------------------
 * Licensed to PSF under a Contributor Agreement.
 * See https://www.python.org/psf/license for licensing details.
 *
 * _elementtree - C accelerator for xml.etree.ElementTree
 * Copyright (c) 1999-2009 by Secret Labs AB.  All rights reserved.
 * Copyright (c) 1999-2009 by Fredrik Lundh.
 *
 * info@pythonware.com
 * http://www.pythonware.com
 *--------------------------------------------------------------------
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_pyhash.h"        // _Ty_HashSecret
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include <stddef.h>               // offsetof()
#include "expat.h"
#include "pyexpat.h"

/* -------------------------------------------------------------------- */
/* configuration */

/* An element can hold this many children without extra memory
   allocations. */
#define STATIC_CHILDREN 4

/* For best performance, chose a value so that 80-90% of all nodes
   have no more than the given number of children.  Set this to zero
   to minimize the size of the element structure itself (this only
   helps if you have lots of leaf nodes with attributes). */

/* Also note that pymalloc always allocates blocks in multiples of
   eight bytes.  For the current C version of ElementTree, this means
   that the number of children should be an even number, at least on
   32-bit platforms. */

/* -------------------------------------------------------------------- */

/* compiler tweaks */
#if defined(_MSC_VER)
#define LOCAL(type) static __inline type __fastcall
#else
#define LOCAL(type) static type
#endif

/* macros used to store 'join' flags in string object pointers.  note
   that all use of text and tail as object pointers must be wrapped in
   JOIN_OBJ.  see comments in the ElementObject definition for more
   info. */
#define JOIN_GET(p) ((uintptr_t) (p) & 1)
#define JOIN_SET(p, flag) ((void*) ((uintptr_t) (JOIN_OBJ(p)) | (flag)))
#define JOIN_OBJ(p) ((TyObject*) ((uintptr_t) (p) & ~(uintptr_t)1))

/* Ty_SETREF for a TyObject* that uses a join flag. */
Ty_LOCAL_INLINE(void)
_set_joined_ptr(TyObject **p, TyObject *new_joined_ptr)
{
    TyObject *tmp = JOIN_OBJ(*p);
    *p = new_joined_ptr;
    Ty_DECREF(tmp);
}

/* Ty_CLEAR for a TyObject* that uses a join flag. Pass the pointer by
 * reference since this function sets it to NULL.
*/
static void _clear_joined_ptr(TyObject **p)
{
    if (*p) {
        _set_joined_ptr(p, NULL);
    }
}

/* Per-module state; PEP 3121 */
typedef struct {
    TyObject *parseerror_obj;
    TyObject *deepcopy_obj;
    TyObject *elementpath_obj;
    TyObject *comment_factory;
    TyObject *pi_factory;
    /* Interned strings */
    TyObject *str_text;
    TyObject *str_tail;
    TyObject *str_append;
    TyObject *str_find;
    TyObject *str_findtext;
    TyObject *str_findall;
    TyObject *str_iterfind;
    TyObject *str_doctype;
    /* Types defined by this extension */
    TyTypeObject *Element_Type;
    TyTypeObject *ElementIter_Type;
    TyTypeObject *TreeBuilder_Type;
    TyTypeObject *XMLParser_Type;

    TyObject *expat_capsule;
    struct PyExpat_CAPI *expat_capi;
} elementtreestate;

static struct TyModuleDef elementtreemodule;

/* Given a module object (assumed to be _elementtree), get its per-module
 * state.
 */
static inline elementtreestate*
get_elementtree_state(TyObject *module)
{
    void *state = TyModule_GetState(module);
    assert(state != NULL);
    return (elementtreestate *)state;
}

static inline elementtreestate *
get_elementtree_state_by_cls(TyTypeObject *cls)
{
    void *state = TyType_GetModuleState(cls);
    assert(state != NULL);
    return (elementtreestate *)state;
}

static inline elementtreestate *
get_elementtree_state_by_type(TyTypeObject *tp)
{
    TyObject *mod = TyType_GetModuleByDef(tp, &elementtreemodule);
    assert(mod != NULL);
    return get_elementtree_state(mod);
}

static int
elementtree_clear(TyObject *m)
{
    elementtreestate *st = get_elementtree_state(m);
    Ty_CLEAR(st->parseerror_obj);
    Ty_CLEAR(st->deepcopy_obj);
    Ty_CLEAR(st->elementpath_obj);
    Ty_CLEAR(st->comment_factory);
    Ty_CLEAR(st->pi_factory);

    // Interned strings
    Ty_CLEAR(st->str_append);
    Ty_CLEAR(st->str_find);
    Ty_CLEAR(st->str_findall);
    Ty_CLEAR(st->str_findtext);
    Ty_CLEAR(st->str_iterfind);
    Ty_CLEAR(st->str_tail);
    Ty_CLEAR(st->str_text);
    Ty_CLEAR(st->str_doctype);

    // Heap types
    Ty_CLEAR(st->Element_Type);
    Ty_CLEAR(st->ElementIter_Type);
    Ty_CLEAR(st->TreeBuilder_Type);
    Ty_CLEAR(st->XMLParser_Type);
    Ty_CLEAR(st->expat_capsule);

    st->expat_capi = NULL;
    return 0;
}

static int
elementtree_traverse(TyObject *m, visitproc visit, void *arg)
{
    elementtreestate *st = get_elementtree_state(m);
    Ty_VISIT(st->parseerror_obj);
    Ty_VISIT(st->deepcopy_obj);
    Ty_VISIT(st->elementpath_obj);
    Ty_VISIT(st->comment_factory);
    Ty_VISIT(st->pi_factory);

    // Heap types
    Ty_VISIT(st->Element_Type);
    Ty_VISIT(st->ElementIter_Type);
    Ty_VISIT(st->TreeBuilder_Type);
    Ty_VISIT(st->XMLParser_Type);
    Ty_VISIT(st->expat_capsule);
    return 0;
}

static void
elementtree_free(void *m)
{
    (void)elementtree_clear((TyObject *)m);
}

/* helpers */

LOCAL(TyObject*)
list_join(TyObject* list)
{
    /* join list elements */
    TyObject* joiner;
    TyObject* result;

    joiner = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    if (!joiner)
        return NULL;
    result = TyUnicode_Join(joiner, list);
    Ty_DECREF(joiner);
    return result;
}

/* Is the given object an empty dictionary?
*/
static int
is_empty_dict(TyObject *obj)
{
    return TyDict_CheckExact(obj) && TyDict_GET_SIZE(obj) == 0;
}


/* -------------------------------------------------------------------- */
/* the Element type */

typedef struct {

    /* attributes (a dictionary object), or NULL if no attributes */
    TyObject* attrib;

    /* child elements */
    Ty_ssize_t length; /* actual number of items */
    Ty_ssize_t allocated; /* allocated items */

    /* this either points to _children or to a malloced buffer */
    TyObject* *children;

    TyObject* _children[STATIC_CHILDREN];

} ElementObjectExtra;

typedef struct {
    PyObject_HEAD

    /* element tag (a string). */
    TyObject* tag;

    /* text before first child.  note that this is a tagged pointer;
       use JOIN_OBJ to get the object pointer.  the join flag is used
       to distinguish lists created by the tree builder from lists
       assigned to the attribute by application code; the former
       should be joined before being returned to the user, the latter
       should be left intact. */
    TyObject* text;

    /* text after this element, in parent.  note that this is a tagged
       pointer; use JOIN_OBJ to get the object pointer. */
    TyObject* tail;

    ElementObjectExtra* extra;

    TyObject *weakreflist; /* For tp_weaklistoffset */

} ElementObject;


#define _Element_CAST(op) ((ElementObject *)(op))
#define Element_CheckExact(st, op) Ty_IS_TYPE(op, (st)->Element_Type)
#define Element_Check(st, op) PyObject_TypeCheck(op, (st)->Element_Type)


/* -------------------------------------------------------------------- */
/* Element constructors and destructor */

LOCAL(int)
create_extra(ElementObject* self, TyObject* attrib)
{
    self->extra = TyMem_Malloc(sizeof(ElementObjectExtra));
    if (!self->extra) {
        TyErr_NoMemory();
        return -1;
    }

    self->extra->attrib = Ty_XNewRef(attrib);

    self->extra->length = 0;
    self->extra->allocated = STATIC_CHILDREN;
    self->extra->children = self->extra->_children;

    return 0;
}

LOCAL(void)
dealloc_extra(ElementObjectExtra *extra)
{
    Ty_ssize_t i;

    if (!extra)
        return;

    Ty_XDECREF(extra->attrib);

    for (i = 0; i < extra->length; i++)
        Ty_DECREF(extra->children[i]);

    if (extra->children != extra->_children) {
        TyMem_Free(extra->children);
    }

    TyMem_Free(extra);
}

LOCAL(void)
clear_extra(ElementObject* self)
{
    ElementObjectExtra *myextra;

    if (!self->extra)
        return;

    /* Avoid DECREFs calling into this code again (cycles, etc.)
    */
    myextra = self->extra;
    self->extra = NULL;

    dealloc_extra(myextra);
}

/* Convenience internal function to create new Element objects with the given
 * tag and attributes.
*/
LOCAL(TyObject*)
create_new_element(elementtreestate *st, TyObject *tag, TyObject *attrib)
{
    ElementObject* self;

    self = PyObject_GC_New(ElementObject, st->Element_Type);
    if (self == NULL)
        return NULL;
    self->extra = NULL;
    self->tag = Ty_NewRef(tag);
    self->text = Ty_NewRef(Ty_None);
    self->tail = Ty_NewRef(Ty_None);
    self->weakreflist = NULL;

    PyObject_GC_Track(self);

    if (attrib != NULL && !is_empty_dict(attrib)) {
        if (create_extra(self, attrib) < 0) {
            Ty_DECREF(self);
            return NULL;
        }
    }

    return (TyObject*) self;
}

static TyObject *
element_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    ElementObject *e = (ElementObject *)type->tp_alloc(type, 0);
    if (e != NULL) {
        e->tag = Ty_NewRef(Ty_None);
        e->text = Ty_NewRef(Ty_None);
        e->tail = Ty_NewRef(Ty_None);
        e->extra = NULL;
        e->weakreflist = NULL;
    }
    return (TyObject *)e;
}

/* Helper function for extracting the attrib dictionary from a keywords dict.
 * This is required by some constructors/functions in this module that can
 * either accept attrib as a keyword argument or all attributes splashed
 * directly into *kwds.
 *
 * Return a dictionary with the content of kwds merged into the content of
 * attrib. If there is no attrib keyword, return a copy of kwds.
 */
static TyObject*
get_attrib_from_keywords(TyObject *kwds)
{
    TyObject *attrib;
    if (TyDict_PopString(kwds, "attrib", &attrib) < 0) {
        return NULL;
    }

    if (attrib) {
        /* If attrib was found in kwds, copy its value and remove it from
         * kwds
         */
        if (!TyDict_Check(attrib)) {
            TyErr_Format(TyExc_TypeError, "attrib must be dict, not %.100s",
                         Ty_TYPE(attrib)->tp_name);
            Ty_DECREF(attrib);
            return NULL;
        }
        Ty_SETREF(attrib, TyDict_Copy(attrib));
    }
    else {
        attrib = TyDict_New();
    }

    if (attrib != NULL && TyDict_Update(attrib, kwds) < 0) {
        Ty_DECREF(attrib);
        return NULL;
    }
    return attrib;
}

/*[clinic input]
module _elementtree
class _elementtree.Element "ElementObject *" "clinic_state()->Element_Type"
class _elementtree.TreeBuilder "TreeBuilderObject *" "clinic_state()->TreeBuilder_Type"
class _elementtree.XMLParser "XMLParserObject *" "clinic_state()->XMLParser_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=6c83ea832d2b0ef1]*/

static int
element_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyObject *tag;
    TyObject *attrib = NULL;
    ElementObject *self_elem;

    if (!TyArg_ParseTuple(args, "O|O!:Element", &tag, &TyDict_Type, &attrib))
        return -1;

    if (attrib) {
        /* attrib passed as positional arg */
        attrib = TyDict_Copy(attrib);
        if (!attrib)
            return -1;
        if (kwds) {
            if (TyDict_Update(attrib, kwds) < 0) {
                Ty_DECREF(attrib);
                return -1;
            }
        }
    } else if (kwds) {
        /* have keywords args */
        attrib = get_attrib_from_keywords(kwds);
        if (!attrib)
            return -1;
    }

    self_elem = (ElementObject *)self;

    if (attrib != NULL && !is_empty_dict(attrib)) {
        if (create_extra(self_elem, attrib) < 0) {
            Ty_DECREF(attrib);
            return -1;
        }
    }

    /* We own a reference to attrib here and it's no longer needed. */
    Ty_XDECREF(attrib);

    /* Replace the objects already pointed to by tag, text and tail. */
    Ty_XSETREF(self_elem->tag, Ty_NewRef(tag));

    _set_joined_ptr(&self_elem->text, Ty_NewRef(Ty_None));
    _set_joined_ptr(&self_elem->tail, Ty_NewRef(Ty_None));

    return 0;
}

LOCAL(int)
element_resize(ElementObject* self, Ty_ssize_t extra)
{
    Ty_ssize_t size;
    TyObject* *children;

    assert(extra >= 0);
    /* make sure self->children can hold the given number of extra
       elements.  set an exception and return -1 if allocation failed */

    if (!self->extra) {
        if (create_extra(self, NULL) < 0)
            return -1;
    }

    size = self->extra->length + extra;  /* never overflows */

    if (size > self->extra->allocated) {
        /* use Python 2.4's list growth strategy */
        size = (size >> 3) + (size < 9 ? 3 : 6) + size;
        /* Coverity CID #182 size_error: Allocating 1 bytes to pointer "children"
         * which needs at least 4 bytes.
         * Although it's a false alarm always assume at least one child to
         * be safe.
         */
        size = size ? size : 1;
        if ((size_t)size > PY_SSIZE_T_MAX/sizeof(TyObject*))
            goto nomemory;
        if (self->extra->children != self->extra->_children) {
            /* Coverity CID #182 size_error: Allocating 1 bytes to pointer
             * "children", which needs at least 4 bytes. Although it's a
             * false alarm always assume at least one child to be safe.
             */
            children = TyMem_Realloc(self->extra->children,
                                     size * sizeof(TyObject*));
            if (!children) {
                goto nomemory;
            }
        } else {
            children = TyMem_Malloc(size * sizeof(TyObject*));
            if (!children) {
                goto nomemory;
            }
            /* copy existing children from static area to malloc buffer */
            memcpy(children, self->extra->children,
                   self->extra->length * sizeof(TyObject*));
        }
        self->extra->children = children;
        self->extra->allocated = size;
    }

    return 0;

  nomemory:
    TyErr_NoMemory();
    return -1;
}

LOCAL(void)
raise_type_error(TyObject *element)
{
    TyErr_Format(TyExc_TypeError,
                 "expected an Element, not \"%.200s\"",
                 Ty_TYPE(element)->tp_name);
}

LOCAL(int)
element_add_subelement(elementtreestate *st, ElementObject *self,
                       TyObject *element)
{
    /* add a child element to a parent */
    if (!Element_Check(st, element)) {
        raise_type_error(element);
        return -1;
    }

    if (element_resize(self, 1) < 0)
        return -1;

    self->extra->children[self->extra->length] = Ty_NewRef(element);

    self->extra->length++;

    return 0;
}

LOCAL(TyObject*)
element_get_attrib(ElementObject* self)
{
    /* return borrowed reference to attrib dictionary */
    /* note: this function assumes that the extra section exists */

    TyObject* res = self->extra->attrib;

    if (!res) {
        /* create missing dictionary */
        res = self->extra->attrib = TyDict_New();
    }

    return res;
}

LOCAL(TyObject*)
element_get_text(ElementObject* self)
{
    /* return borrowed reference to text attribute */

    TyObject *res = self->text;

    if (JOIN_GET(res)) {
        res = JOIN_OBJ(res);
        if (TyList_CheckExact(res)) {
            TyObject *tmp = list_join(res);
            if (!tmp)
                return NULL;
            self->text = tmp;
            Ty_SETREF(res, tmp);
        }
    }

    return res;
}

LOCAL(TyObject*)
element_get_tail(ElementObject* self)
{
    /* return borrowed reference to text attribute */

    TyObject *res = self->tail;

    if (JOIN_GET(res)) {
        res = JOIN_OBJ(res);
        if (TyList_CheckExact(res)) {
            TyObject *tmp = list_join(res);
            if (!tmp)
                return NULL;
            self->tail = tmp;
            Ty_SETREF(res, tmp);
        }
    }

    return res;
}

static TyObject*
subelement(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyObject* elem;

    elementtreestate *st = get_elementtree_state(self);
    ElementObject* parent;
    TyObject* tag;
    TyObject* attrib = NULL;
    if (!TyArg_ParseTuple(args, "O!O|O!:SubElement",
                          st->Element_Type, &parent, &tag,
                          &TyDict_Type, &attrib)) {
        return NULL;
    }

    if (attrib) {
        /* attrib passed as positional arg */
        attrib = TyDict_Copy(attrib);
        if (!attrib)
            return NULL;
        if (kwds != NULL && TyDict_Update(attrib, kwds) < 0) {
            Ty_DECREF(attrib);
            return NULL;
        }
    } else if (kwds) {
        /* have keyword args */
        attrib = get_attrib_from_keywords(kwds);
        if (!attrib)
            return NULL;
    } else {
        /* no attrib arg, no kwds, so no attribute */
    }

    elem = create_new_element(st, tag, attrib);
    Ty_XDECREF(attrib);
    if (elem == NULL)
        return NULL;

    if (element_add_subelement(st, parent, elem) < 0) {
        Ty_DECREF(elem);
        return NULL;
    }

    return elem;
}

static int
element_gc_traverse(TyObject *op, visitproc visit, void *arg)
{
    ElementObject *self = _Element_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->tag);
    Ty_VISIT(JOIN_OBJ(self->text));
    Ty_VISIT(JOIN_OBJ(self->tail));

    if (self->extra) {
        Ty_ssize_t i;
        Ty_VISIT(self->extra->attrib);

        for (i = 0; i < self->extra->length; ++i)
            Ty_VISIT(self->extra->children[i]);
    }
    return 0;
}

static int
element_gc_clear(TyObject *op)
{
    ElementObject *self = _Element_CAST(op);
    Ty_CLEAR(self->tag);
    _clear_joined_ptr(&self->text);
    _clear_joined_ptr(&self->tail);

    /* After dropping all references from extra, it's no longer valid anyway,
     * so fully deallocate it.
    */
    clear_extra(self);
    return 0;
}

static void
element_dealloc(TyObject *op)
{
    ElementObject *self = _Element_CAST(op);
    TyTypeObject *tp = Ty_TYPE(self);

    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(self);

    FT_CLEAR_WEAKREFS(op, self->weakreflist);

    /* element_gc_clear clears all references and deallocates extra
    */
    (void)element_gc_clear(op);

    tp->tp_free(self);
    Ty_DECREF(tp);
}

/* -------------------------------------------------------------------- */

/*[clinic input]
_elementtree.Element.append

    cls: defining_class
    subelement: object(subclass_of='clinic_state()->Element_Type')
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_append_impl(ElementObject *self, TyTypeObject *cls,
                                 TyObject *subelement)
/*[clinic end generated code: output=d00923711ea317fc input=8baf92679f9717b8]*/
{
    elementtreestate *st = get_elementtree_state_by_cls(cls);
    if (element_add_subelement(st, self, subelement) < 0)
        return NULL;

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.Element.clear

[clinic start generated code]*/

static TyObject *
_elementtree_Element_clear_impl(ElementObject *self)
/*[clinic end generated code: output=8bcd7a51f94cfff6 input=3c719ff94bf45dd6]*/
{
    clear_extra(self);

    _set_joined_ptr(&self->text, Ty_NewRef(Ty_None));
    _set_joined_ptr(&self->tail, Ty_NewRef(Ty_None));

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.Element.__copy__

    cls: defining_class
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element___copy___impl(ElementObject *self, TyTypeObject *cls)
/*[clinic end generated code: output=da22894421ff2b36 input=91edb92d9f441213]*/
{
    Ty_ssize_t i;
    ElementObject* element;
    elementtreestate *st = get_elementtree_state_by_cls(cls);

    element = (ElementObject*) create_new_element(
        st, self->tag, self->extra ? self->extra->attrib : NULL);
    if (!element)
        return NULL;

    Ty_INCREF(JOIN_OBJ(self->text));
    _set_joined_ptr(&element->text, self->text);

    Ty_INCREF(JOIN_OBJ(self->tail));
    _set_joined_ptr(&element->tail, self->tail);

    assert(!element->extra || !element->extra->length);
    if (self->extra) {
        if (element_resize(element, self->extra->length) < 0) {
            Ty_DECREF(element);
            return NULL;
        }

        for (i = 0; i < self->extra->length; i++) {
            element->extra->children[i] = Ty_NewRef(self->extra->children[i]);
        }

        assert(!element->extra->length);
        element->extra->length = self->extra->length;
    }

    return (TyObject*) element;
}

/* Helper for a deep copy. */
LOCAL(TyObject *) deepcopy(elementtreestate *, TyObject *, TyObject *);

/*[clinic input]
_elementtree.Element.__deepcopy__

    memo: object(subclass_of="&TyDict_Type")
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element___deepcopy___impl(ElementObject *self, TyObject *memo)
/*[clinic end generated code: output=eefc3df50465b642 input=a2d40348c0aade10]*/
{
    Ty_ssize_t i;
    ElementObject* element;
    TyObject* tag;
    TyObject* attrib;
    TyObject* text;
    TyObject* tail;
    TyObject* id;

    TyTypeObject *tp = Ty_TYPE(self);
    elementtreestate *st = get_elementtree_state_by_type(tp);
    // The deepcopy() helper takes care of incrementing the refcount
    // of the object to copy so to avoid use-after-frees.
    tag = deepcopy(st, self->tag, memo);
    if (!tag)
        return NULL;

    if (self->extra && self->extra->attrib) {
        attrib = deepcopy(st, self->extra->attrib, memo);
        if (!attrib) {
            Ty_DECREF(tag);
            return NULL;
        }
    } else {
        attrib = NULL;
    }

    element = (ElementObject*) create_new_element(st, tag, attrib);

    Ty_DECREF(tag);
    Ty_XDECREF(attrib);

    if (!element)
        return NULL;

    text = deepcopy(st, JOIN_OBJ(self->text), memo);
    if (!text)
        goto error;
    _set_joined_ptr(&element->text, JOIN_SET(text, JOIN_GET(self->text)));

    tail = deepcopy(st, JOIN_OBJ(self->tail), memo);
    if (!tail)
        goto error;
    _set_joined_ptr(&element->tail, JOIN_SET(tail, JOIN_GET(self->tail)));

    assert(!element->extra || !element->extra->length);
    if (self->extra) {
        Ty_ssize_t expected_count = self->extra->length;
        if (element_resize(element, expected_count) < 0) {
            assert(!element->extra->length);
            goto error;
        }

        for (i = 0; self->extra && i < self->extra->length; i++) {
            TyObject* child = deepcopy(st, self->extra->children[i], memo);
            if (!child || !Element_Check(st, child)) {
                if (child) {
                    raise_type_error(child);
                    Ty_DECREF(child);
                }
                element->extra->length = i;
                goto error;
            }
            if (self->extra && expected_count != self->extra->length) {
                // 'self->extra' got mutated and 'element' may not have
                // sufficient space to hold the next iteration's item.
                expected_count = self->extra->length;
                if (element_resize(element, expected_count) < 0) {
                    Ty_DECREF(child);
                    element->extra->length = i;
                    goto error;
                }
            }
            element->extra->children[i] = child;
        }

        assert(!element->extra->length);
        // The original 'self->extra' may be gone at this point if deepcopy()
        // has side-effects. However, 'i' is the number of copied items that
        // we were able to successfully copy.
        element->extra->length = i;
    }

    /* add object to memo dictionary (so deepcopy won't visit it again) */
    id = TyLong_FromSsize_t((uintptr_t) self);
    if (!id)
        goto error;

    i = TyDict_SetItem(memo, id, (TyObject*) element);

    Ty_DECREF(id);

    if (i < 0)
        goto error;

    return (TyObject*) element;

  error:
    Ty_DECREF(element);
    return NULL;
}

LOCAL(TyObject *)
deepcopy(elementtreestate *st, TyObject *object, TyObject *memo)
{
    /* do a deep copy of the given object */

    /* Fast paths */
    if (object == Ty_None || TyUnicode_CheckExact(object)) {
        return Ty_NewRef(object);
    }

    if (Ty_REFCNT(object) == 1) {
        if (TyDict_CheckExact(object)) {
            TyObject *key, *value;
            Ty_ssize_t pos = 0;
            int simple = 1;
            while (TyDict_Next(object, &pos, &key, &value)) {
                if (!TyUnicode_CheckExact(key) || !TyUnicode_CheckExact(value)) {
                    simple = 0;
                    break;
                }
            }
            if (simple) {
                return TyDict_Copy(object);
            }
            /* Fall through to general case */
        }
        else if (Element_CheckExact(st, object)) {
            // The __deepcopy__() call may call arbitrary code even if the
            // object to copy is a built-in XML element (one of its children
            // any of its parents in its own __deepcopy__() implementation).
            Ty_INCREF(object);
            TyObject *res = _elementtree_Element___deepcopy___impl(
                (ElementObject *)object, memo);
            Ty_DECREF(object);
            return res;
        }
    }

    /* General case */
    if (!st->deepcopy_obj) {
        TyErr_SetString(TyExc_RuntimeError,
                        "deepcopy helper not found");
        return NULL;
    }

    Ty_INCREF(object);
    TyObject *args[2] = {object, memo};
    TyObject *res = PyObject_Vectorcall(st->deepcopy_obj, args, 2, NULL);
    Ty_DECREF(object);
    return res;
}


/*[clinic input]
_elementtree.Element.__sizeof__ -> size_t

[clinic start generated code]*/

static size_t
_elementtree_Element___sizeof___impl(ElementObject *self)
/*[clinic end generated code: output=baae4e7ae9fe04ec input=54e298c501f3e0d0]*/
{
    size_t result = _TyObject_SIZE(Ty_TYPE(self));
    if (self->extra) {
        result += sizeof(ElementObjectExtra);
        if (self->extra->children != self->extra->_children) {
            result += (size_t)self->extra->allocated * sizeof(TyObject*);
        }
    }
    return result;
}

/* dict keys for getstate/setstate. */
#define PICKLED_TAG "tag"
#define PICKLED_CHILDREN "_children"
#define PICKLED_ATTRIB "attrib"
#define PICKLED_TAIL "tail"
#define PICKLED_TEXT "text"

/* __getstate__ returns a fabricated instance dict as in the pure-Python
 * Element implementation, for interoperability/interchangeability.  This
 * makes the pure-Python implementation details an API, but (a) there aren't
 * any unnecessary structures there; and (b) it buys compatibility with 3.2
 * pickles.  See issue #16076.
 */
/*[clinic input]
_elementtree.Element.__getstate__

[clinic start generated code]*/

static TyObject *
_elementtree_Element___getstate___impl(ElementObject *self)
/*[clinic end generated code: output=37279aeeb6bb5b04 input=f0d16d7ec2f7adc1]*/
{
    Ty_ssize_t i;
    TyObject *children, *attrib;

    /* Build a list of children. */
    children = TyList_New(self->extra ? self->extra->length : 0);
    if (!children)
        return NULL;
    for (i = 0; i < TyList_GET_SIZE(children); i++) {
        TyObject *child = Ty_NewRef(self->extra->children[i]);
        TyList_SET_ITEM(children, i, child);
    }

    if (self->extra && self->extra->attrib) {
        attrib = Ty_NewRef(self->extra->attrib);
    }
    else {
        attrib = TyDict_New();
        if (!attrib) {
            Ty_DECREF(children);
            return NULL;
        }
    }

    return Ty_BuildValue("{sOsNsNsOsO}",
                         PICKLED_TAG, self->tag,
                         PICKLED_CHILDREN, children,
                         PICKLED_ATTRIB, attrib,
                         PICKLED_TEXT, JOIN_OBJ(self->text),
                         PICKLED_TAIL, JOIN_OBJ(self->tail));
}

static TyObject *
element_setstate_from_attributes(elementtreestate *st,
                                 ElementObject *self,
                                 TyObject *tag,
                                 TyObject *attrib,
                                 TyObject *text,
                                 TyObject *tail,
                                 TyObject *children)
{
    Ty_ssize_t i, nchildren;
    ElementObjectExtra *oldextra = NULL;

    if (!tag) {
        TyErr_SetString(TyExc_TypeError, "tag may not be NULL");
        return NULL;
    }

    Ty_XSETREF(self->tag, Ty_NewRef(tag));

    text = text ? JOIN_SET(text, TyList_CheckExact(text)) : Ty_None;
    Ty_INCREF(JOIN_OBJ(text));
    _set_joined_ptr(&self->text, text);

    tail = tail ? JOIN_SET(tail, TyList_CheckExact(tail)) : Ty_None;
    Ty_INCREF(JOIN_OBJ(tail));
    _set_joined_ptr(&self->tail, tail);

    /* Handle ATTRIB and CHILDREN. */
    if (!children && !attrib) {
        Py_RETURN_NONE;
    }

    /* Compute 'nchildren'. */
    if (children) {
        if (!TyList_Check(children)) {
            TyErr_SetString(TyExc_TypeError, "'_children' is not a list");
            return NULL;
        }
        nchildren = TyList_GET_SIZE(children);

        /* (Re-)allocate 'extra'.
           Avoid DECREFs calling into this code again (cycles, etc.)
         */
        oldextra = self->extra;
        self->extra = NULL;
        if (element_resize(self, nchildren)) {
            assert(!self->extra || !self->extra->length);
            clear_extra(self);
            self->extra = oldextra;
            return NULL;
        }
        assert(self->extra);
        assert(self->extra->allocated >= nchildren);
        if (oldextra) {
            assert(self->extra->attrib == NULL);
            self->extra->attrib = oldextra->attrib;
            oldextra->attrib = NULL;
        }

        /* Copy children */
        for (i = 0; i < nchildren; i++) {
            TyObject *child = TyList_GET_ITEM(children, i);
            if (!Element_Check(st, child)) {
                raise_type_error(child);
                self->extra->length = i;
                dealloc_extra(oldextra);
                return NULL;
            }
            self->extra->children[i] = Ty_NewRef(child);
        }

        assert(!self->extra->length);
        self->extra->length = nchildren;
    }
    else {
        if (element_resize(self, 0)) {
            return NULL;
        }
    }

    /* Stash attrib. */
    Ty_XSETREF(self->extra->attrib, Ty_XNewRef(attrib));
    dealloc_extra(oldextra);

    Py_RETURN_NONE;
}

/* __setstate__ for Element instance from the Python implementation.
 * 'state' should be the instance dict.
 */

static TyObject *
element_setstate_from_Python(elementtreestate *st, ElementObject *self,
                             TyObject *state)
{
    static char *kwlist[] = {PICKLED_TAG, PICKLED_ATTRIB, PICKLED_TEXT,
                             PICKLED_TAIL, PICKLED_CHILDREN, 0};
    TyObject *args;
    TyObject *tag, *attrib, *text, *tail, *children;
    TyObject *retval;

    tag = attrib = text = tail = children = NULL;
    args = TyTuple_New(0);
    if (!args)
        return NULL;

    if (TyArg_ParseTupleAndKeywords(args, state, "|$OOOOO", kwlist, &tag,
                                    &attrib, &text, &tail, &children))
        retval = element_setstate_from_attributes(st, self, tag, attrib, text,
                                                  tail, children);
    else
        retval = NULL;

    Ty_DECREF(args);
    return retval;
}

/*[clinic input]
_elementtree.Element.__setstate__

    cls: defining_class
    state: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element___setstate___impl(ElementObject *self,
                                       TyTypeObject *cls, TyObject *state)
/*[clinic end generated code: output=598bfb5730f71509 input=13830488d35d51f7]*/
{
    if (!TyDict_CheckExact(state)) {
        TyErr_Format(TyExc_TypeError,
                     "Don't know how to unpickle \"%.200R\" as an Element",
                     state);
        return NULL;
    }
    else {
        elementtreestate *st = get_elementtree_state_by_cls(cls);
        return element_setstate_from_Python(st, self, state);
    }
}

LOCAL(int)
checkpath(TyObject* tag)
{
    Ty_ssize_t i;
    int check = 1;

    /* check if a tag contains an xpath character */

#define PATHCHAR(ch) \
    (ch == '/' || ch == '*' || ch == '[' || ch == '@' || ch == '.')

    if (TyUnicode_Check(tag)) {
        const Ty_ssize_t len = TyUnicode_GET_LENGTH(tag);
        const void *data = TyUnicode_DATA(tag);
        int kind = TyUnicode_KIND(tag);
        if (len >= 3 && TyUnicode_READ(kind, data, 0) == '{' && (
                TyUnicode_READ(kind, data, 1) == '}' || (
                TyUnicode_READ(kind, data, 1) == '*' &&
                TyUnicode_READ(kind, data, 2) == '}'))) {
            /* wildcard: '{}tag' or '{*}tag' */
            return 1;
        }
        for (i = 0; i < len; i++) {
            Ty_UCS4 ch = TyUnicode_READ(kind, data, i);
            if (ch == '{')
                check = 0;
            else if (ch == '}')
                check = 1;
            else if (check && PATHCHAR(ch))
                return 1;
        }
        return 0;
    }
    if (TyBytes_Check(tag)) {
        const char *p = TyBytes_AS_STRING(tag);
        const Ty_ssize_t len = TyBytes_GET_SIZE(tag);
        if (len >= 3 && p[0] == '{' && (
                p[1] == '}' || (p[1] == '*' && p[2] == '}'))) {
            /* wildcard: '{}tag' or '{*}tag' */
            return 1;
        }
        for (i = 0; i < len; i++) {
            if (p[i] == '{')
                check = 0;
            else if (p[i] == '}')
                check = 1;
            else if (check && PATHCHAR(p[i]))
                return 1;
        }
        return 0;
    }

    return 1; /* unknown type; might be path expression */
}

/*[clinic input]
_elementtree.Element.extend

    cls: defining_class
    elements: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_extend_impl(ElementObject *self, TyTypeObject *cls,
                                 TyObject *elements)
/*[clinic end generated code: output=3e86d37fac542216 input=6479b1b5379d09ae]*/
{
    TyObject* seq;
    Ty_ssize_t i;

    seq = PySequence_Fast(elements, "'elements' must be an iterable");
    if (!seq) {
        return NULL;
    }

    elementtreestate *st = get_elementtree_state_by_cls(cls);
    for (i = 0; i < PySequence_Fast_GET_SIZE(seq); i++) {
        TyObject* element = Ty_NewRef(PySequence_Fast_GET_ITEM(seq, i));
        if (element_add_subelement(st, self, element) < 0) {
            Ty_DECREF(seq);
            Ty_DECREF(element);
            return NULL;
        }
        Ty_DECREF(element);
    }

    Ty_DECREF(seq);

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.Element.find

    cls: defining_class
    /
    path: object
    namespaces: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_find_impl(ElementObject *self, TyTypeObject *cls,
                               TyObject *path, TyObject *namespaces)
/*[clinic end generated code: output=18f77d393c9fef1b input=94df8a83f956acc6]*/
{
    elementtreestate *st = get_elementtree_state_by_cls(cls);

    if (checkpath(path) || namespaces != Ty_None) {
        return PyObject_CallMethodObjArgs(
            st->elementpath_obj, st->str_find, self, path, namespaces, NULL
        );
    }

    for (Ty_ssize_t i = 0; self->extra && i < self->extra->length; i++) {
        TyObject *item = self->extra->children[i];
        assert(Element_Check(st, item));
        Ty_INCREF(item);
        TyObject *tag = Ty_NewRef(((ElementObject *)item)->tag);
        int rc = PyObject_RichCompareBool(tag, path, Py_EQ);
        Ty_DECREF(tag);
        if (rc > 0) {
            return item;
        }
        Ty_DECREF(item);
        if (rc < 0) {
            return NULL;
        }
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.Element.findtext

    cls: defining_class
    /
    path: object
    default: object = None
    namespaces: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_findtext_impl(ElementObject *self, TyTypeObject *cls,
                                   TyObject *path, TyObject *default_value,
                                   TyObject *namespaces)
/*[clinic end generated code: output=6af7a2d96aac32cb input=32f252099f62a3d2]*/
{
    elementtreestate *st = get_elementtree_state_by_cls(cls);

    if (checkpath(path) || namespaces != Ty_None)
        return PyObject_CallMethodObjArgs(
            st->elementpath_obj, st->str_findtext,
            self, path, default_value, namespaces, NULL
        );

    for (Ty_ssize_t i = 0; self->extra && i < self->extra->length; i++) {
        TyObject *item = self->extra->children[i];
        assert(Element_Check(st, item));
        Ty_INCREF(item);
        TyObject *tag = Ty_NewRef(((ElementObject *)item)->tag);
        int rc = PyObject_RichCompareBool(tag, path, Py_EQ);
        Ty_DECREF(tag);
        if (rc > 0) {
            TyObject *text = element_get_text((ElementObject *)item);
            Ty_DECREF(item);
            if (text == Ty_None) {
                return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
            }
            Ty_XINCREF(text);
            return text;
        }
        Ty_DECREF(item);
        if (rc < 0) {
            return NULL;
        }
    }

    return Ty_NewRef(default_value);
}

/*[clinic input]
_elementtree.Element.findall

    cls: defining_class
    /
    path: object
    namespaces: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_findall_impl(ElementObject *self, TyTypeObject *cls,
                                  TyObject *path, TyObject *namespaces)
/*[clinic end generated code: output=65e39a1208f3b59e input=7aa0db45673fc9a5]*/
{
    elementtreestate *st = get_elementtree_state_by_cls(cls);

    if (checkpath(path) || namespaces != Ty_None) {
        return PyObject_CallMethodObjArgs(
            st->elementpath_obj, st->str_findall, self, path, namespaces, NULL
        );
    }

    TyObject *out = TyList_New(0);
    if (out == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; self->extra && i < self->extra->length; i++) {
        TyObject *item = self->extra->children[i];
        assert(Element_Check(st, item));
        Ty_INCREF(item);
        TyObject *tag = Ty_NewRef(((ElementObject *)item)->tag);
        int rc = PyObject_RichCompareBool(tag, path, Py_EQ);
        Ty_DECREF(tag);
        if (rc != 0 && (rc < 0 || TyList_Append(out, item) < 0)) {
            Ty_DECREF(item);
            Ty_DECREF(out);
            return NULL;
        }
        Ty_DECREF(item);
    }

    return out;
}

/*[clinic input]
_elementtree.Element.iterfind

    cls: defining_class
    /
    path: object
    namespaces: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_iterfind_impl(ElementObject *self, TyTypeObject *cls,
                                   TyObject *path, TyObject *namespaces)
/*[clinic end generated code: output=be5c3f697a14e676 input=88766875a5c9a88b]*/
{
    TyObject* tag = path;
    elementtreestate *st = get_elementtree_state_by_cls(cls);

    return PyObject_CallMethodObjArgs(
        st->elementpath_obj, st->str_iterfind, self, tag, namespaces, NULL);
}

/*[clinic input]
_elementtree.Element.get

    key: object
    default: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_get_impl(ElementObject *self, TyObject *key,
                              TyObject *default_value)
/*[clinic end generated code: output=523c614142595d75 input=ee153bbf8cdb246e]*/
{
    if (self->extra && self->extra->attrib) {
        TyObject *attrib = Ty_NewRef(self->extra->attrib);
        TyObject *value = Ty_XNewRef(TyDict_GetItemWithError(attrib, key));
        Ty_DECREF(attrib);
        if (value != NULL || TyErr_Occurred()) {
            return value;
        }
    }

    return Ty_NewRef(default_value);
}

static TyObject *
create_elementiter(elementtreestate *st, ElementObject *self, TyObject *tag,
                   int gettext);


/*[clinic input]
_elementtree.Element.iter

    cls: defining_class
    /
    tag: object = None

[clinic start generated code]*/

static TyObject *
_elementtree_Element_iter_impl(ElementObject *self, TyTypeObject *cls,
                               TyObject *tag)
/*[clinic end generated code: output=bff29dc5d4566c68 input=f6944c48d3f84c58]*/
{
    if (TyUnicode_Check(tag)) {
        if (TyUnicode_GET_LENGTH(tag) == 1 && TyUnicode_READ_CHAR(tag, 0) == '*')
            tag = Ty_None;
    }
    else if (TyBytes_Check(tag)) {
        if (TyBytes_GET_SIZE(tag) == 1 && *TyBytes_AS_STRING(tag) == '*')
            tag = Ty_None;
    }

    elementtreestate *st = get_elementtree_state_by_cls(cls);
    return create_elementiter(st, self, tag, 0);
}


/*[clinic input]
_elementtree.Element.itertext

    cls: defining_class
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_itertext_impl(ElementObject *self, TyTypeObject *cls)
/*[clinic end generated code: output=fdeb2a3bca0ae063 input=a1ef1f0fc872a586]*/
{
    elementtreestate *st = get_elementtree_state_by_cls(cls);
    return create_elementiter(st, self, Ty_None, 1);
}


static TyObject*
element_getitem(TyObject *op, Ty_ssize_t index)
{
    ElementObject *self = _Element_CAST(op);

    if (!self->extra || index < 0 || index >= self->extra->length) {
        TyErr_SetString(
            TyExc_IndexError,
            "child index out of range"
            );
        return NULL;
    }

    return Ty_NewRef(self->extra->children[index]);
}

static int
element_bool(TyObject *op)
{
    ElementObject *self = _Element_CAST(op);
    if (TyErr_WarnEx(TyExc_DeprecationWarning,
                     "Testing an element's truth value will always return True "
                     "in future versions.  Use specific 'len(elem)' or "
                     "'elem is not None' test instead.",
                     1) < 0) {
        return -1;
    };
    if (self->extra ? self->extra->length : 0) {
        return 1;
    }
    return 0;
}

/*[clinic input]
_elementtree.Element.insert

    index: Ty_ssize_t
    subelement: object(subclass_of='clinic_state()->Element_Type')
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_insert_impl(ElementObject *self, Ty_ssize_t index,
                                 TyObject *subelement)
/*[clinic end generated code: output=990adfef4d424c0b input=9530f4905aa401ca]*/
{
    Ty_ssize_t i;

    if (!self->extra) {
        if (create_extra(self, NULL) < 0)
            return NULL;
    }

    if (index < 0) {
        index += self->extra->length;
        if (index < 0)
            index = 0;
    }
    if (index > self->extra->length)
        index = self->extra->length;

    if (element_resize(self, 1) < 0)
        return NULL;

    for (i = self->extra->length; i > index; i--)
        self->extra->children[i] = self->extra->children[i-1];

    self->extra->children[index] = Ty_NewRef(subelement);

    self->extra->length++;

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.Element.items

[clinic start generated code]*/

static TyObject *
_elementtree_Element_items_impl(ElementObject *self)
/*[clinic end generated code: output=6db2c778ce3f5a4d input=adbe09aaea474447]*/
{
    if (!self->extra || !self->extra->attrib)
        return TyList_New(0);

    return TyDict_Items(self->extra->attrib);
}

/*[clinic input]
_elementtree.Element.keys

[clinic start generated code]*/

static TyObject *
_elementtree_Element_keys_impl(ElementObject *self)
/*[clinic end generated code: output=bc5bfabbf20eeb3c input=f02caf5b496b5b0b]*/
{
    if (!self->extra || !self->extra->attrib)
        return TyList_New(0);

    return TyDict_Keys(self->extra->attrib);
}

static Ty_ssize_t
element_length(TyObject *op)
{
    ElementObject *self = _Element_CAST(op);
    if (!self->extra)
        return 0;

    return self->extra->length;
}

/*[clinic input]
_elementtree.Element.makeelement

    cls: defining_class
    tag: object
    attrib: object(subclass_of='&TyDict_Type')
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_makeelement_impl(ElementObject *self, TyTypeObject *cls,
                                      TyObject *tag, TyObject *attrib)
/*[clinic end generated code: output=d50bb17a47077d47 input=589829dab92f26e8]*/
{
    TyObject* elem;

    attrib = TyDict_Copy(attrib);
    if (!attrib)
        return NULL;

    elementtreestate *st = get_elementtree_state_by_cls(cls);
    elem = create_new_element(st, tag, attrib);

    Ty_DECREF(attrib);

    return elem;
}

/*[clinic input]
_elementtree.Element.remove

    subelement: object(subclass_of='clinic_state()->Element_Type')
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_remove_impl(ElementObject *self, TyObject *subelement)
/*[clinic end generated code: output=38fe6c07d6d87d1f input=6133e1d05597d5ee]*/
{
    Ty_ssize_t i;
    // When iterating over the list of children, we need to check that the
    // list is not cleared (self->extra != NULL) and that we are still within
    // the correct bounds (i < self->extra->length).
    //
    // We deliberately avoid protecting against children lists that grow
    // faster than the index since list objects do not protect against it.
    int rc = 0;
    for (i = 0; self->extra && i < self->extra->length; i++) {
        if (self->extra->children[i] == subelement) {
            rc = 1;
            break;
        }
        TyObject *child = Ty_NewRef(self->extra->children[i]);
        rc = PyObject_RichCompareBool(child, subelement, Py_EQ);
        Ty_DECREF(child);
        if (rc < 0) {
            return NULL;
        }
        else if (rc > 0) {
            break;
        }
    }

    if (rc == 0) {
        TyErr_SetString(TyExc_ValueError,
                        "Element.remove(x): element not found");
        return NULL;
    }

    // An extra check must be done if the mutation occurs at the very last
    // step and removes or clears the 'extra' list (the condition on the
    // length would not be satisfied any more).
    if (self->extra == NULL || i >= self->extra->length) {
        Py_RETURN_NONE;
    }

    TyObject *found = self->extra->children[i];

    self->extra->length--;
    for (; i < self->extra->length; i++) {
        self->extra->children[i] = self->extra->children[i+1];
    }

    Ty_DECREF(found);
    Py_RETURN_NONE;
}

static TyObject*
element_repr(TyObject *op)
{
    int status;
    ElementObject *self = _Element_CAST(op);
    if (self->tag == NULL)
        return TyUnicode_FromFormat("<Element at %p>", self);

    status = Ty_ReprEnter((TyObject *)self);
    if (status == 0) {
        TyObject *res;
        res = TyUnicode_FromFormat("<Element %R at %p>", self->tag, self);
        Ty_ReprLeave((TyObject *)self);
        return res;
    }
    if (status > 0)
        TyErr_Format(TyExc_RuntimeError,
                     "reentrant call inside %s.__repr__",
                     Ty_TYPE(self)->tp_name);
    return NULL;
}

/*[clinic input]
_elementtree.Element.set

    key: object
    value: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_Element_set_impl(ElementObject *self, TyObject *key,
                              TyObject *value)
/*[clinic end generated code: output=fb938806be3c5656 input=1efe90f7d82b3fe9]*/
{
    TyObject* attrib;

    if (!self->extra) {
        if (create_extra(self, NULL) < 0)
            return NULL;
    }

    attrib = element_get_attrib(self);
    if (!attrib)
        return NULL;

    if (TyDict_SetItem(attrib, key, value) < 0)
        return NULL;

    Py_RETURN_NONE;
}

static int
element_setitem(TyObject *op, Ty_ssize_t index, TyObject* item)
{
    ElementObject *self = _Element_CAST(op);
    Ty_ssize_t i;
    TyObject* old;

    if (!self->extra || index < 0 || index >= self->extra->length) {
        TyErr_SetString(
            TyExc_IndexError,
            "child assignment index out of range");
        return -1;
    }

    old = self->extra->children[index];

    if (item) {
        TyTypeObject *tp = Ty_TYPE(self);
        elementtreestate *st = get_elementtree_state_by_type(tp);
        if (!Element_Check(st, item)) {
            raise_type_error(item);
            return -1;
        }
        self->extra->children[index] = Ty_NewRef(item);
    } else {
        self->extra->length--;
        for (i = index; i < self->extra->length; i++)
            self->extra->children[i] = self->extra->children[i+1];
    }

    Ty_DECREF(old);

    return 0;
}

static TyObject *
element_subscr(TyObject *op, TyObject *item)
{
    ElementObject *self = _Element_CAST(op);

    if (PyIndex_Check(item)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(item, TyExc_IndexError);

        if (i == -1 && TyErr_Occurred()) {
            return NULL;
        }
        if (i < 0 && self->extra)
            i += self->extra->length;
        return element_getitem(op, i);
    }
    else if (TySlice_Check(item)) {
        Ty_ssize_t start, stop, step, slicelen, i;
        size_t cur;
        TyObject* list;

        if (!self->extra)
            return TyList_New(0);

        if (TySlice_Unpack(item, &start, &stop, &step) < 0) {
            return NULL;
        }
        slicelen = TySlice_AdjustIndices(self->extra->length, &start, &stop,
                                         step);

        if (slicelen <= 0)
            return TyList_New(0);
        else {
            list = TyList_New(slicelen);
            if (!list)
                return NULL;

            for (cur = start, i = 0; i < slicelen;
                 cur += step, i++) {
                TyObject* item = Ty_NewRef(self->extra->children[cur]);
                TyList_SET_ITEM(list, i, item);
            }

            return list;
        }
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                "element indices must be integers");
        return NULL;
    }
}

static int
element_ass_subscr(TyObject *op, TyObject *item, TyObject *value)
{
    ElementObject *self = _Element_CAST(op);

    if (PyIndex_Check(item)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(item, TyExc_IndexError);

        if (i == -1 && TyErr_Occurred()) {
            return -1;
        }
        if (i < 0 && self->extra)
            i += self->extra->length;
        return element_setitem(op, i, value);
    }
    else if (TySlice_Check(item)) {
        Ty_ssize_t start, stop, step, slicelen, newlen, i;
        size_t cur;

        TyObject* recycle = NULL;
        TyObject* seq;

        if (!self->extra) {
            if (create_extra(self, NULL) < 0)
                return -1;
        }

        if (TySlice_Unpack(item, &start, &stop, &step) < 0) {
            return -1;
        }
        slicelen = TySlice_AdjustIndices(self->extra->length, &start, &stop,
                                         step);

        if (value == NULL) {
            /* Delete slice */
            size_t cur;
            Ty_ssize_t i;

            if (slicelen <= 0)
                return 0;

            /* Since we're deleting, the direction of the range doesn't matter,
             * so for simplicity make it always ascending.
            */
            if (step < 0) {
                stop = start + 1;
                start = stop + step * (slicelen - 1) - 1;
                step = -step;
            }

            assert((size_t)slicelen <= SIZE_MAX / sizeof(TyObject *));

            /* recycle is a list that will contain all the children
             * scheduled for removal.
            */
            if (!(recycle = TyList_New(slicelen))) {
                return -1;
            }

            /* This loop walks over all the children that have to be deleted,
             * with cur pointing at them. num_moved is the amount of children
             * until the next deleted child that have to be "shifted down" to
             * occupy the deleted's places.
             * Note that in the ith iteration, shifting is done i+i places down
             * because i children were already removed.
            */
            for (cur = start, i = 0; cur < (size_t)stop; cur += step, ++i) {
                /* Compute how many children have to be moved, clipping at the
                 * list end.
                */
                Ty_ssize_t num_moved = step - 1;
                if (cur + step >= (size_t)self->extra->length) {
                    num_moved = self->extra->length - cur - 1;
                }

                TyList_SET_ITEM(recycle, i, self->extra->children[cur]);

                memmove(
                    self->extra->children + cur - i,
                    self->extra->children + cur + 1,
                    num_moved * sizeof(TyObject *));
            }

            /* Leftover "tail" after the last removed child */
            cur = start + (size_t)slicelen * step;
            if (cur < (size_t)self->extra->length) {
                memmove(
                    self->extra->children + cur - slicelen,
                    self->extra->children + cur,
                    (self->extra->length - cur) * sizeof(TyObject *));
            }

            self->extra->length -= slicelen;

            /* Discard the recycle list with all the deleted sub-elements */
            Ty_DECREF(recycle);
            return 0;
        }

        /* A new slice is actually being assigned */
        seq = PySequence_Fast(value, "assignment expects an iterable");
        if (!seq) {
            return -1;
        }
        newlen = PySequence_Fast_GET_SIZE(seq);

        if (step !=  1 && newlen != slicelen)
        {
            Ty_DECREF(seq);
            TyErr_Format(TyExc_ValueError,
                "attempt to assign sequence of size %zd "
                "to extended slice of size %zd",
                newlen, slicelen
                );
            return -1;
        }

        /* Resize before creating the recycle bin, to prevent refleaks. */
        if (newlen > slicelen) {
            if (element_resize(self, newlen - slicelen) < 0) {
                Ty_DECREF(seq);
                return -1;
            }
        }

        TyTypeObject *tp = Ty_TYPE(self);
        elementtreestate *st = get_elementtree_state_by_type(tp);
        for (i = 0; i < newlen; i++) {
            TyObject *element = PySequence_Fast_GET_ITEM(seq, i);
            if (!Element_Check(st, element)) {
                raise_type_error(element);
                Ty_DECREF(seq);
                return -1;
            }
        }

        if (slicelen > 0) {
            /* to avoid recursive calls to this method (via decref), move
               old items to the recycle bin here, and get rid of them when
               we're done modifying the element */
            recycle = TyList_New(slicelen);
            if (!recycle) {
                Ty_DECREF(seq);
                return -1;
            }
            for (cur = start, i = 0; i < slicelen;
                 cur += step, i++)
                TyList_SET_ITEM(recycle, i, self->extra->children[cur]);
        }

        if (newlen < slicelen) {
            /* delete slice */
            for (i = stop; i < self->extra->length; i++)
                self->extra->children[i + newlen - slicelen] = self->extra->children[i];
        } else if (newlen > slicelen) {
            /* insert slice */
            for (i = self->extra->length-1; i >= stop; i--)
                self->extra->children[i + newlen - slicelen] = self->extra->children[i];
        }

        /* replace the slice */
        for (cur = start, i = 0; i < newlen;
             cur += step, i++) {
            TyObject* element = PySequence_Fast_GET_ITEM(seq, i);
            self->extra->children[cur] = Ty_NewRef(element);
        }

        self->extra->length += newlen - slicelen;

        Ty_DECREF(seq);

        /* discard the recycle bin, and everything in it */
        Ty_XDECREF(recycle);

        return 0;
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                "element indices must be integers");
        return -1;
    }
}

static TyObject*
element_tag_getter(TyObject *op, void *closure)
{
    ElementObject *self = _Element_CAST(op);
    TyObject *res = self->tag;
    return Ty_NewRef(res);
}

static TyObject*
element_text_getter(TyObject *op, void *closure)
{
    ElementObject *self = _Element_CAST(op);
    TyObject *res = element_get_text(self);
    return Ty_XNewRef(res);
}

static TyObject*
element_tail_getter(TyObject *op, void *closure)
{
    ElementObject *self = _Element_CAST(op);
    TyObject *res = element_get_tail(self);
    return Ty_XNewRef(res);
}

static TyObject*
element_attrib_getter(TyObject *op, void *closure)
{
    TyObject *res;
    ElementObject *self = _Element_CAST(op);
    if (!self->extra) {
        if (create_extra(self, NULL) < 0)
            return NULL;
    }
    res = element_get_attrib(self);
    return Ty_XNewRef(res);
}

/* macro for setter validation */
#define _VALIDATE_ATTR_VALUE(V)                     \
    if ((V) == NULL) {                              \
        TyErr_SetString(                            \
            TyExc_AttributeError,                   \
            "can't delete element attribute");      \
        return -1;                                  \
    }

static int
element_tag_setter(TyObject *op, TyObject *value, void *closure)
{
    _VALIDATE_ATTR_VALUE(value);
    ElementObject *self = _Element_CAST(op);
    Ty_SETREF(self->tag, Ty_NewRef(value));
    return 0;
}

static int
element_text_setter(TyObject *op, TyObject *value, void *closure)
{
    _VALIDATE_ATTR_VALUE(value);
    ElementObject *self = _Element_CAST(op);
    _set_joined_ptr(&self->text, Ty_NewRef(value));
    return 0;
}

static int
element_tail_setter(TyObject *op, TyObject *value, void *closure)
{
    _VALIDATE_ATTR_VALUE(value);
    ElementObject *self = _Element_CAST(op);
    _set_joined_ptr(&self->tail, Ty_NewRef(value));
    return 0;
}

static int
element_attrib_setter(TyObject *op, TyObject *value, void *closure)
{
    _VALIDATE_ATTR_VALUE(value);
    if (!TyDict_Check(value)) {
        TyErr_Format(TyExc_TypeError,
                     "attrib must be dict, not %.200s",
                     Ty_TYPE(value)->tp_name);
        return -1;
    }
    ElementObject *self = _Element_CAST(op);
    if (!self->extra) {
        if (create_extra(self, NULL) < 0)
            return -1;
    }
    Ty_XSETREF(self->extra->attrib, Ty_NewRef(value));
    return 0;
}

/******************************* Element iterator ****************************/

/* ElementIterObject represents the iteration state over an XML element in
 * pre-order traversal. To keep track of which sub-element should be returned
 * next, a stack of parents is maintained. This is a standard stack-based
 * iterative pre-order traversal of a tree.
 * The stack is managed using a continuous array.
 * Each stack item contains the saved parent to which we should return after
 * the current one is exhausted, and the next child to examine in that parent.
 */
typedef struct ParentLocator_t {
    ElementObject *parent;
    Ty_ssize_t child_index;
} ParentLocator;

typedef struct {
    PyObject_HEAD
    ParentLocator *parent_stack;
    Ty_ssize_t parent_stack_used;
    Ty_ssize_t parent_stack_size;
    ElementObject *root_element;
    TyObject *sought_tag;
    int gettext;
} ElementIterObject;

#define _ElementIter_CAST(op) ((ElementIterObject *)(op))


static void
elementiter_dealloc(TyObject *op)
{
    TyTypeObject *tp = Ty_TYPE(op);
    ElementIterObject *it = _ElementIter_CAST(op);
    Ty_ssize_t i = it->parent_stack_used;
    it->parent_stack_used = 0;
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(it);
    while (i--)
        Ty_XDECREF(it->parent_stack[i].parent);
    TyMem_Free(it->parent_stack);

    Ty_XDECREF(it->sought_tag);
    Ty_XDECREF(it->root_element);

    tp->tp_free(it);
    Ty_DECREF(tp);
}

static int
elementiter_traverse(TyObject *op, visitproc visit, void *arg)
{
    ElementIterObject *it = _ElementIter_CAST(op);
    Ty_ssize_t i = it->parent_stack_used;
    while (i--)
        Ty_VISIT(it->parent_stack[i].parent);

    Ty_VISIT(it->root_element);
    Ty_VISIT(it->sought_tag);
    Ty_VISIT(Ty_TYPE(it));
    return 0;
}

/* Helper function for elementiter_next. Add a new parent to the parent stack.
 */
static int
parent_stack_push_new(ElementIterObject *it, ElementObject *parent)
{
    ParentLocator *item;

    if (it->parent_stack_used >= it->parent_stack_size) {
        Ty_ssize_t new_size = it->parent_stack_size * 2;  /* never overflow */
        ParentLocator *parent_stack = it->parent_stack;
        TyMem_Resize(parent_stack, ParentLocator, new_size);
        if (parent_stack == NULL)
            return -1;
        it->parent_stack = parent_stack;
        it->parent_stack_size = new_size;
    }
    item = it->parent_stack + it->parent_stack_used++;
    item->parent = (ElementObject*)Ty_NewRef(parent);
    item->child_index = 0;
    return 0;
}

static TyObject *
elementiter_next(TyObject *op)
{
    ElementIterObject *it = _ElementIter_CAST(op);
    /* Sub-element iterator.
     *
     * A short note on gettext: this function serves both the iter() and
     * itertext() methods to avoid code duplication. However, there are a few
     * small differences in the way these iterations work. Namely:
     *   - itertext() only yields text from nodes that have it, and continues
     *     iterating when a node doesn't have text (so it doesn't return any
     *     node like iter())
     *   - itertext() also has to handle tail, after finishing with all the
     *     children of a node.
     */
    int rc;
    ElementObject *elem;
    TyObject *text;

    while (1) {
        /* Handle the case reached in the beginning and end of iteration, where
         * the parent stack is empty. If root_element is NULL and we're here, the
         * iterator is exhausted.
         */
        if (!it->parent_stack_used) {
            if (!it->root_element) {
                TyErr_SetNone(TyExc_StopIteration);
                return NULL;
            }

            elem = it->root_element;  /* steals a reference */
            it->root_element = NULL;
        }
        else {
            /* See if there are children left to traverse in the current parent. If
             * yes, visit the next child. If not, pop the stack and try again.
             */
            ParentLocator *item = &it->parent_stack[it->parent_stack_used - 1];
            Ty_ssize_t child_index = item->child_index;
            ElementObjectExtra *extra;
            elem = item->parent;
            extra = elem->extra;
            if (!extra || child_index >= extra->length) {
                it->parent_stack_used--;
                /* Note that extra condition on it->parent_stack_used here;
                 * this is because itertext() is supposed to only return *inner*
                 * text, not text following the element it began iteration with.
                 */
                if (it->gettext && it->parent_stack_used) {
                    text = element_get_tail(elem);
                    goto gettext;
                }
                Ty_DECREF(elem);
                continue;
            }

#ifndef NDEBUG
            TyTypeObject *tp = Ty_TYPE(it);
            elementtreestate *st = get_elementtree_state_by_type(tp);
            assert(Element_Check(st, extra->children[child_index]));
#endif
            elem = (ElementObject *)Ty_NewRef(extra->children[child_index]);
            item->child_index++;
        }

        if (parent_stack_push_new(it, elem) < 0) {
            Ty_DECREF(elem);
            TyErr_NoMemory();
            return NULL;
        }
        if (it->gettext) {
            text = element_get_text(elem);
            goto gettext;
        }

        if (it->sought_tag == Ty_None)
            return (TyObject *)elem;

        rc = PyObject_RichCompareBool(elem->tag, it->sought_tag, Py_EQ);
        if (rc > 0)
            return (TyObject *)elem;

        Ty_DECREF(elem);
        if (rc < 0)
            return NULL;
        continue;

gettext:
        if (!text) {
            Ty_DECREF(elem);
            return NULL;
        }
        if (text == Ty_None) {
            Ty_DECREF(elem);
        }
        else {
            Ty_INCREF(text);
            Ty_DECREF(elem);
            rc = PyObject_IsTrue(text);
            if (rc > 0)
                return text;
            Ty_DECREF(text);
            if (rc < 0)
                return NULL;
        }
    }

    return NULL;
}

static TyType_Slot elementiter_slots[] = {
    {Ty_tp_dealloc, elementiter_dealloc},
    {Ty_tp_traverse, elementiter_traverse},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, elementiter_next},
    {0, NULL},
};

static TyType_Spec elementiter_spec = {
    /* Using the module's name since the pure-Python implementation does not
       have such a type. */
    .name = "_elementtree._element_iterator",
    .basicsize = sizeof(ElementIterObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = elementiter_slots,
};

#define INIT_PARENT_STACK_SIZE 8

static TyObject *
create_elementiter(elementtreestate *st, ElementObject *self, TyObject *tag,
                   int gettext)
{
    ElementIterObject *it;

    it = PyObject_GC_New(ElementIterObject, st->ElementIter_Type);
    if (!it)
        return NULL;

    it->sought_tag = Ty_NewRef(tag);
    it->gettext = gettext;
    it->root_element = (ElementObject*)Ty_NewRef(self);

    it->parent_stack = TyMem_New(ParentLocator, INIT_PARENT_STACK_SIZE);
    if (it->parent_stack == NULL) {
        Ty_DECREF(it);
        TyErr_NoMemory();
        return NULL;
    }
    it->parent_stack_used = 0;
    it->parent_stack_size = INIT_PARENT_STACK_SIZE;

    PyObject_GC_Track(it);

    return (TyObject *)it;
}


/* ==================================================================== */
/* the tree builder type */

typedef struct {
    PyObject_HEAD

    TyObject *root; /* root node (first created node) */

    TyObject *this; /* current node */
    TyObject *last; /* most recently created node */
    TyObject *last_for_tail; /* most recently created node that takes a tail */

    TyObject *data; /* data collector (string or list), or NULL */

    TyObject *stack; /* element stack */
    Ty_ssize_t index; /* current stack size (0 means empty) */

    TyObject *element_factory;
    TyObject *comment_factory;
    TyObject *pi_factory;

    /* element tracing */
    TyObject *events_append; /* the append method of the list of events, or NULL */
    TyObject *start_event_obj; /* event objects (NULL to ignore) */
    TyObject *end_event_obj;
    TyObject *start_ns_event_obj;
    TyObject *end_ns_event_obj;
    TyObject *comment_event_obj;
    TyObject *pi_event_obj;

    char insert_comments;
    char insert_pis;
    elementtreestate *state;
} TreeBuilderObject;


#define _TreeBuilder_CAST(op) ((TreeBuilderObject *)(op))
#define TreeBuilder_CheckExact(st, op) Ty_IS_TYPE((op), (st)->TreeBuilder_Type)

/* -------------------------------------------------------------------- */
/* constructor and destructor */

static TyObject *
treebuilder_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TreeBuilderObject *t = (TreeBuilderObject *)type->tp_alloc(type, 0);
    if (t != NULL) {
        t->root = NULL;
        t->this = Ty_NewRef(Ty_None);
        t->last = Ty_NewRef(Ty_None);
        t->data = NULL;
        t->element_factory = NULL;
        t->comment_factory = NULL;
        t->pi_factory = NULL;
        t->stack = TyList_New(20);
        if (!t->stack) {
            Ty_DECREF(t->this);
            Ty_DECREF(t->last);
            Ty_DECREF((TyObject *) t);
            return NULL;
        }
        t->index = 0;

        t->events_append = NULL;
        t->start_event_obj = t->end_event_obj = NULL;
        t->start_ns_event_obj = t->end_ns_event_obj = NULL;
        t->comment_event_obj = t->pi_event_obj = NULL;
        t->insert_comments = t->insert_pis = 0;
        t->state = get_elementtree_state_by_type(type);
    }
    return (TyObject *)t;
}

/*[clinic input]
_elementtree.TreeBuilder.__init__

    element_factory: object = None
    *
    comment_factory: object = None
    pi_factory: object = None
    insert_comments: bool = False
    insert_pis: bool = False

[clinic start generated code]*/

static int
_elementtree_TreeBuilder___init___impl(TreeBuilderObject *self,
                                       TyObject *element_factory,
                                       TyObject *comment_factory,
                                       TyObject *pi_factory,
                                       int insert_comments, int insert_pis)
/*[clinic end generated code: output=8571d4dcadfdf952 input=ae98a94df20b5cc3]*/
{
    if (element_factory != Ty_None) {
        Ty_XSETREF(self->element_factory, Ty_NewRef(element_factory));
    } else {
        Ty_CLEAR(self->element_factory);
    }

    if (comment_factory == Ty_None) {
        elementtreestate *st = self->state;
        comment_factory = st->comment_factory;
    }
    if (comment_factory) {
        Ty_XSETREF(self->comment_factory, Ty_NewRef(comment_factory));
        self->insert_comments = insert_comments;
    } else {
        Ty_CLEAR(self->comment_factory);
        self->insert_comments = 0;
    }

    if (pi_factory == Ty_None) {
        elementtreestate *st = self->state;
        pi_factory = st->pi_factory;
    }
    if (pi_factory) {
        Ty_XSETREF(self->pi_factory, Ty_NewRef(pi_factory));
        self->insert_pis = insert_pis;
    } else {
        Ty_CLEAR(self->pi_factory);
        self->insert_pis = 0;
    }

    return 0;
}

static int
treebuilder_gc_traverse(TyObject *op, visitproc visit, void *arg)
{
    TreeBuilderObject *self = _TreeBuilder_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->pi_event_obj);
    Ty_VISIT(self->comment_event_obj);
    Ty_VISIT(self->end_ns_event_obj);
    Ty_VISIT(self->start_ns_event_obj);
    Ty_VISIT(self->end_event_obj);
    Ty_VISIT(self->start_event_obj);
    Ty_VISIT(self->events_append);
    Ty_VISIT(self->root);
    Ty_VISIT(self->this);
    Ty_VISIT(self->last);
    Ty_VISIT(self->last_for_tail);
    Ty_VISIT(self->data);
    Ty_VISIT(self->stack);
    Ty_VISIT(self->pi_factory);
    Ty_VISIT(self->comment_factory);
    Ty_VISIT(self->element_factory);
    return 0;
}

static int
treebuilder_gc_clear(TyObject *op)
{
    TreeBuilderObject *self = _TreeBuilder_CAST(op);
    Ty_CLEAR(self->pi_event_obj);
    Ty_CLEAR(self->comment_event_obj);
    Ty_CLEAR(self->end_ns_event_obj);
    Ty_CLEAR(self->start_ns_event_obj);
    Ty_CLEAR(self->end_event_obj);
    Ty_CLEAR(self->start_event_obj);
    Ty_CLEAR(self->events_append);
    Ty_CLEAR(self->stack);
    Ty_CLEAR(self->data);
    Ty_CLEAR(self->last);
    Ty_CLEAR(self->last_for_tail);
    Ty_CLEAR(self->this);
    Ty_CLEAR(self->pi_factory);
    Ty_CLEAR(self->comment_factory);
    Ty_CLEAR(self->element_factory);
    Ty_CLEAR(self->root);
    return 0;
}

static void
treebuilder_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)treebuilder_gc_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

/* -------------------------------------------------------------------- */
/* helpers for handling of arbitrary element-like objects */

/*[clinic input]
_elementtree._set_factories

    comment_factory: object
    pi_factory: object
    /

Change the factories used to create comments and processing instructions.

For internal use only.
[clinic start generated code]*/

static TyObject *
_elementtree__set_factories_impl(TyObject *module, TyObject *comment_factory,
                                 TyObject *pi_factory)
/*[clinic end generated code: output=813b408adee26535 input=99d17627aea7fb3b]*/
{
    elementtreestate *st = get_elementtree_state(module);
    TyObject *old;

    if (!PyCallable_Check(comment_factory) && comment_factory != Ty_None) {
        TyErr_Format(TyExc_TypeError, "Comment factory must be callable, not %.100s",
                     Ty_TYPE(comment_factory)->tp_name);
        return NULL;
    }
    if (!PyCallable_Check(pi_factory) && pi_factory != Ty_None) {
        TyErr_Format(TyExc_TypeError, "PI factory must be callable, not %.100s",
                     Ty_TYPE(pi_factory)->tp_name);
        return NULL;
    }

    old = TyTuple_Pack(2,
        st->comment_factory ? st->comment_factory : Ty_None,
        st->pi_factory ? st->pi_factory : Ty_None);

    if (comment_factory == Ty_None) {
        Ty_CLEAR(st->comment_factory);
    } else {
        Ty_XSETREF(st->comment_factory, Ty_NewRef(comment_factory));
    }
    if (pi_factory == Ty_None) {
        Ty_CLEAR(st->pi_factory);
    } else {
        Ty_XSETREF(st->pi_factory, Ty_NewRef(pi_factory));
    }

    return old;
}

static int
treebuilder_extend_element_text_or_tail(elementtreestate *st, TyObject *element,
                                        TyObject **data, TyObject **dest,
                                        TyObject *name)
{
    /* Fast paths for the "almost always" cases. */
    if (Element_CheckExact(st, element)) {
        TyObject *dest_obj = JOIN_OBJ(*dest);
        if (dest_obj == Ty_None) {
            *dest = JOIN_SET(*data, TyList_CheckExact(*data));
            *data = NULL;
            Ty_DECREF(dest_obj);
            return 0;
        }
        else if (JOIN_GET(*dest)) {
            if (TyList_SetSlice(dest_obj, PY_SSIZE_T_MAX, PY_SSIZE_T_MAX, *data) < 0) {
                return -1;
            }
            Ty_CLEAR(*data);
            return 0;
        }
    }

    /*  Fallback for the non-Element / non-trivial cases. */
    {
        int r;
        TyObject* joined;
        TyObject* previous = PyObject_GetAttr(element, name);
        if (!previous)
            return -1;
        joined = list_join(*data);
        if (!joined) {
            Ty_DECREF(previous);
            return -1;
        }
        if (previous != Ty_None) {
            TyObject *tmp = PyNumber_Add(previous, joined);
            Ty_DECREF(joined);
            Ty_DECREF(previous);
            if (!tmp)
                return -1;
            joined = tmp;
        } else {
            Ty_DECREF(previous);
        }

        r = PyObject_SetAttr(element, name, joined);
        Ty_DECREF(joined);
        if (r < 0)
            return -1;
        Ty_CLEAR(*data);
        return 0;
    }
}

LOCAL(int)
treebuilder_flush_data(TreeBuilderObject* self)
{
    if (!self->data) {
        return 0;
    }
    elementtreestate *st = self->state;
    if (!self->last_for_tail) {
        TyObject *element = self->last;
        return treebuilder_extend_element_text_or_tail(
                st, element, &self->data,
                &((ElementObject *) element)->text, st->str_text);
    }
    else {
        TyObject *element = self->last_for_tail;
        return treebuilder_extend_element_text_or_tail(
                st, element, &self->data,
                &((ElementObject *) element)->tail, st->str_tail);
    }
}

static int
treebuilder_add_subelement(elementtreestate *st, TyObject *element,
                           TyObject *child)
{
    if (Element_CheckExact(st, element)) {
        ElementObject *elem = (ElementObject *) element;
        return element_add_subelement(st, elem, child);
    }
    else {
        TyObject *res;
        res = PyObject_CallMethodOneArg(element, st->str_append, child);
        if (res == NULL)
            return -1;
        Ty_DECREF(res);
        return 0;
    }
}

LOCAL(int)
treebuilder_append_event(TreeBuilderObject *self, TyObject *action,
                         TyObject *node)
{
    if (action != NULL) {
        TyObject *res;
        TyObject *event = TyTuple_Pack(2, action, node);
        if (event == NULL)
            return -1;
        res = PyObject_CallOneArg(self->events_append, event);
        Ty_DECREF(event);
        if (res == NULL)
            return -1;
        Ty_DECREF(res);
    }
    return 0;
}

/* -------------------------------------------------------------------- */
/* handlers */

LOCAL(TyObject*)
treebuilder_handle_start(TreeBuilderObject* self, TyObject* tag,
                         TyObject* attrib)
{
    TyObject* node;
    TyObject* this;
    elementtreestate *st = self->state;

    if (treebuilder_flush_data(self) < 0) {
        return NULL;
    }

    if (!self->element_factory) {
        node = create_new_element(st, tag, attrib);
    }
    else if (attrib == NULL) {
        attrib = TyDict_New();
        if (!attrib)
            return NULL;
        node = PyObject_CallFunctionObjArgs(self->element_factory,
                                            tag, attrib, NULL);
        Ty_DECREF(attrib);
    }
    else {
        node = PyObject_CallFunctionObjArgs(self->element_factory,
                                            tag, attrib, NULL);
    }
    if (!node) {
        return NULL;
    }

    this = self->this;
    Ty_CLEAR(self->last_for_tail);

    if (this != Ty_None) {
        if (treebuilder_add_subelement(st, this, node) < 0) {
            goto error;
        }
    } else {
        if (self->root) {
            TyErr_SetString(
                st->parseerror_obj,
                "multiple elements on top level"
                );
            goto error;
        }
        self->root = Ty_NewRef(node);
    }

    if (self->index < TyList_GET_SIZE(self->stack)) {
        if (TyList_SetItem(self->stack, self->index, this) < 0)
            goto error;
        Ty_INCREF(this);
    } else {
        if (TyList_Append(self->stack, this) < 0)
            goto error;
    }
    self->index++;

    Ty_SETREF(self->this, Ty_NewRef(node));
    Ty_SETREF(self->last, Ty_NewRef(node));

    if (treebuilder_append_event(self, self->start_event_obj, node) < 0)
        goto error;

    return node;

  error:
    Ty_DECREF(node);
    return NULL;
}

LOCAL(TyObject*)
treebuilder_handle_data(TreeBuilderObject* self, TyObject* data)
{
    if (!self->data) {
        if (self->last == Ty_None) {
            /* ignore calls to data before the first call to start */
            Py_RETURN_NONE;
        }
        /* store the first item as is */
        self->data = Ty_NewRef(data);
    } else {
        /* more than one item; use a list to collect items */
        if (TyBytes_CheckExact(self->data) && Ty_REFCNT(self->data) == 1 &&
            TyBytes_CheckExact(data) && TyBytes_GET_SIZE(data) == 1) {
            /* XXX this code path unused in Python 3? */
            /* expat often generates single character data sections; handle
               the most common case by resizing the existing string... */
            Ty_ssize_t size = TyBytes_GET_SIZE(self->data);
            if (_TyBytes_Resize(&self->data, size + 1) < 0)
                return NULL;
            TyBytes_AS_STRING(self->data)[size] = TyBytes_AS_STRING(data)[0];
        } else if (TyList_CheckExact(self->data)) {
            if (TyList_Append(self->data, data) < 0)
                return NULL;
        } else {
            TyObject* list = TyList_New(2);
            if (!list)
                return NULL;
            TyList_SET_ITEM(list, 0, Ty_NewRef(self->data));
            TyList_SET_ITEM(list, 1, Ty_NewRef(data));
            Ty_SETREF(self->data, list);
        }
    }

    Py_RETURN_NONE;
}

LOCAL(TyObject*)
treebuilder_handle_end(TreeBuilderObject* self, TyObject* tag)
{
    TyObject* item;

    if (treebuilder_flush_data(self) < 0) {
        return NULL;
    }

    if (self->index == 0) {
        TyErr_SetString(
            TyExc_IndexError,
            "pop from empty stack"
            );
        return NULL;
    }

    item = self->last;
    self->last = Ty_NewRef(self->this);
    Ty_XSETREF(self->last_for_tail, self->last);
    self->index--;
    self->this = Ty_NewRef(TyList_GET_ITEM(self->stack, self->index));
    Ty_DECREF(item);

    if (treebuilder_append_event(self, self->end_event_obj, self->last) < 0)
        return NULL;

    return Ty_NewRef(self->last);
}

LOCAL(TyObject*)
treebuilder_handle_comment(TreeBuilderObject* self, TyObject* text)
{
    TyObject* comment;
    TyObject* this;

    if (treebuilder_flush_data(self) < 0) {
        return NULL;
    }

    if (self->comment_factory) {
        comment = PyObject_CallOneArg(self->comment_factory, text);
        if (!comment)
            return NULL;

        this = self->this;
        if (self->insert_comments && this != Ty_None) {
            if (treebuilder_add_subelement(self->state, this, comment) < 0) {
                goto error;
            }
            Ty_XSETREF(self->last_for_tail, Ty_NewRef(comment));
        }
    } else {
        comment = Ty_NewRef(text);
    }

    if (self->events_append && self->comment_event_obj) {
        if (treebuilder_append_event(self, self->comment_event_obj, comment) < 0)
            goto error;
    }

    return comment;

  error:
    Ty_DECREF(comment);
    return NULL;
}

LOCAL(TyObject*)
treebuilder_handle_pi(TreeBuilderObject* self, TyObject* target, TyObject* text)
{
    TyObject* pi;
    TyObject* this;

    if (treebuilder_flush_data(self) < 0) {
        return NULL;
    }

    if (self->pi_factory) {
        TyObject* args[2] = {target, text};
        pi = PyObject_Vectorcall(self->pi_factory, args, 2, NULL);
        if (!pi) {
            return NULL;
        }

        this = self->this;
        if (self->insert_pis && this != Ty_None) {
            if (treebuilder_add_subelement(self->state, this, pi) < 0) {
                goto error;
            }
            Ty_XSETREF(self->last_for_tail, Ty_NewRef(pi));
        }
    } else {
        pi = TyTuple_Pack(2, target, text);
        if (!pi) {
            return NULL;
        }
    }

    if (self->events_append && self->pi_event_obj) {
        if (treebuilder_append_event(self, self->pi_event_obj, pi) < 0)
            goto error;
    }

    return pi;

  error:
    Ty_DECREF(pi);
    return NULL;
}

LOCAL(TyObject*)
treebuilder_handle_start_ns(TreeBuilderObject* self, TyObject* prefix, TyObject* uri)
{
    TyObject* parcel;

    if (self->events_append && self->start_ns_event_obj) {
        parcel = TyTuple_Pack(2, prefix, uri);
        if (!parcel) {
            return NULL;
        }

        if (treebuilder_append_event(self, self->start_ns_event_obj, parcel) < 0) {
            Ty_DECREF(parcel);
            return NULL;
        }
        Ty_DECREF(parcel);
    }

    Py_RETURN_NONE;
}

LOCAL(TyObject*)
treebuilder_handle_end_ns(TreeBuilderObject* self, TyObject* prefix)
{
    if (self->events_append && self->end_ns_event_obj) {
        if (treebuilder_append_event(self, self->end_ns_event_obj, prefix) < 0) {
            return NULL;
        }
    }

    Py_RETURN_NONE;
}

/* -------------------------------------------------------------------- */
/* methods (in alphabetical order) */

/*[clinic input]
_elementtree.TreeBuilder.data

    data: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_data_impl(TreeBuilderObject *self, TyObject *data)
/*[clinic end generated code: output=dfa02b68f732b8c0 input=a0540c532b284d29]*/
{
    return treebuilder_handle_data(self, data);
}

/*[clinic input]
_elementtree.TreeBuilder.end

    tag: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_end_impl(TreeBuilderObject *self, TyObject *tag)
/*[clinic end generated code: output=84cb6ca9008ec740 input=22dc3674236f5745]*/
{
    return treebuilder_handle_end(self, tag);
}

/*[clinic input]
_elementtree.TreeBuilder.comment

    text: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_comment_impl(TreeBuilderObject *self,
                                      TyObject *text)
/*[clinic end generated code: output=a555ef39027c3823 input=47e7ebc48ed01dfa]*/
{
    return treebuilder_handle_comment(self, text);
}

/*[clinic input]
_elementtree.TreeBuilder.pi

    target: object
    text: object = None
    /

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_pi_impl(TreeBuilderObject *self, TyObject *target,
                                 TyObject *text)
/*[clinic end generated code: output=21eb95ec9d04d1d9 input=349342bd79c35570]*/
{
    return treebuilder_handle_pi(self, target, text);
}

LOCAL(TyObject*)
treebuilder_done(TreeBuilderObject* self)
{
    TyObject* res;

    /* FIXME: check stack size? */

    if (self->root)
        res = self->root;
    else
        res = Ty_None;

    return Ty_NewRef(res);
}

/*[clinic input]
_elementtree.TreeBuilder.close

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_close_impl(TreeBuilderObject *self)
/*[clinic end generated code: output=b441fee3202f61ee input=f7c9c65dc718de14]*/
{
    return treebuilder_done(self);
}

/*[clinic input]
_elementtree.TreeBuilder.start

    tag: object
    attrs: object(subclass_of='&TyDict_Type')
    /

[clinic start generated code]*/

static TyObject *
_elementtree_TreeBuilder_start_impl(TreeBuilderObject *self, TyObject *tag,
                                    TyObject *attrs)
/*[clinic end generated code: output=e7e9dc2861349411 input=7288e9e38e63b2b6]*/
{
    return treebuilder_handle_start(self, tag, attrs);
}

/* ==================================================================== */
/* the expat interface */

#define EXPAT(st, func) ((st)->expat_capi->func)

static XML_Memory_Handling_Suite ExpatMemoryHandler = {
    TyMem_Malloc, TyMem_Realloc, TyMem_Free};

typedef struct {
    PyObject_HEAD

    XML_Parser parser;

    TyObject *target;
    TyObject *entity;

    TyObject *names;

    TyObject *handle_start_ns;
    TyObject *handle_end_ns;
    TyObject *handle_start;
    TyObject *handle_data;
    TyObject *handle_end;

    TyObject *handle_comment;
    TyObject *handle_pi;
    TyObject *handle_doctype;

    TyObject *handle_close;

    elementtreestate *state;
    TyObject *elementtree_module;
} XMLParserObject;

#define XMLParserObject_CAST(op)    ((XMLParserObject *)(op))

/* helpers */

LOCAL(TyObject*)
makeuniversal(XMLParserObject* self, const char* string)
{
    /* convert a UTF-8 tag/attribute name from the expat parser
       to a universal name string */

    Ty_ssize_t size = (Ty_ssize_t) strlen(string);
    TyObject* key;
    TyObject* value;

    /* look the 'raw' name up in the names dictionary */
    key = TyBytes_FromStringAndSize(string, size);
    if (!key)
        return NULL;

    value = Ty_XNewRef(TyDict_GetItemWithError(self->names, key));

    if (value == NULL && !TyErr_Occurred()) {
        /* new name.  convert to universal name, and decode as
           necessary */

        TyObject* tag;
        char* p;
        Ty_ssize_t i;

        /* look for namespace separator */
        for (i = 0; i < size; i++)
            if (string[i] == '}')
                break;
        if (i != size) {
            /* convert to universal name */
            tag = TyBytes_FromStringAndSize(NULL, size+1);
            if (tag == NULL) {
                Ty_DECREF(key);
                return NULL;
            }
            p = TyBytes_AS_STRING(tag);
            p[0] = '{';
            memcpy(p+1, string, size);
            size++;
        } else {
            /* plain name; use key as tag */
            tag = Ty_NewRef(key);
        }

        /* decode universal name */
        p = TyBytes_AS_STRING(tag);
        value = TyUnicode_DecodeUTF8(p, size, "strict");
        Ty_DECREF(tag);
        if (!value) {
            Ty_DECREF(key);
            return NULL;
        }

        /* add to names dictionary */
        if (TyDict_SetItem(self->names, key, value) < 0) {
            Ty_DECREF(key);
            Ty_DECREF(value);
            return NULL;
        }
    }

    Ty_DECREF(key);
    return value;
}

/* Set the ParseError exception with the given parameters.
 * If message is not NULL, it's used as the error string. Otherwise, the
 * message string is the default for the given error_code.
*/
static void
expat_set_error(elementtreestate *st, enum XML_Error error_code,
                Ty_ssize_t line, Ty_ssize_t column, const char *message)
{
    TyObject *errmsg, *error, *position, *code;

    errmsg = TyUnicode_FromFormat("%s: line %zd, column %zd",
                message ? message : EXPAT(st, ErrorString)(error_code),
                line, column);
    if (errmsg == NULL)
        return;

    error = PyObject_CallOneArg(st->parseerror_obj, errmsg);
    Ty_DECREF(errmsg);
    if (!error)
        return;

    /* Add code and position attributes */
    code = TyLong_FromLong((long)error_code);
    if (!code) {
        Ty_DECREF(error);
        return;
    }
    if (PyObject_SetAttrString(error, "code", code) == -1) {
        Ty_DECREF(error);
        Ty_DECREF(code);
        return;
    }
    Ty_DECREF(code);

    position = Ty_BuildValue("(nn)", line, column);
    if (!position) {
        Ty_DECREF(error);
        return;
    }
    if (PyObject_SetAttrString(error, "position", position) == -1) {
        Ty_DECREF(error);
        Ty_DECREF(position);
        return;
    }
    Ty_DECREF(position);

    TyErr_SetObject(st->parseerror_obj, error);
    Ty_DECREF(error);
}

/* -------------------------------------------------------------------- */
/* handlers */

static void
expat_default_handler(void *op, const XML_Char *data_in, int data_len)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *key;
    TyObject *value;
    TyObject *res;

    if (data_len < 2 || data_in[0] != '&')
        return;

    if (TyErr_Occurred())
        return;

    key = TyUnicode_DecodeUTF8(data_in + 1, data_len - 2, "strict");
    if (!key)
        return;

    value = TyDict_GetItemWithError(self->entity, key);

    elementtreestate *st = self->state;
    if (value) {
        if (TreeBuilder_CheckExact(st, self->target))
            res = treebuilder_handle_data(
                (TreeBuilderObject*) self->target, value
                );
        else if (self->handle_data)
            res = PyObject_CallOneArg(self->handle_data, value);
        else
            res = NULL;
        Ty_XDECREF(res);
    } else if (!TyErr_Occurred()) {
        /* Report the first error, not the last */
        char message[128] = "undefined entity ";
        strncat(message, data_in, data_len < 100?data_len:100);
        expat_set_error(
            st,
            XML_ERROR_UNDEFINED_ENTITY,
            EXPAT(st, GetErrorLineNumber)(self->parser),
            EXPAT(st, GetErrorColumnNumber)(self->parser),
            message
            );
    }

    Ty_DECREF(key);
}

static void
expat_start_handler(void *op, const XML_Char *tag_in,
                    const XML_Char **attrib_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *res;
    TyObject *tag;
    TyObject *attrib;
    int ok;

    if (TyErr_Occurred())
        return;

    /* tag name */
    tag = makeuniversal(self, tag_in);
    if (!tag)
        return; /* parser will look for errors */

    /* attributes */
    if (attrib_in[0]) {
        attrib = TyDict_New();
        if (!attrib) {
            Ty_DECREF(tag);
            return;
        }
        while (attrib_in[0] && attrib_in[1]) {
            TyObject *key = makeuniversal(self, attrib_in[0]);
            if (key == NULL) {
                Ty_DECREF(attrib);
                Ty_DECREF(tag);
                return;
            }
            TyObject *value = TyUnicode_DecodeUTF8(attrib_in[1], strlen(attrib_in[1]), "strict");
            if (value == NULL) {
                Ty_DECREF(key);
                Ty_DECREF(attrib);
                Ty_DECREF(tag);
                return;
            }
            ok = TyDict_SetItem(attrib, key, value);
            Ty_DECREF(value);
            Ty_DECREF(key);
            if (ok < 0) {
                Ty_DECREF(attrib);
                Ty_DECREF(tag);
                return;
            }
            attrib_in += 2;
        }
    } else {
        attrib = NULL;
    }

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target)) {
        /* shortcut */
        res = treebuilder_handle_start((TreeBuilderObject*) self->target,
                                       tag, attrib);
    }
    else if (self->handle_start) {
        if (attrib == NULL) {
            attrib = TyDict_New();
            if (!attrib) {
                Ty_DECREF(tag);
                return;
            }
        }
        res = PyObject_CallFunctionObjArgs(self->handle_start,
                                           tag, attrib, NULL);
    } else
        res = NULL;

    Ty_DECREF(tag);
    Ty_XDECREF(attrib);

    Ty_XDECREF(res);
}

static void
expat_data_handler(void *op, const XML_Char *data_in,
                   int data_len)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *data;
    TyObject *res;

    if (TyErr_Occurred())
        return;

    data = TyUnicode_DecodeUTF8(data_in, data_len, "strict");
    if (!data)
        return; /* parser will look for errors */

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target))
        /* shortcut */
        res = treebuilder_handle_data((TreeBuilderObject*) self->target, data);
    else if (self->handle_data)
        res = PyObject_CallOneArg(self->handle_data, data);
    else
        res = NULL;

    Ty_DECREF(data);

    Ty_XDECREF(res);
}

static void
expat_end_handler(void *op, const XML_Char *tag_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *tag;
    TyObject *res = NULL;

    if (TyErr_Occurred())
        return;

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target))
        /* shortcut */
        /* the standard tree builder doesn't look at the end tag */
        res = treebuilder_handle_end(
            (TreeBuilderObject*) self->target, Ty_None
            );
    else if (self->handle_end) {
        tag = makeuniversal(self, tag_in);
        if (tag) {
            res = PyObject_CallOneArg(self->handle_end, tag);
            Ty_DECREF(tag);
        }
    }

    Ty_XDECREF(res);
}

static void
expat_start_ns_handler(void *op, const XML_Char *prefix_in,
                       const XML_Char *uri_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *res = NULL;
    TyObject *uri;
    TyObject *prefix;

    if (TyErr_Occurred())
        return;

    if (!uri_in)
        uri_in = "";
    if (!prefix_in)
        prefix_in = "";

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target)) {
        /* shortcut - TreeBuilder does not actually implement .start_ns() */
        TreeBuilderObject *target = (TreeBuilderObject*) self->target;

        if (target->events_append && target->start_ns_event_obj) {
            prefix = TyUnicode_DecodeUTF8(prefix_in, strlen(prefix_in), "strict");
            if (!prefix)
                return;
            uri = TyUnicode_DecodeUTF8(uri_in, strlen(uri_in), "strict");
            if (!uri) {
                Ty_DECREF(prefix);
                return;
            }

            res = treebuilder_handle_start_ns(target, prefix, uri);
            Ty_DECREF(uri);
            Ty_DECREF(prefix);
        }
    } else if (self->handle_start_ns) {
        prefix = TyUnicode_DecodeUTF8(prefix_in, strlen(prefix_in), "strict");
        if (!prefix)
            return;
        uri = TyUnicode_DecodeUTF8(uri_in, strlen(uri_in), "strict");
        if (!uri) {
            Ty_DECREF(prefix);
            return;
        }

        TyObject *args[2] = {prefix, uri};
        res = PyObject_Vectorcall(self->handle_start_ns, args, 2, NULL);
        Ty_DECREF(uri);
        Ty_DECREF(prefix);
    }

    Ty_XDECREF(res);
}

static void
expat_end_ns_handler(void *op, const XML_Char *prefix_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *res = NULL;
    TyObject *prefix;

    if (TyErr_Occurred())
        return;

    if (!prefix_in)
        prefix_in = "";

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target)) {
        /* shortcut - TreeBuilder does not actually implement .end_ns() */
        TreeBuilderObject *target = (TreeBuilderObject*) self->target;

        if (target->events_append && target->end_ns_event_obj) {
            res = treebuilder_handle_end_ns(target, Ty_None);
        }
    } else if (self->handle_end_ns) {
        prefix = TyUnicode_DecodeUTF8(prefix_in, strlen(prefix_in), "strict");
        if (!prefix)
            return;

        res = PyObject_CallOneArg(self->handle_end_ns, prefix);
        Ty_DECREF(prefix);
    }

    Ty_XDECREF(res);
}

static void
expat_comment_handler(void *op, const XML_Char *comment_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *comment;
    TyObject *res;

    if (TyErr_Occurred())
        return;

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target)) {
        /* shortcut */
        TreeBuilderObject *target = (TreeBuilderObject*) self->target;

        comment = TyUnicode_DecodeUTF8(comment_in, strlen(comment_in), "strict");
        if (!comment)
            return; /* parser will look for errors */

        res = treebuilder_handle_comment(target,  comment);
        Ty_XDECREF(res);
        Ty_DECREF(comment);
    } else if (self->handle_comment) {
        comment = TyUnicode_DecodeUTF8(comment_in, strlen(comment_in), "strict");
        if (!comment)
            return;

        res = PyObject_CallOneArg(self->handle_comment, comment);
        Ty_XDECREF(res);
        Ty_DECREF(comment);
    }
}

static void
expat_start_doctype_handler(void *op,
                            const XML_Char *doctype_name,
                            const XML_Char *sysid,
                            const XML_Char *pubid,
                            int has_internal_subset)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *doctype_name_obj, *sysid_obj, *pubid_obj;
    TyObject *res;

    if (TyErr_Occurred())
        return;

    doctype_name_obj = makeuniversal(self, doctype_name);
    if (!doctype_name_obj)
        return;

    if (sysid) {
        sysid_obj = makeuniversal(self, sysid);
        if (!sysid_obj) {
            Ty_DECREF(doctype_name_obj);
            return;
        }
    } else {
        sysid_obj = Ty_NewRef(Ty_None);
    }

    if (pubid) {
        pubid_obj = makeuniversal(self, pubid);
        if (!pubid_obj) {
            Ty_DECREF(doctype_name_obj);
            Ty_DECREF(sysid_obj);
            return;
        }
    } else {
        pubid_obj = Ty_NewRef(Ty_None);
    }

    elementtreestate *st = self->state;
    /* If the target has a handler for doctype, call it. */
    if (self->handle_doctype) {
        res = PyObject_CallFunctionObjArgs(self->handle_doctype,
                                           doctype_name_obj, pubid_obj,
                                           sysid_obj, NULL);
        Ty_XDECREF(res);
    }
    else if (PyObject_HasAttrWithError((TyObject *)self, st->str_doctype) > 0) {
        (void)TyErr_WarnEx(TyExc_RuntimeWarning,
                "The doctype() method of XMLParser is ignored.  "
                "Define doctype() method on the TreeBuilder target.",
                1);
    }

    Ty_DECREF(doctype_name_obj);
    Ty_DECREF(pubid_obj);
    Ty_DECREF(sysid_obj);
}

static void
expat_pi_handler(void *op, const XML_Char *target_in,
                 const XML_Char *data_in)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    TyObject *pi_target;
    TyObject *data;
    TyObject *res;

    if (TyErr_Occurred())
        return;

    elementtreestate *st = self->state;
    if (TreeBuilder_CheckExact(st, self->target)) {
        /* shortcut */
        TreeBuilderObject *target = (TreeBuilderObject*) self->target;

        if ((target->events_append && target->pi_event_obj) || target->insert_pis) {
            pi_target = TyUnicode_DecodeUTF8(target_in, strlen(target_in), "strict");
            if (!pi_target)
                goto error;
            data = TyUnicode_DecodeUTF8(data_in, strlen(data_in), "strict");
            if (!data)
                goto error;
            res = treebuilder_handle_pi(target, pi_target, data);
            Ty_XDECREF(res);
            Ty_DECREF(data);
            Ty_DECREF(pi_target);
        }
    } else if (self->handle_pi) {
        pi_target = TyUnicode_DecodeUTF8(target_in, strlen(target_in), "strict");
        if (!pi_target)
            goto error;
        data = TyUnicode_DecodeUTF8(data_in, strlen(data_in), "strict");
        if (!data)
            goto error;

        TyObject *args[2] = {pi_target, data};
        res = PyObject_Vectorcall(self->handle_pi, args, 2, NULL);
        Ty_XDECREF(res);
        Ty_DECREF(data);
        Ty_DECREF(pi_target);
    }

    return;

  error:
    Ty_XDECREF(pi_target);
    return;
}

/* -------------------------------------------------------------------- */

static TyObject *
xmlparser_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    XMLParserObject *self = (XMLParserObject *)type->tp_alloc(type, 0);
    if (self) {
        self->parser = NULL;
        self->target = self->entity = self->names = NULL;
        self->handle_start_ns = self->handle_end_ns = NULL;
        self->handle_start = self->handle_data = self->handle_end = NULL;
        self->handle_comment = self->handle_pi = self->handle_close = NULL;
        self->handle_doctype = NULL;
        self->elementtree_module = TyType_GetModuleByDef(type, &elementtreemodule);
        assert(self->elementtree_module != NULL);
        Ty_INCREF(self->elementtree_module);
        // See gh-111784 for explanation why is reference to module needed here.
        self->state = get_elementtree_state(self->elementtree_module);
    }
    return (TyObject *)self;
}

static int
ignore_attribute_error(TyObject *value)
{
    if (value == NULL) {
        if (!TyErr_ExceptionMatches(TyExc_AttributeError)) {
            return -1;
        }
        TyErr_Clear();
    }
    return 0;
}

/*[clinic input]
_elementtree.XMLParser.__init__

    *
    target: object = None
    encoding: str(accept={str, NoneType}) = None

[clinic start generated code]*/

static int
_elementtree_XMLParser___init___impl(XMLParserObject *self, TyObject *target,
                                     const char *encoding)
/*[clinic end generated code: output=3ae45ec6cdf344e4 input=7e716dd6e4f3e439]*/
{
    self->entity = TyDict_New();
    if (!self->entity)
        return -1;

    self->names = TyDict_New();
    if (!self->names) {
        Ty_CLEAR(self->entity);
        return -1;
    }
    elementtreestate *st = self->state;
    self->parser = EXPAT(st, ParserCreate_MM)(encoding, &ExpatMemoryHandler, "}");
    if (!self->parser) {
        Ty_CLEAR(self->entity);
        Ty_CLEAR(self->names);
        TyErr_NoMemory();
        return -1;
    }
    /* expat < 2.1.0 has no XML_SetHashSalt() */
    if (EXPAT(st, SetHashSalt) != NULL) {
        EXPAT(st, SetHashSalt)(self->parser,
                           (unsigned long)_Ty_HashSecret.expat.hashsalt);
    }

    if (target != Ty_None) {
        Ty_INCREF(target);
    } else {
        target = treebuilder_new(st->TreeBuilder_Type, NULL, NULL);
        if (!target) {
            Ty_CLEAR(self->entity);
            Ty_CLEAR(self->names);
            return -1;
        }
    }
    self->target = target;

    self->handle_start_ns = PyObject_GetAttrString(target, "start_ns");
    if (ignore_attribute_error(self->handle_start_ns)) {
        return -1;
    }
    self->handle_end_ns = PyObject_GetAttrString(target, "end_ns");
    if (ignore_attribute_error(self->handle_end_ns)) {
        return -1;
    }
    self->handle_start = PyObject_GetAttrString(target, "start");
    if (ignore_attribute_error(self->handle_start)) {
        return -1;
    }
    self->handle_data = PyObject_GetAttrString(target, "data");
    if (ignore_attribute_error(self->handle_data)) {
        return -1;
    }
    self->handle_end = PyObject_GetAttrString(target, "end");
    if (ignore_attribute_error(self->handle_end)) {
        return -1;
    }
    self->handle_comment = PyObject_GetAttrString(target, "comment");
    if (ignore_attribute_error(self->handle_comment)) {
        return -1;
    }
    self->handle_pi = PyObject_GetAttrString(target, "pi");
    if (ignore_attribute_error(self->handle_pi)) {
        return -1;
    }
    self->handle_close = PyObject_GetAttrString(target, "close");
    if (ignore_attribute_error(self->handle_close)) {
        return -1;
    }
    self->handle_doctype = PyObject_GetAttrString(target, "doctype");
    if (ignore_attribute_error(self->handle_doctype)) {
        return -1;
    }

    /* configure parser */
    EXPAT(st, SetUserData)(self->parser, self);
    if (self->handle_start_ns || self->handle_end_ns)
        EXPAT(st, SetNamespaceDeclHandler)(
            self->parser,
            (XML_StartNamespaceDeclHandler) expat_start_ns_handler,
            (XML_EndNamespaceDeclHandler) expat_end_ns_handler
            );
    EXPAT(st, SetElementHandler)(
        self->parser,
        (XML_StartElementHandler) expat_start_handler,
        (XML_EndElementHandler) expat_end_handler
        );
    EXPAT(st, SetDefaultHandlerExpand)(
        self->parser,
        (XML_DefaultHandler) expat_default_handler
        );
    EXPAT(st, SetCharacterDataHandler)(
        self->parser,
        (XML_CharacterDataHandler) expat_data_handler
        );
    if (self->handle_comment)
        EXPAT(st, SetCommentHandler)(
            self->parser,
            (XML_CommentHandler) expat_comment_handler
            );
    if (self->handle_pi)
        EXPAT(st, SetProcessingInstructionHandler)(
            self->parser,
            (XML_ProcessingInstructionHandler) expat_pi_handler
            );
    EXPAT(st, SetStartDoctypeDeclHandler)(
        self->parser,
        (XML_StartDoctypeDeclHandler) expat_start_doctype_handler
        );
    EXPAT(st, SetUnknownEncodingHandler)(
        self->parser,
        EXPAT(st, DefaultUnknownEncodingHandler), NULL
        );

    return 0;
}

static int
xmlparser_gc_traverse(TyObject *op, visitproc visit, void *arg)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->handle_close);
    Ty_VISIT(self->handle_pi);
    Ty_VISIT(self->handle_comment);
    Ty_VISIT(self->handle_end);
    Ty_VISIT(self->handle_data);
    Ty_VISIT(self->handle_start);
    Ty_VISIT(self->handle_start_ns);
    Ty_VISIT(self->handle_end_ns);
    Ty_VISIT(self->handle_doctype);

    Ty_VISIT(self->target);
    Ty_VISIT(self->entity);
    Ty_VISIT(self->names);

    return 0;
}

static int
xmlparser_gc_clear(TyObject *op)
{
    XMLParserObject *self = XMLParserObject_CAST(op);
    elementtreestate *st = self->state;
    if (self->parser != NULL) {
        XML_Parser parser = self->parser;
        self->parser = NULL;
        EXPAT(st, ParserFree)(parser);
    }

    Ty_CLEAR(self->elementtree_module);
    Ty_CLEAR(self->handle_close);
    Ty_CLEAR(self->handle_pi);
    Ty_CLEAR(self->handle_comment);
    Ty_CLEAR(self->handle_end);
    Ty_CLEAR(self->handle_data);
    Ty_CLEAR(self->handle_start);
    Ty_CLEAR(self->handle_start_ns);
    Ty_CLEAR(self->handle_end_ns);
    Ty_CLEAR(self->handle_doctype);

    Ty_CLEAR(self->target);
    Ty_CLEAR(self->entity);
    Ty_CLEAR(self->names);

    return 0;
}

static void
xmlparser_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)xmlparser_gc_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

Ty_LOCAL_INLINE(int)
_check_xmlparser(XMLParserObject* self)
{
    if (self->target == NULL) {
        TyErr_SetString(TyExc_ValueError,
                        "XMLParser.__init__() wasn't called");
        return 0;
    }
    return 1;
}

LOCAL(TyObject*)
expat_parse(elementtreestate *st, XMLParserObject *self, const char *data,
            int data_len, int final)
{
    int ok;

    assert(!TyErr_Occurred());
    ok = EXPAT(st, Parse)(self->parser, data, data_len, final);

    if (TyErr_Occurred())
        return NULL;

    if (!ok) {
        expat_set_error(
            st,
            EXPAT(st, GetErrorCode)(self->parser),
            EXPAT(st, GetErrorLineNumber)(self->parser),
            EXPAT(st, GetErrorColumnNumber)(self->parser),
            NULL
            );
        return NULL;
    }

    Py_RETURN_NONE;
}

/*[clinic input]
_elementtree.XMLParser.close

[clinic start generated code]*/

static TyObject *
_elementtree_XMLParser_close_impl(XMLParserObject *self)
/*[clinic end generated code: output=d68d375dd23bc7fb input=ca7909ca78c3abfe]*/
{
    /* end feeding data to parser */

    TyObject* res;

    if (!_check_xmlparser(self)) {
        return NULL;
    }
    elementtreestate *st = self->state;
    res = expat_parse(st, self, "", 0, 1);
    if (!res)
        return NULL;

    if (TreeBuilder_CheckExact(st, self->target)) {
        Ty_DECREF(res);
        return treebuilder_done((TreeBuilderObject*) self->target);
    }
    else if (self->handle_close) {
        Ty_DECREF(res);
        return PyObject_CallNoArgs(self->handle_close);
    }
    else {
        return res;
    }
}

/*[clinic input]
_elementtree.XMLParser.flush

[clinic start generated code]*/

static TyObject *
_elementtree_XMLParser_flush_impl(XMLParserObject *self)
/*[clinic end generated code: output=42fdb8795ca24509 input=effbecdb28715949]*/
{
    if (!_check_xmlparser(self)) {
        return NULL;
    }

    elementtreestate *st = self->state;

    if (EXPAT(st, SetReparseDeferralEnabled) == NULL) {
        Py_RETURN_NONE;
    }

    // NOTE: The Expat parser in the C implementation of ElementTree is not
    //       exposed to the outside; as a result we known that reparse deferral
    //       is currently enabled, or we would not even have access to function
    //       XML_SetReparseDeferralEnabled in the first place (which we checked
    //       for, a few lines up).

    EXPAT(st, SetReparseDeferralEnabled)(self->parser, XML_FALSE);

    TyObject *res = expat_parse(st, self, "", 0, XML_FALSE);

    EXPAT(st, SetReparseDeferralEnabled)(self->parser, XML_TRUE);

    return res;
}

/*[clinic input]
_elementtree.XMLParser.feed

    data: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_XMLParser_feed_impl(XMLParserObject *self, TyObject *data)
/*[clinic end generated code: output=503e6fbf1adf17ab input=fe231b6b8de3ce1f]*/
{
    /* feed data to parser */

    if (!_check_xmlparser(self)) {
        return NULL;
    }
    elementtreestate *st = self->state;
    if (TyUnicode_Check(data)) {
        Ty_ssize_t data_len;
        const char *data_ptr = TyUnicode_AsUTF8AndSize(data, &data_len);
        if (data_ptr == NULL)
            return NULL;
        if (data_len > INT_MAX) {
            TyErr_SetString(TyExc_OverflowError, "size does not fit in an int");
            return NULL;
        }
        /* Explicitly set UTF-8 encoding. Return code ignored. */
        (void)EXPAT(st, SetEncoding)(self->parser, "utf-8");

        return expat_parse(st, self, data_ptr, (int)data_len, 0);
    }
    else {
        Ty_buffer view;
        TyObject *res;
        if (PyObject_GetBuffer(data, &view, PyBUF_SIMPLE) < 0)
            return NULL;
        if (view.len > INT_MAX) {
            PyBuffer_Release(&view);
            TyErr_SetString(TyExc_OverflowError, "size does not fit in an int");
            return NULL;
        }
        res = expat_parse(st, self, view.buf, (int)view.len, 0);
        PyBuffer_Release(&view);
        return res;
    }
}

/*[clinic input]
_elementtree.XMLParser._parse_whole

    file: object
    /

[clinic start generated code]*/

static TyObject *
_elementtree_XMLParser__parse_whole_impl(XMLParserObject *self,
                                         TyObject *file)
/*[clinic end generated code: output=60718a4e63d237d2 input=19ecc893b6f3e752]*/
{
    /* (internal) parse the whole input, until end of stream */
    TyObject* reader;
    TyObject* buffer;
    TyObject* temp;
    TyObject* res;

    if (!_check_xmlparser(self)) {
        return NULL;
    }
    reader = PyObject_GetAttrString(file, "read");
    if (!reader)
        return NULL;

    /* read from open file object */
    elementtreestate *st = self->state;
    for (;;) {

        buffer = PyObject_CallFunction(reader, "i", 64*1024);

        if (!buffer) {
            /* read failed (e.g. due to KeyboardInterrupt) */
            Ty_DECREF(reader);
            return NULL;
        }

        if (TyUnicode_CheckExact(buffer)) {
            /* A unicode object is encoded into bytes using UTF-8 */
            if (TyUnicode_GET_LENGTH(buffer) == 0) {
                Ty_DECREF(buffer);
                break;
            }
            temp = TyUnicode_AsEncodedString(buffer, "utf-8", "surrogatepass");
            Ty_DECREF(buffer);
            if (!temp) {
                /* Propagate exception from TyUnicode_AsEncodedString */
                Ty_DECREF(reader);
                return NULL;
            }
            buffer = temp;
        }
        else if (!TyBytes_CheckExact(buffer) || TyBytes_GET_SIZE(buffer) == 0) {
            Ty_DECREF(buffer);
            break;
        }

        if (TyBytes_GET_SIZE(buffer) > INT_MAX) {
            Ty_DECREF(buffer);
            Ty_DECREF(reader);
            TyErr_SetString(TyExc_OverflowError, "size does not fit in an int");
            return NULL;
        }
        res = expat_parse(
            st, self, TyBytes_AS_STRING(buffer), (int)TyBytes_GET_SIZE(buffer),
            0);

        Ty_DECREF(buffer);

        if (!res) {
            Ty_DECREF(reader);
            return NULL;
        }
        Ty_DECREF(res);

    }

    Ty_DECREF(reader);

    res = expat_parse(st, self, "", 0, 1);

    if (res && TreeBuilder_CheckExact(st, self->target)) {
        Ty_DECREF(res);
        return treebuilder_done((TreeBuilderObject*) self->target);
    }

    return res;
}

/*[clinic input]
_elementtree.XMLParser._setevents

    events_queue: object
    events_to_report: object = None
    /

[clinic start generated code]*/

static TyObject *
_elementtree_XMLParser__setevents_impl(XMLParserObject *self,
                                       TyObject *events_queue,
                                       TyObject *events_to_report)
/*[clinic end generated code: output=1440092922b13ed1 input=abf90830a1c3b0fc]*/
{
    /* activate element event reporting */
    Ty_ssize_t i;
    TreeBuilderObject *target;
    TyObject *events_append, *events_seq;

    if (!_check_xmlparser(self)) {
        return NULL;
    }
    elementtreestate *st = self->state;
    if (!TreeBuilder_CheckExact(st, self->target)) {
        TyErr_SetString(
            TyExc_TypeError,
            "event handling only supported for ElementTree.TreeBuilder "
            "targets"
            );
        return NULL;
    }

    target = (TreeBuilderObject*) self->target;

    events_append = PyObject_GetAttrString(events_queue, "append");
    if (events_append == NULL)
        return NULL;
    Ty_XSETREF(target->events_append, events_append);

    /* clear out existing events */
    Ty_CLEAR(target->start_event_obj);
    Ty_CLEAR(target->end_event_obj);
    Ty_CLEAR(target->start_ns_event_obj);
    Ty_CLEAR(target->end_ns_event_obj);
    Ty_CLEAR(target->comment_event_obj);
    Ty_CLEAR(target->pi_event_obj);

    if (events_to_report == Ty_None) {
        /* default is "end" only */
        target->end_event_obj = TyUnicode_FromString("end");
        Py_RETURN_NONE;
    }

    if (!(events_seq = PySequence_Fast(events_to_report,
                                       "events must be a sequence"))) {
        return NULL;
    }

    for (i = 0; i < PySequence_Fast_GET_SIZE(events_seq); ++i) {
        TyObject *event_name_obj = PySequence_Fast_GET_ITEM(events_seq, i);
        const char *event_name = NULL;
        if (TyUnicode_Check(event_name_obj)) {
            event_name = TyUnicode_AsUTF8(event_name_obj);
        } else if (TyBytes_Check(event_name_obj)) {
            event_name = TyBytes_AS_STRING(event_name_obj);
        }
        if (event_name == NULL) {
            Ty_DECREF(events_seq);
            TyErr_Format(TyExc_ValueError, "invalid events sequence");
            return NULL;
        }

        if (strcmp(event_name, "start") == 0) {
            Ty_XSETREF(target->start_event_obj, Ty_NewRef(event_name_obj));
        } else if (strcmp(event_name, "end") == 0) {
            Ty_XSETREF(target->end_event_obj, Ty_NewRef(event_name_obj));
        } else if (strcmp(event_name, "start-ns") == 0) {
            Ty_XSETREF(target->start_ns_event_obj, Ty_NewRef(event_name_obj));
            EXPAT(st, SetNamespaceDeclHandler)(
                self->parser,
                (XML_StartNamespaceDeclHandler) expat_start_ns_handler,
                (XML_EndNamespaceDeclHandler) expat_end_ns_handler
                );
        } else if (strcmp(event_name, "end-ns") == 0) {
            Ty_XSETREF(target->end_ns_event_obj, Ty_NewRef(event_name_obj));
            EXPAT(st, SetNamespaceDeclHandler)(
                self->parser,
                (XML_StartNamespaceDeclHandler) expat_start_ns_handler,
                (XML_EndNamespaceDeclHandler) expat_end_ns_handler
                );
        } else if (strcmp(event_name, "comment") == 0) {
            Ty_XSETREF(target->comment_event_obj, Ty_NewRef(event_name_obj));
            EXPAT(st, SetCommentHandler)(
                self->parser,
                (XML_CommentHandler) expat_comment_handler
                );
        } else if (strcmp(event_name, "pi") == 0) {
            Ty_XSETREF(target->pi_event_obj, Ty_NewRef(event_name_obj));
            EXPAT(st, SetProcessingInstructionHandler)(
                self->parser,
                (XML_ProcessingInstructionHandler) expat_pi_handler
                );
        } else {
            Ty_DECREF(events_seq);
            TyErr_Format(TyExc_ValueError, "unknown event '%s'", event_name);
            return NULL;
        }
    }

    Ty_DECREF(events_seq);
    Py_RETURN_NONE;
}

static TyMemberDef xmlparser_members[] = {
    {"entity", _Ty_T_OBJECT, offsetof(XMLParserObject, entity), Py_READONLY, NULL},
    {"target", _Ty_T_OBJECT, offsetof(XMLParserObject, target), Py_READONLY, NULL},
    {NULL}
};

static TyObject*
xmlparser_version_getter(TyObject *op, void *closure)
{
    return TyUnicode_FromFormat(
        "Expat %d.%d.%d", XML_MAJOR_VERSION,
        XML_MINOR_VERSION, XML_MICRO_VERSION);
}

static TyGetSetDef xmlparser_getsetlist[] = {
    {"version", xmlparser_version_getter, NULL, NULL},
    {NULL},
};

#define clinic_state() (get_elementtree_state_by_type(Ty_TYPE(self)))
#include "clinic/_elementtree.c.h"
#undef clinic_state

static TyMethodDef element_methods[] = {

    _ELEMENTTREE_ELEMENT_CLEAR_METHODDEF

    _ELEMENTTREE_ELEMENT_GET_METHODDEF
    _ELEMENTTREE_ELEMENT_SET_METHODDEF

    _ELEMENTTREE_ELEMENT_FIND_METHODDEF
    _ELEMENTTREE_ELEMENT_FINDTEXT_METHODDEF
    _ELEMENTTREE_ELEMENT_FINDALL_METHODDEF

    _ELEMENTTREE_ELEMENT_APPEND_METHODDEF
    _ELEMENTTREE_ELEMENT_EXTEND_METHODDEF
    _ELEMENTTREE_ELEMENT_INSERT_METHODDEF
    _ELEMENTTREE_ELEMENT_REMOVE_METHODDEF

    _ELEMENTTREE_ELEMENT_ITER_METHODDEF
    _ELEMENTTREE_ELEMENT_ITERTEXT_METHODDEF
    _ELEMENTTREE_ELEMENT_ITERFIND_METHODDEF

    _ELEMENTTREE_ELEMENT_ITEMS_METHODDEF
    _ELEMENTTREE_ELEMENT_KEYS_METHODDEF

    _ELEMENTTREE_ELEMENT_MAKEELEMENT_METHODDEF

    _ELEMENTTREE_ELEMENT___COPY___METHODDEF
    _ELEMENTTREE_ELEMENT___DEEPCOPY___METHODDEF
    _ELEMENTTREE_ELEMENT___SIZEOF___METHODDEF
    _ELEMENTTREE_ELEMENT___GETSTATE___METHODDEF
    _ELEMENTTREE_ELEMENT___SETSTATE___METHODDEF

    {NULL, NULL}
};

static struct TyMemberDef element_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(ElementObject, weakreflist), Py_READONLY},
    {NULL},
};

static TyGetSetDef element_getsetlist[] = {
    {"tag",
        element_tag_getter,
        element_tag_setter,
        "A string identifying what kind of data this element represents"},
    {"text",
        element_text_getter,
        element_text_setter,
        "A string of text directly after the start tag, or None"},
    {"tail",
        element_tail_getter,
        element_tail_setter,
        "A string of text directly after the end tag, or None"},
    {"attrib",
        element_attrib_getter,
        element_attrib_setter,
        "A dictionary containing the element's attributes"},
    {NULL},
};

static TyType_Slot element_slots[] = {
    {Ty_tp_dealloc, element_dealloc},
    {Ty_tp_repr, element_repr},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, element_gc_traverse},
    {Ty_tp_clear, element_gc_clear},
    {Ty_tp_methods, element_methods},
    {Ty_tp_members, element_members},
    {Ty_tp_getset, element_getsetlist},
    {Ty_tp_init, element_init},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, element_new},
    {Ty_sq_length, element_length},
    {Ty_sq_item, element_getitem},
    {Ty_sq_ass_item, element_setitem},
    {Ty_nb_bool, element_bool},
    {Ty_mp_length, element_length},
    {Ty_mp_subscript, element_subscr},
    {Ty_mp_ass_subscript, element_ass_subscr},
    {0, NULL},
};

static TyType_Spec element_spec = {
    .name = "xml.etree.ElementTree.Element",
    .basicsize = sizeof(ElementObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = element_slots,
};

static TyMethodDef treebuilder_methods[] = {
    _ELEMENTTREE_TREEBUILDER_DATA_METHODDEF
    _ELEMENTTREE_TREEBUILDER_START_METHODDEF
    _ELEMENTTREE_TREEBUILDER_END_METHODDEF
    _ELEMENTTREE_TREEBUILDER_COMMENT_METHODDEF
    _ELEMENTTREE_TREEBUILDER_PI_METHODDEF
    _ELEMENTTREE_TREEBUILDER_CLOSE_METHODDEF
    {NULL, NULL}
};

static TyType_Slot treebuilder_slots[] = {
    {Ty_tp_dealloc, treebuilder_dealloc},
    {Ty_tp_traverse, treebuilder_gc_traverse},
    {Ty_tp_clear, treebuilder_gc_clear},
    {Ty_tp_methods, treebuilder_methods},
    {Ty_tp_init, _elementtree_TreeBuilder___init__},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, treebuilder_new},
    {0, NULL},
};

static TyType_Spec treebuilder_spec = {
    .name = "xml.etree.ElementTree.TreeBuilder",
    .basicsize = sizeof(TreeBuilderObject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE,
    .slots = treebuilder_slots,
};

static TyMethodDef xmlparser_methods[] = {
    _ELEMENTTREE_XMLPARSER_FEED_METHODDEF
    _ELEMENTTREE_XMLPARSER_CLOSE_METHODDEF
    _ELEMENTTREE_XMLPARSER_FLUSH_METHODDEF
    _ELEMENTTREE_XMLPARSER__PARSE_WHOLE_METHODDEF
    _ELEMENTTREE_XMLPARSER__SETEVENTS_METHODDEF
    {NULL, NULL}
};

static TyType_Slot xmlparser_slots[] = {
    {Ty_tp_dealloc, xmlparser_dealloc},
    {Ty_tp_traverse, xmlparser_gc_traverse},
    {Ty_tp_clear, xmlparser_gc_clear},
    {Ty_tp_methods, xmlparser_methods},
    {Ty_tp_members, xmlparser_members},
    {Ty_tp_getset, xmlparser_getsetlist},
    {Ty_tp_init, _elementtree_XMLParser___init__},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, xmlparser_new},
    {0, NULL},
};

static TyType_Spec xmlparser_spec = {
    .name = "xml.etree.ElementTree.XMLParser",
    .basicsize = sizeof(XMLParserObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = xmlparser_slots,
};

/* ==================================================================== */
/* python module interface */

static TyMethodDef _functions[] = {
    {"SubElement", _PyCFunction_CAST(subelement), METH_VARARGS | METH_KEYWORDS},
    _ELEMENTTREE__SET_FACTORIES_METHODDEF
    {NULL, NULL}
};

#define CREATE_TYPE(module, type, spec) \
do {                                                                     \
    if (type != NULL) {                                                  \
        break;                                                           \
    }                                                                    \
    type = (TyTypeObject *)TyType_FromModuleAndSpec(module, spec, NULL); \
    if (type == NULL) {                                                  \
        goto error;                                                      \
    }                                                                    \
} while (0)

static int
module_exec(TyObject *m)
{
    elementtreestate *st = get_elementtree_state(m);

    /* Initialize object types */
    CREATE_TYPE(m, st->ElementIter_Type, &elementiter_spec);
    CREATE_TYPE(m, st->TreeBuilder_Type, &treebuilder_spec);
    CREATE_TYPE(m, st->Element_Type, &element_spec);
    CREATE_TYPE(m, st->XMLParser_Type, &xmlparser_spec);

    st->deepcopy_obj = TyImport_ImportModuleAttrString("copy", "deepcopy");
    if (st->deepcopy_obj == NULL) {
        goto error;
    }

    assert(!TyErr_Occurred());
    if (!(st->elementpath_obj = TyImport_ImportModule("xml.etree.ElementPath")))
        goto error;

    /* link against pyexpat */
    if (!(st->expat_capsule = TyImport_ImportModuleAttrString("pyexpat", "expat_CAPI")))
        goto error;
    if (!(st->expat_capi = PyCapsule_GetPointer(st->expat_capsule, PyExpat_CAPSULE_NAME)))
        goto error;
    if (st->expat_capi) {
        /* check that it's usable */
        if (strcmp(st->expat_capi->magic, PyExpat_CAPI_MAGIC) != 0 ||
            (size_t)st->expat_capi->size < sizeof(struct PyExpat_CAPI) ||
            st->expat_capi->MAJOR_VERSION != XML_MAJOR_VERSION ||
            st->expat_capi->MINOR_VERSION != XML_MINOR_VERSION ||
            st->expat_capi->MICRO_VERSION != XML_MICRO_VERSION) {
            TyErr_SetString(TyExc_ImportError,
                            "pyexpat version is incompatible");
            goto error;
        }
    } else {
        goto error;
    }

    st->str_append = TyUnicode_InternFromString("append");
    if (st->str_append == NULL) {
        goto error;
    }
    st->str_find = TyUnicode_InternFromString("find");
    if (st->str_find == NULL) {
        goto error;
    }
    st->str_findall = TyUnicode_InternFromString("findall");
    if (st->str_findall == NULL) {
        goto error;
    }
    st->str_findtext = TyUnicode_InternFromString("findtext");
    if (st->str_findtext == NULL) {
        goto error;
    }
    st->str_iterfind = TyUnicode_InternFromString("iterfind");
    if (st->str_iterfind == NULL) {
        goto error;
    }
    st->str_tail = TyUnicode_InternFromString("tail");
    if (st->str_tail == NULL) {
        goto error;
    }
    st->str_text = TyUnicode_InternFromString("text");
    if (st->str_text == NULL) {
        goto error;
    }
    st->str_doctype = TyUnicode_InternFromString("doctype");
    if (st->str_doctype == NULL) {
        goto error;
    }
    st->parseerror_obj = TyErr_NewException(
        "xml.etree.ElementTree.ParseError", TyExc_SyntaxError, NULL
        );
    if (TyModule_AddObjectRef(m, "ParseError", st->parseerror_obj) < 0) {
        goto error;
    }

    TyTypeObject *types[] = {
        st->Element_Type,
        st->TreeBuilder_Type,
        st->XMLParser_Type
    };

    for (size_t i = 0; i < Ty_ARRAY_LENGTH(types); i++) {
        if (TyModule_AddType(m, types[i]) < 0) {
            goto error;
        }
    }

    return 0;

error:
    return -1;
}

static struct PyModuleDef_Slot elementtree_slots[] = {
    {Ty_mod_exec, module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef elementtreemodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_elementtree",
    .m_size = sizeof(elementtreestate),
    .m_methods = _functions,
    .m_slots = elementtree_slots,
    .m_traverse = elementtree_traverse,
    .m_clear = elementtree_clear,
    .m_free = elementtree_free,
};

PyMODINIT_FUNC
PyInit__elementtree(void)
{
    return PyModuleDef_Init(&elementtreemodule);
}
