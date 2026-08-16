/**
 * Zentrale Konfiguration für das FFW-Verleihsystem.
 * Alle Werte können via Umgebungsvariablen überschrieben werden (Vercel → Settings → Environment Variables).
 * Siehe README.md für die vollständige Liste.
 */

// Organisation
export const ORG_NAME = process.env.ORG_NAME || "Freiwillige Feuerwehr Musterstadt"
export const ORG_SHORT = process.env.ORG_SHORT || "FFW Musterstadt"

// Farben (Tailwind/Hex) – werden in Komponenten via CSS-Variablen genutzt
export const PRIMARY_COLOR = process.env.PRIMARY_COLOR || "#dc2626"      // FFW-Rot
export const SECONDARY_COLOR = process.env.SECONDARY_COLOR || "#fef2f2"  // Hellrot-Hintergrund
export const PRIMARY_COLOR_HOVER = process.env.PRIMARY_COLOR_HOVER || "#b91c1c"

// Assets
export const SKYLINE_URL = process.env.SKYLINE_URL || "/skyline.jpg"
export const FAVICON_URL = process.env.FAVICON_URL || "/favicon.ico"
export const OG_IMAGE_URL = process.env.OG_IMAGE_URL || "/og-image.png"

// Verleih-Einstellungen
export const KAUTION_EUR = Number(process.env.KAUTION_EUR || 50)
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "verleih@ffw-musterstadt.de"

// E-Mail (Resend)
export const MAIL_FROM = process.env.RESEND_FROM || `${ORG_SHORT} Verleih <onboarding@resend.dev>`

// Live-Demo Referenz (für README/Links)
export const REFERENCE_URL = "https://verleih.feuerwehr-raubling.de"
export const REFERENCE_NAME = "verleih.feuerwehr-raubling.de"

// Spenden-Link (Template-Ersteller)
export const DONATION_PAYPAL = "https://www.paypal.me/StefanGlas231/5"
export const DONATION_NOTE = "Kein Muss – nur Wertschätzung für ~100h Entwicklungszeit. 🙏"

// Hilfsfunktionen
export function formatPrice(price: number | string): string {
  return Number(price).toLocaleString("de-DE")
}

export function getOrgConfig() {
  return {
    name: ORG_NAME,
    short: ORG_SHORT,
    primaryColor: PRIMARY_COLOR,
    secondaryColor: SECONDARY_COLOR,
    primaryColorHover: PRIMARY_COLOR_HOVER,
    skylineUrl: SKYLINE_URL,
    faviconUrl: FAVICON_URL,
    ogImageUrl: OG_IMAGE_URL,
    kautionEur: KAUTION_EUR,
    supportEmail: SUPPORT_EMAIL,
    mailFrom: MAIL_FROM,
    referenceUrl: REFERENCE_URL,
    referenceName: REFERENCE_NAME,
    donationPaypal: DONATION_PAYPAL,
    donationNote: DONATION_NOTE,
  }
}