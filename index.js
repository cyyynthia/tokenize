/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const { createHmac } = require('crypto')


/**
 * Signs a string with the HMAC-SHA256 algorithm
 * @param {string} string string to sign
 * @return {string} Base64 digest without padding
 * @private
 */
function computeHmac (string, secret) {
  return createHmac('sha256', secret)
    .update(`TTF.${Tokenize.VERSION}.${string}`)
    .digest('base64')
    .replace(/=/g, '')
}

/**
 * Safely check the equality of two strings
 * @param {string} str1 string to compare
 * @param {string} str2 string to compare
 * @return {boolean} Whether the strings are equal
 * @private
 */
function safeEqual (str1, str2) {
  if (str1.length !== str2.length) return false

  let mismatch = 0
  for (let i = 0; i < str1.length; i++) {
    mismatch |= (str1.charCodeAt(i) ^ str2.charCodeAt(i))
  }
  return mismatch === 0
}

/**
 * @class Tokenize
 * @author Cynthia
 * @since 25/11/2020
 * @property {number} VERSION Tokenize Token Format version
 * @property {number} TOKENIZE_EPOCH First second of 2019, used to get shorter tokens
 */
class Tokenize {
  get VERSION () { return 1 }
  get TOKENIZE_EPOCH () { return 1546300800000 }

  /**
   * Tokenize constructor
   * @param {string} secret Secret used to sign the tokens
   */
  constructor (secret) {
    this._secret = secret
  }

  /**
   * Generates a new token for a given account
   * @param {string} accountId The account id this token belongs to
   * @param {string} prefix Optional prefix for the token
   * @return {string}
   */
  generate (accountId, prefix = null) {
    const currentTime = Tokenize.currentTokenTime().toString()
    const accountPart = Buffer.from(accountId).toString('base64')
    const timePart = Buffer.from(currentTime).toString('base64')
    const token = `${prefix ? `${prefix}.` : ''}${accountPart}.${timePart}`.replace(/=/g, '')
    const signature = computeHmac(token, this._secret)
    return `${token}.${signature}`
  }

  /**
   * Validates a token
   * @param {string} token The provided token
   * @param {function} accountFetcher The function used to fetch the account. It'll receive the account id as a string
   * and the prefix (or null) and should return an object with 'lastTokenReset' field. It'll be returned if the token
   * is valid.
   * @return {Promise<object|false|null>|object|false|null} The account if the token is valid and an account is tied
   * to this token. false if the token is invalid, null if no account is tied to this token.
   */
  validate (token, accountFetcher) {
    let prefix = null
    const splitted = token.split('.')
    if (splitted.length < 3 || splitted.length > 4) return false
    if (splitted.length === 4) prefix = splitted.shift()

    const signatureStr = `${prefix ? `${prefix}.` : ''}${splitted[0]}.${splitted[1]}`
    if (!safeEqual(splitted[2], computeHmac(signatureStr, this._secret))) return false

    const accountId = Buffer.from(splitted[0], 'base64').toString('utf8')
    const genTime = Buffer.from(splitted[1], 'base64').toString('utf8')
    const account = accountFetcher(accountId, prefix)
    if (!account) return null

    if (typeof account.then === 'function') {
      return account.then(account => this._finishValidation(account, genTime))
    } else {
      return this._finishValidation(account, genTime)
    }
  }

  _finishValidation (account, genTime) {
    let lastTokenReset
    if (Object.prototype.hasOwnProperty.call(account, 'lastTokenReset')) {
      lastTokenReset = account.lastTokenReset
    } else if (Object.prototype.hasOwnProperty.call(account, 'last_token_reset')) {
      lastTokenReset = account.last_token_reset
    }

    if (typeof lastTokenReset !== 'number' || lastTokenReset > genTime) return null
    return account
  }

  /**
   * Returns the current token time based on the Tokenize Epoch
   * @return {number} Current token time
   */
  static currentTokenTime () {
    return Math.floor((Date.now() - Tokenize.TOKENIZE_EPOCH) / 1000)
  }
}

module.exports = Tokenize
module.exports.default = Tokenize
Object.defineProperty(module.exports, '__esModule', { value: true })
