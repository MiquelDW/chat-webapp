// server action modules contain server-side logic in RPC functions
"use server";

import db from "@/lib/db";

export const findFriends = async (
  id: string,
  friendType: "requestAccepted" | "acceptedRequest"
) => {
  try {
    if (!id) {
      throw new Error("Id is required");
    }

    // current user accepted a friend request
    if (friendType === "requestAccepted") {
      const friends = await db.friends.findMany({
        where: { userId: id },
      });

      return friends;
    }

    // current user got accepted as a friend by another user
    if (friendType === "acceptedRequest") {
      const friends = await db.friends.findMany({
        where: { friendId: id },
      });

      return friends;
    }
  } catch (err) {
    if (err instanceof Error) {
      // TS now knows that error is of type Error
      console.error(err.message);
    } else {
      // Handle the case where error is not of type Error
      console.error("An unexpected error occurred", err);
    }
  }
};
