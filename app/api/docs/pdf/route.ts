import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { marked } from "marked"
import PDFDocument from "pdfkit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["admin", "enduser"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid or missing type parameter. Use 'admin' or 'enduser'." },
        { status: 400 }
      )
    }

    // Read markdown file
    const filename = type === "admin" ? "ANLEITUNG-ADMIN.md" : "ANLEITUNG-ENDBENUTZER.md"
    const filePath = join(process.cwd(), filename)
    const markdown = readFileSync(filePath, "utf-8")

    // Convert markdown to HTML
    const html = await marked(markdown)

    // Create PDF
    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    })

    // Add metadata
    const title = type === "admin" ? "Bedienungsanleitung für Administratoren" : "Bedienungsanleitung für Ausleiher"
    pdf.metadata.Title = title
    pdf.metadata.Author = "FFW Raubling"
    pdf.metadata.CreationDate = new Date()

    // Add title and metadata
    pdf.fontSize(24).font("Helvetica-Bold").text(title, { align: "center" })
    pdf.moveDown(0.5)
    pdf.fontSize(10).font("Helvetica").text("FFW Raubling – Geräteverleih", { align: "center" })
    pdf.moveDown(1)

    // Parse HTML and add content
    // Simple text content from markdown (basic parsing, no complex HTML)
    const lines = markdown.split("\n")
    let inCodeBlock = false
    let currentY = pdf.y

    for (const line of lines) {
      // Skip empty lines and code block markers
      if (!line.trim()) {
        pdf.moveDown(0.3)
        continue
      }

      if (line.includes("```")) {
        inCodeBlock = !inCodeBlock
        continue
      }

      if (inCodeBlock) continue

      // Parse markdown formatting
      let text = line
        .replace(/^# (.+)$/, "$1")
        .replace(/^## (.+)$/, "$1")
        .replace(/^### (.+)$/, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1") // bold
        .replace(/\*(.+?)\*/g, "$1") // italic
        .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links

      // Detect heading level
      let fontSize = 11
      let isBold = false

      if (/^# /.test(line)) {
        fontSize = 20
        isBold = true
        text = text.replace(/^# /, "")
      } else if (/^## /.test(line)) {
        fontSize = 16
        isBold = true
        text = text.replace(/^## /, "")
      } else if (/^### /.test(line)) {
        fontSize = 13
        isBold = true
        text = text.replace(/^### /, "")
      }

      // Set font
      const fontName = isBold ? "Helvetica-Bold" : "Helvetica"
      pdf.fontSize(fontSize).font(fontName)

      // Add page break if needed
      if (pdf.y > pdf.page.height - 60) {
        pdf.addPage()
      }

      // Add text with word wrap
      pdf.text(text, {
        width: pdf.page.width - 80,
        align: "left",
        continued: false,
      })

      if (fontSize > 11) {
        pdf.moveDown(0.3)
      }
    }

    // Add footer with page numbers
    const pages = pdf.bufferedPageRange().count
    for (let i = 0; i < pages; i++) {
      pdf.switchToPage(i)
      pdf.fontSize(9).font("Helvetica").text(
        `Seite ${i + 1} von ${pages}`,
        40,
        pdf.page.height - 30,
        { align: "center" }
      )
    }

    // Generate buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      pdf.on("data", (chunk) => chunks.push(chunk))
      pdf.on("end", () => resolve(Buffer.concat(chunks)))
      pdf.on("error", reject)
      pdf.end()
    })

    // Return PDF
    const pdfFileName = type === "admin" ? "ANLEITUNG-ADMIN.pdf" : "ANLEITUNG-ENDBENUTZER.pdf"
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName}"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Fehler beim Generieren der PDF" },
      { status: 500 }
    )
  }
}
