import { getUniqueConversationMember } from "@/data/conversation";
import { getLoggedInUser, getUserById } from "@/data/users";
import db from "@/lib/db";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId");

    // retrieve logged in user that's retrieving all its messages
    const currentUser = await getLoggedInUser();
    if (!currentUser)
      throw new Error(
        "You need to be logged in to retrieve all your messages!"
      );

    // retrieve all messages whose 'conversationId' match the given 'conversationId'
    const messages = await db.message.findMany({
      where: { conversationId: conversationId as string },
      orderBy: { createdAt: "desc" },
    });

    // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
    // create an array of objects with details of all the messages and their senders within the given convo
    const messagesWithUser = Promise.all(
      messages.map(async (message) => {
        // retrieve the user from db that sent the message in the conversation
        const messageSender = await getUserById(message.senderId);

        if (!messageSender)
          throw new Error("Could not find sender of message!");

        // retrieve the conversation membership of the current user
        const conversationMembership = await getUniqueConversationMember(
          currentUser.id,
          conversationId as string
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

    return new Response(JSON.stringify(messagesWithUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
