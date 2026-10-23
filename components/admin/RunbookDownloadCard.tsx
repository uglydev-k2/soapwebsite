"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 border px-6 py-3 text-sm font-medium transition-colors duration-250";

export function RunbookDownloadCard() {
  return (
    <div className="admin-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="label-caps text-muted">Operations Runbook</h2>
          <p className="mt-2 max-w-xl text-sm text-green">
            Step-by-step guide for orders, Square payments, fulfillment, Shippo
            labels, subscriptions, and incident response.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          <a
            href="/api/admin/runbook?format=pdf"
            download="MV-Luscious-Lather-Ops-Runbook.pdf"
            className={cn(
              linkClass,
              "cta-shimmer border-terra bg-terra text-white hover:bg-terra-2"
            )}
          >
            <Download size={16} aria-hidden />
            Download PDF
          </a>
          <a
            href="/api/admin/runbook?format=pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              linkClass,
              "border-green/20 bg-transparent text-text hover:border-green"
            )}
          >
            <ExternalLink size={16} aria-hidden />
            Open &amp; Save as PDF
          </a>
          <a
            href="/api/admin/runbook?format=html"
            download="MV-Luscious-Lather-Ops-Runbook.html"
            className={cn(
              linkClass,
              "border-green/20 bg-transparent text-text hover:border-green"
            )}
          >
            <Download size={16} aria-hidden />
            Download HTML
          </a>
          <a
            href="/api/admin/runbook?format=md"
            download="MV-Luscious-Lather-Ops-Runbook.md"
            className={cn(
              linkClass,
              "border-green/20 bg-transparent text-text hover:border-green"
            )}
          >
            <FileText size={16} aria-hidden />
            Download Markdown
          </a>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        Regenerate the PDF after editing{" "}
        <code className="text-green">docs/RUNBOOK.md</code> with{" "}
        <code className="text-green">npm run docs:runbook</code>. If no PDF is
        built yet, &quot;Open &amp; Save as PDF&quot; opens a print-ready view.
      </p>
    </div>
  );
}
