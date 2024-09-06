// server action modules contain server-side logic in RPC functions
"use server";

import * as z from "zod";
import { getLoggedInUser, getUserByEmail } from "./users";
import db from "@/lib/db";
import { addFriendFormSchema } from "@/schemas/zod-schemas";
import { findFriends } from "./friends";

export const createRequest = async (
  values: z.infer<typeof addFriendFormSchema>
) => {
  // retrieve logged in user that's sending the friend request
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to send a friend request!");

  // validate the form data again in the backend
  const validatedFields = addFriendFormSchema.safeParse(values);
  // throw error if form data is NOT valid
  if (!validatedFields.success) throw new Error("Invalid data!");

  // extract validated fields
  const { email } = validatedFields.data;

  // throw error if user tries to send a friend request to his own email
  if (currentUser.email === email)
    throw new Error("You can't send a friend request to yourself!");

  // retrieve user from db by the given 'email' that receives the friend request
  const receivingUser = await getUserByEmail(email);
  // throw error if no user has been found
  if (!receivingUser) throw new Error("Receiving user not found");

  // throw error if user already sent a friend request to the receiving user
  const requestAlreadySent = await db.request.findFirst({
    where: {
      AND: [{ senderId: currentUser.id }, { receiverId: receivingUser.id }],
    },
  });
  if (requestAlreadySent) throw new Error("Request already sent");

  // throw error if receiving user already sent a friend request to the sending user
  const requestAlreadyReceived = await db.request.findFirst({
    where: {
      AND: [{ senderId: receivingUser.id }, { receiverId: currentUser.id }],
    },
  });
  if (requestAlreadyReceived)
    throw new Error("This user has already sent you a request");

  // collect all the friends where the current user has accepted a friend request
  const acceptedFriends = await findFriends(currentUser.id, "requestAccepted");

  // collect all the friends where the current user got accepted as a friend
  const userGotAcceptedFriends = await findFriends(
    currentUser.id,
    "acceptedRequest"
  );

  // check if the receiving user is already friends with the current user that's sending the friend request
  if (
    acceptedFriends?.some((friend) => friend.friendId === receivingUser.id) ||
    userGotAcceptedFriends?.some((friend) => friend.userId === receivingUser.id)
  )
    throw new Error("You are already friends with this user!");

  return { currentUserId: currentUser.id, receivingUser: receivingUser.id };
};
