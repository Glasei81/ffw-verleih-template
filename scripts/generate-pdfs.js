#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")

function generatePDF(markdownFile, outputFile) {
  const markdown = fs.readFileSync(markdownFile, "utf-8")

  const pdf = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  })

  // Determine title based on file
  const title = markdownFile.includes("ADMIN")
    ? "Bedienungsanleitung für Administratoren"
    : "Bedienungsanleitung für Ausleiher"

  // Add metadata
  pdf.metadata.Title = title
  pdf.metadata.Author = "FFW Raubling"
  pdf.metadata.CreationDate = new Date()

  // Add title and metadata
  pdf.fontSize(24).font("Helvetica-Bold").text(title, { align: "center" })
  pdf.moveDown(0.5)
  pdf.fontSize(10).font("Helvetica").text("FFW Raubling – Geräteverleih", { align: "center" })
  pdf.moveDown(1)

  // Parse markdown and add content
  const lines = markdown.split("\n")
  let inCodeBlock = false

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      pdf.moveDown(0.3)
      continue
    }

    // Skip code block markers
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

  // Create public directory if it doesn't exist
  const publicDir = path.join(process.cwd(), "public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Save PDF
  pdf.pipe(fs.createWriteStream(outputDir))
  pdf.end()

  return new Promise((resolve, reject) => {
    pdf.on("end", () => {
      console.log(`✓ Generated: ${outputFile}`)
      resolve()
    })
    pdf.on("error", reject)
  })
}

async function main() {
  const outputDir = path.join(process.cwd(), "public")

  // Create public directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log("Generating PDFs...\n")

  try {
    // Generate admin manual
    await new Promise((resolve, reject) => {
      const markdown = fs.readFileSync("ANLEITUNG-ADMIN.md", "utf-8")
      const pdf = new PDFDocument({ size: "A4", margin: 40, bufferPages: true })

      pdf.metadata.Title = "Bedienungsanleitung für Administratoren"
      pdf.metadata.Author = "FFW Raubling"
      pdf.metadata.CreationDate = new Date()

      pdf.fontSize(24).font("Helvetica-Bold").text("Bedienungsanleitung für Administratoren", { align: "center" })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font("Helvetica").text("FFW Raubling – Geräteverleih", { align: "center" })
      pdf.moveDown(1)

      const lines = markdown.split("\n")
      for (const line of lines) {
        if (!line.trim()) {
          pdf.moveDown(0.3)
          continue
        }
        if (line.includes("```")) continue

        let text = line
          .replace(/^# (.+)$/, "$1")
          .replace(/^## (.+)$/, "$1")
          .replace(/^### (.+)$/, "$1")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1")
          .replace(/\[(.+?)\]\(.+?\)/g, "$1")

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

        pdf.fontSize(fontSize).font(isBold ? "Helvetica-Bold" : "Helvetica")

        if (pdf.y > pdf.page.height - 60) {
          pdf.addPage()
        }

        pdf.text(text, { width: pdf.page.width - 80, align: "left", continued: false })

        if (fontSize > 11) {
          pdf.moveDown(0.3)
        }
      }

      const pages = pdf.bufferedPageRange().count
      for (let i = 0; i < pages; i++) {
        pdf.switchToPage(i)
        pdf.fontSize(9).font("Helvetica").text(`Seite ${i + 1} von ${pages}`, 40, pdf.page.height - 30, { align: "center" })
      }

      const adminOutput = path.join(outputDir, "ANLEITUNG-ADMIN.pdf")
      pdf.pipe(fs.createWriteStream(adminOutput))
      pdf.on("end", () => {
        console.log(`✓ Generated: public/ANLEITUNG-ADMIN.pdf`)
        resolve()
      })
      pdf.on("error", reject)
      pdf.end()
    })

    // Generate enduser manual
    await new Promise((resolve, reject) => {
      const markdown = fs.readFileSync("ANLEITUNG-ENDBENUTZER.md", "utf-8")
      const pdf = new PDFDocument({ size: "A4", margin: 40, bufferPages: true })

      pdf.metadata.Title = "Bedienungsanleitung für Ausleiher"
      pdf.metadata.Author = "FFW Raubling"
      pdf.metadata.CreationDate = new Date()

      pdf.fontSize(24).font("Helvetica-Bold").text("Bedienungsanleitung für Ausleiher", { align: "center" })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font("Helvetica").text("FFW Raubling – Geräteverleih", { align: "center" })
      pdf.moveDown(1)

      const lines = markdown.split("\n")
      for (const line of lines) {
        if (!line.trim()) {
          pdf.moveDown(0.3)
          continue
        }
        if (line.includes("```")) continue

        let text = line
          .replace(/^# (.+)$/, "$1")
          .replace(/^## (.+)$/, "$1")
          .replace(/^### (.+)$/, "$1")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1")
          .replace(/\[(.+?)\]\(.+?\)/g, "$1")

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

        pdf.fontSize(fontSize).font(isBold ? "Helvetica-Bold" : "Helvetica")

        if (pdf.y > pdf.page.height - 60) {
          pdf.addPage()
        }

        pdf.text(text, { width: pdf.page.width - 80, align: "left", continued: false })

        if (fontSize > 11) {
          pdf.moveDown(0.3)
        }
      }

      const pages = pdf.bufferedPageRange().count
      for (let i = 0; i < pages; i++) {
        pdf.switchToPage(i)
        pdf.fontSize(9).font("Helvetica").text(`Seite ${i + 1} von ${pages}`, 40, pdf.page.height - 30, { align: "center" })
      }

      const enduserOutput = path.join(outputDir, "ANLEITUNG-ENDBENUTZER.pdf")
      pdf.pipe(fs.createWriteStream(enduserOutput))
      pdf.on("end", () => {
        console.log(`✓ Generated: public/ANLEITUNG-ENDBENUTZER.pdf`)
        resolve()
      })
      pdf.on("error", reject)
      pdf.end()
    })

    console.log("\n✓ PDFs successfully generated in public/ directory")
  } catch (error) {
    console.error("Error generating PDFs:", error)
    process.exit(1)
  }
}

main()
