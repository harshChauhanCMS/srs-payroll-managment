import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const dbName = User.db.name;
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ softDelete: false });
    const collections = await User.db.db.listCollections().toArray();

    return NextResponse.json({
      message: "Database debug info",
      database: dbName,
      mongoUri: process.env.MONGO_URI?.replace(/:[^:]*@/, ":***@"), // Hide password
      totalUsers,
      activeUsers,
      collections: collections.map((c) => c.name),
    });
  } catch (err) {
    console.error("Debug error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
