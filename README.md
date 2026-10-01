# TOTP / 2FA Code Generator (browser-only)

A tiny, dependency-free TOTP (RFC 6238) / HOTP (RFC 4226) generator that runs entirely in the browser using the Web Crypto API.
Paste a Base32 2FA secret and get the current code with a live countdown — the same code Google Authenticator or Authy would show.

**Online version:** https://hokstore.net/2fa?ch=gh

- No dependencies, no build step, no tracking — two files: `index.html` and `totp.js`
- The secret never leaves your device (nothing is sent to any server)
- SHA-1 / SHA-256 / SHA-512, 6 or 8 digits, 30 or 60 second periods
- Accepts lowercase secrets with spaces or dashes (`jbsw y3dp-ehpk 3pxp`)
- Verified against all RFC 4226 and RFC 6238 test vectors

## Use it

Open `index.html` in any modern browser, or enable GitHub Pages for this repository (Settings → Pages → Deploy from branch → `main` / root).

You can pre-fill a secret with the URL fragment (it stays in your browser, fragments are not sent to servers): `index.html#secret=JBSWY3DPEHPK3PXP`

## Use it in your own code

```html
<script src="totp.js"></script>
<script>
  TOTP.totp('JBSWY3DPEHPK3PXP').then(r => console.log(r.code, r.remaining));
</script>
```

```js
// Node 18+
const TOTP = require('./totp.js');
TOTP.totp('JBSWY3DPEHPK3PXP', { digits: 6, period: 30, algorithm: 'SHA-1' }).then(console.log);
```

| Function | Description |
|---|---|
| `TOTP.totp(secret, {digits, period, algorithm, time})` | Current code and seconds remaining |
| `TOTP.hotp(keyBytes, counter, digits, algorithm)` | HOTP value for a counter |
| `TOTP.base32Decode(secret)` | Base32 → `Uint8Array` |
| `TOTP.otpauthUri(secret, label, issuer)` | `otpauth://` URI for authenticator apps |

## More free tools

- [2FA secret to QR code](https://hokstore.net/authlink?ch=gh)
- [Facebook account live checker](https://hokstore.net/fb-check?ch=gh) · [Instagram](https://hokstore.net/ig-check?ch=gh) · [X (Twitter)](https://hokstore.net/x-check?ch=gh) · [Threads](https://hokstore.net/threads-check?ch=gh)
- [Outlook / Hotmail code reader](https://hokstore.net/mscode?ch=gh)
- [What is a 2FA secret key?](https://hokstore.net/user/tutorial/what2fa?ch=gh)

---

## 中文说明

纯前端的 2FA（TOTP）验证码生成器：粘贴 Base32 密钥，立即得到当前 6 位验证码和倒计时，结果与谷歌验证器、Authy 一致。全部在浏览器里计算，密钥不会发送到任何服务器。没有依赖、不用编译，只有两个文件。

在线版：https://hokstore.net/2fa?ch=gh

## License

MIT
