# Technischer Steckbrief – Webbasiertes Verleih-/Buchungssystem

> Portabler Überblick über Stack, Voraussetzungen und Grenzen dieses Projekts –
> gedacht zum Weitergeben oder zum Prüfen der Machbarkeit ähnlicher Vorhaben.

## Zweck
Online-Anfragesystem: Nutzer wählen Gegenstände + Zeitraum und stellen eine
Anfrage. Admins prüfen, bestätigen oder lehnen ab; alle Beteiligten werden per
E-Mail benachrichtigt. Kleiner Admin-Bereich für Inventar und Anfragen.

## Tech-Stack
- **Framework:** Next.js 15 (App Router, TypeScript, React Server Components)
- **Sprache:** TypeScript
- **Datenbank:** PostgreSQL (hier: Neon, serverless) – per SQL angesprochen
- **E-Mail-Versand:** Resend (transaktionale Mails über API)
- **Styling/UI:** Tailwind CSS + shadcn/ui Komponenten
- **Hosting/Deployment:** Vercel (Git-Push löst automatisches Deploy aus)
- **Kalender:** iCalendar-Dateien (.ics) selbst erzeugt – KEINE externe Kalender-API

## Benötigte Konten / Dienste (alle mit kostenlosem Kontingent)
1. **Git-Hosting** (z.B. GitHub) – Quellcode
2. **Vercel** – Hosting + Umgebungsvariablen + automatische Deploys
3. **Neon** (oder anderer PostgreSQL-Anbieter) – Datenbank
4. **Resend** – E-Mail-Versand
5. **Eigene Domain mit DNS-Zugriff** – für verifizierten E-Mail-Absender
   (3 DNS-Einträge setzen; ohne Domain nur eingeschränkter Sandbox-Versand)

## Umgebungsvariablen (Secrets, in Vercel hinterlegt)
| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Verbindung zur Postgres-Datenbank (Pflicht) |
| `RESEND_API_KEY` | Schlüssel für E-Mail-Versand |
| `RESEND_FROM` | Absenderadresse, z.B. `Verleih <verleih@domain.de>` |
| `JWT_SECRET` | Signierung der Login-Sitzung |
| `ADMIN_PASSWORD` | Passwort des Haupt-Admin-Kontos |
| `ADMIN_EMAIL` | E-Mail des Haupt-Admins (Benachrichtigungen) |

## Architektur / Datenmodell (vereinfacht)
- **inventory:** Gegenstände (Name, Beschreibung, Preis, Stückzahl, verfügbar)
- **rentals:** Anfragen/Ausleihen; mehrere Artikel einer Anfrage über eine
  gemeinsame Gruppen-ID (UUID) verbunden; Status `pending` →
  `confirmed`/`cancelled` → `returned`
- **admins:** Admin-Benutzer (Name, E-Mail, Telefon, Passwort-Hash)
- **Lazy-Migration:** fehlende Spalten werden beim Zugriff automatisch ergänzt
  (kein separates Migrations-Tool)

## Authentifizierung
- Login mit Benutzername/Passwort, Passwörter mit **bcrypt** gehasht
- Sitzung als signiertes **JWT** in einem httpOnly-Cookie
- Haupt-Admin per Umgebungsvariable, weitere Admins in der Datenbank

## Kernfunktionen
- Öffentliches Buchungsformular (kategorisiert, durchsuchbar)
- Mengen- und zeitraumbewusste Verfügbarkeitsprüfung gegen bestätigte Buchungen
- Admin-Dashboard: Anfragen bestätigen/ablehnen/archivieren, Inventar pflegen
- Automatische E-Mails (Anfrage an Admins, Bestätigung/Absage an Anfrager)
- Reply-To-Steuerung (Antworten landen beim richtigen Empfänger)
- Kalender-Termin (.ics) als E-Mail-Anhang + Admin-Downloadlink
- Sicheres Einbetten von Nutzereingaben in E-Mails (HTML-Escaping)

## Voraussetzungen zum Betrieb
- Grundkenntnisse: Git-Push, Vercel-Projekt verbinden, Umgebungsvariablen setzen,
  3 DNS-Einträge eintragen (einmalig, ~30 Min Setup gesamt)
- Kein eigener Server, keine Server-Wartung (alles serverless/managed)
- Laufende Wartung minimal; Updates per Git-Push

## Kosten
- Mit kostenlosen Kontingenten von Vercel, Neon und Resend für kleine
  Organisationen i.d.R. **0 €** (nur die Domain, falls noch nicht vorhanden)

## Bewusste Grenzen / Annahmen
- **Einzel-Mandant** (eine Organisation pro Installation; Branding fest im Code)
- Keine Bezahl-/Kassenfunktion (Gebühr/Kaution werden nur angezeigt)
- Keine Bild-Uploads (optional nachrüstbar, z.B. via Vercel Blob)
- .ics nutzt lokale Zeit ohne Zeitzonen-Block (für regionalen Einsatz gedacht)
- Kalender-Termin ist einmaliger Vorschlag, keine Live-Synchronisierung
