// server action modules contain server-side logic in RPC functions
"use server";

import db from "@/lib/db";
import { getLoggedInUser, getUserById } from "./users";
import { getUniqueConversationMember } from "./conversation";

// create and sent message in a conversation
export const createMessage = async (
  conversationId: string,
  type: string,
  content: string[]
) => {
  // retrieve logged in user that's sending a message
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to send a message!");

  // make sure the current user is a member of the given conversation
  const conversationMembership = await getUniqueConversationMember(
    currentUser.id,
    conversationId
  );
  if (!conversationMembership)
    throw new Error("You are not a member of this conversation!");

  // add message to the correct conversation in db after all the checks
  const message = await db.message.create({
    data: {
      senderId: conversationMembership.memberId,
      conversationId: conversationId,
      type: type,
      content: content,
    },
  });

  // use the 'id' of the added message to update the last message sent in the given conversation
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageId: message.id },
  });

  return message;
};

// retrieve all messages from the given conversation
export const getMessages = async (conversationId: string) => {
  // retrieve logged in user that's retrieving all its messages
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to retrieve all your messages!");

  // retrieve all messages whose 'conversationId' match the given 'conversationId'
  const messages = await db.message.findMany({
    where: { conversationId: conversationId },
    orderBy: { createdAt: "desc" },
  });

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // create an array of objects with details of all the messages and their senders within the given convo
  const messagesWithUser = Promise.all(
    messages.map(async (message) => {
      // retrieve the user from db that sent the message in the conversation
      const messageSender = await getUserById(message.senderId);

      if (!messageSender) throw new Error("Could not find sender of message!");

      // retrieve the conversation membership of the current user
      const conversationMembership = await getUniqueConversationMember(
        currentUser.id,
        conversationId
      );
      if (!conversationMembership)
        throw new Error("You aren't a member of this conversation!");

      // return retrieved information about the convo message and its sender
      return {
        message,
        senderImage: messageSender.imageUrl,
        senderName: messageSender.username,
        // helps with rendering the message on right or left hand side
        isCurrentUser: messageSender.id === currentUser.id,
      };
    })
  );

  return messagesWithUser;
};

// retrieve the last message sent in a conversation
export const getLastMessageById = async (messageId: string | null) => {
  // at first, there is no last message sent (don't throw error!)
  if (!messageId) return;

  // find the message whose "id" matches the given "messageId"
  const message = await db.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Last message sent not found!");

  // find the sender of the retrieved message
  const sender = await getUserById(message.senderId);
  if (!sender) throw new Error("User not found");

  // retrieve the content of the retrieved message
  const content = await getMessageContent(
    message.type,
    message.content as unknown as string
  );

  // return the content and sender's username of the retrieved message
  return { content, sender: sender.username };
};

const getMessageContent = async (type: string, content: string) => {
  switch (type) {
    case "text":
      return content;
    default:
      return "[Non-text]";
  }
};
