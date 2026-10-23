import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import {
  markdownToRunbookHtml,
  wrapRunbookDocument,
} from "@/lib/runbook-export";

const RUNBOOK_MD = path.join(process.cwd(), "docs/RUNBOOK.md");
const RUNBOOK_PDF = path.join(
  process.cwd(),
  "public/downloads/mvlusciouslather-ops-runbook.pdf"
);

const DOWNLOAD_NAMES = {
  md: "MV-Luscious-Lather-Ops-Runbook.md",
  html: "MV-Luscious-Lather-Ops-Runbook.html",
  pdf: "MV-Luscious-Lather-Ops-Runbook.pdf",
} as const;

type RunbookFormat = keyof typeof DOWNLOAD_NAMES;

function isFormat(value: string | null): value is RunbookFormat {
  return value === "md" || value === "html" || value === "pdf";
}

async function readRunbookMarkdown(): Promise<string> {
  return readFile(RUNBOOK_MD, "utf8");
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const formatParam = request.nextUrl.searchParams.get("format");
  const format: RunbookFormat = isFormat(formatParam) ? formatParam : "html";

  try {
    if (format === "md") {
      const markdown = await readRunbookMarkdown();
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${DOWNLOAD_NAMES.md}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (format === "html") {
      const markdown = await readRunbookMarkdown();
      const html = wrapRunbookDocument(markdownToRunbookHtml(markdown));
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${DOWNLOAD_NAMES.html}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (format === "pdf") {
      try {
        const pdf = await readFile(RUNBOOK_PDF);
        return new Response(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${DOWNLOAD_NAMES.pdf}"`,
            "Cache-Control": "private, max-age=3600",
          },
        });
      } catch {
        const markdown = await readRunbookMarkdown();
        const html = wrapRunbookDocument(markdownToRunbookHtml(markdown), {
          printable: true,
        });

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": `inline; filename="${DOWNLOAD_NAMES.pdf}"`,
            "Cache-Control": "no-store",
          },
        });
      }
    }

    return new Response("Unsupported format.", { status: 400 });
  } catch (err) {
    console.error("[msvee:runbook-download]", err);
    return new Response("Runbook file not found.", { status: 500 });
  }
}
