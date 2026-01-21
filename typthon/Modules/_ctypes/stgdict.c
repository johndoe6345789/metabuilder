#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
// windows.h must be included before pycore internal headers
#ifdef MS_WIN32
#  include <windows.h>
#endif

#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_dict.h"          // _TyDict_SizeOf()
#include <ffi.h>
#ifdef MS_WIN32
#  include <malloc.h>
#endif
#include "ctypes.h"

/* This file relates to StgInfo -- type-specific information for ctypes.
 * See ctypes.h for details.
 */

int
PyCStgInfo_clone(StgInfo *dst_info, StgInfo *src_info)
{
    Ty_ssize_t size;

    ctype_free_stginfo_members(dst_info);

    memcpy(dst_info, src_info, sizeof(StgInfo));
#ifdef Ty_GIL_DISABLED
    dst_info->mutex = (PyMutex){0};
#endif
    dst_info->dict_final = 0;

    Ty_XINCREF(dst_info->proto);
    Ty_XINCREF(dst_info->argtypes);
    Ty_XINCREF(dst_info->converters);
    Ty_XINCREF(dst_info->restype);
    Ty_XINCREF(dst_info->checker);
    Ty_XINCREF(dst_info->module);
    dst_info->pointer_type = NULL;  // the cache cannot be shared

    if (src_info->format) {
        dst_info->format = TyMem_Malloc(strlen(src_info->format) + 1);
        if (dst_info->format == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        strcpy(dst_info->format, src_info->format);
    }
    if (src_info->shape) {
        dst_info->shape = TyMem_Malloc(sizeof(Ty_ssize_t) * src_info->ndim);
        if (dst_info->shape == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        memcpy(dst_info->shape, src_info->shape,
               sizeof(Ty_ssize_t) * src_info->ndim);
    }

    if (src_info->ffi_type_pointer.elements == NULL)
        return 0;
    size = sizeof(ffi_type *) * (src_info->length + 1);
    dst_info->ffi_type_pointer.elements = TyMem_Malloc(size);
    if (dst_info->ffi_type_pointer.elements == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    memcpy(dst_info->ffi_type_pointer.elements,
           src_info->ffi_type_pointer.elements,
           size);
    return 0;
}

/* descr is the descriptor for a field marked as anonymous.  Get all the
 _fields_ descriptors from descr->proto, create new descriptors with offset
 and index adjusted, and stuff them into type.
 */
static int
MakeFields(TyObject *type, CFieldObject *descr,
           Ty_ssize_t index, Ty_ssize_t offset)
{
    Ty_ssize_t i;
    TyObject *fields;
    TyObject *fieldlist;

    fields = PyObject_GetAttrString(descr->proto, "_fields_");
    if (fields == NULL)
        return -1;
    fieldlist = PySequence_Fast(fields, "_fields_ must be a sequence");
    Ty_DECREF(fields);
    if (fieldlist == NULL)
        return -1;

    ctypes_state *st = get_module_state_by_class(Ty_TYPE(descr));
    TyTypeObject *cfield_tp = st->PyCField_Type;
    for (i = 0; i < PySequence_Fast_GET_SIZE(fieldlist); ++i) {
        TyObject *pair = PySequence_Fast_GET_ITEM(fieldlist, i); /* borrowed */
        TyObject *fname, *ftype, *bits;
        CFieldObject *fdescr;
        CFieldObject *new_descr;
        /* Convert to TyArg_UnpackTuple... */
        if (!TyArg_ParseTuple(pair, "OO|O", &fname, &ftype, &bits)) {
            Ty_DECREF(fieldlist);
            return -1;
        }
        fdescr = (CFieldObject *)PyObject_GetAttr(descr->proto, fname);
        if (fdescr == NULL) {
            Ty_DECREF(fieldlist);
            return -1;
        }
        if (!Ty_IS_TYPE(fdescr, cfield_tp)) {
            TyErr_SetString(TyExc_TypeError, "unexpected type");
            Ty_DECREF(fdescr);
            Ty_DECREF(fieldlist);
            return -1;
        }
        if (fdescr->anonymous) {
            int rc = MakeFields(type, fdescr,
                                index + fdescr->index,
                                offset + fdescr->byte_offset);
            Ty_DECREF(fdescr);
            if (rc == -1) {
                Ty_DECREF(fieldlist);
                return -1;
            }
            continue;
        }
        new_descr = (CFieldObject *)cfield_tp->tp_alloc(cfield_tp, 0);
        if (new_descr == NULL) {
            Ty_DECREF(fdescr);
            Ty_DECREF(fieldlist);
            return -1;
        }
        assert(Ty_IS_TYPE(new_descr, cfield_tp));
        new_descr->byte_size = fdescr->byte_size;
        new_descr->byte_offset = fdescr->byte_offset + offset;
        new_descr->bitfield_size = fdescr->bitfield_size;
        new_descr->bit_offset = fdescr->bit_offset;
        new_descr->index = fdescr->index + index;
        new_descr->proto = Ty_XNewRef(fdescr->proto);
        new_descr->getfunc = fdescr->getfunc;
        new_descr->setfunc = fdescr->setfunc;
        new_descr->name = Ty_NewRef(fdescr->name);
        new_descr->anonymous = fdescr->anonymous;

        Ty_DECREF(fdescr);

        if (-1 == PyObject_SetAttr(type, fname, (TyObject *)new_descr)) {
            Ty_DECREF(fieldlist);
            Ty_DECREF(new_descr);
            return -1;
        }
        Ty_DECREF(new_descr);
    }
    Ty_DECREF(fieldlist);
    return 0;
}

/* Iterate over the names in the type's _anonymous_ attribute, if present,
 */
static int
MakeAnonFields(TyObject *type)
{
    TyObject *anon;
    TyObject *anon_names;
    Ty_ssize_t i;

    if (PyObject_GetOptionalAttr(type, &_Ty_ID(_anonymous_), &anon) < 0) {
        return -1;
    }
    if (anon == NULL) {
        return 0;
    }
    anon_names = PySequence_Fast(anon, "_anonymous_ must be a sequence");
    Ty_DECREF(anon);
    if (anon_names == NULL)
        return -1;

    ctypes_state *st = get_module_state_by_def(Ty_TYPE(type));
    TyTypeObject *cfield_tp = st->PyCField_Type;
    for (i = 0; i < PySequence_Fast_GET_SIZE(anon_names); ++i) {
        TyObject *fname = PySequence_Fast_GET_ITEM(anon_names, i); /* borrowed */
        CFieldObject *descr = (CFieldObject *)PyObject_GetAttr(type, fname);
        if (descr == NULL) {
            Ty_DECREF(anon_names);
            return -1;
        }
        if (!Ty_IS_TYPE(descr, cfield_tp)) {
            TyErr_Format(TyExc_AttributeError,
                         "'%U' is specified in _anonymous_ but not in "
                         "_fields_",
                         fname);
            Ty_DECREF(anon_names);
            Ty_DECREF(descr);
            return -1;
        }
        descr->anonymous = 1;

        /* descr is in the field descriptor. */
        if (-1 == MakeFields(type, (CFieldObject *)descr,
                             ((CFieldObject *)descr)->index,
                             ((CFieldObject *)descr)->byte_offset)) {
            Ty_DECREF(descr);
            Ty_DECREF(anon_names);
            return -1;
        }
        Ty_DECREF(descr);
    }

    Ty_DECREF(anon_names);
    return 0;
}


int
_replace_array_elements(ctypes_state *st, TyObject *layout_fields,
                        Ty_ssize_t ffi_ofs, StgInfo *baseinfo, StgInfo *stginfo);

/*
  Retrieve the (optional) _pack_ attribute from a type, the _fields_ attribute,
  and initialize StgInfo.  Used for Structure and Union subclasses.
*/
int
PyCStructUnionType_update_stginfo(TyObject *type, TyObject *fields, int isStruct)
{
    Ty_ssize_t ffi_ofs;
    int arrays_seen = 0;

    int retval = -1;
    // The following are NULL or hold strong references.
    // They're cleared on error.
    TyObject *layout_func = NULL;
    TyObject *kwnames = NULL;
    TyObject *align_obj = NULL;
    TyObject *size_obj = NULL;
    TyObject *layout_fields_obj = NULL;
    TyObject *layout_fields = NULL;
    TyObject *layout = NULL;
    TyObject *format_spec_obj = NULL;

    if (fields == NULL) {
        return 0;
    }

    ctypes_state *st = get_module_state_by_def(Ty_TYPE(type));
    StgInfo *stginfo;
    if (PyStgInfo_FromType(st, type, &stginfo) < 0) {
        return -1;
    }
    if (!stginfo) {
        TyErr_SetString(TyExc_TypeError,
                        "ctypes state is not initialized");
        return -1;
    }
    TyObject *base = (TyObject *)((TyTypeObject *)type)->tp_base;
    StgInfo *baseinfo;
    if (PyStgInfo_FromType(st, base, &baseinfo) < 0) {
        return -1;
    }

    STGINFO_LOCK(stginfo);
    /* If this structure/union is already marked final we cannot assign
       _fields_ anymore. */
    if (stginfo_get_dict_final(stginfo) == 1) {/* is final ? */
        TyErr_SetString(TyExc_AttributeError,
                        "_fields_ is final");
        goto error;
    }

    layout_func = TyImport_ImportModuleAttrString("ctypes._layout", "get_layout");
    if (!layout_func) {
        goto error;
    }
    kwnames = TyTuple_Pack(
        2,
        &_Ty_ID(is_struct),
        &_Ty_ID(base));
    if (!kwnames) {
        goto error;
    }
    layout = PyObject_Vectorcall(
        layout_func,
        1 + (TyObject*[]){
            NULL,
            /* positional args */
            type,
            fields,
            /* keyword args */
            isStruct ? Ty_True : Ty_False,
            baseinfo ? base : Ty_None},
        2 | PY_VECTORCALL_ARGUMENTS_OFFSET,
        kwnames);
    Ty_CLEAR(kwnames);
    Ty_CLEAR(layout_func);
    fields = NULL; // a borrowed reference we won't be using again
    if (!layout) {
        goto error;
    }

    align_obj = PyObject_GetAttr(layout, &_Ty_ID(align));
    if (!align_obj) {
        goto error;
    }
    Ty_ssize_t total_align = TyLong_AsSsize_t(align_obj);
    Ty_CLEAR(align_obj);
    if (total_align < 0) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError,
                            "align must be a non-negative integer");
        }
        goto error;
    }

    size_obj = PyObject_GetAttr(layout, &_Ty_ID(size));
    if (!size_obj) {
        goto error;
    }
    Ty_ssize_t total_size = TyLong_AsSsize_t(size_obj);
    Ty_CLEAR(size_obj);
    if (total_size < 0) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError,
                            "size must be a non-negative integer");
        }
        goto error;
    }

    format_spec_obj = PyObject_GetAttr(layout, &_Ty_ID(format_spec));
    if (!format_spec_obj) {
        goto error;
    }
    Ty_ssize_t format_spec_size;
    const char *format_spec = TyUnicode_AsUTF8AndSize(format_spec_obj,
                                                      &format_spec_size);
    if (!format_spec) {
        goto error;
    }

    if (stginfo->format) {
        TyMem_Free(stginfo->format);
        stginfo->format = NULL;
    }
    stginfo->format = TyMem_Malloc(format_spec_size + 1);
    if (!stginfo->format) {
        TyErr_NoMemory();
        goto error;
    }
    memcpy(stginfo->format, format_spec, format_spec_size + 1);

    layout_fields_obj = PyObject_GetAttr(layout, &_Ty_ID(fields));
    if (!layout_fields_obj) {
        goto error;
    }
    layout_fields = PySequence_Tuple(layout_fields_obj);
    if (!layout_fields) {
        goto error;
    }
    Ty_CLEAR(layout_fields_obj);
    Ty_CLEAR(layout);

    Ty_ssize_t len = TyTuple_GET_SIZE(layout_fields);

    if (stginfo->ffi_type_pointer.elements) {
        TyMem_Free(stginfo->ffi_type_pointer.elements);
        stginfo->ffi_type_pointer.elements = NULL;
    }

    if (baseinfo) {
        stginfo->ffi_type_pointer.type = FFI_TYPE_STRUCT;
        stginfo->ffi_type_pointer.elements = TyMem_New(ffi_type *, baseinfo->length + len + 1);
        if (stginfo->ffi_type_pointer.elements == NULL) {
            TyErr_NoMemory();
            goto error;
        }
        memset(stginfo->ffi_type_pointer.elements, 0,
               sizeof(ffi_type *) * (baseinfo->length + len + 1));
        if (baseinfo->length > 0) {
            memcpy(stginfo->ffi_type_pointer.elements,
                   baseinfo->ffi_type_pointer.elements,
                   sizeof(ffi_type *) * (baseinfo->length));
        }
        ffi_ofs = baseinfo->length;
    } else {
        stginfo->ffi_type_pointer.type = FFI_TYPE_STRUCT;
        stginfo->ffi_type_pointer.elements = TyMem_New(ffi_type *, len + 1);
        if (stginfo->ffi_type_pointer.elements == NULL) {
            TyErr_NoMemory();
            goto error;
        }
        memset(stginfo->ffi_type_pointer.elements, 0,
               sizeof(ffi_type *) * (len + 1));
        ffi_ofs = 0;
    }

    for (Ty_ssize_t i = 0; i < len; ++i) {
        TyObject *prop_obj = TyTuple_GET_ITEM(layout_fields, i);
        assert(prop_obj);
        if (!TyType_IsSubtype(Ty_TYPE(prop_obj), st->PyCField_Type)) {
            TyErr_Format(TyExc_TypeError,
                         "fields must be of type CField, got %T", prop_obj);
            goto error;

        }
        CFieldObject *prop = (CFieldObject *)prop_obj; // borrow from prop_obj

        if (prop->index != i) {
            TyErr_Format(TyExc_ValueError,
                         "field %R index mismatch (expected %zd, got %zd)",
                         prop->name, i, prop->index);
            goto error;
        }

        if (PyCArrayTypeObject_Check(st, prop->proto)) {
            arrays_seen = 1;
        }

        StgInfo *info;
        if (PyStgInfo_FromType(st, prop->proto, &info) < 0) {
            goto error;
        }
        assert(info);
        STGINFO_LOCK(info);
        stginfo->ffi_type_pointer.elements[ffi_ofs + i] = &info->ffi_type_pointer;
        if (info->flags & (TYPEFLAG_ISPOINTER | TYPEFLAG_HASPOINTER))
            stginfo->flags |= TYPEFLAG_HASPOINTER;

        stginfo_set_dict_final_lock_held(info); /* mark field type final */
        STGINFO_UNLOCK();
        if (-1 == PyObject_SetAttr(type, prop->name, prop_obj)) {
            goto error;
        }
    }

    stginfo->ffi_type_pointer.alignment = Ty_SAFE_DOWNCAST(total_align,
                                                           Ty_ssize_t,
                                                           unsigned short);
    stginfo->ffi_type_pointer.size = total_size;

    stginfo->size = total_size;
    stginfo->align = total_align;
    stginfo->length = ffi_ofs + len;

