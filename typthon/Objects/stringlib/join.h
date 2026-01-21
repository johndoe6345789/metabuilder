/* stringlib: bytes joining implementation */

#if STRINGLIB_IS_UNICODE
#error join.h only compatible with byte-wise strings
#endif

Ty_LOCAL_INLINE(TyObject *)
STRINGLIB(bytes_join)(TyObject *sep, TyObject *iterable)
{
    const char *sepstr = STRINGLIB_STR(sep);
    Ty_ssize_t seplen = STRINGLIB_LEN(sep);
    TyObject *res = NULL;
    char *p;
    Ty_ssize_t seqlen = 0;
    Ty_ssize_t sz = 0;
    Ty_ssize_t i, nbufs;
    TyObject *seq, *item;
    Ty_buffer *buffers = NULL;
#define NB_STATIC_BUFFERS 10
    Ty_buffer static_buffers[NB_STATIC_BUFFERS];
#define GIL_THRESHOLD 1048576
    int drop_gil = 1;
    TyThreadState *save = NULL;

    seq = PySequence_Fast(iterable, "can only join an iterable");
    if (seq == NULL) {
        return NULL;
    }

    seqlen = PySequence_Fast_GET_SIZE(seq);
    if (seqlen == 0) {
        Ty_DECREF(seq);
        return STRINGLIB_NEW(NULL, 0);
    }
#if !STRINGLIB_MUTABLE
    if (seqlen == 1) {
        item = PySequence_Fast_GET_ITEM(seq, 0);
        if (STRINGLIB_CHECK_EXACT(item)) {
            Ty_INCREF(item);
            Ty_DECREF(seq);
            return item;
        }
    }
#endif
    if (seqlen > NB_STATIC_BUFFERS) {
        buffers = TyMem_NEW(Ty_buffer, seqlen);
        if (buffers == NULL) {
            Ty_DECREF(seq);
            TyErr_NoMemory();
            return NULL;
        }
    }
    else {
        buffers = static_buffers;
    }

    /* Here is the general case.  Do a pre-pass to figure out the total
     * amount of space we'll need (sz), and see whether all arguments are
     * bytes-like.
     */
    for (i = 0, nbufs = 0; i < seqlen; i++) {
        Ty_ssize_t itemlen;
        item = PySequence_Fast_GET_ITEM(seq, i);
        if (TyBytes_CheckExact(item)) {
            /* Fast path. */
            buffers[i].obj = Ty_NewRef(item);
            buffers[i].buf = TyBytes_AS_STRING(item);
            buffers[i].len = TyBytes_GET_SIZE(item);
        }
        else {
            if (PyObject_GetBuffer(item, &buffers[i], PyBUF_SIMPLE) != 0) {
                TyErr_Format(TyExc_TypeError,
                             "sequence item %zd: expected a bytes-like object, "
                             "%.80s found",
                             i, Ty_TYPE(item)->tp_name);
                goto error;
            }
            /* If the backing objects are mutable, then dropping the GIL
             * opens up race conditions where another thread tries to modify
             * the object which we hold a buffer on it. Such code has data
             * races anyway, but this is a conservative approach that avoids
             * changing the behaviour of that data race.
             */
            drop_gil = 0;
        }
        nbufs = i + 1;  /* for error cleanup */
        itemlen = buffers[i].len;
        if (itemlen > PY_SSIZE_T_MAX - sz) {
            TyErr_SetString(TyExc_OverflowError,
                            "join() result is too long");
            goto error;
        }
        sz += itemlen;
        if (i != 0) {
            if (seplen > PY_SSIZE_T_MAX - sz) {
                TyErr_SetString(TyExc_OverflowError,
                                "join() result is too long");
                goto error;
            }
            sz += seplen;
        }
        if (seqlen != PySequence_Fast_GET_SIZE(seq)) {
            TyErr_SetString(TyExc_RuntimeError,
                            "sequence changed size during iteration");
            goto error;
        }
    }

    /* Allocate result space. */
    res = STRINGLIB_NEW(NULL, sz);
    if (res == NULL)
        goto error;

    /* Catenate everything. */
    p = STRINGLIB_STR(res);
    if (sz < GIL_THRESHOLD) {
        drop_gil = 0;   /* Benefits are likely outweighed by the overheads */
    }
    if (drop_gil) {
        save = TyEval_SaveThread();
    }
    if (!seplen) {
        /* fast path */
        for (i = 0; i < nbufs; i++) {
            Ty_ssize_t n = buffers[i].len;
            char *q = buffers[i].buf;
            memcpy(p, q, n);
            p += n;
        }
    }
    else {
        for (i = 0; i < nbufs; i++) {
            Ty_ssize_t n;
            char *q;
            if (i) {
                memcpy(p, sepstr, seplen);
                p += seplen;
            }
            n = buffers[i].len;
            q = buffers[i].buf;
            memcpy(p, q, n);
            p += n;
        }
    }
    if (drop_gil) {
        TyEval_RestoreThread(save);
    }
    goto done;

error:
    res = NULL;
done:
    Ty_DECREF(seq);
    for (i = 0; i < nbufs; i++)
        PyBuffer_Release(&buffers[i]);
    if (buffers != static_buffers)
        TyMem_Free(buffers);
    return res;
}

#undef NB_STATIC_BUFFERS
#undef GIL_THRESHOLD
