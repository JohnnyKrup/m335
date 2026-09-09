# Modul 335, Unterlagen für die Schüler

Die veröffentlichte Fassung des Unterrichtsmaterials für das Modul 335 an der WISS.
Läuft auf Vercel, verlinkt aus Google Classroom.

`index.html` ist die Startseite mit allen Unterlagen, nach Halbtagen gegliedert.

## Die Adressen

`vercel.json` setzt `cleanUrls`, die Adressen kommen also ohne `.html` aus.

| Adresse | Unterlage |
|---|---|
| `/01a`, `/01a-loesung` | Mobile Applikationen |
| `/01b`, `/01b-loesung` | Android Studio und erster Code |
| `/01c`, `/01c-loesung` | Buttons und Events |
| `/02a`, `/02a-loesung` | Die drei Unterlagen |
| `/02b`, `/02b-loesung` | Formular bauen |
| `/apps`, `/layouts`, `/constraints` | die drei Nachschlagewerke |

## Wie eine Änderung hierher kommt

Dieser Ordner ist eine **Kopie**. Die Quelldokumente liegen daneben in
`Aufgaben\` und `Docs\Unterrichtsmittel\` und sind nicht Teil dieses Repositorys.

1. Dokument in `Aufgaben\` oder `Docs\Unterrichtsmittel\` bearbeiten
2. Im Modulordner `web-auffrischen.cmd` doppelklicken
3. `git add -A`, `git commit`, `git push`
4. Vercel deployt automatisch

Schritt 2 baut alle 13 Seiten neu: kopieren, umbenennen und den gemeinsamen
Kopf- und Fussbereich einsetzen. Das Skript ist wiederholbar, ein zweiter Lauf
ohne Änderung meldet einfach alles als unverändert. Am Schluss prüft es, ob
jeder Link auf der Startseite eine Datei trifft.

### Der Kopf- und Fussbereich

Die Seiten tragen einen gemeinsamen Rahmen mit Logo und Rückweg zur Übersicht.
Er steht **nicht** in den Quelldokumenten, sondern einmal als Vorlage in
`web-bau\rahmen\`. Änderst du ihn dort, ziehen beim nächsten Lauf alle Seiten
nach. Im HTML ist er durch Marken wie `<!--M335:RAHMEN-KOPF-->` begrenzt, daran
erkennt das Skript den alten Rahmen und ersetzt ihn.

Auf der Startseite lässt das Skript die beiden Rückwege weg, dort wären es
Verweise auf die Seite selbst.

### Ein neues Dokument aufnehmen

Zwei Stellen: eine Zeile in `web-bau\dokumente.json` und ein Eintrag in
`index.html`. Vergisst du die zweite, meldet das Skript die Datei als ohne Link.

## Was hier bewusst fehlt

**Die Arbeitsblätter.** Sie werden in Google Classroom ausgefüllt und dort
abgegeben, als Kopie pro Schüler. Eine zweite, nicht ausfüllbare Fassung hier
wäre eine zweite Quelle für dasselbe Dokument und würde beim ersten Update
auseinanderlaufen.

Dazu die Leistungsbeurteilung, die Generalprobe und das Starter-Projekt. Diese
Instrumente verlieren ihren Zweck, wenn man sie vorher gesehen hat.

## Der Passwortschutz

Die Seite ist nicht mehr öffentlich. `middleware.js` steht als Edge Middleware
vor allen Adressen. Ohne gültigen Cookie liefert Vercel keinen Inhalt aus,
sondern eine Login Seite. Erst nach richtigem Passwort setzt die Middleware
einen signierten Cookie, der 30 Tage hält.

Geschützt ist wirklich alles: HTML, Bilder, CSS und die Dateien im
Ordner `dateien\`. Frei bleiben nur `robots.txt` und `favicon.svg`.
`robots.txt` sperrt zusätzlich alle Suchmaschinen aus, `vercel.json` setzt
dazu den Kopfzeileneintrag `X-Robots-Tag: noindex`.

### Einmal einrichten bei Vercel

Im Projekt unter **Settings**, **Environment Variables** zwei Einträge anlegen,
je für Production, Preview und Development:

| Name | Wert |
|---|---|
| `M335_PASSWORD` | das Passwort für die Klasse |
| `M335_SECRET` | eine lange Zufallszeichenkette, mindestens 32 Zeichen |

`M335_SECRET` bekommst du zum Beispiel mit `openssl rand -hex 32`. Diesen Wert
sieht niemand ausser Vercel, er dient nur zum Signieren des Cookies.

Nach dem Anlegen einmal **Redeploy** auslösen, sonst kennt die laufende
Fassung die Variablen noch nicht. Fehlt `M335_PASSWORD`, antwortet die Seite
mit einem Hinweis und Status 503 statt Inhalt auszuliefern.

### Das Passwort wechseln

Wert von `M335_PASSWORD` ändern und neu deployen. Das Passwort fliesst in die
Signatur ein, darum werden alle bestehenden Cookies sofort ungültig und alle
müssen sich neu anmelden.

### Was der Schutz nicht leistet

Es gibt keine Benutzerverwaltung. Wer das Passwort weitergibt, gibt den Zugang
weiter. Für den Zweck reicht das: die Unterlagen stehen nicht mehr offen im
Netz und tauchen in keiner Suchmaschine auf.
