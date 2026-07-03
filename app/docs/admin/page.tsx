import { readFileSync } from "fs"
import { join } from "path"
import { marked } from "marked"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default async function AdminDocsPage() {
  const filePath = join(process.cwd(), "ANLEITUNG-ADMIN.md")
  const markdown = readFileSync(filePath, "utf-8")
  const html = await marked(markdown)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/admin/docs">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <a href="/api/docs/pdf?type=admin">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Als PDF herunterladen
            </Button>
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="prose prose-sm max-w-none
            prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed
            prose-ul:text-gray-700 prose-ul:mb-4
            prose-li:mb-2
            prose-strong:font-bold prose-strong:text-gray-900
            prose-table:text-sm prose-table:mb-4
            prose-table:border prose-table:border-gray-300
            prose-th:bg-gray-100 prose-th:font-bold prose-th:p-2
            prose-td:border prose-td:border-gray-300 prose-td:p-2
            prose-code:text-red-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-600">
          <div>FFW Raubling – Geräteverleih</div>
          <a href="/api/docs/pdf?type=admin">
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              PDF herunterladen
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
