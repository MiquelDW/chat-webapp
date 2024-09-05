"use client";

import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { MutableRefObject, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

const FriendsPage = () => {
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  useEffect(() => {
    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
  }, []);

  return (
    <>
      <ItemList title="Friends" Action={<AddFriendDialog />}>
        <p>Friend #1</p>
        <p>Friend #2</p>
      </ItemList>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
