# FFW Raubling Verleihsystem – ToDo & Ideen

## Offene Punkte

### Warten auf Domain-Verifizierung (ITler)
- [ ] **Bestätigungs-E-Mail an den Ausleiher** – geht erst, wenn eine eigene
      Domain bei Resend verifiziert ist (aktuell kann nur an die registrierte
      Admin-Adresse gesendet werden)
- [ ] **Eigene Absender-Adresse** – z.B. `verleih@ffw-raubling.de` statt
      `onboarding@resend.dev` (braucht zwei DNS-Einträge, ca. 5 Minuten für
      einen IT-Admin)
- [ ] Evtl. Hosting-Umzug zum ITler klären (dann wäre er Admin von allem)

### Nice to have
- [ ] **Kalenderansicht im Admin-Dashboard** – Monatsübersicht, welcher
      Artikel an welchen Tagen vergeben ist (grün = bestätigt, gelb = angefragt)
- [ ] **Verfügbarkeits-Hinweis im Anfrage-Formular** – direkt beim Auswählen
      von Artikel + Zeitraum anzeigen, ob schon vergeben (bevor man das
      ganze Formular ausfüllt)

## Erledigt
- [x] FFW Raubling Skyline als Banner (Startseite) und Logo (Admin-Bereich)
- [x] Admin-Verwaltung mit eigenen Benutzerkonten
- [x] E-Mail-Benachrichtigung an alle Admins bei neuer Anfrage
      (E-Mail-Adresse pro Admin im Admin-Panel einstellbar)
- [x] Doppelbuchungen verhindert – Zeitraum-Prüfung mit Stückzahl
- [x] Next.js Sicherheitsupdate (15.5.19)
- [x] Workflow vereinfacht: alle Änderungen direkt auf `main`
