// server action modules contain server-side logic in RPC functions
"use server";

import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { User } from "@prisma/client";

// function retrieves currently logged in user from db by id
export async function getLoggedInUser() {
  try {
    // retrieve user Id of currently logged in user
    const { userId } = auth();
    if (!userId)
      throw new Error("You need to be logged in to perform this action!");

    // get user from db whose id matches the given 'userId'
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error("User not found");

    return user;
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}

// function retrieves user from db by Id
export async function getUserById(userId: string) {
  try {
    if (!userId) throw new Error("user ID is required");

    // get user from db whose id matches the given 'userId'
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error("User not found");

    return user;
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}

export async function getUserByEmail(email: string) {
  try {
    if (!email) {
      throw new Error("email is required");
    }

    // get first user entry from db whose email matches the given 'email'
    const user = await db.user.findFirst({ where: { email: email } });

    return user;
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}

export async function createUser(data: User) {
  try {
    // create new user object in the db
    const user = await db.user.create({ data });

    return user;
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}

export async function updateUser(id: string, data: Partial<User>) {
  try {
    if (!id) {
      throw new Error("Id is required");
    }

    const user = await db.user.update({ where: { id: id }, data });

    return user;
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}

export async function deleteUser(id: string) {
  try {
    if (!id) {
      throw new Error("Id is required");
    }

    await db.user.delete({ where: { id: id } });
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
}
