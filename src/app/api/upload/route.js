import { NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    // Validate size (20MB = 20 * 1024 * 1024 bytes)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 20MB limit" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const mimeType = file.type;

    const url = await uploadFileToS3(buffer, fileName, mimeType);

    return NextResponse.json(
      { message: "File uploaded successfully", url },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { message: "Internal server error during upload" },
      { status: 500 },
    );
  }
}
