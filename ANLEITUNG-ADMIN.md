# Bedienungsanleitung für Administratoren
## FFW Raubling – Geräteverleih-System

---

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Einloggen](#einloggen)
3. [Dashboard – Übersicht](#dashboard--übersicht)
4. [Ausleihen verwalten](#ausleihen-verwalten)
5. [Anfragen bestätigen oder ablehnen](#anfragen-bestätigen-oder-ablehnen)
6. [Manuell Ausleihen anlegen](#manuell-ausleihen-anlegen)
7. [Ausleihen bearbeiten](#ausleihen-bearbeiten)
8. [Inventar verwalten](#inventar-verwalten)
9. [Admin-Verwaltung](#admin-verwaltung)
10. [Wichtige Hinweise](#wichtige-hinweise)

---

## Einführung

Das Geräteverleih-System der FFW Raubling ermöglicht es Mitarbeitern und externen Personen, Ausrüstung und Geräte online anzufordern. Der Admin-Bereich ist dabei das Verwaltungszentrum:

- **Anfragen verwalten**: Eingehende Anfragen bestätigen oder ablehnen
- **Inventar pflegen**: Verfügbarkeit von Artikeln verwalten
- **Benutzerverwaltung**: Admin-Konten und Kontaktdaten verwalten
- **Archiv einsehen**: Abgeschlossene Ausleihen nachschauen

### Wichtig: Kaution

**Die Kaution von 50€ ist in allen Fällen verbindlich und nicht verhandelbar.** Dies ist eine zentrale Regel:

- Jede Ausleihe – ob von FFW-Mitgliedern, Partnervereinen oder externen Personen – ist an die Zahlung einer 50€ Kaution gebunden.
- **Ohne hinterlegte Kaution wird kein Material ausgegeben.**
- Das sichert das Lager ab und garantiert die Rückgabe in gutem Zustand.

Diese Regelung muss bei jedem Ausleiher klar sein, bevor er seine Anfrage absenden kann.

---

## Einloggen

1. Öffne die Verleihseite in deinem Browser
2. Hänge `/login` an die URL an (oder klick auf einen Admin-Link)
3. Gib **Benutzername** und **Passwort** ein
4. Klick **Anmelden**

Nach erfolgreichem Login siehst du das **Admin-Dashboard**.

**Wichtig**: Gib dein Passwort niemals an andere weiter. Falls du es vergessen hast, kontaktier einen anderen Admin – aktuell gibt es noch keinen automatischen Passwort-Reset.

---

## Dashboard – Übersicht

Nach dem Login landest du im Admin-Dashboard (`/admin`). Hier siehst du auf einen Blick:

- **Zahlen**:
  - Offene Anfragen (Status: pending)
  - Bestätigte Ausleihen (Status: confirmed)
  - Artikel im Bestand (insgesamt und verfügbar)

- **Neueste Anfragen**: Eine Vorschau der 5 letzten eingegangenen Anfragen mit Link zu **Ausleihen**.

- **Navigation** (oben): Links zu den wichtigsten Seiten:
  - **Ausleihen** – zentrale Verwaltung aller Anfragen
  - **Inventar** – Artikel bearbeiten und Verfügbarkeit verwalten
  - **Admins** – Benutzerverwaltung
  - **Abmelden** – Session beenden

---

## Ausleihen verwalten

Die Seite **Ausleihen** (`/admin/rentals`) ist das Herzstück deiner Arbeit.

### Reiter und Suchfilter

Oben findest du zwei Reiter:

- **Aktiv** (Standard): Zeigt offene Anfragen (Anfrage eingehend) und laufende Ausleihen (bereits bestätigt)
- **Archiv**: Zeigt abgeschlossene Vorgänge (zurückgegeben oder abgelehnt)

Darunter ein **Suchfeld**, mit dem du nach folgenden Kriterien filtern kannst:
- Name des Ausleihers
- E-Mail-Adresse
- Name eines Artikels

### Anfragen-Karte

Jede Anfrage wird als **Karte** dargestellt mit folgenden Informationen:

**Kopfzeile**:
- **Artikel** (z.B. „5× Bierbänke, 3× Tische")
- **Typ-Badge** (Farbe und Label):
  - 🔴 FFW Mitglied (Rot)
  - 🔵 Verein / Gemeinde (Blau)
  - 🟠 Extern (Orange)
- **Status-Badge** (Farbe und Label):
  - 🟡 Anfrage (Gelb) – neu eingegangen
  - 🟢 Bestätigt (Grün) – bereit zur Abholung
  - ⚫ Zurückgegeben (Grau) – archiviert
  - 🔴 Abgelehnt (Rot) – archiviert
- **Menü-Button** (⋯) – Zusatzaktionen

**Inhaltsbereich**:

1. **Person**
   - Name, E-Mail, evtl. Telefon

2. **Zeitraum**
   - Von – bis (im Format TT.MM.JJJJ)
   - Link **Zum Kalender hinzufügen** (nur bei aktiven Anfragen) – erzeugt eine `.ics`-Datei, die in Outlook, Google Calendar etc. importierbar ist

3. **Gesamtbetrag**
   - Pauschale Gebühr in €
   - Bei mehreren Artikeln: Liste der einzelnen Posten mit Preisen
   - Ggf. **Bearbeiten**-Buttons für Mengen (bei aktiven Anfragen nur)

4. **Notiz** (falls vorhanden)
   - Grauer/bernsteinfarbener Infoblock mit Text des Ausleihers (z.B. spezielle Wünsche)

5. **Abholhinweis** (falls vorhanden)
   - Grüner Infoblock mit dem Text, den du bei der Bestätigung eingegeben hast

6. **Zuletzt aktualisiert**
   - Zeitstempel des letzten Status-Updates (nur bei bestätigten/abgelehrten Anfragen)

### Menü-Button (⋯)

Je nach Status der Anfrage bietet das **⋯**-Menü unterschiedliche Aktionen:

**Bei Status „Anfrage" (pending)**:
- ✅ **Bestätigen** – Öffnet einen Dialog zur Bestätigung mit Abholhinweis
- ❌ **Ablehnen** – Lehnt die Anfrage ab (Dialog mit optionaler Admin-Nachricht)
- 👁️ **Details anschauen** – Erweiterte Ansicht (falls nötig)

**Bei Status „Bestätigt" (confirmed)**:
- ✏️ **Bearbeiten** – (evtl. Artikel hinzufügen oder entfernen)
- ↩️ **Als zurückgegeben markieren** – Abholung erfolgt → Ausleihe ins Archiv
- ❌ **Ablehnen** – Nachträglich ablehnen (selten nötig)

**Bei Status „Archiv"**:
- 👁️ **Details** – nur zum Anschauen

---

## Anfragen bestätigen oder ablehnen

### Bestätigung

1. Klick auf die Anfrage oder den **Bestätigen**-Button (im ⋯-Menü oder sichtbar bei gelber Anfrage)
2. Es öffnet sich ein Dialog:

   **Felder**:
   - **Abholung am** (Datum): Das Abholungsdatum (Standard: heute). Dies ist das **Abholtermin**, nicht der Ausleihzeitraum. Der Ausleihzeitraum bleibt, wie der Ausleiher angegeben hat.
   - **Uhrzeit** (optional): z.B. „10:00" – wenn angegeben, wird ein 30-Minuten-Fenster im Kalender erzeugt.
   - **Abholhinweis** (Pflichtfeld): Der Text, der per E-Mail an den Ausleiher geht. Z.B. „Abholung Samstag 10 Uhr am Gerätehaus, Eingang hinten."
   - **Admin-Nachricht** (optional): Eine zusätzliche Notiz nur für dich (intern, nicht im Mail sichtbar)

3. Klick **Bestätigen**
4. Der Ausleiher bekommt sofort eine E-Mail mit:
   - Dem Abholhinweis
   - Deinem Namen, Telefon und E-Mail als **Ansprechpartner**
   - Optional: Ein `.ics`-Dateianhang (falls Uhrzeit angegeben)
5. Die Anfrage bekommt den Status **Bestätigt** (grünes Badge)

**Wichtig**: Du wirst automatisch zum **Ansprechpartner** dieser Ausleihe. Wenn der Ausleiher auf die Bestätigungs-Mail antwortet, landet die Antwort bei dir – nicht bei allen Admins. Das ermöglicht einen direkten Kontakt zwischen Ausleiher und dir.

Damit das funktioniert, stelle sicher, dass in deinem Admin-Profil (**Admin-Verwaltung**) **Name** und **Telefon** eingetragen sind.

### Ablehnung

1. Klick auf **Ablehnen** (im ⋯-Menü oder direkter Button)
2. Es öffnet sich ein Dialog mit:
   - **Admin-Nachricht** (optional): Ein Grund oder eine Erklärung für die Ablehnung (wird nicht per Mail gesendet, nur intern)
3. Klick **Ablehnen**
4. Der Ausleiher bekommt eine höfliche Absage per E-Mail
5. Die Anfrage wandert sofort ins **Archiv** mit Status **Abgelehnt** (rotes Badge)

---

## Manuell Ausleihen anlegen

Für Anfragen, die **telefonisch** eingehen oder für **interne Ereignisse**, kann der Admin die Ausleihe direkt im System anlegen, ohne dass der Ausleiher die Online-Form ausfüllt.

### Ausleihe manuell erstellen

1. Navigiere zu **Ausleihen → Aktiv**
2. Klick den Button **+ Neue Ausleihe anlegen** (oben rechts)
3. Es öffnet sich ein Formular mit diesen Feldern:

   **Ausleiher-Daten**:
   - Name (Pflicht)
   - E-Mail (optional)
   - Telefon (optional)
   - Anfragesteller-Typ:
     - FFW Mitglied
     - Verein / Gemeinde
     - Extern

   **Artikel-Auswahl**:
   - Artikel (Dropdown, nur verfügbare)
   - Menge (Standard: 1)
   - Preis wird automatisch berechnet

   **Zeitraum**:
   - Von (Datum, Pflicht)
   - Bis (Datum, Pflicht)

   **Optionale Felder**:
   - Notiz (interne Anmerkungen)

   **E-Mail-Benachrichtigung**:
   - Schieberegler **E-Mail an Ausleiher senden**
   - ✅ Ein: Sendet eine Benachrichtigung (nur falls E-Mail angegeben)
   - ❌ Aus: Keine Mail versendet

4. Klick **Anlegen**
5. Die Ausleihe wird erstellt mit Status **Anfrage** (gelb)
6. Falls E-Mail angegeben und Schieberegler aktiv: Der Ausleiher bekommt eine Benachrichtigung
7. Du kannst dann sofort die Ausleihe bestätigen (s.o.)

### Wichtig: Kaution auch hier bindend

Wenn du eine Ausleihe manuell anlegst (z.B. für ein internes Event), ist **die 50€ Kaution dennoch verbindlich**. Es ist deine Verantwortung, dass der Ausleiher das weiß und die Kaution hinterlegt, bevor das Material rausgeht.

---

## Ausleihen bearbeiten

### Mengen ändern oder Artikel entfernen

**Szenario**: Eine bestätigte oder noch offene Ausleihe soll angepasst werden (z.B. der Ausleiher möchte weniger Stück).

1. Öffne die Ausleihe
2. Im **Gesamtbetrag**-Feld siehst du die Artikel-Liste
3. Falls Status **Anfrage** oder **Bestätigt**: Es erscheinen **Edit-Controls**:
   - **Minus/Plus-Buttons** (−/+) neben jeder Menge
   - **Trash-Button** zum Löschen des Artikels

4. **Menge ändern**: Klick ± um hochzuzählen oder runterzuzählen. Der Preis passt sich an.
5. **Artikel entfernen**: Klick das Trash-Icon. Achtung: Der **letzte Artikel kann nicht gelöscht werden** – wenn du die ganze Ausleihe stornieren willst, nutze die Ablehnung.
6. Die Änderungen speichern sich sofort.

**Hinweis zu Verfügbarkeit**: Wenn mehrere Anfragen das gleiche Artikel überlappen, prüft das System automatisch, ob noch genügend Stück verfügbar sind. Falls eine neue Ausleihe nicht möglich ist, erhältst du eine klare Fehlermeldung.

### Artikel zu einer Ausleihe hinzufügen

**Szenario**: Der Ausleiher möchte noch zusätzliche Artikel.

1. Öffne die Ausleihe (Status: Anfrage oder Bestätigt)
2. Unter der Artikel-Liste findest du den Button **+ Artikel hinzufügen**
3. Es öffnet sich ein Dialog:
   - **Artikel-Dropdown**: Wähle den zu ergänzenden Artikel (nur verfügbare)
   - **Menge**: Wie viele Stück? (Standard: 1)
4. Klick **Hinzufügen**
5. Das System prüft sofort die **Verfügbarkeit**:
   - Sind noch genug Stück im Zeitraum frei?
   - Falls ja: Artikel wird hinzugefügt
   - Falls nein: Fehlermeldung (z.B. „Von 'Leiter' sind nur noch 2 Stück frei im Zeitraum, du wolltest 5 hinzufügen")

Die neue Ausleihe hat den gleichen Zeitraum, die gleiche Person und den gleichen Status wie die ursprüngliche Anfrage.

---

## Inventar verwalten

Die Seite **Inventar** (`/admin/inventory`) ist deine Zentrale für die Verwaltung des Bestands.

### Überblick

- **Kategorien** (Akkordeon): Artikel sind nach Kategorien sortiert (z.B. Tische, Bänke, Leitern)
- **Ausklappbar**: Klick auf eine Kategorie, um alle Artikel darin zu sehen
- **Suchfeld**: Filtert Artikel nach Name

### Artikel bearbeiten

1. Klick auf einen Artikel oder das **Bearbeiten**-Icon
2. Öffnet sich die Detail-Seite mit Feldern:

   - **Name** (Pflichtfeld)
   - **Beschreibung** (optional)
   - **Preis pro Ausleihe** (€, Pauschale) – der Preis, den der Ausleiher zahlt
   - **Verfügbare Stückzahl** (z.B. 5) – wie viele diesen Artikel ihr habt
   - **Verfügbarkeit** (Checkbox):
     - ✅ Verfügbar – wird in der Ausleihe angeboten
     - ❌ Nicht verfügbar – ist deaktiviert (verursacht keine Anfragen)

3. Klick **Speichern**

**Hinweis**: Wenn du die Stückzahl oder den Preis änderst, wirkt sich das nur auf **neue Anfragen** aus. Bereits bestätigte Ausleihen behalten ihre ursprünglichen Daten.

### Neuen Artikel anlegen

1. Klick den Button **+ Neuer Artikel**
2. Fülle alle Felder aus (Name, Preis, Stückzahl, Kategorie)
3. Klick **Anlegen**
4. Der Artikel erscheint sofort im Inventar und ist für neue Anfragen sichtbar

### Artikel deaktivieren

Falls ein Artikel gerade in Reparatur oder Wartung ist:

1. Öffne den Artikel
2. Deaktiviere die Checkbox **Verfügbar**
3. Klick **Speichern**

Der Artikel wird nicht mehr in der öffentlichen Ausleihe angeboten (aber alte Anfragen sind davon nicht betroffen).

---

## Admin-Verwaltung

Die Seite **Admins** (`/admin/admins`) verwaltet alle Admin-Konten und ihre Kontaktdaten.

### Dein Profil einsehen / bearbeiten

1. Navigiere zu **Admins**
2. Klick auf deinen Namen
3. Es öffnet sich dein Profil mit Feldern:
   - **Benutzername** (nicht änderbar, die Login-ID)
   - **E-Mail** (deine E-Mail-Adresse)
   - **Anzeigename** (dein Name, wie er in E-Mails an Ausleiher steht)
   - **Telefon** (deine Telefonnummer, ebenfalls für E-Mails)
   - **Passwort ändern** (optional)

4. Trage **Anzeigename** und **Telefon** ein (sehr wichtig!)
5. Klick **Speichern**

**Wichtig**: Wenn diese Felder leer sind, sieht der Ausleiher bei deiner Bestätigung nicht, wie er dich kontaktiert. Das behindert die Kommunikation.

### Neuen Admin einrichten

1. Klick **+ Neuer Admin**
2. Formular mit Feldern:
   - **Benutzername** (Unique ID zum Login)
   - **Passwort** (mind. 8 Zeichen)
   - **E-Mail**
   - **Anzeigename**
   - **Telefon**

3. Klick **Anlegen**
4. Der neue Admin kann sich sofort mit seinem Benutzernamen und Passwort anmelden

### Admin löschen

1. Öffne das Admin-Konto
2. Klick **Löschen**
3. Bestätige die Sicherheitsabfrage
4. Das Konto wird gelöscht (Vorsicht: nicht rückgängig zu machen)

---

## Wichtige Hinweise

### Kaution – wiederholter Hinweis

🔴 **Zentrale Regel**: Die **50€ Kaution ist in jedem Fall bindend und nicht verhandelbar.**

- Egal ob FFW-Mitglied, Partner oder Externe
- Egal ob online-Anfrage oder manuell angelegt
- **Ohne Kaution, kein Material raus.**

Dies schützt euer Equipment und garantiert die Rückgabe in gutem Zustand.

### Verfügbarkeitsprüfung

Das System prüft automatisch, ob bei einer Anfrage/einem Hinzufügen noch genug Stücke im angeforderten Zeitraum verfügbar sind:

- Es berücksichtigt **nur bestätigte Ausleihen** (nicht offene Anfragen)
- Es zählt die **Menge** mit: 5× Bierbänke nehmen 5 Plätze weg, nicht 1
- Falls eine Anfrage blockiert wird: Klare Fehlermeldung mit verfügbarer Anzahl

Beispiel:
- Inventar: 10 Bierbänke
- Bestätigt im Zeitraum 1. Juni – 3. Juni: 6 Stück
- Neue Anfrage für 2. Juni – 4. Juni möchte 5 Stück
- System sagt: nur noch 4 Stück verfügbar ❌

### E-Mails und Reply-To

- **Neue Anfrage**: Alle Admins mit E-Mail bekommen eine Benachrichtigung
- **Bestätigung**: Der Ausleiher bekommt die Bestätigungs-Mail → Antworten gehen zu **dir** (dem bestätigenden Admin)
- **Ablehnung**: Der Ausleiher bekommt die Ablehnung → Antworten gehen zu **dir**

Dies bedeutet: **Jede Ausleihe hat genau einen Ansprechpartner** (den Admin, der sie bestätigt hat). Das reduziert Verwirrung.

### Kalender-Export (.ics)

Bei bestätigten oder offenen Anfragen gibt es einen Link **Zum Kalender hinzufügen**. Dies erzeugt eine `.ics`-Datei mit:

- **Datum**: Das Abholungsdatum
- **Uhrzeit**: Falls bei Bestätigung angegeben (30-Min-Fenster)
- **Titel**: Renter-Name + Artikel (z.B. „Max Mustermann – Bierbänke")
- **Beschreibung**: Ausführliche Notizen (Person, Kontakt, Artikel, Abholhinweis)

Du kannst diese Datei in deinen persönlichen Kalender (Outlook, Google Calendar, Apple Calendar) importieren.

### Archiv

Das **Archiv** sammelt alle abgeschlossenen Ausleihen (Status: `returned` oder `cancelled`). Diese sind:

- Schreibgeschützt – keine Bearbeitung möglich
- Einsehbar zur Dokumentation und zum Nachschlagen
- Nicht in der Verfügbarkeitsprüfung berücksichtigt (nur `confirmed` ist relevant)

---

## Häufig gestellte Fragen

**F: Der Ausleiher antwortet nicht auf die Bestätigungs-Mail?**
A: Überprüfe, dass die E-Mail angekommen ist (Spam-Filter!). Falls nötig, ruf den Ausleiher direkt an – seine Nummer steht in der Anfrage.

**F: Ein Artikel ist gerade repariert worden, wie bekommt er wieder Verfügbarkeit?**
A: Gehe zu **Inventar**, öffne den Artikel und aktiviere die Checkbox **Verfügbar** wieder.

**F: Ich will alle Anfragen eines Monats sehen?**
A: Das Suchfeld filtert nach Name, E-Mail und Artikel. Für Datumsfilter – aktuell nicht möglich; nutze das Archiv zum Nachschlagen.

**F: Ein Admin-Passwort ist vergessen?**
A: Es gibt aktuell keinen automatischen Reset. Ein anderer Admin muss das Passwort neu setzen (über die Admin-Verwaltung).

**F: Kann ich mehrere Artikel auf einmal hinzufügen?**
A: Nein, aktuell einzeln nacheinander über den **+ Artikel hinzufügen**-Button.

---

**Version**: 1.0 | **Datum**: Juli 2026  
**Für Fragen oder Verbesserungsvorschläge**: stefan@glasei.email
