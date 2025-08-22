# Club Rental Management System

Ein vollständiges Vermietungssystem für Vereine und Organisationen, entwickelt mit Next.js, TypeScript und PostgreSQL.

## Features

### Öffentliche Funktionen
- **Artikel-Katalog**: Übersicht aller verfügbaren Vermietungsartikel
- **Online-Reservierung**: Einfaches Reservierungsformular für Mitglieder
- **Verfügbarkeitsprüfung**: Automatische Prüfung der Artikelverfügbarkeit
- **Preisberechnung**: Automatische Berechnung der Gesamtkosten

### Admin-Funktionen
- **Dashboard**: Übersicht über Vermietungen und Inventar
- **Inventar-Verwaltung**: Artikel hinzufügen, bearbeiten und verwalten
- **Vermietungs-Management**: Status-Tracking von Reservierungen
- **Benutzer-Authentifizierung**: Sichere Admin-Anmeldung

## Technologie-Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Datenbank**: PostgreSQL (Neon)
- **Authentifizierung**: JWT mit bcrypt

## Installation

1. **Repository klonen**
   \`\`\`bash
   git clone <repository-url>
   cd club-rental-system
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   npm install
   \`\`\`

3. **Umgebungsvariablen einrichten**
   \`\`\`bash
   # .env.local
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_jwt_secret_key
   \`\`\`

4. **Datenbank einrichten**
   \`\`\`bash
   # Führen Sie die SQL-Skripte in der Reihenfolge aus:
   # 1. scripts/01-create-tables.sql
   # 2. scripts/04-comprehensive-seed-data.sql
   \`\`\`

5. **Entwicklungsserver starten**
   \`\`\`bash
   npm run dev
   \`\`\`

## Admin-Zugänge

Für Tests stehen folgende Admin-Accounts zur Verfügung:

- **admin1@club.de** / admin123
- **admin2@club.de** / admin123  
- **admin3@club.de** / admin123

## Verwendung

### Für Mitglieder
1. Besuchen Sie die Hauptseite
2. Durchsuchen Sie verfügbare Artikel
3. Wählen Sie Artikel und Zeitraum
4. Füllen Sie das Reservierungsformular aus
5. Warten Sie auf Bestätigung durch Admins

### Für Administratoren
1. Melden Sie sich unter `/login` an
2. Verwalten Sie Inventar unter `/admin/inventory`
3. Bearbeiten Sie Reservierungen unter `/admin/rentals`
4. Überwachen Sie das Dashboard unter `/admin`

## Datenbank-Schema

### Tabellen
- **admins**: Admin-Benutzer mit Authentifizierung
- **inventory**: Vermietungsartikel mit Preisen und Verfügbarkeit
- **rentals**: Reservierungen mit Status-Tracking

### Status-Workflow
1. **pending**: Neue Reservierungsanfrage
2. **confirmed**: Von Admin bestätigt
3. **active**: Artikel ausgegeben
4. **returned**: Artikel zurückgegeben
5. **cancelled**: Reservierung storniert

## Deployment

Das System ist bereit für Deployment auf Vercel mit Neon PostgreSQL:

1. Repository zu Vercel verbinden
2. Umgebungsvariablen in Vercel einrichten
3. Automatisches Deployment bei Git-Push

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.