/*
 * The value of MAX_STRUCT_SIZE depends on the platform Python is running on.
 */
#if defined(__aarch64__) || defined(__arm__) || defined(_M_ARM64) || defined(__sparc__)
#  define MAX_STRUCT_SIZE 32
#elif defined(__powerpc64__)
#  define MAX_STRUCT_SIZE 64
#else
#  define MAX_STRUCT_SIZE 16
#endif

    if (arrays_seen && (total_size <= MAX_STRUCT_SIZE)) {
        if (_replace_array_elements(st, layout_fields, ffi_ofs, baseinfo, stginfo) < 0) {
            goto error;
        }
    }

    /* We did check that this flag was NOT set above, it must not
       have been set until now. */
    if (stginfo_get_dict_final(stginfo) == 1) {
        TyErr_SetString(TyExc_AttributeError,
                        "Structure or union cannot contain itself");
        goto error;
    }
    stginfo_set_dict_final_lock_held(stginfo);

    retval = MakeAnonFields(type);
error:;
    Ty_XDECREF(layout_func);
    Ty_XDECREF(kwnames);
    Ty_XDECREF(align_obj);
    Ty_XDECREF(size_obj);
    Ty_XDECREF(layout_fields_obj);
    Ty_XDECREF(layout_fields);
    Ty_XDECREF(layout);
    Ty_XDECREF(format_spec_obj);
    STGINFO_UNLOCK();
    return retval;
}

