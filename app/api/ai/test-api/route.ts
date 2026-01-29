import { NextResponse } from "next/server";
import { tempStore } from "@/app/lib/tempStore";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    tempStore.content = data.content;

    return new NextResponse(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Issues in fetching ${error}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ content: tempStore.content });
}
