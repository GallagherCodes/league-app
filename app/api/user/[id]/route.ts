// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Define Zod schema to validate the user update input
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          accounts: true, // Include related data if needed
        },
      });
  
      if (user) {
        return NextResponse.json(user);
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
  }