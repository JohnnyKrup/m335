/* ------------------------------------------------------------------
   M335 middleware.js
   Passwortschutz fuer die ganze Seite, ohne Benutzerverwaltung.

   Ohne gueltigen Cookie liefert Vercel keinen Inhalt aus, sondern eine
   Login Seite. Erst nach richtigem Passwort wird ein signierter Cookie
   gesetzt und die eigentliche Seite freigegeben.

   Zwei Environment Variables muessen bei Vercel gesetzt sein:
     M335_PASSWORT   das Passwort, das die Schueler bekommen
     M335_SECRET     eine lange Zufallszeichenkette zum Signieren

   Wer das Passwort aendert, macht damit alle bestehenden Cookies
   ungueltig, weil das Passwort in die Signatur einfliesst.
   ------------------------------------------------------------------ */

export const config = {
  matcher: ['/((?!_vercel|robots\\.txt|favicon\\.svg).*)'],
};

const COOKIE = 'm335_zugang';
const TAGE = 30;

/* ---------------------------------------------------------- Signatur */

async function schluessel(geheim) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(geheim),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function signieren(text, geheim) {
  const sig = await crypto.subtle.sign('HMAC', await schluessel(geheim), new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function gleich(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function cookieBauen(geheim) {
  const ablauf = String(Date.now() + TAGE * 24 * 60 * 60 * 1000);
  return ablauf + '.' + (await signieren(ablauf, geheim));
}

async function cookieGueltig(wert, geheim) {
  if (!wert) return false;
  const punkt = wert.indexOf('.');
  if (punkt < 1) return false;
  const ablauf = wert.slice(0, punkt);
  const sig = wert.slice(punkt + 1);
  if (!/^\d+$/.test(ablauf) || Number(ablauf) < Date.now()) return false;
  return gleich(sig, await signieren(ablauf, geheim));
}

/* ------------------------------------------------------------ Cookie */

function cookieLesen(kopf, name) {
  if (!kopf) return '';
  for (const teil of kopf.split(';')) {
    const i = teil.indexOf('=');
    if (i < 0) continue;
    if (teil.slice(0, i).trim() === name) return teil.slice(i + 1).trim();
  }
  return '';
}

/* Weiterreichen an die statische Datei. Das ist genau das, was next()
   aus dem Paket @vercel/edge macht, nur ohne die Abhaengigkeit. */
function weiter() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

/* -------------------------------------------------------- Login Seite */

function loginSeite(fehler) {
  const meldung = fehler
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
${meldung}
<form method="post" action="">
<label for="pw">Passwort</label>
<input id="pw" name="passwort" type="password" autocomplete="current-password" autofocus required>
<button type="submit">Weiter</button>
</form>
<p class="fuss">Dein Browser merkt sich den Zugang ${TAGE} Tage lang.</p>
</main>
</body>
</html>`;
}

function seiteAusliefern(html, status) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* ------------------------------------------------------------ Ablauf */

export default async function middleware(request) {
  const passwort = process.env.M335_PASSWORT;
  const secret = (process.env.M335_SECRET || '') + '|' + (passwort || '');

  if (!passwort) {
    return new Response(
      'Der Passwortschutz ist nicht fertig eingerichtet. Es fehlt die Environment Variable M335_PASSWORT.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }
    );
  }

  const cookie = cookieLesen(request.headers.get('cookie'), COOKIE);
  if (await cookieGueltig(cookie, secret)) return weiter();

  if (request.method === 'POST') {
    let eingabe = '';
    try {
      const daten = await request.formData();
      eingabe = String(daten.get('passwort') || '');
    } catch {
      eingabe = '';
    }

    if (gleich(eingabe, passwort)) {
      const url = new URL(request.url);
      const antwort = new Response(null, {
        status: 303,
        headers: { Location: url.pathname + url.search, 'Cache-Control': 'no-store' },
      });
      antwort.headers.append(
        'Set-Cookie',
        `${COOKIE}=${await cookieBauen(secret)}; Path=/; Max-Age=${TAGE * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`
      );
      return antwort;
    }

    return seiteAusliefern(loginSeite(true), 401);
  }

  return seiteAusliefern(loginSeite(false), 401);
}