/*
  Replace array elements at stginfo->ffi_type_pointer.elements.
  Return -1 if error occurred.
*/
int
_replace_array_elements(ctypes_state *st, TyObject *layout_fields,
                        Ty_ssize_t ffi_ofs, StgInfo *baseinfo, StgInfo *stginfo)
{
    /*
     * See bpo-22273 and gh-110190. Arrays are normally treated as
     * pointers, which is fine when an array name is being passed as
     * parameter, but not when passing structures by value that contain
     * arrays.
     * Small structures passed by value are passed in registers, and in
     * order to do this, libffi needs to know the true type of the array
     * members of structs. Treating them as pointers breaks things.
     *
     * Small structures have different sizes depending on the platform
     * where Python is running on:
     *
     *      * x86-64: 16 bytes or less
     *      * Arm platforms (both 32 and 64 bit): 32 bytes or less
     *      * PowerPC 64 Little Endian: 64 bytes or less
     *
     * In that case, there can't be more than 16, 32 or 64 elements after
     * unrolling arrays, as we (will) disallow bitfields.
     * So we can collect the true ffi_type values in a fixed-size local
     * array on the stack and, if any arrays were seen, replace the
     * ffi_type_pointer.elements with a more accurate set, to allow
     * libffi to marshal them into registers correctly.
     * It means one more loop over the fields, but if we got here,
     * the structure is small, so there aren't too many of those.
     *
     * Although the passing in registers is specific to the above
     * platforms, the array-in-struct vs. pointer problem is general.
     * But we restrict the type transformation to small structs
     * nonetheless.
     *
     * Note that although a union may be small in terms of memory usage, it
     * could contain many overlapping declarations of arrays, e.g.
     *
     * union {
     *     unsigned int_8 foo [16];
     *     unsigned uint_8 bar [16];
     *     unsigned int_16 baz[8];
     *     unsigned uint_16 bozz[8];
     *     unsigned int_32 fizz[4];
     *     unsigned uint_32 buzz[4];
     * }
     *
     * which is still only 16 bytes in size. We need to convert this into
     * the following equivalent for libffi:
     *
     * union {
     *     struct { int_8 e1; int_8 e2; ... int_8 e_16; } f1;
     *     struct { uint_8 e1; uint_8 e2; ... uint_8 e_16; } f2;
     *     struct { int_16 e1; int_16 e2; ... int_16 e_8; } f3;
     *     struct { uint_16 e1; uint_16 e2; ... uint_16 e_8; } f4;
     *     struct { int_32 e1; int_32 e2; ... int_32 e_4; } f5;
     *     struct { uint_32 e1; uint_32 e2; ... uint_32 e_4; } f6;
     * }
     *
     * The same principle applies for a struct 32 or 64 bytes in size.
     *
     * So the struct/union needs setting up as follows: all non-array
     * elements copied across as is, and all array elements replaced with
     * an equivalent struct which has as many fields as the array has
     * elements, plus one NULL pointer.
     */

    Ty_ssize_t num_ffi_type_pointers = 0;  /* for the dummy fields */
    Ty_ssize_t num_ffi_types = 0;  /* for the dummy structures */
    size_t alloc_size;  /* total bytes to allocate */
    void *type_block = NULL;  /* to hold all the type information needed */
    ffi_type **element_types;  /* of this struct/union */
    ffi_type **dummy_types;  /* of the dummy struct elements */
    ffi_type *structs;  /* point to struct aliases of arrays */
    Ty_ssize_t element_index;  /* index into element_types for this */
    Ty_ssize_t dummy_index = 0; /* index into dummy field pointers */
    Ty_ssize_t struct_index = 0; /* index into dummy structs */

    Ty_ssize_t len = TyTuple_GET_SIZE(layout_fields);

    /* first pass to see how much memory to allocate */
    for (Ty_ssize_t i = 0; i < len; ++i) {
        TyObject *prop_obj = TyTuple_GET_ITEM(layout_fields, i); // borrowed
        assert(prop_obj);
        assert(TyType_IsSubtype(Ty_TYPE(prop_obj), st->PyCField_Type));
        CFieldObject *prop = (CFieldObject *)prop_obj; // borrowed

        StgInfo *info;
        if (PyStgInfo_FromType(st, prop->proto, &info) < 0) {
            goto error;
        }
        assert(info);

        if (!PyCArrayTypeObject_Check(st, prop->proto)) {
            /* Not an array. Just need an ffi_type pointer. */
            num_ffi_type_pointers++;
        }
        else {
            /* It's an array. */
            Ty_ssize_t length = info->length;

            StgInfo *einfo;
            if (PyStgInfo_FromType(st, info->proto, &einfo) < 0) {
                goto error;
            }
            if (einfo == NULL) {
                TyErr_Format(TyExc_TypeError,
                    "second item in _fields_ tuple (index %zd) must be a C type",
                    i);
                goto error;
            }
            /*
             * We need one extra ffi_type to hold the struct, and one
             * ffi_type pointer per array element + one for a NULL to
             * mark the end.
             */
            num_ffi_types++;
            num_ffi_type_pointers += length + 1;
        }
    }

    /*
     * At this point, we know we need storage for some ffi_types and some
     * ffi_type pointers. We'll allocate these in one block.
     * There are three sub-blocks of information: the ffi_type pointers to
     * this structure/union's elements, the ffi_type_pointers to the
     * dummy fields standing in for array elements, and the
     * ffi_types representing the dummy structures.
     */
    alloc_size = (ffi_ofs + 1 + len + num_ffi_type_pointers) * sizeof(ffi_type *) +
                  num_ffi_types * sizeof(ffi_type);
    type_block = TyMem_Malloc(alloc_size);

    if (type_block == NULL) {
        TyErr_NoMemory();
        goto error;
    }
    /*
     * the first block takes up ffi_ofs + len + 1 which is the pointers *
     * for this struct/union. The second block takes up
     * num_ffi_type_pointers, so the sum of these is ffi_ofs + len + 1 +
     * num_ffi_type_pointers as allocated above. The last bit is the
     * num_ffi_types structs.
     */
    element_types = (ffi_type **) type_block;
    dummy_types = &element_types[ffi_ofs + len + 1];
    structs = (ffi_type *) &dummy_types[num_ffi_type_pointers];

    if (num_ffi_types > 0) {
        memset(structs, 0, num_ffi_types * sizeof(ffi_type));
    }
    if (ffi_ofs && (baseinfo != NULL)) {
        memcpy(element_types,
            baseinfo->ffi_type_pointer.elements,
            ffi_ofs * sizeof(ffi_type *));
    }
    element_index = ffi_ofs;

    /* second pass to actually set the type pointers */
    for (Ty_ssize_t i = 0; i < len; ++i) {
        TyObject *prop_obj = TyTuple_GET_ITEM(layout_fields, i); // borrowed
        assert(prop_obj);
        assert(TyType_IsSubtype(Ty_TYPE(prop_obj), st->PyCField_Type));
        CFieldObject *prop = (CFieldObject *)prop_obj; // borrowed

        StgInfo *info;
        if (PyStgInfo_FromType(st, prop->proto, &info) < 0) {
            goto error;
        }
        assert(info);

        assert(element_index < (ffi_ofs + len)); /* will be used below */
        if (!PyCArrayTypeObject_Check(st, prop->proto)) {
            /* Not an array. Just copy over the element ffi_type. */
            element_types[element_index++] = &info->ffi_type_pointer;
        }
        else {
            Ty_ssize_t length = info->length;
            StgInfo *einfo;
            if (PyStgInfo_FromType(st, info->proto, &einfo) < 0) {
                goto error;
            }
            if (einfo == NULL) {
                TyErr_Format(TyExc_TypeError,
                    "second item in _fields_ tuple (index %zd) must be a C type",
                    i);
                goto error;
            }
            element_types[element_index++] = &structs[struct_index];
            structs[struct_index].size = length * einfo->ffi_type_pointer.size;
            structs[struct_index].alignment = einfo->ffi_type_pointer.alignment;
            structs[struct_index].type = FFI_TYPE_STRUCT;
            structs[struct_index].elements = &dummy_types[dummy_index];
            ++struct_index;
            /* Copy over the element's type, length times. */
            while (length > 0) {
                assert(dummy_index < (num_ffi_type_pointers));
                dummy_types[dummy_index++] = &einfo->ffi_type_pointer;
                length--;
            }
            assert(dummy_index < (num_ffi_type_pointers));
            dummy_types[dummy_index++] = NULL;
        }
    }

    element_types[element_index] = NULL;
    /*
     * Replace the old elements with the new, taking into account
     * base class elements where necessary.
     */
    assert(stginfo->ffi_type_pointer.elements);
    TyMem_Free(stginfo->ffi_type_pointer.elements);
    stginfo->ffi_type_pointer.elements = element_types;

    return 0;

error:
    TyMem_Free(type_block);
    return -1;
}
