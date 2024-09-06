"use client";

import ItemList from "@/components/ItemList";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupConversationItem from "./_components/GroupConversationItem";
import DMConversationItem from "./_components/DMConversationItem";
import { MutableRefObject, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getConversations } from "@/data/conversation";
import { getSocket } from "@/lib/socket";

// Layout Component that wraps around all routes inside folder 'conversations'
// it ensures a consistent layout for all routes within the folder 'conversations'
// this Layout component will be given to the 'Layout' component as a child (one level higher)
const ConversationsLayout = ({ children }: { children: React.ReactNode }) => {
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  useEffect(() => {
    async function fetchAllConversations() {
      const conversationsData = await getConversations();
      // setRequestsHistory(requestsData);
    }
    fetchAllConversations();

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
  }, []);

  return (
    <>
      <ItemList title="Conversations" Action={<CreateGroupDialog />}>
        <GroupConversationItem
          conversationId="1"
          name="SMP"
          lastMessageSender={undefined}
          lastMessageContent={undefined}
          currentUser="miquel"
          unseenMessagesCount={undefined}
        />
        <DMConversationItem
          conversationId="2"
          imageUrl={undefined}
          username="Miquel123"
          lastMessageSender={undefined}
          lastMessageContent={undefined}
          currentUser="miquel"
          unseenMessagesCount={undefined}
        />
      </ItemList>

      {children}
    </>
  );
};

export default ConversationsLayout;
