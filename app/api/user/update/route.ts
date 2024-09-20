// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Define Zod schema to validate the user update input
const updateUserSchema = z.object({
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Invalid date format. Use YYYY-MM-DD.",
    }), // Validate the date format
  phoneNumber: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Get session information
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate the request body using Zod
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { dateOfBirth, phoneNumber } = result.data;

    // Update the user's data (keeping dateOfBirth as a string)
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        dateOfBirth, // Store the dateOfBirth as a string in the DB
        phoneNumber,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
