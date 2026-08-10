# Modul 335, Unterlagen für die Schüler

Die veröffentlichte Fassung des Unterrichtsmaterials für das Modul 335 an der WISS.
Läuft auf Vercel, verlinkt aus Google Classroom.

`index.html` ist die Startseite mit allen Unterlagen, nach Halbtagen gegliedert.

## Die Adressen

`vercel.json` setzt `cleanUrls`, die Adressen kommen also ohne `.html` aus.

| Adresse | Unterlage |
|---|---|
| `/01a`, `/01a-arbeitsblatt`, `/01a-loesung` | Mobile Applikationen |
| `/01b`, `/01b-arbeitsblatt`, `/01b-loesung` | Android Studio und erster Code |
| `/01c`, `/01c-arbeitsblatt`, `/01c-loesung` | Buttons und Events |
| `/02a`, `/02a-arbeitsblatt`, `/02a-loesung` | Die drei Unterlagen |
| `/02b`, `/02b-loesung` | Formular bauen |
| `/apps`, `/layouts`, `/constraints` | die drei Nachschlagewerke |

## Wie eine Änderung hierher kommt

Dieser Ordner ist eine **Kopie**. Die Quelldokumente liegen daneben in
`Aufgaben\` und `Docs\Unterrichtsmittel\` und sind nicht Teil dieses Repositorys.

1. Dokument in `Aufgaben\` bearbeiten
2. Im Modulordner `web-auffrischen.cmd` doppelklicken, das kopiert alle 17 Dokumente mit den richtigen Kurznamen hierher
3. `git add -A`, `git commit`, `git push`
4. Vercel deployt automatisch

Bei einem **neuen** Dokument zusätzlich eine Zeile in `index.html` und eine in
`web-auffrischen.cmd` ergänzen.

## Was hier nicht hingehört

Die Leistungsbeurteilung, die Generalprobe und das Starter-Projekt. Diese
Instrumente verlieren ihren Zweck, wenn man sie vorher gesehen hat.

## Schreibweise

Deutsche Texte ohne scharfes s, ohne Gedankenstrich und ohne Semikolon. Echte
Umlaute. Die Schüler werden geduzt.
