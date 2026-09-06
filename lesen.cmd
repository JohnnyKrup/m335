@echo off
rem Oeffnet die Startseite der Unterlagen im Standardbrowser.
rem Seit dem Umbau auf relative Pfade braucht es dafuer keinen Server mehr.
start "" "%~dp0index.html"
