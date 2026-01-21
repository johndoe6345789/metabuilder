/* Fast unicode equal function optimized for dictobject.c and setobject.c */

/* Return 1 if two unicode objects are equal, 0 if not.
 * unicode_eq() is called when the hash of two unicode objects is equal.
 */
Ty_LOCAL_INLINE(int)
unicode_eq(TyObject *str1, TyObject *str2)
{
    Ty_ssize_t len = TyUnicode_GET_LENGTH(str1);
    if (TyUnicode_GET_LENGTH(str2) != len) {
        return 0;
    }

    int kind = TyUnicode_KIND(str1);
    if (TyUnicode_KIND(str2) != kind) {
        return 0;
    }

    const void *data1 = TyUnicode_DATA(str1);
    const void *data2 = TyUnicode_DATA(str2);
    return (memcmp(data1, data2, len * kind) == 0);
}
