import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const { Schema } = mongoose;

const DocumentSchema = new Schema(
    {
        content: { type: String },
        lastModified: { type: Date },
    },
    {
        strict: false,
        collection: "documents",
    },
);

const Documents =
    mongoose.models.Documents || mongoose.model("Documents", DocumentSchema);

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var __mongoose_conn:
        | {
                conn: typeof mongoose | null;
                promise: Promise<typeof mongoose> | null;
            }
        | undefined;
}

const cached = global.__mongoose_conn || { conn: null, promise: null };
global.__mongoose_conn = cached;

async function connectToDatabase() {
    if (!MONGODB_URI) {
        throw new Error("Missing MONGODB_URI environment variable");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { dbName: "blackletter" });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

async function updateDocument(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, content } = body || {};

        if (!documentId || typeof documentId !== "string") {
            return NextResponse.json(
                { error: "documentId is required" },
                { status: 400 },
            );
        }

        if (typeof content !== "string") {
            return NextResponse.json(
                { error: "content must be a string" },
                { status: 400 },
            );
        }

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return NextResponse.json(
                { error: "Invalid documentId" },
                { status: 400 },
            );
        }

        await connectToDatabase();

        const updated = await Documents.findByIdAndUpdate(
            documentId,
            {
                $set: {
                    content,
                    lastModified: new Date(),
                },
            },
            { new: true },
        );

        if (!updated) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, documentId }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return updateDocument(request);
}

export async function PATCH(request: NextRequest) {
    return updateDocument(request);
}