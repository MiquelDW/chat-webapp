// server action modules contain server-side logic in RPC functions
"use server";

import db from "@/lib/db";
import { getLoggedInUser, getUserById } from "./users";

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

export const getAllFriends = async () => {
  // retrieve logged in user that's retrieving all its friends
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to retrieve your friends!");

  // collect all the friends where the current user has accepted a friend request
  const acceptedFriends = await findFriends(currentUser.id, "requestAccepted");

  // collect all the friends where the current user got accepted as a friend
  const userGotAcceptedFriends = await findFriends(
    currentUser.id,
    "acceptedRequest"
  );
  if (!acceptedFriends || !userGotAcceptedFriends)
    throw new Error("Friends not found!");

  // combine the retrieved friendship records
  const friendships = [...acceptedFriends, ...userGotAcceptedFriends];

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // create an array of objects with user-details of all the friends of the current user
  const friendsDetails = await Promise.all(
    friendships.map(async (friendship) => {
      if (friendship.userId === currentUser.id) {
        // retrieve friend from db where the current user has accepted a friend request
        const friendAcceptedByUser = await getUserById(friendship.friendId);
        if (!friendAcceptedByUser) throw new Error("Friend could not be found");

        return friendAcceptedByUser;
      } else {
        // retrieve friend from db where the current user got accepted as a friend
        const friendAcceptedUser = await getUserById(friendship.userId);
        if (!friendAcceptedUser) throw new Error("Friend could not be found");

        return friendAcceptedUser;
      }
    })
  );

  // return rerieved information about the user-details of all friends of the current user
  return friendsDetails;
};

// delete the friendship between the current user and its private convo member
export const deleteFriend = async (conversationId: string) => {
  // retrieve logged in user that's removing the given friend
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to remove a friend!");

  // find the conversation whose "id" matches the given "conversationId"
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new Error("Conversation not found!");

  // get all the members of the retrieved conversation that needs to be deleted
  const memberships = await db.conversationMember.findMany({
    where: { conversationId: conversationId },
  });
  // you can only remove friends from a private convo and NOT a group convo
  if (!memberships || memberships.length !== 2)
    throw new Error("Retrieved conversation doesn't have any members!");

  // find the friendship that the current user wants to remove
  const friendship = await db.friends.findFirst({
    where: { conversationId: conversationId },
  });
  if (!friendship) throw new Error("Friend could not be found");

  // get the messages of the given convo that you need to remove as well
  const messages = await db.message.findMany({
    where: { conversationId: conversationId },
  });

  // delete the friendship between the current user and its private convo member
  await db.friends.delete({ where: { id: friendship.id } });
  // delete all the retrieved messages of the given conversation
  await Promise.all(
    messages.map(async (message) => {
      await db.message.delete({ where: { id: message.id } });
    })
  );
  // delete all convo members of the given conversation
  await Promise.all(
    memberships.map(async (membership) => {
      await db.conversationMember.delete({
        where: { id: membership.id },
      });
    })
  );
  // finally, remove the private conversation
  await db.conversation.delete({ where: { id: conversationId } });
};
