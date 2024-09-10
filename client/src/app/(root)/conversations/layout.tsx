"use client";

import ItemList from "@/components/ItemList";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupConversationItem from "./_components/GroupConversationItem";
import DMConversationItem from "./_components/DMConversationItem";
import {
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import useStateContext from "@/hooks/useStateContext";
import { Loader2 } from "lucide-react";
import { getLoggedInUser } from "@/data/users";
import { Conversation } from "@prisma/client";
import { getConversations } from "@/data/conversation";

// Layout Component that wraps around all routes inside folder 'conversations'
// it ensures a consistent layout for all routes within the folder 'conversations'
// this Layout component will be given to the 'Layout' component as a child (one level higher)
const ConversationsLayout = ({ children }: { children: React.ReactNode }) => {
  // 'isPending' keeps track of whether a transition is currently running
  const [isPending, startTransition] = useTransition();
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);
  // state variable keeps track of all active coversations of current user
  const { conversations, setConversations } = useStateContext();
  // state variable stores the current logged in user
  const [currentUser, setCurrentUser] =
    useState<Awaited<ReturnType<typeof getLoggedInUser>>>(undefined);

  useEffect(() => {
    // fetch current logged in user
    async function fetchLoggedInUser() {
      const loggedInUser = await getLoggedInUser();
      setCurrentUser(loggedInUser);
    }
    // fetch all active conversations of current user
    async function fetchAllConversations(newConversation?: Conversation) {
      if (newConversation) {
        console.log("New received conversation: ", newConversation);
      }

      const conversationsData = await getConversations();
      setConversations(conversationsData);
    }

    // run async functions in parallel with loading state
    startTransition(async () => {
      await Promise.all([fetchLoggedInUser(), fetchAllConversations()]);
    });

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
    // listens for given events and calls callback function after a event occured
    socketRef.current?.on("new-conversation", fetchAllConversations);
    socketRef.current?.on("updated-conversation", fetchAllConversations);
    socketRef.current?.on("updated-conversation-member", fetchAllConversations);

    return () => {
      // remove given event listener
      socketRef.current?.off("new-conversation", fetchAllConversations);
      socketRef.current?.off("updated-conversation", fetchAllConversations);
      socketRef.current?.off(
        "updated-conversation-member",
        fetchAllConversations
      );
    };
  }, []);

  return (
    <>
      <ItemList title="Conversations" Action={<CreateGroupDialog />}>
        {isPending ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : conversations === null || conversations?.length === 0 ? (
          // conversations doesn't exist
          <div className="flex h-full w-full items-center justify-center">
            Conversations not found
          </div>
        ) : (
          conversations.map(
            ({
              conversation,
              otherMemberDetails,
              lastMessageSent,
              unseenMessagesCount,
            }) => {
              return conversation.isGroup ? (
                <GroupConversationItem
                  key={conversation.id}
                  conversationId={conversation.id}
                  name={conversation.name || ""}
                  lastMessageSender={lastMessageSent?.sender}
                  lastMessageContent={lastMessageSent?.content}
                  currentUser={currentUser?.username}
                  unseenMessagesCount={unseenMessagesCount}
                />
              ) : (
                <DMConversationItem
                  key={conversation.id}
                  conversationId={conversation.id}
                  imageUrl={otherMemberDetails?.imageUrl || ""}
                  username={otherMemberDetails?.username || ""}
                  lastMessageSender={lastMessageSent?.sender}
                  lastMessageContent={lastMessageSent?.content}
                  currentUser={currentUser?.username}
                  unseenMessagesCount={unseenMessagesCount}
                />
              );
            }
          )
        )}
      </ItemList>

      {children}
    </>
  );
};

export default ConversationsLayout;
