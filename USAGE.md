# Use Tokenize for NodeJS
## Installation
```
pnpm i @cyyynthia/tokenize
yarn add @cyyynthia/tokenize
npm i @cyyynthia/tokenize
```

## Usage
```js
import Tokenize from '@cyyynthia/tokenize'
// Or using CommonJS: const Tokenize = require('@cyyynthia/tokenize')

const tokenize = new Tokenize('--A very long secret nobody knows or can guess (so not the name of your pet)--)

// Generating a token
console.log(tokenize.generate('account_id')) // xxxxxxxx.xxxxxxxxxxx.xxxxxxxxx
console.log(tokenize.generate('account_id', 'prefix')) // prefix.xxxxxxxx.xxxxxxxxxxx.xxxxxxxxx

// Validating a token
//
// Tokenize requires you to provide a function, which will receive the account ID (as a string), and the prefix (if
// there is any, null otherwise).
//
// This function should return an object representing a user account (or null if the ID doesn't belong to an account
// in your database).
//
// Tokenize expects the object to contain either `lastTokenReset` or `last_token_reset`. If missing, it'll always
// return that the token belongs to nobody.
//
// Tokenize will return the account (the exact same object your function returned) on success, `false` if the token
// was invalid, and `null` if no account were found.
//
// Note: Your function can return a Promise, or the object directly. If you send a Promise, Tokenize will also return
// a Promise, making the check async. Otherwise, the check will be sync.
console.log(tokenize.validate('xxxxxxxx.xxxxxxxxxxx.xxxxxxxxx', (id, prefix) => ...))
console.log(await tokenize.validate('xxxxxxxx.xxxxxxxxxxx.xxxxxxxxx', async (id, prefix) => ...))

// Get a timestamp
console.log(Tokenize.currentTokenTime())
```

## Usage with Fastify
Looking to use this in a [Fastify](https://fastify.io) application? Give
[fastify-tokenize](https://github.com/Bowser65/fastify-tokenize) a look! :D
