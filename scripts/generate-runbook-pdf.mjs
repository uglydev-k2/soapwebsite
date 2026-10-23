#!/usr/bin/env node
/**
 * Generates a printable PDF from docs/RUNBOOK.md
 * Usage: npm run docs:runbook
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mdToPdf } from "md-to-pdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "docs/RUNBOOK.md");
const outputDir = path.join(root, "public/downloads");
const outputPath = path.join(outputDir, "mvlusciouslather-ops-runbook.pdf");

const stylesheet = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1f2d28;
    max-width: 100%;
  }
  h1 {
    font-size: 22pt;
    color: #2d4a3e;
    border-bottom: 2px solid #c17f59;
    padding-bottom: 8px;
    margin-top: 0;
  }
  h2 {
    font-size: 14pt;
    color: #2d4a3e;
    margin-top: 24px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12pt;
    color: #3d5a4c;
    page-break-after: avoid;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9pt;
    background: #f4f0ea;
    padding: 1px 4px;
    border-radius: 2px;
  }
  pre {
    background: #f4f0ea;
    border: 1px solid #d8d0c4;
    padding: 12px;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  pre code {
    background: none;
    padding: 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 12px 0;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #d8d0c4;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #eef3f0;
    font-weight: 600;
  }
  blockquote {
    border-left: 3px solid #c17f59;
    margin: 12px 0;
    padding: 4px 12px;
    color: #4a5c54;
  }
  hr {
    border: none;
    border-top: 1px solid #d8d0c4;
    margin: 24px 0;
  }
  a {
    color: #2d4a3e;
    text-decoration: none;
  }
  ul, ol {
    padding-left: 20px;
  }
  li {
    margin: 4px 0;
  }
  @page {
    margin: 18mm 16mm;
  }
`;

async function main() {
  const markdown = await readFile(inputPath, "utf8");
  await mkdir(outputDir, { recursive: true });

  const pdf = await mdToPdf(
    { content: markdown },
    {
      dest: outputPath,
      pdf_options: {
        format: "Letter",
        printBackground: true,
        margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
      },
      css: stylesheet,
      launch_options: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    }
  );

  if (!pdf?.filename) {
    throw new Error("PDF generation failed");
  }

  console.log(`Runbook PDF written to ${outputPath}`);
}

main().catch((error) => {
  console.error("[docs:runbook] Failed:", error);
  process.exit(1);
});
