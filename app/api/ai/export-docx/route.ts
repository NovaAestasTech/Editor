import { NextRequest } from "next/server";
import HTMLtoDOCX from "html-to-docx";
import { generateHTML } from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";
export async function POST(req: NextRequest) {
  try {
    const { content, filename } = await req.json();
    const htmlContent = await generateHTML(content, [StarterKit]);
    const styledHTML = `
  <html>
    <head>
      <style>
        body {
          font-family: "Times New Roman";
          font-size: 12pt;
          line-height: 1.5;
        }

        p {
          margin: 0 0 10pt 0;
        }

        h1 { font-size: 24pt; font-weight: bold; }
        h2 { font-size: 20pt; font-weight: bold; }
        h3 { font-size: 16pt; font-weight: bold; }

        ul, ol {
          margin-left: 20pt;
        }

        table {
          border-collapse: collapse;
          width: 100%;
        }

        table, th, td {
          border: 1px solid black;
        }

        th, td {
          padding: 6pt;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
  </html>
  `;
    const fileBuffer = await HTMLtoDOCX(styledHTML, null, {
      pageSize: {
        width: 11906,
        height: 16838,
      },
      margins: {
        top: 1440,
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
      footer: true,
      pageNumber: true,
    });
    return new Response(fileBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename=${filename || "document"}.docx`,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
