/**
 * Erzeugt eine iCalendar-Datei (.ics) für eine Ausleihe/Abholung.
 * Wird vom iPhone-Kalender, Google Kalender, Outlook usw. verstanden.
 *
 * Zwei Modi:
 *  - allDay: ganztägiger Termin (Enddatum exklusiv, also letzter Tag + 1)
 *  - mit Uhrzeit: konkreter Termin (lokale Zeit, ohne Zeitzonen-Block –
 *    für den lokalen Gebrauch in einer Region völlig ausreichend)
 */

function pad(n: number) {
  return String(n).padStart(2, "0")
}

/** Datum -> YYYYMMDD (ganztägig, VALUE=DATE) */
function toIcsDate(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

/** Datum+Zeit -> YYYYMMDDTHHMMSS (lokale "schwebende" Zeit) */
function toIcsLocal(date: Date) {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

/** Zeitstempel -> YYYYMMDDTHHMMSSZ (UTC, für DTSTAMP) */
function toIcsStamp(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/** Sonderzeichen gemäß iCalendar maskieren */
function escapeIcs(text: string) {
  return String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

export interface IcsEvent {
  uid: string
  summary: string
  description?: string
  location?: string
  start: Date // Beginn
  end: Date // ganztägig: Enddatum exklusiv · mit Uhrzeit: Endzeitpunkt
  allDay?: boolean // Standard: true (ganztägig)
  stamp?: Date
}

export function buildICS(event: IcsEvent): string {
  const allDay = event.allDay ?? true
  const stamp = event.stamp ?? event.start
  const startLine = allDay
    ? `DTSTART;VALUE=DATE:${toIcsDate(event.start)}`
    : `DTSTART:${toIcsLocal(event.start)}`
  const endLine = allDay
    ? `DTEND;VALUE=DATE:${toIcsDate(event.end)}`
    : `DTEND:${toIcsLocal(event.end)}`

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FFW Raubling//Geraeteverleih//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    "SEQUENCE:0",
    `DTSTAMP:${toIcsStamp(stamp)}`,
    startLine,
    endLine,
    `SUMMARY:${escapeIcs(event.summary)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : "",
    event.location ? `LOCATION:${escapeIcs(event.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)

  // iCalendar verlangt CRLF-Zeilenumbrüche
  return lines.join("\r\n") + "\r\n"
}
