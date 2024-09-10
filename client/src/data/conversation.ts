// server action modules contain server-side logic in RPC functions
"use server";

import * as z from "zod";
import { createGroupFormSchema } from "@/schemas/zod-schemas";
import db from "@/lib/db";
import { getLoggedInUser, getUserById } from "./users";
import { getLastMessageById } from "./messages";

/* ==================== CONVERSATION ==================== */

export const createConversation = async ({
  isGroup,
  groupName,
}: {
  isGroup: boolean;
  groupName?: string;
}) => {
  try {
    const conversation = await db.conversation.create({
      data: {
        isGroup: isGroup,
        name: groupName,
      },
    });

    return conversation;
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

export const getConversations = async () => {
  // retrieve logged in user that's retrieving all conversations
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to retrieve all conversations!");

  // retrieve all the conversation memberships of the current user
  const conversationMemberships = await getConversationMembers(
    currentUser.id,
    "byMemberId"
  );
  if (!conversationMemberships)
    throw new Error("Conversation members not found!");

  // retrieve all individual conversations from the retrieved convo-memberships
  const conversations = await Promise.all(
    conversationMemberships.map(async (membership) => {
      const conversation = await db.conversation.findUnique({
        where: { id: membership.conversationId },
      });

      if (!conversation)
        throw new Error("Conversation members could not be found!");

      return conversation;
    })
  );

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // create an array of objects with details of all conversations and its convo-members
  const conversationWithDetail = await Promise.all(
    conversations.map(async (conversation, index) => {
      // retrieve ALL convo-members that are part of the same retrieved conversations as the current user
      const allConversationMemberships = await getConversationMembers(
        conversation.id,
        "byConversationId"
      );
      if (!allConversationMemberships)
        throw new Error("Conversation members could not be found!");

      // retrieve the last message sent of each conversation
      const lastMessageSent = await getLastMessageById(
        conversation.lastMessageId
      );

      // retrieve the last message seen from each convo-membership of current user
      const lastSeenMessage = conversationMemberships[index].lastSeenMessageId
        ? await db.message.findUnique({
            where: {
              id: conversationMemberships[index].lastSeenMessageId,
              conversationId: conversation.id,
            },
          })
        : null;
      // retrieve the creation time from each last seen message
      const lastSeenMessageTime = lastSeenMessage
        ? lastSeenMessage.createdAt
        : -1;
      // fetch all messages from the given conversation from db
      const messages = await db.message.findMany({
        where: { conversationId: conversation.id },
      });
      // filter out the unseen messages, that come from other convo member(s), after the last seen message
      const unseenMessages = messages
        .filter((message) => message.createdAt > lastSeenMessageTime)
        .filter((unseenMessage) => unseenMessage.senderId !== currentUser.id);

      if (conversation.isGroup) {
        // return information about the active group conversation of current user
        return {
          conversation,
          otherMemberDetails: undefined,
          lastMessageSent,
          unseenMessagesCount: unseenMessages.length,
        };
      } else {
        // filters out the current user from the retrieved convo-members
        const otherMembership = allConversationMemberships.filter(
          (membership) => membership.memberId !== currentUser.id
        )[0];

        // get the retrieved convo-member from the user table by 'memberId'
        const otherMemberDetails = await getUserById(otherMembership.memberId);
        if (!otherMemberDetails)
          throw new Error("Private conversation member could not be found!");

        // return information about the active private conversation of current user
        return {
          conversation,
          otherMemberDetails,
          lastMessageSent,
          unseenMessagesCount: unseenMessages.length,
        };
      }
    })
  );

  return conversationWithDetail;
};

export const getConversationById = async (conversationId: string) => {
  // retrieve logged in user that's retrieving the given conversation
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to retrieve your conversation!");

  // retrieve conversation from db by the given 'conversationId'
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new Error("Conversation not found");

  // retrieve the conversation membership of the current user
  const conversationMembership = await getUniqueConversationMember(
    currentUser.id,
    conversationId
  );
  if (!conversationMembership)
    throw new Error("You aren't a member of this conversation!");

  // retrieve ALL convo-members that are part of the same retrieved conversations as the current user
  const allConversationMemberships = await getConversationMembers(
    conversation.id,
    "byConversationId"
  );
  if (!allConversationMemberships)
    throw new Error("Conversation members could not be found!");

  if (!conversation.isGroup) {
    // filters out the current user from the retrieved private convo-members
    const otherMembership = allConversationMemberships.filter(
      (membership) => membership.memberId !== currentUser.id
    )[0];

    // get the retrieved convo-member from the user table by 'memberId'
    const otherMemberDetails = await getUserById(otherMembership.memberId);
    if (!otherMemberDetails)
      throw new Error("Private conversation member could not be found!");

    // return retrieved information about the active private convo of current user
    return {
      ...conversation,
      otherMember: {
        ...otherMemberDetails,
        lastSeenMessageId: otherMembership.lastSeenMessageId,
      },
      otherMembers: null,
    };
  } else {
    const otherMembers = await Promise.all(
      allConversationMemberships
        // filters out the current user from the retrieved group convo-members
        .filter((membership) => membership.memberId !== currentUser.id)
        // retrieves user information about each retrieved group convo-member
        .map(async (membership) => {
          const member = await getUserById(membership.memberId);
          if (!member) throw new Error("Group member could not be found");

          return {
            id: member.id,
            username: member.username,
            lastSeenMessageId: membership.lastSeenMessageId,
          };
        })
    );

    // return retrieved information about the active group convo of current user
    return { ...conversation, otherMembers, otherMember: null };
  }
};

export const createGroup = async (
  values: z.infer<typeof createGroupFormSchema>
) => {
  // retrieve logged in user that's creating a group convo with the selected friends
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to retrieve your friends!");

  // validate the form data again in the backend
  const validatedFields = createGroupFormSchema.safeParse(values);
  // throw error if form data is NOT valid
  if (!validatedFields.success) throw new Error("Invalid data!");

  // extract validated fields
  const { members, name } = validatedFields.data;

  // create a new group conversation
  const conversation = await createConversation({
    isGroup: true,
    groupName: name,
  });
  if (!conversation) throw new Error("Failed to create a group conversation!");

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // add the current user and the given friends ('members') to the created group conversation
  await Promise.all(
    [currentUser.id, ...members].map(async (memberId) => {
      // add current user and each given friend ('members') to the group conversation
      await addConversationMember(memberId, conversation.id);
    })
  );
};

export const deleteGroup = async (conversationId: string) => {
  // retrieve logged in user that's deleting the given group convo
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

  // get the messages of the given convo that you need to remove as well
  const messages = await db.message.findMany({
    where: { conversationId: conversationId },
  });

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

export const leaveGroup = async (conversationId: string) => {
  // retrieve logged in user that's removing the given friend
  const currentUser = await getLoggedInUser();
  if (!currentUser)
    throw new Error("You need to be logged in to remove a friend!");

  // find the conversation whose "id" matches the given "conversationId"
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new Error("Conversation not found!");

  // retrieve membership of the current user within the retrieved group convo
  const membership = await getUniqueConversationMember(
    currentUser.id,
    conversationId
  );
  if (!membership) throw new Error("You're not a member of this group!");

  // delete the current user's membership of the retrieved group conversation
  await db.conversationMember.delete({
    where: { id: membership.id },
  });
};

/* ==================== CONVERSATION MEMBERS ==================== */

export const addConversationMember = async (
  userId: string,
  conversationId: string
) => {
  try {
    await db.conversationMember.create({
      data: {
        memberId: userId,
        conversationId: conversationId,
      },
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
};

export const getConversationMembers = async (
  id: string,
  type: "byMemberId" | "byConversationId"
) => {
  try {
    if (!id || !type) {
      throw new Error("Cannot perform this action");
    }

    if (type === "byMemberId") {
      const conversationMemberships = await db.conversationMember.findMany({
        where: { memberId: id },
      });

      return conversationMemberships;
    }

    if (type === "byConversationId") {
      const conversationMemberships = await db.conversationMember.findMany({
        where: { conversationId: id },
      });

      return conversationMemberships;
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

export const getUniqueConversationMember = async (
  memberId: string,
  conversationId?: string
) => {
  try {
    if (!memberId) {
      throw new Error("Id is required");
    }

    if (conversationId) {
      const conversationMembership = await db.conversationMember.findFirst({
        where: {
          AND: [{ memberId: memberId }, { conversationId: conversationId }],
        },
      });

      return conversationMembership;
    } else {
      const conversationMembership = await db.conversationMember.findFirst({
        where: { memberId: memberId },
      });

      return conversationMembership;
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
