# Tokenize Token Format specification
The Tokenize Token Format is inspired from the [JWT](https://jwt.io/) standard, with some major differences making it
suitable for use in persistent authentication tokens.

JWT is an amazing format for exchanging a quick piece of data over an insecure channel (like as a GET parameter through
a redirect), or for short-lived sessions. Their main advantage is that they are stateful and doesn't require calling
the database to have data.

Tokenize, on the other hand, is suited for tokens which can live virtually forever, and can be invalidated at any time.
However, it only carries an identifier and a generation timestamp, which means you will need to call the database
every time. You will also have to store additional data in your database for the invalidation part.

## Token format
All parts of a token are encoded in base64 (without padding), except for the prefix. They are separated by a dot,
similarly to Json Web Tokens.
```
xxxxxx.OTQ3NjI0OTI5MjM3NDgzNTI.MTc4MzkxODI.dGhpcyBpcyBhIHZlcnkgc2VjdXJlIHNpZ25hdHVyZSB3ZHlt
------ ----------------------- ----------- -------------------------------------------------
Prefix       Account ID         Gen. Date              HMAC SHA256 Signature
```

 - **Prefix** (optional)<br>
   You can put any string here (provided it doesn't contain a dot), although it is preferable to keep it short.
   **You cannot use dots in prefixes**. See [Prefix usage](#prefix-usage) for info about how it's meant to be used.

 - **Account ID**<br>
   This is the ID that will be used to look up who this token belongs to. Should be in most cases the ID you have in
   database, for quick and easy lookup.

 - **Generation Date**<br>
   This piece of data is used for token invalidation. It is a timestamp of when the token was generated (number of
   seconds elapsed since 1st January 2019; alternatively `UNIX - 1546300800`).

 - **HMAC SHA256 Signature**<br>
   The signature is how Tokenize knows if the token is legitimate one or not. The signature is the digest of the
   token signature prefix (`TTF.1`), the prefix (if any), the account id and generation date (all dot separated,
   just like the token itself).

## Additional data to store
For invalidating tokens, you will have to store additional data. Fortunately, you only need to store 1 thing: the
timestamp since when tokens have been last reset.

Most implementations should provide an utility for fetching Tokenize timestamps. When creating user database entry,
you should keep this value. The reference implementation assumes you have named this field `lastTokenReset` or
`last_token_reset`, so you should stick to this field name.
