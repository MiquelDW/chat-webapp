import db from "@/lib/db";
import { getUserById } from "./users";

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
