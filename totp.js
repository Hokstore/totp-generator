/*
 * Minimal TOTP (RFC 6238) / HOTP (RFC 4226) implementation using the Web Crypto API.
 * Runs entirely in the browser (or Node 18+). The secret never leaves the device.
 * MIT License.
 */
(function (root) {
  'use strict';

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /** Decode a Base32 secret (spaces, dashes and lowercase allowed). Throws on invalid input. */
  function base32Decode(input) {
    var clean = String(input || '').toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
    if (!clean.length) throw new Error('Empty secret');
    var bits = 0, value = 0, out = [];
    for (var i = 0; i < clean.length; i++) {
      var idx = ALPHABET.indexOf(clean.charAt(i));
      if (idx === -1) throw new Error('Invalid Base32 character: ' + clean.charAt(i));
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return new Uint8Array(out);
  }

  function counterBytes(counter) {
    var buf = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) {
      buf[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }
    return buf;
  }

  /** HOTP value for raw key bytes. algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512'. */
  async function hotp(keyBytes, counter, digits, algorithm) {
    var subtle = (root.crypto && root.crypto.subtle) || (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle);
    if (!subtle) throw new Error('Web Crypto API is not available');
    var key = await subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algorithm || 'SHA-1' }, false, ['sign']);
    var mac = new Uint8Array(await subtle.sign('HMAC', key, counterBytes(counter)));
    var offset = mac[mac.length - 1] & 0x0f;
    var bin = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
    var code = String(bin % Math.pow(10, digits || 6));
    while (code.length < (digits || 6)) code = '0' + code;
    return code;
  }

  /**
   * Current TOTP code for a Base32 secret.
   * options: { period: 30, digits: 6, algorithm: 'SHA-1', time: Date.now() }
   * Returns { code, remaining } where remaining is seconds left in the current period.
   */
  async function totp(secret, options) {
    var o = options || {};
    var period = o.period || 30;
    var now = typeof o.time === 'number' ? o.time : Date.now();
    var counter = Math.floor(now / 1000 / period);
    var code = await hotp(base32Decode(secret), counter, o.digits || 6, o.algorithm || 'SHA-1');
    return { code: code, remaining: period - Math.floor(now / 1000) % period };
  }

  /** Build an otpauth:// URI for authenticator apps. */
  function otpauthUri(secret, label, issuer) {
    var s = String(secret || '').toUpperCase().replace(/[\s-]/g, '');
    var l = encodeURIComponent(label || 'account');
    var uri = 'otpauth://totp/' + (issuer ? encodeURIComponent(issuer) + ':' : '') + l + '?secret=' + s;
    if (issuer) uri += '&issuer=' + encodeURIComponent(issuer);
    return uri;
  }

  var api = { base32Decode: base32Decode, hotp: hotp, totp: totp, otpauthUri: otpauthUri };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TOTP = api;
})(typeof window !== 'undefined' ? window : globalThis);
