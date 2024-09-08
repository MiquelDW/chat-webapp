"use client";

import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { MutableRefObject, useEffect, useRef, useTransition } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import Request from "./_components/Request";
import useStateContext from "@/hooks/useStateContext";
import { getRequests } from "@/data/requests";
import { Loader2 } from "lucide-react";

const FriendsPage = () => {
  // 'isPending' keeps track of whether a transition is currently running
  const [isPending, startTransition] = useTransition();
  // state variable keeps track of all requests sent to the current user
  const { requestsHistory, setRequestsHistory } = useStateContext();
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  useEffect(() => {
    async function fetchRequests() {
      const requestsData = await getRequests();
      setRequestsHistory(requestsData);
    }

    // fetch all received friend requests of current user with loading state
    startTransition(() => {
      fetchRequests();
    });

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
  }, []);

  return (
    <>
      <ItemList
        title="Friends"
        Action={<AddFriendDialog socketRef={socketRef} />}
      >
        {isPending ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : requestsHistory === null || requestsHistory?.length === 0 ? (
          // friend requests doesn't exist
          <div className="flex h-full w-full items-center justify-center">
            No friend requests found
          </div>
        ) : (
          requestsHistory?.map(({ sender, request }) => (
            <Request
              key={request.id}
              reqId={request.id}
              imageUrl={sender.imageUrl}
              username={sender.username}
              email={sender.email}
              socketRef={socketRef}
            />
          ))
        )}
      </ItemList>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
