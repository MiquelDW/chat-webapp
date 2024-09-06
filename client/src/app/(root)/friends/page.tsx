"use client";

import { useAuth } from "@clerk/clerk-react";
import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { MutableRefObject, useEffect, useRef, useState } from "react";
// this hook is used for fetching and caching data from a server
// use this hook when you want to fetch data that is primarily read-only, such as getting a list of items, details of a single item, etc
import { useQuery } from "@tanstack/react-query";
import { getLoggedInUser } from "@/data/users";
import Request from "./_components/Request";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
// import useStateContext from "@/hooks/useStateContext";
import { Request as RequestType } from "@prisma/client";

type RequestDetailsType = {
  sender: {
    id: string;
    createdAt: Date;
    email: string;
    updatedAt: Date;
    imageUrl: string;
    username: string;
  };
  request: {
    id: string;
    receiverId: string;
    createdAt: Date;
    senderId: string;
  };
};

const FriendsPage = () => {
  // state variable keeps track of all requests sent to the current user
  const [requestsHistory, setRequestsHistory] = useState<RequestDetailsType[]>(
    []
  );
  let socketRef: MutableRefObject<Socket | null> = useRef(null);
  // retrieve the currently logged in user's id
  const { userId } = useAuth();

  // update request history
  const newRequestReceived = async (request: RequestType) => {
    const url = `http://localhost:8080`;
    console.log(`Received Response: ${request}`);

    // send HTTP GET request to the /requests/:id endpoint on the server
    const responseData = await fetch(`${url}/requests/${userId}`);
    // retireve response object and convert it to JSON format and then update state variable 'messageHistory'
    const response = await responseData.json();

    setRequestsHistory(response);
  };

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchRequests() {
      // send HTTP GET request to the /requests/:id endpoint on the server
      const responseData = await fetch(`${url}/requests/${userId}`);
      // retrieve response object and convert it to JSON format and then update state variable 'messageHistory'
      const response = await responseData.json();
      setRequestsHistory(response);
    }
    fetchRequests();

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
    socketRef.current.on("friend-request", newRequestReceived);

    return () => {
      // remove event listener for the "friend-request" event
      socketRef.current?.off("friend-request", newRequestReceived);
    };
  }, []);

  return (
    <>
      <ItemList title="Friends" Action={<AddFriendDialog />}>
        {requestsHistory === null || requestsHistory?.length === 0 ? (
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
            />
          ))
        )}
      </ItemList>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
