"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { userInfoSchema } from "@/zod/schemas"; // Ensure the schema handles dateOfBirth and phoneNumber
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

interface EditUserFormProps {
  defaultValues: {
    name: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
  };
  onClose: () => void;
}

export function EditUserForm({ defaultValues, onClose }: EditUserFormProps) {
  const { updateUser } = useUser();
  const { data: session, update: updateSession } = useSession(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup with Zod validation
  const form = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof userInfoSchema>) => {
    setIsSubmitting(true);

    // Call your API to update the user info (dateOfBirth and phoneNumber)
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Update context with the new information
      updateUser(data.user);
      onClose(); // Close the modal after submission
    } else {
      console.error("Error updating user:", data.error);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <Input
          value={defaultValues.name}
          readOnly
          id="name"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <Input
          value={defaultValues.email}
          type="email"
          readOnly
          id="email"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <Input
          {...form.register("dateOfBirth")}
          type="date"
          placeholder="Enter your date of birth"
          id="dateOfBirth"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber">Phone Number</label>
        <Input
          {...form.register("phoneNumber")}
          placeholder="Enter your phone number"
          id="phoneNumber"
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white">
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
