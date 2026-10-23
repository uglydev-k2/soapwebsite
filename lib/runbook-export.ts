/**
 * Lightweight markdown → HTML for the ops runbook export (headings, lists, code, tables).
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[]): string {
  const rows = lines.map(parseTableRow);
  if (!rows.length) return "";

  const [header, ...bodyRows] = rows;
  const body = bodyRows.filter((row) => !row.every((cell) => /^-+$/.test(cell)));

  const thead = `<thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${body
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`
    )
    .join("")}</tbody>`;

  return `<table>${thead}${tbody}</table>`;
}

export function markdownToRunbookHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === "---") {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (isTableRow(line)) {
      const tableLines: string[] = [];
      while (index < lines.length && isTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      index += 1;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*] /.test(lines[index])) {
        items.push(`<li>${inlineMarkdown(lines[index].replace(/^[-*] /, ""))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) {
        items.push(
          `<li>${inlineMarkdown(lines[index].replace(/^\d+\. /, ""))}</li>`
        );
        index += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (!line.trim()) {
      index += 1;
      continue;
    }

    html.push(`<p>${inlineMarkdown(line)}</p>`);
    index += 1;
  }

  return html.join("\n");
}

export const RUNBOOK_PRINT_STYLES = `
  :root {
    color-scheme: light;
    --green: #2d4a3e;
    --terra: #c17f59;
    --muted: #5c6b64;
    --cream: #f7f3ed;
    --border: #d8d0c4;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1f2d28;
    background: white;
  }
  .doc-header {
    border-bottom: 2px solid var(--terra);
    margin-bottom: 28px;
    padding-bottom: 16px;
  }
  .doc-header p {
    margin: 0;
    color: var(--muted);
    font-size: 10pt;
  }
  h1 { font-size: 24pt; color: var(--green); margin: 0 0 8px; }
  h2 {
    font-size: 14pt;
    color: var(--green);
    margin: 28px 0 10px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12pt;
    color: #3d5a4c;
    margin: 20px 0 8px;
    page-break-after: avoid;
  }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0 12px; padding-left: 22px; }
  li { margin: 4px 0; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9pt;
    background: var(--cream);
    padding: 1px 4px;
    border-radius: 2px;
  }
  pre {
    background: var(--cream);
    border: 1px solid var(--border);
    padding: 12px;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  pre code { background: none; padding: 0; font-size: 8.5pt; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 12px 0 16px;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #eef3f0; }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
  }
  a { color: var(--green); text-decoration: none; }
  .print-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  .print-actions button,
  .print-actions a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 16px;
    border: 1px solid var(--border);
    background: white;
    color: var(--green);
    font-size: 10pt;
    text-decoration: none;
    cursor: pointer;
  }
  .print-actions button.primary {
    background: var(--terra);
    border-color: var(--terra);
    color: white;
  }
  @media print {
    body { padding: 0; }
    .print-actions { display: none; }
    a { color: inherit; }
  }
`;

export function wrapRunbookDocument(bodyHtml: string, options?: { printable?: boolean }): string {
  const printable = options?.printable ?? false;
  const generated = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MV Luscious Lather — Operations Runbook</title>
  <style>${RUNBOOK_PRINT_STYLES}</style>
</head>
<body>
  ${
    printable
      ? `<div class="print-actions">
          <button type="button" class="primary" onclick="window.print()">Print / Save as PDF</button>
          <a href="/api/admin/runbook?format=md">Download Markdown</a>
        </div>`
      : ""
  }
  <header class="doc-header">
    <h1>MV Luscious Lather</h1>
    <p>Operations Runbook · Generated ${generated}</p>
  </header>
  <main>${bodyHtml}</main>
</body>
</html>`;
}
