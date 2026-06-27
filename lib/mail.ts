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
