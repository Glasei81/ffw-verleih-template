/**
 * Erzeugt eine iCalendar-Datei (.ics) für eine Ausleihe.
 * Wird vom iPhone-Kalender, Google Kalender, Outlook usw. verstanden.
 *
 * Die Ausleihe ist ein ganztägiger Termin von start_date bis end_date
 * (inklusive). Bei ganztägigen Terminen ist das Enddatum im iCal-Standard
 * exklusiv, daher wird end_date + 1 Tag verwendet.
 */

function pad(n: number) {
  return String(n).padStart(2, "0")
}

/** Datum -> YYYYMMDD (für ganztägige Termine, VALUE=DATE) */
function toIcsDate(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
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
  start: Date // Startdatum (ganztägig)
  endExclusive: Date // Enddatum exklusiv (letzter Tag + 1)
  stamp?: Date
}

export function buildICS(event: IcsEvent): string {
  const stamp = event.stamp ?? event.start
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FFW Raubling//Geraeteverleih//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsStamp(stamp)}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.start)}`,
    `DTEND;VALUE=DATE:${toIcsDate(event.endExclusive)}`,
    `SUMMARY:${escapeIcs(event.summary)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : "",
    event.location ? `LOCATION:${escapeIcs(event.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)

  // iCalendar verlangt CRLF-Zeilenumbrüche
  return lines.join("\r\n") + "\r\n"
}
