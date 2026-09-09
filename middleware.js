/* ------------------------------------------------------------------
   Modul 335 middleware.js
   Password gate in front of the whole site. No user management.

   Without a valid cookie Vercel serves no content, only a login page.
   A correct password sets a signed cookie that lasts 30 days.

   Two environment variables have to be set in Vercel:
     M335_PASSWORD   the password handed out to the class
     M335_SECRET     a long random string used for signing

   The password is part of the signing key. Changing it invalidates
   every cookie that is already out there, which is intended.
   ------------------------------------------------------------------ */

export const config = {
  matcher: ['/((?!_vercel|robots\\.txt|favicon\\.svg).*)'],
};

const COOKIE_NAME = 'm335_access';
const DAYS = 30;

/* --------------------------------------------------------- Signing */

async function signingKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(text, secret) {
  const mac = await crypto.subtle.sign('HMAC', await signingKey(secret), new TextEncoder().encode(text));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Compares without leaking the position of the first difference. */
function equals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------- Cookie */

async function createCookieValue(secret) {
  const expiry = String(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  return expiry + '.' + (await sign(expiry, secret));
}

async function isCookieValid(value, secret) {
  if (!value) return false;
  const dot = value.indexOf('.');
  if (dot < 1) return false;
  const expiry = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  return equals(signature, await sign(expiry, secret));
}

function readCookie(header, name) {
  if (!header) return '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

/* Hands the request on to the static file. This is exactly what
   next() from the @vercel/edge package does, without the dependency. */
function passThrough() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

/* ------------------------------------------------------- Login page */

function loginPage(failed) {
  const message = failed
    ? '<p class="fehler">Das Passwort stimmt nicht. Versuch es noch einmal.</p>'
    : '';
  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Modul 335, Zugang</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#f9f9f7;color:#0b0b0b;padding:24px;
       font:16px/1.62 system-ui,-apple-system,"Segoe UI",sans-serif}
  .karte{background:#fcfcfb;border:1px solid #e1e0d9;max-width:420px;width:100%;
         padding:34px 32px 30px}
  .marke{display:flex;align-items:center;gap:9px;color:#52514e;
         font:600 14px/1.3 system-ui,sans-serif;margin:0 0 26px}
  h1{font-size:24px;line-height:1.25;margin:0 0 6px;letter-spacing:-.02em}
  p{margin:0 0 18px;color:#52514e;font-size:15px}
  label{display:block;font:600 12px/1.5 system-ui,sans-serif;letter-spacing:.03em;
        text-transform:uppercase;color:#898781;margin:0 0 6px}
  input{width:100%;font:16px/1.5 system-ui,sans-serif;color:#0b0b0b;background:#ffffff;
        border:1px solid #c3c2b7;padding:10px 12px;border-radius:0}
  input:focus{outline:none;border-color:#2a78d6;box-shadow:inset 0 0 0 1px #2a78d6}
  button{margin-top:16px;width:100%;font:600 15px/1.5 system-ui,sans-serif;color:#ffffff;
         background:#2a78d6;border:1px solid #2a78d6;padding:10px 12px;cursor:pointer}
  button:hover{background:#1f62b4;border-color:#1f62b4}
  .fehler{border-left:3px solid #954121;background:#fbf0df;color:#8a560f;
          padding:10px 14px;margin:0 0 18px;font-size:14.5px}
  .fuss{margin:24px 0 0;padding-top:14px;border-top:1px solid #e1e0d9;
        font-size:13px;color:#898781}
</style>
</head>
<body>
<main class="karte">
<div class="marke">
<svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true"><rect x="10" y="10" width="492" height="492" fill="none" stroke="#2a2a2a" stroke-width="34"/><line x1="342" y1="10" x2="342" y2="502" stroke="#2a2a2a" stroke-width="20"/><line x1="180" y1="118" x2="180" y2="305" stroke="#2a2a2a" stroke-width="20" stroke-linecap="square"/><line x1="44" y1="392" x2="190" y2="392" stroke="#2a2a2a" stroke-width="20" stroke-linecap="square"/></svg>
Modul 335 Mobile Applikationen
</div>
<h1>Zugang zu den Unterlagen</h1>
<p>Diese Seiten sind nur für die Klasse. Gib das Passwort ein, das du im Unterricht bekommen hast.</p>
${message}
<form method="post" action="">
<label for="pw">Passwort</label>
<input id="pw" name="passwort" type="password" autocomplete="current-password" autofocus required>
<button type="submit">Weiter</button>
</form>
<p class="fuss">Dein Browser merkt sich den Zugang ${DAYS} Tage lang.</p>
</main>
</body>
</html>`;
}

function htmlResponse(html, status) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* ----------------------------------------------------------- Entry */

export default async function middleware(request) {
  const password = process.env.M335_PASSWORD;
  const secret = (process.env.M335_SECRET || '') + '|' + (password || '');

  /* No password configured means the gate is not finished. Refuse
     rather than silently serving the material. */
  if (!password) {
    return new Response(
      'Der Passwortschutz ist nicht fertig eingerichtet. Es fehlt die Environment Variable M335_PASSWORD.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }
    );
  }

  const cookie = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (await isCookieValid(cookie, secret)) return passThrough();

  if (request.method === 'POST') {
    let entered = '';
    try {
      const form = await request.formData();
      entered = String(form.get('passwort') || '');
    } catch {
      entered = '';
    }

    if (equals(entered, password)) {
      const url = new URL(request.url);
      const response = new Response(null, {
        status: 303,
        headers: { Location: url.pathname + url.search, 'Cache-Control': 'no-store' },
      });
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=${await createCookieValue(secret)}; Path=/; Max-Age=${DAYS * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`
      );
      return response;
    }

    return htmlResponse(loginPage(true), 401);
  }

  return htmlResponse(loginPage(false), 401);
}
