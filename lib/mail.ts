/**
 * Absender-Adresse für alle ausgehenden E-Mails.
 *
 * Sobald die eigene Domain bei Resend verifiziert ist, in Vercel die
 * Umgebungsvariable RESEND_FROM setzen, z.B.:
 *   RESEND_FROM="FFW Raubling Verleih <verleih@ffw-raubling.de>"
 *
 * Ohne gesetzte Variable wird die Resend-Sandbox-Adresse verwendet
 * (funktioniert nur an die eigene, bei Resend registrierte Adresse).
 */
export const MAIL_FROM =
  process.env.RESEND_FROM || "FFW Raubling Verleih <onboarding@resend.dev>"

/**
 * Macht beliebigen Nutzertext für die Einbettung in E-Mail-HTML sicher,
 * indem HTML-Sonderzeichen in ihre Entities umgewandelt werden.
 * So wird z.B. ein im Namensfeld eingegebenes "<b>" als Text angezeigt
 * und nicht als HTML interpretiert.
 */
export function escapeHtml(value: string | null | undefined): string {
  if (value == null) return ""
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Wandelt eine (deutsche) Telefonnummer in das internationale Format
 * für wa.me-/WhatsApp-Links um: nur Ziffern, mit Ländervorwahl, ohne +.
 * Beispiele:
 *   "0170 8679702"   -> "491708679702"
 *   "+49 170 8679702"-> "491708679702"
 *   "0049170..."     -> "49170..."
 * Gibt null zurück, wenn keine sinnvolle Nummer erkennbar ist.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const hasPlus = phone.trim().startsWith("+")
  let digits = phone.replace(/\D/g, "")
  if (!digits) return null
  if (hasPlus) {
    // bereits international (z.B. +49…)
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2)
  } else if (digits.startsWith("0")) {
    digits = "49" + digits.slice(1) // deutsche Nummer
  }
  return digits.length >= 8 ? digits : null
}
