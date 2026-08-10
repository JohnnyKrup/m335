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
