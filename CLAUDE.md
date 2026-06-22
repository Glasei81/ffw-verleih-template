# FFW Raubling – Geräteverleih

Webbasiertes Ausleihsystem für die Freiwillige Feuerwehr Raubling (Bayern).
Mitglieder und externe Personen können Geräte und Ausstattung online anfragen.

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Datenbank | Neon PostgreSQL (serverless) |
| E-Mail | Resend |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |
| Repo | `glasei81/Verleihsystem-Verein` |

## Projektstruktur

```
app/
  page.tsx                  # Öffentliche Buchungsseite
  login/page.tsx            # Admin-Login
  admin/
    page.tsx                # Dashboard (Zähler, neueste Anfragen)
    rentals/page.tsx        # Ausleihliste (Aktiv / Archiv)
    inventory/page.tsx      # Inventarverwaltung
    inventory/edit/[id]/    # Artikel bearbeiten
    admins/page.tsx         # Admin-Benutzerverwaltung
components/
  reservation-form.tsx      # Öffentliches Buchungsformular
  rental-actions.tsx        # Bestätigen/Ablehnen/Zurückgeben-Buttons
  confirm-rental-dialog.tsx # Dialog mit Abholhinweis-Feld
  rental-filters.tsx        # Tab-Switcher (Aktiv/Archiv) + Suche
lib/
  db.ts                     # Alle Datenbankfunktionen
  auth.ts                   # Session-Handling
app/api/
  reservations/route.ts     # POST: neue Anfrage anlegen
  rentals/[id]/route.ts     # PATCH: Status + Gruppe aktualisieren
  admin/...                 # Inventar- und Admin-CRUD
```

## Datenmodell

### `inventory`
Artikel im Verleih.
```sql
id, name, description, price_per_day, is_available, quantity, created_at, updated_at
```

### `rentals`
Eine Zeile pro Artikel pro Anfrage. Mehrere Artikel einer Buchung teilen dieselbe `request_group` (UUID) und werden gemeinsam verwaltet.
```sql
id, item_id, renter_name, renter_email, renter_phone,
start_date, end_date, total_price, notes, status,
request_group,    -- UUID: verbindet Artikel einer Buchung
requester_type,   -- 'ffw_member' | 'partner' | 'external'
pickup_info,      -- Abholhinweis (wird per E-Mail gesendet)
created_at, updated_at
```

Status-Werte: `pending` → `confirmed` / `cancelled` → `returned`

### `admins`
```sql
id, username, password_hash, email, created_at
```

## Wichtige Funktionen (lib/db.ts)

| Funktion | Zweck |
|---|---|
| `ensureRentalsSchema()` | Lazy-Migration: fügt neue Spalten hinzu falls nicht vorhanden. Wird vor jeder Abfrage aufgerufen. |
| `getRentalRequests()` | Gruppiert Ausleihen nach `request_group`, gibt eine Zeile pro Buchung zurück (mit `items`-Array). |
| `updateRentalGroupStatus()` | Aktualisiert Status + Abholhinweis für alle Artikel einer Gruppe gleichzeitig. |
| `createRental()` | Legt eine Zeile an; erwartet `request_group` und `requester_type`. |

## Buchungsfluss

1. Nutzer öffnet `/` → wählt Anfragesteller-Typ, Artikel, Zeitraum, Kontaktdaten
2. POST `/api/reservations`: Überschneidungsprüfung (nur gegen `confirmed`), dann `createRental()` für jeden Artikel mit gemeinsamer `request_group`-UUID; Admin-Benachrichtigung per E-Mail
3. Admin sieht Anfrage unter **Aktiv** → klickt „Bestätigen" → Dialog mit Abholhinweis
4. PATCH `/api/rentals/[id]`: aktualisiert alle Zeilen der Gruppe; sendet Bestätigungs-/Ablehnungs-E-Mail an Ausleiher
5. Nach Rückgabe: Admin setzt Status auf `returned` → wandert ins **Archiv**

## Admin-Bereich

- Login: `/login` (Benutzername + Passwort, bcrypt, Session-Cookie)
- Dashboard `/admin`: Zähler offene/bestätigte Anfragen, Inventar; neueste Anfragen als klickbare Liste
- Ausleihen `/admin/rentals`: Tab **Aktiv** (pending + confirmed) / Tab **Archiv** (returned + cancelled); Suche über Name, E-Mail, Artikel
- Inventar `/admin/inventory`: Artikel anlegen, bearbeiten, (de)aktivieren, löschen

## Requester-Typ-Badges

| Wert | Label | Farbe |
|---|---|---|
| `ffw_member` | FFW Mitglied | Rot |
| `partner` | Verein / Gemeinde | Blau |
| `external` | Extern | Orange |

## Bekannte Offene Punkte

- E-Mail-Versand läuft über Resend-Sandbox (`onboarding@resend.dev`) → muss auf verifizierte Domain umgestellt werden
- Kein Kalender / Verfügbarkeitsansicht für Ausleiher
- Kein Passwort-Reset-Flow für Admins
- TypeScript-Typen der Neon-Rückgaben sind `Record<string, any>` (pre-existing, keine Laufzeitfehler)

## Entwicklungsbranch

Änderungen laufen auf `claude/ffw-lending-system-DSBaN`, dann nach `main` gemergt und automatisch auf Vercel deployed.
