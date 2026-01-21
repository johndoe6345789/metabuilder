/*
   Unicode character type helpers.

   Written by Marc-Andre Lemburg (mal@lemburg.com).
   Modified for Python 2.0 by Fredrik Lundh (fredrik@pythonware.com)

   Copyright (c) Corporation for National Research Initiatives.

*/

#include "Python.h"

#define ALPHA_MASK 0x01
#define DECIMAL_MASK 0x02
#define DIGIT_MASK 0x04
#define LOWER_MASK 0x08
#define TITLE_MASK 0x40
#define UPPER_MASK 0x80
#define XID_START_MASK 0x100
#define XID_CONTINUE_MASK 0x200
#define PRINTABLE_MASK 0x400
#define NUMERIC_MASK 0x800
#define CASE_IGNORABLE_MASK 0x1000
#define CASED_MASK 0x2000
#define EXTENDED_CASE_MASK 0x4000

typedef struct {
    /*
       These are either deltas to the character or offsets in
       _TyUnicode_ExtendedCase.
    */
    const int upper;
    const int lower;
    const int title;
    /* Note if more flag space is needed, decimal and digit could be unified. */
    const unsigned char decimal;
    const unsigned char digit;
    const unsigned short flags;
} _TyUnicode_TypeRecord;

#include "unicodetype_db.h"

static const _TyUnicode_TypeRecord *
gettyperecord(Ty_UCS4 code)
{
    int index;

    if (code >= 0x110000)
        index = 0;
    else
    {
        index = index1[(code>>SHIFT)];
        index = index2[(index<<SHIFT)+(code&((1<<SHIFT)-1))];
    }

    return &_TyUnicode_TypeRecords[index];
}

/* Returns the titlecase Unicode characters corresponding to ch or just
   ch if no titlecase mapping is known. */

Ty_UCS4 _TyUnicode_ToTitlecase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK)
        return _TyUnicode_ExtendedCase[ctype->title & 0xFFFF];
    return ch + ctype->title;
}

/* Returns 1 for Unicode characters having the category 'Lt', 0
   otherwise. */

int _TyUnicode_IsTitlecase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & TITLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the XID_Start property, 0
   otherwise. */

int _TyUnicode_IsXidStart(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & XID_START_MASK) != 0;
}

/* Returns 1 for Unicode characters having the XID_Continue property,
   0 otherwise. */

int _TyUnicode_IsXidContinue(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & XID_CONTINUE_MASK) != 0;
}

/* Returns the integer decimal (0-9) for Unicode characters having
   this property, -1 otherwise. */

int _TyUnicode_ToDecimalDigit(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & DECIMAL_MASK) ? ctype->decimal : -1;
}

int _TyUnicode_IsDecimalDigit(Ty_UCS4 ch)
{
    if (_TyUnicode_ToDecimalDigit(ch) < 0)
        return 0;
    return 1;
}

/* Returns the integer digit (0-9) for Unicode characters having
   this property, -1 otherwise. */

int _TyUnicode_ToDigit(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & DIGIT_MASK) ? ctype->digit : -1;
}

int _TyUnicode_IsDigit(Ty_UCS4 ch)
{
    if (_TyUnicode_ToDigit(ch) < 0)
        return 0;
    return 1;
}

/* Returns the numeric value as double for Unicode characters having
   this property, -1.0 otherwise. */

int _TyUnicode_IsNumeric(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & NUMERIC_MASK) != 0;
}

/* Returns 1 for Unicode characters that repr() may use in its output,
   and 0 for characters to be hex-escaped.

   See documentation of `str.isprintable` for details.
*/
int _TyUnicode_IsPrintable(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & PRINTABLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Ll', 0
   otherwise. */

int _TyUnicode_IsLowercase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & LOWER_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Lu', 0
   otherwise. */

int _TyUnicode_IsUppercase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & UPPER_MASK) != 0;
}

/* Returns the uppercase Unicode characters corresponding to ch or just
   ch if no uppercase mapping is known. */

Ty_UCS4 _TyUnicode_ToUppercase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK)
        return _TyUnicode_ExtendedCase[ctype->upper & 0xFFFF];
    return ch + ctype->upper;
}

/* Returns the lowercase Unicode characters corresponding to ch or just
   ch if no lowercase mapping is known. */

Ty_UCS4 _TyUnicode_ToLowercase(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK)
        return _TyUnicode_ExtendedCase[ctype->lower & 0xFFFF];
    return ch + ctype->lower;
}

int _TyUnicode_ToLowerFull(Ty_UCS4 ch, Ty_UCS4 *res)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK) {
        int index = ctype->lower & 0xFFFF;
        int n = ctype->lower >> 24;
        int i;
        for (i = 0; i < n; i++)
            res[i] = _TyUnicode_ExtendedCase[index + i];
        return n;
    }
    res[0] = ch + ctype->lower;
    return 1;
}

int _TyUnicode_ToTitleFull(Ty_UCS4 ch, Ty_UCS4 *res)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK) {
        int index = ctype->title & 0xFFFF;
        int n = ctype->title >> 24;
        int i;
        for (i = 0; i < n; i++)
            res[i] = _TyUnicode_ExtendedCase[index + i];
        return n;
    }
    res[0] = ch + ctype->title;
    return 1;
}

int _TyUnicode_ToUpperFull(Ty_UCS4 ch, Ty_UCS4 *res)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK) {
        int index = ctype->upper & 0xFFFF;
        int n = ctype->upper >> 24;
        int i;
        for (i = 0; i < n; i++)
            res[i] = _TyUnicode_ExtendedCase[index + i];
        return n;
    }
    res[0] = ch + ctype->upper;
    return 1;
}

int _TyUnicode_ToFoldedFull(Ty_UCS4 ch, Ty_UCS4 *res)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    if (ctype->flags & EXTENDED_CASE_MASK && (ctype->lower >> 20) & 7) {
        int index = (ctype->lower & 0xFFFF) + (ctype->lower >> 24);
        int n = (ctype->lower >> 20) & 7;
        int i;
        for (i = 0; i < n; i++)
            res[i] = _TyUnicode_ExtendedCase[index + i];
        return n;
    }
    return _TyUnicode_ToLowerFull(ch, res);
}

int _TyUnicode_IsCased(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & CASED_MASK) != 0;
}

int _TyUnicode_IsCaseIgnorable(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & CASE_IGNORABLE_MASK) != 0;
}

/* Returns 1 for Unicode characters having the category 'Ll', 'Lu', 'Lt',
   'Lo' or 'Lm',  0 otherwise. */

int _TyUnicode_IsAlpha(Ty_UCS4 ch)
{
    const _TyUnicode_TypeRecord *ctype = gettyperecord(ch);

    return (ctype->flags & ALPHA_MASK) != 0;
}

