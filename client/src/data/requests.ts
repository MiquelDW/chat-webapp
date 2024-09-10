// server action modules contain server-side logic in RPC functions
"use server";

import * as z from "zod";
import { getLoggedInUser, getUserByEmail, getUserById } from "./users";
import db from "@/lib/db";
import { addFriendFormSchema } from "@/schemas/zod-schemas";
import { findFriends } from "./friends";
import { createConversation } from "./conversation";

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

  // add a request to db after all the checks
  await db.request.create({
    data: { senderId: currentUser.id, receiverId: receivingUser.id },
  });
};

export const getRequests = async () => {
  // retrieve logged in user that's retrieving all friend requests
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error(
      "You need to be logged in to retrieve all friend requests!"
    );

  // retrieve all received friend requests from current user
  const requests = await db.request.findMany({
    where: { receiverId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // all given async functions to the Promise.all() run in parallel
  // creates an array of senders that have sent a friend request to the current user
  // each object inside the array holds information about the sender and the sent friend request
  const requestsWithSender = await Promise.all(
    requests.map(async (request) => {
      // find the sender of each friend request to the current user
      const sender = await db.user.findUnique({
        where: { id: request.senderId },
      });

      // throw error if user that sended friend request doesn't exist
      if (!sender) throw new Error("Friend Request sender could not be found");

      return { sender, request };
    })
  );

  return requestsWithSender;
};

// count the number of received requests from the current user
export const countRequests = async () => {
  // retrieve logged in user that's retrieving its count of friend requests
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error(
      "You need to be logged in to get the count of friend request!"
    );

  // count the number of received requests from the current user
  const requestsCount = await db.request.count({
    where: { receiverId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  return requestsCount;
};

// deny received friend request
export const denyRequest = async (reqId: string) => {
  // retrieve logged in user that's denying the given friend request
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to deny a friend request!");

  // retrieve the current friend request from db by the given 'reqId' that the current user wants to deny
  const request = await db.request.findUnique({ where: { id: reqId } });

  // throw error if friend request that current user wants to deny couldn't be found
  // or throw error if the receiver's id of retrieved request is not equal to the current user's id (other users can't deny a request they didn't receive)
  if (!request || request.receiverId !== currentUser.id)
    throw new Error("There was an error denying this request");

  // delete retrieved friend request from db
  await db.request.delete({ where: { id: request.id } });
};

// accept a friend request and start a private conversation
export const acceptRequest = async (reqId: string) => {
  // retrieve logged in user that's accepting the given friend request
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to accept a friend request!");

  // retrieve the current friend request from db by the given 'reqId' that the current user wants to accept
  const request = await db.request.findUnique({ where: { id: reqId } });

  // throw error if friend request that current user wants to accept couldn't be found
  // or throw error if the receiver's id of retrieved request is not equal to the current user's id (other users can't accept a request they didn't receive)
  if (!request || request.receiverId !== currentUser.id)
    throw new Error("There was an error accepting this request");

  // create a new private conversation
  const privateConversation = await createConversation({ isGroup: false });
  if (!privateConversation)
    throw new Error("Failed to create a private conversation!");

  // create a friendship between the current user and the accepted user and link them to the same conversation
  await db.friends.create({
    data: {
      userId: currentUser.id,
      friendId: request.senderId,
      conversationId: privateConversation.id,
    },
  });

  // add the current user and the accepted user as convo-members to the private conversation (these promises run in parallel which is faster)
  await Promise.all([
    await db.conversationMember.create({
      data: {
        memberId: currentUser.id,
        conversationId: privateConversation.id,
      },
    }),
    await db.conversationMember.create({
      data: {
        memberId: request.senderId,
        conversationId: privateConversation.id,
      },
    }),
  ]);

  // after forming the friendship and creating a conversation, delete the retrieved and accepted friend request from db
  await db.request.delete({ where: { id: request.id } });
};
