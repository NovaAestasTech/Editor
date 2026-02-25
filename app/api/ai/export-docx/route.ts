import { NextRequest, NextResponse } from "next/server";
import htmltoDocx from "html-to-docx";
interface PageSize {
  width: number;
  height: number;
}
interface DocumentOptions {
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  orientation: "portrait" | "landscape";
  pageSize: PageSize;
  font: string;
  fontSize: number;
  decodeEntities: boolean;
}
export async function POST(req: NextRequest) {
  try {
    const { content, filename } = await req.json();

    const docOptions: DocumentOptions = {
      margin: {
        top: 1440,
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
      orientation: "portrait" as const,
      pageSize: { width: 11906, height: 16838 },
      font: "Calibri",
      fontSize: 22,
      decodeEntities: true,
    };
    const docBuffer = await htmltoDocx(content, null, docOptions);
    return new NextResponse(docBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
