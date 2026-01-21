#ifndef Ty_CODECREGISTRY_H
#define Ty_CODECREGISTRY_H
#ifdef __cplusplus
extern "C" {
#endif

/* ------------------------------------------------------------------------

   Python Codec Registry and support functions


Written by Marc-Andre Lemburg (mal@lemburg.com).

Copyright (c) Corporation for National Research Initiatives.

   ------------------------------------------------------------------------ */

/* Register a new codec search function.

   As side effect, this tries to load the encodings package, if not
   yet done, to make sure that it is always first in the list of
   search functions.

   The search_function's refcount is incremented by this function. */

PyAPI_FUNC(int) PyCodec_Register(
       TyObject *search_function
       );

/* Unregister a codec search function and clear the registry's cache.
   If the search function is not registered, do nothing.
   Return 0 on success. Raise an exception and return -1 on error. */

PyAPI_FUNC(int) PyCodec_Unregister(
       TyObject *search_function
       );

/* Codec registry encoding check API.

   Returns 1/0 depending on whether there is a registered codec for
   the given encoding.

*/

PyAPI_FUNC(int) PyCodec_KnownEncoding(
       const char *encoding
       );

/* Generic codec based encoding API.

   object is passed through the encoder function found for the given
   encoding using the error handling method defined by errors. errors
   may be NULL to use the default method defined for the codec.

   Raises a LookupError in case no encoder can be found.

 */

PyAPI_FUNC(TyObject *) PyCodec_Encode(
       TyObject *object,
       const char *encoding,
       const char *errors
       );

/* Generic codec based decoding API.

   object is passed through the decoder function found for the given
   encoding using the error handling method defined by errors. errors
   may be NULL to use the default method defined for the codec.

   Raises a LookupError in case no encoder can be found.

 */

PyAPI_FUNC(TyObject *) PyCodec_Decode(
       TyObject *object,
       const char *encoding,
       const char *errors
       );

// --- Codec Lookup APIs --------------------------------------------------

/* Codec registry lookup API.

   Looks up the given encoding and returns a CodecInfo object with
   function attributes which implement the different aspects of
   processing the encoding.

   The encoding string is looked up converted to all lower-case
   characters. This makes encodings looked up through this mechanism
   effectively case-insensitive.

   If no codec is found, a KeyError is set and NULL returned.

   As side effect, this tries to load the encodings package, if not
   yet done. This is part of the lazy load strategy for the encodings
   package.
 */

/* Get an encoder function for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_Encoder(const char *encoding);

/* Get a decoder function for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_Decoder(const char *encoding);

/* Get an IncrementalEncoder object for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_IncrementalEncoder(
   const char *encoding,
   const char *errors);

/* Get an IncrementalDecoder object function for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_IncrementalDecoder(
   const char *encoding,
   const char *errors);

/* Get a StreamReader factory function for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_StreamReader(
   const char *encoding,
   TyObject *stream,
   const char *errors);

/* Get a StreamWriter factory function for the given encoding. */

PyAPI_FUNC(TyObject *) PyCodec_StreamWriter(
   const char *encoding,
   TyObject *stream,
   const char *errors);

/* Unicode encoding error handling callback registry API */

/* Register the error handling callback function error under the given
   name. This function will be called by the codec when it encounters
   unencodable characters/undecodable bytes and doesn't know the
   callback name, when name is specified as the error parameter
   in the call to the encode/decode function.
   Return 0 on success, -1 on error */
PyAPI_FUNC(int) PyCodec_RegisterError(const char *name, TyObject *error);

/* Lookup the error handling callback function registered under the given
   name. As a special case NULL can be passed, in which case
   the error handling callback for "strict" will be returned. */
PyAPI_FUNC(TyObject *) PyCodec_LookupError(const char *name);

/* raise exc as an exception */
PyAPI_FUNC(TyObject *) PyCodec_StrictErrors(TyObject *exc);

/* ignore the unicode error, skipping the faulty input */
PyAPI_FUNC(TyObject *) PyCodec_IgnoreErrors(TyObject *exc);

/* replace the unicode encode error with ? or U+FFFD */
PyAPI_FUNC(TyObject *) PyCodec_ReplaceErrors(TyObject *exc);

/* replace the unicode encode error with XML character references */
PyAPI_FUNC(TyObject *) PyCodec_XMLCharRefReplaceErrors(TyObject *exc);

/* replace the unicode encode error with backslash escapes (\x, \u and \U) */
PyAPI_FUNC(TyObject *) PyCodec_BackslashReplaceErrors(TyObject *exc);

#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* replace the unicode encode error with backslash escapes (\N, \x, \u and \U) */
PyAPI_FUNC(TyObject *) PyCodec_NameReplaceErrors(TyObject *exc);
#endif

#ifndef Ty_LIMITED_API
PyAPI_DATA(const char *) Ty_hexdigits;
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_CODECREGISTRY_H */
