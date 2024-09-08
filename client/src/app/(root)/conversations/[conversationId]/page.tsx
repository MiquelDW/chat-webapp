"use client";

import ConversationContainer from "@/components/conversation/ConversationContainer";
import Body from "./_components/Body";
import Header from "./_components/Header";
import { useEffect, useState, useTransition } from "react";
import { getConversationById } from "@/data/conversation";
import { Loader2 } from "lucide-react";

// predefine object structure for the given 'props' object
interface ConversationProps {
  // contains dynamic route parameter from the current URL (names must match!!)
  params: { conversationId: string };
}

const Conversation = ({ params: { conversationId } }: ConversationProps) => {
  // 'isPending' keeps track of whether a transition is currently running
  const [isPending, startTransition] = useTransition();

  // keeps track of the current conversation the user is on
  const [conversation, setConversation] =
    useState<Awaited<ReturnType<typeof getConversationById>>>();
  // state variables keep track of dialogs state within group & private convos
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] =
    useState<boolean>(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] =
    useState<boolean>(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] =
    useState<boolean>(false);
  // state variable keeps track of the type of call the current user makes
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);

  // group conversation options
  const groupOptions = [
    {
      label: "Leave group",
      destructive: false,
      onClick: () => setLeaveGroupDialogOpen(true),
    },
    {
      label: "Delete group",
      destructive: true,
      onClick: () => setDeleteGroupDialogOpen(true),
    },
  ];

  // private conversation options
  const privateOptions = [
    {
      label: "Remove friend",
      destructive: true,
      onClick: () => setRemoveFriendDialogOpen(true),
    },
  ];

  useEffect(() => {
    async function fetchConversationById() {
      const conversationByIdData = await getConversationById(conversationId);
      setConversation(conversationByIdData);
    }

    // fetch given conversation of current user with loading state
    startTransition(() => {
      fetchConversationById();
    });
  }, []);

  return isPending ? (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <p>Loading conversation...</p>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : conversation === null || conversation === undefined ? (
    // conversation doesn't exist
    <div className="flex h-full w-full items-center justify-center">
      Conversation not found
    </div>
  ) : (
    <ConversationContainer>
      {/* Header */}
      <Header
        name={
          conversation.isGroup
            ? conversation.name || ""
            : conversation.otherMember?.username || ""
        }
        imageUrl={
          conversation.isGroup
            ? undefined
            : conversation.otherMember?.imageUrl || ""
        }
      />

      {/* Chat messages and Chat input */}
      <Body
        otherMembers={
          // in either case, pass in an array of conversation member(s)
          conversation.isGroup
            ? conversation.otherMembers
              ? conversation.otherMembers
              : []
            : conversation.otherMember
            ? [conversation.otherMember]
            : []
        }
        conversationId={conversationId}
      />
    </ConversationContainer>
  );
};

export default Conversation;
