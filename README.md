# 🚒 FFW-Verleih Template

**Open-Source Geräteverleih-System für Freiwillige Feuerwehren & Vereine**
> Basierend auf [verleih.feuerwehr-raubling.de](https://verleih.feuerwehr-raubling.de)

---

## ✨ Features

### 🌐 Öffentlicher Bereich
- **Artikel-Katalog** – Alle verfügbaren Geräte mit Kategorien, Bildern, Preisen
- **Online-Reservierung** – Mehrfach-Auswahl, Mengen, Datumsprüfung, Preisberechnung
- **Verfügbarkeits-Check** – Echtzeit-Prüfung gegen Bestand & bestätigte Ausleihen
- **Pauschal-Preis** – Einmal pro Artikel, unabhängig von Tagen/Menge
- **Kaution** – Konfigurierbar, Hinweis im Formular & E-Mail

### 🔐 Admin-Bereich (`/login`)
- **Dashboard** – Übersicht: Inventar, offene Anfragen, bestätigte Ausleihen
- **Inventar-Verwaltung** – CRUD für Artikel (Name, Beschreibung, Preis, Menge, Verfügbarkeit)
- **Vermietungs-Management** – Status-Workflow: `pending → confirmed → returned / cancelled`
- **Gruppen-Bearbeitung** – Mehrere Artikel einer Anfrage gemeinsam bestätigen/ablehnen
- **Abhol-Infos** – Termin, Ort, Hinweise → landen in Bestätigungs-E-Mail + `.ics` Kalender-Datei
- **Admin-Kontakte** – Ansprechpartner pro Admin (Name, Telefon, WhatsApp, E-Mail)

### 📧 E-Mails (Resend)
- **Admin-Benachrichtigung** bei neuer Anfrage
- **Bestätigung/Absage** an Ausleiher mit:
  - Artikel-Liste, Zeitraum, Gesamtpreis
  - Abhol-Termin (`.ics` Anhang)
  - Kaution & Schadens-Hinweis
  - **Persönlicher Ansprechpartner** (der bestätigende Admin)
  - Reply-To → alle Admins

### 🎨 Vollständig anpassbar via Env-Variablen
- Vereinsname, Kurzname, Farben, Logo/Skyline
- Kaution, Support-E-Mail, Absender-Adresse

---

## 🛠 Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Datenbank** | PostgreSQL (Neon Serverless) |
| **Auth** | JWT (HttpOnly Cookie) + bcrypt |
| **E-Mail** | Resend (Transactional) |
| **Deployment** | Vercel (Auto-Deploy on push) |
| **Kosten** | **0 €/Monat** (Free Tiers: Vercel, Neon, Resend) – nur Domain ~12 €/Jahr |

---

## 🚀 Quickstart für deine Feuerwehr

### 1. Repository als Template nutzen
```bash
gh repo create ffw-deinefeuerwehr-verleih --template=Glasei81/ffw-verleih-template --private
cd ffw-deinefeuerwehr-verleih
```

### 2. Neon PostgreSQL einrichten
1. [Neon Console](https://console.neon.tech) → `Create Project` → Name: `ffw-deinefeuerwehr-verleih`
2. **Connection String** kopieren (Pooled, mit `?sslmode=require`)
3. SQL Editor → ausführen:
   ```sql
   \i scripts/01-create-tables-generic.sql
   \i scripts/02-seed-initial-admin.sql
   -- Passwort in SQL anpassen oder später per Web-UI setzen
   ```

### 3. Domain & DNS (für E-Mail via Resend)
**Subdomain:** `verleih.deinefeuerwehr.de`

| Typ | Name | Wert | TTL |
|-----|------|------|-----|
| CNAME | `verleih` | `cname.vercel-dns.com` | 3600 |
| MX | `verleih` | `inbound-smtp.eu-west-1.amazonaws.com` | 3600 |
| TXT | `_dmarc.verleih` | `v=DMARC1; p=none; rua=mailto:admin@deinefeuerwehr.de` | 3600 |
| TXT | `resend._domainkey.verleih` | `v=DKIM1; k=rsa; p=...` (von Resend) | 3600 |
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` | 3600 |

Resend Dashboard → `Domains` → `Add Domain` → `verleih.deinefeuerwehr.de` → DNS prüfen → **Absender erstellen**: `Verleih <verleih@verleih.deinefeuerwehr.de>`

### 4. Vercel Deployment
1. [Vercel](https://vercel.com) → `Add New Project` → Import `ffw-deinefeuerwehr-verleih`
2. **Environment Variables** (alle **Production** + **Preview**):

| Variable | Beispielwert | Beschreibung |
|----------|--------------|--------------|
| `DATABASE_URL` | `postgresql://user:***@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require` | Neon Connection String |
| `RESEND_API_KEY` | `re_abc123...` | Resend API Key |
| `RESEND_FROM` | `FFW DeineStadt Verleih <verleih@verleih.deinefeuerwehr.de>` | Verifizierter Absender |
| `JWT_SECRET` | `openssl rand -base64 48` | Einmalig generieren |
| `ADMIN_PASSWORD` | `SicheresPasswort123!` | Haupt-Admin Passwort |
| `ADMIN_EMAIL` | `vorname@deinefeuerwehr.de` | Admin-Benachrichtigung |
| `ORG_NAME` | `Freiwillige Feuerwehr DeineStadt` | Voller Vereinsname |
| `ORG_SHORT` | `FFW DeineStadt` | Kurzname (Header) |
| `PRIMARY_COLOR` | `#dc2626` | Hauptfarbe (FFW-Rot) |
| `SECONDARY_COLOR` | `#fef2f2` | Hover/Hintergrund |
| `SKYLINE_URL` | `/skyline.jpg` | Header-Bild (in `public/`) |
| `KAUTION_EUR` | `50` | Kaution in Euro |
| `SUPPORT_EMAIL` | `verleih@verleih.deinefeuerwehr.de` | Support-Kontakt |

3. **Deploy** → läuft automatisch
4. **Domain** hinzufügen: `verleih.deinefeuerwehr.de`

### 5. Erster Login & Setup
1. `https://verleih.deinefeuerwehr.de/login`
2. **User:** `admin` | **Passwort:** `ADMIN_PASSWORD` aus Vercel
3. `/admin` → Inventar pflegen, weitere Admins anlegen (`/admin/admins`)

### 6. Test
- Öffentliche Seite → Anfrage stellen (deine E-Mail)
- Admin-Mail prüfen → Dashboard → **Bestätigen** → Abholinfo eintragen
- Ausleiher-Mail prüfen: Bestätigung + `.ics` + Ansprechpartner

---

## 📁 Projektstruktur

```
├── app/
│   ├── page.tsx              # Landingpage + Reservierungsformular
│   ├── login/                # Admin-Login
│   ├── admin/                # Dashboard, Inventar, Vermietungen, Admins
│   └── api/                  # Reservations, Rentals, Auth, Inventory
├── components/
│   ├── ui/                   # shadcn/ui Komponenten
│   └── reservation-form.tsx  # Hauptformular (Client)
├── lib/
│   ├── config.ts             # Zentrale Config (Env → Defaults)
│   ├── db.ts                 # Neon SQL + Helper
│   ├── auth.ts               # JWT Session
│   ├── mail.ts               # Resend Helper
│   └── ics.ts                # Kalender-Datei Generator
├── scripts/
│   ├── 01-create-tables-generic.sql   # Generische Tabellen
│   ├── 02-seed-initial-admin.sql      # Haupt-Admin
│   └── 03-seed-sample-inventory.sql   # Beispiel-Inventar (optional)
├── public/
│   ├── skyline.jpg           # Header-Bild (austauschen!)
│   ├── favicon.ico
│   └── og-image.png          # Social Sharing (1200×630)
└── README.md                 # Diese Datei
```

---

## 🔧 Lokale Entwicklung

```bash
npm install
cp .env.example .env.local  # Env-Variablen eintragen
npm run dev                 # http://localhost:3000
```

---

## 🔄 Updates vom Template ziehen

```bash
git remote add upstream https://github.com/Glasei81/ffw-verleih-template.git
git fetch upstream
git merge upstream/main --allow-unrelated-histories  # beim ersten Mal
# Konflikte in lib/config.ts, public/* lösen → commit → push
```

---

## 💰 Kostenübersicht

| Dienst | Free Tier | Typischer Bedarf | Kosten |
|--------|-----------|------------------|--------|
| Vercel | 100 GB Bandbreite, Unlimited Personal | ~1-5 GB | 0 € |
| Neon | 0.5 GB Storage, 190h Compute/Monat | ~50 MB, <50h | 0 € |
| Resend | 3.000 E-Mails/Monat, 1 Domain | ~50-200 E-Mails | 0 € |
| Domain | – | 1 Subdomain | ~1 €/Monat |
| **Gesamt** | | | **~1 €/Monat** |

---

## 🆘 Troubleshooting

| Problem | Lösung |
|---------|--------|
| Build-Fehler: `DATABASE_URL` not set | Env-Var in Vercel prüfen (Production + Preview) |
| E-Mails kommen nicht an | Resend Domain verifiziert? `RESEND_FROM` stimmt? Spam-Ordner? |
| Login schlägt fehl | `ADMIN_PASSWORD` in Vercel = Hash in DB? (`02-seed-initial-admin.sql` nutzt bcrypt) |
| Bilder laden nicht | `public/skyline.jpg` existiert? Case-sensitive! |
| Verfügbarkeitsprüfung falsch | `quantity` in `inventory` gesetzt? `is_available = true`? |
| ICS-Kalender falsch | Zeitzone: System nutzt lokale Zeit (DE), für lokale Nutzung OK |

---

## 📝 Lizenz

**MIT License** – frei nutzbar, veränderbar, verteilbar.
Lediglich der **Spenden-Hinweis** im Footer/Admin würde ich wertschätzend lassen. 🙏

---

## ❤️ Spende / Support

Dieses System wurde von **Stefan Glas (FFW Raubling, Kassier)** entwickelt und als Open-Source-Template zur Verfügung gestellt.

Wenn es deiner Feuerwehr Arbeit erspart und gut läuft, freue ich mich über eine kleine Spende:

- **PayPal:** [https://www.paypal.me/StefanGlas231/5](https://www.paypal.me/StefanGlas231/5)
- **IBAN:** Auf Anfrage
- **Betterplace:** Projekt "FFW Raubling Drohne" / "Verleihsystem"

> **Kein Muss – nur Wertschätzung für ~100h Entwicklungszeit.** 🙏

---

## 📞 Kontakt & Links

- **Entwickler:** Stefan Glas (FFW Raubling)
- **Telegram:** `@Glasei` / `@Glaseibot`
- **Issues:** [GitHub Issues](https://github.com/Glasei81/ffw-verleih-template/issues)
- **Live-Demo:** [verleih.feuerwehr-raubling.de](https://verleih.feuerwehr-raubling.de)
- **Template-Repo:** [Glasei81/ffw-verleih-template](https://github.com/Glasei81/ffw-verleih-template)

---

## 🎉 Viel Erfolg bei der Einführung!

**Dein Verleihsystem läuft dann unter:** `https://verleih.deinefeuerwehr.de` 🚒